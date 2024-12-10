// Copyright 2015-2024, University of Colorado Boulder
/**
 * Takes in a mipmap object with data/width/height and returns another mipmap object with data/width/height that is
 * downscaled by a factor of 2. Needs to round the width/height up to include all of the image (if it's not a
 * power of 2).
 *
 * mipmap.data should be array-accessible with bytes (typed array, Buffer, etc.)
 *
 * Handles alpha blending of 4 pixels into 1, and does so with the proper gamma corrections so that we only add/blend
 * colors in the linear sRGB colorspace.
 *
 * @param mipmap - Mipmap object with { data: {Buffer}, width: {number}, height: {number} }
 * @param createData - function( width, height ), creates an array-accessible data container, Buffer
 *                                for Node.js, or presumably a typed array otherwise, with 4*width*height components
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ function mipmapDownscale(mipmap, createData) {
    // array index constants for the channels
    const R = 0;
    const G = 1;
    const B = 2;
    const A = 3;
    // hard-coded gamma (assuming the exponential part of the sRGB curve as a simplification)
    const GAMMA = 2.2;
    // dimension handling for the larger image
    const width = mipmap.width;
    const height = mipmap.height;
    const data = mipmap.data;
    function inside(row, col) {
        return row < height && col < width;
    }
    // grabbing pixel data for a row/col, applying corrections into the [0,1] range.
    function pixel(row, col) {
        if (!inside(row, col)) {
            return [
                0,
                0,
                0,
                0
            ];
        }
        const index = 4 * (row * width + col);
        return [
            // maps to [0,1]
            Math.pow(data[index + R] / 255, GAMMA),
            Math.pow(data[index + G] / 255, GAMMA),
            Math.pow(data[index + B] / 255, GAMMA),
            Math.pow(data[index + A] / 255, GAMMA) // alpha
        ];
    }
    // dimension h andling for the smaller downscaled image
    const smallWidth = Math.ceil(width / 2);
    const smallHeight = Math.ceil(height / 2);
    const smallData = createData(smallWidth, smallHeight);
    function smallPixel(row, col) {
        return 4 * (row * smallWidth + col);
    }
    // for each pixel in our downscaled image
    for(let row = 0; row < height; row++){
        for(let col = 0; col < width; col++){
            // Original pixel values for the quadrant
            const p1 = pixel(2 * row, 2 * col); // upper-left
            const p2 = pixel(2 * row, 2 * col + 1); // upper-right
            const p3 = pixel(2 * row + 1, 2 * col); // lower-left
            const p4 = pixel(2 * row + 1, 2 * col + 1); // lower-right
            const output = [
                0,
                0,
                0,
                0
            ];
            const alphaSum = p1[A] + p2[A] + p3[A] + p4[A];
            // blending of pixels, weighted by alphas
            output[R] = (p1[R] * p1[A] + p2[R] * p2[A] + p3[R] * p3[A] + p4[R] * p4[A]) / alphaSum;
            output[G] = (p1[G] * p1[A] + p2[G] * p2[A] + p3[G] * p3[A] + p4[G] * p4[A]) / alphaSum;
            output[B] = (p1[B] * p1[A] + p2[B] * p2[A] + p3[B] * p3[A] + p4[B] * p4[A]) / alphaSum;
            output[A] = alphaSum / 4; // average of alphas
            // convert back into [0,255] range with reverse corrections, and store in our buffer
            const outputIndex = smallPixel(row, col);
            smallData[outputIndex + R] = Math.floor(Math.pow(output[R], 1 / GAMMA) * 255);
            smallData[outputIndex + G] = Math.floor(Math.pow(output[G], 1 / GAMMA) * 255);
            smallData[outputIndex + B] = Math.floor(Math.pow(output[B], 1 / GAMMA) * 255);
            smallData[outputIndex + A] = Math.floor(Math.pow(output[A], 1 / GAMMA) * 255);
        }
    }
    return {
        data: smallData,
        width: smallWidth,
        height: smallHeight
    };
}
export default mipmapDownscale;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2NvbW1vbi9taXBtYXBEb3duc2NhbGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cblxudHlwZSBNaXBNYXAgPSB7XG4gIGRhdGE6IEJ1ZmZlcjtcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG59O1xuXG4vKipcbiAqIFRha2VzIGluIGEgbWlwbWFwIG9iamVjdCB3aXRoIGRhdGEvd2lkdGgvaGVpZ2h0IGFuZCByZXR1cm5zIGFub3RoZXIgbWlwbWFwIG9iamVjdCB3aXRoIGRhdGEvd2lkdGgvaGVpZ2h0IHRoYXQgaXNcbiAqIGRvd25zY2FsZWQgYnkgYSBmYWN0b3Igb2YgMi4gTmVlZHMgdG8gcm91bmQgdGhlIHdpZHRoL2hlaWdodCB1cCB0byBpbmNsdWRlIGFsbCBvZiB0aGUgaW1hZ2UgKGlmIGl0J3Mgbm90IGFcbiAqIHBvd2VyIG9mIDIpLlxuICpcbiAqIG1pcG1hcC5kYXRhIHNob3VsZCBiZSBhcnJheS1hY2Nlc3NpYmxlIHdpdGggYnl0ZXMgKHR5cGVkIGFycmF5LCBCdWZmZXIsIGV0Yy4pXG4gKlxuICogSGFuZGxlcyBhbHBoYSBibGVuZGluZyBvZiA0IHBpeGVscyBpbnRvIDEsIGFuZCBkb2VzIHNvIHdpdGggdGhlIHByb3BlciBnYW1tYSBjb3JyZWN0aW9ucyBzbyB0aGF0IHdlIG9ubHkgYWRkL2JsZW5kXG4gKiBjb2xvcnMgaW4gdGhlIGxpbmVhciBzUkdCIGNvbG9yc3BhY2UuXG4gKlxuICogQHBhcmFtIG1pcG1hcCAtIE1pcG1hcCBvYmplY3Qgd2l0aCB7IGRhdGE6IHtCdWZmZXJ9LCB3aWR0aDoge251bWJlcn0sIGhlaWdodDoge251bWJlcn0gfVxuICogQHBhcmFtIGNyZWF0ZURhdGEgLSBmdW5jdGlvbiggd2lkdGgsIGhlaWdodCApLCBjcmVhdGVzIGFuIGFycmF5LWFjY2Vzc2libGUgZGF0YSBjb250YWluZXIsIEJ1ZmZlclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBOb2RlLmpzLCBvciBwcmVzdW1hYmx5IGEgdHlwZWQgYXJyYXkgb3RoZXJ3aXNlLCB3aXRoIDQqd2lkdGgqaGVpZ2h0IGNvbXBvbmVudHNcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cbmZ1bmN0aW9uIG1pcG1hcERvd25zY2FsZSggbWlwbWFwOiBNaXBNYXAsIGNyZWF0ZURhdGE6ICggd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgKSA9PiBCdWZmZXIgKTogeyBkYXRhOiBCdWZmZXI7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH0ge1xuICAvLyBhcnJheSBpbmRleCBjb25zdGFudHMgZm9yIHRoZSBjaGFubmVsc1xuICBjb25zdCBSID0gMDtcbiAgY29uc3QgRyA9IDE7XG4gIGNvbnN0IEIgPSAyO1xuICBjb25zdCBBID0gMztcblxuICAvLyBoYXJkLWNvZGVkIGdhbW1hIChhc3N1bWluZyB0aGUgZXhwb25lbnRpYWwgcGFydCBvZiB0aGUgc1JHQiBjdXJ2ZSBhcyBhIHNpbXBsaWZpY2F0aW9uKVxuICBjb25zdCBHQU1NQSA9IDIuMjtcblxuICAvLyBkaW1lbnNpb24gaGFuZGxpbmcgZm9yIHRoZSBsYXJnZXIgaW1hZ2VcbiAgY29uc3Qgd2lkdGggPSBtaXBtYXAud2lkdGg7XG4gIGNvbnN0IGhlaWdodCA9IG1pcG1hcC5oZWlnaHQ7XG4gIGNvbnN0IGRhdGEgPSBtaXBtYXAuZGF0YTtcblxuICBmdW5jdGlvbiBpbnNpZGUoIHJvdzogbnVtYmVyLCBjb2w6IG51bWJlciApOiBib29sZWFuIHtcbiAgICByZXR1cm4gcm93IDwgaGVpZ2h0ICYmIGNvbCA8IHdpZHRoO1xuICB9XG5cbiAgLy8gZ3JhYmJpbmcgcGl4ZWwgZGF0YSBmb3IgYSByb3cvY29sLCBhcHBseWluZyBjb3JyZWN0aW9ucyBpbnRvIHRoZSBbMCwxXSByYW5nZS5cbiAgZnVuY3Rpb24gcGl4ZWwoIHJvdzogbnVtYmVyLCBjb2w6IG51bWJlciApOiBudW1iZXJbXSB7XG4gICAgaWYgKCAhaW5zaWRlKCByb3csIGNvbCApICkge1xuICAgICAgcmV0dXJuIFsgMCwgMCwgMCwgMCBdO1xuICAgIH1cbiAgICBjb25zdCBpbmRleCA9IDQgKiAoIHJvdyAqIHdpZHRoICsgY29sICk7XG4gICAgcmV0dXJuIFtcbiAgICAgIC8vIG1hcHMgdG8gWzAsMV1cbiAgICAgIE1hdGgucG93KCBkYXRhWyBpbmRleCArIFIgXSAvIDI1NSwgR0FNTUEgKSwgLy8gcmVkXG4gICAgICBNYXRoLnBvdyggZGF0YVsgaW5kZXggKyBHIF0gLyAyNTUsIEdBTU1BICksIC8vIGdyZWVuXG4gICAgICBNYXRoLnBvdyggZGF0YVsgaW5kZXggKyBCIF0gLyAyNTUsIEdBTU1BICksIC8vIGJsdWVcbiAgICAgIE1hdGgucG93KCBkYXRhWyBpbmRleCArIEEgXSAvIDI1NSwgR0FNTUEgKSAvLyBhbHBoYVxuICAgIF07XG4gIH1cblxuICAvLyBkaW1lbnNpb24gaCBhbmRsaW5nIGZvciB0aGUgc21hbGxlciBkb3duc2NhbGVkIGltYWdlXG4gIGNvbnN0IHNtYWxsV2lkdGggPSBNYXRoLmNlaWwoIHdpZHRoIC8gMiApO1xuICBjb25zdCBzbWFsbEhlaWdodCA9IE1hdGguY2VpbCggaGVpZ2h0IC8gMiApO1xuICBjb25zdCBzbWFsbERhdGEgPSBjcmVhdGVEYXRhKCBzbWFsbFdpZHRoLCBzbWFsbEhlaWdodCApO1xuXG4gIGZ1bmN0aW9uIHNtYWxsUGl4ZWwoIHJvdzogbnVtYmVyLCBjb2w6IG51bWJlciApOiBudW1iZXIge1xuICAgIHJldHVybiA0ICogKCByb3cgKiBzbWFsbFdpZHRoICsgY29sICk7XG4gIH1cblxuICAvLyBmb3IgZWFjaCBwaXhlbCBpbiBvdXIgZG93bnNjYWxlZCBpbWFnZVxuICBmb3IgKCBsZXQgcm93ID0gMDsgcm93IDwgaGVpZ2h0OyByb3crKyApIHtcbiAgICBmb3IgKCBsZXQgY29sID0gMDsgY29sIDwgd2lkdGg7IGNvbCsrICkge1xuICAgICAgLy8gT3JpZ2luYWwgcGl4ZWwgdmFsdWVzIGZvciB0aGUgcXVhZHJhbnRcbiAgICAgIGNvbnN0IHAxID0gcGl4ZWwoIDIgKiByb3csIDIgKiBjb2wgKTsgLy8gdXBwZXItbGVmdFxuICAgICAgY29uc3QgcDIgPSBwaXhlbCggMiAqIHJvdywgMiAqIGNvbCArIDEgKTsgLy8gdXBwZXItcmlnaHRcbiAgICAgIGNvbnN0IHAzID0gcGl4ZWwoIDIgKiByb3cgKyAxLCAyICogY29sICk7IC8vIGxvd2VyLWxlZnRcbiAgICAgIGNvbnN0IHA0ID0gcGl4ZWwoIDIgKiByb3cgKyAxLCAyICogY29sICsgMSApOyAvLyBsb3dlci1yaWdodFxuICAgICAgY29uc3Qgb3V0cHV0ID0gWyAwLCAwLCAwLCAwIF07XG5cbiAgICAgIGNvbnN0IGFscGhhU3VtID0gcDFbIEEgXSArIHAyWyBBIF0gKyBwM1sgQSBdICsgcDRbIEEgXTtcblxuICAgICAgLy8gYmxlbmRpbmcgb2YgcGl4ZWxzLCB3ZWlnaHRlZCBieSBhbHBoYXNcbiAgICAgIG91dHB1dFsgUiBdID0gKCBwMVsgUiBdICogcDFbIEEgXSArIHAyWyBSIF0gKiBwMlsgQSBdICsgcDNbIFIgXSAqIHAzWyBBIF0gKyBwNFsgUiBdICogcDRbIEEgXSApIC8gYWxwaGFTdW07XG4gICAgICBvdXRwdXRbIEcgXSA9ICggcDFbIEcgXSAqIHAxWyBBIF0gKyBwMlsgRyBdICogcDJbIEEgXSArIHAzWyBHIF0gKiBwM1sgQSBdICsgcDRbIEcgXSAqIHA0WyBBIF0gKSAvIGFscGhhU3VtO1xuICAgICAgb3V0cHV0WyBCIF0gPSAoIHAxWyBCIF0gKiBwMVsgQSBdICsgcDJbIEIgXSAqIHAyWyBBIF0gKyBwM1sgQiBdICogcDNbIEEgXSArIHA0WyBCIF0gKiBwNFsgQSBdICkgLyBhbHBoYVN1bTtcbiAgICAgIG91dHB1dFsgQSBdID0gYWxwaGFTdW0gLyA0OyAvLyBhdmVyYWdlIG9mIGFscGhhc1xuXG4gICAgICAvLyBjb252ZXJ0IGJhY2sgaW50byBbMCwyNTVdIHJhbmdlIHdpdGggcmV2ZXJzZSBjb3JyZWN0aW9ucywgYW5kIHN0b3JlIGluIG91ciBidWZmZXJcbiAgICAgIGNvbnN0IG91dHB1dEluZGV4ID0gc21hbGxQaXhlbCggcm93LCBjb2wgKTtcbiAgICAgIHNtYWxsRGF0YVsgb3V0cHV0SW5kZXggKyBSIF0gPSBNYXRoLmZsb29yKCBNYXRoLnBvdyggb3V0cHV0WyBSIF0sIDEgLyBHQU1NQSApICogMjU1ICk7XG4gICAgICBzbWFsbERhdGFbIG91dHB1dEluZGV4ICsgRyBdID0gTWF0aC5mbG9vciggTWF0aC5wb3coIG91dHB1dFsgRyBdLCAxIC8gR0FNTUEgKSAqIDI1NSApO1xuICAgICAgc21hbGxEYXRhWyBvdXRwdXRJbmRleCArIEIgXSA9IE1hdGguZmxvb3IoIE1hdGgucG93KCBvdXRwdXRbIEIgXSwgMSAvIEdBTU1BICkgKiAyNTUgKTtcbiAgICAgIHNtYWxsRGF0YVsgb3V0cHV0SW5kZXggKyBBIF0gPSBNYXRoLmZsb29yKCBNYXRoLnBvdyggb3V0cHV0WyBBIF0sIDEgLyBHQU1NQSApICogMjU1ICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBkYXRhOiBzbWFsbERhdGEsXG4gICAgd2lkdGg6IHNtYWxsV2lkdGgsXG4gICAgaGVpZ2h0OiBzbWFsbEhlaWdodFxuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBtaXBtYXBEb3duc2NhbGU7Il0sIm5hbWVzIjpbIm1pcG1hcERvd25zY2FsZSIsIm1pcG1hcCIsImNyZWF0ZURhdGEiLCJSIiwiRyIsIkIiLCJBIiwiR0FNTUEiLCJ3aWR0aCIsImhlaWdodCIsImRhdGEiLCJpbnNpZGUiLCJyb3ciLCJjb2wiLCJwaXhlbCIsImluZGV4IiwiTWF0aCIsInBvdyIsInNtYWxsV2lkdGgiLCJjZWlsIiwic21hbGxIZWlnaHQiLCJzbWFsbERhdGEiLCJzbWFsbFBpeGVsIiwicDEiLCJwMiIsInAzIiwicDQiLCJv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