// Copyright 2017-2024, University of Colorado Boulder
/**
 * Handles transpilation of code using Babel
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ // modules
const babel = require('@babel/core'); // eslint-disable-line phet/require-statement-match
const babelPluginRemoveAffirm = require('./babel-plugin-remove-affirm.js');
/**
 * Transpile some code to be compatible with the browsers specified below
 * @param jsInput
 * @param forIE=false - whether the jsInput should be transpiled for Internet Explorer
 */ export default function transpileForBuild(jsInput, stripAffirmations, forIE = false) {
    // This list specifies the target browsers for Babel. Its format is described at https://browsersl.ist.
    // Note that this is related to System Requirements advertised on the PhET website, so should be modified with care.
    // Never remove advertised platforms from this list without a broader discussion. And note that PhET will sometimes
    // provide unofficial support for older platforms, so version numbers may be lower than what is advertised on the
    // PhET website. For more history, see https://github.com/phetsims/chipper/issues/1323.
    const browsers = [
        'defaults',
        'safari >= 13',
        'iOS >= 13'
    ];
    if (forIE) {
        browsers.push('IE 11');
    }
    // See options available at https://babeljs.io/docs/usage/api/
    return babel.transform(jsInput, {
        // Avoids a warning that this gets disabled for >500kb of source. true/false doesn't affect the later minified size, and
        // the 'true' option was faster by a hair.
        compact: true,
        // Use chipper's copy of babel-preset-env, so we don't have to have 30MB extra per sim checked out.
        presets: [
            [
                '../chipper/node_modules/@babel/preset-env',
                {
                    // Parse as "script" type, so "this" will refer to "window" instead of being transpiled to `void 0` aka undefined
                    // see https://github.com/phetsims/chipper/issues/723#issuecomment-443966550
                    modules: false,
                    targets: {
                        browsers: browsers
                    }
                }
            ]
        ],
        plugins: stripAffirmations ? [
            // Plugin to remove calls to 'affirm'
            babelPluginRemoveAffirm
        ] : []
    }).code;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3RyYW5zcGlsZUZvckJ1aWxkLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEhhbmRsZXMgdHJhbnNwaWxhdGlvbiBvZiBjb2RlIHVzaW5nIEJhYmVsXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5cbi8vIG1vZHVsZXNcbmNvbnN0IGJhYmVsID0gcmVxdWlyZSggJ0BiYWJlbC9jb3JlJyApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvcmVxdWlyZS1zdGF0ZW1lbnQtbWF0Y2hcblxuY29uc3QgYmFiZWxQbHVnaW5SZW1vdmVBZmZpcm0gPSByZXF1aXJlKCAnLi9iYWJlbC1wbHVnaW4tcmVtb3ZlLWFmZmlybS5qcycgKTtcblxuLyoqXG4gKiBUcmFuc3BpbGUgc29tZSBjb2RlIHRvIGJlIGNvbXBhdGlibGUgd2l0aCB0aGUgYnJvd3NlcnMgc3BlY2lmaWVkIGJlbG93XG4gKiBAcGFyYW0ganNJbnB1dFxuICogQHBhcmFtIGZvcklFPWZhbHNlIC0gd2hldGhlciB0aGUganNJbnB1dCBzaG91bGQgYmUgdHJhbnNwaWxlZCBmb3IgSW50ZXJuZXQgRXhwbG9yZXJcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJhbnNwaWxlRm9yQnVpbGQoIGpzSW5wdXQ6IHN0cmluZywgc3RyaXBBZmZpcm1hdGlvbnM6IGJvb2xlYW4sIGZvcklFID0gZmFsc2UgKTogc3RyaW5nIHtcblxuICAvLyBUaGlzIGxpc3Qgc3BlY2lmaWVzIHRoZSB0YXJnZXQgYnJvd3NlcnMgZm9yIEJhYmVsLiBJdHMgZm9ybWF0IGlzIGRlc2NyaWJlZCBhdCBodHRwczovL2Jyb3dzZXJzbC5pc3QuXG4gIC8vIE5vdGUgdGhhdCB0aGlzIGlzIHJlbGF0ZWQgdG8gU3lzdGVtIFJlcXVpcmVtZW50cyBhZHZlcnRpc2VkIG9uIHRoZSBQaEVUIHdlYnNpdGUsIHNvIHNob3VsZCBiZSBtb2RpZmllZCB3aXRoIGNhcmUuXG4gIC8vIE5ldmVyIHJlbW92ZSBhZHZlcnRpc2VkIHBsYXRmb3JtcyBmcm9tIHRoaXMgbGlzdCB3aXRob3V0IGEgYnJvYWRlciBkaXNjdXNzaW9uLiBBbmQgbm90ZSB0aGF0IFBoRVQgd2lsbCBzb21ldGltZXNcbiAgLy8gcHJvdmlkZSB1bm9mZmljaWFsIHN1cHBvcnQgZm9yIG9sZGVyIHBsYXRmb3Jtcywgc28gdmVyc2lvbiBudW1iZXJzIG1heSBiZSBsb3dlciB0aGFuIHdoYXQgaXMgYWR2ZXJ0aXNlZCBvbiB0aGVcbiAgLy8gUGhFVCB3ZWJzaXRlLiBGb3IgbW9yZSBoaXN0b3J5LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzEzMjMuXG4gIGNvbnN0IGJyb3dzZXJzID0gW1xuICAgICdkZWZhdWx0cycsXG4gICAgJ3NhZmFyaSA+PSAxMycsXG4gICAgJ2lPUyA+PSAxMydcbiAgXTtcbiAgaWYgKCBmb3JJRSApIHtcbiAgICBicm93c2Vycy5wdXNoKCAnSUUgMTEnICk7XG4gIH1cblxuICAvLyBTZWUgb3B0aW9ucyBhdmFpbGFibGUgYXQgaHR0cHM6Ly9iYWJlbGpzLmlvL2RvY3MvdXNhZ2UvYXBpL1xuICByZXR1cm4gYmFiZWwudHJhbnNmb3JtKCBqc0lucHV0LCB7XG5cbiAgICAvLyBBdm9pZHMgYSB3YXJuaW5nIHRoYXQgdGhpcyBnZXRzIGRpc2FibGVkIGZvciA+NTAwa2Igb2Ygc291cmNlLiB0cnVlL2ZhbHNlIGRvZXNuJ3QgYWZmZWN0IHRoZSBsYXRlciBtaW5pZmllZCBzaXplLCBhbmRcbiAgICAvLyB0aGUgJ3RydWUnIG9wdGlvbiB3YXMgZmFzdGVyIGJ5IGEgaGFpci5cbiAgICBjb21wYWN0OiB0cnVlLFxuXG4gICAgLy8gVXNlIGNoaXBwZXIncyBjb3B5IG9mIGJhYmVsLXByZXNldC1lbnYsIHNvIHdlIGRvbid0IGhhdmUgdG8gaGF2ZSAzME1CIGV4dHJhIHBlciBzaW0gY2hlY2tlZCBvdXQuXG4gICAgcHJlc2V0czogWyBbICcuLi9jaGlwcGVyL25vZGVfbW9kdWxlcy9AYmFiZWwvcHJlc2V0LWVudicsIHtcblxuICAgICAgLy8gUGFyc2UgYXMgXCJzY3JpcHRcIiB0eXBlLCBzbyBcInRoaXNcIiB3aWxsIHJlZmVyIHRvIFwid2luZG93XCIgaW5zdGVhZCBvZiBiZWluZyB0cmFuc3BpbGVkIHRvIGB2b2lkIDBgIGFrYSB1bmRlZmluZWRcbiAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvNzIzI2lzc3VlY29tbWVudC00NDM5NjY1NTBcbiAgICAgIG1vZHVsZXM6IGZhbHNlLFxuICAgICAgdGFyZ2V0czoge1xuICAgICAgICBicm93c2VyczogYnJvd3NlcnNcbiAgICAgIH1cbiAgICB9IF0gXSxcblxuICAgIHBsdWdpbnM6IHN0cmlwQWZmaXJtYXRpb25zID8gW1xuICAgICAgLy8gUGx1Z2luIHRvIHJlbW92ZSBjYWxscyB0byAnYWZmaXJtJ1xuICAgICAgYmFiZWxQbHVnaW5SZW1vdmVBZmZpcm1cbiAgICBdIDogW11cbiAgfSApLmNvZGU7XG59Il0sIm5hbWVzIjpbImJhYmVsIiwicmVxdWlyZSIsImJhYmVsUGx1Z2luUmVtb3ZlQWZmaXJtIiwidHJhbnNwaWxlRm9yQnVpbGQiLCJqc0lucHV0Iiwic3RyaXBBZmZpcm1hdGlvbnMiLCJmb3JJRSIsImJyb3dzZXJzIiwicHVzaCIsInRyYW5zZm9ybSIsImNvbXBhY3QiLCJwcmVzZXRzIiwibW9kdWxlcyIsInRhcmdldHMiLCJwbHVnaW5zIiwiY29kZSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FHRCxVQUFVO0FBQ1YsTUFBTUEsUUFBUUMsUUFBUyxnQkFBaUIsbURBQW1EO0FBRTNGLE1BQU1DLDBCQUEwQkQsUUFBUztBQUV6Qzs7OztDQUlDLEdBQ0QsZUFBZSxTQUFTRSxrQkFBbUJDLE9BQWUsRUFBRUMsaUJBQTBCLEVBQUVDLFFBQVEsS0FBSztJQUVuRyx1R0FBdUc7SUFDdkcsb0hBQW9IO0lBQ3BILG1IQUFtSDtJQUNuSCxpSEFBaUg7SUFDakgsdUZBQXVGO0lBQ3ZGLE1BQU1DLFdBQVc7UUFDZjtRQUNBO1FBQ0E7S0FDRDtJQUNELElBQUtELE9BQVE7UUFDWEMsU0FBU0MsSUFBSSxDQUFFO0lBQ2pCO0lBRUEsOERBQThEO0lBQzlELE9BQU9SLE1BQU1TLFNBQVMsQ0FBRUwsU0FBUztRQUUvQix3SEFBd0g7UUFDeEgsMENBQTBDO1FBQzFDTSxTQUFTO1FBRVQsbUdBQW1HO1FBQ25HQyxTQUFTO1lBQUU7Z0JBQUU7Z0JBQTZDO29CQUV4RCxpSEFBaUg7b0JBQ2pILDRFQUE0RTtvQkFDNUVDLFNBQVM7b0JBQ1RDLFNBQVM7d0JBQ1BOLFVBQVVBO29CQUNaO2dCQUNGO2FBQUc7U0FBRTtRQUVMTyxTQUFTVCxvQkFBb0I7WUFDM0IscUNBQXFDO1lBQ3JDSDtTQUNELEdBQUcsRUFBRTtJQUNSLEdBQUlhLElBQUk7QUFDViJ9