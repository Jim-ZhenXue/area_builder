// Copyright 2023, University of Colorado Boulder
// @author Matt Pennington (PhET Interactive Simulations)
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
const fs = require('fs');
const execute = require('./execute').default;
const gitCloneDirectory = require('./gitCloneDirectory');
module.exports = /*#__PURE__*/ function() {
    var _gitCloneOrFetchDirectory = _async_to_generator(function*(repo, directory) {
        const repoPwd = `${directory}/${repo}`;
        if (!fs.existsSync(`${directory}/${repo}`)) {
            yield gitCloneDirectory(repo, directory);
        } else {
            yield execute('git', [
                'fetch'
            ], repoPwd);
        }
    });
    function gitCloneOrFetchDirectory(repo, directory) {
        return _gitCloneOrFetchDirectory.apply(this, arguments);
    }
    return gitCloneOrFetchDirectory;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2l0Q2xvbmVPckZldGNoRGlyZWN0b3J5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbi8vIEBhdXRob3IgTWF0dCBQZW5uaW5ndG9uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuXG5cbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuL2V4ZWN1dGUnICkuZGVmYXVsdDtcbmNvbnN0IGdpdENsb25lRGlyZWN0b3J5ID0gcmVxdWlyZSggJy4vZ2l0Q2xvbmVEaXJlY3RvcnknICk7XG5cbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24gZ2l0Q2xvbmVPckZldGNoRGlyZWN0b3J5KCByZXBvLCBkaXJlY3RvcnkgKSB7XG4gIGNvbnN0IHJlcG9Qd2QgPSBgJHtkaXJlY3Rvcnl9LyR7cmVwb31gO1xuXG4gIGlmICggIWZzLmV4aXN0c1N5bmMoIGAke2RpcmVjdG9yeX0vJHtyZXBvfWAgKSApIHtcbiAgICBhd2FpdCBnaXRDbG9uZURpcmVjdG9yeSggcmVwbywgZGlyZWN0b3J5ICk7XG4gIH1cbiAgZWxzZSB7XG4gICAgYXdhaXQgZXhlY3V0ZSggJ2dpdCcsIFsgJ2ZldGNoJyBdLCByZXBvUHdkICk7XG4gIH1cbn07Il0sIm5hbWVzIjpbImZzIiwicmVxdWlyZSIsImV4ZWN1dGUiLCJkZWZhdWx0IiwiZ2l0Q2xvbmVEaXJlY3RvcnkiLCJtb2R1bGUiLCJleHBvcnRzIiwiZ2l0Q2xvbmVPckZldGNoRGlyZWN0b3J5IiwicmVwbyIsImRpcmVjdG9yeSIsInJlcG9Qd2QiLCJleGlzdHNTeW5jIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFDakQseURBQXlEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHekQsTUFBTUEsS0FBS0MsUUFBUztBQUNwQixNQUFNQyxVQUFVRCxRQUFTLGFBQWNFLE9BQU87QUFDOUMsTUFBTUMsb0JBQW9CSCxRQUFTO0FBRW5DSSxPQUFPQyxPQUFPO1FBQWtCQyw0QkFBZixvQkFBQSxVQUF5Q0MsSUFBSSxFQUFFQyxTQUFTO1FBQ3ZFLE1BQU1DLFVBQVUsR0FBR0QsVUFBVSxDQUFDLEVBQUVELE1BQU07UUFFdEMsSUFBSyxDQUFDUixHQUFHVyxVQUFVLENBQUUsR0FBR0YsVUFBVSxDQUFDLEVBQUVELE1BQU0sR0FBSztZQUM5QyxNQUFNSixrQkFBbUJJLE1BQU1DO1FBQ2pDLE9BQ0s7WUFDSCxNQUFNUCxRQUFTLE9BQU87Z0JBQUU7YUFBUyxFQUFFUTtRQUNyQztJQUNGO2FBVGdDSCx5QkFBMEJDLElBQUksRUFBRUMsU0FBUztlQUF6Q0Y7O1dBQUFBIn0=