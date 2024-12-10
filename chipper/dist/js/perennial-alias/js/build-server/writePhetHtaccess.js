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
const SimVersion = require('../browser-and-node/SimVersion').default;
const writeFile = require('../common/writeFile');
const axios = require('axios');
/**
 * Write the .htaccess file to make "latest" point to the version being deployed and allow "download" links to work on Safari
 * @param simName
 * @param version
 */ module.exports = /*#__PURE__*/ function() {
    var _writePhetHtaccess = _async_to_generator(function*(simName, version) {
        const metadataURL = `${constants.BUILD_SERVER_CONFIG.productionServerURL}/services/metadata/1.2/simulations?format=json&type=html&summary&include-unpublished=true&simulation=${simName}`;
        const pass = constants.BUILD_SERVER_CONFIG.serverToken;
        let response;
        try {
            response = yield axios({
                url: metadataURL,
                auth: {
                    username: 'token',
                    password: pass
                }
            });
        } catch (e) {
            throw new Error(e);
        }
        const body = response.data;
        // We got an error and the simulation has already been deployed to the website, bail!
        if (body.error && body.error[0] !== 'No sims found with the criteria provided') {
            throw new Error(body.error);
        } else if (!body.error) {
            const thisVersion = SimVersion.parse(version);
            const latestVersion = SimVersion.parse(body.projects[0].version.string);
            // The requested deploy is earlier than the latest version, exit without updating the .htacess
            if (thisVersion.compareNumber(latestVersion) < 0) {
                return;
            }
        }
        // We either got an error indicating that the simulation has not yet been deployed, or the requested version is later than the latest version
        // Update the .htaccess file that controls the /latest/ rewrite
        const contents = `${'RewriteEngine on\n' + 'RewriteBase /sims/html/'}${simName}/\n` + `RewriteRule ^latest(.*) ${version}$1\n` + 'Header always set Access-Control-Allow-Origin "*"\n\n' + 'RewriteCond %{QUERY_STRING} =download\n' + 'RewriteRule ([^/]*)$ - [L,E=download:$1]\n' + 'Header onsuccess set Content-disposition "attachment; filename=%{download}e" env=download\n';
        yield writeFile(`${constants.HTML_SIMS_DIRECTORY + simName}/.htaccess`, contents);
    });
    function writePhetHtaccess(simName, version) {
        return _writePhetHtaccess.apply(this, arguments);
    }
    return writePhetHtaccess;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9idWlsZC1zZXJ2ZXIvd3JpdGVQaGV0SHRhY2Nlc3MuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAxOCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG4vLyBAYXV0aG9yIE1hdHQgUGVubmluZ3RvbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcblxuXG5jb25zdCBjb25zdGFudHMgPSByZXF1aXJlKCAnLi9jb25zdGFudHMnICk7XG5jb25zdCBTaW1WZXJzaW9uID0gcmVxdWlyZSggJy4uL2Jyb3dzZXItYW5kLW5vZGUvU2ltVmVyc2lvbicgKS5kZWZhdWx0O1xuY29uc3Qgd3JpdGVGaWxlID0gcmVxdWlyZSggJy4uL2NvbW1vbi93cml0ZUZpbGUnICk7XG5jb25zdCBheGlvcyA9IHJlcXVpcmUoICdheGlvcycgKTtcblxuLyoqXG4gKiBXcml0ZSB0aGUgLmh0YWNjZXNzIGZpbGUgdG8gbWFrZSBcImxhdGVzdFwiIHBvaW50IHRvIHRoZSB2ZXJzaW9uIGJlaW5nIGRlcGxveWVkIGFuZCBhbGxvdyBcImRvd25sb2FkXCIgbGlua3MgdG8gd29yayBvbiBTYWZhcmlcbiAqIEBwYXJhbSBzaW1OYW1lXG4gKiBAcGFyYW0gdmVyc2lvblxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uIHdyaXRlUGhldEh0YWNjZXNzKCBzaW1OYW1lLCB2ZXJzaW9uICkge1xuICBjb25zdCBtZXRhZGF0YVVSTCA9IGAke2NvbnN0YW50cy5CVUlMRF9TRVJWRVJfQ09ORklHLnByb2R1Y3Rpb25TZXJ2ZXJVUkx9L3NlcnZpY2VzL21ldGFkYXRhLzEuMi9zaW11bGF0aW9ucz9mb3JtYXQ9anNvbiZ0eXBlPWh0bWwmc3VtbWFyeSZpbmNsdWRlLXVucHVibGlzaGVkPXRydWUmc2ltdWxhdGlvbj0ke3NpbU5hbWV9YDtcbiAgY29uc3QgcGFzcyA9IGNvbnN0YW50cy5CVUlMRF9TRVJWRVJfQ09ORklHLnNlcnZlclRva2VuO1xuICBsZXQgcmVzcG9uc2U7XG4gIHRyeSB7XG4gICAgcmVzcG9uc2UgPSBhd2FpdCBheGlvcygge1xuICAgICAgdXJsOiBtZXRhZGF0YVVSTCxcbiAgICAgIGF1dGg6IHtcbiAgICAgICAgdXNlcm5hbWU6ICd0b2tlbicsXG4gICAgICAgIHBhc3N3b3JkOiBwYXNzXG4gICAgICB9XG4gICAgfSApO1xuICB9XG4gIGNhdGNoKCBlICkge1xuICAgIHRocm93IG5ldyBFcnJvciggZSApO1xuICB9XG4gIGNvbnN0IGJvZHkgPSByZXNwb25zZS5kYXRhO1xuXG5cbiAgLy8gV2UgZ290IGFuIGVycm9yIGFuZCB0aGUgc2ltdWxhdGlvbiBoYXMgYWxyZWFkeSBiZWVuIGRlcGxveWVkIHRvIHRoZSB3ZWJzaXRlLCBiYWlsIVxuICBpZiAoIGJvZHkuZXJyb3IgJiYgYm9keS5lcnJvclsgMCBdICE9PSAnTm8gc2ltcyBmb3VuZCB3aXRoIHRoZSBjcml0ZXJpYSBwcm92aWRlZCcgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCBib2R5LmVycm9yICk7XG4gIH1cbiAgLy8gV2UgZGlkIG5vdCBnZXQgYW4gZXJyb3IsIGNvbXBhcmUgdGhlIGRlcGxveSByZXF1ZXN0IHZlcnNpb24gd2l0aCB0aGUgd2Vic2l0ZSwgaWYgdGhlIHJlcXVlc3QgaXMgZm9yIGEgbGF0ZXIgdmVyc2lvbiwgdXBkYXRlIGl0LlxuICBlbHNlIGlmICggIWJvZHkuZXJyb3IgKSB7XG4gICAgY29uc3QgdGhpc1ZlcnNpb24gPSBTaW1WZXJzaW9uLnBhcnNlKCB2ZXJzaW9uICk7XG4gICAgY29uc3QgbGF0ZXN0VmVyc2lvbiA9IFNpbVZlcnNpb24ucGFyc2UoIGJvZHkucHJvamVjdHNbIDAgXS52ZXJzaW9uLnN0cmluZyApO1xuICAgIC8vIFRoZSByZXF1ZXN0ZWQgZGVwbG95IGlzIGVhcmxpZXIgdGhhbiB0aGUgbGF0ZXN0IHZlcnNpb24sIGV4aXQgd2l0aG91dCB1cGRhdGluZyB0aGUgLmh0YWNlc3NcbiAgICBpZiAoIHRoaXNWZXJzaW9uLmNvbXBhcmVOdW1iZXIoIGxhdGVzdFZlcnNpb24gKSA8IDAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgLy8gV2UgZWl0aGVyIGdvdCBhbiBlcnJvciBpbmRpY2F0aW5nIHRoYXQgdGhlIHNpbXVsYXRpb24gaGFzIG5vdCB5ZXQgYmVlbiBkZXBsb3llZCwgb3IgdGhlIHJlcXVlc3RlZCB2ZXJzaW9uIGlzIGxhdGVyIHRoYW4gdGhlIGxhdGVzdCB2ZXJzaW9uXG4gIC8vIFVwZGF0ZSB0aGUgLmh0YWNjZXNzIGZpbGUgdGhhdCBjb250cm9scyB0aGUgL2xhdGVzdC8gcmV3cml0ZVxuICBjb25zdCBjb250ZW50cyA9IGAkeydSZXdyaXRlRW5naW5lIG9uXFxuJyArXG4gICAgICAgICAgICAgICAgICAgJ1Jld3JpdGVCYXNlIC9zaW1zL2h0bWwvJ30ke3NpbU5hbWV9L1xcbmAgK1xuICAgICAgICAgICAgICAgICAgIGBSZXdyaXRlUnVsZSBebGF0ZXN0KC4qKSAke3ZlcnNpb259JDFcXG5gICtcbiAgICAgICAgICAgICAgICAgICAnSGVhZGVyIGFsd2F5cyBzZXQgQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luIFwiKlwiXFxuXFxuJyArXG4gICAgICAgICAgICAgICAgICAgJ1Jld3JpdGVDb25kICV7UVVFUllfU1RSSU5HfSA9ZG93bmxvYWRcXG4nICtcbiAgICAgICAgICAgICAgICAgICAnUmV3cml0ZVJ1bGUgKFteL10qKSQgLSBbTCxFPWRvd25sb2FkOiQxXVxcbicgK1xuICAgICAgICAgICAgICAgICAgICdIZWFkZXIgb25zdWNjZXNzIHNldCBDb250ZW50LWRpc3Bvc2l0aW9uIFwiYXR0YWNobWVudDsgZmlsZW5hbWU9JXtkb3dubG9hZH1lXCIgZW52PWRvd25sb2FkXFxuJztcbiAgYXdhaXQgd3JpdGVGaWxlKCBgJHtjb25zdGFudHMuSFRNTF9TSU1TX0RJUkVDVE9SWSArIHNpbU5hbWV9Ly5odGFjY2Vzc2AsIGNvbnRlbnRzICk7XG59OyJdLCJuYW1lcyI6WyJjb25zdGFudHMiLCJyZXF1aXJlIiwiU2ltVmVyc2lvbiIsImRlZmF1bHQiLCJ3cml0ZUZpbGUiLCJheGlvcyIsIm1vZHVsZSIsImV4cG9ydHMiLCJ3cml0ZVBoZXRIdGFjY2VzcyIsInNpbU5hbWUiLCJ2ZXJzaW9uIiwibWV0YWRhdGFVUkwiLCJCVUlMRF9TRVJWRVJfQ09ORklHIiwicHJvZHVjdGlvblNlcnZlclVSTCIsInBhc3MiLCJzZXJ2ZXJUb2tlbiIsInJlc3BvbnNlIiwidXJsIiwiYXV0aCIsInVzZXJuYW1lIiwicGFzc3dvcmQiLCJlIiwiRXJyb3IiLCJib2R5IiwiZGF0YSIsImVycm9yIiwidGhpc1ZlcnNpb24iLCJwYXJzZSIsImxhdGVzdFZlcnNpb24iLCJwcm9qZWN0cyIsInN0cmluZyIsImNvbXBhcmVOdW1iZXIiLCJjb250ZW50cyIsIkhUTUxfU0lNU19ESVJFQ1RPUlkiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUN0RCx5REFBeUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUd6RCxNQUFNQSxZQUFZQyxRQUFTO0FBQzNCLE1BQU1DLGFBQWFELFFBQVMsa0NBQW1DRSxPQUFPO0FBQ3RFLE1BQU1DLFlBQVlILFFBQVM7QUFDM0IsTUFBTUksUUFBUUosUUFBUztBQUV2Qjs7OztDQUlDLEdBQ0RLLE9BQU9DLE9BQU87UUFBa0JDLHFCQUFmLG9CQUFBLFVBQWtDQyxPQUFPLEVBQUVDLE9BQU87UUFDakUsTUFBTUMsY0FBYyxHQUFHWCxVQUFVWSxtQkFBbUIsQ0FBQ0MsbUJBQW1CLENBQUMscUdBQXFHLEVBQUVKLFNBQVM7UUFDekwsTUFBTUssT0FBT2QsVUFBVVksbUJBQW1CLENBQUNHLFdBQVc7UUFDdEQsSUFBSUM7UUFDSixJQUFJO1lBQ0ZBLFdBQVcsTUFBTVgsTUFBTztnQkFDdEJZLEtBQUtOO2dCQUNMTyxNQUFNO29CQUNKQyxVQUFVO29CQUNWQyxVQUFVTjtnQkFDWjtZQUNGO1FBQ0YsRUFDQSxPQUFPTyxHQUFJO1lBQ1QsTUFBTSxJQUFJQyxNQUFPRDtRQUNuQjtRQUNBLE1BQU1FLE9BQU9QLFNBQVNRLElBQUk7UUFHMUIscUZBQXFGO1FBQ3JGLElBQUtELEtBQUtFLEtBQUssSUFBSUYsS0FBS0UsS0FBSyxDQUFFLEVBQUcsS0FBSyw0Q0FBNkM7WUFDbEYsTUFBTSxJQUFJSCxNQUFPQyxLQUFLRSxLQUFLO1FBQzdCLE9BRUssSUFBSyxDQUFDRixLQUFLRSxLQUFLLEVBQUc7WUFDdEIsTUFBTUMsY0FBY3hCLFdBQVd5QixLQUFLLENBQUVqQjtZQUN0QyxNQUFNa0IsZ0JBQWdCMUIsV0FBV3lCLEtBQUssQ0FBRUosS0FBS00sUUFBUSxDQUFFLEVBQUcsQ0FBQ25CLE9BQU8sQ0FBQ29CLE1BQU07WUFDekUsOEZBQThGO1lBQzlGLElBQUtKLFlBQVlLLGFBQWEsQ0FBRUgsaUJBQWtCLEdBQUk7Z0JBQ3BEO1lBQ0Y7UUFDRjtRQUVBLDZJQUE2STtRQUM3SSwrREFBK0Q7UUFDL0QsTUFBTUksV0FBVyxHQUFHLHVCQUNILDRCQUE0QnZCLFFBQVEsR0FBRyxDQUFDLEdBQ3hDLENBQUMsd0JBQXdCLEVBQUVDLFFBQVEsSUFBSSxDQUFDLEdBQ3hDLDBEQUNBLDRDQUNBLCtDQUNBO1FBQ2pCLE1BQU1OLFVBQVcsR0FBR0osVUFBVWlDLG1CQUFtQixHQUFHeEIsUUFBUSxVQUFVLENBQUMsRUFBRXVCO0lBQzNFO2FBM0NnQ3hCLGtCQUFtQkMsT0FBTyxFQUFFQyxPQUFPO2VBQW5DRjs7V0FBQUEifQ==