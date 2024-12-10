// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for SpinningIndicatorNode
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import stepTimer from '../../../../axon/js/stepTimer.js';
import { Color, HBox } from '../../../../scenery/js/imports.js';
import SpinningIndicatorNode from '../../SpinningIndicatorNode.js';
export default function demoSpinningIndicatorNode(layoutBounds) {
    return new DemoNode(layoutBounds);
}
let DemoNode = class DemoNode extends HBox {
    dispose() {
        this.disposeDemoNode();
        super.dispose();
    }
    constructor(layoutBounds){
        const spinningIndicatorNode1 = new SpinningIndicatorNode({
            diameter: 100
        });
        const spinningIndicatorNode2 = new SpinningIndicatorNode({
            diameter: 100,
            numberOfElements: 30,
            elementFactory: SpinningIndicatorNode.circleFactory,
            activeColor: Color.RED,
            inactiveColor: Color.RED.withAlpha(0.15)
        });
        const stepTimerListener = (dt)=>{
            spinningIndicatorNode1.step(dt);
            spinningIndicatorNode2.step(dt);
        };
        stepTimer.addListener(stepTimerListener);
        super({
            children: [
                spinningIndicatorNode1,
                spinningIndicatorNode2
            ],
            spacing: 100,
            center: layoutBounds.center
        });
        this.disposeDemoNode = ()=>{
            spinningIndicatorNode1.dispose();
            spinningIndicatorNode2.dispose();
            if (stepTimer.hasListener(stepTimerListener)) {
                stepTimer.removeListener(stepTimerListener);
            }
        };
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb1NwaW5uaW5nSW5kaWNhdG9yTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZW1vIGZvciBTcGlubmluZ0luZGljYXRvck5vZGVcbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBzdGVwVGltZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9zdGVwVGltZXIuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IHsgQ29sb3IsIEhCb3gsIE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IFNwaW5uaW5nSW5kaWNhdG9yTm9kZSBmcm9tICcuLi8uLi9TcGlubmluZ0luZGljYXRvck5vZGUuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZW1vU3Bpbm5pbmdJbmRpY2F0b3JOb2RlKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XG4gIHJldHVybiBuZXcgRGVtb05vZGUoIGxheW91dEJvdW5kcyApO1xufVxuXG5jbGFzcyBEZW1vTm9kZSBleHRlbmRzIEhCb3gge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZURlbW9Ob2RlOiAoKSA9PiB2b2lkO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICkge1xuXG4gICAgY29uc3Qgc3Bpbm5pbmdJbmRpY2F0b3JOb2RlMSA9IG5ldyBTcGlubmluZ0luZGljYXRvck5vZGUoIHtcbiAgICAgIGRpYW1ldGVyOiAxMDBcbiAgICB9ICk7XG5cbiAgICBjb25zdCBzcGlubmluZ0luZGljYXRvck5vZGUyID0gbmV3IFNwaW5uaW5nSW5kaWNhdG9yTm9kZSgge1xuICAgICAgZGlhbWV0ZXI6IDEwMCxcbiAgICAgIG51bWJlck9mRWxlbWVudHM6IDMwLFxuICAgICAgZWxlbWVudEZhY3Rvcnk6IFNwaW5uaW5nSW5kaWNhdG9yTm9kZS5jaXJjbGVGYWN0b3J5LFxuICAgICAgYWN0aXZlQ29sb3I6IENvbG9yLlJFRCxcbiAgICAgIGluYWN0aXZlQ29sb3I6IENvbG9yLlJFRC53aXRoQWxwaGEoIDAuMTUgKVxuICAgIH0gKTtcblxuICAgIGNvbnN0IHN0ZXBUaW1lckxpc3RlbmVyID0gKCBkdDogbnVtYmVyICkgPT4ge1xuICAgICAgc3Bpbm5pbmdJbmRpY2F0b3JOb2RlMS5zdGVwKCBkdCApO1xuICAgICAgc3Bpbm5pbmdJbmRpY2F0b3JOb2RlMi5zdGVwKCBkdCApO1xuICAgIH07XG5cbiAgICBzdGVwVGltZXIuYWRkTGlzdGVuZXIoIHN0ZXBUaW1lckxpc3RlbmVyICk7XG5cbiAgICBzdXBlcigge1xuICAgICAgY2hpbGRyZW46IFsgc3Bpbm5pbmdJbmRpY2F0b3JOb2RlMSwgc3Bpbm5pbmdJbmRpY2F0b3JOb2RlMiBdLFxuICAgICAgc3BhY2luZzogMTAwLFxuICAgICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyXG4gICAgfSApO1xuXG4gICAgdGhpcy5kaXNwb3NlRGVtb05vZGUgPSAoKSA9PiB7XG4gICAgICBzcGlubmluZ0luZGljYXRvck5vZGUxLmRpc3Bvc2UoKTtcbiAgICAgIHNwaW5uaW5nSW5kaWNhdG9yTm9kZTIuZGlzcG9zZSgpO1xuICAgICAgaWYgKCBzdGVwVGltZXIuaGFzTGlzdGVuZXIoIHN0ZXBUaW1lckxpc3RlbmVyICkgKSB7XG4gICAgICAgIHN0ZXBUaW1lci5yZW1vdmVMaXN0ZW5lciggc3RlcFRpbWVyTGlzdGVuZXIgKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlRGVtb05vZGUoKTtcbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cbn0iXSwibmFtZXMiOlsic3RlcFRpbWVyIiwiQ29sb3IiLCJIQm94IiwiU3Bpbm5pbmdJbmRpY2F0b3JOb2RlIiwiZGVtb1NwaW5uaW5nSW5kaWNhdG9yTm9kZSIsImxheW91dEJvdW5kcyIsIkRlbW9Ob2RlIiwiZGlzcG9zZSIsImRpc3Bvc2VEZW1vTm9kZSIsInNwaW5uaW5nSW5kaWNhdG9yTm9kZTEiLCJkaWFtZXRlciIsInNwaW5uaW5nSW5kaWNhdG9yTm9kZTIiLCJudW1iZXJPZkVsZW1lbnRzIiwiZWxlbWVudEZhY3RvcnkiLCJjaXJjbGVGYWN0b3J5IiwiYWN0aXZlQ29sb3IiLCJSRUQiLCJpbmFjdGl2ZUNvbG9yIiwid2l0aEFscGhhIiwic3RlcFRpbWVyTGlzdGVuZXIiLCJkdCIsInN0ZXAiLCJhZGRMaXN0ZW5lciIsImNoaWxkcmVuIiwic3BhY2luZyIsImNlbnRlciIsImhhc0xpc3RlbmVyIiwicmVtb3ZlTGlzdGVuZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsZUFBZSxtQ0FBbUM7QUFFekQsU0FBU0MsS0FBSyxFQUFFQyxJQUFJLFFBQWMsb0NBQW9DO0FBQ3RFLE9BQU9DLDJCQUEyQixpQ0FBaUM7QUFFbkUsZUFBZSxTQUFTQywwQkFBMkJDLFlBQXFCO0lBQ3RFLE9BQU8sSUFBSUMsU0FBVUQ7QUFDdkI7QUFFQSxJQUFBLEFBQU1DLFdBQU4sTUFBTUEsaUJBQWlCSjtJQXdDTEssVUFBZ0I7UUFDOUIsSUFBSSxDQUFDQyxlQUFlO1FBQ3BCLEtBQUssQ0FBQ0Q7SUFDUjtJQXZDQSxZQUFvQkYsWUFBcUIsQ0FBRztRQUUxQyxNQUFNSSx5QkFBeUIsSUFBSU4sc0JBQXVCO1lBQ3hETyxVQUFVO1FBQ1o7UUFFQSxNQUFNQyx5QkFBeUIsSUFBSVIsc0JBQXVCO1lBQ3hETyxVQUFVO1lBQ1ZFLGtCQUFrQjtZQUNsQkMsZ0JBQWdCVixzQkFBc0JXLGFBQWE7WUFDbkRDLGFBQWFkLE1BQU1lLEdBQUc7WUFDdEJDLGVBQWVoQixNQUFNZSxHQUFHLENBQUNFLFNBQVMsQ0FBRTtRQUN0QztRQUVBLE1BQU1DLG9CQUFvQixDQUFFQztZQUMxQlgsdUJBQXVCWSxJQUFJLENBQUVEO1lBQzdCVCx1QkFBdUJVLElBQUksQ0FBRUQ7UUFDL0I7UUFFQXBCLFVBQVVzQixXQUFXLENBQUVIO1FBRXZCLEtBQUssQ0FBRTtZQUNMSSxVQUFVO2dCQUFFZDtnQkFBd0JFO2FBQXdCO1lBQzVEYSxTQUFTO1lBQ1RDLFFBQVFwQixhQUFhb0IsTUFBTTtRQUM3QjtRQUVBLElBQUksQ0FBQ2pCLGVBQWUsR0FBRztZQUNyQkMsdUJBQXVCRixPQUFPO1lBQzlCSSx1QkFBdUJKLE9BQU87WUFDOUIsSUFBS1AsVUFBVTBCLFdBQVcsQ0FBRVAsb0JBQXNCO2dCQUNoRG5CLFVBQVUyQixjQUFjLENBQUVSO1lBQzVCO1FBQ0Y7SUFDRjtBQU1GIn0=