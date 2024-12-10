// Copyright 2013-2024, University of Colorado Boulder
/**
 * General utility functions for Scenery
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Bounds2 from '../../../dot/js/Bounds2.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Transform3 from '../../../dot/js/Transform3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import platform from '../../../phet-core/js/platform.js';
import { Features, scenery } from '../imports.js';
// convenience function
function p(x, y) {
    return new Vector2(x, y);
}
// TODO: remove flag and tests after we're done https://github.com/phetsims/scenery/issues/1581
const debugChromeBoundsScanning = false;
// detect properly prefixed transform and transformOrigin properties
const transformProperty = Features.transform;
const transformOriginProperty = Features.transformOrigin || 'transformOrigin'; // fallback, so we don't try to set an empty string property later
// Scenery applications that do not use WebGL may trigger a ~ 0.5 second pause shortly after launch on some platforms.
// Webgl is enabled by default but may be shut off for applications that know they will not want to use it
// see https://github.com/phetsims/scenery/issues/621
let webglEnabled = true;
let _extensionlessWebGLSupport; // lazily computed
const Utils = {
    /*---------------------------------------------------------------------------*
   * Transformation Utilities (TODO: separate file) https://github.com/phetsims/scenery/issues/1581
   *---------------------------------------------------------------------------*/ /**
   * Prepares a DOM element for use with applyPreparedTransform(). Applies some CSS styles that are required, but
   * that we don't want to set while animating.
   */ prepareForTransform (element) {
        // @ts-expect-error
        element.style[transformOriginProperty] = 'top left';
    },
    /**
   * Applies the CSS transform of the matrix to the element, with optional forcing of acceleration.
   * NOTE: prepareForTransform should be called at least once on the element before this method is used.
   */ applyPreparedTransform (matrix, element) {
        // NOTE: not applying translateZ, see http://stackoverflow.com/questions/10014461/why-does-enabling-hardware-acceleration-in-css3-slow-down-performance
        // @ts-expect-error
        element.style[transformProperty] = matrix.getCSSTransform();
    },
    /**
   * Applies a CSS transform value string to a DOM element.
   * NOTE: prepareForTransform should be called at least once on the element before this method is used.
   */ setTransform (transformString, element) {
        // @ts-expect-error
        element.style[transformProperty] = transformString;
    },
    /**
   * Removes a CSS transform from a DOM element.
   */ unsetTransform (element) {
        // @ts-expect-error
        element.style[transformProperty] = '';
    },
    /**
   * Ensures that window.requestAnimationFrame and window.cancelAnimationFrame use a native implementation if possible,
   * otherwise using a simple setTimeout internally. See https://github.com/phetsims/scenery/issues/426
   */ polyfillRequestAnimationFrame () {
        if (!window.requestAnimationFrame || !window.cancelAnimationFrame) {
            // Fallback implementation if no prefixed version is available
            if (!Features.requestAnimationFrame || !Features.cancelAnimationFrame) {
                window.requestAnimationFrame = (callback)=>{
                    const timeAtStart = Date.now();
                    // NOTE: We don't want to rely on a common timer, so we're using the built-in form on purpose.
                    return window.setTimeout(()=>{
                        callback(Date.now() - timeAtStart);
                    }, 16);
                };
                window.cancelAnimationFrame = clearTimeout;
            } else {
                // @ts-expect-error
                window.requestAnimationFrame = window[Features.requestAnimationFrame];
                // @ts-expect-error
                window.cancelAnimationFrame = window[Features.cancelAnimationFrame];
            }
        }
    },
    /**
   * Returns the relative size of the context's backing store compared to the actual Canvas. For example, if it's 2,
   * the backing store has 2x2 the amount of pixels (4 times total).
   *
   * @returns The backing store pixel ratio.
   */ backingStorePixelRatio (context) {
        // @ts-expect-error
        return context.webkitBackingStorePixelRatio || // @ts-expect-error
        context.mozBackingStorePixelRatio || // @ts-expect-error
        context.msBackingStorePixelRatio || // @ts-expect-error
        context.oBackingStorePixelRatio || // @ts-expect-error
        context.backingStorePixelRatio || 1;
    },
    /**
   * Returns the scaling factor that needs to be applied for handling a HiDPI Canvas
   * See see http://developer.apple.com/library/safari/#documentation/AudioVideo/Conceptual/HTML-canvas-guide/SettingUptheCanvas/SettingUptheCanvas.html#//apple_ref/doc/uid/TP40010542-CH2-SW5
   * And it's updated based on http://www.html5rocks.com/en/tutorials/canvas/hidpi/
   */ backingScale (context) {
        if ('devicePixelRatio' in window) {
            const backingStoreRatio = Utils.backingStorePixelRatio(context);
            return window.devicePixelRatio / backingStoreRatio;
        }
        return 1;
    },
    /**
   * Whether the native Canvas HTML5 API supports the 'filter' attribute (similar to the CSS/SVG filter attribute).
   */ supportsNativeCanvasFilter () {
        return !!Features.canvasFilter;
    },
    /**
   * Whether we can handle arbitrary filters in Canvas by manipulating the ImageData returned. If we have a backing
   * store pixel ratio that is non-1, we'll be blurring out things during that operation, which would be unacceptable.
   */ supportsImageDataCanvasFilter () {
        // @ts-expect-error TODO: scenery and typing https://github.com/phetsims/scenery/issues/1581
        return Utils.backingStorePixelRatio(scenery.scratchContext) === 1;
    },
    /*---------------------------------------------------------------------------*
   * Text bounds utilities (TODO: separate file) https://github.com/phetsims/scenery/issues/1581
   *---------------------------------------------------------------------------*/ /**
   * Given a data snapshot and transform, calculate range on how large / small the bounds can be. It's
   * very conservative, with an effective 1px extra range to allow for differences in anti-aliasing
   * for performance concerns, this does not support skews / rotations / anything but translation and scaling
   */ scanBounds (imageData, resolution, transform) {
        // entry will be true if any pixel with the given x or y value is non-rgba(0,0,0,0)
        const dirtyX = _.map(_.range(resolution), ()=>false);
        const dirtyY = _.map(_.range(resolution), ()=>false);
        for(let x = 0; x < resolution; x++){
            for(let y = 0; y < resolution; y++){
                const offset = 4 * (y * resolution + x);
                if (imageData.data[offset] !== 0 || imageData.data[offset + 1] !== 0 || imageData.data[offset + 2] !== 0 || imageData.data[offset + 3] !== 0) {
                    dirtyX[x] = true;
                    dirtyY[y] = true;
                }
            }
        }
        const minX = _.indexOf(dirtyX, true);
        const maxX = _.lastIndexOf(dirtyX, true);
        const minY = _.indexOf(dirtyY, true);
        const maxY = _.lastIndexOf(dirtyY, true);
        // based on pixel boundaries. for minBounds, the inner edge of the dirty pixel. for maxBounds, the outer edge of the adjacent non-dirty pixel
        // results in a spread of 2 for the identity transform (or any translated form)
        const extraSpread = resolution / 16; // is Chrome antialiasing really like this? dear god... TODO!!! https://github.com/phetsims/scenery/issues/1581
        return {
            minBounds: new Bounds2(minX < 1 || minX >= resolution - 1 ? Number.POSITIVE_INFINITY : transform.inversePosition2(p(minX + 1 + extraSpread, 0)).x, minY < 1 || minY >= resolution - 1 ? Number.POSITIVE_INFINITY : transform.inversePosition2(p(0, minY + 1 + extraSpread)).y, maxX < 1 || maxX >= resolution - 1 ? Number.NEGATIVE_INFINITY : transform.inversePosition2(p(maxX - extraSpread, 0)).x, maxY < 1 || maxY >= resolution - 1 ? Number.NEGATIVE_INFINITY : transform.inversePosition2(p(0, maxY - extraSpread)).y),
            maxBounds: new Bounds2(minX < 1 || minX >= resolution - 1 ? Number.NEGATIVE_INFINITY : transform.inversePosition2(p(minX - 1 - extraSpread, 0)).x, minY < 1 || minY >= resolution - 1 ? Number.NEGATIVE_INFINITY : transform.inversePosition2(p(0, minY - 1 - extraSpread)).y, maxX < 1 || maxX >= resolution - 1 ? Number.POSITIVE_INFINITY : transform.inversePosition2(p(maxX + 2 + extraSpread, 0)).x, maxY < 1 || maxY >= resolution - 1 ? Number.POSITIVE_INFINITY : transform.inversePosition2(p(0, maxY + 2 + extraSpread)).y)
        };
    },
    /**
   * Measures accurate bounds of a function that draws things to a Canvas.
   */ canvasAccurateBounds (renderToContext, options) {
        // how close to the actual bounds do we need to be?
        const precision = options && options.precision ? options.precision : 0.001;
        // 512x512 default square resolution
        const resolution = options && options.resolution ? options.resolution : 128;
        // at 1/16x default, we want to be able to get the bounds accurately for something as large as 16x our initial resolution
        // divisible by 2 so hopefully we avoid more quirks from Canvas rendering engines
        const initialScale = options && options.initialScale ? options.initialScale : 1 / 16;
        let minBounds = Bounds2.NOTHING;
        let maxBounds = Bounds2.EVERYTHING;
        const canvas = document.createElement('canvas');
        canvas.width = resolution;
        canvas.height = resolution;
        const context = canvas.getContext('2d');
        if (debugChromeBoundsScanning) {
            $(window).ready(()=>{
                const header = document.createElement('h2');
                $(header).text('Bounds Scan');
                $('#display').append(header);
            });
        }
        // TODO: Don't use Transform3 unless it is necessary https://github.com/phetsims/scenery/issues/1581
        function scan(transform) {
            // save/restore, in case the render tries to do any funny stuff like clipping, etc.
            context.save();
            transform.matrix.canvasSetTransform(context);
            renderToContext(context);
            context.restore();
            const data = context.getImageData(0, 0, resolution, resolution);
            const minMaxBounds = Utils.scanBounds(data, resolution, transform);
            function snapshotToCanvas(snapshot) {
                const canvas = document.createElement('canvas');
                canvas.width = resolution;
                canvas.height = resolution;
                const context = canvas.getContext('2d');
                context.putImageData(snapshot, 0, 0);
                $(canvas).css('border', '1px solid black');
                $(window).ready(()=>{
                    //$( '#display' ).append( $( document.createElement( 'div' ) ).text( 'Bounds: ' +  ) );
                    $('#display').append(canvas);
                });
            }
            // TODO: remove after debug https://github.com/phetsims/scenery/issues/1581
            if (debugChromeBoundsScanning) {
                snapshotToCanvas(data);
            }
            context.clearRect(0, 0, resolution, resolution);
            return minMaxBounds;
        }
        // attempts to map the bounds specified to the entire testing canvas (minus a fine border), so we can nail down the location quickly
        function idealTransform(bounds) {
            // so that the bounds-edge doesn't land squarely on the boundary
            const borderSize = 2;
            const scaleX = (resolution - borderSize * 2) / (bounds.maxX - bounds.minX);
            const scaleY = (resolution - borderSize * 2) / (bounds.maxY - bounds.minY);
            const translationX = -scaleX * bounds.minX + borderSize;
            const translationY = -scaleY * bounds.minY + borderSize;
            return new Transform3(Matrix3.translation(translationX, translationY).timesMatrix(Matrix3.scaling(scaleX, scaleY)));
        }
        const initialTransform = new Transform3();
        // make sure to initially center our object, so we don't miss the bounds
        initialTransform.append(Matrix3.translation(resolution / 2, resolution / 2));
        initialTransform.append(Matrix3.scaling(initialScale));
        const coarseBounds = scan(initialTransform);
        minBounds = minBounds.union(coarseBounds.minBounds);
        maxBounds = maxBounds.intersection(coarseBounds.maxBounds);
        let tempMin;
        let tempMax;
        let refinedBounds;
        // minX
        tempMin = maxBounds.minY;
        tempMax = maxBounds.maxY;
        while(isFinite(minBounds.minX) && isFinite(maxBounds.minX) && Math.abs(minBounds.minX - maxBounds.minX) > precision){
            // use maximum bounds except for the x direction, so we don't miss things that we are looking for
            refinedBounds = scan(idealTransform(new Bounds2(maxBounds.minX, tempMin, minBounds.minX, tempMax)));
            if (minBounds.minX <= refinedBounds.minBounds.minX && maxBounds.minX >= refinedBounds.maxBounds.minX) {
                // sanity check - break out of an infinite loop!
                if (debugChromeBoundsScanning) {
                    console.log('warning, exiting infinite loop!');
                    console.log(`transformed "min" minX: ${idealTransform(new Bounds2(maxBounds.minX, maxBounds.minY, minBounds.minX, maxBounds.maxY)).transformPosition2(p(minBounds.minX, 0))}`);
                    console.log(`transformed "max" minX: ${idealTransform(new Bounds2(maxBounds.minX, maxBounds.minY, minBounds.minX, maxBounds.maxY)).transformPosition2(p(maxBounds.minX, 0))}`);
                }
                break;
            }
            minBounds = minBounds.withMinX(Math.min(minBounds.minX, refinedBounds.minBounds.minX));
            maxBounds = maxBounds.withMinX(Math.max(maxBounds.minX, refinedBounds.maxBounds.minX));
            tempMin = Math.max(tempMin, refinedBounds.maxBounds.minY);
            tempMax = Math.min(tempMax, refinedBounds.maxBounds.maxY);
        }
        // maxX
        tempMin = maxBounds.minY;
        tempMax = maxBounds.maxY;
        while(isFinite(minBounds.maxX) && isFinite(maxBounds.maxX) && Math.abs(minBounds.maxX - maxBounds.maxX) > precision){
            // use maximum bounds except for the x direction, so we don't miss things that we are looking for
            refinedBounds = scan(idealTransform(new Bounds2(minBounds.maxX, tempMin, maxBounds.maxX, tempMax)));
            if (minBounds.maxX >= refinedBounds.minBounds.maxX && maxBounds.maxX <= refinedBounds.maxBounds.maxX) {
                // sanity check - break out of an infinite loop!
                if (debugChromeBoundsScanning) {
                    console.log('warning, exiting infinite loop!');
                }
                break;
            }
            minBounds = minBounds.withMaxX(Math.max(minBounds.maxX, refinedBounds.minBounds.maxX));
            maxBounds = maxBounds.withMaxX(Math.min(maxBounds.maxX, refinedBounds.maxBounds.maxX));
            tempMin = Math.max(tempMin, refinedBounds.maxBounds.minY);
            tempMax = Math.min(tempMax, refinedBounds.maxBounds.maxY);
        }
        // minY
        tempMin = maxBounds.minX;
        tempMax = maxBounds.maxX;
        while(isFinite(minBounds.minY) && isFinite(maxBounds.minY) && Math.abs(minBounds.minY - maxBounds.minY) > precision){
            // use maximum bounds except for the y direction, so we don't miss things that we are looking for
            refinedBounds = scan(idealTransform(new Bounds2(tempMin, maxBounds.minY, tempMax, minBounds.minY)));
            if (minBounds.minY <= refinedBounds.minBounds.minY && maxBounds.minY >= refinedBounds.maxBounds.minY) {
                // sanity check - break out of an infinite loop!
                if (debugChromeBoundsScanning) {
                    console.log('warning, exiting infinite loop!');
                }
                break;
            }
            minBounds = minBounds.withMinY(Math.min(minBounds.minY, refinedBounds.minBounds.minY));
            maxBounds = maxBounds.withMinY(Math.max(maxBounds.minY, refinedBounds.maxBounds.minY));
            tempMin = Math.max(tempMin, refinedBounds.maxBounds.minX);
            tempMax = Math.min(tempMax, refinedBounds.maxBounds.maxX);
        }
        // maxY
        tempMin = maxBounds.minX;
        tempMax = maxBounds.maxX;
        while(isFinite(minBounds.maxY) && isFinite(maxBounds.maxY) && Math.abs(minBounds.maxY - maxBounds.maxY) > precision){
            // use maximum bounds except for the y direction, so we don't miss things that we are looking for
            refinedBounds = scan(idealTransform(new Bounds2(tempMin, minBounds.maxY, tempMax, maxBounds.maxY)));
            if (minBounds.maxY >= refinedBounds.minBounds.maxY && maxBounds.maxY <= refinedBounds.maxBounds.maxY) {
                // sanity check - break out of an infinite loop!
                if (debugChromeBoundsScanning) {
                    console.log('warning, exiting infinite loop!');
                }
                break;
            }
            minBounds = minBounds.withMaxY(Math.max(minBounds.maxY, refinedBounds.minBounds.maxY));
            maxBounds = maxBounds.withMaxY(Math.min(maxBounds.maxY, refinedBounds.maxBounds.maxY));
            tempMin = Math.max(tempMin, refinedBounds.maxBounds.minX);
            tempMax = Math.min(tempMax, refinedBounds.maxBounds.maxX);
        }
        if (debugChromeBoundsScanning) {
            console.log(`minBounds: ${minBounds}`);
            console.log(`maxBounds: ${maxBounds}`);
        }
        // @ts-expect-error
        const result = new Bounds2(// Do finite checks so we don't return NaN
        isFinite(minBounds.minX) && isFinite(maxBounds.minX) ? (minBounds.minX + maxBounds.minX) / 2 : Number.POSITIVE_INFINITY, isFinite(minBounds.minY) && isFinite(maxBounds.minY) ? (minBounds.minY + maxBounds.minY) / 2 : Number.POSITIVE_INFINITY, isFinite(minBounds.maxX) && isFinite(maxBounds.maxX) ? (minBounds.maxX + maxBounds.maxX) / 2 : Number.NEGATIVE_INFINITY, isFinite(minBounds.maxY) && isFinite(maxBounds.maxY) ? (minBounds.maxY + maxBounds.maxY) / 2 : Number.NEGATIVE_INFINITY);
        // extra data about our bounds
        result.minBounds = minBounds;
        result.maxBounds = maxBounds;
        result.isConsistent = maxBounds.containsBounds(minBounds);
        result.precision = Math.max(Math.abs(minBounds.minX - maxBounds.minX), Math.abs(minBounds.minY - maxBounds.minY), Math.abs(minBounds.maxX - maxBounds.maxX), Math.abs(minBounds.maxY - maxBounds.maxY));
        // return the average
        return result;
    },
    /*---------------------------------------------------------------------------*
   * WebGL utilities (TODO: separate file) https://github.com/phetsims/scenery/issues/1581
   *---------------------------------------------------------------------------*/ /**
   * Finds the smallest power of 2 that is at least as large as n.
   *
   * @returns The smallest power of 2 that is greater than or equal n
   */ toPowerOf2 (n) {
        let result = 1;
        while(result < n){
            result *= 2;
        }
        return result;
    },
    /**
   * Creates and compiles a GLSL Shader object in WebGL.
   */ createShader (gl, source, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log('GLSL compile error:');
            console.log(gl.getShaderInfoLog(shader));
            console.log(source);
        // Normally it would be best to throw an exception here, but a context loss could cause the shader parameter check
        // to fail, and we must handle context loss gracefully between any adjacent pair of gl calls.
        // Therefore, we simply report the errors to the console.  See #279
        }
        return shader;
    },
    applyWebGLContextDefaults (gl) {
        // What color gets set when we call gl.clear()
        gl.clearColor(0, 0, 0, 0);
        // Blending similar to http://localhost/phet/git/webgl-blendfunctions/blendfuncseparate.html
        gl.enable(gl.BLEND);
        // NOTE: We switched back to a fully premultiplied setup, so we have the corresponding blend function.
        // For normal colors (and custom WebGLNode handling), it is necessary to use premultiplied values (multiplying the
        // RGB values by the alpha value for gl_FragColor). For textured triangles, it is assumed that the texture is
        // already premultiplied, so the built-in shader does not do the extra premultiplication.
        // See https://github.com/phetsims/energy-skate-park/issues/39, https://github.com/phetsims/scenery/issues/397
        // and https://stackoverflow.com/questions/39341564/webgl-how-to-correctly-blend-alpha-channel-png
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    },
    /**
   * Set whether webgl should be enabled, see docs for webglEnabled
   */ setWebGLEnabled (_webglEnabled) {
        webglEnabled = _webglEnabled;
    },
    /**
   * Check to see whether webgl is supported, using the same strategy as mrdoob and pixi.js
   *
   * @param [extensions] - A list of WebGL extensions that need to be supported
   */ checkWebGLSupport (extensions) {
        // The webgl check can be shut off, please see docs at webglEnabled declaration site
        if (!webglEnabled) {
            return false;
        }
        const canvas = document.createElement('canvas');
        const args = {
            failIfMajorPerformanceCaveat: true
        };
        try {
            // @ts-expect-error
            const gl = !!window.WebGLRenderingContext && (canvas.getContext('webgl', args) || canvas.getContext('experimental-webgl', args));
            if (!gl) {
                return false;
            }
            if (extensions) {
                for(let i = 0; i < extensions.length; i++){
                    if (gl.getExtension(extensions[i]) === null) {
                        return false;
                    }
                }
            }
            return true;
        } catch (e) {
            return false;
        }
    },
    /**
   * Check to see whether IE11 has proper clearStencil support (required for three.js to work well).
   */ checkIE11StencilSupport () {
        const canvas = document.createElement('canvas');
        try {
            // @ts-expect-error
            const gl = !!window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
            if (!gl) {
                return false;
            }
            // Failure for https://github.com/mrdoob/three.js/issues/3600 / https://github.com/phetsims/molecule-shapes/issues/133
            gl.clearStencil(0);
            return gl.getError() === 0;
        } catch (e) {
            return false;
        }
    },
    /**
   * Whether WebGL (with decent performance) is supported by the platform
   */ get isWebGLSupported () {
        if (_extensionlessWebGLSupport === undefined) {
            _extensionlessWebGLSupport = Utils.checkWebGLSupport();
        }
        return _extensionlessWebGLSupport;
    },
    /**
   * Triggers a loss of a WebGL context, with a delayed restoration.
   *
   * NOTE: Only use this for debugging. Should not be called normally.
   */ loseContext (gl) {
        const extension = gl.getExtension('WEBGL_lose_context');
        if (extension) {
            extension.loseContext();
            // NOTE: We don't want to rely on a common timer, so we're using the built-in form on purpose.
            setTimeout(()=>{
                extension.restoreContext();
            }, 1000);
        }
    },
    /**
   * Creates a string useful for working around https://github.com/phetsims/collision-lab/issues/177.
   */ safariEmbeddingMarkWorkaround (str) {
        if (platform.safari) {
            // NOTE: I don't believe it's likely/possible a valid UTF-8 string will contain these code points adjacently,
            // due to the property that you can start reading UTF-8 from any byte. So we're safe to split it and break it
            // into UTF-16 code units, since we're not mucking with surrogate pairs.
            const utf16CodeUnits = str.split('');
            let result = '';
            // NOTE: We're only inserting zero-width spaces between embedding marks, since prior to this our insertion between
            // certain code points was causing issues with Safari (https://github.com/phetsims/website-meteor/issues/656)
            let lastIsEmbeddingMark = false;
            for(let i = 0; i < utf16CodeUnits.length; i++){
                const next = utf16CodeUnits[i];
                const nextIsEmbeddingMark = next === '\u202a' || next === '\u202b' || next === '\u202c';
                // Add in zero-width spaces for Safari, so it doesn't have adjacent embedding marks ever (which seems to prevent
                // things).
                if (lastIsEmbeddingMark && nextIsEmbeddingMark) {
                    result += '\u200B';
                }
                result += next;
                lastIsEmbeddingMark = nextIsEmbeddingMark;
            }
            return result;
        } else {
            return str;
        }
    }
};
scenery.register('Utils', Utils);
export default Utils;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9VdGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBHZW5lcmFsIHV0aWxpdHkgZnVuY3Rpb25zIGZvciBTY2VuZXJ5XG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcbmltcG9ydCBUcmFuc2Zvcm0zIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9UcmFuc2Zvcm0zLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCBwbGF0Zm9ybSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvcGxhdGZvcm0uanMnO1xuaW1wb3J0IHsgRmVhdHVyZXMsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuLy8gY29udmVuaWVuY2UgZnVuY3Rpb25cbmZ1bmN0aW9uIHAoIHg6IG51bWJlciwgeTogbnVtYmVyICk6IFZlY3RvcjIge1xuICByZXR1cm4gbmV3IFZlY3RvcjIoIHgsIHkgKTtcbn1cblxuLy8gVE9ETzogcmVtb3ZlIGZsYWcgYW5kIHRlc3RzIGFmdGVyIHdlJ3JlIGRvbmUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbmNvbnN0IGRlYnVnQ2hyb21lQm91bmRzU2Nhbm5pbmcgPSBmYWxzZTtcblxuLy8gZGV0ZWN0IHByb3Blcmx5IHByZWZpeGVkIHRyYW5zZm9ybSBhbmQgdHJhbnNmb3JtT3JpZ2luIHByb3BlcnRpZXNcbmNvbnN0IHRyYW5zZm9ybVByb3BlcnR5ID0gRmVhdHVyZXMudHJhbnNmb3JtO1xuY29uc3QgdHJhbnNmb3JtT3JpZ2luUHJvcGVydHkgPSBGZWF0dXJlcy50cmFuc2Zvcm1PcmlnaW4gfHwgJ3RyYW5zZm9ybU9yaWdpbic7IC8vIGZhbGxiYWNrLCBzbyB3ZSBkb24ndCB0cnkgdG8gc2V0IGFuIGVtcHR5IHN0cmluZyBwcm9wZXJ0eSBsYXRlclxuXG4vLyBTY2VuZXJ5IGFwcGxpY2F0aW9ucyB0aGF0IGRvIG5vdCB1c2UgV2ViR0wgbWF5IHRyaWdnZXIgYSB+IDAuNSBzZWNvbmQgcGF1c2Ugc2hvcnRseSBhZnRlciBsYXVuY2ggb24gc29tZSBwbGF0Zm9ybXMuXG4vLyBXZWJnbCBpcyBlbmFibGVkIGJ5IGRlZmF1bHQgYnV0IG1heSBiZSBzaHV0IG9mZiBmb3IgYXBwbGljYXRpb25zIHRoYXQga25vdyB0aGV5IHdpbGwgbm90IHdhbnQgdG8gdXNlIGl0XG4vLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzYyMVxubGV0IHdlYmdsRW5hYmxlZCA9IHRydWU7XG5cbmxldCBfZXh0ZW5zaW9ubGVzc1dlYkdMU3VwcG9ydDogYm9vbGVhbiB8IHVuZGVmaW5lZDsgLy8gbGF6aWx5IGNvbXB1dGVkXG5cbmNvbnN0IFV0aWxzID0ge1xuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcbiAgICogVHJhbnNmb3JtYXRpb24gVXRpbGl0aWVzIChUT0RPOiBzZXBhcmF0ZSBmaWxlKSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLyoqXG4gICAqIFByZXBhcmVzIGEgRE9NIGVsZW1lbnQgZm9yIHVzZSB3aXRoIGFwcGx5UHJlcGFyZWRUcmFuc2Zvcm0oKS4gQXBwbGllcyBzb21lIENTUyBzdHlsZXMgdGhhdCBhcmUgcmVxdWlyZWQsIGJ1dFxuICAgKiB0aGF0IHdlIGRvbid0IHdhbnQgdG8gc2V0IHdoaWxlIGFuaW1hdGluZy5cbiAgICovXG4gIHByZXBhcmVGb3JUcmFuc2Zvcm0oIGVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgU1ZHRWxlbWVudCApOiB2b2lkIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgZWxlbWVudC5zdHlsZVsgdHJhbnNmb3JtT3JpZ2luUHJvcGVydHkgXSA9ICd0b3AgbGVmdCc7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgdGhlIENTUyB0cmFuc2Zvcm0gb2YgdGhlIG1hdHJpeCB0byB0aGUgZWxlbWVudCwgd2l0aCBvcHRpb25hbCBmb3JjaW5nIG9mIGFjY2VsZXJhdGlvbi5cbiAgICogTk9URTogcHJlcGFyZUZvclRyYW5zZm9ybSBzaG91bGQgYmUgY2FsbGVkIGF0IGxlYXN0IG9uY2Ugb24gdGhlIGVsZW1lbnQgYmVmb3JlIHRoaXMgbWV0aG9kIGlzIHVzZWQuXG4gICAqL1xuICBhcHBseVByZXBhcmVkVHJhbnNmb3JtKCBtYXRyaXg6IE1hdHJpeDMsIGVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgU1ZHRWxlbWVudCApOiB2b2lkIHtcbiAgICAvLyBOT1RFOiBub3QgYXBwbHlpbmcgdHJhbnNsYXRlWiwgc2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTAwMTQ0NjEvd2h5LWRvZXMtZW5hYmxpbmctaGFyZHdhcmUtYWNjZWxlcmF0aW9uLWluLWNzczMtc2xvdy1kb3duLXBlcmZvcm1hbmNlXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgIGVsZW1lbnQuc3R5bGVbIHRyYW5zZm9ybVByb3BlcnR5IF0gPSBtYXRyaXguZ2V0Q1NTVHJhbnNmb3JtKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgYSBDU1MgdHJhbnNmb3JtIHZhbHVlIHN0cmluZyB0byBhIERPTSBlbGVtZW50LlxuICAgKiBOT1RFOiBwcmVwYXJlRm9yVHJhbnNmb3JtIHNob3VsZCBiZSBjYWxsZWQgYXQgbGVhc3Qgb25jZSBvbiB0aGUgZWxlbWVudCBiZWZvcmUgdGhpcyBtZXRob2QgaXMgdXNlZC5cbiAgICovXG4gIHNldFRyYW5zZm9ybSggdHJhbnNmb3JtU3RyaW5nOiBzdHJpbmcsIGVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgU1ZHRWxlbWVudCApOiB2b2lkIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgZWxlbWVudC5zdHlsZVsgdHJhbnNmb3JtUHJvcGVydHkgXSA9IHRyYW5zZm9ybVN0cmluZztcbiAgfSxcblxuICAvKipcbiAgICogUmVtb3ZlcyBhIENTUyB0cmFuc2Zvcm0gZnJvbSBhIERPTSBlbGVtZW50LlxuICAgKi9cbiAgdW5zZXRUcmFuc2Zvcm0oIGVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgU1ZHRWxlbWVudCApOiB2b2lkIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgZWxlbWVudC5zdHlsZVsgdHJhbnNmb3JtUHJvcGVydHkgXSA9ICcnO1xuICB9LFxuXG4gIC8qKlxuICAgKiBFbnN1cmVzIHRoYXQgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSBhbmQgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lIHVzZSBhIG5hdGl2ZSBpbXBsZW1lbnRhdGlvbiBpZiBwb3NzaWJsZSxcbiAgICogb3RoZXJ3aXNlIHVzaW5nIGEgc2ltcGxlIHNldFRpbWVvdXQgaW50ZXJuYWxseS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy80MjZcbiAgICovXG4gIHBvbHlmaWxsUmVxdWVzdEFuaW1hdGlvbkZyYW1lKCk6IHZvaWQge1xuICAgIGlmICggIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgIXdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSApIHtcbiAgICAgIC8vIEZhbGxiYWNrIGltcGxlbWVudGF0aW9uIGlmIG5vIHByZWZpeGVkIHZlcnNpb24gaXMgYXZhaWxhYmxlXG4gICAgICBpZiAoICFGZWF0dXJlcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgIUZlYXR1cmVzLmNhbmNlbEFuaW1hdGlvbkZyYW1lICkge1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gY2FsbGJhY2sgPT4ge1xuICAgICAgICAgIGNvbnN0IHRpbWVBdFN0YXJ0ID0gRGF0ZS5ub3coKTtcblxuICAgICAgICAgIC8vIE5PVEU6IFdlIGRvbid0IHdhbnQgdG8gcmVseSBvbiBhIGNvbW1vbiB0aW1lciwgc28gd2UncmUgdXNpbmcgdGhlIGJ1aWx0LWluIGZvcm0gb24gcHVycG9zZS5cbiAgICAgICAgICByZXR1cm4gd2luZG93LnNldFRpbWVvdXQoICgpID0+IHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L2JhZC1zaW0tdGV4dFxuICAgICAgICAgICAgY2FsbGJhY2soIERhdGUubm93KCkgLSB0aW1lQXRTdGFydCApO1xuICAgICAgICAgIH0sIDE2ICk7XG4gICAgICAgIH07XG4gICAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGNsZWFyVGltZW91dDtcbiAgICAgIH1cbiAgICAgIC8vIEZpbGwgaW4gdGhlIG5vbi1wcmVmaXhlZCBuYW1lcyB3aXRoIHRoZSBwcmVmaXhlZCB2ZXJzaW9uc1xuICAgICAgZWxzZSB7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvd1sgRmVhdHVyZXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lIF07XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93WyBGZWF0dXJlcy5jYW5jZWxBbmltYXRpb25GcmFtZSBdO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcmVsYXRpdmUgc2l6ZSBvZiB0aGUgY29udGV4dCdzIGJhY2tpbmcgc3RvcmUgY29tcGFyZWQgdG8gdGhlIGFjdHVhbCBDYW52YXMuIEZvciBleGFtcGxlLCBpZiBpdCdzIDIsXG4gICAqIHRoZSBiYWNraW5nIHN0b3JlIGhhcyAyeDIgdGhlIGFtb3VudCBvZiBwaXhlbHMgKDQgdGltZXMgdG90YWwpLlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgYmFja2luZyBzdG9yZSBwaXhlbCByYXRpby5cbiAgICovXG4gIGJhY2tpbmdTdG9yZVBpeGVsUmF0aW8oIGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB8IFdlYkdMUmVuZGVyaW5nQ29udGV4dCApOiBudW1iZXIge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICByZXR1cm4gY29udGV4dC53ZWJraXRCYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8XG4gICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgICAgICAgY29udGV4dC5tb3pCYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8XG4gICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgICAgICAgY29udGV4dC5tc0JhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcbiAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgICAgICBjb250ZXh0Lm9CYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8XG4gICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgICAgICAgY29udGV4dC5iYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8IDE7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHNjYWxpbmcgZmFjdG9yIHRoYXQgbmVlZHMgdG8gYmUgYXBwbGllZCBmb3IgaGFuZGxpbmcgYSBIaURQSSBDYW52YXNcbiAgICogU2VlIHNlZSBodHRwOi8vZGV2ZWxvcGVyLmFwcGxlLmNvbS9saWJyYXJ5L3NhZmFyaS8jZG9jdW1lbnRhdGlvbi9BdWRpb1ZpZGVvL0NvbmNlcHR1YWwvSFRNTC1jYW52YXMtZ3VpZGUvU2V0dGluZ1VwdGhlQ2FudmFzL1NldHRpbmdVcHRoZUNhbnZhcy5odG1sIy8vYXBwbGVfcmVmL2RvYy91aWQvVFA0MDAxMDU0Mi1DSDItU1c1XG4gICAqIEFuZCBpdCdzIHVwZGF0ZWQgYmFzZWQgb24gaHR0cDovL3d3dy5odG1sNXJvY2tzLmNvbS9lbi90dXRvcmlhbHMvY2FudmFzL2hpZHBpL1xuICAgKi9cbiAgYmFja2luZ1NjYWxlKCBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgfCBXZWJHTFJlbmRlcmluZ0NvbnRleHQgKTogbnVtYmVyIHtcbiAgICBpZiAoICdkZXZpY2VQaXhlbFJhdGlvJyBpbiB3aW5kb3cgKSB7XG4gICAgICBjb25zdCBiYWNraW5nU3RvcmVSYXRpbyA9IFV0aWxzLmJhY2tpbmdTdG9yZVBpeGVsUmF0aW8oIGNvbnRleHQgKTtcblxuICAgICAgcmV0dXJuIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIC8gYmFja2luZ1N0b3JlUmF0aW87XG4gICAgfVxuICAgIHJldHVybiAxO1xuICB9LFxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBuYXRpdmUgQ2FudmFzIEhUTUw1IEFQSSBzdXBwb3J0cyB0aGUgJ2ZpbHRlcicgYXR0cmlidXRlIChzaW1pbGFyIHRvIHRoZSBDU1MvU1ZHIGZpbHRlciBhdHRyaWJ1dGUpLlxuICAgKi9cbiAgc3VwcG9ydHNOYXRpdmVDYW52YXNGaWx0ZXIoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhRmVhdHVyZXMuY2FudmFzRmlsdGVyO1xuICB9LFxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHdlIGNhbiBoYW5kbGUgYXJiaXRyYXJ5IGZpbHRlcnMgaW4gQ2FudmFzIGJ5IG1hbmlwdWxhdGluZyB0aGUgSW1hZ2VEYXRhIHJldHVybmVkLiBJZiB3ZSBoYXZlIGEgYmFja2luZ1xuICAgKiBzdG9yZSBwaXhlbCByYXRpbyB0aGF0IGlzIG5vbi0xLCB3ZSdsbCBiZSBibHVycmluZyBvdXQgdGhpbmdzIGR1cmluZyB0aGF0IG9wZXJhdGlvbiwgd2hpY2ggd291bGQgYmUgdW5hY2NlcHRhYmxlLlxuICAgKi9cbiAgc3VwcG9ydHNJbWFnZURhdGFDYW52YXNGaWx0ZXIoKTogYm9vbGVhbiB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUT0RPOiBzY2VuZXJ5IGFuZCB0eXBpbmcgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICByZXR1cm4gVXRpbHMuYmFja2luZ1N0b3JlUGl4ZWxSYXRpbyggc2NlbmVyeS5zY3JhdGNoQ29udGV4dCApID09PSAxO1xuICB9LFxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICAgKiBUZXh0IGJvdW5kcyB1dGlsaXRpZXMgKFRPRE86IHNlcGFyYXRlIGZpbGUpIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogR2l2ZW4gYSBkYXRhIHNuYXBzaG90IGFuZCB0cmFuc2Zvcm0sIGNhbGN1bGF0ZSByYW5nZSBvbiBob3cgbGFyZ2UgLyBzbWFsbCB0aGUgYm91bmRzIGNhbiBiZS4gSXQnc1xuICAgKiB2ZXJ5IGNvbnNlcnZhdGl2ZSwgd2l0aCBhbiBlZmZlY3RpdmUgMXB4IGV4dHJhIHJhbmdlIHRvIGFsbG93IGZvciBkaWZmZXJlbmNlcyBpbiBhbnRpLWFsaWFzaW5nXG4gICAqIGZvciBwZXJmb3JtYW5jZSBjb25jZXJucywgdGhpcyBkb2VzIG5vdCBzdXBwb3J0IHNrZXdzIC8gcm90YXRpb25zIC8gYW55dGhpbmcgYnV0IHRyYW5zbGF0aW9uIGFuZCBzY2FsaW5nXG4gICAqL1xuICBzY2FuQm91bmRzKCBpbWFnZURhdGE6IEltYWdlRGF0YSwgcmVzb2x1dGlvbjogbnVtYmVyLCB0cmFuc2Zvcm06IFRyYW5zZm9ybTMgKTogeyBtaW5Cb3VuZHM6IEJvdW5kczI7IG1heEJvdW5kczogQm91bmRzMiB9IHtcblxuICAgIC8vIGVudHJ5IHdpbGwgYmUgdHJ1ZSBpZiBhbnkgcGl4ZWwgd2l0aCB0aGUgZ2l2ZW4geCBvciB5IHZhbHVlIGlzIG5vbi1yZ2JhKDAsMCwwLDApXG4gICAgY29uc3QgZGlydHlYID0gXy5tYXAoIF8ucmFuZ2UoIHJlc29sdXRpb24gKSwgKCkgPT4gZmFsc2UgKTtcbiAgICBjb25zdCBkaXJ0eVkgPSBfLm1hcCggXy5yYW5nZSggcmVzb2x1dGlvbiApLCAoKSA9PiBmYWxzZSApO1xuXG4gICAgZm9yICggbGV0IHggPSAwOyB4IDwgcmVzb2x1dGlvbjsgeCsrICkge1xuICAgICAgZm9yICggbGV0IHkgPSAwOyB5IDwgcmVzb2x1dGlvbjsgeSsrICkge1xuICAgICAgICBjb25zdCBvZmZzZXQgPSA0ICogKCB5ICogcmVzb2x1dGlvbiArIHggKTtcbiAgICAgICAgaWYgKCBpbWFnZURhdGEuZGF0YVsgb2Zmc2V0IF0gIT09IDAgfHwgaW1hZ2VEYXRhLmRhdGFbIG9mZnNldCArIDEgXSAhPT0gMCB8fCBpbWFnZURhdGEuZGF0YVsgb2Zmc2V0ICsgMiBdICE9PSAwIHx8IGltYWdlRGF0YS5kYXRhWyBvZmZzZXQgKyAzIF0gIT09IDAgKSB7XG4gICAgICAgICAgZGlydHlYWyB4IF0gPSB0cnVlO1xuICAgICAgICAgIGRpcnR5WVsgeSBdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IG1pblggPSBfLmluZGV4T2YoIGRpcnR5WCwgdHJ1ZSApO1xuICAgIGNvbnN0IG1heFggPSBfLmxhc3RJbmRleE9mKCBkaXJ0eVgsIHRydWUgKTtcbiAgICBjb25zdCBtaW5ZID0gXy5pbmRleE9mKCBkaXJ0eVksIHRydWUgKTtcbiAgICBjb25zdCBtYXhZID0gXy5sYXN0SW5kZXhPZiggZGlydHlZLCB0cnVlICk7XG5cbiAgICAvLyBiYXNlZCBvbiBwaXhlbCBib3VuZGFyaWVzLiBmb3IgbWluQm91bmRzLCB0aGUgaW5uZXIgZWRnZSBvZiB0aGUgZGlydHkgcGl4ZWwuIGZvciBtYXhCb3VuZHMsIHRoZSBvdXRlciBlZGdlIG9mIHRoZSBhZGphY2VudCBub24tZGlydHkgcGl4ZWxcbiAgICAvLyByZXN1bHRzIGluIGEgc3ByZWFkIG9mIDIgZm9yIHRoZSBpZGVudGl0eSB0cmFuc2Zvcm0gKG9yIGFueSB0cmFuc2xhdGVkIGZvcm0pXG4gICAgY29uc3QgZXh0cmFTcHJlYWQgPSByZXNvbHV0aW9uIC8gMTY7IC8vIGlzIENocm9tZSBhbnRpYWxpYXNpbmcgcmVhbGx5IGxpa2UgdGhpcz8gZGVhciBnb2QuLi4gVE9ETyEhISBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIHJldHVybiB7XG4gICAgICBtaW5Cb3VuZHM6IG5ldyBCb3VuZHMyKFxuICAgICAgICAoIG1pblggPCAxIHx8IG1pblggPj0gcmVzb2x1dGlvbiAtIDEgKSA/IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSA6IHRyYW5zZm9ybS5pbnZlcnNlUG9zaXRpb24yKCBwKCBtaW5YICsgMSArIGV4dHJhU3ByZWFkLCAwICkgKS54LFxuICAgICAgICAoIG1pblkgPCAxIHx8IG1pblkgPj0gcmVzb2x1dGlvbiAtIDEgKSA/IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSA6IHRyYW5zZm9ybS5pbnZlcnNlUG9zaXRpb24yKCBwKCAwLCBtaW5ZICsgMSArIGV4dHJhU3ByZWFkICkgKS55LFxuICAgICAgICAoIG1heFggPCAxIHx8IG1heFggPj0gcmVzb2x1dGlvbiAtIDEgKSA/IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSA6IHRyYW5zZm9ybS5pbnZlcnNlUG9zaXRpb24yKCBwKCBtYXhYIC0gZXh0cmFTcHJlYWQsIDAgKSApLngsXG4gICAgICAgICggbWF4WSA8IDEgfHwgbWF4WSA+PSByZXNvbHV0aW9uIC0gMSApID8gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZIDogdHJhbnNmb3JtLmludmVyc2VQb3NpdGlvbjIoIHAoIDAsIG1heFkgLSBleHRyYVNwcmVhZCApICkueVxuICAgICAgKSxcbiAgICAgIG1heEJvdW5kczogbmV3IEJvdW5kczIoXG4gICAgICAgICggbWluWCA8IDEgfHwgbWluWCA+PSByZXNvbHV0aW9uIC0gMSApID8gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZIDogdHJhbnNmb3JtLmludmVyc2VQb3NpdGlvbjIoIHAoIG1pblggLSAxIC0gZXh0cmFTcHJlYWQsIDAgKSApLngsXG4gICAgICAgICggbWluWSA8IDEgfHwgbWluWSA+PSByZXNvbHV0aW9uIC0gMSApID8gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZIDogdHJhbnNmb3JtLmludmVyc2VQb3NpdGlvbjIoIHAoIDAsIG1pblkgLSAxIC0gZXh0cmFTcHJlYWQgKSApLnksXG4gICAgICAgICggbWF4WCA8IDEgfHwgbWF4WCA+PSByZXNvbHV0aW9uIC0gMSApID8gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZIDogdHJhbnNmb3JtLmludmVyc2VQb3NpdGlvbjIoIHAoIG1heFggKyAyICsgZXh0cmFTcHJlYWQsIDAgKSApLngsXG4gICAgICAgICggbWF4WSA8IDEgfHwgbWF4WSA+PSByZXNvbHV0aW9uIC0gMSApID8gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZIDogdHJhbnNmb3JtLmludmVyc2VQb3NpdGlvbjIoIHAoIDAsIG1heFkgKyAyICsgZXh0cmFTcHJlYWQgKSApLnlcbiAgICAgIClcbiAgICB9O1xuICB9LFxuXG4gIC8qKlxuICAgKiBNZWFzdXJlcyBhY2N1cmF0ZSBib3VuZHMgb2YgYSBmdW5jdGlvbiB0aGF0IGRyYXdzIHRoaW5ncyB0byBhIENhbnZhcy5cbiAgICovXG4gIGNhbnZhc0FjY3VyYXRlQm91bmRzKCByZW5kZXJUb0NvbnRleHQ6ICggY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEICkgPT4gdm9pZCwgb3B0aW9ucz86IHsgcHJlY2lzaW9uPzogbnVtYmVyOyByZXNvbHV0aW9uPzogbnVtYmVyOyBpbml0aWFsU2NhbGU/OiBudW1iZXIgfSApOiBCb3VuZHMyICYgeyBtaW5Cb3VuZHM6IEJvdW5kczI7IG1heEJvdW5kczogQm91bmRzMjsgaXNDb25zaXN0ZW50OiBib29sZWFuOyBwcmVjaXNpb246IG51bWJlciB9IHtcbiAgICAvLyBob3cgY2xvc2UgdG8gdGhlIGFjdHVhbCBib3VuZHMgZG8gd2UgbmVlZCB0byBiZT9cbiAgICBjb25zdCBwcmVjaXNpb24gPSAoIG9wdGlvbnMgJiYgb3B0aW9ucy5wcmVjaXNpb24gKSA/IG9wdGlvbnMucHJlY2lzaW9uIDogMC4wMDE7XG5cbiAgICAvLyA1MTJ4NTEyIGRlZmF1bHQgc3F1YXJlIHJlc29sdXRpb25cbiAgICBjb25zdCByZXNvbHV0aW9uID0gKCBvcHRpb25zICYmIG9wdGlvbnMucmVzb2x1dGlvbiApID8gb3B0aW9ucy5yZXNvbHV0aW9uIDogMTI4O1xuXG4gICAgLy8gYXQgMS8xNnggZGVmYXVsdCwgd2Ugd2FudCB0byBiZSBhYmxlIHRvIGdldCB0aGUgYm91bmRzIGFjY3VyYXRlbHkgZm9yIHNvbWV0aGluZyBhcyBsYXJnZSBhcyAxNnggb3VyIGluaXRpYWwgcmVzb2x1dGlvblxuICAgIC8vIGRpdmlzaWJsZSBieSAyIHNvIGhvcGVmdWxseSB3ZSBhdm9pZCBtb3JlIHF1aXJrcyBmcm9tIENhbnZhcyByZW5kZXJpbmcgZW5naW5lc1xuICAgIGNvbnN0IGluaXRpYWxTY2FsZSA9ICggb3B0aW9ucyAmJiBvcHRpb25zLmluaXRpYWxTY2FsZSApID8gb3B0aW9ucy5pbml0aWFsU2NhbGUgOiAoIDEgLyAxNiApO1xuXG4gICAgbGV0IG1pbkJvdW5kcyA9IEJvdW5kczIuTk9USElORztcbiAgICBsZXQgbWF4Qm91bmRzID0gQm91bmRzMi5FVkVSWVRISU5HO1xuXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcbiAgICBjYW52YXMud2lkdGggPSByZXNvbHV0aW9uO1xuICAgIGNhbnZhcy5oZWlnaHQgPSByZXNvbHV0aW9uO1xuICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApITtcblxuICAgIGlmICggZGVidWdDaHJvbWVCb3VuZHNTY2FubmluZyApIHtcbiAgICAgICQoIHdpbmRvdyApLnJlYWR5KCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdoMicgKTtcbiAgICAgICAgJCggaGVhZGVyICkudGV4dCggJ0JvdW5kcyBTY2FuJyApO1xuICAgICAgICAkKCAnI2Rpc3BsYXknICkuYXBwZW5kKCBoZWFkZXIgKTtcbiAgICAgIH0gKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBEb24ndCB1c2UgVHJhbnNmb3JtMyB1bmxlc3MgaXQgaXMgbmVjZXNzYXJ5IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgZnVuY3Rpb24gc2NhbiggdHJhbnNmb3JtOiBUcmFuc2Zvcm0zICk6IHsgbWluQm91bmRzOiBCb3VuZHMyOyBtYXhCb3VuZHM6IEJvdW5kczIgfSB7XG4gICAgICAvLyBzYXZlL3Jlc3RvcmUsIGluIGNhc2UgdGhlIHJlbmRlciB0cmllcyB0byBkbyBhbnkgZnVubnkgc3R1ZmYgbGlrZSBjbGlwcGluZywgZXRjLlxuICAgICAgY29udGV4dC5zYXZlKCk7XG4gICAgICB0cmFuc2Zvcm0ubWF0cml4LmNhbnZhc1NldFRyYW5zZm9ybSggY29udGV4dCApO1xuICAgICAgcmVuZGVyVG9Db250ZXh0KCBjb250ZXh0ICk7XG4gICAgICBjb250ZXh0LnJlc3RvcmUoKTtcblxuICAgICAgY29uc3QgZGF0YSA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKCAwLCAwLCByZXNvbHV0aW9uLCByZXNvbHV0aW9uICk7XG4gICAgICBjb25zdCBtaW5NYXhCb3VuZHMgPSBVdGlscy5zY2FuQm91bmRzKCBkYXRhLCByZXNvbHV0aW9uLCB0cmFuc2Zvcm0gKTtcblxuICAgICAgZnVuY3Rpb24gc25hcHNob3RUb0NhbnZhcyggc25hcHNob3Q6IEltYWdlRGF0YSApOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcbiAgICAgICAgY2FudmFzLndpZHRoID0gcmVzb2x1dGlvbjtcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IHJlc29sdXRpb247XG4gICAgICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApITtcbiAgICAgICAgY29udGV4dC5wdXRJbWFnZURhdGEoIHNuYXBzaG90LCAwLCAwICk7XG4gICAgICAgICQoIGNhbnZhcyApLmNzcyggJ2JvcmRlcicsICcxcHggc29saWQgYmxhY2snICk7XG4gICAgICAgICQoIHdpbmRvdyApLnJlYWR5KCAoKSA9PiB7XG4gICAgICAgICAgLy8kKCAnI2Rpc3BsYXknICkuYXBwZW5kKCAkKCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApICkudGV4dCggJ0JvdW5kczogJyArICApICk7XG4gICAgICAgICAgJCggJyNkaXNwbGF5JyApLmFwcGVuZCggY2FudmFzICk7XG4gICAgICAgIH0gKTtcbiAgICAgIH1cblxuICAgICAgLy8gVE9ETzogcmVtb3ZlIGFmdGVyIGRlYnVnIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICBpZiAoIGRlYnVnQ2hyb21lQm91bmRzU2Nhbm5pbmcgKSB7XG4gICAgICAgIHNuYXBzaG90VG9DYW52YXMoIGRhdGEgKTtcbiAgICAgIH1cblxuICAgICAgY29udGV4dC5jbGVhclJlY3QoIDAsIDAsIHJlc29sdXRpb24sIHJlc29sdXRpb24gKTtcblxuICAgICAgcmV0dXJuIG1pbk1heEJvdW5kcztcbiAgICB9XG5cbiAgICAvLyBhdHRlbXB0cyB0byBtYXAgdGhlIGJvdW5kcyBzcGVjaWZpZWQgdG8gdGhlIGVudGlyZSB0ZXN0aW5nIGNhbnZhcyAobWludXMgYSBmaW5lIGJvcmRlciksIHNvIHdlIGNhbiBuYWlsIGRvd24gdGhlIGxvY2F0aW9uIHF1aWNrbHlcbiAgICBmdW5jdGlvbiBpZGVhbFRyYW5zZm9ybSggYm91bmRzOiBCb3VuZHMyICk6IFRyYW5zZm9ybTMge1xuICAgICAgLy8gc28gdGhhdCB0aGUgYm91bmRzLWVkZ2UgZG9lc24ndCBsYW5kIHNxdWFyZWx5IG9uIHRoZSBib3VuZGFyeVxuICAgICAgY29uc3QgYm9yZGVyU2l6ZSA9IDI7XG5cbiAgICAgIGNvbnN0IHNjYWxlWCA9ICggcmVzb2x1dGlvbiAtIGJvcmRlclNpemUgKiAyICkgLyAoIGJvdW5kcy5tYXhYIC0gYm91bmRzLm1pblggKTtcbiAgICAgIGNvbnN0IHNjYWxlWSA9ICggcmVzb2x1dGlvbiAtIGJvcmRlclNpemUgKiAyICkgLyAoIGJvdW5kcy5tYXhZIC0gYm91bmRzLm1pblkgKTtcbiAgICAgIGNvbnN0IHRyYW5zbGF0aW9uWCA9IC1zY2FsZVggKiBib3VuZHMubWluWCArIGJvcmRlclNpemU7XG4gICAgICBjb25zdCB0cmFuc2xhdGlvblkgPSAtc2NhbGVZICogYm91bmRzLm1pblkgKyBib3JkZXJTaXplO1xuXG4gICAgICByZXR1cm4gbmV3IFRyYW5zZm9ybTMoIE1hdHJpeDMudHJhbnNsYXRpb24oIHRyYW5zbGF0aW9uWCwgdHJhbnNsYXRpb25ZICkudGltZXNNYXRyaXgoIE1hdHJpeDMuc2NhbGluZyggc2NhbGVYLCBzY2FsZVkgKSApICk7XG4gICAgfVxuXG4gICAgY29uc3QgaW5pdGlhbFRyYW5zZm9ybSA9IG5ldyBUcmFuc2Zvcm0zKCk7XG4gICAgLy8gbWFrZSBzdXJlIHRvIGluaXRpYWxseSBjZW50ZXIgb3VyIG9iamVjdCwgc28gd2UgZG9uJ3QgbWlzcyB0aGUgYm91bmRzXG4gICAgaW5pdGlhbFRyYW5zZm9ybS5hcHBlbmQoIE1hdHJpeDMudHJhbnNsYXRpb24oIHJlc29sdXRpb24gLyAyLCByZXNvbHV0aW9uIC8gMiApICk7XG4gICAgaW5pdGlhbFRyYW5zZm9ybS5hcHBlbmQoIE1hdHJpeDMuc2NhbGluZyggaW5pdGlhbFNjYWxlICkgKTtcblxuICAgIGNvbnN0IGNvYXJzZUJvdW5kcyA9IHNjYW4oIGluaXRpYWxUcmFuc2Zvcm0gKTtcblxuICAgIG1pbkJvdW5kcyA9IG1pbkJvdW5kcy51bmlvbiggY29hcnNlQm91bmRzLm1pbkJvdW5kcyApO1xuICAgIG1heEJvdW5kcyA9IG1heEJvdW5kcy5pbnRlcnNlY3Rpb24oIGNvYXJzZUJvdW5kcy5tYXhCb3VuZHMgKTtcblxuICAgIGxldCB0ZW1wTWluO1xuICAgIGxldCB0ZW1wTWF4O1xuICAgIGxldCByZWZpbmVkQm91bmRzO1xuXG4gICAgLy8gbWluWFxuICAgIHRlbXBNaW4gPSBtYXhCb3VuZHMubWluWTtcbiAgICB0ZW1wTWF4ID0gbWF4Qm91bmRzLm1heFk7XG4gICAgd2hpbGUgKCBpc0Zpbml0ZSggbWluQm91bmRzLm1pblggKSAmJiBpc0Zpbml0ZSggbWF4Qm91bmRzLm1pblggKSAmJiBNYXRoLmFicyggbWluQm91bmRzLm1pblggLSBtYXhCb3VuZHMubWluWCApID4gcHJlY2lzaW9uICkge1xuICAgICAgLy8gdXNlIG1heGltdW0gYm91bmRzIGV4Y2VwdCBmb3IgdGhlIHggZGlyZWN0aW9uLCBzbyB3ZSBkb24ndCBtaXNzIHRoaW5ncyB0aGF0IHdlIGFyZSBsb29raW5nIGZvclxuICAgICAgcmVmaW5lZEJvdW5kcyA9IHNjYW4oIGlkZWFsVHJhbnNmb3JtKCBuZXcgQm91bmRzMiggbWF4Qm91bmRzLm1pblgsIHRlbXBNaW4sIG1pbkJvdW5kcy5taW5YLCB0ZW1wTWF4ICkgKSApO1xuXG4gICAgICBpZiAoIG1pbkJvdW5kcy5taW5YIDw9IHJlZmluZWRCb3VuZHMubWluQm91bmRzLm1pblggJiYgbWF4Qm91bmRzLm1pblggPj0gcmVmaW5lZEJvdW5kcy5tYXhCb3VuZHMubWluWCApIHtcbiAgICAgICAgLy8gc2FuaXR5IGNoZWNrIC0gYnJlYWsgb3V0IG9mIGFuIGluZmluaXRlIGxvb3AhXG4gICAgICAgIGlmICggZGVidWdDaHJvbWVCb3VuZHNTY2FubmluZyApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyggJ3dhcm5pbmcsIGV4aXRpbmcgaW5maW5pdGUgbG9vcCEnICk7XG4gICAgICAgICAgY29uc29sZS5sb2coIGB0cmFuc2Zvcm1lZCBcIm1pblwiIG1pblg6ICR7aWRlYWxUcmFuc2Zvcm0oIG5ldyBCb3VuZHMyKCBtYXhCb3VuZHMubWluWCwgbWF4Qm91bmRzLm1pblksIG1pbkJvdW5kcy5taW5YLCBtYXhCb3VuZHMubWF4WSApICkudHJhbnNmb3JtUG9zaXRpb24yKCBwKCBtaW5Cb3VuZHMubWluWCwgMCApICl9YCApO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCBgdHJhbnNmb3JtZWQgXCJtYXhcIiBtaW5YOiAke2lkZWFsVHJhbnNmb3JtKCBuZXcgQm91bmRzMiggbWF4Qm91bmRzLm1pblgsIG1heEJvdW5kcy5taW5ZLCBtaW5Cb3VuZHMubWluWCwgbWF4Qm91bmRzLm1heFkgKSApLnRyYW5zZm9ybVBvc2l0aW9uMiggcCggbWF4Qm91bmRzLm1pblgsIDAgKSApfWAgKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgbWluQm91bmRzID0gbWluQm91bmRzLndpdGhNaW5YKCBNYXRoLm1pbiggbWluQm91bmRzLm1pblgsIHJlZmluZWRCb3VuZHMubWluQm91bmRzLm1pblggKSApO1xuICAgICAgbWF4Qm91bmRzID0gbWF4Qm91bmRzLndpdGhNaW5YKCBNYXRoLm1heCggbWF4Qm91bmRzLm1pblgsIHJlZmluZWRCb3VuZHMubWF4Qm91bmRzLm1pblggKSApO1xuICAgICAgdGVtcE1pbiA9IE1hdGgubWF4KCB0ZW1wTWluLCByZWZpbmVkQm91bmRzLm1heEJvdW5kcy5taW5ZICk7XG4gICAgICB0ZW1wTWF4ID0gTWF0aC5taW4oIHRlbXBNYXgsIHJlZmluZWRCb3VuZHMubWF4Qm91bmRzLm1heFkgKTtcbiAgICB9XG5cbiAgICAvLyBtYXhYXG4gICAgdGVtcE1pbiA9IG1heEJvdW5kcy5taW5ZO1xuICAgIHRlbXBNYXggPSBtYXhCb3VuZHMubWF4WTtcbiAgICB3aGlsZSAoIGlzRmluaXRlKCBtaW5Cb3VuZHMubWF4WCApICYmIGlzRmluaXRlKCBtYXhCb3VuZHMubWF4WCApICYmIE1hdGguYWJzKCBtaW5Cb3VuZHMubWF4WCAtIG1heEJvdW5kcy5tYXhYICkgPiBwcmVjaXNpb24gKSB7XG4gICAgICAvLyB1c2UgbWF4aW11bSBib3VuZHMgZXhjZXB0IGZvciB0aGUgeCBkaXJlY3Rpb24sIHNvIHdlIGRvbid0IG1pc3MgdGhpbmdzIHRoYXQgd2UgYXJlIGxvb2tpbmcgZm9yXG4gICAgICByZWZpbmVkQm91bmRzID0gc2NhbiggaWRlYWxUcmFuc2Zvcm0oIG5ldyBCb3VuZHMyKCBtaW5Cb3VuZHMubWF4WCwgdGVtcE1pbiwgbWF4Qm91bmRzLm1heFgsIHRlbXBNYXggKSApICk7XG5cbiAgICAgIGlmICggbWluQm91bmRzLm1heFggPj0gcmVmaW5lZEJvdW5kcy5taW5Cb3VuZHMubWF4WCAmJiBtYXhCb3VuZHMubWF4WCA8PSByZWZpbmVkQm91bmRzLm1heEJvdW5kcy5tYXhYICkge1xuICAgICAgICAvLyBzYW5pdHkgY2hlY2sgLSBicmVhayBvdXQgb2YgYW4gaW5maW5pdGUgbG9vcCFcbiAgICAgICAgaWYgKCBkZWJ1Z0Nocm9tZUJvdW5kc1NjYW5uaW5nICkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCAnd2FybmluZywgZXhpdGluZyBpbmZpbml0ZSBsb29wIScgKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgbWluQm91bmRzID0gbWluQm91bmRzLndpdGhNYXhYKCBNYXRoLm1heCggbWluQm91bmRzLm1heFgsIHJlZmluZWRCb3VuZHMubWluQm91bmRzLm1heFggKSApO1xuICAgICAgbWF4Qm91bmRzID0gbWF4Qm91bmRzLndpdGhNYXhYKCBNYXRoLm1pbiggbWF4Qm91bmRzLm1heFgsIHJlZmluZWRCb3VuZHMubWF4Qm91bmRzLm1heFggKSApO1xuICAgICAgdGVtcE1pbiA9IE1hdGgubWF4KCB0ZW1wTWluLCByZWZpbmVkQm91bmRzLm1heEJvdW5kcy5taW5ZICk7XG4gICAgICB0ZW1wTWF4ID0gTWF0aC5taW4oIHRlbXBNYXgsIHJlZmluZWRCb3VuZHMubWF4Qm91bmRzLm1heFkgKTtcbiAgICB9XG5cbiAgICAvLyBtaW5ZXG4gICAgdGVtcE1pbiA9IG1heEJvdW5kcy5taW5YO1xuICAgIHRlbXBNYXggPSBtYXhCb3VuZHMubWF4WDtcbiAgICB3aGlsZSAoIGlzRmluaXRlKCBtaW5Cb3VuZHMubWluWSApICYmIGlzRmluaXRlKCBtYXhCb3VuZHMubWluWSApICYmIE1hdGguYWJzKCBtaW5Cb3VuZHMubWluWSAtIG1heEJvdW5kcy5taW5ZICkgPiBwcmVjaXNpb24gKSB7XG4gICAgICAvLyB1c2UgbWF4aW11bSBib3VuZHMgZXhjZXB0IGZvciB0aGUgeSBkaXJlY3Rpb24sIHNvIHdlIGRvbid0IG1pc3MgdGhpbmdzIHRoYXQgd2UgYXJlIGxvb2tpbmcgZm9yXG4gICAgICByZWZpbmVkQm91bmRzID0gc2NhbiggaWRlYWxUcmFuc2Zvcm0oIG5ldyBCb3VuZHMyKCB0ZW1wTWluLCBtYXhCb3VuZHMubWluWSwgdGVtcE1heCwgbWluQm91bmRzLm1pblkgKSApICk7XG5cbiAgICAgIGlmICggbWluQm91bmRzLm1pblkgPD0gcmVmaW5lZEJvdW5kcy5taW5Cb3VuZHMubWluWSAmJiBtYXhCb3VuZHMubWluWSA+PSByZWZpbmVkQm91bmRzLm1heEJvdW5kcy5taW5ZICkge1xuICAgICAgICAvLyBzYW5pdHkgY2hlY2sgLSBicmVhayBvdXQgb2YgYW4gaW5maW5pdGUgbG9vcCFcbiAgICAgICAgaWYgKCBkZWJ1Z0Nocm9tZUJvdW5kc1NjYW5uaW5nICkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCAnd2FybmluZywgZXhpdGluZyBpbmZpbml0ZSBsb29wIScgKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgbWluQm91bmRzID0gbWluQm91bmRzLndpdGhNaW5ZKCBNYXRoLm1pbiggbWluQm91bmRzLm1pblksIHJlZmluZWRCb3VuZHMubWluQm91bmRzLm1pblkgKSApO1xuICAgICAgbWF4Qm91bmRzID0gbWF4Qm91bmRzLndpdGhNaW5ZKCBNYXRoLm1heCggbWF4Qm91bmRzLm1pblksIHJlZmluZWRCb3VuZHMubWF4Qm91bmRzLm1pblkgKSApO1xuICAgICAgdGVtcE1pbiA9IE1hdGgubWF4KCB0ZW1wTWluLCByZWZpbmVkQm91bmRzLm1heEJvdW5kcy5taW5YICk7XG4gICAgICB0ZW1wTWF4ID0gTWF0aC5taW4oIHRlbXBNYXgsIHJlZmluZWRCb3VuZHMubWF4Qm91bmRzLm1heFggKTtcbiAgICB9XG5cbiAgICAvLyBtYXhZXG4gICAgdGVtcE1pbiA9IG1heEJvdW5kcy5taW5YO1xuICAgIHRlbXBNYXggPSBtYXhCb3VuZHMubWF4WDtcbiAgICB3aGlsZSAoIGlzRmluaXRlKCBtaW5Cb3VuZHMubWF4WSApICYmIGlzRmluaXRlKCBtYXhCb3VuZHMubWF4WSApICYmIE1hdGguYWJzKCBtaW5Cb3VuZHMubWF4WSAtIG1heEJvdW5kcy5tYXhZICkgPiBwcmVjaXNpb24gKSB7XG4gICAgICAvLyB1c2UgbWF4aW11bSBib3VuZHMgZXhjZXB0IGZvciB0aGUgeSBkaXJlY3Rpb24sIHNvIHdlIGRvbid0IG1pc3MgdGhpbmdzIHRoYXQgd2UgYXJlIGxvb2tpbmcgZm9yXG4gICAgICByZWZpbmVkQm91bmRzID0gc2NhbiggaWRlYWxUcmFuc2Zvcm0oIG5ldyBCb3VuZHMyKCB0ZW1wTWluLCBtaW5Cb3VuZHMubWF4WSwgdGVtcE1heCwgbWF4Qm91bmRzLm1heFkgKSApICk7XG5cbiAgICAgIGlmICggbWluQm91bmRzLm1heFkgPj0gcmVmaW5lZEJvdW5kcy5taW5Cb3VuZHMubWF4WSAmJiBtYXhCb3VuZHMubWF4WSA8PSByZWZpbmVkQm91bmRzLm1heEJvdW5kcy5tYXhZICkge1xuICAgICAgICAvLyBzYW5pdHkgY2hlY2sgLSBicmVhayBvdXQgb2YgYW4gaW5maW5pdGUgbG9vcCFcbiAgICAgICAgaWYgKCBkZWJ1Z0Nocm9tZUJvdW5kc1NjYW5uaW5nICkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCAnd2FybmluZywgZXhpdGluZyBpbmZpbml0ZSBsb29wIScgKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgbWluQm91bmRzID0gbWluQm91bmRzLndpdGhNYXhZKCBNYXRoLm1heCggbWluQm91bmRzLm1heFksIHJlZmluZWRCb3VuZHMubWluQm91bmRzLm1heFkgKSApO1xuICAgICAgbWF4Qm91bmRzID0gbWF4Qm91bmRzLndpdGhNYXhZKCBNYXRoLm1pbiggbWF4Qm91bmRzLm1heFksIHJlZmluZWRCb3VuZHMubWF4Qm91bmRzLm1heFkgKSApO1xuICAgICAgdGVtcE1pbiA9IE1hdGgubWF4KCB0ZW1wTWluLCByZWZpbmVkQm91bmRzLm1heEJvdW5kcy5taW5YICk7XG4gICAgICB0ZW1wTWF4ID0gTWF0aC5taW4oIHRlbXBNYXgsIHJlZmluZWRCb3VuZHMubWF4Qm91bmRzLm1heFggKTtcbiAgICB9XG5cbiAgICBpZiAoIGRlYnVnQ2hyb21lQm91bmRzU2Nhbm5pbmcgKSB7XG4gICAgICBjb25zb2xlLmxvZyggYG1pbkJvdW5kczogJHttaW5Cb3VuZHN9YCApO1xuICAgICAgY29uc29sZS5sb2coIGBtYXhCb3VuZHM6ICR7bWF4Qm91bmRzfWAgKTtcbiAgICB9XG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgY29uc3QgcmVzdWx0OiBCb3VuZHMyICYgeyBtaW5Cb3VuZHM6IEJvdW5kczI7IG1heEJvdW5kczogQm91bmRzMjsgaXNDb25zaXN0ZW50OiBib29sZWFuOyBwcmVjaXNpb246IG51bWJlciB9ID0gbmV3IEJvdW5kczIoXG4gICAgICAvLyBEbyBmaW5pdGUgY2hlY2tzIHNvIHdlIGRvbid0IHJldHVybiBOYU5cbiAgICAgICggaXNGaW5pdGUoIG1pbkJvdW5kcy5taW5YICkgJiYgaXNGaW5pdGUoIG1heEJvdW5kcy5taW5YICkgKSA/ICggbWluQm91bmRzLm1pblggKyBtYXhCb3VuZHMubWluWCApIC8gMiA6IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSxcbiAgICAgICggaXNGaW5pdGUoIG1pbkJvdW5kcy5taW5ZICkgJiYgaXNGaW5pdGUoIG1heEJvdW5kcy5taW5ZICkgKSA/ICggbWluQm91bmRzLm1pblkgKyBtYXhCb3VuZHMubWluWSApIC8gMiA6IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSxcbiAgICAgICggaXNGaW5pdGUoIG1pbkJvdW5kcy5tYXhYICkgJiYgaXNGaW5pdGUoIG1heEJvdW5kcy5tYXhYICkgKSA/ICggbWluQm91bmRzLm1heFggKyBtYXhCb3VuZHMubWF4WCApIC8gMiA6IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSxcbiAgICAgICggaXNGaW5pdGUoIG1pbkJvdW5kcy5tYXhZICkgJiYgaXNGaW5pdGUoIG1heEJvdW5kcy5tYXhZICkgKSA/ICggbWluQm91bmRzLm1heFkgKyBtYXhCb3VuZHMubWF4WSApIC8gMiA6IE51bWJlci5ORUdBVElWRV9JTkZJTklUWVxuICAgICk7XG5cbiAgICAvLyBleHRyYSBkYXRhIGFib3V0IG91ciBib3VuZHNcbiAgICByZXN1bHQubWluQm91bmRzID0gbWluQm91bmRzO1xuICAgIHJlc3VsdC5tYXhCb3VuZHMgPSBtYXhCb3VuZHM7XG4gICAgcmVzdWx0LmlzQ29uc2lzdGVudCA9IG1heEJvdW5kcy5jb250YWluc0JvdW5kcyggbWluQm91bmRzICk7XG4gICAgcmVzdWx0LnByZWNpc2lvbiA9IE1hdGgubWF4KFxuICAgICAgTWF0aC5hYnMoIG1pbkJvdW5kcy5taW5YIC0gbWF4Qm91bmRzLm1pblggKSxcbiAgICAgIE1hdGguYWJzKCBtaW5Cb3VuZHMubWluWSAtIG1heEJvdW5kcy5taW5ZICksXG4gICAgICBNYXRoLmFicyggbWluQm91bmRzLm1heFggLSBtYXhCb3VuZHMubWF4WCApLFxuICAgICAgTWF0aC5hYnMoIG1pbkJvdW5kcy5tYXhZIC0gbWF4Qm91bmRzLm1heFkgKVxuICAgICk7XG5cbiAgICAvLyByZXR1cm4gdGhlIGF2ZXJhZ2VcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICAgKiBXZWJHTCB1dGlsaXRpZXMgKFRPRE86IHNlcGFyYXRlIGZpbGUpIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogRmluZHMgdGhlIHNtYWxsZXN0IHBvd2VyIG9mIDIgdGhhdCBpcyBhdCBsZWFzdCBhcyBsYXJnZSBhcyBuLlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgc21hbGxlc3QgcG93ZXIgb2YgMiB0aGF0IGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCBuXG4gICAqL1xuICB0b1Bvd2VyT2YyKCBuOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICBsZXQgcmVzdWx0ID0gMTtcbiAgICB3aGlsZSAoIHJlc3VsdCA8IG4gKSB7XG4gICAgICByZXN1bHQgKj0gMjtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSxcblxuICAvKipcbiAgICogQ3JlYXRlcyBhbmQgY29tcGlsZXMgYSBHTFNMIFNoYWRlciBvYmplY3QgaW4gV2ViR0wuXG4gICAqL1xuICBjcmVhdGVTaGFkZXIoIGdsOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQsIHNvdXJjZTogc3RyaW5nLCB0eXBlOiBudW1iZXIgKTogV2ViR0xTaGFkZXIge1xuICAgIGNvbnN0IHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlciggdHlwZSApITtcbiAgICBnbC5zaGFkZXJTb3VyY2UoIHNoYWRlciwgc291cmNlICk7XG4gICAgZ2wuY29tcGlsZVNoYWRlciggc2hhZGVyICk7XG5cbiAgICBpZiAoICFnbC5nZXRTaGFkZXJQYXJhbWV0ZXIoIHNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMgKSApIHtcbiAgICAgIGNvbnNvbGUubG9nKCAnR0xTTCBjb21waWxlIGVycm9yOicgKTtcbiAgICAgIGNvbnNvbGUubG9nKCBnbC5nZXRTaGFkZXJJbmZvTG9nKCBzaGFkZXIgKSApO1xuICAgICAgY29uc29sZS5sb2coIHNvdXJjZSApO1xuXG4gICAgICAvLyBOb3JtYWxseSBpdCB3b3VsZCBiZSBiZXN0IHRvIHRocm93IGFuIGV4Y2VwdGlvbiBoZXJlLCBidXQgYSBjb250ZXh0IGxvc3MgY291bGQgY2F1c2UgdGhlIHNoYWRlciBwYXJhbWV0ZXIgY2hlY2tcbiAgICAgIC8vIHRvIGZhaWwsIGFuZCB3ZSBtdXN0IGhhbmRsZSBjb250ZXh0IGxvc3MgZ3JhY2VmdWxseSBiZXR3ZWVuIGFueSBhZGphY2VudCBwYWlyIG9mIGdsIGNhbGxzLlxuICAgICAgLy8gVGhlcmVmb3JlLCB3ZSBzaW1wbHkgcmVwb3J0IHRoZSBlcnJvcnMgdG8gdGhlIGNvbnNvbGUuICBTZWUgIzI3OVxuICAgIH1cblxuICAgIHJldHVybiBzaGFkZXI7XG4gIH0sXG5cbiAgYXBwbHlXZWJHTENvbnRleHREZWZhdWx0cyggZ2w6IFdlYkdMUmVuZGVyaW5nQ29udGV4dCApOiB2b2lkIHtcbiAgICAvLyBXaGF0IGNvbG9yIGdldHMgc2V0IHdoZW4gd2UgY2FsbCBnbC5jbGVhcigpXG4gICAgZ2wuY2xlYXJDb2xvciggMCwgMCwgMCwgMCApO1xuXG4gICAgLy8gQmxlbmRpbmcgc2ltaWxhciB0byBodHRwOi8vbG9jYWxob3N0L3BoZXQvZ2l0L3dlYmdsLWJsZW5kZnVuY3Rpb25zL2JsZW5kZnVuY3NlcGFyYXRlLmh0bWxcbiAgICBnbC5lbmFibGUoIGdsLkJMRU5EICk7XG5cbiAgICAvLyBOT1RFOiBXZSBzd2l0Y2hlZCBiYWNrIHRvIGEgZnVsbHkgcHJlbXVsdGlwbGllZCBzZXR1cCwgc28gd2UgaGF2ZSB0aGUgY29ycmVzcG9uZGluZyBibGVuZCBmdW5jdGlvbi5cbiAgICAvLyBGb3Igbm9ybWFsIGNvbG9ycyAoYW5kIGN1c3RvbSBXZWJHTE5vZGUgaGFuZGxpbmcpLCBpdCBpcyBuZWNlc3NhcnkgdG8gdXNlIHByZW11bHRpcGxpZWQgdmFsdWVzIChtdWx0aXBseWluZyB0aGVcbiAgICAvLyBSR0IgdmFsdWVzIGJ5IHRoZSBhbHBoYSB2YWx1ZSBmb3IgZ2xfRnJhZ0NvbG9yKS4gRm9yIHRleHR1cmVkIHRyaWFuZ2xlcywgaXQgaXMgYXNzdW1lZCB0aGF0IHRoZSB0ZXh0dXJlIGlzXG4gICAgLy8gYWxyZWFkeSBwcmVtdWx0aXBsaWVkLCBzbyB0aGUgYnVpbHQtaW4gc2hhZGVyIGRvZXMgbm90IGRvIHRoZSBleHRyYSBwcmVtdWx0aXBsaWNhdGlvbi5cbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VuZXJneS1za2F0ZS1wYXJrL2lzc3Vlcy8zOSwgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzM5N1xuICAgIC8vIGFuZCBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zOTM0MTU2NC93ZWJnbC1ob3ctdG8tY29ycmVjdGx5LWJsZW5kLWFscGhhLWNoYW5uZWwtcG5nXG4gICAgZ2wuYmxlbmRGdW5jKCBnbC5PTkUsIGdsLk9ORV9NSU5VU19TUkNfQUxQSEEgKTtcbiAgfSxcblxuICAvKipcbiAgICogU2V0IHdoZXRoZXIgd2ViZ2wgc2hvdWxkIGJlIGVuYWJsZWQsIHNlZSBkb2NzIGZvciB3ZWJnbEVuYWJsZWRcbiAgICovXG4gIHNldFdlYkdMRW5hYmxlZCggX3dlYmdsRW5hYmxlZDogYm9vbGVhbiApOiB2b2lkIHtcbiAgICB3ZWJnbEVuYWJsZWQgPSBfd2ViZ2xFbmFibGVkO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDaGVjayB0byBzZWUgd2hldGhlciB3ZWJnbCBpcyBzdXBwb3J0ZWQsIHVzaW5nIHRoZSBzYW1lIHN0cmF0ZWd5IGFzIG1yZG9vYiBhbmQgcGl4aS5qc1xuICAgKlxuICAgKiBAcGFyYW0gW2V4dGVuc2lvbnNdIC0gQSBsaXN0IG9mIFdlYkdMIGV4dGVuc2lvbnMgdGhhdCBuZWVkIHRvIGJlIHN1cHBvcnRlZFxuICAgKi9cbiAgY2hlY2tXZWJHTFN1cHBvcnQoIGV4dGVuc2lvbnM/OiBzdHJpbmdbXSApOiBib29sZWFuIHtcblxuICAgIC8vIFRoZSB3ZWJnbCBjaGVjayBjYW4gYmUgc2h1dCBvZmYsIHBsZWFzZSBzZWUgZG9jcyBhdCB3ZWJnbEVuYWJsZWQgZGVjbGFyYXRpb24gc2l0ZVxuICAgIGlmICggIXdlYmdsRW5hYmxlZCApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcblxuICAgIGNvbnN0IGFyZ3MgPSB7IGZhaWxJZk1ham9yUGVyZm9ybWFuY2VDYXZlYXQ6IHRydWUgfTtcbiAgICB0cnkge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgY29uc3QgZ2w6IFdlYkdMUmVuZGVyaW5nQ29udGV4dCB8IG51bGwgPSAhIXdpbmRvdy5XZWJHTFJlbmRlcmluZ0NvbnRleHQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBjYW52YXMuZ2V0Q29udGV4dCggJ3dlYmdsJywgYXJncyApIHx8IGNhbnZhcy5nZXRDb250ZXh0KCAnZXhwZXJpbWVudGFsLXdlYmdsJywgYXJncyApICk7XG5cbiAgICAgIGlmICggIWdsICkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmICggZXh0ZW5zaW9ucyApIHtcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgZXh0ZW5zaW9ucy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICBpZiAoIGdsLmdldEV4dGVuc2lvbiggZXh0ZW5zaW9uc1sgaSBdICkgPT09IG51bGwgKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBjYXRjaCggZSApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIENoZWNrIHRvIHNlZSB3aGV0aGVyIElFMTEgaGFzIHByb3BlciBjbGVhclN0ZW5jaWwgc3VwcG9ydCAocmVxdWlyZWQgZm9yIHRocmVlLmpzIHRvIHdvcmsgd2VsbCkuXG4gICAqL1xuICBjaGVja0lFMTFTdGVuY2lsU3VwcG9ydCgpOiBib29sZWFuIHtcbiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgIGNvbnN0IGdsOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQgfCBudWxsID0gISF3aW5kb3cuV2ViR0xSZW5kZXJpbmdDb250ZXh0ICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggY2FudmFzLmdldENvbnRleHQoICd3ZWJnbCcgKSB8fCBjYW52YXMuZ2V0Q29udGV4dCggJ2V4cGVyaW1lbnRhbC13ZWJnbCcgKSApO1xuXG4gICAgICBpZiAoICFnbCApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBGYWlsdXJlIGZvciBodHRwczovL2dpdGh1Yi5jb20vbXJkb29iL3RocmVlLmpzL2lzc3Vlcy8zNjAwIC8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL21vbGVjdWxlLXNoYXBlcy9pc3N1ZXMvMTMzXG4gICAgICBnbC5jbGVhclN0ZW5jaWwoIDAgKTtcbiAgICAgIHJldHVybiBnbC5nZXRFcnJvcigpID09PSAwO1xuICAgIH1cbiAgICBjYXRjaCggZSApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgV2ViR0wgKHdpdGggZGVjZW50IHBlcmZvcm1hbmNlKSBpcyBzdXBwb3J0ZWQgYnkgdGhlIHBsYXRmb3JtXG4gICAqL1xuICBnZXQgaXNXZWJHTFN1cHBvcnRlZCgpOiBib29sZWFuIHtcbiAgICBpZiAoIF9leHRlbnNpb25sZXNzV2ViR0xTdXBwb3J0ID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBfZXh0ZW5zaW9ubGVzc1dlYkdMU3VwcG9ydCA9IFV0aWxzLmNoZWNrV2ViR0xTdXBwb3J0KCk7XG4gICAgfVxuICAgIHJldHVybiBfZXh0ZW5zaW9ubGVzc1dlYkdMU3VwcG9ydDtcbiAgfSxcblxuICAvKipcbiAgICogVHJpZ2dlcnMgYSBsb3NzIG9mIGEgV2ViR0wgY29udGV4dCwgd2l0aCBhIGRlbGF5ZWQgcmVzdG9yYXRpb24uXG4gICAqXG4gICAqIE5PVEU6IE9ubHkgdXNlIHRoaXMgZm9yIGRlYnVnZ2luZy4gU2hvdWxkIG5vdCBiZSBjYWxsZWQgbm9ybWFsbHkuXG4gICAqL1xuICBsb3NlQ29udGV4dCggZ2w6IFdlYkdMUmVuZGVyaW5nQ29udGV4dCApOiB2b2lkIHtcbiAgICBjb25zdCBleHRlbnNpb24gPSBnbC5nZXRFeHRlbnNpb24oICdXRUJHTF9sb3NlX2NvbnRleHQnICk7XG4gICAgaWYgKCBleHRlbnNpb24gKSB7XG4gICAgICBleHRlbnNpb24ubG9zZUNvbnRleHQoKTtcblxuICAgICAgLy8gTk9URTogV2UgZG9uJ3Qgd2FudCB0byByZWx5IG9uIGEgY29tbW9uIHRpbWVyLCBzbyB3ZSdyZSB1c2luZyB0aGUgYnVpbHQtaW4gZm9ybSBvbiBwdXJwb3NlLlxuICAgICAgc2V0VGltZW91dCggKCkgPT4geyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvYmFkLXNpbS10ZXh0XG4gICAgICAgIGV4dGVuc2lvbi5yZXN0b3JlQ29udGV4dCgpO1xuICAgICAgfSwgMTAwMCApO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHN0cmluZyB1c2VmdWwgZm9yIHdvcmtpbmcgYXJvdW5kIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jb2xsaXNpb24tbGFiL2lzc3Vlcy8xNzcuXG4gICAqL1xuICBzYWZhcmlFbWJlZGRpbmdNYXJrV29ya2Fyb3VuZCggc3RyOiBzdHJpbmcgKTogc3RyaW5nIHtcbiAgICBpZiAoIHBsYXRmb3JtLnNhZmFyaSApIHtcbiAgICAgIC8vIE5PVEU6IEkgZG9uJ3QgYmVsaWV2ZSBpdCdzIGxpa2VseS9wb3NzaWJsZSBhIHZhbGlkIFVURi04IHN0cmluZyB3aWxsIGNvbnRhaW4gdGhlc2UgY29kZSBwb2ludHMgYWRqYWNlbnRseSxcbiAgICAgIC8vIGR1ZSB0byB0aGUgcHJvcGVydHkgdGhhdCB5b3UgY2FuIHN0YXJ0IHJlYWRpbmcgVVRGLTggZnJvbSBhbnkgYnl0ZS4gU28gd2UncmUgc2FmZSB0byBzcGxpdCBpdCBhbmQgYnJlYWsgaXRcbiAgICAgIC8vIGludG8gVVRGLTE2IGNvZGUgdW5pdHMsIHNpbmNlIHdlJ3JlIG5vdCBtdWNraW5nIHdpdGggc3Vycm9nYXRlIHBhaXJzLlxuICAgICAgY29uc3QgdXRmMTZDb2RlVW5pdHMgPSBzdHIuc3BsaXQoICcnICk7XG4gICAgICBsZXQgcmVzdWx0ID0gJyc7XG5cbiAgICAgIC8vIE5PVEU6IFdlJ3JlIG9ubHkgaW5zZXJ0aW5nIHplcm8td2lkdGggc3BhY2VzIGJldHdlZW4gZW1iZWRkaW5nIG1hcmtzLCBzaW5jZSBwcmlvciB0byB0aGlzIG91ciBpbnNlcnRpb24gYmV0d2VlblxuICAgICAgLy8gY2VydGFpbiBjb2RlIHBvaW50cyB3YXMgY2F1c2luZyBpc3N1ZXMgd2l0aCBTYWZhcmkgKGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy93ZWJzaXRlLW1ldGVvci9pc3N1ZXMvNjU2KVxuICAgICAgbGV0IGxhc3RJc0VtYmVkZGluZ01hcmsgPSBmYWxzZTtcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHV0ZjE2Q29kZVVuaXRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBjb25zdCBuZXh0ID0gdXRmMTZDb2RlVW5pdHNbIGkgXTtcbiAgICAgICAgY29uc3QgbmV4dElzRW1iZWRkaW5nTWFyayA9IG5leHQgPT09ICdcXHUyMDJhJyB8fCBuZXh0ID09PSAnXFx1MjAyYicgfHwgbmV4dCA9PT0gJ1xcdTIwMmMnO1xuXG4gICAgICAgIC8vIEFkZCBpbiB6ZXJvLXdpZHRoIHNwYWNlcyBmb3IgU2FmYXJpLCBzbyBpdCBkb2Vzbid0IGhhdmUgYWRqYWNlbnQgZW1iZWRkaW5nIG1hcmtzIGV2ZXIgKHdoaWNoIHNlZW1zIHRvIHByZXZlbnRcbiAgICAgICAgLy8gdGhpbmdzKS5cbiAgICAgICAgaWYgKCBsYXN0SXNFbWJlZGRpbmdNYXJrICYmIG5leHRJc0VtYmVkZGluZ01hcmsgKSB7XG4gICAgICAgICAgcmVzdWx0ICs9ICdcXHUyMDBCJztcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgKz0gbmV4dDtcblxuICAgICAgICBsYXN0SXNFbWJlZGRpbmdNYXJrID0gbmV4dElzRW1iZWRkaW5nTWFyaztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgfVxufTtcblxuc2NlbmVyeS5yZWdpc3RlciggJ1V0aWxzJywgVXRpbHMgKTtcbmV4cG9ydCBkZWZhdWx0IFV0aWxzOyJdLCJuYW1lcyI6WyJCb3VuZHMyIiwiTWF0cml4MyIsIlRyYW5zZm9ybTMiLCJWZWN0b3IyIiwicGxhdGZvcm0iLCJGZWF0dXJlcyIsInNjZW5lcnkiLCJwIiwieCIsInkiLCJkZWJ1Z0Nocm9tZUJvdW5kc1NjYW5uaW5nIiwidHJhbnNmb3JtUHJvcGVydHkiLCJ0cmFuc2Zvcm0iLCJ0cmFuc2Zvcm1PcmlnaW5Qcm9wZXJ0eSIsInRyYW5zZm9ybU9yaWdpbiIsIndlYmdsRW5hYmxlZCIsIl9leHRlbnNpb25sZXNzV2ViR0xTdXBwb3J0IiwiVXRpbHMiLCJwcmVwYXJlRm9yVHJhbnNmb3JtIiwiZWxlbWVudCIsInN0eWxlIiwiYXBwbHlQcmVwYXJlZFRyYW5zZm9ybSIsIm1hdHJpeCIsImdldENTU1RyYW5zZm9ybSIsInNldFRyYW5zZm9ybSIsInRyYW5zZm9ybVN0cmluZyIsInVuc2V0VHJhbnNmb3JtIiwicG9seWZpbGxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJ3aW5kb3ciLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJjYW5jZWxBbmltYXRpb25GcmFtZSIsImNhbGxiYWNrIiwidGltZUF0U3RhcnQiLCJEYXRlIiwibm93Iiwic2V0VGltZW91dCIsImNsZWFyVGltZW91dCIsImJhY2tpbmdTdG9yZVBpeGVsUmF0aW8iLCJjb250ZXh0Iiwid2Via2l0QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyIsIm1vekJhY2tpbmdTdG9yZVBpeGVsUmF0aW8iLCJtc0JhY2tpbmdTdG9yZVBpeGVsUmF0aW8iLCJvQmFja2luZ1N0b3JlUGl4ZWxSYXRpbyIsImJhY2tpbmdTY2FsZSIsImJhY2tpbmdTdG9yZVJhdGlvIiwiZGV2aWNlUGl4ZWxSYXRpbyIsInN1cHBvcnRzTmF0aXZlQ2FudmFzRmlsdGVyIiwiY2FudmFzRmlsdGVyIiwic3VwcG9ydHNJbWFnZURhdGFDYW52YXNGaWx0ZXIiLCJzY3JhdGNoQ29udGV4dCIsInNjYW5Cb3VuZHMiLCJpbWFnZURhdGEiLCJyZXNvbHV0aW9uIiwiZGlydHlYIiwiXyIsIm1hcCIsInJhbmdlIiwiZGlydHlZIiwib2Zmc2V0IiwiZGF0YSIsIm1pblgiLCJpbmRleE9mIiwibWF4WCIsImxhc3RJbmRleE9mIiwibWluWSIsIm1heFkiLCJleHRyYVNwcmVhZCIsIm1pbkJvdW5kcyIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwiaW52ZXJzZVBvc2l0aW9uMiIsIk5FR0FUSVZFX0lORklOSVRZIiwibWF4Qm91bmRzIiwiY2FudmFzQWNjdXJhdGVCb3VuZHMiLCJyZW5kZXJUb0NvbnRleHQiLCJvcHRpb25zIiwicHJlY2lzaW9uIiwiaW5pdGlhbFNjYWxlIiwiTk9USElORyIsIkVWRVJZVEhJTkciLCJjYW52YXMiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJ3aWR0aCIsImhlaWdodCIsImdldENvbnRleHQiLCIkIiwicmVhZHkiLCJoZWFkZXIiLCJ0ZXh0IiwiYXBwZW5kIiwic2NhbiIsInNhdmUiLCJjYW52YXNTZXRUcmFuc2Zvcm0iLCJyZXN0b3JlIiwiZ2V0SW1hZ2VEYXRhIiwibWluTWF4Qm91bmRzIiwic25hcHNob3RUb0NhbnZhcyIsInNuYXBzaG90IiwicHV0SW1hZ2VEYXRhIiwiY3NzIiwiY2xlYXJSZWN0IiwiaWRlYWxUcmFuc2Zvcm0iLCJib3VuZHMiLCJib3JkZXJTaXplIiwic2NhbGVYIiwic2NhbGVZIiwidHJhbnNsYXRpb25YIiwidHJhbnNsYXRpb25ZIiwidHJhbnNsYXRpb24iLCJ0aW1lc01hdHJpeCIsInNjYWxpbmciLCJpbml0aWFsVHJhbnNmb3JtIiwiY29hcnNlQm91bmRzIiwidW5pb24iLCJpbnRlcnNlY3Rpb24iLCJ0ZW1wTWluIiwidGVtcE1heCIsInJlZmluZWRCb3VuZHMiLCJpc0Zpbml0ZSIsIk1hdGgiLCJhYnMiLCJjb25zb2xlIiwibG9nIiwidHJhbnNmb3JtUG9zaXRpb24yIiwid2l0aE1pblgiLCJtaW4iLCJtYXgiLCJ3aXRoTWF4WCIsIndpdGhNaW5ZIiwid2l0aE1heFkiLCJyZXN1bHQiLCJpc0NvbnNpc3RlbnQiLCJjb250YWluc0JvdW5kcyIsInRvUG93ZXJPZjIiLCJuIiwiY3JlYXRlU2hhZGVyIiwiZ2wiLCJzb3VyY2UiLCJ0eXBlIiwic2hhZGVyIiwic2hhZGVyU291cmNlIiwiY29tcGlsZVNoYWRlciIsImdldFNoYWRlclBhcmFtZXRlciIsIkNPTVBJTEVfU1RBVFVTIiwiZ2V0U2hhZGVySW5mb0xvZyIsImFwcGx5V2ViR0xDb250ZXh0RGVmYXVsdHMiLCJjbGVhckNvbG9yIiwiZW5hYmxlIiwiQkxFTkQiLCJibGVuZEZ1bmMiLCJPTkUiLCJPTkVfTUlOVVNfU1JDX0FMUEhBIiwic2V0V2ViR0xFbmFibGVkIiwiX3dlYmdsRW5hYmxlZCIsImNoZWNrV2ViR0xTdXBwb3J0IiwiZXh0ZW5zaW9ucyIsImFyZ3MiLCJmYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0IiwiV2ViR0xSZW5kZXJpbmdDb250ZXh0IiwiaSIsImxlbmd0aCIsImdldEV4dGVuc2lvbiIsImUiLCJjaGVja0lFMTFTdGVuY2lsU3VwcG9ydCIsImNsZWFyU3RlbmNpbCIsImdldEVycm9yIiwiaXNXZWJHTFN1cHBvcnRlZCIsInVuZGVmaW5lZCIsImxvc2VDb250ZXh0IiwiZXh0ZW5zaW9uIiwicmVzdG9yZUNvbnRleHQiLCJzYWZhcmlFbWJlZGRpbmdNYXJrV29ya2Fyb3VuZCIsInN0ciIsInNhZmFyaSIsInV0ZjE2Q29kZVVuaXRzIiwic3BsaXQiLCJsYXN0SXNFbWJlZGRpbmdNYXJrIiwibmV4dCIsIm5leHRJc0VtYmVkZGluZ01hcmsiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxnQkFBZ0IsZ0NBQWdDO0FBQ3ZELE9BQU9DLGFBQWEsNkJBQTZCO0FBQ2pELE9BQU9DLGNBQWMsb0NBQW9DO0FBQ3pELFNBQVNDLFFBQVEsRUFBRUMsT0FBTyxRQUFRLGdCQUFnQjtBQUVsRCx1QkFBdUI7QUFDdkIsU0FBU0MsRUFBR0MsQ0FBUyxFQUFFQyxDQUFTO0lBQzlCLE9BQU8sSUFBSU4sUUFBU0ssR0FBR0M7QUFDekI7QUFFQSwrRkFBK0Y7QUFDL0YsTUFBTUMsNEJBQTRC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