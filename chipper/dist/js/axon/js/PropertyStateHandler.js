// Copyright 2020-2024, University of Colorado Boulder
/**
 * Responsible for handling Property-specific logic associated with setting PhET-iO state. This file will defer Properties
 * from taking their final value, and notifying on that value until after state has been set on every Property. It is
 * also responsible for keeping track of order dependencies between different Properties, and making sure that undeferral
 * and notifications go out in the appropriate orders. See https://github.com/phetsims/axon/issues/276 for implementation details.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import Tandem from '../../tandem/js/Tandem.js';
import axon from './axon.js';
import PropertyStatePhase from './PropertyStatePhase.js';
import ReadOnlyProperty from './ReadOnlyProperty.js';
let PropertyStateHandler = class PropertyStateHandler {
    initialize(phetioStateEngine) {
        assert && assert(!this.initialized, 'cannot initialize twice');
        phetioStateEngine.onBeforeApplyStateEmitter.addListener((phetioObject)=>{
            // withhold AXON/Property notifications until all values have been set to avoid inconsistent intermediate states,
            // see https://github.com/phetsims/phet-io-wrappers/issues/229
            // only do this if the PhetioObject is already not deferred
            if (phetioObject instanceof ReadOnlyProperty && !phetioObject.isDeferred) {
                phetioObject.setDeferred(true);
                const phetioID = phetioObject.tandem.phetioID;
                const listener = ()=>{
                    const potentialListener = phetioObject.setDeferred(false);
                    // Always add a PhaseCallback so that we can track the order dependency, even though setDeferred can return null.
                    this.phaseCallbackSets.addNotifyPhaseCallback(new PhaseCallback(phetioID, PropertyStatePhase.NOTIFY, potentialListener || _.noop));
                };
                this.phaseCallbackSets.addUndeferPhaseCallback(new PhaseCallback(phetioID, PropertyStatePhase.UNDEFER, listener));
            }
        });
        // It is important that nothing else adds listeners at import time before this. Properties take precedent.
        assert && assert(!phetioStateEngine.undeferEmitter.hasListeners(), 'At this time, we rely on Properties undeferring first.');
        phetioStateEngine.undeferEmitter.addListener((state)=>{
            // Properties set to final values and notify of any value changes.
            this.undeferAndNotifyProperties(new Set(Object.keys(state)));
        });
        phetioStateEngine.isSettingStateProperty.lazyLink((isSettingState)=>{
            assert && !isSettingState && assert(this.phaseCallbackSets.size === 0, 'PhaseCallbacks should have all been applied');
        });
        this.initialized = true;
    }
    static validateInstrumentedProperty(property) {
        assert && Tandem.VALIDATION && assert(property instanceof ReadOnlyProperty && property.isPhetioInstrumented(), `must be an instrumented Property: ${property}`);
    }
    validatePropertyPhasePair(property, phase) {
        PropertyStateHandler.validateInstrumentedProperty(property);
    }
    /**
   * Get the MapPair associated with the proved PropertyStatePhases
   */ getMapPairFromPhases(beforePhase, afterPhase) {
        const matchedPairs = this.mapPairs.filter((mapPair)=>beforePhase === mapPair.beforePhase && afterPhase === mapPair.afterPhase);
        assert && assert(matchedPairs.length === 1, 'one and only one map should match the provided phases');
        return matchedPairs[0];
    }
    /**
   * Register that one Property must have a "Phase" applied for PhET-iO state before another Property's Phase. A Phase
   * is an ending state in PhET-iO state set where Property values solidify, notifications for value changes are called.
   * The PhET-iO state engine will always undefer a Property before it notifies its listeners. This is for registering
   * two different Properties.
   *
   * @param beforeProperty - the Property that needs to be set before the second; must be instrumented for PhET-iO
   * @param beforePhase
   * @param afterProperty - must be instrumented for PhET-iO
   * @param afterPhase
   */ registerPhetioOrderDependency(beforeProperty, beforePhase, afterProperty, afterPhase) {
        if (Tandem.PHET_IO_ENABLED) {
            assert && assert(!(beforePhase === PropertyStatePhase.NOTIFY && afterPhase === PropertyStatePhase.UNDEFER), 'It is PhET-iO policy at this time to have all notifications occur after all state values have been applied.');
            this.validatePropertyPhasePair(beforeProperty, beforePhase);
            this.validatePropertyPhasePair(afterProperty, afterPhase);
            assert && beforeProperty === afterProperty && assert(beforePhase !== afterPhase, 'cannot set same Property to same phase');
            const mapPair = this.getMapPairFromPhases(beforePhase, afterPhase);
            mapPair.addOrderDependency(beforeProperty.tandem.phetioID, afterProperty.tandem.phetioID);
        }
    }
    /**
   * {Property} property - must be instrumented for PhET-iO
   * {boolean} - true if Property is in any order dependency
   */ propertyInAnOrderDependency(property) {
        PropertyStateHandler.validateInstrumentedProperty(property);
        return _.some(this.mapPairs, (mapPair)=>mapPair.usesPhetioID(property.tandem.phetioID));
    }
    /**
   * Unregisters all order dependencies for the given Property
   * {ReadOnlyProperty} property - must be instrumented for PhET-iO
   */ unregisterOrderDependenciesForProperty(property) {
        if (Tandem.PHET_IO_ENABLED) {
            PropertyStateHandler.validateInstrumentedProperty(property);
            // Be graceful if given a Property that is not registered in an order dependency.
            if (this.propertyInAnOrderDependency(property)) {
                assert && assert(this.propertyInAnOrderDependency(property), 'Property must be registered in an order dependency to be unregistered');
                this.mapPairs.forEach((mapPair)=>mapPair.unregisterOrderDependenciesForProperty(property));
            }
        }
    }
    /**
   * Given registered Property Phase order dependencies, undefer all AXON/Property PhET-iO Elements to take their
   * correct values and have each notify their listeners.
   * {Set.<string>} phetioIDsInState - set of phetioIDs that were set in state
   */ undeferAndNotifyProperties(phetioIDsInState) {
        assert && assert(this.initialized, 'must be initialized before getting called');
        // {Object.<string,boolean>} - true if a phetioID + phase pair has been applied, keys are the combination of
        // phetioIDs and phase, see PhaseCallback.getTerm()
        const completedPhases = {};
        // to support failing out instead of infinite loop
        let numberOfIterations = 0;
        // Normally we would like to undefer things before notify, but make sure this is done in accordance with the order dependencies.
        while(this.phaseCallbackSets.size > 0){
            numberOfIterations++;
            // Error case logging
            if (numberOfIterations > 5000) {
                this.errorInUndeferAndNotifyStep(completedPhases);
            }
            // Try to undefer as much as possible before notifying
            this.attemptToApplyPhases(PropertyStatePhase.UNDEFER, completedPhases, phetioIDsInState);
            this.attemptToApplyPhases(PropertyStatePhase.NOTIFY, completedPhases, phetioIDsInState);
        }
    }
    errorInUndeferAndNotifyStep(completedPhases) {
        // combine phetioID and Phase into a single string to keep this process specific.
        const stillToDoIDPhasePairs = [];
        this.phaseCallbackSets.forEach((phaseCallback)=>stillToDoIDPhasePairs.push(phaseCallback.getTerm()));
        const relevantOrderDependencies = [];
        this.mapPairs.forEach((mapPair)=>{
            const beforeMap = mapPair.beforeMap;
            for (const [beforePhetioID, afterPhetioIDs] of beforeMap){
                afterPhetioIDs.forEach((afterPhetioID)=>{
                    const beforeTerm = beforePhetioID + beforeMap.beforePhase;
                    const afterTerm = afterPhetioID + beforeMap.afterPhase;
                    if (stillToDoIDPhasePairs.includes(beforeTerm) || stillToDoIDPhasePairs.includes(afterTerm)) {
                        relevantOrderDependencies.push({
                            beforeTerm: beforeTerm,
                            afterTerm: afterTerm
                        });
                    }
                });
            }
        });
        let string = '';
        console.log('still to be undeferred', this.phaseCallbackSets.undeferSet);
        console.log('still to be notified', this.phaseCallbackSets.notifySet);
        console.log('order dependencies that apply to the still todos', relevantOrderDependencies);
        relevantOrderDependencies.forEach((orderDependency)=>{
            string += `${orderDependency.beforeTerm}\t${orderDependency.afterTerm}\n`;
        });
        console.log('\n\nin graphable form:\n\n', string);
        const assertMessage = 'Impossible set state: from undeferAndNotifyProperties; ordering constraints cannot be satisfied';
        assert && assert(false, assertMessage);
        // We must exit here even if assertions are disabled so it wouldn't lock up the browser.
        if (!assert) {
            throw new Error(assertMessage);
        }
    }
    /**
   * Only for Testing!
   * Get the number of order dependencies registered in this class
   *
   */ getNumberOfOrderDependencies() {
        let count = 0;
        this.mapPairs.forEach((mapPair)=>{
            mapPair.afterMap.forEach((valueSet)=>{
                count += valueSet.size;
            });
        });
        return count;
    }
    /**
   * Go through all phases still to be applied, and apply them if the order dependencies allow it. Only apply for the
   * particular phase provided. In general UNDEFER must occur before the same phetioID gets NOTIFY.
   *
   * @param phase - only apply PhaseCallbacks for this particular PropertyStatePhase
   * @param completedPhases - map that keeps track of completed phases
   * @param phetioIDsInState - set of phetioIDs that were set in state
   */ attemptToApplyPhases(phase, completedPhases, phetioIDsInState) {
        const phaseCallbackSet = this.phaseCallbackSets.getSetFromPhase(phase);
        for (const phaseCallbackToPotentiallyApply of phaseCallbackSet){
            assert && assert(phaseCallbackToPotentiallyApply.phase === phase, 'phaseCallbackSet should only include callbacks for provided phase');
            // only try to check the order dependencies to see if this has to be after something that is incomplete.
            if (this.phetioIDCanApplyPhase(phaseCallbackToPotentiallyApply.phetioID, phase, completedPhases, phetioIDsInState)) {
                // Fire the listener;
                phaseCallbackToPotentiallyApply.listener();
                // Remove it from the main list so that it doesn't get called again.
                phaseCallbackSet.delete(phaseCallbackToPotentiallyApply);
                // Keep track of all completed PhaseCallbacks
                completedPhases[phaseCallbackToPotentiallyApply.getTerm()] = true;
            }
        }
    }
    /**
   * @param phetioID - think of this as the "afterPhetioID" since there may be some phases that need to be applied before it has this phase done.
   * @param phase
   * @param completedPhases - map that keeps track of completed phases
   * @param phetioIDsInState - set of phetioIDs that were set in state
   * @param - if the provided phase can be applied given the dependency order dependencies of the state engine.
   */ phetioIDCanApplyPhase(phetioID, phase, completedPhases, phetioIDsInState) {
        // Undefer must happen before notify
        if (phase === PropertyStatePhase.NOTIFY && !completedPhases[phetioID + PropertyStatePhase.UNDEFER]) {
            return false;
        }
        // Get a list of the maps for this phase being applies.
        const mapsToCheck = [];
        this.mapPairs.forEach((mapPair)=>{
            if (mapPair.afterPhase === phase) {
                // Use the "afterMap" because below looks up what needs to come before.
                mapsToCheck.push(mapPair.afterMap);
            }
        });
        // O(2)
        for(let i = 0; i < mapsToCheck.length; i++){
            const mapToCheck = mapsToCheck[i];
            if (!mapToCheck.has(phetioID)) {
                return true;
            }
            const setOfThingsThatShouldComeFirst = mapToCheck.get(phetioID);
            assert && assert(setOfThingsThatShouldComeFirst, 'must have this set');
            // O(K) where K is the number of elements that should come before Property X
            for (const beforePhetioID of setOfThingsThatShouldComeFirst){
                // check if the before phase for this order dependency has already been completed
                // Make sure that we only care about elements that were actually set during this state set
                if (!completedPhases[beforePhetioID + mapToCheck.beforePhase] && phetioIDsInState.has(beforePhetioID) && phetioIDsInState.has(phetioID)) {
                    return false;
                }
            }
        }
        return true;
    }
    constructor(){
        this.initialized = false;
        // Properties support setDeferred(). We defer setting their values so all changes take effect
        // at once. This keeps track of finalization actions (embodied in a PhaseCallback) that must take place after all
        // Property values have changed. This keeps track of both types of PropertyStatePhase: undeferring and notification.
        this.phaseCallbackSets = new PhaseCallbackSets();
        // each pair has a Map optimized for looking up based on the "before phetioID" and the "after phetioID"
        // of the dependency. Having a data structure set up for both directions of look-up makes each operation O(1). See https://github.com/phetsims/axon/issues/316
        this.undeferBeforeUndeferMapPair = new OrderDependencyMapPair(PropertyStatePhase.UNDEFER, PropertyStatePhase.UNDEFER);
        this.undeferBeforeNotifyMapPair = new OrderDependencyMapPair(PropertyStatePhase.UNDEFER, PropertyStatePhase.NOTIFY);
        this.notifyBeforeUndeferMapPair = new OrderDependencyMapPair(PropertyStatePhase.NOTIFY, PropertyStatePhase.UNDEFER);
        this.notifyBeforeNotifyMapPair = new OrderDependencyMapPair(PropertyStatePhase.NOTIFY, PropertyStatePhase.NOTIFY);
        // keep a list of all map pairs for easier iteration
        this.mapPairs = [
            this.undeferBeforeUndeferMapPair,
            this.undeferBeforeNotifyMapPair,
            this.notifyBeforeUndeferMapPair,
            this.notifyBeforeNotifyMapPair
        ];
    }
};
// POJSO for a callback for a specific Phase in a Property's state set lifecycle. See undeferAndNotifyProperties()
let PhaseCallback = class PhaseCallback {
    /**
   * {string} - unique term for the id/phase pair
   */ getTerm() {
        return this.phetioID + this.phase;
    }
    constructor(phetioID, phase, listener = _.noop){
        this.phetioID = phetioID;
        this.phase = phase;
        this.listener = listener;
    }
};
let OrderDependencyMapPair = class OrderDependencyMapPair {
    /**
   * Register an order dependency between two phetioIDs. This will add data to maps in "both direction". If accessing
   * with just the beforePhetioID, or with the afterPhetioID.
   */ addOrderDependency(beforePhetioID, afterPhetioID) {
        if (!this.beforeMap.has(beforePhetioID)) {
            this.beforeMap.set(beforePhetioID, new Set());
        }
        this.beforeMap.get(beforePhetioID).add(afterPhetioID);
        if (!this.afterMap.has(afterPhetioID)) {
            this.afterMap.set(afterPhetioID, new Set());
        }
        this.afterMap.get(afterPhetioID).add(beforePhetioID);
    }
    /**
   * Unregister all order dependencies for the provided Property
   */ unregisterOrderDependenciesForProperty(property) {
        const phetioIDToRemove = property.tandem.phetioID;
        [
            this.beforeMap,
            this.afterMap
        ].forEach((map)=>{
            map.has(phetioIDToRemove) && map.get(phetioIDToRemove).forEach((phetioID)=>{
                const setOfAfterMapIDs = map.otherMap.get(phetioID);
                setOfAfterMapIDs && setOfAfterMapIDs.delete(phetioIDToRemove);
                // Clear out empty entries to avoid having lots of empty Sets sitting around
                setOfAfterMapIDs.size === 0 && map.otherMap.delete(phetioID);
            });
            map.delete(phetioIDToRemove);
        });
        // Look through every dependency and make sure the phetioID to remove has been completely removed.
        assertSlow && [
            this.beforeMap,
            this.afterMap
        ].forEach((map)=>{
            map.forEach((valuePhetioIDs, key)=>{
                assertSlow && assertSlow(key !== phetioIDToRemove, 'should not be a key');
                assertSlow && assertSlow(!valuePhetioIDs.has(phetioIDToRemove), 'should not be in a value list');
            });
        });
    }
    usesPhetioID(phetioID) {
        return this.beforeMap.has(phetioID) || this.afterMap.has(phetioID);
    }
    constructor(beforePhase, afterPhase){
        // @ts-expect-error, it is easiest to fudge here since we are adding the PhaseMap properties just below here.
        this.beforeMap = new Map();
        this.beforeMap.beforePhase = beforePhase;
        this.beforeMap.afterPhase = afterPhase;
        // @ts-expect-error, it is easiest to fudge here since we are adding the PhaseMap properties just below here.
        this.afterMap = new Map();
        this.afterMap.beforePhase = beforePhase;
        this.afterMap.afterPhase = afterPhase;
        this.beforeMap.otherMap = this.afterMap;
        this.afterMap.otherMap = this.beforeMap;
        this.beforePhase = beforePhase;
        this.afterPhase = afterPhase;
    }
};
// POJSO to keep track of PhaseCallbacks while providing O(1) lookup time because it is built on Set
let PhaseCallbackSets = class PhaseCallbackSets {
    get size() {
        return this.undeferSet.size + this.notifySet.size;
    }
    forEach(callback) {
        this.undeferSet.forEach(callback);
        this.notifySet.forEach(callback);
    }
    addUndeferPhaseCallback(phaseCallback) {
        this.undeferSet.add(phaseCallback);
    }
    addNotifyPhaseCallback(phaseCallback) {
        this.notifySet.add(phaseCallback);
    }
    getSetFromPhase(phase) {
        return phase === PropertyStatePhase.NOTIFY ? this.notifySet : this.undeferSet;
    }
    constructor(){
        this.undeferSet = new Set();
        this.notifySet = new Set();
    }
};
axon.register('PropertyStateHandler', PropertyStateHandler);
export default PropertyStateHandler;
/**
 * Singleton responsible for AXON/Property specific state logic. Use this global for the project to have a single
 * place to tap into the PhetioStateEngine, as well as a single point to register any order dependencies that Properties
 * have between each other when setting their state and applying their values/notifying.
 */ export const propertyStateHandlerSingleton = new PropertyStateHandler();
axon.register('propertyStateHandlerSingleton', propertyStateHandlerSingleton);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHlTdGF0ZUhhbmRsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUmVzcG9uc2libGUgZm9yIGhhbmRsaW5nIFByb3BlcnR5LXNwZWNpZmljIGxvZ2ljIGFzc29jaWF0ZWQgd2l0aCBzZXR0aW5nIFBoRVQtaU8gc3RhdGUuIFRoaXMgZmlsZSB3aWxsIGRlZmVyIFByb3BlcnRpZXNcbiAqIGZyb20gdGFraW5nIHRoZWlyIGZpbmFsIHZhbHVlLCBhbmQgbm90aWZ5aW5nIG9uIHRoYXQgdmFsdWUgdW50aWwgYWZ0ZXIgc3RhdGUgaGFzIGJlZW4gc2V0IG9uIGV2ZXJ5IFByb3BlcnR5LiBJdCBpc1xuICogYWxzbyByZXNwb25zaWJsZSBmb3Iga2VlcGluZyB0cmFjayBvZiBvcmRlciBkZXBlbmRlbmNpZXMgYmV0d2VlbiBkaWZmZXJlbnQgUHJvcGVydGllcywgYW5kIG1ha2luZyBzdXJlIHRoYXQgdW5kZWZlcnJhbFxuICogYW5kIG5vdGlmaWNhdGlvbnMgZ28gb3V0IGluIHRoZSBhcHByb3ByaWF0ZSBvcmRlcnMuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXhvbi9pc3N1ZXMvMjc2IGZvciBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLlxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcbmltcG9ydCB7IFBoZXRpb0lEIH0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3BoZXQtaW8tdHlwZXMuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCB7IFRQaGV0aW9TdGF0ZUVuZ2luZSB9IGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UUGhldGlvU3RhdGVFbmdpbmUuanMnO1xuaW1wb3J0IGF4b24gZnJvbSAnLi9heG9uLmpzJztcbmltcG9ydCBQcm9wZXJ0eVN0YXRlUGhhc2UgZnJvbSAnLi9Qcm9wZXJ0eVN0YXRlUGhhc2UuanMnO1xuaW1wb3J0IFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi9SZWFkT25seVByb3BlcnR5LmpzJztcblxudHlwZSBQaGFzZU1hcCA9IHtcbiAgYmVmb3JlUGhhc2U6IFByb3BlcnR5U3RhdGVQaGFzZTtcbiAgYWZ0ZXJQaGFzZTogUHJvcGVydHlTdGF0ZVBoYXNlO1xuICBvdGhlck1hcDogUGhhc2VNYXA7XG59ICYgTWFwPHN0cmluZywgU2V0PHN0cmluZz4+O1xuXG50eXBlIE9yZGVyRGVwZW5kZW5jeSA9IHtcbiAgYmVmb3JlVGVybTogc3RyaW5nO1xuICBhZnRlclRlcm06IHN0cmluZztcbn07XG5cbmNsYXNzIFByb3BlcnR5U3RhdGVIYW5kbGVyIHtcbiAgcHJpdmF0ZSByZWFkb25seSBwaGFzZUNhbGxiYWNrU2V0czogUGhhc2VDYWxsYmFja1NldHM7XG4gIHByaXZhdGUgcmVhZG9ubHkgdW5kZWZlckJlZm9yZVVuZGVmZXJNYXBQYWlyOiBPcmRlckRlcGVuZGVuY3lNYXBQYWlyO1xuICBwcml2YXRlIHJlYWRvbmx5IHVuZGVmZXJCZWZvcmVOb3RpZnlNYXBQYWlyOiBPcmRlckRlcGVuZGVuY3lNYXBQYWlyO1xuICBwcml2YXRlIHJlYWRvbmx5IG5vdGlmeUJlZm9yZVVuZGVmZXJNYXBQYWlyOiBPcmRlckRlcGVuZGVuY3lNYXBQYWlyO1xuICBwcml2YXRlIHJlYWRvbmx5IG5vdGlmeUJlZm9yZU5vdGlmeU1hcFBhaXI6IE9yZGVyRGVwZW5kZW5jeU1hcFBhaXI7XG4gIHByaXZhdGUgcmVhZG9ubHkgbWFwUGFpcnM6IE9yZGVyRGVwZW5kZW5jeU1hcFBhaXJbXTtcbiAgcHJpdmF0ZSBpbml0aWFsaXplZCA9IGZhbHNlO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcblxuICAgIC8vIFByb3BlcnRpZXMgc3VwcG9ydCBzZXREZWZlcnJlZCgpLiBXZSBkZWZlciBzZXR0aW5nIHRoZWlyIHZhbHVlcyBzbyBhbGwgY2hhbmdlcyB0YWtlIGVmZmVjdFxuICAgIC8vIGF0IG9uY2UuIFRoaXMga2VlcHMgdHJhY2sgb2YgZmluYWxpemF0aW9uIGFjdGlvbnMgKGVtYm9kaWVkIGluIGEgUGhhc2VDYWxsYmFjaykgdGhhdCBtdXN0IHRha2UgcGxhY2UgYWZ0ZXIgYWxsXG4gICAgLy8gUHJvcGVydHkgdmFsdWVzIGhhdmUgY2hhbmdlZC4gVGhpcyBrZWVwcyB0cmFjayBvZiBib3RoIHR5cGVzIG9mIFByb3BlcnR5U3RhdGVQaGFzZTogdW5kZWZlcnJpbmcgYW5kIG5vdGlmaWNhdGlvbi5cbiAgICB0aGlzLnBoYXNlQ2FsbGJhY2tTZXRzID0gbmV3IFBoYXNlQ2FsbGJhY2tTZXRzKCk7XG5cbiAgICAvLyBlYWNoIHBhaXIgaGFzIGEgTWFwIG9wdGltaXplZCBmb3IgbG9va2luZyB1cCBiYXNlZCBvbiB0aGUgXCJiZWZvcmUgcGhldGlvSURcIiBhbmQgdGhlIFwiYWZ0ZXIgcGhldGlvSURcIlxuICAgIC8vIG9mIHRoZSBkZXBlbmRlbmN5LiBIYXZpbmcgYSBkYXRhIHN0cnVjdHVyZSBzZXQgdXAgZm9yIGJvdGggZGlyZWN0aW9ucyBvZiBsb29rLXVwIG1ha2VzIGVhY2ggb3BlcmF0aW9uIE8oMSkuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXhvbi9pc3N1ZXMvMzE2XG4gICAgdGhpcy51bmRlZmVyQmVmb3JlVW5kZWZlck1hcFBhaXIgPSBuZXcgT3JkZXJEZXBlbmRlbmN5TWFwUGFpciggUHJvcGVydHlTdGF0ZVBoYXNlLlVOREVGRVIsIFByb3BlcnR5U3RhdGVQaGFzZS5VTkRFRkVSICk7XG4gICAgdGhpcy51bmRlZmVyQmVmb3JlTm90aWZ5TWFwUGFpciA9IG5ldyBPcmRlckRlcGVuZGVuY3lNYXBQYWlyKCBQcm9wZXJ0eVN0YXRlUGhhc2UuVU5ERUZFUiwgUHJvcGVydHlTdGF0ZVBoYXNlLk5PVElGWSApO1xuICAgIHRoaXMubm90aWZ5QmVmb3JlVW5kZWZlck1hcFBhaXIgPSBuZXcgT3JkZXJEZXBlbmRlbmN5TWFwUGFpciggUHJvcGVydHlTdGF0ZVBoYXNlLk5PVElGWSwgUHJvcGVydHlTdGF0ZVBoYXNlLlVOREVGRVIgKTtcbiAgICB0aGlzLm5vdGlmeUJlZm9yZU5vdGlmeU1hcFBhaXIgPSBuZXcgT3JkZXJEZXBlbmRlbmN5TWFwUGFpciggUHJvcGVydHlTdGF0ZVBoYXNlLk5PVElGWSwgUHJvcGVydHlTdGF0ZVBoYXNlLk5PVElGWSApO1xuXG4gICAgLy8ga2VlcCBhIGxpc3Qgb2YgYWxsIG1hcCBwYWlycyBmb3IgZWFzaWVyIGl0ZXJhdGlvblxuICAgIHRoaXMubWFwUGFpcnMgPSBbXG4gICAgICB0aGlzLnVuZGVmZXJCZWZvcmVVbmRlZmVyTWFwUGFpcixcbiAgICAgIHRoaXMudW5kZWZlckJlZm9yZU5vdGlmeU1hcFBhaXIsXG4gICAgICB0aGlzLm5vdGlmeUJlZm9yZVVuZGVmZXJNYXBQYWlyLFxuICAgICAgdGhpcy5ub3RpZnlCZWZvcmVOb3RpZnlNYXBQYWlyXG4gICAgXTtcbiAgfVxuXG4gIHB1YmxpYyBpbml0aWFsaXplKCBwaGV0aW9TdGF0ZUVuZ2luZTogVFBoZXRpb1N0YXRlRW5naW5lICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmluaXRpYWxpemVkLCAnY2Fubm90IGluaXRpYWxpemUgdHdpY2UnICk7XG5cbiAgICBwaGV0aW9TdGF0ZUVuZ2luZS5vbkJlZm9yZUFwcGx5U3RhdGVFbWl0dGVyLmFkZExpc3RlbmVyKCBwaGV0aW9PYmplY3QgPT4ge1xuXG4gICAgICAvLyB3aXRoaG9sZCBBWE9OL1Byb3BlcnR5IG5vdGlmaWNhdGlvbnMgdW50aWwgYWxsIHZhbHVlcyBoYXZlIGJlZW4gc2V0IHRvIGF2b2lkIGluY29uc2lzdGVudCBpbnRlcm1lZGlhdGUgc3RhdGVzLFxuICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvLXdyYXBwZXJzL2lzc3Vlcy8yMjlcbiAgICAgIC8vIG9ubHkgZG8gdGhpcyBpZiB0aGUgUGhldGlvT2JqZWN0IGlzIGFscmVhZHkgbm90IGRlZmVycmVkXG4gICAgICBpZiAoIHBoZXRpb09iamVjdCBpbnN0YW5jZW9mIFJlYWRPbmx5UHJvcGVydHkgJiYgIXBoZXRpb09iamVjdC5pc0RlZmVycmVkICkge1xuICAgICAgICBwaGV0aW9PYmplY3Quc2V0RGVmZXJyZWQoIHRydWUgKTtcbiAgICAgICAgY29uc3QgcGhldGlvSUQgPSBwaGV0aW9PYmplY3QudGFuZGVtLnBoZXRpb0lEO1xuXG4gICAgICAgIGNvbnN0IGxpc3RlbmVyID0gKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHBvdGVudGlhbExpc3RlbmVyID0gcGhldGlvT2JqZWN0LnNldERlZmVycmVkKCBmYWxzZSApO1xuXG4gICAgICAgICAgLy8gQWx3YXlzIGFkZCBhIFBoYXNlQ2FsbGJhY2sgc28gdGhhdCB3ZSBjYW4gdHJhY2sgdGhlIG9yZGVyIGRlcGVuZGVuY3ksIGV2ZW4gdGhvdWdoIHNldERlZmVycmVkIGNhbiByZXR1cm4gbnVsbC5cbiAgICAgICAgICB0aGlzLnBoYXNlQ2FsbGJhY2tTZXRzLmFkZE5vdGlmeVBoYXNlQ2FsbGJhY2soIG5ldyBQaGFzZUNhbGxiYWNrKCBwaGV0aW9JRCwgUHJvcGVydHlTdGF0ZVBoYXNlLk5PVElGWSwgcG90ZW50aWFsTGlzdGVuZXIgfHwgXy5ub29wICkgKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5waGFzZUNhbGxiYWNrU2V0cy5hZGRVbmRlZmVyUGhhc2VDYWxsYmFjayggbmV3IFBoYXNlQ2FsbGJhY2soIHBoZXRpb0lELCBQcm9wZXJ0eVN0YXRlUGhhc2UuVU5ERUZFUiwgbGlzdGVuZXIgKSApO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIC8vIEl0IGlzIGltcG9ydGFudCB0aGF0IG5vdGhpbmcgZWxzZSBhZGRzIGxpc3RlbmVycyBhdCBpbXBvcnQgdGltZSBiZWZvcmUgdGhpcy4gUHJvcGVydGllcyB0YWtlIHByZWNlZGVudC5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhcGhldGlvU3RhdGVFbmdpbmUudW5kZWZlckVtaXR0ZXIuaGFzTGlzdGVuZXJzKCksICdBdCB0aGlzIHRpbWUsIHdlIHJlbHkgb24gUHJvcGVydGllcyB1bmRlZmVycmluZyBmaXJzdC4nICk7XG5cbiAgICBwaGV0aW9TdGF0ZUVuZ2luZS51bmRlZmVyRW1pdHRlci5hZGRMaXN0ZW5lciggc3RhdGUgPT4ge1xuXG4gICAgICAvLyBQcm9wZXJ0aWVzIHNldCB0byBmaW5hbCB2YWx1ZXMgYW5kIG5vdGlmeSBvZiBhbnkgdmFsdWUgY2hhbmdlcy5cbiAgICAgIHRoaXMudW5kZWZlckFuZE5vdGlmeVByb3BlcnRpZXMoIG5ldyBTZXQoIE9iamVjdC5rZXlzKCBzdGF0ZSApICkgKTtcbiAgICB9ICk7XG5cbiAgICBwaGV0aW9TdGF0ZUVuZ2luZS5pc1NldHRpbmdTdGF0ZVByb3BlcnR5LmxhenlMaW5rKCBpc1NldHRpbmdTdGF0ZSA9PiB7XG4gICAgICBhc3NlcnQgJiYgIWlzU2V0dGluZ1N0YXRlICYmIGFzc2VydCggdGhpcy5waGFzZUNhbGxiYWNrU2V0cy5zaXplID09PSAwLCAnUGhhc2VDYWxsYmFja3Mgc2hvdWxkIGhhdmUgYWxsIGJlZW4gYXBwbGllZCcgKTtcbiAgICB9ICk7XG5cbiAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIHZhbGlkYXRlSW5zdHJ1bWVudGVkUHJvcGVydHkoIHByb3BlcnR5OiBSZWFkT25seVByb3BlcnR5PHVua25vd24+ICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBUYW5kZW0uVkFMSURBVElPTiAmJiBhc3NlcnQoIHByb3BlcnR5IGluc3RhbmNlb2YgUmVhZE9ubHlQcm9wZXJ0eSAmJiBwcm9wZXJ0eS5pc1BoZXRpb0luc3RydW1lbnRlZCgpLCBgbXVzdCBiZSBhbiBpbnN0cnVtZW50ZWQgUHJvcGVydHk6ICR7cHJvcGVydHl9YCApO1xuICB9XG5cbiAgcHJpdmF0ZSB2YWxpZGF0ZVByb3BlcnR5UGhhc2VQYWlyKCBwcm9wZXJ0eTogUmVhZE9ubHlQcm9wZXJ0eTx1bmtub3duPiwgcGhhc2U6IFByb3BlcnR5U3RhdGVQaGFzZSApOiB2b2lkIHtcbiAgICBQcm9wZXJ0eVN0YXRlSGFuZGxlci52YWxpZGF0ZUluc3RydW1lbnRlZFByb3BlcnR5KCBwcm9wZXJ0eSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgTWFwUGFpciBhc3NvY2lhdGVkIHdpdGggdGhlIHByb3ZlZCBQcm9wZXJ0eVN0YXRlUGhhc2VzXG4gICAqL1xuICBwcml2YXRlIGdldE1hcFBhaXJGcm9tUGhhc2VzKCBiZWZvcmVQaGFzZTogUHJvcGVydHlTdGF0ZVBoYXNlLCBhZnRlclBoYXNlOiBQcm9wZXJ0eVN0YXRlUGhhc2UgKTogT3JkZXJEZXBlbmRlbmN5TWFwUGFpciB7XG4gICAgY29uc3QgbWF0Y2hlZFBhaXJzID0gdGhpcy5tYXBQYWlycy5maWx0ZXIoIG1hcFBhaXIgPT4gYmVmb3JlUGhhc2UgPT09IG1hcFBhaXIuYmVmb3JlUGhhc2UgJiYgYWZ0ZXJQaGFzZSA9PT0gbWFwUGFpci5hZnRlclBoYXNlICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWF0Y2hlZFBhaXJzLmxlbmd0aCA9PT0gMSwgJ29uZSBhbmQgb25seSBvbmUgbWFwIHNob3VsZCBtYXRjaCB0aGUgcHJvdmlkZWQgcGhhc2VzJyApO1xuICAgIHJldHVybiBtYXRjaGVkUGFpcnNbIDAgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciB0aGF0IG9uZSBQcm9wZXJ0eSBtdXN0IGhhdmUgYSBcIlBoYXNlXCIgYXBwbGllZCBmb3IgUGhFVC1pTyBzdGF0ZSBiZWZvcmUgYW5vdGhlciBQcm9wZXJ0eSdzIFBoYXNlLiBBIFBoYXNlXG4gICAqIGlzIGFuIGVuZGluZyBzdGF0ZSBpbiBQaEVULWlPIHN0YXRlIHNldCB3aGVyZSBQcm9wZXJ0eSB2YWx1ZXMgc29saWRpZnksIG5vdGlmaWNhdGlvbnMgZm9yIHZhbHVlIGNoYW5nZXMgYXJlIGNhbGxlZC5cbiAgICogVGhlIFBoRVQtaU8gc3RhdGUgZW5naW5lIHdpbGwgYWx3YXlzIHVuZGVmZXIgYSBQcm9wZXJ0eSBiZWZvcmUgaXQgbm90aWZpZXMgaXRzIGxpc3RlbmVycy4gVGhpcyBpcyBmb3IgcmVnaXN0ZXJpbmdcbiAgICogdHdvIGRpZmZlcmVudCBQcm9wZXJ0aWVzLlxuICAgKlxuICAgKiBAcGFyYW0gYmVmb3JlUHJvcGVydHkgLSB0aGUgUHJvcGVydHkgdGhhdCBuZWVkcyB0byBiZSBzZXQgYmVmb3JlIHRoZSBzZWNvbmQ7IG11c3QgYmUgaW5zdHJ1bWVudGVkIGZvciBQaEVULWlPXG4gICAqIEBwYXJhbSBiZWZvcmVQaGFzZVxuICAgKiBAcGFyYW0gYWZ0ZXJQcm9wZXJ0eSAtIG11c3QgYmUgaW5zdHJ1bWVudGVkIGZvciBQaEVULWlPXG4gICAqIEBwYXJhbSBhZnRlclBoYXNlXG4gICAqL1xuICBwdWJsaWMgcmVnaXN0ZXJQaGV0aW9PcmRlckRlcGVuZGVuY3koIGJlZm9yZVByb3BlcnR5OiBSZWFkT25seVByb3BlcnR5PEludGVudGlvbmFsQW55PixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZWZvcmVQaGFzZTogUHJvcGVydHlTdGF0ZVBoYXNlLCBhZnRlclByb3BlcnR5OiBSZWFkT25seVByb3BlcnR5PEludGVudGlvbmFsQW55PixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZnRlclBoYXNlOiBQcm9wZXJ0eVN0YXRlUGhhc2UgKTogdm9pZCB7XG4gICAgaWYgKCBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggISggYmVmb3JlUGhhc2UgPT09IFByb3BlcnR5U3RhdGVQaGFzZS5OT1RJRlkgJiYgYWZ0ZXJQaGFzZSA9PT0gUHJvcGVydHlTdGF0ZVBoYXNlLlVOREVGRVIgKSxcbiAgICAgICAgJ0l0IGlzIFBoRVQtaU8gcG9saWN5IGF0IHRoaXMgdGltZSB0byBoYXZlIGFsbCBub3RpZmljYXRpb25zIG9jY3VyIGFmdGVyIGFsbCBzdGF0ZSB2YWx1ZXMgaGF2ZSBiZWVuIGFwcGxpZWQuJyApO1xuXG4gICAgICB0aGlzLnZhbGlkYXRlUHJvcGVydHlQaGFzZVBhaXIoIGJlZm9yZVByb3BlcnR5LCBiZWZvcmVQaGFzZSApO1xuICAgICAgdGhpcy52YWxpZGF0ZVByb3BlcnR5UGhhc2VQYWlyKCBhZnRlclByb3BlcnR5LCBhZnRlclBoYXNlICk7XG4gICAgICBhc3NlcnQgJiYgYmVmb3JlUHJvcGVydHkgPT09IGFmdGVyUHJvcGVydHkgJiYgYXNzZXJ0KCBiZWZvcmVQaGFzZSAhPT0gYWZ0ZXJQaGFzZSwgJ2Nhbm5vdCBzZXQgc2FtZSBQcm9wZXJ0eSB0byBzYW1lIHBoYXNlJyApO1xuXG4gICAgICBjb25zdCBtYXBQYWlyID0gdGhpcy5nZXRNYXBQYWlyRnJvbVBoYXNlcyggYmVmb3JlUGhhc2UsIGFmdGVyUGhhc2UgKTtcblxuICAgICAgbWFwUGFpci5hZGRPcmRlckRlcGVuZGVuY3koIGJlZm9yZVByb3BlcnR5LnRhbmRlbS5waGV0aW9JRCwgYWZ0ZXJQcm9wZXJ0eS50YW5kZW0ucGhldGlvSUQgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICoge1Byb3BlcnR5fSBwcm9wZXJ0eSAtIG11c3QgYmUgaW5zdHJ1bWVudGVkIGZvciBQaEVULWlPXG4gICAqIHtib29sZWFufSAtIHRydWUgaWYgUHJvcGVydHkgaXMgaW4gYW55IG9yZGVyIGRlcGVuZGVuY3lcbiAgICovXG4gIHByaXZhdGUgcHJvcGVydHlJbkFuT3JkZXJEZXBlbmRlbmN5KCBwcm9wZXJ0eTogUmVhZE9ubHlQcm9wZXJ0eTx1bmtub3duPiApOiBib29sZWFuIHtcbiAgICBQcm9wZXJ0eVN0YXRlSGFuZGxlci52YWxpZGF0ZUluc3RydW1lbnRlZFByb3BlcnR5KCBwcm9wZXJ0eSApO1xuICAgIHJldHVybiBfLnNvbWUoIHRoaXMubWFwUGFpcnMsIG1hcFBhaXIgPT4gbWFwUGFpci51c2VzUGhldGlvSUQoIHByb3BlcnR5LnRhbmRlbS5waGV0aW9JRCApICk7XG4gIH1cblxuICAvKipcbiAgICogVW5yZWdpc3RlcnMgYWxsIG9yZGVyIGRlcGVuZGVuY2llcyBmb3IgdGhlIGdpdmVuIFByb3BlcnR5XG4gICAqIHtSZWFkT25seVByb3BlcnR5fSBwcm9wZXJ0eSAtIG11c3QgYmUgaW5zdHJ1bWVudGVkIGZvciBQaEVULWlPXG4gICAqL1xuICBwdWJsaWMgdW5yZWdpc3Rlck9yZGVyRGVwZW5kZW5jaWVzRm9yUHJvcGVydHkoIHByb3BlcnR5OiBSZWFkT25seVByb3BlcnR5PEludGVudGlvbmFsQW55PiApOiB2b2lkIHtcbiAgICBpZiAoIFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgKSB7XG4gICAgICBQcm9wZXJ0eVN0YXRlSGFuZGxlci52YWxpZGF0ZUluc3RydW1lbnRlZFByb3BlcnR5KCBwcm9wZXJ0eSApO1xuXG4gICAgICAvLyBCZSBncmFjZWZ1bCBpZiBnaXZlbiBhIFByb3BlcnR5IHRoYXQgaXMgbm90IHJlZ2lzdGVyZWQgaW4gYW4gb3JkZXIgZGVwZW5kZW5jeS5cbiAgICAgIGlmICggdGhpcy5wcm9wZXJ0eUluQW5PcmRlckRlcGVuZGVuY3koIHByb3BlcnR5ICkgKSB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucHJvcGVydHlJbkFuT3JkZXJEZXBlbmRlbmN5KCBwcm9wZXJ0eSApLCAnUHJvcGVydHkgbXVzdCBiZSByZWdpc3RlcmVkIGluIGFuIG9yZGVyIGRlcGVuZGVuY3kgdG8gYmUgdW5yZWdpc3RlcmVkJyApO1xuXG4gICAgICAgIHRoaXMubWFwUGFpcnMuZm9yRWFjaCggbWFwUGFpciA9PiBtYXBQYWlyLnVucmVnaXN0ZXJPcmRlckRlcGVuZGVuY2llc0ZvclByb3BlcnR5KCBwcm9wZXJ0eSApICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIHJlZ2lzdGVyZWQgUHJvcGVydHkgUGhhc2Ugb3JkZXIgZGVwZW5kZW5jaWVzLCB1bmRlZmVyIGFsbCBBWE9OL1Byb3BlcnR5IFBoRVQtaU8gRWxlbWVudHMgdG8gdGFrZSB0aGVpclxuICAgKiBjb3JyZWN0IHZhbHVlcyBhbmQgaGF2ZSBlYWNoIG5vdGlmeSB0aGVpciBsaXN0ZW5lcnMuXG4gICAqIHtTZXQuPHN0cmluZz59IHBoZXRpb0lEc0luU3RhdGUgLSBzZXQgb2YgcGhldGlvSURzIHRoYXQgd2VyZSBzZXQgaW4gc3RhdGVcbiAgICovXG4gIHByaXZhdGUgdW5kZWZlckFuZE5vdGlmeVByb3BlcnRpZXMoIHBoZXRpb0lEc0luU3RhdGU6IFNldDxzdHJpbmc+ICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaW5pdGlhbGl6ZWQsICdtdXN0IGJlIGluaXRpYWxpemVkIGJlZm9yZSBnZXR0aW5nIGNhbGxlZCcgKTtcblxuICAgIC8vIHtPYmplY3QuPHN0cmluZyxib29sZWFuPn0gLSB0cnVlIGlmIGEgcGhldGlvSUQgKyBwaGFzZSBwYWlyIGhhcyBiZWVuIGFwcGxpZWQsIGtleXMgYXJlIHRoZSBjb21iaW5hdGlvbiBvZlxuICAgIC8vIHBoZXRpb0lEcyBhbmQgcGhhc2UsIHNlZSBQaGFzZUNhbGxiYWNrLmdldFRlcm0oKVxuICAgIGNvbnN0IGNvbXBsZXRlZFBoYXNlcyA9IHt9O1xuXG4gICAgLy8gdG8gc3VwcG9ydCBmYWlsaW5nIG91dCBpbnN0ZWFkIG9mIGluZmluaXRlIGxvb3BcbiAgICBsZXQgbnVtYmVyT2ZJdGVyYXRpb25zID0gMDtcblxuICAgIC8vIE5vcm1hbGx5IHdlIHdvdWxkIGxpa2UgdG8gdW5kZWZlciB0aGluZ3MgYmVmb3JlIG5vdGlmeSwgYnV0IG1ha2Ugc3VyZSB0aGlzIGlzIGRvbmUgaW4gYWNjb3JkYW5jZSB3aXRoIHRoZSBvcmRlciBkZXBlbmRlbmNpZXMuXG4gICAgd2hpbGUgKCB0aGlzLnBoYXNlQ2FsbGJhY2tTZXRzLnNpemUgPiAwICkge1xuICAgICAgbnVtYmVyT2ZJdGVyYXRpb25zKys7XG5cbiAgICAgIC8vIEVycm9yIGNhc2UgbG9nZ2luZ1xuICAgICAgaWYgKCBudW1iZXJPZkl0ZXJhdGlvbnMgPiA1MDAwICkge1xuICAgICAgICB0aGlzLmVycm9ySW5VbmRlZmVyQW5kTm90aWZ5U3RlcCggY29tcGxldGVkUGhhc2VzICk7XG4gICAgICB9XG5cbiAgICAgIC8vIFRyeSB0byB1bmRlZmVyIGFzIG11Y2ggYXMgcG9zc2libGUgYmVmb3JlIG5vdGlmeWluZ1xuICAgICAgdGhpcy5hdHRlbXB0VG9BcHBseVBoYXNlcyggUHJvcGVydHlTdGF0ZVBoYXNlLlVOREVGRVIsIGNvbXBsZXRlZFBoYXNlcywgcGhldGlvSURzSW5TdGF0ZSApO1xuICAgICAgdGhpcy5hdHRlbXB0VG9BcHBseVBoYXNlcyggUHJvcGVydHlTdGF0ZVBoYXNlLk5PVElGWSwgY29tcGxldGVkUGhhc2VzLCBwaGV0aW9JRHNJblN0YXRlICk7XG4gICAgfVxuICB9XG5cblxuICBwcml2YXRlIGVycm9ySW5VbmRlZmVyQW5kTm90aWZ5U3RlcCggY29tcGxldGVkUGhhc2VzOiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPiApOiB2b2lkIHtcblxuICAgIC8vIGNvbWJpbmUgcGhldGlvSUQgYW5kIFBoYXNlIGludG8gYSBzaW5nbGUgc3RyaW5nIHRvIGtlZXAgdGhpcyBwcm9jZXNzIHNwZWNpZmljLlxuICAgIGNvbnN0IHN0aWxsVG9Eb0lEUGhhc2VQYWlyczogQXJyYXk8c3RyaW5nPiA9IFtdO1xuICAgIHRoaXMucGhhc2VDYWxsYmFja1NldHMuZm9yRWFjaCggcGhhc2VDYWxsYmFjayA9PiBzdGlsbFRvRG9JRFBoYXNlUGFpcnMucHVzaCggcGhhc2VDYWxsYmFjay5nZXRUZXJtKCkgKSApO1xuXG4gICAgY29uc3QgcmVsZXZhbnRPcmRlckRlcGVuZGVuY2llczogQXJyYXk8T3JkZXJEZXBlbmRlbmN5PiA9IFtdO1xuXG4gICAgdGhpcy5tYXBQYWlycy5mb3JFYWNoKCBtYXBQYWlyID0+IHtcbiAgICAgIGNvbnN0IGJlZm9yZU1hcCA9IG1hcFBhaXIuYmVmb3JlTWFwO1xuICAgICAgZm9yICggY29uc3QgWyBiZWZvcmVQaGV0aW9JRCwgYWZ0ZXJQaGV0aW9JRHMgXSBvZiBiZWZvcmVNYXAgKSB7XG4gICAgICAgIGFmdGVyUGhldGlvSURzLmZvckVhY2goIGFmdGVyUGhldGlvSUQgPT4ge1xuICAgICAgICAgIGNvbnN0IGJlZm9yZVRlcm0gPSBiZWZvcmVQaGV0aW9JRCArIGJlZm9yZU1hcC5iZWZvcmVQaGFzZTtcbiAgICAgICAgICBjb25zdCBhZnRlclRlcm0gPSBhZnRlclBoZXRpb0lEICsgYmVmb3JlTWFwLmFmdGVyUGhhc2U7XG4gICAgICAgICAgaWYgKCBzdGlsbFRvRG9JRFBoYXNlUGFpcnMuaW5jbHVkZXMoIGJlZm9yZVRlcm0gKSB8fCBzdGlsbFRvRG9JRFBoYXNlUGFpcnMuaW5jbHVkZXMoIGFmdGVyVGVybSApICkge1xuICAgICAgICAgICAgcmVsZXZhbnRPcmRlckRlcGVuZGVuY2llcy5wdXNoKCB7XG4gICAgICAgICAgICAgIGJlZm9yZVRlcm06IGJlZm9yZVRlcm0sXG4gICAgICAgICAgICAgIGFmdGVyVGVybTogYWZ0ZXJUZXJtXG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgfVxuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgbGV0IHN0cmluZyA9ICcnO1xuICAgIGNvbnNvbGUubG9nKCAnc3RpbGwgdG8gYmUgdW5kZWZlcnJlZCcsIHRoaXMucGhhc2VDYWxsYmFja1NldHMudW5kZWZlclNldCApO1xuICAgIGNvbnNvbGUubG9nKCAnc3RpbGwgdG8gYmUgbm90aWZpZWQnLCB0aGlzLnBoYXNlQ2FsbGJhY2tTZXRzLm5vdGlmeVNldCApO1xuICAgIGNvbnNvbGUubG9nKCAnb3JkZXIgZGVwZW5kZW5jaWVzIHRoYXQgYXBwbHkgdG8gdGhlIHN0aWxsIHRvZG9zJywgcmVsZXZhbnRPcmRlckRlcGVuZGVuY2llcyApO1xuICAgIHJlbGV2YW50T3JkZXJEZXBlbmRlbmNpZXMuZm9yRWFjaCggb3JkZXJEZXBlbmRlbmN5ID0+IHtcbiAgICAgIHN0cmluZyArPSBgJHtvcmRlckRlcGVuZGVuY3kuYmVmb3JlVGVybX1cXHQke29yZGVyRGVwZW5kZW5jeS5hZnRlclRlcm19XFxuYDtcbiAgICB9ICk7XG4gICAgY29uc29sZS5sb2coICdcXG5cXG5pbiBncmFwaGFibGUgZm9ybTpcXG5cXG4nLCBzdHJpbmcgKTtcblxuICAgIGNvbnN0IGFzc2VydE1lc3NhZ2UgPSAnSW1wb3NzaWJsZSBzZXQgc3RhdGU6IGZyb20gdW5kZWZlckFuZE5vdGlmeVByb3BlcnRpZXM7IG9yZGVyaW5nIGNvbnN0cmFpbnRzIGNhbm5vdCBiZSBzYXRpc2ZpZWQnO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCBhc3NlcnRNZXNzYWdlICk7XG5cbiAgICAvLyBXZSBtdXN0IGV4aXQgaGVyZSBldmVuIGlmIGFzc2VydGlvbnMgYXJlIGRpc2FibGVkIHNvIGl0IHdvdWxkbid0IGxvY2sgdXAgdGhlIGJyb3dzZXIuXG4gICAgaWYgKCAhYXNzZXJ0ICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCBhc3NlcnRNZXNzYWdlICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE9ubHkgZm9yIFRlc3RpbmchXG4gICAqIEdldCB0aGUgbnVtYmVyIG9mIG9yZGVyIGRlcGVuZGVuY2llcyByZWdpc3RlcmVkIGluIHRoaXMgY2xhc3NcbiAgICpcbiAgICovXG4gIHB1YmxpYyBnZXROdW1iZXJPZk9yZGVyRGVwZW5kZW5jaWVzKCk6IG51bWJlciB7XG4gICAgbGV0IGNvdW50ID0gMDtcbiAgICB0aGlzLm1hcFBhaXJzLmZvckVhY2goIG1hcFBhaXIgPT4ge1xuICAgICAgbWFwUGFpci5hZnRlck1hcC5mb3JFYWNoKCB2YWx1ZVNldCA9PiB7IGNvdW50ICs9IHZhbHVlU2V0LnNpemU7IH0gKTtcbiAgICB9ICk7XG4gICAgcmV0dXJuIGNvdW50O1xuICB9XG5cbiAgLyoqXG4gICAqIEdvIHRocm91Z2ggYWxsIHBoYXNlcyBzdGlsbCB0byBiZSBhcHBsaWVkLCBhbmQgYXBwbHkgdGhlbSBpZiB0aGUgb3JkZXIgZGVwZW5kZW5jaWVzIGFsbG93IGl0LiBPbmx5IGFwcGx5IGZvciB0aGVcbiAgICogcGFydGljdWxhciBwaGFzZSBwcm92aWRlZC4gSW4gZ2VuZXJhbCBVTkRFRkVSIG11c3Qgb2NjdXIgYmVmb3JlIHRoZSBzYW1lIHBoZXRpb0lEIGdldHMgTk9USUZZLlxuICAgKlxuICAgKiBAcGFyYW0gcGhhc2UgLSBvbmx5IGFwcGx5IFBoYXNlQ2FsbGJhY2tzIGZvciB0aGlzIHBhcnRpY3VsYXIgUHJvcGVydHlTdGF0ZVBoYXNlXG4gICAqIEBwYXJhbSBjb21wbGV0ZWRQaGFzZXMgLSBtYXAgdGhhdCBrZWVwcyB0cmFjayBvZiBjb21wbGV0ZWQgcGhhc2VzXG4gICAqIEBwYXJhbSBwaGV0aW9JRHNJblN0YXRlIC0gc2V0IG9mIHBoZXRpb0lEcyB0aGF0IHdlcmUgc2V0IGluIHN0YXRlXG4gICAqL1xuICBwcml2YXRlIGF0dGVtcHRUb0FwcGx5UGhhc2VzKCBwaGFzZTogUHJvcGVydHlTdGF0ZVBoYXNlLCBjb21wbGV0ZWRQaGFzZXM6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+LCBwaGV0aW9JRHNJblN0YXRlOiBTZXQ8c3RyaW5nPiApOiB2b2lkIHtcblxuICAgIGNvbnN0IHBoYXNlQ2FsbGJhY2tTZXQgPSB0aGlzLnBoYXNlQ2FsbGJhY2tTZXRzLmdldFNldEZyb21QaGFzZSggcGhhc2UgKTtcblxuICAgIGZvciAoIGNvbnN0IHBoYXNlQ2FsbGJhY2tUb1BvdGVudGlhbGx5QXBwbHkgb2YgcGhhc2VDYWxsYmFja1NldCApIHtcblxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcGhhc2VDYWxsYmFja1RvUG90ZW50aWFsbHlBcHBseS5waGFzZSA9PT0gcGhhc2UsICdwaGFzZUNhbGxiYWNrU2V0IHNob3VsZCBvbmx5IGluY2x1ZGUgY2FsbGJhY2tzIGZvciBwcm92aWRlZCBwaGFzZScgKTtcblxuICAgICAgLy8gb25seSB0cnkgdG8gY2hlY2sgdGhlIG9yZGVyIGRlcGVuZGVuY2llcyB0byBzZWUgaWYgdGhpcyBoYXMgdG8gYmUgYWZ0ZXIgc29tZXRoaW5nIHRoYXQgaXMgaW5jb21wbGV0ZS5cbiAgICAgIGlmICggdGhpcy5waGV0aW9JRENhbkFwcGx5UGhhc2UoIHBoYXNlQ2FsbGJhY2tUb1BvdGVudGlhbGx5QXBwbHkucGhldGlvSUQsIHBoYXNlLCBjb21wbGV0ZWRQaGFzZXMsIHBoZXRpb0lEc0luU3RhdGUgKSApIHtcblxuICAgICAgICAvLyBGaXJlIHRoZSBsaXN0ZW5lcjtcbiAgICAgICAgcGhhc2VDYWxsYmFja1RvUG90ZW50aWFsbHlBcHBseS5saXN0ZW5lcigpO1xuXG4gICAgICAgIC8vIFJlbW92ZSBpdCBmcm9tIHRoZSBtYWluIGxpc3Qgc28gdGhhdCBpdCBkb2Vzbid0IGdldCBjYWxsZWQgYWdhaW4uXG4gICAgICAgIHBoYXNlQ2FsbGJhY2tTZXQuZGVsZXRlKCBwaGFzZUNhbGxiYWNrVG9Qb3RlbnRpYWxseUFwcGx5ICk7XG5cbiAgICAgICAgLy8gS2VlcCB0cmFjayBvZiBhbGwgY29tcGxldGVkIFBoYXNlQ2FsbGJhY2tzXG4gICAgICAgIGNvbXBsZXRlZFBoYXNlc1sgcGhhc2VDYWxsYmFja1RvUG90ZW50aWFsbHlBcHBseS5nZXRUZXJtKCkgXSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBwaGV0aW9JRCAtIHRoaW5rIG9mIHRoaXMgYXMgdGhlIFwiYWZ0ZXJQaGV0aW9JRFwiIHNpbmNlIHRoZXJlIG1heSBiZSBzb21lIHBoYXNlcyB0aGF0IG5lZWQgdG8gYmUgYXBwbGllZCBiZWZvcmUgaXQgaGFzIHRoaXMgcGhhc2UgZG9uZS5cbiAgICogQHBhcmFtIHBoYXNlXG4gICAqIEBwYXJhbSBjb21wbGV0ZWRQaGFzZXMgLSBtYXAgdGhhdCBrZWVwcyB0cmFjayBvZiBjb21wbGV0ZWQgcGhhc2VzXG4gICAqIEBwYXJhbSBwaGV0aW9JRHNJblN0YXRlIC0gc2V0IG9mIHBoZXRpb0lEcyB0aGF0IHdlcmUgc2V0IGluIHN0YXRlXG4gICAqIEBwYXJhbSAtIGlmIHRoZSBwcm92aWRlZCBwaGFzZSBjYW4gYmUgYXBwbGllZCBnaXZlbiB0aGUgZGVwZW5kZW5jeSBvcmRlciBkZXBlbmRlbmNpZXMgb2YgdGhlIHN0YXRlIGVuZ2luZS5cbiAgICovXG4gIHByaXZhdGUgcGhldGlvSURDYW5BcHBseVBoYXNlKCBwaGV0aW9JRDogUGhldGlvSUQsIHBoYXNlOiBQcm9wZXJ0eVN0YXRlUGhhc2UsIGNvbXBsZXRlZFBoYXNlczogUmVjb3JkPHN0cmluZywgYm9vbGVhbj4sIHBoZXRpb0lEc0luU3RhdGU6IFNldDxzdHJpbmc+ICk6IGJvb2xlYW4ge1xuXG4gICAgLy8gVW5kZWZlciBtdXN0IGhhcHBlbiBiZWZvcmUgbm90aWZ5XG4gICAgaWYgKCBwaGFzZSA9PT0gUHJvcGVydHlTdGF0ZVBoYXNlLk5PVElGWSAmJiAhY29tcGxldGVkUGhhc2VzWyBwaGV0aW9JRCArIFByb3BlcnR5U3RhdGVQaGFzZS5VTkRFRkVSIF0gKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gR2V0IGEgbGlzdCBvZiB0aGUgbWFwcyBmb3IgdGhpcyBwaGFzZSBiZWluZyBhcHBsaWVzLlxuICAgIGNvbnN0IG1hcHNUb0NoZWNrOiBBcnJheTxQaGFzZU1hcD4gPSBbXTtcbiAgICB0aGlzLm1hcFBhaXJzLmZvckVhY2goIG1hcFBhaXIgPT4ge1xuICAgICAgaWYgKCBtYXBQYWlyLmFmdGVyUGhhc2UgPT09IHBoYXNlICkge1xuXG4gICAgICAgIC8vIFVzZSB0aGUgXCJhZnRlck1hcFwiIGJlY2F1c2UgYmVsb3cgbG9va3MgdXAgd2hhdCBuZWVkcyB0byBjb21lIGJlZm9yZS5cbiAgICAgICAgbWFwc1RvQ2hlY2sucHVzaCggbWFwUGFpci5hZnRlck1hcCApO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIC8vIE8oMilcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBtYXBzVG9DaGVjay5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IG1hcFRvQ2hlY2sgPSBtYXBzVG9DaGVja1sgaSBdO1xuICAgICAgaWYgKCAhbWFwVG9DaGVjay5oYXMoIHBoZXRpb0lEICkgKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgY29uc3Qgc2V0T2ZUaGluZ3NUaGF0U2hvdWxkQ29tZUZpcnN0ID0gbWFwVG9DaGVjay5nZXQoIHBoZXRpb0lEICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzZXRPZlRoaW5nc1RoYXRTaG91bGRDb21lRmlyc3QsICdtdXN0IGhhdmUgdGhpcyBzZXQnICk7XG5cbiAgICAgIC8vIE8oSykgd2hlcmUgSyBpcyB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIHRoYXQgc2hvdWxkIGNvbWUgYmVmb3JlIFByb3BlcnR5IFhcbiAgICAgIGZvciAoIGNvbnN0IGJlZm9yZVBoZXRpb0lEIG9mIHNldE9mVGhpbmdzVGhhdFNob3VsZENvbWVGaXJzdCEgKSB7XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgdGhlIGJlZm9yZSBwaGFzZSBmb3IgdGhpcyBvcmRlciBkZXBlbmRlbmN5IGhhcyBhbHJlYWR5IGJlZW4gY29tcGxldGVkXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGF0IHdlIG9ubHkgY2FyZSBhYm91dCBlbGVtZW50cyB0aGF0IHdlcmUgYWN0dWFsbHkgc2V0IGR1cmluZyB0aGlzIHN0YXRlIHNldFxuICAgICAgICBpZiAoICFjb21wbGV0ZWRQaGFzZXNbIGJlZm9yZVBoZXRpb0lEICsgbWFwVG9DaGVjay5iZWZvcmVQaGFzZSBdICYmXG4gICAgICAgICAgICAgcGhldGlvSURzSW5TdGF0ZS5oYXMoIGJlZm9yZVBoZXRpb0lEICkgJiYgcGhldGlvSURzSW5TdGF0ZS5oYXMoIHBoZXRpb0lEICkgKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbi8vIFBPSlNPIGZvciBhIGNhbGxiYWNrIGZvciBhIHNwZWNpZmljIFBoYXNlIGluIGEgUHJvcGVydHkncyBzdGF0ZSBzZXQgbGlmZWN5Y2xlLiBTZWUgdW5kZWZlckFuZE5vdGlmeVByb3BlcnRpZXMoKVxuY2xhc3MgUGhhc2VDYWxsYmFjayB7XG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcmVhZG9ubHkgcGhldGlvSUQ6IFBoZXRpb0lELFxuICAgIHB1YmxpYyByZWFkb25seSBwaGFzZTogUHJvcGVydHlTdGF0ZVBoYXNlLFxuICAgIHB1YmxpYyByZWFkb25seSBsaXN0ZW5lcjogKCAoKSA9PiB2b2lkICkgPSBfLm5vb3AgKSB7XG4gIH1cblxuICAvKipcbiAgICoge3N0cmluZ30gLSB1bmlxdWUgdGVybSBmb3IgdGhlIGlkL3BoYXNlIHBhaXJcbiAgICovXG4gIHB1YmxpYyBnZXRUZXJtKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucGhldGlvSUQgKyB0aGlzLnBoYXNlO1xuICB9XG59XG5cbmNsYXNzIE9yZGVyRGVwZW5kZW5jeU1hcFBhaXIge1xuXG4gIHB1YmxpYyByZWFkb25seSBiZWZvcmVNYXA6IFBoYXNlTWFwO1xuICBwdWJsaWMgcmVhZG9ubHkgYWZ0ZXJNYXA6IFBoYXNlTWFwO1xuICBwdWJsaWMgcmVhZG9ubHkgYmVmb3JlUGhhc2U6IFByb3BlcnR5U3RhdGVQaGFzZTtcbiAgcHVibGljIHJlYWRvbmx5IGFmdGVyUGhhc2U6IFByb3BlcnR5U3RhdGVQaGFzZTtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGJlZm9yZVBoYXNlOiBQcm9wZXJ0eVN0YXRlUGhhc2UsIGFmdGVyUGhhc2U6IFByb3BlcnR5U3RhdGVQaGFzZSApIHtcblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IsIGl0IGlzIGVhc2llc3QgdG8gZnVkZ2UgaGVyZSBzaW5jZSB3ZSBhcmUgYWRkaW5nIHRoZSBQaGFzZU1hcCBwcm9wZXJ0aWVzIGp1c3QgYmVsb3cgaGVyZS5cbiAgICB0aGlzLmJlZm9yZU1hcCA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLmJlZm9yZU1hcC5iZWZvcmVQaGFzZSA9IGJlZm9yZVBoYXNlO1xuICAgIHRoaXMuYmVmb3JlTWFwLmFmdGVyUGhhc2UgPSBhZnRlclBoYXNlO1xuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciwgaXQgaXMgZWFzaWVzdCB0byBmdWRnZSBoZXJlIHNpbmNlIHdlIGFyZSBhZGRpbmcgdGhlIFBoYXNlTWFwIHByb3BlcnRpZXMganVzdCBiZWxvdyBoZXJlLlxuICAgIHRoaXMuYWZ0ZXJNYXAgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5hZnRlck1hcC5iZWZvcmVQaGFzZSA9IGJlZm9yZVBoYXNlO1xuICAgIHRoaXMuYWZ0ZXJNYXAuYWZ0ZXJQaGFzZSA9IGFmdGVyUGhhc2U7XG5cbiAgICB0aGlzLmJlZm9yZU1hcC5vdGhlck1hcCA9IHRoaXMuYWZ0ZXJNYXA7XG4gICAgdGhpcy5hZnRlck1hcC5vdGhlck1hcCA9IHRoaXMuYmVmb3JlTWFwO1xuXG4gICAgdGhpcy5iZWZvcmVQaGFzZSA9IGJlZm9yZVBoYXNlO1xuICAgIHRoaXMuYWZ0ZXJQaGFzZSA9IGFmdGVyUGhhc2U7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYW4gb3JkZXIgZGVwZW5kZW5jeSBiZXR3ZWVuIHR3byBwaGV0aW9JRHMuIFRoaXMgd2lsbCBhZGQgZGF0YSB0byBtYXBzIGluIFwiYm90aCBkaXJlY3Rpb25cIi4gSWYgYWNjZXNzaW5nXG4gICAqIHdpdGgganVzdCB0aGUgYmVmb3JlUGhldGlvSUQsIG9yIHdpdGggdGhlIGFmdGVyUGhldGlvSUQuXG4gICAqL1xuICBwdWJsaWMgYWRkT3JkZXJEZXBlbmRlbmN5KCBiZWZvcmVQaGV0aW9JRDogUGhldGlvSUQsIGFmdGVyUGhldGlvSUQ6IFBoZXRpb0lEICk6IHZvaWQge1xuICAgIGlmICggIXRoaXMuYmVmb3JlTWFwLmhhcyggYmVmb3JlUGhldGlvSUQgKSApIHtcbiAgICAgIHRoaXMuYmVmb3JlTWFwLnNldCggYmVmb3JlUGhldGlvSUQsIG5ldyBTZXQ8c3RyaW5nPigpICk7XG4gICAgfVxuICAgIHRoaXMuYmVmb3JlTWFwLmdldCggYmVmb3JlUGhldGlvSUQgKSEuYWRkKCBhZnRlclBoZXRpb0lEICk7XG5cbiAgICBpZiAoICF0aGlzLmFmdGVyTWFwLmhhcyggYWZ0ZXJQaGV0aW9JRCApICkge1xuICAgICAgdGhpcy5hZnRlck1hcC5zZXQoIGFmdGVyUGhldGlvSUQsIG5ldyBTZXQoKSApO1xuICAgIH1cbiAgICB0aGlzLmFmdGVyTWFwLmdldCggYWZ0ZXJQaGV0aW9JRCApIS5hZGQoIGJlZm9yZVBoZXRpb0lEICk7XG4gIH1cblxuICAvKipcbiAgICogVW5yZWdpc3RlciBhbGwgb3JkZXIgZGVwZW5kZW5jaWVzIGZvciB0aGUgcHJvdmlkZWQgUHJvcGVydHlcbiAgICovXG4gIHB1YmxpYyB1bnJlZ2lzdGVyT3JkZXJEZXBlbmRlbmNpZXNGb3JQcm9wZXJ0eSggcHJvcGVydHk6IFJlYWRPbmx5UHJvcGVydHk8dW5rbm93bj4gKTogdm9pZCB7XG4gICAgY29uc3QgcGhldGlvSURUb1JlbW92ZSA9IHByb3BlcnR5LnRhbmRlbS5waGV0aW9JRDtcblxuICAgIFsgdGhpcy5iZWZvcmVNYXAsIHRoaXMuYWZ0ZXJNYXAgXS5mb3JFYWNoKCBtYXAgPT4ge1xuICAgICAgbWFwLmhhcyggcGhldGlvSURUb1JlbW92ZSApICYmIG1hcC5nZXQoIHBoZXRpb0lEVG9SZW1vdmUgKSEuZm9yRWFjaCggcGhldGlvSUQgPT4ge1xuICAgICAgICBjb25zdCBzZXRPZkFmdGVyTWFwSURzID0gbWFwLm90aGVyTWFwLmdldCggcGhldGlvSUQgKTtcbiAgICAgICAgc2V0T2ZBZnRlck1hcElEcyAmJiBzZXRPZkFmdGVyTWFwSURzLmRlbGV0ZSggcGhldGlvSURUb1JlbW92ZSApO1xuXG4gICAgICAgIC8vIENsZWFyIG91dCBlbXB0eSBlbnRyaWVzIHRvIGF2b2lkIGhhdmluZyBsb3RzIG9mIGVtcHR5IFNldHMgc2l0dGluZyBhcm91bmRcbiAgICAgICAgc2V0T2ZBZnRlck1hcElEcyEuc2l6ZSA9PT0gMCAmJiBtYXAub3RoZXJNYXAuZGVsZXRlKCBwaGV0aW9JRCApO1xuICAgICAgfSApO1xuICAgICAgbWFwLmRlbGV0ZSggcGhldGlvSURUb1JlbW92ZSApO1xuICAgIH0gKTtcblxuICAgIC8vIExvb2sgdGhyb3VnaCBldmVyeSBkZXBlbmRlbmN5IGFuZCBtYWtlIHN1cmUgdGhlIHBoZXRpb0lEIHRvIHJlbW92ZSBoYXMgYmVlbiBjb21wbGV0ZWx5IHJlbW92ZWQuXG4gICAgYXNzZXJ0U2xvdyAmJiBbIHRoaXMuYmVmb3JlTWFwLCB0aGlzLmFmdGVyTWFwIF0uZm9yRWFjaCggbWFwID0+IHtcbiAgICAgIG1hcC5mb3JFYWNoKCAoIHZhbHVlUGhldGlvSURzLCBrZXkgKSA9PiB7XG4gICAgICAgIGFzc2VydFNsb3cgJiYgYXNzZXJ0U2xvdygga2V5ICE9PSBwaGV0aW9JRFRvUmVtb3ZlLCAnc2hvdWxkIG5vdCBiZSBhIGtleScgKTtcbiAgICAgICAgYXNzZXJ0U2xvdyAmJiBhc3NlcnRTbG93KCAhdmFsdWVQaGV0aW9JRHMuaGFzKCBwaGV0aW9JRFRvUmVtb3ZlICksICdzaG91bGQgbm90IGJlIGluIGEgdmFsdWUgbGlzdCcgKTtcbiAgICAgIH0gKTtcbiAgICB9ICk7XG4gIH1cblxuICBwdWJsaWMgdXNlc1BoZXRpb0lEKCBwaGV0aW9JRDogUGhldGlvSUQgKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYmVmb3JlTWFwLmhhcyggcGhldGlvSUQgKSB8fCB0aGlzLmFmdGVyTWFwLmhhcyggcGhldGlvSUQgKTtcbiAgfVxufVxuXG4vLyBQT0pTTyB0byBrZWVwIHRyYWNrIG9mIFBoYXNlQ2FsbGJhY2tzIHdoaWxlIHByb3ZpZGluZyBPKDEpIGxvb2t1cCB0aW1lIGJlY2F1c2UgaXQgaXMgYnVpbHQgb24gU2V0XG5jbGFzcyBQaGFzZUNhbGxiYWNrU2V0cyB7XG4gIHB1YmxpYyByZWFkb25seSB1bmRlZmVyU2V0ID0gbmV3IFNldDxQaGFzZUNhbGxiYWNrPigpO1xuICBwdWJsaWMgcmVhZG9ubHkgbm90aWZ5U2V0ID0gbmV3IFNldDxQaGFzZUNhbGxiYWNrPigpO1xuXG4gIHB1YmxpYyBnZXQgc2l6ZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnVuZGVmZXJTZXQuc2l6ZSArIHRoaXMubm90aWZ5U2V0LnNpemU7XG4gIH1cblxuICBwdWJsaWMgZm9yRWFjaCggY2FsbGJhY2s6ICggcGhhc2VDYWxsYmFjazogUGhhc2VDYWxsYmFjayApID0+IG51bWJlciApOiB2b2lkIHtcbiAgICB0aGlzLnVuZGVmZXJTZXQuZm9yRWFjaCggY2FsbGJhY2sgKTtcbiAgICB0aGlzLm5vdGlmeVNldC5mb3JFYWNoKCBjYWxsYmFjayApO1xuICB9XG5cbiAgcHVibGljIGFkZFVuZGVmZXJQaGFzZUNhbGxiYWNrKCBwaGFzZUNhbGxiYWNrOiBQaGFzZUNhbGxiYWNrICk6IHZvaWQge1xuICAgIHRoaXMudW5kZWZlclNldC5hZGQoIHBoYXNlQ2FsbGJhY2sgKTtcbiAgfVxuXG4gIHB1YmxpYyBhZGROb3RpZnlQaGFzZUNhbGxiYWNrKCBwaGFzZUNhbGxiYWNrOiBQaGFzZUNhbGxiYWNrICk6IHZvaWQge1xuICAgIHRoaXMubm90aWZ5U2V0LmFkZCggcGhhc2VDYWxsYmFjayApO1xuICB9XG5cbiAgcHVibGljIGdldFNldEZyb21QaGFzZSggcGhhc2U6IFByb3BlcnR5U3RhdGVQaGFzZSApOiBTZXQ8UGhhc2VDYWxsYmFjaz4ge1xuICAgIHJldHVybiBwaGFzZSA9PT0gUHJvcGVydHlTdGF0ZVBoYXNlLk5PVElGWSA/IHRoaXMubm90aWZ5U2V0IDogdGhpcy51bmRlZmVyU2V0O1xuICB9XG59XG5cbmF4b24ucmVnaXN0ZXIoICdQcm9wZXJ0eVN0YXRlSGFuZGxlcicsIFByb3BlcnR5U3RhdGVIYW5kbGVyICk7XG5leHBvcnQgZGVmYXVsdCBQcm9wZXJ0eVN0YXRlSGFuZGxlcjtcblxuLyoqXG4gKiBTaW5nbGV0b24gcmVzcG9uc2libGUgZm9yIEFYT04vUHJvcGVydHkgc3BlY2lmaWMgc3RhdGUgbG9naWMuIFVzZSB0aGlzIGdsb2JhbCBmb3IgdGhlIHByb2plY3QgdG8gaGF2ZSBhIHNpbmdsZVxuICogcGxhY2UgdG8gdGFwIGludG8gdGhlIFBoZXRpb1N0YXRlRW5naW5lLCBhcyB3ZWxsIGFzIGEgc2luZ2xlIHBvaW50IHRvIHJlZ2lzdGVyIGFueSBvcmRlciBkZXBlbmRlbmNpZXMgdGhhdCBQcm9wZXJ0aWVzXG4gKiBoYXZlIGJldHdlZW4gZWFjaCBvdGhlciB3aGVuIHNldHRpbmcgdGhlaXIgc3RhdGUgYW5kIGFwcGx5aW5nIHRoZWlyIHZhbHVlcy9ub3RpZnlpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCBwcm9wZXJ0eVN0YXRlSGFuZGxlclNpbmdsZXRvbiA9IG5ldyBQcm9wZXJ0eVN0YXRlSGFuZGxlcigpO1xuYXhvbi5yZWdpc3RlciggJ3Byb3BlcnR5U3RhdGVIYW5kbGVyU2luZ2xldG9uJywgcHJvcGVydHlTdGF0ZUhhbmRsZXJTaW5nbGV0b24gKTsiXSwibmFtZXMiOlsiVGFuZGVtIiwiYXhvbiIsIlByb3BlcnR5U3RhdGVQaGFzZSIsIlJlYWRPbmx5UHJvcGVydHkiLCJQcm9wZXJ0eVN0YXRlSGFuZGxlciIsImluaXRpYWxpemUiLCJwaGV0aW9TdGF0ZUVuZ2luZSIsImFzc2VydCIsImluaXRpYWxpemVkIiwib25CZWZvcmVBcHBseVN0YXRlRW1pdHRlciIsImFkZExpc3RlbmVyIiwicGhldGlvT2JqZWN0IiwiaXNEZWZlcnJlZCIsInNldERlZmVycmVkIiwicGhldGlvSUQiLCJ0YW5kZW0iLCJsaXN0ZW5lciIsInBvdGVudGlhbExpc3RlbmVyIiwicGhhc2VDYWxsYmFja1NldHMiLCJhZGROb3RpZnlQaGFzZUNhbGxiYWNrIiwiUGhhc2VDYWxsYmFjayIsIk5PVElGWSIsIl8iLCJub29wIiwiYWRkVW5kZWZlclBoYXNlQ2FsbGJhY2siLCJVTkRFRkVSIiwidW5kZWZlckVtaXR0ZXIiLCJoYXNMaXN0ZW5lcnMiLCJzdGF0ZSIsInVuZGVmZXJBbmROb3RpZnlQcm9wZXJ0aWVzIiwiU2V0IiwiT2JqZWN0Iiwia2V5cyIsImlzU2V0dGluZ1N0YXRlUHJvcGVydHkiLCJsYXp5TGluayIsImlzU2V0dGluZ1N0YXRlIiwic2l6ZSIsInZhbGlkYXRlSW5zdHJ1bWVudGVkUHJvcGVydHkiLCJwcm9wZXJ0eSIsIlZBTElEQVRJT04iLCJpc1BoZXRpb0luc3RydW1lbnRlZCIsInZhbGlkYXRlUHJvcGVydHlQaGFzZVBhaXIiLCJwaGFzZSIsImdldE1hcFBhaXJGcm9tUGhhc2VzIiwiYmVmb3JlUGhhc2UiLCJhZnRlclBoYXNlIiwibWF0Y2hlZFBhaXJzIiwibWFwUGFpcnMiLCJmaWx0ZXIiLCJtYXBQYWlyIiwibGVuZ3RoIiwicmVnaXN0ZXJQaGV0aW9PcmRlckRlcGVuZGVuY3kiLCJiZWZvcmVQcm9wZXJ0eSIsImFmdGVyUHJvcGVydHkiLCJQSEVUX0lPX0VOQUJMRUQiLCJhZGRPcmRlckRlcGVuZGVuY3kiLCJwcm9wZXJ0eUluQW5PcmRlckRlcGVuZGVuY3kiLCJzb21lIiwidXNlc1BoZXRpb0lEIiwidW5yZWdpc3Rlck9yZGVyRGVwZW5kZW5jaWVzRm9yUHJvcGVydHkiLCJmb3JFYWNoIiwicGhldGlvSURzSW5TdGF0ZSIsImNvbXBsZXRlZFBoYXNlcyIsIm51bWJlck9mSXRlcmF0aW9ucyIsImVycm9ySW5VbmRlZmVyQW5kTm90aWZ5U3RlcCIsImF0dGVtcHRUb0FwcGx5UGhhc2VzIiwic3RpbGxUb0RvSURQaGFzZVBhaXJzIiwicGhhc2VDYWxsYmFjayIsInB1c2giLCJnZXRUZXJtIiwicmVsZXZhbnRPcmRlckRlcGVuZGVuY2llcyIsImJlZm9yZU1hcCIsImJlZm9yZVBoZXRpb0lEIiwiYWZ0ZXJQaGV0aW9JRHMiLCJhZnRlclBoZXRpb0lEIiwiYmVmb3JlVGVybSIsImFmdGVyVGVybSIsImluY2x1ZGVzIiwic3RyaW5nIiwiY29uc29sZSIsImxvZyIsInVuZGVmZXJTZXQiLCJub3RpZnlTZXQiLCJvcmRlckRlcGVuZGVuY3kiLCJhc3NlcnRNZXNzYWdlIiwiRXJyb3IiLCJnZXROdW1iZXJPZk9yZGVyRGVwZW5kZW5jaWVzIiwiY291bnQiLCJhZnRlck1hcCIsInZhbHVlU2V0IiwicGhhc2VDYWxsYmFja1NldCIsImdldFNldEZyb21QaGFzZSIsInBoYXNlQ2FsbGJhY2tUb1BvdGVudGlhbGx5QXBwbHkiLCJwaGV0aW9JRENhbkFwcGx5UGhhc2UiLCJkZWxldGUiLCJtYXBzVG9DaGVjayIsImkiLCJtYXBUb0NoZWNrIiwiaGFzIiwic2V0T2ZUaGluZ3NUaGF0U2hvdWxkQ29tZUZpcnN0IiwiZ2V0IiwiUGhhc2VDYWxsYmFja1NldHMiLCJ1bmRlZmVyQmVmb3JlVW5kZWZlck1hcFBhaXIiLCJPcmRlckRlcGVuZGVuY3lNYXBQYWlyIiwidW5kZWZlckJlZm9yZU5vdGlmeU1hcFBhaXIiLCJub3RpZnlCZWZvcmVVbmRlZmVyTWFwUGFpciIsIm5vdGlmeUJlZm9yZU5vdGlmeU1hcFBhaXIiLCJzZXQiLCJhZGQiLCJwaGV0aW9JRFRvUmVtb3ZlIiwibWFwIiwic2V0T2ZBZnRlck1hcElEcyIsIm90aGVyTWFwIiwiYXNzZXJ0U2xvdyIsInZhbHVlUGhldGlvSURzIiwia2V5IiwiTWFwIiwiY2FsbGJhY2siLCJyZWdpc3RlciIsInByb3BlcnR5U3RhdGVIYW5kbGVyU2luZ2xldG9uIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Q0FPQyxHQUlELE9BQU9BLFlBQVksNEJBQTRCO0FBRS9DLE9BQU9DLFVBQVUsWUFBWTtBQUM3QixPQUFPQyx3QkFBd0IsMEJBQTBCO0FBQ3pELE9BQU9DLHNCQUFzQix3QkFBd0I7QUFhckQsSUFBQSxBQUFNQyx1QkFBTixNQUFNQTtJQWdDR0MsV0FBWUMsaUJBQXFDLEVBQVM7UUFDL0RDLFVBQVVBLE9BQVEsQ0FBQyxJQUFJLENBQUNDLFdBQVcsRUFBRTtRQUVyQ0Ysa0JBQWtCRyx5QkFBeUIs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