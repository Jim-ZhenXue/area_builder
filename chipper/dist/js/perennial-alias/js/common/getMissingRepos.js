// Copyright 2020, University of Colorado Boulder
/**
 * Returns the list of repos listed in active-repos that are not checked out.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ const getRepoList = require('./getRepoList');
const fs = require('fs');
/**
 * Returns the list of repos listed in active-repos that are not checked out.
 * @public
 *
 * @returns {Array.<string>}
 */ module.exports = function() {
    const activeRepos = getRepoList('active-repos');
    const missingRepos = [];
    for (const repo of activeRepos){
        if (!fs.existsSync(`../${repo}`)) {
            missingRepos.push(repo);
        }
    }
    return missingRepos;
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2V0TWlzc2luZ1JlcG9zLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBsaXN0IG9mIHJlcG9zIGxpc3RlZCBpbiBhY3RpdmUtcmVwb3MgdGhhdCBhcmUgbm90IGNoZWNrZWQgb3V0LlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBnZXRSZXBvTGlzdCA9IHJlcXVpcmUoICcuL2dldFJlcG9MaXN0JyApO1xuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbGlzdCBvZiByZXBvcyBsaXN0ZWQgaW4gYWN0aXZlLXJlcG9zIHRoYXQgYXJlIG5vdCBjaGVja2VkIG91dC5cbiAqIEBwdWJsaWNcbiAqXG4gKiBAcmV0dXJucyB7QXJyYXkuPHN0cmluZz59XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIGNvbnN0IGFjdGl2ZVJlcG9zID0gZ2V0UmVwb0xpc3QoICdhY3RpdmUtcmVwb3MnICk7XG4gIGNvbnN0IG1pc3NpbmdSZXBvcyA9IFtdO1xuXG4gIGZvciAoIGNvbnN0IHJlcG8gb2YgYWN0aXZlUmVwb3MgKSB7XG4gICAgaWYgKCAhZnMuZXhpc3RzU3luYyggYC4uLyR7cmVwb31gICkgKSB7XG4gICAgICBtaXNzaW5nUmVwb3MucHVzaCggcmVwbyApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtaXNzaW5nUmVwb3M7XG59OyJdLCJuYW1lcyI6WyJnZXRSZXBvTGlzdCIsInJlcXVpcmUiLCJmcyIsIm1vZHVsZSIsImV4cG9ydHMiLCJhY3RpdmVSZXBvcyIsIm1pc3NpbmdSZXBvcyIsInJlcG8iLCJleGlzdHNTeW5jIiwicHVzaCJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUMsR0FFRCxNQUFNQSxjQUFjQyxRQUFTO0FBQzdCLE1BQU1DLEtBQUtELFFBQVM7QUFFcEI7Ozs7O0NBS0MsR0FDREUsT0FBT0MsT0FBTyxHQUFHO0lBQ2YsTUFBTUMsY0FBY0wsWUFBYTtJQUNqQyxNQUFNTSxlQUFlLEVBQUU7SUFFdkIsS0FBTSxNQUFNQyxRQUFRRixZQUFjO1FBQ2hDLElBQUssQ0FBQ0gsR0FBR00sVUFBVSxDQUFFLENBQUMsR0FBRyxFQUFFRCxNQUFNLEdBQUs7WUFDcENELGFBQWFHLElBQUksQ0FBRUY7UUFDckI7SUFDRjtJQUVBLE9BQU9EO0FBQ1QifQ==