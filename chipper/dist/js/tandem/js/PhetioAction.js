// Copyright 2022-2024, University of Colorado Boulder
/**
 * An instrumented class that wraps a function that does "work" that needs to be interoperable with PhET-iO.
 * PhetioAction supports the following features:
 *
 * 1. Data stream support: The function will be wrapped in an `executed` event and added to the data stream, nesting
 * subsequent events the action's "work" cascades to as child events.
 * 2. Interopererability: PhetioActionIO supports the `execute` method so that PhetioAction instances can be executed
 * from the PhET-iO wrapper.
 * 3. It also has an emitter if you want to listen to when the action is done doing its work, https://github.com/phetsims/phet-io/issues/1543
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import Emitter from '../../axon/js/Emitter.js';
import optionize from '../../phet-core/js/optionize.js';
import IOTypeCache from './IOTypeCache.js';
import PhetioDataHandler from './PhetioDataHandler.js';
import PhetioObject from './PhetioObject.js';
import Tandem from './Tandem.js';
import tandemNamespace from './tandemNamespace.js';
import ArrayIO from './types/ArrayIO.js';
import IOType from './types/IOType.js';
import NullableIO from './types/NullableIO.js';
import StringIO from './types/StringIO.js';
import VoidIO from './types/VoidIO.js';
const EMPTY_ARRAY = [];
// By default, PhetioActions are not stateful
const PHET_IO_STATE_DEFAULT = false;
let PhetioAction = class PhetioAction extends PhetioDataHandler {
    /**
   * Invokes the action.
   * @params - expected parameters are based on options.parameters, see constructor
   */ execute(...args) {
        assert && assert(!this.isDisposed, 'should not be called if disposed');
        // We delay the disposal of composed entities to handle reentrant cases of disposing ourself.
        assert && assert(!this.executedEmitter.isDisposed, 'self should not be disposed');
        this.isExecutingCount++;
        assert && super.validateArguments(...args);
        // Although this is not the idiomatic pattern (since it is guarded in the phetioStartEvent), this function is
        // called so many times that it is worth the optimization for PhET brand.
        Tandem.PHET_IO_ENABLED && this.isPhetioInstrumented() && this.phetioStartEvent('executed', {
            data: this.getPhetioData(...args)
        });
        this.action.apply(null, args);
        this.executedEmitter.emit(...args);
        Tandem.PHET_IO_ENABLED && this.isPhetioInstrumented() && this.phetioEndEvent();
        this.isExecutingCount--;
        if (this.disposeOnExecuteCompletion && this.isExecutingCount === 0) {
            this.disposePhetioAction();
            this.disposeOnExecuteCompletion = false;
        }
    }
    /**
   * Note: Be careful about adding disposal logic directly to this function, it is likely preferred to add it to
   * disposePhetioAction instead, see disposeOnExecuteCompletion for details.
   */ dispose() {
        if (this.isExecutingCount > 0) {
            // Defer disposing components until executing is completed, see disposeOnExecuteCompletion.
            this.disposeOnExecuteCompletion = true;
        } else {
            this.disposePhetioAction();
        }
        // Always dispose the object itself, or PhetioObject will assert out.
        super.dispose();
    }
    /**
   * @param action - the function that is called when this PhetioAction occurs
   * @param providedOptions
   */ constructor(action, providedOptions){
        var _options_tandem;
        const options = optionize()({
            // We need to define this here in addition to PhetioDataHandler to pass to executedEmitter
            parameters: EMPTY_ARRAY,
            // PhetioDataHandler
            phetioOuterType: PhetioAction.PhetioActionIO,
            // PhetioObject
            phetioState: PHET_IO_STATE_DEFAULT,
            phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly,
            phetioHighFrequency: PhetioObject.DEFAULT_OPTIONS.phetioHighFrequency,
            phetioEventType: PhetioObject.DEFAULT_OPTIONS.phetioEventType,
            phetioDocumentation: 'A class that wraps a function, adding API to execute that function and data stream capture.'
        }, providedOptions);
        super(options);
        this.action = action;
        this.isExecutingCount = 0;
        this.disposeOnExecuteCompletion = false;
        this.executedEmitter = new Emitter({
            parameters: options.parameters,
            tandem: (_options_tandem = options.tandem) == null ? void 0 : _options_tandem.createTandem('executedEmitter'),
            hasListenerOrderDependencies: options.hasListenerOrderDependencies,
            phetioState: options.phetioState,
            phetioReadOnly: options.phetioReadOnly,
            phetioHighFrequency: options.phetioHighFrequency,
            phetioEventType: options.phetioEventType,
            phetioDocumentation: 'Emitter that emits when this actions work is complete'
        });
        this.disposePhetioAction = ()=>{
            this.executedEmitter.dispose();
        };
    }
};
PhetioAction.PhetioActionIO = (parameterTypes)=>{
    const key = parameterTypes.map(getTypeName).join(',');
    if (!cache.has(key)) {
        cache.set(key, new IOType(`PhetioActionIO<${parameterTypes.map(getTypeName).join(', ')}>`, {
            valueType: PhetioAction,
            documentation: 'Executes when an event occurs',
            events: [
                'executed'
            ],
            parameterTypes: parameterTypes,
            metadataDefaults: {
                phetioState: PHET_IO_STATE_DEFAULT
            },
            methods: {
                execute: {
                    returnType: VoidIO,
                    parameterTypes: parameterTypes,
                    implementation: function(...values) {
                        this.execute(...values);
                    },
                    documentation: 'Executes the function the PhetioAction is wrapping.',
                    invocableForReadOnlyElements: false
                },
                getValidationErrors: {
                    returnType: ArrayIO(NullableIO(StringIO)),
                    parameterTypes: parameterTypes,
                    implementation: function(...values) {
                        return this.getValidationErrors(...values);
                    },
                    documentation: 'Checks to see if the proposed values are valid. Returns an array of length N where each element is an error (string) or null if the value is valid.'
                }
            }
        }));
    }
    return cache.get(key);
};
const getTypeName = (ioType)=>ioType.typeName;
// cache each parameterized IOType so that it is only created once.
const cache = new IOTypeCache();
tandemNamespace.register('PhetioAction', PhetioAction);
export default PhetioAction;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9BY3Rpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQW4gaW5zdHJ1bWVudGVkIGNsYXNzIHRoYXQgd3JhcHMgYSBmdW5jdGlvbiB0aGF0IGRvZXMgXCJ3b3JrXCIgdGhhdCBuZWVkcyB0byBiZSBpbnRlcm9wZXJhYmxlIHdpdGggUGhFVC1pTy5cbiAqIFBoZXRpb0FjdGlvbiBzdXBwb3J0cyB0aGUgZm9sbG93aW5nIGZlYXR1cmVzOlxuICpcbiAqIDEuIERhdGEgc3RyZWFtIHN1cHBvcnQ6IFRoZSBmdW5jdGlvbiB3aWxsIGJlIHdyYXBwZWQgaW4gYW4gYGV4ZWN1dGVkYCBldmVudCBhbmQgYWRkZWQgdG8gdGhlIGRhdGEgc3RyZWFtLCBuZXN0aW5nXG4gKiBzdWJzZXF1ZW50IGV2ZW50cyB0aGUgYWN0aW9uJ3MgXCJ3b3JrXCIgY2FzY2FkZXMgdG8gYXMgY2hpbGQgZXZlbnRzLlxuICogMi4gSW50ZXJvcGVyZXJhYmlsaXR5OiBQaGV0aW9BY3Rpb25JTyBzdXBwb3J0cyB0aGUgYGV4ZWN1dGVgIG1ldGhvZCBzbyB0aGF0IFBoZXRpb0FjdGlvbiBpbnN0YW5jZXMgY2FuIGJlIGV4ZWN1dGVkXG4gKiBmcm9tIHRoZSBQaEVULWlPIHdyYXBwZXIuXG4gKiAzLiBJdCBhbHNvIGhhcyBhbiBlbWl0dGVyIGlmIHlvdSB3YW50IHRvIGxpc3RlbiB0byB3aGVuIHRoZSBhY3Rpb24gaXMgZG9uZSBkb2luZyBpdHMgd29yaywgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vaXNzdWVzLzE1NDNcbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgSU9UeXBlQ2FjaGUgZnJvbSAnLi9JT1R5cGVDYWNoZS5qcyc7XG5pbXBvcnQgUGhldGlvRGF0YUhhbmRsZXIsIHsgUGFyYW1ldGVyLCBQaGV0aW9EYXRhSGFuZGxlck9wdGlvbnMgfSBmcm9tICcuL1BoZXRpb0RhdGFIYW5kbGVyLmpzJztcbmltcG9ydCBQaGV0aW9PYmplY3QgZnJvbSAnLi9QaGV0aW9PYmplY3QuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuL1RhbmRlbS5qcyc7XG5pbXBvcnQgdGFuZGVtTmFtZXNwYWNlIGZyb20gJy4vdGFuZGVtTmFtZXNwYWNlLmpzJztcbmltcG9ydCBBcnJheUlPIGZyb20gJy4vdHlwZXMvQXJyYXlJTy5qcyc7XG5pbXBvcnQgSU9UeXBlIGZyb20gJy4vdHlwZXMvSU9UeXBlLmpzJztcbmltcG9ydCBOdWxsYWJsZUlPIGZyb20gJy4vdHlwZXMvTnVsbGFibGVJTy5qcyc7XG5pbXBvcnQgU3RyaW5nSU8gZnJvbSAnLi90eXBlcy9TdHJpbmdJTy5qcyc7XG5pbXBvcnQgVm9pZElPIGZyb20gJy4vdHlwZXMvVm9pZElPLmpzJztcblxuXG5jb25zdCBFTVBUWV9BUlJBWTogUGFyYW1ldGVyW10gPSBbXTtcblxuLy8gQnkgZGVmYXVsdCwgUGhldGlvQWN0aW9ucyBhcmUgbm90IHN0YXRlZnVsXG5jb25zdCBQSEVUX0lPX1NUQVRFX0RFRkFVTFQgPSBmYWxzZTtcblxuLy8gdW5kZWZpbmVkIGFuZCBuZXZlciBhcmUgbm90IGFsbG93ZWQgYXMgcGFyYW1ldGVycyB0byBQaGV0aW9BY3Rpb25cbnR5cGUgQWN0aW9uUGFyYW1ldGVyID0gRXhjbHVkZTxJbnRlbnRpb25hbEFueSwgdW5kZWZpbmVkIHwgbmV2ZXI+O1xuXG5leHBvcnQgdHlwZSBBY3Rpb25PcHRpb25zID0gU3RyaWN0T21pdDxQaGV0aW9EYXRhSGFuZGxlck9wdGlvbnMsICdwaGV0aW9PdXRlclR5cGUnPjtcblxuY2xhc3MgUGhldGlvQWN0aW9uPFQgZXh0ZW5kcyBBY3Rpb25QYXJhbWV0ZXJbXSA9IFtdPiBleHRlbmRzIFBoZXRpb0RhdGFIYW5kbGVyPFQ+IHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGFjdGlvbjogKCAuLi5hcmdzOiBUICkgPT4gdm9pZDtcblxuICAvLyBLZWVwIHRyYWNrIG9mIGl0IHRoaXMgaW5zdGFuY2UgaXMgY3VycmVudGx5IGV4ZWN1dGluZyBpdHMgYWN0aW9uLCBzZWUgZXhlY3V0ZSgpIGZvciBpbXBsZW1lbnRhdGlvbi4gVGhpcyBuZWVkcyB0b1xuICAvLyBiZSBhIHN0YWNrIGJlY2F1c2UgcmVlbnRyYW50IFBoZXRpb0FjdGlvbiBleGVjdXRlIGNhbGxzIGFyZSBzdXBwb3J0ZWQuXG4gIHByaXZhdGUgaXNFeGVjdXRpbmdDb3VudDogbnVtYmVyO1xuXG4gIC8vIERpc3Bvc2FsIGNhbiBwb3RlbnRpYWxseSBvY2N1ciBmcm9tIHRoZSBhY3Rpb24gdGhhdCBpcyBiZWluZyBleGVjdXRlZC4gSWYgdGhpcyBpcyB0aGUgY2FzZSwgd2Ugc3RpbGwgd2FudCB0byBlbWl0XG4gIC8vIHRoZSBleGVjdXRlZEVtaXR0ZXIgdXBvbiBjb21wbGV0aW9uIG9mIHRoZSBhY3Rpb24sIHNvIGRlZmVyIGRpc3Bvc2FsIG9mIHRoZSBleGVjdXRlZEVtaXR0ZXIgKGFuZFxuICAvLyBkaXNwb3NlUGhldGlvQWN0aW9uIGluIGdlbmVyYWwpLCB1bnRpbCB0aGUgZXhlY3V0ZSgpIGZ1bmN0aW9uIGlzIGNvbXBsZXRlLiBUaGlzIGRvZXNuJ3QgbmVlZCB0byBiZSBhIHN0YWNrIGJlY2F1c2VcbiAgLy8gd2UgZG8gbm90IGFsbG93IHJlZW50cmFudCBQaGV0aW9BY3Rpb25zIChndWFyZGVkIHdpdGggYW4gYXNzZXJ0aW9uIGluIGV4ZWN1dGUoKSkuXG4gIHByaXZhdGUgZGlzcG9zZU9uRXhlY3V0ZUNvbXBsZXRpb246IGJvb2xlYW47XG5cbiAgLy8gQ2FsbGVkIHVwb24gZGlzcG9zYWwgb2YgUGhldGlvQWN0aW9uLCBidXQgaWYgZGlzcG9zZSgpIGlzIGNhbGxlZCB3aGlsZSB0aGUgYWN0aW9uIGlzIGV4ZWN1dGluZywgZGVmZXIgY2FsbGluZyB0aGlzXG4gIC8vIGZ1bmN0aW9uIHVudGlsIHRoZSBleGVjdXRlKCkgZnVuY3Rpb24gaXMgY29tcGxldGUuXG4gIHByaXZhdGUgZGlzcG9zZVBoZXRpb0FjdGlvbjogKCkgPT4gdm9pZDtcblxuICAvLyBUbyBsaXN0ZW4gdG8gd2hlbiB0aGUgYWN0aW9uIGhhcyBjb21wbGV0ZWQuXG4gIHB1YmxpYyByZWFkb25seSBleGVjdXRlZEVtaXR0ZXI6IEVtaXR0ZXI8VD47XG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBQaGV0aW9BY3Rpb25JTyA9ICggcGFyYW1ldGVyVHlwZXM6IElPVHlwZVtdICk6IElPVHlwZSA9PiB7XG4gICAgY29uc3Qga2V5ID0gcGFyYW1ldGVyVHlwZXMubWFwKCBnZXRUeXBlTmFtZSApLmpvaW4oICcsJyApO1xuICAgIGlmICggIWNhY2hlLmhhcygga2V5ICkgKSB7XG4gICAgICBjYWNoZS5zZXQoIGtleSwgbmV3IElPVHlwZSggYFBoZXRpb0FjdGlvbklPPCR7cGFyYW1ldGVyVHlwZXMubWFwKCBnZXRUeXBlTmFtZSApLmpvaW4oICcsICcgKX0+YCwge1xuICAgICAgICB2YWx1ZVR5cGU6IFBoZXRpb0FjdGlvbixcbiAgICAgICAgZG9jdW1lbnRhdGlvbjogJ0V4ZWN1dGVzIHdoZW4gYW4gZXZlbnQgb2NjdXJzJyxcbiAgICAgICAgZXZlbnRzOiBbICdleGVjdXRlZCcgXSxcbiAgICAgICAgcGFyYW1ldGVyVHlwZXM6IHBhcmFtZXRlclR5cGVzLFxuICAgICAgICBtZXRhZGF0YURlZmF1bHRzOiB7XG4gICAgICAgICAgcGhldGlvU3RhdGU6IFBIRVRfSU9fU1RBVEVfREVGQVVMVFxuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgZXhlY3V0ZToge1xuICAgICAgICAgICAgcmV0dXJuVHlwZTogVm9pZElPLFxuICAgICAgICAgICAgcGFyYW1ldGVyVHlwZXM6IHBhcmFtZXRlclR5cGVzLFxuICAgICAgICAgICAgaW1wbGVtZW50YXRpb246IGZ1bmN0aW9uKCB0aGlzOiBQaGV0aW9BY3Rpb248dW5rbm93bltdPiwgLi4udmFsdWVzOiB1bmtub3duW10gKSB7XG4gICAgICAgICAgICAgIHRoaXMuZXhlY3V0ZSggLi4udmFsdWVzICk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZG9jdW1lbnRhdGlvbjogJ0V4ZWN1dGVzIHRoZSBmdW5jdGlvbiB0aGUgUGhldGlvQWN0aW9uIGlzIHdyYXBwaW5nLicsXG4gICAgICAgICAgICBpbnZvY2FibGVGb3JSZWFkT25seUVsZW1lbnRzOiBmYWxzZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgZ2V0VmFsaWRhdGlvbkVycm9yczoge1xuICAgICAgICAgICAgcmV0dXJuVHlwZTogQXJyYXlJTyggTnVsbGFibGVJTyggU3RyaW5nSU8gKSApLFxuICAgICAgICAgICAgcGFyYW1ldGVyVHlwZXM6IHBhcmFtZXRlclR5cGVzLFxuICAgICAgICAgICAgaW1wbGVtZW50YXRpb246IGZ1bmN0aW9uKCB0aGlzOiBFbWl0dGVyPHVua25vd25bXT4sIC4uLnZhbHVlczogdW5rbm93bltdICkge1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRWYWxpZGF0aW9uRXJyb3JzKCAuLi52YWx1ZXMgKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkb2N1bWVudGF0aW9uOiAnQ2hlY2tzIHRvIHNlZSBpZiB0aGUgcHJvcG9zZWQgdmFsdWVzIGFyZSB2YWxpZC4gUmV0dXJucyBhbiBhcnJheSBvZiBsZW5ndGggTiB3aGVyZSBlYWNoIGVsZW1lbnQgaXMgYW4gZXJyb3IgKHN0cmluZykgb3IgbnVsbCBpZiB0aGUgdmFsdWUgaXMgdmFsaWQuJ1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSApICk7XG4gICAgfVxuICAgIHJldHVybiBjYWNoZS5nZXQoIGtleSApITtcbiAgfTtcblxuICAvKipcbiAgICogQHBhcmFtIGFjdGlvbiAtIHRoZSBmdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCB3aGVuIHRoaXMgUGhldGlvQWN0aW9uIG9jY3Vyc1xuICAgKiBAcGFyYW0gcHJvdmlkZWRPcHRpb25zXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGFjdGlvbjogKCAuLi5hcmdzOiBUICkgPT4gdm9pZCwgcHJvdmlkZWRPcHRpb25zPzogQWN0aW9uT3B0aW9ucyApIHtcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEFjdGlvbk9wdGlvbnMsIEVtcHR5U2VsZk9wdGlvbnMsIFBoZXRpb0RhdGFIYW5kbGVyT3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyBXZSBuZWVkIHRvIGRlZmluZSB0aGlzIGhlcmUgaW4gYWRkaXRpb24gdG8gUGhldGlvRGF0YUhhbmRsZXIgdG8gcGFzcyB0byBleGVjdXRlZEVtaXR0ZXJcbiAgICAgIHBhcmFtZXRlcnM6IEVNUFRZX0FSUkFZLFxuXG4gICAgICAvLyBQaGV0aW9EYXRhSGFuZGxlclxuICAgICAgcGhldGlvT3V0ZXJUeXBlOiBQaGV0aW9BY3Rpb24uUGhldGlvQWN0aW9uSU8sXG5cbiAgICAgIC8vIFBoZXRpb09iamVjdFxuICAgICAgcGhldGlvU3RhdGU6IFBIRVRfSU9fU1RBVEVfREVGQVVMVCxcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiBQaGV0aW9PYmplY3QuREVGQVVMVF9PUFRJT05TLnBoZXRpb1JlYWRPbmx5LFxuICAgICAgcGhldGlvSGlnaEZyZXF1ZW5jeTogUGhldGlvT2JqZWN0LkRFRkFVTFRfT1BUSU9OUy5waGV0aW9IaWdoRnJlcXVlbmN5LFxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBQaGV0aW9PYmplY3QuREVGQVVMVF9PUFRJT05TLnBoZXRpb0V2ZW50VHlwZSxcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdBIGNsYXNzIHRoYXQgd3JhcHMgYSBmdW5jdGlvbiwgYWRkaW5nIEFQSSB0byBleGVjdXRlIHRoYXQgZnVuY3Rpb24gYW5kIGRhdGEgc3RyZWFtIGNhcHR1cmUuJ1xuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIHRoaXMuYWN0aW9uID0gYWN0aW9uO1xuXG4gICAgdGhpcy5pc0V4ZWN1dGluZ0NvdW50ID0gMDtcbiAgICB0aGlzLmRpc3Bvc2VPbkV4ZWN1dGVDb21wbGV0aW9uID0gZmFsc2U7XG5cbiAgICB0aGlzLmV4ZWN1dGVkRW1pdHRlciA9IG5ldyBFbWl0dGVyPFQ+KCB7XG4gICAgICBwYXJhbWV0ZXJzOiBvcHRpb25zLnBhcmFtZXRlcnMsXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtPy5jcmVhdGVUYW5kZW0oICdleGVjdXRlZEVtaXR0ZXInICksXG4gICAgICBoYXNMaXN0ZW5lck9yZGVyRGVwZW5kZW5jaWVzOiBvcHRpb25zLmhhc0xpc3RlbmVyT3JkZXJEZXBlbmRlbmNpZXMsXG4gICAgICBwaGV0aW9TdGF0ZTogb3B0aW9ucy5waGV0aW9TdGF0ZSxcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiBvcHRpb25zLnBoZXRpb1JlYWRPbmx5LFxuICAgICAgcGhldGlvSGlnaEZyZXF1ZW5jeTogb3B0aW9ucy5waGV0aW9IaWdoRnJlcXVlbmN5LFxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBvcHRpb25zLnBoZXRpb0V2ZW50VHlwZSxcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdFbWl0dGVyIHRoYXQgZW1pdHMgd2hlbiB0aGlzIGFjdGlvbnMgd29yayBpcyBjb21wbGV0ZSdcbiAgICB9ICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VQaGV0aW9BY3Rpb24gPSAoKSA9PiB7XG4gICAgICB0aGlzLmV4ZWN1dGVkRW1pdHRlci5kaXNwb3NlKCk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnZva2VzIHRoZSBhY3Rpb24uXG4gICAqIEBwYXJhbXMgLSBleHBlY3RlZCBwYXJhbWV0ZXJzIGFyZSBiYXNlZCBvbiBvcHRpb25zLnBhcmFtZXRlcnMsIHNlZSBjb25zdHJ1Y3RvclxuICAgKi9cbiAgcHVibGljIGV4ZWN1dGUoIC4uLmFyZ3M6IFQgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuaXNEaXNwb3NlZCwgJ3Nob3VsZCBub3QgYmUgY2FsbGVkIGlmIGRpc3Bvc2VkJyApO1xuXG4gICAgLy8gV2UgZGVsYXkgdGhlIGRpc3Bvc2FsIG9mIGNvbXBvc2VkIGVudGl0aWVzIHRvIGhhbmRsZSByZWVudHJhbnQgY2FzZXMgb2YgZGlzcG9zaW5nIG91cnNlbGYuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuZXhlY3V0ZWRFbWl0dGVyLmlzRGlzcG9zZWQsICdzZWxmIHNob3VsZCBub3QgYmUgZGlzcG9zZWQnICk7XG5cbiAgICB0aGlzLmlzRXhlY3V0aW5nQ291bnQrKztcblxuICAgIGFzc2VydCAmJiBzdXBlci52YWxpZGF0ZUFyZ3VtZW50cyggLi4uYXJncyApO1xuXG4gICAgLy8gQWx0aG91Z2ggdGhpcyBpcyBub3QgdGhlIGlkaW9tYXRpYyBwYXR0ZXJuIChzaW5jZSBpdCBpcyBndWFyZGVkIGluIHRoZSBwaGV0aW9TdGFydEV2ZW50KSwgdGhpcyBmdW5jdGlvbiBpc1xuICAgIC8vIGNhbGxlZCBzbyBtYW55IHRpbWVzIHRoYXQgaXQgaXMgd29ydGggdGhlIG9wdGltaXphdGlvbiBmb3IgUGhFVCBicmFuZC5cbiAgICBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICYmIHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSAmJiB0aGlzLnBoZXRpb1N0YXJ0RXZlbnQoICdleGVjdXRlZCcsIHtcbiAgICAgIGRhdGE6IHRoaXMuZ2V0UGhldGlvRGF0YSggLi4uYXJncyApXG4gICAgfSApO1xuXG4gICAgdGhpcy5hY3Rpb24uYXBwbHkoIG51bGwsIGFyZ3MgKTtcbiAgICB0aGlzLmV4ZWN1dGVkRW1pdHRlci5lbWl0KCAuLi5hcmdzICk7XG5cbiAgICBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICYmIHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSAmJiB0aGlzLnBoZXRpb0VuZEV2ZW50KCk7XG5cbiAgICB0aGlzLmlzRXhlY3V0aW5nQ291bnQtLTtcblxuICAgIGlmICggdGhpcy5kaXNwb3NlT25FeGVjdXRlQ29tcGxldGlvbiAmJiB0aGlzLmlzRXhlY3V0aW5nQ291bnQgPT09IDAgKSB7XG4gICAgICB0aGlzLmRpc3Bvc2VQaGV0aW9BY3Rpb24oKTtcbiAgICAgIHRoaXMuZGlzcG9zZU9uRXhlY3V0ZUNvbXBsZXRpb24gPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTm90ZTogQmUgY2FyZWZ1bCBhYm91dCBhZGRpbmcgZGlzcG9zYWwgbG9naWMgZGlyZWN0bHkgdG8gdGhpcyBmdW5jdGlvbiwgaXQgaXMgbGlrZWx5IHByZWZlcnJlZCB0byBhZGQgaXQgdG9cbiAgICogZGlzcG9zZVBoZXRpb0FjdGlvbiBpbnN0ZWFkLCBzZWUgZGlzcG9zZU9uRXhlY3V0ZUNvbXBsZXRpb24gZm9yIGRldGFpbHMuXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMuaXNFeGVjdXRpbmdDb3VudCA+IDAgKSB7XG5cbiAgICAgIC8vIERlZmVyIGRpc3Bvc2luZyBjb21wb25lbnRzIHVudGlsIGV4ZWN1dGluZyBpcyBjb21wbGV0ZWQsIHNlZSBkaXNwb3NlT25FeGVjdXRlQ29tcGxldGlvbi5cbiAgICAgIHRoaXMuZGlzcG9zZU9uRXhlY3V0ZUNvbXBsZXRpb24gPSB0cnVlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuZGlzcG9zZVBoZXRpb0FjdGlvbigpO1xuICAgIH1cblxuICAgIC8vIEFsd2F5cyBkaXNwb3NlIHRoZSBvYmplY3QgaXRzZWxmLCBvciBQaGV0aW9PYmplY3Qgd2lsbCBhc3NlcnQgb3V0LlxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5jb25zdCBnZXRUeXBlTmFtZSA9ICggaW9UeXBlOiBJT1R5cGUgKSA9PiBpb1R5cGUudHlwZU5hbWU7XG5cbi8vIGNhY2hlIGVhY2ggcGFyYW1ldGVyaXplZCBJT1R5cGUgc28gdGhhdCBpdCBpcyBvbmx5IGNyZWF0ZWQgb25jZS5cbmNvbnN0IGNhY2hlID0gbmV3IElPVHlwZUNhY2hlPHN0cmluZz4oKTtcblxudGFuZGVtTmFtZXNwYWNlLnJlZ2lzdGVyKCAnUGhldGlvQWN0aW9uJywgUGhldGlvQWN0aW9uICk7XG5leHBvcnQgZGVmYXVsdCBQaGV0aW9BY3Rpb247Il0sIm5hbWVzIjpbIkVtaXR0ZXIiLCJvcHRpb25pemUiLCJJT1R5cGVDYWNoZSIsIlBoZXRpb0RhdGFIYW5kbGVyIiwiUGhldGlvT2JqZWN0IiwiVGFuZGVtIiwidGFuZGVtTmFtZXNwYWNlIiwiQXJyYXlJTyIsIklPVHlwZSIsIk51bGxhYmxlSU8iLCJTdHJpbmdJTyIsIlZvaWRJTyIsIkVNUFRZX0FSUkFZIiwiUEhFVF9JT19TVEFURV9ERUZBVUxUIiwiUGhldGlvQWN0aW9uIiwiZXhlY3V0ZSIsImFyZ3MiLCJhc3NlcnQiLCJpc0Rpc3Bvc2VkIiwiZXhlY3V0ZWRFbWl0dGVyIiwiaXNFeGVjdXRpbmdDb3VudCIsInZhbGlkYXRlQXJndW1lbnRzIiwiUEhFVF9JT19FTkFCTEVEIiwiaXNQaGV0aW9JbnN0cnVtZW50ZWQiLCJwaGV0aW9TdGFydEV2ZW50IiwiZGF0YSIsImdldFBoZXRpb0RhdGEiLCJhY3Rpb24iLCJhcHBseSIsImVtaXQiLCJwaGV0aW9FbmRFdmVudCIsImRpc3Bvc2VPbkV4ZWN1dGVDb21wbGV0aW9uIiwiZGlzcG9zZVBoZXRpb0FjdGlvbiIsImRpc3Bvc2UiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwicGFyYW1ldGVycyIsInBoZXRpb091dGVyVHlwZSIsIlBoZXRpb0FjdGlvbklPIiwicGhldGlvU3RhdGUiLCJwaGV0aW9SZWFkT25seSIsIkRFRkFVTFRfT1BUSU9OUyIsInBoZXRpb0hpZ2hGcmVxdWVuY3kiLCJwaGV0aW9FdmVudFR5cGUiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiaGFzTGlzdGVuZXJPcmRlckRlcGVuZGVuY2llcyIsInBhcmFtZXRlclR5cGVzIiwia2V5IiwibWFwIiwiZ2V0VHlwZU5hbWUiLCJqb2luIiwiY2FjaGUiLCJoYXMiLCJzZXQiLCJ2YWx1ZVR5cGUiLCJkb2N1bWVudGF0aW9uIiwiZXZlbnRzIiwibWV0YWRhdGFEZWZhdWx0cyIsIm1ldGhvZHMiLCJyZXR1cm5UeXBlIiwiaW1wbGVtZW50YXRpb24iLCJ2YWx1ZXMiLCJpbnZvY2FibGVGb3JSZWFkT25seUVsZW1lbnRzIiwiZ2V0VmFsaWRhdGlvbkVycm9ycyIsImdldCIsImlvVHlwZSIsInR5cGVOYW1lIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Q0FXQyxHQUVELE9BQU9BLGFBQWEsMkJBQTJCO0FBQy9DLE9BQU9DLGVBQXFDLGtDQUFrQztBQUc5RSxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBQzNDLE9BQU9DLHVCQUFnRSx5QkFBeUI7QUFDaEcsT0FBT0Msa0JBQWtCLG9CQUFvQjtBQUM3QyxPQUFPQyxZQUFZLGNBQWM7QUFDakMsT0FBT0MscUJBQXFCLHVCQUF1QjtBQUNuRCxPQUFPQyxhQUFhLHFCQUFxQjtBQUN6QyxPQUFPQyxZQUFZLG9CQUFvQjtBQUN2QyxPQUFPQyxnQkFBZ0Isd0JBQXdCO0FBQy9DLE9BQU9DLGNBQWMsc0JBQXNCO0FBQzNDLE9BQU9DLFlBQVksb0JBQW9CO0FBR3ZDLE1BQU1DLGNBQTJCLEVBQUU7QUFFbkMsNkNBQTZDO0FB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