// Copyright 2017, University of Colorado Boulder
/**
 * Returns the version of the current checked-in repo's package.json
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
const SimVersion = require('../browser-and-node/SimVersion').default;
const loadJSON = require('./loadJSON');
const winston = require('winston');
/**
 * Returns the version for a current checked-in repo
 * @public
 *
 * @param {string} repo - The repository name
 * @returns {Promise.<SimVersion>}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo) {
    winston.debug(`Reading version from package.json for ${repo}`);
    const packageObject = yield loadJSON(`../${repo}/package.json`);
    return SimVersion.parse(packageObject.version);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2V0UmVwb1ZlcnNpb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTcsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFJldHVybnMgdGhlIHZlcnNpb24gb2YgdGhlIGN1cnJlbnQgY2hlY2tlZC1pbiByZXBvJ3MgcGFja2FnZS5qc29uXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IFNpbVZlcnNpb24gPSByZXF1aXJlKCAnLi4vYnJvd3Nlci1hbmQtbm9kZS9TaW1WZXJzaW9uJyApLmRlZmF1bHQ7XG5jb25zdCBsb2FkSlNPTiA9IHJlcXVpcmUoICcuL2xvYWRKU09OJyApO1xuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIHZlcnNpb24gZm9yIGEgY3VycmVudCBjaGVja2VkLWluIHJlcG9cbiAqIEBwdWJsaWNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwbyAtIFRoZSByZXBvc2l0b3J5IG5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlLjxTaW1WZXJzaW9uPn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiggcmVwbyApIHtcbiAgd2luc3Rvbi5kZWJ1ZyggYFJlYWRpbmcgdmVyc2lvbiBmcm9tIHBhY2thZ2UuanNvbiBmb3IgJHtyZXBvfWAgKTtcblxuICBjb25zdCBwYWNrYWdlT2JqZWN0ID0gYXdhaXQgbG9hZEpTT04oIGAuLi8ke3JlcG99L3BhY2thZ2UuanNvbmAgKTtcbiAgcmV0dXJuIFNpbVZlcnNpb24ucGFyc2UoIHBhY2thZ2VPYmplY3QudmVyc2lvbiApO1xufTsiXSwibmFtZXMiOlsiU2ltVmVyc2lvbiIsInJlcXVpcmUiLCJkZWZhdWx0IiwibG9hZEpTT04iLCJ3aW5zdG9uIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJkZWJ1ZyIsInBhY2thZ2VPYmplY3QiLCJwYXJzZSIsInZlcnNpb24iXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE1BQU1BLGFBQWFDLFFBQVMsa0NBQW1DQyxPQUFPO0FBQ3RFLE1BQU1DLFdBQVdGLFFBQVM7QUFDMUIsTUFBTUcsVUFBVUgsUUFBUztBQUV6Qjs7Ozs7O0NBTUMsR0FDREksT0FBT0MsT0FBTyxxQ0FBRyxVQUFnQkMsSUFBSTtJQUNuQ0gsUUFBUUksS0FBSyxDQUFFLENBQUMsc0NBQXNDLEVBQUVELE1BQU07SUFFOUQsTUFBTUUsZ0JBQWdCLE1BQU1OLFNBQVUsQ0FBQyxHQUFHLEVBQUVJLEtBQUssYUFBYSxDQUFDO0lBQy9ELE9BQU9QLFdBQVdVLEtBQUssQ0FBRUQsY0FBY0UsT0FBTztBQUNoRCJ9