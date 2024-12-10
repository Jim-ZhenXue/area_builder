// Copyright 2022-2024, University of Colorado Boulder
/**
 * Reports a (delayed) page load (or error) to the parent frame for Aqua continuous testing.
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ (function() {
    let hasErrored = false;
    window.addEventListener('error', (data)=>{
        if (!hasErrored) {
            hasErrored = true;
            let message = '';
            let stack = '';
            if (data && data.message) {
                message = data.message;
            }
            if (data && data.error && data.error.stack) {
                stack = data.error.stack;
            }
            window.parent !== window && window.parent.postMessage(JSON.stringify({
                type: 'pageload-error',
                url: window.location.href,
                message: message,
                stack: stack
            }), '*');
            console.log('error');
        }
    });
    window.addEventListener('load', (event)=>{
        // Wait 4 seconds before reporting load, to see if it errors first
        setTimeout(()=>{
            if (!hasErrored) {
                window.parent !== window && window.parent.postMessage(JSON.stringify({
                    type: 'pageload-load',
                    url: window.location.href
                }), '*');
                console.log('load');
            }
        }, 4000);
    }, false);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2Jyb3dzZXIvc2ltLXRlc3RzL3BhZ2Vsb2FkLWNvbm5lY3Rvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBSZXBvcnRzIGEgKGRlbGF5ZWQpIHBhZ2UgbG9hZCAob3IgZXJyb3IpIHRvIHRoZSBwYXJlbnQgZnJhbWUgZm9yIEFxdWEgY29udGludW91cyB0ZXN0aW5nLlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cblxuKCBmdW5jdGlvbigpIHtcblxuICBsZXQgaGFzRXJyb3JlZCA9IGZhbHNlO1xuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnZXJyb3InLCBkYXRhID0+IHtcbiAgICBpZiAoICFoYXNFcnJvcmVkICkge1xuICAgICAgaGFzRXJyb3JlZCA9IHRydWU7XG5cbiAgICAgIGxldCBtZXNzYWdlID0gJyc7XG4gICAgICBsZXQgc3RhY2sgPSAnJztcbiAgICAgIGlmICggZGF0YSAmJiBkYXRhLm1lc3NhZ2UgKSB7XG4gICAgICAgIG1lc3NhZ2UgPSBkYXRhLm1lc3NhZ2U7XG4gICAgICB9XG4gICAgICBpZiAoIGRhdGEgJiYgZGF0YS5lcnJvciAmJiBkYXRhLmVycm9yLnN0YWNrICkge1xuICAgICAgICBzdGFjayA9IGRhdGEuZXJyb3Iuc3RhY2s7XG4gICAgICB9XG4gICAgICAoIHdpbmRvdy5wYXJlbnQgIT09IHdpbmRvdyApICYmIHdpbmRvdy5wYXJlbnQucG9zdE1lc3NhZ2UoIEpTT04uc3RyaW5naWZ5KCB7XG4gICAgICAgIHR5cGU6ICdwYWdlbG9hZC1lcnJvcicsXG4gICAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWYsXG4gICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICAgIHN0YWNrOiBzdGFja1xuICAgICAgfSApLCAnKicgKTtcbiAgICAgIGNvbnNvbGUubG9nKCAnZXJyb3InICk7XG4gICAgfVxuICB9ICk7XG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdsb2FkJywgZXZlbnQgPT4ge1xuICAgIC8vIFdhaXQgNCBzZWNvbmRzIGJlZm9yZSByZXBvcnRpbmcgbG9hZCwgdG8gc2VlIGlmIGl0IGVycm9ycyBmaXJzdFxuICAgICBcbiAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XG4gICAgICBpZiAoICFoYXNFcnJvcmVkICkge1xuICAgICAgICAoIHdpbmRvdy5wYXJlbnQgIT09IHdpbmRvdyApICYmIHdpbmRvdy5wYXJlbnQucG9zdE1lc3NhZ2UoIEpTT04uc3RyaW5naWZ5KCB7XG4gICAgICAgICAgdHlwZTogJ3BhZ2Vsb2FkLWxvYWQnLFxuICAgICAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWZcbiAgICAgICAgfSApLCAnKicgKTtcblxuICAgICAgICBjb25zb2xlLmxvZyggJ2xvYWQnICk7XG4gICAgICB9XG4gICAgfSwgNDAwMCApO1xuICB9LCBmYWxzZSApO1xufSApKCk7Il0sIm5hbWVzIjpbImhhc0Vycm9yZWQiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiZGF0YSIsIm1lc3NhZ2UiLCJzdGFjayIsImVycm9yIiwicGFyZW50IiwicG9zdE1lc3NhZ2UiLCJKU09OIiwic3RyaW5naWZ5IiwidHlwZSIsInVybCIsImxvY2F0aW9uIiwiaHJlZiIsImNvbnNvbGUiLCJsb2ciLCJldmVudCIsInNldFRpbWVvdXQiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7O0NBR0MsR0FHQyxDQUFBO0lBRUEsSUFBSUEsYUFBYTtJQUVqQkMsT0FBT0MsZ0JBQWdCLENBQUUsU0FBU0MsQ0FBQUE7UUFDaEMsSUFBSyxDQUFDSCxZQUFhO1lBQ2pCQSxhQUFhO1lBRWIsSUFBSUksVUFBVTtZQUNkLElBQUlDLFFBQVE7WUFDWixJQUFLRixRQUFRQSxLQUFLQyxPQUFPLEVBQUc7Z0JBQzFCQSxVQUFVRCxLQUFLQyxPQUFPO1lBQ3hCO1lBQ0EsSUFBS0QsUUFBUUEsS0FBS0csS0FBSyxJQUFJSCxLQUFLRyxLQUFLLENBQUNELEtBQUssRUFBRztnQkFDNUNBLFFBQVFGLEtBQUtHLEtBQUssQ0FBQ0QsS0FBSztZQUMxQjtZQUNFSixPQUFPTSxNQUFNLEtBQUtOLFVBQVlBLE9BQU9NLE1BQU0sQ0FBQ0MsV0FBVyxDQUFFQyxLQUFLQyxTQUFTLENBQUU7Z0JBQ3pFQyxNQUFNO2dCQUNOQyxLQUFLWCxPQUFPWSxRQUFRLENBQUNDLElBQUk7Z0JBQ3pCVixTQUFTQTtnQkFDVEMsT0FBT0E7WUFDVCxJQUFLO1lBQ0xVLFFBQVFDLEdBQUcsQ0FBRTtRQUNmO0lBQ0Y7SUFFQWYsT0FBT0MsZ0JBQWdCLENBQUUsUUFBUWUsQ0FBQUE7UUFDL0Isa0VBQWtFO1FBRWxFQyxXQUFZO1lBQ1YsSUFBSyxDQUFDbEIsWUFBYTtnQkFDZkMsT0FBT00sTUFBTSxLQUFLTixVQUFZQSxPQUFPTSxNQUFNLENBQUNDLFdBQVcsQ0FBRUMsS0FBS0MsU0FBUyxDQUFFO29CQUN6RUMsTUFBTTtvQkFDTkMsS0FBS1gsT0FBT1ksUUFBUSxDQUFDQyxJQUFJO2dCQUMzQixJQUFLO2dCQUVMQyxRQUFRQyxHQUFHLENBQUU7WUFDZjtRQUNGLEdBQUc7SUFDTCxHQUFHO0FBQ0wsQ0FBQSJ9