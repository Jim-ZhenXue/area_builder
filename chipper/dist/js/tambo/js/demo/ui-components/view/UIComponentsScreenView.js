// Copyright 2018-2024, University of Colorado Boulder
/**
 * UIComponentsScreenView is a view for a screen that demonstrates views and sounds for common User Interface
 * components.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */ import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import Property from '../../../../../axon/js/Property.js';
import Range from '../../../../../dot/js/Range.js';
import ResetAllButton from '../../../../../scenery-phet/js/buttons/ResetAllButton.js';
import NumberControl from '../../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import TimeControlNode from '../../../../../scenery-phet/js/TimeControlNode.js';
import { Image, Text, VBox } from '../../../../../scenery/js/imports.js';
import ABSwitch from '../../../../../sun/js/ABSwitch.js';
import AccordionBox from '../../../../../sun/js/AccordionBox.js';
import AquaRadioButtonGroup from '../../../../../sun/js/AquaRadioButtonGroup.js';
import BooleanRectangularToggleButton from '../../../../../sun/js/buttons/BooleanRectangularToggleButton.js';
import RectangularPushButton from '../../../../../sun/js/buttons/RectangularPushButton.js';
import Checkbox from '../../../../../sun/js/Checkbox.js';
import ComboBox from '../../../../../sun/js/ComboBox.js';
import DemosScreenView from '../../../../../sun/js/demo/DemosScreenView.js';
import NumberPicker from '../../../../../sun/js/NumberPicker.js';
import OnOffSwitch from '../../../../../sun/js/OnOffSwitch.js';
import accordion_png from '../../../../images/accordion_png.js';
import nullSoundPlayer from '../../../nullSoundPlayer.js';
import sharedSoundPlayers from '../../../sharedSoundPlayers.js';
import tambo from '../../../tambo.js';
import SliderSoundTestNode from './SliderSoundTestNode.js';
// constants
const LABEL_FONT = new PhetFont(20);
let UIComponentsScreenView = class UIComponentsScreenView extends DemosScreenView {
    constructor(model){
        const demos = [
            {
                label: 'ABSwitch',
                createNode: (layoutBounds)=>new VBox({
                        children: [
                            new Text('Default Sounds:', {
                                font: LABEL_FONT
                            }),
                            new ABSwitch(model.abSwitch1Property, false, new Text('Tastes Great', {
                                font: LABEL_FONT
                            }), true, new Text('Less Filling', {
                                font: LABEL_FONT
                            }), {
                                center: layoutBounds.center
                            }),
                            new Text('Custom Sounds:', {
                                font: LABEL_FONT
                            }),
                            new ABSwitch(model.abSwitch2Property, false, new Text('Heads', {
                                font: LABEL_FONT
                            }), true, new Text('Tails', {
                                font: LABEL_FONT
                            }), {
                                center: layoutBounds.center,
                                toggleSwitchOptions: {
                                    switchToLeftSoundPlayer: sharedSoundPlayers.get('grab'),
                                    switchToRightSoundPlayer: sharedSoundPlayers.get('release')
                                }
                            }),
                            new Text('No Sounds:', {
                                font: LABEL_FONT
                            }),
                            new ABSwitch(model.abSwitch3Property, false, new Text('Shhhh', {
                                font: LABEL_FONT
                            }), true, new Text('Quiet', {
                                font: LABEL_FONT
                            }), {
                                center: layoutBounds.center,
                                toggleSwitchOptions: {
                                    switchToLeftSoundPlayer: nullSoundPlayer,
                                    switchToRightSoundPlayer: nullSoundPlayer
                                }
                            })
                        ],
                        spacing: 30,
                        center: layoutBounds.center
                    })
            },
            {
                label: 'OnOffSwitch',
                createNode: (layoutBounds)=>new VBox({
                        children: [
                            new Text('On Off Switch:', {
                                font: LABEL_FONT
                            }),
                            new OnOffSwitch(model.abSwitch1Property, {
                                center: layoutBounds.center
                            })
                        ],
                        spacing: 30,
                        center: layoutBounds.center
                    })
            },
            {
                label: 'PushButton',
                createNode: (layoutBounds)=>new RectangularPushButton({
                        content: new Text('You\'re Pushing It.', {
                            font: LABEL_FONT
                        }),
                        center: layoutBounds.center
                    })
            },
            {
                label: 'Checkbox',
                createNode: (layoutBounds)=>new Checkbox(new BooleanProperty(false), new Text('Check it Out', {
                        font: LABEL_FONT
                    }), {
                        center: layoutBounds.center
                    })
            },
            {
                label: 'AquaRadioButtonGroup',
                createNode: (layoutBounds)=>{
                    const radioButtonItems = [
                        {
                            createNode: (tandem)=>new Text('One Thing', {
                                    font: LABEL_FONT
                                }),
                            value: 0
                        },
                        {
                            createNode: (tandem)=>new Text('Another Thing', {
                                    font: LABEL_FONT
                                }),
                            value: 1
                        },
                        {
                            createNode: (tandem)=>new Text('An Entirely Different Thing', {
                                    font: LABEL_FONT
                                }),
                            value: 2
                        }
                    ];
                    return new AquaRadioButtonGroup(new NumberProperty(0), radioButtonItems, {
                        orientation: 'vertical',
                        align: 'left',
                        spacing: 10,
                        center: layoutBounds.center
                    });
                }
            },
            {
                label: 'TimeControlNode',
                createNode: (layoutBounds)=>new TimeControlNode(new BooleanProperty(true), {
                        center: layoutBounds.center,
                        playPauseStepButtonOptions: {
                            includeStepBackwardButton: true
                        }
                    })
            },
            {
                label: 'ResetAllButton',
                createNode: (layoutBounds)=>new ResetAllButton({
                        center: layoutBounds.center
                    })
            },
            {
                label: 'ComboBox',
                createNode: (layoutBounds)=>new ComboBox(new NumberProperty(0), [
                        {
                            value: 0,
                            createNode: ()=>new Text('Rainbows', {
                                    font: LABEL_FONT
                                })
                        },
                        {
                            value: 1,
                            createNode: ()=>new Text('Unicorns', {
                                    font: LABEL_FONT
                                })
                        },
                        {
                            value: 2,
                            createNode: ()=>new Text('Butterflies', {
                                    font: LABEL_FONT
                                })
                        }
                    ], this, {
                        center: layoutBounds.center
                    })
            },
            {
                label: 'BooleanRectangularToggleButton',
                createNode: (layoutBounds)=>new BooleanRectangularToggleButton(new BooleanProperty(true), new Text('Yep', {
                        font: LABEL_FONT
                    }), new Text('Nope', {
                        font: LABEL_FONT
                    }), {
                        baseColor: '#B3FFEC',
                        center: layoutBounds.center
                    })
            },
            {
                label: 'AccordionBox',
                createNode: (layoutBounds)=>new AccordionBox(new Image(accordion_png, {
                        maxWidth: 200
                    }), {
                        titleNode: new Text('Accordion Box', {
                            font: LABEL_FONT
                        }),
                        expandedProperty: new BooleanProperty(false),
                        contentXMargin: 30,
                        contentYMargin: 20,
                        contentYSpacing: 20,
                        center: layoutBounds.center
                    })
            },
            {
                label: 'Sliders',
                createNode: (layoutBounds)=>new SliderSoundTestNode(LABEL_FONT, layoutBounds.center)
            },
            {
                label: 'NumberControl',
                createNode: (layoutBounds)=>new VBox({
                        children: [
                            new NumberControl('How much you want?', new NumberProperty(0), new Range(0, 10), {
                                delta: 2
                            }),
                            // This is an example of a number control that has a delta value that leads to thresholds in the sound
                            // player that are not all equally sized.  See https://github.com/phetsims/sun/issues/697.
                            new NumberControl('How much you want (asymmetric)?', new NumberProperty(0), new Range(0, 100), {
                                delta: 22
                            })
                        ],
                        spacing: 20,
                        center: layoutBounds.center
                    })
            },
            {
                label: 'NumberPicker',
                createNode: (layoutBounds)=>new VBox({
                        children: [
                            new NumberPicker(new NumberProperty(0), new Property(new Range(0, 4)))
                        ],
                        spacing: 20,
                        center: layoutBounds.center
                    })
            }
        ];
        super(demos);
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
tambo.register('UIComponentsScreenView', UIComponentsScreenView);
export default UIComponentsScreenView;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL2RlbW8vdWktY29tcG9uZW50cy92aWV3L1VJQ29tcG9uZW50c1NjcmVlblZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVUlDb21wb25lbnRzU2NyZWVuVmlldyBpcyBhIHZpZXcgZm9yIGEgc2NyZWVuIHRoYXQgZGVtb25zdHJhdGVzIHZpZXdzIGFuZCBzb3VuZHMgZm9yIGNvbW1vbiBVc2VyIEludGVyZmFjZVxuICogY29tcG9uZW50cy5cbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgUmVzZXRBbGxCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvUmVzZXRBbGxCdXR0b24uanMnO1xuaW1wb3J0IE51bWJlckNvbnRyb2wgZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL051bWJlckNvbnRyb2wuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgVGltZUNvbnRyb2xOb2RlIGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9UaW1lQ29udHJvbE5vZGUuanMnO1xuaW1wb3J0IHsgSW1hZ2UsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEFCU3dpdGNoIGZyb20gJy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9BQlN3aXRjaC5qcyc7XG5pbXBvcnQgQWNjb3JkaW9uQm94IGZyb20gJy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9BY2NvcmRpb25Cb3guanMnO1xuaW1wb3J0IEFxdWFSYWRpb0J1dHRvbkdyb3VwIGZyb20gJy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9BcXVhUmFkaW9CdXR0b25Hcm91cC5qcyc7XG5pbXBvcnQgQm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL0Jvb2xlYW5SZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbi5qcyc7XG5pbXBvcnQgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JlY3Rhbmd1bGFyUHVzaEJ1dHRvbi5qcyc7XG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vLi4vLi4vLi4vLi4vc3VuL2pzL0NoZWNrYm94LmpzJztcbmltcG9ydCBDb21ib0JveCBmcm9tICcuLi8uLi8uLi8uLi8uLi9zdW4vanMvQ29tYm9Cb3guanMnO1xuaW1wb3J0IERlbW9zU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi8uLi8uLi9zdW4vanMvZGVtby9EZW1vc1NjcmVlblZpZXcuanMnO1xuaW1wb3J0IE51bWJlclBpY2tlciBmcm9tICcuLi8uLi8uLi8uLi8uLi9zdW4vanMvTnVtYmVyUGlja2VyLmpzJztcbmltcG9ydCBPbk9mZlN3aXRjaCBmcm9tICcuLi8uLi8uLi8uLi8uLi9zdW4vanMvT25PZmZTd2l0Y2guanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBhY2NvcmRpb25fcG5nIGZyb20gJy4uLy4uLy4uLy4uL2ltYWdlcy9hY2NvcmRpb25fcG5nLmpzJztcbmltcG9ydCBudWxsU291bmRQbGF5ZXIgZnJvbSAnLi4vLi4vLi4vbnVsbFNvdW5kUGxheWVyLmpzJztcbmltcG9ydCBzaGFyZWRTb3VuZFBsYXllcnMgZnJvbSAnLi4vLi4vLi4vc2hhcmVkU291bmRQbGF5ZXJzLmpzJztcbmltcG9ydCB0YW1ibyBmcm9tICcuLi8uLi8uLi90YW1iby5qcyc7XG5pbXBvcnQgVUlDb21wb25lbnRzTW9kZWwgZnJvbSAnLi4vbW9kZWwvVUlDb21wb25lbnRzTW9kZWwuanMnO1xuaW1wb3J0IFNsaWRlclNvdW5kVGVzdE5vZGUgZnJvbSAnLi9TbGlkZXJTb3VuZFRlc3ROb2RlLmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBMQUJFTF9GT05UID0gbmV3IFBoZXRGb250KCAyMCApO1xuXG5jbGFzcyBVSUNvbXBvbmVudHNTY3JlZW5WaWV3IGV4dGVuZHMgRGVtb3NTY3JlZW5WaWV3IHtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1vZGVsOiBVSUNvbXBvbmVudHNNb2RlbCApIHtcblxuICAgIGNvbnN0IGRlbW9zID0gW1xuICAgICAge1xuICAgICAgICBsYWJlbDogJ0FCU3dpdGNoJyxcbiAgICAgICAgY3JlYXRlTm9kZTogKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKSA9PiBuZXcgVkJveCgge1xuICAgICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICBuZXcgVGV4dCggJ0RlZmF1bHQgU291bmRzOicsIHsgZm9udDogTEFCRUxfRk9OVCB9ICksXG4gICAgICAgICAgICBuZXcgQUJTd2l0Y2goXG4gICAgICAgICAgICAgIG1vZGVsLmFiU3dpdGNoMVByb3BlcnR5LFxuICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgbmV3IFRleHQoICdUYXN0ZXMgR3JlYXQnLCB7IGZvbnQ6IExBQkVMX0ZPTlQgfSApLFxuICAgICAgICAgICAgICB0cnVlLFxuICAgICAgICAgICAgICBuZXcgVGV4dCggJ0xlc3MgRmlsbGluZycsIHsgZm9udDogTEFCRUxfRk9OVCB9ICksXG4gICAgICAgICAgICAgIHsgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyIH1cbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBuZXcgVGV4dCggJ0N1c3RvbSBTb3VuZHM6JywgeyBmb250OiBMQUJFTF9GT05UIH0gKSxcbiAgICAgICAgICAgIG5ldyBBQlN3aXRjaChcbiAgICAgICAgICAgICAgbW9kZWwuYWJTd2l0Y2gyUHJvcGVydHksXG4gICAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgICBuZXcgVGV4dCggJ0hlYWRzJywgeyBmb250OiBMQUJFTF9GT05UIH0gKSxcbiAgICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgICAgbmV3IFRleHQoICdUYWlscycsIHsgZm9udDogTEFCRUxfRk9OVCB9ICksXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXIsXG4gICAgICAgICAgICAgICAgdG9nZ2xlU3dpdGNoT3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgc3dpdGNoVG9MZWZ0U291bmRQbGF5ZXI6IHNoYXJlZFNvdW5kUGxheWVycy5nZXQoICdncmFiJyApLFxuICAgICAgICAgICAgICAgICAgc3dpdGNoVG9SaWdodFNvdW5kUGxheWVyOiBzaGFyZWRTb3VuZFBsYXllcnMuZ2V0KCAncmVsZWFzZScgKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIG5ldyBUZXh0KCAnTm8gU291bmRzOicsIHsgZm9udDogTEFCRUxfRk9OVCB9ICksXG4gICAgICAgICAgICBuZXcgQUJTd2l0Y2goXG4gICAgICAgICAgICAgIG1vZGVsLmFiU3dpdGNoM1Byb3BlcnR5LFxuICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgbmV3IFRleHQoICdTaGhoaCcsIHsgZm9udDogTEFCRUxfRk9OVCB9ICksXG4gICAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICAgIG5ldyBUZXh0KCAnUXVpZXQnLCB7IGZvbnQ6IExBQkVMX0ZPTlQgfSApLFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyLFxuICAgICAgICAgICAgICAgIHRvZ2dsZVN3aXRjaE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgIHN3aXRjaFRvTGVmdFNvdW5kUGxheWVyOiBudWxsU291bmRQbGF5ZXIsXG4gICAgICAgICAgICAgICAgICBzd2l0Y2hUb1JpZ2h0U291bmRQbGF5ZXI6IG51bGxTb3VuZFBsYXllclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKVxuICAgICAgICAgIF0sXG4gICAgICAgICAgc3BhY2luZzogMzAsXG4gICAgICAgICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyXG4gICAgICAgIH0gKVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdPbk9mZlN3aXRjaCcsXG4gICAgICAgIGNyZWF0ZU5vZGU6ICggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICkgPT4gbmV3IFZCb3goIHtcbiAgICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgICAgbmV3IFRleHQoICdPbiBPZmYgU3dpdGNoOicsIHsgZm9udDogTEFCRUxfRk9OVCB9ICksXG4gICAgICAgICAgICBuZXcgT25PZmZTd2l0Y2goXG4gICAgICAgICAgICAgIG1vZGVsLmFiU3dpdGNoMVByb3BlcnR5LFxuICAgICAgICAgICAgICB7IGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlciB9XG4gICAgICAgICAgICApXG4gICAgICAgICAgXSxcbiAgICAgICAgICBzcGFjaW5nOiAzMCxcbiAgICAgICAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXJcbiAgICAgICAgfSApXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ1B1c2hCdXR0b24nLFxuICAgICAgICBjcmVhdGVOb2RlOiAoIGxheW91dEJvdW5kczogQm91bmRzMiApID0+IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcbiAgICAgICAgICBjb250ZW50OiBuZXcgVGV4dCggJ1lvdVxcJ3JlIFB1c2hpbmcgSXQuJywgeyBmb250OiBMQUJFTF9GT05UIH0gKSxcbiAgICAgICAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXJcbiAgICAgICAgfSApXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ0NoZWNrYm94JyxcbiAgICAgICAgY3JlYXRlTm9kZTogKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKSA9PiBuZXcgQ2hlY2tib3goIG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICksIG5ldyBUZXh0KCAnQ2hlY2sgaXQgT3V0JywgeyBmb250OiBMQUJFTF9GT05UIH0gKSwge1xuICAgICAgICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlclxuICAgICAgICB9IClcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnQXF1YVJhZGlvQnV0dG9uR3JvdXAnLFxuICAgICAgICBjcmVhdGVOb2RlOiAoIGxheW91dEJvdW5kczogQm91bmRzMiApID0+IHtcbiAgICAgICAgICBjb25zdCByYWRpb0J1dHRvbkl0ZW1zID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjcmVhdGVOb2RlOiAoIHRhbmRlbTogVGFuZGVtICkgPT4gbmV3IFRleHQoICdPbmUgVGhpbmcnLCB7IGZvbnQ6IExBQkVMX0ZPTlQgfSApLFxuICAgICAgICAgICAgICB2YWx1ZTogMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgY3JlYXRlTm9kZTogKCB0YW5kZW06IFRhbmRlbSApID0+IG5ldyBUZXh0KCAnQW5vdGhlciBUaGluZycsIHsgZm9udDogTEFCRUxfRk9OVCB9ICksXG4gICAgICAgICAgICAgIHZhbHVlOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjcmVhdGVOb2RlOiAoIHRhbmRlbTogVGFuZGVtICkgPT4gbmV3IFRleHQoICdBbiBFbnRpcmVseSBEaWZmZXJlbnQgVGhpbmcnLCB7IGZvbnQ6IExBQkVMX0ZPTlQgfSApLFxuICAgICAgICAgICAgICB2YWx1ZTogMlxuICAgICAgICAgICAgfVxuICAgICAgICAgIF07XG4gICAgICAgICAgcmV0dXJuIG5ldyBBcXVhUmFkaW9CdXR0b25Hcm91cChcbiAgICAgICAgICAgIG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApLFxuICAgICAgICAgICAgcmFkaW9CdXR0b25JdGVtcyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgb3JpZW50YXRpb246ICd2ZXJ0aWNhbCcsXG4gICAgICAgICAgICAgIGFsaWduOiAnbGVmdCcsXG4gICAgICAgICAgICAgIHNwYWNpbmc6IDEwLFxuICAgICAgICAgICAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ1RpbWVDb250cm9sTm9kZScsXG4gICAgICAgIGNyZWF0ZU5vZGU6ICggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICkgPT4gbmV3IFRpbWVDb250cm9sTm9kZShcbiAgICAgICAgICBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICksXG4gICAgICAgICAge1xuICAgICAgICAgICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyLFxuICAgICAgICAgICAgcGxheVBhdXNlU3RlcEJ1dHRvbk9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgaW5jbHVkZVN0ZXBCYWNrd2FyZEJ1dHRvbjogdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdSZXNldEFsbEJ1dHRvbicsXG4gICAgICAgIGNyZWF0ZU5vZGU6ICggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICkgPT4gbmV3IFJlc2V0QWxsQnV0dG9uKCB7IGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlciB9IClcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnQ29tYm9Cb3gnLFxuICAgICAgICBjcmVhdGVOb2RlOiAoIGxheW91dEJvdW5kczogQm91bmRzMiApID0+IG5ldyBDb21ib0JveCggbmV3IE51bWJlclByb3BlcnR5KCAwICksIFtcbiAgICAgICAgICB7IHZhbHVlOiAwLCBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgVGV4dCggJ1JhaW5ib3dzJywgeyBmb250OiBMQUJFTF9GT05UIH0gKSB9LFxuICAgICAgICAgIHsgdmFsdWU6IDEsIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBUZXh0KCAnVW5pY29ybnMnLCB7IGZvbnQ6IExBQkVMX0ZPTlQgfSApIH0sXG4gICAgICAgICAgeyB2YWx1ZTogMiwgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFRleHQoICdCdXR0ZXJmbGllcycsIHsgZm9udDogTEFCRUxfRk9OVCB9ICkgfVxuICAgICAgICBdLCB0aGlzLCB7IGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlciB9IClcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnQm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uJyxcbiAgICAgICAgY3JlYXRlTm9kZTogKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKSA9PiBuZXcgQm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uKCBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICksIG5ldyBUZXh0KCAnWWVwJywgeyBmb250OiBMQUJFTF9GT05UIH0gKSwgbmV3IFRleHQoICdOb3BlJywgeyBmb250OiBMQUJFTF9GT05UIH0gKSwge1xuICAgICAgICAgIGJhc2VDb2xvcjogJyNCM0ZGRUMnLFxuICAgICAgICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlclxuICAgICAgICB9IClcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnQWNjb3JkaW9uQm94JyxcbiAgICAgICAgY3JlYXRlTm9kZTogKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKSA9PiBuZXcgQWNjb3JkaW9uQm94KFxuICAgICAgICAgIG5ldyBJbWFnZSggYWNjb3JkaW9uX3BuZywgeyBtYXhXaWR0aDogMjAwIH0gKSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0aXRsZU5vZGU6IG5ldyBUZXh0KCAnQWNjb3JkaW9uIEJveCcsIHsgZm9udDogTEFCRUxfRk9OVCB9ICksXG4gICAgICAgICAgICBleHBhbmRlZFByb3BlcnR5OiBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApLFxuICAgICAgICAgICAgY29udGVudFhNYXJnaW46IDMwLFxuICAgICAgICAgICAgY29udGVudFlNYXJnaW46IDIwLFxuICAgICAgICAgICAgY29udGVudFlTcGFjaW5nOiAyMCxcbiAgICAgICAgICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlclxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdTbGlkZXJzJyxcbiAgICAgICAgY3JlYXRlTm9kZTogKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKSA9PiBuZXcgU2xpZGVyU291bmRUZXN0Tm9kZSggTEFCRUxfRk9OVCwgbGF5b3V0Qm91bmRzLmNlbnRlciApXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ051bWJlckNvbnRyb2wnLFxuICAgICAgICBjcmVhdGVOb2RlOiAoIGxheW91dEJvdW5kczogQm91bmRzMiApID0+IG5ldyBWQm94KCB7XG4gICAgICAgICAgY2hpbGRyZW46IFtcblxuICAgICAgICAgICAgbmV3IE51bWJlckNvbnRyb2woICdIb3cgbXVjaCB5b3Ugd2FudD8nLCBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKSwgbmV3IFJhbmdlKCAwLCAxMCApLCB7IGRlbHRhOiAyIH0gKSxcblxuICAgICAgICAgICAgLy8gVGhpcyBpcyBhbiBleGFtcGxlIG9mIGEgbnVtYmVyIGNvbnRyb2wgdGhhdCBoYXMgYSBkZWx0YSB2YWx1ZSB0aGF0IGxlYWRzIHRvIHRocmVzaG9sZHMgaW4gdGhlIHNvdW5kXG4gICAgICAgICAgICAvLyBwbGF5ZXIgdGhhdCBhcmUgbm90IGFsbCBlcXVhbGx5IHNpemVkLiAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzY5Ny5cbiAgICAgICAgICAgIG5ldyBOdW1iZXJDb250cm9sKCAnSG93IG11Y2ggeW91IHdhbnQgKGFzeW1tZXRyaWMpPycsIG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApLCBuZXcgUmFuZ2UoIDAsIDEwMCApLCB7IGRlbHRhOiAyMiB9IClcbiAgICAgICAgICBdLFxuICAgICAgICAgIHNwYWNpbmc6IDIwLFxuICAgICAgICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlclxuICAgICAgICB9IClcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnTnVtYmVyUGlja2VyJyxcbiAgICAgICAgY3JlYXRlTm9kZTogKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKSA9PiBuZXcgVkJveCgge1xuICAgICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICBuZXcgTnVtYmVyUGlja2VyKCBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKSwgbmV3IFByb3BlcnR5PFJhbmdlPiggbmV3IFJhbmdlKCAwLCA0ICkgKSApXG4gICAgICAgICAgXSxcbiAgICAgICAgICBzcGFjaW5nOiAyMCxcbiAgICAgICAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXJcbiAgICAgICAgfSApXG4gICAgICB9XG4gICAgXTtcblxuICAgIHN1cGVyKCBkZW1vcyApO1xuXG4gICAgLy8gYWRkIHRoZSByZXNldCBhbGwgYnV0dG9uXG4gICAgY29uc3QgcmVzZXRBbGxCdXR0b24gPSBuZXcgUmVzZXRBbGxCdXR0b24oIHtcbiAgICAgIHJpZ2h0OiB0aGlzLmxheW91dEJvdW5kcy5tYXhYIC0gMjUsXG4gICAgICBib3R0b206IHRoaXMubGF5b3V0Qm91bmRzLm1heFkgLSAyNSxcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XG4gICAgICAgIG1vZGVsLnJlc2V0KCk7XG4gICAgICB9XG4gICAgfSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIHJlc2V0QWxsQnV0dG9uICk7XG4gIH1cbn1cblxudGFtYm8ucmVnaXN0ZXIoICdVSUNvbXBvbmVudHNTY3JlZW5WaWV3JywgVUlDb21wb25lbnRzU2NyZWVuVmlldyApO1xuZXhwb3J0IGRlZmF1bHQgVUlDb21wb25lbnRzU2NyZWVuVmlldzsiXSwibmFtZXMiOlsiQm9vbGVhblByb3BlcnR5IiwiTnVtYmVyUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlJhbmdlIiwiUmVzZXRBbGxCdXR0b24iLCJOdW1iZXJDb250cm9sIiwiUGhldEZvbnQiLCJUaW1lQ29udHJvbE5vZGUiLCJJbWFnZSIsIlRleHQiLCJWQm94IiwiQUJTd2l0Y2giLCJBY2NvcmRpb25Cb3giLCJBcXVhUmFkaW9CdXR0b25Hcm91cCIsIkJvb2xlYW5SZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbiIsIlJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiIsIkNoZWNrYm94IiwiQ29tYm9Cb3giLCJEZW1vc1NjcmVlblZpZXciLCJOdW1iZXJQaWNrZXIiLCJPbk9mZlN3aXRjaCIsImFjY29yZGlvbl9wbmciLCJudWxsU291bmRQbGF5ZXIiLCJzaGFyZWRTb3VuZFBsYXllcnMiLCJ0YW1ibyIsIlNsaWRlclNvdW5kVGVzdE5vZGUiLCJMQUJFTF9GT05UIiwiVUlDb21wb25lbnRzU2NyZWVuVmlldyIsIm1vZGVsIiwiZGVtb3MiLCJsYWJlbCIsImNyZWF0ZU5vZGUiLCJsYXlvdXRCb3VuZHMiLCJjaGlsZHJlbiIsImZvbnQiLCJhYlN3aXRjaDFQcm9wZXJ0eSIsImNlbnRlciIsImFiU3dpdGNoMlByb3BlcnR5IiwidG9nZ2xlU3dpdGNoT3B0aW9ucyIsInN3aXRjaFRvTGVmdFNvdW5kUGxheWVyIiwiZ2V0Iiwic3dpdGNoVG9SaWdodFNvdW5kUGxheWVyIiwiYWJTd2l0Y2gzUHJvcGVydHkiLCJzcGFjaW5nIiwiY29udGVudCIsInJhZGlvQnV0dG9uSXRlbXMiLCJ0YW5kZW0iLCJ2YWx1ZSIsIm9yaWVudGF0aW9uIiwiYWxpZ24iLCJwbGF5UGF1c2VTdGVwQnV0dG9uT3B0aW9ucyIsImluY2x1ZGVTdGVwQmFja3dhcmRCdXR0b24iLCJiYXNlQ29sb3IiLCJtYXhXaWR0aCIsInRpdGxlTm9kZSIsImV4cGFuZGVkUHJvcGVydHkiLCJjb250ZW50WE1hcmdpbiIsImNvbnRlbnRZTWFyZ2luIiwiY29udGVudFlTcGFjaW5nIiwiZGVsdGEiLCJyZXNldEFsbEJ1dHRvbiIsInJpZ2h0IiwibWF4WCIsImJvdHRvbSIsIm1heFkiLCJsaXN0ZW5lciIsInJlc2V0IiwiYWRkQ2hpbGQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EscUJBQXFCLDRDQUE0QztBQUN4RSxPQUFPQyxvQkFBb0IsMkNBQTJDO0FBQ3RFLE9BQU9DLGNBQWMscUNBQXFDO0FBRTFELE9BQU9DLFdBQVcsaUNBQWlDO0FBQ25ELE9BQU9DLG9CQUFvQiwyREFBMkQ7QUFDdEYsT0FBT0MsbUJBQW1CLGtEQUFrRDtBQUM1RSxPQUFPQyxjQUFjLDZDQUE2QztBQUNsRSxPQUFPQyxxQkFBcUIsb0RBQW9EO0FBQ2hGLFNBQVNDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsdUNBQXVDO0FBQ3pFLE9BQU9DLGNBQWMsb0NBQW9D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