// Copyright 2020-2024, University of Colorado Boulder
/**
 * Grunt configuration file for unit tests
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
import _ from 'lodash';
import generateDevelopmentHTML from './generateDevelopmentHTML.js';
export default /*#__PURE__*/ _async_to_generator(function*(repo, options) {
    yield generateDevelopmentHTML(repo, _.merge({
        // Include QUnit CSS
        stylesheets: '  <link rel="stylesheet" href="../sherpa/lib/qunit-2.20.0.css">',
        // Leave the background the default color white
        bodystyle: '',
        // Output to a test file
        outputFile: `${repo}-tests.html`,
        // Add the QUnit divs (and Scenery display div if relevant)
        bodystart: `<div id="qunit"></div>\n<div id="qunit-fixture"></div>${repo === 'scenery' ? '<div id="display"></div>' : ''}`,
        // Add QUnit JS
        addedPreloads: [
            '../sherpa/lib/qunit-2.20.0.js',
            '../chipper/js/browser/sim-tests/qunit-connector.js'
        ],
        // Do not show the splash screen
        stripPreloads: [
            '../joist/js/splash.js'
        ],
        mainFile: `../chipper/dist/js/${repo}/js/${repo}-tests.js`,
        // Specify to use test config
        qualifier: 'test-',
        // Unit tests do not include the phet-io baseline and overrides files
        forSim: false
    }, options));
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L2dlbmVyYXRlVGVzdEhUTUwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogR3J1bnQgY29uZmlndXJhdGlvbiBmaWxlIGZvciB1bml0IHRlc3RzXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcbmltcG9ydCBnZW5lcmF0ZURldmVsb3BtZW50SFRNTCBmcm9tICcuL2dlbmVyYXRlRGV2ZWxvcG1lbnRIVE1MLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKCByZXBvOiBzdHJpbmcsIG9wdGlvbnM/OiBJbnRlbnRpb25hbEFueSApOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgYXdhaXQgZ2VuZXJhdGVEZXZlbG9wbWVudEhUTUwoIHJlcG8sIF8ubWVyZ2UoIHtcblxuICAgIC8vIEluY2x1ZGUgUVVuaXQgQ1NTXG4gICAgc3R5bGVzaGVldHM6ICcgIDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiLi4vc2hlcnBhL2xpYi9xdW5pdC0yLjIwLjAuY3NzXCI+JywgLy8gTm90ZSB0aGUgcHJlY2VkaW5nIHdoaXRlc3BhY2Ugd2hpY2ggbWFrZXMgdGhlIGZvcm1hdHRpbmcgbWF0Y2ggSURFQSBmb3JtYXR0aW5nXG5cbiAgICAvLyBMZWF2ZSB0aGUgYmFja2dyb3VuZCB0aGUgZGVmYXVsdCBjb2xvciB3aGl0ZVxuICAgIGJvZHlzdHlsZTogJycsXG5cbiAgICAvLyBPdXRwdXQgdG8gYSB0ZXN0IGZpbGVcbiAgICBvdXRwdXRGaWxlOiBgJHtyZXBvfS10ZXN0cy5odG1sYCxcblxuICAgIC8vIEFkZCB0aGUgUVVuaXQgZGl2cyAoYW5kIFNjZW5lcnkgZGlzcGxheSBkaXYgaWYgcmVsZXZhbnQpXG4gICAgYm9keXN0YXJ0OiBgPGRpdiBpZD1cInF1bml0XCI+PC9kaXY+XFxuPGRpdiBpZD1cInF1bml0LWZpeHR1cmVcIj48L2Rpdj4ke3JlcG8gPT09ICdzY2VuZXJ5JyA/ICc8ZGl2IGlkPVwiZGlzcGxheVwiPjwvZGl2PicgOiAnJ31gLFxuXG4gICAgLy8gQWRkIFFVbml0IEpTXG4gICAgYWRkZWRQcmVsb2FkczogWyAnLi4vc2hlcnBhL2xpYi9xdW5pdC0yLjIwLjAuanMnLCAnLi4vY2hpcHBlci9qcy9icm93c2VyL3NpbS10ZXN0cy9xdW5pdC1jb25uZWN0b3IuanMnIF0sXG5cbiAgICAvLyBEbyBub3Qgc2hvdyB0aGUgc3BsYXNoIHNjcmVlblxuICAgIHN0cmlwUHJlbG9hZHM6IFsgJy4uL2pvaXN0L2pzL3NwbGFzaC5qcycgXSxcblxuICAgIG1haW5GaWxlOiBgLi4vY2hpcHBlci9kaXN0L2pzLyR7cmVwb30vanMvJHtyZXBvfS10ZXN0cy5qc2AsXG5cbiAgICAvLyBTcGVjaWZ5IHRvIHVzZSB0ZXN0IGNvbmZpZ1xuICAgIHF1YWxpZmllcjogJ3Rlc3QtJyxcblxuICAgIC8vIFVuaXQgdGVzdHMgZG8gbm90IGluY2x1ZGUgdGhlIHBoZXQtaW8gYmFzZWxpbmUgYW5kIG92ZXJyaWRlcyBmaWxlc1xuICAgIGZvclNpbTogZmFsc2VcbiAgfSwgb3B0aW9ucyApICk7XG59OyJdLCJuYW1lcyI6WyJfIiwiZ2VuZXJhdGVEZXZlbG9wbWVudEhUTUwiLCJyZXBvIiwib3B0aW9ucyIsIm1lcmdlIiwic3R5bGVzaGVldHMiLCJib2R5c3R5bGUiLCJvdXRwdXRGaWxlIiwiYm9keXN0YXJ0IiwiYWRkZWRQcmVsb2FkcyIsInN0cmlwUHJlbG9hZHMiLCJtYWluRmlsZSIsInF1YWxpZmllciIsImZvclNpbSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsT0FBT0EsT0FBTyxTQUFTO0FBRXZCLE9BQU9DLDZCQUE2QiwrQkFBK0I7QUFFbkUsaURBQWUsVUFBUUMsTUFBY0M7SUFDbkMsTUFBTUYsd0JBQXlCQyxNQUFNRixFQUFFSSxLQUFLLENBQUU7UUFFNUMsb0JBQW9CO1FBQ3BCQyxhQUFhO1FBRWIsK0NBQStDO1FBQy9DQyxXQUFXO1FBRVgsd0JBQXdCO1FBQ3hCQyxZQUFZLEdBQUdMLEtBQUssV0FBVyxDQUFDO1FBRWhDLDJEQUEyRDtRQUMzRE0sV0FBVyxDQUFDLHNEQUFzRCxFQUFFTixTQUFTLFlBQVksNkJBQTZCLElBQUk7UUFFMUgsZUFBZTtRQUNmTyxlQUFlO1lBQUU7WUFBaUM7U0FBc0Q7UUFFeEcsZ0NBQWdDO1FBQ2hDQyxlQUFlO1lBQUU7U0FBeUI7UUFFMUNDLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRVQsS0FBSyxJQUFJLEVBQUVBLEtBQUssU0FBUyxDQUFDO1FBRTFELDZCQUE2QjtRQUM3QlUsV0FBVztRQUVYLHFFQUFxRTtRQUNyRUMsUUFBUTtJQUNWLEdBQUdWO0FBQ0wsR0FBRSJ9