// Copyright 2019-2024, University of Colorado Boulder
/**
 * Supertype for containers that hold dynamic elements that are PhET-iO instrumented. This type handles common
 * features like creating the archetype for the PhET-iO API, and managing created/disposed data stream events.
 *
 * "Dynamic" is an overloaded term, so allow me to explain what it means in the context of this type. A "dynamic element"
 * is an instrumented PhET-iO Element that is conditionally in the PhET-iO API. Most commonly this is because elements
 * can be created and destroyed during the runtime of the sim. Another "dynamic element" for the PhET-iO project is when
 * an element may or may not be created based on a query parameter. In this case, even if the object then exists for the
 * lifetime of the sim, we may still call this "dynamic" as it pertains to this type, and the PhET-iO API.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import Emitter from '../../axon/js/Emitter.js';
import validate from '../../axon/js/validate.js';
import arrayRemove from '../../phet-core/js/arrayRemove.js';
import merge from '../../phet-core/js/merge.js';
import optionize from '../../phet-core/js/optionize.js';
import DynamicTandem from './DynamicTandem.js';
import isClearingPhetioDynamicElementsProperty from './isClearingPhetioDynamicElementsProperty.js';
import isSettingPhetioStateProperty from './isSettingPhetioStateProperty.js';
import PhetioObject from './PhetioObject.js';
import Tandem, { DYNAMIC_ARCHETYPE_NAME } from './Tandem.js';
import tandemNamespace from './tandemNamespace.js';
import StringIO from './types/StringIO.js';
// constants
const DEFAULT_CONTAINER_SUFFIX = 'Container';
function archetypeCast(archetype) {
    if (archetype === null) {
        throw new Error('archetype should exist');
    }
    return archetype;
}
let PhetioDynamicElementContainer = class PhetioDynamicElementContainer extends PhetioObject {
    /**
   * @returns true if all children of a single dynamic element (based on phetioID) have had their state set already.
   */ stateSetOnAllChildrenOfDynamicElement(dynamicElementID, stillToSetIDs) {
        for(let i = 0; i < stillToSetIDs.length; i++){
            if (phetio.PhetioIDUtils.isAncestor(dynamicElementID, stillToSetIDs[i])) {
                return false;
            }
        }
        return true; // No elements in state that aren't in the completed list
    }
    /**
   * Archetypes are created to generate the baseline file, or to validate against an existing baseline file.  They are
   * PhetioObjects and registered with the phetioEngine, but not send out via notifications from PhetioEngine.phetioElementAddedEmitter(),
   * because they are intended for internal usage only.  Archetypes should not be created in production code.
   *
   * PhetioDynamicElementContainer calls this method internally to create and assign its own archetype, but this method
   * can additionally be called with alternate archetypeTandem and/or createElementArgs to create alternate archetypes.
   * This can be necessary in situations that require archetypes provided to other archetypes, or with other forms
   * of dependency injection, such as in https://github.com/phetsims/tandem/issues/312
   */ createArchetype(archetypeTandem = this.tandem.createTandem(DYNAMIC_ARCHETYPE_NAME), createElementArgs = this.defaultArguments) {
        // Once the sim has started, any archetypes being created are likely done so because they are nested PhetioGroups.
        if (_.hasIn(window, 'phet.joist.sim') && phet.joist.sim.isConstructionCompleteProperty.value) {
            assert && assert(false, 'nested DynamicElementContainers are not currently supported');
            return null;
        }
        // When generating the baseline, output the schema for the archetype
        if (Tandem.PHET_IO_ENABLED && phet.preloads.phetio.createArchetypes) {
            const archetypeArgs = Array.isArray(createElementArgs) ? createElementArgs : createElementArgs();
            // The create function takes a tandem plus the default args
            assert && assert(this.createElement.length === archetypeArgs.length + 1, 'mismatched number of arguments');
            const archetype = this.createElement(archetypeTandem, ...archetypeArgs);
            // Mark the archetype for inclusion in the baseline schema
            if (this.isPhetioInstrumented()) {
                archetype.markDynamicElementArchetype();
            }
            return archetype;
        } else {
            return null;
        }
    }
    /**
   * Create a dynamic PhetioObject element for this container
   * @param componentName
   * @param argsForCreateFunction
   * @param containerParameterType - null in PhET brand
   */ createDynamicElement(componentName, argsForCreateFunction, containerParameterType) {
        assert && assert(Array.isArray(argsForCreateFunction), 'should be array');
        // create with default state and substructure, details will need to be set by setter methods.
        let createdObjectTandem;
        if (!this.tandem.hasChild(componentName)) {
            createdObjectTandem = new DynamicTandem(this.tandem, componentName, this.tandem.getExtendedOptions());
        } else {
            createdObjectTandem = this.tandem.createTandem(componentName, this.tandem.getExtendedOptions());
            assert && assert(createdObjectTandem instanceof DynamicTandem, 'createdObjectTandem should be an instance of DynamicTandem'); // eslint-disable-line phet/no-simple-type-checking-assertions
        }
        const createdObject = this.createElement(createdObjectTandem, ...argsForCreateFunction);
        // This validation is only needed for PhET-iO brand
        if (Tandem.PHET_IO_ENABLED) {
            assert && assert(containerParameterType !== null, 'containerParameterType must be provided in PhET-iO brand');
            // Make sure the new group element matches the schema for elements.
            validate(createdObject, containerParameterType.validator);
            assert && assert(createdObject.phetioType.extends(containerParameterType), 'dynamic element container expected its created instance\'s phetioType to match its parameterType.');
        }
        assert && this.assertDynamicPhetioObject(createdObject);
        return createdObject;
    }
    /**
   * A dynamic element should be an instrumented PhetioObject with phetioDynamicElement: true
   */ assertDynamicPhetioObject(phetioObject) {
        if (Tandem.PHET_IO_ENABLED && Tandem.VALIDATION) {
            assert && assert(phetioObject.isPhetioInstrumented(), 'instance should be instrumented');
            assert && assert(phetioObject.phetioDynamicElement, 'instance should be marked as phetioDynamicElement:true');
        }
    }
    /**
   * Emit a created or disposed event.
   */ emitDataStreamEvent(dynamicElement, eventName, additionalData) {
        this.phetioStartEvent(eventName, {
            data: merge({
                phetioID: dynamicElement.tandem.phetioID
            }, additionalData)
        });
        this.phetioEndEvent();
    }
    /**
   * Emit events when dynamic elements are created.
   */ createdEventListener(dynamicElement) {
        const additionalData = dynamicElement.phetioState ? {
            state: this.phetioType.parameterTypes[0].toStateObject(dynamicElement)
        } : null;
        this.emitDataStreamEvent(dynamicElement, 'created', additionalData);
    }
    /**
   * Emit events when dynamic elements are disposed.
   */ disposedEventListener(dynamicElement) {
        this.emitDataStreamEvent(dynamicElement, 'disposed');
    }
    dispose() {
        // If hitting this assertion because of nested dynamic element containers, please discuss with a phet-io team member.
        assert && assert(false, 'PhetioDynamicElementContainers are not intended for disposal');
    }
    /**
   * Dispose a contained element
   */ disposeElement(element) {
        element.dispose();
        assert && this.supportsDynamicState && _.hasIn(window, 'phet.joist.sim') && assert(// We do not want to be disposing dynamic elements when state setting EXCEPT when we are clearing all dynamic
        // elements (which is ok and expected to do at the beginning of setting state).
        !(isSettingPhetioStateProperty.value && !isClearingPhetioDynamicElementsProperty), 'should not dispose a dynamic element while setting phet-io state');
        if (this.notificationsDeferred) {
            this.deferredDisposals.push(element);
        } else {
            this.elementDisposedEmitter.emit(element, element.tandem.phetioID);
        }
    }
    /**
   * Flush a single element from the list of deferred disposals that have not yet notified about the disposal. This
   * should never be called publicly, instead see `disposeElement`
   */ notifyElementDisposedWhileDeferred(disposedElement) {
        assert && assert(this.notificationsDeferred, 'should only be called when notifications are deferred');
        assert && assert(this.deferredDisposals.includes(disposedElement), 'disposedElement should not have been already notified');
        this.elementDisposedEmitter.emit(disposedElement, disposedElement.tandem.phetioID);
        arrayRemove(this.deferredDisposals, disposedElement);
    }
    /**
   * Should be called by subtypes upon element creation, see PhetioGroup as an example.
   */ notifyElementCreated(createdElement) {
        if (this.notificationsDeferred) {
            this.deferredCreations.push(createdElement);
        } else {
            this.elementCreatedEmitter.emit(createdElement, createdElement.tandem.phetioID);
        }
    }
    /**
   * Flush a single element from the list of deferred creations that have not yet notified about the disposal. This
   * is only public to support specific order dependencies in the PhetioStateEngine, otherwise see `this.notifyElementCreated()`
   * (PhetioGroupTests, phet-io) - only the PhetioStateEngine should notify individual elements created.
   */ notifyElementCreatedWhileDeferred(createdElement) {
        assert && assert(this.notificationsDeferred, 'should only be called when notifications are deferred');
        assert && assert(this.deferredCreations.includes(createdElement), 'createdElement should not have been already notified');
        this.elementCreatedEmitter.emit(createdElement, createdElement.tandem.phetioID);
        arrayRemove(this.deferredCreations, createdElement);
    }
    /**
   * When set to true, creation and disposal notifications will be deferred until set to false. When set to false,
   * this function will flush all the notifications for created and disposed elements (in that order) that occurred
   * while this container was deferring its notifications.
   */ setNotificationsDeferred(notificationsDeferred) {
        assert && assert(notificationsDeferred !== this.notificationsDeferred, 'should not be the same as current value');
        // Flush all notifications when setting to be no longer deferred
        if (!notificationsDeferred) {
            while(this.deferredCreations.length > 0){
                this.notifyElementCreatedWhileDeferred(this.deferredCreations[0]);
            }
            while(this.deferredDisposals.length > 0){
                this.notifyElementDisposedWhileDeferred(this.deferredDisposals[0]);
            }
        }
        assert && assert(this.deferredCreations.length === 0, 'creations should be clear');
        assert && assert(this.deferredDisposals.length === 0, 'disposals should be clear');
        this.notificationsDeferred = notificationsDeferred;
    }
    /**
   * @throws error if trying to access when archetypes aren't being created.
   */ get archetype() {
        return archetypeCast(this._archetype);
    }
    /**
   * Add the phetioDynamicElementName for API tracking
   */ getMetadata(object) {
        const metadata = super.getMetadata(object);
        assert && assert(!metadata.hasOwnProperty('phetioDynamicElementName'), 'PhetioDynamicElementContainer sets the phetioDynamicElementName metadata key');
        return merge({
            phetioDynamicElementName: this.phetioDynamicElementName
        }, metadata);
    }
    /**
   * @param createElement - function that creates a dynamic readonly element to be housed in
   * this container. All of this dynamic element container's elements will be created from this function, including the
   * archetype.
   * @param defaultArguments - arguments passed to createElement when creating the archetype
   * @param [providedOptions] - describe the Group itself
   */ constructor(createElement, defaultArguments, providedOptions){
        var _options_tandem;
        const options = optionize()({
            phetioState: false,
            // Many PhET-iO instrumented types live in common code used by multiple sims, and may only be instrumented in a subset of their usages.
            supportsDynamicState: true,
            containerSuffix: DEFAULT_CONTAINER_SUFFIX,
            // TODO: https://github.com/phetsims/tandem/issues/254
            // @ts-expect-error - this is filled in below
            phetioDynamicElementName: undefined
        }, providedOptions);
        assert && assert(Array.isArray(defaultArguments) || typeof defaultArguments === 'function', 'defaultArguments should be an array or a function');
        if (Array.isArray(defaultArguments)) {
            // createElement expects a Tandem as the first arg
            assert && assert(createElement.length === defaultArguments.length + 1, 'mismatched number of arguments');
        }
        assert && Tandem.VALIDATION && assert(!!options.phetioType, 'phetioType must be supplied');
        assert && Tandem.VALIDATION && assert(Array.isArray(options.phetioType.parameterTypes), 'phetioType must supply its parameter types');
        assert && Tandem.VALIDATION && assert(options.phetioType.parameterTypes.length === 1, 'PhetioDynamicElementContainer\'s phetioType must have exactly one parameter type');
        assert && Tandem.VALIDATION && assert(!!options.phetioType.parameterTypes[0], 'PhetioDynamicElementContainer\'s phetioType\'s parameterType must be truthy');
        if (assert && ((_options_tandem = options.tandem) == null ? void 0 : _options_tandem.supplied)) {
            assert && Tandem.VALIDATION && assert(options.tandem.name.endsWith(options.containerSuffix), 'PhetioDynamicElementContainer tandems should end with options.containerSuffix');
        }
        // options that depend on other options for their default
        if (options.tandem && !options.phetioDynamicElementName) {
            options.phetioDynamicElementName = options.tandem.name.slice(0, options.tandem.name.length - options.containerSuffix.length);
        }
        super(options);
        this.supportsDynamicState = options.supportsDynamicState;
        this.phetioDynamicElementName = options.phetioDynamicElementName;
        this.createElement = createElement;
        this.defaultArguments = defaultArguments;
        // Can be used as an argument to create other archetypes, but otherwise
        // access should not be needed. This will only be non-null when generating the PhET-iO API, see createArchetype().
        this._archetype = this.createArchetype();
        // subtypes expected to fire this according to individual implementations
        this.elementCreatedEmitter = new Emitter({
            parameters: [
                {
                    valueType: PhetioObject,
                    phetioType: options.phetioType.parameterTypes[0],
                    name: 'element'
                },
                {
                    name: 'phetioID',
                    phetioType: StringIO
                }
            ],
            tandem: options.tandem.createTandem('elementCreatedEmitter'),
            phetioDocumentation: 'Emitter that fires whenever a new dynamic element is added to the container.'
        });
        // called on disposal of an element
        this.elementDisposedEmitter = new Emitter({
            parameters: [
                {
                    valueType: PhetioObject,
                    phetioType: options.phetioType.parameterTypes[0],
                    name: 'element'
                },
                {
                    name: 'phetioID',
                    phetioType: StringIO
                }
            ],
            tandem: options.tandem.createTandem('elementDisposedEmitter'),
            phetioDocumentation: 'Emitter that fires whenever a dynamic element is removed from the container.'
        });
        // Emit to the data stream on element creation/disposal, no need to do this in PhET brand
        if (Tandem.PHET_IO_ENABLED) {
            this.elementCreatedEmitter.addListener((element)=>this.createdEventListener(element));
            this.elementDisposedEmitter.addListener((element)=>this.disposedEventListener(element));
        }
        // a way to delay creation notifications to a later time, for phet-io state engine support
        this.notificationsDeferred = false;
        // lists to keep track of the created and disposed elements when notifications are deferred.
        // These are used to then flush notifications when they are set to no longer be deferred.
        this.deferredCreations = [];
        this.deferredDisposals = [];
        // provide a way to opt out of containers clearing dynamic state, useful if group elements exist for the lifetime of
        // the sim, see https://github.com/phetsims/tandem/issues/132
        if (Tandem.PHET_IO_ENABLED && this.supportsDynamicState && // don't clear archetypes because they are static.
        !this.phetioIsArchetype) {
            assert && assert(_.hasIn(window, 'phet.phetio.phetioEngine.phetioStateEngine'), 'PhetioDynamicElementContainers must be created once phetioEngine has been constructed');
            const phetioStateEngine = phet.phetio.phetioEngine.phetioStateEngine;
            // On state start, clear out the container and set to defer notifications.
            phetioStateEngine.clearDynamicElementsEmitter.addListener((state, scopeTandem)=>{
                // Only clear if this PhetioDynamicElementContainer is in scope of the state to be set
                if (this.tandem.hasAncestor(scopeTandem)) {
                    this.clear({
                        phetioState: state
                    });
                    this.setNotificationsDeferred(true);
                }
            });
            // done with state setting
            phetioStateEngine.undeferEmitter.addListener(()=>{
                if (this.notificationsDeferred) {
                    this.setNotificationsDeferred(false);
                }
            });
            phetioStateEngine.addSetStateHelper((state, stillToSetIDs)=>{
                let creationNotified = false;
                let iterationCount = 0;
                while(this.deferredCreations.length > 0){
                    if (iterationCount > 200) {
                        throw new Error('Too many iterations in deferred creations, stillToSetIDs = ' + stillToSetIDs.join(', '));
                    }
                    const deferredCreatedElement = this.deferredCreations[0];
                    if (this.stateSetOnAllChildrenOfDynamicElement(deferredCreatedElement.tandem.phetioID, stillToSetIDs)) {
                        this.notifyElementCreatedWhileDeferred(deferredCreatedElement);
                        creationNotified = true;
                    }
                    iterationCount++;
                }
                return creationNotified;
            });
        }
    }
};
tandemNamespace.register('PhetioDynamicElementContainer', PhetioDynamicElementContainer);
export default PhetioDynamicElementContainer;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9EeW5hbWljRWxlbWVudENvbnRhaW5lci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBTdXBlcnR5cGUgZm9yIGNvbnRhaW5lcnMgdGhhdCBob2xkIGR5bmFtaWMgZWxlbWVudHMgdGhhdCBhcmUgUGhFVC1pTyBpbnN0cnVtZW50ZWQuIFRoaXMgdHlwZSBoYW5kbGVzIGNvbW1vblxuICogZmVhdHVyZXMgbGlrZSBjcmVhdGluZyB0aGUgYXJjaGV0eXBlIGZvciB0aGUgUGhFVC1pTyBBUEksIGFuZCBtYW5hZ2luZyBjcmVhdGVkL2Rpc3Bvc2VkIGRhdGEgc3RyZWFtIGV2ZW50cy5cbiAqXG4gKiBcIkR5bmFtaWNcIiBpcyBhbiBvdmVybG9hZGVkIHRlcm0sIHNvIGFsbG93IG1lIHRvIGV4cGxhaW4gd2hhdCBpdCBtZWFucyBpbiB0aGUgY29udGV4dCBvZiB0aGlzIHR5cGUuIEEgXCJkeW5hbWljIGVsZW1lbnRcIlxuICogaXMgYW4gaW5zdHJ1bWVudGVkIFBoRVQtaU8gRWxlbWVudCB0aGF0IGlzIGNvbmRpdGlvbmFsbHkgaW4gdGhlIFBoRVQtaU8gQVBJLiBNb3N0IGNvbW1vbmx5IHRoaXMgaXMgYmVjYXVzZSBlbGVtZW50c1xuICogY2FuIGJlIGNyZWF0ZWQgYW5kIGRlc3Ryb3llZCBkdXJpbmcgdGhlIHJ1bnRpbWUgb2YgdGhlIHNpbS4gQW5vdGhlciBcImR5bmFtaWMgZWxlbWVudFwiIGZvciB0aGUgUGhFVC1pTyBwcm9qZWN0IGlzIHdoZW5cbiAqIGFuIGVsZW1lbnQgbWF5IG9yIG1heSBub3QgYmUgY3JlYXRlZCBiYXNlZCBvbiBhIHF1ZXJ5IHBhcmFtZXRlci4gSW4gdGhpcyBjYXNlLCBldmVuIGlmIHRoZSBvYmplY3QgdGhlbiBleGlzdHMgZm9yIHRoZVxuICogbGlmZXRpbWUgb2YgdGhlIHNpbSwgd2UgbWF5IHN0aWxsIGNhbGwgdGhpcyBcImR5bmFtaWNcIiBhcyBpdCBwZXJ0YWlucyB0byB0aGlzIHR5cGUsIGFuZCB0aGUgUGhFVC1pTyBBUEkuXG4gKlxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XG5pbXBvcnQgdmFsaWRhdGUgZnJvbSAnLi4vLi4vYXhvbi9qcy92YWxpZGF0ZS5qcyc7XG5pbXBvcnQgYXJyYXlSZW1vdmUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2FycmF5UmVtb3ZlLmpzJztcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCBEeW5hbWljVGFuZGVtIGZyb20gJy4vRHluYW1pY1RhbmRlbS5qcyc7XG5pbXBvcnQgaXNDbGVhcmluZ1BoZXRpb0R5bmFtaWNFbGVtZW50c1Byb3BlcnR5IGZyb20gJy4vaXNDbGVhcmluZ1BoZXRpb0R5bmFtaWNFbGVtZW50c1Byb3BlcnR5LmpzJztcbmltcG9ydCBpc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5IGZyb20gJy4vaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgeyBQaGV0aW9FbGVtZW50TWV0YWRhdGEsIFBoZXRpb1N0YXRlIH0gZnJvbSAnLi9waGV0LWlvLXR5cGVzLmpzJztcbmltcG9ydCBQaGV0aW9PYmplY3QsIHsgUGhldGlvT2JqZWN0TWV0YWRhdGFJbnB1dCwgUGhldGlvT2JqZWN0T3B0aW9ucyB9IGZyb20gJy4vUGhldGlvT2JqZWN0LmpzJztcbmltcG9ydCBUYW5kZW0sIHsgRFlOQU1JQ19BUkNIRVRZUEVfTkFNRSB9IGZyb20gJy4vVGFuZGVtLmpzJztcbmltcG9ydCB0YW5kZW1OYW1lc3BhY2UgZnJvbSAnLi90YW5kZW1OYW1lc3BhY2UuanMnO1xuaW1wb3J0IElPVHlwZSBmcm9tICcuL3R5cGVzL0lPVHlwZS5qcyc7XG5pbXBvcnQgU3RyaW5nSU8gZnJvbSAnLi90eXBlcy9TdHJpbmdJTy5qcyc7XG5cbmV4cG9ydCB0eXBlIENsZWFyT3B0aW9ucyA9IHtcbiAgcGhldGlvU3RhdGU/OiBQaGV0aW9TdGF0ZSB8IG51bGw7XG59O1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IERFRkFVTFRfQ09OVEFJTkVSX1NVRkZJWCA9ICdDb250YWluZXInO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuXG4gIC8vIEJ5IGRlZmF1bHQsIGEgUGhldGlvRHluYW1pY0VsZW1lbnRDb250YWluZXIncyBlbGVtZW50cyBhcmUgaW5jbHVkZWQgaW4gc3RhdGUgc3VjaCB0aGF0IG9uIGV2ZXJ5IHNldFN0YXRlIGNhbGwsXG4gIC8vIHRoZSBlbGVtZW50cyBhcmUgY2xlYXJlZCBvdXQgYnkgdGhlIHBoZXRpb1N0YXRlRW5naW5lIHNvIGVsZW1lbnRzIGluIHRoZSBzdGF0ZSBjYW4gYmUgYWRkZWQgdG8gdGhlIGVtcHR5IGdyb3VwLlxuICAvLyBUaGlzIG9wdGlvbiBpcyBmb3Igb3B0aW5nIG91dCBvZiB0aGF0IGJlaGF2aW9yLiBXaGVuIGZhbHNlLCB0aGlzIGNvbnRhaW5lciB3aWxsIG5vdCBoYXZlIGl0cyBlbGVtZW50cyBjbGVhcmVkXG4gIC8vIHdoZW4gYmVnaW5uaW5nIHRvIHNldCBQaEVULWlPIHN0YXRlLiBGdXJ0aGVybW9yZSwgdmlldyBlbGVtZW50cyBmb2xsb3dpbmcgdGhlIFwib25seSB0aGUgbW9kZWxzIGFyZSBzdGF0ZWZ1bFwiXG4gIC8vIHBhdHRlcm4gbXVzdCBtYXJrIHRoaXMgYXMgZmFsc2UsIG90aGVyd2lzZSB0aGUgc3RhdGUgZW5naW5lIHdpbGwgdHJ5IHRvIGNyZWF0ZSB0aGVzZSBlbGVtZW50cyBpbnN0ZWFkIG9mIGxldHRpbmdcbiAgLy8gdGhlIG1vZGVsIG5vdGlmaWNhdGlvbnMgaGFuZGxlIHRoaXMuXG4gIHN1cHBvcnRzRHluYW1pY1N0YXRlPzogYm9vbGVhbjtcblxuICAvLyBUaGUgY29udGFpbmVyJ3MgdGFuZGVtIG5hbWUgbXVzdCBoYXZlIHRoaXMgc3VmZml4LCBhbmQgdGhlIGJhc2UgdGFuZGVtIG5hbWUgZm9yIGVsZW1lbnRzIGluXG4gIC8vIHRoZSBjb250YWluZXIgd2lsbCBjb25zaXN0IG9mIHRoZSBncm91cCdzIHRhbmRlbSBuYW1lIHdpdGggdGhpcyBzdWZmaXggc3RyaXBwZWQgb2ZmLlxuICBjb250YWluZXJTdWZmaXg/OiBzdHJpbmc7XG5cbiAgLy8gdGFuZGVtIG5hbWUgZm9yIGVsZW1lbnRzIGluIHRoZSBjb250YWluZXIgaXMgdGhlIGNvbnRhaW5lcidzIHRhbmRlbSBuYW1lIHdpdGhvdXQgY29udGFpbmVyU3VmZml4XG4gIHBoZXRpb0R5bmFtaWNFbGVtZW50TmFtZT86IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFBoZXRpb0R5bmFtaWNFbGVtZW50Q29udGFpbmVyT3B0aW9ucyA9XG4gIFNlbGZPcHRpb25zXG4gICYgU3RyaWN0T21pdDxQaGV0aW9PYmplY3RPcHRpb25zLCAncGhldGlvRHluYW1pY0VsZW1lbnQnPlxuICAmIFBpY2tSZXF1aXJlZDxQaGV0aW9PYmplY3RPcHRpb25zLCAncGhldGlvVHlwZSc+O1xuXG5mdW5jdGlvbiBhcmNoZXR5cGVDYXN0PFQ+KCBhcmNoZXR5cGU6IFQgfCBudWxsICk6IFQge1xuICBpZiAoIGFyY2hldHlwZSA9PT0gbnVsbCApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoICdhcmNoZXR5cGUgc2hvdWxkIGV4aXN0JyApO1xuICB9XG4gIHJldHVybiBhcmNoZXR5cGU7XG59XG5cbmFic3RyYWN0IGNsYXNzIFBoZXRpb0R5bmFtaWNFbGVtZW50Q29udGFpbmVyPFQgZXh0ZW5kcyBQaGV0aW9PYmplY3QsIENyZWF0ZUVsZW1lbnRBcmd1bWVudHMgZXh0ZW5kcyBJbnRlbnRpb25hbEFueVtdID0gW10+IGV4dGVuZHMgUGhldGlvT2JqZWN0IHtcbiAgcHJpdmF0ZSByZWFkb25seSBfYXJjaGV0eXBlOiBUIHwgbnVsbDtcbiAgcHVibGljIHJlYWRvbmx5IGVsZW1lbnRDcmVhdGVkRW1pdHRlcjogVEVtaXR0ZXI8WyBULCBzdHJpbmcgXT47XG4gIHB1YmxpYyByZWFkb25seSBlbGVtZW50RGlzcG9zZWRFbWl0dGVyOiBURW1pdHRlcjxbIFQsIHN0cmluZyBdPjtcbiAgcHJpdmF0ZSBub3RpZmljYXRpb25zRGVmZXJyZWQ6IGJvb2xlYW47XG4gIHByaXZhdGUgcmVhZG9ubHkgZGVmZXJyZWRDcmVhdGlvbnM6IFRbXTtcbiAgcHJpdmF0ZSByZWFkb25seSBkZWZlcnJlZERpc3Bvc2FsczogVFtdO1xuICBwdWJsaWMgcmVhZG9ubHkgc3VwcG9ydHNEeW5hbWljU3RhdGU6IGJvb2xlYW47IC8vIChwaGV0LWlvIGludGVybmFsKVxuICBwcm90ZWN0ZWQgcGhldGlvRHluYW1pY0VsZW1lbnROYW1lOiBzdHJpbmc7XG4gIHByb3RlY3RlZCBjcmVhdGVFbGVtZW50OiAoIHQ6IFRhbmRlbSwgLi4uYXJnczogQ3JlYXRlRWxlbWVudEFyZ3VtZW50cyApID0+IFQ7XG5cbiAgLy8gQXJndW1lbnRzIHBhc3NlZCB0byB0aGUgYXJjaGV0eXBlIHdoZW4gY3JlYXRpbmcgaXQuXG4gIHByb3RlY3RlZCBkZWZhdWx0QXJndW1lbnRzOiBDcmVhdGVFbGVtZW50QXJndW1lbnRzIHwgKCAoKSA9PiBDcmVhdGVFbGVtZW50QXJndW1lbnRzICk7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBjcmVhdGVFbGVtZW50IC0gZnVuY3Rpb24gdGhhdCBjcmVhdGVzIGEgZHluYW1pYyByZWFkb25seSBlbGVtZW50IHRvIGJlIGhvdXNlZCBpblxuICAgKiB0aGlzIGNvbnRhaW5lci4gQWxsIG9mIHRoaXMgZHluYW1pYyBlbGVtZW50IGNvbnRhaW5lcidzIGVsZW1lbnRzIHdpbGwgYmUgY3JlYXRlZCBmcm9tIHRoaXMgZnVuY3Rpb24sIGluY2x1ZGluZyB0aGVcbiAgICogYXJjaGV0eXBlLlxuICAgKiBAcGFyYW0gZGVmYXVsdEFyZ3VtZW50cyAtIGFyZ3VtZW50cyBwYXNzZWQgdG8gY3JlYXRlRWxlbWVudCB3aGVuIGNyZWF0aW5nIHRoZSBhcmNoZXR5cGVcbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdIC0gZGVzY3JpYmUgdGhlIEdyb3VwIGl0c2VsZlxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjcmVhdGVFbGVtZW50OiAoIHQ6IFRhbmRlbSwgLi4uYXJnczogQ3JlYXRlRWxlbWVudEFyZ3VtZW50cyApID0+IFQsIGRlZmF1bHRBcmd1bWVudHM6IENyZWF0ZUVsZW1lbnRBcmd1bWVudHMgfCAoICgpID0+IENyZWF0ZUVsZW1lbnRBcmd1bWVudHMgKSwgcHJvdmlkZWRPcHRpb25zPzogUGhldGlvRHluYW1pY0VsZW1lbnRDb250YWluZXJPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxQaGV0aW9EeW5hbWljRWxlbWVudENvbnRhaW5lck9wdGlvbnMsIFNlbGZPcHRpb25zLCBQaGV0aW9PYmplY3RPcHRpb25zPigpKCB7XG4gICAgICBwaGV0aW9TdGF0ZTogZmFsc2UsIC8vIGVsZW1lbnRzIGFyZSBpbmNsdWRlZCBpbiBzdGF0ZSwgYnV0IHRoZSBjb250YWluZXIgd2lsbCBleGlzdCBpbiB0aGUgZG93bnN0cmVhbSBzaW0uXG5cbiAgICAgIC8vIE1hbnkgUGhFVC1pTyBpbnN0cnVtZW50ZWQgdHlwZXMgbGl2ZSBpbiBjb21tb24gY29kZSB1c2VkIGJ5IG11bHRpcGxlIHNpbXMsIGFuZCBtYXkgb25seSBiZSBpbnN0cnVtZW50ZWQgaW4gYSBzdWJzZXQgb2YgdGhlaXIgdXNhZ2VzLlxuICAgICAgc3VwcG9ydHNEeW5hbWljU3RhdGU6IHRydWUsXG4gICAgICBjb250YWluZXJTdWZmaXg6IERFRkFVTFRfQ09OVEFJTkVSX1NVRkZJWCxcblxuICAgICAgLy8gVE9ETzogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3RhbmRlbS9pc3N1ZXMvMjU0XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gdGhpcyBpcyBmaWxsZWQgaW4gYmVsb3dcbiAgICAgIHBoZXRpb0R5bmFtaWNFbGVtZW50TmFtZTogdW5kZWZpbmVkXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBkZWZhdWx0QXJndW1lbnRzICkgfHwgdHlwZW9mIGRlZmF1bHRBcmd1bWVudHMgPT09ICdmdW5jdGlvbicsICdkZWZhdWx0QXJndW1lbnRzIHNob3VsZCBiZSBhbiBhcnJheSBvciBhIGZ1bmN0aW9uJyApO1xuICAgIGlmICggQXJyYXkuaXNBcnJheSggZGVmYXVsdEFyZ3VtZW50cyApICkge1xuXG4gICAgICAvLyBjcmVhdGVFbGVtZW50IGV4cGVjdHMgYSBUYW5kZW0gYXMgdGhlIGZpcnN0IGFyZ1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggY3JlYXRlRWxlbWVudC5sZW5ndGggPT09IGRlZmF1bHRBcmd1bWVudHMubGVuZ3RoICsgMSwgJ21pc21hdGNoZWQgbnVtYmVyIG9mIGFyZ3VtZW50cycgKTtcbiAgICB9XG5cbiAgICBhc3NlcnQgJiYgVGFuZGVtLlZBTElEQVRJT04gJiYgYXNzZXJ0KCAhIW9wdGlvbnMucGhldGlvVHlwZSwgJ3BoZXRpb1R5cGUgbXVzdCBiZSBzdXBwbGllZCcgKTtcbiAgICBhc3NlcnQgJiYgVGFuZGVtLlZBTElEQVRJT04gJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBvcHRpb25zLnBoZXRpb1R5cGUucGFyYW1ldGVyVHlwZXMgKSxcbiAgICAgICdwaGV0aW9UeXBlIG11c3Qgc3VwcGx5IGl0cyBwYXJhbWV0ZXIgdHlwZXMnICk7XG4gICAgYXNzZXJ0ICYmIFRhbmRlbS5WQUxJREFUSU9OICYmIGFzc2VydCggb3B0aW9ucy5waGV0aW9UeXBlLnBhcmFtZXRlclR5cGVzIS5sZW5ndGggPT09IDEsXG4gICAgICAnUGhldGlvRHluYW1pY0VsZW1lbnRDb250YWluZXJcXCdzIHBoZXRpb1R5cGUgbXVzdCBoYXZlIGV4YWN0bHkgb25lIHBhcmFtZXRlciB0eXBlJyApO1xuICAgIGFzc2VydCAmJiBUYW5kZW0uVkFMSURBVElPTiAmJiBhc3NlcnQoICEhb3B0aW9ucy5waGV0aW9UeXBlLnBhcmFtZXRlclR5cGVzIVsgMCBdLFxuICAgICAgJ1BoZXRpb0R5bmFtaWNFbGVtZW50Q29udGFpbmVyXFwncyBwaGV0aW9UeXBlXFwncyBwYXJhbWV0ZXJUeXBlIG11c3QgYmUgdHJ1dGh5JyApO1xuICAgIGlmICggYXNzZXJ0ICYmIG9wdGlvbnMudGFuZGVtPy5zdXBwbGllZCApIHtcbiAgICAgIGFzc2VydCAmJiBUYW5kZW0uVkFMSURBVElPTiAmJiBhc3NlcnQoIG9wdGlvbnMudGFuZGVtLm5hbWUuZW5kc1dpdGgoIG9wdGlvbnMuY29udGFpbmVyU3VmZml4ICksXG4gICAgICAgICdQaGV0aW9EeW5hbWljRWxlbWVudENvbnRhaW5lciB0YW5kZW1zIHNob3VsZCBlbmQgd2l0aCBvcHRpb25zLmNvbnRhaW5lclN1ZmZpeCcgKTtcbiAgICB9XG5cbiAgICAvLyBvcHRpb25zIHRoYXQgZGVwZW5kIG9uIG90aGVyIG9wdGlvbnMgZm9yIHRoZWlyIGRlZmF1bHRcbiAgICBpZiAoIG9wdGlvbnMudGFuZGVtICYmICFvcHRpb25zLnBoZXRpb0R5bmFtaWNFbGVtZW50TmFtZSApIHtcbiAgICAgIG9wdGlvbnMucGhldGlvRHluYW1pY0VsZW1lbnROYW1lID0gb3B0aW9ucy50YW5kZW0ubmFtZS5zbGljZSggMCwgb3B0aW9ucy50YW5kZW0ubmFtZS5sZW5ndGggLSBvcHRpb25zLmNvbnRhaW5lclN1ZmZpeC5sZW5ndGggKTtcbiAgICB9XG5cbiAgICBzdXBlciggb3B0aW9ucyApO1xuXG4gICAgdGhpcy5zdXBwb3J0c0R5bmFtaWNTdGF0ZSA9IG9wdGlvbnMuc3VwcG9ydHNEeW5hbWljU3RhdGU7XG4gICAgdGhpcy5waGV0aW9EeW5hbWljRWxlbWVudE5hbWUgPSBvcHRpb25zLnBoZXRpb0R5bmFtaWNFbGVtZW50TmFtZTtcblxuICAgIHRoaXMuY3JlYXRlRWxlbWVudCA9IGNyZWF0ZUVsZW1lbnQ7XG4gICAgdGhpcy5kZWZhdWx0QXJndW1lbnRzID0gZGVmYXVsdEFyZ3VtZW50cztcblxuICAgIC8vIENhbiBiZSB1c2VkIGFzIGFuIGFyZ3VtZW50IHRvIGNyZWF0ZSBvdGhlciBhcmNoZXR5cGVzLCBidXQgb3RoZXJ3aXNlXG4gICAgLy8gYWNjZXNzIHNob3VsZCBub3QgYmUgbmVlZGVkLiBUaGlzIHdpbGwgb25seSBiZSBub24tbnVsbCB3aGVuIGdlbmVyYXRpbmcgdGhlIFBoRVQtaU8gQVBJLCBzZWUgY3JlYXRlQXJjaGV0eXBlKCkuXG4gICAgdGhpcy5fYXJjaGV0eXBlID0gdGhpcy5jcmVhdGVBcmNoZXR5cGUoKTtcblxuICAgIC8vIHN1YnR5cGVzIGV4cGVjdGVkIHRvIGZpcmUgdGhpcyBhY2NvcmRpbmcgdG8gaW5kaXZpZHVhbCBpbXBsZW1lbnRhdGlvbnNcbiAgICB0aGlzLmVsZW1lbnRDcmVhdGVkRW1pdHRlciA9IG5ldyBFbWl0dGVyPFsgVCwgc3RyaW5nIF0+KCB7XG4gICAgICBwYXJhbWV0ZXJzOiBbXG4gICAgICAgIHsgdmFsdWVUeXBlOiBQaGV0aW9PYmplY3QsIHBoZXRpb1R5cGU6IG9wdGlvbnMucGhldGlvVHlwZS5wYXJhbWV0ZXJUeXBlcyFbIDAgXSwgbmFtZTogJ2VsZW1lbnQnIH0sXG4gICAgICAgIHsgbmFtZTogJ3BoZXRpb0lEJywgcGhldGlvVHlwZTogU3RyaW5nSU8gfVxuICAgICAgXSxcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZWxlbWVudENyZWF0ZWRFbWl0dGVyJyApLFxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0VtaXR0ZXIgdGhhdCBmaXJlcyB3aGVuZXZlciBhIG5ldyBkeW5hbWljIGVsZW1lbnQgaXMgYWRkZWQgdG8gdGhlIGNvbnRhaW5lci4nXG4gICAgfSApO1xuXG4gICAgLy8gY2FsbGVkIG9uIGRpc3Bvc2FsIG9mIGFuIGVsZW1lbnRcbiAgICB0aGlzLmVsZW1lbnREaXNwb3NlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcjxbIFQsIHN0cmluZyBdPigge1xuICAgICAgcGFyYW1ldGVyczogW1xuICAgICAgICB7IHZhbHVlVHlwZTogUGhldGlvT2JqZWN0LCBwaGV0aW9UeXBlOiBvcHRpb25zLnBoZXRpb1R5cGUucGFyYW1ldGVyVHlwZXMhWyAwIF0sIG5hbWU6ICdlbGVtZW50JyB9LFxuICAgICAgICB7IG5hbWU6ICdwaGV0aW9JRCcsIHBoZXRpb1R5cGU6IFN0cmluZ0lPIH1cbiAgICAgIF0sXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VsZW1lbnREaXNwb3NlZEVtaXR0ZXInICksXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRW1pdHRlciB0aGF0IGZpcmVzIHdoZW5ldmVyIGEgZHluYW1pYyBlbGVtZW50IGlzIHJlbW92ZWQgZnJvbSB0aGUgY29udGFpbmVyLidcbiAgICB9ICk7XG5cbiAgICAvLyBFbWl0IHRvIHRoZSBkYXRhIHN0cmVhbSBvbiBlbGVtZW50IGNyZWF0aW9uL2Rpc3Bvc2FsLCBubyBuZWVkIHRvIGRvIHRoaXMgaW4gUGhFVCBicmFuZFxuICAgIGlmICggVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCApIHtcbiAgICAgIHRoaXMuZWxlbWVudENyZWF0ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBlbGVtZW50ID0+IHRoaXMuY3JlYXRlZEV2ZW50TGlzdGVuZXIoIGVsZW1lbnQgKSApO1xuICAgICAgdGhpcy5lbGVtZW50RGlzcG9zZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBlbGVtZW50ID0+IHRoaXMuZGlzcG9zZWRFdmVudExpc3RlbmVyKCBlbGVtZW50ICkgKTtcbiAgICB9XG5cbiAgICAvLyBhIHdheSB0byBkZWxheSBjcmVhdGlvbiBub3RpZmljYXRpb25zIHRvIGEgbGF0ZXIgdGltZSwgZm9yIHBoZXQtaW8gc3RhdGUgZW5naW5lIHN1cHBvcnRcbiAgICB0aGlzLm5vdGlmaWNhdGlvbnNEZWZlcnJlZCA9IGZhbHNlO1xuXG4gICAgLy8gbGlzdHMgdG8ga2VlcCB0cmFjayBvZiB0aGUgY3JlYXRlZCBhbmQgZGlzcG9zZWQgZWxlbWVudHMgd2hlbiBub3RpZmljYXRpb25zIGFyZSBkZWZlcnJlZC5cbiAgICAvLyBUaGVzZSBhcmUgdXNlZCB0byB0aGVuIGZsdXNoIG5vdGlmaWNhdGlvbnMgd2hlbiB0aGV5IGFyZSBzZXQgdG8gbm8gbG9uZ2VyIGJlIGRlZmVycmVkLlxuICAgIHRoaXMuZGVmZXJyZWRDcmVhdGlvbnMgPSBbXTtcbiAgICB0aGlzLmRlZmVycmVkRGlzcG9zYWxzID0gW107XG5cbiAgICAvLyBwcm92aWRlIGEgd2F5IHRvIG9wdCBvdXQgb2YgY29udGFpbmVycyBjbGVhcmluZyBkeW5hbWljIHN0YXRlLCB1c2VmdWwgaWYgZ3JvdXAgZWxlbWVudHMgZXhpc3QgZm9yIHRoZSBsaWZldGltZSBvZlxuICAgIC8vIHRoZSBzaW0sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdGFuZGVtL2lzc3Vlcy8xMzJcbiAgICBpZiAoIFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgJiYgdGhpcy5zdXBwb3J0c0R5bmFtaWNTdGF0ZSAmJlxuXG4gICAgICAgICAvLyBkb24ndCBjbGVhciBhcmNoZXR5cGVzIGJlY2F1c2UgdGhleSBhcmUgc3RhdGljLlxuICAgICAgICAgIXRoaXMucGhldGlvSXNBcmNoZXR5cGUgKSB7XG5cbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uaGFzSW4oIHdpbmRvdywgJ3BoZXQucGhldGlvLnBoZXRpb0VuZ2luZS5waGV0aW9TdGF0ZUVuZ2luZScgKSxcbiAgICAgICAgJ1BoZXRpb0R5bmFtaWNFbGVtZW50Q29udGFpbmVycyBtdXN0IGJlIGNyZWF0ZWQgb25jZSBwaGV0aW9FbmdpbmUgaGFzIGJlZW4gY29uc3RydWN0ZWQnICk7XG5cbiAgICAgIGNvbnN0IHBoZXRpb1N0YXRlRW5naW5lID0gcGhldC5waGV0aW8ucGhldGlvRW5naW5lLnBoZXRpb1N0YXRlRW5naW5lO1xuXG4gICAgICAvLyBPbiBzdGF0ZSBzdGFydCwgY2xlYXIgb3V0IHRoZSBjb250YWluZXIgYW5kIHNldCB0byBkZWZlciBub3RpZmljYXRpb25zLlxuICAgICAgcGhldGlvU3RhdGVFbmdpbmUuY2xlYXJEeW5hbWljRWxlbWVudHNFbWl0dGVyLmFkZExpc3RlbmVyKCAoIHN0YXRlOiBQaGV0aW9TdGF0ZSwgc2NvcGVUYW5kZW06IFRhbmRlbSApID0+IHtcblxuICAgICAgICAvLyBPbmx5IGNsZWFyIGlmIHRoaXMgUGhldGlvRHluYW1pY0VsZW1lbnRDb250YWluZXIgaXMgaW4gc2NvcGUgb2YgdGhlIHN0YXRlIHRvIGJlIHNldFxuICAgICAgICBpZiAoIHRoaXMudGFuZGVtLmhhc0FuY2VzdG9yKCBzY29wZVRhbmRlbSApICkge1xuICAgICAgICAgIHRoaXMuY2xlYXIoIHtcbiAgICAgICAgICAgIHBoZXRpb1N0YXRlOiBzdGF0ZVxuICAgICAgICAgIH0gKTtcbiAgICAgICAgICB0aGlzLnNldE5vdGlmaWNhdGlvbnNEZWZlcnJlZCggdHJ1ZSApO1xuICAgICAgICB9XG4gICAgICB9ICk7XG5cbiAgICAgIC8vIGRvbmUgd2l0aCBzdGF0ZSBzZXR0aW5nXG4gICAgICBwaGV0aW9TdGF0ZUVuZ2luZS51bmRlZmVyRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xuICAgICAgICBpZiAoIHRoaXMubm90aWZpY2F0aW9uc0RlZmVycmVkICkge1xuICAgICAgICAgIHRoaXMuc2V0Tm90aWZpY2F0aW9uc0RlZmVycmVkKCBmYWxzZSApO1xuICAgICAgICB9XG4gICAgICB9ICk7XG5cbiAgICAgIHBoZXRpb1N0YXRlRW5naW5lLmFkZFNldFN0YXRlSGVscGVyKCAoIHN0YXRlOiBQaGV0aW9TdGF0ZSwgc3RpbGxUb1NldElEczogc3RyaW5nW10gKSA9PiB7XG4gICAgICAgIGxldCBjcmVhdGlvbk5vdGlmaWVkID0gZmFsc2U7XG5cbiAgICAgICAgbGV0IGl0ZXJhdGlvbkNvdW50ID0gMDtcblxuICAgICAgICB3aGlsZSAoIHRoaXMuZGVmZXJyZWRDcmVhdGlvbnMubGVuZ3RoID4gMCApIHtcblxuICAgICAgICAgIGlmICggaXRlcmF0aW9uQ291bnQgPiAyMDAgKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdUb28gbWFueSBpdGVyYXRpb25zIGluIGRlZmVycmVkIGNyZWF0aW9ucywgc3RpbGxUb1NldElEcyA9ICcgKyBzdGlsbFRvU2V0SURzLmpvaW4oICcsICcgKSApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGRlZmVycmVkQ3JlYXRlZEVsZW1lbnQgPSB0aGlzLmRlZmVycmVkQ3JlYXRpb25zWyAwIF07XG4gICAgICAgICAgaWYgKCB0aGlzLnN0YXRlU2V0T25BbGxDaGlsZHJlbk9mRHluYW1pY0VsZW1lbnQoIGRlZmVycmVkQ3JlYXRlZEVsZW1lbnQudGFuZGVtLnBoZXRpb0lELCBzdGlsbFRvU2V0SURzICkgKSB7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeUVsZW1lbnRDcmVhdGVkV2hpbGVEZWZlcnJlZCggZGVmZXJyZWRDcmVhdGVkRWxlbWVudCApO1xuICAgICAgICAgICAgY3JlYXRpb25Ob3RpZmllZCA9IHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaXRlcmF0aW9uQ291bnQrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3JlYXRpb25Ob3RpZmllZDtcbiAgICAgIH0gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMgdHJ1ZSBpZiBhbGwgY2hpbGRyZW4gb2YgYSBzaW5nbGUgZHluYW1pYyBlbGVtZW50IChiYXNlZCBvbiBwaGV0aW9JRCkgaGF2ZSBoYWQgdGhlaXIgc3RhdGUgc2V0IGFscmVhZHkuXG4gICAqL1xuICBwcml2YXRlIHN0YXRlU2V0T25BbGxDaGlsZHJlbk9mRHluYW1pY0VsZW1lbnQoIGR5bmFtaWNFbGVtZW50SUQ6IHN0cmluZywgc3RpbGxUb1NldElEczogc3RyaW5nW10gKTogYm9vbGVhbiB7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3RpbGxUb1NldElEcy5sZW5ndGg7IGkrKyApIHtcblxuICAgICAgaWYgKCBwaGV0aW8uUGhldGlvSURVdGlscy5pc0FuY2VzdG9yKCBkeW5hbWljRWxlbWVudElELCBzdGlsbFRvU2V0SURzWyBpIF0gKSApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTsgLy8gTm8gZWxlbWVudHMgaW4gc3RhdGUgdGhhdCBhcmVuJ3QgaW4gdGhlIGNvbXBsZXRlZCBsaXN0XG4gIH1cblxuICAvKipcbiAgICogQXJjaGV0eXBlcyBhcmUgY3JlYXRlZCB0byBnZW5lcmF0ZSB0aGUgYmFzZWxpbmUgZmlsZSwgb3IgdG8gdmFsaWRhdGUgYWdhaW5zdCBhbiBleGlzdGluZyBiYXNlbGluZSBmaWxlLiAgVGhleSBhcmVcbiAgICogUGhldGlvT2JqZWN0cyBhbmQgcmVnaXN0ZXJlZCB3aXRoIHRoZSBwaGV0aW9FbmdpbmUsIGJ1dCBub3Qgc2VuZCBvdXQgdmlhIG5vdGlmaWNhdGlvbnMgZnJvbSBQaGV0aW9FbmdpbmUucGhldGlvRWxlbWVudEFkZGVkRW1pdHRlcigpLFxuICAgKiBiZWNhdXNlIHRoZXkgYXJlIGludGVuZGVkIGZvciBpbnRlcm5hbCB1c2FnZSBvbmx5LiAgQXJjaGV0eXBlcyBzaG91bGQgbm90IGJlIGNyZWF0ZWQgaW4gcHJvZHVjdGlvbiBjb2RlLlxuICAgKlxuICAgKiBQaGV0aW9EeW5hbWljRWxlbWVudENvbnRhaW5lciBjYWxscyB0aGlzIG1ldGhvZCBpbnRlcm5hbGx5IHRvIGNyZWF0ZSBhbmQgYXNzaWduIGl0cyBvd24gYXJjaGV0eXBlLCBidXQgdGhpcyBtZXRob2RcbiAgICogY2FuIGFkZGl0aW9uYWxseSBiZSBjYWxsZWQgd2l0aCBhbHRlcm5hdGUgYXJjaGV0eXBlVGFuZGVtIGFuZC9vciBjcmVhdGVFbGVtZW50QXJncyB0byBjcmVhdGUgYWx0ZXJuYXRlIGFyY2hldHlwZXMuXG4gICAqIFRoaXMgY2FuIGJlIG5lY2Vzc2FyeSBpbiBzaXR1YXRpb25zIHRoYXQgcmVxdWlyZSBhcmNoZXR5cGVzIHByb3ZpZGVkIHRvIG90aGVyIGFyY2hldHlwZXMsIG9yIHdpdGggb3RoZXIgZm9ybXNcbiAgICogb2YgZGVwZW5kZW5jeSBpbmplY3Rpb24sIHN1Y2ggYXMgaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3RhbmRlbS9pc3N1ZXMvMzEyXG4gICAqL1xuICBwdWJsaWMgY3JlYXRlQXJjaGV0eXBlKFxuICAgIGFyY2hldHlwZVRhbmRlbSA9IHRoaXMudGFuZGVtLmNyZWF0ZVRhbmRlbSggRFlOQU1JQ19BUkNIRVRZUEVfTkFNRSApLFxuICAgIGNyZWF0ZUVsZW1lbnRBcmdzOiAoIENyZWF0ZUVsZW1lbnRBcmd1bWVudHMgfCAoICgpID0+IENyZWF0ZUVsZW1lbnRBcmd1bWVudHMgKSApID0gdGhpcy5kZWZhdWx0QXJndW1lbnRzXG4gICk6IFQgfCBudWxsIHtcblxuICAgIC8vIE9uY2UgdGhlIHNpbSBoYXMgc3RhcnRlZCwgYW55IGFyY2hldHlwZXMgYmVpbmcgY3JlYXRlZCBhcmUgbGlrZWx5IGRvbmUgc28gYmVjYXVzZSB0aGV5IGFyZSBuZXN0ZWQgUGhldGlvR3JvdXBzLlxuICAgIGlmICggXy5oYXNJbiggd2luZG93LCAncGhldC5qb2lzdC5zaW0nICkgJiYgcGhldC5qb2lzdC5zaW0uaXNDb25zdHJ1Y3Rpb25Db21wbGV0ZVByb3BlcnR5LnZhbHVlICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICduZXN0ZWQgRHluYW1pY0VsZW1lbnRDb250YWluZXJzIGFyZSBub3QgY3VycmVudGx5IHN1cHBvcnRlZCcgKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFdoZW4gZ2VuZXJhdGluZyB0aGUgYmFzZWxpbmUsIG91dHB1dCB0aGUgc2NoZW1hIGZvciB0aGUgYXJjaGV0eXBlXG4gICAgaWYgKCBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICYmIHBoZXQucHJlbG9hZHMucGhldGlvLmNyZWF0ZUFyY2hldHlwZXMgKSB7XG4gICAgICBjb25zdCBhcmNoZXR5cGVBcmdzID0gQXJyYXkuaXNBcnJheSggY3JlYXRlRWxlbWVudEFyZ3MgKSA/IGNyZWF0ZUVsZW1lbnRBcmdzIDogY3JlYXRlRWxlbWVudEFyZ3MoKTtcblxuICAgICAgLy8gVGhlIGNyZWF0ZSBmdW5jdGlvbiB0YWtlcyBhIHRhbmRlbSBwbHVzIHRoZSBkZWZhdWx0IGFyZ3NcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuY3JlYXRlRWxlbWVudC5sZW5ndGggPT09IGFyY2hldHlwZUFyZ3MubGVuZ3RoICsgMSwgJ21pc21hdGNoZWQgbnVtYmVyIG9mIGFyZ3VtZW50cycgKTtcblxuICAgICAgY29uc3QgYXJjaGV0eXBlID0gdGhpcy5jcmVhdGVFbGVtZW50KCBhcmNoZXR5cGVUYW5kZW0sIC4uLmFyY2hldHlwZUFyZ3MgKTtcblxuICAgICAgLy8gTWFyayB0aGUgYXJjaGV0eXBlIGZvciBpbmNsdXNpb24gaW4gdGhlIGJhc2VsaW5lIHNjaGVtYVxuICAgICAgaWYgKCB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKSB7XG4gICAgICAgIGFyY2hldHlwZS5tYXJrRHluYW1pY0VsZW1lbnRBcmNoZXR5cGUoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhcmNoZXR5cGU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGR5bmFtaWMgUGhldGlvT2JqZWN0IGVsZW1lbnQgZm9yIHRoaXMgY29udGFpbmVyXG4gICAqIEBwYXJhbSBjb21wb25lbnROYW1lXG4gICAqIEBwYXJhbSBhcmdzRm9yQ3JlYXRlRnVuY3Rpb25cbiAgICogQHBhcmFtIGNvbnRhaW5lclBhcmFtZXRlclR5cGUgLSBudWxsIGluIFBoRVQgYnJhbmRcbiAgICovXG4gIHB1YmxpYyBjcmVhdGVEeW5hbWljRWxlbWVudCggY29tcG9uZW50TmFtZTogc3RyaW5nLCBhcmdzRm9yQ3JlYXRlRnVuY3Rpb246IENyZWF0ZUVsZW1lbnRBcmd1bWVudHMsIGNvbnRhaW5lclBhcmFtZXRlclR5cGU6IElPVHlwZSB8IG51bGwgKTogVCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggYXJnc0ZvckNyZWF0ZUZ1bmN0aW9uICksICdzaG91bGQgYmUgYXJyYXknICk7XG5cbiAgICAvLyBjcmVhdGUgd2l0aCBkZWZhdWx0IHN0YXRlIGFuZCBzdWJzdHJ1Y3R1cmUsIGRldGFpbHMgd2lsbCBuZWVkIHRvIGJlIHNldCBieSBzZXR0ZXIgbWV0aG9kcy5cblxuICAgIGxldCBjcmVhdGVkT2JqZWN0VGFuZGVtO1xuICAgIGlmICggIXRoaXMudGFuZGVtLmhhc0NoaWxkKCBjb21wb25lbnROYW1lICkgKSB7XG4gICAgICBjcmVhdGVkT2JqZWN0VGFuZGVtID0gbmV3IER5bmFtaWNUYW5kZW0oIHRoaXMudGFuZGVtLCBjb21wb25lbnROYW1lLCB0aGlzLnRhbmRlbS5nZXRFeHRlbmRlZE9wdGlvbnMoKSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNyZWF0ZWRPYmplY3RUYW5kZW0gPSB0aGlzLnRhbmRlbS5jcmVhdGVUYW5kZW0oIGNvbXBvbmVudE5hbWUsIHRoaXMudGFuZGVtLmdldEV4dGVuZGVkT3B0aW9ucygpICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjcmVhdGVkT2JqZWN0VGFuZGVtIGluc3RhbmNlb2YgRHluYW1pY1RhbmRlbSwgJ2NyZWF0ZWRPYmplY3RUYW5kZW0gc2hvdWxkIGJlIGFuIGluc3RhbmNlIG9mIER5bmFtaWNUYW5kZW0nICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC9uby1zaW1wbGUtdHlwZS1jaGVja2luZy1hc3NlcnRpb25zXG4gICAgfVxuXG4gICAgY29uc3QgY3JlYXRlZE9iamVjdCA9IHRoaXMuY3JlYXRlRWxlbWVudCggY3JlYXRlZE9iamVjdFRhbmRlbSwgLi4uYXJnc0ZvckNyZWF0ZUZ1bmN0aW9uICk7XG5cbiAgICAvLyBUaGlzIHZhbGlkYXRpb24gaXMgb25seSBuZWVkZWQgZm9yIFBoRVQtaU8gYnJhbmRcbiAgICBpZiAoIFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjb250YWluZXJQYXJhbWV0ZXJUeXBlICE9PSBudWxsLCAnY29udGFpbmVyUGFyYW1ldGVyVHlwZSBtdXN0IGJlIHByb3ZpZGVkIGluIFBoRVQtaU8gYnJhbmQnICk7XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgbmV3IGdyb3VwIGVsZW1lbnQgbWF0Y2hlcyB0aGUgc2NoZW1hIGZvciBlbGVtZW50cy5cbiAgICAgIHZhbGlkYXRlKCBjcmVhdGVkT2JqZWN0LCBjb250YWluZXJQYXJhbWV0ZXJUeXBlIS52YWxpZGF0b3IgKTtcblxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggY3JlYXRlZE9iamVjdC5waGV0aW9UeXBlLmV4dGVuZHMoIGNvbnRhaW5lclBhcmFtZXRlclR5cGUhICksXG4gICAgICAgICdkeW5hbWljIGVsZW1lbnQgY29udGFpbmVyIGV4cGVjdGVkIGl0cyBjcmVhdGVkIGluc3RhbmNlXFwncyBwaGV0aW9UeXBlIHRvIG1hdGNoIGl0cyBwYXJhbWV0ZXJUeXBlLicgKTtcbiAgICB9XG5cbiAgICBhc3NlcnQgJiYgdGhpcy5hc3NlcnREeW5hbWljUGhldGlvT2JqZWN0KCBjcmVhdGVkT2JqZWN0ICk7XG5cbiAgICByZXR1cm4gY3JlYXRlZE9iamVjdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGR5bmFtaWMgZWxlbWVudCBzaG91bGQgYmUgYW4gaW5zdHJ1bWVudGVkIFBoZXRpb09iamVjdCB3aXRoIHBoZXRpb0R5bmFtaWNFbGVtZW50OiB0cnVlXG4gICAqL1xuICBwcml2YXRlIGFzc2VydER5bmFtaWNQaGV0aW9PYmplY3QoIHBoZXRpb09iamVjdDogVCApOiB2b2lkIHtcbiAgICBpZiAoIFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgJiYgVGFuZGVtLlZBTElEQVRJT04gKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwaGV0aW9PYmplY3QuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSwgJ2luc3RhbmNlIHNob3VsZCBiZSBpbnN0cnVtZW50ZWQnICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwaGV0aW9PYmplY3QucGhldGlvRHluYW1pY0VsZW1lbnQsICdpbnN0YW5jZSBzaG91bGQgYmUgbWFya2VkIGFzIHBoZXRpb0R5bmFtaWNFbGVtZW50OnRydWUnICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEVtaXQgYSBjcmVhdGVkIG9yIGRpc3Bvc2VkIGV2ZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBlbWl0RGF0YVN0cmVhbUV2ZW50KCBkeW5hbWljRWxlbWVudDogVCwgZXZlbnROYW1lOiBzdHJpbmcsIGFkZGl0aW9uYWxEYXRhPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsICk6IHZvaWQge1xuICAgIHRoaXMucGhldGlvU3RhcnRFdmVudCggZXZlbnROYW1lLCB7XG4gICAgICBkYXRhOiBtZXJnZSgge1xuICAgICAgICBwaGV0aW9JRDogZHluYW1pY0VsZW1lbnQudGFuZGVtLnBoZXRpb0lEXG4gICAgICB9LCBhZGRpdGlvbmFsRGF0YSApXG4gICAgfSApO1xuICAgIHRoaXMucGhldGlvRW5kRXZlbnQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbWl0IGV2ZW50cyB3aGVuIGR5bmFtaWMgZWxlbWVudHMgYXJlIGNyZWF0ZWQuXG4gICAqL1xuICBwcml2YXRlIGNyZWF0ZWRFdmVudExpc3RlbmVyKCBkeW5hbWljRWxlbWVudDogVCApOiB2b2lkIHtcbiAgICBjb25zdCBhZGRpdGlvbmFsRGF0YSA9IGR5bmFtaWNFbGVtZW50LnBoZXRpb1N0YXRlID8ge1xuXG4gICAgICBzdGF0ZTogdGhpcy5waGV0aW9UeXBlLnBhcmFtZXRlclR5cGVzIVsgMCBdLnRvU3RhdGVPYmplY3QoIGR5bmFtaWNFbGVtZW50IClcbiAgICB9IDogbnVsbDtcbiAgICB0aGlzLmVtaXREYXRhU3RyZWFtRXZlbnQoIGR5bmFtaWNFbGVtZW50LCAnY3JlYXRlZCcsIGFkZGl0aW9uYWxEYXRhICk7XG4gIH1cblxuICAvKipcbiAgICogRW1pdCBldmVudHMgd2hlbiBkeW5hbWljIGVsZW1lbnRzIGFyZSBkaXNwb3NlZC5cbiAgICovXG4gIHByaXZhdGUgZGlzcG9zZWRFdmVudExpc3RlbmVyKCBkeW5hbWljRWxlbWVudDogVCApOiB2b2lkIHtcbiAgICB0aGlzLmVtaXREYXRhU3RyZWFtRXZlbnQoIGR5bmFtaWNFbGVtZW50LCAnZGlzcG9zZWQnICk7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcblxuICAgIC8vIElmIGhpdHRpbmcgdGhpcyBhc3NlcnRpb24gYmVjYXVzZSBvZiBuZXN0ZWQgZHluYW1pYyBlbGVtZW50IGNvbnRhaW5lcnMsIHBsZWFzZSBkaXNjdXNzIHdpdGggYSBwaGV0LWlvIHRlYW0gbWVtYmVyLlxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnUGhldGlvRHluYW1pY0VsZW1lbnRDb250YWluZXJzIGFyZSBub3QgaW50ZW5kZWQgZm9yIGRpc3Bvc2FsJyApO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3Bvc2UgYSBjb250YWluZWQgZWxlbWVudFxuICAgKi9cbiAgcHJvdGVjdGVkIGRpc3Bvc2VFbGVtZW50KCBlbGVtZW50OiBUICk6IHZvaWQge1xuICAgIGVsZW1lbnQuZGlzcG9zZSgpO1xuXG4gICAgYXNzZXJ0ICYmIHRoaXMuc3VwcG9ydHNEeW5hbWljU3RhdGUgJiYgXy5oYXNJbiggd2luZG93LCAncGhldC5qb2lzdC5zaW0nICkgJiYgYXNzZXJ0KFxuICAgICAgLy8gV2UgZG8gbm90IHdhbnQgdG8gYmUgZGlzcG9zaW5nIGR5bmFtaWMgZWxlbWVudHMgd2hlbiBzdGF0ZSBzZXR0aW5nIEVYQ0VQVCB3aGVuIHdlIGFyZSBjbGVhcmluZyBhbGwgZHluYW1pY1xuICAgICAgLy8gZWxlbWVudHMgKHdoaWNoIGlzIG9rIGFuZCBleHBlY3RlZCB0byBkbyBhdCB0aGUgYmVnaW5uaW5nIG9mIHNldHRpbmcgc3RhdGUpLlxuICAgICAgISggaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eS52YWx1ZSAmJiAhaXNDbGVhcmluZ1BoZXRpb0R5bmFtaWNFbGVtZW50c1Byb3BlcnR5ICksXG4gICAgICAnc2hvdWxkIG5vdCBkaXNwb3NlIGEgZHluYW1pYyBlbGVtZW50IHdoaWxlIHNldHRpbmcgcGhldC1pbyBzdGF0ZScgKTtcblxuICAgIGlmICggdGhpcy5ub3RpZmljYXRpb25zRGVmZXJyZWQgKSB7XG4gICAgICB0aGlzLmRlZmVycmVkRGlzcG9zYWxzLnB1c2goIGVsZW1lbnQgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLmVsZW1lbnREaXNwb3NlZEVtaXR0ZXIuZW1pdCggZWxlbWVudCwgZWxlbWVudC50YW5kZW0ucGhldGlvSUQgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gY2xlYXJpbmcgdGhlIGNvbnRlbnRzIG9mIHRoaXMgY29udGFpbmVyIHRvIHJlYWR5IHRoaW5ncyBmb3Igc2V0dGluZyBpdHMgc3RhdGUuIEluIGdlbmVyYWwsIHRoaXMgY2xhc3NcbiAgICogaXMgc2V0IHVwIHRvIGRlc3Ryb3kgYW5kIHRoZW4gcmVjcmVhdGUgYWxsIG9mIGl0cyBlbGVtZW50cyBpbnN0ZWFkIG9mIG11dGF0aW5nIHRoZW0uXG4gICAqL1xuICBwdWJsaWMgYWJzdHJhY3QgY2xlYXIoIGNsZWFyT3B0aW9ucz86IENsZWFyT3B0aW9ucyApOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBGbHVzaCBhIHNpbmdsZSBlbGVtZW50IGZyb20gdGhlIGxpc3Qgb2YgZGVmZXJyZWQgZGlzcG9zYWxzIHRoYXQgaGF2ZSBub3QgeWV0IG5vdGlmaWVkIGFib3V0IHRoZSBkaXNwb3NhbC4gVGhpc1xuICAgKiBzaG91bGQgbmV2ZXIgYmUgY2FsbGVkIHB1YmxpY2x5LCBpbnN0ZWFkIHNlZSBgZGlzcG9zZUVsZW1lbnRgXG4gICAqL1xuICBwcml2YXRlIG5vdGlmeUVsZW1lbnREaXNwb3NlZFdoaWxlRGVmZXJyZWQoIGRpc3Bvc2VkRWxlbWVudDogVCApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm5vdGlmaWNhdGlvbnNEZWZlcnJlZCwgJ3Nob3VsZCBvbmx5IGJlIGNhbGxlZCB3aGVuIG5vdGlmaWNhdGlvbnMgYXJlIGRlZmVycmVkJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZGVmZXJyZWREaXNwb3NhbHMuaW5jbHVkZXMoIGRpc3Bvc2VkRWxlbWVudCApLCAnZGlzcG9zZWRFbGVtZW50IHNob3VsZCBub3QgaGF2ZSBiZWVuIGFscmVhZHkgbm90aWZpZWQnICk7XG4gICAgdGhpcy5lbGVtZW50RGlzcG9zZWRFbWl0dGVyLmVtaXQoIGRpc3Bvc2VkRWxlbWVudCwgZGlzcG9zZWRFbGVtZW50LnRhbmRlbS5waGV0aW9JRCApO1xuICAgIGFycmF5UmVtb3ZlKCB0aGlzLmRlZmVycmVkRGlzcG9zYWxzLCBkaXNwb3NlZEVsZW1lbnQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaG91bGQgYmUgY2FsbGVkIGJ5IHN1YnR5cGVzIHVwb24gZWxlbWVudCBjcmVhdGlvbiwgc2VlIFBoZXRpb0dyb3VwIGFzIGFuIGV4YW1wbGUuXG4gICAqL1xuICBwcm90ZWN0ZWQgbm90aWZ5RWxlbWVudENyZWF0ZWQoIGNyZWF0ZWRFbGVtZW50OiBUICk6IHZvaWQge1xuICAgIGlmICggdGhpcy5ub3RpZmljYXRpb25zRGVmZXJyZWQgKSB7XG4gICAgICB0aGlzLmRlZmVycmVkQ3JlYXRpb25zLnB1c2goIGNyZWF0ZWRFbGVtZW50ICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5lbGVtZW50Q3JlYXRlZEVtaXR0ZXIuZW1pdCggY3JlYXRlZEVsZW1lbnQsIGNyZWF0ZWRFbGVtZW50LnRhbmRlbS5waGV0aW9JRCApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGbHVzaCBhIHNpbmdsZSBlbGVtZW50IGZyb20gdGhlIGxpc3Qgb2YgZGVmZXJyZWQgY3JlYXRpb25zIHRoYXQgaGF2ZSBub3QgeWV0IG5vdGlmaWVkIGFib3V0IHRoZSBkaXNwb3NhbC4gVGhpc1xuICAgKiBpcyBvbmx5IHB1YmxpYyB0byBzdXBwb3J0IHNwZWNpZmljIG9yZGVyIGRlcGVuZGVuY2llcyBpbiB0aGUgUGhldGlvU3RhdGVFbmdpbmUsIG90aGVyd2lzZSBzZWUgYHRoaXMubm90aWZ5RWxlbWVudENyZWF0ZWQoKWBcbiAgICogKFBoZXRpb0dyb3VwVGVzdHMsIHBoZXQtaW8pIC0gb25seSB0aGUgUGhldGlvU3RhdGVFbmdpbmUgc2hvdWxkIG5vdGlmeSBpbmRpdmlkdWFsIGVsZW1lbnRzIGNyZWF0ZWQuXG4gICAqL1xuICBwdWJsaWMgbm90aWZ5RWxlbWVudENyZWF0ZWRXaGlsZURlZmVycmVkKCBjcmVhdGVkRWxlbWVudDogVCApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm5vdGlmaWNhdGlvbnNEZWZlcnJlZCwgJ3Nob3VsZCBvbmx5IGJlIGNhbGxlZCB3aGVuIG5vdGlmaWNhdGlvbnMgYXJlIGRlZmVycmVkJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZGVmZXJyZWRDcmVhdGlvbnMuaW5jbHVkZXMoIGNyZWF0ZWRFbGVtZW50ICksICdjcmVhdGVkRWxlbWVudCBzaG91bGQgbm90IGhhdmUgYmVlbiBhbHJlYWR5IG5vdGlmaWVkJyApO1xuICAgIHRoaXMuZWxlbWVudENyZWF0ZWRFbWl0dGVyLmVtaXQoIGNyZWF0ZWRFbGVtZW50LCBjcmVhdGVkRWxlbWVudC50YW5kZW0ucGhldGlvSUQgKTtcbiAgICBhcnJheVJlbW92ZSggdGhpcy5kZWZlcnJlZENyZWF0aW9ucywgY3JlYXRlZEVsZW1lbnQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIHNldCB0byB0cnVlLCBjcmVhdGlvbiBhbmQgZGlzcG9zYWwgbm90aWZpY2F0aW9ucyB3aWxsIGJlIGRlZmVycmVkIHVudGlsIHNldCB0byBmYWxzZS4gV2hlbiBzZXQgdG8gZmFsc2UsXG4gICAqIHRoaXMgZnVuY3Rpb24gd2lsbCBmbHVzaCBhbGwgdGhlIG5vdGlmaWNhdGlvbnMgZm9yIGNyZWF0ZWQgYW5kIGRpc3Bvc2VkIGVsZW1lbnRzIChpbiB0aGF0IG9yZGVyKSB0aGF0IG9jY3VycmVkXG4gICAqIHdoaWxlIHRoaXMgY29udGFpbmVyIHdhcyBkZWZlcnJpbmcgaXRzIG5vdGlmaWNhdGlvbnMuXG4gICAqL1xuICBwdWJsaWMgc2V0Tm90aWZpY2F0aW9uc0RlZmVycmVkKCBub3RpZmljYXRpb25zRGVmZXJyZWQ6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbm90aWZpY2F0aW9uc0RlZmVycmVkICE9PSB0aGlzLm5vdGlmaWNhdGlvbnNEZWZlcnJlZCwgJ3Nob3VsZCBub3QgYmUgdGhlIHNhbWUgYXMgY3VycmVudCB2YWx1ZScgKTtcblxuICAgIC8vIEZsdXNoIGFsbCBub3RpZmljYXRpb25zIHdoZW4gc2V0dGluZyB0byBiZSBubyBsb25nZXIgZGVmZXJyZWRcbiAgICBpZiAoICFub3RpZmljYXRpb25zRGVmZXJyZWQgKSB7XG4gICAgICB3aGlsZSAoIHRoaXMuZGVmZXJyZWRDcmVhdGlvbnMubGVuZ3RoID4gMCApIHtcbiAgICAgICAgdGhpcy5ub3RpZnlFbGVtZW50Q3JlYXRlZFdoaWxlRGVmZXJyZWQoIHRoaXMuZGVmZXJyZWRDcmVhdGlvbnNbIDAgXSApO1xuICAgICAgfVxuICAgICAgd2hpbGUgKCB0aGlzLmRlZmVycmVkRGlzcG9zYWxzLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgIHRoaXMubm90aWZ5RWxlbWVudERpc3Bvc2VkV2hpbGVEZWZlcnJlZCggdGhpcy5kZWZlcnJlZERpc3Bvc2Fsc1sgMCBdICk7XG4gICAgICB9XG4gICAgfVxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZGVmZXJyZWRDcmVhdGlvbnMubGVuZ3RoID09PSAwLCAnY3JlYXRpb25zIHNob3VsZCBiZSBjbGVhcicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmRlZmVycmVkRGlzcG9zYWxzLmxlbmd0aCA9PT0gMCwgJ2Rpc3Bvc2FscyBzaG91bGQgYmUgY2xlYXInICk7XG4gICAgdGhpcy5ub3RpZmljYXRpb25zRGVmZXJyZWQgPSBub3RpZmljYXRpb25zRGVmZXJyZWQ7XG4gIH1cblxuICAvKipcbiAgICogQHRocm93cyBlcnJvciBpZiB0cnlpbmcgdG8gYWNjZXNzIHdoZW4gYXJjaGV0eXBlcyBhcmVuJ3QgYmVpbmcgY3JlYXRlZC5cbiAgICovXG4gIHB1YmxpYyBnZXQgYXJjaGV0eXBlKCk6IFQge1xuICAgIHJldHVybiBhcmNoZXR5cGVDYXN0KCB0aGlzLl9hcmNoZXR5cGUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgdGhlIHBoZXRpb0R5bmFtaWNFbGVtZW50TmFtZSBmb3IgQVBJIHRyYWNraW5nXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0TWV0YWRhdGEoIG9iamVjdDogUGhldGlvT2JqZWN0TWV0YWRhdGFJbnB1dCApOiBQaGV0aW9FbGVtZW50TWV0YWRhdGEge1xuICAgIGNvbnN0IG1ldGFkYXRhID0gc3VwZXIuZ2V0TWV0YWRhdGEoIG9iamVjdCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoXG4gICAgICAhbWV0YWRhdGEuaGFzT3duUHJvcGVydHkoICdwaGV0aW9EeW5hbWljRWxlbWVudE5hbWUnICksXG4gICAgICAnUGhldGlvRHluYW1pY0VsZW1lbnRDb250YWluZXIgc2V0cyB0aGUgcGhldGlvRHluYW1pY0VsZW1lbnROYW1lIG1ldGFkYXRhIGtleSdcbiAgICApO1xuICAgIHJldHVybiBtZXJnZSggeyBwaGV0aW9EeW5hbWljRWxlbWVudE5hbWU6IHRoaXMucGhldGlvRHluYW1pY0VsZW1lbnROYW1lIH0sIG1ldGFkYXRhICk7XG4gIH1cbn1cblxudGFuZGVtTmFtZXNwYWNlLnJlZ2lzdGVyKCAnUGhldGlvRHluYW1pY0VsZW1lbnRDb250YWluZXInLCBQaGV0aW9EeW5hbWljRWxlbWVudENvbnRhaW5lciApO1xuZXhwb3J0IGRlZmF1bHQgUGhldGlvRHluYW1pY0VsZW1lbnRDb250YWluZXI7Il0sIm5hbWVzIjpbIkVtaXR0ZXIiLCJ2YWxpZGF0ZSIsImFycmF5UmVtb3ZlIiwibWVyZ2UiLCJvcHRpb25pemUiLCJEeW5hbWljVGFuZGVtIiwiaXNDbGVhcmluZ1BoZXRpb0R5bmFtaWNFbGVtZW50c1Byb3BlcnR5IiwiaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eSIsIlBoZXRpb09iamVjdCIsIlRhbmRlbSIsIkRZTkFNSUNfQVJDSEVUWVBFX05BTUUiLCJ0YW5kZW1OYW1lc3BhY2UiLCJTdHJpbmdJTyIsIkRFRkFVTFRfQ09OVEFJTkVSX1NVRkZJWCIsImFyY2hldHlwZUNhc3QiLCJhcmNoZXR5cGUiLCJFcnJvciIsIlBoZXRpb0R5bmFtaWNFbGVtZW50Q29udGFpbmVyIiwic3RhdGVTZXRPbkFsbENoaWxkcmVuT2ZEeW5hbWljRWxlbWVudCIsImR5bmFtaWNFbGVtZW50SUQiLCJzdGlsbFRvU2V0SURzIiwiaSIsImxlbmd0aCIsInBoZXRpbyIsIlBoZXRpb0lEVXRpbHMiLCJpc0FuY2VzdG9yIiwiY3JlYXRlQXJjaGV0eXBlIiwiYXJjaGV0eXBlVGFuZGVtIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiY3JlYXRlRWxlbWVudEFyZ3MiLCJkZWZhdWx0QXJndW1lbnRzIiwiXyIsImhhc0luIiwid2luZG93IiwicGhldCIsImpvaXN0Iiwic2ltIiwiaXNDb25zdHJ1Y3Rpb25Db21wbGV0ZVByb3BlcnR5IiwidmFsdWUiLCJhc3NlcnQiLCJQSEVUX0lPX0VOQUJMRUQiLCJwcmVsb2FkcyIsImNyZWF0ZUFyY2hldHlwZXMiLCJhcmNoZXR5cGVBcmdzIiwiQXJyYXkiLCJpc0FycmF5IiwiY3JlYXRlRWxlbWVudCIsImlzUGhldGlvSW5zdHJ1bWVudGVkIiwibWFya0R5bmFtaWNFbGVtZW50QXJjaGV0eXBlIiwiY3JlYXRlRHluYW1pY0VsZW1lbnQiLCJjb21wb25lbnROYW1lIiwiYXJnc0ZvckNyZWF0ZUZ1bmN0aW9uIiwiY29udGFpbmVyUGFyYW1ldGVyVHlwZSIsImNyZWF0ZWRPYmplY3RUYW5kZW0iLCJoYXNDaGlsZCIsImdldEV4dGVuZGVkT3B0aW9ucyIsImNyZWF0ZWRPYmplY3QiLCJ2YWxpZGF0b3IiLCJwaGV0aW9UeXBlIiwiZXh0ZW5kcyIsImFzc2VydER5bmFtaWNQaGV0aW9PYmplY3QiLCJwaGV0aW9PYmplY3QiLCJWQUxJREFUSU9OIiwicGhldGlvRHluYW1pY0VsZW1lbnQiLCJlbWl0RGF0YVN0cmVhbUV2ZW50IiwiZHluYW1pY0VsZW1lbnQiLCJldmVudE5hbWUiLCJhZGRpdGlvbmFsRGF0YSIsInBoZXRpb1N0YXJ0RXZlbnQiLCJkYXRhIiwicGhldGlvSUQiLCJwaGV0aW9FbmRFdmVudCIsImNyZWF0ZWRFdmVudExpc3RlbmVyIiwicGhldGlvU3RhdGUiLCJzdGF0ZSIsInBhcmFtZXRlclR5cGVzIiwidG9TdGF0ZU9iamVjdCIsImRpc3Bvc2VkRXZlbnRMaXN0ZW5lciIsImRpc3Bvc2UiLCJkaXNwb3NlRWxlbWVudCIsImVsZW1lbnQiLCJzdXBwb3J0c0R5bmFtaWNTdGF0ZSIsIm5vdGlmaWNhdGlvbnNEZWZlcnJlZCIsImRlZmVycmVkRGlzcG9zYWxzIiwicHVzaCIsImVsZW1lbnREaXNwb3NlZEVtaXR0ZXIiLCJlbWl0Iiwibm90aWZ5RWxlbWVudERpc3Bvc2VkV2hpbGVEZWZlcnJlZCIsImRpc3Bvc2VkRWxlbWVudCIsImluY2x1ZGVzIiwibm90aWZ5RWxlbWVudENyZWF0ZWQiLCJjcmVhdGVkRWxlbWVudCIsImRlZmVycmVkQ3JlYXRpb25zIiwiZWxlbWVudENyZWF0ZWRFbWl0dGVyIiwibm90aWZ5RWxlbWVudENyZWF0ZWRXaGlsZURlZmVycmVkIiwic2V0Tm90aWZpY2F0aW9uc0RlZmVycmVkIiwiX2FyY2hldHlwZSIsImdldE1ldGFkYXRhIiwib2JqZWN0IiwibWV0YWRhdGEiLCJoYXNPd25Qcm9wZXJ0eSIsInBoZXRpb0R5bmFtaWNFbGVtZW50TmFtZSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJjb250YWluZXJTdWZmaXgiLCJ1bmRlZmluZWQiLCJzdXBwbGllZCIsIm5hbWUiLCJlbmRzV2l0aCIsInNsaWNlIiwicGFyYW1ldGVycyIsInZhbHVlVHlwZSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJhZGRMaXN0ZW5lciIsInBoZXRpb0lzQXJjaGV0eXBlIiwicGhldGlvU3RhdGVFbmdpbmUiLCJwaGV0aW9FbmdpbmUiLCJjbGVhckR5bmFtaWNFbGVtZW50c0VtaXR0ZXIiLCJzY29wZVRhbmRlbSIsImhhc0FuY2VzdG9yIiwiY2xlYXIiLCJ1bmRlZmVyRW1pdHRlciIsImFkZFNldFN0YXRlSGVscGVyIiwiY3JlYXRpb25Ob3RpZmllZCIsIml0ZXJhdGlvbkNvdW50Iiwiam9pbiIsImRlZmVycmVkQ3JlYXRlZEVsZW1lbnQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7OztDQVdDLEdBRUQsT0FBT0EsYUFBYSwyQkFBMkI7QUFFL0MsT0FBT0MsY0FBYyw0QkFBNEI7QUFDakQsT0FBT0MsaUJBQWlCLG9DQUFvQztBQUM1RCxPQUFPQyxXQUFXLDhCQUE4QjtBQUNo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