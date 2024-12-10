// Copyright 2019-2023, University of Colorado Boulder
/**
 * Print the list of production sims for clients.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
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
const getDependencies = require('./getDependencies');
const gitCheckout = require('./gitCheckout');
const gitIsAncestor = require('./gitIsAncestor');
const simPhetioMetadata = require('./simPhetioMetadata');
module.exports = /*#__PURE__*/ _async_to_generator(function*() {
    // {Array.<Object>} get sim metadata via metadata API, here is an example of what an entry might look like:
    /*
  {
    "versionMaintenance": 12,
    "name": "molarity",
    "active": true,
    "versionMajor": 1,
    "versionMinor": 4,
    "versionSuffix": "",
    "latest": true,
    "timestamp": "2019-10-25"
  }
   */ const allSimsData = yield simPhetioMetadata({
        active: true,
        latest: true
    });
    // Get a list of sim versions where the highest versions of each sim are first.
    const sortedAndReversed = _.sortBy(allSimsData, (simData)=>`${simData.name}${getVersion(simData)}`).reverse();
    // Get rid of all lower versions, then reverse back to alphabetical sorting.
    const oneVersionPerSimList = _.uniqBy(sortedAndReversed, (simData)=>simData.name).reverse();
    const phetioLinks = [];
    for (const simData of oneVersionPerSimList){
        const useTopLevelIndex = yield usesTopLevelIndex(simData.name, getBranch(simData));
        phetioLinks.push(`https://phet-io.colorado.edu/sims/${simData.name}/${getVersion(simData)}/${useTopLevelIndex ? '' : 'wrappers/index/'}`);
    }
    return phetioLinks;
});
function usesTopLevelIndex(repo, branch) {
    return _usesTopLevelIndex.apply(this, arguments);
}
function _usesTopLevelIndex() {
    _usesTopLevelIndex = /**
 * Returns whether phet-io Studio is being used instead of deprecated instance proxies wrapper.
 *
 * @param {string} repo
 * @param {string} branch
 * @returns {Promise.<boolean>}
 */ _async_to_generator(function*(repo, branch) {
        yield gitCheckout(repo, branch);
        const dependencies = yield getDependencies(repo);
        const sha = dependencies.chipper.sha;
        yield gitCheckout(repo, 'main');
        return gitIsAncestor('chipper', '8db0653ee0cbb6ed716fa3b4d4759bcb75d8118a', sha);
    });
    return _usesTopLevelIndex.apply(this, arguments);
}
// {Object} metadata -> version string
const getVersion = (simData)=>`${simData.versionMajor}.${simData.versionMinor}`;
// {Object} metadata -> branch name
const getBranch = (simData)=>{
    let branch = `${simData.versionMajor}.${simData.versionMinor}`;
    if (simData.versionSuffix.length) {
        branch += `-${simData.versionSuffix}`; // additional dash required
    }
    return branch;
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2V0UGhldGlvTGlua3MuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUHJpbnQgdGhlIGxpc3Qgb2YgcHJvZHVjdGlvbiBzaW1zIGZvciBjbGllbnRzLlxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuY29uc3QgXyA9IHJlcXVpcmUoICdsb2Rhc2gnICk7XG5jb25zdCBnZXREZXBlbmRlbmNpZXMgPSByZXF1aXJlKCAnLi9nZXREZXBlbmRlbmNpZXMnICk7XG5jb25zdCBnaXRDaGVja291dCA9IHJlcXVpcmUoICcuL2dpdENoZWNrb3V0JyApO1xuY29uc3QgZ2l0SXNBbmNlc3RvciA9IHJlcXVpcmUoICcuL2dpdElzQW5jZXN0b3InICk7XG5jb25zdCBzaW1QaGV0aW9NZXRhZGF0YSA9IHJlcXVpcmUoICcuL3NpbVBoZXRpb01ldGFkYXRhJyApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jICgpID0+IHtcblxuICAvLyB7QXJyYXkuPE9iamVjdD59IGdldCBzaW0gbWV0YWRhdGEgdmlhIG1ldGFkYXRhIEFQSSwgaGVyZSBpcyBhbiBleGFtcGxlIG9mIHdoYXQgYW4gZW50cnkgbWlnaHQgbG9vayBsaWtlOlxuICAvKlxuICB7XG4gICAgXCJ2ZXJzaW9uTWFpbnRlbmFuY2VcIjogMTIsXG4gICAgXCJuYW1lXCI6IFwibW9sYXJpdHlcIixcbiAgICBcImFjdGl2ZVwiOiB0cnVlLFxuICAgIFwidmVyc2lvbk1ham9yXCI6IDEsXG4gICAgXCJ2ZXJzaW9uTWlub3JcIjogNCxcbiAgICBcInZlcnNpb25TdWZmaXhcIjogXCJcIixcbiAgICBcImxhdGVzdFwiOiB0cnVlLFxuICAgIFwidGltZXN0YW1wXCI6IFwiMjAxOS0xMC0yNVwiXG4gIH1cbiAgICovXG4gIGNvbnN0IGFsbFNpbXNEYXRhID0gYXdhaXQgc2ltUGhldGlvTWV0YWRhdGEoIHtcbiAgICBhY3RpdmU6IHRydWUsXG4gICAgbGF0ZXN0OiB0cnVlXG4gIH0gKTtcblxuICAvLyBHZXQgYSBsaXN0IG9mIHNpbSB2ZXJzaW9ucyB3aGVyZSB0aGUgaGlnaGVzdCB2ZXJzaW9ucyBvZiBlYWNoIHNpbSBhcmUgZmlyc3QuXG4gIGNvbnN0IHNvcnRlZEFuZFJldmVyc2VkID0gXy5zb3J0QnkoIGFsbFNpbXNEYXRhLCBzaW1EYXRhID0+IGAke3NpbURhdGEubmFtZX0ke2dldFZlcnNpb24oIHNpbURhdGEgKX1gICkucmV2ZXJzZSgpO1xuXG4gIC8vIEdldCByaWQgb2YgYWxsIGxvd2VyIHZlcnNpb25zLCB0aGVuIHJldmVyc2UgYmFjayB0byBhbHBoYWJldGljYWwgc29ydGluZy5cbiAgY29uc3Qgb25lVmVyc2lvblBlclNpbUxpc3QgPSBfLnVuaXFCeSggc29ydGVkQW5kUmV2ZXJzZWQsIHNpbURhdGEgPT4gc2ltRGF0YS5uYW1lICkucmV2ZXJzZSgpO1xuXG4gIGNvbnN0IHBoZXRpb0xpbmtzID0gW107XG4gIGZvciAoIGNvbnN0IHNpbURhdGEgb2Ygb25lVmVyc2lvblBlclNpbUxpc3QgKSB7XG5cbiAgICBjb25zdCB1c2VUb3BMZXZlbEluZGV4ID0gYXdhaXQgdXNlc1RvcExldmVsSW5kZXgoIHNpbURhdGEubmFtZSwgZ2V0QnJhbmNoKCBzaW1EYXRhICkgKTtcblxuICAgIHBoZXRpb0xpbmtzLnB1c2goIGBodHRwczovL3BoZXQtaW8uY29sb3JhZG8uZWR1L3NpbXMvJHtzaW1EYXRhLm5hbWV9LyR7Z2V0VmVyc2lvbiggc2ltRGF0YSApfS8ke3VzZVRvcExldmVsSW5kZXggPyAnJyA6ICd3cmFwcGVycy9pbmRleC8nfWAgKTtcbiAgfVxuXG4gIHJldHVybiBwaGV0aW9MaW5rcztcbn07XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIHBoZXQtaW8gU3R1ZGlvIGlzIGJlaW5nIHVzZWQgaW5zdGVhZCBvZiBkZXByZWNhdGVkIGluc3RhbmNlIHByb3hpZXMgd3JhcHBlci5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwb1xuICogQHBhcmFtIHtzdHJpbmd9IGJyYW5jaFxuICogQHJldHVybnMge1Byb21pc2UuPGJvb2xlYW4+fVxuICovXG5hc3luYyBmdW5jdGlvbiB1c2VzVG9wTGV2ZWxJbmRleCggcmVwbywgYnJhbmNoICkge1xuICBhd2FpdCBnaXRDaGVja291dCggcmVwbywgYnJhbmNoICk7XG4gIGNvbnN0IGRlcGVuZGVuY2llcyA9IGF3YWl0IGdldERlcGVuZGVuY2llcyggcmVwbyApO1xuICBjb25zdCBzaGEgPSBkZXBlbmRlbmNpZXMuY2hpcHBlci5zaGE7XG4gIGF3YWl0IGdpdENoZWNrb3V0KCByZXBvLCAnbWFpbicgKTtcblxuICByZXR1cm4gZ2l0SXNBbmNlc3RvciggJ2NoaXBwZXInLCAnOGRiMDY1M2VlMGNiYjZlZDcxNmZhM2I0ZDQ3NTliY2I3NWQ4MTE4YScsIHNoYSApO1xufVxuXG4vLyB7T2JqZWN0fSBtZXRhZGF0YSAtPiB2ZXJzaW9uIHN0cmluZ1xuY29uc3QgZ2V0VmVyc2lvbiA9IHNpbURhdGEgPT4gYCR7c2ltRGF0YS52ZXJzaW9uTWFqb3J9LiR7c2ltRGF0YS52ZXJzaW9uTWlub3J9YDtcblxuLy8ge09iamVjdH0gbWV0YWRhdGEgLT4gYnJhbmNoIG5hbWVcbmNvbnN0IGdldEJyYW5jaCA9IHNpbURhdGEgPT4ge1xuICBsZXQgYnJhbmNoID0gYCR7c2ltRGF0YS52ZXJzaW9uTWFqb3J9LiR7c2ltRGF0YS52ZXJzaW9uTWlub3J9YDtcbiAgaWYgKCBzaW1EYXRhLnZlcnNpb25TdWZmaXgubGVuZ3RoICkge1xuICAgIGJyYW5jaCArPSBgLSR7c2ltRGF0YS52ZXJzaW9uU3VmZml4fWA7IC8vIGFkZGl0aW9uYWwgZGFzaCByZXF1aXJlZFxuICB9XG4gIHJldHVybiBicmFuY2g7XG59OyJdLCJuYW1lcyI6WyJfIiwicmVxdWlyZSIsImdldERlcGVuZGVuY2llcyIsImdpdENoZWNrb3V0IiwiZ2l0SXNBbmNlc3RvciIsInNpbVBoZXRpb01ldGFkYXRhIiwibW9kdWxlIiwiZXhwb3J0cyIsImFsbFNpbXNEYXRhIiwiYWN0aXZlIiwibGF0ZXN0Iiwic29ydGVkQW5kUmV2ZXJzZWQiLCJzb3J0QnkiLCJzaW1EYXRhIiwibmFtZSIsImdldFZlcnNpb24iLCJyZXZlcnNlIiwib25lVmVyc2lvblBlclNpbUxpc3QiLCJ1bmlxQnkiLCJwaGV0aW9MaW5rcyIsInVzZVRvcExldmVsSW5kZXgiLCJ1c2VzVG9wTGV2ZWxJbmRleCIsImdldEJyYW5jaCIsInB1c2giLCJyZXBvIiwiYnJhbmNoIiwiZGVwZW5kZW5jaWVzIiwic2hhIiwiY2hpcHBlciIsInZlcnNpb25NYWpvciIsInZlcnNpb25NaW5vciIsInZlcnNpb25TdWZmaXgiLCJsZW5ndGgiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7O0NBTUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsSUFBSUMsUUFBUztBQUNuQixNQUFNQyxrQkFBa0JELFFBQVM7QUFDakMsTUFBTUUsY0FBY0YsUUFBUztBQUM3QixNQUFNRyxnQkFBZ0JILFFBQVM7QUFDL0IsTUFBTUksb0JBQW9CSixRQUFTO0FBRW5DSyxPQUFPQyxPQUFPLHFDQUFHO0lBRWYsMkdBQTJHO0lBQzNHOzs7Ozs7Ozs7OztHQVdDLEdBQ0QsTUFBTUMsY0FBYyxNQUFNSCxrQkFBbUI7UUFDM0NJLFFBQVE7UUFDUkMsUUFBUTtJQUNWO0lBRUEsK0VBQStFO0lBQy9FLE1BQU1DLG9CQUFvQlgsRUFBRVksTUFBTSxDQUFFSixhQUFhSyxDQUFBQSxVQUFXLEdBQUdBLFFBQVFDLElBQUksR0FBR0MsV0FBWUYsVUFBVyxFQUFHRyxPQUFPO0lBRS9HLDRFQUE0RTtJQUM1RSxNQUFNQyx1QkFBdUJqQixFQUFFa0IsTUFBTSxDQUFFUCxtQkFBbUJFLENBQUFBLFVBQVdBLFFBQVFDLElBQUksRUFBR0UsT0FBTztJQUUzRixNQUFNRyxjQUFjLEVBQUU7SUFDdEIsS0FBTSxNQUFNTixXQUFXSSxxQkFBdUI7UUFFNUMsTUFBTUcsbUJBQW1CLE1BQU1DLGtCQUFtQlIsUUFBUUMsSUFBSSxFQUFFUSxVQUFXVDtRQUUzRU0sWUFBWUksSUFBSSxDQUFFLENBQUMsa0NBQWtDLEVBQUVWLFFBQVFDLElBQUksQ0FBQyxDQUFDLEVBQUVDLFdBQVlGLFNBQVUsQ0FBQyxFQUFFTyxtQkFBbUIsS0FBSyxtQkFBbUI7SUFDN0k7SUFFQSxPQUFPRDtBQUNUO1NBU2VFLGtCQUFtQkcsSUFBSSxFQUFFQyxNQUFNO1dBQS9CSjs7U0FBQUE7SUFBQUEscUJBUGY7Ozs7OztDQU1DLEdBQ0Qsb0JBQUEsVUFBa0NHLElBQUksRUFBRUMsTUFBTTtRQUM1QyxNQUFNdEIsWUFBYXFCLE1BQU1DO1FBQ3pCLE1BQU1DLGVBQWUsTUFBTXhCLGdCQUFpQnNCO1FBQzVDLE1BQU1HLE1BQU1ELGFBQWFFLE9BQU8sQ0FBQ0QsR0FBRztRQUNwQyxNQUFNeEIsWUFBYXFCLE1BQU07UUFFekIsT0FBT3BCLGNBQWUsV0FBVyw0Q0FBNEN1QjtJQUMvRTtXQVBlTjs7QUFTZixzQ0FBc0M7QUFDdEMsTUFBTU4sYUFBYUYsQ0FBQUEsVUFBVyxHQUFHQSxRQUFRZ0IsWUFBWSxDQUFDLENBQUMsRUFBRWhCLFFBQVFpQixZQUFZLEVBQUU7QUFFL0UsbUNBQW1DO0FBQ25DLE1BQU1SLFlBQVlULENBQUFBO0lBQ2hCLElBQUlZLFNBQVMsR0FBR1osUUFBUWdCLFlBQVksQ0FBQyxDQUFDLEVBQUVoQixRQUFRaUIsWUFBWSxFQUFFO0lBQzlELElBQUtqQixRQUFRa0IsYUFBYSxDQUFDQyxNQUFNLEVBQUc7UUFDbENQLFVBQVUsQ0FBQyxDQUFDLEVBQUVaLFFBQVFrQixhQUFhLEVBQUUsRUFBRSwyQkFBMkI7SUFDcEU7SUFDQSxPQUFPTjtBQUNUIn0=