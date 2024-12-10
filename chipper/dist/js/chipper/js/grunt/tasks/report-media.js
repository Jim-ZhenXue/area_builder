// Copyright 2013-2024, University of Colorado Boulder
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
import getRepo from '../../../../perennial-alias/js/grunt/tasks/util/getRepo.js';
import _reportMedia from '../reportMedia.js'; // eslint-disable-line phet/default-import-match-filename
/**
 * (project-wide) Report on license.json files throughout all working copies.
 * Reports any media (such as images or sound) files that have any of the following problems:
 * (1) incompatible-license (resource license not approved)
 * (2) not-annotated (license.json missing or entry missing from license.json)
 * (3) missing-file (entry in the license.json but not on the file system)
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ const repo = getRepo();
export const reportMediaPromise = _async_to_generator(function*() {
    yield _reportMedia(repo);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3Rhc2tzL3JlcG9ydC1tZWRpYS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuaW1wb3J0IGdldFJlcG8gZnJvbSAnLi4vLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2dydW50L3Rhc2tzL3V0aWwvZ2V0UmVwby5qcyc7XG5pbXBvcnQgX3JlcG9ydE1lZGlhIGZyb20gJy4uL3JlcG9ydE1lZGlhLmpzJzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L2RlZmF1bHQtaW1wb3J0LW1hdGNoLWZpbGVuYW1lXG5cbi8qKlxuICogKHByb2plY3Qtd2lkZSkgUmVwb3J0IG9uIGxpY2Vuc2UuanNvbiBmaWxlcyB0aHJvdWdob3V0IGFsbCB3b3JraW5nIGNvcGllcy5cbiAqIFJlcG9ydHMgYW55IG1lZGlhIChzdWNoIGFzIGltYWdlcyBvciBzb3VuZCkgZmlsZXMgdGhhdCBoYXZlIGFueSBvZiB0aGUgZm9sbG93aW5nIHByb2JsZW1zOlxuICogKDEpIGluY29tcGF0aWJsZS1saWNlbnNlIChyZXNvdXJjZSBsaWNlbnNlIG5vdCBhcHByb3ZlZClcbiAqICgyKSBub3QtYW5ub3RhdGVkIChsaWNlbnNlLmpzb24gbWlzc2luZyBvciBlbnRyeSBtaXNzaW5nIGZyb20gbGljZW5zZS5qc29uKVxuICogKDMpIG1pc3NpbmctZmlsZSAoZW50cnkgaW4gdGhlIGxpY2Vuc2UuanNvbiBidXQgbm90IG9uIHRoZSBmaWxlIHN5c3RlbSlcbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5jb25zdCByZXBvID0gZ2V0UmVwbygpO1xuXG5leHBvcnQgY29uc3QgcmVwb3J0TWVkaWFQcm9taXNlID0gKCBhc3luYyAoKSA9PiB7XG4gIGF3YWl0IF9yZXBvcnRNZWRpYSggcmVwbyApO1xufSApKCk7Il0sIm5hbWVzIjpbImdldFJlcG8iLCJfcmVwb3J0TWVkaWEiLCJyZXBvIiwicmVwb3J0TWVkaWFQcm9taXNlIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUV0RCxPQUFPQSxhQUFhLDZEQUE2RDtBQUNqRixPQUFPQyxrQkFBa0Isb0JBQW9CLENBQUMseURBQXlEO0FBRXZHOzs7Ozs7OztDQVFDLEdBQ0QsTUFBTUMsT0FBT0Y7QUFFYixPQUFPLE1BQU1HLHFCQUFxQixBQUFFLG9CQUFBO0lBQ2xDLE1BQU1GLGFBQWNDO0FBQ3RCLEtBQU0ifQ==