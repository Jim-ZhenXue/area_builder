// Copyright 2016-2024, University of Colorado Boulder
/**
 * Generates the top-level simName-accessibility-view.html file for simulations (or runnables). Lets one
 * see the accessible content by placing the sim in an iframe and running an up to date copy of the parallel
 * DOM next to it.
 *
 * @author Jesse Greenberg
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
import writeFileAndGitAdd from '../../../perennial-alias/js/common/writeFileAndGitAdd.js';
import ChipperConstants from '../common/ChipperConstants.js';
import ChipperStringUtils from '../common/ChipperStringUtils.js';
import getA11yViewHTMLFromTemplate from './getA11yViewHTMLFromTemplate.js';
export default function(repo) {
    return _ref.apply(this, arguments);
}
function _ref() {
    _ref = _async_to_generator(function*(repo) {
        let html = getA11yViewHTMLFromTemplate(repo);
        html = ChipperStringUtils.replaceFirst(html, '{{PHET_REPOSITORY}}', repo);
        // Write to the repository's root directory.
        yield writeFileAndGitAdd(repo, `${repo}${ChipperConstants.A11Y_VIEW_HTML_SUFFIX}`, html);
    });
    return _ref.apply(this, arguments);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L2dlbmVyYXRlQTExeVZpZXdIVE1MLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEdlbmVyYXRlcyB0aGUgdG9wLWxldmVsIHNpbU5hbWUtYWNjZXNzaWJpbGl0eS12aWV3Lmh0bWwgZmlsZSBmb3Igc2ltdWxhdGlvbnMgKG9yIHJ1bm5hYmxlcykuIExldHMgb25lXG4gKiBzZWUgdGhlIGFjY2Vzc2libGUgY29udGVudCBieSBwbGFjaW5nIHRoZSBzaW0gaW4gYW4gaWZyYW1lIGFuZCBydW5uaW5nIGFuIHVwIHRvIGRhdGUgY29weSBvZiB0aGUgcGFyYWxsZWxcbiAqIERPTSBuZXh0IHRvIGl0LlxuICpcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXG4gKi9cblxuaW1wb3J0IHdyaXRlRmlsZUFuZEdpdEFkZCBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvY29tbW9uL3dyaXRlRmlsZUFuZEdpdEFkZC5qcyc7XG5pbXBvcnQgQ2hpcHBlckNvbnN0YW50cyBmcm9tICcuLi9jb21tb24vQ2hpcHBlckNvbnN0YW50cy5qcyc7XG5pbXBvcnQgQ2hpcHBlclN0cmluZ1V0aWxzIGZyb20gJy4uL2NvbW1vbi9DaGlwcGVyU3RyaW5nVXRpbHMuanMnO1xuaW1wb3J0IGdldEExMXlWaWV3SFRNTEZyb21UZW1wbGF0ZSBmcm9tICcuL2dldEExMXlWaWV3SFRNTEZyb21UZW1wbGF0ZS5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uKCByZXBvOiBzdHJpbmcgKTogUHJvbWlzZTx2b2lkPiB7XG5cbiAgbGV0IGh0bWwgPSBnZXRBMTF5Vmlld0hUTUxGcm9tVGVtcGxhdGUoIHJlcG8gKTtcbiAgaHRtbCA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlRmlyc3QoIGh0bWwsICd7e1BIRVRfUkVQT1NJVE9SWX19JywgcmVwbyApO1xuXG4gIC8vIFdyaXRlIHRvIHRoZSByZXBvc2l0b3J5J3Mgcm9vdCBkaXJlY3RvcnkuXG4gIGF3YWl0IHdyaXRlRmlsZUFuZEdpdEFkZCggcmVwbywgYCR7cmVwb30ke0NoaXBwZXJDb25zdGFudHMuQTExWV9WSUVXX0hUTUxfU1VGRklYfWAsIGh0bWwgKTtcbn0iXSwibmFtZXMiOlsid3JpdGVGaWxlQW5kR2l0QWRkIiwiQ2hpcHBlckNvbnN0YW50cyIsIkNoaXBwZXJTdHJpbmdVdGlscyIsImdldEExMXlWaWV3SFRNTEZyb21UZW1wbGF0ZSIsInJlcG8iLCJodG1sIiwicmVwbGFjZUZpcnN0IiwiQTExWV9WSUVXX0hUTUxfU1VGRklYIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE9BQU9BLHdCQUF3QiwyREFBMkQ7QUFDMUYsT0FBT0Msc0JBQXNCLGdDQUFnQztBQUM3RCxPQUFPQyx3QkFBd0Isa0NBQWtDO0FBQ2pFLE9BQU9DLGlDQUFpQyxtQ0FBbUM7QUFFM0Usd0JBQStCQyxJQUFZOzs7O1dBQTVCLG9CQUFBLFVBQWdCQSxJQUFZO1FBRXpDLElBQUlDLE9BQU9GLDRCQUE2QkM7UUFDeENDLE9BQU9ILG1CQUFtQkksWUFBWSxDQUFFRCxNQUFNLHVCQUF1QkQ7UUFFckUsNENBQTRDO1FBQzVDLE1BQU1KLG1CQUFvQkksTUFBTSxHQUFHQSxPQUFPSCxpQkFBaUJNLHFCQUFxQixFQUFFLEVBQUVGO0lBQ3RGIn0=