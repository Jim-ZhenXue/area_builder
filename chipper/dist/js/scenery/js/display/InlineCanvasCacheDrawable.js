// Copyright 2013-2023, University of Colorado Boulder
/**
 * TODO docs https://github.com/phetsims/scenery/issues/1581
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { Drawable, scenery } from '../imports.js';
let InlineCanvasCacheDrawable = class InlineCanvasCacheDrawable extends Drawable {
    /**
   * @public
   * @override
   *
   * @param {number} renderer
   * @param {Instance} instance
   */ initialize(renderer, instance) {
        super.initialize(renderer);
        // TODO: NOTE: may have to separate into separate drawables for separate group renderers https://github.com/phetsims/scenery/issues/1581
        // @public {Instance}
        this.instance = instance; // will need this so we can get bounds for layer fitting
    }
    // TODO: support Canvas/SVG/DOM https://github.com/phetsims/scenery/issues/1581
    /**
   * @public
   *
   * @param {Drawable} firstDrawable
   * @param {Drawable} lastDrawable
   * @param {ChangeInterval} firstChangeInterval
   * @param {ChangeInterval} lastChangeInterval
   */ stitch(firstDrawable, lastDrawable, firstChangeInterval, lastChangeInterval) {
    //OHTWO TODO: called when we have a change in our drawables https://github.com/phetsims/scenery/issues/1581
    }
    /**
   * @param {number} renderer
   * @param {Instance} instance
   */ constructor(renderer, instance){
        super();
        this.initialize(renderer, instance);
    }
};
scenery.register('InlineCanvasCacheDrawable', InlineCanvasCacheDrawable);
export default InlineCanvasCacheDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9JbmxpbmVDYW52YXNDYWNoZURyYXdhYmxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRPRE8gZG9jcyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgeyBEcmF3YWJsZSwgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5jbGFzcyBJbmxpbmVDYW52YXNDYWNoZURyYXdhYmxlIGV4dGVuZHMgRHJhd2FibGUge1xuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcmVyXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGluc3RhbmNlXG4gICAqL1xuICBjb25zdHJ1Y3RvciggcmVuZGVyZXIsIGluc3RhbmNlICkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlclxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxuICAgKi9cbiAgaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlICkge1xuICAgIHN1cGVyLmluaXRpYWxpemUoIHJlbmRlcmVyICk7XG5cbiAgICAvLyBUT0RPOiBOT1RFOiBtYXkgaGF2ZSB0byBzZXBhcmF0ZSBpbnRvIHNlcGFyYXRlIGRyYXdhYmxlcyBmb3Igc2VwYXJhdGUgZ3JvdXAgcmVuZGVyZXJzIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG5cbiAgICAvLyBAcHVibGljIHtJbnN0YW5jZX1cbiAgICB0aGlzLmluc3RhbmNlID0gaW5zdGFuY2U7IC8vIHdpbGwgbmVlZCB0aGlzIHNvIHdlIGNhbiBnZXQgYm91bmRzIGZvciBsYXllciBmaXR0aW5nXG4gIH1cblxuICAvLyBUT0RPOiBzdXBwb3J0IENhbnZhcy9TVkcvRE9NIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZmlyc3REcmF3YWJsZVxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBsYXN0RHJhd2FibGVcbiAgICogQHBhcmFtIHtDaGFuZ2VJbnRlcnZhbH0gZmlyc3RDaGFuZ2VJbnRlcnZhbFxuICAgKiBAcGFyYW0ge0NoYW5nZUludGVydmFsfSBsYXN0Q2hhbmdlSW50ZXJ2YWxcbiAgICovXG4gIHN0aXRjaCggZmlyc3REcmF3YWJsZSwgbGFzdERyYXdhYmxlLCBmaXJzdENoYW5nZUludGVydmFsLCBsYXN0Q2hhbmdlSW50ZXJ2YWwgKSB7XG4gICAgLy9PSFRXTyBUT0RPOiBjYWxsZWQgd2hlbiB3ZSBoYXZlIGEgY2hhbmdlIGluIG91ciBkcmF3YWJsZXMgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnSW5saW5lQ2FudmFzQ2FjaGVEcmF3YWJsZScsIElubGluZUNhbnZhc0NhY2hlRHJhd2FibGUgKTtcbmV4cG9ydCBkZWZhdWx0IElubGluZUNhbnZhc0NhY2hlRHJhd2FibGU7Il0sIm5hbWVzIjpbIkRyYXdhYmxlIiwic2NlbmVyeSIsIklubGluZUNhbnZhc0NhY2hlRHJhd2FibGUiLCJpbml0aWFsaXplIiwicmVuZGVyZXIiLCJpbnN0YW5jZSIsInN0aXRjaCIsImZpcnN0RHJhd2FibGUiLCJsYXN0RHJhd2FibGUiLCJmaXJzdENoYW5nZUludGVydmFsIiwibGFzdENoYW5nZUludGVydmFsIiwiY29uc3RydWN0b3IiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxTQUFTQSxRQUFRLEVBQUVDLE9BQU8sUUFBUSxnQkFBZ0I7QUFFbEQsSUFBQSxBQUFNQyw0QkFBTixNQUFNQSxrQ0FBa0NGO0lBV3RDOzs7Ozs7R0FNQyxHQUNERyxXQUFZQyxRQUFRLEVBQUVDLFFBQVEsRUFBRztRQUMvQixLQUFLLENBQUNGLFdBQVlDO1FBRWxCLHdJQUF3STtRQUV4SSxxQkFBcUI7UUFDckIsSUFBSSxDQUFDQyxRQUFRLEdBQUdBLFVBQVUsd0RBQXdEO0lBQ3BGO0lBRUEsK0VBQStFO0lBRS9FOzs7Ozs7O0dBT0MsR0FDREMsT0FBUUMsYUFBYSxFQUFFQyxZQUFZLEVBQUVDLG1CQUFtQixFQUFFQyxrQkFBa0IsRUFBRztJQUM3RSwyR0FBMkc7SUFDN0c7SUF0Q0E7OztHQUdDLEdBQ0RDLFlBQWFQLFFBQVEsRUFBRUMsUUFBUSxDQUFHO1FBQ2hDLEtBQUs7UUFFTCxJQUFJLENBQUNGLFVBQVUsQ0FBRUMsVUFBVUM7SUFDN0I7QUErQkY7QUFFQUosUUFBUVcsUUFBUSxDQUFFLDZCQUE2QlY7QUFDL0MsZUFBZUEsMEJBQTBCIn0=