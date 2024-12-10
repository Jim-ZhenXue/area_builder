// Copyright 2020-2024, University of Colorado Boulder
/**
 * Test and demo of the ContinuousPropertySoundClip.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */ import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import Range from '../../../../../dot/js/Range.js';
import merge from '../../../../../phet-core/js/merge.js';
import NumberControl from '../../../../../scenery-phet/js/NumberControl.js';
import { Text, VBox } from '../../../../../scenery/js/imports.js';
import Checkbox from '../../../../../sun/js/Checkbox.js';
import Panel from '../../../../../sun/js/Panel.js';
import stringsLoopMiddleCOscilloscope_mp3 from '../../../../sounds/demo-and-test/stringsLoopMiddleCOscilloscope_mp3.js';
import windsLoopC3Oscilloscope_mp3 from '../../../../sounds/demo-and-test/windsLoopC3Oscilloscope_mp3.js';
import windsLoopMiddleCOscilloscope_mp3 from '../../../../sounds/demo-and-test/windsLoopMiddleCOscilloscope_mp3.js';
import saturatedSineLoop220Hz_mp3 from '../../../../sounds/saturatedSineLoop220Hz_mp3.js';
import ContinuousPropertySoundClip from '../../../sound-generators/ContinuousPropertySoundClip.js';
import soundManager from '../../../soundManager.js';
import tambo from '../../../tambo.js';
let ContinuousPropertySoundClipTestNode = class ContinuousPropertySoundClipTestNode extends VBox {
    /**
   * Release references to avoid memory leaks.
   */ dispose() {
        this.disposeContinuousPropertySoundClipTestNode();
        super.dispose();
    }
    constructor(stepEmitter, providedOptions){
        // keep track of listeners added to the step emitter so that they can be disposed
        const stepListeners = [];
        // creates a panel that demonstrates a ContinuousPropertySoundClip
        const createTester = (sound, max)=>{
            const numberProperty = new NumberProperty(5);
            const range = new Range(1, 10);
            const continuousPropertySoundClip = new ContinuousPropertySoundClip(numberProperty, range, sound);
            soundManager.addSoundGenerator(continuousPropertySoundClip);
            const isOscillatingProperty = new BooleanProperty(false);
            let phase = 0;
            const stepListener = ()=>{
                if (isOscillatingProperty.value) {
                    numberProperty.value = (max * Math.sin(Date.now() / 1000 - phase) + 1) * (range.max - range.min) / 2 + range.min;
                }
            };
            stepEmitter.addListener(stepListener);
            stepListeners.push(stepListener);
            isOscillatingProperty.link(()=>{
                phase = Date.now() / 1000;
            });
            return new Panel(new VBox({
                children: [
                    new Checkbox(isOscillatingProperty, new Text('Oscillate')),
                    new NumberControl('Value', numberProperty, range, {
                        delta: 0.1,
                        numberDisplayOptions: {
                            decimalPlaces: 1
                        }
                    })
                ]
            }));
        };
        super(merge({
            children: [
                createTester(stringsLoopMiddleCOscilloscope_mp3, 1),
                createTester(windsLoopMiddleCOscilloscope_mp3, 0.5),
                createTester(windsLoopC3Oscilloscope_mp3, 0.25),
                createTester(saturatedSineLoop220Hz_mp3, 1)
            ],
            spacing: 15,
            align: 'left'
        }, providedOptions));
        // define dispose function for memory cleanup
        this.disposeContinuousPropertySoundClipTestNode = ()=>{
            stepListeners.forEach((listener)=>{
                stepEmitter.removeListener(listener);
            });
        };
    }
};
tambo.register('ContinuousPropertySoundClipTestNode', ContinuousPropertySoundClipTestNode);
export default ContinuousPropertySoundClipTestNode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL2RlbW8vdGVzdGluZy92aWV3L0NvbnRpbnVvdXNQcm9wZXJ0eVNvdW5kQ2xpcFRlc3ROb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRlc3QgYW5kIGRlbW8gb2YgdGhlIENvbnRpbnVvdXNQcm9wZXJ0eVNvdW5kQ2xpcC5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcbmltcG9ydCB7IFRSZWFkT25seUVtaXR0ZXIgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL1RFbWl0dGVyLmpzJztcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XG5pbXBvcnQgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgTnVtYmVyQ29udHJvbCBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTnVtYmVyQ29udHJvbC5qcyc7XG5pbXBvcnQgeyBUZXh0LCBWQm94LCBWQm94T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vLi4vLi4vLi4vLi4vc3VuL2pzL0NoZWNrYm94LmpzJztcbmltcG9ydCBQYW5lbCBmcm9tICcuLi8uLi8uLi8uLi8uLi9zdW4vanMvUGFuZWwuanMnO1xuaW1wb3J0IHN0cmluZ3NMb29wTWlkZGxlQ09zY2lsbG9zY29wZV9tcDMgZnJvbSAnLi4vLi4vLi4vLi4vc291bmRzL2RlbW8tYW5kLXRlc3Qvc3RyaW5nc0xvb3BNaWRkbGVDT3NjaWxsb3Njb3BlX21wMy5qcyc7XG5pbXBvcnQgd2luZHNMb29wQzNPc2NpbGxvc2NvcGVfbXAzIGZyb20gJy4uLy4uLy4uLy4uL3NvdW5kcy9kZW1vLWFuZC10ZXN0L3dpbmRzTG9vcEMzT3NjaWxsb3Njb3BlX21wMy5qcyc7XG5pbXBvcnQgd2luZHNMb29wTWlkZGxlQ09zY2lsbG9zY29wZV9tcDMgZnJvbSAnLi4vLi4vLi4vLi4vc291bmRzL2RlbW8tYW5kLXRlc3Qvd2luZHNMb29wTWlkZGxlQ09zY2lsbG9zY29wZV9tcDMuanMnO1xuaW1wb3J0IHNhdHVyYXRlZFNpbmVMb29wMjIwSHpfbXAzIGZyb20gJy4uLy4uLy4uLy4uL3NvdW5kcy9zYXR1cmF0ZWRTaW5lTG9vcDIyMEh6X21wMy5qcyc7XG5pbXBvcnQgQ29udGludW91c1Byb3BlcnR5U291bmRDbGlwIGZyb20gJy4uLy4uLy4uL3NvdW5kLWdlbmVyYXRvcnMvQ29udGludW91c1Byb3BlcnR5U291bmRDbGlwLmpzJztcbmltcG9ydCBzb3VuZE1hbmFnZXIgZnJvbSAnLi4vLi4vLi4vc291bmRNYW5hZ2VyLmpzJztcbmltcG9ydCB0YW1ibyBmcm9tICcuLi8uLi8uLi90YW1iby5qcyc7XG5pbXBvcnQgV3JhcHBlZEF1ZGlvQnVmZmVyIGZyb20gJy4uLy4uLy4uL1dyYXBwZWRBdWRpb0J1ZmZlci5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xuZXhwb3J0IHR5cGUgQ29udGludW91c1Byb3BlcnR5U291bmRDbGlwVGVzdE5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBWQm94T3B0aW9ucztcblxuY2xhc3MgQ29udGludW91c1Byb3BlcnR5U291bmRDbGlwVGVzdE5vZGUgZXh0ZW5kcyBWQm94IHtcblxuICAvLyBkaXNwb3NlIGZ1bmN0aW9uXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUNvbnRpbnVvdXNQcm9wZXJ0eVNvdW5kQ2xpcFRlc3ROb2RlOiAoKSA9PiB2b2lkO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc3RlcEVtaXR0ZXI6IFRSZWFkT25seUVtaXR0ZXI8WyBudW1iZXIgXT4sIHByb3ZpZGVkT3B0aW9ucz86IENvbnRpbnVvdXNQcm9wZXJ0eVNvdW5kQ2xpcFRlc3ROb2RlT3B0aW9ucyApIHtcblxuICAgIC8vIGtlZXAgdHJhY2sgb2YgbGlzdGVuZXJzIGFkZGVkIHRvIHRoZSBzdGVwIGVtaXR0ZXIgc28gdGhhdCB0aGV5IGNhbiBiZSBkaXNwb3NlZFxuICAgIGNvbnN0IHN0ZXBMaXN0ZW5lcnM6ICggKCBkdDogbnVtYmVyICkgPT4gdm9pZCApW10gPSBbXTtcblxuICAgIC8vIGNyZWF0ZXMgYSBwYW5lbCB0aGF0IGRlbW9uc3RyYXRlcyBhIENvbnRpbnVvdXNQcm9wZXJ0eVNvdW5kQ2xpcFxuICAgIGNvbnN0IGNyZWF0ZVRlc3RlciA9ICggc291bmQ6IFdyYXBwZWRBdWRpb0J1ZmZlciwgbWF4OiBudW1iZXIgKSA9PiB7XG4gICAgICBjb25zdCBudW1iZXJQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggNSApO1xuICAgICAgY29uc3QgcmFuZ2UgPSBuZXcgUmFuZ2UoIDEsIDEwICk7XG4gICAgICBjb25zdCBjb250aW51b3VzUHJvcGVydHlTb3VuZENsaXAgPSBuZXcgQ29udGludW91c1Byb3BlcnR5U291bmRDbGlwKCBudW1iZXJQcm9wZXJ0eSwgcmFuZ2UsIHNvdW5kICk7XG4gICAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoIGNvbnRpbnVvdXNQcm9wZXJ0eVNvdW5kQ2xpcCApO1xuICAgICAgY29uc3QgaXNPc2NpbGxhdGluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcbiAgICAgIGxldCBwaGFzZSA9IDA7XG4gICAgICBjb25zdCBzdGVwTGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgICAgIGlmICggaXNPc2NpbGxhdGluZ1Byb3BlcnR5LnZhbHVlICkge1xuICAgICAgICAgIG51bWJlclByb3BlcnR5LnZhbHVlID0gKCBtYXggKiBNYXRoLnNpbiggRGF0ZS5ub3coKSAvIDEwMDAgLSBwaGFzZSApICsgMSApICogKCByYW5nZS5tYXggLSByYW5nZS5taW4gKSAvIDIgKyByYW5nZS5taW47XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBzdGVwRW1pdHRlci5hZGRMaXN0ZW5lciggc3RlcExpc3RlbmVyICk7XG4gICAgICBzdGVwTGlzdGVuZXJzLnB1c2goIHN0ZXBMaXN0ZW5lciApO1xuICAgICAgaXNPc2NpbGxhdGluZ1Byb3BlcnR5LmxpbmsoICgpID0+IHtcbiAgICAgICAgcGhhc2UgPSBEYXRlLm5vdygpIC8gMTAwMDtcbiAgICAgIH0gKTtcblxuICAgICAgcmV0dXJuIG5ldyBQYW5lbCggbmV3IFZCb3goIHtcbiAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICBuZXcgQ2hlY2tib3goIGlzT3NjaWxsYXRpbmdQcm9wZXJ0eSwgbmV3IFRleHQoICdPc2NpbGxhdGUnICkgKSxcbiAgICAgICAgICBuZXcgTnVtYmVyQ29udHJvbCggJ1ZhbHVlJywgbnVtYmVyUHJvcGVydHksIHJhbmdlLCB7XG4gICAgICAgICAgICBkZWx0YTogMC4xLFxuICAgICAgICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHsgZGVjaW1hbFBsYWNlczogMSB9XG4gICAgICAgICAgfSApXG4gICAgICAgIF1cbiAgICAgIH0gKSApO1xuICAgIH07XG5cbiAgICBzdXBlciggbWVyZ2UoIHtcbiAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgIGNyZWF0ZVRlc3Rlciggc3RyaW5nc0xvb3BNaWRkbGVDT3NjaWxsb3Njb3BlX21wMywgMSApLFxuICAgICAgICBjcmVhdGVUZXN0ZXIoIHdpbmRzTG9vcE1pZGRsZUNPc2NpbGxvc2NvcGVfbXAzLCAwLjUgKSxcbiAgICAgICAgY3JlYXRlVGVzdGVyKCB3aW5kc0xvb3BDM09zY2lsbG9zY29wZV9tcDMsIDAuMjUgKSxcbiAgICAgICAgY3JlYXRlVGVzdGVyKCBzYXR1cmF0ZWRTaW5lTG9vcDIyMEh6X21wMywgMSApXG4gICAgICBdLFxuICAgICAgc3BhY2luZzogMTUsXG4gICAgICBhbGlnbjogJ2xlZnQnXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICkgKTtcblxuICAgIC8vIGRlZmluZSBkaXNwb3NlIGZ1bmN0aW9uIGZvciBtZW1vcnkgY2xlYW51cFxuICAgIHRoaXMuZGlzcG9zZUNvbnRpbnVvdXNQcm9wZXJ0eVNvdW5kQ2xpcFRlc3ROb2RlID0gKCkgPT4ge1xuICAgICAgc3RlcExpc3RlbmVycy5mb3JFYWNoKCBsaXN0ZW5lciA9PiB7XG4gICAgICAgIHN0ZXBFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCBsaXN0ZW5lciApO1xuICAgICAgfSApO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUmVsZWFzZSByZWZlcmVuY2VzIHRvIGF2b2lkIG1lbW9yeSBsZWFrcy5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZUNvbnRpbnVvdXNQcm9wZXJ0eVNvdW5kQ2xpcFRlc3ROb2RlKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnRhbWJvLnJlZ2lzdGVyKCAnQ29udGludW91c1Byb3BlcnR5U291bmRDbGlwVGVzdE5vZGUnLCBDb250aW51b3VzUHJvcGVydHlTb3VuZENsaXBUZXN0Tm9kZSApO1xuZXhwb3J0IGRlZmF1bHQgQ29udGludW91c1Byb3BlcnR5U291bmRDbGlwVGVzdE5vZGU7Il0sIm5hbWVzIjpbIkJvb2xlYW5Qcm9wZXJ0eSIsIk51bWJlclByb3BlcnR5IiwiUmFuZ2UiLCJtZXJnZSIsIk51bWJlckNvbnRyb2wiLCJUZXh0IiwiVkJveCIsIkNoZWNrYm94IiwiUGFuZWwiLCJzdHJpbmdzTG9vcE1pZGRsZUNPc2NpbGxvc2NvcGVfbXAzIiwid2luZHNMb29wQzNPc2NpbGxvc2NvcGVfbXAzIiwid2luZHNMb29wTWlkZGxlQ09zY2lsbG9zY29wZV9tcDMiLCJzYXR1cmF0ZWRTaW5lTG9vcDIyMEh6X21wMyIsIkNvbnRpbnVvdXNQcm9wZXJ0eVNvdW5kQ2xpcCIsInNvdW5kTWFuYWdlciIsInRhbWJvIiwiQ29udGludW91c1Byb3BlcnR5U291bmRDbGlwVGVzdE5vZGUiLCJkaXNwb3NlIiwiZGlzcG9zZUNvbnRpbnVvdXNQcm9wZXJ0eVNvdW5kQ2xpcFRlc3ROb2RlIiwic3RlcEVtaXR0ZXIiLCJwcm92aWRlZE9wdGlvbnMiLCJzdGVwTGlzdGVuZXJzIiwiY3JlYXRlVGVzdGVyIiwic291bmQiLCJtYXgiLCJudW1iZXJQcm9wZXJ0eSIsInJhbmdlIiwiY29udGludW91c1Byb3BlcnR5U291bmRDbGlwIiwiYWRkU291bmRHZW5lcmF0b3IiLCJpc09zY2lsbGF0aW5nUHJvcGVydHkiLCJwaGFzZSIsInN0ZXBMaXN0ZW5lciIsInZhbHVlIiwiTWF0aCIsInNpbiIsIkRhdGUiLCJub3ciLCJtaW4iLCJhZGRMaXN0ZW5lciIsInB1c2giLCJsaW5rIiwiY2hpbGRyZW4iLCJkZWx0YSIsIm51bWJlckRpc3BsYXlPcHRpb25zIiwiZGVjaW1hbFBsYWNlcyIsInNwYWNpbmciLCJhbGlnbiIsImZvckVhY2giLCJsaXN0ZW5lciIsInJlbW92ZUxpc3RlbmVyIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELE9BQU9BLHFCQUFxQiw0Q0FBNEM7QUFDeEUsT0FBT0Msb0JBQW9CLDJDQUEyQztBQUV0RSxPQUFPQyxXQUFXLGlD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