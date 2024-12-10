// Copyright 2015-2024, University of Colorado Boulder
/**
 * Demo for ParametricSpringNode
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { HBox, Node, Rectangle, Text, VBox, VSeparator } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import ResetAllButton from '../../buttons/ResetAllButton.js';
import NumberControl from '../../NumberControl.js';
import ParametricSpringNode from '../../ParametricSpringNode.js';
import PhetFont from '../../PhetFont.js';
export default function demoParametricSpringNode(layoutBounds) {
    return new DemoNode(layoutBounds);
}
let DemoNode = class DemoNode extends Node {
    dispose() {
        this.disposeDemoNode();
        super.dispose();
    }
    constructor(layoutBounds){
        // A 200-unit vertical "wall", for comparison with the spring size
        const wallNode = new Rectangle(0, 0, 25, 200, {
            fill: 'rgb( 180, 180, 180 )',
            stroke: 'black',
            left: 20,
            centerY: 200
        });
        // Ranges for the various properties of ParametricSpringNode
        const ranges = {
            loopsRange: new RangeWithValue(4, 15, 10),
            radiusRange: new RangeWithValue(5, 70, 10),
            aspectRatioRange: new RangeWithValue(0.5, 10, 4),
            pointsPerLoopRange: new RangeWithValue(10, 100, 30),
            lineWidthRange: new RangeWithValue(1, 10, 3),
            phaseRange: new RangeWithValue(0, 2 * Math.PI, Math.PI),
            deltaPhaseRange: new RangeWithValue(0, 2 * Math.PI, Math.PI / 2),
            xScaleRange: new RangeWithValue(0.5, 11, 2.5)
        };
        // spring
        const springNode = new ParametricSpringNode({
            // initial values for Properties
            loops: ranges.loopsRange.defaultValue,
            radius: ranges.radiusRange.defaultValue,
            aspectRatio: ranges.aspectRatioRange.defaultValue,
            pointsPerLoop: ranges.pointsPerLoopRange.defaultValue,
            lineWidth: ranges.lineWidthRange.defaultValue,
            phase: ranges.phaseRange.defaultValue,
            deltaPhase: ranges.deltaPhaseRange.defaultValue,
            xScale: ranges.xScaleRange.defaultValue,
            // initial values for static fields
            frontColor: 'rgb( 150, 150, 255 )',
            middleColor: 'rgb( 0, 0, 255 )',
            backColor: 'rgb( 0, 0, 200 )',
            // use x,y exclusively for layout, because we're using boundsMethod:'none'
            x: wallNode.right,
            y: wallNode.centerY
        });
        // control panel, scaled to fit across the bottom
        const controlPanel = new ControlPanel(springNode, ranges);
        controlPanel.setScaleMagnitude(Math.min(1, layoutBounds.width / controlPanel.width));
        controlPanel.bottom = layoutBounds.bottom;
        controlPanel.centerX = layoutBounds.centerX;
        const resetAllButton = new ResetAllButton({
            listener: function() {
                springNode.reset();
            },
            right: layoutBounds.maxX - 15,
            bottom: controlPanel.top - 10
        });
        super({
            children: [
                springNode,
                wallNode,
                controlPanel,
                resetAllButton
            ]
        });
        this.disposeDemoNode = ()=>{
            wallNode.dispose();
            springNode.dispose();
            controlPanel.dispose();
            resetAllButton.dispose();
        };
    }
};
/**
 * Controls for experimenting with a ParametricSpring.
 * Sliders with 'black' thumbs are parameters that result in instantiation of Vector2s and Shapes.
 * Sliders with 'green' thumbs are parameters that result in mutation of Vector2s and Shapes.
 */ // strings - no need for i18n since this is a developer-only demo
const aspectRatioString = 'aspect ratio:';
const deltaPhaseString = 'delta phase:';
const lineWidthString = 'line width:';
const loopsString = 'loops:';
const phaseString = 'phase:';
const pointsPerLoopString = 'points per loop:';
const radiusString = 'radius:';
const xScaleString = 'x scale:';
const CONTROL_FONT = new PhetFont(18);
const TICK_LABEL_FONT = new PhetFont(14);
let ControlPanel = class ControlPanel extends Panel {
    constructor(springNode, providedOptions){
        const options = optionize()({
            // PanelOptions
            fill: 'rgb( 243, 243, 243 )',
            stroke: 'rgb( 125, 125, 125 )',
            xMargin: 20,
            yMargin: 10
        }, providedOptions);
        // controls, options tweaked empirically to match ranges
        const loopsControl = NumberControl.withMinMaxTicks(loopsString, springNode.loopsProperty, options.loopsRange, {
            delta: 1,
            titleNodeOptions: {
                font: CONTROL_FONT
            },
            numberDisplayOptions: {
                textOptions: {
                    font: CONTROL_FONT
                },
                decimalPlaces: 0
            },
            sliderOptions: {
                thumbFill: 'black',
                minorTickSpacing: 1
            }
        });
        const pointsPerLoopControl = NumberControl.withMinMaxTicks(pointsPerLoopString, springNode.pointsPerLoopProperty, options.pointsPerLoopRange, {
            delta: 1,
            titleNodeOptions: {
                font: CONTROL_FONT
            },
            numberDisplayOptions: {
                textOptions: {
                    font: CONTROL_FONT
                },
                decimalPlaces: 0
            },
            sliderOptions: {
                minorTickSpacing: 10,
                thumbFill: 'black'
            }
        });
        const radiusControl = NumberControl.withMinMaxTicks(radiusString, springNode.radiusProperty, options.radiusRange, {
            delta: 1,
            titleNodeOptions: {
                font: CONTROL_FONT
            },
            numberDisplayOptions: {
                textOptions: {
                    font: CONTROL_FONT
                },
                decimalPlaces: 0
            },
            sliderOptions: {
                minorTickSpacing: 5,
                thumbFill: 'green'
            }
        });
        const aspectRatioControl = NumberControl.withMinMaxTicks(aspectRatioString, springNode.aspectRatioProperty, options.aspectRatioRange, {
            delta: 0.1,
            titleNodeOptions: {
                font: CONTROL_FONT
            },
            numberDisplayOptions: {
                textOptions: {
                    font: CONTROL_FONT
                },
                decimalPlaces: 1
            },
            sliderOptions: {
                minorTickSpacing: 0.5,
                thumbFill: 'black'
            }
        });
        assert && assert(options.phaseRange.min === 0 && options.phaseRange.max === 2 * Math.PI);
        const phaseControl = new NumberControl(phaseString, springNode.phaseProperty, options.phaseRange, {
            delta: 0.1,
            titleNodeOptions: {
                font: CONTROL_FONT
            },
            numberDisplayOptions: {
                textOptions: {
                    font: CONTROL_FONT
                },
                decimalPlaces: 1
            },
            sliderOptions: {
                minorTickSpacing: 1,
                thumbFill: 'black',
                majorTicks: [
                    {
                        value: options.phaseRange.min,
                        label: new Text('0', {
                            font: TICK_LABEL_FONT
                        })
                    },
                    {
                        value: options.phaseRange.getCenter(),
                        label: new Text('\u03c0', {
                            font: TICK_LABEL_FONT
                        })
                    },
                    {
                        value: options.phaseRange.max,
                        label: new Text('2\u03c0', {
                            font: TICK_LABEL_FONT
                        })
                    }
                ]
            }
        });
        assert && assert(options.deltaPhaseRange.min === 0 && options.deltaPhaseRange.max === 2 * Math.PI);
        const deltaPhaseControl = new NumberControl(deltaPhaseString, springNode.deltaPhaseProperty, options.deltaPhaseRange, {
            delta: 0.1,
            titleNodeOptions: {
                font: CONTROL_FONT
            },
            numberDisplayOptions: {
                textOptions: {
                    font: CONTROL_FONT
                },
                decimalPlaces: 1
            },
            sliderOptions: {
                minorTickSpacing: 1,
                thumbFill: 'black',
                majorTicks: [
                    {
                        value: options.deltaPhaseRange.min,
                        label: new Text('0', {
                            font: TICK_LABEL_FONT
                        })
                    },
                    {
                        value: options.deltaPhaseRange.getCenter(),
                        label: new Text('\u03c0', {
                            font: TICK_LABEL_FONT
                        })
                    },
                    {
                        value: options.deltaPhaseRange.max,
                        label: new Text('2\u03c0', {
                            font: TICK_LABEL_FONT
                        })
                    }
                ]
            }
        });
        const lineWidthControl = NumberControl.withMinMaxTicks(lineWidthString, springNode.lineWidthProperty, options.lineWidthRange, {
            delta: 0.1,
            titleNodeOptions: {
                font: CONTROL_FONT
            },
            numberDisplayOptions: {
                textOptions: {
                    font: CONTROL_FONT
                },
                decimalPlaces: 1
            },
            sliderOptions: {
                minorTickSpacing: 1,
                thumbFill: 'green'
            }
        });
        const xScaleControl = NumberControl.withMinMaxTicks(xScaleString, springNode.xScaleProperty, options.xScaleRange, {
            delta: 0.1,
            titleNodeOptions: {
                font: CONTROL_FONT
            },
            numberDisplayOptions: {
                textOptions: {
                    font: CONTROL_FONT
                },
                decimalPlaces: 1
            },
            sliderOptions: {
                minorTickSpacing: 0.5,
                thumbFill: 'green'
            }
        });
        // layout
        const xSpacing = 25;
        const ySpacing = 30;
        const content = new HBox({
            children: [
                new VBox({
                    children: [
                        loopsControl,
                        pointsPerLoopControl
                    ],
                    spacing: ySpacing
                }),
                new VBox({
                    children: [
                        radiusControl,
                        aspectRatioControl
                    ],
                    spacing: ySpacing
                }),
                new VBox({
                    children: [
                        phaseControl,
                        deltaPhaseControl
                    ],
                    spacing: ySpacing
                }),
                new VSeparator({
                    stroke: 'rgb( 125, 125, 125 )'
                }),
                new VBox({
                    children: [
                        lineWidthControl,
                        xScaleControl
                    ],
                    spacing: ySpacing
                })
            ],
            spacing: xSpacing,
            align: 'top'
        });
        super(content, options);
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb1BhcmFtZXRyaWNTcHJpbmdOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERlbW8gZm9yIFBhcmFtZXRyaWNTcHJpbmdOb2RlXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcbmltcG9ydCBSYW5nZVdpdGhWYWx1ZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2VXaXRoVmFsdWUuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCB7IEhCb3gsIE5vZGUsIFJlY3RhbmdsZSwgVGV4dCwgVkJveCwgVlNlcGFyYXRvciB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgUGFuZWwsIHsgUGFuZWxPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcbmltcG9ydCBSZXNldEFsbEJ1dHRvbiBmcm9tICcuLi8uLi9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcbmltcG9ydCBOdW1iZXJDb250cm9sIGZyb20gJy4uLy4uL051bWJlckNvbnRyb2wuanMnO1xuaW1wb3J0IFBhcmFtZXRyaWNTcHJpbmdOb2RlIGZyb20gJy4uLy4uL1BhcmFtZXRyaWNTcHJpbmdOb2RlLmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi9QaGV0Rm9udC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9QYXJhbWV0cmljU3ByaW5nTm9kZSggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICk6IE5vZGUge1xuICByZXR1cm4gbmV3IERlbW9Ob2RlKCBsYXlvdXRCb3VuZHMgKTtcbn1cblxuY2xhc3MgRGVtb05vZGUgZXh0ZW5kcyBOb2RlIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VEZW1vTm9kZTogKCkgPT4gdm9pZDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGxheW91dEJvdW5kczogQm91bmRzMiApIHtcblxuICAgIC8vIEEgMjAwLXVuaXQgdmVydGljYWwgXCJ3YWxsXCIsIGZvciBjb21wYXJpc29uIHdpdGggdGhlIHNwcmluZyBzaXplXG4gICAgY29uc3Qgd2FsbE5vZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAyNSwgMjAwLCB7XG4gICAgICBmaWxsOiAncmdiKCAxODAsIDE4MCwgMTgwICknLFxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxuICAgICAgbGVmdDogMjAsXG4gICAgICBjZW50ZXJZOiAyMDBcbiAgICB9ICk7XG5cbiAgICAvLyBSYW5nZXMgZm9yIHRoZSB2YXJpb3VzIHByb3BlcnRpZXMgb2YgUGFyYW1ldHJpY1NwcmluZ05vZGVcbiAgICBjb25zdCByYW5nZXMgPSB7XG4gICAgICBsb29wc1JhbmdlOiBuZXcgUmFuZ2VXaXRoVmFsdWUoIDQsIDE1LCAxMCApLFxuICAgICAgcmFkaXVzUmFuZ2U6IG5ldyBSYW5nZVdpdGhWYWx1ZSggNSwgNzAsIDEwICksXG4gICAgICBhc3BlY3RSYXRpb1JhbmdlOiBuZXcgUmFuZ2VXaXRoVmFsdWUoIDAuNSwgMTAsIDQgKSxcbiAgICAgIHBvaW50c1Blckxvb3BSYW5nZTogbmV3IFJhbmdlV2l0aFZhbHVlKCAxMCwgMTAwLCAzMCApLFxuICAgICAgbGluZVdpZHRoUmFuZ2U6IG5ldyBSYW5nZVdpdGhWYWx1ZSggMSwgMTAsIDMgKSxcbiAgICAgIHBoYXNlUmFuZ2U6IG5ldyBSYW5nZVdpdGhWYWx1ZSggMCwgMiAqIE1hdGguUEksIE1hdGguUEkgKSwgLy8gcmFkaWFuc1xuICAgICAgZGVsdGFQaGFzZVJhbmdlOiBuZXcgUmFuZ2VXaXRoVmFsdWUoIDAsIDIgKiBNYXRoLlBJLCBNYXRoLlBJIC8gMiApLCAvLyByYWRpYW5zXG4gICAgICB4U2NhbGVSYW5nZTogbmV3IFJhbmdlV2l0aFZhbHVlKCAwLjUsIDExLCAyLjUgKVxuICAgIH07XG5cbiAgICAvLyBzcHJpbmdcbiAgICBjb25zdCBzcHJpbmdOb2RlID0gbmV3IFBhcmFtZXRyaWNTcHJpbmdOb2RlKCB7XG5cbiAgICAgIC8vIGluaXRpYWwgdmFsdWVzIGZvciBQcm9wZXJ0aWVzXG4gICAgICBsb29wczogcmFuZ2VzLmxvb3BzUmFuZ2UuZGVmYXVsdFZhbHVlLFxuICAgICAgcmFkaXVzOiByYW5nZXMucmFkaXVzUmFuZ2UuZGVmYXVsdFZhbHVlLFxuICAgICAgYXNwZWN0UmF0aW86IHJhbmdlcy5hc3BlY3RSYXRpb1JhbmdlLmRlZmF1bHRWYWx1ZSxcbiAgICAgIHBvaW50c1Blckxvb3A6IHJhbmdlcy5wb2ludHNQZXJMb29wUmFuZ2UuZGVmYXVsdFZhbHVlLFxuICAgICAgbGluZVdpZHRoOiByYW5nZXMubGluZVdpZHRoUmFuZ2UuZGVmYXVsdFZhbHVlLFxuICAgICAgcGhhc2U6IHJhbmdlcy5waGFzZVJhbmdlLmRlZmF1bHRWYWx1ZSxcbiAgICAgIGRlbHRhUGhhc2U6IHJhbmdlcy5kZWx0YVBoYXNlUmFuZ2UuZGVmYXVsdFZhbHVlLFxuICAgICAgeFNjYWxlOiByYW5nZXMueFNjYWxlUmFuZ2UuZGVmYXVsdFZhbHVlLFxuXG4gICAgICAvLyBpbml0aWFsIHZhbHVlcyBmb3Igc3RhdGljIGZpZWxkc1xuICAgICAgZnJvbnRDb2xvcjogJ3JnYiggMTUwLCAxNTAsIDI1NSApJyxcbiAgICAgIG1pZGRsZUNvbG9yOiAncmdiKCAwLCAwLCAyNTUgKScsXG4gICAgICBiYWNrQ29sb3I6ICdyZ2IoIDAsIDAsIDIwMCApJyxcblxuICAgICAgLy8gdXNlIHgseSBleGNsdXNpdmVseSBmb3IgbGF5b3V0LCBiZWNhdXNlIHdlJ3JlIHVzaW5nIGJvdW5kc01ldGhvZDonbm9uZSdcbiAgICAgIHg6IHdhbGxOb2RlLnJpZ2h0LFxuICAgICAgeTogd2FsbE5vZGUuY2VudGVyWVxuICAgIH0gKTtcblxuICAgIC8vIGNvbnRyb2wgcGFuZWwsIHNjYWxlZCB0byBmaXQgYWNyb3NzIHRoZSBib3R0b21cbiAgICBjb25zdCBjb250cm9sUGFuZWwgPSBuZXcgQ29udHJvbFBhbmVsKCBzcHJpbmdOb2RlLCByYW5nZXMgKTtcbiAgICBjb250cm9sUGFuZWwuc2V0U2NhbGVNYWduaXR1ZGUoIE1hdGgubWluKCAxLCBsYXlvdXRCb3VuZHMud2lkdGggLyBjb250cm9sUGFuZWwud2lkdGggKSApO1xuICAgIGNvbnRyb2xQYW5lbC5ib3R0b20gPSBsYXlvdXRCb3VuZHMuYm90dG9tO1xuICAgIGNvbnRyb2xQYW5lbC5jZW50ZXJYID0gbGF5b3V0Qm91bmRzLmNlbnRlclg7XG5cbiAgICBjb25zdCByZXNldEFsbEJ1dHRvbiA9IG5ldyBSZXNldEFsbEJ1dHRvbigge1xuICAgICAgbGlzdGVuZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzcHJpbmdOb2RlLnJlc2V0KCk7XG4gICAgICB9LFxuICAgICAgcmlnaHQ6IGxheW91dEJvdW5kcy5tYXhYIC0gMTUsXG4gICAgICBib3R0b206IGNvbnRyb2xQYW5lbC50b3AgLSAxMFxuICAgIH0gKTtcblxuICAgIHN1cGVyKCB7XG4gICAgICBjaGlsZHJlbjogWyBzcHJpbmdOb2RlLCB3YWxsTm9kZSwgY29udHJvbFBhbmVsLCByZXNldEFsbEJ1dHRvbiBdXG4gICAgfSApO1xuXG4gICAgdGhpcy5kaXNwb3NlRGVtb05vZGUgPSAoKSA9PiB7XG4gICAgICB3YWxsTm9kZS5kaXNwb3NlKCk7XG4gICAgICBzcHJpbmdOb2RlLmRpc3Bvc2UoKTtcbiAgICAgIGNvbnRyb2xQYW5lbC5kaXNwb3NlKCk7XG4gICAgICByZXNldEFsbEJ1dHRvbi5kaXNwb3NlKCk7XG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZURlbW9Ob2RlKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbi8qKlxuICogQ29udHJvbHMgZm9yIGV4cGVyaW1lbnRpbmcgd2l0aCBhIFBhcmFtZXRyaWNTcHJpbmcuXG4gKiBTbGlkZXJzIHdpdGggJ2JsYWNrJyB0aHVtYnMgYXJlIHBhcmFtZXRlcnMgdGhhdCByZXN1bHQgaW4gaW5zdGFudGlhdGlvbiBvZiBWZWN0b3IycyBhbmQgU2hhcGVzLlxuICogU2xpZGVycyB3aXRoICdncmVlbicgdGh1bWJzIGFyZSBwYXJhbWV0ZXJzIHRoYXQgcmVzdWx0IGluIG11dGF0aW9uIG9mIFZlY3RvcjJzIGFuZCBTaGFwZXMuXG4gKi9cblxuLy8gc3RyaW5ncyAtIG5vIG5lZWQgZm9yIGkxOG4gc2luY2UgdGhpcyBpcyBhIGRldmVsb3Blci1vbmx5IGRlbW9cbmNvbnN0IGFzcGVjdFJhdGlvU3RyaW5nID0gJ2FzcGVjdCByYXRpbzonO1xuY29uc3QgZGVsdGFQaGFzZVN0cmluZyA9ICdkZWx0YSBwaGFzZTonO1xuY29uc3QgbGluZVdpZHRoU3RyaW5nID0gJ2xpbmUgd2lkdGg6JztcbmNvbnN0IGxvb3BzU3RyaW5nID0gJ2xvb3BzOic7XG5jb25zdCBwaGFzZVN0cmluZyA9ICdwaGFzZTonO1xuY29uc3QgcG9pbnRzUGVyTG9vcFN0cmluZyA9ICdwb2ludHMgcGVyIGxvb3A6JztcbmNvbnN0IHJhZGl1c1N0cmluZyA9ICdyYWRpdXM6JztcbmNvbnN0IHhTY2FsZVN0cmluZyA9ICd4IHNjYWxlOic7XG5cbmNvbnN0IENPTlRST0xfRk9OVCA9IG5ldyBQaGV0Rm9udCggMTggKTtcbmNvbnN0IFRJQ0tfTEFCRUxfRk9OVCA9IG5ldyBQaGV0Rm9udCggMTQgKTtcblxudHlwZSBDb250cm9sUGFuZWxTZWxmT3B0aW9ucyA9IHtcblxuICAvLyByYW5nZXMgZm9yIGVhY2ggc3ByaW5nIHBhcmFtZXRlclxuICBsb29wc1JhbmdlOiBSYW5nZTtcbiAgcmFkaXVzUmFuZ2U6IFJhbmdlO1xuICBhc3BlY3RSYXRpb1JhbmdlOiBSYW5nZTtcbiAgcG9pbnRzUGVyTG9vcFJhbmdlOiBSYW5nZTtcbiAgbGluZVdpZHRoUmFuZ2U6IFJhbmdlO1xuICBwaGFzZVJhbmdlOiBSYW5nZTtcbiAgZGVsdGFQaGFzZVJhbmdlOiBSYW5nZTtcbiAgeFNjYWxlUmFuZ2U6IFJhbmdlO1xufTtcbmV4cG9ydCB0eXBlIENvbnRyb2xQYW5lbE9wdGlvbnMgPSBDb250cm9sUGFuZWxTZWxmT3B0aW9ucyAmIFBhbmVsT3B0aW9ucztcblxuY2xhc3MgQ29udHJvbFBhbmVsIGV4dGVuZHMgUGFuZWwge1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc3ByaW5nTm9kZTogUGFyYW1ldHJpY1NwcmluZ05vZGUsIHByb3ZpZGVkT3B0aW9uczogQ29udHJvbFBhbmVsT3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Q29udHJvbFBhbmVsT3B0aW9ucywgQ29udHJvbFBhbmVsU2VsZk9wdGlvbnMsIFBhbmVsT3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyBQYW5lbE9wdGlvbnNcbiAgICAgIGZpbGw6ICdyZ2IoIDI0MywgMjQzLCAyNDMgKScsXG4gICAgICBzdHJva2U6ICdyZ2IoIDEyNSwgMTI1LCAxMjUgKScsXG4gICAgICB4TWFyZ2luOiAyMCxcbiAgICAgIHlNYXJnaW46IDEwXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAvLyBjb250cm9scywgb3B0aW9ucyB0d2Vha2VkIGVtcGlyaWNhbGx5IHRvIG1hdGNoIHJhbmdlc1xuICAgIGNvbnN0IGxvb3BzQ29udHJvbCA9IE51bWJlckNvbnRyb2wud2l0aE1pbk1heFRpY2tzKCBsb29wc1N0cmluZywgc3ByaW5nTm9kZS5sb29wc1Byb3BlcnR5LCBvcHRpb25zLmxvb3BzUmFuZ2UsIHtcbiAgICAgIGRlbHRhOiAxLFxuICAgICAgdGl0bGVOb2RlT3B0aW9uczogeyBmb250OiBDT05UUk9MX0ZPTlQgfSxcbiAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XG4gICAgICAgIHRleHRPcHRpb25zOiB7XG4gICAgICAgICAgZm9udDogQ09OVFJPTF9GT05UXG4gICAgICAgIH0sXG4gICAgICAgIGRlY2ltYWxQbGFjZXM6IDBcbiAgICAgIH0sXG4gICAgICBzbGlkZXJPcHRpb25zOiB7XG4gICAgICAgIHRodW1iRmlsbDogJ2JsYWNrJyxcbiAgICAgICAgbWlub3JUaWNrU3BhY2luZzogMVxuICAgICAgfVxuICAgIH0gKTtcblxuICAgIGNvbnN0IHBvaW50c1Blckxvb3BDb250cm9sID0gTnVtYmVyQ29udHJvbC53aXRoTWluTWF4VGlja3MoIHBvaW50c1Blckxvb3BTdHJpbmcsIHNwcmluZ05vZGUucG9pbnRzUGVyTG9vcFByb3BlcnR5LFxuICAgICAgb3B0aW9ucy5wb2ludHNQZXJMb29wUmFuZ2UsIHtcbiAgICAgICAgZGVsdGE6IDEsXG4gICAgICAgIHRpdGxlTm9kZU9wdGlvbnM6IHsgZm9udDogQ09OVFJPTF9GT05UIH0sXG4gICAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XG4gICAgICAgICAgdGV4dE9wdGlvbnM6IHtcbiAgICAgICAgICAgIGZvbnQ6IENPTlRST0xfRk9OVFxuICAgICAgICAgIH0sXG4gICAgICAgICAgZGVjaW1hbFBsYWNlczogMFxuICAgICAgICB9LFxuICAgICAgICBzbGlkZXJPcHRpb25zOiB7XG4gICAgICAgICAgbWlub3JUaWNrU3BhY2luZzogMTAsXG4gICAgICAgICAgdGh1bWJGaWxsOiAnYmxhY2snXG4gICAgICAgIH1cbiAgICAgIH0gKTtcblxuICAgIGNvbnN0IHJhZGl1c0NvbnRyb2wgPSBOdW1iZXJDb250cm9sLndpdGhNaW5NYXhUaWNrcyggcmFkaXVzU3RyaW5nLCBzcHJpbmdOb2RlLnJhZGl1c1Byb3BlcnR5LCBvcHRpb25zLnJhZGl1c1JhbmdlLCB7XG4gICAgICBkZWx0YTogMSxcbiAgICAgIHRpdGxlTm9kZU9wdGlvbnM6IHsgZm9udDogQ09OVFJPTF9GT05UIH0sXG4gICAgICBudW1iZXJEaXNwbGF5T3B0aW9uczoge1xuICAgICAgICB0ZXh0T3B0aW9uczoge1xuICAgICAgICAgIGZvbnQ6IENPTlRST0xfRk9OVFxuICAgICAgICB9LFxuICAgICAgICBkZWNpbWFsUGxhY2VzOiAwXG4gICAgICB9LFxuICAgICAgc2xpZGVyT3B0aW9uczoge1xuICAgICAgICBtaW5vclRpY2tTcGFjaW5nOiA1LFxuICAgICAgICB0aHVtYkZpbGw6ICdncmVlbidcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICBjb25zdCBhc3BlY3RSYXRpb0NvbnRyb2wgPSBOdW1iZXJDb250cm9sLndpdGhNaW5NYXhUaWNrcyggYXNwZWN0UmF0aW9TdHJpbmcsIHNwcmluZ05vZGUuYXNwZWN0UmF0aW9Qcm9wZXJ0eSxcbiAgICAgIG9wdGlvbnMuYXNwZWN0UmF0aW9SYW5nZSwge1xuICAgICAgICBkZWx0YTogMC4xLFxuICAgICAgICB0aXRsZU5vZGVPcHRpb25zOiB7IGZvbnQ6IENPTlRST0xfRk9OVCB9LFxuICAgICAgICBudW1iZXJEaXNwbGF5T3B0aW9uczoge1xuICAgICAgICAgIHRleHRPcHRpb25zOiB7XG4gICAgICAgICAgICBmb250OiBDT05UUk9MX0ZPTlRcbiAgICAgICAgICB9LFxuICAgICAgICAgIGRlY2ltYWxQbGFjZXM6IDFcbiAgICAgICAgfSxcbiAgICAgICAgc2xpZGVyT3B0aW9uczoge1xuICAgICAgICAgIG1pbm9yVGlja1NwYWNpbmc6IDAuNSxcbiAgICAgICAgICB0aHVtYkZpbGw6ICdibGFjaydcbiAgICAgICAgfVxuICAgICAgfSApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5waGFzZVJhbmdlLm1pbiA9PT0gMCAmJiBvcHRpb25zLnBoYXNlUmFuZ2UubWF4ID09PSAyICogTWF0aC5QSSApO1xuICAgIGNvbnN0IHBoYXNlQ29udHJvbCA9IG5ldyBOdW1iZXJDb250cm9sKCBwaGFzZVN0cmluZywgc3ByaW5nTm9kZS5waGFzZVByb3BlcnR5LCBvcHRpb25zLnBoYXNlUmFuZ2UsIHtcbiAgICAgIGRlbHRhOiAwLjEsXG4gICAgICB0aXRsZU5vZGVPcHRpb25zOiB7IGZvbnQ6IENPTlRST0xfRk9OVCB9LFxuICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcbiAgICAgICAgdGV4dE9wdGlvbnM6IHtcbiAgICAgICAgICBmb250OiBDT05UUk9MX0ZPTlRcbiAgICAgICAgfSxcbiAgICAgICAgZGVjaW1hbFBsYWNlczogMVxuICAgICAgfSxcbiAgICAgIHNsaWRlck9wdGlvbnM6IHtcbiAgICAgICAgbWlub3JUaWNrU3BhY2luZzogMSxcbiAgICAgICAgdGh1bWJGaWxsOiAnYmxhY2snLFxuICAgICAgICBtYWpvclRpY2tzOiBbXG4gICAgICAgICAgeyB2YWx1ZTogb3B0aW9ucy5waGFzZVJhbmdlLm1pbiwgbGFiZWw6IG5ldyBUZXh0KCAnMCcsIHsgZm9udDogVElDS19MQUJFTF9GT05UIH0gKSB9LFxuICAgICAgICAgIHsgdmFsdWU6IG9wdGlvbnMucGhhc2VSYW5nZS5nZXRDZW50ZXIoKSwgbGFiZWw6IG5ldyBUZXh0KCAnXFx1MDNjMCcsIHsgZm9udDogVElDS19MQUJFTF9GT05UIH0gKSB9LFxuICAgICAgICAgIHsgdmFsdWU6IG9wdGlvbnMucGhhc2VSYW5nZS5tYXgsIGxhYmVsOiBuZXcgVGV4dCggJzJcXHUwM2MwJywgeyBmb250OiBUSUNLX0xBQkVMX0ZPTlQgfSApIH1cbiAgICAgICAgXVxuICAgICAgfVxuICAgIH0gKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuZGVsdGFQaGFzZVJhbmdlLm1pbiA9PT0gMCAmJiBvcHRpb25zLmRlbHRhUGhhc2VSYW5nZS5tYXggPT09IDIgKiBNYXRoLlBJICk7XG4gICAgY29uc3QgZGVsdGFQaGFzZUNvbnRyb2wgPSBuZXcgTnVtYmVyQ29udHJvbCggZGVsdGFQaGFzZVN0cmluZywgc3ByaW5nTm9kZS5kZWx0YVBoYXNlUHJvcGVydHksIG9wdGlvbnMuZGVsdGFQaGFzZVJhbmdlLCB7XG4gICAgICBkZWx0YTogMC4xLFxuICAgICAgdGl0bGVOb2RlT3B0aW9uczogeyBmb250OiBDT05UUk9MX0ZPTlQgfSxcbiAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XG4gICAgICAgIHRleHRPcHRpb25zOiB7XG4gICAgICAgICAgZm9udDogQ09OVFJPTF9GT05UXG4gICAgICAgIH0sXG4gICAgICAgIGRlY2ltYWxQbGFjZXM6IDFcbiAgICAgIH0sXG4gICAgICBzbGlkZXJPcHRpb25zOiB7XG4gICAgICAgIG1pbm9yVGlja1NwYWNpbmc6IDEsXG4gICAgICAgIHRodW1iRmlsbDogJ2JsYWNrJyxcbiAgICAgICAgbWFqb3JUaWNrczogW1xuICAgICAgICAgIHsgdmFsdWU6IG9wdGlvbnMuZGVsdGFQaGFzZVJhbmdlLm1pbiwgbGFiZWw6IG5ldyBUZXh0KCAnMCcsIHsgZm9udDogVElDS19MQUJFTF9GT05UIH0gKSB9LFxuICAgICAgICAgIHsgdmFsdWU6IG9wdGlvbnMuZGVsdGFQaGFzZVJhbmdlLmdldENlbnRlcigpLCBsYWJlbDogbmV3IFRleHQoICdcXHUwM2MwJywgeyBmb250OiBUSUNLX0xBQkVMX0ZPTlQgfSApIH0sXG4gICAgICAgICAgeyB2YWx1ZTogb3B0aW9ucy5kZWx0YVBoYXNlUmFuZ2UubWF4LCBsYWJlbDogbmV3IFRleHQoICcyXFx1MDNjMCcsIHsgZm9udDogVElDS19MQUJFTF9GT05UIH0gKSB9XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICBjb25zdCBsaW5lV2lkdGhDb250cm9sID0gTnVtYmVyQ29udHJvbC53aXRoTWluTWF4VGlja3MoIGxpbmVXaWR0aFN0cmluZywgc3ByaW5nTm9kZS5saW5lV2lkdGhQcm9wZXJ0eSwgb3B0aW9ucy5saW5lV2lkdGhSYW5nZSwge1xuICAgICAgZGVsdGE6IDAuMSxcbiAgICAgIHRpdGxlTm9kZU9wdGlvbnM6IHsgZm9udDogQ09OVFJPTF9GT05UIH0sXG4gICAgICBudW1iZXJEaXNwbGF5T3B0aW9uczoge1xuICAgICAgICB0ZXh0T3B0aW9uczoge1xuICAgICAgICAgIGZvbnQ6IENPTlRST0xfRk9OVFxuICAgICAgICB9LFxuICAgICAgICBkZWNpbWFsUGxhY2VzOiAxXG4gICAgICB9LFxuICAgICAgc2xpZGVyT3B0aW9uczoge1xuICAgICAgICBtaW5vclRpY2tTcGFjaW5nOiAxLFxuICAgICAgICB0aHVtYkZpbGw6ICdncmVlbidcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICBjb25zdCB4U2NhbGVDb250cm9sID0gTnVtYmVyQ29udHJvbC53aXRoTWluTWF4VGlja3MoIHhTY2FsZVN0cmluZywgc3ByaW5nTm9kZS54U2NhbGVQcm9wZXJ0eSwgb3B0aW9ucy54U2NhbGVSYW5nZSwge1xuICAgICAgZGVsdGE6IDAuMSxcbiAgICAgIHRpdGxlTm9kZU9wdGlvbnM6IHsgZm9udDogQ09OVFJPTF9GT05UIH0sXG4gICAgICBudW1iZXJEaXNwbGF5T3B0aW9uczoge1xuICAgICAgICB0ZXh0T3B0aW9uczoge1xuICAgICAgICAgIGZvbnQ6IENPTlRST0xfRk9OVFxuICAgICAgICB9LFxuICAgICAgICBkZWNpbWFsUGxhY2VzOiAxXG4gICAgICB9LFxuICAgICAgc2xpZGVyT3B0aW9uczoge1xuICAgICAgICBtaW5vclRpY2tTcGFjaW5nOiAwLjUsXG4gICAgICAgIHRodW1iRmlsbDogJ2dyZWVuJ1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIC8vIGxheW91dFxuICAgIGNvbnN0IHhTcGFjaW5nID0gMjU7XG4gICAgY29uc3QgeVNwYWNpbmcgPSAzMDtcbiAgICBjb25zdCBjb250ZW50ID0gbmV3IEhCb3goIHtcbiAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgIG5ldyBWQm94KCB7IGNoaWxkcmVuOiBbIGxvb3BzQ29udHJvbCwgcG9pbnRzUGVyTG9vcENvbnRyb2wgXSwgc3BhY2luZzogeVNwYWNpbmcgfSApLFxuICAgICAgICBuZXcgVkJveCggeyBjaGlsZHJlbjogWyByYWRpdXNDb250cm9sLCBhc3BlY3RSYXRpb0NvbnRyb2wgXSwgc3BhY2luZzogeVNwYWNpbmcgfSApLFxuICAgICAgICBuZXcgVkJveCggeyBjaGlsZHJlbjogWyBwaGFzZUNvbnRyb2wsIGRlbHRhUGhhc2VDb250cm9sIF0sIHNwYWNpbmc6IHlTcGFjaW5nIH0gKSxcbiAgICAgICAgbmV3IFZTZXBhcmF0b3IoIHsgc3Ryb2tlOiAncmdiKCAxMjUsIDEyNSwgMTI1ICknIH0gKSxcbiAgICAgICAgbmV3IFZCb3goIHsgY2hpbGRyZW46IFsgbGluZVdpZHRoQ29udHJvbCwgeFNjYWxlQ29udHJvbCBdLCBzcGFjaW5nOiB5U3BhY2luZyB9IClcbiAgICAgIF0sXG4gICAgICBzcGFjaW5nOiB4U3BhY2luZyxcbiAgICAgIGFsaWduOiAndG9wJ1xuICAgIH0gKTtcblxuICAgIHN1cGVyKCBjb250ZW50LCBvcHRpb25zICk7XG4gIH1cbn0iXSwibmFtZXMiOlsiUmFuZ2VXaXRoVmFsdWUiLCJvcHRpb25pemUiLCJIQm94IiwiTm9kZSIsIlJlY3RhbmdsZSIsIlRleHQiLCJWQm94IiwiVlNlcGFyYXRvciIsIlBhbmVsIiwiUmVzZXRBbGxCdXR0b24iLCJOdW1iZXJDb250cm9sIiwiUGFyYW1ldHJpY1NwcmluZ05vZGUiLCJQaGV0Rm9udCIsImRlbW9QYXJhbWV0cmljU3ByaW5nTm9kZSIsImxheW91dEJvdW5kcyIsIkRlbW9Ob2RlIiwiZGlzcG9zZSIsImRpc3Bvc2VEZW1vTm9kZSIsIndhbGxOb2RlIiwiZmlsbCIsInN0cm9rZSIsImxlZnQiLCJjZW50ZXJZIiwicmFuZ2VzIiwibG9vcHNSYW5nZSIsInJhZGl1c1JhbmdlIiwiYXNwZWN0UmF0aW9SYW5nZSIsInBvaW50c1Blckxvb3BSYW5nZSIsImxpbmVXaWR0aFJhbmdlIiwicGhhc2VSYW5nZSIsIk1hdGgiLCJQSSIsImRlbHRhUGhhc2VSYW5nZSIsInhTY2FsZVJhbmdlIiwic3ByaW5nTm9kZSIsImxvb3BzIiwiZGVmYXVsdFZhbHVlIiwicmFkaXVzIiwiYXNwZWN0UmF0aW8iLCJwb2ludHNQZXJMb29wIiwibGluZVdpZHRoIiwicGhhc2UiLCJkZWx0YVBoYXNlIiwieFNjYWxlIiwiZnJvbnRDb2xvciIsIm1pZGRsZUNvbG9yIiwiYmFja0NvbG9yIiwieCIsInJpZ2h0IiwieSIsImNvbnRyb2xQYW5lbCIsIkNvbnRyb2xQYW5lbCIsInNldFNjYWxlTWFnbml0dWRlIiwibWluIiwid2lkdGgiLCJib3R0b20iLCJjZW50ZXJYIiwicmVzZXRBbGxCdXR0b24iLCJsaXN0ZW5lciIsInJlc2V0IiwibWF4WCIsInRvcCIsImNoaWxkcmVuIiwiYXNwZWN0UmF0aW9TdHJpbmciLCJkZWx0YVBoYXNlU3RyaW5nIiwibGluZVdpZHRoU3RyaW5nIiwibG9vcHNTdHJpbmciLCJwaGFzZVN0cmluZyIsInBvaW50c1Blckxvb3BTdHJpbmciLCJyYWRpdXNTdHJpbmciLCJ4U2NhbGVTdHJpbmciLCJDT05UUk9MX0ZPTlQiLCJUSUNLX0xBQkVMX0ZPTlQiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwieE1hcmdpbiIsInlNYXJnaW4iLCJsb29wc0NvbnRyb2wiLCJ3aXRoTWluTWF4VGlja3MiLCJsb29wc1Byb3BlcnR5IiwiZGVsdGEiLCJ0aXRsZU5vZGVPcHRpb25zIiwiZm9udCIsIm51bWJlckRpc3BsYXlPcHRpb25zIiwidGV4dE9wdGlvbnMiLCJkZWNpbWFsUGxhY2VzIiwic2xpZGVyT3B0aW9ucyIsInRodW1iRmlsbCIsIm1pbm9yVGlja1NwYWNpbmciLCJwb2ludHNQZXJMb29wQ29udHJvbCIsInBvaW50c1Blckxvb3BQcm9wZXJ0eSIsInJhZGl1c0NvbnRyb2wiLCJyYWRpdXNQcm9wZXJ0eSIsImFzcGVjdFJhdGlvQ29udHJvbCIsImFzcGVjdFJhdGlvUHJvcGVydHkiLCJhc3NlcnQiLCJtYXgiLCJwaGFzZUNvbnRyb2wiLCJwaGFzZVByb3BlcnR5IiwibWFqb3JUaWNrcyIsInZhbHVlIiwibGFiZWwiLCJnZXRDZW50ZXIiLCJkZWx0YVBoYXNlQ29udHJvbCIsImRlbHRhUGhhc2VQcm9wZXJ0eSIsImxpbmVXaWR0aENvbnRyb2wiLCJsaW5lV2lkdGhQcm9wZXJ0eSIsInhTY2FsZUNvbnRyb2wiLCJ4U2NhbGVQcm9wZXJ0eSIsInhTcGFjaW5nIiwieVNwYWNpbmciLCJjb250ZW50Iiwic3BhY2luZyIsImFsaWduIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUlELE9BQU9BLG9CQUFvQix1Q0FBdUM7QUFDbEUsT0FBT0MsZUFBZSx3Q0FBd0M7QUFDOUQsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFVBQVUsUUFBUSxvQ0FBb0M7QUFDbEcsT0FBT0MsV0FBNkIsOEJBQThCO0FBQ2xFLE9BQU9DLG9CQUFvQixrQ0FBa0M7QUFDN0QsT0FBT0MsbUJBQW1CLHlCQUF5QjtBQUNuRCxPQUFPQywwQkFBMEIsZ0NBQWdDO0FBQ2pFLE9BQU9DLGNBQWMsb0JBQW9CO0FBRXpDLGVBQWUsU0FBU0MseUJBQTBCQyxZQUFxQjtJQUNyRSxPQUFPLElBQUlDLFNBQVVEO0FBQ3ZCO0FBRUEsSUFBQSxBQUFNQyxXQUFOLE1BQU1BLGlCQUFpQlo7SUEyRUxhLFVBQWdCO1FBQzlCLElBQUksQ0FBQ0MsZUFBZTtRQUNwQixLQUFLLENBQUNEO0lBQ1I7SUExRUEsWUFBb0JGLFlBQXFCLENBQUc7UUFFMUMsa0VBQWtFO1FBQ2xFLE1BQU1JLFdBQVcsSUFBSWQsVUFBVyxHQUFHLEdBQUcsSUFBSSxLQUFLO1lBQzdDZSxNQUFNO1lBQ05DLFFBQVE7WUFDUkMsTUFBTTtZQUNOQyxTQUFTO1FBQ1g7UUFFQSw0REFBNEQ7UUFDNUQsTUFBTUMsU0FBUztZQUNiQyxZQUFZLElBQUl4QixlQUFnQixHQUFHLElBQUk7WUFDdkN5QixhQUFhLElBQUl6QixlQUFnQixHQUFHLElBQUk7WUFDeEMwQixrQkFB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