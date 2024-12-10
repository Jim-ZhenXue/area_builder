// Copyright 2017-2018, University of Colorado Boulder
// @author Matt Pennington (PhET Interactive Simulations)
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
const constants = require('./constants');
const devSsh = require('../common/devSsh');
const rsync = require('rsync');
const winston = require('winston');
const writeFile = require('../common/writeFile');
const fs = require('fs');
const user = constants.BUILD_SERVER_CONFIG.devUsername;
const host = constants.BUILD_SERVER_CONFIG.devDeployServer;
/**
 * Copy files to dev server, typically bayes.colorado.edu.
 *
 * @param {string} simDir
 * @param {string} simName
 * @param {string} version
 * @param {ChipperVersion} chipperVersion
 * @param {string[]} brands
 * @param {string} buildDir
 */ module.exports = /*#__PURE__*/ function() {
    var _devDeploy = _async_to_generator(function*(simDir, simName, version, chipperVersion, brands, buildDir) {
        const simDirectory = constants.BUILD_SERVER_CONFIG.devDeployPath + simName;
        let versionDirectory = version;
        // Chipper 1.0 has -phetio in the version schema for PhET-iO branded sims
        if (brands.length === 1 && brands[0] === constants.PHET_IO_BRAND && chipperVersion.major === 0 && !version.match('-phetio')) {
            versionDirectory = version.split('-').join('-phetio');
        }
        const simVersionDirectory = `${simDirectory}/${versionDirectory}`;
        // mkdir first in case it doesn't exist already
        yield devSsh(`mkdir -p ${simVersionDirectory}`);
        // copy the files
        let rsyncFilterFile = buildDir;
        if (chipperVersion.major === 2 && chipperVersion.minor === 0) {
            rsyncFilterFile += '/phet';
        }
        rsyncFilterFile += '/.rsync-filter';
        if (brands.includes(constants.PHET_BRAND)) {
            const rsyncFilterContents = '- *_CA*\n+ *_en*\n+ *_all*\n+ *_a11y*\n- *.html';
            yield writeFile(rsyncFilterFile, rsyncFilterContents);
        }
        yield new Promise((resolve, reject)=>{
            new rsync().flags('razpFFO').set('no-perms').source(`${buildDir}/`).destination(`${user}@${host}:${simVersionDirectory}`).execute((err, code, cmd)=>{
                if (err) {
                    winston.debug(code);
                    winston.debug(cmd);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
        if (brands.includes(constants.PHET_BRAND)) {
            fs.unlinkSync(rsyncFilterFile);
        }
    });
    function devDeploy(simDir, simName, version, chipperVersion, brands, buildDir) {
        return _devDeploy.apply(this, arguments);
    }
    return devDeploy;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9idWlsZC1zZXJ2ZXIvZGV2RGVwbG95LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMTgsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuLy8gQGF1dGhvciBNYXR0IFBlbm5pbmd0b24gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG5cblxuY29uc3QgY29uc3RhbnRzID0gcmVxdWlyZSggJy4vY29uc3RhbnRzJyApO1xuY29uc3QgZGV2U3NoID0gcmVxdWlyZSggJy4uL2NvbW1vbi9kZXZTc2gnICk7XG5jb25zdCByc3luYyA9IHJlcXVpcmUoICdyc3luYycgKTtcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcbmNvbnN0IHdyaXRlRmlsZSA9IHJlcXVpcmUoICcuLi9jb21tb24vd3JpdGVGaWxlJyApO1xuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XG5cbmNvbnN0IHVzZXIgPSBjb25zdGFudHMuQlVJTERfU0VSVkVSX0NPTkZJRy5kZXZVc2VybmFtZTtcbmNvbnN0IGhvc3QgPSBjb25zdGFudHMuQlVJTERfU0VSVkVSX0NPTkZJRy5kZXZEZXBsb3lTZXJ2ZXI7XG5cbi8qKlxuICogQ29weSBmaWxlcyB0byBkZXYgc2VydmVyLCB0eXBpY2FsbHkgYmF5ZXMuY29sb3JhZG8uZWR1LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzaW1EaXJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzaW1OYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gdmVyc2lvblxuICogQHBhcmFtIHtDaGlwcGVyVmVyc2lvbn0gY2hpcHBlclZlcnNpb25cbiAqIEBwYXJhbSB7c3RyaW5nW119IGJyYW5kc1xuICogQHBhcmFtIHtzdHJpbmd9IGJ1aWxkRGlyXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24gZGV2RGVwbG95KCBzaW1EaXIsIHNpbU5hbWUsIHZlcnNpb24sIGNoaXBwZXJWZXJzaW9uLCBicmFuZHMsIGJ1aWxkRGlyICkge1xuICBjb25zdCBzaW1EaXJlY3RvcnkgPSBjb25zdGFudHMuQlVJTERfU0VSVkVSX0NPTkZJRy5kZXZEZXBsb3lQYXRoICsgc2ltTmFtZTtcbiAgbGV0IHZlcnNpb25EaXJlY3RvcnkgPSB2ZXJzaW9uO1xuXG4gIC8vIENoaXBwZXIgMS4wIGhhcyAtcGhldGlvIGluIHRoZSB2ZXJzaW9uIHNjaGVtYSBmb3IgUGhFVC1pTyBicmFuZGVkIHNpbXNcbiAgaWYgKCBicmFuZHMubGVuZ3RoID09PSAxICYmIGJyYW5kc1sgMCBdID09PSBjb25zdGFudHMuUEhFVF9JT19CUkFORCAmJiBjaGlwcGVyVmVyc2lvbi5tYWpvciA9PT0gMCAmJiAhdmVyc2lvbi5tYXRjaCggJy1waGV0aW8nICkgKSB7XG4gICAgdmVyc2lvbkRpcmVjdG9yeSA9IHZlcnNpb24uc3BsaXQoICctJyApLmpvaW4oICctcGhldGlvJyApO1xuICB9XG4gIGNvbnN0IHNpbVZlcnNpb25EaXJlY3RvcnkgPSBgJHtzaW1EaXJlY3Rvcnl9LyR7dmVyc2lvbkRpcmVjdG9yeX1gO1xuXG4gIC8vIG1rZGlyIGZpcnN0IGluIGNhc2UgaXQgZG9lc24ndCBleGlzdCBhbHJlYWR5XG4gIGF3YWl0IGRldlNzaCggYG1rZGlyIC1wICR7c2ltVmVyc2lvbkRpcmVjdG9yeX1gICk7XG5cbiAgLy8gY29weSB0aGUgZmlsZXNcbiAgbGV0IHJzeW5jRmlsdGVyRmlsZSA9IGJ1aWxkRGlyO1xuICBpZiAoIGNoaXBwZXJWZXJzaW9uLm1ham9yID09PSAyICYmIGNoaXBwZXJWZXJzaW9uLm1pbm9yID09PSAwICkge1xuICAgIHJzeW5jRmlsdGVyRmlsZSArPSAnL3BoZXQnO1xuICB9XG4gIHJzeW5jRmlsdGVyRmlsZSArPSAnLy5yc3luYy1maWx0ZXInO1xuXG4gIGlmICggYnJhbmRzLmluY2x1ZGVzKCBjb25zdGFudHMuUEhFVF9CUkFORCApICkge1xuICAgIGNvbnN0IHJzeW5jRmlsdGVyQ29udGVudHMgPSAnLSAqX0NBKlxcbisgKl9lbipcXG4rICpfYWxsKlxcbisgKl9hMTF5Klxcbi0gKi5odG1sJztcbiAgICBhd2FpdCB3cml0ZUZpbGUoIHJzeW5jRmlsdGVyRmlsZSwgcnN5bmNGaWx0ZXJDb250ZW50cyApO1xuICB9XG5cbiAgYXdhaXQgbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xuICAgIG5ldyByc3luYygpXG4gICAgICAuZmxhZ3MoICdyYXpwRkZPJyApXG4gICAgICAuc2V0KCAnbm8tcGVybXMnIClcbiAgICAgIC5zb3VyY2UoIGAke2J1aWxkRGlyfS9gIClcbiAgICAgIC5kZXN0aW5hdGlvbiggYCR7dXNlcn1AJHtob3N0fToke3NpbVZlcnNpb25EaXJlY3Rvcnl9YCApXG4gICAgICAuZXhlY3V0ZSggKCBlcnIsIGNvZGUsIGNtZCApID0+IHtcbiAgICAgICAgaWYgKCBlcnIgKSB7XG4gICAgICAgICAgd2luc3Rvbi5kZWJ1ZyggY29kZSApO1xuICAgICAgICAgIHdpbnN0b24uZGVidWcoIGNtZCApO1xuICAgICAgICAgIHJlamVjdCggZXJyICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7IHJlc29sdmUoKTsgfVxuICAgICAgfSApO1xuICB9ICk7XG5cbiAgaWYgKCBicmFuZHMuaW5jbHVkZXMoIGNvbnN0YW50cy5QSEVUX0JSQU5EICkgKSB7XG4gICAgZnMudW5saW5rU3luYyggcnN5bmNGaWx0ZXJGaWxlICk7XG4gIH1cbn07Il0sIm5hbWVzIjpbImNvbnN0YW50cyIsInJlcXVpcmUiLCJkZXZTc2giLCJyc3luYyIsIndpbnN0b24iLCJ3cml0ZUZpbGUiLCJmcyIsInVzZXIiLCJCVUlMRF9TRVJWRVJfQ09ORklHIiwiZGV2VXNlcm5hbWUiLCJob3N0IiwiZGV2RGVwbG95U2VydmVyIiwibW9kdWxlIiwiZXhwb3J0cyIsImRldkRlcGxveSIsInNpbURpciIsInNpbU5hbWUiLCJ2ZXJzaW9uIiwiY2hpcHBlclZlcnNpb24iLCJicmFuZHMiLCJidWlsZERpciIsInNpbURpcmVjdG9yeSIsImRldkRlcGxveVBhdGgiLCJ2ZXJzaW9uRGlyZWN0b3J5IiwibGVuZ3RoIiwiUEhFVF9JT19CUkFORCIsIm1ham9yIiwibWF0Y2giLCJzcGxpdCIsImpvaW4iLCJzaW1WZXJzaW9uRGlyZWN0b3J5IiwicnN5bmNGaWx0ZXJGaWxlIiwibWlub3IiLCJpbmNsdWRlcyIsIlBIRVRfQlJBTkQiLCJyc3luY0ZpbHRlckNvbnRlbnRzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJmbGFncyIsInNldCIsInNvdXJjZSIsImRlc3RpbmF0aW9uIiwiZXhlY3V0ZSIsImVyciIsImNvZGUiLCJjbWQiLCJkZWJ1ZyIsInVubGlua1N5bmMiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUN0RCx5REFBeUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUd6RCxNQUFNQSxZQUFZQyxRQUFTO0FBQzNCLE1BQU1DLFNBQVNELFFBQVM7QUFDeEIsTUFBTUUsUUFBUUYsUUFBUztBQUN2QixNQUFNRyxVQUFVSCxRQUFTO0FBQ3pCLE1BQU1JLFlBQVlKLFFBQVM7QUFDM0IsTUFBTUssS0FBS0wsUUFBUztBQUVwQixNQUFNTSxPQUFPUCxVQUFVUSxtQkFBbUIsQ0FBQ0MsV0FBVztBQUN0RCxNQUFNQyxPQUFPVixVQUFVUSxtQkFBbUIsQ0FBQ0csZUFBZTtBQUUxRDs7Ozs7Ozs7O0NBU0MsR0FDREMsT0FBT0MsT0FBTztRQUFrQkMsYUFBZixvQkFBQSxVQUEwQkMsTUFBTSxFQUFFQyxPQUFPLEVBQUVDLE9BQU8sRUFBRUMsY0FBYyxFQUFFQyxNQUFNLEVBQUVDLFFBQVE7UUFDbkcsTUFBTUMsZUFBZXJCLFVBQVVRLG1CQUFtQixDQUFDYyxhQUFhLEdBQUdOO1FBQ25FLElBQUlPLG1CQUFtQk47UUFFdkIseUVBQXlFO1FBQ3pFLElBQUtFLE9BQU9LLE1BQU0sS0FBSyxLQUFLTCxNQUFNLENBQUUsRUFBRyxLQUFLbkIsVUFBVXlCLGFBQWEsSUFBSVAsZUFBZVEsS0FBSyxLQUFLLEtBQUssQ0FBQ1QsUUFBUVUsS0FBSyxDQUFFLFlBQWM7WUFDaklKLG1CQUFtQk4sUUFBUVcsS0FBSyxDQUFFLEtBQU1DLElBQUksQ0FBRTtRQUNoRDtRQUNBLE1BQU1DLHNCQUFzQixHQUFHVCxhQUFhLENBQUMsRUFBRUUsa0JBQWtCO1FBRWpFLCtDQUErQztRQUMvQyxNQUFNckIsT0FBUSxDQUFDLFNBQVMsRUFBRTRCLHFCQUFxQjtRQUUvQyxpQkFBaUI7UUFDakIsSUFBSUMsa0JBQWtCWDtRQUN0QixJQUFLRixlQUFlUSxLQUFLLEtBQUssS0FBS1IsZUFBZWMsS0FBSyxLQUFLLEdBQUk7WUFDOURELG1CQUFtQjtRQUNyQjtRQUNBQSxtQkFBbUI7UUFFbkIsSUFBS1osT0FBT2MsUUFBUSxDQUFFakMsVUFBVWtDLFVBQVUsR0FBSztZQUM3QyxNQUFNQyxzQkFBc0I7WUFDNUIsTUFBTTlCLFVBQVcwQixpQkFBaUJJO1FBQ3BDO1FBRUEsTUFBTSxJQUFJQyxRQUFTLENBQUVDLFNBQVNDO1lBQzVCLElBQUluQyxRQUNEb0MsS0FBSyxDQUFFLFdBQ1BDLEdBQUcsQ0FBRSxZQUNMQyxNQUFNLENBQUUsR0FBR3JCLFNBQVMsQ0FBQyxDQUFDLEVBQ3RCc0IsV0FBVyxDQUFFLEdBQUduQyxLQUFLLENBQUMsRUFBRUcsS0FBSyxDQUFDLEVBQUVvQixxQkFBcUIsRUFDckRhLE9BQU8sQ0FBRSxDQUFFQyxLQUFLQyxNQUFNQztnQkFDckIsSUFBS0YsS0FBTTtvQkFDVHhDLFFBQVEyQyxLQUFLLENBQUVGO29CQUNmekMsUUFBUTJDLEtBQUssQ0FBRUQ7b0JBQ2ZSLE9BQVFNO2dCQUNWLE9BQ0s7b0JBQUVQO2dCQUFXO1lBQ3BCO1FBQ0o7UUFFQSxJQUFLbEIsT0FBT2MsUUFBUSxDQUFFakMsVUFBVWtDLFVBQVUsR0FBSztZQUM3QzVCLEdBQUcwQyxVQUFVLENBQUVqQjtRQUNqQjtJQUNGO2FBNUNnQ2pCLFVBQVdDLE1BQU0sRUFBRUMsT0FBTyxFQUFFQyxPQUFPLEVBQUVDLGNBQWMsRUFBRUMsTUFBTSxFQUFFQyxRQUFRO2VBQXJFTjs7V0FBQUEifQ==