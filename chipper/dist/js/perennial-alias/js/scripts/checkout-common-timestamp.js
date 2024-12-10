// Copyright 2024, University of Colorado Boulder
/**
 * Check out a specific timestamp for common-code repositories
 * --timestamp : the timestamp to check things out for, e.g. --timestamp="Jan 08 2018"
 * --skipNpmUpdate : If provided, will prevent the usual npm update
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
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
import assert from 'assert';
import _ from 'lodash';
import winston from 'winston';
import getRepoList from '../common/getRepoList.js';
import gitFetchCheckout from '../common/gitFetchCheckout.js';
import gitFromTimestamp from '../common/gitFromTimestamp.js';
import npmUpdate from '../common/npmUpdate.js';
import getOption from '../grunt/tasks/util/getOption.js';
_async_to_generator(function*() {
    const timestamp = getOption('timestamp');
    assert(timestamp, 'Requires specifying a timestamp with --timestamp={{BRANCH}}');
    const includeNpmUpdate = !getOption('skipNpmUpdate');
    const repos = _.uniq([
        ...getRepoList('active-common-sim-repos'),
        'assert',
        'brand',
        'joist',
        'query-string-machine',
        'sherpa',
        'utterance-queue',
        'phet-core',
        'tandem',
        'axon',
        'dot',
        'kite',
        'scenery',
        'scenery-phet',
        'sun',
        'twixt',
        'phetcommon',
        'phet-lib',
        'chipper',
        'perennial-alias',
        'phetmarks'
    ]).sort();
    for (const repo of repos){
        winston.info(repo);
        try {
            const sha = yield gitFromTimestamp(repo, 'main', timestamp);
            yield gitFetchCheckout(repo, sha);
        } catch (e) {
            winston.error(`skipping ${repo}: ${e}`);
        }
    }
    if (includeNpmUpdate) {
        yield npmUpdate('chipper');
        yield npmUpdate('perennial-alias');
    }
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL2NoZWNrb3V0LWNvbW1vbi10aW1lc3RhbXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENoZWNrIG91dCBhIHNwZWNpZmljIHRpbWVzdGFtcCBmb3IgY29tbW9uLWNvZGUgcmVwb3NpdG9yaWVzXG4gKiAtLXRpbWVzdGFtcCA6IHRoZSB0aW1lc3RhbXAgdG8gY2hlY2sgdGhpbmdzIG91dCBmb3IsIGUuZy4gLS10aW1lc3RhbXA9XCJKYW4gMDggMjAxOFwiXG4gKiAtLXNraXBOcG1VcGRhdGUgOiBJZiBwcm92aWRlZCwgd2lsbCBwcmV2ZW50IHRoZSB1c3VhbCBucG0gdXBkYXRlXG4gKlxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgd2luc3RvbiBmcm9tICd3aW5zdG9uJztcbmltcG9ydCBnZXRSZXBvTGlzdCBmcm9tICcuLi9jb21tb24vZ2V0UmVwb0xpc3QuanMnO1xuaW1wb3J0IGdpdEZldGNoQ2hlY2tvdXQgZnJvbSAnLi4vY29tbW9uL2dpdEZldGNoQ2hlY2tvdXQuanMnO1xuaW1wb3J0IGdpdEZyb21UaW1lc3RhbXAgZnJvbSAnLi4vY29tbW9uL2dpdEZyb21UaW1lc3RhbXAuanMnO1xuaW1wb3J0IG5wbVVwZGF0ZSBmcm9tICcuLi9jb21tb24vbnBtVXBkYXRlLmpzJztcbmltcG9ydCBnZXRPcHRpb24gZnJvbSAnLi4vZ3J1bnQvdGFza3MvdXRpbC9nZXRPcHRpb24uanMnO1xuXG4oIGFzeW5jICgpID0+IHtcbiAgY29uc3QgdGltZXN0YW1wID0gZ2V0T3B0aW9uKCAndGltZXN0YW1wJyApO1xuICBhc3NlcnQoIHRpbWVzdGFtcCwgJ1JlcXVpcmVzIHNwZWNpZnlpbmcgYSB0aW1lc3RhbXAgd2l0aCAtLXRpbWVzdGFtcD17e0JSQU5DSH19JyApO1xuICBjb25zdCBpbmNsdWRlTnBtVXBkYXRlID0gIWdldE9wdGlvbiggJ3NraXBOcG1VcGRhdGUnICk7XG5cbiAgY29uc3QgcmVwb3MgPSBfLnVuaXEoIFtcbiAgICAuLi5nZXRSZXBvTGlzdCggJ2FjdGl2ZS1jb21tb24tc2ltLXJlcG9zJyApLFxuICAgICdhc3NlcnQnLFxuICAgICdicmFuZCcsXG4gICAgJ2pvaXN0JyxcbiAgICAncXVlcnktc3RyaW5nLW1hY2hpbmUnLFxuICAgICdzaGVycGEnLFxuICAgICd1dHRlcmFuY2UtcXVldWUnLFxuICAgICdwaGV0LWNvcmUnLFxuICAgICd0YW5kZW0nLFxuICAgICdheG9uJyxcbiAgICAnZG90JyxcbiAgICAna2l0ZScsXG4gICAgJ3NjZW5lcnknLFxuICAgICdzY2VuZXJ5LXBoZXQnLFxuICAgICdzdW4nLFxuICAgICd0d2l4dCcsXG4gICAgJ3BoZXRjb21tb24nLFxuICAgICdwaGV0LWxpYicsXG4gICAgJ2NoaXBwZXInLFxuICAgICdwZXJlbm5pYWwtYWxpYXMnLFxuICAgICdwaGV0bWFya3MnXG4gIF0gKS5zb3J0KCk7XG5cbiAgZm9yICggY29uc3QgcmVwbyBvZiByZXBvcyApIHtcbiAgICB3aW5zdG9uLmluZm8oIHJlcG8gKTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBzaGEgPSBhd2FpdCBnaXRGcm9tVGltZXN0YW1wKCByZXBvLCAnbWFpbicsIHRpbWVzdGFtcCApO1xuICAgICAgYXdhaXQgZ2l0RmV0Y2hDaGVja291dCggcmVwbywgc2hhICk7XG4gICAgfVxuICAgIGNhdGNoKCBlICkge1xuICAgICAgd2luc3Rvbi5lcnJvciggYHNraXBwaW5nICR7cmVwb306ICR7ZX1gICk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCBpbmNsdWRlTnBtVXBkYXRlICkge1xuICAgIGF3YWl0IG5wbVVwZGF0ZSggJ2NoaXBwZXInICk7XG4gICAgYXdhaXQgbnBtVXBkYXRlKCAncGVyZW5uaWFsLWFsaWFzJyApO1xuICB9XG59ICkoKTsiXSwibmFtZXMiOlsiYXNzZXJ0IiwiXyIsIndpbnN0b24iLCJnZXRSZXBvTGlzdCIsImdpdEZldGNoQ2hlY2tvdXQiLCJnaXRGcm9tVGltZXN0YW1wIiwibnBtVXBkYXRlIiwiZ2V0T3B0aW9uIiwidGltZXN0YW1wIiwiaW5jbHVkZU5wbVVwZGF0ZSIsInJlcG9zIiwidW5pcSIsInNvcnQiLCJyZXBvIiwiaW5mbyIsInNoYSIsImUiLCJlcnJvciJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Ozs7Q0FNQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxPQUFPQSxZQUFZLFNBQVM7QUFDNUIsT0FBT0MsT0FBTyxTQUFTO0FBQ3ZCLE9BQU9DLGFBQWEsVUFBVTtBQUM5QixPQUFPQyxpQkFBaUIsMkJBQTJCO0FBQ25ELE9BQU9DLHNCQUFzQixnQ0FBZ0M7QUFDN0QsT0FBT0Msc0JBQXNCLGdDQUFnQztBQUM3RCxPQUFPQyxlQUFlLHlCQUF5QjtBQUMvQyxPQUFPQyxlQUFlLG1DQUFtQztBQUV2RCxvQkFBQTtJQUNBLE1BQU1DLFlBQVlELFVBQVc7SUFDN0JQLE9BQVFRLFdBQVc7SUFDbkIsTUFBTUMsbUJBQW1CLENBQUNGLFVBQVc7SUFFckMsTUFBTUcsUUFBUVQsRUFBRVUsSUFBSSxDQUFFO1dBQ2pCUixZQUFhO1FBQ2hCO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7S0FDRCxFQUFHUyxJQUFJO0lBRVIsS0FBTSxNQUFNQyxRQUFRSCxNQUFRO1FBQzFCUixRQUFRWSxJQUFJLENBQUVEO1FBRWQsSUFBSTtZQUNGLE1BQU1FLE1BQU0sTUFBTVYsaUJBQWtCUSxNQUFNLFFBQVFMO1lBQ2xELE1BQU1KLGlCQUFrQlMsTUFBTUU7UUFDaEMsRUFDQSxPQUFPQyxHQUFJO1lBQ1RkLFFBQVFlLEtBQUssQ0FBRSxDQUFDLFNBQVMsRUFBRUosS0FBSyxFQUFFLEVBQUVHLEdBQUc7UUFDekM7SUFDRjtJQUVBLElBQUtQLGtCQUFtQjtRQUN0QixNQUFNSCxVQUFXO1FBQ2pCLE1BQU1BLFVBQVc7SUFDbkI7QUFDRiJ9