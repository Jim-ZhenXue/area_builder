// Copyright 2013-2024, University of Colorado Boulder
/**
 * Converts a resource (like an image or sound file) to base64.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import fs from 'fs';
const MIME_TYPES = {
    png: 'image/png',
    svg: 'image/svg+xml',
    jpg: 'image/jpeg',
    gif: 'image/gif',
    cur: 'image/x-icon',
    mp3: 'audio/mpeg',
    m4a: 'audio/mp4',
    ogg: 'audio/ogg',
    oga: 'audio/ogg',
    bma: 'audio/webm',
    wav: 'audio/wav',
    woff: 'application/x-font-woff'
};
/**
 * @returns - A base-64 Data URI for the given resource
 */ function loadFileAsDataURI(filename) {
    const filenameParts = filename.split('.');
    const suffix = filenameParts[filenameParts.length - 1];
    const mimeType = MIME_TYPES[suffix];
    if (!mimeType) {
        throw new Error(`Unknown mime type for filename: ${filename}`);
    }
    const base64 = `data:${mimeType};base64,${Buffer.from(fs.readFileSync(filename)).toString('base64')}`;
    return base64;
}
export default loadFileAsDataURI;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2NvbW1vbi9sb2FkRmlsZUFzRGF0YVVSSS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDb252ZXJ0cyBhIHJlc291cmNlIChsaWtlIGFuIGltYWdlIG9yIHNvdW5kIGZpbGUpIHRvIGJhc2U2NC5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5cbmNvbnN0IE1JTUVfVFlQRVMgPSB7XG4gIHBuZzogJ2ltYWdlL3BuZycsXG4gIHN2ZzogJ2ltYWdlL3N2Zyt4bWwnLFxuICBqcGc6ICdpbWFnZS9qcGVnJyxcbiAgZ2lmOiAnaW1hZ2UvZ2lmJyxcbiAgY3VyOiAnaW1hZ2UveC1pY29uJywgLy8gY3Vyc29yIGZpbGVzICh1c2VkIGluIGJ1aWxkLWEtbW9sZWN1bGUpLiB4LXdpbi1iaXRtYXAgZ2l2ZXMgb2ZmIHdhcm5pbmdzIGluIENocm9tZVxuICBtcDM6ICdhdWRpby9tcGVnJyxcbiAgbTRhOiAnYXVkaW8vbXA0JyxcbiAgb2dnOiAnYXVkaW8vb2dnJyxcbiAgb2dhOiAnYXVkaW8vb2dnJyxcbiAgYm1hOiAnYXVkaW8vd2VibScsIC8vIHdlYm1hIGlzIHRoZSBmdWxsIGV4dGVuc2lvblxuICB3YXY6ICdhdWRpby93YXYnLFxuICB3b2ZmOiAnYXBwbGljYXRpb24veC1mb250LXdvZmYnXG59O1xuXG4vKipcbiAqIEByZXR1cm5zIC0gQSBiYXNlLTY0IERhdGEgVVJJIGZvciB0aGUgZ2l2ZW4gcmVzb3VyY2VcbiAqL1xuZnVuY3Rpb24gbG9hZEZpbGVBc0RhdGFVUkkoIGZpbGVuYW1lOiBzdHJpbmcgKTogc3RyaW5nIHtcbiAgY29uc3QgZmlsZW5hbWVQYXJ0cyA9IGZpbGVuYW1lLnNwbGl0KCAnLicgKTtcbiAgY29uc3Qgc3VmZml4ID0gZmlsZW5hbWVQYXJ0c1sgZmlsZW5hbWVQYXJ0cy5sZW5ndGggLSAxIF0gYXMga2V5b2YgdHlwZW9mIE1JTUVfVFlQRVM7XG5cbiAgY29uc3QgbWltZVR5cGUgPSBNSU1FX1RZUEVTWyBzdWZmaXggXTtcblxuICBpZiAoICFtaW1lVHlwZSApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoIGBVbmtub3duIG1pbWUgdHlwZSBmb3IgZmlsZW5hbWU6ICR7ZmlsZW5hbWV9YCApO1xuICB9XG5cbiAgY29uc3QgYmFzZTY0ID0gYGRhdGE6JHttaW1lVHlwZX07YmFzZTY0LCR7QnVmZmVyLmZyb20oIGZzLnJlYWRGaWxlU3luYyggZmlsZW5hbWUgKSApLnRvU3RyaW5nKCAnYmFzZTY0JyApfWA7XG4gIHJldHVybiBiYXNlNjQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGxvYWRGaWxlQXNEYXRhVVJJOyJdLCJuYW1lcyI6WyJmcyIsIk1JTUVfVFlQRVMiLCJwbmciLCJzdmciLCJqcGciLCJnaWYiLCJjdXIiLCJtcDMiLCJtNGEiLCJvZ2ciLCJvZ2EiLCJibWEiLCJ3YXYiLCJ3b2ZmIiwibG9hZEZpbGVBc0RhdGFVUkkiLCJmaWxlbmFtZSIsImZpbGVuYW1lUGFydHMiLCJzcGxpdCIsInN1ZmZpeCIsImxlbmd0aCIsIm1pbWVUeXBlIiwiRXJyb3IiLCJiYXNlNjQiLCJCdWZmZXIiLCJmcm9tIiwicmVhZEZpbGVTeW5jIiwidG9TdHJpbmciXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBQ0QsT0FBT0EsUUFBUSxLQUFLO0FBRXBCLE1BQU1DLGFBQWE7SUFDakJDLEtBQUs7SUFDTEMsS0FBSztJQUNMQyxLQUFLO0lBQ0xDLEtBQUs7SUFDTEMsS0FBSztJQUNMQyxLQUFLO0lBQ0xDLEtBQUs7SUFDTEMsS0FBSztJQUNMQyxLQUFLO0lBQ0xDLEtBQUs7SUFDTEMsS0FBSztJQUNMQyxNQUFNO0FBQ1I7QUFFQTs7Q0FFQyxHQUNELFNBQVNDLGtCQUFtQkMsUUFBZ0I7SUFDMUMsTUFBTUMsZ0JBQWdCRCxTQUFTRSxLQUFLLENBQUU7SUFDdEMsTUFBTUMsU0FBU0YsYUFBYSxDQUFFQSxjQUFjRyxNQUFNLEdBQUcsRUFBRztJQUV4RCxNQUFNQyxXQUFXbkIsVUFBVSxDQUFFaUIsT0FBUTtJQUVyQyxJQUFLLENBQUNFLFVBQVc7UUFDZixNQUFNLElBQUlDLE1BQU8sQ0FBQyxnQ0FBZ0MsRUFBRU4sVUFBVTtJQUNoRTtJQUVBLE1BQU1PLFNBQVMsQ0FBQyxLQUFLLEVBQUVGLFNBQVMsUUFBUSxFQUFFRyxPQUFPQyxJQUFJLENBQUV4QixHQUFHeUIsWUFBWSxDQUFFVixXQUFhVyxRQUFRLENBQUUsV0FBWTtJQUMzRyxPQUFPSjtBQUNUO0FBRUEsZUFBZVIsa0JBQWtCIn0=