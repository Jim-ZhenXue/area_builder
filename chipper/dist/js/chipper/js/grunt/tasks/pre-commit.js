// Copyright 2022-2024, University of Colorado Boulder
/**
 * Runs tasks for pre-commit, including lint and qunit testing.
 *
 * Should only be run when developing in main, because when dependency shas are checked out for one sim,
 * they will likely be inconsistent for other repos which would cause failures for cross-repo processes like type checking.
 * This means when running maintenance release steps, you may need to run git commands with --no-verify.
 *
 * Timing data is streamed through phetTimingLog, please see that file for how to see the results live and/or afterwards.
 *
 * USAGE:
 * cd ${repo}
 * sage run ../chipper/js/scripts/pre-commit.js
 *
 * OPTIONS:
 * --console: outputs information to the console for debugging
 * --allTasks: forces all tasks to run, even if they are disabled in the local preferences
 * --changed: run on all repos with working copy changes
 * --all: run on all repos
 * --absolute: output paths that WebStorm External Tools can parse and hyperlink
 *
 * TASKS:
 * --lint: runs eslint on the repo
 * --report-media: checks for missing or unused media files
 * --type-check: runs type-check.js
 * --unit-test: runs qunit tests
 * --phet-io-api: compares the PhET-iO API with the previous version
 *
 * DEFAULTS in build-local.json
 * By default all tasks will be run for every repo if that repo supports the task. Specify opt-out behavior for this
 * grunt task AND the actual pre-commit hooks via the 'hookPreCommit` key in build-local.json.
 * Keys are the name of the task (see above), and values are boolean, true means test that task. Use '*' to apply to
 * all tasks. For example:
 * MK: opts out of phet-io api checking:
 * "hookPreCommit": {
 *   "phet-io-api": false,
 * }
 * SR: runs them manually, and turns them off for the git hooks:
 * "hookPreCommit": {
 *   "*": false, // This key takes precedent, so all other keys here would be ignored.
 * },
 * If someone didn't want linting or type checking:
 * "hookPreCommit": {
 *   "lint": false,
 *   "type-check": false,
 * },
 *
 * See also phet-info/git-template-dir/hooks/pre-commit for how this is used in precommit hooks.
 *
 * @author Sam Reid (PhET Interactive Simulations)
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
import path from 'path';
import buildLocal from '../../../../perennial-alias/js/common/buildLocal.js';
import dirname from '../../../../perennial-alias/js/common/dirname.js';
import execute from '../../../../perennial-alias/js/common/execute.js';
import getActiveRepos from '../../../../perennial-alias/js/common/getActiveRepos.js';
import phetTimingLog from '../../../../perennial-alias/js/common/phetTimingLog.js';
import tsxCommand from '../../../../perennial-alias/js/common/tsxCommand.js';
import getOption, { isOptionKeyProvided } from '../../../../perennial-alias/js/grunt/tasks/util/getOption.js';
import getRepo from '../../../../perennial-alias/js/grunt/tasks/util/getRepo.js';
import getReposWithWorkingCopyChanges from '../../common/getReposWithWorkingCopyChanges.js';
// These repos do not require precommit hooks to be run
const optOutRepos = [
    // The files here are predominantly autogenerated and unlikely to be broken. Also, every repo depends on babel
    // so running precommit hooks here takes a significant amount of time
    'babel'
];
const repo = getRepo();
const outputToConsole = getOption('console'); // Console logging via --console
const absolute = getOption('absolute'); // Output paths that WebStorm External Tools can parse and hyperlink
_async_to_generator(function*() {
    // Re-spawn the same process on repos with working copy changes
    if (getOption('changed')) {
        const changedRepos = yield getReposWithWorkingCopyChanges();
        const success = yield spawnOnRepos(changedRepos, outputToConsole);
        process.exit(success ? 0 : 1);
        return;
    }
    // Re-spawn the same process on all repos
    if (getOption('all')) {
        const success = yield spawnOnRepos(getActiveRepos(), outputToConsole);
        process.exit(success ? 0 : 1);
        return;
    }
    if (optOutRepos.includes(repo)) {
        console.log(`Skipping precommit hooks for the repo: ${repo}`);
        process.exit(0);
    }
    const possibleTasks = [
        'lint',
        'report-media',
        'type-check',
        'unit-test',
        'phet-io-api'
    ];
    // By default, run all tasks
    let tasksToRun = [
        ...possibleTasks
    ];
    const OPT_OUT_ALL = '*'; // Key to opt out of all tasks
    // check local preferences for overrides for which tasks to turn 'off'
    const hookPreCommit = buildLocal.hookPreCommit;
    if (hookPreCommit && hookPreCommit[OPT_OUT_ALL] === false) {
        outputToConsole && console.log('all tasks opted out from build-local.json');
        tasksToRun.length = 0;
    }
    possibleTasks.forEach((task)=>{
        // process the buildLocal preferences first
        if (hookPreCommit && hookPreCommit[task] === false) {
            outputToConsole && console.log('task opted out from build-local.json:', task);
            tasksToRun = tasksToRun.filter((t)=>t !== task);
        }
        // process the CLI overrides
        if (isOptionKeyProvided(task)) {
            if (getOption(task)) {
                if (!tasksToRun.includes(task)) {
                    outputToConsole && console.log('task added from CLI:', task);
                    tasksToRun.push(task);
                }
            } else {
                outputToConsole && console.log('task removed from CLI:', task);
                tasksToRun = tasksToRun.filter((t)=>t !== task);
            }
        }
    });
    if (getOption('allTasks')) {
        outputToConsole && console.log('forcing all tasks to run');
        tasksToRun = [
            ...possibleTasks
        ];
    }
    outputToConsole && console.log('tasks to run:', tasksToRun);
    const precommitSuccess = yield phetTimingLog.startAsync(`pre-commit repo="${repo}"`, /*#__PURE__*/ _async_to_generator(function*() {
        outputToConsole && console.log('repo:', repo);
        const taskResults = yield Promise.allSettled(tasksToRun.map((task)=>{
            return phetTimingLog.startAsync(task, /*#__PURE__*/ _async_to_generator(function*() {
                const results = yield execute(tsxCommand, [
                    '../chipper/js/common/pre-commit-main.ts',
                    `--command=${task}`,
                    `--repo=${repo}`,
                    outputToConsole ? '--console' : '',
                    absolute ? '--absolute' : ''
                ], '../chipper', {
                    errors: 'resolve'
                });
                assert(typeof results !== 'string');
                results.stdout && results.stdout.trim().length > 0 && console.log(results.stdout);
                results.stderr && results.stderr.trim().length > 0 && console.log(results.stderr);
                if (results.code === 0) {
                    return {
                        task: task,
                        success: true
                    };
                } else {
                    let message = 'Task failed: ' + task;
                    if (results.stdout && results.stdout.trim().length > 0) {
                        message = message + ': ' + results.stdout;
                    }
                    if (results.stderr && results.stderr.trim().length > 0) {
                        message = message + ': ' + results.stderr;
                    }
                    return {
                        task: task,
                        success: false,
                        message: message
                    };
                }
            }), {
                depth: 1
            });
        }));
        taskResults.forEach((result)=>{
            if (result.status === 'fulfilled') {
                if (result.value.success) {
                    console.log(`Task ${result.value.task} succeeded`);
                } else {
                    console.error(result.value.message);
                }
            } else {
                console.error(`Task ${result.reason.task} encountered an error: ${result.reason.message}`);
            }
        });
        return taskResults.every((result)=>result.status === 'fulfilled' && result.value.success);
    }));
    // generatePhetioMacroAPI is preventing exit for unknown reasons, so manually exit here
    phetTimingLog.close(()=>process.exit(precommitSuccess ? 0 : 1));
})();
function spawnOnRepos(repos, outputToConsole) {
    return _spawnOnRepos.apply(this, arguments);
}
function _spawnOnRepos() {
    _spawnOnRepos = /**
 * Spawns the same process on each repo in the list
 */ _async_to_generator(function*(repos, outputToConsole) {
        const startTime = Date.now();
        let success = true;
        // This is done sequentially so we don't spawn a bunch of uncached type-check at once, but in the future we may want to optimize
        // to run one sequentially then the rest in parallel
        for(let i = 0; i < repos.length; i++){
            process.stdout.write(repos[i] + ': ');
            // get all argv, but drop out --all and --changed
            const args = process.argv.slice(2).filter((arg)=>![
                    '--all',
                    '--changed'
                ].includes(arg));
            outputToConsole && console.log('spawning pre-commit.ts with args:', args);
            // @ts-expect-error
            const __dirname = dirname(import.meta.url);
            // get the cwd to the repo, ../../../../repo
            const cwd = path.resolve(__dirname, '../../../../', repos[i]);
            const result = yield execute(tsxCommand, [
                '../chipper/js/grunt/tasks/pre-commit.ts',
                ...args
            ], cwd, {
                // resolve errors so Promise.all doesn't fail on first repo that cannot pull/rebase
                errors: 'resolve'
            });
            outputToConsole && console.log('result:', result);
            if (result.code === 0) {
                console.log('Success');
            } else {
                console.log();
                result.stdout.trim().length > 0 && console.log(result.stdout.trim());
                result.stderr.trim().length > 0 && console.log(result.stderr.trim());
                success = false;
            }
        }
        console.log('Done in ' + (Date.now() - startTime) + 'ms');
        return success;
    });
    return _spawnOnRepos.apply(this, arguments);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3Rhc2tzL3ByZS1jb21taXQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUnVucyB0YXNrcyBmb3IgcHJlLWNvbW1pdCwgaW5jbHVkaW5nIGxpbnQgYW5kIHF1bml0IHRlc3RpbmcuXG4gKlxuICogU2hvdWxkIG9ubHkgYmUgcnVuIHdoZW4gZGV2ZWxvcGluZyBpbiBtYWluLCBiZWNhdXNlIHdoZW4gZGVwZW5kZW5jeSBzaGFzIGFyZSBjaGVja2VkIG91dCBmb3Igb25lIHNpbSxcbiAqIHRoZXkgd2lsbCBsaWtlbHkgYmUgaW5jb25zaXN0ZW50IGZvciBvdGhlciByZXBvcyB3aGljaCB3b3VsZCBjYXVzZSBmYWlsdXJlcyBmb3IgY3Jvc3MtcmVwbyBwcm9jZXNzZXMgbGlrZSB0eXBlIGNoZWNraW5nLlxuICogVGhpcyBtZWFucyB3aGVuIHJ1bm5pbmcgbWFpbnRlbmFuY2UgcmVsZWFzZSBzdGVwcywgeW91IG1heSBuZWVkIHRvIHJ1biBnaXQgY29tbWFuZHMgd2l0aCAtLW5vLXZlcmlmeS5cbiAqXG4gKiBUaW1pbmcgZGF0YSBpcyBzdHJlYW1lZCB0aHJvdWdoIHBoZXRUaW1pbmdMb2csIHBsZWFzZSBzZWUgdGhhdCBmaWxlIGZvciBob3cgdG8gc2VlIHRoZSByZXN1bHRzIGxpdmUgYW5kL29yIGFmdGVyd2FyZHMuXG4gKlxuICogVVNBR0U6XG4gKiBjZCAke3JlcG99XG4gKiBzYWdlIHJ1biAuLi9jaGlwcGVyL2pzL3NjcmlwdHMvcHJlLWNvbW1pdC5qc1xuICpcbiAqIE9QVElPTlM6XG4gKiAtLWNvbnNvbGU6IG91dHB1dHMgaW5mb3JtYXRpb24gdG8gdGhlIGNvbnNvbGUgZm9yIGRlYnVnZ2luZ1xuICogLS1hbGxUYXNrczogZm9yY2VzIGFsbCB0YXNrcyB0byBydW4sIGV2ZW4gaWYgdGhleSBhcmUgZGlzYWJsZWQgaW4gdGhlIGxvY2FsIHByZWZlcmVuY2VzXG4gKiAtLWNoYW5nZWQ6IHJ1biBvbiBhbGwgcmVwb3Mgd2l0aCB3b3JraW5nIGNvcHkgY2hhbmdlc1xuICogLS1hbGw6IHJ1biBvbiBhbGwgcmVwb3NcbiAqIC0tYWJzb2x1dGU6IG91dHB1dCBwYXRocyB0aGF0IFdlYlN0b3JtIEV4dGVybmFsIFRvb2xzIGNhbiBwYXJzZSBhbmQgaHlwZXJsaW5rXG4gKlxuICogVEFTS1M6XG4gKiAtLWxpbnQ6IHJ1bnMgZXNsaW50IG9uIHRoZSByZXBvXG4gKiAtLXJlcG9ydC1tZWRpYTogY2hlY2tzIGZvciBtaXNzaW5nIG9yIHVudXNlZCBtZWRpYSBmaWxlc1xuICogLS10eXBlLWNoZWNrOiBydW5zIHR5cGUtY2hlY2suanNcbiAqIC0tdW5pdC10ZXN0OiBydW5zIHF1bml0IHRlc3RzXG4gKiAtLXBoZXQtaW8tYXBpOiBjb21wYXJlcyB0aGUgUGhFVC1pTyBBUEkgd2l0aCB0aGUgcHJldmlvdXMgdmVyc2lvblxuICpcbiAqIERFRkFVTFRTIGluIGJ1aWxkLWxvY2FsLmpzb25cbiAqIEJ5IGRlZmF1bHQgYWxsIHRhc2tzIHdpbGwgYmUgcnVuIGZvciBldmVyeSByZXBvIGlmIHRoYXQgcmVwbyBzdXBwb3J0cyB0aGUgdGFzay4gU3BlY2lmeSBvcHQtb3V0IGJlaGF2aW9yIGZvciB0aGlzXG4gKiBncnVudCB0YXNrIEFORCB0aGUgYWN0dWFsIHByZS1jb21taXQgaG9va3MgdmlhIHRoZSAnaG9va1ByZUNvbW1pdGAga2V5IGluIGJ1aWxkLWxvY2FsLmpzb24uXG4gKiBLZXlzIGFyZSB0aGUgbmFtZSBvZiB0aGUgdGFzayAoc2VlIGFib3ZlKSwgYW5kIHZhbHVlcyBhcmUgYm9vbGVhbiwgdHJ1ZSBtZWFucyB0ZXN0IHRoYXQgdGFzay4gVXNlICcqJyB0byBhcHBseSB0b1xuICogYWxsIHRhc2tzLiBGb3IgZXhhbXBsZTpcbiAqIE1LOiBvcHRzIG91dCBvZiBwaGV0LWlvIGFwaSBjaGVja2luZzpcbiAqIFwiaG9va1ByZUNvbW1pdFwiOiB7XG4gKiAgIFwicGhldC1pby1hcGlcIjogZmFsc2UsXG4gKiB9XG4gKiBTUjogcnVucyB0aGVtIG1hbnVhbGx5LCBhbmQgdHVybnMgdGhlbSBvZmYgZm9yIHRoZSBnaXQgaG9va3M6XG4gKiBcImhvb2tQcmVDb21taXRcIjoge1xuICogICBcIipcIjogZmFsc2UsIC8vIFRoaXMga2V5IHRha2VzIHByZWNlZGVudCwgc28gYWxsIG90aGVyIGtleXMgaGVyZSB3b3VsZCBiZSBpZ25vcmVkLlxuICogfSxcbiAqIElmIHNvbWVvbmUgZGlkbid0IHdhbnQgbGludGluZyBvciB0eXBlIGNoZWNraW5nOlxuICogXCJob29rUHJlQ29tbWl0XCI6IHtcbiAqICAgXCJsaW50XCI6IGZhbHNlLFxuICogICBcInR5cGUtY2hlY2tcIjogZmFsc2UsXG4gKiB9LFxuICpcbiAqIFNlZSBhbHNvIHBoZXQtaW5mby9naXQtdGVtcGxhdGUtZGlyL2hvb2tzL3ByZS1jb21taXQgZm9yIGhvdyB0aGlzIGlzIHVzZWQgaW4gcHJlY29tbWl0IGhvb2tzLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgYnVpbGRMb2NhbCBmcm9tICcuLi8uLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvY29tbW9uL2J1aWxkTG9jYWwuanMnO1xuaW1wb3J0IGRpcm5hbWUgZnJvbSAnLi4vLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2NvbW1vbi9kaXJuYW1lLmpzJztcbmltcG9ydCBleGVjdXRlIGZyb20gJy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZXhlY3V0ZS5qcyc7XG5pbXBvcnQgZ2V0QWN0aXZlUmVwb3MgZnJvbSAnLi4vLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2NvbW1vbi9nZXRBY3RpdmVSZXBvcy5qcyc7XG5pbXBvcnQgeyBSZXBvIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2Jyb3dzZXItYW5kLW5vZGUvUGVyZW5uaWFsVHlwZXMuanMnO1xuaW1wb3J0IHBoZXRUaW1pbmdMb2cgZnJvbSAnLi4vLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2NvbW1vbi9waGV0VGltaW5nTG9nLmpzJztcbmltcG9ydCB0c3hDb21tYW5kIGZyb20gJy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vdHN4Q29tbWFuZC5qcyc7XG5pbXBvcnQgZ2V0T3B0aW9uLCB7IGlzT3B0aW9uS2V5UHJvdmlkZWQgfSBmcm9tICcuLi8uLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvZ3J1bnQvdGFza3MvdXRpbC9nZXRPcHRpb24uanMnO1xuaW1wb3J0IGdldFJlcG8gZnJvbSAnLi4vLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2dydW50L3Rhc2tzL3V0aWwvZ2V0UmVwby5qcyc7XG5pbXBvcnQgZ2V0UmVwb3NXaXRoV29ya2luZ0NvcHlDaGFuZ2VzIGZyb20gJy4uLy4uL2NvbW1vbi9nZXRSZXBvc1dpdGhXb3JraW5nQ29weUNoYW5nZXMuanMnO1xuXG4vLyBUaGVzZSByZXBvcyBkbyBub3QgcmVxdWlyZSBwcmVjb21taXQgaG9va3MgdG8gYmUgcnVuXG5jb25zdCBvcHRPdXRSZXBvcyA9IFtcblxuICAvLyBUaGUgZmlsZXMgaGVyZSBhcmUgcHJlZG9taW5hbnRseSBhdXRvZ2VuZXJhdGVkIGFuZCB1bmxpa2VseSB0byBiZSBicm9rZW4uIEFsc28sIGV2ZXJ5IHJlcG8gZGVwZW5kcyBvbiBiYWJlbFxuICAvLyBzbyBydW5uaW5nIHByZWNvbW1pdCBob29rcyBoZXJlIHRha2VzIGEgc2lnbmlmaWNhbnQgYW1vdW50IG9mIHRpbWVcbiAgJ2JhYmVsJ1xuXTtcblxuY29uc3QgcmVwbyA9IGdldFJlcG8oKTtcblxuY29uc3Qgb3V0cHV0VG9Db25zb2xlID0gZ2V0T3B0aW9uKCAnY29uc29sZScgKTsgLy8gQ29uc29sZSBsb2dnaW5nIHZpYSAtLWNvbnNvbGVcbmNvbnN0IGFic29sdXRlID0gZ2V0T3B0aW9uKCAnYWJzb2x1dGUnICk7IC8vIE91dHB1dCBwYXRocyB0aGF0IFdlYlN0b3JtIEV4dGVybmFsIFRvb2xzIGNhbiBwYXJzZSBhbmQgaHlwZXJsaW5rXG5cbiggYXN5bmMgKCkgPT4ge1xuXG4gIC8vIFJlLXNwYXduIHRoZSBzYW1lIHByb2Nlc3Mgb24gcmVwb3Mgd2l0aCB3b3JraW5nIGNvcHkgY2hhbmdlc1xuICBpZiAoIGdldE9wdGlvbiggJ2NoYW5nZWQnICkgKSB7XG4gICAgY29uc3QgY2hhbmdlZFJlcG9zID0gYXdhaXQgZ2V0UmVwb3NXaXRoV29ya2luZ0NvcHlDaGFuZ2VzKCk7XG4gICAgY29uc3Qgc3VjY2VzcyA9IGF3YWl0IHNwYXduT25SZXBvcyggY2hhbmdlZFJlcG9zLCBvdXRwdXRUb0NvbnNvbGUgKTtcbiAgICBwcm9jZXNzLmV4aXQoIHN1Y2Nlc3MgPyAwIDogMSApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIFJlLXNwYXduIHRoZSBzYW1lIHByb2Nlc3Mgb24gYWxsIHJlcG9zXG4gIGlmICggZ2V0T3B0aW9uKCAnYWxsJyApICkge1xuICAgIGNvbnN0IHN1Y2Nlc3MgPSBhd2FpdCBzcGF3bk9uUmVwb3MoIGdldEFjdGl2ZVJlcG9zKCksIG91dHB1dFRvQ29uc29sZSApO1xuICAgIHByb2Nlc3MuZXhpdCggc3VjY2VzcyA/IDAgOiAxICk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCBvcHRPdXRSZXBvcy5pbmNsdWRlcyggcmVwbyApICkge1xuICAgIGNvbnNvbGUubG9nKCBgU2tpcHBpbmcgcHJlY29tbWl0IGhvb2tzIGZvciB0aGUgcmVwbzogJHtyZXBvfWAgKTtcbiAgICBwcm9jZXNzLmV4aXQoIDAgKTtcbiAgfVxuXG4gIGNvbnN0IHBvc3NpYmxlVGFza3MgPSBbICdsaW50JywgJ3JlcG9ydC1tZWRpYScsICd0eXBlLWNoZWNrJywgJ3VuaXQtdGVzdCcsICdwaGV0LWlvLWFwaScgXTtcblxuICAvLyBCeSBkZWZhdWx0LCBydW4gYWxsIHRhc2tzXG4gIGxldCB0YXNrc1RvUnVuID0gWyAuLi5wb3NzaWJsZVRhc2tzIF07XG4gIGNvbnN0IE9QVF9PVVRfQUxMID0gJyonOyAvLyBLZXkgdG8gb3B0IG91dCBvZiBhbGwgdGFza3NcblxuICAvLyBjaGVjayBsb2NhbCBwcmVmZXJlbmNlcyBmb3Igb3ZlcnJpZGVzIGZvciB3aGljaCB0YXNrcyB0byB0dXJuICdvZmYnXG4gIGNvbnN0IGhvb2tQcmVDb21taXQgPSBidWlsZExvY2FsLmhvb2tQcmVDb21taXQ7XG4gIGlmICggaG9va1ByZUNvbW1pdCAmJiBob29rUHJlQ29tbWl0WyBPUFRfT1VUX0FMTCBdID09PSBmYWxzZSApIHtcbiAgICBvdXRwdXRUb0NvbnNvbGUgJiYgY29uc29sZS5sb2coICdhbGwgdGFza3Mgb3B0ZWQgb3V0IGZyb20gYnVpbGQtbG9jYWwuanNvbicgKTtcbiAgICB0YXNrc1RvUnVuLmxlbmd0aCA9IDA7XG4gIH1cblxuICBwb3NzaWJsZVRhc2tzLmZvckVhY2goICggdGFzazogc3RyaW5nICkgPT4ge1xuXG4gICAgLy8gcHJvY2VzcyB0aGUgYnVpbGRMb2NhbCBwcmVmZXJlbmNlcyBmaXJzdFxuICAgIGlmICggaG9va1ByZUNvbW1pdCAmJiBob29rUHJlQ29tbWl0WyB0YXNrIF0gPT09IGZhbHNlICkge1xuICAgICAgb3V0cHV0VG9Db25zb2xlICYmIGNvbnNvbGUubG9nKCAndGFzayBvcHRlZCBvdXQgZnJvbSBidWlsZC1sb2NhbC5qc29uOicsIHRhc2sgKTtcbiAgICAgIHRhc2tzVG9SdW4gPSB0YXNrc1RvUnVuLmZpbHRlciggdCA9PiB0ICE9PSB0YXNrICk7XG4gICAgfVxuXG4gICAgLy8gcHJvY2VzcyB0aGUgQ0xJIG92ZXJyaWRlc1xuICAgIGlmICggaXNPcHRpb25LZXlQcm92aWRlZCggdGFzayApICkge1xuICAgICAgaWYgKCBnZXRPcHRpb24oIHRhc2sgKSApIHtcbiAgICAgICAgaWYgKCAhdGFza3NUb1J1bi5pbmNsdWRlcyggdGFzayApICkge1xuICAgICAgICAgIG91dHB1dFRvQ29uc29sZSAmJiBjb25zb2xlLmxvZyggJ3Rhc2sgYWRkZWQgZnJvbSBDTEk6JywgdGFzayApO1xuICAgICAgICAgIHRhc2tzVG9SdW4ucHVzaCggdGFzayApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgb3V0cHV0VG9Db25zb2xlICYmIGNvbnNvbGUubG9nKCAndGFzayByZW1vdmVkIGZyb20gQ0xJOicsIHRhc2sgKTtcbiAgICAgICAgdGFza3NUb1J1biA9IHRhc2tzVG9SdW4uZmlsdGVyKCB0ID0+IHQgIT09IHRhc2sgKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gKTtcblxuICBpZiAoIGdldE9wdGlvbiggJ2FsbFRhc2tzJyApICkge1xuICAgIG91dHB1dFRvQ29uc29sZSAmJiBjb25zb2xlLmxvZyggJ2ZvcmNpbmcgYWxsIHRhc2tzIHRvIHJ1bicgKTtcbiAgICB0YXNrc1RvUnVuID0gWyAuLi5wb3NzaWJsZVRhc2tzIF07XG4gIH1cblxuICBvdXRwdXRUb0NvbnNvbGUgJiYgY29uc29sZS5sb2coICd0YXNrcyB0byBydW46JywgdGFza3NUb1J1biApO1xuXG4gIGNvbnN0IHByZWNvbW1pdFN1Y2Nlc3MgPSBhd2FpdCBwaGV0VGltaW5nTG9nLnN0YXJ0QXN5bmMoIGBwcmUtY29tbWl0IHJlcG89XCIke3JlcG99XCJgLCBhc3luYyAoKSA9PiB7XG5cbiAgICBvdXRwdXRUb0NvbnNvbGUgJiYgY29uc29sZS5sb2coICdyZXBvOicsIHJlcG8gKTtcblxuICAgIGNvbnN0IHRhc2tSZXN1bHRzID0gYXdhaXQgUHJvbWlzZS5hbGxTZXR0bGVkKFxuICAgICAgdGFza3NUb1J1bi5tYXAoIHRhc2sgPT4ge1xuICAgICAgICByZXR1cm4gcGhldFRpbWluZ0xvZy5zdGFydEFzeW5jKFxuICAgICAgICAgIHRhc2ssXG4gICAgICAgICAgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IGV4ZWN1dGUoXG4gICAgICAgICAgICAgIHRzeENvbW1hbmQsXG4gICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAnLi4vY2hpcHBlci9qcy9jb21tb24vcHJlLWNvbW1pdC1tYWluLnRzJyxcbiAgICAgICAgICAgICAgICBgLS1jb21tYW5kPSR7dGFza31gLFxuICAgICAgICAgICAgICAgIGAtLXJlcG89JHtyZXBvfWAsXG4gICAgICAgICAgICAgICAgb3V0cHV0VG9Db25zb2xlID8gJy0tY29uc29sZScgOiAnJyxcbiAgICAgICAgICAgICAgICBhYnNvbHV0ZSA/ICctLWFic29sdXRlJyA6ICcnXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICcuLi9jaGlwcGVyJyxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGVycm9yczogJ3Jlc29sdmUnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBhc3NlcnQoIHR5cGVvZiByZXN1bHRzICE9PSAnc3RyaW5nJyApO1xuICAgICAgICAgICAgcmVzdWx0cy5zdGRvdXQgJiYgcmVzdWx0cy5zdGRvdXQudHJpbSgpLmxlbmd0aCA+IDAgJiYgY29uc29sZS5sb2coIHJlc3VsdHMuc3Rkb3V0ICk7XG4gICAgICAgICAgICByZXN1bHRzLnN0ZGVyciAmJiByZXN1bHRzLnN0ZGVyci50cmltKCkubGVuZ3RoID4gMCAmJiBjb25zb2xlLmxvZyggcmVzdWx0cy5zdGRlcnIgKTtcblxuICAgICAgICAgICAgaWYgKCByZXN1bHRzLmNvZGUgPT09IDAgKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IHRhc2s6IHRhc2ssIHN1Y2Nlc3M6IHRydWUgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9ICdUYXNrIGZhaWxlZDogJyArIHRhc2s7XG4gICAgICAgICAgICAgIGlmICggcmVzdWx0cy5zdGRvdXQgJiYgcmVzdWx0cy5zdGRvdXQudHJpbSgpLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UgKyAnOiAnICsgcmVzdWx0cy5zdGRvdXQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKCByZXN1bHRzLnN0ZGVyciAmJiByZXN1bHRzLnN0ZGVyci50cmltKCkubGVuZ3RoID4gMCApIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gbWVzc2FnZSArICc6ICcgKyByZXN1bHRzLnN0ZGVycjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4geyB0YXNrOiB0YXNrLCBzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogbWVzc2FnZSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgZGVwdGg6IDFcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9IClcbiAgICApO1xuXG4gICAgdGFza1Jlc3VsdHMuZm9yRWFjaCggcmVzdWx0ID0+IHtcbiAgICAgIGlmICggcmVzdWx0LnN0YXR1cyA9PT0gJ2Z1bGZpbGxlZCcgKSB7XG4gICAgICAgIGlmICggcmVzdWx0LnZhbHVlLnN1Y2Nlc3MgKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coIGBUYXNrICR7cmVzdWx0LnZhbHVlLnRhc2t9IHN1Y2NlZWRlZGAgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCByZXN1bHQudmFsdWUubWVzc2FnZSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvciggYFRhc2sgJHtyZXN1bHQucmVhc29uLnRhc2t9IGVuY291bnRlcmVkIGFuIGVycm9yOiAke3Jlc3VsdC5yZWFzb24ubWVzc2FnZX1gICk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgcmV0dXJuIHRhc2tSZXN1bHRzLmV2ZXJ5KCByZXN1bHQgPT4gcmVzdWx0LnN0YXR1cyA9PT0gJ2Z1bGZpbGxlZCcgJiYgcmVzdWx0LnZhbHVlLnN1Y2Nlc3MgKTtcbiAgfSApO1xuXG4gIC8vIGdlbmVyYXRlUGhldGlvTWFjcm9BUEkgaXMgcHJldmVudGluZyBleGl0IGZvciB1bmtub3duIHJlYXNvbnMsIHNvIG1hbnVhbGx5IGV4aXQgaGVyZVxuICBwaGV0VGltaW5nTG9nLmNsb3NlKCAoKSA9PiBwcm9jZXNzLmV4aXQoIHByZWNvbW1pdFN1Y2Nlc3MgPyAwIDogMSApICk7XG59ICkoKTtcblxuLyoqXG4gKiBTcGF3bnMgdGhlIHNhbWUgcHJvY2VzcyBvbiBlYWNoIHJlcG8gaW4gdGhlIGxpc3RcbiAqL1xuYXN5bmMgZnVuY3Rpb24gc3Bhd25PblJlcG9zKCByZXBvczogUmVwb1tdLCBvdXRwdXRUb0NvbnNvbGU6IGJvb2xlYW4gKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG5cbiAgbGV0IHN1Y2Nlc3MgPSB0cnVlO1xuXG4gIC8vIFRoaXMgaXMgZG9uZSBzZXF1ZW50aWFsbHkgc28gd2UgZG9uJ3Qgc3Bhd24gYSBidW5jaCBvZiB1bmNhY2hlZCB0eXBlLWNoZWNrIGF0IG9uY2UsIGJ1dCBpbiB0aGUgZnV0dXJlIHdlIG1heSB3YW50IHRvIG9wdGltaXplXG4gIC8vIHRvIHJ1biBvbmUgc2VxdWVudGlhbGx5IHRoZW4gdGhlIHJlc3QgaW4gcGFyYWxsZWxcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgcmVwb3MubGVuZ3RoOyBpKysgKSB7XG5cbiAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSggcmVwb3NbIGkgXSArICc6ICcgKTtcblxuICAgIC8vIGdldCBhbGwgYXJndiwgYnV0IGRyb3Agb3V0IC0tYWxsIGFuZCAtLWNoYW5nZWRcbiAgICBjb25zdCBhcmdzID0gcHJvY2Vzcy5hcmd2LnNsaWNlKCAyICkuZmlsdGVyKCBhcmcgPT4gIVsgJy0tYWxsJywgJy0tY2hhbmdlZCcgXS5pbmNsdWRlcyggYXJnICkgKTtcbiAgICBvdXRwdXRUb0NvbnNvbGUgJiYgY29uc29sZS5sb2coICdzcGF3bmluZyBwcmUtY29tbWl0LnRzIHdpdGggYXJnczonLCBhcmdzICk7XG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgY29uc3QgX19kaXJuYW1lID0gZGlybmFtZSggaW1wb3J0Lm1ldGEudXJsICk7XG5cbiAgICAvLyBnZXQgdGhlIGN3ZCB0byB0aGUgcmVwbywgLi4vLi4vLi4vLi4vcmVwb1xuICAgIGNvbnN0IGN3ZCA9IHBhdGgucmVzb2x2ZSggX19kaXJuYW1lLCAnLi4vLi4vLi4vLi4vJywgcmVwb3NbIGkgXSApO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXhlY3V0ZSggdHN4Q29tbWFuZCwgWyAnLi4vY2hpcHBlci9qcy9ncnVudC90YXNrcy9wcmUtY29tbWl0LnRzJywgLi4uYXJncyBdLCBjd2QsIHtcblxuICAgICAgLy8gcmVzb2x2ZSBlcnJvcnMgc28gUHJvbWlzZS5hbGwgZG9lc24ndCBmYWlsIG9uIGZpcnN0IHJlcG8gdGhhdCBjYW5ub3QgcHVsbC9yZWJhc2VcbiAgICAgIGVycm9yczogJ3Jlc29sdmUnXG4gICAgfSApO1xuICAgIG91dHB1dFRvQ29uc29sZSAmJiBjb25zb2xlLmxvZyggJ3Jlc3VsdDonLCByZXN1bHQgKTtcbiAgICBpZiAoIHJlc3VsdC5jb2RlID09PSAwICkge1xuICAgICAgY29uc29sZS5sb2coICdTdWNjZXNzJyApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCk7XG4gICAgICByZXN1bHQuc3Rkb3V0LnRyaW0oKS5sZW5ndGggPiAwICYmIGNvbnNvbGUubG9nKCByZXN1bHQuc3Rkb3V0LnRyaW0oKSApO1xuICAgICAgcmVzdWx0LnN0ZGVyci50cmltKCkubGVuZ3RoID4gMCAmJiBjb25zb2xlLmxvZyggcmVzdWx0LnN0ZGVyci50cmltKCkgKTtcbiAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBjb25zb2xlLmxvZyggJ0RvbmUgaW4gJyArICggRGF0ZS5ub3coKSAtIHN0YXJ0VGltZSApICsgJ21zJyApO1xuICByZXR1cm4gc3VjY2Vzcztcbn0iXSwibmFtZXMiOlsiYXNzZXJ0IiwicGF0aCIsImJ1aWxkTG9jYWwiLCJkaXJuYW1lIiwiZXhlY3V0ZSIsImdldEFjdGl2ZVJlcG9zIiwicGhldFRpbWluZ0xvZyIsInRzeENvbW1hbmQiLCJnZXRPcHRpb24iLCJpc09wdGlvbktleVByb3ZpZGVkIiwiZ2V0UmVwbyIsImdldFJlcG9zV2l0aFdvcmtpbmdDb3B5Q2hhbmdlcyIsIm9wdE91dFJlcG9zIiwicmVwbyIsIm91dHB1dFRvQ29uc29sZSIsImFic29sdXRlIiwiY2hhbmdlZFJlcG9zIiwic3VjY2VzcyIsInNwYXduT25SZXBvcyIsInByb2Nlc3MiLCJleGl0IiwiaW5jbHVkZXMiLCJjb25zb2xlIiwibG9nIiwicG9zc2libGVUYXNrcyIsInRhc2tzVG9SdW4iLCJPUFRfT1VUX0FMTCIsImhvb2tQcmVDb21taXQiLCJsZW5ndGgiLCJmb3JFYWNoIiwidGFzayIsImZpbHRlciIsInQiLCJwdXNoIiwicHJlY29tbWl0U3VjY2VzcyIsInN0YXJ0QXN5bmMiLCJ0YXNrUmVzdWx0cyIsIlByb21pc2UiLCJhbGxTZXR0bGVkIiwibWFwIiwicmVzdWx0cyIsImVycm9ycyIsInN0ZG91dCIsInRyaW0iLCJzdGRlcnIiLCJjb2RlIiwibWVzc2FnZSIsImRlcHRoIiwicmVzdWx0Iiwic3RhdHVzIiwidmFsdWUiLCJlcnJvciIsInJlYXNvbiIsImV2ZXJ5IiwiY2xvc2UiLCJyZXBvcyIsInN0YXJ0VGltZSIsIkRhdGUiLCJub3ciLCJpIiwid3JpdGUiLCJhcmdzIiwiYXJndiIsInNsaWNlIiwiYXJnIiwiX19kaXJuYW1lIiwidXJsIiwiY3dkIiwicmVzb2x2ZSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBaURDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE9BQU9BLFlBQVksU0FBUztBQUM1QixPQUFPQyxVQUFVLE9BQU87QUFDeEIsT0FBT0MsZ0JBQWdCLHNEQUFzRDtBQUM3RSxPQUFPQyxhQUFhLG1EQUFtRDtBQUN2RSxPQUFPQyxhQUFhLG1EQUFtRDtBQUN2RSxPQUFPQyxvQkFBb0IsMERBQTBEO0FBRXJGLE9BQU9DLG1CQUFtQix5REFBeUQ7QUFDbkYsT0FBT0MsZ0JBQWdCLHNEQUFzRDtBQUM3RSxPQUFPQyxhQUFhQyxtQkFBbUIsUUFBUSwrREFBK0Q7QUFDOUcsT0FBT0MsYUFBYSw2REFBNkQ7QUFDakYsT0FBT0Msb0NBQW9DLGlEQUFpRDtBQUU1Rix1REFBdUQ7QUFDdkQsTUFBTUMsY0FBYztJQUVsQiw4R0FBOEc7SUFDOUcscUVBQXFFO0lBQ3JFO0NBQ0Q7QUFFRCxNQUFNQyxPQUFPSDtBQUViLE1BQU1JLGtCQUFrQk4sVUFBVyxZQUFhLGdDQUFnQztBQUNoRixNQUFNTyxXQUFXUCxVQUFXLGFBQWMsb0VBQW9FO0FBRTVHLG9CQUFBO0lBRUEsK0RBQStEO0lBQy9ELElBQUtBLFVBQVcsWUFBYztRQUM1QixNQUFNUSxlQUFlLE1BQU1MO1FBQzNCLE1BQU1NLFVBQVUsTUFBTUMsYUFBY0YsY0FBY0Y7UUFDbERLLFFBQVFDLElBQUksQ0FBRUgsVUFBVSxJQUFJO1FBQzVCO0lBQ0Y7SUFFQSx5Q0FBeUM7SUFDekMsSUFBS1QsVUFBVyxRQUFVO1FBQ3hCLE1BQU1TLFVBQVUsTUFBTUMsYUFBY2Isa0JBQWtCUztRQUN0REssUUFBUUMsSUFBSSxDQUFFSCxVQUFVLElBQUk7UUFDNUI7SUFDRjtJQUVBLElBQUtMLFlBQVlTLFFBQVEsQ0FBRVIsT0FBUztRQUNsQ1MsUUFBUUMsR0FBRyxDQUFFLENBQUMsdUNBQXVDLEVBQUVWLE1BQU07UUFDN0RNLFFBQVFDLElBQUksQ0FBRTtJQUNoQjtJQUVBLE1BQU1JLGdCQUFnQjtRQUFFO1FBQVE7UUFBZ0I7UUFBYztRQUFhO0tBQWU7SUFFMUYsNEJBQTRCO0lBQzVCLElBQUlDLGFBQWE7V0FBS0Q7S0FBZTtJQUNyQyxNQUFNRSxjQUFjLEtBQUssOEJBQThCO0lBRXZELHNFQUFzRTtJQUN0RSxNQUFNQyxnQkFBZ0J6QixXQUFXeUIsYUFBYTtJQUM5QyxJQUFLQSxpQkFBaUJBLGFBQWEsQ0FBRUQsWUFBYSxLQUFLLE9BQVE7UUFDN0RaLG1CQUFtQlEsUUFBUUMsR0FBRyxDQUFFO1FBQ2hDRSxXQUFXRyxNQUFNLEdBQUc7SUFDdEI7SUFFQUosY0FBY0ssT0FBTyxDQUFFLENBQUVDO1FBRXZCLDJDQUEyQztRQUMzQyxJQUFLSCxpQkFBaUJBLGFBQWEsQ0FBRUcsS0FBTSxLQUFLLE9BQVE7WUFDdERoQixtQkFBbUJRLFFBQVFDLEdBQUcsQ0FBRSx5Q0FBeUNPO1lBQ3pFTCxhQUFhQSxXQUFXTSxNQUFNLENBQUVDLENBQUFBLElBQUtBLE1BQU1GO1FBQzdDO1FBRUEsNEJBQTRCO1FBQzVCLElBQUtyQixvQkFBcUJxQixPQUFTO1lBQ2pDLElBQUt0QixVQUFXc0IsT0FBUztnQkFDdkIsSUFBSyxDQUFDTCxXQUFXSixRQUFRLENBQUVTLE9BQVM7b0JBQ2xDaEIsbUJBQW1CUSxRQUFRQyxHQUFHLENBQUUsd0JBQXdCTztvQkFDeERMLFdBQVdRLElBQUksQ0FBRUg7Z0JBQ25CO1lBQ0YsT0FDSztnQkFDSGhCLG1CQUFtQlEsUUFBUUMsR0FBRyxDQUFFLDBCQUEwQk87Z0JBQzFETCxhQUFhQSxXQUFXTSxNQUFNLENBQUVDLENBQUFBLElBQUtBLE1BQU1GO1lBQzdDO1FBQ0Y7SUFDRjtJQUVBLElBQUt0QixVQUFXLGFBQWU7UUFDN0JNLG1CQUFtQlEsUUFBUUMsR0FBRyxDQUFFO1FBQ2hDRSxhQUFhO2VBQUtEO1NBQWU7SUFDbkM7SUFFQVYsbUJBQW1CUSxRQUFRQyxHQUFHLENBQUUsaUJBQWlCRTtJQUVqRCxNQUFNUyxtQkFBbUIsTUFBTTVCLGNBQWM2QixVQUFVLENBQUUsQ0FBQyxpQkFBaUIsRUFBRXRCLEtBQUssQ0FBQyxDQUFDLG9DQUFFO1FBRXBGQyxtQkFBbUJRLFFBQVFDLEdBQUcsQ0FBRSxTQUFTVjtRQUV6QyxNQUFNdUIsY0FBYyxNQUFNQyxRQUFRQyxVQUFVLENBQzFDYixXQUFXYyxHQUFHLENBQUVULENBQUFBO1lBQ2QsT0FBT3hCLGNBQWM2QixVQUFVLENBQzdCTCx3Q0FDQTtnQkFDRSxNQUFNVSxVQUFVLE1BQU1wQyxRQUNwQkcsWUFDQTtvQkFDRTtvQkFDQSxDQUFDLFVBQVUsRUFBRXVCLE1BQU07b0JBQ25CLENBQUMsT0FBTyxFQUFFakIsTUFBTTtvQkFDaEJDLGtCQUFrQixjQUFjO29CQUNoQ0MsV0FBVyxlQUFlO2lCQUMzQixFQUNELGNBQ0E7b0JBQ0UwQixRQUFRO2dCQUNWO2dCQUVGekMsT0FBUSxPQUFPd0MsWUFBWTtnQkFDM0JBLFFBQVFFLE1BQU0sSUFBSUYsUUFBUUUsTUFBTSxDQUFDQyxJQUFJLEdBQUdmLE1BQU0sR0FBRyxLQUFLTixRQUFRQyxHQUFHLENBQUVpQixRQUFRRSxNQUFNO2dCQUNqRkYsUUFBUUksTUFBTSxJQUFJSixRQUFRSSxNQUFNLENBQUNELElBQUksR0FBR2YsTUFBTSxHQUFHLEtBQUtOLFFBQVFDLEdBQUcsQ0FBRWlCLFFBQVFJLE1BQU07Z0JBRWpGLElBQUtKLFFBQVFLLElBQUksS0FBSyxHQUFJO29CQUN4QixPQUFPO3dCQUFFZixNQUFNQTt3QkFBTWIsU0FBUztvQkFBSztnQkFDckMsT0FDSztvQkFDSCxJQUFJNkIsVUFBVSxrQkFBa0JoQjtvQkFDaEMsSUFBS1UsUUFBUUUsTUFBTSxJQUFJRixRQUFRRSxNQUFNLENBQUNDLElBQUksR0FBR2YsTUFBTSxHQUFHLEdBQUk7d0JBQ3hEa0IsVUFBVUEsVUFBVSxPQUFPTixRQUFRRSxNQUFNO29CQUMzQztvQkFDQSxJQUFLRixRQUFRSSxNQUFNLElBQUlKLFFBQVFJLE1BQU0sQ0FBQ0QsSUFBSSxHQUFHZixNQUFNLEdBQUcsR0FBSTt3QkFDeERrQixVQUFVQSxVQUFVLE9BQU9OLFFBQVFJLE1BQU07b0JBQzNDO29CQUNBLE9BQU87d0JBQUVkLE1BQU1BO3dCQUFNYixTQUFTO3dCQUFPNkIsU0FBU0E7b0JBQVE7Z0JBQ3hEO1lBQ0YsSUFDQTtnQkFDRUMsT0FBTztZQUNUO1FBRUo7UUFHRlgsWUFBWVAsT0FBTyxDQUFFbUIsQ0FBQUE7WUFDbkIsSUFBS0EsT0FBT0MsTUFBTSxLQUFLLGFBQWM7Z0JBQ25DLElBQUtELE9BQU9FLEtBQUssQ0FBQ2pDLE9BQU8sRUFBRztvQkFDMUJLLFFBQVFDLEdBQUcsQ0FBRSxDQUFDLEtBQUssRUFBRXlCLE9BQU9FLEtBQUssQ0FBQ3BCLElBQUksQ0FBQyxVQUFVLENBQUM7Z0JBQ3BELE9BQ0s7b0JBQ0hSLFFBQVE2QixLQUFLLENBQUVILE9BQU9FLEtBQUssQ0FBQ0osT0FBTztnQkFDckM7WUFDRixPQUNLO2dCQUNIeEIsUUFBUTZCLEtBQUssQ0FBRSxDQUFDLEtBQUssRUFBRUgsT0FBT0ksTUFBTSxDQUFDdEIsSUFBSSxDQUFDLHVCQUF1QixFQUFFa0IsT0FBT0ksTUFBTSxDQUFDTixPQUFPLEVBQUU7WUFDNUY7UUFDRjtRQUVBLE9BQU9WLFlBQVlpQixLQUFLLENBQUVMLENBQUFBLFNBQVVBLE9BQU9DLE1BQU0sS0FBSyxlQUFlRCxPQUFPRSxLQUFLLENBQUNqQyxPQUFPO0lBQzNGO0lBRUEsdUZBQXVGO0lBQ3ZGWCxjQUFjZ0QsS0FBSyxDQUFFLElBQU1uQyxRQUFRQyxJQUFJLENBQUVjLG1CQUFtQixJQUFJO0FBQ2xFO1NBS2VoQixhQUFjcUMsS0FBYSxFQUFFekMsZUFBd0I7V0FBckRJOztTQUFBQTtJQUFBQSxnQkFIZjs7Q0FFQyxHQUNELG9CQUFBLFVBQTZCcUMsS0FBYSxFQUFFekMsZUFBd0I7UUFDbEUsTUFBTTBDLFlBQVlDLEtBQUtDLEdBQUc7UUFFMUIsSUFBSXpDLFVBQVU7UUFFZCxnSUFBZ0k7UUFDaEksb0RBQW9EO1FBQ3BELElBQU0sSUFBSTBDLElBQUksR0FBR0EsSUFBSUosTUFBTTNCLE1BQU0sRUFBRStCLElBQU07WUFFdkN4QyxRQUFRdUIsTUFBTSxDQUFDa0IsS0FBSyxDQUFFTCxLQUFLLENBQUVJLEVBQUcsR0FBRztZQUVuQyxpREFBaUQ7WUFDakQsTUFBTUUsT0FBTzFDLFFBQVEyQyxJQUFJLENBQUNDLEtBQUssQ0FBRSxHQUFJaEMsTUFBTSxDQUFFaUMsQ0FBQUEsTUFBTyxDQUFDO29CQUFFO29CQUFTO2lCQUFhLENBQUMzQyxRQUFRLENBQUUyQztZQUN4RmxELG1CQUFtQlEsUUFBUUMsR0FBRyxDQUFFLHFDQUFxQ3NDO1lBRXJFLG1CQUFtQjtZQUNuQixNQUFNSSxZQUFZOUQsUUFBUyxZQUFZK0QsR0FBRztZQUUxQyw0Q0FBNEM7WUFDNUMsTUFBTUMsTUFBTWxFLEtBQUttRSxPQUFPLENBQUVILFdBQVcsZ0JBQWdCVixLQUFLLENBQUVJLEVBQUc7WUFFL0QsTUFBTVgsU0FBUyxNQUFNNUMsUUFBU0csWUFBWTtnQkFBRTttQkFBOENzRDthQUFNLEVBQUVNLEtBQUs7Z0JBRXJHLG1GQUFtRjtnQkFDbkYxQixRQUFRO1lBQ1Y7WUFDQTNCLG1CQUFtQlEsUUFBUUMsR0FBRyxDQUFFLFdBQVd5QjtZQUMzQyxJQUFLQSxPQUFPSCxJQUFJLEtBQUssR0FBSTtnQkFDdkJ2QixRQUFRQyxHQUFHLENBQUU7WUFDZixPQUNLO2dCQUNIRCxRQUFRQyxHQUFHO2dCQUNYeUIsT0FBT04sTUFBTSxDQUFDQyxJQUFJLEdBQUdmLE1BQU0sR0FBRyxLQUFLTixRQUFRQyxHQUFHLENBQUV5QixPQUFPTixNQUFNLENBQUNDLElBQUk7Z0JBQ2xFSyxPQUFPSixNQUFNLENBQUNELElBQUksR0FBR2YsTUFBTSxHQUFHLEtBQUtOLFFBQVFDLEdBQUcsQ0FBRXlCLE9BQU9KLE1BQU0sQ0FBQ0QsSUFBSTtnQkFDbEUxQixVQUFVO1lBQ1o7UUFDRjtRQUVBSyxRQUFRQyxHQUFHLENBQUUsYUFBZWtDLENBQUFBLEtBQUtDLEdBQUcsS0FBS0YsU0FBUSxJQUFNO1FBQ3ZELE9BQU92QztJQUNUO1dBeENlQyJ9