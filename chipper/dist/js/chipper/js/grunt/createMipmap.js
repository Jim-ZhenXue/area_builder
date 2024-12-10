// Copyright 2017-2024, University of Colorado Boulder
import fs from 'fs';
import mipmapDownscale from '../../../chipper/js/common/mipmapDownscale.js';
import grunt from '../../../perennial-alias/js/npm-dependencies/grunt.js';
const jpegJs = require('jpeg-js');
const pngjs = require('pngjs');
/**
 * Responsible for converting a single PNG/JPEG file to a structured list of mipmapped versions of it, each
 * at half the scale of the previous version.
 *
 * Level 0 is the original image, level 1 is a half-size image, level 2 is a quarter-size image, etc.
 *
 * For each level, a preferred encoding (PNG/JPEG) is determined. If the image doesn't need alpha information and
 * the JPEG base64 is smaller, the JPEG encoding will be used (PNG otherwise).
 *
 * The resulting object for each mipmap level will be of the form:
 * {
 *   width: {number} - width of the image provided by this level of detail
 *   height: {number} - width of the image provided by this level of detail
 *   data: {Buffer} - 1-dimensional row-major buffer holding RGBA information for the level as an array of bytes 0-255.
 *                    e.g. buffer[2] will be the blue component of the top-left pixel, buffer[4] is the red component
 *                    for the pixel to the right, etc.
 *   url: {string} - Data URL for the preferred image data
 *   buffer: {Buffer} - Raw bytes for the preferred image data (could be written to file and opened as an image)
 *   <pngURL, pngBuffer, jpgURL, jpgBuffer may also be available, but is not meant for general use>
 * }
 *
 * @param filename
 * @param maxLevel - An integer denoting the maximum level of detail that should be included, or -1 to include
 *                            all levels up to and including a 1x1 image.
 * @param quality - An integer from 1-100 determining the quality of the image. Currently only used for the
 *                           JPEG encoding quality.
 * @returns - Will be resolved with mipmaps: {Array} (consisting of the mipmap objects, mipmaps[0] will be level 0)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ export default function createMipmap(filename, maxLevel, quality) {
    return new Promise((resolve, reject)=>{
        const mipmaps = [];
        // kick everything off
        const suffix = filename.slice(-4);
        if (suffix === '.jpg') {
            loadJPEG();
        } else if (suffix === '.png') {
            loadPNG();
        } else {
            reject(new Error(`unknown image type: ${filename}`));
        }
        // Loads / decodes the initial JPEG image, and when done proceeds to the mipmapping
        function loadJPEG() {
            const imageData = jpegJs.decode(fs.readFileSync(filename));
            mipmaps.push({
                data: imageData.data,
                width: imageData.width,
                height: imageData.height
            });
            startMipmapCreation();
        }
        // Loads / decodes the initial PNG image, and when done proceeds to the mipmapping
        function loadPNG() {
            const src = fs.createReadStream(filename);
            const basePNG = new pngjs.PNG({
            });
            basePNG.on('error', (err)=>{
                reject(err);
            });
            basePNG.on('parsed', ()=>{
                mipmaps.push({
                    data: basePNG.data,
                    width: basePNG.width,
                    height: basePNG.height
                });
                startMipmapCreation();
            });
            // pass the stream to pngjs
            src.pipe(basePNG);
        }
        /**
     * @param data - Should have 4*width*height elements
     * @param width
     * @param height
     * @param quality - Out of 100
     * @param callback - function( buffer )
     */ function outputJPEG(data, width, height, quality, callback) {
            const encodedOuput = jpegJs.encode({
                data: data,
                width: width,
                height: height
            }, quality);
            callback(encodedOuput.data);
        }
        /**
     * @param data - Should have 4*width*height elements
     * @param width
     * @param height
     * @param callback - function( buffer )
     */ function outputPNG(data, width, height, callback) {
            // provides width/height so it is initialized with the correct-size buffer
            const png = new pngjs.PNG({
                width: width,
                height: height
            });
            // copy our image data into the pngjs.PNG's data buffer;
            data.copy(png.data, 0, 0, data.length);
            // will concatenate the buffers from the stream into one once it is finished
            const buffers = [];
            png.on('data', (buffer)=>{
                buffers.push(buffer);
            });
            png.on('end', ()=>{
                const buffer = Buffer.concat(buffers);
                callback(buffer);
            });
            png.on('error', (err)=>{
                reject(err);
            });
            // kick off the encoding of the PNG
            png.pack();
        }
        // called when our mipmap[0] level is loaded by decoding the main image (creates the mipmap levels)
        function startMipmapCreation() {
            // When reduced to 0, we'll be done with encoding (and can call our callback). Needed because they are asynchronous.
            let encodeCounter = 1;
            // Alpha detection on the level-0 image to see if we can swap jpg for png
            let hasAlpha = false;
            for(let i = 3; i < mipmaps[0].data.length; i += 4){
                if (mipmaps[0].data[i] < 255) {
                    hasAlpha = true;
                    break;
                }
            }
            // called when all encoding is complete
            function encodingComplete() {
                grunt.log.verbose.writeln(`mipmapped ${filename}${maxLevel >= 0 ? ` to level ${maxLevel}` : ''} with quality: ${quality}`);
                for(let level = 0; level < mipmaps.length; level++){
                    // for now, make .url point to the smallest of the two (unless we have an alpha channel need)
                    const usePNG = hasAlpha || mipmaps[level].jpgURL.length > mipmaps[level].pngURL.length;
                    mipmaps[level].url = usePNG ? mipmaps[level].pngURL : mipmaps[level].jpgURL;
                    mipmaps[level].buffer = usePNG ? mipmaps[level].pngBuffer : mipmaps[level].jpgBuffer;
                    grunt.log.verbose.writeln(`level ${level} (${usePNG ? 'PNG' : 'JPG'} ${mipmaps[level].width}x${mipmaps[level].height}) base64: ${mipmaps[level].url.length} bytes `);
                }
                resolve(mipmaps);
            }
            // kicks off asynchronous encoding for a specific level
            function encodeLevel(level) {
                encodeCounter++;
                outputPNG(mipmaps[level].data, mipmaps[level].width, mipmaps[level].height, (buffer)=>{
                    mipmaps[level].pngBuffer = buffer;
                    mipmaps[level].pngURL = `data:image/png;base64,${buffer.toString('base64')}`;
                    if (--encodeCounter === 0) {
                        encodingComplete();
                    }
                });
                // only encode JPEG if it has no alpha
                if (!hasAlpha) {
                    encodeCounter++;
                    outputJPEG(mipmaps[level].data, mipmaps[level].width, mipmaps[level].height, quality, (buffer)=>{
                        mipmaps[level].jpgBuffer = buffer;
                        mipmaps[level].jpgURL = `data:image/jpeg;base64,${buffer.toString('base64')}`;
                        if (--encodeCounter === 0) {
                            encodingComplete();
                        }
                    });
                }
            }
            // encode all levels, and compute rasters for levels 1-N
            encodeLevel(0);
            function finestMipmap() {
                return mipmaps[mipmaps.length - 1];
            }
            // bail if we already have a 1x1 image, or if we reach the maxLevel (recall maxLevel===-1 means no maximum level)
            // eslint-disable-next-line no-unmodified-loop-condition
            while((mipmaps.length - 1 < maxLevel || maxLevel < 0) && (finestMipmap().width > 1 || finestMipmap().height > 1)){
                const level = mipmaps.length;
                mipmaps.push(mipmapDownscale(finestMipmap(), (width, height)=>{
                    return Buffer.alloc(4 * width * height);
                }));
                encodeLevel(level);
            }
            // just in case everything happened synchronously
            if (--encodeCounter === 0) {
                encodingComplete();
            }
        }
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L2NyZWF0ZU1pcG1hcC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBtaXBtYXBEb3duc2NhbGUgZnJvbSAnLi4vLi4vLi4vY2hpcHBlci9qcy9jb21tb24vbWlwbWFwRG93bnNjYWxlLmpzJztcbmltcG9ydCBncnVudCBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvbnBtLWRlcGVuZGVuY2llcy9ncnVudC5qcyc7XG5cbmNvbnN0IGpwZWdKcyA9IHJlcXVpcmUoICdqcGVnLWpzJyApO1xuY29uc3QgcG5nanMgPSByZXF1aXJlKCAncG5nanMnICk7XG5cbnR5cGUgVE1pcG1hcCA9IHtcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG4gIGRhdGE6IEJ1ZmZlcjtcbiAgdXJsPzogc3RyaW5nO1xuICBidWZmZXI/OiBCdWZmZXI7XG4gIHBuZ1VSTD86IHN0cmluZztcbiAgcG5nQnVmZmVyPzogQnVmZmVyO1xuICBqcGdVUkw/OiBzdHJpbmc7XG4gIGpwZ0J1ZmZlcj86IEJ1ZmZlcjtcbn07XG5cbi8qKlxuICogUmVzcG9uc2libGUgZm9yIGNvbnZlcnRpbmcgYSBzaW5nbGUgUE5HL0pQRUcgZmlsZSB0byBhIHN0cnVjdHVyZWQgbGlzdCBvZiBtaXBtYXBwZWQgdmVyc2lvbnMgb2YgaXQsIGVhY2hcbiAqIGF0IGhhbGYgdGhlIHNjYWxlIG9mIHRoZSBwcmV2aW91cyB2ZXJzaW9uLlxuICpcbiAqIExldmVsIDAgaXMgdGhlIG9yaWdpbmFsIGltYWdlLCBsZXZlbCAxIGlzIGEgaGFsZi1zaXplIGltYWdlLCBsZXZlbCAyIGlzIGEgcXVhcnRlci1zaXplIGltYWdlLCBldGMuXG4gKlxuICogRm9yIGVhY2ggbGV2ZWwsIGEgcHJlZmVycmVkIGVuY29kaW5nIChQTkcvSlBFRykgaXMgZGV0ZXJtaW5lZC4gSWYgdGhlIGltYWdlIGRvZXNuJ3QgbmVlZCBhbHBoYSBpbmZvcm1hdGlvbiBhbmRcbiAqIHRoZSBKUEVHIGJhc2U2NCBpcyBzbWFsbGVyLCB0aGUgSlBFRyBlbmNvZGluZyB3aWxsIGJlIHVzZWQgKFBORyBvdGhlcndpc2UpLlxuICpcbiAqIFRoZSByZXN1bHRpbmcgb2JqZWN0IGZvciBlYWNoIG1pcG1hcCBsZXZlbCB3aWxsIGJlIG9mIHRoZSBmb3JtOlxuICoge1xuICogICB3aWR0aDoge251bWJlcn0gLSB3aWR0aCBvZiB0aGUgaW1hZ2UgcHJvdmlkZWQgYnkgdGhpcyBsZXZlbCBvZiBkZXRhaWxcbiAqICAgaGVpZ2h0OiB7bnVtYmVyfSAtIHdpZHRoIG9mIHRoZSBpbWFnZSBwcm92aWRlZCBieSB0aGlzIGxldmVsIG9mIGRldGFpbFxuICogICBkYXRhOiB7QnVmZmVyfSAtIDEtZGltZW5zaW9uYWwgcm93LW1ham9yIGJ1ZmZlciBob2xkaW5nIFJHQkEgaW5mb3JtYXRpb24gZm9yIHRoZSBsZXZlbCBhcyBhbiBhcnJheSBvZiBieXRlcyAwLTI1NS5cbiAqICAgICAgICAgICAgICAgICAgICBlLmcuIGJ1ZmZlclsyXSB3aWxsIGJlIHRoZSBibHVlIGNvbXBvbmVudCBvZiB0aGUgdG9wLWxlZnQgcGl4ZWwsIGJ1ZmZlcls0XSBpcyB0aGUgcmVkIGNvbXBvbmVudFxuICogICAgICAgICAgICAgICAgICAgIGZvciB0aGUgcGl4ZWwgdG8gdGhlIHJpZ2h0LCBldGMuXG4gKiAgIHVybDoge3N0cmluZ30gLSBEYXRhIFVSTCBmb3IgdGhlIHByZWZlcnJlZCBpbWFnZSBkYXRhXG4gKiAgIGJ1ZmZlcjoge0J1ZmZlcn0gLSBSYXcgYnl0ZXMgZm9yIHRoZSBwcmVmZXJyZWQgaW1hZ2UgZGF0YSAoY291bGQgYmUgd3JpdHRlbiB0byBmaWxlIGFuZCBvcGVuZWQgYXMgYW4gaW1hZ2UpXG4gKiAgIDxwbmdVUkwsIHBuZ0J1ZmZlciwganBnVVJMLCBqcGdCdWZmZXIgbWF5IGFsc28gYmUgYXZhaWxhYmxlLCBidXQgaXMgbm90IG1lYW50IGZvciBnZW5lcmFsIHVzZT5cbiAqIH1cbiAqXG4gKiBAcGFyYW0gZmlsZW5hbWVcbiAqIEBwYXJhbSBtYXhMZXZlbCAtIEFuIGludGVnZXIgZGVub3RpbmcgdGhlIG1heGltdW0gbGV2ZWwgb2YgZGV0YWlsIHRoYXQgc2hvdWxkIGJlIGluY2x1ZGVkLCBvciAtMSB0byBpbmNsdWRlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGwgbGV2ZWxzIHVwIHRvIGFuZCBpbmNsdWRpbmcgYSAxeDEgaW1hZ2UuXG4gKiBAcGFyYW0gcXVhbGl0eSAtIEFuIGludGVnZXIgZnJvbSAxLTEwMCBkZXRlcm1pbmluZyB0aGUgcXVhbGl0eSBvZiB0aGUgaW1hZ2UuIEN1cnJlbnRseSBvbmx5IHVzZWQgZm9yIHRoZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICBKUEVHIGVuY29kaW5nIHF1YWxpdHkuXG4gKiBAcmV0dXJucyAtIFdpbGwgYmUgcmVzb2x2ZWQgd2l0aCBtaXBtYXBzOiB7QXJyYXl9IChjb25zaXN0aW5nIG9mIHRoZSBtaXBtYXAgb2JqZWN0cywgbWlwbWFwc1swXSB3aWxsIGJlIGxldmVsIDApXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVNaXBtYXAoIGZpbGVuYW1lOiBzdHJpbmcsIG1heExldmVsOiBudW1iZXIsIHF1YWxpdHk6IG51bWJlciApOiBQcm9taXNlPFRNaXBtYXBbXT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xuICAgIGNvbnN0IG1pcG1hcHM6IFRNaXBtYXBbXSA9IFtdO1xuXG4gICAgLy8ga2ljayBldmVyeXRoaW5nIG9mZlxuICAgIGNvbnN0IHN1ZmZpeCA9IGZpbGVuYW1lLnNsaWNlKCAtNCApO1xuICAgIGlmICggc3VmZml4ID09PSAnLmpwZycgKSB7XG4gICAgICBsb2FkSlBFRygpO1xuICAgIH1cbiAgICBlbHNlIGlmICggc3VmZml4ID09PSAnLnBuZycgKSB7XG4gICAgICBsb2FkUE5HKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmVqZWN0KCBuZXcgRXJyb3IoIGB1bmtub3duIGltYWdlIHR5cGU6ICR7ZmlsZW5hbWV9YCApICk7XG4gICAgfVxuXG4gICAgLy8gTG9hZHMgLyBkZWNvZGVzIHRoZSBpbml0aWFsIEpQRUcgaW1hZ2UsIGFuZCB3aGVuIGRvbmUgcHJvY2VlZHMgdG8gdGhlIG1pcG1hcHBpbmdcbiAgICBmdW5jdGlvbiBsb2FkSlBFRygpOiB2b2lkIHtcbiAgICAgIGNvbnN0IGltYWdlRGF0YSA9IGpwZWdKcy5kZWNvZGUoIGZzLnJlYWRGaWxlU3luYyggZmlsZW5hbWUgKSApO1xuXG4gICAgICBtaXBtYXBzLnB1c2goIHtcbiAgICAgICAgZGF0YTogaW1hZ2VEYXRhLmRhdGEsXG4gICAgICAgIHdpZHRoOiBpbWFnZURhdGEud2lkdGgsXG4gICAgICAgIGhlaWdodDogaW1hZ2VEYXRhLmhlaWdodFxuICAgICAgfSApO1xuXG4gICAgICBzdGFydE1pcG1hcENyZWF0aW9uKCk7XG4gICAgfVxuXG4gICAgLy8gTG9hZHMgLyBkZWNvZGVzIHRoZSBpbml0aWFsIFBORyBpbWFnZSwgYW5kIHdoZW4gZG9uZSBwcm9jZWVkcyB0byB0aGUgbWlwbWFwcGluZ1xuICAgIGZ1bmN0aW9uIGxvYWRQTkcoKTogdm9pZCB7XG4gICAgICBjb25zdCBzcmMgPSBmcy5jcmVhdGVSZWFkU3RyZWFtKCBmaWxlbmFtZSApO1xuXG4gICAgICBjb25zdCBiYXNlUE5HID0gbmV3IHBuZ2pzLlBORygge1xuICAgICAgICAvLyBpZiB3ZSBuZWVkIGEgc3BlY2lmaWMgZmlsdGVyIHR5cGUsIHB1dCBpdCBoZXJlXG4gICAgICB9ICk7XG5cbiAgICAgIGJhc2VQTkcub24oICdlcnJvcicsICggZXJyOiBFcnJvciApID0+IHtcbiAgICAgICAgcmVqZWN0KCBlcnIgKTtcbiAgICAgIH0gKTtcblxuICAgICAgYmFzZVBORy5vbiggJ3BhcnNlZCcsICgpID0+IHtcbiAgICAgICAgbWlwbWFwcy5wdXNoKCB7XG4gICAgICAgICAgZGF0YTogYmFzZVBORy5kYXRhLFxuICAgICAgICAgIHdpZHRoOiBiYXNlUE5HLndpZHRoLFxuICAgICAgICAgIGhlaWdodDogYmFzZVBORy5oZWlnaHRcbiAgICAgICAgfSApO1xuXG4gICAgICAgIHN0YXJ0TWlwbWFwQ3JlYXRpb24oKTtcbiAgICAgIH0gKTtcblxuICAgICAgLy8gcGFzcyB0aGUgc3RyZWFtIHRvIHBuZ2pzXG4gICAgICBzcmMucGlwZSggYmFzZVBORyApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBkYXRhIC0gU2hvdWxkIGhhdmUgNCp3aWR0aCpoZWlnaHQgZWxlbWVudHNcbiAgICAgKiBAcGFyYW0gd2lkdGhcbiAgICAgKiBAcGFyYW0gaGVpZ2h0XG4gICAgICogQHBhcmFtIHF1YWxpdHkgLSBPdXQgb2YgMTAwXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIC0gZnVuY3Rpb24oIGJ1ZmZlciApXG4gICAgICovXG4gICAgZnVuY3Rpb24gb3V0cHV0SlBFRyggZGF0YTogQnVmZmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgcXVhbGl0eTogbnVtYmVyLCBjYWxsYmFjazogKCBidWZmZXI6IEJ1ZmZlciApID0+IHZvaWQgKTogdm9pZCB7XG4gICAgICBjb25zdCBlbmNvZGVkT3VwdXQgPSBqcGVnSnMuZW5jb2RlKCB7XG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAgIH0sIHF1YWxpdHkgKTtcbiAgICAgIGNhbGxiYWNrKCBlbmNvZGVkT3VwdXQuZGF0YSApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBkYXRhIC0gU2hvdWxkIGhhdmUgNCp3aWR0aCpoZWlnaHQgZWxlbWVudHNcbiAgICAgKiBAcGFyYW0gd2lkdGhcbiAgICAgKiBAcGFyYW0gaGVpZ2h0XG4gICAgICogQHBhcmFtIGNhbGxiYWNrIC0gZnVuY3Rpb24oIGJ1ZmZlciApXG4gICAgICovXG4gICAgZnVuY3Rpb24gb3V0cHV0UE5HKCBkYXRhOiBCdWZmZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBjYWxsYmFjazogKCBidWZmZXI6IEJ1ZmZlciApID0+IHZvaWQgKTogdm9pZCB7XG4gICAgICAvLyBwcm92aWRlcyB3aWR0aC9oZWlnaHQgc28gaXQgaXMgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgY29ycmVjdC1zaXplIGJ1ZmZlclxuICAgICAgY29uc3QgcG5nID0gbmV3IHBuZ2pzLlBORygge1xuICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgICB9ICk7XG5cbiAgICAgIC8vIGNvcHkgb3VyIGltYWdlIGRhdGEgaW50byB0aGUgcG5nanMuUE5HJ3MgZGF0YSBidWZmZXI7XG4gICAgICBkYXRhLmNvcHkoIHBuZy5kYXRhLCAwLCAwLCBkYXRhLmxlbmd0aCApO1xuXG4gICAgICAvLyB3aWxsIGNvbmNhdGVuYXRlIHRoZSBidWZmZXJzIGZyb20gdGhlIHN0cmVhbSBpbnRvIG9uZSBvbmNlIGl0IGlzIGZpbmlzaGVkXG4gICAgICBjb25zdCBidWZmZXJzOiBCdWZmZXJbXSA9IFtdO1xuICAgICAgcG5nLm9uKCAnZGF0YScsICggYnVmZmVyOiBCdWZmZXIgKSA9PiB7XG4gICAgICAgIGJ1ZmZlcnMucHVzaCggYnVmZmVyICk7XG4gICAgICB9ICk7XG4gICAgICBwbmcub24oICdlbmQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5jb25jYXQoIGJ1ZmZlcnMgKTtcblxuICAgICAgICBjYWxsYmFjayggYnVmZmVyICk7XG4gICAgICB9ICk7XG4gICAgICBwbmcub24oICdlcnJvcicsICggZXJyOiBFcnJvciApID0+IHtcbiAgICAgICAgcmVqZWN0KCBlcnIgKTtcbiAgICAgIH0gKTtcblxuICAgICAgLy8ga2ljayBvZmYgdGhlIGVuY29kaW5nIG9mIHRoZSBQTkdcbiAgICAgIHBuZy5wYWNrKCk7XG4gICAgfVxuXG4gICAgLy8gY2FsbGVkIHdoZW4gb3VyIG1pcG1hcFswXSBsZXZlbCBpcyBsb2FkZWQgYnkgZGVjb2RpbmcgdGhlIG1haW4gaW1hZ2UgKGNyZWF0ZXMgdGhlIG1pcG1hcCBsZXZlbHMpXG4gICAgZnVuY3Rpb24gc3RhcnRNaXBtYXBDcmVhdGlvbigpOiB2b2lkIHtcbiAgICAgIC8vIFdoZW4gcmVkdWNlZCB0byAwLCB3ZSdsbCBiZSBkb25lIHdpdGggZW5jb2RpbmcgKGFuZCBjYW4gY2FsbCBvdXIgY2FsbGJhY2spLiBOZWVkZWQgYmVjYXVzZSB0aGV5IGFyZSBhc3luY2hyb25vdXMuXG4gICAgICBsZXQgZW5jb2RlQ291bnRlciA9IDE7XG5cbiAgICAgIC8vIEFscGhhIGRldGVjdGlvbiBvbiB0aGUgbGV2ZWwtMCBpbWFnZSB0byBzZWUgaWYgd2UgY2FuIHN3YXAganBnIGZvciBwbmdcbiAgICAgIGxldCBoYXNBbHBoYSA9IGZhbHNlO1xuICAgICAgZm9yICggbGV0IGkgPSAzOyBpIDwgbWlwbWFwc1sgMCBdLmRhdGEubGVuZ3RoOyBpICs9IDQgKSB7XG4gICAgICAgIGlmICggbWlwbWFwc1sgMCBdLmRhdGFbIGkgXSA8IDI1NSApIHtcbiAgICAgICAgICBoYXNBbHBoYSA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gY2FsbGVkIHdoZW4gYWxsIGVuY29kaW5nIGlzIGNvbXBsZXRlXG4gICAgICBmdW5jdGlvbiBlbmNvZGluZ0NvbXBsZXRlKCk6IHZvaWQge1xuXG4gICAgICAgIGdydW50LmxvZy52ZXJib3NlLndyaXRlbG4oIGBtaXBtYXBwZWQgJHtmaWxlbmFtZX0ke21heExldmVsID49IDAgPyBgIHRvIGxldmVsICR7bWF4TGV2ZWx9YCA6ICcnfSB3aXRoIHF1YWxpdHk6ICR7cXVhbGl0eX1gICk7XG5cbiAgICAgICAgZm9yICggbGV0IGxldmVsID0gMDsgbGV2ZWwgPCBtaXBtYXBzLmxlbmd0aDsgbGV2ZWwrKyApIHtcblxuICAgICAgICAgIC8vIGZvciBub3csIG1ha2UgLnVybCBwb2ludCB0byB0aGUgc21hbGxlc3Qgb2YgdGhlIHR3byAodW5sZXNzIHdlIGhhdmUgYW4gYWxwaGEgY2hhbm5lbCBuZWVkKVxuICAgICAgICAgIGNvbnN0IHVzZVBORyA9IGhhc0FscGhhIHx8IG1pcG1hcHNbIGxldmVsIF0uanBnVVJMIS5sZW5ndGggPiBtaXBtYXBzWyBsZXZlbCBdLnBuZ1VSTCEubGVuZ3RoO1xuICAgICAgICAgIG1pcG1hcHNbIGxldmVsIF0udXJsID0gdXNlUE5HID8gbWlwbWFwc1sgbGV2ZWwgXS5wbmdVUkwgOiBtaXBtYXBzWyBsZXZlbCBdLmpwZ1VSTDtcbiAgICAgICAgICBtaXBtYXBzWyBsZXZlbCBdLmJ1ZmZlciA9IHVzZVBORyA/IG1pcG1hcHNbIGxldmVsIF0ucG5nQnVmZmVyIDogbWlwbWFwc1sgbGV2ZWwgXS5qcGdCdWZmZXI7XG5cbiAgICAgICAgICBncnVudC5sb2cudmVyYm9zZS53cml0ZWxuKCBgbGV2ZWwgJHtsZXZlbH0gKCR7dXNlUE5HID8gJ1BORycgOiAnSlBHJ30gJHtcbiAgICAgICAgICAgICAgbWlwbWFwc1sgbGV2ZWwgXS53aWR0aH14JHttaXBtYXBzWyBsZXZlbCBdLmhlaWdodH0pIGJhc2U2NDogJHtcbiAgICAgICAgICAgICAgbWlwbWFwc1sgbGV2ZWwgXS51cmwhLmxlbmd0aH0gYnl0ZXMgYCApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzb2x2ZSggbWlwbWFwcyApO1xuICAgICAgfVxuXG4gICAgICAvLyBraWNrcyBvZmYgYXN5bmNocm9ub3VzIGVuY29kaW5nIGZvciBhIHNwZWNpZmljIGxldmVsXG4gICAgICBmdW5jdGlvbiBlbmNvZGVMZXZlbCggbGV2ZWw6IG51bWJlciApOiB2b2lkIHtcbiAgICAgICAgZW5jb2RlQ291bnRlcisrO1xuICAgICAgICBvdXRwdXRQTkcoIG1pcG1hcHNbIGxldmVsIF0uZGF0YSwgbWlwbWFwc1sgbGV2ZWwgXS53aWR0aCwgbWlwbWFwc1sgbGV2ZWwgXS5oZWlnaHQsIGJ1ZmZlciA9PiB7XG4gICAgICAgICAgbWlwbWFwc1sgbGV2ZWwgXS5wbmdCdWZmZXIgPSBidWZmZXI7XG4gICAgICAgICAgbWlwbWFwc1sgbGV2ZWwgXS5wbmdVUkwgPSBgZGF0YTppbWFnZS9wbmc7YmFzZTY0LCR7YnVmZmVyLnRvU3RyaW5nKCAnYmFzZTY0JyApfWA7XG4gICAgICAgICAgaWYgKCAtLWVuY29kZUNvdW50ZXIgPT09IDAgKSB7XG4gICAgICAgICAgICBlbmNvZGluZ0NvbXBsZXRlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9ICk7XG5cbiAgICAgICAgLy8gb25seSBlbmNvZGUgSlBFRyBpZiBpdCBoYXMgbm8gYWxwaGFcbiAgICAgICAgaWYgKCAhaGFzQWxwaGEgKSB7XG4gICAgICAgICAgZW5jb2RlQ291bnRlcisrO1xuICAgICAgICAgIG91dHB1dEpQRUcoIG1pcG1hcHNbIGxldmVsIF0uZGF0YSwgbWlwbWFwc1sgbGV2ZWwgXS53aWR0aCwgbWlwbWFwc1sgbGV2ZWwgXS5oZWlnaHQsIHF1YWxpdHksIGJ1ZmZlciA9PiB7XG4gICAgICAgICAgICBtaXBtYXBzWyBsZXZlbCBdLmpwZ0J1ZmZlciA9IGJ1ZmZlcjtcbiAgICAgICAgICAgIG1pcG1hcHNbIGxldmVsIF0uanBnVVJMID0gYGRhdGE6aW1hZ2UvanBlZztiYXNlNjQsJHtidWZmZXIudG9TdHJpbmcoICdiYXNlNjQnICl9YDtcbiAgICAgICAgICAgIGlmICggLS1lbmNvZGVDb3VudGVyID09PSAwICkge1xuICAgICAgICAgICAgICBlbmNvZGluZ0NvbXBsZXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGVuY29kZSBhbGwgbGV2ZWxzLCBhbmQgY29tcHV0ZSByYXN0ZXJzIGZvciBsZXZlbHMgMS1OXG4gICAgICBlbmNvZGVMZXZlbCggMCApO1xuXG4gICAgICBmdW5jdGlvbiBmaW5lc3RNaXBtYXAoKTogVE1pcG1hcCB7XG4gICAgICAgIHJldHVybiBtaXBtYXBzWyBtaXBtYXBzLmxlbmd0aCAtIDEgXTtcbiAgICAgIH1cblxuICAgICAgLy8gYmFpbCBpZiB3ZSBhbHJlYWR5IGhhdmUgYSAxeDEgaW1hZ2UsIG9yIGlmIHdlIHJlYWNoIHRoZSBtYXhMZXZlbCAocmVjYWxsIG1heExldmVsPT09LTEgbWVhbnMgbm8gbWF4aW11bSBsZXZlbClcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bm1vZGlmaWVkLWxvb3AtY29uZGl0aW9uXG4gICAgICB3aGlsZSAoICggbWlwbWFwcy5sZW5ndGggLSAxIDwgbWF4TGV2ZWwgfHwgbWF4TGV2ZWwgPCAwICkgJiYgKCBmaW5lc3RNaXBtYXAoKS53aWR0aCA+IDEgfHwgZmluZXN0TWlwbWFwKCkuaGVpZ2h0ID4gMSApICkge1xuICAgICAgICBjb25zdCBsZXZlbCA9IG1pcG1hcHMubGVuZ3RoO1xuICAgICAgICBtaXBtYXBzLnB1c2goIG1pcG1hcERvd25zY2FsZSggZmluZXN0TWlwbWFwKCksICggd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIEJ1ZmZlci5hbGxvYyggNCAqIHdpZHRoICogaGVpZ2h0ICk7XG4gICAgICAgIH0gKSApO1xuICAgICAgICBlbmNvZGVMZXZlbCggbGV2ZWwgKTtcbiAgICAgIH1cblxuICAgICAgLy8ganVzdCBpbiBjYXNlIGV2ZXJ5dGhpbmcgaGFwcGVuZWQgc3luY2hyb25vdXNseVxuICAgICAgaWYgKCAtLWVuY29kZUNvdW50ZXIgPT09IDAgKSB7XG4gICAgICAgIGVuY29kaW5nQ29tcGxldGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gKTtcbn0iXSwibmFtZXMiOlsiZnMiLCJtaXBtYXBEb3duc2NhbGUiLCJncnVudCIsImpwZWdKcyIsInJlcXVpcmUiLCJwbmdqcyIsImNyZWF0ZU1pcG1hcCIsImZpbGVuYW1lIiwibWF4TGV2ZWwiLCJxdWFsaXR5IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJtaXBtYXBzIiwic3VmZml4Iiwic2xpY2UiLCJsb2FkSlBFRyIsImxvYWRQTkciLCJFcnJvciIsImltYWdlRGF0YSIsImRlY29kZSIsInJlYWRGaWxlU3luYyIsInB1c2giLCJkYXRhIiwid2lkdGgiLCJoZWlnaHQiLCJzdGFydE1pcG1hcENyZWF0aW9uIiwic3JjIiwiY3JlYXRlUmVhZFN0cmVhbSIsImJhc2VQTkciLCJQTkciLCJvbiIsImVyciIsInBpcGUiLCJvdXRwdXRKUEVHIiwiY2FsbGJhY2siLCJlbmNvZGVkT3VwdXQiLCJlbmNvZGUiLCJvdXRwdXRQTkciLCJwbmciLCJjb3B5IiwibGVuZ3RoIiwiYnVmZmVycyIsImJ1ZmZlciIsIkJ1ZmZlciIsImNvbmNhdCIsInBhY2siLCJlbmNvZGVDb3VudGVyIiwiaGFzQWxwaGEiLCJpIiwiZW5jb2RpbmdDb21wbGV0ZSIsImxvZyIsInZlcmJvc2UiLCJ3cml0ZWxuIiwibGV2ZWwiLCJ1c2VQTkciLCJqcGdVUkwiLCJwbmdVUkwiLCJ1cmwiLCJwbmdCdWZmZXIiLCJqcGdCdWZmZXIiLCJlbmNvZGVMZXZlbCIsInRvU3RyaW5nIiwiZmluZXN0TWlwbWFwIiwiYWxsb2MiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RCxPQUFPQSxRQUFRLEtBQUs7QUFDcEIsT0FBT0MscUJBQXFCLGdEQUFnRDtBQUM1RSxPQUFPQyxXQUFXLHdEQUF3RDtBQUUxRSxNQUFNQyxTQUFTQyxRQUFTO0FBQ3hCLE1BQU1DLFFBQVFELFFBQVM7QUFjdkI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBNkJDLEdBQ0QsZUFBZSxTQUFTRSxhQUFjQyxRQUFnQixFQUFFQyxRQUFnQixFQUFFQyxPQUFlO0lBQ3ZGLE9BQU8sSUFBSUMs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