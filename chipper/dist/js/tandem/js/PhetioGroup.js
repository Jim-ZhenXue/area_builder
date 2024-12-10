// Copyright 2019-2024, University of Colorado Boulder
/**
 * Provides a placeholder in the static API for where dynamic elements may be created.  Checks that elements of the group
 * match the approved schema.
 *
 * In general when creating an element, any extra wiring or listeners should not be added. These side effects are a code
 * smell in the `createElement` parameter. Instead attach a listener for when elements are created, and wire up listeners
 * there. Further documentation about using PhetioGroup can be found at
 * https://github.com/phetsims/phet-io/blob/main/doc/phet-io-instrumentation-technical-guide.md#dynamically-created-phet-io-elements
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */ import NumberProperty from '../../axon/js/NumberProperty.js';
import arrayRemove from '../../phet-core/js/arrayRemove.js';
import optionize from '../../phet-core/js/optionize.js';
import IOTypeCache from './IOTypeCache.js';
import isSettingPhetioStateProperty from './isSettingPhetioStateProperty.js';
import PhetioDynamicElementContainer from './PhetioDynamicElementContainer.js';
import phetioStateSetEmitter from './phetioStateSetEmitter.js';
import Tandem from './Tandem.js';
import tandemNamespace from './tandemNamespace.js';
import IOType from './types/IOType.js';
// constants
const DEFAULT_CONTAINER_SUFFIX = 'Group';
// cache each parameterized IOType so that it is only created once.
const cache = new IOTypeCache();
let PhetioGroup = class PhetioGroup extends PhetioDynamicElementContainer {
    /**
   */ dispose() {
        assert && assert(false, 'PhetioGroup not intended for disposal');
    }
    /**
   * Remove an element from this Group, unregistering it from PhET-iO and disposing it.
   * The order is guaranteed to be:
   * 1. remove from internal array
   * 2. update countProperty
   * 3. element.dispose
   * 4. fire elementDisposedEmitter
   *
   * @param element
   */ disposeElement(element) {
        assert && assert(!element.isDisposed, 'element already disposed');
        arrayRemove(this._array, element);
        this.countProperty.value = this._array.length;
        super.disposeElement(element);
    }
    /**
   * Gets a reference to the underlying array. DO NOT create/dispose elements while iterating, or otherwise modify
   * the array.  If you need to modify the array, use getArrayCopy.
   */ getArray() {
        return this._array;
    }
    /**
   * Gets a copy of the underlying array. Use this method if you need to create/dispose elements while iterating,
   * or otherwise modify the group's array.
   */ getArrayCopy() {
        return this._array.slice();
    }
    /**
   * Returns the element at the specified index
   */ getElement(index) {
        assert && assert(index >= 0 && index < this.count, 'index out of bounds: ' + index + ', array length is ' + this.count);
        return this._array[index];
    }
    getLastElement() {
        return this.getElement(this.count - 1);
    }
    /**
   * Gets the number of elements in the group.
   */ get count() {
        return this.countProperty.value;
    }
    /**
   * Returns an array with elements that pass the filter predicate.
   */ filter(predicate) {
        return this._array.filter(predicate);
    }
    /**
   * Does the group include the specified element?
   */ includes(element) {
        return this._array.includes(element);
    }
    /**
   * Gets the index of the specified element in the underlying array.
   */ indexOf(element) {
        return this._array.indexOf(element);
    }
    /**
   * Runs the function on each element of the group.
   */ forEach(action) {
        this._array.forEach(action);
    }
    /**
   * Use the predicate to find the first matching occurrence in the array.
   */ find(predicate) {
        return this._array.find(predicate);
    }
    /**
   * Returns an array with every element mapped to a new one.
   */ map(f) {
        return this._array.map(f);
    }
    /**
   * Remove and dispose all registered group elements
   */ clear(providedOptions) {
        const options = optionize()({
            phetioState: null,
            // whether the group's index is reset to 0 for the next element created
            resetIndex: true
        }, providedOptions);
        while(this._array.length > 0){
            // An earlier draft removed elements from the end (First In, Last Out). However, listeners that observe this list
            // often need to run arrayRemove for corresponding elements, which is based on indexOf and causes an O(N^2) behavior
            // by default (since the first removal requires skimming over the entire list). Hence we prefer First In, First
            // Out, so that listeners will have O(n) behavior for removal from associated lists.
            // See https://github.com/phetsims/natural-selection/issues/252
            this.disposeElement(this._array[0]);
        }
        if (options.resetIndex) {
            this.groupElementIndex = this.groupElementStartingIndex;
        }
    }
    /**
   * When creating a view element that corresponds to a specific model element, we match the tandem name index suffix
   * so that electron_0 corresponds to electronNode_0 and so on.
   * @param tandemName - the tandem name of the model element
   * @param argsForCreateFunction - args to be passed to the create function, specified there are in the IOType
   *                                      `stateObjectToCreateElementArguments` method
   */ createCorrespondingGroupElement(tandemName, ...argsForCreateFunction) {
        const index = window.phetio.PhetioIDUtils.getGroupElementIndex(tandemName);
        // If the specified index overlapped with the next available index, bump it up so there is no collision on the
        // next createNextElement
        if (this.groupElementIndex === index) {
            this.groupElementIndex++;
        }
        return this.createIndexedElement(index, argsForCreateFunction);
    }
    /**
   * Creates the next group element.
   * @param argsForCreateFunction - args to be passed to the create function, specified there are in the IOType
   *                                      `stateObjectToCreateElementArguments` method
   */ createNextElement(...argsForCreateFunction) {
        return this.createIndexedElement(this.groupElementIndex++, argsForCreateFunction);
    }
    /**
   * Primarily for internal use, clients should usually use createNextElement.
   * The order is guaranteed to be:
   * 1. instantiate element
   * 2. add to internal array
   * 3. update countProperty
   * 4. fire elementCreatedEmitter
   *
   * @param index - the number of the individual element
   * @param argsForCreateFunction
   * @param [fromStateSetting] - Used for validation during state setting.
   * (PhetioGroupIO)
   */ createIndexedElement(index, argsForCreateFunction, fromStateSetting = false) {
        assert && Tandem.VALIDATION && assert(this.isPhetioInstrumented(), 'TODO: support uninstrumented PhetioGroups? see https://github.com/phetsims/tandem/issues/184');
        assert && this.supportsDynamicState && _.hasIn(window, 'phet.joist.sim') && assert && isSettingPhetioStateProperty.value && assert(fromStateSetting, 'dynamic elements should only be created by the state engine when setting state.');
        const componentName = this.phetioDynamicElementName + window.phetio.PhetioIDUtils.GROUP_SEPARATOR + index;
        // Don't access phetioType in PhET brand
        const containerParameterType = Tandem.PHET_IO_ENABLED ? this.phetioType.parameterTypes[0] : null;
        const groupElement = this.createDynamicElement(componentName, argsForCreateFunction, containerParameterType);
        this._array.push(groupElement);
        this.countProperty.value = this._array.length;
        this.notifyElementCreated(groupElement);
        return groupElement;
    }
    /**
   * @param createElement - function that creates a dynamic element to be housed in
   * this container. All of this dynamic element container's elements will be created from this function, including the
   * archetype.
   * @param defaultArguments - arguments passed to createElement when creating the archetype.
   *                                       Note: if `createElement` supports options, but don't need options for this
   *                                       defaults array, you should pass an empty object here anyways.
   * @param [providedOptions] - describe the Group itself
   */ constructor(createElement, defaultArguments, providedOptions){
        var _options_tandem;
        const options = optionize()({
            groupElementStartingIndex: 1,
            // {string} The group's tandem name must have this suffix, and the base tandem name for elements of
            // the group will consist of the group's tandem name with this suffix stripped off.
            containerSuffix: DEFAULT_CONTAINER_SUFFIX
        }, providedOptions);
        super(createElement, defaultArguments, options);
        // (PhetioGroupTests only) access using getArray or getArrayCopy
        this._array = [];
        this.groupElementStartingIndex = options.groupElementStartingIndex;
        this.groupElementIndex = this.groupElementStartingIndex;
        this.countProperty = new NumberProperty(0, {
            tandem: (_options_tandem = options.tandem) == null ? void 0 : _options_tandem.createTandem('countProperty'),
            phetioDocumentation: 'the number of elements in the group',
            phetioReadOnly: true,
            phetioFeatured: true,
            numberType: 'Integer'
        });
        assert && this.countProperty.link((count)=>{
            if (assert && !isSettingPhetioStateProperty.value) {
                assert && assert(count === this._array.length, `${this.countProperty.tandem.phetioID} listener fired and array length differs, count=${count}, arrayLength=${this._array.length}`);
            }
        });
        // countProperty can be overwritten during state set, see PhetioGroup.createIndexedElement(), and so this assertion
        // makes sure that the final length of the elements array matches the expected count from the state.
        assert && Tandem.VALIDATION && phetioStateSetEmitter.addListener((state)=>{
            // This supports cases when only partial state is being set
            if (state[this.countProperty.tandem.phetioID]) {
                assert && assert(state[this.countProperty.tandem.phetioID].value === this._array.length, `${this.countProperty.tandem.phetioID} should match array length.  Expected ${state[this.countProperty.tandem.phetioID].value} but found ${this._array.length}`);
            }
        });
    }
};
/**
   * Parametric IOType constructor.  Given an element type, this function returns a PhetioGroup IOType.
   */ PhetioGroup.PhetioGroupIO = (parameterType)=>{
    // TODO: https://github.com/phetsims/tandem/issues/254 specify the correct type instead of IntentionalAny
    if (!cache.has(parameterType)) {
        cache.set(parameterType, new IOType(`PhetioGroupIO<${parameterType.typeName}>`, {
            isValidValue: (v)=>{
                // @ts-expect-error - handle built and unbuilt versions
                const PhetioGroup = window.phet ? phet.tandem.PhetioGroup : tandemNamespace.PhetioGroup;
                return v instanceof PhetioGroup;
            },
            documentation: 'An array that sends notifications when its values have changed.',
            // This is always specified by PhetioGroup, and will never be this value.
            // See documentation in PhetioCapsule
            metadataDefaults: {
                phetioDynamicElementName: null
            },
            parameterTypes: [
                parameterType
            ],
            /**
         * Creates an element and adds it to the group
         * @throws CouldNotYetDeserializeError - if it could not yet deserialize
         * (PhetioStateEngine)
         */ // @ts-expect-error The group is a group, not just a PhetioDynamicElementContainer
            addChildElement (group, componentName, stateObject) {
                // should throw CouldNotYetDeserializeError if it can't be created yet. Likely that would be because another
                // element in the state needs to be created first, so we will try again on the next iteration of the state
                // setting engine.
                const args = parameterType.stateObjectToCreateElementArguments(stateObject);
                const index = window.phetio.PhetioIDUtils.getGroupElementIndex(componentName);
                // @ts-expect-error args is of type P, but we can't really communicate that here
                const groupElement = group.createIndexedElement(index, args, true);
                // Keep the groupElementIndex in sync so that the next index is set appropriately. This covers the case where
                // no elements have been created in the sim, instead they have only been set via state.
                group.groupElementIndex = Math.max(index + 1, group.groupElementIndex);
                return groupElement;
            }
        }));
    }
    return cache.get(parameterType);
};
tandemNamespace.register('PhetioGroup', PhetioGroup);
export default PhetioGroup;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9Hcm91cC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBQcm92aWRlcyBhIHBsYWNlaG9sZGVyIGluIHRoZSBzdGF0aWMgQVBJIGZvciB3aGVyZSBkeW5hbWljIGVsZW1lbnRzIG1heSBiZSBjcmVhdGVkLiAgQ2hlY2tzIHRoYXQgZWxlbWVudHMgb2YgdGhlIGdyb3VwXG4gKiBtYXRjaCB0aGUgYXBwcm92ZWQgc2NoZW1hLlxuICpcbiAqIEluIGdlbmVyYWwgd2hlbiBjcmVhdGluZyBhbiBlbGVtZW50LCBhbnkgZXh0cmEgd2lyaW5nIG9yIGxpc3RlbmVycyBzaG91bGQgbm90IGJlIGFkZGVkLiBUaGVzZSBzaWRlIGVmZmVjdHMgYXJlIGEgY29kZVxuICogc21lbGwgaW4gdGhlIGBjcmVhdGVFbGVtZW50YCBwYXJhbWV0ZXIuIEluc3RlYWQgYXR0YWNoIGEgbGlzdGVuZXIgZm9yIHdoZW4gZWxlbWVudHMgYXJlIGNyZWF0ZWQsIGFuZCB3aXJlIHVwIGxpc3RlbmVyc1xuICogdGhlcmUuIEZ1cnRoZXIgZG9jdW1lbnRhdGlvbiBhYm91dCB1c2luZyBQaGV0aW9Hcm91cCBjYW4gYmUgZm91bmQgYXRcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvL2Jsb2IvbWFpbi9kb2MvcGhldC1pby1pbnN0cnVtZW50YXRpb24tdGVjaG5pY2FsLWd1aWRlLm1kI2R5bmFtaWNhbGx5LWNyZWF0ZWQtcGhldC1pby1lbGVtZW50c1xuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xuaW1wb3J0IGFycmF5UmVtb3ZlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9hcnJheVJlbW92ZS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgSU9UeXBlQ2FjaGUgZnJvbSAnLi9JT1R5cGVDYWNoZS5qcyc7XG5pbXBvcnQgaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eSBmcm9tICcuL2lzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkuanMnO1xuaW1wb3J0IFBoZXRpb0R5bmFtaWNFbGVtZW50Q29udGFpbmVyLCB7IENsZWFyT3B0aW9ucywgUGhldGlvRHluYW1pY0VsZW1lbnRDb250YWluZXJPcHRpb25zIH0gZnJvbSAnLi9QaGV0aW9EeW5hbWljRWxlbWVudENvbnRhaW5lci5qcyc7XG5pbXBvcnQgUGhldGlvT2JqZWN0IGZyb20gJy4vUGhldGlvT2JqZWN0LmpzJztcbmltcG9ydCBwaGV0aW9TdGF0ZVNldEVtaXR0ZXIgZnJvbSAnLi9waGV0aW9TdGF0ZVNldEVtaXR0ZXIuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuL1RhbmRlbS5qcyc7XG5pbXBvcnQgdGFuZGVtTmFtZXNwYWNlIGZyb20gJy4vdGFuZGVtTmFtZXNwYWNlLmpzJztcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi90eXBlcy9JT1R5cGUuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IERFRkFVTFRfQ09OVEFJTkVSX1NVRkZJWCA9ICdHcm91cCc7XG5cbnR5cGUgUGhldGlvR3JvdXBDbGVhck9wdGlvbnMgPSB7XG4gIHJlc2V0SW5kZXg/OiBib29sZWFuO1xufSAmIENsZWFyT3B0aW9ucztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyBXaGF0IHRoZSB0YW5kZW0gbmFtZSBpbmRleCBjb3VudCBzaG91bGQgc3RhcnQgYXQsIGRlZmF1bHQgdG8gMFxuICBncm91cEVsZW1lbnRTdGFydGluZ0luZGV4PzogbnVtYmVyO1xufTtcbmV4cG9ydCB0eXBlIFBoZXRpb0dyb3VwT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGhldGlvRHluYW1pY0VsZW1lbnRDb250YWluZXJPcHRpb25zO1xuXG4vLyBjYWNoZSBlYWNoIHBhcmFtZXRlcml6ZWQgSU9UeXBlIHNvIHRoYXQgaXQgaXMgb25seSBjcmVhdGVkIG9uY2UuXG5jb25zdCBjYWNoZSA9IG5ldyBJT1R5cGVDYWNoZSgpO1xuXG5jbGFzcyBQaGV0aW9Hcm91cDxUIGV4dGVuZHMgUGhldGlvT2JqZWN0LCBQIGV4dGVuZHMgSW50ZW50aW9uYWxBbnlbXSA9IFtdPiBleHRlbmRzIFBoZXRpb0R5bmFtaWNFbGVtZW50Q29udGFpbmVyPFQsIFA+IHtcbiAgcHJpdmF0ZSByZWFkb25seSBfYXJyYXk6IFRbXTtcblxuICAvLyAob25seSBmb3IgUGhldGlvR3JvdXBJTykgLSBmb3IgZ2VuZXJhdGluZyBpbmRpY2VzIGZyb20gYSBwb29sXG4gIHByaXZhdGUgZ3JvdXBFbGVtZW50SW5kZXg6IG51bWJlcjtcbiAgcHJpdmF0ZSBncm91cEVsZW1lbnRTdGFydGluZ0luZGV4OiBudW1iZXI7XG4gIHB1YmxpYyByZWFkb25seSBjb3VudFByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eTsgLy8gKHJlYWQtb25seSlcblxuICAvKipcbiAgICogQHBhcmFtIGNyZWF0ZUVsZW1lbnQgLSBmdW5jdGlvbiB0aGF0IGNyZWF0ZXMgYSBkeW5hbWljIGVsZW1lbnQgdG8gYmUgaG91c2VkIGluXG4gICAqIHRoaXMgY29udGFpbmVyLiBBbGwgb2YgdGhpcyBkeW5hbWljIGVsZW1lbnQgY29udGFpbmVyJ3MgZWxlbWVudHMgd2lsbCBiZSBjcmVhdGVkIGZyb20gdGhpcyBmdW5jdGlvbiwgaW5jbHVkaW5nIHRoZVxuICAgKiBhcmNoZXR5cGUuXG4gICAqIEBwYXJhbSBkZWZhdWx0QXJndW1lbnRzIC0gYXJndW1lbnRzIHBhc3NlZCB0byBjcmVhdGVFbGVtZW50IHdoZW4gY3JlYXRpbmcgdGhlIGFyY2hldHlwZS5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOb3RlOiBpZiBgY3JlYXRlRWxlbWVudGAgc3VwcG9ydHMgb3B0aW9ucywgYnV0IGRvbid0IG5lZWQgb3B0aW9ucyBmb3IgdGhpc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHRzIGFycmF5LCB5b3Ugc2hvdWxkIHBhc3MgYW4gZW1wdHkgb2JqZWN0IGhlcmUgYW55d2F5cy5cbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdIC0gZGVzY3JpYmUgdGhlIEdyb3VwIGl0c2VsZlxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjcmVhdGVFbGVtZW50OiAoIHQ6IFRhbmRlbSwgLi4ucDogUCApID0+IFQsIGRlZmF1bHRBcmd1bWVudHM6IFAgfCAoICgpID0+IFAgKSwgcHJvdmlkZWRPcHRpb25zPzogUGhldGlvR3JvdXBPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxQaGV0aW9Hcm91cE9wdGlvbnMsIFNlbGZPcHRpb25zLCBQaGV0aW9EeW5hbWljRWxlbWVudENvbnRhaW5lck9wdGlvbnM+KCkoIHtcbiAgICAgIGdyb3VwRWxlbWVudFN0YXJ0aW5nSW5kZXg6IDEsXG5cbiAgICAgIC8vIHtzdHJpbmd9IFRoZSBncm91cCdzIHRhbmRlbSBuYW1lIG11c3QgaGF2ZSB0aGlzIHN1ZmZpeCwgYW5kIHRoZSBiYXNlIHRhbmRlbSBuYW1lIGZvciBlbGVtZW50cyBvZlxuICAgICAgLy8gdGhlIGdyb3VwIHdpbGwgY29uc2lzdCBvZiB0aGUgZ3JvdXAncyB0YW5kZW0gbmFtZSB3aXRoIHRoaXMgc3VmZml4IHN0cmlwcGVkIG9mZi5cbiAgICAgIGNvbnRhaW5lclN1ZmZpeDogREVGQVVMVF9DT05UQUlORVJfU1VGRklYXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBzdXBlciggY3JlYXRlRWxlbWVudCwgZGVmYXVsdEFyZ3VtZW50cywgb3B0aW9ucyApO1xuXG4gICAgLy8gKFBoZXRpb0dyb3VwVGVzdHMgb25seSkgYWNjZXNzIHVzaW5nIGdldEFycmF5IG9yIGdldEFycmF5Q29weVxuICAgIHRoaXMuX2FycmF5ID0gW107XG5cblxuICAgIHRoaXMuZ3JvdXBFbGVtZW50U3RhcnRpbmdJbmRleCA9IG9wdGlvbnMuZ3JvdXBFbGVtZW50U3RhcnRpbmdJbmRleDtcbiAgICB0aGlzLmdyb3VwRWxlbWVudEluZGV4ID0gdGhpcy5ncm91cEVsZW1lbnRTdGFydGluZ0luZGV4O1xuXG4gICAgdGhpcy5jb3VudFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtPy5jcmVhdGVUYW5kZW0oICdjb3VudFByb3BlcnR5JyApLFxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhlIGdyb3VwJyxcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxuICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWUsXG4gICAgICBudW1iZXJUeXBlOiAnSW50ZWdlcidcbiAgICB9ICk7XG5cbiAgICBhc3NlcnQgJiYgdGhpcy5jb3VudFByb3BlcnR5LmxpbmsoIGNvdW50ID0+IHtcbiAgICAgIGlmICggYXNzZXJ0ICYmICFpc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5LnZhbHVlICkge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjb3VudCA9PT0gdGhpcy5fYXJyYXkubGVuZ3RoLCBgJHt0aGlzLmNvdW50UHJvcGVydHkudGFuZGVtLnBoZXRpb0lEfSBsaXN0ZW5lciBmaXJlZCBhbmQgYXJyYXkgbGVuZ3RoIGRpZmZlcnMsIGNvdW50PSR7Y291bnR9LCBhcnJheUxlbmd0aD0ke3RoaXMuX2FycmF5Lmxlbmd0aH1gICk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gY291bnRQcm9wZXJ0eSBjYW4gYmUgb3ZlcndyaXR0ZW4gZHVyaW5nIHN0YXRlIHNldCwgc2VlIFBoZXRpb0dyb3VwLmNyZWF0ZUluZGV4ZWRFbGVtZW50KCksIGFuZCBzbyB0aGlzIGFzc2VydGlvblxuICAgIC8vIG1ha2VzIHN1cmUgdGhhdCB0aGUgZmluYWwgbGVuZ3RoIG9mIHRoZSBlbGVtZW50cyBhcnJheSBtYXRjaGVzIHRoZSBleHBlY3RlZCBjb3VudCBmcm9tIHRoZSBzdGF0ZS5cbiAgICBhc3NlcnQgJiYgVGFuZGVtLlZBTElEQVRJT04gJiYgcGhldGlvU3RhdGVTZXRFbWl0dGVyLmFkZExpc3RlbmVyKCAoIHN0YXRlOiBSZWNvcmQ8c3RyaW5nLCBJbnRlbnRpb25hbEFueT4gKSA9PiB7XG5cbiAgICAgIC8vIFRoaXMgc3VwcG9ydHMgY2FzZXMgd2hlbiBvbmx5IHBhcnRpYWwgc3RhdGUgaXMgYmVpbmcgc2V0XG4gICAgICBpZiAoIHN0YXRlWyB0aGlzLmNvdW50UHJvcGVydHkudGFuZGVtLnBoZXRpb0lEIF0gKSB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHN0YXRlWyB0aGlzLmNvdW50UHJvcGVydHkudGFuZGVtLnBoZXRpb0lEIF0udmFsdWUgPT09IHRoaXMuX2FycmF5Lmxlbmd0aCwgYCR7dGhpcy5jb3VudFByb3BlcnR5LnRhbmRlbS5waGV0aW9JRH0gc2hvdWxkIG1hdGNoIGFycmF5IGxlbmd0aC4gIEV4cGVjdGVkICR7c3RhdGVbIHRoaXMuY291bnRQcm9wZXJ0eS50YW5kZW0ucGhldGlvSUQgXS52YWx1ZX0gYnV0IGZvdW5kICR7dGhpcy5fYXJyYXkubGVuZ3RofWAgKTtcbiAgICAgIH1cbiAgICB9ICk7XG4gIH1cblxuICAvKipcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnUGhldGlvR3JvdXAgbm90IGludGVuZGVkIGZvciBkaXNwb3NhbCcgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYW4gZWxlbWVudCBmcm9tIHRoaXMgR3JvdXAsIHVucmVnaXN0ZXJpbmcgaXQgZnJvbSBQaEVULWlPIGFuZCBkaXNwb3NpbmcgaXQuXG4gICAqIFRoZSBvcmRlciBpcyBndWFyYW50ZWVkIHRvIGJlOlxuICAgKiAxLiByZW1vdmUgZnJvbSBpbnRlcm5hbCBhcnJheVxuICAgKiAyLiB1cGRhdGUgY291bnRQcm9wZXJ0eVxuICAgKiAzLiBlbGVtZW50LmRpc3Bvc2VcbiAgICogNC4gZmlyZSBlbGVtZW50RGlzcG9zZWRFbWl0dGVyXG4gICAqXG4gICAqIEBwYXJhbSBlbGVtZW50XG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZUVsZW1lbnQoIGVsZW1lbnQ6IFQgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIWVsZW1lbnQuaXNEaXNwb3NlZCwgJ2VsZW1lbnQgYWxyZWFkeSBkaXNwb3NlZCcgKTtcbiAgICBhcnJheVJlbW92ZSggdGhpcy5fYXJyYXksIGVsZW1lbnQgKTtcblxuICAgIHRoaXMuY291bnRQcm9wZXJ0eS52YWx1ZSA9IHRoaXMuX2FycmF5Lmxlbmd0aDtcblxuICAgIHN1cGVyLmRpc3Bvc2VFbGVtZW50KCBlbGVtZW50ICk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIHJlZmVyZW5jZSB0byB0aGUgdW5kZXJseWluZyBhcnJheS4gRE8gTk9UIGNyZWF0ZS9kaXNwb3NlIGVsZW1lbnRzIHdoaWxlIGl0ZXJhdGluZywgb3Igb3RoZXJ3aXNlIG1vZGlmeVxuICAgKiB0aGUgYXJyYXkuICBJZiB5b3UgbmVlZCB0byBtb2RpZnkgdGhlIGFycmF5LCB1c2UgZ2V0QXJyYXlDb3B5LlxuICAgKi9cbiAgcHVibGljIGdldEFycmF5KCk6IFRbXSB7XG4gICAgcmV0dXJuIHRoaXMuX2FycmF5O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBjb3B5IG9mIHRoZSB1bmRlcmx5aW5nIGFycmF5LiBVc2UgdGhpcyBtZXRob2QgaWYgeW91IG5lZWQgdG8gY3JlYXRlL2Rpc3Bvc2UgZWxlbWVudHMgd2hpbGUgaXRlcmF0aW5nLFxuICAgKiBvciBvdGhlcndpc2UgbW9kaWZ5IHRoZSBncm91cCdzIGFycmF5LlxuICAgKi9cbiAgcHVibGljIGdldEFycmF5Q29weSgpOiBUW10ge1xuICAgIHJldHVybiB0aGlzLl9hcnJheS5zbGljZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGVsZW1lbnQgYXQgdGhlIHNwZWNpZmllZCBpbmRleFxuICAgKi9cbiAgcHVibGljIGdldEVsZW1lbnQoIGluZGV4OiBudW1iZXIgKTogVCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5kZXggPj0gMCAmJiBpbmRleCA8IHRoaXMuY291bnQsICdpbmRleCBvdXQgb2YgYm91bmRzOiAnICsgaW5kZXggKyAnLCBhcnJheSBsZW5ndGggaXMgJyArIHRoaXMuY291bnQgKTtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbIGluZGV4IF07XG4gIH1cblxuICBwdWJsaWMgZ2V0TGFzdEVsZW1lbnQoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RWxlbWVudCggdGhpcy5jb3VudCAtIDEgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhlIGdyb3VwLlxuICAgKi9cbiAgcHVibGljIGdldCBjb3VudCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5jb3VudFByb3BlcnR5LnZhbHVlOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYXJyYXkgd2l0aCBlbGVtZW50cyB0aGF0IHBhc3MgdGhlIGZpbHRlciBwcmVkaWNhdGUuXG4gICAqL1xuICBwdWJsaWMgZmlsdGVyKCBwcmVkaWNhdGU6ICggdDogVCApID0+IGJvb2xlYW4gKTogVFtdIHsgcmV0dXJuIHRoaXMuX2FycmF5LmZpbHRlciggcHJlZGljYXRlICk7IH1cblxuICAvKipcbiAgICogRG9lcyB0aGUgZ3JvdXAgaW5jbHVkZSB0aGUgc3BlY2lmaWVkIGVsZW1lbnQ/XG4gICAqL1xuICBwdWJsaWMgaW5jbHVkZXMoIGVsZW1lbnQ6IFQgKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9hcnJheS5pbmNsdWRlcyggZWxlbWVudCApOyB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGluZGV4IG9mIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBpbiB0aGUgdW5kZXJseWluZyBhcnJheS5cbiAgICovXG4gIHB1YmxpYyBpbmRleE9mKCBlbGVtZW50OiBUICk6IG51bWJlciB7IHJldHVybiB0aGlzLl9hcnJheS5pbmRleE9mKCBlbGVtZW50ICk7IH1cblxuICAvKipcbiAgICogUnVucyB0aGUgZnVuY3Rpb24gb24gZWFjaCBlbGVtZW50IG9mIHRoZSBncm91cC5cbiAgICovXG4gIHB1YmxpYyBmb3JFYWNoKCBhY3Rpb246ICggdDogVCApID0+IHZvaWQgKTogdm9pZCB7IHRoaXMuX2FycmF5LmZvckVhY2goIGFjdGlvbiApOyB9XG5cbiAgLyoqXG4gICAqIFVzZSB0aGUgcHJlZGljYXRlIHRvIGZpbmQgdGhlIGZpcnN0IG1hdGNoaW5nIG9jY3VycmVuY2UgaW4gdGhlIGFycmF5LlxuICAgKi9cbiAgcHVibGljIGZpbmQoIHByZWRpY2F0ZTogKCB0OiBUICkgPT4gYm9vbGVhbiApOiBUIHwgdW5kZWZpbmVkIHsgcmV0dXJuIHRoaXMuX2FycmF5LmZpbmQoIHByZWRpY2F0ZSApOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYXJyYXkgd2l0aCBldmVyeSBlbGVtZW50IG1hcHBlZCB0byBhIG5ldyBvbmUuXG4gICAqL1xuICBwdWJsaWMgbWFwPFU+KCBmOiAoIHQ6IFQgKSA9PiBVICk6IFVbXSB7IHJldHVybiB0aGlzLl9hcnJheS5tYXAoIGYgKTsgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYW5kIGRpc3Bvc2UgYWxsIHJlZ2lzdGVyZWQgZ3JvdXAgZWxlbWVudHNcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBjbGVhciggcHJvdmlkZWRPcHRpb25zPzogUGhldGlvR3JvdXBDbGVhck9wdGlvbnMgKTogdm9pZCB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxQaGV0aW9Hcm91cENsZWFyT3B0aW9ucz4oKSgge1xuICAgICAgcGhldGlvU3RhdGU6IG51bGwsIC8vIG5vdCBzdXBwb3J0ZWQgaW4gUGhldGlvR3JvdXAgYXQgdGhpcyB0aW1lXG5cbiAgICAgIC8vIHdoZXRoZXIgdGhlIGdyb3VwJ3MgaW5kZXggaXMgcmVzZXQgdG8gMCBmb3IgdGhlIG5leHQgZWxlbWVudCBjcmVhdGVkXG4gICAgICByZXNldEluZGV4OiB0cnVlXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICB3aGlsZSAoIHRoaXMuX2FycmF5Lmxlbmd0aCA+IDAgKSB7XG5cbiAgICAgIC8vIEFuIGVhcmxpZXIgZHJhZnQgcmVtb3ZlZCBlbGVtZW50cyBmcm9tIHRoZSBlbmQgKEZpcnN0IEluLCBMYXN0IE91dCkuIEhvd2V2ZXIsIGxpc3RlbmVycyB0aGF0IG9ic2VydmUgdGhpcyBsaXN0XG4gICAgICAvLyBvZnRlbiBuZWVkIHRvIHJ1biBhcnJheVJlbW92ZSBmb3IgY29ycmVzcG9uZGluZyBlbGVtZW50cywgd2hpY2ggaXMgYmFzZWQgb24gaW5kZXhPZiBhbmQgY2F1c2VzIGFuIE8oTl4yKSBiZWhhdmlvclxuICAgICAgLy8gYnkgZGVmYXVsdCAoc2luY2UgdGhlIGZpcnN0IHJlbW92YWwgcmVxdWlyZXMgc2tpbW1pbmcgb3ZlciB0aGUgZW50aXJlIGxpc3QpLiBIZW5jZSB3ZSBwcmVmZXIgRmlyc3QgSW4sIEZpcnN0XG4gICAgICAvLyBPdXQsIHNvIHRoYXQgbGlzdGVuZXJzIHdpbGwgaGF2ZSBPKG4pIGJlaGF2aW9yIGZvciByZW1vdmFsIGZyb20gYXNzb2NpYXRlZCBsaXN0cy5cbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbmF0dXJhbC1zZWxlY3Rpb24vaXNzdWVzLzI1MlxuICAgICAgdGhpcy5kaXNwb3NlRWxlbWVudCggdGhpcy5fYXJyYXlbIDAgXSApO1xuICAgIH1cblxuICAgIGlmICggb3B0aW9ucy5yZXNldEluZGV4ICkge1xuICAgICAgdGhpcy5ncm91cEVsZW1lbnRJbmRleCA9IHRoaXMuZ3JvdXBFbGVtZW50U3RhcnRpbmdJbmRleDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogV2hlbiBjcmVhdGluZyBhIHZpZXcgZWxlbWVudCB0aGF0IGNvcnJlc3BvbmRzIHRvIGEgc3BlY2lmaWMgbW9kZWwgZWxlbWVudCwgd2UgbWF0Y2ggdGhlIHRhbmRlbSBuYW1lIGluZGV4IHN1ZmZpeFxuICAgKiBzbyB0aGF0IGVsZWN0cm9uXzAgY29ycmVzcG9uZHMgdG8gZWxlY3Ryb25Ob2RlXzAgYW5kIHNvIG9uLlxuICAgKiBAcGFyYW0gdGFuZGVtTmFtZSAtIHRoZSB0YW5kZW0gbmFtZSBvZiB0aGUgbW9kZWwgZWxlbWVudFxuICAgKiBAcGFyYW0gYXJnc0ZvckNyZWF0ZUZ1bmN0aW9uIC0gYXJncyB0byBiZSBwYXNzZWQgdG8gdGhlIGNyZWF0ZSBmdW5jdGlvbiwgc3BlY2lmaWVkIHRoZXJlIGFyZSBpbiB0aGUgSU9UeXBlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgc3RhdGVPYmplY3RUb0NyZWF0ZUVsZW1lbnRBcmd1bWVudHNgIG1ldGhvZFxuICAgKi9cbiAgcHVibGljIGNyZWF0ZUNvcnJlc3BvbmRpbmdHcm91cEVsZW1lbnQoIHRhbmRlbU5hbWU6IHN0cmluZywgLi4uYXJnc0ZvckNyZWF0ZUZ1bmN0aW9uOiBQICk6IFQge1xuXG4gICAgY29uc3QgaW5kZXggPSB3aW5kb3cucGhldGlvLlBoZXRpb0lEVXRpbHMuZ2V0R3JvdXBFbGVtZW50SW5kZXgoIHRhbmRlbU5hbWUgKTtcblxuICAgIC8vIElmIHRoZSBzcGVjaWZpZWQgaW5kZXggb3ZlcmxhcHBlZCB3aXRoIHRoZSBuZXh0IGF2YWlsYWJsZSBpbmRleCwgYnVtcCBpdCB1cCBzbyB0aGVyZSBpcyBubyBjb2xsaXNpb24gb24gdGhlXG4gICAgLy8gbmV4dCBjcmVhdGVOZXh0RWxlbWVudFxuICAgIGlmICggdGhpcy5ncm91cEVsZW1lbnRJbmRleCA9PT0gaW5kZXggKSB7XG4gICAgICB0aGlzLmdyb3VwRWxlbWVudEluZGV4Kys7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNyZWF0ZUluZGV4ZWRFbGVtZW50KCBpbmRleCwgYXJnc0ZvckNyZWF0ZUZ1bmN0aW9uICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyB0aGUgbmV4dCBncm91cCBlbGVtZW50LlxuICAgKiBAcGFyYW0gYXJnc0ZvckNyZWF0ZUZ1bmN0aW9uIC0gYXJncyB0byBiZSBwYXNzZWQgdG8gdGhlIGNyZWF0ZSBmdW5jdGlvbiwgc3BlY2lmaWVkIHRoZXJlIGFyZSBpbiB0aGUgSU9UeXBlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgc3RhdGVPYmplY3RUb0NyZWF0ZUVsZW1lbnRBcmd1bWVudHNgIG1ldGhvZFxuICAgKi9cbiAgcHVibGljIGNyZWF0ZU5leHRFbGVtZW50KCAuLi5hcmdzRm9yQ3JlYXRlRnVuY3Rpb246IFAgKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlSW5kZXhlZEVsZW1lbnQoIHRoaXMuZ3JvdXBFbGVtZW50SW5kZXgrKywgYXJnc0ZvckNyZWF0ZUZ1bmN0aW9uICk7XG4gIH1cblxuICAvKipcbiAgICogUHJpbWFyaWx5IGZvciBpbnRlcm5hbCB1c2UsIGNsaWVudHMgc2hvdWxkIHVzdWFsbHkgdXNlIGNyZWF0ZU5leHRFbGVtZW50LlxuICAgKiBUaGUgb3JkZXIgaXMgZ3VhcmFudGVlZCB0byBiZTpcbiAgICogMS4gaW5zdGFudGlhdGUgZWxlbWVudFxuICAgKiAyLiBhZGQgdG8gaW50ZXJuYWwgYXJyYXlcbiAgICogMy4gdXBkYXRlIGNvdW50UHJvcGVydHlcbiAgICogNC4gZmlyZSBlbGVtZW50Q3JlYXRlZEVtaXR0ZXJcbiAgICpcbiAgICogQHBhcmFtIGluZGV4IC0gdGhlIG51bWJlciBvZiB0aGUgaW5kaXZpZHVhbCBlbGVtZW50XG4gICAqIEBwYXJhbSBhcmdzRm9yQ3JlYXRlRnVuY3Rpb25cbiAgICogQHBhcmFtIFtmcm9tU3RhdGVTZXR0aW5nXSAtIFVzZWQgZm9yIHZhbGlkYXRpb24gZHVyaW5nIHN0YXRlIHNldHRpbmcuXG4gICAqIChQaGV0aW9Hcm91cElPKVxuICAgKi9cbiAgcHVibGljIGNyZWF0ZUluZGV4ZWRFbGVtZW50KCBpbmRleDogbnVtYmVyLCBhcmdzRm9yQ3JlYXRlRnVuY3Rpb246IFAsIGZyb21TdGF0ZVNldHRpbmcgPSBmYWxzZSApOiBUIHtcbiAgICBhc3NlcnQgJiYgVGFuZGVtLlZBTElEQVRJT04gJiYgYXNzZXJ0KCB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCksICdUT0RPOiBzdXBwb3J0IHVuaW5zdHJ1bWVudGVkIFBoZXRpb0dyb3Vwcz8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy90YW5kZW0vaXNzdWVzLzE4NCcgKTtcblxuICAgIGFzc2VydCAmJiB0aGlzLnN1cHBvcnRzRHluYW1pY1N0YXRlICYmIF8uaGFzSW4oIHdpbmRvdywgJ3BoZXQuam9pc3Quc2ltJyApICYmXG4gICAgYXNzZXJ0ICYmIGlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkudmFsdWUgJiYgYXNzZXJ0KCBmcm9tU3RhdGVTZXR0aW5nLFxuICAgICAgJ2R5bmFtaWMgZWxlbWVudHMgc2hvdWxkIG9ubHkgYmUgY3JlYXRlZCBieSB0aGUgc3RhdGUgZW5naW5lIHdoZW4gc2V0dGluZyBzdGF0ZS4nICk7XG5cbiAgICBjb25zdCBjb21wb25lbnROYW1lID0gdGhpcy5waGV0aW9EeW5hbWljRWxlbWVudE5hbWUgKyB3aW5kb3cucGhldGlvLlBoZXRpb0lEVXRpbHMuR1JPVVBfU0VQQVJBVE9SICsgaW5kZXg7XG5cbiAgICAvLyBEb24ndCBhY2Nlc3MgcGhldGlvVHlwZSBpbiBQaEVUIGJyYW5kXG4gICAgY29uc3QgY29udGFpbmVyUGFyYW1ldGVyVHlwZSA9IFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgPyB0aGlzLnBoZXRpb1R5cGUucGFyYW1ldGVyVHlwZXMhWyAwIF0gOiBudWxsO1xuXG4gICAgY29uc3QgZ3JvdXBFbGVtZW50ID0gdGhpcy5jcmVhdGVEeW5hbWljRWxlbWVudCggY29tcG9uZW50TmFtZSwgYXJnc0ZvckNyZWF0ZUZ1bmN0aW9uLCBjb250YWluZXJQYXJhbWV0ZXJUeXBlICk7XG5cbiAgICB0aGlzLl9hcnJheS5wdXNoKCBncm91cEVsZW1lbnQgKTtcblxuICAgIHRoaXMuY291bnRQcm9wZXJ0eS52YWx1ZSA9IHRoaXMuX2FycmF5Lmxlbmd0aDtcblxuICAgIHRoaXMubm90aWZ5RWxlbWVudENyZWF0ZWQoIGdyb3VwRWxlbWVudCApO1xuXG4gICAgcmV0dXJuIGdyb3VwRWxlbWVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJhbWV0cmljIElPVHlwZSBjb25zdHJ1Y3Rvci4gIEdpdmVuIGFuIGVsZW1lbnQgdHlwZSwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIGEgUGhldGlvR3JvdXAgSU9UeXBlLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBQaGV0aW9Hcm91cElPID0gPFBhcmFtZXRlclR5cGUgZXh0ZW5kcyBQaGV0aW9PYmplY3QsIFBhcmFtZXRlclN0YXRlVHlwZSBleHRlbmRzIFBhcmFtZXRlclN0YXRlU2VsZlR5cGUsIFBhcmFtZXRlclN0YXRlU2VsZlR5cGU+KCBwYXJhbWV0ZXJUeXBlOiBJT1R5cGU8UGFyYW1ldGVyVHlwZSwgUGFyYW1ldGVyU3RhdGVUeXBlLCBQYXJhbWV0ZXJTdGF0ZVNlbGZUeXBlPiApOiBJT1R5cGUgPT4ge1xuXG4gICAgLy8gVE9ETzogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3RhbmRlbS9pc3N1ZXMvMjU0IHNwZWNpZnkgdGhlIGNvcnJlY3QgdHlwZSBpbnN0ZWFkIG9mIEludGVudGlvbmFsQW55XG4gICAgaWYgKCAhY2FjaGUuaGFzKCBwYXJhbWV0ZXJUeXBlICkgKSB7XG4gICAgICBjYWNoZS5zZXQoIHBhcmFtZXRlclR5cGUsIG5ldyBJT1R5cGU8UGhldGlvR3JvdXA8UGFyYW1ldGVyVHlwZT4sIEludGVudGlvbmFsQW55PiggYFBoZXRpb0dyb3VwSU88JHtwYXJhbWV0ZXJUeXBlLnR5cGVOYW1lfT5gLCB7XG5cbiAgICAgICAgaXNWYWxpZFZhbHVlOiAoIHY6IEludGVudGlvbmFsQW55ICkgPT4ge1xuXG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIGhhbmRsZSBidWlsdCBhbmQgdW5idWlsdCB2ZXJzaW9uc1xuICAgICAgICAgIGNvbnN0IFBoZXRpb0dyb3VwID0gd2luZG93LnBoZXQgPyBwaGV0LnRhbmRlbS5QaGV0aW9Hcm91cCA6IHRhbmRlbU5hbWVzcGFjZS5QaGV0aW9Hcm91cDtcbiAgICAgICAgICByZXR1cm4gdiBpbnN0YW5jZW9mIFBoZXRpb0dyb3VwO1xuICAgICAgICB9LFxuICAgICAgICBkb2N1bWVudGF0aW9uOiAnQW4gYXJyYXkgdGhhdCBzZW5kcyBub3RpZmljYXRpb25zIHdoZW4gaXRzIHZhbHVlcyBoYXZlIGNoYW5nZWQuJyxcblxuICAgICAgICAvLyBUaGlzIGlzIGFsd2F5cyBzcGVjaWZpZWQgYnkgUGhldGlvR3JvdXAsIGFuZCB3aWxsIG5ldmVyIGJlIHRoaXMgdmFsdWUuXG4gICAgICAgIC8vIFNlZSBkb2N1bWVudGF0aW9uIGluIFBoZXRpb0NhcHN1bGVcbiAgICAgICAgbWV0YWRhdGFEZWZhdWx0czogeyBwaGV0aW9EeW5hbWljRWxlbWVudE5hbWU6IG51bGwgfSxcbiAgICAgICAgcGFyYW1ldGVyVHlwZXM6IFsgcGFyYW1ldGVyVHlwZSBdLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGVzIGFuIGVsZW1lbnQgYW5kIGFkZHMgaXQgdG8gdGhlIGdyb3VwXG4gICAgICAgICAqIEB0aHJvd3MgQ291bGROb3RZZXREZXNlcmlhbGl6ZUVycm9yIC0gaWYgaXQgY291bGQgbm90IHlldCBkZXNlcmlhbGl6ZVxuICAgICAgICAgKiAoUGhldGlvU3RhdGVFbmdpbmUpXG4gICAgICAgICAqL1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRoZSBncm91cCBpcyBhIGdyb3VwLCBub3QganVzdCBhIFBoZXRpb0R5bmFtaWNFbGVtZW50Q29udGFpbmVyXG4gICAgICAgIGFkZENoaWxkRWxlbWVudCggZ3JvdXA6IFBoZXRpb0dyb3VwPFBoZXRpb09iamVjdD4sIGNvbXBvbmVudE5hbWU6IHN0cmluZywgc3RhdGVPYmplY3Q6IFBhcmFtZXRlclN0YXRlVHlwZSApOiBQaGV0aW9PYmplY3Qge1xuXG4gICAgICAgICAgLy8gc2hvdWxkIHRocm93IENvdWxkTm90WWV0RGVzZXJpYWxpemVFcnJvciBpZiBpdCBjYW4ndCBiZSBjcmVhdGVkIHlldC4gTGlrZWx5IHRoYXQgd291bGQgYmUgYmVjYXVzZSBhbm90aGVyXG4gICAgICAgICAgLy8gZWxlbWVudCBpbiB0aGUgc3RhdGUgbmVlZHMgdG8gYmUgY3JlYXRlZCBmaXJzdCwgc28gd2Ugd2lsbCB0cnkgYWdhaW4gb24gdGhlIG5leHQgaXRlcmF0aW9uIG9mIHRoZSBzdGF0ZVxuICAgICAgICAgIC8vIHNldHRpbmcgZW5naW5lLlxuICAgICAgICAgIGNvbnN0IGFyZ3MgPSBwYXJhbWV0ZXJUeXBlLnN0YXRlT2JqZWN0VG9DcmVhdGVFbGVtZW50QXJndW1lbnRzKCBzdGF0ZU9iamVjdCApO1xuXG4gICAgICAgICAgY29uc3QgaW5kZXggPSB3aW5kb3cucGhldGlvLlBoZXRpb0lEVXRpbHMuZ2V0R3JvdXBFbGVtZW50SW5kZXgoIGNvbXBvbmVudE5hbWUgKTtcblxuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgYXJncyBpcyBvZiB0eXBlIFAsIGJ1dCB3ZSBjYW4ndCByZWFsbHkgY29tbXVuaWNhdGUgdGhhdCBoZXJlXG4gICAgICAgICAgY29uc3QgZ3JvdXBFbGVtZW50ID0gZ3JvdXAuY3JlYXRlSW5kZXhlZEVsZW1lbnQoIGluZGV4LCBhcmdzLCB0cnVlICk7XG5cbiAgICAgICAgICAvLyBLZWVwIHRoZSBncm91cEVsZW1lbnRJbmRleCBpbiBzeW5jIHNvIHRoYXQgdGhlIG5leHQgaW5kZXggaXMgc2V0IGFwcHJvcHJpYXRlbHkuIFRoaXMgY292ZXJzIHRoZSBjYXNlIHdoZXJlXG4gICAgICAgICAgLy8gbm8gZWxlbWVudHMgaGF2ZSBiZWVuIGNyZWF0ZWQgaW4gdGhlIHNpbSwgaW5zdGVhZCB0aGV5IGhhdmUgb25seSBiZWVuIHNldCB2aWEgc3RhdGUuXG4gICAgICAgICAgZ3JvdXAuZ3JvdXBFbGVtZW50SW5kZXggPSBNYXRoLm1heCggaW5kZXggKyAxLCBncm91cC5ncm91cEVsZW1lbnRJbmRleCApO1xuXG4gICAgICAgICAgcmV0dXJuIGdyb3VwRWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgfSApICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNhY2hlLmdldCggcGFyYW1ldGVyVHlwZSApITtcbiAgfTtcbn1cblxudGFuZGVtTmFtZXNwYWNlLnJlZ2lzdGVyKCAnUGhldGlvR3JvdXAnLCBQaGV0aW9Hcm91cCApO1xuZXhwb3J0IGRlZmF1bHQgUGhldGlvR3JvdXA7Il0sIm5hbWVzIjpbIk51bWJlclByb3BlcnR5IiwiYXJyYXlSZW1vdmUiLCJvcHRpb25pemUiLCJJT1R5cGVDYWNoZSIsImlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkiLCJQaGV0aW9EeW5hbWljRWxlbWVudENvbnRhaW5lciIsInBoZXRpb1N0YXRlU2V0RW1pdHRlciIsIlRhbmRlbSIsInRhbmRlbU5hbWVzcGFjZSIsIklPVHlwZSIsIkRFRkFVTFRfQ09OVEFJTkVSX1NVRkZJWCIsImNhY2hlIiwiUGhldGlvR3JvdXAiLCJkaXNwb3NlIiwiYXNzZXJ0IiwiZGlzcG9zZUVsZW1lbnQiLCJlbGVtZW50IiwiaXNEaXNwb3NlZCIsIl9hcnJheSIsImNvdW50UHJvcGVydHkiLCJ2YWx1ZSIsImxlbmd0aCIsImdldEFycmF5IiwiZ2V0QXJyYXlDb3B5Iiwic2xpY2UiLCJnZXRFbGVtZW50IiwiaW5kZXgiLCJjb3VudCIsImdldExhc3RFbGVtZW50IiwiZmlsdGVyIiwicHJlZGljYXRlIiwiaW5jbHVkZXMiLCJpbmRleE9mIiwiZm9yRWFjaCIsImFjdGlvbiIsImZpbmQiLCJtYXAiLCJmIiwiY2xlYXIiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwicGhldGlvU3RhdGUiLCJyZXNldEluZGV4IiwiZ3JvdXBFbGVtZW50SW5kZXgiLCJncm91cEVsZW1lbnRTdGFydGluZ0luZGV4IiwiY3JlYXRlQ29ycmVzcG9uZGluZ0dyb3VwRWxlbWVudCIsInRhbmRlbU5hbWUiLCJhcmdzRm9yQ3JlYXRlRnVuY3Rpb24iLCJ3aW5kb3ciLCJwaGV0aW8iLCJQaGV0aW9JRFV0aWxzIiwiZ2V0R3JvdXBFbGVtZW50SW5kZXgiLCJjcmVhdGVJbmRleGVkRWxlbWVudCIsImNyZWF0ZU5leHRFbGVtZW50IiwiZnJvbVN0YXRlU2V0dGluZyIsIlZBTElEQVRJT04iLCJpc1BoZXRpb0luc3RydW1lbnRlZCIsInN1cHBvcnRzRHluYW1pY1N0YXRlIiwiXyIsImhhc0luIiwiY29tcG9uZW50TmFtZSIsInBoZXRpb0R5bmFtaWNFbGVtZW50TmFtZSIsIkdST1VQX1NFUEFSQVRPUiIsImNvbnRhaW5lclBhcmFtZXRlclR5cGUiLCJQSEVUX0lPX0VOQUJMRUQiLCJwaGV0aW9UeXBlIiwicGFyYW1ldGVyVHlwZXMiLCJncm91cEVsZW1lbnQiLCJjcmVhdGVEeW5hbWljRWxlbWVudCIsInB1c2giLCJub3RpZnlFbGVtZW50Q3JlYXRlZCIsImNyZWF0ZUVsZW1lbnQiLCJkZWZhdWx0QXJndW1lbnRzIiwiY29udGFpbmVyU3VmZml4IiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInBoZXRpb1JlYWRPbmx5IiwicGhldGlvRmVhdHVyZWQiLCJudW1iZXJUeXBlIiwibGluayIsInBoZXRpb0lEIiwiYWRkTGlzdGVuZXIiLCJzdGF0ZSIsIlBoZXRpb0dyb3VwSU8iLCJwYXJhbWV0ZXJUeXBlIiwiaGFzIiwic2V0IiwidHlwZU5hbWUiLCJpc1ZhbGlkVmFsdWUiLCJ2IiwicGhldCIsImRvY3VtZW50YXRpb24iLCJtZXRhZGF0YURlZmF1bHRzIiwiYWRkQ2hpbGRFbGVtZW50IiwiZ3JvdXAiLCJzdGF0ZU9iamVjdCIsImFyZ3MiLCJzdGF0ZU9iamVjdFRvQ3JlYXRlRWxlbWVudEFyZ3VtZW50cyIsIk1hdGgiLCJtYXgiLCJnZXQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUVELE9BQU9BLG9CQUFvQixrQ0FBa0M7QUFDN0QsT0FBT0MsaUJBQWlCLG9DQUFvQztBQUM1RCxPQUFPQyxlQUFlLGtDQUFrQztBQUV4RCxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBQzNDLE9BQU9DLGtDQUFrQyxvQ0FBb0M7QUFDN0UsT0FBT0MsbUNBQTJGLHFDQUFxQztBQUV2SSxPQUFPQywyQkFBMkIsNkJBQTZCO0FBQy9ELE9BQU9DLFlBQVksY0FBYztBQUNqQyxPQUFPQyxxQkFBcUIsdUJBQXVCO0FBQ25ELE9BQU9DLFlBQVksb0JBQW9CO0FBRXZDLFlBQVk7QUFDWixNQUFNQywyQkFBMkI7QUFhakMsbUVBQW1FO0FBQ25FLE1BQU1DLFFBQVEsSUFBSVI7QUFFbEIsSUFBQSxBQUFNUyxjQUFOLE1BQU1BLG9CQUE2RVA7SUE2RGpGO0dBQ0MsR0FDRCxBQUFnQlEsVUFBZ0I7UUFDOUJDLFVBQVVBLE9BQVEsT0FBTztJQUMzQjtJQUVBOzs7Ozs7Ozs7R0FTQyxHQUNELEFBQWdCQyxlQUFnQkMsT0FBVSxFQUFTO1FBQ2pERixVQUFVQSxPQUFRLENBQUNFLFFBQVFDLFVBQVUsRUFBRTtRQUN2Q2hCLFlBQWEsSUFBSSxDQUFDaUIsTUFBTSxFQUFFRjtRQUUxQixJQUFJLENBQUNHLGFBQWEs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