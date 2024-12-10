// Copyright 2013-2022, University of Colorado Boulder
/**
 * Game timer, keeps track of the elapsed time in the game using "wall clock" time. The frame rate of this clock is
 * sufficient for displaying a game timer in "seconds", but not for driving smooth animation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import BooleanProperty from '../../axon/js/BooleanProperty.js';
import NumberProperty from '../../axon/js/NumberProperty.js';
import stepTimer from '../../axon/js/stepTimer.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import vegas from './vegas.js';
import VegasStrings from './VegasStrings.js';
let GameTimer = class GameTimer {
    reset() {
        this.isRunningProperty.reset();
        this.elapsedTimeProperty.reset();
    }
    /**
   * Starts the timer. This is a no-op if the timer is already running.
   */ start() {
        if (!this.isRunningProperty.value) {
            this.elapsedTimeProperty.value = 0;
            this.intervalId = stepTimer.setInterval(()=>{
                this.elapsedTimeProperty.value = this.elapsedTimeProperty.value + 1;
            }, 1000); // fire once per second
            this.isRunningProperty.value = true;
        }
    }
    /**
   * Stops the timer. This is a no-op if the timer is already stopped.
   */ stop() {
        if (this.isRunningProperty.value) {
            stepTimer.clearInterval(this.intervalId);
            this.intervalId = null;
            this.isRunningProperty.value = false;
        }
    }
    /**
   * Convenience function for restarting the timer.
   */ restart() {
        this.stop();
        this.start();
    }
    /**
   * Formats a value representing seconds into H:MM:SS (localized).
   */ static formatTime(time) {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time - hours * 3600) / 60);
        const seconds = Math.floor(time - hours * 3600 - minutes * 60);
        const minutesString = minutes > 9 || hours === 0 ? minutes : `0${minutes}`;
        const secondsString = seconds > 9 ? seconds : `0${seconds}`;
        if (hours > 0) {
            return StringUtils.format(VegasStrings.pattern['0hours']['1minutes']['2secondsStringProperty'].value, hours, minutesString, secondsString);
        } else {
            return StringUtils.format(VegasStrings.pattern['0minutes']['1secondsStringProperty'].value, minutesString, secondsString);
        }
    }
    constructor(){
        this.isRunningProperty = new BooleanProperty(false);
        this.elapsedTimeProperty = new NumberProperty(0);
        this.intervalId = null;
    }
};
export { GameTimer as default };
vegas.register('GameTimer', GameTimer);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL0dhbWVUaW1lci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBHYW1lIHRpbWVyLCBrZWVwcyB0cmFjayBvZiB0aGUgZWxhcHNlZCB0aW1lIGluIHRoZSBnYW1lIHVzaW5nIFwid2FsbCBjbG9ja1wiIHRpbWUuIFRoZSBmcmFtZSByYXRlIG9mIHRoaXMgY2xvY2sgaXNcbiAqIHN1ZmZpY2llbnQgZm9yIGRpc3BsYXlpbmcgYSBnYW1lIHRpbWVyIGluIFwic2Vjb25kc1wiLCBidXQgbm90IGZvciBkcml2aW5nIHNtb290aCBhbmltYXRpb24uXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBzdGVwVGltZXIgZnJvbSAnLi4vLi4vYXhvbi9qcy9zdGVwVGltZXIuanMnO1xuaW1wb3J0IHsgVGltZXJMaXN0ZW5lciB9IGZyb20gJy4uLy4uL2F4b24vanMvVGltZXIuanMnO1xuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XG5pbXBvcnQgdmVnYXMgZnJvbSAnLi92ZWdhcy5qcyc7XG5pbXBvcnQgVmVnYXNTdHJpbmdzIGZyb20gJy4vVmVnYXNTdHJpbmdzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZVRpbWVyIHtcblxuICAvLyB3aGV0aGVyIHRoZSB0aW1lciBpcyBydW5uaW5nXG4gIHB1YmxpYyByZWFkb25seSBpc1J1bm5pbmdQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XG5cbiAgLy8gc2Vjb25kcyBzaW5jZSB0aGUgdGltZXIgd2FzIHN0YXJ0ZWRcbiAgcHVibGljIHJlYWRvbmx5IGVsYXBzZWRUaW1lUHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj47XG5cbiAgLy8gc2VlIFRpbWVyLnNldEludGVydmFsIGFuZCBjbGVhckludGVydmFsXG4gIHByaXZhdGUgaW50ZXJ2YWxJZDogVGltZXJMaXN0ZW5lciB8IG51bGw7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuaXNSdW5uaW5nUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xuICAgIHRoaXMuZWxhcHNlZFRpbWVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApO1xuICAgIHRoaXMuaW50ZXJ2YWxJZCA9IG51bGw7XG4gIH1cblxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5pc1J1bm5pbmdQcm9wZXJ0eS5yZXNldCgpO1xuICAgIHRoaXMuZWxhcHNlZFRpbWVQcm9wZXJ0eS5yZXNldCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgdGltZXIuIFRoaXMgaXMgYSBuby1vcCBpZiB0aGUgdGltZXIgaXMgYWxyZWFkeSBydW5uaW5nLlxuICAgKi9cbiAgcHVibGljIHN0YXJ0KCk6IHZvaWQge1xuICAgIGlmICggIXRoaXMuaXNSdW5uaW5nUHJvcGVydHkudmFsdWUgKSB7XG4gICAgICB0aGlzLmVsYXBzZWRUaW1lUHJvcGVydHkudmFsdWUgPSAwO1xuICAgICAgdGhpcy5pbnRlcnZhbElkID0gc3RlcFRpbWVyLnNldEludGVydmFsKCAoKSA9PiB7XG4gICAgICAgIHRoaXMuZWxhcHNlZFRpbWVQcm9wZXJ0eS52YWx1ZSA9IHRoaXMuZWxhcHNlZFRpbWVQcm9wZXJ0eS52YWx1ZSArIDE7XG4gICAgICB9LCAxMDAwICk7IC8vIGZpcmUgb25jZSBwZXIgc2Vjb25kXG4gICAgICB0aGlzLmlzUnVubmluZ1Byb3BlcnR5LnZhbHVlID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RvcHMgdGhlIHRpbWVyLiBUaGlzIGlzIGEgbm8tb3AgaWYgdGhlIHRpbWVyIGlzIGFscmVhZHkgc3RvcHBlZC5cbiAgICovXG4gIHB1YmxpYyBzdG9wKCk6IHZvaWQge1xuICAgIGlmICggdGhpcy5pc1J1bm5pbmdQcm9wZXJ0eS52YWx1ZSApIHtcbiAgICAgIHN0ZXBUaW1lci5jbGVhckludGVydmFsKCB0aGlzLmludGVydmFsSWQhICk7XG4gICAgICB0aGlzLmludGVydmFsSWQgPSBudWxsO1xuICAgICAgdGhpcy5pc1J1bm5pbmdQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZW5pZW5jZSBmdW5jdGlvbiBmb3IgcmVzdGFydGluZyB0aGUgdGltZXIuXG4gICAqL1xuICBwdWJsaWMgcmVzdGFydCgpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3AoKTtcbiAgICB0aGlzLnN0YXJ0KCk7XG4gIH1cblxuICAvKipcbiAgICogRm9ybWF0cyBhIHZhbHVlIHJlcHJlc2VudGluZyBzZWNvbmRzIGludG8gSDpNTTpTUyAobG9jYWxpemVkKS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZm9ybWF0VGltZSggdGltZTogbnVtYmVyICk6IHN0cmluZyB7XG5cbiAgICBjb25zdCBob3VycyA9IE1hdGguZmxvb3IoIHRpbWUgLyAzNjAwICk7XG4gICAgY29uc3QgbWludXRlcyA9IE1hdGguZmxvb3IoICggdGltZSAtICggaG91cnMgKiAzNjAwICkgKSAvIDYwICk7XG4gICAgY29uc3Qgc2Vjb25kcyA9IE1hdGguZmxvb3IoIHRpbWUgLSAoIGhvdXJzICogMzYwMCApIC0gKCBtaW51dGVzICogNjAgKSApO1xuXG4gICAgY29uc3QgbWludXRlc1N0cmluZyA9ICggbWludXRlcyA+IDkgfHwgaG91cnMgPT09IDAgKSA/IG1pbnV0ZXMgOiAoIGAwJHttaW51dGVzfWAgKTtcbiAgICBjb25zdCBzZWNvbmRzU3RyaW5nID0gKCBzZWNvbmRzID4gOSApID8gc2Vjb25kcyA6ICggYDAke3NlY29uZHN9YCApO1xuXG4gICAgaWYgKCBob3VycyA+IDAgKSB7XG4gICAgICByZXR1cm4gU3RyaW5nVXRpbHMuZm9ybWF0KCBWZWdhc1N0cmluZ3MucGF0dGVyblsgJzBob3VycycgXVsgJzFtaW51dGVzJyBdWyAnMnNlY29uZHNTdHJpbmdQcm9wZXJ0eScgXS52YWx1ZSxcbiAgICAgICAgaG91cnMsIG1pbnV0ZXNTdHJpbmcsIHNlY29uZHNTdHJpbmcgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gU3RyaW5nVXRpbHMuZm9ybWF0KCBWZWdhc1N0cmluZ3MucGF0dGVyblsgJzBtaW51dGVzJyBdWyAnMXNlY29uZHNTdHJpbmdQcm9wZXJ0eScgXS52YWx1ZSxcbiAgICAgICAgbWludXRlc1N0cmluZywgc2Vjb25kc1N0cmluZyApO1xuICAgIH1cbiAgfVxufVxuXG52ZWdhcy5yZWdpc3RlciggJ0dhbWVUaW1lcicsIEdhbWVUaW1lciApOyJdLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsInN0ZXBUaW1lciIsIlN0cmluZ1V0aWxzIiwidmVnYXMiLCJWZWdhc1N0cmluZ3MiLCJHYW1lVGltZXIiLCJyZXNldCIsImlzUnVubmluZ1Byb3BlcnR5IiwiZWxhcHNlZFRpbWVQcm9wZXJ0eSIsInN0YXJ0IiwidmFsdWUiLCJpbnRlcnZhbElkIiwic2V0SW50ZXJ2YWwiLCJzdG9wIiwiY2xlYXJJbnRlcnZhbCIsInJlc3RhcnQiLCJmb3JtYXRUaW1lIiwidGltZSIsImhvdXJzIiwiTWF0aCIsImZsb29yIiwibWludXRlcyIsInNlY29uZHMiLCJtaW51dGVzU3RyaW5nIiwic2Vjb25kc1N0cmluZyIsImZvcm1hdCIsInBhdHRlcm4iLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EscUJBQXFCLG1DQUFtQztBQUMvRCxPQUFPQyxvQkFBb0Isa0NBQWtDO0FBRTdELE9BQU9DLGVBQWUsNkJBQTZCO0FBRW5ELE9BQU9DLGlCQUFpQiwwQ0FBMEM7QUFDbEUsT0FBT0MsV0FBVyxhQUFhO0FBQy9CLE9BQU9DLGtCQUFrQixvQkFBb0I7QUFFOUIsSUFBQSxBQUFNQyxZQUFOLE1BQU1BO0lBaUJaQyxRQUFjO1FBQ25CLElBQUksQ0FBQ0MsaUJBQWlCLENBQUNELEtBQUs7UUFDNUIsSUFBSSxDQUFDRSxtQkFBbUIsQ0FBQ0YsS0FBSztJQUNoQztJQUVBOztHQUVDLEdBQ0QsQUFBT0csUUFBYztRQUNuQixJQUFLLENBQUMsSUFBSSxDQUFDRixpQkFBaUIsQ0FBQ0csS0FBSyxFQUFHO1lBQ25DLElBQUksQ0FBQ0YsbUJBQW1CLENBQUNFLEtBQUssR0FBRztZQUNqQyxJQUFJLENBQUNDLFVBQVUsR0FBR1YsVUFBVVcsV0FBVyxDQUFFO2dCQUN2QyxJQUFJLENBQUNKLG1CQUFtQixDQUFDRSxLQUFLLEdBQUcsSUFBSSxDQUFDRixtQkFBbUIsQ0FBQ0UsS0FBSyxHQUFHO1lBQ3BFLEdBQUcsT0FBUSx1QkFBdUI7WUFDbEMsSUFBSSxDQUFDSCxpQkFBaUIsQ0FBQ0csS0FBSyxHQUFHO1FBQ2pDO0lBQ0Y7SUFFQTs7R0FFQyxHQUNELEFBQU9HLE9BQWE7UUFDbEIsSUFBSyxJQUFJLENBQUNOLGlCQUFpQixDQUFDRyxLQUFLLEVBQUc7WUFDbENULFVBQVVhLGFBQWEsQ0FBRSxJQUFJLENBQUNILFVBQVU7WUFDeEMsSUFBSSxDQUFDQSxVQUFVLEdBQUc7WUFDbEIsSUFBSSxDQUFDSixpQkFBaUIsQ0FBQ0csS0FBSyxHQUFHO1FBQ2pDO0lBQ0Y7SUFFQTs7R0FFQyxHQUNELEFBQU9LLFVBQWdCO1FBQ3JCLElBQUksQ0FBQ0YsSUFBSTtRQUNULElBQUksQ0FBQ0osS0FBSztJQUNaO0lBRUE7O0dBRUMsR0FDRCxPQUFjTyxXQUFZQyxJQUFZLEVBQVc7UUFFL0MsTUFBTUMsUUFBUUMsS0FBS0MsS0FBSyxDQUFFSCxPQUFPO1FBQ2pDLE1BQU1JLFVBQVVGLEtBQUtDLEtBQUssQ0FBRSxBQUFFSCxDQUFBQSxPQUFTQyxRQUFRLElBQUssSUFBTTtRQUMxRCxNQUFNSSxVQUFVSCxLQUFLQyxLQUFLLENBQUVILE9BQVNDLFFBQVEsT0FBV0csVUFBVTtRQUVsRSxNQUFNRSxnQkFBZ0IsQUFBRUYsVUFBVSxLQUFLSCxVQUFVLElBQU1HLFVBQVksQ0FBQyxDQUFDLEVBQUVBLFNBQVM7UUFDaEYsTUFBTUcsZ0JBQWdCLEFBQUVGLFVBQVUsSUFBTUEsVUFBWSxDQUFDLENBQUMsRUFBRUEsU0FBUztRQUVqRSxJQUFLSixRQUFRLEdBQUk7WUFDZixPQUFPaEIsWUFBWXVCLE1BQU0sQ0FBRXJCLGFBQWFzQixPQUFPLENBQUUsU0FBVSxDQUFFLFdBQVksQ0FBRSx5QkFBMEIsQ0FBQ2hCLEtBQUssRUFDekdRLE9BQU9LLGVBQWVDO1FBQzFCLE9BQ0s7WUFDSCxPQUFPdEIsWUFBWXVCLE1BQU0sQ0FBRXJCLGFBQWFzQixPQUFPLENBQUUsV0FBWSxDQUFFLHlCQUEwQixDQUFDaEIsS0FBSyxFQUM3RmEsZUFBZUM7UUFDbkI7SUFDRjtJQS9EQSxhQUFxQjtRQUNuQixJQUFJLENBQUNqQixpQkFBaUIsR0FBRyxJQUFJUixnQkFBaUI7UUFDOUMsSUFBSSxDQUFDUyxtQkFBbUIsR0FBRyxJQUFJUixlQUFnQjtRQUMvQyxJQUFJLENBQUNXLFVBQVUsR0FBRztJQUNwQjtBQTRERjtBQTNFQSxTQUFxQk4sdUJBMkVwQjtBQUVERixNQUFNd0IsUUFBUSxDQUFFLGFBQWF0QiJ9