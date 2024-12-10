// Copyright 2017-2024, University of Colorado Boulder
// eslint-disable-next-line phet/bad-typescript-text
// @ts-nocheck
/**
 * Uglifies the given JS code (with phet-relevant options)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import _ from 'lodash';
import transpileForBuild from './transpileForBuild.js';
const terser = require('terser');
const MINIFY_DEFAULTS = {
    minify: true,
    // Only enabled if minify is true
    babelTranspile: true,
    uglify: true,
    // Only enabled if uglify is true
    mangle: true,
    stripAssertions: true,
    stripLogging: true,
    beautify: false
};
/**
 * Minifies the given JS code (with phet-relevant options). Note that often the parameters conflict with each other. For
 * instance, during one phase of a dot standalone build, stripAssertions is true but babelTranspile is false.
 *
 * @param js
 * @param options
 */ const minify = function(js, options) {
    options = _.assignIn({}, MINIFY_DEFAULTS, options);
    // Promote to top level variables
    const { minify, babelTranspile, uglify, mangle, stripAssertions, stripLogging, beautify } = options;
    if (!minify) {
        return js;
    }
    // Do transpilation before uglifying.
    if (babelTranspile) {
        js = transpileForBuild(js, stripAssertions);
    }
    const uglifyOptions = {
        mangle: mangle ? {
            safari10: true // works around a safari 10 bug. currently a supported platform
        } : false,
        compress: {
            // defaults to remove dead code (dead_code option no longer required)
            dead_code: true,
            // To define globals, use global_defs inside compress options, see https://github.com/jrburke/r.js/issues/377
            global_defs: {}
        },
        // output options documented at https://github.com/mishoo/UglifyJS2#beautifier-options
        output: {
            inline_script: true,
            beautify: beautify
        }
    };
    // global assertions (PhET-specific)
    if (stripAssertions) {
        uglifyOptions.compress.global_defs.assert = false;
        uglifyOptions.compress.global_defs.assertSlow = false;
    }
    // scenery logging (PhET-specific)
    if (stripLogging) {
        uglifyOptions.compress.global_defs.sceneryLog = false;
    }
    if (uglify) {
        const result = terser.minify(js, uglifyOptions);
        if (result.error) {
            console.log(result.error);
            throw new Error(result.error);
        } else {
            // workaround for Uglify2's Unicode unescaping. see https://github.com/phetsims/chipper/issues/70
            return result.code.replace('\x0B', '\\x0B');
        }
    } else {
        return js;
    }
};
minify.MINIFY_DEFAULTS = MINIFY_DEFAULTS;
/**
 * Returns a minified version of the code (with optional mangling).
 */ export default minify;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L21pbmlmeS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHBoZXQvYmFkLXR5cGVzY3JpcHQtdGV4dFxuLy8gQHRzLW5vY2hlY2tcblxuLyoqXG4gKiBVZ2xpZmllcyB0aGUgZ2l2ZW4gSlMgY29kZSAod2l0aCBwaGV0LXJlbGV2YW50IG9wdGlvbnMpXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgdHJhbnNwaWxlRm9yQnVpbGQgZnJvbSAnLi90cmFuc3BpbGVGb3JCdWlsZC5qcyc7XG5cbmNvbnN0IHRlcnNlciA9IHJlcXVpcmUoICd0ZXJzZXInICk7XG5cbmV4cG9ydCB0eXBlIE1pbmlmeU9wdGlvbnMgPSB7XG4gIG1pbmlmeT86IGJvb2xlYW47XG5cbiAgLy8gT25seSBlbmFibGVkIGlmIG1pbmlmeSBpcyB0cnVlXG4gIGJhYmVsVHJhbnNwaWxlPzogYm9vbGVhbjtcbiAgdWdsaWZ5PzogYm9vbGVhbjtcblxuICAvLyBPbmx5IGVuYWJsZWQgaWYgdWdsaWZ5IGlzIHRydWVcbiAgbWFuZ2xlPzogYm9vbGVhbjtcbiAgc3RyaXBBc3NlcnRpb25zPzogYm9vbGVhbjtcbiAgc3RyaXBMb2dnaW5nPzogYm9vbGVhbjtcbiAgYmVhdXRpZnk/OiBib29sZWFuO1xufTtcblxuY29uc3QgTUlOSUZZX0RFRkFVTFRTOiBNaW5pZnlPcHRpb25zID0ge1xuICBtaW5pZnk6IHRydWUsXG5cbiAgLy8gT25seSBlbmFibGVkIGlmIG1pbmlmeSBpcyB0cnVlXG4gIGJhYmVsVHJhbnNwaWxlOiB0cnVlLFxuICB1Z2xpZnk6IHRydWUsXG5cbiAgLy8gT25seSBlbmFibGVkIGlmIHVnbGlmeSBpcyB0cnVlXG4gIG1hbmdsZTogdHJ1ZSxcbiAgc3RyaXBBc3NlcnRpb25zOiB0cnVlLFxuICBzdHJpcExvZ2dpbmc6IHRydWUsXG4gIGJlYXV0aWZ5OiBmYWxzZVxufTtcblxuLyoqXG4gKiBNaW5pZmllcyB0aGUgZ2l2ZW4gSlMgY29kZSAod2l0aCBwaGV0LXJlbGV2YW50IG9wdGlvbnMpLiBOb3RlIHRoYXQgb2Z0ZW4gdGhlIHBhcmFtZXRlcnMgY29uZmxpY3Qgd2l0aCBlYWNoIG90aGVyLiBGb3JcbiAqIGluc3RhbmNlLCBkdXJpbmcgb25lIHBoYXNlIG9mIGEgZG90IHN0YW5kYWxvbmUgYnVpbGQsIHN0cmlwQXNzZXJ0aW9ucyBpcyB0cnVlIGJ1dCBiYWJlbFRyYW5zcGlsZSBpcyBmYWxzZS5cbiAqXG4gKiBAcGFyYW0ganNcbiAqIEBwYXJhbSBvcHRpb25zXG4gKi9cbmNvbnN0IG1pbmlmeSA9IGZ1bmN0aW9uKCBqczogc3RyaW5nLCBvcHRpb25zPzogTWluaWZ5T3B0aW9ucyApOiBzdHJpbmcge1xuICBvcHRpb25zID0gXy5hc3NpZ25Jbigge30sIE1JTklGWV9ERUZBVUxUUywgb3B0aW9ucyApO1xuXG4gIC8vIFByb21vdGUgdG8gdG9wIGxldmVsIHZhcmlhYmxlc1xuICBjb25zdCB7IG1pbmlmeSwgYmFiZWxUcmFuc3BpbGUsIHVnbGlmeSwgbWFuZ2xlLCBzdHJpcEFzc2VydGlvbnMsIHN0cmlwTG9nZ2luZywgYmVhdXRpZnkgfSA9IG9wdGlvbnM7XG5cbiAgaWYgKCAhbWluaWZ5ICkge1xuICAgIHJldHVybiBqcztcbiAgfVxuXG4gIC8vIERvIHRyYW5zcGlsYXRpb24gYmVmb3JlIHVnbGlmeWluZy5cbiAgaWYgKCBiYWJlbFRyYW5zcGlsZSApIHtcbiAgICBqcyA9IHRyYW5zcGlsZUZvckJ1aWxkKCBqcywgc3RyaXBBc3NlcnRpb25zICk7XG4gIH1cblxuICBjb25zdCB1Z2xpZnlPcHRpb25zID0ge1xuICAgIG1hbmdsZTogbWFuZ2xlID8ge1xuICAgICAgc2FmYXJpMTA6IHRydWUgLy8gd29ya3MgYXJvdW5kIGEgc2FmYXJpIDEwIGJ1Zy4gY3VycmVudGx5IGEgc3VwcG9ydGVkIHBsYXRmb3JtXG4gICAgfSA6IGZhbHNlLFxuXG4gICAgY29tcHJlc3M6IHtcbiAgICAgIC8vIGRlZmF1bHRzIHRvIHJlbW92ZSBkZWFkIGNvZGUgKGRlYWRfY29kZSBvcHRpb24gbm8gbG9uZ2VyIHJlcXVpcmVkKVxuICAgICAgZGVhZF9jb2RlOiB0cnVlLCAvLyByZW1vdmUgdW5yZWFjaGFibGUgY29kZVxuXG4gICAgICAvLyBUbyBkZWZpbmUgZ2xvYmFscywgdXNlIGdsb2JhbF9kZWZzIGluc2lkZSBjb21wcmVzcyBvcHRpb25zLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2pyYnVya2Uvci5qcy9pc3N1ZXMvMzc3XG4gICAgICBnbG9iYWxfZGVmczoge31cbiAgICB9LFxuXG4gICAgLy8gb3V0cHV0IG9wdGlvbnMgZG9jdW1lbnRlZCBhdCBodHRwczovL2dpdGh1Yi5jb20vbWlzaG9vL1VnbGlmeUpTMiNiZWF1dGlmaWVyLW9wdGlvbnNcbiAgICBvdXRwdXQ6IHtcbiAgICAgIGlubGluZV9zY3JpcHQ6IHRydWUsIC8vIGVzY2FwZSA8L3NjcmlwdFxuICAgICAgYmVhdXRpZnk6IGJlYXV0aWZ5XG4gICAgfVxuICB9O1xuXG4gIC8vIGdsb2JhbCBhc3NlcnRpb25zIChQaEVULXNwZWNpZmljKVxuICBpZiAoIHN0cmlwQXNzZXJ0aW9ucyApIHtcbiAgICB1Z2xpZnlPcHRpb25zLmNvbXByZXNzLmdsb2JhbF9kZWZzLmFzc2VydCA9IGZhbHNlO1xuICAgIHVnbGlmeU9wdGlvbnMuY29tcHJlc3MuZ2xvYmFsX2RlZnMuYXNzZXJ0U2xvdyA9IGZhbHNlO1xuICB9XG5cbiAgLy8gc2NlbmVyeSBsb2dnaW5nIChQaEVULXNwZWNpZmljKVxuICBpZiAoIHN0cmlwTG9nZ2luZyApIHtcbiAgICB1Z2xpZnlPcHRpb25zLmNvbXByZXNzLmdsb2JhbF9kZWZzLnNjZW5lcnlMb2cgPSBmYWxzZTtcbiAgfVxuXG4gIGlmICggdWdsaWZ5ICkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRlcnNlci5taW5pZnkoIGpzLCB1Z2xpZnlPcHRpb25zICk7XG5cbiAgICBpZiAoIHJlc3VsdC5lcnJvciApIHtcbiAgICAgIGNvbnNvbGUubG9nKCByZXN1bHQuZXJyb3IgKTtcbiAgICAgIHRocm93IG5ldyBFcnJvciggcmVzdWx0LmVycm9yICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gd29ya2Fyb3VuZCBmb3IgVWdsaWZ5MidzIFVuaWNvZGUgdW5lc2NhcGluZy4gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy83MFxuICAgICAgcmV0dXJuIHJlc3VsdC5jb2RlLnJlcGxhY2UoICdcXHgwQicsICdcXFxceDBCJyApO1xuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICByZXR1cm4ganM7XG4gIH1cbn07XG5cbm1pbmlmeS5NSU5JRllfREVGQVVMVFMgPSBNSU5JRllfREVGQVVMVFM7XG5cbi8qKlxuICogUmV0dXJucyBhIG1pbmlmaWVkIHZlcnNpb24gb2YgdGhlIGNvZGUgKHdpdGggb3B0aW9uYWwgbWFuZ2xpbmcpLlxuICovXG5leHBvcnQgZGVmYXVsdCBtaW5pZnk7Il0sIm5hbWVzIjpbIl8iLCJ0cmFuc3BpbGVGb3JCdWlsZCIsInRlcnNlciIsInJlcXVpcmUiLCJNSU5JRllfREVGQVVMVFMiLCJtaW5pZnkiLCJiYWJlbFRyYW5zcGlsZSIsInVnbGlmeSIsIm1hbmdsZSIsInN0cmlwQXNzZXJ0aW9ucyIsInN0cmlwTG9nZ2luZyIsImJlYXV0aWZ5IiwianMiLCJvcHRpb25zIiwiYXNzaWduSW4iLCJ1Z2xpZnlPcHRpb25zIiwic2FmYXJpMTAiLCJjb21wcmVzcyIsImRlYWRfY29kZSIsImdsb2JhbF9kZWZzIiwib3V0cHV0IiwiaW5saW5lX3NjcmlwdCIsImFzc2VydCIsImFzc2VydFNsb3ciLCJzY2VuZXJ5TG9nIiwicmVzdWx0IiwiZXJyb3IiLCJjb25zb2xlIiwibG9nIiwiRXJyb3IiLCJjb2RlIiwicmVwbGFjZSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXRELG9EQUFvRDtBQUNwRCxjQUFjO0FBRWQ7Ozs7Q0FJQyxHQUVELE9BQU9BLE9BQU8sU0FBUztBQUN2QixPQUFPQyx1QkFBdUIseUJBQXlCO0FBRXZELE1BQU1DLFNBQVNDLFFBQVM7QUFnQnhCLE1BQU1DLGtCQUFpQztJQUNyQ0MsUUFBUTtJQUVSLGlDQUFpQztJQUNqQ0MsZ0JBQWdCO0lBQ2hCQyxRQUFRO0lBRVIsaUNBQWlDO0lBQ2pDQyxRQUFRO0lBQ1JDLGlCQUFpQjtJQUNqQkMsY0FBYztJQUNkQyxVQUFVO0FBQ1o7QUFFQTs7Ozs7O0NBTUMsR0FDRCxNQUFNTixTQUFTLFNBQVVPLEVBQVUsRUFBRUMsT0FBdUI7SUFDMURBLFVBQVViLEVBQUVjLFFBQVEsQ0FBRSxDQUFDLEdBQUdWLGlCQUFpQlM7SUFFM0MsaUNBQWlDO0lBQ2pDLE1BQU0sRUFBRVIsTUFBTSxFQUFFQyxjQUFjLEVBQUVDLE1BQU0sRUFBRUMsTUFBTSxFQUFFQyxlQUFlLEVBQUVDLFlBQVksRUFBRUMsUUFBUSxFQUFFLEdBQUdFO0lBRTVGLElBQUssQ0FBQ1IsUUFBUztRQUNiLE9BQU9PO0lBQ1Q7SUFFQSxxQ0FBcUM7SUFDckMsSUFBS04sZ0JBQWlCO1FBQ3BCTSxLQUFLWCxrQkFBbUJXLElBQUlIO0lBQzlCO0lBRUEsTUFBTU0sZ0JBQWdCO1FBQ3BCUCxRQUFRQSxTQUFTO1lBQ2ZRLFVBQVUsS0FBSywrREFBK0Q7UUFDaEYsSUFBSTtRQUVKQyxVQUFVO1lBQ1IscUVBQXFFO1lBQ3JFQyxXQUFXO1lBRVgsNkdBQTZHO1lBQzdHQyxhQUFhLENBQUM7UUFDaEI7UUFFQSxzRkFBc0Y7UUFDdEZDLFFBQVE7WUFDTkMsZUFBZTtZQUNmVixVQUFVQTtRQUNaO0lBQ0Y7SUFFQSxvQ0FBb0M7SUFDcEMsSUFBS0YsaUJBQWtCO1FBQ3JCTSxjQUFjRSxRQUFRLENBQUNFLFdBQVcsQ0FBQ0csTUFBTSxHQUFHO1FBQzVDUCxjQUFjRSxRQUFRLENBQUNFLFdBQVcsQ0FBQ0ksVUFBVSxHQUFHO0lBQ2xEO0lBRUEsa0NBQWtDO0lBQ2xDLElBQUtiLGNBQWU7UUFDbEJLLGNBQWNFLFFBQVEsQ0FBQ0UsV0FBVyxDQUFDSyxVQUFVLEdBQUc7SUFDbEQ7SUFFQSxJQUFLakIsUUFBUztRQUNaLE1BQU1rQixTQUFTdkIsT0FBT0csTUFBTSxDQUFFTyxJQUFJRztRQUVsQyxJQUFLVSxPQUFPQyxLQUFLLEVBQUc7WUFDbEJDLFFBQVFDLEdBQUcsQ0FBRUgsT0FBT0MsS0FBSztZQUN6QixNQUFNLElBQUlHLE1BQU9KLE9BQU9DLEtBQUs7UUFDL0IsT0FDSztZQUNILGlHQUFpRztZQUNqRyxPQUFPRCxPQUFPSyxJQUFJLENBQUNDLE9BQU8sQ0FBRSxRQUFRO1FBQ3RDO0lBQ0YsT0FDSztRQUNILE9BQU9uQjtJQUNUO0FBQ0Y7QUFFQVAsT0FBT0QsZUFBZSxHQUFHQTtBQUV6Qjs7Q0FFQyxHQUNELGVBQWVDLE9BQU8ifQ==