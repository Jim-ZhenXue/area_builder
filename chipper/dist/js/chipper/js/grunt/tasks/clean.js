// Copyright 2013-2024, University of Colorado Boulder
/**
 * Erases the build/ directory and all its contents, and recreates the build/ directory
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
import fs from 'fs';
import getRepo from '../../../../perennial-alias/js/grunt/tasks/util/getRepo.js';
export const cleanPromise = _async_to_generator(function*() {
    const repo = getRepo();
    const buildDirectory = `../${repo}/build`;
    // Check if the build directory exists, then delete and recreate it
    if (fs.existsSync(buildDirectory)) {
        fs.rmSync(buildDirectory, {
            recursive: true,
            force: true
        });
    }
    fs.mkdirSync(buildDirectory, {
        recursive: true
    });
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3Rhc2tzL2NsZWFuLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEVyYXNlcyB0aGUgYnVpbGQvIGRpcmVjdG9yeSBhbmQgYWxsIGl0cyBjb250ZW50cywgYW5kIHJlY3JlYXRlcyB0aGUgYnVpbGQvIGRpcmVjdG9yeVxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBnZXRSZXBvIGZyb20gJy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy91dGlsL2dldFJlcG8uanMnO1xuXG5leHBvcnQgY29uc3QgY2xlYW5Qcm9taXNlID0gKCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IHJlcG8gPSBnZXRSZXBvKCk7XG4gIGNvbnN0IGJ1aWxkRGlyZWN0b3J5ID0gYC4uLyR7cmVwb30vYnVpbGRgO1xuXG4gIC8vIENoZWNrIGlmIHRoZSBidWlsZCBkaXJlY3RvcnkgZXhpc3RzLCB0aGVuIGRlbGV0ZSBhbmQgcmVjcmVhdGUgaXRcbiAgaWYgKCBmcy5leGlzdHNTeW5jKCBidWlsZERpcmVjdG9yeSApICkge1xuICAgIGZzLnJtU3luYyggYnVpbGREaXJlY3RvcnksIHsgcmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZSB9ICk7XG4gIH1cbiAgZnMubWtkaXJTeW5jKCBidWlsZERpcmVjdG9yeSwgeyByZWN1cnNpdmU6IHRydWUgfSApO1xufSApKCk7Il0sIm5hbWVzIjpbImZzIiwiZ2V0UmVwbyIsImNsZWFuUHJvbWlzZSIsInJlcG8iLCJidWlsZERpcmVjdG9yeSIsImV4aXN0c1N5bmMiLCJybVN5bmMiLCJyZWN1cnNpdmUiLCJmb3JjZSIsIm1rZGlyU3luYyJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsT0FBT0EsUUFBUSxLQUFLO0FBQ3BCLE9BQU9DLGFBQWEsNkRBQTZEO0FBRWpGLE9BQU8sTUFBTUMsZUFBZSxBQUFFLG9CQUFBO0lBQzVCLE1BQU1DLE9BQU9GO0lBQ2IsTUFBTUcsaUJBQWlCLENBQUMsR0FBRyxFQUFFRCxLQUFLLE1BQU0sQ0FBQztJQUV6QyxtRUFBbUU7SUFDbkUsSUFBS0gsR0FBR0ssVUFBVSxDQUFFRCxpQkFBbUI7UUFDckNKLEdBQUdNLE1BQU0sQ0FBRUYsZ0JBQWdCO1lBQUVHLFdBQVc7WUFBTUMsT0FBTztRQUFLO0lBQzVEO0lBQ0FSLEdBQUdTLFNBQVMsQ0FBRUwsZ0JBQWdCO1FBQUVHLFdBQVc7SUFBSztBQUNsRCxLQUFNIn0=