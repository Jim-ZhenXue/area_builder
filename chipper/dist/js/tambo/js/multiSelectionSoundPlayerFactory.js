// Copyright 2019-2022, University of Colorado Boulder
/**
 * The multiSelectionSoundPlayerFactory singleton is used to create a set of sound players that are similar to one
 * another but slightly different, and can thus be used to sonically indicate that a selection is being made from a
 * group of available options. It was originally developed to support radio buttons (and was called
 * radioButtonSoundPlayerFactory), but its usage was expanded to combo boxes, so the name was generalized.  It may be
 * appropriate to use in other contexts as well.
 *
 * By providing a factory for these sound players, we can avoid having to construct unique instances for each case where
 * a sound player is needed, thus conserving memory and minimizing load time.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */ import radioButtonV2_mp3 from '../sounds/radioButtonV2_mp3.js';
import SoundClip from './sound-generators/SoundClip.js';
import soundManager from './soundManager.js';
import tambo from './tambo.js';
let MultiSelectionSoundPlayerFactory = class MultiSelectionSoundPlayerFactory {
    /**
   * get the single instance of the sound player, and create it if it doesn't exist yet
   */ getSoundClipInstance() {
        if (!this._basisSoundClip) {
            this._basisSoundClip = new SoundClip(radioButtonV2_mp3, {
                initialOutputLevel: 0.7,
                rateChangesAffectPlayingSounds: false
            });
            // automatically register the sound generator
            soundManager.addSoundGenerator(this._basisSoundClip, {
                categoryName: 'user-interface'
            });
        }
        return this._basisSoundClip;
    }
    /**
   * Get a sound player for the specified position that will produce a sound that varies from the primary sound based on
   * provided parameter.
   * @param positionIndex - the position within the radio button group, combo box, or whatever
   */ getSelectionSoundPlayer(positionIndex) {
        if (!this.soundPlayers[positionIndex]) {
            // calculate a playback rate that starts from the natural frequency of the sound and goes down by whole tones
            const playbackRate = Math.pow(2, -positionIndex / 12);
            // create the sound player for this rate
            this.soundPlayers[positionIndex] = new FixedSpeedSoundClipPlayer(this.getSoundClipInstance(), playbackRate);
        }
        // return the sound player that corresponds to this position in the radio button group
        return this.soundPlayers[positionIndex];
    }
    constructor(){
        this._basisSoundClip = null;
        this.soundPlayers = [];
    }
};
/**
 * FixedSpeedSoundClipPlayer is an inner class that plays a sound clip at the provided playback rate.  The general
 * idea here is that one sound clip can be used at a number of different speeds, thus saving memory and load time
 * versus having a bunch of separate instances.  The provided sound clip is assumed to be registered with the sound
 * manager already, this class does not register it.
 */ let FixedSpeedSoundClipPlayer = class FixedSpeedSoundClipPlayer {
    play() {
        this.soundPlayer.setPlaybackRate(this.playbackRate);
        this.soundPlayer.play();
    }
    stop() {
        this.soundPlayer.stop();
    }
    constructor(soundPlayer, playbackRate){
        this.soundPlayer = soundPlayer;
        this.playbackRate = playbackRate;
    }
};
const multiSelectionSoundPlayerFactory = new MultiSelectionSoundPlayerFactory();
tambo.register('multiSelectionSoundPlayerFactory', multiSelectionSoundPlayerFactory);
export default multiSelectionSoundPlayerFactory;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL211bHRpU2VsZWN0aW9uU291bmRQbGF5ZXJGYWN0b3J5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRoZSBtdWx0aVNlbGVjdGlvblNvdW5kUGxheWVyRmFjdG9yeSBzaW5nbGV0b24gaXMgdXNlZCB0byBjcmVhdGUgYSBzZXQgb2Ygc291bmQgcGxheWVycyB0aGF0IGFyZSBzaW1pbGFyIHRvIG9uZVxuICogYW5vdGhlciBidXQgc2xpZ2h0bHkgZGlmZmVyZW50LCBhbmQgY2FuIHRodXMgYmUgdXNlZCB0byBzb25pY2FsbHkgaW5kaWNhdGUgdGhhdCBhIHNlbGVjdGlvbiBpcyBiZWluZyBtYWRlIGZyb20gYVxuICogZ3JvdXAgb2YgYXZhaWxhYmxlIG9wdGlvbnMuIEl0IHdhcyBvcmlnaW5hbGx5IGRldmVsb3BlZCB0byBzdXBwb3J0IHJhZGlvIGJ1dHRvbnMgKGFuZCB3YXMgY2FsbGVkXG4gKiByYWRpb0J1dHRvblNvdW5kUGxheWVyRmFjdG9yeSksIGJ1dCBpdHMgdXNhZ2Ugd2FzIGV4cGFuZGVkIHRvIGNvbWJvIGJveGVzLCBzbyB0aGUgbmFtZSB3YXMgZ2VuZXJhbGl6ZWQuICBJdCBtYXkgYmVcbiAqIGFwcHJvcHJpYXRlIHRvIHVzZSBpbiBvdGhlciBjb250ZXh0cyBhcyB3ZWxsLlxuICpcbiAqIEJ5IHByb3ZpZGluZyBhIGZhY3RvcnkgZm9yIHRoZXNlIHNvdW5kIHBsYXllcnMsIHdlIGNhbiBhdm9pZCBoYXZpbmcgdG8gY29uc3RydWN0IHVuaXF1ZSBpbnN0YW5jZXMgZm9yIGVhY2ggY2FzZSB3aGVyZVxuICogYSBzb3VuZCBwbGF5ZXIgaXMgbmVlZGVkLCB0aHVzIGNvbnNlcnZpbmcgbWVtb3J5IGFuZCBtaW5pbWl6aW5nIGxvYWQgdGltZS5cbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCByYWRpb0J1dHRvblYyX21wMyBmcm9tICcuLi9zb3VuZHMvcmFkaW9CdXR0b25WMl9tcDMuanMnO1xuaW1wb3J0IFNvdW5kQ2xpcCBmcm9tICcuL3NvdW5kLWdlbmVyYXRvcnMvU291bmRDbGlwLmpzJztcbmltcG9ydCBzb3VuZE1hbmFnZXIgZnJvbSAnLi9zb3VuZE1hbmFnZXIuanMnO1xuaW1wb3J0IHRhbWJvIGZyb20gJy4vdGFtYm8uanMnO1xuaW1wb3J0IFRTb3VuZFBsYXllciBmcm9tICcuL1RTb3VuZFBsYXllci5qcyc7XG5cbmNsYXNzIE11bHRpU2VsZWN0aW9uU291bmRQbGF5ZXJGYWN0b3J5IHtcblxuICAvLyBzb3VuZCBjbGlwIHRoYXQgd2lsbCBzZXJ2ZSBhcyB0aGUgYmFzaXMgZm9yIGFsbCBzb3VuZCBwbGF5cywgd2lsbCBiZSBjb25zdHJ1Y3RlZCB0aGUgZmlyc3QgdGltZSBpdCBpcyByZXF1ZXN0ZWRcbiAgcHJpdmF0ZSBfYmFzaXNTb3VuZENsaXA6IFNvdW5kQ2xpcCB8IG51bGw7XG5cbiAgLy8gaW5zdGFuY2VzIG9mIHNvdW5kIHBsYXllcnMsIGluZGV4ZWQgYnkgcG9zaXRpb24gaW4gdGhlIGdyb3VwLCBjcmVhdGVkIGFzIG5lZWRlZFxuICBwcml2YXRlIHJlYWRvbmx5IHNvdW5kUGxheWVyczogVFNvdW5kUGxheWVyW107XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2Jhc2lzU291bmRDbGlwID0gbnVsbDtcbiAgICB0aGlzLnNvdW5kUGxheWVycyA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIGdldCB0aGUgc2luZ2xlIGluc3RhbmNlIG9mIHRoZSBzb3VuZCBwbGF5ZXIsIGFuZCBjcmVhdGUgaXQgaWYgaXQgZG9lc24ndCBleGlzdCB5ZXRcbiAgICovXG4gIHByaXZhdGUgZ2V0U291bmRDbGlwSW5zdGFuY2UoKTogU291bmRDbGlwIHtcbiAgICBpZiAoICF0aGlzLl9iYXNpc1NvdW5kQ2xpcCApIHtcbiAgICAgIHRoaXMuX2Jhc2lzU291bmRDbGlwID0gbmV3IFNvdW5kQ2xpcCggcmFkaW9CdXR0b25WMl9tcDMsIHtcbiAgICAgICAgaW5pdGlhbE91dHB1dExldmVsOiAwLjcsXG4gICAgICAgIHJhdGVDaGFuZ2VzQWZmZWN0UGxheWluZ1NvdW5kczogZmFsc2VcbiAgICAgIH0gKTtcblxuICAgICAgLy8gYXV0b21hdGljYWxseSByZWdpc3RlciB0aGUgc291bmQgZ2VuZXJhdG9yXG4gICAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoIHRoaXMuX2Jhc2lzU291bmRDbGlwLCB7IGNhdGVnb3J5TmFtZTogJ3VzZXItaW50ZXJmYWNlJyB9ICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9iYXNpc1NvdW5kQ2xpcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBzb3VuZCBwbGF5ZXIgZm9yIHRoZSBzcGVjaWZpZWQgcG9zaXRpb24gdGhhdCB3aWxsIHByb2R1Y2UgYSBzb3VuZCB0aGF0IHZhcmllcyBmcm9tIHRoZSBwcmltYXJ5IHNvdW5kIGJhc2VkIG9uXG4gICAqIHByb3ZpZGVkIHBhcmFtZXRlci5cbiAgICogQHBhcmFtIHBvc2l0aW9uSW5kZXggLSB0aGUgcG9zaXRpb24gd2l0aGluIHRoZSByYWRpbyBidXR0b24gZ3JvdXAsIGNvbWJvIGJveCwgb3Igd2hhdGV2ZXJcbiAgICovXG4gIHB1YmxpYyBnZXRTZWxlY3Rpb25Tb3VuZFBsYXllciggcG9zaXRpb25JbmRleDogbnVtYmVyICk6IFRTb3VuZFBsYXllciB7XG5cbiAgICBpZiAoICF0aGlzLnNvdW5kUGxheWVyc1sgcG9zaXRpb25JbmRleCBdICkge1xuXG4gICAgICAvLyBjYWxjdWxhdGUgYSBwbGF5YmFjayByYXRlIHRoYXQgc3RhcnRzIGZyb20gdGhlIG5hdHVyYWwgZnJlcXVlbmN5IG9mIHRoZSBzb3VuZCBhbmQgZ29lcyBkb3duIGJ5IHdob2xlIHRvbmVzXG4gICAgICBjb25zdCBwbGF5YmFja1JhdGUgPSBNYXRoLnBvdyggMiwgLXBvc2l0aW9uSW5kZXggLyAxMiApO1xuXG4gICAgICAvLyBjcmVhdGUgdGhlIHNvdW5kIHBsYXllciBmb3IgdGhpcyByYXRlXG4gICAgICB0aGlzLnNvdW5kUGxheWVyc1sgcG9zaXRpb25JbmRleCBdID0gbmV3IEZpeGVkU3BlZWRTb3VuZENsaXBQbGF5ZXIoXG4gICAgICAgIHRoaXMuZ2V0U291bmRDbGlwSW5zdGFuY2UoKSxcbiAgICAgICAgcGxheWJhY2tSYXRlXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIHJldHVybiB0aGUgc291bmQgcGxheWVyIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhpcyBwb3NpdGlvbiBpbiB0aGUgcmFkaW8gYnV0dG9uIGdyb3VwXG4gICAgcmV0dXJuIHRoaXMuc291bmRQbGF5ZXJzWyBwb3NpdGlvbkluZGV4IF07XG4gIH1cbn1cblxuLyoqXG4gKiBGaXhlZFNwZWVkU291bmRDbGlwUGxheWVyIGlzIGFuIGlubmVyIGNsYXNzIHRoYXQgcGxheXMgYSBzb3VuZCBjbGlwIGF0IHRoZSBwcm92aWRlZCBwbGF5YmFjayByYXRlLiAgVGhlIGdlbmVyYWxcbiAqIGlkZWEgaGVyZSBpcyB0aGF0IG9uZSBzb3VuZCBjbGlwIGNhbiBiZSB1c2VkIGF0IGEgbnVtYmVyIG9mIGRpZmZlcmVudCBzcGVlZHMsIHRodXMgc2F2aW5nIG1lbW9yeSBhbmQgbG9hZCB0aW1lXG4gKiB2ZXJzdXMgaGF2aW5nIGEgYnVuY2ggb2Ygc2VwYXJhdGUgaW5zdGFuY2VzLiAgVGhlIHByb3ZpZGVkIHNvdW5kIGNsaXAgaXMgYXNzdW1lZCB0byBiZSByZWdpc3RlcmVkIHdpdGggdGhlIHNvdW5kXG4gKiBtYW5hZ2VyIGFscmVhZHksIHRoaXMgY2xhc3MgZG9lcyBub3QgcmVnaXN0ZXIgaXQuXG4gKi9cbmNsYXNzIEZpeGVkU3BlZWRTb3VuZENsaXBQbGF5ZXIge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgc291bmRQbGF5ZXI6IFNvdW5kQ2xpcDtcbiAgcHJpdmF0ZSByZWFkb25seSBwbGF5YmFja1JhdGU6IG51bWJlcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHNvdW5kUGxheWVyOiBTb3VuZENsaXAsIHBsYXliYWNrUmF0ZTogbnVtYmVyICkge1xuICAgIHRoaXMuc291bmRQbGF5ZXIgPSBzb3VuZFBsYXllcjtcbiAgICB0aGlzLnBsYXliYWNrUmF0ZSA9IHBsYXliYWNrUmF0ZTtcbiAgfVxuXG4gIHB1YmxpYyBwbGF5KCk6IHZvaWQge1xuICAgIHRoaXMuc291bmRQbGF5ZXIuc2V0UGxheWJhY2tSYXRlKCB0aGlzLnBsYXliYWNrUmF0ZSApO1xuICAgIHRoaXMuc291bmRQbGF5ZXIucGxheSgpO1xuICB9XG5cbiAgcHVibGljIHN0b3AoKTogdm9pZCB7XG4gICAgdGhpcy5zb3VuZFBsYXllci5zdG9wKCk7XG4gIH1cbn1cblxuY29uc3QgbXVsdGlTZWxlY3Rpb25Tb3VuZFBsYXllckZhY3RvcnkgPSBuZXcgTXVsdGlTZWxlY3Rpb25Tb3VuZFBsYXllckZhY3RvcnkoKTtcbnRhbWJvLnJlZ2lzdGVyKCAnbXVsdGlTZWxlY3Rpb25Tb3VuZFBsYXllckZhY3RvcnknLCBtdWx0aVNlbGVjdGlvblNvdW5kUGxheWVyRmFjdG9yeSApO1xuZXhwb3J0IGRlZmF1bHQgbXVsdGlTZWxlY3Rpb25Tb3VuZFBsYXllckZhY3Rvcnk7Il0sIm5hbWVzIjpbInJhZGlvQnV0dG9uVjJfbXAzIiwiU291bmRDbGlwIiwic291bmRNYW5hZ2VyIiwidGFtYm8iLCJNdWx0aVNlbGVjdGlvblNvdW5kUGxheWVyRmFjdG9yeSIsImdldFNvdW5kQ2xpcEluc3RhbmNlIiwiX2Jhc2lzU291bmRDbGlwIiwiaW5pdGlhbE91dHB1dExldmVsIiwicmF0ZUNoYW5nZXNBZmZlY3RQbGF5aW5nU291bmRzIiwiYWRkU291bmRHZW5lcmF0b3IiLCJjYXRlZ29yeU5hbWUiLCJnZXRTZWxlY3Rpb25Tb3VuZFBsYXllciIsInBvc2l0aW9uSW5kZXgiLCJzb3VuZFBsYXllcnMiLCJwbGF5YmFja1JhdGUiLCJNYXRoIiwicG93IiwiRml4ZWRTcGVlZFNvdW5kQ2xpcFBsYXllciIsInBsYXkiLCJzb3VuZFBsYXllciIsInNldFBsYXliYWNrUmF0ZSIsInN0b3AiLCJtdWx0aVNlbGVjdGlvblNvdW5kUGxheWVyRmFjdG9yeSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7O0NBV0MsR0FFRCxPQUFPQSx1QkFBdUIsaUNBQWlDO0FBQy9ELE9BQU9DLGVBQWUsa0NBQWtDO0FBQ3hELE9BQU9DLGtCQUFrQixvQkFBb0I7QUFDN0MsT0FBT0MsV0FBVyxhQUFhO0FBRy9CLElBQUEsQUFBTUMsbUNBQU4sTUFBTUE7SUFhSjs7R0FFQyxHQUNELEFBQVFDLHVCQUFrQztRQUN4QyxJQUFLLENBQUMsSUFBSSxDQUFDQyxlQUFlLEVBQUc7WUFDM0IsSUFBSSxDQUFDQSxlQUFlLEdBQUcsSUFBSUwsVUFBV0QsbUJBQW1CO2dCQUN2RE8sb0JBQW9CO2dCQUNwQkMsZ0NBQWdDO1lBQ2xDO1lBRUEsNkNBQTZDO1lBQzdDTixhQUFhTyxpQkFBaUIsQ0FBRSxJQUFJLENBQUNILGVBQWUsRUFBRTtnQkFBRUksY0FBYztZQUFpQjtRQUN6RjtRQUNBLE9BQU8sSUFBSSxDQUFDSixlQUFlO0lBQzdCO0lBRUE7Ozs7R0FJQyxHQUNELEFBQU9LLHdCQUF5QkMsYUFBcUIsRUFBaUI7UUFFcEUsSUFBSyxDQUFDLElBQUksQ0FBQ0MsWUFBWSxDQUFFRCxjQUFlLEVBQUc7WUFFekMsNkdBQTZHO1lBQzdHLE1BQU1FLGVBQWVDLEtBQUtDLEdBQUcsQ0FBRSxHQUFHLENBQUNKLGdCQUFnQjtZQUVuRCx3Q0FBd0M7WUFDeEMsSUFBSSxDQUFDQyxZQUFZLENBQUVELGNBQWUsR0FBRyxJQUFJSywwQkFDdkMsSUFBSSxDQUFDWixvQkFBb0IsSUFDekJTO1FBRUo7UUFFQSxzRkFBc0Y7UUFDdEYsT0FBTyxJQUFJLENBQUNELFlBQVksQ0FBRUQsY0FBZTtJQUMzQztJQTFDQSxhQUFxQjtRQUNuQixJQUFJLENBQUNOLGVBQWUsR0FBRztRQUN2QixJQUFJLENBQUNPLFlBQVksR0FBRyxFQUFFO0lBQ3hCO0FBd0NGO0FBRUE7Ozs7O0NBS0MsR0FDRCxJQUFBLEFBQU1JLDRCQUFOLE1BQU1BO0lBVUdDLE9BQWE7UUFDbEIsSUFBSSxDQUFDQyxXQUFXLENBQUNDLGVBQWUsQ0FBRSxJQUFJLENBQUNOLFlBQVk7UUFDbkQsSUFBSSxDQUFDSyxXQUFXLENBQUNELElBQUk7SUFDdkI7SUFFT0csT0FBYTtRQUNsQixJQUFJLENBQUNGLFdBQVcsQ0FBQ0UsSUFBSTtJQUN2QjtJQVpBLFlBQW9CRixXQUFzQixFQUFFTCxZQUFvQixDQUFHO1FBQ2pFLElBQUksQ0FBQ0ssV0FBVyxHQUFHQTtRQUNuQixJQUFJLENBQUNMLFlBQVksR0FBR0E7SUFDdEI7QUFVRjtBQUVBLE1BQU1RLG1DQUFtQyxJQUFJbEI7QUFDN0NELE1BQU1vQixRQUFRLENBQUUsb0NBQW9DRDtBQUNwRCxlQUFlQSxpQ0FBaUMifQ==