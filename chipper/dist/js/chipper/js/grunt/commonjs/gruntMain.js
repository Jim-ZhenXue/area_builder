// Copyright 2013-2024, University of Colorado Boulder
/**
 * Grunt configuration file for PhET projects. In general when possible, modules are imported lazily in their task
 * declaration to save on overall load time of this file. The pattern is to require all modules needed at the top of the
 * grunt task registration. If a module is used in multiple tasks, it is best to lazily require in each
 * task.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ const assert = require('assert');
require('../../../../perennial-alias/js/grunt/commonjs/checkNodeVersion');
const registerTasks = require('../../../../perennial-alias/js/grunt/commonjs/registerTasks');
const gruntSpawn = require('../../../../perennial-alias/js/grunt/commonjs/gruntSpawn');
const _ = require('lodash');
const { readFileSync } = require('fs');
const isOptionArg = (arg)=>arg.startsWith('--');
// Allow other Gruntfiles to potentially handle exiting and errors differently
if (!global.processEventOptOut) {
    // See https://medium.com/@dtinth/making-unhandled-promise-rejections-crash-the-node-js-process-ffc27cfcc9dd for how
    // to get unhandled promise rejections to fail out the node process.
    // Relevant for https://github.com/phetsims/wave-interference/issues/491
    process.on('unhandledRejection', (up)=>{
        throw up;
    });
    // Exit on Ctrl + C case
    process.on('SIGINT', ()=>{
        console.log('\n\nCaught interrupt signal, exiting');
        process.exit();
    });
}
module.exports = function(grunt) {
    const packageObject = JSON.parse(readFileSync('package.json', 'utf8'));
    const repo = grunt.option('repo') || packageObject.name;
    assert(typeof repo === 'string' && /^[a-z]+(-[a-z]+)*$/u.test(repo), 'repo name should be composed of lower-case characters, optionally with dashes used as separators');
    registerTasks(grunt, __dirname + '/../tasks/');
    /**
   * Creates grunt tasks that effectively get forwarded to perennial. It will execute a grunt process running from
   * perennial's directory with the same options (but with --repo={{REPO}} added, so that perennial is aware of what
   * repository is the target).
   *
   * @param {string} forwardingRepo
   * @param {string} task - The name of the task
   */ function forwardToRepo(forwardingRepo, task) {
        grunt.registerTask(task, `Run grunt --help in ${forwardingRepo} to see documentation`, ()=>{
            grunt.log.writeln(`(Forwarding task to ${forwardingRepo})`);
            const currentArgs = process.argv.slice(2); // Remove the "node grunt" from the command.
            const args = [
                task,
                ...currentArgs.filter(isOptionArg)
            ]; // only propagate options through
            // Don't duplicate repo arg
            !_.some(process.argv, (arg)=>arg.startsWith('--repo=')) && args.push(`--repo=${repo}`);
            const isWindows = /^win/.test(process.platform);
            gruntSpawn(grunt, isWindows ? 'grunt.cmd' : 'grunt', args, `../${forwardingRepo}`, (argsString)=>{
                grunt.log.verbose.writeln(`running grunt ${argsString} in ../${repo}`);
            });
        });
    }
    [
        'checkout-shas',
        'checkout-target',
        'checkout-release',
        'checkout-main',
        'checkout-main-all',
        'create-one-off',
        'sha-check',
        'sim-list',
        'npm-update',
        'create-release',
        'cherry-pick',
        'dev',
        'one-off',
        'rc',
        'production',
        'prototype',
        'create-sim',
        'generate-data',
        'release-branch-list'
    ].forEach((task)=>forwardToRepo('perennial', task));
    // Forward these to perennial-alias because they are used for building sims, and should version with sims (like chipper
    // does).
    [
        'check',
        'type-check',
        'lint',
        'lint-everything'
    ].forEach((task)=>forwardToRepo('perennial-alias', task));
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2dydW50L2NvbW1vbmpzL2dydW50TWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBHcnVudCBjb25maWd1cmF0aW9uIGZpbGUgZm9yIFBoRVQgcHJvamVjdHMuIEluIGdlbmVyYWwgd2hlbiBwb3NzaWJsZSwgbW9kdWxlcyBhcmUgaW1wb3J0ZWQgbGF6aWx5IGluIHRoZWlyIHRhc2tcbiAqIGRlY2xhcmF0aW9uIHRvIHNhdmUgb24gb3ZlcmFsbCBsb2FkIHRpbWUgb2YgdGhpcyBmaWxlLiBUaGUgcGF0dGVybiBpcyB0byByZXF1aXJlIGFsbCBtb2R1bGVzIG5lZWRlZCBhdCB0aGUgdG9wIG9mIHRoZVxuICogZ3J1bnQgdGFzayByZWdpc3RyYXRpb24uIElmIGEgbW9kdWxlIGlzIHVzZWQgaW4gbXVsdGlwbGUgdGFza3MsIGl0IGlzIGJlc3QgdG8gbGF6aWx5IHJlcXVpcmUgaW4gZWFjaFxuICogdGFzay5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoICdhc3NlcnQnICk7XG5yZXF1aXJlKCAnLi4vLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2dydW50L2NvbW1vbmpzL2NoZWNrTm9kZVZlcnNpb24nICk7XG5jb25zdCByZWdpc3RlclRhc2tzID0gcmVxdWlyZSggJy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC9jb21tb25qcy9yZWdpc3RlclRhc2tzJyApO1xuY29uc3QgZ3J1bnRTcGF3biA9IHJlcXVpcmUoICcuLi8uLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvZ3J1bnQvY29tbW9uanMvZ3J1bnRTcGF3bicgKTtcbmNvbnN0IF8gPSByZXF1aXJlKCAnbG9kYXNoJyApO1xuY29uc3QgeyByZWFkRmlsZVN5bmMgfSA9IHJlcXVpcmUoICdmcycgKTtcblxuY29uc3QgaXNPcHRpb25BcmcgPSBhcmcgPT4gYXJnLnN0YXJ0c1dpdGgoICctLScgKTtcblxuLy8gQWxsb3cgb3RoZXIgR3J1bnRmaWxlcyB0byBwb3RlbnRpYWxseSBoYW5kbGUgZXhpdGluZyBhbmQgZXJyb3JzIGRpZmZlcmVudGx5XG5pZiAoICFnbG9iYWwucHJvY2Vzc0V2ZW50T3B0T3V0ICkge1xuXG4gIC8vIFNlZSBodHRwczovL21lZGl1bS5jb20vQGR0aW50aC9tYWtpbmctdW5oYW5kbGVkLXByb21pc2UtcmVqZWN0aW9ucy1jcmFzaC10aGUtbm9kZS1qcy1wcm9jZXNzLWZmYzI3Y2ZjYzlkZCBmb3IgaG93XG4gIC8vIHRvIGdldCB1bmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb25zIHRvIGZhaWwgb3V0IHRoZSBub2RlIHByb2Nlc3MuXG4gIC8vIFJlbGV2YW50IGZvciBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvd2F2ZS1pbnRlcmZlcmVuY2UvaXNzdWVzLzQ5MVxuICBwcm9jZXNzLm9uKCAndW5oYW5kbGVkUmVqZWN0aW9uJywgdXAgPT4geyB0aHJvdyB1cDsgfSApO1xuXG4gIC8vIEV4aXQgb24gQ3RybCArIEMgY2FzZVxuICBwcm9jZXNzLm9uKCAnU0lHSU5UJywgKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKCAnXFxuXFxuQ2F1Z2h0IGludGVycnVwdCBzaWduYWwsIGV4aXRpbmcnICk7XG4gICAgcHJvY2Vzcy5leGl0KCk7XG4gIH0gKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggZ3J1bnQgKSB7XG4gIGNvbnN0IHBhY2thZ2VPYmplY3QgPSBKU09OLnBhcnNlKCByZWFkRmlsZVN5bmMoICdwYWNrYWdlLmpzb24nLCAndXRmOCcgKSApO1xuXG4gIGNvbnN0IHJlcG8gPSBncnVudC5vcHRpb24oICdyZXBvJyApIHx8IHBhY2thZ2VPYmplY3QubmFtZTtcbiAgYXNzZXJ0KCB0eXBlb2YgcmVwbyA9PT0gJ3N0cmluZycgJiYgL15bYS16XSsoLVthLXpdKykqJC91LnRlc3QoIHJlcG8gKSwgJ3JlcG8gbmFtZSBzaG91bGQgYmUgY29tcG9zZWQgb2YgbG93ZXItY2FzZSBjaGFyYWN0ZXJzLCBvcHRpb25hbGx5IHdpdGggZGFzaGVzIHVzZWQgYXMgc2VwYXJhdG9ycycgKTtcblxuICByZWdpc3RlclRhc2tzKCBncnVudCwgX19kaXJuYW1lICsgJy8uLi90YXNrcy8nICk7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgZ3J1bnQgdGFza3MgdGhhdCBlZmZlY3RpdmVseSBnZXQgZm9yd2FyZGVkIHRvIHBlcmVubmlhbC4gSXQgd2lsbCBleGVjdXRlIGEgZ3J1bnQgcHJvY2VzcyBydW5uaW5nIGZyb21cbiAgICogcGVyZW5uaWFsJ3MgZGlyZWN0b3J5IHdpdGggdGhlIHNhbWUgb3B0aW9ucyAoYnV0IHdpdGggLS1yZXBvPXt7UkVQT319IGFkZGVkLCBzbyB0aGF0IHBlcmVubmlhbCBpcyBhd2FyZSBvZiB3aGF0XG4gICAqIHJlcG9zaXRvcnkgaXMgdGhlIHRhcmdldCkuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmb3J3YXJkaW5nUmVwb1xuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFzayAtIFRoZSBuYW1lIG9mIHRoZSB0YXNrXG4gICAqL1xuICBmdW5jdGlvbiBmb3J3YXJkVG9SZXBvKCBmb3J3YXJkaW5nUmVwbywgdGFzayApIHtcbiAgICBncnVudC5yZWdpc3RlclRhc2soIHRhc2ssIGBSdW4gZ3J1bnQgLS1oZWxwIGluICR7Zm9yd2FyZGluZ1JlcG99IHRvIHNlZSBkb2N1bWVudGF0aW9uYCwgKCkgPT4ge1xuICAgICAgZ3J1bnQubG9nLndyaXRlbG4oIGAoRm9yd2FyZGluZyB0YXNrIHRvICR7Zm9yd2FyZGluZ1JlcG99KWAgKTtcbiAgICAgIGNvbnN0IGN1cnJlbnRBcmdzID0gcHJvY2Vzcy5hcmd2LnNsaWNlKCAyICk7IC8vIFJlbW92ZSB0aGUgXCJub2RlIGdydW50XCIgZnJvbSB0aGUgY29tbWFuZC5cbiAgICAgIGNvbnN0IGFyZ3MgPSBbIHRhc2ssIC4uLmN1cnJlbnRBcmdzLmZpbHRlciggaXNPcHRpb25BcmcgKSBdOyAvLyBvbmx5IHByb3BhZ2F0ZSBvcHRpb25zIHRocm91Z2hcblxuICAgICAgLy8gRG9uJ3QgZHVwbGljYXRlIHJlcG8gYXJnXG4gICAgICAhXy5zb21lKCBwcm9jZXNzLmFyZ3YsIGFyZyA9PiBhcmcuc3RhcnRzV2l0aCggJy0tcmVwbz0nICkgKSAmJiBhcmdzLnB1c2goIGAtLXJlcG89JHtyZXBvfWAgKTtcbiAgICAgIGNvbnN0IGlzV2luZG93cyA9IC9ed2luLy50ZXN0KCBwcm9jZXNzLnBsYXRmb3JtICk7XG4gICAgICBncnVudFNwYXduKCBncnVudCwgaXNXaW5kb3dzID8gJ2dydW50LmNtZCcgOiAnZ3J1bnQnLCBhcmdzLCBgLi4vJHtmb3J3YXJkaW5nUmVwb31gLCBhcmdzU3RyaW5nID0+IHtcbiAgICAgICAgZ3J1bnQubG9nLnZlcmJvc2Uud3JpdGVsbiggYHJ1bm5pbmcgZ3J1bnQgJHthcmdzU3RyaW5nfSBpbiAuLi8ke3JlcG99YCApO1xuICAgICAgfSApO1xuICAgIH0gKTtcbiAgfVxuXG4gIFtcbiAgICAnY2hlY2tvdXQtc2hhcycsXG4gICAgJ2NoZWNrb3V0LXRhcmdldCcsXG4gICAgJ2NoZWNrb3V0LXJlbGVhc2UnLFxuICAgICdjaGVja291dC1tYWluJyxcbiAgICAnY2hlY2tvdXQtbWFpbi1hbGwnLFxuICAgICdjcmVhdGUtb25lLW9mZicsXG4gICAgJ3NoYS1jaGVjaycsXG4gICAgJ3NpbS1saXN0JyxcbiAgICAnbnBtLXVwZGF0ZScsXG4gICAgJ2NyZWF0ZS1yZWxlYXNlJyxcbiAgICAnY2hlcnJ5LXBpY2snLFxuICAgICdkZXYnLFxuICAgICdvbmUtb2ZmJyxcbiAgICAncmMnLFxuICAgICdwcm9kdWN0aW9uJyxcbiAgICAncHJvdG90eXBlJyxcbiAgICAnY3JlYXRlLXNpbScsXG4gICAgJ2dlbmVyYXRlLWRhdGEnLFxuICAgICdyZWxlYXNlLWJyYW5jaC1saXN0J1xuICBdLmZvckVhY2goIHRhc2sgPT4gZm9yd2FyZFRvUmVwbyggJ3BlcmVubmlhbCcsIHRhc2sgKSApO1xuXG4gIC8vIEZvcndhcmQgdGhlc2UgdG8gcGVyZW5uaWFsLWFsaWFzIGJlY2F1c2UgdGhleSBhcmUgdXNlZCBmb3IgYnVpbGRpbmcgc2ltcywgYW5kIHNob3VsZCB2ZXJzaW9uIHdpdGggc2ltcyAobGlrZSBjaGlwcGVyXG4gIC8vIGRvZXMpLlxuICBbXG4gICAgJ2NoZWNrJywgLy8gVE9ETzogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9wZXJlbm5pYWwvaXNzdWVzLzQyMFxuICAgICd0eXBlLWNoZWNrJyxcbiAgICAnbGludCcsXG4gICAgJ2xpbnQtZXZlcnl0aGluZydcbiAgXS5mb3JFYWNoKCB0YXNrID0+IGZvcndhcmRUb1JlcG8oICdwZXJlbm5pYWwtYWxpYXMnLCB0YXNrICkgKTtcbn07Il0sIm5hbWVzIjpbImFzc2VydCIsInJlcXVpcmUiLCJyZWdpc3RlclRhc2tzIiwiZ3J1bnRTcGF3biIsIl8iLCJyZWFkRmlsZVN5bmMiLCJpc09wdGlvbkFyZyIsImFyZyIsInN0YXJ0c1dpdGgiLCJnbG9iYWwiLCJwcm9jZXNzRXZlbnRPcHRPdXQiLCJwcm9jZXNzIiwib24iLCJ1cCIsImNvbnNvbGUiLCJsb2ciLCJleGl0IiwibW9kdWxlIiwiZXhwb3J0cyIsImdydW50IiwicGFja2FnZU9iamVjdCIsIkpTT04iLCJwYXJzZSIsInJlcG8iLCJvcHRpb24iLCJuYW1lIiwidGVzdCIsIl9fZGlybmFtZSIsImZvcndhcmRUb1JlcG8iLCJmb3J3YXJkaW5nUmVwbyIsInRhc2siLCJyZWdpc3RlclRhc2siLCJ3cml0ZWxuIiwiY3VycmVudEFyZ3MiLCJhcmd2Iiwic2xpY2UiLCJhcmdzIiwiZmlsdGVyIiwic29tZSIsInB1c2giLCJpc1dpbmRvd3MiLCJwbGF0Zm9ybSIsImFyZ3NTdHJpbmciLCJ2ZXJib3NlIiwiZm9yRWFjaCJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Q0FTQyxHQUVELE1BQU1BLFNBQVNDLFFBQVM7QUFDeEJBLFFBQVM7QUFDVCxNQUFNQyxnQkFBZ0JELFFBQVM7QUFDL0IsTUFBTUUsYUFBYUYsUUFBUztBQUM1QixNQUFNRyxJQUFJSCxRQUFTO0FBQ25CLE1BQU0sRUFBRUksWUFBWSxFQUFFLEdBQUdKLFFBQVM7QUFFbEMsTUFBTUssY0FBY0MsQ0FBQUEsTUFBT0EsSUFBSUMsVUFBVSxDQUFFO0FBRTNDLDhFQUE4RTtBQUM5RSxJQUFLLENBQUNDLE9BQU9DLGtCQUFrQixFQUFHO0lBRWhDLG9IQUFvSDtJQUNwSCxvRUFBb0U7SUFDcEUsd0VBQXdFO0lBQ3hFQyxRQUFRQyxFQUFFLENBQUUsc0JBQXNCQyxDQUFBQTtRQUFRLE1BQU1BO0lBQUk7SUFFcEQsd0JBQXdCO0lBQ3hCRixRQUFRQyxFQUFFLENBQUUsVUFBVTtRQUNwQkUsUUFBUUMsR0FBRyxDQUFFO1FBQ2JKLFFBQVFLLElBQUk7SUFDZDtBQUNGO0FBRUFDLE9BQU9DLE9BQU8sR0FBRyxTQUFVQyxLQUFLO0lBQzlCLE1BQU1DLGdCQUFnQkMsS0FBS0MsS0FBSyxDQUFFakIsYUFBYyxnQkFBZ0I7SUFFaEUsTUFBTWtCLE9BQU9KLE1BQU1LLE1BQU0sQ0FBRSxXQUFZSixjQUFjSyxJQUFJO0lBQ3pEekIsT0FBUSxPQUFPdUIsU0FBUyxZQUFZLHNCQUFzQkcsSUFBSSxDQUFFSCxPQUFRO0lBRXhFckIsY0FBZWlCLE9BQU9RLFlBQVk7SUFFbEM7Ozs7Ozs7R0FPQyxHQUNELFNBQVNDLGNBQWVDLGNBQWMsRUFBRUMsSUFBSTtRQUMxQ1gsTUFBTVksWUFBWSxDQUFFRCxNQUFNLENBQUMsb0JBQW9CLEVBQUVELGVBQWUscUJBQXFCLENBQUMsRUFBRTtZQUN0RlYsTUFBTUosR0FBRyxDQUFDaUIsT0FBTyxDQUFFLENBQUMsb0JBQW9CLEVBQUVILGVBQWUsQ0FBQyxDQUFDO1lBQzNELE1BQU1JLGNBQWN0QixRQUFRdUIsSUFBSSxDQUFDQyxLQUFLLENBQUUsSUFBSyw0Q0FBNEM7WUFDekYsTUFBTUMsT0FBTztnQkFBRU47bUJBQVNHLFlBQVlJLE1BQU0sQ0FBRS9CO2FBQWUsRUFBRSxpQ0FBaUM7WUFFOUYsMkJBQTJCO1lBQzNCLENBQUNGLEVBQUVrQyxJQUFJLENBQUUzQixRQUFRdUIsSUFBSSxFQUFFM0IsQ0FBQUEsTUFBT0EsSUFBSUMsVUFBVSxDQUFFLGVBQWlCNEIsS0FBS0csSUFBSSxDQUFFLENBQUMsT0FBTyxFQUFFaEIsTUFBTTtZQUMxRixNQUFNaUIsWUFBWSxPQUFPZCxJQUFJLENBQUVmLFFBQVE4QixRQUFRO1lBQy9DdEMsV0FBWWdCLE9BQU9xQixZQUFZLGNBQWMsU0FBU0osTUFBTSxDQUFDLEdBQUcsRUFBRVAsZ0JBQWdCLEVBQUVhLENBQUFBO2dCQUNsRnZCLE1BQU1KLEdBQUcsQ0FBQzRCLE9BQU8sQ0FBQ1gsT0FBTyxDQUFFLENBQUMsY0FBYyxFQUFFVSxXQUFXLE9BQU8sRUFBRW5CLE1BQU07WUFDeEU7UUFDRjtJQUNGO0lBRUE7UUFDRTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtLQUNELENBQUNxQixPQUFPLENBQUVkLENBQUFBLE9BQVFGLGNBQWUsYUFBYUU7SUFFL0MsdUhBQXVIO0lBQ3ZILFNBQVM7SUFDVDtRQUNFO1FBQ0E7UUFDQTtRQUNBO0tBQ0QsQ0FBQ2MsT0FBTyxDQUFFZCxDQUFBQSxPQUFRRixjQUFlLG1CQUFtQkU7QUFDdkQifQ==