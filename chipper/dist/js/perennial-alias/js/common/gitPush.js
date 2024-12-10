// Copyright 2017, University of Colorado Boulder
/**
 * git push
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ const execute = require('./execute').default;
const winston = require('winston');
/**
 * Executes git push
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string} remoteBranch - The branch that is getting pushed to, e.g. 'main' or '1.0'
 * @returns {Promise.<string>} - Stdout
 * @rejects {ExecuteError}
 */ module.exports = function(repo, remoteBranch) {
    winston.info(`git push on ${repo} to ${remoteBranch}`);
    return execute('git', [
        'push',
        '-u',
        'origin',
        remoteBranch
    ], `../${repo}`);
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2l0UHVzaC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogZ2l0IHB1c2hcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuL2V4ZWN1dGUnICkuZGVmYXVsdDtcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcblxuLyoqXG4gKiBFeGVjdXRlcyBnaXQgcHVzaFxuICogQHB1YmxpY1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvIC0gVGhlIHJlcG9zaXRvcnkgbmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IHJlbW90ZUJyYW5jaCAtIFRoZSBicmFuY2ggdGhhdCBpcyBnZXR0aW5nIHB1c2hlZCB0bywgZS5nLiAnbWFpbicgb3IgJzEuMCdcbiAqIEByZXR1cm5zIHtQcm9taXNlLjxzdHJpbmc+fSAtIFN0ZG91dFxuICogQHJlamVjdHMge0V4ZWN1dGVFcnJvcn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggcmVwbywgcmVtb3RlQnJhbmNoICkge1xuICB3aW5zdG9uLmluZm8oIGBnaXQgcHVzaCBvbiAke3JlcG99IHRvICR7cmVtb3RlQnJhbmNofWAgKTtcblxuICByZXR1cm4gZXhlY3V0ZSggJ2dpdCcsIFsgJ3B1c2gnLCAnLXUnLCAnb3JpZ2luJywgcmVtb3RlQnJhbmNoIF0sIGAuLi8ke3JlcG99YCApO1xufTsiXSwibmFtZXMiOlsiZXhlY3V0ZSIsInJlcXVpcmUiLCJkZWZhdWx0Iiwid2luc3RvbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJyZXBvIiwicmVtb3RlQnJhbmNoIiwiaW5mbyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUMsR0FFRCxNQUFNQSxVQUFVQyxRQUFTLGFBQWNDLE9BQU87QUFDOUMsTUFBTUMsVUFBVUYsUUFBUztBQUV6Qjs7Ozs7Ozs7Q0FRQyxHQUNERyxPQUFPQyxPQUFPLEdBQUcsU0FBVUMsSUFBSSxFQUFFQyxZQUFZO0lBQzNDSixRQUFRSyxJQUFJLENBQUUsQ0FBQyxZQUFZLEVBQUVGLEtBQUssSUFBSSxFQUFFQyxjQUFjO0lBRXRELE9BQU9QLFFBQVMsT0FBTztRQUFFO1FBQVE7UUFBTTtRQUFVTztLQUFjLEVBQUUsQ0FBQyxHQUFHLEVBQUVELE1BQU07QUFDL0UifQ==