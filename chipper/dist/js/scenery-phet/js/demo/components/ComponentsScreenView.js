// Copyright 2014-2024, University of Colorado Boulder
/**
 * Demonstration of misc scenery-phet UI components.
 * Demos are selected from a combo box, and are instantiated on demand.
 * Use the 'component' query parameter to set the initial selection of the combo box.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */ import DemosScreenView from '../../../../sun/js/demo/DemosScreenView.js';
import sceneryPhet from '../../sceneryPhet.js';
import demoArrowNode from './demoArrowNode.js';
import demoBeakerNode from './demoBeakerNode.js';
import demoBicyclePumpNode from './demoBicyclePumpNode.js';
import demoBracketNode from './demoBracketNode.js';
import demoCapacitorNode from './demoCapacitorNode.js';
import demoComboBoxDisplay from './demoComboBoxDisplay.js';
import demoConductivityTesterNode from './demoConductivityTesterNode.js';
import demoDrawer from './demoDrawer.js';
import demoEyeDropperNode from './demoEyeDropperNode.js';
import demoFaucetNode from './demoFaucetNode.js';
import demoFormulaNode from './demoFormulaNode.js';
import demoGaugeNode from './demoGaugeNode.js';
import demoGrabDragInteraction from './demoGrabDragInteraction.js';
import demoHandleNode from './demoHandleNode.js';
import demoHeaterCoolerNode from './demoHeaterCoolerNode.js';
import demoKeypad from './demoKeypad.js';
import demoLaserPointerNode from './demoLaserPointerNode.js';
import demoLineArrowNode from './demoLineArrowNode.js';
import demoMeasuringTapeNode from './demoMeasuringTapeNode.js';
import demoNumberDisplay from './demoNumberDisplay.js';
import demoPaperAirplaneNode from './demoPaperAirplaneNode.js';
import demoParametricSpringNode from './demoParametricSpringNode.js';
import demoProbeNode from './demoProbeNode.js';
import demoRichDragListeners from './demoRichDragListeners.js';
import demoRichText from './demoRichText.js';
import demoRulerNode from './demoRulerNode.js';
import demoScientificNotationNode from './demoScientificNotationNode.js';
import demoSpectrumNode from './demoSpectrumNode.js';
import demoSpinningIndicatorNode from './demoSpinningIndicatorNode.js';
import demoSprites from './demoSprites.js';
import demoStarNode from './demoStarNode.js';
import demoStopwatchNode from './demoStopwatchNode.js';
import demoThermometerNode from './demoThermometerNode.js';
import demoTimeControlNode from './demoTimeControlNode.js';
import demoWireNode from './demoWireNode.js';
let ComponentsScreenView = class ComponentsScreenView extends DemosScreenView {
    constructor(options){
        // To add a demo, add an entry here of type DemoItemData.
        const demos = [
            {
                label: 'ArrowNode',
                createNode: demoArrowNode
            },
            {
                label: 'BeakerNode',
                createNode: demoBeakerNode
            },
            {
                label: 'BicyclePumpNode',
                createNode: demoBicyclePumpNode
            },
            {
                label: 'BracketNode',
                createNode: demoBracketNode
            },
            {
                label: 'CapacitorNode',
                createNode: demoCapacitorNode
            },
            {
                label: 'ComboBoxDisplay',
                createNode: demoComboBoxDisplay
            },
            {
                label: 'ConductivityTesterNode',
                createNode: demoConductivityTesterNode
            },
            {
                label: 'Drawer',
                createNode: demoDrawer
            },
            {
                label: 'EyeDropperNode',
                createNode: demoEyeDropperNode
            },
            {
                label: 'FaucetNode',
                createNode: demoFaucetNode
            },
            {
                label: 'FormulaNode',
                createNode: demoFormulaNode
            },
            {
                label: 'GaugeNode',
                createNode: demoGaugeNode
            },
            {
                label: 'GrabDragInteraction',
                createNode: demoGrabDragInteraction
            },
            {
                label: 'HandleNode',
                createNode: demoHandleNode
            },
            {
                label: 'HeaterCoolerNode',
                createNode: demoHeaterCoolerNode
            },
            {
                label: 'Keypad',
                createNode: demoKeypad
            },
            {
                label: 'LaserPointerNode',
                createNode: demoLaserPointerNode
            },
            {
                label: 'LineArrowNode',
                createNode: demoLineArrowNode
            },
            {
                label: 'MeasuringTapeNode',
                createNode: demoMeasuringTapeNode
            },
            {
                label: 'NumberDisplay',
                createNode: demoNumberDisplay
            },
            {
                label: 'PaperAirplaneNode',
                createNode: demoPaperAirplaneNode
            },
            {
                label: 'ParametricSpringNode',
                createNode: demoParametricSpringNode
            },
            {
                label: 'ProbeNode',
                createNode: demoProbeNode
            },
            {
                label: 'RichDragListeners',
                createNode: demoRichDragListeners
            },
            {
                label: 'RichText',
                createNode: demoRichText
            },
            {
                label: 'RulerNode',
                createNode: demoRulerNode
            },
            {
                label: 'ScientificNotationNode',
                createNode: demoScientificNotationNode
            },
            {
                label: 'SpectrumNode',
                createNode: demoSpectrumNode
            },
            {
                label: 'SpinningIndicatorNode',
                createNode: demoSpinningIndicatorNode
            },
            {
                label: 'Sprites',
                createNode: demoSprites
            },
            {
                label: 'StarNode',
                createNode: demoStarNode
            },
            {
                label: 'StopwatchNode',
                createNode: demoStopwatchNode
            },
            {
                label: 'ThermometerNode',
                createNode: demoThermometerNode
            },
            {
                label: 'TimeControlNode',
                createNode: demoTimeControlNode
            },
            {
                label: 'WireNode',
                createNode: demoWireNode
            }
        ];
        super(demos, options);
    }
};
export { ComponentsScreenView as default };
sceneryPhet.register('ComponentsScreenView', ComponentsScreenView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvQ29tcG9uZW50c1NjcmVlblZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVtb25zdHJhdGlvbiBvZiBtaXNjIHNjZW5lcnktcGhldCBVSSBjb21wb25lbnRzLlxuICogRGVtb3MgYXJlIHNlbGVjdGVkIGZyb20gYSBjb21ibyBib3gsIGFuZCBhcmUgaW5zdGFudGlhdGVkIG9uIGRlbWFuZC5cbiAqIFVzZSB0aGUgJ2NvbXBvbmVudCcgcXVlcnkgcGFyYW1ldGVyIHRvIHNldCB0aGUgaW5pdGlhbCBzZWxlY3Rpb24gb2YgdGhlIGNvbWJvIGJveC5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xuaW1wb3J0IERlbW9zU2NyZWVuVmlldywgeyBEZW1vc1NjcmVlblZpZXdPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2RlbW8vRGVtb3NTY3JlZW5WaWV3LmpzJztcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuLi8uLi9zY2VuZXJ5UGhldC5qcyc7XG5pbXBvcnQgZGVtb0Fycm93Tm9kZSBmcm9tICcuL2RlbW9BcnJvd05vZGUuanMnO1xuaW1wb3J0IGRlbW9CZWFrZXJOb2RlIGZyb20gJy4vZGVtb0JlYWtlck5vZGUuanMnO1xuaW1wb3J0IGRlbW9CaWN5Y2xlUHVtcE5vZGUgZnJvbSAnLi9kZW1vQmljeWNsZVB1bXBOb2RlLmpzJztcbmltcG9ydCBkZW1vQnJhY2tldE5vZGUgZnJvbSAnLi9kZW1vQnJhY2tldE5vZGUuanMnO1xuaW1wb3J0IGRlbW9DYXBhY2l0b3JOb2RlIGZyb20gJy4vZGVtb0NhcGFjaXRvck5vZGUuanMnO1xuaW1wb3J0IGRlbW9Db21ib0JveERpc3BsYXkgZnJvbSAnLi9kZW1vQ29tYm9Cb3hEaXNwbGF5LmpzJztcbmltcG9ydCBkZW1vQ29uZHVjdGl2aXR5VGVzdGVyTm9kZSBmcm9tICcuL2RlbW9Db25kdWN0aXZpdHlUZXN0ZXJOb2RlLmpzJztcbmltcG9ydCBkZW1vRHJhd2VyIGZyb20gJy4vZGVtb0RyYXdlci5qcyc7XG5pbXBvcnQgZGVtb0V5ZURyb3BwZXJOb2RlIGZyb20gJy4vZGVtb0V5ZURyb3BwZXJOb2RlLmpzJztcbmltcG9ydCBkZW1vRmF1Y2V0Tm9kZSBmcm9tICcuL2RlbW9GYXVjZXROb2RlLmpzJztcbmltcG9ydCBkZW1vRm9ybXVsYU5vZGUgZnJvbSAnLi9kZW1vRm9ybXVsYU5vZGUuanMnO1xuaW1wb3J0IGRlbW9HYXVnZU5vZGUgZnJvbSAnLi9kZW1vR2F1Z2VOb2RlLmpzJztcbmltcG9ydCBkZW1vR3JhYkRyYWdJbnRlcmFjdGlvbiBmcm9tICcuL2RlbW9HcmFiRHJhZ0ludGVyYWN0aW9uLmpzJztcbmltcG9ydCBkZW1vSGFuZGxlTm9kZSBmcm9tICcuL2RlbW9IYW5kbGVOb2RlLmpzJztcbmltcG9ydCBkZW1vSGVhdGVyQ29vbGVyTm9kZSBmcm9tICcuL2RlbW9IZWF0ZXJDb29sZXJOb2RlLmpzJztcbmltcG9ydCBkZW1vS2V5cGFkIGZyb20gJy4vZGVtb0tleXBhZC5qcyc7XG5pbXBvcnQgZGVtb0xhc2VyUG9pbnRlck5vZGUgZnJvbSAnLi9kZW1vTGFzZXJQb2ludGVyTm9kZS5qcyc7XG5pbXBvcnQgZGVtb0xpbmVBcnJvd05vZGUgZnJvbSAnLi9kZW1vTGluZUFycm93Tm9kZS5qcyc7XG5pbXBvcnQgZGVtb01lYXN1cmluZ1RhcGVOb2RlIGZyb20gJy4vZGVtb01lYXN1cmluZ1RhcGVOb2RlLmpzJztcbmltcG9ydCBkZW1vTnVtYmVyRGlzcGxheSBmcm9tICcuL2RlbW9OdW1iZXJEaXNwbGF5LmpzJztcbmltcG9ydCBkZW1vUGFwZXJBaXJwbGFuZU5vZGUgZnJvbSAnLi9kZW1vUGFwZXJBaXJwbGFuZU5vZGUuanMnO1xuaW1wb3J0IGRlbW9QYXJhbWV0cmljU3ByaW5nTm9kZSBmcm9tICcuL2RlbW9QYXJhbWV0cmljU3ByaW5nTm9kZS5qcyc7XG5pbXBvcnQgZGVtb1Byb2JlTm9kZSBmcm9tICcuL2RlbW9Qcm9iZU5vZGUuanMnO1xuaW1wb3J0IGRlbW9SaWNoRHJhZ0xpc3RlbmVycyBmcm9tICcuL2RlbW9SaWNoRHJhZ0xpc3RlbmVycy5qcyc7XG5pbXBvcnQgZGVtb1JpY2hUZXh0IGZyb20gJy4vZGVtb1JpY2hUZXh0LmpzJztcbmltcG9ydCBkZW1vUnVsZXJOb2RlIGZyb20gJy4vZGVtb1J1bGVyTm9kZS5qcyc7XG5pbXBvcnQgZGVtb1NjaWVudGlmaWNOb3RhdGlvbk5vZGUgZnJvbSAnLi9kZW1vU2NpZW50aWZpY05vdGF0aW9uTm9kZS5qcyc7XG5pbXBvcnQgZGVtb1NwZWN0cnVtTm9kZSBmcm9tICcuL2RlbW9TcGVjdHJ1bU5vZGUuanMnO1xuaW1wb3J0IGRlbW9TcGlubmluZ0luZGljYXRvck5vZGUgZnJvbSAnLi9kZW1vU3Bpbm5pbmdJbmRpY2F0b3JOb2RlLmpzJztcbmltcG9ydCBkZW1vU3ByaXRlcyBmcm9tICcuL2RlbW9TcHJpdGVzLmpzJztcbmltcG9ydCBkZW1vU3Rhck5vZGUgZnJvbSAnLi9kZW1vU3Rhck5vZGUuanMnO1xuaW1wb3J0IGRlbW9TdG9wd2F0Y2hOb2RlIGZyb20gJy4vZGVtb1N0b3B3YXRjaE5vZGUuanMnO1xuaW1wb3J0IGRlbW9UaGVybW9tZXRlck5vZGUgZnJvbSAnLi9kZW1vVGhlcm1vbWV0ZXJOb2RlLmpzJztcbmltcG9ydCBkZW1vVGltZUNvbnRyb2xOb2RlIGZyb20gJy4vZGVtb1RpbWVDb250cm9sTm9kZS5qcyc7XG5pbXBvcnQgZGVtb1dpcmVOb2RlIGZyb20gJy4vZGVtb1dpcmVOb2RlLmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XG50eXBlIENvbXBvbmVudHNTY3JlZW5WaWV3T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPERlbW9zU2NyZWVuVmlld09wdGlvbnMsICd0YW5kZW0nPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tcG9uZW50c1NjcmVlblZpZXcgZXh0ZW5kcyBEZW1vc1NjcmVlblZpZXcge1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggb3B0aW9uczogQ29tcG9uZW50c1NjcmVlblZpZXdPcHRpb25zICkge1xuXG4gICAgLy8gVG8gYWRkIGEgZGVtbywgYWRkIGFuIGVudHJ5IGhlcmUgb2YgdHlwZSBEZW1vSXRlbURhdGEuXG4gICAgY29uc3QgZGVtb3MgPSBbXG4gICAgICB7IGxhYmVsOiAnQXJyb3dOb2RlJywgY3JlYXRlTm9kZTogZGVtb0Fycm93Tm9kZSB9LFxuICAgICAgeyBsYWJlbDogJ0JlYWtlck5vZGUnLCBjcmVhdGVOb2RlOiBkZW1vQmVha2VyTm9kZSB9LFxuICAgICAgeyBsYWJlbDogJ0JpY3ljbGVQdW1wTm9kZScsIGNyZWF0ZU5vZGU6IGRlbW9CaWN5Y2xlUHVtcE5vZGUgfSxcbiAgICAgIHsgbGFiZWw6ICdCcmFja2V0Tm9kZScsIGNyZWF0ZU5vZGU6IGRlbW9CcmFja2V0Tm9kZSB9LFxuICAgICAgeyBsYWJlbDogJ0NhcGFjaXRvck5vZGUnLCBjcmVhdGVOb2RlOiBkZW1vQ2FwYWNpdG9yTm9kZSB9LFxuICAgICAgeyBsYWJlbDogJ0NvbWJvQm94RGlzcGxheScsIGNyZWF0ZU5vZGU6IGRlbW9Db21ib0JveERpc3BsYXkgfSxcbiAgICAgIHsgbGFiZWw6ICdDb25kdWN0aXZpdHlUZXN0ZXJOb2RlJywgY3JlYXRlTm9kZTogZGVtb0NvbmR1Y3Rpdml0eVRlc3Rlck5vZGUgfSxcbiAgICAgIHsgbGFiZWw6ICdEcmF3ZXInLCBjcmVhdGVOb2RlOiBkZW1vRHJhd2VyIH0sXG4gICAgICB7IGxhYmVsOiAnRXllRHJvcHBlck5vZGUnLCBjcmVhdGVOb2RlOiBkZW1vRXllRHJvcHBlck5vZGUgfSxcbiAgICAgIHsgbGFiZWw6ICdGYXVjZXROb2RlJywgY3JlYXRlTm9kZTogZGVtb0ZhdWNldE5vZGUgfSxcbiAgICAgIHsgbGFiZWw6ICdGb3JtdWxhTm9kZScsIGNyZWF0ZU5vZGU6IGRlbW9Gb3JtdWxhTm9kZSB9LFxuICAgICAgeyBsYWJlbDogJ0dhdWdlTm9kZScsIGNyZWF0ZU5vZGU6IGRlbW9HYXVnZU5vZGUgfSxcbiAgICAgIHsgbGFiZWw6ICdHcmFiRHJhZ0ludGVyYWN0aW9uJywgY3JlYXRlTm9kZTogZGVtb0dyYWJEcmFnSW50ZXJhY3Rpb24gfSxcbiAgICAgIHsgbGFiZWw6ICdIYW5kbGVOb2RlJywgY3JlYXRlTm9kZTogZGVtb0hhbmRsZU5vZGUgfSxcbiAgICAgIHsgbGFiZWw6ICdIZWF0ZXJDb29sZXJOb2RlJywgY3JlYXRlTm9kZTogZGVtb0hlYXRlckNvb2xlck5vZGUgfSxcbiAgICAgIHsgbGFiZWw6ICdLZXlwYWQnLCBjcmVhdGVOb2RlOiBkZW1vS2V5cGFkIH0sXG4gICAgICB7IGxhYmVsOiAnTGFzZXJQb2ludGVyTm9kZScsIGNyZWF0ZU5vZGU6IGRlbW9MYXNlclBvaW50ZXJOb2RlIH0sXG4gICAgICB7IGxhYmVsOiAnTGluZUFycm93Tm9kZScsIGNyZWF0ZU5vZGU6IGRlbW9MaW5lQXJyb3dOb2RlIH0sXG4gICAgICB7IGxhYmVsOiAnTWVhc3VyaW5nVGFwZU5vZGUnLCBjcmVhdGVOb2RlOiBkZW1vTWVhc3VyaW5nVGFwZU5vZGUgfSxcbiAgICAgIHsgbGFiZWw6ICdOdW1iZXJEaXNwbGF5JywgY3JlYXRlTm9kZTogZGVtb051bWJlckRpc3BsYXkgfSxcbiAgICAgIHsgbGFiZWw6ICdQYXBlckFpcnBsYW5lTm9kZScsIGNyZWF0ZU5vZGU6IGRlbW9QYXBlckFpcnBsYW5lTm9kZSB9LFxuICAgICAgeyBsYWJlbDogJ1BhcmFtZXRyaWNTcHJpbmdOb2RlJywgY3JlYXRlTm9kZTogZGVtb1BhcmFtZXRyaWNTcHJpbmdOb2RlIH0sXG4gICAgICB7IGxhYmVsOiAnUHJvYmVOb2RlJywgY3JlYXRlTm9kZTogZGVtb1Byb2JlTm9kZSB9LFxuICAgICAgeyBsYWJlbDogJ1JpY2hEcmFnTGlzdGVuZXJzJywgY3JlYXRlTm9kZTogZGVtb1JpY2hEcmFnTGlzdGVuZXJzIH0sXG4gICAgICB7IGxhYmVsOiAnUmljaFRleHQnLCBjcmVhdGVOb2RlOiBkZW1vUmljaFRleHQgfSxcbiAgICAgIHsgbGFiZWw6ICdSdWxlck5vZGUnLCBjcmVhdGVOb2RlOiBkZW1vUnVsZXJOb2RlIH0sXG4gICAgICB7IGxhYmVsOiAnU2NpZW50aWZpY05vdGF0aW9uTm9kZScsIGNyZWF0ZU5vZGU6IGRlbW9TY2llbnRpZmljTm90YXRpb25Ob2RlIH0sXG4gICAgICB7IGxhYmVsOiAnU3BlY3RydW1Ob2RlJywgY3JlYXRlTm9kZTogZGVtb1NwZWN0cnVtTm9kZSB9LFxuICAgICAgeyBsYWJlbDogJ1NwaW5uaW5nSW5kaWNhdG9yTm9kZScsIGNyZWF0ZU5vZGU6IGRlbW9TcGlubmluZ0luZGljYXRvck5vZGUgfSxcbiAgICAgIHsgbGFiZWw6ICdTcHJpdGVzJywgY3JlYXRlTm9kZTogZGVtb1Nwcml0ZXMgfSxcbiAgICAgIHsgbGFiZWw6ICdTdGFyTm9kZScsIGNyZWF0ZU5vZGU6IGRlbW9TdGFyTm9kZSB9LFxuICAgICAgeyBsYWJlbDogJ1N0b3B3YXRjaE5vZGUnLCBjcmVhdGVOb2RlOiBkZW1vU3RvcHdhdGNoTm9kZSB9LFxuICAgICAgeyBsYWJlbDogJ1RoZXJtb21ldGVyTm9kZScsIGNyZWF0ZU5vZGU6IGRlbW9UaGVybW9tZXRlck5vZGUgfSxcbiAgICAgIHsgbGFiZWw6ICdUaW1lQ29udHJvbE5vZGUnLCBjcmVhdGVOb2RlOiBkZW1vVGltZUNvbnRyb2xOb2RlIH0sXG4gICAgICB7IGxhYmVsOiAnV2lyZU5vZGUnLCBjcmVhdGVOb2RlOiBkZW1vV2lyZU5vZGUgfVxuICAgIF07XG5cbiAgICBzdXBlciggZGVtb3MsIG9wdGlvbnMgKTtcbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ0NvbXBvbmVudHNTY3JlZW5WaWV3JywgQ29tcG9uZW50c1NjcmVlblZpZXcgKTsiXSwibmFtZXMiOlsiRGVtb3NTY3JlZW5WaWV3Iiwic2NlbmVyeVBoZXQiLCJkZW1vQXJyb3dOb2RlIiwiZGVtb0JlYWtlck5vZGUiLCJkZW1vQmljeWNsZVB1bXBOb2RlIiwiZGVtb0JyYWNrZXROb2RlIiwiZGVtb0NhcGFjaXRvck5vZGUiLCJkZW1vQ29tYm9Cb3hEaXNwbGF5IiwiZGVtb0NvbmR1Y3Rpdml0eVRlc3Rlck5vZGUiLCJkZW1vRHJhd2VyIiwiZGVtb0V5ZURyb3BwZXJOb2RlIiwiZGVtb0ZhdWNldE5vZGUiLCJkZW1vRm9ybXVsYU5vZGUiLCJkZW1vR2F1Z2VOb2RlIiwiZGVtb0dyYWJEcmFnSW50ZXJhY3Rpb24iLCJkZW1vSGFuZGxlTm9kZSIsImRlbW9IZWF0ZXJDb29sZXJOb2RlIiwiZGVtb0tleXBhZCIsImRlbW9MYXNlclBvaW50ZXJOb2RlIiwiZGVtb0xpbmVBcnJvd05vZGUiLCJkZW1vTWVhc3VyaW5nVGFwZU5vZGUiLCJkZW1vTnVtYmVyRGlzcGxheSIsImRlbW9QYXBlckFpcnBsYW5lTm9kZSIsImRlbW9QYXJhbWV0cmljU3ByaW5nTm9kZSIsImRlbW9Qcm9iZU5vZGUiLCJkZW1vUmljaERyYWdMaXN0ZW5lcnMiLCJkZW1vUmljaFRleHQiLCJkZW1vUnVsZXJOb2RlIiwiZGVtb1NjaWVudGlmaWNOb3RhdGlvbk5vZGUiLCJkZW1vU3BlY3RydW1Ob2RlIiwiZGVtb1NwaW5uaW5nSW5kaWNhdG9yTm9kZSIsImRlbW9TcHJpdGVzIiwiZGVtb1N0YXJOb2RlIiwiZGVtb1N0b3B3YXRjaE5vZGUiLCJkZW1vVGhlcm1vbWV0ZXJOb2RlIiwiZGVtb1RpbWVDb250cm9sTm9kZSIsImRlbW9XaXJlTm9kZSIsIkNvbXBvbmVudHNTY3JlZW5WaWV3Iiwib3B0aW9ucyIsImRlbW9zIiwibGFiZWwiLCJjcmVhdGVOb2RlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7OztDQU9DLEdBSUQsT0FBT0EscUJBQWlELDZDQUE2QztBQUNyRyxPQUFPQyxpQkFBaUIsdUJBQXVCO0FBQy9DLE9BQU9DLG1CQUFtQixxQkFBcUI7QUFDL0MsT0FBT0Msb0JBQW9CLHNCQUFzQjtBQUNqRCxPQUFPQyx5QkFBeUIsMkJBQTJCO0FBQzNELE9BQU9DLHFCQUFxQix1QkFBdUI7QUFDbkQsT0FBT0MsdUJBQXVCLHlCQUF5QjtBQUN2RCxPQUFPQyx5QkFBeUIsMkJBQTJCO0FBQzNELE9BQU9DLGdDQUFnQyxrQ0FBa0M7QUFDekUsT0FBT0MsZ0JBQWdCLGtCQUFrQjtBQUN6QyxPQUFPQyx3QkFBd0IsMEJBQTBCO0FBQ3pELE9BQU9DLG9CQUFvQixzQkFBc0I7QUFDakQsT0FBT0MscUJBQXFCLHVCQUF1QjtBQUNuRCxPQUFPQyxtQkFBbUIscUJBQXFCO0FBQy9DLE9BQU9DLDZCQUE2QiwrQkFBK0I7QUFDbkUsT0FBT0Msb0JBQW9CLHNCQUFzQjtBQUNqRCxPQUFPQywwQkFBMEIsNEJBQTRCO0FBQzdELE9BQU9DLGdCQUFnQixrQkFBa0I7QUFDekMsT0FBT0MsMEJBQTBCLDRCQUE0QjtBQUM3RCxPQUFPQyx1QkFBdUIseUJBQXlCO0FBQ3ZELE9BQU9DLDJCQUEyQiw2QkFBNkI7QUFDL0QsT0FBT0MsdUJBQXVCLHlCQUF5QjtBQUN2RCxPQUFPQywyQkFBMkIsNkJBQTZCO0FBQy9ELE9BQU9DLDhCQUE4QixnQ0FBZ0M7QUFDckUsT0FBT0MsbUJBQW1CLHFCQUFxQjtBQUMvQyxPQUFPQywyQkFBMkIsNkJBQTZCO0FBQy9ELE9BQU9DLGtCQUFrQixvQkFBb0I7QUFDN0MsT0FBT0MsbUJBQW1CLHFCQUFxQjtBQUMvQyxPQUFPQyxnQ0FBZ0Msa0NBQWtDO0FBQ3pFLE9BQU9DLHNCQUFzQix3QkFBd0I7QUFDckQsT0FBT0MsK0JBQStCLGlDQUFpQztBQUN2RSxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBQzNDLE9BQU9DLGtCQUFrQixvQkFBb0I7QUFDN0MsT0FBT0MsdUJBQXVCLHlCQUF5QjtBQUN2RCxPQUFPQyx5QkFBeUIsMkJBQTJCO0FBQzNELE9BQU9DLHlCQUF5QiwyQkFBMkI7QUFDM0QsT0FBT0Msa0JBQWtCLG9CQUFvQjtBQUs5QixJQUFBLEFBQU1DLHVCQUFOLE1BQU1BLDZCQUE2QnJDO0lBRWhELFlBQW9Cc0MsT0FBb0MsQ0FBRztRQUV6RCx5REFBeUQ7UUFDekQsTUFBTUMsUUFBUTtZQUNaO2dCQUFFQyxPQUFPO2dCQUFhQyxZQUFZdkM7WUFBYztZQUNoRDtnQkFBRXNDLE9BQU87Z0JBQWNDLFlBQVl0QztZQUFlO1lBQ2xEO2dCQUFFcUMsT0FBTztnQkFBbUJDLFlBQVlyQztZQUFvQjtZQUM1RDtnQkFBRW9DLE9BQU87Z0JBQWVDLFlBQVlwQztZQUFnQjtZQUNwRDtnQkFBRW1DLE9BQU87Z0JBQWlCQyxZQUFZbkM7WUFBa0I7WUFDeEQ7Z0JBQUVrQyxPQUFPO2dCQUFtQkMsWUFBWWxDO1lBQW9CO1lBQzVEO2dCQUFFaUMsT0FBTztnQkFBMEJDLFlBQVlqQztZQUEyQjtZQUMxRTtnQkFBRWdDLE9BQU87Z0JBQVVDLFlBQVloQztZQUFXO1lBQzFDO2dCQUFFK0IsT0FBTztnQkFBa0JDLFlBQVkvQjtZQUFtQjtZQUMxRDtnQkFBRThCLE9BQU87Z0JBQWNDLFlBQVk5QjtZQUFlO1lBQ2xEO2dCQUFFNkIsT0FBTztnQkFBZUMsWUFBWTdCO1lBQWdCO1lBQ3BEO2dCQUFFNEIsT0FBTztnQkFBYUMsWUFBWTVCO1lBQWM7WUFDaEQ7Z0JBQUUyQixPQUFPO2dCQUF1QkMsWUFBWTNCO1lBQXdCO1lBQ3BFO2dCQUFFMEIsT0FBTztnQkFBY0MsWUFBWTFCO1lBQWU7WUFDbEQ7Z0JBQUV5QixPQUFPO2dCQUFvQkMsWUFBWXpCO1lBQXFCO1lBQzlEO2dCQUFFd0IsT0FBTztnQkFBVUMsWUFBWXhCO1lBQVc7WUFDMUM7Z0JBQUV1QixPQUFPO2dCQUFvQkMsWUFBWXZCO1lBQXFCO1lBQzlEO2dCQUFFc0IsT0FBTztnQkFBaUJDLFlBQVl0QjtZQUFrQjtZQUN4RDtnQkFBRXFCLE9BQU87Z0JBQXFCQyxZQUFZckI7WUFBc0I7WUFDaEU7Z0JBQUVvQixPQUFPO2dCQUFpQkMsWUFBWXBCO1lBQWtCO1lBQ3hEO2dCQUFFbUIsT0FBTztnQkFBcUJDLFlBQVluQjtZQUFzQjtZQUNoRTtnQkFBRWtCLE9BQU87Z0JBQXdCQyxZQUFZbEI7WUFBeUI7WUFDdEU7Z0JBQUVpQixPQUFPO2dCQUFhQyxZQUFZakI7WUFBYztZQUNoRDtnQkFBRWdCLE9BQU87Z0JBQXFCQyxZQUFZaEI7WUFBc0I7WUFDaEU7Z0JBQUVlLE9BQU87Z0JBQVlDLFlBQVlmO1lBQWE7WUFDOUM7Z0JBQUVjLE9BQU87Z0JBQWFDLFlBQVlkO1lBQWM7WUFDaEQ7Z0JBQUVhLE9BQU87Z0JBQTBCQyxZQUFZYjtZQUEyQjtZQUMxRTtnQkFBRVksT0FBTztnQkFBZ0JDLFlBQVlaO1lBQWlCO1lBQ3REO2dCQUFFVyxPQUFPO2dCQUF5QkMsWUFBWVg7WUFBMEI7WUFDeEU7Z0JBQUVVLE9BQU87Z0JBQVdDLFlBQVlWO1lBQVk7WUFDNUM7Z0JBQUVTLE9BQU87Z0JBQVlDLFlBQVlUO1lBQWE7WUFDOUM7Z0JBQUVRLE9BQU87Z0JBQWlCQyxZQUFZUjtZQUFrQjtZQUN4RDtnQkFBRU8sT0FBTztnQkFBbUJDLFlBQVlQO1lBQW9CO1lBQzVEO2dCQUFFTSxPQUFPO2dCQUFtQkMsWUFBWU47WUFBb0I7WUFDNUQ7Z0JBQUVLLE9BQU87Z0JBQVlDLFlBQVlMO1lBQWE7U0FDL0M7UUFFRCxLQUFLLENBQUVHLE9BQU9EO0lBQ2hCO0FBQ0Y7QUE3Q0EsU0FBcUJELGtDQTZDcEI7QUFFRHBDLFlBQVl5QyxRQUFRLENBQUUsd0JBQXdCTCJ9