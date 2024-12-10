// Copyright 2024, University of Colorado Boulder
/**
 * Type checks *.ts files. Automatically uses "-b" as appropriate for project references.
 *
 * Usage:
 * grunt type-check
 *
 * Options (can be combined):
 * --all: check all repos
 * --clean: clean before checking (will still do the check, unlike running tsc directly)
 * --absolute: Updates the output formatting to integrate well with Webstorm as an "External Tool"
 * --pretty=false: Use pretty formatting (default is true)
 * --verbose: Provide extra output from tsc
 * --silent: Prevent all output, even if verbose or absolute flags are set
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
import _ from 'lodash';
import typeCheck from '../typeCheck.js';
import getOption, { isOptionKeyProvided } from './util/getOption.js';
import getRepo from './util/getRepo.js';
const checkCLIOptions = {};
if (isOptionKeyProvided('all')) {
    checkCLIOptions.all = true;
}
if (isOptionKeyProvided('clean')) {
    checkCLIOptions.clean = true;
}
if (isOptionKeyProvided('absolute')) {
    checkCLIOptions.absolute = true;
}
if (isOptionKeyProvided('pretty')) {
    checkCLIOptions.pretty = getOption('pretty');
}
if (isOptionKeyProvided('verbose')) {
    checkCLIOptions.verbose = true;
}
if (isOptionKeyProvided('silent')) {
    checkCLIOptions.silent = true;
}
const defaultOptions = {
    repo: getRepo()
};
export const typeCheckPromise = _async_to_generator(function*() {
    return typeCheck(_.assignIn(defaultOptions, checkCLIOptions));
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy90eXBlLWNoZWNrLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbi8qKlxuICogVHlwZSBjaGVja3MgKi50cyBmaWxlcy4gQXV0b21hdGljYWxseSB1c2VzIFwiLWJcIiBhcyBhcHByb3ByaWF0ZSBmb3IgcHJvamVjdCByZWZlcmVuY2VzLlxuICpcbiAqIFVzYWdlOlxuICogZ3J1bnQgdHlwZS1jaGVja1xuICpcbiAqIE9wdGlvbnMgKGNhbiBiZSBjb21iaW5lZCk6XG4gKiAtLWFsbDogY2hlY2sgYWxsIHJlcG9zXG4gKiAtLWNsZWFuOiBjbGVhbiBiZWZvcmUgY2hlY2tpbmcgKHdpbGwgc3RpbGwgZG8gdGhlIGNoZWNrLCB1bmxpa2UgcnVubmluZyB0c2MgZGlyZWN0bHkpXG4gKiAtLWFic29sdXRlOiBVcGRhdGVzIHRoZSBvdXRwdXQgZm9ybWF0dGluZyB0byBpbnRlZ3JhdGUgd2VsbCB3aXRoIFdlYnN0b3JtIGFzIGFuIFwiRXh0ZXJuYWwgVG9vbFwiXG4gKiAtLXByZXR0eT1mYWxzZTogVXNlIHByZXR0eSBmb3JtYXR0aW5nIChkZWZhdWx0IGlzIHRydWUpXG4gKiAtLXZlcmJvc2U6IFByb3ZpZGUgZXh0cmEgb3V0cHV0IGZyb20gdHNjXG4gKiAtLXNpbGVudDogUHJldmVudCBhbGwgb3V0cHV0LCBldmVuIGlmIHZlcmJvc2Ugb3IgYWJzb2x1dGUgZmxhZ3MgYXJlIHNldFxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB0eXBlQ2hlY2ssIHsgQ2hlY2tPcHRpb25zIH0gZnJvbSAnLi4vdHlwZUNoZWNrLmpzJztcbmltcG9ydCBnZXRPcHRpb24sIHsgaXNPcHRpb25LZXlQcm92aWRlZCB9IGZyb20gJy4vdXRpbC9nZXRPcHRpb24uanMnO1xuaW1wb3J0IGdldFJlcG8gZnJvbSAnLi91dGlsL2dldFJlcG8uanMnO1xuXG5jb25zdCBjaGVja0NMSU9wdGlvbnM6IFBhcnRpYWw8Q2hlY2tPcHRpb25zPiA9IHt9O1xuXG5pZiAoIGlzT3B0aW9uS2V5UHJvdmlkZWQoICdhbGwnICkgKSB7XG4gIGNoZWNrQ0xJT3B0aW9ucy5hbGwgPSB0cnVlO1xufVxuaWYgKCBpc09wdGlvbktleVByb3ZpZGVkKCAnY2xlYW4nICkgKSB7XG4gIGNoZWNrQ0xJT3B0aW9ucy5jbGVhbiA9IHRydWU7XG59XG5pZiAoIGlzT3B0aW9uS2V5UHJvdmlkZWQoICdhYnNvbHV0ZScgKSApIHtcbiAgY2hlY2tDTElPcHRpb25zLmFic29sdXRlID0gdHJ1ZTtcbn1cbmlmICggaXNPcHRpb25LZXlQcm92aWRlZCggJ3ByZXR0eScgKSApIHtcbiAgY2hlY2tDTElPcHRpb25zLnByZXR0eSA9IGdldE9wdGlvbiggJ3ByZXR0eScgKTtcbn1cbmlmICggaXNPcHRpb25LZXlQcm92aWRlZCggJ3ZlcmJvc2UnICkgKSB7XG4gIGNoZWNrQ0xJT3B0aW9ucy52ZXJib3NlID0gdHJ1ZTtcbn1cbmlmICggaXNPcHRpb25LZXlQcm92aWRlZCggJ3NpbGVudCcgKSApIHtcbiAgY2hlY2tDTElPcHRpb25zLnNpbGVudCA9IHRydWU7XG59XG5cbmNvbnN0IGRlZmF1bHRPcHRpb25zID0ge1xuICByZXBvOiBnZXRSZXBvKClcbn07XG5leHBvcnQgY29uc3QgdHlwZUNoZWNrUHJvbWlzZSA9ICggYXN5bmMgKCkgPT4gdHlwZUNoZWNrKCBfLmFzc2lnbkluKCBkZWZhdWx0T3B0aW9ucywgY2hlY2tDTElPcHRpb25zICkgKSApKCk7Il0sIm5hbWVzIjpbIl8iLCJ0eXBlQ2hlY2siLCJnZXRPcHRpb24iLCJpc09wdGlvbktleVByb3ZpZGVkIiwiZ2V0UmVwbyIsImNoZWNrQ0xJT3B0aW9ucyIsImFsbCIsImNsZWFuIiwiYWJzb2x1dGUiLCJwcmV0dHkiLCJ2ZXJib3NlIiwic2lsZW50IiwiZGVmYXVsdE9wdGlvbnMiLCJyZXBvIiwidHlwZUNoZWNrUHJvbWlzZSIsImFzc2lnbkluIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFDakQ7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FnQkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsT0FBT0EsT0FBTyxTQUFTO0FBQ3ZCLE9BQU9DLGVBQWlDLGtCQUFrQjtBQUMxRCxPQUFPQyxhQUFhQyxtQkFBbUIsUUFBUSxzQkFBc0I7QUFDckUsT0FBT0MsYUFBYSxvQkFBb0I7QUFFeEMsTUFBTUMsa0JBQXlDLENBQUM7QUFFaEQsSUFBS0Ysb0JBQXFCLFFBQVU7SUFDbENFLGdCQUFnQkMsR0FBRyxHQUFHO0FBQ3hCO0FBQ0EsSUFBS0gsb0JBQXFCLFVBQVk7SUFDcENFLGdCQUFnQkUsS0FBSyxHQUFHO0FBQzFCO0FBQ0EsSUFBS0osb0JBQXFCLGFBQWU7SUFDdkNFLGdCQUFnQkcsUUFBUSxHQUFHO0FBQzdCO0FBQ0EsSUFBS0wsb0JBQXFCLFdBQWE7SUFDckNFLGdCQUFnQkksTUFBTSxHQUFHUCxVQUFXO0FBQ3RDO0FBQ0EsSUFBS0Msb0JBQXFCLFlBQWM7SUFDdENFLGdCQUFnQkssT0FBTyxHQUFHO0FBQzVCO0FBQ0EsSUFBS1Asb0JBQXFCLFdBQWE7SUFDckNFLGdCQUFnQk0sTUFBTSxHQUFHO0FBQzNCO0FBRUEsTUFBTUMsaUJBQWlCO0lBQ3JCQyxNQUFNVDtBQUNSO0FBQ0EsT0FBTyxNQUFNVSxtQkFBbUIsQUFBRSxvQkFBQTtJQUFZYixPQUFBQSxVQUFXRCxFQUFFZSxRQUFRLENBQUVILGdCQUFnQlA7S0FBd0IifQ==