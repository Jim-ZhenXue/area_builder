// Copyright 2024, University of Colorado Boulder
/**
 * Default command which runs lint-all, report-media, clean, and build.
 *
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
import getOption from '../../../../perennial-alias/js/grunt/tasks/util/getOption.js';
import testGruntOptions from '../../../../perennial-alias/js/grunt/tasks/util/testGruntOptions.js';
_async_to_generator(function*() {
    if (getOption('test-options')) {
        testGruntOptions();
        process.exit(0);
    }
    if (getOption('lint') !== false) {
        console.log('\nRunning "lint-all"');
        yield (yield import('./lint-all.js')).lintAllPromise;
    }
    if (getOption('report-media') !== false) {
        console.log('\nRunning "report-media"');
        yield (yield import('./report-media.js')).reportMediaPromise;
    }
    console.log('\nRunning "clean"');
    yield (yield import('./clean.js')).cleanPromise;
    console.log('\nRunning "build"');
    yield (yield import('./build.js')).buildPromise;
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3Rhc2tzL2RlZmF1bHQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERlZmF1bHQgY29tbWFuZCB3aGljaCBydW5zIGxpbnQtYWxsLCByZXBvcnQtbWVkaWEsIGNsZWFuLCBhbmQgYnVpbGQuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgZ2V0T3B0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy91dGlsL2dldE9wdGlvbi5qcyc7XG5pbXBvcnQgdGVzdEdydW50T3B0aW9ucyBmcm9tICcuLi8uLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvZ3J1bnQvdGFza3MvdXRpbC90ZXN0R3J1bnRPcHRpb25zLmpzJztcblxuKCBhc3luYyAoKSA9PiB7XG4gIGlmICggZ2V0T3B0aW9uKCAndGVzdC1vcHRpb25zJyApICkge1xuICAgIHRlc3RHcnVudE9wdGlvbnMoKTtcbiAgICBwcm9jZXNzLmV4aXQoIDAgKTtcbiAgfVxuXG4gIGlmICggZ2V0T3B0aW9uKCAnbGludCcgKSAhPT0gZmFsc2UgKSB7XG4gICAgY29uc29sZS5sb2coICdcXG5SdW5uaW5nIFwibGludC1hbGxcIicgKTtcbiAgICBhd2FpdCAoIGF3YWl0IGltcG9ydCggJy4vbGludC1hbGwuanMnICkgKS5saW50QWxsUHJvbWlzZTtcbiAgfVxuXG4gIGlmICggZ2V0T3B0aW9uKCAncmVwb3J0LW1lZGlhJyApICE9PSBmYWxzZSApIHtcbiAgICBjb25zb2xlLmxvZyggJ1xcblJ1bm5pbmcgXCJyZXBvcnQtbWVkaWFcIicgKTtcbiAgICBhd2FpdCAoIGF3YWl0IGltcG9ydCggJy4vcmVwb3J0LW1lZGlhLmpzJyApICkucmVwb3J0TWVkaWFQcm9taXNlO1xuICB9XG5cbiAgY29uc29sZS5sb2coICdcXG5SdW5uaW5nIFwiY2xlYW5cIicgKTtcbiAgYXdhaXQgKCBhd2FpdCBpbXBvcnQoICcuL2NsZWFuLmpzJyApICkuY2xlYW5Qcm9taXNlO1xuXG4gIGNvbnNvbGUubG9nKCAnXFxuUnVubmluZyBcImJ1aWxkXCInICk7XG4gIGF3YWl0ICggYXdhaXQgaW1wb3J0KCAnLi9idWlsZC5qcycgKSApLmJ1aWxkUHJvbWlzZTtcbn0gKSgpOyJdLCJuYW1lcyI6WyJnZXRPcHRpb24iLCJ0ZXN0R3J1bnRPcHRpb25zIiwicHJvY2VzcyIsImV4aXQiLCJjb25zb2xlIiwibG9nIiwibGludEFsbFByb21pc2UiLCJyZXBvcnRNZWRpYVByb21pc2UiLCJjbGVhblByb21pc2UiLCJidWlsZFByb21pc2UiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE9BQU9BLGVBQWUsK0RBQStEO0FBQ3JGLE9BQU9DLHNCQUFzQixzRUFBc0U7QUFFakcsb0JBQUE7SUFDQSxJQUFLRCxVQUFXLGlCQUFtQjtRQUNqQ0M7UUFDQUMsUUFBUUMsSUFBSSxDQUFFO0lBQ2hCO0lBRUEsSUFBS0gsVUFBVyxZQUFhLE9BQVE7UUFDbkNJLFFBQVFDLEdBQUcsQ0FBRTtRQUNiLE1BQU0sQUFBRSxDQUFBLE1BQU0sTUFBTSxDQUFFLGdCQUFnQixFQUFJQyxjQUFjO0lBQzFEO0lBRUEsSUFBS04sVUFBVyxvQkFBcUIsT0FBUTtRQUMzQ0ksUUFBUUMsR0FBRyxDQUFFO1FBQ2IsTUFBTSxBQUFFLENBQUEsTUFBTSxNQUFNLENBQUUsb0JBQW9CLEVBQUlFLGtCQUFrQjtJQUNsRTtJQUVBSCxRQUFRQyxHQUFHLENBQUU7SUFDYixNQUFNLEFBQUUsQ0FBQSxNQUFNLE1BQU0sQ0FBRSxhQUFhLEVBQUlHLFlBQVk7SUFFbkRKLFFBQVFDLEdBQUcsQ0FBRTtJQUNiLE1BQU0sQUFBRSxDQUFBLE1BQU0sTUFBTSxDQUFFLGFBQWEsRUFBSUksWUFBWTtBQUNyRCJ9