// Copyright 2013-2021, University of Colorado Boulder
/**
 * Feature detection
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import detectPrefix from '../../../phet-core/js/detectPrefix.js';
import { scenery } from '../imports.js';
const Features = {};
scenery.register('Features', Features);
function supportsDataURLFormatOutput(format) {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const context = canvas.getContext('2d');
        context.fillStyle = 'black';
        context.fillRect(0, 0, 1, 1);
        const url = canvas.toDataURL([
            format
        ]);
        const target = `data:${format}`;
        // var pngFallback = 'data:image/png';
        return url.slice(0, target.length) === target;
    } catch (e) {
        return false;
    }
}
function supportsDataURLFormatOrigin(name, black1x1Url) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext('2d');
    const img = document.createElement('img');
    img.crossOrigin = 'Anonymous'; // maybe setting the CORS attribute will help?
    const loadCall = ()=>{
        try {
            context.drawImage(img, 0, 0);
            canvas.toDataURL();
            Features[name] = true;
        } catch (e) {
            Features[name] = false;
        }
    };
    img.onload = loadCall;
    try {
        img.src = black1x1Url;
        if (img.complete) {
            loadCall();
        }
    } catch (e) {
        Features[name] = false;
    }
}
Features.canvasPNGOutput = supportsDataURLFormatOutput('image/png');
Features.canvasJPEGOutput = supportsDataURLFormatOutput('image/jpeg');
Features.canvasGIFOutput = supportsDataURLFormatOutput('image/gif');
Features.canvasICONOutput = supportsDataURLFormatOutput('image/x-icon');
// 1x1 black output from Chrome Canvas in PNG
supportsDataURLFormatOrigin('canvasPNGInput', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NkYGD4DwABCQEBtxmN7wAAAABJRU5ErkJggg==');
// 1x1 black output from Chrome Canvas in JPEG
supportsDataURLFormatOrigin('canvasJPEGInput', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD8qqKKKAP/2Q==');
/*
 * This is from the following SVG:
 *
 * <?xml version="1.0"?>
 * <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewport="0 0 1 1" width="1" height="1" >
 *   <rect x="0" y="0" width="1" height="1" rx="0" ry="0" style="fill: black; stroke: none;"></rect>
 * </svg>
 */ supportsDataURLFormatOrigin('canvasSVGInput', 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+DQo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3cG9ydD0iMCAwIDEgMSIgd2lkdGg9IjEiIGhlaWdodD0iMSIgPg0KICA8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiByeD0iMCIgcnk9IjAiIHN0eWxlPSJmaWxsOiBibGFjazsgc3Ryb2tlOiBub25lOyI+PC9yZWN0Pg0KPC9zdmc+DQo=');
// 1x1 black output from Photoshop in GIF
supportsDataURLFormatOrigin('canvasGIFInput', 'data:image/gif;base64,R0lGODlhAQABAJEAAAAAAP///////wAAACH5BAEAAAIALAAAAAABAAEAAAICRAEAOw==');
// canvas prefixed names
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
Features.toDataURLHD = detectPrefix(canvas, 'toDataURLHD');
Features.createImageDataHD = detectPrefix(ctx, 'createImageDataHD');
Features.getImageDataHD = detectPrefix(ctx, 'getImageDataHD');
Features.putImageDataHD = detectPrefix(ctx, 'putImageDataHD');
Features.currentTransform = detectPrefix(ctx, 'currentTransform');
Features.canvasFilter = detectPrefix(ctx, 'filter');
const span = document.createElement('span');
const div = document.createElement('div');
Features.textStroke = detectPrefix(span.style, 'textStroke');
Features.textStrokeColor = detectPrefix(span.style, 'textStrokeColor');
Features.textStrokeWidth = detectPrefix(span.style, 'textStrokeWidth');
Features.transform = detectPrefix(div.style, 'transform');
Features.transformOrigin = detectPrefix(div.style, 'transformOrigin');
Features.backfaceVisibility = detectPrefix(div.style, 'backfaceVisibility');
Features.borderRadius = detectPrefix(div.style, 'borderRadius');
Features.userSelect = detectPrefix(div.style, 'userSelect');
Features.touchAction = detectPrefix(div.style, 'touchAction');
Features.touchCallout = detectPrefix(div.style, 'touchCallout');
Features.userDrag = detectPrefix(div.style, 'userDrag');
Features.tapHighlightColor = detectPrefix(div.style, 'tapHighlightColor');
Features.fontSmoothing = detectPrefix(div.style, 'fontSmoothing');
Features.requestAnimationFrame = detectPrefix(window, 'requestAnimationFrame');
Features.cancelAnimationFrame = detectPrefix(window, 'cancelAnimationFrame');
// e.g. Features.setStyle( domElement, Features.transform, '...' ), and doesn't set it if no 'transform' attribute (prefixed or no) is found
Features.setStyle = (domElement, optionalKey, value)=>{
    if (optionalKey !== undefined) {
        domElement.style[optionalKey] = value;
    }
};
// Whether passive is a supported option for adding event listeners,
// see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Improving_scrolling_performance_with_passive_listeners
Features.passive = false;
window.addEventListener('test', null, Object.defineProperty({}, 'passive', {
    get: ()=>{
        Features.passive = true;
    }
}));
export default Features;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9GZWF0dXJlcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBGZWF0dXJlIGRldGVjdGlvblxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgZGV0ZWN0UHJlZml4IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9kZXRlY3RQcmVmaXguanMnO1xuaW1wb3J0IHsgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5jb25zdCBGZWF0dXJlcyA9IHt9O1xuc2NlbmVyeS5yZWdpc3RlciggJ0ZlYXR1cmVzJywgRmVhdHVyZXMgKTtcblxuZnVuY3Rpb24gc3VwcG9ydHNEYXRhVVJMRm9ybWF0T3V0cHV0KCBmb3JtYXQgKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcbiAgICBjYW52YXMud2lkdGggPSAxO1xuICAgIGNhbnZhcy5oZWlnaHQgPSAxO1xuICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApO1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ2JsYWNrJztcbiAgICBjb250ZXh0LmZpbGxSZWN0KCAwLCAwLCAxLCAxICk7XG4gICAgY29uc3QgdXJsID0gY2FudmFzLnRvRGF0YVVSTCggWyBmb3JtYXQgXSApO1xuXG4gICAgY29uc3QgdGFyZ2V0ID0gYGRhdGE6JHtmb3JtYXR9YDtcbiAgICAvLyB2YXIgcG5nRmFsbGJhY2sgPSAnZGF0YTppbWFnZS9wbmcnO1xuXG4gICAgcmV0dXJuIHVybC5zbGljZSggMCwgdGFyZ2V0Lmxlbmd0aCApID09PSB0YXJnZXQ7XG4gIH1cbiAgY2F0Y2goIGUgKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIHN1cHBvcnRzRGF0YVVSTEZvcm1hdE9yaWdpbiggbmFtZSwgYmxhY2sxeDFVcmwgKSB7XG4gIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG4gIGNhbnZhcy53aWR0aCA9IDE7XG4gIGNhbnZhcy5oZWlnaHQgPSAxO1xuICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcblxuICBjb25zdCBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnaW1nJyApO1xuICBpbWcuY3Jvc3NPcmlnaW4gPSAnQW5vbnltb3VzJzsgLy8gbWF5YmUgc2V0dGluZyB0aGUgQ09SUyBhdHRyaWJ1dGUgd2lsbCBoZWxwP1xuXG4gIGNvbnN0IGxvYWRDYWxsID0gKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb250ZXh0LmRyYXdJbWFnZSggaW1nLCAwLCAwICk7XG4gICAgICBjYW52YXMudG9EYXRhVVJMKCk7XG4gICAgICBGZWF0dXJlc1sgbmFtZSBdID0gdHJ1ZTtcbiAgICB9XG4gICAgY2F0Y2goIGUgKSB7XG4gICAgICBGZWF0dXJlc1sgbmFtZSBdID0gZmFsc2U7XG4gICAgfVxuICB9O1xuICBpbWcub25sb2FkID0gbG9hZENhbGw7XG4gIHRyeSB7XG4gICAgaW1nLnNyYyA9IGJsYWNrMXgxVXJsO1xuICAgIGlmICggaW1nLmNvbXBsZXRlICkge1xuICAgICAgbG9hZENhbGwoKTtcbiAgICB9XG4gIH1cbiAgY2F0Y2goIGUgKSB7XG4gICAgRmVhdHVyZXNbIG5hbWUgXSA9IGZhbHNlO1xuICB9XG59XG5cbkZlYXR1cmVzLmNhbnZhc1BOR091dHB1dCA9IHN1cHBvcnRzRGF0YVVSTEZvcm1hdE91dHB1dCggJ2ltYWdlL3BuZycgKTtcbkZlYXR1cmVzLmNhbnZhc0pQRUdPdXRwdXQgPSBzdXBwb3J0c0RhdGFVUkxGb3JtYXRPdXRwdXQoICdpbWFnZS9qcGVnJyApO1xuRmVhdHVyZXMuY2FudmFzR0lGT3V0cHV0ID0gc3VwcG9ydHNEYXRhVVJMRm9ybWF0T3V0cHV0KCAnaW1hZ2UvZ2lmJyApO1xuRmVhdHVyZXMuY2FudmFzSUNPTk91dHB1dCA9IHN1cHBvcnRzRGF0YVVSTEZvcm1hdE91dHB1dCggJ2ltYWdlL3gtaWNvbicgKTtcblxuLy8gMXgxIGJsYWNrIG91dHB1dCBmcm9tIENocm9tZSBDYW52YXMgaW4gUE5HXG5zdXBwb3J0c0RhdGFVUkxGb3JtYXRPcmlnaW4oICdjYW52YXNQTkdJbnB1dCcsICdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFFQUFBQUJDQVlBQUFBZkZjU0pBQUFBRFVsRVFWUUlXMk5rWUdENER3QUJDUUVCdHhtTjd3QUFBQUJKUlU1RXJrSmdnZz09JyApO1xuXG4vLyAxeDEgYmxhY2sgb3V0cHV0IGZyb20gQ2hyb21lIENhbnZhcyBpbiBKUEVHXG5zdXBwb3J0c0RhdGFVUkxGb3JtYXRPcmlnaW4oICdjYW52YXNKUEVHSW5wdXQnLCAnZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCwvOWovNEFBUVNrWkpSZ0FCQVFBQUFRQUJBQUQvMndCREFBTUNBZ0lDQWdNQ0FnSURBd01EQkFZRUJBUUVCQWdHQmdVR0NRZ0tDZ2tJQ1FrS0RBOE1DZ3NPQ3drSkRSRU5EZzhRRUJFUUNnd1NFeElRRXc4UUVCRC8yd0JEQVFNREF3UURCQWdFQkFnUUN3a0xFQkFRRUJBUUVCQVFFQkFRRUJBUUVCQVFFQkFRRUJBUUVCQVFFQkFRRUJBUUVCQVFFQkFRRUJBUUVCQVFFQkFRRUJEL3dBQVJDQUFCQUFFREFTSUFBaEVCQXhFQi84UUFId0FBQVFVQkFRRUJBUUVBQUFBQUFBQUFBQUVDQXdRRkJnY0lDUW9MLzhRQXRSQUFBZ0VEQXdJRUF3VUZCQVFBQUFGOUFRSURBQVFSQlJJaE1VRUdFMUZoQnlKeEZES0JrYUVJSTBLeHdSVlMwZkFrTTJKeWdna0tGaGNZR1JvbEppY29LU28wTlRZM09EazZRMFJGUmtkSVNVcFRWRlZXVjFoWldtTmtaV1puYUdscWMzUjFkbmQ0ZVhxRGhJV0doNGlKaXBLVGxKV1dsNWlabXFLanBLV21wNmlwcXJLenRMVzJ0N2k1dXNMRHhNWEd4OGpKeXRMVDFOWFcxOWpaMnVIaTQrVGw1dWZvNmVyeDh2UDA5ZmIzK1BuNi84UUFId0VBQXdFQkFRRUJBUUVCQVFBQUFBQUFBQUVDQXdRRkJnY0lDUW9MLzhRQXRSRUFBZ0VDQkFRREJBY0ZCQVFBQVFKM0FBRUNBeEVFQlNFeEJoSkJVUWRoY1JNaU1vRUlGRUtSb2JIQkNTTXpVdkFWWW5MUkNoWWtOT0VsOFJjWUdSb21KeWdwS2pVMk56ZzVPa05FUlVaSFNFbEtVMVJWVmxkWVdWcGpaR1ZtWjJocGFuTjBkWFozZUhsNmdvT0VoWWFIaUltS2twT1VsWmFYbUptYW9xT2twYWFucUttcXNyTzB0YmEzdUxtNndzUEV4Y2JIeU1uSzB0UFUxZGJYMk5uYTR1UGs1ZWJuNk9ucTh2UDA5ZmIzK1BuNi85b0FEQU1CQUFJUkF4RUFQd0Q4cXFLS0tBUC8yUT09JyApO1xuXG4vKlxuICogVGhpcyBpcyBmcm9tIHRoZSBmb2xsb3dpbmcgU1ZHOlxuICpcbiAqIDw/eG1sIHZlcnNpb249XCIxLjBcIj8+XG4gKiA8c3ZnIHZlcnNpb249XCIxLjFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld3BvcnQ9XCIwIDAgMSAxXCIgd2lkdGg9XCIxXCIgaGVpZ2h0PVwiMVwiID5cbiAqICAgPHJlY3QgeD1cIjBcIiB5PVwiMFwiIHdpZHRoPVwiMVwiIGhlaWdodD1cIjFcIiByeD1cIjBcIiByeT1cIjBcIiBzdHlsZT1cImZpbGw6IGJsYWNrOyBzdHJva2U6IG5vbmU7XCI+PC9yZWN0PlxuICogPC9zdmc+XG4gKi9cbnN1cHBvcnRzRGF0YVVSTEZvcm1hdE9yaWdpbiggJ2NhbnZhc1NWR0lucHV0JywgJ2RhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEQ5NGJXd2dkbVZ5YzJsdmJqMGlNUzR3SWo4K0RRbzhjM1puSUhabGNuTnBiMjQ5SWpFdU1TSWdlRzFzYm5NOUltaDBkSEE2THk5M2QzY3Vkek11YjNKbkx6SXdNREF2YzNabklpQjJhV1YzY0c5eWREMGlNQ0F3SURFZ01TSWdkMmxrZEdnOUlqRWlJR2hsYVdkb2REMGlNU0lnUGcwS0lDQThjbVZqZENCNFBTSXdJaUI1UFNJd0lpQjNhV1IwYUQwaU1TSWdhR1ZwWjJoMFBTSXhJaUJ5ZUQwaU1DSWdjbms5SWpBaUlITjBlV3hsUFNKbWFXeHNPaUJpYkdGamF6c2djM1J5YjJ0bE9pQnViMjVsT3lJK1BDOXlaV04wUGcwS1BDOXpkbWMrRFFvPScgKTtcblxuLy8gMXgxIGJsYWNrIG91dHB1dCBmcm9tIFBob3Rvc2hvcCBpbiBHSUZcbnN1cHBvcnRzRGF0YVVSTEZvcm1hdE9yaWdpbiggJ2NhbnZhc0dJRklucHV0JywgJ2RhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCxSMGxHT0RsaEFRQUJBSkVBQUFBQUFQLy8vLy8vL3dBQUFDSDVCQUVBQUFJQUxBQUFBQUFCQUFFQUFBSUNSQUVBT3c9PScgKTtcblxuLy8gY2FudmFzIHByZWZpeGVkIG5hbWVzXG5jb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xuY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcbkZlYXR1cmVzLnRvRGF0YVVSTEhEID0gZGV0ZWN0UHJlZml4KCBjYW52YXMsICd0b0RhdGFVUkxIRCcgKTtcbkZlYXR1cmVzLmNyZWF0ZUltYWdlRGF0YUhEID0gZGV0ZWN0UHJlZml4KCBjdHgsICdjcmVhdGVJbWFnZURhdGFIRCcgKTtcbkZlYXR1cmVzLmdldEltYWdlRGF0YUhEID0gZGV0ZWN0UHJlZml4KCBjdHgsICdnZXRJbWFnZURhdGFIRCcgKTtcbkZlYXR1cmVzLnB1dEltYWdlRGF0YUhEID0gZGV0ZWN0UHJlZml4KCBjdHgsICdwdXRJbWFnZURhdGFIRCcgKTtcbkZlYXR1cmVzLmN1cnJlbnRUcmFuc2Zvcm0gPSBkZXRlY3RQcmVmaXgoIGN0eCwgJ2N1cnJlbnRUcmFuc2Zvcm0nICk7XG5GZWF0dXJlcy5jYW52YXNGaWx0ZXIgPSBkZXRlY3RQcmVmaXgoIGN0eCwgJ2ZpbHRlcicgKTtcblxuY29uc3Qgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdzcGFuJyApO1xuY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcbkZlYXR1cmVzLnRleHRTdHJva2UgPSBkZXRlY3RQcmVmaXgoIHNwYW4uc3R5bGUsICd0ZXh0U3Ryb2tlJyApO1xuRmVhdHVyZXMudGV4dFN0cm9rZUNvbG9yID0gZGV0ZWN0UHJlZml4KCBzcGFuLnN0eWxlLCAndGV4dFN0cm9rZUNvbG9yJyApO1xuRmVhdHVyZXMudGV4dFN0cm9rZVdpZHRoID0gZGV0ZWN0UHJlZml4KCBzcGFuLnN0eWxlLCAndGV4dFN0cm9rZVdpZHRoJyApO1xuXG5GZWF0dXJlcy50cmFuc2Zvcm0gPSBkZXRlY3RQcmVmaXgoIGRpdi5zdHlsZSwgJ3RyYW5zZm9ybScgKTtcbkZlYXR1cmVzLnRyYW5zZm9ybU9yaWdpbiA9IGRldGVjdFByZWZpeCggZGl2LnN0eWxlLCAndHJhbnNmb3JtT3JpZ2luJyApO1xuRmVhdHVyZXMuYmFja2ZhY2VWaXNpYmlsaXR5ID0gZGV0ZWN0UHJlZml4KCBkaXYuc3R5bGUsICdiYWNrZmFjZVZpc2liaWxpdHknICk7XG5GZWF0dXJlcy5ib3JkZXJSYWRpdXMgPSBkZXRlY3RQcmVmaXgoIGRpdi5zdHlsZSwgJ2JvcmRlclJhZGl1cycgKTtcblxuRmVhdHVyZXMudXNlclNlbGVjdCA9IGRldGVjdFByZWZpeCggZGl2LnN0eWxlLCAndXNlclNlbGVjdCcgKTtcbkZlYXR1cmVzLnRvdWNoQWN0aW9uID0gZGV0ZWN0UHJlZml4KCBkaXYuc3R5bGUsICd0b3VjaEFjdGlvbicgKTtcbkZlYXR1cmVzLnRvdWNoQ2FsbG91dCA9IGRldGVjdFByZWZpeCggZGl2LnN0eWxlLCAndG91Y2hDYWxsb3V0JyApO1xuRmVhdHVyZXMudXNlckRyYWcgPSBkZXRlY3RQcmVmaXgoIGRpdi5zdHlsZSwgJ3VzZXJEcmFnJyApO1xuRmVhdHVyZXMudGFwSGlnaGxpZ2h0Q29sb3IgPSBkZXRlY3RQcmVmaXgoIGRpdi5zdHlsZSwgJ3RhcEhpZ2hsaWdodENvbG9yJyApO1xuXG5GZWF0dXJlcy5mb250U21vb3RoaW5nID0gZGV0ZWN0UHJlZml4KCBkaXYuc3R5bGUsICdmb250U21vb3RoaW5nJyApO1xuXG5GZWF0dXJlcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBkZXRlY3RQcmVmaXgoIHdpbmRvdywgJ3JlcXVlc3RBbmltYXRpb25GcmFtZScgKTtcbkZlYXR1cmVzLmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZGV0ZWN0UHJlZml4KCB3aW5kb3csICdjYW5jZWxBbmltYXRpb25GcmFtZScgKTtcblxuXG4vLyBlLmcuIEZlYXR1cmVzLnNldFN0eWxlKCBkb21FbGVtZW50LCBGZWF0dXJlcy50cmFuc2Zvcm0sICcuLi4nICksIGFuZCBkb2Vzbid0IHNldCBpdCBpZiBubyAndHJhbnNmb3JtJyBhdHRyaWJ1dGUgKHByZWZpeGVkIG9yIG5vKSBpcyBmb3VuZFxuRmVhdHVyZXMuc2V0U3R5bGUgPSAoIGRvbUVsZW1lbnQsIG9wdGlvbmFsS2V5LCB2YWx1ZSApID0+IHtcbiAgaWYgKCBvcHRpb25hbEtleSAhPT0gdW5kZWZpbmVkICkge1xuICAgIGRvbUVsZW1lbnQuc3R5bGVbIG9wdGlvbmFsS2V5IF0gPSB2YWx1ZTtcbiAgfVxufTtcblxuLy8gV2hldGhlciBwYXNzaXZlIGlzIGEgc3VwcG9ydGVkIG9wdGlvbiBmb3IgYWRkaW5nIGV2ZW50IGxpc3RlbmVycyxcbi8vIHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRXZlbnRUYXJnZXQvYWRkRXZlbnRMaXN0ZW5lciNJbXByb3Zpbmdfc2Nyb2xsaW5nX3BlcmZvcm1hbmNlX3dpdGhfcGFzc2l2ZV9saXN0ZW5lcnNcbkZlYXR1cmVzLnBhc3NpdmUgPSBmYWxzZTtcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAndGVzdCcsIG51bGwsIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgge30sICdwYXNzaXZlJywge1xuICBnZXQ6ICgpID0+IHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBnZXR0ZXItcmV0dXJuXG4gICAgRmVhdHVyZXMucGFzc2l2ZSA9IHRydWU7XG4gIH1cbn0gKSApO1xuXG5leHBvcnQgZGVmYXVsdCBGZWF0dXJlczsiXSwibmFtZXMiOlsiZGV0ZWN0UHJlZml4Iiwic2NlbmVyeSIsIkZlYXR1cmVzIiwicmVnaXN0ZXIiLCJzdXBwb3J0c0RhdGFVUkxGb3JtYXRPdXRwdXQiLCJmb3JtYXQiLCJjYW52YXMiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJ3aWR0aCIsImhlaWdodCIsImNvbnRleHQiLCJnZXRDb250ZXh0IiwiZmlsbFN0eWxlIiwiZmlsbFJlY3QiLCJ1cmwiLCJ0b0RhdGFVUkwiLCJ0YXJnZXQiLCJzbGljZSIsImxlbmd0aCIsImUiLCJzdXBwb3J0c0RhdGFVUkxGb3JtYXRPcmlnaW4iLCJuYW1lIiwiYmxhY2sxeDFVcmwiLCJpbWciLCJjcm9zc09yaWdpbiIsImxvYWRDYWxsIiwiZHJhd0ltYWdlIiwib25sb2FkIiwic3JjIiwiY29tcGxldGUiLCJjYW52YXNQTkdPdXRwdXQiLCJjYW52YXNKUEVHT3V0cHV0IiwiY2FudmFzR0lGT3V0cHV0IiwiY2FudmFzSUNPTk91dHB1dCIsImN0eCIsInRvRGF0YVVSTEhEIiwiY3JlYXRlSW1hZ2VEYXRhSEQiLCJnZXRJbWFnZURhdGFIRCIsInB1dEltYWdlRGF0YUhEIiwiY3VycmVudFRyYW5zZm9ybSIsImNhbnZhc0ZpbHRlciIsInNwYW4iLCJkaXYiLCJ0ZXh0U3Ryb2tlIiwic3R5bGUiLCJ0ZXh0U3Ryb2tlQ29sb3IiLCJ0ZXh0U3Ryb2tlV2lkdGgiLCJ0cmFuc2Zvcm0iLCJ0cmFuc2Zvcm1PcmlnaW4iLCJiYWNrZmFjZVZpc2liaWxpdHkiLCJib3JkZXJSYWRpdXMiLCJ1c2VyU2VsZWN0IiwidG91Y2hBY3Rpb24iLCJ0b3VjaENhbGxvdXQiLCJ1c2VyRHJhZyIsInRhcEhpZ2hsaWdodENvbG9yIiwiZm9udFNtb290aGluZyIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsIndpbmRvdyIsImNhbmNlbEFuaW1hdGlvbkZyYW1lIiwic2V0U3R5bGUiLCJkb21FbGVtZW50Iiwib3B0aW9uYWxLZXkiLCJ2YWx1ZSIsInVuZGVmaW5lZCIsInBhc3NpdmUiLCJhZGRFdmVudExpc3RlbmVyIiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydHkiLCJnZXQiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0Esa0JBQWtCLHdDQUF3QztBQUNqRSxTQUFTQyxPQUFPLFFBQVEsZ0JBQWdCO0FBRXhDLE1BQU1DLFdBQVcsQ0FBQztBQUNsQkQsUUFBUUUsUUFBUSxDQUFFLFlBQVlEO0FBRTlCLFNBQVNFLDRCQUE2QkMsTUFBTTtJQUMxQyxJQUFJO1FBQ0YsTUFBTUMsU0FBU0MsU0FBU0MsYUFBYSxDQUFFO1FBQ3ZDRixPQUFPRyxLQUFLLEdBQUc7UUFDZkgsT0FBT0ksTUFBTSxHQUFHO1FBQ2hCLE1BQU1DLFVBQVVMLE9BQU9NLFVBQVUsQ0FBRTtRQUNuQ0QsUUFBUUUsU0FBUyxHQUFHO1FBQ3BCRixRQUFRRyxRQUFRLENBQUUsR0FBRyxHQUFHLEdBQUc7UUFDM0IsTUFBTUMsTUFBTVQsT0FBT1UsU0FBUyxDQUFFO1lBQUVYO1NBQVE7UUFFeEMsTUFBTVksU0FBUyxDQUFDLEtBQUssRUFBRVosUUFBUTtRQUMvQixzQ0FBc0M7UUFFdEMsT0FBT1UsSUFBSUcsS0FBSyxDQUFFLEdBQUdELE9BQU9FLE1BQU0sTUFBT0Y7SUFDM0MsRUFDQSxPQUFPRyxHQUFJO1FBQ1QsT0FBTztJQUNUO0FBQ0Y7QUFFQSxTQUFTQyw0QkFBNkJDLElBQUksRUFBRUMsV0FBVztJQUNyRCxNQUFNakIsU0FBU0MsU0FBU0MsYUFBYSxDQUFFO0lBQ3ZDRixPQUFPRyxLQUFLLEdBQUc7SUFDZkgsT0FBT0ksTUFBTSxHQUFHO0lBQ2hCLE1BQU1DLFVBQVVMLE9BQU9NLFVBQVUsQ0FBRTtJQUVuQyxNQUFNWSxNQUFNakIsU0FBU0MsYUFBYSxDQUFFO0lBQ3BDZ0IsSUFBSUMsV0FBVyxHQUFHLGFBQWEsOENBQThDO0lBRTdFLE1BQU1DLFdBQVc7UUFDZixJQUFJO1lBQ0ZmLFFBQVFnQixTQUFTLENBQUVILEtBQUssR0FBRztZQUMzQmxCLE9BQU9VLFNBQVM7WUFDaEJkLFFBQVEsQ0FBRW9CLEtBQU0sR0FBRztRQUNyQixFQUNBLE9BQU9GLEdBQUk7WUFDVGxCLFFBQVEsQ0FBRW9CLEtBQU0sR0FBRztRQUNyQjtJQUNGO0lBQ0FFLElBQUlJLE1BQU0sR0FBR0Y7SUFDYixJQUFJO1FBQ0ZGLElBQUlLLEdBQUcsR0FBR047UUFDVixJQUFLQyxJQUFJTSxRQUFRLEVBQUc7WUFDbEJKO1FBQ0Y7SUFDRixFQUNBLE9BQU9OLEdBQUk7UUFDVGxCLFFBQVEsQ0FBRW9CLEtBQU0sR0FBRztJQUNyQjtBQUNGO0FBRUFwQixTQUFTNkIsZUFBZSxHQUFHM0IsNEJBQTZCO0FBQ3hERixTQUFTOEIsZ0JBQWdCLEdBQUc1Qiw0QkFBNkI7QUFDekRGLFNBQVMrQixlQUFlLEdBQUc3Qiw0QkFBNkI7QUFDeERGLFNBQVNnQyxnQkFBZ0IsR0FBRzlCLDRCQUE2QjtBQUV6RCw2Q0FBNkM7QUFDN0NpQiw0QkFBNkIsa0JBQWtCO0FBRS9DLDhDQUE4QztBQUM5Q0EsNEJBQTZCLG1CQUFtQjtBQUVoRDs7Ozs7OztDQU9DLEdBQ0RBLDRCQUE2QixrQkFBa0I7QUFFL0MseUNBQXlDO0FBQ3pDQSw0QkFBNkIsa0JBQWtCO0FBRS9DLHdCQUF3QjtBQUN4QixNQUFNZixTQUFTQyxTQUFTQyxhQUFhLENBQUU7QUFDdkMsTUFBTTJCLE1BQU03QixPQUFPTSxVQUFVLENBQUU7QUFDL0JWLFNBQVNrQyxXQUFXLEdBQUdwQyxhQUFjTSxRQUFRO0FBQzdDSixTQUFTbUMsaUJBQWlCLEdBQUdyQyxhQUFjbUMsS0FBSztBQUNoRGpDLFNBQVNvQyxjQUFjLEdBQUd0QyxhQUFjbUMsS0FBSztBQUM3Q2pDLFNBQVNxQyxjQUFjLEdBQUd2QyxhQUFjbUMsS0FBSztBQUM3Q2pDLFNBQVNzQyxnQkFBZ0IsR0FBR3hDLGFBQWNtQyxLQUFLO0FBQy9DakMsU0FBU3VDLFlBQVksR0FBR3pDLGFBQWNtQyxLQUFLO0FBRTNDLE1BQU1PLE9BQU9uQyxTQUFTQyxhQUFhLENBQUU7QUFDckMsTUFBTW1DLE1BQU1wQyxTQUFTQyxhQUFhLENBQUU7QUFDcENOLFNBQVMwQyxVQUFVLEdBQUc1QyxhQUFjMEMsS0FBS0csS0FBSyxFQUFFO0FBQ2hEM0MsU0FBUzRDLGVBQWUsR0FBRzlDLGFBQWMwQyxLQUFLRyxLQUFLLEVBQUU7QUFDckQzQyxTQUFTNkMsZUFBZSxHQUFHL0MsYUFBYzBDLEtBQUtHLEtBQUssRUFBRTtBQUVyRDNDLFNBQVM4QyxTQUFTLEdBQUdoRCxhQUFjMkMsSUFBSUUsS0FBSyxFQUFFO0FBQzlDM0MsU0FBUytDLGVBQWUsR0FBR2pELGFBQWMyQyxJQUFJRSxLQUFLLEVBQUU7QUFDcEQzQyxTQUFTZ0Qsa0JBQWtCLEdBQUdsRCxhQUFjMkMsSUFBSUUsS0FBSyxFQUFFO0FBQ3ZEM0MsU0FBU2lELFlBQVksR0FBR25ELGFBQWMyQyxJQUFJRSxLQUFLLEVBQUU7QUFFakQzQyxTQUFTa0QsVUFBVSxHQUFHcEQsYUFBYzJDLElBQUlFLEtBQUssRUFBRTtBQUMvQzNDLFNBQVNtRCxXQUFXLEdBQUdyRCxhQUFjMkMsSUFBSUUsS0FBSyxFQUFFO0FBQ2hEM0MsU0FBU29ELFlBQVksR0FBR3RELGFBQWMyQyxJQUFJRSxLQUFLLEVBQUU7QUFDakQzQyxTQUFTcUQsUUFBUSxHQUFHdkQsYUFBYzJDLElBQUlFLEtBQUssRUFBRTtBQUM3QzNDLFNBQVNzRCxpQkFBaUIsR0FBR3hELGFBQWMyQyxJQUFJRSxLQUFLLEVBQUU7QUFFdEQzQyxTQUFTdUQsYUFBYSxHQUFHekQsYUFBYzJDLElBQUlFLEtBQUssRUFBRTtBQUVsRDNDLFNBQVN3RCxxQkFBcUIsR0FBRzFELGFBQWMyRCxRQUFRO0FBQ3ZEekQsU0FBUzBELG9CQUFvQixHQUFHNUQsYUFBYzJELFFBQVE7QUFHdEQsNElBQTRJO0FBQzVJekQsU0FBUzJELFFBQVEsR0FBRyxDQUFFQyxZQUFZQyxhQUFhQztJQUM3QyxJQUFLRCxnQkFBZ0JFLFdBQVk7UUFDL0JILFdBQVdqQixLQUFLLENBQUVrQixZQUFhLEdBQUdDO0lBQ3BDO0FBQ0Y7QUFFQSxvRUFBb0U7QUFDcEUsMklBQTJJO0FBQzNJOUQsU0FBU2dFLE9BQU8sR0FBRztBQUNuQlAsT0FBT1EsZ0JBQWdCLENBQUUsUUFBUSxNQUFNQyxPQUFPQyxjQUFjLENBQUUsQ0FBQyxHQUFHLFdBQVc7SUFDM0VDLEtBQUs7UUFDSHBFLFNBQVNnRSxPQUFPLEdBQUc7SUFDckI7QUFDRjtBQUVBLGVBQWVoRSxTQUFTIn0=