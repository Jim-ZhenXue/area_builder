// Copyright 2019-2022, University of Colorado Boulder
/**
 * a singleton instance that contains constants shared amongst the sound generation code modules
 *
 * @author John Blanco
 */ import tambo from './tambo.js';
// instance definition
const soundConstants = {
    // A time constant value, in seconds, that is used in Web Audio calls that have an exponential change, such as
    // setTargetAtTime.  The value was empirically determined to work well for fast gain changes, and may be appropriate
    // for other parameter changes.
    DEFAULT_PARAM_CHANGE_TIME_CONSTANT: 0.015,
    // Time, in seconds, for linear gain changes.  This is generally used in calls to linearRampToValueAtTime.  The
    // value was empirically determined to be reasonably fast, but not so fast that it causes audible transients
    // (generally heard as clicks) when turning sounds on and off.
    DEFAULT_LINEAR_GAIN_CHANGE_TIME: 0.1,
    // The twelfth root of 2 is useful when doing math that is creating tones that relate to an even-tempered 12-tone
    // musical scale.
    TWELFTH_ROOT_OF_TWO: Math.pow(2, 1 / 12)
};
// register for phet-io
tambo.register('soundConstants', soundConstants);
export default soundConstants;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kQ29uc3RhbnRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIGEgc2luZ2xldG9uIGluc3RhbmNlIHRoYXQgY29udGFpbnMgY29uc3RhbnRzIHNoYXJlZCBhbW9uZ3N0IHRoZSBzb3VuZCBnZW5lcmF0aW9uIGNvZGUgbW9kdWxlc1xuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cbiAqL1xuXG5pbXBvcnQgdGFtYm8gZnJvbSAnLi90YW1iby5qcyc7XG5cbi8vIGluc3RhbmNlIGRlZmluaXRpb25cbmNvbnN0IHNvdW5kQ29uc3RhbnRzID0ge1xuXG4gIC8vIEEgdGltZSBjb25zdGFudCB2YWx1ZSwgaW4gc2Vjb25kcywgdGhhdCBpcyB1c2VkIGluIFdlYiBBdWRpbyBjYWxscyB0aGF0IGhhdmUgYW4gZXhwb25lbnRpYWwgY2hhbmdlLCBzdWNoIGFzXG4gIC8vIHNldFRhcmdldEF0VGltZS4gIFRoZSB2YWx1ZSB3YXMgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB0byB3b3JrIHdlbGwgZm9yIGZhc3QgZ2FpbiBjaGFuZ2VzLCBhbmQgbWF5IGJlIGFwcHJvcHJpYXRlXG4gIC8vIGZvciBvdGhlciBwYXJhbWV0ZXIgY2hhbmdlcy5cbiAgREVGQVVMVF9QQVJBTV9DSEFOR0VfVElNRV9DT05TVEFOVDogMC4wMTUsXG5cbiAgLy8gVGltZSwgaW4gc2Vjb25kcywgZm9yIGxpbmVhciBnYWluIGNoYW5nZXMuICBUaGlzIGlzIGdlbmVyYWxseSB1c2VkIGluIGNhbGxzIHRvIGxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lLiAgVGhlXG4gIC8vIHZhbHVlIHdhcyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIHRvIGJlIHJlYXNvbmFibHkgZmFzdCwgYnV0IG5vdCBzbyBmYXN0IHRoYXQgaXQgY2F1c2VzIGF1ZGlibGUgdHJhbnNpZW50c1xuICAvLyAoZ2VuZXJhbGx5IGhlYXJkIGFzIGNsaWNrcykgd2hlbiB0dXJuaW5nIHNvdW5kcyBvbiBhbmQgb2ZmLlxuICBERUZBVUxUX0xJTkVBUl9HQUlOX0NIQU5HRV9USU1FOiAwLjEsXG5cbiAgLy8gVGhlIHR3ZWxmdGggcm9vdCBvZiAyIGlzIHVzZWZ1bCB3aGVuIGRvaW5nIG1hdGggdGhhdCBpcyBjcmVhdGluZyB0b25lcyB0aGF0IHJlbGF0ZSB0byBhbiBldmVuLXRlbXBlcmVkIDEyLXRvbmVcbiAgLy8gbXVzaWNhbCBzY2FsZS5cbiAgVFdFTEZUSF9ST09UX09GX1RXTzogTWF0aC5wb3coIDIsIDEgLyAxMiApXG59O1xuXG4vLyByZWdpc3RlciBmb3IgcGhldC1pb1xudGFtYm8ucmVnaXN0ZXIoICdzb3VuZENvbnN0YW50cycsIHNvdW5kQ29uc3RhbnRzICk7XG5cbmV4cG9ydCBkZWZhdWx0IHNvdW5kQ29uc3RhbnRzOyJdLCJuYW1lcyI6WyJ0YW1ibyIsInNvdW5kQ29uc3RhbnRzIiwiREVGQVVMVF9QQVJBTV9DSEFOR0VfVElNRV9DT05TVEFOVCIsIkRFRkFVTFRfTElORUFSX0dBSU5fQ0hBTkdFX1RJTUUiLCJUV0VMRlRIX1JPT1RfT0ZfVFdPIiwiTWF0aCIsInBvdyIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLFdBQVcsYUFBYTtBQUUvQixzQkFBc0I7QUFDdEIsTUFBTUMsaUJBQWlCO0lBRXJCLDhHQUE4RztJQUM5RyxvSEFBb0g7SUFDcEgsK0JBQStCO0lBQy9CQyxvQ0FBb0M7SUFFcEMsK0dBQStHO0lBQy9HLDRHQUE0RztJQUM1Ryw4REFBOEQ7SUFDOURDLGlDQUFpQztJQUVqQyxpSEFBaUg7SUFDakgsaUJBQWlCO0lBQ2pCQyxxQkFBcUJDLEtBQUtDLEdBQUcsQ0FBRSxHQUFHLElBQUk7QUFDeEM7QUFFQSx1QkFBdUI7QUFDdkJOLE1BQU1PLFFBQVEsQ0FBRSxrQkFBa0JOO0FBRWxDLGVBQWVBLGVBQWUifQ==