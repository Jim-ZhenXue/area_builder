// Copyright 2013-2024, University of Colorado Boulder
/**
 * A radial gradient that can be passed into the 'fill' or 'stroke' parameters.
 *
 * SVG gradients, see http://www.w3.org/TR/SVG/pservers.html
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Vector2 from '../../../dot/js/Vector2.js';
import platform from '../../../phet-core/js/platform.js';
import { ColorDef, Gradient, scenery, SVGRadialGradient } from '../imports.js';
let RadialGradient = class RadialGradient extends Gradient {
    /**
   * Returns a fresh gradient given the starting parameters
   */ createCanvasGradient() {
        // use the global scratch canvas instead of creating a new Canvas
        // @ts-expect-error TODO scenery namespace https://github.com/phetsims/scenery/issues/1581
        return scenery.scratchContext.createRadialGradient(this.start.x, this.start.y, this.startRadius, this.end.x, this.end.y, this.endRadius);
    }
    /**
   * Creates an SVG paint object for creating/updating the SVG equivalent definition.
   */ createSVGPaint(svgBlock) {
        return SVGRadialGradient.pool.create(svgBlock, this);
    }
    /**
   * Returns stops suitable for direct SVG use.
   *
   * NOTE: SVG has certain stop requirements, so we need to remap/reverse in some cases.
   */ getSVGStops() {
        const startIsLarger = this.startIsLarger;
        const maxRadius = this.maxRadius;
        const minRadius = this.minRadius;
        //TODO: replace with phet.dot.Utils.linear https://github.com/phetsims/scenery/issues/1581
        // maps x linearly from [a0,b0] => [a1,b1]
        function linearMap(a0, b0, a1, b1, x) {
            return a1 + (x - a0) * (b1 - a1) / (b0 - a0);
        }
        function mapStop(stop) {
            // flip the stops if the start has a larger radius
            let ratio = startIsLarger ? 1 - stop.ratio : stop.ratio;
            // scale the stops properly if the smaller radius isn't 0
            if (minRadius > 0) {
                // scales our ratio from [0,1] => [minRadius/maxRadius,0]
                ratio = linearMap(0, 1, minRadius / maxRadius, 1, ratio);
            }
            return {
                ratio: ratio,
                color: stop.color
            };
        }
        const stops = this.stops.map(mapStop);
        // switch the direction we apply stops in, so that the ratios always are increasing.
        if (startIsLarger) {
            stops.reverse();
        }
        return stops;
    }
    /**
   * Returns a string form of this object
   */ toString() {
        let result = `new phet.scenery.RadialGradient( ${this.start.x}, ${this.start.y}, ${this.startRadius}, ${this.end.x}, ${this.end.y}, ${this.endRadius} )`;
        _.each(this.stops, (stop)=>{
            result += `.addColorStop( ${stop.ratio}, ${ColorDef.scenerySerialize(stop.color)} )`;
        });
        return result;
    }
    /**
   * TODO: add the ability to specify the color-stops inline. possibly [ [0,color1], [0.5,color2], [1,color3] ] https://github.com/phetsims/scenery/issues/1581
   *
   * TODO: support Vector2s as p0 and p1
   *
   * @param x0 - X coordinate of the start point (ratio 0) in the local coordinate frame
   * @param y0 - Y coordinate of the start point (ratio 0) in the local coordinate frame
   * @param r0 - Radius of the start point (ratio 0) in the local coordinate frame
   * @param x1 - X coordinate of the end point (ratio 1) in the local coordinate frame
   * @param y1 - Y coordinate of the end point (ratio 1) in the local coordinate frame
   * @param r1 - Radius of the end point (ratio 1) in the local coordinate frame
   */ constructor(x0, y0, r0, x1, y1, r1){
        super();
        this.start = new Vector2(x0, y0);
        this.end = new Vector2(x1, y1);
        // If we are using Safari, we need to work around incorrect gradient handling for now,
        // see https://github.com/phetsims/sun/issues/526
        if (platform.safari) {
            const x = (x0 + x1) / 2;
            const y = (y0 + y1) / 2;
            this.start.x = x;
            this.start.y = y;
            this.end.x = x;
            this.end.y = y;
        }
        this.startRadius = r0;
        this.endRadius = r1;
        this.focalPoint = this.start.plus(this.end.minus(this.start).times(this.startRadius / (this.startRadius - this.endRadius)));
        this.startIsLarger = this.startRadius > this.endRadius;
        this.largePoint = this.startIsLarger ? this.start : this.end;
        this.maxRadius = Math.max(this.startRadius, this.endRadius);
        this.minRadius = Math.min(this.startRadius, this.endRadius);
        // make sure that the focal point is in both circles. SVG doesn't support rendering outside of them
        if (this.startRadius >= this.endRadius) {
            assert && assert(this.focalPoint.minus(this.start).magnitude <= this.startRadius);
        } else {
            assert && assert(this.focalPoint.minus(this.end).magnitude <= this.endRadius);
        }
    }
};
export { RadialGradient as default };
RadialGradient.prototype.isRadialGradient = true;
scenery.register('RadialGradient', RadialGradient);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9SYWRpYWxHcmFkaWVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIHJhZGlhbCBncmFkaWVudCB0aGF0IGNhbiBiZSBwYXNzZWQgaW50byB0aGUgJ2ZpbGwnIG9yICdzdHJva2UnIHBhcmFtZXRlcnMuXG4gKlxuICogU1ZHIGdyYWRpZW50cywgc2VlIGh0dHA6Ly93d3cudzMub3JnL1RSL1NWRy9wc2VydmVycy5odG1sXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCBwbGF0Zm9ybSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvcGxhdGZvcm0uanMnO1xuaW1wb3J0IHsgQ29sb3JEZWYsIEdyYWRpZW50LCBHcmFkaWVudFN0b3AsIHNjZW5lcnksIFNWR0Jsb2NrLCBTVkdSYWRpYWxHcmFkaWVudCwgVENvbG9yIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJhZGlhbEdyYWRpZW50IGV4dGVuZHMgR3JhZGllbnQge1xuXG4gIHB1YmxpYyBzdGFydDogVmVjdG9yMjtcbiAgcHVibGljIGVuZDogVmVjdG9yMjtcblxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcbiAgcHVibGljIHN0YXJ0UmFkaXVzOiBudW1iZXI7XG4gIHB1YmxpYyBlbmRSYWRpdXM6IG51bWJlcjtcblxuICAvLyBsaW5lYXIgZnVuY3Rpb24gZnJvbSByYWRpdXMgdG8gcG9pbnQgb24gdGhlIGxpbmUgZnJvbSBzdGFydCB0byBlbmRcbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXG4gIHB1YmxpYyBmb2NhbFBvaW50OiBWZWN0b3IyO1xuXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxuICBwdWJsaWMgc3RhcnRJc0xhcmdlcjogYm9vbGVhbjtcbiAgcHVibGljIGxhcmdlUG9pbnQ6IFZlY3RvcjI7XG5cbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXG4gIHB1YmxpYyBtaW5SYWRpdXM6IG51bWJlcjtcbiAgcHVibGljIG1heFJhZGl1czogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUT0RPOiBhZGQgdGhlIGFiaWxpdHkgdG8gc3BlY2lmeSB0aGUgY29sb3Itc3RvcHMgaW5saW5lLiBwb3NzaWJseSBbIFswLGNvbG9yMV0sIFswLjUsY29sb3IyXSwgWzEsY29sb3IzXSBdIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAqXG4gICAqIFRPRE86IHN1cHBvcnQgVmVjdG9yMnMgYXMgcDAgYW5kIHAxXG4gICAqXG4gICAqIEBwYXJhbSB4MCAtIFggY29vcmRpbmF0ZSBvZiB0aGUgc3RhcnQgcG9pbnQgKHJhdGlvIDApIGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lXG4gICAqIEBwYXJhbSB5MCAtIFkgY29vcmRpbmF0ZSBvZiB0aGUgc3RhcnQgcG9pbnQgKHJhdGlvIDApIGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lXG4gICAqIEBwYXJhbSByMCAtIFJhZGl1cyBvZiB0aGUgc3RhcnQgcG9pbnQgKHJhdGlvIDApIGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lXG4gICAqIEBwYXJhbSB4MSAtIFggY29vcmRpbmF0ZSBvZiB0aGUgZW5kIHBvaW50IChyYXRpbyAxKSBpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZVxuICAgKiBAcGFyYW0geTEgLSBZIGNvb3JkaW5hdGUgb2YgdGhlIGVuZCBwb2ludCAocmF0aW8gMSkgaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWVcbiAgICogQHBhcmFtIHIxIC0gUmFkaXVzIG9mIHRoZSBlbmQgcG9pbnQgKHJhdGlvIDEpIGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHgwOiBudW1iZXIsIHkwOiBudW1iZXIsIHIwOiBudW1iZXIsIHgxOiBudW1iZXIsIHkxOiBudW1iZXIsIHIxOiBudW1iZXIgKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuc3RhcnQgPSBuZXcgVmVjdG9yMiggeDAsIHkwICk7XG4gICAgdGhpcy5lbmQgPSBuZXcgVmVjdG9yMiggeDEsIHkxICk7XG5cbiAgICAvLyBJZiB3ZSBhcmUgdXNpbmcgU2FmYXJpLCB3ZSBuZWVkIHRvIHdvcmsgYXJvdW5kIGluY29ycmVjdCBncmFkaWVudCBoYW5kbGluZyBmb3Igbm93LFxuICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy81MjZcbiAgICBpZiAoIHBsYXRmb3JtLnNhZmFyaSApIHtcbiAgICAgIGNvbnN0IHggPSAoIHgwICsgeDEgKSAvIDI7XG4gICAgICBjb25zdCB5ID0gKCB5MCArIHkxICkgLyAyO1xuICAgICAgdGhpcy5zdGFydC54ID0geDtcbiAgICAgIHRoaXMuc3RhcnQueSA9IHk7XG4gICAgICB0aGlzLmVuZC54ID0geDtcbiAgICAgIHRoaXMuZW5kLnkgPSB5O1xuICAgIH1cblxuICAgIHRoaXMuc3RhcnRSYWRpdXMgPSByMDtcbiAgICB0aGlzLmVuZFJhZGl1cyA9IHIxO1xuXG4gICAgdGhpcy5mb2NhbFBvaW50ID0gdGhpcy5zdGFydC5wbHVzKCB0aGlzLmVuZC5taW51cyggdGhpcy5zdGFydCApLnRpbWVzKCB0aGlzLnN0YXJ0UmFkaXVzIC8gKCB0aGlzLnN0YXJ0UmFkaXVzIC0gdGhpcy5lbmRSYWRpdXMgKSApICk7XG5cbiAgICB0aGlzLnN0YXJ0SXNMYXJnZXIgPSB0aGlzLnN0YXJ0UmFkaXVzID4gdGhpcy5lbmRSYWRpdXM7XG4gICAgdGhpcy5sYXJnZVBvaW50ID0gdGhpcy5zdGFydElzTGFyZ2VyID8gdGhpcy5zdGFydCA6IHRoaXMuZW5kO1xuXG4gICAgdGhpcy5tYXhSYWRpdXMgPSBNYXRoLm1heCggdGhpcy5zdGFydFJhZGl1cywgdGhpcy5lbmRSYWRpdXMgKTtcbiAgICB0aGlzLm1pblJhZGl1cyA9IE1hdGgubWluKCB0aGlzLnN0YXJ0UmFkaXVzLCB0aGlzLmVuZFJhZGl1cyApO1xuXG4gICAgLy8gbWFrZSBzdXJlIHRoYXQgdGhlIGZvY2FsIHBvaW50IGlzIGluIGJvdGggY2lyY2xlcy4gU1ZHIGRvZXNuJ3Qgc3VwcG9ydCByZW5kZXJpbmcgb3V0c2lkZSBvZiB0aGVtXG4gICAgaWYgKCB0aGlzLnN0YXJ0UmFkaXVzID49IHRoaXMuZW5kUmFkaXVzICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5mb2NhbFBvaW50Lm1pbnVzKCB0aGlzLnN0YXJ0ICkubWFnbml0dWRlIDw9IHRoaXMuc3RhcnRSYWRpdXMgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmZvY2FsUG9pbnQubWludXMoIHRoaXMuZW5kICkubWFnbml0dWRlIDw9IHRoaXMuZW5kUmFkaXVzICk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogUmV0dXJucyBhIGZyZXNoIGdyYWRpZW50IGdpdmVuIHRoZSBzdGFydGluZyBwYXJhbWV0ZXJzXG4gICAqL1xuICBwdWJsaWMgY3JlYXRlQ2FudmFzR3JhZGllbnQoKTogQ2FudmFzR3JhZGllbnQge1xuICAgIC8vIHVzZSB0aGUgZ2xvYmFsIHNjcmF0Y2ggY2FudmFzIGluc3RlYWQgb2YgY3JlYXRpbmcgYSBuZXcgQ2FudmFzXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUT0RPIHNjZW5lcnkgbmFtZXNwYWNlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgcmV0dXJuIHNjZW5lcnkuc2NyYXRjaENvbnRleHQuY3JlYXRlUmFkaWFsR3JhZGllbnQoIHRoaXMuc3RhcnQueCwgdGhpcy5zdGFydC55LCB0aGlzLnN0YXJ0UmFkaXVzLCB0aGlzLmVuZC54LCB0aGlzLmVuZC55LCB0aGlzLmVuZFJhZGl1cyApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gU1ZHIHBhaW50IG9iamVjdCBmb3IgY3JlYXRpbmcvdXBkYXRpbmcgdGhlIFNWRyBlcXVpdmFsZW50IGRlZmluaXRpb24uXG4gICAqL1xuICBwdWJsaWMgY3JlYXRlU1ZHUGFpbnQoIHN2Z0Jsb2NrOiBTVkdCbG9jayApOiBTVkdSYWRpYWxHcmFkaWVudCB7XG4gICAgcmV0dXJuIFNWR1JhZGlhbEdyYWRpZW50LnBvb2wuY3JlYXRlKCBzdmdCbG9jaywgdGhpcyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgc3RvcHMgc3VpdGFibGUgZm9yIGRpcmVjdCBTVkcgdXNlLlxuICAgKlxuICAgKiBOT1RFOiBTVkcgaGFzIGNlcnRhaW4gc3RvcCByZXF1aXJlbWVudHMsIHNvIHdlIG5lZWQgdG8gcmVtYXAvcmV2ZXJzZSBpbiBzb21lIGNhc2VzLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGdldFNWR1N0b3BzKCk6IEdyYWRpZW50U3RvcFtdIHtcbiAgICBjb25zdCBzdGFydElzTGFyZ2VyID0gdGhpcy5zdGFydElzTGFyZ2VyO1xuICAgIGNvbnN0IG1heFJhZGl1cyA9IHRoaXMubWF4UmFkaXVzO1xuICAgIGNvbnN0IG1pblJhZGl1cyA9IHRoaXMubWluUmFkaXVzO1xuXG4gICAgLy9UT0RPOiByZXBsYWNlIHdpdGggcGhldC5kb3QuVXRpbHMubGluZWFyIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgLy8gbWFwcyB4IGxpbmVhcmx5IGZyb20gW2EwLGIwXSA9PiBbYTEsYjFdXG4gICAgZnVuY3Rpb24gbGluZWFyTWFwKCBhMDogbnVtYmVyLCBiMDogbnVtYmVyLCBhMTogbnVtYmVyLCBiMTogbnVtYmVyLCB4OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiBhMSArICggeCAtIGEwICkgKiAoIGIxIC0gYTEgKSAvICggYjAgLSBhMCApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1hcFN0b3AoIHN0b3A6IEdyYWRpZW50U3RvcCApOiB7IHJhdGlvOiBudW1iZXI7IGNvbG9yOiBUQ29sb3IgfSB7XG4gICAgICAvLyBmbGlwIHRoZSBzdG9wcyBpZiB0aGUgc3RhcnQgaGFzIGEgbGFyZ2VyIHJhZGl1c1xuICAgICAgbGV0IHJhdGlvID0gc3RhcnRJc0xhcmdlciA/IDEgLSBzdG9wLnJhdGlvIDogc3RvcC5yYXRpbztcblxuICAgICAgLy8gc2NhbGUgdGhlIHN0b3BzIHByb3Blcmx5IGlmIHRoZSBzbWFsbGVyIHJhZGl1cyBpc24ndCAwXG4gICAgICBpZiAoIG1pblJhZGl1cyA+IDAgKSB7XG4gICAgICAgIC8vIHNjYWxlcyBvdXIgcmF0aW8gZnJvbSBbMCwxXSA9PiBbbWluUmFkaXVzL21heFJhZGl1cywwXVxuICAgICAgICByYXRpbyA9IGxpbmVhck1hcCggMCwgMSwgbWluUmFkaXVzIC8gbWF4UmFkaXVzLCAxLCByYXRpbyApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICByYXRpbzogcmF0aW8sXG4gICAgICAgIGNvbG9yOiBzdG9wLmNvbG9yXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IHN0b3BzID0gdGhpcy5zdG9wcy5tYXAoIG1hcFN0b3AgKTtcblxuICAgIC8vIHN3aXRjaCB0aGUgZGlyZWN0aW9uIHdlIGFwcGx5IHN0b3BzIGluLCBzbyB0aGF0IHRoZSByYXRpb3MgYWx3YXlzIGFyZSBpbmNyZWFzaW5nLlxuICAgIGlmICggc3RhcnRJc0xhcmdlciApIHtcbiAgICAgIHN0b3BzLnJldmVyc2UoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RvcHM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHN0cmluZyBmb3JtIG9mIHRoaXMgb2JqZWN0XG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICBsZXQgcmVzdWx0ID0gYG5ldyBwaGV0LnNjZW5lcnkuUmFkaWFsR3JhZGllbnQoICR7dGhpcy5zdGFydC54fSwgJHt0aGlzLnN0YXJ0Lnl9LCAke3RoaXMuc3RhcnRSYWRpdXN9LCAke3RoaXMuZW5kLnh9LCAke3RoaXMuZW5kLnl9LCAke3RoaXMuZW5kUmFkaXVzfSApYDtcblxuICAgIF8uZWFjaCggdGhpcy5zdG9wcywgc3RvcCA9PiB7XG4gICAgICByZXN1bHQgKz0gYC5hZGRDb2xvclN0b3AoICR7c3RvcC5yYXRpb30sICR7Q29sb3JEZWYuc2NlbmVyeVNlcmlhbGl6ZSggc3RvcC5jb2xvciApfSApYDtcbiAgICB9ICk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHVibGljIGlzUmFkaWFsR3JhZGllbnQhOiBib29sZWFuO1xufVxuXG5SYWRpYWxHcmFkaWVudC5wcm90b3R5cGUuaXNSYWRpYWxHcmFkaWVudCA9IHRydWU7XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdSYWRpYWxHcmFkaWVudCcsIFJhZGlhbEdyYWRpZW50ICk7Il0sIm5hbWVzIjpbIlZlY3RvcjIiLCJwbGF0Zm9ybSIsIkNvbG9yRGVmIiwiR3JhZGllbnQiLCJzY2VuZXJ5IiwiU1ZHUmFkaWFsR3JhZGllbnQiLCJSYWRpYWxHcmFkaWVudCIsImNyZWF0ZUNhbnZhc0dyYWRpZW50Iiwic2NyYXRjaENvbnRleHQiLCJjcmVhdGVSYWRpYWxHcmFkaWVudCIsInN0YXJ0IiwieCIsInkiLCJzdGFydFJhZGl1cyIsImVuZCIsImVuZFJhZGl1cyIsImNyZWF0ZVNWR1BhaW50Iiwic3ZnQmxvY2siLCJwb29sIiwiY3JlYXRlIiwiZ2V0U1ZHU3RvcHMiLCJzdGFydElzTGFyZ2VyIiwibWF4UmFkaXVzIiwibWluUmFkaXVzIiwibGluZWFyTWFwIiwiYTAiLCJiMCIsImExIiwiYjEiLCJtYXBTdG9wIiwic3RvcCIsInJhdGlvIiwiY29sb3IiLCJzdG9wcyIsIm1hcCIsInJldmVyc2UiLCJ0b1N0cmluZyIsInJlc3VsdCIsIl8iLCJlYWNoIiwic2NlbmVyeVNlcmlhbGl6ZSIsIngwIiwieTAiLCJyMCIsIngxIiwieTEiLCJyMSIsInNhZmFyaSIsImZvY2FsUG9pbnQiLCJwbHVzIiwibWludXMiLCJ0aW1lcyIsImxhcmdlUG9pbnQiLCJNYXRoIiwibWF4IiwibWluIiwiYXNzZXJ0IiwibWFnbml0dWRlIiwicHJvdG90eXBlIiwiaXNSYWRpYWxHcmFkaWVudCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBRUQsT0FBT0EsYUFBYSw2QkFBNkI7QUFDakQsT0FBT0MsY0FBYyxvQ0FBb0M7QUFDekQsU0FBU0MsUUFBUSxFQUFFQyxRQUFRLEVBQWdCQyxPQUFPLEVBQVlDLGlCQUFpQixRQUFnQixnQkFBZ0I7QUFFaEcsSUFBQSxBQUFNQyxpQkFBTixNQUFNQSx1QkFBdUJIO0lBdUUxQzs7R0FFQyxHQUNELEFBQU9JLHVCQUF1QztRQUM1QyxpRUFBaUU7UUFDakUsMEZBQTBGO1FBQzFGLE9BQU9ILFFBQVFJLGNBQWMsQ0FBQ0Msb0JBQW9CLENBQUUsSUFBSSxDQUFDQyxLQUFLLENBQUNDLENBQUMsRUFBRSxJQUFJLENBQUNELEtBQUssQ0FBQ0UsQ0FBQyxFQUFFLElBQUksQ0FBQ0MsV0FBVyxFQUFFLElBQUksQ0FBQ0MsR0FBRyxDQUFDSCxDQUFDLEVBQUUsSUFBSSxDQUFDRyxHQUFHLENBQUNGLENBQUMsRUFBRSxJQUFJLENBQUNHLFNBQVM7SUFDMUk7SUFFQTs7R0FFQyxHQUNELEFBQU9DLGVBQWdCQyxRQUFrQixFQUFzQjtRQUM3RCxPQUFPWixrQkFBa0JhLElBQUksQ0FBQ0MsTUFBTSxDQUFFRixVQUFVLElBQUk7SUFDdEQ7SUFFQTs7OztHQUlDLEdBQ0QsQUFBZ0JHLGNBQThCO1FBQzVDLE1BQU1DLGdCQUFnQixJQUFJLENBQUNBLGFBQWE7UUFDeEMsTUFBTUMsWUFBWSxJQUFJLENBQUNBLFNBQVM7UUFDaEMsTUFBTUMsWUFBWSxJQUFJLENB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