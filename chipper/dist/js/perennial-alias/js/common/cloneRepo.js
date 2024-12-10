// Copyright 2017, University of Colorado Boulder
/**
 * Clones the given repo name into the working copy
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ const execute = require('./execute').default;
const winston = require('winston');
/**
 * Clones the given repo name into the working copy
 * @public
 *
 * @param {string} repo - The repository name
 * @returns {Promise}
 */ module.exports = function(repo) {
    winston.info(`cloning ${repo}`);
    if (repo === 'perennial-alias') {
        return execute('git', [
            'clone',
            'https://github.com/phetsims/perennial.git',
            'perennial-alias'
        ], '../');
    } else {
        return execute('git', [
            'clone',
            `https://github.com/phetsims/${repo}.git`
        ], '../');
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vY2xvbmVSZXBvLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDbG9uZXMgdGhlIGdpdmVuIHJlcG8gbmFtZSBpbnRvIHRoZSB3b3JraW5nIGNvcHlcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuL2V4ZWN1dGUnICkuZGVmYXVsdDtcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcblxuLyoqXG4gKiBDbG9uZXMgdGhlIGdpdmVuIHJlcG8gbmFtZSBpbnRvIHRoZSB3b3JraW5nIGNvcHlcbiAqIEBwdWJsaWNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwbyAtIFRoZSByZXBvc2l0b3J5IG5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCByZXBvICkge1xuICB3aW5zdG9uLmluZm8oIGBjbG9uaW5nICR7cmVwb31gICk7XG5cbiAgaWYgKCByZXBvID09PSAncGVyZW5uaWFsLWFsaWFzJyApIHtcbiAgICByZXR1cm4gZXhlY3V0ZSggJ2dpdCcsIFsgJ2Nsb25lJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9wZXJlbm5pYWwuZ2l0JywgJ3BlcmVubmlhbC1hbGlhcycgXSwgJy4uLycgKTtcbiAgfVxuICBlbHNlIHtcbiAgICByZXR1cm4gZXhlY3V0ZSggJ2dpdCcsIFsgJ2Nsb25lJywgYGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy8ke3JlcG99LmdpdGAgXSwgJy4uLycgKTtcbiAgfVxufTsiXSwibmFtZXMiOlsiZXhlY3V0ZSIsInJlcXVpcmUiLCJkZWZhdWx0Iiwid2luc3RvbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJyZXBvIiwiaW5mbyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUMsR0FFRCxNQUFNQSxVQUFVQyxRQUFTLGFBQWNDLE9BQU87QUFDOUMsTUFBTUMsVUFBVUYsUUFBUztBQUV6Qjs7Ozs7O0NBTUMsR0FDREcsT0FBT0MsT0FBTyxHQUFHLFNBQVVDLElBQUk7SUFDN0JILFFBQVFJLElBQUksQ0FBRSxDQUFDLFFBQVEsRUFBRUQsTUFBTTtJQUUvQixJQUFLQSxTQUFTLG1CQUFvQjtRQUNoQyxPQUFPTixRQUFTLE9BQU87WUFBRTtZQUFTO1lBQTZDO1NBQW1CLEVBQUU7SUFDdEcsT0FDSztRQUNILE9BQU9BLFFBQVMsT0FBTztZQUFFO1lBQVMsQ0FBQyw0QkFBNEIsRUFBRU0sS0FBSyxJQUFJLENBQUM7U0FBRSxFQUFFO0lBQ2pGO0FBQ0YifQ==