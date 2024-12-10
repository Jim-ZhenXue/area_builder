// Copyright 2021-2024, University of Colorado Boulder
/**
 * @author Sam Reid (PhET Interactive Simulations)
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
import fs from 'fs';
import _ from 'lodash';
import phetioCompareAPIs from '../browser-and-node/phetioCompareAPIs.js';
const jsondiffpatch = require('../../../sherpa/lib/jsondiffpatch-v0.3.11.umd').create({});
/**
 * Compare two sets of APIs using phetioCompareAPIs.
 */ export default /*#__PURE__*/ _async_to_generator(function*(repos, proposedAPIs, options) {
    let ok = true;
    options = _.assignIn({
        delta: false,
        compareBreakingAPIChanges: true
    }, options);
    repos.forEach((repo)=>{
        const packageObject = JSON.parse(fs.readFileSync(`../${repo}/package.json`, 'utf8'));
        const phetioSection = packageObject.phet['phet-io'] || {};
        // Fails on missing file or parse error.
        const referenceAPI = JSON.parse(fs.readFileSync(`../phet-io-sim-specific/repos/${repo}/${repo}-phet-io-api.json`, 'utf8'));
        const proposedAPI = proposedAPIs[repo];
        if (!proposedAPI) {
            throw new Error(`No proposedAPI for repo: ${repo}`);
        }
        const comparisonData = phetioCompareAPIs(referenceAPI, proposedAPI, _, {
            compareBreakingAPIChanges: options.compareBreakingAPIChanges,
            compareDesignedAPIChanges: !!phetioSection.compareDesignedAPIChanges // determined from the package.json flag
        });
        if (comparisonData.breakingProblems.length) {
            ok = false;
            console.error(`${repo} BREAKING PROBLEMS`);
            console.error(comparisonData.breakingProblems.join('\n'));
            console.error('\n');
        }
        if (comparisonData.designedProblems.length) {
            ok = false;
            console.error(`${repo} DESIGN PROBLEMS`);
            console.error(comparisonData.designedProblems.join('\n'));
            console.error('\n');
        }
        if (options.delta) {
            const delta = jsondiffpatch.diff(referenceAPI, proposedAPI);
            if (delta) {
                console.log(JSON.stringify(delta, null, 2));
            }
        }
    });
    return ok;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL3BoZXQtaW8vcGhldGlvQ29tcGFyZUFQSVNldHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBwaGV0aW9Db21wYXJlQVBJcywgeyBQaGV0aW9Db21wYXJlQVBJc09wdGlvbnMgfSBmcm9tICcuLi9icm93c2VyLWFuZC1ub2RlL3BoZXRpb0NvbXBhcmVBUElzLmpzJztcbmltcG9ydCB7IFBoZXRpb0FQSXMgfSBmcm9tICcuL2dlbmVyYXRlUGhldGlvTWFjcm9BUEkuanMnO1xuXG5jb25zdCBqc29uZGlmZnBhdGNoID0gcmVxdWlyZSggJy4uLy4uLy4uL3NoZXJwYS9saWIvanNvbmRpZmZwYXRjaC12MC4zLjExLnVtZCcgKS5jcmVhdGUoIHt9ICk7XG5cbnR5cGUgUGhldGlvQ29tcGFyZUFQSVNldHNPcHRpb25zID0ge1xuICBkZWx0YTogYm9vbGVhbjtcbn0gJiBQaGV0aW9Db21wYXJlQVBJc09wdGlvbnM7XG5cbi8qKlxuICogQ29tcGFyZSB0d28gc2V0cyBvZiBBUElzIHVzaW5nIHBoZXRpb0NvbXBhcmVBUElzLlxuICovXG5leHBvcnQgZGVmYXVsdCBhc3luYyAoIHJlcG9zOiBzdHJpbmdbXSwgcHJvcG9zZWRBUElzOiBQaGV0aW9BUElzLCBvcHRpb25zPzogUGFydGlhbDxQaGV0aW9Db21wYXJlQVBJU2V0c09wdGlvbnM+ICk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICBsZXQgb2sgPSB0cnVlO1xuICBvcHRpb25zID0gXy5hc3NpZ25Jbigge1xuICAgIGRlbHRhOiBmYWxzZSxcbiAgICBjb21wYXJlQnJlYWtpbmdBUElDaGFuZ2VzOiB0cnVlXG4gIH0sIG9wdGlvbnMgKTtcblxuICByZXBvcy5mb3JFYWNoKCAoIHJlcG86IHN0cmluZyApID0+IHtcblxuICAgIGNvbnN0IHBhY2thZ2VPYmplY3QgPSBKU09OLnBhcnNlKCBmcy5yZWFkRmlsZVN5bmMoIGAuLi8ke3JlcG99L3BhY2thZ2UuanNvbmAsICd1dGY4JyApICk7XG4gICAgY29uc3QgcGhldGlvU2VjdGlvbiA9IHBhY2thZ2VPYmplY3QucGhldFsgJ3BoZXQtaW8nIF0gfHwge307XG5cbiAgICAvLyBGYWlscyBvbiBtaXNzaW5nIGZpbGUgb3IgcGFyc2UgZXJyb3IuXG4gICAgY29uc3QgcmVmZXJlbmNlQVBJID0gSlNPTi5wYXJzZSggZnMucmVhZEZpbGVTeW5jKCBgLi4vcGhldC1pby1zaW0tc3BlY2lmaWMvcmVwb3MvJHtyZXBvfS8ke3JlcG99LXBoZXQtaW8tYXBpLmpzb25gLCAndXRmOCcgKSApO1xuICAgIGNvbnN0IHByb3Bvc2VkQVBJID0gcHJvcG9zZWRBUElzWyByZXBvIF07XG5cbiAgICBpZiAoICFwcm9wb3NlZEFQSSApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggYE5vIHByb3Bvc2VkQVBJIGZvciByZXBvOiAke3JlcG99YCApO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbXBhcmlzb25EYXRhID0gcGhldGlvQ29tcGFyZUFQSXMoIHJlZmVyZW5jZUFQSSwgcHJvcG9zZWRBUEksIF8sIHtcbiAgICAgIGNvbXBhcmVCcmVha2luZ0FQSUNoYW5nZXM6IG9wdGlvbnMuY29tcGFyZUJyZWFraW5nQVBJQ2hhbmdlcyxcbiAgICAgIGNvbXBhcmVEZXNpZ25lZEFQSUNoYW5nZXM6ICEhcGhldGlvU2VjdGlvbi5jb21wYXJlRGVzaWduZWRBUElDaGFuZ2VzIC8vIGRldGVybWluZWQgZnJvbSB0aGUgcGFja2FnZS5qc29uIGZsYWdcbiAgICB9ICk7XG5cbiAgICBpZiAoIGNvbXBhcmlzb25EYXRhLmJyZWFraW5nUHJvYmxlbXMubGVuZ3RoICkge1xuICAgICAgb2sgPSBmYWxzZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoIGAke3JlcG99IEJSRUFLSU5HIFBST0JMRU1TYCApO1xuICAgICAgY29uc29sZS5lcnJvciggY29tcGFyaXNvbkRhdGEuYnJlYWtpbmdQcm9ibGVtcy5qb2luKCAnXFxuJyApICk7XG4gICAgICBjb25zb2xlLmVycm9yKCAnXFxuJyApO1xuICAgIH1cblxuICAgIGlmICggY29tcGFyaXNvbkRhdGEuZGVzaWduZWRQcm9ibGVtcy5sZW5ndGggKSB7XG4gICAgICBvayA9IGZhbHNlO1xuICAgICAgY29uc29sZS5lcnJvciggYCR7cmVwb30gREVTSUdOIFBST0JMRU1TYCApO1xuICAgICAgY29uc29sZS5lcnJvciggY29tcGFyaXNvbkRhdGEuZGVzaWduZWRQcm9ibGVtcy5qb2luKCAnXFxuJyApICk7XG4gICAgICBjb25zb2xlLmVycm9yKCAnXFxuJyApO1xuICAgIH1cblxuICAgIGlmICggb3B0aW9ucy5kZWx0YSApIHtcbiAgICAgIGNvbnN0IGRlbHRhID0ganNvbmRpZmZwYXRjaC5kaWZmKCByZWZlcmVuY2VBUEksIHByb3Bvc2VkQVBJICk7XG4gICAgICBpZiAoIGRlbHRhICkge1xuICAgICAgICBjb25zb2xlLmxvZyggSlNPTi5zdHJpbmdpZnkoIGRlbHRhLCBudWxsLCAyICkgKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gKTtcblxuICByZXR1cm4gb2s7XG59OyJdLCJuYW1lcyI6WyJmcyIsIl8iLCJwaGV0aW9Db21wYXJlQVBJcyIsImpzb25kaWZmcGF0Y2giLCJyZXF1aXJlIiwiY3JlYXRlIiwicmVwb3MiLCJwcm9wb3NlZEFQSXMiLCJvcHRpb25zIiwib2siLCJhc3NpZ25JbiIsImRlbHRhIiwiY29tcGFyZUJyZWFraW5nQVBJQ2hhbmdlcyIsImZvckVhY2giLCJyZXBvIiwicGFja2FnZU9iamVjdCIsIkpTT04iLCJwYXJzZSIsInJlYWRGaWxlU3luYyIsInBoZXRpb1NlY3Rpb24iLCJwaGV0IiwicmVmZXJlbmNlQVBJIiwicHJvcG9zZWRBUEkiLCJFcnJvciIsImNvbXBhcmlzb25EYXRhIiwiY29tcGFyZURlc2lnbmVkQVBJQ2hhbmdlcyIsImJyZWFraW5nUHJvYmxlbXMiLCJsZW5ndGgiLCJjb25zb2xlIiwiZXJyb3IiLCJqb2luIiwiZGVzaWduZWRQcm9ibGVtcyIsImRpZmYiLCJsb2ciLCJzdHJpbmdpZnkiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Q0FFQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxPQUFPQSxRQUFRLEtBQUs7QUFDcEIsT0FBT0MsT0FBTyxTQUFTO0FBQ3ZCLE9BQU9DLHVCQUFxRCwyQ0FBMkM7QUFHdkcsTUFBTUMsZ0JBQWdCQyxRQUFTLGlEQUFrREMsTUFBTSxDQUFFLENBQUM7QUFNMUY7O0NBRUMsR0FDRCxpREFBZSxVQUFRQyxPQUFpQkMsY0FBMEJDO0lBQ2hFLElBQUlDLEtBQUs7SUFDVEQsVUFBVVAsRUFBRVMsUUFBUSxDQUFFO1FBQ3BCQyxPQUFPO1FBQ1BDLDJCQUEyQjtJQUM3QixHQUFHSjtJQUVIRixNQUFNTyxPQUFPLENBQUUsQ0FBRUM7UUFFZixNQUFNQyxnQkFBZ0JDLEtBQUtDLEtBQUssQ0FBRWpCLEdBQUdrQixZQUFZLENBQUUsQ0FBQyxHQUFHLEVBQUVKLEtBQUssYUFBYSxDQUFDLEVBQUU7UUFDOUUsTUFBTUssZ0JBQWdCSixjQUFjSyxJQUFJLENBQUUsVUFBVyxJQUFJLENBQUM7UUFFMUQsd0NBQXdDO1FBQ3hDLE1BQU1DLGVBQWVMLEtBQUtDLEtBQUssQ0FBRWpCLEdBQUdrQixZQUFZLENBQUUsQ0FBQyw4QkFBOEIsRUFBRUosS0FBSyxDQUFDLEVBQUVBLEtBQUssaUJBQWlCLENBQUMsRUFBRTtRQUNwSCxNQUFNUSxjQUFjZixZQUFZLENBQUVPLEtBQU07UUFFeEMsSUFBSyxDQUFDUSxhQUFjO1lBQ2xCLE1BQU0sSUFBSUMsTUFBTyxDQUFDLHlCQUF5QixFQUFFVCxNQUFNO1FBQ3JEO1FBRUEsTUFBTVUsaUJBQWlCdEIsa0JBQW1CbUIsY0FBY0MsYUFBYXJCLEdBQUc7WUFDdEVXLDJCQUEyQkosUUFBUUkseUJBQXlCO1lBQzVEYSwyQkFBMkIsQ0FBQyxDQUFDTixjQUFjTSx5QkFBeUIsQ0FBQyx3Q0FBd0M7UUFDL0c7UUFFQSxJQUFLRCxlQUFlRSxnQkFBZ0IsQ0FBQ0MsTUFBTSxFQUFHO1lBQzVDbEIsS0FBSztZQUNMbUIsUUFBUUMsS0FBSyxDQUFFLEdBQUdmLEtBQUssa0JBQWtCLENBQUM7WUFDMUNjLFFBQVFDLEtBQUssQ0FBRUwsZUFBZUUsZ0JBQWdCLENBQUNJLElBQUksQ0FBRTtZQUNyREYsUUFBUUMsS0FBSyxDQUFFO1FBQ2pCO1FBRUEsSUFBS0wsZUFBZU8sZ0JBQWdCLENBQUNKLE1BQU0sRUFBRztZQUM1Q2xCLEtBQUs7WUFDTG1CLFFBQVFDLEtBQUssQ0FBRSxHQUFHZixLQUFLLGdCQUFnQixDQUFDO1lBQ3hDYyxRQUFRQyxLQUFLLENBQUVMLGVBQWVPLGdCQUFnQixDQUFDRCxJQUFJLENBQUU7WUFDckRGLFFBQVFDLEtBQUssQ0FBRTtRQUNqQjtRQUVBLElBQUtyQixRQUFRRyxLQUFLLEVBQUc7WUFDbkIsTUFBTUEsUUFBUVIsY0FBYzZCLElBQUksQ0FBRVgsY0FBY0M7WUFDaEQsSUFBS1gsT0FBUTtnQkFDWGlCLFFBQVFLLEdBQUcsQ0FBRWpCLEtBQUtrQixTQUFTLENBQUV2QixPQUFPLE1BQU07WUFDNUM7UUFDRjtJQUNGO0lBRUEsT0FBT0Y7QUFDVCxHQUFFIn0=