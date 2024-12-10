// Copyright 2023, University of Colorado Boulder
/**
 * Returns an inverse string map (stringMap[ stringKey ][ locale ]) for all strings in a given repo.
 *
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
const loadJSON = require('../common/loadJSON');
const fs = require('fs');
/**
 * Returns an inverse string map (stringMap[ stringKey ][ locale ]) for all strings in a given repo.
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string} checkoutDir
 * @returns {Promise.<stringMap[ stringKey ][ locale ]>}
 */ module.exports = /*#__PURE__*/ function() {
    var _getRepoStringMap = _async_to_generator(function*(repo, checkoutDir) {
        // partialKeyMap[ partialStringKey ][ locale ] = stringValue
        const partialKeyMap = {};
        // If we're not a repo with strings
        if (!fs.existsSync(`${checkoutDir}/${repo}/${repo}-strings_en.json`)) {
            return {};
        }
        const packageJSON = yield loadJSON(`${checkoutDir}/${repo}/package.json`);
        const requirejsNamespace = packageJSON.phet.requirejsNamespace;
        const englishStrings = yield loadJSON(`${checkoutDir}/${repo}/${repo}-strings_en.json`);
        // Support recursive structure of English string files. Tests for `value: <<string type>>` to determine if it's a string.
        // Fills partialKeyMap
        (function recur(stringStructure, stringKeyParts) {
            if (typeof stringStructure.value === 'string') {
                partialKeyMap[stringKeyParts.join('.')] = {
                    en: stringStructure.value
                };
            }
            Object.keys(stringStructure).forEach((partialKey)=>{
                if (typeof stringStructure[partialKey] === 'object') {
                    recur(stringStructure[partialKey], [
                        ...stringKeyParts,
                        partialKey
                    ]);
                }
            });
        })(englishStrings, []);
        // Fill partialKeyMap with other locales (if the directory in babel exists)
        if (fs.existsSync(`${checkoutDir}/babel/${repo}`)) {
            for (const stringFilename of fs.readdirSync(`${checkoutDir}/babel/${repo}`)){
                const localeStrings = yield loadJSON(`${checkoutDir}/babel/${repo}/${stringFilename}`);
                // Extract locale from filename
                const firstUnderscoreIndex = stringFilename.indexOf('_');
                const periodIndex = stringFilename.indexOf('.');
                const locale = stringFilename.substring(firstUnderscoreIndex + 1, periodIndex);
                Object.keys(localeStrings).forEach((partialStringKey)=>{
                    if (partialKeyMap[partialStringKey]) {
                        partialKeyMap[partialStringKey][locale] = localeStrings[partialStringKey].value;
                    }
                });
            }
        }
        // result[ stringKey ][ locale ] = stringValue
        const result = {};
        // Prepend the requirejsNamespace to the string keys
        Object.keys(partialKeyMap).forEach((partialKey)=>{
            result[`${requirejsNamespace}/${partialKey}`] = partialKeyMap[partialKey];
        });
        return result;
    });
    function getRepoStringMap(repo, checkoutDir) {
        return _getRepoStringMap.apply(this, arguments);
    }
    return getRepoStringMap;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9idWlsZC1zZXJ2ZXIvZ2V0UmVwb1N0cmluZ01hcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUmV0dXJucyBhbiBpbnZlcnNlIHN0cmluZyBtYXAgKHN0cmluZ01hcFsgc3RyaW5nS2V5IF1bIGxvY2FsZSBdKSBmb3IgYWxsIHN0cmluZ3MgaW4gYSBnaXZlbiByZXBvLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBsb2FkSlNPTiA9IHJlcXVpcmUoICcuLi9jb21tb24vbG9hZEpTT04nICk7XG5jb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIGludmVyc2Ugc3RyaW5nIG1hcCAoc3RyaW5nTWFwWyBzdHJpbmdLZXkgXVsgbG9jYWxlIF0pIGZvciBhbGwgc3RyaW5ncyBpbiBhIGdpdmVuIHJlcG8uXG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSBUaGUgcmVwb3NpdG9yeSBuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gY2hlY2tvdXREaXJcbiAqIEByZXR1cm5zIHtQcm9taXNlLjxzdHJpbmdNYXBbIHN0cmluZ0tleSBdWyBsb2NhbGUgXT59XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24gZ2V0UmVwb1N0cmluZ01hcCggcmVwbywgY2hlY2tvdXREaXIgKSB7XG5cbiAgLy8gcGFydGlhbEtleU1hcFsgcGFydGlhbFN0cmluZ0tleSBdWyBsb2NhbGUgXSA9IHN0cmluZ1ZhbHVlXG4gIGNvbnN0IHBhcnRpYWxLZXlNYXAgPSB7fTtcblxuICAvLyBJZiB3ZSdyZSBub3QgYSByZXBvIHdpdGggc3RyaW5nc1xuICBpZiAoICFmcy5leGlzdHNTeW5jKCBgJHtjaGVja291dERpcn0vJHtyZXBvfS8ke3JlcG99LXN0cmluZ3NfZW4uanNvbmAgKSApIHtcbiAgICByZXR1cm4ge307XG4gIH1cblxuICBjb25zdCBwYWNrYWdlSlNPTiA9IGF3YWl0IGxvYWRKU09OKCBgJHtjaGVja291dERpcn0vJHtyZXBvfS9wYWNrYWdlLmpzb25gICk7XG4gIGNvbnN0IHJlcXVpcmVqc05hbWVzcGFjZSA9IHBhY2thZ2VKU09OLnBoZXQucmVxdWlyZWpzTmFtZXNwYWNlO1xuXG4gIGNvbnN0IGVuZ2xpc2hTdHJpbmdzID0gYXdhaXQgbG9hZEpTT04oIGAke2NoZWNrb3V0RGlyfS8ke3JlcG99LyR7cmVwb30tc3RyaW5nc19lbi5qc29uYCApO1xuXG4gIC8vIFN1cHBvcnQgcmVjdXJzaXZlIHN0cnVjdHVyZSBvZiBFbmdsaXNoIHN0cmluZyBmaWxlcy4gVGVzdHMgZm9yIGB2YWx1ZTogPDxzdHJpbmcgdHlwZT4+YCB0byBkZXRlcm1pbmUgaWYgaXQncyBhIHN0cmluZy5cbiAgLy8gRmlsbHMgcGFydGlhbEtleU1hcFxuICAoIGZ1bmN0aW9uIHJlY3VyKCBzdHJpbmdTdHJ1Y3R1cmUsIHN0cmluZ0tleVBhcnRzICkge1xuICAgIGlmICggdHlwZW9mIHN0cmluZ1N0cnVjdHVyZS52YWx1ZSA9PT0gJ3N0cmluZycgKSB7XG4gICAgICBwYXJ0aWFsS2V5TWFwWyBzdHJpbmdLZXlQYXJ0cy5qb2luKCAnLicgKSBdID0ge1xuICAgICAgICBlbjogc3RyaW5nU3RydWN0dXJlLnZhbHVlXG4gICAgICB9O1xuICAgIH1cbiAgICBPYmplY3Qua2V5cyggc3RyaW5nU3RydWN0dXJlICkuZm9yRWFjaCggcGFydGlhbEtleSA9PiB7XG4gICAgICBpZiAoIHR5cGVvZiBzdHJpbmdTdHJ1Y3R1cmVbIHBhcnRpYWxLZXkgXSA9PT0gJ29iamVjdCcgKSB7XG4gICAgICAgIHJlY3VyKCBzdHJpbmdTdHJ1Y3R1cmVbIHBhcnRpYWxLZXkgXSwgWyAuLi5zdHJpbmdLZXlQYXJ0cywgcGFydGlhbEtleSBdICk7XG4gICAgICB9XG4gICAgfSApO1xuICB9ICkoIGVuZ2xpc2hTdHJpbmdzLCBbXSApO1xuXG4gIC8vIEZpbGwgcGFydGlhbEtleU1hcCB3aXRoIG90aGVyIGxvY2FsZXMgKGlmIHRoZSBkaXJlY3RvcnkgaW4gYmFiZWwgZXhpc3RzKVxuICBpZiAoIGZzLmV4aXN0c1N5bmMoIGAke2NoZWNrb3V0RGlyfS9iYWJlbC8ke3JlcG99YCApICkge1xuICAgIGZvciAoIGNvbnN0IHN0cmluZ0ZpbGVuYW1lIG9mIGZzLnJlYWRkaXJTeW5jKCBgJHtjaGVja291dERpcn0vYmFiZWwvJHtyZXBvfWAgKSApIHtcbiAgICAgIGNvbnN0IGxvY2FsZVN0cmluZ3MgPSBhd2FpdCBsb2FkSlNPTiggYCR7Y2hlY2tvdXREaXJ9L2JhYmVsLyR7cmVwb30vJHtzdHJpbmdGaWxlbmFtZX1gICk7XG5cbiAgICAgIC8vIEV4dHJhY3QgbG9jYWxlIGZyb20gZmlsZW5hbWVcbiAgICAgIGNvbnN0IGZpcnN0VW5kZXJzY29yZUluZGV4ID0gc3RyaW5nRmlsZW5hbWUuaW5kZXhPZiggJ18nICk7XG4gICAgICBjb25zdCBwZXJpb2RJbmRleCA9IHN0cmluZ0ZpbGVuYW1lLmluZGV4T2YoICcuJyApO1xuICAgICAgY29uc3QgbG9jYWxlID0gc3RyaW5nRmlsZW5hbWUuc3Vic3RyaW5nKCBmaXJzdFVuZGVyc2NvcmVJbmRleCArIDEsIHBlcmlvZEluZGV4ICk7XG5cbiAgICAgIE9iamVjdC5rZXlzKCBsb2NhbGVTdHJpbmdzICkuZm9yRWFjaCggcGFydGlhbFN0cmluZ0tleSA9PiB7XG4gICAgICAgIGlmICggcGFydGlhbEtleU1hcFsgcGFydGlhbFN0cmluZ0tleSBdICkge1xuICAgICAgICAgIHBhcnRpYWxLZXlNYXBbIHBhcnRpYWxTdHJpbmdLZXkgXVsgbG9jYWxlIF0gPSBsb2NhbGVTdHJpbmdzWyBwYXJ0aWFsU3RyaW5nS2V5IF0udmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICB9XG4gIH1cblxuICAvLyByZXN1bHRbIHN0cmluZ0tleSBdWyBsb2NhbGUgXSA9IHN0cmluZ1ZhbHVlXG4gIGNvbnN0IHJlc3VsdCA9IHt9O1xuXG4gIC8vIFByZXBlbmQgdGhlIHJlcXVpcmVqc05hbWVzcGFjZSB0byB0aGUgc3RyaW5nIGtleXNcbiAgT2JqZWN0LmtleXMoIHBhcnRpYWxLZXlNYXAgKS5mb3JFYWNoKCBwYXJ0aWFsS2V5ID0+IHtcbiAgICByZXN1bHRbIGAke3JlcXVpcmVqc05hbWVzcGFjZX0vJHtwYXJ0aWFsS2V5fWAgXSA9IHBhcnRpYWxLZXlNYXBbIHBhcnRpYWxLZXkgXTtcbiAgfSApO1xuXG4gIHJldHVybiByZXN1bHQ7XG59OyJdLCJuYW1lcyI6WyJsb2FkSlNPTiIsInJlcXVpcmUiLCJmcyIsIm1vZHVsZSIsImV4cG9ydHMiLCJnZXRSZXBvU3RyaW5nTWFwIiwicmVwbyIsImNoZWNrb3V0RGlyIiwicGFydGlhbEtleU1hcCIsImV4aXN0c1N5bmMiLCJwYWNrYWdlSlNPTiIsInJlcXVpcmVqc05hbWVzcGFjZSIsInBoZXQiLCJlbmdsaXNoU3RyaW5ncyIsInJlY3VyIiwic3RyaW5nU3RydWN0dXJlIiwic3RyaW5nS2V5UGFydHMiLCJ2YWx1ZSIsImpvaW4iLCJlbiIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwicGFydGlhbEtleSIsInN0cmluZ0ZpbGVuYW1lIiwicmVhZGRpclN5bmMiLCJsb2NhbGVTdHJpbmdzIiwiZmlyc3RVbmRlcnNjb3JlSW5kZXgiLCJpbmRleE9mIiwicGVyaW9kSW5kZXgiLCJsb2NhbGUiLCJzdWJzdHJpbmciLCJwYXJ0aWFsU3RyaW5nS2V5IiwicmVzdWx0Il0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxXQUFXQyxRQUFTO0FBQzFCLE1BQU1DLEtBQUtELFFBQVM7QUFFcEI7Ozs7Ozs7Q0FPQyxHQUNERSxPQUFPQyxPQUFPO1FBQWtCQyxv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