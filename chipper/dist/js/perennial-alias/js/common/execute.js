// Copyright 2017, University of Colorado Boulder
/**
 * Command execution wrapper (with common settings)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ function _extends() {
    _extends = Object.assign || function(target) {
        for(var i = 1; i < arguments.length; i++){
            var source = arguments[i];
            for(var key in source){
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    };
    return _extends.apply(this, arguments);
}
import assert from 'assert';
import child_process from 'child_process';
import grunt from 'grunt';
import _ from 'lodash';
import winston from 'winston';
/**
 * Executes a command, with specific arguments and in a specific directory (cwd).
 *
 * Resolves with the stdout: {string}
 * Rejects with { code: {number}, stdout: {string} } -- Happens if the exit code is non-zero.
 *
 * @param cmd - The process to execute. Should be on the current path.
 * @param args - Array of arguments. No need to extra-quote things.
 * @param cwd - The working directory where the process should be run from
 * @param [options]
 * @rejects {ExecuteError}
 */ function execute(cmd, args, cwd, options) {
    const startTime = Date.now();
    options = _.merge({
        // {'reject'|'resolve'} - whether errors should be rejected or resolved.  If errors are resolved, then an object
        //                      - of the form {code:number,stdout:string,stderr:string} is returned. 'resolve' allows usage
        //                      - in Promise.all without exiting on the 1st failure
        errors: 'reject',
        // Provide additional env variables, and they will be merged with the existing defaults.
        // eslint-disable-next-line phet/no-object-spread-on-non-literals
        childProcessEnv: _extends({}, process.env),
        // options.shell value to the child_process.spawn. shell:true is required for a NodeJS security update, see https://github.com/phetsims/perennial/issues/359
        // In this case, only bash scripts fail with an EINVAL error, so we don't need to worry about node/git (and in
        // fact don't want the overhead of a new shell).
        childProcessShell: cmd !== 'node' && cmd !== 'git' && process.platform.startsWith('win')
    }, options);
    assert(options.errors === 'reject' || options.errors === 'resolve', 'Errors must reject or resolve');
    return new Promise((resolve, reject)=>{
        let rejectedByError = false;
        let stdout = ''; // to be appended to
        let stderr = '';
        const childProcess = child_process.spawn(cmd, args, {
            cwd: cwd,
            env: options.childProcessEnv,
            shell: options.childProcessShell
        });
        childProcess.on('error', (error)=>{
            rejectedByError = true;
            if (options.errors === 'resolve') {
                resolve({
                    code: 1,
                    stdout: stdout,
                    stderr: stderr,
                    cwd: cwd,
                    error: error,
                    time: Date.now() - startTime
                });
            } else {
                reject(new ExecuteError(cmd, args, cwd, stdout, stderr, -1, Date.now() - startTime));
            }
        });
        winston.debug(`Running ${cmd} ${args.join(' ')} from ${cwd}`);
        childProcess.stderr.on('data', (data)=>{
            stderr += data;
            grunt.log.verbose.writeln(`stderr: ${data}`);
            winston.debug(`stderr: ${data}`);
        });
        childProcess.stdout.on('data', (data)=>{
            stdout += data;
            grunt.log.verbose.writeln(`stdout: ${data}`);
            winston.debug(`stdout: ${data}`);
        });
        childProcess.on('close', (code)=>{
            winston.debug(`Command ${cmd} finished. Output is below.`);
            winston.debug(stderr && `stderr: ${stderr}` || 'stderr is empty.');
            winston.debug(stdout && `stdout: ${stdout}` || 'stdout is empty.');
            if (!rejectedByError) {
                if (options.errors === 'resolve') {
                    resolve({
                        code: code,
                        stdout: stdout,
                        stderr: stderr,
                        cwd: cwd,
                        time: Date.now() - startTime
                    });
                } else {
                    if (code !== 0) {
                        reject(new ExecuteError(cmd, args, cwd, stdout, stderr, code, Date.now() - startTime));
                    } else {
                        resolve(stdout);
                    }
                }
            }
        });
    });
}
let ExecuteError = class ExecuteError extends Error {
    constructor(cmd, args, cwd, stdout, stderr, code, time// ms
    ){
        super(`${cmd} ${args.join(' ')} in ${cwd} failed with exit code ${code}${stdout ? `\nstdout:\n${stdout}` : ''}${stderr ? `\nstderr:\n${stderr}` : ''}`), this.cmd = cmd, this.args = args, this.cwd = cwd, this.stdout = stdout, this.stderr = stderr, this.code = code, this.time = time;
    }
};
export default execute;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZXhlY3V0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQ29tbWFuZCBleGVjdXRpb24gd3JhcHBlciAod2l0aCBjb21tb24gc2V0dGluZ3MpXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBjaGlsZF9wcm9jZXNzIGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IGdydW50IGZyb20gJ2dydW50JztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgd2luc3RvbiBmcm9tICd3aW5zdG9uJztcblxudHlwZSBFcnJvcnNIYW5kbGVkID0gJ3Jlc29sdmUnIHwgJ3JlamVjdCc7XG5cbnR5cGUgRXhlY3V0ZU9wdGlvbnMgPSB7XG4gIGNoaWxkUHJvY2Vzc0VudjogdHlwZW9mIHByb2Nlc3MuZW52O1xuICBjaGlsZFByb2Nlc3NTaGVsbDogYm9vbGVhbjtcbn07XG5leHBvcnQgdHlwZSBFeGVjdXRlUmVzdWx0ID0geyBjb2RlOiBudW1iZXI7IHN0ZG91dDogc3RyaW5nOyBzdGRlcnI6IHN0cmluZzsgY3dkOiBzdHJpbmc7IGVycm9yPzogRXJyb3I7IHRpbWU6IG51bWJlciB9O1xuXG5cbi8vIE92ZXJsb2FkIHdoZW4gb3B0aW9ucy5lcnJvcnMgaXMgJ3Jlc29sdmUnXG5mdW5jdGlvbiBleGVjdXRlKFxuICBjbWQ6IHN0cmluZyxcbiAgYXJnczogc3RyaW5nW10sXG4gIGN3ZDogc3RyaW5nLFxuICBvcHRpb25zOiB7IGVycm9yczogJ3Jlc29sdmUnIH0gJiBQYXJ0aWFsPEV4ZWN1dGVPcHRpb25zPlxuKTogUHJvbWlzZTxFeGVjdXRlUmVzdWx0PjtcblxuLy8gT3ZlcmxvYWQgd2hlbiBvcHRpb25zLmVycm9ycyBpcyAncmVqZWN0JyBvciB1bmRlZmluZWQgKGRlZmF1bHQpXG5mdW5jdGlvbiBleGVjdXRlKFxuICBjbWQ6IHN0cmluZyxcbiAgYXJnczogc3RyaW5nW10sXG4gIGN3ZDogc3RyaW5nLFxuICBvcHRpb25zPzogeyBlcnJvcnM/OiAncmVqZWN0JyB9ICYgUGFydGlhbDxFeGVjdXRlT3B0aW9ucz5cbik6IFByb21pc2U8c3RyaW5nPjtcblxuLyoqXG4gKiBFeGVjdXRlcyBhIGNvbW1hbmQsIHdpdGggc3BlY2lmaWMgYXJndW1lbnRzIGFuZCBpbiBhIHNwZWNpZmljIGRpcmVjdG9yeSAoY3dkKS5cbiAqXG4gKiBSZXNvbHZlcyB3aXRoIHRoZSBzdGRvdXQ6IHtzdHJpbmd9XG4gKiBSZWplY3RzIHdpdGggeyBjb2RlOiB7bnVtYmVyfSwgc3Rkb3V0OiB7c3RyaW5nfSB9IC0tIEhhcHBlbnMgaWYgdGhlIGV4aXQgY29kZSBpcyBub24temVyby5cbiAqXG4gKiBAcGFyYW0gY21kIC0gVGhlIHByb2Nlc3MgdG8gZXhlY3V0ZS4gU2hvdWxkIGJlIG9uIHRoZSBjdXJyZW50IHBhdGguXG4gKiBAcGFyYW0gYXJncyAtIEFycmF5IG9mIGFyZ3VtZW50cy4gTm8gbmVlZCB0byBleHRyYS1xdW90ZSB0aGluZ3MuXG4gKiBAcGFyYW0gY3dkIC0gVGhlIHdvcmtpbmcgZGlyZWN0b3J5IHdoZXJlIHRoZSBwcm9jZXNzIHNob3VsZCBiZSBydW4gZnJvbVxuICogQHBhcmFtIFtvcHRpb25zXVxuICogQHJlamVjdHMge0V4ZWN1dGVFcnJvcn1cbiAqL1xuZnVuY3Rpb24gZXhlY3V0ZSggY21kOiBzdHJpbmcsIGFyZ3M6IHN0cmluZ1tdLCBjd2Q6IHN0cmluZywgb3B0aW9ucz86IFBhcnRpYWw8RXhlY3V0ZU9wdGlvbnMgJiB7IGVycm9yczogRXJyb3JzSGFuZGxlZCB9PiApOiBQcm9taXNlPHN0cmluZyB8IEV4ZWN1dGVSZXN1bHQ+IHtcblxuICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuXG4gIG9wdGlvbnMgPSBfLm1lcmdlKCB7XG5cbiAgICAvLyB7J3JlamVjdCd8J3Jlc29sdmUnfSAtIHdoZXRoZXIgZXJyb3JzIHNob3VsZCBiZSByZWplY3RlZCBvciByZXNvbHZlZC4gIElmIGVycm9ycyBhcmUgcmVzb2x2ZWQsIHRoZW4gYW4gb2JqZWN0XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgLSBvZiB0aGUgZm9ybSB7Y29kZTpudW1iZXIsc3Rkb3V0OnN0cmluZyxzdGRlcnI6c3RyaW5nfSBpcyByZXR1cm5lZC4gJ3Jlc29sdmUnIGFsbG93cyB1c2FnZVxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgIC0gaW4gUHJvbWlzZS5hbGwgd2l0aG91dCBleGl0aW5nIG9uIHRoZSAxc3QgZmFpbHVyZVxuICAgIGVycm9yczogJ3JlamVjdCcsXG5cbiAgICAvLyBQcm92aWRlIGFkZGl0aW9uYWwgZW52IHZhcmlhYmxlcywgYW5kIHRoZXkgd2lsbCBiZSBtZXJnZWQgd2l0aCB0aGUgZXhpc3RpbmcgZGVmYXVsdHMuXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHBoZXQvbm8tb2JqZWN0LXNwcmVhZC1vbi1ub24tbGl0ZXJhbHNcbiAgICBjaGlsZFByb2Nlc3NFbnY6IHsgLi4ucHJvY2Vzcy5lbnYgfSxcblxuICAgIC8vIG9wdGlvbnMuc2hlbGwgdmFsdWUgdG8gdGhlIGNoaWxkX3Byb2Nlc3Muc3Bhd24uIHNoZWxsOnRydWUgaXMgcmVxdWlyZWQgZm9yIGEgTm9kZUpTIHNlY3VyaXR5IHVwZGF0ZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9wZXJlbm5pYWwvaXNzdWVzLzM1OVxuICAgIC8vIEluIHRoaXMgY2FzZSwgb25seSBiYXNoIHNjcmlwdHMgZmFpbCB3aXRoIGFuIEVJTlZBTCBlcnJvciwgc28gd2UgZG9uJ3QgbmVlZCB0byB3b3JyeSBhYm91dCBub2RlL2dpdCAoYW5kIGluXG4gICAgLy8gZmFjdCBkb24ndCB3YW50IHRoZSBvdmVyaGVhZCBvZiBhIG5ldyBzaGVsbCkuXG4gICAgY2hpbGRQcm9jZXNzU2hlbGw6IGNtZCAhPT0gJ25vZGUnICYmIGNtZCAhPT0gJ2dpdCcgJiYgcHJvY2Vzcy5wbGF0Zm9ybS5zdGFydHNXaXRoKCAnd2luJyApXG4gIH0sIG9wdGlvbnMgKTtcbiAgYXNzZXJ0KCBvcHRpb25zLmVycm9ycyA9PT0gJ3JlamVjdCcgfHwgb3B0aW9ucy5lcnJvcnMgPT09ICdyZXNvbHZlJywgJ0Vycm9ycyBtdXN0IHJlamVjdCBvciByZXNvbHZlJyApO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlLCByZWplY3QgKSA9PiB7XG5cbiAgICBsZXQgcmVqZWN0ZWRCeUVycm9yID0gZmFsc2U7XG5cbiAgICBsZXQgc3Rkb3V0ID0gJyc7IC8vIHRvIGJlIGFwcGVuZGVkIHRvXG4gICAgbGV0IHN0ZGVyciA9ICcnO1xuXG4gICAgY29uc3QgY2hpbGRQcm9jZXNzID0gY2hpbGRfcHJvY2Vzcy5zcGF3biggY21kLCBhcmdzLCB7XG4gICAgICBjd2Q6IGN3ZCxcbiAgICAgIGVudjogb3B0aW9ucy5jaGlsZFByb2Nlc3NFbnYsXG4gICAgICBzaGVsbDogb3B0aW9ucy5jaGlsZFByb2Nlc3NTaGVsbFxuICAgIH0gKTtcblxuICAgIGNoaWxkUHJvY2Vzcy5vbiggJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgcmVqZWN0ZWRCeUVycm9yID0gdHJ1ZTtcblxuICAgICAgaWYgKCBvcHRpb25zLmVycm9ycyA9PT0gJ3Jlc29sdmUnICkge1xuICAgICAgICByZXNvbHZlKCB7IGNvZGU6IDEsIHN0ZG91dDogc3Rkb3V0LCBzdGRlcnI6IHN0ZGVyciwgY3dkOiBjd2QsIGVycm9yOiBlcnJvciwgdGltZTogRGF0ZS5ub3coKSAtIHN0YXJ0VGltZSB9ICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmVqZWN0KCBuZXcgRXhlY3V0ZUVycm9yKCBjbWQsIGFyZ3MsIGN3ZCwgc3Rkb3V0LCBzdGRlcnIsIC0xLCBEYXRlLm5vdygpIC0gc3RhcnRUaW1lICkgKTtcbiAgICAgIH1cbiAgICB9ICk7XG4gICAgd2luc3Rvbi5kZWJ1ZyggYFJ1bm5pbmcgJHtjbWR9ICR7YXJncy5qb2luKCAnICcgKX0gZnJvbSAke2N3ZH1gICk7XG5cbiAgICBjaGlsZFByb2Nlc3Muc3RkZXJyLm9uKCAnZGF0YScsIGRhdGEgPT4ge1xuICAgICAgc3RkZXJyICs9IGRhdGE7XG4gICAgICBncnVudC5sb2cudmVyYm9zZS53cml0ZWxuKCBgc3RkZXJyOiAke2RhdGF9YCApO1xuICAgICAgd2luc3Rvbi5kZWJ1ZyggYHN0ZGVycjogJHtkYXRhfWAgKTtcbiAgICB9ICk7XG4gICAgY2hpbGRQcm9jZXNzLnN0ZG91dC5vbiggJ2RhdGEnLCBkYXRhID0+IHtcbiAgICAgIHN0ZG91dCArPSBkYXRhO1xuXG4gICAgICBncnVudC5sb2cudmVyYm9zZS53cml0ZWxuKCBgc3Rkb3V0OiAke2RhdGF9YCApO1xuICAgICAgd2luc3Rvbi5kZWJ1ZyggYHN0ZG91dDogJHtkYXRhfWAgKTtcbiAgICB9ICk7XG5cbiAgICBjaGlsZFByb2Nlc3Mub24oICdjbG9zZScsICggY29kZTogbnVtYmVyICkgPT4ge1xuICAgICAgd2luc3Rvbi5kZWJ1ZyggYENvbW1hbmQgJHtjbWR9IGZpbmlzaGVkLiBPdXRwdXQgaXMgYmVsb3cuYCApO1xuXG4gICAgICB3aW5zdG9uLmRlYnVnKCBzdGRlcnIgJiYgYHN0ZGVycjogJHtzdGRlcnJ9YCB8fCAnc3RkZXJyIGlzIGVtcHR5LicgKTtcbiAgICAgIHdpbnN0b24uZGVidWcoIHN0ZG91dCAmJiBgc3Rkb3V0OiAke3N0ZG91dH1gIHx8ICdzdGRvdXQgaXMgZW1wdHkuJyApO1xuXG4gICAgICBpZiAoICFyZWplY3RlZEJ5RXJyb3IgKSB7XG4gICAgICAgIGlmICggb3B0aW9ucy5lcnJvcnMgPT09ICdyZXNvbHZlJyApIHtcbiAgICAgICAgICByZXNvbHZlKCB7IGNvZGU6IGNvZGUsIHN0ZG91dDogc3Rkb3V0LCBzdGRlcnI6IHN0ZGVyciwgY3dkOiBjd2QsIHRpbWU6IERhdGUubm93KCkgLSBzdGFydFRpbWUgfSApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGlmICggY29kZSAhPT0gMCApIHtcbiAgICAgICAgICAgIHJlamVjdCggbmV3IEV4ZWN1dGVFcnJvciggY21kLCBhcmdzLCBjd2QsIHN0ZG91dCwgc3RkZXJyLCBjb2RlLCBEYXRlLm5vdygpIC0gc3RhcnRUaW1lICkgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXNvbHZlKCBzdGRvdXQgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ICk7XG4gIH0gKTtcbn1cblxuY2xhc3MgRXhlY3V0ZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcmVhZG9ubHkgY21kOiBzdHJpbmcsXG4gICAgcHVibGljIHJlYWRvbmx5IGFyZ3M6IHN0cmluZ1tdLFxuICAgIHB1YmxpYyByZWFkb25seSBjd2Q6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgc3Rkb3V0OiBzdHJpbmcsXG4gICAgcHVibGljIHJlYWRvbmx5IHN0ZGVycjogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSBjb2RlOiBudW1iZXIsXG4gICAgcHVibGljIHJlYWRvbmx5IHRpbWU6IG51bWJlciAvLyBtc1xuICApIHtcbiAgICBzdXBlciggYCR7Y21kfSAke2FyZ3Muam9pbiggJyAnICl9IGluICR7Y3dkfSBmYWlsZWQgd2l0aCBleGl0IGNvZGUgJHtjb2RlfSR7c3Rkb3V0ID8gYFxcbnN0ZG91dDpcXG4ke3N0ZG91dH1gIDogJyd9JHtzdGRlcnIgPyBgXFxuc3RkZXJyOlxcbiR7c3RkZXJyfWAgOiAnJ31gICk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZXhlY3V0ZTsiXSwibmFtZXMiOlsiYXNzZXJ0IiwiY2hpbGRfcHJvY2VzcyIsImdydW50IiwiXyIsIndpbnN0b24iLCJleGVjdXRlIiwiY21kIiwiYXJncyIsImN3ZCIsIm9wdGlvbnMiLCJzdGFydFRpbWUiLCJEYXRlIiwibm93IiwibWVyZ2UiLCJlcnJvcnMiLCJjaGlsZFByb2Nlc3NFbnYiLCJwcm9jZXNzIiwiZW52IiwiY2hpbGRQcm9jZXNzU2hlbGwiLCJwbGF0Zm9ybSIsInN0YXJ0c1dpdGgiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInJlamVjdGVkQnlFcnJvciIsInN0ZG91dCIsInN0ZGVyciIsImNoaWxkUHJvY2VzcyIsInNwYXduIiwic2hlbGwiLCJvbiIsImVycm9yIiwiY29kZSIsInRpbWUiLCJFeGVjdXRlRXJyb3IiLCJkZWJ1ZyIsImpvaW4iLCJkYXRhIiwibG9nIiwidmVyYm9zZSIsIndyaXRlbG4iLCJFcnJvciJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7O0FBRUQsT0FBT0EsWUFBWSxTQUFTO0FBQzVCLE9BQU9DLG1CQUFtQixnQkFBZ0I7QUFDMUMsT0FBT0MsV0FBVyxRQUFRO0FBQzFCLE9BQU9DLE9BQU8sU0FBUztBQUN2QixPQUFPQyxhQUFhLFVBQVU7QUEyQjlCOzs7Ozs7Ozs7OztDQVdDLEdBQ0QsU0FBU0MsUUFBU0MsR0FBVyxFQUFFQyxJQUFjLEVBQUVDLEdBQVcsRUFBRUMsT0FBNkQ7SUFFdkgsTUFBTUMsWUFBWUMsS0FBS0MsR0FBRztJQUUxQkgsVUFBVU4sRUFBRVUsS0FBSyxDQUFFO1FBRWpCLGdIQUFnSDtRQUNoSCxtSEFBbUg7UUFDbkgsMkVBQTJFO1FBQzNFQyxRQUFRO1FBRVIsd0ZBQXdGO1FBQ3hGLGlFQUFpRTtRQUNqRUMsaUJBQWlCLGFBQUtDLFFBQVFDLEdBQUc7UUFFakMsNEpBQTRKO1FBQzVKLDhHQUE4RztRQUM5RyxnREFBZ0Q7UUFDaERDLG1CQUFtQlosUUFBUSxVQUFVQSxRQUFRLFNBQVNVLFFBQVFHLFFBQVEsQ0FBQ0MsVUFBVSxDQUFF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