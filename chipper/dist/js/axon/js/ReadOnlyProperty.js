// Copyright 2013-2024, University of Colorado Boulder
/**
 * An observable property which notifies listeners when the value changes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */ import optionize from '../../phet-core/js/optionize.js';
import IOTypeCache from '../../tandem/js/IOTypeCache.js';
import isClearingPhetioDynamicElementsProperty from '../../tandem/js/isClearingPhetioDynamicElementsProperty.js';
import isPhetioStateEngineManagingPropertyValuesProperty from '../../tandem/js/isPhetioStateEngineManagingPropertyValuesProperty.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem, { DYNAMIC_ARCHETYPE_NAME } from '../../tandem/js/Tandem.js';
import ArrayIO from '../../tandem/js/types/ArrayIO.js';
import FunctionIO from '../../tandem/js/types/FunctionIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import NullableIO from '../../tandem/js/types/NullableIO.js';
import StringIO from '../../tandem/js/types/StringIO.js';
import VoidIO from '../../tandem/js/types/VoidIO.js';
import axon from './axon.js';
import { propertyStateHandlerSingleton } from './PropertyStateHandler.js';
import PropertyStatePhase from './PropertyStatePhase.js';
import TinyProperty from './TinyProperty.js';
import units from './units.js';
import validate from './validate.js';
import Validation from './Validation.js';
// constants
const VALIDATE_OPTIONS_FALSE = {
    validateValidator: false
};
// variables
let globalId = 0; // auto-incremented for unique IDs
// Cache each parameterized PropertyIO based on the parameter type, so that it is only created once
const cache = new IOTypeCache();
let ReadOnlyProperty = class ReadOnlyProperty extends PhetioObject {
    /**
   * Returns true if the value can be set externally, using .value= or set()
   */ isSettable() {
        return false;
    }
    /**
   * Gets the value.
   * You can also use the es5 getter (property.value) but this means is provided for inner loops
   * or internal code that must be fast.
   */ get() {
        return this.tinyProperty.get();
    }
    /**
   * Sets the value and notifies listeners, unless deferred or disposed. You can also use the es5 getter
   * (property.value) but this means is provided for inner loops or internal code that must be fast. If the value
   * hasn't changed, this is a no-op.
   *
   * NOTE: For PhET-iO instrumented Properties that are phetioState: true, the value is only
   * set by the PhetioStateEngine and cannot be modified by other code while isSettingPhetioStateProperty === true.
   */ set(value) {
        // State is managed by the PhetioStateEngine, see https://github.com/phetsims/axon/issues/409
        const setManagedByPhetioState = isPhetioStateEngineManagingPropertyValuesProperty.value && // We still want to set Properties when clearing dynamic elements, see https://github.com/phetsims/phet-io/issues/1906
        !isClearingPhetioDynamicElementsProperty.value && this.isPhetioInstrumented() && this.phetioState && // However, DerivedProperty should be able to update during PhET-iO state set
        this.isSettable();
        if (!setManagedByPhetioState) {
            this.unguardedSet(value);
        } else {
        // Uncomment while implementing PhET-iO State for your simulation to see what value-setting is being silently ignored.
        // console.warn( `Ignoring attempt to ReadOnlyProperty.set(): ${this.phetioID}` );
        }
    }
    /**
   * For usage by the IOType during PhET-iO state setting.
   */ unguardedSet(value) {
        if (!this.isDisposed) {
            if (this.isDeferred) {
                this.deferredValue = value;
                this.hasDeferredValue = true;
            } else if (!this.equalsValue(value)) {
                const oldValue = this.get();
                this.setPropertyValue(value);
                this._notifyListeners(oldValue);
            }
        }
    }
    /**
   * Sets the value without notifying any listeners. This is a place to override if a subtype performs additional work
   * when setting the value.
   */ setPropertyValue(value) {
        this.tinyProperty.setPropertyValue(value);
    }
    /**
   * Returns true if and only if the specified value equals the value of this property
   */ equalsValue(value) {
        // Ideally, we would call the equalsValue in tinyProperty, but it is protected. Furthermore, it is nice to get
        // the assertions associated with ReadOnlyProperty.get().
        return this.areValuesEqual(value, this.get());
    }
    /**
   * Determine if the two values are equal, see TinyProperty.areValuesEqual().
   */ areValuesEqual(a, b) {
        return this.tinyProperty.areValuesEqual(a, b);
    }
    /**
   * NOTE: a few sims are calling this even though they shouldn't
   */ _notifyListeners(oldValue) {
        const newValue = this.get();
        // validate the before notifying listeners
        assert && validate(newValue, this.valueValidator, VALIDATE_OPTIONS_FALSE);
        // Although this is not the idiomatic pattern (since it is guarded in the phetioStartEvent), this function is
        // called so many times that it is worth the optimization for PhET brand.
        Tandem.PHET_IO_ENABLED && this.isPhetioInstrumented() && this.phetioStartEvent(ReadOnlyProperty.CHANGED_EVENT_NAME, {
            getData: ()=>{
                const parameterType = this.phetioType.parameterTypes[0];
                return {
                    oldValue: NullableIO(parameterType).toStateObject(oldValue),
                    newValue: parameterType.toStateObject(newValue)
                };
            }
        });
        // notify listeners, optionally detect loops where this Property is set again before this completes.
        assert && assert(!this.notifying || this.reentrant, `reentry detected, value=${newValue}, oldValue=${oldValue}`);
        this.notifying = true;
        this.tinyProperty.emit(newValue, oldValue, this); // cannot use tinyProperty.notifyListeners because it uses the wrong this
        this.notifying = false;
        Tandem.PHET_IO_ENABLED && this.isPhetioInstrumented() && this.phetioEndEvent();
    }
    /**
   * Use this method when mutating a value (not replacing with a new instance) and you want to send notifications about the change.
   * This is different from the normal axon strategy, but may be necessary to prevent memory allocations.
   * This method is unsafe for removing listeners because it assumes the listener list not modified, to save another allocation
   * Only provides the new reference as a callback (no oldValue)
   * See https://github.com/phetsims/axon/issues/6
   */ notifyListenersStatic() {
        this._notifyListeners(null);
    }
    /**
   * When deferred, set values do not take effect or send out notifications.  After defer ends, the Property takes
   * its deferred value (if any), and a follow-up action (return value) can be invoked to send out notifications
   * once other Properties have also taken their deferred values.
   *
   * @param isDeferred - whether the Property should be deferred or not
   * @returns - function to notify listeners after calling setDeferred(false),
   *          - null if isDeferred is true, or if the value is unchanged since calling setDeferred(true)
   */ setDeferred(isDeferred) {
        assert && assert(!this.isDisposed, 'cannot defer Property if already disposed.');
        if (isDeferred) {
            assert && assert(!this.isDeferred, 'Property already deferred');
            this.isDeferred = true;
        } else {
            assert && assert(this.isDeferred, 'Property wasn\'t deferred');
            this.isDeferred = false;
            const oldValue = this.get();
            // Take the new value
            if (this.hasDeferredValue) {
                this.setPropertyValue(this.deferredValue);
                this.hasDeferredValue = false;
                this.deferredValue = null;
            }
            // If the value has changed, prepare to send out notifications (after all other Properties in this transaction
            // have their final values)
            if (!this.equalsValue(oldValue)) {
                return ()=>!this.isDisposed && this._notifyListeners(oldValue);
            }
        }
        // no action to signify change
        return null;
    }
    get value() {
        return this.get();
    }
    set value(newValue) {
        this.set(newValue);
    }
    /**
   * This function registers an order dependency between this Property and another. Basically this says that when
   * setting PhET-iO state, each dependency must take its final value before this Property fires its notifications.
   * See propertyStateHandlerSingleton.registerPhetioOrderDependency and https://github.com/phetsims/axon/issues/276 for more info.
   */ addPhetioStateDependencies(dependencies) {
        assert && assert(Array.isArray(dependencies), 'Array expected');
        for(let i = 0; i < dependencies.length; i++){
            const dependencyProperty = dependencies[i];
            // only if running in PhET-iO brand and both Properties are instrumenting
            if (dependencyProperty instanceof ReadOnlyProperty && dependencyProperty.isPhetioInstrumented() && this.isPhetioInstrumented()) {
                // The dependency should undefer (taking deferred value) before this Property notifies.
                propertyStateHandlerSingleton.registerPhetioOrderDependency(dependencyProperty, PropertyStatePhase.UNDEFER, this, PropertyStatePhase.NOTIFY);
            }
        }
    }
    /**
   * Adds listener and calls it immediately. If listener is already registered, this is a no-op. The initial
   * notification provides the current value for newValue and null for oldValue.
   *
   * @param listener - a function that takes a new value, old value, and this Property as arguments
   * @param [options]
   */ link(listener, options) {
        if (options && options.phetioDependencies) {
            this.addPhetioStateDependencies(options.phetioDependencies);
        }
        this.tinyProperty.addListener(listener); // cannot use tinyProperty.link() because of wrong this
        listener(this.get(), null, this); // null should be used when an object is expected but unavailable
    }
    /**
   * Add a listener to the Property, without calling it back right away. This is used when you need to register a
   * listener without an immediate callback.
   */ lazyLink(listener, options) {
        if (options && options.phetioDependencies) {
            this.addPhetioStateDependencies(options.phetioDependencies);
        }
        this.tinyProperty.lazyLink(listener);
    }
    /**
   * Removes a listener. If listener is not registered, this is a no-op.
   */ unlink(listener) {
        this.tinyProperty.unlink(listener);
    }
    /**
   * Removes all listeners. If no listeners are registered, this is a no-op.
   */ unlinkAll() {
        this.tinyProperty.unlinkAll();
    }
    /**
   * Links an object's named attribute to this property.  Returns a handle so it can be removed using Property.unlink();
   * Example: modelVisibleProperty.linkAttribute(view,'visible');
   *
   * NOTE: Duplicated with TinyProperty.linkAttribute
   */ linkAttribute(object, attributeName) {
        const handle = (value)=>{
            object[attributeName] = value;
        };
        this.link(handle);
        return handle;
    }
    /**
   * Provide toString for console debugging, see http://stackoverflow.com/questions/2485632/valueof-vs-tostring-in-javascript
   */ toString() {
        return `Property#${this.id}{${this.get()}}`;
    }
    /**
   * Convenience function for debugging a Property's value. It prints the new value on registration and when changed.
   * @param name - debug name to be printed on the console
   * @returns - the handle to the linked listener in case it needs to be removed later
   */ debug(name) {
        const listener = (value)=>console.log(name, value);
        this.link(listener);
        return listener;
    }
    isValueValid(value) {
        return this.getValidationError(value) === null;
    }
    getValidationError(value) {
        return Validation.getValidationError(value, this.valueValidator, VALIDATE_OPTIONS_FALSE);
    }
    // Ensures that the Property is eligible for GC
    dispose() {
        // unregister any order dependencies for this Property for PhET-iO state
        if (this.isPhetioInstrumented()) {
            propertyStateHandlerSingleton.unregisterOrderDependenciesForProperty(this);
        }
        super.dispose();
        this.tinyProperty.dispose();
    }
    /**
   * Checks whether a listener is registered with this Property
   */ hasListener(listener) {
        return this.tinyProperty.hasListener(listener);
    }
    /**
   * Returns the number of listeners.
   */ getListenerCount() {
        return this.tinyProperty.getListenerCount();
    }
    /**
   * Invokes a callback once for each listener
   * @param callback - takes the listener as an argument
   */ forEachListener(callback) {
        this.tinyProperty.forEachListener(callback);
    }
    /**
   * Returns true if there are any listeners.
   */ hasListeners() {
        assert && assert(arguments.length === 0, 'Property.hasListeners should be called without arguments');
        return this.tinyProperty.hasListeners();
    }
    get valueComparisonStrategy() {
        return this.tinyProperty.valueComparisonStrategy;
    }
    set valueComparisonStrategy(valueComparisonStrategy) {
        this.tinyProperty.valueComparisonStrategy = valueComparisonStrategy;
    }
    /**
   * Implementation of serialization for PhET-iO support. Override this function to customize how this state
   * behaves (but be careful!).
   *
   * This function is parameterized to support subtyping. That said, it is a bit useless, since we don't want to
   * parameterize ReadOnlyProperty in general to the IOType's state type, so please bear with us.
   */ toStateObject() {
        assert && assert(this.phetioValueType.toStateObject, `toStateObject doesn't exist for ${this.phetioValueType.typeName}`);
        return {
            value: this.phetioValueType.toStateObject(this.value),
            validValues: NullableIO(ArrayIO(this.phetioValueType)).toStateObject(this.validValues === undefined ? null : this.validValues),
            units: NullableIO(StringIO).toStateObject(this.units)
        };
    }
    /**
   * Implementation of serialization for PhET-iO support. Override this function to customize how this state
   * behaves (but be careful!).
   */ applyState(stateObject) {
        const units = NullableIO(StringIO).fromStateObject(stateObject.units);
        assert && assert(this.units === units, 'Property units do not match');
        assert && assert(this.isSettable(), 'Property should be settable');
        this.unguardedSet(this.phetioValueType.fromStateObject(stateObject.value));
    }
    /**
   * An observable Property that triggers notifications when the value changes.
   * This caching implementation should be kept in sync with the other parametric IOType caching implementations.
   */ static PropertyIO(parameterType) {
        assert && assert(parameterType, 'PropertyIO needs parameterType');
        if (!cache.has(parameterType)) {
            cache.set(parameterType, new IOType(`PropertyIO<${parameterType.typeName}>`, {
                // We want PropertyIO to work for DynamicProperty and DerivedProperty, but they extend ReadOnlyProperty
                valueType: ReadOnlyProperty,
                documentation: 'Observable values that send out notifications when the value changes. This differs from the ' + 'traditional listener pattern in that added listeners also receive a callback with the current value ' + 'when the listeners are registered. This is a widely-used pattern in PhET-iO simulations.',
                methodOrder: [
                    'link',
                    'lazyLink'
                ],
                events: [
                    ReadOnlyProperty.CHANGED_EVENT_NAME
                ],
                parameterTypes: [
                    parameterType
                ],
                toStateObject: (property)=>{
                    return property.toStateObject();
                },
                applyState: (property, stateObject)=>{
                    property.applyState(stateObject);
                },
                stateSchema: {
                    value: parameterType,
                    validValues: NullableIO(ArrayIO(parameterType)),
                    units: NullableIO(StringIO)
                },
                apiStateKeys: [
                    'validValues',
                    'units'
                ],
                methods: {
                    getValue: {
                        returnType: parameterType,
                        parameterTypes: [],
                        implementation: ReadOnlyProperty.prototype.get,
                        documentation: 'Gets the current value.'
                    },
                    getValidationError: {
                        returnType: NullableIO(StringIO),
                        parameterTypes: [
                            parameterType
                        ],
                        implementation: function(value) {
                            return this.getValidationError(value);
                        },
                        documentation: 'Checks to see if a proposed value is valid. Returns the first validation error, or null if the value is valid.'
                    },
                    setValue: {
                        returnType: VoidIO,
                        parameterTypes: [
                            parameterType
                        ],
                        implementation: function(value) {
                            this.set(value);
                        },
                        documentation: 'Sets the value of the Property. If the value differs from the previous value, listeners are ' + 'notified with the new value.',
                        invocableForReadOnlyElements: false
                    },
                    link: {
                        returnType: VoidIO,
                        // oldValue will start as "null" the first time called
                        parameterTypes: [
                            FunctionIO(VoidIO, [
                                parameterType,
                                NullableIO(parameterType)
                            ])
                        ],
                        implementation: ReadOnlyProperty.prototype.link,
                        documentation: 'Adds a listener which will be called when the value changes. On registration, the listener is ' + 'also called with the current value. The listener takes two arguments, the new value and the ' + 'previous value.'
                    },
                    lazyLink: {
                        returnType: VoidIO,
                        // oldValue will start as "null" the first time called
                        parameterTypes: [
                            FunctionIO(VoidIO, [
                                parameterType,
                                NullableIO(parameterType)
                            ])
                        ],
                        implementation: ReadOnlyProperty.prototype.lazyLink,
                        documentation: 'Adds a listener which will be called when the value changes. This method is like "link", but ' + 'without the current-value callback on registration. The listener takes two arguments, the new ' + 'value and the previous value.'
                    },
                    unlink: {
                        returnType: VoidIO,
                        parameterTypes: [
                            FunctionIO(VoidIO, [
                                parameterType
                            ])
                        ],
                        implementation: ReadOnlyProperty.prototype.unlink,
                        documentation: 'Removes a listener.'
                    }
                }
            }));
        }
        return cache.get(parameterType);
    }
    /**
   * Support treating ourselves as an autoselectable entity for the "strings" selection mode.
   */ getPhetioMouseHitTarget(fromLinking = false) {
        if (phet.tandem.phetioElementSelectionProperty.value === 'string') {
            // As of this writing, the only way to get to this function is for Properties that have a value of strings, but
            // in the future that may not be the case. SR and MK still think it is preferable to keep this general, as false
            // positives for autoselect are generally better than false negatives.
            return this.getPhetioMouseHitTargetSelf();
        }
        return super.getPhetioMouseHitTarget(fromLinking);
    }
    /**
   * This is protected to indicate to clients that subclasses should be used instead.
   * @param value - the initial value of the property
   * @param [providedOptions]
   */ constructor(value, providedOptions){
        const options = optionize()({
            units: null,
            reentrant: false,
            hasListenerOrderDependencies: false,
            reentrantNotificationStrategy: 'queue',
            // See Validation.ts for ValueComparisonStrategy for available values. Please note that this will be used for
            // equality comparison both with validation (i.e. for validValue comparison), as well as determining if the
            // value has changed such that listeners should fire, see TinyProperty.areValuesEqual().
            valueComparisonStrategy: 'reference',
            // phet-io
            tandemNameSuffix: [
                'Property',
                DYNAMIC_ARCHETYPE_NAME
            ],
            phetioOuterType: ReadOnlyProperty.PropertyIO,
            phetioValueType: IOType.ObjectIO
        }, providedOptions);
        assert && options.units && assert(units.isValidUnits(options.units), `invalid units: ${options.units}`);
        if (options.units) {
            options.phetioEventMetadata = options.phetioEventMetadata || {};
            assert && assert(!options.phetioEventMetadata.hasOwnProperty('units'), 'units should be supplied by Property, not elsewhere');
            options.phetioEventMetadata.units = options.units;
        }
        if (assert && providedOptions) {
            // @ts-expect-error -- for checking JS code
            assert && assert(!providedOptions.phetioType, 'Set phetioType via phetioValueType');
        }
        // Construct the IOType
        if (options.phetioOuterType && options.phetioValueType) {
            options.phetioType = options.phetioOuterType(options.phetioValueType);
        }
        // Support non-validated Property
        if (!Validation.containsValidatorKey(options)) {
            options.isValidValue = ()=>true;
        }
        super(options);
        this.id = globalId++;
        this.units = options.units;
        // When running as phet-io, if the tandem is specified, the type must be specified.
        if (this.isPhetioInstrumented()) {
            // This assertion helps in instrumenting code that has the tandem but not type
            assert && Tandem.VALIDATION && assert(this.phetioType, `phetioType passed to Property must be specified. Tandem.phetioID: ${this.tandem.phetioID}`);
            assert && Tandem.VALIDATION && assert(options.phetioType.parameterTypes[0], `phetioType parameter type must be specified (only one). Tandem.phetioID: ${this.tandem.phetioID}`);
            assert && assert(options.phetioValueType !== IOType.ObjectIO, 'PhET-iO Properties must specify a phetioValueType: ' + this.phetioID);
        }
        this.validValues = options.validValues;
        this.tinyProperty = new TinyProperty(value, null, options.hasListenerOrderDependencies, options.reentrantNotificationStrategy);
        // Since we are already in the heavyweight Property, we always assign TinyProperty.valueComparisonStrategy for clarity.
        this.tinyProperty.valueComparisonStrategy = options.valueComparisonStrategy;
        this.notifying = false;
        this.reentrant = options.reentrant;
        this.isDeferred = false;
        this.deferredValue = null;
        this.hasDeferredValue = false;
        this.phetioValueType = options.phetioValueType;
        this.valueValidator = _.pick(options, Validation.VALIDATOR_KEYS);
        this.valueValidator.validationMessage = this.valueValidator.validationMessage || 'Property value not valid';
        if (this.valueValidator.phetioType) {
            // Validate the value type's phetioType of the Property, not the PropertyIO itself.
            // For example, for PropertyIO( BooleanIO ), assign this valueValidator's phetioType to be BooleanIO's validator.
            assert && assert(!!this.valueValidator.phetioType.parameterTypes[0], 'unexpected number of parameters for Property');
            // This is the validator for the value, not for the Property itself
            this.valueValidator.phetioType = this.valueValidator.phetioType.parameterTypes[0];
        }
        // Assertions regarding value validation
        if (assert) {
            Validation.validateValidator(this.valueValidator);
            // validate the initial value as well as any changes in the future
            validate(value, this.valueValidator, VALIDATE_OPTIONS_FALSE);
        }
    }
};
ReadOnlyProperty.CHANGED_EVENT_NAME = 'changed';
/**
 * Base class for Property, DerivedProperty, DynamicProperty.  Set methods are protected/not part of the public
 * interface.  Initial value and resetting is not defined here.
 */ export { ReadOnlyProperty as default };
axon.register('ReadOnlyProperty', ReadOnlyProperty);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvUmVhZE9ubHlQcm9wZXJ0eS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbi8qKlxuICogQW4gb2JzZXJ2YWJsZSBwcm9wZXJ0eSB3aGljaCBub3RpZmllcyBsaXN0ZW5lcnMgd2hlbiB0aGUgdmFsdWUgY2hhbmdlcy5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgSU9UeXBlQ2FjaGUgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL0lPVHlwZUNhY2hlLmpzJztcbmltcG9ydCBpc0NsZWFyaW5nUGhldGlvRHluYW1pY0VsZW1lbnRzUHJvcGVydHkgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL2lzQ2xlYXJpbmdQaGV0aW9EeW5hbWljRWxlbWVudHNQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgaXNQaGV0aW9TdGF0ZUVuZ2luZU1hbmFnaW5nUHJvcGVydHlWYWx1ZXNQcm9wZXJ0eSBmcm9tICcuLi8uLi90YW5kZW0vanMvaXNQaGV0aW9TdGF0ZUVuZ2luZU1hbmFnaW5nUHJvcGVydHlWYWx1ZXNQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUGhldGlvT2JqZWN0LCB7IFBoZXRpb09iamVjdE9wdGlvbnMgfSBmcm9tICcuLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcbmltcG9ydCBUYW5kZW0sIHsgRFlOQU1JQ19BUkNIRVRZUEVfTkFNRSB9IGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IEFycmF5SU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0FycmF5SU8uanMnO1xuaW1wb3J0IEZ1bmN0aW9uSU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0Z1bmN0aW9uSU8uanMnO1xuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcbmltcG9ydCBOdWxsYWJsZUlPIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdWxsYWJsZUlPLmpzJztcbmltcG9ydCBTdHJpbmdJTyBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvU3RyaW5nSU8uanMnO1xuaW1wb3J0IFZvaWRJTyBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvVm9pZElPLmpzJztcbmltcG9ydCBheG9uIGZyb20gJy4vYXhvbi5qcyc7XG5pbXBvcnQgeyBwcm9wZXJ0eVN0YXRlSGFuZGxlclNpbmdsZXRvbiB9IGZyb20gJy4vUHJvcGVydHlTdGF0ZUhhbmRsZXIuanMnO1xuaW1wb3J0IFByb3BlcnR5U3RhdGVQaGFzZSBmcm9tICcuL1Byb3BlcnR5U3RhdGVQaGFzZS5qcyc7XG5pbXBvcnQgeyBUaW55RW1pdHRlck9wdGlvbnMgfSBmcm9tICcuL1RpbnlFbWl0dGVyLmpzJztcbmltcG9ydCBUaW55UHJvcGVydHkgZnJvbSAnLi9UaW55UHJvcGVydHkuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5LCB7IFByb3BlcnR5TGF6eUxpbmtMaXN0ZW5lciwgUHJvcGVydHlMaW5rTGlzdGVuZXIsIFByb3BlcnR5TGlzdGVuZXIgfSBmcm9tICcuL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCB1bml0cywgeyBVbml0cyB9IGZyb20gJy4vdW5pdHMuanMnO1xuaW1wb3J0IHZhbGlkYXRlIGZyb20gJy4vdmFsaWRhdGUuanMnO1xuaW1wb3J0IFZhbGlkYXRpb24sIHsgVmFsaWRhdG9yLCBWYWx1ZUNvbXBhcmlzb25TdHJhdGVneSB9IGZyb20gJy4vVmFsaWRhdGlvbi5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgVkFMSURBVEVfT1BUSU9OU19GQUxTRSA9IHsgdmFsaWRhdGVWYWxpZGF0b3I6IGZhbHNlIH07XG5cbi8vIHZhcmlhYmxlc1xubGV0IGdsb2JhbElkID0gMDsgLy8gYXV0by1pbmNyZW1lbnRlZCBmb3IgdW5pcXVlIElEc1xuXG4vLyBDYWNoZSBlYWNoIHBhcmFtZXRlcml6ZWQgUHJvcGVydHlJTyBiYXNlZCBvbiB0aGUgcGFyYW1ldGVyIHR5cGUsIHNvIHRoYXQgaXQgaXMgb25seSBjcmVhdGVkIG9uY2VcbmNvbnN0IGNhY2hlID0gbmV3IElPVHlwZUNhY2hlKCk7XG5cbmV4cG9ydCB0eXBlIFJlYWRPbmx5UHJvcGVydHlTdGF0ZTxTdGF0ZVR5cGU+ID0ge1xuICB2YWx1ZTogU3RhdGVUeXBlO1xuXG4gIC8vIE9ubHkgaW5jbHVkZSB2YWxpZFZhbHVlcyBpZiBzcGVjaWZpZWQsIHNvIHRoZXkgb25seSBzaG93IHVwIGluIFBoRVQtaU8gU3R1ZGlvIHdoZW4gc3VwcGxpZWQuXG4gIHZhbGlkVmFsdWVzOiBTdGF0ZVR5cGVbXSB8IG51bGw7XG5cbiAgdW5pdHM6IHN0cmluZyB8IG51bGw7XG59O1xuXG4vLyBPcHRpb25zIGRlZmluZWQgYnkgUHJvcGVydHlcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG5cbiAgLy8gdW5pdHMgZm9yIHRoZSB2YWx1ZSwgc2VlIHVuaXRzLmpzLiBTaG91bGQgcHJlZmVyIGFiYnJldmlhdGVkIHVuaXRzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vaXNzdWVzLzUzMFxuICB1bml0cz86IFVuaXRzIHwgbnVsbDtcblxuICAvLyBXaGV0aGVyIHJlZW50cmFudCBjYWxscyB0byAnc2V0JyBhcmUgYWxsb3dlZC5cbiAgLy8gVXNlIHRoaXMgdG8gZGV0ZWN0IG9yIHByZXZlbnQgdXBkYXRlIGN5Y2xlcy4gVXBkYXRlIGN5Y2xlcyBtYXkgYmUgZHVlIHRvIGZsb2F0aW5nIHBvaW50IGVycm9yLFxuICAvLyBmYXVsdHkgbG9naWMsIGV0Yy4gVGhpcyBtYXkgYmUgb2YgcGFydGljdWxhciBpbnRlcmVzdCBmb3IgUGhFVC1pTyBpbnN0cnVtZW50YXRpb24sIHdoZXJlIHN1Y2hcbiAgLy8gY3ljbGVzIG1heSBwb2xsdXRlIHRoZSBkYXRhIHN0cmVhbS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9heG9uL2lzc3Vlcy8xNzlcbiAgcmVlbnRyYW50PzogYm9vbGVhbjtcblxuICAvLyBUaGUgSU9UeXBlIGZvciB0aGUgdmFsdWVzIHRoaXMgUHJvcGVydHkgc3VwcG9ydHMuIEF0IHRoaXMgbGV2ZWwsIGl0IGRvZXNuJ3QgbWF0dGVyIHdoYXQgdGhlIHN0YXRlIHR5cGUgaXMsIHNvXG4gIC8vIGl0IGRlZmF1bHRzIHRvIEludGVudGlvbmFsQW55LlxuICBwaGV0aW9WYWx1ZVR5cGU/OiBJT1R5cGU7XG5cbiAgLy8gVGhlIElPVHlwZSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBwYXJhbWV0ZXJpemVkIElPVHlwZSBiYXNlZCBvbiB0aGUgdmFsdWVUeXBlLiBUaGVyZSBpcyBhIGdlbmVyYWwgZGVmYXVsdCwgYnV0XG4gIC8vIHN1YnR5cGVzIGNhbiBpbXBsZW1lbnQgdGhlaXIgb3duLCBtb3JlIHNwZWNpZmljIElPVHlwZS5cbiAgcGhldGlvT3V0ZXJUeXBlPzogKCBwYXJhbWV0ZXJUeXBlOiBJT1R5cGUgKSA9PiBJT1R5cGU7XG5cbiAgLy8gSWYgc3BlY2lmaWVkIGFzIHRydWUsIHRoaXMgZmxhZyB3aWxsIGVuc3VyZSB0aGF0IGxpc3RlbmVyIG9yZGVyIG5ldmVyIGNoYW5nZXMgKGxpa2UgdmlhID9saXN0ZW5lck9yZGVyPXJhbmRvbSlcbiAgaGFzTGlzdGVuZXJPcmRlckRlcGVuZGVuY2llcz86IGJvb2xlYW47XG5cbiAgLy8gQ2hhbmdlcyB0aGUgYmVoYXZpb3Igb2YgaG93IGxpc3RlbmVycyBhcmUgbm90aWZpZWQgaW4gcmVlbnRyYW50IGNhc2VzICh3aGVyZSBsaW5rZWQgbGlzdGVuZXJzIGNhdXNlIHRoaXMgUHJvcGVydHlcbiAgLy8gdG8gY2hhbmdlIGl0cyB2YWx1ZSBhZ2FpbikuIERlZmF1bHRzIHRvIFwicXVldWVcIiBmb3IgUHJvcGVydGllcyBzbyB0aGF0IHdlIG5vdGlmeSBhbGwgbGlzdGVuZXJzIGZvciBhIHZhbHVlIGNoYW5nZVxuICAvLyBiZWZvcmUgbm90aWZ5aW5nIGZvciB0aGUgbmV4dCB2YWx1ZSBjaGFuZ2UuIEZvciBleGFtcGxlLCBpZiB3ZSBjaGFuZ2UgZnJvbSBhLT5iLCBhbmQgb25lIGxpc3RlbmVyIGNoYW5nZXMgdGhlIHZhbHVlXG4gIC8vIGZyb20gYi0+YywgdGhhdCByZWVudHJhbnQgdmFsdWUgY2hhbmdlIHdpbGwgcXVldWUgaXRzIGxpc3RlbmVycyBmb3IgYWZ0ZXIgYWxsIGxpc3RlbmVycyBoYXZlIGZpcmVkIGZvciBhLT5iLiBGb3JcbiAgLy8gc3BlY2lmaWNzIHNlZSBkb2N1bWVudGF0aW9uIGluIFRpbnlFbWl0dGVyLlxufSAmIFBpY2s8VGlueUVtaXR0ZXJPcHRpb25zLCAncmVlbnRyYW50Tm90aWZpY2F0aW9uU3RyYXRlZ3knPjtcblxudHlwZSBQYXJlbnRPcHRpb25zPFQ+ID0gVmFsaWRhdG9yPFQ+ICYgUGhldGlvT2JqZWN0T3B0aW9ucztcblxuLy8gT3B0aW9ucyB0aGF0IGNhbiBiZSBwYXNzZWQgaW5cbmV4cG9ydCB0eXBlIFByb3BlcnR5T3B0aW9uczxUPiA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxQYXJlbnRPcHRpb25zPFQ+LCAncGhldGlvVHlwZSc+O1xuXG5leHBvcnQgdHlwZSBMaW5rT3B0aW9ucyA9IHtcbiAgcGhldGlvRGVwZW5kZW5jaWVzPzogQXJyYXk8VFJlYWRPbmx5UHJvcGVydHk8dW5rbm93bj4+O1xufTtcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBQcm9wZXJ0eSwgRGVyaXZlZFByb3BlcnR5LCBEeW5hbWljUHJvcGVydHkuICBTZXQgbWV0aG9kcyBhcmUgcHJvdGVjdGVkL25vdCBwYXJ0IG9mIHRoZSBwdWJsaWNcbiAqIGludGVyZmFjZS4gIEluaXRpYWwgdmFsdWUgYW5kIHJlc2V0dGluZyBpcyBub3QgZGVmaW5lZCBoZXJlLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWFkT25seVByb3BlcnR5PFQ+IGV4dGVuZHMgUGhldGlvT2JqZWN0IGltcGxlbWVudHMgVFJlYWRPbmx5UHJvcGVydHk8VD4ge1xuXG4gIC8vIFVuaXF1ZSBpZGVudGlmaWVyIGZvciB0aGlzIFByb3BlcnR5LlxuICBwcml2YXRlIHJlYWRvbmx5IGlkOiBudW1iZXI7XG5cbiAgLy8gKHBoZXQtaW8pIFVuaXRzLCBpZiBhbnkuICBTZWUgdW5pdHMuanMgZm9yIHZhbGlkIHZhbHVlc1xuICBwdWJsaWMgcmVhZG9ubHkgdW5pdHM6IFVuaXRzIHwgbnVsbDtcblxuICBwdWJsaWMgcmVhZG9ubHkgdmFsaWRWYWx1ZXM/OiByZWFkb25seSBUW107XG5cbiAgLy8gZW1pdCBpcyBjYWxsZWQgd2hlbiB0aGUgdmFsdWUgY2hhbmdlcyAob3Igb24gbGluaylcbiAgcHJpdmF0ZSB0aW55UHJvcGVydHk6IFRpbnlQcm9wZXJ0eTxUPjtcblxuICAvLyB3aGV0aGVyIHdlIGFyZSBpbiB0aGUgcHJvY2VzcyBvZiBub3RpZnlpbmcgbGlzdGVuZXJzOyBjaGFuZ2VkIGluIHNvbWUgUHJvcGVydHkgdGVzdCBmaWxlcyB3aXRoIEB0cy1leHBlY3QtZXJyb3JcbiAgcHJpdmF0ZSBub3RpZnlpbmc6IGJvb2xlYW47XG5cbiAgLy8gd2hldGhlciB0byBhbGxvdyByZWVudHJ5IG9mIGNhbGxzIHRvIHNldFxuICBwcml2YXRlIHJlYWRvbmx5IHJlZW50cmFudDogYm9vbGVhbjtcblxuICAvLyB3aGlsZSBkZWZlcnJlZCwgbmV3IHZhbHVlcyBuZWl0aGVyIHRha2UgZWZmZWN0IG5vciBzZW5kIG5vdGlmaWNhdGlvbnMuICBXaGVuIGlzRGVmZXJyZWQgY2hhbmdlcyBmcm9tXG4gIC8vIHRydWUgdG8gZmFsc2UsIHRoZSBmaW5hbCBkZWZlcnJlZCB2YWx1ZSBiZWNvbWVzIHRoZSBQcm9wZXJ0eSB2YWx1ZS4gIEFuIGFjdGlvbiBpcyBjcmVhdGVkIHdoaWNoIGNhbiBiZSBpbnZva2VkIHRvXG4gIC8vIHNlbmQgbm90aWZpY2F0aW9ucy5cbiAgcHVibGljIGlzRGVmZXJyZWQ6IGJvb2xlYW47XG5cbiAgLy8gdGhlIHZhbHVlIHRoYXQgdGhpcyBQcm9wZXJ0eSB3aWxsIHRha2UgYWZ0ZXIgbm8gbG9uZ2VyIGRlZmVycmVkXG4gIHByb3RlY3RlZCBkZWZlcnJlZFZhbHVlOiBUIHwgbnVsbDtcblxuICAvLyB3aGV0aGVyIGEgZGVmZXJyZWQgdmFsdWUgaGFzIGJlZW4gc2V0XG4gIHByb3RlY3RlZCBoYXNEZWZlcnJlZFZhbHVlOiBib29sZWFuO1xuXG4gIHByb3RlY3RlZCByZWFkb25seSB2YWx1ZVZhbGlkYXRvcjogVmFsaWRhdG9yPFQ+O1xuXG4gIC8vIFRoZSBJT1R5cGUgZm9yIHRoZSB2YWx1ZXMgdGhpcyBQcm9wZXJ0eSBzdXBwb3J0cy5cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHBoZXRpb1ZhbHVlVHlwZTogSU9UeXBlO1xuXG5cbiAgLyoqXG4gICAqIFRoaXMgaXMgcHJvdGVjdGVkIHRvIGluZGljYXRlIHRvIGNsaWVudHMgdGhhdCBzdWJjbGFzc2VzIHNob3VsZCBiZSB1c2VkIGluc3RlYWQuXG4gICAqIEBwYXJhbSB2YWx1ZSAtIHRoZSBpbml0aWFsIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eVxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cbiAgICovXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvciggdmFsdWU6IFQsIHByb3ZpZGVkT3B0aW9ucz86IFByb3BlcnR5T3B0aW9uczxUPiApIHtcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFByb3BlcnR5T3B0aW9uczxUPiwgU2VsZk9wdGlvbnMsIFBhcmVudE9wdGlvbnM8VD4+KCkoIHtcbiAgICAgIHVuaXRzOiBudWxsLFxuICAgICAgcmVlbnRyYW50OiBmYWxzZSxcbiAgICAgIGhhc0xpc3RlbmVyT3JkZXJEZXBlbmRlbmNpZXM6IGZhbHNlLFxuICAgICAgcmVlbnRyYW50Tm90aWZpY2F0aW9uU3RyYXRlZ3k6ICdxdWV1ZScsXG5cbiAgICAgIC8vIFNlZSBWYWxpZGF0aW9uLnRzIGZvciBWYWx1ZUNvbXBhcmlzb25TdHJhdGVneSBmb3IgYXZhaWxhYmxlIHZhbHVlcy4gUGxlYXNlIG5vdGUgdGhhdCB0aGlzIHdpbGwgYmUgdXNlZCBmb3JcbiAgICAgIC8vIGVxdWFsaXR5IGNvbXBhcmlzb24gYm90aCB3aXRoIHZhbGlkYXRpb24gKGkuZS4gZm9yIHZhbGlkVmFsdWUgY29tcGFyaXNvbiksIGFzIHdlbGwgYXMgZGV0ZXJtaW5pbmcgaWYgdGhlXG4gICAgICAvLyB2YWx1ZSBoYXMgY2hhbmdlZCBzdWNoIHRoYXQgbGlzdGVuZXJzIHNob3VsZCBmaXJlLCBzZWUgVGlueVByb3BlcnR5LmFyZVZhbHVlc0VxdWFsKCkuXG4gICAgICB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneTogJ3JlZmVyZW5jZScsXG5cbiAgICAgIC8vIHBoZXQtaW9cbiAgICAgIHRhbmRlbU5hbWVTdWZmaXg6IFsgJ1Byb3BlcnR5JywgRFlOQU1JQ19BUkNIRVRZUEVfTkFNRSBdLCAvLyBEWU5BTUlDX0FSQ0hFVFlQRV9OQU1FIG1lYW5zIHRoYXQgdGhpcyBQcm9wZXJ0eSBpcyBhbiBhcmNoZXR5cGUuXG4gICAgICBwaGV0aW9PdXRlclR5cGU6IFJlYWRPbmx5UHJvcGVydHkuUHJvcGVydHlJTyxcbiAgICAgIHBoZXRpb1ZhbHVlVHlwZTogSU9UeXBlLk9iamVjdElPXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cblxuICAgIGFzc2VydCAmJiBvcHRpb25zLnVuaXRzICYmIGFzc2VydCggdW5pdHMuaXNWYWxpZFVuaXRzKCBvcHRpb25zLnVuaXRzICksIGBpbnZhbGlkIHVuaXRzOiAke29wdGlvbnMudW5pdHN9YCApO1xuICAgIGlmICggb3B0aW9ucy51bml0cyApIHtcbiAgICAgIG9wdGlvbnMucGhldGlvRXZlbnRNZXRhZGF0YSA9IG9wdGlvbnMucGhldGlvRXZlbnRNZXRhZGF0YSB8fCB7fTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLnBoZXRpb0V2ZW50TWV0YWRhdGEuaGFzT3duUHJvcGVydHkoICd1bml0cycgKSwgJ3VuaXRzIHNob3VsZCBiZSBzdXBwbGllZCBieSBQcm9wZXJ0eSwgbm90IGVsc2V3aGVyZScgKTtcbiAgICAgIG9wdGlvbnMucGhldGlvRXZlbnRNZXRhZGF0YS51bml0cyA9IG9wdGlvbnMudW5pdHM7XG4gICAgfVxuXG4gICAgaWYgKCBhc3NlcnQgJiYgcHJvdmlkZWRPcHRpb25zICkge1xuXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0tIGZvciBjaGVja2luZyBKUyBjb2RlXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhcHJvdmlkZWRPcHRpb25zLnBoZXRpb1R5cGUsICdTZXQgcGhldGlvVHlwZSB2aWEgcGhldGlvVmFsdWVUeXBlJyApO1xuICAgIH1cblxuICAgIC8vIENvbnN0cnVjdCB0aGUgSU9UeXBlXG4gICAgaWYgKCBvcHRpb25zLnBoZXRpb091dGVyVHlwZSAmJiBvcHRpb25zLnBoZXRpb1ZhbHVlVHlwZSApIHtcbiAgICAgIG9wdGlvbnMucGhldGlvVHlwZSA9IG9wdGlvbnMucGhldGlvT3V0ZXJUeXBlKCBvcHRpb25zLnBoZXRpb1ZhbHVlVHlwZSApO1xuICAgIH1cblxuICAgIC8vIFN1cHBvcnQgbm9uLXZhbGlkYXRlZCBQcm9wZXJ0eVxuICAgIGlmICggIVZhbGlkYXRpb24uY29udGFpbnNWYWxpZGF0b3JLZXkoIG9wdGlvbnMgKSApIHtcbiAgICAgIG9wdGlvbnMuaXNWYWxpZFZhbHVlID0gKCkgPT4gdHJ1ZTtcbiAgICB9XG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcbiAgICB0aGlzLmlkID0gZ2xvYmFsSWQrKztcbiAgICB0aGlzLnVuaXRzID0gb3B0aW9ucy51bml0cztcblxuICAgIC8vIFdoZW4gcnVubmluZyBhcyBwaGV0LWlvLCBpZiB0aGUgdGFuZGVtIGlzIHNwZWNpZmllZCwgdGhlIHR5cGUgbXVzdCBiZSBzcGVjaWZpZWQuXG4gICAgaWYgKCB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKSB7XG5cbiAgICAgIC8vIFRoaXMgYXNzZXJ0aW9uIGhlbHBzIGluIGluc3RydW1lbnRpbmcgY29kZSB0aGF0IGhhcyB0aGUgdGFuZGVtIGJ1dCBub3QgdHlwZVxuICAgICAgYXNzZXJ0ICYmIFRhbmRlbS5WQUxJREFUSU9OICYmIGFzc2VydCggdGhpcy5waGV0aW9UeXBlLFxuICAgICAgICBgcGhldGlvVHlwZSBwYXNzZWQgdG8gUHJvcGVydHkgbXVzdCBiZSBzcGVjaWZpZWQuIFRhbmRlbS5waGV0aW9JRDogJHt0aGlzLnRhbmRlbS5waGV0aW9JRH1gICk7XG5cbiAgICAgIGFzc2VydCAmJiBUYW5kZW0uVkFMSURBVElPTiAmJiBhc3NlcnQoIG9wdGlvbnMucGhldGlvVHlwZS5wYXJhbWV0ZXJUeXBlcyFbIDAgXSxcbiAgICAgICAgYHBoZXRpb1R5cGUgcGFyYW1ldGVyIHR5cGUgbXVzdCBiZSBzcGVjaWZpZWQgKG9ubHkgb25lKS4gVGFuZGVtLnBoZXRpb0lEOiAke3RoaXMudGFuZGVtLnBoZXRpb0lEfWAgKTtcblxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5waGV0aW9WYWx1ZVR5cGUgIT09IElPVHlwZS5PYmplY3RJTyxcbiAgICAgICAgJ1BoRVQtaU8gUHJvcGVydGllcyBtdXN0IHNwZWNpZnkgYSBwaGV0aW9WYWx1ZVR5cGU6ICcgKyB0aGlzLnBoZXRpb0lEICk7XG4gICAgfVxuXG4gICAgdGhpcy52YWxpZFZhbHVlcyA9IG9wdGlvbnMudmFsaWRWYWx1ZXM7XG5cbiAgICB0aGlzLnRpbnlQcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHkoIHZhbHVlLCBudWxsLCBvcHRpb25zLmhhc0xpc3RlbmVyT3JkZXJEZXBlbmRlbmNpZXMsIG9wdGlvbnMucmVlbnRyYW50Tm90aWZpY2F0aW9uU3RyYXRlZ3kgKTtcblxuICAgIC8vIFNpbmNlIHdlIGFyZSBhbHJlYWR5IGluIHRoZSBoZWF2eXdlaWdodCBQcm9wZXJ0eSwgd2UgYWx3YXlzIGFzc2lnbiBUaW55UHJvcGVydHkudmFsdWVDb21wYXJpc29uU3RyYXRlZ3kgZm9yIGNsYXJpdHkuXG4gICAgdGhpcy50aW55UHJvcGVydHkudmFsdWVDb21wYXJpc29uU3RyYXRlZ3kgPSBvcHRpb25zLnZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5O1xuICAgIHRoaXMubm90aWZ5aW5nID0gZmFsc2U7XG4gICAgdGhpcy5yZWVudHJhbnQgPSBvcHRpb25zLnJlZW50cmFudDtcbiAgICB0aGlzLmlzRGVmZXJyZWQgPSBmYWxzZTtcbiAgICB0aGlzLmRlZmVycmVkVmFsdWUgPSBudWxsO1xuICAgIHRoaXMuaGFzRGVmZXJyZWRWYWx1ZSA9IGZhbHNlO1xuICAgIHRoaXMucGhldGlvVmFsdWVUeXBlID0gb3B0aW9ucy5waGV0aW9WYWx1ZVR5cGU7XG5cbiAgICB0aGlzLnZhbHVlVmFsaWRhdG9yID0gXy5waWNrKCBvcHRpb25zLCBWYWxpZGF0aW9uLlZBTElEQVRPUl9LRVlTICk7XG4gICAgdGhpcy52YWx1ZVZhbGlkYXRvci52YWxpZGF0aW9uTWVzc2FnZSA9IHRoaXMudmFsdWVWYWxpZGF0b3IudmFsaWRhdGlvbk1lc3NhZ2UgfHwgJ1Byb3BlcnR5IHZhbHVlIG5vdCB2YWxpZCc7XG5cbiAgICBpZiAoIHRoaXMudmFsdWVWYWxpZGF0b3IucGhldGlvVHlwZSApIHtcblxuICAgICAgLy8gVmFsaWRhdGUgdGhlIHZhbHVlIHR5cGUncyBwaGV0aW9UeXBlIG9mIHRoZSBQcm9wZXJ0eSwgbm90IHRoZSBQcm9wZXJ0eUlPIGl0c2VsZi5cbiAgICAgIC8vIEZvciBleGFtcGxlLCBmb3IgUHJvcGVydHlJTyggQm9vbGVhbklPICksIGFzc2lnbiB0aGlzIHZhbHVlVmFsaWRhdG9yJ3MgcGhldGlvVHlwZSB0byBiZSBCb29sZWFuSU8ncyB2YWxpZGF0b3IuXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhIXRoaXMudmFsdWVWYWxpZGF0b3IucGhldGlvVHlwZS5wYXJhbWV0ZXJUeXBlcyFbIDAgXSwgJ3VuZXhwZWN0ZWQgbnVtYmVyIG9mIHBhcmFtZXRlcnMgZm9yIFByb3BlcnR5JyApO1xuXG4gICAgICAvLyBUaGlzIGlzIHRoZSB2YWxpZGF0b3IgZm9yIHRoZSB2YWx1ZSwgbm90IGZvciB0aGUgUHJvcGVydHkgaXRzZWxmXG4gICAgICB0aGlzLnZhbHVlVmFsaWRhdG9yLnBoZXRpb1R5cGUgPSB0aGlzLnZhbHVlVmFsaWRhdG9yLnBoZXRpb1R5cGUucGFyYW1ldGVyVHlwZXMhWyAwIF07XG4gICAgfVxuXG4gICAgLy8gQXNzZXJ0aW9ucyByZWdhcmRpbmcgdmFsdWUgdmFsaWRhdGlvblxuICAgIGlmICggYXNzZXJ0ICkge1xuXG4gICAgICBWYWxpZGF0aW9uLnZhbGlkYXRlVmFsaWRhdG9yKCB0aGlzLnZhbHVlVmFsaWRhdG9yICk7XG5cbiAgICAgIC8vIHZhbGlkYXRlIHRoZSBpbml0aWFsIHZhbHVlIGFzIHdlbGwgYXMgYW55IGNoYW5nZXMgaW4gdGhlIGZ1dHVyZVxuICAgICAgdmFsaWRhdGUoIHZhbHVlLCB0aGlzLnZhbHVlVmFsaWRhdG9yLCBWQUxJREFURV9PUFRJT05TX0ZBTFNFICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgdmFsdWUgY2FuIGJlIHNldCBleHRlcm5hbGx5LCB1c2luZyAudmFsdWU9IG9yIHNldCgpXG4gICAqL1xuICBwdWJsaWMgaXNTZXR0YWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgdmFsdWUuXG4gICAqIFlvdSBjYW4gYWxzbyB1c2UgdGhlIGVzNSBnZXR0ZXIgKHByb3BlcnR5LnZhbHVlKSBidXQgdGhpcyBtZWFucyBpcyBwcm92aWRlZCBmb3IgaW5uZXIgbG9vcHNcbiAgICogb3IgaW50ZXJuYWwgY29kZSB0aGF0IG11c3QgYmUgZmFzdC5cbiAgICovXG4gIHB1YmxpYyBnZXQoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMudGlueVByb3BlcnR5LmdldCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHZhbHVlIGFuZCBub3RpZmllcyBsaXN0ZW5lcnMsIHVubGVzcyBkZWZlcnJlZCBvciBkaXNwb3NlZC4gWW91IGNhbiBhbHNvIHVzZSB0aGUgZXM1IGdldHRlclxuICAgKiAocHJvcGVydHkudmFsdWUpIGJ1dCB0aGlzIG1lYW5zIGlzIHByb3ZpZGVkIGZvciBpbm5lciBsb29wcyBvciBpbnRlcm5hbCBjb2RlIHRoYXQgbXVzdCBiZSBmYXN0LiBJZiB0aGUgdmFsdWVcbiAgICogaGFzbid0IGNoYW5nZWQsIHRoaXMgaXMgYSBuby1vcC5cbiAgICpcbiAgICogTk9URTogRm9yIFBoRVQtaU8gaW5zdHJ1bWVudGVkIFByb3BlcnRpZXMgdGhhdCBhcmUgcGhldGlvU3RhdGU6IHRydWUsIHRoZSB2YWx1ZSBpcyBvbmx5XG4gICAqIHNldCBieSB0aGUgUGhldGlvU3RhdGVFbmdpbmUgYW5kIGNhbm5vdCBiZSBtb2RpZmllZCBieSBvdGhlciBjb2RlIHdoaWxlIGlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkgPT09IHRydWUuXG4gICAqL1xuICBwcm90ZWN0ZWQgc2V0KCB2YWx1ZTogVCApOiB2b2lkIHtcblxuICAgIC8vIFN0YXRlIGlzIG1hbmFnZWQgYnkgdGhlIFBoZXRpb1N0YXRlRW5naW5lLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2F4b24vaXNzdWVzLzQwOVxuICAgIGNvbnN0IHNldE1hbmFnZWRCeVBoZXRpb1N0YXRlID0gaXNQaGV0aW9TdGF0ZUVuZ2luZU1hbmFnaW5nUHJvcGVydHlWYWx1ZXNQcm9wZXJ0eS52YWx1ZSAmJlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBzdGlsbCB3YW50IHRvIHNldCBQcm9wZXJ0aWVzIHdoZW4gY2xlYXJpbmcgZHluYW1pYyBlbGVtZW50cywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvL2lzc3Vlcy8xOTA2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhaXNDbGVhcmluZ1BoZXRpb0R5bmFtaWNFbGVtZW50c1Byb3BlcnR5LnZhbHVlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgJiYgdGhpcy5waGV0aW9TdGF0ZSAmJlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBIb3dldmVyLCBEZXJpdmVkUHJvcGVydHkgc2hvdWxkIGJlIGFibGUgdG8gdXBkYXRlIGR1cmluZyBQaEVULWlPIHN0YXRlIHNldFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1NldHRhYmxlKCk7XG5cbiAgICBpZiAoICFzZXRNYW5hZ2VkQnlQaGV0aW9TdGF0ZSApIHtcbiAgICAgIHRoaXMudW5ndWFyZGVkU2V0KCB2YWx1ZSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIFVuY29tbWVudCB3aGlsZSBpbXBsZW1lbnRpbmcgUGhFVC1pTyBTdGF0ZSBmb3IgeW91ciBzaW11bGF0aW9uIHRvIHNlZSB3aGF0IHZhbHVlLXNldHRpbmcgaXMgYmVpbmcgc2lsZW50bHkgaWdub3JlZC5cbiAgICAgIC8vIGNvbnNvbGUud2FybiggYElnbm9yaW5nIGF0dGVtcHQgdG8gUmVhZE9ubHlQcm9wZXJ0eS5zZXQoKTogJHt0aGlzLnBoZXRpb0lEfWAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRm9yIHVzYWdlIGJ5IHRoZSBJT1R5cGUgZHVyaW5nIFBoRVQtaU8gc3RhdGUgc2V0dGluZy5cbiAgICovXG4gIHByb3RlY3RlZCB1bmd1YXJkZWRTZXQoIHZhbHVlOiBUICk6IHZvaWQge1xuICAgIGlmICggIXRoaXMuaXNEaXNwb3NlZCApIHtcbiAgICAgIGlmICggdGhpcy5pc0RlZmVycmVkICkge1xuICAgICAgICB0aGlzLmRlZmVycmVkVmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5oYXNEZWZlcnJlZFZhbHVlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCAhdGhpcy5lcXVhbHNWYWx1ZSggdmFsdWUgKSApIHtcbiAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSB0aGlzLmdldCgpO1xuICAgICAgICB0aGlzLnNldFByb3BlcnR5VmFsdWUoIHZhbHVlICk7XG4gICAgICAgIHRoaXMuX25vdGlmeUxpc3RlbmVycyggb2xkVmFsdWUgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdmFsdWUgd2l0aG91dCBub3RpZnlpbmcgYW55IGxpc3RlbmVycy4gVGhpcyBpcyBhIHBsYWNlIHRvIG92ZXJyaWRlIGlmIGEgc3VidHlwZSBwZXJmb3JtcyBhZGRpdGlvbmFsIHdvcmtcbiAgICogd2hlbiBzZXR0aW5nIHRoZSB2YWx1ZS5cbiAgICovXG4gIHByb3RlY3RlZCBzZXRQcm9wZXJ0eVZhbHVlKCB2YWx1ZTogVCApOiB2b2lkIHtcbiAgICB0aGlzLnRpbnlQcm9wZXJ0eS5zZXRQcm9wZXJ0eVZhbHVlKCB2YWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBhbmQgb25seSBpZiB0aGUgc3BlY2lmaWVkIHZhbHVlIGVxdWFscyB0aGUgdmFsdWUgb2YgdGhpcyBwcm9wZXJ0eVxuICAgKi9cbiAgcHJvdGVjdGVkIGVxdWFsc1ZhbHVlKCB2YWx1ZTogVCApOiBib29sZWFuIHtcblxuICAgIC8vIElkZWFsbHksIHdlIHdvdWxkIGNhbGwgdGhlIGVxdWFsc1ZhbHVlIGluIHRpbnlQcm9wZXJ0eSwgYnV0IGl0IGlzIHByb3RlY3RlZC4gRnVydGhlcm1vcmUsIGl0IGlzIG5pY2UgdG8gZ2V0XG4gICAgLy8gdGhlIGFzc2VydGlvbnMgYXNzb2NpYXRlZCB3aXRoIFJlYWRPbmx5UHJvcGVydHkuZ2V0KCkuXG4gICAgcmV0dXJuIHRoaXMuYXJlVmFsdWVzRXF1YWwoIHZhbHVlLCB0aGlzLmdldCgpICk7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lIGlmIHRoZSB0d28gdmFsdWVzIGFyZSBlcXVhbCwgc2VlIFRpbnlQcm9wZXJ0eS5hcmVWYWx1ZXNFcXVhbCgpLlxuICAgKi9cbiAgcHVibGljIGFyZVZhbHVlc0VxdWFsKCBhOiBULCBiOiBUICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnRpbnlQcm9wZXJ0eS5hcmVWYWx1ZXNFcXVhbCggYSwgYiApO1xuICB9XG5cbiAgLyoqXG4gICAqIE5PVEU6IGEgZmV3IHNpbXMgYXJlIGNhbGxpbmcgdGhpcyBldmVuIHRob3VnaCB0aGV5IHNob3VsZG4ndFxuICAgKi9cbiAgcHJpdmF0ZSBfbm90aWZ5TGlzdGVuZXJzKCBvbGRWYWx1ZTogVCB8IG51bGwgKTogdm9pZCB7XG4gICAgY29uc3QgbmV3VmFsdWUgPSB0aGlzLmdldCgpO1xuXG4gICAgLy8gdmFsaWRhdGUgdGhlIGJlZm9yZSBub3RpZnlpbmcgbGlzdGVuZXJzXG4gICAgYXNzZXJ0ICYmIHZhbGlkYXRlKCBuZXdWYWx1ZSwgdGhpcy52YWx1ZVZhbGlkYXRvciwgVkFMSURBVEVfT1BUSU9OU19GQUxTRSApO1xuXG4gICAgLy8gQWx0aG91Z2ggdGhpcyBpcyBub3QgdGhlIGlkaW9tYXRpYyBwYXR0ZXJuIChzaW5jZSBpdCBpcyBndWFyZGVkIGluIHRoZSBwaGV0aW9TdGFydEV2ZW50KSwgdGhpcyBmdW5jdGlvbiBpc1xuICAgIC8vIGNhbGxlZCBzbyBtYW55IHRpbWVzIHRoYXQgaXQgaXMgd29ydGggdGhlIG9wdGltaXphdGlvbiBmb3IgUGhFVCBicmFuZC5cbiAgICBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICYmIHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSAmJiB0aGlzLnBoZXRpb1N0YXJ0RXZlbnQoIFJlYWRPbmx5UHJvcGVydHkuQ0hBTkdFRF9FVkVOVF9OQU1FLCB7XG4gICAgICBnZXREYXRhOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcmFtZXRlclR5cGUgPSB0aGlzLnBoZXRpb1R5cGUucGFyYW1ldGVyVHlwZXMhWyAwIF07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgb2xkVmFsdWU6IE51bGxhYmxlSU8oIHBhcmFtZXRlclR5cGUgKS50b1N0YXRlT2JqZWN0KCBvbGRWYWx1ZSApLFxuICAgICAgICAgIG5ld1ZhbHVlOiBwYXJhbWV0ZXJUeXBlLnRvU3RhdGVPYmplY3QoIG5ld1ZhbHVlIClcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICAvLyBub3RpZnkgbGlzdGVuZXJzLCBvcHRpb25hbGx5IGRldGVjdCBsb29wcyB3aGVyZSB0aGlzIFByb3BlcnR5IGlzIHNldCBhZ2FpbiBiZWZvcmUgdGhpcyBjb21wbGV0ZXMuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMubm90aWZ5aW5nIHx8IHRoaXMucmVlbnRyYW50LFxuICAgICAgYHJlZW50cnkgZGV0ZWN0ZWQsIHZhbHVlPSR7bmV3VmFsdWV9LCBvbGRWYWx1ZT0ke29sZFZhbHVlfWAgKTtcbiAgICB0aGlzLm5vdGlmeWluZyA9IHRydWU7XG5cbiAgICB0aGlzLnRpbnlQcm9wZXJ0eS5lbWl0KCBuZXdWYWx1ZSwgb2xkVmFsdWUsIHRoaXMgKTsgLy8gY2Fubm90IHVzZSB0aW55UHJvcGVydHkubm90aWZ5TGlzdGVuZXJzIGJlY2F1c2UgaXQgdXNlcyB0aGUgd3JvbmcgdGhpc1xuICAgIHRoaXMubm90aWZ5aW5nID0gZmFsc2U7XG5cbiAgICBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICYmIHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSAmJiB0aGlzLnBoZXRpb0VuZEV2ZW50KCk7XG4gIH1cblxuICAvKipcbiAgICogVXNlIHRoaXMgbWV0aG9kIHdoZW4gbXV0YXRpbmcgYSB2YWx1ZSAobm90IHJlcGxhY2luZyB3aXRoIGEgbmV3IGluc3RhbmNlKSBhbmQgeW91IHdhbnQgdG8gc2VuZCBub3RpZmljYXRpb25zIGFib3V0IHRoZSBjaGFuZ2UuXG4gICAqIFRoaXMgaXMgZGlmZmVyZW50IGZyb20gdGhlIG5vcm1hbCBheG9uIHN0cmF0ZWd5LCBidXQgbWF5IGJlIG5lY2Vzc2FyeSB0byBwcmV2ZW50IG1lbW9yeSBhbGxvY2F0aW9ucy5cbiAgICogVGhpcyBtZXRob2QgaXMgdW5zYWZlIGZvciByZW1vdmluZyBsaXN0ZW5lcnMgYmVjYXVzZSBpdCBhc3N1bWVzIHRoZSBsaXN0ZW5lciBsaXN0IG5vdCBtb2RpZmllZCwgdG8gc2F2ZSBhbm90aGVyIGFsbG9jYXRpb25cbiAgICogT25seSBwcm92aWRlcyB0aGUgbmV3IHJlZmVyZW5jZSBhcyBhIGNhbGxiYWNrIChubyBvbGRWYWx1ZSlcbiAgICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9heG9uL2lzc3Vlcy82XG4gICAqL1xuICBwdWJsaWMgbm90aWZ5TGlzdGVuZXJzU3RhdGljKCk6IHZvaWQge1xuICAgIHRoaXMuX25vdGlmeUxpc3RlbmVycyggbnVsbCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZW4gZGVmZXJyZWQsIHNldCB2YWx1ZXMgZG8gbm90IHRha2UgZWZmZWN0IG9yIHNlbmQgb3V0IG5vdGlmaWNhdGlvbnMuICBBZnRlciBkZWZlciBlbmRzLCB0aGUgUHJvcGVydHkgdGFrZXNcbiAgICogaXRzIGRlZmVycmVkIHZhbHVlIChpZiBhbnkpLCBhbmQgYSBmb2xsb3ctdXAgYWN0aW9uIChyZXR1cm4gdmFsdWUpIGNhbiBiZSBpbnZva2VkIHRvIHNlbmQgb3V0IG5vdGlmaWNhdGlvbnNcbiAgICogb25jZSBvdGhlciBQcm9wZXJ0aWVzIGhhdmUgYWxzbyB0YWtlbiB0aGVpciBkZWZlcnJlZCB2YWx1ZXMuXG4gICAqXG4gICAqIEBwYXJhbSBpc0RlZmVycmVkIC0gd2hldGhlciB0aGUgUHJvcGVydHkgc2hvdWxkIGJlIGRlZmVycmVkIG9yIG5vdFxuICAgKiBAcmV0dXJucyAtIGZ1bmN0aW9uIHRvIG5vdGlmeSBsaXN0ZW5lcnMgYWZ0ZXIgY2FsbGluZyBzZXREZWZlcnJlZChmYWxzZSksXG4gICAqICAgICAgICAgIC0gbnVsbCBpZiBpc0RlZmVycmVkIGlzIHRydWUsIG9yIGlmIHRoZSB2YWx1ZSBpcyB1bmNoYW5nZWQgc2luY2UgY2FsbGluZyBzZXREZWZlcnJlZCh0cnVlKVxuICAgKi9cbiAgcHVibGljIHNldERlZmVycmVkKCBpc0RlZmVycmVkOiBib29sZWFuICk6ICggKCkgPT4gdm9pZCApIHwgbnVsbCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuaXNEaXNwb3NlZCwgJ2Nhbm5vdCBkZWZlciBQcm9wZXJ0eSBpZiBhbHJlYWR5IGRpc3Bvc2VkLicgKTtcbiAgICBpZiAoIGlzRGVmZXJyZWQgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pc0RlZmVycmVkLCAnUHJvcGVydHkgYWxyZWFkeSBkZWZlcnJlZCcgKTtcbiAgICAgIHRoaXMuaXNEZWZlcnJlZCA9IHRydWU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc0RlZmVycmVkLCAnUHJvcGVydHkgd2FzblxcJ3QgZGVmZXJyZWQnICk7XG4gICAgICB0aGlzLmlzRGVmZXJyZWQgPSBmYWxzZTtcblxuICAgICAgY29uc3Qgb2xkVmFsdWUgPSB0aGlzLmdldCgpO1xuXG4gICAgICAvLyBUYWtlIHRoZSBuZXcgdmFsdWVcbiAgICAgIGlmICggdGhpcy5oYXNEZWZlcnJlZFZhbHVlICkge1xuICAgICAgICB0aGlzLnNldFByb3BlcnR5VmFsdWUoIHRoaXMuZGVmZXJyZWRWYWx1ZSEgKTtcbiAgICAgICAgdGhpcy5oYXNEZWZlcnJlZFZhbHVlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZGVmZXJyZWRWYWx1ZSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZSB2YWx1ZSBoYXMgY2hhbmdlZCwgcHJlcGFyZSB0byBzZW5kIG91dCBub3RpZmljYXRpb25zIChhZnRlciBhbGwgb3RoZXIgUHJvcGVydGllcyBpbiB0aGlzIHRyYW5zYWN0aW9uXG4gICAgICAvLyBoYXZlIHRoZWlyIGZpbmFsIHZhbHVlcylcbiAgICAgIGlmICggIXRoaXMuZXF1YWxzVmFsdWUoIG9sZFZhbHVlICkgKSB7XG4gICAgICAgIHJldHVybiAoKSA9PiAhdGhpcy5pc0Rpc3Bvc2VkICYmIHRoaXMuX25vdGlmeUxpc3RlbmVycyggb2xkVmFsdWUgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBubyBhY3Rpb24gdG8gc2lnbmlmeSBjaGFuZ2VcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgdmFsdWUoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgc2V0IHZhbHVlKCBuZXdWYWx1ZTogVCApIHtcbiAgICB0aGlzLnNldCggbmV3VmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGZ1bmN0aW9uIHJlZ2lzdGVycyBhbiBvcmRlciBkZXBlbmRlbmN5IGJldHdlZW4gdGhpcyBQcm9wZXJ0eSBhbmQgYW5vdGhlci4gQmFzaWNhbGx5IHRoaXMgc2F5cyB0aGF0IHdoZW5cbiAgICogc2V0dGluZyBQaEVULWlPIHN0YXRlLCBlYWNoIGRlcGVuZGVuY3kgbXVzdCB0YWtlIGl0cyBmaW5hbCB2YWx1ZSBiZWZvcmUgdGhpcyBQcm9wZXJ0eSBmaXJlcyBpdHMgbm90aWZpY2F0aW9ucy5cbiAgICogU2VlIHByb3BlcnR5U3RhdGVIYW5kbGVyU2luZ2xldG9uLnJlZ2lzdGVyUGhldGlvT3JkZXJEZXBlbmRlbmN5IGFuZCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXhvbi9pc3N1ZXMvMjc2IGZvciBtb3JlIGluZm8uXG4gICAqL1xuICBwdWJsaWMgYWRkUGhldGlvU3RhdGVEZXBlbmRlbmNpZXMoIGRlcGVuZGVuY2llczogQXJyYXk8VFJlYWRPbmx5UHJvcGVydHk8SW50ZW50aW9uYWxBbnk+PiApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBkZXBlbmRlbmNpZXMgKSwgJ0FycmF5IGV4cGVjdGVkJyApO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGRlcGVuZGVuY2llcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IGRlcGVuZGVuY3lQcm9wZXJ0eSA9IGRlcGVuZGVuY2llc1sgaSBdO1xuXG4gICAgICAvLyBvbmx5IGlmIHJ1bm5pbmcgaW4gUGhFVC1pTyBicmFuZCBhbmQgYm90aCBQcm9wZXJ0aWVzIGFyZSBpbnN0cnVtZW50aW5nXG4gICAgICBpZiAoIGRlcGVuZGVuY3lQcm9wZXJ0eSBpbnN0YW5jZW9mIFJlYWRPbmx5UHJvcGVydHkgJiYgZGVwZW5kZW5jeVByb3BlcnR5LmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgJiYgdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpICkge1xuXG4gICAgICAgIC8vIFRoZSBkZXBlbmRlbmN5IHNob3VsZCB1bmRlZmVyICh0YWtpbmcgZGVmZXJyZWQgdmFsdWUpIGJlZm9yZSB0aGlzIFByb3BlcnR5IG5vdGlmaWVzLlxuICAgICAgICBwcm9wZXJ0eVN0YXRlSGFuZGxlclNpbmdsZXRvbi5yZWdpc3RlclBoZXRpb09yZGVyRGVwZW5kZW5jeShcbiAgICAgICAgICBkZXBlbmRlbmN5UHJvcGVydHksIFByb3BlcnR5U3RhdGVQaGFzZS5VTkRFRkVSLFxuICAgICAgICAgIHRoaXMsIFByb3BlcnR5U3RhdGVQaGFzZS5OT1RJRllcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBsaXN0ZW5lciBhbmQgY2FsbHMgaXQgaW1tZWRpYXRlbHkuIElmIGxpc3RlbmVyIGlzIGFscmVhZHkgcmVnaXN0ZXJlZCwgdGhpcyBpcyBhIG5vLW9wLiBUaGUgaW5pdGlhbFxuICAgKiBub3RpZmljYXRpb24gcHJvdmlkZXMgdGhlIGN1cnJlbnQgdmFsdWUgZm9yIG5ld1ZhbHVlIGFuZCBudWxsIGZvciBvbGRWYWx1ZS5cbiAgICpcbiAgICogQHBhcmFtIGxpc3RlbmVyIC0gYSBmdW5jdGlvbiB0aGF0IHRha2VzIGEgbmV3IHZhbHVlLCBvbGQgdmFsdWUsIGFuZCB0aGlzIFByb3BlcnR5IGFzIGFyZ3VtZW50c1xuICAgKiBAcGFyYW0gW29wdGlvbnNdXG4gICAqL1xuICBwdWJsaWMgbGluayggbGlzdGVuZXI6IFByb3BlcnR5TGlua0xpc3RlbmVyPFQ+LCBvcHRpb25zPzogTGlua09wdGlvbnMgKTogdm9pZCB7XG4gICAgaWYgKCBvcHRpb25zICYmIG9wdGlvbnMucGhldGlvRGVwZW5kZW5jaWVzICkge1xuICAgICAgdGhpcy5hZGRQaGV0aW9TdGF0ZURlcGVuZGVuY2llcyggb3B0aW9ucy5waGV0aW9EZXBlbmRlbmNpZXMgKTtcbiAgICB9XG5cbiAgICB0aGlzLnRpbnlQcm9wZXJ0eS5hZGRMaXN0ZW5lciggbGlzdGVuZXIgKTsgLy8gY2Fubm90IHVzZSB0aW55UHJvcGVydHkubGluaygpIGJlY2F1c2Ugb2Ygd3JvbmcgdGhpc1xuICAgIGxpc3RlbmVyKCB0aGlzLmdldCgpLCBudWxsLCB0aGlzICk7IC8vIG51bGwgc2hvdWxkIGJlIHVzZWQgd2hlbiBhbiBvYmplY3QgaXMgZXhwZWN0ZWQgYnV0IHVuYXZhaWxhYmxlXG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgbGlzdGVuZXIgdG8gdGhlIFByb3BlcnR5LCB3aXRob3V0IGNhbGxpbmcgaXQgYmFjayByaWdodCBhd2F5LiBUaGlzIGlzIHVzZWQgd2hlbiB5b3UgbmVlZCB0byByZWdpc3RlciBhXG4gICAqIGxpc3RlbmVyIHdpdGhvdXQgYW4gaW1tZWRpYXRlIGNhbGxiYWNrLlxuICAgKi9cbiAgcHVibGljIGxhenlMaW5rKCBsaXN0ZW5lcjogUHJvcGVydHlMYXp5TGlua0xpc3RlbmVyPFQ+LCBvcHRpb25zPzogTGlua09wdGlvbnMgKTogdm9pZCB7XG4gICAgaWYgKCBvcHRpb25zICYmIG9wdGlvbnMucGhldGlvRGVwZW5kZW5jaWVzICkge1xuICAgICAgdGhpcy5hZGRQaGV0aW9TdGF0ZURlcGVuZGVuY2llcyggb3B0aW9ucy5waGV0aW9EZXBlbmRlbmNpZXMgKTtcbiAgICB9XG4gICAgdGhpcy50aW55UHJvcGVydHkubGF6eUxpbmsoIGxpc3RlbmVyICk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhIGxpc3RlbmVyLiBJZiBsaXN0ZW5lciBpcyBub3QgcmVnaXN0ZXJlZCwgdGhpcyBpcyBhIG5vLW9wLlxuICAgKi9cbiAgcHVibGljIHVubGluayggbGlzdGVuZXI6IFByb3BlcnR5TGlzdGVuZXI8VD4gKTogdm9pZCB7XG4gICAgdGhpcy50aW55UHJvcGVydHkudW5saW5rKCBsaXN0ZW5lciApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYWxsIGxpc3RlbmVycy4gSWYgbm8gbGlzdGVuZXJzIGFyZSByZWdpc3RlcmVkLCB0aGlzIGlzIGEgbm8tb3AuXG4gICAqL1xuICBwdWJsaWMgdW5saW5rQWxsKCk6IHZvaWQge1xuICAgIHRoaXMudGlueVByb3BlcnR5LnVubGlua0FsbCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIExpbmtzIGFuIG9iamVjdCdzIG5hbWVkIGF0dHJpYnV0ZSB0byB0aGlzIHByb3BlcnR5LiAgUmV0dXJucyBhIGhhbmRsZSBzbyBpdCBjYW4gYmUgcmVtb3ZlZCB1c2luZyBQcm9wZXJ0eS51bmxpbmsoKTtcbiAgICogRXhhbXBsZTogbW9kZWxWaXNpYmxlUHJvcGVydHkubGlua0F0dHJpYnV0ZSh2aWV3LCd2aXNpYmxlJyk7XG4gICAqXG4gICAqIE5PVEU6IER1cGxpY2F0ZWQgd2l0aCBUaW55UHJvcGVydHkubGlua0F0dHJpYnV0ZVxuICAgKi9cbiAgcHVibGljIGxpbmtBdHRyaWJ1dGUoIG9iamVjdDogSW50ZW50aW9uYWxBbnksIGF0dHJpYnV0ZU5hbWU6IHN0cmluZyApOiAoIHZhbHVlOiBUICkgPT4gdm9pZCB7XG4gICAgY29uc3QgaGFuZGxlID0gKCB2YWx1ZTogVCApID0+IHsgb2JqZWN0WyBhdHRyaWJ1dGVOYW1lIF0gPSB2YWx1ZTsgfTtcbiAgICB0aGlzLmxpbmsoIGhhbmRsZSApO1xuICAgIHJldHVybiBoYW5kbGU7XG4gIH1cblxuICAvKipcbiAgICogUHJvdmlkZSB0b1N0cmluZyBmb3IgY29uc29sZSBkZWJ1Z2dpbmcsIHNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzI0ODU2MzIvdmFsdWVvZi12cy10b3N0cmluZy1pbi1qYXZhc2NyaXB0XG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFByb3BlcnR5IyR7dGhpcy5pZH17JHt0aGlzLmdldCgpfX1gO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlbmllbmNlIGZ1bmN0aW9uIGZvciBkZWJ1Z2dpbmcgYSBQcm9wZXJ0eSdzIHZhbHVlLiBJdCBwcmludHMgdGhlIG5ldyB2YWx1ZSBvbiByZWdpc3RyYXRpb24gYW5kIHdoZW4gY2hhbmdlZC5cbiAgICogQHBhcmFtIG5hbWUgLSBkZWJ1ZyBuYW1lIHRvIGJlIHByaW50ZWQgb24gdGhlIGNvbnNvbGVcbiAgICogQHJldHVybnMgLSB0aGUgaGFuZGxlIHRvIHRoZSBsaW5rZWQgbGlzdGVuZXIgaW4gY2FzZSBpdCBuZWVkcyB0byBiZSByZW1vdmVkIGxhdGVyXG4gICAqL1xuICBwdWJsaWMgZGVidWcoIG5hbWU6IHN0cmluZyApOiAoIHZhbHVlOiBUICkgPT4gdm9pZCB7XG4gICAgY29uc3QgbGlzdGVuZXIgPSAoIHZhbHVlOiBUICkgPT4gY29uc29sZS5sb2coIG5hbWUsIHZhbHVlICk7XG4gICAgdGhpcy5saW5rKCBsaXN0ZW5lciApO1xuICAgIHJldHVybiBsaXN0ZW5lcjtcbiAgfVxuXG4gIHB1YmxpYyBpc1ZhbHVlVmFsaWQoIHZhbHVlOiBUICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldFZhbGlkYXRpb25FcnJvciggdmFsdWUgKSA9PT0gbnVsbDtcbiAgfVxuXG4gIHB1YmxpYyBnZXRWYWxpZGF0aW9uRXJyb3IoIHZhbHVlOiBUICk6IHN0cmluZyB8IG51bGwge1xuICAgIHJldHVybiBWYWxpZGF0aW9uLmdldFZhbGlkYXRpb25FcnJvciggdmFsdWUsIHRoaXMudmFsdWVWYWxpZGF0b3IsIFZBTElEQVRFX09QVElPTlNfRkFMU0UgKTtcbiAgfVxuXG4gIC8vIEVuc3VyZXMgdGhhdCB0aGUgUHJvcGVydHkgaXMgZWxpZ2libGUgZm9yIEdDXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuXG4gICAgLy8gdW5yZWdpc3RlciBhbnkgb3JkZXIgZGVwZW5kZW5jaWVzIGZvciB0aGlzIFByb3BlcnR5IGZvciBQaEVULWlPIHN0YXRlXG4gICAgaWYgKCB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKSB7XG4gICAgICBwcm9wZXJ0eVN0YXRlSGFuZGxlclNpbmdsZXRvbi51bnJlZ2lzdGVyT3JkZXJEZXBlbmRlbmNpZXNGb3JQcm9wZXJ0eSggdGhpcyApO1xuICAgIH1cblxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgICB0aGlzLnRpbnlQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHdoZXRoZXIgYSBsaXN0ZW5lciBpcyByZWdpc3RlcmVkIHdpdGggdGhpcyBQcm9wZXJ0eVxuICAgKi9cbiAgcHVibGljIGhhc0xpc3RlbmVyKCBsaXN0ZW5lcjogUHJvcGVydHlMaW5rTGlzdGVuZXI8VD4gKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMudGlueVByb3BlcnR5Lmhhc0xpc3RlbmVyKCBsaXN0ZW5lciApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBsaXN0ZW5lcnMuXG4gICAqL1xuICBwcml2YXRlIGdldExpc3RlbmVyQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy50aW55UHJvcGVydHkuZ2V0TGlzdGVuZXJDb3VudCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEludm9rZXMgYSBjYWxsYmFjayBvbmNlIGZvciBlYWNoIGxpc3RlbmVyXG4gICAqIEBwYXJhbSBjYWxsYmFjayAtIHRha2VzIHRoZSBsaXN0ZW5lciBhcyBhbiBhcmd1bWVudFxuICAgKi9cbiAgcHVibGljIGZvckVhY2hMaXN0ZW5lciggY2FsbGJhY2s6ICggdmFsdWU6ICggLi4uYXJnczogWyBULCBUIHwgbnVsbCwgVGlueVByb3BlcnR5PFQ+IHwgUmVhZE9ubHlQcm9wZXJ0eTxUPiBdICkgPT4gdm9pZCApID0+IHZvaWQgKTogdm9pZCB7XG4gICAgdGhpcy50aW55UHJvcGVydHkuZm9yRWFjaExpc3RlbmVyKCBjYWxsYmFjayApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGVyZSBhcmUgYW55IGxpc3RlbmVycy5cbiAgICovXG4gIHB1YmxpYyBoYXNMaXN0ZW5lcnMoKTogYm9vbGVhbiB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYXJndW1lbnRzLmxlbmd0aCA9PT0gMCwgJ1Byb3BlcnR5Lmhhc0xpc3RlbmVycyBzaG91bGQgYmUgY2FsbGVkIHdpdGhvdXQgYXJndW1lbnRzJyApO1xuICAgIHJldHVybiB0aGlzLnRpbnlQcm9wZXJ0eS5oYXNMaXN0ZW5lcnMoKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3koKTogVmFsdWVDb21wYXJpc29uU3RyYXRlZ3k8VD4ge1xuICAgIHJldHVybiB0aGlzLnRpbnlQcm9wZXJ0eS52YWx1ZUNvbXBhcmlzb25TdHJhdGVneTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3koIHZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5OiBWYWx1ZUNvbXBhcmlzb25TdHJhdGVneTxUPiApIHtcbiAgICB0aGlzLnRpbnlQcm9wZXJ0eS52YWx1ZUNvbXBhcmlzb25TdHJhdGVneSA9IHZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5O1xuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudGF0aW9uIG9mIHNlcmlhbGl6YXRpb24gZm9yIFBoRVQtaU8gc3VwcG9ydC4gT3ZlcnJpZGUgdGhpcyBmdW5jdGlvbiB0byBjdXN0b21pemUgaG93IHRoaXMgc3RhdGVcbiAgICogYmVoYXZlcyAoYnV0IGJlIGNhcmVmdWwhKS5cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBpcyBwYXJhbWV0ZXJpemVkIHRvIHN1cHBvcnQgc3VidHlwaW5nLiBUaGF0IHNhaWQsIGl0IGlzIGEgYml0IHVzZWxlc3MsIHNpbmNlIHdlIGRvbid0IHdhbnQgdG9cbiAgICogcGFyYW1ldGVyaXplIFJlYWRPbmx5UHJvcGVydHkgaW4gZ2VuZXJhbCB0byB0aGUgSU9UeXBlJ3Mgc3RhdGUgdHlwZSwgc28gcGxlYXNlIGJlYXIgd2l0aCB1cy5cbiAgICovXG4gIHByb3RlY3RlZCB0b1N0YXRlT2JqZWN0PFN0YXRlVHlwZT4oKTogUmVhZE9ubHlQcm9wZXJ0eVN0YXRlPFN0YXRlVHlwZT4ge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucGhldGlvVmFsdWVUeXBlLnRvU3RhdGVPYmplY3QsIGB0b1N0YXRlT2JqZWN0IGRvZXNuJ3QgZXhpc3QgZm9yICR7dGhpcy5waGV0aW9WYWx1ZVR5cGUudHlwZU5hbWV9YCApO1xuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZTogdGhpcy5waGV0aW9WYWx1ZVR5cGUudG9TdGF0ZU9iamVjdCggdGhpcy52YWx1ZSApLFxuICAgICAgdmFsaWRWYWx1ZXM6IE51bGxhYmxlSU8oIEFycmF5SU8oIHRoaXMucGhldGlvVmFsdWVUeXBlICkgKS50b1N0YXRlT2JqZWN0KCB0aGlzLnZhbGlkVmFsdWVzID09PSB1bmRlZmluZWQgPyBudWxsIDogdGhpcy52YWxpZFZhbHVlcyApLFxuICAgICAgdW5pdHM6IE51bGxhYmxlSU8oIFN0cmluZ0lPICkudG9TdGF0ZU9iamVjdCggdGhpcy51bml0cyApXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRhdGlvbiBvZiBzZXJpYWxpemF0aW9uIGZvciBQaEVULWlPIHN1cHBvcnQuIE92ZXJyaWRlIHRoaXMgZnVuY3Rpb24gdG8gY3VzdG9taXplIGhvdyB0aGlzIHN0YXRlXG4gICAqIGJlaGF2ZXMgKGJ1dCBiZSBjYXJlZnVsISkuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXBwbHlTdGF0ZTxTdGF0ZVR5cGU+KCBzdGF0ZU9iamVjdDogUmVhZE9ubHlQcm9wZXJ0eVN0YXRlPFN0YXRlVHlwZT4gKTogdm9pZCB7XG4gICAgY29uc3QgdW5pdHMgPSBOdWxsYWJsZUlPKCBTdHJpbmdJTyApLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QudW5pdHMgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnVuaXRzID09PSB1bml0cywgJ1Byb3BlcnR5IHVuaXRzIGRvIG5vdCBtYXRjaCcgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzU2V0dGFibGUoKSwgJ1Byb3BlcnR5IHNob3VsZCBiZSBzZXR0YWJsZScgKTtcbiAgICB0aGlzLnVuZ3VhcmRlZFNldCggdGhpcy5waGV0aW9WYWx1ZVR5cGUuZnJvbVN0YXRlT2JqZWN0KCBzdGF0ZU9iamVjdC52YWx1ZSApICk7XG4gIH1cblxuICAvKipcbiAgICogQW4gb2JzZXJ2YWJsZSBQcm9wZXJ0eSB0aGF0IHRyaWdnZXJzIG5vdGlmaWNhdGlvbnMgd2hlbiB0aGUgdmFsdWUgY2hhbmdlcy5cbiAgICogVGhpcyBjYWNoaW5nIGltcGxlbWVudGF0aW9uIHNob3VsZCBiZSBrZXB0IGluIHN5bmMgd2l0aCB0aGUgb3RoZXIgcGFyYW1ldHJpYyBJT1R5cGUgY2FjaGluZyBpbXBsZW1lbnRhdGlvbnMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIFByb3BlcnR5SU88VCwgU3RhdGVUeXBlPiggcGFyYW1ldGVyVHlwZTogSU9UeXBlPFQsIFN0YXRlVHlwZT4gKTogSU9UeXBlIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwYXJhbWV0ZXJUeXBlLCAnUHJvcGVydHlJTyBuZWVkcyBwYXJhbWV0ZXJUeXBlJyApO1xuXG4gICAgaWYgKCAhY2FjaGUuaGFzKCBwYXJhbWV0ZXJUeXBlICkgKSB7XG4gICAgICBjYWNoZS5zZXQoIHBhcmFtZXRlclR5cGUsIG5ldyBJT1R5cGU8UmVhZE9ubHlQcm9wZXJ0eTxUPiwgUmVhZE9ubHlQcm9wZXJ0eVN0YXRlPFN0YXRlVHlwZT4+KCBgUHJvcGVydHlJTzwke3BhcmFtZXRlclR5cGUudHlwZU5hbWV9PmAsIHtcblxuICAgICAgICAvLyBXZSB3YW50IFByb3BlcnR5SU8gdG8gd29yayBmb3IgRHluYW1pY1Byb3BlcnR5IGFuZCBEZXJpdmVkUHJvcGVydHksIGJ1dCB0aGV5IGV4dGVuZCBSZWFkT25seVByb3BlcnR5XG4gICAgICAgIHZhbHVlVHlwZTogUmVhZE9ubHlQcm9wZXJ0eSxcbiAgICAgICAgZG9jdW1lbnRhdGlvbjogJ09ic2VydmFibGUgdmFsdWVzIHRoYXQgc2VuZCBvdXQgbm90aWZpY2F0aW9ucyB3aGVuIHRoZSB2YWx1ZSBjaGFuZ2VzLiBUaGlzIGRpZmZlcnMgZnJvbSB0aGUgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICd0cmFkaXRpb25hbCBsaXN0ZW5lciBwYXR0ZXJuIGluIHRoYXQgYWRkZWQgbGlzdGVuZXJzIGFsc28gcmVjZWl2ZSBhIGNhbGxiYWNrIHdpdGggdGhlIGN1cnJlbnQgdmFsdWUgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICd3aGVuIHRoZSBsaXN0ZW5lcnMgYXJlIHJlZ2lzdGVyZWQuIFRoaXMgaXMgYSB3aWRlbHktdXNlZCBwYXR0ZXJuIGluIFBoRVQtaU8gc2ltdWxhdGlvbnMuJyxcbiAgICAgICAgbWV0aG9kT3JkZXI6IFsgJ2xpbmsnLCAnbGF6eUxpbmsnIF0sXG4gICAgICAgIGV2ZW50czogWyBSZWFkT25seVByb3BlcnR5LkNIQU5HRURfRVZFTlRfTkFNRSBdLFxuICAgICAgICBwYXJhbWV0ZXJUeXBlczogWyBwYXJhbWV0ZXJUeXBlIF0sXG4gICAgICAgIHRvU3RhdGVPYmplY3Q6IHByb3BlcnR5ID0+IHtcbiAgICAgICAgICByZXR1cm4gcHJvcGVydHkudG9TdGF0ZU9iamVjdCgpO1xuICAgICAgICB9LFxuICAgICAgICBhcHBseVN0YXRlOiAoIHByb3BlcnR5LCBzdGF0ZU9iamVjdCApID0+IHtcbiAgICAgICAgICBwcm9wZXJ0eS5hcHBseVN0YXRlKCBzdGF0ZU9iamVjdCApO1xuICAgICAgICB9LFxuICAgICAgICBzdGF0ZVNjaGVtYToge1xuICAgICAgICAgIHZhbHVlOiBwYXJhbWV0ZXJUeXBlLFxuICAgICAgICAgIHZhbGlkVmFsdWVzOiBOdWxsYWJsZUlPKCBBcnJheUlPKCBwYXJhbWV0ZXJUeXBlICkgKSxcbiAgICAgICAgICB1bml0czogTnVsbGFibGVJTyggU3RyaW5nSU8gKVxuICAgICAgICB9LFxuICAgICAgICBhcGlTdGF0ZUtleXM6IFsgJ3ZhbGlkVmFsdWVzJywgJ3VuaXRzJyBdLFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgZ2V0VmFsdWU6IHtcbiAgICAgICAgICAgIHJldHVyblR5cGU6IHBhcmFtZXRlclR5cGUsXG4gICAgICAgICAgICBwYXJhbWV0ZXJUeXBlczogW10sXG4gICAgICAgICAgICBpbXBsZW1lbnRhdGlvbjogUmVhZE9ubHlQcm9wZXJ0eS5wcm90b3R5cGUuZ2V0LFxuICAgICAgICAgICAgZG9jdW1lbnRhdGlvbjogJ0dldHMgdGhlIGN1cnJlbnQgdmFsdWUuJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZ2V0VmFsaWRhdGlvbkVycm9yOiB7XG4gICAgICAgICAgICByZXR1cm5UeXBlOiBOdWxsYWJsZUlPKCBTdHJpbmdJTyApLFxuICAgICAgICAgICAgcGFyYW1ldGVyVHlwZXM6IFsgcGFyYW1ldGVyVHlwZSBdLFxuICAgICAgICAgICAgaW1wbGVtZW50YXRpb246IGZ1bmN0aW9uKCB0aGlzOiBSZWFkT25seVByb3BlcnR5PHVua25vd24+LCB2YWx1ZTogVCApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VmFsaWRhdGlvbkVycm9yKCB2YWx1ZSApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRvY3VtZW50YXRpb246ICdDaGVja3MgdG8gc2VlIGlmIGEgcHJvcG9zZWQgdmFsdWUgaXMgdmFsaWQuIFJldHVybnMgdGhlIGZpcnN0IHZhbGlkYXRpb24gZXJyb3IsIG9yIG51bGwgaWYgdGhlIHZhbHVlIGlzIHZhbGlkLidcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgc2V0VmFsdWU6IHtcbiAgICAgICAgICAgIHJldHVyblR5cGU6IFZvaWRJTyxcbiAgICAgICAgICAgIHBhcmFtZXRlclR5cGVzOiBbIHBhcmFtZXRlclR5cGUgXSxcbiAgICAgICAgICAgIGltcGxlbWVudGF0aW9uOiBmdW5jdGlvbiggdGhpczogUmVhZE9ubHlQcm9wZXJ0eTx1bmtub3duPiwgdmFsdWU6IFQgKSB7XG4gICAgICAgICAgICAgIHRoaXMuc2V0KCB2YWx1ZSApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRvY3VtZW50YXRpb246ICdTZXRzIHRoZSB2YWx1ZSBvZiB0aGUgUHJvcGVydHkuIElmIHRoZSB2YWx1ZSBkaWZmZXJzIGZyb20gdGhlIHByZXZpb3VzIHZhbHVlLCBsaXN0ZW5lcnMgYXJlICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ25vdGlmaWVkIHdpdGggdGhlIG5ldyB2YWx1ZS4nLFxuICAgICAgICAgICAgaW52b2NhYmxlRm9yUmVhZE9ubHlFbGVtZW50czogZmFsc2VcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgbGluazoge1xuICAgICAgICAgICAgcmV0dXJuVHlwZTogVm9pZElPLFxuXG4gICAgICAgICAgICAvLyBvbGRWYWx1ZSB3aWxsIHN0YXJ0IGFzIFwibnVsbFwiIHRoZSBmaXJzdCB0aW1lIGNhbGxlZFxuICAgICAgICAgICAgcGFyYW1ldGVyVHlwZXM6IFsgRnVuY3Rpb25JTyggVm9pZElPLCBbIHBhcmFtZXRlclR5cGUsIE51bGxhYmxlSU8oIHBhcmFtZXRlclR5cGUgKSBdICkgXSxcbiAgICAgICAgICAgIGltcGxlbWVudGF0aW9uOiBSZWFkT25seVByb3BlcnR5LnByb3RvdHlwZS5saW5rLFxuICAgICAgICAgICAgZG9jdW1lbnRhdGlvbjogJ0FkZHMgYSBsaXN0ZW5lciB3aGljaCB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZSB2YWx1ZSBjaGFuZ2VzLiBPbiByZWdpc3RyYXRpb24sIHRoZSBsaXN0ZW5lciBpcyAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICdhbHNvIGNhbGxlZCB3aXRoIHRoZSBjdXJyZW50IHZhbHVlLiBUaGUgbGlzdGVuZXIgdGFrZXMgdHdvIGFyZ3VtZW50cywgdGhlIG5ldyB2YWx1ZSBhbmQgdGhlICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3ByZXZpb3VzIHZhbHVlLidcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgbGF6eUxpbms6IHtcbiAgICAgICAgICAgIHJldHVyblR5cGU6IFZvaWRJTyxcblxuICAgICAgICAgICAgLy8gb2xkVmFsdWUgd2lsbCBzdGFydCBhcyBcIm51bGxcIiB0aGUgZmlyc3QgdGltZSBjYWxsZWRcbiAgICAgICAgICAgIHBhcmFtZXRlclR5cGVzOiBbIEZ1bmN0aW9uSU8oIFZvaWRJTywgWyBwYXJhbWV0ZXJUeXBlLCBOdWxsYWJsZUlPKCBwYXJhbWV0ZXJUeXBlICkgXSApIF0sXG4gICAgICAgICAgICBpbXBsZW1lbnRhdGlvbjogUmVhZE9ubHlQcm9wZXJ0eS5wcm90b3R5cGUubGF6eUxpbmssXG4gICAgICAgICAgICBkb2N1bWVudGF0aW9uOiAnQWRkcyBhIGxpc3RlbmVyIHdoaWNoIHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlIHZhbHVlIGNoYW5nZXMuIFRoaXMgbWV0aG9kIGlzIGxpa2UgXCJsaW5rXCIsIGJ1dCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICd3aXRob3V0IHRoZSBjdXJyZW50LXZhbHVlIGNhbGxiYWNrIG9uIHJlZ2lzdHJhdGlvbi4gVGhlIGxpc3RlbmVyIHRha2VzIHR3byBhcmd1bWVudHMsIHRoZSBuZXcgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAndmFsdWUgYW5kIHRoZSBwcmV2aW91cyB2YWx1ZS4nXG4gICAgICAgICAgfSxcbiAgICAgICAgICB1bmxpbms6IHtcbiAgICAgICAgICAgIHJldHVyblR5cGU6IFZvaWRJTyxcbiAgICAgICAgICAgIHBhcmFtZXRlclR5cGVzOiBbIEZ1bmN0aW9uSU8oIFZvaWRJTywgWyBwYXJhbWV0ZXJUeXBlIF0gKSBdLFxuICAgICAgICAgICAgaW1wbGVtZW50YXRpb246IFJlYWRPbmx5UHJvcGVydHkucHJvdG90eXBlLnVubGluayxcbiAgICAgICAgICAgIGRvY3VtZW50YXRpb246ICdSZW1vdmVzIGEgbGlzdGVuZXIuJ1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSApICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNhY2hlLmdldCggcGFyYW1ldGVyVHlwZSApITtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdXBwb3J0IHRyZWF0aW5nIG91cnNlbHZlcyBhcyBhbiBhdXRvc2VsZWN0YWJsZSBlbnRpdHkgZm9yIHRoZSBcInN0cmluZ3NcIiBzZWxlY3Rpb24gbW9kZS5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBnZXRQaGV0aW9Nb3VzZUhpdFRhcmdldCggZnJvbUxpbmtpbmcgPSBmYWxzZSApOiBQaGV0aW9PYmplY3QgfCAncGhldGlvTm90U2VsZWN0YWJsZScge1xuXG4gICAgaWYgKCBwaGV0LnRhbmRlbS5waGV0aW9FbGVtZW50U2VsZWN0aW9uUHJvcGVydHkudmFsdWUgPT09ICdzdHJpbmcnICkge1xuXG4gICAgICAvLyBBcyBvZiB0aGlzIHdyaXRpbmcsIHRoZSBvbmx5IHdheSB0byBnZXQgdG8gdGhpcyBmdW5jdGlvbiBpcyBmb3IgUHJvcGVydGllcyB0aGF0IGhhdmUgYSB2YWx1ZSBvZiBzdHJpbmdzLCBidXRcbiAgICAgIC8vIGluIHRoZSBmdXR1cmUgdGhhdCBtYXkgbm90IGJlIHRoZSBjYXNlLiBTUiBhbmQgTUsgc3RpbGwgdGhpbmsgaXQgaXMgcHJlZmVyYWJsZSB0byBrZWVwIHRoaXMgZ2VuZXJhbCwgYXMgZmFsc2VcbiAgICAgIC8vIHBvc2l0aXZlcyBmb3IgYXV0b3NlbGVjdCBhcmUgZ2VuZXJhbGx5IGJldHRlciB0aGFuIGZhbHNlIG5lZ2F0aXZlcy5cbiAgICAgIHJldHVybiB0aGlzLmdldFBoZXRpb01vdXNlSGl0VGFyZ2V0U2VsZigpO1xuICAgIH1cblxuICAgIHJldHVybiBzdXBlci5nZXRQaGV0aW9Nb3VzZUhpdFRhcmdldCggZnJvbUxpbmtpbmcgKTtcbiAgfVxuXG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBDSEFOR0VEX0VWRU5UX05BTUUgPSAnY2hhbmdlZCc7XG59XG5cbmF4b24ucmVnaXN0ZXIoICdSZWFkT25seVByb3BlcnR5JywgUmVhZE9ubHlQcm9wZXJ0eSApOyJdLCJuYW1lcyI6WyJvcHRpb25pemUiLCJJT1R5cGVDYWNoZSIsImlzQ2xlYXJpbmdQaGV0aW9EeW5hbWljRWxlbWVudHNQcm9wZXJ0eSIsImlzUGhldGlvU3RhdGVFbmdpbmVNYW5hZ2luZ1Byb3BlcnR5VmFsdWVzUHJvcGVydHkiLCJQaGV0aW9PYmplY3QiLCJUYW5kZW0iLCJEWU5BTUlDX0FSQ0hFVFlQRV9OQU1FIiwiQXJyYXlJTyIsIkZ1bmN0aW9uSU8iLCJJT1R5cGUiLCJOdWxsYWJsZUlPIiwiU3RyaW5nSU8iLCJWb2lkSU8iLCJheG9uIiwicHJvcGVydHlTdGF0ZUhhbmRsZXJTaW5nbGV0b24iLCJQcm9wZXJ0eVN0YXRlUGhhc2UiLCJUaW55UHJvcGVydHkiLCJ1bml0cyIsInZhbGlkYXRlIiwiVmFsaWRhdGlvbiIsIlZBTElEQVRFX09QVElPTlNfRkFMU0UiLCJ2YWxpZGF0ZVZhbGlkYXRvciIsImdsb2JhbElkIiwiY2FjaGUiLCJSZWFkT25seVByb3BlcnR5IiwiaXNTZXR0YWJsZSIsImdldCIsInRpbnlQcm9wZXJ0eSIsInNldCIsInZhbHVlIiwic2V0TWFuYWdlZEJ5UGhldGlvU3RhdGUiLCJpc1BoZXRpb0luc3RydW1lbnRlZCIsInBoZXRpb1N0YXRlIiwidW5ndWFyZGVkU2V0IiwiaXNEaXNwb3NlZCIsImlzRGVmZXJyZWQiLCJkZWZlcnJlZFZhbHVlIiwiaGFzRGVmZXJyZWRWYWx1ZSIsImVxdWFsc1ZhbHVlIiwib2xkVmFsdWUiLCJzZXRQcm9wZXJ0eVZhbHVlIiwiX25vdGlmeUxpc3RlbmVycyIsImFyZVZhbHVlc0VxdWFsIiwiYSIsImIiLCJuZXdWYWx1ZSIsImFzc2VydCIsInZhbHVlVmFsaWRhdG9yIiwiUEhFVF9JT19FTkFCTEVEIiwicGhldGlvU3RhcnRFdmVudCIsIkNIQU5HRURfRVZFTlRfTkFNRSIsImdldERhdGEiLCJwYXJhbWV0ZXJUeXBlIiwicGhldGlvVHlwZSIsInBhcmFtZXRlclR5cGVzIiwidG9TdGF0ZU9iamVjdCIsIm5vdGlmeWluZyIsInJlZW50cmFudCIsImVtaXQiLCJwaGV0aW9FbmRFdmVudCIsIm5vdGlmeUxpc3RlbmVyc1N0YXRpYyIsInNldERlZmVycmVkIiwiYWRkUGhldGlvU3RhdGVEZXBlbmRlbmNpZXMiLCJkZXBlbmRlbmNpZXMiLCJBcnJheSIsImlzQXJyYXkiLCJpIiwibGVuZ3RoIiwiZGVwZW5kZW5jeVByb3BlcnR5IiwicmVnaXN0ZXJQaGV0aW9PcmRlckRlcGVuZGVuY3kiLCJVTkRFRkVSIiwiTk9USUZZIiwibGluayIsImxpc3RlbmVyIiwib3B0aW9ucyIsInBoZXRpb0RlcGVuZGVuY2llcyIsImFkZExpc3RlbmVyIiwibGF6eUxpbmsiLCJ1bmxpbmsiLCJ1bmxpbmtBbGwiLCJsaW5rQXR0cmlidXRlIiwib2JqZWN0IiwiYXR0cmlidXRlTmFtZSIsImhhbmRsZSIsInRvU3RyaW5nIiwiaWQiLCJkZWJ1ZyIsIm5hbWUiLCJjb25zb2xlIiwibG9nIiwiaXNWYWx1ZVZhbGlkIiwiZ2V0VmFsaWRhdGlvbkVycm9yIiwiZGlzcG9zZSIsInVucmVnaXN0ZXJPcmRlckRlcGVuZGVuY2llc0ZvclByb3BlcnR5IiwiaGFzTGlzdGVuZXIiLCJnZXRMaXN0ZW5lckNvdW50IiwiZm9yRWFjaExpc3RlbmVyIiwiY2FsbGJhY2siLCJoYXNMaXN0ZW5lcnMiLCJhcmd1bWVudHMiLCJ2YWx1ZUNvbXBhcmlzb25TdHJhdGVneSIsInBoZXRpb1ZhbHVlVHlwZSIsInR5cGVOYW1lIiwidmFsaWRWYWx1ZXMiLCJ1bmRlZmluZWQiLCJhcHBseVN0YXRlIiwic3RhdGVPYmplY3QiLCJmcm9tU3RhdGVPYmplY3QiLCJQcm9wZXJ0eUlPIiwiaGFzIiwidmFsdWVUeXBlIiwiZG9jdW1lbnRhdGlvbiIsIm1ldGhvZE9yZGVyIiwiZXZlbnRzIiwicHJvcGVydHkiLCJzdGF0ZVNjaGVtYSIsImFwaVN0YXRlS2V5cyIsIm1ldGhvZHMiLCJnZXRWYWx1ZSIsInJldHVyblR5cGUiLCJpbXBsZW1lbnRhdGlvbiIsInByb3RvdHlwZSIsInNldFZhbHVlIiwiaW52b2NhYmxlRm9yUmVhZE9ubHlFbGVtZW50cyIsImdldFBoZXRpb01vdXNlSGl0VGFyZ2V0IiwiZnJvbUxpbmtpbmciLCJwaGV0IiwidGFuZGVtIiwicGhldGlvRWxlbWVudFNlbGVjdGlvblByb3BlcnR5IiwiZ2V0UGhldGlvTW91c2VIaXRUYXJnZXRTZWxmIiwicHJvdmlkZWRPcHRpb25zIiwiaGFzTGlzdGVuZXJPcmRlckRlcGVuZGVuY2llcyIsInJlZW50cmFudE5vdGlmaWNhdGlvblN0cmF0ZWd5IiwidGFuZGVtTmFtZVN1ZmZpeCIsInBoZXRpb091dGVyVHlwZSIsIk9iamVjdElPIiwiaXNWYWxpZFVuaXRzIiwicGhldGlvRXZlbnRNZXRhZGF0YSIsImhhc093blByb3BlcnR5IiwiY29udGFpbnNWYWxpZGF0b3JLZXkiLCJpc1ZhbGlkVmFsdWUiLCJWQUxJREFUSU9OIiwicGhldGlvSUQiLCJfIiwicGljayIsIlZBTElEQVRPUl9LRVlTIiwidmFsaWRhdGlvbk1lc3NhZ2UiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEs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