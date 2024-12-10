// Copyright 2020-2024, University of Colorado Boulder
/**
 * When running unit tests in an iframe, connects to the parent frame to give results.
 * @author Sam Reid (PhET Interactive Simulations)
 */ (function() {
    // By default, QUnit runs tests when load event is triggered on the window. If you’re loading tests asynchronously,
    // you can set this property to false, then call QUnit.start() once everything is loaded.
    // See https://api.qunitjs.com/config/QUnit.config
    QUnit.config.autostart = false;
    QUnit.log((details)=>{
        window.parent !== window && window.parent.postMessage(JSON.stringify({
            type: 'qunit-test',
            main: details.module,
            result: details.result,
            module: details.module,
            name: details.name,
            message: details.message,
            // TODO: consider expected/actual, or don't worry because we'll run finer tests once it fails. (https://github.com/phetsims/aqua/issues/81)
            source: details.source
        }), '*');
    });
    QUnit.on('runEnd', (data)=>{
        window.parent !== window && window.parent.postMessage(JSON.stringify({
            type: 'qunit-done',
            failed: data.testCounts.failed,
            passed: data.testCounts.passed,
            total: data.testCounts.total
        }), '*');
    });
    window.addEventListener('error', (a)=>{
        let message = '';
        let stack = '';
        if (a && a.message) {
            message = a.message;
        }
        if (a && a.error && a.error.stack) {
            stack = a.error.stack;
        }
        window.parent !== window && window.parent.postMessage(JSON.stringify({
            type: 'error',
            message: message,
            stack: stack
        }), '*');
    });
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2Jyb3dzZXIvc2ltLXRlc3RzL3F1bml0LWNvbm5lY3Rvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuXG4vKipcbiAqIFdoZW4gcnVubmluZyB1bml0IHRlc3RzIGluIGFuIGlmcmFtZSwgY29ubmVjdHMgdG8gdGhlIHBhcmVudCBmcmFtZSB0byBnaXZlIHJlc3VsdHMuXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG4oIGZ1bmN0aW9uKCkge1xuXG4gIC8vIEJ5IGRlZmF1bHQsIFFVbml0IHJ1bnMgdGVzdHMgd2hlbiBsb2FkIGV2ZW50IGlzIHRyaWdnZXJlZCBvbiB0aGUgd2luZG93LiBJZiB5b3XigJlyZSBsb2FkaW5nIHRlc3RzIGFzeW5jaHJvbm91c2x5LFxuICAvLyB5b3UgY2FuIHNldCB0aGlzIHByb3BlcnR5IHRvIGZhbHNlLCB0aGVuIGNhbGwgUVVuaXQuc3RhcnQoKSBvbmNlIGV2ZXJ5dGhpbmcgaXMgbG9hZGVkLlxuICAvLyBTZWUgaHR0cHM6Ly9hcGkucXVuaXRqcy5jb20vY29uZmlnL1FVbml0LmNvbmZpZ1xuICBRVW5pdC5jb25maWcuYXV0b3N0YXJ0ID0gZmFsc2U7XG5cbiAgUVVuaXQubG9nKCBkZXRhaWxzID0+IHtcbiAgICAoIHdpbmRvdy5wYXJlbnQgIT09IHdpbmRvdyApICYmIHdpbmRvdy5wYXJlbnQucG9zdE1lc3NhZ2UoIEpTT04uc3RyaW5naWZ5KCB7XG4gICAgICB0eXBlOiAncXVuaXQtdGVzdCcsXG4gICAgICBtYWluOiBkZXRhaWxzLm1vZHVsZSwgLy8gVE9ETzogd2hhdCBpcyB0aGlzIGZvcj8gKGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9hcXVhL2lzc3Vlcy84MSlcbiAgICAgIHJlc3VsdDogZGV0YWlscy5yZXN1bHQsXG4gICAgICBtb2R1bGU6IGRldGFpbHMubW9kdWxlLFxuICAgICAgbmFtZTogZGV0YWlscy5uYW1lLFxuICAgICAgbWVzc2FnZTogZGV0YWlscy5tZXNzYWdlLFxuXG4gICAgICAvLyBUT0RPOiBjb25zaWRlciBleHBlY3RlZC9hY3R1YWwsIG9yIGRvbid0IHdvcnJ5IGJlY2F1c2Ugd2UnbGwgcnVuIGZpbmVyIHRlc3RzIG9uY2UgaXQgZmFpbHMuIChodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXF1YS9pc3N1ZXMvODEpXG4gICAgICBzb3VyY2U6IGRldGFpbHMuc291cmNlXG4gICAgfSApLCAnKicgKTtcbiAgfSApO1xuXG4gIFFVbml0Lm9uKCAncnVuRW5kJywgZGF0YSA9PiB7XG4gICAgKCB3aW5kb3cucGFyZW50ICE9PSB3aW5kb3cgKSAmJiB3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKCBKU09OLnN0cmluZ2lmeSgge1xuICAgICAgdHlwZTogJ3F1bml0LWRvbmUnLFxuICAgICAgZmFpbGVkOiBkYXRhLnRlc3RDb3VudHMuZmFpbGVkLFxuICAgICAgcGFzc2VkOiBkYXRhLnRlc3RDb3VudHMucGFzc2VkLFxuICAgICAgdG90YWw6IGRhdGEudGVzdENvdW50cy50b3RhbFxuICAgIH0gKSwgJyonICk7XG4gIH0gKTtcblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgYSA9PiB7XG4gICAgbGV0IG1lc3NhZ2UgPSAnJztcbiAgICBsZXQgc3RhY2sgPSAnJztcbiAgICBpZiAoIGEgJiYgYS5tZXNzYWdlICkge1xuICAgICAgbWVzc2FnZSA9IGEubWVzc2FnZTtcbiAgICB9XG4gICAgaWYgKCBhICYmIGEuZXJyb3IgJiYgYS5lcnJvci5zdGFjayApIHtcbiAgICAgIHN0YWNrID0gYS5lcnJvci5zdGFjaztcbiAgICB9XG4gICAgKCB3aW5kb3cucGFyZW50ICE9PSB3aW5kb3cgKSAmJiB3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKCBKU09OLnN0cmluZ2lmeSgge1xuICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICBzdGFjazogc3RhY2tcbiAgICB9ICksICcqJyApO1xuICB9ICk7XG59ICkoKTsiXSwibmFtZXMiOlsiUVVuaXQiLCJjb25maWciLCJhdXRvc3RhcnQiLCJsb2ciLCJkZXRhaWxzIiwid2luZG93IiwicGFyZW50IiwicG9zdE1lc3NhZ2UiLCJKU09OIiwic3RyaW5naWZ5IiwidHlwZSIsIm1haW4iLCJtb2R1bGUiLCJyZXN1bHQiLCJuYW1lIiwibWVzc2FnZSIsInNvdXJjZSIsIm9uIiwiZGF0YSIsImZhaWxlZCIsInRlc3RDb3VudHMiLCJwYXNzZWQiLCJ0b3RhbCIsImFkZEV2ZW50TGlzdGVuZXIiLCJhIiwic3RhY2siLCJlcnJvciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBR3REOzs7Q0FHQyxHQUNDLENBQUE7SUFFQSxtSEFBbUg7SUFDbkgseUZBQXlGO0lBQ3pGLGtEQUFrRDtJQUNsREEsTUFBTUMsTUFBTSxDQUFDQyxTQUFTLEdBQUc7SUFFekJGLE1BQU1HLEdBQUcsQ0FBRUMsQ0FBQUE7UUFDUEMsT0FBT0MsTUFBTSxLQUFLRCxVQUFZQSxPQUFPQyxNQUFNLENBQUNDLFdBQVcsQ0FBRUMsS0FBS0MsU0FBUyxDQUFFO1lBQ3pFQyxNQUFNO1lBQ05DLE1BQU1QLFFBQVFRLE1BQU07WUFDcEJDLFFBQVFULFFBQVFTLE1BQU07WUFDdEJELFFBQVFSLFFBQVFRLE1BQU07WUFDdEJFLE1BQU1WLFFBQVFVLElBQUk7WUFDbEJDLFNBQVNYLFFBQVFXLE9BQU87WUFFeEIsMklBQTJJO1lBQzNJQyxRQUFRWixRQUFRWSxNQUFNO1FBQ3hCLElBQUs7SUFDUDtJQUVBaEIsTUFBTWlCLEVBQUUsQ0FBRSxVQUFVQyxDQUFBQTtRQUNoQmIsT0FBT0MsTUFBTSxLQUFLRCxVQUFZQSxPQUFPQyxNQUFNLENBQUNDLFdBQVcsQ0FBRUMsS0FBS0MsU0FBUyxDQUFFO1lBQ3pFQyxNQUFNO1lBQ05TLFFBQVFELEtBQUtFLFVBQVUsQ0FBQ0QsTUFBTTtZQUM5QkUsUUFBUUgsS0FBS0UsVUFBVSxDQUFDQyxNQUFNO1lBQzlCQyxPQUFPSixLQUFLRSxVQUFVLENBQUNFLEtBQUs7UUFDOUIsSUFBSztJQUNQO0lBRUFqQixPQUFPa0IsZ0JBQWdCLENBQUUsU0FBU0MsQ0FBQUE7UUFDaEMsSUFBSVQsVUFBVTtRQUNkLElBQUlVLFFBQVE7UUFDWixJQUFLRCxLQUFLQSxFQUFFVCxPQUFPLEVBQUc7WUFDcEJBLFVBQVVTLEVBQUVULE9BQU87UUFDckI7UUFDQSxJQUFLUyxLQUFLQSxFQUFFRSxLQUFLLElBQUlGLEVBQUVFLEtBQUssQ0FBQ0QsS0FBSyxFQUFHO1lBQ25DQSxRQUFRRCxFQUFFRSxLQUFLLENBQUNELEtBQUs7UUFDdkI7UUFDRXBCLE9BQU9DLE1BQU0sS0FBS0QsVUFBWUEsT0FBT0MsTUFBTSxDQUFDQyxXQUFXLENBQUVDLEtBQUtDLFNBQVMsQ0FBRTtZQUN6RUMsTUFBTTtZQUNOSyxTQUFTQTtZQUNUVSxPQUFPQTtRQUNULElBQUs7SUFDUDtBQUNGLENBQUEifQ==