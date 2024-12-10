// Copyright 2020-2024, University of Colorado Boulder
// createObservableArray conforms to the Proxy interface, which is polluted with `any` types.  Therefore we disable
// this rule for this file.
/* eslint-disable @typescript-eslint/no-explicit-any */ /**
 * Creates an object that has the same API as an Array, but also supports notifications and PhET-iO. When an item
 * is added or removed, the lengthProperty changes before elementAddedEmitter or elementRemovedEmitter emit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import arrayRemove from '../../phet-core/js/arrayRemove.js';
import assertMutuallyExclusiveOptions from '../../phet-core/js/assertMutuallyExclusiveOptions.js';
import merge from '../../phet-core/js/merge.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import IOTypeCache from '../../tandem/js/IOTypeCache.js';
import isSettingPhetioStateProperty from '../../tandem/js/isSettingPhetioStateProperty.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import ArrayIO from '../../tandem/js/types/ArrayIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import axon from './axon.js';
import Emitter from './Emitter.js';
import NumberProperty from './NumberProperty.js';
import Validation from './Validation.js';
const createObservableArray = (providedOptions)=>{
    var _options_tandem, _options_tandem1, _options_tandem2, _options_tandem3;
    assertMutuallyExclusiveOptions(providedOptions, [
        'length'
    ], [
        'elements'
    ]);
    const options = optionize()({
        hasListenerOrderDependencies: false,
        // Also supports phetioType or validator options.  If both are supplied, only the phetioType is respected
        length: 0,
        elements: [],
        elementAddedEmitterOptions: {},
        elementRemovedEmitterOptions: {},
        lengthPropertyOptions: {}
    }, providedOptions);
    let emitterParameterOptions = null;
    if (options.phetioType) {
        assert && assert(options.phetioType.typeName.startsWith('ObservableArrayIO'));
        emitterParameterOptions = {
            name: 'value',
            phetioType: options.phetioType.parameterTypes[0]
        };
    } else if (!Validation.getValidatorValidationError(options)) {
        const validator = _.pick(options, Validation.VALIDATOR_KEYS);
        emitterParameterOptions = merge({
            name: 'value'
        }, validator);
    } else {
        emitterParameterOptions = merge({
            name: 'value'
        }, {
            isValidValue: _.stubTrue
        });
    }
    // notifies when an element has been added
    const elementAddedEmitter = new Emitter(combineOptions({
        tandem: (_options_tandem = options.tandem) == null ? void 0 : _options_tandem.createTandem('elementAddedEmitter'),
        parameters: [
            emitterParameterOptions
        ],
        phetioReadOnly: true,
        hasListenerOrderDependencies: options.hasListenerOrderDependencies
    }, options.elementAddedEmitterOptions));
    // notifies when an element has been removed
    const elementRemovedEmitter = new Emitter(combineOptions({
        tandem: (_options_tandem1 = options.tandem) == null ? void 0 : _options_tandem1.createTandem('elementRemovedEmitter'),
        parameters: [
            emitterParameterOptions
        ],
        phetioReadOnly: true,
        hasListenerOrderDependencies: options.hasListenerOrderDependencies
    }, options.elementRemovedEmitterOptions));
    // observe this, but don't set it. Updated when Array modifiers are called (except array.length=...)
    const lengthProperty = new NumberProperty(0, combineOptions({
        numberType: 'Integer',
        tandem: (_options_tandem2 = options.tandem) == null ? void 0 : _options_tandem2.createTandem('lengthProperty'),
        phetioReadOnly: true,
        hasListenerOrderDependencies: options.hasListenerOrderDependencies
    }, options.lengthPropertyOptions));
    // The underlying array which is wrapped by the Proxy
    const targetArray = [];
    // Verify that lengthProperty is updated before listeners are notified, but not when setting PhET-iO State,
    // This is because we cannot specify ordering dependencies between Properties and ObservableArrays,
    assert && elementAddedEmitter.addListener(()=>{
        if (!isSettingPhetioStateProperty.value) {
            assert && assert(lengthProperty.value === targetArray.length, 'lengthProperty out of sync while adding element');
        }
    });
    assert && elementRemovedEmitter.addListener(()=>{
        if (!isSettingPhetioStateProperty.value) {
            assert && assert(lengthProperty.value === targetArray.length, 'lengthProperty out of sync while removing element');
        }
    });
    const deferredActions = [];
    const emitNotification = (emitter, element)=>{
        if (observableArray.notificationsDeferred) {
            observableArray.deferredActions.push(()=>emitter.emit(element));
        } else {
            emitter.emit(element);
        }
    };
    // The Proxy which will intercept method calls and trigger notifications.
    const observableArray = new Proxy(targetArray, {
        /**
     * Trap for getting a property or method.
     * @param array - the targetArray
     * @param key
     * @param receiver
     * @returns - the requested value
     */ get: function(array, key, receiver) {
            assert && assert(array === targetArray, 'array should match the targetArray');
            if (methods.hasOwnProperty(key)) {
                return methods[key];
            } else {
                return Reflect.get(array, key, receiver);
            }
        },
        /**
     * Trap for setting a property value.
     * @param array - the targetArray
     * @param key
     * @param newValue
     * @returns - success
     */ set: function(array, key, newValue) {
            assert && assert(array === targetArray, 'array should match the targetArray');
            const oldValue = array[key];
            let removedElements = null;
            // See which items are removed
            if (key === 'length') {
                removedElements = array.slice(newValue);
            }
            const returnValue = Reflect.set(array, key, newValue);
            // If we're using the bracket operator [index] of Array, then parse the index between the brackets.
            const numberKey = Number(key);
            if (Number.isInteger(numberKey) && numberKey >= 0 && oldValue !== newValue) {
                lengthProperty.value = array.length;
                if (oldValue !== undefined) {
                    emitNotification(elementRemovedEmitter, array[key]);
                }
                if (newValue !== undefined) {
                    emitNotification(elementAddedEmitter, newValue);
                }
            } else if (key === 'length') {
                lengthProperty.value = newValue;
                assert && assert(removedElements, 'removedElements should be defined for key===length');
                removedElements && removedElements.forEach((element)=>emitNotification(elementRemovedEmitter, element));
            }
            return returnValue;
        },
        /**
     * This is the trap for the delete operator.
     */ deleteProperty: function(array, key) {
            assert && assert(array === targetArray, 'array should match the targetArray');
            // If we're using the bracket operator [index] of Array, then parse the index between the brackets.
            const numberKey = Number(key);
            let removed;
            if (Number.isInteger(numberKey) && numberKey >= 0) {
                removed = array[key];
            }
            const returnValue = Reflect.deleteProperty(array, key);
            if (removed !== undefined) {
                emitNotification(elementRemovedEmitter, removed);
            }
            return returnValue;
        }
    });
    // private
    observableArray.targetArray = targetArray;
    observableArray.notificationsDeferred = false;
    observableArray.emitNotification = emitNotification;
    observableArray.deferredActions = deferredActions;
    // public
    observableArray.elementAddedEmitter = elementAddedEmitter;
    observableArray.elementRemovedEmitter = elementRemovedEmitter;
    observableArray.lengthProperty = lengthProperty;
    const init = ()=>{
        if (options.length >= 0) {
            observableArray.length = options.length;
        }
        if (options.elements.length > 0) {
            Array.prototype.push.apply(observableArray, options.elements);
        }
    };
    init();
    //TODO https://github.com/phetsims/axon/issues/334 Move to "prototype" above or drop support
    observableArray.reset = ()=>{
        observableArray.length = 0;
        init();
    };
    /******************************************
   * PhET-iO support
   *******************************************/ if ((_options_tandem3 = options.tandem) == null ? void 0 : _options_tandem3.supplied) {
        assert && assert(options.phetioType);
        observableArray.phetioElementType = options.phetioType.parameterTypes[0];
        // for managing state in phet-io
        // Use the same tandem and phetioState options so it can "masquerade" as the real object.  When PhetioObject is a mixin this can be changed.
        observableArray._observableArrayPhetioObject = new ObservableArrayPhetioObject(observableArray, options);
        if (Tandem.PHET_IO_ENABLED) {
            assert && assert(_.hasIn(window, 'phet.phetio.phetioEngine.phetioStateEngine'), 'PhET-iO Instrumented ObservableArrays must be created once phetioEngine has been constructed');
            const phetioStateEngine = phet.phetio.phetioEngine.phetioStateEngine;
            // On state start, clear out the container and set to defer notifications.
            phetioStateEngine.clearDynamicElementsEmitter.addListener((state, scopeTandem)=>{
                var _observableArray__observableArrayPhetioObject;
                // Only clear if this PhetioDynamicElementContainer is in scope of the state to be set
                if ((_observableArray__observableArrayPhetioObject = observableArray._observableArrayPhetioObject) == null ? void 0 : _observableArray__observableArrayPhetioObject.tandem.hasAncestor(scopeTandem)) {
                    // Clear before deferring, so that removal notifications occur eagerly before state set.
                    observableArray.length = 0;
                    observableArray.setNotificationsDeferred(true);
                }
            });
            // done with state setting
            phetioStateEngine.undeferEmitter.addListener(()=>{
                if (observableArray.notificationsDeferred) {
                    observableArray.setNotificationsDeferred(false);
                }
            });
            // It is possible and often that ObservableArray listeners are responsible for creating dynamic elements, and so
            // we cannot assume that all listeners can be deferred until after setting values. This prevents "impossible set state. . ."
            // assertions.
            phetioStateEngine.addSetStateHelper(()=>{
                // If we have any deferred actions at this point, execute one. Then the PhET-iO State Engine can ask for more
                // if needed next time. It may be better at some point to do more than just one action here (for performance),
                // but it is a balance. Actions here may also have an order dependency expecting a Property to have its new
                // value already, so one at a time seems best for now. Note that PhetioDynamicElementContainer elects to fire
                // as many as possible, since it is more likely that the creation of one dynamic element would cause the
                // creation of another (model element -> view element).
                if (observableArray.deferredActions.length > 0) {
                    observableArray.deferredActions.shift()();
                    return true;
                } else {
                    return false;
                }
            });
        }
    }
    return observableArray;
};
/**
 * Manages state save/load. This implementation uses Proxy and hence cannot be instrumented as a PhetioObject.  This type
 * provides that functionality.
 */ let ObservableArrayPhetioObject = class ObservableArrayPhetioObject extends PhetioObject {
    /**
   * @param observableArray
   * @param [providedOptions] - same as the options to the parent ObservableArrayDef
   */ constructor(observableArray, providedOptions){
        super(providedOptions);
        this.observableArray = observableArray;
    }
};
// Methods shared by all ObservableArrayDef instances
const methods = {
    /******************************************
   * Overridden Array methods
   *******************************************/ pop (...args) {
        const initialLength = this.targetArray.length;
        const returnValue = Array.prototype.pop.apply(this.targetArray, args);
        this.lengthProperty.value = this.length;
        initialLength > 0 && this.emitNotification(this.elementRemovedEmitter, returnValue);
        return returnValue;
    },
    shift (...args) {
        const initialLength = this.targetArray.length;
        const returnValue = Array.prototype.shift.apply(this.targetArray, args);
        this.lengthProperty.value = this.length;
        initialLength > 0 && this.emitNotification(this.elementRemovedEmitter, returnValue);
        return returnValue;
    },
    push (...args) {
        const returnValue = Array.prototype.push.apply(this.targetArray, args);
        this.lengthProperty.value = this.length;
        for(let i = 0; i < arguments.length; i++){
            this.emitNotification(this.elementAddedEmitter, args[i]);
        }
        return returnValue;
    },
    unshift (...args) {
        const returnValue = Array.prototype.unshift.apply(this.targetArray, args);
        this.lengthProperty.value = this.length;
        for(let i = 0; i < args.length; i++){
            this.emitNotification(this.elementAddedEmitter, args[i]);
        }
        return returnValue;
    },
    splice (...args) {
        const returnValue = Array.prototype.splice.apply(this.targetArray, args);
        this.lengthProperty.value = this.length;
        const deletedElements = returnValue;
        for(let i = 2; i < args.length; i++){
            this.emitNotification(this.elementAddedEmitter, args[i]);
        }
        deletedElements.forEach((deletedElement)=>this.emitNotification(this.elementRemovedEmitter, deletedElement));
        return returnValue;
    },
    copyWithin (...args) {
        const before = this.targetArray.slice();
        const returnValue = Array.prototype.copyWithin.apply(this.targetArray, args);
        reportDifference(before, this);
        return returnValue;
    },
    fill (...args) {
        const before = this.targetArray.slice();
        const returnValue = Array.prototype.fill.apply(this.targetArray, args);
        reportDifference(before, this);
        return returnValue;
    },
    /******************************************
   * For compatibility with ObservableArrayDef
   * TODO https://github.com/phetsims/axon/issues/334 consider deleting after migration
   * TODO https://github.com/phetsims/axon/issues/334 if not deleted, rename 'Item' with 'Element'
   *******************************************/ get: function(index) {
        return this[index];
    },
    addItemAddedListener: function(listener) {
        this.elementAddedEmitter.addListener(listener);
    },
    removeItemAddedListener: function(listener) {
        this.elementAddedEmitter.removeListener(listener);
    },
    addItemRemovedListener: function(listener) {
        this.elementRemovedEmitter.addListener(listener);
    },
    removeItemRemovedListener: function(listener) {
        this.elementRemovedEmitter.removeListener(listener);
    },
    add: function(element) {
        this.push(element);
    },
    addAll: function(elements) {
        this.push(...elements);
    },
    remove: function(element) {
        arrayRemove(this, element);
    },
    removeAll: function(elements) {
        elements.forEach((element)=>arrayRemove(this, element));
    },
    clear: function() {
        while(this.length > 0){
            this.pop();
        }
    },
    count: function(predicate) {
        let count = 0;
        for(let i = 0; i < this.length; i++){
            if (predicate(this[i])) {
                count++;
            }
        }
        return count;
    },
    find: function(predicate, fromIndex) {
        assert && fromIndex !== undefined && assert(typeof fromIndex === 'number', 'fromIndex must be numeric, if provided');
        assert && typeof fromIndex === 'number' && assert(fromIndex >= 0 && fromIndex < this.length, `fromIndex out of bounds: ${fromIndex}`);
        return _.find(this, predicate, fromIndex);
    },
    shuffle: function(random) {
        assert && assert(random, 'random must be supplied');
        // preserve the same _array reference in case any clients got a reference to it with getArray()
        const shuffled = random.shuffle(this);
        // Act on the targetArray so that removal and add notifications aren't sent.
        this.targetArray.length = 0;
        Array.prototype.push.apply(this.targetArray, shuffled);
    },
    // TODO https://github.com/phetsims/axon/issues/334 This also seems important to eliminate
    getArrayCopy: function() {
        return this.slice();
    },
    dispose: function() {
        this.elementAddedEmitter.dispose();
        this.elementRemovedEmitter.dispose();
        this.lengthProperty.dispose();
        this._observableArrayPhetioObject && this._observableArrayPhetioObject.dispose();
    },
    /******************************************
   * PhET-iO
   *******************************************/ toStateObject: function() {
        return {
            array: this.map((item)=>this.phetioElementType.toStateObject(item))
        };
    },
    applyState: function(stateObject) {
        assert && assert(this.length === 0, 'ObservableArrays should be cleared at the beginning of state setting.');
        this.length = 0;
        const elements = stateObject.array.map((paramStateObject)=>this.phetioElementType.fromStateObject(paramStateObject));
        this.push(...elements);
    },
    setNotificationsDeferred: function(notificationsDeferred) {
        // Handle the case where a listener causes another element to be added/removed. That new action should notify last.
        if (!notificationsDeferred) {
            while(this.deferredActions.length > 0){
                this.deferredActions.shift()();
            }
        }
        this.notificationsDeferred = notificationsDeferred;
    }
};
/**
 * For copyWithin and fill, which have more complex behavior, we treat the array as a black box, making a shallow copy
 * before the operation in order to identify what has been added and removed.
 */ const reportDifference = (shallowCopy, observableArray)=>{
    const before = shallowCopy;
    const after = observableArray.targetArray.slice();
    for(let i = 0; i < before.length; i++){
        const beforeElement = before[i];
        const afterIndex = after.indexOf(beforeElement);
        if (afterIndex >= 0) {
            before.splice(i, 1);
            after.splice(afterIndex, 1);
            i--;
        }
    }
    before.forEach((element)=>observableArray.emitNotification(observableArray.elementRemovedEmitter, element));
    after.forEach((element)=>observableArray.emitNotification(observableArray.elementAddedEmitter, element));
};
// Cache each parameterized ObservableArrayIO
// based on the parameter type, so that it is only created once.
const cache = new IOTypeCache();
/**
 * ObservableArrayIO is the IOType for ObservableArrayDef. It delegates most of its implementation to ObservableArrayDef.
 * Instead of being a parametric type, it leverages the phetioElementType on ObservableArrayDef.
 */ const ObservableArrayIO = (parameterType)=>{
    if (!cache.has(parameterType)) {
        cache.set(parameterType, new IOType(`ObservableArrayIO<${parameterType.typeName}>`, {
            valueType: ObservableArrayPhetioObject,
            parameterTypes: [
                parameterType
            ],
            toStateObject: (observableArrayPhetioObject)=>observableArrayPhetioObject.observableArray.toStateObject(),
            applyState: (observableArrayPhetioObject, state)=>observableArrayPhetioObject.observableArray.applyState(state),
            stateSchema: {
                array: ArrayIO(parameterType)
            }
        }));
    }
    return cache.get(parameterType);
};
createObservableArray.ObservableArrayIO = ObservableArrayIO;
axon.register('createObservableArray', createObservableArray);
export default createObservableArray;
export { ObservableArrayIO };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vLyBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgY29uZm9ybXMgdG8gdGhlIFByb3h5IGludGVyZmFjZSwgd2hpY2ggaXMgcG9sbHV0ZWQgd2l0aCBgYW55YCB0eXBlcy4gIFRoZXJlZm9yZSB3ZSBkaXNhYmxlXG4vLyB0aGlzIHJ1bGUgZm9yIHRoaXMgZmlsZS5cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnkgKi9cbi8qKlxuICogQ3JlYXRlcyBhbiBvYmplY3QgdGhhdCBoYXMgdGhlIHNhbWUgQVBJIGFzIGFuIEFycmF5LCBidXQgYWxzbyBzdXBwb3J0cyBub3RpZmljYXRpb25zIGFuZCBQaEVULWlPLiBXaGVuIGFuIGl0ZW1cbiAqIGlzIGFkZGVkIG9yIHJlbW92ZWQsIHRoZSBsZW5ndGhQcm9wZXJ0eSBjaGFuZ2VzIGJlZm9yZSBlbGVtZW50QWRkZWRFbWl0dGVyIG9yIGVsZW1lbnRSZW1vdmVkRW1pdHRlciBlbWl0LlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IGFycmF5UmVtb3ZlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9hcnJheVJlbW92ZS5qcyc7XG5pbXBvcnQgYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9hc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMuanMnO1xuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgSU9UeXBlQ2FjaGUgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL0lPVHlwZUNhY2hlLmpzJztcbmltcG9ydCBpc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5IGZyb20gJy4uLy4uL3RhbmRlbS9qcy9pc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5LmpzJztcbmltcG9ydCB7IFBoZXRpb1N0YXRlIH0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3BoZXQtaW8tdHlwZXMuanMnO1xuaW1wb3J0IFBoZXRpb09iamVjdCwgeyBQaGV0aW9PYmplY3RPcHRpb25zIH0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IEFycmF5SU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0FycmF5SU8uanMnO1xuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcbmltcG9ydCBheG9uIGZyb20gJy4vYXhvbi5qcyc7XG5pbXBvcnQgRW1pdHRlciwgeyBFbWl0dGVyT3B0aW9ucyB9IGZyb20gJy4vRW1pdHRlci5qcyc7XG5pbXBvcnQgTnVtYmVyUHJvcGVydHksIHsgTnVtYmVyUHJvcGVydHlPcHRpb25zIH0gZnJvbSAnLi9OdW1iZXJQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi9URW1pdHRlci5qcyc7XG5pbXBvcnQgVmFsaWRhdGlvbiBmcm9tICcuL1ZhbGlkYXRpb24uanMnO1xuXG4vLyBOT1RFOiBJcyB0aGlzIHVwLXRvLWRhdGUgYW5kIGNvcnJlY3Q/IExvb2tzIGxpa2Ugd2UgdGFjayBvbiBwaGV0LWlvIHN0dWZmIGRlcGVuZGluZyBvbiB0aGUgcGhldGlvVHlwZS5cbnR5cGUgT2JzZXJ2YWJsZUFycmF5TGlzdGVuZXI8VD4gPSAoIGVsZW1lbnQ6IFQgKSA9PiB2b2lkO1xudHlwZSBQcmVkaWNhdGU8VD4gPSAoIGVsZW1lbnQ6IFQgKSA9PiBib29sZWFuO1xudHlwZSBPYnNlcnZhYmxlQXJyYXlTdGF0ZU9iamVjdDxUPiA9IHsgYXJyYXk6IGFueVtdIH07IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgLS0gZnV0dXJlcHJvb2YgdHlwZSBwYXJhbSBpZiB3ZSB0eXBlIHRoaXNcbnR5cGUgRmFrZVJhbmRvbTxUPiA9IHsgc2h1ZmZsZTogKCBhcnI6IFRbXSApID0+IFRbXSB9OyAvLyAvLyBXZSBkb24ndCBpbXBvcnQgYmVjYXVzZSBvZiB0aGUgcmVwbyBkZXBlbmRlbmN5XG50eXBlIFNlbGZPcHRpb25zPFQ+ID0ge1xuICBsZW5ndGg/OiBudW1iZXI7XG4gIGVsZW1lbnRzPzogVFtdO1xuICBoYXNMaXN0ZW5lck9yZGVyRGVwZW5kZW5jaWVzPzogYm9vbGVhbjsgLy8gU2VlIFRpbnlFbWl0dGVyLmhhc0xpc3RlbmVyT3JkZXJEZXBlbmRlbmNpZXNcblxuICAvLyBPcHRpb25zIGZvciB0aGUgYXJyYXkncyBjaGlsZCBlbGVtZW50cy4gT21pdHRlZCBvcHRpb25zIGFyZSB0aGUgcmVzcG9uc2liaWxpdHkgb2YgdGhlIGFycmF5LlxuICBlbGVtZW50QWRkZWRFbWl0dGVyT3B0aW9ucz86IFN0cmljdE9taXQ8RW1pdHRlck9wdGlvbnMsICd0YW5kZW0nIHwgJ3BhcmFtZXRlcnMnIHwgJ3BoZXRpb1JlYWRPbmx5Jz47XG4gIGVsZW1lbnRSZW1vdmVkRW1pdHRlck9wdGlvbnM/OiBTdHJpY3RPbWl0PEVtaXR0ZXJPcHRpb25zLCAndGFuZGVtJyB8ICdwYXJhbWV0ZXJzJyB8ICdwaGV0aW9SZWFkT25seSc+O1xuICBsZW5ndGhQcm9wZXJ0eU9wdGlvbnM/OiBTdHJpY3RPbWl0PE51bWJlclByb3BlcnR5T3B0aW9ucywgJ3RhbmRlbScgfCAnbnVtYmVyVHlwZScgfCAncGhldGlvUmVhZE9ubHknPjtcbn07XG5leHBvcnQgdHlwZSBPYnNlcnZhYmxlQXJyYXlPcHRpb25zPFQ+ID0gU2VsZk9wdGlvbnM8VD4gJiBQaGV0aW9PYmplY3RPcHRpb25zO1xuXG50eXBlIE9ic2VydmFibGVBcnJheTxUPiA9IHtcbiAgZ2V0OiAoIGluZGV4OiBudW1iZXIgKSA9PiBUO1xuICBhZGRJdGVtQWRkZWRMaXN0ZW5lcjogKCBsaXN0ZW5lcjogT2JzZXJ2YWJsZUFycmF5TGlzdGVuZXI8VD4gKSA9PiB2b2lkO1xuICByZW1vdmVJdGVtQWRkZWRMaXN0ZW5lcjogKCBsaXN0ZW5lcjogT2JzZXJ2YWJsZUFycmF5TGlzdGVuZXI8VD4gKSA9PiB2b2lkO1xuICBhZGRJdGVtUmVtb3ZlZExpc3RlbmVyOiAoIGxpc3RlbmVyOiBPYnNlcnZhYmxlQXJyYXlMaXN0ZW5lcjxUPiApID0+IHZvaWQ7XG4gIHJlbW92ZUl0ZW1SZW1vdmVkTGlzdGVuZXI6ICggbGlzdGVuZXI6IE9ic2VydmFibGVBcnJheUxpc3RlbmVyPFQ+ICkgPT4gdm9pZDtcbiAgYWRkOiAoIGVsZW1lbnQ6IFQgKSA9PiB2b2lkO1xuICBhZGRBbGw6ICggZWxlbWVudHM6IFRbXSApID0+IHZvaWQ7XG4gIHJlbW92ZTogKCBlbGVtZW50OiBUICkgPT4gdm9pZDtcbiAgcmVtb3ZlQWxsOiAoIGVsZW1lbnRzOiBUW10gKSA9PiB2b2lkO1xuICBjbGVhcjogKCkgPT4gdm9pZDtcbiAgY291bnQ6ICggcHJlZGljYXRlOiBQcmVkaWNhdGU8VD4gKSA9PiBudW1iZXI7XG4gIGZpbmQ6ICggcHJlZGljYXRlOiBQcmVkaWNhdGU8VD4sIGZyb21JbmRleD86IG51bWJlciApID0+IFQgfCB1bmRlZmluZWQ7XG4gIHNodWZmbGU6ICggcmFuZG9tOiBGYWtlUmFuZG9tPFQ+ICkgPT4gdm9pZDtcbiAgZ2V0QXJyYXlDb3B5OiAoKSA9PiBUW107XG4gIGRpc3Bvc2U6ICgpID0+IHZvaWQ7XG4gIHRvU3RhdGVPYmplY3Q6ICgpID0+IE9ic2VydmFibGVBcnJheVN0YXRlT2JqZWN0PFQ+O1xuICBhcHBseVN0YXRlOiAoIHN0YXRlOiBPYnNlcnZhYmxlQXJyYXlTdGF0ZU9iamVjdDxUPiApID0+IHZvaWQ7XG5cbiAgLy8gbGlzdGVuIG9ubHkgcGxlYXNlXG4gIGVsZW1lbnRBZGRlZEVtaXR0ZXI6IFRFbWl0dGVyPFsgVCBdPjtcbiAgZWxlbWVudFJlbW92ZWRFbWl0dGVyOiBURW1pdHRlcjxbIFQgXT47XG4gIGxlbmd0aFByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eTtcblxuICAvL1RPRE8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2F4b24vaXNzdWVzLzMzNCBNb3ZlIHRvIFwicHJvdG90eXBlXCIgYWJvdmUgb3IgZHJvcCBzdXBwb3J0XG4gIHJlc2V0OiAoKSA9PiB2b2lkO1xuXG4gIC8vIFBvc3NpYmx5IHBhc3NlZCB0aHJvdWdoIHRvIHRoZSBFbWl0dGVyXG4gIHBoZXRpb0VsZW1lbnRUeXBlPzogSU9UeXBlO1xufSAmIFRbXTtcblxuLy8gVHlwZWQgZm9yIGludGVybmFsIHVzYWdlXG50eXBlIFByaXZhdGVPYnNlcnZhYmxlQXJyYXk8VD4gPSB7XG4gIC8vIE1ha2UgaXQgcG9zc2libGUgdG8gdXNlIHRoZSB0YXJnZXRBcnJheSBpbiB0aGUgb3ZlcnJpZGRlbiBtZXRob2RzLlxuICB0YXJnZXRBcnJheTogVFtdO1xuXG4gIF9vYnNlcnZhYmxlQXJyYXlQaGV0aW9PYmplY3Q/OiBPYnNlcnZhYmxlQXJyYXlQaGV0aW9PYmplY3Q8VD47XG5cbiAgLy8ga2VlcCB0cmFjayBvZiBsaXN0ZW5lcnMgdG8gYmUgY2FsbGVkIHdoaWxlIGRlZmVycmVkXG4gIGRlZmVycmVkQWN0aW9uczogVm9pZEZ1bmN0aW9uW107XG4gIG5vdGlmaWNhdGlvbnNEZWZlcnJlZDogYm9vbGVhbjtcbiAgZW1pdE5vdGlmaWNhdGlvbjogKCBlbWl0dGVyOiBURW1pdHRlcjxbIFQgXT4sIGVsZW1lbnQ6IFQgKSA9PiB2b2lkO1xuICBzZXROb3RpZmljYXRpb25zRGVmZXJyZWQoIG5vdGlmaWNhdGlvbnNEZWZlcnJlZDogYm9vbGVhbiApOiB2b2lkO1xufSAmIE9ic2VydmFibGVBcnJheTxUPjtcblxuXG5jb25zdCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgPSA8VD4oIHByb3ZpZGVkT3B0aW9ucz86IE9ic2VydmFibGVBcnJheU9wdGlvbnM8VD4gKTogT2JzZXJ2YWJsZUFycmF5PFQ+ID0+IHtcblxuICBhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMoIHByb3ZpZGVkT3B0aW9ucywgWyAnbGVuZ3RoJyBdLCBbICdlbGVtZW50cycgXSApO1xuXG4gIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8T2JzZXJ2YWJsZUFycmF5T3B0aW9uczxUPiwgU2VsZk9wdGlvbnM8VD4sIFBoZXRpb09iamVjdE9wdGlvbnM+KCkoIHtcblxuICAgIGhhc0xpc3RlbmVyT3JkZXJEZXBlbmRlbmNpZXM6IGZhbHNlLFxuXG4gICAgLy8gQWxzbyBzdXBwb3J0cyBwaGV0aW9UeXBlIG9yIHZhbGlkYXRvciBvcHRpb25zLiAgSWYgYm90aCBhcmUgc3VwcGxpZWQsIG9ubHkgdGhlIHBoZXRpb1R5cGUgaXMgcmVzcGVjdGVkXG5cbiAgICBsZW5ndGg6IDAsXG4gICAgZWxlbWVudHM6IFtdLFxuICAgIGVsZW1lbnRBZGRlZEVtaXR0ZXJPcHRpb25zOiB7fSxcbiAgICBlbGVtZW50UmVtb3ZlZEVtaXR0ZXJPcHRpb25zOiB7fSxcbiAgICBsZW5ndGhQcm9wZXJ0eU9wdGlvbnM6IHt9XG4gIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gIGxldCBlbWl0dGVyUGFyYW1ldGVyT3B0aW9ucyA9IG51bGw7XG4gIGlmICggb3B0aW9ucy5waGV0aW9UeXBlICkge1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5waGV0aW9UeXBlLnR5cGVOYW1lLnN0YXJ0c1dpdGgoICdPYnNlcnZhYmxlQXJyYXlJTycgKSApO1xuICAgIGVtaXR0ZXJQYXJhbWV0ZXJPcHRpb25zID0geyBuYW1lOiAndmFsdWUnLCBwaGV0aW9UeXBlOiBvcHRpb25zLnBoZXRpb1R5cGUucGFyYW1ldGVyVHlwZXMhWyAwIF0gfTtcbiAgfVxuICAvLyBOT1RFOiBJbXByb3ZlIHdpdGggVmFsaWRhdGlvblxuICBlbHNlIGlmICggIVZhbGlkYXRpb24uZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCBvcHRpb25zICkgKSB7XG4gICAgY29uc3QgdmFsaWRhdG9yID0gXy5waWNrKCBvcHRpb25zLCBWYWxpZGF0aW9uLlZBTElEQVRPUl9LRVlTICk7XG4gICAgZW1pdHRlclBhcmFtZXRlck9wdGlvbnMgPSBtZXJnZSggeyBuYW1lOiAndmFsdWUnIH0sIHZhbGlkYXRvciApO1xuICB9XG4gIGVsc2Uge1xuICAgIGVtaXR0ZXJQYXJhbWV0ZXJPcHRpb25zID0gbWVyZ2UoIHsgbmFtZTogJ3ZhbHVlJyB9LCB7IGlzVmFsaWRWYWx1ZTogXy5zdHViVHJ1ZSB9ICk7XG4gIH1cblxuICAvLyBub3RpZmllcyB3aGVuIGFuIGVsZW1lbnQgaGFzIGJlZW4gYWRkZWRcbiAgY29uc3QgZWxlbWVudEFkZGVkRW1pdHRlciA9IG5ldyBFbWl0dGVyPFsgVCBdPiggY29tYmluZU9wdGlvbnM8RW1pdHRlck9wdGlvbnM+KCB7XG4gICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAnZWxlbWVudEFkZGVkRW1pdHRlcicgKSxcbiAgICBwYXJhbWV0ZXJzOiBbIGVtaXR0ZXJQYXJhbWV0ZXJPcHRpb25zIF0sXG4gICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXG4gICAgaGFzTGlzdGVuZXJPcmRlckRlcGVuZGVuY2llczogb3B0aW9ucy5oYXNMaXN0ZW5lck9yZGVyRGVwZW5kZW5jaWVzXG4gIH0sIG9wdGlvbnMuZWxlbWVudEFkZGVkRW1pdHRlck9wdGlvbnMgKSApO1xuXG4gIC8vIG5vdGlmaWVzIHdoZW4gYW4gZWxlbWVudCBoYXMgYmVlbiByZW1vdmVkXG4gIGNvbnN0IGVsZW1lbnRSZW1vdmVkRW1pdHRlciA9IG5ldyBFbWl0dGVyPFsgVCBdPiggY29tYmluZU9wdGlvbnM8RW1pdHRlck9wdGlvbnM+KCB7XG4gICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAnZWxlbWVudFJlbW92ZWRFbWl0dGVyJyApLFxuICAgIHBhcmFtZXRlcnM6IFsgZW1pdHRlclBhcmFtZXRlck9wdGlvbnMgXSxcbiAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcbiAgICBoYXNMaXN0ZW5lck9yZGVyRGVwZW5kZW5jaWVzOiBvcHRpb25zLmhhc0xpc3RlbmVyT3JkZXJEZXBlbmRlbmNpZXNcbiAgfSwgb3B0aW9ucy5lbGVtZW50UmVtb3ZlZEVtaXR0ZXJPcHRpb25zICkgKTtcblxuICAvLyBvYnNlcnZlIHRoaXMsIGJ1dCBkb24ndCBzZXQgaXQuIFVwZGF0ZWQgd2hlbiBBcnJheSBtb2RpZmllcnMgYXJlIGNhbGxlZCAoZXhjZXB0IGFycmF5Lmxlbmd0aD0uLi4pXG4gIGNvbnN0IGxlbmd0aFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCBjb21iaW5lT3B0aW9uczxOdW1iZXJQcm9wZXJ0eU9wdGlvbnM+KCB7XG4gICAgbnVtYmVyVHlwZTogJ0ludGVnZXInLFxuICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0/LmNyZWF0ZVRhbmRlbSggJ2xlbmd0aFByb3BlcnR5JyApLFxuICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxuICAgIGhhc0xpc3RlbmVyT3JkZXJEZXBlbmRlbmNpZXM6IG9wdGlvbnMuaGFzTGlzdGVuZXJPcmRlckRlcGVuZGVuY2llc1xuICB9LCBvcHRpb25zLmxlbmd0aFByb3BlcnR5T3B0aW9ucyApICk7XG5cbiAgLy8gVGhlIHVuZGVybHlpbmcgYXJyYXkgd2hpY2ggaXMgd3JhcHBlZCBieSB0aGUgUHJveHlcbiAgY29uc3QgdGFyZ2V0QXJyYXk6IFRbXSA9IFtdO1xuXG4gIC8vIFZlcmlmeSB0aGF0IGxlbmd0aFByb3BlcnR5IGlzIHVwZGF0ZWQgYmVmb3JlIGxpc3RlbmVycyBhcmUgbm90aWZpZWQsIGJ1dCBub3Qgd2hlbiBzZXR0aW5nIFBoRVQtaU8gU3RhdGUsXG4gIC8vIFRoaXMgaXMgYmVjYXVzZSB3ZSBjYW5ub3Qgc3BlY2lmeSBvcmRlcmluZyBkZXBlbmRlbmNpZXMgYmV0d2VlbiBQcm9wZXJ0aWVzIGFuZCBPYnNlcnZhYmxlQXJyYXlzLFxuICBhc3NlcnQgJiYgZWxlbWVudEFkZGVkRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xuICAgIGlmICggIWlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkudmFsdWUgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsZW5ndGhQcm9wZXJ0eS52YWx1ZSA9PT0gdGFyZ2V0QXJyYXkubGVuZ3RoLCAnbGVuZ3RoUHJvcGVydHkgb3V0IG9mIHN5bmMgd2hpbGUgYWRkaW5nIGVsZW1lbnQnICk7XG4gICAgfVxuICB9ICk7XG4gIGFzc2VydCAmJiBlbGVtZW50UmVtb3ZlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcbiAgICBpZiAoICFpc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5LnZhbHVlICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbGVuZ3RoUHJvcGVydHkudmFsdWUgPT09IHRhcmdldEFycmF5Lmxlbmd0aCwgJ2xlbmd0aFByb3BlcnR5IG91dCBvZiBzeW5jIHdoaWxlIHJlbW92aW5nIGVsZW1lbnQnICk7XG4gICAgfVxuICB9ICk7XG5cbiAgY29uc3QgZGVmZXJyZWRBY3Rpb25zOiBWb2lkRnVuY3Rpb25bXSA9IFtdO1xuICBjb25zdCBlbWl0Tm90aWZpY2F0aW9uID0gKCBlbWl0dGVyOiBURW1pdHRlcjxbIFQgXT4sIGVsZW1lbnQ6IFQgKSA9PiB7XG4gICAgaWYgKCBvYnNlcnZhYmxlQXJyYXkubm90aWZpY2F0aW9uc0RlZmVycmVkICkge1xuICAgICAgb2JzZXJ2YWJsZUFycmF5LmRlZmVycmVkQWN0aW9ucy5wdXNoKCAoKSA9PiBlbWl0dGVyLmVtaXQoIGVsZW1lbnQgKSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGVtaXR0ZXIuZW1pdCggZWxlbWVudCApO1xuICAgIH1cbiAgfTtcblxuICAvLyBUaGUgUHJveHkgd2hpY2ggd2lsbCBpbnRlcmNlcHQgbWV0aG9kIGNhbGxzIGFuZCB0cmlnZ2VyIG5vdGlmaWNhdGlvbnMuXG4gIGNvbnN0IG9ic2VydmFibGVBcnJheTogUHJpdmF0ZU9ic2VydmFibGVBcnJheTxUPiA9IG5ldyBQcm94eSggdGFyZ2V0QXJyYXksIHtcblxuICAgIC8qKlxuICAgICAqIFRyYXAgZm9yIGdldHRpbmcgYSBwcm9wZXJ0eSBvciBtZXRob2QuXG4gICAgICogQHBhcmFtIGFycmF5IC0gdGhlIHRhcmdldEFycmF5XG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEBwYXJhbSByZWNlaXZlclxuICAgICAqIEByZXR1cm5zIC0gdGhlIHJlcXVlc3RlZCB2YWx1ZVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24oIGFycmF5OiBUW10sIGtleToga2V5b2YgdHlwZW9mIG1ldGhvZHMsIHJlY2VpdmVyICk6IGFueSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhcnJheSA9PT0gdGFyZ2V0QXJyYXksICdhcnJheSBzaG91bGQgbWF0Y2ggdGhlIHRhcmdldEFycmF5JyApO1xuICAgICAgaWYgKCBtZXRob2RzLmhhc093blByb3BlcnR5KCBrZXkgKSApIHtcbiAgICAgICAgcmV0dXJuIG1ldGhvZHNbIGtleSBdO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBSZWZsZWN0LmdldCggYXJyYXksIGtleSwgcmVjZWl2ZXIgKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVHJhcCBmb3Igc2V0dGluZyBhIHByb3BlcnR5IHZhbHVlLlxuICAgICAqIEBwYXJhbSBhcnJheSAtIHRoZSB0YXJnZXRBcnJheVxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWVcbiAgICAgKiBAcmV0dXJucyAtIHN1Y2Nlc3NcbiAgICAgKi9cbiAgICBzZXQ6IGZ1bmN0aW9uKCBhcnJheTogVFtdLCBrZXk6IHN0cmluZyB8IHN5bWJvbCwgbmV3VmFsdWU6IGFueSApOiBib29sZWFuIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGFycmF5ID09PSB0YXJnZXRBcnJheSwgJ2FycmF5IHNob3VsZCBtYXRjaCB0aGUgdGFyZ2V0QXJyYXknICk7XG4gICAgICBjb25zdCBvbGRWYWx1ZSA9IGFycmF5WyBrZXkgYXMgYW55IF07XG5cbiAgICAgIGxldCByZW1vdmVkRWxlbWVudHMgPSBudWxsO1xuXG4gICAgICAvLyBTZWUgd2hpY2ggaXRlbXMgYXJlIHJlbW92ZWRcbiAgICAgIGlmICgga2V5ID09PSAnbGVuZ3RoJyApIHtcbiAgICAgICAgcmVtb3ZlZEVsZW1lbnRzID0gYXJyYXkuc2xpY2UoIG5ld1ZhbHVlICk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJldHVyblZhbHVlID0gUmVmbGVjdC5zZXQoIGFycmF5LCBrZXksIG5ld1ZhbHVlICk7XG5cbiAgICAgIC8vIElmIHdlJ3JlIHVzaW5nIHRoZSBicmFja2V0IG9wZXJhdG9yIFtpbmRleF0gb2YgQXJyYXksIHRoZW4gcGFyc2UgdGhlIGluZGV4IGJldHdlZW4gdGhlIGJyYWNrZXRzLlxuICAgICAgY29uc3QgbnVtYmVyS2V5ID0gTnVtYmVyKCBrZXkgKTtcbiAgICAgIGlmICggTnVtYmVyLmlzSW50ZWdlciggbnVtYmVyS2V5ICkgJiYgbnVtYmVyS2V5ID49IDAgJiYgb2xkVmFsdWUgIT09IG5ld1ZhbHVlICkge1xuICAgICAgICBsZW5ndGhQcm9wZXJ0eS52YWx1ZSA9IGFycmF5Lmxlbmd0aDtcblxuICAgICAgICBpZiAoIG9sZFZhbHVlICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgZW1pdE5vdGlmaWNhdGlvbiggZWxlbWVudFJlbW92ZWRFbWl0dGVyLCBhcnJheVsga2V5IGFzIGFueSBdICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCBuZXdWYWx1ZSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgIGVtaXROb3RpZmljYXRpb24oIGVsZW1lbnRBZGRlZEVtaXR0ZXIsIG5ld1ZhbHVlICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCBrZXkgPT09ICdsZW5ndGgnICkge1xuICAgICAgICBsZW5ndGhQcm9wZXJ0eS52YWx1ZSA9IG5ld1ZhbHVlO1xuXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHJlbW92ZWRFbGVtZW50cywgJ3JlbW92ZWRFbGVtZW50cyBzaG91bGQgYmUgZGVmaW5lZCBmb3Iga2V5PT09bGVuZ3RoJyApO1xuICAgICAgICByZW1vdmVkRWxlbWVudHMgJiYgcmVtb3ZlZEVsZW1lbnRzLmZvckVhY2goIGVsZW1lbnQgPT4gZW1pdE5vdGlmaWNhdGlvbiggZWxlbWVudFJlbW92ZWRFbWl0dGVyLCBlbGVtZW50ICkgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVGhpcyBpcyB0aGUgdHJhcCBmb3IgdGhlIGRlbGV0ZSBvcGVyYXRvci5cbiAgICAgKi9cbiAgICBkZWxldGVQcm9wZXJ0eTogZnVuY3Rpb24oIGFycmF5OiBUW10sIGtleTogc3RyaW5nIHwgc3ltYm9sICk6IGJvb2xlYW4ge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggYXJyYXkgPT09IHRhcmdldEFycmF5LCAnYXJyYXkgc2hvdWxkIG1hdGNoIHRoZSB0YXJnZXRBcnJheScgKTtcblxuICAgICAgLy8gSWYgd2UncmUgdXNpbmcgdGhlIGJyYWNrZXQgb3BlcmF0b3IgW2luZGV4XSBvZiBBcnJheSwgdGhlbiBwYXJzZSB0aGUgaW5kZXggYmV0d2VlbiB0aGUgYnJhY2tldHMuXG4gICAgICBjb25zdCBudW1iZXJLZXkgPSBOdW1iZXIoIGtleSApO1xuXG4gICAgICBsZXQgcmVtb3ZlZDtcbiAgICAgIGlmICggTnVtYmVyLmlzSW50ZWdlciggbnVtYmVyS2V5ICkgJiYgbnVtYmVyS2V5ID49IDAgKSB7XG4gICAgICAgIHJlbW92ZWQgPSBhcnJheVsga2V5IGFzIGFueSBdO1xuICAgICAgfVxuICAgICAgY29uc3QgcmV0dXJuVmFsdWUgPSBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KCBhcnJheSwga2V5ICk7XG4gICAgICBpZiAoIHJlbW92ZWQgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgZW1pdE5vdGlmaWNhdGlvbiggZWxlbWVudFJlbW92ZWRFbWl0dGVyLCByZW1vdmVkICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICB9XG4gIH0gKSBhcyBQcml2YXRlT2JzZXJ2YWJsZUFycmF5PFQ+O1xuXG4gIC8vIHByaXZhdGVcbiAgb2JzZXJ2YWJsZUFycmF5LnRhcmdldEFycmF5ID0gdGFyZ2V0QXJyYXk7XG4gIG9ic2VydmFibGVBcnJheS5ub3RpZmljYXRpb25zRGVmZXJyZWQgPSBmYWxzZTtcbiAgb2JzZXJ2YWJsZUFycmF5LmVtaXROb3RpZmljYXRpb24gPSBlbWl0Tm90aWZpY2F0aW9uO1xuICBvYnNlcnZhYmxlQXJyYXkuZGVmZXJyZWRBY3Rpb25zID0gZGVmZXJyZWRBY3Rpb25zO1xuXG4gIC8vIHB1YmxpY1xuICBvYnNlcnZhYmxlQXJyYXkuZWxlbWVudEFkZGVkRW1pdHRlciA9IGVsZW1lbnRBZGRlZEVtaXR0ZXI7XG4gIG9ic2VydmFibGVBcnJheS5lbGVtZW50UmVtb3ZlZEVtaXR0ZXIgPSBlbGVtZW50UmVtb3ZlZEVtaXR0ZXI7XG4gIG9ic2VydmFibGVBcnJheS5sZW5ndGhQcm9wZXJ0eSA9IGxlbmd0aFByb3BlcnR5O1xuXG4gIGNvbnN0IGluaXQgPSAoKSA9PiB7XG4gICAgaWYgKCBvcHRpb25zLmxlbmd0aCA+PSAwICkge1xuICAgICAgb2JzZXJ2YWJsZUFycmF5Lmxlbmd0aCA9IG9wdGlvbnMubGVuZ3RoO1xuICAgIH1cbiAgICBpZiAoIG9wdGlvbnMuZWxlbWVudHMubGVuZ3RoID4gMCApIHtcbiAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KCBvYnNlcnZhYmxlQXJyYXksIG9wdGlvbnMuZWxlbWVudHMgKTtcbiAgICB9XG4gIH07XG5cbiAgaW5pdCgpO1xuXG4gIC8vVE9ETyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXhvbi9pc3N1ZXMvMzM0IE1vdmUgdG8gXCJwcm90b3R5cGVcIiBhYm92ZSBvciBkcm9wIHN1cHBvcnRcbiAgb2JzZXJ2YWJsZUFycmF5LnJlc2V0ID0gKCkgPT4ge1xuICAgIG9ic2VydmFibGVBcnJheS5sZW5ndGggPSAwO1xuICAgIGluaXQoKTtcbiAgfTtcblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqIFBoRVQtaU8gc3VwcG9ydFxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgaWYgKCBvcHRpb25zLnRhbmRlbT8uc3VwcGxpZWQgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5waGV0aW9UeXBlICk7XG5cbiAgICBvYnNlcnZhYmxlQXJyYXkucGhldGlvRWxlbWVudFR5cGUgPSBvcHRpb25zLnBoZXRpb1R5cGUucGFyYW1ldGVyVHlwZXMhWyAwIF07XG5cbiAgICAvLyBmb3IgbWFuYWdpbmcgc3RhdGUgaW4gcGhldC1pb1xuICAgIC8vIFVzZSB0aGUgc2FtZSB0YW5kZW0gYW5kIHBoZXRpb1N0YXRlIG9wdGlvbnMgc28gaXQgY2FuIFwibWFzcXVlcmFkZVwiIGFzIHRoZSByZWFsIG9iamVjdC4gIFdoZW4gUGhldGlvT2JqZWN0IGlzIGEgbWl4aW4gdGhpcyBjYW4gYmUgY2hhbmdlZC5cbiAgICBvYnNlcnZhYmxlQXJyYXkuX29ic2VydmFibGVBcnJheVBoZXRpb09iamVjdCA9IG5ldyBPYnNlcnZhYmxlQXJyYXlQaGV0aW9PYmplY3QoIG9ic2VydmFibGVBcnJheSwgb3B0aW9ucyApO1xuXG4gICAgaWYgKCBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICkge1xuXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmhhc0luKCB3aW5kb3csICdwaGV0LnBoZXRpby5waGV0aW9FbmdpbmUucGhldGlvU3RhdGVFbmdpbmUnICksXG4gICAgICAgICdQaEVULWlPIEluc3RydW1lbnRlZCBPYnNlcnZhYmxlQXJyYXlzIG11c3QgYmUgY3JlYXRlZCBvbmNlIHBoZXRpb0VuZ2luZSBoYXMgYmVlbiBjb25zdHJ1Y3RlZCcgKTtcblxuICAgICAgY29uc3QgcGhldGlvU3RhdGVFbmdpbmUgPSBwaGV0LnBoZXRpby5waGV0aW9FbmdpbmUucGhldGlvU3RhdGVFbmdpbmU7XG5cbiAgICAgIC8vIE9uIHN0YXRlIHN0YXJ0LCBjbGVhciBvdXQgdGhlIGNvbnRhaW5lciBhbmQgc2V0IHRvIGRlZmVyIG5vdGlmaWNhdGlvbnMuXG4gICAgICBwaGV0aW9TdGF0ZUVuZ2luZS5jbGVhckR5bmFtaWNFbGVtZW50c0VtaXR0ZXIuYWRkTGlzdGVuZXIoICggc3RhdGU6IFBoZXRpb1N0YXRlLCBzY29wZVRhbmRlbTogVGFuZGVtICkgPT4ge1xuXG4gICAgICAgIC8vIE9ubHkgY2xlYXIgaWYgdGhpcyBQaGV0aW9EeW5hbWljRWxlbWVudENvbnRhaW5lciBpcyBpbiBzY29wZSBvZiB0aGUgc3RhdGUgdG8gYmUgc2V0XG4gICAgICAgIGlmICggb2JzZXJ2YWJsZUFycmF5Ll9vYnNlcnZhYmxlQXJyYXlQaGV0aW9PYmplY3Q/LnRhbmRlbS5oYXNBbmNlc3Rvciggc2NvcGVUYW5kZW0gKSApIHtcblxuICAgICAgICAgIC8vIENsZWFyIGJlZm9yZSBkZWZlcnJpbmcsIHNvIHRoYXQgcmVtb3ZhbCBub3RpZmljYXRpb25zIG9jY3VyIGVhZ2VybHkgYmVmb3JlIHN0YXRlIHNldC5cbiAgICAgICAgICBvYnNlcnZhYmxlQXJyYXkubGVuZ3RoID0gMDtcblxuICAgICAgICAgIG9ic2VydmFibGVBcnJheS5zZXROb3RpZmljYXRpb25zRGVmZXJyZWQoIHRydWUgKTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuXG4gICAgICAvLyBkb25lIHdpdGggc3RhdGUgc2V0dGluZ1xuICAgICAgcGhldGlvU3RhdGVFbmdpbmUudW5kZWZlckVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcbiAgICAgICAgaWYgKCBvYnNlcnZhYmxlQXJyYXkubm90aWZpY2F0aW9uc0RlZmVycmVkICkge1xuICAgICAgICAgIG9ic2VydmFibGVBcnJheS5zZXROb3RpZmljYXRpb25zRGVmZXJyZWQoIGZhbHNlICk7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcblxuICAgICAgLy8gSXQgaXMgcG9zc2libGUgYW5kIG9mdGVuIHRoYXQgT2JzZXJ2YWJsZUFycmF5IGxpc3RlbmVycyBhcmUgcmVzcG9uc2libGUgZm9yIGNyZWF0aW5nIGR5bmFtaWMgZWxlbWVudHMsIGFuZCBzb1xuICAgICAgLy8gd2UgY2Fubm90IGFzc3VtZSB0aGF0IGFsbCBsaXN0ZW5lcnMgY2FuIGJlIGRlZmVycmVkIHVudGlsIGFmdGVyIHNldHRpbmcgdmFsdWVzLiBUaGlzIHByZXZlbnRzIFwiaW1wb3NzaWJsZSBzZXQgc3RhdGUuIC4gLlwiXG4gICAgICAvLyBhc3NlcnRpb25zLlxuICAgICAgcGhldGlvU3RhdGVFbmdpbmUuYWRkU2V0U3RhdGVIZWxwZXIoICgpID0+IHtcblxuICAgICAgICAvLyBJZiB3ZSBoYXZlIGFueSBkZWZlcnJlZCBhY3Rpb25zIGF0IHRoaXMgcG9pbnQsIGV4ZWN1dGUgb25lLiBUaGVuIHRoZSBQaEVULWlPIFN0YXRlIEVuZ2luZSBjYW4gYXNrIGZvciBtb3JlXG4gICAgICAgIC8vIGlmIG5lZWRlZCBuZXh0IHRpbWUuIEl0IG1heSBiZSBiZXR0ZXIgYXQgc29tZSBwb2ludCB0byBkbyBtb3JlIHRoYW4ganVzdCBvbmUgYWN0aW9uIGhlcmUgKGZvciBwZXJmb3JtYW5jZSksXG4gICAgICAgIC8vIGJ1dCBpdCBpcyBhIGJhbGFuY2UuIEFjdGlvbnMgaGVyZSBtYXkgYWxzbyBoYXZlIGFuIG9yZGVyIGRlcGVuZGVuY3kgZXhwZWN0aW5nIGEgUHJvcGVydHkgdG8gaGF2ZSBpdHMgbmV3XG4gICAgICAgIC8vIHZhbHVlIGFscmVhZHksIHNvIG9uZSBhdCBhIHRpbWUgc2VlbXMgYmVzdCBmb3Igbm93LiBOb3RlIHRoYXQgUGhldGlvRHluYW1pY0VsZW1lbnRDb250YWluZXIgZWxlY3RzIHRvIGZpcmVcbiAgICAgICAgLy8gYXMgbWFueSBhcyBwb3NzaWJsZSwgc2luY2UgaXQgaXMgbW9yZSBsaWtlbHkgdGhhdCB0aGUgY3JlYXRpb24gb2Ygb25lIGR5bmFtaWMgZWxlbWVudCB3b3VsZCBjYXVzZSB0aGVcbiAgICAgICAgLy8gY3JlYXRpb24gb2YgYW5vdGhlciAobW9kZWwgZWxlbWVudCAtPiB2aWV3IGVsZW1lbnQpLlxuICAgICAgICBpZiAoIG9ic2VydmFibGVBcnJheS5kZWZlcnJlZEFjdGlvbnMubGVuZ3RoID4gMCApIHtcbiAgICAgICAgICBvYnNlcnZhYmxlQXJyYXkuZGVmZXJyZWRBY3Rpb25zLnNoaWZ0KCkhKCk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9ic2VydmFibGVBcnJheTtcbn07XG5cbi8qKlxuICogTWFuYWdlcyBzdGF0ZSBzYXZlL2xvYWQuIFRoaXMgaW1wbGVtZW50YXRpb24gdXNlcyBQcm94eSBhbmQgaGVuY2UgY2Fubm90IGJlIGluc3RydW1lbnRlZCBhcyBhIFBoZXRpb09iamVjdC4gIFRoaXMgdHlwZVxuICogcHJvdmlkZXMgdGhhdCBmdW5jdGlvbmFsaXR5LlxuICovXG5jbGFzcyBPYnNlcnZhYmxlQXJyYXlQaGV0aW9PYmplY3Q8VD4gZXh0ZW5kcyBQaGV0aW9PYmplY3Qge1xuXG4gIC8vIGludGVybmFsLCBkb24ndCB1c2VcbiAgcHVibGljIG9ic2VydmFibGVBcnJheTogT2JzZXJ2YWJsZUFycmF5PFQ+O1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gb2JzZXJ2YWJsZUFycmF5XG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXSAtIHNhbWUgYXMgdGhlIG9wdGlvbnMgdG8gdGhlIHBhcmVudCBPYnNlcnZhYmxlQXJyYXlEZWZcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggb2JzZXJ2YWJsZUFycmF5OiBPYnNlcnZhYmxlQXJyYXk8VD4sIHByb3ZpZGVkT3B0aW9ucz86IE9ic2VydmFibGVBcnJheU9wdGlvbnM8VD4gKSB7XG5cbiAgICBzdXBlciggcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICB0aGlzLm9ic2VydmFibGVBcnJheSA9IG9ic2VydmFibGVBcnJheTtcbiAgfVxufVxuXG4vLyBNZXRob2RzIHNoYXJlZCBieSBhbGwgT2JzZXJ2YWJsZUFycmF5RGVmIGluc3RhbmNlc1xuY29uc3QgbWV0aG9kczogVGhpc1R5cGU8UHJpdmF0ZU9ic2VydmFibGVBcnJheTx1bmtub3duPj4gPSB7XG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiBPdmVycmlkZGVuIEFycmF5IG1ldGhvZHNcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgcG9wKCAuLi5hcmdzOiBhbnlbXSApOiBhbnkge1xuICAgIGNvbnN0IGluaXRpYWxMZW5ndGggPSB0aGlzLnRhcmdldEFycmF5Lmxlbmd0aDtcbiAgICBjb25zdCByZXR1cm5WYWx1ZSA9IEFycmF5LnByb3RvdHlwZS5wb3AuYXBwbHkoIHRoaXMudGFyZ2V0QXJyYXksIGFyZ3MgYXMgYW55ICk7XG4gICAgdGhpcy5sZW5ndGhQcm9wZXJ0eS52YWx1ZSA9IHRoaXMubGVuZ3RoO1xuICAgIGluaXRpYWxMZW5ndGggPiAwICYmIHRoaXMuZW1pdE5vdGlmaWNhdGlvbiggdGhpcy5lbGVtZW50UmVtb3ZlZEVtaXR0ZXIsIHJldHVyblZhbHVlICk7XG4gICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICB9LFxuXG4gIHNoaWZ0KCAuLi5hcmdzOiBhbnlbXSApOiBhbnkge1xuICAgIGNvbnN0IGluaXRpYWxMZW5ndGggPSB0aGlzLnRhcmdldEFycmF5Lmxlbmd0aDtcbiAgICBjb25zdCByZXR1cm5WYWx1ZSA9IEFycmF5LnByb3RvdHlwZS5zaGlmdC5hcHBseSggdGhpcy50YXJnZXRBcnJheSwgYXJncyBhcyBhbnkgKTtcbiAgICB0aGlzLmxlbmd0aFByb3BlcnR5LnZhbHVlID0gdGhpcy5sZW5ndGg7XG4gICAgaW5pdGlhbExlbmd0aCA+IDAgJiYgdGhpcy5lbWl0Tm90aWZpY2F0aW9uKCB0aGlzLmVsZW1lbnRSZW1vdmVkRW1pdHRlciwgcmV0dXJuVmFsdWUgKTtcbiAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gIH0sXG5cbiAgcHVzaCggLi4uYXJnczogYW55W10gKTogYW55IHtcbiAgICBjb25zdCByZXR1cm5WYWx1ZSA9IEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KCB0aGlzLnRhcmdldEFycmF5LCBhcmdzICk7XG4gICAgdGhpcy5sZW5ndGhQcm9wZXJ0eS52YWx1ZSA9IHRoaXMubGVuZ3RoO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMuZW1pdE5vdGlmaWNhdGlvbiggdGhpcy5lbGVtZW50QWRkZWRFbWl0dGVyLCBhcmdzWyBpIF0gKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICB9LFxuXG4gIHVuc2hpZnQoIC4uLmFyZ3M6IGFueVtdICk6IGFueSB7XG4gICAgY29uc3QgcmV0dXJuVmFsdWUgPSBBcnJheS5wcm90b3R5cGUudW5zaGlmdC5hcHBseSggdGhpcy50YXJnZXRBcnJheSwgYXJncyApO1xuICAgIHRoaXMubGVuZ3RoUHJvcGVydHkudmFsdWUgPSB0aGlzLmxlbmd0aDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrICkge1xuICAgICAgdGhpcy5lbWl0Tm90aWZpY2F0aW9uKCB0aGlzLmVsZW1lbnRBZGRlZEVtaXR0ZXIsIGFyZ3NbIGkgXSApO1xuICAgIH1cbiAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gIH0sXG5cbiAgc3BsaWNlKCAuLi5hcmdzOiBhbnlbXSApOiBhbnkge1xuICAgIGNvbnN0IHJldHVyblZhbHVlID0gQXJyYXkucHJvdG90eXBlLnNwbGljZS5hcHBseSggdGhpcy50YXJnZXRBcnJheSwgYXJncyBhcyBhbnkgKTtcbiAgICB0aGlzLmxlbmd0aFByb3BlcnR5LnZhbHVlID0gdGhpcy5sZW5ndGg7XG4gICAgY29uc3QgZGVsZXRlZEVsZW1lbnRzID0gcmV0dXJuVmFsdWU7XG4gICAgZm9yICggbGV0IGkgPSAyOyBpIDwgYXJncy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMuZW1pdE5vdGlmaWNhdGlvbiggdGhpcy5lbGVtZW50QWRkZWRFbWl0dGVyLCBhcmdzWyBpIF0gKTtcbiAgICB9XG4gICAgZGVsZXRlZEVsZW1lbnRzLmZvckVhY2goIGRlbGV0ZWRFbGVtZW50ID0+IHRoaXMuZW1pdE5vdGlmaWNhdGlvbiggdGhpcy5lbGVtZW50UmVtb3ZlZEVtaXR0ZXIsIGRlbGV0ZWRFbGVtZW50ICkgKTtcbiAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gIH0sXG5cbiAgY29weVdpdGhpbiggLi4uYXJnczogYW55W10gKTogYW55IHtcbiAgICBjb25zdCBiZWZvcmUgPSB0aGlzLnRhcmdldEFycmF5LnNsaWNlKCk7XG4gICAgY29uc3QgcmV0dXJuVmFsdWUgPSBBcnJheS5wcm90b3R5cGUuY29weVdpdGhpbi5hcHBseSggdGhpcy50YXJnZXRBcnJheSwgYXJncyBhcyBhbnkgKTtcbiAgICByZXBvcnREaWZmZXJlbmNlKCBiZWZvcmUsIHRoaXMgKTtcbiAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gIH0sXG5cbiAgZmlsbCggLi4uYXJnczogYW55W10gKTogYW55IHtcbiAgICBjb25zdCBiZWZvcmUgPSB0aGlzLnRhcmdldEFycmF5LnNsaWNlKCk7XG4gICAgY29uc3QgcmV0dXJuVmFsdWUgPSBBcnJheS5wcm90b3R5cGUuZmlsbC5hcHBseSggdGhpcy50YXJnZXRBcnJheSwgYXJncyBhcyBhbnkgKTtcbiAgICByZXBvcnREaWZmZXJlbmNlKCBiZWZvcmUsIHRoaXMgKTtcbiAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gIH0sXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiBGb3IgY29tcGF0aWJpbGl0eSB3aXRoIE9ic2VydmFibGVBcnJheURlZlxuICAgKiBUT0RPIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9heG9uL2lzc3Vlcy8zMzQgY29uc2lkZXIgZGVsZXRpbmcgYWZ0ZXIgbWlncmF0aW9uXG4gICAqIFRPRE8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2F4b24vaXNzdWVzLzMzNCBpZiBub3QgZGVsZXRlZCwgcmVuYW1lICdJdGVtJyB3aXRoICdFbGVtZW50J1xuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgZ2V0OiBmdW5jdGlvbiggaW5kZXg6IG51bWJlciApIHsgcmV0dXJuIHRoaXNbIGluZGV4IF07IH0sXG4gIGFkZEl0ZW1BZGRlZExpc3RlbmVyOiBmdW5jdGlvbiggbGlzdGVuZXI6IE9ic2VydmFibGVBcnJheUxpc3RlbmVyPGFueT4gKSB7IHRoaXMuZWxlbWVudEFkZGVkRW1pdHRlci5hZGRMaXN0ZW5lciggbGlzdGVuZXIgKTsgfSxcbiAgcmVtb3ZlSXRlbUFkZGVkTGlzdGVuZXI6IGZ1bmN0aW9uKCBsaXN0ZW5lcjogT2JzZXJ2YWJsZUFycmF5TGlzdGVuZXI8YW55PiApIHsgdGhpcy5lbGVtZW50QWRkZWRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCBsaXN0ZW5lciApOyB9LFxuICBhZGRJdGVtUmVtb3ZlZExpc3RlbmVyOiBmdW5jdGlvbiggbGlzdGVuZXI6IE9ic2VydmFibGVBcnJheUxpc3RlbmVyPGFueT4gKSB7IHRoaXMuZWxlbWVudFJlbW92ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBsaXN0ZW5lciApOyB9LFxuICByZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyOiBmdW5jdGlvbiggbGlzdGVuZXI6IE9ic2VydmFibGVBcnJheUxpc3RlbmVyPGFueT4gKSB7IHRoaXMuZWxlbWVudFJlbW92ZWRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCBsaXN0ZW5lciApOyB9LFxuICBhZGQ6IGZ1bmN0aW9uKCBlbGVtZW50OiBhbnkgKSB7IHRoaXMucHVzaCggZWxlbWVudCApOyB9LFxuICBhZGRBbGw6IGZ1bmN0aW9uKCBlbGVtZW50czogYW55W10gKSB7IHRoaXMucHVzaCggLi4uZWxlbWVudHMgKTsgfSxcbiAgcmVtb3ZlOiBmdW5jdGlvbiggZWxlbWVudDogYW55ICkgeyBhcnJheVJlbW92ZSggdGhpcywgZWxlbWVudCApOyB9LFxuICByZW1vdmVBbGw6IGZ1bmN0aW9uKCBlbGVtZW50czogYW55W10gKSB7XG4gICAgZWxlbWVudHMuZm9yRWFjaCggZWxlbWVudCA9PiBhcnJheVJlbW92ZSggdGhpcywgZWxlbWVudCApICk7XG4gIH0sXG4gIGNsZWFyOiBmdW5jdGlvbigpIHtcbiAgICB3aGlsZSAoIHRoaXMubGVuZ3RoID4gMCApIHtcbiAgICAgIHRoaXMucG9wKCk7XG4gICAgfVxuICB9LFxuICBjb3VudDogZnVuY3Rpb24oIHByZWRpY2F0ZTogUHJlZGljYXRlPGFueT4gKSB7XG4gICAgbGV0IGNvdW50ID0gMDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYgKCBwcmVkaWNhdGUoIHRoaXNbIGkgXSApICkge1xuICAgICAgICBjb3VudCsrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY291bnQ7XG4gIH0sXG4gIGZpbmQ6IGZ1bmN0aW9uKCBwcmVkaWNhdGU6IFByZWRpY2F0ZTxhbnk+LCBmcm9tSW5kZXg/OiBudW1iZXIgKSB7XG4gICAgYXNzZXJ0ICYmICggZnJvbUluZGV4ICE9PSB1bmRlZmluZWQgKSAmJiBhc3NlcnQoIHR5cGVvZiBmcm9tSW5kZXggPT09ICdudW1iZXInLCAnZnJvbUluZGV4IG11c3QgYmUgbnVtZXJpYywgaWYgcHJvdmlkZWQnICk7XG4gICAgYXNzZXJ0ICYmICggdHlwZW9mIGZyb21JbmRleCA9PT0gJ251bWJlcicgKSAmJiBhc3NlcnQoIGZyb21JbmRleCA+PSAwICYmIGZyb21JbmRleCA8IHRoaXMubGVuZ3RoLFxuICAgICAgYGZyb21JbmRleCBvdXQgb2YgYm91bmRzOiAke2Zyb21JbmRleH1gICk7XG4gICAgcmV0dXJuIF8uZmluZCggdGhpcywgcHJlZGljYXRlLCBmcm9tSW5kZXggKTtcbiAgfSxcbiAgc2h1ZmZsZTogZnVuY3Rpb24oIHJhbmRvbTogRmFrZVJhbmRvbTxhbnk+ICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJhbmRvbSwgJ3JhbmRvbSBtdXN0IGJlIHN1cHBsaWVkJyApO1xuXG4gICAgLy8gcHJlc2VydmUgdGhlIHNhbWUgX2FycmF5IHJlZmVyZW5jZSBpbiBjYXNlIGFueSBjbGllbnRzIGdvdCBhIHJlZmVyZW5jZSB0byBpdCB3aXRoIGdldEFycmF5KClcbiAgICBjb25zdCBzaHVmZmxlZCA9IHJhbmRvbS5zaHVmZmxlKCB0aGlzICk7XG5cbiAgICAvLyBBY3Qgb24gdGhlIHRhcmdldEFycmF5IHNvIHRoYXQgcmVtb3ZhbCBhbmQgYWRkIG5vdGlmaWNhdGlvbnMgYXJlbid0IHNlbnQuXG4gICAgdGhpcy50YXJnZXRBcnJheS5sZW5ndGggPSAwO1xuICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KCB0aGlzLnRhcmdldEFycmF5LCBzaHVmZmxlZCApO1xuICB9LFxuXG4gIC8vIFRPRE8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2F4b24vaXNzdWVzLzMzNCBUaGlzIGFsc28gc2VlbXMgaW1wb3J0YW50IHRvIGVsaW1pbmF0ZVxuICBnZXRBcnJheUNvcHk6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5zbGljZSgpOyB9LFxuXG4gIGRpc3Bvc2U6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZWxlbWVudEFkZGVkRW1pdHRlci5kaXNwb3NlKCk7XG4gICAgdGhpcy5lbGVtZW50UmVtb3ZlZEVtaXR0ZXIuZGlzcG9zZSgpO1xuICAgIHRoaXMubGVuZ3RoUHJvcGVydHkuZGlzcG9zZSgpO1xuICAgIHRoaXMuX29ic2VydmFibGVBcnJheVBoZXRpb09iamVjdCAmJiB0aGlzLl9vYnNlcnZhYmxlQXJyYXlQaGV0aW9PYmplY3QuZGlzcG9zZSgpO1xuICB9LFxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogUGhFVC1pT1xuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgdG9TdGF0ZU9iamVjdDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHsgYXJyYXk6IHRoaXMubWFwKCBpdGVtID0+IHRoaXMucGhldGlvRWxlbWVudFR5cGUhLnRvU3RhdGVPYmplY3QoIGl0ZW0gKSApIH07XG4gIH0sXG4gIGFwcGx5U3RhdGU6IGZ1bmN0aW9uKCBzdGF0ZU9iamVjdDogT2JzZXJ2YWJsZUFycmF5U3RhdGVPYmplY3Q8YW55PiApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmxlbmd0aCA9PT0gMCwgJ09ic2VydmFibGVBcnJheXMgc2hvdWxkIGJlIGNsZWFyZWQgYXQgdGhlIGJlZ2lubmluZyBvZiBzdGF0ZSBzZXR0aW5nLicgKTtcbiAgICB0aGlzLmxlbmd0aCA9IDA7XG4gICAgY29uc3QgZWxlbWVudHMgPSBzdGF0ZU9iamVjdC5hcnJheS5tYXAoIHBhcmFtU3RhdGVPYmplY3QgPT4gdGhpcy5waGV0aW9FbGVtZW50VHlwZSEuZnJvbVN0YXRlT2JqZWN0KCBwYXJhbVN0YXRlT2JqZWN0ICkgKTtcbiAgICB0aGlzLnB1c2goIC4uLmVsZW1lbnRzICk7XG4gIH0sXG4gIHNldE5vdGlmaWNhdGlvbnNEZWZlcnJlZDogZnVuY3Rpb24oIG5vdGlmaWNhdGlvbnNEZWZlcnJlZDogYm9vbGVhbiApIHtcblxuICAgIC8vIEhhbmRsZSB0aGUgY2FzZSB3aGVyZSBhIGxpc3RlbmVyIGNhdXNlcyBhbm90aGVyIGVsZW1lbnQgdG8gYmUgYWRkZWQvcmVtb3ZlZC4gVGhhdCBuZXcgYWN0aW9uIHNob3VsZCBub3RpZnkgbGFzdC5cbiAgICBpZiAoICFub3RpZmljYXRpb25zRGVmZXJyZWQgKSB7XG4gICAgICB3aGlsZSAoIHRoaXMuZGVmZXJyZWRBY3Rpb25zLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgIHRoaXMuZGVmZXJyZWRBY3Rpb25zLnNoaWZ0KCkhKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMubm90aWZpY2F0aW9uc0RlZmVycmVkID0gbm90aWZpY2F0aW9uc0RlZmVycmVkO1xuICB9XG59O1xuXG4vKipcbiAqIEZvciBjb3B5V2l0aGluIGFuZCBmaWxsLCB3aGljaCBoYXZlIG1vcmUgY29tcGxleCBiZWhhdmlvciwgd2UgdHJlYXQgdGhlIGFycmF5IGFzIGEgYmxhY2sgYm94LCBtYWtpbmcgYSBzaGFsbG93IGNvcHlcbiAqIGJlZm9yZSB0aGUgb3BlcmF0aW9uIGluIG9yZGVyIHRvIGlkZW50aWZ5IHdoYXQgaGFzIGJlZW4gYWRkZWQgYW5kIHJlbW92ZWQuXG4gKi9cbmNvbnN0IHJlcG9ydERpZmZlcmVuY2UgPSAoIHNoYWxsb3dDb3B5OiBhbnlbXSwgb2JzZXJ2YWJsZUFycmF5OiBQcml2YXRlT2JzZXJ2YWJsZUFycmF5PGFueT4gKSA9PiB7XG5cbiAgY29uc3QgYmVmb3JlID0gc2hhbGxvd0NvcHk7XG4gIGNvbnN0IGFmdGVyID0gb2JzZXJ2YWJsZUFycmF5LnRhcmdldEFycmF5LnNsaWNlKCk7XG5cbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgYmVmb3JlLmxlbmd0aDsgaSsrICkge1xuICAgIGNvbnN0IGJlZm9yZUVsZW1lbnQgPSBiZWZvcmVbIGkgXTtcbiAgICBjb25zdCBhZnRlckluZGV4ID0gYWZ0ZXIuaW5kZXhPZiggYmVmb3JlRWxlbWVudCApO1xuICAgIGlmICggYWZ0ZXJJbmRleCA+PSAwICkge1xuICAgICAgYmVmb3JlLnNwbGljZSggaSwgMSApO1xuICAgICAgYWZ0ZXIuc3BsaWNlKCBhZnRlckluZGV4LCAxICk7XG4gICAgICBpLS07XG4gICAgfVxuICB9XG4gIGJlZm9yZS5mb3JFYWNoKCBlbGVtZW50ID0+IG9ic2VydmFibGVBcnJheS5lbWl0Tm90aWZpY2F0aW9uKCBvYnNlcnZhYmxlQXJyYXkuZWxlbWVudFJlbW92ZWRFbWl0dGVyLCBlbGVtZW50ICkgKTtcbiAgYWZ0ZXIuZm9yRWFjaCggZWxlbWVudCA9PiBvYnNlcnZhYmxlQXJyYXkuZW1pdE5vdGlmaWNhdGlvbiggb2JzZXJ2YWJsZUFycmF5LmVsZW1lbnRBZGRlZEVtaXR0ZXIsIGVsZW1lbnQgKSApO1xufTtcblxuLy8gQ2FjaGUgZWFjaCBwYXJhbWV0ZXJpemVkIE9ic2VydmFibGVBcnJheUlPXG4vLyBiYXNlZCBvbiB0aGUgcGFyYW1ldGVyIHR5cGUsIHNvIHRoYXQgaXQgaXMgb25seSBjcmVhdGVkIG9uY2UuXG5jb25zdCBjYWNoZSA9IG5ldyBJT1R5cGVDYWNoZSgpO1xuXG5cbi8qKlxuICogT2JzZXJ2YWJsZUFycmF5SU8gaXMgdGhlIElPVHlwZSBmb3IgT2JzZXJ2YWJsZUFycmF5RGVmLiBJdCBkZWxlZ2F0ZXMgbW9zdCBvZiBpdHMgaW1wbGVtZW50YXRpb24gdG8gT2JzZXJ2YWJsZUFycmF5RGVmLlxuICogSW5zdGVhZCBvZiBiZWluZyBhIHBhcmFtZXRyaWMgdHlwZSwgaXQgbGV2ZXJhZ2VzIHRoZSBwaGV0aW9FbGVtZW50VHlwZSBvbiBPYnNlcnZhYmxlQXJyYXlEZWYuXG4gKi9cbmNvbnN0IE9ic2VydmFibGVBcnJheUlPID0gKCBwYXJhbWV0ZXJUeXBlOiBJT1R5cGUgKTogSU9UeXBlID0+IHtcbiAgaWYgKCAhY2FjaGUuaGFzKCBwYXJhbWV0ZXJUeXBlICkgKSB7XG4gICAgY2FjaGUuc2V0KCBwYXJhbWV0ZXJUeXBlLCBuZXcgSU9UeXBlKCBgT2JzZXJ2YWJsZUFycmF5SU88JHtwYXJhbWV0ZXJUeXBlLnR5cGVOYW1lfT5gLCB7XG4gICAgICB2YWx1ZVR5cGU6IE9ic2VydmFibGVBcnJheVBoZXRpb09iamVjdCxcbiAgICAgIHBhcmFtZXRlclR5cGVzOiBbIHBhcmFtZXRlclR5cGUgXSxcbiAgICAgIHRvU3RhdGVPYmplY3Q6ICggb2JzZXJ2YWJsZUFycmF5UGhldGlvT2JqZWN0OiBPYnNlcnZhYmxlQXJyYXlQaGV0aW9PYmplY3Q8YW55PiApID0+IG9ic2VydmFibGVBcnJheVBoZXRpb09iamVjdC5vYnNlcnZhYmxlQXJyYXkudG9TdGF0ZU9iamVjdCgpLFxuICAgICAgYXBwbHlTdGF0ZTogKCBvYnNlcnZhYmxlQXJyYXlQaGV0aW9PYmplY3Q6IE9ic2VydmFibGVBcnJheVBoZXRpb09iamVjdDxhbnk+LCBzdGF0ZTogT2JzZXJ2YWJsZUFycmF5U3RhdGVPYmplY3Q8YW55PiApID0+IG9ic2VydmFibGVBcnJheVBoZXRpb09iamVjdC5vYnNlcnZhYmxlQXJyYXkuYXBwbHlTdGF0ZSggc3RhdGUgKSxcbiAgICAgIHN0YXRlU2NoZW1hOiB7XG4gICAgICAgIGFycmF5OiBBcnJheUlPKCBwYXJhbWV0ZXJUeXBlIClcbiAgICAgIH1cbiAgICB9ICkgKTtcbiAgfVxuICByZXR1cm4gY2FjaGUuZ2V0KCBwYXJhbWV0ZXJUeXBlICkhO1xufTtcblxuY3JlYXRlT2JzZXJ2YWJsZUFycmF5Lk9ic2VydmFibGVBcnJheUlPID0gT2JzZXJ2YWJsZUFycmF5SU87XG5cbmF4b24ucmVnaXN0ZXIoICdjcmVhdGVPYnNlcnZhYmxlQXJyYXknLCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgKTtcbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZU9ic2VydmFibGVBcnJheTtcbmV4cG9ydCB7IE9ic2VydmFibGVBcnJheUlPIH07XG5leHBvcnQgdHlwZSB7IE9ic2VydmFibGVBcnJheSB9OyJdLCJuYW1lcyI6WyJhcnJheVJlbW92ZSIsImFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyIsIm1lcmdlIiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJJT1R5cGVDYWNoZSIsImlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkiLCJQaGV0aW9PYmplY3QiLCJUYW5kZW0iLCJBcnJheUlPIiwiSU9UeXBlIiwiYXhvbiIsIkVtaXR0ZXIiLCJOdW1iZXJQcm9wZXJ0eSIsIlZhbGlkYXRpb24iLCJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiaGFzTGlzdGVuZXJPcmRlckRlcGVuZGVuY2llcyIsImxlbmd0aCIsImVsZW1lbnRzIiwiZWxlbWVudEFkZGVkRW1pdHRlck9wdGlvbnMiLCJlbGVtZW50UmVtb3ZlZEVtaXR0ZXJPcHRpb25zIiwibGVuZ3RoUHJvcGVydHlPcHRpb25zIiwiZW1pdHRlclBhcmFtZXRlck9wdGlvbnMiLCJwaGV0aW9UeXBlIiwiYXNzZXJ0IiwidHlwZU5hbWUiLCJzdGFydHNXaXRoIiwibmFtZSIsInBhcmFtZXRlclR5cGVzIiwiZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yIiwidmFsaWRhdG9yIiwiXyIsInBpY2siLCJWQUxJREFUT1JfS0VZUyIsImlzVmFsaWRWYWx1ZSIsInN0dWJUcnVlIiwiZWxlbWVudEFkZGVkRW1pdHRlciIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsInBhcmFtZXRlcnMiLCJwaGV0aW9SZWFkT25seSIsImVsZW1lbnRSZW1vdmVkRW1pdHRlciIsImxlbmd0aFByb3BlcnR5IiwibnVtYmVyVHlwZSIsInRhcmdldEFycmF5IiwiYWRkTGlzdGVuZXIiLCJ2YWx1ZSIsImRlZmVycmVkQWN0aW9ucyIsImVtaXROb3RpZmljYXRpb24iLCJlbWl0dGVyIiwiZWxlbWVudCIsIm9ic2VydmFibGVBcnJheSIsIm5vdGlmaWNhdGlvbnNEZWZlcnJlZCIsInB1c2giLCJlbWl0IiwiUHJveHkiLCJnZXQiLCJhcnJheSIsImtleSIsInJlY2VpdmVyIiwibWV0aG9kcyIsImhhc093blByb3BlcnR5IiwiUmVmbGVjdCIsInNldCIsIm5ld1ZhbHVlIiwib2xkVmFsdWUiLCJyZW1vdmVkRWxlbWVudHMiLCJzbGljZSIsInJldHVyblZhbHVlIiwibnVtYmVyS2V5IiwiTnVtYmVyIiwiaXNJbnRlZ2VyIiwidW5kZWZpbmVkIiwiZm9yRWFjaCIsImRlbGV0ZVByb3BlcnR5IiwicmVtb3ZlZCIsImluaXQiLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwicmVzZXQiLCJzdXBwbGllZCIsInBoZXRpb0VsZW1lbnRUeXBlIiwiX29ic2VydmFibGVBcnJheVBoZXRpb09iamVjdCIsIk9ic2VydmFibGVBcnJheVBoZXRpb09iamVjdCIsIlBIRVRfSU9fRU5BQkxFRCIsImhhc0luIiwid2luZG93IiwicGhldGlvU3RhdGVFbmdpbmUiLCJwaGV0IiwicGhldGlvIiwicGhldGlvRW5naW5lIiwiY2xlYXJEeW5hbWljRWxlbWVudHNFbWl0dGVyIiwic3RhdGUiLCJzY29wZVRhbmRlbSIsImhhc0FuY2VzdG9yIiwic2V0Tm90aWZpY2F0aW9uc0RlZmVycmVkIiwidW5kZWZlckVtaXR0ZXIiLCJhZGRTZXRTdGF0ZUhlbHBlciIsInNoaWZ0IiwicG9wIiwiYXJncyIsImluaXRpYWxMZW5ndGgiLCJpIiwiYXJndW1lbnRzIiwidW5zaGlmdCIsInNwbGljZSIsImRlbGV0ZWRFbGVtZW50cyIsImRlbGV0ZWRFbGVtZW50IiwiY29weVdpdGhpbiIsImJlZm9yZSIsInJlcG9ydERpZmZlcmVuY2UiLCJmaWxsIiwiaW5kZXgiLCJhZGRJdGVtQWRkZWRMaXN0ZW5lciIsImxpc3RlbmVyIiwicmVtb3ZlSXRlbUFkZGVkTGlzdGVuZXIiLCJyZW1vdmVMaXN0ZW5lciIsImFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIiLCJyZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyIiwiYWRkIiwiYWRkQWxsIiwicmVtb3ZlIiwicmVtb3ZlQWxsIiwiY2xlYXIiLCJjb3VudCIsInByZWRpY2F0ZSIsImZpbmQiLCJmcm9tSW5kZXgiLCJzaHVmZmxlIiwicmFuZG9tIiwic2h1ZmZsZWQiLCJnZXRBcnJheUNvcHkiLCJkaXNwb3NlIiwidG9TdGF0ZU9iamVjdCIsIm1hcCIsIml0ZW0iLCJhcHBseVN0YXRlIiwic3RhdGVPYmplY3QiLCJwYXJhbVN0YXRlT2JqZWN0IiwiZnJvbVN0YXRlT2JqZWN0Iiwic2hhbGxvd0NvcHkiLCJhZnRlciIsImJlZm9yZUVsZW1lbnQiLCJhZnRlckluZGV4IiwiaW5kZXhPZiIsImNhY2hlIiwiT2JzZXJ2YWJsZUFycmF5SU8iLCJwYXJhbWV0ZXJUeXBlIiwiaGFzIiwidmFsdWVUeXBlIiwib2JzZXJ2YWJsZUFycmF5UGhldGlvT2JqZWN0Iiwic3RhdGVTY2hlbWEiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXRELG1IQUFtSDtBQUNuSCwyQkFBMkI7QUFDM0IscURBQXFELEdBQ3JEOzs7OztDQUtDLEdBRUQsT0FBT0EsaUJBQWlCLG9DQUFvQztBQUM1RCxPQUFPQyxvQ0FBb0MsdURBQXVEO0FBQ2xHLE9BQU9DLFdBQVcsOEJBQThCO0FBQ2hELE9BQU9DLGFBQWFDLGNBQWMsUUFBUSxrQ0FBa0M7QUFFNUUsT0FBT0MsaUJBQWlCLGlDQUFpQztBQUN6RCxPQUFPQyxrQ0FBa0Msa0RBQWtEO0FBRTNGLE9BQU9DLGtCQUEyQyxrQ0FBa0M7QUFDcEYsT0FBT0MsWUFBWSw0QkFBNEI7QUFDL0MsT0FBT0MsYUFBYSxtQ0FBbUM7QUFDdkQsT0FBT0MsWUFBWSxrQ0FBa0M7QUFDckQsT0FBT0MsVUFBVSxZQUFZO0FBQzdCLE9BQU9DLGFBQWlDLGVBQWU7QUFDdkQsT0FBT0Msb0JBQStDLHNCQUFzQjtBQUU1RSxPQUFPQyxnQkFBZ0Isa0JBQWtCO0FBaUV6QyxNQUFNQyx3QkFBd0IsQ0FBS0M7UUFrQ3ZCQyxpQkFRQUEsa0JBU0FBLGtCQWlKTEE7SUFsTUxoQiwrQkFBZ0NlLGlCQUFpQjtRQUFFO0tBQVUsRUFBRTtRQUFFO0tBQVk7SUFFN0UsTUFBTUMsVUFBVWQsWUFBNkU7UUFFM0Zl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