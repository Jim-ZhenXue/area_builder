// Copyright 2018-2022, University of Colorado Boulder
/**
 * Demonstrates UI components that typically appear in a game level that has a finite number of challenges.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */ import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { HBox, Text, VBox } from '../../../scenery/js/imports.js';
import RectangularPushButton from '../../../sun/js/buttons/RectangularPushButton.js';
import Checkbox from '../../../sun/js/Checkbox.js';
import HSlider from '../../../sun/js/HSlider.js';
import Tandem from '../../../tandem/js/Tandem.js';
import FiniteStatusBar from '../FiniteStatusBar.js';
import LevelCompletedNode from '../LevelCompletedNode.js';
import vegas from '../vegas.js';
// constants
const PERFECT_SCORE = 10;
const NUMBER_OF_CHALLENGES = 10;
const DEFAULT_FONT = new PhetFont(20);
let FiniteChallengesScreenView = class FiniteChallengesScreenView extends ScreenView {
    constructor(){
        super({
            tandem: Tandem.OPT_OUT
        });
        // 1-based
        const levelProperty = new NumberProperty(1, {
            numberType: 'Integer',
            range: new Range(1, 5)
        });
        const challengeIndexProperty = new NumberProperty(0, {
            numberType: 'Integer',
            range: new Range(0, NUMBER_OF_CHALLENGES - 1)
        });
        const numberOfChallengesProperty = new NumberProperty(NUMBER_OF_CHALLENGES, {
            numberType: 'Integer',
            range: new Range(1, NUMBER_OF_CHALLENGES)
        });
        const scoreProperty = new NumberProperty(0, {
            numberType: 'Integer',
            range: new Range(0, PERFECT_SCORE)
        });
        const elapsedTimeProperty = new NumberProperty(0, {
            range: new Range(0, 1000)
        });
        const timerEnabledProperty = new BooleanProperty(true);
        // status bar across the top
        const statusBar = new FiniteStatusBar(this.layoutBounds, this.visibleBoundsProperty, scoreProperty, {
            barFill: 'pink',
            font: new PhetFont(20),
            levelProperty: levelProperty,
            challengeIndexProperty: challengeIndexProperty,
            numberOfChallengesProperty: numberOfChallengesProperty,
            elapsedTimeProperty: elapsedTimeProperty,
            timerEnabledProperty: timerEnabledProperty,
            startOverButtonOptions: {
                listener: ()=>{
                    console.log('Start Over');
                }
            }
        });
        // Controls for changing Properties
        const levelSlider = new HBox({
            children: [
                new Text('Level: ', {
                    font: DEFAULT_FONT
                }),
                new HSlider(levelProperty, levelProperty.range, {
                    constrainValue: (value)=>Utils.roundSymmetric(value)
                })
            ]
        });
        const challengeIndexSlider = new HBox({
            children: [
                new Text('Challenge: ', {
                    font: DEFAULT_FONT
                }),
                new HSlider(challengeIndexProperty, challengeIndexProperty.range, {
                    constrainValue: (value)=>Utils.roundSymmetric(value)
                })
            ]
        });
        const numberOfChallengesSlider = new HBox({
            children: [
                new Text('Number of challenges: ', {
                    font: DEFAULT_FONT
                }),
                new HSlider(numberOfChallengesProperty, numberOfChallengesProperty.range, {
                    constrainValue: (value)=>Utils.roundSymmetric(value)
                })
            ]
        });
        const scoreSlider = new HBox({
            children: [
                new Text('Score: ', {
                    font: DEFAULT_FONT
                }),
                new HSlider(scoreProperty, scoreProperty.range, {
                    constrainValue: (value)=>Utils.roundSymmetric(value)
                })
            ]
        });
        const elapsedTimeSlider = new HBox({
            children: [
                new Text('Elapsed time: ', {
                    font: DEFAULT_FONT
                }),
                new HSlider(elapsedTimeProperty, elapsedTimeProperty.range, {
                    constrainValue: (value)=>Utils.roundSymmetric(value)
                })
            ]
        });
        const timerEnabledCheckbox = new Checkbox(timerEnabledProperty, new Text('Timer enabled', {
            font: DEFAULT_FONT
        }));
        const levelCompletedNode = new LevelCompletedNode(levelProperty.get(), scoreProperty.value, PERFECT_SCORE, 4, true, 77, 74, true, ()=>{
            levelCompletedNode.visible = false;
        }, {
            center: this.layoutBounds.center,
            visible: false
        });
        // button to show LevelCompletedNode
        const levelCompletedButton = new RectangularPushButton({
            content: new Text('show LevelCompletedNode', {
                font: new PhetFont(20)
            }),
            centerX: this.layoutBounds.centerX,
            bottom: this.layoutBounds.bottom - 20,
            enabledProperty: new DerivedProperty([
                levelCompletedNode.visibleProperty
            ], (visible)=>!visible),
            listener: ()=>{
                levelCompletedNode.visible = true;
            }
        });
        // Lay out all controls
        const controls = new VBox({
            align: 'right',
            spacing: 25,
            center: this.layoutBounds.center,
            children: [
                levelSlider,
                challengeIndexSlider,
                numberOfChallengesSlider,
                scoreSlider,
                elapsedTimeSlider,
                timerEnabledCheckbox,
                levelCompletedButton
            ]
        });
        this.children = [
            statusBar,
            controls,
            levelCompletedNode
        ];
    }
};
export { FiniteChallengesScreenView as default };
vegas.register('FiniteChallengesScreenView', FiniteChallengesScreenView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL2RlbW8vRmluaXRlQ2hhbGxlbmdlc1NjcmVlblZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVtb25zdHJhdGVzIFVJIGNvbXBvbmVudHMgdGhhdCB0eXBpY2FsbHkgYXBwZWFyIGluIGEgZ2FtZSBsZXZlbCB0aGF0IGhhcyBhIGZpbml0ZSBudW1iZXIgb2YgY2hhbGxlbmdlcy5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgeyBIQm94LCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBSZWN0YW5ndWxhclB1c2hCdXR0b24gZnJvbSAnLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJQdXNoQnV0dG9uLmpzJztcbmltcG9ydCBDaGVja2JveCBmcm9tICcuLi8uLi8uLi9zdW4vanMvQ2hlY2tib3guanMnO1xuaW1wb3J0IEhTbGlkZXIgZnJvbSAnLi4vLi4vLi4vc3VuL2pzL0hTbGlkZXIuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBGaW5pdGVTdGF0dXNCYXIgZnJvbSAnLi4vRmluaXRlU3RhdHVzQmFyLmpzJztcbmltcG9ydCBMZXZlbENvbXBsZXRlZE5vZGUgZnJvbSAnLi4vTGV2ZWxDb21wbGV0ZWROb2RlLmpzJztcbmltcG9ydCB2ZWdhcyBmcm9tICcuLi92ZWdhcy5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgUEVSRkVDVF9TQ09SRSA9IDEwO1xuY29uc3QgTlVNQkVSX09GX0NIQUxMRU5HRVMgPSAxMDtcbmNvbnN0IERFRkFVTFRfRk9OVCA9IG5ldyBQaGV0Rm9udCggMjAgKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmluaXRlQ2hhbGxlbmdlc1NjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG5cbiAgICBzdXBlcigge1xuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxuICAgIH0gKTtcblxuICAgIC8vIDEtYmFzZWRcbiAgICBjb25zdCBsZXZlbFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAxLCB7XG4gICAgICBudW1iZXJUeXBlOiAnSW50ZWdlcicsXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAxLCA1IClcbiAgICB9ICk7XG4gICAgY29uc3QgY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xuICAgICAgbnVtYmVyVHlwZTogJ0ludGVnZXInLFxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgTlVNQkVSX09GX0NIQUxMRU5HRVMgLSAxIClcbiAgICB9ICk7XG4gICAgY29uc3QgbnVtYmVyT2ZDaGFsbGVuZ2VzUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIE5VTUJFUl9PRl9DSEFMTEVOR0VTLCB7XG4gICAgICBudW1iZXJUeXBlOiAnSW50ZWdlcicsXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAxLCBOVU1CRVJfT0ZfQ0hBTExFTkdFUyApXG4gICAgfSApO1xuICAgIGNvbnN0IHNjb3JlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcbiAgICAgIG51bWJlclR5cGU6ICdJbnRlZ2VyJyxcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIFBFUkZFQ1RfU0NPUkUgKVxuICAgIH0gKTtcbiAgICBjb25zdCBlbGFwc2VkVGltZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAwLCAxMDAwIClcbiAgICB9ICk7XG4gICAgY29uc3QgdGltZXJFbmFibGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICk7XG5cbiAgICAvLyBzdGF0dXMgYmFyIGFjcm9zcyB0aGUgdG9wXG4gICAgY29uc3Qgc3RhdHVzQmFyID0gbmV3IEZpbml0ZVN0YXR1c0JhciggdGhpcy5sYXlvdXRCb3VuZHMsIHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LCBzY29yZVByb3BlcnR5LCB7XG4gICAgICBiYXJGaWxsOiAncGluaycsXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDIwICksXG4gICAgICBsZXZlbFByb3BlcnR5OiBsZXZlbFByb3BlcnR5LFxuICAgICAgY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eTogY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eSxcbiAgICAgIG51bWJlck9mQ2hhbGxlbmdlc1Byb3BlcnR5OiBudW1iZXJPZkNoYWxsZW5nZXNQcm9wZXJ0eSxcbiAgICAgIGVsYXBzZWRUaW1lUHJvcGVydHk6IGVsYXBzZWRUaW1lUHJvcGVydHksXG4gICAgICB0aW1lckVuYWJsZWRQcm9wZXJ0eTogdGltZXJFbmFibGVkUHJvcGVydHksXG4gICAgICBzdGFydE92ZXJCdXR0b25PcHRpb25zOiB7XG4gICAgICAgIGxpc3RlbmVyOiAoKSA9PiB7IGNvbnNvbGUubG9nKCAnU3RhcnQgT3ZlcicgKTsgfVxuICAgICAgfVxuICAgIH0gKTtcblxuICAgIC8vIENvbnRyb2xzIGZvciBjaGFuZ2luZyBQcm9wZXJ0aWVzXG4gICAgY29uc3QgbGV2ZWxTbGlkZXIgPSBuZXcgSEJveCgge1xuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgbmV3IFRleHQoICdMZXZlbDogJywgeyBmb250OiBERUZBVUxUX0ZPTlQgfSApLFxuICAgICAgICBuZXcgSFNsaWRlciggbGV2ZWxQcm9wZXJ0eSwgbGV2ZWxQcm9wZXJ0eS5yYW5nZSwge1xuICAgICAgICAgIGNvbnN0cmFpblZhbHVlOiB2YWx1ZSA9PiBVdGlscy5yb3VuZFN5bW1ldHJpYyggdmFsdWUgKVxuICAgICAgICB9IClcbiAgICAgIF1cbiAgICB9ICk7XG5cbiAgICBjb25zdCBjaGFsbGVuZ2VJbmRleFNsaWRlciA9IG5ldyBIQm94KCB7XG4gICAgICBjaGlsZHJlbjogW1xuICAgICAgICBuZXcgVGV4dCggJ0NoYWxsZW5nZTogJywgeyBmb250OiBERUZBVUxUX0ZPTlQgfSApLFxuICAgICAgICBuZXcgSFNsaWRlciggY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eSwgY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eS5yYW5nZSwge1xuICAgICAgICAgIGNvbnN0cmFpblZhbHVlOiB2YWx1ZSA9PiBVdGlscy5yb3VuZFN5bW1ldHJpYyggdmFsdWUgKVxuICAgICAgICB9IClcbiAgICAgIF1cbiAgICB9ICk7XG5cbiAgICBjb25zdCBudW1iZXJPZkNoYWxsZW5nZXNTbGlkZXIgPSBuZXcgSEJveCgge1xuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgbmV3IFRleHQoICdOdW1iZXIgb2YgY2hhbGxlbmdlczogJywgeyBmb250OiBERUZBVUxUX0ZPTlQgfSApLFxuICAgICAgICBuZXcgSFNsaWRlciggbnVtYmVyT2ZDaGFsbGVuZ2VzUHJvcGVydHksIG51bWJlck9mQ2hhbGxlbmdlc1Byb3BlcnR5LnJhbmdlLCB7XG4gICAgICAgICAgY29uc3RyYWluVmFsdWU6IHZhbHVlID0+IFV0aWxzLnJvdW5kU3ltbWV0cmljKCB2YWx1ZSApXG4gICAgICAgIH0gKVxuICAgICAgXVxuICAgIH0gKTtcblxuICAgIGNvbnN0IHNjb3JlU2xpZGVyID0gbmV3IEhCb3goIHtcbiAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgIG5ldyBUZXh0KCAnU2NvcmU6ICcsIHsgZm9udDogREVGQVVMVF9GT05UIH0gKSxcbiAgICAgICAgbmV3IEhTbGlkZXIoIHNjb3JlUHJvcGVydHksIHNjb3JlUHJvcGVydHkucmFuZ2UsIHtcbiAgICAgICAgICBjb25zdHJhaW5WYWx1ZTogdmFsdWUgPT4gVXRpbHMucm91bmRTeW1tZXRyaWMoIHZhbHVlIClcbiAgICAgICAgfSApXG4gICAgICBdXG4gICAgfSApO1xuXG4gICAgY29uc3QgZWxhcHNlZFRpbWVTbGlkZXIgPSBuZXcgSEJveCgge1xuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgbmV3IFRleHQoICdFbGFwc2VkIHRpbWU6ICcsIHsgZm9udDogREVGQVVMVF9GT05UIH0gKSxcbiAgICAgICAgbmV3IEhTbGlkZXIoIGVsYXBzZWRUaW1lUHJvcGVydHksIGVsYXBzZWRUaW1lUHJvcGVydHkucmFuZ2UsIHtcbiAgICAgICAgICBjb25zdHJhaW5WYWx1ZTogdmFsdWUgPT4gVXRpbHMucm91bmRTeW1tZXRyaWMoIHZhbHVlIClcbiAgICAgICAgfSApXG4gICAgICBdXG4gICAgfSApO1xuXG4gICAgY29uc3QgdGltZXJFbmFibGVkQ2hlY2tib3ggPSBuZXcgQ2hlY2tib3goIHRpbWVyRW5hYmxlZFByb3BlcnR5LCBuZXcgVGV4dCggJ1RpbWVyIGVuYWJsZWQnLCB7IGZvbnQ6IERFRkFVTFRfRk9OVCB9ICkgKTtcblxuICAgIGNvbnN0IGxldmVsQ29tcGxldGVkTm9kZSA9IG5ldyBMZXZlbENvbXBsZXRlZE5vZGUoXG4gICAgICBsZXZlbFByb3BlcnR5LmdldCgpLCAvLyBsZXZlbFxuICAgICAgc2NvcmVQcm9wZXJ0eS52YWx1ZSwgLy8gc2NvcmVcbiAgICAgIFBFUkZFQ1RfU0NPUkUsIC8vIG1heFNjb3JlXG4gICAgICA0LCAvLyBudW1iZXJPZlN0YXJzXG4gICAgICB0cnVlLCAvLyB0aW1lckVuYWJsZWRcbiAgICAgIDc3LCAvLyBlbGFwc2VkVGltZVxuICAgICAgNzQsIC8vIGJlc3RUaW1lQXRUaGlzTGV2ZWxcbiAgICAgIHRydWUsIC8vIGlzTmV3QmVzdFRpbWVcbiAgICAgICgpID0+IHsgbGV2ZWxDb21wbGV0ZWROb2RlLnZpc2libGUgPSBmYWxzZTsgfSwgLy8gQ29udGludWUgYnV0dG9uIGNhbGxiYWNrXG4gICAgICB7XG4gICAgICAgIGNlbnRlcjogdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyLFxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBidXR0b24gdG8gc2hvdyBMZXZlbENvbXBsZXRlZE5vZGVcbiAgICBjb25zdCBsZXZlbENvbXBsZXRlZEJ1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcbiAgICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCAnc2hvdyBMZXZlbENvbXBsZXRlZE5vZGUnLCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMjAgKSB9ICksXG4gICAgICBjZW50ZXJYOiB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJYLFxuICAgICAgYm90dG9tOiB0aGlzLmxheW91dEJvdW5kcy5ib3R0b20gLSAyMCxcbiAgICAgIGVuYWJsZWRQcm9wZXJ0eTogbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBsZXZlbENvbXBsZXRlZE5vZGUudmlzaWJsZVByb3BlcnR5IF0sIHZpc2libGUgPT4gIXZpc2libGUgKSxcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XG4gICAgICAgIGxldmVsQ29tcGxldGVkTm9kZS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICAvLyBMYXkgb3V0IGFsbCBjb250cm9sc1xuICAgIGNvbnN0IGNvbnRyb2xzID0gbmV3IFZCb3goIHtcbiAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgc3BhY2luZzogMjUsXG4gICAgICBjZW50ZXI6IHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlcixcbiAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgIGxldmVsU2xpZGVyLFxuICAgICAgICBjaGFsbGVuZ2VJbmRleFNsaWRlcixcbiAgICAgICAgbnVtYmVyT2ZDaGFsbGVuZ2VzU2xpZGVyLFxuICAgICAgICBzY29yZVNsaWRlcixcbiAgICAgICAgZWxhcHNlZFRpbWVTbGlkZXIsXG4gICAgICAgIHRpbWVyRW5hYmxlZENoZWNrYm94LFxuICAgICAgICBsZXZlbENvbXBsZXRlZEJ1dHRvblxuICAgICAgXVxuICAgIH0gKTtcblxuICAgIHRoaXMuY2hpbGRyZW4gPSBbIHN0YXR1c0JhciwgY29udHJvbHMsIGxldmVsQ29tcGxldGVkTm9kZSBdO1xuICB9XG59XG5cbnZlZ2FzLnJlZ2lzdGVyKCAnRmluaXRlQ2hhbGxlbmdlc1NjcmVlblZpZXcnLCBGaW5pdGVDaGFsbGVuZ2VzU2NyZWVuVmlldyApOyJdLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwiVXRpbHMiLCJTY3JlZW5WaWV3IiwiUGhldEZvbnQiLCJIQm94IiwiVGV4dCIsIlZCb3giLCJSZWN0YW5ndWxhclB1c2hCdXR0b24iLCJDaGVja2JveCIsIkhTbGlkZXIiLCJUYW5kZW0iLCJGaW5pdGVTdGF0dXNCYXIiLCJMZXZlbENvbXBsZXRlZE5vZGUiLCJ2ZWdhcyIsIlBFUkZFQ1RfU0NPUkUiLCJOVU1CRVJfT0ZfQ0hBTExFTkdFUyIsIkRFRkFVTFRfRk9OVCIsIkZpbml0ZUNoYWxsZW5nZXNTY3JlZW5WaWV3IiwidGFuZGVtIiwiT1BUX09VVCIsImxldmVsUHJvcGVydHkiLCJudW1iZXJUeXBlIiwicmFuZ2UiLCJjaGFsbGVuZ2VJbmRleFByb3BlcnR5IiwibnVtYmVyT2ZDaGFsbGVuZ2VzUHJvcGVydHkiLCJzY29yZVByb3BlcnR5IiwiZWxhcHNlZFRpbWVQcm9wZXJ0eSIsInRpbWVyRW5hYmxlZFByb3BlcnR5Iiwic3RhdHVzQmFyIiwibGF5b3V0Qm91bmRzIiwidmlzaWJsZUJvdW5kc1Byb3BlcnR5IiwiYmFyRmlsbCIsImZvbnQiLCJzdGFydE92ZXJCdXR0b25PcHRpb25zIiwibGlzdGVuZXIiLCJjb25zb2xlIiwibG9nIiwibGV2ZWxTbGlkZXIiLCJjaGlsZHJlbiIsImNvbnN0cmFpblZhbHVlIiwidmFsdWUiLCJyb3VuZFN5bW1ldHJpYyIsImNoYWxsZW5nZUluZGV4U2xpZGVyIiwibnVtYmVyT2ZDaGFsbGVuZ2VzU2xpZGVyIiwic2NvcmVTbGlkZXIiLCJlbGFwc2VkVGltZVNsaWRlciIsInRpbWVyRW5hYmxlZENoZWNrYm94IiwibGV2ZWxDb21wbGV0ZWROb2RlIiwiZ2V0IiwidmlzaWJsZSIsImNlbnRlciIsImxldmVsQ29tcGxldGVkQnV0dG9uIiwiY29udGVudCIsImNlbnRlclgiLCJib3R0b20iLCJlbmFibGVkUHJvcGVydHkiLCJ2aXNpYmxlUHJvcGVydHkiLCJjb250cm9scyIsImFsaWduIiwic3BhY2luZyIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxxQkFBcUIsc0NBQXNDO0FBQ2xFLE9BQU9DLHFCQUFxQixzQ0FBc0M7QUFDbEUsT0FBT0Msb0JBQW9CLHFDQUFxQztBQUNoRSxPQUFPQyxXQUFXLDJCQUEyQjtBQUM3QyxPQUFPQyxXQUFXLDJCQUEyQjtBQUM3QyxPQUFPQyxnQkFBZ0Isa0NBQWtDO0FBQ3pELE9BQU9DLGNBQWMsdUNBQXVDO0FBQzVELFNBQVNDLElBQUks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