// Copyright 2013-2024, University of Colorado Boulder
/**
 * A DerivedProperty is computed based on other Properties.  This implementation inherits from Property to (a) simplify
 * implementation and (b) ensure it remains consistent. Note that the setters should not be called directly, so the
 * setters (set, reset and es5 setter) throw an error if used directly.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import optionize from '../../phet-core/js/optionize.js';
import IOTypeCache from '../../tandem/js/IOTypeCache.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import VoidIO from '../../tandem/js/types/VoidIO.js';
import axon from './axon.js';
import Property from './Property.js';
import { propertyStateHandlerSingleton } from './PropertyStateHandler.js';
import PropertyStatePhase from './PropertyStatePhase.js';
import ReadOnlyProperty from './ReadOnlyProperty.js';
const DERIVED_PROPERTY_IO_PREFIX = 'DerivedPropertyIO';
/**
 * Compute the derived value given a derivation and an array of dependencies
 */ function getDerivedValue(derivation, dependencies) {
    // @ts-expect-error
    return derivation(...dependencies.map((property)=>property.get()));
}
let DerivedProperty = class DerivedProperty extends ReadOnlyProperty {
    /**
   * Determines whether this DerivedProperty has a specific dependency.
   */ hasDependency(dependency) {
        return this.definedDependencies.includes(dependency);
    }
    /**
   * Returns dependencies that are guaranteed to be defined internally.
   */ get definedDependencies() {
        assert && assert(this.dependencies !== null, 'Dependencies should be defined, has this Property been disposed?');
        return this.dependencies;
    }
    // for bind
    getDerivedPropertyListener() {
        // Don't try to recompute if we are disposed, see https://github.com/phetsims/axon/issues/432
        if (this.isDisposed) {
            return;
        }
        // Just mark that there is a deferred value, then calculate the derivation below when setDeferred() is called.
        // This is in part supported by the PhET-iO state engine because it can account for intermediate states, such
        // that this Property won't notify until after it is undeferred and has taken its final value.
        if (this.isDeferred) {
            this.hasDeferredValue = true;
        } else {
            super.set(getDerivedValue(this.derivation, this.definedDependencies));
        }
    }
    /**
   * Allows forcing a recomputation (as a possible workaround to listener order). This works well if you have a
   * non-Property event that should trigger a value change for this Property.
   *
   * For example:
   * myEmitter.addListener( () => myDerivedProperty.recomputeDerivation() );
   * myObservableArray.addItemAddedListener( () => myDerivedProperty.recomputeDerivation() );
   */ recomputeDerivation() {
        this.getDerivedPropertyListener();
    }
    dispose() {
        const dependencies = this.definedDependencies;
        // Unlink from dependent Properties
        for(let i = 0; i < dependencies.length; i++){
            const dependency = dependencies[i];
            if (dependency.hasListener(this.derivedPropertyListener)) {
                dependency.unlink(this.derivedPropertyListener);
            }
        }
        this.dependencies = null;
        super.dispose();
    }
    /**
   * Support deferred DerivedProperty by only calculating the derivation once when it is time to undefer it and fire
   * notifications. This way we don't have intermediate derivation calls during PhET-iO state setting.
   */ setDeferred(isDeferred) {
        if (this.isDeferred && !isDeferred) {
            this.deferredValue = getDerivedValue(this.derivation, this.definedDependencies);
        }
        return super.setDeferred(isDeferred);
    }
    /**
   * Creates a derived boolean Property whose value is true iff firstProperty's value is equal to secondProperty's
   * value.
   */ static valueEquals(firstProperty, secondProperty, options) {
        return new DerivedProperty([
            firstProperty,
            secondProperty
        ], (u, v)=>u === v, options);
    }
    /**
   * Creates a derived boolean Property whose value is true iff firstProperty's value is not equal to the
   * secondProperty's value.
   */ static valueNotEquals(firstProperty, secondProperty, options) {
        return new DerivedProperty([
            firstProperty,
            secondProperty
        ], (u, v)=>u !== v, options);
    }
    /**
   * Creates a derived boolean Property whose value is true iff firstProperty's value is equal to a constant value.
   */ static valueEqualsConstant(firstProperty, value, options) {
        return new DerivedProperty([
            firstProperty
        ], (u)=>u === value, options);
    }
    /**
   * Creates a derived boolean Property whose value is true iff firstProperty's value is not equal to a constant value.
   */ static valueNotEqualsConstant(firstProperty, value, options) {
        return new DerivedProperty([
            firstProperty
        ], (u)=>u !== value, options);
    }
    /**
   * Creates a derived boolean Property whose value is true iff every input Property value is true.
   */ static and(properties, options) {
        assert && assert(properties.length > 0, 'must provide a dependency');
        return DerivedProperty.deriveAny(properties, ()=>_.reduce(properties, andFunction, true), options);
    }
    /**
   * Creates a derived boolean Property whose value is true iff any input Property value is true.
   */ static or(properties, options) {
        assert && assert(properties.length > 0, 'must provide a dependency');
        return DerivedProperty.deriveAny(properties, ()=>_.reduce(properties, orFunction, false), options);
    }
    /**
   * Creates a derived number Property whose value is the result of multiplying all (number) dependencies together.
   */ static multiply(properties, options) {
        assert && assert(properties.length > 0, 'must provide a dependency');
        return DerivedProperty.deriveAny(properties, ()=>_.reduce(properties, multiplyFunction, 1), options);
    }
    /**
   * Creates a derived number Property whose value is the result of adding all (number) dependencies together.
   */ static add(properties, options) {
        assert && assert(properties.length > 0, 'must provide a dependency');
        return DerivedProperty.deriveAny(properties, ()=>_.reduce(properties, addFunction, 0), options);
    }
    /**
   * Creates a derived boolean Property whose value is the inverse of the provided property.
   */ static not(propertyToInvert, options) {
        return new DerivedProperty([
            propertyToInvert
        ], (x)=>!x, options);
    }
    /**
   * Create a DerivedProperty from any number of dependencies.  This is parallel to Multilink.multilinkAny
   */ static deriveAny(dependencies, derivation, providedOptions) {
        return new DerivedProperty(// @ts-expect-error we have to provide a mapping between an arbitrary length array and our max overload of 15 types.
        dependencies, derivation, providedOptions);
    }
    constructor(dependencies, derivation, providedOptions){
        const options = optionize()({
            phetioReadOnly: true,
            phetioOuterType: DerivedProperty.DerivedPropertyIO,
            phetioLinkDependencies: true
        }, providedOptions);
        assert && assert(dependencies.every(_.identity), 'dependencies should all be truthy');
        assert && assert(dependencies.length === _.uniq(dependencies).length, 'duplicate dependencies');
        const initialValue = getDerivedValue(derivation, dependencies);
        // We must pass supertype tandem to parent class so addInstance is called only once in the subclassiest constructor.
        super(initialValue, options);
        if (Tandem.VALIDATION && this.isPhetioInstrumented()) {
            // The phetioType should be a concrete (instantiated) DerivedPropertyIO, hence we must check its outer type
            assert && assert(this.phetioType.typeName.startsWith('DerivedPropertyIO'), 'phetioType should be DerivedPropertyIO');
        }
        this.dependencies = dependencies;
        this.derivation = derivation;
        this.derivedPropertyListener = this.getDerivedPropertyListener.bind(this);
        dependencies.forEach((dependency)=>{
            dependency.lazyLink(this.derivedPropertyListener);
            if (Tandem.PHET_IO_ENABLED && this.isPhetioInstrumented() && dependency instanceof PhetioObject && dependency.isPhetioInstrumented()) {
                if (dependency instanceof ReadOnlyProperty) {
                    // Dependencies should have taken their correct values before this DerivedProperty undefers, so it will be sure
                    // to have the right value.
                    // NOTE: Do not mark the beforePhase as NOTIFY, as this will potentially cause interdependence bugs when used
                    // with Multilinks. See Projectile Motion's use of MeasuringTapeNode for an example.
                    propertyStateHandlerSingleton.registerPhetioOrderDependency(dependency, PropertyStatePhase.UNDEFER, this, PropertyStatePhase.UNDEFER);
                }
                if (options.tandem && options.phetioLinkDependencies) {
                    const dependenciesTandem = options.tandem.createTandem('dependencies');
                    this.addLinkedElement(dependency, {
                        tandem: dependenciesTandem.createTandemFromPhetioID(dependency.tandem.phetioID)
                    });
                }
            }
        });
    }
};
/**
 * T = type of the derived value
 * Parameters[] = types of the callback parameters, e.g. [ Vector2, number, boolean ]
 */ export { DerivedProperty as default };
const andFunction = (value, property)=>{
    return value && property.value;
};
const orFunction = (value, property)=>{
    assert && assert(typeof property.value === 'boolean', 'boolean value required');
    return value || property.value;
};
const multiplyFunction = (value, property)=>{
    assert && assert(typeof property.value === 'number', 'number value required');
    return value * property.value;
};
const addFunction = (value, property)=>{
    assert && assert(typeof property.value === 'number', 'number value required');
    return value + property.value;
};
// Cache each parameterized DerivedPropertyIO so that it is only created once.
const cache = new IOTypeCache();
/**
 * Parametric IOType constructor.  Given a parameter type, this function returns an appropriate DerivedProperty
 * IOType. Unlike PropertyIO, DerivedPropertyIO cannot be set by PhET-iO clients.
 * This caching implementation should be kept in sync with the other parametric IOType caching implementations.
 */ DerivedProperty.DerivedPropertyIO = (parameterType)=>{
    assert && assert(parameterType, 'DerivedPropertyIO needs parameterType');
    if (!cache.has(parameterType)) {
        cache.set(parameterType, new IOType(`${DERIVED_PROPERTY_IO_PREFIX}<${parameterType.typeName}>`, {
            valueType: DerivedProperty,
            parameterTypes: [
                parameterType
            ],
            supertype: Property.PropertyIO(parameterType),
            documentation: 'Like PropertyIO, but not settable.  Instead it is derived from other DerivedPropertyIO or PropertyIO ' + 'instances',
            // Override the parent implementation as a no-op.  DerivedProperty values appear in the state, but should not be set
            // back into a running simulation. See https://github.com/phetsims/phet-io/issues/1292
            applyState: _.noop,
            methods: {
                setValue: {
                    returnType: VoidIO,
                    parameterTypes: [
                        parameterType
                    ],
                    // @ts-expect-error
                    implementation: DerivedProperty.prototype.set,
                    documentation: 'Errors out when you try to set a derived property.',
                    invocableForReadOnlyElements: false
                }
            }
        }));
    }
    return cache.get(parameterType);
};
// Convenience classes for subclassing DerivedProperty
export class DerivedProperty1 extends DerivedProperty {
}
export class DerivedProperty2 extends DerivedProperty {
}
export class DerivedProperty3 extends DerivedProperty {
}
export class DerivedProperty4 extends DerivedProperty {
}
export class DerivedProperty5 extends DerivedProperty {
}
axon.register('DerivedProperty', DerivedProperty);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgRGVyaXZlZFByb3BlcnR5IGlzIGNvbXB1dGVkIGJhc2VkIG9uIG90aGVyIFByb3BlcnRpZXMuICBUaGlzIGltcGxlbWVudGF0aW9uIGluaGVyaXRzIGZyb20gUHJvcGVydHkgdG8gKGEpIHNpbXBsaWZ5XG4gKiBpbXBsZW1lbnRhdGlvbiBhbmQgKGIpIGVuc3VyZSBpdCByZW1haW5zIGNvbnNpc3RlbnQuIE5vdGUgdGhhdCB0aGUgc2V0dGVycyBzaG91bGQgbm90IGJlIGNhbGxlZCBkaXJlY3RseSwgc28gdGhlXG4gKiBzZXR0ZXJzIChzZXQsIHJlc2V0IGFuZCBlczUgc2V0dGVyKSB0aHJvdyBhbiBlcnJvciBpZiB1c2VkIGRpcmVjdGx5LlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xuaW1wb3J0IElPVHlwZUNhY2hlIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9JT1R5cGVDYWNoZS5qcyc7XG5pbXBvcnQgUGhldGlvT2JqZWN0IGZyb20gJy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XG5pbXBvcnQgVm9pZElPIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9Wb2lkSU8uanMnO1xuaW1wb3J0IGF4b24gZnJvbSAnLi9heG9uLmpzJztcbmltcG9ydCB7IERlcGVuZGVuY2llcywgUlAxLCBSUDEwLCBSUDExLCBSUDEyLCBSUDEzLCBSUDE0LCBSUDE1LCBSUDIsIFJQMywgUlA0LCBSUDUsIFJQNiwgUlA3LCBSUDgsIFJQOSB9IGZyb20gJy4vTXVsdGlsaW5rLmpzJztcbmltcG9ydCBQcm9wZXJ0eSwgeyBQcm9wZXJ0eU9wdGlvbnMgfSBmcm9tICcuL1Byb3BlcnR5LmpzJztcbmltcG9ydCB7IHByb3BlcnR5U3RhdGVIYW5kbGVyU2luZ2xldG9uIH0gZnJvbSAnLi9Qcm9wZXJ0eVN0YXRlSGFuZGxlci5qcyc7XG5pbXBvcnQgUHJvcGVydHlTdGF0ZVBoYXNlIGZyb20gJy4vUHJvcGVydHlTdGF0ZVBoYXNlLmpzJztcbmltcG9ydCBSZWFkT25seVByb3BlcnR5IGZyb20gJy4vUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5cbmNvbnN0IERFUklWRURfUFJPUEVSVFlfSU9fUFJFRklYID0gJ0Rlcml2ZWRQcm9wZXJ0eUlPJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyBXaGVuIHRydWUsIGlmIHRoaXMgRGVyaXZlZFByb3BlcnR5IGlzIFBoRVQtaU8gaW5zdHJ1bWVudCwgYWRkIGEgTGlua2VkRWxlbWVudCBmb3IgZWFjaCBQaEVULWlPIGluc3RydW1lbnRlZCBkZXBlbmRlbmN5LlxuICBwaGV0aW9MaW5rRGVwZW5kZW5jaWVzPzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIERlcml2ZWRQcm9wZXJ0eU9wdGlvbnM8VD4gPSBTZWxmT3B0aW9ucyAmIFByb3BlcnR5T3B0aW9uczxUPjtcblxuLyoqXG4gKiBDb21wdXRlIHRoZSBkZXJpdmVkIHZhbHVlIGdpdmVuIGEgZGVyaXZhdGlvbiBhbmQgYW4gYXJyYXkgb2YgZGVwZW5kZW5jaWVzXG4gKi9cbmZ1bmN0aW9uIGdldERlcml2ZWRWYWx1ZTxULCBUMSwgVDIsIFQzLCBUNCwgVDUsIFQ2LCBUNywgVDgsIFQ5LCBUMTAsIFQxMSwgVDEyLCBUMTMsIFQxNCwgVDE1PiggZGVyaXZhdGlvbjogKCAuLi5wYXJhbXM6IFsgVDEsIFQyLCBUMywgVDQsIFQ1LCBUNiwgVDcsIFQ4LCBUOSwgVDEwLCBUMTEsIFQxMiwgVDEzLCBUMTQsIFQxNSBdICkgPT4gVCwgZGVwZW5kZW5jaWVzOiBEZXBlbmRlbmNpZXM8VDEsIFQyLCBUMywgVDQsIFQ1LCBUNiwgVDcsIFQ4LCBUOSwgVDEwLCBUMTEsIFQxMiwgVDEzLCBUMTQsIFQxNT4gKTogVCB7XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICByZXR1cm4gZGVyaXZhdGlvbiggLi4uZGVwZW5kZW5jaWVzLm1hcCggcHJvcGVydHkgPT4gcHJvcGVydHkuZ2V0KCkgKSApO1xufVxuXG4vLyBDb252ZW5pZW5jZSB0eXBlIGZvciBhIERlcml2ZWQgcHJvcGVydHkgdGhhdCBoYXMgYSBrbm93biByZXR1cm4gdHlwZSBidXQgdW5rbm93biBkZXBlbmRlbmN5IHR5cGVzLlxuZXhwb3J0IHR5cGUgVW5rbm93bkRlcml2ZWRQcm9wZXJ0eTxUPiA9IERlcml2ZWRQcm9wZXJ0eTxULCB1bmtub3duLCB1bmtub3duLCB1bmtub3duLCB1bmtub3duLCB1bmtub3duLCB1bmtub3duLCB1bmtub3duLCB1bmtub3duLCB1bmtub3duLCB1bmtub3duLCB1bmtub3duLCB1bmtub3duLCB1bmtub3duLCB1bmtub3duLCB1bmtub3duPjtcblxuLyoqXG4gKiBUID0gdHlwZSBvZiB0aGUgZGVyaXZlZCB2YWx1ZVxuICogUGFyYW1ldGVyc1tdID0gdHlwZXMgb2YgdGhlIGNhbGxiYWNrIHBhcmFtZXRlcnMsIGUuZy4gWyBWZWN0b3IyLCBudW1iZXIsIGJvb2xlYW4gXVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZXJpdmVkUHJvcGVydHk8VCwgVDEsIFQyLCBUMywgVDQsIFQ1LCBUNiwgVDcsIFQ4LCBUOSwgVDEwLCBUMTEsIFQxMiwgVDEzLCBUMTQsIFQxNT4gZXh0ZW5kcyBSZWFkT25seVByb3BlcnR5PFQ+IGltcGxlbWVudHMgVFJlYWRPbmx5UHJvcGVydHk8VD4ge1xuICBwcml2YXRlIGRlcGVuZGVuY2llczogRGVwZW5kZW5jaWVzPFQxLCBUMiwgVDMsIFQ0LCBUNSwgVDYsIFQ3LCBUOCwgVDksIFQxMCwgVDExLCBUMTIsIFQxMywgVDE0LCBUMTU+IHwgbnVsbDtcbiAgcHJpdmF0ZSByZWFkb25seSBkZXJpdmF0aW9uOiAoIC4uLnBhcmFtczogWyBUMSwgVDIsIFQzLCBUNCwgVDUsIFQ2LCBUNywgVDgsIFQ5LCBUMTAsIFQxMSwgVDEyLCBUMTMsIFQxNCwgVDE1IF0gKSA9PiBUO1xuICBwcml2YXRlIHJlYWRvbmx5IGRlcml2ZWRQcm9wZXJ0eUxpc3RlbmVyOiAoKSA9PiB2b2lkO1xuXG4gIHB1YmxpYyBzdGF0aWMgRGVyaXZlZFByb3BlcnR5SU86ICggcGFyYW1ldGVyVHlwZTogSU9UeXBlICkgPT4gSU9UeXBlO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gZGVwZW5kZW5jaWVzIC0gUHJvcGVydGllcyB0aGF0IHRoaXMgUHJvcGVydHkncyB2YWx1ZSBpcyBkZXJpdmVkIGZyb21cbiAgICogQHBhcmFtIGRlcml2YXRpb24gLSBmdW5jdGlvbiB0aGF0IGRlcml2ZXMgdGhpcyBQcm9wZXJ0eSdzIHZhbHVlLCBleHBlY3RzIGFyZ3MgaW4gdGhlIHNhbWUgb3JkZXIgYXMgZGVwZW5kZW5jaWVzXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXSAtIHNlZSBQcm9wZXJ0eVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBkZXBlbmRlbmNpZXM6IFJQMTxUMT4sIGRlcml2YXRpb246ICggLi4ucGFyYW1zOiBbIFQxIF0gKSA9PiBULCBwcm92aWRlZE9wdGlvbnM/OiBEZXJpdmVkUHJvcGVydHlPcHRpb25zPFQ+ICkgO1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGRlcGVuZGVuY2llczogUlAyPFQxLCBUMj4sIGRlcml2YXRpb246ICggLi4ucGFyYW1zOiBbIFQxLCBUMiBdICkgPT4gVCwgcHJvdmlkZWRPcHRpb25zPzogRGVyaXZlZFByb3BlcnR5T3B0aW9uczxUPiApIDtcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBkZXBlbmRlbmNpZXM6IFJQMzxUMSwgVDIsIFQzPiwgZGVyaXZhdGlvbjogKCAuLi5wYXJhbXM6IFsgVDEsIFQyLCBUMyBdICkgPT4gVCwgcHJvdmlkZWRPcHRpb25zPzogRGVyaXZlZFByb3BlcnR5T3B0aW9uczxUPiApIDtcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBkZXBlbmRlbmNpZXM6IFJQNDxUMSwgVDIsIFQzLCBUND4sIGRlcml2YXRpb246ICggLi4ucGFyYW1zOiBbIFQxLCBUMiwgVDMsIFQ0IF0gKSA9PiBULCBwcm92aWRlZE9wdGlvbnM/OiBEZXJpdmVkUHJvcGVydHlPcHRpb25zPFQ+ICkgO1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGRlcGVuZGVuY2llczogUlA1PFQxLCBUMiwgVDMsIFQ0LCBUNT4sIGRlcml2YXRpb246ICggLi4ucGFyYW1zOiBbIFQxLCBUMiwgVDMsIFQ0LCBUNSBdICkgPT4gVCwgcHJvdmlkZWRPcHRpb25zPzogRGVyaXZlZFByb3BlcnR5T3B0aW9uczxUPiApIDtcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBkZXBlbmRlbmNpZXM6IFJQNjxUMSwgVDIsIFQzLCBUNCwgVDUsIFQ2PiwgZGVyaXZhdGlvbjogKCAuLi5wYXJhbXM6IFsgVDEsIFQyLCBUMywgVDQsIFQ1LCBUNiBdICkgPT4gVCwgcHJvdmlkZWRPcHRpb25zPzogRGVyaXZlZFByb3BlcnR5T3B0aW9uczxUPiApIDtcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBkZXBlbmRlbmNpZXM6IFJQNzxUMSwgVDIsIFQzLCBUNCwgVDUsIFQ2LCBUNz4sIGRlcml2YXRpb246ICggLi4ucGFyYW1zOiBbIFQxLCBUMiwgVDMsIFQ0LCBUNSwgVDYsIFQ3IF0gKSA9PiBULCBwcm92aWRlZE9wdGlvbnM/OiBEZXJpdmVkUHJvcGVydHlPcHRpb25zPFQ+ICkgO1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGRlcGVuZGVuY2llczogUlA4PFQxLCBUMiwgVDMsIFQ0LCBUNSwgVDYsIFQ3LCBUOD4sIGRlcml2YXRpb246ICggLi4ucGFyYW1zOiBbIFQxLCBUMiwgVDMsIFQ0LCBUNSwgVDYsIFQ3LCBUOCBdICkgPT4gVCwgcHJvdmlkZWRPcHRpb25zPzogRGVyaXZlZFByb3BlcnR5T3B0aW9uczxUPiApIDtcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBkZXBlbmRlbmNpZXM6IFJQOTxUMSwgVDIsIFQzLCBUNCwgVDUsIFQ2LCBUNywgVDgsIFQ5PiwgZGVyaXZhdGlvbjogKCAuLi5wYXJhbXM6IFsgVDEsIFQyLCBUMywgVDQsIFQ1LCBUNiwgVDcsIFQ4LCBUOSBdICkgPT4gVCwgcHJvdmlkZWRPcHRpb25zPzogRGVyaXZlZFByb3BlcnR5T3B0aW9uczxUPiApIDtcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBkZXBlbmRlbmNpZXM6IFJQMTA8VDEsIFQyLCBUMywgVDQsIFQ1LCBUNiwgVDcsIFQ4LCBUOSwgVDEwPiwgZGVyaXZhdGlvbjogKCAuLi5wYXJhbXM6IFsgVDEsIFQyLCBUMywgVDQsIFQ1LCBUNiwgVDcsIFQ4LCBUOSwgVDEwIF0gKSA9PiBULCBwcm92aWRlZE9wdGlvbnM/OiBEZXJpdmVkUHJvcGVydHlPcHRpb25zPFQ+ICkgO1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGRlcGVuZGVuY2llczogUlAxMTxUMSwgVDIsIFQzLCBUNCwgVDUsIFQ2LCBUNywgVDgsIFQ5LCBUMTAsIFQxMT4sIGRlcml2YXRpb246ICggLi4ucGFyYW1zOiBbIFQxLCBUMiwgVDMsIFQ0LCBUNSwgVDYsIFQ3LCBUOCwgVDksIFQxMCwgVDExIF0gKSA9PiBULCBwcm92aWRlZE9wdGlvbnM/OiBEZXJpdmVkUHJvcGVydHlPcHRpb25zPFQ+ICkgO1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGRlcGVuZGVuY2llczogUlAxMjxUMSwgVDIsIFQzLCBUNCwgVDUsIFQ2LCBUNywgVDgsIFQ5LCBUMTAsIFQxMSwgVDEyPiwgZGVyaXZhdGlvbjogKCAuLi5wYXJhbXM6IFsgVDEsIFQyLCBUMywgVDQsIFQ1LCBUNiwgVDcsIFQ4LCBUOSwgVDEwLCBUMTEsIFQxMiBdICkgPT4gVCwgcHJvdmlkZWRPcHRpb25zPzogRGVyaXZlZFByb3BlcnR5T3B0aW9uczxUPiApIDtcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBkZXBlbmRlbmNpZXM6IFJQMTM8VDEsIFQyLCBUMywgVDQsIFQ1LCBUNiwgVDcsIFQ4LCBUOSwgVDEwLCBUMTEsIFQxMiwgVDEzPiwgZGVyaXZhdGlvbjogKCAuLi5wYXJhbXM6IFsgVDEsIFQyLCBUMywgVDQsIFQ1LCBUNiwgVDcsIFQ4LCBUOSwgVDEwLCBUMTEsIFQxMiwgVDEzIF0gKSA9PiBULCBwcm92aWRlZE9wdGlvbnM/OiBEZXJpdmVkUHJvcGVydHlPcHRpb25zPFQ+ICkgO1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGRlcGVuZGVuY2llczogUlAxNDxUMSwgVDIsIFQzLCBUNCwgVDUsIFQ2LCBUNywgVDgsIFQ5LCBUMTAsIFQxMSwgVDEyLCBUMTMsIFQxND4sIGRlcml2YXRpb246ICggLi4ucGFyYW1zOiBbIFQxLCBUMiwgVDMsIFQ0LCBUNSwgVDYsIFQ3LCBUOCwgVDksIFQxMCwgVDExLCBUMTIsIFQxMywgVDE0IF0gKSA9PiBULCBwcm92aWRlZE9wdGlvbnM/OiBEZXJpdmVkUHJvcGVydHlPcHRpb25zPFQ+ICkgO1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGRlcGVuZGVuY2llczogUlAxNTxUMSwgVDIsIFQzLCBUNCwgVDUsIFQ2LCBUNywgVDgsIFQ5LCBUMTAsIFQxMSwgVDEyLCBUMTMsIFQxNCwgVDE1PiwgZGVyaXZhdGlvbjogKCAuLi5wYXJhbXM6IFsgVDEsIFQyLCBUMywgVDQsIFQ1LCBUNiwgVDcsIFQ4LCBUOSwgVDEwLCBUMTEsIFQxMiwgVDEzLCBUMTQsIFQxNSBdICkgPT4gVCwgcHJvdmlkZWRPcHRpb25zPzogRGVyaXZlZFByb3BlcnR5T3B0aW9uczxUPiApIDtcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBkZXBlbmRlbmNpZXM6IERlcGVuZGVuY2llczxUMSwgVDIsIFQzLCBUNCwgVDUsIFQ2LCBUNywgVDgsIFQ5LCBUMTAsIFQxMSwgVDEyLCBUMTMsIFQxNCwgVDE1PiwgZGVyaXZhdGlvbjogKCAuLi5wYXJhbXM6IFsgVDEsIFQyLCBUMywgVDQsIFQ1LCBUNiwgVDcsIFQ4LCBUOSwgVDEwLCBUMTEsIFQxMiwgVDEzLCBUMTQsIFQxNSBdICkgPT4gVCwgcHJvdmlkZWRPcHRpb25zPzogRGVyaXZlZFByb3BlcnR5T3B0aW9uczxUPiApO1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGRlcGVuZGVuY2llczogRGVwZW5kZW5jaWVzPFQxLCBUMiwgVDMsIFQ0LCBUNSwgVDYsIFQ3LCBUOCwgVDksIFQxMCwgVDExLCBUMTIsIFQxMywgVDE0LCBUMTU+LCBkZXJpdmF0aW9uOiAoIC4uLnBhcmFtczogWyBUMSwgVDIsIFQzLCBUNCwgVDUsIFQ2LCBUNywgVDgsIFQ5LCBUMTAsIFQxMSwgVDEyLCBUMTMsIFQxNCwgVDE1IF0gKSA9PiBULCBwcm92aWRlZE9wdGlvbnM/OiBEZXJpdmVkUHJvcGVydHlPcHRpb25zPFQ+ICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxEZXJpdmVkUHJvcGVydHlPcHRpb25zPFQ+LCBTZWxmT3B0aW9ucywgUHJvcGVydHlPcHRpb25zPFQ+PigpKCB7XG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSwgLy8gZGVyaXZlZCBwcm9wZXJ0aWVzIGNhbiBiZSByZWFkIGJ1dCBub3Qgc2V0IGJ5IFBoRVQtaU9cbiAgICAgIHBoZXRpb091dGVyVHlwZTogRGVyaXZlZFByb3BlcnR5LkRlcml2ZWRQcm9wZXJ0eUlPLFxuICAgICAgcGhldGlvTGlua0RlcGVuZGVuY2llczogdHJ1ZVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZGVwZW5kZW5jaWVzLmV2ZXJ5KCBfLmlkZW50aXR5ICksICdkZXBlbmRlbmNpZXMgc2hvdWxkIGFsbCBiZSB0cnV0aHknICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZGVwZW5kZW5jaWVzLmxlbmd0aCA9PT0gXy51bmlxKCBkZXBlbmRlbmNpZXMgKS5sZW5ndGgsICdkdXBsaWNhdGUgZGVwZW5kZW5jaWVzJyApO1xuXG4gICAgY29uc3QgaW5pdGlhbFZhbHVlID0gZ2V0RGVyaXZlZFZhbHVlKCBkZXJpdmF0aW9uLCBkZXBlbmRlbmNpZXMgKTtcblxuICAgIC8vIFdlIG11c3QgcGFzcyBzdXBlcnR5cGUgdGFuZGVtIHRvIHBhcmVudCBjbGFzcyBzbyBhZGRJbnN0YW5jZSBpcyBjYWxsZWQgb25seSBvbmNlIGluIHRoZSBzdWJjbGFzc2llc3QgY29uc3RydWN0b3IuXG4gICAgc3VwZXIoIGluaXRpYWxWYWx1ZSwgb3B0aW9ucyApO1xuXG4gICAgaWYgKCBUYW5kZW0uVkFMSURBVElPTiAmJiB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKSB7XG5cbiAgICAgIC8vIFRoZSBwaGV0aW9UeXBlIHNob3VsZCBiZSBhIGNvbmNyZXRlIChpbnN0YW50aWF0ZWQpIERlcml2ZWRQcm9wZXJ0eUlPLCBoZW5jZSB3ZSBtdXN0IGNoZWNrIGl0cyBvdXRlciB0eXBlXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnBoZXRpb1R5cGUudHlwZU5hbWUuc3RhcnRzV2l0aCggJ0Rlcml2ZWRQcm9wZXJ0eUlPJyApLCAncGhldGlvVHlwZSBzaG91bGQgYmUgRGVyaXZlZFByb3BlcnR5SU8nICk7XG4gICAgfVxuXG4gICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBkZXBlbmRlbmNpZXM7XG4gICAgdGhpcy5kZXJpdmF0aW9uID0gZGVyaXZhdGlvbjtcbiAgICB0aGlzLmRlcml2ZWRQcm9wZXJ0eUxpc3RlbmVyID0gdGhpcy5nZXREZXJpdmVkUHJvcGVydHlMaXN0ZW5lci5iaW5kKCB0aGlzICk7XG5cbiAgICBkZXBlbmRlbmNpZXMuZm9yRWFjaCggZGVwZW5kZW5jeSA9PiB7XG5cbiAgICAgIGRlcGVuZGVuY3kubGF6eUxpbmsoIHRoaXMuZGVyaXZlZFByb3BlcnR5TGlzdGVuZXIgKTtcblxuICAgICAgaWYgKCBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICYmIHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSAmJiBkZXBlbmRlbmN5IGluc3RhbmNlb2YgUGhldGlvT2JqZWN0ICYmIGRlcGVuZGVuY3kuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSApIHtcbiAgICAgICAgaWYgKCBkZXBlbmRlbmN5IGluc3RhbmNlb2YgUmVhZE9ubHlQcm9wZXJ0eSApIHtcblxuICAgICAgICAgIC8vIERlcGVuZGVuY2llcyBzaG91bGQgaGF2ZSB0YWtlbiB0aGVpciBjb3JyZWN0IHZhbHVlcyBiZWZvcmUgdGhpcyBEZXJpdmVkUHJvcGVydHkgdW5kZWZlcnMsIHNvIGl0IHdpbGwgYmUgc3VyZVxuICAgICAgICAgIC8vIHRvIGhhdmUgdGhlIHJpZ2h0IHZhbHVlLlxuICAgICAgICAgIC8vIE5PVEU6IERvIG5vdCBtYXJrIHRoZSBiZWZvcmVQaGFzZSBhcyBOT1RJRlksIGFzIHRoaXMgd2lsbCBwb3RlbnRpYWxseSBjYXVzZSBpbnRlcmRlcGVuZGVuY2UgYnVncyB3aGVuIHVzZWRcbiAgICAgICAgICAvLyB3aXRoIE11bHRpbGlua3MuIFNlZSBQcm9qZWN0aWxlIE1vdGlvbidzIHVzZSBvZiBNZWFzdXJpbmdUYXBlTm9kZSBmb3IgYW4gZXhhbXBsZS5cbiAgICAgICAgICBwcm9wZXJ0eVN0YXRlSGFuZGxlclNpbmdsZXRvbi5yZWdpc3RlclBoZXRpb09yZGVyRGVwZW5kZW5jeShcbiAgICAgICAgICAgIGRlcGVuZGVuY3ksIFByb3BlcnR5U3RhdGVQaGFzZS5VTkRFRkVSLFxuICAgICAgICAgICAgdGhpcywgUHJvcGVydHlTdGF0ZVBoYXNlLlVOREVGRVJcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBvcHRpb25zLnRhbmRlbSAmJiBvcHRpb25zLnBoZXRpb0xpbmtEZXBlbmRlbmNpZXMgKSB7XG4gICAgICAgICAgY29uc3QgZGVwZW5kZW5jaWVzVGFuZGVtID0gb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZGVwZW5kZW5jaWVzJyApO1xuICAgICAgICAgIHRoaXMuYWRkTGlua2VkRWxlbWVudCggZGVwZW5kZW5jeSwge1xuICAgICAgICAgICAgdGFuZGVtOiBkZXBlbmRlbmNpZXNUYW5kZW0uY3JlYXRlVGFuZGVtRnJvbVBoZXRpb0lEKCBkZXBlbmRlbmN5LnRhbmRlbS5waGV0aW9JRCApXG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSApO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgd2hldGhlciB0aGlzIERlcml2ZWRQcm9wZXJ0eSBoYXMgYSBzcGVjaWZpYyBkZXBlbmRlbmN5LlxuICAgKi9cbiAgcHVibGljIGhhc0RlcGVuZGVuY3koIGRlcGVuZGVuY3k6IFRSZWFkT25seVByb3BlcnR5PEludGVudGlvbmFsQW55PiApOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5kZWZpbmVkRGVwZW5kZW5jaWVzLmluY2x1ZGVzKCBkZXBlbmRlbmN5ICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBkZXBlbmRlbmNpZXMgdGhhdCBhcmUgZ3VhcmFudGVlZCB0byBiZSBkZWZpbmVkIGludGVybmFsbHkuXG4gICAqL1xuICBwcml2YXRlIGdldCBkZWZpbmVkRGVwZW5kZW5jaWVzKCk6IERlcGVuZGVuY2llczxUMSwgVDIsIFQzLCBUNCwgVDUsIFQ2LCBUNywgVDgsIFQ5LCBUMTAsIFQxMSwgVDEyLCBUMTMsIFQxNCwgVDE1PiB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5kZXBlbmRlbmNpZXMgIT09IG51bGwsICdEZXBlbmRlbmNpZXMgc2hvdWxkIGJlIGRlZmluZWQsIGhhcyB0aGlzIFByb3BlcnR5IGJlZW4gZGlzcG9zZWQ/JyApO1xuICAgIHJldHVybiB0aGlzLmRlcGVuZGVuY2llcyE7XG4gIH1cblxuICAvLyBmb3IgYmluZFxuICBwcml2YXRlIGdldERlcml2ZWRQcm9wZXJ0eUxpc3RlbmVyKCk6IHZvaWQge1xuICAgIC8vIERvbid0IHRyeSB0byByZWNvbXB1dGUgaWYgd2UgYXJlIGRpc3Bvc2VkLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2F4b24vaXNzdWVzLzQzMlxuICAgIGlmICggdGhpcy5pc0Rpc3Bvc2VkICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEp1c3QgbWFyayB0aGF0IHRoZXJlIGlzIGEgZGVmZXJyZWQgdmFsdWUsIHRoZW4gY2FsY3VsYXRlIHRoZSBkZXJpdmF0aW9uIGJlbG93IHdoZW4gc2V0RGVmZXJyZWQoKSBpcyBjYWxsZWQuXG4gICAgLy8gVGhpcyBpcyBpbiBwYXJ0IHN1cHBvcnRlZCBieSB0aGUgUGhFVC1pTyBzdGF0ZSBlbmdpbmUgYmVjYXVzZSBpdCBjYW4gYWNjb3VudCBmb3IgaW50ZXJtZWRpYXRlIHN0YXRlcywgc3VjaFxuICAgIC8vIHRoYXQgdGhpcyBQcm9wZXJ0eSB3b24ndCBub3RpZnkgdW50aWwgYWZ0ZXIgaXQgaXMgdW5kZWZlcnJlZCBhbmQgaGFzIHRha2VuIGl0cyBmaW5hbCB2YWx1ZS5cbiAgICBpZiAoIHRoaXMuaXNEZWZlcnJlZCApIHtcbiAgICAgIHRoaXMuaGFzRGVmZXJyZWRWYWx1ZSA9IHRydWU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgc3VwZXIuc2V0KCBnZXREZXJpdmVkVmFsdWUoIHRoaXMuZGVyaXZhdGlvbiwgdGhpcy5kZWZpbmVkRGVwZW5kZW5jaWVzICkgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWxsb3dzIGZvcmNpbmcgYSByZWNvbXB1dGF0aW9uIChhcyBhIHBvc3NpYmxlIHdvcmthcm91bmQgdG8gbGlzdGVuZXIgb3JkZXIpLiBUaGlzIHdvcmtzIHdlbGwgaWYgeW91IGhhdmUgYVxuICAgKiBub24tUHJvcGVydHkgZXZlbnQgdGhhdCBzaG91bGQgdHJpZ2dlciBhIHZhbHVlIGNoYW5nZSBmb3IgdGhpcyBQcm9wZXJ0eS5cbiAgICpcbiAgICogRm9yIGV4YW1wbGU6XG4gICAqIG15RW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gbXlEZXJpdmVkUHJvcGVydHkucmVjb21wdXRlRGVyaXZhdGlvbigpICk7XG4gICAqIG15T2JzZXJ2YWJsZUFycmF5LmFkZEl0ZW1BZGRlZExpc3RlbmVyKCAoKSA9PiBteURlcml2ZWRQcm9wZXJ0eS5yZWNvbXB1dGVEZXJpdmF0aW9uKCkgKTtcbiAgICovXG4gIHB1YmxpYyByZWNvbXB1dGVEZXJpdmF0aW9uKCk6IHZvaWQge1xuICAgIHRoaXMuZ2V0RGVyaXZlZFByb3BlcnR5TGlzdGVuZXIoKTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuXG4gICAgY29uc3QgZGVwZW5kZW5jaWVzID0gdGhpcy5kZWZpbmVkRGVwZW5kZW5jaWVzO1xuXG4gICAgLy8gVW5saW5rIGZyb20gZGVwZW5kZW50IFByb3BlcnRpZXNcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBkZXBlbmRlbmNpZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBkZXBlbmRlbmN5ID0gZGVwZW5kZW5jaWVzWyBpIF07XG4gICAgICBpZiAoIGRlcGVuZGVuY3kuaGFzTGlzdGVuZXIoIHRoaXMuZGVyaXZlZFByb3BlcnR5TGlzdGVuZXIgKSApIHtcbiAgICAgICAgZGVwZW5kZW5jeS51bmxpbmsoIHRoaXMuZGVyaXZlZFByb3BlcnR5TGlzdGVuZXIgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBudWxsO1xuXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1cHBvcnQgZGVmZXJyZWQgRGVyaXZlZFByb3BlcnR5IGJ5IG9ubHkgY2FsY3VsYXRpbmcgdGhlIGRlcml2YXRpb24gb25jZSB3aGVuIGl0IGlzIHRpbWUgdG8gdW5kZWZlciBpdCBhbmQgZmlyZVxuICAgKiBub3RpZmljYXRpb25zLiBUaGlzIHdheSB3ZSBkb24ndCBoYXZlIGludGVybWVkaWF0ZSBkZXJpdmF0aW9uIGNhbGxzIGR1cmluZyBQaEVULWlPIHN0YXRlIHNldHRpbmcuXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgc2V0RGVmZXJyZWQoIGlzRGVmZXJyZWQ6IGJvb2xlYW4gKTogKCAoKSA9PiB2b2lkICkgfCBudWxsIHtcbiAgICBpZiAoIHRoaXMuaXNEZWZlcnJlZCAmJiAhaXNEZWZlcnJlZCApIHtcbiAgICAgIHRoaXMuZGVmZXJyZWRWYWx1ZSA9IGdldERlcml2ZWRWYWx1ZSggdGhpcy5kZXJpdmF0aW9uLCB0aGlzLmRlZmluZWREZXBlbmRlbmNpZXMgKTtcbiAgICB9XG4gICAgcmV0dXJuIHN1cGVyLnNldERlZmVycmVkKCBpc0RlZmVycmVkICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGRlcml2ZWQgYm9vbGVhbiBQcm9wZXJ0eSB3aG9zZSB2YWx1ZSBpcyB0cnVlIGlmZiBmaXJzdFByb3BlcnR5J3MgdmFsdWUgaXMgZXF1YWwgdG8gc2Vjb25kUHJvcGVydHknc1xuICAgKiB2YWx1ZS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgdmFsdWVFcXVhbHMoIGZpcnN0UHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PHVua25vd24+LCBzZWNvbmRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8dW5rbm93bj4sIG9wdGlvbnM/OiBEZXJpdmVkUHJvcGVydHlPcHRpb25zPGJvb2xlYW4+ICk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+IHtcbiAgICByZXR1cm4gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBmaXJzdFByb3BlcnR5LCBzZWNvbmRQcm9wZXJ0eSBdLCAoIHU6IHVua25vd24sIHY6IHVua25vd24gKSA9PiB1ID09PSB2LCBvcHRpb25zICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGRlcml2ZWQgYm9vbGVhbiBQcm9wZXJ0eSB3aG9zZSB2YWx1ZSBpcyB0cnVlIGlmZiBmaXJzdFByb3BlcnR5J3MgdmFsdWUgaXMgbm90IGVxdWFsIHRvIHRoZVxuICAgKiBzZWNvbmRQcm9wZXJ0eSdzIHZhbHVlLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyB2YWx1ZU5vdEVxdWFscyggZmlyc3RQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8dW5rbm93bj4sIHNlY29uZFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTx1bmtub3duPiwgb3B0aW9ucz86IERlcml2ZWRQcm9wZXJ0eU9wdGlvbnM8Ym9vbGVhbj4gKTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIGZpcnN0UHJvcGVydHksIHNlY29uZFByb3BlcnR5IF0sICggdTogdW5rbm93biwgdjogdW5rbm93biApID0+IHUgIT09IHYsIG9wdGlvbnMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgZGVyaXZlZCBib29sZWFuIFByb3BlcnR5IHdob3NlIHZhbHVlIGlzIHRydWUgaWZmIGZpcnN0UHJvcGVydHkncyB2YWx1ZSBpcyBlcXVhbCB0byBhIGNvbnN0YW50IHZhbHVlLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyB2YWx1ZUVxdWFsc0NvbnN0YW50KCBmaXJzdFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTx1bmtub3duPiwgdmFsdWU6IHVua25vd24sIG9wdGlvbnM/OiBEZXJpdmVkUHJvcGVydHlPcHRpb25zPGJvb2xlYW4+ICk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+IHtcbiAgICByZXR1cm4gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBmaXJzdFByb3BlcnR5IF0sICggdTogdW5rbm93biApID0+IHUgPT09IHZhbHVlLCBvcHRpb25zICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGRlcml2ZWQgYm9vbGVhbiBQcm9wZXJ0eSB3aG9zZSB2YWx1ZSBpcyB0cnVlIGlmZiBmaXJzdFByb3BlcnR5J3MgdmFsdWUgaXMgbm90IGVxdWFsIHRvIGEgY29uc3RhbnQgdmFsdWUuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHZhbHVlTm90RXF1YWxzQ29uc3RhbnQoIGZpcnN0UHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PHVua25vd24+LCB2YWx1ZTogdW5rbm93biwgb3B0aW9ucz86IERlcml2ZWRQcm9wZXJ0eU9wdGlvbnM8Ym9vbGVhbj4gKTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIGZpcnN0UHJvcGVydHkgXSwgKCB1OiB1bmtub3duICkgPT4gdSAhPT0gdmFsdWUsIG9wdGlvbnMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgZGVyaXZlZCBib29sZWFuIFByb3BlcnR5IHdob3NlIHZhbHVlIGlzIHRydWUgaWZmIGV2ZXJ5IGlucHV0IFByb3BlcnR5IHZhbHVlIGlzIHRydWUuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGFuZCggcHJvcGVydGllczogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj5bXSwgb3B0aW9ucz86IFByb3BlcnR5T3B0aW9uczxib29sZWFuPiApOiBVbmtub3duRGVyaXZlZFByb3BlcnR5PGJvb2xlYW4+IHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwcm9wZXJ0aWVzLmxlbmd0aCA+IDAsICdtdXN0IHByb3ZpZGUgYSBkZXBlbmRlbmN5JyApO1xuXG4gICAgcmV0dXJuIERlcml2ZWRQcm9wZXJ0eS5kZXJpdmVBbnkoIHByb3BlcnRpZXMsICgpID0+IF8ucmVkdWNlKCBwcm9wZXJ0aWVzLCBhbmRGdW5jdGlvbiwgdHJ1ZSApLCBvcHRpb25zICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGRlcml2ZWQgYm9vbGVhbiBQcm9wZXJ0eSB3aG9zZSB2YWx1ZSBpcyB0cnVlIGlmZiBhbnkgaW5wdXQgUHJvcGVydHkgdmFsdWUgaXMgdHJ1ZS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgb3IoIHByb3BlcnRpZXM6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+W10sIG9wdGlvbnM/OiBQcm9wZXJ0eU9wdGlvbnM8Ym9vbGVhbj4gKTogVW5rbm93bkRlcml2ZWRQcm9wZXJ0eTxib29sZWFuPiB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcHJvcGVydGllcy5sZW5ndGggPiAwLCAnbXVzdCBwcm92aWRlIGEgZGVwZW5kZW5jeScgKTtcblxuICAgIHJldHVybiBEZXJpdmVkUHJvcGVydHkuZGVyaXZlQW55KCBwcm9wZXJ0aWVzLCAoKSA9PiBfLnJlZHVjZSggcHJvcGVydGllcywgb3JGdW5jdGlvbiwgZmFsc2UgKSwgb3B0aW9ucyApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBkZXJpdmVkIG51bWJlciBQcm9wZXJ0eSB3aG9zZSB2YWx1ZSBpcyB0aGUgcmVzdWx0IG9mIG11bHRpcGx5aW5nIGFsbCAobnVtYmVyKSBkZXBlbmRlbmNpZXMgdG9nZXRoZXIuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIG11bHRpcGx5KCBwcm9wZXJ0aWVzOiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+W10sIG9wdGlvbnM/OiBQcm9wZXJ0eU9wdGlvbnM8bnVtYmVyPiApOiBVbmtub3duRGVyaXZlZFByb3BlcnR5PG51bWJlcj4ge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHByb3BlcnRpZXMubGVuZ3RoID4gMCwgJ211c3QgcHJvdmlkZSBhIGRlcGVuZGVuY3knICk7XG5cbiAgICByZXR1cm4gRGVyaXZlZFByb3BlcnR5LmRlcml2ZUFueSggcHJvcGVydGllcywgKCkgPT4gXy5yZWR1Y2UoIHByb3BlcnRpZXMsIG11bHRpcGx5RnVuY3Rpb24sIDEgKSwgb3B0aW9ucyApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBkZXJpdmVkIG51bWJlciBQcm9wZXJ0eSB3aG9zZSB2YWx1ZSBpcyB0aGUgcmVzdWx0IG9mIGFkZGluZyBhbGwgKG51bWJlcikgZGVwZW5kZW5jaWVzIHRvZ2V0aGVyLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBhZGQoIHByb3BlcnRpZXM6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj5bXSwgb3B0aW9ucz86IFByb3BlcnR5T3B0aW9uczxudW1iZXI+ICk6IFVua25vd25EZXJpdmVkUHJvcGVydHk8bnVtYmVyPiB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcHJvcGVydGllcy5sZW5ndGggPiAwLCAnbXVzdCBwcm92aWRlIGEgZGVwZW5kZW5jeScgKTtcblxuICAgIHJldHVybiBEZXJpdmVkUHJvcGVydHkuZGVyaXZlQW55KCBwcm9wZXJ0aWVzLCAoKSA9PiBfLnJlZHVjZSggcHJvcGVydGllcywgYWRkRnVuY3Rpb24sIDAgKSwgb3B0aW9ucyApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBkZXJpdmVkIGJvb2xlYW4gUHJvcGVydHkgd2hvc2UgdmFsdWUgaXMgdGhlIGludmVyc2Ugb2YgdGhlIHByb3ZpZGVkIHByb3BlcnR5LlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBub3QoIHByb3BlcnR5VG9JbnZlcnQ6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+LCBvcHRpb25zPzogRGVyaXZlZFByb3BlcnR5T3B0aW9uczxib29sZWFuPiApOiBEZXJpdmVkUHJvcGVydHk8Ym9vbGVhbiwgYm9vbGVhbiwgdW5rbm93biwgdW5rbm93biwgdW5rbm93biwgdW5rbm93biwgdW5rbm93biwgdW5rbm93biwgdW5rbm93biwgdW5rbm93biwgdW5rbm93biwgdW5rbm93biwgdW5rbm93biwgdW5rbm93biwgdW5rbm93biwgdW5rbm93bj4ge1xuICAgIHJldHVybiBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHByb3BlcnR5VG9JbnZlcnQgXSwgKCB4OiBib29sZWFuICkgPT4gIXgsIG9wdGlvbnMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBEZXJpdmVkUHJvcGVydHkgZnJvbSBhbnkgbnVtYmVyIG9mIGRlcGVuZGVuY2llcy4gIFRoaXMgaXMgcGFyYWxsZWwgdG8gTXVsdGlsaW5rLm11bHRpbGlua0FueVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBkZXJpdmVBbnk8VD4oIGRlcGVuZGVuY2llczogQXJyYXk8VFJlYWRPbmx5UHJvcGVydHk8dW5rbm93bj4+LCBkZXJpdmF0aW9uOiAoKSA9PiBULCBwcm92aWRlZE9wdGlvbnM/OiBEZXJpdmVkUHJvcGVydHlPcHRpb25zPFQ+ICk6IFVua25vd25EZXJpdmVkUHJvcGVydHk8VD4ge1xuICAgIHJldHVybiBuZXcgRGVyaXZlZFByb3BlcnR5KFxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB3ZSBoYXZlIHRvIHByb3ZpZGUgYSBtYXBwaW5nIGJldHdlZW4gYW4gYXJiaXRyYXJ5IGxlbmd0aCBhcnJheSBhbmQgb3VyIG1heCBvdmVybG9hZCBvZiAxNSB0eXBlcy5cbiAgICAgIGRlcGVuZGVuY2llcyxcblxuICAgICAgZGVyaXZhdGlvbiwgcHJvdmlkZWRPcHRpb25zICk7XG4gIH1cbn1cblxuY29uc3QgYW5kRnVuY3Rpb24gPSAoIHZhbHVlOiBib29sZWFuLCBwcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4gKTogYm9vbGVhbiA9PiB7XG4gIHJldHVybiB2YWx1ZSAmJiBwcm9wZXJ0eS52YWx1ZTtcbn07XG5cbmNvbnN0IG9yRnVuY3Rpb24gPSAoIHZhbHVlOiBib29sZWFuLCBwcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4gKTogYm9vbGVhbiA9PiB7XG4gIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBwcm9wZXJ0eS52YWx1ZSA9PT0gJ2Jvb2xlYW4nLCAnYm9vbGVhbiB2YWx1ZSByZXF1aXJlZCcgKTtcbiAgcmV0dXJuIHZhbHVlIHx8IHByb3BlcnR5LnZhbHVlO1xufTtcblxuY29uc3QgbXVsdGlwbHlGdW5jdGlvbiA9ICggdmFsdWU6IG51bWJlciwgcHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj4gKTogbnVtYmVyID0+IHtcbiAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHByb3BlcnR5LnZhbHVlID09PSAnbnVtYmVyJywgJ251bWJlciB2YWx1ZSByZXF1aXJlZCcgKTtcbiAgcmV0dXJuIHZhbHVlICogcHJvcGVydHkudmFsdWU7XG59O1xuXG5jb25zdCBhZGRGdW5jdGlvbiA9ICggdmFsdWU6IG51bWJlciwgcHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj4gKTogbnVtYmVyID0+IHtcbiAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHByb3BlcnR5LnZhbHVlID09PSAnbnVtYmVyJywgJ251bWJlciB2YWx1ZSByZXF1aXJlZCcgKTtcbiAgcmV0dXJuIHZhbHVlICsgcHJvcGVydHkudmFsdWU7XG59O1xuXG4vLyBDYWNoZSBlYWNoIHBhcmFtZXRlcml6ZWQgRGVyaXZlZFByb3BlcnR5SU8gc28gdGhhdCBpdCBpcyBvbmx5IGNyZWF0ZWQgb25jZS5cbmNvbnN0IGNhY2hlID0gbmV3IElPVHlwZUNhY2hlKCk7XG5cbi8qKlxuICogUGFyYW1ldHJpYyBJT1R5cGUgY29uc3RydWN0b3IuICBHaXZlbiBhIHBhcmFtZXRlciB0eXBlLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgYW4gYXBwcm9wcmlhdGUgRGVyaXZlZFByb3BlcnR5XG4gKiBJT1R5cGUuIFVubGlrZSBQcm9wZXJ0eUlPLCBEZXJpdmVkUHJvcGVydHlJTyBjYW5ub3QgYmUgc2V0IGJ5IFBoRVQtaU8gY2xpZW50cy5cbiAqIFRoaXMgY2FjaGluZyBpbXBsZW1lbnRhdGlvbiBzaG91bGQgYmUga2VwdCBpbiBzeW5jIHdpdGggdGhlIG90aGVyIHBhcmFtZXRyaWMgSU9UeXBlIGNhY2hpbmcgaW1wbGVtZW50YXRpb25zLlxuICovXG5EZXJpdmVkUHJvcGVydHkuRGVyaXZlZFByb3BlcnR5SU8gPSBwYXJhbWV0ZXJUeXBlID0+IHtcbiAgYXNzZXJ0ICYmIGFzc2VydCggcGFyYW1ldGVyVHlwZSwgJ0Rlcml2ZWRQcm9wZXJ0eUlPIG5lZWRzIHBhcmFtZXRlclR5cGUnICk7XG5cbiAgaWYgKCAhY2FjaGUuaGFzKCBwYXJhbWV0ZXJUeXBlICkgKSB7XG4gICAgY2FjaGUuc2V0KCBwYXJhbWV0ZXJUeXBlLCBuZXcgSU9UeXBlKCBgJHtERVJJVkVEX1BST1BFUlRZX0lPX1BSRUZJWH08JHtwYXJhbWV0ZXJUeXBlLnR5cGVOYW1lfT5gLCB7XG4gICAgICB2YWx1ZVR5cGU6IERlcml2ZWRQcm9wZXJ0eSxcbiAgICAgIHBhcmFtZXRlclR5cGVzOiBbIHBhcmFtZXRlclR5cGUgXSxcbiAgICAgIHN1cGVydHlwZTogUHJvcGVydHkuUHJvcGVydHlJTyggcGFyYW1ldGVyVHlwZSApLFxuICAgICAgZG9jdW1lbnRhdGlvbjogJ0xpa2UgUHJvcGVydHlJTywgYnV0IG5vdCBzZXR0YWJsZS4gIEluc3RlYWQgaXQgaXMgZGVyaXZlZCBmcm9tIG90aGVyIERlcml2ZWRQcm9wZXJ0eUlPIG9yIFByb3BlcnR5SU8gJyArXG4gICAgICAgICAgICAgICAgICAgICAnaW5zdGFuY2VzJyxcblxuICAgICAgLy8gT3ZlcnJpZGUgdGhlIHBhcmVudCBpbXBsZW1lbnRhdGlvbiBhcyBhIG5vLW9wLiAgRGVyaXZlZFByb3BlcnR5IHZhbHVlcyBhcHBlYXIgaW4gdGhlIHN0YXRlLCBidXQgc2hvdWxkIG5vdCBiZSBzZXRcbiAgICAgIC8vIGJhY2sgaW50byBhIHJ1bm5pbmcgc2ltdWxhdGlvbi4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvL2lzc3Vlcy8xMjkyXG4gICAgICBhcHBseVN0YXRlOiBfLm5vb3AsXG4gICAgICBtZXRob2RzOiB7XG4gICAgICAgIHNldFZhbHVlOiB7XG4gICAgICAgICAgcmV0dXJuVHlwZTogVm9pZElPLFxuICAgICAgICAgIHBhcmFtZXRlclR5cGVzOiBbIHBhcmFtZXRlclR5cGUgXSxcblxuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgICAgICBpbXBsZW1lbnRhdGlvbjogRGVyaXZlZFByb3BlcnR5LnByb3RvdHlwZS5zZXQsXG4gICAgICAgICAgZG9jdW1lbnRhdGlvbjogJ0Vycm9ycyBvdXQgd2hlbiB5b3UgdHJ5IHRvIHNldCBhIGRlcml2ZWQgcHJvcGVydHkuJyxcbiAgICAgICAgICBpbnZvY2FibGVGb3JSZWFkT25seUVsZW1lbnRzOiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSApICk7XG4gIH1cblxuICByZXR1cm4gY2FjaGUuZ2V0KCBwYXJhbWV0ZXJUeXBlICkhO1xufTtcblxuXG4vLyBDb252ZW5pZW5jZSBjbGFzc2VzIGZvciBzdWJjbGFzc2luZyBEZXJpdmVkUHJvcGVydHlcbmV4cG9ydCBjbGFzcyBEZXJpdmVkUHJvcGVydHkxPFQsIFQxPiBleHRlbmRzIERlcml2ZWRQcm9wZXJ0eTxULCBUMSwgbmV2ZXIsIG5ldmVyLCBuZXZlciwgbmV2ZXIsIG5ldmVyLCBuZXZlciwgbmV2ZXIsIG5ldmVyLCBuZXZlciwgbmV2ZXIsIG5ldmVyLCBuZXZlciwgbmV2ZXIsIG5ldmVyPiB7fVxuXG5leHBvcnQgY2xhc3MgRGVyaXZlZFByb3BlcnR5MjxULCBUMSwgVDI+IGV4dGVuZHMgRGVyaXZlZFByb3BlcnR5PFQsIFQxLCBUMiwgbmV2ZXIsIG5ldmVyLCBuZXZlciwgbmV2ZXIsIG5ldmVyLCBuZXZlciwgbmV2ZXIsIG5ldmVyLCBuZXZlciwgbmV2ZXIsIG5ldmVyLCBuZXZlciwgbmV2ZXI+IHt9XG5cbmV4cG9ydCBjbGFzcyBEZXJpdmVkUHJvcGVydHkzPFQsIFQxLCBUMiwgVDM+IGV4dGVuZHMgRGVyaXZlZFByb3BlcnR5PFQsIFQxLCBUMiwgVDMsIG5ldmVyLCBuZXZlciwgbmV2ZXIsIG5ldmVyLCBuZXZlciwgbmV2ZXIsIG5ldmVyLCBuZXZlciwgbmV2ZXIsIG5ldmVyLCBuZXZlciwgbmV2ZXI+IHt9XG5cbmV4cG9ydCBjbGFzcyBEZXJpdmVkUHJvcGVydHk0PFQsIFQxLCBUMiwgVDMsIFQ0PiBleHRlbmRzIERlcml2ZWRQcm9wZXJ0eTxULCBUMSwgVDIsIFQzLCBUNCwgbmV2ZXIsIG5ldmVyLCBuZXZlciwgbmV2ZXIsIG5ldmVyLCBuZXZlciwgbmV2ZXIsIG5ldmVyLCBuZXZlciwgbmV2ZXIsIG5ldmVyPiB7fVxuXG5leHBvcnQgY2xhc3MgRGVyaXZlZFByb3BlcnR5NTxULCBUMSwgVDIsIFQzLCBUNCwgVDU+IGV4dGVuZHMgRGVyaXZlZFByb3BlcnR5PFQsIFQxLCBUMiwgVDMsIFQ0LCBUNSwgbmV2ZXIsIG5ldmVyLCBuZXZlciwgbmV2ZXIsIG5ldmVyLCBuZXZlciwgbmV2ZXIsIG5ldmVyLCBuZXZlciwgbmV2ZXI+IHt9XG5cbmF4b24ucmVnaXN0ZXIoICdEZXJpdmVkUHJvcGVydHknLCBEZXJpdmVkUHJvcGVydHkgKTsiXSwibmFtZXMiOlsib3B0aW9uaXplIiwiSU9UeXBlQ2FjaGUiLCJQaGV0aW9PYmplY3QiLCJUYW5kZW0iLCJJT1R5cGUiLCJWb2lkSU8iLCJheG9uIiwiUHJvcGVydHkiLCJwcm9wZXJ0eVN0YXRlSGFuZGxlclNpbmdsZXRvbiIsIlByb3BlcnR5U3RhdGVQaGFzZSIsIlJlYWRPbmx5UHJvcGVydHkiLCJERVJJVkVEX1BST1BFUlRZX0lPX1BSRUZJWCIsImdldERlcml2ZWRWYWx1ZSIsImRlcml2YXRpb24iLCJkZXBlbmRlbmNpZXMiLCJtYXAiLCJwcm9wZXJ0eSIsImdldCIsIkRlcml2ZWRQcm9wZXJ0eSIsImhhc0RlcGVuZGVuY3kiLCJkZXBlbmRlbmN5IiwiZGVmaW5lZERlcGVuZGVuY2llcyIsImluY2x1ZGVzIiwiYXNzZXJ0IiwiZ2V0RGVyaXZlZFByb3BlcnR5TGlzdGVuZXIiLCJpc0Rpc3Bvc2VkIiwiaXNEZWZlcnJlZCIsImhhc0RlZmVycmVkVmFsdWUiLCJzZXQiLCJyZWNvbXB1dGVEZXJpdmF0aW9uIiwiZGlzcG9zZSIsImkiLCJsZW5ndGgiLCJoYXNMaXN0ZW5lciIsImRlcml2ZWRQcm9wZXJ0eUxpc3RlbmVyIiwidW5saW5rIiwic2V0RGVmZXJyZWQiLCJkZWZlcnJlZFZhbHVlIiwidmFsdWVFcXVhbHMiLCJmaXJzdFByb3BlcnR5Iiwic2Vjb25kUHJvcGVydHkiLCJvcHRpb25zIiwidSIsInYiLCJ2YWx1ZU5vdEVxdWFscyIsInZhbHVlRXF1YWxzQ29uc3RhbnQiLCJ2YWx1ZSIsInZhbHVlTm90RXF1YWxzQ29uc3RhbnQiLCJhbmQiLCJwcm9wZXJ0aWVzIiwiZGVyaXZlQW55IiwiXyIsInJlZHVjZSIsImFuZEZ1bmN0aW9uIiwib3IiLCJvckZ1bmN0aW9uIiwibXVsdGlwbHkiLCJtdWx0aXBseUZ1bmN0aW9uIiwiYWRkIiwiYWRkRnVuY3Rpb24iLCJub3QiLCJwcm9wZXJ0eVRvSW52ZXJ0IiwieCIsInByb3ZpZGVkT3B0aW9ucyIsInBoZXRpb1JlYWRPbmx5IiwicGhldGlvT3V0ZXJUeXBlIiwiRGVyaXZlZFByb3BlcnR5SU8iLCJwaGV0aW9MaW5rRGVwZW5kZW5jaWVzIiwiZXZlcnkiLCJpZGVudGl0eSIsInVuaXEiLCJpbml0aWFsVmFsdWUiLCJWQUxJREFUSU9OIiwiaXNQaGV0aW9JbnN0cnVtZW50ZWQiLCJwaGV0aW9UeXBlIiwidHlwZU5hbWUiLCJzdGFydHNXaXRoIiwiYmluZCIsImZvckVhY2giLCJsYXp5TGluayIsIlBIRVRfSU9fRU5BQkxFRCIsInJlZ2lzdGVyUGhldGlvT3JkZXJEZXBlbmRlbmN5IiwiVU5ERUZFUiIsInRhbmRlbSIsImRlcGVuZGVuY2llc1RhbmRlbSIsImNyZWF0ZVRhbmRlbSIsImFkZExpbmtlZEVsZW1lbnQiLCJjcmVhdGVUYW5kZW1Gcm9tUGhldGlvSUQiLCJwaGV0aW9JRCIsImNhY2hlIiwicGFyYW1ldGVyVHlwZSIsImhhcyIsInZhbHVlVHlwZSIsInBhcmFtZXRlclR5cGVzIiwic3VwZXJ0eXBlIiwiUHJvcGVydHlJTyIsImRvY3VtZW50YXRpb24iLCJhcHBseVN0YXRlIiwibm9vcCIsIm1ldGhvZHMiLCJzZXRWYWx1ZSIsInJldHVyblR5cGUiLCJpbXBsZW1lbnRhdGlvbiIsInByb3RvdHlwZSIsImludm9jYWJsZUZvclJlYWRPbmx5RWxlbWVudHMiLCJEZXJpdmVkUHJvcGVydHkxIiwiRGVyaXZlZFByb3BlcnR5MiIsIkRlcml2ZWRQcm9wZXJ0eTMiLCJEZXJpdmVkUHJvcGVydHk0IiwiRGVyaXZlZFByb3BlcnR5NSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBRUQsT0FBT0EsZUFBZSxrQ0FBa0M7QUFFeEQsT0FBT0MsaUJBQWlCLGlDQUFpQztBQUN6RCxPQUFPQyxrQkFBa0Isa0NBQWtDO0FBQzNELE9BQU9DLFlBQVksNEJBQTRCO0FBQy9DLE9BQU9DLFlBQVksa0NBQWtDO0FBQ3JELE9BQU9DLFlBQVksa0NBQWtDO0FBQ3JELE9BQU9DLFVBQVUsWUFBWTtBQUU3QixPQUFPQyxjQUFtQyxnQkFBZ0I7QUFDMUQsU0FBU0MsNkJBQTZCLFFBQVEsNEJBQTRCO0FBQzFFLE9BQU9DLHdCQUF3QiwwQkFBMEI7QUFDekQsT0FBT0Msc0JBQXNCLHdCQUF3QjtBQUdyRCxNQUFNQyw2QkFBNkI7QUFVbkM7O0NBRUMsR0FDRCxTQUFTQyxnQkFBc0ZDLFVBQW9HLEVBQUVDLFlBQTRGO0lBRS9SLG1CQUFtQjtJQUNuQixPQUFPRCxjQUFlQyxhQUFhQyxHQUFHLENBQUVDLENBQUFBLFdBQVlBLFNBQVNDLEdBQUc7QUFDbEU7QUFTZSxJQUFBLEFBQU1DLGtCQUFOLE1BQU1BLHdCQUE2RlI7SUFpRmhIOztHQUVDLEdBQ0QsQUFBT1MsY0FBZUMsVUFBNkMsRUFBWTtRQUM3RSxPQUFPLElBQUksQ0FBQ0MsbUJBQW1CLENBQUNDLFFBQVEsQ0FBRUY7SUFDNUM7SUFFQTs7R0FFQyxHQUNELElBQVlDLHNCQUFzRztRQUNoSEUsVUFBVUEsT0FBUSxJQUFJLENBQUNULFlBQVksS0FBSyxNQUFNO1FBQzlDLE9BQU8sSUFBSSxDQUFDQSxZQUFZO0lBQzFCO0lBRUEsV0FBVztJQUNIVSw2QkFBbUM7UUFDekMsNkZBQTZGO1FBQzdGLElBQUssSUFBSSxDQUFDQyxVQUFVLEVBQUc7WUFDckI7UUFDRjtRQUVBLDhHQUE4RztRQUM5Ryw2R0FBNkc7UUFD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