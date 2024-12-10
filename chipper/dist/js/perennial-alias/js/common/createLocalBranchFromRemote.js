// Copyright 2023, University of Colorado Boulder
/**
 * If your local repo does not have a remote branch, this script will grab it and set up tracking on it.
 * This script will start and end on the same, current branch the repo is on, but checkouts the `branch` param while
 * running.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Michael Kauzmann (PhET Interactive Simulations)
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
const execute = require('./execute').default;
const gitPull = require('./gitPull');
const getBranch = require('./getBranch');
const gitCheckout = require('./gitCheckout');
/**
 * If your local repo does not have a remote branch, this script will grab it and set up tracking on it.
 * This script will start and end on the same, current branch the repo is on, but checkouts the `branch` param while
 * running.
 *
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string} branch - The branch name
 * @returns {Promise<void>}
 */ module.exports = /*#__PURE__*/ function() {
    var _createLocalBranchFromRemote = _async_to_generator(function*(repo, branch) {
        const currentBranch = yield getBranch(repo);
        yield execute('git', [
            'checkout',
            '-b',
            branch,
            `origin/${branch}`
        ], `../${repo}`);
        yield gitPull(repo);
        if (branch !== '') {
            yield gitCheckout(repo, currentBranch);
        }
    });
    function createLocalBranchFromRemote(repo, branch) {
        return _createLocalBranchFromRemote.apply(this, arguments);
    }
    return createLocalBranchFromRemote;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vY3JlYXRlTG9jYWxCcmFuY2hGcm9tUmVtb3RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBJZiB5b3VyIGxvY2FsIHJlcG8gZG9lcyBub3QgaGF2ZSBhIHJlbW90ZSBicmFuY2gsIHRoaXMgc2NyaXB0IHdpbGwgZ3JhYiBpdCBhbmQgc2V0IHVwIHRyYWNraW5nIG9uIGl0LlxuICogVGhpcyBzY3JpcHQgd2lsbCBzdGFydCBhbmQgZW5kIG9uIHRoZSBzYW1lLCBjdXJyZW50IGJyYW5jaCB0aGUgcmVwbyBpcyBvbiwgYnV0IGNoZWNrb3V0cyB0aGUgYGJyYW5jaGAgcGFyYW0gd2hpbGVcbiAqIHJ1bm5pbmcuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5jb25zdCBleGVjdXRlID0gcmVxdWlyZSggJy4vZXhlY3V0ZScgKS5kZWZhdWx0O1xuY29uc3QgZ2l0UHVsbCA9IHJlcXVpcmUoICcuL2dpdFB1bGwnICk7XG5jb25zdCBnZXRCcmFuY2ggPSByZXF1aXJlKCAnLi9nZXRCcmFuY2gnICk7XG5jb25zdCBnaXRDaGVja291dCA9IHJlcXVpcmUoICcuL2dpdENoZWNrb3V0JyApO1xuXG4vKipcbiAqIElmIHlvdXIgbG9jYWwgcmVwbyBkb2VzIG5vdCBoYXZlIGEgcmVtb3RlIGJyYW5jaCwgdGhpcyBzY3JpcHQgd2lsbCBncmFiIGl0IGFuZCBzZXQgdXAgdHJhY2tpbmcgb24gaXQuXG4gKiBUaGlzIHNjcmlwdCB3aWxsIHN0YXJ0IGFuZCBlbmQgb24gdGhlIHNhbWUsIGN1cnJlbnQgYnJhbmNoIHRoZSByZXBvIGlzIG9uLCBidXQgY2hlY2tvdXRzIHRoZSBgYnJhbmNoYCBwYXJhbSB3aGlsZVxuICogcnVubmluZy5cbiAqXG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSBUaGUgcmVwb3NpdG9yeSBuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gYnJhbmNoIC0gVGhlIGJyYW5jaCBuYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiBjcmVhdGVMb2NhbEJyYW5jaEZyb21SZW1vdGUoIHJlcG8sIGJyYW5jaCApIHtcbiAgY29uc3QgY3VycmVudEJyYW5jaCA9IGF3YWl0IGdldEJyYW5jaCggcmVwbyApO1xuICBhd2FpdCBleGVjdXRlKCAnZ2l0JywgWyAnY2hlY2tvdXQnLCAnLWInLCBicmFuY2gsIGBvcmlnaW4vJHticmFuY2h9YCBdLCBgLi4vJHtyZXBvfWAgKTtcbiAgYXdhaXQgZ2l0UHVsbCggcmVwbyApO1xuXG4gIGlmICggYnJhbmNoICE9PSAnJyApIHsgLy8gb3RoZXJ3aXNlIGl0IHdvdWxkIGZhaWxcbiAgICBhd2FpdCBnaXRDaGVja291dCggcmVwbywgY3VycmVudEJyYW5jaCApO1xuICB9XG59OyJdLCJuYW1lcyI6WyJleGVjdXRlIiwicmVxdWlyZSIsImRlZmF1bHQiLCJnaXRQdWxsIiwiZ2V0QnJhbmNoIiwiZ2l0Q2hlY2tvdXQiLCJtb2R1bGUiLCJleHBvcnRzIiwiY3JlYXRlTG9jYWxCcmFuY2hGcm9tUmVtb3RlIiwicmVwbyIsImJyYW5jaCIsImN1cnJlbnRCcmFuY2giXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7Ozs7Ozs7Q0FRQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxVQUFVQyxRQUFTLGFBQWNDLE9BQU87QUFDOUMsTUFBTUMsVUFBVUYsUUFBUztBQUN6QixNQUFNRyxZQUFZSCxRQUFTO0FBQzNCLE1BQU1JLGNBQWNKLFFBQVM7QUFFN0I7Ozs7Ozs7Ozs7Q0FVQyxHQUNESyxPQUFPQyxPQUFPO1FBQWtCQywrQkFBZixvQkFBQSxVQUE0Q0MsSUFBSSxFQUFFQyxNQUFNO1FBQ3ZFLE1BQU1DLGdCQUFnQixNQUFNUCxVQUFXSztRQUN2QyxNQUFNVCxRQUFTLE9BQU87WUFBRTtZQUFZO1lBQU1VO1lBQVEsQ0FBQyxPQUFPLEVBQUVBLFFBQVE7U0FBRSxFQUFFLENBQUMsR0FBRyxFQUFFRCxNQUFNO1FBQ3BGLE1BQU1OLFFBQVNNO1FBRWYsSUFBS0MsV0FBVyxJQUFLO1lBQ25CLE1BQU1MLFlBQWFJLE1BQU1FO1FBQzNCO0lBQ0Y7YUFSZ0NILDRCQUE2QkMsSUFBSSxFQUFFQyxNQUFNO2VBQXpDRjs7V0FBQUEifQ==