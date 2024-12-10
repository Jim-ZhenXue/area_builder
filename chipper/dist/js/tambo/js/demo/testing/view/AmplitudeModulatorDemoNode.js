// Copyright 2020-2022, University of Colorado Boulder
/**
 * View portion of the demo and test harness for the AmplitudeModulator class.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */ import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import Range from '../../../../../dot/js/Range.js';
import optionize from '../../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { HBox, Text, VBox } from '../../../../../scenery/js/imports.js';
import AquaRadioButtonGroup from '../../../../../sun/js/AquaRadioButtonGroup.js';
import Checkbox from '../../../../../sun/js/Checkbox.js';
import HSlider from '../../../../../sun/js/HSlider.js';
import soundManager from '../../../soundManager.js';
import tambo from '../../../tambo.js';
import AmplitudeModulatorDemo from '../model/AmplitudeModulatorDemo.js';
// constants
const LABEL_FONT = new PhetFont(16);
let AmplitudeModulatorDemoNode = class AmplitudeModulatorDemoNode extends VBox {
    constructor(providedOptions){
        const soundSourceRadioButtonItems = [
            {
                createNode: (tandem)=>new Text('None', {
                        font: LABEL_FONT
                    }),
                value: 0
            },
            {
                createNode: (tandem)=>new Text('Sound 1', {
                        font: LABEL_FONT
                    }),
                value: 1
            },
            {
                createNode: (tandem)=>new Text('Sound 2', {
                        font: LABEL_FONT
                    }),
                value: 2
            },
            {
                createNode: (tandem)=>new Text('Sound 3', {
                        font: LABEL_FONT
                    }),
                value: 3
            }
        ];
        const sourceSoundIndexProperty = new NumberProperty(0);
        const soundIndexSelector = new AquaRadioButtonGroup(sourceSoundIndexProperty, soundSourceRadioButtonItems);
        const soundIndexSelectorVBox = new VBox({
            children: [
                new Text('Source Sound:', {
                    font: LABEL_FONT
                }),
                soundIndexSelector
            ],
            spacing: 5
        });
        // Create the amplitude modulator demo instance and add it to the sound manager.
        const amplitudeModulatorDemo = new AmplitudeModulatorDemo(sourceSoundIndexProperty);
        soundManager.addSoundGenerator(amplitudeModulatorDemo);
        // LFO enabled control
        const lfoEnabled = new Checkbox(amplitudeModulatorDemo.amplitudeModulator.myEnabledProperty, new Text('LFO Enabled', {
            font: LABEL_FONT
        }), {
            boxWidth: 16
        });
        // frequency control
        const frequencyControlHBox = new HBox({
            children: [
                new Text('Frequency: ', {
                    font: LABEL_FONT
                }),
                new HSlider(amplitudeModulatorDemo.amplitudeModulator.frequencyProperty, new Range(0.5, 20))
            ]
        });
        // depth control
        const depthControlHBox = new HBox({
            children: [
                new Text('Depth: ', {
                    font: LABEL_FONT
                }),
                new HSlider(amplitudeModulatorDemo.amplitudeModulator.depthProperty, new Range(0, 1))
            ]
        });
        // waveform type selector
        const waveformRadioButtonItems = [
            {
                createNode: (tandem)=>new Text('Sine', {
                        font: LABEL_FONT
                    }),
                value: 'sine'
            },
            {
                createNode: (tandem)=>new Text('Square', {
                        font: LABEL_FONT
                    }),
                value: 'square'
            },
            {
                createNode: (tandem)=>new Text('Triangle', {
                        font: LABEL_FONT
                    }),
                value: 'triangle'
            },
            {
                createNode: (tandem)=>new Text('Sawtooth', {
                        font: LABEL_FONT
                    }),
                value: 'sawtooth'
            }
        ];
        const waveformSelector = new AquaRadioButtonGroup(amplitudeModulatorDemo.amplitudeModulator.waveformProperty, waveformRadioButtonItems);
        const waveformSelectorVBox = new VBox({
            children: [
                new Text('Modulation Waveform:', {
                    font: LABEL_FONT
                }),
                waveformSelector
            ],
            spacing: 5
        });
        super(optionize()({
            children: [
                soundIndexSelectorVBox,
                lfoEnabled,
                frequencyControlHBox,
                depthControlHBox,
                waveformSelectorVBox
            ],
            spacing: 15,
            align: 'left'
        }, providedOptions));
    }
};
tambo.register('AmplitudeModulatorDemoNode', AmplitudeModulatorDemoNode);
export default AmplitudeModulatorDemoNode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL2RlbW8vdGVzdGluZy92aWV3L0FtcGxpdHVkZU1vZHVsYXRvckRlbW9Ob2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFZpZXcgcG9ydGlvbiBvZiB0aGUgZGVtbyBhbmQgdGVzdCBoYXJuZXNzIGZvciB0aGUgQW1wbGl0dWRlTW9kdWxhdG9yIGNsYXNzLlxuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xuaW1wb3J0IHsgSEJveCwgVGV4dCwgVkJveCwgVkJveE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEFxdWFSYWRpb0J1dHRvbkdyb3VwLCB7IEFxdWFSYWRpb0J1dHRvbkdyb3VwSXRlbSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9BcXVhUmFkaW9CdXR0b25Hcm91cC5qcyc7XG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vLi4vLi4vLi4vLi4vc3VuL2pzL0NoZWNrYm94LmpzJztcbmltcG9ydCBIU2xpZGVyIGZyb20gJy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9IU2xpZGVyLmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgc291bmRNYW5hZ2VyIGZyb20gJy4uLy4uLy4uL3NvdW5kTWFuYWdlci5qcyc7XG5pbXBvcnQgdGFtYm8gZnJvbSAnLi4vLi4vLi4vdGFtYm8uanMnO1xuaW1wb3J0IEFtcGxpdHVkZU1vZHVsYXRvckRlbW8gZnJvbSAnLi4vbW9kZWwvQW1wbGl0dWRlTW9kdWxhdG9yRGVtby5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xuZXhwb3J0IHR5cGUgQW1wbGl0dWRlTW9kdWxhdG9yRGVtb05vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBWQm94T3B0aW9ucztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBMQUJFTF9GT05UID0gbmV3IFBoZXRGb250KCAxNiApO1xuXG5jbGFzcyBBbXBsaXR1ZGVNb2R1bGF0b3JEZW1vTm9kZSBleHRlbmRzIFZCb3gge1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogQW1wbGl0dWRlTW9kdWxhdG9yRGVtb05vZGVPcHRpb25zICkge1xuXG4gICAgY29uc3Qgc291bmRTb3VyY2VSYWRpb0J1dHRvbkl0ZW1zID0gW1xuICAgICAge1xuICAgICAgICBjcmVhdGVOb2RlOiAoIHRhbmRlbTogVGFuZGVtICkgPT4gbmV3IFRleHQoICdOb25lJywgeyBmb250OiBMQUJFTF9GT05UIH0gKSxcbiAgICAgICAgdmFsdWU6IDBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGNyZWF0ZU5vZGU6ICggdGFuZGVtOiBUYW5kZW0gKSA9PiBuZXcgVGV4dCggJ1NvdW5kIDEnLCB7IGZvbnQ6IExBQkVMX0ZPTlQgfSApLFxuICAgICAgICB2YWx1ZTogMVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgY3JlYXRlTm9kZTogKCB0YW5kZW06IFRhbmRlbSApID0+IG5ldyBUZXh0KCAnU291bmQgMicsIHsgZm9udDogTEFCRUxfRk9OVCB9ICksXG4gICAgICAgIHZhbHVlOiAyXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBjcmVhdGVOb2RlOiAoIHRhbmRlbTogVGFuZGVtICkgPT4gbmV3IFRleHQoICdTb3VuZCAzJywgeyBmb250OiBMQUJFTF9GT05UIH0gKSxcbiAgICAgICAgdmFsdWU6IDNcbiAgICAgIH1cbiAgICBdO1xuXG4gICAgY29uc3Qgc291cmNlU291bmRJbmRleFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwICk7XG4gICAgY29uc3Qgc291bmRJbmRleFNlbGVjdG9yID0gbmV3IEFxdWFSYWRpb0J1dHRvbkdyb3VwKCBzb3VyY2VTb3VuZEluZGV4UHJvcGVydHksIHNvdW5kU291cmNlUmFkaW9CdXR0b25JdGVtcyApO1xuICAgIGNvbnN0IHNvdW5kSW5kZXhTZWxlY3RvclZCb3ggPSBuZXcgVkJveCgge1xuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgbmV3IFRleHQoICdTb3VyY2UgU291bmQ6JywgeyBmb250OiBMQUJFTF9GT05UIH0gKSxcbiAgICAgICAgc291bmRJbmRleFNlbGVjdG9yXG4gICAgICBdLFxuICAgICAgc3BhY2luZzogNVxuICAgIH0gKTtcblxuICAgIC8vIENyZWF0ZSB0aGUgYW1wbGl0dWRlIG1vZHVsYXRvciBkZW1vIGluc3RhbmNlIGFuZCBhZGQgaXQgdG8gdGhlIHNvdW5kIG1hbmFnZXIuXG4gICAgY29uc3QgYW1wbGl0dWRlTW9kdWxhdG9yRGVtbyA9IG5ldyBBbXBsaXR1ZGVNb2R1bGF0b3JEZW1vKCBzb3VyY2VTb3VuZEluZGV4UHJvcGVydHkgKTtcbiAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoIGFtcGxpdHVkZU1vZHVsYXRvckRlbW8gKTtcblxuICAgIC8vIExGTyBlbmFibGVkIGNvbnRyb2xcbiAgICBjb25zdCBsZm9FbmFibGVkID0gbmV3IENoZWNrYm94KCBhbXBsaXR1ZGVNb2R1bGF0b3JEZW1vLmFtcGxpdHVkZU1vZHVsYXRvci5teUVuYWJsZWRQcm9wZXJ0eSwgbmV3IFRleHQoICdMRk8gRW5hYmxlZCcsIHsgZm9udDogTEFCRUxfRk9OVCB9ICksIHsgYm94V2lkdGg6IDE2IH0gKTtcblxuICAgIC8vIGZyZXF1ZW5jeSBjb250cm9sXG4gICAgY29uc3QgZnJlcXVlbmN5Q29udHJvbEhCb3ggPSBuZXcgSEJveCgge1xuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgbmV3IFRleHQoICdGcmVxdWVuY3k6ICcsIHsgZm9udDogTEFCRUxfRk9OVCB9ICksXG4gICAgICAgIG5ldyBIU2xpZGVyKFxuICAgICAgICAgIGFtcGxpdHVkZU1vZHVsYXRvckRlbW8uYW1wbGl0dWRlTW9kdWxhdG9yLmZyZXF1ZW5jeVByb3BlcnR5LFxuICAgICAgICAgIG5ldyBSYW5nZSggMC41LCAyMCApXG4gICAgICAgIClcbiAgICAgIF1cbiAgICB9ICk7XG5cbiAgICAvLyBkZXB0aCBjb250cm9sXG4gICAgY29uc3QgZGVwdGhDb250cm9sSEJveCA9IG5ldyBIQm94KCB7XG4gICAgICBjaGlsZHJlbjogW1xuICAgICAgICBuZXcgVGV4dCggJ0RlcHRoOiAnLCB7IGZvbnQ6IExBQkVMX0ZPTlQgfSApLFxuICAgICAgICBuZXcgSFNsaWRlcihcbiAgICAgICAgICBhbXBsaXR1ZGVNb2R1bGF0b3JEZW1vLmFtcGxpdHVkZU1vZHVsYXRvci5kZXB0aFByb3BlcnR5LFxuICAgICAgICAgIG5ldyBSYW5nZSggMCwgMSApXG4gICAgICAgIClcbiAgICAgIF1cbiAgICB9ICk7XG5cbiAgICAvLyB3YXZlZm9ybSB0eXBlIHNlbGVjdG9yXG4gICAgY29uc3Qgd2F2ZWZvcm1SYWRpb0J1dHRvbkl0ZW1zOiBBcXVhUmFkaW9CdXR0b25Hcm91cEl0ZW08T3NjaWxsYXRvclR5cGU+W10gPSBbXG4gICAgICB7XG4gICAgICAgIGNyZWF0ZU5vZGU6ICggdGFuZGVtOiBUYW5kZW0gKSA9PiBuZXcgVGV4dCggJ1NpbmUnLCB7IGZvbnQ6IExBQkVMX0ZPTlQgfSApLFxuICAgICAgICB2YWx1ZTogJ3NpbmUnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBjcmVhdGVOb2RlOiAoIHRhbmRlbTogVGFuZGVtICkgPT4gbmV3IFRleHQoICdTcXVhcmUnLCB7IGZvbnQ6IExBQkVMX0ZPTlQgfSApLFxuICAgICAgICB2YWx1ZTogJ3NxdWFyZSdcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGNyZWF0ZU5vZGU6ICggdGFuZGVtOiBUYW5kZW0gKSA9PiBuZXcgVGV4dCggJ1RyaWFuZ2xlJywgeyBmb250OiBMQUJFTF9GT05UIH0gKSxcbiAgICAgICAgdmFsdWU6ICd0cmlhbmdsZSdcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGNyZWF0ZU5vZGU6ICggdGFuZGVtOiBUYW5kZW0gKSA9PiBuZXcgVGV4dCggJ1Nhd3Rvb3RoJywgeyBmb250OiBMQUJFTF9GT05UIH0gKSxcbiAgICAgICAgdmFsdWU6ICdzYXd0b290aCdcbiAgICAgIH1cbiAgICBdO1xuXG4gICAgY29uc3Qgd2F2ZWZvcm1TZWxlY3RvciA9IG5ldyBBcXVhUmFkaW9CdXR0b25Hcm91cDxPc2NpbGxhdG9yVHlwZT4oXG4gICAgICBhbXBsaXR1ZGVNb2R1bGF0b3JEZW1vLmFtcGxpdHVkZU1vZHVsYXRvci53YXZlZm9ybVByb3BlcnR5LFxuICAgICAgd2F2ZWZvcm1SYWRpb0J1dHRvbkl0ZW1zXG4gICAgKTtcbiAgICBjb25zdCB3YXZlZm9ybVNlbGVjdG9yVkJveCA9IG5ldyBWQm94KCB7XG4gICAgICBjaGlsZHJlbjogW1xuICAgICAgICBuZXcgVGV4dCggJ01vZHVsYXRpb24gV2F2ZWZvcm06JywgeyBmb250OiBMQUJFTF9GT05UIH0gKSxcbiAgICAgICAgd2F2ZWZvcm1TZWxlY3RvclxuICAgICAgXSxcbiAgICAgIHNwYWNpbmc6IDVcbiAgICB9ICk7XG5cbiAgICBzdXBlciggb3B0aW9uaXplPEFtcGxpdHVkZU1vZHVsYXRvckRlbW9Ob2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIFZCb3hPcHRpb25zPigpKCB7XG4gICAgICBjaGlsZHJlbjogWyBzb3VuZEluZGV4U2VsZWN0b3JWQm94LCBsZm9FbmFibGVkLCBmcmVxdWVuY3lDb250cm9sSEJveCwgZGVwdGhDb250cm9sSEJveCwgd2F2ZWZvcm1TZWxlY3RvclZCb3ggXSxcbiAgICAgIHNwYWNpbmc6IDE1LFxuICAgICAgYWxpZ246ICdsZWZ0J1xuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApICk7XG4gIH1cbn1cblxudGFtYm8ucmVnaXN0ZXIoICdBbXBsaXR1ZGVNb2R1bGF0b3JEZW1vTm9kZScsIEFtcGxpdHVkZU1vZHVsYXRvckRlbW9Ob2RlICk7XG5leHBvcnQgZGVmYXVsdCBBbXBsaXR1ZGVNb2R1bGF0b3JEZW1vTm9kZTsiXSwibmFtZXMiOlsiTnVtYmVyUHJvcGVydHkiLCJSYW5nZSIsIm9wdGlvbml6ZSIsIlBoZXRGb250IiwiSEJveCIsIlRleHQiLCJWQm94IiwiQXF1YVJhZGlvQnV0dG9uR3JvdXAiLCJDaGVja2JveCIsIkhTbGlkZXIiLCJzb3VuZE1hbmFnZXIiLCJ0YW1ibyIsIkFtcGxpdHVkZU1vZHVsYXRvckRlbW8iLCJMQUJFTF9GT05UIiwiQW1wbGl0dWRlTW9kdWxhdG9yRGVtb05vZGUiLCJwcm92aWRlZE9wdGlvbnMiLCJzb3VuZFNvdXJjZVJhZGlvQnV0dG9uSXRlbXMiLCJjcmVhdGVOb2RlIiwidGFuZGVtIiwiZm9udCIsInZhbHVlIiwic291cmNlU291bmRJbmRleFByb3BlcnR5Iiwic291bmRJbmRleFNlbGVjdG9yIiwic291bmRJbmRleFNlbGVjdG9yVkJveCIsImNoaWxkcmVuIiwic3BhY2luZyIsImFtcGxpdHVkZU1vZHVsYXRvckRlbW8iLCJhZGRTb3VuZEdlbmVyYXRvciIsImxmb0VuYWJsZWQiLCJhbXBsaXR1ZGVNb2R1bGF0b3IiLCJteUVuYWJsZWRQcm9wZXJ0eSIsImJveFdpZHRoIiwiZnJlcXVlbmN5Q29udHJvbEhCb3giLCJmcmVxdWVuY3lQcm9wZXJ0eSIsImRlcHRoQ29udHJvbEhCb3giLCJkZXB0aFByb3BlcnR5Iiwid2F2ZWZvcm1SYWRpb0J1dHRvbkl0ZW1zIiwid2F2ZWZvcm1TZWxlY3RvciIsIndhdmVmb3JtUHJvcGVydHkiLCJ3YXZlZm9ybVNlbGVjdG9yVkJveCIsImFsaWduIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0Esb0JBQW9CLDJDQUEyQztBQUN0RSxPQUFPQyxXQUFXLGlDQUFpQztBQUNuRCxPQUFPQyxlQUFxQywyQ0FBMkM7QUFDdkYsT0FBT0MsY0FBYyw2Q0FBNkM7QUFDbEUsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBcUIsdUNBQXVDO0FBQ3JGLE9BQU9DLDBCQUF3RCxnREFBZ0Q7QUFDL0csT0FBT0MsY0FBYyxvQ0FBb0M7QUFDekQsT0FBT0MsYUFBYSxtQ0FBbUM7QUFFdkQsT0FBT0Msa0JBQWtCLDJCQUEyQjtBQUNwRCxPQUFPQyxXQUFXLG9CQUFvQjtBQUN0QyxPQUFPQyw0QkFBNEIscUNBQXFDO0FBS3hFLFlBQVk7QUFDWixNQUFNQyxhQUFhLElBQUlWLFNBQVU7QUFFakMsSUFBQSxBQUFNVyw2QkFBTixNQUFNQSxtQ0FBbUNSO0lBRXZDLFlBQW9CUyxlQUFtRCxDQUFHO1FBRXhFLE1BQU1DLDhCQUE4QjtZQUNsQztnQkFDRUMsWUFBWSxDQUFFQyxTQUFvQixJQUFJYixLQUFNLFFBQVE7d0JBQUVjLE1BQU1OO29CQUFXO2dCQUN2RU8sT0FBTztZQUNUO1lBQ0E7Z0JBQ0VILFlBQVksQ0FBRUMsU0FBb0IsSUFBSWIsS0FBTSxXQUFXO3dCQUFFYyxNQUFNTjtvQkFBVztnQkFDMUVPLE9BQU87WUFDVDtZQUNBO2dCQUNFSCxZQUFZLENBQUVDLFNBQW9CLElBQUliLEtBQU0sV0FBVzt3QkFBRWMsTUFBTU47b0JBQVc7Z0JBQzFFTyxPQUFPO1lBQ1Q7WUFDQTtnQkFDRUgsWUFBWSxDQUFFQyxTQUFvQixJQUFJYixLQUFNLFdBQVc7d0JB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