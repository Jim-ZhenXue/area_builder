// Copyright 2019-2020, University of Colorado Boulder
/**
 * Launch an instance of the simulation using puppeteer, gather the cheerpj resources for optimization.
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
const puppeteer = require('puppeteer');
/* global window */ module.exports = /*#__PURE__*/ _async_to_generator(function*(url) {
    let runtimeResources = null;
    return new Promise(/*#__PURE__*/ _async_to_generator(function*(resolve, reject) {
        let receivedResources = false;
        const browser = yield puppeteer.launch();
        const page = yield browser.newPage();
        page.on('console', /*#__PURE__*/ _async_to_generator(function*(msg) {
            if (msg.text().indexOf('Simulation started...') >= 0) {
                receivedResources = true;
                runtimeResources = yield page.evaluate(()=>window.cjGetRuntimeResources());
                yield resolved(runtimeResources);
            } else if (msg.type() === 'error') {
                const location = msg.location ? `:\n  ${msg.location().url}` : '';
                const message = msg.text() + location;
                console.error('Error from sim:', message);
            }
        }));
        const resolved = /*#__PURE__*/ _async_to_generator(function*(runtimeResources) {
            if (receivedResources) {
                yield browser.close();
                resolve(runtimeResources);
            }
        });
        page.on('error', (msg)=>reject(msg));
        page.on('pageerror', (msg)=>reject(msg));
        try {
            yield page.goto(url);
        } catch (e) {
            reject(e);
        }
    }));
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC9kZWNhZi9nZXRQcmVsb2Fkcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBMYXVuY2ggYW4gaW5zdGFuY2Ugb2YgdGhlIHNpbXVsYXRpb24gdXNpbmcgcHVwcGV0ZWVyLCBnYXRoZXIgdGhlIGNoZWVycGogcmVzb3VyY2VzIGZvciBvcHRpbWl6YXRpb24uXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmNvbnN0IHB1cHBldGVlciA9IHJlcXVpcmUoICdwdXBwZXRlZXInICk7XG5cbi8qIGdsb2JhbCB3aW5kb3cgKi9cbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgdXJsID0+IHtcblxuICBsZXQgcnVudGltZVJlc291cmNlcyA9IG51bGw7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKCBhc3luYyAoIHJlc29sdmUsIHJlamVjdCApID0+IHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1hc3luYy1wcm9taXNlLWV4ZWN1dG9yXG5cbiAgICBsZXQgcmVjZWl2ZWRSZXNvdXJjZXMgPSBmYWxzZTtcblxuICAgIGNvbnN0IGJyb3dzZXIgPSBhd2FpdCBwdXBwZXRlZXIubGF1bmNoKCk7XG4gICAgY29uc3QgcGFnZSA9IGF3YWl0IGJyb3dzZXIubmV3UGFnZSgpO1xuXG4gICAgcGFnZS5vbiggJ2NvbnNvbGUnLCBhc3luYyBtc2cgPT4ge1xuICAgICAgaWYgKCBtc2cudGV4dCgpLmluZGV4T2YoICdTaW11bGF0aW9uIHN0YXJ0ZWQuLi4nICkgPj0gMCApIHtcbiAgICAgICAgcmVjZWl2ZWRSZXNvdXJjZXMgPSB0cnVlO1xuXG4gICAgICAgIHJ1bnRpbWVSZXNvdXJjZXMgPSBhd2FpdCBwYWdlLmV2YWx1YXRlKCAoKSA9PiB3aW5kb3cuY2pHZXRSdW50aW1lUmVzb3VyY2VzKCkgKTtcblxuICAgICAgICBhd2FpdCByZXNvbHZlZCggcnVudGltZVJlc291cmNlcyApO1xuICAgICAgfVxuXG4gICAgICBlbHNlIGlmICggbXNnLnR5cGUoKSA9PT0gJ2Vycm9yJyApIHtcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSBtc2cubG9jYXRpb24gPyBgOlxcbiAgJHttc2cubG9jYXRpb24oKS51cmx9YCA6ICcnO1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gbXNnLnRleHQoKSArIGxvY2F0aW9uO1xuICAgICAgICBjb25zb2xlLmVycm9yKCAnRXJyb3IgZnJvbSBzaW06JywgbWVzc2FnZSApO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIGNvbnN0IHJlc29sdmVkID0gYXN5bmMgcnVudGltZVJlc291cmNlcyA9PiB7XG4gICAgICBpZiAoIHJlY2VpdmVkUmVzb3VyY2VzICkge1xuICAgICAgICBhd2FpdCBicm93c2VyLmNsb3NlKCk7XG4gICAgICAgIHJlc29sdmUoIHJ1bnRpbWVSZXNvdXJjZXMgKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcGFnZS5vbiggJ2Vycm9yJywgbXNnID0+IHJlamVjdCggbXNnICkgKTtcbiAgICBwYWdlLm9uKCAncGFnZWVycm9yJywgbXNnID0+IHJlamVjdCggbXNnICkgKTtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBwYWdlLmdvdG8oIHVybCApO1xuICAgIH1cbiAgICBjYXRjaCggZSApIHtcbiAgICAgIHJlamVjdCggZSApO1xuICAgIH1cbiAgfSApO1xufTsiXSwibmFtZXMiOlsicHVwcGV0ZWVyIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJ1cmwiLCJydW50aW1lUmVzb3VyY2VzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJyZWNlaXZlZFJlc291cmNlcyIsImJyb3dzZXIiLCJsYXVuY2giLCJwYWdlIiwibmV3UGFnZSIsIm9uIiwibXNnIiwidGV4dCIsImluZGV4T2YiLCJldmFsdWF0ZSIsIndpbmRvdyIsImNqR2V0UnVudGltZVJlc291cmNlcyIsInJlc29sdmVkIiwidHlwZSIsImxvY2F0aW9uIiwibWVzc2FnZSIsImNvbnNvbGUiLCJlcnJvciIsImNsb3NlIiwiZ290byIsImUiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7O0NBR0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsWUFBWUMsUUFBUztBQUUzQixpQkFBaUIsR0FDakJDLE9BQU9DLE9BQU8scUNBQUcsVUFBTUM7SUFFckIsSUFBSUMsbUJBQW1CO0lBRXZCLE9BQU8sSUFBSUMsMENBQVMsVUFBUUMsU0FBU0M7UUFFbkMsSUFBSUMsb0JBQW9CO1FBRXhCLE1BQU1DLFVBQVUsTUFBTVYsVUFBVVcsTUFBTTtRQUN0QyxNQUFNQyxPQUFPLE1BQU1GLFFBQVFHLE9BQU87UUFFbENELEtBQUtFLEVBQUUsQ0FBRSw2Q0FBVyxVQUFNQztZQUN4QixJQUFLQSxJQUFJQyxJQUFJLEdBQUdDLE9BQU8sQ0FBRSw0QkFBNkIsR0FBSTtnQkFDeERSLG9CQUFvQjtnQkFFcEJKLG1CQUFtQixNQUFNTyxLQUFLTSxRQUFRLENBQUUsSUFBTUMsT0FBT0MscUJBQXFCO2dCQUUxRSxNQUFNQyxTQUFVaEI7WUFDbEIsT0FFSyxJQUFLVSxJQUFJTyxJQUFJLE9BQU8sU0FBVTtnQkFDakMsTUFBTUMsV0FBV1IsSUFBSVEsUUFBUSxHQUFHLENBQUMsS0FBSyxFQUFFUixJQUFJUSxRQUFRLEdBQUduQixHQUFHLEVBQUUsR0FBRztnQkFDL0QsTUFBTW9CLFVBQVVULElBQUlDLElBQUksS0FBS087Z0JBQzdCRSxRQUFRQyxLQUFLLENBQUUsbUJBQW1CRjtZQUNwQztRQUNGO1FBRUEsTUFBTUgsNkNBQVcsVUFBTWhCO1lBQ3JCLElBQUtJLG1CQUFvQjtnQkFDdkIsTUFBTUMsUUFBUWlCLEtBQUs7Z0JBQ25CcEIsUUFBU0Y7WUFDWDtRQUNGO1FBRUFPLEtBQUtFLEVBQUUsQ0FBRSxTQUFTQyxDQUFBQSxNQUFPUCxPQUFRTztRQUNqQ0gsS0FBS0UsRUFBRSxDQUFFLGFBQWFDLENBQUFBLE1BQU9QLE9BQVFPO1FBRXJDLElBQUk7WUFDRixNQUFNSCxLQUFLZ0IsSUFBSSxDQUFFeEI7UUFDbkIsRUFDQSxPQUFPeUIsR0FBSTtZQUNUckIsT0FBUXFCO1FBQ1Y7SUFDRjtBQUNGIn0=