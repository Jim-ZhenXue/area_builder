// Copyright 2023-2024, University of Colorado Boulder
/**
 * A set of utility functions that are useful for all utterance-queue tests.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
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
import stepTimer from '../../axon/js/stepTimer.js';
// Arbitrary value to let the
const TIMING_BUFFER = 300;
let UtteranceQueueTestUtils = class UtteranceQueueTestUtils {
    /**
   * Helper es6 promise timeout function.
   * @param ms
   */ static timeout(ms) {
        return new Promise((resolve)=>setTimeout(resolve, ms)); // eslint-disable-line phet/bad-sim-text
    }
    /**
   * Workarounds that need to be done before each test to let the Utterance Queue finish an timed operation before
   * the next test. This is not needed when running manually, but I believe will fix problems when running on
   * CT/Puppeteer where resource availablility, running headless, or other factors may cause differences.
   */ static beforeEachTimingWorkarounds() {
        return _async_to_generator(function*() {
            // Give plenty of time for the Announcer to be ready to speak again. For some reason this needs to be a really
            // large number to get tests to pass consistently. I am starting to have a hunch that QUnit tries to run
            // async tests in parallel...
            yield UtteranceQueueTestUtils.timeout(TIMING_BUFFER * 3);
            // From debugging, I am not convinced that setInterval is called consistently while we wait for timeouts. Stepping
            // the timer here improves consistency and gets certain tests passing. Specifically, I want to make sure that
            // timing variables related to waiting for voicingManager to be readyToAnnounce have enough time to reset
            stepTimer.emit(TIMING_BUFFER * 3);
        })();
    }
};
// This is a test utility file and does not need to be in the namespace.
// eslint-disable-next-line phet/default-export-class-should-register-namespace
export default UtteranceQueueTestUtils;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9VdHRlcmFuY2VRdWV1ZVRlc3RVdGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIHNldCBvZiB1dGlsaXR5IGZ1bmN0aW9ucyB0aGF0IGFyZSB1c2VmdWwgZm9yIGFsbCB1dHRlcmFuY2UtcXVldWUgdGVzdHMuXG4gKlxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IHN0ZXBUaW1lciBmcm9tICcuLi8uLi9heG9uL2pzL3N0ZXBUaW1lci5qcyc7XG5cbi8vIEFyYml0cmFyeSB2YWx1ZSB0byBsZXQgdGhlXG5jb25zdCBUSU1JTkdfQlVGRkVSID0gMzAwO1xuXG5jbGFzcyBVdHRlcmFuY2VRdWV1ZVRlc3RVdGlscyB7XG5cbiAgLyoqXG4gICAqIEhlbHBlciBlczYgcHJvbWlzZSB0aW1lb3V0IGZ1bmN0aW9uLlxuICAgKiBAcGFyYW0gbXNcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgdGltZW91dCggbXM6IG51bWJlciApOiBQcm9taXNlPHVua25vd24+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoIHJlc29sdmUgPT4gc2V0VGltZW91dCggcmVzb2x2ZSwgbXMgKSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvYmFkLXNpbS10ZXh0XG4gIH1cblxuICAvKipcbiAgICogV29ya2Fyb3VuZHMgdGhhdCBuZWVkIHRvIGJlIGRvbmUgYmVmb3JlIGVhY2ggdGVzdCB0byBsZXQgdGhlIFV0dGVyYW5jZSBRdWV1ZSBmaW5pc2ggYW4gdGltZWQgb3BlcmF0aW9uIGJlZm9yZVxuICAgKiB0aGUgbmV4dCB0ZXN0LiBUaGlzIGlzIG5vdCBuZWVkZWQgd2hlbiBydW5uaW5nIG1hbnVhbGx5LCBidXQgSSBiZWxpZXZlIHdpbGwgZml4IHByb2JsZW1zIHdoZW4gcnVubmluZyBvblxuICAgKiBDVC9QdXBwZXRlZXIgd2hlcmUgcmVzb3VyY2UgYXZhaWxhYmxpbGl0eSwgcnVubmluZyBoZWFkbGVzcywgb3Igb3RoZXIgZmFjdG9ycyBtYXkgY2F1c2UgZGlmZmVyZW5jZXMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGFzeW5jIGJlZm9yZUVhY2hUaW1pbmdXb3JrYXJvdW5kcygpOiBQcm9taXNlPHZvaWQ+IHtcblxuICAgIC8vIEdpdmUgcGxlbnR5IG9mIHRpbWUgZm9yIHRoZSBBbm5vdW5jZXIgdG8gYmUgcmVhZHkgdG8gc3BlYWsgYWdhaW4uIEZvciBzb21lIHJlYXNvbiB0aGlzIG5lZWRzIHRvIGJlIGEgcmVhbGx5XG4gICAgLy8gbGFyZ2UgbnVtYmVyIHRvIGdldCB0ZXN0cyB0byBwYXNzIGNvbnNpc3RlbnRseS4gSSBhbSBzdGFydGluZyB0byBoYXZlIGEgaHVuY2ggdGhhdCBRVW5pdCB0cmllcyB0byBydW5cbiAgICAvLyBhc3luYyB0ZXN0cyBpbiBwYXJhbGxlbC4uLlxuICAgIGF3YWl0IFV0dGVyYW5jZVF1ZXVlVGVzdFV0aWxzLnRpbWVvdXQoIFRJTUlOR19CVUZGRVIgKiAzICk7XG5cbiAgICAvLyBGcm9tIGRlYnVnZ2luZywgSSBhbSBub3QgY29udmluY2VkIHRoYXQgc2V0SW50ZXJ2YWwgaXMgY2FsbGVkIGNvbnNpc3RlbnRseSB3aGlsZSB3ZSB3YWl0IGZvciB0aW1lb3V0cy4gU3RlcHBpbmdcbiAgICAvLyB0aGUgdGltZXIgaGVyZSBpbXByb3ZlcyBjb25zaXN0ZW5jeSBhbmQgZ2V0cyBjZXJ0YWluIHRlc3RzIHBhc3NpbmcuIFNwZWNpZmljYWxseSwgSSB3YW50IHRvIG1ha2Ugc3VyZSB0aGF0XG4gICAgLy8gdGltaW5nIHZhcmlhYmxlcyByZWxhdGVkIHRvIHdhaXRpbmcgZm9yIHZvaWNpbmdNYW5hZ2VyIHRvIGJlIHJlYWR5VG9Bbm5vdW5jZSBoYXZlIGVub3VnaCB0aW1lIHRvIHJlc2V0XG4gICAgc3RlcFRpbWVyLmVtaXQoIFRJTUlOR19CVUZGRVIgKiAzICk7XG4gIH1cbn1cblxuLy8gVGhpcyBpcyBhIHRlc3QgdXRpbGl0eSBmaWxlIGFuZCBkb2VzIG5vdCBuZWVkIHRvIGJlIGluIHRoZSBuYW1lc3BhY2UuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcGhldC9kZWZhdWx0LWV4cG9ydC1jbGFzcy1zaG91bGQtcmVnaXN0ZXItbmFtZXNwYWNlXG5leHBvcnQgZGVmYXVsdCBVdHRlcmFuY2VRdWV1ZVRlc3RVdGlsczsiXSwibmFtZXMiOlsic3RlcFRpbWVyIiwiVElNSU5HX0JVRkZFUiIsIlV0dGVyYW5jZVF1ZXVlVGVzdFV0aWxzIiwidGltZW91dCIsIm1zIiwiUHJvbWlzZSIsInJlc29sdmUiLCJzZXRUaW1lb3V0IiwiYmVmb3JlRWFjaFRpbWluZ1dvcmthcm91bmRzIiwiZW1pdCJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsT0FBT0EsZUFBZSw2QkFBNkI7QUFFbkQsNkJBQTZCO0FBQzdCLE1BQU1DLGdCQUFnQjtBQUV0QixJQUFBLEFBQU1DLDBCQUFOLE1BQU1BO0lBRUo7OztHQUdDLEdBQ0QsT0FBY0MsUUFBU0MsRUFBVSxFQUFxQjtRQUNwRCxPQUFPLElBQUlDLFFBQVNDLENBQUFBLFVBQVdDLFdBQVlELFNBQVNGLE1BQVEsd0NBQXdDO0lBQ3RHO0lBRUE7Ozs7R0FJQyxHQUNELE9BQW9CSTtlQUFwQixvQkFBQTtZQUVFLDhHQUE4RztZQUM5Ryx3R0FBd0c7WUFDeEcsNkJBQTZCO1lBQzdCLE1BQU1OLHdCQUF3QkMsT0FBTyxDQUFFRixnQkFBZ0I7WUFFdkQsa0hBQWtIO1lBQ2xILDZHQUE2RztZQUM3Ryx5R0FBeUc7WUFDekdELFVBQVVTLElBQUksQ0FBRVIsZ0JBQWdCO1FBQ2xDOztBQUNGO0FBRUEsd0VBQXdFO0FBQ3hFLCtFQUErRTtBQUMvRSxlQUFlQyx3QkFBd0IifQ==