// Copyright 2020-2023, University of Colorado Boulder
/**
 * OscillatorSoundGenerator is a Web Audio oscillator node wrapped in a sound generator so that it can be easily be used
 * in PhET sims.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */ import optionize from '../../../phet-core/js/optionize.js';
import phetAudioContext from '../phetAudioContext.js';
import tambo from '../tambo.js';
import SoundGenerator from './SoundGenerator.js';
let OscillatorSoundGenerator = class OscillatorSoundGenerator extends SoundGenerator {
    /**
   * Starts the oscillator. The name 'play' is used because this is commonly used in the tambo library for sound
   * generators. If the oscillator is already playing, this has no effect.
   */ play() {
        if (!this.oscillatorNode) {
            this.oscillatorNode = phetAudioContext.createOscillator();
            this.oscillatorNode.type = this.waveformType;
            this.oscillatorNode.frequency.setValueAtTime(this.frequency, phetAudioContext.currentTime);
            this.oscillatorNode.connect(this.mainGainNode);
            this.oscillatorNode.start();
        }
    }
    /**
   * Stops the oscillator. If the oscillator isn't playing, this has no effect.
   */ stop() {
        if (this.oscillatorNode) {
            this.oscillatorNode.stop();
            this.oscillatorNode = null;
        }
    }
    /**
   * Sets the waveform type.
   */ setWaveformType(waveformType) {
        this.waveformType = waveformType;
        if (this.oscillatorNode) {
            this.oscillatorNode.type = waveformType;
        }
    }
    constructor(providedOptions){
        const options = optionize()({
            initialFrequency: 440,
            initialWaveformType: 'sine'
        }, providedOptions);
        super(options);
        // state initialization
        this.oscillatorNode = null;
        this.frequency = options.initialFrequency;
        this.waveformType = options.initialWaveformType;
    }
};
tambo.register('OscillatorSoundGenerator', OscillatorSoundGenerator);
export default OscillatorSoundGenerator;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kLWdlbmVyYXRvcnMvT3NjaWxsYXRvclNvdW5kR2VuZXJhdG9yLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIE9zY2lsbGF0b3JTb3VuZEdlbmVyYXRvciBpcyBhIFdlYiBBdWRpbyBvc2NpbGxhdG9yIG5vZGUgd3JhcHBlZCBpbiBhIHNvdW5kIGdlbmVyYXRvciBzbyB0aGF0IGl0IGNhbiBiZSBlYXNpbHkgYmUgdXNlZFxuICogaW4gUGhFVCBzaW1zLlxuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBwaGV0QXVkaW9Db250ZXh0IGZyb20gJy4uL3BoZXRBdWRpb0NvbnRleHQuanMnO1xuaW1wb3J0IHRhbWJvIGZyb20gJy4uL3RhbWJvLmpzJztcbmltcG9ydCBTb3VuZEdlbmVyYXRvciwgeyBTb3VuZEdlbmVyYXRvck9wdGlvbnMgfSBmcm9tICcuL1NvdW5kR2VuZXJhdG9yLmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyBpbml0aWFsIGZyZXF1ZW5jeSBpbiBIeiwgY2FuIGJlIGNoYW5nZWQgbGF0ZXJcbiAgaW5pdGlhbEZyZXF1ZW5jeT86IG51bWJlcjtcblxuICAvLyBpbml0aWFsIHdhdmVmb3JtIHR5cGUsIGNhbiBiZSBjaGFuZ2VkIGxhdGVyXG4gIGluaXRpYWxXYXZlZm9ybVR5cGU/OiBPc2NpbGxhdG9yVHlwZTtcbn07XG5leHBvcnQgdHlwZSBPc2NpbGxhdG9yU291bmRHZW5lcmF0b3JPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTb3VuZEdlbmVyYXRvck9wdGlvbnM7XG5cbmNsYXNzIE9zY2lsbGF0b3JTb3VuZEdlbmVyYXRvciBleHRlbmRzIFNvdW5kR2VuZXJhdG9yIHtcblxuICAvLyBUaGUgV2ViIEF1ZGlvIG9zY2lsbGF0b3Igbm9kZSB0aGF0IHdpbGwgYmUgY3JlYXRlZCB3aGVuIHBsYXkgaXMgY2FsbGVkLCBhbmQgc2V0IHRvIG51bGwgd2hlbiBzdG9wcGVkIChXZWIgQXVkaW9cbiAgLy8gb3NjaWxsYXRvcnMgYXJlIG1lYW50IHRvIGJlIHNpbmdsZSB1c2Ugb25seSkuXG4gIHByaXZhdGUgb3NjaWxsYXRvck5vZGU6IE9zY2lsbGF0b3JOb2RlIHwgbnVsbDtcblxuICAvLyBvdGhlciBwYXJhbWV0ZXJzIG9mIHRoZSBvc2NpbGxhdG9yXG4gIHByaXZhdGUgcmVhZG9ubHkgZnJlcXVlbmN5OiBudW1iZXI7XG4gIHByaXZhdGUgd2F2ZWZvcm1UeXBlOiBPc2NpbGxhdG9yVHlwZTtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IE9zY2lsbGF0b3JTb3VuZEdlbmVyYXRvck9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPE9zY2lsbGF0b3JTb3VuZEdlbmVyYXRvck9wdGlvbnMsIFNlbGZPcHRpb25zLCBTb3VuZEdlbmVyYXRvck9wdGlvbnM+KCkoIHtcbiAgICAgIGluaXRpYWxGcmVxdWVuY3k6IDQ0MCxcbiAgICAgIGluaXRpYWxXYXZlZm9ybVR5cGU6ICdzaW5lJ1xuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIC8vIHN0YXRlIGluaXRpYWxpemF0aW9uXG4gICAgdGhpcy5vc2NpbGxhdG9yTm9kZSA9IG51bGw7XG4gICAgdGhpcy5mcmVxdWVuY3kgPSBvcHRpb25zLmluaXRpYWxGcmVxdWVuY3k7XG4gICAgdGhpcy53YXZlZm9ybVR5cGUgPSBvcHRpb25zLmluaXRpYWxXYXZlZm9ybVR5cGU7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIHRoZSBvc2NpbGxhdG9yLiBUaGUgbmFtZSAncGxheScgaXMgdXNlZCBiZWNhdXNlIHRoaXMgaXMgY29tbW9ubHkgdXNlZCBpbiB0aGUgdGFtYm8gbGlicmFyeSBmb3Igc291bmRcbiAgICogZ2VuZXJhdG9ycy4gSWYgdGhlIG9zY2lsbGF0b3IgaXMgYWxyZWFkeSBwbGF5aW5nLCB0aGlzIGhhcyBubyBlZmZlY3QuXG4gICAqL1xuICBwdWJsaWMgcGxheSgpOiB2b2lkIHtcbiAgICBpZiAoICF0aGlzLm9zY2lsbGF0b3JOb2RlICkge1xuICAgICAgdGhpcy5vc2NpbGxhdG9yTm9kZSA9IHBoZXRBdWRpb0NvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpO1xuICAgICAgdGhpcy5vc2NpbGxhdG9yTm9kZS50eXBlID0gdGhpcy53YXZlZm9ybVR5cGU7XG4gICAgICB0aGlzLm9zY2lsbGF0b3JOb2RlLmZyZXF1ZW5jeS5zZXRWYWx1ZUF0VGltZSggdGhpcy5mcmVxdWVuY3ksIHBoZXRBdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKTtcbiAgICAgIHRoaXMub3NjaWxsYXRvck5vZGUuY29ubmVjdCggdGhpcy5tYWluR2Fpbk5vZGUgKTtcbiAgICAgIHRoaXMub3NjaWxsYXRvck5vZGUuc3RhcnQoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RvcHMgdGhlIG9zY2lsbGF0b3IuIElmIHRoZSBvc2NpbGxhdG9yIGlzbid0IHBsYXlpbmcsIHRoaXMgaGFzIG5vIGVmZmVjdC5cbiAgICovXG4gIHB1YmxpYyBzdG9wKCk6IHZvaWQge1xuICAgIGlmICggdGhpcy5vc2NpbGxhdG9yTm9kZSApIHtcbiAgICAgIHRoaXMub3NjaWxsYXRvck5vZGUuc3RvcCgpO1xuICAgICAgdGhpcy5vc2NpbGxhdG9yTm9kZSA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHdhdmVmb3JtIHR5cGUuXG4gICAqL1xuICBwdWJsaWMgc2V0V2F2ZWZvcm1UeXBlKCB3YXZlZm9ybVR5cGU6IE9zY2lsbGF0b3JUeXBlICk6IHZvaWQge1xuICAgIHRoaXMud2F2ZWZvcm1UeXBlID0gd2F2ZWZvcm1UeXBlO1xuICAgIGlmICggdGhpcy5vc2NpbGxhdG9yTm9kZSApIHtcbiAgICAgIHRoaXMub3NjaWxsYXRvck5vZGUudHlwZSA9IHdhdmVmb3JtVHlwZTtcbiAgICB9XG4gIH1cbn1cblxudGFtYm8ucmVnaXN0ZXIoICdPc2NpbGxhdG9yU291bmRHZW5lcmF0b3InLCBPc2NpbGxhdG9yU291bmRHZW5lcmF0b3IgKTtcblxuZXhwb3J0IGRlZmF1bHQgT3NjaWxsYXRvclNvdW5kR2VuZXJhdG9yOyJdLCJuYW1lcyI6WyJvcHRpb25pemUiLCJwaGV0QXVkaW9Db250ZXh0IiwidGFtYm8iLCJTb3VuZEdlbmVyYXRvciIsIk9zY2lsbGF0b3JTb3VuZEdlbmVyYXRvciIsInBsYXkiLCJvc2NpbGxhdG9yTm9kZSIsImNyZWF0ZU9zY2lsbGF0b3IiLCJ0eXBlIiwid2F2ZWZvcm1UeXBlIiwiZnJlcXVlbmN5Iiwic2V0VmFsdWVBdFRpbWUiLCJjdXJyZW50VGltZSIsImNvbm5lY3QiLCJtYWluR2Fpbk5vZGUiLCJzdGFydCIsInN0b3AiLCJzZXRXYXZlZm9ybVR5cGUiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiaW5pdGlhbEZyZXF1ZW5jeSIsImluaXRpYWxXYXZlZm9ybVR5cGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EsZUFBZSxxQ0FBcUM7QUFDM0QsT0FBT0Msc0JBQXNCLHlCQUF5QjtBQUN0RCxPQUFPQyxXQUFXLGNBQWM7QUFDaEMsT0FBT0Msb0JBQStDLHNCQUFzQjtBQVk1RSxJQUFBLEFBQU1DLDJCQUFOLE1BQU1BLGlDQUFpQ0Q7SUF5QnJDOzs7R0FHQyxHQUNELEFBQU9FLE9BQWE7UUFDbEIsSUFBSyxDQUFDLElBQUksQ0FBQ0MsY0FBYyxFQUFHO1lBQzFCLElBQUksQ0FBQ0EsY0FBYyxHQUFHTCxpQkFBaUJNLGdCQUFnQjtZQUN2RCxJQUFJLENBQUNELGNBQWMsQ0FBQ0UsSUFBSSxHQUFHLElBQUksQ0FBQ0MsWUFBWTtZQUM1QyxJQUFJLENBQUNILGNBQWMsQ0FBQ0ksU0FBUyxDQUFDQyxjQUFjLENBQUUsSUFBSSxDQUFDRCxTQUFTLEVBQUVULGlCQUFpQlcsV0FBVztZQUMxRixJQUFJLENBQUNOLGNBQWMsQ0FBQ08sT0FBTyxDQUFFLElBQUksQ0FBQ0MsWUFBWTtZQUM5QyxJQUFJLENBQUNSLGNBQWMsQ0FBQ1MsS0FBSztRQUMzQjtJQUNGO0lBRUE7O0dBRUMsR0FDRCxBQUFPQyxPQUFhO1FBQ2xCLElBQUssSUFBSSxDQUFDVixjQUFjLEVBQUc7WUFDekIsSUFBSSxDQUFDQSxjQUFjLENBQUNVLElBQUk7WUFDeEIsSUFBSSxDQUFDVixjQUFjLEdBQUc7UUFDeEI7SUFDRjtJQUVBOztHQUVDLEdBQ0QsQUFBT1csZ0JBQWlCUixZQUE0QixFQUFTO1FBQzNELElBQUksQ0FBQ0EsWUFBWSxHQUFHQTtRQUNwQixJQUFLLElBQUksQ0FBQ0gsY0FBYyxFQUFHO1lBQ3pCLElBQUksQ0FBQ0EsY0FBYyxDQUFDRSxJQUFJLEdBQUdDO1FBQzdCO0lBQ0Y7SUEvQ0EsWUFBb0JTLGVBQWlELENBQUc7UUFFdEUsTUFBTUMsVUFBVW5CLFlBQWtGO1lBQ2hHb0Isa0JBQWtCO1lBQ2xCQyxxQkFBcUI7UUFDdkIsR0FBR0g7UUFFSCxLQUFLLENBQUVDO1FBRVAsdUJBQXVCO1FBQ3ZCLElBQUksQ0FBQ2IsY0FBYyxHQUFHO1FBQ3RCLElBQUksQ0FBQ0ksU0FBUyxHQUFHUyxRQUFRQyxnQkFBZ0I7UUFDekMsSUFBSSxDQUFDWCxZQUFZLEdBQUdVLFFBQVFFLG1CQUFtQjtJQUNqRDtBQW1DRjtBQUVBbkIsTUFBTW9CLFFBQVEsQ0FBRSw0QkFBNEJsQjtBQUU1QyxlQUFlQSx5QkFBeUIifQ==