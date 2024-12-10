// Copyright 2024, University of Colorado Boulder
/**
 * Script to automate the setup and execution of a development server and a transpiler.
 *
 * The script performs the following tasks:
 * 1. Pulls all repos, missing repos, performs npm updates, unless skipped with --skipPull.
 * 2. Starts an HTTP server.
 * 3. Starts a watch-mode transpiler once the server is up.
 * 4. Handles graceful termination of both processes on receiving termination signals.
 *
 * Run this from your root level directory containing all PhET repositories.
 * Example usage:
 * node perennial/js/scripts/start-dev.js
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
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
const { spawn, exec } = require('child_process');
const path = require('path');
const gruntCommand = require('../common/gruntCommand');
// It takes a long time to pull all repos. This option skips that step for faster startup.
const skipPull = process.argv.includes('--skipPull');
// References to the child processes so that they can be terminated gracefully.
let httpServerProcess;
let transpileProcess;
/**
 * Helper function to run a command and return a promise that resolves/rejects based on the command's execution.
 *
 * @param {string} command - The command to run.
 * @param {Object} [options] - Options to pass to exec.
 * @returns {Promise} - Resolves with stdout if the command succeeds, else rejects with error details.
 */ function runCommand(command, options = {}) {
    return new Promise((resolve, reject)=>{
        const childProcess = exec(command, options, (error, stdout, stderr)=>{
            if (error) {
                reject(error);
            } else {
                resolve(stdout);
            }
        });
        // Pipe the child process output to parent process's stdout and stderr
        childProcess.stdout.on('data', (data)=>process.stdout.write(data));
        childProcess.stderr.on('data', (data)=>process.stderr.write(data));
    });
}
/**
 * Terminates the child processes gracefully.
 *
 * @param {string} signal - The signal used to terminate the processes.
 */ function terminateProcesses(signal) {
    if (httpServerProcess) {
        console.log(`Terminating http-server process with ${signal} signal...`);
        httpServerProcess.kill(signal);
    }
    if (transpileProcess) {
        console.log(`Terminating transpile process with ${signal} signal...`);
        transpileProcess.kill(signal);
    }
}
function main() {
    return _main.apply(this, arguments);
}
function _main() {
    _main = /**
 * Main function to orchestrate the script logic.
 */ _async_to_generator(function*() {
        try {
            // The root directory where phet repos are located, relative to this script.
            const phetsimsDirectory = path.join(__dirname, '../../../');
            if (!skipPull) {
                console.log('\nUpdating code base, installing dependencies. This may take several minutes. You can skip this step with --skipPull option.');
                yield runCommand('node js/scripts/main-pull-status.js --all --slowPull', {
                    cwd: path.join(phetsimsDirectory, 'perennial')
                });
            } else {
                console.log('\nSkipping pull step.');
            }
            console.log('\nStarting http-server...\n');
            httpServerProcess = spawn('http-server', [], {
                shell: true
            });
            // Monitor the HTTP server's output for the URL to know when it's started
            httpServerProcess.stdout.on('data', (data)=>{
                process.stdout.write(`${data}`);
                if (data.toString().includes('http://')) {
                    console.log('\nStarting the transpiler...\n');
                    transpileProcess = spawn(gruntCommand, [
                        'transpile',
                        '--live'
                    ], {
                        cwd: path.join(phetsimsDirectory, 'chipper'),
                        shell: true
                    });
                    transpileProcess.stdout.on('data', (data)=>process.stdout.write(`transpile: ${data}`));
                    transpileProcess.stderr.on('data', (data)=>process.stderr.write(`transpile: ${data}`));
                }
            });
            httpServerProcess.stderr.on('data', (data)=>process.stderr.write(`http-server: ${data}`));
            httpServerProcess.on('error', (error)=>{
                console.error('Failed to start http-server:', error);
                process.exit(1);
            });
        } catch (error) {
            console.error('Error: ', error.stderr || error);
        }
    });
    return _main.apply(this, arguments);
}
// Handle termination signals for graceful shutdown
[
    'SIGINT',
    'SIGTERM',
    'SIGHUP',
    'SIGQUIT'
].forEach((signal)=>{
    process.on(signal, ()=>{
        console.log(`\nReceived ${signal}. Initiating shutdown...`);
        terminateProcesses(signal);
        process.exit();
    });
});
main();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL3N0YXJ0LWRldi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogU2NyaXB0IHRvIGF1dG9tYXRlIHRoZSBzZXR1cCBhbmQgZXhlY3V0aW9uIG9mIGEgZGV2ZWxvcG1lbnQgc2VydmVyIGFuZCBhIHRyYW5zcGlsZXIuXG4gKlxuICogVGhlIHNjcmlwdCBwZXJmb3JtcyB0aGUgZm9sbG93aW5nIHRhc2tzOlxuICogMS4gUHVsbHMgYWxsIHJlcG9zLCBtaXNzaW5nIHJlcG9zLCBwZXJmb3JtcyBucG0gdXBkYXRlcywgdW5sZXNzIHNraXBwZWQgd2l0aCAtLXNraXBQdWxsLlxuICogMi4gU3RhcnRzIGFuIEhUVFAgc2VydmVyLlxuICogMy4gU3RhcnRzIGEgd2F0Y2gtbW9kZSB0cmFuc3BpbGVyIG9uY2UgdGhlIHNlcnZlciBpcyB1cC5cbiAqIDQuIEhhbmRsZXMgZ3JhY2VmdWwgdGVybWluYXRpb24gb2YgYm90aCBwcm9jZXNzZXMgb24gcmVjZWl2aW5nIHRlcm1pbmF0aW9uIHNpZ25hbHMuXG4gKlxuICogUnVuIHRoaXMgZnJvbSB5b3VyIHJvb3QgbGV2ZWwgZGlyZWN0b3J5IGNvbnRhaW5pbmcgYWxsIFBoRVQgcmVwb3NpdG9yaWVzLlxuICogRXhhbXBsZSB1c2FnZTpcbiAqIG5vZGUgcGVyZW5uaWFsL2pzL3NjcmlwdHMvc3RhcnQtZGV2LmpzXG4gKlxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuY29uc3QgeyBzcGF3biwgZXhlYyB9ID0gcmVxdWlyZSggJ2NoaWxkX3Byb2Nlc3MnICk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSggJ3BhdGgnICk7XG5jb25zdCBncnVudENvbW1hbmQgPSByZXF1aXJlKCAnLi4vY29tbW9uL2dydW50Q29tbWFuZCcgKTtcblxuLy8gSXQgdGFrZXMgYSBsb25nIHRpbWUgdG8gcHVsbCBhbGwgcmVwb3MuIFRoaXMgb3B0aW9uIHNraXBzIHRoYXQgc3RlcCBmb3IgZmFzdGVyIHN0YXJ0dXAuXG5jb25zdCBza2lwUHVsbCA9IHByb2Nlc3MuYXJndi5pbmNsdWRlcyggJy0tc2tpcFB1bGwnICk7XG5cbi8vIFJlZmVyZW5jZXMgdG8gdGhlIGNoaWxkIHByb2Nlc3NlcyBzbyB0aGF0IHRoZXkgY2FuIGJlIHRlcm1pbmF0ZWQgZ3JhY2VmdWxseS5cbmxldCBodHRwU2VydmVyUHJvY2VzcztcbmxldCB0cmFuc3BpbGVQcm9jZXNzO1xuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBydW4gYSBjb21tYW5kIGFuZCByZXR1cm4gYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMvcmVqZWN0cyBiYXNlZCBvbiB0aGUgY29tbWFuZCdzIGV4ZWN1dGlvbi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29tbWFuZCAtIFRoZSBjb21tYW5kIHRvIHJ1bi5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gLSBPcHRpb25zIHRvIHBhc3MgdG8gZXhlYy5cbiAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJlc29sdmVzIHdpdGggc3Rkb3V0IGlmIHRoZSBjb21tYW5kIHN1Y2NlZWRzLCBlbHNlIHJlamVjdHMgd2l0aCBlcnJvciBkZXRhaWxzLlxuICovXG5mdW5jdGlvbiBydW5Db21tYW5kKCBjb21tYW5kLCBvcHRpb25zID0ge30gKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlLCByZWplY3QgKSA9PiB7XG4gICAgY29uc3QgY2hpbGRQcm9jZXNzID0gZXhlYyggY29tbWFuZCwgb3B0aW9ucywgKCBlcnJvciwgc3Rkb3V0LCBzdGRlcnIgKSA9PiB7XG4gICAgICBpZiAoIGVycm9yICkge1xuICAgICAgICByZWplY3QoIGVycm9yICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZSggc3Rkb3V0ICk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gUGlwZSB0aGUgY2hpbGQgcHJvY2VzcyBvdXRwdXQgdG8gcGFyZW50IHByb2Nlc3MncyBzdGRvdXQgYW5kIHN0ZGVyclxuICAgIGNoaWxkUHJvY2Vzcy5zdGRvdXQub24oICdkYXRhJywgZGF0YSA9PiBwcm9jZXNzLnN0ZG91dC53cml0ZSggZGF0YSApICk7XG4gICAgY2hpbGRQcm9jZXNzLnN0ZGVyci5vbiggJ2RhdGEnLCBkYXRhID0+IHByb2Nlc3Muc3RkZXJyLndyaXRlKCBkYXRhICkgKTtcbiAgfSApO1xufVxuXG4vKipcbiAqIFRlcm1pbmF0ZXMgdGhlIGNoaWxkIHByb2Nlc3NlcyBncmFjZWZ1bGx5LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzaWduYWwgLSBUaGUgc2lnbmFsIHVzZWQgdG8gdGVybWluYXRlIHRoZSBwcm9jZXNzZXMuXG4gKi9cbmZ1bmN0aW9uIHRlcm1pbmF0ZVByb2Nlc3Nlcyggc2lnbmFsICkge1xuICBpZiAoIGh0dHBTZXJ2ZXJQcm9jZXNzICkge1xuICAgIGNvbnNvbGUubG9nKCBgVGVybWluYXRpbmcgaHR0cC1zZXJ2ZXIgcHJvY2VzcyB3aXRoICR7c2lnbmFsfSBzaWduYWwuLi5gICk7XG4gICAgaHR0cFNlcnZlclByb2Nlc3Mua2lsbCggc2lnbmFsICk7XG4gIH1cbiAgaWYgKCB0cmFuc3BpbGVQcm9jZXNzICkge1xuICAgIGNvbnNvbGUubG9nKCBgVGVybWluYXRpbmcgdHJhbnNwaWxlIHByb2Nlc3Mgd2l0aCAke3NpZ25hbH0gc2lnbmFsLi4uYCApO1xuICAgIHRyYW5zcGlsZVByb2Nlc3Mua2lsbCggc2lnbmFsICk7XG4gIH1cbn1cblxuLyoqXG4gKiBNYWluIGZ1bmN0aW9uIHRvIG9yY2hlc3RyYXRlIHRoZSBzY3JpcHQgbG9naWMuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIG1haW4oKSB7XG4gIHRyeSB7XG5cbiAgICAvLyBUaGUgcm9vdCBkaXJlY3Rvcnkgd2hlcmUgcGhldCByZXBvcyBhcmUgbG9jYXRlZCwgcmVsYXRpdmUgdG8gdGhpcyBzY3JpcHQuXG4gICAgY29uc3QgcGhldHNpbXNEaXJlY3RvcnkgPSBwYXRoLmpvaW4oIF9fZGlybmFtZSwgJy4uLy4uLy4uLycgKTtcblxuICAgIGlmICggIXNraXBQdWxsICkge1xuICAgICAgY29uc29sZS5sb2coICdcXG5VcGRhdGluZyBjb2RlIGJhc2UsIGluc3RhbGxpbmcgZGVwZW5kZW5jaWVzLiBUaGlzIG1heSB0YWtlIHNldmVyYWwgbWludXRlcy4gWW91IGNhbiBza2lwIHRoaXMgc3RlcCB3aXRoIC0tc2tpcFB1bGwgb3B0aW9uLicgKTtcbiAgICAgIGF3YWl0IHJ1bkNvbW1hbmQoICdub2RlIGpzL3NjcmlwdHMvbWFpbi1wdWxsLXN0YXR1cy5qcyAtLWFsbCAtLXNsb3dQdWxsJywgeyBjd2Q6IHBhdGguam9pbiggcGhldHNpbXNEaXJlY3RvcnksICdwZXJlbm5pYWwnICkgfSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCAnXFxuU2tpcHBpbmcgcHVsbCBzdGVwLicgKTtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyggJ1xcblN0YXJ0aW5nIGh0dHAtc2VydmVyLi4uXFxuJyApO1xuICAgIGh0dHBTZXJ2ZXJQcm9jZXNzID0gc3Bhd24oICdodHRwLXNlcnZlcicsIFtdLCB7IHNoZWxsOiB0cnVlIH0gKTtcblxuICAgIC8vIE1vbml0b3IgdGhlIEhUVFAgc2VydmVyJ3Mgb3V0cHV0IGZvciB0aGUgVVJMIHRvIGtub3cgd2hlbiBpdCdzIHN0YXJ0ZWRcbiAgICBodHRwU2VydmVyUHJvY2Vzcy5zdGRvdXQub24oICdkYXRhJywgZGF0YSA9PiB7XG4gICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSggYCR7ZGF0YX1gICk7XG4gICAgICBpZiAoIGRhdGEudG9TdHJpbmcoKS5pbmNsdWRlcyggJ2h0dHA6Ly8nICkgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCAnXFxuU3RhcnRpbmcgdGhlIHRyYW5zcGlsZXIuLi5cXG4nICk7XG4gICAgICAgIHRyYW5zcGlsZVByb2Nlc3MgPSBzcGF3biggZ3J1bnRDb21tYW5kLCBbICd0cmFuc3BpbGUnLCAnLS1saXZlJyBdLCB7IGN3ZDogcGF0aC5qb2luKCBwaGV0c2ltc0RpcmVjdG9yeSwgJ2NoaXBwZXInICksIHNoZWxsOiB0cnVlIH0gKTtcblxuICAgICAgICB0cmFuc3BpbGVQcm9jZXNzLnN0ZG91dC5vbiggJ2RhdGEnLCBkYXRhID0+IHByb2Nlc3Muc3Rkb3V0LndyaXRlKCBgdHJhbnNwaWxlOiAke2RhdGF9YCApICk7XG4gICAgICAgIHRyYW5zcGlsZVByb2Nlc3Muc3RkZXJyLm9uKCAnZGF0YScsIGRhdGEgPT4gcHJvY2Vzcy5zdGRlcnIud3JpdGUoIGB0cmFuc3BpbGU6ICR7ZGF0YX1gICkgKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICBodHRwU2VydmVyUHJvY2Vzcy5zdGRlcnIub24oICdkYXRhJywgZGF0YSA9PiBwcm9jZXNzLnN0ZGVyci53cml0ZSggYGh0dHAtc2VydmVyOiAke2RhdGF9YCApICk7XG5cbiAgICBodHRwU2VydmVyUHJvY2Vzcy5vbiggJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgY29uc29sZS5lcnJvciggJ0ZhaWxlZCB0byBzdGFydCBodHRwLXNlcnZlcjonLCBlcnJvciApO1xuICAgICAgcHJvY2Vzcy5leGl0KCAxICk7XG4gICAgfSApO1xuXG4gIH1cbiAgY2F0Y2goIGVycm9yICkge1xuICAgIGNvbnNvbGUuZXJyb3IoICdFcnJvcjogJywgZXJyb3Iuc3RkZXJyIHx8IGVycm9yICk7XG4gIH1cbn1cblxuLy8gSGFuZGxlIHRlcm1pbmF0aW9uIHNpZ25hbHMgZm9yIGdyYWNlZnVsIHNodXRkb3duXG5bICdTSUdJTlQnLCAnU0lHVEVSTScsICdTSUdIVVAnLCAnU0lHUVVJVCcgXS5mb3JFYWNoKCBzaWduYWwgPT4ge1xuICBwcm9jZXNzLm9uKCBzaWduYWwsICgpID0+IHtcbiAgICBjb25zb2xlLmxvZyggYFxcblJlY2VpdmVkICR7c2lnbmFsfS4gSW5pdGlhdGluZyBzaHV0ZG93bi4uLmAgKTtcbiAgICB0ZXJtaW5hdGVQcm9jZXNzZXMoIHNpZ25hbCApO1xuICAgIHByb2Nlc3MuZXhpdCgpO1xuICB9ICk7XG59ICk7XG5cbm1haW4oKTsiXSwibmFtZXMiOlsic3Bhd24iLCJleGVjIiwicmVxdWlyZSIsInBhdGgiLCJncnVudENvbW1hbmQiLCJza2lwUHVsbCIsInByb2Nlc3MiLCJhcmd2IiwiaW5jbHVkZXMiLCJodHRwU2VydmVyUHJvY2VzcyIsInRyYW5zcGlsZVByb2Nlc3MiLCJydW5Db21tYW5kIiwiY29tbWFuZCIsIm9wdGlvbnMiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImNoaWxkUHJvY2VzcyIsImVycm9yIiwic3Rkb3V0Iiwic3RkZXJyIiwib24iLCJkYXRhIiwid3JpdGUiLCJ0ZXJtaW5hdGVQcm9jZXNzZXMiLCJzaWduYWwiLCJjb25zb2xlIiwibG9nIiwia2lsbCIsIm1haW4iLCJwaGV0c2ltc0RpcmVjdG9yeSIsImpvaW4iLCJfX2Rpcm5hbWUiLCJjd2QiLCJzaGVsbCIsInRvU3RyaW5nIiwiZXhpdCIsImZvckVhY2giXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7Ozs7Ozs7Ozs7Ozs7Q0FjQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNLEVBQUVBLEtBQUssRUFBRUMsSUFBSSxFQUFFLEdBQUdDLFFBQVM7QUFDakMsTUFBTUMsT0FBT0QsUUFBUztBQUN0QixNQUFNRSxlQUFlRixRQUFTO0FBRTlCLDBGQUEwRjtBQUMxRixNQUFNRyxXQUFXQyxRQUFRQyxJQUFJLENBQUNDLFFBQVEsQ0FBRTtBQUV4QywrRUFBK0U7QUFDL0UsSUFBSUM7QUFDSixJQUFJQztBQUVKOzs7Ozs7Q0FNQyxHQUNELFNBQVNDLFdBQVlDLE9BQU8sRUFBRUMsVUFBVSxDQUFDLENBQUM7SUFDeEMsT0FBTyxJQUFJQyxRQUFTLENBQUVDLFNBQVNDO1FBQzdCLE1B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