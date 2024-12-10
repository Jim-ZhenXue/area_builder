// Copyright 2020-2024, University of Colorado Boulder
/**
 * For a given repository, it returns the JSON object content that should go in phet.chipper.stringRepos for a
 * compilation-free simulation run.
 *
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
import fs from 'fs';
import getDependencies from './getDependencies.js';
export default /*#__PURE__*/ _async_to_generator(function*(repo) {
    return Object.keys((yield getDependencies(repo))).filter((stringRepo)=>stringRepo !== 'comment').filter((stringRepo)=>{
        return fs.existsSync(`../${stringRepo}/${stringRepo}-strings_en.json`);
    }).map((stringRepo)=>{
        return {
            repo: stringRepo,
            requirejsNamespace: JSON.parse(fs.readFileSync(`../${stringRepo}/package.json`, 'utf-8')).phet.requirejsNamespace
        };
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L2dldFN0cmluZ1JlcG9zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEZvciBhIGdpdmVuIHJlcG9zaXRvcnksIGl0IHJldHVybnMgdGhlIEpTT04gb2JqZWN0IGNvbnRlbnQgdGhhdCBzaG91bGQgZ28gaW4gcGhldC5jaGlwcGVyLnN0cmluZ1JlcG9zIGZvciBhXG4gKiBjb21waWxhdGlvbi1mcmVlIHNpbXVsYXRpb24gcnVuLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgZ2V0RGVwZW5kZW5jaWVzIGZyb20gJy4vZ2V0RGVwZW5kZW5jaWVzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKCByZXBvOiBzdHJpbmcgKTogUHJvbWlzZTxJbnRlbnRpb25hbEFueT4gPT4ge1xuICByZXR1cm4gT2JqZWN0LmtleXMoIGF3YWl0IGdldERlcGVuZGVuY2llcyggcmVwbyApICkuZmlsdGVyKCBzdHJpbmdSZXBvID0+IHN0cmluZ1JlcG8gIT09ICdjb21tZW50JyApLmZpbHRlciggc3RyaW5nUmVwbyA9PiB7XG4gICAgcmV0dXJuIGZzLmV4aXN0c1N5bmMoIGAuLi8ke3N0cmluZ1JlcG99LyR7c3RyaW5nUmVwb30tc3RyaW5nc19lbi5qc29uYCApO1xuICB9ICkubWFwKCBzdHJpbmdSZXBvID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVwbzogc3RyaW5nUmVwbyxcbiAgICAgIHJlcXVpcmVqc05hbWVzcGFjZTogSlNPTi5wYXJzZSggZnMucmVhZEZpbGVTeW5jKCBgLi4vJHtzdHJpbmdSZXBvfS9wYWNrYWdlLmpzb25gLCAndXRmLTgnICkgKS5waGV0LnJlcXVpcmVqc05hbWVzcGFjZVxuICAgIH07XG4gIH0gKTtcbn07Il0sIm5hbWVzIjpbImZzIiwiZ2V0RGVwZW5kZW5jaWVzIiwicmVwbyIsIk9iamVjdCIsImtleXMiLCJmaWx0ZXIiLCJzdHJpbmdSZXBvIiwiZXhpc3RzU3luYyIsIm1hcCIsInJlcXVpcmVqc05hbWVzcGFjZSIsIkpTT04iLCJwYXJzZSIsInJlYWRGaWxlU3luYyIsInBoZXQiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxPQUFPQSxRQUFRLEtBQUs7QUFFcEIsT0FBT0MscUJBQXFCLHVCQUF1QjtBQUVuRCxpREFBZSxVQUFRQztJQUNyQixPQUFPQyxPQUFPQyxJQUFJLENBQUUsQ0FBQSxNQUFNSCxnQkFBaUJDLEtBQUssR0FBSUcsTUFBTSxDQUFFQyxDQUFBQSxhQUFjQSxlQUFlLFdBQVlELE1BQU0sQ0FBRUMsQ0FBQUE7UUFDM0csT0FBT04sR0FBR08sVUFBVSxDQUFFLENBQUMsR0FBRyxFQUFFRCxXQUFXLENBQUMsRUFBRUEsV0FBVyxnQkFBZ0IsQ0FBQztJQUN4RSxHQUFJRSxHQUFHLENBQUVGLENBQUFBO1FBQ1AsT0FBTztZQUNMSixNQUFNSTtZQUNORyxvQkFBb0JDLEtBQUtDLEtBQUssQ0FBRVgsR0FBR1ksWUFBWSxDQUFFLENBQUMsR0FBRyxFQUFFTixXQUFXLGFBQWEsQ0FBQyxFQUFFLFVBQVlPLElBQUksQ0FBQ0osa0JBQWtCO1FBQ3ZIO0lBQ0Y7QUFDRixHQUFFIn0=