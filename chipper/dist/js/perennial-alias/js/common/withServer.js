// Copyright 2017, University of Colorado Boulder
/**
 * A simple webserver that will serve the git root on a specific port for the duration of an async callback
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
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
const http = require('http');
const fs = require('fs');
const _ = require('lodash');
const winston = require('winston');
/**
 * A simple webserver that will serve the git root on a specific port for the duration of an async callback
 * @public
 *
 * @param {function(number)} asyncCallback
 * @param {Object} [options]
 * @returns {Promise<*>} - Returns the result of the asyncCallback
 */ module.exports = function(asyncCallback, options) {
    options = _.merge({
        path: '../',
        port: 0 // 0 means it will find an open port
    }, options);
    return new Promise((resolve, reject)=>{
        // Consider using https://github.com/cloudhead/node-static or reading https://nodejs.org/en/knowledge/HTTP/servers/how-to-serve-static-files/
        const server = http.createServer((req, res)=>{
            const path = req.url.split('?')[0];
            let url = req.url;
            if (path.endsWith('/')) {
                const newPath = path + 'index.html';
                url = url.replace(path, newPath);
            }
            // Trim query string
            const tail = url.indexOf('?') >= 0 ? url.substring(0, url.indexOf('?')) : url;
            const fullPath = `${process.cwd()}/${options.path}${tail}`;
            // See https://gist.github.com/aolde/8104861
            const mimeTypes = {
                html: 'text/html',
                jpeg: 'image/jpeg',
                jpg: 'image/jpeg',
                png: 'image/png',
                js: 'text/javascript',
                mjs: 'text/javascript',
                css: 'text/css',
                gif: 'image/gif',
                mp3: 'audio/mpeg',
                wav: 'audio/wav',
                // needed to be added to support PhET sims.
                svg: 'image/svg+xml',
                json: 'application/json',
                ico: 'image/x-icon'
            };
            const fileExtension = fullPath.split('.').pop();
            let mimeType = mimeTypes[fileExtension];
            if (!mimeType && (fullPath.includes('active-runnables') || fullPath.includes('active-repos'))) {
                mimeType = 'text/plain';
            }
            if (!mimeType) {
                throw new Error(`unsupported mime type, please add above: ${fileExtension}`);
            }
            fs.readFile(fullPath, (err, data)=>{
                if (err) {
                    res.writeHead(404);
                    res.end(JSON.stringify(err));
                } else {
                    res.writeHead(200, {
                        'Content-Type': mimeType
                    });
                    res.end(data);
                }
            });
        });
        server.on('listening', /*#__PURE__*/ _async_to_generator(function*() {
            const port = server.address().port;
            winston.debug('info', `Server listening on port ${port}`);
            let result;
            try {
                result = yield asyncCallback(port);
            } catch (e) {
                reject(e);
            }
            server.close(()=>{
                winston.debug('info', `Express stopped listening on port ${port}`);
                resolve(result);
            });
        }));
        server.listen(options.port);
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vd2l0aFNlcnZlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBzaW1wbGUgd2Vic2VydmVyIHRoYXQgd2lsbCBzZXJ2ZSB0aGUgZ2l0IHJvb3Qgb24gYSBzcGVjaWZpYyBwb3J0IGZvciB0aGUgZHVyYXRpb24gb2YgYW4gYXN5bmMgY2FsbGJhY2tcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuY29uc3QgaHR0cCA9IHJlcXVpcmUoICdodHRwJyApO1xuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XG5jb25zdCBfID0gcmVxdWlyZSggJ2xvZGFzaCcgKTtcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcblxuLyoqXG4gKiBBIHNpbXBsZSB3ZWJzZXJ2ZXIgdGhhdCB3aWxsIHNlcnZlIHRoZSBnaXQgcm9vdCBvbiBhIHNwZWNpZmljIHBvcnQgZm9yIHRoZSBkdXJhdGlvbiBvZiBhbiBhc3luYyBjYWxsYmFja1xuICogQHB1YmxpY1xuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb24obnVtYmVyKX0gYXN5bmNDYWxsYmFja1xuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHJldHVybnMge1Byb21pc2U8Kj59IC0gUmV0dXJucyB0aGUgcmVzdWx0IG9mIHRoZSBhc3luY0NhbGxiYWNrXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIGFzeW5jQ2FsbGJhY2ssIG9wdGlvbnMgKSB7XG5cbiAgb3B0aW9ucyA9IF8ubWVyZ2UoIHtcbiAgICBwYXRoOiAnLi4vJyxcbiAgICBwb3J0OiAwIC8vIDAgbWVhbnMgaXQgd2lsbCBmaW5kIGFuIG9wZW4gcG9ydFxuICB9LCBvcHRpb25zICk7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUsIHJlamVjdCApID0+IHtcblxuXG4gICAgLy8gQ29uc2lkZXIgdXNpbmcgaHR0cHM6Ly9naXRodWIuY29tL2Nsb3VkaGVhZC9ub2RlLXN0YXRpYyBvciByZWFkaW5nIGh0dHBzOi8vbm9kZWpzLm9yZy9lbi9rbm93bGVkZ2UvSFRUUC9zZXJ2ZXJzL2hvdy10by1zZXJ2ZS1zdGF0aWMtZmlsZXMvXG4gICAgY29uc3Qgc2VydmVyID0gaHR0cC5jcmVhdGVTZXJ2ZXIoICggcmVxLCByZXMgKSA9PiB7XG5cbiAgICAgIGNvbnN0IHBhdGggPSByZXEudXJsLnNwbGl0KCAnPycgKVsgMCBdO1xuICAgICAgbGV0IHVybCA9IHJlcS51cmw7XG4gICAgICBpZiAoIHBhdGguZW5kc1dpdGgoICcvJyApICkge1xuICAgICAgICBjb25zdCBuZXdQYXRoID0gcGF0aCArICdpbmRleC5odG1sJztcbiAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UoIHBhdGgsIG5ld1BhdGggKTtcbiAgICAgIH1cblxuICAgICAgLy8gVHJpbSBxdWVyeSBzdHJpbmdcbiAgICAgIGNvbnN0IHRhaWwgPSB1cmwuaW5kZXhPZiggJz8nICkgPj0gMCA/IHVybC5zdWJzdHJpbmcoIDAsIHVybC5pbmRleE9mKCAnPycgKSApIDogdXJsO1xuICAgICAgY29uc3QgZnVsbFBhdGggPSBgJHtwcm9jZXNzLmN3ZCgpfS8ke29wdGlvbnMucGF0aH0ke3RhaWx9YDtcblxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2FvbGRlLzgxMDQ4NjFcbiAgICAgIGNvbnN0IG1pbWVUeXBlcyA9IHtcbiAgICAgICAgaHRtbDogJ3RleHQvaHRtbCcsXG4gICAgICAgIGpwZWc6ICdpbWFnZS9qcGVnJyxcbiAgICAgICAganBnOiAnaW1hZ2UvanBlZycsXG4gICAgICAgIHBuZzogJ2ltYWdlL3BuZycsXG4gICAgICAgIGpzOiAndGV4dC9qYXZhc2NyaXB0JyxcbiAgICAgICAgbWpzOiAndGV4dC9qYXZhc2NyaXB0JyxcbiAgICAgICAgY3NzOiAndGV4dC9jc3MnLFxuICAgICAgICBnaWY6ICdpbWFnZS9naWYnLFxuICAgICAgICBtcDM6ICdhdWRpby9tcGVnJyxcbiAgICAgICAgd2F2OiAnYXVkaW8vd2F2JyxcblxuICAgICAgICAvLyBuZWVkZWQgdG8gYmUgYWRkZWQgdG8gc3VwcG9ydCBQaEVUIHNpbXMuXG4gICAgICAgIHN2ZzogJ2ltYWdlL3N2Zyt4bWwnLFxuICAgICAgICBqc29uOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgIGljbzogJ2ltYWdlL3gtaWNvbidcbiAgICAgIH07XG4gICAgICBjb25zdCBmaWxlRXh0ZW5zaW9uID0gZnVsbFBhdGguc3BsaXQoICcuJyApLnBvcCgpO1xuICAgICAgbGV0IG1pbWVUeXBlID0gbWltZVR5cGVzWyBmaWxlRXh0ZW5zaW9uIF07XG5cbiAgICAgIGlmICggIW1pbWVUeXBlICYmICggZnVsbFBhdGguaW5jbHVkZXMoICdhY3RpdmUtcnVubmFibGVzJyApIHx8IGZ1bGxQYXRoLmluY2x1ZGVzKCAnYWN0aXZlLXJlcG9zJyApICkgKSB7XG4gICAgICAgIG1pbWVUeXBlID0gJ3RleHQvcGxhaW4nO1xuICAgICAgfVxuXG4gICAgICBpZiAoICFtaW1lVHlwZSApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgdW5zdXBwb3J0ZWQgbWltZSB0eXBlLCBwbGVhc2UgYWRkIGFib3ZlOiAke2ZpbGVFeHRlbnNpb259YCApO1xuICAgICAgfVxuICAgICAgZnMucmVhZEZpbGUoIGZ1bGxQYXRoLCAoIGVyciwgZGF0YSApID0+IHtcbiAgICAgICAgaWYgKCBlcnIgKSB7XG4gICAgICAgICAgcmVzLndyaXRlSGVhZCggNDA0ICk7XG4gICAgICAgICAgcmVzLmVuZCggSlNPTi5zdHJpbmdpZnkoIGVyciApICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcmVzLndyaXRlSGVhZCggMjAwLCB7ICdDb250ZW50LVR5cGUnOiBtaW1lVHlwZSB9ICk7XG4gICAgICAgICAgcmVzLmVuZCggZGF0YSApO1xuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgfSApO1xuICAgIHNlcnZlci5vbiggJ2xpc3RlbmluZycsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IHBvcnQgPSBzZXJ2ZXIuYWRkcmVzcygpLnBvcnQ7XG4gICAgICB3aW5zdG9uLmRlYnVnKCAnaW5mbycsIGBTZXJ2ZXIgbGlzdGVuaW5nIG9uIHBvcnQgJHtwb3J0fWAgKTtcblxuICAgICAgbGV0IHJlc3VsdDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzdWx0ID0gYXdhaXQgYXN5bmNDYWxsYmFjayggcG9ydCApO1xuICAgICAgfVxuICAgICAgY2F0Y2goIGUgKSB7XG4gICAgICAgIHJlamVjdCggZSApO1xuICAgICAgfVxuXG4gICAgICBzZXJ2ZXIuY2xvc2UoICgpID0+IHtcbiAgICAgICAgd2luc3Rvbi5kZWJ1ZyggJ2luZm8nLCBgRXhwcmVzcyBzdG9wcGVkIGxpc3RlbmluZyBvbiBwb3J0ICR7cG9ydH1gICk7XG5cbiAgICAgICAgcmVzb2x2ZSggcmVzdWx0ICk7XG4gICAgICB9ICk7XG4gICAgfSApO1xuXG4gICAgc2VydmVyLmxpc3Rlbiggb3B0aW9ucy5wb3J0ICk7XG4gIH0gKTtcbn07Il0sIm5hbWVzIjpbImh0dHAiLCJyZXF1aXJlIiwiZnMiLCJfIiwid2luc3RvbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJhc3luY0NhbGxiYWNrIiwib3B0aW9ucyIsIm1lcmdlIiwicGF0aCIsInBvcnQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInNlcnZlciIsImNyZWF0ZVNlcnZlciIsInJlcSIsInJlcyIsInVybCIsInNwbGl0IiwiZW5kc1dpdGgiLCJuZXdQYXRoIiwicmVwbGFjZSIsInRhaWwiLCJpbmRleE9mIiwic3Vic3RyaW5nIiwiZnVsbFBhdGgiLCJwcm9jZXNzIiwiY3dkIiwibWltZVR5cGVzIiwiaHRtbCIsImpwZWciLCJqcGciLCJwbmciLCJqcyIsIm1qcyIsImNzcyIsImdpZiIsIm1wMyIsIndhdiIsInN2ZyIsImpzb24iLCJpY28iLCJmaWxlRXh0ZW5zaW9uIiwicG9wIiwibWltZVR5cGUiLCJpbmNsdWRlcyIsIkVycm9yIiwicmVhZEZpbGUiLCJlcnIiLCJkYXRhIiwid3JpdGVIZWFkIiwiZW5kIiwiSlNPTiIsInN0cmluZ2lmeSIsIm9uIiwiYWRkcmVzcyIsImRlYnVnIiwicmVzdWx0IiwiZSIsImNsb3NlIiwibGlzdGVuIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7O0NBS0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsT0FBT0MsUUFBUztBQUN0QixNQUFNQyxLQUFLRCxRQUFTO0FBQ3BCLE1BQU1FLElBQUlGLFFBQVM7QUFDbkIsTUFBTUcsVUFBVUgsUUFBUztBQUV6Qjs7Ozs7OztDQU9DLEdBQ0RJLE9BQU9DLE9BQU8sR0FBRyxTQUFVQyxhQUFhLEVBQUVDLE9BQU87SUFFL0NBLFVBQVVMLEVBQUVNLEtBQUssQ0FBRTtRQUNqQkMsTUFBTTtRQUNOQyxNQUFNLEVBQUUsb0NBQW9DO0lBQzlDLEdBQUdIO0lBRUgsT0FBTyxJQUFJSSxRQUFTLENBQUVDLFNBQVNDO1FBRzdCLDZJQUE2STtRQUM3SSxNQUFNQyxTQUFTZixLQUFLZ0IsWUFBWSxDQUFFLENBQUVDLEtBQUtDO1lBRXZDLE1BQU1SLE9BQU9PLElBQUlFLEdBQUcsQ0FBQ0MsS0FBSyxDQUFFLElBQUssQ0FBRSxFQUFHO1lBQ3RDLElBQUlELE1BQU1GLElBQUlFLEdBQUc7WUFDakIsSUFBS1QsS0FBS1csUUFBUSxDQUFFLE1BQVE7Z0JBQzFCLE1BQU1DLFVBQVVaLE9BQU87Z0JBQ3ZCUyxNQUFNQSxJQUFJSSxPQUFPLENBQUViLE1BQU1ZO1lBQzNCO1lBRUEsb0JBQW9CO1lBQ3BCLE1BQU1FLE9BQU9MLElBQUlNLE9BQU8sQ0FBRSxRQUFTLElBQUlOLElBQUlPLFNBQVMsQ0FBRSxHQUFHUCxJQUFJTSxPQUFPLENBQUUsUUFBVU47WUFDaEYsTUFBTVEsV0FBVyxHQUFHQyxRQUFRQyxHQUFHLEdBQUcsQ0FBQyxFQUFFckIsUUFBUUUsSUFBSSxHQUFHYyxNQUFNO1lBRTFELDRDQUE0QztZQUM1QyxNQUFNTSxZQUFZO2dCQUNoQkMsTUFBTTtnQkFDTkMsTUFBTTtnQkFDTkMsS0FBSztnQkFDTEMsS0FBSztnQkFDTEMsSUFBSTtnQkFDSkMsS0FBSztnQkFDTEMsS0FBSztnQkFDTEMsS0FBSztnQkFDTEMsS0FBSztnQkFDTEMsS0FBSztnQkFFTCwyQ0FBMkM7Z0JBQzNDQyxLQUFLO2dCQUNMQyxNQUFNO2dCQUNOQyxLQUFLO1lBQ1A7WUFDQSxNQUFNQyxnQkFBZ0JqQixTQUFTUCxLQUFLLENBQUUsS0FBTXlCLEdBQUc7WUFDL0MsSUFBSUMsV0FBV2hCLFNBQVMsQ0FBRWMsY0FBZTtZQUV6QyxJQUFLLENBQUNFLFlBQWNuQixDQUFBQSxTQUFTb0IsUUFBUSxDQUFFLHVCQUF3QnBCLFNBQVNvQixRQUFRLENBQUUsZUFBZSxHQUFNO2dCQUNyR0QsV0FBVztZQUNiO1lBRUEsSUFBSyxDQUFDQSxVQUFXO2dCQUNmLE1BQU0sSUFBSUUsTUFBTyxDQUFDLHlDQUF5QyxFQUFFSixlQUFlO1lBQzlFO1lBQ0ExQyxHQUFHK0MsUUFBUSxDQUFFdEIsVUFBVSxDQUFFdUIsS0FBS0M7Z0JBQzVCLElBQUtELEtBQU07b0JBQ1RoQyxJQUFJa0MsU0FBUyxDQUFFO29CQUNmbEMsSUFBSW1DLEdBQUcsQ0FBRUMsS0FBS0MsU0FBUyxDQUFFTDtnQkFDM0IsT0FDSztvQkFDSGhDLElBQUlrQyxTQUFTLENBQUUsS0FBSzt3QkFBRSxnQkFBZ0JOO29CQUFTO29CQUMvQzVCLElBQUltQyxHQUFHLENBQUVGO2dCQUNYO1lBQ0Y7UUFDRjtRQUNBcEMsT0FBT3lDLEVBQUUsQ0FBRSwrQ0FBYTtZQUN0QixNQUFNN0MsT0FBT0ksT0FBTzBDLE9BQU8sR0FBRzlDLElBQUk7WUFDbENQLFFBQVFzRCxLQUFLLENBQUUsUUFBUSxDQUFDLHlCQUF5QixFQUFFL0MsTUFBTTtZQUV6RCxJQUFJZ0Q7WUFFSixJQUFJO2dCQUNGQSxTQUFTLE1BQU1wRCxjQUFlSTtZQUNoQyxFQUNBLE9BQU9pRCxHQUFJO2dCQUNUOUMsT0FBUThDO1lBQ1Y7WUFFQTdDLE9BQU84QyxLQUFLLENBQUU7Z0JBQ1p6RCxRQUFRc0QsS0FBSyxDQUFFLFFBQVEsQ0FBQyxrQ0FBa0MsRUFBRS9DLE1BQU07Z0JBRWxFRSxRQUFTOEM7WUFDWDtRQUNGO1FBRUE1QyxPQUFPK0MsTUFBTSxDQUFFdEQsUUFBUUcsSUFBSTtJQUM3QjtBQUNGIn0=