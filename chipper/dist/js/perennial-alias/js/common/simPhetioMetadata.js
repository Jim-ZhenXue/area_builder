// Copyright 2018, University of Colorado Boulder
/**
 * Returns phet-io metadata from the production website
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
 * @returns {Promise.<Object[]>} - Resolves with metadata objects in an array
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(options) {
    options = _.assignIn({
        active: null,
        latest: null // {boolean|null} - If set, will only include latest branches
    }, options);
    let metadataURL = 'https://phet.colorado.edu/services/metadata/phetio?';
    if (options.active !== null) {
        metadataURL += `&active=${options.active}`;
    }
    if (options.latest !== null) {
        metadataURL += `&latest=${options.latest}`;
    }
    winston.info(`getting phet-io metadata request with ${metadataURL}`);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vc2ltUGhldGlvTWV0YWRhdGEuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFJldHVybnMgcGhldC1pbyBtZXRhZGF0YSBmcm9tIHRoZSBwcm9kdWN0aW9uIHdlYnNpdGVcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgXyA9IHJlcXVpcmUoICdsb2Rhc2gnICk7XG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSggJ3dpbnN0b24nICk7XG5jb25zdCBheGlvcyA9IHJlcXVpcmUoICdheGlvcycgKTtcblxuLyoqXG4gKiBSZXR1cm5zIG1ldGFkYXRhIGZyb20gdGhlIHByb2R1Y3Rpb24gd2Vic2l0ZS5cbiAqIEBwdWJsaWNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAcmV0dXJucyB7UHJvbWlzZS48T2JqZWN0W10+fSAtIFJlc29sdmVzIHdpdGggbWV0YWRhdGEgb2JqZWN0cyBpbiBhbiBhcnJheVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uKCBvcHRpb25zICkge1xuICBvcHRpb25zID0gXy5hc3NpZ25Jbigge1xuICAgIGFjdGl2ZTogbnVsbCwgLy8ge2Jvb2xlYW58bnVsbH0gLSBJZiBzZXQsIHdpbGwgb25seSBpbmNsdWRlIGFjdGl2ZSBicmFuY2hlc1xuICAgIGxhdGVzdDogbnVsbCAvLyB7Ym9vbGVhbnxudWxsfSAtIElmIHNldCwgd2lsbCBvbmx5IGluY2x1ZGUgbGF0ZXN0IGJyYW5jaGVzXG4gIH0sIG9wdGlvbnMgKTtcblxuICBsZXQgbWV0YWRhdGFVUkwgPSAnaHR0cHM6Ly9waGV0LmNvbG9yYWRvLmVkdS9zZXJ2aWNlcy9tZXRhZGF0YS9waGV0aW8/JztcbiAgaWYgKCBvcHRpb25zLmFjdGl2ZSAhPT0gbnVsbCApIHtcbiAgICBtZXRhZGF0YVVSTCArPSBgJmFjdGl2ZT0ke29wdGlvbnMuYWN0aXZlfWA7XG4gIH1cbiAgaWYgKCBvcHRpb25zLmxhdGVzdCAhPT0gbnVsbCApIHtcbiAgICBtZXRhZGF0YVVSTCArPSBgJmxhdGVzdD0ke29wdGlvbnMubGF0ZXN0fWA7XG4gIH1cblxuICB3aW5zdG9uLmluZm8oIGBnZXR0aW5nIHBoZXQtaW8gbWV0YWRhdGEgcmVxdWVzdCB3aXRoICR7bWV0YWRhdGFVUkx9YCApO1xuICBsZXQgcmVzcG9uc2U7XG4gIHRyeSB7XG4gICAgcmVzcG9uc2UgPSBhd2FpdCBheGlvcyggbWV0YWRhdGFVUkwgKTtcbiAgfVxuICBjYXRjaCggZSApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoIGBtZXRhZGF0YSByZXF1ZXN0IGZhaWxlZCB3aXRoICR7ZX1gICk7XG4gIH1cblxuICBpZiAoIHJlc3BvbnNlLnN0YXR1cyAhPT0gMjAwICkge1xuICAgIHRocm93IG5ldyBFcnJvciggYG1ldGFkYXRhIHJlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzICR7cmVzcG9uc2Uuc3RhdHVzfSAke3Jlc3BvbnNlfWAgKTtcbiAgfVxuICBlbHNlIHtcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgfVxufTsiXSwibmFtZXMiOlsiXyIsInJlcXVpcmUiLCJ3aW5zdG9uIiwiYXhpb3MiLCJtb2R1bGUiLCJleHBvcnRzIiwib3B0aW9ucyIsImFzc2lnbkluIiwiYWN0aXZlIiwibGF0ZXN0IiwibWV0YWRhdGFVUkwiLCJpbmZvIiwicmVzcG9uc2UiLCJlIiwiRXJyb3IiLCJzdGF0dXMiLCJkYXRhIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxJQUFJQyxRQUFTO0FBQ25CLE1BQU1DLFVBQVVELFFBQVM7QUFDekIsTUFBTUUsUUFBUUYsUUFBUztBQUV2Qjs7Ozs7O0NBTUMsR0FDREcsT0FBT0MsT0FBTyxxQ0FBRyxVQUFnQkMsT0FBTztJQUN0Q0EsVUFBVU4sRUFBRU8sUUFBUSxDQUFFO1FBQ3BCQyxRQUFRO1FBQ1JDLFFBQVEsS0FBSyw2REFBNkQ7SUFDNUUsR0FBR0g7SUFFSCxJQUFJSSxjQUFjO0lBQ2xCLElBQUtKLFFBQVFFLE1BQU0sS0FBSyxNQUFPO1FBQzdCRSxlQUFlLENBQUMsUUFBUSxFQUFFSixRQUFRRSxNQUFNLEVBQUU7SUFDNUM7SUFDQSxJQUFLRixRQUFRRyxNQUFNLEtBQUssTUFBTztRQUM3QkMsZUFBZSxDQUFDLFFBQVEsRUFBRUosUUFBUUcsTUFBTSxFQUFFO0lBQzVDO0lBRUFQLFFBQVFTLElBQUksQ0FBRSxDQUFDLHNDQUFzQyxFQUFFRCxhQUFhO0lBQ3BFLElBQUlFO0lBQ0osSUFBSTtRQUNGQSxXQUFXLE1BQU1ULE1BQU9PO0lBQzFCLEVBQ0EsT0FBT0csR0FBSTtRQUNULE1BQU0sSUFBSUMsTUFBTyxDQUFDLDZCQUE2QixFQUFFRCxHQUFHO0lBQ3REO0lBRUEsSUFBS0QsU0FBU0csTUFBTSxLQUFLLEtBQU07UUFDN0IsTUFBTSxJQUFJRCxNQUFPLENBQUMsb0NBQW9DLEVBQUVGLFNBQVNHLE1BQU0sQ0FBQyxDQUFDLEVBQUVILFVBQVU7SUFDdkYsT0FDSztRQUNILE9BQU9BLFNBQVNJLElBQUk7SUFDdEI7QUFDRiJ9