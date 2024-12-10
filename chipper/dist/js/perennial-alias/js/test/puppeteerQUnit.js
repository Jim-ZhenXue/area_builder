/* eslint-disable */ // Adapted from https://github.com/davidtaylorhq/qunit-puppeteer which is distributed under the MIT License
/* eslint-enable */ // @author Michael Kauzmann (PhET Interactive Simulations)
/* global window */ function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
module.exports = function(browser, targetURL) {
    return new Promise(/*#__PURE__*/ _async_to_generator(function*(resolve, reject) {
        const page = yield browser.newPage();
        let ended = false;
        const end = /*#__PURE__*/ _async_to_generator(function*(result) {
            if (!ended) {
                ended = true;
                yield page.close();
                resolve(result);
            }
        });
        page.on('error', (msg)=>end({
                ok: false,
                result: 'error',
                message: msg
            }));
        page.on('pageerror', (msg)=>end({
                ok: false,
                result: 'pageerror',
                message: msg
            }));
        const moduleErrors = [];
        let testErrors = [];
        let assertionErrors = [];
        yield page.exposeFunction('harness_moduleDone', (context)=>{
            if (context.failed) {
                const msg = `Module Failed: ${context.name}\n${testErrors.join('\n')}`;
                moduleErrors.push(msg);
                testErrors = [];
            }
        });
        yield page.exposeFunction('harness_testDone', (context)=>{
            if (context.failed) {
                const msg = `  Test Failed: ${context.name}${assertionErrors.join('    ')}`;
                testErrors.push(msg);
                assertionErrors = [];
                process.stdout.write('F');
            } else {
            // process.stdout.write( '.' );
            }
        });
        yield page.exposeFunction('harness_log', (passed, message, source)=>{
            if (passed) {
                return;
            } // If success don't log
            let msg = '\n    Assertion Failed:';
            if (message) {
                msg += ` ${message}`;
            }
            if (source) {
                msg += `\n\n${source}`;
            }
            assertionErrors.push(msg);
        });
        yield page.exposeFunction('harness_done', /*#__PURE__*/ _async_to_generator(function*(context) {
            // console.log( '\n' );
            if (moduleErrors.length > 0) {
                for(let idx = 0; idx < moduleErrors.length; idx++){
                    console.error(`${moduleErrors[idx]}\n`);
                }
            }
            end({
                ok: context.passed === context.total,
                time: context.runtime,
                totalTests: context.total,
                passed: context.passed,
                failed: context.failed,
                errors: moduleErrors
            });
        }));
        try {
            if (targetURL.indexOf('?') === -1) {
                throw new Error('URL should have query parameters');
            }
            yield page.goto(`${targetURL}&qunitHooks`);
            yield page.evaluate(()=>{
                const launch = ()=>{
                    QUnit.config.testTimeout = 10000;
                    // Cannot pass the window.harness_blah methods directly, because they are
                    // automatically defined as async methods, which QUnit does not support
                    QUnit.moduleDone((context)=>window.harness_moduleDone(context));
                    QUnit.testDone((context)=>window.harness_testDone(context));
                    // This context could contain objects that can't be sent over to harness_log, so just take the parts we need.
                    QUnit.log((context)=>window.harness_log(context.result, context.message, context.source));
                    QUnit.done((context)=>window.harness_done(context));
                    // Launch the qunit tests now that listeners are wired up
                    window.qunitLaunchAfterHooks();
                };
                // Start right away if the page is ready
                if (window.qunitLaunchAfterHooks) {
                    launch();
                } else {
                    // Polling to wait until the page is ready for launch
                    let id = null;
                    id = setInterval(()=>{
                        if (window.qunitLaunchAfterHooks) {
                            clearInterval(id);
                            launch();
                        }
                    }, 16);
                }
            });
        } catch (e) {
            end({
                ok: false,
                message: `caught exception ${e}`
            });
        }
    }));
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy90ZXN0L3B1cHBldGVlclFVbml0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlICovXG4vLyBBZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2RhdmlkdGF5bG9yaHEvcXVuaXQtcHVwcGV0ZWVyIHdoaWNoIGlzIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgTGljZW5zZVxuLyogZXNsaW50LWVuYWJsZSAqL1xuLy8gQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuXG4vKiBnbG9iYWwgd2luZG93ICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIGJyb3dzZXIsIHRhcmdldFVSTCApIHtcblxuICByZXR1cm4gbmV3IFByb21pc2UoIGFzeW5jICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4geyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWFzeW5jLXByb21pc2UtZXhlY3V0b3JcbiAgICBjb25zdCBwYWdlID0gYXdhaXQgYnJvd3Nlci5uZXdQYWdlKCk7XG4gICAgbGV0IGVuZGVkID0gZmFsc2U7XG4gICAgY29uc3QgZW5kID0gYXN5bmMgZnVuY3Rpb24oIHJlc3VsdCApIHtcbiAgICAgIGlmICggIWVuZGVkICkge1xuICAgICAgICBlbmRlZCA9IHRydWU7XG4gICAgICAgIGF3YWl0IHBhZ2UuY2xvc2UoKTtcbiAgICAgICAgcmVzb2x2ZSggcmVzdWx0ICk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHBhZ2Uub24oICdlcnJvcicsIG1zZyA9PiBlbmQoIHsgb2s6IGZhbHNlLCByZXN1bHQ6ICdlcnJvcicsIG1lc3NhZ2U6IG1zZyB9ICkgKTtcbiAgICBwYWdlLm9uKCAncGFnZWVycm9yJywgbXNnID0+IGVuZCggeyBvazogZmFsc2UsIHJlc3VsdDogJ3BhZ2VlcnJvcicsIG1lc3NhZ2U6IG1zZyB9ICkgKTtcblxuICAgIGNvbnN0IG1vZHVsZUVycm9ycyA9IFtdO1xuICAgIGxldCB0ZXN0RXJyb3JzID0gW107XG4gICAgbGV0IGFzc2VydGlvbkVycm9ycyA9IFtdO1xuXG4gICAgYXdhaXQgcGFnZS5leHBvc2VGdW5jdGlvbiggJ2hhcm5lc3NfbW9kdWxlRG9uZScsIGNvbnRleHQgPT4ge1xuICAgICAgaWYgKCBjb250ZXh0LmZhaWxlZCApIHtcbiAgICAgICAgY29uc3QgbXNnID0gYE1vZHVsZSBGYWlsZWQ6ICR7Y29udGV4dC5uYW1lfVxcbiR7dGVzdEVycm9ycy5qb2luKCAnXFxuJyApfWA7XG4gICAgICAgIG1vZHVsZUVycm9ycy5wdXNoKCBtc2cgKTtcbiAgICAgICAgdGVzdEVycm9ycyA9IFtdO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIGF3YWl0IHBhZ2UuZXhwb3NlRnVuY3Rpb24oICdoYXJuZXNzX3Rlc3REb25lJywgY29udGV4dCA9PiB7XG4gICAgICBpZiAoIGNvbnRleHQuZmFpbGVkICkge1xuICAgICAgICBjb25zdCBtc2cgPSBgICBUZXN0IEZhaWxlZDogJHtjb250ZXh0Lm5hbWV9JHthc3NlcnRpb25FcnJvcnMuam9pbiggJyAgICAnICl9YDtcbiAgICAgICAgdGVzdEVycm9ycy5wdXNoKCBtc2cgKTtcbiAgICAgICAgYXNzZXJ0aW9uRXJyb3JzID0gW107XG4gICAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKCAnRicgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyBwcm9jZXNzLnN0ZG91dC53cml0ZSggJy4nICk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgYXdhaXQgcGFnZS5leHBvc2VGdW5jdGlvbiggJ2hhcm5lc3NfbG9nJywgKCBwYXNzZWQsIG1lc3NhZ2UsIHNvdXJjZSApID0+IHtcbiAgICAgIGlmICggcGFzc2VkICkgeyByZXR1cm47IH0gLy8gSWYgc3VjY2VzcyBkb24ndCBsb2dcblxuICAgICAgbGV0IG1zZyA9ICdcXG4gICAgQXNzZXJ0aW9uIEZhaWxlZDonO1xuICAgICAgaWYgKCBtZXNzYWdlICkge1xuICAgICAgICBtc2cgKz0gYCAke21lc3NhZ2V9YDtcbiAgICAgIH1cblxuICAgICAgaWYgKCBzb3VyY2UgKSB7XG4gICAgICAgIG1zZyArPSBgXFxuXFxuJHtzb3VyY2V9YDtcbiAgICAgIH1cblxuICAgICAgYXNzZXJ0aW9uRXJyb3JzLnB1c2goIG1zZyApO1xuICAgIH0gKTtcblxuICAgIGF3YWl0IHBhZ2UuZXhwb3NlRnVuY3Rpb24oICdoYXJuZXNzX2RvbmUnLCBhc3luYyBjb250ZXh0ID0+IHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCAnXFxuJyApO1xuXG4gICAgICBpZiAoIG1vZHVsZUVycm9ycy5sZW5ndGggPiAwICkge1xuICAgICAgICBmb3IgKCBsZXQgaWR4ID0gMDsgaWR4IDwgbW9kdWxlRXJyb3JzLmxlbmd0aDsgaWR4KysgKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvciggYCR7bW9kdWxlRXJyb3JzWyBpZHggXX1cXG5gICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZW5kKCB7XG4gICAgICAgIG9rOiBjb250ZXh0LnBhc3NlZCA9PT0gY29udGV4dC50b3RhbCxcbiAgICAgICAgdGltZTogY29udGV4dC5ydW50aW1lLFxuICAgICAgICB0b3RhbFRlc3RzOiBjb250ZXh0LnRvdGFsLFxuICAgICAgICBwYXNzZWQ6IGNvbnRleHQucGFzc2VkLFxuICAgICAgICBmYWlsZWQ6IGNvbnRleHQuZmFpbGVkLFxuICAgICAgICBlcnJvcnM6IG1vZHVsZUVycm9yc1xuICAgICAgfSApO1xuICAgIH0gKTtcblxuICAgIHRyeSB7XG4gICAgICBpZiAoIHRhcmdldFVSTC5pbmRleE9mKCAnPycgKSA9PT0gLTEgKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvciggJ1VSTCBzaG91bGQgaGF2ZSBxdWVyeSBwYXJhbWV0ZXJzJyApO1xuICAgICAgfVxuICAgICAgYXdhaXQgcGFnZS5nb3RvKCBgJHt0YXJnZXRVUkx9JnF1bml0SG9va3NgICk7XG5cbiAgICAgIGF3YWl0IHBhZ2UuZXZhbHVhdGUoICgpID0+IHtcblxuICAgICAgICBjb25zdCBsYXVuY2ggPSAoKSA9PiB7XG4gICAgICAgICAgUVVuaXQuY29uZmlnLnRlc3RUaW1lb3V0ID0gMTAwMDA7XG5cbiAgICAgICAgICAvLyBDYW5ub3QgcGFzcyB0aGUgd2luZG93Lmhhcm5lc3NfYmxhaCBtZXRob2RzIGRpcmVjdGx5LCBiZWNhdXNlIHRoZXkgYXJlXG4gICAgICAgICAgLy8gYXV0b21hdGljYWxseSBkZWZpbmVkIGFzIGFzeW5jIG1ldGhvZHMsIHdoaWNoIFFVbml0IGRvZXMgbm90IHN1cHBvcnRcbiAgICAgICAgICBRVW5pdC5tb2R1bGVEb25lKCBjb250ZXh0ID0+IHdpbmRvdy5oYXJuZXNzX21vZHVsZURvbmUoIGNvbnRleHQgKSApO1xuICAgICAgICAgIFFVbml0LnRlc3REb25lKCBjb250ZXh0ID0+IHdpbmRvdy5oYXJuZXNzX3Rlc3REb25lKCBjb250ZXh0ICkgKTtcblxuICAgICAgICAgIC8vIFRoaXMgY29udGV4dCBjb3VsZCBjb250YWluIG9iamVjdHMgdGhhdCBjYW4ndCBiZSBzZW50IG92ZXIgdG8gaGFybmVzc19sb2csIHNvIGp1c3QgdGFrZSB0aGUgcGFydHMgd2UgbmVlZC5cbiAgICAgICAgICBRVW5pdC5sb2coIGNvbnRleHQgPT4gd2luZG93Lmhhcm5lc3NfbG9nKCBjb250ZXh0LnJlc3VsdCwgY29udGV4dC5tZXNzYWdlLCBjb250ZXh0LnNvdXJjZSApICk7XG4gICAgICAgICAgUVVuaXQuZG9uZSggY29udGV4dCA9PiB3aW5kb3cuaGFybmVzc19kb25lKCBjb250ZXh0ICkgKTtcblxuICAgICAgICAgIC8vIExhdW5jaCB0aGUgcXVuaXQgdGVzdHMgbm93IHRoYXQgbGlzdGVuZXJzIGFyZSB3aXJlZCB1cFxuICAgICAgICAgIHdpbmRvdy5xdW5pdExhdW5jaEFmdGVySG9va3MoKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBTdGFydCByaWdodCBhd2F5IGlmIHRoZSBwYWdlIGlzIHJlYWR5XG4gICAgICAgIGlmICggd2luZG93LnF1bml0TGF1bmNoQWZ0ZXJIb29rcyApIHtcbiAgICAgICAgICBsYXVuY2goKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcblxuICAgICAgICAgIC8vIFBvbGxpbmcgdG8gd2FpdCB1bnRpbCB0aGUgcGFnZSBpcyByZWFkeSBmb3IgbGF1bmNoXG4gICAgICAgICAgbGV0IGlkID0gbnVsbDtcbiAgICAgICAgICBpZCA9IHNldEludGVydmFsKCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIHdpbmRvdy5xdW5pdExhdW5jaEFmdGVySG9va3MgKSB7XG4gICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoIGlkICk7XG4gICAgICAgICAgICAgIGxhdW5jaCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIDE2ICk7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICB9XG4gICAgY2F0Y2goIGUgKSB7XG4gICAgICBlbmQoIHsgb2s6IGZhbHNlLCBtZXNzYWdlOiBgY2F1Z2h0IGV4Y2VwdGlvbiAke2V9YCB9ICk7XG4gICAgfVxuICB9ICk7XG59OyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnRzIiwiYnJvd3NlciIsInRhcmdldFVSTCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwicGFnZSIsIm5ld1BhZ2UiLCJlbmRlZCIsImVuZCIsInJlc3VsdCIsImNsb3NlIiwib24iLCJtc2ciLCJvayIsIm1lc3NhZ2UiLCJtb2R1bGVFcnJvcnMiLCJ0ZXN0RXJyb3JzIiwiYXNzZXJ0aW9uRXJyb3JzIiwiZXhwb3NlRnVuY3Rpb24iLCJjb250ZXh0IiwiZmFpbGVkIiwibmFtZSIsImpvaW4iLCJwdXNoIiwicHJvY2VzcyIsInN0ZG91dCIsIndyaXRlIiwicGFzc2VkIiwic291cmNlIiwibGVuZ3RoIiwiaWR4IiwiY29uc29sZSIsImVycm9yIiwidG90YWwiLCJ0aW1lIiwicnVudGltZSIsInRvdGFsVGVzdHMiLCJlcnJvcnMiLCJpbmRleE9mIiwiRXJyb3IiLCJnb3RvIiwiZXZhbHVhdGUiLCJsYXVuY2giLCJRVW5pdCIsImNvbmZpZyIsInRlc3RUaW1lb3V0IiwibW9kdWxlRG9uZSIsIndpbmRvdyIsImhhcm5lc3NfbW9kdWxlRG9uZSIsInRlc3REb25lIiwiaGFybmVzc190ZXN0RG9uZSIsImxvZyIsImhhcm5lc3NfbG9nIiwiZG9uZSIsImhhcm5lc3NfZG9uZSIsInF1bml0TGF1bmNoQWZ0ZXJIb29rcyIsImlkIiwic2V0SW50ZXJ2YWwiLCJjbGVhckludGVydmFsIiwiZSJdLCJtYXBwaW5ncyI6IkFBQUEsa0JBQWtCLEdBQ2xCLDJHQUEyRztBQUMzRyxpQkFBaUIsR0FDakIsMERBQTBEO0FBRTFELGlCQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFakJBLE9BQU9DLE9BQU8sR0FBRyxTQUFVQyxPQUFPLEVBQUVDLFNBQVM7SUFFM0MsT0FBTyxJQUFJQywwQ0FBUyxVQUFRQyxTQUFTQztRQUNuQyxNQUFNQyxPQUFPLE1BQU1MLFFBQVFNLE9BQU87UUFDbEMsSUFBSUMsUUFBUTtRQUNaLE1BQU1DLHdDQUFNLFVBQWdCQyxNQUFNO1lBQ2hDLElBQUssQ0FBQ0YsT0FBUTtnQkFDWkEsUUFBUTtnQkFDUixNQUFNRixLQUFLSyxLQUFLO2dCQUNoQlAsUUFBU007WUFDWDtRQUNGO1FBRUFKLEtBQUtNLEVBQUUsQ0FBRSxTQUFTQyxDQUFBQSxNQUFPSixJQUFLO2dCQUFFSyxJQUFJO2dCQUFPSixRQUFRO2dCQUFTSyxTQUFTRjtZQUFJO1FBQ3pFUCxLQUFLTSxFQUFFLENBQUUsYUFBYUMsQ0FBQUEsTUFBT0osSUFBSztnQkFBRUssSUFBSTtnQkFBT0osUUFBUTtnQkFBYUssU0FBU0Y7WUFBSTtRQUVqRixNQUFNRyxlQUFlLEVBQUU7UUFDdkIsSUFBSUMsYUFBYSxFQUFFO1FBQ25CLElBQUlDLGtCQUFrQixFQUFFO1FBRXhCLE1BQU1aLEtBQUthLGNBQWMsQ0FBRSxzQkFB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