// Copyright 2013-2024, University of Colorado Boulder
/**
 * Function for doing a linear mapping between two domains ('a' and 'b').
 * <p>
 * Example usage:
 * <code>
 * var f = new LinearFunction( 0, 100, 0, 200 );
 * f.evaluate( 50 ); // 100
 * f.inverse( 100 ); // 50
 * </code>
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import dot from './dot.js';
import Utils from './Utils.js';
let LinearFunction = class LinearFunction {
    /**
   * Maps from a to b.
   */ evaluate(a3) {
        return map(this.a1, this.a2, this.b1, this.b2, a3, this.clamp);
    }
    /**
   * Maps from b to a
   */ inverse(b3) {
        return map(this.b1, this.b2, this.a1, this.a2, b3, this.clamp);
    }
    /**
   * @param a1
   * @param a2
   * @param b1
   * @param b2
   * @param clamp - clamp the result to the provided ranges, false by default
   */ constructor(a1, a2, b1, b2, clamp = false){
        this.a1 = a1;
        this.a2 = a2;
        this.b1 = b1;
        this.b2 = b2;
        this.clamp = clamp;
    }
};
export { LinearFunction as default };
/**
 * Linearly interpolate two points and evaluate the line equation for a third point.
 * f( a1 ) = b1, f( a2 ) = b2, f( a3 ) = <linear mapped value>
 * Optionally clamp the result to the range [b1,b2].
 */ const map = (a1, a2, b1, b2, a3, clamp)=>{
    let b3 = Utils.linear(a1, a2, b1, b2, a3);
    if (clamp) {
        const max = Math.max(b1, b2);
        const min = Math.min(b1, b2);
        b3 = Utils.clamp(b3, min, max);
    }
    return b3;
};
dot.register('LinearFunction', LinearFunction);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9MaW5lYXJGdW5jdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBGdW5jdGlvbiBmb3IgZG9pbmcgYSBsaW5lYXIgbWFwcGluZyBiZXR3ZWVuIHR3byBkb21haW5zICgnYScgYW5kICdiJykuXG4gKiA8cD5cbiAqIEV4YW1wbGUgdXNhZ2U6XG4gKiA8Y29kZT5cbiAqIHZhciBmID0gbmV3IExpbmVhckZ1bmN0aW9uKCAwLCAxMDAsIDAsIDIwMCApO1xuICogZi5ldmFsdWF0ZSggNTAgKTsgLy8gMTAwXG4gKiBmLmludmVyc2UoIDEwMCApOyAvLyA1MFxuICogPC9jb2RlPlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IGRvdCBmcm9tICcuL2RvdC5qcyc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi9VdGlscy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExpbmVhckZ1bmN0aW9uIHtcbiAgcHJpdmF0ZSBhMTogbnVtYmVyO1xuICBwcml2YXRlIGEyOiBudW1iZXI7XG4gIHByaXZhdGUgYjE6IG51bWJlcjtcbiAgcHJpdmF0ZSBiMjogbnVtYmVyO1xuICBwcml2YXRlIGNsYW1wOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gYTFcbiAgICogQHBhcmFtIGEyXG4gICAqIEBwYXJhbSBiMVxuICAgKiBAcGFyYW0gYjJcbiAgICogQHBhcmFtIGNsYW1wIC0gY2xhbXAgdGhlIHJlc3VsdCB0byB0aGUgcHJvdmlkZWQgcmFuZ2VzLCBmYWxzZSBieSBkZWZhdWx0XG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGExOiBudW1iZXIsIGEyOiBudW1iZXIsIGIxOiBudW1iZXIsIGIyOiBudW1iZXIsIGNsYW1wID0gZmFsc2UgKSB7XG4gICAgdGhpcy5hMSA9IGExO1xuICAgIHRoaXMuYTIgPSBhMjtcbiAgICB0aGlzLmIxID0gYjE7XG4gICAgdGhpcy5iMiA9IGIyO1xuICAgIHRoaXMuY2xhbXAgPSBjbGFtcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXBzIGZyb20gYSB0byBiLlxuICAgKi9cbiAgcHVibGljIGV2YWx1YXRlKCBhMzogbnVtYmVyICk6IG51bWJlciB7XG4gICAgcmV0dXJuIG1hcCggdGhpcy5hMSwgdGhpcy5hMiwgdGhpcy5iMSwgdGhpcy5iMiwgYTMsIHRoaXMuY2xhbXAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXBzIGZyb20gYiB0byBhXG4gICAqL1xuICBwdWJsaWMgaW52ZXJzZSggYjM6IG51bWJlciApOiBudW1iZXIge1xuICAgIHJldHVybiBtYXAoIHRoaXMuYjEsIHRoaXMuYjIsIHRoaXMuYTEsIHRoaXMuYTIsIGIzLCB0aGlzLmNsYW1wICk7XG4gIH1cbn1cblxuLyoqXG4gKiBMaW5lYXJseSBpbnRlcnBvbGF0ZSB0d28gcG9pbnRzIGFuZCBldmFsdWF0ZSB0aGUgbGluZSBlcXVhdGlvbiBmb3IgYSB0aGlyZCBwb2ludC5cbiAqIGYoIGExICkgPSBiMSwgZiggYTIgKSA9IGIyLCBmKCBhMyApID0gPGxpbmVhciBtYXBwZWQgdmFsdWU+XG4gKiBPcHRpb25hbGx5IGNsYW1wIHRoZSByZXN1bHQgdG8gdGhlIHJhbmdlIFtiMSxiMl0uXG4gKi9cbmNvbnN0IG1hcCA9ICggYTE6IG51bWJlciwgYTI6IG51bWJlciwgYjE6IG51bWJlciwgYjI6IG51bWJlciwgYTM6IG51bWJlciwgY2xhbXA6IGJvb2xlYW4gKTogbnVtYmVyID0+IHtcbiAgbGV0IGIzID0gVXRpbHMubGluZWFyKCBhMSwgYTIsIGIxLCBiMiwgYTMgKTtcbiAgaWYgKCBjbGFtcCApIHtcbiAgICBjb25zdCBtYXggPSBNYXRoLm1heCggYjEsIGIyICk7XG4gICAgY29uc3QgbWluID0gTWF0aC5taW4oIGIxLCBiMiApO1xuICAgIGIzID0gVXRpbHMuY2xhbXAoIGIzLCBtaW4sIG1heCApO1xuICB9XG4gIHJldHVybiBiMztcbn07XG5cbmRvdC5yZWdpc3RlciggJ0xpbmVhckZ1bmN0aW9uJywgTGluZWFyRnVuY3Rpb24gKTsiXSwibmFtZXMiOlsiZG90IiwiVXRpbHMiLCJMaW5lYXJGdW5jdGlvbiIsImV2YWx1YXRlIiwiYTMiLCJtYXAiLCJhMSIsImEyIiwiYjEiLCJiMiIsImNsYW1wIiwiaW52ZXJzZSIsImIzIiwibGluZWFyIiwibWF4IiwiTWF0aCIsIm1pbiIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7O0NBV0MsR0FFRCxPQUFPQSxTQUFTLFdBQVc7QUFDM0IsT0FBT0MsV0FBVyxhQUFhO0FBRWhCLElBQUEsQUFBTUMsaUJBQU4sTUFBTUE7SUFzQm5COztHQUVDLEdBQ0QsQUFBT0MsU0FBVUMsRUFBVSxFQUFXO1FBQ3BDLE9BQU9DLElBQUssSUFBSSxDQUFDQyxFQUFFLEVBQUUsSUFBSSxDQUFDQyxFQUFFLEVBQUUsSUFBSSxDQUFDQyxFQUFFLEVBQUUsSUFBSSxDQUFDQyxFQUFFLEVBQUVMLElBQUksSUFBSSxDQUFDTSxLQUFLO0lBQ2hFO0lBRUE7O0dBRUMsR0FDRCxBQUFPQyxRQUFTQyxFQUFVLEVBQVc7UUFDbkMsT0FBT1AsSUFBSyxJQUFJLENBQUNHLEVBQUUsRUFBRSxJQUFJLENBQUNDLEVBQUUsRUFBRSxJQUFJLENBQUNILEVBQUUsRUFBRSxJQUFJLENBQUNDLEVBQUUsRUFBRUssSUFBSSxJQUFJLENBQUNGLEtBQUs7SUFDaEU7SUEzQkE7Ozs7OztHQU1DLEdBQ0QsWUFBb0JKLEVBQVUsRUFBRUMsRUFBVSxFQUFFQyxFQUFVLEVBQUVDLEVBQVUsRUFBRUMsUUFBUSxLQUFLLENBQUc7UUFDbEYsSUFBSSxDQUFDSixFQUFFLEdBQUdBO1FBQ1YsSUFBSSxDQUFDQyxFQUFFLEdBQUdBO1FBQ1YsSUFBSSxDQUFDQyxFQUFFLEdBQUdBO1FBQ1YsSUFBSSxDQUFDQyxFQUFFLEdBQUdBO1FBQ1YsSUFBSSxDQUFDQyxLQUFLLEdBQUdBO0lBQ2Y7QUFlRjtBQW5DQSxTQUFxQlIsNEJBbUNwQjtBQUVEOzs7O0NBSUMsR0FDRCxNQUFNRyxNQUFNLENBQUVDLElBQVlDLElBQVlDLElBQVlDLElBQVlMLElBQVlNO0lBQ3hFLElBQUlFLEtBQUtYLE1BQU1ZLE1BQU0sQ0FBRVAsSUFBSUMsSUFBSUMsSUFBSUMsSUFBSUw7SUFDdkMsSUFBS00sT0FBUTtRQUNYLE1BQU1JLE1BQU1DLEtBQUtELEdBQUcsQ0FBRU4sSUFBSUM7UUFDMUIsTUFBTU8sTUFBTUQsS0FBS0MsR0FBRyxDQUFFUixJQUFJQztRQUMxQkcsS0FBS1gsTUFBTVMsS0FBSyxDQUFFRSxJQUFJSSxLQUFLRjtJQUM3QjtJQUNBLE9BQU9GO0FBQ1Q7QUFFQVosSUFBSWlCLFFBQVEsQ0FBRSxrQkFBa0JmIn0=