// Copyright 2021-2023, University of Colorado Boulder
/**
 * Support gracefully getting a global object to itself. Returns null if the global doesn't exist.
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import phetCore from './phetCore.js';
/**
 * If the path exists on the window global, return it, otherwise returns null
 * @param path a path to global, such as 'phet.joist.sim'
 */ const getGlobal = (path)=>{
    assert && assert(path.trim() === path, 'path must be trimmed');
    const global = _.get(window, path);
    return global !== undefined ? global : null;
};
phetCore.register('getGlobal', getGlobal);
export default getGlobal;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9nZXRHbG9iYWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogU3VwcG9ydCBncmFjZWZ1bGx5IGdldHRpbmcgYSBnbG9iYWwgb2JqZWN0IHRvIGl0c2VsZi4gUmV0dXJucyBudWxsIGlmIHRoZSBnbG9iYWwgZG9lc24ndCBleGlzdC5cbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IHBoZXRDb3JlIGZyb20gJy4vcGhldENvcmUuanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4vdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xuXG4vKipcbiAqIElmIHRoZSBwYXRoIGV4aXN0cyBvbiB0aGUgd2luZG93IGdsb2JhbCwgcmV0dXJuIGl0LCBvdGhlcndpc2UgcmV0dXJucyBudWxsXG4gKiBAcGFyYW0gcGF0aCBhIHBhdGggdG8gZ2xvYmFsLCBzdWNoIGFzICdwaGV0LmpvaXN0LnNpbSdcbiAqL1xuY29uc3QgZ2V0R2xvYmFsID0gKCBwYXRoOiBzdHJpbmcgKTogSW50ZW50aW9uYWxBbnkgfCBudWxsID0+IHtcbiAgYXNzZXJ0ICYmIGFzc2VydCggcGF0aC50cmltKCkgPT09IHBhdGgsICdwYXRoIG11c3QgYmUgdHJpbW1lZCcgKTtcbiAgY29uc3QgZ2xvYmFsID0gXy5nZXQoIHdpbmRvdywgcGF0aCApO1xuICByZXR1cm4gZ2xvYmFsICE9PSB1bmRlZmluZWQgPyBnbG9iYWwgOiBudWxsO1xufTtcblxucGhldENvcmUucmVnaXN0ZXIoICdnZXRHbG9iYWwnLCBnZXRHbG9iYWwgKTtcblxuZXhwb3J0IGRlZmF1bHQgZ2V0R2xvYmFsOyJdLCJuYW1lcyI6WyJwaGV0Q29yZSIsImdldEdsb2JhbCIsInBhdGgiLCJhc3NlcnQiLCJ0cmltIiwiZ2xvYmFsIiwiXyIsImdldCIsIndpbmRvdyIsInVuZGVmaW5lZCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGNBQWMsZ0JBQWdCO0FBR3JDOzs7Q0FHQyxHQUNELE1BQU1DLFlBQVksQ0FBRUM7SUFDbEJDLFVBQVVBLE9BQVFELEtBQUtFLElBQUksT0FBT0YsTUFBTTtJQUN4QyxNQUFNRyxTQUFTQyxFQUFFQyxHQUFHLENBQUVDLFFBQVFOO0lBQzlCLE9BQU9HLFdBQVdJLFlBQVlKLFNBQVM7QUFDekM7QUFFQUwsU0FBU1UsUUFBUSxDQUFFLGFBQWFUO0FBRWhDLGVBQWVBLFVBQVUifQ==