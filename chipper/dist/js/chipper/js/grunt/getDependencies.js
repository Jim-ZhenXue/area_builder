// Copyright 2017-2024, University of Colorado Boulder
/**
 * Creates an object that stores information about all dependencies (including their SHAs and current branches)
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
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
import { readFileSync } from 'fs';
import execute from '../../../perennial-alias/js/common/execute.js';
import grunt from '../../../perennial-alias/js/npm-dependencies/grunt.js';
import ChipperStringUtils from '../common/ChipperStringUtils.js';
import getPhetLibs from './getPhetLibs.js';
// Our definition of an allowed simName is defined in the buildServer: https://github.com/phetsims/perennial/blob/78025b7ae6064e9ab5260cea5e532f3bf24c3ec8/js/build-server/taskWorker.js#L99-L98
// We don't want to be this strict though, because 3rd parties are allowed to name sims to be whatever they want. So
// for the purposes of dependencies, we just need to make sure it is a name, and not a path.
const simNameRegex = /^[^/]+$/;
/**
 * Returns an object in the dependencies.json format. Keys are repo names (or 'comment'). Repo keys have 'sha' and 'branch' fields.
 *
 * @returns - In the dependencies.json format. JSON.stringify if you want to output to a file
 */ export default function getDependencies(repo) {
    return _getDependencies.apply(this, arguments);
}
function _getDependencies() {
    _getDependencies = _async_to_generator(function*(repo) {
        const packageObject = JSON.parse(readFileSync(`../${repo}/package.json`, 'utf8'));
        const version = packageObject.version;
        // Accumulate dependencies for all brands
        const dependencies = getPhetLibs(repo).filter((dependency)=>dependency !== 'babel'); // Remove babel since it should be kept at main
        // We need to check dependencies for the main brand, so we can know what is guaranteed to be public
        const mainDependencies = getPhetLibs(repo, 'phet').filter((dependency)=>dependency !== 'babel');
        grunt.log.verbose.writeln(`Scanning dependencies from:\n${dependencies.toString()}`);
        const dependenciesInfo = {
            comment: `# ${repo} ${version} ${new Date().toString()}`
        };
        for (const dependency of dependencies){
            assert(!dependenciesInfo.dependency, `there was already a dependency named ${dependency}`);
            if (!simNameRegex.test(dependency)) {
                throw new Error(`Dependency name is not valid: ${dependency}`);
            } else if (!grunt.file.exists(`../${dependency}`)) {
                if (mainDependencies.includes(dependency)) {
                    throw new Error(`Dependency not found: ${dependency}`);
                }
                // NOTE NOTE NOTE: This error message is checked for on the perennial build side (it will fail the build). Do NOT change this without changing that.
                grunt.log.warn(`WARNING404: Skipping potentially non-public dependency ${dependency}`);
                continue;
            }
            let sha = null;
            let branch = null;
            try {
                sha = (yield execute('git', [
                    'rev-parse',
                    'HEAD'
                ], `../${dependency}`)).trim();
                branch = (yield execute('git', [
                    'rev-parse',
                    '--abbrev-ref',
                    'HEAD'
                ], `../${dependency}`)).trim();
            } catch (e) {
                // We support repos that are not git repositories, see https://github.com/phetsims/chipper/issues/1011
                console.log(`Did not find git information for ${dependency}`);
            }
            grunt.log.verbose.writeln(`${ChipperStringUtils.padString(dependency, 20) + branch} ${sha}`);
            dependenciesInfo[dependency] = {
                sha: sha,
                branch: branch
            };
        }
        return dependenciesInfo;
    });
    return _getDependencies.apply(this, arguments);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L2dldERlcGVuZGVuY2llcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDcmVhdGVzIGFuIG9iamVjdCB0aGF0IHN0b3JlcyBpbmZvcm1hdGlvbiBhYm91dCBhbGwgZGVwZW5kZW5jaWVzIChpbmNsdWRpbmcgdGhlaXIgU0hBcyBhbmQgY3VycmVudCBicmFuY2hlcylcbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCBleGVjdXRlIGZyb20gJy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZXhlY3V0ZS5qcyc7XG5pbXBvcnQgZ3J1bnQgZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL25wbS1kZXBlbmRlbmNpZXMvZ3J1bnQuanMnO1xuaW1wb3J0IENoaXBwZXJTdHJpbmdVdGlscyBmcm9tICcuLi9jb21tb24vQ2hpcHBlclN0cmluZ1V0aWxzLmpzJztcbmltcG9ydCBnZXRQaGV0TGlicyBmcm9tICcuL2dldFBoZXRMaWJzLmpzJztcblxuLy8gT3VyIGRlZmluaXRpb24gb2YgYW4gYWxsb3dlZCBzaW1OYW1lIGlzIGRlZmluZWQgaW4gdGhlIGJ1aWxkU2VydmVyOiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGVyZW5uaWFsL2Jsb2IvNzgwMjViN2FlNjA2NGU5YWI1MjYwY2VhNWU1MzJmM2JmMjRjM2VjOC9qcy9idWlsZC1zZXJ2ZXIvdGFza1dvcmtlci5qcyNMOTktTDk4XG4vLyBXZSBkb24ndCB3YW50IHRvIGJlIHRoaXMgc3RyaWN0IHRob3VnaCwgYmVjYXVzZSAzcmQgcGFydGllcyBhcmUgYWxsb3dlZCB0byBuYW1lIHNpbXMgdG8gYmUgd2hhdGV2ZXIgdGhleSB3YW50LiBTb1xuLy8gZm9yIHRoZSBwdXJwb3NlcyBvZiBkZXBlbmRlbmNpZXMsIHdlIGp1c3QgbmVlZCB0byBtYWtlIHN1cmUgaXQgaXMgYSBuYW1lLCBhbmQgbm90IGEgcGF0aC5cbmNvbnN0IHNpbU5hbWVSZWdleCA9IC9eW14vXSskLztcblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCBpbiB0aGUgZGVwZW5kZW5jaWVzLmpzb24gZm9ybWF0LiBLZXlzIGFyZSByZXBvIG5hbWVzIChvciAnY29tbWVudCcpLiBSZXBvIGtleXMgaGF2ZSAnc2hhJyBhbmQgJ2JyYW5jaCcgZmllbGRzLlxuICpcbiAqIEByZXR1cm5zIC0gSW4gdGhlIGRlcGVuZGVuY2llcy5qc29uIGZvcm1hdC4gSlNPTi5zdHJpbmdpZnkgaWYgeW91IHdhbnQgdG8gb3V0cHV0IHRvIGEgZmlsZVxuICovXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBnZXREZXBlbmRlbmNpZXMoIHJlcG86IHN0cmluZyApOiBQcm9taXNlPG9iamVjdD4ge1xuXG4gIGNvbnN0IHBhY2thZ2VPYmplY3QgPSBKU09OLnBhcnNlKCByZWFkRmlsZVN5bmMoIGAuLi8ke3JlcG99L3BhY2thZ2UuanNvbmAsICd1dGY4JyApICk7XG4gIGNvbnN0IHZlcnNpb24gPSBwYWNrYWdlT2JqZWN0LnZlcnNpb247XG5cbiAgLy8gQWNjdW11bGF0ZSBkZXBlbmRlbmNpZXMgZm9yIGFsbCBicmFuZHNcbiAgY29uc3QgZGVwZW5kZW5jaWVzOiBzdHJpbmdbXSA9IGdldFBoZXRMaWJzKCByZXBvICkuZmlsdGVyKCBkZXBlbmRlbmN5ID0+IGRlcGVuZGVuY3kgIT09ICdiYWJlbCcgKTsgLy8gUmVtb3ZlIGJhYmVsIHNpbmNlIGl0IHNob3VsZCBiZSBrZXB0IGF0IG1haW5cblxuICAvLyBXZSBuZWVkIHRvIGNoZWNrIGRlcGVuZGVuY2llcyBmb3IgdGhlIG1haW4gYnJhbmQsIHNvIHdlIGNhbiBrbm93IHdoYXQgaXMgZ3VhcmFudGVlZCB0byBiZSBwdWJsaWNcbiAgY29uc3QgbWFpbkRlcGVuZGVuY2llcyA9IGdldFBoZXRMaWJzKCByZXBvLCAncGhldCcgKS5maWx0ZXIoIGRlcGVuZGVuY3kgPT4gZGVwZW5kZW5jeSAhPT0gJ2JhYmVsJyApO1xuXG4gIGdydW50LmxvZy52ZXJib3NlLndyaXRlbG4oIGBTY2FubmluZyBkZXBlbmRlbmNpZXMgZnJvbTpcXG4ke2RlcGVuZGVuY2llcy50b1N0cmluZygpfWAgKTtcblxuICBjb25zdCBkZXBlbmRlbmNpZXNJbmZvOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHtcbiAgICBjb21tZW50OiBgIyAke3JlcG99ICR7dmVyc2lvbn0gJHtuZXcgRGF0ZSgpLnRvU3RyaW5nKCl9YFxuICB9O1xuXG4gIGZvciAoIGNvbnN0IGRlcGVuZGVuY3kgb2YgZGVwZW5kZW5jaWVzICkge1xuICAgIGFzc2VydCggIWRlcGVuZGVuY2llc0luZm8uZGVwZW5kZW5jeSwgYHRoZXJlIHdhcyBhbHJlYWR5IGEgZGVwZW5kZW5jeSBuYW1lZCAke2RlcGVuZGVuY3l9YCApO1xuXG4gICAgaWYgKCAhc2ltTmFtZVJlZ2V4LnRlc3QoIGRlcGVuZGVuY3kgKSApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggYERlcGVuZGVuY3kgbmFtZSBpcyBub3QgdmFsaWQ6ICR7ZGVwZW5kZW5jeX1gICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCAhZ3J1bnQuZmlsZS5leGlzdHMoIGAuLi8ke2RlcGVuZGVuY3l9YCApICkge1xuICAgICAgaWYgKCBtYWluRGVwZW5kZW5jaWVzLmluY2x1ZGVzKCBkZXBlbmRlbmN5ICkgKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvciggYERlcGVuZGVuY3kgbm90IGZvdW5kOiAke2RlcGVuZGVuY3l9YCApO1xuICAgICAgfVxuXG4gICAgICAvLyBOT1RFIE5PVEUgTk9URTogVGhpcyBlcnJvciBtZXNzYWdlIGlzIGNoZWNrZWQgZm9yIG9uIHRoZSBwZXJlbm5pYWwgYnVpbGQgc2lkZSAoaXQgd2lsbCBmYWlsIHRoZSBidWlsZCkuIERvIE5PVCBjaGFuZ2UgdGhpcyB3aXRob3V0IGNoYW5naW5nIHRoYXQuXG4gICAgICBncnVudC5sb2cud2FybiggYFdBUk5JTkc0MDQ6IFNraXBwaW5nIHBvdGVudGlhbGx5IG5vbi1wdWJsaWMgZGVwZW5kZW5jeSAke2RlcGVuZGVuY3l9YCApO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgbGV0IHNoYSA9IG51bGw7XG4gICAgbGV0IGJyYW5jaCA9IG51bGw7XG5cbiAgICB0cnkge1xuICAgICAgc2hhID0gKCBhd2FpdCBleGVjdXRlKCAnZ2l0JywgWyAncmV2LXBhcnNlJywgJ0hFQUQnIF0sIGAuLi8ke2RlcGVuZGVuY3l9YCApICkudHJpbSgpO1xuICAgICAgYnJhbmNoID0gKCBhd2FpdCBleGVjdXRlKCAnZ2l0JywgWyAncmV2LXBhcnNlJywgJy0tYWJicmV2LXJlZicsICdIRUFEJyBdLCBgLi4vJHtkZXBlbmRlbmN5fWAgKSApLnRyaW0oKTtcbiAgICB9XG4gICAgY2F0Y2goIGUgKSB7XG4gICAgICAvLyBXZSBzdXBwb3J0IHJlcG9zIHRoYXQgYXJlIG5vdCBnaXQgcmVwb3NpdG9yaWVzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzEwMTFcbiAgICAgIGNvbnNvbGUubG9nKCBgRGlkIG5vdCBmaW5kIGdpdCBpbmZvcm1hdGlvbiBmb3IgJHtkZXBlbmRlbmN5fWAgKTtcbiAgICB9XG5cbiAgICBncnVudC5sb2cudmVyYm9zZS53cml0ZWxuKCBgJHtDaGlwcGVyU3RyaW5nVXRpbHMucGFkU3RyaW5nKCBkZXBlbmRlbmN5LCAyMCApICsgYnJhbmNofSAke3NoYX1gICk7XG4gICAgZGVwZW5kZW5jaWVzSW5mb1sgZGVwZW5kZW5jeSBdID0geyBzaGE6IHNoYSwgYnJhbmNoOiBicmFuY2ggfTtcbiAgfVxuXG4gIHJldHVybiBkZXBlbmRlbmNpZXNJbmZvO1xufSJdLCJuYW1lcyI6WyJhc3NlcnQiLCJyZWFkRmlsZVN5bmMiLCJleGVjdXRlIiwiZ3J1bnQiLCJDaGlwcGVyU3RyaW5nVXRpbHMiLCJnZXRQaGV0TGlicyIsInNpbU5hbWVSZWdleCIsImdldERlcGVuZGVuY2llcyIsInJlcG8iLCJwYWNrYWdlT2JqZWN0IiwiSlNPTiIsInBhcnNlIiwidmVyc2lvbiIsImRlcGVuZGVuY2llcyIsImZpbHRlciIsImRlcGVuZGVuY3kiLCJtYWluRGVwZW5kZW5jaWVzIiwibG9nIiwidmVyYm9zZSIsIndyaXRlbG4iLCJ0b1N0cmluZyIsImRlcGVuZGVuY2llc0luZm8iLCJjb21tZW50IiwiRGF0ZSIsInRlc3QiLCJFcnJvciIsImZpbGUiLCJleGlzdHMiLCJpbmNsdWRlcyIsIndhcm4iLCJzaGEiLCJicmFuY2giLCJ0cmltIiwiZSIsImNvbnNvbGUiLCJwYWRTdHJpbmciXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxPQUFPQSxZQUFZLFNBQVM7QUFDNUIsU0FBU0MsWUFBWSxRQUFRLEtBQUs7QUFDbEMsT0FBT0MsYUFBYSxnREFBZ0Q7QUFDcEUsT0FBT0MsV0FBVyx3REFBd0Q7QUFDMUUsT0FBT0Msd0JBQXdCLGtDQUFrQztBQUNqRSxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBRTNDLGdNQUFnTTtBQUNoTSxvSEFBb0g7QUFDcEgsNEZBQTRGO0FBQzVGLE1BQU1DLGVBQWU7QUFFckI7Ozs7Q0FJQyxHQUNELHdCQUE4QkMsZ0JBQWlCQyxJQUFZO1dBQTdCRDs7U0FBQUE7SUFBQUEsbUJBQWYsb0JBQUEsVUFBZ0NDLElBQVk7UUFFekQsTUFBTUMsZ0JBQWdCQyxLQUFLQyxLQUFLLENBQUVWLGFBQWMsQ0FBQyxHQUFHLEVBQUVPLEtBQUssYUFBYSxDQUFDLEVBQUU7UUFDM0UsTUFBTUksVUFBVUgsY0FBY0csT0FBTztRQUVyQyx5Q0FBeUM7UUFDekMsTUFBTUMsZUFBeUJSLFlBQWFHLE1BQU9NLE1BQU0sQ0FBRUMsQ0FBQUEsYUFBY0EsZUFBZSxVQUFXLCtDQUErQztRQUVsSixtR0FBbUc7UUFDbkcsTUFBTUMsbUJBQW1CWCxZQUFhRyxNQUFNLFFBQVNNLE1BQU0sQ0FBRUMsQ0FBQUEsYUFBY0EsZUFBZTtRQUUxRlosTUFBTWMsR0FBRyxDQUFDQyxPQUFPLENBQUNDLE9BQU8sQ0FBRSxDQUFDLDZCQUE2QixFQUFFTixhQUFhTyxRQUFRLElBQUk7UUFFcEYsTUFBTUMsbUJBQTRDO1lBQ2hEQyxTQUFTLENBQUMsRUFBRSxFQUFFZCxLQUFLLENBQUMsRUFBRUksUUFBUSxDQUFDLEVBQUUsSUFBSVcsT0FBT0gsUUFBUSxJQUFJO1FBQzFEO1FBRUEsS0FBTSxNQUFNTCxjQUFjRixhQUFlO1lBQ3ZDYixPQUFRLENBQUNxQixpQkFBaUJOLFVBQVUsRUFBRSxDQUFDLHFDQUFxQyxFQUFFQSxZQUFZO1lBRTFGLElBQUssQ0FBQ1QsYUFBYWtCLElBQUksQ0FBRVQsYUFBZTtnQkFDdEMsTUFBTSxJQUFJVSxNQUFPLENBQUMsOEJBQThCLEVBQUVWLFlBQVk7WUFDaEUsT0FDSyxJQUFLLENBQUNaLE1BQU11QixJQUFJLENBQUNDLE1BQU0sQ0FBRSxDQUFDLEdBQUcsRUFBRVosWUFBWSxHQUFLO2dCQUNuRCxJQUFLQyxpQkFBaUJZLFFBQVEsQ0FBRWIsYUFBZTtvQkFDN0MsTUFBTSxJQUFJVSxNQUFPLENBQUMsc0JBQXNCLEVBQUVWLFlBQVk7Z0JBQ3hEO2dCQUVBLG9KQUFvSjtnQkFDcEpaLE1BQU1jLEdBQUcsQ0FBQ1ksSUFBSSxDQUFFLENBQUMsdURBQXVELEVBQUVkLFlBQVk7Z0JBQ3RGO1lBQ0Y7WUFFQSxJQUFJZSxNQUFNO1lBQ1YsSUFBSUMsU0FBUztZQUViLElBQUk7Z0JBQ0ZELE1BQU0sQUFBRSxDQUFBLE1BQU01QixRQUFTLE9BQU87b0JBQUU7b0JBQWE7aUJBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRWEsWUFBWSxDQUFDLEVBQUlpQixJQUFJO2dCQUNsRkQsU0FBUyxBQUFFLENBQUEsTUFBTTdCLFFBQVMsT0FBTztvQkFBRTtvQkFBYTtvQkFBZ0I7aUJBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRWEsWUFBWSxDQUFDLEVBQUlpQixJQUFJO1lBQ3ZHLEVBQ0EsT0FBT0MsR0FBSTtnQkFDVCxzR0FBc0c7Z0JBQ3RHQyxRQUFRakIsR0FBRyxDQUFFLENBQUMsaUNBQWlDLEVBQUVGLFlBQVk7WUFDL0Q7WUFFQVosTUFBTWMsR0FBRyxDQUFDQyxPQUFPLENBQUNDLE9BQU8sQ0FBRSxHQUFHZixtQkFBbUIrQixTQUFTLENBQUVwQixZQUFZLE1BQU9nQixPQUFPLENBQUMsRUFBRUQsS0FBSztZQUM5RlQsZ0JBQWdCLENBQUVOLFdBQVksR0FBRztnQkFBRWUsS0FBS0E7Z0JBQUtDLFFBQVFBO1lBQU87UUFDOUQ7UUFFQSxPQUFPVjtJQUNUO1dBbEQ4QmQifQ==