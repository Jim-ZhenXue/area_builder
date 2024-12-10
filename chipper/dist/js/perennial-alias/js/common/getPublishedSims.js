// Copyright 2022, University of Colorado Boulder
/**
 * Returns a list of simulation repos that have been published (does NOT include prototypes)
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
const simMetadata = require('./simMetadata');
const simPhetioMetadata = require('./simPhetioMetadata');
const _ = require('lodash');
/**
 * Returns a list of simulation repos that have been published (does NOT include prototypes)
 * @public
 *
 * @returns {Promise<Array.<string>>}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*() {
    const publishedRepos = [];
    const metadata = yield simMetadata({
        includePrototypes: false
    });
    metadata.projects.forEach((projectData)=>{
        if (projectData.name.startsWith('html/')) {
            publishedRepos.push(projectData.name.substring('html/'.length));
        }
    });
    (yield simPhetioMetadata({
        active: true,
        latest: true
    })).filter((simData)=>simData.active && simData.latest).forEach((simData)=>{
        publishedRepos.push(simData.name);
    });
    return _.uniq(publishedRepos).sort();
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2V0UHVibGlzaGVkU2ltcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUmV0dXJucyBhIGxpc3Qgb2Ygc2ltdWxhdGlvbiByZXBvcyB0aGF0IGhhdmUgYmVlbiBwdWJsaXNoZWQgKGRvZXMgTk9UIGluY2x1ZGUgcHJvdG90eXBlcylcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3Qgc2ltTWV0YWRhdGEgPSByZXF1aXJlKCAnLi9zaW1NZXRhZGF0YScgKTtcbmNvbnN0IHNpbVBoZXRpb01ldGFkYXRhID0gcmVxdWlyZSggJy4vc2ltUGhldGlvTWV0YWRhdGEnICk7XG5jb25zdCBfID0gcmVxdWlyZSggJ2xvZGFzaCcgKTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgbGlzdCBvZiBzaW11bGF0aW9uIHJlcG9zIHRoYXQgaGF2ZSBiZWVuIHB1Ymxpc2hlZCAoZG9lcyBOT1QgaW5jbHVkZSBwcm90b3R5cGVzKVxuICogQHB1YmxpY1xuICpcbiAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5LjxzdHJpbmc+Pn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbigpIHtcbiAgY29uc3QgcHVibGlzaGVkUmVwb3MgPSBbXTtcblxuICBjb25zdCBtZXRhZGF0YSA9IGF3YWl0IHNpbU1ldGFkYXRhKCB7XG4gICAgaW5jbHVkZVByb3RvdHlwZXM6IGZhbHNlXG4gIH0gKTtcbiAgbWV0YWRhdGEucHJvamVjdHMuZm9yRWFjaCggcHJvamVjdERhdGEgPT4ge1xuICAgIGlmICggcHJvamVjdERhdGEubmFtZS5zdGFydHNXaXRoKCAnaHRtbC8nICkgKSB7XG4gICAgICBwdWJsaXNoZWRSZXBvcy5wdXNoKCBwcm9qZWN0RGF0YS5uYW1lLnN1YnN0cmluZyggJ2h0bWwvJy5sZW5ndGggKSApO1xuICAgIH1cbiAgfSApO1xuXG4gICggYXdhaXQgc2ltUGhldGlvTWV0YWRhdGEoIHtcbiAgICBhY3RpdmU6IHRydWUsXG4gICAgbGF0ZXN0OiB0cnVlXG4gIH0gKSApLmZpbHRlciggc2ltRGF0YSA9PiBzaW1EYXRhLmFjdGl2ZSAmJiBzaW1EYXRhLmxhdGVzdCApLmZvckVhY2goIHNpbURhdGEgPT4ge1xuICAgIHB1Ymxpc2hlZFJlcG9zLnB1c2goIHNpbURhdGEubmFtZSApO1xuICB9ICk7XG5cbiAgcmV0dXJuIF8udW5pcSggcHVibGlzaGVkUmVwb3MgKS5zb3J0KCk7XG59OyJdLCJuYW1lcyI6WyJzaW1NZXRhZGF0YSIsInJlcXVpcmUiLCJzaW1QaGV0aW9NZXRhZGF0YSIsIl8iLCJtb2R1bGUiLCJleHBvcnRzIiwicHVibGlzaGVkUmVwb3MiLCJtZXRhZGF0YSIsImluY2x1ZGVQcm90b3R5cGVzIiwicHJvamVjdHMiLCJmb3JFYWNoIiwicHJvamVjdERhdGEiLCJuYW1lIiwic3RhcnRzV2l0aCIsInB1c2giLCJzdWJzdHJpbmciLCJsZW5ndGgiLCJhY3RpdmUiLCJsYXRlc3QiLCJmaWx0ZXIiLCJzaW1EYXRhIiwidW5pcSIsInNvcnQiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE1BQU1BLGNBQWNDLFFBQVM7QUFDN0IsTUFBTUMsb0JBQW9CRCxRQUFTO0FBQ25DLE1BQU1FLElBQUlGLFFBQVM7QUFFbkI7Ozs7O0NBS0MsR0FDREcsT0FBT0MsT0FBTyxxQ0FBRztJQUNmLE1BQU1DLGlCQUFpQixFQUFFO0lBRXpCLE1BQU1DLFdBQVcsTUFBTVAsWUFBYTtRQUNsQ1EsbUJBQW1CO0lBQ3JCO0lBQ0FELFNBQVNFLFFBQVEsQ0FBQ0MsT0FBTyxDQUFFQyxDQUFBQTtRQUN6QixJQUFLQSxZQUFZQyxJQUFJLENBQUNDLFVBQVUsQ0FBRSxVQUFZO1lBQzVDUCxlQUFlUSxJQUFJLENBQUVILFlBQVlDLElBQUksQ0FBQ0csU0FBUyxDQUFFLFFBQVFDLE1BQU07UUFDakU7SUFDRjtJQUVFLENBQUEsTUFBTWQsa0JBQW1CO1FBQ3pCZSxRQUFRO1FBQ1JDLFFBQVE7SUFDVixFQUFFLEVBQUlDLE1BQU0sQ0FBRUMsQ0FBQUEsVUFBV0EsUUFBUUgsTUFBTSxJQUFJRyxRQUFRRixNQUFNLEVBQUdSLE9BQU8sQ0FBRVUsQ0FBQUE7UUFDbkVkLGVBQWVRLElBQUksQ0FBRU0sUUFBUVIsSUFBSTtJQUNuQztJQUVBLE9BQU9ULEVBQUVrQixJQUFJLENBQUVmLGdCQUFpQmdCLElBQUk7QUFDdEMifQ==