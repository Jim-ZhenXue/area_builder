// Copyright 2015-2024, University of Colorado Boulder
/**
 * Generates the top-level main HTML file for simulations (or runnables) using phet-brand splash and loading phet-io
 * preloads when brand=phet-io is specified.
 *
 * See https://github.com/phetsims/chipper/issues/63
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
import { readFileSync } from 'fs';
import _ from 'lodash';
import fixEOL from '../../../perennial-alias/js/common/fixEOL.js';
import writeFileAndGitAdd from '../../../perennial-alias/js/common/writeFileAndGitAdd.js';
import grunt from '../../../perennial-alias/js/npm-dependencies/grunt.js';
import ChipperStringUtils from '../common/ChipperStringUtils.js';
import getPreloads from './getPreloads.js';
import getStringRepos from './getStringRepos.js';
export default function(repo, options) {
    return _ref.apply(this, arguments);
}
function _ref() {
    _ref = _async_to_generator(function*(repo, options) {
        const { stylesheets = '', bodystyle = ' style="background-color:black;"', outputFile = `${repo}_en.html`, bodystart = '', addedPreloads = [], stripPreloads = [], mainFile = `../chipper/dist/js/${repo}/js/${repo}-main.js`, forSim = true // is this html used for a sim, or something else like tests.
         } = options || {};
        const packageObject = JSON.parse(readFileSync(`../${repo}/package.json`, 'utf8'));
        const brand = 'phet';
        const splashURL = `../brand/${brand}/images/splash.svg`;
        let html = grunt.file.read('../chipper/templates/sim-development.html'); // the template file
        // Formatting is very specific to the template file. Each preload is placed on separate line,
        // with an indentation that is specific indentation to the template. See chipper#462
        function stringifyArray(arr, indentation) {
            return `[\n${arr.map((string)=>`${indentation}    '${string.replace(/'/g, '\\\'')}'`).join(',\n')}\n${indentation}  ]`;
        }
        function isPreloadExcluded(preload) {
            return preload.includes('google-analytics') || stripPreloads.includes(preload);
        }
        const indentLines = (string)=>{
            return string.split('\n').join('\n    ');
        };
        const preloads = getPreloads(repo, brand, forSim).filter((preload)=>{
            return !isPreloadExcluded(preload);
        }).concat(addedPreloads);
        const phetioPreloads = getPreloads(repo, 'phet-io', forSim).filter((preload)=>{
            return !isPreloadExcluded(preload) && !_.includes(preloads, preload);
        });
        const stringRepos = yield getStringRepos(repo);
        // Replace placeholders in the template.
        html = ChipperStringUtils.replaceAll(html, '{{BODYSTYLE}}', bodystyle);
        html = ChipperStringUtils.replaceAll(html, '{{BODYSTART}}', bodystart);
        html = ChipperStringUtils.replaceAll(html, '{{STYLESHEETS}}', stylesheets);
        html = ChipperStringUtils.replaceAll(html, '{{REPOSITORY}}', repo);
        html = ChipperStringUtils.replaceAll(html, '{{BRAND}}', brand);
        html = ChipperStringUtils.replaceAll(html, '{{SPLASH_URL}}', splashURL);
        html = ChipperStringUtils.replaceAll(html, '{{MAIN_FILE}}', mainFile);
        html = ChipperStringUtils.replaceAll(html, '{{PHET_IO_PRELOADS}}', stringifyArray(phetioPreloads, '  '));
        html = ChipperStringUtils.replaceAll(html, '{{PRELOADS}}', stringifyArray(preloads, ''));
        html = ChipperStringUtils.replaceAll(html, '{{PACKAGE_OBJECT}}', indentLines(JSON.stringify(packageObject, null, 2)));
        html = ChipperStringUtils.replaceAll(html, '{{STRING_REPOS}}', indentLines(JSON.stringify(stringRepos, null, 2)));
        // Use the repository name for the browser window title, because getting the sim's title
        // requires running the string plugin in build mode, which is too heavy-weight for this task.
        // See https://github.com/phetsims/chipper/issues/510
        html = ChipperStringUtils.replaceAll(html, '{{BROWSER_WINDOW_TITLE}}', repo);
        // Write to the repository's root directory.
        yield writeFileAndGitAdd(repo, outputFile, fixEOL(html));
    });
    return _ref.apply(this, arguments);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L2dlbmVyYXRlRGV2ZWxvcG1lbnRIVE1MLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEdlbmVyYXRlcyB0aGUgdG9wLWxldmVsIG1haW4gSFRNTCBmaWxlIGZvciBzaW11bGF0aW9ucyAob3IgcnVubmFibGVzKSB1c2luZyBwaGV0LWJyYW5kIHNwbGFzaCBhbmQgbG9hZGluZyBwaGV0LWlvXG4gKiBwcmVsb2FkcyB3aGVuIGJyYW5kPXBoZXQtaW8gaXMgc3BlY2lmaWVkLlxuICpcbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvNjNcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBmaXhFT0wgZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2NvbW1vbi9maXhFT0wuanMnO1xuaW1wb3J0IHdyaXRlRmlsZUFuZEdpdEFkZCBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvY29tbW9uL3dyaXRlRmlsZUFuZEdpdEFkZC5qcyc7XG5pbXBvcnQgZ3J1bnQgZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL25wbS1kZXBlbmRlbmNpZXMvZ3J1bnQuanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgQ2hpcHBlclN0cmluZ1V0aWxzIGZyb20gJy4uL2NvbW1vbi9DaGlwcGVyU3RyaW5nVXRpbHMuanMnO1xuaW1wb3J0IGdldFByZWxvYWRzIGZyb20gJy4vZ2V0UHJlbG9hZHMuanMnO1xuaW1wb3J0IGdldFN0cmluZ1JlcG9zIGZyb20gJy4vZ2V0U3RyaW5nUmVwb3MuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiggcmVwbzogc3RyaW5nLCBvcHRpb25zPzogSW50ZW50aW9uYWxBbnkgKTogUHJvbWlzZTx2b2lkPiB7XG5cbiAgY29uc3Qge1xuICAgIHN0eWxlc2hlZXRzID0gJycsXG4gICAgYm9keXN0eWxlID0gJyBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6YmxhY2s7XCInLCAvLyBub3RlIHRoZSBwcmVjZWRpbmcgJyAnIHdoaWNoIGlzIGVzc2VudGlhbFxuICAgIG91dHB1dEZpbGUgPSBgJHtyZXBvfV9lbi5odG1sYCxcbiAgICBib2R5c3RhcnQgPSAnJyxcbiAgICBhZGRlZFByZWxvYWRzID0gW10sIC8vIG5vbmUgdG8gYWRkXG4gICAgc3RyaXBQcmVsb2FkcyA9IFtdLCAvLyBub25lIHRvIGFkZFxuICAgIG1haW5GaWxlID0gYC4uL2NoaXBwZXIvZGlzdC9qcy8ke3JlcG99L2pzLyR7cmVwb30tbWFpbi5qc2AsXG4gICAgZm9yU2ltID0gdHJ1ZSAvLyBpcyB0aGlzIGh0bWwgdXNlZCBmb3IgYSBzaW0sIG9yIHNvbWV0aGluZyBlbHNlIGxpa2UgdGVzdHMuXG4gIH0gPSBvcHRpb25zIHx8IHt9O1xuXG4gIGNvbnN0IHBhY2thZ2VPYmplY3QgPSBKU09OLnBhcnNlKCByZWFkRmlsZVN5bmMoIGAuLi8ke3JlcG99L3BhY2thZ2UuanNvbmAsICd1dGY4JyApICk7XG5cbiAgY29uc3QgYnJhbmQgPSAncGhldCc7XG5cbiAgY29uc3Qgc3BsYXNoVVJMID0gYC4uL2JyYW5kLyR7YnJhbmR9L2ltYWdlcy9zcGxhc2guc3ZnYDtcbiAgbGV0IGh0bWwgPSBncnVudC5maWxlLnJlYWQoICcuLi9jaGlwcGVyL3RlbXBsYXRlcy9zaW0tZGV2ZWxvcG1lbnQuaHRtbCcgKTsgLy8gdGhlIHRlbXBsYXRlIGZpbGVcblxuICAvLyBGb3JtYXR0aW5nIGlzIHZlcnkgc3BlY2lmaWMgdG8gdGhlIHRlbXBsYXRlIGZpbGUuIEVhY2ggcHJlbG9hZCBpcyBwbGFjZWQgb24gc2VwYXJhdGUgbGluZSxcbiAgLy8gd2l0aCBhbiBpbmRlbnRhdGlvbiB0aGF0IGlzIHNwZWNpZmljIGluZGVudGF0aW9uIHRvIHRoZSB0ZW1wbGF0ZS4gU2VlIGNoaXBwZXIjNDYyXG4gIGZ1bmN0aW9uIHN0cmluZ2lmeUFycmF5KCBhcnI6IHN0cmluZ1tdLCBpbmRlbnRhdGlvbjogc3RyaW5nICk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBbXFxuJHtcbiAgICAgIGFyci5tYXAoIHN0cmluZyA9PiBgJHtpbmRlbnRhdGlvbn0gICAgJyR7c3RyaW5nLnJlcGxhY2UoIC8nL2csICdcXFxcXFwnJyApfSdgICkuam9pbiggJyxcXG4nIClcbiAgICB9XFxuJHtpbmRlbnRhdGlvbn0gIF1gO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNQcmVsb2FkRXhjbHVkZWQoIHByZWxvYWQ6IHN0cmluZyApOiBib29sZWFuIHtcbiAgICByZXR1cm4gcHJlbG9hZC5pbmNsdWRlcyggJ2dvb2dsZS1hbmFseXRpY3MnICkgfHwgc3RyaXBQcmVsb2Fkcy5pbmNsdWRlcyggcHJlbG9hZCApO1xuICB9XG5cbiAgY29uc3QgaW5kZW50TGluZXMgPSAoIHN0cmluZzogc3RyaW5nICkgPT4ge1xuICAgIHJldHVybiBzdHJpbmcuc3BsaXQoICdcXG4nICkuam9pbiggJ1xcbiAgICAnICk7XG4gIH07XG5cbiAgY29uc3QgcHJlbG9hZHMgPSBnZXRQcmVsb2FkcyggcmVwbywgYnJhbmQsIGZvclNpbSApLmZpbHRlciggcHJlbG9hZCA9PiB7XG4gICAgcmV0dXJuICFpc1ByZWxvYWRFeGNsdWRlZCggcHJlbG9hZCApO1xuICB9ICkuY29uY2F0KCBhZGRlZFByZWxvYWRzICk7XG5cbiAgY29uc3QgcGhldGlvUHJlbG9hZHMgPSBnZXRQcmVsb2FkcyggcmVwbywgJ3BoZXQtaW8nLCBmb3JTaW0gKS5maWx0ZXIoIHByZWxvYWQgPT4ge1xuICAgIHJldHVybiAhaXNQcmVsb2FkRXhjbHVkZWQoIHByZWxvYWQgKSAmJiAhXy5pbmNsdWRlcyggcHJlbG9hZHMsIHByZWxvYWQgKTtcbiAgfSApO1xuXG4gIGNvbnN0IHN0cmluZ1JlcG9zID0gYXdhaXQgZ2V0U3RyaW5nUmVwb3MoIHJlcG8gKTtcblxuICAvLyBSZXBsYWNlIHBsYWNlaG9sZGVycyBpbiB0aGUgdGVtcGxhdGUuXG4gIGh0bWwgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggaHRtbCwgJ3t7Qk9EWVNUWUxFfX0nLCBib2R5c3R5bGUgKTtcbiAgaHRtbCA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBodG1sLCAne3tCT0RZU1RBUlR9fScsIGJvZHlzdGFydCApO1xuICBodG1sID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGh0bWwsICd7e1NUWUxFU0hFRVRTfX0nLCBzdHlsZXNoZWV0cyApO1xuICBodG1sID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGh0bWwsICd7e1JFUE9TSVRPUll9fScsIHJlcG8gKTtcbiAgaHRtbCA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBodG1sLCAne3tCUkFORH19JywgYnJhbmQgKTtcbiAgaHRtbCA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBodG1sLCAne3tTUExBU0hfVVJMfX0nLCBzcGxhc2hVUkwgKTtcbiAgaHRtbCA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBodG1sLCAne3tNQUlOX0ZJTEV9fScsIG1haW5GaWxlICk7XG4gIGh0bWwgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggaHRtbCwgJ3t7UEhFVF9JT19QUkVMT0FEU319Jywgc3RyaW5naWZ5QXJyYXkoIHBoZXRpb1ByZWxvYWRzLCAnICAnICkgKTtcbiAgaHRtbCA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBodG1sLCAne3tQUkVMT0FEU319Jywgc3RyaW5naWZ5QXJyYXkoIHByZWxvYWRzLCAnJyApICk7XG4gIGh0bWwgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggaHRtbCwgJ3t7UEFDS0FHRV9PQkpFQ1R9fScsIGluZGVudExpbmVzKCBKU09OLnN0cmluZ2lmeSggcGFja2FnZU9iamVjdCwgbnVsbCwgMiApICkgKTtcbiAgaHRtbCA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBodG1sLCAne3tTVFJJTkdfUkVQT1N9fScsIGluZGVudExpbmVzKCBKU09OLnN0cmluZ2lmeSggc3RyaW5nUmVwb3MsIG51bGwsIDIgKSApICk7XG5cbiAgLy8gVXNlIHRoZSByZXBvc2l0b3J5IG5hbWUgZm9yIHRoZSBicm93c2VyIHdpbmRvdyB0aXRsZSwgYmVjYXVzZSBnZXR0aW5nIHRoZSBzaW0ncyB0aXRsZVxuICAvLyByZXF1aXJlcyBydW5uaW5nIHRoZSBzdHJpbmcgcGx1Z2luIGluIGJ1aWxkIG1vZGUsIHdoaWNoIGlzIHRvbyBoZWF2eS13ZWlnaHQgZm9yIHRoaXMgdGFzay5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy81MTBcbiAgaHRtbCA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBodG1sLCAne3tCUk9XU0VSX1dJTkRPV19USVRMRX19JywgcmVwbyApO1xuXG4gIC8vIFdyaXRlIHRvIHRoZSByZXBvc2l0b3J5J3Mgcm9vdCBkaXJlY3RvcnkuXG4gIGF3YWl0IHdyaXRlRmlsZUFuZEdpdEFkZCggcmVwbywgb3V0cHV0RmlsZSwgZml4RU9MKCBodG1sICkgKTtcbn0iXSwibmFtZXMiOlsicmVhZEZpbGVTeW5jIiwiXyIsImZpeEVPTCIsIndyaXRlRmlsZUFuZEdpdEFkZCIsImdydW50IiwiQ2hpcHBlclN0cmluZ1V0aWxzIiwiZ2V0UHJlbG9hZHMiLCJnZXRTdHJpbmdSZXBvcyIsInJlcG8iLCJvcHRpb25zIiwic3R5bGVzaGVldHMiLCJib2R5c3R5bGUiLCJvdXRwdXRGaWxlIiwiYm9keXN0YXJ0IiwiYWRkZWRQcmVsb2FkcyIsInN0cmlwUHJlbG9hZHMiLCJtYWluRmlsZSIsImZvclNpbSIsInBhY2thZ2VPYmplY3QiLCJKU09OIiwicGFyc2UiLCJicmFuZCIsInNwbGFzaFVSTCIsImh0bWwiLCJmaWxlIiwicmVhZCIsInN0cmluZ2lmeUFycmF5IiwiYXJyIiwiaW5kZW50YXRpb24iLCJtYXAiLCJzdHJpbmciLCJyZXBsYWNlIiwiam9pbiIsImlzUHJlbG9hZEV4Y2x1ZGVkIiwicHJlbG9hZCIsImluY2x1ZGVzIiwiaW5kZW50TGluZXMiLCJzcGxpdCIsInByZWxvYWRzIiwiZmlsdGVyIiwiY29uY2F0IiwicGhldGlvUHJlbG9hZHMiLCJzdHJpbmdSZXBvcyIsInJlcGxhY2VBbGwiLCJzdHJpbmdpZnkiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7OztDQU9DOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELFNBQVNBLFlBQVksUUFBUSxLQUFLO0FBQ2xDLE9BQU9DLE9BQU8sU0FBUztBQUN2QixPQUFPQyxZQUFZLCtDQUErQztBQUNsRSxPQUFPQyx3QkFBd0IsMkRBQTJEO0FBQzFGLE9BQU9DLFdBQVcsd0RBQXdEO0FBRTFFLE9BQU9DLHdCQUF3QixrQ0FBa0M7QUFDakUsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQUMzQyxPQUFPQyxvQkFBb0Isc0JBQXNCO0FBRWpELHdCQUErQkMsSUFBWSxFQUFFQyxPQUF3Qjs7OztXQUF0RCxvQkFBQSxVQUFnQkQsSUFBWSxFQUFFQyxPQUF3QjtRQUVuRSxNQUFNLEVBQ0pDLGNBQWMsRUFBRSxFQUNoQkMsWUFBWSxrQ0FBa0MsRUFDOUNDLGFBQWEsR0FBR0osS0FBSyxRQUFRLENBQUMsRUFDOUJLLFlBQVksRUFBRSxFQUNkQyxnQkFBZ0IsRUFBRSxFQUNsQkMsZ0JBQWdCLEVBQUUsRUFDbEJDLFdBQVcsQ0FBQyxtQkFBbUIsRUFBRVIsS0FBSyxJQUFJLEVBQUVB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