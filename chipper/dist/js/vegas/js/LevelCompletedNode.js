// Copyright 2013-2024, University of Colorado Boulder
/**
 * This node is used to display a user's results when they complete a level.
 *
 * @author John Blanco
 * @author Chris Malley (PixelZoom, Inc.)
 */ import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Property from '../../axon/js/Property.js';
import optionize from '../../phet-core/js/optionize.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import PhetColorScheme from '../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { RichText, Text, VBox } from '../../scenery/js/imports.js';
import TextPushButton from '../../sun/js/buttons/TextPushButton.js';
import Panel from '../../sun/js/Panel.js';
import Tandem from '../../tandem/js/Tandem.js';
import GameTimer from './GameTimer.js';
import ScoreDisplayStars from './ScoreDisplayStars.js';
import vegas from './vegas.js';
import VegasStrings from './VegasStrings.js';
const DEFAULT_TITLE_FONT = new PhetFont({
    size: 28,
    weight: 'bold'
});
const DEFAULT_INFO_FONT = new PhetFont({
    size: 22,
    weight: 'bold'
});
const DEFAULT_BUTTON_FONT = new PhetFont(26);
let LevelCompletedNode = class LevelCompletedNode extends Panel {
    dispose() {
        this.disposeLevelCompletedNode();
        super.dispose();
    }
    /**
   * @param level - the game level that has been completed
   * @param score
   * @param perfectScore
   * @param numberOfStars
   * @param timerEnabled
   * @param elapsedTime (in seconds)
   * @param bestTimeAtThisLevel (in seconds), null indicates no best time
   * @param isNewBestTime
   * @param continueFunction - function to call when the user presses the 'Continue' button
   * @param providedOptions
   */ constructor(level, score, perfectScore, numberOfStars, timerEnabled, elapsedTime, bestTimeAtThisLevel, isNewBestTime, continueFunction, providedOptions){
        const options = optionize()({
            // SelfOptions
            levelVisible: true,
            ySpacing: 30,
            titleFont: DEFAULT_TITLE_FONT,
            infoFont: DEFAULT_INFO_FONT,
            buttonFont: DEFAULT_BUTTON_FONT,
            buttonFill: PhetColorScheme.BUTTON_YELLOW,
            starDiameter: 62,
            contentMaxWidth: null,
            // PanelOptions
            fill: 'rgb( 180, 205, 255 )',
            stroke: 'black',
            lineWidth: 2,
            cornerRadius: 35,
            xMargin: 20,
            yMargin: 20,
            tandem: Tandem.REQUIRED
        }, providedOptions);
        const vBoxChildren = [];
        // Title, which changes based on how the user did.
        const proportionCorrect = score / perfectScore;
        let titleTextStringProperty = VegasStrings.keepTryingStringProperty;
        if (proportionCorrect > 0.95) {
            titleTextStringProperty = VegasStrings.excellentStringProperty;
        } else if (proportionCorrect > 0.75) {
            titleTextStringProperty = VegasStrings.greatStringProperty;
        } else if (proportionCorrect >= 0.5) {
            titleTextStringProperty = VegasStrings.goodStringProperty;
        }
        const title = new Text(titleTextStringProperty, {
            font: options.titleFont,
            maxWidth: options.contentMaxWidth
        });
        vBoxChildren.push(title);
        // Progress indicator
        const scoreDisplayStars = new ScoreDisplayStars(new Property(score), {
            numberOfStars: numberOfStars,
            perfectScore: perfectScore,
            starNodeOptions: {
                starShapeOptions: {
                    innerRadius: options.starDiameter / 4,
                    outerRadius: options.starDiameter / 2
                }
            },
            maxWidth: options.contentMaxWidth
        });
        vBoxChildren.push(scoreDisplayStars);
        // Level (optional)
        if (options.levelVisible) {
            const levelStringProperty = new DerivedProperty([
                VegasStrings.label.levelStringProperty
            ], (pattern)=>StringUtils.format(pattern, level));
            vBoxChildren.push(new Text(levelStringProperty, {
                font: options.infoFont,
                maxWidth: options.contentMaxWidth
            }));
        }
        // Score
        const scoreStringProperty = new DerivedProperty([
            VegasStrings.label.score.maxStringProperty
        ], (pattern)=>StringUtils.format(pattern, score, perfectScore));
        vBoxChildren.push(new Text(scoreStringProperty, {
            font: options.infoFont,
            maxWidth: options.contentMaxWidth
        }));
        // Time (optional)
        if (timerEnabled) {
            // Time: MM:SS
            const elapsedTimeStringProperty = new DerivedProperty([
                VegasStrings.label.timeStringProperty,
                // used by GameTimer.formatTime
                VegasStrings.pattern['0hours']['1minutes']['2secondsStringProperty'],
                VegasStrings.pattern['0minutes']['1secondsStringProperty']
            ], (pattern)=>StringUtils.format(pattern, GameTimer.formatTime(elapsedTime)));
            let timeStringProperty;
            if (isNewBestTime) {
                // Time: MM:SS
                // (Your New Best!)
                timeStringProperty = new DerivedProperty([
                    elapsedTimeStringProperty,
                    VegasStrings.yourNewBestStringProperty
                ], (elapsedTime, yourNewBest)=>`${elapsedTime}<br>${yourNewBest}`);
            } else if (bestTimeAtThisLevel !== null) {
                // Time: MM:SS
                // (Your Best: MM:SS)
                timeStringProperty = new DerivedProperty([
                    elapsedTimeStringProperty,
                    VegasStrings.pattern['0yourBestStringProperty'],
                    // used by GameTimer.formatTime
                    VegasStrings.pattern['0hours']['1minutes']['2secondsStringProperty'],
                    VegasStrings.pattern['0minutes']['1secondsStringProperty']
                ], (elapsedTime, pattern)=>`${elapsedTime}<br>${StringUtils.format(pattern, GameTimer.formatTime(bestTimeAtThisLevel))}`);
            } else {
                // Time: MM:SS
                timeStringProperty = elapsedTimeStringProperty;
            }
            vBoxChildren.push(new RichText(timeStringProperty, {
                font: options.infoFont,
                align: 'center',
                maxWidth: options.contentMaxWidth
            }));
        }
        // Continue button
        const continueButton = new TextPushButton(VegasStrings.continueStringProperty, {
            listener: continueFunction,
            font: options.buttonFont,
            baseColor: options.buttonFill,
            tandem: options.tandem.createTandem('continueButton'),
            maxWidth: options.contentMaxWidth
        });
        vBoxChildren.push(continueButton);
        const content = new VBox({
            children: vBoxChildren,
            spacing: options.ySpacing
        });
        super(content, options);
        this.disposeLevelCompletedNode = ()=>{
            // All VBox children are linked to dynamic string Properties, so must be disposed.
            vBoxChildren.forEach((child)=>child.dispose());
        };
    }
};
export { LevelCompletedNode as default };
vegas.register('LevelCompletedNode', LevelCompletedNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL0xldmVsQ29tcGxldGVkTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBUaGlzIG5vZGUgaXMgdXNlZCB0byBkaXNwbGF5IGEgdXNlcidzIHJlc3VsdHMgd2hlbiB0aGV5IGNvbXBsZXRlIGEgbGV2ZWwuXG4gKlxuICogQGF1dGhvciBKb2huIEJsYW5jb1xuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcbmltcG9ydCBQaGV0Q29sb3JTY2hlbWUgZnJvbSAnLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRDb2xvclNjaGVtZS5qcyc7XG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcbmltcG9ydCB7IEZvbnQsIE5vZGUsIFJpY2hUZXh0LCBUQ29sb3IsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHsgUHVzaEJ1dHRvbkxpc3RlbmVyIH0gZnJvbSAnLi4vLi4vc3VuL2pzL2J1dHRvbnMvUHVzaEJ1dHRvbk1vZGVsLmpzJztcbmltcG9ydCBUZXh0UHVzaEJ1dHRvbiBmcm9tICcuLi8uLi9zdW4vanMvYnV0dG9ucy9UZXh0UHVzaEJ1dHRvbi5qcyc7XG5pbXBvcnQgUGFuZWwsIHsgUGFuZWxPcHRpb25zIH0gZnJvbSAnLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgR2FtZVRpbWVyIGZyb20gJy4vR2FtZVRpbWVyLmpzJztcbmltcG9ydCBTY29yZURpc3BsYXlTdGFycyBmcm9tICcuL1Njb3JlRGlzcGxheVN0YXJzLmpzJztcbmltcG9ydCB2ZWdhcyBmcm9tICcuL3ZlZ2FzLmpzJztcbmltcG9ydCBWZWdhc1N0cmluZ3MgZnJvbSAnLi9WZWdhc1N0cmluZ3MuanMnO1xuXG5jb25zdCBERUZBVUxUX1RJVExFX0ZPTlQgPSBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMjgsIHdlaWdodDogJ2JvbGQnIH0gKTtcbmNvbnN0IERFRkFVTFRfSU5GT19GT05UID0gbmV3IFBoZXRGb250KCB7IHNpemU6IDIyLCB3ZWlnaHQ6ICdib2xkJyB9ICk7XG5jb25zdCBERUZBVUxUX0JVVFRPTl9GT05UID0gbmV3IFBoZXRGb250KCAyNiApO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICBsZXZlbFZpc2libGU/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGRpc3BsYXkgdGhlIGxldmVsIG51bWJlclxuICB5U3BhY2luZz86IG51bWJlcjtcbiAgdGl0bGVGb250PzogRm9udDtcbiAgaW5mb0ZvbnQ/OiBGb250O1xuICBidXR0b25Gb250PzogRm9udDtcbiAgYnV0dG9uRmlsbD86IFRDb2xvcjtcbiAgc3RhckRpYW1ldGVyPzogbnVtYmVyO1xuICBjb250ZW50TWF4V2lkdGg/OiBudW1iZXIgfCBudWxsOyAvLyBhcHBsaWVkIGFzIG1heFdpZHRoIHRvIGV2ZXJ5IHN1YmNvbXBvbmVudCBpbmRpdmlkdWFsbHksIG5vdCBQYW5lbCdzIGNvbnRlbnRcbn07XG5cbmV4cG9ydCB0eXBlIExldmVsQ29tcGxldGVkTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBhbmVsT3B0aW9ucztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGV2ZWxDb21wbGV0ZWROb2RlIGV4dGVuZHMgUGFuZWwge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUxldmVsQ29tcGxldGVkTm9kZTogKCkgPT4gdm9pZDtcblxuICAvKipcbiAgICogQHBhcmFtIGxldmVsIC0gdGhlIGdhbWUgbGV2ZWwgdGhhdCBoYXMgYmVlbiBjb21wbGV0ZWRcbiAgICogQHBhcmFtIHNjb3JlXG4gICAqIEBwYXJhbSBwZXJmZWN0U2NvcmVcbiAgICogQHBhcmFtIG51bWJlck9mU3RhcnNcbiAgICogQHBhcmFtIHRpbWVyRW5hYmxlZFxuICAgKiBAcGFyYW0gZWxhcHNlZFRpbWUgKGluIHNlY29uZHMpXG4gICAqIEBwYXJhbSBiZXN0VGltZUF0VGhpc0xldmVsIChpbiBzZWNvbmRzKSwgbnVsbCBpbmRpY2F0ZXMgbm8gYmVzdCB0aW1lXG4gICAqIEBwYXJhbSBpc05ld0Jlc3RUaW1lXG4gICAqIEBwYXJhbSBjb250aW51ZUZ1bmN0aW9uIC0gZnVuY3Rpb24gdG8gY2FsbCB3aGVuIHRoZSB1c2VyIHByZXNzZXMgdGhlICdDb250aW51ZScgYnV0dG9uXG4gICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnNcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbGV2ZWw6IG51bWJlciwgc2NvcmU6IG51bWJlciwgcGVyZmVjdFNjb3JlOiBudW1iZXIsIG51bWJlck9mU3RhcnM6IG51bWJlciwgdGltZXJFbmFibGVkOiBib29sZWFuLFxuICAgICAgICAgICAgICAgICAgICAgIGVsYXBzZWRUaW1lOiBudW1iZXIsIGJlc3RUaW1lQXRUaGlzTGV2ZWw6IG51bWJlciB8IG51bGwsIGlzTmV3QmVzdFRpbWU6IGJvb2xlYW4sXG4gICAgICAgICAgICAgICAgICAgICAgY29udGludWVGdW5jdGlvbjogUHVzaEJ1dHRvbkxpc3RlbmVyLCBwcm92aWRlZE9wdGlvbnM/OiBMZXZlbENvbXBsZXRlZE5vZGVPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxMZXZlbENvbXBsZXRlZE5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgUGFuZWxPcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIFNlbGZPcHRpb25zXG4gICAgICBsZXZlbFZpc2libGU6IHRydWUsXG4gICAgICB5U3BhY2luZzogMzAsXG4gICAgICB0aXRsZUZvbnQ6IERFRkFVTFRfVElUTEVfRk9OVCxcbiAgICAgIGluZm9Gb250OiBERUZBVUxUX0lORk9fRk9OVCxcbiAgICAgIGJ1dHRvbkZvbnQ6IERFRkFVTFRfQlVUVE9OX0ZPTlQsXG4gICAgICBidXR0b25GaWxsOiBQaGV0Q29sb3JTY2hlbWUuQlVUVE9OX1lFTExPVyxcbiAgICAgIHN0YXJEaWFtZXRlcjogNjIsXG4gICAgICBjb250ZW50TWF4V2lkdGg6IG51bGwsXG5cbiAgICAgIC8vIFBhbmVsT3B0aW9uc1xuICAgICAgZmlsbDogJ3JnYiggMTgwLCAyMDUsIDI1NSApJyxcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcbiAgICAgIGxpbmVXaWR0aDogMixcbiAgICAgIGNvcm5lclJhZGl1czogMzUsXG4gICAgICB4TWFyZ2luOiAyMCxcbiAgICAgIHlNYXJnaW46IDIwLFxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGNvbnN0IHZCb3hDaGlsZHJlbjogTm9kZVtdID0gW107XG5cbiAgICAvLyBUaXRsZSwgd2hpY2ggY2hhbmdlcyBiYXNlZCBvbiBob3cgdGhlIHVzZXIgZGlkLlxuICAgIGNvbnN0IHByb3BvcnRpb25Db3JyZWN0ID0gc2NvcmUgLyBwZXJmZWN0U2NvcmU7XG4gICAgbGV0IHRpdGxlVGV4dFN0cmluZ1Byb3BlcnR5ID0gVmVnYXNTdHJpbmdzLmtlZXBUcnlpbmdTdHJpbmdQcm9wZXJ0eTtcbiAgICBpZiAoIHByb3BvcnRpb25Db3JyZWN0ID4gMC45NSApIHtcbiAgICAgIHRpdGxlVGV4dFN0cmluZ1Byb3BlcnR5ID0gVmVnYXNTdHJpbmdzLmV4Y2VsbGVudFN0cmluZ1Byb3BlcnR5O1xuICAgIH1cbiAgICBlbHNlIGlmICggcHJvcG9ydGlvbkNvcnJlY3QgPiAwLjc1ICkge1xuICAgICAgdGl0bGVUZXh0U3RyaW5nUHJvcGVydHkgPSBWZWdhc1N0cmluZ3MuZ3JlYXRTdHJpbmdQcm9wZXJ0eTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHByb3BvcnRpb25Db3JyZWN0ID49IDAuNSApIHtcbiAgICAgIHRpdGxlVGV4dFN0cmluZ1Byb3BlcnR5ID0gVmVnYXNTdHJpbmdzLmdvb2RTdHJpbmdQcm9wZXJ0eTtcbiAgICB9XG4gICAgY29uc3QgdGl0bGUgPSBuZXcgVGV4dCggdGl0bGVUZXh0U3RyaW5nUHJvcGVydHksIHtcbiAgICAgIGZvbnQ6IG9wdGlvbnMudGl0bGVGb250LFxuICAgICAgbWF4V2lkdGg6IG9wdGlvbnMuY29udGVudE1heFdpZHRoXG4gICAgfSApO1xuICAgIHZCb3hDaGlsZHJlbi5wdXNoKCB0aXRsZSApO1xuXG4gICAgLy8gUHJvZ3Jlc3MgaW5kaWNhdG9yXG4gICAgY29uc3Qgc2NvcmVEaXNwbGF5U3RhcnMgPSBuZXcgU2NvcmVEaXNwbGF5U3RhcnMoIG5ldyBQcm9wZXJ0eSggc2NvcmUgKSwge1xuICAgICAgbnVtYmVyT2ZTdGFyczogbnVtYmVyT2ZTdGFycyxcbiAgICAgIHBlcmZlY3RTY29yZTogcGVyZmVjdFNjb3JlLFxuICAgICAgc3Rhck5vZGVPcHRpb25zOiB7XG4gICAgICAgIHN0YXJTaGFwZU9wdGlvbnM6IHtcbiAgICAgICAgICBpbm5lclJhZGl1czogb3B0aW9ucy5zdGFyRGlhbWV0ZXIgLyA0LFxuICAgICAgICAgIG91dGVyUmFkaXVzOiBvcHRpb25zLnN0YXJEaWFtZXRlciAvIDJcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG1heFdpZHRoOiBvcHRpb25zLmNvbnRlbnRNYXhXaWR0aFxuICAgIH0gKTtcbiAgICB2Qm94Q2hpbGRyZW4ucHVzaCggc2NvcmVEaXNwbGF5U3RhcnMgKTtcblxuICAgIC8vIExldmVsIChvcHRpb25hbClcbiAgICBpZiAoIG9wdGlvbnMubGV2ZWxWaXNpYmxlICkge1xuXG4gICAgICBjb25zdCBsZXZlbFN0cmluZ1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcbiAgICAgICAgWyBWZWdhc1N0cmluZ3MubGFiZWwubGV2ZWxTdHJpbmdQcm9wZXJ0eSBdLFxuICAgICAgICBwYXR0ZXJuID0+IFN0cmluZ1V0aWxzLmZvcm1hdCggcGF0dGVybiwgbGV2ZWwgKVxuICAgICAgKTtcblxuICAgICAgdkJveENoaWxkcmVuLnB1c2goIG5ldyBUZXh0KCBsZXZlbFN0cmluZ1Byb3BlcnR5LCB7XG4gICAgICAgIGZvbnQ6IG9wdGlvbnMuaW5mb0ZvbnQsXG4gICAgICAgIG1heFdpZHRoOiBvcHRpb25zLmNvbnRlbnRNYXhXaWR0aFxuICAgICAgfSApICk7XG4gICAgfVxuXG4gICAgLy8gU2NvcmVcbiAgICBjb25zdCBzY29yZVN0cmluZ1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcbiAgICAgIFsgVmVnYXNTdHJpbmdzLmxhYmVsLnNjb3JlLm1heFN0cmluZ1Byb3BlcnR5IF0sXG4gICAgICBwYXR0ZXJuID0+IFN0cmluZ1V0aWxzLmZvcm1hdCggcGF0dGVybiwgc2NvcmUsIHBlcmZlY3RTY29yZSApXG4gICAgKTtcbiAgICB2Qm94Q2hpbGRyZW4ucHVzaCggbmV3IFRleHQoIHNjb3JlU3RyaW5nUHJvcGVydHksIHtcbiAgICAgIGZvbnQ6IG9wdGlvbnMuaW5mb0ZvbnQsXG4gICAgICBtYXhXaWR0aDogb3B0aW9ucy5jb250ZW50TWF4V2lkdGhcbiAgICB9ICkgKTtcblxuICAgIC8vIFRpbWUgKG9wdGlvbmFsKVxuICAgIGlmICggdGltZXJFbmFibGVkICkge1xuXG4gICAgICAvLyBUaW1lOiBNTTpTU1xuICAgICAgY29uc3QgZWxhcHNlZFRpbWVTdHJpbmdQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFtcbiAgICAgICAgICBWZWdhc1N0cmluZ3MubGFiZWwudGltZVN0cmluZ1Byb3BlcnR5LFxuXG4gICAgICAgICAgLy8gdXNlZCBieSBHYW1lVGltZXIuZm9ybWF0VGltZVxuICAgICAgICAgIFZlZ2FzU3RyaW5ncy5wYXR0ZXJuWyAnMGhvdXJzJyBdWyAnMW1pbnV0ZXMnIF1bICcyc2Vjb25kc1N0cmluZ1Byb3BlcnR5JyBdLFxuICAgICAgICAgIFZlZ2FzU3RyaW5ncy5wYXR0ZXJuWyAnMG1pbnV0ZXMnIF1bICcxc2Vjb25kc1N0cmluZ1Byb3BlcnR5JyBdXG4gICAgICAgIF0sXG4gICAgICAgIHBhdHRlcm4gPT4gU3RyaW5nVXRpbHMuZm9ybWF0KCBwYXR0ZXJuLCBHYW1lVGltZXIuZm9ybWF0VGltZSggZWxhcHNlZFRpbWUgKSApXG4gICAgICApO1xuXG4gICAgICBsZXQgdGltZVN0cmluZ1Byb3BlcnR5O1xuICAgICAgaWYgKCBpc05ld0Jlc3RUaW1lICkge1xuXG4gICAgICAgIC8vIFRpbWU6IE1NOlNTXG4gICAgICAgIC8vIChZb3VyIE5ldyBCZXN0ISlcbiAgICAgICAgdGltZVN0cmluZ1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcbiAgICAgICAgICBbIGVsYXBzZWRUaW1lU3RyaW5nUHJvcGVydHksIFZlZ2FzU3RyaW5ncy55b3VyTmV3QmVzdFN0cmluZ1Byb3BlcnR5IF0sXG4gICAgICAgICAgKCBlbGFwc2VkVGltZTogc3RyaW5nLCB5b3VyTmV3QmVzdDogc3RyaW5nICkgPT4gYCR7ZWxhcHNlZFRpbWV9PGJyPiR7eW91ck5ld0Jlc3R9YFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIGJlc3RUaW1lQXRUaGlzTGV2ZWwgIT09IG51bGwgKSB7XG5cbiAgICAgICAgLy8gVGltZTogTU06U1NcbiAgICAgICAgLy8gKFlvdXIgQmVzdDogTU06U1MpXG4gICAgICAgIHRpbWVTdHJpbmdQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXG4gICAgICAgICAgWyBlbGFwc2VkVGltZVN0cmluZ1Byb3BlcnR5LFxuICAgICAgICAgICAgVmVnYXNTdHJpbmdzLnBhdHRlcm5bICcweW91ckJlc3RTdHJpbmdQcm9wZXJ0eScgXSxcblxuICAgICAgICAgICAgLy8gdXNlZCBieSBHYW1lVGltZXIuZm9ybWF0VGltZVxuICAgICAgICAgICAgVmVnYXNTdHJpbmdzLnBhdHRlcm5bICcwaG91cnMnIF1bICcxbWludXRlcycgXVsgJzJzZWNvbmRzU3RyaW5nUHJvcGVydHknIF0sXG4gICAgICAgICAgICBWZWdhc1N0cmluZ3MucGF0dGVyblsgJzBtaW51dGVzJyBdWyAnMXNlY29uZHNTdHJpbmdQcm9wZXJ0eScgXVxuICAgICAgICAgIF0sXG4gICAgICAgICAgKCBlbGFwc2VkVGltZTogc3RyaW5nLCBwYXR0ZXJuOiBzdHJpbmcgKSA9PlxuICAgICAgICAgICAgYCR7ZWxhcHNlZFRpbWV9PGJyPiR7U3RyaW5nVXRpbHMuZm9ybWF0KCBwYXR0ZXJuLCBHYW1lVGltZXIuZm9ybWF0VGltZSggYmVzdFRpbWVBdFRoaXNMZXZlbCApICl9YFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG5cbiAgICAgICAgLy8gVGltZTogTU06U1NcbiAgICAgICAgdGltZVN0cmluZ1Byb3BlcnR5ID0gZWxhcHNlZFRpbWVTdHJpbmdQcm9wZXJ0eTtcbiAgICAgIH1cblxuICAgICAgdkJveENoaWxkcmVuLnB1c2goIG5ldyBSaWNoVGV4dCggdGltZVN0cmluZ1Byb3BlcnR5LCB7XG4gICAgICAgIGZvbnQ6IG9wdGlvbnMuaW5mb0ZvbnQsXG4gICAgICAgIGFsaWduOiAnY2VudGVyJyxcbiAgICAgICAgbWF4V2lkdGg6IG9wdGlvbnMuY29udGVudE1heFdpZHRoXG4gICAgICB9ICkgKTtcbiAgICB9XG5cbiAgICAvLyBDb250aW51ZSBidXR0b25cbiAgICBjb25zdCBjb250aW51ZUJ1dHRvbiA9IG5ldyBUZXh0UHVzaEJ1dHRvbiggVmVnYXNTdHJpbmdzLmNvbnRpbnVlU3RyaW5nUHJvcGVydHksIHtcbiAgICAgIGxpc3RlbmVyOiBjb250aW51ZUZ1bmN0aW9uLFxuICAgICAgZm9udDogb3B0aW9ucy5idXR0b25Gb250LFxuICAgICAgYmFzZUNvbG9yOiBvcHRpb25zLmJ1dHRvbkZpbGwsXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NvbnRpbnVlQnV0dG9uJyApLFxuICAgICAgbWF4V2lkdGg6IG9wdGlvbnMuY29udGVudE1heFdpZHRoXG4gICAgfSApO1xuICAgIHZCb3hDaGlsZHJlbi5wdXNoKCBjb250aW51ZUJ1dHRvbiApO1xuXG4gICAgY29uc3QgY29udGVudCA9IG5ldyBWQm94KCB7XG4gICAgICBjaGlsZHJlbjogdkJveENoaWxkcmVuLFxuICAgICAgc3BhY2luZzogb3B0aW9ucy55U3BhY2luZ1xuICAgIH0gKTtcblxuICAgIHN1cGVyKCBjb250ZW50LCBvcHRpb25zICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VMZXZlbENvbXBsZXRlZE5vZGUgPSAoKSA9PiB7XG5cbiAgICAgIC8vIEFsbCBWQm94IGNoaWxkcmVuIGFyZSBsaW5rZWQgdG8gZHluYW1pYyBzdHJpbmcgUHJvcGVydGllcywgc28gbXVzdCBiZSBkaXNwb3NlZC5cbiAgICAgIHZCb3hDaGlsZHJlbi5mb3JFYWNoKCBjaGlsZCA9PiBjaGlsZC5kaXNwb3NlKCkgKTtcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlTGV2ZWxDb21wbGV0ZWROb2RlKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnZlZ2FzLnJlZ2lzdGVyKCAnTGV2ZWxDb21wbGV0ZWROb2RlJywgTGV2ZWxDb21wbGV0ZWROb2RlICk7Il0sIm5hbWVzIjpbIkRlcml2ZWRQcm9wZXJ0eSIsIlByb3BlcnR5Iiwib3B0aW9uaXplIiwiU3RyaW5nVXRpbHMiLCJQaGV0Q29sb3JTY2hlbWUiLCJQaGV0Rm9udCIsIlJpY2hUZXh0IiwiVGV4dCIsIlZCb3giLCJUZXh0UHVzaEJ1dHRvbiIsIlBhbmVsIiwiVGFuZGVtIiwiR2FtZVRpbWVyIiwiU2NvcmVEaXNwbGF5U3RhcnMiLCJ2ZWdhcyIsIlZlZ2FzU3RyaW5ncyIsIkRFRkFVTFRfVElUTEVfRk9OVCIsInNpemUiLCJ3ZWlnaHQiLCJERUZBVUxUX0lORk9fRk9OVCIsIkRFRkFVTFRfQlVUVE9OX0ZPTlQiLCJMZXZlbENvbXBsZXRlZE5vZGUiLCJkaXNwb3NlIiwiZGlzcG9zZUxldmVsQ29tcGxldGVkTm9kZSIsImxldmVsIiwic2NvcmUiLCJwZXJmZWN0U2NvcmUiLCJudW1iZXJPZlN0YXJzIiwidGltZXJFbmFibGVkIiwiZWxhcHNlZFRpbWUiLCJiZXN0VGltZUF0VGhpc0xldmVsIiwiaXNOZXdCZXN0VGltZSIsImNvbnRpbnVlRnVuY3Rpb24iLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwibGV2ZWxWaXNpYmxlIiwieVNwYWNpbmciLCJ0aXRsZUZvbnQiLCJpbmZvRm9udCIsImJ1dHRvbkZvbnQiLCJidXR0b25GaWxsIiwiQlVUVE9OX1lFTExPVyIsInN0YXJEaWFtZXRlciIsImNvbnRlbnRNYXhXaWR0aCIsImZpbGwiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJjb3JuZXJSYWRpdXMiLCJ4TWFyZ2luIiwieU1hcmdpbiIsInRhbmRlbSIsIlJFUVVJUkVEIiwidkJveENoaWxkcmVuIiwicHJvcG9ydGlvbkNvcnJlY3QiLCJ0aXRsZVRleHRTdHJpbmdQcm9wZXJ0eSIsImtlZXBUcnlpbmdTdHJpbmdQcm9wZXJ0eSIsImV4Y2VsbGVudFN0cmluZ1Byb3BlcnR5IiwiZ3JlYXRTdHJpbmdQcm9wZXJ0eSIsImdvb2RTdHJpbmdQcm9wZXJ0eSIsInRpdGxlIiwiZm9udCIsIm1heFdpZHRoIiwicHVzaCIsInNjb3JlRGlzcGxheVN0YXJzIiwic3Rhck5vZGVPcHRpb25zIiwic3RhclNoYXBlT3B0aW9ucyIsImlubmVyUmFkaXVzIiwib3V0ZXJSYWRpdXMiLCJsZXZlbFN0cmluZ1Byb3BlcnR5IiwibGFiZWwiLCJwYXR0ZXJuIiwiZm9ybWF0Iiwic2NvcmVTdHJpbmdQcm9wZXJ0eSIsIm1heFN0cmluZ1Byb3BlcnR5IiwiZWxhcHNlZFRpbWVTdHJpbmdQcm9wZXJ0eSIsInRpbWVTdHJpbmdQcm9wZXJ0eSIsImZvcm1hdFRpbWUiLCJ5b3VyTmV3QmVzdFN0cmluZ1Byb3BlcnR5IiwieW91ck5ld0Jlc3QiLCJhbGlnbiIsImNvbnRpbnVlQnV0dG9uIiwiY29udGludWVTdHJpbmdQcm9wZXJ0eSIsImxpc3RlbmVyIiwiYmFzZUNvbG9yIiwiY3JlYXRlVGFuZGVtIiwiY29udGVudCIsImNoaWxkcmVuIiwic3BhY2luZyIsImZvckVhY2giLCJjaGlsZCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxxQkFBcUIsbUNBQW1DO0FBQy9ELE9BQU9DLGNBQWMsNEJBQTRCO0FBQ2pELE9BQU9DLGVBQWUsa0NBQWtDO0FBQ3hELE9BQU9DLGlCQUFpQiwwQ0FBMEM7QUFDbEUsT0FBT0MscUJBQXFCLDJDQUEyQztBQUN2RSxPQUFPQyxjQUFjLG9DQUFvQztBQUN6RCxTQUFxQkMsUUFBUSxFQUFVQyxJQUFJLEVBQUVDLElBQUksUUFBUSw4QkFBOEI7QUFFdkYsT0FBT0Msb0JBQW9CLHlDQUF5QztBQUNwRSxPQUFPQyxXQUE2Qix3QkFBd0I7QUFDNUQsT0FBT0MsWUFBWSw0QkFBNEI7QUFDL0MsT0FBT0MsZUFBZSxpQkFBaUI7QUFDdkMsT0FBT0MsdUJBQXVCLHlCQUF5QjtBQUN2RCxPQUFPQyxXQUFXLGFBQWE7QUFDL0IsT0FBT0Msa0JBQWtCLG9CQUFvQjtBQUU3QyxNQUFNQyxxQkFBcUIsSUFBSVgsU0FBVTtJQUFFWSxNQUFNO0lBQUlDLFFBQVE7QUFBTztBQUNwRSxNQUFNQyxvQkFBb0IsSUFBSWQsU0FBVTtJQUFFWSxNQUFNO0lBQUlDLFFBQVE7QUFBTztBQUNuRSxNQUFNRSxzQkFBc0IsSUFBSWYsU0FBVTtB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