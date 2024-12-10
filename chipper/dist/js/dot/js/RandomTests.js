// Copyright 2023-2024, University of Colorado Boulder
/**
 * Random tests
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import Bounds2 from './Bounds2.js';
import dotRandom from './dotRandom.js';
import Random from './Random.js';
QUnit.module('Random');
QUnit.test('Random.nextPointInBounds', (assert)=>{
    const bounds = new Bounds2(-11, 0, 3, 100);
    const random = new Random(); // eslint-disable-line phet/bad-sim-text
    for(let i = 0; i < 100; i++){
        assert.ok(bounds.containsPoint(random.nextPointInBounds(bounds)), `random point is in bounds: ${i}`);
    }
});
// Test that the sampling engine is working properly
QUnit.test('sample probabilities', (assert)=>{
    assert.ok('first test');
    const testWeights = (weights)=>{
        const array = new Array(weights.length);
        _.fill(array, 0, 0, array.length);
        for(let i = 0; i < 50000; i++){
            const index = dotRandom.sampleProbabilities(weights);
            array[index]++;
        }
        const inputNormalized = weights.map((element)=>element / _.sum(weights));
        const resultNormalized = array.map((element)=>element / _.sum(array));
        let ok = true;
        for(let i = 0; i < weights.length; i++){
            if (Math.abs(inputNormalized[i] - resultNormalized[i]) > 0.1) {
                ok = false;
            }
        }
        assert.ok(ok, `inputNormalized: ${inputNormalized.join(',')}, resultNormalized: ${resultNormalized.join(',')}`);
    };
    testWeights([
        1,
        2,
        3,
        4
    ]);
    testWeights([
        0,
        1,
        0,
        0
    ]);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5kb21UZXN0cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBSYW5kb20gdGVzdHNcbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi9Cb3VuZHMyLmpzJztcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi9kb3RSYW5kb20uanMnO1xuaW1wb3J0IFJhbmRvbSBmcm9tICcuL1JhbmRvbS5qcyc7XG5cblFVbml0Lm1vZHVsZSggJ1JhbmRvbScgKTtcblxuUVVuaXQudGVzdCggJ1JhbmRvbS5uZXh0UG9pbnRJbkJvdW5kcycsIGFzc2VydCA9PiB7XG5cbiAgY29uc3QgYm91bmRzID0gbmV3IEJvdW5kczIoIC0xMSwgMCwgMywgMTAwICk7XG4gIGNvbnN0IHJhbmRvbSA9IG5ldyBSYW5kb20oKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L2JhZC1zaW0tdGV4dFxuXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IDEwMDsgaSsrICkge1xuICAgIGFzc2VydC5vayggYm91bmRzLmNvbnRhaW5zUG9pbnQoIHJhbmRvbS5uZXh0UG9pbnRJbkJvdW5kcyggYm91bmRzICkgKSwgYHJhbmRvbSBwb2ludCBpcyBpbiBib3VuZHM6ICR7aX1gICk7XG4gIH1cbn0gKTtcblxuLy8gVGVzdCB0aGF0IHRoZSBzYW1wbGluZyBlbmdpbmUgaXMgd29ya2luZyBwcm9wZXJseVxuUVVuaXQudGVzdCggJ3NhbXBsZSBwcm9iYWJpbGl0aWVzJywgYXNzZXJ0ID0+IHtcbiAgYXNzZXJ0Lm9rKCAnZmlyc3QgdGVzdCcgKTtcblxuICBjb25zdCB0ZXN0V2VpZ2h0cyA9IHdlaWdodHMgPT4ge1xuXG4gICAgY29uc3QgYXJyYXkgPSBuZXcgQXJyYXkoIHdlaWdodHMubGVuZ3RoICk7XG4gICAgXy5maWxsKCBhcnJheSwgMCwgMCwgYXJyYXkubGVuZ3RoICk7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgNTAwMDA7IGkrKyApIHtcbiAgICAgIGNvbnN0IGluZGV4ID0gZG90UmFuZG9tLnNhbXBsZVByb2JhYmlsaXRpZXMoIHdlaWdodHMgKTtcbiAgICAgIGFycmF5WyBpbmRleCBdKys7XG4gICAgfVxuXG4gICAgY29uc3QgaW5wdXROb3JtYWxpemVkID0gd2VpZ2h0cy5tYXAoIGVsZW1lbnQgPT4gKCBlbGVtZW50IC8gXy5zdW0oIHdlaWdodHMgKSApICk7XG4gICAgY29uc3QgcmVzdWx0Tm9ybWFsaXplZCA9IGFycmF5Lm1hcCggZWxlbWVudCA9PiAoIGVsZW1lbnQgLyBfLnN1bSggYXJyYXkgKSApICk7XG5cbiAgICBsZXQgb2sgPSB0cnVlO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHdlaWdodHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiAoIE1hdGguYWJzKCBpbnB1dE5vcm1hbGl6ZWRbIGkgXSAtIHJlc3VsdE5vcm1hbGl6ZWRbIGkgXSApID4gMC4xICkge1xuICAgICAgICBvayA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICBhc3NlcnQub2soIG9rLCBgaW5wdXROb3JtYWxpemVkOiAke2lucHV0Tm9ybWFsaXplZC5qb2luKCAnLCcgKX0sIHJlc3VsdE5vcm1hbGl6ZWQ6ICR7cmVzdWx0Tm9ybWFsaXplZC5qb2luKCAnLCcgKX1gICk7XG4gIH07XG4gIHRlc3RXZWlnaHRzKCBbIDEsIDIsIDMsIDQgXSApO1xuICB0ZXN0V2VpZ2h0cyggWyAwLCAxLCAwLCAwIF0gKTtcbn0gKTsiXSwibmFtZXMiOlsiQm91bmRzMiIsImRvdFJhbmRvbSIsIlJhbmRvbSIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsImJvdW5kcyIsInJhbmRvbSIsImkiLCJvayIsImNvbnRhaW5zUG9pbnQiLCJuZXh0UG9pbnRJbkJvdW5kcyIsInRlc3RXZWlnaHRzIiwid2VpZ2h0cyIsImFycmF5IiwiQXJyYXkiLCJsZW5ndGgiLCJfIiwiZmlsbCIsImluZGV4Iiwic2FtcGxlUHJvYmFiaWxpdGllcyIsImlucHV0Tm9ybWFsaXplZCIsIm1hcCIsImVsZW1lbnQiLCJzdW0iLCJyZXN1bHROb3JtYWxpemVkIiwiTWF0aCIsImFicyIsImpvaW4iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsYUFBYSxlQUFlO0FBQ25DLE9BQU9DLGVBQWUsaUJBQWlCO0FBQ3ZDLE9BQU9DLFlBQVksY0FBYztBQUVqQ0MsTUFBTUMsTUFBTSxDQUFFO0FBRWRELE1BQU1FLElBQUksQ0FBRSw0QkFBNEJDLENBQUFBO0lBRXRDLE1BQU1DLFNBQVMsSUFBSVAsUUFBUyxDQUFDLElBQUksR0FBRyxHQUFHO0lBQ3ZDLE1BQU1RLFNBQVMsSUFBSU4sVUFBVSx3Q0FBd0M7SUFFckUsSUFBTSxJQUFJTyxJQUFJLEdBQUdBLElBQUksS0FBS0EsSUFBTTtRQUM5QkgsT0FBT0ksRUFBRSxDQUFFSCxPQUFPSSxhQUFhLENBQUVILE9BQU9JLGlCQUFpQixDQUFFTCxVQUFZLENBQUMsMkJBQTJCLEVBQUVFLEdBQUc7SUFDMUc7QUFDRjtBQUVBLG9EQUFvRDtBQUNwRE4sTUFBTUUsSUFBSSxDQUFFLHdCQUF3QkMsQ0FBQUE7SUFDbENBLE9BQU9JLEVBQUUsQ0FBRTtJQUVYLE1BQU1HLGNBQWNDLENBQUFBO1FBRWxCLE1BQU1DLFFBQVEsSUFBSUMsTUFBT0YsUUFBUUcsTUFBTTtRQUN2Q0MsRUFBRUMsSUFBSSxDQUFFSixPQUFPLEdBQUcsR0FBR0EsTUFBTUUsTUFBTTtRQUNqQyxJQUFNLElBQUlSLElBQUksR0FBR0EsSUFBSSxPQUFPQSxJQUFNO1lBQ2hDLE1BQU1XLFFBQVFuQixVQUFVb0IsbUJBQW1CLENBQUVQO1lBQzdDQyxLQUFLLENBQUVLLE1BQU87UUFDaEI7UUFFQSxNQUFNRSxrQkFBa0JSLFFBQVFTLEdBQUcsQ0FBRUMsQ0FBQUEsVUFBYUEsVUFBVU4sRUFBRU8sR0FBRyxDQUFFWDtRQUNuRSxNQUFNWSxtQkFBbUJYLE1BQU1RLEdBQUcsQ0FBRUMsQ0FBQUEsVUFBYUEsVUFBVU4sRUFBRU8sR0FBRyxDQUFFVjtRQUVsRSxJQUFJTCxLQUFLO1FBQ1QsSUFBTSxJQUFJRCxJQUFJLEdBQUdBLElBQUlLLFFBQVFHLE1BQU0sRUFBRVIsSUFBTTtZQUN6QyxJQUFLa0IsS0FBS0MsR0FBRyxDQUFFTixlQUFlLENBQUViLEVBQUcsR0FBR2lCLGdCQUFnQixDQUFFakIsRUFBRyxJQUFLLEtBQU07Z0JBQ3BFQyxLQUFLO1lBQ1A7UUFDRjtRQUNBSixPQUFPSSxFQUFFLENBQUVBLElBQUksQ0FBQyxpQkFBaUIsRUFBRVksZ0JBQWdCTyxJQUFJLENBQUUsS0FBTSxvQkFBb0IsRUFBRUgsaUJBQWlCRyxJQUFJLENBQUUsTUFBTztJQUNySDtJQUNBaEIsWUFBYTtRQUFFO1FBQUc7UUFBRztRQUFHO0tBQUc7SUFDM0JBLFlBQWE7UUFBRTtRQUFHO1FBQUc7UUFBRztLQUFHO0FBQzdCIn0=