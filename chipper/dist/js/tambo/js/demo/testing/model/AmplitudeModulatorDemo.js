// Copyright 2020-2024, University of Colorado Boulder
/**
 * Demo and test harness for the AmplitudeModulator class.  This creates several sound loops and routes them through
 * an amplitude modulator instance.  It also provides the properties that can be manipulated in the view to change the
 * attributes of the modulation.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */ import windsLoopC3Oscilloscope_mp3 from '../../../../sounds/demo-and-test/windsLoopC3Oscilloscope_mp3.js';
import windsLoopMiddleCOscilloscope_mp3 from '../../../../sounds/demo-and-test/windsLoopMiddleCOscilloscope_mp3.js';
import saturatedSineLoop220Hz_mp3 from '../../../../sounds/saturatedSineLoop220Hz_mp3.js';
import AmplitudeModulator from '../../../AmplitudeModulator.js';
import SoundClip from '../../../sound-generators/SoundClip.js';
import SoundGenerator from '../../../sound-generators/SoundGenerator.js';
import tambo from '../../../tambo.js';
let AmplitudeModulatorDemo = class AmplitudeModulatorDemo extends SoundGenerator {
    /**
   * restore initial state
   */ reset() {
        this.amplitudeModulator.myEnabledProperty.set(true);
        this.amplitudeModulator.frequencyProperty.reset();
        this.amplitudeModulator.depthProperty.reset();
        this.amplitudeModulator.waveformProperty.reset();
    }
    constructor(sourceSoundIndexProperty, options){
        super(options);
        // Create the amplitude modulator.
        this.amplitudeModulator = new AmplitudeModulator();
        this.amplitudeModulator.connect(this.soundSourceDestination);
        // sound sources that will be modulated
        const soundLoops = [
            new SoundClip(saturatedSineLoop220Hz_mp3, {
                loop: true
            }),
            new SoundClip(windsLoopC3Oscilloscope_mp3, {
                loop: true
            }),
            new SoundClip(windsLoopMiddleCOscilloscope_mp3, {
                loop: true
            })
        ];
        // hook each of the loops to the amplitude modulator
        soundLoops.forEach((soundLoop)=>{
            soundLoop.connect(this.amplitudeModulator.getConnectionPoint());
        });
        // Play and stop the loops based on the selection property's value.  A sound source index of 0 indicates that no
        // sound should be played, values above zero are decremented by one and then used as an index into the array of
        // sound loops.
        sourceSoundIndexProperty.link((soundSourceIndex)=>{
            soundLoops.forEach((soundLoop, index)=>{
                if (index === soundSourceIndex - 1) {
                    soundLoop.play();
                } else {
                    soundLoop.stop();
                }
            });
        });
    }
};
tambo.register('AmplitudeModulatorDemo', AmplitudeModulatorDemo);
export default AmplitudeModulatorDemo;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL2RlbW8vdGVzdGluZy9tb2RlbC9BbXBsaXR1ZGVNb2R1bGF0b3JEZW1vLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERlbW8gYW5kIHRlc3QgaGFybmVzcyBmb3IgdGhlIEFtcGxpdHVkZU1vZHVsYXRvciBjbGFzcy4gIFRoaXMgY3JlYXRlcyBzZXZlcmFsIHNvdW5kIGxvb3BzIGFuZCByb3V0ZXMgdGhlbSB0aHJvdWdoXG4gKiBhbiBhbXBsaXR1ZGUgbW9kdWxhdG9yIGluc3RhbmNlLiAgSXQgYWxzbyBwcm92aWRlcyB0aGUgcHJvcGVydGllcyB0aGF0IGNhbiBiZSBtYW5pcHVsYXRlZCBpbiB0aGUgdmlldyB0byBjaGFuZ2UgdGhlXG4gKiBhdHRyaWJ1dGVzIG9mIHRoZSBtb2R1bGF0aW9uLlxuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xuaW1wb3J0IHdpbmRzTG9vcEMzT3NjaWxsb3Njb3BlX21wMyBmcm9tICcuLi8uLi8uLi8uLi9zb3VuZHMvZGVtby1hbmQtdGVzdC93aW5kc0xvb3BDM09zY2lsbG9zY29wZV9tcDMuanMnO1xuaW1wb3J0IHdpbmRzTG9vcE1pZGRsZUNPc2NpbGxvc2NvcGVfbXAzIGZyb20gJy4uLy4uLy4uLy4uL3NvdW5kcy9kZW1vLWFuZC10ZXN0L3dpbmRzTG9vcE1pZGRsZUNPc2NpbGxvc2NvcGVfbXAzLmpzJztcbmltcG9ydCBzYXR1cmF0ZWRTaW5lTG9vcDIyMEh6X21wMyBmcm9tICcuLi8uLi8uLi8uLi9zb3VuZHMvc2F0dXJhdGVkU2luZUxvb3AyMjBIel9tcDMuanMnO1xuaW1wb3J0IEFtcGxpdHVkZU1vZHVsYXRvciBmcm9tICcuLi8uLi8uLi9BbXBsaXR1ZGVNb2R1bGF0b3IuanMnO1xuaW1wb3J0IFNvdW5kQ2xpcCBmcm9tICcuLi8uLi8uLi9zb3VuZC1nZW5lcmF0b3JzL1NvdW5kQ2xpcC5qcyc7XG5pbXBvcnQgU291bmRHZW5lcmF0b3IsIHsgU291bmRHZW5lcmF0b3JPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vc291bmQtZ2VuZXJhdG9ycy9Tb3VuZEdlbmVyYXRvci5qcyc7XG5pbXBvcnQgdGFtYm8gZnJvbSAnLi4vLi4vLi4vdGFtYm8uanMnO1xuXG5jbGFzcyBBbXBsaXR1ZGVNb2R1bGF0b3JEZW1vIGV4dGVuZHMgU291bmRHZW5lcmF0b3Ige1xuXG4gIHB1YmxpYyByZWFkb25seSBhbXBsaXR1ZGVNb2R1bGF0b3I6IEFtcGxpdHVkZU1vZHVsYXRvcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHNvdXJjZVNvdW5kSW5kZXhQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHksIG9wdGlvbnM/OiBTb3VuZEdlbmVyYXRvck9wdGlvbnMgKSB7XG5cbiAgICBzdXBlciggb3B0aW9ucyApO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBhbXBsaXR1ZGUgbW9kdWxhdG9yLlxuICAgIHRoaXMuYW1wbGl0dWRlTW9kdWxhdG9yID0gbmV3IEFtcGxpdHVkZU1vZHVsYXRvcigpO1xuICAgIHRoaXMuYW1wbGl0dWRlTW9kdWxhdG9yLmNvbm5lY3QoIHRoaXMuc291bmRTb3VyY2VEZXN0aW5hdGlvbiApO1xuXG4gICAgLy8gc291bmQgc291cmNlcyB0aGF0IHdpbGwgYmUgbW9kdWxhdGVkXG4gICAgY29uc3Qgc291bmRMb29wcyA9IFtcbiAgICAgIG5ldyBTb3VuZENsaXAoIHNhdHVyYXRlZFNpbmVMb29wMjIwSHpfbXAzLCB7IGxvb3A6IHRydWUgfSApLFxuICAgICAgbmV3IFNvdW5kQ2xpcCggd2luZHNMb29wQzNPc2NpbGxvc2NvcGVfbXAzLCB7IGxvb3A6IHRydWUgfSApLFxuICAgICAgbmV3IFNvdW5kQ2xpcCggd2luZHNMb29wTWlkZGxlQ09zY2lsbG9zY29wZV9tcDMsIHsgbG9vcDogdHJ1ZSB9IClcbiAgICBdO1xuXG4gICAgLy8gaG9vayBlYWNoIG9mIHRoZSBsb29wcyB0byB0aGUgYW1wbGl0dWRlIG1vZHVsYXRvclxuICAgIHNvdW5kTG9vcHMuZm9yRWFjaCggc291bmRMb29wID0+IHsgc291bmRMb29wLmNvbm5lY3QoIHRoaXMuYW1wbGl0dWRlTW9kdWxhdG9yLmdldENvbm5lY3Rpb25Qb2ludCgpICk7IH0gKTtcblxuICAgIC8vIFBsYXkgYW5kIHN0b3AgdGhlIGxvb3BzIGJhc2VkIG9uIHRoZSBzZWxlY3Rpb24gcHJvcGVydHkncyB2YWx1ZS4gIEEgc291bmQgc291cmNlIGluZGV4IG9mIDAgaW5kaWNhdGVzIHRoYXQgbm9cbiAgICAvLyBzb3VuZCBzaG91bGQgYmUgcGxheWVkLCB2YWx1ZXMgYWJvdmUgemVybyBhcmUgZGVjcmVtZW50ZWQgYnkgb25lIGFuZCB0aGVuIHVzZWQgYXMgYW4gaW5kZXggaW50byB0aGUgYXJyYXkgb2ZcbiAgICAvLyBzb3VuZCBsb29wcy5cbiAgICBzb3VyY2VTb3VuZEluZGV4UHJvcGVydHkubGluayggc291bmRTb3VyY2VJbmRleCA9PiB7XG4gICAgICBzb3VuZExvb3BzLmZvckVhY2goICggc291bmRMb29wLCBpbmRleCApID0+IHtcbiAgICAgICAgaWYgKCBpbmRleCA9PT0gc291bmRTb3VyY2VJbmRleCAtIDEgKSB7XG4gICAgICAgICAgc291bmRMb29wLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBzb3VuZExvb3Auc3RvcCgpO1xuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgfSApO1xuICB9XG5cbiAgLyoqXG4gICAqIHJlc3RvcmUgaW5pdGlhbCBzdGF0ZVxuICAgKi9cbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuYW1wbGl0dWRlTW9kdWxhdG9yLm15RW5hYmxlZFByb3BlcnR5LnNldCggdHJ1ZSApO1xuICAgIHRoaXMuYW1wbGl0dWRlTW9kdWxhdG9yLmZyZXF1ZW5jeVByb3BlcnR5LnJlc2V0KCk7XG4gICAgdGhpcy5hbXBsaXR1ZGVNb2R1bGF0b3IuZGVwdGhQcm9wZXJ0eS5yZXNldCgpO1xuICAgIHRoaXMuYW1wbGl0dWRlTW9kdWxhdG9yLndhdmVmb3JtUHJvcGVydHkucmVzZXQoKTtcbiAgfVxufVxuXG50YW1iby5yZWdpc3RlciggJ0FtcGxpdHVkZU1vZHVsYXRvckRlbW8nLCBBbXBsaXR1ZGVNb2R1bGF0b3JEZW1vICk7XG5leHBvcnQgZGVmYXVsdCBBbXBsaXR1ZGVNb2R1bGF0b3JEZW1vOyJdLCJuYW1lcyI6WyJ3aW5kc0xvb3BDM09zY2lsbG9zY29wZV9tcDMiLCJ3aW5kc0xvb3BNaWRkbGVDT3NjaWxsb3Njb3BlX21wMyIsInNhdHVyYXRlZFNpbmVMb29wMjIwSHpfbXAzIiwiQW1wbGl0dWRlTW9kdWxhdG9yIiwiU291bmRDbGlwIiwiU291bmRHZW5lcmF0b3IiLCJ0YW1ibyIsIkFtcGxpdHVkZU1vZHVsYXRvckRlbW8iLCJyZXNldCIsImFtcGxpdHVkZU1vZHVsYXRvciIsIm15RW5hYmxlZFByb3BlcnR5Iiwic2V0IiwiZnJlcXVlbmN5UHJvcGVydHkiLCJkZXB0aFByb3BlcnR5Iiwid2F2ZWZvcm1Qcm9wZXJ0eSIsInNvdXJjZVNvdW5kSW5kZXhQcm9wZXJ0eSIsIm9wdGlvbnMiLCJjb25uZWN0Iiwic291bmRTb3VyY2VEZXN0aW5hdGlvbiIsInNvdW5kTG9vcHMiLCJsb29wIiwiZm9yRWFjaCIsInNvdW5kTG9vcCIsImdldENvbm5lY3Rpb25Qb2ludCIsImxpbmsiLCJzb3VuZFNvdXJjZUluZGV4IiwiaW5kZXgiLCJwbGF5Iiwic3RvcCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBR0QsT0FBT0EsaUNBQWlDLGtFQUFrRTtBQUMxRyxPQUFPQyxzQ0FBc0MsdUVBQXVFO0FBQ3BILE9BQU9DLGdDQUFnQyxtREFBbUQ7QUFDMUYsT0FBT0Msd0JBQXdCLGlDQUFpQztBQUNoRSxPQUFPQyxlQUFlLHlDQUF5QztBQUMvRCxPQUFPQyxvQkFBK0MsOENBQThDO0FBQ3BHLE9BQU9DLFdBQVcsb0JBQW9CO0FBRXRDLElBQUEsQUFBTUMseUJBQU4sTUFBTUEsK0JBQStCRjtJQXFDbkM7O0dBRUMsR0FDRCxBQUFPRyxRQUFjO1FBQ25CLElBQUksQ0FBQ0Msa0JBQWtCLENBQUNDLGlCQUFpQixDQUFDQyxHQUFHLENBQUU7UUFDL0MsSUFBSSxDQUFDRixrQkFBa0IsQ0FBQ0csaUJBQWlCLENBQUNKLEtBQUs7UUFDL0MsSUFBSSxDQUFDQyxrQkFBa0IsQ0FBQ0ksYUFBYSxDQUFDTCxLQUFLO1FBQzNDLElBQUksQ0FBQ0Msa0JBQWtCLENBQUNLLGdCQUFnQixDQUFDTixLQUFLO0lBQ2hEO0lBekNBLFlBQW9CTyx3QkFBd0MsRUFBRUMsT0FBK0IsQ0FBRztRQUU5RixLQUFLLENBQUVBO1FBRVAsa0NBQWtDO1FBQ2xDLElBQUksQ0FBQ1Asa0JBQWtCLEdBQUcsSUFBSU47UUFDOUIsSUFBSSxDQUFDTSxrQkFBa0IsQ0FBQ1EsT0FBTyxDQUFFLElBQUksQ0FBQ0Msc0JBQXNCO1FBRTVELHVDQUF1QztRQUN2QyxNQUFNQyxhQUFhO1lBQ2pCLElBQUlmLFVBQVdGLDRCQUE0QjtnQkFBRWtCLE1BQU07WUFBSztZQUN4RCxJQUFJaEIsVUFBV0osNkJBQTZCO2dCQUFFb0IsTUFBTTtZQUFLO1lBQ3pELElBQUloQixVQUFXSCxrQ0FBa0M7Z0JBQUVtQixNQUFNO1lBQUs7U0FDL0Q7UUFFRCxvREFBb0Q7UUFDcERELFdBQVdFLE9BQU8sQ0FBRUMsQ0FBQUE7WUFBZUEsVUFBVUwsT0FBTyxDQUFFLElBQUksQ0FBQ1Isa0JBQWtCLENBQUNjLGtCQUFrQjtRQUFNO1FBRXRHLGdIQUFnSDtRQUNoSCwrR0FBK0c7UUFDL0csZUFBZTtRQUNmUix5QkFBeUJTLElBQUksQ0FBRUMsQ0FBQUE7WUFDN0JOLFdBQVdFLE9BQU8sQ0FBRSxDQUFFQyxXQUFXSTtnQkFDL0IsSUFBS0EsVUFBVUQsbUJBQW1CLEdBQUk7b0JBQ3BDSCxVQUFVSyxJQUFJO2dCQUNoQixPQUNLO29CQUNITCxVQUFVTSxJQUFJO2dCQUNoQjtZQUNGO1FBQ0Y7SUFDRjtBQVdGO0FBRUF0QixNQUFNdUIsUUFBUSxDQUFFLDBCQUEwQnRCO0FBQzFDLGVBQWVBLHVCQUF1QiJ9