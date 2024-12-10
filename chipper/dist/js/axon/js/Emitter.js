// Copyright 2019-2024, University of Colorado Boulder
/**
 * Event & listener abstraction for a single "event" type. The type provides extra functionality beyond just notifying
 * listeners. It adds PhET-iO instrumentation capabilities as well as validation. For the lightest-weight, fastest
 * solution with the smallest memory footprint, see `TinyEmitter`.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import optionize from '../../phet-core/js/optionize.js';
import IOTypeCache from '../../tandem/js/IOTypeCache.js';
import PhetioDataHandler from '../../tandem/js/PhetioDataHandler.js';
import Tandem from '../../tandem/js/Tandem.js';
import ArrayIO from '../../tandem/js/types/ArrayIO.js';
import FunctionIO from '../../tandem/js/types/FunctionIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import NullableIO from '../../tandem/js/types/NullableIO.js';
import StringIO from '../../tandem/js/types/StringIO.js';
import VoidIO from '../../tandem/js/types/VoidIO.js';
import axon from './axon.js';
import TinyEmitter from './TinyEmitter.js';
// By default, Emitters are not stateful
const PHET_IO_STATE_DEFAULT = false;
let Emitter = class Emitter extends PhetioDataHandler {
    /**
   * Emit to notify listeners
   */ emit(...args) {
        assert && assert(this.tinyEmitter instanceof TinyEmitter, 'Emitter should not emit until constructor complete');
        assert && this.validateArguments(...args);
        // Although this is not the idiomatic pattern (since it is guarded in the phetioStartEvent), this function is
        // called so many times that it is worth the optimization for PhET brand.
        Tandem.PHET_IO_ENABLED && this.isPhetioInstrumented() && this.phetioStartEvent('emitted', {
            data: this.getPhetioData(...args)
        });
        this.tinyEmitter.emit(...args);
        Tandem.PHET_IO_ENABLED && this.isPhetioInstrumented() && this.phetioEndEvent();
    }
    /**
   * Disposes an Emitter. All listeners are removed.
   */ dispose() {
        this.tinyEmitter.dispose();
        super.dispose();
    }
    /**
   * Adds a listener which will be called during emit.
   */ addListener(listener) {
        this.tinyEmitter.addListener(listener);
    }
    /**
   * Removes a listener
   */ removeListener(listener) {
        this.tinyEmitter.removeListener(listener);
    }
    /**
   * Removes all the listeners
   */ removeAllListeners() {
        this.tinyEmitter.removeAllListeners();
    }
    /**
   * Checks whether a listener is registered with this Emitter
   */ hasListener(listener) {
        return this.tinyEmitter.hasListener(listener);
    }
    /**
   * Returns true if there are any listeners.
   */ hasListeners() {
        return this.tinyEmitter.hasListeners();
    }
    /**
   * Returns the number of listeners.
   */ getListenerCount() {
        return this.tinyEmitter.getListenerCount();
    }
    /**
   * Convenience function for debugging a Property's value. It prints the new value on registration and when changed.
   * @param name - debug name to be printed on the console
   * @returns - the handle to the listener added in case it needs to be removed later
   */ debug(name) {
        const listener = (...args)=>console.log(name, ...args);
        this.addListener(listener);
        return listener;
    }
    constructor(providedOptions){
        const options = optionize()({
            reentrantNotificationStrategy: 'stack',
            phetioOuterType: Emitter.EmitterIO,
            phetioState: PHET_IO_STATE_DEFAULT
        }, providedOptions);
        super(options);
        this.tinyEmitter = new TinyEmitter(null, options.hasListenerOrderDependencies, options.reentrantNotificationStrategy);
    }
};
/**
   * PhET-iO Type for Emitter.
   *
   * Providing validators to instrumented Emitters:
   * Instrumented Emitters should have their `validators` for each argument passed via EmitterIO (the phetioType).
   * To provide validators, there are two methods. First, by default each IOType has its own
   * validator that will be used. So specifying an argument object like `{ type: NumberIO }` will automatically use
   * `NumberIO.validator` as the validator. This can be overridden with the `validator` key (second option), like
   * { type: NumberIO, validator: { isValidValue: v=> typeof v === 'number' &&  v < 5 } }`
   * NOTE: currently the implementation is either/or, if a validator is provided via the `validator` key, the validator
   * from the `type` will be ignored.
   * see https://github.com/phetsims/axon/issues/204 for more details.
   *
   * @author Sam Reid (PhET Interactive Simulations)
   * @author Michael Kauzmann (PhET Interactive Simulations)
   * @author Andrew Adare (PhET Interactive Simulations)
   */ Emitter.EmitterIO = (parameterTypes)=>{
    const key = parameterTypes.map(getTypeName).join(',');
    if (!cache.has(key)) {
        cache.set(key, new IOType(`EmitterIO<${parameterTypes.map(getTypeName).join(', ')}>`, {
            valueType: Emitter,
            documentation: 'Emits when an event occurs and calls added listeners.',
            parameterTypes: parameterTypes,
            events: [
                'emitted'
            ],
            metadataDefaults: {
                phetioState: PHET_IO_STATE_DEFAULT
            },
            methods: {
                addListener: {
                    returnType: VoidIO,
                    parameterTypes: [
                        FunctionIO(VoidIO, parameterTypes)
                    ],
                    implementation: Emitter.prototype.addListener,
                    documentation: 'Adds a listener which will be called when the emitter emits.'
                },
                removeListener: {
                    returnType: VoidIO,
                    parameterTypes: [
                        FunctionIO(VoidIO, parameterTypes)
                    ],
                    implementation: Emitter.prototype.removeListener,
                    documentation: 'Remove a listener.'
                },
                emit: {
                    returnType: VoidIO,
                    parameterTypes: parameterTypes,
                    // Match `Emitter.emit`'s dynamic number of arguments
                    implementation: function(...values) {
                        this.emit(...values);
                    },
                    documentation: 'Emits a single event to all listeners.',
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
export { Emitter as default };
const getTypeName = (ioType)=>ioType.typeName;
// {Map.<string, IOType>} - Cache each parameterized IOType so that
// it is only created once.
const cache = new IOTypeCache();
axon.register('Emitter', Emitter);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBFdmVudCAmIGxpc3RlbmVyIGFic3RyYWN0aW9uIGZvciBhIHNpbmdsZSBcImV2ZW50XCIgdHlwZS4gVGhlIHR5cGUgcHJvdmlkZXMgZXh0cmEgZnVuY3Rpb25hbGl0eSBiZXlvbmQganVzdCBub3RpZnlpbmdcbiAqIGxpc3RlbmVycy4gSXQgYWRkcyBQaEVULWlPIGluc3RydW1lbnRhdGlvbiBjYXBhYmlsaXRpZXMgYXMgd2VsbCBhcyB2YWxpZGF0aW9uLiBGb3IgdGhlIGxpZ2h0ZXN0LXdlaWdodCwgZmFzdGVzdFxuICogc29sdXRpb24gd2l0aCB0aGUgc21hbGxlc3QgbWVtb3J5IGZvb3RwcmludCwgc2VlIGBUaW55RW1pdHRlcmAuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IElPVHlwZUNhY2hlIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9JT1R5cGVDYWNoZS5qcyc7XG5pbXBvcnQgUGhldGlvRGF0YUhhbmRsZXIsIHsgUGhldGlvRGF0YUhhbmRsZXJPcHRpb25zIH0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1BoZXRpb0RhdGFIYW5kbGVyLmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgQXJyYXlJTyBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvQXJyYXlJTy5qcyc7XG5pbXBvcnQgRnVuY3Rpb25JTyBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvRnVuY3Rpb25JTy5qcyc7XG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xuaW1wb3J0IE51bGxhYmxlSU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bGxhYmxlSU8uanMnO1xuaW1wb3J0IFN0cmluZ0lPIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9TdHJpbmdJTy5qcyc7XG5pbXBvcnQgVm9pZElPIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9Wb2lkSU8uanMnO1xuaW1wb3J0IGF4b24gZnJvbSAnLi9heG9uLmpzJztcbmltcG9ydCBURW1pdHRlciwgeyBURW1pdHRlckxpc3RlbmVyLCBURW1pdHRlclBhcmFtZXRlciB9IGZyb20gJy4vVEVtaXR0ZXIuanMnO1xuaW1wb3J0IFRpbnlFbWl0dGVyLCB7IFRpbnlFbWl0dGVyT3B0aW9ucyB9IGZyb20gJy4vVGlueUVtaXR0ZXIuanMnO1xuXG4vLyBCeSBkZWZhdWx0LCBFbWl0dGVycyBhcmUgbm90IHN0YXRlZnVsXG5jb25zdCBQSEVUX0lPX1NUQVRFX0RFRkFVTFQgPSBmYWxzZTtcblxudHlwZSBTZWxmT3B0aW9ucyA9IFBpY2s8VGlueUVtaXR0ZXJPcHRpb25zLCAncmVlbnRyYW50Tm90aWZpY2F0aW9uU3RyYXRlZ3knPjtcbmV4cG9ydCB0eXBlIEVtaXR0ZXJPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PFBoZXRpb0RhdGFIYW5kbGVyT3B0aW9ucywgJ3BoZXRpb091dGVyVHlwZSc+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbWl0dGVyPFQgZXh0ZW5kcyBURW1pdHRlclBhcmFtZXRlcltdID0gW10+IGV4dGVuZHMgUGhldGlvRGF0YUhhbmRsZXI8VD4gaW1wbGVtZW50cyBURW1pdHRlcjxUPiB7XG5cbiAgLy8gcHJvdmlkZSBFbWl0dGVyIGZ1bmN0aW9uYWxpdHkgdmlhIGNvbXBvc2l0aW9uXG4gIHByaXZhdGUgcmVhZG9ubHkgdGlueUVtaXR0ZXI6IFRpbnlFbWl0dGVyPFQ+O1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogRW1pdHRlck9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEVtaXR0ZXJPcHRpb25zLCBTZWxmT3B0aW9ucywgUGhldGlvRGF0YUhhbmRsZXJPcHRpb25zPigpKCB7XG4gICAgICByZWVudHJhbnROb3RpZmljYXRpb25TdHJhdGVneTogJ3N0YWNrJyxcblxuICAgICAgcGhldGlvT3V0ZXJUeXBlOiBFbWl0dGVyLkVtaXR0ZXJJTyxcbiAgICAgIHBoZXRpb1N0YXRlOiBQSEVUX0lPX1NUQVRFX0RFRkFVTFRcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIHN1cGVyKCBvcHRpb25zICk7XG4gICAgdGhpcy50aW55RW1pdHRlciA9IG5ldyBUaW55RW1pdHRlciggbnVsbCwgb3B0aW9ucy5oYXNMaXN0ZW5lck9yZGVyRGVwZW5kZW5jaWVzLCBvcHRpb25zLnJlZW50cmFudE5vdGlmaWNhdGlvblN0cmF0ZWd5ICk7XG4gIH1cblxuICAvKipcbiAgICogRW1pdCB0byBub3RpZnkgbGlzdGVuZXJzXG4gICAqL1xuICBwdWJsaWMgZW1pdCggLi4uYXJnczogVCApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnRpbnlFbWl0dGVyIGluc3RhbmNlb2YgVGlueUVtaXR0ZXIsICdFbWl0dGVyIHNob3VsZCBub3QgZW1pdCB1bnRpbCBjb25zdHJ1Y3RvciBjb21wbGV0ZScgKTtcbiAgICBhc3NlcnQgJiYgdGhpcy52YWxpZGF0ZUFyZ3VtZW50cyggLi4uYXJncyApO1xuXG4gICAgLy8gQWx0aG91Z2ggdGhpcyBpcyBub3QgdGhlIGlkaW9tYXRpYyBwYXR0ZXJuIChzaW5jZSBpdCBpcyBndWFyZGVkIGluIHRoZSBwaGV0aW9TdGFydEV2ZW50KSwgdGhpcyBmdW5jdGlvbiBpc1xuICAgIC8vIGNhbGxlZCBzbyBtYW55IHRpbWVzIHRoYXQgaXQgaXMgd29ydGggdGhlIG9wdGltaXphdGlvbiBmb3IgUGhFVCBicmFuZC5cbiAgICBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICYmIHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSAmJiB0aGlzLnBoZXRpb1N0YXJ0RXZlbnQoICdlbWl0dGVkJywge1xuICAgICAgZGF0YTogdGhpcy5nZXRQaGV0aW9EYXRhKCAuLi5hcmdzIClcbiAgICB9ICk7XG5cbiAgICB0aGlzLnRpbnlFbWl0dGVyLmVtaXQoIC4uLmFyZ3MgKTtcblxuICAgIFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgJiYgdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpICYmIHRoaXMucGhldGlvRW5kRXZlbnQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwb3NlcyBhbiBFbWl0dGVyLiBBbGwgbGlzdGVuZXJzIGFyZSByZW1vdmVkLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy50aW55RW1pdHRlci5kaXNwb3NlKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBsaXN0ZW5lciB3aGljaCB3aWxsIGJlIGNhbGxlZCBkdXJpbmcgZW1pdC5cbiAgICovXG4gIHB1YmxpYyBhZGRMaXN0ZW5lciggbGlzdGVuZXI6IFRFbWl0dGVyTGlzdGVuZXI8VD4gKTogdm9pZCB7XG4gICAgdGhpcy50aW55RW1pdHRlci5hZGRMaXN0ZW5lciggbGlzdGVuZXIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgbGlzdGVuZXJcbiAgICovXG4gIHB1YmxpYyByZW1vdmVMaXN0ZW5lciggbGlzdGVuZXI6IFRFbWl0dGVyTGlzdGVuZXI8VD4gKTogdm9pZCB7XG4gICAgdGhpcy50aW55RW1pdHRlci5yZW1vdmVMaXN0ZW5lciggbGlzdGVuZXIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFsbCB0aGUgbGlzdGVuZXJzXG4gICAqL1xuICBwdWJsaWMgcmVtb3ZlQWxsTGlzdGVuZXJzKCk6IHZvaWQge1xuICAgIHRoaXMudGlueUVtaXR0ZXIucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHdoZXRoZXIgYSBsaXN0ZW5lciBpcyByZWdpc3RlcmVkIHdpdGggdGhpcyBFbWl0dGVyXG4gICAqL1xuICBwdWJsaWMgaGFzTGlzdGVuZXIoIGxpc3RlbmVyOiBURW1pdHRlckxpc3RlbmVyPFQ+ICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnRpbnlFbWl0dGVyLmhhc0xpc3RlbmVyKCBsaXN0ZW5lciApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGVyZSBhcmUgYW55IGxpc3RlbmVycy5cbiAgICovXG4gIHB1YmxpYyBoYXNMaXN0ZW5lcnMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMudGlueUVtaXR0ZXIuaGFzTGlzdGVuZXJzKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGxpc3RlbmVycy5cbiAgICovXG4gIHB1YmxpYyBnZXRMaXN0ZW5lckNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMudGlueUVtaXR0ZXIuZ2V0TGlzdGVuZXJDb3VudCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlbmllbmNlIGZ1bmN0aW9uIGZvciBkZWJ1Z2dpbmcgYSBQcm9wZXJ0eSdzIHZhbHVlLiBJdCBwcmludHMgdGhlIG5ldyB2YWx1ZSBvbiByZWdpc3RyYXRpb24gYW5kIHdoZW4gY2hhbmdlZC5cbiAgICogQHBhcmFtIG5hbWUgLSBkZWJ1ZyBuYW1lIHRvIGJlIHByaW50ZWQgb24gdGhlIGNvbnNvbGVcbiAgICogQHJldHVybnMgLSB0aGUgaGFuZGxlIHRvIHRoZSBsaXN0ZW5lciBhZGRlZCBpbiBjYXNlIGl0IG5lZWRzIHRvIGJlIHJlbW92ZWQgbGF0ZXJcbiAgICovXG4gIHB1YmxpYyBkZWJ1ZyggbmFtZTogc3RyaW5nICk6IFRFbWl0dGVyTGlzdGVuZXI8VD4ge1xuICAgIGNvbnN0IGxpc3RlbmVyID0gKCAuLi5hcmdzOiBUICkgPT4gY29uc29sZS5sb2coIG5hbWUsIC4uLmFyZ3MgKTtcbiAgICB0aGlzLmFkZExpc3RlbmVyKCBsaXN0ZW5lciApO1xuICAgIHJldHVybiBsaXN0ZW5lcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBQaEVULWlPIFR5cGUgZm9yIEVtaXR0ZXIuXG4gICAqXG4gICAqIFByb3ZpZGluZyB2YWxpZGF0b3JzIHRvIGluc3RydW1lbnRlZCBFbWl0dGVyczpcbiAgICogSW5zdHJ1bWVudGVkIEVtaXR0ZXJzIHNob3VsZCBoYXZlIHRoZWlyIGB2YWxpZGF0b3JzYCBmb3IgZWFjaCBhcmd1bWVudCBwYXNzZWQgdmlhIEVtaXR0ZXJJTyAodGhlIHBoZXRpb1R5cGUpLlxuICAgKiBUbyBwcm92aWRlIHZhbGlkYXRvcnMsIHRoZXJlIGFyZSB0d28gbWV0aG9kcy4gRmlyc3QsIGJ5IGRlZmF1bHQgZWFjaCBJT1R5cGUgaGFzIGl0cyBvd25cbiAgICogdmFsaWRhdG9yIHRoYXQgd2lsbCBiZSB1c2VkLiBTbyBzcGVjaWZ5aW5nIGFuIGFyZ3VtZW50IG9iamVjdCBsaWtlIGB7IHR5cGU6IE51bWJlcklPIH1gIHdpbGwgYXV0b21hdGljYWxseSB1c2VcbiAgICogYE51bWJlcklPLnZhbGlkYXRvcmAgYXMgdGhlIHZhbGlkYXRvci4gVGhpcyBjYW4gYmUgb3ZlcnJpZGRlbiB3aXRoIHRoZSBgdmFsaWRhdG9yYCBrZXkgKHNlY29uZCBvcHRpb24pLCBsaWtlXG4gICAqIHsgdHlwZTogTnVtYmVySU8sIHZhbGlkYXRvcjogeyBpc1ZhbGlkVmFsdWU6IHY9PiB0eXBlb2YgdiA9PT0gJ251bWJlcicgJiYgIHYgPCA1IH0gfWBcbiAgICogTk9URTogY3VycmVudGx5IHRoZSBpbXBsZW1lbnRhdGlvbiBpcyBlaXRoZXIvb3IsIGlmIGEgdmFsaWRhdG9yIGlzIHByb3ZpZGVkIHZpYSB0aGUgYHZhbGlkYXRvcmAga2V5LCB0aGUgdmFsaWRhdG9yXG4gICAqIGZyb20gdGhlIGB0eXBlYCB3aWxsIGJlIGlnbm9yZWQuXG4gICAqIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXhvbi9pc3N1ZXMvMjA0IGZvciBtb3JlIGRldGFpbHMuXG4gICAqXG4gICAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gICAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAgICogQGF1dGhvciBBbmRyZXcgQWRhcmUgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEVtaXR0ZXJJTyA9ICggcGFyYW1ldGVyVHlwZXM6IElPVHlwZVtdICk6IElPVHlwZSA9PiB7XG5cbiAgICBjb25zdCBrZXkgPSBwYXJhbWV0ZXJUeXBlcy5tYXAoIGdldFR5cGVOYW1lICkuam9pbiggJywnICk7XG5cbiAgICBpZiAoICFjYWNoZS5oYXMoIGtleSApICkge1xuICAgICAgY2FjaGUuc2V0KCBrZXksIG5ldyBJT1R5cGUoIGBFbWl0dGVySU88JHtwYXJhbWV0ZXJUeXBlcy5tYXAoIGdldFR5cGVOYW1lICkuam9pbiggJywgJyApfT5gLCB7XG4gICAgICAgIHZhbHVlVHlwZTogRW1pdHRlcixcbiAgICAgICAgZG9jdW1lbnRhdGlvbjogJ0VtaXRzIHdoZW4gYW4gZXZlbnQgb2NjdXJzIGFuZCBjYWxscyBhZGRlZCBsaXN0ZW5lcnMuJyxcbiAgICAgICAgcGFyYW1ldGVyVHlwZXM6IHBhcmFtZXRlclR5cGVzLFxuICAgICAgICBldmVudHM6IFsgJ2VtaXR0ZWQnIF0sXG4gICAgICAgIG1ldGFkYXRhRGVmYXVsdHM6IHtcbiAgICAgICAgICBwaGV0aW9TdGF0ZTogUEhFVF9JT19TVEFURV9ERUZBVUxUXG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICBhZGRMaXN0ZW5lcjoge1xuICAgICAgICAgICAgcmV0dXJuVHlwZTogVm9pZElPLFxuICAgICAgICAgICAgcGFyYW1ldGVyVHlwZXM6IFsgRnVuY3Rpb25JTyggVm9pZElPLCBwYXJhbWV0ZXJUeXBlcyApIF0sXG4gICAgICAgICAgICBpbXBsZW1lbnRhdGlvbjogRW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIsXG4gICAgICAgICAgICBkb2N1bWVudGF0aW9uOiAnQWRkcyBhIGxpc3RlbmVyIHdoaWNoIHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlIGVtaXR0ZXIgZW1pdHMuJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgcmVtb3ZlTGlzdGVuZXI6IHtcbiAgICAgICAgICAgIHJldHVyblR5cGU6IFZvaWRJTyxcbiAgICAgICAgICAgIHBhcmFtZXRlclR5cGVzOiBbIEZ1bmN0aW9uSU8oIFZvaWRJTywgcGFyYW1ldGVyVHlwZXMgKSBdLFxuICAgICAgICAgICAgaW1wbGVtZW50YXRpb246IEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyLFxuICAgICAgICAgICAgZG9jdW1lbnRhdGlvbjogJ1JlbW92ZSBhIGxpc3RlbmVyLidcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVtaXQ6IHtcbiAgICAgICAgICAgIHJldHVyblR5cGU6IFZvaWRJTyxcbiAgICAgICAgICAgIHBhcmFtZXRlclR5cGVzOiBwYXJhbWV0ZXJUeXBlcyxcblxuICAgICAgICAgICAgLy8gTWF0Y2ggYEVtaXR0ZXIuZW1pdGAncyBkeW5hbWljIG51bWJlciBvZiBhcmd1bWVudHNcbiAgICAgICAgICAgIGltcGxlbWVudGF0aW9uOiBmdW5jdGlvbiggdGhpczogRW1pdHRlcjx1bmtub3duW10+LCAuLi52YWx1ZXM6IHVua25vd25bXSApIHtcbiAgICAgICAgICAgICAgdGhpcy5lbWl0KCAuLi52YWx1ZXMgKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkb2N1bWVudGF0aW9uOiAnRW1pdHMgYSBzaW5nbGUgZXZlbnQgdG8gYWxsIGxpc3RlbmVycy4nLFxuICAgICAgICAgICAgaW52b2NhYmxlRm9yUmVhZE9ubHlFbGVtZW50czogZmFsc2VcbiAgICAgICAgICB9LFxuICAgICAgICAgIGdldFZhbGlkYXRpb25FcnJvcnM6IHtcbiAgICAgICAgICAgIHJldHVyblR5cGU6IEFycmF5SU8oIE51bGxhYmxlSU8oIFN0cmluZ0lPICkgKSxcbiAgICAgICAgICAgIHBhcmFtZXRlclR5cGVzOiBwYXJhbWV0ZXJUeXBlcyxcbiAgICAgICAgICAgIGltcGxlbWVudGF0aW9uOiBmdW5jdGlvbiggdGhpczogRW1pdHRlcjx1bmtub3duW10+LCAuLi52YWx1ZXM6IHVua25vd25bXSApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VmFsaWRhdGlvbkVycm9ycyggLi4udmFsdWVzICk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZG9jdW1lbnRhdGlvbjogJ0NoZWNrcyB0byBzZWUgaWYgdGhlIHByb3Bvc2VkIHZhbHVlcyBhcmUgdmFsaWQuIFJldHVybnMgYW4gYXJyYXkgb2YgbGVuZ3RoIE4gd2hlcmUgZWFjaCBlbGVtZW50IGlzIGFuIGVycm9yIChzdHJpbmcpIG9yIG51bGwgaWYgdGhlIHZhbHVlIGlzIHZhbGlkLidcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gKSApO1xuICAgIH1cbiAgICByZXR1cm4gY2FjaGUuZ2V0KCBrZXkgKSE7XG4gIH07XG59XG5cbmNvbnN0IGdldFR5cGVOYW1lID0gKCBpb1R5cGU6IElPVHlwZSApID0+IGlvVHlwZS50eXBlTmFtZTtcblxuLy8ge01hcC48c3RyaW5nLCBJT1R5cGU+fSAtIENhY2hlIGVhY2ggcGFyYW1ldGVyaXplZCBJT1R5cGUgc28gdGhhdFxuLy8gaXQgaXMgb25seSBjcmVhdGVkIG9uY2UuXG5jb25zdCBjYWNoZSA9IG5ldyBJT1R5cGVDYWNoZTxzdHJpbmc+KCk7XG5cbmF4b24ucmVnaXN0ZXIoICdFbWl0dGVyJywgRW1pdHRlciApOyJdLCJuYW1lcyI6WyJvcHRpb25pemUiLCJJT1R5cGVDYWNoZSIsIlBoZXRpb0RhdGFIYW5kbGVyIiwiVGFuZGVtIiwiQXJyYXlJTyIsIkZ1bmN0aW9uSU8iLCJJT1R5cGUiLCJOdWxsYWJsZUlPIiwiU3RyaW5nSU8iLCJWb2lkSU8iLCJheG9uIiwiVGlueUVtaXR0ZXIiLCJQSEVUX0lPX1NUQVRFX0RFRkFVTFQiLCJFbWl0dGVyIiwiZW1pdCIsImFyZ3MiLCJhc3NlcnQiLCJ0aW55RW1pdHRlciIsInZhbGlkYXRlQXJndW1lbnRzIiwiUEhFVF9JT19FTkFCTEVEIiwiaXNQaGV0aW9JbnN0cnVtZW50ZWQiLCJwaGV0aW9TdGFydEV2ZW50IiwiZGF0YSIsImdldFBoZXRpb0RhdGEiLCJwaGV0aW9FbmRFdmVudCIsImRpc3Bvc2UiLCJhZGRMaXN0ZW5lciIsImxpc3RlbmVyIiwicmVtb3ZlTGlzdGVuZXIiLCJyZW1vdmVBbGxMaXN0ZW5lcnMiLCJoYXNMaXN0ZW5lciIsImhhc0xpc3RlbmVycyIsImdldExpc3RlbmVyQ291bnQiLCJkZWJ1ZyIsIm5hbWUiLCJjb25zb2xlIiwibG9nIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInJlZW50cmFudE5vdGlmaWNhdGlvblN0cmF0ZWd5IiwicGhldGlvT3V0ZXJUeXBlIiwiRW1pdHRlcklPIiwicGhldGlvU3RhdGUiLCJoYXNMaXN0ZW5lck9yZGVyRGVwZW5kZW5jaWVzIiwicGFyYW1ldGVyVHlwZXMiLCJrZXkiLCJtYXAiLCJnZXRUeXBlTmFtZSIsImpvaW4iLCJjYWNoZSIsImhhcyIsInNldCIsInZhbHVlVHlwZSIsImRvY3VtZW50YXRpb24iLCJldmVudHMiLCJtZXRhZGF0YURlZmF1bHRzIiwibWV0aG9kcyIsInJldHVyblR5cGUiLCJpbXBsZW1lbnRhdGlvbiIsInByb3RvdHlwZSIsInZhbHVlcyIsImludm9jYWJsZUZvclJlYWRPbmx5RWxlbWVudHMiLCJnZXRWYWxpZGF0aW9uRXJyb3JzIiwiZ2V0IiwiaW9UeXBlIiwidHlwZU5hbWUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7O0NBT0MsR0FFRCxPQUFPQSxlQUFlLGtDQUFrQztBQUV4RCxPQUFPQyxpQkFBaUIsaUNBQWlDO0FBQ3pELE9BQU9DLHVCQUFxRCx1Q0FBdUM7QUFDbkcsT0FBT0MsWUFBWSw0QkFBNEI7QUFDL0MsT0FBT0MsYUFBYSxtQ0FBbUM7QUFDdkQsT0FBT0MsZ0JBQWdCLHNDQUFzQztBQUM3RCxPQUFPQyxZQUFZLGtDQUFrQztBQUNyRCxPQUFPQyxnQkFBZ0Isc0NBQXNDO0FBQzdELE9BQU9DLGNBQWMsb0NBQW9DO0FBQ3pELE9BQU9DLFlBQVksa0NBQWtDO0FBQ3JELE9BQU9DLFVBQVUsWUFBWTtBQUU3QixPQUFPQyxpQkFBeUMsbUJBQW1CO0FBRW5FLHdDQUF3QztBQUN4QyxNQUFNQyx3QkFBd0I7QUFLZixJQUFBLEFBQU1DLFVBQU4sTUFBTUEsZ0JBQW9EWDtJQWtCdkU7O0dBRUMsR0FDRCxBQUFPWSxLQUFNLEdBQUdDLElBQU8sRUFBUztRQUM5QkMsVUFBVUEsT0FBUSxJQUFJLENBQUNDLFdBQVcsWUFBWU4sYUFBYTtRQUMzREssVUFBVSxJQUFJLENBQUNFLGlCQUFpQixJQUFLSDtRQUVyQyw2R0FBNkc7UUFDN0cseUVBQXlFO1FBQ3pFWixPQUFPZ0IsZUFBZSxJQUFJLElBQUksQ0FBQ0Msb0JBQW9CLE1BQU0sSUFBSSxDQUFDQyxnQkFBZ0IsQ0FBRSxXQUFXO1lBQ3pGQyxNQUFNLElBQUksQ0FBQ0MsYUFBYSxJQUFLUjtRQUMvQjtRQUVBLElBQUksQ0FBQ0UsV0FBVyxDQUFDSCxJQUFJLElBQUtDO1FBRTFCWixPQUFPZ0IsZUFBZSxJQUFJLElBQUksQ0FBQ0Msb0JBQW9CLE1BQU0sSUFBSSxDQUFDSSxjQUFjO0lBQzlFO0lBRUE7O0dBRUMsR0FDRCxBQUFnQkMsVUFB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