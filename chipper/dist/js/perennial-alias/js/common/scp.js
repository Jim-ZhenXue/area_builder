// Copyright 2017, University of Colorado Boulder
/**
 * Transfers a file (or directory recursively) to a remote server.
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
const winston = require('winston');
/**
 * Transfers a file (or directory recursively) to a remote server.
 * @public
 *
 * @param {string} username
 * @param {string} host
 * @param {string} localFile - A file, directory or glob pattern. Basically the first part of the SCP command
 * @param {string} remoteFile - A file or directory. Basically the second part of the SCP command (minus the host/username)
 * @returns {Promise.<string>} - Stdout
 * @rejects {ExecuteError}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(username, host, localFile, remoteFile) {
    winston.info(`transferring ${localFile} remotely to ${remoteFile} on ${host} from ${yield execute('pwd', [], '.')}`);
    return execute('scp', [
        '-r',
        localFile,
        `${username}@${host}:${remoteFile}`
    ], '.');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vc2NwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBUcmFuc2ZlcnMgYSBmaWxlIChvciBkaXJlY3RvcnkgcmVjdXJzaXZlbHkpIHRvIGEgcmVtb3RlIHNlcnZlci5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuL2V4ZWN1dGUnICkuZGVmYXVsdDtcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcblxuLyoqXG4gKiBUcmFuc2ZlcnMgYSBmaWxlIChvciBkaXJlY3RvcnkgcmVjdXJzaXZlbHkpIHRvIGEgcmVtb3RlIHNlcnZlci5cbiAqIEBwdWJsaWNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXNlcm5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBob3N0XG4gKiBAcGFyYW0ge3N0cmluZ30gbG9jYWxGaWxlIC0gQSBmaWxlLCBkaXJlY3Rvcnkgb3IgZ2xvYiBwYXR0ZXJuLiBCYXNpY2FsbHkgdGhlIGZpcnN0IHBhcnQgb2YgdGhlIFNDUCBjb21tYW5kXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVtb3RlRmlsZSAtIEEgZmlsZSBvciBkaXJlY3RvcnkuIEJhc2ljYWxseSB0aGUgc2Vjb25kIHBhcnQgb2YgdGhlIFNDUCBjb21tYW5kIChtaW51cyB0aGUgaG9zdC91c2VybmFtZSlcbiAqIEByZXR1cm5zIHtQcm9taXNlLjxzdHJpbmc+fSAtIFN0ZG91dFxuICogQHJlamVjdHMge0V4ZWN1dGVFcnJvcn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiggdXNlcm5hbWUsIGhvc3QsIGxvY2FsRmlsZSwgcmVtb3RlRmlsZSApIHtcbiAgd2luc3Rvbi5pbmZvKCBgdHJhbnNmZXJyaW5nICR7bG9jYWxGaWxlfSByZW1vdGVseSB0byAke3JlbW90ZUZpbGV9IG9uICR7aG9zdH0gZnJvbSAke2F3YWl0IGV4ZWN1dGUoICdwd2QnLCBbXSwgJy4nICl9YCApO1xuXG4gIHJldHVybiBleGVjdXRlKCAnc2NwJywgW1xuICAgICctcicsXG4gICAgbG9jYWxGaWxlLFxuICAgIGAke3VzZXJuYW1lfUAke2hvc3R9OiR7cmVtb3RlRmlsZX1gXG4gIF0sICcuJyApO1xufTsiXSwibmFtZXMiOlsiZXhlY3V0ZSIsInJlcXVpcmUiLCJkZWZhdWx0Iiwid2luc3RvbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJ1c2VybmFtZSIsImhvc3QiLCJsb2NhbEZpbGUiLCJyZW1vdGVGaWxlIiwiaW5mbyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsVUFBVUMsUUFBUyxhQUFjQyxPQUFPO0FBQzlDLE1BQU1DLFVBQVVGLFFBQVM7QUFFekI7Ozs7Ozs7Ozs7Q0FVQyxHQUNERyxPQUFPQyxPQUFPLHFDQUFHLFVBQWdCQyxRQUFRLEVBQUVDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxVQUFVO0lBQ3BFTixRQUFRTyxJQUFJLENBQUUsQ0FBQyxhQUFhLEVBQUVGLFVBQVUsYUFBYSxFQUFFQyxXQUFXLElBQUksRUFBRUYsS0FBSyxNQUFNLEVBQUUsTUFBTVAsUUFBUyxPQUFPLEVBQUUsRUFBRSxNQUFPO0lBRXRILE9BQU9BLFFBQVMsT0FBTztRQUNyQjtRQUNBUTtRQUNBLEdBQUdGLFNBQVMsQ0FBQyxFQUFFQyxLQUFLLENBQUMsRUFBRUUsWUFBWTtLQUNwQyxFQUFFO0FBQ0wifQ==