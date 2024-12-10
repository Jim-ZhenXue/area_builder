// Copyright 2017, University of Colorado Boulder
/**
 * Returns metadata from the production website
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
const _ = require('lodash');
const winston = require('winston');
const axios = require('axios');
/**
 * Returns metadata from the production website.
 * @public
 *
 * @param {Object} [options]
 * @returns {Promise.<Object>} - Resolves with metadata object
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(options) {
    options = _.assignIn({
        summary: true,
        type: 'html',
        locale: null,
        simulation: null,
        includePrototypes: true // {boolean} - If set, will include prototypes
    }, options);
    let metadataURL = 'https://phet.colorado.edu/services/metadata/1.3/simulations?format=json';
    if (options.summary) {
        metadataURL += '&summary';
    }
    if (options.includePrototypes) {
        metadataURL += '&includePrototypes';
    }
    if (options.type) {
        metadataURL += `&type=${options.type}`;
    }
    if (options.locale) {
        metadataURL += `&locale=${options.locale}`;
    }
    if (options.simulation) {
        metadataURL += `&simulation=${options.simulation}`;
    }
    winston.info(`getting metadata request with ${metadataURL}`);
    let response;
    try {
        response = yield axios(metadataURL);
    } catch (e) {
        throw new Error(`metadata request failed with ${e}`);
    }
    if (response.status !== 200) {
        throw new Error(`metadata request failed with status ${response.status} ${response}`);
    } else {
        return response.data;
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vc2ltTWV0YWRhdGEuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTcsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFJldHVybnMgbWV0YWRhdGEgZnJvbSB0aGUgcHJvZHVjdGlvbiB3ZWJzaXRlXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IF8gPSByZXF1aXJlKCAnbG9kYXNoJyApO1xuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuY29uc3QgYXhpb3MgPSByZXF1aXJlKCAnYXhpb3MnICk7XG5cbi8qKlxuICogUmV0dXJucyBtZXRhZGF0YSBmcm9tIHRoZSBwcm9kdWN0aW9uIHdlYnNpdGUuXG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHJldHVybnMge1Byb21pc2UuPE9iamVjdD59IC0gUmVzb2x2ZXMgd2l0aCBtZXRhZGF0YSBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiggb3B0aW9ucyApIHtcbiAgb3B0aW9ucyA9IF8uYXNzaWduSW4oIHtcbiAgICBzdW1tYXJ5OiB0cnVlLCAvLyB7Ym9vbGVhbn0gLSBJZiBzZXQsIHdpbGwgaW5jbHVkZSBhIHJlZHVjZWQgYW1vdW50IG9mIGRhdGEgZm9yIGV2ZXJ5IGluY2x1ZGVkIHNpbXVsYXRpb25cbiAgICB0eXBlOiAnaHRtbCcsIC8vIHtzdHJpbmd8bnVsbH0gLSBJZiBwcm92aWRlZCAoaHRtbC9qYXZhL2ZsYXNoKSwgd2lsbCBsaW1pdCByZXN1bHRzIHRvIGEgc3BlY2lmaWMgdHlwZSBvZiBzaW11bGF0aW9uXG4gICAgbG9jYWxlOiBudWxsLCAvLyB7c3RyaW5nfG51bGx9IC0gSWYgcHJvdmlkZWQsIHdpbGwgbGltaXQgcmVzdWx0cyB0byBhIHNwZWNpZmljIGxvY2FsZVxuICAgIHNpbXVsYXRpb246IG51bGwsIC8vIHtzdHJpbmd8bnVsbH0gLSBJZiBwcm92aWRlZCwgd2lsbCBsaW1pdCB0byBhIHNwZWNpZmljIHNpbXVsYXRpb24gc2ltdWxhdGlvblxuICAgIGluY2x1ZGVQcm90b3R5cGVzOiB0cnVlIC8vIHtib29sZWFufSAtIElmIHNldCwgd2lsbCBpbmNsdWRlIHByb3RvdHlwZXNcbiAgfSwgb3B0aW9ucyApO1xuXG4gIGxldCBtZXRhZGF0YVVSTCA9ICdodHRwczovL3BoZXQuY29sb3JhZG8uZWR1L3NlcnZpY2VzL21ldGFkYXRhLzEuMy9zaW11bGF0aW9ucz9mb3JtYXQ9anNvbic7XG4gIGlmICggb3B0aW9ucy5zdW1tYXJ5ICkge1xuICAgIG1ldGFkYXRhVVJMICs9ICcmc3VtbWFyeSc7XG4gIH1cbiAgaWYgKCBvcHRpb25zLmluY2x1ZGVQcm90b3R5cGVzICkge1xuICAgIG1ldGFkYXRhVVJMICs9ICcmaW5jbHVkZVByb3RvdHlwZXMnO1xuICB9XG4gIGlmICggb3B0aW9ucy50eXBlICkge1xuICAgIG1ldGFkYXRhVVJMICs9IGAmdHlwZT0ke29wdGlvbnMudHlwZX1gO1xuICB9XG4gIGlmICggb3B0aW9ucy5sb2NhbGUgKSB7XG4gICAgbWV0YWRhdGFVUkwgKz0gYCZsb2NhbGU9JHtvcHRpb25zLmxvY2FsZX1gO1xuICB9XG4gIGlmICggb3B0aW9ucy5zaW11bGF0aW9uICkge1xuICAgIG1ldGFkYXRhVVJMICs9IGAmc2ltdWxhdGlvbj0ke29wdGlvbnMuc2ltdWxhdGlvbn1gO1xuICB9XG5cbiAgd2luc3Rvbi5pbmZvKCBgZ2V0dGluZyBtZXRhZGF0YSByZXF1ZXN0IHdpdGggJHttZXRhZGF0YVVSTH1gICk7XG5cbiAgbGV0IHJlc3BvbnNlO1xuICB0cnkge1xuICAgIHJlc3BvbnNlID0gYXdhaXQgYXhpb3MoIG1ldGFkYXRhVVJMICk7XG4gIH1cbiAgY2F0Y2goIGUgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCBgbWV0YWRhdGEgcmVxdWVzdCBmYWlsZWQgd2l0aCAke2V9YCApO1xuICB9XG4gIGlmICggcmVzcG9uc2Uuc3RhdHVzICE9PSAyMDAgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCBgbWV0YWRhdGEgcmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgJHtyZXNwb25zZS5zdGF0dXN9ICR7cmVzcG9uc2V9YCApO1xuICB9XG4gIGVsc2Uge1xuICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICB9XG59OyJdLCJuYW1lcyI6WyJfIiwicmVxdWlyZSIsIndpbnN0b24iLCJheGlvcyIsIm1vZHVsZSIsImV4cG9ydHMiLCJvcHRpb25zIiwiYXNzaWduSW4iLCJzdW1tYXJ5IiwidHlwZSIsImxvY2FsZSIsInNpbXVsYXRpb24iLCJpbmNsdWRlUHJvdG90eXBlcyIsIm1ldGFkYXRhVVJMIiwiaW5mbyIsInJlc3BvbnNlIiwiZSIsIkVycm9yIiwic3RhdHVzIiwiZGF0YSJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsSUFBSUMsUUFBUztBQUNuQixNQUFNQyxVQUFVRCxRQUFTO0FBQ3pCLE1BQU1FLFFBQVFGLFFBQVM7QUFFdkI7Ozs7OztDQU1DLEdBQ0RHLE9BQU9DLE9BQU8scUNBQUcsVUFBZ0JDLE9BQU87SUFDdENBLFVBQVVOLEVBQUVPLFFBQVEsQ0FBRTtRQUNwQkMsU0FBUztRQUNUQyxNQUFNO1FBQ05DLFFBQVE7UUFDUkMsWUFBWTtRQUNaQyxtQkFBbUIsS0FBSyw4Q0FBOEM7SUFDeEUsR0FBR047SUFFSCxJQUFJTyxjQUFjO0lBQ2xCLElBQUtQLFFBQVFFLE9BQU8sRUFBRztRQUNyQkssZUFBZTtJQUNqQjtJQUNBLElBQUtQLFFBQVFNLGlCQUFpQixFQUFHO1FBQy9CQyxlQUFlO0lBQ2pCO0lBQ0EsSUFBS1AsUUFBUUcsSUFBSSxFQUFHO1FBQ2xCSSxlQUFlLENBQUMsTUFBTSxFQUFFUCxRQUFRRyxJQUFJLEVBQUU7SUFDeEM7SUFDQSxJQUFLSCxRQUFRSSxNQUFNLEVBQUc7UUFDcEJHLGVBQWUsQ0FBQyxRQUFRLEVBQUVQLFFBQVFJLE1BQU0sRUFBRTtJQUM1QztJQUNBLElBQUtKLFFBQVFLLFVBQVUsRUFBRztRQUN4QkUsZUFBZSxDQUFDLFlBQVksRUFBRVAsUUFBUUssVUFBVSxFQUFFO0lBQ3BEO0lBRUFULFFBQVFZLElBQUksQ0FBRSxDQUFDLDhCQUE4QixFQUFFRCxhQUFhO0lBRTVELElBQUlFO0lBQ0osSUFBSTtRQUNGQSxXQUFXLE1BQU1aLE1BQU9VO0lBQzFCLEVBQ0EsT0FBT0csR0FBSTtRQUNULE1BQU0sSUFBSUMsTUFBTyxDQUFDLDZCQUE2QixFQUFFRCxHQUFHO0lBQ3REO0lBQ0EsSUFBS0QsU0FBU0csTUFBTSxLQUFLLEtBQU07UUFDN0IsTUFBTSxJQUFJRCxNQUFPLENBQUMsb0NBQW9DLEVBQUVGLFNBQVNHLE1BQU0sQ0FBQyxDQUFDLEVBQUVILFVBQVU7SUFDdkYsT0FDSztRQUNILE9BQU9BLFNBQVNJLElBQUk7SUFDdEI7QUFDRiJ9