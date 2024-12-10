// Copyright 2023, University of Colorado Boulder
/**
 * Sets the supported brands of the current checked-in repo's package.json, creating a commit with the change
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
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
 * Sets the supported brands of the current checked-in repo's package.json, creating a commit with the change
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string[]} brands
 * @param {string} [message] - Optional. If provided, appended at the end
 * @returns {Promise}
 */ module.exports = /*#__PURE__*/ function() {
    var _setRepoSupportedBrands = _async_to_generator(function*(repo, brands, message) {
        winston.info(`Setting supported brands from package.json for ${repo} to ${brands}`);
        const packageFile = `../${repo}/package.json`;
        const isClean = yield gitIsClean(repo);
        if (!isClean) {
            throw new Error(`Unclean status in ${repo}, cannot increment version`);
        }
        const packageObject = yield loadJSON(packageFile);
        packageObject.phet = packageObject.phet || {};
        packageObject.phet.supportedBrands = brands;
        yield writeJSON(packageFile, packageObject);
        yield gitAdd(repo, 'package.json');
        yield gitCommit(repo, `Updating supported brands to [${brands}]${message ? `, ${message}` : ''}`);
    });
    function setRepoSupportedBrands(repo, brands, message) {
        return _setRepoSupportedBrands.apply(this, arguments);
    }
    return setRepoSupportedBrands;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vc2V0UmVwb1N1cHBvcnRlZEJyYW5kcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogU2V0cyB0aGUgc3VwcG9ydGVkIGJyYW5kcyBvZiB0aGUgY3VycmVudCBjaGVja2VkLWluIHJlcG8ncyBwYWNrYWdlLmpzb24sIGNyZWF0aW5nIGEgY29tbWl0IHdpdGggdGhlIGNoYW5nZVxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBnaXRBZGQgPSByZXF1aXJlKCAnLi9naXRBZGQnICk7XG5jb25zdCBnaXRDb21taXQgPSByZXF1aXJlKCAnLi9naXRDb21taXQnICk7XG5jb25zdCBnaXRJc0NsZWFuID0gcmVxdWlyZSggJy4vZ2l0SXNDbGVhbicgKTtcbmNvbnN0IGxvYWRKU09OID0gcmVxdWlyZSggJy4vbG9hZEpTT04nICk7XG5jb25zdCB3cml0ZUpTT04gPSByZXF1aXJlKCAnLi93cml0ZUpTT04nICk7XG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSggJ3dpbnN0b24nICk7XG5cbi8qKlxuICogU2V0cyB0aGUgc3VwcG9ydGVkIGJyYW5kcyBvZiB0aGUgY3VycmVudCBjaGVja2VkLWluIHJlcG8ncyBwYWNrYWdlLmpzb24sIGNyZWF0aW5nIGEgY29tbWl0IHdpdGggdGhlIGNoYW5nZVxuICogQHB1YmxpY1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvIC0gVGhlIHJlcG9zaXRvcnkgbmFtZVxuICogQHBhcmFtIHtzdHJpbmdbXX0gYnJhbmRzXG4gKiBAcGFyYW0ge3N0cmluZ30gW21lc3NhZ2VdIC0gT3B0aW9uYWwuIElmIHByb3ZpZGVkLCBhcHBlbmRlZCBhdCB0aGUgZW5kXG4gKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiBzZXRSZXBvU3VwcG9ydGVkQnJhbmRzKCByZXBvLCBicmFuZHMsIG1lc3NhZ2UgKSB7XG4gIHdpbnN0b24uaW5mbyggYFNldHRpbmcgc3VwcG9ydGVkIGJyYW5kcyBmcm9tIHBhY2thZ2UuanNvbiBmb3IgJHtyZXBvfSB0byAke2JyYW5kc31gICk7XG5cbiAgY29uc3QgcGFja2FnZUZpbGUgPSBgLi4vJHtyZXBvfS9wYWNrYWdlLmpzb25gO1xuXG4gIGNvbnN0IGlzQ2xlYW4gPSBhd2FpdCBnaXRJc0NsZWFuKCByZXBvICk7XG4gIGlmICggIWlzQ2xlYW4gKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCBgVW5jbGVhbiBzdGF0dXMgaW4gJHtyZXBvfSwgY2Fubm90IGluY3JlbWVudCB2ZXJzaW9uYCApO1xuICB9XG5cbiAgY29uc3QgcGFja2FnZU9iamVjdCA9IGF3YWl0IGxvYWRKU09OKCBwYWNrYWdlRmlsZSApO1xuICBwYWNrYWdlT2JqZWN0LnBoZXQgPSBwYWNrYWdlT2JqZWN0LnBoZXQgfHwge307XG4gIHBhY2thZ2VPYmplY3QucGhldC5zdXBwb3J0ZWRCcmFuZHMgPSBicmFuZHM7XG5cbiAgYXdhaXQgd3JpdGVKU09OKCBwYWNrYWdlRmlsZSwgcGFja2FnZU9iamVjdCApO1xuICBhd2FpdCBnaXRBZGQoIHJlcG8sICdwYWNrYWdlLmpzb24nICk7XG4gIGF3YWl0IGdpdENvbW1pdCggcmVwbywgYFVwZGF0aW5nIHN1cHBvcnRlZCBicmFuZHMgdG8gWyR7YnJhbmRzfV0ke21lc3NhZ2UgPyBgLCAke21lc3NhZ2V9YCA6ICcnfWAgKTtcbn07Il0sIm5hbWVzIjpbImdpdEFkZCIsInJlcXVpcmUiLCJnaXRDb21taXQiLCJnaXRJc0NsZWFuIiwibG9hZEpTT04iLCJ3cml0ZUpTT04iLCJ3aW5zdG9uIiwibW9kdWxlIiwiZXhwb3J0cyIsInNldFJlcG9TdXBwb3J0ZWRCcmFuZHMiLCJyZXBvIiwiYnJhbmRzIiwibWVzc2FnZSIsImluZm8iLCJwYWNrYWdlRmlsZSIsImlzQ2xlYW4iLCJFcnJvciIsInBhY2thZ2VPYmplY3QiLCJwaGV0Iiwic3VwcG9ydGVkQnJhbmRzIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7O0NBS0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsU0FBU0MsUUFBUztBQUN4QixNQUFNQyxZQUFZRCxRQUFTO0FBQzNCLE1BQU1FLGFBQWFGLFFBQVM7QUFDNUIsTUFBTUcsV0FBV0gsUUFBUztBQUMxQixNQUFNSSxZQUFZSixRQUFTO0FBQzNCLE1BQU1LLFVBQVVMLFFBQVM7QUFFekI7Ozs7Ozs7O0NBUUMsR0FDRE0sT0FBT0MsT0FBTztRQUFrQkMsMEJBQWYsb0JBQUEsVUFBdUNDLElBQUksRUFBRUMsTUFBTSxFQUFFQyxPQUFPO1FBQzNFTixRQUFRTyxJQUFJLENBQUUsQ0FBQywrQ0FBK0MsRUFBRUgsS0FBSyxJQUFJLEVBQUVDLFFBQVE7UUFFbkYsTUFBTUcsY0FBYyxDQUFDLEdBQUcsRUFBRUosS0FBSyxhQUFhLENBQUM7UUFFN0MsTUFBTUssVUFBVSxNQUFNWixXQUFZTztRQUNsQyxJQUFLLENBQUNLLFNBQVU7WUFDZCxNQUFNLElBQUlDLE1BQU8sQ0FBQyxrQkFBa0IsRUFBRU4sS0FBSywwQkFBMEIsQ0FBQztRQUN4RTtRQUVBLE1BQU1PLGdCQUFnQixNQUFNYixTQUFVVTtRQUN0Q0csY0FBY0MsSUFBSSxHQUFHRCxjQUFjQyxJQUFJLElBQUksQ0FBQztRQUM1Q0QsY0FBY0MsSUFBSSxDQUFDQyxlQUFlLEdBQUdSO1FBRXJDLE1BQU1OLFVBQVdTLGFBQWFHO1FBQzlCLE1BQU1qQixPQUFRVSxNQUFNO1FBQ3BCLE1BQU1SLFVBQVdRLE1BQU0sQ0FBQyw4QkFBOEIsRUFBRUMsT0FBTyxDQUFDLEVBQUVDLFVBQVUsQ0FBQyxFQUFFLEVBQUVBLFNBQVMsR0FBRyxJQUFJO0lBQ25HO2FBakJnQ0gsdUJBQXdCQyxJQUFJLEVBQUVDLE1BQU0sRUFBRUMsT0FBTztlQUE3Q0g7O1dBQUFBIn0=