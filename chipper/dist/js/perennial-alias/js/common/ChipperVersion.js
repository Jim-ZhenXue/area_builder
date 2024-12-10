// Copyright 2017, University of Colorado Boulder
/**
 * Handles chipper version information, see https://github.com/phetsims/perennial/issues/78.
 * @author Matt Pennington (PhET Interactive Simulations)
 */ const assert = require('assert');
const fs = require('fs');
/**
 * TODO:  remove this workaround jsdoc once this file is in TypeScript, https://github.com/phetsims/perennial/issues/369
 * @type
 */ module.exports = function() {
    /**
   * @public
   * @constructor
   *
   * @param {number} major - The major part of the version (the 3 in 3.1.2)
   * @param {number} minor - The minor part of the version (the 1 in 3.1.2)
   * @param {number} maintenance - The maintenance part of the version (the 2 in 3.1.2)
   * @param {boolean} chipperSupportsOutputJSGruntTasks - Flag that indicates whether grunt supports the family of commands like `output-js-project`
   */ function ChipperVersion(major, minor, maintenance, chipperSupportsOutputJSGruntTasks) {
        assert(typeof major === 'number' && major >= 0 && major % 1 === 0, 'major version should be a non-negative integer');
        assert(typeof minor === 'number' && minor >= 0 && minor % 1 === 0, 'minor version should be a non-negative integer');
        assert(typeof maintenance === 'number' && maintenance >= 0 && maintenance % 1 === 0, 'maintenance version should be a non-negative integer');
        // @public {number}
        this.major = major;
        this.minor = minor;
        this.maintenance = maintenance;
        this.chipperSupportsOutputJSGruntTasks = chipperSupportsOutputJSGruntTasks;
    }
    // Can't rely on inherit existing
    ChipperVersion.prototype = {
        constructor: ChipperVersion,
        /**
     * Returns a string form of the version.
     * @public
     *
     * @returns {string}
     */ toString: function() {
            return `${this.major}.${this.minor}.${this.maintenance}`;
        }
    };
    ChipperVersion.getFromPackageJSON = function(packageJSON) {
        const versionString = packageJSON.version;
        const matches = versionString.match(/(\d+)\.(\d+)\.(\d+)/);
        if (!matches) {
            throw new Error(`could not parse chipper version: ${versionString}`);
        }
        const major = Number(matches[1]);
        const minor = Number(matches[2]);
        const maintenance = Number(matches[3]);
        const chipperSupportsOutputJSGruntTasks = packageJSON.phet && packageJSON.phet.chipperSupportsOutputJSGruntTasks;
        return new ChipperVersion(major, minor, maintenance, chipperSupportsOutputJSGruntTasks);
    };
    /**
   * Returns the chipper version of the currently-checked-out chipper repository.
   * @public
   *
   * @returns {ChipperVersion}
   */ ChipperVersion.getFromRepository = function() {
        return ChipperVersion.getFromPackageJSON(JSON.parse(fs.readFileSync('../chipper/package.json', 'utf8')));
    };
    return ChipperVersion;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vQ2hpcHBlclZlcnNpb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTcsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEhhbmRsZXMgY2hpcHBlciB2ZXJzaW9uIGluZm9ybWF0aW9uLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BlcmVubmlhbC9pc3N1ZXMvNzguXG4gKiBAYXV0aG9yIE1hdHQgUGVubmluZ3RvbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCAnYXNzZXJ0JyApO1xuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XG5cbi8qKlxuICogVE9ETzogIHJlbW92ZSB0aGlzIHdvcmthcm91bmQganNkb2Mgb25jZSB0aGlzIGZpbGUgaXMgaW4gVHlwZVNjcmlwdCwgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BlcmVubmlhbC9pc3N1ZXMvMzY5XG4gKiBAdHlwZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9ICggZnVuY3Rpb24oKSB7XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtYWpvciAtIFRoZSBtYWpvciBwYXJ0IG9mIHRoZSB2ZXJzaW9uICh0aGUgMyBpbiAzLjEuMilcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1pbm9yIC0gVGhlIG1pbm9yIHBhcnQgb2YgdGhlIHZlcnNpb24gKHRoZSAxIGluIDMuMS4yKVxuICAgKiBAcGFyYW0ge251bWJlcn0gbWFpbnRlbmFuY2UgLSBUaGUgbWFpbnRlbmFuY2UgcGFydCBvZiB0aGUgdmVyc2lvbiAodGhlIDIgaW4gMy4xLjIpXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gY2hpcHBlclN1cHBvcnRzT3V0cHV0SlNHcnVudFRhc2tzIC0gRmxhZyB0aGF0IGluZGljYXRlcyB3aGV0aGVyIGdydW50IHN1cHBvcnRzIHRoZSBmYW1pbHkgb2YgY29tbWFuZHMgbGlrZSBgb3V0cHV0LWpzLXByb2plY3RgXG4gICAqL1xuICBmdW5jdGlvbiBDaGlwcGVyVmVyc2lvbiggbWFqb3IsIG1pbm9yLCBtYWludGVuYW5jZSwgY2hpcHBlclN1cHBvcnRzT3V0cHV0SlNHcnVudFRhc2tzICkge1xuXG4gICAgYXNzZXJ0KCB0eXBlb2YgbWFqb3IgPT09ICdudW1iZXInICYmIG1ham9yID49IDAgJiYgbWFqb3IgJSAxID09PSAwLCAnbWFqb3IgdmVyc2lvbiBzaG91bGQgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlcicgKTtcbiAgICBhc3NlcnQoIHR5cGVvZiBtaW5vciA9PT0gJ251bWJlcicgJiYgbWlub3IgPj0gMCAmJiBtaW5vciAlIDEgPT09IDAsICdtaW5vciB2ZXJzaW9uIHNob3VsZCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyJyApO1xuICAgIGFzc2VydCggdHlwZW9mIG1haW50ZW5hbmNlID09PSAnbnVtYmVyJyAmJiBtYWludGVuYW5jZSA+PSAwICYmIG1haW50ZW5hbmNlICUgMSA9PT0gMCwgJ21haW50ZW5hbmNlIHZlcnNpb24gc2hvdWxkIGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXInICk7XG5cbiAgICAvLyBAcHVibGljIHtudW1iZXJ9XG4gICAgdGhpcy5tYWpvciA9IG1ham9yO1xuICAgIHRoaXMubWlub3IgPSBtaW5vcjtcbiAgICB0aGlzLm1haW50ZW5hbmNlID0gbWFpbnRlbmFuY2U7XG4gICAgdGhpcy5jaGlwcGVyU3VwcG9ydHNPdXRwdXRKU0dydW50VGFza3MgPSBjaGlwcGVyU3VwcG9ydHNPdXRwdXRKU0dydW50VGFza3M7XG4gIH1cblxuICAvLyBDYW4ndCByZWx5IG9uIGluaGVyaXQgZXhpc3RpbmdcbiAgQ2hpcHBlclZlcnNpb24ucHJvdG90eXBlID0ge1xuICAgIGNvbnN0cnVjdG9yOiBDaGlwcGVyVmVyc2lvbixcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgZm9ybSBvZiB0aGUgdmVyc2lvbi5cbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHRvU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLm1ham9yfS4ke3RoaXMubWlub3J9LiR7dGhpcy5tYWludGVuYW5jZX1gO1xuICAgIH1cbiAgfTtcblxuICBDaGlwcGVyVmVyc2lvbi5nZXRGcm9tUGFja2FnZUpTT04gPSBmdW5jdGlvbiggcGFja2FnZUpTT04gKSB7XG4gICAgY29uc3QgdmVyc2lvblN0cmluZyA9IHBhY2thZ2VKU09OLnZlcnNpb247XG5cbiAgICBjb25zdCBtYXRjaGVzID0gdmVyc2lvblN0cmluZy5tYXRjaCggLyhcXGQrKVxcLihcXGQrKVxcLihcXGQrKS8gKTtcblxuICAgIGlmICggIW1hdGNoZXMgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGBjb3VsZCBub3QgcGFyc2UgY2hpcHBlciB2ZXJzaW9uOiAke3ZlcnNpb25TdHJpbmd9YCApO1xuICAgIH1cblxuICAgIGNvbnN0IG1ham9yID0gTnVtYmVyKCBtYXRjaGVzWyAxIF0gKTtcbiAgICBjb25zdCBtaW5vciA9IE51bWJlciggbWF0Y2hlc1sgMiBdICk7XG4gICAgY29uc3QgbWFpbnRlbmFuY2UgPSBOdW1iZXIoIG1hdGNoZXNbIDMgXSApO1xuICAgIGNvbnN0IGNoaXBwZXJTdXBwb3J0c091dHB1dEpTR3J1bnRUYXNrcyA9IHBhY2thZ2VKU09OLnBoZXQgJiYgcGFja2FnZUpTT04ucGhldC5jaGlwcGVyU3VwcG9ydHNPdXRwdXRKU0dydW50VGFza3M7XG5cbiAgICByZXR1cm4gbmV3IENoaXBwZXJWZXJzaW9uKCBtYWpvciwgbWlub3IsIG1haW50ZW5hbmNlLCBjaGlwcGVyU3VwcG9ydHNPdXRwdXRKU0dydW50VGFza3MgKTtcbiAgfTtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY2hpcHBlciB2ZXJzaW9uIG9mIHRoZSBjdXJyZW50bHktY2hlY2tlZC1vdXQgY2hpcHBlciByZXBvc2l0b3J5LlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtDaGlwcGVyVmVyc2lvbn1cbiAgICovXG4gIENoaXBwZXJWZXJzaW9uLmdldEZyb21SZXBvc2l0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIENoaXBwZXJWZXJzaW9uLmdldEZyb21QYWNrYWdlSlNPTihcbiAgICAgIEpTT04ucGFyc2UoIGZzLnJlYWRGaWxlU3luYyggJy4uL2NoaXBwZXIvcGFja2FnZS5qc29uJywgJ3V0ZjgnICkgKVxuICAgICk7XG4gIH07XG5cbiAgcmV0dXJuIENoaXBwZXJWZXJzaW9uO1xufSApKCk7Il0sIm5hbWVzIjpbImFzc2VydCIsInJlcXVpcmUiLCJmcyIsIm1vZHVsZSIsImV4cG9ydHMiLCJDaGlwcGVyVmVyc2lvbiIsIm1ham9yIiwibWlub3IiLCJtYWludGVuYW5jZSIsImNoaXBwZXJTdXBwb3J0c091dHB1dEpTR3J1bnRUYXNrcyIsInByb3RvdHlwZSIsImNvbnN0cnVjdG9yIiwidG9TdHJpbmciLCJnZXRGcm9tUGFja2FnZUpTT04iLCJwYWNrYWdlSlNPTiIsInZlcnNpb25TdHJpbmciLCJ2ZXJzaW9uIiwibWF0Y2hlcyIsIm1hdGNoIiwiRXJyb3IiLCJOdW1iZXIiLCJwaGV0IiwiZ2V0RnJvbVJlcG9zaXRvcnkiLCJKU09OIiwicGFyc2UiLCJyZWFkRmlsZVN5bmMiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7O0NBR0MsR0FFRCxNQUFNQSxTQUFTQyxRQUFTO0FBQ3hCLE1BQU1DLEtBQUtELFFBQVM7QUFFcEI7OztDQUdDLEdBQ0RFLE9BQU9DLE9BQU8sR0FBRyxBQUFFO0lBRWpCOzs7Ozs7OztHQVFDLEdBQ0QsU0FBU0MsZUFBZ0JDLEtBQUssRUFBRUMsS0FBSyxFQUFFQyxXQUFXLEVBQUVDLGlDQUFpQztRQUVuRlQsT0FBUSxPQUFPTSxVQUFVLFlBQVlBLFNBQVMsS0FBS0EsUUFBUSxNQUFNLEdBQUc7UUFDcEVOLE9BQVEsT0FBT08sVUFBVSxZQUFZQSxTQUFTLEtBQUtBLFFBQVEsTUFBTSxHQUFHO1FBQ3BFUCxPQUFRLE9BQU9RLGdCQUFnQixZQUFZQSxlQUFlLEtBQUtBLGNBQWMsTUFBTSxHQUFHO1FBRXRGLG1CQUFtQjtRQUNuQixJQUFJLENBQUNGLEtBQUssR0FBR0E7UUFDYixJQUFJLENBQUNDLEtBQUssR0FBR0E7UUFDYixJQUFJLENBQUNDLFdBQVcsR0FBR0E7UUFDbkIsSUFBSSxDQUFDQyxpQ0FBaUMsR0FBR0E7SUFDM0M7SUFFQSxpQ0FBaUM7SUFDakNKLGVBQWVLLFNBQVMsR0FBRztRQUN6QkMsYUFBYU47UUFFYjs7Ozs7S0FLQyxHQUNETyxVQUFVO1lBQ1IsT0FBTyxHQUFHLElBQUksQ0FBQ04sS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUNDLEtBQUssQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDQyxXQUFXLEVBQUU7UUFDMUQ7SUFDRjtJQUVBSCxlQUFlUSxrQkFBa0IsR0FBRyxTQUFVQyxXQUFXO1FBQ3ZELE1BQU1DLGdCQUFnQkQsWUFBWUUsT0FBTztRQUV6QyxNQUFNQyxVQUFVRixjQUFjRyxLQUFLLENBQUU7UUFFckMsSUFBSyxDQUFDRCxTQUFVO1lBQ2QsTUFBTSxJQUFJRSxNQUFPLENBQUMsaUNBQWlDLEVBQUVKLGVBQWU7UUFDdEU7UUFFQSxNQUFNVCxRQUFRYyxPQUFRSCxPQUFPLENBQUUsRUFBRztRQUNsQyxNQUFNVixRQUFRYSxPQUFRSCxPQUFPLENBQUUsRUFBRztRQUNsQyxNQUFNVCxjQUFjWSxPQUFRSCxPQUFPLENBQUUsRUFBRztRQUN4QyxNQUFNUixvQ0FBb0NLLFlBQVlPLElBQUksSUFBSVAsWUFBWU8sSUFBSSxDQUFDWixpQ0FBaUM7UUFFaEgsT0FBTyxJQUFJSixlQUFnQkMsT0FBT0MsT0FBT0MsYUFBYUM7SUFDeEQ7SUFFQTs7Ozs7R0FLQyxHQUNESixlQUFlaUIsaUJBQWlCLEdBQUc7UUFDakMsT0FBT2pCLGVBQWVRLGtCQUFrQixDQUN0Q1UsS0FBS0MsS0FBSyxDQUFFdEIsR0FBR3VCLFlBQVksQ0FBRSwyQkFBMkI7SUFFNUQ7SUFFQSxPQUFPcEI7QUFDVCJ9