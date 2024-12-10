// Copyright 2017-2024, University of Colorado Boulder
/**
 * Describes a section of continuous overlap (multiple overlapping points) between two segments.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { kite } from '../imports.js';
let Overlap = class Overlap {
    /**
   * Maps a t value from the first curve to the second curve (assuming it is within the overlap range).
   */ apply(t) {
        return this.a * t + this.b;
    }
    /**
   * Maps a t value from the second curve to the first curve (assuming it is within the overlap range).
   */ applyInverse(t) {
        return (t - this.b) / this.a;
    }
    /**
   * Returns a new overlap that should map t values of a0 => b0 and a1 => b1
   */ static createLinear(a0, b0, a1, b1) {
        const factor = (b1 - b0) / (a1 - a0);
        return new Overlap(factor, b0 - a0 * factor);
    }
    /**
   * Creates an overlap based on two segments with their t-values (parametric value) within the range of [0,1]
   * (inclusive). The t value from the first curve can be mapped to an equivalent t value from the second curve such
   * that first( t ) === second( a * t + b ).
   *
   * Endpoint values for the actual overlap will be computed, such that
   * - first( t0 ) === second( qt0 )
   * - first( t1 ) === second( qt1 )
   * - All of those t values are in the range [0,1]
   */ constructor(a, b){
        assert && assert(isFinite(a) && a !== 0, 'a should be a finite non-zero number');
        assert && assert(isFinite(b), 'b should be a finite number');
        this.a = a;
        this.b = b;
        let t0 = 0;
        let t1 = 1;
        let qt0 = this.apply(t0);
        let qt1 = this.apply(t1);
        if (qt0 > 1) {
            qt0 = 1;
            t0 = this.applyInverse(qt0);
        }
        if (qt0 < 0) {
            qt0 = 0;
            t0 = this.applyInverse(qt0);
        }
        if (qt1 > 1) {
            qt1 = 1;
            t1 = this.applyInverse(qt1);
        }
        if (qt1 < 0) {
            qt1 = 0;
            t1 = this.applyInverse(qt1);
        }
        // {number} - Initial and ending t-values for the first curve (t0,t1) and second curve (qt0,qt1).
        this.t0 = t0;
        this.t1 = t1;
        if (a > 0) {
            this.qt0 = qt0;
            this.qt1 = qt1;
        } else {
            this.qt0 = qt1;
            this.qt1 = qt0;
        }
        if (this.t0 < 0 && this.t0 > -1e-8) {
            this.t0 = 0;
        }
        if (this.t0 > 1 && this.t0 < 1 + 1e-8) {
            this.t0 = 1;
        }
        if (this.t1 < 0 && this.t1 > -1e-8) {
            this.t1 = 0;
        }
        if (this.t1 > 1 && this.t1 < 1 + 1e-8) {
            this.t1 = 1;
        }
        if (this.qt0 < 0 && this.qt0 > -1e-8) {
            this.qt0 = 0;
        }
        if (this.qt0 > 1 && this.qt0 < 1 + 1e-8) {
            this.qt0 = 1;
        }
        if (this.qt1 < 0 && this.qt1 > -1e-8) {
            this.qt1 = 0;
        }
        if (this.qt1 > 1 && this.qt1 < 1 + 1e-8) {
            this.qt1 = 1;
        }
        assert && assert(this.t0 >= 0 && this.t0 <= 1, `t0 out of range: ${this.t0}`);
        assert && assert(this.t1 >= 0 && this.t1 <= 1, `t1 out of range: ${this.t1}`);
        assert && assert(this.qt0 >= 0 && this.qt0 <= 1, `qt0 out of range: ${this.qt0}`);
        assert && assert(this.qt1 >= 0 && this.qt1 <= 1, `qt1 out of range: ${this.qt1}`);
    }
};
export { Overlap as default };
kite.register('Overlap', Overlap);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvdXRpbC9PdmVybGFwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERlc2NyaWJlcyBhIHNlY3Rpb24gb2YgY29udGludW91cyBvdmVybGFwIChtdWx0aXBsZSBvdmVybGFwcGluZyBwb2ludHMpIGJldHdlZW4gdHdvIHNlZ21lbnRzLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgeyBraXRlIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE92ZXJsYXAge1xuXG4gIHB1YmxpYyBhOiBudW1iZXI7XG4gIHB1YmxpYyBiOiBudW1iZXI7XG5cbiAgLy8gSW5pdGlhbCBhbmQgZW5kaW5nIHQtdmFsdWVzIGZvciB0aGUgZmlyc3QgY3VydmUgKHQwLHQxKSBhbmQgc2Vjb25kIGN1cnZlIChxdDAscXQxKS5cbiAgcHVibGljIHQwOiBudW1iZXI7XG4gIHB1YmxpYyB0MTogbnVtYmVyO1xuICBwdWJsaWMgcXQwOiBudW1iZXI7XG4gIHB1YmxpYyBxdDE6IG51bWJlcjtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBvdmVybGFwIGJhc2VkIG9uIHR3byBzZWdtZW50cyB3aXRoIHRoZWlyIHQtdmFsdWVzIChwYXJhbWV0cmljIHZhbHVlKSB3aXRoaW4gdGhlIHJhbmdlIG9mIFswLDFdXG4gICAqIChpbmNsdXNpdmUpLiBUaGUgdCB2YWx1ZSBmcm9tIHRoZSBmaXJzdCBjdXJ2ZSBjYW4gYmUgbWFwcGVkIHRvIGFuIGVxdWl2YWxlbnQgdCB2YWx1ZSBmcm9tIHRoZSBzZWNvbmQgY3VydmUgc3VjaFxuICAgKiB0aGF0IGZpcnN0KCB0ICkgPT09IHNlY29uZCggYSAqIHQgKyBiICkuXG4gICAqXG4gICAqIEVuZHBvaW50IHZhbHVlcyBmb3IgdGhlIGFjdHVhbCBvdmVybGFwIHdpbGwgYmUgY29tcHV0ZWQsIHN1Y2ggdGhhdFxuICAgKiAtIGZpcnN0KCB0MCApID09PSBzZWNvbmQoIHF0MCApXG4gICAqIC0gZmlyc3QoIHQxICkgPT09IHNlY29uZCggcXQxIClcbiAgICogLSBBbGwgb2YgdGhvc2UgdCB2YWx1ZXMgYXJlIGluIHRoZSByYW5nZSBbMCwxXVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBhOiBudW1iZXIsIGI6IG51bWJlciApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggYSApICYmIGEgIT09IDAsXG4gICAgICAnYSBzaG91bGQgYmUgYSBmaW5pdGUgbm9uLXplcm8gbnVtYmVyJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBiICksXG4gICAgICAnYiBzaG91bGQgYmUgYSBmaW5pdGUgbnVtYmVyJyApO1xuXG4gICAgdGhpcy5hID0gYTtcbiAgICB0aGlzLmIgPSBiO1xuXG4gICAgbGV0IHQwID0gMDtcbiAgICBsZXQgdDEgPSAxO1xuICAgIGxldCBxdDAgPSB0aGlzLmFwcGx5KCB0MCApO1xuICAgIGxldCBxdDEgPSB0aGlzLmFwcGx5KCB0MSApO1xuXG4gICAgaWYgKCBxdDAgPiAxICkge1xuICAgICAgcXQwID0gMTtcbiAgICAgIHQwID0gdGhpcy5hcHBseUludmVyc2UoIHF0MCApO1xuICAgIH1cbiAgICBpZiAoIHF0MCA8IDAgKSB7XG4gICAgICBxdDAgPSAwO1xuICAgICAgdDAgPSB0aGlzLmFwcGx5SW52ZXJzZSggcXQwICk7XG4gICAgfVxuICAgIGlmICggcXQxID4gMSApIHtcbiAgICAgIHF0MSA9IDE7XG4gICAgICB0MSA9IHRoaXMuYXBwbHlJbnZlcnNlKCBxdDEgKTtcbiAgICB9XG4gICAgaWYgKCBxdDEgPCAwICkge1xuICAgICAgcXQxID0gMDtcbiAgICAgIHQxID0gdGhpcy5hcHBseUludmVyc2UoIHF0MSApO1xuICAgIH1cblxuICAgIC8vIHtudW1iZXJ9IC0gSW5pdGlhbCBhbmQgZW5kaW5nIHQtdmFsdWVzIGZvciB0aGUgZmlyc3QgY3VydmUgKHQwLHQxKSBhbmQgc2Vjb25kIGN1cnZlIChxdDAscXQxKS5cbiAgICB0aGlzLnQwID0gdDA7XG4gICAgdGhpcy50MSA9IHQxO1xuICAgIGlmICggYSA+IDAgKSB7XG4gICAgICB0aGlzLnF0MCA9IHF0MDtcbiAgICAgIHRoaXMucXQxID0gcXQxO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMucXQwID0gcXQxO1xuICAgICAgdGhpcy5xdDEgPSBxdDA7XG4gICAgfVxuXG4gICAgaWYgKCB0aGlzLnQwIDwgMCAmJiB0aGlzLnQwID4gLTFlLTggKSB7IHRoaXMudDAgPSAwOyB9XG4gICAgaWYgKCB0aGlzLnQwID4gMSAmJiB0aGlzLnQwIDwgMSArIDFlLTggKSB7IHRoaXMudDAgPSAxOyB9XG5cbiAgICBpZiAoIHRoaXMudDEgPCAwICYmIHRoaXMudDEgPiAtMWUtOCApIHsgdGhpcy50MSA9IDA7IH1cbiAgICBpZiAoIHRoaXMudDEgPiAxICYmIHRoaXMudDEgPCAxICsgMWUtOCApIHsgdGhpcy50MSA9IDE7IH1cblxuICAgIGlmICggdGhpcy5xdDAgPCAwICYmIHRoaXMucXQwID4gLTFlLTggKSB7IHRoaXMucXQwID0gMDsgfVxuICAgIGlmICggdGhpcy5xdDAgPiAxICYmIHRoaXMucXQwIDwgMSArIDFlLTggKSB7IHRoaXMucXQwID0gMTsgfVxuXG4gICAgaWYgKCB0aGlzLnF0MSA8IDAgJiYgdGhpcy5xdDEgPiAtMWUtOCApIHsgdGhpcy5xdDEgPSAwOyB9XG4gICAgaWYgKCB0aGlzLnF0MSA+IDEgJiYgdGhpcy5xdDEgPCAxICsgMWUtOCApIHsgdGhpcy5xdDEgPSAxOyB9XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnQwID49IDAgJiYgdGhpcy50MCA8PSAxLCBgdDAgb3V0IG9mIHJhbmdlOiAke3RoaXMudDB9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMudDEgPj0gMCAmJiB0aGlzLnQxIDw9IDEsIGB0MSBvdXQgb2YgcmFuZ2U6ICR7dGhpcy50MX1gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5xdDAgPj0gMCAmJiB0aGlzLnF0MCA8PSAxLCBgcXQwIG91dCBvZiByYW5nZTogJHt0aGlzLnF0MH1gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5xdDEgPj0gMCAmJiB0aGlzLnF0MSA8PSAxLCBgcXQxIG91dCBvZiByYW5nZTogJHt0aGlzLnF0MX1gICk7XG4gIH1cblxuICAvKipcbiAgICogTWFwcyBhIHQgdmFsdWUgZnJvbSB0aGUgZmlyc3QgY3VydmUgdG8gdGhlIHNlY29uZCBjdXJ2ZSAoYXNzdW1pbmcgaXQgaXMgd2l0aGluIHRoZSBvdmVybGFwIHJhbmdlKS5cbiAgICovXG4gIHB1YmxpYyBhcHBseSggdDogbnVtYmVyICk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuYSAqIHQgKyB0aGlzLmI7XG4gIH1cblxuICAvKipcbiAgICogTWFwcyBhIHQgdmFsdWUgZnJvbSB0aGUgc2Vjb25kIGN1cnZlIHRvIHRoZSBmaXJzdCBjdXJ2ZSAoYXNzdW1pbmcgaXQgaXMgd2l0aGluIHRoZSBvdmVybGFwIHJhbmdlKS5cbiAgICovXG4gIHB1YmxpYyBhcHBseUludmVyc2UoIHQ6IG51bWJlciApOiBudW1iZXIge1xuICAgIHJldHVybiAoIHQgLSB0aGlzLmIgKSAvIHRoaXMuYTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IG92ZXJsYXAgdGhhdCBzaG91bGQgbWFwIHQgdmFsdWVzIG9mIGEwID0+IGIwIGFuZCBhMSA9PiBiMVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBjcmVhdGVMaW5lYXIoIGEwOiBudW1iZXIsIGIwOiBudW1iZXIsIGExOiBudW1iZXIsIGIxOiBudW1iZXIgKTogT3ZlcmxhcCB7XG4gICAgY29uc3QgZmFjdG9yID0gKCBiMSAtIGIwICkgLyAoIGExIC0gYTAgKTtcbiAgICByZXR1cm4gbmV3IE92ZXJsYXAoIGZhY3RvciwgYjAgLSBhMCAqIGZhY3RvciApO1xuICB9XG59XG5cbmtpdGUucmVnaXN0ZXIoICdPdmVybGFwJywgT3ZlcmxhcCApOyJdLCJuYW1lcyI6WyJraXRlIiwiT3ZlcmxhcCIsImFwcGx5IiwidCIsImEiLCJiIiwiYXBwbHlJbnZlcnNlIiwiY3JlYXRlTGluZWFyIiwiYTAiLCJiMCIsImExIiwiYjEiLCJmYWN0b3IiLCJhc3NlcnQiLCJpc0Zpbml0ZSIsInQwIiwidDEiLCJxdDAiLCJxdDEiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxTQUFTQSxJQUFJLFFBQVEsZ0JBQWdCO0FBRXRCLElBQUEsQUFBTUMsVUFBTixNQUFNQTtJQWtGbkI7O0dBRUMsR0FDRCxBQUFPQyxNQUFPQyxDQUFTLEVBQVc7UUFDaEMsT0FBTyxJQUFJLENBQUNDLENBQUMsR0FBR0QsSUFBSSxJQUFJLENBQUNFLENBQUM7SUFDNUI7SUFFQTs7R0FFQyxHQUNELEFBQU9DLGFBQWNILENBQVMsRUFBVztRQUN2QyxPQUFPLEFBQUVBLENBQUFBLElBQUksSUFBSSxDQUFDRSxDQUFDLEFBQURBLElBQU0sSUFBSSxDQUFDRCxDQUFDO0lBQ2hDO0lBRUE7O0dBRUMsR0FDRCxPQUFjRyxhQUFjQyxFQUFVLEVBQUVDLEVBQVUsRUFBRUMsRUFBVSxFQUFFQyxFQUFVLEVBQVk7UUFDcEYsTUFBTUMsU0FBUyxBQUFFRCxDQUFBQSxLQUFLRixFQUFDLElBQVFDLENBQUFBLEtBQUtGLEVBQUM7UUFDckMsT0FBTyxJQUFJUCxRQUFTVyxRQUFRSCxLQUFLRCxLQUFLSTtJQUN4QztJQTNGQTs7Ozs7Ozs7O0dBU0MsR0FDRCxZQUFvQlIsQ0FBUyxFQUFFQyxDQUFTLENBQUc7UUFDekNRLFVBQVVBLE9BQVFDLFNBQVVWLE1BQU9BLE1BQU0sR0FDdkM7UUFDRlMsVUFBVUEsT0FBUUMsU0FBVVQsSUFDMUI7UUFFRixJQUFJLENBQUNELENBQUMs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