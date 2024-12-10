// Copyright 2018, University of Colorado Boulder
/**
 *  This script searches babel for all translation credits based on history and adds them to the website database
 *  if not previously added.
 *
 *  @author Matt Pennington
 **/ function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
const buildLocal = require('../common/buildLocal');
const fetch = require('node-fetch'); // eslint-disable-line phet/require-statement-match
const fs = require('fs');
const translatorAuthCode = buildLocal.translatorAuthCode;
if (!translatorAuthCode) {
    console.log('ERROR: translatorAuthCode required in build-local.json');
} else {
    let repos;
    let error = null;
    try {
        repos = fs.readFileSync(`${__dirname}../../data/active-sims`).toString().split('\r\n').filter((e)=>e !== '');
    } catch (e) {
        console.log(e);
        console.log('Error processing data/active-sims, this script must be run from the perennial directory');
        error = e;
    }
    if (!error) {
        const usermap = {};
        // FIND ALL TRANSLATION CREDITS
        repos.forEach((repo)=>{
            try {
                const repoPath = `../babel/${repo}/`;
                fs.readdirSync(repoPath).forEach((localizedFilename)=>{
                    const locale = localizedFilename.slice(`${repo}-strings_`.length, localizedFilename.indexOf('.'));
                    const content = JSON.parse(fs.readFileSync(repoPath + localizedFilename).toString());
                    for(const stringKey in content){
                        if (content.hasOwnProperty(stringKey) && content[stringKey].history) {
                            content[stringKey].history.forEach((entry)=>{
                                if (!usermap[entry.userId]) {
                                    usermap[entry.userId] = {};
                                }
                                if (!usermap[entry.userId][locale]) {
                                    usermap[entry.userId][locale] = [];
                                }
                                if (!usermap[entry.userId][locale].includes(repo)) {
                                    usermap[entry.userId][locale].push(repo);
                                }
                            });
                        }
                    }
                });
            } catch (e) {
                // We expect unpublished or test repos to have no translations
                if (e.code === 'ENOENT') {
                    console.log(`INFO: no localized files found for ${repo}`);
                } else {
                    console.log('WARN: ', e);
                }
            }
        });
        // PREPARE QUEUE
        const urlPath = 'https://phet.colorado.edu/services/add-html-translator?';
        const requests = [];
        for(const user in usermap){
            if (usermap.hasOwnProperty(user)) {
                for(const locale in usermap[user]){
                    if (usermap[user].hasOwnProperty(locale)) {
                        usermap[user][locale].forEach(/*#__PURE__*/ _async_to_generator(function*(repo) {
                            const paramString = `simName=${repo}&locale=${locale}&userId=${user}&authorizationCode=${translatorAuthCode}`;
                            requests.push(urlPath + paramString);
                        }));
                    }
                }
            }
        }
        // SEND HTTP REQUESTS
        let i = 0;
        const get = /*#__PURE__*/ _async_to_generator(function*() {
            console.log(`Fetching ${requests[i]}`);
            const response = yield fetch(requests[i]);
            if (response.status < 200 || response.status > 299) {
                console.log(`ERROR: ${response.status} ${response.statusText}`);
            } else {
                console.log(`SUCCESS: ${response.status}`);
            }
            i += 1;
            if (i < requests.length) {
                get();
            } else {
                console.log('FINISHED!');
            }
        });
        try {
            get();
        } catch (e) {
            console.log('ERROR: ', e);
        }
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL2FkZE1pc3NpbmdUcmFuc2xhdGlvbkNyZWRpdHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqICBUaGlzIHNjcmlwdCBzZWFyY2hlcyBiYWJlbCBmb3IgYWxsIHRyYW5zbGF0aW9uIGNyZWRpdHMgYmFzZWQgb24gaGlzdG9yeSBhbmQgYWRkcyB0aGVtIHRvIHRoZSB3ZWJzaXRlIGRhdGFiYXNlXG4gKiAgaWYgbm90IHByZXZpb3VzbHkgYWRkZWQuXG4gKlxuICogIEBhdXRob3IgTWF0dCBQZW5uaW5ndG9uXG4gKiovXG5cbmNvbnN0IGJ1aWxkTG9jYWwgPSByZXF1aXJlKCAnLi4vY29tbW9uL2J1aWxkTG9jYWwnICk7XG5jb25zdCBmZXRjaCA9IHJlcXVpcmUoICdub2RlLWZldGNoJyApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvcmVxdWlyZS1zdGF0ZW1lbnQtbWF0Y2hcbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xuXG5jb25zdCB0cmFuc2xhdG9yQXV0aENvZGUgPSBidWlsZExvY2FsLnRyYW5zbGF0b3JBdXRoQ29kZTtcbmlmICggIXRyYW5zbGF0b3JBdXRoQ29kZSApIHtcbiAgY29uc29sZS5sb2coICdFUlJPUjogdHJhbnNsYXRvckF1dGhDb2RlIHJlcXVpcmVkIGluIGJ1aWxkLWxvY2FsLmpzb24nICk7XG59XG5lbHNlIHtcblxuICBsZXQgcmVwb3M7XG4gIGxldCBlcnJvciA9IG51bGw7XG4gIHRyeSB7XG4gICAgcmVwb3MgPSBmcy5yZWFkRmlsZVN5bmMoIGAke19fZGlybmFtZX0uLi8uLi9kYXRhL2FjdGl2ZS1zaW1zYCApXG4gICAgICAudG9TdHJpbmcoKVxuICAgICAgLnNwbGl0KCAnXFxyXFxuJyApXG4gICAgICAuZmlsdGVyKCBlID0+IGUgIT09ICcnICk7XG4gIH1cbiAgY2F0Y2goIGUgKSB7XG4gICAgY29uc29sZS5sb2coIGUgKTtcbiAgICBjb25zb2xlLmxvZyggJ0Vycm9yIHByb2Nlc3NpbmcgZGF0YS9hY3RpdmUtc2ltcywgdGhpcyBzY3JpcHQgbXVzdCBiZSBydW4gZnJvbSB0aGUgcGVyZW5uaWFsIGRpcmVjdG9yeScgKTtcbiAgICBlcnJvciA9IGU7XG4gIH1cblxuICBpZiAoICFlcnJvciApIHtcblxuICAgIGNvbnN0IHVzZXJtYXAgPSB7fTtcblxuLy8gRklORCBBTEwgVFJBTlNMQVRJT04gQ1JFRElUU1xuICAgIHJlcG9zLmZvckVhY2goIHJlcG8gPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVwb1BhdGggPSBgLi4vYmFiZWwvJHtyZXBvfS9gO1xuICAgICAgICBmcy5yZWFkZGlyU3luYyggcmVwb1BhdGggKS5mb3JFYWNoKCBsb2NhbGl6ZWRGaWxlbmFtZSA9PiB7XG4gICAgICAgICAgY29uc3QgbG9jYWxlID0gbG9jYWxpemVkRmlsZW5hbWUuc2xpY2UoICggYCR7cmVwb30tc3RyaW5nc19gICkubGVuZ3RoLCBsb2NhbGl6ZWRGaWxlbmFtZS5pbmRleE9mKCAnLicgKSApO1xuICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBKU09OLnBhcnNlKCBmcy5yZWFkRmlsZVN5bmMoIHJlcG9QYXRoICsgbG9jYWxpemVkRmlsZW5hbWUgKS50b1N0cmluZygpICk7XG4gICAgICAgICAgZm9yICggY29uc3Qgc3RyaW5nS2V5IGluIGNvbnRlbnQgKSB7XG4gICAgICAgICAgICBpZiAoIGNvbnRlbnQuaGFzT3duUHJvcGVydHkoIHN0cmluZ0tleSApICYmIGNvbnRlbnRbIHN0cmluZ0tleSBdLmhpc3RvcnkgKSB7XG4gICAgICAgICAgICAgIGNvbnRlbnRbIHN0cmluZ0tleSBdLmhpc3RvcnkuZm9yRWFjaCggZW50cnkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICggIXVzZXJtYXBbIGVudHJ5LnVzZXJJZCBdICkge1xuICAgICAgICAgICAgICAgICAgdXNlcm1hcFsgZW50cnkudXNlcklkIF0gPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCAhdXNlcm1hcFsgZW50cnkudXNlcklkIF1bIGxvY2FsZSBdICkge1xuICAgICAgICAgICAgICAgICAgdXNlcm1hcFsgZW50cnkudXNlcklkIF1bIGxvY2FsZSBdID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICggIXVzZXJtYXBbIGVudHJ5LnVzZXJJZCBdWyBsb2NhbGUgXS5pbmNsdWRlcyggcmVwbyApICkge1xuICAgICAgICAgICAgICAgICAgdXNlcm1hcFsgZW50cnkudXNlcklkIF1bIGxvY2FsZSBdLnB1c2goIHJlcG8gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgICAgY2F0Y2goIGUgKSB7XG4gICAgICAgIC8vIFdlIGV4cGVjdCB1bnB1Ymxpc2hlZCBvciB0ZXN0IHJlcG9zIHRvIGhhdmUgbm8gdHJhbnNsYXRpb25zXG4gICAgICAgIGlmICggZS5jb2RlID09PSAnRU5PRU5UJyApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyggYElORk86IG5vIGxvY2FsaXplZCBmaWxlcyBmb3VuZCBmb3IgJHtyZXBvfWAgKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDYXRjaC1hbGxcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coICdXQVJOOiAnLCBlICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ICk7XG5cbi8vIFBSRVBBUkUgUVVFVUVcbiAgICBjb25zdCB1cmxQYXRoID0gJ2h0dHBzOi8vcGhldC5jb2xvcmFkby5lZHUvc2VydmljZXMvYWRkLWh0bWwtdHJhbnNsYXRvcj8nO1xuICAgIGNvbnN0IHJlcXVlc3RzID0gW107XG4gICAgZm9yICggY29uc3QgdXNlciBpbiB1c2VybWFwICkge1xuICAgICAgaWYgKCB1c2VybWFwLmhhc093blByb3BlcnR5KCB1c2VyICkgKSB7XG4gICAgICAgIGZvciAoIGNvbnN0IGxvY2FsZSBpbiB1c2VybWFwWyB1c2VyIF0gKSB7XG4gICAgICAgICAgaWYgKCB1c2VybWFwWyB1c2VyIF0uaGFzT3duUHJvcGVydHkoIGxvY2FsZSApICkge1xuICAgICAgICAgICAgdXNlcm1hcFsgdXNlciBdWyBsb2NhbGUgXS5mb3JFYWNoKCBhc3luYyByZXBvID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgcGFyYW1TdHJpbmcgPSBgc2ltTmFtZT0ke3JlcG9cbiAgICAgICAgICAgICAgfSZsb2NhbGU9JHtsb2NhbGVcbiAgICAgICAgICAgICAgfSZ1c2VySWQ9JHt1c2VyXG4gICAgICAgICAgICAgIH0mYXV0aG9yaXphdGlvbkNvZGU9JHt0cmFuc2xhdG9yQXV0aENvZGV9YDtcbiAgICAgICAgICAgICAgcmVxdWVzdHMucHVzaCggdXJsUGF0aCArIHBhcmFtU3RyaW5nICk7XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG5cbi8vIFNFTkQgSFRUUCBSRVFVRVNUU1xuICAgIGxldCBpID0gMDtcbiAgICBjb25zdCBnZXQgPSBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyggYEZldGNoaW5nICR7cmVxdWVzdHNbIGkgXX1gICk7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKCByZXF1ZXN0c1sgaSBdICk7XG4gICAgICBpZiAoIHJlc3BvbnNlLnN0YXR1cyA8IDIwMCB8fCByZXNwb25zZS5zdGF0dXMgPiAyOTkgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCBgRVJST1I6ICR7cmVzcG9uc2Uuc3RhdHVzfSAke3Jlc3BvbnNlLnN0YXR1c1RleHR9YCApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCBgU1VDQ0VTUzogJHtyZXNwb25zZS5zdGF0dXN9YCApO1xuICAgICAgfVxuICAgICAgaSArPSAxO1xuICAgICAgaWYgKCBpIDwgcmVxdWVzdHMubGVuZ3RoICkge1xuICAgICAgICBnZXQoKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyggJ0ZJTklTSEVEIScgKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHRyeSB7XG4gICAgICBnZXQoKTtcbiAgICB9XG4gICAgY2F0Y2goIGUgKSB7XG4gICAgICBjb25zb2xlLmxvZyggJ0VSUk9SOiAnLCBlICk7XG4gICAgfVxuICB9XG59Il0sIm5hbWVzIjpbImJ1aWxkTG9jYWwiLCJyZXF1aXJlIiwiZmV0Y2giLCJmcyIsInRyYW5zbGF0b3JBdXRoQ29kZSIsImNvbnNvbGUiLCJsb2ciLCJyZXBvcyIsImVycm9yIiwicmVhZEZpbGVTeW5jIiwiX19kaXJuYW1lIiwidG9TdHJpbmciLCJzcGxpdCIsImZpbHRlciIsImUiLCJ1c2VybWFwIiwiZm9yRWFjaCIsInJlcG8iLCJyZXBvUGF0aCIsInJlYWRkaXJTeW5jIiwibG9jYWxpemVkRmlsZW5hbWUiLCJsb2NhbGUiLCJzbGljZSIsImxlbmd0aCIsImluZGV4T2YiLCJjb250ZW50IiwiSlNPTiIsInBhcnNlIiwic3RyaW5nS2V5IiwiaGFzT3duUHJvcGVydHkiLCJoaXN0b3J5IiwiZW50cnkiLCJ1c2VySWQiLCJpbmNsdWRlcyIsInB1c2giLCJjb2RlIiwidXJsUGF0aCIsInJlcXVlc3RzIiwidXNlciIsInBhcmFtU3RyaW5nIiwiaSIsImdldCIsInJlc3BvbnNlIiwic3RhdHVzIiwic3RhdHVzVGV4dCJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7OztFQUtFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVGLE1BQU1BLGFBQWFDLFFBQVM7QUFDNUIsTUFBTUMsUUFBUUQsUUFBUyxlQUFnQixtREFBbUQ7QUFDMUYsTUFBTUUsS0FBS0YsUUFBUztBQUVw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