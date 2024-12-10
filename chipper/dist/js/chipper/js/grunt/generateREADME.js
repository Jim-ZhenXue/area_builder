// Copyright 2015-2024, University of Colorado Boulder
/**
 * This grunt task generates the README.md file for a simulation.
 * Placeholders in a template file are replaced with values specific to the simulation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
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
import { readFileSync } from 'fs';
import fixEOL from '../../../perennial-alias/js/common/fixEOL.js';
import writeFileAndGitAdd from '../../../perennial-alias/js/common/writeFileAndGitAdd.js';
import grunt from '../../../perennial-alias/js/npm-dependencies/grunt.js';
import ChipperStringUtils from '../common/ChipperStringUtils.js';
import getPhetLibs from './getPhetLibs.js';
import getTitleStringKey from './getTitleStringKey.js';
/**
 * @param repo - name of the repository
 * @param published - has the sim been published?
 */ export default function(repo, published) {
    return _ref.apply(this, arguments);
}
function _ref() {
    _ref = _async_to_generator(function*(repo, published) {
        // Read the title from the English strings file.
        const simTitleStringKey = getTitleStringKey(repo);
        const strings = JSON.parse(readFileSync(`../${repo}/${repo}-strings_en.json`, 'utf8'));
        const titleKey = simTitleStringKey.split('/').pop(); // eg. 'EXAMPLE_SIM/example-sim.title' -> 'example-sim.title'
        const title = strings[titleKey].value;
        const phetLibs = getPhetLibs(repo, 'phet');
        phetLibs.sort();
        // Commands for cloning all required repositories
        const cloneCommands = phetLibs.map((phetLib)=>{
            return phetLib === 'perennial-alias' ? 'git clone https://github.com/phetsims/perennial.git perennial-alias' : `git clone https://github.com/phetsims/${phetLib}.git`;
        }).join('\n');
        // Read the template.
        const templateFile = published ? 'README-published.md' : 'README-unpublished.md';
        let readme = grunt.file.read(`../chipper/templates/${templateFile}`);
        // Replace placeholders in the template.
        readme = ChipperStringUtils.replaceAll(readme, '{{REPOSITORY}}', repo);
        readme = ChipperStringUtils.replaceAll(readme, '{{TITLE}}', title);
        readme = ChipperStringUtils.replaceAll(readme, '{{CLONE_COMMANDS}}', cloneCommands);
        // Write to the repository's root directory.
        yield writeFileAndGitAdd(repo, 'README.md', fixEOL(readme));
    });
    return _ref.apply(this, arguments);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L2dlbmVyYXRlUkVBRE1FLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRoaXMgZ3J1bnQgdGFzayBnZW5lcmF0ZXMgdGhlIFJFQURNRS5tZCBmaWxlIGZvciBhIHNpbXVsYXRpb24uXG4gKiBQbGFjZWhvbGRlcnMgaW4gYSB0ZW1wbGF0ZSBmaWxlIGFyZSByZXBsYWNlZCB3aXRoIHZhbHVlcyBzcGVjaWZpYyB0byB0aGUgc2ltdWxhdGlvbi5cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCBmaXhFT0wgZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2NvbW1vbi9maXhFT0wuanMnO1xuaW1wb3J0IHdyaXRlRmlsZUFuZEdpdEFkZCBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvY29tbW9uL3dyaXRlRmlsZUFuZEdpdEFkZC5qcyc7XG5pbXBvcnQgZ3J1bnQgZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL25wbS1kZXBlbmRlbmNpZXMvZ3J1bnQuanMnO1xuaW1wb3J0IENoaXBwZXJTdHJpbmdVdGlscyBmcm9tICcuLi9jb21tb24vQ2hpcHBlclN0cmluZ1V0aWxzLmpzJztcbmltcG9ydCBnZXRQaGV0TGlicyBmcm9tICcuL2dldFBoZXRMaWJzLmpzJztcbmltcG9ydCBnZXRUaXRsZVN0cmluZ0tleSBmcm9tICcuL2dldFRpdGxlU3RyaW5nS2V5LmpzJztcblxuLyoqXG4gKiBAcGFyYW0gcmVwbyAtIG5hbWUgb2YgdGhlIHJlcG9zaXRvcnlcbiAqIEBwYXJhbSBwdWJsaXNoZWQgLSBoYXMgdGhlIHNpbSBiZWVuIHB1Ymxpc2hlZD9cbiAqL1xuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24oIHJlcG86IHN0cmluZywgcHVibGlzaGVkOiBib29sZWFuICk6IFByb21pc2U8dm9pZD4ge1xuXG4gIC8vIFJlYWQgdGhlIHRpdGxlIGZyb20gdGhlIEVuZ2xpc2ggc3RyaW5ncyBmaWxlLlxuICBjb25zdCBzaW1UaXRsZVN0cmluZ0tleSA9IGdldFRpdGxlU3RyaW5nS2V5KCByZXBvICk7XG4gIGNvbnN0IHN0cmluZ3MgPSBKU09OLnBhcnNlKCByZWFkRmlsZVN5bmMoIGAuLi8ke3JlcG99LyR7cmVwb30tc3RyaW5nc19lbi5qc29uYCwgJ3V0ZjgnICkgKTtcbiAgY29uc3QgdGl0bGVLZXkgPSBzaW1UaXRsZVN0cmluZ0tleS5zcGxpdCggJy8nICkucG9wKCkhOyAvLyBlZy4gJ0VYQU1QTEVfU0lNL2V4YW1wbGUtc2ltLnRpdGxlJyAtPiAnZXhhbXBsZS1zaW0udGl0bGUnXG4gIGNvbnN0IHRpdGxlID0gc3RyaW5nc1sgdGl0bGVLZXkgXS52YWx1ZTtcbiAgY29uc3QgcGhldExpYnMgPSBnZXRQaGV0TGlicyggcmVwbywgJ3BoZXQnICk7XG5cbiAgcGhldExpYnMuc29ydCgpO1xuXG4gIC8vIENvbW1hbmRzIGZvciBjbG9uaW5nIGFsbCByZXF1aXJlZCByZXBvc2l0b3JpZXNcbiAgY29uc3QgY2xvbmVDb21tYW5kcyA9IHBoZXRMaWJzLm1hcCggKCBwaGV0TGliOiBzdHJpbmcgKSA9PiB7XG5cbiAgICByZXR1cm4gcGhldExpYiA9PT0gJ3BlcmVubmlhbC1hbGlhcycgP1xuICAgICAgICAgICAnZ2l0IGNsb25lIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9wZXJlbm5pYWwuZ2l0IHBlcmVubmlhbC1hbGlhcycgOlxuICAgICAgICAgICBgZ2l0IGNsb25lIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy8ke3BoZXRMaWJ9LmdpdGA7XG4gIH0gKS5qb2luKCAnXFxuJyApO1xuXG4gIC8vIFJlYWQgdGhlIHRlbXBsYXRlLlxuICBjb25zdCB0ZW1wbGF0ZUZpbGUgPSBwdWJsaXNoZWQgPyAnUkVBRE1FLXB1Ymxpc2hlZC5tZCcgOiAnUkVBRE1FLXVucHVibGlzaGVkLm1kJztcbiAgbGV0IHJlYWRtZSA9IGdydW50LmZpbGUucmVhZCggYC4uL2NoaXBwZXIvdGVtcGxhdGVzLyR7dGVtcGxhdGVGaWxlfWAgKTtcblxuICAvLyBSZXBsYWNlIHBsYWNlaG9sZGVycyBpbiB0aGUgdGVtcGxhdGUuXG4gIHJlYWRtZSA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCByZWFkbWUsICd7e1JFUE9TSVRPUll9fScsIHJlcG8gKTtcbiAgcmVhZG1lID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIHJlYWRtZSwgJ3t7VElUTEV9fScsIHRpdGxlICk7XG4gIHJlYWRtZSA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCByZWFkbWUsICd7e0NMT05FX0NPTU1BTkRTfX0nLCBjbG9uZUNvbW1hbmRzICk7XG5cbiAgLy8gV3JpdGUgdG8gdGhlIHJlcG9zaXRvcnkncyByb290IGRpcmVjdG9yeS5cbiAgYXdhaXQgd3JpdGVGaWxlQW5kR2l0QWRkKCByZXBvLCAnUkVBRE1FLm1kJywgZml4RU9MKCByZWFkbWUgKSApO1xufSJdLCJuYW1lcyI6WyJyZWFkRmlsZVN5bmMiLCJmaXhFT0wiLCJ3cml0ZUZpbGVBbmRHaXRBZGQiLCJncnVudCIsIkNoaXBwZXJTdHJpbmdVdGlscyIsImdldFBoZXRMaWJzIiwiZ2V0VGl0bGVTdHJpbmdLZXkiLCJyZXBvIiwicHVibGlzaGVkIiwic2ltVGl0bGVTdHJpbmdLZXkiLCJzdHJpbmdzIiwiSlNPTiIsInBhcnNlIiwidGl0bGVLZXkiLCJzcGxpdCIsInBvcCIsInRpdGxlIiwidmFsdWUiLCJwaGV0TGlicyIsInNvcnQiLCJjbG9uZUNvbW1hbmRzIiwibWFwIiwicGhldExpYiIsImpvaW4iLCJ0ZW1wbGF0ZUZpbGUiLCJyZWFkbWUiLCJmaWxlIiwicmVhZCIsInJlcGxhY2VBbGwiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxTQUFTQSxZQUFZLFFBQVEsS0FBSztBQUNsQyxPQUFPQyxZQUFZLCtDQUErQztBQUNsRSxPQUFPQyx3QkFBd0IsMkRBQTJEO0FBQzFGLE9BQU9DLFdBQVcsd0RBQXdEO0FBQzFFLE9BQU9DLHdCQUF3QixrQ0FBa0M7QUFDakUsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQUMzQyxPQUFPQyx1QkFBdUIseUJBQXlCO0FBRXZEOzs7Q0FHQyxHQUNELHdCQUErQkMsSUFBWSxFQUFFQyxTQUFrQjs7OztXQUFoRCxvQkFBQSxVQUFnQkQsSUFBWSxFQUFFQyxTQUFrQjtRQUU3RCxnREFBZ0Q7UUFDaEQsTUFBTUMsb0JBQW9CSCxrQkFBbUJDO1FBQzdDLE1BQU1HLFVBQVVDLEtBQUtDLEtBQUssQ0FBRVosYUFBYyxDQUFDLEdBQUcsRUFBRU8sS0FBSyxDQUFDLEVBQUVBLEtBQUssZ0JBQWdCLENBQUMsRUFBRTtRQUNoRixNQUFNTSxXQUFXSixrQkFBa0JLLEtBQUssQ0FBRSxLQUFNQyxHQUFHLElBQUssNkRBQTZEO1FBQ3JILE1BQU1DLFFBQVFOLE9BQU8sQ0FBRUcsU0FBVSxDQUFDSSxLQUFLO1FBQ3ZDLE1BQU1DLFdBQVdiLFlBQWFFLE1BQU07UUFFcENXLFNBQVNDLElBQUk7UUFFYixpREFBaUQ7UUFDakQsTUFBTUMsZ0JBQWdCRixTQUFTRyxHQUFHLENBQUUsQ0FBRUM7WUFFcEMsT0FBT0EsWUFBWSxvQkFDWix3RUFDQSxDQUFDLHNDQUFzQyxFQUFFQSxRQUFRLElBQUksQ0FBQztRQUMvRCxHQUFJQyxJQUFJLENBQUU7UUFFVixxQkFBcUI7UUFDckIsTUFBTUMsZUFBZWhCLFlBQVksd0JBQXdCO1FBQ3pELElBQUlpQixTQUFTdEIsTUFBTXVCLElBQUksQ0FBQ0MsSUFBSSxDQUFFLENBQUMscUJBQXFCLEVBQUVILGNBQWM7UUFFcEUsd0NBQXdDO1FBQ3hDQyxTQUFTckIsbUJBQW1Cd0IsVUFBVSxDQUFFSCxRQUFRLGtCQUFrQmxCO1FBQ2xFa0IsU0FBU3JCLG1CQUFtQndCLFVBQVUsQ0FBRUgsUUFBUSxhQUFhVDtRQUM3RFMsU0FBU3JCLG1CQUFtQndCLFVBQVUsQ0FBRUgsUUFBUSxzQkFBc0JMO1FBRXRFLDRDQUE0QztRQUM1QyxNQUFNbEIsbUJBQW9CSyxNQUFNLGFBQWFOLE9BQVF3QjtJQUN2RCJ9