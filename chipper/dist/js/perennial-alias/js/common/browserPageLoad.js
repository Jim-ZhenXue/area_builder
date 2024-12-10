// Copyright 2017-2022, University of Colorado Boulder
/**
 * Uses a browser to see whether a page loads without an error. Throws errors it receives.
 *
 * Supports multiple supported browsers from puppeteer and playwright. Must provide a browserCreator from either with a
 * `launch()` interface.
 * There are now many more features of this class. It is best to see its functionality by looking at options.
 *
 * To support authentication, we use process.env.BASIC_PASSWORD and process.env.BASIC_USERNAME, set those before calling
 * this function.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
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
const sleep = require('./sleep');
const _ = require('lodash');
const winston = require('winston');
const puppeteer = require('puppeteer');
const assert = require('assert');
/**
 * Uses puppeteer to see whether a page loads without an error
 * @public
 *
 * Rejects if encountering an error loading the page OR (with option provided within the puppeteer page itself).
 *
 * @param {Browser} browserCreator - either `puppeteer` or a specific Browser from playright
 * @param {string} url
 * @param {Object} [options]
 * @returns {Promise.<null|*>} - The eval result/null
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(browserCreator, url, options) {
    return new Promise(/*#__PURE__*/ _async_to_generator(function*(resolve, reject) {
        options = _.merge({
            // See https://github.com/puppeteer/puppeteer/blob/v14.1.1/docs/api.md#puppeteerlaunchoptions
            // Make sure to provide options that work with your browserCreator (playwright or puppeteer)
            launchOptions: {
                args: [
                    '--disable-gpu'
                ]
            },
            browser: null,
            evaluate: null,
            waitForFunction: null,
            rejectPageErrors: true,
            rejectErrors: true,
            // By default, once loaded we resolve, but opt out of this here. If you set to false, you must resolve in custom logic in onPageCreation
            resolveFromLoad: true,
            waitAfterLoad: 5000,
            allowedTimeToLoad: 40000,
            gotoTimeout: 30000,
            // Callback when logic is not complete after timeout of length: allowedTimeToLoad.
            onLoadTimeout: (resolve, reject)=>{
                if (!pageLoaded) {
                    options.logger('puppeteer page not loaded');
                    reject(new Error(`Did not load in ${options.allowedTimeToLoad}`));
                }
            },
            onPageCreation: null,
            evaluateOnNewDocument: null,
            cachePages: true,
            logConsoleOutput: false,
            logNavigation: false,
            logger: winston.info // {function(message)} pass in `console.log` if you are running in a context that doesn't use winston
        }, options);
        !options.resolveFromLoad && assert(options.onPageCreation, 'must resolve from onPageCreation');
        const ownsBrowser = !options.browser;
        let browser;
        let page;
        let pageLoaded = false;
        // Keep track of if we have rejected an error. This makes sure we don't keep calling browser commands while
        // trying to clean up the page/browser and reject(). This is set to true BEFORE the cleanup(), which is async.
        let rejected = false;
        const cleanup = /*#__PURE__*/ _async_to_generator(function*() {
            if (page && !page.isClosed()) {
                try {
                    yield page.close();
                } catch (e) {
                /* puppeteer is bad at closing pages while still doing other stuff */ }
            }
            // If we created a temporary browser, close it
            ownsBrowser && browser && (yield browser.close());
        });
        const localResolve = /*#__PURE__*/ _async_to_generator(function*(result) {
            yield cleanup();
            resolve(result);
        });
        const localReject = /*#__PURE__*/ _async_to_generator(function*(error) {
            const wasRejected = rejected;
            rejected = true; // Before the async cleanup
            yield cleanup();
            !wasRejected && reject(error); // Otherwise, MK experienced  the second call's error getting provided to the Promise.
        });
        try {
            browser = options.browser || (yield browserCreator.launch(options.launchOptions));
            page = yield browser.newPage();
            page.setCacheEnabled && page.setCacheEnabled(options.cachePages);
            yield page.setDefaultNavigationTimeout(options.gotoTimeout);
            // The API for playwright was much more complicated, so just support puppeteer
            const username = process.env.BASIC_USERNAME;
            const password = process.env.BASIC_PASSWORD;
            if (username && password) {
                if (browserCreator === puppeteer) {
                    // puppeteer has its own authentication method, thanks!
                    yield page.authenticate({
                        username: username,
                        password: password
                    });
                } else {
                    // Handle playwright browsers, see https://github.com/phetsims/aqua/issues/188
                    // This is not the best method for puppeteer because it violated CORS policies, for example with console errors like:
                    // [CONSOLE] Access to script at 'https://static.cloudflareinsights.com/beacon.min.js/v84a3a4012de94ce1a686ba8c167c359c1696973893317' from origin 'https:phet-io.colorado.edu' has been blocked by CORS policy: Request header field authorization is not allowed by Access-Control-Allow-Headers in preflight response.
                    // [CONSOLE] Failed to load resource: net::ERR_FAILED:      https://static.cloudflareinsights.com/beacon.min.js/v84a3a4012de94ce1a686ba8c167c359c1696973893317
                    // [CONSOLE] Access to fetch at 'https://phet.colorado.edu/services/metadata/phetio?latest=true&active=true' from origin 'https://phet-io.colorado.edu' has been blocked by CORS policy: Request header field authorization is not allowed by Access-Control-Allow-Headers in preflight response.
                    // [CONSOLE] Failed to load resource: net::ERR_FAILED:      https://phet.colorado.edu/services/metadata/phetio?latest=true&active=true
                    page.setExtraHTTPHeaders({
                        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
                    });
                }
            }
            page.on('response', (response)=>{
                const responseStatus = response.status();
                // 200 and 300 class status are most likely fine here
                if (responseStatus >= 400) {
                    const responseURL = response.url();
                    if (responseURL === url) {
                        options.logger(`[ERROR] Could not load from status: ${responseStatus}`);
                    } else if (responseStatus !== 404) {
                        options.logger(`[ERROR] Could not load dependency from status: ${responseStatus}, url: ${responseURL}`);
                    }
                }
            });
            options.logConsoleOutput && page.on('console', (msg)=>{
                let messageTxt = msg.text();
                // Append the location to messages that would benefit from it.
                if (messageTxt.includes('net:') || messageTxt.includes('Failed to load resource')) {
                    messageTxt += `: \t ${msg.location().url}`;
                }
                options.logger(`[CONSOLE] ${messageTxt}`);
            });
            page.on('error', /*#__PURE__*/ _async_to_generator(function*(message) {
                options.logger(`[ERROR] ${message}`);
                if (options.rejectErrors) {
                    yield localReject(new Error(message));
                }
            }));
            page.on('pageerror', /*#__PURE__*/ _async_to_generator(function*(message) {
                options.logger(`[PAGE ERROR] ${message}`);
                if (options.rejectPageErrors) {
                    yield localReject(new Error(message));
                }
            }));
            if (options.logNavigation) {
                page.on('frameattached', /*#__PURE__*/ _async_to_generator(function*(frame) {
                    options.logger(`[ATTACHED] ${frame.url()}`);
                }));
                page.on('framedetached', /*#__PURE__*/ _async_to_generator(function*(frame) {
                    options.logger(`[DETACHED] ${frame.url()}`);
                }));
                page.on('framenavigated', /*#__PURE__*/ _async_to_generator(function*(frame) {
                    options.logger(`[NAVIGATED] ${frame.url()}`);
                }));
            }
            options.onPageCreation && (yield options.onPageCreation(page, localResolve, localReject));
            if (rejected) {
                return;
            }
            // Support puppeteer (evaluateOnNewDocument) or playwright (addInitScript)
            options.evaluateOnNewDocument && (yield (page.evaluateOnNewDocument || page.addInitScript).call(page, options.evaluateOnNewDocument));
            if (rejected) {
                return;
            }
            // Use timeout so that you can cancel it once we have a result. Node will wait for this if it is a orphaned Promise.
            const timeoutID = setTimeout(()=>{
                options.onLoadTimeout(localResolve, localReject);
            }, options.allowedTimeToLoad);
            options.logger(`[URL] ${url}`);
            // Await both at the same time, because all rejection is hooked up to the `promise`, but that could cause an error
            // during the goto call (not afterward), see https://github.com/phetsims/aqua/issues/197
            yield page.goto(url, {
                timeout: options.gotoTimeout
            });
            if (rejected) {
                return;
            }
            options.logger(`[LOADED] ${url}`);
            pageLoaded = true;
            yield sleep(options.waitAfterLoad);
            if (rejected) {
                return;
            }
            if (options.waitForFunction) {
                yield page.waitForFunction(options.waitForFunction, {
                    polling: 100,
                    timeout: options.gotoTimeout
                });
                if (rejected) {
                    return;
                }
            }
            if (options.resolveFromLoad) {
                let result = null;
                if (options.evaluate && !page.isClosed()) {
                    result = yield page.evaluate(options.evaluate);
                    if (rejected) {
                        return;
                    }
                }
                clearTimeout(timeoutID);
                localResolve(result);
            } else {
                clearTimeout(timeoutID);
            }
        } catch (e) {
            options.logger(`browserPageLoad caught unexpected error: ${e}`);
            yield localReject(e);
        }
    }));
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vYnJvd3NlclBhZ2VMb2FkLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFVzZXMgYSBicm93c2VyIHRvIHNlZSB3aGV0aGVyIGEgcGFnZSBsb2FkcyB3aXRob3V0IGFuIGVycm9yLiBUaHJvd3MgZXJyb3JzIGl0IHJlY2VpdmVzLlxuICpcbiAqIFN1cHBvcnRzIG11bHRpcGxlIHN1cHBvcnRlZCBicm93c2VycyBmcm9tIHB1cHBldGVlciBhbmQgcGxheXdyaWdodC4gTXVzdCBwcm92aWRlIGEgYnJvd3NlckNyZWF0b3IgZnJvbSBlaXRoZXIgd2l0aCBhXG4gKiBgbGF1bmNoKClgIGludGVyZmFjZS5cbiAqIFRoZXJlIGFyZSBub3cgbWFueSBtb3JlIGZlYXR1cmVzIG9mIHRoaXMgY2xhc3MuIEl0IGlzIGJlc3QgdG8gc2VlIGl0cyBmdW5jdGlvbmFsaXR5IGJ5IGxvb2tpbmcgYXQgb3B0aW9ucy5cbiAqXG4gKiBUbyBzdXBwb3J0IGF1dGhlbnRpY2F0aW9uLCB3ZSB1c2UgcHJvY2Vzcy5lbnYuQkFTSUNfUEFTU1dPUkQgYW5kIHByb2Nlc3MuZW52LkJBU0lDX1VTRVJOQU1FLCBzZXQgdGhvc2UgYmVmb3JlIGNhbGxpbmdcbiAqIHRoaXMgZnVuY3Rpb24uXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmNvbnN0IHNsZWVwID0gcmVxdWlyZSggJy4vc2xlZXAnICk7XG5jb25zdCBfID0gcmVxdWlyZSggJ2xvZGFzaCcgKTtcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcbmNvbnN0IHB1cHBldGVlciA9IHJlcXVpcmUoICdwdXBwZXRlZXInICk7XG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCAnYXNzZXJ0JyApO1xuXG4vKipcbiAqIFVzZXMgcHVwcGV0ZWVyIHRvIHNlZSB3aGV0aGVyIGEgcGFnZSBsb2FkcyB3aXRob3V0IGFuIGVycm9yXG4gKiBAcHVibGljXG4gKlxuICogUmVqZWN0cyBpZiBlbmNvdW50ZXJpbmcgYW4gZXJyb3IgbG9hZGluZyB0aGUgcGFnZSBPUiAod2l0aCBvcHRpb24gcHJvdmlkZWQgd2l0aGluIHRoZSBwdXBwZXRlZXIgcGFnZSBpdHNlbGYpLlxuICpcbiAqIEBwYXJhbSB7QnJvd3Nlcn0gYnJvd3NlckNyZWF0b3IgLSBlaXRoZXIgYHB1cHBldGVlcmAgb3IgYSBzcGVjaWZpYyBCcm93c2VyIGZyb20gcGxheXJpZ2h0XG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAcmV0dXJucyB7UHJvbWlzZS48bnVsbHwqPn0gLSBUaGUgZXZhbCByZXN1bHQvbnVsbFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uKCBicm93c2VyQ3JlYXRvciwgdXJsLCBvcHRpb25zICkge1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZSggYXN5bmMgKCByZXNvbHZlLCByZWplY3QgKSA9PiB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tYXN5bmMtcHJvbWlzZS1leGVjdXRvclxuXG4gICAgb3B0aW9ucyA9IF8ubWVyZ2UoIHtcblxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9wdXBwZXRlZXIvcHVwcGV0ZWVyL2Jsb2IvdjE0LjEuMS9kb2NzL2FwaS5tZCNwdXBwZXRlZXJsYXVuY2hvcHRpb25zXG4gICAgICAvLyBNYWtlIHN1cmUgdG8gcHJvdmlkZSBvcHRpb25zIHRoYXQgd29yayB3aXRoIHlvdXIgYnJvd3NlckNyZWF0b3IgKHBsYXl3cmlnaHQgb3IgcHVwcGV0ZWVyKVxuICAgICAgbGF1bmNoT3B0aW9uczoge1xuICAgICAgICBhcmdzOiBbXG4gICAgICAgICAgJy0tZGlzYWJsZS1ncHUnXG4gICAgICAgIF1cbiAgICAgIH0sXG5cbiAgICAgIGJyb3dzZXI6IG51bGwsIC8vIElmIHByb3ZpZGVkLCBicm93c2VyQ3JlYXRvciBpcyBub3QgdXNlZCB0byBjcmVhdGUgYSBicm93c2VyLCBhbmQgdGhpcyBicm93c2VyIGlzIG5vdCBjbG9zZWQuXG5cbiAgICAgIGV2YWx1YXRlOiBudWxsLCAvLyB7ZnVuY3Rpb258bnVsbH1cbiAgICAgIHdhaXRGb3JGdW5jdGlvbjogbnVsbCwgLy8ge3N0cmluZ3xudWxsfVxuXG4gICAgICByZWplY3RQYWdlRXJyb3JzOiB0cnVlLCAvLyByZWplY3Qgd2hlbiB0aGUgcGFnZSBlcnJvcnNcbiAgICAgIHJlamVjdEVycm9yczogdHJ1ZSwgLy8gcmVqZWN0IHdoZW4gdGhlcmUgaXMgYW4gZXJyb3Igd2l0aCB0aGUgYnJvd3NlclxuXG4gICAgICAvLyBCeSBkZWZhdWx0LCBvbmNlIGxvYWRlZCB3ZSByZXNvbHZlLCBidXQgb3B0IG91dCBvZiB0aGlzIGhlcmUuIElmIHlvdSBzZXQgdG8gZmFsc2UsIHlvdSBtdXN0IHJlc29sdmUgaW4gY3VzdG9tIGxvZ2ljIGluIG9uUGFnZUNyZWF0aW9uXG4gICAgICByZXNvbHZlRnJvbUxvYWQ6IHRydWUsXG4gICAgICB3YWl0QWZ0ZXJMb2FkOiA1MDAwLCAvLyBtaWxsaXNlY29uZHNcbiAgICAgIGFsbG93ZWRUaW1lVG9Mb2FkOiA0MDAwMCwgLy8gbWlsbGlzZWNvbmRzIGZvciB0aGUgd2hvbGUgdGhpbmcgdG8gcmVzb2x2ZSBhbmQgZmluaXNoXG4gICAgICBnb3RvVGltZW91dDogMzAwMDAsIC8vIG1pbGxpc2Vjb25kc1xuXG4gICAgICAvLyBDYWxsYmFjayB3aGVuIGxvZ2ljIGlzIG5vdCBjb21wbGV0ZSBhZnRlciB0aW1lb3V0IG9mIGxlbmd0aDogYWxsb3dlZFRpbWVUb0xvYWQuXG4gICAgICBvbkxvYWRUaW1lb3V0OiAoIHJlc29sdmUsIHJlamVjdCApID0+IHtcbiAgICAgICAgaWYgKCAhcGFnZUxvYWRlZCApIHtcbiAgICAgICAgICBvcHRpb25zLmxvZ2dlciggJ3B1cHBldGVlciBwYWdlIG5vdCBsb2FkZWQnICk7XG4gICAgICAgICAgcmVqZWN0KCBuZXcgRXJyb3IoIGBEaWQgbm90IGxvYWQgaW4gJHtvcHRpb25zLmFsbG93ZWRUaW1lVG9Mb2FkfWAgKSApO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb25QYWdlQ3JlYXRpb246IG51bGwsIC8vIHtmdW5jdGlvbihwYWdlLCByZXNvbHZlLHJlamVjdCk6UHJvbWlzZTx2b2lkPnxudWxsfSAtIGFueSBleHRyYSBpdGVtcyB5b3Ugd2FudCB0byBkbyB3aXRoIHRoZSBwYWdlIGJlZm9yZSBnb3RvIGlzIGNhbGxlZFxuICAgICAgZXZhbHVhdGVPbk5ld0RvY3VtZW50OiBudWxsLCAvLyB7ZnVuY3Rpb258bnVsbH0gcGFnZS5ldmFsdWF0ZU9uTmV3RG9jdW1lbnQgZm9yIHB1cHBldGVlciwgYW5kIGFkZEluaXRTY3JpcHQgZm9yIHBsYXl3cml0ZVxuXG4gICAgICBjYWNoZVBhZ2VzOiB0cnVlLFxuICAgICAgbG9nQ29uc29sZU91dHB1dDogZmFsc2UsIC8vIGlmIHRydWUsIHRoaXMgcHJvY2VzcyB3aWxsIGxvZyBhbGwgbWVzc2FnZXMgdGhhdCBjb21lIGZyb20gcGFnZS5vbiggJ2NvbnNvbGUnIClcbiAgICAgIGxvZ05hdmlnYXRpb246IGZhbHNlLCAvLyBpZiB0cnVlLCB0aGlzIHByb2Nlc3Mgd2lsbCBsb2cgYWxsIG1lc3NhZ2VzIHRoYXQgY29tZSBmcm9tIHBhZ2Uub24oICdmcmFtZSonIClcbiAgICAgIGxvZ2dlcjogd2luc3Rvbi5pbmZvIC8vIHtmdW5jdGlvbihtZXNzYWdlKX0gcGFzcyBpbiBgY29uc29sZS5sb2dgIGlmIHlvdSBhcmUgcnVubmluZyBpbiBhIGNvbnRleHQgdGhhdCBkb2Vzbid0IHVzZSB3aW5zdG9uXG4gICAgfSwgb3B0aW9ucyApO1xuXG4gICAgIW9wdGlvbnMucmVzb2x2ZUZyb21Mb2FkICYmIGFzc2VydCggb3B0aW9ucy5vblBhZ2VDcmVhdGlvbiwgJ211c3QgcmVzb2x2ZSBmcm9tIG9uUGFnZUNyZWF0aW9uJyApO1xuXG4gICAgY29uc3Qgb3duc0Jyb3dzZXIgPSAhb3B0aW9ucy5icm93c2VyO1xuXG4gICAgbGV0IGJyb3dzZXI7XG4gICAgbGV0IHBhZ2U7XG4gICAgbGV0IHBhZ2VMb2FkZWQgPSBmYWxzZTtcblxuICAgIC8vIEtlZXAgdHJhY2sgb2YgaWYgd2UgaGF2ZSByZWplY3RlZCBhbiBlcnJvci4gVGhpcyBtYWtlcyBzdXJlIHdlIGRvbid0IGtlZXAgY2FsbGluZyBicm93c2VyIGNvbW1hbmRzIHdoaWxlXG4gICAgLy8gdHJ5aW5nIHRvIGNsZWFuIHVwIHRoZSBwYWdlL2Jyb3dzZXIgYW5kIHJlamVjdCgpLiBUaGlzIGlzIHNldCB0byB0cnVlIEJFRk9SRSB0aGUgY2xlYW51cCgpLCB3aGljaCBpcyBhc3luYy5cbiAgICBsZXQgcmVqZWN0ZWQgPSBmYWxzZTtcblxuICAgIGNvbnN0IGNsZWFudXAgPSBhc3luYyAoKSA9PiB7XG4gICAgICBpZiAoIHBhZ2UgJiYgIXBhZ2UuaXNDbG9zZWQoKSApIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCBwYWdlLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goIGUgKSB7XG4gICAgICAgICAgLyogcHVwcGV0ZWVyIGlzIGJhZCBhdCBjbG9zaW5nIHBhZ2VzIHdoaWxlIHN0aWxsIGRvaW5nIG90aGVyIHN0dWZmICovXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgd2UgY3JlYXRlZCBhIHRlbXBvcmFyeSBicm93c2VyLCBjbG9zZSBpdFxuICAgICAgb3duc0Jyb3dzZXIgJiYgYnJvd3NlciAmJiBhd2FpdCBicm93c2VyLmNsb3NlKCk7XG4gICAgfTtcblxuICAgIGNvbnN0IGxvY2FsUmVzb2x2ZSA9IGFzeW5jIHJlc3VsdCA9PiB7XG4gICAgICBhd2FpdCBjbGVhbnVwKCk7XG4gICAgICByZXNvbHZlKCByZXN1bHQgKTtcbiAgICB9O1xuICAgIGNvbnN0IGxvY2FsUmVqZWN0ID0gYXN5bmMgZXJyb3IgPT4ge1xuICAgICAgY29uc3Qgd2FzUmVqZWN0ZWQgPSByZWplY3RlZDtcbiAgICAgIHJlamVjdGVkID0gdHJ1ZTsgLy8gQmVmb3JlIHRoZSBhc3luYyBjbGVhbnVwXG4gICAgICBhd2FpdCBjbGVhbnVwKCk7XG4gICAgICAhd2FzUmVqZWN0ZWQgJiYgcmVqZWN0KCBlcnJvciApOyAvLyBPdGhlcndpc2UsIE1LIGV4cGVyaWVuY2VkICB0aGUgc2Vjb25kIGNhbGwncyBlcnJvciBnZXR0aW5nIHByb3ZpZGVkIHRvIHRoZSBQcm9taXNlLlxuICAgIH07XG5cbiAgICB0cnkge1xuICAgICAgYnJvd3NlciA9IG9wdGlvbnMuYnJvd3NlciB8fCBhd2FpdCBicm93c2VyQ3JlYXRvci5sYXVuY2goIG9wdGlvbnMubGF1bmNoT3B0aW9ucyApO1xuXG4gICAgICBwYWdlID0gYXdhaXQgYnJvd3Nlci5uZXdQYWdlKCk7XG5cbiAgICAgIHBhZ2Uuc2V0Q2FjaGVFbmFibGVkICYmIHBhZ2Uuc2V0Q2FjaGVFbmFibGVkKCBvcHRpb25zLmNhY2hlUGFnZXMgKTtcblxuICAgICAgYXdhaXQgcGFnZS5zZXREZWZhdWx0TmF2aWdhdGlvblRpbWVvdXQoIG9wdGlvbnMuZ290b1RpbWVvdXQgKTtcblxuICAgICAgLy8gVGhlIEFQSSBmb3IgcGxheXdyaWdodCB3YXMgbXVjaCBtb3JlIGNvbXBsaWNhdGVkLCBzbyBqdXN0IHN1cHBvcnQgcHVwcGV0ZWVyXG4gICAgICBjb25zdCB1c2VybmFtZSA9IHByb2Nlc3MuZW52LkJBU0lDX1VTRVJOQU1FO1xuICAgICAgY29uc3QgcGFzc3dvcmQgPSBwcm9jZXNzLmVudi5CQVNJQ19QQVNTV09SRDtcblxuICAgICAgaWYgKCB1c2VybmFtZSAmJiBwYXNzd29yZCApIHtcbiAgICAgICAgaWYgKCBicm93c2VyQ3JlYXRvciA9PT0gcHVwcGV0ZWVyICkge1xuICAgICAgICAgIC8vIHB1cHBldGVlciBoYXMgaXRzIG93biBhdXRoZW50aWNhdGlvbiBtZXRob2QsIHRoYW5rcyFcbiAgICAgICAgICBhd2FpdCBwYWdlLmF1dGhlbnRpY2F0ZSggeyB1c2VybmFtZTogdXNlcm5hbWUsIHBhc3N3b3JkOiBwYXNzd29yZCB9ICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgLy8gSGFuZGxlIHBsYXl3cmlnaHQgYnJvd3NlcnMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXF1YS9pc3N1ZXMvMTg4XG5cbiAgICAgICAgICAvLyBUaGlzIGlzIG5vdCB0aGUgYmVzdCBtZXRob2QgZm9yIHB1cHBldGVlciBiZWNhdXNlIGl0IHZpb2xhdGVkIENPUlMgcG9saWNpZXMsIGZvciBleGFtcGxlIHdpdGggY29uc29sZSBlcnJvcnMgbGlrZTpcbiAgICAgICAgICAvLyBbQ09OU09MRV0gQWNjZXNzIHRvIHNjcmlwdCBhdCAnaHR0cHM6Ly9zdGF0aWMuY2xvdWRmbGFyZWluc2lnaHRzLmNvbS9iZWFjb24ubWluLmpzL3Y4NGEzYTQwMTJkZTk0Y2UxYTY4NmJhOGMxNjdjMzU5YzE2OTY5NzM4OTMzMTcnIGZyb20gb3JpZ2luICdodHRwczpwaGV0LWlvLmNvbG9yYWRvLmVkdScgaGFzIGJlZW4gYmxvY2tlZCBieSBDT1JTIHBvbGljeTogUmVxdWVzdCBoZWFkZXIgZmllbGQgYXV0aG9yaXphdGlvbiBpcyBub3QgYWxsb3dlZCBieSBBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzIGluIHByZWZsaWdodCByZXNwb25zZS5cbiAgICAgICAgICAvLyBbQ09OU09MRV0gRmFpbGVkIHRvIGxvYWQgcmVzb3VyY2U6IG5ldDo6RVJSX0ZBSUxFRDogICAgICBodHRwczovL3N0YXRpYy5jbG91ZGZsYXJlaW5zaWdodHMuY29tL2JlYWNvbi5taW4uanMvdjg0YTNhNDAxMmRlOTRjZTFhNjg2YmE4YzE2N2MzNTljMTY5Njk3Mzg5MzMxN1xuICAgICAgICAgIC8vIFtDT05TT0xFXSBBY2Nlc3MgdG8gZmV0Y2ggYXQgJ2h0dHBzOi8vcGhldC5jb2xvcmFkby5lZHUvc2VydmljZXMvbWV0YWRhdGEvcGhldGlvP2xhdGVzdD10cnVlJmFjdGl2ZT10cnVlJyBmcm9tIG9yaWdpbiAnaHR0cHM6Ly9waGV0LWlvLmNvbG9yYWRvLmVkdScgaGFzIGJlZW4gYmxvY2tlZCBieSBDT1JTIHBvbGljeTogUmVxdWVzdCBoZWFkZXIgZmllbGQgYXV0aG9yaXphdGlvbiBpcyBub3QgYWxsb3dlZCBieSBBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzIGluIHByZWZsaWdodCByZXNwb25zZS5cbiAgICAgICAgICAvLyBbQ09OU09MRV0gRmFpbGVkIHRvIGxvYWQgcmVzb3VyY2U6IG5ldDo6RVJSX0ZBSUxFRDogICAgICBodHRwczovL3BoZXQuY29sb3JhZG8uZWR1L3NlcnZpY2VzL21ldGFkYXRhL3BoZXRpbz9sYXRlc3Q9dHJ1ZSZhY3RpdmU9dHJ1ZVxuICAgICAgICAgIHBhZ2Uuc2V0RXh0cmFIVFRQSGVhZGVycygge1xuICAgICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgQmFzaWMgJHtCdWZmZXIuZnJvbSggYCR7dXNlcm5hbWV9OiR7cGFzc3dvcmR9YCApLnRvU3RyaW5nKCAnYmFzZTY0JyApfWBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHBhZ2Uub24oICdyZXNwb25zZScsIHJlc3BvbnNlID0+IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2VTdGF0dXMgPSByZXNwb25zZS5zdGF0dXMoKTtcblxuICAgICAgICAvLyAyMDAgYW5kIDMwMCBjbGFzcyBzdGF0dXMgYXJlIG1vc3QgbGlrZWx5IGZpbmUgaGVyZVxuICAgICAgICBpZiAoIHJlc3BvbnNlU3RhdHVzID49IDQwMCApIHtcbiAgICAgICAgICBjb25zdCByZXNwb25zZVVSTCA9IHJlc3BvbnNlLnVybCgpO1xuICAgICAgICAgIGlmICggcmVzcG9uc2VVUkwgPT09IHVybCApIHtcbiAgICAgICAgICAgIG9wdGlvbnMubG9nZ2VyKCBgW0VSUk9SXSBDb3VsZCBub3QgbG9hZCBmcm9tIHN0YXR1czogJHtyZXNwb25zZVN0YXR1c31gICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKCByZXNwb25zZVN0YXR1cyAhPT0gNDA0ICkgeyAvLyBUaGVyZSB3aWxsIGJlIGxvdHMgb2YgNDA0IGVycm9ycywgbGlrZSBmb3Igc3RyaW5ncyBmaWxlcyB0aGF0IGRvbid0IGV4aXN0XG4gICAgICAgICAgICBvcHRpb25zLmxvZ2dlciggYFtFUlJPUl0gQ291bGQgbm90IGxvYWQgZGVwZW5kZW5jeSBmcm9tIHN0YXR1czogJHtyZXNwb25zZVN0YXR1c30sIHVybDogJHtyZXNwb25zZVVSTH1gICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgICBvcHRpb25zLmxvZ0NvbnNvbGVPdXRwdXQgJiYgcGFnZS5vbiggJ2NvbnNvbGUnLCBtc2cgPT4ge1xuICAgICAgICBsZXQgbWVzc2FnZVR4dCA9IG1zZy50ZXh0KCk7XG5cbiAgICAgICAgLy8gQXBwZW5kIHRoZSBsb2NhdGlvbiB0byBtZXNzYWdlcyB0aGF0IHdvdWxkIGJlbmVmaXQgZnJvbSBpdC5cbiAgICAgICAgaWYgKCBtZXNzYWdlVHh0LmluY2x1ZGVzKCAnbmV0OicgKSB8fCBtZXNzYWdlVHh0LmluY2x1ZGVzKCAnRmFpbGVkIHRvIGxvYWQgcmVzb3VyY2UnICkgKSB7XG4gICAgICAgICAgbWVzc2FnZVR4dCArPSBgOiBcXHQgJHttc2cubG9jYXRpb24oKS51cmx9YDtcbiAgICAgICAgfVxuICAgICAgICBvcHRpb25zLmxvZ2dlciggYFtDT05TT0xFXSAke21lc3NhZ2VUeHR9YCApO1xuICAgICAgfSApO1xuXG4gICAgICBwYWdlLm9uKCAnZXJyb3InLCBhc3luYyBtZXNzYWdlID0+IHtcbiAgICAgICAgb3B0aW9ucy5sb2dnZXIoIGBbRVJST1JdICR7bWVzc2FnZX1gICk7XG4gICAgICAgIGlmICggb3B0aW9ucy5yZWplY3RFcnJvcnMgKSB7XG4gICAgICAgICAgYXdhaXQgbG9jYWxSZWplY3QoIG5ldyBFcnJvciggbWVzc2FnZSApICk7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICAgIHBhZ2Uub24oICdwYWdlZXJyb3InLCBhc3luYyBtZXNzYWdlID0+IHtcbiAgICAgICAgb3B0aW9ucy5sb2dnZXIoIGBbUEFHRSBFUlJPUl0gJHttZXNzYWdlfWAgKTtcbiAgICAgICAgaWYgKCBvcHRpb25zLnJlamVjdFBhZ2VFcnJvcnMgKSB7XG4gICAgICAgICAgYXdhaXQgbG9jYWxSZWplY3QoIG5ldyBFcnJvciggbWVzc2FnZSApICk7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICAgIGlmICggb3B0aW9ucy5sb2dOYXZpZ2F0aW9uICkge1xuICAgICAgICBwYWdlLm9uKCAnZnJhbWVhdHRhY2hlZCcsIGFzeW5jIGZyYW1lID0+IHtcbiAgICAgICAgICBvcHRpb25zLmxvZ2dlciggYFtBVFRBQ0hFRF0gJHtmcmFtZS51cmwoKX1gICk7XG4gICAgICAgIH0gKTtcbiAgICAgICAgcGFnZS5vbiggJ2ZyYW1lZGV0YWNoZWQnLCBhc3luYyBmcmFtZSA9PiB7XG4gICAgICAgICAgb3B0aW9ucy5sb2dnZXIoIGBbREVUQUNIRURdICR7ZnJhbWUudXJsKCl9YCApO1xuICAgICAgICB9ICk7XG4gICAgICAgIHBhZ2Uub24oICdmcmFtZW5hdmlnYXRlZCcsIGFzeW5jIGZyYW1lID0+IHtcbiAgICAgICAgICBvcHRpb25zLmxvZ2dlciggYFtOQVZJR0FURURdICR7ZnJhbWUudXJsKCl9YCApO1xuICAgICAgICB9ICk7XG4gICAgICB9XG5cbiAgICAgIG9wdGlvbnMub25QYWdlQ3JlYXRpb24gJiYgYXdhaXQgb3B0aW9ucy5vblBhZ2VDcmVhdGlvbiggcGFnZSwgbG9jYWxSZXNvbHZlLCBsb2NhbFJlamVjdCApO1xuICAgICAgaWYgKCByZWplY3RlZCApIHsgcmV0dXJuOyB9XG5cbiAgICAgIC8vIFN1cHBvcnQgcHVwcGV0ZWVyIChldmFsdWF0ZU9uTmV3RG9jdW1lbnQpIG9yIHBsYXl3cmlnaHQgKGFkZEluaXRTY3JpcHQpXG4gICAgICBvcHRpb25zLmV2YWx1YXRlT25OZXdEb2N1bWVudCAmJiBhd2FpdCAoICggcGFnZS5ldmFsdWF0ZU9uTmV3RG9jdW1lbnQgfHwgcGFnZS5hZGRJbml0U2NyaXB0ICkuY2FsbCggcGFnZSwgb3B0aW9ucy5ldmFsdWF0ZU9uTmV3RG9jdW1lbnQgKSApO1xuICAgICAgaWYgKCByZWplY3RlZCApIHsgcmV0dXJuOyB9XG5cbiAgICAgIC8vIFVzZSB0aW1lb3V0IHNvIHRoYXQgeW91IGNhbiBjYW5jZWwgaXQgb25jZSB3ZSBoYXZlIGEgcmVzdWx0LiBOb2RlIHdpbGwgd2FpdCBmb3IgdGhpcyBpZiBpdCBpcyBhIG9ycGhhbmVkIFByb21pc2UuXG4gICAgICBjb25zdCB0aW1lb3V0SUQgPSBzZXRUaW1lb3V0KCAoKSA9PiB7XG4gICAgICAgIG9wdGlvbnMub25Mb2FkVGltZW91dCggbG9jYWxSZXNvbHZlLCBsb2NhbFJlamVjdCApO1xuICAgICAgfSwgb3B0aW9ucy5hbGxvd2VkVGltZVRvTG9hZCApO1xuXG4gICAgICBvcHRpb25zLmxvZ2dlciggYFtVUkxdICR7dXJsfWAgKTtcblxuICAgICAgLy8gQXdhaXQgYm90aCBhdCB0aGUgc2FtZSB0aW1lLCBiZWNhdXNlIGFsbCByZWplY3Rpb24gaXMgaG9va2VkIHVwIHRvIHRoZSBgcHJvbWlzZWAsIGJ1dCB0aGF0IGNvdWxkIGNhdXNlIGFuIGVycm9yXG4gICAgICAvLyBkdXJpbmcgdGhlIGdvdG8gY2FsbCAobm90IGFmdGVyd2FyZCksIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXF1YS9pc3N1ZXMvMTk3XG4gICAgICBhd2FpdCBwYWdlLmdvdG8oIHVybCwge1xuICAgICAgICB0aW1lb3V0OiBvcHRpb25zLmdvdG9UaW1lb3V0XG4gICAgICB9ICk7XG4gICAgICBpZiAoIHJlamVjdGVkICkgeyByZXR1cm47IH1cblxuICAgICAgb3B0aW9ucy5sb2dnZXIoIGBbTE9BREVEXSAke3VybH1gICk7XG4gICAgICBwYWdlTG9hZGVkID0gdHJ1ZTtcblxuICAgICAgYXdhaXQgc2xlZXAoIG9wdGlvbnMud2FpdEFmdGVyTG9hZCApO1xuICAgICAgaWYgKCByZWplY3RlZCApIHsgcmV0dXJuOyB9XG5cbiAgICAgIGlmICggb3B0aW9ucy53YWl0Rm9yRnVuY3Rpb24gKSB7XG4gICAgICAgIGF3YWl0IHBhZ2Uud2FpdEZvckZ1bmN0aW9uKCBvcHRpb25zLndhaXRGb3JGdW5jdGlvbiwge1xuICAgICAgICAgIHBvbGxpbmc6IDEwMCwgLy8gZGVmYXVsdCBpcyBldmVyeSBhbmltYXRpb24gZnJhbWVcbiAgICAgICAgICB0aW1lb3V0OiBvcHRpb25zLmdvdG9UaW1lb3V0XG4gICAgICAgIH0gKTtcbiAgICAgICAgaWYgKCByZWplY3RlZCApIHsgcmV0dXJuOyB9XG4gICAgICB9XG5cbiAgICAgIGlmICggb3B0aW9ucy5yZXNvbHZlRnJvbUxvYWQgKSB7XG4gICAgICAgIGxldCByZXN1bHQgPSBudWxsO1xuICAgICAgICBpZiAoIG9wdGlvbnMuZXZhbHVhdGUgJiYgIXBhZ2UuaXNDbG9zZWQoKSApIHtcbiAgICAgICAgICByZXN1bHQgPSBhd2FpdCBwYWdlLmV2YWx1YXRlKCBvcHRpb25zLmV2YWx1YXRlICk7XG4gICAgICAgICAgaWYgKCByZWplY3RlZCApIHsgcmV0dXJuOyB9XG4gICAgICAgIH1cbiAgICAgICAgY2xlYXJUaW1lb3V0KCB0aW1lb3V0SUQgKTtcbiAgICAgICAgbG9jYWxSZXNvbHZlKCByZXN1bHQgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBjbGVhclRpbWVvdXQoIHRpbWVvdXRJRCApO1xuICAgICAgfVxuICAgIH1cbiAgICBjYXRjaCggZSApIHtcbiAgICAgIG9wdGlvbnMubG9nZ2VyKCBgYnJvd3NlclBhZ2VMb2FkIGNhdWdodCB1bmV4cGVjdGVkIGVycm9yOiAke2V9YCApO1xuICAgICAgYXdhaXQgbG9jYWxSZWplY3QoIGUgKTtcbiAgICB9XG4gIH0gKTtcbn07Il0sIm5hbWVzIjpbInNsZWVwIiwicmVxdWlyZSIsIl8iLCJ3aW5zdG9uIiwicHVwcGV0ZWVyIiwiYXNzZXJ0IiwibW9kdWxlIiwiZXhwb3J0cyIsImJyb3dzZXJDcmVhdG9yIiwidXJsIiwib3B0aW9ucyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwibWVyZ2UiLCJsYXVuY2hPcHRpb25zIiwiYXJncyIsImJyb3dzZXIiLCJldmFsdWF0ZSIsIndhaXRGb3JGdW5jdGlvbiIsInJlamVjdFBhZ2VFcnJvcnMiLCJyZWplY3RFcnJvcnMiLCJyZXNvbHZlRnJvbUxvYWQiLCJ3YWl0QWZ0ZXJMb2FkIiwiYWxsb3dlZFRpbWVUb0xvYWQiLCJnb3RvVGltZW91dCIsIm9uTG9hZFRpbWVvdXQiLCJwYWdlTG9hZGVkIiwibG9nZ2VyIiwiRXJyb3IiLCJvblBhZ2VDcmVhdGlvbiIsImV2YWx1YXRlT25OZXdEb2N1bWVudCIsImNhY2hlUGFnZXMiLCJsb2dDb25zb2xlT3V0cHV0IiwibG9nTmF2aWdhdGlvbiIsImluZm8iLCJvd25zQnJvd3NlciIsInBhZ2UiLCJyZWplY3RlZCIsImNsZWFudXAiLCJpc0Nsb3NlZCIsImNsb3NlIiwiZSIsImxvY2FsUmVzb2x2ZSIsInJlc3VsdCIsImxvY2FsUmVqZWN0IiwiZXJyb3IiLCJ3YXNSZWplY3RlZCIsImxhdW5jaCIsIm5ld1BhZ2UiLCJzZXRDYWNoZUVuYWJsZWQiLCJzZXREZWZhdWx0TmF2aWdhdGlvblRpbWVvdXQiLCJ1c2VybmFtZSIsInByb2Nlc3MiLCJlbnYiLCJCQVNJQ19VU0VSTkFNRSIsInBhc3N3b3JkIiwiQkFTSUNfUEFTU1dPUkQiLCJhdXRoZW50aWNhdGUiLCJzZXRFeHRyYUhUVFBIZWFkZXJzIiwiQXV0aG9yaXphdGlvbiIsIkJ1ZmZlciIsImZyb20iLCJ0b1N0cmluZyIsIm9uIiwicmVzcG9uc2UiLCJyZXNwb25zZVN0YXR1cyIsInN0YXR1cyIsInJlc3BvbnNlVVJMIiwibXNnIiwibWVzc2FnZVR4dCIsInRleHQiLCJpbmNsdWRlcyIsImxvY2F0aW9uIiwibWVzc2FnZSIsImZyYW1lIiwiYWRkSW5pdFNjcmlwdCIsImNhbGwiLCJ0aW1lb3V0SUQiLCJzZXRUaW1lb3V0IiwiZ290byIsInRpbWVvdXQiLCJwb2xsaW5nIiwiY2xlYXJUaW1lb3V0Il0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7OztDQVlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE1BQU1BLFFBQVFDLFFBQVM7QUFDdkIsTUFBTUMsSUFBSUQsUUFBUztBQUNuQixNQUFNRSxVQUFVRixRQUFTO0FBQ3pCLE1BQU1HLFlBQVlILFFBQVM7QUFDM0IsTUFBTUksU0FBU0osUUFBUztBQUV4Qjs7Ozs7Ozs7OztDQVVDLEdBQ0RLLE9BQU9DLE9BQU8scUNBQUcsVUFBZ0JDLGNBQWMsRUFBRUMsR0FBRyxFQUFFQyxPQUFPO0lBRTNELE9BQU8sSUFBSUMsMENBQVMsVUFBUUMsU0FBU0M7UUFFbkNILFVBQVVSLEVBQUVZLEtBQUssQ0FBRTtZQUVqQiw2RkFBNkY7WUFDN0YsNEZBQTRGO1lBQzVGQyxlQUFlO2dCQUNiQyxNQUFNO29CQUNKO2lCQUNEO1lBQ0g7WUFFQUMsU0FBUztZQUVUQyxVQUFVO1lBQ1ZDLGlCQUFpQjtZQUVqQkMsa0JBQWtCO1lBQ2xCQyxjQUFjO1lBRWQsd0lBQXdJO1lBQ3hJQyxpQkFBaUI7WUFDakJDLGVBQWU7WUFDZkMsbUJBQW1CO1lBQ25CQyxhQUFhO1lBRWIsa0ZBQWtGO1lBQ2xGQyxlQUFlLENBQUVkLFNBQVNDO2dCQUN4QixJQUFLLENBQUNjLFlBQWE7b0JBQ2pCakIsUUFBUWtCLE1BQU0sQ0FBRTtvQkFDaEJmLE9BQVEsSUFBSWdCLE1BQU8sQ0FBQyxnQkFBZ0IsRUFBRW5CLFFBQVFjLGlCQUFpQixFQUFFO2dCQUNuRTtZQUNGO1lBQ0FNLGdCQUFnQjtZQUNoQkMsdUJB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