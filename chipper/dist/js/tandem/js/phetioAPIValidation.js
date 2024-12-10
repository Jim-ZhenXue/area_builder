// Copyright 2019-2024, University of Colorado Boulder
/**
 * This singleton is responsible for ensuring that the PhET-iO API is correct through the lifetime of the simulation.
 * The PhET-iO API is defined through multiple preloaded files. The "elements baseline" API holds an exact match of
 * what PhetioObject instances/metadata the sim should create on startup, where the "elements overrides" file is a
 * sparse list that can overwrite metadata without changing the code. See `grunt generate-phet-io-api` for
 * more information. The complete list of checks was decided on in https://github.com/phetsims/phet-io/issues/1453
 * (and later trimmed down) and is as follows:
 *
 * 1. After startup, only dynamic instances prescribed by the baseline API can be registered.
 * 2. Any static, registered PhetioObject can never be deregistered.
 * 3. Any schema entries in the overrides file must exist in the baseline API
 * 4. Any schema entries in the overrides file must be different from its baseline counterpart
 * 5. Dynamic element metadata should match the archetype in the API.
 * 6. All entries in the API should be instrumented (no usages of optional/requiredTandem as phetioIDs)
 *
 * Terminology:
 * schema: specified through preloads. The full schema is the baseline plus the overrides, but those parts can be
 *         referred to separately.
 * registered: the process of instrumenting a PhetioObject and it "becoming" a PhET-iO Element on the wrapper side.
 * static PhetioObject: A registered PhetioObject that exists for the lifetime of the sim. It should not be removed
 *                      (even intermittently) and must be created during startup so that it is immediately interoperable.
 * dynamic PhetioObject: A registered PhetioObject that can be created and/or destroyed at any point. Only dynamic
 *                       PhetioObjects can be created after startup.
 *
 * See https://github.com/phetsims/phet-io/issues/1443#issuecomment-484306552 for an explanation of how to maintain the
 * PhET-iO API for a simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */ import { LinkedElement } from './PhetioObject.js';
import Tandem, { DYNAMIC_ARCHETYPE_NAME } from './Tandem.js';
import tandemNamespace from './tandemNamespace.js';
// constants
// The API-tracked and validated metadata keys
const KEYS_TO_CHECK = [
    'phetioDynamicElement',
    'phetioEventType',
    'phetioIsArchetype',
    'phetioPlayback',
    'phetioReadOnly',
    'phetioState',
    'phetioTypeName'
];
let PhetioAPIValidation = class PhetioAPIValidation {
    /**
   * Callback when the simulation is ready to go, and all static PhetioObjects have been created.
   */ onSimStarted() {
        if (this.enabled && phet.joist.sim.allScreensCreated) {
            this.validateOverridesFile();
            this.validatePreferencesModel();
        }
        if (phet.preloads.phetio.queryParameters.phetioPrintAPIProblems && this.apiMismatches) {
            console.log('PhET-iO API problems detected: ', this.apiMismatches);
        }
        // After the overrides validation to support ?phetioPrintAPIProblems on errors with overrides.
        this.simHasStarted = true;
    }
    /**
   * All core elements in the preferencesModel should be phetioReadOnly: false so they can be set over the API
   * or from within studio, but phetioState: false so they are not captured with save states.
   */ validatePreferencesModel() {
        Object.keys(phet.phetio.phetioEngine.phetioElementMap).filter((key)=>key.includes('.preferencesModel.')).forEach((preferencesKey)=>{
            let phetioObject = phet.phetio.phetioEngine.phetioElementMap[preferencesKey];
            while(phetioObject instanceof LinkedElement){
                phetioObject = phetioObject.element;
            }
            assert && assert(!phetioObject.phetioReadOnly, 'preferences model and its descendants should be phetioReadOnly: false, key=' + preferencesKey);
            // Audio manager, color profile property and localeProperty are supposed to be stateful. All other preferences
            // should be phetioState: false so they are not captured in the state
            assert && assert(phetioObject.phetioState === (phetioObject.phetioID.endsWith('.colorProfileProperty') || phetioObject.phetioID.endsWith('.audioEnabledProperty') || phetioObject.phetioID.endsWith('.localeProperty') || // Sim preferences should also be stateful
            preferencesKey.includes('.simulationModel.')), 'most preferences should be phetioState: false, key=' + preferencesKey);
        });
    }
    // Validation checks that can be made on the API JSON object directly
    validateFullAPI(api) {
        if (this.enabled) {
            const string = JSON.stringify(api);
            [
                Tandem.OPTIONAL.name,
                Tandem.REQUIRED.name
            ].forEach((name)=>{
                if (string.includes(name)) {
                    this.assertAPIError({
                        phetioID: name,
                        ruleInViolation: '6. All entries in the API should be instrumented (no usages of optional/requiredTandem as phetioIDs)'
                    });
                }
            });
        }
    }
    /**
   * Checks if a removed phetioObject is part of a Group
   */ onPhetioObjectRemoved(phetioObject) {
        if (!this.enabled) {
            return;
        }
        const phetioID = phetioObject.tandem.phetioID;
        // if it isn't dynamic, then it shouldn't be removed during the lifetime of the sim.
        if (!phetioObject.phetioDynamicElement) {
            this.assertAPIError({
                phetioID: phetioID,
                ruleInViolation: '2. Any static, registered PhetioObject can never be deregistered.'
            });
        }
    }
    /**
   * Should be called from phetioEngine when a PhetioObject is added to the PhET-iO
   */ onPhetioObjectAdded(phetioObject) {
        if (!this.enabled) {
            return;
        }
        const newPhetioType = phetioObject.phetioType;
        const oldPhetioType = this.everyPhetioType[newPhetioType.typeName];
        if (!oldPhetioType) {
            this.everyPhetioType[newPhetioType.typeName] = newPhetioType;
        }
        if (this.simHasStarted) {
            // Here we need to kick this validation to the next frame to support construction in any order. Parent first, or
            // child first. Use namespace to avoid because timer is a PhetioObject.
            phet.axon.animationFrameTimer.runOnNextTick(()=>{
                // The only instances that it's OK to create after startup are "dynamic instances" which are marked as such.
                if (!phetioObject.phetioDynamicElement) {
                    this.assertAPIError({
                        phetioID: phetioObject.tandem.phetioID,
                        ruleInViolation: '1. After startup, only dynamic instances prescribed by the baseline file can be registered.'
                    });
                } else {
                    // Compare the dynamic element to the archetype if creating them this runtime. Don't check this if it has
                    // already been disposed.
                    if (phet.preloads.phetio.createArchetypes && !phetioObject.isDisposed) {
                        const archetypeID = phetioObject.tandem.getArchetypalPhetioID();
                        const archetypeMetadata = phet.phetio.phetioEngine.getPhetioElement(archetypeID).getMetadata();
                        // Compare to the simulation-defined archetype
                        this.checkDynamicInstanceAgainstArchetype(phetioObject, archetypeMetadata, 'simulation archetype');
                    }
                }
            });
        }
    }
    validateOverridesFile() {
        // import phetioEngine causes a cycle and cannot be used, hence we must use the namespace
        const entireBaseline = phet.phetio.phetioEngine.getPhetioElementsBaseline();
        for(const phetioID in window.phet.preloads.phetio.phetioElementsOverrides){
            const isArchetype = phetioID.includes(DYNAMIC_ARCHETYPE_NAME);
            if (!phet.preloads.phetio.createArchetypes && !entireBaseline.hasOwnProperty(phetioID)) {
                assert && assert(isArchetype, `phetioID missing from the baseline that was not an archetype: ${phetioID}`);
            } else {
                if (!entireBaseline.hasOwnProperty(phetioID)) {
                    this.assertAPIError({
                        phetioID: phetioID,
                        ruleInViolation: '3. Any schema entries in the overrides file must exist in the baseline file.',
                        message: 'phetioID expected in the baseline file but does not exist'
                    });
                } else {
                    const override = window.phet.preloads.phetio.phetioElementsOverrides[phetioID];
                    const baseline = entireBaseline[phetioID];
                    if (Object.keys(override).length === 0) {
                        this.assertAPIError({
                            phetioID: phetioID,
                            ruleInViolation: '4. Any schema entries in the overrides file must be different from its baseline counterpart.',
                            message: 'no metadata keys found for this override.'
                        });
                    }
                    for(const metadataKey in override){
                        if (!baseline.hasOwnProperty(metadataKey)) {
                            this.assertAPIError({
                                phetioID: phetioID,
                                ruleInViolation: '8. Any schema entries in the overrides file must be different from its baseline counterpart.',
                                message: `phetioID metadata key not found in the baseline: ${metadataKey}`
                            });
                        }
                        if (override[metadataKey] === baseline[metadataKey]) {
                            this.assertAPIError({
                                phetioID: phetioID,
                                ruleInViolation: '8. Any schema entries in the overrides file must be different from its baseline counterpart.',
                                message: 'phetioID metadata override value is the same as the corresponding metadata value in the baseline.'
                            });
                        }
                    }
                }
            }
        }
    }
    /**
   * Assert out the failed API validation rule.
   */ assertAPIError(apiErrorObject) {
        const mismatchMessage = apiErrorObject.phetioID ? `${apiErrorObject.phetioID}:  ${apiErrorObject.ruleInViolation}` : `${apiErrorObject.ruleInViolation}`;
        this.apiMismatches.push(apiErrorObject);
        // If ?phetioPrintAPIProblems is present, then ignore assertions until the sim has started up.
        if (this.simHasStarted || !phet.preloads.phetio.queryParameters.phetioPrintAPIProblems) {
            if (phet.preloads.phetio.queryParameters.phetioPrintAPIProblems) {
                console.error('API Problems:', this.apiMismatches);
            } else {
                assert && assert(false, `PhET-iO API error:\n${mismatchMessage}`);
            }
        }
    }
    /**
   * Compare a dynamic phetioObject's metadata to the expected metadata
   */ checkDynamicInstanceAgainstArchetype(phetioObject, archetypeMetadata, source) {
        const actualMetadata = phetioObject.getMetadata();
        KEYS_TO_CHECK.forEach((key)=>{
            // These attributes are different for archetype vs actual
            if (key !== 'phetioDynamicElement' && key !== 'phetioArchetypePhetioID' && key !== 'phetioIsArchetype') {
                // @ts-expect-error - not sure how to be typesafe in the API files
                if (archetypeMetadata[key] !== actualMetadata[key] && phetioObject.tandem) {
                    this.assertAPIError({
                        phetioID: phetioObject.tandem.phetioID,
                        ruleInViolation: '5. Dynamic element metadata should match the archetype in the API.',
                        source: source,
                        message: `mismatched metadata: ${key}`
                    });
                }
            }
        });
    }
    constructor(){
        this.apiMismatches = [];
        // keep track of when the sim has started.
        this.simHasStarted = false;
        // settable by qunitStart.js. Validation is only enabled when all screens are present.
        this.enabled = !!assert && Tandem.VALIDATION;
        // this must be all phet-io types so that the
        // following would fail: add a phetioType, then remove it, then add a different one under the same typeName.
        // A Note about memory: Every IOType that is loaded as a module is already loaded on the namespace. Therefore
        // this map doesn't add any memory by storing these. The exception to this is parametric IOTypes. It should be
        // double checked that anything being passed into a parametric type is memory safe. As of this writing, only IOTypes
        // are passed to parametric IOTypes, so this pattern remains memory leak free. Furthermore, this list is only
        // populated when `this.enabled`.
        this.everyPhetioType = {};
    }
};
const phetioAPIValidation = new PhetioAPIValidation();
tandemNamespace.register('phetioAPIValidation', phetioAPIValidation);
export default phetioAPIValidation;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9waGV0aW9BUElWYWxpZGF0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRoaXMgc2luZ2xldG9uIGlzIHJlc3BvbnNpYmxlIGZvciBlbnN1cmluZyB0aGF0IHRoZSBQaEVULWlPIEFQSSBpcyBjb3JyZWN0IHRocm91Z2ggdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW11bGF0aW9uLlxuICogVGhlIFBoRVQtaU8gQVBJIGlzIGRlZmluZWQgdGhyb3VnaCBtdWx0aXBsZSBwcmVsb2FkZWQgZmlsZXMuIFRoZSBcImVsZW1lbnRzIGJhc2VsaW5lXCIgQVBJIGhvbGRzIGFuIGV4YWN0IG1hdGNoIG9mXG4gKiB3aGF0IFBoZXRpb09iamVjdCBpbnN0YW5jZXMvbWV0YWRhdGEgdGhlIHNpbSBzaG91bGQgY3JlYXRlIG9uIHN0YXJ0dXAsIHdoZXJlIHRoZSBcImVsZW1lbnRzIG92ZXJyaWRlc1wiIGZpbGUgaXMgYVxuICogc3BhcnNlIGxpc3QgdGhhdCBjYW4gb3ZlcndyaXRlIG1ldGFkYXRhIHdpdGhvdXQgY2hhbmdpbmcgdGhlIGNvZGUuIFNlZSBgZ3J1bnQgZ2VuZXJhdGUtcGhldC1pby1hcGlgIGZvclxuICogbW9yZSBpbmZvcm1hdGlvbi4gVGhlIGNvbXBsZXRlIGxpc3Qgb2YgY2hlY2tzIHdhcyBkZWNpZGVkIG9uIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvL2lzc3Vlcy8xNDUzXG4gKiAoYW5kIGxhdGVyIHRyaW1tZWQgZG93bikgYW5kIGlzIGFzIGZvbGxvd3M6XG4gKlxuICogMS4gQWZ0ZXIgc3RhcnR1cCwgb25seSBkeW5hbWljIGluc3RhbmNlcyBwcmVzY3JpYmVkIGJ5IHRoZSBiYXNlbGluZSBBUEkgY2FuIGJlIHJlZ2lzdGVyZWQuXG4gKiAyLiBBbnkgc3RhdGljLCByZWdpc3RlcmVkIFBoZXRpb09iamVjdCBjYW4gbmV2ZXIgYmUgZGVyZWdpc3RlcmVkLlxuICogMy4gQW55IHNjaGVtYSBlbnRyaWVzIGluIHRoZSBvdmVycmlkZXMgZmlsZSBtdXN0IGV4aXN0IGluIHRoZSBiYXNlbGluZSBBUElcbiAqIDQuIEFueSBzY2hlbWEgZW50cmllcyBpbiB0aGUgb3ZlcnJpZGVzIGZpbGUgbXVzdCBiZSBkaWZmZXJlbnQgZnJvbSBpdHMgYmFzZWxpbmUgY291bnRlcnBhcnRcbiAqIDUuIER5bmFtaWMgZWxlbWVudCBtZXRhZGF0YSBzaG91bGQgbWF0Y2ggdGhlIGFyY2hldHlwZSBpbiB0aGUgQVBJLlxuICogNi4gQWxsIGVudHJpZXMgaW4gdGhlIEFQSSBzaG91bGQgYmUgaW5zdHJ1bWVudGVkIChubyB1c2FnZXMgb2Ygb3B0aW9uYWwvcmVxdWlyZWRUYW5kZW0gYXMgcGhldGlvSURzKVxuICpcbiAqIFRlcm1pbm9sb2d5OlxuICogc2NoZW1hOiBzcGVjaWZpZWQgdGhyb3VnaCBwcmVsb2Fkcy4gVGhlIGZ1bGwgc2NoZW1hIGlzIHRoZSBiYXNlbGluZSBwbHVzIHRoZSBvdmVycmlkZXMsIGJ1dCB0aG9zZSBwYXJ0cyBjYW4gYmVcbiAqICAgICAgICAgcmVmZXJyZWQgdG8gc2VwYXJhdGVseS5cbiAqIHJlZ2lzdGVyZWQ6IHRoZSBwcm9jZXNzIG9mIGluc3RydW1lbnRpbmcgYSBQaGV0aW9PYmplY3QgYW5kIGl0IFwiYmVjb21pbmdcIiBhIFBoRVQtaU8gRWxlbWVudCBvbiB0aGUgd3JhcHBlciBzaWRlLlxuICogc3RhdGljIFBoZXRpb09iamVjdDogQSByZWdpc3RlcmVkIFBoZXRpb09iamVjdCB0aGF0IGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0uIEl0IHNob3VsZCBub3QgYmUgcmVtb3ZlZFxuICogICAgICAgICAgICAgICAgICAgICAgKGV2ZW4gaW50ZXJtaXR0ZW50bHkpIGFuZCBtdXN0IGJlIGNyZWF0ZWQgZHVyaW5nIHN0YXJ0dXAgc28gdGhhdCBpdCBpcyBpbW1lZGlhdGVseSBpbnRlcm9wZXJhYmxlLlxuICogZHluYW1pYyBQaGV0aW9PYmplY3Q6IEEgcmVnaXN0ZXJlZCBQaGV0aW9PYmplY3QgdGhhdCBjYW4gYmUgY3JlYXRlZCBhbmQvb3IgZGVzdHJveWVkIGF0IGFueSBwb2ludC4gT25seSBkeW5hbWljXG4gKiAgICAgICAgICAgICAgICAgICAgICAgUGhldGlvT2JqZWN0cyBjYW4gYmUgY3JlYXRlZCBhZnRlciBzdGFydHVwLlxuICpcbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby9pc3N1ZXMvMTQ0MyNpc3N1ZWNvbW1lbnQtNDg0MzA2NTUyIGZvciBhbiBleHBsYW5hdGlvbiBvZiBob3cgdG8gbWFpbnRhaW4gdGhlXG4gKiBQaEVULWlPIEFQSSBmb3IgYSBzaW11bGF0aW9uLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IHsgUGhldGlvQVBJLCBQaGV0aW9FbGVtZW50TWV0YWRhdGEsIFBoZXRpb0lEIH0gZnJvbSAnLi9waGV0LWlvLXR5cGVzLmpzJztcbmltcG9ydCBQaGV0aW9PYmplY3QsIHsgTGlua2VkRWxlbWVudCB9IGZyb20gJy4vUGhldGlvT2JqZWN0LmpzJztcbmltcG9ydCBUYW5kZW0sIHsgRFlOQU1JQ19BUkNIRVRZUEVfTkFNRSB9IGZyb20gJy4vVGFuZGVtLmpzJztcbmltcG9ydCB0YW5kZW1OYW1lc3BhY2UgZnJvbSAnLi90YW5kZW1OYW1lc3BhY2UuanMnO1xuaW1wb3J0IElPVHlwZSBmcm9tICcuL3R5cGVzL0lPVHlwZS5qcyc7XG5cbi8vIGNvbnN0YW50c1xuLy8gVGhlIEFQSS10cmFja2VkIGFuZCB2YWxpZGF0ZWQgbWV0YWRhdGEga2V5c1xuY29uc3QgS0VZU19UT19DSEVDSyA9IFtcbiAgJ3BoZXRpb0R5bmFtaWNFbGVtZW50JyxcbiAgJ3BoZXRpb0V2ZW50VHlwZScsXG4gICdwaGV0aW9Jc0FyY2hldHlwZScsXG4gICdwaGV0aW9QbGF5YmFjaycsXG4gICdwaGV0aW9SZWFkT25seScsXG4gICdwaGV0aW9TdGF0ZScsXG4gICdwaGV0aW9UeXBlTmFtZSdcbl07XG5cbi8vIEZlZWwgZnJlZSB0byBhZGQgYW55IG90aGVyIEpTT05pZnlhYmxlIGtleXMgdG8gdGhpcyB0byBtYWtlIHRoZSBlcnJvciBtb3JlIGNsZWFyISBBbGwgbWlzbWF0Y2hlcyBhcmUgcHJpbnRlZFxuLy8gYXQgb25jZSBmb3IgY2xhcml0eSwgc2VlIFBoZXRpb0VuZ2luZS5cbnR5cGUgQVBJTWlzbWF0Y2ggPSB7XG4gIHBoZXRpb0lEOiBQaGV0aW9JRDtcbiAgcnVsZUluVmlvbGF0aW9uOiBzdHJpbmc7IC8vIG9uZSBvZiB0aGUgbnVtYmVyZWQgbGlzdCBpbiB0aGUgaGVhZGVyIGRvYy5cbiAgbWVzc2FnZT86IHN0cmluZzsgLy8gc3BlY2lmaWMgcHJvYmxlbVxuICBzb3VyY2U/OiBzdHJpbmc7XG59O1xuXG5jbGFzcyBQaGV0aW9BUElWYWxpZGF0aW9uIHtcbiAgcHJpdmF0ZSByZWFkb25seSBhcGlNaXNtYXRjaGVzOiBBUElNaXNtYXRjaFtdID0gW107XG5cbiAgLy8ga2VlcCB0cmFjayBvZiB3aGVuIHRoZSBzaW0gaGFzIHN0YXJ0ZWQuXG4gIHByaXZhdGUgc2ltSGFzU3RhcnRlZCA9IGZhbHNlO1xuXG4gIC8vIHNldHRhYmxlIGJ5IHF1bml0U3RhcnQuanMuIFZhbGlkYXRpb24gaXMgb25seSBlbmFibGVkIHdoZW4gYWxsIHNjcmVlbnMgYXJlIHByZXNlbnQuXG4gIHB1YmxpYyBlbmFibGVkOiBib29sZWFuID0gISFhc3NlcnQgJiYgVGFuZGVtLlZBTElEQVRJT047XG5cblxuICAvLyB0aGlzIG11c3QgYmUgYWxsIHBoZXQtaW8gdHlwZXMgc28gdGhhdCB0aGVcbiAgLy8gZm9sbG93aW5nIHdvdWxkIGZhaWw6IGFkZCBhIHBoZXRpb1R5cGUsIHRoZW4gcmVtb3ZlIGl0LCB0aGVuIGFkZCBhIGRpZmZlcmVudCBvbmUgdW5kZXIgdGhlIHNhbWUgdHlwZU5hbWUuXG4gIC8vIEEgTm90ZSBhYm91dCBtZW1vcnk6IEV2ZXJ5IElPVHlwZSB0aGF0IGlzIGxvYWRlZCBhcyBhIG1vZHVsZSBpcyBhbHJlYWR5IGxvYWRlZCBvbiB0aGUgbmFtZXNwYWNlLiBUaGVyZWZvcmVcbiAgLy8gdGhpcyBtYXAgZG9lc24ndCBhZGQgYW55IG1lbW9yeSBieSBzdG9yaW5nIHRoZXNlLiBUaGUgZXhjZXB0aW9uIHRvIHRoaXMgaXMgcGFyYW1ldHJpYyBJT1R5cGVzLiBJdCBzaG91bGQgYmVcbiAgLy8gZG91YmxlIGNoZWNrZWQgdGhhdCBhbnl0aGluZyBiZWluZyBwYXNzZWQgaW50byBhIHBhcmFtZXRyaWMgdHlwZSBpcyBtZW1vcnkgc2FmZS4gQXMgb2YgdGhpcyB3cml0aW5nLCBvbmx5IElPVHlwZXNcbiAgLy8gYXJlIHBhc3NlZCB0byBwYXJhbWV0cmljIElPVHlwZXMsIHNvIHRoaXMgcGF0dGVybiByZW1haW5zIG1lbW9yeSBsZWFrIGZyZWUuIEZ1cnRoZXJtb3JlLCB0aGlzIGxpc3QgaXMgb25seVxuICAvLyBwb3B1bGF0ZWQgd2hlbiBgdGhpcy5lbmFibGVkYC5cbiAgcHJpdmF0ZSBldmVyeVBoZXRpb1R5cGU6IFJlY29yZDxzdHJpbmcsIElPVHlwZT4gPSB7fTtcblxuICAvKipcbiAgICogQ2FsbGJhY2sgd2hlbiB0aGUgc2ltdWxhdGlvbiBpcyByZWFkeSB0byBnbywgYW5kIGFsbCBzdGF0aWMgUGhldGlvT2JqZWN0cyBoYXZlIGJlZW4gY3JlYXRlZC5cbiAgICovXG4gIHB1YmxpYyBvblNpbVN0YXJ0ZWQoKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLmVuYWJsZWQgJiYgcGhldC5qb2lzdC5zaW0uYWxsU2NyZWVuc0NyZWF0ZWQgKSB7XG4gICAgICB0aGlzLnZhbGlkYXRlT3ZlcnJpZGVzRmlsZSgpO1xuICAgICAgdGhpcy52YWxpZGF0ZVByZWZlcmVuY2VzTW9kZWwoKTtcbiAgICB9XG5cbiAgICBpZiAoIHBoZXQucHJlbG9hZHMucGhldGlvLnF1ZXJ5UGFyYW1ldGVycy5waGV0aW9QcmludEFQSVByb2JsZW1zICYmIHRoaXMuYXBpTWlzbWF0Y2hlcyApIHtcbiAgICAgIGNvbnNvbGUubG9nKCAnUGhFVC1pTyBBUEkgcHJvYmxlbXMgZGV0ZWN0ZWQ6ICcsIHRoaXMuYXBpTWlzbWF0Y2hlcyApO1xuICAgIH1cblxuICAgIC8vIEFmdGVyIHRoZSBvdmVycmlkZXMgdmFsaWRhdGlvbiB0byBzdXBwb3J0ID9waGV0aW9QcmludEFQSVByb2JsZW1zIG9uIGVycm9ycyB3aXRoIG92ZXJyaWRlcy5cbiAgICB0aGlzLnNpbUhhc1N0YXJ0ZWQgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbCBjb3JlIGVsZW1lbnRzIGluIHRoZSBwcmVmZXJlbmNlc01vZGVsIHNob3VsZCBiZSBwaGV0aW9SZWFkT25seTogZmFsc2Ugc28gdGhleSBjYW4gYmUgc2V0IG92ZXIgdGhlIEFQSVxuICAgKiBvciBmcm9tIHdpdGhpbiBzdHVkaW8sIGJ1dCBwaGV0aW9TdGF0ZTogZmFsc2Ugc28gdGhleSBhcmUgbm90IGNhcHR1cmVkIHdpdGggc2F2ZSBzdGF0ZXMuXG4gICAqL1xuICBwdWJsaWMgdmFsaWRhdGVQcmVmZXJlbmNlc01vZGVsKCk6IHZvaWQge1xuICAgIE9iamVjdC5rZXlzKCBwaGV0LnBoZXRpby5waGV0aW9FbmdpbmUucGhldGlvRWxlbWVudE1hcCApLmZpbHRlcigga2V5ID0+IGtleS5pbmNsdWRlcyggJy5wcmVmZXJlbmNlc01vZGVsLicgKSApXG4gICAgICAuZm9yRWFjaCggcHJlZmVyZW5jZXNLZXkgPT4ge1xuXG4gICAgICAgIGxldCBwaGV0aW9PYmplY3QgPSBwaGV0LnBoZXRpby5waGV0aW9FbmdpbmUucGhldGlvRWxlbWVudE1hcFsgcHJlZmVyZW5jZXNLZXkgXTtcblxuICAgICAgICB3aGlsZSAoIHBoZXRpb09iamVjdCBpbnN0YW5jZW9mIExpbmtlZEVsZW1lbnQgKSB7XG4gICAgICAgICAgcGhldGlvT2JqZWN0ID0gcGhldGlvT2JqZWN0LmVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIXBoZXRpb09iamVjdC5waGV0aW9SZWFkT25seSwgJ3ByZWZlcmVuY2VzIG1vZGVsIGFuZCBpdHMgZGVzY2VuZGFudHMgc2hvdWxkIGJlIHBoZXRpb1JlYWRPbmx5OiBmYWxzZSwga2V5PScgKyBwcmVmZXJlbmNlc0tleSApO1xuXG4gICAgICAgIC8vIEF1ZGlvIG1hbmFnZXIsIGNvbG9yIHByb2ZpbGUgcHJvcGVydHkgYW5kIGxvY2FsZVByb3BlcnR5IGFyZSBzdXBwb3NlZCB0byBiZSBzdGF0ZWZ1bC4gQWxsIG90aGVyIHByZWZlcmVuY2VzXG4gICAgICAgIC8vIHNob3VsZCBiZSBwaGV0aW9TdGF0ZTogZmFsc2Ugc28gdGhleSBhcmUgbm90IGNhcHR1cmVkIGluIHRoZSBzdGF0ZVxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwaGV0aW9PYmplY3QucGhldGlvU3RhdGUgPT09XG4gICAgICAgICAgICAgICAgICAgICAgICAgICggcGhldGlvT2JqZWN0LnBoZXRpb0lELmVuZHNXaXRoKCAnLmNvbG9yUHJvZmlsZVByb3BlcnR5JyApIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGhldGlvT2JqZWN0LnBoZXRpb0lELmVuZHNXaXRoKCAnLmF1ZGlvRW5hYmxlZFByb3BlcnR5JyApIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGhldGlvT2JqZWN0LnBoZXRpb0lELmVuZHNXaXRoKCAnLmxvY2FsZVByb3BlcnR5JyApIHx8XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTaW0gcHJlZmVyZW5jZXMgc2hvdWxkIGFsc28gYmUgc3RhdGVmdWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVmZXJlbmNlc0tleS5pbmNsdWRlcyggJy5zaW11bGF0aW9uTW9kZWwuJyApICksXG4gICAgICAgICAgJ21vc3QgcHJlZmVyZW5jZXMgc2hvdWxkIGJlIHBoZXRpb1N0YXRlOiBmYWxzZSwga2V5PScgKyBwcmVmZXJlbmNlc0tleSApO1xuICAgICAgfSApO1xuICB9XG5cbiAgLy8gVmFsaWRhdGlvbiBjaGVja3MgdGhhdCBjYW4gYmUgbWFkZSBvbiB0aGUgQVBJIEpTT04gb2JqZWN0IGRpcmVjdGx5XG4gIHB1YmxpYyB2YWxpZGF0ZUZ1bGxBUEkoIGFwaTogUGhldGlvQVBJICk6IHZvaWQge1xuICAgIGlmICggdGhpcy5lbmFibGVkICkge1xuICAgICAgY29uc3Qgc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoIGFwaSApO1xuICAgICAgWyBUYW5kZW0uT1BUSU9OQUwubmFtZSwgVGFuZGVtLlJFUVVJUkVELm5hbWUgXS5mb3JFYWNoKCBuYW1lID0+IHtcbiAgICAgICAgaWYgKCBzdHJpbmcuaW5jbHVkZXMoIG5hbWUgKSApIHtcbiAgICAgICAgICB0aGlzLmFzc2VydEFQSUVycm9yKCB7XG4gICAgICAgICAgICBwaGV0aW9JRDogbmFtZSxcbiAgICAgICAgICAgIHJ1bGVJblZpb2xhdGlvbjogJzYuIEFsbCBlbnRyaWVzIGluIHRoZSBBUEkgc2hvdWxkIGJlIGluc3RydW1lbnRlZCAobm8gdXNhZ2VzIG9mIG9wdGlvbmFsL3JlcXVpcmVkVGFuZGVtIGFzIHBoZXRpb0lEcyknXG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBhIHJlbW92ZWQgcGhldGlvT2JqZWN0IGlzIHBhcnQgb2YgYSBHcm91cFxuICAgKi9cbiAgcHVibGljIG9uUGhldGlvT2JqZWN0UmVtb3ZlZCggcGhldGlvT2JqZWN0OiBQaGV0aW9PYmplY3QgKTogdm9pZCB7XG4gICAgaWYgKCAhdGhpcy5lbmFibGVkICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBoZXRpb0lEID0gcGhldGlvT2JqZWN0LnRhbmRlbS5waGV0aW9JRDtcblxuICAgIC8vIGlmIGl0IGlzbid0IGR5bmFtaWMsIHRoZW4gaXQgc2hvdWxkbid0IGJlIHJlbW92ZWQgZHVyaW5nIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltLlxuICAgIGlmICggIXBoZXRpb09iamVjdC5waGV0aW9EeW5hbWljRWxlbWVudCApIHtcbiAgICAgIHRoaXMuYXNzZXJ0QVBJRXJyb3IoIHtcbiAgICAgICAgcGhldGlvSUQ6IHBoZXRpb0lELFxuICAgICAgICBydWxlSW5WaW9sYXRpb246ICcyLiBBbnkgc3RhdGljLCByZWdpc3RlcmVkIFBoZXRpb09iamVjdCBjYW4gbmV2ZXIgYmUgZGVyZWdpc3RlcmVkLidcbiAgICAgIH0gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2hvdWxkIGJlIGNhbGxlZCBmcm9tIHBoZXRpb0VuZ2luZSB3aGVuIGEgUGhldGlvT2JqZWN0IGlzIGFkZGVkIHRvIHRoZSBQaEVULWlPXG4gICAqL1xuICBwdWJsaWMgb25QaGV0aW9PYmplY3RBZGRlZCggcGhldGlvT2JqZWN0OiBQaGV0aW9PYmplY3QgKTogdm9pZCB7XG4gICAgaWYgKCAhdGhpcy5lbmFibGVkICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG5ld1BoZXRpb1R5cGUgPSBwaGV0aW9PYmplY3QucGhldGlvVHlwZTtcbiAgICBjb25zdCBvbGRQaGV0aW9UeXBlID0gdGhpcy5ldmVyeVBoZXRpb1R5cGVbIG5ld1BoZXRpb1R5cGUudHlwZU5hbWUgXTtcblxuICAgIGlmICggIW9sZFBoZXRpb1R5cGUgKSB7IC8vIFRoaXMgbWF5IG5vdCBiZSBuZWNlc3NhcnksIGJ1dCBtYXkgYmUgaGVscGZ1bCBzbyB0aGF0IHdlIGRvbid0IG92ZXJ3cml0ZSBpZiBydWxlIDEwIGlzIGluIHZpb2xhdGlvblxuICAgICAgdGhpcy5ldmVyeVBoZXRpb1R5cGVbIG5ld1BoZXRpb1R5cGUudHlwZU5hbWUgXSA9IG5ld1BoZXRpb1R5cGU7XG4gICAgfVxuXG4gICAgaWYgKCB0aGlzLnNpbUhhc1N0YXJ0ZWQgKSB7XG5cbiAgICAgIC8vIEhlcmUgd2UgbmVlZCB0byBraWNrIHRoaXMgdmFsaWRhdGlvbiB0byB0aGUgbmV4dCBmcmFtZSB0byBzdXBwb3J0IGNvbnN0cnVjdGlvbiBpbiBhbnkgb3JkZXIuIFBhcmVudCBmaXJzdCwgb3JcbiAgICAgIC8vIGNoaWxkIGZpcnN0LiBVc2UgbmFtZXNwYWNlIHRvIGF2b2lkIGJlY2F1c2UgdGltZXIgaXMgYSBQaGV0aW9PYmplY3QuXG4gICAgICBwaGV0LmF4b24uYW5pbWF0aW9uRnJhbWVUaW1lci5ydW5Pbk5leHRUaWNrKCAoKSA9PiB7XG5cbiAgICAgICAgLy8gVGhlIG9ubHkgaW5zdGFuY2VzIHRoYXQgaXQncyBPSyB0byBjcmVhdGUgYWZ0ZXIgc3RhcnR1cCBhcmUgXCJkeW5hbWljIGluc3RhbmNlc1wiIHdoaWNoIGFyZSBtYXJrZWQgYXMgc3VjaC5cbiAgICAgICAgaWYgKCAhcGhldGlvT2JqZWN0LnBoZXRpb0R5bmFtaWNFbGVtZW50ICkge1xuICAgICAgICAgIHRoaXMuYXNzZXJ0QVBJRXJyb3IoIHtcbiAgICAgICAgICAgIHBoZXRpb0lEOiBwaGV0aW9PYmplY3QudGFuZGVtLnBoZXRpb0lELFxuICAgICAgICAgICAgcnVsZUluVmlvbGF0aW9uOiAnMS4gQWZ0ZXIgc3RhcnR1cCwgb25seSBkeW5hbWljIGluc3RhbmNlcyBwcmVzY3JpYmVkIGJ5IHRoZSBiYXNlbGluZSBmaWxlIGNhbiBiZSByZWdpc3RlcmVkLidcbiAgICAgICAgICB9ICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG5cbiAgICAgICAgICAvLyBDb21wYXJlIHRoZSBkeW5hbWljIGVsZW1lbnQgdG8gdGhlIGFyY2hldHlwZSBpZiBjcmVhdGluZyB0aGVtIHRoaXMgcnVudGltZS4gRG9uJ3QgY2hlY2sgdGhpcyBpZiBpdCBoYXNcbiAgICAgICAgICAvLyBhbHJlYWR5IGJlZW4gZGlzcG9zZWQuXG4gICAgICAgICAgaWYgKCBwaGV0LnByZWxvYWRzLnBoZXRpby5jcmVhdGVBcmNoZXR5cGVzICYmICFwaGV0aW9PYmplY3QuaXNEaXNwb3NlZCApIHtcbiAgICAgICAgICAgIGNvbnN0IGFyY2hldHlwZUlEID0gcGhldGlvT2JqZWN0LnRhbmRlbS5nZXRBcmNoZXR5cGFsUGhldGlvSUQoKTtcbiAgICAgICAgICAgIGNvbnN0IGFyY2hldHlwZU1ldGFkYXRhID0gcGhldC5waGV0aW8ucGhldGlvRW5naW5lLmdldFBoZXRpb0VsZW1lbnQoIGFyY2hldHlwZUlEICkuZ2V0TWV0YWRhdGEoKTtcblxuICAgICAgICAgICAgLy8gQ29tcGFyZSB0byB0aGUgc2ltdWxhdGlvbi1kZWZpbmVkIGFyY2hldHlwZVxuICAgICAgICAgICAgdGhpcy5jaGVja0R5bmFtaWNJbnN0YW5jZUFnYWluc3RBcmNoZXR5cGUoIHBoZXRpb09iamVjdCwgYXJjaGV0eXBlTWV0YWRhdGEsICdzaW11bGF0aW9uIGFyY2hldHlwZScgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHZhbGlkYXRlT3ZlcnJpZGVzRmlsZSgpOiB2b2lkIHtcblxuICAgIC8vIGltcG9ydCBwaGV0aW9FbmdpbmUgY2F1c2VzIGEgY3ljbGUgYW5kIGNhbm5vdCBiZSB1c2VkLCBoZW5jZSB3ZSBtdXN0IHVzZSB0aGUgbmFtZXNwYWNlXG4gICAgY29uc3QgZW50aXJlQmFzZWxpbmUgPSBwaGV0LnBoZXRpby5waGV0aW9FbmdpbmUuZ2V0UGhldGlvRWxlbWVudHNCYXNlbGluZSgpO1xuXG4gICAgZm9yICggY29uc3QgcGhldGlvSUQgaW4gd2luZG93LnBoZXQucHJlbG9hZHMucGhldGlvLnBoZXRpb0VsZW1lbnRzT3ZlcnJpZGVzICkge1xuICAgICAgY29uc3QgaXNBcmNoZXR5cGUgPSBwaGV0aW9JRC5pbmNsdWRlcyggRFlOQU1JQ19BUkNIRVRZUEVfTkFNRSApO1xuICAgICAgaWYgKCAhcGhldC5wcmVsb2Fkcy5waGV0aW8uY3JlYXRlQXJjaGV0eXBlcyAmJiAhZW50aXJlQmFzZWxpbmUuaGFzT3duUHJvcGVydHkoIHBoZXRpb0lEICkgKSB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzQXJjaGV0eXBlLCBgcGhldGlvSUQgbWlzc2luZyBmcm9tIHRoZSBiYXNlbGluZSB0aGF0IHdhcyBub3QgYW4gYXJjaGV0eXBlOiAke3BoZXRpb0lEfWAgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBpZiAoICFlbnRpcmVCYXNlbGluZS5oYXNPd25Qcm9wZXJ0eSggcGhldGlvSUQgKSApIHtcbiAgICAgICAgICB0aGlzLmFzc2VydEFQSUVycm9yKCB7XG4gICAgICAgICAgICBwaGV0aW9JRDogcGhldGlvSUQsXG4gICAgICAgICAgICBydWxlSW5WaW9sYXRpb246ICczLiBBbnkgc2NoZW1hIGVudHJpZXMgaW4gdGhlIG92ZXJyaWRlcyBmaWxlIG11c3QgZXhpc3QgaW4gdGhlIGJhc2VsaW5lIGZpbGUuJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdwaGV0aW9JRCBleHBlY3RlZCBpbiB0aGUgYmFzZWxpbmUgZmlsZSBidXQgZG9lcyBub3QgZXhpc3QnXG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgY29uc3Qgb3ZlcnJpZGUgPSB3aW5kb3cucGhldC5wcmVsb2Fkcy5waGV0aW8ucGhldGlvRWxlbWVudHNPdmVycmlkZXNbIHBoZXRpb0lEIF07XG4gICAgICAgICAgY29uc3QgYmFzZWxpbmUgPSBlbnRpcmVCYXNlbGluZVsgcGhldGlvSUQgXTtcblxuICAgICAgICAgIGlmICggT2JqZWN0LmtleXMoIG92ZXJyaWRlICkubGVuZ3RoID09PSAwICkge1xuICAgICAgICAgICAgdGhpcy5hc3NlcnRBUElFcnJvcigge1xuICAgICAgICAgICAgICBwaGV0aW9JRDogcGhldGlvSUQsXG4gICAgICAgICAgICAgIHJ1bGVJblZpb2xhdGlvbjogJzQuIEFueSBzY2hlbWEgZW50cmllcyBpbiB0aGUgb3ZlcnJpZGVzIGZpbGUgbXVzdCBiZSBkaWZmZXJlbnQgZnJvbSBpdHMgYmFzZWxpbmUgY291bnRlcnBhcnQuJyxcbiAgICAgICAgICAgICAgbWVzc2FnZTogJ25vIG1ldGFkYXRhIGtleXMgZm91bmQgZm9yIHRoaXMgb3ZlcnJpZGUuJ1xuICAgICAgICAgICAgfSApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGZvciAoIGNvbnN0IG1ldGFkYXRhS2V5IGluIG92ZXJyaWRlICkge1xuICAgICAgICAgICAgaWYgKCAhYmFzZWxpbmUuaGFzT3duUHJvcGVydHkoIG1ldGFkYXRhS2V5ICkgKSB7XG4gICAgICAgICAgICAgIHRoaXMuYXNzZXJ0QVBJRXJyb3IoIHtcbiAgICAgICAgICAgICAgICBwaGV0aW9JRDogcGhldGlvSUQsXG4gICAgICAgICAgICAgICAgcnVsZUluVmlvbGF0aW9uOiAnOC4gQW55IHNjaGVtYSBlbnRyaWVzIGluIHRoZSBvdmVycmlkZXMgZmlsZSBtdXN0IGJlIGRpZmZlcmVudCBmcm9tIGl0cyBiYXNlbGluZSBjb3VudGVycGFydC4nLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBwaGV0aW9JRCBtZXRhZGF0YSBrZXkgbm90IGZvdW5kIGluIHRoZSBiYXNlbGluZTogJHttZXRhZGF0YUtleX1gXG4gICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCBvdmVycmlkZVsgbWV0YWRhdGFLZXkgXSA9PT0gYmFzZWxpbmVbIG1ldGFkYXRhS2V5IF0gKSB7XG4gICAgICAgICAgICAgIHRoaXMuYXNzZXJ0QVBJRXJyb3IoIHtcbiAgICAgICAgICAgICAgICBwaGV0aW9JRDogcGhldGlvSUQsXG4gICAgICAgICAgICAgICAgcnVsZUluVmlvbGF0aW9uOiAnOC4gQW55IHNjaGVtYSBlbnRyaWVzIGluIHRoZSBvdmVycmlkZXMgZmlsZSBtdXN0IGJlIGRpZmZlcmVudCBmcm9tIGl0cyBiYXNlbGluZSBjb3VudGVycGFydC4nLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdwaGV0aW9JRCBtZXRhZGF0YSBvdmVycmlkZSB2YWx1ZSBpcyB0aGUgc2FtZSBhcyB0aGUgY29ycmVzcG9uZGluZyBtZXRhZGF0YSB2YWx1ZSBpbiB0aGUgYmFzZWxpbmUuJ1xuICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFzc2VydCBvdXQgdGhlIGZhaWxlZCBBUEkgdmFsaWRhdGlvbiBydWxlLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3NlcnRBUElFcnJvciggYXBpRXJyb3JPYmplY3Q6IEFQSU1pc21hdGNoICk6IHZvaWQge1xuXG4gICAgY29uc3QgbWlzbWF0Y2hNZXNzYWdlID0gYXBpRXJyb3JPYmplY3QucGhldGlvSUQgPyBgJHthcGlFcnJvck9iamVjdC5waGV0aW9JRH06ICAke2FwaUVycm9yT2JqZWN0LnJ1bGVJblZpb2xhdGlvbn1gIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHthcGlFcnJvck9iamVjdC5ydWxlSW5WaW9sYXRpb259YDtcblxuICAgIHRoaXMuYXBpTWlzbWF0Y2hlcy5wdXNoKCBhcGlFcnJvck9iamVjdCApO1xuXG4gICAgLy8gSWYgP3BoZXRpb1ByaW50QVBJUHJvYmxlbXMgaXMgcHJlc2VudCwgdGhlbiBpZ25vcmUgYXNzZXJ0aW9ucyB1bnRpbCB0aGUgc2ltIGhhcyBzdGFydGVkIHVwLlxuICAgIGlmICggdGhpcy5zaW1IYXNTdGFydGVkIHx8ICFwaGV0LnByZWxvYWRzLnBoZXRpby5xdWVyeVBhcmFtZXRlcnMucGhldGlvUHJpbnRBUElQcm9ibGVtcyApIHtcbiAgICAgIGlmICggcGhldC5wcmVsb2Fkcy5waGV0aW8ucXVlcnlQYXJhbWV0ZXJzLnBoZXRpb1ByaW50QVBJUHJvYmxlbXMgKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoICdBUEkgUHJvYmxlbXM6JywgdGhpcy5hcGlNaXNtYXRjaGVzICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsIGBQaEVULWlPIEFQSSBlcnJvcjpcXG4ke21pc21hdGNoTWVzc2FnZX1gICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogQ29tcGFyZSBhIGR5bmFtaWMgcGhldGlvT2JqZWN0J3MgbWV0YWRhdGEgdG8gdGhlIGV4cGVjdGVkIG1ldGFkYXRhXG4gICAqL1xuICBwcml2YXRlIGNoZWNrRHluYW1pY0luc3RhbmNlQWdhaW5zdEFyY2hldHlwZSggcGhldGlvT2JqZWN0OiBQaGV0aW9PYmplY3QsIGFyY2hldHlwZU1ldGFkYXRhOiBQaGV0aW9FbGVtZW50TWV0YWRhdGEsIHNvdXJjZTogc3RyaW5nICk6IHZvaWQge1xuICAgIGNvbnN0IGFjdHVhbE1ldGFkYXRhID0gcGhldGlvT2JqZWN0LmdldE1ldGFkYXRhKCk7XG4gICAgS0VZU19UT19DSEVDSy5mb3JFYWNoKCBrZXkgPT4ge1xuXG4gICAgICAvLyBUaGVzZSBhdHRyaWJ1dGVzIGFyZSBkaWZmZXJlbnQgZm9yIGFyY2hldHlwZSB2cyBhY3R1YWxcbiAgICAgIGlmICgga2V5ICE9PSAncGhldGlvRHluYW1pY0VsZW1lbnQnICYmIGtleSAhPT0gJ3BoZXRpb0FyY2hldHlwZVBoZXRpb0lEJyAmJiBrZXkgIT09ICdwaGV0aW9Jc0FyY2hldHlwZScgKSB7XG5cbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIG5vdCBzdXJlIGhvdyB0byBiZSB0eXBlc2FmZSBpbiB0aGUgQVBJIGZpbGVzXG4gICAgICAgIGlmICggYXJjaGV0eXBlTWV0YWRhdGFbIGtleSBdICE9PSBhY3R1YWxNZXRhZGF0YVsga2V5IF0gJiYgcGhldGlvT2JqZWN0LnRhbmRlbSApIHtcbiAgICAgICAgICB0aGlzLmFzc2VydEFQSUVycm9yKCB7XG4gICAgICAgICAgICBwaGV0aW9JRDogcGhldGlvT2JqZWN0LnRhbmRlbS5waGV0aW9JRCxcbiAgICAgICAgICAgIHJ1bGVJblZpb2xhdGlvbjogJzUuIER5bmFtaWMgZWxlbWVudCBtZXRhZGF0YSBzaG91bGQgbWF0Y2ggdGhlIGFyY2hldHlwZSBpbiB0aGUgQVBJLicsXG4gICAgICAgICAgICBzb3VyY2U6IHNvdXJjZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGBtaXNtYXRjaGVkIG1ldGFkYXRhOiAke2tleX1gXG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSApO1xuICB9XG59XG5cblxuY29uc3QgcGhldGlvQVBJVmFsaWRhdGlvbiA9IG5ldyBQaGV0aW9BUElWYWxpZGF0aW9uKCk7XG50YW5kZW1OYW1lc3BhY2UucmVnaXN0ZXIoICdwaGV0aW9BUElWYWxpZGF0aW9uJywgcGhldGlvQVBJVmFsaWRhdGlvbiApO1xuZXhwb3J0IGRlZmF1bHQgcGhldGlvQVBJVmFsaWRhdGlvbjsiXSwibmFtZXMiOlsiTGlua2VkRWxlbWVudCIsIlRhbmRlbSIsIkRZTkFNSUNfQVJDSEVUWVBFX05BTUUiLCJ0YW5kZW1OYW1lc3BhY2UiLCJLRVlTX1RPX0NIRUNLIiwiUGhldGlvQVBJVmFsaWRhdGlvbiIsIm9uU2ltU3RhcnRlZCIsImVuYWJsZWQiLCJwaGV0Iiwiam9pc3QiLCJzaW0iLCJhbGxTY3JlZW5zQ3JlYXRlZCIsInZhbGlkYXRlT3ZlcnJpZGVzRmlsZSIsInZhbGlkYXRlUHJlZmVyZW5jZXNNb2RlbCIsInByZWxvYWRzIiwicGhldGlvIiwicXVlcnlQYXJhbWV0ZXJzIiwicGhldGlvUHJpbnRBUElQcm9ibGVtcyIsImFwaU1pc21hdGNoZXMiLCJjb25zb2xlIiwibG9nIiwic2ltSGFzU3RhcnRlZCIsIk9iamVjdCIsImtleXMiLCJwaGV0aW9FbmdpbmUiLCJwaGV0aW9FbGVtZW50TWFwIiwiZmlsdGVyIiwia2V5IiwiaW5jbHVkZXMiLCJmb3JFYWNoIiwicHJlZmVyZW5jZXNLZXkiLCJwaGV0aW9PYmplY3QiLCJlbGVtZW50IiwiYXNzZXJ0IiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9TdGF0ZSIsInBoZXRpb0lEIiwiZW5kc1dpdGgiLCJ2YWxpZGF0ZUZ1bGxBUEkiLCJhcGkiLCJzdHJpbmciLCJKU09OIiwic3RyaW5naWZ5IiwiT1BUSU9OQUwiLCJuYW1lIiwiUkVRVUlSRUQiLCJhc3NlcnRBUElFcnJvciIsInJ1bGVJblZpb2xhdGlvbiIsIm9uUGhldGlvT2JqZWN0UmVtb3ZlZCIsInRhbmRlbSIsInBoZXRpb0R5bmFtaWNFbGVtZW50Iiwib25QaGV0aW9PYmplY3RBZGRlZCIsIm5ld1BoZXRpb1R5cGUiLCJwaGV0aW9UeXBlIiwib2xkUGhldGlvVHlwZSIsImV2ZXJ5UGhldGlvVHlwZSIsInR5cGVOYW1lIiwiYXhvbiIsImFuaW1hdGlvbkZyYW1lVGltZXIiLCJydW5Pbk5leHRUaWNrIiwiY3JlYXRlQXJjaGV0eXBlcyIsImlzRGlzcG9zZWQiLCJhcmNoZXR5cGVJRCIsImdldEFyY2hldHlwYWxQaGV0aW9JRCIsImFyY2hldHlwZU1ldGFkYXRhIiwiZ2V0UGhldGlvRWxlbWVudCIsImdldE1ldGFkYXRhIiwiY2hlY2tEeW5hbWljSW5zdGFuY2VBZ2FpbnN0QXJjaGV0eXBlIiwiZW50aXJlQmFzZWxpbmUiLCJnZXRQaGV0aW9FbGVtZW50c0Jhc2VsaW5lIiwid2luZG93IiwicGhldGlvRWxlbWVudHNPdmVycmlkZXMiLCJpc0FyY2hldHlwZSIsImhhc093blByb3BlcnR5IiwibWVzc2FnZSIsIm92ZXJyaWRlIiwiYmFzZWxpbmUiLCJsZW5ndGgiLCJtZXRhZGF0YUtleSIsImFwaUVycm9yT2JqZWN0IiwibWlzbWF0Y2hNZXNzYWdlIiwicHVzaCIsImVycm9yIiwic291cmNlIiwiYWN0dWFsTWV0YWRhdGEiLCJWQUxJREFUSU9OIiwicGhldGlvQVBJVmFsaWRhdGlvbiIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7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