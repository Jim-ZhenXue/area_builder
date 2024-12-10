// Copyright 2024, University of Colorado Boulder
/**
 * Type checks *.ts files.
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
import fs from 'fs';
import _ from 'lodash';
import os from 'os';
import path from 'path';
import fixEOL from '../common/fixEOL.js';
import { PERENNIAL_ROOT } from '../common/perennialRepoUtils.js';
const ALL_CONFIG_PATH = `${PERENNIAL_ROOT}/../chipper/dist/tsconfig/all/`;
const tscCommand = `${PERENNIAL_ROOT}/node_modules/typescript/bin/tsc`;
const typeCheck = /*#__PURE__*/ _async_to_generator(function*(providedOptions) {
    const options = _.assignIn({
        // Either repo or all must be provided. "all" will take precedent if both are provided
        repo: null,
        all: false,
        clean: false,
        pretty: true,
        silent: false,
        verbose: false,
        absolute: false
    }, providedOptions);
    assert(options.repo || options.all, 'You must provide a repo or use --all');
    if (options.absolute) {
        options.pretty = false;
        options.verbose = false;
    }
    if (options.silent) {
        options.verbose = false;
        options.absolute = false;
    }
    if (options.all) {
        writeAllTSConfigFile();
    }
    const repoEntryPoint = getRepoCWD(options.repo);
    !options.all && options.repo && assert(fs.existsSync(`${repoEntryPoint}/tsconfig.json`), `repo provided does not have a tsconfig.json: ${options.repo}`);
    const cwd = options.all ? ALL_CONFIG_PATH : repoEntryPoint;
    const startTime = Date.now();
    if (options.clean) {
        yield tscClean(cwd);
    }
    const tscArgs = [
        tscCommand,
        '-b',
        '--verbose',
        `${options.verbose}`,
        '--pretty',
        `${options.pretty}`
    ];
    const tscResults = yield runCommand('node', tscArgs, cwd, options.absolute);
    options.absolute && handleAbsolute(tscResults.stdout, cwd, startTime);
    return tscResults.success;
});
function getRepoCWD(repo) {
    return `${PERENNIAL_ROOT}/../${repo}`;
}
function tscClean(cwd) {
    return _tscClean.apply(this, arguments);
}
function _tscClean() {
    _tscClean = _async_to_generator(function*(cwd) {
        const cleanResults = yield runCommand('node', [
            tscCommand,
            '-b',
            '--clean'
        ], cwd, false);
        if (!cleanResults.success) {
            throw new Error('Checking failed to clean');
        }
    });
    return _tscClean.apply(this, arguments);
}
export function tscCleanRepo(repo) {
    return _tscCleanRepo.apply(this, arguments);
}
function _tscCleanRepo() {
    _tscCleanRepo = _async_to_generator(function*(repo) {
        return tscClean(getRepoCWD(repo));
    });
    return _tscCleanRepo.apply(this, arguments);
}
// Utility function to spawn a child process with inherited stdio, TODO: duplication? https://github.com/phetsims/perennial/issues/373
function runCommand(command, args, cwd, absolute) {
    return new Promise((resolve, reject)=>{
        const spawnOptions = {
            cwd: cwd,
            shell: process.platform.startsWith('win')
        };
        if (!absolute) {
            spawnOptions.stdio = 'inherit'; // Inherit stdio to preserve colors and interactive output
        }
        const child = spawn(command, args, spawnOptions);
        let stdout = '';
        child.stdout && child.stdout.on('data', (data)=>{
            stdout += data;
        });
        child.on('error', (error)=>reject(error));
        child.on('close', (code)=>resolve({
                success: code === 0,
                stdout: stdout
            }));
    });
}
/**
 * Write an aggregate tsconfig file that checks all entry points.
 */ function writeAllTSConfigFile() {
    const activeRepos = fs.readFileSync(`${PERENNIAL_ROOT}/data/active-repos`, 'utf-8').trim().split(/\r?\n/).map((s)=>s.trim());
    const filteredRepos = activeRepos.filter((repo)=>{
        return fs.existsSync(`${PERENNIAL_ROOT}/../${repo}/tsconfig.json`) && repo !== 'phet-lib' && // TODO: include this repo, see https://github.com/phetsims/phet-lib/issues/7
        repo !== 'phet-vite-demo'; // TODO: include this repo, see https://github.com/phetsims/phet-vite-demo/issues/2
    });
    const json = {
        references: filteredRepos.map((repo)=>({
                path: `../../../../${repo}`
            }))
    };
    const fileOutput = `/**
 * File auto-generated by check.ts 
 *
 * Explicitly list all entry points that we want to type-check.
 * Imported images/mipmaps/sounds are still type checked.
 * This structure was determined in https://github.com/phetsims/chipper/issues/1245
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
${JSON.stringify(json, null, 2)}`;
    fs.mkdirSync(ALL_CONFIG_PATH, {
        recursive: true
    }); // Silent no-op if it already exists.
    fs.writeFileSync(ALL_CONFIG_PATH + 'tsconfig.json', fixEOL(fileOutput));
}
// This function supports special logging output to support hyperlinks in output when run inside a Webstorm external tool.
const handleAbsolute = (stdout, cwd, startTime)=>{
    const lines = stdout.trim().split(os.EOL);
    const mappedToAbsolute = lines.map((line)=>{
        if (line.includes('): error TS')) {
            const parenthesesIndex = line.indexOf('(');
            const linePath = line.substring(0, parenthesesIndex);
            const resolved = path.resolve(cwd, linePath);
            return resolved + line.substring(parenthesesIndex);
        } else {
            return line;
        }
    });
    // If a line starts without whitespace, it begins a new error
    const errorCount = mappedToAbsolute.filter((line)=>line.length > 0 && line === line.trim()).length;
    console.log(mappedToAbsolute.join('\n'));
    console.log(`${errorCount} ${errorCount === 1 ? 'error' : 'errors'} in ${Date.now() - startTime}ms`);
};
export default typeCheck;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90eXBlQ2hlY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuLyoqXG4gKiBUeXBlIGNoZWNrcyAqLnRzIGZpbGVzLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHsgc3Bhd24gfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZpeEVPTCBmcm9tICcuLi9jb21tb24vZml4RU9MLmpzJztcbmltcG9ydCB7IFBFUkVOTklBTF9ST09UIH0gZnJvbSAnLi4vY29tbW9uL3BlcmVubmlhbFJlcG9VdGlscy5qcyc7XG5pbXBvcnQgeyBSZXBvIH0gZnJvbSAnLi4vYnJvd3Nlci1hbmQtbm9kZS9QZXJlbm5pYWxUeXBlcy5qcyc7XG5cbmNvbnN0IEFMTF9DT05GSUdfUEFUSCA9IGAke1BFUkVOTklBTF9ST09UfS8uLi9jaGlwcGVyL2Rpc3QvdHNjb25maWcvYWxsL2A7XG5jb25zdCB0c2NDb21tYW5kID0gYCR7UEVSRU5OSUFMX1JPT1R9L25vZGVfbW9kdWxlcy90eXBlc2NyaXB0L2Jpbi90c2NgO1xuXG5leHBvcnQgdHlwZSBDaGVja09wdGlvbnMgPSB7XG5cbiAgLy8gVGhlIHJlcG8gdG8gdXNlIGFzIHRoZSBlbnRyeXBvaW50IGZvciB0eXBlIGNoZWNraW5nLiBUaGUgcmVwbyBwcm92aWRlZCBNVVNUIGhhdmUgYSB0c2NvbmZpZy5qc29uIGF0IHRoZSB0b3AgbGV2ZWwuXG4gIHJlcG86IFJlcG87XG5cbiAgLy8gVHlwZSBjaGVjayBhbGwgc3VwcG9ydGVkIHJlcG9zIGluIGFjdGl2ZS1yZXBvcy4gVXNpbmcgdGhpcyBvcHRpb24gaWdub3JlIHRoZSBcInJlcG9cIiBvcHRpb24uXG4gIGFsbDogYm9vbGVhbjtcblxuICAvLyBSdW4gdHNjIC1iIC0tY2xlYW4gYmVmb3JlIHR5cGUgY2hlY2tpbmcgKGJhc2ljYWxseSBhIGNhY2hlIGNsZWFyKVxuICBjbGVhbjogYm9vbGVhbjtcblxuICAvLyBVc2UgZ29vZCBmb3JtYXR0aW5nL2NvbG9yIG91dHB1dCB0byB0aGUgY29uc29sZS4gQWx3YXlzIGZhbHNlIGlmIGFic29sdXRlOnRydWVcbiAgcHJldHR5OiBib29sZWFuO1xuXG4gIC8vIFByZXZlbnQgYWxsIG91dHB1dCwgZXZlbiBpZiB2ZXJib3NlIG9yIGFic29sdXRlIGZsYWdzIGFyZSBzZXQuXG4gIHNpbGVudDogYm9vbGVhbjtcblxuICAvLyBXaGVuIHRydWUsIHRoaXMgd2lsbCBwcm92aWRlIGV4dHJhIG91dHB1dCBmcm9tIGB0c2NgLiBBbHdheXMgZmFsc2UgaWYgYWJzb2x1dGU6dHJ1ZVxuICB2ZXJib3NlOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBUaGlzIG1vZGUgc3VwcG9ydHMgc3BlY2lhbCBsb2dnaW5nIG91dHB1dCB0byBzdXBwb3J0IGh5cGVybGlua3MgaW4gb3V0cHV0IHdoZW4gcnVuIGluc2lkZSBhIFdlYnN0b3JtIGV4dGVybmFsIHRvb2wuXG4gICAqIE1vc3QgbGlrZWx5IHlvdSB3aWxsIHdhbnQgdG8gdXNlIHRoaXMgd2l0aCAtLWFsbC5cbiAgICpcbiAgICogYWJzb2x1dGU6dHJ1ZSB3aWxsIG92ZXJ3cml0ZSB0byBwcmV0dHk6ZmFsc2VcbiAgICpcbiAgICogSU1QT1JUQU5UISEhIFRoaXMgbWFrZXMgdGhlIGZpbGVzIHBhdGhzIGNsaWNrYWJsZSBpbiBXZWJzdG9ybTpcbiAgICogb3V0cHV0IGZpbHRlcnM6ICRGSUxFX1BBVEgkXFwoJExJTkUkXFwsJENPTFVNTiRcXClcbiAgICovXG4gIGFic29sdXRlOiBib29sZWFuO1xufTtcblxuY29uc3QgdHlwZUNoZWNrID0gYXN5bmMgKCBwcm92aWRlZE9wdGlvbnM/OiBQYXJ0aWFsPENoZWNrT3B0aW9ucz4gKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG5cbiAgY29uc3Qgb3B0aW9uczogQ2hlY2tPcHRpb25zID0gXy5hc3NpZ25Jbigge1xuXG4gICAgLy8gRWl0aGVyIHJlcG8gb3IgYWxsIG11c3QgYmUgcHJvdmlkZWQuIFwiYWxsXCIgd2lsbCB0YWtlIHByZWNlZGVudCBpZiBib3RoIGFyZSBwcm92aWRlZFxuICAgIHJlcG86IG51bGwsXG4gICAgYWxsOiBmYWxzZSxcblxuICAgIGNsZWFuOiBmYWxzZSxcblxuICAgIHByZXR0eTogdHJ1ZSxcbiAgICBzaWxlbnQ6IGZhbHNlLFxuICAgIHZlcmJvc2U6IGZhbHNlLFxuICAgIGFic29sdXRlOiBmYWxzZVxuICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICBhc3NlcnQoIG9wdGlvbnMucmVwbyB8fCBvcHRpb25zLmFsbCwgJ1lvdSBtdXN0IHByb3ZpZGUgYSByZXBvIG9yIHVzZSAtLWFsbCcgKTtcblxuICBpZiAoIG9wdGlvbnMuYWJzb2x1dGUgKSB7XG4gICAgb3B0aW9ucy5wcmV0dHkgPSBmYWxzZTtcbiAgICBvcHRpb25zLnZlcmJvc2UgPSBmYWxzZTtcbiAgfVxuICBpZiAoIG9wdGlvbnMuc2lsZW50ICkge1xuICAgIG9wdGlvbnMudmVyYm9zZSA9IGZhbHNlO1xuICAgIG9wdGlvbnMuYWJzb2x1dGUgPSBmYWxzZTtcbiAgfVxuXG4gIGlmICggb3B0aW9ucy5hbGwgKSB7XG4gICAgd3JpdGVBbGxUU0NvbmZpZ0ZpbGUoKTtcbiAgfVxuXG4gIGNvbnN0IHJlcG9FbnRyeVBvaW50ID0gZ2V0UmVwb0NXRCggb3B0aW9ucy5yZXBvICk7XG5cbiAgIW9wdGlvbnMuYWxsICYmIG9wdGlvbnMucmVwbyAmJiBhc3NlcnQoIGZzLmV4aXN0c1N5bmMoIGAke3JlcG9FbnRyeVBvaW50fS90c2NvbmZpZy5qc29uYCApLCBgcmVwbyBwcm92aWRlZCBkb2VzIG5vdCBoYXZlIGEgdHNjb25maWcuanNvbjogJHtvcHRpb25zLnJlcG99YCApO1xuXG4gIGNvbnN0IGN3ZCA9IG9wdGlvbnMuYWxsID8gQUxMX0NPTkZJR19QQVRIIDogcmVwb0VudHJ5UG9pbnQ7XG5cbiAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgaWYgKCBvcHRpb25zLmNsZWFuICkge1xuICAgIGF3YWl0IHRzY0NsZWFuKCBjd2QgKTtcbiAgfVxuXG4gIGNvbnN0IHRzY0FyZ3MgPSBbXG4gICAgdHNjQ29tbWFuZCxcbiAgICAnLWInLCAvLyBhbHdheXMsIGJlY2F1c2Ugd2UgdXNlIHByb2plY3QgcmVmZXJlbmNlcy5cbiAgICAnLS12ZXJib3NlJywgYCR7b3B0aW9ucy52ZXJib3NlfWAsXG4gICAgJy0tcHJldHR5JywgYCR7b3B0aW9ucy5wcmV0dHl9YFxuICBdO1xuICBjb25zdCB0c2NSZXN1bHRzID0gYXdhaXQgcnVuQ29tbWFuZCggJ25vZGUnLCB0c2NBcmdzLCBjd2QsIG9wdGlvbnMuYWJzb2x1dGUgKTtcblxuICBvcHRpb25zLmFic29sdXRlICYmIGhhbmRsZUFic29sdXRlKCB0c2NSZXN1bHRzLnN0ZG91dCwgY3dkLCBzdGFydFRpbWUgKTtcblxuICByZXR1cm4gdHNjUmVzdWx0cy5zdWNjZXNzO1xufTtcblxuZnVuY3Rpb24gZ2V0UmVwb0NXRCggcmVwbzogc3RyaW5nICk6IHN0cmluZyB7XG4gIHJldHVybiBgJHtQRVJFTk5JQUxfUk9PVH0vLi4vJHtyZXBvfWA7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHRzY0NsZWFuKCBjd2Q6IHN0cmluZyApOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgY2xlYW5SZXN1bHRzID0gYXdhaXQgcnVuQ29tbWFuZCggJ25vZGUnLCBbIHRzY0NvbW1hbmQsICctYicsICctLWNsZWFuJyBdLCBjd2QsIGZhbHNlICk7XG4gIGlmICggIWNsZWFuUmVzdWx0cy5zdWNjZXNzICkge1xuICAgIHRocm93IG5ldyBFcnJvciggJ0NoZWNraW5nIGZhaWxlZCB0byBjbGVhbicgKTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdHNjQ2xlYW5SZXBvKCByZXBvOiBzdHJpbmcgKTogUHJvbWlzZTx2b2lkPiB7XG4gIHJldHVybiB0c2NDbGVhbiggZ2V0UmVwb0NXRCggcmVwbyApICk7XG59XG5cblxuLy8gVXRpbGl0eSBmdW5jdGlvbiB0byBzcGF3biBhIGNoaWxkIHByb2Nlc3Mgd2l0aCBpbmhlcml0ZWQgc3RkaW8sIFRPRE86IGR1cGxpY2F0aW9uPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGVyZW5uaWFsL2lzc3Vlcy8zNzNcbmZ1bmN0aW9uIHJ1bkNvbW1hbmQoIGNvbW1hbmQ6IHN0cmluZywgYXJnczogc3RyaW5nW10sIGN3ZDogc3RyaW5nLCBhYnNvbHV0ZTogYm9vbGVhbiApOiBQcm9taXNlPHsgc3VjY2VzczogYm9vbGVhbjsgc3Rkb3V0OiBzdHJpbmcgfT4ge1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlLCByZWplY3QgKSA9PiB7XG4gICAgdHlwZSBTcGF3bk9wdGlvbnMgPSBQYXJhbWV0ZXJzPHR5cGVvZiBzcGF3bj5bMl07XG4gICAgY29uc3Qgc3Bhd25PcHRpb25zOiBTcGF3bk9wdGlvbnMgPSB7XG4gICAgICBjd2Q6IGN3ZCxcbiAgICAgIHNoZWxsOiBwcm9jZXNzLnBsYXRmb3JtLnN0YXJ0c1dpdGgoICd3aW4nIClcbiAgICB9O1xuXG4gICAgaWYgKCAhYWJzb2x1dGUgKSB7XG4gICAgICBzcGF3bk9wdGlvbnMuc3RkaW8gPSAnaW5oZXJpdCc7IC8vIEluaGVyaXQgc3RkaW8gdG8gcHJlc2VydmUgY29sb3JzIGFuZCBpbnRlcmFjdGl2ZSBvdXRwdXRcbiAgICB9XG4gICAgY29uc3QgY2hpbGQgPSBzcGF3biggY29tbWFuZCwgYXJncywgc3Bhd25PcHRpb25zICk7XG5cbiAgICBsZXQgc3Rkb3V0ID0gJyc7XG4gICAgY2hpbGQuc3Rkb3V0ICYmIGNoaWxkLnN0ZG91dC5vbiggJ2RhdGEnLCBkYXRhID0+IHsgc3Rkb3V0ICs9IGRhdGE7IH0gKTtcblxuICAgIGNoaWxkLm9uKCAnZXJyb3InLCBlcnJvciA9PiByZWplY3QoIGVycm9yICkgKTtcbiAgICBjaGlsZC5vbiggJ2Nsb3NlJywgY29kZSA9PiByZXNvbHZlKCB7XG4gICAgICBzdWNjZXNzOiBjb2RlID09PSAwLFxuICAgICAgc3Rkb3V0OiBzdGRvdXRcbiAgICB9ICkgKTtcbiAgfSApO1xufVxuXG4vKipcbiAqIFdyaXRlIGFuIGFnZ3JlZ2F0ZSB0c2NvbmZpZyBmaWxlIHRoYXQgY2hlY2tzIGFsbCBlbnRyeSBwb2ludHMuXG4gKi9cbmZ1bmN0aW9uIHdyaXRlQWxsVFNDb25maWdGaWxlKCk6IHZvaWQge1xuICBjb25zdCBhY3RpdmVSZXBvcyA9IGZzLnJlYWRGaWxlU3luYyggYCR7UEVSRU5OSUFMX1JPT1R9L2RhdGEvYWN0aXZlLXJlcG9zYCwgJ3V0Zi04JyApLnRyaW0oKS5zcGxpdCggL1xccj9cXG4vICkubWFwKCBzID0+IHMudHJpbSgpICk7XG5cbiAgY29uc3QgZmlsdGVyZWRSZXBvcyA9IGFjdGl2ZVJlcG9zLmZpbHRlciggcmVwbyA9PiB7XG4gICAgcmV0dXJuIGZzLmV4aXN0c1N5bmMoIGAke1BFUkVOTklBTF9ST09UfS8uLi8ke3JlcG99L3RzY29uZmlnLmpzb25gICkgJiZcbiAgICAgICAgICAgcmVwbyAhPT0gJ3BoZXQtbGliJyAmJiAvLyBUT0RPOiBpbmNsdWRlIHRoaXMgcmVwbywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWxpYi9pc3N1ZXMvN1xuICAgICAgICAgICByZXBvICE9PSAncGhldC12aXRlLWRlbW8nOyAvLyBUT0RPOiBpbmNsdWRlIHRoaXMgcmVwbywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LXZpdGUtZGVtby9pc3N1ZXMvMlxuICB9ICk7XG5cbiAgY29uc3QganNvbiA9IHtcbiAgICByZWZlcmVuY2VzOiBmaWx0ZXJlZFJlcG9zLm1hcCggcmVwbyA9PiAoIHsgcGF0aDogYC4uLy4uLy4uLy4uLyR7cmVwb31gIH0gKSApXG4gIH07XG5cbiAgY29uc3QgZmlsZU91dHB1dCA9IGAvKipcbiAqIEZpbGUgYXV0by1nZW5lcmF0ZWQgYnkgY2hlY2sudHMgXG4gKlxuICogRXhwbGljaXRseSBsaXN0IGFsbCBlbnRyeSBwb2ludHMgdGhhdCB3ZSB3YW50IHRvIHR5cGUtY2hlY2suXG4gKiBJbXBvcnRlZCBpbWFnZXMvbWlwbWFwcy9zb3VuZHMgYXJlIHN0aWxsIHR5cGUgY2hlY2tlZC5cbiAqIFRoaXMgc3RydWN0dXJlIHdhcyBkZXRlcm1pbmVkIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xMjQ1XG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG4ke0pTT04uc3RyaW5naWZ5KCBqc29uLCBudWxsLCAyICl9YDtcblxuICBmcy5ta2RpclN5bmMoIEFMTF9DT05GSUdfUEFUSCwgeyByZWN1cnNpdmU6IHRydWUgfSApOyAvLyBTaWxlbnQgbm8tb3AgaWYgaXQgYWxyZWFkeSBleGlzdHMuXG4gIGZzLndyaXRlRmlsZVN5bmMoIEFMTF9DT05GSUdfUEFUSCArICd0c2NvbmZpZy5qc29uJywgZml4RU9MKCBmaWxlT3V0cHV0ICkgKTtcbn1cblxuLy8gVGhpcyBmdW5jdGlvbiBzdXBwb3J0cyBzcGVjaWFsIGxvZ2dpbmcgb3V0cHV0IHRvIHN1cHBvcnQgaHlwZXJsaW5rcyBpbiBvdXRwdXQgd2hlbiBydW4gaW5zaWRlIGEgV2Vic3Rvcm0gZXh0ZXJuYWwgdG9vbC5cbmNvbnN0IGhhbmRsZUFic29sdXRlID0gKCBzdGRvdXQ6IHN0cmluZywgY3dkOiBzdHJpbmcsIHN0YXJ0VGltZTogbnVtYmVyICkgPT4ge1xuXG4gIGNvbnN0IGxpbmVzID0gc3Rkb3V0LnRyaW0oKS5zcGxpdCggb3MuRU9MICk7XG4gIGNvbnN0IG1hcHBlZFRvQWJzb2x1dGUgPSBsaW5lcy5tYXAoIGxpbmUgPT4ge1xuXG4gICAgaWYgKCBsaW5lLmluY2x1ZGVzKCAnKTogZXJyb3IgVFMnICkgKSB7XG4gICAgICBjb25zdCBwYXJlbnRoZXNlc0luZGV4ID0gbGluZS5pbmRleE9mKCAnKCcgKTtcblxuICAgICAgY29uc3QgbGluZVBhdGggPSBsaW5lLnN1YnN0cmluZyggMCwgcGFyZW50aGVzZXNJbmRleCApO1xuICAgICAgY29uc3QgcmVzb2x2ZWQgPSBwYXRoLnJlc29sdmUoIGN3ZCwgbGluZVBhdGggKTtcbiAgICAgIHJldHVybiByZXNvbHZlZCArIGxpbmUuc3Vic3RyaW5nKCBwYXJlbnRoZXNlc0luZGV4ICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIGxpbmU7XG4gICAgfVxuICB9ICk7XG5cbiAgLy8gSWYgYSBsaW5lIHN0YXJ0cyB3aXRob3V0IHdoaXRlc3BhY2UsIGl0IGJlZ2lucyBhIG5ldyBlcnJvclxuICBjb25zdCBlcnJvckNvdW50ID0gbWFwcGVkVG9BYnNvbHV0ZS5maWx0ZXIoIGxpbmUgPT4gbGluZS5sZW5ndGggPiAwICYmIGxpbmUgPT09IGxpbmUudHJpbSgpICkubGVuZ3RoO1xuXG4gIGNvbnNvbGUubG9nKCBtYXBwZWRUb0Fic29sdXRlLmpvaW4oICdcXG4nICkgKTtcbiAgY29uc29sZS5sb2coIGAke2Vycm9yQ291bnR9ICR7ZXJyb3JDb3VudCA9PT0gMSA/ICdlcnJvcicgOiAnZXJyb3JzJ30gaW4gJHtEYXRlLm5vdygpIC0gc3RhcnRUaW1lfW1zYCApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgdHlwZUNoZWNrOyJdLCJuYW1lcyI6WyJhc3NlcnQiLCJzcGF3biIsImZzIiwiXyIsIm9zIiwicGF0aCIsImZpeEVPTCIsIlBFUkVOTklBTF9ST09UIiwiQUxMX0NPTkZJR19QQVRIIiwidHNjQ29tbWFuZCIsInR5cGVDaGVjayIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJhc3NpZ25JbiIsInJlcG8iLCJhbGwiLCJjbGVhbiIsInByZXR0eSIsInNpbGVudCIsInZlcmJvc2UiLCJhYnNvbHV0ZSIsIndyaXRlQWxsVFNDb25maWdGaWxlIiwicmVwb0VudHJ5UG9pbnQiLCJnZXRSZXBvQ1dEIiwiZXhpc3RzU3luYyIsImN3ZCIsInN0YXJ0VGltZSIsIkRhdGUiLCJub3ciLCJ0c2NDbGVhbiIsInRzY0FyZ3MiLCJ0c2NSZXN1bHRzIiwicnVuQ29tbWFuZCIsImhhbmRsZUFic29sdXRlIiwic3Rkb3V0Iiwic3VjY2VzcyIsImNsZWFuUmVzdWx0cyIsIkVycm9yIiwidHNjQ2xlYW5SZXBvIiwiY29tbWFuZCIsImFyZ3MiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInNwYXduT3B0aW9ucyIsInNoZWxsIiwicHJvY2VzcyIsInBsYXRmb3JtIiwic3RhcnRzV2l0aCIsInN0ZGlvIiwiY2hpbGQiLCJvbiIsImRhdGEiLCJlcnJvciIsImNvZGUiLCJhY3RpdmVSZXBvcyIsInJlYWRGaWxlU3luYyIsInRyaW0iLCJzcGxpdCIsIm1hcCIsInMiLCJmaWx0ZXJlZFJlcG9zIiwiZmlsdGVyIiwianNvbiIsInJlZmVyZW5jZXMiLCJmaWxlT3V0cHV0IiwiSlNPTiIsInN0cmluZ2lmeSIsIm1rZGlyU3luYyIsInJlY3Vyc2l2ZSIsIndyaXRlRmlsZVN5bmMiLCJsaW5lcyIsIkVPTCIsIm1hcHBlZFRvQWJzb2x1dGUiLCJsaW5lIiwiaW5jbHVkZXMiLCJwYXJlbnRoZXNlc0luZGV4IiwiaW5kZXhPZiIsImxpbmVQYXRoIiwic3Vic3RyaW5nIiwicmVzb2x2ZWQiLCJlcnJvckNvdW50IiwibGVuZ3RoIiwiY29uc29sZSIsImxvZyIsImpvaW4iXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFp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