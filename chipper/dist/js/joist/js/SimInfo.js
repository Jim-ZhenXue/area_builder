// Copyright 2021-2024, University of Colorado Boulder
/**
 * Return an object of data about the simulation and the browser
 * much of the code was largely copied and expanded on from SimTroubleshootPage.html in the website repo. Note that
 * key names in the info object are used by the PhET-iO API, do not change without great consideration.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import { Utils } from '../../scenery/js/imports.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import ArrayIO from '../../tandem/js/types/ArrayIO.js';
import BooleanIO from '../../tandem/js/types/BooleanIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import NullableIO from '../../tandem/js/types/NullableIO.js';
import NumberIO from '../../tandem/js/types/NumberIO.js';
import ObjectLiteralIO from '../../tandem/js/types/ObjectLiteralIO.js';
import StringIO from '../../tandem/js/types/StringIO.js';
import joist from './joist.js';
import packageJSON from './packageJSON.js';
let SimInfo = class SimInfo extends PhetioObject {
    putInfo(key, value) {
        if (value === undefined) {
            value = '{{undefined}}';
        }
        assert && assert(!this.info.hasOwnProperty(key), `key already defined: ${key}`);
        // @ts-expect-error I don't know how to ensure the correct value, just the key
        this.info[key] = value;
    }
    constructor(sim){
        super({
            tandem: Tandem.GENERAL_MODEL.createTandem('simInfo'),
            phetioType: SimInfo.SimInfoIO,
            phetioReadOnly: true,
            phetioDocumentation: 'A collection of data about the runtime and simulation. Available in the simStarted PhET-iO ' + 'data stream event, as well as on demand in the PhET-iO state.'
        }), this.info = {};
        assert && assert(Array.isArray(sim.screens), 'screens should be set and an array');
        // globals
        this.putInfo('url', window.location.href);
        this.putInfo('randomSeed', window.phet.chipper.queryParameters.randomSeed);
        this.putInfo('userAgent', window.navigator.userAgent);
        this.putInfo('language', window.navigator.language);
        this.putInfo('window', `${window.innerWidth}x${window.innerHeight}`); // eslint-disable-line phet/bad-sim-text
        this.putInfo('referrer', document.referrer);
        // from Scenery Utils
        this.putInfo('checkIE11StencilSupport', Utils.checkIE11StencilSupport());
        this.putInfo('isWebGLSupported', phet.chipper.queryParameters.webgl ? Utils.isWebGLSupported : false);
        let canvas;
        let context;
        let backingStorePixelRatio;
        const flags = [];
        // @ts-expect-error - pointerEnabled isn't included in the Typescript definition of window.navigator
        if (window.navigator.pointerEnabled) {
            flags.push('pointerEnabled');
        }
        // @ts-expect-error - msPointerEnabled isn't included in the Typescript definition of window.navigator
        if (window.navigator.msPointerEnabled) {
            flags.push('msPointerEnabled');
        }
        if (!window.navigator.onLine) {
            flags.push('offline');
        }
        try {
            canvas = document.createElement('canvas');
            context = canvas.getContext('2d');
            backingStorePixelRatio = Utils.backingStorePixelRatio(context);
            this.putInfo('pixelRatio', `${window.devicePixelRatio || 1}/${backingStorePixelRatio}`);
            if ((window.devicePixelRatio || 1) / backingStorePixelRatio !== 1) {
                flags.push('pixelRatioScaling');
            }
        } catch (e) {} // eslint-disable-line no-empty
        this.putInfo('flags', flags.join(', '));
        canvas = null; // dispose only reference
        // from Sim.js
        this.putInfo('simName', sim.simNameProperty.value);
        this.putInfo('simVersion', sim.version);
        this.putInfo('repoName', packageJSON.name);
        this.putInfo('screens', sim.screens.map((screen)=>{
            const screenObject = {
                // likely null for single screen sims, so use the sim name as a default
                name: screen.nameProperty.value || sim.simNameProperty.value
            };
            if (Tandem.PHET_IO_ENABLED) {
                screenObject.phetioID = screen.tandem.phetioID;
            }
            return screenObject;
        }));
        // From PhET-iO code
        if (Tandem.PHET_IO_ENABLED) {
            this.putInfo('screenPropertyValue', sim.selectedScreenProperty.value.tandem.phetioID);
            this.putInfo('wrapperMetadata', phet.preloads.phetio.simStartedMetadata);
            this.putInfo('dataStreamVersion', phet.phetio.dataStream.VERSION);
            this.putInfo('phetioCommandProcessorProtocol', phet.phetio.phetioCommandProcessor.PHET_IO_PROTOCOL);
        }
    }
};
SimInfo.SimInfoIO = new IOType('SimInfoIO', {
    valueType: SimInfo,
    toStateObject: (simInfo)=>{
        return {
            simName: simInfo.info.simName,
            screens: simInfo.info.screens,
            repoName: simInfo.info.repoName,
            screenPropertyValue: simInfo.info.screenPropertyValue,
            dataStreamVersion: simInfo.info.dataStreamVersion,
            phetioCommandProcessorProtocol: simInfo.info.phetioCommandProcessorProtocol,
            simVersion: simInfo.info.simVersion,
            wrapperMetadata: simInfo.info.wrapperMetadata,
            randomSeed: simInfo.info.randomSeed,
            url: simInfo.info.url,
            userAgent: simInfo.info.userAgent,
            window: simInfo.info.window,
            referrer: simInfo.info.referrer,
            language: simInfo.info.language,
            pixelRatio: simInfo.info.pixelRatio,
            isWebGLSupported: simInfo.info.isWebGLSupported,
            checkIE11StencilSupport: simInfo.info.checkIE11StencilSupport,
            flags: simInfo.info.flags || null
        };
    },
    // Do not try to load in a SimInfo
    applyState: _.noop,
    stateSchema: {
        simName: StringIO,
        screens: ArrayIO(ObjectLiteralIO),
        repoName: StringIO,
        screenPropertyValue: StringIO,
        wrapperMetadata: NullableIO(ObjectLiteralIO),
        dataStreamVersion: StringIO,
        phetioCommandProcessorProtocol: StringIO,
        // Parts that are omitted in API generation
        simVersion: NullableIO(StringIO),
        randomSeed: NullableIO(NumberIO),
        url: NullableIO(StringIO),
        userAgent: NullableIO(StringIO),
        window: NullableIO(StringIO),
        referrer: NullableIO(StringIO),
        language: NullableIO(StringIO),
        pixelRatio: NullableIO(StringIO),
        isWebGLSupported: NullableIO(BooleanIO),
        checkIE11StencilSupport: NullableIO(BooleanIO),
        flags: NullableIO(StringIO)
    },
    apiStateKeys: [
        'screens',
        'repoName',
        'dataStreamVersion',
        'phetioCommandProcessorProtocol'
    ]
});
joist.register('SimInfo', SimInfo);
export default SimInfo;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NpbUluZm8udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUmV0dXJuIGFuIG9iamVjdCBvZiBkYXRhIGFib3V0IHRoZSBzaW11bGF0aW9uIGFuZCB0aGUgYnJvd3NlclxuICogbXVjaCBvZiB0aGUgY29kZSB3YXMgbGFyZ2VseSBjb3BpZWQgYW5kIGV4cGFuZGVkIG9uIGZyb20gU2ltVHJvdWJsZXNob290UGFnZS5odG1sIGluIHRoZSB3ZWJzaXRlIHJlcG8uIE5vdGUgdGhhdFxuICoga2V5IG5hbWVzIGluIHRoZSBpbmZvIG9iamVjdCBhcmUgdXNlZCBieSB0aGUgUGhFVC1pTyBBUEksIGRvIG5vdCBjaGFuZ2Ugd2l0aG91dCBncmVhdCBjb25zaWRlcmF0aW9uLlxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBQaGV0aW9PYmplY3QgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IEFycmF5SU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0FycmF5SU8uanMnO1xuaW1wb3J0IEJvb2xlYW5JTyBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvQm9vbGVhbklPLmpzJztcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XG5pbXBvcnQgTnVsbGFibGVJTyBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvTnVsbGFibGVJTy5qcyc7XG5pbXBvcnQgTnVtYmVySU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bWJlcklPLmpzJztcbmltcG9ydCBPYmplY3RMaXRlcmFsSU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL09iamVjdExpdGVyYWxJTy5qcyc7XG5pbXBvcnQgU3RyaW5nSU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1N0cmluZ0lPLmpzJztcbmltcG9ydCBqb2lzdCBmcm9tICcuL2pvaXN0LmpzJztcbmltcG9ydCBwYWNrYWdlSlNPTiBmcm9tICcuL3BhY2thZ2VKU09OLmpzJztcbmltcG9ydCB7IEFueVNjcmVlbiB9IGZyb20gJy4vU2NyZWVuLmpzJztcbmltcG9ydCBTaW0gZnJvbSAnLi9TaW0uanMnO1xuXG5leHBvcnQgdHlwZSBTY3JlZW5TdGF0ZSA9IHtcbiAgbmFtZTogc3RyaW5nO1xuICBwaGV0aW9JRD86IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFNpbUluZm9TdGF0ZSA9IHtcbiAgc2ltTmFtZTogc3RyaW5nO1xuICBzY3JlZW5zOiBTY3JlZW5TdGF0ZVtdO1xuICByZXBvTmFtZTogc3RyaW5nO1xuXG4gIHNjcmVlblByb3BlcnR5VmFsdWU6IHN0cmluZztcbiAgd3JhcHBlck1ldGFkYXRhOiBudWxsIHwgUmVjb3JkPHN0cmluZywgSW50ZW50aW9uYWxBbnk+O1xuICBkYXRhU3RyZWFtVmVyc2lvbjogc3RyaW5nO1xuICBwaGV0aW9Db21tYW5kUHJvY2Vzc29yUHJvdG9jb2w6IHN0cmluZztcbiAgc2ltVmVyc2lvbjogc3RyaW5nIHwgbnVsbDtcbiAgcmFuZG9tU2VlZDogbnVtYmVyIHwgbnVsbDtcbiAgdXJsOiBzdHJpbmcgfCBudWxsO1xuICB1c2VyQWdlbnQ6IHN0cmluZyB8IG51bGw7XG4gIHdpbmRvdzogc3RyaW5nIHwgbnVsbDtcbiAgcmVmZXJyZXI6IHN0cmluZyB8IG51bGw7XG4gIGxhbmd1YWdlOiBzdHJpbmcgfCBudWxsO1xuICBwaXhlbFJhdGlvOiBzdHJpbmcgfCBudWxsO1xuICBpc1dlYkdMU3VwcG9ydGVkOiBib29sZWFuIHwgbnVsbDtcbiAgY2hlY2tJRTExU3RlbmNpbFN1cHBvcnQ6IGJvb2xlYW4gfCBudWxsO1xuICBmbGFnczogc3RyaW5nIHwgbnVsbDtcbn07XG5cbmNsYXNzIFNpbUluZm8gZXh0ZW5kcyBQaGV0aW9PYmplY3Qge1xuICBwdWJsaWMgcmVhZG9ubHkgaW5mbzogU2ltSW5mb1N0YXRlID0ge30gYXMgU2ltSW5mb1N0YXRlO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2ltOiBTaW0gKSB7XG4gICAgc3VwZXIoIHtcbiAgICAgIHRhbmRlbTogVGFuZGVtLkdFTkVSQUxfTU9ERUwuY3JlYXRlVGFuZGVtKCAnc2ltSW5mbycgKSxcbiAgICAgIHBoZXRpb1R5cGU6IFNpbUluZm8uU2ltSW5mb0lPLFxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnQSBjb2xsZWN0aW9uIG9mIGRhdGEgYWJvdXQgdGhlIHJ1bnRpbWUgYW5kIHNpbXVsYXRpb24uIEF2YWlsYWJsZSBpbiB0aGUgc2ltU3RhcnRlZCBQaEVULWlPICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGEgc3RyZWFtIGV2ZW50LCBhcyB3ZWxsIGFzIG9uIGRlbWFuZCBpbiB0aGUgUGhFVC1pTyBzdGF0ZS4nXG4gICAgfSApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggc2ltLnNjcmVlbnMgKSwgJ3NjcmVlbnMgc2hvdWxkIGJlIHNldCBhbmQgYW4gYXJyYXknICk7XG5cbiAgICAvLyBnbG9iYWxzXG4gICAgdGhpcy5wdXRJbmZvKCAndXJsJywgd2luZG93LmxvY2F0aW9uLmhyZWYgKTtcbiAgICB0aGlzLnB1dEluZm8oICdyYW5kb21TZWVkJywgd2luZG93LnBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMucmFuZG9tU2VlZCApO1xuICAgIHRoaXMucHV0SW5mbyggJ3VzZXJBZ2VudCcsIHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50ICk7XG4gICAgdGhpcy5wdXRJbmZvKCAnbGFuZ3VhZ2UnLCB3aW5kb3cubmF2aWdhdG9yLmxhbmd1YWdlICk7XG4gICAgdGhpcy5wdXRJbmZvKCAnd2luZG93JywgYCR7d2luZG93LmlubmVyV2lkdGh9eCR7d2luZG93LmlubmVySGVpZ2h0fWAgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L2JhZC1zaW0tdGV4dFxuICAgIHRoaXMucHV0SW5mbyggJ3JlZmVycmVyJywgZG9jdW1lbnQucmVmZXJyZXIgKTtcblxuICAgIC8vIGZyb20gU2NlbmVyeSBVdGlsc1xuICAgIHRoaXMucHV0SW5mbyggJ2NoZWNrSUUxMVN0ZW5jaWxTdXBwb3J0JywgVXRpbHMuY2hlY2tJRTExU3RlbmNpbFN1cHBvcnQoKSApO1xuICAgIHRoaXMucHV0SW5mbyggJ2lzV2ViR0xTdXBwb3J0ZWQnLCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLndlYmdsID8gVXRpbHMuaXNXZWJHTFN1cHBvcnRlZCA6IGZhbHNlICk7XG5cbiAgICBsZXQgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCB8IG51bGw7XG4gICAgbGV0IGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbiAgICBsZXQgYmFja2luZ1N0b3JlUGl4ZWxSYXRpbzogbnVtYmVyO1xuXG4gICAgY29uc3QgZmxhZ3MgPSBbXTtcblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBwb2ludGVyRW5hYmxlZCBpc24ndCBpbmNsdWRlZCBpbiB0aGUgVHlwZXNjcmlwdCBkZWZpbml0aW9uIG9mIHdpbmRvdy5uYXZpZ2F0b3JcbiAgICBpZiAoIHdpbmRvdy5uYXZpZ2F0b3IucG9pbnRlckVuYWJsZWQgKSB7IGZsYWdzLnB1c2goICdwb2ludGVyRW5hYmxlZCcgKTsgfVxuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIG1zUG9pbnRlckVuYWJsZWQgaXNuJ3QgaW5jbHVkZWQgaW4gdGhlIFR5cGVzY3JpcHQgZGVmaW5pdGlvbiBvZiB3aW5kb3cubmF2aWdhdG9yXG4gICAgaWYgKCB3aW5kb3cubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQgKSB7IGZsYWdzLnB1c2goICdtc1BvaW50ZXJFbmFibGVkJyApOyB9XG4gICAgaWYgKCAhd2luZG93Lm5hdmlnYXRvci5vbkxpbmUgKSB7IGZsYWdzLnB1c2goICdvZmZsaW5lJyApOyB9XG5cbiAgICB0cnkge1xuICAgICAgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcbiAgICAgIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApITtcbiAgICAgIGJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gPSBVdGlscy5iYWNraW5nU3RvcmVQaXhlbFJhdGlvKCBjb250ZXh0ICkhO1xuICAgICAgdGhpcy5wdXRJbmZvKCAncGl4ZWxSYXRpbycsIGAke3dpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDF9LyR7YmFja2luZ1N0b3JlUGl4ZWxSYXRpb31gICk7XG5cbiAgICAgIGlmICggKCB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxICkgLyBiYWNraW5nU3RvcmVQaXhlbFJhdGlvICE9PSAxICkgeyBmbGFncy5wdXNoKCAncGl4ZWxSYXRpb1NjYWxpbmcnICk7IH1cbiAgICB9XG4gICAgY2F0Y2goIGUgKSB7fSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWVtcHR5XG5cbiAgICB0aGlzLnB1dEluZm8oICdmbGFncycsIGZsYWdzLmpvaW4oICcsICcgKSApO1xuXG4gICAgY2FudmFzID0gbnVsbDsgLy8gZGlzcG9zZSBvbmx5IHJlZmVyZW5jZVxuXG4gICAgLy8gZnJvbSBTaW0uanNcbiAgICB0aGlzLnB1dEluZm8oICdzaW1OYW1lJywgc2ltLnNpbU5hbWVQcm9wZXJ0eS52YWx1ZSApO1xuICAgIHRoaXMucHV0SW5mbyggJ3NpbVZlcnNpb24nLCBzaW0udmVyc2lvbiApO1xuICAgIHRoaXMucHV0SW5mbyggJ3JlcG9OYW1lJywgcGFja2FnZUpTT04ubmFtZSApO1xuICAgIHRoaXMucHV0SW5mbyggJ3NjcmVlbnMnLCBzaW0uc2NyZWVucy5tYXAoICggc2NyZWVuOiBBbnlTY3JlZW4gKSA9PiB7XG4gICAgICBjb25zdCBzY3JlZW5PYmplY3Q6IFNjcmVlblN0YXRlID0ge1xuXG4gICAgICAgIC8vIGxpa2VseSBudWxsIGZvciBzaW5nbGUgc2NyZWVuIHNpbXMsIHNvIHVzZSB0aGUgc2ltIG5hbWUgYXMgYSBkZWZhdWx0XG4gICAgICAgIG5hbWU6IHNjcmVlbi5uYW1lUHJvcGVydHkudmFsdWUgfHwgc2ltLnNpbU5hbWVQcm9wZXJ0eS52YWx1ZVxuICAgICAgfTtcbiAgICAgIGlmICggVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCApIHtcbiAgICAgICAgc2NyZWVuT2JqZWN0LnBoZXRpb0lEID0gc2NyZWVuLnRhbmRlbS5waGV0aW9JRDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzY3JlZW5PYmplY3Q7XG4gICAgfSApICk7XG5cbiAgICAvLyBGcm9tIFBoRVQtaU8gY29kZVxuICAgIGlmICggVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCApIHtcbiAgICAgIHRoaXMucHV0SW5mbyggJ3NjcmVlblByb3BlcnR5VmFsdWUnLCBzaW0uc2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eS52YWx1ZS50YW5kZW0ucGhldGlvSUQgKTtcbiAgICAgIHRoaXMucHV0SW5mbyggJ3dyYXBwZXJNZXRhZGF0YScsIHBoZXQucHJlbG9hZHMucGhldGlvLnNpbVN0YXJ0ZWRNZXRhZGF0YSApO1xuICAgICAgdGhpcy5wdXRJbmZvKCAnZGF0YVN0cmVhbVZlcnNpb24nLCBwaGV0LnBoZXRpby5kYXRhU3RyZWFtLlZFUlNJT04gKTtcbiAgICAgIHRoaXMucHV0SW5mbyggJ3BoZXRpb0NvbW1hbmRQcm9jZXNzb3JQcm90b2NvbCcsIHBoZXQucGhldGlvLnBoZXRpb0NvbW1hbmRQcm9jZXNzb3IuUEhFVF9JT19QUk9UT0NPTCApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcHV0SW5mbygga2V5OiBrZXlvZiBTaW1JbmZvU3RhdGUsIHZhbHVlOiBJbnRlbnRpb25hbEFueSApOiB2b2lkIHtcbiAgICBpZiAoIHZhbHVlID09PSB1bmRlZmluZWQgKSB7XG4gICAgICB2YWx1ZSA9ICd7e3VuZGVmaW5lZH19JztcbiAgICB9XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuaW5mby5oYXNPd25Qcm9wZXJ0eSgga2V5ICksIGBrZXkgYWxyZWFkeSBkZWZpbmVkOiAke2tleX1gICk7XG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIEkgZG9uJ3Qga25vdyBob3cgdG8gZW5zdXJlIHRoZSBjb3JyZWN0IHZhbHVlLCBqdXN0IHRoZSBrZXlcbiAgICB0aGlzLmluZm9bIGtleSBdID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIFNpbUluZm9JTyA9IG5ldyBJT1R5cGU8U2ltSW5mbywgU2ltSW5mb1N0YXRlPiggJ1NpbUluZm9JTycsIHtcbiAgICB2YWx1ZVR5cGU6IFNpbUluZm8sXG4gICAgdG9TdGF0ZU9iamVjdDogc2ltSW5mbyA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzaW1OYW1lOiBzaW1JbmZvLmluZm8uc2ltTmFtZSxcbiAgICAgICAgc2NyZWVuczogc2ltSW5mby5pbmZvLnNjcmVlbnMsXG4gICAgICAgIHJlcG9OYW1lOiBzaW1JbmZvLmluZm8ucmVwb05hbWUsXG5cbiAgICAgICAgc2NyZWVuUHJvcGVydHlWYWx1ZTogc2ltSW5mby5pbmZvLnNjcmVlblByb3BlcnR5VmFsdWUsXG4gICAgICAgIGRhdGFTdHJlYW1WZXJzaW9uOiBzaW1JbmZvLmluZm8uZGF0YVN0cmVhbVZlcnNpb24sXG4gICAgICAgIHBoZXRpb0NvbW1hbmRQcm9jZXNzb3JQcm90b2NvbDogc2ltSW5mby5pbmZvLnBoZXRpb0NvbW1hbmRQcm9jZXNzb3JQcm90b2NvbCxcblxuICAgICAgICBzaW1WZXJzaW9uOiBzaW1JbmZvLmluZm8uc2ltVmVyc2lvbixcbiAgICAgICAgd3JhcHBlck1ldGFkYXRhOiBzaW1JbmZvLmluZm8ud3JhcHBlck1ldGFkYXRhLFxuICAgICAgICByYW5kb21TZWVkOiBzaW1JbmZvLmluZm8ucmFuZG9tU2VlZCxcbiAgICAgICAgdXJsOiBzaW1JbmZvLmluZm8udXJsLFxuICAgICAgICB1c2VyQWdlbnQ6IHNpbUluZm8uaW5mby51c2VyQWdlbnQsXG4gICAgICAgIHdpbmRvdzogc2ltSW5mby5pbmZvLndpbmRvdyxcbiAgICAgICAgcmVmZXJyZXI6IHNpbUluZm8uaW5mby5yZWZlcnJlcixcbiAgICAgICAgbGFuZ3VhZ2U6IHNpbUluZm8uaW5mby5sYW5ndWFnZSxcbiAgICAgICAgcGl4ZWxSYXRpbzogc2ltSW5mby5pbmZvLnBpeGVsUmF0aW8sXG4gICAgICAgIGlzV2ViR0xTdXBwb3J0ZWQ6IHNpbUluZm8uaW5mby5pc1dlYkdMU3VwcG9ydGVkLFxuICAgICAgICBjaGVja0lFMTFTdGVuY2lsU3VwcG9ydDogc2ltSW5mby5pbmZvLmNoZWNrSUUxMVN0ZW5jaWxTdXBwb3J0LFxuICAgICAgICBmbGFnczogc2ltSW5mby5pbmZvLmZsYWdzIHx8IG51bGxcbiAgICAgIH07XG4gICAgfSxcblxuICAgIC8vIERvIG5vdCB0cnkgdG8gbG9hZCBpbiBhIFNpbUluZm9cbiAgICBhcHBseVN0YXRlOiBfLm5vb3AsXG5cbiAgICBzdGF0ZVNjaGVtYToge1xuICAgICAgc2ltTmFtZTogU3RyaW5nSU8sXG4gICAgICBzY3JlZW5zOiBBcnJheUlPKCBPYmplY3RMaXRlcmFsSU8gKSxcbiAgICAgIHJlcG9OYW1lOiBTdHJpbmdJTyxcblxuICAgICAgc2NyZWVuUHJvcGVydHlWYWx1ZTogU3RyaW5nSU8sXG4gICAgICB3cmFwcGVyTWV0YWRhdGE6IE51bGxhYmxlSU8oIE9iamVjdExpdGVyYWxJTyApLFxuICAgICAgZGF0YVN0cmVhbVZlcnNpb246IFN0cmluZ0lPLFxuICAgICAgcGhldGlvQ29tbWFuZFByb2Nlc3NvclByb3RvY29sOiBTdHJpbmdJTyxcblxuICAgICAgLy8gUGFydHMgdGhhdCBhcmUgb21pdHRlZCBpbiBBUEkgZ2VuZXJhdGlvblxuICAgICAgc2ltVmVyc2lvbjogTnVsbGFibGVJTyggU3RyaW5nSU8gKSxcbiAgICAgIHJhbmRvbVNlZWQ6IE51bGxhYmxlSU8oIE51bWJlcklPICksXG4gICAgICB1cmw6IE51bGxhYmxlSU8oIFN0cmluZ0lPICksXG4gICAgICB1c2VyQWdlbnQ6IE51bGxhYmxlSU8oIFN0cmluZ0lPICksXG4gICAgICB3aW5kb3c6IE51bGxhYmxlSU8oIFN0cmluZ0lPICksXG4gICAgICByZWZlcnJlcjogTnVsbGFibGVJTyggU3RyaW5nSU8gKSxcbiAgICAgIGxhbmd1YWdlOiBOdWxsYWJsZUlPKCBTdHJpbmdJTyApLFxuICAgICAgcGl4ZWxSYXRpbzogTnVsbGFibGVJTyggU3RyaW5nSU8gKSxcbiAgICAgIGlzV2ViR0xTdXBwb3J0ZWQ6IE51bGxhYmxlSU8oIEJvb2xlYW5JTyApLFxuICAgICAgY2hlY2tJRTExU3RlbmNpbFN1cHBvcnQ6IE51bGxhYmxlSU8oIEJvb2xlYW5JTyApLFxuICAgICAgZmxhZ3M6IE51bGxhYmxlSU8oIFN0cmluZ0lPIClcbiAgICB9LFxuICAgIGFwaVN0YXRlS2V5czogW1xuICAgICAgJ3NjcmVlbnMnLFxuICAgICAgJ3JlcG9OYW1lJyxcbiAgICAgICdkYXRhU3RyZWFtVmVyc2lvbicsXG4gICAgICAncGhldGlvQ29tbWFuZFByb2Nlc3NvclByb3RvY29sJ1xuICAgIF1cbiAgfSApO1xufVxuXG5qb2lzdC5yZWdpc3RlciggJ1NpbUluZm8nLCBTaW1JbmZvICk7XG5leHBvcnQgZGVmYXVsdCBTaW1JbmZvOyJdLCJuYW1lcyI6WyJVdGlscyIsIlBoZXRpb09iamVjdCIsIlRhbmRlbSIsIkFycmF5SU8iLCJCb29sZWFuSU8iLCJJT1R5cGUiLCJOdWxsYWJsZUlPIiwiTnVtYmVySU8iLCJPYmplY3RMaXRlcmFsSU8iLCJTdHJpbmdJTyIsImpvaXN0IiwicGFja2FnZUpTT04iLCJTaW1JbmZvIiwicHV0SW5mbyIsImtleSIsInZhbHVlIiwidW5kZWZpbmVkIiwiYXNzZXJ0IiwiaW5mbyIsImhhc093blByb3BlcnR5Iiwic2ltIiwidGFuZGVtIiwiR0VORVJBTF9NT0RFTCIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1R5cGUiLCJTaW1JbmZvSU8iLCJwaGV0aW9SZWFkT25seSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJBcnJheSIsImlzQXJyYXkiLCJzY3JlZW5zIiwid2luZG93IiwibG9jYXRpb24iLCJocmVmIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJyYW5kb21TZWVkIiwibmF2aWdhdG9yIiwidXNlckFnZW50IiwibGFuZ3VhZ2UiLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJkb2N1bWVudCIsInJlZmVycmVyIiwiY2hlY2tJRTExU3RlbmNpbFN1cHBvcnQiLCJ3ZWJnbCIsImlzV2ViR0xTdXBwb3J0ZWQiLCJjYW52YXMiLCJjb250ZXh0IiwiYmFja2luZ1N0b3JlUGl4ZWxSYXRpbyIsImZsYWdzIiwicG9pbnRlckVuYWJsZWQiLCJwdXNoIiwibXNQb2ludGVyRW5hYmxlZCIsIm9uTGluZSIsImNyZWF0ZUVsZW1lbnQiLCJnZXRDb250ZXh0IiwiZGV2aWNlUGl4ZWxSYXRpbyIsImUiLCJqb2luIiwic2ltTmFtZVByb3BlcnR5IiwidmVyc2lvbiIsIm5hbWUiLCJtYXAiLCJzY3JlZW4iLCJzY3JlZW5PYmplY3QiLCJuYW1lUHJvcGVydHkiLCJQSEVUX0lPX0VOQUJMRUQiLCJwaGV0aW9JRCIsInNlbGVjdGVkU2NyZWVuUHJvcGVydHkiLCJwcmVsb2FkcyIsInBoZXRpbyIsInNpbVN0YXJ0ZWRNZXRhZGF0YSIsImRhdGFTdHJlYW0iLCJWRVJTSU9OIiwicGhldGlvQ29tbWFuZFByb2Nlc3NvciIsIlBIRVRfSU9fUFJPVE9DT0wiLCJ2YWx1ZVR5cGUiLCJ0b1N0YXRlT2JqZWN0Iiwic2ltSW5mbyIsInNpbU5hbWUiLCJyZXBvTmFtZSIsInNjcmVlblByb3BlcnR5VmFsdWUiLCJkYXRhU3RyZWFtVmVyc2lvbiIsInBoZXRpb0NvbW1hbmRQcm9jZXNzb3JQcm90b2NvbCIsInNpbVZlcnNpb24iLCJ3cmFwcGVyTWV0YWRhdGEiLCJ1cmwiLCJwaXhlbFJhdGlvIiwiYXBwbHlTdGF0ZSIsIl8iLCJub29wIiwic3RhdGVTY2hlbWEiLCJhcGlTdGF0ZUtleXMiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Q0FNQyxHQUdELFNBQVNBLEtBQUssUUFBUSw4QkFBOEI7QUFDcEQsT0FBT0Msa0JBQWtCLGtDQUFrQztBQUMzRCxPQUFPQyxZQUFZLDRCQUE0QjtBQUMvQyxPQUFPQyxhQUFhLG1DQUFtQztBQUN2RCxPQUFPQyxlQUFlLHFDQUFxQztBQUMzRCxPQUFPQyxZQUFZLGtDQUFrQztBQUNyRCxPQUFPQyxnQkFBZ0Isc0NBQXNDO0FBQzdELE9BQU9DLGNBQWMsb0NBQW9DO0FBQ3pELE9BQU9DLHFCQUFxQiwyQ0FBMkM7QUFDdkUsT0FBT0MsY0FBYyxvQ0FBb0M7QUFDekQsT0FBT0MsV0FBVyxhQUFhO0FBQy9CLE9BQU9DLGlCQUFpQixtQkFBbUI7QUErQjNDLElBQUEsQUFBTUMsVUFBTixNQUFNQSxnQkFBZ0JYO0lBOEVaWSxRQUFTQyxHQUF1QixFQUFFQyxLQUFxQixFQUFTO1FBQ3RFLElBQUtBLFVBQVVDLFdBQVk7WUFDekJELFFBQVE7UUFDVjtRQUNBRSxVQUFVQSxPQUFRLENBQUMsSUFBSSxDQUFDQyxJQUFJLENBQUNDLGNBQWMsQ0FBRUwsTUFBTyxDQUFDLHFCQUFxQixFQUFFQSxLQUFLO1FBRWpGLDhFQUE4RTtRQUM5RSxJQUFJLENBQUNJLElBQUksQ0FBRUosSUFBSyxHQUFHQztJQUNyQjtJQW5GQSxZQUFvQkssR0FBUSxDQUFHO1FBQzdCLEtBQUssQ0FBRTtZQUNMQyxRQUFRbkIsT0FBT29CLGFBQWEs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