// Copyright 2017, University of Colorado Boulder
/**
 * Sends a request to the build server.
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
const buildLocal = require('./buildLocal');
const assert = require('assert');
const axios = require('axios');
const winston = require('winston');
/**
 * Sends a request to the build server.
 * @public
 *
 * @param {string} repo
 * @param {SimVersion} version
 * @param {string} branch
 * @param {Object} dependencies - Dependencies object, use getDependencies?
 * @param {Object} [options]
 * @returns {Promise} - No resolved value
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo, version, branch, dependencies, options) {
    const { locales = '*', brands = [
        'phet',
        'phet-io'
    ], servers = [
        'dev'
    ] // {Array.<string>}, currently 'dev' and 'production' are supported
     } = options || {};
    winston.info(`sending build request for ${repo} ${version.toString()} with dependencies: ${JSON.stringify(dependencies)}`);
    servers.forEach((server)=>assert([
            'dev',
            'production'
        ].includes(server), `Unknown server: ${server}`));
    const requestObject = {
        api: '2.0',
        dependencies: JSON.stringify(dependencies),
        simName: repo,
        version: version.toString(),
        locales: locales,
        servers: servers,
        brands: brands,
        branch: branch,
        authorizationCode: buildLocal.buildServerAuthorizationCode
    };
    if (buildLocal.buildServerNotifyEmail) {
        requestObject.email = buildLocal.buildServerNotifyEmail;
    }
    const url = `${buildLocal.productionServerURL}/deploy-html-simulation`;
    winston.info(url);
    winston.info(JSON.stringify(requestObject));
    let response;
    try {
        response = yield axios({
            method: 'POST',
            url: url,
            data: requestObject
        });
    } catch (error) {
        throw new Error(`Build request failed with error ${error}.`);
    }
    if (response.status !== 200 && response.status !== 202) {
        throw new Error(`Build request failed with error ${response.status}.`);
    } else {
        winston.info('Build request sent successfully');
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vYnVpbGRTZXJ2ZXJSZXF1ZXN0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBTZW5kcyBhIHJlcXVlc3QgdG8gdGhlIGJ1aWxkIHNlcnZlci5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgYnVpbGRMb2NhbCA9IHJlcXVpcmUoICcuL2J1aWxkTG9jYWwnICk7XG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCAnYXNzZXJ0JyApO1xuY29uc3QgYXhpb3MgPSByZXF1aXJlKCAnYXhpb3MnICk7XG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSggJ3dpbnN0b24nICk7XG5cbi8qKlxuICogU2VuZHMgYSByZXF1ZXN0IHRvIHRoZSBidWlsZCBzZXJ2ZXIuXG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG9cbiAqIEBwYXJhbSB7U2ltVmVyc2lvbn0gdmVyc2lvblxuICogQHBhcmFtIHtzdHJpbmd9IGJyYW5jaFxuICogQHBhcmFtIHtPYmplY3R9IGRlcGVuZGVuY2llcyAtIERlcGVuZGVuY2llcyBvYmplY3QsIHVzZSBnZXREZXBlbmRlbmNpZXM/XG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBObyByZXNvbHZlZCB2YWx1ZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uKCByZXBvLCB2ZXJzaW9uLCBicmFuY2gsIGRlcGVuZGVuY2llcywgb3B0aW9ucyApIHtcblxuICBjb25zdCB7XG4gICAgbG9jYWxlcyA9ICcqJyxcbiAgICBicmFuZHMgPSBbICdwaGV0JywgJ3BoZXQtaW8nIF0sXG4gICAgc2VydmVycyA9IFsgJ2RldicgXSAvLyB7QXJyYXkuPHN0cmluZz59LCBjdXJyZW50bHkgJ2RldicgYW5kICdwcm9kdWN0aW9uJyBhcmUgc3VwcG9ydGVkXG4gIH0gPSBvcHRpb25zIHx8IHt9O1xuXG4gIHdpbnN0b24uaW5mbyggYHNlbmRpbmcgYnVpbGQgcmVxdWVzdCBmb3IgJHtyZXBvfSAke3ZlcnNpb24udG9TdHJpbmcoKX0gd2l0aCBkZXBlbmRlbmNpZXM6ICR7SlNPTi5zdHJpbmdpZnkoIGRlcGVuZGVuY2llcyApfWAgKTtcblxuICBzZXJ2ZXJzLmZvckVhY2goIHNlcnZlciA9PiBhc3NlcnQoIFsgJ2RldicsICdwcm9kdWN0aW9uJyBdLmluY2x1ZGVzKCBzZXJ2ZXIgKSwgYFVua25vd24gc2VydmVyOiAke3NlcnZlcn1gICkgKTtcblxuICBjb25zdCByZXF1ZXN0T2JqZWN0ID0ge1xuICAgIGFwaTogJzIuMCcsXG4gICAgZGVwZW5kZW5jaWVzOiBKU09OLnN0cmluZ2lmeSggZGVwZW5kZW5jaWVzICksXG4gICAgc2ltTmFtZTogcmVwbyxcbiAgICB2ZXJzaW9uOiB2ZXJzaW9uLnRvU3RyaW5nKCksXG4gICAgbG9jYWxlczogbG9jYWxlcyxcbiAgICBzZXJ2ZXJzOiBzZXJ2ZXJzLFxuICAgIGJyYW5kczogYnJhbmRzLFxuICAgIGJyYW5jaDogYnJhbmNoLFxuICAgIGF1dGhvcml6YXRpb25Db2RlOiBidWlsZExvY2FsLmJ1aWxkU2VydmVyQXV0aG9yaXphdGlvbkNvZGVcbiAgfTtcbiAgaWYgKCBidWlsZExvY2FsLmJ1aWxkU2VydmVyTm90aWZ5RW1haWwgKSB7XG4gICAgcmVxdWVzdE9iamVjdC5lbWFpbCA9IGJ1aWxkTG9jYWwuYnVpbGRTZXJ2ZXJOb3RpZnlFbWFpbDtcbiAgfVxuXG4gIGNvbnN0IHVybCA9IGAke2J1aWxkTG9jYWwucHJvZHVjdGlvblNlcnZlclVSTH0vZGVwbG95LWh0bWwtc2ltdWxhdGlvbmA7XG5cbiAgd2luc3Rvbi5pbmZvKCB1cmwgKTtcbiAgd2luc3Rvbi5pbmZvKCBKU09OLnN0cmluZ2lmeSggcmVxdWVzdE9iamVjdCApICk7XG5cbiAgbGV0IHJlc3BvbnNlO1xuICB0cnkge1xuICAgIHJlc3BvbnNlID0gYXdhaXQgYXhpb3MoIHsgbWV0aG9kOiAnUE9TVCcsIHVybDogdXJsLCBkYXRhOiByZXF1ZXN0T2JqZWN0IH0gKTtcbiAgfVxuICBjYXRjaCggZXJyb3IgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCBgQnVpbGQgcmVxdWVzdCBmYWlsZWQgd2l0aCBlcnJvciAke2Vycm9yfS5gICk7XG4gIH1cbiAgaWYgKCByZXNwb25zZS5zdGF0dXMgIT09IDIwMCAmJiByZXNwb25zZS5zdGF0dXMgIT09IDIwMiApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoIGBCdWlsZCByZXF1ZXN0IGZhaWxlZCB3aXRoIGVycm9yICR7cmVzcG9uc2Uuc3RhdHVzfS5gICk7XG4gIH1cbiAgZWxzZSB7XG4gICAgd2luc3Rvbi5pbmZvKCAnQnVpbGQgcmVxdWVzdCBzZW50IHN1Y2Nlc3NmdWxseScgKTtcbiAgfVxufTsiXSwibmFtZXMiOlsiYnVpbGRMb2NhbCIsInJlcXVpcmUiLCJhc3NlcnQiLCJheGlvcyIsIndpbnN0b24iLCJtb2R1bGUiLCJleHBvcnRzIiwicmVwbyIsInZlcnNpb24iLCJicmFuY2giLCJkZXBlbmRlbmNpZXMiLCJvcHRpb25zIiwibG9jYWxlcyIsImJyYW5kcyIsInNlcnZlcnMiLCJpbmZvIiwidG9TdHJpbmciLCJKU09OIiwic3RyaW5naWZ5IiwiZm9yRWFjaCIsInNlcnZlciIsImluY2x1ZGVzIiwicmVxdWVzdE9iamVjdCIsImFwaSIsInNpbU5hbWUiLCJhdXRob3JpemF0aW9uQ29kZSIsImJ1aWxkU2VydmVyQXV0aG9yaXphdGlvbkNvZGUiLCJidWlsZFNlcnZlck5vdGlmeUVtYWlsIiwiZW1haWwiLCJ1cmwiLCJwcm9kdWN0aW9uU2VydmVyVVJMIiwicmVzcG9uc2UiLCJtZXRob2QiLCJkYXRhIiwiZXJyb3IiLCJFcnJvciIsInN0YXR1cyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsYUFBYUMsUUFBUztBQUM1QixNQUFNQyxTQUFTRCxRQUFTO0FBQ3hCLE1BQU1FLFFBQVFGLFFBQVM7QUFDdkIsTUFBTUcsVUFBVUgsUUFBUztBQUV6Qjs7Ozs7Ozs7OztDQVVDLEdBQ0RJLE9BQU9DLE9BQU8scUNBQUcsVUFBZ0JDLElBQUksRUFBRUMsT0FBTyxFQUFFQyxNQUFNLEVBQUVDLFlBQVksRUFBRUMsT0FBTztJQUUzRSxNQUFNLEVBQ0pDLFVBQVUsR0FBRyxFQUNiQyxTQUFTO1FBQUU7UUFBUTtLQUFXLEVBQzlCQyxVQUFVO1FBQUU7S0FBTyxDQUFDLG1FQUFtRTtJQUFwRSxFQUNwQixHQUFHSCxXQUFXLENBQUM7SUFFaEJQLFFBQVFXLElBQUksQ0FBRSxDQUFDLDBCQUEwQixFQUFFUixLQUFLLENBQUMsRUFBRUMsUUFBUVEsUUFBUSxHQUFHLG9CQUFvQixFQUFFQyxLQUFLQyxTQUFTLENBQUVSLGVBQWdCO0lBRTVISSxRQUFRSyxPQUFPLENBQUVDLENBQUFBLFNBQVVsQixPQUFRO1lBQUU7WUFBTztTQUFjLENBQUNtQixRQUFRLENBQUVELFNBQVUsQ0FBQyxnQkFBZ0IsRUFBRUEsUUFBUTtJQUUxRyxNQUFNRSxnQkFBZ0I7UUFDcEJDLEtBQUs7UUFDTGIsY0FBY08sS0FBS0MsU0FBUyxDQUFFUjtRQUM5QmMsU0FBU2pCO1FBQ1RDLFNBQVNBLFFBQVFRLFFBQVE7UUFDekJKLFNBQVNBO1FBQ1RFLFNBQVNBO1FBQ1RELFFBQVFBO1FBQ1JKLFFBQVFBO1FBQ1JnQixtQkFBbUJ6QixXQUFXMEIsNEJBQTRCO0lBQzVEO0lBQ0EsSUFBSzFCLFdBQVcyQixzQkFBc0IsRUFBRztRQUN2Q0wsY0FBY00sS0FBSyxHQUFHNUIsV0FBVzJCLHNCQUFzQjtJQUN6RDtJQUVBLE1BQU1FLE1BQU0sR0FBRzdCLFdBQVc4QixtQkFBbUIsQ0FBQyx1QkFBdUIsQ0FBQztJQUV0RTFCLFFBQVFXLElBQUksQ0FBRWM7SUFDZHpCLFFBQVFXLElBQUksQ0FBRUUsS0FBS0MsU0FBUyxDQUFFSTtJQUU5QixJQUFJUztJQUNKLElBQUk7UUFDRkEsV0FBVyxNQUFNNUIsTUFBTztZQUFFNkIsUUFBUTtZQUFRSCxLQUFLQTtZQUFLSSxNQUFNWDtRQUFjO0lBQzFFLEVBQ0EsT0FBT1ksT0FBUTtRQUNiLE1BQU0sSUFBSUMsTUFBTyxDQUFDLGdDQUFnQyxFQUFFRCxNQUFNLENBQUMsQ0FBQztJQUM5RDtJQUNBLElBQUtILFNBQVNLLE1BQU0sS0FBSyxPQUFPTCxTQUFTSyxNQUFNLEtBQUssS0FBTTtRQUN4RCxNQUFNLElBQUlELE1BQU8sQ0FBQyxnQ0FBZ0MsRUFBRUosU0FBU0ssTUFBTSxDQUFDLENBQUMsQ0FBQztJQUN4RSxPQUNLO1FBQ0hoQyxRQUFRVyxJQUFJLENBQUU7SUFDaEI7QUFDRiJ9