// Copyright 2013-2023, University of Colorado Boulder
/**
 * The main 'scenery' namespace object for the exported (built) API. Used internally in some places where there are
 * potential circular dependencies.
 *
 * The returned scenery object namespace may be incomplete if not all modules are listed as
 * dependencies. Please use the 'main' module for that purpose if all of Scenery is desired.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 *
 * TODO: When converting to TypeScript, please see ts-expect-error in SimDisplay https://github.com/phetsims/scenery/issues/1581
 */ import extend from '../../phet-core/js/extend.js';
import Namespace from '../../phet-core/js/Namespace.js';
// @public (scenery-internal)
window.sceneryLog = null;
const scratchCanvas = document.createElement('canvas');
const scratchContext = scratchCanvas.getContext('2d');
let logPadding = '';
const scenery = new Namespace('scenery');
// @public - A Canvas and 2D Canvas context used for convenience functions (think of it as having arbitrary state).
scenery.register('scratchCanvas', scratchCanvas);
scenery.register('scratchContext', scratchContext);
/*---------------------------------------------------------------------------*
 * Logging
 * TODO: Move this out of scenery.js if possible https://github.com/phetsims/scenery/issues/1581
 *---------------------------------------------------------------------------*/ // @private - Scenery internal log function to be used to log to scenery.logString (does not include color/css)
function stringLogFunction(message) {
    scenery.logString += `${message.replace(/%c/g, '')}\n`;
}
// @private - Scenery internal log function to be used to log to the console.
function consoleLogFunction(...args) {
    // allow for the console to not exist
    window.console && window.console.log && window.console.log(...Array.prototype.slice.call(args, 0));
}
// @private - List of Scenery's loggers, with their display name and (if using console) the display style.
const logProperties = {
    dirty: {
        name: 'dirty',
        style: 'color: #888;'
    },
    bounds: {
        name: 'bounds',
        style: 'color: #888;'
    },
    hitTest: {
        name: 'hitTest',
        style: 'color: #888;'
    },
    hitTestInternal: {
        name: 'hitTestInternal',
        style: 'color: #888;'
    },
    PerfCritical: {
        name: 'Perf',
        style: 'color: #f00;'
    },
    PerfMajor: {
        name: 'Perf',
        style: 'color: #aa0;'
    },
    PerfMinor: {
        name: 'Perf',
        style: 'color: #088;'
    },
    PerfVerbose: {
        name: 'Perf',
        style: 'color: #888;'
    },
    Cursor: {
        name: 'Cursor',
        style: ''
    },
    Stitch: {
        name: 'Stitch',
        style: ''
    },
    StitchDrawables: {
        name: 'Stitch',
        style: ''
    },
    GreedyStitcher: {
        name: 'Greedy',
        style: 'color: #088;'
    },
    GreedyVerbose: {
        name: 'Greedy',
        style: 'color: #888;'
    },
    RelativeTransform: {
        name: 'RelativeTransform',
        style: 'color: #606;'
    },
    BackboneDrawable: {
        name: 'Backbone',
        style: 'color: #a00;'
    },
    CanvasBlock: {
        name: 'Canvas',
        style: ''
    },
    WebGLBlock: {
        name: 'WebGL',
        style: ''
    },
    Display: {
        name: 'Display',
        style: ''
    },
    DOMBlock: {
        name: 'DOM',
        style: ''
    },
    Drawable: {
        name: '',
        style: ''
    },
    FittedBlock: {
        name: 'FittedBlock',
        style: ''
    },
    Instance: {
        name: 'Instance',
        style: ''
    },
    InstanceTree: {
        name: 'InstanceTree',
        style: ''
    },
    ChangeInterval: {
        name: 'ChangeInterval',
        style: 'color: #0a0;'
    },
    SVGBlock: {
        name: 'SVG',
        style: ''
    },
    SVGGroup: {
        name: 'SVGGroup',
        style: ''
    },
    ImageSVGDrawable: {
        name: 'ImageSVGDrawable',
        style: ''
    },
    Paints: {
        name: 'Paints',
        style: ''
    },
    Filters: {
        name: 'Filters',
        style: ''
    },
    AlignBox: {
        name: 'AlignBox',
        style: ''
    },
    AlignGroup: {
        name: 'AlignGroup',
        style: ''
    },
    RichText: {
        name: 'RichText',
        style: ''
    },
    Sim: {
        name: 'Sim',
        style: ''
    },
    // Accessibility-related
    ParallelDOM: {
        name: 'ParallelDOM',
        style: ''
    },
    PDOMInstance: {
        name: 'PDOMInstance',
        style: ''
    },
    PDOMTree: {
        name: 'PDOMTree',
        style: ''
    },
    PDOMDisplaysInfo: {
        name: 'PDOMDisplaysInfo',
        style: ''
    },
    KeyboardFuzzer: {
        name: 'KeyboardFuzzer',
        style: ''
    },
    // Input-related
    InputListener: {
        name: 'InputListener',
        style: ''
    },
    InputEvent: {
        name: 'InputEvent',
        style: ''
    },
    OnInput: {
        name: 'OnInput',
        style: ''
    },
    Pointer: {
        name: 'Pointer',
        style: ''
    },
    Input: {
        name: 'Input',
        style: ''
    },
    EventDispatch: {
        name: 'EventDispatch',
        style: ''
    },
    EventPath: {
        name: 'EventPath',
        style: ''
    } // User-readable form for whenever an event is dispatched
};
// will be filled in by other modules
extend(scenery, {
    // @public - Scenery log string (accumulated if switchLogToString() is used).
    logString: '',
    // @private - Scenery internal log function (switchable implementation, the main reference)
    logFunction: function(...args) {
        // allow for the console to not exist
        window.console && window.console.log && window.console.log(...Array.prototype.slice.call(args, 0));
    },
    // @public - Switches Scenery's logging to print to the developer console.
    switchLogToConsole: function() {
        scenery.logFunction = consoleLogFunction;
    },
    // @public - Switches Scenery's logging to append to scenery.logString
    switchLogToString: function() {
        window.console && window.console.log('switching to string log');
        scenery.logFunction = stringLogFunction;
    },
    // @public - Enables a specific single logger, OR a composite logger ('stitch'/'perf')
    enableIndividualLog: function(name) {
        if (name === 'stitch') {
            this.enableIndividualLog('Stitch');
            this.enableIndividualLog('StitchDrawables');
            this.enableIndividualLog('GreedyStitcher');
            this.enableIndividualLog('GreedyVerbose');
            return;
        }
        if (name === 'perf') {
            this.enableIndividualLog('PerfCritical');
            this.enableIndividualLog('PerfMajor');
            this.enableIndividualLog('PerfMinor');
            this.enableIndividualLog('PerfVerbose');
            return;
        }
        if (name === 'input') {
            this.enableIndividualLog('InputListener');
            this.enableIndividualLog('InputEvent');
            this.enableIndividualLog('OnInput');
            this.enableIndividualLog('Pointer');
            this.enableIndividualLog('Input');
            this.enableIndividualLog('EventDispatch');
            this.enableIndividualLog('EventPath');
            return;
        }
        if (name === 'a11y' || name === 'pdom') {
            this.enableIndividualLog('ParallelDOM');
            this.enableIndividualLog('PDOMInstance');
            this.enableIndividualLog('PDOMTree');
            this.enableIndividualLog('PDOMDisplaysInfo');
            return;
        }
        if (name) {
            assert && assert(logProperties[name], `Unknown logger: ${name}, please use periods (.) to separate different log names`);
            window.sceneryLog[name] = window.sceneryLog[name] || function(ob, styleOverride) {
                const data = logProperties[name];
                const prefix = data.name ? `[${data.name}] ` : '';
                const padStyle = 'color: #ddd;';
                scenery.logFunction(`%c${logPadding}%c${prefix}${ob}`, padStyle, styleOverride ? styleOverride : data.style);
            };
        }
    },
    // @public - Disables a specific log. TODO: handle stitch and perf composite loggers https://github.com/phetsims/scenery/issues/1581
    disableIndividualLog: function(name) {
        if (name) {
            delete window.sceneryLog[name];
        }
    },
    /**
   * Enables multiple loggers.
   * @public
   *
   * @param {Array.<string>} logNames - keys from logProperties
   */ enableLogging: function(logNames) {
        window.sceneryLog = function(ob) {
            scenery.logFunction(ob);
        };
        window.sceneryLog.push = function() {
            logPadding += '| ';
        };
        window.sceneryLog.pop = function() {
            logPadding = logPadding.slice(0, -2);
        };
        window.sceneryLog.getDepth = function() {
            return logPadding.length / 2;
        };
        for(let i = 0; i < logNames.length; i++){
            this.enableIndividualLog(logNames[i]);
        }
    },
    // @public - Disables Scenery logging
    disableLogging: function() {
        window.sceneryLog = null;
    },
    // @public (scenery-internal) - Whether performance logging is active (may actually reduce performance)
    isLoggingPerformance: function() {
        return window.sceneryLog.PerfCritical || window.sceneryLog.PerfMajor || window.sceneryLog.PerfMinor || window.sceneryLog.PerfVerbose;
    }
});
export default scenery;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvc2NlbmVyeS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBUaGUgbWFpbiAnc2NlbmVyeScgbmFtZXNwYWNlIG9iamVjdCBmb3IgdGhlIGV4cG9ydGVkIChidWlsdCkgQVBJLiBVc2VkIGludGVybmFsbHkgaW4gc29tZSBwbGFjZXMgd2hlcmUgdGhlcmUgYXJlXG4gKiBwb3RlbnRpYWwgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLlxuICpcbiAqIFRoZSByZXR1cm5lZCBzY2VuZXJ5IG9iamVjdCBuYW1lc3BhY2UgbWF5IGJlIGluY29tcGxldGUgaWYgbm90IGFsbCBtb2R1bGVzIGFyZSBsaXN0ZWQgYXNcbiAqIGRlcGVuZGVuY2llcy4gUGxlYXNlIHVzZSB0aGUgJ21haW4nIG1vZHVsZSBmb3IgdGhhdCBwdXJwb3NlIGlmIGFsbCBvZiBTY2VuZXJ5IGlzIGRlc2lyZWQuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICpcbiAqIFRPRE86IFdoZW4gY29udmVydGluZyB0byBUeXBlU2NyaXB0LCBwbGVhc2Ugc2VlIHRzLWV4cGVjdC1lcnJvciBpbiBTaW1EaXNwbGF5IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gKi9cblxuaW1wb3J0IGV4dGVuZCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvZXh0ZW5kLmpzJztcbmltcG9ydCBOYW1lc3BhY2UgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL05hbWVzcGFjZS5qcyc7XG5cbi8vIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXG53aW5kb3cuc2NlbmVyeUxvZyA9IG51bGw7XG5cbmNvbnN0IHNjcmF0Y2hDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xuY29uc3Qgc2NyYXRjaENvbnRleHQgPSBzY3JhdGNoQ2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcblxubGV0IGxvZ1BhZGRpbmcgPSAnJztcblxuY29uc3Qgc2NlbmVyeSA9IG5ldyBOYW1lc3BhY2UoICdzY2VuZXJ5JyApO1xuXG4vLyBAcHVibGljIC0gQSBDYW52YXMgYW5kIDJEIENhbnZhcyBjb250ZXh0IHVzZWQgZm9yIGNvbnZlbmllbmNlIGZ1bmN0aW9ucyAodGhpbmsgb2YgaXQgYXMgaGF2aW5nIGFyYml0cmFyeSBzdGF0ZSkuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnc2NyYXRjaENhbnZhcycsIHNjcmF0Y2hDYW52YXMgKTtcbnNjZW5lcnkucmVnaXN0ZXIoICdzY3JhdGNoQ29udGV4dCcsIHNjcmF0Y2hDb250ZXh0ICk7XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICogTG9nZ2luZ1xuICogVE9ETzogTW92ZSB0aGlzIG91dCBvZiBzY2VuZXJ5LmpzIGlmIHBvc3NpYmxlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbi8vIEBwcml2YXRlIC0gU2NlbmVyeSBpbnRlcm5hbCBsb2cgZnVuY3Rpb24gdG8gYmUgdXNlZCB0byBsb2cgdG8gc2NlbmVyeS5sb2dTdHJpbmcgKGRvZXMgbm90IGluY2x1ZGUgY29sb3IvY3NzKVxuZnVuY3Rpb24gc3RyaW5nTG9nRnVuY3Rpb24oIG1lc3NhZ2UgKSB7XG4gIHNjZW5lcnkubG9nU3RyaW5nICs9IGAke21lc3NhZ2UucmVwbGFjZSggLyVjL2csICcnICl9XFxuYDtcbn1cblxuLy8gQHByaXZhdGUgLSBTY2VuZXJ5IGludGVybmFsIGxvZyBmdW5jdGlvbiB0byBiZSB1c2VkIHRvIGxvZyB0byB0aGUgY29uc29sZS5cbmZ1bmN0aW9uIGNvbnNvbGVMb2dGdW5jdGlvbiggLi4uYXJncyApIHtcbiAgLy8gYWxsb3cgZm9yIHRoZSBjb25zb2xlIHRvIG5vdCBleGlzdFxuICB3aW5kb3cuY29uc29sZSAmJiB3aW5kb3cuY29uc29sZS5sb2cgJiYgd2luZG93LmNvbnNvbGUubG9nKCAuLi5BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCggYXJncywgMCApICk7XG59XG5cbi8vIEBwcml2YXRlIC0gTGlzdCBvZiBTY2VuZXJ5J3MgbG9nZ2Vycywgd2l0aCB0aGVpciBkaXNwbGF5IG5hbWUgYW5kIChpZiB1c2luZyBjb25zb2xlKSB0aGUgZGlzcGxheSBzdHlsZS5cbmNvbnN0IGxvZ1Byb3BlcnRpZXMgPSB7XG4gIGRpcnR5OiB7IG5hbWU6ICdkaXJ0eScsIHN0eWxlOiAnY29sb3I6ICM4ODg7JyB9LFxuICBib3VuZHM6IHsgbmFtZTogJ2JvdW5kcycsIHN0eWxlOiAnY29sb3I6ICM4ODg7JyB9LFxuICBoaXRUZXN0OiB7IG5hbWU6ICdoaXRUZXN0Jywgc3R5bGU6ICdjb2xvcjogIzg4ODsnIH0sXG4gIGhpdFRlc3RJbnRlcm5hbDogeyBuYW1lOiAnaGl0VGVzdEludGVybmFsJywgc3R5bGU6ICdjb2xvcjogIzg4ODsnIH0sXG4gIFBlcmZDcml0aWNhbDogeyBuYW1lOiAnUGVyZicsIHN0eWxlOiAnY29sb3I6ICNmMDA7JyB9LFxuICBQZXJmTWFqb3I6IHsgbmFtZTogJ1BlcmYnLCBzdHlsZTogJ2NvbG9yOiAjYWEwOycgfSxcbiAgUGVyZk1pbm9yOiB7IG5hbWU6ICdQZXJmJywgc3R5bGU6ICdjb2xvcjogIzA4ODsnIH0sXG4gIFBlcmZWZXJib3NlOiB7IG5hbWU6ICdQZXJmJywgc3R5bGU6ICdjb2xvcjogIzg4ODsnIH0sXG4gIEN1cnNvcjogeyBuYW1lOiAnQ3Vyc29yJywgc3R5bGU6ICcnIH0sXG4gIFN0aXRjaDogeyBuYW1lOiAnU3RpdGNoJywgc3R5bGU6ICcnIH0sXG4gIFN0aXRjaERyYXdhYmxlczogeyBuYW1lOiAnU3RpdGNoJywgc3R5bGU6ICcnIH0sXG4gIEdyZWVkeVN0aXRjaGVyOiB7IG5hbWU6ICdHcmVlZHknLCBzdHlsZTogJ2NvbG9yOiAjMDg4OycgfSxcbiAgR3JlZWR5VmVyYm9zZTogeyBuYW1lOiAnR3JlZWR5Jywgc3R5bGU6ICdjb2xvcjogIzg4ODsnIH0sXG4gIFJlbGF0aXZlVHJhbnNmb3JtOiB7IG5hbWU6ICdSZWxhdGl2ZVRyYW5zZm9ybScsIHN0eWxlOiAnY29sb3I6ICM2MDY7JyB9LFxuICBCYWNrYm9uZURyYXdhYmxlOiB7IG5hbWU6ICdCYWNrYm9uZScsIHN0eWxlOiAnY29sb3I6ICNhMDA7JyB9LFxuICBDYW52YXNCbG9jazogeyBuYW1lOiAnQ2FudmFzJywgc3R5bGU6ICcnIH0sXG4gIFdlYkdMQmxvY2s6IHsgbmFtZTogJ1dlYkdMJywgc3R5bGU6ICcnIH0sXG4gIERpc3BsYXk6IHsgbmFtZTogJ0Rpc3BsYXknLCBzdHlsZTogJycgfSxcbiAgRE9NQmxvY2s6IHsgbmFtZTogJ0RPTScsIHN0eWxlOiAnJyB9LFxuICBEcmF3YWJsZTogeyBuYW1lOiAnJywgc3R5bGU6ICcnIH0sXG4gIEZpdHRlZEJsb2NrOiB7IG5hbWU6ICdGaXR0ZWRCbG9jaycsIHN0eWxlOiAnJyB9LFxuICBJbnN0YW5jZTogeyBuYW1lOiAnSW5zdGFuY2UnLCBzdHlsZTogJycgfSxcbiAgSW5zdGFuY2VUcmVlOiB7IG5hbWU6ICdJbnN0YW5jZVRyZWUnLCBzdHlsZTogJycgfSxcbiAgQ2hhbmdlSW50ZXJ2YWw6IHsgbmFtZTogJ0NoYW5nZUludGVydmFsJywgc3R5bGU6ICdjb2xvcjogIzBhMDsnIH0sXG4gIFNWR0Jsb2NrOiB7IG5hbWU6ICdTVkcnLCBzdHlsZTogJycgfSxcbiAgU1ZHR3JvdXA6IHsgbmFtZTogJ1NWR0dyb3VwJywgc3R5bGU6ICcnIH0sXG4gIEltYWdlU1ZHRHJhd2FibGU6IHsgbmFtZTogJ0ltYWdlU1ZHRHJhd2FibGUnLCBzdHlsZTogJycgfSxcbiAgUGFpbnRzOiB7IG5hbWU6ICdQYWludHMnLCBzdHlsZTogJycgfSxcbiAgRmlsdGVyczogeyBuYW1lOiAnRmlsdGVycycsIHN0eWxlOiAnJyB9LFxuICBBbGlnbkJveDogeyBuYW1lOiAnQWxpZ25Cb3gnLCBzdHlsZTogJycgfSxcbiAgQWxpZ25Hcm91cDogeyBuYW1lOiAnQWxpZ25Hcm91cCcsIHN0eWxlOiAnJyB9LFxuICBSaWNoVGV4dDogeyBuYW1lOiAnUmljaFRleHQnLCBzdHlsZTogJycgfSxcblxuICBTaW06IHsgbmFtZTogJ1NpbScsIHN0eWxlOiAnJyB9LFxuXG4gIC8vIEFjY2Vzc2liaWxpdHktcmVsYXRlZFxuICBQYXJhbGxlbERPTTogeyBuYW1lOiAnUGFyYWxsZWxET00nLCBzdHlsZTogJycgfSxcbiAgUERPTUluc3RhbmNlOiB7IG5hbWU6ICdQRE9NSW5zdGFuY2UnLCBzdHlsZTogJycgfSxcbiAgUERPTVRyZWU6IHsgbmFtZTogJ1BET01UcmVlJywgc3R5bGU6ICcnIH0sXG4gIFBET01EaXNwbGF5c0luZm86IHsgbmFtZTogJ1BET01EaXNwbGF5c0luZm8nLCBzdHlsZTogJycgfSxcbiAgS2V5Ym9hcmRGdXp6ZXI6IHsgbmFtZTogJ0tleWJvYXJkRnV6emVyJywgc3R5bGU6ICcnIH0sXG5cbiAgLy8gSW5wdXQtcmVsYXRlZFxuICBJbnB1dExpc3RlbmVyOiB7IG5hbWU6ICdJbnB1dExpc3RlbmVyJywgc3R5bGU6ICcnIH0sXG4gIElucHV0RXZlbnQ6IHsgbmFtZTogJ0lucHV0RXZlbnQnLCBzdHlsZTogJycgfSxcbiAgT25JbnB1dDogeyBuYW1lOiAnT25JbnB1dCcsIHN0eWxlOiAnJyB9LFxuICBQb2ludGVyOiB7IG5hbWU6ICdQb2ludGVyJywgc3R5bGU6ICcnIH0sXG4gIElucHV0OiB7IG5hbWU6ICdJbnB1dCcsIHN0eWxlOiAnJyB9LCAvLyBXaGVuIFwibG9naWNhbFwiIGlucHV0IGZ1bmN0aW9ucyBhcmUgY2FsbGVkLCBhbmQgcmVsYXRlZCB0YXNrc1xuICBFdmVudERpc3BhdGNoOiB7IG5hbWU6ICdFdmVudERpc3BhdGNoJywgc3R5bGU6ICcnIH0sIC8vIFdoZW4gYW4gZXZlbnQgaXMgZGlzcGF0Y2hlZCwgYW5kIHdoZW4gbGlzdGVuZXJzIGFyZSB0cmlnZ2VyZWRcbiAgRXZlbnRQYXRoOiB7IG5hbWU6ICdFdmVudFBhdGgnLCBzdHlsZTogJycgfSAvLyBVc2VyLXJlYWRhYmxlIGZvcm0gZm9yIHdoZW5ldmVyIGFuIGV2ZW50IGlzIGRpc3BhdGNoZWRcbn07XG5cbi8vIHdpbGwgYmUgZmlsbGVkIGluIGJ5IG90aGVyIG1vZHVsZXNcbmV4dGVuZCggc2NlbmVyeSwge1xuICAvLyBAcHVibGljIC0gU2NlbmVyeSBsb2cgc3RyaW5nIChhY2N1bXVsYXRlZCBpZiBzd2l0Y2hMb2dUb1N0cmluZygpIGlzIHVzZWQpLlxuICBsb2dTdHJpbmc6ICcnLFxuXG4gIC8vIEBwcml2YXRlIC0gU2NlbmVyeSBpbnRlcm5hbCBsb2cgZnVuY3Rpb24gKHN3aXRjaGFibGUgaW1wbGVtZW50YXRpb24sIHRoZSBtYWluIHJlZmVyZW5jZSlcbiAgbG9nRnVuY3Rpb246IGZ1bmN0aW9uKCAuLi5hcmdzICkge1xuICAgIC8vIGFsbG93IGZvciB0aGUgY29uc29sZSB0byBub3QgZXhpc3RcbiAgICB3aW5kb3cuY29uc29sZSAmJiB3aW5kb3cuY29uc29sZS5sb2cgJiYgd2luZG93LmNvbnNvbGUubG9nKCAuLi5BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCggYXJncywgMCApICk7XG4gIH0sXG5cbiAgLy8gQHB1YmxpYyAtIFN3aXRjaGVzIFNjZW5lcnkncyBsb2dnaW5nIHRvIHByaW50IHRvIHRoZSBkZXZlbG9wZXIgY29uc29sZS5cbiAgc3dpdGNoTG9nVG9Db25zb2xlOiBmdW5jdGlvbigpIHtcbiAgICBzY2VuZXJ5LmxvZ0Z1bmN0aW9uID0gY29uc29sZUxvZ0Z1bmN0aW9uO1xuICB9LFxuXG4gIC8vIEBwdWJsaWMgLSBTd2l0Y2hlcyBTY2VuZXJ5J3MgbG9nZ2luZyB0byBhcHBlbmQgdG8gc2NlbmVyeS5sb2dTdHJpbmdcbiAgc3dpdGNoTG9nVG9TdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5jb25zb2xlICYmIHdpbmRvdy5jb25zb2xlLmxvZyggJ3N3aXRjaGluZyB0byBzdHJpbmcgbG9nJyApO1xuICAgIHNjZW5lcnkubG9nRnVuY3Rpb24gPSBzdHJpbmdMb2dGdW5jdGlvbjtcbiAgfSxcblxuICAvLyBAcHVibGljIC0gRW5hYmxlcyBhIHNwZWNpZmljIHNpbmdsZSBsb2dnZXIsIE9SIGEgY29tcG9zaXRlIGxvZ2dlciAoJ3N0aXRjaCcvJ3BlcmYnKVxuICBlbmFibGVJbmRpdmlkdWFsTG9nOiBmdW5jdGlvbiggbmFtZSApIHtcbiAgICBpZiAoIG5hbWUgPT09ICdzdGl0Y2gnICkge1xuICAgICAgdGhpcy5lbmFibGVJbmRpdmlkdWFsTG9nKCAnU3RpdGNoJyApO1xuICAgICAgdGhpcy5lbmFibGVJbmRpdmlkdWFsTG9nKCAnU3RpdGNoRHJhd2FibGVzJyApO1xuICAgICAgdGhpcy5lbmFibGVJbmRpdmlkdWFsTG9nKCAnR3JlZWR5U3RpdGNoZXInICk7XG4gICAgICB0aGlzLmVuYWJsZUluZGl2aWR1YWxMb2coICdHcmVlZHlWZXJib3NlJyApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICggbmFtZSA9PT0gJ3BlcmYnICkge1xuICAgICAgdGhpcy5lbmFibGVJbmRpdmlkdWFsTG9nKCAnUGVyZkNyaXRpY2FsJyApO1xuICAgICAgdGhpcy5lbmFibGVJbmRpdmlkdWFsTG9nKCAnUGVyZk1ham9yJyApO1xuICAgICAgdGhpcy5lbmFibGVJbmRpdmlkdWFsTG9nKCAnUGVyZk1pbm9yJyApO1xuICAgICAgdGhpcy5lbmFibGVJbmRpdmlkdWFsTG9nKCAnUGVyZlZlcmJvc2UnICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCBuYW1lID09PSAnaW5wdXQnICkge1xuICAgICAgdGhpcy5lbmFibGVJbmRpdmlkdWFsTG9nKCAnSW5wdXRMaXN0ZW5lcicgKTtcbiAgICAgIHRoaXMuZW5hYmxlSW5kaXZpZHVhbExvZyggJ0lucHV0RXZlbnQnICk7XG4gICAgICB0aGlzLmVuYWJsZUluZGl2aWR1YWxMb2coICdPbklucHV0JyApO1xuICAgICAgdGhpcy5lbmFibGVJbmRpdmlkdWFsTG9nKCAnUG9pbnRlcicgKTtcbiAgICAgIHRoaXMuZW5hYmxlSW5kaXZpZHVhbExvZyggJ0lucHV0JyApO1xuICAgICAgdGhpcy5lbmFibGVJbmRpdmlkdWFsTG9nKCAnRXZlbnREaXNwYXRjaCcgKTtcbiAgICAgIHRoaXMuZW5hYmxlSW5kaXZpZHVhbExvZyggJ0V2ZW50UGF0aCcgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCBuYW1lID09PSAnYTExeScgfHwgbmFtZSA9PT0gJ3Bkb20nICkge1xuICAgICAgdGhpcy5lbmFibGVJbmRpdmlkdWFsTG9nKCAnUGFyYWxsZWxET00nICk7XG4gICAgICB0aGlzLmVuYWJsZUluZGl2aWR1YWxMb2coICdQRE9NSW5zdGFuY2UnICk7XG4gICAgICB0aGlzLmVuYWJsZUluZGl2aWR1YWxMb2coICdQRE9NVHJlZScgKTtcbiAgICAgIHRoaXMuZW5hYmxlSW5kaXZpZHVhbExvZyggJ1BET01EaXNwbGF5c0luZm8nICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCBuYW1lICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbG9nUHJvcGVydGllc1sgbmFtZSBdLFxuICAgICAgICBgVW5rbm93biBsb2dnZXI6ICR7bmFtZX0sIHBsZWFzZSB1c2UgcGVyaW9kcyAoLikgdG8gc2VwYXJhdGUgZGlmZmVyZW50IGxvZyBuYW1lc2AgKTtcblxuICAgICAgd2luZG93LnNjZW5lcnlMb2dbIG5hbWUgXSA9IHdpbmRvdy5zY2VuZXJ5TG9nWyBuYW1lIF0gfHwgZnVuY3Rpb24oIG9iLCBzdHlsZU92ZXJyaWRlICkge1xuICAgICAgICBjb25zdCBkYXRhID0gbG9nUHJvcGVydGllc1sgbmFtZSBdO1xuXG4gICAgICAgIGNvbnN0IHByZWZpeCA9IGRhdGEubmFtZSA/IGBbJHtkYXRhLm5hbWV9XSBgIDogJyc7XG4gICAgICAgIGNvbnN0IHBhZFN0eWxlID0gJ2NvbG9yOiAjZGRkOyc7XG4gICAgICAgIHNjZW5lcnkubG9nRnVuY3Rpb24oIGAlYyR7bG9nUGFkZGluZ30lYyR7cHJlZml4fSR7b2J9YCwgcGFkU3R5bGUsIHN0eWxlT3ZlcnJpZGUgPyBzdHlsZU92ZXJyaWRlIDogZGF0YS5zdHlsZSApO1xuICAgICAgfTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gQHB1YmxpYyAtIERpc2FibGVzIGEgc3BlY2lmaWMgbG9nLiBUT0RPOiBoYW5kbGUgc3RpdGNoIGFuZCBwZXJmIGNvbXBvc2l0ZSBsb2dnZXJzIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gIGRpc2FibGVJbmRpdmlkdWFsTG9nOiBmdW5jdGlvbiggbmFtZSApIHtcbiAgICBpZiAoIG5hbWUgKSB7XG4gICAgICBkZWxldGUgd2luZG93LnNjZW5lcnlMb2dbIG5hbWUgXTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEVuYWJsZXMgbXVsdGlwbGUgbG9nZ2Vycy5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSBsb2dOYW1lcyAtIGtleXMgZnJvbSBsb2dQcm9wZXJ0aWVzXG4gICAqL1xuICBlbmFibGVMb2dnaW5nOiBmdW5jdGlvbiggbG9nTmFtZXMgKSB7XG4gICAgd2luZG93LnNjZW5lcnlMb2cgPSBmdW5jdGlvbiggb2IgKSB7IHNjZW5lcnkubG9nRnVuY3Rpb24oIG9iICk7IH07XG5cbiAgICB3aW5kb3cuc2NlbmVyeUxvZy5wdXNoID0gZnVuY3Rpb24oKSB7XG4gICAgICBsb2dQYWRkaW5nICs9ICd8ICc7XG4gICAgfTtcbiAgICB3aW5kb3cuc2NlbmVyeUxvZy5wb3AgPSBmdW5jdGlvbigpIHtcbiAgICAgIGxvZ1BhZGRpbmcgPSBsb2dQYWRkaW5nLnNsaWNlKCAwLCAtMiApO1xuICAgIH07XG4gICAgd2luZG93LnNjZW5lcnlMb2cuZ2V0RGVwdGggPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBsb2dQYWRkaW5nLmxlbmd0aCAvIDI7XG4gICAgfTtcblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGxvZ05hbWVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgdGhpcy5lbmFibGVJbmRpdmlkdWFsTG9nKCBsb2dOYW1lc1sgaSBdICk7XG4gICAgfVxuICB9LFxuXG4gIC8vIEBwdWJsaWMgLSBEaXNhYmxlcyBTY2VuZXJ5IGxvZ2dpbmdcbiAgZGlzYWJsZUxvZ2dpbmc6IGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5zY2VuZXJ5TG9nID0gbnVsbDtcbiAgfSxcblxuICAvLyBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKSAtIFdoZXRoZXIgcGVyZm9ybWFuY2UgbG9nZ2luZyBpcyBhY3RpdmUgKG1heSBhY3R1YWxseSByZWR1Y2UgcGVyZm9ybWFuY2UpXG4gIGlzTG9nZ2luZ1BlcmZvcm1hbmNlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gd2luZG93LnNjZW5lcnlMb2cuUGVyZkNyaXRpY2FsIHx8IHdpbmRvdy5zY2VuZXJ5TG9nLlBlcmZNYWpvciB8fFxuICAgICAgICAgICB3aW5kb3cuc2NlbmVyeUxvZy5QZXJmTWlub3IgfHwgd2luZG93LnNjZW5lcnlMb2cuUGVyZlZlcmJvc2U7XG4gIH1cbn0gKTtcblxuZXhwb3J0IGRlZmF1bHQgc2NlbmVyeTsiXSwibmFtZXMiOlsiZXh0ZW5kIiwiTmFtZXNwYWNlIiwid2luZG93Iiwic2NlbmVyeUxvZyIsInNjcmF0Y2hDYW52YXMiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJzY3JhdGNoQ29udGV4dCIsImdldENvbnRleHQiLCJsb2dQYWRkaW5nIiwic2NlbmVyeSIsInJlZ2lzdGVyIiwic3RyaW5nTG9nRnVuY3Rpb24iLCJtZXNzYWdlIiwibG9nU3RyaW5nIiwicmVwbGFjZSIsImNvbnNvbGVMb2dGdW5jdGlvbiIsImFyZ3MiLCJjb25zb2xlIiwibG9nIiwiQXJyYXkiLCJwcm90b3R5cGUiLCJzbGljZSIsImNhbGwiLCJsb2dQcm9wZXJ0aWVzIiwiZGlydHkiLCJuYW1lIiwic3R5bGUiLCJib3VuZHMiLCJoaXRUZXN0IiwiaGl0VGVzdEludGVybmFsIiwiUGVyZkNyaXRpY2FsIiwiUGVyZk1ham9yIiwiUGVyZk1pbm9yIiwiUGVyZlZlcmJvc2UiLCJDdXJzb3IiLCJTdGl0Y2giLCJTdGl0Y2hEcmF3YWJsZXMiLCJHcmVlZHlTdGl0Y2hlciIsIkdyZWVkeVZlcmJvc2UiLCJSZWxhdGl2ZVRyYW5zZm9ybSIsIkJhY2tib25lRHJhd2FibGUiLCJDYW52YXNCbG9jayIsIldlYkdMQmxvY2siLCJEaXNwbGF5IiwiRE9NQmxvY2siLCJEcmF3YWJsZSIsIkZpdHRlZEJsb2NrIiwiSW5zdGFuY2UiLCJJbnN0YW5jZVRyZWUiLCJDaGFuZ2VJbnRlcnZhbCIsIlNWR0Jsb2NrIiwiU1ZHR3JvdXAiLCJJbWFnZVNWR0RyYXdhYmxlIiwiUGFpbnRzIiwiRmlsdGVycyIsIkFsaWduQm94IiwiQWxpZ25Hcm91cCIsIlJpY2hUZXh0IiwiU2ltIiwiUGFyYWxsZWxET00iLCJQRE9NSW5zdGFuY2UiLCJQRE9NVHJlZSIsIlBET01EaXNwbGF5c0luZm8iLCJLZXlib2FyZEZ1enplciIsIklucHV0TGlzdGVuZXIiLCJJbnB1dEV2ZW50IiwiT25JbnB1dCIsIlBvaW50ZXIiLCJJbnB1dCIsIkV2ZW50RGlzcGF0Y2giLCJFdmVudFBhdGgiLCJsb2dGdW5jdGlvbiIsInN3aXRjaExvZ1RvQ29uc29sZSIsInN3aXRjaExvZ1RvU3RyaW5nIiwiZW5hYmxlSW5kaXZpZHVhbExvZyIsImFzc2VydCIsIm9iIiwic3R5bGVPdmVycmlkZSIsImRhdGEiLCJwcmVmaXgiLCJwYWRTdHlsZSIsImRpc2FibGVJbmRpdmlkdWFsTG9nIiwiZW5hYmxlTG9nZ2luZyIsImxvZ05hbWVzIiwicHVzaCIsInBvcCIsImdldERlcHRoIiwibGVuZ3RoIiwiaSIsImRpc2FibGVMb2dnaW5nIiwiaXNMb2dnaW5nUGVyZm9ybWFuY2UiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7OztDQVVDLEdBRUQsT0FBT0EsWUFBWSwrQkFBK0I7QUFDbEQsT0FBT0MsZUFBZSxrQ0FBa0M7QUFFeEQsNkJBQTZCO0FBQzdCQyxPQUFPQyxVQUFVLEdBQUc7QUFFcEIsTUFBTUMsZ0JBQWdCQyxTQUFTQyxhQUFhLENBQUU7QUFDOUMsTUFBTUMsaUJBQWlCSCxjQUFjSSxVQUFVLENBQUU7QUFFakQsSUFBSUMsYUFBYTtBQUVqQixNQUFNQyxVQUFVLElBQUlULFVBQVc7QUFFL0IsbUhBQW1IO0FBQ25IUyxRQUFRQyxRQUFRLENBQUUsaUJBQWlCUDtBQUNuQ00sUUFBUUMsUUFBUSxDQUFFLGtCQUFrQko7QUFFcEM7Ozs2RUFHNkUsR0FFN0UsK0dBQStHO0FBQy9HLFNBQVNLLGtCQUFtQkMsT0FBTztJQUNqQ0gsUUFBUUksU0FBUyxJQUFJLEdBQUdELFFBQVFFLE9BQU8sQ0FBRSxPQUFPLElBQUssRUFBRSxDQUFDO0FBQzFEO0FBRUEsNkVBQTZFO0FBQzdFLFNBQVNDLG1CQUFvQixHQUFHQyxJQUFJO0lBQ2xDLHFDQUFxQztJQUNyQ2YsT0FBT2dCLE9BQU8sSUFBSWhCLE9BQU9nQixPQUFPLENBQUNDLEdBQUcsSUFBSWpCLE9BQU9nQixPQUFPLENBQUNDLEdBQUcsSUFBS0MsTUFBTUMsU0FBUyxDQUFDQyxLQUFLLENBQUNDLElBQUksQ0FBRU4sTUFBTTtBQUNuRztBQUVBLDBHQUEwRztBQUMxRyxNQUFNTyxnQkFBZ0I7SUFDcEJDLE9BQU87UUFBRUMsTUFBTTtRQUFTQyxPQUFPO0lBQWU7SUFDOUNDLFFBQVE7UUFBRUYsTUFBTTtRQUFVQyxPQUFPO0lBQWU7SUFDaERFLFNBQVM7UUFBRUgsTUFBTTtRQUFXQyxPQUFPO0lBQWU7SUFDbERHLGlCQUFpQjtRQUFFSixNQUFNO1FBQW1CQyxPQUFPO0lBQWU7SUFDbEVJ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