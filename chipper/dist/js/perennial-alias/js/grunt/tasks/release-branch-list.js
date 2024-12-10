// Copyright 2024, University of Colorado Boulder
/**
 * Prints out a list of all release branches that would need maintenance patches
 * --repo : Only show branches for a specific repository
 * --order=<ORDER> : alphabetical|date
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * */ function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
import assert from 'assert';
import _ from 'lodash';
import winston from 'winston';
import assertIsValidRepoName from '../../common/assertIsValidRepoName.js';
import Maintenance from '../../common/Maintenance.js';
import getOption from './util/getOption.js';
_async_to_generator(function*() {
    var _getOption;
    winston.default.transports.console.level = 'error';
    const repo = ((_getOption = getOption('repo')) == null ? void 0 : _getOption.startsWith('perennial')) ? null : getOption('repo');
    const order = getOption('order') || 'alphabetical';
    if (repo) {
        assertIsValidRepoName(repo);
    }
    assert(order === 'alphabetical' || order === 'date', `unsupported order type: ${order}`);
    const branches = yield Maintenance.getMaintenanceBranches((releaseBranch)=>!repo || releaseBranch.repo === repo, true, true);
    let structures = [];
    for (const branch of branches){
        structures.push({
            branch: branch,
            timestamp: yield branch.getDivergingTimestamp()
        });
    }
    if (order === 'date') {
        structures = _.sortBy(structures, (struct)=>struct.timestamp);
    }
    console.log('\nRelease branches:\n{repo} {branch} {brand[,brand]+} {date}\n');
    for (const struct of structures){
        console.log(`${struct.branch.toString()} ${new Date(struct.timestamp).toISOString().split('T')[0]}`);
    }
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy9yZWxlYXNlLWJyYW5jaC1saXN0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBQcmludHMgb3V0IGEgbGlzdCBvZiBhbGwgcmVsZWFzZSBicmFuY2hlcyB0aGF0IHdvdWxkIG5lZWQgbWFpbnRlbmFuY2UgcGF0Y2hlc1xuICogLS1yZXBvIDogT25seSBzaG93IGJyYW5jaGVzIGZvciBhIHNwZWNpZmljIHJlcG9zaXRvcnlcbiAqIC0tb3JkZXI9PE9SREVSPiA6IGFscGhhYmV0aWNhbHxkYXRlXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKiAqL1xuXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHdpbnN0b24gZnJvbSAnd2luc3Rvbic7XG5pbXBvcnQgYXNzZXJ0SXNWYWxpZFJlcG9OYW1lIGZyb20gJy4uLy4uL2NvbW1vbi9hc3NlcnRJc1ZhbGlkUmVwb05hbWUuanMnO1xuaW1wb3J0IE1haW50ZW5hbmNlIGZyb20gJy4uLy4uL2NvbW1vbi9NYWludGVuYW5jZS5qcyc7XG5pbXBvcnQgZ2V0T3B0aW9uIGZyb20gJy4vdXRpbC9nZXRPcHRpb24uanMnO1xuXG4oIGFzeW5jICgpID0+IHtcblxuICB3aW5zdG9uLmRlZmF1bHQudHJhbnNwb3J0cy5jb25zb2xlLmxldmVsID0gJ2Vycm9yJztcblxuICBjb25zdCByZXBvID0gZ2V0T3B0aW9uKCAncmVwbycgKT8uc3RhcnRzV2l0aCggJ3BlcmVubmlhbCcgKSA/IG51bGwgOiBnZXRPcHRpb24oICdyZXBvJyApO1xuICBjb25zdCBvcmRlciA9IGdldE9wdGlvbiggJ29yZGVyJyApIHx8ICdhbHBoYWJldGljYWwnO1xuXG4gIGlmICggcmVwbyApIHtcbiAgICBhc3NlcnRJc1ZhbGlkUmVwb05hbWUoIHJlcG8gKTtcbiAgfVxuXG4gIGFzc2VydCggb3JkZXIgPT09ICdhbHBoYWJldGljYWwnIHx8IG9yZGVyID09PSAnZGF0ZScsIGB1bnN1cHBvcnRlZCBvcmRlciB0eXBlOiAke29yZGVyfWAgKTtcblxuICBjb25zdCBicmFuY2hlcyA9IGF3YWl0IE1haW50ZW5hbmNlLmdldE1haW50ZW5hbmNlQnJhbmNoZXMoIHJlbGVhc2VCcmFuY2ggPT4gIXJlcG8gfHwgcmVsZWFzZUJyYW5jaC5yZXBvID09PSByZXBvLFxuICAgIHRydWUsIHRydWUgKTtcblxuICBsZXQgc3RydWN0dXJlcyA9IFtdO1xuICBmb3IgKCBjb25zdCBicmFuY2ggb2YgYnJhbmNoZXMgKSB7XG4gICAgc3RydWN0dXJlcy5wdXNoKCB7XG4gICAgICBicmFuY2g6IGJyYW5jaCxcbiAgICAgIHRpbWVzdGFtcDogYXdhaXQgYnJhbmNoLmdldERpdmVyZ2luZ1RpbWVzdGFtcCgpXG4gICAgfSApO1xuICB9XG5cbiAgaWYgKCBvcmRlciA9PT0gJ2RhdGUnICkge1xuICAgIHN0cnVjdHVyZXMgPSBfLnNvcnRCeSggc3RydWN0dXJlcywgc3RydWN0ID0+IHN0cnVjdC50aW1lc3RhbXAgKTtcbiAgfVxuXG4gIGNvbnNvbGUubG9nKCAnXFxuUmVsZWFzZSBicmFuY2hlczpcXG57cmVwb30ge2JyYW5jaH0ge2JyYW5kWyxicmFuZF0rfSB7ZGF0ZX1cXG4nICk7XG4gIGZvciAoIGNvbnN0IHN0cnVjdCBvZiBzdHJ1Y3R1cmVzICkge1xuICAgIGNvbnNvbGUubG9nKCBgJHtzdHJ1Y3QuYnJhbmNoLnRvU3RyaW5nKCl9ICR7bmV3IERhdGUoIHN0cnVjdC50aW1lc3RhbXAgKS50b0lTT1N0cmluZygpLnNwbGl0KCAnVCcgKVsgMCBdfWAgKTtcbiAgfVxufSApKCk7Il0sIm5hbWVzIjpbImFzc2VydCIsIl8iLCJ3aW5zdG9uIiwiYXNzZXJ0SXNWYWxpZFJlcG9OYW1lIiwiTWFpbnRlbmFuY2UiLCJnZXRPcHRpb24iLCJkZWZhdWx0IiwidHJhbnNwb3J0cyIsImNvbnNvbGUiLCJsZXZlbCIsInJlcG8iLCJzdGFydHNXaXRoIiwib3JkZXIiLCJicmFuY2hlcyIsImdldE1haW50ZW5hbmNlQnJhbmNoZXMiLCJyZWxlYXNlQnJhbmNoIiwic3RydWN0dXJlcyIsImJyYW5jaCIsInB1c2giLCJ0aW1lc3RhbXAiLCJnZXREaXZlcmdpbmdUaW1lc3RhbXAiLCJzb3J0QnkiLCJzdHJ1Y3QiLCJsb2ciLCJ0b1N0cmluZyIsIkRhdGUiLCJ0b0lTT1N0cmluZyIsInNwbGl0Il0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7O0dBS0c7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUgsT0FBT0EsWUFBWSxTQUFTO0FBQzVCLE9BQU9DLE9BQU8sU0FBUztBQUN2QixPQUFPQyxhQUFhLFVBQVU7QUFDOUIsT0FBT0MsMkJBQTJCLHdDQUF3QztBQUMxRSxPQUFPQyxpQkFBaUIsOEJBQThCO0FBQ3RELE9BQU9DLGVBQWUsc0JBQXNCO0FBRTFDLG9CQUFBO1FBSWFBO0lBRmJILFFBQVFJLE9BQU8sQ0FBQ0MsVUFBVSxDQUFDQyxPQUFPLENBQUNDLEtBQUssR0FBRztJQUUzQyxNQUFNQyxPQUFPTCxFQUFBQSxhQUFBQSxVQUFXLDRCQUFYQSxXQUFxQk0sVUFBVSxDQUFFLGdCQUFnQixPQUFPTixVQUFXO0lBQ2hGLE1BQU1PLFFBQVFQLFVBQVcsWUFBYTtJQUV0QyxJQUFLSyxNQUFPO1FBQ1ZQLHNCQUF1Qk87SUFDekI7SUFFQVYsT0FBUVksVUFBVSxrQkFBa0JBLFVBQVUsUUFBUSxDQUFDLHdCQUF3QixFQUFFQSxPQUFPO0lBRXhGLE1BQU1DLFdBQVcsTUFBTVQsWUFBWVUsc0JBQXNCLENBQUVDLENBQUFBLGdCQUFpQixDQUFDTCxRQUFRSyxjQUFjTCxJQUFJLEtBQUtBLE1BQzFHLE1BQU07SUFFUixJQUFJTSxhQUFhLEVBQUU7SUFDbkIsS0FBTSxNQUFNQyxVQUFVSixTQUFXO1FBQy9CRyxXQUFXRSxJQUFJLENBQUU7WUFDZkQsUUFBUUE7WUFDUkUsV0FBVyxNQUFNRixPQUFPRyxxQkFBcUI7UUFDL0M7SUFDRjtJQUVBLElBQUtSLFVBQVUsUUFBUztRQUN0QkksYUFBYWYsRUFBRW9CLE1BQU0sQ0FBRUwsWUFBWU0sQ0FBQUEsU0FBVUEsT0FBT0gsU0FBUztJQUMvRDtJQUVBWCxRQUFRZSxHQUFHLENBQUU7SUFDYixLQUFNLE1BQU1ELFVBQVVOLFdBQWE7UUFDakNSLFFBQVFlLEdBQUcsQ0FBRSxHQUFHRCxPQUFPTCxNQUFNLENBQUNPLFFBQVEsR0FBRyxDQUFDLEVBQUUsSUFBSUMsS0FBTUgsT0FBT0gsU0FBUyxFQUFHTyxXQUFXLEdBQUdDLEtBQUssQ0FBRSxJQUFLLENBQUUsRUFBRyxFQUFFO0lBQzVHO0FBQ0YifQ==