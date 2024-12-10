// Copyright 2017-2024, University of Colorado Boulder
/**
 * Base type that provides PhET-iO features. An instrumented PhetioObject is referred to on the wrapper side/design side
 * as a "PhET-iO Element".  Note that sims may have hundreds or thousands of PhetioObjects, so performance and memory
 * considerations are important.  For this reason, initializePhetioObject is only called in PhET-iO brand, which means
 * many of the getters such as `phetioState` and `phetioDocumentation` will not work in other brands. We have opted
 * to have these getters throw assertion errors in other brands to help identify problems if these are called
 * unexpectedly.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
import animationFrameTimer from '../../axon/js/animationFrameTimer.js';
import Disposable from '../../axon/js/Disposable.js';
import validate from '../../axon/js/validate.js';
import arrayRemove from '../../phet-core/js/arrayRemove.js';
import assertMutuallyExclusiveOptions from '../../phet-core/js/assertMutuallyExclusiveOptions.js';
import merge from '../../phet-core/js/merge.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import DescriptionRegistry from './DescriptionRegistry.js';
import EventType from './EventType.js';
import LinkedElementIO from './LinkedElementIO.js';
import phetioAPIValidation from './phetioAPIValidation.js';
import Tandem from './Tandem.js';
import TandemConstants from './TandemConstants.js';
import tandemNamespace from './tandemNamespace.js';
import IOType from './types/IOType.js';
// constants
const PHET_IO_ENABLED = Tandem.PHET_IO_ENABLED;
const IO_TYPE_VALIDATOR = {
    valueType: IOType,
    validationMessage: 'phetioType must be an IOType'
};
const BOOLEAN_VALIDATOR = {
    valueType: 'boolean'
};
// use "<br>" instead of newlines
const PHET_IO_DOCUMENTATION_VALIDATOR = {
    valueType: 'string',
    isValidValue: (doc)=>!doc.includes('\n'),
    validationMessage: 'phetioDocumentation must be provided in the right format'
};
const PHET_IO_EVENT_TYPE_VALIDATOR = {
    valueType: EventType,
    validationMessage: 'invalid phetioEventType'
};
const OBJECT_VALIDATOR = {
    valueType: [
        Object,
        null
    ]
};
const objectToPhetioID = (phetioObject)=>phetioObject.tandem.phetioID;
// When an event is suppressed from the data stream, we keep track of it with this token.
const SKIPPING_MESSAGE = -1;
const ENABLE_DESCRIPTION_REGISTRY = !!((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.supportsDescriptionPlugin);
const DEFAULTS = {
    // Subtypes can use `Tandem.REQUIRED` to require a named tandem passed in
    tandem: Tandem.OPTIONAL,
    // Defines description-specific tandems that do NOT affect the phet-io system.
    descriptionTandem: Tandem.OPTIONAL,
    // Defines API methods, events and serialization
    phetioType: IOType.ObjectIO,
    // Useful notes about an instrumented PhetioObject, shown in the PhET-iO Studio Wrapper. It's an html
    // string, so "<br>" tags are required instead of "\n" characters for proper rendering in Studio
    phetioDocumentation: TandemConstants.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioDocumentation,
    // When true, includes the PhetioObject in the PhET-iO state (not automatically recursive, must be specified for
    // children explicitly)
    phetioState: TandemConstants.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioState,
    // This option controls how PhET-iO wrappers can interface with this PhetioObject. Predominately this occurs via
    // public methods defined on this PhetioObject's phetioType, in which some method are not executable when this flag
    // is true. See `ObjectIO.methods` for further documentation, especially regarding `invocableForReadOnlyElements`.
    // NOTE: PhetioObjects with {phetioState: true} AND {phetioReadOnly: true} are restored during via setState.
    phetioReadOnly: TandemConstants.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioReadOnly,
    // Category of event type, can be overridden in phetioStartEvent options.  Cannot be supplied through TandemConstants because
    // that would create an import loop
    phetioEventType: EventType.MODEL,
    // High frequency events such as mouse moves can be omitted from data stream, see ?phetioEmitHighFrequencyEvents
    // and PhetioClient.launchSimulation option
    // @deprecated - see https://github.com/phetsims/phet-io/issues/1629#issuecomment-608002410
    phetioHighFrequency: TandemConstants.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioHighFrequency,
    // When true, emits events for data streams for playback, see handlePlaybackEvent.js
    phetioPlayback: TandemConstants.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioPlayback,
    // When true, this is categorized as an important "featured" element in Studio.
    phetioFeatured: TandemConstants.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioFeatured,
    // indicates that an object may or may not have been created. Applies recursively automatically
    // and should only be set manually on the root dynamic element. Dynamic archetypes will have this overwritten to
    // false even if explicitly provided as true, as archetypes cannot be dynamic.
    phetioDynamicElement: TandemConstants.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioDynamicElement,
    // Marking phetioDesigned: true opts-in to API change detection tooling that can be used to catch inadvertent
    // changes to a designed API.  A phetioDesigned:true PhetioObject (or any of its tandem descendants) will throw
    // assertion errors on CT (or when running with ?phetioCompareAPI) when the following are true:
    // (a) its package.json lists compareDesignedAPIChanges:true in the "phet-io" section
    // (b) the simulation is listed in perennial/data/phet-io-api-stable
    // (c) any of its metadata values deviate from the reference API
    phetioDesigned: TandemConstants.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioDesigned,
    // delivered with each event, if specified. phetioPlayback is appended here, if true.
    // Note: unlike other options, this option can be mutated downstream, and hence should be created newly for each instance.
    phetioEventMetadata: null,
    // null means no constraint on tandem name.
    tandemNameSuffix: null
};
assert && assert(EventType.phetioType.toStateObject(DEFAULTS.phetioEventType) === TandemConstants.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioEventType, 'phetioEventType must have the same default as the default metadata values.');
let PhetioObject = class PhetioObject extends Disposable {
    /**
   * Like SCENERY/Node, PhetioObject can be configured during construction or later with a mutate call.
   * Noop if provided options keys don't intersect with any key in DEFAULTS; baseOptions are ignored for this calculation.
   */ initializePhetioObject(baseOptions, providedOptions) {
        assert && assert(!baseOptions.hasOwnProperty('isDisposable'), 'baseOptions should not contain isDisposable');
        this.initializeDisposable(providedOptions);
        assert && assert(providedOptions, 'initializePhetioObject must be called with providedOptions');
        // call before we exit early to support logging unsupplied Tandems.
        providedOptions.tandem && Tandem.onMissingTandem(providedOptions.tandem);
        // Make sure that required tandems are supplied
        if (assert && Tandem.VALIDATION && providedOptions.tandem && providedOptions.tandem.required) {
            assert(providedOptions.tandem.supplied, 'required tandems must be supplied');
        }
        if (ENABLE_DESCRIPTION_REGISTRY && providedOptions.tandem && providedOptions.tandem.supplied) {
            DescriptionRegistry.add(providedOptions.tandem, this);
        }
        // The presence of `tandem` indicates if this PhetioObject can be initialized. If not yet initialized, perhaps
        // it will be initialized later on, as in Node.mutate().
        if (!(PHET_IO_ENABLED && providedOptions.tandem && providedOptions.tandem.supplied)) {
            // In this case, the PhetioObject is not initialized, but still set tandem to maintain a consistent API for
            // creating the Tandem tree.
            if (providedOptions.tandem) {
                this.tandem = providedOptions.tandem;
                this.phetioID = this.tandem.phetioID;
            }
            return;
        }
        assert && assert(!this.phetioObjectInitialized, 'cannot initialize twice');
        // Guard validation on assert to avoid calling a large number of no-ops when assertions are disabled, see https://github.com/phetsims/tandem/issues/200
        assert && validate(providedOptions.tandem, {
            valueType: Tandem
        });
        const defaults = combineOptions({}, DEFAULTS, baseOptions);
        let options = optionize()(defaults, providedOptions);
        // validate options before assigning to properties
        assert && validate(options.phetioType, IO_TYPE_VALIDATOR);
        assert && validate(options.phetioState, merge({}, BOOLEAN_VALIDATOR, {
            validationMessage: 'phetioState must be a boolean'
        }));
        assert && validate(options.phetioReadOnly, merge({}, BOOLEAN_VALIDATOR, {
            validationMessage: 'phetioReadOnly must be a boolean'
        }));
        assert && validate(options.phetioEventType, PHET_IO_EVENT_TYPE_VALIDATOR);
        assert && validate(options.phetioDocumentation, PHET_IO_DOCUMENTATION_VALIDATOR);
        assert && validate(options.phetioHighFrequency, merge({}, BOOLEAN_VALIDATOR, {
            validationMessage: 'phetioHighFrequency must be a boolean'
        }));
        assert && validate(options.phetioPlayback, merge({}, BOOLEAN_VALIDATOR, {
            validationMessage: 'phetioPlayback must be a boolean'
        }));
        assert && validate(options.phetioFeatured, merge({}, BOOLEAN_VALIDATOR, {
            validationMessage: 'phetioFeatured must be a boolean'
        }));
        assert && validate(options.phetioEventMetadata, merge({}, OBJECT_VALIDATOR, {
            validationMessage: 'object literal expected'
        }));
        assert && validate(options.phetioDynamicElement, merge({}, BOOLEAN_VALIDATOR, {
            validationMessage: 'phetioDynamicElement must be a boolean'
        }));
        assert && validate(options.phetioDesigned, merge({}, BOOLEAN_VALIDATOR, {
            validationMessage: 'phetioDesigned must be a boolean'
        }));
        assert && assert(this.linkedElements !== null, 'this means addLinkedElement was called before instrumentation of this PhetioObject');
        // optional - Indicates that an object is a archetype for a dynamic class. Settable only by
        // PhetioEngine and by classes that create dynamic elements when creating their archetype (like PhetioGroup) through
        // PhetioObject.markDynamicElementArchetype().
        // if true, items will be excluded from phetioState. This applies recursively automatically.
        this.phetioIsArchetype = false;
        // (phetioEngine)
        // Store the full baseline for usage in validation or for usage in studio.  Do this before applying overrides. The
        // baseline is created when a sim is run with assertions to assist in phetioAPIValidation.  However, even when
        // assertions are disabled, some wrappers such as studio need to generate the baseline anyway.
        // not all metadata are passed through via options, so store baseline for these additional properties
        this.phetioBaselineMetadata = phetioAPIValidation.enabled || phet.preloads.phetio.queryParameters.phetioEmitAPIBaseline ? this.getMetadata(merge({
            phetioIsArchetype: this.phetioIsArchetype,
            phetioArchetypePhetioID: this.phetioArchetypePhetioID
        }, options)) : null;
        // Dynamic elements should compare to their "archetypal" counterparts.  For example, this means that a Particle
        // in a PhetioGroup will take its overrides from the PhetioGroup archetype.
        const archetypalPhetioID = options.tandem.getArchetypalPhetioID();
        // Overrides are only defined for simulations, not for unit tests.  See https://github.com/phetsims/phet-io/issues/1461
        // Patch in the desired values from overrides, if any.
        if (window.phet.preloads.phetio.phetioElementsOverrides) {
            const overrides = window.phet.preloads.phetio.phetioElementsOverrides[archetypalPhetioID];
            if (overrides) {
                // No need to make a new object, since this "options" variable was created in the previous merge call above.
                options = optionize()(options, overrides);
            }
        }
        // (read-only) see docs at DEFAULTS declaration
        this.tandem = options.tandem;
        this.phetioID = this.tandem.phetioID;
        // (read-only) see docs at DEFAULTS declaration
        this._phetioType = options.phetioType;
        // (read-only) see docs at DEFAULTS declaration
        this._phetioState = options.phetioState;
        // (read-only) see docs at DEFAULTS declaration
        this._phetioReadOnly = options.phetioReadOnly;
        // (read-only) see docs at DEFAULTS declaration
        this._phetioDocumentation = options.phetioDocumentation;
        // see docs at DEFAULTS declaration
        this._phetioEventType = options.phetioEventType;
        // see docs at DEFAULTS declaration
        this._phetioHighFrequency = options.phetioHighFrequency;
        // see docs at DEFAULTS declaration
        this._phetioPlayback = options.phetioPlayback;
        // (PhetioEngine) see docs at DEFAULTS declaration - in order to recursively pass this value to
        // children, the setPhetioDynamicElement() function must be used instead of setting this attribute directly
        this._phetioDynamicElement = options.phetioDynamicElement;
        // (read-only) see docs at DEFAULTS declaration
        this._phetioFeatured = options.phetioFeatured;
        this._phetioEventMetadata = options.phetioEventMetadata;
        this._phetioDesigned = options.phetioDesigned;
        // for phetioDynamicElements, the corresponding phetioID for the element in the archetype subtree
        this.phetioArchetypePhetioID = null;
        //keep track of LinkedElements for disposal. Null out to support asserting on
        // edge error cases, see this.addLinkedElement()
        this.linkedElements = [];
        // (phet-io) set to true when this PhetioObject has been sent over to the parent.
        this.phetioNotifiedObjectCreated = false;
        // tracks the indices of started messages so that dataStream can check that ends match starts.
        this.phetioMessageStack = [];
        // Make sure playback shows in the phetioEventMetadata
        if (this._phetioPlayback) {
            this._phetioEventMetadata = this._phetioEventMetadata || {};
            assert && assert(!this._phetioEventMetadata.hasOwnProperty('playback'), 'phetioEventMetadata.playback should not already exist');
            this._phetioEventMetadata.playback = true;
        }
        // Alert that this PhetioObject is ready for cross-frame communication (thus becoming a "PhET-iO Element" on the wrapper side.
        this.tandem.addPhetioObject(this);
        this.phetioObjectInitialized = true;
        if (assert && Tandem.VALIDATION && this.isPhetioInstrumented() && options.tandemNameSuffix) {
            const suffixArray = Array.isArray(options.tandemNameSuffix) ? options.tandemNameSuffix : [
                options.tandemNameSuffix
            ];
            const matches = suffixArray.filter((suffix)=>{
                return this.tandem.name.endsWith(suffix) || this.tandem.name.endsWith(PhetioObject.swapCaseOfFirstCharacter(suffix));
            });
            assert && assert(matches.length > 0, 'Incorrect Tandem suffix, expected = ' + suffixArray.join(', ') + '. actual = ' + this.tandem.phetioID);
        }
    }
    static swapCaseOfFirstCharacter(string) {
        const firstChar = string[0];
        const newFirstChar = firstChar === firstChar.toLowerCase() ? firstChar.toUpperCase() : firstChar.toLowerCase();
        return newFirstChar + string.substring(1);
    }
    // throws an assertion error in brands other than PhET-iO
    get phetioType() {
        assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioType only accessible for instrumented objects in PhET-iO brand.');
        return this._phetioType;
    }
    // throws an assertion error in brands other than PhET-iO
    get phetioState() {
        assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioState only accessible for instrumented objects in PhET-iO brand.');
        return this._phetioState;
    }
    // throws an assertion error in brands other than PhET-iO
    get phetioReadOnly() {
        assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioReadOnly only accessible for instrumented objects in PhET-iO brand.');
        return this._phetioReadOnly;
    }
    // throws an assertion error in brands other than PhET-iO
    get phetioDocumentation() {
        assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioDocumentation only accessible for instrumented objects in PhET-iO brand.');
        return this._phetioDocumentation;
    }
    // throws an assertion error in brands other than PhET-iO
    get phetioEventType() {
        assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioEventType only accessible for instrumented objects in PhET-iO brand.');
        return this._phetioEventType;
    }
    // throws an assertion error in brands other than PhET-iO
    get phetioHighFrequency() {
        assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioHighFrequency only accessible for instrumented objects in PhET-iO brand.');
        return this._phetioHighFrequency;
    }
    // throws an assertion error in brands other than PhET-iO
    get phetioPlayback() {
        assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioPlayback only accessible for instrumented objects in PhET-iO brand.');
        return this._phetioPlayback;
    }
    // throws an assertion error in brands other than PhET-iO
    get phetioDynamicElement() {
        assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioDynamicElement only accessible for instrumented objects in PhET-iO brand.');
        return this._phetioDynamicElement;
    }
    // throws an assertion error in brands other than PhET-iO
    get phetioFeatured() {
        assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioFeatured only accessible for instrumented objects in PhET-iO brand.');
        return this._phetioFeatured;
    }
    // throws an assertion error in brands other than PhET-iO
    get phetioEventMetadata() {
        assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioEventMetadata only accessible for instrumented objects in PhET-iO brand.');
        return this._phetioEventMetadata;
    }
    // throws an assertion error in brands other than PhET-iO
    get phetioDesigned() {
        assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioDesigned only accessible for instrumented objects in PhET-iO brand.');
        return this._phetioDesigned;
    }
    /**
   * Start an event for the nested PhET-iO data stream.
   *
   * @param event - the name of the event
   * @param [providedOptions]
   */ phetioStartEvent(event, providedOptions) {
        if (PHET_IO_ENABLED && this.isPhetioInstrumented()) {
            // only one or the other can be provided
            assert && assertMutuallyExclusiveOptions(providedOptions, [
                'data'
            ], [
                'getData'
            ]);
            const options = optionize()({
                data: null,
                // function that, when called gets the data.
                getData: null
            }, providedOptions);
            assert && assert(this.phetioObjectInitialized, 'phetioObject should be initialized');
            assert && options.data && assert(typeof options.data === 'object');
            assert && options.getData && assert(typeof options.getData === 'function');
            assert && assert(arguments.length === 1 || arguments.length === 2, 'Prevent usage of incorrect signature');
            // TODO: don't drop PhET-iO events if they are created before we have a dataStream global. https://github.com/phetsims/phet-io/issues/1875
            if (!_.hasIn(window, 'phet.phetio.dataStream')) {
                // If you hit this, then it is likely related to https://github.com/phetsims/scenery/issues/1124 and we would like to know about it!
                // assert && assert( false, 'trying to create an event before the data stream exists' );
                this.phetioMessageStack.push(SKIPPING_MESSAGE);
                return;
            }
            // Opt out of certain events if queryParameter override is provided. Even for a low frequency data stream, high
            // frequency events can still be emitted when they have a low frequency ancestor.
            const skipHighFrequencyEvent = this.phetioHighFrequency && _.hasIn(window, 'phet.preloads.phetio.queryParameters') && !window.phet.preloads.phetio.queryParameters.phetioEmitHighFrequencyEvents && !phet.phetio.dataStream.isEmittingLowFrequencyEvent();
            // TODO: If there is no dataStream global defined, then we should handle this differently as to not drop the event that is triggered, see https://github.com/phetsims/phet-io/issues/1846
            const skipFromUndefinedDatastream = !assert && !_.hasIn(window, 'phet.phetio.dataStream');
            if (skipHighFrequencyEvent || this.phetioEventType === EventType.OPT_OUT || skipFromUndefinedDatastream) {
                this.phetioMessageStack.push(SKIPPING_MESSAGE);
                return;
            }
            // Only get the args if we are actually going to send the event.
            const data = options.getData ? options.getData() : options.data;
            this.phetioMessageStack.push(phet.phetio.dataStream.start(this.phetioEventType, this.tandem.phetioID, this.phetioType, event, data, this.phetioEventMetadata, this.phetioHighFrequency));
            // To support PhET-iO playback, any potential playback events downstream of this playback event must be marked as
            // non playback events. This is to prevent the PhET-iO playback engine from repeating those events. See
            // https://github.com/phetsims/phet-io/issues/1693
            this.phetioPlayback && phet.phetio.dataStream.pushNonPlaybackable();
        }
    }
    /**
   * End an event on the nested PhET-iO data stream. It this object was disposed or dataStream.start was not called,
   * this is a no-op.
   */ phetioEndEvent(assertCorrectIndices = false) {
        if (PHET_IO_ENABLED && this.isPhetioInstrumented()) {
            assert && assert(this.phetioMessageStack.length > 0, 'Must have messages to pop');
            const topMessageIndex = this.phetioMessageStack.pop();
            // The message was started as a high frequency event to be skipped, so the end is a no-op
            if (topMessageIndex === SKIPPING_MESSAGE) {
                return;
            }
            this.phetioPlayback && phet.phetio.dataStream.popNonPlaybackable();
            phet.phetio.dataStream.end(topMessageIndex, assertCorrectIndices);
        }
    }
    /**
   * Set any instrumented descendants of this PhetioObject to the same value as this.phetioDynamicElement.
   */ propagateDynamicFlagsToDescendants() {
        assert && assert(Tandem.PHET_IO_ENABLED, 'phet-io should be enabled');
        assert && assert(phet.phetio && phet.phetio.phetioEngine, 'Dynamic elements cannot be created statically before phetioEngine exists.');
        const phetioEngine = phet.phetio.phetioEngine;
        // in the same order as bufferedPhetioObjects
        const unlaunchedPhetioIDs = !Tandem.launched ? Tandem.bufferedPhetioObjects.map(objectToPhetioID) : [];
        this.tandem.iterateDescendants((tandem)=>{
            const phetioID = tandem.phetioID;
            if (phetioEngine.hasPhetioObject(phetioID) || !Tandem.launched && unlaunchedPhetioIDs.includes(phetioID)) {
                assert && assert(this.isPhetioInstrumented());
                const phetioObject = phetioEngine.hasPhetioObject(phetioID) ? phetioEngine.getPhetioElement(phetioID) : Tandem.bufferedPhetioObjects[unlaunchedPhetioIDs.indexOf(phetioID)];
                assert && assert(phetioObject, 'should have a phetioObject here');
                // Order matters here! The phetioIsArchetype needs to be first to ensure that the setPhetioDynamicElement
                // setter can opt out for archetypes.
                phetioObject.phetioIsArchetype = this.phetioIsArchetype;
                phetioObject.setPhetioDynamicElement(this.phetioDynamicElement);
                if (phetioObject.phetioBaselineMetadata) {
                    phetioObject.phetioBaselineMetadata.phetioIsArchetype = this.phetioIsArchetype;
                }
            }
        });
    }
    /**
   * Used in PhetioEngine
   */ setPhetioDynamicElement(phetioDynamicElement) {
        assert && assert(!this.phetioNotifiedObjectCreated, 'should not change dynamic element flags after notifying this PhetioObject\'s creation.');
        assert && assert(this.isPhetioInstrumented());
        // All archetypes are static (non-dynamic)
        this._phetioDynamicElement = this.phetioIsArchetype ? false : phetioDynamicElement;
        // For dynamic elements, indicate the corresponding archetype element so that clients like Studio can leverage
        // the archetype metadata. Static elements don't have archetypes.
        this.phetioArchetypePhetioID = phetioDynamicElement ? this.tandem.getArchetypalPhetioID() : null;
        // Keep the baseline metadata in sync.
        if (this.phetioBaselineMetadata) {
            this.phetioBaselineMetadata.phetioDynamicElement = this.phetioDynamicElement;
        }
    }
    /**
   * Mark this PhetioObject as an archetype for dynamic elements.
   */ markDynamicElementArchetype() {
        assert && assert(!this.phetioNotifiedObjectCreated, 'should not change dynamic element flags after notifying this PhetioObject\'s creation.');
        this.phetioIsArchetype = true;
        this.setPhetioDynamicElement(false); // because archetypes aren't dynamic elements
        if (this.phetioBaselineMetadata) {
            this.phetioBaselineMetadata.phetioIsArchetype = this.phetioIsArchetype;
        }
        // recompute for children also, but only if phet-io is enabled
        Tandem.PHET_IO_ENABLED && this.propagateDynamicFlagsToDescendants();
    }
    /**
   * A PhetioObject will only be instrumented if the tandem that was passed in was "supplied". See Tandem.supplied
   * for more info.
   */ isPhetioInstrumented() {
        return this.tandem && this.tandem.supplied;
    }
    /**
   * When an instrumented PhetioObject is linked with another instrumented PhetioObject, this creates a one-way
   * association which is rendered in Studio as a "symbolic" link or hyperlink. Many common code UI elements use this
   * automatically. To keep client sites simple, this has a graceful opt-out mechanism which makes this function a
   * no-op if either this PhetioObject or the target PhetioObject is not instrumented.
   *
   * You can specify the tandem one of three ways:
   * 1. Without specifying tandemName or tandem, it will pluck the tandem.name from the target element
   * 2. If tandemName is specified in the options, it will use that tandem name and nest the tandem under this PhetioObject's tandem
   * 3. If tandem is specified in the options (not recommended), it will use that tandem and nest it anywhere that tandem exists.
   *    Use this option with caution since it allows you to nest the tandem anywhere in the tree.
   *
   * @param element - the target element. Must be instrumented for a LinkedElement to be created-- otherwise gracefully opts out
   * @param [providedOptions]
   */ addLinkedElement(element, providedOptions) {
        if (!this.isPhetioInstrumented()) {
            // set this to null so that you can't addLinkedElement on an uninitialized PhetioObject and then instrument
            // it afterward.
            this.linkedElements = null;
            return;
        }
        // In some cases, UI components need to be wired up to a private (internal) Property which should neither be
        // instrumented nor linked.
        if (PHET_IO_ENABLED && element.isPhetioInstrumented()) {
            const options = optionize()({
                // The linkage is only featured if the parent and the element are both also featured
                phetioFeatured: this.phetioFeatured && element.phetioFeatured
            }, providedOptions);
            assert && assert(Array.isArray(this.linkedElements), 'linkedElements should be an array');
            let tandem = null;
            if (providedOptions && providedOptions.tandem) {
                tandem = providedOptions.tandem;
            } else if (providedOptions && providedOptions.tandemName) {
                tandem = this.tandem.createTandem(providedOptions.tandemName);
            } else if (!providedOptions && element.tandem) {
                tandem = this.tandem.createTandem(element.tandem.name);
            }
            if (tandem) {
                options.tandem = tandem;
            }
            this.linkedElements.push(new LinkedElement(element, options));
        }
    }
    /**
   * Remove all linked elements linking to the provided PhetioObject. This will dispose all removed LinkedElements. This
   * will be graceful, and doesn't assume or assert that the provided PhetioObject has LinkedElement(s), it will just
   * remove them if they are there.
   */ removeLinkedElements(potentiallyLinkedElement) {
        if (this.isPhetioInstrumented() && this.linkedElements) {
            assert && assert(potentiallyLinkedElement.isPhetioInstrumented());
            const toRemove = this.linkedElements.filter((linkedElement)=>linkedElement.element === potentiallyLinkedElement);
            toRemove.forEach((linkedElement)=>{
                linkedElement.dispose();
                arrayRemove(this.linkedElements, linkedElement);
            });
        }
    }
    /**
   * Performs cleanup after the sim's construction has finished.
   */ onSimulationConstructionCompleted() {
        // deletes the phetioBaselineMetadata, as it's no longer needed since validation is complete.
        this.phetioBaselineMetadata = null;
    }
    /**
   * Overrideable so that subclasses can return a different PhetioObject for studio autoselect. This method is called
   * when there is a scene graph hit. Return the corresponding target that matches the PhET-iO filters.  Note this means
   * that if PhET-iO Studio is looking for a featured item and this is not featured, it will return 'phetioNotSelectable'.
   * Something is 'phetioNotSelectable' if it is not instrumented or if it does not match the "featured" filtering.
   *
   * The `fromLinking` flag allows a cutoff to prevent recursive linking chains in 'linked' mode. Given these linked elements:
   * cardNode -> card -> cardValueProperty
   * We don't want 'linked' mode to map from cardNode all the way to cardValueProperty (at least automatically), see https://github.com/phetsims/tandem/issues/300
   */ getPhetioMouseHitTarget(fromLinking = false) {
        assert && assert(phet.tandem.phetioElementSelectionProperty.value !== 'none', 'getPhetioMouseHitTarget should not be called when phetioElementSelectionProperty is none');
        // Don't get a linked element for a linked element (recursive link element searching)
        if (!fromLinking && phet.tandem.phetioElementSelectionProperty.value === 'linked') {
            const linkedElement = this.getCorrespondingLinkedElement();
            if (linkedElement !== 'noCorrespondingLinkedElement') {
                return linkedElement.getPhetioMouseHitTarget(true);
            } else if (this.tandem.parentTandem) {
                // Look for a sibling linkedElement if there are no child linkages, see https://github.com/phetsims/studio/issues/246#issuecomment-1018733408
                const parent = phet.phetio.phetioEngine.phetioElementMap[this.tandem.parentTandem.phetioID];
                if (parent) {
                    const linkedParentElement = parent.getCorrespondingLinkedElement();
                    if (linkedParentElement !== 'noCorrespondingLinkedElement') {
                        return linkedParentElement.getPhetioMouseHitTarget(true);
                    }
                }
            }
        // Otherwise fall back to the view element, don't return here
        }
        if (phet.tandem.phetioElementSelectionProperty.value === 'string') {
            return 'phetioNotSelectable';
        }
        return this.getPhetioMouseHitTargetSelf();
    }
    /**
   * Determine if this instance should be selectable
   */ getPhetioMouseHitTargetSelf() {
        return this.isPhetioMouseHitSelectable() ? this : 'phetioNotSelectable';
    }
    /**
   * Factored out function returning if this instance is phetio selectable
   */ isPhetioMouseHitSelectable() {
        // We are not selectable if we are unfeatured and we are only displaying featured elements.
        // To prevent a circular dependency. We need to have a Property (which is a PhetioObject) in order to use it.
        // This should remain a hard failure if we have not loaded this display Property by the time we want a mouse-hit target.
        const featuredFilterCorrect = phet.tandem.phetioElementsDisplayProperty.value !== 'featured' || this.isDisplayedInFeaturedTree();
        return this.isPhetioInstrumented() && featuredFilterCorrect;
    }
    /**
   * This function determines not only if this PhetioObject is phetioFeatured, but if any descendant of this
   * PhetioObject is phetioFeatured, this will influence if this instance is displayed while showing phetioFeatured,
   * since featured children will cause the parent to be displayed as well.
   */ isDisplayedInFeaturedTree() {
        if (this.isPhetioInstrumented() && this.phetioFeatured) {
            return true;
        }
        let displayed = false;
        this.tandem.iterateDescendants((descendantTandem)=>{
            const parent = phet.phetio.phetioEngine.phetioElementMap[descendantTandem.phetioID];
            if (parent && parent.isPhetioInstrumented() && parent.phetioFeatured) {
                displayed = true;
            }
        });
        return displayed;
    }
    /**
   * Acquire the linkedElement that most closely relates to this PhetioObject, given some heuristics. First, if there is
   * only a single LinkedElement child, use that. Otherwise, select hard coded names that are likely to be most important.
   */ getCorrespondingLinkedElement() {
        const children = Object.keys(this.tandem.children);
        const linkedChildren = [];
        children.forEach((childName)=>{
            const childPhetioID = phetio.PhetioIDUtils.append(this.tandem.phetioID, childName);
            // Note that if it doesn't find a phetioID, that may be a synthetic node with children but not itself instrumented.
            const phetioObject = phet.phetio.phetioEngine.phetioElementMap[childPhetioID];
            if (phetioObject instanceof LinkedElement) {
                linkedChildren.push(phetioObject);
            }
        });
        const linkedTandemNames = linkedChildren.map((linkedElement)=>{
            return phetio.PhetioIDUtils.getComponentName(linkedElement.phetioID);
        });
        let linkedChild = null;
        if (linkedChildren.length === 1) {
            linkedChild = linkedChildren[0];
        } else if (linkedTandemNames.includes('property')) {
            // Prioritize a linked child named "property"
            linkedChild = linkedChildren[linkedTandemNames.indexOf('property')];
        } else if (linkedTandemNames.includes('valueProperty')) {
            // Next prioritize "valueProperty", a common name for the controlling Property of a view component
            linkedChild = linkedChildren[linkedTandemNames.indexOf('valueProperty')];
        } else {
            // Either there are no linked children, or too many to know which one to select.
            return 'noCorrespondingLinkedElement';
        }
        assert && assert(linkedChild, 'phetioElement is needed');
        return linkedChild.element;
    }
    /**
   * Remove this phetioObject from PhET-iO. After disposal, this object is no longer interoperable. Also release any
   * other references created during its lifetime.
   *
   * In order to support the structured data stream, PhetioObjects must end the messages in the correct
   * sequence, without being interrupted by dispose() calls.  Therefore, we do not clear out any of the state
   * related to the endEvent.  Note this means it is acceptable (and expected) for endEvent() to be called on
   * disposed PhetioObjects.
   */ dispose() {
        // The phetioEvent stack should resolve by the next frame, so that's when we check it.
        if (assert && Tandem.PHET_IO_ENABLED && this.tandem.supplied) {
            const descendants = [];
            this.tandem.iterateDescendants((tandem)=>{
                if (phet.phetio.phetioEngine.hasPhetioObject(tandem.phetioID)) {
                    descendants.push(phet.phetio.phetioEngine.getPhetioElement(tandem.phetioID));
                }
            });
            animationFrameTimer.runOnNextTick(()=>{
                // Uninstrumented PhetioObjects don't have a phetioMessageStack attribute.
                assert && assert(!this.hasOwnProperty('phetioMessageStack') || this.phetioMessageStack.length === 0, 'phetioMessageStack should be clear');
                descendants.forEach((descendant)=>{
                    assert && assert(descendant.isDisposed, `All descendants must be disposed by the next frame: ${descendant.tandem.phetioID}`);
                });
            });
        }
        if (ENABLE_DESCRIPTION_REGISTRY && this.tandem && this.tandem.supplied) {
            DescriptionRegistry.remove(this);
        }
        // Detach from listeners and dispose the corresponding tandem. This must happen in PhET-iO brand and PhET brand
        // because in PhET brand, PhetioDynamicElementContainer dynamic elements would memory leak tandems (parent tandems
        // would retain references to their children).
        this.tandem.removePhetioObject(this);
        // Dispose LinkedElements
        if (this.linkedElements) {
            this.linkedElements.forEach((linkedElement)=>linkedElement.dispose());
            this.linkedElements.length = 0;
        }
        super.dispose();
    }
    /**
   * JSONifiable metadata that describes the nature of the PhetioObject.  We must be able to read this
   * for baseline (before object fully constructed we use object) and after fully constructed
   * which includes overrides.
   * @param [object] - used to get metadata keys, can be a PhetioObject, or an options object
   *                          (see usage initializePhetioObject). If not provided, will instead use the value of "this"
   * @returns - metadata plucked from the passed in parameter
   */ getMetadata(object) {
        object = object || this;
        const metadata = {
            phetioTypeName: object.phetioType.typeName,
            phetioDocumentation: object.phetioDocumentation,
            phetioState: object.phetioState,
            phetioReadOnly: object.phetioReadOnly,
            phetioEventType: EventType.phetioType.toStateObject(object.phetioEventType),
            phetioHighFrequency: object.phetioHighFrequency,
            phetioPlayback: object.phetioPlayback,
            phetioDynamicElement: object.phetioDynamicElement,
            phetioIsArchetype: object.phetioIsArchetype,
            phetioFeatured: object.phetioFeatured,
            phetioDesigned: object.phetioDesigned
        };
        if (object.phetioArchetypePhetioID) {
            metadata.phetioArchetypePhetioID = object.phetioArchetypePhetioID;
        }
        return metadata;
    }
    static create(options) {
        return new PhetioObject(options);
    }
    constructor(options){
        super();
        this.tandem = DEFAULTS.tandem;
        this.phetioID = this.tandem.phetioID;
        this.phetioObjectInitialized = false;
        if (options) {
            this.initializePhetioObject({}, options);
        }
    }
};
PhetioObject.DEFAULT_OPTIONS = DEFAULTS;
// Public facing documentation, no need to include metadata that may we don't want clients knowing about
PhetioObject.METADATA_DOCUMENTATION = 'Get metadata about the PhET-iO Element. This includes the following keys:<ul>' + '<li><strong>phetioTypeName:</strong> The name of the PhET-iO Type\n</li>' + '<li><strong>phetioDocumentation:</strong> default - null. Useful notes about a PhET-iO Element, shown in the PhET-iO Studio Wrapper</li>' + '<li><strong>phetioState:</strong> default - true. When true, includes the PhET-iO Element in the PhET-iO state\n</li>' + '<li><strong>phetioReadOnly:</strong> default - false. When true, you can only get values from the PhET-iO Element; no setting allowed.\n</li>' + '<li><strong>phetioEventType:</strong> default - MODEL. The category of event that this element emits to the PhET-iO Data Stream.\n</li>' + '<li><strong>phetioDynamicElement:</strong> default - false. If this element is a "dynamic element" that can be created and destroyed throughout the lifetime of the sim (as opposed to existing forever).\n</li>' + '<li><strong>phetioIsArchetype:</strong> default - false. If this element is an archetype for a dynamic element.\n</li>' + '<li><strong>phetioFeatured:</strong> default - false. If this is a featured PhET-iO Element.\n</li>' + '<li><strong>phetioArchetypePhetioID:</strong> default - \'\'. If an applicable dynamic element, this is the phetioID of its archetype.\n</li></ul>';
/**
 * Internal class to avoid cyclic dependencies.
 */ let LinkedElement = class LinkedElement extends PhetioObject {
    constructor(coreElement, providedOptions){
        assert && assert(!!coreElement, 'coreElement should be defined');
        const options = optionize()({
            phetioType: LinkedElementIO,
            phetioState: true,
            // By default, LinkedElements are as featured as their coreElements are.
            phetioFeatured: coreElement.phetioFeatured
        }, providedOptions);
        // References cannot be changed by PhET-iO
        assert && assert(!options.hasOwnProperty('phetioReadOnly'), 'phetioReadOnly set by LinkedElement');
        options.phetioReadOnly = true;
        super(options);
        this.element = coreElement;
    }
};
tandemNamespace.register('PhetioObject', PhetioObject);
export { PhetioObject as default, LinkedElement };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQmFzZSB0eXBlIHRoYXQgcHJvdmlkZXMgUGhFVC1pTyBmZWF0dXJlcy4gQW4gaW5zdHJ1bWVudGVkIFBoZXRpb09iamVjdCBpcyByZWZlcnJlZCB0byBvbiB0aGUgd3JhcHBlciBzaWRlL2Rlc2lnbiBzaWRlXG4gKiBhcyBhIFwiUGhFVC1pTyBFbGVtZW50XCIuICBOb3RlIHRoYXQgc2ltcyBtYXkgaGF2ZSBodW5kcmVkcyBvciB0aG91c2FuZHMgb2YgUGhldGlvT2JqZWN0cywgc28gcGVyZm9ybWFuY2UgYW5kIG1lbW9yeVxuICogY29uc2lkZXJhdGlvbnMgYXJlIGltcG9ydGFudC4gIEZvciB0aGlzIHJlYXNvbiwgaW5pdGlhbGl6ZVBoZXRpb09iamVjdCBpcyBvbmx5IGNhbGxlZCBpbiBQaEVULWlPIGJyYW5kLCB3aGljaCBtZWFuc1xuICogbWFueSBvZiB0aGUgZ2V0dGVycyBzdWNoIGFzIGBwaGV0aW9TdGF0ZWAgYW5kIGBwaGV0aW9Eb2N1bWVudGF0aW9uYCB3aWxsIG5vdCB3b3JrIGluIG90aGVyIGJyYW5kcy4gV2UgaGF2ZSBvcHRlZFxuICogdG8gaGF2ZSB0aGVzZSBnZXR0ZXJzIHRocm93IGFzc2VydGlvbiBlcnJvcnMgaW4gb3RoZXIgYnJhbmRzIHRvIGhlbHAgaWRlbnRpZnkgcHJvYmxlbXMgaWYgdGhlc2UgYXJlIGNhbGxlZFxuICogdW5leHBlY3RlZGx5LlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IGFuaW1hdGlvbkZyYW1lVGltZXIgZnJvbSAnLi4vLi4vYXhvbi9qcy9hbmltYXRpb25GcmFtZVRpbWVyLmpzJztcbmltcG9ydCBEaXNwb3NhYmxlLCB7IERpc3Bvc2FibGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vYXhvbi9qcy9EaXNwb3NhYmxlLmpzJztcbmltcG9ydCB2YWxpZGF0ZSBmcm9tICcuLi8uLi9heG9uL2pzL3ZhbGlkYXRlLmpzJztcbmltcG9ydCBhcnJheVJlbW92ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvYXJyYXlSZW1vdmUuanMnO1xuaW1wb3J0IGFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zLmpzJztcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucywgT3B0aW9uaXplRGVmYXVsdHMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IERlc2NyaXB0aW9uUmVnaXN0cnkgZnJvbSAnLi9EZXNjcmlwdGlvblJlZ2lzdHJ5LmpzJztcbmltcG9ydCBFdmVudFR5cGUgZnJvbSAnLi9FdmVudFR5cGUuanMnO1xuaW1wb3J0IExpbmtlZEVsZW1lbnRJTyBmcm9tICcuL0xpbmtlZEVsZW1lbnRJTy5qcyc7XG5pbXBvcnQgeyBQaGV0aW9FbGVtZW50TWV0YWRhdGEsIFBoZXRpb0lEIH0gZnJvbSAnLi9waGV0LWlvLXR5cGVzLmpzJztcbmltcG9ydCBwaGV0aW9BUElWYWxpZGF0aW9uIGZyb20gJy4vcGhldGlvQVBJVmFsaWRhdGlvbi5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4vVGFuZGVtLmpzJztcbmltcG9ydCBUYW5kZW1Db25zdGFudHMgZnJvbSAnLi9UYW5kZW1Db25zdGFudHMuanMnO1xuaW1wb3J0IHRhbmRlbU5hbWVzcGFjZSBmcm9tICcuL3RhbmRlbU5hbWVzcGFjZS5qcyc7XG5pbXBvcnQgSU9UeXBlIGZyb20gJy4vdHlwZXMvSU9UeXBlLmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBQSEVUX0lPX0VOQUJMRUQgPSBUYW5kZW0uUEhFVF9JT19FTkFCTEVEO1xuY29uc3QgSU9fVFlQRV9WQUxJREFUT1IgPSB7IHZhbHVlVHlwZTogSU9UeXBlLCB2YWxpZGF0aW9uTWVzc2FnZTogJ3BoZXRpb1R5cGUgbXVzdCBiZSBhbiBJT1R5cGUnIH07XG5jb25zdCBCT09MRUFOX1ZBTElEQVRPUiA9IHsgdmFsdWVUeXBlOiAnYm9vbGVhbicgfTtcblxuLy8gdXNlIFwiPGJyPlwiIGluc3RlYWQgb2YgbmV3bGluZXNcbmNvbnN0IFBIRVRfSU9fRE9DVU1FTlRBVElPTl9WQUxJREFUT1IgPSB7XG4gIHZhbHVlVHlwZTogJ3N0cmluZycsXG4gIGlzVmFsaWRWYWx1ZTogKCBkb2M6IHN0cmluZyApID0+ICFkb2MuaW5jbHVkZXMoICdcXG4nICksXG4gIHZhbGlkYXRpb25NZXNzYWdlOiAncGhldGlvRG9jdW1lbnRhdGlvbiBtdXN0IGJlIHByb3ZpZGVkIGluIHRoZSByaWdodCBmb3JtYXQnXG59O1xuY29uc3QgUEhFVF9JT19FVkVOVF9UWVBFX1ZBTElEQVRPUiA9IHtcbiAgdmFsdWVUeXBlOiBFdmVudFR5cGUsXG4gIHZhbGlkYXRpb25NZXNzYWdlOiAnaW52YWxpZCBwaGV0aW9FdmVudFR5cGUnXG59O1xuY29uc3QgT0JKRUNUX1ZBTElEQVRPUiA9IHsgdmFsdWVUeXBlOiBbIE9iamVjdCwgbnVsbCBdIH07XG5cbmNvbnN0IG9iamVjdFRvUGhldGlvSUQgPSAoIHBoZXRpb09iamVjdDogUGhldGlvT2JqZWN0ICkgPT4gcGhldGlvT2JqZWN0LnRhbmRlbS5waGV0aW9JRDtcblxudHlwZSBTdGFydEV2ZW50T3B0aW9ucyA9IHtcbiAgZGF0YT86IFJlY29yZDxzdHJpbmcsIEludGVudGlvbmFsQW55PiB8IG51bGw7XG4gIGdldERhdGE/OiAoICgpID0+IFJlY29yZDxzdHJpbmcsIEludGVudGlvbmFsQW55PiApIHwgbnVsbDtcbn07XG5cbi8vIFdoZW4gYW4gZXZlbnQgaXMgc3VwcHJlc3NlZCBmcm9tIHRoZSBkYXRhIHN0cmVhbSwgd2Uga2VlcCB0cmFjayBvZiBpdCB3aXRoIHRoaXMgdG9rZW4uXG5jb25zdCBTS0lQUElOR19NRVNTQUdFID0gLTE7XG5cbmNvbnN0IEVOQUJMRV9ERVNDUklQVElPTl9SRUdJU1RSWSA9ICEhd2luZG93LnBoZXQ/LmNoaXBwZXI/LnF1ZXJ5UGFyYW1ldGVycz8uc3VwcG9ydHNEZXNjcmlwdGlvblBsdWdpbjtcblxuY29uc3QgREVGQVVMVFM6IE9wdGlvbml6ZURlZmF1bHRzPFN0cmljdE9taXQ8U2VsZk9wdGlvbnMsICdwaGV0aW9EeW5hbWljRWxlbWVudE5hbWUnPj4gPSB7XG5cbiAgLy8gU3VidHlwZXMgY2FuIHVzZSBgVGFuZGVtLlJFUVVJUkVEYCB0byByZXF1aXJlIGEgbmFtZWQgdGFuZGVtIHBhc3NlZCBpblxuICB0YW5kZW06IFRhbmRlbS5PUFRJT05BTCxcblxuICAvLyBEZWZpbmVzIGRlc2NyaXB0aW9uLXNwZWNpZmljIHRhbmRlbXMgdGhhdCBkbyBOT1QgYWZmZWN0IHRoZSBwaGV0LWlvIHN5c3RlbS5cbiAgZGVzY3JpcHRpb25UYW5kZW06IFRhbmRlbS5PUFRJT05BTCxcblxuICAvLyBEZWZpbmVzIEFQSSBtZXRob2RzLCBldmVudHMgYW5kIHNlcmlhbGl6YXRpb25cbiAgcGhldGlvVHlwZTogSU9UeXBlLk9iamVjdElPLFxuXG4gIC8vIFVzZWZ1bCBub3RlcyBhYm91dCBhbiBpbnN0cnVtZW50ZWQgUGhldGlvT2JqZWN0LCBzaG93biBpbiB0aGUgUGhFVC1pTyBTdHVkaW8gV3JhcHBlci4gSXQncyBhbiBodG1sXG4gIC8vIHN0cmluZywgc28gXCI8YnI+XCIgdGFncyBhcmUgcmVxdWlyZWQgaW5zdGVhZCBvZiBcIlxcblwiIGNoYXJhY3RlcnMgZm9yIHByb3BlciByZW5kZXJpbmcgaW4gU3R1ZGlvXG4gIHBoZXRpb0RvY3VtZW50YXRpb246IFRhbmRlbUNvbnN0YW50cy5QSEVUX0lPX09CSkVDVF9NRVRBREFUQV9ERUZBVUxUUy5waGV0aW9Eb2N1bWVudGF0aW9uLFxuXG4gIC8vIFdoZW4gdHJ1ZSwgaW5jbHVkZXMgdGhlIFBoZXRpb09iamVjdCBpbiB0aGUgUGhFVC1pTyBzdGF0ZSAobm90IGF1dG9tYXRpY2FsbHkgcmVjdXJzaXZlLCBtdXN0IGJlIHNwZWNpZmllZCBmb3JcbiAgLy8gY2hpbGRyZW4gZXhwbGljaXRseSlcbiAgcGhldGlvU3RhdGU6IFRhbmRlbUNvbnN0YW50cy5QSEVUX0lPX09CSkVDVF9NRVRBREFUQV9ERUZBVUxUUy5waGV0aW9TdGF0ZSxcblxuICAvLyBUaGlzIG9wdGlvbiBjb250cm9scyBob3cgUGhFVC1pTyB3cmFwcGVycyBjYW4gaW50ZXJmYWNlIHdpdGggdGhpcyBQaGV0aW9PYmplY3QuIFByZWRvbWluYXRlbHkgdGhpcyBvY2N1cnMgdmlhXG4gIC8vIHB1YmxpYyBtZXRob2RzIGRlZmluZWQgb24gdGhpcyBQaGV0aW9PYmplY3QncyBwaGV0aW9UeXBlLCBpbiB3aGljaCBzb21lIG1ldGhvZCBhcmUgbm90IGV4ZWN1dGFibGUgd2hlbiB0aGlzIGZsYWdcbiAgLy8gaXMgdHJ1ZS4gU2VlIGBPYmplY3RJTy5tZXRob2RzYCBmb3IgZnVydGhlciBkb2N1bWVudGF0aW9uLCBlc3BlY2lhbGx5IHJlZ2FyZGluZyBgaW52b2NhYmxlRm9yUmVhZE9ubHlFbGVtZW50c2AuXG4gIC8vIE5PVEU6IFBoZXRpb09iamVjdHMgd2l0aCB7cGhldGlvU3RhdGU6IHRydWV9IEFORCB7cGhldGlvUmVhZE9ubHk6IHRydWV9IGFyZSByZXN0b3JlZCBkdXJpbmcgdmlhIHNldFN0YXRlLlxuICBwaGV0aW9SZWFkT25seTogVGFuZGVtQ29uc3RhbnRzLlBIRVRfSU9fT0JKRUNUX01FVEFEQVRBX0RFRkFVTFRTLnBoZXRpb1JlYWRPbmx5LFxuXG4gIC8vIENhdGVnb3J5IG9mIGV2ZW50IHR5cGUsIGNhbiBiZSBvdmVycmlkZGVuIGluIHBoZXRpb1N0YXJ0RXZlbnQgb3B0aW9ucy4gIENhbm5vdCBiZSBzdXBwbGllZCB0aHJvdWdoIFRhbmRlbUNvbnN0YW50cyBiZWNhdXNlXG4gIC8vIHRoYXQgd291bGQgY3JlYXRlIGFuIGltcG9ydCBsb29wXG4gIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLk1PREVMLFxuXG4gIC8vIEhpZ2ggZnJlcXVlbmN5IGV2ZW50cyBzdWNoIGFzIG1vdXNlIG1vdmVzIGNhbiBiZSBvbWl0dGVkIGZyb20gZGF0YSBzdHJlYW0sIHNlZSA/cGhldGlvRW1pdEhpZ2hGcmVxdWVuY3lFdmVudHNcbiAgLy8gYW5kIFBoZXRpb0NsaWVudC5sYXVuY2hTaW11bGF0aW9uIG9wdGlvblxuICAvLyBAZGVwcmVjYXRlZCAtIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby9pc3N1ZXMvMTYyOSNpc3N1ZWNvbW1lbnQtNjA4MDAyNDEwXG4gIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IFRhbmRlbUNvbnN0YW50cy5QSEVUX0lPX09CSkVDVF9NRVRBREFUQV9ERUZBVUxUUy5waGV0aW9IaWdoRnJlcXVlbmN5LFxuXG4gIC8vIFdoZW4gdHJ1ZSwgZW1pdHMgZXZlbnRzIGZvciBkYXRhIHN0cmVhbXMgZm9yIHBsYXliYWNrLCBzZWUgaGFuZGxlUGxheWJhY2tFdmVudC5qc1xuICBwaGV0aW9QbGF5YmFjazogVGFuZGVtQ29uc3RhbnRzLlBIRVRfSU9fT0JKRUNUX01FVEFEQVRBX0RFRkFVTFRTLnBoZXRpb1BsYXliYWNrLFxuXG4gIC8vIFdoZW4gdHJ1ZSwgdGhpcyBpcyBjYXRlZ29yaXplZCBhcyBhbiBpbXBvcnRhbnQgXCJmZWF0dXJlZFwiIGVsZW1lbnQgaW4gU3R1ZGlvLlxuICBwaGV0aW9GZWF0dXJlZDogVGFuZGVtQ29uc3RhbnRzLlBIRVRfSU9fT0JKRUNUX01FVEFEQVRBX0RFRkFVTFRTLnBoZXRpb0ZlYXR1cmVkLFxuXG4gIC8vIGluZGljYXRlcyB0aGF0IGFuIG9iamVjdCBtYXkgb3IgbWF5IG5vdCBoYXZlIGJlZW4gY3JlYXRlZC4gQXBwbGllcyByZWN1cnNpdmVseSBhdXRvbWF0aWNhbGx5XG4gIC8vIGFuZCBzaG91bGQgb25seSBiZSBzZXQgbWFudWFsbHkgb24gdGhlIHJvb3QgZHluYW1pYyBlbGVtZW50LiBEeW5hbWljIGFyY2hldHlwZXMgd2lsbCBoYXZlIHRoaXMgb3ZlcndyaXR0ZW4gdG9cbiAgLy8gZmFsc2UgZXZlbiBpZiBleHBsaWNpdGx5IHByb3ZpZGVkIGFzIHRydWUsIGFzIGFyY2hldHlwZXMgY2Fubm90IGJlIGR5bmFtaWMuXG4gIHBoZXRpb0R5bmFtaWNFbGVtZW50OiBUYW5kZW1Db25zdGFudHMuUEhFVF9JT19PQkpFQ1RfTUVUQURBVEFfREVGQVVMVFMucGhldGlvRHluYW1pY0VsZW1lbnQsXG5cbiAgLy8gTWFya2luZyBwaGV0aW9EZXNpZ25lZDogdHJ1ZSBvcHRzLWluIHRvIEFQSSBjaGFuZ2UgZGV0ZWN0aW9uIHRvb2xpbmcgdGhhdCBjYW4gYmUgdXNlZCB0byBjYXRjaCBpbmFkdmVydGVudFxuICAvLyBjaGFuZ2VzIHRvIGEgZGVzaWduZWQgQVBJLiAgQSBwaGV0aW9EZXNpZ25lZDp0cnVlIFBoZXRpb09iamVjdCAob3IgYW55IG9mIGl0cyB0YW5kZW0gZGVzY2VuZGFudHMpIHdpbGwgdGhyb3dcbiAgLy8gYXNzZXJ0aW9uIGVycm9ycyBvbiBDVCAob3Igd2hlbiBydW5uaW5nIHdpdGggP3BoZXRpb0NvbXBhcmVBUEkpIHdoZW4gdGhlIGZvbGxvd2luZyBhcmUgdHJ1ZTpcbiAgLy8gKGEpIGl0cyBwYWNrYWdlLmpzb24gbGlzdHMgY29tcGFyZURlc2lnbmVkQVBJQ2hhbmdlczp0cnVlIGluIHRoZSBcInBoZXQtaW9cIiBzZWN0aW9uXG4gIC8vIChiKSB0aGUgc2ltdWxhdGlvbiBpcyBsaXN0ZWQgaW4gcGVyZW5uaWFsL2RhdGEvcGhldC1pby1hcGktc3RhYmxlXG4gIC8vIChjKSBhbnkgb2YgaXRzIG1ldGFkYXRhIHZhbHVlcyBkZXZpYXRlIGZyb20gdGhlIHJlZmVyZW5jZSBBUElcbiAgcGhldGlvRGVzaWduZWQ6IFRhbmRlbUNvbnN0YW50cy5QSEVUX0lPX09CSkVDVF9NRVRBREFUQV9ERUZBVUxUUy5waGV0aW9EZXNpZ25lZCxcblxuICAvLyBkZWxpdmVyZWQgd2l0aCBlYWNoIGV2ZW50LCBpZiBzcGVjaWZpZWQuIHBoZXRpb1BsYXliYWNrIGlzIGFwcGVuZGVkIGhlcmUsIGlmIHRydWUuXG4gIC8vIE5vdGU6IHVubGlrZSBvdGhlciBvcHRpb25zLCB0aGlzIG9wdGlvbiBjYW4gYmUgbXV0YXRlZCBkb3duc3RyZWFtLCBhbmQgaGVuY2Ugc2hvdWxkIGJlIGNyZWF0ZWQgbmV3bHkgZm9yIGVhY2ggaW5zdGFuY2UuXG4gIHBoZXRpb0V2ZW50TWV0YWRhdGE6IG51bGwsXG5cbiAgLy8gbnVsbCBtZWFucyBubyBjb25zdHJhaW50IG9uIHRhbmRlbSBuYW1lLlxuICB0YW5kZW1OYW1lU3VmZml4OiBudWxsXG59O1xuXG4vLyBJZiB5b3UgcnVuIGludG8gYSB0eXBlIGVycm9yIGhlcmUsIGZlZWwgZnJlZSB0byBhZGQgYW55IHR5cGUgdGhhdCBpcyBzdXBwb3J0ZWQgYnkgdGhlIGJyb3dzZXJzIFwic3RydWN0dXJlZCBjbG9uaW5nIGFsZ29yaXRobVwiIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9XZWJfV29ya2Vyc19BUEkvU3RydWN0dXJlZF9jbG9uZV9hbGdvcml0aG1cbnR5cGUgRXZlbnRNZXRhZGF0YSA9IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IGJvb2xlYW4gfCBudW1iZXIgfCBBcnJheTxzdHJpbmcgfCBib29sZWFuIHwgbnVtYmVyPj47XG5cbmFzc2VydCAmJiBhc3NlcnQoIEV2ZW50VHlwZS5waGV0aW9UeXBlLnRvU3RhdGVPYmplY3QoIERFRkFVTFRTLnBoZXRpb0V2ZW50VHlwZSApID09PSBUYW5kZW1Db25zdGFudHMuUEhFVF9JT19PQkpFQ1RfTUVUQURBVEFfREVGQVVMVFMucGhldGlvRXZlbnRUeXBlLFxuICAncGhldGlvRXZlbnRUeXBlIG11c3QgaGF2ZSB0aGUgc2FtZSBkZWZhdWx0IGFzIHRoZSBkZWZhdWx0IG1ldGFkYXRhIHZhbHVlcy4nICk7XG5cbi8vIE9wdGlvbnMgZm9yIGNyZWF0aW5nIGEgUGhldGlvT2JqZWN0XG50eXBlIFNlbGZPcHRpb25zID0gU3RyaWN0T21pdDxQYXJ0aWFsPFBoZXRpb0VsZW1lbnRNZXRhZGF0YT4sICdwaGV0aW9UeXBlTmFtZScgfCAncGhldGlvQXJjaGV0eXBlUGhldGlvSUQnIHxcbiAgJ3BoZXRpb0lzQXJjaGV0eXBlJyB8ICdwaGV0aW9FdmVudFR5cGUnPiAmIHtcblxuICAvLyBUaGlzIGlzIHRoZSBvbmx5IHBsYWNlIGluIHRoZSBwcm9qZWN0IHdoZXJlIHRoaXMgaXMgYWxsb3dlZFxuICB0YW5kZW0/OiBUYW5kZW07IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC9iYWQtc2ltLXRleHRcbiAgZGVzY3JpcHRpb25UYW5kZW0/OiBUYW5kZW07XG4gIHBoZXRpb1R5cGU/OiBJT1R5cGU7XG4gIHBoZXRpb0V2ZW50VHlwZT86IEV2ZW50VHlwZTtcbiAgcGhldGlvRXZlbnRNZXRhZGF0YT86IEV2ZW50TWV0YWRhdGEgfCBudWxsO1xuXG4gIC8vIFRoZSBlbGVtZW50J3MgdGFuZGVtIG5hbWUgbXVzdCBoYXZlIGEgc3BlY2lmaWVkIHN1ZmZpeC4gVGhpcyBpcyB0byBlbmZvcmNlIG5hbWluZyBjb252ZW50aW9ucyBmb3IgUGhFVC1pTy5cbiAgLy8gSWYgc3RyaW5nW10gaXMgcHJvdmlkZWQsIHRoZSB0YW5kZW0gbmFtZSBtdXN0IGhhdmUgYSBzdWZmaXggdGhhdCBtYXRjaGVzIG9uZSBvZiB0aGUgc3RyaW5ncyBpbiB0aGUgYXJyYXkuXG4gIC8vIG51bGwgbWVhbnMgdGhhdCB0aGVyZSBpcyBubyBjb25zdHJhaW50IG9uIHRhbmRlbSBuYW1lLiBUaGUgZmlyc3QgY2hhcmFjdGVyIGlzIG5vdCBjYXNlLXNlbnNpdGl2ZSwgdG8gc3VwcG9ydFxuICAvLyB1c2VzIGxpa2UgJ3RoZXJtb21ldGVyTm9kZScgdmVyc3VzICd1cHBlclRoZXJtb21ldGVyTm9kZScuXG4gIHRhbmRlbU5hbWVTdWZmaXg/OiBzdHJpbmcgfCBzdHJpbmdbXSB8IG51bGw7XG59O1xuZXhwb3J0IHR5cGUgUGhldGlvT2JqZWN0T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgRGlzcG9zYWJsZU9wdGlvbnM7XG5cbnR5cGUgUGhldGlvT2JqZWN0TWV0YWRhdGFLZXlzID0ga2V5b2YgKCBTdHJpY3RPbWl0PFBoZXRpb0VsZW1lbnRNZXRhZGF0YSwgJ3BoZXRpb1R5cGVOYW1lJyB8ICdwaGV0aW9EeW5hbWljRWxlbWVudE5hbWUnPiApIHwgJ3BoZXRpb1R5cGUnO1xuXG4vLyBBIHR5cGUgdGhhdCBpcyB1c2VkIGZvciB0aGUgc3RydWN0dXJhbCB0eXBpbmcgd2hlbiBnYXRoZXJpbmcgbWV0YWRhdGEuIFdlIGp1c3QgbmVlZCBhIFwiUGhldGlvT2JqZWN0LWxpa2VcIiBlbnRpdHlcbi8vIHRvIHB1bGwgdGhlIEFQSSBtZXRhZGF0YSBmcm9tLiBUaHVzLCB0aGlzIGlzIHRoZSBcImlucHV0XCIgdG8gbG9naWMgdGhhdCB3b3VsZCBwdWxsIHRoZSBtZXRhZGF0YSBrZXlzIGludG8gYW4gb2JqZWN0XG4vLyBmb3IgdGhlIFBoZXRpb0FQSS5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwaGV0L3BoZXQtaW8tb2JqZWN0LW9wdGlvbnMtc2hvdWxkLW5vdC1waWNrLWZyb20tcGhldC1pby1vYmplY3RcbmV4cG9ydCB0eXBlIFBoZXRpb09iamVjdE1ldGFkYXRhSW5wdXQgPSBQaWNrPFBoZXRpb09iamVjdCwgUGhldGlvT2JqZWN0TWV0YWRhdGFLZXlzPjtcblxuY2xhc3MgUGhldGlvT2JqZWN0IGV4dGVuZHMgRGlzcG9zYWJsZSB7XG5cbiAgLy8gYXNzaWduZWQgaW4gaW5pdGlhbGl6ZVBoZXRpb09iamVjdCAtIHNlZSBkb2NzIGF0IERFRkFVTFRTIGRlY2xhcmF0aW9uXG4gIHB1YmxpYyB0YW5kZW06IFRhbmRlbTtcblxuICAvLyB0cmFjayB3aGV0aGVyIHRoZSBvYmplY3QgaGFzIGJlZW4gaW5pdGlhbGl6ZWQuICBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIGluaXRpYWxpemF0aW9uIGNhbiBoYXBwZW4gaW4gdGhlXG4gIC8vIGNvbnN0cnVjdG9yIG9yIGluIGEgc3Vic2VxdWVudCBjYWxsIHRvIGluaXRpYWxpemVQaGV0aW9PYmplY3QgKHRvIHN1cHBvcnQgc2NlbmVyeSBOb2RlKVxuICBwcml2YXRlIHBoZXRpb09iamVjdEluaXRpYWxpemVkOiBib29sZWFuO1xuXG4gIC8vIFNlZSBkb2N1bWVudGF0aW9uIGluIERFRkFVTFRTXG4gIHB1YmxpYyBwaGV0aW9Jc0FyY2hldHlwZSE6IGJvb2xlYW47XG4gIHB1YmxpYyBwaGV0aW9CYXNlbGluZU1ldGFkYXRhITogUGhldGlvRWxlbWVudE1ldGFkYXRhIHwgbnVsbDtcbiAgcHJpdmF0ZSBfcGhldGlvVHlwZSE6IElPVHlwZTtcbiAgcHJpdmF0ZSBfcGhldGlvU3RhdGUhOiBib29sZWFuO1xuICBwcml2YXRlIF9waGV0aW9SZWFkT25seSE6IGJvb2xlYW47XG4gIHByaXZhdGUgX3BoZXRpb0RvY3VtZW50YXRpb24hOiBzdHJpbmc7XG4gIHByaXZhdGUgX3BoZXRpb0V2ZW50VHlwZSE6IEV2ZW50VHlwZTtcbiAgcHJpdmF0ZSBfcGhldGlvSGlnaEZyZXF1ZW5jeSE6IGJvb2xlYW47XG4gIHByaXZhdGUgX3BoZXRpb1BsYXliYWNrITogYm9vbGVhbjtcbiAgcHJpdmF0ZSBfcGhldGlvRHluYW1pY0VsZW1lbnQhOiBib29sZWFuO1xuICBwcml2YXRlIF9waGV0aW9GZWF0dXJlZCE6IGJvb2xlYW47XG4gIHByaXZhdGUgX3BoZXRpb0V2ZW50TWV0YWRhdGEhOiBFdmVudE1ldGFkYXRhIHwgbnVsbDtcbiAgcHJpdmF0ZSBfcGhldGlvRGVzaWduZWQhOiBib29sZWFuO1xuXG4gIC8vIFB1YmxpYyBvbmx5IGZvciBQaGV0aW9PYmplY3RNZXRhZGF0YUlucHV0XG4gIHB1YmxpYyBwaGV0aW9BcmNoZXR5cGVQaGV0aW9JRCE6IHN0cmluZyB8IG51bGw7XG4gIHByaXZhdGUgbGlua2VkRWxlbWVudHMhOiBMaW5rZWRFbGVtZW50W10gfCBudWxsO1xuICBwdWJsaWMgcGhldGlvTm90aWZpZWRPYmplY3RDcmVhdGVkITogYm9vbGVhbjtcbiAgcHJpdmF0ZSBwaGV0aW9NZXNzYWdlU3RhY2shOiBudW1iZXJbXTtcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBERUZBVUxUX09QVElPTlMgPSBERUZBVUxUUztcbiAgcHVibGljIHBoZXRpb0lEOiBQaGV0aW9JRDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIG9wdGlvbnM/OiBQaGV0aW9PYmplY3RPcHRpb25zICkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLnRhbmRlbSA9IERFRkFVTFRTLnRhbmRlbTtcbiAgICB0aGlzLnBoZXRpb0lEID0gdGhpcy50YW5kZW0ucGhldGlvSUQ7XG4gICAgdGhpcy5waGV0aW9PYmplY3RJbml0aWFsaXplZCA9IGZhbHNlO1xuXG4gICAgaWYgKCBvcHRpb25zICkge1xuICAgICAgdGhpcy5pbml0aWFsaXplUGhldGlvT2JqZWN0KCB7fSwgb3B0aW9ucyApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBMaWtlIFNDRU5FUlkvTm9kZSwgUGhldGlvT2JqZWN0IGNhbiBiZSBjb25maWd1cmVkIGR1cmluZyBjb25zdHJ1Y3Rpb24gb3IgbGF0ZXIgd2l0aCBhIG11dGF0ZSBjYWxsLlxuICAgKiBOb29wIGlmIHByb3ZpZGVkIG9wdGlvbnMga2V5cyBkb24ndCBpbnRlcnNlY3Qgd2l0aCBhbnkga2V5IGluIERFRkFVTFRTOyBiYXNlT3B0aW9ucyBhcmUgaWdub3JlZCBmb3IgdGhpcyBjYWxjdWxhdGlvbi5cbiAgICovXG4gIHByb3RlY3RlZCBpbml0aWFsaXplUGhldGlvT2JqZWN0KCBiYXNlT3B0aW9uczogUGFydGlhbDxQaGV0aW9PYmplY3RPcHRpb25zPiwgcHJvdmlkZWRPcHRpb25zOiBQaGV0aW9PYmplY3RPcHRpb25zICk6IHZvaWQge1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIWJhc2VPcHRpb25zLmhhc093blByb3BlcnR5KCAnaXNEaXNwb3NhYmxlJyApLCAnYmFzZU9wdGlvbnMgc2hvdWxkIG5vdCBjb250YWluIGlzRGlzcG9zYWJsZScgKTtcbiAgICB0aGlzLmluaXRpYWxpemVEaXNwb3NhYmxlKCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHByb3ZpZGVkT3B0aW9ucywgJ2luaXRpYWxpemVQaGV0aW9PYmplY3QgbXVzdCBiZSBjYWxsZWQgd2l0aCBwcm92aWRlZE9wdGlvbnMnICk7XG5cbiAgICAvLyBjYWxsIGJlZm9yZSB3ZSBleGl0IGVhcmx5IHRvIHN1cHBvcnQgbG9nZ2luZyB1bnN1cHBsaWVkIFRhbmRlbXMuXG4gICAgcHJvdmlkZWRPcHRpb25zLnRhbmRlbSAmJiBUYW5kZW0ub25NaXNzaW5nVGFuZGVtKCBwcm92aWRlZE9wdGlvbnMudGFuZGVtICk7XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhhdCByZXF1aXJlZCB0YW5kZW1zIGFyZSBzdXBwbGllZFxuICAgIGlmICggYXNzZXJ0ICYmIFRhbmRlbS5WQUxJREFUSU9OICYmIHByb3ZpZGVkT3B0aW9ucy50YW5kZW0gJiYgcHJvdmlkZWRPcHRpb25zLnRhbmRlbS5yZXF1aXJlZCApIHtcbiAgICAgIGFzc2VydCggcHJvdmlkZWRPcHRpb25zLnRhbmRlbS5zdXBwbGllZCwgJ3JlcXVpcmVkIHRhbmRlbXMgbXVzdCBiZSBzdXBwbGllZCcgKTtcbiAgICB9XG5cbiAgICBpZiAoIEVOQUJMRV9ERVNDUklQVElPTl9SRUdJU1RSWSAmJiBwcm92aWRlZE9wdGlvbnMudGFuZGVtICYmIHByb3ZpZGVkT3B0aW9ucy50YW5kZW0uc3VwcGxpZWQgKSB7XG4gICAgICBEZXNjcmlwdGlvblJlZ2lzdHJ5LmFkZCggcHJvdmlkZWRPcHRpb25zLnRhbmRlbSwgdGhpcyApO1xuICAgIH1cblxuICAgIC8vIFRoZSBwcmVzZW5jZSBvZiBgdGFuZGVtYCBpbmRpY2F0ZXMgaWYgdGhpcyBQaGV0aW9PYmplY3QgY2FuIGJlIGluaXRpYWxpemVkLiBJZiBub3QgeWV0IGluaXRpYWxpemVkLCBwZXJoYXBzXG4gICAgLy8gaXQgd2lsbCBiZSBpbml0aWFsaXplZCBsYXRlciBvbiwgYXMgaW4gTm9kZS5tdXRhdGUoKS5cbiAgICBpZiAoICEoIFBIRVRfSU9fRU5BQkxFRCAmJiBwcm92aWRlZE9wdGlvbnMudGFuZGVtICYmIHByb3ZpZGVkT3B0aW9ucy50YW5kZW0uc3VwcGxpZWQgKSApIHtcblxuICAgICAgLy8gSW4gdGhpcyBjYXNlLCB0aGUgUGhldGlvT2JqZWN0IGlzIG5vdCBpbml0aWFsaXplZCwgYnV0IHN0aWxsIHNldCB0YW5kZW0gdG8gbWFpbnRhaW4gYSBjb25zaXN0ZW50IEFQSSBmb3JcbiAgICAgIC8vIGNyZWF0aW5nIHRoZSBUYW5kZW0gdHJlZS5cbiAgICAgIGlmICggcHJvdmlkZWRPcHRpb25zLnRhbmRlbSApIHtcbiAgICAgICAgdGhpcy50YW5kZW0gPSBwcm92aWRlZE9wdGlvbnMudGFuZGVtO1xuICAgICAgICB0aGlzLnBoZXRpb0lEID0gdGhpcy50YW5kZW0ucGhldGlvSUQ7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMucGhldGlvT2JqZWN0SW5pdGlhbGl6ZWQsICdjYW5ub3QgaW5pdGlhbGl6ZSB0d2ljZScgKTtcblxuICAgIC8vIEd1YXJkIHZhbGlkYXRpb24gb24gYXNzZXJ0IHRvIGF2b2lkIGNhbGxpbmcgYSBsYXJnZSBudW1iZXIgb2Ygbm8tb3BzIHdoZW4gYXNzZXJ0aW9ucyBhcmUgZGlzYWJsZWQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdGFuZGVtL2lzc3Vlcy8yMDBcbiAgICBhc3NlcnQgJiYgdmFsaWRhdGUoIHByb3ZpZGVkT3B0aW9ucy50YW5kZW0sIHsgdmFsdWVUeXBlOiBUYW5kZW0gfSApO1xuXG4gICAgY29uc3QgZGVmYXVsdHMgPSBjb21iaW5lT3B0aW9uczxPcHRpb25pemVEZWZhdWx0czxQaGV0aW9PYmplY3RPcHRpb25zPj4oIHt9LCBERUZBVUxUUywgYmFzZU9wdGlvbnMgKTtcblxuICAgIGxldCBvcHRpb25zID0gb3B0aW9uaXplPFBoZXRpb09iamVjdE9wdGlvbnM+KCkoIGRlZmF1bHRzLCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIC8vIHZhbGlkYXRlIG9wdGlvbnMgYmVmb3JlIGFzc2lnbmluZyB0byBwcm9wZXJ0aWVzXG4gICAgYXNzZXJ0ICYmIHZhbGlkYXRlKCBvcHRpb25zLnBoZXRpb1R5cGUsIElPX1RZUEVfVkFMSURBVE9SICk7XG4gICAgYXNzZXJ0ICYmIHZhbGlkYXRlKCBvcHRpb25zLnBoZXRpb1N0YXRlLCBtZXJnZSgge30sIEJPT0xFQU5fVkFMSURBVE9SLCB7IHZhbGlkYXRpb25NZXNzYWdlOiAncGhldGlvU3RhdGUgbXVzdCBiZSBhIGJvb2xlYW4nIH0gKSApO1xuICAgIGFzc2VydCAmJiB2YWxpZGF0ZSggb3B0aW9ucy5waGV0aW9SZWFkT25seSwgbWVyZ2UoIHt9LCBCT09MRUFOX1ZBTElEQVRPUiwgeyB2YWxpZGF0aW9uTWVzc2FnZTogJ3BoZXRpb1JlYWRPbmx5IG11c3QgYmUgYSBib29sZWFuJyB9ICkgKTtcbiAgICBhc3NlcnQgJiYgdmFsaWRhdGUoIG9wdGlvbnMucGhldGlvRXZlbnRUeXBlLCBQSEVUX0lPX0VWRU5UX1RZUEVfVkFMSURBVE9SICk7XG4gICAgYXNzZXJ0ICYmIHZhbGlkYXRlKCBvcHRpb25zLnBoZXRpb0RvY3VtZW50YXRpb24sIFBIRVRfSU9fRE9DVU1FTlRBVElPTl9WQUxJREFUT1IgKTtcbiAgICBhc3NlcnQgJiYgdmFsaWRhdGUoIG9wdGlvbnMucGhldGlvSGlnaEZyZXF1ZW5jeSwgbWVyZ2UoIHt9LCBCT09MRUFOX1ZBTElEQVRPUiwgeyB2YWxpZGF0aW9uTWVzc2FnZTogJ3BoZXRpb0hpZ2hGcmVxdWVuY3kgbXVzdCBiZSBhIGJvb2xlYW4nIH0gKSApO1xuICAgIGFzc2VydCAmJiB2YWxpZGF0ZSggb3B0aW9ucy5waGV0aW9QbGF5YmFjaywgbWVyZ2UoIHt9LCBCT09MRUFOX1ZBTElEQVRPUiwgeyB2YWxpZGF0aW9uTWVzc2FnZTogJ3BoZXRpb1BsYXliYWNrIG11c3QgYmUgYSBib29sZWFuJyB9ICkgKTtcbiAgICBhc3NlcnQgJiYgdmFsaWRhdGUoIG9wdGlvbnMucGhldGlvRmVhdHVyZWQsIG1lcmdlKCB7fSwgQk9PTEVBTl9WQUxJREFUT1IsIHsgdmFsaWRhdGlvbk1lc3NhZ2U6ICdwaGV0aW9GZWF0dXJlZCBtdXN0IGJlIGEgYm9vbGVhbicgfSApICk7XG4gICAgYXNzZXJ0ICYmIHZhbGlkYXRlKCBvcHRpb25zLnBoZXRpb0V2ZW50TWV0YWRhdGEsIG1lcmdlKCB7fSwgT0JKRUNUX1ZBTElEQVRPUiwgeyB2YWxpZGF0aW9uTWVzc2FnZTogJ29iamVjdCBsaXRlcmFsIGV4cGVjdGVkJyB9ICkgKTtcbiAgICBhc3NlcnQgJiYgdmFsaWRhdGUoIG9wdGlvbnMucGhldGlvRHluYW1pY0VsZW1lbnQsIG1lcmdlKCB7fSwgQk9PTEVBTl9WQUxJREFUT1IsIHsgdmFsaWRhdGlvbk1lc3NhZ2U6ICdwaGV0aW9EeW5hbWljRWxlbWVudCBtdXN0IGJlIGEgYm9vbGVhbicgfSApICk7XG4gICAgYXNzZXJ0ICYmIHZhbGlkYXRlKCBvcHRpb25zLnBoZXRpb0Rlc2lnbmVkLCBtZXJnZSgge30sIEJPT0xFQU5fVkFMSURBVE9SLCB7IHZhbGlkYXRpb25NZXNzYWdlOiAncGhldGlvRGVzaWduZWQgbXVzdCBiZSBhIGJvb2xlYW4nIH0gKSApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5saW5rZWRFbGVtZW50cyAhPT0gbnVsbCwgJ3RoaXMgbWVhbnMgYWRkTGlua2VkRWxlbWVudCB3YXMgY2FsbGVkIGJlZm9yZSBpbnN0cnVtZW50YXRpb24gb2YgdGhpcyBQaGV0aW9PYmplY3QnICk7XG5cbiAgICAvLyBvcHRpb25hbCAtIEluZGljYXRlcyB0aGF0IGFuIG9iamVjdCBpcyBhIGFyY2hldHlwZSBmb3IgYSBkeW5hbWljIGNsYXNzLiBTZXR0YWJsZSBvbmx5IGJ5XG4gICAgLy8gUGhldGlvRW5naW5lIGFuZCBieSBjbGFzc2VzIHRoYXQgY3JlYXRlIGR5bmFtaWMgZWxlbWVudHMgd2hlbiBjcmVhdGluZyB0aGVpciBhcmNoZXR5cGUgKGxpa2UgUGhldGlvR3JvdXApIHRocm91Z2hcbiAgICAvLyBQaGV0aW9PYmplY3QubWFya0R5bmFtaWNFbGVtZW50QXJjaGV0eXBlKCkuXG4gICAgLy8gaWYgdHJ1ZSwgaXRlbXMgd2lsbCBiZSBleGNsdWRlZCBmcm9tIHBoZXRpb1N0YXRlLiBUaGlzIGFwcGxpZXMgcmVjdXJzaXZlbHkgYXV0b21hdGljYWxseS5cbiAgICB0aGlzLnBoZXRpb0lzQXJjaGV0eXBlID0gZmFsc2U7XG5cbiAgICAvLyAocGhldGlvRW5naW5lKVxuICAgIC8vIFN0b3JlIHRoZSBmdWxsIGJhc2VsaW5lIGZvciB1c2FnZSBpbiB2YWxpZGF0aW9uIG9yIGZvciB1c2FnZSBpbiBzdHVkaW8uICBEbyB0aGlzIGJlZm9yZSBhcHBseWluZyBvdmVycmlkZXMuIFRoZVxuICAgIC8vIGJhc2VsaW5lIGlzIGNyZWF0ZWQgd2hlbiBhIHNpbSBpcyBydW4gd2l0aCBhc3NlcnRpb25zIHRvIGFzc2lzdCBpbiBwaGV0aW9BUElWYWxpZGF0aW9uLiAgSG93ZXZlciwgZXZlbiB3aGVuXG4gICAgLy8gYXNzZXJ0aW9ucyBhcmUgZGlzYWJsZWQsIHNvbWUgd3JhcHBlcnMgc3VjaCBhcyBzdHVkaW8gbmVlZCB0byBnZW5lcmF0ZSB0aGUgYmFzZWxpbmUgYW55d2F5LlxuICAgIC8vIG5vdCBhbGwgbWV0YWRhdGEgYXJlIHBhc3NlZCB0aHJvdWdoIHZpYSBvcHRpb25zLCBzbyBzdG9yZSBiYXNlbGluZSBmb3IgdGhlc2UgYWRkaXRpb25hbCBwcm9wZXJ0aWVzXG4gICAgdGhpcy5waGV0aW9CYXNlbGluZU1ldGFkYXRhID0gKCBwaGV0aW9BUElWYWxpZGF0aW9uLmVuYWJsZWQgfHwgcGhldC5wcmVsb2Fkcy5waGV0aW8ucXVlcnlQYXJhbWV0ZXJzLnBoZXRpb0VtaXRBUElCYXNlbGluZSApID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldE1ldGFkYXRhKCBtZXJnZSgge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGhldGlvSXNBcmNoZXR5cGU6IHRoaXMucGhldGlvSXNBcmNoZXR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwaGV0aW9BcmNoZXR5cGVQaGV0aW9JRDogdGhpcy5waGV0aW9BcmNoZXR5cGVQaGV0aW9JRFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIG9wdGlvbnMgKSApIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsO1xuXG4gICAgLy8gRHluYW1pYyBlbGVtZW50cyBzaG91bGQgY29tcGFyZSB0byB0aGVpciBcImFyY2hldHlwYWxcIiBjb3VudGVycGFydHMuICBGb3IgZXhhbXBsZSwgdGhpcyBtZWFucyB0aGF0IGEgUGFydGljbGVcbiAgICAvLyBpbiBhIFBoZXRpb0dyb3VwIHdpbGwgdGFrZSBpdHMgb3ZlcnJpZGVzIGZyb20gdGhlIFBoZXRpb0dyb3VwIGFyY2hldHlwZS5cbiAgICBjb25zdCBhcmNoZXR5cGFsUGhldGlvSUQgPSBvcHRpb25zLnRhbmRlbS5nZXRBcmNoZXR5cGFsUGhldGlvSUQoKTtcblxuICAgIC8vIE92ZXJyaWRlcyBhcmUgb25seSBkZWZpbmVkIGZvciBzaW11bGF0aW9ucywgbm90IGZvciB1bml0IHRlc3RzLiAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvL2lzc3Vlcy8xNDYxXG4gICAgLy8gUGF0Y2ggaW4gdGhlIGRlc2lyZWQgdmFsdWVzIGZyb20gb3ZlcnJpZGVzLCBpZiBhbnkuXG4gICAgaWYgKCB3aW5kb3cucGhldC5wcmVsb2Fkcy5waGV0aW8ucGhldGlvRWxlbWVudHNPdmVycmlkZXMgKSB7XG4gICAgICBjb25zdCBvdmVycmlkZXMgPSB3aW5kb3cucGhldC5wcmVsb2Fkcy5waGV0aW8ucGhldGlvRWxlbWVudHNPdmVycmlkZXNbIGFyY2hldHlwYWxQaGV0aW9JRCBdO1xuICAgICAgaWYgKCBvdmVycmlkZXMgKSB7XG5cbiAgICAgICAgLy8gTm8gbmVlZCB0byBtYWtlIGEgbmV3IG9iamVjdCwgc2luY2UgdGhpcyBcIm9wdGlvbnNcIiB2YXJpYWJsZSB3YXMgY3JlYXRlZCBpbiB0aGUgcHJldmlvdXMgbWVyZ2UgY2FsbCBhYm92ZS5cbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbml6ZTxQaGV0aW9PYmplY3RPcHRpb25zPigpKCBvcHRpb25zLCBvdmVycmlkZXMgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAocmVhZC1vbmx5KSBzZWUgZG9jcyBhdCBERUZBVUxUUyBkZWNsYXJhdGlvblxuICAgIHRoaXMudGFuZGVtID0gb3B0aW9ucy50YW5kZW0hO1xuICAgIHRoaXMucGhldGlvSUQgPSB0aGlzLnRhbmRlbS5waGV0aW9JRDtcblxuICAgIC8vIChyZWFkLW9ubHkpIHNlZSBkb2NzIGF0IERFRkFVTFRTIGRlY2xhcmF0aW9uXG4gICAgdGhpcy5fcGhldGlvVHlwZSA9IG9wdGlvbnMucGhldGlvVHlwZTtcblxuICAgIC8vIChyZWFkLW9ubHkpIHNlZSBkb2NzIGF0IERFRkFVTFRTIGRlY2xhcmF0aW9uXG4gICAgdGhpcy5fcGhldGlvU3RhdGUgPSBvcHRpb25zLnBoZXRpb1N0YXRlO1xuXG4gICAgLy8gKHJlYWQtb25seSkgc2VlIGRvY3MgYXQgREVGQVVMVFMgZGVjbGFyYXRpb25cbiAgICB0aGlzLl9waGV0aW9SZWFkT25seSA9IG9wdGlvbnMucGhldGlvUmVhZE9ubHk7XG5cbiAgICAvLyAocmVhZC1vbmx5KSBzZWUgZG9jcyBhdCBERUZBVUxUUyBkZWNsYXJhdGlvblxuICAgIHRoaXMuX3BoZXRpb0RvY3VtZW50YXRpb24gPSBvcHRpb25zLnBoZXRpb0RvY3VtZW50YXRpb247XG5cbiAgICAvLyBzZWUgZG9jcyBhdCBERUZBVUxUUyBkZWNsYXJhdGlvblxuICAgIHRoaXMuX3BoZXRpb0V2ZW50VHlwZSA9IG9wdGlvbnMucGhldGlvRXZlbnRUeXBlO1xuXG4gICAgLy8gc2VlIGRvY3MgYXQgREVGQVVMVFMgZGVjbGFyYXRpb25cbiAgICB0aGlzLl9waGV0aW9IaWdoRnJlcXVlbmN5ID0gb3B0aW9ucy5waGV0aW9IaWdoRnJlcXVlbmN5O1xuXG4gICAgLy8gc2VlIGRvY3MgYXQgREVGQVVMVFMgZGVjbGFyYXRpb25cbiAgICB0aGlzLl9waGV0aW9QbGF5YmFjayA9IG9wdGlvbnMucGhldGlvUGxheWJhY2s7XG5cbiAgICAvLyAoUGhldGlvRW5naW5lKSBzZWUgZG9jcyBhdCBERUZBVUxUUyBkZWNsYXJhdGlvbiAtIGluIG9yZGVyIHRvIHJlY3Vyc2l2ZWx5IHBhc3MgdGhpcyB2YWx1ZSB0b1xuICAgIC8vIGNoaWxkcmVuLCB0aGUgc2V0UGhldGlvRHluYW1pY0VsZW1lbnQoKSBmdW5jdGlvbiBtdXN0IGJlIHVzZWQgaW5zdGVhZCBvZiBzZXR0aW5nIHRoaXMgYXR0cmlidXRlIGRpcmVjdGx5XG4gICAgdGhpcy5fcGhldGlvRHluYW1pY0VsZW1lbnQgPSBvcHRpb25zLnBoZXRpb0R5bmFtaWNFbGVtZW50O1xuXG4gICAgLy8gKHJlYWQtb25seSkgc2VlIGRvY3MgYXQgREVGQVVMVFMgZGVjbGFyYXRpb25cbiAgICB0aGlzLl9waGV0aW9GZWF0dXJlZCA9IG9wdGlvbnMucGhldGlvRmVhdHVyZWQ7XG5cbiAgICB0aGlzLl9waGV0aW9FdmVudE1ldGFkYXRhID0gb3B0aW9ucy5waGV0aW9FdmVudE1ldGFkYXRhO1xuXG4gICAgdGhpcy5fcGhldGlvRGVzaWduZWQgPSBvcHRpb25zLnBoZXRpb0Rlc2lnbmVkO1xuXG4gICAgLy8gZm9yIHBoZXRpb0R5bmFtaWNFbGVtZW50cywgdGhlIGNvcnJlc3BvbmRpbmcgcGhldGlvSUQgZm9yIHRoZSBlbGVtZW50IGluIHRoZSBhcmNoZXR5cGUgc3VidHJlZVxuICAgIHRoaXMucGhldGlvQXJjaGV0eXBlUGhldGlvSUQgPSBudWxsO1xuXG4gICAgLy9rZWVwIHRyYWNrIG9mIExpbmtlZEVsZW1lbnRzIGZvciBkaXNwb3NhbC4gTnVsbCBvdXQgdG8gc3VwcG9ydCBhc3NlcnRpbmcgb25cbiAgICAvLyBlZGdlIGVycm9yIGNhc2VzLCBzZWUgdGhpcy5hZGRMaW5rZWRFbGVtZW50KClcbiAgICB0aGlzLmxpbmtlZEVsZW1lbnRzID0gW107XG5cbiAgICAvLyAocGhldC1pbykgc2V0IHRvIHRydWUgd2hlbiB0aGlzIFBoZXRpb09iamVjdCBoYXMgYmVlbiBzZW50IG92ZXIgdG8gdGhlIHBhcmVudC5cbiAgICB0aGlzLnBoZXRpb05vdGlmaWVkT2JqZWN0Q3JlYXRlZCA9IGZhbHNlO1xuXG4gICAgLy8gdHJhY2tzIHRoZSBpbmRpY2VzIG9mIHN0YXJ0ZWQgbWVzc2FnZXMgc28gdGhhdCBkYXRhU3RyZWFtIGNhbiBjaGVjayB0aGF0IGVuZHMgbWF0Y2ggc3RhcnRzLlxuICAgIHRoaXMucGhldGlvTWVzc2FnZVN0YWNrID0gW107XG5cbiAgICAvLyBNYWtlIHN1cmUgcGxheWJhY2sgc2hvd3MgaW4gdGhlIHBoZXRpb0V2ZW50TWV0YWRhdGFcbiAgICBpZiAoIHRoaXMuX3BoZXRpb1BsYXliYWNrICkge1xuICAgICAgdGhpcy5fcGhldGlvRXZlbnRNZXRhZGF0YSA9IHRoaXMuX3BoZXRpb0V2ZW50TWV0YWRhdGEgfHwge307XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5fcGhldGlvRXZlbnRNZXRhZGF0YS5oYXNPd25Qcm9wZXJ0eSggJ3BsYXliYWNrJyApLCAncGhldGlvRXZlbnRNZXRhZGF0YS5wbGF5YmFjayBzaG91bGQgbm90IGFscmVhZHkgZXhpc3QnICk7XG4gICAgICB0aGlzLl9waGV0aW9FdmVudE1ldGFkYXRhLnBsYXliYWNrID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBBbGVydCB0aGF0IHRoaXMgUGhldGlvT2JqZWN0IGlzIHJlYWR5IGZvciBjcm9zcy1mcmFtZSBjb21tdW5pY2F0aW9uICh0aHVzIGJlY29taW5nIGEgXCJQaEVULWlPIEVsZW1lbnRcIiBvbiB0aGUgd3JhcHBlciBzaWRlLlxuICAgIHRoaXMudGFuZGVtLmFkZFBoZXRpb09iamVjdCggdGhpcyApO1xuICAgIHRoaXMucGhldGlvT2JqZWN0SW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG4gICAgaWYgKCBhc3NlcnQgJiYgVGFuZGVtLlZBTElEQVRJT04gJiYgdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpICYmIG9wdGlvbnMudGFuZGVtTmFtZVN1ZmZpeCApIHtcblxuICAgICAgY29uc3Qgc3VmZml4QXJyYXkgPSBBcnJheS5pc0FycmF5KCBvcHRpb25zLnRhbmRlbU5hbWVTdWZmaXggKSA/IG9wdGlvbnMudGFuZGVtTmFtZVN1ZmZpeCA6IFsgb3B0aW9ucy50YW5kZW1OYW1lU3VmZml4IF07XG4gICAgICBjb25zdCBtYXRjaGVzID0gc3VmZml4QXJyYXkuZmlsdGVyKCBzdWZmaXggPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy50YW5kZW0ubmFtZS5lbmRzV2l0aCggc3VmZml4ICkgfHxcbiAgICAgICAgICAgICAgIHRoaXMudGFuZGVtLm5hbWUuZW5kc1dpdGgoIFBoZXRpb09iamVjdC5zd2FwQ2FzZU9mRmlyc3RDaGFyYWN0ZXIoIHN1ZmZpeCApICk7XG4gICAgICB9ICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYXRjaGVzLmxlbmd0aCA+IDAsICdJbmNvcnJlY3QgVGFuZGVtIHN1ZmZpeCwgZXhwZWN0ZWQgPSAnICsgc3VmZml4QXJyYXkuam9pbiggJywgJyApICsgJy4gYWN0dWFsID0gJyArIHRoaXMudGFuZGVtLnBoZXRpb0lEICk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBzd2FwQ2FzZU9mRmlyc3RDaGFyYWN0ZXIoIHN0cmluZzogc3RyaW5nICk6IHN0cmluZyB7XG4gICAgY29uc3QgZmlyc3RDaGFyID0gc3RyaW5nWyAwIF07XG4gICAgY29uc3QgbmV3Rmlyc3RDaGFyID0gZmlyc3RDaGFyID09PSBmaXJzdENoYXIudG9Mb3dlckNhc2UoKSA/IGZpcnN0Q2hhci50b1VwcGVyQ2FzZSgpIDogZmlyc3RDaGFyLnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIG5ld0ZpcnN0Q2hhciArIHN0cmluZy5zdWJzdHJpbmcoIDEgKTtcbiAgfVxuXG4gIC8vIHRocm93cyBhbiBhc3NlcnRpb24gZXJyb3IgaW4gYnJhbmRzIG90aGVyIHRoYW4gUGhFVC1pT1xuICBwdWJsaWMgZ2V0IHBoZXRpb1R5cGUoKTogSU9UeXBlIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBQSEVUX0lPX0VOQUJMRUQgJiYgdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpLCAncGhldGlvVHlwZSBvbmx5IGFjY2Vzc2libGUgZm9yIGluc3RydW1lbnRlZCBvYmplY3RzIGluIFBoRVQtaU8gYnJhbmQuJyApO1xuICAgIHJldHVybiB0aGlzLl9waGV0aW9UeXBlO1xuICB9XG5cbiAgLy8gdGhyb3dzIGFuIGFzc2VydGlvbiBlcnJvciBpbiBicmFuZHMgb3RoZXIgdGhhbiBQaEVULWlPXG4gIHB1YmxpYyBnZXQgcGhldGlvU3RhdGUoKTogYm9vbGVhbiB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggUEhFVF9JT19FTkFCTEVEICYmIHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSwgJ3BoZXRpb1N0YXRlIG9ubHkgYWNjZXNzaWJsZSBmb3IgaW5zdHJ1bWVudGVkIG9iamVjdHMgaW4gUGhFVC1pTyBicmFuZC4nICk7XG4gICAgcmV0dXJuIHRoaXMuX3BoZXRpb1N0YXRlO1xuICB9XG5cbiAgLy8gdGhyb3dzIGFuIGFzc2VydGlvbiBlcnJvciBpbiBicmFuZHMgb3RoZXIgdGhhbiBQaEVULWlPXG4gIHB1YmxpYyBnZXQgcGhldGlvUmVhZE9ubHkoKTogYm9vbGVhbiB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggUEhFVF9JT19FTkFCTEVEICYmIHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSwgJ3BoZXRpb1JlYWRPbmx5IG9ubHkgYWNjZXNzaWJsZSBmb3IgaW5zdHJ1bWVudGVkIG9iamVjdHMgaW4gUGhFVC1pTyBicmFuZC4nICk7XG4gICAgcmV0dXJuIHRoaXMuX3BoZXRpb1JlYWRPbmx5O1xuICB9XG5cbiAgLy8gdGhyb3dzIGFuIGFzc2VydGlvbiBlcnJvciBpbiBicmFuZHMgb3RoZXIgdGhhbiBQaEVULWlPXG4gIHB1YmxpYyBnZXQgcGhldGlvRG9jdW1lbnRhdGlvbigpOiBzdHJpbmcge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIFBIRVRfSU9fRU5BQkxFRCAmJiB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCksICdwaGV0aW9Eb2N1bWVudGF0aW9uIG9ubHkgYWNjZXNzaWJsZSBmb3IgaW5zdHJ1bWVudGVkIG9iamVjdHMgaW4gUGhFVC1pTyBicmFuZC4nICk7XG4gICAgcmV0dXJuIHRoaXMuX3BoZXRpb0RvY3VtZW50YXRpb247XG4gIH1cblxuICAvLyB0aHJvd3MgYW4gYXNzZXJ0aW9uIGVycm9yIGluIGJyYW5kcyBvdGhlciB0aGFuIFBoRVQtaU9cbiAgcHVibGljIGdldCBwaGV0aW9FdmVudFR5cGUoKTogRXZlbnRUeXBlIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBQSEVUX0lPX0VOQUJMRUQgJiYgdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpLCAncGhldGlvRXZlbnRUeXBlIG9ubHkgYWNjZXNzaWJsZSBmb3IgaW5zdHJ1bWVudGVkIG9iamVjdHMgaW4gUGhFVC1pTyBicmFuZC4nICk7XG4gICAgcmV0dXJuIHRoaXMuX3BoZXRpb0V2ZW50VHlwZTtcbiAgfVxuXG4gIC8vIHRocm93cyBhbiBhc3NlcnRpb24gZXJyb3IgaW4gYnJhbmRzIG90aGVyIHRoYW4gUGhFVC1pT1xuICBwdWJsaWMgZ2V0IHBoZXRpb0hpZ2hGcmVxdWVuY3koKTogYm9vbGVhbiB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggUEhFVF9JT19FTkFCTEVEICYmIHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSwgJ3BoZXRpb0hpZ2hGcmVxdWVuY3kgb25seSBhY2Nlc3NpYmxlIGZvciBpbnN0cnVtZW50ZWQgb2JqZWN0cyBpbiBQaEVULWlPIGJyYW5kLicgKTtcbiAgICByZXR1cm4gdGhpcy5fcGhldGlvSGlnaEZyZXF1ZW5jeTtcbiAgfVxuXG4gIC8vIHRocm93cyBhbiBhc3NlcnRpb24gZXJyb3IgaW4gYnJhbmRzIG90aGVyIHRoYW4gUGhFVC1pT1xuICBwdWJsaWMgZ2V0IHBoZXRpb1BsYXliYWNrKCk6IGJvb2xlYW4ge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIFBIRVRfSU9fRU5BQkxFRCAmJiB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCksICdwaGV0aW9QbGF5YmFjayBvbmx5IGFjY2Vzc2libGUgZm9yIGluc3RydW1lbnRlZCBvYmplY3RzIGluIFBoRVQtaU8gYnJhbmQuJyApO1xuICAgIHJldHVybiB0aGlzLl9waGV0aW9QbGF5YmFjaztcbiAgfVxuXG4gIC8vIHRocm93cyBhbiBhc3NlcnRpb24gZXJyb3IgaW4gYnJhbmRzIG90aGVyIHRoYW4gUGhFVC1pT1xuICBwdWJsaWMgZ2V0IHBoZXRpb0R5bmFtaWNFbGVtZW50KCk6IGJvb2xlYW4ge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIFBIRVRfSU9fRU5BQkxFRCAmJiB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCksICdwaGV0aW9EeW5hbWljRWxlbWVudCBvbmx5IGFjY2Vzc2libGUgZm9yIGluc3RydW1lbnRlZCBvYmplY3RzIGluIFBoRVQtaU8gYnJhbmQuJyApO1xuICAgIHJldHVybiB0aGlzLl9waGV0aW9EeW5hbWljRWxlbWVudDtcbiAgfVxuXG4gIC8vIHRocm93cyBhbiBhc3NlcnRpb24gZXJyb3IgaW4gYnJhbmRzIG90aGVyIHRoYW4gUGhFVC1pT1xuICBwdWJsaWMgZ2V0IHBoZXRpb0ZlYXR1cmVkKCk6IGJvb2xlYW4ge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIFBIRVRfSU9fRU5BQkxFRCAmJiB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCksICdwaGV0aW9GZWF0dXJlZCBvbmx5IGFjY2Vzc2libGUgZm9yIGluc3RydW1lbnRlZCBvYmplY3RzIGluIFBoRVQtaU8gYnJhbmQuJyApO1xuICAgIHJldHVybiB0aGlzLl9waGV0aW9GZWF0dXJlZDtcbiAgfVxuXG4gIC8vIHRocm93cyBhbiBhc3NlcnRpb24gZXJyb3IgaW4gYnJhbmRzIG90aGVyIHRoYW4gUGhFVC1pT1xuICBwdWJsaWMgZ2V0IHBoZXRpb0V2ZW50TWV0YWRhdGEoKTogRXZlbnRNZXRhZGF0YSB8IG51bGwge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIFBIRVRfSU9fRU5BQkxFRCAmJiB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCksICdwaGV0aW9FdmVudE1ldGFkYXRhIG9ubHkgYWNjZXNzaWJsZSBmb3IgaW5zdHJ1bWVudGVkIG9iamVjdHMgaW4gUGhFVC1pTyBicmFuZC4nICk7XG4gICAgcmV0dXJuIHRoaXMuX3BoZXRpb0V2ZW50TWV0YWRhdGE7XG4gIH1cblxuICAvLyB0aHJvd3MgYW4gYXNzZXJ0aW9uIGVycm9yIGluIGJyYW5kcyBvdGhlciB0aGFuIFBoRVQtaU9cbiAgcHVibGljIGdldCBwaGV0aW9EZXNpZ25lZCgpOiBib29sZWFuIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBQSEVUX0lPX0VOQUJMRUQgJiYgdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpLCAncGhldGlvRGVzaWduZWQgb25seSBhY2Nlc3NpYmxlIGZvciBpbnN0cnVtZW50ZWQgb2JqZWN0cyBpbiBQaEVULWlPIGJyYW5kLicgKTtcbiAgICByZXR1cm4gdGhpcy5fcGhldGlvRGVzaWduZWQ7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgYW4gZXZlbnQgZm9yIHRoZSBuZXN0ZWQgUGhFVC1pTyBkYXRhIHN0cmVhbS5cbiAgICpcbiAgICogQHBhcmFtIGV2ZW50IC0gdGhlIG5hbWUgb2YgdGhlIGV2ZW50XG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxuICAgKi9cbiAgcHVibGljIHBoZXRpb1N0YXJ0RXZlbnQoIGV2ZW50OiBzdHJpbmcsIHByb3ZpZGVkT3B0aW9ucz86IFN0YXJ0RXZlbnRPcHRpb25zICk6IHZvaWQge1xuICAgIGlmICggUEhFVF9JT19FTkFCTEVEICYmIHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSApIHtcblxuICAgICAgLy8gb25seSBvbmUgb3IgdGhlIG90aGVyIGNhbiBiZSBwcm92aWRlZFxuICAgICAgYXNzZXJ0ICYmIGFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyggcHJvdmlkZWRPcHRpb25zLCBbICdkYXRhJyBdLCBbICdnZXREYXRhJyBdICk7XG4gICAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFN0YXJ0RXZlbnRPcHRpb25zPigpKCB7XG5cbiAgICAgICAgZGF0YTogbnVsbCxcblxuICAgICAgICAvLyBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCBnZXRzIHRoZSBkYXRhLlxuICAgICAgICBnZXREYXRhOiBudWxsXG4gICAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5waGV0aW9PYmplY3RJbml0aWFsaXplZCwgJ3BoZXRpb09iamVjdCBzaG91bGQgYmUgaW5pdGlhbGl6ZWQnICk7XG4gICAgICBhc3NlcnQgJiYgb3B0aW9ucy5kYXRhICYmIGFzc2VydCggdHlwZW9mIG9wdGlvbnMuZGF0YSA9PT0gJ29iamVjdCcgKTtcbiAgICAgIGFzc2VydCAmJiBvcHRpb25zLmdldERhdGEgJiYgYXNzZXJ0KCB0eXBlb2Ygb3B0aW9ucy5nZXREYXRhID09PSAnZnVuY3Rpb24nICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhcmd1bWVudHMubGVuZ3RoID09PSAxIHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDIsICdQcmV2ZW50IHVzYWdlIG9mIGluY29ycmVjdCBzaWduYXR1cmUnICk7XG5cbiAgICAgIC8vIFRPRE86IGRvbid0IGRyb3AgUGhFVC1pTyBldmVudHMgaWYgdGhleSBhcmUgY3JlYXRlZCBiZWZvcmUgd2UgaGF2ZSBhIGRhdGFTdHJlYW0gZ2xvYmFsLiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby9pc3N1ZXMvMTg3NVxuICAgICAgaWYgKCAhXy5oYXNJbiggd2luZG93LCAncGhldC5waGV0aW8uZGF0YVN0cmVhbScgKSApIHtcblxuICAgICAgICAvLyBJZiB5b3UgaGl0IHRoaXMsIHRoZW4gaXQgaXMgbGlrZWx5IHJlbGF0ZWQgdG8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzExMjQgYW5kIHdlIHdvdWxkIGxpa2UgdG8ga25vdyBhYm91dCBpdCFcbiAgICAgICAgLy8gYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICd0cnlpbmcgdG8gY3JlYXRlIGFuIGV2ZW50IGJlZm9yZSB0aGUgZGF0YSBzdHJlYW0gZXhpc3RzJyApO1xuXG4gICAgICAgIHRoaXMucGhldGlvTWVzc2FnZVN0YWNrLnB1c2goIFNLSVBQSU5HX01FU1NBR0UgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBPcHQgb3V0IG9mIGNlcnRhaW4gZXZlbnRzIGlmIHF1ZXJ5UGFyYW1ldGVyIG92ZXJyaWRlIGlzIHByb3ZpZGVkLiBFdmVuIGZvciBhIGxvdyBmcmVxdWVuY3kgZGF0YSBzdHJlYW0sIGhpZ2hcbiAgICAgIC8vIGZyZXF1ZW5jeSBldmVudHMgY2FuIHN0aWxsIGJlIGVtaXR0ZWQgd2hlbiB0aGV5IGhhdmUgYSBsb3cgZnJlcXVlbmN5IGFuY2VzdG9yLlxuICAgICAgY29uc3Qgc2tpcEhpZ2hGcmVxdWVuY3lFdmVudCA9IHRoaXMucGhldGlvSGlnaEZyZXF1ZW5jeSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uaGFzSW4oIHdpbmRvdywgJ3BoZXQucHJlbG9hZHMucGhldGlvLnF1ZXJ5UGFyYW1ldGVycycgKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICF3aW5kb3cucGhldC5wcmVsb2Fkcy5waGV0aW8ucXVlcnlQYXJhbWV0ZXJzLnBoZXRpb0VtaXRIaWdoRnJlcXVlbmN5RXZlbnRzICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIXBoZXQucGhldGlvLmRhdGFTdHJlYW0uaXNFbWl0dGluZ0xvd0ZyZXF1ZW5jeUV2ZW50KCk7XG5cbiAgICAgIC8vIFRPRE86IElmIHRoZXJlIGlzIG5vIGRhdGFTdHJlYW0gZ2xvYmFsIGRlZmluZWQsIHRoZW4gd2Ugc2hvdWxkIGhhbmRsZSB0aGlzIGRpZmZlcmVudGx5IGFzIHRvIG5vdCBkcm9wIHRoZSBldmVudCB0aGF0IGlzIHRyaWdnZXJlZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvL2lzc3Vlcy8xODQ2XG4gICAgICBjb25zdCBza2lwRnJvbVVuZGVmaW5lZERhdGFzdHJlYW0gPSAhYXNzZXJ0ICYmICFfLmhhc0luKCB3aW5kb3csICdwaGV0LnBoZXRpby5kYXRhU3RyZWFtJyApO1xuXG4gICAgICBpZiAoIHNraXBIaWdoRnJlcXVlbmN5RXZlbnQgfHwgdGhpcy5waGV0aW9FdmVudFR5cGUgPT09IEV2ZW50VHlwZS5PUFRfT1VUIHx8IHNraXBGcm9tVW5kZWZpbmVkRGF0YXN0cmVhbSApIHtcbiAgICAgICAgdGhpcy5waGV0aW9NZXNzYWdlU3RhY2sucHVzaCggU0tJUFBJTkdfTUVTU0FHRSApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIE9ubHkgZ2V0IHRoZSBhcmdzIGlmIHdlIGFyZSBhY3R1YWxseSBnb2luZyB0byBzZW5kIHRoZSBldmVudC5cbiAgICAgIGNvbnN0IGRhdGEgPSBvcHRpb25zLmdldERhdGEgPyBvcHRpb25zLmdldERhdGEoKSA6IG9wdGlvbnMuZGF0YTtcblxuICAgICAgdGhpcy5waGV0aW9NZXNzYWdlU3RhY2sucHVzaChcbiAgICAgICAgcGhldC5waGV0aW8uZGF0YVN0cmVhbS5zdGFydCggdGhpcy5waGV0aW9FdmVudFR5cGUsIHRoaXMudGFuZGVtLnBoZXRpb0lELCB0aGlzLnBoZXRpb1R5cGUsIGV2ZW50LCBkYXRhLCB0aGlzLnBoZXRpb0V2ZW50TWV0YWRhdGEsIHRoaXMucGhldGlvSGlnaEZyZXF1ZW5jeSApXG4gICAgICApO1xuXG4gICAgICAvLyBUbyBzdXBwb3J0IFBoRVQtaU8gcGxheWJhY2ssIGFueSBwb3RlbnRpYWwgcGxheWJhY2sgZXZlbnRzIGRvd25zdHJlYW0gb2YgdGhpcyBwbGF5YmFjayBldmVudCBtdXN0IGJlIG1hcmtlZCBhc1xuICAgICAgLy8gbm9uIHBsYXliYWNrIGV2ZW50cy4gVGhpcyBpcyB0byBwcmV2ZW50IHRoZSBQaEVULWlPIHBsYXliYWNrIGVuZ2luZSBmcm9tIHJlcGVhdGluZyB0aG9zZSBldmVudHMuIFNlZVxuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vaXNzdWVzLzE2OTNcbiAgICAgIHRoaXMucGhldGlvUGxheWJhY2sgJiYgcGhldC5waGV0aW8uZGF0YVN0cmVhbS5wdXNoTm9uUGxheWJhY2thYmxlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEVuZCBhbiBldmVudCBvbiB0aGUgbmVzdGVkIFBoRVQtaU8gZGF0YSBzdHJlYW0uIEl0IHRoaXMgb2JqZWN0IHdhcyBkaXNwb3NlZCBvciBkYXRhU3RyZWFtLnN0YXJ0IHdhcyBub3QgY2FsbGVkLFxuICAgKiB0aGlzIGlzIGEgbm8tb3AuXG4gICAqL1xuICBwdWJsaWMgcGhldGlvRW5kRXZlbnQoIGFzc2VydENvcnJlY3RJbmRpY2VzID0gZmFsc2UgKTogdm9pZCB7XG4gICAgaWYgKCBQSEVUX0lPX0VOQUJMRUQgJiYgdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpICkge1xuXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnBoZXRpb01lc3NhZ2VTdGFjay5sZW5ndGggPiAwLCAnTXVzdCBoYXZlIG1lc3NhZ2VzIHRvIHBvcCcgKTtcbiAgICAgIGNvbnN0IHRvcE1lc3NhZ2VJbmRleCA9IHRoaXMucGhldGlvTWVzc2FnZVN0YWNrLnBvcCgpO1xuXG4gICAgICAvLyBUaGUgbWVzc2FnZSB3YXMgc3RhcnRlZCBhcyBhIGhpZ2ggZnJlcXVlbmN5IGV2ZW50IHRvIGJlIHNraXBwZWQsIHNvIHRoZSBlbmQgaXMgYSBuby1vcFxuICAgICAgaWYgKCB0b3BNZXNzYWdlSW5kZXggPT09IFNLSVBQSU5HX01FU1NBR0UgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMucGhldGlvUGxheWJhY2sgJiYgcGhldC5waGV0aW8uZGF0YVN0cmVhbS5wb3BOb25QbGF5YmFja2FibGUoKTtcbiAgICAgIHBoZXQucGhldGlvLmRhdGFTdHJlYW0uZW5kKCB0b3BNZXNzYWdlSW5kZXgsIGFzc2VydENvcnJlY3RJbmRpY2VzICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBhbnkgaW5zdHJ1bWVudGVkIGRlc2NlbmRhbnRzIG9mIHRoaXMgUGhldGlvT2JqZWN0IHRvIHRoZSBzYW1lIHZhbHVlIGFzIHRoaXMucGhldGlvRHluYW1pY0VsZW1lbnQuXG4gICAqL1xuICBwdWJsaWMgcHJvcGFnYXRlRHluYW1pY0ZsYWdzVG9EZXNjZW5kYW50cygpOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBUYW5kZW0uUEhFVF9JT19FTkFCTEVELCAncGhldC1pbyBzaG91bGQgYmUgZW5hYmxlZCcgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwaGV0LnBoZXRpbyAmJiBwaGV0LnBoZXRpby5waGV0aW9FbmdpbmUsICdEeW5hbWljIGVsZW1lbnRzIGNhbm5vdCBiZSBjcmVhdGVkIHN0YXRpY2FsbHkgYmVmb3JlIHBoZXRpb0VuZ2luZSBleGlzdHMuJyApO1xuICAgIGNvbnN0IHBoZXRpb0VuZ2luZSA9IHBoZXQucGhldGlvLnBoZXRpb0VuZ2luZTtcblxuICAgIC8vIGluIHRoZSBzYW1lIG9yZGVyIGFzIGJ1ZmZlcmVkUGhldGlvT2JqZWN0c1xuICAgIGNvbnN0IHVubGF1bmNoZWRQaGV0aW9JRHMgPSAhVGFuZGVtLmxhdW5jaGVkID8gVGFuZGVtLmJ1ZmZlcmVkUGhldGlvT2JqZWN0cy5tYXAoIG9iamVjdFRvUGhldGlvSUQgKSA6IFtdO1xuXG4gICAgdGhpcy50YW5kZW0uaXRlcmF0ZURlc2NlbmRhbnRzKCB0YW5kZW0gPT4ge1xuICAgICAgY29uc3QgcGhldGlvSUQgPSB0YW5kZW0ucGhldGlvSUQ7XG5cbiAgICAgIGlmICggcGhldGlvRW5naW5lLmhhc1BoZXRpb09iamVjdCggcGhldGlvSUQgKSB8fCAoICFUYW5kZW0ubGF1bmNoZWQgJiYgdW5sYXVuY2hlZFBoZXRpb0lEcy5pbmNsdWRlcyggcGhldGlvSUQgKSApICkge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKTtcbiAgICAgICAgY29uc3QgcGhldGlvT2JqZWN0ID0gcGhldGlvRW5naW5lLmhhc1BoZXRpb09iamVjdCggcGhldGlvSUQgKSA/IHBoZXRpb0VuZ2luZS5nZXRQaGV0aW9FbGVtZW50KCBwaGV0aW9JRCApIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVGFuZGVtLmJ1ZmZlcmVkUGhldGlvT2JqZWN0c1sgdW5sYXVuY2hlZFBoZXRpb0lEcy5pbmRleE9mKCBwaGV0aW9JRCApIF07XG5cbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcGhldGlvT2JqZWN0LCAnc2hvdWxkIGhhdmUgYSBwaGV0aW9PYmplY3QgaGVyZScgKTtcblxuICAgICAgICAvLyBPcmRlciBtYXR0ZXJzIGhlcmUhIFRoZSBwaGV0aW9Jc0FyY2hldHlwZSBuZWVkcyB0byBiZSBmaXJzdCB0byBlbnN1cmUgdGhhdCB0aGUgc2V0UGhldGlvRHluYW1pY0VsZW1lbnRcbiAgICAgICAgLy8gc2V0dGVyIGNhbiBvcHQgb3V0IGZvciBhcmNoZXR5cGVzLlxuICAgICAgICBwaGV0aW9PYmplY3QucGhldGlvSXNBcmNoZXR5cGUgPSB0aGlzLnBoZXRpb0lzQXJjaGV0eXBlO1xuICAgICAgICBwaGV0aW9PYmplY3Quc2V0UGhldGlvRHluYW1pY0VsZW1lbnQoIHRoaXMucGhldGlvRHluYW1pY0VsZW1lbnQgKTtcblxuICAgICAgICBpZiAoIHBoZXRpb09iamVjdC5waGV0aW9CYXNlbGluZU1ldGFkYXRhICkge1xuICAgICAgICAgIHBoZXRpb09iamVjdC5waGV0aW9CYXNlbGluZU1ldGFkYXRhLnBoZXRpb0lzQXJjaGV0eXBlID0gdGhpcy5waGV0aW9Jc0FyY2hldHlwZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2VkIGluIFBoZXRpb0VuZ2luZVxuICAgKi9cbiAgcHVibGljIHNldFBoZXRpb0R5bmFtaWNFbGVtZW50KCBwaGV0aW9EeW5hbWljRWxlbWVudDogYm9vbGVhbiApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5waGV0aW9Ob3RpZmllZE9iamVjdENyZWF0ZWQsICdzaG91bGQgbm90IGNoYW5nZSBkeW5hbWljIGVsZW1lbnQgZmxhZ3MgYWZ0ZXIgbm90aWZ5aW5nIHRoaXMgUGhldGlvT2JqZWN0XFwncyBjcmVhdGlvbi4nICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpICk7XG5cbiAgICAvLyBBbGwgYXJjaGV0eXBlcyBhcmUgc3RhdGljIChub24tZHluYW1pYylcbiAgICB0aGlzLl9waGV0aW9EeW5hbWljRWxlbWVudCA9IHRoaXMucGhldGlvSXNBcmNoZXR5cGUgPyBmYWxzZSA6IHBoZXRpb0R5bmFtaWNFbGVtZW50O1xuXG4gICAgLy8gRm9yIGR5bmFtaWMgZWxlbWVudHMsIGluZGljYXRlIHRoZSBjb3JyZXNwb25kaW5nIGFyY2hldHlwZSBlbGVtZW50IHNvIHRoYXQgY2xpZW50cyBsaWtlIFN0dWRpbyBjYW4gbGV2ZXJhZ2VcbiAgICAvLyB0aGUgYXJjaGV0eXBlIG1ldGFkYXRhLiBTdGF0aWMgZWxlbWVudHMgZG9uJ3QgaGF2ZSBhcmNoZXR5cGVzLlxuICAgIHRoaXMucGhldGlvQXJjaGV0eXBlUGhldGlvSUQgPSBwaGV0aW9EeW5hbWljRWxlbWVudCA/IHRoaXMudGFuZGVtLmdldEFyY2hldHlwYWxQaGV0aW9JRCgpIDogbnVsbDtcblxuICAgIC8vIEtlZXAgdGhlIGJhc2VsaW5lIG1ldGFkYXRhIGluIHN5bmMuXG4gICAgaWYgKCB0aGlzLnBoZXRpb0Jhc2VsaW5lTWV0YWRhdGEgKSB7XG4gICAgICB0aGlzLnBoZXRpb0Jhc2VsaW5lTWV0YWRhdGEucGhldGlvRHluYW1pY0VsZW1lbnQgPSB0aGlzLnBoZXRpb0R5bmFtaWNFbGVtZW50O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNYXJrIHRoaXMgUGhldGlvT2JqZWN0IGFzIGFuIGFyY2hldHlwZSBmb3IgZHluYW1pYyBlbGVtZW50cy5cbiAgICovXG4gIHB1YmxpYyBtYXJrRHluYW1pY0VsZW1lbnRBcmNoZXR5cGUoKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMucGhldGlvTm90aWZpZWRPYmplY3RDcmVhdGVkLCAnc2hvdWxkIG5vdCBjaGFuZ2UgZHluYW1pYyBlbGVtZW50IGZsYWdzIGFmdGVyIG5vdGlmeWluZyB0aGlzIFBoZXRpb09iamVjdFxcJ3MgY3JlYXRpb24uJyApO1xuXG4gICAgdGhpcy5waGV0aW9Jc0FyY2hldHlwZSA9IHRydWU7XG4gICAgdGhpcy5zZXRQaGV0aW9EeW5hbWljRWxlbWVudCggZmFsc2UgKTsgLy8gYmVjYXVzZSBhcmNoZXR5cGVzIGFyZW4ndCBkeW5hbWljIGVsZW1lbnRzXG5cbiAgICBpZiAoIHRoaXMucGhldGlvQmFzZWxpbmVNZXRhZGF0YSApIHtcbiAgICAgIHRoaXMucGhldGlvQmFzZWxpbmVNZXRhZGF0YS5waGV0aW9Jc0FyY2hldHlwZSA9IHRoaXMucGhldGlvSXNBcmNoZXR5cGU7XG4gICAgfVxuXG4gICAgLy8gcmVjb21wdXRlIGZvciBjaGlsZHJlbiBhbHNvLCBidXQgb25seSBpZiBwaGV0LWlvIGlzIGVuYWJsZWRcbiAgICBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICYmIHRoaXMucHJvcGFnYXRlRHluYW1pY0ZsYWdzVG9EZXNjZW5kYW50cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgUGhldGlvT2JqZWN0IHdpbGwgb25seSBiZSBpbnN0cnVtZW50ZWQgaWYgdGhlIHRhbmRlbSB0aGF0IHdhcyBwYXNzZWQgaW4gd2FzIFwic3VwcGxpZWRcIi4gU2VlIFRhbmRlbS5zdXBwbGllZFxuICAgKiBmb3IgbW9yZSBpbmZvLlxuICAgKi9cbiAgcHVibGljIGlzUGhldGlvSW5zdHJ1bWVudGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnRhbmRlbSAmJiB0aGlzLnRhbmRlbS5zdXBwbGllZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIGFuIGluc3RydW1lbnRlZCBQaGV0aW9PYmplY3QgaXMgbGlua2VkIHdpdGggYW5vdGhlciBpbnN0cnVtZW50ZWQgUGhldGlvT2JqZWN0LCB0aGlzIGNyZWF0ZXMgYSBvbmUtd2F5XG4gICAqIGFzc29jaWF0aW9uIHdoaWNoIGlzIHJlbmRlcmVkIGluIFN0dWRpbyBhcyBhIFwic3ltYm9saWNcIiBsaW5rIG9yIGh5cGVybGluay4gTWFueSBjb21tb24gY29kZSBVSSBlbGVtZW50cyB1c2UgdGhpc1xuICAgKiBhdXRvbWF0aWNhbGx5LiBUbyBrZWVwIGNsaWVudCBzaXRlcyBzaW1wbGUsIHRoaXMgaGFzIGEgZ3JhY2VmdWwgb3B0LW91dCBtZWNoYW5pc20gd2hpY2ggbWFrZXMgdGhpcyBmdW5jdGlvbiBhXG4gICAqIG5vLW9wIGlmIGVpdGhlciB0aGlzIFBoZXRpb09iamVjdCBvciB0aGUgdGFyZ2V0IFBoZXRpb09iamVjdCBpcyBub3QgaW5zdHJ1bWVudGVkLlxuICAgKlxuICAgKiBZb3UgY2FuIHNwZWNpZnkgdGhlIHRhbmRlbSBvbmUgb2YgdGhyZWUgd2F5czpcbiAgICogMS4gV2l0aG91dCBzcGVjaWZ5aW5nIHRhbmRlbU5hbWUgb3IgdGFuZGVtLCBpdCB3aWxsIHBsdWNrIHRoZSB0YW5kZW0ubmFtZSBmcm9tIHRoZSB0YXJnZXQgZWxlbWVudFxuICAgKiAyLiBJZiB0YW5kZW1OYW1lIGlzIHNwZWNpZmllZCBpbiB0aGUgb3B0aW9ucywgaXQgd2lsbCB1c2UgdGhhdCB0YW5kZW0gbmFtZSBhbmQgbmVzdCB0aGUgdGFuZGVtIHVuZGVyIHRoaXMgUGhldGlvT2JqZWN0J3MgdGFuZGVtXG4gICAqIDMuIElmIHRhbmRlbSBpcyBzcGVjaWZpZWQgaW4gdGhlIG9wdGlvbnMgKG5vdCByZWNvbW1lbmRlZCksIGl0IHdpbGwgdXNlIHRoYXQgdGFuZGVtIGFuZCBuZXN0IGl0IGFueXdoZXJlIHRoYXQgdGFuZGVtIGV4aXN0cy5cbiAgICogICAgVXNlIHRoaXMgb3B0aW9uIHdpdGggY2F1dGlvbiBzaW5jZSBpdCBhbGxvd3MgeW91IHRvIG5lc3QgdGhlIHRhbmRlbSBhbnl3aGVyZSBpbiB0aGUgdHJlZS5cbiAgICpcbiAgICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgdGFyZ2V0IGVsZW1lbnQuIE11c3QgYmUgaW5zdHJ1bWVudGVkIGZvciBhIExpbmtlZEVsZW1lbnQgdG8gYmUgY3JlYXRlZC0tIG90aGVyd2lzZSBncmFjZWZ1bGx5IG9wdHMgb3V0XG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxuICAgKi9cbiAgcHVibGljIGFkZExpbmtlZEVsZW1lbnQoIGVsZW1lbnQ6IFBoZXRpb09iamVjdCwgcHJvdmlkZWRPcHRpb25zPzogTGlua2VkRWxlbWVudE9wdGlvbnMgKTogdm9pZCB7XG4gICAgaWYgKCAhdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpICkge1xuXG4gICAgICAvLyBzZXQgdGhpcyB0byBudWxsIHNvIHRoYXQgeW91IGNhbid0IGFkZExpbmtlZEVsZW1lbnQgb24gYW4gdW5pbml0aWFsaXplZCBQaGV0aW9PYmplY3QgYW5kIHRoZW4gaW5zdHJ1bWVudFxuICAgICAgLy8gaXQgYWZ0ZXJ3YXJkLlxuICAgICAgdGhpcy5saW5rZWRFbGVtZW50cyA9IG51bGw7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSW4gc29tZSBjYXNlcywgVUkgY29tcG9uZW50cyBuZWVkIHRvIGJlIHdpcmVkIHVwIHRvIGEgcHJpdmF0ZSAoaW50ZXJuYWwpIFByb3BlcnR5IHdoaWNoIHNob3VsZCBuZWl0aGVyIGJlXG4gICAgLy8gaW5zdHJ1bWVudGVkIG5vciBsaW5rZWQuXG4gICAgaWYgKCBQSEVUX0lPX0VOQUJMRUQgJiYgZWxlbWVudC5pc1BoZXRpb0luc3RydW1lbnRlZCgpICkge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxMaW5rZWRFbGVtZW50T3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucz4oKSgge1xuXG4gICAgICAgIC8vIFRoZSBsaW5rYWdlIGlzIG9ubHkgZmVhdHVyZWQgaWYgdGhlIHBhcmVudCBhbmQgdGhlIGVsZW1lbnQgYXJlIGJvdGggYWxzbyBmZWF0dXJlZFxuICAgICAgICBwaGV0aW9GZWF0dXJlZDogdGhpcy5waGV0aW9GZWF0dXJlZCAmJiBlbGVtZW50LnBoZXRpb0ZlYXR1cmVkXG4gICAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIHRoaXMubGlua2VkRWxlbWVudHMgKSwgJ2xpbmtlZEVsZW1lbnRzIHNob3VsZCBiZSBhbiBhcnJheScgKTtcblxuICAgICAgbGV0IHRhbmRlbTogVGFuZGVtIHwgbnVsbCA9IG51bGw7XG4gICAgICBpZiAoIHByb3ZpZGVkT3B0aW9ucyAmJiBwcm92aWRlZE9wdGlvbnMudGFuZGVtICkge1xuICAgICAgICB0YW5kZW0gPSBwcm92aWRlZE9wdGlvbnMudGFuZGVtO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIHByb3ZpZGVkT3B0aW9ucyAmJiBwcm92aWRlZE9wdGlvbnMudGFuZGVtTmFtZSApIHtcbiAgICAgICAgdGFuZGVtID0gdGhpcy50YW5kZW0uY3JlYXRlVGFuZGVtKCBwcm92aWRlZE9wdGlvbnMudGFuZGVtTmFtZSApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoICFwcm92aWRlZE9wdGlvbnMgJiYgZWxlbWVudC50YW5kZW0gKSB7XG4gICAgICAgIHRhbmRlbSA9IHRoaXMudGFuZGVtLmNyZWF0ZVRhbmRlbSggZWxlbWVudC50YW5kZW0ubmFtZSApO1xuICAgICAgfVxuXG4gICAgICBpZiAoIHRhbmRlbSApIHtcbiAgICAgICAgb3B0aW9ucy50YW5kZW0gPSB0YW5kZW07XG4gICAgICB9XG5cbiAgICAgIHRoaXMubGlua2VkRWxlbWVudHMhLnB1c2goIG5ldyBMaW5rZWRFbGVtZW50KCBlbGVtZW50LCBvcHRpb25zICkgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCBsaW5rZWQgZWxlbWVudHMgbGlua2luZyB0byB0aGUgcHJvdmlkZWQgUGhldGlvT2JqZWN0LiBUaGlzIHdpbGwgZGlzcG9zZSBhbGwgcmVtb3ZlZCBMaW5rZWRFbGVtZW50cy4gVGhpc1xuICAgKiB3aWxsIGJlIGdyYWNlZnVsLCBhbmQgZG9lc24ndCBhc3N1bWUgb3IgYXNzZXJ0IHRoYXQgdGhlIHByb3ZpZGVkIFBoZXRpb09iamVjdCBoYXMgTGlua2VkRWxlbWVudChzKSwgaXQgd2lsbCBqdXN0XG4gICAqIHJlbW92ZSB0aGVtIGlmIHRoZXkgYXJlIHRoZXJlLlxuICAgKi9cbiAgcHVibGljIHJlbW92ZUxpbmtlZEVsZW1lbnRzKCBwb3RlbnRpYWxseUxpbmtlZEVsZW1lbnQ6IFBoZXRpb09iamVjdCApOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSAmJiB0aGlzLmxpbmtlZEVsZW1lbnRzICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcG90ZW50aWFsbHlMaW5rZWRFbGVtZW50LmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKTtcblxuICAgICAgY29uc3QgdG9SZW1vdmUgPSB0aGlzLmxpbmtlZEVsZW1lbnRzLmZpbHRlciggbGlua2VkRWxlbWVudCA9PiBsaW5rZWRFbGVtZW50LmVsZW1lbnQgPT09IHBvdGVudGlhbGx5TGlua2VkRWxlbWVudCApO1xuICAgICAgdG9SZW1vdmUuZm9yRWFjaCggbGlua2VkRWxlbWVudCA9PiB7XG4gICAgICAgIGxpbmtlZEVsZW1lbnQuZGlzcG9zZSgpO1xuICAgICAgICBhcnJheVJlbW92ZSggdGhpcy5saW5rZWRFbGVtZW50cyEsIGxpbmtlZEVsZW1lbnQgKTtcbiAgICAgIH0gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgY2xlYW51cCBhZnRlciB0aGUgc2ltJ3MgY29uc3RydWN0aW9uIGhhcyBmaW5pc2hlZC5cbiAgICovXG4gIHB1YmxpYyBvblNpbXVsYXRpb25Db25zdHJ1Y3Rpb25Db21wbGV0ZWQoKTogdm9pZCB7XG5cbiAgICAvLyBkZWxldGVzIHRoZSBwaGV0aW9CYXNlbGluZU1ldGFkYXRhLCBhcyBpdCdzIG5vIGxvbmdlciBuZWVkZWQgc2luY2UgdmFsaWRhdGlvbiBpcyBjb21wbGV0ZS5cbiAgICB0aGlzLnBoZXRpb0Jhc2VsaW5lTWV0YWRhdGEgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlYWJsZSBzbyB0aGF0IHN1YmNsYXNzZXMgY2FuIHJldHVybiBhIGRpZmZlcmVudCBQaGV0aW9PYmplY3QgZm9yIHN0dWRpbyBhdXRvc2VsZWN0LiBUaGlzIG1ldGhvZCBpcyBjYWxsZWRcbiAgICogd2hlbiB0aGVyZSBpcyBhIHNjZW5lIGdyYXBoIGhpdC4gUmV0dXJuIHRoZSBjb3JyZXNwb25kaW5nIHRhcmdldCB0aGF0IG1hdGNoZXMgdGhlIFBoRVQtaU8gZmlsdGVycy4gIE5vdGUgdGhpcyBtZWFuc1xuICAgKiB0aGF0IGlmIFBoRVQtaU8gU3R1ZGlvIGlzIGxvb2tpbmcgZm9yIGEgZmVhdHVyZWQgaXRlbSBhbmQgdGhpcyBpcyBub3QgZmVhdHVyZWQsIGl0IHdpbGwgcmV0dXJuICdwaGV0aW9Ob3RTZWxlY3RhYmxlJy5cbiAgICogU29tZXRoaW5nIGlzICdwaGV0aW9Ob3RTZWxlY3RhYmxlJyBpZiBpdCBpcyBub3QgaW5zdHJ1bWVudGVkIG9yIGlmIGl0IGRvZXMgbm90IG1hdGNoIHRoZSBcImZlYXR1cmVkXCIgZmlsdGVyaW5nLlxuICAgKlxuICAgKiBUaGUgYGZyb21MaW5raW5nYCBmbGFnIGFsbG93cyBhIGN1dG9mZiB0byBwcmV2ZW50IHJlY3Vyc2l2ZSBsaW5raW5nIGNoYWlucyBpbiAnbGlua2VkJyBtb2RlLiBHaXZlbiB0aGVzZSBsaW5rZWQgZWxlbWVudHM6XG4gICAqIGNhcmROb2RlIC0+IGNhcmQgLT4gY2FyZFZhbHVlUHJvcGVydHlcbiAgICogV2UgZG9uJ3Qgd2FudCAnbGlua2VkJyBtb2RlIHRvIG1hcCBmcm9tIGNhcmROb2RlIGFsbCB0aGUgd2F5IHRvIGNhcmRWYWx1ZVByb3BlcnR5IChhdCBsZWFzdCBhdXRvbWF0aWNhbGx5KSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy90YW5kZW0vaXNzdWVzLzMwMFxuICAgKi9cbiAgcHVibGljIGdldFBoZXRpb01vdXNlSGl0VGFyZ2V0KCBmcm9tTGlua2luZyA9IGZhbHNlICk6IFBoZXRpb09iamVjdCB8ICdwaGV0aW9Ob3RTZWxlY3RhYmxlJyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcGhldC50YW5kZW0ucGhldGlvRWxlbWVudFNlbGVjdGlvblByb3BlcnR5LnZhbHVlICE9PSAnbm9uZScsICdnZXRQaGV0aW9Nb3VzZUhpdFRhcmdldCBzaG91bGQgbm90IGJlIGNhbGxlZCB3aGVuIHBoZXRpb0VsZW1lbnRTZWxlY3Rpb25Qcm9wZXJ0eSBpcyBub25lJyApO1xuXG4gICAgLy8gRG9uJ3QgZ2V0IGEgbGlua2VkIGVsZW1lbnQgZm9yIGEgbGlua2VkIGVsZW1lbnQgKHJlY3Vyc2l2ZSBsaW5rIGVsZW1lbnQgc2VhcmNoaW5nKVxuICAgIGlmICggIWZyb21MaW5raW5nICYmIHBoZXQudGFuZGVtLnBoZXRpb0VsZW1lbnRTZWxlY3Rpb25Qcm9wZXJ0eS52YWx1ZSA9PT0gJ2xpbmtlZCcgKSB7XG4gICAgICBjb25zdCBsaW5rZWRFbGVtZW50ID0gdGhpcy5nZXRDb3JyZXNwb25kaW5nTGlua2VkRWxlbWVudCgpO1xuICAgICAgaWYgKCBsaW5rZWRFbGVtZW50ICE9PSAnbm9Db3JyZXNwb25kaW5nTGlua2VkRWxlbWVudCcgKSB7XG4gICAgICAgIHJldHVybiBsaW5rZWRFbGVtZW50LmdldFBoZXRpb01vdXNlSGl0VGFyZ2V0KCB0cnVlICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggdGhpcy50YW5kZW0ucGFyZW50VGFuZGVtICkge1xuICAgICAgICAvLyBMb29rIGZvciBhIHNpYmxpbmcgbGlua2VkRWxlbWVudCBpZiB0aGVyZSBhcmUgbm8gY2hpbGQgbGlua2FnZXMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3R1ZGlvL2lzc3Vlcy8yNDYjaXNzdWVjb21tZW50LTEwMTg3MzM0MDhcblxuICAgICAgICBjb25zdCBwYXJlbnQ6IFBoZXRpb09iamVjdCB8IHVuZGVmaW5lZCA9IHBoZXQucGhldGlvLnBoZXRpb0VuZ2luZS5waGV0aW9FbGVtZW50TWFwWyB0aGlzLnRhbmRlbS5wYXJlbnRUYW5kZW0ucGhldGlvSUQgXTtcbiAgICAgICAgaWYgKCBwYXJlbnQgKSB7XG4gICAgICAgICAgY29uc3QgbGlua2VkUGFyZW50RWxlbWVudCA9IHBhcmVudC5nZXRDb3JyZXNwb25kaW5nTGlua2VkRWxlbWVudCgpO1xuICAgICAgICAgIGlmICggbGlua2VkUGFyZW50RWxlbWVudCAhPT0gJ25vQ29ycmVzcG9uZGluZ0xpbmtlZEVsZW1lbnQnICkge1xuICAgICAgICAgICAgcmV0dXJuIGxpbmtlZFBhcmVudEVsZW1lbnQuZ2V0UGhldGlvTW91c2VIaXRUYXJnZXQoIHRydWUgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gT3RoZXJ3aXNlIGZhbGwgYmFjayB0byB0aGUgdmlldyBlbGVtZW50LCBkb24ndCByZXR1cm4gaGVyZVxuICAgIH1cblxuICAgIGlmICggcGhldC50YW5kZW0ucGhldGlvRWxlbWVudFNlbGVjdGlvblByb3BlcnR5LnZhbHVlID09PSAnc3RyaW5nJyApIHtcbiAgICAgIHJldHVybiAncGhldGlvTm90U2VsZWN0YWJsZSc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZ2V0UGhldGlvTW91c2VIaXRUYXJnZXRTZWxmKCk7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lIGlmIHRoaXMgaW5zdGFuY2Ugc2hvdWxkIGJlIHNlbGVjdGFibGVcbiAgICovXG4gIHByb3RlY3RlZCBnZXRQaGV0aW9Nb3VzZUhpdFRhcmdldFNlbGYoKTogUGhldGlvT2JqZWN0IHwgJ3BoZXRpb05vdFNlbGVjdGFibGUnIHtcbiAgICByZXR1cm4gdGhpcy5pc1BoZXRpb01vdXNlSGl0U2VsZWN0YWJsZSgpID8gdGhpcyA6ICdwaGV0aW9Ob3RTZWxlY3RhYmxlJztcbiAgfVxuXG4gIC8qKlxuICAgKiBGYWN0b3JlZCBvdXQgZnVuY3Rpb24gcmV0dXJuaW5nIGlmIHRoaXMgaW5zdGFuY2UgaXMgcGhldGlvIHNlbGVjdGFibGVcbiAgICovXG4gIHByaXZhdGUgaXNQaGV0aW9Nb3VzZUhpdFNlbGVjdGFibGUoKTogYm9vbGVhbiB7XG5cbiAgICAvLyBXZSBhcmUgbm90IHNlbGVjdGFibGUgaWYgd2UgYXJlIHVuZmVhdHVyZWQgYW5kIHdlIGFyZSBvbmx5IGRpc3BsYXlpbmcgZmVhdHVyZWQgZWxlbWVudHMuXG4gICAgLy8gVG8gcHJldmVudCBhIGNpcmN1bGFyIGRlcGVuZGVuY3kuIFdlIG5lZWQgdG8gaGF2ZSBhIFByb3BlcnR5ICh3aGljaCBpcyBhIFBoZXRpb09iamVjdCkgaW4gb3JkZXIgdG8gdXNlIGl0LlxuICAgIC8vIFRoaXMgc2hvdWxkIHJlbWFpbiBhIGhhcmQgZmFpbHVyZSBpZiB3ZSBoYXZlIG5vdCBsb2FkZWQgdGhpcyBkaXNwbGF5IFByb3BlcnR5IGJ5IHRoZSB0aW1lIHdlIHdhbnQgYSBtb3VzZS1oaXQgdGFyZ2V0LlxuICAgIGNvbnN0IGZlYXR1cmVkRmlsdGVyQ29ycmVjdCA9IHBoZXQudGFuZGVtLnBoZXRpb0VsZW1lbnRzRGlzcGxheVByb3BlcnR5LnZhbHVlICE9PSAnZmVhdHVyZWQnIHx8IHRoaXMuaXNEaXNwbGF5ZWRJbkZlYXR1cmVkVHJlZSgpO1xuXG4gICAgcmV0dXJuIHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSAmJiBmZWF0dXJlZEZpbHRlckNvcnJlY3Q7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBmdW5jdGlvbiBkZXRlcm1pbmVzIG5vdCBvbmx5IGlmIHRoaXMgUGhldGlvT2JqZWN0IGlzIHBoZXRpb0ZlYXR1cmVkLCBidXQgaWYgYW55IGRlc2NlbmRhbnQgb2YgdGhpc1xuICAgKiBQaGV0aW9PYmplY3QgaXMgcGhldGlvRmVhdHVyZWQsIHRoaXMgd2lsbCBpbmZsdWVuY2UgaWYgdGhpcyBpbnN0YW5jZSBpcyBkaXNwbGF5ZWQgd2hpbGUgc2hvd2luZyBwaGV0aW9GZWF0dXJlZCxcbiAgICogc2luY2UgZmVhdHVyZWQgY2hpbGRyZW4gd2lsbCBjYXVzZSB0aGUgcGFyZW50IHRvIGJlIGRpc3BsYXllZCBhcyB3ZWxsLlxuICAgKi9cbiAgcHJpdmF0ZSBpc0Rpc3BsYXllZEluRmVhdHVyZWRUcmVlKCk6IGJvb2xlYW4ge1xuICAgIGlmICggdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpICYmIHRoaXMucGhldGlvRmVhdHVyZWQgKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgbGV0IGRpc3BsYXllZCA9IGZhbHNlO1xuICAgIHRoaXMudGFuZGVtLml0ZXJhdGVEZXNjZW5kYW50cyggZGVzY2VuZGFudFRhbmRlbSA9PiB7XG4gICAgICBjb25zdCBwYXJlbnQ6IFBoZXRpb09iamVjdCB8IHVuZGVmaW5lZCA9IHBoZXQucGhldGlvLnBoZXRpb0VuZ2luZS5waGV0aW9FbGVtZW50TWFwWyBkZXNjZW5kYW50VGFuZGVtLnBoZXRpb0lEIF07XG4gICAgICBpZiAoIHBhcmVudCAmJiBwYXJlbnQuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSAmJiBwYXJlbnQucGhldGlvRmVhdHVyZWQgKSB7XG4gICAgICAgIGRpc3BsYXllZCA9IHRydWU7XG4gICAgICB9XG4gICAgfSApO1xuICAgIHJldHVybiBkaXNwbGF5ZWQ7XG4gIH1cblxuICAvKipcbiAgICogQWNxdWlyZSB0aGUgbGlua2VkRWxlbWVudCB0aGF0IG1vc3QgY2xvc2VseSByZWxhdGVzIHRvIHRoaXMgUGhldGlvT2JqZWN0LCBnaXZlbiBzb21lIGhldXJpc3RpY3MuIEZpcnN0LCBpZiB0aGVyZSBpc1xuICAgKiBvbmx5IGEgc2luZ2xlIExpbmtlZEVsZW1lbnQgY2hpbGQsIHVzZSB0aGF0LiBPdGhlcndpc2UsIHNlbGVjdCBoYXJkIGNvZGVkIG5hbWVzIHRoYXQgYXJlIGxpa2VseSB0byBiZSBtb3N0IGltcG9ydGFudC5cbiAgICovXG4gIHB1YmxpYyBnZXRDb3JyZXNwb25kaW5nTGlua2VkRWxlbWVudCgpOiBQaGV0aW9PYmplY3QgfCAnbm9Db3JyZXNwb25kaW5nTGlua2VkRWxlbWVudCcge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gT2JqZWN0LmtleXMoIHRoaXMudGFuZGVtLmNoaWxkcmVuICk7XG4gICAgY29uc3QgbGlua2VkQ2hpbGRyZW46IExpbmtlZEVsZW1lbnRbXSA9IFtdO1xuICAgIGNoaWxkcmVuLmZvckVhY2goIGNoaWxkTmFtZSA9PiB7XG4gICAgICBjb25zdCBjaGlsZFBoZXRpb0lEID0gcGhldGlvLlBoZXRpb0lEVXRpbHMuYXBwZW5kKCB0aGlzLnRhbmRlbS5waGV0aW9JRCwgY2hpbGROYW1lICk7XG5cbiAgICAgIC8vIE5vdGUgdGhhdCBpZiBpdCBkb2Vzbid0IGZpbmQgYSBwaGV0aW9JRCwgdGhhdCBtYXkgYmUgYSBzeW50aGV0aWMgbm9kZSB3aXRoIGNoaWxkcmVuIGJ1dCBub3QgaXRzZWxmIGluc3RydW1lbnRlZC5cbiAgICAgIGNvbnN0IHBoZXRpb09iamVjdDogUGhldGlvT2JqZWN0IHwgdW5kZWZpbmVkID0gcGhldC5waGV0aW8ucGhldGlvRW5naW5lLnBoZXRpb0VsZW1lbnRNYXBbIGNoaWxkUGhldGlvSUQgXTtcbiAgICAgIGlmICggcGhldGlvT2JqZWN0IGluc3RhbmNlb2YgTGlua2VkRWxlbWVudCApIHtcbiAgICAgICAgbGlua2VkQ2hpbGRyZW4ucHVzaCggcGhldGlvT2JqZWN0ICk7XG4gICAgICB9XG4gICAgfSApO1xuICAgIGNvbnN0IGxpbmtlZFRhbmRlbU5hbWVzID0gbGlua2VkQ2hpbGRyZW4ubWFwKCAoIGxpbmtlZEVsZW1lbnQ6IExpbmtlZEVsZW1lbnQgKTogc3RyaW5nID0+IHtcbiAgICAgIHJldHVybiBwaGV0aW8uUGhldGlvSURVdGlscy5nZXRDb21wb25lbnROYW1lKCBsaW5rZWRFbGVtZW50LnBoZXRpb0lEICk7XG4gICAgfSApO1xuICAgIGxldCBsaW5rZWRDaGlsZDogTGlua2VkRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIGlmICggbGlua2VkQ2hpbGRyZW4ubGVuZ3RoID09PSAxICkge1xuICAgICAgbGlua2VkQ2hpbGQgPSBsaW5rZWRDaGlsZHJlblsgMCBdO1xuICAgIH1cbiAgICBlbHNlIGlmICggbGlua2VkVGFuZGVtTmFtZXMuaW5jbHVkZXMoICdwcm9wZXJ0eScgKSApIHtcblxuICAgICAgLy8gUHJpb3JpdGl6ZSBhIGxpbmtlZCBjaGlsZCBuYW1lZCBcInByb3BlcnR5XCJcbiAgICAgIGxpbmtlZENoaWxkID0gbGlua2VkQ2hpbGRyZW5bIGxpbmtlZFRhbmRlbU5hbWVzLmluZGV4T2YoICdwcm9wZXJ0eScgKSBdO1xuICAgIH1cbiAgICBlbHNlIGlmICggbGlua2VkVGFuZGVtTmFtZXMuaW5jbHVkZXMoICd2YWx1ZVByb3BlcnR5JyApICkge1xuXG4gICAgICAvLyBOZXh0IHByaW9yaXRpemUgXCJ2YWx1ZVByb3BlcnR5XCIsIGEgY29tbW9uIG5hbWUgZm9yIHRoZSBjb250cm9sbGluZyBQcm9wZXJ0eSBvZiBhIHZpZXcgY29tcG9uZW50XG4gICAgICBsaW5rZWRDaGlsZCA9IGxpbmtlZENoaWxkcmVuWyBsaW5rZWRUYW5kZW1OYW1lcy5pbmRleE9mKCAndmFsdWVQcm9wZXJ0eScgKSBdO1xuICAgIH1cbiAgICBlbHNlIHtcblxuICAgICAgLy8gRWl0aGVyIHRoZXJlIGFyZSBubyBsaW5rZWQgY2hpbGRyZW4sIG9yIHRvbyBtYW55IHRvIGtub3cgd2hpY2ggb25lIHRvIHNlbGVjdC5cbiAgICAgIHJldHVybiAnbm9Db3JyZXNwb25kaW5nTGlua2VkRWxlbWVudCc7XG4gICAgfVxuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbGlua2VkQ2hpbGQsICdwaGV0aW9FbGVtZW50IGlzIG5lZWRlZCcgKTtcbiAgICByZXR1cm4gbGlua2VkQ2hpbGQuZWxlbWVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgdGhpcyBwaGV0aW9PYmplY3QgZnJvbSBQaEVULWlPLiBBZnRlciBkaXNwb3NhbCwgdGhpcyBvYmplY3QgaXMgbm8gbG9uZ2VyIGludGVyb3BlcmFibGUuIEFsc28gcmVsZWFzZSBhbnlcbiAgICogb3RoZXIgcmVmZXJlbmNlcyBjcmVhdGVkIGR1cmluZyBpdHMgbGlmZXRpbWUuXG4gICAqXG4gICAqIEluIG9yZGVyIHRvIHN1cHBvcnQgdGhlIHN0cnVjdHVyZWQgZGF0YSBzdHJlYW0sIFBoZXRpb09iamVjdHMgbXVzdCBlbmQgdGhlIG1lc3NhZ2VzIGluIHRoZSBjb3JyZWN0XG4gICAqIHNlcXVlbmNlLCB3aXRob3V0IGJlaW5nIGludGVycnVwdGVkIGJ5IGRpc3Bvc2UoKSBjYWxscy4gIFRoZXJlZm9yZSwgd2UgZG8gbm90IGNsZWFyIG91dCBhbnkgb2YgdGhlIHN0YXRlXG4gICAqIHJlbGF0ZWQgdG8gdGhlIGVuZEV2ZW50LiAgTm90ZSB0aGlzIG1lYW5zIGl0IGlzIGFjY2VwdGFibGUgKGFuZCBleHBlY3RlZCkgZm9yIGVuZEV2ZW50KCkgdG8gYmUgY2FsbGVkIG9uXG4gICAqIGRpc3Bvc2VkIFBoZXRpb09iamVjdHMuXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcblxuICAgIC8vIFRoZSBwaGV0aW9FdmVudCBzdGFjayBzaG91bGQgcmVzb2x2ZSBieSB0aGUgbmV4dCBmcmFtZSwgc28gdGhhdCdzIHdoZW4gd2UgY2hlY2sgaXQuXG4gICAgaWYgKCBhc3NlcnQgJiYgVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCAmJiB0aGlzLnRhbmRlbS5zdXBwbGllZCApIHtcblxuICAgICAgY29uc3QgZGVzY2VuZGFudHM6IFBoZXRpb09iamVjdFtdID0gW107XG4gICAgICB0aGlzLnRhbmRlbS5pdGVyYXRlRGVzY2VuZGFudHMoIHRhbmRlbSA9PiB7XG4gICAgICAgIGlmICggcGhldC5waGV0aW8ucGhldGlvRW5naW5lLmhhc1BoZXRpb09iamVjdCggdGFuZGVtLnBoZXRpb0lEICkgKSB7XG4gICAgICAgICAgZGVzY2VuZGFudHMucHVzaCggcGhldC5waGV0aW8ucGhldGlvRW5naW5lLmdldFBoZXRpb0VsZW1lbnQoIHRhbmRlbS5waGV0aW9JRCApICk7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcblxuICAgICAgYW5pbWF0aW9uRnJhbWVUaW1lci5ydW5Pbk5leHRUaWNrKCAoKSA9PiB7XG5cbiAgICAgICAgLy8gVW5pbnN0cnVtZW50ZWQgUGhldGlvT2JqZWN0cyBkb24ndCBoYXZlIGEgcGhldGlvTWVzc2FnZVN0YWNrIGF0dHJpYnV0ZS5cbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuaGFzT3duUHJvcGVydHkoICdwaGV0aW9NZXNzYWdlU3RhY2snICkgfHwgdGhpcy5waGV0aW9NZXNzYWdlU3RhY2subGVuZ3RoID09PSAwLFxuICAgICAgICAgICdwaGV0aW9NZXNzYWdlU3RhY2sgc2hvdWxkIGJlIGNsZWFyJyApO1xuXG4gICAgICAgIGRlc2NlbmRhbnRzLmZvckVhY2goIGRlc2NlbmRhbnQgPT4ge1xuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGRlc2NlbmRhbnQuaXNEaXNwb3NlZCwgYEFsbCBkZXNjZW5kYW50cyBtdXN0IGJlIGRpc3Bvc2VkIGJ5IHRoZSBuZXh0IGZyYW1lOiAke2Rlc2NlbmRhbnQudGFuZGVtLnBoZXRpb0lEfWAgKTtcbiAgICAgICAgfSApO1xuICAgICAgfSApO1xuICAgIH1cblxuICAgIGlmICggRU5BQkxFX0RFU0NSSVBUSU9OX1JFR0lTVFJZICYmIHRoaXMudGFuZGVtICYmIHRoaXMudGFuZGVtLnN1cHBsaWVkICkge1xuICAgICAgRGVzY3JpcHRpb25SZWdpc3RyeS5yZW1vdmUoIHRoaXMgKTtcbiAgICB9XG5cbiAgICAvLyBEZXRhY2ggZnJvbSBsaXN0ZW5lcnMgYW5kIGRpc3Bvc2UgdGhlIGNvcnJlc3BvbmRpbmcgdGFuZGVtLiBUaGlzIG11c3QgaGFwcGVuIGluIFBoRVQtaU8gYnJhbmQgYW5kIFBoRVQgYnJhbmRcbiAgICAvLyBiZWNhdXNlIGluIFBoRVQgYnJhbmQsIFBoZXRpb0R5bmFtaWNFbGVtZW50Q29udGFpbmVyIGR5bmFtaWMgZWxlbWVudHMgd291bGQgbWVtb3J5IGxlYWsgdGFuZGVtcyAocGFyZW50IHRhbmRlbXNcbiAgICAvLyB3b3VsZCByZXRhaW4gcmVmZXJlbmNlcyB0byB0aGVpciBjaGlsZHJlbikuXG4gICAgdGhpcy50YW5kZW0ucmVtb3ZlUGhldGlvT2JqZWN0KCB0aGlzICk7XG5cbiAgICAvLyBEaXNwb3NlIExpbmtlZEVsZW1lbnRzXG4gICAgaWYgKCB0aGlzLmxpbmtlZEVsZW1lbnRzICkge1xuICAgICAgdGhpcy5saW5rZWRFbGVtZW50cy5mb3JFYWNoKCBsaW5rZWRFbGVtZW50ID0+IGxpbmtlZEVsZW1lbnQuZGlzcG9zZSgpICk7XG4gICAgICB0aGlzLmxpbmtlZEVsZW1lbnRzLmxlbmd0aCA9IDA7XG4gICAgfVxuXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEpTT05pZmlhYmxlIG1ldGFkYXRhIHRoYXQgZGVzY3JpYmVzIHRoZSBuYXR1cmUgb2YgdGhlIFBoZXRpb09iamVjdC4gIFdlIG11c3QgYmUgYWJsZSB0byByZWFkIHRoaXNcbiAgICogZm9yIGJhc2VsaW5lIChiZWZvcmUgb2JqZWN0IGZ1bGx5IGNvbnN0cnVjdGVkIHdlIHVzZSBvYmplY3QpIGFuZCBhZnRlciBmdWxseSBjb25zdHJ1Y3RlZFxuICAgKiB3aGljaCBpbmNsdWRlcyBvdmVycmlkZXMuXG4gICAqIEBwYXJhbSBbb2JqZWN0XSAtIHVzZWQgdG8gZ2V0IG1ldGFkYXRhIGtleXMsIGNhbiBiZSBhIFBoZXRpb09iamVjdCwgb3IgYW4gb3B0aW9ucyBvYmplY3RcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgIChzZWUgdXNhZ2UgaW5pdGlhbGl6ZVBoZXRpb09iamVjdCkuIElmIG5vdCBwcm92aWRlZCwgd2lsbCBpbnN0ZWFkIHVzZSB0aGUgdmFsdWUgb2YgXCJ0aGlzXCJcbiAgICogQHJldHVybnMgLSBtZXRhZGF0YSBwbHVja2VkIGZyb20gdGhlIHBhc3NlZCBpbiBwYXJhbWV0ZXJcbiAgICovXG4gIHB1YmxpYyBnZXRNZXRhZGF0YSggb2JqZWN0PzogUGhldGlvT2JqZWN0TWV0YWRhdGFJbnB1dCApOiBQaGV0aW9FbGVtZW50TWV0YWRhdGEge1xuICAgIG9iamVjdCA9IG9iamVjdCB8fCB0aGlzO1xuICAgIGNvbnN0IG1ldGFkYXRhOiBQaGV0aW9FbGVtZW50TWV0YWRhdGEgPSB7XG4gICAgICBwaGV0aW9UeXBlTmFtZTogb2JqZWN0LnBoZXRpb1R5cGUudHlwZU5hbWUsXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiBvYmplY3QucGhldGlvRG9jdW1lbnRhdGlvbixcbiAgICAgIHBoZXRpb1N0YXRlOiBvYmplY3QucGhldGlvU3RhdGUsXG4gICAgICBwaGV0aW9SZWFkT25seTogb2JqZWN0LnBoZXRpb1JlYWRPbmx5LFxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUucGhldGlvVHlwZS50b1N0YXRlT2JqZWN0KCBvYmplY3QucGhldGlvRXZlbnRUeXBlICksXG4gICAgICBwaGV0aW9IaWdoRnJlcXVlbmN5OiBvYmplY3QucGhldGlvSGlnaEZyZXF1ZW5jeSxcbiAgICAgIHBoZXRpb1BsYXliYWNrOiBvYmplY3QucGhldGlvUGxheWJhY2ssXG4gICAgICBwaGV0aW9EeW5hbWljRWxlbWVudDogb2JqZWN0LnBoZXRpb0R5bmFtaWNFbGVtZW50LFxuICAgICAgcGhldGlvSXNBcmNoZXR5cGU6IG9iamVjdC5waGV0aW9Jc0FyY2hldHlwZSxcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiBvYmplY3QucGhldGlvRmVhdHVyZWQsXG4gICAgICBwaGV0aW9EZXNpZ25lZDogb2JqZWN0LnBoZXRpb0Rlc2lnbmVkXG4gICAgfTtcbiAgICBpZiAoIG9iamVjdC5waGV0aW9BcmNoZXR5cGVQaGV0aW9JRCApIHtcblxuICAgICAgbWV0YWRhdGEucGhldGlvQXJjaGV0eXBlUGhldGlvSUQgPSBvYmplY3QucGhldGlvQXJjaGV0eXBlUGhldGlvSUQ7XG4gICAgfVxuICAgIHJldHVybiBtZXRhZGF0YTtcbiAgfVxuXG4gIC8vIFB1YmxpYyBmYWNpbmcgZG9jdW1lbnRhdGlvbiwgbm8gbmVlZCB0byBpbmNsdWRlIG1ldGFkYXRhIHRoYXQgbWF5IHdlIGRvbid0IHdhbnQgY2xpZW50cyBrbm93aW5nIGFib3V0XG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgTUVUQURBVEFfRE9DVU1FTlRBVElPTiA9ICdHZXQgbWV0YWRhdGEgYWJvdXQgdGhlIFBoRVQtaU8gRWxlbWVudC4gVGhpcyBpbmNsdWRlcyB0aGUgZm9sbG93aW5nIGtleXM6PHVsPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGxpPjxzdHJvbmc+cGhldGlvVHlwZU5hbWU6PC9zdHJvbmc+IFRoZSBuYW1lIG9mIHRoZSBQaEVULWlPIFR5cGVcXG48L2xpPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGxpPjxzdHJvbmc+cGhldGlvRG9jdW1lbnRhdGlvbjo8L3N0cm9uZz4gZGVmYXVsdCAtIG51bGwuIFVzZWZ1bCBub3RlcyBhYm91dCBhIFBoRVQtaU8gRWxlbWVudCwgc2hvd24gaW4gdGhlIFBoRVQtaU8gU3R1ZGlvIFdyYXBwZXI8L2xpPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGxpPjxzdHJvbmc+cGhldGlvU3RhdGU6PC9zdHJvbmc+IGRlZmF1bHQgLSB0cnVlLiBXaGVuIHRydWUsIGluY2x1ZGVzIHRoZSBQaEVULWlPIEVsZW1lbnQgaW4gdGhlIFBoRVQtaU8gc3RhdGVcXG48L2xpPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGxpPjxzdHJvbmc+cGhldGlvUmVhZE9ubHk6PC9zdHJvbmc+IGRlZmF1bHQgLSBmYWxzZS4gV2hlbiB0cnVlLCB5b3UgY2FuIG9ubHkgZ2V0IHZhbHVlcyBmcm9tIHRoZSBQaEVULWlPIEVsZW1lbnQ7IG5vIHNldHRpbmcgYWxsb3dlZC5cXG48L2xpPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGxpPjxzdHJvbmc+cGhldGlvRXZlbnRUeXBlOjwvc3Ryb25nPiBkZWZhdWx0IC0gTU9ERUwuIFRoZSBjYXRlZ29yeSBvZiBldmVudCB0aGF0IHRoaXMgZWxlbWVudCBlbWl0cyB0byB0aGUgUGhFVC1pTyBEYXRhIFN0cmVhbS5cXG48L2xpPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGxpPjxzdHJvbmc+cGhldGlvRHluYW1pY0VsZW1lbnQ6PC9zdHJvbmc+IGRlZmF1bHQgLSBmYWxzZS4gSWYgdGhpcyBlbGVtZW50IGlzIGEgXCJkeW5hbWljIGVsZW1lbnRcIiB0aGF0IGNhbiBiZSBjcmVhdGVkIGFuZCBkZXN0cm95ZWQgdGhyb3VnaG91dCB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbSAoYXMgb3Bwb3NlZCB0byBleGlzdGluZyBmb3JldmVyKS5cXG48L2xpPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGxpPjxzdHJvbmc+cGhldGlvSXNBcmNoZXR5cGU6PC9zdHJvbmc+IGRlZmF1bHQgLSBmYWxzZS4gSWYgdGhpcyBlbGVtZW50IGlzIGFuIGFyY2hldHlwZSBmb3IgYSBkeW5hbWljIGVsZW1lbnQuXFxuPC9saT4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxsaT48c3Ryb25nPnBoZXRpb0ZlYXR1cmVkOjwvc3Ryb25nPiBkZWZhdWx0IC0gZmFsc2UuIElmIHRoaXMgaXMgYSBmZWF0dXJlZCBQaEVULWlPIEVsZW1lbnQuXFxuPC9saT4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxsaT48c3Ryb25nPnBoZXRpb0FyY2hldHlwZVBoZXRpb0lEOjwvc3Ryb25nPiBkZWZhdWx0IC0gXFwnXFwnLiBJZiBhbiBhcHBsaWNhYmxlIGR5bmFtaWMgZWxlbWVudCwgdGhpcyBpcyB0aGUgcGhldGlvSUQgb2YgaXRzIGFyY2hldHlwZS5cXG48L2xpPjwvdWw+JztcblxuXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlKCBvcHRpb25zPzogUGhldGlvT2JqZWN0T3B0aW9ucyApOiBQaGV0aW9PYmplY3Qge1xuICAgIHJldHVybiBuZXcgUGhldGlvT2JqZWN0KCBvcHRpb25zICk7XG4gIH1cbn1cblxuLy8gU2VlIGRvY3VtZW50YXRpb24gZm9yIGFkZExpbmtlZEVsZW1lbnQoKSB0byBkZXNjcmliZSBob3cgdG8gaW5zdHJ1bWVudCBMaW5rZWRFbGVtZW50cy4gTm8gb3RoZXIgbWV0YWRhdGEgaXMgbmVlZGVkXG4vLyBmb3IgTGlua2VkRWxlbWVudHMsIGFuZCBzaG91bGQgaW5zdGVhZCBiZSBwcm92aWRlZCB0byB0aGUgY29yZUVsZW1lbnQuIElmIHlvdSBmaW5kIGEgY2FzZSB3aGVyZSB5b3Ugd2FudCB0byBwYXNzXG4vLyBhbm90aGVyIG9wdGlvbiB0aHJvdWdoLCBwbGVhc2UgZGlzY3VzcyB3aXRoIHlvdXIgZnJpZW5kbHksIG5laWdoYm9yaG9vZCBQaEVULWlPIGRldmVsb3Blci5cbnR5cGUgTGlua2VkRWxlbWVudE9wdGlvbnMgPSAoIHsgdGFuZGVtTmFtZT86IHN0cmluZzsgdGFuZGVtPzogbmV2ZXIgfSB8IHsgdGFuZGVtTmFtZT86IG5ldmVyOyB0YW5kZW0/OiBUYW5kZW0gfSApO1xuXG4vKipcbiAqIEludGVybmFsIGNsYXNzIHRvIGF2b2lkIGN5Y2xpYyBkZXBlbmRlbmNpZXMuXG4gKi9cbmNsYXNzIExpbmtlZEVsZW1lbnQgZXh0ZW5kcyBQaGV0aW9PYmplY3Qge1xuICBwdWJsaWMgcmVhZG9ubHkgZWxlbWVudDogUGhldGlvT2JqZWN0O1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggY29yZUVsZW1lbnQ6IFBoZXRpb09iamVjdCwgcHJvdmlkZWRPcHRpb25zPzogTGlua2VkRWxlbWVudE9wdGlvbnMgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggISFjb3JlRWxlbWVudCwgJ2NvcmVFbGVtZW50IHNob3VsZCBiZSBkZWZpbmVkJyApO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxMaW5rZWRFbGVtZW50T3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucywgUGhldGlvT2JqZWN0T3B0aW9ucz4oKSgge1xuICAgICAgcGhldGlvVHlwZTogTGlua2VkRWxlbWVudElPLFxuICAgICAgcGhldGlvU3RhdGU6IHRydWUsXG5cbiAgICAgIC8vIEJ5IGRlZmF1bHQsIExpbmtlZEVsZW1lbnRzIGFyZSBhcyBmZWF0dXJlZCBhcyB0aGVpciBjb3JlRWxlbWVudHMgYXJlLlxuICAgICAgcGhldGlvRmVhdHVyZWQ6IGNvcmVFbGVtZW50LnBoZXRpb0ZlYXR1cmVkXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAvLyBSZWZlcmVuY2VzIGNhbm5vdCBiZSBjaGFuZ2VkIGJ5IFBoRVQtaU9cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggJ3BoZXRpb1JlYWRPbmx5JyApLCAncGhldGlvUmVhZE9ubHkgc2V0IGJ5IExpbmtlZEVsZW1lbnQnICk7XG4gICAgb3B0aW9ucy5waGV0aW9SZWFkT25seSA9IHRydWU7XG5cbiAgICBzdXBlciggb3B0aW9ucyApO1xuXG4gICAgdGhpcy5lbGVtZW50ID0gY29yZUVsZW1lbnQ7XG4gIH1cbn1cblxudGFuZGVtTmFtZXNwYWNlLnJlZ2lzdGVyKCAnUGhldGlvT2JqZWN0JywgUGhldGlvT2JqZWN0ICk7XG5leHBvcnQgeyBQaGV0aW9PYmplY3QgYXMgZGVmYXVsdCwgTGlua2VkRWxlbWVudCB9OyJdLCJuYW1lcyI6WyJ3aW5kb3ciLCJhbmltYXRpb25GcmFtZVRpbWVyIiwiRGlzcG9zYWJsZSIsInZhbGlkYXRlIiwiYXJyYXlSZW1vdmUiLCJhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMiLCJtZXJnZSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiRGVzY3JpcHRpb25SZWdpc3RyeSIsIkV2ZW50VHlwZSIsIkxpbmtlZEVsZW1lbnRJTyIsInBoZXRpb0FQSVZhbGlkYXRpb24iLCJUYW5kZW0iLCJUYW5kZW1Db25zdGFudHMiLCJ0YW5kZW1OYW1lc3BhY2UiLCJJT1R5cGUiLCJQSEVUX0lPX0VOQUJMRUQiLCJJT19UWVBFX1ZBTElEQVRPUiIsInZhbHVlVHlwZSIsInZhbGlkYXRpb25NZXNzYWdlIiwiQk9PTEVBTl9WQUxJREFUT1IiLCJQSEVUX0lPX0RPQ1VNRU5UQVRJT05fVkFMSURBVE9SIiwiaXNWYWxpZFZhbHVlIiwiZG9jIiwiaW5jbHVkZXMiLCJQSEVUX0lPX0VWRU5UX1RZUEVfVkFMSURBVE9SIiwiT0JKRUNUX1ZBTElEQVRPUiIsIk9iamVjdCIsIm9iamVjdFRvUGhldGlvSUQiLCJwaGV0aW9PYmplY3QiLCJ0YW5kZW0iLCJwaGV0aW9JRCIsIlNLSVBQSU5HX01FU1NBR0UiLCJFTkFCTEVfREVTQ1JJUFRJT05fUkVHSVNUUlkiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsInN1cHBvcnRzRGVzY3JpcHRpb25QbHVnaW4iLCJERUZBVUxUUyIsIk9QVElPTkFMIiwiZGVzY3JpcHRpb25UYW5kZW0iLCJwaGV0aW9UeXBlIiwiT2JqZWN0SU8iLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiUEhFVF9JT19PQkpFQ1RfTUVUQURBVEFfREVGQVVMVFMiLCJwaGV0aW9TdGF0ZSIsInBoZXRpb1JlYWRPbmx5IiwicGhldGlvRXZlbnRUeXBlIiwiTU9ERUwiLCJwaGV0aW9IaWdoRnJlcXVlbmN5IiwicGhldGlvUGxheWJhY2siLCJwaGV0aW9GZWF0dXJlZCIsInBoZXRpb0R5bmFtaWNFbGVtZW50IiwicGhldGlvRGVzaWduZWQiLCJwaGV0aW9FdmVudE1ldGFkYXRhIiwidGFuZGVtTmFtZVN1ZmZpeCIsImFzc2VydCIsInRvU3RhdGVPYmplY3QiLCJQaGV0aW9PYmplY3QiLCJpbml0aWFsaXplUGhldGlvT2JqZWN0IiwiYmFzZU9wdGlvbnMiLCJwcm92aWRlZE9wdGlvbnMiLCJoYXNPd25Qcm9wZXJ0eSIsImluaXRpYWxpemVEaXNwb3NhYmxlIiwib25NaXNzaW5nVGFuZGVtIiwiVkFMSURBVElPTiIsInJlcXVpcmVkIiwic3VwcGxpZWQiLCJhZGQiLCJwaGV0aW9PYmplY3RJbml0aWFsaXplZCIsImRlZmF1bHRzIiwib3B0aW9ucyIsImxpbmtlZEVsZW1lbnRzIiwicGhldGlvSXNBcmNoZXR5cGUiLCJwaGV0aW9CYXNlbGluZU1ldGFkYXRhIiwiZW5hYmxlZCIsInByZWxvYWRzIiwicGhldGlvIiwicGhldGlvRW1pdEFQSUJhc2VsaW5lIiwiZ2V0TWV0YWRhdGEiLCJwaGV0aW9BcmNoZXR5cGVQaGV0aW9JRCIsImFyY2hldHlwYWxQaGV0aW9JRCIsImdldEFyY2hldHlwYWxQaGV0aW9JRCIsInBoZXRpb0VsZW1lbnRzT3ZlcnJpZGVzIiwib3ZlcnJpZGVzIiwiX3BoZXRpb1R5cGUiLCJfcGhldGlvU3RhdGUiLCJfcGhldGlvUmVhZE9ubHkiLCJfcGhldGlvRG9jdW1lbnRhdGlvbiIsIl9waGV0aW9FdmVudFR5cGUiLCJfcGhldGlvSGlnaEZyZXF1ZW5jeSIsIl9waGV0aW9QbGF5YmFjayIsIl9waGV0aW9EeW5hbWljRWxlbWVudCIsIl9waGV0aW9GZWF0dXJlZCIsIl9waGV0aW9FdmVudE1ldGFkYXRhIiwiX3BoZXRpb0Rlc2lnbmVkIiwicGhldGlvTm90aWZpZWRPYmplY3RDcmVhdGVkIiwicGhldGlvTWVzc2FnZVN0YWNrIiwicGxheWJhY2siLCJhZGRQaGV0aW9PYmplY3QiLCJpc1BoZXRpb0luc3RydW1lbnRlZCIsInN1ZmZpeEFycmF5IiwiQXJyYXkiLCJpc0FycmF5IiwibWF0Y2hlcyIsImZpbHRlciIsInN1ZmZpeCIsIm5hbWUiLCJlbmRzV2l0aCIsInN3YXBDYXNlT2ZGaXJzdENoYXJhY3RlciIsImxlbmd0aCIsImpvaW4iLCJzdHJpbmciLCJmaXJzdENoYXIiLCJuZXdGaXJzdENoYXIiLCJ0b0xvd2VyQ2FzZSIsInRvVXBwZXJDYXNlIiwic3Vic3RyaW5nIiwicGhldGlvU3RhcnRFdmVudCIsImV2ZW50IiwiZGF0YSIsImdldERhdGEiLCJhcmd1bWVudHMiLCJfIiwiaGFzSW4iLCJwdXNoIiwic2tpcEhpZ2hGcmVxdWVuY3lFdmVudCIsInBoZXRpb0VtaXRIaWdoRnJlcXVlbmN5RXZlbnRzIiwiZGF0YVN0cmVhbSIsImlzRW1pdHRpbmdMb3dGcmVxdWVuY3lFdmVudCIsInNraXBGcm9tVW5kZWZpbmVkRGF0YXN0cmVhbSIsIk9QVF9PVVQiLCJzdGFydCIsInB1c2hOb25QbGF5YmFja2FibGUiLCJwaGV0aW9FbmRFdmVudCIsImFzc2VydENvcnJlY3RJbmRpY2VzIiwidG9wTWVzc2FnZUluZGV4IiwicG9wIiwicG9wTm9uUGxheWJhY2thYmxlIiwiZW5kIiwicHJvcGFnYXRlRHluYW1pY0ZsYWdzVG9EZXNjZW5kYW50cyIsInBoZXRpb0VuZ2luZSIsInVubGF1bmNoZWRQaGV0aW9JRHMiLCJsYXVuY2hlZCIsImJ1ZmZlcmVkUGhldGlvT2JqZWN0cyIsIm1hcCIsIml0ZXJhdGVEZXNjZW5kYW50cyIsImhhc1BoZXRpb09iamVjdCIsImdldFBoZXRpb0VsZW1lbnQiLCJpbmRleE9mIiwic2V0UGhldGlvRHluYW1pY0VsZW1lbnQiLCJtYXJrRHluYW1pY0VsZW1lbnRBcmNoZXR5cGUiLCJhZGRMaW5rZWRFbGVtZW50IiwiZWxlbWVudCIsInRhbmRlbU5hbWUiLCJjcmVhdGVUYW5kZW0iLCJMaW5rZWRFbGVtZW50IiwicmVtb3ZlTGlua2VkRWxlbWVudHMiLCJwb3RlbnRpYWxseUxpbmtlZEVsZW1lbnQiLCJ0b1JlbW92ZSIsImxpbmtlZEVsZW1lbnQiLCJmb3JFYWNoIiwiZGlzcG9zZSIsIm9uU2ltdWxhdGlvbkNvbnN0cnVjdGlvbkNvbXBsZXRlZCIsImdldFBoZXRpb01vdXNlSGl0VGFyZ2V0IiwiZnJvbUxpbmtpbmciLCJwaGV0aW9FbGVtZW50U2VsZWN0aW9uUHJvcGVydHkiLCJ2YWx1ZSIsImdldENvcnJlc3BvbmRpbmdMaW5rZWRFbGVtZW50IiwicGFyZW50VGFuZGVtIiwicGFyZW50IiwicGhldGlvRWxlbWVudE1hcCIsImxpbmtlZFBhcmVudEVsZW1lbnQiLCJnZXRQaGV0aW9Nb3VzZUhpdFRhcmdldFNlbGYiLCJpc1BoZXRpb01vdXNlSGl0U2VsZWN0YWJsZSIsImZlYXR1cmVkRmlsdGVyQ29ycmVjdCIsInBoZXRpb0VsZW1lbnRzRGlzcGxheVByb3BlcnR5IiwiaXNEaXNwbGF5ZWRJbkZlYXR1cmVkVHJlZSIsImRpc3BsYXllZCIsImRlc2NlbmRhbnRUYW5kZW0iLCJjaGlsZHJlbiIsImtleXMiLCJsaW5rZWRDaGlsZHJlbiIsImNoaWxkTmFtZSIsImNoaWxkUGhldGlvSUQiLCJQaGV0aW9JRFV0aWxzIiwiYXBwZW5kIiwibGlua2VkVGFuZGVtTmFtZXMiLCJnZXRDb21wb25lbnROYW1lIiwibGlua2VkQ2hpbGQiLCJkZXNjZW5kYW50cyIsInJ1bk9uTmV4dFRpY2siLCJkZXNjZW5kYW50IiwiaXNEaXNwb3NlZCIsInJlbW92ZSIsInJlbW92ZVBoZXRpb09iamVjdCIsIm9iamVjdCIsIm1ldGFkYXRhIiwicGhldGlvVHlwZU5hbWUiLCJ0eXBlTmFtZSIsImNyZWF0ZSIsIkRFRkFVTFRfT1BUSU9OUyIsIk1FVEFEQVRBX0RPQ1VNRU5UQVRJT04iLCJjb3JlRWxlbWVudCIsInJlZ2lzdGVyIiwiZGVmYXVsdCJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7O0NBVUMsT0FnRHFDQSxzQ0FBQUEsc0JBQUFBO0FBOUN0QyxPQUFPQyx5QkFBeUIsdUNBQXVDO0FBQ3ZFLE9BQU9DLGdCQUF1Qyw4QkFBOEI7QUFDNUUsT0FBT0MsY0FBYyw0QkFBNEI7QUFDakQsT0FBT0MsaUJBQWlCLG9DQUFvQztBQUM1RCxPQUFPQyxvQ0FBb0MsdURBQXVEO0FBQ2xHLE9BQU9DLFdBQVcsOEJBQThCO0FBQ2hELE9BQU9DLGFBQWFDLGNBQWMsUUFBNkMsa0NBQWtDO0FBR2pILE9BQU9DLHlCQUF5QiwyQkFBMkI7QUFDM0QsT0FBT0MsZUFBZSxpQkFBaUI7QUFDdkMsT0FBT0MscUJBQXFCLHVCQUF1QjtBQUVuRCxPQUFPQyx5QkFBeUIsMkJBQTJCO0FBQzNELE9BQU9DLFlBQVksY0FBYztBQUNqQyxPQUFPQyxxQkFBcUIsdUJBQXVCO0FBQ25ELE9BQU9DLHFCQUFxQix1QkFBdUI7QUFDbkQsT0FBT0Ms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