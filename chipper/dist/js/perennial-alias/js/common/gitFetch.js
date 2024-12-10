// Copyright 2021, University of Colorado Boulder
/**
 * git fetch
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ const execute = require('./execute').default;
const winston = require('winston');
/**
 * Executes git fetch
 * @public
 *
 * @param {string} repo - The repository name
 * @returns {Promise.<string>} - Stdout
 * @rejects {ExecuteError}
 */ module.exports = function(repo) {
    winston.info(`git fetch on ${repo}`);
    return execute('git', [
        'fetch'
    ], `../${repo}`);
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2l0RmV0Y2guanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIGdpdCBmZXRjaFxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBleGVjdXRlID0gcmVxdWlyZSggJy4vZXhlY3V0ZScgKS5kZWZhdWx0O1xuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuXG4vKipcbiAqIEV4ZWN1dGVzIGdpdCBmZXRjaFxuICogQHB1YmxpY1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvIC0gVGhlIHJlcG9zaXRvcnkgbmFtZVxuICogQHJldHVybnMge1Byb21pc2UuPHN0cmluZz59IC0gU3Rkb3V0XG4gKiBAcmVqZWN0cyB7RXhlY3V0ZUVycm9yfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCByZXBvICkge1xuICB3aW5zdG9uLmluZm8oIGBnaXQgZmV0Y2ggb24gJHtyZXBvfWAgKTtcblxuICByZXR1cm4gZXhlY3V0ZSggJ2dpdCcsIFsgJ2ZldGNoJyBdLCBgLi4vJHtyZXBvfWAgKTtcbn07Il0sIm5hbWVzIjpbImV4ZWN1dGUiLCJyZXF1aXJlIiwiZGVmYXVsdCIsIndpbnN0b24iLCJtb2R1bGUiLCJleHBvcnRzIiwicmVwbyIsImluZm8iXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDLEdBRUQsTUFBTUEsVUFBVUMsUUFBUyxhQUFjQyxPQUFPO0FBQzlDLE1BQU1DLFVBQVVGLFFBQVM7QUFFekI7Ozs7Ozs7Q0FPQyxHQUNERyxPQUFPQyxPQUFPLEdBQUcsU0FBVUMsSUFBSTtJQUM3QkgsUUFBUUksSUFBSSxDQUFFLENBQUMsYUFBYSxFQUFFRCxNQUFNO0lBRXBDLE9BQU9OLFFBQVMsT0FBTztRQUFFO0tBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRU0sTUFBTTtBQUNsRCJ9