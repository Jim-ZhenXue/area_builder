// Copyright 2017, University of Colorado Boulder
/**
 * The dependencies.json of a repository
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ const loadJSON = require('./loadJSON');
const winston = require('winston');
/**
 * Executes git checkout
 * @public
 *
 * @param {string} repo - The repository name
 * @returns {Promise} - Resolves to the dependencies.json content
 */ module.exports = function getDependencies(repo) {
    winston.info(`getting dependencies.json for ${repo}`);
    return loadJSON(`../${repo}/dependencies.json`);
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2V0RGVwZW5kZW5jaWVzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBUaGUgZGVwZW5kZW5jaWVzLmpzb24gb2YgYSByZXBvc2l0b3J5XG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IGxvYWRKU09OID0gcmVxdWlyZSggJy4vbG9hZEpTT04nICk7XG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSggJ3dpbnN0b24nICk7XG5cbi8qKlxuICogRXhlY3V0ZXMgZ2l0IGNoZWNrb3V0XG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSBUaGUgcmVwb3NpdG9yeSBuYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXNvbHZlcyB0byB0aGUgZGVwZW5kZW5jaWVzLmpzb24gY29udGVudFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldERlcGVuZGVuY2llcyggcmVwbyApIHtcbiAgd2luc3Rvbi5pbmZvKCBgZ2V0dGluZyBkZXBlbmRlbmNpZXMuanNvbiBmb3IgJHtyZXBvfWAgKTtcblxuICByZXR1cm4gbG9hZEpTT04oIGAuLi8ke3JlcG99L2RlcGVuZGVuY2llcy5qc29uYCApO1xufTsiXSwibmFtZXMiOlsibG9hZEpTT04iLCJyZXF1aXJlIiwid2luc3RvbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJnZXREZXBlbmRlbmNpZXMiLCJyZXBvIiwiaW5mbyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUMsR0FFRCxNQUFNQSxXQUFXQyxRQUFTO0FBQzFCLE1BQU1DLFVBQVVELFFBQVM7QUFFekI7Ozs7OztDQU1DLEdBQ0RFLE9BQU9DLE9BQU8sR0FBRyxTQUFTQyxnQkFBaUJDLElBQUk7SUFDN0NKLFFBQVFLLElBQUksQ0FBRSxDQUFDLDhCQUE4QixFQUFFRCxNQUFNO0lBRXJELE9BQU9OLFNBQVUsQ0FBQyxHQUFHLEVBQUVNLEtBQUssa0JBQWtCLENBQUM7QUFDakQifQ==