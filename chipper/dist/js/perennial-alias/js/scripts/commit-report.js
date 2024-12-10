// Copyright 2021, University of Colorado Boulder
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
const execute = require('../common/execute').default;
const fs = require('fs');
/**
 *
 * Output a formatted view of recent commits to help in writing a report
 *
 * USAGE:
 * cd directory-with-all-repos
 * node perennial/js/scripts/commit-report.js username > report.txt
 *
 * EXAMPLE:
 * node perennial/js/scripts/commit-report.js samreid > report.txt
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ _async_to_generator(function*() {
    const args = process.argv.slice(2);
    const username = args[0];
    const months = [
        'Jan',
        'Feb',
        'March',
        'April',
        'May',
        'June',
        'July',
        'Aug',
        'Sept',
        'Oct',
        'Nov',
        'Dec'
    ];
    if (!username) {
        console.log('username must be supplied as first command-line argument');
    } else {
        const outputtedLines = [];
        // current timestamp in milliseconds
        const d = new Date(Date.now());
        const day = d.getDate();
        const month = d.getMonth();
        const year = d.getFullYear();
        console.log(`${username === 'samreid' ? 'Sam Reid - ' : ''}${months[month]} ${day}, ${year}`);
        console.log();
        console.log('Highlights');
        console.log('');
        console.log('Pose Hours: ');
        // Don't use getActiveRepos() since it cannot be run from the root
        const contents = fs.readFileSync('perennial/data/active-repos', 'utf8').trim();
        const repos = contents.split('\n').map((sim)=>sim.trim());
        // git --no-pager log --all --remotes --since=7.days --author=$1 --pretty=format:"%an %ad %s" --date=relative
        const gitArgs = [
            '--no-pager',
            'log',
            '--all',
            '--remotes',
            '--since=7.days',
            '--pretty=format:"%an %ad %s"',
            '--date=relative'
        ];
        const a = repos.map((repo)=>execute('git', gitArgs, `${repo}`, {
                // resolve errors so Promise.all doesn't fail on first repo that cannot pull/rebase
                errors: 'resolve'
            }));
        const out = yield Promise.all(a);
        // Report results
        for(let i = 0; i < a.length; i++){
            let outputtedRepo = false;
            const repo = repos[i];
            const o = out[i];
            if (o.stderr.trim().length > 0) {
                console.log(o.stderr.trim());
            }
            const stdout = o.stdout.trim();
            if (stdout.length > 0 || o.stderr.trim().length > 0) {
                const lines = stdout.split('\n');
                lines.forEach((line)=>{
                    if (line.startsWith('"') && line.endsWith('"')) {
                        line = line.substring(1, line.length - 1);
                    }
                    if (line.startsWith(username)) {
                        line = line.substring(username.length).trim();
                        const tokens = line.split(' ');
                        const number = Number(tokens[0]);
                        const time = tokens[1];
                        if (time === 'days' && number <= 7) {
                            line = line.substring('n days ago '.length);
                        }
                        if (time === 'hours' && number <= 9) {
                            line = line.substring('n hours ago '.length);
                        }
                        if (time === 'hours' && number >= 10 && number <= 99) {
                            line = line.substring('nn hours ago '.length);
                        }
                        if (!outputtedLines.find((x)=>x === line) && !line.startsWith('Merge branch \'main\' of')) {
                            if (!outputtedRepo) {
                                console.log();
                                console.log(repo);
                                outputtedRepo = true;
                            }
                            console.log(line);
                            outputtedLines.push(line);
                        }
                    }
                });
            }
        }
    }
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL2NvbW1pdC1yZXBvcnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG5jb25zdCBleGVjdXRlID0gcmVxdWlyZSggJy4uL2NvbW1vbi9leGVjdXRlJyApLmRlZmF1bHQ7XG5jb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcblxuLyoqXG4gKlxuICogT3V0cHV0IGEgZm9ybWF0dGVkIHZpZXcgb2YgcmVjZW50IGNvbW1pdHMgdG8gaGVscCBpbiB3cml0aW5nIGEgcmVwb3J0XG4gKlxuICogVVNBR0U6XG4gKiBjZCBkaXJlY3Rvcnktd2l0aC1hbGwtcmVwb3NcbiAqIG5vZGUgcGVyZW5uaWFsL2pzL3NjcmlwdHMvY29tbWl0LXJlcG9ydC5qcyB1c2VybmFtZSA+IHJlcG9ydC50eHRcbiAqXG4gKiBFWEFNUExFOlxuICogbm9kZSBwZXJlbm5pYWwvanMvc2NyaXB0cy9jb21taXQtcmVwb3J0LmpzIHNhbXJlaWQgPiByZXBvcnQudHh0XG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuKCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IGFyZ3MgPSBwcm9jZXNzLmFyZ3Yuc2xpY2UoIDIgKTtcbiAgY29uc3QgdXNlcm5hbWUgPSBhcmdzWyAwIF07XG5cbiAgY29uc3QgbW9udGhzID0gWyAnSmFuJywgJ0ZlYicsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1ZycsICdTZXB0JywgJ09jdCcsICdOb3YnLCAnRGVjJyBdO1xuICBpZiAoICF1c2VybmFtZSApIHtcbiAgICBjb25zb2xlLmxvZyggJ3VzZXJuYW1lIG11c3QgYmUgc3VwcGxpZWQgYXMgZmlyc3QgY29tbWFuZC1saW5lIGFyZ3VtZW50JyApO1xuICB9XG4gIGVsc2Uge1xuXG4gICAgY29uc3Qgb3V0cHV0dGVkTGluZXMgPSBbXTtcblxuICAgIC8vIGN1cnJlbnQgdGltZXN0YW1wIGluIG1pbGxpc2Vjb25kc1xuICAgIGNvbnN0IGQgPSBuZXcgRGF0ZSggRGF0ZS5ub3coKSApO1xuICAgIGNvbnN0IGRheSA9IGQuZ2V0RGF0ZSgpO1xuICAgIGNvbnN0IG1vbnRoID0gZC5nZXRNb250aCgpO1xuICAgIGNvbnN0IHllYXIgPSBkLmdldEZ1bGxZZWFyKCk7XG5cbiAgICBjb25zb2xlLmxvZyggYCR7dXNlcm5hbWUgPT09ICdzYW1yZWlkJyA/ICdTYW0gUmVpZCAtICcgOiAnJ30ke21vbnRoc1sgbW9udGggXX0gJHtkYXl9LCAke3llYXJ9YCApO1xuICAgIGNvbnNvbGUubG9nKCk7XG5cbiAgICBjb25zb2xlLmxvZyggJ0hpZ2hsaWdodHMnICk7XG4gICAgY29uc29sZS5sb2coICcnICk7XG4gICAgY29uc29sZS5sb2coICdQb3NlIEhvdXJzOiAnICk7XG5cbiAgICAvLyBEb24ndCB1c2UgZ2V0QWN0aXZlUmVwb3MoKSBzaW5jZSBpdCBjYW5ub3QgYmUgcnVuIGZyb20gdGhlIHJvb3RcbiAgICBjb25zdCBjb250ZW50cyA9IGZzLnJlYWRGaWxlU3luYyggJ3BlcmVubmlhbC9kYXRhL2FjdGl2ZS1yZXBvcycsICd1dGY4JyApLnRyaW0oKTtcbiAgICBjb25zdCByZXBvcyA9IGNvbnRlbnRzLnNwbGl0KCAnXFxuJyApLm1hcCggc2ltID0+IHNpbS50cmltKCkgKTtcblxuICAgIC8vIGdpdCAtLW5vLXBhZ2VyIGxvZyAtLWFsbCAtLXJlbW90ZXMgLS1zaW5jZT03LmRheXMgLS1hdXRob3I9JDEgLS1wcmV0dHk9Zm9ybWF0OlwiJWFuICVhZCAlc1wiIC0tZGF0ZT1yZWxhdGl2ZVxuICAgIGNvbnN0IGdpdEFyZ3MgPSBbICctLW5vLXBhZ2VyJywgJ2xvZycsICctLWFsbCcsICctLXJlbW90ZXMnLCAnLS1zaW5jZT03LmRheXMnLCAnLS1wcmV0dHk9Zm9ybWF0OlwiJWFuICVhZCAlc1wiJywgJy0tZGF0ZT1yZWxhdGl2ZScgXTtcblxuICAgIGNvbnN0IGEgPSByZXBvcy5tYXAoIHJlcG8gPT4gZXhlY3V0ZSggJ2dpdCcsIGdpdEFyZ3MsIGAke3JlcG99YCwge1xuXG4gICAgICAvLyByZXNvbHZlIGVycm9ycyBzbyBQcm9taXNlLmFsbCBkb2Vzbid0IGZhaWwgb24gZmlyc3QgcmVwbyB0aGF0IGNhbm5vdCBwdWxsL3JlYmFzZVxuICAgICAgZXJyb3JzOiAncmVzb2x2ZSdcbiAgICB9ICkgKTtcbiAgICBjb25zdCBvdXQgPSBhd2FpdCBQcm9taXNlLmFsbCggYSApO1xuXG4gICAgLy8gUmVwb3J0IHJlc3VsdHNcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrICkge1xuXG4gICAgICBsZXQgb3V0cHV0dGVkUmVwbyA9IGZhbHNlO1xuICAgICAgY29uc3QgcmVwbyA9IHJlcG9zWyBpIF07XG4gICAgICBjb25zdCBvID0gb3V0WyBpIF07XG5cbiAgICAgIGlmICggby5zdGRlcnIudHJpbSgpLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCBvLnN0ZGVyci50cmltKCkgKTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc3Rkb3V0ID0gby5zdGRvdXQudHJpbSgpO1xuICAgICAgaWYgKCBzdGRvdXQubGVuZ3RoID4gMCB8fCBvLnN0ZGVyci50cmltKCkubGVuZ3RoID4gMCApIHtcblxuXG4gICAgICAgIGNvbnN0IGxpbmVzID0gc3Rkb3V0LnNwbGl0KCAnXFxuJyApO1xuICAgICAgICBsaW5lcy5mb3JFYWNoKCBsaW5lID0+IHtcbiAgICAgICAgICBpZiAoIGxpbmUuc3RhcnRzV2l0aCggJ1wiJyApICYmIGxpbmUuZW5kc1dpdGgoICdcIicgKSApIHtcbiAgICAgICAgICAgIGxpbmUgPSBsaW5lLnN1YnN0cmluZyggMSwgbGluZS5sZW5ndGggLSAxICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCBsaW5lLnN0YXJ0c1dpdGgoIHVzZXJuYW1lICkgKSB7XG4gICAgICAgICAgICBsaW5lID0gbGluZS5zdWJzdHJpbmcoIHVzZXJuYW1lLmxlbmd0aCApLnRyaW0oKTtcblxuICAgICAgICAgICAgY29uc3QgdG9rZW5zID0gbGluZS5zcGxpdCggJyAnICk7XG4gICAgICAgICAgICBjb25zdCBudW1iZXIgPSBOdW1iZXIoIHRva2Vuc1sgMCBdICk7XG4gICAgICAgICAgICBjb25zdCB0aW1lID0gdG9rZW5zWyAxIF07XG5cbiAgICAgICAgICAgIGlmICggdGltZSA9PT0gJ2RheXMnICYmIG51bWJlciA8PSA3ICkge1xuICAgICAgICAgICAgICBsaW5lID0gbGluZS5zdWJzdHJpbmcoICduIGRheXMgYWdvICcubGVuZ3RoICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIHRpbWUgPT09ICdob3VycycgJiYgbnVtYmVyIDw9IDkgKSB7XG4gICAgICAgICAgICAgIGxpbmUgPSBsaW5lLnN1YnN0cmluZyggJ24gaG91cnMgYWdvICcubGVuZ3RoICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIHRpbWUgPT09ICdob3VycycgJiYgbnVtYmVyID49IDEwICYmIG51bWJlciA8PSA5OSApIHtcbiAgICAgICAgICAgICAgbGluZSA9IGxpbmUuc3Vic3RyaW5nKCAnbm4gaG91cnMgYWdvICcubGVuZ3RoICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICggIW91dHB1dHRlZExpbmVzLmZpbmQoIHggPT4geCA9PT0gbGluZSApICYmICFsaW5lLnN0YXJ0c1dpdGgoICdNZXJnZSBicmFuY2ggXFwnbWFpblxcJyBvZicgKSApIHtcblxuICAgICAgICAgICAgICBpZiAoICFvdXRwdXR0ZWRSZXBvICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coIHJlcG8gKTtcbiAgICAgICAgICAgICAgICBvdXRwdXR0ZWRSZXBvID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyggbGluZSApO1xuICAgICAgICAgICAgICBvdXRwdXR0ZWRMaW5lcy5wdXNoKCBsaW5lICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9ICk7XG5cbiAgICAgIH1cbiAgICB9XG4gIH1cbn0gKSgpOyJdLCJuYW1lcyI6WyJleGVjdXRlIiwicmVxdWlyZSIsImRlZmF1bHQiLCJmcyIsImFyZ3MiLCJwcm9jZXNzIiwiYXJndiIsInNsaWNlIiwidXNlcm5hbWUiLCJtb250aHMiLCJjb25zb2xlIiwibG9nIiwib3V0cHV0dGVkTGluZXMiLCJkIiwiRGF0ZSIsIm5vdyIsImRheSIsImdldERhdGUiLCJtb250aCIsImdldE1vbnRoIiwieWVhciIsImdldEZ1bGxZZWFyIiwiY29udGVudHMiLCJyZWFkRmlsZVN5bmMiLCJ0cmltIiwicmVwb3MiLCJzcGxpdCIsIm1hcCIsInNpbSIsImdpdEFyZ3MiLCJhIiwicmVwbyIsImVycm9ycyIsIm91dCIsIlByb21pc2UiLCJhbGwiLCJpIiwibGVuZ3RoIiwib3V0cHV0dGVkUmVwbyIsIm8iLCJzdGRlcnIiLCJzdGRvdXQiLCJsaW5lcyIsImZvckVhY2giLCJsaW5lIiwic3RhcnRzV2l0aCIsImVuZHNXaXRoIiwic3Vic3RyaW5nIiwidG9rZW5zIiwibnVtYmVyIiwiTnVtYmVyIiwidGltZSIsImZpbmQiLCJ4IiwicHVzaCJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFakQsTUFBTUEsVUFBVUMsUUFBUyxxQkFBc0JDLE9BQU87QUFDdEQsTUFBTUMsS0FBS0YsUUFBUztBQUVwQjs7Ozs7Ozs7Ozs7O0NBWUMsR0FDQyxvQkFBQTtJQUNBLE1BQU1HLE9BQU9DLFFBQVFDLElBQUksQ0FBQ0MsS0FBSyxDQUFFO0lBQ2pDLE1BQU1DLFdBQVdKLElBQUksQ0FBRSxFQUFHO0lBRTFCLE1BQU1LLFNBQVM7UUFBRTtR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