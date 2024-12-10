// Copyright 2021, University of Colorado Boulder
/**
 * Continuously running Studio fuzzing for testing
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
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
const puppeteerLoad = require('../common/puppeteerLoad');
const withServer = require('../common/withServer');
const path = require('path');
_async_to_generator(function*() {
    while(true){
        let studioFuzz = null;
        console.log('starting new fuzz');
        try {
            yield withServer(/*#__PURE__*/ _async_to_generator(function*(port) {
                const url = `http://localhost:${port}/studio/index.html?sim=states-of-matter&phetioElementsDisplay=all&fuzz`;
                yield puppeteerLoad(url, {
                    waitAfterLoad: 10000,
                    allowedTimeToLoad: 120000,
                    gotoTimeout: 120000,
                    launchOptions: {
                        // With this flag, temp files are written to /tmp/ on bayes, which caused https://github.com/phetsims/aqua/issues/145
                        // /dev/shm/ is much bigger
                        ignoreDefaultArgs: [
                            '--disable-dev-shm-usage'
                        ],
                        // Command line arguments passed to the chrome instance,
                        args: [
                            '--enable-precise-memory-info',
                            // To prevent filling up `/tmp`, see https://github.com/phetsims/aqua/issues/145
                            `--user-data-dir=${path.normalize(`${process.cwd()}/../tmp/puppeteerUserData/`)}`
                        ]
                    }
                });
            }));
        } catch (e) {
            studioFuzz = e;
        }
        console.log(studioFuzz);
    }
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL3N0dWRpby1mdXp6LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDb250aW51b3VzbHkgcnVubmluZyBTdHVkaW8gZnV6emluZyBmb3IgdGVzdGluZ1xuICpcbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBwdXBwZXRlZXJMb2FkID0gcmVxdWlyZSggJy4uL2NvbW1vbi9wdXBwZXRlZXJMb2FkJyApO1xuY29uc3Qgd2l0aFNlcnZlciA9IHJlcXVpcmUoICcuLi9jb21tb24vd2l0aFNlcnZlcicgKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCAncGF0aCcgKTtcblxuKCBhc3luYyAoKSA9PiB7XG5cbiAgd2hpbGUgKCB0cnVlICkge1xuICAgIGxldCBzdHVkaW9GdXp6ID0gbnVsbDtcblxuICAgIGNvbnNvbGUubG9nKCAnc3RhcnRpbmcgbmV3IGZ1enonICk7XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgd2l0aFNlcnZlciggYXN5bmMgcG9ydCA9PiB7XG4gICAgICAgIGNvbnN0IHVybCA9IGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0vc3R1ZGlvL2luZGV4Lmh0bWw/c2ltPXN0YXRlcy1vZi1tYXR0ZXImcGhldGlvRWxlbWVudHNEaXNwbGF5PWFsbCZmdXp6YDtcbiAgICAgICAgYXdhaXQgcHVwcGV0ZWVyTG9hZCggdXJsLCB7XG4gICAgICAgICAgd2FpdEFmdGVyTG9hZDogMTAwMDAsXG4gICAgICAgICAgYWxsb3dlZFRpbWVUb0xvYWQ6IDEyMDAwMCxcbiAgICAgICAgICBnb3RvVGltZW91dDogMTIwMDAwLFxuICAgICAgICAgIGxhdW5jaE9wdGlvbnM6IHtcblxuICAgICAgICAgICAgLy8gV2l0aCB0aGlzIGZsYWcsIHRlbXAgZmlsZXMgYXJlIHdyaXR0ZW4gdG8gL3RtcC8gb24gYmF5ZXMsIHdoaWNoIGNhdXNlZCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXF1YS9pc3N1ZXMvMTQ1XG4gICAgICAgICAgICAvLyAvZGV2L3NobS8gaXMgbXVjaCBiaWdnZXJcbiAgICAgICAgICAgIGlnbm9yZURlZmF1bHRBcmdzOiBbICctLWRpc2FibGUtZGV2LXNobS11c2FnZScgXSxcblxuICAgICAgICAgICAgLy8gQ29tbWFuZCBsaW5lIGFyZ3VtZW50cyBwYXNzZWQgdG8gdGhlIGNocm9tZSBpbnN0YW5jZSxcbiAgICAgICAgICAgIGFyZ3M6IFtcbiAgICAgICAgICAgICAgJy0tZW5hYmxlLXByZWNpc2UtbWVtb3J5LWluZm8nLFxuXG4gICAgICAgICAgICAgIC8vIFRvIHByZXZlbnQgZmlsbGluZyB1cCBgL3RtcGAsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXF1YS9pc3N1ZXMvMTQ1XG4gICAgICAgICAgICAgIGAtLXVzZXItZGF0YS1kaXI9JHtwYXRoLm5vcm1hbGl6ZSggYCR7cHJvY2Vzcy5jd2QoKX0vLi4vdG1wL3B1cHBldGVlclVzZXJEYXRhL2AgKX1gXG4gICAgICAgICAgICBdXG4gICAgICAgICAgfVxuICAgICAgICB9ICk7XG4gICAgICB9ICk7XG4gICAgfVxuICAgIGNhdGNoKCBlICkge1xuICAgICAgc3R1ZGlvRnV6eiA9IGU7XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coIHN0dWRpb0Z1enogKTtcbiAgfVxufSApKCk7Il0sIm5hbWVzIjpbInB1cHBldGVlckxvYWQiLCJyZXF1aXJlIiwid2l0aFNlcnZlciIsInBhdGgiLCJzdHVkaW9GdXp6IiwiY29uc29sZSIsImxvZyIsInBvcnQiLCJ1cmwiLCJ3YWl0QWZ0ZXJMb2FkIiwiYWxsb3dlZFRpbWVUb0xvYWQiLCJnb3RvVGltZW91dCIsImxhdW5jaE9wdGlvbnMiLCJpZ25vcmVEZWZhdWx0QXJncyIsImFyZ3MiLCJub3JtYWxpemUiLCJwcm9jZXNzIiwiY3dkIiwiZSJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7OztDQUtDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE1BQU1BLGdCQUFnQkMsUUFBUztBQUMvQixNQUFNQyxhQUFhRCxRQUFTO0FBQzVCLE1BQU1FLE9BQU9GLFFBQVM7QUFFcEIsb0JBQUE7SUFFQSxNQUFRLEtBQU87UUFDYixJQUFJRyxhQUFhO1FBRWpCQyxRQUFRQyxHQUFHLENBQUU7UUFFYixJQUFJO1lBQ0YsTUFBTUosNkNBQVksVUFBTUs7Z0JBQ3RCLE1BQU1DLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRUQsS0FBSyxzRUFBc0UsQ0FBQztnQkFDNUcsTUFBTVAsY0FBZVEsS0FBSztvQkFDeEJDLGVBQWU7b0JBQ2ZDLG1CQUFtQjtvQkFDbkJDLGFBQWE7b0JBQ2JDLGVBQWU7d0JBRWIscUhBQXFIO3dCQUNySCwyQkFBMkI7d0JBQzNCQyxtQkFBbUI7NEJBQUU7eUJBQTJCO3dCQUVoRCx3REFBd0Q7d0JBQ3hEQyxNQUFNOzRCQUNKOzRCQUVBLGdGQUFnRjs0QkFDaEYsQ0FBQyxnQkFBZ0IsRUFBRVgsS0FBS1ksU0FBUyxDQUFFLEdBQUdDLFFBQVFDLEdBQUcsR0FBRywwQkFBMEIsQ0FBQyxHQUFJO3lCQUNwRjtvQkFDSDtnQkFDRjtZQUNGO1FBQ0YsRUFDQSxPQUFPQyxHQUFJO1lBQ1RkLGFBQWFjO1FBQ2Y7UUFFQWIsUUFBUUMsR0FBRyxDQUFFRjtJQUNmO0FBQ0YifQ==