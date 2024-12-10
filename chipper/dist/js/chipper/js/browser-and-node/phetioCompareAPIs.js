// Copyright 2021-2024, University of Colorado Boulder
/**
 * Compare PhET-iO APIs for two versions of the same sim. This function treats the first API as the "ground truth"
 * and compares the second API to see if it has any breaking changes against the first API. This function returns a
 * list of "problems".
 *
 * This file runs in node (command line API comparison), in the diff wrapper (client-facing API comparison) and
 * in simulations in phetioEngine when ?ea&phetioCompareAPI is specified (for CT).
 *
 * Note that even though it is a preload, it uses a different global/namespacing pattern than phet-io-initialize-globals.js
 * in order to simplify usage in all these sites.
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ // Import only the types from LoDashStatic, the actual lodash instance is dependency-injected at runtime
import affirm from '../../../perennial-alias/js/browser-and-node/affirm.js';
import isInitialStateCompatible from './isInitialStateCompatible.js';
const METADATA_KEY_NAME = '_metadata';
const DATA_KEY_NAME = '_data';
// Is not the reserved keys to store data/metadata on PhET-iO Elements.
const isChildKey = (key)=>key !== METADATA_KEY_NAME && key !== DATA_KEY_NAME;
/**
 * "up-convert" an API to be in the format of API version >=1.0. This generally is thought of as a "sparse, tree-like" API.
 * @returns - In this version, phetioElements will be structured as a tree, but will have a verbose and complete
 *                  set of all metadata keys for each element. There will not be `metadataDefaults` in each type.
 */ const toStructuredTree = (api, _)=>{
    const sparseAPI = _.cloneDeep(api);
    // DUPLICATED with phetioEngine.js
    const sparseElements = {};
    Object.keys(api.phetioElements).forEach((phetioID)=>{
        const entry = api.phetioElements[phetioID];
        // API versions < 1.0, use a tandem separator of '.'  If we ever change this separator in main (hopefully not!)
        // this value wouldn't change since it reflects the prior committed versions which do use '.'
        const chain = phetioID.split('.');
        // Fill in each level
        let level = sparseElements;
        chain.forEach((componentName)=>{
            level[componentName] = level[componentName] || {};
            level = level[componentName];
        });
        level[METADATA_KEY_NAME] = {};
        Object.keys(entry).forEach((key)=>{
            // write all values without trying to factor out defaults
            // @ts-expect-error HELP!!!
            level[METADATA_KEY_NAME][key] = entry[key];
        });
    });
    sparseAPI.phetioElements = sparseElements;
    return sparseAPI;
};
const getMetadataValues = (phetioElement, api, _)=>{
    const ioTypeName = phetioElement[METADATA_KEY_NAME] ? phetioElement[METADATA_KEY_NAME].phetioTypeName || 'ObjectIO' : 'ObjectIO';
    if (api.version) {
        const defaults = getMetadataDefaults(ioTypeName, api, _);
        return _.merge(defaults, phetioElement[METADATA_KEY_NAME]);
    } else {
        // Dense version supplies all metadata values
        return phetioElement[METADATA_KEY_NAME];
    }
};
/**
 * @returns - defensive copy, non-mutating
 */ const getMetadataDefaults = (typeName, api, _)=>{
    const entry = api.phetioTypes[typeName];
    affirm(entry, `entry missing: ${typeName}`);
    if (entry.supertype) {
        return _.merge(getMetadataDefaults(entry.supertype, api, _), entry.metadataDefaults);
    } else {
        return _.merge({}, entry.metadataDefaults);
    }
};
/**
 * @returns  - whether or not the API is "old", meaning it uses a "flat" structure for phetioElements
 */ const isOldAPIVersion = (api)=>{
    return !api.hasOwnProperty('version');
};
/**
 * Compare two APIs for breaking or design changes.
 *
 * @param referenceAPI - the "ground truth" or reference API
 * @param proposedAPI - the proposed API for comparison with referenceAPI
 * @param _ - lodash, so this can be used from different contexts.
 * @param providedOptions
 */ const phetioCompareAPIs = (referenceAPI, proposedAPI, _, providedOptions)=>{
    // If the proposed version predates 1.0, then bring it forward to the structured tree with metadata under `_metadata`.
    if (isOldAPIVersion(proposedAPI)) {
        proposedAPI = toStructuredTree(proposedAPI, _);
    }
    if (isOldAPIVersion(referenceAPI)) {
        referenceAPI = toStructuredTree(referenceAPI, _);
    }
    const options = _.assignIn({
        compareDesignedAPIChanges: true,
        compareBreakingAPIChanges: true
    }, providedOptions);
    const breakingProblems = [];
    const designedProblems = [];
    const appendProblem = (problemString, isDesignedProblem = false)=>{
        if (isDesignedProblem && options.compareDesignedAPIChanges) {
            designedProblems.push(problemString);
        } else if (!isDesignedProblem && options.compareBreakingAPIChanges) {
            breakingProblems.push(problemString);
        }
    };
    const appendBothProblems = (problemString, isDesignedElement)=>{
        appendProblem(problemString, false);
        isDesignedElement && appendProblem(problemString, true);
    };
    /**
   * Visit one element along the APIs.
   * @param trail - the path of tandem componentNames
   * @param reference - current value in the referenceAPI
   * @param proposed - current value in the proposedAPI
   * @param isDesignedElement - are we testing for designed changes, or for breaking changes.
   */ const visit = (trail, reference, proposed, isDesignedElement)=>{
        var _proposed__data;
        const phetioID = trail.join('.');
        // Detect an instrumented instance
        if (reference.hasOwnProperty(METADATA_KEY_NAME)) {
            // Override isDesigned, if specified. Once on, you cannot turn off a subtree.
            isDesignedElement = isDesignedElement || reference[METADATA_KEY_NAME].phetioDesigned;
            const referenceCompleteMetadata = getMetadataValues(reference, referenceAPI, _);
            const proposedCompleteMetadata = getMetadataValues(proposed, proposedAPI, _);
            /**
       * Push any problems that may exist for the provided metadataKey.
       * @param metadataKey - See PhetioObject.getMetadata()
       * @param isDesignedChange - if the difference is from a design change, and not from a breaking change test
       * @param invalidProposedValue - an optional new value that would signify a breaking change. Any other value would be acceptable.
       */ const reportDifferences = (metadataKey, isDesignedChange, invalidProposedValue)=>{
                const referenceValue = referenceCompleteMetadata[metadataKey];
                // Gracefully handle missing metadata from the <1.0 API format
                const proposedValue = proposedCompleteMetadata ? proposedCompleteMetadata[metadataKey] : {};
                if (referenceValue !== proposedValue) {
                    // if proposed API is older (no version specified), ignore phetioArchetypePhetioID changed from null to undefined
                    // because it used to be sparse, and in version 1.0 it became a default.
                    const ignoreBrokenProposed = isOldAPIVersion(proposedAPI) && metadataKey === 'phetioArchetypePhetioID' && referenceValue === null && proposedValue === undefined;
                    const ignoreBrokenReference = isOldAPIVersion(referenceAPI) && metadataKey === 'phetioArchetypePhetioID' && proposedValue === null && referenceValue === undefined;
                    const ignore = ignoreBrokenProposed || ignoreBrokenReference;
                    if (!ignore) {
                        if (invalidProposedValue === undefined || isDesignedChange) {
                            appendProblem(`${phetioID}.${metadataKey} changed from "${referenceValue}" to "${proposedValue}"`, isDesignedChange);
                        } else if (!isDesignedChange) {
                            if (proposedValue === invalidProposedValue) {
                                appendProblem(`${phetioID}.${metadataKey} changed from "${referenceValue}" to "${proposedValue}"`);
                            } else {
                            // value changed, but it was a widening API (adding something to state, or making something read/write)
                            }
                        }
                    }
                }
            };
            // Check for breaking changes
            reportDifferences('phetioTypeName', false);
            reportDifferences('phetioEventType', false);
            reportDifferences('phetioPlayback', false);
            reportDifferences('phetioDynamicElement', false);
            reportDifferences('phetioIsArchetype', false);
            reportDifferences('phetioArchetypePhetioID', false);
            reportDifferences('phetioState', false, false); // Only report if something became non-stateful
            reportDifferences('phetioReadOnly', false, true); // Only need to report if something became readOnly
            // The following metadata keys are non-breaking:
            // 'phetioDocumentation'
            // 'phetioFeatured'
            // 'phetioHighFrequency', non-breaking, assuming clients with data have the full data stream
            // Check for design changes
            if (isDesignedElement) {
                Object.keys(referenceCompleteMetadata).forEach((metadataKey)=>{
                    reportDifferences(metadataKey, true);
                });
            }
            // If the reference file declares an initial state, check that it hasn't changed
            if (reference._data && reference._data.initialState) {
                // Detect missing expected state
                if (!proposed._data || !proposed._data.initialState) {
                    // apiStateKeys "transition" means error more loudly, since we cannot test the apiStateKeys themselves
                    if (apiSupportsAPIStateKeys(referenceAPI) !== apiSupportsAPIStateKeys(proposedAPI)) {
                        // Missing but expected state is a breaking problem
                        // It is also a designed problem if we expected state in a designed subtree
                        appendBothProblems(`${phetioID}._data.initialState is missing from proposed API`, false);
                    }
                } else {
                    // initialState comparison
                    const referencesInitialState = reference._data.initialState;
                    const proposedInitialState = proposed._data.initialState;
                    const testInitialState = (testDesigned)=>{
                        const isCompatible = _.isEqualWith(referencesInitialState, proposedInitialState, (referenceState, proposedState)=>{
                            // Top level object comparison of the entire state (not a component piece)
                            if (referencesInitialState === referenceState && proposedInitialState === proposedState) {
                                // The validValues of the localeProperty changes each time a new translation is submitted for a sim.
                                if (phetioID === trail[0] + '.general.model.localeProperty') {
                                    // We do not worry about the notion of "designing" available locales. For breaking changes: the sim
                                    // must have all expected locales, but it is acceptable to add new one without API error.
                                    return testDesigned || referenceState.validValues.every((validValue)=>proposedState.validValues.includes(validValue));
                                } else if (testDesigned) {
                                    return undefined; // Meaning use the default lodash algorithm for comparison.
                                } else {
                                    // Breaking change test uses the general algorithm for initial state compatibility.
                                    // referenceState is the ground truth for compatibility
                                    return isInitialStateCompatible(referenceState, proposedState);
                                }
                            }
                            return undefined; // Meaning use the default lodash algorithm for comparison.
                        });
                        if (!isCompatible) {
                            const problemString = `${phetioID}._data.initialState differs. \nExpected:\n${JSON.stringify(reference._data.initialState)}\n actual:\n${JSON.stringify(proposed._data.initialState)}\n`;
                            // Report only designed problems if on a designed element.
                            const reportTheProblem = !testDesigned || isDesignedElement;
                            reportTheProblem && appendProblem(problemString, testDesigned);
                        }
                    };
                    // It is also a designed problem if the proposed values deviate from the specified designed values
                    testInitialState(true);
                    // A changed state value could break a client wrapper, so identify it with breaking changes.
                    testInitialState(false);
                }
            }
        } else if ((_proposed__data = proposed._data) == null ? void 0 : _proposed__data.initialState) {
            // We don't have reference state, but do have a new initialState. this is a designed change
            isDesignedElement && appendProblem(`${phetioID}._data.initialState is not in reference API but is in proposed`, true);
        }
        // Recurse to children
        for(const componentName in reference){
            if (reference.hasOwnProperty(componentName) && isChildKey(componentName)) {
                if (!proposed.hasOwnProperty(componentName)) {
                    appendBothProblems(`PhET-iO Element missing: ${phetioID}.${componentName}`, isDesignedElement);
                } else {
                    visit(trail.concat(componentName), reference[componentName], proposed[componentName], isDesignedElement);
                }
            }
        }
        for(const componentName in proposed){
            if (isDesignedElement && proposed.hasOwnProperty(componentName) && isChildKey(componentName) && !reference.hasOwnProperty(componentName)) {
                appendProblem(`New PhET-iO Element (or uninstrumented intermediate container) not in reference: ${phetioID}.${componentName}`, true);
            }
        }
    };
    visit([], referenceAPI.phetioElements, proposedAPI.phetioElements, false);
    // Check for: missing IOTypes, missing methods, or differing parameter types or return types
    for(const typeName in referenceAPI.phetioTypes){
        // TODO: We need a notion of phetioDesigned for Type comparison. https://github.com/phetsims/phet-io/issues/1999
        // TODO: add comparison for stateSchema https://github.com/phetsims/phet-io/issues/1999
        if (referenceAPI.phetioTypes.hasOwnProperty(typeName)) {
            // make sure we have the desired type
            if (!proposedAPI.phetioTypes.hasOwnProperty(typeName)) {
                appendProblem(`Type missing: ${typeName}`);
            } else {
                const referenceType = referenceAPI.phetioTypes[typeName];
                const proposedType = proposedAPI.phetioTypes[typeName];
                // make sure we have all of the methods
                const referenceMethods = referenceType.methods;
                const proposedMethods = proposedType.methods;
                for(const referenceMethod in referenceMethods){
                    if (referenceMethods.hasOwnProperty(referenceMethod)) {
                        if (!proposedMethods.hasOwnProperty(referenceMethod)) {
                            appendProblem(`Method missing, type=${typeName}, method=${referenceMethod}`);
                        } else {
                            // check parameter types (exact match)
                            const referenceParams = referenceMethods[referenceMethod].parameterTypes;
                            const proposedParams = proposedMethods[referenceMethod].parameterTypes;
                            if (referenceParams.join(',') !== proposedParams.join(',')) {
                                appendProblem(`${typeName}.${referenceMethod} has different parameter types: [${referenceParams.join(', ')}] => [${proposedParams.join(', ')}]`);
                            }
                            const referenceReturnType = referenceMethods[referenceMethod].returnType;
                            const proposedReturnType = proposedMethods[referenceMethod].returnType;
                            if (referenceReturnType !== proposedReturnType) {
                                appendProblem(`${typeName}.${referenceMethod} has a different return type ${referenceReturnType} => ${proposedReturnType}`);
                            }
                        }
                    }
                }
                // make sure we have all of the events (OK to add more)
                const referenceEvents = referenceType.events;
                const proposedEvents = proposedType.events;
                referenceEvents.forEach((event)=>{
                    if (!proposedEvents.includes(event)) {
                        appendProblem(`${typeName} is missing event: ${event}`);
                    }
                });
                if (apiSupportsAPIStateKeys(referenceAPI) && apiSupportsAPIStateKeys(proposedAPI)) {
                    if (!!referenceType.apiStateKeys !== !!proposedType.apiStateKeys) {
                        const result = referenceType.apiStateKeys ? 'present' : 'absent';
                        const problemString = `${typeName} apiStateKeys unexpectedly ${result}`;
                        appendProblem(problemString, true);
                        // Breaking if we lost apiStateKeys
                        referenceType.apiStateKeys && appendProblem(problemString, false);
                    } else {
                        const referenceAPIStateKeys = referenceType.apiStateKeys;
                        const proposedAPIStateKeys = proposedType.apiStateKeys;
                        if (!_.isEqual(referenceAPIStateKeys, proposedAPIStateKeys)) {
                            const inReferenceNotProposed = _.difference(referenceAPIStateKeys, proposedAPIStateKeys);
                            const inProposedNotReference = _.difference(proposedAPIStateKeys, referenceAPIStateKeys);
                            appendProblem(`${typeName} apiStateKeys differ:\n` + `  In reference: ${inReferenceNotProposed}\n` + `  In proposed: ${inProposedNotReference}`, true);
                            // It is only breaking if we lost an apiStateKey
                            if (!_.every(referenceAPIStateKeys, (reference)=>proposedAPIStateKeys.includes(reference))) {
                                appendProblem(`${typeName} apiStateKeys missing from proposed: ${inReferenceNotProposed}`, false);
                            }
                        }
                    }
                }
                // make sure we have matching supertype names
                const referenceSupertypeName = referenceType.supertype;
                const proposedSupertypeName = proposedType.supertype;
                if (referenceSupertypeName !== proposedSupertypeName) {
                    appendProblem(`${typeName} supertype changed from "${referenceSupertypeName}" to "${proposedSupertypeName}". This may or may not 
          be a breaking change, but we are reporting it just in case.`);
                }
                // make sure we have matching parameter types
                const referenceParameterTypes = referenceType.parameterTypes || [];
                const proposedParameterTypes = proposedType.parameterTypes;
                if (!_.isEqual(referenceParameterTypes, proposedParameterTypes)) {
                    appendProblem(`${typeName} parameter types changed from [${referenceParameterTypes.join(', ')}] to [${proposedParameterTypes.join(', ')}]. This may or may not 
          be a breaking change, but we are reporting it just in case.`);
                }
                // This check assumes that each API will be of a version that has metadataDefaults
                if (referenceAPI.version && proposedAPI.version) {
                    // Check whether the default values have changed. See https://github.com/phetsims/phet-io/issues/1753
                    const referenceDefaults = referenceAPI.phetioTypes[typeName].metadataDefaults;
                    const proposedDefaults = proposedAPI.phetioTypes[typeName].metadataDefaults;
                    if (!!referenceDefaults !== !!proposedDefaults) {
                        appendProblem(`${typeName} metadata defaults not found from "${referenceDefaults}" to "${proposedDefaults}". This may or may not be a breaking change, but we are reporting it just in case.`);
                    } else if (referenceDefaults && proposedDefaults) {
                        Object.keys(referenceDefaults).forEach((key)=>{
                            if (referenceDefaults[key] !== proposedDefaults[key]) {
                                appendProblem(`${typeName} metadata value ${key} changed from "${referenceDefaults[key]}" to "${proposedDefaults[key]}". This may or may not be a breaking change, but we are reporting it just in case.`);
                            }
                        });
                    }
                }
            }
        }
    }
    return {
        breakingProblems: breakingProblems,
        designedProblems: designedProblems
    };
};
const apiSupportsAPIStateKeys = (api)=>api.version && api.version.major >= 1 && api.version.minor >= 1;
// used to "up-convert" an old versioned API to the new (version >=1), structured tree API.
phetioCompareAPIs.toStructuredTree = toStructuredTree;
export default phetioCompareAPIs;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2Jyb3dzZXItYW5kLW5vZGUvcGhldGlvQ29tcGFyZUFQSXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQ29tcGFyZSBQaEVULWlPIEFQSXMgZm9yIHR3byB2ZXJzaW9ucyBvZiB0aGUgc2FtZSBzaW0uIFRoaXMgZnVuY3Rpb24gdHJlYXRzIHRoZSBmaXJzdCBBUEkgYXMgdGhlIFwiZ3JvdW5kIHRydXRoXCJcbiAqIGFuZCBjb21wYXJlcyB0aGUgc2Vjb25kIEFQSSB0byBzZWUgaWYgaXQgaGFzIGFueSBicmVha2luZyBjaGFuZ2VzIGFnYWluc3QgdGhlIGZpcnN0IEFQSS4gVGhpcyBmdW5jdGlvbiByZXR1cm5zIGFcbiAqIGxpc3Qgb2YgXCJwcm9ibGVtc1wiLlxuICpcbiAqIFRoaXMgZmlsZSBydW5zIGluIG5vZGUgKGNvbW1hbmQgbGluZSBBUEkgY29tcGFyaXNvbiksIGluIHRoZSBkaWZmIHdyYXBwZXIgKGNsaWVudC1mYWNpbmcgQVBJIGNvbXBhcmlzb24pIGFuZFxuICogaW4gc2ltdWxhdGlvbnMgaW4gcGhldGlvRW5naW5lIHdoZW4gP2VhJnBoZXRpb0NvbXBhcmVBUEkgaXMgc3BlY2lmaWVkIChmb3IgQ1QpLlxuICpcbiAqIE5vdGUgdGhhdCBldmVuIHRob3VnaCBpdCBpcyBhIHByZWxvYWQsIGl0IHVzZXMgYSBkaWZmZXJlbnQgZ2xvYmFsL25hbWVzcGFjaW5nIHBhdHRlcm4gdGhhbiBwaGV0LWlvLWluaXRpYWxpemUtZ2xvYmFscy5qc1xuICogaW4gb3JkZXIgdG8gc2ltcGxpZnkgdXNhZ2UgaW4gYWxsIHRoZXNlIHNpdGVzLlxuICpcbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbi8vIEltcG9ydCBvbmx5IHRoZSB0eXBlcyBmcm9tIExvRGFzaFN0YXRpYywgdGhlIGFjdHVhbCBsb2Rhc2ggaW5zdGFuY2UgaXMgZGVwZW5kZW5jeS1pbmplY3RlZCBhdCBydW50aW1lXG5pbXBvcnQgdHlwZSB7IExvRGFzaFN0YXRpYyB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgYWZmaXJtIGZyb20gJy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9icm93c2VyLWFuZC1ub2RlL2FmZmlybS5qcyc7XG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcblxuaW1wb3J0IHsgRmxhdHRlbmVkQVBJUGhldGlvRWxlbWVudHMsIFBoZXRpb0FQSSwgUGhldGlvRWxlbWVudCwgUGhldGlvRWxlbWVudE1ldGFkYXRhLCBQaGV0aW9FbGVtZW50TWV0YWRhdGFWYWx1ZSwgUGhldGlvRWxlbWVudHMsIFBoZXRpb0VsZW1lbnRTdGF0ZSB9IGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9waGV0LWlvLXR5cGVzLmpzJztcbmltcG9ydCBpc0luaXRpYWxTdGF0ZUNvbXBhdGlibGUgZnJvbSAnLi9pc0luaXRpYWxTdGF0ZUNvbXBhdGlibGUuanMnO1xuXG5leHBvcnQgdHlwZSBQaGV0aW9Db21wYXJlQVBJc09wdGlvbnMgPSB7XG4gIGNvbXBhcmVCcmVha2luZ0FQSUNoYW5nZXM6IGJvb2xlYW47XG4gIGNvbXBhcmVEZXNpZ25lZEFQSUNoYW5nZXM6IGJvb2xlYW47XG59O1xuXG50eXBlIFBoZXRpb0NvbXBhcmVBUElzUmVzdWx0ID0ge1xuICBicmVha2luZ1Byb2JsZW1zOiBzdHJpbmdbXTtcbiAgZGVzaWduZWRQcm9ibGVtczogc3RyaW5nW107XG59O1xuXG5jb25zdCBNRVRBREFUQV9LRVlfTkFNRSA9ICdfbWV0YWRhdGEnO1xuY29uc3QgREFUQV9LRVlfTkFNRSA9ICdfZGF0YSc7XG5cbi8vIElzIG5vdCB0aGUgcmVzZXJ2ZWQga2V5cyB0byBzdG9yZSBkYXRhL21ldGFkYXRhIG9uIFBoRVQtaU8gRWxlbWVudHMuXG5jb25zdCBpc0NoaWxkS2V5ID0gKCBrZXk6IHN0cmluZyApID0+IGtleSAhPT0gTUVUQURBVEFfS0VZX05BTUUgJiYga2V5ICE9PSBEQVRBX0tFWV9OQU1FO1xuXG4vKipcbiAqIFwidXAtY29udmVydFwiIGFuIEFQSSB0byBiZSBpbiB0aGUgZm9ybWF0IG9mIEFQSSB2ZXJzaW9uID49MS4wLiBUaGlzIGdlbmVyYWxseSBpcyB0aG91Z2h0IG9mIGFzIGEgXCJzcGFyc2UsIHRyZWUtbGlrZVwiIEFQSS5cbiAqIEByZXR1cm5zIC0gSW4gdGhpcyB2ZXJzaW9uLCBwaGV0aW9FbGVtZW50cyB3aWxsIGJlIHN0cnVjdHVyZWQgYXMgYSB0cmVlLCBidXQgd2lsbCBoYXZlIGEgdmVyYm9zZSBhbmQgY29tcGxldGVcbiAqICAgICAgICAgICAgICAgICAgc2V0IG9mIGFsbCBtZXRhZGF0YSBrZXlzIGZvciBlYWNoIGVsZW1lbnQuIFRoZXJlIHdpbGwgbm90IGJlIGBtZXRhZGF0YURlZmF1bHRzYCBpbiBlYWNoIHR5cGUuXG4gKi9cbmNvbnN0IHRvU3RydWN0dXJlZFRyZWUgPSAoIGFwaTogeyBwaGV0aW9FbGVtZW50czogRmxhdHRlbmVkQVBJUGhldGlvRWxlbWVudHMgfSwgXzogTG9EYXNoU3RhdGljICk6IFBoZXRpb0FQSSA9PiB7XG4gIGNvbnN0IHNwYXJzZUFQSSA9IF8uY2xvbmVEZWVwKCBhcGkgKSBhcyBQaGV0aW9BUEk7XG5cbiAgLy8gRFVQTElDQVRFRCB3aXRoIHBoZXRpb0VuZ2luZS5qc1xuICBjb25zdCBzcGFyc2VFbGVtZW50czogSW50ZW50aW9uYWxBbnkgPSB7fTtcbiAgT2JqZWN0LmtleXMoIGFwaS5waGV0aW9FbGVtZW50cyApLmZvckVhY2goIHBoZXRpb0lEID0+IHtcbiAgICBjb25zdCBlbnRyeSA9IGFwaS5waGV0aW9FbGVtZW50c1sgcGhldGlvSUQgXTtcblxuICAgIC8vIEFQSSB2ZXJzaW9ucyA8IDEuMCwgdXNlIGEgdGFuZGVtIHNlcGFyYXRvciBvZiAnLicgIElmIHdlIGV2ZXIgY2hhbmdlIHRoaXMgc2VwYXJhdG9yIGluIG1haW4gKGhvcGVmdWxseSBub3QhKVxuICAgIC8vIHRoaXMgdmFsdWUgd291bGRuJ3QgY2hhbmdlIHNpbmNlIGl0IHJlZmxlY3RzIHRoZSBwcmlvciBjb21taXR0ZWQgdmVyc2lvbnMgd2hpY2ggZG8gdXNlICcuJ1xuICAgIGNvbnN0IGNoYWluID0gcGhldGlvSUQuc3BsaXQoICcuJyApO1xuXG4gICAgLy8gRmlsbCBpbiBlYWNoIGxldmVsXG4gICAgbGV0IGxldmVsID0gc3BhcnNlRWxlbWVudHM7XG4gICAgY2hhaW4uZm9yRWFjaCggY29tcG9uZW50TmFtZSA9PiB7XG4gICAgICBsZXZlbFsgY29tcG9uZW50TmFtZSBdID0gbGV2ZWxbIGNvbXBvbmVudE5hbWUgXSB8fCB7fTtcbiAgICAgIGxldmVsID0gbGV2ZWxbIGNvbXBvbmVudE5hbWUgXTtcbiAgICB9ICk7XG5cbiAgICBsZXZlbFsgTUVUQURBVEFfS0VZX05BTUUgXSA9IHt9O1xuXG4gICAgT2JqZWN0LmtleXMoIGVudHJ5ICkuZm9yRWFjaCgga2V5ID0+IHtcblxuICAgICAgICAvLyB3cml0ZSBhbGwgdmFsdWVzIHdpdGhvdXQgdHJ5aW5nIHRvIGZhY3RvciBvdXQgZGVmYXVsdHNcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBIRUxQISEhXG4gICAgICAgIGxldmVsWyBNRVRBREFUQV9LRVlfTkFNRSBdWyBrZXkgXSA9IGVudHJ5WyBrZXkgXTtcbiAgICAgIH1cbiAgICApO1xuICB9ICk7XG5cbiAgc3BhcnNlQVBJLnBoZXRpb0VsZW1lbnRzID0gc3BhcnNlRWxlbWVudHM7XG4gIHJldHVybiBzcGFyc2VBUEk7XG59O1xuXG5jb25zdCBnZXRNZXRhZGF0YVZhbHVlcyA9ICggcGhldGlvRWxlbWVudDogUGhldGlvRWxlbWVudCwgYXBpOiBQaGV0aW9BUEksIF86IExvRGFzaFN0YXRpYyApOiBQaGV0aW9FbGVtZW50TWV0YWRhdGEgPT4ge1xuICBjb25zdCBpb1R5cGVOYW1lID0gcGhldGlvRWxlbWVudFsgTUVUQURBVEFfS0VZX05BTUUgXSA/ICggcGhldGlvRWxlbWVudFsgTUVUQURBVEFfS0VZX05BTUUgXS5waGV0aW9UeXBlTmFtZSB8fCAnT2JqZWN0SU8nICkgOiAnT2JqZWN0SU8nO1xuXG4gIGlmICggYXBpLnZlcnNpb24gKSB7XG4gICAgY29uc3QgZGVmYXVsdHMgPSBnZXRNZXRhZGF0YURlZmF1bHRzKCBpb1R5cGVOYW1lLCBhcGksIF8gKTtcbiAgICByZXR1cm4gXy5tZXJnZSggZGVmYXVsdHMsIHBoZXRpb0VsZW1lbnRbIE1FVEFEQVRBX0tFWV9OQU1FIF0gKTtcbiAgfVxuICBlbHNlIHtcblxuICAgIC8vIERlbnNlIHZlcnNpb24gc3VwcGxpZXMgYWxsIG1ldGFkYXRhIHZhbHVlc1xuICAgIHJldHVybiBwaGV0aW9FbGVtZW50WyBNRVRBREFUQV9LRVlfTkFNRSBdO1xuICB9XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIC0gZGVmZW5zaXZlIGNvcHksIG5vbi1tdXRhdGluZ1xuICovXG5jb25zdCBnZXRNZXRhZGF0YURlZmF1bHRzID0gKCB0eXBlTmFtZTogc3RyaW5nLCBhcGk6IFBoZXRpb0FQSSwgXzogTG9EYXNoU3RhdGljICk6IFBoZXRpb0VsZW1lbnRNZXRhZGF0YSA9PiB7XG4gIGNvbnN0IGVudHJ5ID0gYXBpLnBoZXRpb1R5cGVzWyB0eXBlTmFtZSBdO1xuICBhZmZpcm0oIGVudHJ5LCBgZW50cnkgbWlzc2luZzogJHt0eXBlTmFtZX1gICk7XG4gIGlmICggZW50cnkuc3VwZXJ0eXBlICkge1xuICAgIHJldHVybiBfLm1lcmdlKCBnZXRNZXRhZGF0YURlZmF1bHRzKCBlbnRyeS5zdXBlcnR5cGUsIGFwaSwgXyApLCBlbnRyeS5tZXRhZGF0YURlZmF1bHRzICk7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIF8ubWVyZ2UoIHt9LCBlbnRyeS5tZXRhZGF0YURlZmF1bHRzICkgYXMgUGhldGlvRWxlbWVudE1ldGFkYXRhO1xuICB9XG59O1xuXG4vKipcbiAqIEByZXR1cm5zICAtIHdoZXRoZXIgb3Igbm90IHRoZSBBUEkgaXMgXCJvbGRcIiwgbWVhbmluZyBpdCB1c2VzIGEgXCJmbGF0XCIgc3RydWN0dXJlIGZvciBwaGV0aW9FbGVtZW50c1xuICovXG5jb25zdCBpc09sZEFQSVZlcnNpb24gPSAoIGFwaTogUGhldGlvQVBJICk6IGJvb2xlYW4gPT4ge1xuICByZXR1cm4gIWFwaS5oYXNPd25Qcm9wZXJ0eSggJ3ZlcnNpb24nICk7XG59O1xuXG4vKipcbiAqIENvbXBhcmUgdHdvIEFQSXMgZm9yIGJyZWFraW5nIG9yIGRlc2lnbiBjaGFuZ2VzLlxuICpcbiAqIEBwYXJhbSByZWZlcmVuY2VBUEkgLSB0aGUgXCJncm91bmQgdHJ1dGhcIiBvciByZWZlcmVuY2UgQVBJXG4gKiBAcGFyYW0gcHJvcG9zZWRBUEkgLSB0aGUgcHJvcG9zZWQgQVBJIGZvciBjb21wYXJpc29uIHdpdGggcmVmZXJlbmNlQVBJXG4gKiBAcGFyYW0gXyAtIGxvZGFzaCwgc28gdGhpcyBjYW4gYmUgdXNlZCBmcm9tIGRpZmZlcmVudCBjb250ZXh0cy5cbiAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnNcbiAqL1xuY29uc3QgcGhldGlvQ29tcGFyZUFQSXMgPSAoIHJlZmVyZW5jZUFQSTogUGhldGlvQVBJLCBwcm9wb3NlZEFQSTogUGhldGlvQVBJLCBfOiBMb0Rhc2hTdGF0aWMsIHByb3ZpZGVkT3B0aW9ucz86IFBhcnRpYWw8UGhldGlvQ29tcGFyZUFQSXNPcHRpb25zPiApOiBQaGV0aW9Db21wYXJlQVBJc1Jlc3VsdCA9PiB7XG5cbiAgLy8gSWYgdGhlIHByb3Bvc2VkIHZlcnNpb24gcHJlZGF0ZXMgMS4wLCB0aGVuIGJyaW5nIGl0IGZvcndhcmQgdG8gdGhlIHN0cnVjdHVyZWQgdHJlZSB3aXRoIG1ldGFkYXRhIHVuZGVyIGBfbWV0YWRhdGFgLlxuICBpZiAoIGlzT2xkQVBJVmVyc2lvbiggcHJvcG9zZWRBUEkgKSApIHtcbiAgICBwcm9wb3NlZEFQSSA9IHRvU3RydWN0dXJlZFRyZWUoIHByb3Bvc2VkQVBJLCBfICk7XG4gIH1cblxuICBpZiAoIGlzT2xkQVBJVmVyc2lvbiggcmVmZXJlbmNlQVBJICkgKSB7XG4gICAgcmVmZXJlbmNlQVBJID0gdG9TdHJ1Y3R1cmVkVHJlZSggcmVmZXJlbmNlQVBJLCBfICk7XG4gIH1cblxuICBjb25zdCBvcHRpb25zOiBQaGV0aW9Db21wYXJlQVBJc09wdGlvbnMgPSBfLmFzc2lnbkluKCB7XG4gICAgY29tcGFyZURlc2lnbmVkQVBJQ2hhbmdlczogdHJ1ZSxcbiAgICBjb21wYXJlQnJlYWtpbmdBUElDaGFuZ2VzOiB0cnVlXG4gIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gIGNvbnN0IGJyZWFraW5nUHJvYmxlbXM6IHN0cmluZ1tdID0gW107XG4gIGNvbnN0IGRlc2lnbmVkUHJvYmxlbXM6IHN0cmluZ1tdID0gW107XG5cbiAgY29uc3QgYXBwZW5kUHJvYmxlbSA9ICggcHJvYmxlbVN0cmluZzogc3RyaW5nLCBpc0Rlc2lnbmVkUHJvYmxlbSA9IGZhbHNlICkgPT4ge1xuICAgIGlmICggaXNEZXNpZ25lZFByb2JsZW0gJiYgb3B0aW9ucy5jb21wYXJlRGVzaWduZWRBUElDaGFuZ2VzICkge1xuICAgICAgZGVzaWduZWRQcm9ibGVtcy5wdXNoKCBwcm9ibGVtU3RyaW5nICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCAhaXNEZXNpZ25lZFByb2JsZW0gJiYgb3B0aW9ucy5jb21wYXJlQnJlYWtpbmdBUElDaGFuZ2VzICkge1xuICAgICAgYnJlYWtpbmdQcm9ibGVtcy5wdXNoKCBwcm9ibGVtU3RyaW5nICk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGFwcGVuZEJvdGhQcm9ibGVtcyA9ICggcHJvYmxlbVN0cmluZzogc3RyaW5nLCBpc0Rlc2lnbmVkRWxlbWVudD86IGJvb2xlYW4gKSA9PiB7XG4gICAgYXBwZW5kUHJvYmxlbSggcHJvYmxlbVN0cmluZywgZmFsc2UgKTtcbiAgICBpc0Rlc2lnbmVkRWxlbWVudCAmJiBhcHBlbmRQcm9ibGVtKCBwcm9ibGVtU3RyaW5nLCB0cnVlICk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFZpc2l0IG9uZSBlbGVtZW50IGFsb25nIHRoZSBBUElzLlxuICAgKiBAcGFyYW0gdHJhaWwgLSB0aGUgcGF0aCBvZiB0YW5kZW0gY29tcG9uZW50TmFtZXNcbiAgICogQHBhcmFtIHJlZmVyZW5jZSAtIGN1cnJlbnQgdmFsdWUgaW4gdGhlIHJlZmVyZW5jZUFQSVxuICAgKiBAcGFyYW0gcHJvcG9zZWQgLSBjdXJyZW50IHZhbHVlIGluIHRoZSBwcm9wb3NlZEFQSVxuICAgKiBAcGFyYW0gaXNEZXNpZ25lZEVsZW1lbnQgLSBhcmUgd2UgdGVzdGluZyBmb3IgZGVzaWduZWQgY2hhbmdlcywgb3IgZm9yIGJyZWFraW5nIGNoYW5nZXMuXG4gICAqL1xuICBjb25zdCB2aXNpdCA9ICggdHJhaWw6IHN0cmluZ1tdLCByZWZlcmVuY2U6IFBoZXRpb0VsZW1lbnRzLCBwcm9wb3NlZDogUGhldGlvRWxlbWVudHMsIGlzRGVzaWduZWRFbGVtZW50OiBib29sZWFuICkgPT4ge1xuICAgIGNvbnN0IHBoZXRpb0lEID0gdHJhaWwuam9pbiggJy4nICk7XG5cbiAgICAvLyBEZXRlY3QgYW4gaW5zdHJ1bWVudGVkIGluc3RhbmNlXG4gICAgaWYgKCByZWZlcmVuY2UuaGFzT3duUHJvcGVydHkoIE1FVEFEQVRBX0tFWV9OQU1FICkgKSB7XG5cbiAgICAgIC8vIE92ZXJyaWRlIGlzRGVzaWduZWQsIGlmIHNwZWNpZmllZC4gT25jZSBvbiwgeW91IGNhbm5vdCB0dXJuIG9mZiBhIHN1YnRyZWUuXG4gICAgICBpc0Rlc2lnbmVkRWxlbWVudCA9IGlzRGVzaWduZWRFbGVtZW50IHx8IHJlZmVyZW5jZVsgTUVUQURBVEFfS0VZX05BTUUgXS5waGV0aW9EZXNpZ25lZDtcblxuICAgICAgY29uc3QgcmVmZXJlbmNlQ29tcGxldGVNZXRhZGF0YSA9IGdldE1ldGFkYXRhVmFsdWVzKCByZWZlcmVuY2UsIHJlZmVyZW5jZUFQSSwgXyApO1xuICAgICAgY29uc3QgcHJvcG9zZWRDb21wbGV0ZU1ldGFkYXRhID0gZ2V0TWV0YWRhdGFWYWx1ZXMoIHByb3Bvc2VkLCBwcm9wb3NlZEFQSSwgXyApO1xuXG4gICAgICAvKipcbiAgICAgICAqIFB1c2ggYW55IHByb2JsZW1zIHRoYXQgbWF5IGV4aXN0IGZvciB0aGUgcHJvdmlkZWQgbWV0YWRhdGFLZXkuXG4gICAgICAgKiBAcGFyYW0gbWV0YWRhdGFLZXkgLSBTZWUgUGhldGlvT2JqZWN0LmdldE1ldGFkYXRhKClcbiAgICAgICAqIEBwYXJhbSBpc0Rlc2lnbmVkQ2hhbmdlIC0gaWYgdGhlIGRpZmZlcmVuY2UgaXMgZnJvbSBhIGRlc2lnbiBjaGFuZ2UsIGFuZCBub3QgZnJvbSBhIGJyZWFraW5nIGNoYW5nZSB0ZXN0XG4gICAgICAgKiBAcGFyYW0gaW52YWxpZFByb3Bvc2VkVmFsdWUgLSBhbiBvcHRpb25hbCBuZXcgdmFsdWUgdGhhdCB3b3VsZCBzaWduaWZ5IGEgYnJlYWtpbmcgY2hhbmdlLiBBbnkgb3RoZXIgdmFsdWUgd291bGQgYmUgYWNjZXB0YWJsZS5cbiAgICAgICAqL1xuICAgICAgY29uc3QgcmVwb3J0RGlmZmVyZW5jZXMgPSAoIG1ldGFkYXRhS2V5OiBrZXlvZiBQaGV0aW9FbGVtZW50TWV0YWRhdGEsIGlzRGVzaWduZWRDaGFuZ2U6IGJvb2xlYW4sIGludmFsaWRQcm9wb3NlZFZhbHVlPzogUGhldGlvRWxlbWVudE1ldGFkYXRhVmFsdWUgKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlZmVyZW5jZVZhbHVlOiBQaGV0aW9FbGVtZW50TWV0YWRhdGFWYWx1ZSA9IHJlZmVyZW5jZUNvbXBsZXRlTWV0YWRhdGFbIG1ldGFkYXRhS2V5IF07XG5cbiAgICAgICAgLy8gR3JhY2VmdWxseSBoYW5kbGUgbWlzc2luZyBtZXRhZGF0YSBmcm9tIHRoZSA8MS4wIEFQSSBmb3JtYXRcbiAgICAgICAgY29uc3QgcHJvcG9zZWRWYWx1ZSA9IHByb3Bvc2VkQ29tcGxldGVNZXRhZGF0YSA/IHByb3Bvc2VkQ29tcGxldGVNZXRhZGF0YVsgbWV0YWRhdGFLZXkgXSA6IHt9O1xuXG4gICAgICAgIGlmICggcmVmZXJlbmNlVmFsdWUgIT09IHByb3Bvc2VkVmFsdWUgKSB7XG5cbiAgICAgICAgICAvLyBpZiBwcm9wb3NlZCBBUEkgaXMgb2xkZXIgKG5vIHZlcnNpb24gc3BlY2lmaWVkKSwgaWdub3JlIHBoZXRpb0FyY2hldHlwZVBoZXRpb0lEIGNoYW5nZWQgZnJvbSBudWxsIHRvIHVuZGVmaW5lZFxuICAgICAgICAgIC8vIGJlY2F1c2UgaXQgdXNlZCB0byBiZSBzcGFyc2UsIGFuZCBpbiB2ZXJzaW9uIDEuMCBpdCBiZWNhbWUgYSBkZWZhdWx0LlxuICAgICAgICAgIGNvbnN0IGlnbm9yZUJyb2tlblByb3Bvc2VkID0gaXNPbGRBUElWZXJzaW9uKCBwcm9wb3NlZEFQSSApICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YUtleSA9PT0gJ3BoZXRpb0FyY2hldHlwZVBoZXRpb0lEJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlVmFsdWUgPT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3Bvc2VkVmFsdWUgPT09IHVuZGVmaW5lZDtcblxuICAgICAgICAgIGNvbnN0IGlnbm9yZUJyb2tlblJlZmVyZW5jZSA9IGlzT2xkQVBJVmVyc2lvbiggcmVmZXJlbmNlQVBJICkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YUtleSA9PT0gJ3BoZXRpb0FyY2hldHlwZVBoZXRpb0lEJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3Bvc2VkVmFsdWUgPT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VWYWx1ZSA9PT0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgY29uc3QgaWdub3JlID0gaWdub3JlQnJva2VuUHJvcG9zZWQgfHwgaWdub3JlQnJva2VuUmVmZXJlbmNlO1xuXG4gICAgICAgICAgaWYgKCAhaWdub3JlICkge1xuXG4gICAgICAgICAgICBpZiAoIGludmFsaWRQcm9wb3NlZFZhbHVlID09PSB1bmRlZmluZWQgfHwgaXNEZXNpZ25lZENoYW5nZSApIHtcbiAgICAgICAgICAgICAgYXBwZW5kUHJvYmxlbSggYCR7cGhldGlvSUR9LiR7bWV0YWRhdGFLZXl9IGNoYW5nZWQgZnJvbSBcIiR7cmVmZXJlbmNlVmFsdWV9XCIgdG8gXCIke3Byb3Bvc2VkVmFsdWV9XCJgLCBpc0Rlc2lnbmVkQ2hhbmdlICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICggIWlzRGVzaWduZWRDaGFuZ2UgKSB7XG4gICAgICAgICAgICAgIGlmICggcHJvcG9zZWRWYWx1ZSA9PT0gaW52YWxpZFByb3Bvc2VkVmFsdWUgKSB7XG4gICAgICAgICAgICAgICAgYXBwZW5kUHJvYmxlbSggYCR7cGhldGlvSUR9LiR7bWV0YWRhdGFLZXl9IGNoYW5nZWQgZnJvbSBcIiR7cmVmZXJlbmNlVmFsdWV9XCIgdG8gXCIke3Byb3Bvc2VkVmFsdWV9XCJgICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAvLyB2YWx1ZSBjaGFuZ2VkLCBidXQgaXQgd2FzIGEgd2lkZW5pbmcgQVBJIChhZGRpbmcgc29tZXRoaW5nIHRvIHN0YXRlLCBvciBtYWtpbmcgc29tZXRoaW5nIHJlYWQvd3JpdGUpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIC8vIENoZWNrIGZvciBicmVha2luZyBjaGFuZ2VzXG4gICAgICByZXBvcnREaWZmZXJlbmNlcyggJ3BoZXRpb1R5cGVOYW1lJywgZmFsc2UgKTtcbiAgICAgIHJlcG9ydERpZmZlcmVuY2VzKCAncGhldGlvRXZlbnRUeXBlJywgZmFsc2UgKTtcbiAgICAgIHJlcG9ydERpZmZlcmVuY2VzKCAncGhldGlvUGxheWJhY2snLCBmYWxzZSApO1xuICAgICAgcmVwb3J0RGlmZmVyZW5jZXMoICdwaGV0aW9EeW5hbWljRWxlbWVudCcsIGZhbHNlICk7XG4gICAgICByZXBvcnREaWZmZXJlbmNlcyggJ3BoZXRpb0lzQXJjaGV0eXBlJywgZmFsc2UgKTtcbiAgICAgIHJlcG9ydERpZmZlcmVuY2VzKCAncGhldGlvQXJjaGV0eXBlUGhldGlvSUQnLCBmYWxzZSApO1xuICAgICAgcmVwb3J0RGlmZmVyZW5jZXMoICdwaGV0aW9TdGF0ZScsIGZhbHNlLCBmYWxzZSApOyAvLyBPbmx5IHJlcG9ydCBpZiBzb21ldGhpbmcgYmVjYW1lIG5vbi1zdGF0ZWZ1bFxuICAgICAgcmVwb3J0RGlmZmVyZW5jZXMoICdwaGV0aW9SZWFkT25seScsIGZhbHNlLCB0cnVlICk7IC8vIE9ubHkgbmVlZCB0byByZXBvcnQgaWYgc29tZXRoaW5nIGJlY2FtZSByZWFkT25seVxuXG4gICAgICAvLyBUaGUgZm9sbG93aW5nIG1ldGFkYXRhIGtleXMgYXJlIG5vbi1icmVha2luZzpcbiAgICAgIC8vICdwaGV0aW9Eb2N1bWVudGF0aW9uJ1xuICAgICAgLy8gJ3BoZXRpb0ZlYXR1cmVkJ1xuICAgICAgLy8gJ3BoZXRpb0hpZ2hGcmVxdWVuY3knLCBub24tYnJlYWtpbmcsIGFzc3VtaW5nIGNsaWVudHMgd2l0aCBkYXRhIGhhdmUgdGhlIGZ1bGwgZGF0YSBzdHJlYW1cblxuICAgICAgLy8gQ2hlY2sgZm9yIGRlc2lnbiBjaGFuZ2VzXG4gICAgICBpZiAoIGlzRGVzaWduZWRFbGVtZW50ICkge1xuICAgICAgICAoIE9iamVjdC5rZXlzKCByZWZlcmVuY2VDb21wbGV0ZU1ldGFkYXRhICkgYXMgQXJyYXk8a2V5b2YgUGhldGlvRWxlbWVudE1ldGFkYXRhPiApLmZvckVhY2goIG1ldGFkYXRhS2V5ID0+IHtcbiAgICAgICAgICByZXBvcnREaWZmZXJlbmNlcyggbWV0YWRhdGFLZXksIHRydWUgKTtcbiAgICAgICAgfSApO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGUgcmVmZXJlbmNlIGZpbGUgZGVjbGFyZXMgYW4gaW5pdGlhbCBzdGF0ZSwgY2hlY2sgdGhhdCBpdCBoYXNuJ3QgY2hhbmdlZFxuICAgICAgaWYgKCByZWZlcmVuY2UuX2RhdGEgJiYgcmVmZXJlbmNlLl9kYXRhLmluaXRpYWxTdGF0ZSApIHtcblxuICAgICAgICAvLyBEZXRlY3QgbWlzc2luZyBleHBlY3RlZCBzdGF0ZVxuICAgICAgICBpZiAoICFwcm9wb3NlZC5fZGF0YSB8fCAhcHJvcG9zZWQuX2RhdGEuaW5pdGlhbFN0YXRlICkge1xuXG4gICAgICAgICAgLy8gYXBpU3RhdGVLZXlzIFwidHJhbnNpdGlvblwiIG1lYW5zIGVycm9yIG1vcmUgbG91ZGx5LCBzaW5jZSB3ZSBjYW5ub3QgdGVzdCB0aGUgYXBpU3RhdGVLZXlzIHRoZW1zZWx2ZXNcbiAgICAgICAgICBpZiAoIGFwaVN1cHBvcnRzQVBJU3RhdGVLZXlzKCByZWZlcmVuY2VBUEkgKSAhPT0gYXBpU3VwcG9ydHNBUElTdGF0ZUtleXMoIHByb3Bvc2VkQVBJICkgKSB7XG5cbiAgICAgICAgICAgIC8vIE1pc3NpbmcgYnV0IGV4cGVjdGVkIHN0YXRlIGlzIGEgYnJlYWtpbmcgcHJvYmxlbVxuICAgICAgICAgICAgLy8gSXQgaXMgYWxzbyBhIGRlc2lnbmVkIHByb2JsZW0gaWYgd2UgZXhwZWN0ZWQgc3RhdGUgaW4gYSBkZXNpZ25lZCBzdWJ0cmVlXG4gICAgICAgICAgICBhcHBlbmRCb3RoUHJvYmxlbXMoIGAke3BoZXRpb0lEfS5fZGF0YS5pbml0aWFsU3RhdGUgaXMgbWlzc2luZyBmcm9tIHByb3Bvc2VkIEFQSWAsIGZhbHNlICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIGluaXRpYWxTdGF0ZSBjb21wYXJpc29uXG5cbiAgICAgICAgICBjb25zdCByZWZlcmVuY2VzSW5pdGlhbFN0YXRlID0gcmVmZXJlbmNlLl9kYXRhLmluaXRpYWxTdGF0ZTtcbiAgICAgICAgICBjb25zdCBwcm9wb3NlZEluaXRpYWxTdGF0ZSA9IHByb3Bvc2VkLl9kYXRhLmluaXRpYWxTdGF0ZTtcblxuICAgICAgICAgIGNvbnN0IHRlc3RJbml0aWFsU3RhdGUgPSAoIHRlc3REZXNpZ25lZDogYm9vbGVhbiApID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlzQ29tcGF0aWJsZSA9IF8uaXNFcXVhbFdpdGgoIHJlZmVyZW5jZXNJbml0aWFsU3RhdGUsIHByb3Bvc2VkSW5pdGlhbFN0YXRlLFxuICAgICAgICAgICAgICAoIHJlZmVyZW5jZVN0YXRlOiBQaGV0aW9FbGVtZW50U3RhdGUsIHByb3Bvc2VkU3RhdGU6IFBoZXRpb0VsZW1lbnRTdGF0ZSApID0+IHtcblxuICAgICAgICAgICAgICAgIC8vIFRvcCBsZXZlbCBvYmplY3QgY29tcGFyaXNvbiBvZiB0aGUgZW50aXJlIHN0YXRlIChub3QgYSBjb21wb25lbnQgcGllY2UpXG4gICAgICAgICAgICAgICAgaWYgKCByZWZlcmVuY2VzSW5pdGlhbFN0YXRlID09PSByZWZlcmVuY2VTdGF0ZSAmJiBwcm9wb3NlZEluaXRpYWxTdGF0ZSA9PT0gcHJvcG9zZWRTdGF0ZSApIHtcblxuICAgICAgICAgICAgICAgICAgLy8gVGhlIHZhbGlkVmFsdWVzIG9mIHRoZSBsb2NhbGVQcm9wZXJ0eSBjaGFuZ2VzIGVhY2ggdGltZSBhIG5ldyB0cmFuc2xhdGlvbiBpcyBzdWJtaXR0ZWQgZm9yIGEgc2ltLlxuICAgICAgICAgICAgICAgICAgaWYgKCBwaGV0aW9JRCA9PT0gdHJhaWxbIDAgXSArICcuZ2VuZXJhbC5tb2RlbC5sb2NhbGVQcm9wZXJ0eScgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gV2UgZG8gbm90IHdvcnJ5IGFib3V0IHRoZSBub3Rpb24gb2YgXCJkZXNpZ25pbmdcIiBhdmFpbGFibGUgbG9jYWxlcy4gRm9yIGJyZWFraW5nIGNoYW5nZXM6IHRoZSBzaW1cbiAgICAgICAgICAgICAgICAgICAgLy8gbXVzdCBoYXZlIGFsbCBleHBlY3RlZCBsb2NhbGVzLCBidXQgaXQgaXMgYWNjZXB0YWJsZSB0byBhZGQgbmV3IG9uZSB3aXRob3V0IEFQSSBlcnJvci5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRlc3REZXNpZ25lZCB8fCByZWZlcmVuY2VTdGF0ZS52YWxpZFZhbHVlcy5ldmVyeSggKCB2YWxpZFZhbHVlOiBJbnRlbnRpb25hbEFueSApID0+IHByb3Bvc2VkU3RhdGUudmFsaWRWYWx1ZXMuaW5jbHVkZXMoIHZhbGlkVmFsdWUgKSApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoIHRlc3REZXNpZ25lZCApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDsgLy8gTWVhbmluZyB1c2UgdGhlIGRlZmF1bHQgbG9kYXNoIGFsZ29yaXRobSBmb3IgY29tcGFyaXNvbi5cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBCcmVha2luZyBjaGFuZ2UgdGVzdCB1c2VzIHRoZSBnZW5lcmFsIGFsZ29yaXRobSBmb3IgaW5pdGlhbCBzdGF0ZSBjb21wYXRpYmlsaXR5LlxuICAgICAgICAgICAgICAgICAgICAvLyByZWZlcmVuY2VTdGF0ZSBpcyB0aGUgZ3JvdW5kIHRydXRoIGZvciBjb21wYXRpYmlsaXR5XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpc0luaXRpYWxTdGF0ZUNvbXBhdGlibGUoIHJlZmVyZW5jZVN0YXRlLCBwcm9wb3NlZFN0YXRlICk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDsgLy8gTWVhbmluZyB1c2UgdGhlIGRlZmF1bHQgbG9kYXNoIGFsZ29yaXRobSBmb3IgY29tcGFyaXNvbi5cbiAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgaWYgKCAhaXNDb21wYXRpYmxlICkge1xuICAgICAgICAgICAgICBjb25zdCBwcm9ibGVtU3RyaW5nID0gYCR7cGhldGlvSUR9Ll9kYXRhLmluaXRpYWxTdGF0ZSBkaWZmZXJzLiBcXG5FeHBlY3RlZDpcXG4ke0pTT04uc3RyaW5naWZ5KCByZWZlcmVuY2UuX2RhdGEhLmluaXRpYWxTdGF0ZSApfVxcbiBhY3R1YWw6XFxuJHtKU09OLnN0cmluZ2lmeSggcHJvcG9zZWQuX2RhdGEhLmluaXRpYWxTdGF0ZSApfVxcbmA7XG5cbiAgICAgICAgICAgICAgLy8gUmVwb3J0IG9ubHkgZGVzaWduZWQgcHJvYmxlbXMgaWYgb24gYSBkZXNpZ25lZCBlbGVtZW50LlxuICAgICAgICAgICAgICBjb25zdCByZXBvcnRUaGVQcm9ibGVtID0gIXRlc3REZXNpZ25lZCB8fCBpc0Rlc2lnbmVkRWxlbWVudDtcbiAgICAgICAgICAgICAgcmVwb3J0VGhlUHJvYmxlbSAmJiBhcHBlbmRQcm9ibGVtKCBwcm9ibGVtU3RyaW5nLCB0ZXN0RGVzaWduZWQgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgLy8gSXQgaXMgYWxzbyBhIGRlc2lnbmVkIHByb2JsZW0gaWYgdGhlIHByb3Bvc2VkIHZhbHVlcyBkZXZpYXRlIGZyb20gdGhlIHNwZWNpZmllZCBkZXNpZ25lZCB2YWx1ZXNcbiAgICAgICAgICB0ZXN0SW5pdGlhbFN0YXRlKCB0cnVlICk7XG4gICAgICAgICAgLy8gQSBjaGFuZ2VkIHN0YXRlIHZhbHVlIGNvdWxkIGJyZWFrIGEgY2xpZW50IHdyYXBwZXIsIHNvIGlkZW50aWZ5IGl0IHdpdGggYnJlYWtpbmcgY2hhbmdlcy5cbiAgICAgICAgICB0ZXN0SW5pdGlhbFN0YXRlKCBmYWxzZSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKCBwcm9wb3NlZC5fZGF0YT8uaW5pdGlhbFN0YXRlICkge1xuXG4gICAgICAvLyBXZSBkb24ndCBoYXZlIHJlZmVyZW5jZSBzdGF0ZSwgYnV0IGRvIGhhdmUgYSBuZXcgaW5pdGlhbFN0YXRlLiB0aGlzIGlzIGEgZGVzaWduZWQgY2hhbmdlXG4gICAgICBpc0Rlc2lnbmVkRWxlbWVudCAmJiBhcHBlbmRQcm9ibGVtKFxuICAgICAgICBgJHtwaGV0aW9JRH0uX2RhdGEuaW5pdGlhbFN0YXRlIGlzIG5vdCBpbiByZWZlcmVuY2UgQVBJIGJ1dCBpcyBpbiBwcm9wb3NlZGAsIHRydWUgKTtcbiAgICB9XG5cbiAgICAvLyBSZWN1cnNlIHRvIGNoaWxkcmVuXG4gICAgZm9yICggY29uc3QgY29tcG9uZW50TmFtZSBpbiByZWZlcmVuY2UgKSB7XG4gICAgICBpZiAoIHJlZmVyZW5jZS5oYXNPd25Qcm9wZXJ0eSggY29tcG9uZW50TmFtZSApICYmIGlzQ2hpbGRLZXkoIGNvbXBvbmVudE5hbWUgKSApIHtcblxuICAgICAgICBpZiAoICFwcm9wb3NlZC5oYXNPd25Qcm9wZXJ0eSggY29tcG9uZW50TmFtZSApICkge1xuICAgICAgICAgIGFwcGVuZEJvdGhQcm9ibGVtcyggYFBoRVQtaU8gRWxlbWVudCBtaXNzaW5nOiAke3BoZXRpb0lEfS4ke2NvbXBvbmVudE5hbWV9YCwgaXNEZXNpZ25lZEVsZW1lbnQgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB2aXNpdChcbiAgICAgICAgICAgIHRyYWlsLmNvbmNhdCggY29tcG9uZW50TmFtZSApLFxuICAgICAgICAgICAgcmVmZXJlbmNlWyBjb21wb25lbnROYW1lIF0sXG4gICAgICAgICAgICBwcm9wb3NlZFsgY29tcG9uZW50TmFtZSBdLFxuICAgICAgICAgICAgaXNEZXNpZ25lZEVsZW1lbnRcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICggY29uc3QgY29tcG9uZW50TmFtZSBpbiBwcm9wb3NlZCApIHtcbiAgICAgIGlmICggaXNEZXNpZ25lZEVsZW1lbnQgJiYgcHJvcG9zZWQuaGFzT3duUHJvcGVydHkoIGNvbXBvbmVudE5hbWUgKSAmJiBpc0NoaWxkS2V5KCBjb21wb25lbnROYW1lICkgJiYgIXJlZmVyZW5jZS5oYXNPd25Qcm9wZXJ0eSggY29tcG9uZW50TmFtZSApICkge1xuICAgICAgICBhcHBlbmRQcm9ibGVtKCBgTmV3IFBoRVQtaU8gRWxlbWVudCAob3IgdW5pbnN0cnVtZW50ZWQgaW50ZXJtZWRpYXRlIGNvbnRhaW5lcikgbm90IGluIHJlZmVyZW5jZTogJHtwaGV0aW9JRH0uJHtjb21wb25lbnROYW1lfWAsIHRydWUgKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgdmlzaXQoIFtdLCByZWZlcmVuY2VBUEkucGhldGlvRWxlbWVudHMsIHByb3Bvc2VkQVBJLnBoZXRpb0VsZW1lbnRzLCBmYWxzZSApO1xuXG4gIC8vIENoZWNrIGZvcjogbWlzc2luZyBJT1R5cGVzLCBtaXNzaW5nIG1ldGhvZHMsIG9yIGRpZmZlcmluZyBwYXJhbWV0ZXIgdHlwZXMgb3IgcmV0dXJuIHR5cGVzXG4gIGZvciAoIGNvbnN0IHR5cGVOYW1lIGluIHJlZmVyZW5jZUFQSS5waGV0aW9UeXBlcyApIHtcbiAgICAvLyBUT0RPOiBXZSBuZWVkIGEgbm90aW9uIG9mIHBoZXRpb0Rlc2lnbmVkIGZvciBUeXBlIGNvbXBhcmlzb24uIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvL2lzc3Vlcy8xOTk5XG4gICAgLy8gVE9ETzogYWRkIGNvbXBhcmlzb24gZm9yIHN0YXRlU2NoZW1hIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvL2lzc3Vlcy8xOTk5XG5cbiAgICBpZiAoIHJlZmVyZW5jZUFQSS5waGV0aW9UeXBlcy5oYXNPd25Qcm9wZXJ0eSggdHlwZU5hbWUgKSApIHtcblxuICAgICAgLy8gbWFrZSBzdXJlIHdlIGhhdmUgdGhlIGRlc2lyZWQgdHlwZVxuICAgICAgaWYgKCAhcHJvcG9zZWRBUEkucGhldGlvVHlwZXMuaGFzT3duUHJvcGVydHkoIHR5cGVOYW1lICkgKSB7XG4gICAgICAgIGFwcGVuZFByb2JsZW0oIGBUeXBlIG1pc3Npbmc6ICR7dHlwZU5hbWV9YCApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IHJlZmVyZW5jZVR5cGUgPSByZWZlcmVuY2VBUEkucGhldGlvVHlwZXNbIHR5cGVOYW1lIF07XG4gICAgICAgIGNvbnN0IHByb3Bvc2VkVHlwZSA9IHByb3Bvc2VkQVBJLnBoZXRpb1R5cGVzWyB0eXBlTmFtZSBdO1xuXG4gICAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBoYXZlIGFsbCBvZiB0aGUgbWV0aG9kc1xuICAgICAgICBjb25zdCByZWZlcmVuY2VNZXRob2RzID0gcmVmZXJlbmNlVHlwZS5tZXRob2RzO1xuICAgICAgICBjb25zdCBwcm9wb3NlZE1ldGhvZHMgPSBwcm9wb3NlZFR5cGUubWV0aG9kcztcbiAgICAgICAgZm9yICggY29uc3QgcmVmZXJlbmNlTWV0aG9kIGluIHJlZmVyZW5jZU1ldGhvZHMgKSB7XG4gICAgICAgICAgaWYgKCByZWZlcmVuY2VNZXRob2RzLmhhc093blByb3BlcnR5KCByZWZlcmVuY2VNZXRob2QgKSApIHtcbiAgICAgICAgICAgIGlmICggIXByb3Bvc2VkTWV0aG9kcy5oYXNPd25Qcm9wZXJ0eSggcmVmZXJlbmNlTWV0aG9kICkgKSB7XG4gICAgICAgICAgICAgIGFwcGVuZFByb2JsZW0oIGBNZXRob2QgbWlzc2luZywgdHlwZT0ke3R5cGVOYW1lfSwgbWV0aG9kPSR7cmVmZXJlbmNlTWV0aG9kfWAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgICAgIC8vIGNoZWNrIHBhcmFtZXRlciB0eXBlcyAoZXhhY3QgbWF0Y2gpXG4gICAgICAgICAgICAgIGNvbnN0IHJlZmVyZW5jZVBhcmFtcyA9IHJlZmVyZW5jZU1ldGhvZHNbIHJlZmVyZW5jZU1ldGhvZCBdLnBhcmFtZXRlclR5cGVzO1xuICAgICAgICAgICAgICBjb25zdCBwcm9wb3NlZFBhcmFtcyA9IHByb3Bvc2VkTWV0aG9kc1sgcmVmZXJlbmNlTWV0aG9kIF0ucGFyYW1ldGVyVHlwZXM7XG5cbiAgICAgICAgICAgICAgaWYgKCByZWZlcmVuY2VQYXJhbXMuam9pbiggJywnICkgIT09IHByb3Bvc2VkUGFyYW1zLmpvaW4oICcsJyApICkge1xuICAgICAgICAgICAgICAgIGFwcGVuZFByb2JsZW0oIGAke3R5cGVOYW1lfS4ke3JlZmVyZW5jZU1ldGhvZH0gaGFzIGRpZmZlcmVudCBwYXJhbWV0ZXIgdHlwZXM6IFske3JlZmVyZW5jZVBhcmFtcy5qb2luKCAnLCAnICl9XSA9PiBbJHtwcm9wb3NlZFBhcmFtcy5qb2luKCAnLCAnICl9XWAgKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNvbnN0IHJlZmVyZW5jZVJldHVyblR5cGUgPSByZWZlcmVuY2VNZXRob2RzWyByZWZlcmVuY2VNZXRob2QgXS5yZXR1cm5UeXBlO1xuICAgICAgICAgICAgICBjb25zdCBwcm9wb3NlZFJldHVyblR5cGUgPSBwcm9wb3NlZE1ldGhvZHNbIHJlZmVyZW5jZU1ldGhvZCBdLnJldHVyblR5cGU7XG4gICAgICAgICAgICAgIGlmICggcmVmZXJlbmNlUmV0dXJuVHlwZSAhPT0gcHJvcG9zZWRSZXR1cm5UeXBlICkge1xuICAgICAgICAgICAgICAgIGFwcGVuZFByb2JsZW0oIGAke3R5cGVOYW1lfS4ke3JlZmVyZW5jZU1ldGhvZH0gaGFzIGEgZGlmZmVyZW50IHJldHVybiB0eXBlICR7cmVmZXJlbmNlUmV0dXJuVHlwZX0gPT4gJHtwcm9wb3NlZFJldHVyblR5cGV9YCApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gbWFrZSBzdXJlIHdlIGhhdmUgYWxsIG9mIHRoZSBldmVudHMgKE9LIHRvIGFkZCBtb3JlKVxuICAgICAgICBjb25zdCByZWZlcmVuY2VFdmVudHMgPSByZWZlcmVuY2VUeXBlLmV2ZW50cztcbiAgICAgICAgY29uc3QgcHJvcG9zZWRFdmVudHMgPSBwcm9wb3NlZFR5cGUuZXZlbnRzO1xuICAgICAgICByZWZlcmVuY2VFdmVudHMuZm9yRWFjaCggZXZlbnQgPT4ge1xuICAgICAgICAgIGlmICggIXByb3Bvc2VkRXZlbnRzLmluY2x1ZGVzKCBldmVudCApICkge1xuICAgICAgICAgICAgYXBwZW5kUHJvYmxlbSggYCR7dHlwZU5hbWV9IGlzIG1pc3NpbmcgZXZlbnQ6ICR7ZXZlbnR9YCApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuXG4gICAgICAgIGlmICggYXBpU3VwcG9ydHNBUElTdGF0ZUtleXMoIHJlZmVyZW5jZUFQSSApICYmXG4gICAgICAgICAgICAgYXBpU3VwcG9ydHNBUElTdGF0ZUtleXMoIHByb3Bvc2VkQVBJICkgKSB7XG4gICAgICAgICAgaWYgKCAhIXJlZmVyZW5jZVR5cGUuYXBpU3RhdGVLZXlzICE9PSAhIXByb3Bvc2VkVHlwZS5hcGlTdGF0ZUtleXMgKSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSByZWZlcmVuY2VUeXBlLmFwaVN0YXRlS2V5cyA/ICdwcmVzZW50JyA6ICdhYnNlbnQnO1xuICAgICAgICAgICAgY29uc3QgcHJvYmxlbVN0cmluZyA9IGAke3R5cGVOYW1lfSBhcGlTdGF0ZUtleXMgdW5leHBlY3RlZGx5ICR7cmVzdWx0fWA7XG4gICAgICAgICAgICBhcHBlbmRQcm9ibGVtKCBwcm9ibGVtU3RyaW5nLCB0cnVlICk7XG5cbiAgICAgICAgICAgIC8vIEJyZWFraW5nIGlmIHdlIGxvc3QgYXBpU3RhdGVLZXlzXG4gICAgICAgICAgICByZWZlcmVuY2VUeXBlLmFwaVN0YXRlS2V5cyAmJiBhcHBlbmRQcm9ibGVtKCBwcm9ibGVtU3RyaW5nLCBmYWxzZSApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHJlZmVyZW5jZUFQSVN0YXRlS2V5cyA9IHJlZmVyZW5jZVR5cGUuYXBpU3RhdGVLZXlzO1xuICAgICAgICAgICAgY29uc3QgcHJvcG9zZWRBUElTdGF0ZUtleXMgPSBwcm9wb3NlZFR5cGUuYXBpU3RhdGVLZXlzO1xuXG4gICAgICAgICAgICBpZiAoICFfLmlzRXF1YWwoIHJlZmVyZW5jZUFQSVN0YXRlS2V5cywgcHJvcG9zZWRBUElTdGF0ZUtleXMgKSApIHtcbiAgICAgICAgICAgICAgY29uc3QgaW5SZWZlcmVuY2VOb3RQcm9wb3NlZCA9IF8uZGlmZmVyZW5jZSggcmVmZXJlbmNlQVBJU3RhdGVLZXlzLCBwcm9wb3NlZEFQSVN0YXRlS2V5cyEgKTtcbiAgICAgICAgICAgICAgY29uc3QgaW5Qcm9wb3NlZE5vdFJlZmVyZW5jZSA9IF8uZGlmZmVyZW5jZSggcHJvcG9zZWRBUElTdGF0ZUtleXMsIHJlZmVyZW5jZUFQSVN0YXRlS2V5cyEgKTtcblxuICAgICAgICAgICAgICBhcHBlbmRQcm9ibGVtKCBgJHt0eXBlTmFtZX0gYXBpU3RhdGVLZXlzIGRpZmZlcjpcXG5gICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCAgSW4gcmVmZXJlbmNlOiAke2luUmVmZXJlbmNlTm90UHJvcG9zZWR9XFxuYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAgIEluIHByb3Bvc2VkOiAke2luUHJvcG9zZWROb3RSZWZlcmVuY2V9YCwgdHJ1ZSApO1xuXG4gICAgICAgICAgICAgIC8vIEl0IGlzIG9ubHkgYnJlYWtpbmcgaWYgd2UgbG9zdCBhbiBhcGlTdGF0ZUtleVxuICAgICAgICAgICAgICBpZiAoICFfLmV2ZXJ5KCByZWZlcmVuY2VBUElTdGF0ZUtleXMsICggcmVmZXJlbmNlOiBzdHJpbmcgKSA9PiBwcm9wb3NlZEFQSVN0YXRlS2V5cyEuaW5jbHVkZXMoIHJlZmVyZW5jZSApICkgKSB7XG4gICAgICAgICAgICAgICAgYXBwZW5kUHJvYmxlbSggYCR7dHlwZU5hbWV9IGFwaVN0YXRlS2V5cyBtaXNzaW5nIGZyb20gcHJvcG9zZWQ6ICR7aW5SZWZlcmVuY2VOb3RQcm9wb3NlZH1gLCBmYWxzZSApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gbWFrZSBzdXJlIHdlIGhhdmUgbWF0Y2hpbmcgc3VwZXJ0eXBlIG5hbWVzXG4gICAgICAgIGNvbnN0IHJlZmVyZW5jZVN1cGVydHlwZU5hbWUgPSByZWZlcmVuY2VUeXBlLnN1cGVydHlwZTtcbiAgICAgICAgY29uc3QgcHJvcG9zZWRTdXBlcnR5cGVOYW1lID0gcHJvcG9zZWRUeXBlLnN1cGVydHlwZTtcbiAgICAgICAgaWYgKCByZWZlcmVuY2VTdXBlcnR5cGVOYW1lICE9PSBwcm9wb3NlZFN1cGVydHlwZU5hbWUgKSB7XG4gICAgICAgICAgYXBwZW5kUHJvYmxlbSggYCR7dHlwZU5hbWV9IHN1cGVydHlwZSBjaGFuZ2VkIGZyb20gXCIke3JlZmVyZW5jZVN1cGVydHlwZU5hbWV9XCIgdG8gXCIke3Byb3Bvc2VkU3VwZXJ0eXBlTmFtZX1cIi4gVGhpcyBtYXkgb3IgbWF5IG5vdCBcbiAgICAgICAgICBiZSBhIGJyZWFraW5nIGNoYW5nZSwgYnV0IHdlIGFyZSByZXBvcnRpbmcgaXQganVzdCBpbiBjYXNlLmAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBoYXZlIG1hdGNoaW5nIHBhcmFtZXRlciB0eXBlc1xuICAgICAgICBjb25zdCByZWZlcmVuY2VQYXJhbWV0ZXJUeXBlcyA9IHJlZmVyZW5jZVR5cGUucGFyYW1ldGVyVHlwZXMgfHwgW107XG4gICAgICAgIGNvbnN0IHByb3Bvc2VkUGFyYW1ldGVyVHlwZXMgPSBwcm9wb3NlZFR5cGUucGFyYW1ldGVyVHlwZXM7XG4gICAgICAgIGlmICggIV8uaXNFcXVhbCggcmVmZXJlbmNlUGFyYW1ldGVyVHlwZXMsIHByb3Bvc2VkUGFyYW1ldGVyVHlwZXMgKSApIHtcbiAgICAgICAgICBhcHBlbmRQcm9ibGVtKCBgJHt0eXBlTmFtZX0gcGFyYW1ldGVyIHR5cGVzIGNoYW5nZWQgZnJvbSBbJHtyZWZlcmVuY2VQYXJhbWV0ZXJUeXBlcy5qb2luKCAnLCAnICl9XSB0byBbJHtwcm9wb3NlZFBhcmFtZXRlclR5cGVzIS5qb2luKCAnLCAnICl9XS4gVGhpcyBtYXkgb3IgbWF5IG5vdCBcbiAgICAgICAgICBiZSBhIGJyZWFraW5nIGNoYW5nZSwgYnV0IHdlIGFyZSByZXBvcnRpbmcgaXQganVzdCBpbiBjYXNlLmAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoaXMgY2hlY2sgYXNzdW1lcyB0aGF0IGVhY2ggQVBJIHdpbGwgYmUgb2YgYSB2ZXJzaW9uIHRoYXQgaGFzIG1ldGFkYXRhRGVmYXVsdHNcbiAgICAgICAgaWYgKCByZWZlcmVuY2VBUEkudmVyc2lvbiAmJiBwcm9wb3NlZEFQSS52ZXJzaW9uICkge1xuXG4gICAgICAgICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgZGVmYXVsdCB2YWx1ZXMgaGF2ZSBjaGFuZ2VkLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vaXNzdWVzLzE3NTNcbiAgICAgICAgICBjb25zdCByZWZlcmVuY2VEZWZhdWx0cyA9IHJlZmVyZW5jZUFQSS5waGV0aW9UeXBlc1sgdHlwZU5hbWUgXS5tZXRhZGF0YURlZmF1bHRzO1xuICAgICAgICAgIGNvbnN0IHByb3Bvc2VkRGVmYXVsdHMgPSBwcm9wb3NlZEFQSS5waGV0aW9UeXBlc1sgdHlwZU5hbWUgXS5tZXRhZGF0YURlZmF1bHRzO1xuXG4gICAgICAgICAgaWYgKCAhIXJlZmVyZW5jZURlZmF1bHRzICE9PSAhIXByb3Bvc2VkRGVmYXVsdHMgKSB7XG4gICAgICAgICAgICBhcHBlbmRQcm9ibGVtKCBgJHt0eXBlTmFtZX0gbWV0YWRhdGEgZGVmYXVsdHMgbm90IGZvdW5kIGZyb20gXCIke3JlZmVyZW5jZURlZmF1bHRzfVwiIHRvIFwiJHtwcm9wb3NlZERlZmF1bHRzfVwiLiBUaGlzIG1heSBvciBtYXkgbm90IGJlIGEgYnJlYWtpbmcgY2hhbmdlLCBidXQgd2UgYXJlIHJlcG9ydGluZyBpdCBqdXN0IGluIGNhc2UuYCApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmICggcmVmZXJlbmNlRGVmYXVsdHMgJiYgcHJvcG9zZWREZWZhdWx0cyApIHtcbiAgICAgICAgICAgICggT2JqZWN0LmtleXMoIHJlZmVyZW5jZURlZmF1bHRzICkgYXMgQXJyYXk8a2V5b2YgUGhldGlvRWxlbWVudE1ldGFkYXRhPiApLmZvckVhY2goIGtleSA9PiB7XG4gICAgICAgICAgICAgIGlmICggcmVmZXJlbmNlRGVmYXVsdHNbIGtleSBdICE9PSBwcm9wb3NlZERlZmF1bHRzWyBrZXkgXSApIHtcbiAgICAgICAgICAgICAgICBhcHBlbmRQcm9ibGVtKCBgJHt0eXBlTmFtZX0gbWV0YWRhdGEgdmFsdWUgJHtrZXl9IGNoYW5nZWQgZnJvbSBcIiR7cmVmZXJlbmNlRGVmYXVsdHNbIGtleSBdfVwiIHRvIFwiJHtwcm9wb3NlZERlZmF1bHRzWyBrZXkgXX1cIi4gVGhpcyBtYXkgb3IgbWF5IG5vdCBiZSBhIGJyZWFraW5nIGNoYW5nZSwgYnV0IHdlIGFyZSByZXBvcnRpbmcgaXQganVzdCBpbiBjYXNlLmAgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYnJlYWtpbmdQcm9ibGVtczogYnJlYWtpbmdQcm9ibGVtcyxcbiAgICBkZXNpZ25lZFByb2JsZW1zOiBkZXNpZ25lZFByb2JsZW1zXG4gIH07XG59O1xuXG5jb25zdCBhcGlTdXBwb3J0c0FQSVN0YXRlS2V5cyA9ICggYXBpOiBQaGV0aW9BUEkgKSA9PiBhcGkudmVyc2lvbiAmJiBhcGkudmVyc2lvbi5tYWpvciA+PSAxICYmIGFwaS52ZXJzaW9uLm1pbm9yID49IDE7XG5cbi8vIHVzZWQgdG8gXCJ1cC1jb252ZXJ0XCIgYW4gb2xkIHZlcnNpb25lZCBBUEkgdG8gdGhlIG5ldyAodmVyc2lvbiA+PTEpLCBzdHJ1Y3R1cmVkIHRyZWUgQVBJLlxucGhldGlvQ29tcGFyZUFQSXMudG9TdHJ1Y3R1cmVkVHJlZSA9IHRvU3RydWN0dXJlZFRyZWU7XG5cbmV4cG9ydCBkZWZhdWx0IHBoZXRpb0NvbXBhcmVBUElzOyJdLCJuYW1lcyI6WyJhZmZpcm0iLCJpc0luaXRpYWxTdGF0ZUNvbXBhdGlibGUiLCJNRVRBREFUQV9LRVlfTkFNRSIsIkRBVEFfS0VZX05BTUUiLCJpc0NoaWxkS2V5Iiwia2V5IiwidG9TdHJ1Y3R1cmVkVHJlZSIsImFwaSIsIl8iLCJzcGFyc2VBUEkiLCJjbG9uZURlZXAiLCJzcGFyc2VFbGVtZW50cyIsIk9iamVjdCIsImtleXMiLCJwaGV0aW9FbGVtZW50cyIsImZvckVhY2giLCJwaGV0aW9JRCIsImVudHJ5IiwiY2hhaW4iLCJzcGxpdCIsImxldmVsIiwiY29tcG9uZW50TmFtZSIsImdldE1ldGFkYXRhVmFsdWVzIiwicGhldGlvRWxlbWVudCIsImlvVHlwZU5hbWUiLCJwaGV0aW9UeXBlTmFtZSIsInZlcnNpb24iLCJkZWZhdWx0cyIsImdldE1ldGFkYXRhRGVmYXVsdHMiLCJtZXJnZSIsInR5cGVOYW1lIiwicGhldGlvVHlwZXMiLCJzdXBlcnR5cGUiLCJtZXRhZGF0YURlZmF1bHRzIiwiaXNPbGRBUElWZXJzaW9uIiwiaGFzT3duUHJvcGVydHkiLCJwaGV0aW9Db21wYXJlQVBJcyIsInJlZmVyZW5jZUFQSSIsInByb3Bvc2VkQVBJIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImFzc2lnbkluIiwiY29tcGFyZURlc2lnbmVkQVBJQ2hhbmdlcyIsImNvbXBhcmVCcmVha2luZ0FQSUNoYW5nZXMiLCJicmVha2luZ1Byb2JsZW1zIiwiZGVzaWduZWRQcm9ibGVtcyIsImFwcGVuZFByb2JsZW0iLCJwcm9ibGVtU3RyaW5nIiwiaXNEZXNpZ25lZFByb2JsZW0iLCJwdXNoIiwiYXBwZW5kQm90aFByb2JsZW1zIiwiaXNEZXNpZ25lZEVsZW1lbnQiLCJ2aXNpdCIsInRyYWlsIiwicmVmZXJlbmNlIiwicHJvcG9zZWQiLCJqb2luIiwicGhldGlvRGVzaWduZWQiLCJyZWZlcmVuY2VDb21wbGV0ZU1ldGFkYXRhIiwicHJvcG9zZWRDb21wbGV0ZU1ldGFkYXRhIiwicmVwb3J0RGlmZmVyZW5jZXMiLCJtZXRhZGF0YUtleSIsImlzRGVzaWduZWRDaGFuZ2UiLCJpbnZhbGlkUHJvcG9zZWRWYWx1ZSIsInJlZmVyZW5jZVZhbHVlIiwicHJvcG9zZWRWYWx1ZSIsImlnbm9yZUJyb2tlblByb3Bvc2VkIiwidW5kZWZpbmVkIiwiaWdub3JlQnJva2VuUmVmZXJlbmNlIiwiaWdub3JlIiwiX2RhdGEiLCJpbml0aWFsU3RhdGUiLCJhcGlTdXBwb3J0c0FQSVN0YXRlS2V5cyIsInJlZmVyZW5jZXNJbml0aWFsU3RhdGUiLCJwcm9wb3NlZEluaXRpYWxTdGF0ZSIsInRlc3RJbml0aWFsU3RhdGUiLCJ0ZXN0RGVzaWduZWQiLCJpc0NvbXBhdGlibGUiLCJpc0VxdWFsV2l0aCIsInJlZmVyZW5jZVN0YXRlIiwicHJvcG9zZWRTdGF0ZSIsInZhbGlkVmFsdWVzIiwiZXZlcnkiLCJ2YWxpZFZhbHVlIiwiaW5jbHVkZXMiLCJKU09OIiwic3RyaW5naWZ5IiwicmVwb3J0VGhlUHJvYmxlbSIsImNvbmNhdCIsInJlZmVyZW5jZVR5cGUiLCJwcm9wb3NlZFR5cGUiLCJyZWZlcmVuY2VNZXRob2RzIiwibWV0aG9kcyIsInByb3Bvc2VkTWV0aG9kcyIsInJlZmVyZW5jZU1ldGhvZCIsInJlZmVyZW5jZVBhcmFtcyIsInBhcmFtZXRlclR5cGVzIiwicHJvcG9zZWRQYXJhbXMiLCJyZWZlcmVuY2VSZXR1cm5UeXBlIiwicmV0dXJuVHlwZSIsInByb3Bvc2VkUmV0dXJuVHlwZSIsInJlZmVyZW5jZUV2ZW50cyIsImV2ZW50cyIsInByb3Bvc2VkRXZlbnRzIiwiZXZlbnQiLCJhcGlTdGF0ZUtleXMiLCJyZXN1bHQiLCJyZWZlcmVuY2VBUElTdGF0ZUtleXMiLCJwcm9wb3NlZEFQSVN0YXRlS2V5cyIsImlzRXF1YWwiLCJpblJlZmVyZW5jZU5vdFByb3Bvc2VkIiwiZGlmZmVyZW5jZSIsImluUHJvcG9zZWROb3RSZWZlcmVuY2UiLCJyZWZlcmVuY2VTdXBlcnR5cGVOYW1lIiwicHJvcG9zZWRTdXBlcnR5cGVOYW1lIiwicmVmZXJlbmNlUGFyYW1ldGVyVHlwZXMiLCJwcm9wb3NlZFBhcmFtZXRlclR5cGVzIiwicmVmZXJlbmNlRGVmYXVsdHMiLCJwcm9wb3NlZERlZmF1bHRzIiwibWFqb3IiLCJtaW5vciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7OztDQWNDLEdBRUQsd0dBQXdHO0FBRXhHLE9BQU9BLFlBQVkseURBQXlEO0FBSTVFLE9BQU9DLDhCQUE4QixnQ0FBZ0M7QUFZckUsTUFBTUMsb0JBQW9CO0FBQzFCLE1BQU1DLGdCQUFnQjtBQUV0Qix1RUFBdUU7QUFDdkUsTUFBTUMsYUFBYSxDQUFFQyxNQUFpQkEsUUFBUUgscUJBQXFCRyxRQUFRRjtBQUUzRTs7OztDQUlDLEdBQ0QsTUFBTUcsbUJBQW1CLENBQUVDLEtBQXFEQztJQUM5RSxNQUFNQyxZQUFZRCxFQUFFRSxTQUFTLENBQUVIO0lBRS9CLGtDQUFrQztJQUNsQyxNQUFNSSxpQkFBaUMsQ0FBQztJQUN4Q0MsT0FBT0MsSUFBSSxDQUFFTixJQUFJTyxjQUFjLEVBQUdDLE9BQU8sQ0FBRUMsQ0FBQUE7UUFDekMsTUFBTUMsUUFBUVYsSUFBSU8sY0FBYyxDQUFFRSxTQUFVO1FBRTVDLCtHQUErRztRQUMvRyw2RkFBNkY7UUFDN0YsTUFBTUUsUUFBUUYsU0FBU0csS0FBSyxDQUFFO1FBRTlCLHFCQUFxQjtRQUNyQixJQUFJQyxRQUFRVDtRQUNaTyxNQUFNSCxPQUFPLENBQUVNLENBQUFBO1lBQ2JELEtBQUssQ0FBRUMsY0FBZSxHQUFHRCxLQUFLLENB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