// Copyright 2017, University of Colorado Boulder
/**
 * git clones one of our repositories
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
const winston = require('winston');
const execute = require('./execute').default;
/**
 * @public
 *
 * @param {string} repo
 * @param {string} directory
 * @returns {Promise}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo, directory) {
    winston.info(`cloning repo ${repo} in ${directory}`);
    if (repo === 'perennial-alias') {
        yield execute('git', [
            'clone',
            'https://github.com/phetsims/perennial.git',
            repo
        ], directory);
    } else {
        yield execute('git', [
            'clone',
            `https://github.com/phetsims/${repo}.git`
        ], directory);
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2l0Q2xvbmVEaXJlY3RvcnkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTcsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIGdpdCBjbG9uZXMgb25lIG9mIG91ciByZXBvc2l0b3JpZXNcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuL2V4ZWN1dGUnICkuZGVmYXVsdDtcblxuLyoqXG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG9cbiAqIEBwYXJhbSB7c3RyaW5nfSBkaXJlY3RvcnlcbiAqIEByZXR1cm5zIHtQcm9taXNlfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uKCByZXBvLCBkaXJlY3RvcnkgKSB7XG4gIHdpbnN0b24uaW5mbyggYGNsb25pbmcgcmVwbyAke3JlcG99IGluICR7ZGlyZWN0b3J5fWAgKTtcbiAgaWYgKCByZXBvID09PSAncGVyZW5uaWFsLWFsaWFzJyApIHtcbiAgICBhd2FpdCBleGVjdXRlKCAnZ2l0JywgWyAnY2xvbmUnLCAnaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BlcmVubmlhbC5naXQnLCByZXBvIF0sIGRpcmVjdG9yeSApO1xuICB9XG4gIGVsc2Uge1xuICAgIGF3YWl0IGV4ZWN1dGUoICdnaXQnLCBbICdjbG9uZScsIGBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvJHtyZXBvfS5naXRgIF0sIGRpcmVjdG9yeSApO1xuICB9XG59OyJdLCJuYW1lcyI6WyJ3aW5zdG9uIiwicmVxdWlyZSIsImV4ZWN1dGUiLCJkZWZhdWx0IiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJkaXJlY3RvcnkiLCJpbmZvIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxVQUFVQyxRQUFTO0FBQ3pCLE1BQU1DLFVBQVVELFFBQVMsYUFBY0UsT0FBTztBQUU5Qzs7Ozs7O0NBTUMsR0FDREMsT0FBT0MsT0FBTyxxQ0FBRyxVQUFnQkMsSUFBSSxFQUFFQyxTQUFTO0lBQzlDUCxRQUFRUSxJQUFJLENBQUUsQ0FBQyxhQUFhLEVBQUVGLEtBQUssSUFBSSxFQUFFQyxXQUFXO0lBQ3BELElBQUtELFNBQVMsbUJBQW9CO1FBQ2hDLE1BQU1KLFFBQVMsT0FBTztZQUFFO1lBQVM7WUFBNkNJO1NBQU0sRUFBRUM7SUFDeEYsT0FDSztRQUNILE1BQU1MLFFBQVMsT0FBTztZQUFFO1lBQVMsQ0FBQyw0QkFBNEIsRUFBRUksS0FBSyxJQUFJLENBQUM7U0FBRSxFQUFFQztJQUNoRjtBQUNGIn0=