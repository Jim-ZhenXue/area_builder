// Copyright 2023, University of Colorado Boulder
/**
 * Returns a list of repositories (that can be run) actively handled by tooling for PhET
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ const getRepoList = require('./getRepoList');
/**
 * Returns a list of repositories (that can be run) actively handled by tooling for PhET
 * @public
 *
 * @returns {Array.<string>}
 */ module.exports = function() {
    return getRepoList('active-runnables');
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2V0QWN0aXZlUnVubmFibGVzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBSZXR1cm5zIGEgbGlzdCBvZiByZXBvc2l0b3JpZXMgKHRoYXQgY2FuIGJlIHJ1bikgYWN0aXZlbHkgaGFuZGxlZCBieSB0b29saW5nIGZvciBQaEVUXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IGdldFJlcG9MaXN0ID0gcmVxdWlyZSggJy4vZ2V0UmVwb0xpc3QnICk7XG5cbi8qKlxuICogUmV0dXJucyBhIGxpc3Qgb2YgcmVwb3NpdG9yaWVzICh0aGF0IGNhbiBiZSBydW4pIGFjdGl2ZWx5IGhhbmRsZWQgYnkgdG9vbGluZyBmb3IgUGhFVFxuICogQHB1YmxpY1xuICpcbiAqIEByZXR1cm5zIHtBcnJheS48c3RyaW5nPn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGdldFJlcG9MaXN0KCAnYWN0aXZlLXJ1bm5hYmxlcycgKTtcbn07Il0sIm5hbWVzIjpbImdldFJlcG9MaXN0IiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDLEdBRUQsTUFBTUEsY0FBY0MsUUFBUztBQUU3Qjs7Ozs7Q0FLQyxHQUNEQyxPQUFPQyxPQUFPLEdBQUc7SUFDZixPQUFPSCxZQUFhO0FBQ3RCIn0=