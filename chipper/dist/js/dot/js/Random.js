// Copyright 2015-2024, University of Colorado Boulder
/**
 * Random number generator with an optional seed.  It uses seedrandom.js, a monkey patch for Math, see
 * https://github.com/davidbau/seedrandom.
 *
 * If you are developing a PhET Simulation, you should probably use the global `DOT/dotRandom` because it
 * provides built-in support for phet-io seeding and a check that it isn't used before the seed has been set.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Aaron Davis (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Mohamed Safi
 */ import optionize from '../../phet-core/js/optionize.js';
import dot from './dot.js';
import Utils from './Utils.js';
import Vector2 from './Vector2.js';
let Random = class Random {
    /**
   * Clears out this instance from all the Random instances.
   */ dispose() {
        Random.allRandomInstances.delete(this);
    }
    /**
   * Gets the seed.
   */ getSeed() {
        return this.seed;
    }
    /**
   * Returns the next pseudo-random boolean
   */ nextBoolean() {
        return this.nextDouble() >= 0.5;
    }
    /**
   * Returns the next pseudo random number from this random number generator sequence.
   * The random number is an integer ranging from 0 to n-1.
   * @returns an integer
   */ nextInt(n) {
        const value = this.nextDouble() * n;
        return Math.floor(value);
    }
    /**
   * Randomly select a random integer between min and max (inclusive).
   * @param min - must be an integer
   * @param max - must be an integer
   * @returns an integer between min and max, inclusive
   */ nextIntBetween(min, max) {
        assert && assert(Number.isInteger(min), `min must be an integer: ${min}`);
        assert && assert(Number.isInteger(max), `max must be an integer: ${max}`);
        const range = max - min;
        return this.nextInt(range + 1) + min;
    }
    /**
   * Randomly select one element from the given array.
   * @param array - from which one element will be selected, must have at least one element
   * @returns the selected element from the array
   */ sample(array) {
        assert && assert(array.length > 0, 'Array should have at least 1 item.');
        const index = this.nextIntBetween(0, array.length - 1);
        return array[index];
    }
    /**
   * Creates an array of shuffled values, using a version of the Fisher-Yates shuffle.  Adapted from lodash-2.4.1 by
   * Sam Reid on Aug 16, 2016, See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
   * @param array - the array which will be shuffled
   * @returns a new array with all the same elements in the passed-in array, in randomized order.
   */ shuffle(array) {
        let index = -1;
        const result = new Array(array.length);
        _.forEach(array, (value)=>{
            const rand = this.nextIntBetween(0, ++index);
            result[index] = result[rand];
            result[rand] = value;
        });
        return result;
    }
    /**
   * Returns the next pseudo random number from this random number generator sequence in the range [0, 1)
   * The distribution of the random numbers is uniformly distributed across the interval
   * @returns the random number
   */ nextDouble() {
        this.numberOfCalls++;
        return this.seedrandom();
    }
    /**
   * Randomly selects a double in the range [min,max).
   */ nextDoubleBetween(min, max) {
        assert && assert(min < max, 'min must be < max');
        const value = min + this.nextDouble() * (max - min);
        assert && assert(value >= min && value < max, `value out of range: ${value}`);
        return value;
    }
    /**
   * Returns the next gaussian-distributed random number from this random number generator sequence.
   * The distribution of the random numbers is gaussian, with a mean = 0 and standard deviation = 1
   */ nextGaussian() {
        return Utils.boxMullerTransform(0, 1, this);
    }
    /**
   * Gets the next random double in a Range.
   * For min < max, the return value is [min,max), between min (inclusive) and max (exclusive).
   * For min === max, the return value is min.
   */ nextDoubleInRange(range) {
        if (range.min < range.max) {
            return this.nextDoubleBetween(range.min, range.max);
        } else {
            // because random.nextDoubleBetween requires min < max
            return range.min;
        }
    }
    /**
   * Gets a random point within the provided Bounds2, [min,max)
   */ nextPointInBounds(bounds) {
        return new Vector2(this.nextDoubleBetween(bounds.minX, bounds.maxX), this.nextDoubleBetween(bounds.minY, bounds.maxY));
    }
    /**
   * @param seed - if null, Math.random will be used to create the seed.
   */ setSeed(seed) {
        if (typeof seed === 'number') {
            // @ts-expect-error
            assert && assert(Math.seedrandom, 'If a seed is specified, then we must also have Math.seedrandom to use the seed.');
        } else {
            seed = Math.random(); // eslint-disable-line phet/bad-sim-text
        }
        this.seed = seed;
        // If seed is provided, create a local random number generator without altering Math.random.
        // Math.seedrandom is provided by seedrandom.js, see https://github.com/davidbau/seedrandom.
        // @ts-expect-error
        this.seedrandom = Math.seedrandom ? new Math.seedrandom(`${seed}`) : ()=>Math.random(); // eslint-disable-line phet/bad-sim-text
    }
    /**
   * Choose a numeric index from the array of weights.  The array of weights does not need to be normalized.
   * See https://stackoverflow.com/questions/8877249/generate-random-integers-with-probabilities
   * See also ContinuousServer.weightedSampleTest which uses the same algorithm
   */ sampleProbabilities(weights) {
        const totalWeight = _.sum(weights);
        const cutoffWeight = totalWeight * this.nextDouble();
        let cumulativeWeight = 0;
        for(let i = 0; i < weights.length; i++){
            cumulativeWeight += weights[i];
            if (cumulativeWeight >= cutoffWeight) {
                return i;
            }
        }
        // The fallback is the last test
        assert && assert(weights[weights.length - 1] !== 0, 'if last weight is zero, should have selected something beforehand');
        return weights.length - 1;
    }
    constructor(providedOptions){
        this.seed = null;
        // If seed is provided, create a local random number generator without altering Math.random.
        // Math.seedrandom is provided by seedrandom.js, see https://github.com/davidbau/seedrandom.
        this.seedrandom = null;
        // the number of times `nextDouble` is called. Clients should not write to this value.
        this.numberOfCalls = 0;
        const options = optionize()({
            seed: null
        }, providedOptions);
        this.setSeed(options.seed);
        Random.allRandomInstances.add(this);
    }
};
Random.allRandomInstances = new Set();
export { Random as default };
dot.register('Random', Random);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5kb20udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUmFuZG9tIG51bWJlciBnZW5lcmF0b3Igd2l0aCBhbiBvcHRpb25hbCBzZWVkLiAgSXQgdXNlcyBzZWVkcmFuZG9tLmpzLCBhIG1vbmtleSBwYXRjaCBmb3IgTWF0aCwgc2VlXG4gKiBodHRwczovL2dpdGh1Yi5jb20vZGF2aWRiYXUvc2VlZHJhbmRvbS5cbiAqXG4gKiBJZiB5b3UgYXJlIGRldmVsb3BpbmcgYSBQaEVUIFNpbXVsYXRpb24sIHlvdSBzaG91bGQgcHJvYmFibHkgdXNlIHRoZSBnbG9iYWwgYERPVC9kb3RSYW5kb21gIGJlY2F1c2UgaXRcbiAqIHByb3ZpZGVzIGJ1aWx0LWluIHN1cHBvcnQgZm9yIHBoZXQtaW8gc2VlZGluZyBhbmQgYSBjaGVjayB0aGF0IGl0IGlzbid0IHVzZWQgYmVmb3JlIHRoZSBzZWVkIGhhcyBiZWVuIHNldC5cbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBBYXJvbiBEYXZpcyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIE1vaGFtZWQgU2FmaVxuICovXG5cbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuL0JvdW5kczIuanMnO1xuaW1wb3J0IGRvdCBmcm9tICcuL2RvdC5qcyc7XG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi9SYW5nZS5qcyc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi9VdGlscy5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuL1ZlY3RvcjIuanMnO1xuXG50eXBlIFJhbmRvbU9wdGlvbnMgPSB7XG5cbiAgLy8ge251bWJlcnxudWxsfSBzZWVkIGZvciB0aGUgcmFuZG9tIG51bWJlciBnZW5lcmF0b3IuICBXaGVuIHNlZWQgaXMgbnVsbCwgTWF0aC5yYW5kb20oKSBpcyB1c2VkLlxuICBzZWVkPzogbnVtYmVyIHwgbnVsbDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJhbmRvbSB7XG4gIHByaXZhdGUgc2VlZDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgLy8gSWYgc2VlZCBpcyBwcm92aWRlZCwgY3JlYXRlIGEgbG9jYWwgcmFuZG9tIG51bWJlciBnZW5lcmF0b3Igd2l0aG91dCBhbHRlcmluZyBNYXRoLnJhbmRvbS5cbiAgLy8gTWF0aC5zZWVkcmFuZG9tIGlzIHByb3ZpZGVkIGJ5IHNlZWRyYW5kb20uanMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vZGF2aWRiYXUvc2VlZHJhbmRvbS5cbiAgcHJpdmF0ZSBzZWVkcmFuZG9tOiAoICgpID0+IG51bWJlciApIHwgbnVsbCA9IG51bGw7XG5cbiAgLy8gdGhlIG51bWJlciBvZiB0aW1lcyBgbmV4dERvdWJsZWAgaXMgY2FsbGVkLiBDbGllbnRzIHNob3VsZCBub3Qgd3JpdGUgdG8gdGhpcyB2YWx1ZS5cbiAgcHVibGljIG51bWJlck9mQ2FsbHMgPSAwO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogUmFuZG9tT3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UmFuZG9tT3B0aW9ucz4oKSgge1xuICAgICAgc2VlZDogbnVsbFxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgdGhpcy5zZXRTZWVkKCBvcHRpb25zLnNlZWQgKTtcblxuICAgIFJhbmRvbS5hbGxSYW5kb21JbnN0YW5jZXMuYWRkKCB0aGlzICk7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXJzIG91dCB0aGlzIGluc3RhbmNlIGZyb20gYWxsIHRoZSBSYW5kb20gaW5zdGFuY2VzLlxuICAgKi9cbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgUmFuZG9tLmFsbFJhbmRvbUluc3RhbmNlcy5kZWxldGUoIHRoaXMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBzZWVkLlxuICAgKi9cbiAgcHVibGljIGdldFNlZWQoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuc2VlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBuZXh0IHBzZXVkby1yYW5kb20gYm9vbGVhblxuICAgKi9cbiAgcHVibGljIG5leHRCb29sZWFuKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm5leHREb3VibGUoKSA+PSAwLjU7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbmV4dCBwc2V1ZG8gcmFuZG9tIG51bWJlciBmcm9tIHRoaXMgcmFuZG9tIG51bWJlciBnZW5lcmF0b3Igc2VxdWVuY2UuXG4gICAqIFRoZSByYW5kb20gbnVtYmVyIGlzIGFuIGludGVnZXIgcmFuZ2luZyBmcm9tIDAgdG8gbi0xLlxuICAgKiBAcmV0dXJucyBhbiBpbnRlZ2VyXG4gICAqL1xuICBwdWJsaWMgbmV4dEludCggbjogbnVtYmVyICk6IG51bWJlciB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLm5leHREb3VibGUoKSAqIG47XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogUmFuZG9tbHkgc2VsZWN0IGEgcmFuZG9tIGludGVnZXIgYmV0d2VlbiBtaW4gYW5kIG1heCAoaW5jbHVzaXZlKS5cbiAgICogQHBhcmFtIG1pbiAtIG11c3QgYmUgYW4gaW50ZWdlclxuICAgKiBAcGFyYW0gbWF4IC0gbXVzdCBiZSBhbiBpbnRlZ2VyXG4gICAqIEByZXR1cm5zIGFuIGludGVnZXIgYmV0d2VlbiBtaW4gYW5kIG1heCwgaW5jbHVzaXZlXG4gICAqL1xuICBwdWJsaWMgbmV4dEludEJldHdlZW4oIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlciApOiBudW1iZXIge1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggbWluICksIGBtaW4gbXVzdCBiZSBhbiBpbnRlZ2VyOiAke21pbn1gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggbWF4ICksIGBtYXggbXVzdCBiZSBhbiBpbnRlZ2VyOiAke21heH1gICk7XG5cbiAgICBjb25zdCByYW5nZSA9IG1heCAtIG1pbjtcbiAgICByZXR1cm4gdGhpcy5uZXh0SW50KCByYW5nZSArIDEgKSArIG1pbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSYW5kb21seSBzZWxlY3Qgb25lIGVsZW1lbnQgZnJvbSB0aGUgZ2l2ZW4gYXJyYXkuXG4gICAqIEBwYXJhbSBhcnJheSAtIGZyb20gd2hpY2ggb25lIGVsZW1lbnQgd2lsbCBiZSBzZWxlY3RlZCwgbXVzdCBoYXZlIGF0IGxlYXN0IG9uZSBlbGVtZW50XG4gICAqIEByZXR1cm5zIHRoZSBzZWxlY3RlZCBlbGVtZW50IGZyb20gdGhlIGFycmF5XG4gICAqL1xuICBwdWJsaWMgc2FtcGxlPFQ+KCBhcnJheTogVFtdICk6IFQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFycmF5Lmxlbmd0aCA+IDAsICdBcnJheSBzaG91bGQgaGF2ZSBhdCBsZWFzdCAxIGl0ZW0uJyApO1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5uZXh0SW50QmV0d2VlbiggMCwgYXJyYXkubGVuZ3RoIC0gMSApO1xuICAgIHJldHVybiBhcnJheVsgaW5kZXggXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGFycmF5IG9mIHNodWZmbGVkIHZhbHVlcywgdXNpbmcgYSB2ZXJzaW9uIG9mIHRoZSBGaXNoZXItWWF0ZXMgc2h1ZmZsZS4gIEFkYXB0ZWQgZnJvbSBsb2Rhc2gtMi40LjEgYnlcbiAgICogU2FtIFJlaWQgb24gQXVnIDE2LCAyMDE2LCBTZWUgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9GaXNoZXItWWF0ZXNfc2h1ZmZsZS5cbiAgICogQHBhcmFtIGFycmF5IC0gdGhlIGFycmF5IHdoaWNoIHdpbGwgYmUgc2h1ZmZsZWRcbiAgICogQHJldHVybnMgYSBuZXcgYXJyYXkgd2l0aCBhbGwgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHBhc3NlZC1pbiBhcnJheSwgaW4gcmFuZG9taXplZCBvcmRlci5cbiAgICovXG4gIHB1YmxpYyBzaHVmZmxlPFQ+KCBhcnJheTogVFtdICk6IFRbXSB7XG4gICAgbGV0IGluZGV4ID0gLTE7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IEFycmF5KCBhcnJheS5sZW5ndGggKTtcblxuICAgIF8uZm9yRWFjaCggYXJyYXksIHZhbHVlID0+IHtcbiAgICAgIGNvbnN0IHJhbmQgPSB0aGlzLm5leHRJbnRCZXR3ZWVuKCAwLCArK2luZGV4ICk7XG4gICAgICByZXN1bHRbIGluZGV4IF0gPSByZXN1bHRbIHJhbmQgXTtcbiAgICAgIHJlc3VsdFsgcmFuZCBdID0gdmFsdWU7XG4gICAgfSApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbmV4dCBwc2V1ZG8gcmFuZG9tIG51bWJlciBmcm9tIHRoaXMgcmFuZG9tIG51bWJlciBnZW5lcmF0b3Igc2VxdWVuY2UgaW4gdGhlIHJhbmdlIFswLCAxKVxuICAgKiBUaGUgZGlzdHJpYnV0aW9uIG9mIHRoZSByYW5kb20gbnVtYmVycyBpcyB1bmlmb3JtbHkgZGlzdHJpYnV0ZWQgYWNyb3NzIHRoZSBpbnRlcnZhbFxuICAgKiBAcmV0dXJucyB0aGUgcmFuZG9tIG51bWJlclxuICAgKi9cbiAgcHVibGljIG5leHREb3VibGUoKTogbnVtYmVyIHtcbiAgICB0aGlzLm51bWJlck9mQ2FsbHMrKztcbiAgICByZXR1cm4gdGhpcy5zZWVkcmFuZG9tISgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJhbmRvbWx5IHNlbGVjdHMgYSBkb3VibGUgaW4gdGhlIHJhbmdlIFttaW4sbWF4KS5cbiAgICovXG4gIHB1YmxpYyBuZXh0RG91YmxlQmV0d2VlbiggbWluOiBudW1iZXIsIG1heDogbnVtYmVyICk6IG51bWJlciB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWluIDwgbWF4LCAnbWluIG11c3QgYmUgPCBtYXgnICk7XG4gICAgY29uc3QgdmFsdWUgPSBtaW4gKyB0aGlzLm5leHREb3VibGUoKSAqICggbWF4IC0gbWluICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdmFsdWUgPj0gbWluICYmIHZhbHVlIDwgbWF4LCBgdmFsdWUgb3V0IG9mIHJhbmdlOiAke3ZhbHVlfWAgKTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbmV4dCBnYXVzc2lhbi1kaXN0cmlidXRlZCByYW5kb20gbnVtYmVyIGZyb20gdGhpcyByYW5kb20gbnVtYmVyIGdlbmVyYXRvciBzZXF1ZW5jZS5cbiAgICogVGhlIGRpc3RyaWJ1dGlvbiBvZiB0aGUgcmFuZG9tIG51bWJlcnMgaXMgZ2F1c3NpYW4sIHdpdGggYSBtZWFuID0gMCBhbmQgc3RhbmRhcmQgZGV2aWF0aW9uID0gMVxuICAgKi9cbiAgcHVibGljIG5leHRHYXVzc2lhbigpOiBudW1iZXIge1xuICAgIHJldHVybiBVdGlscy5ib3hNdWxsZXJUcmFuc2Zvcm0oIDAsIDEsIHRoaXMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBuZXh0IHJhbmRvbSBkb3VibGUgaW4gYSBSYW5nZS5cbiAgICogRm9yIG1pbiA8IG1heCwgdGhlIHJldHVybiB2YWx1ZSBpcyBbbWluLG1heCksIGJldHdlZW4gbWluIChpbmNsdXNpdmUpIGFuZCBtYXggKGV4Y2x1c2l2ZSkuXG4gICAqIEZvciBtaW4gPT09IG1heCwgdGhlIHJldHVybiB2YWx1ZSBpcyBtaW4uXG4gICAqL1xuICBwdWJsaWMgbmV4dERvdWJsZUluUmFuZ2UoIHJhbmdlOiBSYW5nZSApOiBudW1iZXIge1xuICAgIGlmICggcmFuZ2UubWluIDwgcmFuZ2UubWF4ICkge1xuICAgICAgcmV0dXJuIHRoaXMubmV4dERvdWJsZUJldHdlZW4oIHJhbmdlLm1pbiwgcmFuZ2UubWF4ICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gYmVjYXVzZSByYW5kb20ubmV4dERvdWJsZUJldHdlZW4gcmVxdWlyZXMgbWluIDwgbWF4XG4gICAgICByZXR1cm4gcmFuZ2UubWluO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgcmFuZG9tIHBvaW50IHdpdGhpbiB0aGUgcHJvdmlkZWQgQm91bmRzMiwgW21pbixtYXgpXG4gICAqL1xuICBwdWJsaWMgbmV4dFBvaW50SW5Cb3VuZHMoIGJvdW5kczogQm91bmRzMiApOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoXG4gICAgICB0aGlzLm5leHREb3VibGVCZXR3ZWVuKCBib3VuZHMubWluWCwgYm91bmRzLm1heFggKSxcbiAgICAgIHRoaXMubmV4dERvdWJsZUJldHdlZW4oIGJvdW5kcy5taW5ZLCBib3VuZHMubWF4WSApXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gc2VlZCAtIGlmIG51bGwsIE1hdGgucmFuZG9tIHdpbGwgYmUgdXNlZCB0byBjcmVhdGUgdGhlIHNlZWQuXG4gICAqL1xuICBwdWJsaWMgc2V0U2VlZCggc2VlZDogbnVtYmVyIHwgbnVsbCApOiB2b2lkIHtcblxuICAgIGlmICggdHlwZW9mIHNlZWQgPT09ICdudW1iZXInICkge1xuXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBNYXRoLnNlZWRyYW5kb20sICdJZiBhIHNlZWQgaXMgc3BlY2lmaWVkLCB0aGVuIHdlIG11c3QgYWxzbyBoYXZlIE1hdGguc2VlZHJhbmRvbSB0byB1c2UgdGhlIHNlZWQuJyApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHNlZWQgPSBNYXRoLnJhbmRvbSgpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvYmFkLXNpbS10ZXh0XG4gICAgfVxuXG4gICAgdGhpcy5zZWVkID0gc2VlZDtcblxuICAgIC8vIElmIHNlZWQgaXMgcHJvdmlkZWQsIGNyZWF0ZSBhIGxvY2FsIHJhbmRvbSBudW1iZXIgZ2VuZXJhdG9yIHdpdGhvdXQgYWx0ZXJpbmcgTWF0aC5yYW5kb20uXG4gICAgLy8gTWF0aC5zZWVkcmFuZG9tIGlzIHByb3ZpZGVkIGJ5IHNlZWRyYW5kb20uanMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vZGF2aWRiYXUvc2VlZHJhbmRvbS5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgdGhpcy5zZWVkcmFuZG9tID0gTWF0aC5zZWVkcmFuZG9tID8gbmV3IE1hdGguc2VlZHJhbmRvbSggYCR7c2VlZH1gICkgOiAoKSA9PiBNYXRoLnJhbmRvbSgpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvYmFkLXNpbS10ZXh0XG4gIH1cblxuICAvKipcbiAgICogQ2hvb3NlIGEgbnVtZXJpYyBpbmRleCBmcm9tIHRoZSBhcnJheSBvZiB3ZWlnaHRzLiAgVGhlIGFycmF5IG9mIHdlaWdodHMgZG9lcyBub3QgbmVlZCB0byBiZSBub3JtYWxpemVkLlxuICAgKiBTZWUgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvODg3NzI0OS9nZW5lcmF0ZS1yYW5kb20taW50ZWdlcnMtd2l0aC1wcm9iYWJpbGl0aWVzXG4gICAqIFNlZSBhbHNvIENvbnRpbnVvdXNTZXJ2ZXIud2VpZ2h0ZWRTYW1wbGVUZXN0IHdoaWNoIHVzZXMgdGhlIHNhbWUgYWxnb3JpdGhtXG4gICAqL1xuICBwdWJsaWMgc2FtcGxlUHJvYmFiaWxpdGllcyggd2VpZ2h0czogcmVhZG9ubHkgbnVtYmVyW10gKTogbnVtYmVyIHtcbiAgICBjb25zdCB0b3RhbFdlaWdodCA9IF8uc3VtKCB3ZWlnaHRzICk7XG5cbiAgICBjb25zdCBjdXRvZmZXZWlnaHQgPSB0b3RhbFdlaWdodCAqIHRoaXMubmV4dERvdWJsZSgpO1xuICAgIGxldCBjdW11bGF0aXZlV2VpZ2h0ID0gMDtcblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHdlaWdodHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjdW11bGF0aXZlV2VpZ2h0ICs9IHdlaWdodHNbIGkgXTtcbiAgICAgIGlmICggY3VtdWxhdGl2ZVdlaWdodCA+PSBjdXRvZmZXZWlnaHQgKSB7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRoZSBmYWxsYmFjayBpcyB0aGUgbGFzdCB0ZXN0XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggd2VpZ2h0c1sgd2VpZ2h0cy5sZW5ndGggLSAxIF0gIT09IDAsICdpZiBsYXN0IHdlaWdodCBpcyB6ZXJvLCBzaG91bGQgaGF2ZSBzZWxlY3RlZCBzb21ldGhpbmcgYmVmb3JlaGFuZCcgKTtcbiAgICByZXR1cm4gd2VpZ2h0cy5sZW5ndGggLSAxO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBhbGxSYW5kb21JbnN0YW5jZXMgPSBuZXcgU2V0PFJhbmRvbT4oKTtcbn1cblxuZG90LnJlZ2lzdGVyKCAnUmFuZG9tJywgUmFuZG9tICk7Il0sIm5hbWVzIjpbIm9wdGlvbml6ZSIsImRvdCIsIlV0aWxzIiwiVmVjdG9yMiIsIlJhbmRvbSIsImRpc3Bvc2UiLCJhbGxSYW5kb21JbnN0YW5jZXMiLCJkZWxldGUiLCJnZXRTZWVkIiwic2VlZCIsIm5leHRCb29sZWFuIiwibmV4dERvdWJsZSIsIm5leHRJbnQiLCJuIiwidmFsdWUiLCJNYXRoIiwiZmxvb3IiLCJuZXh0SW50QmV0d2VlbiIsIm1pbiIsIm1heCIsImFzc2VydCIsIk51bWJlciIsImlzSW50ZWdlciIsInJhbmdlIiwic2FtcGxlIiwiYXJyYXkiLCJsZW5ndGgiLCJpbmRleCIsInNodWZmbGUiLCJyZXN1bHQiLCJBcnJheSIsIl8iLCJmb3JFYWNoIiwicmFuZCIsIm51bWJlck9mQ2FsbHMiLCJzZWVkcmFuZG9tIiwibmV4dERvdWJsZUJldHdlZW4iLCJuZXh0R2F1c3NpYW4iLCJib3hNdWxsZXJUcmFuc2Zvcm0iLCJuZXh0RG91YmxlSW5SYW5nZSIsIm5leHRQb2ludEluQm91bmRzIiwiYm91bmRzIiwibWluWCIsIm1heFgiLCJtaW5ZIiwibWF4WSIsInNldFNlZWQiLCJyYW5kb20iLCJzYW1wbGVQcm9iYWJpbGl0aWVzIiwid2VpZ2h0cyIsInRvdGFsV2VpZ2h0Iiwic3VtIiwiY3V0b2ZmV2VpZ2h0IiwiY3VtdWxhdGl2ZVdlaWdodCIsImkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiYWRkIiwiU2V0IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Q0FXQyxHQUVELE9BQU9BLGVBQWUsa0NBQWtDO0FBRXhELE9BQU9DLFNBQVMsV0FBVztBQUUzQixPQUFPQyxXQUFXLGFBQWE7QUFDL0IsT0FBT0MsYUFBYSxlQUFlO0FBUXBCLElBQUEsQUFBTUMsU0FBTixNQUFNQTtJQXFCbkI7O0dBRUMsR0FDRCxBQUFPQyxVQUFnQjtRQUNyQkQsT0FBT0Usa0JBQWtCLENBQUNDLE1BQU0sQ0FBRSxJQUFJO0lBQ3hDO0lBRUE7O0dBRUMsR0FDRCxBQUFPQyxVQUF5QjtRQUM5QixPQUFPLElBQUksQ0FBQ0MsSUFBSTtJQUNsQjtJQUVBOztHQUVDLEdBQ0QsQUFBT0MsY0FBdUI7UUFDNUIsT0FBTyxJQUFJLENBQUNDLFVBQVUsTUFBTTtJQUM5QjtJQUVBOzs7O0dBSUMsR0FDRCxBQUFPQyxRQUFTQyxDQUFTLEVBQVc7UUFDbEMsTUFBTUMsUUFBUSxJQUFJLENBQUNILFVBQVUsS0FBS0U7UUFDbEMsT0FBT0UsS0FBS0MsS0FBSyxDQUFFRjtJQUNyQjtJQUVBOzs7OztHQUtDLEdBQ0QsQUFBT0csZUFBZ0JDLEdBQVcsRUFBRUMsR0FBVyxFQUFXO1FBRXhEQyxVQUFVQSxPQUFRQyxPQUFPQyxTQUFTLENBQUVKLE1BQU8sQ0FBQyx3QkFBd0IsRUFBRUEsS0FBSztRQUMz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