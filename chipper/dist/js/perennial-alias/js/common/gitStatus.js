// Copyright 2018, University of Colorado Boulder
/**
 * Returns a combination of status information for the repository's git status
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
const execute = require('./execute').default;
const getBranch = require('./getBranch');
const getRemoteBranchSHAs = require('./getRemoteBranchSHAs');
const gitRevParse = require('./gitRevParse');
const assert = require('assert');
/**
 * Returns a combination of status information for the repository's git status
 * @public
 *
 * @param {string} repo - The repository name
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo) {
    assert(typeof repo === 'string');
    const result = {};
    // This is needed to get the below `git rev-list` with ${u} to actually compare with the remote state.
    yield execute('git', [
        'remote',
        'update'
    ], `../${repo}`);
    result.symbolicRef = yield execute('git', [
        'symbolic-ref',
        '-q',
        'HEAD'
    ], `../${repo}`);
    result.branch = yield getBranch(repo); // might be empty string
    result.sha = yield gitRevParse(repo, 'HEAD');
    result.status = yield execute('git', [
        'status',
        '--porcelain'
    ], `../${repo}`);
    if (result.branch) {
        // Safe method to get ahead/behind counts, see http://stackoverflow.com/questions/2969214/git-programmatically-know-by-how-much-the-branch-is-ahead-behind-a-remote-branc
        result.remoteSHA = (yield getRemoteBranchSHAs(repo))[result.branch];
        // get the tracking-branch name
        result.trackingBranch = yield execute('git', [
            'for-each-ref',
            '--format=\'%(upstream:short)\'',
            result.symbolicRef
        ], `../${repo}`);
        // e.g. behind-count + '\t' + ahead-count
        const counts = yield execute('git', [
            'rev-list',
            '--left-right',
            '--count',
            `${result.trackingBranch}@{u}...HEAD`
        ], `../${repo}`);
        result.behind = Number(counts.split('\t')[0]);
        result.ahead = Number(counts.split('\t')[1]);
        result.remoteDifferent = result.remoteSHA !== result.sha;
        if (result.remoteDifferent) {
            assert(result.behind > 0 || result.ahead > 0, 'We should be ahead or behind commits if our remote SHA is different than our HEAD');
        }
    }
    return result;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2l0U3RhdHVzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBSZXR1cm5zIGEgY29tYmluYXRpb24gb2Ygc3RhdHVzIGluZm9ybWF0aW9uIGZvciB0aGUgcmVwb3NpdG9yeSdzIGdpdCBzdGF0dXNcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuL2V4ZWN1dGUnICkuZGVmYXVsdDtcbmNvbnN0IGdldEJyYW5jaCA9IHJlcXVpcmUoICcuL2dldEJyYW5jaCcgKTtcbmNvbnN0IGdldFJlbW90ZUJyYW5jaFNIQXMgPSByZXF1aXJlKCAnLi9nZXRSZW1vdGVCcmFuY2hTSEFzJyApO1xuY29uc3QgZ2l0UmV2UGFyc2UgPSByZXF1aXJlKCAnLi9naXRSZXZQYXJzZScgKTtcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoICdhc3NlcnQnICk7XG5cbi8qKlxuICogUmV0dXJucyBhIGNvbWJpbmF0aW9uIG9mIHN0YXR1cyBpbmZvcm1hdGlvbiBmb3IgdGhlIHJlcG9zaXRvcnkncyBnaXQgc3RhdHVzXG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSBUaGUgcmVwb3NpdG9yeSBuYW1lXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24oIHJlcG8gKSB7XG4gIGFzc2VydCggdHlwZW9mIHJlcG8gPT09ICdzdHJpbmcnICk7XG5cbiAgY29uc3QgcmVzdWx0ID0ge307XG5cbiAgLy8gVGhpcyBpcyBuZWVkZWQgdG8gZ2V0IHRoZSBiZWxvdyBgZ2l0IHJldi1saXN0YCB3aXRoICR7dX0gdG8gYWN0dWFsbHkgY29tcGFyZSB3aXRoIHRoZSByZW1vdGUgc3RhdGUuXG4gIGF3YWl0IGV4ZWN1dGUoICdnaXQnLCBbICdyZW1vdGUnLCAndXBkYXRlJyBdLCBgLi4vJHtyZXBvfWAgKTtcblxuICByZXN1bHQuc3ltYm9saWNSZWYgPSBhd2FpdCBleGVjdXRlKCAnZ2l0JywgWyAnc3ltYm9saWMtcmVmJywgJy1xJywgJ0hFQUQnIF0sIGAuLi8ke3JlcG99YCApO1xuICByZXN1bHQuYnJhbmNoID0gYXdhaXQgZ2V0QnJhbmNoKCByZXBvICk7IC8vIG1pZ2h0IGJlIGVtcHR5IHN0cmluZ1xuICByZXN1bHQuc2hhID0gYXdhaXQgZ2l0UmV2UGFyc2UoIHJlcG8sICdIRUFEJyApO1xuICByZXN1bHQuc3RhdHVzID0gYXdhaXQgZXhlY3V0ZSggJ2dpdCcsIFsgJ3N0YXR1cycsICctLXBvcmNlbGFpbicgXSwgYC4uLyR7cmVwb31gICk7XG5cbiAgaWYgKCByZXN1bHQuYnJhbmNoICkge1xuICAgIC8vIFNhZmUgbWV0aG9kIHRvIGdldCBhaGVhZC9iZWhpbmQgY291bnRzLCBzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yOTY5MjE0L2dpdC1wcm9ncmFtbWF0aWNhbGx5LWtub3ctYnktaG93LW11Y2gtdGhlLWJyYW5jaC1pcy1haGVhZC1iZWhpbmQtYS1yZW1vdGUtYnJhbmNcblxuICAgIHJlc3VsdC5yZW1vdGVTSEEgPSAoIGF3YWl0IGdldFJlbW90ZUJyYW5jaFNIQXMoIHJlcG8gKSApWyByZXN1bHQuYnJhbmNoIF07XG5cbiAgICAvLyBnZXQgdGhlIHRyYWNraW5nLWJyYW5jaCBuYW1lXG4gICAgcmVzdWx0LnRyYWNraW5nQnJhbmNoID0gYXdhaXQgZXhlY3V0ZSggJ2dpdCcsIFsgJ2Zvci1lYWNoLXJlZicsICctLWZvcm1hdD1cXCclKHVwc3RyZWFtOnNob3J0KVxcJycsIHJlc3VsdC5zeW1ib2xpY1JlZiBdLCBgLi4vJHtyZXBvfWAgKTtcblxuICAgIC8vIGUuZy4gYmVoaW5kLWNvdW50ICsgJ1xcdCcgKyBhaGVhZC1jb3VudFxuICAgIGNvbnN0IGNvdW50cyA9IGF3YWl0IGV4ZWN1dGUoICdnaXQnLCBbICdyZXYtbGlzdCcsICctLWxlZnQtcmlnaHQnLCAnLS1jb3VudCcsIGAke3Jlc3VsdC50cmFja2luZ0JyYW5jaH1Ae3V9Li4uSEVBRGAgXSwgYC4uLyR7cmVwb31gICk7XG5cbiAgICByZXN1bHQuYmVoaW5kID0gTnVtYmVyKCBjb3VudHMuc3BsaXQoICdcXHQnIClbIDAgXSApO1xuICAgIHJlc3VsdC5haGVhZCA9IE51bWJlciggY291bnRzLnNwbGl0KCAnXFx0JyApWyAxIF0gKTtcbiAgICByZXN1bHQucmVtb3RlRGlmZmVyZW50ID0gcmVzdWx0LnJlbW90ZVNIQSAhPT0gcmVzdWx0LnNoYTtcblxuICAgIGlmICggcmVzdWx0LnJlbW90ZURpZmZlcmVudCApIHtcbiAgICAgIGFzc2VydCggcmVzdWx0LmJlaGluZCA+IDAgfHwgcmVzdWx0LmFoZWFkID4gMCwgJ1dlIHNob3VsZCBiZSBhaGVhZCBvciBiZWhpbmQgY29tbWl0cyBpZiBvdXIgcmVtb3RlIFNIQSBpcyBkaWZmZXJlbnQgdGhhbiBvdXIgSEVBRCcgKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufTsiXSwibmFtZXMiOlsiZXhlY3V0ZSIsInJlcXVpcmUiLCJkZWZhdWx0IiwiZ2V0QnJhbmNoIiwiZ2V0UmVtb3RlQnJhbmNoU0hBcyIsImdpdFJldlBhcnNlIiwiYXNzZXJ0IiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJyZXN1bHQiLCJzeW1ib2xpY1JlZiIsImJyYW5jaCIsInNoYSIsInN0YXR1cyIsInJlbW90ZVNIQSIsInRyYWNraW5nQnJhbmNoIiwiY291bnRzIiwiYmVoaW5kIiwiTnVtYmVyIiwic3BsaXQiLCJhaGVhZCIsInJlbW90ZURpZmZlcmVudCJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsVUFBVUMsUUFBUyxhQUFjQyxPQUFPO0FBQzlDLE1BQU1DLFlBQVlGLFFBQVM7QUFDM0IsTUFBTUcsc0JBQXNCSCxRQUFTO0FBQ3JDLE1BQU1JLGNBQWNKLFFBQVM7QUFDN0IsTUFBTUssU0FBU0wsUUFBUztBQUV4Qjs7Ozs7Q0FLQyxHQUNETSxPQUFPQyxPQUFPLHFDQUFHLFVBQWdCQyxJQUFJO0lBQ25DSCxPQUFRLE9BQU9HLFNBQVM7SUFFeEIsTUFBTUMsU0FBUyxDQUFDO0lBRWhCLHNHQUFzRztJQUN0RyxNQUFNVixRQUFTLE9BQU87UUFBRTtRQUFVO0tBQVUsRUFBRSxDQUFDLEdBQUcsRUFBRVMsTUFBTTtJQUUxREMsT0FBT0MsV0FBVyxHQUFHLE1BQU1YLFFBQVMsT0FBTztRQUFFO1FBQWdCO1FBQU07S0FBUSxFQUFFLENBQUMsR0FBRyxFQUFFUyxNQUFNO0lBQ3pGQyxPQUFPRSxNQUFNLEdBQUcsTUFBTVQsVUFBV00sT0FBUSx3QkFBd0I7SUFDakVDLE9BQU9HLEdBQUcsR0FBRyxNQUFNUixZQUFhSSxNQUFNO0lBQ3RDQyxPQUFPSSxNQUFNLEdBQUcsTUFBTWQsUUFBUyxPQUFPO1FBQUU7UUFBVTtLQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUVTLE1BQU07SUFFL0UsSUFBS0MsT0FBT0UsTUFBTSxFQUFHO1FBQ25CLHlLQUF5SztRQUV6S0YsT0FBT0ssU0FBUyxHQUFHLEFBQUUsQ0FBQSxNQUFNWCxvQkFBcUJLLEtBQUssQ0FBRyxDQUFFQyxPQUFPRSxNQUFNLENBQUU7UUFFekUsK0JBQStCO1FBQy9CRixPQUFPTSxjQUFjLEdBQUcsTUFBTWhCLFFBQVMsT0FBTztZQUFFO1lBQWdCO1lBQWtDVSxPQUFPQyxXQUFXO1NBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRUYsTUFBTTtRQUVwSSx5Q0FBeUM7UUFDekMsTUFBTVEsU0FBUyxNQUFNakIsUUFBUyxPQUFPO1lBQUU7WUFBWTtZQUFnQjtZQUFXLEdBQUdVLE9BQU9NLGNBQWMsQ0FBQyxXQUFXLENBQUM7U0FBRSxFQUFFLENBQUMsR0FBRyxFQUFFUCxNQUFNO1FBRW5JQyxPQUFPUSxNQUFNLEdBQUdDLE9BQVFGLE9BQU9HLEtBQUssQ0FBRSxLQUFNLENBQUUsRUFBRztRQUNqRFYsT0FBT1csS0FBSyxHQUFHRixPQUFRRixPQUFPRyxLQUFLLENBQUUsS0FBTSxDQUFFLEVBQUc7UUFDaERWLE9BQU9ZLGVBQWUsR0FBR1osT0FBT0ssU0FBUyxLQUFLTCxPQUFPRyxHQUFHO1FBRXhELElBQUtILE9BQU9ZLGVBQWUsRUFBRztZQUM1QmhCLE9BQVFJLE9BQU9RLE1BQU0sR0FBRyxLQUFLUixPQUFPVyxLQUFLLEdBQUcsR0FBRztRQUNqRDtJQUNGO0lBRUEsT0FBT1g7QUFDVCJ9