// Copyright 2024, University of Colorado Boulder
/**
 * This entry point for lint divides the list of repos into batches and spawns lint-main processes to do the work.
 * See lint-main.ts for details.
 *
 * Sadly, the colorization from ESLint stylish is lost when spawning child processes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
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
import assert from 'assert';
import { spawn } from 'child_process';
import _ from 'lodash';
import path from 'path';
import dirname from '../common/dirname.js';
import tsxCommand from '../common/tsxCommand.js';
import divideIntoBatches from './divideIntoBatches.js';
import { DEFAULT_MAX_PROCESSES } from './getLintCLIOptions.js';
// @ts-expect-error - until we have "type": "module" in our package.json
const __dirname = dirname(import.meta.url);
const lintMainPath = path.join(__dirname, 'lint-main.ts');
// For debugging the options and making sure they pass through correctly
export const DEBUG_PHET_LINT = false;
export default function lint(repos, providedOptions) {
    return _lint.apply(this, arguments);
}
function _lint() {
    _lint = _async_to_generator(function*(repos, providedOptions) {
        repos = _.uniq(repos); // Don't double lint repos
        assert(repos.length > 0, 'no repos provided to lint');
        const options = _.assignIn({
            // Cache results for a speed boost, but clean cache if the lint rules or configuration has changed
            clean: false,
            // Fix things that can be auto-fixed (written to disk)
            fix: false,
            processes: DEFAULT_MAX_PROCESSES
        }, providedOptions);
        const repoBatches = divideIntoBatches(repos, options.processes);
        if (DEBUG_PHET_LINT) {
            console.log('lint.js repos', repos);
            console.log('lint.js clean', options.clean);
            console.log('lint.js fix', options.fix);
            console.log('lint.js processes', options.processes);
            console.log('lint.js repoBatches', repoBatches);
        }
        // spawn node lint-main.js for each batch and wait for all to complete using child process
        const promises = repoBatches.map((batch)=>{
            return new Promise((resolve, reject)=>{
                const child = spawn(tsxCommand, [
                    lintMainPath,
                    `--repos=${batch.join(',')}`,
                    `--clean=${options.clean}`,
                    `--fix=${options.fix}`
                ], {
                    stdio: [
                        'ignore',
                        'pipe',
                        'pipe'
                    ],
                    shell: process.platform.startsWith('win')
                });
                DEBUG_PHET_LINT && console.log('SPAWN ONCE on batch', batch);
                let stdout = '';
                let stderr = '';
                child.stdout.on('data', (data)=>{
                    stdout += data.toString();
                });
                child.stderr.on('data', (data)=>{
                    stderr += data.toString();
                });
                child.on('close', (code)=>{
                    // After the process closes, output its collected stdout and stderr, if any
                    stdout && process.stdout.write(stdout);
                    stderr && process.stderr.write(stderr);
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`lint-main.js exited with code ${code}`));
                    }
                });
            });
        });
        // Await completion of all processes
        const results = yield Promise.allSettled(promises);
        return results.every((result)=>result.status === 'fulfilled');
    });
    return _lint.apply(this, arguments);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvbGludC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGhpcyBlbnRyeSBwb2ludCBmb3IgbGludCBkaXZpZGVzIHRoZSBsaXN0IG9mIHJlcG9zIGludG8gYmF0Y2hlcyBhbmQgc3Bhd25zIGxpbnQtbWFpbiBwcm9jZXNzZXMgdG8gZG8gdGhlIHdvcmsuXG4gKiBTZWUgbGludC1tYWluLnRzIGZvciBkZXRhaWxzLlxuICpcbiAqIFNhZGx5LCB0aGUgY29sb3JpemF0aW9uIGZyb20gRVNMaW50IHN0eWxpc2ggaXMgbG9zdCB3aGVuIHNwYXduaW5nIGNoaWxkIHByb2Nlc3Nlcy5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7IHNwYXduIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgZGlybmFtZSBmcm9tICcuLi9jb21tb24vZGlybmFtZS5qcyc7XG5pbXBvcnQgeyBSZXBvIH0gZnJvbSAnLi4vYnJvd3Nlci1hbmQtbm9kZS9QZXJlbm5pYWxUeXBlcy5qcyc7XG5pbXBvcnQgdHN4Q29tbWFuZCBmcm9tICcuLi9jb21tb24vdHN4Q29tbWFuZC5qcyc7XG5pbXBvcnQgZGl2aWRlSW50b0JhdGNoZXMgZnJvbSAnLi9kaXZpZGVJbnRvQmF0Y2hlcy5qcyc7XG5pbXBvcnQgeyBERUZBVUxUX01BWF9QUk9DRVNTRVMsIExpbnRPcHRpb25zIH0gZnJvbSAnLi9nZXRMaW50Q0xJT3B0aW9ucy5qcyc7XG5cbi8vIEB0cy1leHBlY3QtZXJyb3IgLSB1bnRpbCB3ZSBoYXZlIFwidHlwZVwiOiBcIm1vZHVsZVwiIGluIG91ciBwYWNrYWdlLmpzb25cbmNvbnN0IF9fZGlybmFtZSA9IGRpcm5hbWUoIGltcG9ydC5tZXRhLnVybCApO1xuXG5jb25zdCBsaW50TWFpblBhdGggPSBwYXRoLmpvaW4oIF9fZGlybmFtZSwgJ2xpbnQtbWFpbi50cycgKTtcblxuLy8gRm9yIGRlYnVnZ2luZyB0aGUgb3B0aW9ucyBhbmQgbWFraW5nIHN1cmUgdGhleSBwYXNzIHRocm91Z2ggY29ycmVjdGx5XG5leHBvcnQgY29uc3QgREVCVUdfUEhFVF9MSU5UID0gZmFsc2U7XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIGxpbnQoIHJlcG9zOiBSZXBvW10sIHByb3ZpZGVkT3B0aW9ucz86IExpbnRPcHRpb25zICk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICByZXBvcyA9IF8udW5pcSggcmVwb3MgKTsgLy8gRG9uJ3QgZG91YmxlIGxpbnQgcmVwb3NcbiAgYXNzZXJ0KCByZXBvcy5sZW5ndGggPiAwLCAnbm8gcmVwb3MgcHJvdmlkZWQgdG8gbGludCcgKTtcblxuICBjb25zdCBvcHRpb25zID0gXy5hc3NpZ25Jbigge1xuXG4gICAgLy8gQ2FjaGUgcmVzdWx0cyBmb3IgYSBzcGVlZCBib29zdCwgYnV0IGNsZWFuIGNhY2hlIGlmIHRoZSBsaW50IHJ1bGVzIG9yIGNvbmZpZ3VyYXRpb24gaGFzIGNoYW5nZWRcbiAgICBjbGVhbjogZmFsc2UsXG5cbiAgICAvLyBGaXggdGhpbmdzIHRoYXQgY2FuIGJlIGF1dG8tZml4ZWQgKHdyaXR0ZW4gdG8gZGlzaylcbiAgICBmaXg6IGZhbHNlLFxuXG4gICAgcHJvY2Vzc2VzOiBERUZBVUxUX01BWF9QUk9DRVNTRVNcbiAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cblxuICBjb25zdCByZXBvQmF0Y2hlcyA9IGRpdmlkZUludG9CYXRjaGVzKCByZXBvcywgb3B0aW9ucy5wcm9jZXNzZXMgKTtcblxuICBpZiAoIERFQlVHX1BIRVRfTElOVCApIHtcbiAgICBjb25zb2xlLmxvZyggJ2xpbnQuanMgcmVwb3MnLCByZXBvcyApO1xuICAgIGNvbnNvbGUubG9nKCAnbGludC5qcyBjbGVhbicsIG9wdGlvbnMuY2xlYW4gKTtcbiAgICBjb25zb2xlLmxvZyggJ2xpbnQuanMgZml4Jywgb3B0aW9ucy5maXggKTtcbiAgICBjb25zb2xlLmxvZyggJ2xpbnQuanMgcHJvY2Vzc2VzJywgb3B0aW9ucy5wcm9jZXNzZXMgKTtcbiAgICBjb25zb2xlLmxvZyggJ2xpbnQuanMgcmVwb0JhdGNoZXMnLCByZXBvQmF0Y2hlcyApO1xuICB9XG5cbiAgLy8gc3Bhd24gbm9kZSBsaW50LW1haW4uanMgZm9yIGVhY2ggYmF0Y2ggYW5kIHdhaXQgZm9yIGFsbCB0byBjb21wbGV0ZSB1c2luZyBjaGlsZCBwcm9jZXNzXG4gIGNvbnN0IHByb21pc2VzID0gcmVwb0JhdGNoZXMubWFwKCBiYXRjaCA9PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KCAoIHJlc29sdmUsIHJlamVjdCApID0+IHtcblxuICAgICAgY29uc3QgY2hpbGQgPSBzcGF3biggdHN4Q29tbWFuZCwgW1xuICAgICAgICAgIGxpbnRNYWluUGF0aCxcbiAgICAgICAgICBgLS1yZXBvcz0ke2JhdGNoLmpvaW4oICcsJyApfWAsXG4gICAgICAgICAgYC0tY2xlYW49JHtvcHRpb25zLmNsZWFufWAsXG4gICAgICAgICAgYC0tZml4PSR7b3B0aW9ucy5maXh9YFxuICAgICAgICBdLCB7XG4gICAgICAgICAgc3RkaW86IFsgJ2lnbm9yZScsICdwaXBlJywgJ3BpcGUnIF0sXG4gICAgICAgICAgc2hlbGw6IHByb2Nlc3MucGxhdGZvcm0uc3RhcnRzV2l0aCggJ3dpbicgKVxuICAgICAgICB9XG4gICAgICApO1xuICAgICAgREVCVUdfUEhFVF9MSU5UICYmIGNvbnNvbGUubG9nKCAnU1BBV04gT05DRSBvbiBiYXRjaCcsIGJhdGNoICk7XG5cbiAgICAgIGxldCBzdGRvdXQgPSAnJztcbiAgICAgIGxldCBzdGRlcnIgPSAnJztcblxuICAgICAgY2hpbGQuc3Rkb3V0Lm9uKCAnZGF0YScsIGRhdGEgPT4geyBzdGRvdXQgKz0gZGF0YS50b1N0cmluZygpOyB9ICk7XG4gICAgICBjaGlsZC5zdGRlcnIub24oICdkYXRhJywgZGF0YSA9PiB7IHN0ZGVyciArPSBkYXRhLnRvU3RyaW5nKCk7IH0gKTtcblxuICAgICAgY2hpbGQub24oICdjbG9zZScsICggY29kZTogbnVtYmVyICkgPT4ge1xuXG4gICAgICAgIC8vIEFmdGVyIHRoZSBwcm9jZXNzIGNsb3Nlcywgb3V0cHV0IGl0cyBjb2xsZWN0ZWQgc3Rkb3V0IGFuZCBzdGRlcnIsIGlmIGFueVxuICAgICAgICBzdGRvdXQgJiYgcHJvY2Vzcy5zdGRvdXQud3JpdGUoIHN0ZG91dCApO1xuICAgICAgICBzdGRlcnIgJiYgcHJvY2Vzcy5zdGRlcnIud3JpdGUoIHN0ZGVyciApO1xuXG4gICAgICAgIGlmICggY29kZSA9PT0gMCApIHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcmVqZWN0KCBuZXcgRXJyb3IoIGBsaW50LW1haW4uanMgZXhpdGVkIHdpdGggY29kZSAke2NvZGV9YCApICk7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICB9ICk7XG4gIH0gKTtcblxuICAvLyBBd2FpdCBjb21wbGV0aW9uIG9mIGFsbCBwcm9jZXNzZXNcbiAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IFByb21pc2UuYWxsU2V0dGxlZCggcHJvbWlzZXMgKTtcbiAgcmV0dXJuIHJlc3VsdHMuZXZlcnkoIHJlc3VsdCA9PiByZXN1bHQuc3RhdHVzID09PSAnZnVsZmlsbGVkJyApO1xufSJdLCJuYW1lcyI6WyJhc3NlcnQiLCJzcGF3biIsIl8iLCJwYXRoIiwiZGlybmFtZSIsInRzeENvbW1hbmQiLCJkaXZpZGVJbnRvQmF0Y2hlcyIsIkRFRkFVTFRfTUFYX1BST0NFU1NFUyIsIl9fZGlybmFtZSIsInVybCIsImxpbnRNYWluUGF0aCIsImpvaW4iLCJERUJVR19QSEVUX0xJTlQiLCJsaW50IiwicmVwb3MiLCJwcm92aWRlZE9wdGlvbnMiLCJ1bmlxIiwibGVuZ3RoIiwib3B0aW9ucyIsImFzc2lnbkluIiwiY2xlYW4iLCJmaXgiLCJwcm9jZXNzZXMiLCJyZXBvQmF0Y2hlcyIsImNvbnNvbGUiLCJsb2ciLCJwcm9taXNlcyIsIm1hcCIsImJhdGNoIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJjaGlsZCIsInN0ZGlvIiwic2hlbGwiLCJwcm9jZXNzIiwicGxhdGZvcm0iLCJzdGFydHNXaXRoIiwic3Rkb3V0Iiwic3RkZXJyIiwib24iLCJkYXRhIiwidG9TdHJpbmciLCJjb2RlIiwid3JpdGUiLCJFcnJvciIsInJlc3VsdHMiLCJhbGxTZXR0bGVkIiwiZXZlcnkiLCJyZXN1bHQiLCJzdGF0dXMiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7Ozs7Ozs7Q0FRQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxPQUFPQSxZQUFZLFNBQVM7QUFDNUIsU0FBU0MsS0FBSyxRQUFRLGdCQUFnQjtBQUN0QyxPQUFPQyxPQUFPLFNBQVM7QUFDdkIsT0FBT0MsVUFBVSxPQUFPO0FBQ3hCLE9BQU9DLGFBQWEsdUJBQXVCO0FBRTNDLE9BQU9DLGdCQUFnQiwwQkFBMEI7QUFDakQsT0FBT0MsdUJBQXVCLHlCQUF5QjtBQUN2RCxTQUFTQyxxQkFBcUIsUUFBcUIseUJBQXlCO0FBRTVFLHdFQUF3RTtBQUN4RSxNQUFNQyxZQUFZSixRQUFTLFlBQVlLLEdBQUc7QUFFMUMsTUFBTUMsZUFBZVAsS0FBS1EsSUFBSSxDQUFFSCxXQUFXO0FBRTNDLHdFQUF3RTtBQUN4RSxPQUFPLE1BQU1JLGtCQUFrQixNQUFNO0FBRXJDLHdCQUE4QkMsS0FBTUMsS0FBYSxFQUFFQyxlQUE2QjtXQUFsREY7O1NBQUFBO0lBQUFBLFFBQWYsb0JBQUEsVUFBcUJDLEtBQWEsRUFBRUMsZUFBNkI7UUFDOUVELFFBQVFaLEVBQUVjLElBQUksQ0FBRUYsUUFBUywwQkFBMEI7UUFDbkRkLE9BQVFjLE1BQU1HLE1BQU0sR0FBRyxHQUFHO1FBRTFCLE1BQU1DLFVBQVVoQixFQUFFaUIsUUFBUSxDQUFFO1lBRTFCLGtHQUFrRztZQUNsR0MsT0FBTztZQUVQLHNEQUFzRDtZQUN0REMsS0FBSztZQUVMQyxXQUFXZjtRQUNiLEdBQUdRO1FBR0gsTUFBTVEsY0FBY2pCLGtCQUFtQlEsT0FBT0ksUUFBUUksU0FBUztRQUUvRCxJQUFLVixpQkFBa0I7WUFDckJZLFFBQVFDLEdBQUcsQ0FBRSxpQkFBaUJYO1lBQzlCVSxRQUFRQyxHQUFHLENBQUUsaUJBQWlCUCxRQUFRRSxLQUFLO1lBQzNDSSxRQUFRQyxHQUFHLENBQUUsZUFBZVAsUUFBUUcsR0FBRztZQUN2Q0csUUFBUUMsR0FBRyxDQUFFLHFCQUFxQlAsUUFBUUksU0FBUztZQUNuREUsUUFBUUMsR0FBRyxDQUFFLHVCQUF1QkY7UUFDdEM7UUFFQSwwRkFBMEY7UUFDMUYsTUFBTUcsV0FBV0gsWUFBWUksR0FBRyxDQUFFQyxDQUFBQTtZQUNoQyxPQUFPLElBQUlDLFFBQWUsQ0FBRUMsU0FBU0M7Z0JBRW5DLE1BQU1DLFFBQVEvQixNQUFPSSxZQUFZO29CQUM3Qks7b0JBQ0EsQ0FBQyxRQUFRLEVBQUVrQixNQUFNakIsSUFBSSxDQUFFLE1BQU87b0JBQzlCLENBQUMsUUFBUSxFQUFFTyxRQUFRRSxLQUFLLEVBQUU7b0JBQzFCLENBQUMsTUFBTSxFQUFFRixRQUFRRyxHQUFHLEVBQUU7aUJBQ3ZCLEVBQUU7b0JBQ0RZLE9BQU87d0JBQUU7d0JBQVU7d0JBQVE7cUJBQVE7b0JBQ25DQyxPQUFPQyxRQUFRQyxRQUFRLENBQUNDLFVBQVUsQ0FBRTtnQkFDdEM7Z0JBRUZ6QixtQkFBbUJZLFFBQVFDLEdBQUcsQ0FBRSx1QkFBdUJHO2dCQUV2RCxJQUFJVSxTQUFTO2dCQUNiLElBQUlDLFNBQVM7Z0JBRWJQLE1BQU1NLE1BQU0sQ0FBQ0UsRUFBRSxDQUFFLFFBQVFDLENBQUFBO29CQUFVSCxVQUFVRyxLQUFLQyxRQUFRO2dCQUFJO2dCQUM5RFYsTUFBTU8sTUFBTSxDQUFDQyxFQUFFLENBQUUsUUFBUUMsQ0FBQUE7b0JBQVVGLFVBQVVFLEtBQUtDLFFBQVE7Z0JBQUk7Z0JBRTlEVixNQUFNUSxFQUFFLENBQUUsU0FBUyxDQUFFRztvQkFFbkIsMkVBQTJFO29CQUMzRUwsVUFBVUgsUUFBUUcsTUFBTSxDQUFDTSxLQUFLLENBQUVOO29CQUNoQ0MsVUFBVUosUUFBUUksTUFBTSxDQUFDSyxLQUFLLENBQUVMO29CQUVoQyxJQUFLSSxTQUFTLEdBQUk7d0JBQ2hCYjtvQkFDRixPQUNLO3dCQUNIQyxPQUFRLElBQUljLE1BQU8sQ0FBQyw4QkFBOEIsRUFBRUYsTUFBTTtvQkFDNUQ7Z0JBQ0Y7WUFDRjtRQUNGO1FBRUEsb0NBQW9DO1FBQ3BDLE1BQU1HLFVBQVUsTUFBTWpCLFFBQVFrQixVQUFVLENBQUVyQjtRQUMxQyxPQUFPb0IsUUFBUUUsS0FBSyxDQUFFQyxDQUFBQSxTQUFVQSxPQUFPQyxNQUFNLEtBQUs7SUFDcEQ7V0FuRThCckMifQ==