// Copyright 2015-2024, University of Colorado Boulder
/**
 * Tandem defines a set of trees that are used to assign unique identifiers to PhetioObjects in PhET simulations and
 * notify listeners when the associated PhetioObjects have been added/removed. It is used to support PhET-iO.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import arrayRemove from '../../phet-core/js/arrayRemove.js';
import merge from '../../phet-core/js/merge.js';
import optionize from '../../phet-core/js/optionize.js';
import TandemConstants from './TandemConstants.js';
import tandemNamespace from './tandemNamespace.js';
// constants
// Tandem can't depend on joist, so cannot use packageJSON module
const packageJSON = _.hasIn(window, 'phet.chipper.packageObject') ? phet.chipper.packageObject : {
    name: 'placeholder'
};
const PHET_IO_ENABLED = _.hasIn(window, 'phet.preloads.phetio');
const PRINT_MISSING_TANDEMS = PHET_IO_ENABLED && phet.preloads.phetio.queryParameters.phetioPrintMissingTandems;
// Validation defaults to true, but can be overridden to be false in package.json.
const IS_VALIDATION_DEFAULT = _.hasIn(packageJSON, 'phet.phet-io.validation') ? !!packageJSON.phet['phet-io'].validation : true;
// The default value for validation can be overridden with a query parameter ?phetioValidation={true|false}.
const IS_VALIDATION_QUERY_PARAMETER_SPECIFIED = window.QueryStringMachine && QueryStringMachine.containsKey('phetioValidation');
const IS_VALIDATION_SPECIFIED = PHET_IO_ENABLED && IS_VALIDATION_QUERY_PARAMETER_SPECIFIED ? !!phet.preloads.phetio.queryParameters.phetioValidation : PHET_IO_ENABLED && IS_VALIDATION_DEFAULT;
const VALIDATION = PHET_IO_ENABLED && IS_VALIDATION_SPECIFIED && !PRINT_MISSING_TANDEMS;
const UNALLOWED_TANDEM_NAMES = [
    'pickableProperty',
    // in https://github.com/phetsims/phet-io/issues/1915 we decided to prefer the scenery listener types
    // ('dragListener' etc). If you encounter this and feel like inputListener is preferable, let's discuss!
    'inputListener',
    'dragHandler' // prefer dragListener
];
const REQUIRED_TANDEM_NAME = 'requiredTandem';
const OPTIONAL_TANDEM_NAME = 'optionalTandem';
const FORBIDDEN_SUPPLIED_TANDEM_NAMES = [
    REQUIRED_TANDEM_NAME,
    OPTIONAL_TANDEM_NAME
];
const TEST_TANDEM_NAME = 'test';
const INTER_TERM_SEPARATOR = phetio.PhetioIDUtils.INTER_TERM_SEPARATOR;
export const DYNAMIC_ARCHETYPE_NAME = phetio.PhetioIDUtils.ARCHETYPE;
// used to keep track of missing tandems
const missingTandems = {
    required: [],
    optional: []
};
// Listeners that will be notified when items are registered/deregistered. See doc in addPhetioObjectListener
const phetioObjectListeners = [];
// keep track of listeners to fire when Tandem.launch() is called.
const launchListeners = [];
let Tandem = class Tandem {
    // Get the regex to test for a valid tandem name, given the char class for your specific tandem. In the regex
    // language. In this function we will wrap it in `[]+` brackets forming the actual "class".
    static getRegexFromCharacterClass(tandemCharacterClass = TandemConstants.BASE_TANDEM_CHARACTER_CLASS) {
        return new RegExp(`^[${tandemCharacterClass}]+$`);
    }
    /**
   * If the provided tandem is not supplied, support the ?printMissingTandems query parameter for extra logging during
   * initial instrumentation.
   */ static onMissingTandem(tandem) {
        // When the query parameter phetioPrintMissingTandems is true, report tandems that are required but not supplied
        if (PRINT_MISSING_TANDEMS && !tandem.supplied) {
            const stackTrace = Tandem.captureStackTrace();
            if (tandem.required) {
                missingTandems.required.push({
                    phetioID: tandem.phetioID,
                    stack: stackTrace
                });
            } else {
                // When the query parameter phetioPrintMissingTandems is true, report tandems that are optional but not
                // supplied, but not for Fonts because they are too numerous.
                if (!stackTrace.includes('Font')) {
                    missingTandems.optional.push({
                        phetioID: tandem.phetioID,
                        stack: stackTrace
                    });
                }
            }
        }
    }
    /**
   * Get a stack trace from a new instance of an Error(). This also uses window.Error.stackTraceLimit to expand the
   * length of the stack trace. This can be useful in spots where the stack is the only information we have about
   * where we are in common code (like for knowing where to provide a Tandem  for PhET-iO instrumentation).
   * @param limit - set to Error.stackTraceLimit just for a single stack trace, then return to the previous value after.
   */ static captureStackTrace(limit = Infinity) {
        // Check if Error.stackTraceLimit exists and is writable
        const descriptor = Object.getOwnPropertyDescriptor(Error, 'stackTraceLimit');
        const stackTraceWritable = descriptor && (descriptor.writable || descriptor.set && typeof descriptor.set === 'function');
        if (stackTraceWritable) {
            // Save the original stackTraceLimit before changing it
            // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
            // @ts-ignore
            const originalStackTraceLimit = Error.stackTraceLimit;
            // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
            // @ts-ignore
            Error.stackTraceLimit = limit;
            const stackTrace = new Error().stack;
            // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
            // @ts-ignore
            Error.stackTraceLimit = originalStackTraceLimit;
            return stackTrace;
        } else {
            return new Error().stack;
        }
    }
    /**
   * Adds a PhetioObject.  For example, it could be an axon Property, SCENERY/Node or SUN/RoundPushButton.
   * phetioEngine listens for when PhetioObjects are added and removed to keep track of them for PhET-iO.
   */ addPhetioObject(phetioObject) {
        if (PHET_IO_ENABLED) {
            // Throw an error if the tandem is required but not supplied
            assert && Tandem.VALIDATION && assert(!(this.required && !this.supplied), 'Tandem was required but not supplied');
            // If tandem is optional and not supplied, then ignore it.
            if (!this.required && !this.supplied) {
                // Optionally instrumented types without tandems are not added.
                return;
            }
            if (!Tandem.launched) {
                Tandem.bufferedPhetioObjects.push(phetioObject);
            } else {
                for(let i = 0; i < phetioObjectListeners.length; i++){
                    phetioObjectListeners[i].addPhetioObject(phetioObject);
                }
            }
        }
    }
    /**
   * Returns true if this Tandem has the specified ancestor Tandem.
   */ hasAncestor(ancestor) {
        return this.parentTandem === ancestor || !!(this.parentTandem && this.parentTandem.hasAncestor(ancestor));
    }
    /**
   * Removes a PhetioObject and signifies to listeners that it has been removed.
   */ removePhetioObject(phetioObject) {
        // No need to handle this case for uninstrumented objects being removed
        if (!this.supplied) {
            return;
        }
        // Only active when running as phet-io
        if (PHET_IO_ENABLED) {
            if (!Tandem.launched) {
                assert && assert(Tandem.bufferedPhetioObjects.includes(phetioObject), 'should contain item');
                arrayRemove(Tandem.bufferedPhetioObjects, phetioObject);
            } else {
                for(let i = 0; i < phetioObjectListeners.length; i++){
                    phetioObjectListeners[i].removePhetioObject(phetioObject);
                }
            }
        }
        phetioObject.tandem.dispose();
    }
    /**
   * Used for creating new tandems, extends this Tandem's options with the passed-in options.
   */ getExtendedOptions(options) {
        // Any child of something should be passed all inherited options. Make sure that this extend call includes all
        // that make sense from the constructor's extend call.
        return merge({
            supplied: this.supplied,
            required: this.required
        }, options);
    }
    /**
   * Create a new Tandem by appending the given id, or if the child Tandem already exists, return it instead.
   */ createTandem(name, options) {
        assert && Tandem.VALIDATION && assert(!UNALLOWED_TANDEM_NAMES.includes(name), 'tandem name is not allowed: ' + name);
        options = this.getExtendedOptions(options);
        // re-use the child if it already exists, but make sure it behaves the same.
        if (this.hasChild(name)) {
            const currentChild = this.children[name];
            assert && assert(currentChild.required === options.required);
            assert && assert(currentChild.supplied === options.supplied);
            return currentChild;
        } else {
            return new Tandem(this, name, options); // eslint-disable-line phet/bad-sim-text
        }
    }
    /**
   * Create a new Tandem by indexing with the specified index.  Note that it increments by 1 so that index 0 is
   * "1" in the tandem name.
   * For example:
   * - createTandem( 'foo', 0 ) => 'foo1'
   */ createTandem1Indexed(name, index, options) {
        return this.createTandem(`${name}${index + 1}`, options);
    }
    hasChild(name) {
        return this.children.hasOwnProperty(name);
    }
    addChild(name, tandem) {
        assert && assert(!this.hasChild(name));
        this.children[name] = tandem;
    }
    /**
   * Fire a callback on all descendants of this Tandem
   */ iterateDescendants(callback) {
        for(const childName in this.children){
            if (this.children.hasOwnProperty(childName)) {
                callback(this.children[childName]);
                this.children[childName].iterateDescendants(callback);
            }
        }
    }
    removeChild(childName) {
        assert && assert(this.hasChild(childName));
        delete this.children[childName];
    }
    dispose() {
        assert && assert(!this.isDisposed, 'already disposed');
        this.parentTandem.removeChild(this.name);
        this.parentTandem = null;
        this.isDisposed = true;
    }
    /**
   * For API validation, each PhetioObject has a corresponding archetype PhetioObject for comparison. Non-dynamic
   * PhetioObjects have the trivial case where its archetypal phetioID is the same as its phetioID.
   */ getArchetypalPhetioID() {
        return window.phetio.PhetioIDUtils.getArchetypalPhetioID(this.phetioID);
    }
    /**
   * Creates a group tandem for creating multiple indexed child tandems, such as:
   * sim.screen.model.electron0
   * sim.screen.model.electron1
   *
   * In this case, 'sim.screen.model.electron' is the string passed to createGroupTandem.
   *
   * Used for arrays, observable arrays, or when many elements of the same type are created and they do not otherwise
   * have unique identifiers.
   */ createGroupTandem(name) {
        if (this.children[name]) {
            return this.children[name];
        }
        return new GroupTandem(this, name);
    }
    equals(tandem) {
        return this.phetioID === tandem.phetioID;
    }
    /**
   * Adds a listener that will be notified when items are registered/deregistered
   */ static addPhetioObjectListener(phetioObjectListener) {
        phetioObjectListeners.push(phetioObjectListener);
    }
    /**
   * After all listeners have been added, then Tandem can be launched.  This registers all of the buffered PhetioObjects
   * and subsequent PhetioObjects will be registered directly.
   */ static launch() {
        assert && assert(!Tandem.launched, 'Tandem cannot be launched twice');
        Tandem.launched = true;
        while(launchListeners.length > 0){
            launchListeners.shift()();
        }
        assert && assert(launchListeners.length === 0);
    }
    /**
   * ONLY FOR TESTING!!!!
   * This was created to "undo" launch so that tests can better expose cases around calling Tandem.launch()
   */ static unlaunch() {
        Tandem.launched = false;
        Tandem.bufferedPhetioObjects.length = 0;
        launchListeners.length = 0;
    }
    /**
   * Add a listener that will fire when Tandem is launched
   */ static addLaunchListener(listener) {
        assert && assert(!Tandem.launched, 'tandem has already been launched, cannot add listener for that hook.');
        launchListeners.push(listener);
    }
    createTandemFromPhetioID(phetioID) {
        return this.createTandem(phetioID.split(window.phetio.PhetioIDUtils.SEPARATOR).join(INTER_TERM_SEPARATOR), {
            isValidTandemName: (name)=>Tandem.getRegexFromCharacterClass(TandemConstants.BASE_DERIVED_TANDEM_CHARACTER_CLASS).test(name)
        });
    }
    /**
   * Get the Tandem location for model strings. Provide the camelCased repo name for where the string should be
   * organized. This will default to the sim's name. See https://github.com/phetsims/tandem/issues/298
   */ static getStringsTandem(moduleName = Tandem.ROOT.name) {
        return Tandem.STRINGS.createTandem(moduleName);
    }
    /**
   * Get the Tandem location for derived model strings. Provide the camelCased repo name for where the string should be
   * organized. This will default to the sim's name. See https://github.com/phetsims/tandem/issues/298
   */ static getDerivedStringsTandem(moduleName = Tandem.ROOT.name) {
        return Tandem.getStringsTandem(moduleName).createTandem('derivedStrings');
    }
    /**
   * Typically, sims will create tandems using `tandem.createTandem`.  This constructor is used internally or when
   * a tandem must be created from scratch.
   *
   * @param parentTandem - parent for a child tandem, or null for a root tandem
   * @param name - component name for this level, like 'resetAllButton'
   * @param [providedOptions]
   */ constructor(parentTandem, name, providedOptions){
        // phet-io internal, please don't use this. Please.
        this.children = {};
        this.isDisposed = false;
        assert && assert(parentTandem === null || parentTandem instanceof Tandem, 'parentTandem should be null or Tandem');
        assert && assert(name !== Tandem.METADATA_KEY, 'name cannot match Tandem.METADATA_KEY');
        this.parentTandem = parentTandem;
        this.name = name;
        this.phetioID = this.parentTandem ? window.phetio.PhetioIDUtils.append(this.parentTandem.phetioID, this.name) : this.name;
        // options (even subtype options) must be stored so they can be passed through to children
        // Note: Make sure that added options here are also added to options for inheritance and/or for composition
        // (createTandem/parentTandem/getExtendedOptions) as appropriate.
        const options = optionize()({
            // required === false means it is an optional tandem
            required: true,
            // if the tandem is required but not supplied, an error will be thrown.
            supplied: true,
            isValidTandemName: (name)=>Tandem.getRegexFromCharacterClass().test(name)
        }, providedOptions);
        assert && assert(options.isValidTandemName(name), `invalid tandem name: ${name}`);
        assert && assert(!options.supplied || FORBIDDEN_SUPPLIED_TANDEM_NAMES.every((forbiddenName)=>!name.includes(forbiddenName)), `forbidden supplied tandem name: ${name}. If a tandem is not supplied, its name should not be used to create a supplied tandem.`);
        this.children = {};
        if (this.parentTandem) {
            assert && assert(!this.parentTandem.hasChild(name), `parent should not have child: ${name}`);
            this.parentTandem.addChild(name, this);
        }
        this.required = options.required;
        this.supplied = options.supplied;
    }
};
Tandem.SCREEN_TANDEM_NAME_SUFFIX = 'Screen';
/**
   * Expose collected missing tandems only populated from specific query parameter, see phetioPrintMissingTandems
   * (phet-io internal)
   */ Tandem.missingTandems = missingTandems;
/**
   * If PhET-iO is enabled in this runtime.
   */ Tandem.PHET_IO_ENABLED = PHET_IO_ENABLED;
/**
   * If PhET-iO is running with validation enabled.
   */ Tandem.VALIDATION = VALIDATION;
/**
   * For the API file, the key name for the metadata section.
   */ Tandem.METADATA_KEY = '_metadata';
/**
   * For the API file, the key name for the data section.
   */ Tandem.DATA_KEY = '_data';
// Before listeners are wired up, tandems are buffered.  When listeners are wired up, Tandem.launch() is called and
// buffered tandems are flushed, then subsequent tandems are delivered to listeners directly
Tandem.launched = false;
// a list of PhetioObjects ready to be sent out to listeners, but can't because Tandem hasn't been launched yet.
Tandem.bufferedPhetioObjects = [];
Tandem.RootTandem = class RootTandem extends Tandem {
    /**
     * RootTandems only accept specifically named children.
     */ createTandem(name, options) {
        if (Tandem.VALIDATION) {
            const allowedOnRoot = name === window.phetio.PhetioIDUtils.GLOBAL_COMPONENT_NAME || name === REQUIRED_TANDEM_NAME || name === OPTIONAL_TANDEM_NAME || name === TEST_TANDEM_NAME || name === window.phetio.PhetioIDUtils.GENERAL_COMPONENT_NAME || _.endsWith(name, Tandem.SCREEN_TANDEM_NAME_SUFFIX);
            assert && assert(allowedOnRoot, `tandem name not allowed on root: "${name}"; perhaps try putting it under general or global`);
        }
        return super.createTandem(name, options);
    }
};
/**
   * The root tandem for a simulation
   */ Tandem.ROOT = new Tandem.RootTandem(null, _.camelCase(packageJSON.name));
/**
   * Many simulation elements are nested under "general". This tandem is for elements that exists in all sims. For a
   * place to put simulation specific globals, see `GLOBAL`
   *
   * @constant
   * @type {Tandem}
   */ Tandem.GENERAL = Tandem.ROOT.createTandem(window.phetio.PhetioIDUtils.GENERAL_COMPONENT_NAME);
/**
   * Used in unit tests
   */ Tandem.ROOT_TEST = Tandem.ROOT.createTandem(TEST_TANDEM_NAME);
/**
   * Tandem for model simulation elements that are general to all sims.
   */ Tandem.GENERAL_MODEL = Tandem.GENERAL.createTandem(window.phetio.PhetioIDUtils.MODEL_COMPONENT_NAME);
/**
   * Tandem for view simulation elements that are general to all sims.
   */ Tandem.GENERAL_VIEW = Tandem.GENERAL.createTandem(window.phetio.PhetioIDUtils.VIEW_COMPONENT_NAME);
/**
   * Tandem for controller simulation elements that are general to all sims.
   */ Tandem.GENERAL_CONTROLLER = Tandem.GENERAL.createTandem(window.phetio.PhetioIDUtils.CONTROLLER_COMPONENT_NAME);
/**
   * Simulation elements that don't belong in screens should be nested under "global". Note that this tandem should only
   * have simulation specific elements in them. Instrument items used by all sims under `Tandem.GENERAL`. Most
   * likely simulations elements should not be directly under this, but instead either under the model or view sub
   * tandems.
   *
   * @constant
   * @type {Tandem}
   */ Tandem.GLOBAL = Tandem.ROOT.createTandem(window.phetio.PhetioIDUtils.GLOBAL_COMPONENT_NAME);
/**
   * Model simulation elements that don't belong in specific screens should be nested under this Tandem. Note that this
   * tandem should only have simulation specific elements in them.
   */ Tandem.GLOBAL_MODEL = Tandem.GLOBAL.createTandem(window.phetio.PhetioIDUtils.MODEL_COMPONENT_NAME);
/**
   * View simulation elements that don't belong in specific screens should be nested under this Tandem. Note that this
   * tandem should only have simulation specific elements in them.
   */ Tandem.GLOBAL_VIEW = Tandem.GLOBAL.createTandem(window.phetio.PhetioIDUtils.VIEW_COMPONENT_NAME);
/**
   * Colors used in the simulation.
   */ Tandem.COLORS = Tandem.GLOBAL_VIEW.createTandem(window.phetio.PhetioIDUtils.COLORS_COMPONENT_NAME);
/**
   * Colors used in the simulation.
   */ Tandem.STRINGS = Tandem.GENERAL_MODEL.createTandem(window.phetio.PhetioIDUtils.STRINGS_COMPONENT_NAME);
/**
   * In TypeScript, optionize already knows that `tandem` may be undefined, just use `options.tandem?` See https://github.com/phetsims/tandem/issues/289
   * Used to indicate a common code component that supports tandem, but doesn't require it.  If a tandem is not
   * passed in, then it will not be instrumented.
   */ Tandem.OPTIONAL = Tandem.ROOT.createTandem(OPTIONAL_TANDEM_NAME, {
    required: false,
    supplied: false
});
/**
   * To be used exclusively to opt out of situations where a tandem is required, see https://github.com/phetsims/tandem/issues/97.
   */ Tandem.OPT_OUT = Tandem.OPTIONAL;
/**
   * Some common code (such as Checkbox or RadioButton) must always be instrumented.
   */ Tandem.REQUIRED = Tandem.ROOT.createTandem(REQUIRED_TANDEM_NAME, {
    // let phetioPrintMissingTandems bypass this
    required: VALIDATION || PRINT_MISSING_TANDEMS,
    supplied: false
});
/**
   * Use this as the parent tandem for Properties that are related to sim-specific preferences.
   */ Tandem.PREFERENCES = Tandem.GLOBAL_MODEL.createTandem('preferences');
Tandem.addLaunchListener(()=>{
    while(Tandem.bufferedPhetioObjects.length > 0){
        const phetioObject = Tandem.bufferedPhetioObjects.shift();
        phetioObject.tandem.addPhetioObject(phetioObject);
    }
    assert && assert(Tandem.bufferedPhetioObjects.length === 0, 'bufferedPhetioObjects should be empty');
});
/**
 * Group Tandem -- Declared in the same file to avoid circular reference errors in module loading.
 */ let GroupTandem = class GroupTandem extends Tandem {
    /**
   * Creates the next tandem in the group.
   */ createNextTandem() {
        const tandem = this.parentTandem.createTandem(`${this.groupName}${this.groupMemberIndex}`);
        this.groupMemberIndex++;
        return tandem;
    }
    /**
   * create with Tandem.createGroupTandem
   */ constructor(parentTandem, name){
        super(parentTandem, name);
        this.groupName = name;
        this.groupMemberIndex = 0;
    }
};
tandemNamespace.register('Tandem', Tandem);
export default Tandem;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGFuZGVtIGRlZmluZXMgYSBzZXQgb2YgdHJlZXMgdGhhdCBhcmUgdXNlZCB0byBhc3NpZ24gdW5pcXVlIGlkZW50aWZpZXJzIHRvIFBoZXRpb09iamVjdHMgaW4gUGhFVCBzaW11bGF0aW9ucyBhbmRcbiAqIG5vdGlmeSBsaXN0ZW5lcnMgd2hlbiB0aGUgYXNzb2NpYXRlZCBQaGV0aW9PYmplY3RzIGhhdmUgYmVlbiBhZGRlZC9yZW1vdmVkLiBJdCBpcyB1c2VkIHRvIHN1cHBvcnQgUGhFVC1pTy5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBhcnJheVJlbW92ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvYXJyYXlSZW1vdmUuanMnO1xuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHsgUGhldGlvSUQgfSBmcm9tICcuL3BoZXQtaW8tdHlwZXMuanMnO1xuaW1wb3J0IFBoZXRpb09iamVjdCBmcm9tICcuL1BoZXRpb09iamVjdC5qcyc7XG5pbXBvcnQgVGFuZGVtQ29uc3RhbnRzIGZyb20gJy4vVGFuZGVtQ29uc3RhbnRzLmpzJztcbmltcG9ydCB0YW5kZW1OYW1lc3BhY2UgZnJvbSAnLi90YW5kZW1OYW1lc3BhY2UuanMnO1xuXG4vLyBjb25zdGFudHNcbi8vIFRhbmRlbSBjYW4ndCBkZXBlbmQgb24gam9pc3QsIHNvIGNhbm5vdCB1c2UgcGFja2FnZUpTT04gbW9kdWxlXG5jb25zdCBwYWNrYWdlSlNPTiA9IF8uaGFzSW4oIHdpbmRvdywgJ3BoZXQuY2hpcHBlci5wYWNrYWdlT2JqZWN0JyApID8gcGhldC5jaGlwcGVyLnBhY2thZ2VPYmplY3QgOiB7IG5hbWU6ICdwbGFjZWhvbGRlcicgfTtcblxuY29uc3QgUEhFVF9JT19FTkFCTEVEID0gXy5oYXNJbiggd2luZG93LCAncGhldC5wcmVsb2Fkcy5waGV0aW8nICk7XG5jb25zdCBQUklOVF9NSVNTSU5HX1RBTkRFTVMgPSBQSEVUX0lPX0VOQUJMRUQgJiYgcGhldC5wcmVsb2Fkcy5waGV0aW8ucXVlcnlQYXJhbWV0ZXJzLnBoZXRpb1ByaW50TWlzc2luZ1RhbmRlbXM7XG5cbi8vIFZhbGlkYXRpb24gZGVmYXVsdHMgdG8gdHJ1ZSwgYnV0IGNhbiBiZSBvdmVycmlkZGVuIHRvIGJlIGZhbHNlIGluIHBhY2thZ2UuanNvbi5cbmNvbnN0IElTX1ZBTElEQVRJT05fREVGQVVMVCA9IF8uaGFzSW4oIHBhY2thZ2VKU09OLCAncGhldC5waGV0LWlvLnZhbGlkYXRpb24nICkgPyAhIXBhY2thZ2VKU09OLnBoZXRbICdwaGV0LWlvJyBdLnZhbGlkYXRpb24gOiB0cnVlO1xuXG4vLyBUaGUgZGVmYXVsdCB2YWx1ZSBmb3IgdmFsaWRhdGlvbiBjYW4gYmUgb3ZlcnJpZGRlbiB3aXRoIGEgcXVlcnkgcGFyYW1ldGVyID9waGV0aW9WYWxpZGF0aW9uPXt0cnVlfGZhbHNlfS5cbmNvbnN0IElTX1ZBTElEQVRJT05fUVVFUllfUEFSQU1FVEVSX1NQRUNJRklFRCA9IHdpbmRvdy5RdWVyeVN0cmluZ01hY2hpbmUgJiYgUXVlcnlTdHJpbmdNYWNoaW5lLmNvbnRhaW5zS2V5KCAncGhldGlvVmFsaWRhdGlvbicgKTtcbmNvbnN0IElTX1ZBTElEQVRJT05fU1BFQ0lGSUVEID0gKCBQSEVUX0lPX0VOQUJMRUQgJiYgSVNfVkFMSURBVElPTl9RVUVSWV9QQVJBTUVURVJfU1BFQ0lGSUVEICkgPyAhIXBoZXQucHJlbG9hZHMucGhldGlvLnF1ZXJ5UGFyYW1ldGVycy5waGV0aW9WYWxpZGF0aW9uIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQSEVUX0lPX0VOQUJMRUQgJiYgSVNfVkFMSURBVElPTl9ERUZBVUxUICk7XG5cbmNvbnN0IFZBTElEQVRJT04gPSBQSEVUX0lPX0VOQUJMRUQgJiYgSVNfVkFMSURBVElPTl9TUEVDSUZJRUQgJiYgIVBSSU5UX01JU1NJTkdfVEFOREVNUztcblxuY29uc3QgVU5BTExPV0VEX1RBTkRFTV9OQU1FUyA9IFtcbiAgJ3BpY2thYmxlUHJvcGVydHknLCAvLyB1c2UgaW5wdXRFbmFibGVkIGluc3RlYWRcblxuICAvLyBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby9pc3N1ZXMvMTkxNSB3ZSBkZWNpZGVkIHRvIHByZWZlciB0aGUgc2NlbmVyeSBsaXN0ZW5lciB0eXBlc1xuICAvLyAoJ2RyYWdMaXN0ZW5lcicgZXRjKS4gSWYgeW91IGVuY291bnRlciB0aGlzIGFuZCBmZWVsIGxpa2UgaW5wdXRMaXN0ZW5lciBpcyBwcmVmZXJhYmxlLCBsZXQncyBkaXNjdXNzIVxuICAnaW5wdXRMaXN0ZW5lcicsXG4gICdkcmFnSGFuZGxlcicgLy8gcHJlZmVyIGRyYWdMaXN0ZW5lclxuXTtcblxuY29uc3QgUkVRVUlSRURfVEFOREVNX05BTUUgPSAncmVxdWlyZWRUYW5kZW0nO1xuY29uc3QgT1BUSU9OQUxfVEFOREVNX05BTUUgPSAnb3B0aW9uYWxUYW5kZW0nO1xuXG5jb25zdCBGT1JCSURERU5fU1VQUExJRURfVEFOREVNX05BTUVTID0gW1xuICBSRVFVSVJFRF9UQU5ERU1fTkFNRSxcbiAgT1BUSU9OQUxfVEFOREVNX05BTUVcbl07XG5cbmNvbnN0IFRFU1RfVEFOREVNX05BTUUgPSAndGVzdCc7XG5jb25zdCBJTlRFUl9URVJNX1NFUEFSQVRPUiA9IHBoZXRpby5QaGV0aW9JRFV0aWxzLklOVEVSX1RFUk1fU0VQQVJBVE9SO1xuZXhwb3J0IGNvbnN0IERZTkFNSUNfQVJDSEVUWVBFX05BTUUgPSBwaGV0aW8uUGhldGlvSURVdGlscy5BUkNIRVRZUEU7XG5cbi8vIHVzZWQgdG8ga2VlcCB0cmFjayBvZiBtaXNzaW5nIHRhbmRlbXNcbmNvbnN0IG1pc3NpbmdUYW5kZW1zOiB7XG4gIHJlcXVpcmVkOiBBcnJheTx7IHBoZXRpb0lEOiBQaGV0aW9JRDsgc3RhY2s6IHN0cmluZyB9PjtcbiAgb3B0aW9uYWw6IEFycmF5PHsgcGhldGlvSUQ6IFBoZXRpb0lEOyBzdGFjazogc3RyaW5nIH0+O1xufSA9IHtcbiAgcmVxdWlyZWQ6IFtdLFxuICBvcHRpb25hbDogW11cbn07XG5cbnR5cGUgUGhldGlvT2JqZWN0TGlzdGVuZXIgPSB7XG4gIGFkZFBoZXRpb09iamVjdDogKCBwaGV0aW9PYmplY3Q6IFBoZXRpb09iamVjdCApID0+IHZvaWQ7XG4gIHJlbW92ZVBoZXRpb09iamVjdDogKCBwaGV0aW9PYmplY3Q6IFBoZXRpb09iamVjdCApID0+IHZvaWQ7XG59O1xuXG4vLyBMaXN0ZW5lcnMgdGhhdCB3aWxsIGJlIG5vdGlmaWVkIHdoZW4gaXRlbXMgYXJlIHJlZ2lzdGVyZWQvZGVyZWdpc3RlcmVkLiBTZWUgZG9jIGluIGFkZFBoZXRpb09iamVjdExpc3RlbmVyXG5jb25zdCBwaGV0aW9PYmplY3RMaXN0ZW5lcnM6IEFycmF5PFBoZXRpb09iamVjdExpc3RlbmVyPiA9IFtdO1xuXG4vLyBrZWVwIHRyYWNrIG9mIGxpc3RlbmVycyB0byBmaXJlIHdoZW4gVGFuZGVtLmxhdW5jaCgpIGlzIGNhbGxlZC5cbmNvbnN0IGxhdW5jaExpc3RlbmVyczogQXJyYXk8KCkgPT4gdm9pZD4gPSBbXTtcblxuZXhwb3J0IHR5cGUgVGFuZGVtT3B0aW9ucyA9IHtcbiAgcmVxdWlyZWQ/OiBib29sZWFuO1xuICBzdXBwbGllZD86IGJvb2xlYW47XG4gIGlzVmFsaWRUYW5kZW1OYW1lPzogKCBuYW1lOiBzdHJpbmcgKSA9PiBib29sZWFuO1xufTtcblxuY2xhc3MgVGFuZGVtIHtcblxuICAvLyBUcmVhdCBhcyByZWFkb25seS4gIE9ubHkgbWFya2VkIGFzIHdyaXRhYmxlIHNvIGl0IGNhbiBiZSBlbGltaW5hdGVkIG9uIGRpc3Bvc2VcbiAgcHVibGljIHBhcmVudFRhbmRlbTogVGFuZGVtIHwgbnVsbDtcblxuICAvLyB0aGUgbGFzdCBwYXJ0IG9mIHRoZSB0YW5kZW0gKGFmdGVyIHRoZSBsYXN0IC4pLCB1c2VkIGUuZy4sIGluIEpvaXN0IGZvciBjcmVhdGluZyBidXR0b25cbiAgLy8gbmFtZXMgZHluYW1pY2FsbHkgYmFzZWQgb24gc2NyZWVuIG5hbWVzXG4gIHB1YmxpYyByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gIHB1YmxpYyByZWFkb25seSBwaGV0aW9JRDogUGhldGlvSUQ7XG5cbiAgLy8gcGhldC1pbyBpbnRlcm5hbCwgcGxlYXNlIGRvbid0IHVzZSB0aGlzLiBQbGVhc2UuXG4gIHB1YmxpYyByZWFkb25seSBjaGlsZHJlbjogUmVjb3JkPHN0cmluZywgVGFuZGVtPiA9IHt9O1xuICBwdWJsaWMgcmVhZG9ubHkgcmVxdWlyZWQ6IGJvb2xlYW47XG4gIHB1YmxpYyByZWFkb25seSBzdXBwbGllZDogYm9vbGVhbjtcbiAgcHJpdmF0ZSBpc0Rpc3Bvc2VkID0gZmFsc2U7XG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBTQ1JFRU5fVEFOREVNX05BTUVfU1VGRklYID0gJ1NjcmVlbic7XG5cbiAgLyoqXG4gICAqIFR5cGljYWxseSwgc2ltcyB3aWxsIGNyZWF0ZSB0YW5kZW1zIHVzaW5nIGB0YW5kZW0uY3JlYXRlVGFuZGVtYC4gIFRoaXMgY29uc3RydWN0b3IgaXMgdXNlZCBpbnRlcm5hbGx5IG9yIHdoZW5cbiAgICogYSB0YW5kZW0gbXVzdCBiZSBjcmVhdGVkIGZyb20gc2NyYXRjaC5cbiAgICpcbiAgICogQHBhcmFtIHBhcmVudFRhbmRlbSAtIHBhcmVudCBmb3IgYSBjaGlsZCB0YW5kZW0sIG9yIG51bGwgZm9yIGEgcm9vdCB0YW5kZW1cbiAgICogQHBhcmFtIG5hbWUgLSBjb21wb25lbnQgbmFtZSBmb3IgdGhpcyBsZXZlbCwgbGlrZSAncmVzZXRBbGxCdXR0b24nXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwYXJlbnRUYW5kZW06IFRhbmRlbSB8IG51bGwsIG5hbWU6IHN0cmluZywgcHJvdmlkZWRPcHRpb25zPzogVGFuZGVtT3B0aW9ucyApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwYXJlbnRUYW5kZW0gPT09IG51bGwgfHwgcGFyZW50VGFuZGVtIGluc3RhbmNlb2YgVGFuZGVtLCAncGFyZW50VGFuZGVtIHNob3VsZCBiZSBudWxsIG9yIFRhbmRlbScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBuYW1lICE9PSBUYW5kZW0uTUVUQURBVEFfS0VZLCAnbmFtZSBjYW5ub3QgbWF0Y2ggVGFuZGVtLk1FVEFEQVRBX0tFWScgKTtcblxuICAgIHRoaXMucGFyZW50VGFuZGVtID0gcGFyZW50VGFuZGVtO1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG5cbiAgICB0aGlzLnBoZXRpb0lEID0gdGhpcy5wYXJlbnRUYW5kZW0gPyB3aW5kb3cucGhldGlvLlBoZXRpb0lEVXRpbHMuYXBwZW5kKCB0aGlzLnBhcmVudFRhbmRlbS5waGV0aW9JRCwgdGhpcy5uYW1lIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB0aGlzLm5hbWU7XG5cbiAgICAvLyBvcHRpb25zIChldmVuIHN1YnR5cGUgb3B0aW9ucykgbXVzdCBiZSBzdG9yZWQgc28gdGhleSBjYW4gYmUgcGFzc2VkIHRocm91Z2ggdG8gY2hpbGRyZW5cbiAgICAvLyBOb3RlOiBNYWtlIHN1cmUgdGhhdCBhZGRlZCBvcHRpb25zIGhlcmUgYXJlIGFsc28gYWRkZWQgdG8gb3B0aW9ucyBmb3IgaW5oZXJpdGFuY2UgYW5kL29yIGZvciBjb21wb3NpdGlvblxuICAgIC8vIChjcmVhdGVUYW5kZW0vcGFyZW50VGFuZGVtL2dldEV4dGVuZGVkT3B0aW9ucykgYXMgYXBwcm9wcmlhdGUuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxUYW5kZW1PcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIHJlcXVpcmVkID09PSBmYWxzZSBtZWFucyBpdCBpcyBhbiBvcHRpb25hbCB0YW5kZW1cbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxuXG4gICAgICAvLyBpZiB0aGUgdGFuZGVtIGlzIHJlcXVpcmVkIGJ1dCBub3Qgc3VwcGxpZWQsIGFuIGVycm9yIHdpbGwgYmUgdGhyb3duLlxuICAgICAgc3VwcGxpZWQ6IHRydWUsXG5cbiAgICAgIGlzVmFsaWRUYW5kZW1OYW1lOiAoIG5hbWU6IHN0cmluZyApID0+IFRhbmRlbS5nZXRSZWdleEZyb21DaGFyYWN0ZXJDbGFzcygpLnRlc3QoIG5hbWUgKVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5pc1ZhbGlkVGFuZGVtTmFtZSggbmFtZSApLCBgaW52YWxpZCB0YW5kZW0gbmFtZTogJHtuYW1lfWAgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLnN1cHBsaWVkIHx8IEZPUkJJRERFTl9TVVBQTElFRF9UQU5ERU1fTkFNRVMuZXZlcnkoIGZvcmJpZGRlbk5hbWUgPT4gIW5hbWUuaW5jbHVkZXMoIGZvcmJpZGRlbk5hbWUgKSApLFxuICAgICAgYGZvcmJpZGRlbiBzdXBwbGllZCB0YW5kZW0gbmFtZTogJHtuYW1lfS4gSWYgYSB0YW5kZW0gaXMgbm90IHN1cHBsaWVkLCBpdHMgbmFtZSBzaG91bGQgbm90IGJlIHVzZWQgdG8gY3JlYXRlIGEgc3VwcGxpZWQgdGFuZGVtLmAgKTtcblxuICAgIHRoaXMuY2hpbGRyZW4gPSB7fTtcblxuICAgIGlmICggdGhpcy5wYXJlbnRUYW5kZW0gKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5wYXJlbnRUYW5kZW0uaGFzQ2hpbGQoIG5hbWUgKSwgYHBhcmVudCBzaG91bGQgbm90IGhhdmUgY2hpbGQ6ICR7bmFtZX1gICk7XG4gICAgICB0aGlzLnBhcmVudFRhbmRlbS5hZGRDaGlsZCggbmFtZSwgdGhpcyApO1xuICAgIH1cblxuICAgIHRoaXMucmVxdWlyZWQgPSBvcHRpb25zLnJlcXVpcmVkO1xuICAgIHRoaXMuc3VwcGxpZWQgPSBvcHRpb25zLnN1cHBsaWVkO1xuXG4gIH1cblxuICAvLyBHZXQgdGhlIHJlZ2V4IHRvIHRlc3QgZm9yIGEgdmFsaWQgdGFuZGVtIG5hbWUsIGdpdmVuIHRoZSBjaGFyIGNsYXNzIGZvciB5b3VyIHNwZWNpZmljIHRhbmRlbS4gSW4gdGhlIHJlZ2V4XG4gIC8vIGxhbmd1YWdlLiBJbiB0aGlzIGZ1bmN0aW9uIHdlIHdpbGwgd3JhcCBpdCBpbiBgW10rYCBicmFja2V0cyBmb3JtaW5nIHRoZSBhY3R1YWwgXCJjbGFzc1wiLlxuICBwcm90ZWN0ZWQgc3RhdGljIGdldFJlZ2V4RnJvbUNoYXJhY3RlckNsYXNzKCB0YW5kZW1DaGFyYWN0ZXJDbGFzczogc3RyaW5nID0gVGFuZGVtQ29uc3RhbnRzLkJBU0VfVEFOREVNX0NIQVJBQ1RFUl9DTEFTUyApOiBSZWdFeHAge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKCBgXlske3RhbmRlbUNoYXJhY3RlckNsYXNzfV0rJGAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiB0aGUgcHJvdmlkZWQgdGFuZGVtIGlzIG5vdCBzdXBwbGllZCwgc3VwcG9ydCB0aGUgP3ByaW50TWlzc2luZ1RhbmRlbXMgcXVlcnkgcGFyYW1ldGVyIGZvciBleHRyYSBsb2dnaW5nIGR1cmluZ1xuICAgKiBpbml0aWFsIGluc3RydW1lbnRhdGlvbi5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgb25NaXNzaW5nVGFuZGVtKCB0YW5kZW06IFRhbmRlbSApOiB2b2lkIHtcblxuICAgIC8vIFdoZW4gdGhlIHF1ZXJ5IHBhcmFtZXRlciBwaGV0aW9QcmludE1pc3NpbmdUYW5kZW1zIGlzIHRydWUsIHJlcG9ydCB0YW5kZW1zIHRoYXQgYXJlIHJlcXVpcmVkIGJ1dCBub3Qgc3VwcGxpZWRcbiAgICBpZiAoIFBSSU5UX01JU1NJTkdfVEFOREVNUyAmJiAhdGFuZGVtLnN1cHBsaWVkICkge1xuXG4gICAgICBjb25zdCBzdGFja1RyYWNlID0gVGFuZGVtLmNhcHR1cmVTdGFja1RyYWNlKCk7XG5cbiAgICAgIGlmICggdGFuZGVtLnJlcXVpcmVkICkge1xuICAgICAgICBtaXNzaW5nVGFuZGVtcy5yZXF1aXJlZC5wdXNoKCB7IHBoZXRpb0lEOiB0YW5kZW0ucGhldGlvSUQsIHN0YWNrOiBzdGFja1RyYWNlIH0gKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuXG4gICAgICAgIC8vIFdoZW4gdGhlIHF1ZXJ5IHBhcmFtZXRlciBwaGV0aW9QcmludE1pc3NpbmdUYW5kZW1zIGlzIHRydWUsIHJlcG9ydCB0YW5kZW1zIHRoYXQgYXJlIG9wdGlvbmFsIGJ1dCBub3RcbiAgICAgICAgLy8gc3VwcGxpZWQsIGJ1dCBub3QgZm9yIEZvbnRzIGJlY2F1c2UgdGhleSBhcmUgdG9vIG51bWVyb3VzLlxuICAgICAgICBpZiAoICFzdGFja1RyYWNlLmluY2x1ZGVzKCAnRm9udCcgKSApIHtcbiAgICAgICAgICBtaXNzaW5nVGFuZGVtcy5vcHRpb25hbC5wdXNoKCB7IHBoZXRpb0lEOiB0YW5kZW0ucGhldGlvSUQsIHN0YWNrOiBzdGFja1RyYWNlIH0gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBzdGFjayB0cmFjZSBmcm9tIGEgbmV3IGluc3RhbmNlIG9mIGFuIEVycm9yKCkuIFRoaXMgYWxzbyB1c2VzIHdpbmRvdy5FcnJvci5zdGFja1RyYWNlTGltaXQgdG8gZXhwYW5kIHRoZVxuICAgKiBsZW5ndGggb2YgdGhlIHN0YWNrIHRyYWNlLiBUaGlzIGNhbiBiZSB1c2VmdWwgaW4gc3BvdHMgd2hlcmUgdGhlIHN0YWNrIGlzIHRoZSBvbmx5IGluZm9ybWF0aW9uIHdlIGhhdmUgYWJvdXRcbiAgICogd2hlcmUgd2UgYXJlIGluIGNvbW1vbiBjb2RlIChsaWtlIGZvciBrbm93aW5nIHdoZXJlIHRvIHByb3ZpZGUgYSBUYW5kZW0gIGZvciBQaEVULWlPIGluc3RydW1lbnRhdGlvbikuXG4gICAqIEBwYXJhbSBsaW1pdCAtIHNldCB0byBFcnJvci5zdGFja1RyYWNlTGltaXQganVzdCBmb3IgYSBzaW5nbGUgc3RhY2sgdHJhY2UsIHRoZW4gcmV0dXJuIHRvIHRoZSBwcmV2aW91cyB2YWx1ZSBhZnRlci5cbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGNhcHR1cmVTdGFja1RyYWNlKCBsaW1pdCA9IEluZmluaXR5ICk6IHN0cmluZyB7XG5cbiAgICAvLyBDaGVjayBpZiBFcnJvci5zdGFja1RyYWNlTGltaXQgZXhpc3RzIGFuZCBpcyB3cml0YWJsZVxuICAgIGNvbnN0IGRlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKCBFcnJvciwgJ3N0YWNrVHJhY2VMaW1pdCcgKTtcbiAgICBjb25zdCBzdGFja1RyYWNlV3JpdGFibGUgPSBkZXNjcmlwdG9yICYmICggZGVzY3JpcHRvci53cml0YWJsZSB8fCAoIGRlc2NyaXB0b3Iuc2V0ICYmIHR5cGVvZiBkZXNjcmlwdG9yLnNldCA9PT0gJ2Z1bmN0aW9uJyApICk7XG5cbiAgICBpZiAoIHN0YWNrVHJhY2VXcml0YWJsZSApIHtcblxuICAgICAgLy8gU2F2ZSB0aGUgb3JpZ2luYWwgc3RhY2tUcmFjZUxpbWl0IGJlZm9yZSBjaGFuZ2luZyBpdFxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9wcmVmZXItdHMtZXhwZWN0LWVycm9yXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBjb25zdCBvcmlnaW5hbFN0YWNrVHJhY2VMaW1pdCA9IEVycm9yLnN0YWNrVHJhY2VMaW1pdDtcblxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9wcmVmZXItdHMtZXhwZWN0LWVycm9yXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBFcnJvci5zdGFja1RyYWNlTGltaXQgPSBsaW1pdDtcbiAgICAgIGNvbnN0IHN0YWNrVHJhY2UgPSBuZXcgRXJyb3IoKS5zdGFjayE7XG5cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvcHJlZmVyLXRzLWV4cGVjdC1lcnJvclxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgRXJyb3Iuc3RhY2tUcmFjZUxpbWl0ID0gb3JpZ2luYWxTdGFja1RyYWNlTGltaXQ7XG4gICAgICByZXR1cm4gc3RhY2tUcmFjZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IEVycm9yKCkuc3RhY2shO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgUGhldGlvT2JqZWN0LiAgRm9yIGV4YW1wbGUsIGl0IGNvdWxkIGJlIGFuIGF4b24gUHJvcGVydHksIFNDRU5FUlkvTm9kZSBvciBTVU4vUm91bmRQdXNoQnV0dG9uLlxuICAgKiBwaGV0aW9FbmdpbmUgbGlzdGVucyBmb3Igd2hlbiBQaGV0aW9PYmplY3RzIGFyZSBhZGRlZCBhbmQgcmVtb3ZlZCB0byBrZWVwIHRyYWNrIG9mIHRoZW0gZm9yIFBoRVQtaU8uXG4gICAqL1xuICBwdWJsaWMgYWRkUGhldGlvT2JqZWN0KCBwaGV0aW9PYmplY3Q6IFBoZXRpb09iamVjdCApOiB2b2lkIHtcblxuICAgIGlmICggUEhFVF9JT19FTkFCTEVEICkge1xuXG4gICAgICAvLyBUaHJvdyBhbiBlcnJvciBpZiB0aGUgdGFuZGVtIGlzIHJlcXVpcmVkIGJ1dCBub3Qgc3VwcGxpZWRcbiAgICAgIGFzc2VydCAmJiBUYW5kZW0uVkFMSURBVElPTiAmJiBhc3NlcnQoICEoIHRoaXMucmVxdWlyZWQgJiYgIXRoaXMuc3VwcGxpZWQgKSwgJ1RhbmRlbSB3YXMgcmVxdWlyZWQgYnV0IG5vdCBzdXBwbGllZCcgKTtcblxuICAgICAgLy8gSWYgdGFuZGVtIGlzIG9wdGlvbmFsIGFuZCBub3Qgc3VwcGxpZWQsIHRoZW4gaWdub3JlIGl0LlxuICAgICAgaWYgKCAhdGhpcy5yZXF1aXJlZCAmJiAhdGhpcy5zdXBwbGllZCApIHtcblxuICAgICAgICAvLyBPcHRpb25hbGx5IGluc3RydW1lbnRlZCB0eXBlcyB3aXRob3V0IHRhbmRlbXMgYXJlIG5vdCBhZGRlZC5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoICFUYW5kZW0ubGF1bmNoZWQgKSB7XG4gICAgICAgIFRhbmRlbS5idWZmZXJlZFBoZXRpb09iamVjdHMucHVzaCggcGhldGlvT2JqZWN0ICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcGhldGlvT2JqZWN0TGlzdGVuZXJzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgIHBoZXRpb09iamVjdExpc3RlbmVyc1sgaSBdLmFkZFBoZXRpb09iamVjdCggcGhldGlvT2JqZWN0ICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgVGFuZGVtIGhhcyB0aGUgc3BlY2lmaWVkIGFuY2VzdG9yIFRhbmRlbS5cbiAgICovXG4gIHB1YmxpYyBoYXNBbmNlc3RvciggYW5jZXN0b3I6IFRhbmRlbSApOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5wYXJlbnRUYW5kZW0gPT09IGFuY2VzdG9yIHx8ICEhKCB0aGlzLnBhcmVudFRhbmRlbSAmJiB0aGlzLnBhcmVudFRhbmRlbS5oYXNBbmNlc3RvciggYW5jZXN0b3IgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBQaGV0aW9PYmplY3QgYW5kIHNpZ25pZmllcyB0byBsaXN0ZW5lcnMgdGhhdCBpdCBoYXMgYmVlbiByZW1vdmVkLlxuICAgKi9cbiAgcHVibGljIHJlbW92ZVBoZXRpb09iamVjdCggcGhldGlvT2JqZWN0OiBQaGV0aW9PYmplY3QgKTogdm9pZCB7XG5cbiAgICAvLyBObyBuZWVkIHRvIGhhbmRsZSB0aGlzIGNhc2UgZm9yIHVuaW5zdHJ1bWVudGVkIG9iamVjdHMgYmVpbmcgcmVtb3ZlZFxuICAgIGlmICggIXRoaXMuc3VwcGxpZWQgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gT25seSBhY3RpdmUgd2hlbiBydW5uaW5nIGFzIHBoZXQtaW9cbiAgICBpZiAoIFBIRVRfSU9fRU5BQkxFRCApIHtcbiAgICAgIGlmICggIVRhbmRlbS5sYXVuY2hlZCApIHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggVGFuZGVtLmJ1ZmZlcmVkUGhldGlvT2JqZWN0cy5pbmNsdWRlcyggcGhldGlvT2JqZWN0ICksICdzaG91bGQgY29udGFpbiBpdGVtJyApO1xuICAgICAgICBhcnJheVJlbW92ZSggVGFuZGVtLmJ1ZmZlcmVkUGhldGlvT2JqZWN0cywgcGhldGlvT2JqZWN0ICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcGhldGlvT2JqZWN0TGlzdGVuZXJzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgIHBoZXRpb09iamVjdExpc3RlbmVyc1sgaSBdLnJlbW92ZVBoZXRpb09iamVjdCggcGhldGlvT2JqZWN0ICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBwaGV0aW9PYmplY3QudGFuZGVtLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2VkIGZvciBjcmVhdGluZyBuZXcgdGFuZGVtcywgZXh0ZW5kcyB0aGlzIFRhbmRlbSdzIG9wdGlvbnMgd2l0aCB0aGUgcGFzc2VkLWluIG9wdGlvbnMuXG4gICAqL1xuICBwdWJsaWMgZ2V0RXh0ZW5kZWRPcHRpb25zKCBvcHRpb25zPzogVGFuZGVtT3B0aW9ucyApOiBUYW5kZW1PcHRpb25zIHtcblxuICAgIC8vIEFueSBjaGlsZCBvZiBzb21ldGhpbmcgc2hvdWxkIGJlIHBhc3NlZCBhbGwgaW5oZXJpdGVkIG9wdGlvbnMuIE1ha2Ugc3VyZSB0aGF0IHRoaXMgZXh0ZW5kIGNhbGwgaW5jbHVkZXMgYWxsXG4gICAgLy8gdGhhdCBtYWtlIHNlbnNlIGZyb20gdGhlIGNvbnN0cnVjdG9yJ3MgZXh0ZW5kIGNhbGwuXG4gICAgcmV0dXJuIG1lcmdlKCB7XG4gICAgICBzdXBwbGllZDogdGhpcy5zdXBwbGllZCxcbiAgICAgIHJlcXVpcmVkOiB0aGlzLnJlcXVpcmVkXG4gICAgfSwgb3B0aW9ucyApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBUYW5kZW0gYnkgYXBwZW5kaW5nIHRoZSBnaXZlbiBpZCwgb3IgaWYgdGhlIGNoaWxkIFRhbmRlbSBhbHJlYWR5IGV4aXN0cywgcmV0dXJuIGl0IGluc3RlYWQuXG4gICAqL1xuICBwdWJsaWMgY3JlYXRlVGFuZGVtKCBuYW1lOiBzdHJpbmcsIG9wdGlvbnM/OiBUYW5kZW1PcHRpb25zICk6IFRhbmRlbSB7XG4gICAgYXNzZXJ0ICYmIFRhbmRlbS5WQUxJREFUSU9OICYmIGFzc2VydCggIVVOQUxMT1dFRF9UQU5ERU1fTkFNRVMuaW5jbHVkZXMoIG5hbWUgKSwgJ3RhbmRlbSBuYW1lIGlzIG5vdCBhbGxvd2VkOiAnICsgbmFtZSApO1xuXG4gICAgb3B0aW9ucyA9IHRoaXMuZ2V0RXh0ZW5kZWRPcHRpb25zKCBvcHRpb25zICk7XG5cbiAgICAvLyByZS11c2UgdGhlIGNoaWxkIGlmIGl0IGFscmVhZHkgZXhpc3RzLCBidXQgbWFrZSBzdXJlIGl0IGJlaGF2ZXMgdGhlIHNhbWUuXG4gICAgaWYgKCB0aGlzLmhhc0NoaWxkKCBuYW1lICkgKSB7XG4gICAgICBjb25zdCBjdXJyZW50Q2hpbGQgPSB0aGlzLmNoaWxkcmVuWyBuYW1lIF07XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjdXJyZW50Q2hpbGQucmVxdWlyZWQgPT09IG9wdGlvbnMucmVxdWlyZWQgKTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGN1cnJlbnRDaGlsZC5zdXBwbGllZCA9PT0gb3B0aW9ucy5zdXBwbGllZCApO1xuICAgICAgcmV0dXJuIGN1cnJlbnRDaGlsZDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFRhbmRlbSggdGhpcywgbmFtZSwgb3B0aW9ucyApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvYmFkLXNpbS10ZXh0XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBUYW5kZW0gYnkgaW5kZXhpbmcgd2l0aCB0aGUgc3BlY2lmaWVkIGluZGV4LiAgTm90ZSB0aGF0IGl0IGluY3JlbWVudHMgYnkgMSBzbyB0aGF0IGluZGV4IDAgaXNcbiAgICogXCIxXCIgaW4gdGhlIHRhbmRlbSBuYW1lLlxuICAgKiBGb3IgZXhhbXBsZTpcbiAgICogLSBjcmVhdGVUYW5kZW0oICdmb28nLCAwICkgPT4gJ2ZvbzEnXG4gICAqL1xuICBwdWJsaWMgY3JlYXRlVGFuZGVtMUluZGV4ZWQoIG5hbWU6IHN0cmluZywgaW5kZXg6IG51bWJlciwgb3B0aW9ucz86IFRhbmRlbU9wdGlvbnMgKTogVGFuZGVtIHtcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVUYW5kZW0oIGAke25hbWV9JHtpbmRleCArIDF9YCwgb3B0aW9ucyApO1xuICB9XG5cbiAgcHVibGljIGhhc0NoaWxkKCBuYW1lOiBzdHJpbmcgKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY2hpbGRyZW4uaGFzT3duUHJvcGVydHkoIG5hbWUgKTtcbiAgfVxuXG4gIHB1YmxpYyBhZGRDaGlsZCggbmFtZTogc3RyaW5nLCB0YW5kZW06IFRhbmRlbSApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5oYXNDaGlsZCggbmFtZSApICk7XG4gICAgdGhpcy5jaGlsZHJlblsgbmFtZSBdID0gdGFuZGVtO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpcmUgYSBjYWxsYmFjayBvbiBhbGwgZGVzY2VuZGFudHMgb2YgdGhpcyBUYW5kZW1cbiAgICovXG4gIHB1YmxpYyBpdGVyYXRlRGVzY2VuZGFudHMoIGNhbGxiYWNrOiAoIHQ6IFRhbmRlbSApID0+IHZvaWQgKTogdm9pZCB7XG4gICAgZm9yICggY29uc3QgY2hpbGROYW1lIGluIHRoaXMuY2hpbGRyZW4gKSB7XG4gICAgICBpZiAoIHRoaXMuY2hpbGRyZW4uaGFzT3duUHJvcGVydHkoIGNoaWxkTmFtZSApICkge1xuICAgICAgICBjYWxsYmFjayggdGhpcy5jaGlsZHJlblsgY2hpbGROYW1lIF0gKTtcbiAgICAgICAgdGhpcy5jaGlsZHJlblsgY2hpbGROYW1lIF0uaXRlcmF0ZURlc2NlbmRhbnRzKCBjYWxsYmFjayApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVtb3ZlQ2hpbGQoIGNoaWxkTmFtZTogc3RyaW5nICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaGFzQ2hpbGQoIGNoaWxkTmFtZSApICk7XG4gICAgZGVsZXRlIHRoaXMuY2hpbGRyZW5bIGNoaWxkTmFtZSBdO1xuICB9XG5cbiAgcHJpdmF0ZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmlzRGlzcG9zZWQsICdhbHJlYWR5IGRpc3Bvc2VkJyApO1xuXG4gICAgdGhpcy5wYXJlbnRUYW5kZW0hLnJlbW92ZUNoaWxkKCB0aGlzLm5hbWUgKTtcbiAgICB0aGlzLnBhcmVudFRhbmRlbSA9IG51bGw7XG5cbiAgICB0aGlzLmlzRGlzcG9zZWQgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvciBBUEkgdmFsaWRhdGlvbiwgZWFjaCBQaGV0aW9PYmplY3QgaGFzIGEgY29ycmVzcG9uZGluZyBhcmNoZXR5cGUgUGhldGlvT2JqZWN0IGZvciBjb21wYXJpc29uLiBOb24tZHluYW1pY1xuICAgKiBQaGV0aW9PYmplY3RzIGhhdmUgdGhlIHRyaXZpYWwgY2FzZSB3aGVyZSBpdHMgYXJjaGV0eXBhbCBwaGV0aW9JRCBpcyB0aGUgc2FtZSBhcyBpdHMgcGhldGlvSUQuXG4gICAqL1xuICBwdWJsaWMgZ2V0QXJjaGV0eXBhbFBoZXRpb0lEKCk6IFBoZXRpb0lEIHtcbiAgICByZXR1cm4gd2luZG93LnBoZXRpby5QaGV0aW9JRFV0aWxzLmdldEFyY2hldHlwYWxQaGV0aW9JRCggdGhpcy5waGV0aW9JRCApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBncm91cCB0YW5kZW0gZm9yIGNyZWF0aW5nIG11bHRpcGxlIGluZGV4ZWQgY2hpbGQgdGFuZGVtcywgc3VjaCBhczpcbiAgICogc2ltLnNjcmVlbi5tb2RlbC5lbGVjdHJvbjBcbiAgICogc2ltLnNjcmVlbi5tb2RlbC5lbGVjdHJvbjFcbiAgICpcbiAgICogSW4gdGhpcyBjYXNlLCAnc2ltLnNjcmVlbi5tb2RlbC5lbGVjdHJvbicgaXMgdGhlIHN0cmluZyBwYXNzZWQgdG8gY3JlYXRlR3JvdXBUYW5kZW0uXG4gICAqXG4gICAqIFVzZWQgZm9yIGFycmF5cywgb2JzZXJ2YWJsZSBhcnJheXMsIG9yIHdoZW4gbWFueSBlbGVtZW50cyBvZiB0aGUgc2FtZSB0eXBlIGFyZSBjcmVhdGVkIGFuZCB0aGV5IGRvIG5vdCBvdGhlcndpc2VcbiAgICogaGF2ZSB1bmlxdWUgaWRlbnRpZmllcnMuXG4gICAqL1xuICBwdWJsaWMgY3JlYXRlR3JvdXBUYW5kZW0oIG5hbWU6IHN0cmluZyApOiBHcm91cFRhbmRlbSB7XG4gICAgaWYgKCB0aGlzLmNoaWxkcmVuWyBuYW1lIF0gKSB7XG4gICAgICByZXR1cm4gdGhpcy5jaGlsZHJlblsgbmFtZSBdIGFzIEdyb3VwVGFuZGVtO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IEdyb3VwVGFuZGVtKCB0aGlzLCBuYW1lICk7XG4gIH1cblxuICBwdWJsaWMgZXF1YWxzKCB0YW5kZW06IFRhbmRlbSApOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5waGV0aW9JRCA9PT0gdGFuZGVtLnBoZXRpb0lEO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgbm90aWZpZWQgd2hlbiBpdGVtcyBhcmUgcmVnaXN0ZXJlZC9kZXJlZ2lzdGVyZWRcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgYWRkUGhldGlvT2JqZWN0TGlzdGVuZXIoIHBoZXRpb09iamVjdExpc3RlbmVyOiBQaGV0aW9PYmplY3RMaXN0ZW5lciApOiB2b2lkIHtcbiAgICBwaGV0aW9PYmplY3RMaXN0ZW5lcnMucHVzaCggcGhldGlvT2JqZWN0TGlzdGVuZXIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZnRlciBhbGwgbGlzdGVuZXJzIGhhdmUgYmVlbiBhZGRlZCwgdGhlbiBUYW5kZW0gY2FuIGJlIGxhdW5jaGVkLiAgVGhpcyByZWdpc3RlcnMgYWxsIG9mIHRoZSBidWZmZXJlZCBQaGV0aW9PYmplY3RzXG4gICAqIGFuZCBzdWJzZXF1ZW50IFBoZXRpb09iamVjdHMgd2lsbCBiZSByZWdpc3RlcmVkIGRpcmVjdGx5LlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBsYXVuY2goKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIVRhbmRlbS5sYXVuY2hlZCwgJ1RhbmRlbSBjYW5ub3QgYmUgbGF1bmNoZWQgdHdpY2UnICk7XG4gICAgVGFuZGVtLmxhdW5jaGVkID0gdHJ1ZTtcblxuICAgIHdoaWxlICggbGF1bmNoTGlzdGVuZXJzLmxlbmd0aCA+IDAgKSB7XG4gICAgICBsYXVuY2hMaXN0ZW5lcnMuc2hpZnQoKSEoKTtcbiAgICB9XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbGF1bmNoTGlzdGVuZXJzLmxlbmd0aCA9PT0gMCApO1xuICB9XG5cbiAgLyoqXG4gICAqIE9OTFkgRk9SIFRFU1RJTkchISEhXG4gICAqIFRoaXMgd2FzIGNyZWF0ZWQgdG8gXCJ1bmRvXCIgbGF1bmNoIHNvIHRoYXQgdGVzdHMgY2FuIGJldHRlciBleHBvc2UgY2FzZXMgYXJvdW5kIGNhbGxpbmcgVGFuZGVtLmxhdW5jaCgpXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHVubGF1bmNoKCk6IHZvaWQge1xuICAgIFRhbmRlbS5sYXVuY2hlZCA9IGZhbHNlO1xuICAgIFRhbmRlbS5idWZmZXJlZFBoZXRpb09iamVjdHMubGVuZ3RoID0gMDtcbiAgICBsYXVuY2hMaXN0ZW5lcnMubGVuZ3RoID0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBsaXN0ZW5lciB0aGF0IHdpbGwgZmlyZSB3aGVuIFRhbmRlbSBpcyBsYXVuY2hlZFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBhZGRMYXVuY2hMaXN0ZW5lciggbGlzdGVuZXI6ICgpID0+IHZvaWQgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIVRhbmRlbS5sYXVuY2hlZCwgJ3RhbmRlbSBoYXMgYWxyZWFkeSBiZWVuIGxhdW5jaGVkLCBjYW5ub3QgYWRkIGxpc3RlbmVyIGZvciB0aGF0IGhvb2suJyApO1xuICAgIGxhdW5jaExpc3RlbmVycy5wdXNoKCBsaXN0ZW5lciApO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBjb2xsZWN0ZWQgbWlzc2luZyB0YW5kZW1zIG9ubHkgcG9wdWxhdGVkIGZyb20gc3BlY2lmaWMgcXVlcnkgcGFyYW1ldGVyLCBzZWUgcGhldGlvUHJpbnRNaXNzaW5nVGFuZGVtc1xuICAgKiAocGhldC1pbyBpbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgbWlzc2luZ1RhbmRlbXMgPSBtaXNzaW5nVGFuZGVtcztcblxuICAvKipcbiAgICogSWYgUGhFVC1pTyBpcyBlbmFibGVkIGluIHRoaXMgcnVudGltZS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgUEhFVF9JT19FTkFCTEVEID0gUEhFVF9JT19FTkFCTEVEO1xuXG4gIC8qKlxuICAgKiBJZiBQaEVULWlPIGlzIHJ1bm5pbmcgd2l0aCB2YWxpZGF0aW9uIGVuYWJsZWQuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFZBTElEQVRJT04gPSBWQUxJREFUSU9OO1xuXG4gIC8qKlxuICAgKiBGb3IgdGhlIEFQSSBmaWxlLCB0aGUga2V5IG5hbWUgZm9yIHRoZSBtZXRhZGF0YSBzZWN0aW9uLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBNRVRBREFUQV9LRVkgPSAnX21ldGFkYXRhJztcblxuICAvKipcbiAgICogRm9yIHRoZSBBUEkgZmlsZSwgdGhlIGtleSBuYW1lIGZvciB0aGUgZGF0YSBzZWN0aW9uLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBEQVRBX0tFWSA9ICdfZGF0YSc7XG5cbiAgLy8gQmVmb3JlIGxpc3RlbmVycyBhcmUgd2lyZWQgdXAsIHRhbmRlbXMgYXJlIGJ1ZmZlcmVkLiAgV2hlbiBsaXN0ZW5lcnMgYXJlIHdpcmVkIHVwLCBUYW5kZW0ubGF1bmNoKCkgaXMgY2FsbGVkIGFuZFxuICAvLyBidWZmZXJlZCB0YW5kZW1zIGFyZSBmbHVzaGVkLCB0aGVuIHN1YnNlcXVlbnQgdGFuZGVtcyBhcmUgZGVsaXZlcmVkIHRvIGxpc3RlbmVycyBkaXJlY3RseVxuICBwdWJsaWMgc3RhdGljIGxhdW5jaGVkID0gZmFsc2U7XG5cbiAgLy8gYSBsaXN0IG9mIFBoZXRpb09iamVjdHMgcmVhZHkgdG8gYmUgc2VudCBvdXQgdG8gbGlzdGVuZXJzLCBidXQgY2FuJ3QgYmVjYXVzZSBUYW5kZW0gaGFzbid0IGJlZW4gbGF1bmNoZWQgeWV0LlxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IGJ1ZmZlcmVkUGhldGlvT2JqZWN0czogUGhldGlvT2JqZWN0W10gPSBbXTtcblxuICBwdWJsaWMgY3JlYXRlVGFuZGVtRnJvbVBoZXRpb0lEKCBwaGV0aW9JRDogUGhldGlvSUQgKTogVGFuZGVtIHtcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVUYW5kZW0oIHBoZXRpb0lELnNwbGl0KCB3aW5kb3cucGhldGlvLlBoZXRpb0lEVXRpbHMuU0VQQVJBVE9SICkuam9pbiggSU5URVJfVEVSTV9TRVBBUkFUT1IgKSwge1xuICAgICAgaXNWYWxpZFRhbmRlbU5hbWU6ICggbmFtZTogc3RyaW5nICkgPT4gVGFuZGVtLmdldFJlZ2V4RnJvbUNoYXJhY3RlckNsYXNzKCBUYW5kZW1Db25zdGFudHMuQkFTRV9ERVJJVkVEX1RBTkRFTV9DSEFSQUNURVJfQ0xBU1MgKS50ZXN0KCBuYW1lIClcbiAgICB9ICk7XG4gIH1cblxuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBSb290VGFuZGVtID0gY2xhc3MgUm9vdFRhbmRlbSBleHRlbmRzIFRhbmRlbSB7XG5cbiAgICAvKipcbiAgICAgKiBSb290VGFuZGVtcyBvbmx5IGFjY2VwdCBzcGVjaWZpY2FsbHkgbmFtZWQgY2hpbGRyZW4uXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGNyZWF0ZVRhbmRlbSggbmFtZTogc3RyaW5nLCBvcHRpb25zPzogVGFuZGVtT3B0aW9ucyApOiBUYW5kZW0ge1xuICAgICAgaWYgKCBUYW5kZW0uVkFMSURBVElPTiApIHtcbiAgICAgICAgY29uc3QgYWxsb3dlZE9uUm9vdCA9IG5hbWUgPT09IHdpbmRvdy5waGV0aW8uUGhldGlvSURVdGlscy5HTE9CQUxfQ09NUE9ORU5UX05BTUUgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPT09IFJFUVVJUkVEX1RBTkRFTV9OQU1FIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lID09PSBPUFRJT05BTF9UQU5ERU1fTkFNRSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9PT0gVEVTVF9UQU5ERU1fTkFNRSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9PT0gd2luZG93LnBoZXRpby5QaGV0aW9JRFV0aWxzLkdFTkVSQUxfQ09NUE9ORU5UX05BTUUgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uZW5kc1dpdGgoIG5hbWUsIFRhbmRlbS5TQ1JFRU5fVEFOREVNX05BTUVfU1VGRklYICk7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGFsbG93ZWRPblJvb3QsIGB0YW5kZW0gbmFtZSBub3QgYWxsb3dlZCBvbiByb290OiBcIiR7bmFtZX1cIjsgcGVyaGFwcyB0cnkgcHV0dGluZyBpdCB1bmRlciBnZW5lcmFsIG9yIGdsb2JhbGAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN1cGVyLmNyZWF0ZVRhbmRlbSggbmFtZSwgb3B0aW9ucyApO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogVGhlIHJvb3QgdGFuZGVtIGZvciBhIHNpbXVsYXRpb25cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgUk9PVDogVGFuZGVtID0gbmV3IFRhbmRlbS5Sb290VGFuZGVtKCBudWxsLCBfLmNhbWVsQ2FzZSggcGFja2FnZUpTT04ubmFtZSApICk7XG5cbiAgLyoqXG4gICAqIE1hbnkgc2ltdWxhdGlvbiBlbGVtZW50cyBhcmUgbmVzdGVkIHVuZGVyIFwiZ2VuZXJhbFwiLiBUaGlzIHRhbmRlbSBpcyBmb3IgZWxlbWVudHMgdGhhdCBleGlzdHMgaW4gYWxsIHNpbXMuIEZvciBhXG4gICAqIHBsYWNlIHRvIHB1dCBzaW11bGF0aW9uIHNwZWNpZmljIGdsb2JhbHMsIHNlZSBgR0xPQkFMYFxuICAgKlxuICAgKiBAY29uc3RhbnRcbiAgICogQHR5cGUge1RhbmRlbX1cbiAgICovXG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IEdFTkVSQUwgPSBUYW5kZW0uUk9PVC5jcmVhdGVUYW5kZW0oIHdpbmRvdy5waGV0aW8uUGhldGlvSURVdGlscy5HRU5FUkFMX0NPTVBPTkVOVF9OQU1FICk7XG5cbiAgLyoqXG4gICAqIFVzZWQgaW4gdW5pdCB0ZXN0c1xuICAgKi9cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBST09UX1RFU1QgPSBUYW5kZW0uUk9PVC5jcmVhdGVUYW5kZW0oIFRFU1RfVEFOREVNX05BTUUgKTtcblxuICAvKipcbiAgICogVGFuZGVtIGZvciBtb2RlbCBzaW11bGF0aW9uIGVsZW1lbnRzIHRoYXQgYXJlIGdlbmVyYWwgdG8gYWxsIHNpbXMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEdFTkVSQUxfTU9ERUwgPSBUYW5kZW0uR0VORVJBTC5jcmVhdGVUYW5kZW0oIHdpbmRvdy5waGV0aW8uUGhldGlvSURVdGlscy5NT0RFTF9DT01QT05FTlRfTkFNRSApO1xuXG4gIC8qKlxuICAgKiBUYW5kZW0gZm9yIHZpZXcgc2ltdWxhdGlvbiBlbGVtZW50cyB0aGF0IGFyZSBnZW5lcmFsIHRvIGFsbCBzaW1zLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBHRU5FUkFMX1ZJRVcgPSBUYW5kZW0uR0VORVJBTC5jcmVhdGVUYW5kZW0oIHdpbmRvdy5waGV0aW8uUGhldGlvSURVdGlscy5WSUVXX0NPTVBPTkVOVF9OQU1FICk7XG5cbiAgLyoqXG4gICAqIFRhbmRlbSBmb3IgY29udHJvbGxlciBzaW11bGF0aW9uIGVsZW1lbnRzIHRoYXQgYXJlIGdlbmVyYWwgdG8gYWxsIHNpbXMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEdFTkVSQUxfQ09OVFJPTExFUiA9IFRhbmRlbS5HRU5FUkFMLmNyZWF0ZVRhbmRlbSggd2luZG93LnBoZXRpby5QaGV0aW9JRFV0aWxzLkNPTlRST0xMRVJfQ09NUE9ORU5UX05BTUUgKTtcblxuICAvKipcbiAgICogU2ltdWxhdGlvbiBlbGVtZW50cyB0aGF0IGRvbid0IGJlbG9uZyBpbiBzY3JlZW5zIHNob3VsZCBiZSBuZXN0ZWQgdW5kZXIgXCJnbG9iYWxcIi4gTm90ZSB0aGF0IHRoaXMgdGFuZGVtIHNob3VsZCBvbmx5XG4gICAqIGhhdmUgc2ltdWxhdGlvbiBzcGVjaWZpYyBlbGVtZW50cyBpbiB0aGVtLiBJbnN0cnVtZW50IGl0ZW1zIHVzZWQgYnkgYWxsIHNpbXMgdW5kZXIgYFRhbmRlbS5HRU5FUkFMYC4gTW9zdFxuICAgKiBsaWtlbHkgc2ltdWxhdGlvbnMgZWxlbWVudHMgc2hvdWxkIG5vdCBiZSBkaXJlY3RseSB1bmRlciB0aGlzLCBidXQgaW5zdGVhZCBlaXRoZXIgdW5kZXIgdGhlIG1vZGVsIG9yIHZpZXcgc3ViXG4gICAqIHRhbmRlbXMuXG4gICAqXG4gICAqIEBjb25zdGFudFxuICAgKiBAdHlwZSB7VGFuZGVtfVxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgR0xPQkFMID0gVGFuZGVtLlJPT1QuY3JlYXRlVGFuZGVtKCB3aW5kb3cucGhldGlvLlBoZXRpb0lEVXRpbHMuR0xPQkFMX0NPTVBPTkVOVF9OQU1FICk7XG5cbiAgLyoqXG4gICAqIE1vZGVsIHNpbXVsYXRpb24gZWxlbWVudHMgdGhhdCBkb24ndCBiZWxvbmcgaW4gc3BlY2lmaWMgc2NyZWVucyBzaG91bGQgYmUgbmVzdGVkIHVuZGVyIHRoaXMgVGFuZGVtLiBOb3RlIHRoYXQgdGhpc1xuICAgKiB0YW5kZW0gc2hvdWxkIG9ubHkgaGF2ZSBzaW11bGF0aW9uIHNwZWNpZmljIGVsZW1lbnRzIGluIHRoZW0uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEdMT0JBTF9NT0RFTCA9IFRhbmRlbS5HTE9CQUwuY3JlYXRlVGFuZGVtKCB3aW5kb3cucGhldGlvLlBoZXRpb0lEVXRpbHMuTU9ERUxfQ09NUE9ORU5UX05BTUUgKTtcblxuICAvKipcbiAgICogVmlldyBzaW11bGF0aW9uIGVsZW1lbnRzIHRoYXQgZG9uJ3QgYmVsb25nIGluIHNwZWNpZmljIHNjcmVlbnMgc2hvdWxkIGJlIG5lc3RlZCB1bmRlciB0aGlzIFRhbmRlbS4gTm90ZSB0aGF0IHRoaXNcbiAgICogdGFuZGVtIHNob3VsZCBvbmx5IGhhdmUgc2ltdWxhdGlvbiBzcGVjaWZpYyBlbGVtZW50cyBpbiB0aGVtLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBHTE9CQUxfVklFVyA9IFRhbmRlbS5HTE9CQUwuY3JlYXRlVGFuZGVtKCB3aW5kb3cucGhldGlvLlBoZXRpb0lEVXRpbHMuVklFV19DT01QT05FTlRfTkFNRSApO1xuXG4gIC8qKlxuICAgKiBDb2xvcnMgdXNlZCBpbiB0aGUgc2ltdWxhdGlvbi5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgQ09MT1JTID0gVGFuZGVtLkdMT0JBTF9WSUVXLmNyZWF0ZVRhbmRlbSggd2luZG93LnBoZXRpby5QaGV0aW9JRFV0aWxzLkNPTE9SU19DT01QT05FTlRfTkFNRSApO1xuXG4gIC8qKlxuICAgKiBDb2xvcnMgdXNlZCBpbiB0aGUgc2ltdWxhdGlvbi5cbiAgICovXG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBTVFJJTkdTID0gVGFuZGVtLkdFTkVSQUxfTU9ERUwuY3JlYXRlVGFuZGVtKCB3aW5kb3cucGhldGlvLlBoZXRpb0lEVXRpbHMuU1RSSU5HU19DT01QT05FTlRfTkFNRSApO1xuXG4gIC8qKlxuICAgKiBHZXQgdGhlIFRhbmRlbSBsb2NhdGlvbiBmb3IgbW9kZWwgc3RyaW5ncy4gUHJvdmlkZSB0aGUgY2FtZWxDYXNlZCByZXBvIG5hbWUgZm9yIHdoZXJlIHRoZSBzdHJpbmcgc2hvdWxkIGJlXG4gICAqIG9yZ2FuaXplZC4gVGhpcyB3aWxsIGRlZmF1bHQgdG8gdGhlIHNpbSdzIG5hbWUuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdGFuZGVtL2lzc3Vlcy8yOThcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0U3RyaW5nc1RhbmRlbSggbW9kdWxlTmFtZTogc3RyaW5nID0gVGFuZGVtLlJPT1QubmFtZSApOiBUYW5kZW0ge1xuICAgIHJldHVybiBUYW5kZW0uU1RSSU5HUy5jcmVhdGVUYW5kZW0oIG1vZHVsZU5hbWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIFRhbmRlbSBsb2NhdGlvbiBmb3IgZGVyaXZlZCBtb2RlbCBzdHJpbmdzLiBQcm92aWRlIHRoZSBjYW1lbENhc2VkIHJlcG8gbmFtZSBmb3Igd2hlcmUgdGhlIHN0cmluZyBzaG91bGQgYmVcbiAgICogb3JnYW5pemVkLiBUaGlzIHdpbGwgZGVmYXVsdCB0byB0aGUgc2ltJ3MgbmFtZS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy90YW5kZW0vaXNzdWVzLzI5OFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXREZXJpdmVkU3RyaW5nc1RhbmRlbSggbW9kdWxlTmFtZTogc3RyaW5nID0gVGFuZGVtLlJPT1QubmFtZSApOiBUYW5kZW0ge1xuICAgIHJldHVybiBUYW5kZW0uZ2V0U3RyaW5nc1RhbmRlbSggbW9kdWxlTmFtZSApLmNyZWF0ZVRhbmRlbSggJ2Rlcml2ZWRTdHJpbmdzJyApO1xuICB9XG5cbiAgLyoqXG4gICAqIEluIFR5cGVTY3JpcHQsIG9wdGlvbml6ZSBhbHJlYWR5IGtub3dzIHRoYXQgYHRhbmRlbWAgbWF5IGJlIHVuZGVmaW5lZCwganVzdCB1c2UgYG9wdGlvbnMudGFuZGVtP2AgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy90YW5kZW0vaXNzdWVzLzI4OVxuICAgKiBVc2VkIHRvIGluZGljYXRlIGEgY29tbW9uIGNvZGUgY29tcG9uZW50IHRoYXQgc3VwcG9ydHMgdGFuZGVtLCBidXQgZG9lc24ndCByZXF1aXJlIGl0LiAgSWYgYSB0YW5kZW0gaXMgbm90XG4gICAqIHBhc3NlZCBpbiwgdGhlbiBpdCB3aWxsIG5vdCBiZSBpbnN0cnVtZW50ZWQuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE9QVElPTkFMID0gVGFuZGVtLlJPT1QuY3JlYXRlVGFuZGVtKCBPUFRJT05BTF9UQU5ERU1fTkFNRSwge1xuICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICBzdXBwbGllZDogZmFsc2VcbiAgfSApO1xuXG4gIC8qKlxuICAgKiBUbyBiZSB1c2VkIGV4Y2x1c2l2ZWx5IHRvIG9wdCBvdXQgb2Ygc2l0dWF0aW9ucyB3aGVyZSBhIHRhbmRlbSBpcyByZXF1aXJlZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy90YW5kZW0vaXNzdWVzLzk3LlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBPUFRfT1VUID0gVGFuZGVtLk9QVElPTkFMO1xuXG4gIC8qKlxuICAgKiBTb21lIGNvbW1vbiBjb2RlIChzdWNoIGFzIENoZWNrYm94IG9yIFJhZGlvQnV0dG9uKSBtdXN0IGFsd2F5cyBiZSBpbnN0cnVtZW50ZWQuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFJFUVVJUkVEID0gVGFuZGVtLlJPT1QuY3JlYXRlVGFuZGVtKCBSRVFVSVJFRF9UQU5ERU1fTkFNRSwge1xuXG4gICAgLy8gbGV0IHBoZXRpb1ByaW50TWlzc2luZ1RhbmRlbXMgYnlwYXNzIHRoaXNcbiAgICByZXF1aXJlZDogVkFMSURBVElPTiB8fCBQUklOVF9NSVNTSU5HX1RBTkRFTVMsXG4gICAgc3VwcGxpZWQ6IGZhbHNlXG4gIH0gKTtcblxuICAvKipcbiAgICogVXNlIHRoaXMgYXMgdGhlIHBhcmVudCB0YW5kZW0gZm9yIFByb3BlcnRpZXMgdGhhdCBhcmUgcmVsYXRlZCB0byBzaW0tc3BlY2lmaWMgcHJlZmVyZW5jZXMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFBSRUZFUkVOQ0VTID0gVGFuZGVtLkdMT0JBTF9NT0RFTC5jcmVhdGVUYW5kZW0oICdwcmVmZXJlbmNlcycgKTtcbn1cblxuVGFuZGVtLmFkZExhdW5jaExpc3RlbmVyKCAoKSA9PiB7XG4gIHdoaWxlICggVGFuZGVtLmJ1ZmZlcmVkUGhldGlvT2JqZWN0cy5sZW5ndGggPiAwICkge1xuICAgIGNvbnN0IHBoZXRpb09iamVjdCA9IFRhbmRlbS5idWZmZXJlZFBoZXRpb09iamVjdHMuc2hpZnQoKTtcbiAgICBwaGV0aW9PYmplY3QhLnRhbmRlbS5hZGRQaGV0aW9PYmplY3QoIHBoZXRpb09iamVjdCEgKTtcbiAgfVxuICBhc3NlcnQgJiYgYXNzZXJ0KCBUYW5kZW0uYnVmZmVyZWRQaGV0aW9PYmplY3RzLmxlbmd0aCA9PT0gMCwgJ2J1ZmZlcmVkUGhldGlvT2JqZWN0cyBzaG91bGQgYmUgZW1wdHknICk7XG59ICk7XG5cbi8qKlxuICogR3JvdXAgVGFuZGVtIC0tIERlY2xhcmVkIGluIHRoZSBzYW1lIGZpbGUgdG8gYXZvaWQgY2lyY3VsYXIgcmVmZXJlbmNlIGVycm9ycyBpbiBtb2R1bGUgbG9hZGluZy5cbiAqL1xuY2xhc3MgR3JvdXBUYW5kZW0gZXh0ZW5kcyBUYW5kZW0ge1xuICBwcml2YXRlIHJlYWRvbmx5IGdyb3VwTmFtZTogc3RyaW5nO1xuXG4gIC8vIGZvciBnZW5lcmF0aW5nIGluZGljZXMgZnJvbSBhIHBvb2xcbiAgcHJpdmF0ZSBncm91cE1lbWJlckluZGV4OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIGNyZWF0ZSB3aXRoIFRhbmRlbS5jcmVhdGVHcm91cFRhbmRlbVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwYXJlbnRUYW5kZW06IFRhbmRlbSwgbmFtZTogc3RyaW5nICkge1xuICAgIHN1cGVyKCBwYXJlbnRUYW5kZW0sIG5hbWUgKTtcblxuICAgIHRoaXMuZ3JvdXBOYW1lID0gbmFtZTtcbiAgICB0aGlzLmdyb3VwTWVtYmVySW5kZXggPSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgdGhlIG5leHQgdGFuZGVtIGluIHRoZSBncm91cC5cbiAgICovXG4gIHB1YmxpYyBjcmVhdGVOZXh0VGFuZGVtKCk6IFRhbmRlbSB7XG4gICAgY29uc3QgdGFuZGVtID0gdGhpcy5wYXJlbnRUYW5kZW0hLmNyZWF0ZVRhbmRlbSggYCR7dGhpcy5ncm91cE5hbWV9JHt0aGlzLmdyb3VwTWVtYmVySW5kZXh9YCApO1xuICAgIHRoaXMuZ3JvdXBNZW1iZXJJbmRleCsrO1xuICAgIHJldHVybiB0YW5kZW07XG4gIH1cbn1cblxudGFuZGVtTmFtZXNwYWNlLnJlZ2lzdGVyKCAnVGFuZGVtJywgVGFuZGVtICk7XG5leHBvcnQgZGVmYXVsdCBUYW5kZW07Il0sIm5hbWVzIjpbImFycmF5UmVtb3ZlIiwibWVyZ2UiLCJvcHRpb25pemUiLCJUYW5kZW1Db25zdGFudHMiLCJ0YW5kZW1OYW1lc3BhY2UiLCJwYWNrYWdlSlNPTiIsIl8iLCJoYXNJbiIsIndpbmRvdyIsInBoZXQiLCJjaGlwcGVyIiwicGFja2FnZU9iamVjdCIsIm5hbWUiLCJQSEVUX0lPX0VOQUJMRUQiLCJQUklOVF9NSVNTSU5HX1RBTkRFTVMiLCJwcmVsb2FkcyIsInBoZXRpbyIsInF1ZXJ5UGFyYW1ldGVycyIsInBoZXRpb1ByaW50TWlzc2luZ1RhbmRlbXMiLCJJU19WQUxJREFUSU9OX0RFRkFVTFQiLCJ2YWxpZGF0aW9uIiwiSVNfVkFMSURBVElPTl9RVUVSWV9QQVJBTUVURVJfU1BFQ0lGSUVEIiwiUXVlcnlTdHJpbmdNYWNoaW5lIiwiY29udGFpbnNLZXkiLCJJU19WQUxJREFUSU9OX1NQRUNJRklFRCIsInBoZXRpb1ZhbGlkYXRpb24iLCJWQUxJREFUSU9OIiwiVU5BTExPV0VEX1RBTkRFTV9OQU1FUyIsIlJFUVVJUkVEX1RBTkRFTV9OQU1FIiwiT1BUSU9OQUxfVEFOREVNX05BTUUiLCJGT1JCSURERU5fU1VQUExJRURfVEFOREVNX05BTUVTIiwiVEVTVF9UQU5ERU1fTkFNRSIsIklOVEVSX1RFUk1fU0VQQVJBVE9SIiwiUGhldGlvSURVdGlscyIsIkRZTkFNSUNfQVJDSEVUWVBFX05BTUUiLCJBUkNIRVRZUEUiLCJtaXNzaW5nVGFuZGVtcyIsInJlcXVpcmVkIiwib3B0aW9uYWwiLCJwaGV0aW9PYmplY3RMaXN0ZW5lcnMiLCJsYXVuY2hMaXN0ZW5lcnMiLCJUYW5kZW0iLCJnZXRSZWdleEZyb21DaGFyYWN0ZXJDbGFzcyIsInRhbmRlbUNoYXJhY3RlckNsYXNzIiwiQkFTRV9UQU5ERU1fQ0hBUkFDVEVSX0NMQVNTIiwiUmVnRXhwIiwib25NaXNzaW5nVGFuZGVtIiwidGFuZGVtIiwic3VwcGxpZWQiLCJzdGFja1RyYWNlIiwiY2FwdHVyZVN0YWNrVHJhY2UiLCJwdXNoIiwicGhldGlvSUQiLCJzdGFjayIsImluY2x1ZGVzIiwibGltaXQiLCJJbmZpbml0eSIsImRlc2NyaXB0b3IiLCJPYmplY3QiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJFcnJvciIsInN0YWNrVHJhY2VXcml0YWJsZSIsIndyaXRhYmxlIiwic2V0Iiwib3JpZ2luYWxTdGFja1RyYWNlTGltaXQiLCJzdGFja1RyYWNlTGltaXQiLCJhZGRQaGV0aW9PYmplY3QiLCJwaGV0aW9PYmplY3QiLCJhc3NlcnQiLCJsYXVuY2hlZCIsImJ1ZmZlcmVkUGhldGlvT2JqZWN0cyIsImkiLCJsZW5ndGgiLCJoYXNBbmNlc3RvciIsImFuY2VzdG9yIiwicGFyZW50VGFuZGVtIiwicmVtb3ZlUGhldGlvT2JqZWN0IiwiZGlzcG9zZSIsImdldEV4dGVuZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJjcmVhdGVUYW5kZW0iLCJoYXNDaGlsZCIsImN1cnJlbnRDaGlsZCIsImNoaWxkcmVuIiwiY3JlYXRlVGFuZGVtMUluZGV4ZWQiLCJpbmRleCIsImhhc093blByb3BlcnR5IiwiYWRkQ2hpbGQiLCJpdGVyYXRlRGVzY2VuZGFudHMiLCJjYWxsYmFjayIsImNoaWxkTmFtZSIsInJlbW92ZUNoaWxkIiwiaXNEaXNwb3NlZCIsImdldEFyY2hldHlwYWxQaGV0aW9JRCIsImNyZWF0ZUdyb3VwVGFuZGVtIiwiR3JvdXBUYW5kZW0iLCJlcXVhbHMiLCJhZGRQaGV0aW9PYmplY3RMaXN0ZW5lciIsInBoZXRpb09iamVjdExpc3RlbmVyIiwibGF1bmNoIiwic2hpZnQiLCJ1bmxhdW5jaCIsImFkZExhdW5jaExpc3RlbmVyIiwibGlzdGVuZXIiLCJjcmVhdGVUYW5kZW1Gcm9tUGhldGlvSUQiLCJzcGxpdCIsIlNFUEFSQVRPUiIsImpvaW4iLCJpc1ZhbGlkVGFuZGVtTmFtZSIsIkJBU0VfREVSSVZFRF9UQU5ERU1fQ0hBUkFDVEVSX0NMQVNTIiwidGVzdCIsImdldFN0cmluZ3NUYW5kZW0iLCJtb2R1bGVOYW1lIiwiUk9PVCIsIlNUUklOR1MiLCJnZXREZXJpdmVkU3RyaW5nc1RhbmRlbSIsInByb3ZpZGVkT3B0aW9ucyIsIk1FVEFEQVRBX0tFWSIsImFwcGVuZCIsImV2ZXJ5IiwiZm9yYmlkZGVuTmFtZSIsIlNDUkVFTl9UQU5ERU1fTkFNRV9TVUZGSVgiLCJEQVRBX0tFWSIsIlJvb3RUYW5kZW0iLCJhbGxvd2VkT25Sb290IiwiR0xPQkFMX0NPTVBPTkVOVF9OQU1FIiwiR0VORVJBTF9DT01QT05FTlRfTkFNRSIsImVuZHNXaXRoIiwiY2FtZWxDYXNlIiwiR0VORVJBTCIsIlJPT1RfVEVTVCIsIkdFTkVSQUxfTU9ERUwiLCJNT0RFTF9DT01QT05FTlRfTkFNRSIsIkdFTkVSQUxfVklFVyIsIlZJRVdfQ09NUE9ORU5UX05BTUUiLCJHRU5FUkFMX0NPTlRST0xMRVIiLCJDT05UUk9MTEVSX0NPTVBPTkVOVF9OQU1FIiwiR0xPQkFMIiwiR0xPQkFMX01PREVMIiwiR0xPQkFMX1ZJRVciLCJDT0xPUlMiLCJDT0xPUlNfQ09NUE9ORU5UX05BTUUiLCJTVFJJTkdTX0NPTVBPTkVOVF9OQU1FIiwiT1BUSU9OQUwiLCJPUFRfT1VUIiwiUkVRVUlSRUQiLCJQUkVGRVJFTkNFUyIsImNyZWF0ZU5leHRUYW5kZW0iLCJncm91cE5hbWUiLCJncm91cE1lbWJlckluZGV4IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7O0NBTUMsR0FFRCxPQUFPQSxpQkFBaUIsb0NBQW9DO0FBQzVELE9BQU9DLFdBQVcsOEJBQThCO0FBQ2hELE9BQU9DLGVBQWUsa0NBQWtDO0FBR3hELE9BQU9DLHFCQUFxQix1QkFBdUI7QUFDbkQsT0FBT0MscUJBQXFCLHVCQUF1QjtBQUVuRCxZQUFZO0FBQ1osaUVBQWlFO0FBQ2pFLE1BQU1DLGNBQWNDLEVBQUVDLEtBQUssQ0FBRUMsUUFBUSxnQ0FBaUNDLEtBQUtDLE9BQU8sQ0FBQ0MsYUFBYSxHQUFHO0lBQUVDLE1BQU07QUFBYztBQUV6SCxNQUFNQyxrQkFBa0JQLEVBQUVDLEtBQUssQ0FBRUMsUUFBUTtBQUN6QyxNQUFNTSx3QkFBd0JELG1CQUFtQkosS0FBS00sUUFBUSxDQUFDQyxNQUFNLENBQUNDLGVBQWUsQ0FBQ0MseUJBQXlCO0FBRS9HLGtGQUFrRjtBQUNsRixNQUFNQyx3QkFB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