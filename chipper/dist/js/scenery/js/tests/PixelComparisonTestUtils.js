// Copyright 2024, University of Colorado Boulder
/**
 * Utility functions for pixel comparison tests.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import platform from '../../../phet-core/js/platform.js';
import { Color, Display, Node } from '../imports.js';
const TESTED_RENDERERS = [
    'canvas',
    'svg',
    'dom',
    'webgl'
];
const PixelComparisonTestUtils = {
    DEFAULT_THRESHOLD: 1.5,
    /**
   * Returns an ImageData object representing pixel data from the provided image.
   */ snapshotFromImage: (image)=>{
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, image.width, image.height);
        return context.getImageData(0, 0, image.width, image.height);
    },
    /**
   * Draws the provided snapshot to a canvas and returns the canvas.
   */ snapshotToCanvas: (snapshot)=>{
        const canvas = document.createElement('canvas');
        canvas.width = snapshot.width;
        canvas.height = snapshot.height;
        const context = canvas.getContext('2d');
        context.putImageData(snapshot, 0, 0);
        $(canvas).css('border', '1px solid black');
        return canvas;
    },
    /**
   * Checks to see if pixel comparison tests are supported on the current platform. Pixel comparisons
   * are only guaranteed on Firefox and Chrome.
   *
   * Returns true if supported, and logs an error message if not.
   */ platformSupportsPixelComparisonTests: ()=>{
        const supported = platform.firefox || platform.chromium;
        if (!supported) {
            window.console && window.console.log && window.console.log('Not running pixel-comparison tests, platform not supported.');
        }
        return supported;
    },
    /**
   * Compares two pixel snapshots {ImageData} and uses QUnit's assert to verify they are the same.
   */ snapshotEquals: (assert, a, b, threshold, message, extraDom)=>{
        let isEqual = a.width === b.width && a.height === b.height;
        let largestDifference = 0;
        let totalDifference = 0;
        const colorDiffData = document.createElement('canvas').getContext('2d').createImageData(a.width, a.height);
        const alphaDiffData = document.createElement('canvas').getContext('2d').createImageData(a.width, a.height);
        if (isEqual) {
            for(let i = 0; i < a.data.length; i++){
                const diff = Math.abs(a.data[i] - b.data[i]);
                if (i % 4 === 3) {
                    colorDiffData.data[i] = 255;
                    alphaDiffData.data[i] = 255;
                    alphaDiffData.data[i - 3] = diff; // red
                    alphaDiffData.data[i - 2] = diff; // green
                    alphaDiffData.data[i - 1] = diff; // blue
                } else {
                    colorDiffData.data[i] = diff;
                }
                const alphaIndex = i - i % 4 + 3;
                // grab the associated alpha channel and multiply it times the diff
                const alphaMultipliedDiff = i % 4 === 3 ? diff : diff * (a.data[alphaIndex] / 255) * (b.data[alphaIndex] / 255);
                totalDifference += alphaMultipliedDiff;
                // if ( alphaMultipliedDiff > threshold ) {
                // console.log( message + ': ' + Math.abs( a.data[i] - b.data[i] ) );
                largestDifference = Math.max(largestDifference, alphaMultipliedDiff);
            // isEqual = false;
            // break;
            // }
            }
        }
        const averageDifference = totalDifference / (4 * a.width * a.height);
        if (averageDifference > threshold) {
            const display = $('#display');
            // header
            const note = document.createElement('h2');
            $(note).text(message);
            display.append(note);
            const differenceDiv = document.createElement('div');
            $(differenceDiv).text(`(actual) (expected) (color diff) (alpha diff) Diffs max: ${largestDifference}, average: ${averageDifference}`);
            display.append(differenceDiv);
            display.append(PixelComparisonTestUtils.snapshotToCanvas(a));
            display.append(PixelComparisonTestUtils.snapshotToCanvas(b));
            display.append(PixelComparisonTestUtils.snapshotToCanvas(colorDiffData));
            display.append(PixelComparisonTestUtils.snapshotToCanvas(alphaDiffData));
            if (extraDom) {
                display.append(extraDom);
            }
            // for a line-break
            display.append(document.createElement('div'));
            isEqual = false;
        }
        assert.ok(isEqual, message);
        return isEqual;
    },
    /**
   * Runs a pixel comparison test with QUnit between a reference data URL and a Display (with options and setup).
   *
   * @param name - Test name
   * @param setup - Called to set up the scene and display with rendered content.
   *                           function( scene, display, asyncCallback ). If asynchronous, call the asyncCallback when
   *                           the Display is ready to be rasterized.
   * @param dataURL - The reference data URL to compare against
   * @param threshold - Numerical threshold to determine how much error is acceptable
   * @param isAsync - Whether the setup function is asynchronous
   */ pixelTest: (name, setup, dataURL, threshold, isAsync)=>{
        QUnit.test(name, (assert)=>{
            const done = assert.async();
            // set up the scene/display
            const scene = new Node();
            const display = new Display(scene, {
                preserveDrawingBuffer: true
            });
            function loadImages() {
                // called when both images have been loaded
                function compareSnapshots() {
                    const referenceSnapshot = PixelComparisonTestUtils.snapshotFromImage(referenceImage);
                    const freshSnapshot = PixelComparisonTestUtils.snapshotFromImage(freshImage);
                    display.domElement.style.position = 'relative'; // don't have it be absolutely positioned
                    display.domElement.style.border = '1px solid black'; // border
                    // the actual comparison statement
                    PixelComparisonTestUtils.snapshotEquals(assert, freshSnapshot, referenceSnapshot, threshold, name, display.domElement);
                    // tell qunit that we're done? (that's what the old version did, seems potentially wrong but working?)
                    done();
                }
                // load images to compare
                let loadedCount = 0;
                const referenceImage = document.createElement('img');
                const freshImage = document.createElement('img');
                referenceImage.onload = freshImage.onload = ()=>{
                    if (++loadedCount === 2) {
                        compareSnapshots();
                    }
                };
                referenceImage.onerror = ()=>{
                    assert.ok(false, `${name} reference image failed to load`);
                    done();
                };
                freshImage.onerror = ()=>{
                    assert.ok(false, `${name} fresh image failed to load`);
                    done();
                };
                referenceImage.src = dataURL;
                display.foreignObjectRasterization((url)=>{
                    if (!url) {
                        assert.ok(false, `${name} failed to rasterize the display`);
                        done();
                        return;
                    }
                    freshImage.src = url;
                });
            }
            setup(scene, display, loadImages);
            if (!isAsync) {
                loadImages();
            }
        });
    },
    /**
   * Like pixelTest, but for multiple listeners ({string[]}). Don't override the renderer on the scene.
   */ multipleRendererTest: (name, setup, dataURL, threshold, renderers, isAsync)=>{
        for(let i = 0; i < renderers.length; i++){
            (()=>{
                const renderer = renderers[i];
                PixelComparisonTestUtils.pixelTest(`${name} (${renderer})`, (scene, display, asyncCallback)=>{
                    scene.renderer = renderer;
                    setup(scene, display, asyncCallback);
                }, dataURL, threshold, !!isAsync);
            })();
        }
    },
    COLORS: [
        new Color(62, 171, 3),
        new Color(23, 180, 77),
        new Color(24, 183, 138),
        new Color(23, 178, 194),
        new Color(20, 163, 238),
        new Color(71, 136, 255),
        new Color(171, 101, 255),
        new Color(228, 72, 235),
        new Color(252, 66, 186),
        new Color(252, 82, 127)
    ],
    TESTED_RENDERERS: TESTED_RENDERERS,
    LAYOUT_TESTED_RENDERERS: [
        'svg'
    ],
    NON_DOM_WEBGL_TESTED_RENDERERS: TESTED_RENDERERS.filter((renderer)=>renderer !== 'dom' && renderer !== 'webgl')
};
export default PixelComparisonTestUtils;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdGVzdHMvUGl4ZWxDb21wYXJpc29uVGVzdFV0aWxzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBVdGlsaXR5IGZ1bmN0aW9ucyBmb3IgcGl4ZWwgY29tcGFyaXNvbiB0ZXN0cy5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IHBsYXRmb3JtIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9wbGF0Zm9ybS5qcyc7XG5pbXBvcnQgeyBDb2xvciwgRGlzcGxheSwgTm9kZSwgUmVuZGVyZXJUeXBlIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmNvbnN0IFRFU1RFRF9SRU5ERVJFUlM6IFJlbmRlcmVyVHlwZVtdID0gWyAnY2FudmFzJywgJ3N2ZycsICdkb20nLCAnd2ViZ2wnIF07XG5cbmNvbnN0IFBpeGVsQ29tcGFyaXNvblRlc3RVdGlscyA9IHtcblxuICBERUZBVUxUX1RIUkVTSE9MRDogMS41LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIEltYWdlRGF0YSBvYmplY3QgcmVwcmVzZW50aW5nIHBpeGVsIGRhdGEgZnJvbSB0aGUgcHJvdmlkZWQgaW1hZ2UuXG4gICAqL1xuICBzbmFwc2hvdEZyb21JbWFnZTogKCBpbWFnZTogSFRNTEltYWdlRWxlbWVudCApOiBJbWFnZURhdGEgPT4ge1xuXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcbiAgICBjYW52YXMud2lkdGggPSBpbWFnZS53aWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0O1xuICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApITtcbiAgICBjb250ZXh0LmRyYXdJbWFnZSggaW1hZ2UsIDAsIDAsIGltYWdlLndpZHRoLCBpbWFnZS5oZWlnaHQgKTtcbiAgICByZXR1cm4gY29udGV4dC5nZXRJbWFnZURhdGEoIDAsIDAsIGltYWdlLndpZHRoLCBpbWFnZS5oZWlnaHQgKTtcbiAgfSxcblxuICAvKipcbiAgICogRHJhd3MgdGhlIHByb3ZpZGVkIHNuYXBzaG90IHRvIGEgY2FudmFzIGFuZCByZXR1cm5zIHRoZSBjYW52YXMuXG4gICAqL1xuICBzbmFwc2hvdFRvQ2FudmFzOiAoIHNuYXBzaG90OiBJbWFnZURhdGEgKTogSFRNTENhbnZhc0VsZW1lbnQgPT4ge1xuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG4gICAgY2FudmFzLndpZHRoID0gc25hcHNob3Qud2lkdGg7XG4gICAgY2FudmFzLmhlaWdodCA9IHNuYXBzaG90LmhlaWdodDtcbiAgICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoICcyZCcgKSE7XG4gICAgY29udGV4dC5wdXRJbWFnZURhdGEoIHNuYXBzaG90LCAwLCAwICk7XG4gICAgJCggY2FudmFzICkuY3NzKCAnYm9yZGVyJywgJzFweCBzb2xpZCBibGFjaycgKTtcbiAgICByZXR1cm4gY2FudmFzO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDaGVja3MgdG8gc2VlIGlmIHBpeGVsIGNvbXBhcmlzb24gdGVzdHMgYXJlIHN1cHBvcnRlZCBvbiB0aGUgY3VycmVudCBwbGF0Zm9ybS4gUGl4ZWwgY29tcGFyaXNvbnNcbiAgICogYXJlIG9ubHkgZ3VhcmFudGVlZCBvbiBGaXJlZm94IGFuZCBDaHJvbWUuXG4gICAqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBzdXBwb3J0ZWQsIGFuZCBsb2dzIGFuIGVycm9yIG1lc3NhZ2UgaWYgbm90LlxuICAgKi9cbiAgcGxhdGZvcm1TdXBwb3J0c1BpeGVsQ29tcGFyaXNvblRlc3RzOiAoKTogYm9vbGVhbiA9PiB7XG4gICAgY29uc3Qgc3VwcG9ydGVkID0gcGxhdGZvcm0uZmlyZWZveCB8fCBwbGF0Zm9ybS5jaHJvbWl1bTtcbiAgICBpZiAoICFzdXBwb3J0ZWQgKSB7XG4gICAgICB3aW5kb3cuY29uc29sZSAmJiB3aW5kb3cuY29uc29sZS5sb2cgJiYgd2luZG93LmNvbnNvbGUubG9nKCAnTm90IHJ1bm5pbmcgcGl4ZWwtY29tcGFyaXNvbiB0ZXN0cywgcGxhdGZvcm0gbm90IHN1cHBvcnRlZC4nICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN1cHBvcnRlZDtcbiAgfSxcblxuICAvKipcbiAgICogQ29tcGFyZXMgdHdvIHBpeGVsIHNuYXBzaG90cyB7SW1hZ2VEYXRhfSBhbmQgdXNlcyBRVW5pdCdzIGFzc2VydCB0byB2ZXJpZnkgdGhleSBhcmUgdGhlIHNhbWUuXG4gICAqL1xuICBzbmFwc2hvdEVxdWFsczogKCBhc3NlcnQ6IEFzc2VydCwgYTogSW1hZ2VEYXRhLCBiOiBJbWFnZURhdGEsIHRocmVzaG9sZDogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcsIGV4dHJhRG9tPzogSFRNTEVsZW1lbnQgKTogYm9vbGVhbiA9PiB7XG5cbiAgICBsZXQgaXNFcXVhbCA9IGEud2lkdGggPT09IGIud2lkdGggJiYgYS5oZWlnaHQgPT09IGIuaGVpZ2h0O1xuICAgIGxldCBsYXJnZXN0RGlmZmVyZW5jZSA9IDA7XG4gICAgbGV0IHRvdGFsRGlmZmVyZW5jZSA9IDA7XG4gICAgY29uc3QgY29sb3JEaWZmRGF0YSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICkuZ2V0Q29udGV4dCggJzJkJyApIS5jcmVhdGVJbWFnZURhdGEoIGEud2lkdGgsIGEuaGVpZ2h0ICk7XG4gICAgY29uc3QgYWxwaGFEaWZmRGF0YSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICkuZ2V0Q29udGV4dCggJzJkJyApIS5jcmVhdGVJbWFnZURhdGEoIGEud2lkdGgsIGEuaGVpZ2h0ICk7XG4gICAgaWYgKCBpc0VxdWFsICkge1xuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYS5kYXRhLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBjb25zdCBkaWZmID0gTWF0aC5hYnMoIGEuZGF0YVsgaSBdIC0gYi5kYXRhWyBpIF0gKTtcbiAgICAgICAgaWYgKCBpICUgNCA9PT0gMyApIHtcbiAgICAgICAgICBjb2xvckRpZmZEYXRhLmRhdGFbIGkgXSA9IDI1NTtcbiAgICAgICAgICBhbHBoYURpZmZEYXRhLmRhdGFbIGkgXSA9IDI1NTtcbiAgICAgICAgICBhbHBoYURpZmZEYXRhLmRhdGFbIGkgLSAzIF0gPSBkaWZmOyAvLyByZWRcbiAgICAgICAgICBhbHBoYURpZmZEYXRhLmRhdGFbIGkgLSAyIF0gPSBkaWZmOyAvLyBncmVlblxuICAgICAgICAgIGFscGhhRGlmZkRhdGEuZGF0YVsgaSAtIDEgXSA9IGRpZmY7IC8vIGJsdWVcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBjb2xvckRpZmZEYXRhLmRhdGFbIGkgXSA9IGRpZmY7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYWxwaGFJbmRleCA9ICggaSAtICggaSAlIDQgKSArIDMgKTtcbiAgICAgICAgLy8gZ3JhYiB0aGUgYXNzb2NpYXRlZCBhbHBoYSBjaGFubmVsIGFuZCBtdWx0aXBseSBpdCB0aW1lcyB0aGUgZGlmZlxuICAgICAgICBjb25zdCBhbHBoYU11bHRpcGxpZWREaWZmID0gKCBpICUgNCA9PT0gMyApID8gZGlmZiA6IGRpZmYgKiAoIGEuZGF0YVsgYWxwaGFJbmRleCBdIC8gMjU1ICkgKiAoIGIuZGF0YVsgYWxwaGFJbmRleCBdIC8gMjU1ICk7XG5cbiAgICAgICAgdG90YWxEaWZmZXJlbmNlICs9IGFscGhhTXVsdGlwbGllZERpZmY7XG4gICAgICAgIC8vIGlmICggYWxwaGFNdWx0aXBsaWVkRGlmZiA+IHRocmVzaG9sZCApIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coIG1lc3NhZ2UgKyAnOiAnICsgTWF0aC5hYnMoIGEuZGF0YVtpXSAtIGIuZGF0YVtpXSApICk7XG4gICAgICAgIGxhcmdlc3REaWZmZXJlbmNlID0gTWF0aC5tYXgoIGxhcmdlc3REaWZmZXJlbmNlLCBhbHBoYU11bHRpcGxpZWREaWZmICk7XG4gICAgICAgIC8vIGlzRXF1YWwgPSBmYWxzZTtcbiAgICAgICAgLy8gYnJlYWs7XG4gICAgICAgIC8vIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgYXZlcmFnZURpZmZlcmVuY2UgPSB0b3RhbERpZmZlcmVuY2UgLyAoIDQgKiBhLndpZHRoICogYS5oZWlnaHQgKTtcbiAgICBpZiAoIGF2ZXJhZ2VEaWZmZXJlbmNlID4gdGhyZXNob2xkICkge1xuICAgICAgY29uc3QgZGlzcGxheSA9ICQoICcjZGlzcGxheScgKTtcbiAgICAgIC8vIGhlYWRlclxuICAgICAgY29uc3Qgbm90ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdoMicgKTtcbiAgICAgICQoIG5vdGUgKS50ZXh0KCBtZXNzYWdlICk7XG4gICAgICBkaXNwbGF5LmFwcGVuZCggbm90ZSApO1xuICAgICAgY29uc3QgZGlmZmVyZW5jZURpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG4gICAgICAkKCBkaWZmZXJlbmNlRGl2ICkudGV4dCggYChhY3R1YWwpIChleHBlY3RlZCkgKGNvbG9yIGRpZmYpIChhbHBoYSBkaWZmKSBEaWZmcyBtYXg6ICR7bGFyZ2VzdERpZmZlcmVuY2V9LCBhdmVyYWdlOiAke2F2ZXJhZ2VEaWZmZXJlbmNlfWAgKTtcbiAgICAgIGRpc3BsYXkuYXBwZW5kKCBkaWZmZXJlbmNlRGl2ICk7XG5cbiAgICAgIGRpc3BsYXkuYXBwZW5kKCBQaXhlbENvbXBhcmlzb25UZXN0VXRpbHMuc25hcHNob3RUb0NhbnZhcyggYSApICk7XG4gICAgICBkaXNwbGF5LmFwcGVuZCggUGl4ZWxDb21wYXJpc29uVGVzdFV0aWxzLnNuYXBzaG90VG9DYW52YXMoIGIgKSApO1xuICAgICAgZGlzcGxheS5hcHBlbmQoIFBpeGVsQ29tcGFyaXNvblRlc3RVdGlscy5zbmFwc2hvdFRvQ2FudmFzKCBjb2xvckRpZmZEYXRhICkgKTtcbiAgICAgIGRpc3BsYXkuYXBwZW5kKCBQaXhlbENvbXBhcmlzb25UZXN0VXRpbHMuc25hcHNob3RUb0NhbnZhcyggYWxwaGFEaWZmRGF0YSApICk7XG5cbiAgICAgIGlmICggZXh0cmFEb20gKSB7XG4gICAgICAgIGRpc3BsYXkuYXBwZW5kKCBleHRyYURvbSApO1xuICAgICAgfVxuXG4gICAgICAvLyBmb3IgYSBsaW5lLWJyZWFrXG4gICAgICBkaXNwbGF5LmFwcGVuZCggZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKSApO1xuXG4gICAgICBpc0VxdWFsID0gZmFsc2U7XG4gICAgfVxuICAgIGFzc2VydC5vayggaXNFcXVhbCwgbWVzc2FnZSApO1xuICAgIHJldHVybiBpc0VxdWFsO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSdW5zIGEgcGl4ZWwgY29tcGFyaXNvbiB0ZXN0IHdpdGggUVVuaXQgYmV0d2VlbiBhIHJlZmVyZW5jZSBkYXRhIFVSTCBhbmQgYSBEaXNwbGF5ICh3aXRoIG9wdGlvbnMgYW5kIHNldHVwKS5cbiAgICpcbiAgICogQHBhcmFtIG5hbWUgLSBUZXN0IG5hbWVcbiAgICogQHBhcmFtIHNldHVwIC0gQ2FsbGVkIHRvIHNldCB1cCB0aGUgc2NlbmUgYW5kIGRpc3BsYXkgd2l0aCByZW5kZXJlZCBjb250ZW50LlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCBzY2VuZSwgZGlzcGxheSwgYXN5bmNDYWxsYmFjayApLiBJZiBhc3luY2hyb25vdXMsIGNhbGwgdGhlIGFzeW5jQ2FsbGJhY2sgd2hlblxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBEaXNwbGF5IGlzIHJlYWR5IHRvIGJlIHJhc3Rlcml6ZWQuXG4gICAqIEBwYXJhbSBkYXRhVVJMIC0gVGhlIHJlZmVyZW5jZSBkYXRhIFVSTCB0byBjb21wYXJlIGFnYWluc3RcbiAgICogQHBhcmFtIHRocmVzaG9sZCAtIE51bWVyaWNhbCB0aHJlc2hvbGQgdG8gZGV0ZXJtaW5lIGhvdyBtdWNoIGVycm9yIGlzIGFjY2VwdGFibGVcbiAgICogQHBhcmFtIGlzQXN5bmMgLSBXaGV0aGVyIHRoZSBzZXR1cCBmdW5jdGlvbiBpcyBhc3luY2hyb25vdXNcbiAgICovXG4gIHBpeGVsVGVzdDogKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzZXR1cDogKCBzY2VuZTogTm9kZSwgZGlzcGxheTogRGlzcGxheSwgYXN5bmNDYWxsYmFjazogKCkgPT4gdm9pZCApID0+IHZvaWQsXG4gICAgZGF0YVVSTDogc3RyaW5nLFxuICAgIHRocmVzaG9sZDogbnVtYmVyLFxuICAgIGlzQXN5bmM6IGJvb2xlYW5cbiAgKTogdm9pZCA9PiB7XG5cbiAgICBRVW5pdC50ZXN0KCBuYW1lLCBhc3NlcnQgPT4ge1xuICAgICAgY29uc3QgZG9uZSA9IGFzc2VydC5hc3luYygpO1xuICAgICAgLy8gc2V0IHVwIHRoZSBzY2VuZS9kaXNwbGF5XG4gICAgICBjb25zdCBzY2VuZSA9IG5ldyBOb2RlKCk7XG4gICAgICBjb25zdCBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHNjZW5lLCB7XG4gICAgICAgIHByZXNlcnZlRHJhd2luZ0J1ZmZlcjogdHJ1ZVxuICAgICAgfSApO1xuXG4gICAgICBmdW5jdGlvbiBsb2FkSW1hZ2VzKCk6IHZvaWQge1xuICAgICAgICAvLyBjYWxsZWQgd2hlbiBib3RoIGltYWdlcyBoYXZlIGJlZW4gbG9hZGVkXG4gICAgICAgIGZ1bmN0aW9uIGNvbXBhcmVTbmFwc2hvdHMoKTogdm9pZCB7XG4gICAgICAgICAgY29uc3QgcmVmZXJlbmNlU25hcHNob3QgPSBQaXhlbENvbXBhcmlzb25UZXN0VXRpbHMuc25hcHNob3RGcm9tSW1hZ2UoIHJlZmVyZW5jZUltYWdlICk7XG4gICAgICAgICAgY29uc3QgZnJlc2hTbmFwc2hvdCA9IFBpeGVsQ29tcGFyaXNvblRlc3RVdGlscy5zbmFwc2hvdEZyb21JbWFnZSggZnJlc2hJbWFnZSApO1xuXG4gICAgICAgICAgZGlzcGxheS5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ3JlbGF0aXZlJzsgLy8gZG9uJ3QgaGF2ZSBpdCBiZSBhYnNvbHV0ZWx5IHBvc2l0aW9uZWRcbiAgICAgICAgICBkaXNwbGF5LmRvbUVsZW1lbnQuc3R5bGUuYm9yZGVyID0gJzFweCBzb2xpZCBibGFjayc7IC8vIGJvcmRlclxuXG4gICAgICAgICAgLy8gdGhlIGFjdHVhbCBjb21wYXJpc29uIHN0YXRlbWVudFxuICAgICAgICAgIFBpeGVsQ29tcGFyaXNvblRlc3RVdGlscy5zbmFwc2hvdEVxdWFscyggYXNzZXJ0LCBmcmVzaFNuYXBzaG90LCByZWZlcmVuY2VTbmFwc2hvdCwgdGhyZXNob2xkLCBuYW1lLCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxuICAgICAgICAgIC8vIHRlbGwgcXVuaXQgdGhhdCB3ZSdyZSBkb25lPyAodGhhdCdzIHdoYXQgdGhlIG9sZCB2ZXJzaW9uIGRpZCwgc2VlbXMgcG90ZW50aWFsbHkgd3JvbmcgYnV0IHdvcmtpbmc/KVxuICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGxvYWQgaW1hZ2VzIHRvIGNvbXBhcmVcbiAgICAgICAgbGV0IGxvYWRlZENvdW50ID0gMDtcbiAgICAgICAgY29uc3QgcmVmZXJlbmNlSW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnaW1nJyApO1xuICAgICAgICBjb25zdCBmcmVzaEltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2ltZycgKTtcbiAgICAgICAgcmVmZXJlbmNlSW1hZ2Uub25sb2FkID0gZnJlc2hJbWFnZS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgaWYgKCArK2xvYWRlZENvdW50ID09PSAyICkge1xuICAgICAgICAgICAgY29tcGFyZVNuYXBzaG90cygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmVmZXJlbmNlSW1hZ2Uub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICBhc3NlcnQub2soIGZhbHNlLCBgJHtuYW1lfSByZWZlcmVuY2UgaW1hZ2UgZmFpbGVkIHRvIGxvYWRgICk7XG4gICAgICAgICAgZG9uZSgpO1xuICAgICAgICB9O1xuICAgICAgICBmcmVzaEltYWdlLm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgYXNzZXJ0Lm9rKCBmYWxzZSwgYCR7bmFtZX0gZnJlc2ggaW1hZ2UgZmFpbGVkIHRvIGxvYWRgICk7XG4gICAgICAgICAgZG9uZSgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJlZmVyZW5jZUltYWdlLnNyYyA9IGRhdGFVUkw7XG5cbiAgICAgICAgZGlzcGxheS5mb3JlaWduT2JqZWN0UmFzdGVyaXphdGlvbiggdXJsID0+IHtcbiAgICAgICAgICBpZiAoICF1cmwgKSB7XG4gICAgICAgICAgICBhc3NlcnQub2soIGZhbHNlLCBgJHtuYW1lfSBmYWlsZWQgdG8gcmFzdGVyaXplIHRoZSBkaXNwbGF5YCApO1xuICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmcmVzaEltYWdlLnNyYyA9IHVybDtcbiAgICAgICAgfSApO1xuICAgICAgfVxuXG4gICAgICBzZXR1cCggc2NlbmUsIGRpc3BsYXksIGxvYWRJbWFnZXMgKTtcblxuICAgICAgaWYgKCAhaXNBc3luYyApIHtcbiAgICAgICAgbG9hZEltYWdlcygpO1xuICAgICAgfVxuICAgIH0gKTtcbiAgfSxcblxuICAvKipcbiAgICogTGlrZSBwaXhlbFRlc3QsIGJ1dCBmb3IgbXVsdGlwbGUgbGlzdGVuZXJzICh7c3RyaW5nW119KS4gRG9uJ3Qgb3ZlcnJpZGUgdGhlIHJlbmRlcmVyIG9uIHRoZSBzY2VuZS5cbiAgICovXG4gIG11bHRpcGxlUmVuZGVyZXJUZXN0OiAoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHNldHVwOiAoIHNjZW5lOiBOb2RlLCBkaXNwbGF5OiBEaXNwbGF5LCBhc3luY0NhbGxiYWNrOiAoKSA9PiB2b2lkICkgPT4gdm9pZCxcbiAgICBkYXRhVVJMOiBzdHJpbmcsXG4gICAgdGhyZXNob2xkOiBudW1iZXIsXG4gICAgcmVuZGVyZXJzOiBSZW5kZXJlclR5cGVbXSxcbiAgICBpc0FzeW5jPzogYm9vbGVhblxuICApOiB2b2lkID0+IHtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCByZW5kZXJlcnMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAoICgpID0+IHtcbiAgICAgICAgY29uc3QgcmVuZGVyZXIgPSByZW5kZXJlcnNbIGkgXTtcblxuICAgICAgICBQaXhlbENvbXBhcmlzb25UZXN0VXRpbHMucGl4ZWxUZXN0KCBgJHtuYW1lfSAoJHtyZW5kZXJlcn0pYCwgKCBzY2VuZSwgZGlzcGxheSwgYXN5bmNDYWxsYmFjayApID0+IHtcbiAgICAgICAgICBzY2VuZS5yZW5kZXJlciA9IHJlbmRlcmVyO1xuICAgICAgICAgIHNldHVwKCBzY2VuZSwgZGlzcGxheSwgYXN5bmNDYWxsYmFjayApO1xuICAgICAgICB9LCBkYXRhVVJMLCB0aHJlc2hvbGQsICEhaXNBc3luYyApO1xuICAgICAgfSApKCk7XG4gICAgfVxuICB9LFxuXG4gIENPTE9SUzogW1xuICAgIG5ldyBDb2xvciggNjIsIDE3MSwgMyApLFxuICAgIG5ldyBDb2xvciggMjMsIDE4MCwgNzcgKSxcbiAgICBuZXcgQ29sb3IoIDI0LCAxODMsIDEzOCApLFxuICAgIG5ldyBDb2xvciggMjMsIDE3OCwgMTk0ICksXG4gICAgbmV3IENvbG9yKCAyMCwgMTYzLCAyMzggKSxcbiAgICBuZXcgQ29sb3IoIDcxLCAxMzYsIDI1NSApLFxuICAgIG5ldyBDb2xvciggMTcxLCAxMDEsIDI1NSApLFxuICAgIG5ldyBDb2xvciggMjI4LCA3MiwgMjM1ICksXG4gICAgbmV3IENvbG9yKCAyNTIsIDY2LCAxODYgKSxcbiAgICBuZXcgQ29sb3IoIDI1MiwgODIsIDEyNyApXG4gIF0sXG5cbiAgVEVTVEVEX1JFTkRFUkVSUzogVEVTVEVEX1JFTkRFUkVSUyxcbiAgTEFZT1VUX1RFU1RFRF9SRU5ERVJFUlM6IFsgJ3N2ZycgXSBhcyBSZW5kZXJlclR5cGVbXSxcbiAgTk9OX0RPTV9XRUJHTF9URVNURURfUkVOREVSRVJTOiBURVNURURfUkVOREVSRVJTLmZpbHRlciggcmVuZGVyZXIgPT4gcmVuZGVyZXIgIT09ICdkb20nICYmIHJlbmRlcmVyICE9PSAnd2ViZ2wnIClcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFBpeGVsQ29tcGFyaXNvblRlc3RVdGlsczsiXSwibmFtZXMiOlsicGxhdGZvcm0iLCJDb2xvciIsIkRpc3BsYXkiLCJOb2RlIiwiVEVTVEVEX1JFTkRFUkVSUyIsIlBpeGVsQ29tcGFyaXNvblRlc3RVdGlscyIsIkRFRkFVTFRfVEhSRVNIT0xEIiwic25hcHNob3RGcm9tSW1hZ2UiLCJpbWFnZSIsImNhbnZhcyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsIndpZHRoIiwiaGVpZ2h0IiwiY29udGV4dCIsImdldENvbnRleHQiLCJkcmF3SW1hZ2UiLCJnZXRJbWFnZURhdGEiLCJzbmFwc2hvdFRvQ2FudmFzIiwic25hcHNob3QiLCJwdXRJbWFnZURhdGEiLCIkIiwiY3NzIiwicGxhdGZvcm1TdXBwb3J0c1BpeGVsQ29tcGFyaXNvblRlc3RzIiwic3VwcG9ydGVkIiwiZmlyZWZveCIsImNocm9taXVtIiwid2luZG93IiwiY29uc29sZSIsImxvZyIsInNuYXBzaG90RXF1YWxzIiwiYXNzZXJ0IiwiYSIsImIiLCJ0aHJlc2hvbGQiLCJtZXNzYWdlIiwiZXh0cmFEb20iLCJpc0VxdWFsIiwibGFyZ2VzdERpZmZlcmVuY2UiLCJ0b3RhbERpZmZlcmVuY2UiLCJjb2xvckRpZmZEYXRhIiwiY3JlYXRlSW1hZ2VEYXRhIiwiYWxwaGFEaWZmRGF0YSIsImkiLCJkYXRhIiwibGVuZ3RoIiwiZGlmZiIsIk1hdGgiLCJhYnMiLCJhbHBoYUluZGV4IiwiYWxwaGFNdWx0aXBsaWVkRGlmZiIsIm1heCIsImF2ZXJhZ2VEaWZmZXJlbmNlIiwiZGlzcGxheSIsIm5vdGUiLCJ0ZXh0IiwiYXBwZW5kIiwiZGlmZmVyZW5jZURpdiIsIm9rIiwicGl4ZWxUZXN0IiwibmFtZSIsInNldHVwIiwiZGF0YVVSTCIsImlzQXN5bmMiLCJRVW5pdCIsInRlc3QiLCJkb25lIiwiYXN5bmMiLCJzY2VuZSIsInByZXNlcnZlRHJhd2luZ0J1ZmZlciIsImxvYWRJbWFnZXMiLCJjb21wYXJlU25hcHNob3RzIiwicmVmZXJlbmNlU25hcHNob3QiLCJyZWZlcmVuY2VJbWFnZSIsImZyZXNoU25hcHNob3QiLCJmcmVzaEltYWdlIiwiZG9tRWxlbWVudCIsInN0eWxlIiwicG9zaXRpb24iLCJib3JkZXIiLCJsb2FkZWRDb3VudCIsIm9ubG9hZCIsIm9uZXJyb3IiLCJzcmMiLCJmb3JlaWduT2JqZWN0UmFzdGVyaXphdGlvbiIsInVybCIsIm11bHRpcGxlUmVuZGVyZXJUZXN0IiwicmVuZGVyZXJzIiwicmVuZGVyZXIiLCJhc3luY0NhbGxiYWNrIiwiQ09MT1JTIiwiTEFZT1VUX1RFU1RFRF9SRU5ERVJFUlMiLCJOT05fRE9NX1dFQkdMX1RFU1RFRF9SRU5ERVJFUlMiLCJmaWx0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7Ozs7O0NBTUMsR0FFRCxPQUFPQSxjQUFjLG9DQUFvQztBQUN6RCxTQUFTQyxLQUFLLEVBQUVDLE9BQU8sRUFBRUMsSUFBSSxRQUFzQixnQkFBZ0I7QUFFbkUsTUFBTUMsbUJBQW1DO0lBQUU7SUFBVTtJQUFPO0lBQU87Q0FBUztBQUU1RSxNQUFNQywyQkFBMkI7SUFFL0JDLG1CQUFtQjtJQUVuQjs7R0FFQyxHQUNEQyxtQkFBbUIsQ0FBRUM7UUFFbkIsTUFBTUMsU0FBU0MsU0FBU0MsYUFBYSxDQUFFO1FBQ3ZDRixPQUFPRyxLQUFLLEdBQUdKLE1BQU1JLEtBQUs7UUFDMUJILE9BQU9JLE1BQU0sR0FBR0wsTUFBTUssTUFBTTtRQUM1QixNQUFNQyxVQUFVTCxPQUFPTSxVQUFVLENBQUU7UUFDbkNELFFBQVFFLFNBQVMsQ0FBRVIsT0FBTyxHQUFHLEdBQUdBLE1BQU1JLEtBQUssRUFBRUosTUFBTUssTUFBTTtRQUN6RCxPQUFPQyxRQUFRRyxZQUFZLENBQUUsR0FBRyxHQUFHVCxNQUFNSSxLQUFLLEVBQUVKLE1BQU1LLE1BQU07SUFDOUQ7SUFFQTs7R0FFQyxHQUNESyxrQkFBa0IsQ0FBRUM7UUFDbEIsTUFBTVYsU0FBU0MsU0FBU0MsYUFBYSxDQUFFO1FBQ3ZDRixPQUFPRyxLQUFLLEdBQUdPLFNBQVNQLEtBQUs7UUFDN0JILE9BQU9JLE1BQU0sR0FBR00sU0FBU04sTUFBTTtRQUMvQixNQUFNQyxVQUFVTCxPQUFPTSxVQUFVLENBQUU7UUFDbkNELFFBQVFNLFlBQVksQ0FBRUQsVUFBVSxHQUFHO1FBQ25DRSxFQUFHWixRQUFTYSxHQUFHLENBQUUsVUFBVTtRQUMzQixPQUFPYjtJQUNUO0lBRUE7Ozs7O0dBS0MsR0FDRGMsc0NBQXNDO1FBQ3BDLE1BQU1DLFlBQVl4QixTQUFTeUIsT0FBTyxJQUFJekIsU0FBUzBCLFFBQVE7UUFDdkQsSUFBSyxDQUFDRixXQUFZO1lBQ2hCRyxPQUFPQyxPQUFPLElBQUlELE9BQU9DLE9BQU8sQ0FBQ0MsR0FBRyxJQUFJRixPQUFPQyxPQUFPLENBQUNDLEdBQUcsQ0FBRTtRQUM5RDtRQUVBLE9BQU9MO0lBQ1Q7SUFFQTs7R0FFQyxHQUNETSxnQkFBZ0IsQ0FBRUMsUUFBZ0JDLEdBQWNDLEdBQWNDLFdBQW1CQyxTQUFpQkM7UUFFaEcsSUFBSUMsVUFBVUwsRUFBRXBCLEtBQUssS0FBS3FCLEVBQUVyQixLQUFLLElBQUlvQixFQUFFbkIsTUFBTSxLQUFLb0IsRUFBRXBCLE1BQU07UUFDMUQsSUFBSXlCLG9CQUFvQjtRQUN4QixJQUFJQyxrQkFBa0I7UUFDdEIsTUFBTUMsZ0JBQWdCOUIsU0FBU0MsYUFBYSxDQUFFLFVBQVdJLFVBQVUsQ0FBRSxNQUFRMEIsZUFBZSxDQUFFVCxFQUFFcEIsS0FBSyxFQUFFb0IsRUFBRW5CLE1BQU07UUFDL0csTUFBTTZCLGdCQUFnQmhDLFNBQVNDLGFBQWEsQ0FBRSxVQUFXSSxVQUFVLENBQUUsTUFBUTBCLGVBQWUsQ0FBRVQsRUFBRXBCLEtBQUssRUFBRW9CLEVBQUVuQixNQUFNO1FBQy9HLElBQUt3QixTQUFVO1lBQ2IsSUFBTSxJQUFJTSxJQUFJLEdBQUdBLElBQUlYLEVBQUVZLElBQUksQ0FBQ0MsTUFBTSxFQUFFRixJQUFNO2dCQUN4QyxNQUFNRyxPQUFPQyxLQUFLQyxHQUFHLENBQUVoQixFQUFFWSxJQUFJLENBQUVELEVBQUcsR0FBR1YsRUFBRVcsSUFBSSxDQUFFRCxFQUFHO2dCQUNoRCxJQUFLQSxJQUFJLE1BQU0sR0FBSTtvQkFDakJILGNBQWNJLElBQUksQ0FBRUQsRUFBRyxHQUFHO29CQUMxQkQsY0FBY0UsSUFBSSxDQUFFRCxFQUFHLEdBQUc7b0JBQzFCRCxjQUFjRSxJQUFJLENBQUVELElBQUksRUFBRyxHQUFHRyxNQUFNLE1BQU07b0JBQzFDSixjQUFjRSxJQUFJLENBQUVELElBQUksRUFBRyxHQUFHRyxNQUFNLFFBQVE7b0JBQzVDSixjQUFjRSxJQUFJLENBQUVELElBQUksRUFBRyxHQUFHRyxNQUFNLE9BQU87Z0JBQzdDLE9BQ0s7b0JBQ0hOLGNBQWNJLElBQUksQ0FBRUQsRUFBRyxHQUFHRztnQkFDNUI7Z0JBQ0EsTUFBTUcsYUFBZU4sSUFBTUEsSUFBSSxJQUFNO2dCQUNyQyxtRUFBbUU7Z0JBQ25FLE1BQU1PLHNCQUFzQixBQUFFUCxJQUFJLE1BQU0sSUFBTUcsT0FBT0EsT0FBU2QsQ0FBQUEsRUFBRVksSUFBSSxDQUFFSyxXQUFZLEdBQUcsR0FBRSxJQUFRaEIsQ0FBQUEsRUFBRVcsSUFBSSxDQUFFSyxXQUFZLEdBQUcsR0FBRTtnQkFFeEhWLG1CQUFtQlc7Z0JBQ25CLDJDQUEyQztnQkFDM0MscUVBQXFFO2dCQUNyRVosb0JBQW9CUyxLQUFLSSxHQUFHLENBQUViLG1CQUFtQlk7WUFDakQsbUJBQW1CO1lBQ25CLFNBQVM7WUFDVCxJQUFJO1lBQ047UUFDRjtRQUNBLE1BQU1FLG9CQUFvQmIsa0JBQW9CLENBQUEsSUFBSVAsRUFBRXBCLEtBQUssR0FBR29CLEVBQUVuQixNQUFNLEFBQUQ7UUFDbkUsSUFBS3VDLG9CQUFvQmxCLFdBQVk7WUFDbkMsTUFBTW1CLFVBQVVoQyxFQUFHO1lBQ25CLFNBQVM7WUFDVCxNQUFNaUMsT0FBTzVDLFNBQVNDLGFBQWEsQ0FBRTtZQUNyQ1UsRUFBR2lDLE1BQU9DLElBQUksQ0FBRXBCO1lBQ2hCa0IsUUFBUUcsTUFBTSxDQUFFRjtZQUNoQixNQUFNRyxnQkFBZ0IvQyxTQUFTQyxhQUFhLENBQUU7WUFDOUNVLEVBQUdvQyxlQUFnQkYsSUFBSSxDQUFFLENBQUMseURBQXlELEVBQUVqQixrQkFBa0IsV0FBVyxFQUFFYyxtQkFBbUI7WUFDdklDLFFBQVFHLE1BQU0sQ0FBRUM7WUFFaEJKLFFBQVFHLE1BQU0sQ0FBRW5ELHlCQUF5QmEsZ0JBQWdCLENBQUVjO1lBQzNEcUIsUUFBUUcsTUFBTSxDQUFFbkQseUJBQXlCYSxnQkFBZ0IsQ0FBRWU7WUFDM0RvQixRQUFRRyxNQUFNLENBQUVuRCx5QkFBeUJhLGdCQUFnQixDQUFFc0I7WUFDM0RhLFFBQVFHLE1BQU0sQ0FBRW5ELHlCQUF5QmEsZ0JBQWdCLENBQUV3QjtZQUUzRCxJQUFLTixVQUFXO2dCQUNkaUIsUUFBUUcsTUFBTSxDQUFFcEI7WUFDbEI7WUFFQSxtQkFBbUI7WUFDbkJpQixRQUFRRyxNQUFNLENBQUU5QyxTQUFTQyxhQUFhLENBQUU7WUFFeEMwQixVQUFVO1FBQ1o7UUFDQU4sT0FBTzJCLEVBQUUsQ0FBRXJCLFNBQVNGO1FBQ3BCLE9BQU9FO0lBQ1Q7SUFFQTs7Ozs7Ozs7OztHQVVDLEdBQ0RzQixXQUFXLENBQ1RDLE1BQ0FDLE9BQ0FDLFNBQ0E1QixXQUNBNkI7UUFHQUMsTUFBTUMsSUFBSSxDQUFFTCxNQUFNN0IsQ0FBQUE7WUFDaEIsTUFBTW1DLE9BQU9uQyxPQUFPb0MsS0FBSztZQUN6QiwyQkFBMkI7WUFDM0IsTUFBTUMsUUFBUSxJQUFJakU7WUFDbEIsTUFBTWtELFVBQVUsSUFBSW5ELFFBQVNrRSxPQUFPO2dCQUNsQ0MsdUJBQXVCO1lBQ3pCO1lBRUEsU0FBU0M7Z0JBQ1AsMkNBQTJDO2dCQUMzQyxTQUFTQztvQkFDUCxNQUFNQyxvQkFBb0JuRSx5QkFBeUJFLGlCQUFpQixDQUFFa0U7b0JBQ3RFLE1BQU1DLGdCQUFnQnJFLHlCQUF5QkUsaUJBQWlCLENBQUVvRTtvQkFFbEV0QixRQUFRdUIsVUFBVSxDQUFDQyxLQUFLLENBQUNDLFFBQVEsR0FBRyxZQUFZLHlDQUF5QztvQkFDekZ6QixRQUFRdUIsVUFBVSxDQUFDQyxLQUFLLENBQUNFLE1BQU0sR0FBRyxtQkFBbUIsU0FBUztvQkFFOUQsa0NBQWtDO29CQUNsQzFFLHlCQUF5QnlCLGNBQWMsQ0FBRUMsUUFBUTJDLGVBQWVGLG1CQUFtQnRDLFdBQVcwQixNQUFNUCxRQUFRdUIsVUFBVTtvQkFFdEgsc0dBQXNHO29CQUN0R1Y7Z0JBQ0Y7Z0JBRUEseUJBQXlCO2dCQUN6QixJQUFJYyxjQUFjO2dCQUNsQixNQUFNUCxpQkFBaUIvRCxTQUFTQyxhQUFhLENBQUU7Z0JBQy9DLE1BQU1nRSxhQUFhakUsU0FBU0MsYUFBYSxDQUFFO2dCQUMzQzhELGVBQWVRLE1BQU0sR0FBR04sV0FBV00sTUFBTSxHQUFHO29CQUMxQyxJQUFLLEVBQUVELGdCQUFnQixHQUFJO3dCQUN6QlQ7b0JBQ0Y7Z0JBQ0Y7Z0JBQ0FFLGVBQWVTLE9BQU8sR0FBRztvQkFDdkJuRCxPQUFPMkIsRUFBRSxDQUFFLE9BQU8sR0FBR0UsS0FBSywrQkFBK0IsQ0FBQztvQkFDMURNO2dCQUNGO2dCQUNBUyxXQUFXTyxPQUFPLEdBQUc7b0JBQ25CbkQsT0FBTzJCLEVBQUUsQ0FBRSxPQUFPLEdBQUdFLEtBQUssMkJBQTJCLENBQUM7b0JBQ3RETTtnQkFDRjtnQkFFQU8sZUFBZVUsR0FBRyxHQUFHckI7Z0JBRXJCVCxRQUFRK0IsMEJBQTBCLENBQUVDLENBQUFBO29CQUNsQyxJQUFLLENBQUNBLEtBQU07d0JBQ1Z0RCxPQUFPMkIsRUFBRSxDQUFFLE9BQU8sR0FBR0UsS0FBSyxnQ0FBZ0MsQ0FBQzt3QkFDM0RNO3dCQUNBO29CQUNGO29CQUNBUyxXQUFXUSxHQUFHLEdBQUdFO2dCQUNuQjtZQUNGO1lBRUF4QixNQUFPTyxPQUFPZixTQUFTaUI7WUFFdkIsSUFBSyxDQUFDUCxTQUFVO2dCQUNkTztZQUNGO1FBQ0Y7SUFDRjtJQUVBOztHQUVDLEdBQ0RnQixzQkFBc0IsQ0FDcEIxQixNQUNBQyxPQUNBQyxTQUNBNUIsV0FDQXFELFdBQ0F4QjtRQUVBLElBQU0sSUFBSXBCLElBQUksR0FBR0EsSUFBSTRDLFVBQVUxQyxNQUFNLEVBQUVGLElBQU07WUFDekMsQ0FBQTtnQkFDQSxNQUFNNkMsV0FBV0QsU0FBUyxDQUFFNUMsRUFBRztnQkFFL0J0Qyx5QkFBeUJzRCxTQUFTLENBQUUsR0FBR0MsS0FBSyxFQUFFLEVBQUU0QixTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUVwQixPQUFPZixTQUFTb0M7b0JBQzdFckIsTUFBTW9CLFFBQVEsR0FBR0E7b0JBQ2pCM0IsTUFBT08sT0FBT2YsU0FBU29DO2dCQUN6QixHQUFHM0IsU0FBUzVCLFdBQVcsQ0FBQyxDQUFDNkI7WUFDM0IsQ0FBQTtRQUNGO0lBQ0Y7SUFFQTJCLFFBQVE7UUFDTixJQUFJekYsTUFBTyxJQUFJLEtBQUs7UUFDcEIsSUFBSUEsTUFBTyxJQUFJLEtBQUs7UUFDcEIsSUFBSUEsTUFBTyxJQUFJLEtBQUs7UUFDcEIsSUFBSUEsTUFBTyxJQUFJLEtBQUs7UUFDcEIsSUFBSUEsTUFBTyxJQUFJLEtBQUs7UUFDcEIsSUFBSUEsTUFBTyxJQUFJLEtBQUs7UUFDcEIsSUFBSUEsTUFBTyxLQUFLLEtBQUs7UUFDckIsSUFBSUEsTUFBTyxLQUFLLElBQUk7UUFDcEIsSUFBSUEsTUFBTyxLQUFLLElBQUk7UUFDcEIsSUFBSUEsTUFBTyxLQUFLLElBQUk7S0FDckI7SUFFREcsa0JBQWtCQTtJQUNsQnVGLHlCQUF5QjtRQUFFO0tBQU87SUFDbENDLGdDQUFnQ3hGLGlCQUFpQnlGLE1BQU0sQ0FBRUwsQ0FBQUEsV0FBWUEsYUFBYSxTQUFTQSxhQUFhO0FBQzFHO0FBRUEsZUFBZW5GLHlCQUF5QiJ9