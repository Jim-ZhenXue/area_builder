// Copyright 2018, University of Colorado Boulder
/**
 * git rev-parse
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ const execute = require('./execute').default;
const assert = require('assert');
/**
 * Gets a single commit for a given query
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string} query
 * @returns {Promise.<string>} - Resolves to the SHA.
 */ module.exports = function(repo, query) {
    assert(typeof repo === 'string');
    assert(typeof query === 'string');
    return execute('git', [
        'rev-parse',
        query
    ], `../${repo}`).then((stdout)=>{
        const sha = stdout.trim();
        if (sha.length === 0) {
            return Promise.reject(new Error('No matching SHA'));
        } else if (sha.length > 40) {
            return Promise.reject(new Error('Potentially multiple SHAs returned'));
        } else {
            return Promise.resolve(sha);
        }
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2l0UmV2UGFyc2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIGdpdCByZXYtcGFyc2VcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuL2V4ZWN1dGUnICkuZGVmYXVsdDtcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoICdhc3NlcnQnICk7XG5cbi8qKlxuICogR2V0cyBhIHNpbmdsZSBjb21taXQgZm9yIGEgZ2l2ZW4gcXVlcnlcbiAqIEBwdWJsaWNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwbyAtIFRoZSByZXBvc2l0b3J5IG5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBxdWVyeVxuICogQHJldHVybnMge1Byb21pc2UuPHN0cmluZz59IC0gUmVzb2x2ZXMgdG8gdGhlIFNIQS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggcmVwbywgcXVlcnkgKSB7XG4gIGFzc2VydCggdHlwZW9mIHJlcG8gPT09ICdzdHJpbmcnICk7XG4gIGFzc2VydCggdHlwZW9mIHF1ZXJ5ID09PSAnc3RyaW5nJyApO1xuXG4gIHJldHVybiBleGVjdXRlKCAnZ2l0JywgWyAncmV2LXBhcnNlJywgcXVlcnkgXSwgYC4uLyR7cmVwb31gICkudGhlbiggc3Rkb3V0ID0+IHtcbiAgICBjb25zdCBzaGEgPSBzdGRvdXQudHJpbSgpO1xuICAgIGlmICggc2hhLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCggbmV3IEVycm9yKCAnTm8gbWF0Y2hpbmcgU0hBJyApICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBzaGEubGVuZ3RoID4gNDAgKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoIG5ldyBFcnJvciggJ1BvdGVudGlhbGx5IG11bHRpcGxlIFNIQXMgcmV0dXJuZWQnICkgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCBzaGEgKTtcbiAgICB9XG4gIH0gKTtcbn07Il0sIm5hbWVzIjpbImV4ZWN1dGUiLCJyZXF1aXJlIiwiZGVmYXVsdCIsImFzc2VydCIsIm1vZHVsZSIsImV4cG9ydHMiLCJyZXBvIiwicXVlcnkiLCJ0aGVuIiwic3Rkb3V0Iiwic2hhIiwidHJpbSIsImxlbmd0aCIsIlByb21pc2UiLCJyZWplY3QiLCJFcnJvciIsInJlc29sdmUiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDLEdBRUQsTUFBTUEsVUFBVUMsUUFBUyxhQUFjQyxPQUFPO0FBQzlDLE1BQU1DLFNBQVNGLFFBQVM7QUFFeEI7Ozs7Ozs7Q0FPQyxHQUNERyxPQUFPQyxPQUFPLEdBQUcsU0FBVUMsSUFBSSxFQUFFQyxLQUFLO0lBQ3BDSixPQUFRLE9BQU9HLFNBQVM7SUFDeEJILE9BQVEsT0FBT0ksVUFBVTtJQUV6QixPQUFPUCxRQUFTLE9BQU87UUFBRTtRQUFhTztLQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUVELE1BQU0sRUFBR0UsSUFBSSxDQUFFQyxDQUFBQTtRQUNsRSxNQUFNQyxNQUFNRCxPQUFPRSxJQUFJO1FBQ3ZCLElBQUtELElBQUlFLE1BQU0sS0FBSyxHQUFJO1lBQ3RCLE9BQU9DLFFBQVFDLE1BQU0sQ0FBRSxJQUFJQyxNQUFPO1FBQ3BDLE9BQ0ssSUFBS0wsSUFBSUUsTUFBTSxHQUFHLElBQUs7WUFDMUIsT0FBT0MsUUFBUUMsTUFBTSxDQUFFLElBQUlDLE1BQU87UUFDcEMsT0FDSztZQUNILE9BQU9GLFFBQVFHLE9BQU8sQ0FBRU47UUFDMUI7SUFDRjtBQUNGIn0=