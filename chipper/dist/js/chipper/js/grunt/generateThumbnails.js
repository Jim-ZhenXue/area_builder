// Copyright 2017-2024, University of Colorado Boulder
/**
 * This grunt task generates 128x84 and 600x394 thumbnails of the sim's screenshot in assets.
 * Thumbnails are put in the build directory of the sim. If the directory doesn't exist, it is created.
 * New grunt tasks can easily be created to generate different sized images by passing this function
 * different heights and widths.
 *
 * @author Aaron Davis
 */ import jimp from 'jimp';
import grunt from '../../../perennial-alias/js/npm-dependencies/grunt.js';
/**
 * @param repo - name of the repository
 * @param width of the resized image
 * @param height of the resized image
 * @param quality - percent quality, in the range [0..100]
 * @param mime - Mime type - one of jimp.MIME_PNG, jimp.MIME_JPEG, jimp.MIME_BMP
 * @param altSuffix - ending for the filename e.g. -alt1
 * @returns Resolves to a {Buffer} with the image data
 */ export default function generateThumbnails(repo, width, height, quality, mime, altSuffix = undefined) {
    return new Promise((resolve, reject)=>{
        const fullResImageName = `../${repo}/assets/${repo}-screenshot${altSuffix || ''}.png`;
        if (!grunt.file.exists(fullResImageName)) {
            grunt.log.writeln(`no image file exists: ${fullResImageName}. Aborting generateThumbnails`);
            return;
        }
        new jimp(fullResImageName, function() {
            if (mime === jimp.MIME_JPEG) {
                this.quality(quality);
            }
            this.resize(width, height).getBuffer(mime, (error, buffer)=>{
                if (error) {
                    reject(new Error(error));
                } else {
                    resolve(buffer);
                }
            });
        });
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L2dlbmVyYXRlVGh1bWJuYWlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBUaGlzIGdydW50IHRhc2sgZ2VuZXJhdGVzIDEyOHg4NCBhbmQgNjAweDM5NCB0aHVtYm5haWxzIG9mIHRoZSBzaW0ncyBzY3JlZW5zaG90IGluIGFzc2V0cy5cbiAqIFRodW1ibmFpbHMgYXJlIHB1dCBpbiB0aGUgYnVpbGQgZGlyZWN0b3J5IG9mIHRoZSBzaW0uIElmIHRoZSBkaXJlY3RvcnkgZG9lc24ndCBleGlzdCwgaXQgaXMgY3JlYXRlZC5cbiAqIE5ldyBncnVudCB0YXNrcyBjYW4gZWFzaWx5IGJlIGNyZWF0ZWQgdG8gZ2VuZXJhdGUgZGlmZmVyZW50IHNpemVkIGltYWdlcyBieSBwYXNzaW5nIHRoaXMgZnVuY3Rpb25cbiAqIGRpZmZlcmVudCBoZWlnaHRzIGFuZCB3aWR0aHMuXG4gKlxuICogQGF1dGhvciBBYXJvbiBEYXZpc1xuICovXG5cbmltcG9ydCBqaW1wIGZyb20gJ2ppbXAnO1xuaW1wb3J0IGdydW50IGZyb20gJy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ucG0tZGVwZW5kZW5jaWVzL2dydW50LmpzJztcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xuXG4vKipcbiAqIEBwYXJhbSByZXBvIC0gbmFtZSBvZiB0aGUgcmVwb3NpdG9yeVxuICogQHBhcmFtIHdpZHRoIG9mIHRoZSByZXNpemVkIGltYWdlXG4gKiBAcGFyYW0gaGVpZ2h0IG9mIHRoZSByZXNpemVkIGltYWdlXG4gKiBAcGFyYW0gcXVhbGl0eSAtIHBlcmNlbnQgcXVhbGl0eSwgaW4gdGhlIHJhbmdlIFswLi4xMDBdXG4gKiBAcGFyYW0gbWltZSAtIE1pbWUgdHlwZSAtIG9uZSBvZiBqaW1wLk1JTUVfUE5HLCBqaW1wLk1JTUVfSlBFRywgamltcC5NSU1FX0JNUFxuICogQHBhcmFtIGFsdFN1ZmZpeCAtIGVuZGluZyBmb3IgdGhlIGZpbGVuYW1lIGUuZy4gLWFsdDFcbiAqIEByZXR1cm5zIFJlc29sdmVzIHRvIGEge0J1ZmZlcn0gd2l0aCB0aGUgaW1hZ2UgZGF0YVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZW5lcmF0ZVRodW1ibmFpbHMoIHJlcG86IHN0cmluZywgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIHF1YWxpdHk6IG51bWJlciwgbWltZTogc3RyaW5nLCBhbHRTdWZmaXg6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCApOiBQcm9taXNlPEJ1ZmZlcj4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xuICAgIGNvbnN0IGZ1bGxSZXNJbWFnZU5hbWUgPSBgLi4vJHtyZXBvfS9hc3NldHMvJHtyZXBvfS1zY3JlZW5zaG90JHthbHRTdWZmaXggfHwgJyd9LnBuZ2A7XG5cbiAgICBpZiAoICFncnVudC5maWxlLmV4aXN0cyggZnVsbFJlc0ltYWdlTmFtZSApICkge1xuICAgICAgZ3J1bnQubG9nLndyaXRlbG4oIGBubyBpbWFnZSBmaWxlIGV4aXN0czogJHtmdWxsUmVzSW1hZ2VOYW1lfS4gQWJvcnRpbmcgZ2VuZXJhdGVUaHVtYm5haWxzYCApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG5ldyBqaW1wKCBmdWxsUmVzSW1hZ2VOYW1lLCBmdW5jdGlvbiggdGhpczogSW50ZW50aW9uYWxBbnkgKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbmV3XG4gICAgICBpZiAoIG1pbWUgPT09IGppbXAuTUlNRV9KUEVHICkge1xuICAgICAgICB0aGlzLnF1YWxpdHkoIHF1YWxpdHkgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVzaXplKCB3aWR0aCwgaGVpZ2h0ICkuZ2V0QnVmZmVyKCBtaW1lLCAoIGVycm9yOiBzdHJpbmcsIGJ1ZmZlcjogQnVmZmVyICkgPT4ge1xuICAgICAgICBpZiAoIGVycm9yICkge1xuICAgICAgICAgIHJlamVjdCggbmV3IEVycm9yKCBlcnJvciApICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZSggYnVmZmVyICk7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICB9ICk7XG4gIH0gKTtcbn0iXSwibmFtZXMiOlsiamltcCIsImdydW50IiwiZ2VuZXJhdGVUaHVtYm5haWxzIiwicmVwbyIsIndpZHRoIiwiaGVpZ2h0IiwicXVhbGl0eSIsIm1pbWUiLCJhbHRTdWZmaXgiLCJ1bmRlZmluZWQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImZ1bGxSZXNJbWFnZU5hbWUiLCJmaWxlIiwiZXhpc3RzIiwibG9nIiwid3JpdGVsbiIsIk1JTUVfSlBFRyIsInJlc2l6ZSIsImdldEJ1ZmZlciIsImVycm9yIiwiYnVmZmVyIiwiRXJyb3IiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7OztDQU9DLEdBRUQsT0FBT0EsVUFBVSxPQUFPO0FBQ3hCLE9BQU9DLFdBQVcsd0RBQXdEO0FBRzFFOzs7Ozs7OztDQVFDLEdBQ0QsZUFBZSxTQUFTQyxtQkFBb0JDLElBQVksRUFBRUMsS0FBYSxFQUFFQyxNQUFjLEVBQUVDLE9BQWUsRUFBRUMsSUFBWSxFQUFFQyxZQUFnQ0MsU0FBUztJQUMvSixPQUFPLElBQUlDLFFBQVMsQ0FBRUMsU0FBU0M7UUFDN0IsTUFBTUMsbUJBQW1CLENBQUMsR0FBRyxFQUFFVixLQUFLLFFBQVEsRUFBRUEsS0FBSyxXQUFXLEVBQUVLLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFFckYsSUFBSyxDQUFDUCxNQUFNYSxJQUFJLENBQUNDLE1BQU0sQ0FBRUYsbUJBQXFCO1lBQzVDWixNQUFNZSxHQUFHLENBQUNDLE9BQU8sQ0FBRSxDQUFDLHNCQUFzQixFQUFFSixpQkFBaUIsNkJBQTZCLENBQUM7WUFDM0Y7UUFDRjtRQUVBLElBQUliLEtBQU1hLGtCQUFrQjtZQUMxQixJQUFLTixTQUFTUCxLQUFLa0IsU0FBUyxFQUFHO2dCQUM3QixJQUFJLENBQUNaLE9BQU8sQ0FBRUE7WUFDaEI7WUFDQSxJQUFJLENBQUNhLE1BQU0sQ0FBRWYsT0FBT0MsUUFBU2UsU0FBUyxDQUFFYixNQUFNLENBQUVjLE9BQWVDO2dCQUM3RCxJQUFLRCxPQUFRO29CQUNYVCxPQUFRLElBQUlXLE1BQU9GO2dCQUNyQixPQUNLO29CQUNIVixRQUFTVztnQkFDWDtZQUNGO1FBQ0Y7SUFDRjtBQUNGIn0=