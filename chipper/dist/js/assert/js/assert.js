// Copyright 2013-2024, University of Colorado Boulder
/*
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ (function() {
    window.assertions = window.assertions || {};
    // {Array.<function():>} - list of callbacks called when an assertion is triggered, before throwing the error.
    window.assertions.assertionHooks = [];
    window.assertions.assertFunction = window.assertions.assertFunction || function(predicate, ...messages) {
        if (!predicate) {
            // don't treat falsy as a message.
            messages = messages.filter((message)=>!!messages);
            // Log the stack trace to IE.  Just creating an Error is not enough, it has to be caught to get a stack.
            if (window.navigator && window.navigator.appName === 'Microsoft Internet Explorer') {
                messages.push(`stack=\n${new Error().stack}`);
            }
            // Add "Assertion Failed" to the front of the message list
            const assertPrefix = messages.length > 0 ? 'Assertion failed: ' : 'Assertion failed';
            console && console.error && console.error(assertPrefix, ...messages);
            window.assertions.assertionHooks.forEach((hook)=>hook());
            if (window.QueryStringMachine && QueryStringMachine.containsKey('debugger')) {
                debugger; // eslint-disable-line no-debugger
            }
            // Check if Error.stackTraceLimit exists and is writable
            const descriptor = Object.getOwnPropertyDescriptor(Error, 'stackTraceLimit');
            const stackTraceWritable = descriptor && (descriptor.writable || descriptor.set && typeof descriptor.set === 'function');
            if (stackTraceWritable) {
                // @ts-ignore
                Error.stackTraceLimit = 20;
            }
            const error = new Error(assertPrefix + messages.join('\n '));
            if (QueryStringMachine.containsKey('eacontinue')) {
                console.log(error.stack);
            } else {
                throw error;
            }
        }
    };
    window.assert = window.assert || null;
    window.assertSlow = window.assertSlow || null;
    window.assertions.enableAssert = function() {
        window.assert = window.assertions.assertFunction;
        window.console && window.console.log && window.console.log('enabling assert');
    };
    window.assertions.disableAssert = function() {
        window.assert = null;
        window.console && window.console.log && window.console.log('disabling assert');
    };
    window.assertions.enableAssertSlow = function() {
        window.assertSlow = window.assertions.assertFunction;
        window.console && window.console.log && window.console.log('enabling assertSlow');
    };
    window.assertions.disableAssertSlow = function() {
        window.assertSlow = null;
        window.console && window.console.log && window.console.log('disabling assertSlow');
    };
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Fzc2VydC9qcy9hc3NlcnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuKCBmdW5jdGlvbigpIHtcblxuICB3aW5kb3cuYXNzZXJ0aW9ucyA9IHdpbmRvdy5hc3NlcnRpb25zIHx8IHt9O1xuXG4gIC8vIHtBcnJheS48ZnVuY3Rpb24oKTo+fSAtIGxpc3Qgb2YgY2FsbGJhY2tzIGNhbGxlZCB3aGVuIGFuIGFzc2VydGlvbiBpcyB0cmlnZ2VyZWQsIGJlZm9yZSB0aHJvd2luZyB0aGUgZXJyb3IuXG4gIHdpbmRvdy5hc3NlcnRpb25zLmFzc2VydGlvbkhvb2tzID0gW107XG5cbiAgd2luZG93LmFzc2VydGlvbnMuYXNzZXJ0RnVuY3Rpb24gPSB3aW5kb3cuYXNzZXJ0aW9ucy5hc3NlcnRGdW5jdGlvbiB8fCBmdW5jdGlvbiggcHJlZGljYXRlLCAuLi5tZXNzYWdlcyApIHtcbiAgICBpZiAoICFwcmVkaWNhdGUgKSB7XG5cbiAgICAgIC8vIGRvbid0IHRyZWF0IGZhbHN5IGFzIGEgbWVzc2FnZS5cbiAgICAgIG1lc3NhZ2VzID0gbWVzc2FnZXMuZmlsdGVyKCBtZXNzYWdlID0+ICEhbWVzc2FnZXMgKTtcblxuICAgICAgLy8gTG9nIHRoZSBzdGFjayB0cmFjZSB0byBJRS4gIEp1c3QgY3JlYXRpbmcgYW4gRXJyb3IgaXMgbm90IGVub3VnaCwgaXQgaGFzIHRvIGJlIGNhdWdodCB0byBnZXQgYSBzdGFjay5cbiAgICAgIGlmICggd2luZG93Lm5hdmlnYXRvciAmJiB3aW5kb3cubmF2aWdhdG9yLmFwcE5hbWUgPT09ICdNaWNyb3NvZnQgSW50ZXJuZXQgRXhwbG9yZXInICkge1xuICAgICAgICBtZXNzYWdlcy5wdXNoKCBgc3RhY2s9XFxuJHtuZXcgRXJyb3IoKS5zdGFja31gICk7XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCBcIkFzc2VydGlvbiBGYWlsZWRcIiB0byB0aGUgZnJvbnQgb2YgdGhlIG1lc3NhZ2UgbGlzdFxuICAgICAgY29uc3QgYXNzZXJ0UHJlZml4ID0gbWVzc2FnZXMubGVuZ3RoID4gMCA/ICdBc3NlcnRpb24gZmFpbGVkOiAnIDogJ0Fzc2VydGlvbiBmYWlsZWQnO1xuICAgICAgY29uc29sZSAmJiBjb25zb2xlLmVycm9yICYmIGNvbnNvbGUuZXJyb3IoIGFzc2VydFByZWZpeCwgLi4ubWVzc2FnZXMgKTtcblxuICAgICAgd2luZG93LmFzc2VydGlvbnMuYXNzZXJ0aW9uSG9va3MuZm9yRWFjaCggaG9vayA9PiBob29rKCkgKTtcblxuICAgICAgaWYgKCB3aW5kb3cuUXVlcnlTdHJpbmdNYWNoaW5lICYmIFF1ZXJ5U3RyaW5nTWFjaGluZS5jb250YWluc0tleSggJ2RlYnVnZ2VyJyApICkge1xuICAgICAgICBkZWJ1Z2dlcjsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1kZWJ1Z2dlclxuICAgICAgfVxuXG4gICAgICAvLyBDaGVjayBpZiBFcnJvci5zdGFja1RyYWNlTGltaXQgZXhpc3RzIGFuZCBpcyB3cml0YWJsZVxuICAgICAgY29uc3QgZGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoIEVycm9yLCAnc3RhY2tUcmFjZUxpbWl0JyApO1xuICAgICAgY29uc3Qgc3RhY2tUcmFjZVdyaXRhYmxlID0gZGVzY3JpcHRvciAmJiAoIGRlc2NyaXB0b3Iud3JpdGFibGUgfHwgKCBkZXNjcmlwdG9yLnNldCAmJiB0eXBlb2YgZGVzY3JpcHRvci5zZXQgPT09ICdmdW5jdGlvbicgKSApO1xuXG4gICAgICBpZiAoIHN0YWNrVHJhY2VXcml0YWJsZSApIHtcblxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIEVycm9yLnN0YWNrVHJhY2VMaW1pdCA9IDIwO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvciggYXNzZXJ0UHJlZml4ICsgbWVzc2FnZXMuam9pbiggJ1xcbiAnICkgKTtcbiAgICAgIGlmICggUXVlcnlTdHJpbmdNYWNoaW5lLmNvbnRhaW5zS2V5KCAnZWFjb250aW51ZScgKSApIHtcbiAgICAgICAgY29uc29sZS5sb2coIGVycm9yLnN0YWNrICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHdpbmRvdy5hc3NlcnQgPSB3aW5kb3cuYXNzZXJ0IHx8IG51bGw7XG4gIHdpbmRvdy5hc3NlcnRTbG93ID0gd2luZG93LmFzc2VydFNsb3cgfHwgbnVsbDtcblxuICB3aW5kb3cuYXNzZXJ0aW9ucy5lbmFibGVBc3NlcnQgPSBmdW5jdGlvbigpIHtcbiAgICB3aW5kb3cuYXNzZXJ0ID0gd2luZG93LmFzc2VydGlvbnMuYXNzZXJ0RnVuY3Rpb247XG4gICAgd2luZG93LmNvbnNvbGUgJiYgd2luZG93LmNvbnNvbGUubG9nICYmIHdpbmRvdy5jb25zb2xlLmxvZyggJ2VuYWJsaW5nIGFzc2VydCcgKTtcbiAgfTtcbiAgd2luZG93LmFzc2VydGlvbnMuZGlzYWJsZUFzc2VydCA9IGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5hc3NlcnQgPSBudWxsO1xuICAgIHdpbmRvdy5jb25zb2xlICYmIHdpbmRvdy5jb25zb2xlLmxvZyAmJiB3aW5kb3cuY29uc29sZS5sb2coICdkaXNhYmxpbmcgYXNzZXJ0JyApO1xuICB9O1xuXG4gIHdpbmRvdy5hc3NlcnRpb25zLmVuYWJsZUFzc2VydFNsb3cgPSBmdW5jdGlvbigpIHtcbiAgICB3aW5kb3cuYXNzZXJ0U2xvdyA9IHdpbmRvdy5hc3NlcnRpb25zLmFzc2VydEZ1bmN0aW9uO1xuICAgIHdpbmRvdy5jb25zb2xlICYmIHdpbmRvdy5jb25zb2xlLmxvZyAmJiB3aW5kb3cuY29uc29sZS5sb2coICdlbmFibGluZyBhc3NlcnRTbG93JyApO1xuICB9O1xuICB3aW5kb3cuYXNzZXJ0aW9ucy5kaXNhYmxlQXNzZXJ0U2xvdyA9IGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5hc3NlcnRTbG93ID0gbnVsbDtcbiAgICB3aW5kb3cuY29uc29sZSAmJiB3aW5kb3cuY29uc29sZS5sb2cgJiYgd2luZG93LmNvbnNvbGUubG9nKCAnZGlzYWJsaW5nIGFzc2VydFNsb3cnICk7XG4gIH07XG59ICkoKTsiXSwibmFtZXMiOlsid2luZG93IiwiYXNzZXJ0aW9ucyIsImFzc2VydGlvbkhvb2tzIiwiYXNzZXJ0RnVuY3Rpb24iLCJwcmVkaWNhdGUiLCJtZXNzYWdlcyIsImZpbHRlciIsIm1lc3NhZ2UiLCJuYXZpZ2F0b3IiLCJhcHBOYW1lIiwicHVzaCIsIkVycm9yIiwic3RhY2siLCJhc3NlcnRQcmVmaXgiLCJsZW5ndGgiLCJjb25zb2xlIiwiZXJyb3IiLCJmb3JFYWNoIiwiaG9vayIsIlF1ZXJ5U3RyaW5nTWFjaGluZSIsImNvbnRhaW5zS2V5IiwiZGVzY3JpcHRvciIsIk9iamVjdCIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsInN0YWNrVHJhY2VXcml0YWJsZSIsIndyaXRhYmxlIiwic2V0Iiwic3RhY2tUcmFjZUxpbWl0Iiwiam9pbiIsImxvZyIsImFzc2VydCIsImFzc2VydFNsb3ciLCJlbmFibGVBc3NlcnQiLCJkaXNhYmxlQXNzZXJ0IiwiZW5hYmxlQXNzZXJ0U2xvdyIsImRpc2FibGVBc3NlcnRTbG93Il0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7O0NBRUMsR0FFQyxDQUFBO0lBRUFBLE9BQU9DLFVBQVUsR0FBR0QsT0FBT0MsVUFBVSxJQUFJLENBQUM7SUFFMUMsOEdBQThHO0lBQzlHRCxPQUFPQyxVQUFVLENBQUNDLGNBQWMsR0FBRyxFQUFFO0lBRXJDRixPQUFPQyxVQUFVLENBQUNFLGNBQWMsR0FBR0gsT0FBT0MsVUFBVSxDQUFDRSxjQUFjLElBQUksU0FBVUMsU0FBUyxFQUFFLEdBQUdD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