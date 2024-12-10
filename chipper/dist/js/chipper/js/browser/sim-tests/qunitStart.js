// Copyright 2020-2024, University of Colorado Boulder
/**
 * Start Qunit while supporting PhET-iO brand
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import Tandem from '../../../../tandem/js/Tandem.js';
const qunitStart = ()=>{
    const start = ()=>{
        // Uncomment for a debugger whenever a test fails
        if (_.hasIn(window, 'phet.chipper.queryParameters') && phet.chipper.queryParameters.debugger) {
            QUnit.log((context)=>{
                if (!context.result) {
                    debugger;
                }
            }); // eslint-disable-line no-debugger
        }
        if (Tandem.PHET_IO_ENABLED) {
            import(/* webpackMode: "eager" */ '../../../../phet-io/js/phetioEngine.js').then(()=>{
                // no API validation in unit tests
                phet.tandem.phetioAPIValidation.enabled = false;
                phet.phetio.phetioEngine.flushPhetioObjectBuffer();
                QUnit.start();
            });
        } else {
            QUnit.start();
        }
    };
    // When running in the puppeteer harness, we need the opportunity to wire up listeners before QUnit begins.
    if (QueryStringMachine.containsKey('qunitHooks')) {
        window.qunitLaunchAfterHooks = start;
    } else {
        start();
    }
};
export default qunitStart;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2Jyb3dzZXIvc2ltLXRlc3RzL3F1bml0U3RhcnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogU3RhcnQgUXVuaXQgd2hpbGUgc3VwcG9ydGluZyBQaEVULWlPIGJyYW5kXG4gKlxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5cbmNvbnN0IHF1bml0U3RhcnQgPSAoKSA9PiB7XG5cbiAgY29uc3Qgc3RhcnQgPSAoKSA9PiB7XG5cbiAgICAvLyBVbmNvbW1lbnQgZm9yIGEgZGVidWdnZXIgd2hlbmV2ZXIgYSB0ZXN0IGZhaWxzXG4gICAgaWYgKCBfLmhhc0luKCB3aW5kb3csICdwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzJyApICYmIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuZGVidWdnZXIgKSB7XG4gICAgICBRVW5pdC5sb2coIGNvbnRleHQgPT4geyBpZiAoICFjb250ZXh0LnJlc3VsdCApIHsgZGVidWdnZXI7IH19ICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tZGVidWdnZXJcbiAgICB9XG5cbiAgICBpZiAoIFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgKSB7XG4gICAgICBpbXBvcnQoIC8qIHdlYnBhY2tNb2RlOiBcImVhZ2VyXCIgKi8gJy4uLy4uLy4uLy4uL3BoZXQtaW8vanMvcGhldGlvRW5naW5lLmpzJyApLnRoZW4oICgpID0+IHtcblxuICAgICAgICAvLyBubyBBUEkgdmFsaWRhdGlvbiBpbiB1bml0IHRlc3RzXG4gICAgICAgIHBoZXQudGFuZGVtLnBoZXRpb0FQSVZhbGlkYXRpb24uZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICBwaGV0LnBoZXRpby5waGV0aW9FbmdpbmUuZmx1c2hQaGV0aW9PYmplY3RCdWZmZXIoKTtcbiAgICAgICAgUVVuaXQuc3RhcnQoKTtcbiAgICAgIH0gKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBRVW5pdC5zdGFydCgpO1xuICAgIH1cbiAgfTtcblxuICAvLyBXaGVuIHJ1bm5pbmcgaW4gdGhlIHB1cHBldGVlciBoYXJuZXNzLCB3ZSBuZWVkIHRoZSBvcHBvcnR1bml0eSB0byB3aXJlIHVwIGxpc3RlbmVycyBiZWZvcmUgUVVuaXQgYmVnaW5zLlxuICBpZiAoIFF1ZXJ5U3RyaW5nTWFjaGluZS5jb250YWluc0tleSggJ3F1bml0SG9va3MnICkgKSB7XG4gICAgd2luZG93LnF1bml0TGF1bmNoQWZ0ZXJIb29rcyA9IHN0YXJ0O1xuICB9XG4gIGVsc2Uge1xuICAgIHN0YXJ0KCk7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHF1bml0U3RhcnQ7Il0sIm5hbWVzIjpbIlRhbmRlbSIsInF1bml0U3RhcnQiLCJzdGFydCIsIl8iLCJoYXNJbiIsIndpbmRvdyIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwiZGVidWdnZXIiLCJRVW5pdCIsImxvZyIsImNvbnRleHQiLCJyZXN1bHQiLCJQSEVUX0lPX0VOQUJMRUQiLCJ0aGVuIiwidGFuZGVtIiwicGhldGlvQVBJVmFsaWRhdGlvbiIsImVuYWJsZWQiLCJwaGV0aW8iLCJwaGV0aW9FbmdpbmUiLCJmbHVzaFBoZXRpb09iamVjdEJ1ZmZlciIsIlF1ZXJ5U3RyaW5nTWFjaGluZSIsImNvbnRhaW5zS2V5IiwicXVuaXRMYXVuY2hBZnRlckhvb2tzIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLFlBQVksa0NBQWtDO0FBRXJELE1BQU1DLGFBQWE7SUFFakIsTUFBTUMsUUFBUTtRQUVaLGlEQUFpRDtRQUNqRCxJQUFLQyxFQUFFQyxLQUFLLENBQUVDLFFBQVEsbUNBQW9DQyxLQUFLQyxPQUFPLENBQUNDLGVBQWUsQ0FBQ0MsUUFBUSxFQUFHO1lBQ2hHQyxNQUFNQyxHQUFHLENBQUVDLENBQUFBO2dCQUFhLElBQUssQ0FBQ0EsUUFBUUMsTUFBTSxFQUFHO29CQUFFLFFBQVM7Z0JBQUM7WUFBQyxJQUFLLGtDQUFrQztRQUNyRztRQUVBLElBQUtiLE9BQU9jLGVBQWUsRUFBRztZQUM1QixNQUFNLENBQUUsd0JBQXdCLEdBQUcsMENBQTJDQyxJQUFJLENBQUU7Z0JBRWxGLGtDQUFrQztnQkFDbENULEtBQUtVLE1BQU0sQ0FBQ0MsbUJBQW1CLENBQUNDLE9BQU8sR0FBRztnQkFDMUNaLEtBQUthLE1BQU0sQ0FBQ0MsWUFBWSxDQUFDQyx1QkFBdUI7Z0JBQ2hEWCxNQUFNUixLQUFLO1lBQ2I7UUFDRixPQUNLO1lBQ0hRLE1BQU1SLEtBQUs7UUFDYjtJQUNGO0lBRUEsMkdBQTJHO0lBQzNHLElBQUtvQixtQkFBbUJDLFdBQVcsQ0FBRSxlQUFpQjtRQUNwRGxCLE9BQU9tQixxQkFBcUIsR0FBR3RCO0lBQ2pDLE9BQ0s7UUFDSEE7SUFDRjtBQUNGO0FBRUEsZUFBZUQsV0FBVyJ9