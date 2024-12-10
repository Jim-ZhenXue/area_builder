// Copyright 2018-2024, University of Colorado Boulder
/**
 * view for a screen that demonstrates views and sounds for components that interact with the model in some way
 *
 * @author John Blanco (PhET Interactive Simulations)
 */ import Property from '../../../../../axon/js/Property.js';
import Dimension2 from '../../../../../dot/js/Dimension2.js';
import Range from '../../../../../dot/js/Range.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import ScreenView from '../../../../../joist/js/ScreenView.js';
import ModelViewTransform2 from '../../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { Path, Text } from '../../../../../scenery/js/imports.js';
import ABSwitch from '../../../../../sun/js/ABSwitch.js';
import NumberSpinner from '../../../../../sun/js/NumberSpinner.js';
import Tandem from '../../../../../tandem/js/Tandem.js';
import nullSoundPlayer from '../../../nullSoundPlayer.js';
import PitchedPopGenerator from '../../../sound-generators/PitchedPopGenerator.js';
import soundManager from '../../../soundManager.js';
import tambo from '../../../tambo.js';
import BallNode from './BallNode.js';
// constants
const MAX_BALLS = 8;
const FONT = new PhetFont(16);
let SimLikeComponentsScreenView = class SimLikeComponentsScreenView extends ScreenView {
    constructor(model){
        super({
            tandem: Tandem.OPT_OUT
        });
        // set up the model view transform
        const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(Vector2.ZERO, new Vector2(this.layoutBounds.width * 0.275, this.layoutBounds.height * 0.5), 2);
        // add the box where the balls bounce around
        const boxNode = new Path(modelViewTransform.modelToViewShape(model.boxOfBalls.box), {
            fill: 'white',
            stroke: 'black'
        });
        this.addChild(boxNode);
        // handle balls being added to or removed from the box
        model.boxOfBalls.balls.addItemAddedListener((addedBall)=>{
            // add a node that represents the ball
            const ballNode = new BallNode(addedBall, modelViewTransform);
            this.addChild(ballNode);
            // set up a listener to remove the nodes when the corresponding ball is removed from the model
            const removalListener = (removedBall)=>{
                if (removedBall === addedBall) {
                    this.removeChild(ballNode);
                    ballNode.dispose();
                    model.boxOfBalls.balls.removeItemRemovedListener(removalListener);
                }
            };
            model.boxOfBalls.balls.addItemRemovedListener(removalListener);
        });
        // generate sound when balls are added or removed
        const pitchedPopGenerator = new PitchedPopGenerator();
        soundManager.addSoundGenerator(pitchedPopGenerator);
        model.boxOfBalls.balls.lengthProperty.lazyLink((numBalls)=>{
            pitchedPopGenerator.playPop(numBalls / MAX_BALLS);
        });
        // add a switch to turn ball motion on and off
        const ballsMovingSwitch = new ABSwitch(model.ballsMovingProperty, false, new Text('Paused', {
            font: FONT
        }), true, new Text('Running', {
            font: FONT
        }), {
            toggleSwitchOptions: {
                size: new Dimension2(60, 30)
            },
            centerX: boxNode.centerX,
            top: boxNode.bottom + 25
        });
        this.addChild(ballsMovingSwitch);
        // add a number spinner for adding and removing balls
        const ballCountSpinner = new NumberSpinner(model.numberOfBallsProperty, new Property(new Range(0, MAX_BALLS)), {
            numberDisplayOptions: {
                backgroundFill: '#cccccc',
                backgroundStroke: 'green',
                backgroundLineWidth: 3,
                align: 'center',
                xMargin: 20,
                yMargin: 3,
                textOptions: {
                    font: new PhetFont(35)
                }
            },
            arrowsPosition: 'bothBottom',
            arrowButtonFill: 'lightblue',
            arrowButtonStroke: 'blue',
            arrowButtonLineWidth: 0.2,
            centerX: ballsMovingSwitch.centerX,
            top: ballsMovingSwitch.bottom + 25,
            arrowsSoundPlayer: nullSoundPlayer
        });
        this.addChild(ballCountSpinner);
        // add the reset all button
        const resetAllButton = new ResetAllButton({
            right: this.layoutBounds.maxX - 25,
            bottom: this.layoutBounds.maxY - 25,
            listener: ()=>{
                model.reset();
            }
        });
        this.addChild(resetAllButton);
    }
};
tambo.register('SimLikeComponentsScreenView', SimLikeComponentsScreenView);
export default SimLikeComponentsScreenView;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL2RlbW8vc2ltLWxpa2UtY29tcG9uZW50cy92aWV3L1NpbUxpa2VDb21wb25lbnRzU2NyZWVuVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiB2aWV3IGZvciBhIHNjcmVlbiB0aGF0IGRlbW9uc3RyYXRlcyB2aWV3cyBhbmQgc291bmRzIGZvciBjb21wb25lbnRzIHRoYXQgaW50ZXJhY3Qgd2l0aCB0aGUgbW9kZWwgaW4gc29tZSB3YXlcbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuaW1wb3J0IFNjcmVlblZpZXcgZnJvbSAnLi4vLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XG5pbXBvcnQgUmVzZXRBbGxCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvUmVzZXRBbGxCdXR0b24uanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgeyBQYXRoLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBBQlN3aXRjaCBmcm9tICcuLi8uLi8uLi8uLi8uLi9zdW4vanMvQUJTd2l0Y2guanMnO1xuaW1wb3J0IE51bWJlclNwaW5uZXIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vc3VuL2pzL051bWJlclNwaW5uZXIuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBudWxsU291bmRQbGF5ZXIgZnJvbSAnLi4vLi4vLi4vbnVsbFNvdW5kUGxheWVyLmpzJztcbmltcG9ydCBQaXRjaGVkUG9wR2VuZXJhdG9yIGZyb20gJy4uLy4uLy4uL3NvdW5kLWdlbmVyYXRvcnMvUGl0Y2hlZFBvcEdlbmVyYXRvci5qcyc7XG5pbXBvcnQgc291bmRNYW5hZ2VyIGZyb20gJy4uLy4uLy4uL3NvdW5kTWFuYWdlci5qcyc7XG5pbXBvcnQgdGFtYm8gZnJvbSAnLi4vLi4vLi4vdGFtYm8uanMnO1xuaW1wb3J0IEJhbGwgZnJvbSAnLi4vbW9kZWwvQmFsbC5qcyc7XG5pbXBvcnQgU2ltTGlrZUNvbXBvbmVudHNNb2RlbCBmcm9tICcuLi9tb2RlbC9TaW1MaWtlQ29tcG9uZW50c01vZGVsLmpzJztcbmltcG9ydCBCYWxsTm9kZSBmcm9tICcuL0JhbGxOb2RlLmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBNQVhfQkFMTFMgPSA4O1xuY29uc3QgRk9OVCA9IG5ldyBQaGV0Rm9udCggMTYgKTtcblxuY2xhc3MgU2ltTGlrZUNvbXBvbmVudHNTY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbDogU2ltTGlrZUNvbXBvbmVudHNNb2RlbCApIHtcblxuICAgIHN1cGVyKCB7XG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXG4gICAgfSApO1xuXG4gICAgLy8gc2V0IHVwIHRoZSBtb2RlbCB2aWV3IHRyYW5zZm9ybVxuICAgIGNvbnN0IG1vZGVsVmlld1RyYW5zZm9ybSA9IE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlU2luZ2xlUG9pbnRTY2FsZUludmVydGVkWU1hcHBpbmcoXG4gICAgICBWZWN0b3IyLlpFUk8sXG4gICAgICBuZXcgVmVjdG9yMiggdGhpcy5sYXlvdXRCb3VuZHMud2lkdGggKiAwLjI3NSwgdGhpcy5sYXlvdXRCb3VuZHMuaGVpZ2h0ICogMC41ICksXG4gICAgICAyXG4gICAgKTtcblxuICAgIC8vIGFkZCB0aGUgYm94IHdoZXJlIHRoZSBiYWxscyBib3VuY2UgYXJvdW5kXG4gICAgY29uc3QgYm94Tm9kZSA9IG5ldyBQYXRoKCBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdTaGFwZSggbW9kZWwuYm94T2ZCYWxscy5ib3ggKSwge1xuICAgICAgZmlsbDogJ3doaXRlJyxcbiAgICAgIHN0cm9rZTogJ2JsYWNrJ1xuICAgIH0gKTtcbiAgICB0aGlzLmFkZENoaWxkKCBib3hOb2RlICk7XG5cbiAgICAvLyBoYW5kbGUgYmFsbHMgYmVpbmcgYWRkZWQgdG8gb3IgcmVtb3ZlZCBmcm9tIHRoZSBib3hcbiAgICBtb2RlbC5ib3hPZkJhbGxzLmJhbGxzLmFkZEl0ZW1BZGRlZExpc3RlbmVyKCBhZGRlZEJhbGwgPT4ge1xuXG4gICAgICAvLyBhZGQgYSBub2RlIHRoYXQgcmVwcmVzZW50cyB0aGUgYmFsbFxuICAgICAgY29uc3QgYmFsbE5vZGUgPSBuZXcgQmFsbE5vZGUoIGFkZGVkQmFsbCwgbW9kZWxWaWV3VHJhbnNmb3JtICk7XG4gICAgICB0aGlzLmFkZENoaWxkKCBiYWxsTm9kZSApO1xuXG4gICAgICAvLyBzZXQgdXAgYSBsaXN0ZW5lciB0byByZW1vdmUgdGhlIG5vZGVzIHdoZW4gdGhlIGNvcnJlc3BvbmRpbmcgYmFsbCBpcyByZW1vdmVkIGZyb20gdGhlIG1vZGVsXG4gICAgICBjb25zdCByZW1vdmFsTGlzdGVuZXIgPSAoIHJlbW92ZWRCYWxsOiBCYWxsICkgPT4ge1xuICAgICAgICBpZiAoIHJlbW92ZWRCYWxsID09PSBhZGRlZEJhbGwgKSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmVDaGlsZCggYmFsbE5vZGUgKTtcbiAgICAgICAgICBiYWxsTm9kZS5kaXNwb3NlKCk7XG4gICAgICAgICAgbW9kZWwuYm94T2ZCYWxscy5iYWxscy5yZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyKCByZW1vdmFsTGlzdGVuZXIgKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIG1vZGVsLmJveE9mQmFsbHMuYmFsbHMuYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciggcmVtb3ZhbExpc3RlbmVyICk7XG4gICAgfSApO1xuXG4gICAgLy8gZ2VuZXJhdGUgc291bmQgd2hlbiBiYWxscyBhcmUgYWRkZWQgb3IgcmVtb3ZlZFxuICAgIGNvbnN0IHBpdGNoZWRQb3BHZW5lcmF0b3IgPSBuZXcgUGl0Y2hlZFBvcEdlbmVyYXRvcigpO1xuICAgIHNvdW5kTWFuYWdlci5hZGRTb3VuZEdlbmVyYXRvciggcGl0Y2hlZFBvcEdlbmVyYXRvciApO1xuICAgIG1vZGVsLmJveE9mQmFsbHMuYmFsbHMubGVuZ3RoUHJvcGVydHkubGF6eUxpbmsoIG51bUJhbGxzID0+IHtcbiAgICAgIHBpdGNoZWRQb3BHZW5lcmF0b3IucGxheVBvcCggbnVtQmFsbHMgLyBNQVhfQkFMTFMgKTtcbiAgICB9ICk7XG5cbiAgICAvLyBhZGQgYSBzd2l0Y2ggdG8gdHVybiBiYWxsIG1vdGlvbiBvbiBhbmQgb2ZmXG4gICAgY29uc3QgYmFsbHNNb3ZpbmdTd2l0Y2ggPSBuZXcgQUJTd2l0Y2goXG4gICAgICBtb2RlbC5iYWxsc01vdmluZ1Byb3BlcnR5LFxuICAgICAgZmFsc2UsXG4gICAgICBuZXcgVGV4dCggJ1BhdXNlZCcsIHsgZm9udDogRk9OVCB9ICksXG4gICAgICB0cnVlLFxuICAgICAgbmV3IFRleHQoICdSdW5uaW5nJywgeyBmb250OiBGT05UIH0gKSxcbiAgICAgIHtcbiAgICAgICAgdG9nZ2xlU3dpdGNoT3B0aW9uczogeyBzaXplOiBuZXcgRGltZW5zaW9uMiggNjAsIDMwICkgfSxcbiAgICAgICAgY2VudGVyWDogYm94Tm9kZS5jZW50ZXJYLFxuICAgICAgICB0b3A6IGJveE5vZGUuYm90dG9tICsgMjVcbiAgICAgIH0gKTtcbiAgICB0aGlzLmFkZENoaWxkKCBiYWxsc01vdmluZ1N3aXRjaCApO1xuXG4gICAgLy8gYWRkIGEgbnVtYmVyIHNwaW5uZXIgZm9yIGFkZGluZyBhbmQgcmVtb3ZpbmcgYmFsbHNcbiAgICBjb25zdCBiYWxsQ291bnRTcGlubmVyID0gbmV3IE51bWJlclNwaW5uZXIoXG4gICAgICBtb2RlbC5udW1iZXJPZkJhbGxzUHJvcGVydHksXG4gICAgICBuZXcgUHJvcGVydHkoIG5ldyBSYW5nZSggMCwgTUFYX0JBTExTICkgKSxcbiAgICAgIHtcbiAgICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcbiAgICAgICAgICBiYWNrZ3JvdW5kRmlsbDogJyNjY2NjY2MnLFxuICAgICAgICAgIGJhY2tncm91bmRTdHJva2U6ICdncmVlbicsXG4gICAgICAgICAgYmFja2dyb3VuZExpbmVXaWR0aDogMyxcbiAgICAgICAgICBhbGlnbjogJ2NlbnRlcicsXG4gICAgICAgICAgeE1hcmdpbjogMjAsXG4gICAgICAgICAgeU1hcmdpbjogMyxcbiAgICAgICAgICB0ZXh0T3B0aW9uczoge1xuICAgICAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCAzNSApXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBhcnJvd3NQb3NpdGlvbjogJ2JvdGhCb3R0b20nLFxuICAgICAgICBhcnJvd0J1dHRvbkZpbGw6ICdsaWdodGJsdWUnLFxuICAgICAgICBhcnJvd0J1dHRvblN0cm9rZTogJ2JsdWUnLFxuICAgICAgICBhcnJvd0J1dHRvbkxpbmVXaWR0aDogMC4yLFxuICAgICAgICBjZW50ZXJYOiBiYWxsc01vdmluZ1N3aXRjaC5jZW50ZXJYLFxuICAgICAgICB0b3A6IGJhbGxzTW92aW5nU3dpdGNoLmJvdHRvbSArIDI1LFxuICAgICAgICBhcnJvd3NTb3VuZFBsYXllcjogbnVsbFNvdW5kUGxheWVyXG4gICAgICB9ICk7XG4gICAgdGhpcy5hZGRDaGlsZCggYmFsbENvdW50U3Bpbm5lciApO1xuXG4gICAgLy8gYWRkIHRoZSByZXNldCBhbGwgYnV0dG9uXG4gICAgY29uc3QgcmVzZXRBbGxCdXR0b24gPSBuZXcgUmVzZXRBbGxCdXR0b24oIHtcbiAgICAgIHJpZ2h0OiB0aGlzLmxheW91dEJvdW5kcy5tYXhYIC0gMjUsXG4gICAgICBib3R0b206IHRoaXMubGF5b3V0Qm91bmRzLm1heFkgLSAyNSxcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7IG1vZGVsLnJlc2V0KCk7IH1cbiAgICB9ICk7XG4gICAgdGhpcy5hZGRDaGlsZCggcmVzZXRBbGxCdXR0b24gKTtcbiAgfVxufVxuXG50YW1iby5yZWdpc3RlciggJ1NpbUxpa2VDb21wb25lbnRzU2NyZWVuVmlldycsIFNpbUxpa2VDb21wb25lbnRzU2NyZWVuVmlldyApO1xuXG5leHBvcnQgZGVmYXVsdCBTaW1MaWtlQ29tcG9uZW50c1NjcmVlblZpZXc7Il0sIm5hbWVzIjpbIlByb3BlcnR5IiwiRGltZW5zaW9uMiIsIlJhbmdlIiwiVmVjdG9yMiIsIlNjcmVlblZpZXciLCJNb2RlbFZpZXdUcmFuc2Zvcm0yIiwiUmVzZXRBbGxCdXR0b24iLCJQaGV0Rm9udCIsIlBhdGgiLCJUZXh0IiwiQUJTd2l0Y2giLCJOdW1iZXJTcGlubmVyIiwiVGFuZGVtIiwibnVsbFNvdW5kUGxheWVyIiwiUGl0Y2hlZFBvcEdlbmVyYXRvciIsInNvdW5kTWFuYWdlciIsInRhbWJvIiwiQmFsbE5vZGUiLCJNQVhfQkFMTFMiLCJGT05UIiwiU2ltTGlrZUNvbXBvbmVudHNTY3JlZW5WaWV3IiwibW9kZWwiLCJ0YW5kZW0iLCJPUFRfT1VUIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiY3JlYXRlU2luZ2xlUG9pbnRTY2FsZUludmVydGVkWU1hcHBpbmciLCJaRVJPIiwibGF5b3V0Qm91bmRzIiwid2lkdGgiLCJoZWlnaHQiLCJib3hOb2RlIiwibW9kZWxUb1ZpZXdTaGFwZSIsImJveE9mQmFsbHMiLCJib3giLCJmaWxsIiwic3Ryb2tlIiwiYWRkQ2hpbGQiLCJiYWxscyIsImFkZEl0ZW1BZGRlZExpc3RlbmVyIiwiYWRkZWRCYWxsIiwiYmFsbE5vZGUiLCJyZW1vdmFsTGlzdGVuZXIiLCJyZW1vdmVkQmFsbCIsInJlbW92ZUNoaWxkIiwiZGlzcG9zZSIsInJlbW92ZUl0ZW1SZW1vdmVkTGlzdGVuZXIiLCJhZGRJdGVtUmVtb3ZlZExpc3RlbmVyIiwicGl0Y2hlZFBvcEdlbmVyYXRvciIsImFkZFNvdW5kR2VuZXJhdG9yIiwibGVuZ3RoUHJvcGVydHkiLCJsYXp5TGluayIsIm51bUJhbGxzIiwicGxheVBvcCIsImJhbGxzTW92aW5nU3dpdGNoIiwiYmFsbHNNb3ZpbmdQcm9wZXJ0eSIsImZvbnQiLCJ0b2dnbGVTd2l0Y2hPcHRpb25zIiwic2l6ZSIsImNlbnRlclgiLCJ0b3AiLCJib3R0b20iLCJiYWxsQ291bnRTcGlubmVyIiwibnVtYmVyT2ZCYWxsc1Byb3BlcnR5IiwibnVtYmVyRGlzcGxheU9wdGlvbnMiLCJiYWNrZ3JvdW5kRmlsbCIsImJhY2tncm91bmRTdHJva2UiLCJiYWNrZ3JvdW5kTGluZVdpZHRoIiwiYWxpZ24iLCJ4TWFyZ2luIiwieU1hcmdpbiIsInRleHRPcHRpb25zIiwiYXJyb3dzUG9zaXRpb24iLCJhcnJvd0J1dHRvbkZpbGwiLCJhcnJvd0J1dHRvblN0cm9rZSIsImFycm93QnV0dG9uTGluZVdpZHRoIiwiYXJyb3dzU291bmRQbGF5ZXIiLCJyZXNldEFsbEJ1dHRvbiIsInJpZ2h0IiwibWF4WCIsIm1heFkiLCJsaXN0ZW5lciIsInJlc2V0IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsY0FBYyxxQ0FB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