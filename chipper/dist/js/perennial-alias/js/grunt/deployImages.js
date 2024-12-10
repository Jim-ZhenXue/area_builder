// Copyright 2020, University of Colorado Boulder
/**
 * Sends a request to the build server.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ // modules
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
const buildLocal = require('../common/buildLocal');
const winston = require('winston');
const axios = require('axios');
/**
 * Sends a request to the build server.
 * @public
 *
 * @param {Object} [options]
 * @property {string} options.branch
 * @property {string} options.brands - CSV
 * @property {string} options.simulation - sim name
 * @returns {Promise} - No resolved value
 */ const deployImages = /*#__PURE__*/ _async_to_generator(function*({ branch, brands, simulation }) {
    const requestObject = {
        brands: brands || 'phet',
        branch: branch || 'main',
        authorizationCode: buildLocal.buildServerAuthorizationCode
    };
    if (buildLocal.buildServerNotifyEmail) {
        requestObject.email = buildLocal.buildServerNotifyEmail;
    }
    if (simulation) {
        requestObject.simulation = simulation;
        try {
            var _metadataResponse_data_projects__version, _metadataResponse_data_projects_, _metadataResponse_data_projects, _metadataResponse_data;
            const metadataResponse = yield axios.get(`https://phet.colorado.edu/services/metadata/1.2/simulations?format=json&summary&locale=en&type=html&simulation=${simulation}`);
            if (metadataResponse.data && ((_metadataResponse_data = metadataResponse.data) == null ? void 0 : (_metadataResponse_data_projects = _metadataResponse_data.projects) == null ? void 0 : (_metadataResponse_data_projects_ = _metadataResponse_data_projects[0]) == null ? void 0 : (_metadataResponse_data_projects__version = _metadataResponse_data_projects_.version) == null ? void 0 : _metadataResponse_data_projects__version.string)) {
                requestObject.version = metadataResponse.data.projects[0].version.string;
            } else {
                console.error('Unable to find version for simulation', metadataResponse.data);
                return;
            }
        } catch (e) {
            console.error('Unable to deploy images for sim due to error in metadata retrival', e);
            return;
        }
    }
    winston.info(`sending image deploy request for ${requestObject.branch}, ${requestObject.brands}`);
    const url = `${buildLocal.productionServerURL}/deploy-images`;
    winston.info(url);
    winston.info(JSON.stringify(requestObject));
    let response;
    try {
        response = yield axios({
            method: 'post',
            url: url,
            data: requestObject
        });
    } catch (error) {
        throw new Error(`Image deploy request failed with error ${error}.`);
    }
    if (response.status !== 200 && response.status !== 202) {
        throw new Error(`Image deploy request failed with status code ${response.status}.`);
    } else {
        winston.info('Image deploy request sent successfully.  If additional alternative images were deployed, go to the main admin page and trigger a recount.');
    }
});
module.exports = deployImages;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC9kZXBsb3lJbWFnZXMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFNlbmRzIGEgcmVxdWVzdCB0byB0aGUgYnVpbGQgc2VydmVyLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG4vLyBtb2R1bGVzXG5jb25zdCBidWlsZExvY2FsID0gcmVxdWlyZSggJy4uL2NvbW1vbi9idWlsZExvY2FsJyApO1xuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuY29uc3QgYXhpb3MgPSByZXF1aXJlKCAnYXhpb3MnICk7XG5cbi8qKlxuICogU2VuZHMgYSByZXF1ZXN0IHRvIHRoZSBidWlsZCBzZXJ2ZXIuXG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHByb3BlcnR5IHtzdHJpbmd9IG9wdGlvbnMuYnJhbmNoXG4gKiBAcHJvcGVydHkge3N0cmluZ30gb3B0aW9ucy5icmFuZHMgLSBDU1ZcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBvcHRpb25zLnNpbXVsYXRpb24gLSBzaW0gbmFtZVxuICogQHJldHVybnMge1Byb21pc2V9IC0gTm8gcmVzb2x2ZWQgdmFsdWVcbiAqL1xuY29uc3QgZGVwbG95SW1hZ2VzID0gYXN5bmMgZnVuY3Rpb24oIHsgYnJhbmNoLCBicmFuZHMsIHNpbXVsYXRpb24gfSApIHtcbiAgY29uc3QgcmVxdWVzdE9iamVjdCA9IHtcbiAgICBicmFuZHM6IGJyYW5kcyB8fCAncGhldCcsXG4gICAgYnJhbmNoOiBicmFuY2ggfHwgJ21haW4nLFxuICAgIGF1dGhvcml6YXRpb25Db2RlOiBidWlsZExvY2FsLmJ1aWxkU2VydmVyQXV0aG9yaXphdGlvbkNvZGVcbiAgfTtcbiAgaWYgKCBidWlsZExvY2FsLmJ1aWxkU2VydmVyTm90aWZ5RW1haWwgKSB7XG4gICAgcmVxdWVzdE9iamVjdC5lbWFpbCA9IGJ1aWxkTG9jYWwuYnVpbGRTZXJ2ZXJOb3RpZnlFbWFpbDtcbiAgfVxuICBpZiAoIHNpbXVsYXRpb24gKSB7XG4gICAgcmVxdWVzdE9iamVjdC5zaW11bGF0aW9uID0gc2ltdWxhdGlvbjtcbiAgICB0cnkge1xuICAgICAgY29uc3QgbWV0YWRhdGFSZXNwb25zZSA9IGF3YWl0IGF4aW9zLmdldCggYGh0dHBzOi8vcGhldC5jb2xvcmFkby5lZHUvc2VydmljZXMvbWV0YWRhdGEvMS4yL3NpbXVsYXRpb25zP2Zvcm1hdD1qc29uJnN1bW1hcnkmbG9jYWxlPWVuJnR5cGU9aHRtbCZzaW11bGF0aW9uPSR7c2ltdWxhdGlvbn1gICk7XG4gICAgICBpZiAoIG1ldGFkYXRhUmVzcG9uc2UuZGF0YSAmJiBtZXRhZGF0YVJlc3BvbnNlLmRhdGE/LnByb2plY3RzPy5bIDAgXT8udmVyc2lvbj8uc3RyaW5nICkge1xuICAgICAgICByZXF1ZXN0T2JqZWN0LnZlcnNpb24gPSBtZXRhZGF0YVJlc3BvbnNlLmRhdGEucHJvamVjdHNbIDAgXS52ZXJzaW9uLnN0cmluZztcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKCAnVW5hYmxlIHRvIGZpbmQgdmVyc2lvbiBmb3Igc2ltdWxhdGlvbicsIG1ldGFkYXRhUmVzcG9uc2UuZGF0YSApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIGNhdGNoKCBlICkge1xuICAgICAgY29uc29sZS5lcnJvciggJ1VuYWJsZSB0byBkZXBsb3kgaW1hZ2VzIGZvciBzaW0gZHVlIHRvIGVycm9yIGluIG1ldGFkYXRhIHJldHJpdmFsJywgZSApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIHdpbnN0b24uaW5mbyggYHNlbmRpbmcgaW1hZ2UgZGVwbG95IHJlcXVlc3QgZm9yICR7cmVxdWVzdE9iamVjdC5icmFuY2h9LCAke3JlcXVlc3RPYmplY3QuYnJhbmRzfWAgKTtcblxuICBjb25zdCB1cmwgPSBgJHtidWlsZExvY2FsLnByb2R1Y3Rpb25TZXJ2ZXJVUkx9L2RlcGxveS1pbWFnZXNgO1xuXG4gIHdpbnN0b24uaW5mbyggdXJsICk7XG4gIHdpbnN0b24uaW5mbyggSlNPTi5zdHJpbmdpZnkoIHJlcXVlc3RPYmplY3QgKSApO1xuXG4gIGxldCByZXNwb25zZTtcbiAgdHJ5IHtcbiAgICByZXNwb25zZSA9IGF3YWl0IGF4aW9zKCB7IG1ldGhvZDogJ3Bvc3QnLCB1cmw6IHVybCwgZGF0YTogcmVxdWVzdE9iamVjdCB9ICk7XG4gIH1cbiAgY2F0Y2goIGVycm9yICkge1xuICAgIHRocm93IG5ldyBFcnJvciggYEltYWdlIGRlcGxveSByZXF1ZXN0IGZhaWxlZCB3aXRoIGVycm9yICR7ZXJyb3J9LmAgKTtcbiAgfVxuXG4gIGlmICggcmVzcG9uc2Uuc3RhdHVzICE9PSAyMDAgJiYgcmVzcG9uc2Uuc3RhdHVzICE9PSAyMDIgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCBgSW1hZ2UgZGVwbG95IHJlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzIGNvZGUgJHtyZXNwb25zZS5zdGF0dXN9LmAgKTtcbiAgfVxuICBlbHNlIHtcbiAgICB3aW5zdG9uLmluZm8oICdJbWFnZSBkZXBsb3kgcmVxdWVzdCBzZW50IHN1Y2Nlc3NmdWxseS4gIElmIGFkZGl0aW9uYWwgYWx0ZXJuYXRpdmUgaW1hZ2VzIHdlcmUgZGVwbG95ZWQsIGdvIHRvIHRoZSBtYWluIGFkbWluIHBhZ2UgYW5kIHRyaWdnZXIgYSByZWNvdW50LicgKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZXBsb3lJbWFnZXM7Il0sIm5hbWVzIjpbImJ1aWxkTG9jYWwiLCJyZXF1aXJlIiwid2luc3RvbiIsImF4aW9zIiwiZGVwbG95SW1hZ2VzIiwiYnJhbmNoIiwiYnJhbmRzIiwic2ltdWxhdGlvbiIsInJlcXVlc3RPYmplY3QiLCJhdXRob3JpemF0aW9uQ29kZSIsImJ1aWxkU2VydmVyQXV0aG9yaXphdGlvbkNvZGUiLCJidWlsZFNlcnZlck5vdGlmeUVtYWlsIiwiZW1haWwiLCJtZXRhZGF0YVJlc3BvbnNlIiwiZ2V0IiwiZGF0YSIsInByb2plY3RzIiwidmVyc2lvbiIsInN0cmluZyIsImNvbnNvbGUiLCJlcnJvciIsImUiLCJpbmZvIiwidXJsIiwicHJvZHVjdGlvblNlcnZlclVSTCIsIkpTT04iLCJzdHJpbmdpZnkiLCJyZXNwb25zZSIsIm1ldGhvZCIsIkVycm9yIiwic3RhdHVzIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUMsR0FFRCxVQUFVOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDVixNQUFNQSxhQUFhQyxRQUFTO0FBQzVCLE1BQU1DLFVBQVVELFFBQVM7QUFDekIsTUFBTUUsUUFBUUYsUUFBUztBQUV2Qjs7Ozs7Ozs7O0NBU0MsR0FDRCxNQUFNRyxpREFBZSxVQUFnQixFQUFFQyxNQUFNLEVBQUVDLE1BQU0sRUFBRUMsVUFBVSxFQUFFO0lBQ2pFLE1BQU1DLGdCQUFnQjtRQUNwQkYsUUFBUUEsVUFBVTtRQUNsQkQsUUFBUUEsVUFBVTtRQUNsQkksbUJBQW1CVCxXQUFXVSw0QkFBNEI7SUFDNUQ7SUFDQSxJQUFLVixXQUFXVyxzQkFBc0IsRUFBRztRQUN2Q0gsY0FBY0ksS0FBSyxHQUFHWixXQUFXVyxzQkFBc0I7SUFDekQ7SUFDQSxJQUFLSixZQUFhO1FBQ2hCQyxjQUFjRCxVQUFVLEdBQUdBO1FBQzNCLElBQUk7Z0JBRTRCTSwwQ0FBQUEsa0NBQUFBLGlDQUFBQTtZQUQ5QixNQUFNQSxtQkFBbUIsTUFBTVYsTUFBTVcsR0FBRyxDQUFFLENBQUMsK0dBQStHLEVBQUVQLFlBQVk7WUFDeEssSUFBS00saUJBQWlCRSxJQUFJLE1BQUlGLHlCQUFBQSxpQkFBaUJFLElBQUksc0JBQXJCRixrQ0FBQUEsdUJBQXVCRyxRQUFRLHNCQUEvQkgsbUNBQUFBLCtCQUFpQyxDQUFFLEVBQUcsc0JBQXRDQSwyQ0FBQUEsaUNBQXdDSSxPQUFPLHFCQUEvQ0oseUNBQWlESyxNQUFNLEdBQUc7Z0JBQ3RGVixjQUFjUyxPQUFPLEdBQUdKLGlCQUFpQkUsSUFBSSxDQUFDQyxRQUFRLENBQUUsRUFBRyxDQUFDQyxPQUFPLENBQUNDLE1BQU07WUFDNUUsT0FDSztnQkFDSEMsUUFBUUMsS0FBSyxDQUFFLHlDQUF5Q1AsaUJBQWlCRSxJQUFJO2dCQUM3RTtZQUNGO1FBQ0YsRUFDQSxPQUFPTSxHQUFJO1lBQ1RGLFFBQVFDLEtBQUssQ0FBRSxxRUFBcUVDO1lBQ3BGO1FBQ0Y7SUFDRjtJQUVBbkIsUUFBUW9CLElBQUksQ0FBRSxDQUFDLGlDQUFpQyxFQUFFZCxjQUFjSCxNQUFNLENBQUMsRUFBRSxFQUFFRyxjQUFjRixNQUFNLEVBQUU7SUFFakcsTUFBTWlCLE1BQU0sR0FBR3ZCLFdBQVd3QixtQkFBbUIsQ0FBQyxjQUFjLENBQUM7SUFFN0R0QixRQUFRb0IsSUFBSSxDQUFFQztJQUNkckIsUUFBUW9CLElBQUksQ0FBRUcsS0FBS0MsU0FBUyxDQUFFbEI7SUFFOUIsSUFBSW1CO0lBQ0osSUFBSTtRQUNGQSxXQUFXLE1BQU14QixNQUFPO1lBQUV5QixRQUFRO1lBQVFMLEtBQUtBO1lBQUtSLE1BQU1QO1FBQWM7SUFDMUUsRUFDQSxPQUFPWSxPQUFRO1FBQ2IsTUFBTSxJQUFJUyxNQUFPLENBQUMsdUNBQXVDLEVBQUVULE1BQU0sQ0FBQyxDQUFDO0lBQ3JFO0lBRUEsSUFBS08sU0FBU0csTUFBTSxLQUFLLE9BQU9ILFNBQVNHLE1BQU0sS0FBSyxLQUFNO1FBQ3hELE1BQU0sSUFBSUQsTUFBTyxDQUFDLDZDQUE2QyxFQUFFRixTQUFTRyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ3JGLE9BQ0s7UUFDSDVCLFFBQVFvQixJQUFJLENBQUU7SUFDaEI7QUFDRjtBQUVBUyxPQUFPQyxPQUFPLEdBQUc1QiJ9