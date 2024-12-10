// Copyright 2019-2024, University of Colorado Boulder
/**
 * Launch an instance of the simulation using puppeteer, gather the PhET-iO API of the simulation,
 * see phetioEngine.getPhetioElementsBaseline
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
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
import assert from 'assert';
import withServer from '../../../perennial-alias/js/common/withServer.js';
import _ from '../../../perennial-alias/js/npm-dependencies/lodash.js';
import puppeteer from '../../../perennial-alias/js/npm-dependencies/puppeteer.js';
import showCommandLineProgress from '../common/showCommandLineProgress.js';
const TIMEOUT = 120000;
/**
 * Load each sim provided and get the
 */ const generatePhetioMacroAPI = /*#__PURE__*/ _async_to_generator(function*(repos, providedOptions) {
    assert(repos.length === _.uniq(repos).length, 'repos should be unique');
    const options = _.assignIn({
        fromBuiltVersion: false,
        chunkSize: 4,
        showProgressBar: false,
        showMessagesFromSim: true,
        // If false, allow individual repos return null if they encountered problems
        throwAPIGenerationErrors: true
    }, providedOptions);
    repos.length > 1 && console.log('Generating PhET-iO API for repos:', repos.join(', '));
    return withServer(/*#__PURE__*/ _async_to_generator(function*(port) {
        const browser = yield puppeteer.launch({
            timeout: 10000000,
            args: [
                '--disable-gpu',
                // Fork child processes directly to prevent orphaned chrome instances from lingering on sparky, https://github.com/phetsims/aqua/issues/150#issuecomment-1170140994
                '--no-zygote',
                '--no-sandbox'
            ]
        });
        const chunks = _.chunk(repos, options.chunkSize);
        const macroAPI = {}; // if throwAPIGenerationErrors:false, a repo will be null if it encountered errors.
        const errors = {};
        for(let i = 0; i < chunks.length; i++){
            const chunk = chunks[i];
            options.showProgressBar && showCommandLineProgress(i / chunks.length, false);
            const promises = chunk.map(/*#__PURE__*/ _async_to_generator(function*(repo) {
                const page = yield browser.newPage();
                return new Promise(/*#__PURE__*/ _async_to_generator(function*(resolve, reject) {
                    let cleaned = false;
                    // Returns whether we closed the page
                    const cleanup = /*#__PURE__*/ _async_to_generator(function*() {
                        if (cleaned) {
                            return false;
                        }
                        cleaned = true; // must be before the close to prevent cleaning from being done twice if errors occur from page close.
                        clearTimeout(id);
                        yield page.close();
                        return true;
                    });
                    // This is likely to occur in the middle of page.goto, so we need to be graceful to the fact that resolving
                    // and closing the page will then cause an error in the page.goto call, see https://github.com/phetsims/perennial/issues/268#issuecomment-1382374092
                    const cleanupAndResolve = /*#__PURE__*/ _async_to_generator(function*(value) {
                        if (yield cleanup()) {
                            resolve(value);
                        }
                    });
                    const cleanupAndReject = /*#__PURE__*/ _async_to_generator(function*(e) {
                        if (yield cleanup()) {
                            resolve({
                                repo: repo,
                                error: e
                            });
                        }
                    });
                    // Fail if this takes too long.  Doesn't need to be cleared since only the first resolve/reject is used
                    const id = setTimeout(()=>cleanupAndReject(new Error(`Timeout in generatePhetioMacroAPI for ${repo}`)), TIMEOUT);
                    page.on('console', /*#__PURE__*/ _async_to_generator(function*(msg) {
                        const messageText = msg.text();
                        if (messageText.includes('"phetioFullAPI": true,')) {
                            yield cleanupAndResolve({
                                // to keep track of which repo this is for
                                repo: repo,
                                // For machine readability, the API
                                api: JSON.parse(messageText)
                            });
                        }
                    // // For debugging purposes
                    // else if ( msg.type() === 'error' ) {
                    //   console.error( messageText, msg.stackTrace() );
                    // }
                    }));
                    page.on('error', cleanupAndReject);
                    page.on('pageerror', cleanupAndReject);
                    const relativePath = options.fromBuiltVersion ? `build/phet-io/${repo}_all_phet-io.html` : `${repo}_en.html`;
                    // NOTE: DUPLICATION ALERT: This random seed is copied wherever API comparison is done against the generated API. Don't change this
                    // without looking for other usages of this random seed value.
                    const url = `http://localhost:${port}/${repo}/${relativePath}?ea&brand=phet-io&phetioStandalone&phetioPrintAPI&randomSeed=332211&locales=*&webgl=false`;
                    try {
                        yield page.goto(url, {
                            timeout: TIMEOUT
                        });
                    } catch (e) {
                        yield cleanupAndReject(new Error(`page.goto failure: ${e}`));
                    }
                }));
            }));
            const chunkResults = yield Promise.allSettled(promises);
            chunkResults.forEach((chunkResult)=>{
                if (chunkResult.status === 'fulfilled') {
                    const repo = chunkResult.value.repo;
                    macroAPI[repo] = chunkResult.value.api || null;
                    const error = chunkResult.value.error;
                    if (error) {
                        if (options.throwAPIGenerationErrors) {
                            console.error(`Error in ${repo}:`);
                            throw error;
                        } else {
                            errors[repo] = error;
                        }
                    }
                } else {
                    const reason = chunkResult.reason;
                    console.error(reason);
                    if (options.throwAPIGenerationErrors) {
                        throw new Error(reason);
                    }
                }
            });
        }
        options.showProgressBar && showCommandLineProgress(1, true);
        yield browser.close();
        if (Object.keys(errors).length > 0) {
            console.error('Errors while generating PhET-iO APIs:', errors);
        }
        return macroAPI;
    }));
});
generatePhetioMacroAPI.apiVersion = '1.0.0-dev.0';
export default generatePhetioMacroAPI;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL3BoZXQtaW8vZ2VuZXJhdGVQaGV0aW9NYWNyb0FQSS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBMYXVuY2ggYW4gaW5zdGFuY2Ugb2YgdGhlIHNpbXVsYXRpb24gdXNpbmcgcHVwcGV0ZWVyLCBnYXRoZXIgdGhlIFBoRVQtaU8gQVBJIG9mIHRoZSBzaW11bGF0aW9uLFxuICogc2VlIHBoZXRpb0VuZ2luZS5nZXRQaGV0aW9FbGVtZW50c0Jhc2VsaW5lXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB3aXRoU2VydmVyIGZyb20gJy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vd2l0aFNlcnZlci5qcyc7XG5pbXBvcnQgXyBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvbnBtLWRlcGVuZGVuY2llcy9sb2Rhc2guanMnO1xuaW1wb3J0IHB1cHBldGVlciBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvbnBtLWRlcGVuZGVuY2llcy9wdXBwZXRlZXIuanMnO1xuaW1wb3J0IHsgUGhldGlvQVBJIH0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3BoZXQtaW8tdHlwZXMuanMnO1xuaW1wb3J0IHNob3dDb21tYW5kTGluZVByb2dyZXNzIGZyb20gJy4uL2NvbW1vbi9zaG93Q29tbWFuZExpbmVQcm9ncmVzcy5qcyc7XG5cbmV4cG9ydCB0eXBlIFBoZXRpb0FQSXMgPSBSZWNvcmQ8c3RyaW5nLCBQaGV0aW9BUEkgfCBudWxsPjsgLy8gbnVsbCBpZiBlcnJvcmVkXG5cbnR5cGUgR2VuZXJhdGVQaGV0aW9NYWNyb0FQSU9wdGlvbnMgPSB7XG5cbiAgLy8gaWYgdGhlIGJ1aWx0IGZpbGUgc2hvdWxkIGJlIHVzZWQgdG8gZ2VuZXJhdGUgdGhlIEFQSSAob3RoZXJ3aXNlIHVzZXMgdW5idWlsdClcbiAgZnJvbUJ1aWx0VmVyc2lvbjogYm9vbGVhbjtcblxuICAvLyBzcGxpdCBpbnRvIGNodW5rcyB3aXRoIChhdCBtb3N0KSB0aGlzIG1hbnkgZWxlbWVudHMgcGVyIGNodW5rXG4gIGNodW5rU2l6ZTogNDtcbiAgc2hvd1Byb2dyZXNzQmFyOiBib29sZWFuO1xuICBzaG93TWVzc2FnZXNGcm9tU2ltOiBib29sZWFuO1xuXG4gIC8vIElmIGZhbHNlLCBhbGxvdyBpbmRpdmlkdWFsIHJlcG9zIHJldHVybiBudWxsIGlmIHRoZXkgZW5jb3VudGVyZWQgcHJvYmxlbXNcbiAgdGhyb3dBUElHZW5lcmF0aW9uRXJyb3JzOiBib29sZWFuO1xufTtcblxuY29uc3QgVElNRU9VVCA9IDEyMDAwMDtcblxuXG4vKipcbiAqIExvYWQgZWFjaCBzaW0gcHJvdmlkZWQgYW5kIGdldCB0aGVcbiAqL1xuY29uc3QgZ2VuZXJhdGVQaGV0aW9NYWNyb0FQSSA9IGFzeW5jICggcmVwb3M6IHN0cmluZ1tdLCBwcm92aWRlZE9wdGlvbnM/OiBQYXJ0aWFsPEdlbmVyYXRlUGhldGlvTWFjcm9BUElPcHRpb25zPiApOiBQcm9taXNlPFBoZXRpb0FQSXM+ID0+IHtcblxuICBhc3NlcnQoIHJlcG9zLmxlbmd0aCA9PT0gXy51bmlxKCByZXBvcyApLmxlbmd0aCwgJ3JlcG9zIHNob3VsZCBiZSB1bmlxdWUnICk7XG5cbiAgY29uc3Qgb3B0aW9ucyA9IF8uYXNzaWduSW4oIHtcbiAgICBmcm9tQnVpbHRWZXJzaW9uOiBmYWxzZSwgLy8gaWYgdGhlIGJ1aWx0IGZpbGUgc2hvdWxkIGJlIHVzZWQgdG8gZ2VuZXJhdGUgdGhlIEFQSSAob3RoZXJ3aXNlIHVzZXMgdW5idWlsdClcbiAgICBjaHVua1NpemU6IDQsIC8vIHNwbGl0IGludG8gY2h1bmtzIHdpdGggKGF0IG1vc3QpIHRoaXMgbWFueSBlbGVtZW50cyBwZXIgY2h1bmtcbiAgICBzaG93UHJvZ3Jlc3NCYXI6IGZhbHNlLFxuICAgIHNob3dNZXNzYWdlc0Zyb21TaW06IHRydWUsXG5cbiAgICAvLyBJZiBmYWxzZSwgYWxsb3cgaW5kaXZpZHVhbCByZXBvcyByZXR1cm4gbnVsbCBpZiB0aGV5IGVuY291bnRlcmVkIHByb2JsZW1zXG4gICAgdGhyb3dBUElHZW5lcmF0aW9uRXJyb3JzOiB0cnVlXG4gIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gIHJlcG9zLmxlbmd0aCA+IDEgJiYgY29uc29sZS5sb2coICdHZW5lcmF0aW5nIFBoRVQtaU8gQVBJIGZvciByZXBvczonLCByZXBvcy5qb2luKCAnLCAnICkgKTtcblxuICByZXR1cm4gd2l0aFNlcnZlciggYXN5bmMgKCBwb3J0OiBudW1iZXIgKSA9PiB7XG4gICAgY29uc3QgYnJvd3NlciA9IGF3YWl0IHB1cHBldGVlci5sYXVuY2goIHtcbiAgICAgIHRpbWVvdXQ6IDEwMDAwMDAwLCAvLyBEb24ndCB0aW1lb3V0IHRoZSBicm93c2VyIHdoZW4gZ2VuZXJhdGluZyBQaEVULWlPIEFQSSwgd2UgaGFuZGxlIGl0IGxvd2VyIGRvd24uXG4gICAgICBhcmdzOiBbXG4gICAgICAgICctLWRpc2FibGUtZ3B1JyxcblxuICAgICAgICAvLyBGb3JrIGNoaWxkIHByb2Nlc3NlcyBkaXJlY3RseSB0byBwcmV2ZW50IG9ycGhhbmVkIGNocm9tZSBpbnN0YW5jZXMgZnJvbSBsaW5nZXJpbmcgb24gc3Bhcmt5LCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXF1YS9pc3N1ZXMvMTUwI2lzc3VlY29tbWVudC0xMTcwMTQwOTk0XG4gICAgICAgICctLW5vLXp5Z290ZScsXG4gICAgICAgICctLW5vLXNhbmRib3gnXG4gICAgICBdXG4gICAgfSApO1xuICAgIGNvbnN0IGNodW5rcyA9IF8uY2h1bmsoIHJlcG9zLCBvcHRpb25zLmNodW5rU2l6ZSApO1xuXG4gICAgY29uc3QgbWFjcm9BUEk6IFBoZXRpb0FQSXMgPSB7fTsgLy8gaWYgdGhyb3dBUElHZW5lcmF0aW9uRXJyb3JzOmZhbHNlLCBhIHJlcG8gd2lsbCBiZSBudWxsIGlmIGl0IGVuY291bnRlcmVkIGVycm9ycy5cbiAgICBjb25zdCBlcnJvcnM6IFJlY29yZDxzdHJpbmcsIEVycm9yPiA9IHt9O1xuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgY2h1bmtzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgY2h1bmsgPSBjaHVua3NbIGkgXTtcbiAgICAgIG9wdGlvbnMuc2hvd1Byb2dyZXNzQmFyICYmIHNob3dDb21tYW5kTGluZVByb2dyZXNzKCBpIC8gY2h1bmtzLmxlbmd0aCwgZmFsc2UgKTtcblxuICAgICAgdHlwZSBSZXNvbHZlZCA9IHtcbiAgICAgICAgcmVwbzogc3RyaW5nO1xuICAgICAgICBhcGk/OiBQaGV0aW9BUEk7XG4gICAgICAgIGVycm9yPzogRXJyb3I7XG4gICAgICB9O1xuICAgICAgY29uc3QgcHJvbWlzZXM6IFByb21pc2U8UmVzb2x2ZWQ+W10gPSBjaHVuay5tYXAoIGFzeW5jIHJlcG8gPT4ge1xuICAgICAgICBjb25zdCBwYWdlID0gYXdhaXQgYnJvd3Nlci5uZXdQYWdlKCk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCBhc3luYyAoIHJlc29sdmUsIHJlamVjdCApID0+IHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1hc3luYy1wcm9taXNlLWV4ZWN1dG9yXG5cbiAgICAgICAgICBsZXQgY2xlYW5lZCA9IGZhbHNlO1xuICAgICAgICAgIC8vIFJldHVybnMgd2hldGhlciB3ZSBjbG9zZWQgdGhlIHBhZ2VcbiAgICAgICAgICBjb25zdCBjbGVhbnVwID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCBjbGVhbmVkICkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICAgICAgICAgIGNsZWFuZWQgPSB0cnVlOyAvLyBtdXN0IGJlIGJlZm9yZSB0aGUgY2xvc2UgdG8gcHJldmVudCBjbGVhbmluZyBmcm9tIGJlaW5nIGRvbmUgdHdpY2UgaWYgZXJyb3JzIG9jY3VyIGZyb20gcGFnZSBjbG9zZS5cblxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KCBpZCApO1xuICAgICAgICAgICAgYXdhaXQgcGFnZS5jbG9zZSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgLy8gVGhpcyBpcyBsaWtlbHkgdG8gb2NjdXIgaW4gdGhlIG1pZGRsZSBvZiBwYWdlLmdvdG8sIHNvIHdlIG5lZWQgdG8gYmUgZ3JhY2VmdWwgdG8gdGhlIGZhY3QgdGhhdCByZXNvbHZpbmdcbiAgICAgICAgICAvLyBhbmQgY2xvc2luZyB0aGUgcGFnZSB3aWxsIHRoZW4gY2F1c2UgYW4gZXJyb3IgaW4gdGhlIHBhZ2UuZ290byBjYWxsLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BlcmVubmlhbC9pc3N1ZXMvMjY4I2lzc3VlY29tbWVudC0xMzgyMzc0MDkyXG4gICAgICAgICAgY29uc3QgY2xlYW51cEFuZFJlc29sdmUgPSBhc3luYyAoIHZhbHVlOiBSZXNvbHZlZCApID0+IHtcbiAgICAgICAgICAgIGlmICggYXdhaXQgY2xlYW51cCgpICkge1xuICAgICAgICAgICAgICByZXNvbHZlKCB2YWx1ZSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgY29uc3QgY2xlYW51cEFuZFJlamVjdCA9IGFzeW5jICggZTogRXJyb3IgKSA9PiB7XG4gICAgICAgICAgICBpZiAoIGF3YWl0IGNsZWFudXAoKSApIHtcbiAgICAgICAgICAgICAgcmVzb2x2ZSgge1xuICAgICAgICAgICAgICAgIHJlcG86IHJlcG8sXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVcbiAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICAvLyBGYWlsIGlmIHRoaXMgdGFrZXMgdG9vIGxvbmcuICBEb2Vzbid0IG5lZWQgdG8gYmUgY2xlYXJlZCBzaW5jZSBvbmx5IHRoZSBmaXJzdCByZXNvbHZlL3JlamVjdCBpcyB1c2VkXG4gICAgICAgICAgY29uc3QgaWQgPSBzZXRUaW1lb3V0KCAoKSA9PiBjbGVhbnVwQW5kUmVqZWN0KCBuZXcgRXJyb3IoIGBUaW1lb3V0IGluIGdlbmVyYXRlUGhldGlvTWFjcm9BUEkgZm9yICR7cmVwb31gICkgKSwgVElNRU9VVCApO1xuXG4gICAgICAgICAgcGFnZS5vbiggJ2NvbnNvbGUnLCBhc3luYyBtc2cgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZVRleHQgPSBtc2cudGV4dCgpO1xuICAgICAgICAgICAgaWYgKCBtZXNzYWdlVGV4dC5pbmNsdWRlcyggJ1wicGhldGlvRnVsbEFQSVwiOiB0cnVlLCcgKSApIHtcbiAgICAgICAgICAgICAgYXdhaXQgY2xlYW51cEFuZFJlc29sdmUoIHtcbiAgICAgICAgICAgICAgICAvLyB0byBrZWVwIHRyYWNrIG9mIHdoaWNoIHJlcG8gdGhpcyBpcyBmb3JcbiAgICAgICAgICAgICAgICByZXBvOiByZXBvLFxuXG4gICAgICAgICAgICAgICAgLy8gRm9yIG1hY2hpbmUgcmVhZGFiaWxpdHksIHRoZSBBUElcbiAgICAgICAgICAgICAgICBhcGk6IEpTT04ucGFyc2UoIG1lc3NhZ2VUZXh0IClcbiAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyAvLyBGb3IgZGVidWdnaW5nIHB1cnBvc2VzXG4gICAgICAgICAgICAvLyBlbHNlIGlmICggbXNnLnR5cGUoKSA9PT0gJ2Vycm9yJyApIHtcbiAgICAgICAgICAgIC8vICAgY29uc29sZS5lcnJvciggbWVzc2FnZVRleHQsIG1zZy5zdGFja1RyYWNlKCkgKTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICBwYWdlLm9uKCAnZXJyb3InLCBjbGVhbnVwQW5kUmVqZWN0ICk7XG4gICAgICAgICAgcGFnZS5vbiggJ3BhZ2VlcnJvcicsIGNsZWFudXBBbmRSZWplY3QgKTtcblxuICAgICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IG9wdGlvbnMuZnJvbUJ1aWx0VmVyc2lvbiA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYGJ1aWxkL3BoZXQtaW8vJHtyZXBvfV9hbGxfcGhldC1pby5odG1sYCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7cmVwb31fZW4uaHRtbGA7XG5cbiAgICAgICAgICAvLyBOT1RFOiBEVVBMSUNBVElPTiBBTEVSVDogVGhpcyByYW5kb20gc2VlZCBpcyBjb3BpZWQgd2hlcmV2ZXIgQVBJIGNvbXBhcmlzb24gaXMgZG9uZSBhZ2FpbnN0IHRoZSBnZW5lcmF0ZWQgQVBJLiBEb24ndCBjaGFuZ2UgdGhpc1xuICAgICAgICAgIC8vIHdpdGhvdXQgbG9va2luZyBmb3Igb3RoZXIgdXNhZ2VzIG9mIHRoaXMgcmFuZG9tIHNlZWQgdmFsdWUuXG4gICAgICAgICAgY29uc3QgdXJsID0gYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fS8ke3JlcG99LyR7cmVsYXRpdmVQYXRofT9lYSZicmFuZD1waGV0LWlvJnBoZXRpb1N0YW5kYWxvbmUmcGhldGlvUHJpbnRBUEkmcmFuZG9tU2VlZD0zMzIyMTEmbG9jYWxlcz0qJndlYmdsPWZhbHNlYDtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgcGFnZS5nb3RvKCB1cmwsIHtcbiAgICAgICAgICAgICAgdGltZW91dDogVElNRU9VVFxuICAgICAgICAgICAgfSApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXRjaCggZSApIHtcbiAgICAgICAgICAgIGF3YWl0IGNsZWFudXBBbmRSZWplY3QoIG5ldyBFcnJvciggYHBhZ2UuZ290byBmYWlsdXJlOiAke2V9YCApICk7XG4gICAgICAgICAgfVxuICAgICAgICB9ICk7XG4gICAgICB9ICk7XG5cbiAgICAgIGNvbnN0IGNodW5rUmVzdWx0cyA9IGF3YWl0IFByb21pc2UuYWxsU2V0dGxlZCggcHJvbWlzZXMgKTtcblxuICAgICAgY2h1bmtSZXN1bHRzLmZvckVhY2goIGNodW5rUmVzdWx0ID0+IHtcbiAgICAgICAgaWYgKCBjaHVua1Jlc3VsdC5zdGF0dXMgPT09ICdmdWxmaWxsZWQnICkge1xuICAgICAgICAgIGNvbnN0IHJlcG8gPSBjaHVua1Jlc3VsdC52YWx1ZS5yZXBvO1xuICAgICAgICAgIG1hY3JvQVBJWyByZXBvIF0gPSBjaHVua1Jlc3VsdC52YWx1ZS5hcGkgfHwgbnVsbDtcbiAgICAgICAgICBjb25zdCBlcnJvciA9IGNodW5rUmVzdWx0LnZhbHVlLmVycm9yO1xuICAgICAgICAgIGlmICggZXJyb3IgKSB7XG4gICAgICAgICAgICBpZiAoIG9wdGlvbnMudGhyb3dBUElHZW5lcmF0aW9uRXJyb3JzICkge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCBgRXJyb3IgaW4gJHtyZXBvfTpgICk7XG4gICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIGVycm9yc1sgcmVwbyBdID0gZXJyb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHJlYXNvbiA9IGNodW5rUmVzdWx0LnJlYXNvbjtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCByZWFzb24gKTtcbiAgICAgICAgICBpZiAoIG9wdGlvbnMudGhyb3dBUElHZW5lcmF0aW9uRXJyb3JzICkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCByZWFzb24gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICB9XG5cbiAgICBvcHRpb25zLnNob3dQcm9ncmVzc0JhciAmJiBzaG93Q29tbWFuZExpbmVQcm9ncmVzcyggMSwgdHJ1ZSApO1xuXG4gICAgYXdhaXQgYnJvd3Nlci5jbG9zZSgpO1xuICAgIGlmICggT2JqZWN0LmtleXMoIGVycm9ycyApLmxlbmd0aCA+IDAgKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCAnRXJyb3JzIHdoaWxlIGdlbmVyYXRpbmcgUGhFVC1pTyBBUElzOicsIGVycm9ycyApO1xuICAgIH1cbiAgICByZXR1cm4gbWFjcm9BUEk7XG4gIH0gKTtcbn07XG5cbmdlbmVyYXRlUGhldGlvTWFjcm9BUEkuYXBpVmVyc2lvbiA9ICcxLjAuMC1kZXYuMCc7XG5cbmV4cG9ydCBkZWZhdWx0IGdlbmVyYXRlUGhldGlvTWFjcm9BUEk7Il0sIm5hbWVzIjpbImFzc2VydCIsIndpdGhTZXJ2ZXIiLCJfIiwicHVwcGV0ZWVyIiwic2hvd0NvbW1hbmRMaW5lUHJvZ3Jlc3MiLCJUSU1FT1VUIiwiZ2VuZXJhdGVQaGV0aW9NYWNyb0FQSSIsInJlcG9zIiwicHJvdmlkZWRPcHRpb25zIiwibGVuZ3RoIiwidW5pcSIsIm9wdGlvbnMiLCJhc3NpZ25JbiIsImZyb21CdWlsdFZlcnNpb24iLCJjaHVua1NpemUiLCJzaG93UHJvZ3Jlc3NCYXIiLCJzaG93TWVzc2FnZXNGcm9tU2ltIiwidGhyb3dBUElHZW5lcmF0aW9uRXJyb3JzIiwiY29uc29sZSIsImxvZyIsImpvaW4iLCJwb3J0IiwiYnJvd3NlciIsImxhdW5jaCIsInRpbWVvdXQiLCJhcmdzIiwiY2h1bmtzIiwiY2h1bmsiLCJtYWNyb0FQSSIsImVycm9ycyIsImkiLCJwcm9taXNlcyIsIm1hcCIsInJlcG8iLCJwYWdlIiwibmV3UGFnZSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiY2xlYW5lZCIsImNsZWFudXAiLCJjbGVhclRpbWVvdXQiLCJpZCIsImNsb3NlIiwiY2xlYW51cEFuZFJlc29sdmUiLCJ2YWx1ZSIsImNsZWFudXBBbmRSZWplY3QiLCJlIiwiZXJyb3IiLCJzZXRUaW1lb3V0IiwiRXJyb3IiLCJvbiIsIm1zZyIsIm1lc3NhZ2VUZXh0IiwidGV4dCIsImluY2x1ZGVzIiwiYXBpIiwiSlNPTiIsInBhcnNlIiwicmVsYXRpdmVQYXRoIiwidXJsIiwiZ290byIsImNodW5rUmVzdWx0cyIsImFsbFNldHRsZWQiLCJmb3JFYWNoIiwiY2h1bmtSZXN1bHQiLCJzdGF0dXMiLCJyZWFzb24iLCJPYmplY3QiLCJrZXlzIiwiYXBpVmVyc2lvbiJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Q0FNQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxPQUFPQSxZQUFZLFNBQVM7QUFDNUIsT0FBT0MsZ0JBQWdCLG1EQUFtRDtBQUMxRSxPQUFPQyxPQUFPLHlEQUF5RDtBQUN2RSxPQUFPQyxlQUFlLDREQUE0RDtBQUVsRixPQUFPQyw2QkFBNkIsdUNBQXVDO0FBa0IzRSxNQUFNQyxVQUFVO0FBR2hCOztDQUVDLEdBQ0QsTUFBTUMsMkRBQXlCLFVBQVFDLE9BQWlCQztJQUV0RFIsT0FBUU8sTUFBTUUsTUFBTSxLQUFLUCxFQUFFUSxJQUFJLENBQUVILE9BQVFFLE1BQU0sRUFBRTtJQUVqRCxNQUFNRSxVQUFVVCxFQUFFVSxRQUFRLENBQUU7UUFDMUJDLGtCQUFrQjtRQUNsQkMsV0FBVztRQUNYQyxpQkFBaUI7UUFDakJDLHFCQUFxQjtRQUVyQiw0RUFBNEU7UUFDNUVDLDBCQUEwQjtJQUM1QixHQUFHVDtJQUVIRCxNQUFNRSxNQUFNLEdBQUcsS0FBS1MsUUFBUUMsR0FBRyxDQUFFLHFDQUFxQ1osTUFBTWEsSUFBSSxDQUFFO0lBRWxGLE9BQU9uQiw2Q0FBWSxVQUFRb0I7UUFDekIsTUFBTUMsVUFBVSxNQUFNbkIsVUFBVW9CLE1BQU0sQ0FBRTtZQUN0Q0MsU0FBUztZQUNUQyxNQUFNO2dCQUNKO2dCQUVBLG1LQUFtSztnQkFDbks7Z0JBQ0E7YUFDRDtRQUNIO1FBQ0EsTUFBTUMsU0FBU3hCLEVBQUV5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