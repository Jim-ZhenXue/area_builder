// Copyright 2017, University of Colorado Boulder
/**
 * Builds a repository.
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
const ChipperVersion = require('./ChipperVersion');
const execute = require('./execute').default;
const getBuildArguments = require('./getBuildArguments');
const gruntCommand = require('./gruntCommand');
const fs = require('fs');
const winston = require('winston');
/**
 * Builds a repository.
 * @public
 *
 * @param {string} repo
 * @param {Object} [options]
 * @returns {Promise.<string>} - The stdout of the build
 */ module.exports = /*#__PURE__*/ function() {
    var _build = _async_to_generator(function*(repo, options) {
        winston.info(`building ${repo}`);
        const chipperVersion = ChipperVersion.getFromRepository();
        const args = getBuildArguments(chipperVersion, options);
        const result = yield execute(gruntCommand, args, `../${repo}`);
        const packageObject = JSON.parse(fs.readFileSync(`../${repo}/package.json`, 'utf8'));
        const includesPhetio = packageObject.phet && packageObject.phet.supportedBrands && packageObject.phet.supportedBrands.includes('phet-io');
        // Examine output to see if getDependencies (in chipper) notices any missing phet-io things.
        // Fail out if so. Detects that specific error message.
        if (includesPhetio && result.includes('WARNING404')) {
            throw new Error('phet-io dependencies missing');
        }
        return result;
    });
    function build(repo, options) {
        return _build.apply(this, arguments);
    }
    return build;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vYnVpbGQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTcsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEJ1aWxkcyBhIHJlcG9zaXRvcnkuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IENoaXBwZXJWZXJzaW9uID0gcmVxdWlyZSggJy4vQ2hpcHBlclZlcnNpb24nICk7XG5jb25zdCBleGVjdXRlID0gcmVxdWlyZSggJy4vZXhlY3V0ZScgKS5kZWZhdWx0O1xuY29uc3QgZ2V0QnVpbGRBcmd1bWVudHMgPSByZXF1aXJlKCAnLi9nZXRCdWlsZEFyZ3VtZW50cycgKTtcbmNvbnN0IGdydW50Q29tbWFuZCA9IHJlcXVpcmUoICcuL2dydW50Q29tbWFuZCcgKTtcbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuXG4vKipcbiAqIEJ1aWxkcyBhIHJlcG9zaXRvcnkuXG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG9cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAqIEByZXR1cm5zIHtQcm9taXNlLjxzdHJpbmc+fSAtIFRoZSBzdGRvdXQgb2YgdGhlIGJ1aWxkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24gYnVpbGQoIHJlcG8sIG9wdGlvbnMgKSB7XG4gIHdpbnN0b24uaW5mbyggYGJ1aWxkaW5nICR7cmVwb31gICk7XG5cbiAgY29uc3QgY2hpcHBlclZlcnNpb24gPSBDaGlwcGVyVmVyc2lvbi5nZXRGcm9tUmVwb3NpdG9yeSgpO1xuICBjb25zdCBhcmdzID0gZ2V0QnVpbGRBcmd1bWVudHMoIGNoaXBwZXJWZXJzaW9uLCBvcHRpb25zICk7XG5cbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXhlY3V0ZSggZ3J1bnRDb21tYW5kLCBhcmdzLCBgLi4vJHtyZXBvfWAgKTtcblxuICBjb25zdCBwYWNrYWdlT2JqZWN0ID0gSlNPTi5wYXJzZSggZnMucmVhZEZpbGVTeW5jKCBgLi4vJHtyZXBvfS9wYWNrYWdlLmpzb25gLCAndXRmOCcgKSApO1xuICBjb25zdCBpbmNsdWRlc1BoZXRpbyA9IHBhY2thZ2VPYmplY3QucGhldCAmJiBwYWNrYWdlT2JqZWN0LnBoZXQuc3VwcG9ydGVkQnJhbmRzICYmIHBhY2thZ2VPYmplY3QucGhldC5zdXBwb3J0ZWRCcmFuZHMuaW5jbHVkZXMoICdwaGV0LWlvJyApO1xuXG4gIC8vIEV4YW1pbmUgb3V0cHV0IHRvIHNlZSBpZiBnZXREZXBlbmRlbmNpZXMgKGluIGNoaXBwZXIpIG5vdGljZXMgYW55IG1pc3NpbmcgcGhldC1pbyB0aGluZ3MuXG4gIC8vIEZhaWwgb3V0IGlmIHNvLiBEZXRlY3RzIHRoYXQgc3BlY2lmaWMgZXJyb3IgbWVzc2FnZS5cbiAgaWYgKCBpbmNsdWRlc1BoZXRpbyAmJiByZXN1bHQuaW5jbHVkZXMoICdXQVJOSU5HNDA0JyApICkge1xuICAgIHRocm93IG5ldyBFcnJvciggJ3BoZXQtaW8gZGVwZW5kZW5jaWVzIG1pc3NpbmcnICk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufTsiXSwibmFtZXMiOlsiQ2hpcHBlclZlcnNpb24iLCJyZXF1aXJlIiwiZXhlY3V0ZSIsImRlZmF1bHQiLCJnZXRCdWlsZEFyZ3VtZW50cyIsImdydW50Q29tbWFuZCIsImZzIiwid2luc3RvbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJidWlsZCIsInJlcG8iLCJvcHRpb25zIiwiaW5mbyIsImNoaXBwZXJWZXJzaW9uIiwiZ2V0RnJvbVJlcG9zaXRvcnkiLCJhcmdzIiwicmVzdWx0IiwicGFja2FnZU9iamVjdCIsIkpTT04iLCJwYXJzZSIsInJlYWRGaWxlU3luYyIsImluY2x1ZGVzUGhldGlvIiwicGhldCIsInN1cHBvcnRlZEJyYW5kcyIsImluY2x1ZGVzIiwiRXJyb3IiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE1BQU1BLGlCQUFpQkMsUUFBUztBQUNoQyxNQUFNQyxVQUFVRCxRQUFTLGFBQWNFLE9BQU87QUFDOUMsTUFBTUMsb0JBQW9CSCxRQUFTO0FBQ25DLE1BQU1JLGVBQWVKLFFBQVM7QUFDOUIsTUFBTUssS0FBS0wsUUFBUztBQUNwQixNQUFNTSxVQUFVTixRQUFTO0FBRXpCOzs7Ozs7O0NBT0MsR0FDRE8sT0FBT0MsT0FBTztRQUFrQkMsU0FBZixvQkFBQSxVQUFzQkMsSUFBSSxFQUFFQyxPQUFPO1FBQ2xETCxRQUFRTSxJQUFJLENBQUUsQ0FBQyxTQUFTLEVBQUVGLE1BQU07UUFFaEMsTUFBTUcsaUJBQWlCZCxlQUFlZSxpQkFBaUI7UUFDdkQsTUFBTUMsT0FBT1osa0JBQW1CVSxnQkFBZ0JGO1FBRWhELE1BQU1LLFNBQVMsTUFBTWYsUUFBU0csY0FBY1csTUFBTSxDQUFDLEdBQUcsRUFBRUwsTUFBTTtRQUU5RCxNQUFNTyxnQkFBZ0JDLEtBQUtDLEtBQUssQ0FBRWQsR0FBR2UsWUFBWSxDQUFFLENBQUMsR0FBRyxFQUFFVixLQUFLLGFBQWEsQ0FBQyxFQUFFO1FBQzlFLE1BQU1XLGlCQUFpQkosY0FBY0ssSUFBSSxJQUFJTCxjQUFjSyxJQUFJLENBQUNDLGVBQWUsSUFBSU4sY0FBY0ssSUFBSSxDQUFDQyxlQUFlLENBQUNDLFFBQVEsQ0FBRTtRQUVoSSw0RkFBNEY7UUFDNUYsdURBQXVEO1FBQ3ZELElBQUtILGtCQUFrQkwsT0FBT1EsUUFBUSxDQUFFLGVBQWlCO1lBQ3ZELE1BQU0sSUFBSUMsTUFBTztRQUNuQjtRQUVBLE9BQU9UO0lBQ1Q7YUFsQmdDUCxNQUFPQyxJQUFJLEVBQUVDLE9BQU87ZUFBcEJGOztXQUFBQSJ9