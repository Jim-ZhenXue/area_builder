// Copyright 2017, University of Colorado Boulder
/**
 * Sets the version of the current checked-in repo's package.json, creating a commit with the change
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
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
const gitAdd = require('./gitAdd');
const gitCommit = require('./gitCommit');
const gitIsClean = require('./gitIsClean');
const loadJSON = require('./loadJSON');
const writeJSON = require('./writeJSON');
const winston = require('winston');
/**
 * Sets the version for a current checked-in repo, creating a commit with the change
 * @public
 *
 * @param {string} repo - The repository name
 * @param {SimVersion} version
 * @param {string} [message] - Optional. If provided, appended at the end
 * @returns {Promise}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo, version, message) {
    winston.info(`Setting version from package.json for ${repo} to ${version.toString()}`);
    const packageFile = `../${repo}/package.json`;
    const isClean = yield gitIsClean(repo);
    if (!isClean) {
        throw new Error(`Unclean status in ${repo}, cannot increment version`);
    }
    const packageObject = yield loadJSON(packageFile);
    packageObject.version = version.toString();
    yield writeJSON(packageFile, packageObject);
    yield gitAdd(repo, 'package.json');
    yield gitCommit(repo, `Bumping version to ${version.toString()}${message ? `, ${message}` : ''}`);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vc2V0UmVwb1ZlcnNpb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTcsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFNldHMgdGhlIHZlcnNpb24gb2YgdGhlIGN1cnJlbnQgY2hlY2tlZC1pbiByZXBvJ3MgcGFja2FnZS5qc29uLCBjcmVhdGluZyBhIGNvbW1pdCB3aXRoIHRoZSBjaGFuZ2VcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgZ2l0QWRkID0gcmVxdWlyZSggJy4vZ2l0QWRkJyApO1xuY29uc3QgZ2l0Q29tbWl0ID0gcmVxdWlyZSggJy4vZ2l0Q29tbWl0JyApO1xuY29uc3QgZ2l0SXNDbGVhbiA9IHJlcXVpcmUoICcuL2dpdElzQ2xlYW4nICk7XG5jb25zdCBsb2FkSlNPTiA9IHJlcXVpcmUoICcuL2xvYWRKU09OJyApO1xuY29uc3Qgd3JpdGVKU09OID0gcmVxdWlyZSggJy4vd3JpdGVKU09OJyApO1xuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuXG4vKipcbiAqIFNldHMgdGhlIHZlcnNpb24gZm9yIGEgY3VycmVudCBjaGVja2VkLWluIHJlcG8sIGNyZWF0aW5nIGEgY29tbWl0IHdpdGggdGhlIGNoYW5nZVxuICogQHB1YmxpY1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvIC0gVGhlIHJlcG9zaXRvcnkgbmFtZVxuICogQHBhcmFtIHtTaW1WZXJzaW9ufSB2ZXJzaW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gW21lc3NhZ2VdIC0gT3B0aW9uYWwuIElmIHByb3ZpZGVkLCBhcHBlbmRlZCBhdCB0aGUgZW5kXG4gKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiggcmVwbywgdmVyc2lvbiwgbWVzc2FnZSApIHtcbiAgd2luc3Rvbi5pbmZvKCBgU2V0dGluZyB2ZXJzaW9uIGZyb20gcGFja2FnZS5qc29uIGZvciAke3JlcG99IHRvICR7dmVyc2lvbi50b1N0cmluZygpfWAgKTtcblxuICBjb25zdCBwYWNrYWdlRmlsZSA9IGAuLi8ke3JlcG99L3BhY2thZ2UuanNvbmA7XG5cbiAgY29uc3QgaXNDbGVhbiA9IGF3YWl0IGdpdElzQ2xlYW4oIHJlcG8gKTtcbiAgaWYgKCAhaXNDbGVhbiApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoIGBVbmNsZWFuIHN0YXR1cyBpbiAke3JlcG99LCBjYW5ub3QgaW5jcmVtZW50IHZlcnNpb25gICk7XG4gIH1cblxuICBjb25zdCBwYWNrYWdlT2JqZWN0ID0gYXdhaXQgbG9hZEpTT04oIHBhY2thZ2VGaWxlICk7XG4gIHBhY2thZ2VPYmplY3QudmVyc2lvbiA9IHZlcnNpb24udG9TdHJpbmcoKTtcblxuICBhd2FpdCB3cml0ZUpTT04oIHBhY2thZ2VGaWxlLCBwYWNrYWdlT2JqZWN0ICk7XG4gIGF3YWl0IGdpdEFkZCggcmVwbywgJ3BhY2thZ2UuanNvbicgKTtcbiAgYXdhaXQgZ2l0Q29tbWl0KCByZXBvLCBgQnVtcGluZyB2ZXJzaW9uIHRvICR7dmVyc2lvbi50b1N0cmluZygpfSR7bWVzc2FnZSA/IGAsICR7bWVzc2FnZX1gIDogJyd9YCApO1xufTsiXSwibmFtZXMiOlsiZ2l0QWRkIiwicmVxdWlyZSIsImdpdENvbW1pdCIsImdpdElzQ2xlYW4iLCJsb2FkSlNPTiIsIndyaXRlSlNPTiIsIndpbnN0b24iLCJtb2R1bGUiLCJleHBvcnRzIiwicmVwbyIsInZlcnNpb24iLCJtZXNzYWdlIiwiaW5mbyIsInRvU3RyaW5nIiwicGFja2FnZUZpbGUiLCJpc0NsZWFuIiwiRXJyb3IiLCJwYWNrYWdlT2JqZWN0Il0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxTQUFTQyxRQUFTO0FBQ3hCLE1BQU1DLFlBQVlELFFBQVM7QUFDM0IsTUFBTUUsYUFBYUYsUUFBUztBQUM1QixNQUFNRyxXQUFXSCxRQUFTO0FBQzFCLE1BQU1JLFlBQVlKLFFBQVM7QUFDM0IsTUFBTUssVUFBVUwsUUFBUztBQUV6Qjs7Ozs7Ozs7Q0FRQyxHQUNETSxPQUFPQyxPQUFPLHFDQUFHLFVBQWdCQyxJQUFJLEVBQUVDLE9BQU8sRUFBRUMsT0FBTztJQUNyREwsUUFBUU0sSUFBSSxDQUFFLENBQUMsc0NBQXNDLEVBQUVILEtBQUssSUFBSSxFQUFFQyxRQUFRRyxRQUFRLElBQUk7SUFFdEYsTUFBTUMsY0FBYyxDQUFDLEdBQUcsRUFBRUwsS0FBSyxhQUFhLENBQUM7SUFFN0MsTUFBTU0sVUFBVSxNQUFNWixXQUFZTTtJQUNsQyxJQUFLLENBQUNNLFNBQVU7UUFDZCxNQUFNLElBQUlDLE1BQU8sQ0FBQyxrQkFBa0IsRUFBRVAsS0FBSywwQkFBMEIsQ0FBQztJQUN4RTtJQUVBLE1BQU1RLGdCQUFnQixNQUFNYixTQUFVVTtJQUN0Q0csY0FBY1AsT0FBTyxHQUFHQSxRQUFRRyxRQUFRO0lBRXhDLE1BQU1SLFVBQVdTLGFBQWFHO0lBQzlCLE1BQU1qQixPQUFRUyxNQUFNO0lBQ3BCLE1BQU1QLFVBQVdPLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRUMsUUFBUUcsUUFBUSxLQUFLRixVQUFVLENBQUMsRUFBRSxFQUFFQSxTQUFTLEdBQUcsSUFBSTtBQUNuRyJ9