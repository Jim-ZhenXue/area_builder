// Copyright 2022-2024, University of Colorado Boulder
/**
 * Helper function to show a progress bar on the command line.
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ const _ = require('lodash');
/**
 * See https://jagascript.com/how-to-build-a-textual-progress-bar-for-cli-and-terminal-apps/
 * @param {number} progress - decimal between 0 and 1
 * @param {boolean} newline - if each new progress should give a new line, should be false during progress, and true when finally completed
 * @param {Object} [options]
 */ module.exports = function showCommandLineProgress(progress, newline, options) {
    options = _.assignIn({
        progressBarLength: 40 // in characters
    }, options);
    const dots = '.'.repeat(Math.round(progress * options.progressBarLength));
    const empty = ' '.repeat(Math.round((1 - progress) * options.progressBarLength));
    const newlineString = newline ? '\n' : '';
    process.stdout.write(`\r[${dots}${empty}] ${(progress * 100).toFixed(2)}%${newlineString}`);
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vc2hvd0NvbW1hbmRMaW5lUHJvZ3Jlc3MuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIHNob3cgYSBwcm9ncmVzcyBiYXIgb24gdGhlIGNvbW1hbmQgbGluZS5cbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuY29uc3QgXyA9IHJlcXVpcmUoICdsb2Rhc2gnICk7XG5cbi8qKlxuICogU2VlIGh0dHBzOi8vamFnYXNjcmlwdC5jb20vaG93LXRvLWJ1aWxkLWEtdGV4dHVhbC1wcm9ncmVzcy1iYXItZm9yLWNsaS1hbmQtdGVybWluYWwtYXBwcy9cbiAqIEBwYXJhbSB7bnVtYmVyfSBwcm9ncmVzcyAtIGRlY2ltYWwgYmV0d2VlbiAwIGFuZCAxXG4gKiBAcGFyYW0ge2Jvb2xlYW59IG5ld2xpbmUgLSBpZiBlYWNoIG5ldyBwcm9ncmVzcyBzaG91bGQgZ2l2ZSBhIG5ldyBsaW5lLCBzaG91bGQgYmUgZmFsc2UgZHVyaW5nIHByb2dyZXNzLCBhbmQgdHJ1ZSB3aGVuIGZpbmFsbHkgY29tcGxldGVkXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2hvd0NvbW1hbmRMaW5lUHJvZ3Jlc3MoIHByb2dyZXNzLCBuZXdsaW5lLCBvcHRpb25zICkge1xuICBvcHRpb25zID0gXy5hc3NpZ25Jbigge1xuICAgIHByb2dyZXNzQmFyTGVuZ3RoOiA0MCAvLyBpbiBjaGFyYWN0ZXJzXG4gIH0sIG9wdGlvbnMgKTtcblxuICBjb25zdCBkb3RzID0gJy4nLnJlcGVhdCggTWF0aC5yb3VuZCggcHJvZ3Jlc3MgKiBvcHRpb25zLnByb2dyZXNzQmFyTGVuZ3RoICkgKTtcbiAgY29uc3QgZW1wdHkgPSAnICcucmVwZWF0KCBNYXRoLnJvdW5kKCAoIDEgLSBwcm9ncmVzcyApICogb3B0aW9ucy5wcm9ncmVzc0Jhckxlbmd0aCApICk7XG4gIGNvbnN0IG5ld2xpbmVTdHJpbmcgPSBuZXdsaW5lID8gJ1xcbicgOiAnJztcbiAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoIGBcXHJbJHtkb3RzfSR7ZW1wdHl9XSAkeyggcHJvZ3Jlc3MgKiAxMDAgKS50b0ZpeGVkKCAyICl9JSR7bmV3bGluZVN0cmluZ31gICk7XG59OyJdLCJuYW1lcyI6WyJfIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJzaG93Q29tbWFuZExpbmVQcm9ncmVzcyIsInByb2dyZXNzIiwibmV3bGluZSIsIm9wdGlvbnMiLCJhc3NpZ25JbiIsInByb2dyZXNzQmFyTGVuZ3RoIiwiZG90cyIsInJlcGVhdCIsIk1hdGgiLCJyb3VuZCIsImVtcHR5IiwibmV3bGluZVN0cmluZyIsInByb2Nlc3MiLCJzdGRvdXQiLCJ3cml0ZSIsInRvRml4ZWQiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsTUFBTUEsSUFBSUMsUUFBUztBQUVuQjs7Ozs7Q0FLQyxHQUNEQyxPQUFPQyxPQUFPLEdBQUcsU0FBU0Msd0JBQXlCQyxRQUFRLEVBQUVDLE9BQU8sRUFBRUMsT0FBTztJQUMzRUEsVUFBVVAsRUFBRVEsUUFBUSxDQUFFO1FBQ3BCQyxtQkFBbUIsR0FBRyxnQkFBZ0I7SUFDeEMsR0FBR0Y7SUFFSCxNQUFNRyxPQUFPLElBQUlDLE1BQU0sQ0FBRUMsS0FBS0MsS0FBSyxDQUFFUixXQUFXRSxRQUFRRSxpQkFBaUI7SUFDekUsTUFBTUssUUFBUSxJQUFJSCxNQUFNLENBQUVDLEtBQUtDLEtBQUssQ0FBRSxBQUFFLENBQUEsSUFBSVIsUUFBTyxJQUFNRSxRQUFRRSxpQkFBaUI7SUFDbEYsTUFBTU0sZ0JBQWdCVCxVQUFVLE9BQU87SUFDdkNVLFFBQVFDLE1BQU0sQ0FBQ0MsS0FBSyxDQUFFLENBQUMsR0FBRyxFQUFFUixPQUFPSSxNQUFNLEVBQUUsRUFBRSxBQUFFVCxDQUFBQSxXQUFXLEdBQUUsRUFBSWMsT0FBTyxDQUFFLEdBQUksQ0FBQyxFQUFFSixlQUFlO0FBQ2pHIn0=