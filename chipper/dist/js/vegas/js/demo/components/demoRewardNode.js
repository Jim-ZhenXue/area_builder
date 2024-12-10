// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for RewardNode
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import stepTimer from '../../../../axon/js/stepTimer.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import { Node } from '../../../../scenery/js/imports.js';
import RewardNode from '../../RewardNode.js';
export default function demoRewardNode(layoutBounds) {
    return new DemoNode(layoutBounds);
}
let DemoNode = class DemoNode extends Node {
    dispose() {
        this.disposeDemoNode();
        super.dispose();
    }
    constructor(layoutBounds){
        const rewardNode = new RewardNode();
        const isPlayingProperty = new BooleanProperty(true);
        const timeControls = new TimeControlNode(isPlayingProperty, {
            playPauseStepButtonOptions: {
                stepForwardButtonOptions: {
                    listener: ()=>rewardNode.step(0.1)
                }
            },
            centerX: layoutBounds.centerX,
            bottom: layoutBounds.bottom - 20
        });
        const stepTimerListener = (dt)=>{
            if (isPlayingProperty.value) {
                rewardNode.step(dt);
            }
        };
        stepTimer.addListener(stepTimerListener);
        super({
            children: [
                rewardNode,
                timeControls
            ]
        });
        this.disposeDemoNode = ()=>{
            rewardNode.dispose(); // must be disposed in the demo, see https://github.com/phetsims/vegas/issues/111
            isPlayingProperty.dispose();
            timeControls.dispose();
            if (stepTimer.hasListener(stepTimerListener)) {
                stepTimer.removeListener(stepTimerListener);
            }
        };
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL2RlbW8vY29tcG9uZW50cy9kZW1vUmV3YXJkTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZW1vIGZvciBSZXdhcmROb2RlXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcbmltcG9ydCBzdGVwVGltZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9zdGVwVGltZXIuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IFRpbWVDb250cm9sTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvVGltZUNvbnRyb2xOb2RlLmpzJztcbmltcG9ydCB7IE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IFJld2FyZE5vZGUgZnJvbSAnLi4vLi4vUmV3YXJkTm9kZS5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9SZXdhcmROb2RlKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XG4gIHJldHVybiBuZXcgRGVtb05vZGUoIGxheW91dEJvdW5kcyApO1xufVxuXG5jbGFzcyBEZW1vTm9kZSBleHRlbmRzIE5vZGUge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZURlbW9Ob2RlOiAoKSA9PiB2b2lkO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICkge1xuXG4gICAgY29uc3QgcmV3YXJkTm9kZSA9IG5ldyBSZXdhcmROb2RlKCk7XG5cbiAgICBjb25zdCBpc1BsYXlpbmdQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKTtcblxuICAgIGNvbnN0IHRpbWVDb250cm9scyA9IG5ldyBUaW1lQ29udHJvbE5vZGUoIGlzUGxheWluZ1Byb3BlcnR5LCB7XG4gICAgICBwbGF5UGF1c2VTdGVwQnV0dG9uT3B0aW9uczoge1xuICAgICAgICBzdGVwRm9yd2FyZEJ1dHRvbk9wdGlvbnM6IHtcbiAgICAgICAgICBsaXN0ZW5lcjogKCkgPT4gcmV3YXJkTm9kZS5zdGVwKCAwLjEgKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgY2VudGVyWDogbGF5b3V0Qm91bmRzLmNlbnRlclgsXG4gICAgICBib3R0b206IGxheW91dEJvdW5kcy5ib3R0b20gLSAyMFxuICAgIH0gKTtcblxuICAgIGNvbnN0IHN0ZXBUaW1lckxpc3RlbmVyID0gKCBkdDogbnVtYmVyICkgPT4ge1xuICAgICAgaWYgKCBpc1BsYXlpbmdQcm9wZXJ0eS52YWx1ZSApIHtcbiAgICAgICAgcmV3YXJkTm9kZS5zdGVwKCBkdCApO1xuICAgICAgfVxuICAgIH07XG4gICAgc3RlcFRpbWVyLmFkZExpc3RlbmVyKCBzdGVwVGltZXJMaXN0ZW5lciApO1xuXG4gICAgc3VwZXIoIHtcbiAgICAgIGNoaWxkcmVuOiBbIHJld2FyZE5vZGUsIHRpbWVDb250cm9scyBdXG4gICAgfSApO1xuXG4gICAgdGhpcy5kaXNwb3NlRGVtb05vZGUgPSAoKSA9PiB7XG4gICAgICByZXdhcmROb2RlLmRpc3Bvc2UoKTsgLy8gbXVzdCBiZSBkaXNwb3NlZCBpbiB0aGUgZGVtbywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy92ZWdhcy9pc3N1ZXMvMTExXG4gICAgICBpc1BsYXlpbmdQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgICB0aW1lQ29udHJvbHMuZGlzcG9zZSgpO1xuICAgICAgaWYgKCBzdGVwVGltZXIuaGFzTGlzdGVuZXIoIHN0ZXBUaW1lckxpc3RlbmVyICkgKSB7XG4gICAgICAgIHN0ZXBUaW1lci5yZW1vdmVMaXN0ZW5lciggc3RlcFRpbWVyTGlzdGVuZXIgKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlRGVtb05vZGUoKTtcbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cbn0iXSwibmFtZXMiOlsiQm9vbGVhblByb3BlcnR5Iiwic3RlcFRpbWVyIiwiVGltZUNvbnRyb2xOb2RlIiwiTm9kZSIsIlJld2FyZE5vZGUiLCJkZW1vUmV3YXJkTm9kZSIsImxheW91dEJvdW5kcyIsIkRlbW9Ob2RlIiwiZGlzcG9zZSIsImRpc3Bvc2VEZW1vTm9kZSIsInJld2FyZE5vZGUiLCJpc1BsYXlpbmdQcm9wZXJ0eSIsInRpbWVDb250cm9scyIsInBsYXlQYXVzZVN0ZXBCdXR0b25PcHRpb25zIiwic3RlcEZvcndhcmRCdXR0b25PcHRpb25zIiwibGlzdGVuZXIiLCJzdGVwIiwiY2VudGVyWCIsImJvdHRvbSIsInN0ZXBUaW1lckxpc3RlbmVyIiwiZHQiLCJ2YWx1ZSIsImFkZExpc3RlbmVyIiwiY2hpbGRyZW4iLCJoYXNMaXN0ZW5lciIsInJlbW92ZUxpc3RlbmVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLHFCQUFxQix5Q0FBeUM7QUFDckUsT0FBT0MsZUFBZSxtQ0FBbUM7QUFFekQsT0FBT0MscUJBQXFCLGlEQUFpRDtBQUM3RSxTQUFTQyxJQUFJLFFBQVEsb0NBQW9DO0FBQ3pELE9BQU9DLGdCQUFnQixzQkFBc0I7QUFFN0MsZUFBZSxTQUFTQyxlQUFnQkMsWUFBcUI7SUFDM0QsT0FBTyxJQUFJQyxTQUFVRDtBQUN2QjtBQUVBLElBQUEsQUFBTUMsV0FBTixNQUFNQSxpQkFBaUJKO0lBeUNMSyxVQUFnQjtRQUM5QixJQUFJLENBQUNDLGVBQWU7UUFDcEIsS0FBSyxDQUFDRDtJQUNSO0lBeENBLFlBQW9CRixZQUFxQixDQUFHO1FBRTFDLE1BQU1JLGFBQWEsSUFBSU47UUFFdkIsTUFBTU8sb0JBQW9CLElBQUlYLGdCQUFpQjtRQUUvQyxNQUFNWSxlQUFlLElBQUlWLGdCQUFpQlMsbUJBQW1CO1lBQzNERSw0QkFBNEI7Z0JBQzFCQywwQkFBMEI7b0JBQ3hCQyxVQUFVLElBQU1MLFdBQVdNLElBQUksQ0FBRTtnQkFDbkM7WUFDRjtZQUNBQyxTQUFTWCxhQUFhVyxPQUFPO1lBQzdCQyxRQUFRWixhQUFhWSxNQUFNLEdBQUc7UUFDaEM7UUFFQSxNQUFNQyxvQkFBb0IsQ0FBRUM7WUFDMUIsSUFBS1Qsa0JBQWtCVSxLQUFLLEVBQUc7Z0JBQzdCWCxXQUFXTSxJQUFJLENBQUVJO1lBQ25CO1FBQ0Y7UUFDQW5CLFVBQVVxQixXQUFXLENBQUVIO1FBRXZCLEtBQUssQ0FBRTtZQUNMSSxVQUFVO2dCQUFFYjtnQkFBWUU7YUFBYztRQUN4QztRQUVBLElBQUksQ0FBQ0gsZUFBZSxHQUFHO1lBQ3JCQyxXQUFXRixPQUFPLElBQUksaUZBQWlGO1lBQ3ZHRyxrQkFBa0JILE9BQU87WUFDekJJLGFBQWFKLE9BQU87WUFDcEIsSUFBS1AsVUFBVXVCLFdBQVcsQ0FBRUwsb0JBQXNCO2dCQUNoRGxCLFVBQVV3QixjQUFjLENBQUVOO1lBQzVCO1FBQ0Y7SUFDRjtBQU1GIn0=