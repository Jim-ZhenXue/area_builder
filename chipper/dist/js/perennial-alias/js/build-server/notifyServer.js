// Copyright 2017, University of Colorado Boulder
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
const sendEmail = require('./sendEmail');
const winston = require('winston');
const axios = require('axios');
/**
 * Notify the website that a new sim or translation has been deployed. This will cause the project to
 * synchronize and the new translation will appear on the website.
 * @param {Object} [options]
 *  @property {string} simName
 *  @property {string} email
 *  @property {string} brand
 *  @property {string} locales
 *  @property {number} translatorId
 *  @property {Object} [phetioOptions]
 *  @property {SimVersion} version
 *  @property {string} branch
 *  @property {string} suffix
 *  @property {boolean} ignoreForAutomatedMaintenanceReleases
 */ module.exports = /*#__PURE__*/ function() {
    var _notifyServer = _async_to_generator(function*(options) {
        if (options.brand === constants.PHET_BRAND) {
            const project = `html/${options.simName}`;
            let url = `${constants.BUILD_SERVER_CONFIG.productionServerURL}/services/synchronize-project?projectName=${project}`;
            if (options.locales && options.locales !== '*' && options.locales !== 'en' && options.locales.indexOf(',') < 0) {
                url += `&locale=${options.locales}`;
                if (options.translatorId) {
                    url += `&translatorId=${options.translatorId}`;
                }
            }
            let response;
            try {
                response = yield axios({
                    url: url,
                    auth: {
                        username: 'token',
                        password: constants.BUILD_SERVER_CONFIG.serverToken
                    }
                });
            } catch (e) {
                throw new Error(e);
            }
            let errorMessage;
            if (response.status >= 200 && response.status <= 299) {
                const data = response.data;
                if (!data.success) {
                    errorMessage = `request to synchronize project ${project} on ${constants.BUILD_SERVER_CONFIG.productionServerURL} failed with message: ${data.error}`;
                    winston.log('error', errorMessage);
                    sendEmail('SYNCHRONIZE FAILED', errorMessage, options.email);
                } else {
                    winston.log('info', `request to synchronize project ${project} on ${constants.BUILD_SERVER_CONFIG.productionServerURL} succeeded`);
                }
            } else {
                errorMessage = 'request to synchronize project errored or returned a non 2XX status code';
                winston.log('error', errorMessage);
                sendEmail('SYNCHRONIZE FAILED', errorMessage, options.email);
            }
        } else if (options.brand === constants.PHET_IO_BRAND) {
            const url = `${constants.BUILD_SERVER_CONFIG.productionServerURL}/services/metadata/phetio` + `?name=${options.simName}&versionMajor=${options.phetioOptions.version.major}&versionMinor=${options.phetioOptions.version.minor}&versionMaintenance=${options.phetioOptions.version.maintenance}&versionSuffix=${options.phetioOptions.suffix}&branch=${options.phetioOptions.branch}&active=${!options.phetioOptions.ignoreForAutomatedMaintenanceReleases}`;
            let response;
            try {
                response = yield axios({
                    url: url,
                    method: 'POST',
                    auth: {
                        username: 'token',
                        password: constants.BUILD_SERVER_CONFIG.serverToken
                    }
                });
            } catch (e) {
                throw new Error(e);
            }
            let errorMessage;
            if (response.status < 200 || response.status > 299) {
                try {
                    errorMessage = response.data.error;
                } catch (e) {
                    errorMessage = 'request to upsert phetio deployment failed';
                }
                winston.log('error', errorMessage);
                sendEmail('PHET_IO DEPLOYMENT UPSERT FAILED', errorMessage, options.email);
                throw new Error('PHET_IO DEPLOYMENT UPSERT FAILED');
            } else {
                const data = response.data;
                if (!data.success) {
                    try {
                        errorMessage = data.error;
                    } catch (e) {
                        errorMessage = 'request to upsert phetio deployment failed';
                    }
                    winston.log('error', errorMessage);
                    sendEmail('SYNCHRONIZE FAILED', errorMessage, options.email);
                    throw new Error('PHET_IO DEPLOYMENT UPSERT FAILED');
                } else {
                    winston.log('info', `request to upsert phetio deployment for ${options.simName} on ${constants.BUILD_SERVER_CONFIG.productionServerURL} succeeded`);
                }
            }
        } else {
            throw new Error('Called notifyServer for unsupported brand');
        }
    });
    function notifyServer(options) {
        return _notifyServer.apply(this, arguments);
    }
    return notifyServer;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9idWlsZC1zZXJ2ZXIvbm90aWZ5U2VydmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbi8vIEBhdXRob3IgTWF0dCBQZW5uaW5ndG9uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuXG5cbmNvbnN0IGNvbnN0YW50cyA9IHJlcXVpcmUoICcuL2NvbnN0YW50cycgKTtcbmNvbnN0IHNlbmRFbWFpbCA9IHJlcXVpcmUoICcuL3NlbmRFbWFpbCcgKTtcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcbmNvbnN0IGF4aW9zID0gcmVxdWlyZSggJ2F4aW9zJyApO1xuXG4vKipcbiAqIE5vdGlmeSB0aGUgd2Vic2l0ZSB0aGF0IGEgbmV3IHNpbSBvciB0cmFuc2xhdGlvbiBoYXMgYmVlbiBkZXBsb3llZC4gVGhpcyB3aWxsIGNhdXNlIHRoZSBwcm9qZWN0IHRvXG4gKiBzeW5jaHJvbml6ZSBhbmQgdGhlIG5ldyB0cmFuc2xhdGlvbiB3aWxsIGFwcGVhciBvbiB0aGUgd2Vic2l0ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAqICBAcHJvcGVydHkge3N0cmluZ30gc2ltTmFtZVxuICogIEBwcm9wZXJ0eSB7c3RyaW5nfSBlbWFpbFxuICogIEBwcm9wZXJ0eSB7c3RyaW5nfSBicmFuZFxuICogIEBwcm9wZXJ0eSB7c3RyaW5nfSBsb2NhbGVzXG4gKiAgQHByb3BlcnR5IHtudW1iZXJ9IHRyYW5zbGF0b3JJZFxuICogIEBwcm9wZXJ0eSB7T2JqZWN0fSBbcGhldGlvT3B0aW9uc11cbiAqICBAcHJvcGVydHkge1NpbVZlcnNpb259IHZlcnNpb25cbiAqICBAcHJvcGVydHkge3N0cmluZ30gYnJhbmNoXG4gKiAgQHByb3BlcnR5IHtzdHJpbmd9IHN1ZmZpeFxuICogIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gaWdub3JlRm9yQXV0b21hdGVkTWFpbnRlbmFuY2VSZWxlYXNlc1xuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uIG5vdGlmeVNlcnZlciggb3B0aW9ucyApIHtcbiAgaWYgKCBvcHRpb25zLmJyYW5kID09PSBjb25zdGFudHMuUEhFVF9CUkFORCApIHtcbiAgICBjb25zdCBwcm9qZWN0ID0gYGh0bWwvJHtvcHRpb25zLnNpbU5hbWV9YDtcbiAgICBsZXQgdXJsID0gYCR7Y29uc3RhbnRzLkJVSUxEX1NFUlZFUl9DT05GSUcucHJvZHVjdGlvblNlcnZlclVSTH0vc2VydmljZXMvc3luY2hyb25pemUtcHJvamVjdD9wcm9qZWN0TmFtZT0ke3Byb2plY3R9YDtcbiAgICBpZiAoIG9wdGlvbnMubG9jYWxlcyAmJiBvcHRpb25zLmxvY2FsZXMgIT09ICcqJyAmJiBvcHRpb25zLmxvY2FsZXMgIT09ICdlbicgJiYgb3B0aW9ucy5sb2NhbGVzLmluZGV4T2YoICcsJyApIDwgMCApIHtcbiAgICAgIHVybCArPSBgJmxvY2FsZT0ke29wdGlvbnMubG9jYWxlc31gO1xuICAgICAgaWYgKCBvcHRpb25zLnRyYW5zbGF0b3JJZCApIHtcbiAgICAgICAgdXJsICs9IGAmdHJhbnNsYXRvcklkPSR7b3B0aW9ucy50cmFuc2xhdG9ySWR9YDtcbiAgICAgIH1cbiAgICB9XG5cblxuICAgIGxldCByZXNwb25zZTtcbiAgICB0cnkge1xuICAgICAgcmVzcG9uc2UgPSBhd2FpdCBheGlvcygge1xuICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgYXV0aDoge1xuICAgICAgICAgIHVzZXJuYW1lOiAndG9rZW4nLFxuICAgICAgICAgIHBhc3N3b3JkOiBjb25zdGFudHMuQlVJTERfU0VSVkVSX0NPTkZJRy5zZXJ2ZXJUb2tlblxuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgfVxuICAgIGNhdGNoKCBlICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCBlICk7XG4gICAgfVxuICAgIGxldCBlcnJvck1lc3NhZ2U7XG5cbiAgICBpZiAoIHJlc3BvbnNlLnN0YXR1cyA+PSAyMDAgJiYgcmVzcG9uc2Uuc3RhdHVzIDw9IDI5OSApIHtcbiAgICAgIGNvbnN0IGRhdGEgPSByZXNwb25zZS5kYXRhO1xuXG4gICAgICBpZiAoICFkYXRhLnN1Y2Nlc3MgKSB7XG4gICAgICAgIGVycm9yTWVzc2FnZSA9IGByZXF1ZXN0IHRvIHN5bmNocm9uaXplIHByb2plY3QgJHtwcm9qZWN0fSBvbiAke2NvbnN0YW50cy5CVUlMRF9TRVJWRVJfQ09ORklHLnByb2R1Y3Rpb25TZXJ2ZXJVUkx9IGZhaWxlZCB3aXRoIG1lc3NhZ2U6ICR7ZGF0YS5lcnJvcn1gO1xuICAgICAgICB3aW5zdG9uLmxvZyggJ2Vycm9yJywgZXJyb3JNZXNzYWdlICk7XG4gICAgICAgIHNlbmRFbWFpbCggJ1NZTkNIUk9OSVpFIEZBSUxFRCcsIGVycm9yTWVzc2FnZSwgb3B0aW9ucy5lbWFpbCApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHdpbnN0b24ubG9nKCAnaW5mbycsIGByZXF1ZXN0IHRvIHN5bmNocm9uaXplIHByb2plY3QgJHtwcm9qZWN0fSBvbiAke2NvbnN0YW50cy5CVUlMRF9TRVJWRVJfQ09ORklHLnByb2R1Y3Rpb25TZXJ2ZXJVUkx9IHN1Y2NlZWRlZGAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBlcnJvck1lc3NhZ2UgPSAncmVxdWVzdCB0byBzeW5jaHJvbml6ZSBwcm9qZWN0IGVycm9yZWQgb3IgcmV0dXJuZWQgYSBub24gMlhYIHN0YXR1cyBjb2RlJztcbiAgICAgIHdpbnN0b24ubG9nKCAnZXJyb3InLCBlcnJvck1lc3NhZ2UgKTtcbiAgICAgIHNlbmRFbWFpbCggJ1NZTkNIUk9OSVpFIEZBSUxFRCcsIGVycm9yTWVzc2FnZSwgb3B0aW9ucy5lbWFpbCApO1xuICAgIH1cbiAgfVxuICBlbHNlIGlmICggb3B0aW9ucy5icmFuZCA9PT0gY29uc3RhbnRzLlBIRVRfSU9fQlJBTkQgKSB7XG4gICAgY29uc3QgdXJsID0gYCR7Y29uc3RhbnRzLkJVSUxEX1NFUlZFUl9DT05GSUcucHJvZHVjdGlvblNlcnZlclVSTH0vc2VydmljZXMvbWV0YWRhdGEvcGhldGlvYCArXG4gICAgICAgICAgICAgICAgYD9uYW1lPSR7b3B0aW9ucy5zaW1OYW1lXG4gICAgICAgICAgICAgICAgfSZ2ZXJzaW9uTWFqb3I9JHtvcHRpb25zLnBoZXRpb09wdGlvbnMudmVyc2lvbi5tYWpvclxuICAgICAgICAgICAgICAgIH0mdmVyc2lvbk1pbm9yPSR7b3B0aW9ucy5waGV0aW9PcHRpb25zLnZlcnNpb24ubWlub3JcbiAgICAgICAgICAgICAgICB9JnZlcnNpb25NYWludGVuYW5jZT0ke29wdGlvbnMucGhldGlvT3B0aW9ucy52ZXJzaW9uLm1haW50ZW5hbmNlXG4gICAgICAgICAgICAgICAgfSZ2ZXJzaW9uU3VmZml4PSR7b3B0aW9ucy5waGV0aW9PcHRpb25zLnN1ZmZpeFxuICAgICAgICAgICAgICAgIH0mYnJhbmNoPSR7b3B0aW9ucy5waGV0aW9PcHRpb25zLmJyYW5jaFxuICAgICAgICAgICAgICAgIH0mYWN0aXZlPSR7IW9wdGlvbnMucGhldGlvT3B0aW9ucy5pZ25vcmVGb3JBdXRvbWF0ZWRNYWludGVuYW5jZVJlbGVhc2VzfWA7XG4gICAgbGV0IHJlc3BvbnNlO1xuICAgIHRyeSB7XG4gICAgICByZXNwb25zZSA9IGF3YWl0IGF4aW9zKCB7XG4gICAgICAgIHVybDogdXJsLFxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgYXV0aDoge1xuICAgICAgICAgIHVzZXJuYW1lOiAndG9rZW4nLFxuICAgICAgICAgIHBhc3N3b3JkOiBjb25zdGFudHMuQlVJTERfU0VSVkVSX0NPTkZJRy5zZXJ2ZXJUb2tlblxuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgfVxuICAgIGNhdGNoKCBlICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCBlICk7XG4gICAgfVxuICAgIGxldCBlcnJvck1lc3NhZ2U7XG5cbiAgICBpZiAoIHJlc3BvbnNlLnN0YXR1cyA8IDIwMCB8fCByZXNwb25zZS5zdGF0dXMgPiAyOTkgKSB7XG4gICAgICB0cnkge1xuICAgICAgICBlcnJvck1lc3NhZ2UgPSByZXNwb25zZS5kYXRhLmVycm9yO1xuICAgICAgfVxuICAgICAgY2F0Y2goIGUgKSB7XG4gICAgICAgIGVycm9yTWVzc2FnZSA9ICdyZXF1ZXN0IHRvIHVwc2VydCBwaGV0aW8gZGVwbG95bWVudCBmYWlsZWQnO1xuICAgICAgfVxuICAgICAgd2luc3Rvbi5sb2coICdlcnJvcicsIGVycm9yTWVzc2FnZSApO1xuICAgICAgc2VuZEVtYWlsKCAnUEhFVF9JTyBERVBMT1lNRU5UIFVQU0VSVCBGQUlMRUQnLCBlcnJvck1lc3NhZ2UsIG9wdGlvbnMuZW1haWwgKTtcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ1BIRVRfSU8gREVQTE9ZTUVOVCBVUFNFUlQgRkFJTEVEJyApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IGRhdGEgPSByZXNwb25zZS5kYXRhO1xuXG4gICAgICBpZiAoICFkYXRhLnN1Y2Nlc3MgKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZXJyb3JNZXNzYWdlID0gZGF0YS5lcnJvcjtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCggZSApIHtcbiAgICAgICAgICBlcnJvck1lc3NhZ2UgPSAncmVxdWVzdCB0byB1cHNlcnQgcGhldGlvIGRlcGxveW1lbnQgZmFpbGVkJztcbiAgICAgICAgfVxuICAgICAgICB3aW5zdG9uLmxvZyggJ2Vycm9yJywgZXJyb3JNZXNzYWdlICk7XG4gICAgICAgIHNlbmRFbWFpbCggJ1NZTkNIUk9OSVpFIEZBSUxFRCcsIGVycm9yTWVzc2FnZSwgb3B0aW9ucy5lbWFpbCApO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdQSEVUX0lPIERFUExPWU1FTlQgVVBTRVJUIEZBSUxFRCcgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB3aW5zdG9uLmxvZyggJ2luZm8nLCBgcmVxdWVzdCB0byB1cHNlcnQgcGhldGlvIGRlcGxveW1lbnQgZm9yICR7b3B0aW9ucy5zaW1OYW1lfSBvbiAke2NvbnN0YW50cy5CVUlMRF9TRVJWRVJfQ09ORklHLnByb2R1Y3Rpb25TZXJ2ZXJVUkx9IHN1Y2NlZWRlZGAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfVxuICBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoICdDYWxsZWQgbm90aWZ5U2VydmVyIGZvciB1bnN1cHBvcnRlZCBicmFuZCcgKTtcbiAgfVxufTsiXSwibmFtZXMiOlsiY29uc3RhbnRzIiwicmVxdWlyZSIsInNlbmRFbWFpbCIsIndpbnN0b24iLCJheGlvcyIsIm1vZHVsZSIsImV4cG9ydHMiLCJub3RpZnlTZXJ2ZXIiLCJvcHRpb25zIiwiYnJhbmQiLCJQSEVUX0JSQU5EIiwicHJvamVjdCIsInNpbU5hbWUiLCJ1cmwiLCJCVUlMRF9TRVJWRVJfQ09ORklHIiwicHJvZHVjdGlvblNlcnZlclVSTCIsImxvY2FsZXMiLCJpbmRleE9mIiwidHJhbnNsYXRvcklkIiwicmVzcG9uc2UiLCJhdXRoIiwidXNlcm5hbWUiLCJwYXNzd29yZCIsInNlcnZlclRva2VuIiwiZSIsIkVycm9yIiwiZXJyb3JNZXNzYWdlIiwic3RhdHVzIiwiZGF0YSIsInN1Y2Nlc3MiLCJlcnJvciIsImxvZyIsImVtYWlsIiwiUEhFVF9JT19CUkFORCIsInBoZXRpb09wdGlvbnMiLCJ2ZXJzaW9uIiwibWFqb3IiLCJtaW5vciIsIm1haW50ZW5hbmNlIiwic3VmZml4IiwiYnJhbmNoIiwiaWdub3JlRm9yQXV0b21hdGVkTWFpbnRlbmFuY2VSZWxlYXNlcyIsIm1ldGhvZCJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBQ2pELHlEQUF5RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR3pELE1BQU1BLFlBQVlDLFFBQVM7QUFDM0IsTUFBTUMsWUFBWUQsUUFBUztBQUMzQixNQUFNRSxVQUFV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