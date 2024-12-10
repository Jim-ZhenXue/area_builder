// Copyright 2024, University of Colorado Boulder
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
import assert from 'assert';
import { spawn } from 'child_process';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import dirname from '../../../perennial-alias/js/common/dirname.js';
import getActiveRepos from '../../../perennial-alias/js/common/getActiveRepos.js';
import getOption, { isOptionKeyProvided } from '../../../perennial-alias/js/grunt/tasks/util/getOption.js';
import getRepo from '../../../perennial-alias/js/grunt/tasks/util/getRepo.js';
// @ts-expect-error - until we have "type": "module" in our package.json
const __dirname = dirname(import.meta.url);
/**
 * Function to support transpiling on the project. See grunt transpile
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ export default function transpile(providedOptions) {
    return _transpile.apply(this, arguments);
}
function _transpile() {
    _transpile = _async_to_generator(function*(providedOptions) {
        const start = Date.now();
        // TODO: use combineOptions, see https://github.com/phetsims/chipper/issues/1523
        const options = _.assignIn({
            all: false,
            silent: false,
            clean: false,
            live: false,
            repos: []
        }, providedOptions);
        assert(options.repos.length > 0 || options.all, 'must include repos or --all');
        const repos = options.all ? getActiveRepos() : options.repos;
        // We can't use --delete-dir-on-start, because we are operating multiple swc instances in child processes.
        if (options.clean) {
            const distPath = path.resolve(__dirname, '../../../chipper/dist/js');
            if (fs.existsSync(distPath)) {
                fs.rmSync(distPath, {
                    recursive: true,
                    force: true
                });
            }
        }
        const chunks = _.chunk(repos, 75);
        !options.silent && console.log(`Transpiling code for ${repos.length} repositories, split into ${chunks.length} chunks...`);
        yield Promise.all(chunks.map((chunkedRepos)=>spawnTranspile(chunkedRepos, options.live, options.silent)));
        !options.silent && console.log('Finished initial transpilation in ' + (Date.now() - start) + 'ms');
        !options.silent && options.live && console.log('Watching...');
    });
    return _transpile.apply(this, arguments);
}
// Parse command line options into an object for the module
export function getTranspileCLIOptions() {
    const transpileOptions = {};
    // command line options override passed-in options
    if (isOptionKeyProvided('repo')) {
        transpileOptions.repos = [
            getRepo()
        ];
    }
    // Takes precedence over repo
    if (isOptionKeyProvided('repos')) {
        transpileOptions.repos = getOption('repos').split(',');
    }
    // Takes precedence over repo and repos
    if (isOptionKeyProvided('all')) {
        transpileOptions.all = getOption('all');
    }
    if (isOptionKeyProvided('watch')) {
        transpileOptions.live = getOption('watch');
        console.log('--watch is deprecated, use --live instead');
    }
    if (isOptionKeyProvided('live')) {
        transpileOptions.live = getOption('live');
    }
    if (isOptionKeyProvided('clean')) {
        transpileOptions.clean = getOption('clean');
    }
    if (isOptionKeyProvided('silent')) {
        transpileOptions.silent = getOption('silent');
    }
    return transpileOptions;
}
// Construct the command string with brace expansion
const runnable = process.platform.startsWith('win') ? 'swc.cmd' : 'swc';
const runnablePath = path.join(`chipper/node_modules/.bin/${runnable}`);
/**
 * Identify the brands that are available in the brand directory.
 * NOTE: Adding a new brand requires restarting the watch process
 */ function getBrands() {
    const pathForBrand = path.resolve(__dirname, '../../../brand/');
    const brands = fs.readdirSync(pathForBrand).filter((file)=>fs.statSync(path.join(pathForBrand, file)).isDirectory());
    const omitDirectories = [
        'node_modules',
        '.github',
        'js',
        '.git'
    ];
    const filteredBrands = brands.filter((brand)=>!omitDirectories.includes(brand));
    assert(filteredBrands.includes('phet'), 'phet brand is required');
    assert(filteredBrands.includes('phet-io'), 'phet-io brand is required');
    assert(filteredBrands.includes('adapted-from-phet'), 'adapted-from-phet brand is required');
    return filteredBrands;
}
// Directories in a sim repo that may contain things for transpilation
// This is used for a top-down search in the initial transpilation and for filtering relevant files in the watch process
const getSubdirectories = (repo)=>{
    const subdirs = [
        'js',
        'images',
        'mipmaps',
        'sounds'
    ];
    repo === 'phet-io-wrappers' && subdirs.push('common');
    repo === 'phet-io-sim-specific' && subdirs.push('repos');
    repo === 'my-solar-system' && subdirs.push('shaders');
    repo === 'alpenglow' && subdirs.push('wgsl');
    repo === 'sherpa' && subdirs.push('lib');
    repo === 'brand' && subdirs.push(...getBrands());
    return subdirs.map((subdir)=>`${repo}/${subdir}/`);
};
// TODO: factor out child process https://github.com/phetsims/perennial/issues/373
function spawnCommand(command, args) {
    return new Promise((resolve, reject)=>{
        const child = spawn(command, args, {
            cwd: path.resolve(__dirname, '../../../'),
            shell: true,
            stdio: 'inherit' // Inherit stdio to display output directly
        });
        child.on('error', (error)=>reject(error));
        child.on('close', (code)=>{
            if (code !== 0) {
                reject(new Error(`Process exited with code ${code}`));
            } else {
                resolve();
            }
        });
    });
}
const spawnTranspile = (repos, live, silent)=>{
    const argsString = [
        '--config-file',
        'chipper/.swcrc',
        ..._.flatten(repos.map((repo)=>getSubdirectories(repo))),
        '-d',
        'chipper/dist/js/'
    ];
    // This occurrence of "--watch" is accurate, since it is the terminology used by swc
    live && argsString.push('--watch');
    silent && argsString.push('--quiet');
    return spawnCommand(runnablePath, argsString);
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2NvbW1vbi90cmFuc3BpbGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgeyBzcGF3biB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBkaXJuYW1lIGZyb20gJy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZGlybmFtZS5qcyc7XG5pbXBvcnQgZ2V0QWN0aXZlUmVwb3MgZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2NvbW1vbi9nZXRBY3RpdmVSZXBvcy5qcyc7XG5pbXBvcnQgeyBSZXBvIH0gZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2Jyb3dzZXItYW5kLW5vZGUvUGVyZW5uaWFsVHlwZXMuanMnO1xuaW1wb3J0IGdldE9wdGlvbiwgeyBpc09wdGlvbktleVByb3ZpZGVkIH0gZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2dydW50L3Rhc2tzL3V0aWwvZ2V0T3B0aW9uLmpzJztcbmltcG9ydCBnZXRSZXBvIGZyb20gJy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy91dGlsL2dldFJlcG8uanMnO1xuXG4vLyBAdHMtZXhwZWN0LWVycm9yIC0gdW50aWwgd2UgaGF2ZSBcInR5cGVcIjogXCJtb2R1bGVcIiBpbiBvdXIgcGFja2FnZS5qc29uXG5jb25zdCBfX2Rpcm5hbWUgPSBkaXJuYW1lKCBpbXBvcnQubWV0YS51cmwgKTtcblxuZXhwb3J0IHR5cGUgVHJhbnNwaWxlT3B0aW9ucyA9IHtcblxuICAvLyBUcmFuc3BpbGUgYWxsIHJlcG9zXG4gIGFsbDogYm9vbGVhbjtcblxuICAvLyBEZWxldGUgb2YgdGhlIG91dHB1dCBkaXJlY3RvcnkgYmVmb3JlIHRyYW5zcGlsaW5nXG4gIGNsZWFuOiBib29sZWFuO1xuXG4gIC8vIENvbnRpbnVlIHdhdGNoaW5nIGFsbCBkaXJlY3RvcmllcyBhbmQgdHJhbnNwaWxlIG9uIGRldGVjdGVkIGNoYW5nZXMuXG4gIGxpdmU6IGJvb2xlYW47XG5cbiAgLy8gTGlzdCBvZiByZXBvcyB0byB0cmFuc3BpbGUsIGlmIG5vdCBkb2luZyBhbGxcbiAgcmVwb3M6IFJlcG9bXTtcblxuICAvLyBzdXBwcmVzcyBhbnkgbG9nZ2luZyBvdXRwdXQuXG4gIHNpbGVudDogYm9vbGVhbjtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gc3VwcG9ydCB0cmFuc3BpbGluZyBvbiB0aGUgcHJvamVjdC4gU2VlIGdydW50IHRyYW5zcGlsZVxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIHRyYW5zcGlsZSggcHJvdmlkZWRPcHRpb25zOiBQYXJ0aWFsPFRyYW5zcGlsZU9wdGlvbnM+ICk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBzdGFydCA9IERhdGUubm93KCk7XG5cbiAgLy8gVE9ETzogdXNlIGNvbWJpbmVPcHRpb25zLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzE1MjNcbiAgY29uc3Qgb3B0aW9ucyA9IF8uYXNzaWduSW4oIHtcbiAgICBhbGw6IGZhbHNlLFxuICAgIHNpbGVudDogZmFsc2UsXG4gICAgY2xlYW46IGZhbHNlLFxuICAgIGxpdmU6IGZhbHNlLFxuICAgIHJlcG9zOiBbXVxuICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICBhc3NlcnQoIG9wdGlvbnMucmVwb3MubGVuZ3RoID4gMCB8fCBvcHRpb25zLmFsbCwgJ211c3QgaW5jbHVkZSByZXBvcyBvciAtLWFsbCcgKTtcbiAgY29uc3QgcmVwb3MgPSBvcHRpb25zLmFsbCA/IGdldEFjdGl2ZVJlcG9zKCkgOiBvcHRpb25zLnJlcG9zO1xuXG4gIC8vIFdlIGNhbid0IHVzZSAtLWRlbGV0ZS1kaXItb24tc3RhcnQsIGJlY2F1c2Ugd2UgYXJlIG9wZXJhdGluZyBtdWx0aXBsZSBzd2MgaW5zdGFuY2VzIGluIGNoaWxkIHByb2Nlc3Nlcy5cbiAgaWYgKCBvcHRpb25zLmNsZWFuICkge1xuICAgIGNvbnN0IGRpc3RQYXRoID0gcGF0aC5yZXNvbHZlKCBfX2Rpcm5hbWUsICcuLi8uLi8uLi9jaGlwcGVyL2Rpc3QvanMnICk7XG4gICAgaWYgKCBmcy5leGlzdHNTeW5jKCBkaXN0UGF0aCApICkge1xuICAgICAgZnMucm1TeW5jKCBkaXN0UGF0aCwgeyByZWN1cnNpdmU6IHRydWUsIGZvcmNlOiB0cnVlIH0gKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBjaHVua3MgPSBfLmNodW5rKCByZXBvcywgNzUgKTtcblxuICAhb3B0aW9ucy5zaWxlbnQgJiYgY29uc29sZS5sb2coIGBUcmFuc3BpbGluZyBjb2RlIGZvciAke3JlcG9zLmxlbmd0aH0gcmVwb3NpdG9yaWVzLCBzcGxpdCBpbnRvICR7Y2h1bmtzLmxlbmd0aH0gY2h1bmtzLi4uYCApO1xuXG4gIGF3YWl0IFByb21pc2UuYWxsKCBjaHVua3MubWFwKCBjaHVua2VkUmVwb3MgPT4gc3Bhd25UcmFuc3BpbGUoIGNodW5rZWRSZXBvcywgb3B0aW9ucy5saXZlLCBvcHRpb25zLnNpbGVudCApICkgKTtcblxuICAhb3B0aW9ucy5zaWxlbnQgJiYgY29uc29sZS5sb2coICdGaW5pc2hlZCBpbml0aWFsIHRyYW5zcGlsYXRpb24gaW4gJyArICggRGF0ZS5ub3coKSAtIHN0YXJ0ICkgKyAnbXMnICk7XG4gICFvcHRpb25zLnNpbGVudCAmJiBvcHRpb25zLmxpdmUgJiYgY29uc29sZS5sb2coICdXYXRjaGluZy4uLicgKTtcbn1cblxuLy8gUGFyc2UgY29tbWFuZCBsaW5lIG9wdGlvbnMgaW50byBhbiBvYmplY3QgZm9yIHRoZSBtb2R1bGVcbmV4cG9ydCBmdW5jdGlvbiBnZXRUcmFuc3BpbGVDTElPcHRpb25zKCk6IFBhcnRpYWw8VHJhbnNwaWxlT3B0aW9ucz4ge1xuXG4gIGNvbnN0IHRyYW5zcGlsZU9wdGlvbnM6IFBhcnRpYWw8VHJhbnNwaWxlT3B0aW9ucz4gPSB7fTtcblxuICAvLyBjb21tYW5kIGxpbmUgb3B0aW9ucyBvdmVycmlkZSBwYXNzZWQtaW4gb3B0aW9uc1xuICBpZiAoIGlzT3B0aW9uS2V5UHJvdmlkZWQoICdyZXBvJyApICkge1xuICAgIHRyYW5zcGlsZU9wdGlvbnMucmVwb3MgPSBbIGdldFJlcG8oKSBdO1xuICB9XG5cbiAgLy8gVGFrZXMgcHJlY2VkZW5jZSBvdmVyIHJlcG9cbiAgaWYgKCBpc09wdGlvbktleVByb3ZpZGVkKCAncmVwb3MnICkgKSB7XG4gICAgdHJhbnNwaWxlT3B0aW9ucy5yZXBvcyA9IGdldE9wdGlvbiggJ3JlcG9zJyApLnNwbGl0KCAnLCcgKTtcbiAgfVxuXG4gIC8vIFRha2VzIHByZWNlZGVuY2Ugb3ZlciByZXBvIGFuZCByZXBvc1xuICBpZiAoIGlzT3B0aW9uS2V5UHJvdmlkZWQoICdhbGwnICkgKSB7XG4gICAgdHJhbnNwaWxlT3B0aW9ucy5hbGwgPSBnZXRPcHRpb24oICdhbGwnICk7XG4gIH1cblxuICBpZiAoIGlzT3B0aW9uS2V5UHJvdmlkZWQoICd3YXRjaCcgKSApIHtcbiAgICB0cmFuc3BpbGVPcHRpb25zLmxpdmUgPSBnZXRPcHRpb24oICd3YXRjaCcgKTtcbiAgICBjb25zb2xlLmxvZyggJy0td2F0Y2ggaXMgZGVwcmVjYXRlZCwgdXNlIC0tbGl2ZSBpbnN0ZWFkJyApO1xuICB9XG5cbiAgaWYgKCBpc09wdGlvbktleVByb3ZpZGVkKCAnbGl2ZScgKSApIHtcbiAgICB0cmFuc3BpbGVPcHRpb25zLmxpdmUgPSBnZXRPcHRpb24oICdsaXZlJyApO1xuICB9XG5cbiAgaWYgKCBpc09wdGlvbktleVByb3ZpZGVkKCAnY2xlYW4nICkgKSB7XG4gICAgdHJhbnNwaWxlT3B0aW9ucy5jbGVhbiA9IGdldE9wdGlvbiggJ2NsZWFuJyApO1xuICB9XG5cbiAgaWYgKCBpc09wdGlvbktleVByb3ZpZGVkKCAnc2lsZW50JyApICkge1xuICAgIHRyYW5zcGlsZU9wdGlvbnMuc2lsZW50ID0gZ2V0T3B0aW9uKCAnc2lsZW50JyApO1xuICB9XG5cbiAgcmV0dXJuIHRyYW5zcGlsZU9wdGlvbnM7XG59XG5cbi8vIENvbnN0cnVjdCB0aGUgY29tbWFuZCBzdHJpbmcgd2l0aCBicmFjZSBleHBhbnNpb25cbmNvbnN0IHJ1bm5hYmxlID0gcHJvY2Vzcy5wbGF0Zm9ybS5zdGFydHNXaXRoKCAnd2luJyApID8gJ3N3Yy5jbWQnIDogJ3N3Yyc7XG5jb25zdCBydW5uYWJsZVBhdGggPSBwYXRoLmpvaW4oIGBjaGlwcGVyL25vZGVfbW9kdWxlcy8uYmluLyR7cnVubmFibGV9YCApO1xuXG4vKipcbiAqIElkZW50aWZ5IHRoZSBicmFuZHMgdGhhdCBhcmUgYXZhaWxhYmxlIGluIHRoZSBicmFuZCBkaXJlY3RvcnkuXG4gKiBOT1RFOiBBZGRpbmcgYSBuZXcgYnJhbmQgcmVxdWlyZXMgcmVzdGFydGluZyB0aGUgd2F0Y2ggcHJvY2Vzc1xuICovXG5mdW5jdGlvbiBnZXRCcmFuZHMoKTogc3RyaW5nW10ge1xuICBjb25zdCBwYXRoRm9yQnJhbmQgPSBwYXRoLnJlc29sdmUoIF9fZGlybmFtZSwgJy4uLy4uLy4uL2JyYW5kLycgKTtcbiAgY29uc3QgYnJhbmRzID0gZnMucmVhZGRpclN5bmMoIHBhdGhGb3JCcmFuZCApLmZpbHRlciggZmlsZSA9PiBmcy5zdGF0U3luYyggcGF0aC5qb2luKCBwYXRoRm9yQnJhbmQsIGZpbGUgKSApLmlzRGlyZWN0b3J5KCkgKTtcblxuICBjb25zdCBvbWl0RGlyZWN0b3JpZXMgPSBbICdub2RlX21vZHVsZXMnLCAnLmdpdGh1YicsICdqcycsICcuZ2l0JyBdO1xuICBjb25zdCBmaWx0ZXJlZEJyYW5kcyA9IGJyYW5kcy5maWx0ZXIoIGJyYW5kID0+ICFvbWl0RGlyZWN0b3JpZXMuaW5jbHVkZXMoIGJyYW5kICkgKTtcblxuICBhc3NlcnQoIGZpbHRlcmVkQnJhbmRzLmluY2x1ZGVzKCAncGhldCcgKSwgJ3BoZXQgYnJhbmQgaXMgcmVxdWlyZWQnICk7XG4gIGFzc2VydCggZmlsdGVyZWRCcmFuZHMuaW5jbHVkZXMoICdwaGV0LWlvJyApLCAncGhldC1pbyBicmFuZCBpcyByZXF1aXJlZCcgKTtcbiAgYXNzZXJ0KCBmaWx0ZXJlZEJyYW5kcy5pbmNsdWRlcyggJ2FkYXB0ZWQtZnJvbS1waGV0JyApLCAnYWRhcHRlZC1mcm9tLXBoZXQgYnJhbmQgaXMgcmVxdWlyZWQnICk7XG5cbiAgcmV0dXJuIGZpbHRlcmVkQnJhbmRzO1xufVxuXG4vLyBEaXJlY3RvcmllcyBpbiBhIHNpbSByZXBvIHRoYXQgbWF5IGNvbnRhaW4gdGhpbmdzIGZvciB0cmFuc3BpbGF0aW9uXG4vLyBUaGlzIGlzIHVzZWQgZm9yIGEgdG9wLWRvd24gc2VhcmNoIGluIHRoZSBpbml0aWFsIHRyYW5zcGlsYXRpb24gYW5kIGZvciBmaWx0ZXJpbmcgcmVsZXZhbnQgZmlsZXMgaW4gdGhlIHdhdGNoIHByb2Nlc3NcbmNvbnN0IGdldFN1YmRpcmVjdG9yaWVzID0gKCByZXBvOiBzdHJpbmcgKSA9PiB7XG5cbiAgY29uc3Qgc3ViZGlycyA9IFsgJ2pzJywgJ2ltYWdlcycsICdtaXBtYXBzJywgJ3NvdW5kcycgXTtcblxuICByZXBvID09PSAncGhldC1pby13cmFwcGVycycgJiYgc3ViZGlycy5wdXNoKCAnY29tbW9uJyApO1xuICByZXBvID09PSAncGhldC1pby1zaW0tc3BlY2lmaWMnICYmIHN1YmRpcnMucHVzaCggJ3JlcG9zJyApO1xuICByZXBvID09PSAnbXktc29sYXItc3lzdGVtJyAmJiBzdWJkaXJzLnB1c2goICdzaGFkZXJzJyApO1xuICByZXBvID09PSAnYWxwZW5nbG93JyAmJiBzdWJkaXJzLnB1c2goICd3Z3NsJyApO1xuICByZXBvID09PSAnc2hlcnBhJyAmJiBzdWJkaXJzLnB1c2goICdsaWInICk7XG4gIHJlcG8gPT09ICdicmFuZCcgJiYgc3ViZGlycy5wdXNoKCAuLi5nZXRCcmFuZHMoKSApO1xuXG4gIHJldHVybiBzdWJkaXJzLm1hcCggc3ViZGlyID0+IGAke3JlcG99LyR7c3ViZGlyfS9gICk7XG59O1xuXG4vLyBUT0RPOiBmYWN0b3Igb3V0IGNoaWxkIHByb2Nlc3MgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BlcmVubmlhbC9pc3N1ZXMvMzczXG5mdW5jdGlvbiBzcGF3bkNvbW1hbmQoIGNvbW1hbmQ6IHN0cmluZywgYXJnczogc3RyaW5nW10gKTogUHJvbWlzZTx2b2lkPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlLCByZWplY3QgKSA9PiB7XG4gICAgY29uc3QgY2hpbGQgPSBzcGF3biggY29tbWFuZCwgYXJncywge1xuICAgICAgY3dkOiBwYXRoLnJlc29sdmUoIF9fZGlybmFtZSwgJy4uLy4uLy4uLycgKSxcbiAgICAgIHNoZWxsOiB0cnVlLCAvLyBJbXBvcnRhbnQgZm9yIHdpbmRvd3MuXG4gICAgICBzdGRpbzogJ2luaGVyaXQnIC8vIEluaGVyaXQgc3RkaW8gdG8gZGlzcGxheSBvdXRwdXQgZGlyZWN0bHlcbiAgICB9ICk7XG5cbiAgICBjaGlsZC5vbiggJ2Vycm9yJywgZXJyb3IgPT4gcmVqZWN0KCBlcnJvciApICk7XG5cbiAgICBjaGlsZC5vbiggJ2Nsb3NlJywgY29kZSA9PiB7XG4gICAgICBpZiAoIGNvZGUgIT09IDAgKSB7XG4gICAgICAgIHJlamVjdCggbmV3IEVycm9yKCBgUHJvY2VzcyBleGl0ZWQgd2l0aCBjb2RlICR7Y29kZX1gICkgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSApO1xuICB9ICk7XG59XG5cbmNvbnN0IHNwYXduVHJhbnNwaWxlID0gKCByZXBvczogc3RyaW5nW10sIGxpdmU6IGJvb2xlYW4sIHNpbGVudDogYm9vbGVhbiApID0+IHtcbiAgY29uc3QgYXJnc1N0cmluZyA9IFtcbiAgICAnLS1jb25maWctZmlsZScsICdjaGlwcGVyLy5zd2NyYycsXG4gICAgLi4uXy5mbGF0dGVuKCByZXBvcy5tYXAoIHJlcG8gPT4gZ2V0U3ViZGlyZWN0b3JpZXMoIHJlcG8gKSApICksXG4gICAgJy1kJywgJ2NoaXBwZXIvZGlzdC9qcy8nXG4gIF07XG5cbiAgLy8gVGhpcyBvY2N1cnJlbmNlIG9mIFwiLS13YXRjaFwiIGlzIGFjY3VyYXRlLCBzaW5jZSBpdCBpcyB0aGUgdGVybWlub2xvZ3kgdXNlZCBieSBzd2NcbiAgbGl2ZSAmJiBhcmdzU3RyaW5nLnB1c2goICctLXdhdGNoJyApO1xuXG4gIHNpbGVudCAmJiBhcmdzU3RyaW5nLnB1c2goICctLXF1aWV0JyApO1xuXG4gIHJldHVybiBzcGF3bkNvbW1hbmQoIHJ1bm5hYmxlUGF0aCwgYXJnc1N0cmluZyApO1xufTsiXSwibmFtZXMiOlsiYXNzZXJ0Iiwic3Bhd24iLCJmcyIsIl8iLCJwYXRoIiwiZGlybmFtZSIsImdldEFjdGl2ZVJlcG9zIiwiZ2V0T3B0aW9uIiwiaXNPcHRpb25LZXlQcm92aWRlZCIsImdldFJlcG8iLCJfX2Rpcm5hbWUiLCJ1cmwiLCJ0cmFuc3BpbGUiLCJwcm92aWRlZE9wdGlvbnMiLCJzdGFydCIsIkRhdGUiLCJub3ciLCJvcHRpb25zIiwiYXNzaWduSW4iLCJhbGwiLCJzaWxlbnQiLCJjbGVhbiIsImxpdmUiLCJyZXBvcyIsImxlbmd0aCIsImRpc3RQYXRoIiwicmVzb2x2ZSIsImV4aXN0c1N5bmMiLCJybVN5bmMiLCJyZWN1cnNpdmUiLCJmb3JjZSIsImNodW5rcyIsImNodW5rIiwiY29uc29sZSIsImxvZyIsIlByb21pc2UiLCJtYXAiLCJjaHVua2VkUmVwb3MiLCJzcGF3blRyYW5zcGlsZSIsImdldFRyYW5zcGlsZUNMSU9wdGlvbnMiLCJ0cmFuc3BpbGVPcHRpb25zIiwic3BsaXQiLCJydW5uYWJsZSIsInByb2Nlc3MiLCJwbGF0Zm9ybSIsInN0YXJ0c1dpdGgiLCJydW5uYWJsZVBhdGgiLCJqb2luIiwiZ2V0QnJhbmRzIiwicGF0aEZvckJyYW5kIiwiYnJhbmRzIiwicmVhZGRpclN5bmMiLCJmaWx0ZXIiLCJmaWxlIiwic3RhdFN5bmMiLCJpc0RpcmVjdG9yeSIsIm9taXREaXJlY3RvcmllcyIsImZpbHRlcmVkQnJhbmRzIiwiYnJhbmQiLCJpbmNsdWRlcyIsImdldFN1YmRpcmVjdG9yaWVzIiwicmVwbyIsInN1YmRpcnMiLCJwdXNoIiwic3ViZGlyIiwic3Bhd25Db21tYW5kIiwiY29tbWFuZCIsImFyZ3MiLCJyZWplY3QiLCJjaGlsZCIsImN3ZCIsInNoZWxsIiwic3RkaW8iLCJvbiIsImVycm9yIiwiY29kZSIsIkVycm9yIiwiYXJnc1N0cmluZyIsImZsYXR0ZW4iXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRWpELE9BQU9BLFlBQVksU0FBUztBQUM1QixTQUFTQyxLQUFLLFFBQVEsZ0JBQWdCO0FBQ3RDLE9BQU9DLFFBQVEsS0FBSztBQUNwQixPQUFPQyxPQUFPLFNBQVM7QUFDdkIsT0FBT0MsVUFBVSxPQUFPO0FBQ3hCLE9BQU9DLGFBQWEsZ0RBQWdEO0FBQ3BFLE9BQU9DLG9CQUFvQix1REFBdUQ7QUFFbEYsT0FBT0MsYUFBYUMsbUJBQW1CLFFBQVEsNERBQTREO0FBQzNHLE9BQU9DLGFBQWEsMERBQTBEO0FBRTlFLHdFQUF3RTtBQUN4RSxNQUFNQyxZQUFZTCxRQUFTLFlBQVlNLEdBQUc7QUFvQjFDOzs7OztDQUtDLEdBQ0Qsd0JBQThCQyxVQUFXQyxlQUEwQztXQUFyREQ7O1NBQUFBO0lBQUFBLGFBQWYsb0JBQUEsVUFBMEJDLGVBQTBDO1FBQ2pGLE1BQU1DLFFBQVFDLEtBQUtDLEdBQUc7UUFFdEIsZ0ZBQWdGO1FBQ2hGLE1BQU1DLFVB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