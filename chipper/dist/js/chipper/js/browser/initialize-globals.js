// Copyright 2015-2024, University of Colorado Boulder
/**
 * Initializes phet globals that are used by all simulations, including assertions and query-parameters.
 * See https://github.com/phetsims/phetcommon/issues/23
 * This file must be loaded before the simulation is started up, and this file cannot be loaded as an AMD module.
 * The easiest way to do this is via a <script> tag in your HTML file.
 *
 * PhET Simulations can be launched with query parameters which enable certain features.  To use a query parameter,
 * provide the full URL of the simulation and append a question mark (?) then the query parameter (and optionally its
 * value assignment).  For instance:
 * https://phet-dev.colorado.edu/html/reactants-products-and-leftovers/1.0.0-dev.13/reactants-products-and-leftovers_en.html?dev
 *
 * Here is an example of a value assignment:
 * https://phet-dev.colorado.edu/html/reactants-products-and-leftovers/1.0.0-dev.13/reactants-products-and-leftovers_en.html?webgl=false
 *
 * To use multiple query parameters, specify the question mark before the first query parameter, then ampersands (&)
 * between other query parameters.  Here is an example of multiple query parameters:
 * https://phet-dev.colorado.edu/html/reactants-products-and-leftovers/1.0.0-dev.13/reactants-products-and-leftovers_en.html?dev&showPointerAreas&webgl=false
 *
 * For more on query parameters in general, see http://en.wikipedia.org/wiki/Query_string
 * For details on common-code query parameters, see QUERY_PARAMETERS_SCHEMA below.
 * For sim-specific query parameters (if there are any), see *QueryParameters.js in the simulation's repository.
 *
 * Many of these query parameters' jsdoc is rendered and visible publicly to PhET-iO client. Those sections should be
 * marked, see top level comment in PhetioClient.js about private vs public documentation
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Chris Malley (PixelZoom, Inc.)
 */ (function() {
    var _packagePhet_simFeatures, _packagePhet_simFeatures1;
    assert && assert(window.QueryStringMachine, 'QueryStringMachine is used, and should be loaded before this code runs');
    var _window_phet;
    // Create the attachment point for all PhET globals
    window.phet = (_window_phet = window.phet) != null ? _window_phet : {};
    window.phet.preloads = window.phet.preloads || {};
    var _window_phet_chipper;
    window.phet.chipper = (_window_phet_chipper = window.phet.chipper) != null ? _window_phet_chipper : {};
    var _phet_chipper_packageObject;
    // packageObject may not always be available if initialize-globals used without chipper-initialization.js
    const packageObject = (_phet_chipper_packageObject = phet.chipper.packageObject) != null ? _phet_chipper_packageObject : {};
    var _packageObject_phet;
    const packagePhet = (_packageObject_phet = packageObject.phet) != null ? _packageObject_phet : {};
    var _phet_chipper_allowLocaleSwitching;
    // Not all runtimes will have this flag, so be graceful
    const allowLocaleSwitching = (_phet_chipper_allowLocaleSwitching = phet.chipper.allowLocaleSwitching) != null ? _phet_chipper_allowLocaleSwitching : true;
    var _packagePhet_simFeatures2;
    // duck type defaults so that not all package.json files need to have a phet.simFeatures section.
    const packageSimFeatures = (_packagePhet_simFeatures2 = packagePhet.simFeatures) != null ? _packagePhet_simFeatures2 : {};
    // The color profile used by default, if no colorProfiles are specified in package.json.
    // NOTE: Duplicated in SceneryConstants.js since scenery does not include initialize-globals.js
    const DEFAULT_COLOR_PROFILE = 'default';
    const FALLBACK_LOCALE = 'en';
    var _packageSimFeatures_colorProfiles;
    // The possible color profiles for the current simulation.
    const colorProfiles = (_packageSimFeatures_colorProfiles = packageSimFeatures.colorProfiles) != null ? _packageSimFeatures_colorProfiles : [
        DEFAULT_COLOR_PROFILE
    ];
    var _window_phet_chipper_locale, _packagePhet_simFeatures_defaultRegionAndCulture, _packagePhet_simFeatures_supportedRegionsAndCultures;
    // Private Doc: Note: the following jsdoc is for the public facing PhET-iO API. In addition, all query parameters in the schema
    // that are a "memberOf" the "PhetQueryParameters" namespace are used in the jsdoc that is public (client facing)
    // phet-io documentation. Private comments about implementation details will be in comments above the jsdoc, and
    // marked as such.
    // Note: this had to be jsdoc directly for QUERY_PARAMETERS_SCHEMA to support the correct auto formatting.
    /**
   * Query parameters that manipulate the startup state of the PhET simulation. This is not
   * an object defined in the global scope, but rather it serves as documentation about available query parameters.
   * Note: The "flag" type for query parameters does not expect a value for the key, but rather just the presence of
   * the key itself.
   * @namespace {Object} PhetQueryParameters
   */ const QUERY_PARAMETERS_SCHEMA = {
        // Schema that describes query parameters for PhET common code.
        // These query parameters are available via global phet.chipper.queryParameters.
        /**
     * In environments where users should not be able to navigate hyperlinks away from the simulation, clients can use
     * ?allowLinks=false.  In this case, links are displayed and not clickable. This query parameter is public facing.
     * @memberOf PhetQueryParameters
     * @type {boolean}
     */ allowLinks: {
            type: 'boolean',
            defaultValue: true,
            public: true
        },
        /**
     * Allows setting of the sound state, possible values are 'enabled' (default), 'muted', and 'disabled'.  Sound
     * must be supported by the sim for this to have any effect.
     * @memberOf PhetQueryParameters
     * @type {string}
     */ audio: {
            type: 'string',
            defaultValue: 'enabled',
            validValues: [
                'enabled',
                'disabled',
                'muted'
            ],
            public: true
        },
        /**
     * Generates object reports that can be used by binder. For internal use.
     * See InstanceRegistry.js and binder repo (specifically getFromSimInMain.js) for more details.
     */ binder: {
            type: 'flag'
        },
        /**
     * specifies the brand that should be used in unbuilt mode
     */ brand: {
            type: 'string',
            defaultValue: 'adapted-from-phet'
        },
        /**
     * When present, will trigger changes that are more similar to the build environment.
     * Right now, this includes computing higher-resolution mipmaps for the mipmap plugin.
     */ buildCompatible: {
            type: 'flag'
        },
        /**
     * When provided a non-zero-length value, the sim will send out assorted events meant for continuous testing
     * integration (see sim-test.js).
     */ continuousTest: {
            type: 'string',
            defaultValue: ''
        },
        // Private Doc:  For external use. The below jsdoc is public to the PhET-iO API documentation. Change wisely.
        /**
     * The color profile used at startup, relevant only for sims that support multiple color profiles. 'default' and
     * 'projector' are implemented in several sims, other profile names are not currently standardized.
     * @memberOf PhetQueryParameters
     * @type {string}
     */ colorProfile: {
            type: 'string',
            defaultValue: colorProfiles[0],
            validValues: colorProfiles,
            public: true
        },
        /**
     * For memory profiling, it can sometimes be difficult to know when the app crashed and automatically restarted itself.
     * This flag will show the launch counter so you can tell how many times it has been launched.
     *
     * NOTE: There is no easy way to clear the local storage for this value, so correct usage would focus on the differences
     * in values rather than the absolute values.
     */ launchCounter: {
            type: 'flag'
        },
        /**
     * enables debugger commands in certain cases like thrown errors and failed tests.
     */ debugger: {
            type: 'flag'
        },
        // Output deprecation warnings via console.warn, see https://github.com/phetsims/chipper/issues/882. For internal
        // use only.
        deprecationWarnings: {
            type: 'flag'
        },
        /**
     * enables developer-only features, such as showing the layout bounds
     */ dev: {
            type: 'flag'
        },
        /**
     * sets all modal features of the sim as disabled. This is a development-only parameter that can be useful in
     * combination with fuzz testing. This was created to limit the amount of time fuzz testing spends on unimportant
     * features of the sim like the PhET Menu, Keyboard Help, and Preferences popups.
     */ disableModals: {
            type: 'flag'
        },
        /**
     * enables assertions
     */ ea: {
            type: 'flag'
        },
        /**
     * Enables all assertions, as above but with more time-consuming checks
     */ eall: {
            type: 'flag'
        },
        /**
     * Controls whether extra sound is on or off at startup (user can change later).  This query parameter is public
     * facing.
     * @type {boolean}
     */ extraSoundInitiallyEnabled: {
            type: 'flag',
            public: true
        },
        /**
     * Force Scenery to refresh SVG contents every frame (to help detect rendering/browser-repaint issues with SVG).
     */ forceSVGRefresh: {
            type: 'flag'
        },
        /**
     * Randomly sends mouse events and touch events to sim.
     */ fuzz: {
            type: 'flag'
        },
        /**
     * Randomly sends keyboard events to the sim. Must have accessibility enabled.
     */ fuzzBoard: {
            type: 'flag'
        },
        /**
     * Randomly sends mouse events to sim.
     */ fuzzMouse: {
            type: 'flag'
        },
        /**
     * The maximum number of concurrent pointers allowed for fuzzing. Using a value larger than 1 will test multitouch
     * behavior (with ?fuzz, ?fuzzMouse, ?fuzzTouch, etc.)
     */ fuzzPointers: {
            type: 'number',
            defaultValue: 1
        },
        /**
     * Randomly sends touch events to sim.
     */ fuzzTouch: {
            type: 'flag'
        },
        /**
     * if fuzzMouse=true or fuzzTouch=true, this is the average number of mouse/touch events to synthesize per frame.
     */ fuzzRate: {
            type: 'number',
            defaultValue: 100,
            isValidValue: function(value) {
                return value > 0;
            }
        },
        /**
     * Used for providing an external Google Analytics 4 (gtag.js) property for tracking, see
     * https://github.com/phetsims/phetcommon/issues/46 for more information.
     *
     * Generally, this string will start with 'G-' for GA4 trackers
     *
     * This is useful for various users/clients that want to embed simulations, or direct users to simulations. For
     * example, if a sim is included in an epub, the sim HTML won't have to be modified to include page tracking.
     */ ga4: {
            type: 'string',
            defaultValue: null,
            public: true
        },
        /**
     * Launches the game-up-camera code which delivers images to requests in BrainPOP/Game Up/SnapThought
     */ gameUp: {
            type: 'flag'
        },
        /**
     * Enables the game-up-camera code to respond to messages from any origin
     */ gameUpTestHarness: {
            type: 'flag'
        },
        /**
     * Enables logging for game-up-camera, see gameUp
     */ gameUpLogging: {
            type: 'flag'
        },
        /**
     * Used for providing a Google Analytics page ID for tracking, see
     * https://github.com/phetsims/phetcommon/issues/46 for more information.
     *
     * This is given as the 3rd parameter to a pageview send when provided
     */ gaPage: {
            type: 'string',
            defaultValue: null
        },
        // Private Doc:  For external use. The below jsdoc is public to the PhET-iO API documentation. Change wisely.
        /**
     * Indicates whether to display the home screen.
     * For multiscreen sims only, throws an assertion error if supplied for a single-screen sim.
     * @memberOf PhetQueryParameters
     * @type {boolean}
     */ homeScreen: {
            type: 'boolean',
            defaultValue: true,
            public: true
        },
        // Private Doc: For external use. The below jsdoc is public to the PhET-iO API documentation. Change wisely.
        // The value is one of the values in the screens array, not an index into the screens array.
        /**
     * Specifies the initial screen that will be visible when the sim starts.
     * See `?screens` query parameter for screen numbering.
     * For multiscreen sims only, throws an assertion error if applied in a single-screen sims.
     * The default value of 0 is the home screen.
     * @memberOf PhetQueryParameters
     * @type {number}
     */ initialScreen: {
            type: 'number',
            defaultValue: 0,
            public: true
        },
        /**
     * Enables support for Legends of Learning platform, including broadcasting 'init' and responding to pause/resume.
     */ legendsOfLearning: {
            type: 'flag'
        },
        /**
     * If this is a finite number AND assertions are enabled, it will track maximum (TinyEmitter) listener counts, and
     * will assert that the count is not greater than the limit.
     */ listenerLimit: {
            type: 'number',
            defaultValue: Number.POSITIVE_INFINITY,
            public: false
        },
        /**
     * Select the language of the sim to the specific locale. Default to "en".
     * @memberOf PhetQueryParameters
     * @type {string}
     */ locale: {
            type: 'string',
            defaultValue: (_window_phet_chipper_locale = window.phet.chipper.locale) != null ? _window_phet_chipper_locale : FALLBACK_LOCALE
        },
        /**
     * Specify supports for dynamic locale switching in the runtime of the sim. By default, the value will be the support
     * in the runnable's package.json. Use this to turn off things like the locale switcher preference.
     * The package flag for this means very specific things depending on its presence and value.
     * - By default, with no entry in the package.json, we will still try to support locale switching if multiple locales
     * are available.
     * - If you add the truthy flag (supportsDynamicLocale:true), then it will ensure that strings use StringProperties
     * in your sim.
     * - If you do not want to support this, then you can opt out in the package.json with supportsDynamicLocale:false
     *
     * For more information about supporting dynamic locale, see the "Dynamic Strings Layout Quickstart Guide": https://github.com/phetsims/phet-info/blob/main/doc/dynamic-string-layout-quickstart.md
     */ supportsDynamicLocale: {
            type: 'boolean',
            defaultValue: allowLocaleSwitching && (!packageSimFeatures.hasOwnProperty('supportsDynamicLocale') || packageSimFeatures.supportsDynamicLocale)
        },
        /**
     * Enables basic logging to the console.
     * Usage in code: phet.log && phet.log( 'your message' );
     */ log: {
            type: 'flag'
        },
        /**
     * Sets a maximum "memory" limit (in MB). If the simulation's running average of memory usage goes over this amount
     * in operation (as determined currently by using Chrome's window.performance), then an error will be thrown.
     *
     * This is useful for continuous testing, to ensure we aren't leaking huge amounts of memory, and can also be used
     * with the Chrome command-line flag --enable-precise-memory-info to make the determination more accurate.
     *
     * The value 0 will be ignored, since our sims are likely to use more than that much memory.
     */ memoryLimit: {
            type: 'number',
            defaultValue: 0
        },
        /**
     * Enables transforming the PDOM for accessibility on mobile devices. This work is experimental, and still hidden
     * in a scenery branch pdom-transform. Must be used in combination with the accessibility query parameter, or
     * on a sim that has accessibility enabled by default. This query parameter is not intended to be long-lived,
     * in the future these features should be always enabled in the scenery a11y framework.
     * See https://github.com/phetsims/scenery/issues/852
     *
     * For internal use and testing only, though links with this may be shared with collaborators.
     *
     * @a11y
     */ mobileA11yTest: {
            type: 'flag'
        },
        /**
     * When a simulation is run from the PhET Android app, it should set this flag. It alters statistics that the sim sends
     * to Google Analytics and potentially other sources in the future.
     *
     * Also removes the following items from the "PhET Menu":
     * Report a Problem
     * Check for Updates
     * Screenshot
     * Full Screen
     */ 'phet-android-app': {
            type: 'flag'
        },
        /**
     * When a simulation is run from the PhET iOS app, it should set this flag. It alters statistics that the sim sends
     * to Google Analytics and potentially other sources in the future.
     *
     * Also removes the following items from the "PhET Menu":
     * Report a Problem
     * Check for Updates
     * Screenshot
     * Full Screen
     */ 'phet-app': {
            type: 'flag'
        },
        /**
     * If true, puts the simulation in a special mode where it will wait for manual control of the sim playback.
     */ playbackMode: {
            type: 'boolean',
            defaultValue: false
        },
        /**
     * Fires a post-message when the sim is about to change to another URL
     */ postMessageOnBeforeUnload: {
            type: 'flag'
        },
        /**
     * passes errors to parent frame (like fuzz-lightyear)
     */ postMessageOnError: {
            type: 'flag'
        },
        /**
     * triggers a post-message that fires when the sim finishes loading, currently used by aqua fuzz-lightyear
     */ postMessageOnLoad: {
            type: 'flag'
        },
        /**
     * triggers a post-message that fires when the simulation is ready to start.
     */ postMessageOnReady: {
            type: 'flag'
        },
        /**
     * If true, the full screen button won't be shown in the phet menu
     */ preventFullScreen: {
            type: 'flag'
        },
        /**
     * shows profiling information for the sim
     */ profiler: {
            type: 'flag'
        },
        /**
     * adds a menu item that will open a window with a QR code with the URL of the simulation
     */ qrCode: {
            type: 'flag'
        },
        /**
     * Random seed in the preload code that can be used to make sure playback simulations use the same seed (and thus
     * the simulation state, given the input events and frames, can be exactly reproduced)
     * See Random.js
     */ randomSeed: {
            type: 'number',
            defaultValue: Math.random()
        },
        /*
     * Sets the default for the Region and Culture feature. The set of valid values is determined by
     * "supportedRegionsAndCulturesValues" in package.json. If not provided in the URL, the default can
     * be set via "defaultRegionAndCulture" in package.json, which defaults to 'usa'.
     */ regionAndCulture: {
            public: true,
            type: 'string',
            defaultValue: (_packagePhet_simFeatures_defaultRegionAndCulture = packagePhet == null ? void 0 : (_packagePhet_simFeatures = packagePhet.simFeatures) == null ? void 0 : _packagePhet_simFeatures.defaultRegionAndCulture) != null ? _packagePhet_simFeatures_defaultRegionAndCulture : 'usa',
            validValues: (_packagePhet_simFeatures_supportedRegionsAndCultures = packagePhet == null ? void 0 : (_packagePhet_simFeatures1 = packagePhet.simFeatures) == null ? void 0 : _packagePhet_simFeatures1.supportedRegionsAndCultures) != null ? _packagePhet_simFeatures_supportedRegionsAndCultures : [
                'usa'
            ] // default value must be in validValues
        },
        /**
     * Specify a renderer for the Sim's rootNode to use.
     */ rootRenderer: {
            type: 'string',
            defaultValue: null,
            validValues: [
                null,
                'canvas',
                'svg',
                'dom',
                'webgl',
                'vello'
            ] // see Node.setRenderer
        },
        /**
     * Array of one or more logs to enable in scenery 0.2+, delimited with commas.
     * For example: ?sceneryLog=Display,Drawable,WebGLBlock results in [ 'Display', 'Drawable', 'WebGLBlock' ]
     * Don't change this without updating the signature in scenery unit tests too.
     *
     * The entire supported list is in scenery.js in the logProperties object.
     */ sceneryLog: {
            type: 'array',
            elementSchema: {
                type: 'string'
            },
            defaultValue: null
        },
        /**
     * Scenery logs will be output to a string instead of the window
     */ sceneryStringLog: {
            type: 'flag'
        },
        /**
     * Specifies the set of screens that appear in the sim, and their order.
     * Uses 1-based (not zero-based) and "," delimited string such as "1,3,4" to get the 1st, 3rd and 4th screen.
     * @type {Array.<number>}
     */ screens: {
            type: 'array',
            elementSchema: {
                type: 'number',
                isValidValue: Number.isInteger
            },
            defaultValue: null,
            isValidValue: function(value) {
                // screen indices cannot be duplicated
                return value === null || value.length === _.uniq(value).length && value.length > 0;
            },
            public: true
        },
        /**
     * Typically used to show answers (or hidden controls that show answers) to challenges in sim games.
     * For internal use by PhET team members only.
     */ showAnswers: {
            type: 'flag',
            private: true
        },
        /**
     * Displays an overlay of the current bounds of each CanvasNode
     */ showCanvasNodeBounds: {
            type: 'flag'
        },
        /**
     * Displays an overlay of the current bounds of each phet.scenery.FittedBlock
     */ showFittedBlockBounds: {
            type: 'flag'
        },
        /**
     * Shows hit areas as dashed lines.
     */ showHitAreas: {
            type: 'flag'
        },
        /**
     * Shows pointer areas as dashed lines. touchAreas are red, mouseAreas are blue.
     */ showPointerAreas: {
            type: 'flag'
        },
        /**
     * Displays a semi-transparent cursor indicator for the position of each active pointer on the screen.
     */ showPointers: {
            type: 'flag'
        },
        /**
     * Shows the visible bounds in ScreenView.js, for debugging the layout outside the "dev" bounds
     */ showVisibleBounds: {
            type: 'flag'
        },
        /**
     * Shuffles listeners each time they are notified, to help us test order dependency, see https://github.com/phetsims/axon/issues/215
     *
     * 'default' - no shuffling
     * 'random' - chooses a seed for you
     * 'random(123)' - specify a seed
     * 'reverse' - reverse the order of listeners
     */ listenerOrder: {
            type: 'string',
            defaultValue: 'default',
            isValidValue: function(value) {
                // NOTE: this regular expression must be maintained in TinyEmitter.ts as well.
                const regex = /random(?:%28|\()(\d+)(?:%29|\))/;
                return value === 'default' || value === 'random' || value === 'reverse' || value.match(regex);
            }
        },
        /**
     * When true, use SpeechSynthesisParentPolyfill to assign an implementation of SpeechSynthesis
     * to the window so that it can be used in platforms where it otherwise would not be available.
     * Assumes that an implementation of SpeechSynthesis is available from a parent iframe window.
     * See SpeechSynthesisParentPolyfill in utterance-queue for more information.
     *
     * This cannot be a query parameter in utterance-queue because utterance-queue (a dependency of scenery)
     * can not use QueryStringMachine. See https://github.com/phetsims/scenery/issues/1366.
     *
     * For more information about the motivation for this see https://github.com/phetsims/fenster/issues/3
     *
     * For internal use only.
     */ speechSynthesisFromParent: {
            type: 'flag'
        },
        /**
     * Speed multiplier for everything in the sim. This scales the value of dt for AXON/timer,
     * model.step, view.step, and anything else that is controlled from Sim.stepSimulation.
     * Normal speed is 1. Larger values make time go faster, smaller values make time go slower.
     * For example, ?speed=0.5 is half the normal speed.
     * Useful for testing multitouch, so that objects are easier to grab while they're moving.
     * For internal use only, not public facing.
     */ speed: {
            type: 'number',
            defaultValue: 1,
            isValidValue: function(value) {
                return value > 0;
            }
        },
        /**
     * Sets a string used for various i18n test.  The values are:
     *
     * double: duplicates all of the translated strings which will allow to see (a) if all strings
     *   are translated and (b) whether the layout can accommodate longer strings from other languages.
     *   Note this is a heuristic rule that does not cover all cases.
     *
     * long: an exceptionally long string will be substituted for all strings. Use this to test for layout problems.
     *
     * rtl: a string that tests RTL (right-to-left) capabilities will be substituted for all strings
     *
     * xss: tests for security issues related to https://github.com/phetsims/special-ops/issues/18,
     *   and running a sim should NOT redirect to another page. Preferably should be used for built versions or
     *   other versions where assertions are not enabled.
     *
     * none|null: the normal translated string will be shown
     *
     * dynamic: adds global hotkey listeners to change the strings, see https://github.com/phetsims/chipper/issues/1319
     *   right arrow - doubles a string, like string = string+string
     *   left arrow - halves a string
     *   up arrow - cycles to next stride in random word list
     *   down arrow - cycles to previous stride in random word list
     *   spacebar - resets to initial English strings, and resets the stride
     *
     * {string}: if any other string provided, that string will be substituted everywhere. This facilitates testing
     *   specific cases, like whether the word 'vitesse' would substitute for 'speed' well.  Also, using "/u20" it
     *   will show whitespace for all of the strings, making it easy to identify non-translated strings.
     */ stringTest: {
            type: 'string',
            defaultValue: null
        },
        /**
     * adds keyboard shortcuts. ctrl+i (forward) or ctrl+u (backward). Also, the same physical keys on the
     * dvorak keyboard (c=forward and g=backwards)
     *
     * NOTE: DUPLICATION ALERT. Don't change this without looking at parameter in PHET_IO_WRAPPERS/PhetioClient.ts
     */ keyboardLocaleSwitcher: {
            type: 'flag'
        },
        /**
     * Enables support for the accessible description plugin feature.
     */ supportsDescriptionPlugin: {
            type: 'boolean',
            defaultValue: !!packageSimFeatures.supportsDescriptionPlugin
        },
        /**
     *
     * Enables interactive description in the simulation. Use this option to render the Parallel DOM for keyboard
     * navigation and screen-reader-based auditory descriptions. Can be permanently enabled if
     * `supportsInteractiveDescription: true` is added under the `phet.simFeatures` entry of package.json. Query parameter
     * value will always override package.json entry.
     */ supportsInteractiveDescription: {
            type: 'boolean',
            defaultValue: !!packageSimFeatures.supportsInteractiveDescription
        },
        /**
     * Enables support for the "Interactive Highlights" feature, where highlights appear around interactive
     * UI components. This is most useful for users with low vision and makes it easier to identify interactive
     * components. Though enabled here, the feature will be turned off until enabled by the user from the Preferences
     * dialog.
     *
     * This feature is enabled by default whenever supportsInteractiveDescription is true in package.json, since PhET
     * wants to scale out this feature with all sims that support alternative input. The feature can be DISABLED when
     * supportsInteractiveDescription is true by setting `supportsInteractiveHighlights: false` under
     * `phet.simFeatures` in package.json.
     *
     * The query parameter will always override the package.json entry.
     */ supportsInteractiveHighlights: {
            type: 'boolean',
            // If supportsInteractiveHighlights is explicitly provided in package.json, use that value. Otherwise, enable
            // Interactive Highlights when Interactive Description is supported.
            defaultValue: packageSimFeatures.hasOwnProperty('supportsInteractiveHighlights') ? !!packageSimFeatures.supportsInteractiveHighlights : !!packageSimFeatures.supportsInteractiveDescription
        },
        /**
     * By default, Interactive Highlights are disabled on startup. Provide this flag to have the feature enabled on
     * startup. Has no effect if supportsInteractiveHighlights is false.
     */ interactiveHighlightsInitiallyEnabled: {
            type: 'flag',
            public: true
        },
        /**
     * Indicates whether custom gesture control is enabled by default in the simulation.
     * This input method is still in development, mostly to be used in combination with the voicing
     * feature. It allows you to swipe the screen to move focus, double tap the screen to activate
     * components, and tap and hold to initiate custom gestures.
     *
     * For internal use, though may be used in shared links with collaborators.
     */ supportsGestureControl: {
            type: 'boolean',
            defaultValue: !!packageSimFeatures.supportsGestureControl
        },
        /**
     * Controls whether the "Voicing" feature is enabled.
     *
     * This feature is enabled by default when supportsVoicing is true in package.json. The query parameter will always
     * override the package.json entry.
     */ supportsVoicing: {
            type: 'boolean',
            defaultValue: !!packageSimFeatures.supportsVoicing
        },
        /**
     * Switches the Vello rendering of Text to use Swash (with embedded fonts), instead of Canvas.
     *
     * For internal use only. This is currently only used in prototypes.
     */ swashText: {
            type: 'boolean',
            defaultValue: true
        },
        /**
     * If non-empty, Swash-rendered text will show up in the given color (useful for debugging)
     *
     * For internal use only. This is currently only used in prototypes.
     */ swashTextColor: {
            type: 'string',
            defaultValue: ''
        },
        /**
     * By default, voicing is not enabled on startup. Add this flag to start the sim with voicing enabled.
     * Only relevant if the sim supports Voicing.
     *
     * Some browsers may not support this because user input is required to start SpeechSynthesis. But it allows
     * teachers to start the sim with Voicing enabled, so it is still public and usable where possible.
     */ voicingInitiallyEnabled: {
            type: 'flag',
            public: true
        },
        /**
     * A debug query parameter that will save and load you preferences (from the Preferences Dialog) through multiple runtimes.
     * See PreferencesStorage.register to see what Properties support this save/load feature.
     */ preferencesStorage: {
            type: 'flag'
        },
        /**
     * Console log the voicing responses that are spoken by SpeechSynthesis
     */ printVoicingResponses: {
            type: 'flag'
        },
        /**
     * Enables panning and zooming of the simulation. Can be permanently disabled if supportsPanAndZoom: false is
     * added under the `phet.simFeatures` entry of package.json. Query parameter value will always override package.json entry.
     *
     * Public, so that users can disable this feature if they need to.
     */ supportsPanAndZoom: {
            type: 'boolean',
            public: true,
            // even if not provided in package.json, this defaults to being true
            defaultValue: !packageSimFeatures.hasOwnProperty('supportsPanAndZoom') || packageSimFeatures.supportsPanAndZoom
        },
        /**
     * Indicates whether the sound library should be enabled.  If true, an icon is added to the nav bar icon to enable
     * the user to turn sound on/off.  There is also a Sim option for enabling sound which can override this.
     * Primarily for internal use, though we may share links with collaborates that use this parameter.
     */ supportsSound: {
            type: 'boolean',
            defaultValue: !!packageSimFeatures.supportsSound
        },
        /**
     * Indicates whether extra sounds are used in addition to basic sounds as part of the sound design.  If true, the
     * PhET menu will have an option for enabling extra sounds.  This will be ignored if sound is not generally
     * enabled (see ?supportsSound).
     *
     * Primarily for internal use, though we may share links with collaborates that use this parameter.
     */ supportsExtraSound: {
            type: 'boolean',
            defaultValue: !!packageSimFeatures.supportsExtraSound
        },
        /**
     * Indicates whether or not vibration is enabled, and which paradigm is enabled for testing. There
     * are several "paradigms", which are different vibration output designs.  For temporary use
     * while we investigate use of this feature. In the long run there will probably be only
     * one design and it can be enabled/disabled with something more like `supportsVibration`.
     *
     * These are numbered, but type is string so default can be null, where all vibration is disabled.
     *
     * Used internally, though links are shared with collaborators and possibly in paper publications.
     */ vibrationParadigm: {
            type: 'string',
            defaultValue: null
        },
        /**
     * Only relevant when the sim supports the Voicing feature. If true, Voicing object responses
     * are enabled by default.
     *
     * These parameters allow fine-=tuned control over the initial state and behavior of the Voicing feature,
     * allowing better customization and accessibility for various users.
     */ voicingAddObjectResponses: {
            type: 'flag',
            public: true
        },
        /**
     * Only relevant when the sim supports the Voicing feature. If true, Voicing context responses
     * are enabled by default.
     *
     * These parameters allow fine-=tuned control over the initial state and behavior of the Voicing feature,
     * allowing better customization and accessibility for various users.
     */ voicingAddContextResponses: {
            type: 'flag',
            public: true
        },
        /**
     * Only relevant when the sim supports the Voicing feature. If true, Voicing hint responses
     * are enabled by default.
     *
     * These parameters allow fine-=tuned control over the initial state and behavior of the Voicing feature,
     * allowing better customization and accessibility for various users.
     */ voicingAddHintResponses: {
            type: 'flag',
            public: true
        },
        /**
     * Only relevant when the sim supports the Voicing feature. If true, the Voicing toolbar will be collapsed
     * by default when Voicing is enabled.
     *
     * These parameters allow fine-=tuned control over the initial state and behavior of the Voicing feature,
     * allowing better customization and accessibility for various users.
     */ voicingCollapseToolbar: {
            type: 'flag',
            public: true
        },
        /**
     * Only relevant when the sim supports the Voicing feature. If true, the Voicing toolbar will be fully hidden
     * by default when Voicing is enabled.
     *
     * These parameters allow fine-=tuned control over the initial state and behavior of the Voicing feature,
     * allowing better customization and accessibility for various users.
     */ voicingRemoveToolbar: {
            type: 'flag',
            public: true
        },
        /**
     * Enables WebGL rendering. See https://github.com/phetsims/scenery/issues/289.
     * Note that simulations can opt-in to webgl via new Sim({webgl:true}), but using ?webgl=true takes
     * precedence.  If no webgl query parameter is supplied, then simulations take the Sim option value, which
     * defaults to false.  See see https://github.com/phetsims/scenery/issues/621
     */ webgl: {
            type: 'boolean',
            defaultValue: true
        },
        /**
     * Indicates whether yotta analytics are enabled.
     */ yotta: {
            type: 'boolean',
            defaultValue: true,
            public: true
        }
    };
    {
        // Read query parameters
        window.phet.chipper.queryParameters = QueryStringMachine.getAll(QUERY_PARAMETERS_SCHEMA);
        // Are we running a built html file?
        window.phet.chipper.isProduction = $('meta[name=phet-sim-level]').attr('content') === 'production';
        // Are we running in an app?
        window.phet.chipper.isApp = phet.chipper.queryParameters['phet-app'] || phet.chipper.queryParameters['phet-android-app'];
        /**
     * An IIFE here helps capture variables in final logic needed in the global, preload scope for the phetsim environment.
     *
     * Enables or disables assertions in common libraries using query parameters.
     * There are two types of assertions: basic and slow. Enabling slow assertions will adversely impact performance.
     * 'ea' enables basic assertions, 'eall' enables basic and slow assertions.
     * Must be run before the main modules, and assumes that assert.js and query-parameters.js has been run.
     */ (function() {
            // enables all assertions (basic and slow)
            const enableAllAssertions = !phet.chipper.isProduction && phet.chipper.queryParameters.eall;
            // enables basic assertions
            const enableBasicAssertions = enableAllAssertions || !phet.chipper.isProduction && phet.chipper.queryParameters.ea || phet.chipper.isDebugBuild;
            if (enableBasicAssertions) {
                window.assertions.enableAssert();
            }
            if (enableAllAssertions) {
                window.assertions.enableAssertSlow();
            }
        })();
    }
    // Initialize query parameters in a new scope, see docs above
    {
        window.phet.chipper.colorProfiles = colorProfiles;
        /**
     * Determines whether any type of fuzzing is enabled. This is a function so that the associated query parameters
     * can be changed from the console while the sim is running. See https://github.com/phetsims/sun/issues/677.
     * @returns {boolean}
     */ window.phet.chipper.isFuzzEnabled = ()=>window.phet.chipper.queryParameters.fuzz || window.phet.chipper.queryParameters.fuzzMouse || window.phet.chipper.queryParameters.fuzzTouch || window.phet.chipper.queryParameters.fuzzBoard;
        // Add a log function that displays messages to the console. Examples:
        // phet.log && phet.log( 'You win!' );
        // phet.log && phet.log( 'You lose', { color: 'red' } );
        if (window.phet.chipper.queryParameters.log) {
            window.phet.log = function(message, options) {
                options = _.assignIn({
                    color: '#009900' // green
                }, options);
                console.log(`%c${message}`, `color: ${options.color}`); // green
            };
        }
        /**
     * Gets the name of brand to use, which determines which logo to show in the navbar as well as what options
     * to show in the PhET menu and what text to show in the About dialog.
     * See https://github.com/phetsims/brand/issues/11
     * @returns {string}
     */ window.phet.chipper.brand = window.phet.chipper.brand || phet.chipper.queryParameters.brand || 'adapted-from-phet';
        // {string|null} - See documentation of stringTest query parameter - we need to support this during build, where
        //                 there aren't any query parameters.
        const stringTest = typeof window !== 'undefined' && phet.chipper.queryParameters.stringTest ? phet.chipper.queryParameters.stringTest : null;
        /**
     * Maps an input string to a final string, accommodating tricks like doubleStrings.
     * This function is used to modify all strings in a sim when the stringTest query parameter is used.
     * The stringTest query parameter and its options are documented in the query parameter docs above.
     * It is used in string.js and sim.html.
     * @param string - the string to be mapped
     * @returns {string}
     */ window.phet.chipper.mapString = function(string) {
            const script = 'script';
            return stringTest === null ? string : stringTest === 'double' ? `${string}:${string}` : stringTest === 'long' ? '12345678901234567890123456789012345678901234567890' : stringTest === 'rtl' ? '\u202b\u062a\u0633\u062a (\u0632\u0628\u0627\u0646)\u202c' : stringTest === 'xss' ? `${string}<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NkYGD4DwABCQEBtxmN7wAAAABJRU5ErkJggg==" onload="window.location.href=atob('aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ==')" />` : stringTest === 'xss2' ? `${string}<${script}>alert('XSS')</${script}>` : stringTest === 'none' ? string : stringTest === 'dynamic' ? string : // In the fallback case, supply whatever string was given in the query parameter value
            stringTest;
        };
        /**
     * Given a locale based on the supported query parameter schema, map it to the 2 or 5 char locale code (key in localeData).
     * @param {string} locale
     * @param {boolean} assertInsteadOfWarn - assert incorrect locale format, vs QSM warn by default
     * @returns {string}
     */ phet.chipper.remapLocale = (locale, assertInsteadOfWarn = false)=>{
            assert && assert(locale);
            assert && assert(phet.chipper.localeData);
            const inputValueLocale = locale;
            if (locale.length < 5) {
                locale = locale.toLowerCase();
            } else {
                locale = locale.replace(/-/, '_');
                const parts = locale.split('_');
                if (parts.length === 2) {
                    locale = parts[0].toLowerCase() + '_' + parts[1].toUpperCase();
                }
            }
            if (locale.length === 3) {
                for (const candidateLocale of Object.keys(phet.chipper.localeData)){
                    if (phet.chipper.localeData[candidateLocale].locale3 === locale) {
                        locale = candidateLocale;
                        break;
                    }
                }
            }
            // Permissive patterns for locale query parameter patterns.
            // We don't want to show a query parameter warning if it matches these patterns, EVEN if it is not a valid locale
            // in localeData, see https://github.com/phetsims/qa/issues/1085#issuecomment-2111105235.
            const pairRegex = /^[a-zA-Z]{2}$/;
            const tripleRegex = /^[a-zA-Z]{3}$/;
            const doublePairRegex = /^[a-zA-Z]{2}[_-][a-zA-Z]{2}$/;
            // Sanity checks for verifying localeData (so hopefully we don't commit bad data to localeData).
            if (assert) {
                for (const locale of Object.keys(phet.chipper.localeData)){
                    // Check the locale itself
                    assert(pairRegex.test(locale) || doublePairRegex.test(locale), `Invalid locale format: ${locale}`);
                    // Check locale3 (if it exists)
                    if (phet.chipper.localeData[locale].locale3) {
                        assert(tripleRegex.test(phet.chipper.localeData[locale].locale3), `Invalid locale3 format: ${phet.chipper.localeData[locale].locale3}`);
                    }
                    // Check fallbackLocales (if it exists)
                    if (phet.chipper.localeData[locale].fallbackLocales) {
                        for (const fallbackLocale of phet.chipper.localeData[locale].fallbackLocales){
                            assert(phet.chipper.localeData[fallbackLocale]);
                        }
                    }
                }
            }
            if (!phet.chipper.localeData[locale]) {
                const badLocale = inputValueLocale;
                if (!pairRegex.test(badLocale) && !tripleRegex.test(badLocale) && !doublePairRegex.test(badLocale)) {
                    if (assertInsteadOfWarn) {
                        assert && assert(false, 'invalid locale:', inputValueLocale);
                    } else {
                        // This may occur twice in unbuilt mode when done loading unbuilt strings and when running this file.
                        QueryStringMachine.addWarning('locale', inputValueLocale, `Invalid locale format received: ${badLocale}. ?locale query parameter accepts the following formats: "xx" for ISO-639-1, "xx_XX" for ISO-639-1 and a 2-letter country code, "xxx" for ISO-639-2`);
                    }
                }
                locale = FALLBACK_LOCALE;
            }
            return locale;
        };
        /**
     * Get the "most" valid locale, see https://github.com/phetsims/phet-io/issues/1882
     *  As part of https://github.com/phetsims/joist/issues/963, this as changed. We check a specific fallback order based
     *  on the locale. In general, it will usually try a prefix for xx_XX style locales, e.g. 'ar_SA' would try 'ar_SA', 'ar', 'en'
     *  NOTE: If the locale doesn't actually have any strings: THAT IS OK! Our string system will use the appropriate
     *  fallback strings.
     * @param locale
     * @returns {*}
     */ phet.chipper.getValidRuntimeLocale = (locale)=>{
            var _phet_chipper_localeData_locale;
            assert && assert(locale);
            assert && assert(phet.chipper.localeData);
            assert && assert(phet.chipper.strings);
            var _phet_chipper_localeData_locale_fallbackLocales;
            const possibleLocales = [
                locale,
                ...(_phet_chipper_localeData_locale_fallbackLocales = (_phet_chipper_localeData_locale = phet.chipper.localeData[locale]) == null ? void 0 : _phet_chipper_localeData_locale.fallbackLocales) != null ? _phet_chipper_localeData_locale_fallbackLocales : [],
                FALLBACK_LOCALE
            ];
            const availableLocale = possibleLocales.find((possibleLocale)=>!!phet.chipper.strings[possibleLocale]);
            assert && assert(availableLocale, 'no fallback found for ', locale);
            return availableLocale;
        };
        // We will need to check for locale validity (once we have localeData loaded, if running unbuilt), and potentially
        // either fall back to `en`, or remap from 3-character locales to our locale keys. This overwrites phet.chipper.locale.
        // Used when setting locale through JOIST/localeProperty also. Default to the query parameter instead of
        // chipper.locale because we overwrite that value, and may run this function multiple times during the startup
        // sequence (in unbuilt mode).
        phet.chipper.checkAndRemapLocale = (locale = phet.chipper.queryParameters.locale, assertInsteadOfWarn = false)=>{
            var _phet_chipper_strings;
            // We need both to proceed. Provided as a global, so we can call it from load-unbuilt-strings
            // (IF initialize-globals loads first). Also handle the unbuilt mode case where we have phet.chipper.strings
            // exists but no translations have loaded yet.
            if (!phet.chipper.localeData || !((_phet_chipper_strings = phet.chipper.strings) == null ? void 0 : _phet_chipper_strings.hasOwnProperty(FALLBACK_LOCALE)) || !locale) {
                return locale;
            }
            const remappedLocale = phet.chipper.remapLocale(locale, assertInsteadOfWarn);
            const finalLocale = phet.chipper.getValidRuntimeLocale(remappedLocale);
            // Export this for analytics, see gogole-analytics.js
            // (Yotta and GA will want the non-fallback locale for now, for consistency)
            phet.chipper.remappedLocale = remappedLocale;
            phet.chipper.locale = finalLocale; // NOTE: this will change with every setting of JOIST/localeProperty
            return finalLocale;
        };
        // When providing `?locale=`, the value is null, rude.
        if (phet.chipper.queryParameters.locale === null) {
            phet.chipper.queryParameters.locale = FALLBACK_LOCALE;
        }
        // Query parameter default will pick up the phet.chipper.locale default from the built sim, if it exists.
        assert && assert(phet.chipper.queryParameters.locale, 'should exist with a default');
        // NOTE: If we are loading in unbuilt mode, this may execute BEFORE we have loaded localeData. We have a similar
        // remapping in load-unbuilt-strings when this happens.
        phet.chipper.checkAndRemapLocale();
    }
    /**
   * Utility function to pause synchronously for the given number of milliseconds.
   * @param {number} millis - amount of time to pause synchronously
   */ function sleep(millis) {
        const date = new Date();
        let curDate;
        do {
            curDate = new Date();
        }while (curDate - date < millis)
    }
    /*
   * These are used to make sure our sims still behave properly with an artificially higher load (so we can test what happens
   * at 30fps, 5fps, etc). There tend to be bugs that only happen on less-powerful devices, and these functions facilitate
   * testing a sim for robustness, and allowing others to reproduce slow-behavior bugs.
   */ window.phet.chipper.makeEverythingSlow = function() {
        window.setInterval(()=>{
            sleep(64);
        }, 16);
    };
    window.phet.chipper.makeRandomSlowness = function() {
        window.setInterval(()=>{
            sleep(Math.ceil(100 + Math.random() * 200));
        }, Math.ceil(100 + Math.random() * 200));
    };
    (function() {
        /**
     * Sends a message to a continuous testing container.
     * @public
     *
     * @param {Object} [options] - Specific object results sent to CT.
     */ window.phet.chipper.reportContinuousTestResult = (options)=>{
            window.parent && window.parent.postMessage(JSON.stringify(_.assignIn({
                continuousTest: JSON.parse(phet.chipper.queryParameters.continuousTest),
                url: window.location.href
            }, options)), '*');
        };
        if (phet.chipper.queryParameters.continuousTest) {
            window.addEventListener('error', (a)=>{
                let message = '';
                let stack = '';
                if (a && a.message) {
                    message = a.message;
                }
                if (a && a.error && a.error.stack) {
                    stack = a.error.stack;
                }
                phet.chipper.reportContinuousTestResult({
                    type: 'continuous-test-error',
                    message: message,
                    stack: stack
                });
            });
            window.addEventListener('beforeunload', (e)=>{
                phet.chipper.reportContinuousTestResult({
                    type: 'continuous-test-unload'
                });
            });
            // window.open stub. otherwise we get tons of "Report Problem..." popups that stall
            window.open = ()=>{
                return {
                    focus: ()=>{},
                    blur: ()=>{}
                };
            };
        }
        // Communicate sim errors to CT or other listening parent frames
        if (phet.chipper.queryParameters.postMessageOnError) {
            window.addEventListener('error', (a)=>{
                let message = '';
                let stack = '';
                if (a && a.message) {
                    message = a.message;
                }
                if (a && a.error && a.error.stack) {
                    stack = a.error.stack;
                }
                window.parent && window.parent.postMessage(JSON.stringify({
                    type: 'error',
                    url: window.location.href,
                    message: message,
                    stack: stack
                }), '*');
            });
        }
        if (phet.chipper.queryParameters.postMessageOnBeforeUnload) {
            window.addEventListener('beforeunload', (e)=>{
                window.parent && window.parent.postMessage(JSON.stringify({
                    type: 'beforeUnload'
                }), '*');
            });
        }
    })();
    (()=>{
        // Validation logic on the simFeatures section of the packageJSON, many of which are used in sims, and should be
        // defined correctly for the sim to run.
        const simFeaturesSchema = {
            supportsInteractiveDescription: {
                type: 'boolean'
            },
            supportsVoicing: {
                type: 'boolean'
            },
            supportsInteractiveHighlights: {
                type: 'boolean'
            },
            supportsDescriptionPlugin: {
                type: 'boolean'
            },
            supportsSound: {
                type: 'boolean'
            },
            supportsExtraSound: {
                type: 'boolean'
            },
            supportsDynamicLocale: {
                type: 'boolean'
            },
            colorProfiles: {
                type: 'array'
            },
            supportedRegionsAndCultures: {
                type: 'array'
            },
            defaultRegionAndCulture: {
                type: 'string'
            }
        };
        Object.keys(simFeaturesSchema).forEach((schemaKey)=>{
            assert && assert(!packagePhet.hasOwnProperty(schemaKey), `${schemaKey} is a sim feature and should be in "simFeatures" in the package.json`);
        });
        assert && assert(!packageObject.hasOwnProperty('simFeatures'), 'simFeatures must be nested under \'phet\'');
        if (packagePhet.hasOwnProperty('simFeatures')) {
            const simFeatures = packagePhet.simFeatures;
            Object.keys(simFeatures).forEach((simFeatureName)=>{
                const simFeatureValue = simFeatures[simFeatureName];
                assert && assert(simFeaturesSchema.hasOwnProperty(simFeatureName), `unsupported sim feature: ${simFeatureName}`);
                if (simFeaturesSchema[simFeatureName]) {
                    if (simFeaturesSchema[simFeatureName.type] === 'boolean') {
                        assert && assert(typeof simFeatureValue === 'boolean', `boolean value expected for ${simFeatureName}`);
                    } else if (simFeaturesSchema[simFeatureName.type] === 'array') {
                        assert && assert(Array.isArray(simFeatureValue), `array value expected for ${simFeatureName}`);
                        // At this time, all arrays are assumed to only support strings
                        assert && assert(_.every(simFeatureValue, (value)=>typeof value === 'string'), `string entry expected for ${simFeatureName}`);
                    }
                }
            });
        }
    })();
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2Jyb3dzZXIvaW5pdGlhbGl6ZS1nbG9iYWxzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEluaXRpYWxpemVzIHBoZXQgZ2xvYmFscyB0aGF0IGFyZSB1c2VkIGJ5IGFsbCBzaW11bGF0aW9ucywgaW5jbHVkaW5nIGFzc2VydGlvbnMgYW5kIHF1ZXJ5LXBhcmFtZXRlcnMuXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXRjb21tb24vaXNzdWVzLzIzXG4gKiBUaGlzIGZpbGUgbXVzdCBiZSBsb2FkZWQgYmVmb3JlIHRoZSBzaW11bGF0aW9uIGlzIHN0YXJ0ZWQgdXAsIGFuZCB0aGlzIGZpbGUgY2Fubm90IGJlIGxvYWRlZCBhcyBhbiBBTUQgbW9kdWxlLlxuICogVGhlIGVhc2llc3Qgd2F5IHRvIGRvIHRoaXMgaXMgdmlhIGEgPHNjcmlwdD4gdGFnIGluIHlvdXIgSFRNTCBmaWxlLlxuICpcbiAqIFBoRVQgU2ltdWxhdGlvbnMgY2FuIGJlIGxhdW5jaGVkIHdpdGggcXVlcnkgcGFyYW1ldGVycyB3aGljaCBlbmFibGUgY2VydGFpbiBmZWF0dXJlcy4gIFRvIHVzZSBhIHF1ZXJ5IHBhcmFtZXRlcixcbiAqIHByb3ZpZGUgdGhlIGZ1bGwgVVJMIG9mIHRoZSBzaW11bGF0aW9uIGFuZCBhcHBlbmQgYSBxdWVzdGlvbiBtYXJrICg/KSB0aGVuIHRoZSBxdWVyeSBwYXJhbWV0ZXIgKGFuZCBvcHRpb25hbGx5IGl0c1xuICogdmFsdWUgYXNzaWdubWVudCkuICBGb3IgaW5zdGFuY2U6XG4gKiBodHRwczovL3BoZXQtZGV2LmNvbG9yYWRvLmVkdS9odG1sL3JlYWN0YW50cy1wcm9kdWN0cy1hbmQtbGVmdG92ZXJzLzEuMC4wLWRldi4xMy9yZWFjdGFudHMtcHJvZHVjdHMtYW5kLWxlZnRvdmVyc19lbi5odG1sP2RldlxuICpcbiAqIEhlcmUgaXMgYW4gZXhhbXBsZSBvZiBhIHZhbHVlIGFzc2lnbm1lbnQ6XG4gKiBodHRwczovL3BoZXQtZGV2LmNvbG9yYWRvLmVkdS9odG1sL3JlYWN0YW50cy1wcm9kdWN0cy1hbmQtbGVmdG92ZXJzLzEuMC4wLWRldi4xMy9yZWFjdGFudHMtcHJvZHVjdHMtYW5kLWxlZnRvdmVyc19lbi5odG1sP3dlYmdsPWZhbHNlXG4gKlxuICogVG8gdXNlIG11bHRpcGxlIHF1ZXJ5IHBhcmFtZXRlcnMsIHNwZWNpZnkgdGhlIHF1ZXN0aW9uIG1hcmsgYmVmb3JlIHRoZSBmaXJzdCBxdWVyeSBwYXJhbWV0ZXIsIHRoZW4gYW1wZXJzYW5kcyAoJilcbiAqIGJldHdlZW4gb3RoZXIgcXVlcnkgcGFyYW1ldGVycy4gIEhlcmUgaXMgYW4gZXhhbXBsZSBvZiBtdWx0aXBsZSBxdWVyeSBwYXJhbWV0ZXJzOlxuICogaHR0cHM6Ly9waGV0LWRldi5jb2xvcmFkby5lZHUvaHRtbC9yZWFjdGFudHMtcHJvZHVjdHMtYW5kLWxlZnRvdmVycy8xLjAuMC1kZXYuMTMvcmVhY3RhbnRzLXByb2R1Y3RzLWFuZC1sZWZ0b3ZlcnNfZW4uaHRtbD9kZXYmc2hvd1BvaW50ZXJBcmVhcyZ3ZWJnbD1mYWxzZVxuICpcbiAqIEZvciBtb3JlIG9uIHF1ZXJ5IHBhcmFtZXRlcnMgaW4gZ2VuZXJhbCwgc2VlIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUXVlcnlfc3RyaW5nXG4gKiBGb3IgZGV0YWlscyBvbiBjb21tb24tY29kZSBxdWVyeSBwYXJhbWV0ZXJzLCBzZWUgUVVFUllfUEFSQU1FVEVSU19TQ0hFTUEgYmVsb3cuXG4gKiBGb3Igc2ltLXNwZWNpZmljIHF1ZXJ5IHBhcmFtZXRlcnMgKGlmIHRoZXJlIGFyZSBhbnkpLCBzZWUgKlF1ZXJ5UGFyYW1ldGVycy5qcyBpbiB0aGUgc2ltdWxhdGlvbidzIHJlcG9zaXRvcnkuXG4gKlxuICogTWFueSBvZiB0aGVzZSBxdWVyeSBwYXJhbWV0ZXJzJyBqc2RvYyBpcyByZW5kZXJlZCBhbmQgdmlzaWJsZSBwdWJsaWNseSB0byBQaEVULWlPIGNsaWVudC4gVGhvc2Ugc2VjdGlvbnMgc2hvdWxkIGJlXG4gKiBtYXJrZWQsIHNlZSB0b3AgbGV2ZWwgY29tbWVudCBpbiBQaGV0aW9DbGllbnQuanMgYWJvdXQgcHJpdmF0ZSB2cyBwdWJsaWMgZG9jdW1lbnRhdGlvblxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG4oIGZ1bmN0aW9uKCkge1xuXG4gIGFzc2VydCAmJiBhc3NlcnQoIHdpbmRvdy5RdWVyeVN0cmluZ01hY2hpbmUsICdRdWVyeVN0cmluZ01hY2hpbmUgaXMgdXNlZCwgYW5kIHNob3VsZCBiZSBsb2FkZWQgYmVmb3JlIHRoaXMgY29kZSBydW5zJyApO1xuXG4gIC8vIENyZWF0ZSB0aGUgYXR0YWNobWVudCBwb2ludCBmb3IgYWxsIFBoRVQgZ2xvYmFsc1xuICB3aW5kb3cucGhldCA9IHdpbmRvdy5waGV0ID8/IHt9O1xuICB3aW5kb3cucGhldC5wcmVsb2FkcyA9IHdpbmRvdy5waGV0LnByZWxvYWRzIHx8IHt9O1xuICB3aW5kb3cucGhldC5jaGlwcGVyID0gd2luZG93LnBoZXQuY2hpcHBlciA/PyB7fTtcblxuICAvLyBwYWNrYWdlT2JqZWN0IG1heSBub3QgYWx3YXlzIGJlIGF2YWlsYWJsZSBpZiBpbml0aWFsaXplLWdsb2JhbHMgdXNlZCB3aXRob3V0IGNoaXBwZXItaW5pdGlhbGl6YXRpb24uanNcbiAgY29uc3QgcGFja2FnZU9iamVjdCA9IHBoZXQuY2hpcHBlci5wYWNrYWdlT2JqZWN0ID8/IHt9O1xuICBjb25zdCBwYWNrYWdlUGhldCA9IHBhY2thZ2VPYmplY3QucGhldCA/PyB7fTtcblxuICAvLyBOb3QgYWxsIHJ1bnRpbWVzIHdpbGwgaGF2ZSB0aGlzIGZsYWcsIHNvIGJlIGdyYWNlZnVsXG4gIGNvbnN0IGFsbG93TG9jYWxlU3dpdGNoaW5nID0gcGhldC5jaGlwcGVyLmFsbG93TG9jYWxlU3dpdGNoaW5nID8/IHRydWU7XG5cbiAgLy8gZHVjayB0eXBlIGRlZmF1bHRzIHNvIHRoYXQgbm90IGFsbCBwYWNrYWdlLmpzb24gZmlsZXMgbmVlZCB0byBoYXZlIGEgcGhldC5zaW1GZWF0dXJlcyBzZWN0aW9uLlxuICBjb25zdCBwYWNrYWdlU2ltRmVhdHVyZXMgPSBwYWNrYWdlUGhldC5zaW1GZWF0dXJlcyA/PyB7fTtcblxuICAvLyBUaGUgY29sb3IgcHJvZmlsZSB1c2VkIGJ5IGRlZmF1bHQsIGlmIG5vIGNvbG9yUHJvZmlsZXMgYXJlIHNwZWNpZmllZCBpbiBwYWNrYWdlLmpzb24uXG4gIC8vIE5PVEU6IER1cGxpY2F0ZWQgaW4gU2NlbmVyeUNvbnN0YW50cy5qcyBzaW5jZSBzY2VuZXJ5IGRvZXMgbm90IGluY2x1ZGUgaW5pdGlhbGl6ZS1nbG9iYWxzLmpzXG4gIGNvbnN0IERFRkFVTFRfQ09MT1JfUFJPRklMRSA9ICdkZWZhdWx0JztcblxuICBjb25zdCBGQUxMQkFDS19MT0NBTEUgPSAnZW4nO1xuXG4gIC8vIFRoZSBwb3NzaWJsZSBjb2xvciBwcm9maWxlcyBmb3IgdGhlIGN1cnJlbnQgc2ltdWxhdGlvbi5cbiAgY29uc3QgY29sb3JQcm9maWxlcyA9IHBhY2thZ2VTaW1GZWF0dXJlcy5jb2xvclByb2ZpbGVzID8/IFsgREVGQVVMVF9DT0xPUl9QUk9GSUxFIF07XG5cbiAgLy8gUHJpdmF0ZSBEb2M6IE5vdGU6IHRoZSBmb2xsb3dpbmcganNkb2MgaXMgZm9yIHRoZSBwdWJsaWMgZmFjaW5nIFBoRVQtaU8gQVBJLiBJbiBhZGRpdGlvbiwgYWxsIHF1ZXJ5IHBhcmFtZXRlcnMgaW4gdGhlIHNjaGVtYVxuICAvLyB0aGF0IGFyZSBhIFwibWVtYmVyT2ZcIiB0aGUgXCJQaGV0UXVlcnlQYXJhbWV0ZXJzXCIgbmFtZXNwYWNlIGFyZSB1c2VkIGluIHRoZSBqc2RvYyB0aGF0IGlzIHB1YmxpYyAoY2xpZW50IGZhY2luZylcbiAgLy8gcGhldC1pbyBkb2N1bWVudGF0aW9uLiBQcml2YXRlIGNvbW1lbnRzIGFib3V0IGltcGxlbWVudGF0aW9uIGRldGFpbHMgd2lsbCBiZSBpbiBjb21tZW50cyBhYm92ZSB0aGUganNkb2MsIGFuZFxuICAvLyBtYXJrZWQgYXMgc3VjaC5cbiAgLy8gTm90ZTogdGhpcyBoYWQgdG8gYmUganNkb2MgZGlyZWN0bHkgZm9yIFFVRVJZX1BBUkFNRVRFUlNfU0NIRU1BIHRvIHN1cHBvcnQgdGhlIGNvcnJlY3QgYXV0byBmb3JtYXR0aW5nLlxuXG4gIC8qKlxuICAgKiBRdWVyeSBwYXJhbWV0ZXJzIHRoYXQgbWFuaXB1bGF0ZSB0aGUgc3RhcnR1cCBzdGF0ZSBvZiB0aGUgUGhFVCBzaW11bGF0aW9uLiBUaGlzIGlzIG5vdFxuICAgKiBhbiBvYmplY3QgZGVmaW5lZCBpbiB0aGUgZ2xvYmFsIHNjb3BlLCBidXQgcmF0aGVyIGl0IHNlcnZlcyBhcyBkb2N1bWVudGF0aW9uIGFib3V0IGF2YWlsYWJsZSBxdWVyeSBwYXJhbWV0ZXJzLlxuICAgKiBOb3RlOiBUaGUgXCJmbGFnXCIgdHlwZSBmb3IgcXVlcnkgcGFyYW1ldGVycyBkb2VzIG5vdCBleHBlY3QgYSB2YWx1ZSBmb3IgdGhlIGtleSwgYnV0IHJhdGhlciBqdXN0IHRoZSBwcmVzZW5jZSBvZlxuICAgKiB0aGUga2V5IGl0c2VsZi5cbiAgICogQG5hbWVzcGFjZSB7T2JqZWN0fSBQaGV0UXVlcnlQYXJhbWV0ZXJzXG4gICAqL1xuICBjb25zdCBRVUVSWV9QQVJBTUVURVJTX1NDSEVNQSA9IHtcbiAgICAvLyBTY2hlbWEgdGhhdCBkZXNjcmliZXMgcXVlcnkgcGFyYW1ldGVycyBmb3IgUGhFVCBjb21tb24gY29kZS5cbiAgICAvLyBUaGVzZSBxdWVyeSBwYXJhbWV0ZXJzIGFyZSBhdmFpbGFibGUgdmlhIGdsb2JhbCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLlxuXG4gICAgLyoqXG4gICAgICogSW4gZW52aXJvbm1lbnRzIHdoZXJlIHVzZXJzIHNob3VsZCBub3QgYmUgYWJsZSB0byBuYXZpZ2F0ZSBoeXBlcmxpbmtzIGF3YXkgZnJvbSB0aGUgc2ltdWxhdGlvbiwgY2xpZW50cyBjYW4gdXNlXG4gICAgICogP2FsbG93TGlua3M9ZmFsc2UuICBJbiB0aGlzIGNhc2UsIGxpbmtzIGFyZSBkaXNwbGF5ZWQgYW5kIG5vdCBjbGlja2FibGUuIFRoaXMgcXVlcnkgcGFyYW1ldGVyIGlzIHB1YmxpYyBmYWNpbmcuXG4gICAgICogQG1lbWJlck9mIFBoZXRRdWVyeVBhcmFtZXRlcnNcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBhbGxvd0xpbmtzOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0VmFsdWU6IHRydWUsXG4gICAgICBwdWJsaWM6IHRydWVcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWxsb3dzIHNldHRpbmcgb2YgdGhlIHNvdW5kIHN0YXRlLCBwb3NzaWJsZSB2YWx1ZXMgYXJlICdlbmFibGVkJyAoZGVmYXVsdCksICdtdXRlZCcsIGFuZCAnZGlzYWJsZWQnLiAgU291bmRcbiAgICAgKiBtdXN0IGJlIHN1cHBvcnRlZCBieSB0aGUgc2ltIGZvciB0aGlzIHRvIGhhdmUgYW55IGVmZmVjdC5cbiAgICAgKiBAbWVtYmVyT2YgUGhldFF1ZXJ5UGFyYW1ldGVyc1xuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgYXVkaW86IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdFZhbHVlOiAnZW5hYmxlZCcsXG4gICAgICB2YWxpZFZhbHVlczogWyAnZW5hYmxlZCcsICdkaXNhYmxlZCcsICdtdXRlZCcgXSxcbiAgICAgIHB1YmxpYzogdHJ1ZVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZXMgb2JqZWN0IHJlcG9ydHMgdGhhdCBjYW4gYmUgdXNlZCBieSBiaW5kZXIuIEZvciBpbnRlcm5hbCB1c2UuXG4gICAgICogU2VlIEluc3RhbmNlUmVnaXN0cnkuanMgYW5kIGJpbmRlciByZXBvIChzcGVjaWZpY2FsbHkgZ2V0RnJvbVNpbUluTWFpbi5qcykgZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgKi9cbiAgICBiaW5kZXI6IHsgdHlwZTogJ2ZsYWcnIH0sXG5cbiAgICAvKipcbiAgICAgKiBzcGVjaWZpZXMgdGhlIGJyYW5kIHRoYXQgc2hvdWxkIGJlIHVzZWQgaW4gdW5idWlsdCBtb2RlXG4gICAgICovXG4gICAgYnJhbmQ6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdFZhbHVlOiAnYWRhcHRlZC1mcm9tLXBoZXQnXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZW4gcHJlc2VudCwgd2lsbCB0cmlnZ2VyIGNoYW5nZXMgdGhhdCBhcmUgbW9yZSBzaW1pbGFyIHRvIHRoZSBidWlsZCBlbnZpcm9ubWVudC5cbiAgICAgKiBSaWdodCBub3csIHRoaXMgaW5jbHVkZXMgY29tcHV0aW5nIGhpZ2hlci1yZXNvbHV0aW9uIG1pcG1hcHMgZm9yIHRoZSBtaXBtYXAgcGx1Z2luLlxuICAgICAqL1xuICAgIGJ1aWxkQ29tcGF0aWJsZTogeyB0eXBlOiAnZmxhZycgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZW4gcHJvdmlkZWQgYSBub24temVyby1sZW5ndGggdmFsdWUsIHRoZSBzaW0gd2lsbCBzZW5kIG91dCBhc3NvcnRlZCBldmVudHMgbWVhbnQgZm9yIGNvbnRpbnVvdXMgdGVzdGluZ1xuICAgICAqIGludGVncmF0aW9uIChzZWUgc2ltLXRlc3QuanMpLlxuICAgICAqL1xuICAgIGNvbnRpbnVvdXNUZXN0OiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogJydcbiAgICB9LFxuXG4gICAgLy8gUHJpdmF0ZSBEb2M6ICBGb3IgZXh0ZXJuYWwgdXNlLiBUaGUgYmVsb3cganNkb2MgaXMgcHVibGljIHRvIHRoZSBQaEVULWlPIEFQSSBkb2N1bWVudGF0aW9uLiBDaGFuZ2Ugd2lzZWx5LlxuICAgIC8qKlxuICAgICAqIFRoZSBjb2xvciBwcm9maWxlIHVzZWQgYXQgc3RhcnR1cCwgcmVsZXZhbnQgb25seSBmb3Igc2ltcyB0aGF0IHN1cHBvcnQgbXVsdGlwbGUgY29sb3IgcHJvZmlsZXMuICdkZWZhdWx0JyBhbmRcbiAgICAgKiAncHJvamVjdG9yJyBhcmUgaW1wbGVtZW50ZWQgaW4gc2V2ZXJhbCBzaW1zLCBvdGhlciBwcm9maWxlIG5hbWVzIGFyZSBub3QgY3VycmVudGx5IHN0YW5kYXJkaXplZC5cbiAgICAgKiBAbWVtYmVyT2YgUGhldFF1ZXJ5UGFyYW1ldGVyc1xuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgY29sb3JQcm9maWxlOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogY29sb3JQcm9maWxlc1sgMCBdLCAvLyB1c3VhbGx5IFwiZGVmYXVsdFwiLCBidXQgc29tZSBzaW1zIGxpa2UgbWFzc2VzLWFuZC1zcHJpbmdzLWJhc2ljcyBkbyBub3QgdXNlIGRlZmF1bHQgYXQgYWxsXG4gICAgICB2YWxpZFZhbHVlczogY29sb3JQcm9maWxlcyxcbiAgICAgIHB1YmxpYzogdHJ1ZVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGb3IgbWVtb3J5IHByb2ZpbGluZywgaXQgY2FuIHNvbWV0aW1lcyBiZSBkaWZmaWN1bHQgdG8ga25vdyB3aGVuIHRoZSBhcHAgY3Jhc2hlZCBhbmQgYXV0b21hdGljYWxseSByZXN0YXJ0ZWQgaXRzZWxmLlxuICAgICAqIFRoaXMgZmxhZyB3aWxsIHNob3cgdGhlIGxhdW5jaCBjb3VudGVyIHNvIHlvdSBjYW4gdGVsbCBob3cgbWFueSB0aW1lcyBpdCBoYXMgYmVlbiBsYXVuY2hlZC5cbiAgICAgKlxuICAgICAqIE5PVEU6IFRoZXJlIGlzIG5vIGVhc3kgd2F5IHRvIGNsZWFyIHRoZSBsb2NhbCBzdG9yYWdlIGZvciB0aGlzIHZhbHVlLCBzbyBjb3JyZWN0IHVzYWdlIHdvdWxkIGZvY3VzIG9uIHRoZSBkaWZmZXJlbmNlc1xuICAgICAqIGluIHZhbHVlcyByYXRoZXIgdGhhbiB0aGUgYWJzb2x1dGUgdmFsdWVzLlxuICAgICAqL1xuICAgIGxhdW5jaENvdW50ZXI6IHtcbiAgICAgIHR5cGU6ICdmbGFnJ1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBlbmFibGVzIGRlYnVnZ2VyIGNvbW1hbmRzIGluIGNlcnRhaW4gY2FzZXMgbGlrZSB0aHJvd24gZXJyb3JzIGFuZCBmYWlsZWQgdGVzdHMuXG4gICAgICovXG4gICAgZGVidWdnZXI6IHsgdHlwZTogJ2ZsYWcnIH0sXG5cbiAgICAvLyBPdXRwdXQgZGVwcmVjYXRpb24gd2FybmluZ3MgdmlhIGNvbnNvbGUud2Fybiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy84ODIuIEZvciBpbnRlcm5hbFxuICAgIC8vIHVzZSBvbmx5LlxuICAgIGRlcHJlY2F0aW9uV2FybmluZ3M6IHsgdHlwZTogJ2ZsYWcnIH0sXG5cbiAgICAvKipcbiAgICAgKiBlbmFibGVzIGRldmVsb3Blci1vbmx5IGZlYXR1cmVzLCBzdWNoIGFzIHNob3dpbmcgdGhlIGxheW91dCBib3VuZHNcbiAgICAgKi9cbiAgICBkZXY6IHsgdHlwZTogJ2ZsYWcnIH0sXG5cblxuICAgIC8qKlxuICAgICAqIHNldHMgYWxsIG1vZGFsIGZlYXR1cmVzIG9mIHRoZSBzaW0gYXMgZGlzYWJsZWQuIFRoaXMgaXMgYSBkZXZlbG9wbWVudC1vbmx5IHBhcmFtZXRlciB0aGF0IGNhbiBiZSB1c2VmdWwgaW5cbiAgICAgKiBjb21iaW5hdGlvbiB3aXRoIGZ1enogdGVzdGluZy4gVGhpcyB3YXMgY3JlYXRlZCB0byBsaW1pdCB0aGUgYW1vdW50IG9mIHRpbWUgZnV6eiB0ZXN0aW5nIHNwZW5kcyBvbiB1bmltcG9ydGFudFxuICAgICAqIGZlYXR1cmVzIG9mIHRoZSBzaW0gbGlrZSB0aGUgUGhFVCBNZW51LCBLZXlib2FyZCBIZWxwLCBhbmQgUHJlZmVyZW5jZXMgcG9wdXBzLlxuICAgICAqL1xuICAgIGRpc2FibGVNb2RhbHM6IHsgdHlwZTogJ2ZsYWcnIH0sXG5cbiAgICAvKipcbiAgICAgKiBlbmFibGVzIGFzc2VydGlvbnNcbiAgICAgKi9cbiAgICBlYTogeyB0eXBlOiAnZmxhZycgfSxcblxuICAgIC8qKlxuICAgICAqIEVuYWJsZXMgYWxsIGFzc2VydGlvbnMsIGFzIGFib3ZlIGJ1dCB3aXRoIG1vcmUgdGltZS1jb25zdW1pbmcgY2hlY2tzXG4gICAgICovXG4gICAgZWFsbDogeyB0eXBlOiAnZmxhZycgfSxcblxuICAgIC8qKlxuICAgICAqIENvbnRyb2xzIHdoZXRoZXIgZXh0cmEgc291bmQgaXMgb24gb3Igb2ZmIGF0IHN0YXJ0dXAgKHVzZXIgY2FuIGNoYW5nZSBsYXRlcikuICBUaGlzIHF1ZXJ5IHBhcmFtZXRlciBpcyBwdWJsaWNcbiAgICAgKiBmYWNpbmcuXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgZXh0cmFTb3VuZEluaXRpYWxseUVuYWJsZWQ6IHtcbiAgICAgIHR5cGU6ICdmbGFnJyxcbiAgICAgIHB1YmxpYzogdHJ1ZVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGb3JjZSBTY2VuZXJ5IHRvIHJlZnJlc2ggU1ZHIGNvbnRlbnRzIGV2ZXJ5IGZyYW1lICh0byBoZWxwIGRldGVjdCByZW5kZXJpbmcvYnJvd3Nlci1yZXBhaW50IGlzc3VlcyB3aXRoIFNWRykuXG4gICAgICovXG4gICAgZm9yY2VTVkdSZWZyZXNoOiB7IHR5cGU6ICdmbGFnJyB9LFxuXG4gICAgLyoqXG4gICAgICogUmFuZG9tbHkgc2VuZHMgbW91c2UgZXZlbnRzIGFuZCB0b3VjaCBldmVudHMgdG8gc2ltLlxuICAgICAqL1xuICAgIGZ1eno6IHsgdHlwZTogJ2ZsYWcnIH0sXG5cbiAgICAvKipcbiAgICAgKiBSYW5kb21seSBzZW5kcyBrZXlib2FyZCBldmVudHMgdG8gdGhlIHNpbS4gTXVzdCBoYXZlIGFjY2Vzc2liaWxpdHkgZW5hYmxlZC5cbiAgICAgKi9cbiAgICBmdXp6Qm9hcmQ6IHsgdHlwZTogJ2ZsYWcnIH0sXG5cbiAgICAvKipcbiAgICAgKiBSYW5kb21seSBzZW5kcyBtb3VzZSBldmVudHMgdG8gc2ltLlxuICAgICAqL1xuICAgIGZ1enpNb3VzZTogeyB0eXBlOiAnZmxhZycgfSxcblxuICAgIC8qKlxuICAgICAqIFRoZSBtYXhpbXVtIG51bWJlciBvZiBjb25jdXJyZW50IHBvaW50ZXJzIGFsbG93ZWQgZm9yIGZ1enppbmcuIFVzaW5nIGEgdmFsdWUgbGFyZ2VyIHRoYW4gMSB3aWxsIHRlc3QgbXVsdGl0b3VjaFxuICAgICAqIGJlaGF2aW9yICh3aXRoID9mdXp6LCA/ZnV6ek1vdXNlLCA/ZnV6elRvdWNoLCBldGMuKVxuICAgICAqL1xuICAgIGZ1enpQb2ludGVyczoge1xuICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICBkZWZhdWx0VmFsdWU6IDFcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmFuZG9tbHkgc2VuZHMgdG91Y2ggZXZlbnRzIHRvIHNpbS5cbiAgICAgKi9cbiAgICBmdXp6VG91Y2g6IHsgdHlwZTogJ2ZsYWcnIH0sXG5cbiAgICAvKipcbiAgICAgKiBpZiBmdXp6TW91c2U9dHJ1ZSBvciBmdXp6VG91Y2g9dHJ1ZSwgdGhpcyBpcyB0aGUgYXZlcmFnZSBudW1iZXIgb2YgbW91c2UvdG91Y2ggZXZlbnRzIHRvIHN5bnRoZXNpemUgcGVyIGZyYW1lLlxuICAgICAqL1xuICAgIGZ1enpSYXRlOiB7XG4gICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogMTAwLFxuICAgICAgaXNWYWxpZFZhbHVlOiBmdW5jdGlvbiggdmFsdWUgKSB7IHJldHVybiB2YWx1ZSA+IDA7IH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVXNlZCBmb3IgcHJvdmlkaW5nIGFuIGV4dGVybmFsIEdvb2dsZSBBbmFseXRpY3MgNCAoZ3RhZy5qcykgcHJvcGVydHkgZm9yIHRyYWNraW5nLCBzZWVcbiAgICAgKiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldGNvbW1vbi9pc3N1ZXMvNDYgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gICAgICpcbiAgICAgKiBHZW5lcmFsbHksIHRoaXMgc3RyaW5nIHdpbGwgc3RhcnQgd2l0aCAnRy0nIGZvciBHQTQgdHJhY2tlcnNcbiAgICAgKlxuICAgICAqIFRoaXMgaXMgdXNlZnVsIGZvciB2YXJpb3VzIHVzZXJzL2NsaWVudHMgdGhhdCB3YW50IHRvIGVtYmVkIHNpbXVsYXRpb25zLCBvciBkaXJlY3QgdXNlcnMgdG8gc2ltdWxhdGlvbnMuIEZvclxuICAgICAqIGV4YW1wbGUsIGlmIGEgc2ltIGlzIGluY2x1ZGVkIGluIGFuIGVwdWIsIHRoZSBzaW0gSFRNTCB3b24ndCBoYXZlIHRvIGJlIG1vZGlmaWVkIHRvIGluY2x1ZGUgcGFnZSB0cmFja2luZy5cbiAgICAgKi9cbiAgICBnYTQ6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdFZhbHVlOiBudWxsLFxuICAgICAgcHVibGljOiB0cnVlXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIExhdW5jaGVzIHRoZSBnYW1lLXVwLWNhbWVyYSBjb2RlIHdoaWNoIGRlbGl2ZXJzIGltYWdlcyB0byByZXF1ZXN0cyBpbiBCcmFpblBPUC9HYW1lIFVwL1NuYXBUaG91Z2h0XG4gICAgICovXG4gICAgZ2FtZVVwOiB7IHR5cGU6ICdmbGFnJyB9LFxuXG4gICAgLyoqXG4gICAgICogRW5hYmxlcyB0aGUgZ2FtZS11cC1jYW1lcmEgY29kZSB0byByZXNwb25kIHRvIG1lc3NhZ2VzIGZyb20gYW55IG9yaWdpblxuICAgICAqL1xuICAgIGdhbWVVcFRlc3RIYXJuZXNzOiB7IHR5cGU6ICdmbGFnJyB9LFxuXG4gICAgLyoqXG4gICAgICogRW5hYmxlcyBsb2dnaW5nIGZvciBnYW1lLXVwLWNhbWVyYSwgc2VlIGdhbWVVcFxuICAgICAqL1xuICAgIGdhbWVVcExvZ2dpbmc6IHsgdHlwZTogJ2ZsYWcnIH0sXG5cbiAgICAvKipcbiAgICAgKiBVc2VkIGZvciBwcm92aWRpbmcgYSBHb29nbGUgQW5hbHl0aWNzIHBhZ2UgSUQgZm9yIHRyYWNraW5nLCBzZWVcbiAgICAgKiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldGNvbW1vbi9pc3N1ZXMvNDYgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gICAgICpcbiAgICAgKiBUaGlzIGlzIGdpdmVuIGFzIHRoZSAzcmQgcGFyYW1ldGVyIHRvIGEgcGFnZXZpZXcgc2VuZCB3aGVuIHByb3ZpZGVkXG4gICAgICovXG4gICAgZ2FQYWdlOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogbnVsbFxuICAgIH0sXG5cbiAgICAvLyBQcml2YXRlIERvYzogIEZvciBleHRlcm5hbCB1c2UuIFRoZSBiZWxvdyBqc2RvYyBpcyBwdWJsaWMgdG8gdGhlIFBoRVQtaU8gQVBJIGRvY3VtZW50YXRpb24uIENoYW5nZSB3aXNlbHkuXG4gICAgLyoqXG4gICAgICogSW5kaWNhdGVzIHdoZXRoZXIgdG8gZGlzcGxheSB0aGUgaG9tZSBzY3JlZW4uXG4gICAgICogRm9yIG11bHRpc2NyZWVuIHNpbXMgb25seSwgdGhyb3dzIGFuIGFzc2VydGlvbiBlcnJvciBpZiBzdXBwbGllZCBmb3IgYSBzaW5nbGUtc2NyZWVuIHNpbS5cbiAgICAgKiBAbWVtYmVyT2YgUGhldFF1ZXJ5UGFyYW1ldGVyc1xuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqL1xuICAgIGhvbWVTY3JlZW46IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogdHJ1ZSxcbiAgICAgIHB1YmxpYzogdHJ1ZVxuICAgIH0sXG5cbiAgICAvLyBQcml2YXRlIERvYzogRm9yIGV4dGVybmFsIHVzZS4gVGhlIGJlbG93IGpzZG9jIGlzIHB1YmxpYyB0byB0aGUgUGhFVC1pTyBBUEkgZG9jdW1lbnRhdGlvbi4gQ2hhbmdlIHdpc2VseS5cbiAgICAvLyBUaGUgdmFsdWUgaXMgb25lIG9mIHRoZSB2YWx1ZXMgaW4gdGhlIHNjcmVlbnMgYXJyYXksIG5vdCBhbiBpbmRleCBpbnRvIHRoZSBzY3JlZW5zIGFycmF5LlxuICAgIC8qKlxuICAgICAqIFNwZWNpZmllcyB0aGUgaW5pdGlhbCBzY3JlZW4gdGhhdCB3aWxsIGJlIHZpc2libGUgd2hlbiB0aGUgc2ltIHN0YXJ0cy5cbiAgICAgKiBTZWUgYD9zY3JlZW5zYCBxdWVyeSBwYXJhbWV0ZXIgZm9yIHNjcmVlbiBudW1iZXJpbmcuXG4gICAgICogRm9yIG11bHRpc2NyZWVuIHNpbXMgb25seSwgdGhyb3dzIGFuIGFzc2VydGlvbiBlcnJvciBpZiBhcHBsaWVkIGluIGEgc2luZ2xlLXNjcmVlbiBzaW1zLlxuICAgICAqIFRoZSBkZWZhdWx0IHZhbHVlIG9mIDAgaXMgdGhlIGhvbWUgc2NyZWVuLlxuICAgICAqIEBtZW1iZXJPZiBQaGV0UXVlcnlQYXJhbWV0ZXJzXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICBpbml0aWFsU2NyZWVuOiB7XG4gICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogMCwgLy8gdGhlIGhvbWUgc2NyZWVuXG4gICAgICBwdWJsaWM6IHRydWVcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRW5hYmxlcyBzdXBwb3J0IGZvciBMZWdlbmRzIG9mIExlYXJuaW5nIHBsYXRmb3JtLCBpbmNsdWRpbmcgYnJvYWRjYXN0aW5nICdpbml0JyBhbmQgcmVzcG9uZGluZyB0byBwYXVzZS9yZXN1bWUuXG4gICAgICovXG4gICAgbGVnZW5kc09mTGVhcm5pbmc6IHsgdHlwZTogJ2ZsYWcnIH0sXG5cbiAgICAvKipcbiAgICAgKiBJZiB0aGlzIGlzIGEgZmluaXRlIG51bWJlciBBTkQgYXNzZXJ0aW9ucyBhcmUgZW5hYmxlZCwgaXQgd2lsbCB0cmFjayBtYXhpbXVtIChUaW55RW1pdHRlcikgbGlzdGVuZXIgY291bnRzLCBhbmRcbiAgICAgKiB3aWxsIGFzc2VydCB0aGF0IHRoZSBjb3VudCBpcyBub3QgZ3JlYXRlciB0aGFuIHRoZSBsaW1pdC5cbiAgICAgKi9cbiAgICBsaXN0ZW5lckxpbWl0OiB7XG4gICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLFxuICAgICAgcHVibGljOiBmYWxzZVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZWxlY3QgdGhlIGxhbmd1YWdlIG9mIHRoZSBzaW0gdG8gdGhlIHNwZWNpZmljIGxvY2FsZS4gRGVmYXVsdCB0byBcImVuXCIuXG4gICAgICogQG1lbWJlck9mIFBoZXRRdWVyeVBhcmFtZXRlcnNcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIGxvY2FsZToge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0VmFsdWU6IHdpbmRvdy5waGV0LmNoaXBwZXIubG9jYWxlID8/IEZBTExCQUNLX0xPQ0FMRVxuICAgICAgLy8gRG8gTk9UIGFkZCB0aGUgYHB1YmxpY2Aga2V5IGhlcmUuIFdlIHdhbnQgaW52YWxpZCB2YWx1ZXMgdG8gZmFsbCBiYWNrIHRvIGVuLlxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTcGVjaWZ5IHN1cHBvcnRzIGZvciBkeW5hbWljIGxvY2FsZSBzd2l0Y2hpbmcgaW4gdGhlIHJ1bnRpbWUgb2YgdGhlIHNpbS4gQnkgZGVmYXVsdCwgdGhlIHZhbHVlIHdpbGwgYmUgdGhlIHN1cHBvcnRcbiAgICAgKiBpbiB0aGUgcnVubmFibGUncyBwYWNrYWdlLmpzb24uIFVzZSB0aGlzIHRvIHR1cm4gb2ZmIHRoaW5ncyBsaWtlIHRoZSBsb2NhbGUgc3dpdGNoZXIgcHJlZmVyZW5jZS5cbiAgICAgKiBUaGUgcGFja2FnZSBmbGFnIGZvciB0aGlzIG1lYW5zIHZlcnkgc3BlY2lmaWMgdGhpbmdzIGRlcGVuZGluZyBvbiBpdHMgcHJlc2VuY2UgYW5kIHZhbHVlLlxuICAgICAqIC0gQnkgZGVmYXVsdCwgd2l0aCBubyBlbnRyeSBpbiB0aGUgcGFja2FnZS5qc29uLCB3ZSB3aWxsIHN0aWxsIHRyeSB0byBzdXBwb3J0IGxvY2FsZSBzd2l0Y2hpbmcgaWYgbXVsdGlwbGUgbG9jYWxlc1xuICAgICAqIGFyZSBhdmFpbGFibGUuXG4gICAgICogLSBJZiB5b3UgYWRkIHRoZSB0cnV0aHkgZmxhZyAoc3VwcG9ydHNEeW5hbWljTG9jYWxlOnRydWUpLCB0aGVuIGl0IHdpbGwgZW5zdXJlIHRoYXQgc3RyaW5ncyB1c2UgU3RyaW5nUHJvcGVydGllc1xuICAgICAqIGluIHlvdXIgc2ltLlxuICAgICAqIC0gSWYgeW91IGRvIG5vdCB3YW50IHRvIHN1cHBvcnQgdGhpcywgdGhlbiB5b3UgY2FuIG9wdCBvdXQgaW4gdGhlIHBhY2thZ2UuanNvbiB3aXRoIHN1cHBvcnRzRHluYW1pY0xvY2FsZTpmYWxzZVxuICAgICAqXG4gICAgICogRm9yIG1vcmUgaW5mb3JtYXRpb24gYWJvdXQgc3VwcG9ydGluZyBkeW5hbWljIGxvY2FsZSwgc2VlIHRoZSBcIkR5bmFtaWMgU3RyaW5ncyBMYXlvdXQgUXVpY2tzdGFydCBHdWlkZVwiOiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pbmZvL2Jsb2IvbWFpbi9kb2MvZHluYW1pYy1zdHJpbmctbGF5b3V0LXF1aWNrc3RhcnQubWRcbiAgICAgKi9cbiAgICBzdXBwb3J0c0R5bmFtaWNMb2NhbGU6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogYWxsb3dMb2NhbGVTd2l0Y2hpbmcgJiZcbiAgICAgICAgICAgICAgICAgICAgKCAhcGFja2FnZVNpbUZlYXR1cmVzLmhhc093blByb3BlcnR5KCAnc3VwcG9ydHNEeW5hbWljTG9jYWxlJyApIHx8IHBhY2thZ2VTaW1GZWF0dXJlcy5zdXBwb3J0c0R5bmFtaWNMb2NhbGUgKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFbmFibGVzIGJhc2ljIGxvZ2dpbmcgdG8gdGhlIGNvbnNvbGUuXG4gICAgICogVXNhZ2UgaW4gY29kZTogcGhldC5sb2cgJiYgcGhldC5sb2coICd5b3VyIG1lc3NhZ2UnICk7XG4gICAgICovXG4gICAgbG9nOiB7IHR5cGU6ICdmbGFnJyB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0cyBhIG1heGltdW0gXCJtZW1vcnlcIiBsaW1pdCAoaW4gTUIpLiBJZiB0aGUgc2ltdWxhdGlvbidzIHJ1bm5pbmcgYXZlcmFnZSBvZiBtZW1vcnkgdXNhZ2UgZ29lcyBvdmVyIHRoaXMgYW1vdW50XG4gICAgICogaW4gb3BlcmF0aW9uIChhcyBkZXRlcm1pbmVkIGN1cnJlbnRseSBieSB1c2luZyBDaHJvbWUncyB3aW5kb3cucGVyZm9ybWFuY2UpLCB0aGVuIGFuIGVycm9yIHdpbGwgYmUgdGhyb3duLlxuICAgICAqXG4gICAgICogVGhpcyBpcyB1c2VmdWwgZm9yIGNvbnRpbnVvdXMgdGVzdGluZywgdG8gZW5zdXJlIHdlIGFyZW4ndCBsZWFraW5nIGh1Z2UgYW1vdW50cyBvZiBtZW1vcnksIGFuZCBjYW4gYWxzbyBiZSB1c2VkXG4gICAgICogd2l0aCB0aGUgQ2hyb21lIGNvbW1hbmQtbGluZSBmbGFnIC0tZW5hYmxlLXByZWNpc2UtbWVtb3J5LWluZm8gdG8gbWFrZSB0aGUgZGV0ZXJtaW5hdGlvbiBtb3JlIGFjY3VyYXRlLlxuICAgICAqXG4gICAgICogVGhlIHZhbHVlIDAgd2lsbCBiZSBpZ25vcmVkLCBzaW5jZSBvdXIgc2ltcyBhcmUgbGlrZWx5IHRvIHVzZSBtb3JlIHRoYW4gdGhhdCBtdWNoIG1lbW9yeS5cbiAgICAgKi9cbiAgICBtZW1vcnlMaW1pdDoge1xuICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICBkZWZhdWx0VmFsdWU6IDBcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRW5hYmxlcyB0cmFuc2Zvcm1pbmcgdGhlIFBET00gZm9yIGFjY2Vzc2liaWxpdHkgb24gbW9iaWxlIGRldmljZXMuIFRoaXMgd29yayBpcyBleHBlcmltZW50YWwsIGFuZCBzdGlsbCBoaWRkZW5cbiAgICAgKiBpbiBhIHNjZW5lcnkgYnJhbmNoIHBkb20tdHJhbnNmb3JtLiBNdXN0IGJlIHVzZWQgaW4gY29tYmluYXRpb24gd2l0aCB0aGUgYWNjZXNzaWJpbGl0eSBxdWVyeSBwYXJhbWV0ZXIsIG9yXG4gICAgICogb24gYSBzaW0gdGhhdCBoYXMgYWNjZXNzaWJpbGl0eSBlbmFibGVkIGJ5IGRlZmF1bHQuIFRoaXMgcXVlcnkgcGFyYW1ldGVyIGlzIG5vdCBpbnRlbmRlZCB0byBiZSBsb25nLWxpdmVkLFxuICAgICAqIGluIHRoZSBmdXR1cmUgdGhlc2UgZmVhdHVyZXMgc2hvdWxkIGJlIGFsd2F5cyBlbmFibGVkIGluIHRoZSBzY2VuZXJ5IGExMXkgZnJhbWV3b3JrLlxuICAgICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvODUyXG4gICAgICpcbiAgICAgKiBGb3IgaW50ZXJuYWwgdXNlIGFuZCB0ZXN0aW5nIG9ubHksIHRob3VnaCBsaW5rcyB3aXRoIHRoaXMgbWF5IGJlIHNoYXJlZCB3aXRoIGNvbGxhYm9yYXRvcnMuXG4gICAgICpcbiAgICAgKiBAYTExeVxuICAgICAqL1xuICAgIG1vYmlsZUExMXlUZXN0OiB7IHR5cGU6ICdmbGFnJyB9LFxuXG4gICAgLyoqXG4gICAgICogV2hlbiBhIHNpbXVsYXRpb24gaXMgcnVuIGZyb20gdGhlIFBoRVQgQW5kcm9pZCBhcHAsIGl0IHNob3VsZCBzZXQgdGhpcyBmbGFnLiBJdCBhbHRlcnMgc3RhdGlzdGljcyB0aGF0IHRoZSBzaW0gc2VuZHNcbiAgICAgKiB0byBHb29nbGUgQW5hbHl0aWNzIGFuZCBwb3RlbnRpYWxseSBvdGhlciBzb3VyY2VzIGluIHRoZSBmdXR1cmUuXG4gICAgICpcbiAgICAgKiBBbHNvIHJlbW92ZXMgdGhlIGZvbGxvd2luZyBpdGVtcyBmcm9tIHRoZSBcIlBoRVQgTWVudVwiOlxuICAgICAqIFJlcG9ydCBhIFByb2JsZW1cbiAgICAgKiBDaGVjayBmb3IgVXBkYXRlc1xuICAgICAqIFNjcmVlbnNob3RcbiAgICAgKiBGdWxsIFNjcmVlblxuICAgICAqL1xuICAgICdwaGV0LWFuZHJvaWQtYXBwJzogeyB0eXBlOiAnZmxhZycgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZW4gYSBzaW11bGF0aW9uIGlzIHJ1biBmcm9tIHRoZSBQaEVUIGlPUyBhcHAsIGl0IHNob3VsZCBzZXQgdGhpcyBmbGFnLiBJdCBhbHRlcnMgc3RhdGlzdGljcyB0aGF0IHRoZSBzaW0gc2VuZHNcbiAgICAgKiB0byBHb29nbGUgQW5hbHl0aWNzIGFuZCBwb3RlbnRpYWxseSBvdGhlciBzb3VyY2VzIGluIHRoZSBmdXR1cmUuXG4gICAgICpcbiAgICAgKiBBbHNvIHJlbW92ZXMgdGhlIGZvbGxvd2luZyBpdGVtcyBmcm9tIHRoZSBcIlBoRVQgTWVudVwiOlxuICAgICAqIFJlcG9ydCBhIFByb2JsZW1cbiAgICAgKiBDaGVjayBmb3IgVXBkYXRlc1xuICAgICAqIFNjcmVlbnNob3RcbiAgICAgKiBGdWxsIFNjcmVlblxuICAgICAqL1xuICAgICdwaGV0LWFwcCc6IHsgdHlwZTogJ2ZsYWcnIH0sXG5cbiAgICAvKipcbiAgICAgKiBJZiB0cnVlLCBwdXRzIHRoZSBzaW11bGF0aW9uIGluIGEgc3BlY2lhbCBtb2RlIHdoZXJlIGl0IHdpbGwgd2FpdCBmb3IgbWFudWFsIGNvbnRyb2wgb2YgdGhlIHNpbSBwbGF5YmFjay5cbiAgICAgKi9cbiAgICBwbGF5YmFja01vZGU6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogZmFsc2VcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmlyZXMgYSBwb3N0LW1lc3NhZ2Ugd2hlbiB0aGUgc2ltIGlzIGFib3V0IHRvIGNoYW5nZSB0byBhbm90aGVyIFVSTFxuICAgICAqL1xuICAgIHBvc3RNZXNzYWdlT25CZWZvcmVVbmxvYWQ6IHsgdHlwZTogJ2ZsYWcnIH0sXG5cbiAgICAvKipcbiAgICAgKiBwYXNzZXMgZXJyb3JzIHRvIHBhcmVudCBmcmFtZSAobGlrZSBmdXp6LWxpZ2h0eWVhcilcbiAgICAgKi9cbiAgICBwb3N0TWVzc2FnZU9uRXJyb3I6IHsgdHlwZTogJ2ZsYWcnIH0sXG5cbiAgICAvKipcbiAgICAgKiB0cmlnZ2VycyBhIHBvc3QtbWVzc2FnZSB0aGF0IGZpcmVzIHdoZW4gdGhlIHNpbSBmaW5pc2hlcyBsb2FkaW5nLCBjdXJyZW50bHkgdXNlZCBieSBhcXVhIGZ1enotbGlnaHR5ZWFyXG4gICAgICovXG4gICAgcG9zdE1lc3NhZ2VPbkxvYWQ6IHsgdHlwZTogJ2ZsYWcnIH0sXG5cbiAgICAvKipcbiAgICAgKiB0cmlnZ2VycyBhIHBvc3QtbWVzc2FnZSB0aGF0IGZpcmVzIHdoZW4gdGhlIHNpbXVsYXRpb24gaXMgcmVhZHkgdG8gc3RhcnQuXG4gICAgICovXG4gICAgcG9zdE1lc3NhZ2VPblJlYWR5OiB7IHR5cGU6ICdmbGFnJyB9LFxuXG4gICAgLyoqXG4gICAgICogSWYgdHJ1ZSwgdGhlIGZ1bGwgc2NyZWVuIGJ1dHRvbiB3b24ndCBiZSBzaG93biBpbiB0aGUgcGhldCBtZW51XG4gICAgICovXG4gICAgcHJldmVudEZ1bGxTY3JlZW46IHsgdHlwZTogJ2ZsYWcnIH0sXG5cbiAgICAvKipcbiAgICAgKiBzaG93cyBwcm9maWxpbmcgaW5mb3JtYXRpb24gZm9yIHRoZSBzaW1cbiAgICAgKi9cbiAgICBwcm9maWxlcjogeyB0eXBlOiAnZmxhZycgfSxcblxuICAgIC8qKlxuICAgICAqIGFkZHMgYSBtZW51IGl0ZW0gdGhhdCB3aWxsIG9wZW4gYSB3aW5kb3cgd2l0aCBhIFFSIGNvZGUgd2l0aCB0aGUgVVJMIG9mIHRoZSBzaW11bGF0aW9uXG4gICAgICovXG4gICAgcXJDb2RlOiB7IHR5cGU6ICdmbGFnJyB9LFxuXG4gICAgLyoqXG4gICAgICogUmFuZG9tIHNlZWQgaW4gdGhlIHByZWxvYWQgY29kZSB0aGF0IGNhbiBiZSB1c2VkIHRvIG1ha2Ugc3VyZSBwbGF5YmFjayBzaW11bGF0aW9ucyB1c2UgdGhlIHNhbWUgc2VlZCAoYW5kIHRodXNcbiAgICAgKiB0aGUgc2ltdWxhdGlvbiBzdGF0ZSwgZ2l2ZW4gdGhlIGlucHV0IGV2ZW50cyBhbmQgZnJhbWVzLCBjYW4gYmUgZXhhY3RseSByZXByb2R1Y2VkKVxuICAgICAqIFNlZSBSYW5kb20uanNcbiAgICAgKi9cbiAgICByYW5kb21TZWVkOiB7XG4gICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogTWF0aC5yYW5kb20oKVxuICAgIH0sXG5cbiAgICAvKlxuICAgICAqIFNldHMgdGhlIGRlZmF1bHQgZm9yIHRoZSBSZWdpb24gYW5kIEN1bHR1cmUgZmVhdHVyZS4gVGhlIHNldCBvZiB2YWxpZCB2YWx1ZXMgaXMgZGV0ZXJtaW5lZCBieVxuICAgICAqIFwic3VwcG9ydGVkUmVnaW9uc0FuZEN1bHR1cmVzVmFsdWVzXCIgaW4gcGFja2FnZS5qc29uLiBJZiBub3QgcHJvdmlkZWQgaW4gdGhlIFVSTCwgdGhlIGRlZmF1bHQgY2FuXG4gICAgICogYmUgc2V0IHZpYSBcImRlZmF1bHRSZWdpb25BbmRDdWx0dXJlXCIgaW4gcGFja2FnZS5qc29uLCB3aGljaCBkZWZhdWx0cyB0byAndXNhJy5cbiAgICAgKi9cbiAgICByZWdpb25BbmRDdWx0dXJlOiB7XG4gICAgICBwdWJsaWM6IHRydWUsXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogcGFja2FnZVBoZXQ/LnNpbUZlYXR1cmVzPy5kZWZhdWx0UmVnaW9uQW5kQ3VsdHVyZSA/PyAndXNhJyxcbiAgICAgIHZhbGlkVmFsdWVzOiBwYWNrYWdlUGhldD8uc2ltRmVhdHVyZXM/LnN1cHBvcnRlZFJlZ2lvbnNBbmRDdWx0dXJlcyA/PyBbICd1c2EnIF0gLy8gZGVmYXVsdCB2YWx1ZSBtdXN0IGJlIGluIHZhbGlkVmFsdWVzXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNwZWNpZnkgYSByZW5kZXJlciBmb3IgdGhlIFNpbSdzIHJvb3ROb2RlIHRvIHVzZS5cbiAgICAgKi9cbiAgICByb290UmVuZGVyZXI6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdFZhbHVlOiBudWxsLFxuICAgICAgdmFsaWRWYWx1ZXM6IFsgbnVsbCwgJ2NhbnZhcycsICdzdmcnLCAnZG9tJywgJ3dlYmdsJywgJ3ZlbGxvJyBdIC8vIHNlZSBOb2RlLnNldFJlbmRlcmVyXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFycmF5IG9mIG9uZSBvciBtb3JlIGxvZ3MgdG8gZW5hYmxlIGluIHNjZW5lcnkgMC4yKywgZGVsaW1pdGVkIHdpdGggY29tbWFzLlxuICAgICAqIEZvciBleGFtcGxlOiA/c2NlbmVyeUxvZz1EaXNwbGF5LERyYXdhYmxlLFdlYkdMQmxvY2sgcmVzdWx0cyBpbiBbICdEaXNwbGF5JywgJ0RyYXdhYmxlJywgJ1dlYkdMQmxvY2snIF1cbiAgICAgKiBEb24ndCBjaGFuZ2UgdGhpcyB3aXRob3V0IHVwZGF0aW5nIHRoZSBzaWduYXR1cmUgaW4gc2NlbmVyeSB1bml0IHRlc3RzIHRvby5cbiAgICAgKlxuICAgICAqIFRoZSBlbnRpcmUgc3VwcG9ydGVkIGxpc3QgaXMgaW4gc2NlbmVyeS5qcyBpbiB0aGUgbG9nUHJvcGVydGllcyBvYmplY3QuXG4gICAgICovXG4gICAgc2NlbmVyeUxvZzoge1xuICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgIGVsZW1lbnRTY2hlbWE6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIH0sXG4gICAgICBkZWZhdWx0VmFsdWU6IG51bGxcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2NlbmVyeSBsb2dzIHdpbGwgYmUgb3V0cHV0IHRvIGEgc3RyaW5nIGluc3RlYWQgb2YgdGhlIHdpbmRvd1xuICAgICAqL1xuICAgIHNjZW5lcnlTdHJpbmdMb2c6IHsgdHlwZTogJ2ZsYWcnIH0sXG5cbiAgICAvKipcbiAgICAgKiBTcGVjaWZpZXMgdGhlIHNldCBvZiBzY3JlZW5zIHRoYXQgYXBwZWFyIGluIHRoZSBzaW0sIGFuZCB0aGVpciBvcmRlci5cbiAgICAgKiBVc2VzIDEtYmFzZWQgKG5vdCB6ZXJvLWJhc2VkKSBhbmQgXCIsXCIgZGVsaW1pdGVkIHN0cmluZyBzdWNoIGFzIFwiMSwzLDRcIiB0byBnZXQgdGhlIDFzdCwgM3JkIGFuZCA0dGggc2NyZWVuLlxuICAgICAqIEB0eXBlIHtBcnJheS48bnVtYmVyPn1cbiAgICAgKi9cbiAgICBzY3JlZW5zOiB7XG4gICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgZWxlbWVudFNjaGVtYToge1xuICAgICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgICAgaXNWYWxpZFZhbHVlOiBOdW1iZXIuaXNJbnRlZ2VyXG4gICAgICB9LFxuICAgICAgZGVmYXVsdFZhbHVlOiBudWxsLFxuICAgICAgaXNWYWxpZFZhbHVlOiBmdW5jdGlvbiggdmFsdWUgKSB7XG5cbiAgICAgICAgLy8gc2NyZWVuIGluZGljZXMgY2Fubm90IGJlIGR1cGxpY2F0ZWRcbiAgICAgICAgcmV0dXJuIHZhbHVlID09PSBudWxsIHx8ICggdmFsdWUubGVuZ3RoID09PSBfLnVuaXEoIHZhbHVlICkubGVuZ3RoICYmIHZhbHVlLmxlbmd0aCA+IDAgKTtcbiAgICAgIH0sXG4gICAgICBwdWJsaWM6IHRydWVcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVHlwaWNhbGx5IHVzZWQgdG8gc2hvdyBhbnN3ZXJzIChvciBoaWRkZW4gY29udHJvbHMgdGhhdCBzaG93IGFuc3dlcnMpIHRvIGNoYWxsZW5nZXMgaW4gc2ltIGdhbWVzLlxuICAgICAqIEZvciBpbnRlcm5hbCB1c2UgYnkgUGhFVCB0ZWFtIG1lbWJlcnMgb25seS5cbiAgICAgKi9cbiAgICBzaG93QW5zd2Vyczoge1xuICAgICAgdHlwZTogJ2ZsYWcnLFxuICAgICAgcHJpdmF0ZTogdHJ1ZVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEaXNwbGF5cyBhbiBvdmVybGF5IG9mIHRoZSBjdXJyZW50IGJvdW5kcyBvZiBlYWNoIENhbnZhc05vZGVcbiAgICAgKi9cbiAgICBzaG93Q2FudmFzTm9kZUJvdW5kczogeyB0eXBlOiAnZmxhZycgfSxcblxuICAgIC8qKlxuICAgICAqIERpc3BsYXlzIGFuIG92ZXJsYXkgb2YgdGhlIGN1cnJlbnQgYm91bmRzIG9mIGVhY2ggcGhldC5zY2VuZXJ5LkZpdHRlZEJsb2NrXG4gICAgICovXG4gICAgc2hvd0ZpdHRlZEJsb2NrQm91bmRzOiB7IHR5cGU6ICdmbGFnJyB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvd3MgaGl0IGFyZWFzIGFzIGRhc2hlZCBsaW5lcy5cbiAgICAgKi9cbiAgICBzaG93SGl0QXJlYXM6IHsgdHlwZTogJ2ZsYWcnIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93cyBwb2ludGVyIGFyZWFzIGFzIGRhc2hlZCBsaW5lcy4gdG91Y2hBcmVhcyBhcmUgcmVkLCBtb3VzZUFyZWFzIGFyZSBibHVlLlxuICAgICAqL1xuICAgIHNob3dQb2ludGVyQXJlYXM6IHsgdHlwZTogJ2ZsYWcnIH0sXG5cbiAgICAvKipcbiAgICAgKiBEaXNwbGF5cyBhIHNlbWktdHJhbnNwYXJlbnQgY3Vyc29yIGluZGljYXRvciBmb3IgdGhlIHBvc2l0aW9uIG9mIGVhY2ggYWN0aXZlIHBvaW50ZXIgb24gdGhlIHNjcmVlbi5cbiAgICAgKi9cbiAgICBzaG93UG9pbnRlcnM6IHsgdHlwZTogJ2ZsYWcnIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93cyB0aGUgdmlzaWJsZSBib3VuZHMgaW4gU2NyZWVuVmlldy5qcywgZm9yIGRlYnVnZ2luZyB0aGUgbGF5b3V0IG91dHNpZGUgdGhlIFwiZGV2XCIgYm91bmRzXG4gICAgICovXG4gICAgc2hvd1Zpc2libGVCb3VuZHM6IHsgdHlwZTogJ2ZsYWcnIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaHVmZmxlcyBsaXN0ZW5lcnMgZWFjaCB0aW1lIHRoZXkgYXJlIG5vdGlmaWVkLCB0byBoZWxwIHVzIHRlc3Qgb3JkZXIgZGVwZW5kZW5jeSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9heG9uL2lzc3Vlcy8yMTVcbiAgICAgKlxuICAgICAqICdkZWZhdWx0JyAtIG5vIHNodWZmbGluZ1xuICAgICAqICdyYW5kb20nIC0gY2hvb3NlcyBhIHNlZWQgZm9yIHlvdVxuICAgICAqICdyYW5kb20oMTIzKScgLSBzcGVjaWZ5IGEgc2VlZFxuICAgICAqICdyZXZlcnNlJyAtIHJldmVyc2UgdGhlIG9yZGVyIG9mIGxpc3RlbmVyc1xuICAgICAqL1xuICAgIGxpc3RlbmVyT3JkZXI6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdFZhbHVlOiAnZGVmYXVsdCcsXG4gICAgICBpc1ZhbGlkVmFsdWU6IGZ1bmN0aW9uKCB2YWx1ZSApIHtcblxuICAgICAgICAvLyBOT1RFOiB0aGlzIHJlZ3VsYXIgZXhwcmVzc2lvbiBtdXN0IGJlIG1haW50YWluZWQgaW4gVGlueUVtaXR0ZXIudHMgYXMgd2VsbC5cbiAgICAgICAgY29uc3QgcmVnZXggPSAvcmFuZG9tKD86JTI4fFxcKCkoXFxkKykoPzolMjl8XFwpKS87XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlID09PSAnZGVmYXVsdCcgfHwgdmFsdWUgPT09ICdyYW5kb20nIHx8IHZhbHVlID09PSAncmV2ZXJzZScgfHwgdmFsdWUubWF0Y2goIHJlZ2V4ICk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZW4gdHJ1ZSwgdXNlIFNwZWVjaFN5bnRoZXNpc1BhcmVudFBvbHlmaWxsIHRvIGFzc2lnbiBhbiBpbXBsZW1lbnRhdGlvbiBvZiBTcGVlY2hTeW50aGVzaXNcbiAgICAgKiB0byB0aGUgd2luZG93IHNvIHRoYXQgaXQgY2FuIGJlIHVzZWQgaW4gcGxhdGZvcm1zIHdoZXJlIGl0IG90aGVyd2lzZSB3b3VsZCBub3QgYmUgYXZhaWxhYmxlLlxuICAgICAqIEFzc3VtZXMgdGhhdCBhbiBpbXBsZW1lbnRhdGlvbiBvZiBTcGVlY2hTeW50aGVzaXMgaXMgYXZhaWxhYmxlIGZyb20gYSBwYXJlbnQgaWZyYW1lIHdpbmRvdy5cbiAgICAgKiBTZWUgU3BlZWNoU3ludGhlc2lzUGFyZW50UG9seWZpbGwgaW4gdXR0ZXJhbmNlLXF1ZXVlIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgICAqXG4gICAgICogVGhpcyBjYW5ub3QgYmUgYSBxdWVyeSBwYXJhbWV0ZXIgaW4gdXR0ZXJhbmNlLXF1ZXVlIGJlY2F1c2UgdXR0ZXJhbmNlLXF1ZXVlIChhIGRlcGVuZGVuY3kgb2Ygc2NlbmVyeSlcbiAgICAgKiBjYW4gbm90IHVzZSBRdWVyeVN0cmluZ01hY2hpbmUuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTM2Ni5cbiAgICAgKlxuICAgICAqIEZvciBtb3JlIGluZm9ybWF0aW9uIGFib3V0IHRoZSBtb3RpdmF0aW9uIGZvciB0aGlzIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZmVuc3Rlci9pc3N1ZXMvM1xuICAgICAqXG4gICAgICogRm9yIGludGVybmFsIHVzZSBvbmx5LlxuICAgICAqL1xuICAgIHNwZWVjaFN5bnRoZXNpc0Zyb21QYXJlbnQ6IHtcbiAgICAgIHR5cGU6ICdmbGFnJ1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTcGVlZCBtdWx0aXBsaWVyIGZvciBldmVyeXRoaW5nIGluIHRoZSBzaW0uIFRoaXMgc2NhbGVzIHRoZSB2YWx1ZSBvZiBkdCBmb3IgQVhPTi90aW1lcixcbiAgICAgKiBtb2RlbC5zdGVwLCB2aWV3LnN0ZXAsIGFuZCBhbnl0aGluZyBlbHNlIHRoYXQgaXMgY29udHJvbGxlZCBmcm9tIFNpbS5zdGVwU2ltdWxhdGlvbi5cbiAgICAgKiBOb3JtYWwgc3BlZWQgaXMgMS4gTGFyZ2VyIHZhbHVlcyBtYWtlIHRpbWUgZ28gZmFzdGVyLCBzbWFsbGVyIHZhbHVlcyBtYWtlIHRpbWUgZ28gc2xvd2VyLlxuICAgICAqIEZvciBleGFtcGxlLCA/c3BlZWQ9MC41IGlzIGhhbGYgdGhlIG5vcm1hbCBzcGVlZC5cbiAgICAgKiBVc2VmdWwgZm9yIHRlc3RpbmcgbXVsdGl0b3VjaCwgc28gdGhhdCBvYmplY3RzIGFyZSBlYXNpZXIgdG8gZ3JhYiB3aGlsZSB0aGV5J3JlIG1vdmluZy5cbiAgICAgKiBGb3IgaW50ZXJuYWwgdXNlIG9ubHksIG5vdCBwdWJsaWMgZmFjaW5nLlxuICAgICAqL1xuICAgIHNwZWVkOiB7XG4gICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogMSxcbiAgICAgIGlzVmFsaWRWYWx1ZTogZnVuY3Rpb24oIHZhbHVlICkge1xuICAgICAgICByZXR1cm4gdmFsdWUgPiAwO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXRzIGEgc3RyaW5nIHVzZWQgZm9yIHZhcmlvdXMgaTE4biB0ZXN0LiAgVGhlIHZhbHVlcyBhcmU6XG4gICAgICpcbiAgICAgKiBkb3VibGU6IGR1cGxpY2F0ZXMgYWxsIG9mIHRoZSB0cmFuc2xhdGVkIHN0cmluZ3Mgd2hpY2ggd2lsbCBhbGxvdyB0byBzZWUgKGEpIGlmIGFsbCBzdHJpbmdzXG4gICAgICogICBhcmUgdHJhbnNsYXRlZCBhbmQgKGIpIHdoZXRoZXIgdGhlIGxheW91dCBjYW4gYWNjb21tb2RhdGUgbG9uZ2VyIHN0cmluZ3MgZnJvbSBvdGhlciBsYW5ndWFnZXMuXG4gICAgICogICBOb3RlIHRoaXMgaXMgYSBoZXVyaXN0aWMgcnVsZSB0aGF0IGRvZXMgbm90IGNvdmVyIGFsbCBjYXNlcy5cbiAgICAgKlxuICAgICAqIGxvbmc6IGFuIGV4Y2VwdGlvbmFsbHkgbG9uZyBzdHJpbmcgd2lsbCBiZSBzdWJzdGl0dXRlZCBmb3IgYWxsIHN0cmluZ3MuIFVzZSB0aGlzIHRvIHRlc3QgZm9yIGxheW91dCBwcm9ibGVtcy5cbiAgICAgKlxuICAgICAqIHJ0bDogYSBzdHJpbmcgdGhhdCB0ZXN0cyBSVEwgKHJpZ2h0LXRvLWxlZnQpIGNhcGFiaWxpdGllcyB3aWxsIGJlIHN1YnN0aXR1dGVkIGZvciBhbGwgc3RyaW5nc1xuICAgICAqXG4gICAgICogeHNzOiB0ZXN0cyBmb3Igc2VjdXJpdHkgaXNzdWVzIHJlbGF0ZWQgdG8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NwZWNpYWwtb3BzL2lzc3Vlcy8xOCxcbiAgICAgKiAgIGFuZCBydW5uaW5nIGEgc2ltIHNob3VsZCBOT1QgcmVkaXJlY3QgdG8gYW5vdGhlciBwYWdlLiBQcmVmZXJhYmx5IHNob3VsZCBiZSB1c2VkIGZvciBidWlsdCB2ZXJzaW9ucyBvclxuICAgICAqICAgb3RoZXIgdmVyc2lvbnMgd2hlcmUgYXNzZXJ0aW9ucyBhcmUgbm90IGVuYWJsZWQuXG4gICAgICpcbiAgICAgKiBub25lfG51bGw6IHRoZSBub3JtYWwgdHJhbnNsYXRlZCBzdHJpbmcgd2lsbCBiZSBzaG93blxuICAgICAqXG4gICAgICogZHluYW1pYzogYWRkcyBnbG9iYWwgaG90a2V5IGxpc3RlbmVycyB0byBjaGFuZ2UgdGhlIHN0cmluZ3MsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvMTMxOVxuICAgICAqICAgcmlnaHQgYXJyb3cgLSBkb3VibGVzIGEgc3RyaW5nLCBsaWtlIHN0cmluZyA9IHN0cmluZytzdHJpbmdcbiAgICAgKiAgIGxlZnQgYXJyb3cgLSBoYWx2ZXMgYSBzdHJpbmdcbiAgICAgKiAgIHVwIGFycm93IC0gY3ljbGVzIHRvIG5leHQgc3RyaWRlIGluIHJhbmRvbSB3b3JkIGxpc3RcbiAgICAgKiAgIGRvd24gYXJyb3cgLSBjeWNsZXMgdG8gcHJldmlvdXMgc3RyaWRlIGluIHJhbmRvbSB3b3JkIGxpc3RcbiAgICAgKiAgIHNwYWNlYmFyIC0gcmVzZXRzIHRvIGluaXRpYWwgRW5nbGlzaCBzdHJpbmdzLCBhbmQgcmVzZXRzIHRoZSBzdHJpZGVcbiAgICAgKlxuICAgICAqIHtzdHJpbmd9OiBpZiBhbnkgb3RoZXIgc3RyaW5nIHByb3ZpZGVkLCB0aGF0IHN0cmluZyB3aWxsIGJlIHN1YnN0aXR1dGVkIGV2ZXJ5d2hlcmUuIFRoaXMgZmFjaWxpdGF0ZXMgdGVzdGluZ1xuICAgICAqICAgc3BlY2lmaWMgY2FzZXMsIGxpa2Ugd2hldGhlciB0aGUgd29yZCAndml0ZXNzZScgd291bGQgc3Vic3RpdHV0ZSBmb3IgJ3NwZWVkJyB3ZWxsLiAgQWxzbywgdXNpbmcgXCIvdTIwXCIgaXRcbiAgICAgKiAgIHdpbGwgc2hvdyB3aGl0ZXNwYWNlIGZvciBhbGwgb2YgdGhlIHN0cmluZ3MsIG1ha2luZyBpdCBlYXN5IHRvIGlkZW50aWZ5IG5vbi10cmFuc2xhdGVkIHN0cmluZ3MuXG4gICAgICovXG4gICAgc3RyaW5nVGVzdDoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0VmFsdWU6IG51bGxcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogYWRkcyBrZXlib2FyZCBzaG9ydGN1dHMuIGN0cmwraSAoZm9yd2FyZCkgb3IgY3RybCt1IChiYWNrd2FyZCkuIEFsc28sIHRoZSBzYW1lIHBoeXNpY2FsIGtleXMgb24gdGhlXG4gICAgICogZHZvcmFrIGtleWJvYXJkIChjPWZvcndhcmQgYW5kIGc9YmFja3dhcmRzKVxuICAgICAqXG4gICAgICogTk9URTogRFVQTElDQVRJT04gQUxFUlQuIERvbid0IGNoYW5nZSB0aGlzIHdpdGhvdXQgbG9va2luZyBhdCBwYXJhbWV0ZXIgaW4gUEhFVF9JT19XUkFQUEVSUy9QaGV0aW9DbGllbnQudHNcbiAgICAgKi9cbiAgICBrZXlib2FyZExvY2FsZVN3aXRjaGVyOiB7XG4gICAgICB0eXBlOiAnZmxhZydcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRW5hYmxlcyBzdXBwb3J0IGZvciB0aGUgYWNjZXNzaWJsZSBkZXNjcmlwdGlvbiBwbHVnaW4gZmVhdHVyZS5cbiAgICAgKi9cbiAgICBzdXBwb3J0c0Rlc2NyaXB0aW9uUGx1Z2luOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0VmFsdWU6ICEhcGFja2FnZVNpbUZlYXR1cmVzLnN1cHBvcnRzRGVzY3JpcHRpb25QbHVnaW5cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBFbmFibGVzIGludGVyYWN0aXZlIGRlc2NyaXB0aW9uIGluIHRoZSBzaW11bGF0aW9uLiBVc2UgdGhpcyBvcHRpb24gdG8gcmVuZGVyIHRoZSBQYXJhbGxlbCBET00gZm9yIGtleWJvYXJkXG4gICAgICogbmF2aWdhdGlvbiBhbmQgc2NyZWVuLXJlYWRlci1iYXNlZCBhdWRpdG9yeSBkZXNjcmlwdGlvbnMuIENhbiBiZSBwZXJtYW5lbnRseSBlbmFibGVkIGlmXG4gICAgICogYHN1cHBvcnRzSW50ZXJhY3RpdmVEZXNjcmlwdGlvbjogdHJ1ZWAgaXMgYWRkZWQgdW5kZXIgdGhlIGBwaGV0LnNpbUZlYXR1cmVzYCBlbnRyeSBvZiBwYWNrYWdlLmpzb24uIFF1ZXJ5IHBhcmFtZXRlclxuICAgICAqIHZhbHVlIHdpbGwgYWx3YXlzIG92ZXJyaWRlIHBhY2thZ2UuanNvbiBlbnRyeS5cbiAgICAgKi9cbiAgICBzdXBwb3J0c0ludGVyYWN0aXZlRGVzY3JpcHRpb246IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogISFwYWNrYWdlU2ltRmVhdHVyZXMuc3VwcG9ydHNJbnRlcmFjdGl2ZURlc2NyaXB0aW9uXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEVuYWJsZXMgc3VwcG9ydCBmb3IgdGhlIFwiSW50ZXJhY3RpdmUgSGlnaGxpZ2h0c1wiIGZlYXR1cmUsIHdoZXJlIGhpZ2hsaWdodHMgYXBwZWFyIGFyb3VuZCBpbnRlcmFjdGl2ZVxuICAgICAqIFVJIGNvbXBvbmVudHMuIFRoaXMgaXMgbW9zdCB1c2VmdWwgZm9yIHVzZXJzIHdpdGggbG93IHZpc2lvbiBhbmQgbWFrZXMgaXQgZWFzaWVyIHRvIGlkZW50aWZ5IGludGVyYWN0aXZlXG4gICAgICogY29tcG9uZW50cy4gVGhvdWdoIGVuYWJsZWQgaGVyZSwgdGhlIGZlYXR1cmUgd2lsbCBiZSB0dXJuZWQgb2ZmIHVudGlsIGVuYWJsZWQgYnkgdGhlIHVzZXIgZnJvbSB0aGUgUHJlZmVyZW5jZXNcbiAgICAgKiBkaWFsb2cuXG4gICAgICpcbiAgICAgKiBUaGlzIGZlYXR1cmUgaXMgZW5hYmxlZCBieSBkZWZhdWx0IHdoZW5ldmVyIHN1cHBvcnRzSW50ZXJhY3RpdmVEZXNjcmlwdGlvbiBpcyB0cnVlIGluIHBhY2thZ2UuanNvbiwgc2luY2UgUGhFVFxuICAgICAqIHdhbnRzIHRvIHNjYWxlIG91dCB0aGlzIGZlYXR1cmUgd2l0aCBhbGwgc2ltcyB0aGF0IHN1cHBvcnQgYWx0ZXJuYXRpdmUgaW5wdXQuIFRoZSBmZWF0dXJlIGNhbiBiZSBESVNBQkxFRCB3aGVuXG4gICAgICogc3VwcG9ydHNJbnRlcmFjdGl2ZURlc2NyaXB0aW9uIGlzIHRydWUgYnkgc2V0dGluZyBgc3VwcG9ydHNJbnRlcmFjdGl2ZUhpZ2hsaWdodHM6IGZhbHNlYCB1bmRlclxuICAgICAqIGBwaGV0LnNpbUZlYXR1cmVzYCBpbiBwYWNrYWdlLmpzb24uXG4gICAgICpcbiAgICAgKiBUaGUgcXVlcnkgcGFyYW1ldGVyIHdpbGwgYWx3YXlzIG92ZXJyaWRlIHRoZSBwYWNrYWdlLmpzb24gZW50cnkuXG4gICAgICovXG4gICAgc3VwcG9ydHNJbnRlcmFjdGl2ZUhpZ2hsaWdodHM6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcblxuICAgICAgLy8gSWYgc3VwcG9ydHNJbnRlcmFjdGl2ZUhpZ2hsaWdodHMgaXMgZXhwbGljaXRseSBwcm92aWRlZCBpbiBwYWNrYWdlLmpzb24sIHVzZSB0aGF0IHZhbHVlLiBPdGhlcndpc2UsIGVuYWJsZVxuICAgICAgLy8gSW50ZXJhY3RpdmUgSGlnaGxpZ2h0cyB3aGVuIEludGVyYWN0aXZlIERlc2NyaXB0aW9uIGlzIHN1cHBvcnRlZC5cbiAgICAgIGRlZmF1bHRWYWx1ZTogcGFja2FnZVNpbUZlYXR1cmVzLmhhc093blByb3BlcnR5KCAnc3VwcG9ydHNJbnRlcmFjdGl2ZUhpZ2hsaWdodHMnICkgP1xuICAgICAgICAgICAgICAgICAgICAhIXBhY2thZ2VTaW1GZWF0dXJlcy5zdXBwb3J0c0ludGVyYWN0aXZlSGlnaGxpZ2h0cyA6ICEhcGFja2FnZVNpbUZlYXR1cmVzLnN1cHBvcnRzSW50ZXJhY3RpdmVEZXNjcmlwdGlvblxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCeSBkZWZhdWx0LCBJbnRlcmFjdGl2ZSBIaWdobGlnaHRzIGFyZSBkaXNhYmxlZCBvbiBzdGFydHVwLiBQcm92aWRlIHRoaXMgZmxhZyB0byBoYXZlIHRoZSBmZWF0dXJlIGVuYWJsZWQgb25cbiAgICAgKiBzdGFydHVwLiBIYXMgbm8gZWZmZWN0IGlmIHN1cHBvcnRzSW50ZXJhY3RpdmVIaWdobGlnaHRzIGlzIGZhbHNlLlxuICAgICAqL1xuICAgIGludGVyYWN0aXZlSGlnaGxpZ2h0c0luaXRpYWxseUVuYWJsZWQ6IHtcbiAgICAgIHR5cGU6ICdmbGFnJyxcbiAgICAgIHB1YmxpYzogdHJ1ZVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbmRpY2F0ZXMgd2hldGhlciBjdXN0b20gZ2VzdHVyZSBjb250cm9sIGlzIGVuYWJsZWQgYnkgZGVmYXVsdCBpbiB0aGUgc2ltdWxhdGlvbi5cbiAgICAgKiBUaGlzIGlucHV0IG1ldGhvZCBpcyBzdGlsbCBpbiBkZXZlbG9wbWVudCwgbW9zdGx5IHRvIGJlIHVzZWQgaW4gY29tYmluYXRpb24gd2l0aCB0aGUgdm9pY2luZ1xuICAgICAqIGZlYXR1cmUuIEl0IGFsbG93cyB5b3UgdG8gc3dpcGUgdGhlIHNjcmVlbiB0byBtb3ZlIGZvY3VzLCBkb3VibGUgdGFwIHRoZSBzY3JlZW4gdG8gYWN0aXZhdGVcbiAgICAgKiBjb21wb25lbnRzLCBhbmQgdGFwIGFuZCBob2xkIHRvIGluaXRpYXRlIGN1c3RvbSBnZXN0dXJlcy5cbiAgICAgKlxuICAgICAqIEZvciBpbnRlcm5hbCB1c2UsIHRob3VnaCBtYXkgYmUgdXNlZCBpbiBzaGFyZWQgbGlua3Mgd2l0aCBjb2xsYWJvcmF0b3JzLlxuICAgICAqL1xuICAgIHN1cHBvcnRzR2VzdHVyZUNvbnRyb2w6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogISFwYWNrYWdlU2ltRmVhdHVyZXMuc3VwcG9ydHNHZXN0dXJlQ29udHJvbFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb250cm9scyB3aGV0aGVyIHRoZSBcIlZvaWNpbmdcIiBmZWF0dXJlIGlzIGVuYWJsZWQuXG4gICAgICpcbiAgICAgKiBUaGlzIGZlYXR1cmUgaXMgZW5hYmxlZCBieSBkZWZhdWx0IHdoZW4gc3VwcG9ydHNWb2ljaW5nIGlzIHRydWUgaW4gcGFja2FnZS5qc29uLiBUaGUgcXVlcnkgcGFyYW1ldGVyIHdpbGwgYWx3YXlzXG4gICAgICogb3ZlcnJpZGUgdGhlIHBhY2thZ2UuanNvbiBlbnRyeS5cbiAgICAgKi9cbiAgICBzdXBwb3J0c1ZvaWNpbmc6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogISFwYWNrYWdlU2ltRmVhdHVyZXMuc3VwcG9ydHNWb2ljaW5nXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN3aXRjaGVzIHRoZSBWZWxsbyByZW5kZXJpbmcgb2YgVGV4dCB0byB1c2UgU3dhc2ggKHdpdGggZW1iZWRkZWQgZm9udHMpLCBpbnN0ZWFkIG9mIENhbnZhcy5cbiAgICAgKlxuICAgICAqIEZvciBpbnRlcm5hbCB1c2Ugb25seS4gVGhpcyBpcyBjdXJyZW50bHkgb25seSB1c2VkIGluIHByb3RvdHlwZXMuXG4gICAgICovXG4gICAgc3dhc2hUZXh0OiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0VmFsdWU6IHRydWVcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSWYgbm9uLWVtcHR5LCBTd2FzaC1yZW5kZXJlZCB0ZXh0IHdpbGwgc2hvdyB1cCBpbiB0aGUgZ2l2ZW4gY29sb3IgKHVzZWZ1bCBmb3IgZGVidWdnaW5nKVxuICAgICAqXG4gICAgICogRm9yIGludGVybmFsIHVzZSBvbmx5LiBUaGlzIGlzIGN1cnJlbnRseSBvbmx5IHVzZWQgaW4gcHJvdG90eXBlcy5cbiAgICAgKi9cbiAgICBzd2FzaFRleHRDb2xvcjoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0VmFsdWU6ICcnXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJ5IGRlZmF1bHQsIHZvaWNpbmcgaXMgbm90IGVuYWJsZWQgb24gc3RhcnR1cC4gQWRkIHRoaXMgZmxhZyB0byBzdGFydCB0aGUgc2ltIHdpdGggdm9pY2luZyBlbmFibGVkLlxuICAgICAqIE9ubHkgcmVsZXZhbnQgaWYgdGhlIHNpbSBzdXBwb3J0cyBWb2ljaW5nLlxuICAgICAqXG4gICAgICogU29tZSBicm93c2VycyBtYXkgbm90IHN1cHBvcnQgdGhpcyBiZWNhdXNlIHVzZXIgaW5wdXQgaXMgcmVxdWlyZWQgdG8gc3RhcnQgU3BlZWNoU3ludGhlc2lzLiBCdXQgaXQgYWxsb3dzXG4gICAgICogdGVhY2hlcnMgdG8gc3RhcnQgdGhlIHNpbSB3aXRoIFZvaWNpbmcgZW5hYmxlZCwgc28gaXQgaXMgc3RpbGwgcHVibGljIGFuZCB1c2FibGUgd2hlcmUgcG9zc2libGUuXG4gICAgICovXG4gICAgdm9pY2luZ0luaXRpYWxseUVuYWJsZWQ6IHtcbiAgICAgIHR5cGU6ICdmbGFnJyxcbiAgICAgIHB1YmxpYzogdHJ1ZVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBIGRlYnVnIHF1ZXJ5IHBhcmFtZXRlciB0aGF0IHdpbGwgc2F2ZSBhbmQgbG9hZCB5b3UgcHJlZmVyZW5jZXMgKGZyb20gdGhlIFByZWZlcmVuY2VzIERpYWxvZykgdGhyb3VnaCBtdWx0aXBsZSBydW50aW1lcy5cbiAgICAgKiBTZWUgUHJlZmVyZW5jZXNTdG9yYWdlLnJlZ2lzdGVyIHRvIHNlZSB3aGF0IFByb3BlcnRpZXMgc3VwcG9ydCB0aGlzIHNhdmUvbG9hZCBmZWF0dXJlLlxuICAgICAqL1xuICAgIHByZWZlcmVuY2VzU3RvcmFnZToge1xuICAgICAgdHlwZTogJ2ZsYWcnXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbnNvbGUgbG9nIHRoZSB2b2ljaW5nIHJlc3BvbnNlcyB0aGF0IGFyZSBzcG9rZW4gYnkgU3BlZWNoU3ludGhlc2lzXG4gICAgICovXG4gICAgcHJpbnRWb2ljaW5nUmVzcG9uc2VzOiB7XG4gICAgICB0eXBlOiAnZmxhZydcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRW5hYmxlcyBwYW5uaW5nIGFuZCB6b29taW5nIG9mIHRoZSBzaW11bGF0aW9uLiBDYW4gYmUgcGVybWFuZW50bHkgZGlzYWJsZWQgaWYgc3VwcG9ydHNQYW5BbmRab29tOiBmYWxzZSBpc1xuICAgICAqIGFkZGVkIHVuZGVyIHRoZSBgcGhldC5zaW1GZWF0dXJlc2AgZW50cnkgb2YgcGFja2FnZS5qc29uLiBRdWVyeSBwYXJhbWV0ZXIgdmFsdWUgd2lsbCBhbHdheXMgb3ZlcnJpZGUgcGFja2FnZS5qc29uIGVudHJ5LlxuICAgICAqXG4gICAgICogUHVibGljLCBzbyB0aGF0IHVzZXJzIGNhbiBkaXNhYmxlIHRoaXMgZmVhdHVyZSBpZiB0aGV5IG5lZWQgdG8uXG4gICAgICovXG4gICAgc3VwcG9ydHNQYW5BbmRab29tOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBwdWJsaWM6IHRydWUsXG5cbiAgICAgIC8vIGV2ZW4gaWYgbm90IHByb3ZpZGVkIGluIHBhY2thZ2UuanNvbiwgdGhpcyBkZWZhdWx0cyB0byBiZWluZyB0cnVlXG4gICAgICBkZWZhdWx0VmFsdWU6ICFwYWNrYWdlU2ltRmVhdHVyZXMuaGFzT3duUHJvcGVydHkoICdzdXBwb3J0c1BhbkFuZFpvb20nICkgfHwgcGFja2FnZVNpbUZlYXR1cmVzLnN1cHBvcnRzUGFuQW5kWm9vbVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgc291bmQgbGlicmFyeSBzaG91bGQgYmUgZW5hYmxlZC4gIElmIHRydWUsIGFuIGljb24gaXMgYWRkZWQgdG8gdGhlIG5hdiBiYXIgaWNvbiB0byBlbmFibGVcbiAgICAgKiB0aGUgdXNlciB0byB0dXJuIHNvdW5kIG9uL29mZi4gIFRoZXJlIGlzIGFsc28gYSBTaW0gb3B0aW9uIGZvciBlbmFibGluZyBzb3VuZCB3aGljaCBjYW4gb3ZlcnJpZGUgdGhpcy5cbiAgICAgKiBQcmltYXJpbHkgZm9yIGludGVybmFsIHVzZSwgdGhvdWdoIHdlIG1heSBzaGFyZSBsaW5rcyB3aXRoIGNvbGxhYm9yYXRlcyB0aGF0IHVzZSB0aGlzIHBhcmFtZXRlci5cbiAgICAgKi9cbiAgICBzdXBwb3J0c1NvdW5kOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0VmFsdWU6ICEhcGFja2FnZVNpbUZlYXR1cmVzLnN1cHBvcnRzU291bmRcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5kaWNhdGVzIHdoZXRoZXIgZXh0cmEgc291bmRzIGFyZSB1c2VkIGluIGFkZGl0aW9uIHRvIGJhc2ljIHNvdW5kcyBhcyBwYXJ0IG9mIHRoZSBzb3VuZCBkZXNpZ24uICBJZiB0cnVlLCB0aGVcbiAgICAgKiBQaEVUIG1lbnUgd2lsbCBoYXZlIGFuIG9wdGlvbiBmb3IgZW5hYmxpbmcgZXh0cmEgc291bmRzLiAgVGhpcyB3aWxsIGJlIGlnbm9yZWQgaWYgc291bmQgaXMgbm90IGdlbmVyYWxseVxuICAgICAqIGVuYWJsZWQgKHNlZSA/c3VwcG9ydHNTb3VuZCkuXG4gICAgICpcbiAgICAgKiBQcmltYXJpbHkgZm9yIGludGVybmFsIHVzZSwgdGhvdWdoIHdlIG1heSBzaGFyZSBsaW5rcyB3aXRoIGNvbGxhYm9yYXRlcyB0aGF0IHVzZSB0aGlzIHBhcmFtZXRlci5cbiAgICAgKi9cbiAgICBzdXBwb3J0c0V4dHJhU291bmQ6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogISFwYWNrYWdlU2ltRmVhdHVyZXMuc3VwcG9ydHNFeHRyYVNvdW5kXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluZGljYXRlcyB3aGV0aGVyIG9yIG5vdCB2aWJyYXRpb24gaXMgZW5hYmxlZCwgYW5kIHdoaWNoIHBhcmFkaWdtIGlzIGVuYWJsZWQgZm9yIHRlc3RpbmcuIFRoZXJlXG4gICAgICogYXJlIHNldmVyYWwgXCJwYXJhZGlnbXNcIiwgd2hpY2ggYXJlIGRpZmZlcmVudCB2aWJyYXRpb24gb3V0cHV0IGRlc2lnbnMuICBGb3IgdGVtcG9yYXJ5IHVzZVxuICAgICAqIHdoaWxlIHdlIGludmVzdGlnYXRlIHVzZSBvZiB0aGlzIGZlYXR1cmUuIEluIHRoZSBsb25nIHJ1biB0aGVyZSB3aWxsIHByb2JhYmx5IGJlIG9ubHlcbiAgICAgKiBvbmUgZGVzaWduIGFuZCBpdCBjYW4gYmUgZW5hYmxlZC9kaXNhYmxlZCB3aXRoIHNvbWV0aGluZyBtb3JlIGxpa2UgYHN1cHBvcnRzVmlicmF0aW9uYC5cbiAgICAgKlxuICAgICAqIFRoZXNlIGFyZSBudW1iZXJlZCwgYnV0IHR5cGUgaXMgc3RyaW5nIHNvIGRlZmF1bHQgY2FuIGJlIG51bGwsIHdoZXJlIGFsbCB2aWJyYXRpb24gaXMgZGlzYWJsZWQuXG4gICAgICpcbiAgICAgKiBVc2VkIGludGVybmFsbHksIHRob3VnaCBsaW5rcyBhcmUgc2hhcmVkIHdpdGggY29sbGFib3JhdG9ycyBhbmQgcG9zc2libHkgaW4gcGFwZXIgcHVibGljYXRpb25zLlxuICAgICAqL1xuICAgIHZpYnJhdGlvblBhcmFkaWdtOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogbnVsbFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPbmx5IHJlbGV2YW50IHdoZW4gdGhlIHNpbSBzdXBwb3J0cyB0aGUgVm9pY2luZyBmZWF0dXJlLiBJZiB0cnVlLCBWb2ljaW5nIG9iamVjdCByZXNwb25zZXNcbiAgICAgKiBhcmUgZW5hYmxlZCBieSBkZWZhdWx0LlxuICAgICAqXG4gICAgICogVGhlc2UgcGFyYW1ldGVycyBhbGxvdyBmaW5lLT10dW5lZCBjb250cm9sIG92ZXIgdGhlIGluaXRpYWwgc3RhdGUgYW5kIGJlaGF2aW9yIG9mIHRoZSBWb2ljaW5nIGZlYXR1cmUsXG4gICAgICogYWxsb3dpbmcgYmV0dGVyIGN1c3RvbWl6YXRpb24gYW5kIGFjY2Vzc2liaWxpdHkgZm9yIHZhcmlvdXMgdXNlcnMuXG4gICAgICovXG4gICAgdm9pY2luZ0FkZE9iamVjdFJlc3BvbnNlczoge1xuICAgICAgdHlwZTogJ2ZsYWcnLFxuICAgICAgcHVibGljOiB0cnVlXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE9ubHkgcmVsZXZhbnQgd2hlbiB0aGUgc2ltIHN1cHBvcnRzIHRoZSBWb2ljaW5nIGZlYXR1cmUuIElmIHRydWUsIFZvaWNpbmcgY29udGV4dCByZXNwb25zZXNcbiAgICAgKiBhcmUgZW5hYmxlZCBieSBkZWZhdWx0LlxuICAgICAqXG4gICAgICogVGhlc2UgcGFyYW1ldGVycyBhbGxvdyBmaW5lLT10dW5lZCBjb250cm9sIG92ZXIgdGhlIGluaXRpYWwgc3RhdGUgYW5kIGJlaGF2aW9yIG9mIHRoZSBWb2ljaW5nIGZlYXR1cmUsXG4gICAgICogYWxsb3dpbmcgYmV0dGVyIGN1c3RvbWl6YXRpb24gYW5kIGFjY2Vzc2liaWxpdHkgZm9yIHZhcmlvdXMgdXNlcnMuXG4gICAgICovXG4gICAgdm9pY2luZ0FkZENvbnRleHRSZXNwb25zZXM6IHtcbiAgICAgIHR5cGU6ICdmbGFnJyxcbiAgICAgIHB1YmxpYzogdHJ1ZVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPbmx5IHJlbGV2YW50IHdoZW4gdGhlIHNpbSBzdXBwb3J0cyB0aGUgVm9pY2luZyBmZWF0dXJlLiBJZiB0cnVlLCBWb2ljaW5nIGhpbnQgcmVzcG9uc2VzXG4gICAgICogYXJlIGVuYWJsZWQgYnkgZGVmYXVsdC5cbiAgICAgKlxuICAgICAqIFRoZXNlIHBhcmFtZXRlcnMgYWxsb3cgZmluZS09dHVuZWQgY29udHJvbCBvdmVyIHRoZSBpbml0aWFsIHN0YXRlIGFuZCBiZWhhdmlvciBvZiB0aGUgVm9pY2luZyBmZWF0dXJlLFxuICAgICAqIGFsbG93aW5nIGJldHRlciBjdXN0b21pemF0aW9uIGFuZCBhY2Nlc3NpYmlsaXR5IGZvciB2YXJpb3VzIHVzZXJzLlxuICAgICAqL1xuICAgIHZvaWNpbmdBZGRIaW50UmVzcG9uc2VzOiB7XG4gICAgICB0eXBlOiAnZmxhZycsXG4gICAgICBwdWJsaWM6IHRydWVcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT25seSByZWxldmFudCB3aGVuIHRoZSBzaW0gc3VwcG9ydHMgdGhlIFZvaWNpbmcgZmVhdHVyZS4gSWYgdHJ1ZSwgdGhlIFZvaWNpbmcgdG9vbGJhciB3aWxsIGJlIGNvbGxhcHNlZFxuICAgICAqIGJ5IGRlZmF1bHQgd2hlbiBWb2ljaW5nIGlzIGVuYWJsZWQuXG4gICAgICpcbiAgICAgKiBUaGVzZSBwYXJhbWV0ZXJzIGFsbG93IGZpbmUtPXR1bmVkIGNvbnRyb2wgb3ZlciB0aGUgaW5pdGlhbCBzdGF0ZSBhbmQgYmVoYXZpb3Igb2YgdGhlIFZvaWNpbmcgZmVhdHVyZSxcbiAgICAgKiBhbGxvd2luZyBiZXR0ZXIgY3VzdG9taXphdGlvbiBhbmQgYWNjZXNzaWJpbGl0eSBmb3IgdmFyaW91cyB1c2Vycy5cbiAgICAgKi9cbiAgICB2b2ljaW5nQ29sbGFwc2VUb29sYmFyOiB7XG4gICAgICB0eXBlOiAnZmxhZycsXG4gICAgICBwdWJsaWM6IHRydWVcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT25seSByZWxldmFudCB3aGVuIHRoZSBzaW0gc3VwcG9ydHMgdGhlIFZvaWNpbmcgZmVhdHVyZS4gSWYgdHJ1ZSwgdGhlIFZvaWNpbmcgdG9vbGJhciB3aWxsIGJlIGZ1bGx5IGhpZGRlblxuICAgICAqIGJ5IGRlZmF1bHQgd2hlbiBWb2ljaW5nIGlzIGVuYWJsZWQuXG4gICAgICpcbiAgICAgKiBUaGVzZSBwYXJhbWV0ZXJzIGFsbG93IGZpbmUtPXR1bmVkIGNvbnRyb2wgb3ZlciB0aGUgaW5pdGlhbCBzdGF0ZSBhbmQgYmVoYXZpb3Igb2YgdGhlIFZvaWNpbmcgZmVhdHVyZSxcbiAgICAgKiBhbGxvd2luZyBiZXR0ZXIgY3VzdG9taXphdGlvbiBhbmQgYWNjZXNzaWJpbGl0eSBmb3IgdmFyaW91cyB1c2Vycy5cbiAgICAgKi9cbiAgICB2b2ljaW5nUmVtb3ZlVG9vbGJhcjoge1xuICAgICAgdHlwZTogJ2ZsYWcnLFxuICAgICAgcHVibGljOiB0cnVlXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEVuYWJsZXMgV2ViR0wgcmVuZGVyaW5nLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzI4OS5cbiAgICAgKiBOb3RlIHRoYXQgc2ltdWxhdGlvbnMgY2FuIG9wdC1pbiB0byB3ZWJnbCB2aWEgbmV3IFNpbSh7d2ViZ2w6dHJ1ZX0pLCBidXQgdXNpbmcgP3dlYmdsPXRydWUgdGFrZXNcbiAgICAgKiBwcmVjZWRlbmNlLiAgSWYgbm8gd2ViZ2wgcXVlcnkgcGFyYW1ldGVyIGlzIHN1cHBsaWVkLCB0aGVuIHNpbXVsYXRpb25zIHRha2UgdGhlIFNpbSBvcHRpb24gdmFsdWUsIHdoaWNoXG4gICAgICogZGVmYXVsdHMgdG8gZmFsc2UuICBTZWUgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy82MjFcbiAgICAgKi9cbiAgICB3ZWJnbDoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdFZhbHVlOiB0cnVlXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluZGljYXRlcyB3aGV0aGVyIHlvdHRhIGFuYWx5dGljcyBhcmUgZW5hYmxlZC5cbiAgICAgKi9cbiAgICB5b3R0YToge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdFZhbHVlOiB0cnVlLFxuICAgICAgcHVibGljOiB0cnVlXG4gICAgfVxuICB9O1xuXG4gIHtcbiAgICAvLyBSZWFkIHF1ZXJ5IHBhcmFtZXRlcnNcbiAgICB3aW5kb3cucGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycyA9IFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRBbGwoIFFVRVJZX1BBUkFNRVRFUlNfU0NIRU1BICk7XG5cbiAgICAvLyBBcmUgd2UgcnVubmluZyBhIGJ1aWx0IGh0bWwgZmlsZT9cbiAgICB3aW5kb3cucGhldC5jaGlwcGVyLmlzUHJvZHVjdGlvbiA9ICQoICdtZXRhW25hbWU9cGhldC1zaW0tbGV2ZWxdJyApLmF0dHIoICdjb250ZW50JyApID09PSAncHJvZHVjdGlvbic7XG5cbiAgICAvLyBBcmUgd2UgcnVubmluZyBpbiBhbiBhcHA/XG4gICAgd2luZG93LnBoZXQuY2hpcHBlci5pc0FwcCA9IHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnNbICdwaGV0LWFwcCcgXSB8fCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzWyAncGhldC1hbmRyb2lkLWFwcCcgXTtcblxuICAgIC8qKlxuICAgICAqIEFuIElJRkUgaGVyZSBoZWxwcyBjYXB0dXJlIHZhcmlhYmxlcyBpbiBmaW5hbCBsb2dpYyBuZWVkZWQgaW4gdGhlIGdsb2JhbCwgcHJlbG9hZCBzY29wZSBmb3IgdGhlIHBoZXRzaW0gZW52aXJvbm1lbnQuXG4gICAgICpcbiAgICAgKiBFbmFibGVzIG9yIGRpc2FibGVzIGFzc2VydGlvbnMgaW4gY29tbW9uIGxpYnJhcmllcyB1c2luZyBxdWVyeSBwYXJhbWV0ZXJzLlxuICAgICAqIFRoZXJlIGFyZSB0d28gdHlwZXMgb2YgYXNzZXJ0aW9uczogYmFzaWMgYW5kIHNsb3cuIEVuYWJsaW5nIHNsb3cgYXNzZXJ0aW9ucyB3aWxsIGFkdmVyc2VseSBpbXBhY3QgcGVyZm9ybWFuY2UuXG4gICAgICogJ2VhJyBlbmFibGVzIGJhc2ljIGFzc2VydGlvbnMsICdlYWxsJyBlbmFibGVzIGJhc2ljIGFuZCBzbG93IGFzc2VydGlvbnMuXG4gICAgICogTXVzdCBiZSBydW4gYmVmb3JlIHRoZSBtYWluIG1vZHVsZXMsIGFuZCBhc3N1bWVzIHRoYXQgYXNzZXJ0LmpzIGFuZCBxdWVyeS1wYXJhbWV0ZXJzLmpzIGhhcyBiZWVuIHJ1bi5cbiAgICAgKi9cbiAgICAoIGZ1bmN0aW9uKCkge1xuXG4gICAgICAvLyBlbmFibGVzIGFsbCBhc3NlcnRpb25zIChiYXNpYyBhbmQgc2xvdylcbiAgICAgIGNvbnN0IGVuYWJsZUFsbEFzc2VydGlvbnMgPSAhcGhldC5jaGlwcGVyLmlzUHJvZHVjdGlvbiAmJiBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmVhbGw7XG5cbiAgICAgIC8vIGVuYWJsZXMgYmFzaWMgYXNzZXJ0aW9uc1xuICAgICAgY29uc3QgZW5hYmxlQmFzaWNBc3NlcnRpb25zID0gZW5hYmxlQWxsQXNzZXJ0aW9ucyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCAhcGhldC5jaGlwcGVyLmlzUHJvZHVjdGlvbiAmJiBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmVhICkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBoZXQuY2hpcHBlci5pc0RlYnVnQnVpbGQ7XG5cbiAgICAgIGlmICggZW5hYmxlQmFzaWNBc3NlcnRpb25zICkge1xuICAgICAgICB3aW5kb3cuYXNzZXJ0aW9ucy5lbmFibGVBc3NlcnQoKTtcbiAgICAgIH1cbiAgICAgIGlmICggZW5hYmxlQWxsQXNzZXJ0aW9ucyApIHtcbiAgICAgICAgd2luZG93LmFzc2VydGlvbnMuZW5hYmxlQXNzZXJ0U2xvdygpO1xuICAgICAgfVxuICAgIH0gKSgpO1xuICB9XG5cbiAgLy8gSW5pdGlhbGl6ZSBxdWVyeSBwYXJhbWV0ZXJzIGluIGEgbmV3IHNjb3BlLCBzZWUgZG9jcyBhYm92ZVxuICB7XG5cbiAgICB3aW5kb3cucGhldC5jaGlwcGVyLmNvbG9yUHJvZmlsZXMgPSBjb2xvclByb2ZpbGVzO1xuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGFueSB0eXBlIG9mIGZ1enppbmcgaXMgZW5hYmxlZC4gVGhpcyBpcyBhIGZ1bmN0aW9uIHNvIHRoYXQgdGhlIGFzc29jaWF0ZWQgcXVlcnkgcGFyYW1ldGVyc1xuICAgICAqIGNhbiBiZSBjaGFuZ2VkIGZyb20gdGhlIGNvbnNvbGUgd2hpbGUgdGhlIHNpbSBpcyBydW5uaW5nLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvNjc3LlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIHdpbmRvdy5waGV0LmNoaXBwZXIuaXNGdXp6RW5hYmxlZCA9ICgpID0+XG4gICAgICAoIHdpbmRvdy5waGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmZ1enogfHxcbiAgICAgICAgd2luZG93LnBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuZnV6ek1vdXNlIHx8XG4gICAgICAgIHdpbmRvdy5waGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmZ1enpUb3VjaCB8fFxuICAgICAgICB3aW5kb3cucGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5mdXp6Qm9hcmRcbiAgICAgICk7XG5cbiAgICAvLyBBZGQgYSBsb2cgZnVuY3Rpb24gdGhhdCBkaXNwbGF5cyBtZXNzYWdlcyB0byB0aGUgY29uc29sZS4gRXhhbXBsZXM6XG4gICAgLy8gcGhldC5sb2cgJiYgcGhldC5sb2coICdZb3Ugd2luIScgKTtcbiAgICAvLyBwaGV0LmxvZyAmJiBwaGV0LmxvZyggJ1lvdSBsb3NlJywgeyBjb2xvcjogJ3JlZCcgfSApO1xuICAgIGlmICggd2luZG93LnBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMubG9nICkge1xuICAgICAgd2luZG93LnBoZXQubG9nID0gZnVuY3Rpb24oIG1lc3NhZ2UsIG9wdGlvbnMgKSB7XG4gICAgICAgIG9wdGlvbnMgPSBfLmFzc2lnbkluKCB7XG4gICAgICAgICAgY29sb3I6ICcjMDA5OTAwJyAvLyBncmVlblxuICAgICAgICB9LCBvcHRpb25zICk7XG4gICAgICAgIGNvbnNvbGUubG9nKCBgJWMke21lc3NhZ2V9YCwgYGNvbG9yOiAke29wdGlvbnMuY29sb3J9YCApOyAvLyBncmVlblxuICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBuYW1lIG9mIGJyYW5kIHRvIHVzZSwgd2hpY2ggZGV0ZXJtaW5lcyB3aGljaCBsb2dvIHRvIHNob3cgaW4gdGhlIG5hdmJhciBhcyB3ZWxsIGFzIHdoYXQgb3B0aW9uc1xuICAgICAqIHRvIHNob3cgaW4gdGhlIFBoRVQgbWVudSBhbmQgd2hhdCB0ZXh0IHRvIHNob3cgaW4gdGhlIEFib3V0IGRpYWxvZy5cbiAgICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2JyYW5kL2lzc3Vlcy8xMVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgd2luZG93LnBoZXQuY2hpcHBlci5icmFuZCA9IHdpbmRvdy5waGV0LmNoaXBwZXIuYnJhbmQgfHwgcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5icmFuZCB8fCAnYWRhcHRlZC1mcm9tLXBoZXQnO1xuXG4gICAgLy8ge3N0cmluZ3xudWxsfSAtIFNlZSBkb2N1bWVudGF0aW9uIG9mIHN0cmluZ1Rlc3QgcXVlcnkgcGFyYW1ldGVyIC0gd2UgbmVlZCB0byBzdXBwb3J0IHRoaXMgZHVyaW5nIGJ1aWxkLCB3aGVyZVxuICAgIC8vICAgICAgICAgICAgICAgICB0aGVyZSBhcmVuJ3QgYW55IHF1ZXJ5IHBhcmFtZXRlcnMuXG4gICAgY29uc3Qgc3RyaW5nVGVzdCA9ICggdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5zdHJpbmdUZXN0ICkgP1xuICAgICAgICAgICAgICAgICAgICAgICBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLnN0cmluZ1Rlc3QgOlxuICAgICAgICAgICAgICAgICAgICAgICBudWxsO1xuXG4gICAgLyoqXG4gICAgICogTWFwcyBhbiBpbnB1dCBzdHJpbmcgdG8gYSBmaW5hbCBzdHJpbmcsIGFjY29tbW9kYXRpbmcgdHJpY2tzIGxpa2UgZG91YmxlU3RyaW5ncy5cbiAgICAgKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gbW9kaWZ5IGFsbCBzdHJpbmdzIGluIGEgc2ltIHdoZW4gdGhlIHN0cmluZ1Rlc3QgcXVlcnkgcGFyYW1ldGVyIGlzIHVzZWQuXG4gICAgICogVGhlIHN0cmluZ1Rlc3QgcXVlcnkgcGFyYW1ldGVyIGFuZCBpdHMgb3B0aW9ucyBhcmUgZG9jdW1lbnRlZCBpbiB0aGUgcXVlcnkgcGFyYW1ldGVyIGRvY3MgYWJvdmUuXG4gICAgICogSXQgaXMgdXNlZCBpbiBzdHJpbmcuanMgYW5kIHNpbS5odG1sLlxuICAgICAqIEBwYXJhbSBzdHJpbmcgLSB0aGUgc3RyaW5nIHRvIGJlIG1hcHBlZFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgd2luZG93LnBoZXQuY2hpcHBlci5tYXBTdHJpbmcgPSBmdW5jdGlvbiggc3RyaW5nICkge1xuICAgICAgY29uc3Qgc2NyaXB0ID0gJ3NjcmlwdCc7XG4gICAgICByZXR1cm4gc3RyaW5nVGVzdCA9PT0gbnVsbCA/IHN0cmluZyA6XG4gICAgICAgICAgICAgc3RyaW5nVGVzdCA9PT0gJ2RvdWJsZScgPyBgJHtzdHJpbmd9OiR7c3RyaW5nfWAgOlxuICAgICAgICAgICAgIHN0cmluZ1Rlc3QgPT09ICdsb25nJyA/ICcxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MCcgOlxuICAgICAgICAgICAgIHN0cmluZ1Rlc3QgPT09ICdydGwnID8gJ1xcdTIwMmJcXHUwNjJhXFx1MDYzM1xcdTA2MmEgKFxcdTA2MzJcXHUwNjI4XFx1MDYyN1xcdTA2NDYpXFx1MjAyYycgOlxuICAgICAgICAgICAgIHN0cmluZ1Rlc3QgPT09ICd4c3MnID8gYCR7c3RyaW5nfTxpbWcgc3JjPVwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBRUFBQUFCQ0FZQUFBQWZGY1NKQUFBQURVbEVRVlFJVzJOa1lHRDREd0FCQ1FFQnR4bU43d0FBQUFCSlJVNUVya0pnZ2c9PVwiIG9ubG9hZD1cIndpbmRvdy5sb2NhdGlvbi5ocmVmPWF0b2IoJ2FIUjBjSE02THk5M2QzY3VlVzkxZEhWaVpTNWpiMjB2ZDJGMFkyZy9kajFrVVhjMGR6bFhaMWhqVVE9PScpXCIgLz5gIDpcbiAgICAgICAgICAgICBzdHJpbmdUZXN0ID09PSAneHNzMicgPyBgJHtzdHJpbmd9PCR7c2NyaXB0fT5hbGVydCgnWFNTJyk8LyR7c2NyaXB0fT5gIDpcbiAgICAgICAgICAgICBzdHJpbmdUZXN0ID09PSAnbm9uZScgPyBzdHJpbmcgOlxuICAgICAgICAgICAgIHN0cmluZ1Rlc3QgPT09ICdkeW5hbWljJyA/IHN0cmluZyA6XG5cbiAgICAgICAgICAgICAgIC8vIEluIHRoZSBmYWxsYmFjayBjYXNlLCBzdXBwbHkgd2hhdGV2ZXIgc3RyaW5nIHdhcyBnaXZlbiBpbiB0aGUgcXVlcnkgcGFyYW1ldGVyIHZhbHVlXG4gICAgICAgICAgICAgc3RyaW5nVGVzdDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogR2l2ZW4gYSBsb2NhbGUgYmFzZWQgb24gdGhlIHN1cHBvcnRlZCBxdWVyeSBwYXJhbWV0ZXIgc2NoZW1hLCBtYXAgaXQgdG8gdGhlIDIgb3IgNSBjaGFyIGxvY2FsZSBjb2RlIChrZXkgaW4gbG9jYWxlRGF0YSkuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxvY2FsZVxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gYXNzZXJ0SW5zdGVhZE9mV2FybiAtIGFzc2VydCBpbmNvcnJlY3QgbG9jYWxlIGZvcm1hdCwgdnMgUVNNIHdhcm4gYnkgZGVmYXVsdFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcGhldC5jaGlwcGVyLnJlbWFwTG9jYWxlID0gKCBsb2NhbGUsIGFzc2VydEluc3RlYWRPZldhcm4gPSBmYWxzZSApID0+IHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGxvY2FsZSApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcGhldC5jaGlwcGVyLmxvY2FsZURhdGEgKTtcblxuICAgICAgY29uc3QgaW5wdXRWYWx1ZUxvY2FsZSA9IGxvY2FsZTtcblxuICAgICAgaWYgKCBsb2NhbGUubGVuZ3RoIDwgNSApIHtcbiAgICAgICAgbG9jYWxlID0gbG9jYWxlLnRvTG93ZXJDYXNlKCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgbG9jYWxlID0gbG9jYWxlLnJlcGxhY2UoIC8tLywgJ18nICk7XG5cbiAgICAgICAgY29uc3QgcGFydHMgPSBsb2NhbGUuc3BsaXQoICdfJyApO1xuICAgICAgICBpZiAoIHBhcnRzLmxlbmd0aCA9PT0gMiApIHtcbiAgICAgICAgICBsb2NhbGUgPSBwYXJ0c1sgMCBdLnRvTG93ZXJDYXNlKCkgKyAnXycgKyBwYXJ0c1sgMSBdLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCBsb2NhbGUubGVuZ3RoID09PSAzICkge1xuICAgICAgICBmb3IgKCBjb25zdCBjYW5kaWRhdGVMb2NhbGUgb2YgT2JqZWN0LmtleXMoIHBoZXQuY2hpcHBlci5sb2NhbGVEYXRhICkgKSB7XG4gICAgICAgICAgaWYgKCBwaGV0LmNoaXBwZXIubG9jYWxlRGF0YVsgY2FuZGlkYXRlTG9jYWxlIF0ubG9jYWxlMyA9PT0gbG9jYWxlICkge1xuICAgICAgICAgICAgbG9jYWxlID0gY2FuZGlkYXRlTG9jYWxlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFBlcm1pc3NpdmUgcGF0dGVybnMgZm9yIGxvY2FsZSBxdWVyeSBwYXJhbWV0ZXIgcGF0dGVybnMuXG4gICAgICAvLyBXZSBkb24ndCB3YW50IHRvIHNob3cgYSBxdWVyeSBwYXJhbWV0ZXIgd2FybmluZyBpZiBpdCBtYXRjaGVzIHRoZXNlIHBhdHRlcm5zLCBFVkVOIGlmIGl0IGlzIG5vdCBhIHZhbGlkIGxvY2FsZVxuICAgICAgLy8gaW4gbG9jYWxlRGF0YSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xYS9pc3N1ZXMvMTA4NSNpc3N1ZWNvbW1lbnQtMjExMTEwNTIzNS5cbiAgICAgIGNvbnN0IHBhaXJSZWdleCA9IC9eW2EtekEtWl17Mn0kLztcbiAgICAgIGNvbnN0IHRyaXBsZVJlZ2V4ID0gL15bYS16QS1aXXszfSQvO1xuICAgICAgY29uc3QgZG91YmxlUGFpclJlZ2V4ID0gL15bYS16QS1aXXsyfVtfLV1bYS16QS1aXXsyfSQvO1xuXG4gICAgICAvLyBTYW5pdHkgY2hlY2tzIGZvciB2ZXJpZnlpbmcgbG9jYWxlRGF0YSAoc28gaG9wZWZ1bGx5IHdlIGRvbid0IGNvbW1pdCBiYWQgZGF0YSB0byBsb2NhbGVEYXRhKS5cbiAgICAgIGlmICggYXNzZXJ0ICkge1xuICAgICAgICBmb3IgKCBjb25zdCBsb2NhbGUgb2YgT2JqZWN0LmtleXMoIHBoZXQuY2hpcHBlci5sb2NhbGVEYXRhICkgKSB7XG4gICAgICAgICAgLy8gQ2hlY2sgdGhlIGxvY2FsZSBpdHNlbGZcbiAgICAgICAgICBhc3NlcnQoIHBhaXJSZWdleC50ZXN0KCBsb2NhbGUgKSB8fCBkb3VibGVQYWlyUmVnZXgudGVzdCggbG9jYWxlICksIGBJbnZhbGlkIGxvY2FsZSBmb3JtYXQ6ICR7bG9jYWxlfWAgKTtcblxuICAgICAgICAgIC8vIENoZWNrIGxvY2FsZTMgKGlmIGl0IGV4aXN0cylcbiAgICAgICAgICBpZiAoIHBoZXQuY2hpcHBlci5sb2NhbGVEYXRhWyBsb2NhbGUgXS5sb2NhbGUzICkge1xuICAgICAgICAgICAgYXNzZXJ0KCB0cmlwbGVSZWdleC50ZXN0KCBwaGV0LmNoaXBwZXIubG9jYWxlRGF0YVsgbG9jYWxlIF0ubG9jYWxlMyApLCBgSW52YWxpZCBsb2NhbGUzIGZvcm1hdDogJHtwaGV0LmNoaXBwZXIubG9jYWxlRGF0YVsgbG9jYWxlIF0ubG9jYWxlM31gICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ2hlY2sgZmFsbGJhY2tMb2NhbGVzIChpZiBpdCBleGlzdHMpXG4gICAgICAgICAgaWYgKCBwaGV0LmNoaXBwZXIubG9jYWxlRGF0YVsgbG9jYWxlIF0uZmFsbGJhY2tMb2NhbGVzICkge1xuICAgICAgICAgICAgZm9yICggY29uc3QgZmFsbGJhY2tMb2NhbGUgb2YgcGhldC5jaGlwcGVyLmxvY2FsZURhdGFbIGxvY2FsZSBdLmZhbGxiYWNrTG9jYWxlcyApIHtcbiAgICAgICAgICAgICAgYXNzZXJ0KCBwaGV0LmNoaXBwZXIubG9jYWxlRGF0YVsgZmFsbGJhY2tMb2NhbGUgXSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoICFwaGV0LmNoaXBwZXIubG9jYWxlRGF0YVsgbG9jYWxlIF0gKSB7XG4gICAgICAgIGNvbnN0IGJhZExvY2FsZSA9IGlucHV0VmFsdWVMb2NhbGU7XG5cbiAgICAgICAgaWYgKCAhcGFpclJlZ2V4LnRlc3QoIGJhZExvY2FsZSApICYmICF0cmlwbGVSZWdleC50ZXN0KCBiYWRMb2NhbGUgKSAmJiAhZG91YmxlUGFpclJlZ2V4LnRlc3QoIGJhZExvY2FsZSApICkge1xuICAgICAgICAgIGlmICggYXNzZXJ0SW5zdGVhZE9mV2FybiApIHtcbiAgICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnaW52YWxpZCBsb2NhbGU6JywgaW5wdXRWYWx1ZUxvY2FsZSApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRoaXMgbWF5IG9jY3VyIHR3aWNlIGluIHVuYnVpbHQgbW9kZSB3aGVuIGRvbmUgbG9hZGluZyB1bmJ1aWx0IHN0cmluZ3MgYW5kIHdoZW4gcnVubmluZyB0aGlzIGZpbGUuXG4gICAgICAgICAgICBRdWVyeVN0cmluZ01hY2hpbmUuYWRkV2FybmluZyggJ2xvY2FsZScsIGlucHV0VmFsdWVMb2NhbGUsIGBJbnZhbGlkIGxvY2FsZSBmb3JtYXQgcmVjZWl2ZWQ6ICR7YmFkTG9jYWxlfS4gP2xvY2FsZSBxdWVyeSBwYXJhbWV0ZXIgYWNjZXB0cyB0aGUgZm9sbG93aW5nIGZvcm1hdHM6IFwieHhcIiBmb3IgSVNPLTYzOS0xLCBcInh4X1hYXCIgZm9yIElTTy02MzktMSBhbmQgYSAyLWxldHRlciBjb3VudHJ5IGNvZGUsIFwieHh4XCIgZm9yIElTTy02MzktMmAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsb2NhbGUgPSBGQUxMQkFDS19MT0NBTEU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBsb2NhbGU7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgXCJtb3N0XCIgdmFsaWQgbG9jYWxlLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vaXNzdWVzLzE4ODJcbiAgICAgKiAgQXMgcGFydCBvZiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzk2MywgdGhpcyBhcyBjaGFuZ2VkLiBXZSBjaGVjayBhIHNwZWNpZmljIGZhbGxiYWNrIG9yZGVyIGJhc2VkXG4gICAgICogIG9uIHRoZSBsb2NhbGUuIEluIGdlbmVyYWwsIGl0IHdpbGwgdXN1YWxseSB0cnkgYSBwcmVmaXggZm9yIHh4X1hYIHN0eWxlIGxvY2FsZXMsIGUuZy4gJ2FyX1NBJyB3b3VsZCB0cnkgJ2FyX1NBJywgJ2FyJywgJ2VuJ1xuICAgICAqICBOT1RFOiBJZiB0aGUgbG9jYWxlIGRvZXNuJ3QgYWN0dWFsbHkgaGF2ZSBhbnkgc3RyaW5nczogVEhBVCBJUyBPSyEgT3VyIHN0cmluZyBzeXN0ZW0gd2lsbCB1c2UgdGhlIGFwcHJvcHJpYXRlXG4gICAgICogIGZhbGxiYWNrIHN0cmluZ3MuXG4gICAgICogQHBhcmFtIGxvY2FsZVxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIHBoZXQuY2hpcHBlci5nZXRWYWxpZFJ1bnRpbWVMb2NhbGUgPSBsb2NhbGUgPT4ge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbG9jYWxlICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwaGV0LmNoaXBwZXIubG9jYWxlRGF0YSApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcGhldC5jaGlwcGVyLnN0cmluZ3MgKTtcblxuICAgICAgY29uc3QgcG9zc2libGVMb2NhbGVzID0gW1xuICAgICAgICBsb2NhbGUsXG4gICAgICAgIC4uLiggcGhldC5jaGlwcGVyLmxvY2FsZURhdGFbIGxvY2FsZSBdPy5mYWxsYmFja0xvY2FsZXMgPz8gW10gKSxcbiAgICAgICAgRkFMTEJBQ0tfTE9DQUxFXG4gICAgICBdO1xuXG4gICAgICBjb25zdCBhdmFpbGFibGVMb2NhbGUgPSBwb3NzaWJsZUxvY2FsZXMuZmluZCggcG9zc2libGVMb2NhbGUgPT4gISFwaGV0LmNoaXBwZXIuc3RyaW5nc1sgcG9zc2libGVMb2NhbGUgXSApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggYXZhaWxhYmxlTG9jYWxlLCAnbm8gZmFsbGJhY2sgZm91bmQgZm9yICcsIGxvY2FsZSApO1xuICAgICAgcmV0dXJuIGF2YWlsYWJsZUxvY2FsZTtcbiAgICB9O1xuXG4gICAgLy8gV2Ugd2lsbCBuZWVkIHRvIGNoZWNrIGZvciBsb2NhbGUgdmFsaWRpdHkgKG9uY2Ugd2UgaGF2ZSBsb2NhbGVEYXRhIGxvYWRlZCwgaWYgcnVubmluZyB1bmJ1aWx0KSwgYW5kIHBvdGVudGlhbGx5XG4gICAgLy8gZWl0aGVyIGZhbGwgYmFjayB0byBgZW5gLCBvciByZW1hcCBmcm9tIDMtY2hhcmFjdGVyIGxvY2FsZXMgdG8gb3VyIGxvY2FsZSBrZXlzLiBUaGlzIG92ZXJ3cml0ZXMgcGhldC5jaGlwcGVyLmxvY2FsZS5cbiAgICAvLyBVc2VkIHdoZW4gc2V0dGluZyBsb2NhbGUgdGhyb3VnaCBKT0lTVC9sb2NhbGVQcm9wZXJ0eSBhbHNvLiBEZWZhdWx0IHRvIHRoZSBxdWVyeSBwYXJhbWV0ZXIgaW5zdGVhZCBvZlxuICAgIC8vIGNoaXBwZXIubG9jYWxlIGJlY2F1c2Ugd2Ugb3ZlcndyaXRlIHRoYXQgdmFsdWUsIGFuZCBtYXkgcnVuIHRoaXMgZnVuY3Rpb24gbXVsdGlwbGUgdGltZXMgZHVyaW5nIHRoZSBzdGFydHVwXG4gICAgLy8gc2VxdWVuY2UgKGluIHVuYnVpbHQgbW9kZSkuXG4gICAgcGhldC5jaGlwcGVyLmNoZWNrQW5kUmVtYXBMb2NhbGUgPSAoIGxvY2FsZSA9IHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMubG9jYWxlLCBhc3NlcnRJbnN0ZWFkT2ZXYXJuID0gZmFsc2UgKSA9PiB7XG5cbiAgICAgIC8vIFdlIG5lZWQgYm90aCB0byBwcm9jZWVkLiBQcm92aWRlZCBhcyBhIGdsb2JhbCwgc28gd2UgY2FuIGNhbGwgaXQgZnJvbSBsb2FkLXVuYnVpbHQtc3RyaW5nc1xuICAgICAgLy8gKElGIGluaXRpYWxpemUtZ2xvYmFscyBsb2FkcyBmaXJzdCkuIEFsc28gaGFuZGxlIHRoZSB1bmJ1aWx0IG1vZGUgY2FzZSB3aGVyZSB3ZSBoYXZlIHBoZXQuY2hpcHBlci5zdHJpbmdzXG4gICAgICAvLyBleGlzdHMgYnV0IG5vIHRyYW5zbGF0aW9ucyBoYXZlIGxvYWRlZCB5ZXQuXG4gICAgICBpZiAoICFwaGV0LmNoaXBwZXIubG9jYWxlRGF0YSB8fCAhcGhldC5jaGlwcGVyLnN0cmluZ3M/Lmhhc093blByb3BlcnR5KCBGQUxMQkFDS19MT0NBTEUgKSB8fCAhbG9jYWxlICkge1xuICAgICAgICByZXR1cm4gbG9jYWxlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByZW1hcHBlZExvY2FsZSA9IHBoZXQuY2hpcHBlci5yZW1hcExvY2FsZSggbG9jYWxlLCBhc3NlcnRJbnN0ZWFkT2ZXYXJuICk7XG4gICAgICBjb25zdCBmaW5hbExvY2FsZSA9IHBoZXQuY2hpcHBlci5nZXRWYWxpZFJ1bnRpbWVMb2NhbGUoIHJlbWFwcGVkTG9jYWxlICk7XG5cbiAgICAgIC8vIEV4cG9ydCB0aGlzIGZvciBhbmFseXRpY3MsIHNlZSBnb2dvbGUtYW5hbHl0aWNzLmpzXG4gICAgICAvLyAoWW90dGEgYW5kIEdBIHdpbGwgd2FudCB0aGUgbm9uLWZhbGxiYWNrIGxvY2FsZSBmb3Igbm93LCBmb3IgY29uc2lzdGVuY3kpXG4gICAgICBwaGV0LmNoaXBwZXIucmVtYXBwZWRMb2NhbGUgPSByZW1hcHBlZExvY2FsZTtcbiAgICAgIHBoZXQuY2hpcHBlci5sb2NhbGUgPSBmaW5hbExvY2FsZTsgLy8gTk9URTogdGhpcyB3aWxsIGNoYW5nZSB3aXRoIGV2ZXJ5IHNldHRpbmcgb2YgSk9JU1QvbG9jYWxlUHJvcGVydHlcbiAgICAgIHJldHVybiBmaW5hbExvY2FsZTtcbiAgICB9O1xuXG4gICAgLy8gV2hlbiBwcm92aWRpbmcgYD9sb2NhbGU9YCwgdGhlIHZhbHVlIGlzIG51bGwsIHJ1ZGUuXG4gICAgaWYgKCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmxvY2FsZSA9PT0gbnVsbCApIHtcbiAgICAgIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMubG9jYWxlID0gRkFMTEJBQ0tfTE9DQUxFO1xuICAgIH1cblxuICAgIC8vIFF1ZXJ5IHBhcmFtZXRlciBkZWZhdWx0IHdpbGwgcGljayB1cCB0aGUgcGhldC5jaGlwcGVyLmxvY2FsZSBkZWZhdWx0IGZyb20gdGhlIGJ1aWx0IHNpbSwgaWYgaXQgZXhpc3RzLlxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMubG9jYWxlLCAnc2hvdWxkIGV4aXN0IHdpdGggYSBkZWZhdWx0JyApO1xuXG4gICAgLy8gTk9URTogSWYgd2UgYXJlIGxvYWRpbmcgaW4gdW5idWlsdCBtb2RlLCB0aGlzIG1heSBleGVjdXRlIEJFRk9SRSB3ZSBoYXZlIGxvYWRlZCBsb2NhbGVEYXRhLiBXZSBoYXZlIGEgc2ltaWxhclxuICAgIC8vIHJlbWFwcGluZyBpbiBsb2FkLXVuYnVpbHQtc3RyaW5ncyB3aGVuIHRoaXMgaGFwcGVucy5cbiAgICBwaGV0LmNoaXBwZXIuY2hlY2tBbmRSZW1hcExvY2FsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFV0aWxpdHkgZnVuY3Rpb24gdG8gcGF1c2Ugc3luY2hyb25vdXNseSBmb3IgdGhlIGdpdmVuIG51bWJlciBvZiBtaWxsaXNlY29uZHMuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtaWxsaXMgLSBhbW91bnQgb2YgdGltZSB0byBwYXVzZSBzeW5jaHJvbm91c2x5XG4gICAqL1xuICBmdW5jdGlvbiBzbGVlcCggbWlsbGlzICkge1xuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgIGxldCBjdXJEYXRlO1xuICAgIGRvIHtcbiAgICAgIGN1ckRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgIH0gd2hpbGUgKCBjdXJEYXRlIC0gZGF0ZSA8IG1pbGxpcyApO1xuICB9XG5cbiAgLypcbiAgICogVGhlc2UgYXJlIHVzZWQgdG8gbWFrZSBzdXJlIG91ciBzaW1zIHN0aWxsIGJlaGF2ZSBwcm9wZXJseSB3aXRoIGFuIGFydGlmaWNpYWxseSBoaWdoZXIgbG9hZCAoc28gd2UgY2FuIHRlc3Qgd2hhdCBoYXBwZW5zXG4gICAqIGF0IDMwZnBzLCA1ZnBzLCBldGMpLiBUaGVyZSB0ZW5kIHRvIGJlIGJ1Z3MgdGhhdCBvbmx5IGhhcHBlbiBvbiBsZXNzLXBvd2VyZnVsIGRldmljZXMsIGFuZCB0aGVzZSBmdW5jdGlvbnMgZmFjaWxpdGF0ZVxuICAgKiB0ZXN0aW5nIGEgc2ltIGZvciByb2J1c3RuZXNzLCBhbmQgYWxsb3dpbmcgb3RoZXJzIHRvIHJlcHJvZHVjZSBzbG93LWJlaGF2aW9yIGJ1Z3MuXG4gICAqL1xuICB3aW5kb3cucGhldC5jaGlwcGVyLm1ha2VFdmVyeXRoaW5nU2xvdyA9IGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5zZXRJbnRlcnZhbCggKCkgPT4geyBzbGVlcCggNjQgKTsgfSwgMTYgKTtcbiAgfTtcbiAgd2luZG93LnBoZXQuY2hpcHBlci5tYWtlUmFuZG9tU2xvd25lc3MgPSBmdW5jdGlvbigpIHtcbiAgICB3aW5kb3cuc2V0SW50ZXJ2YWwoICgpID0+IHsgc2xlZXAoIE1hdGguY2VpbCggMTAwICsgTWF0aC5yYW5kb20oKSAqIDIwMCApICk7IH0sIE1hdGguY2VpbCggMTAwICsgTWF0aC5yYW5kb20oKSAqIDIwMCApICk7XG4gIH07XG5cbiAgKCBmdW5jdGlvbigpIHtcblxuICAgIC8qKlxuICAgICAqIFNlbmRzIGEgbWVzc2FnZSB0byBhIGNvbnRpbnVvdXMgdGVzdGluZyBjb250YWluZXIuXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSAtIFNwZWNpZmljIG9iamVjdCByZXN1bHRzIHNlbnQgdG8gQ1QuXG4gICAgICovXG4gICAgd2luZG93LnBoZXQuY2hpcHBlci5yZXBvcnRDb250aW51b3VzVGVzdFJlc3VsdCA9IG9wdGlvbnMgPT4ge1xuICAgICAgd2luZG93LnBhcmVudCAmJiB3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKCBKU09OLnN0cmluZ2lmeSggXy5hc3NpZ25Jbigge1xuICAgICAgICBjb250aW51b3VzVGVzdDogSlNPTi5wYXJzZSggcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5jb250aW51b3VzVGVzdCApLFxuICAgICAgICB1cmw6IHdpbmRvdy5sb2NhdGlvbi5ocmVmXG4gICAgICB9LCBvcHRpb25zICkgKSwgJyonICk7XG4gICAgfTtcblxuICAgIGlmICggcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5jb250aW51b3VzVGVzdCApIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnZXJyb3InLCBhID0+IHtcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSAnJztcbiAgICAgICAgbGV0IHN0YWNrID0gJyc7XG4gICAgICAgIGlmICggYSAmJiBhLm1lc3NhZ2UgKSB7XG4gICAgICAgICAgbWVzc2FnZSA9IGEubWVzc2FnZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIGEgJiYgYS5lcnJvciAmJiBhLmVycm9yLnN0YWNrICkge1xuICAgICAgICAgIHN0YWNrID0gYS5lcnJvci5zdGFjaztcbiAgICAgICAgfVxuICAgICAgICBwaGV0LmNoaXBwZXIucmVwb3J0Q29udGludW91c1Rlc3RSZXN1bHQoIHtcbiAgICAgICAgICB0eXBlOiAnY29udGludW91cy10ZXN0LWVycm9yJyxcbiAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgICAgIHN0YWNrOiBzdGFja1xuICAgICAgICB9ICk7XG4gICAgICB9ICk7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2JlZm9yZXVubG9hZCcsIGUgPT4ge1xuICAgICAgICBwaGV0LmNoaXBwZXIucmVwb3J0Q29udGludW91c1Rlc3RSZXN1bHQoIHtcbiAgICAgICAgICB0eXBlOiAnY29udGludW91cy10ZXN0LXVubG9hZCdcbiAgICAgICAgfSApO1xuICAgICAgfSApO1xuICAgICAgLy8gd2luZG93Lm9wZW4gc3R1Yi4gb3RoZXJ3aXNlIHdlIGdldCB0b25zIG9mIFwiUmVwb3J0IFByb2JsZW0uLi5cIiBwb3B1cHMgdGhhdCBzdGFsbFxuICAgICAgd2luZG93Lm9wZW4gPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZm9jdXM6ICgpID0+IHt9LFxuICAgICAgICAgIGJsdXI6ICgpID0+IHt9XG4gICAgICAgIH07XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIENvbW11bmljYXRlIHNpbSBlcnJvcnMgdG8gQ1Qgb3Igb3RoZXIgbGlzdGVuaW5nIHBhcmVudCBmcmFtZXNcbiAgICBpZiAoIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMucG9zdE1lc3NhZ2VPbkVycm9yICkge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdlcnJvcicsIGEgPT4ge1xuICAgICAgICBsZXQgbWVzc2FnZSA9ICcnO1xuICAgICAgICBsZXQgc3RhY2sgPSAnJztcbiAgICAgICAgaWYgKCBhICYmIGEubWVzc2FnZSApIHtcbiAgICAgICAgICBtZXNzYWdlID0gYS5tZXNzYWdlO1xuICAgICAgICB9XG4gICAgICAgIGlmICggYSAmJiBhLmVycm9yICYmIGEuZXJyb3Iuc3RhY2sgKSB7XG4gICAgICAgICAgc3RhY2sgPSBhLmVycm9yLnN0YWNrO1xuICAgICAgICB9XG4gICAgICAgIHdpbmRvdy5wYXJlbnQgJiYgd2luZG93LnBhcmVudC5wb3N0TWVzc2FnZSggSlNPTi5zdHJpbmdpZnkoIHtcbiAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWYsXG4gICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgICAgICBzdGFjazogc3RhY2tcbiAgICAgICAgfSApLCAnKicgKTtcbiAgICAgIH0gKTtcbiAgICB9XG5cbiAgICBpZiAoIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMucG9zdE1lc3NhZ2VPbkJlZm9yZVVubG9hZCApIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnYmVmb3JldW5sb2FkJywgZSA9PiB7XG4gICAgICAgIHdpbmRvdy5wYXJlbnQgJiYgd2luZG93LnBhcmVudC5wb3N0TWVzc2FnZSggSlNPTi5zdHJpbmdpZnkoIHtcbiAgICAgICAgICB0eXBlOiAnYmVmb3JlVW5sb2FkJ1xuICAgICAgICB9ICksICcqJyApO1xuICAgICAgfSApO1xuICAgIH1cbiAgfSgpICk7XG5cbiAgKCAoKSA9PiB7XG4gICAgLy8gVmFsaWRhdGlvbiBsb2dpYyBvbiB0aGUgc2ltRmVhdHVyZXMgc2VjdGlvbiBvZiB0aGUgcGFja2FnZUpTT04sIG1hbnkgb2Ygd2hpY2ggYXJlIHVzZWQgaW4gc2ltcywgYW5kIHNob3VsZCBiZVxuICAgIC8vIGRlZmluZWQgY29ycmVjdGx5IGZvciB0aGUgc2ltIHRvIHJ1bi5cblxuICAgIGNvbnN0IHNpbUZlYXR1cmVzU2NoZW1hID0ge1xuICAgICAgc3VwcG9ydHNJbnRlcmFjdGl2ZURlc2NyaXB0aW9uOiB7IHR5cGU6ICdib29sZWFuJyB9LFxuICAgICAgc3VwcG9ydHNWb2ljaW5nOiB7IHR5cGU6ICdib29sZWFuJyB9LFxuICAgICAgc3VwcG9ydHNJbnRlcmFjdGl2ZUhpZ2hsaWdodHM6IHsgdHlwZTogJ2Jvb2xlYW4nIH0sXG4gICAgICBzdXBwb3J0c0Rlc2NyaXB0aW9uUGx1Z2luOiB7IHR5cGU6ICdib29sZWFuJyB9LFxuICAgICAgc3VwcG9ydHNTb3VuZDogeyB0eXBlOiAnYm9vbGVhbicgfSxcbiAgICAgIHN1cHBvcnRzRXh0cmFTb3VuZDogeyB0eXBlOiAnYm9vbGVhbicgfSxcbiAgICAgIHN1cHBvcnRzRHluYW1pY0xvY2FsZTogeyB0eXBlOiAnYm9vbGVhbicgfSxcbiAgICAgIGNvbG9yUHJvZmlsZXM6IHsgdHlwZTogJ2FycmF5JyB9LFxuICAgICAgc3VwcG9ydGVkUmVnaW9uc0FuZEN1bHR1cmVzOiB7IHR5cGU6ICdhcnJheScgfSxcbiAgICAgIGRlZmF1bHRSZWdpb25BbmRDdWx0dXJlOiB7IHR5cGU6ICdzdHJpbmcnIH1cbiAgICB9O1xuXG4gICAgT2JqZWN0LmtleXMoIHNpbUZlYXR1cmVzU2NoZW1hICkuZm9yRWFjaCggc2NoZW1hS2V5ID0+IHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFwYWNrYWdlUGhldC5oYXNPd25Qcm9wZXJ0eSggc2NoZW1hS2V5ICksXG4gICAgICAgIGAke3NjaGVtYUtleX0gaXMgYSBzaW0gZmVhdHVyZSBhbmQgc2hvdWxkIGJlIGluIFwic2ltRmVhdHVyZXNcIiBpbiB0aGUgcGFja2FnZS5qc29uYCApO1xuICAgIH0gKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFwYWNrYWdlT2JqZWN0Lmhhc093blByb3BlcnR5KCAnc2ltRmVhdHVyZXMnICksICdzaW1GZWF0dXJlcyBtdXN0IGJlIG5lc3RlZCB1bmRlciBcXCdwaGV0XFwnJyApO1xuICAgIGlmICggcGFja2FnZVBoZXQuaGFzT3duUHJvcGVydHkoICdzaW1GZWF0dXJlcycgKSApIHtcbiAgICAgIGNvbnN0IHNpbUZlYXR1cmVzID0gcGFja2FnZVBoZXQuc2ltRmVhdHVyZXM7XG4gICAgICBPYmplY3Qua2V5cyggc2ltRmVhdHVyZXMgKS5mb3JFYWNoKCBzaW1GZWF0dXJlTmFtZSA9PiB7XG4gICAgICAgIGNvbnN0IHNpbUZlYXR1cmVWYWx1ZSA9IHNpbUZlYXR1cmVzWyBzaW1GZWF0dXJlTmFtZSBdO1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzaW1GZWF0dXJlc1NjaGVtYS5oYXNPd25Qcm9wZXJ0eSggc2ltRmVhdHVyZU5hbWUgKSwgYHVuc3VwcG9ydGVkIHNpbSBmZWF0dXJlOiAke3NpbUZlYXR1cmVOYW1lfWAgKTtcbiAgICAgICAgaWYgKCBzaW1GZWF0dXJlc1NjaGVtYVsgc2ltRmVhdHVyZU5hbWUgXSApIHtcblxuICAgICAgICAgIGlmICggc2ltRmVhdHVyZXNTY2hlbWFbIHNpbUZlYXR1cmVOYW1lLnR5cGUgXSA9PT0gJ2Jvb2xlYW4nICkge1xuICAgICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHNpbUZlYXR1cmVWYWx1ZSA9PT0gJ2Jvb2xlYW4nLCBgYm9vbGVhbiB2YWx1ZSBleHBlY3RlZCBmb3IgJHtzaW1GZWF0dXJlTmFtZX1gICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKCBzaW1GZWF0dXJlc1NjaGVtYVsgc2ltRmVhdHVyZU5hbWUudHlwZSBdID09PSAnYXJyYXknICkge1xuICAgICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggc2ltRmVhdHVyZVZhbHVlICksIGBhcnJheSB2YWx1ZSBleHBlY3RlZCBmb3IgJHtzaW1GZWF0dXJlTmFtZX1gICk7XG5cbiAgICAgICAgICAgIC8vIEF0IHRoaXMgdGltZSwgYWxsIGFycmF5cyBhcmUgYXNzdW1lZCB0byBvbmx5IHN1cHBvcnQgc3RyaW5nc1xuICAgICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggXy5ldmVyeSggc2ltRmVhdHVyZVZhbHVlLCB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICksIGBzdHJpbmcgZW50cnkgZXhwZWN0ZWQgZm9yICR7c2ltRmVhdHVyZU5hbWV9YCApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH1cbiAgfSApKCk7XG59KCkgKTsiXSwibmFtZXMiOlsicGFja2FnZVBoZXQiLCJhc3NlcnQiLCJ3aW5kb3ciLCJRdWVyeVN0cmluZ01hY2hpbmUiLCJwaGV0IiwicHJlbG9hZHMiLCJjaGlwcGVyIiwicGFja2FnZU9iamVjdCIsImFsbG93TG9jYWxlU3dpdGNoaW5nIiwicGFja2FnZVNpbUZlYXR1cmVzIiwic2ltRmVhdHVyZXMiLCJERUZBVUxUX0NPTE9SX1BST0ZJTEUiLCJGQUxMQkFDS19MT0NBTEUiLCJjb2xvclByb2ZpbGVzIiwiUVVFUllfUEFSQU1FVEVSU19TQ0hFTUEiLCJhbGxvd0xpbmtzIiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsInB1YmxpYyIsImF1ZGlvIiwidmFsaWRWYWx1ZXMiLCJiaW5kZXIiLCJicmFuZCIsImJ1aWxkQ29tcGF0aWJsZSIsImNvbnRpbnVvdXNUZXN0IiwiY29sb3JQcm9maWxlIiwibGF1bmNoQ291bnRlciIsImRlYnVnZ2VyIiwiZGVwcmVjYXRpb25XYXJuaW5ncyIsImRldiIsImRpc2FibGVNb2RhbHMiLCJlYSIsImVhbGwiLCJleHRyYVNvdW5kSW5pdGlhbGx5RW5hYmxlZCIsImZvcmNlU1ZHUmVmcmVzaCIsImZ1enoiLCJmdXp6Qm9hcmQiLCJmdXp6TW91c2UiLCJmdXp6UG9pbnRlcnMiLCJmdXp6VG91Y2giLCJmdXp6UmF0ZSIsImlzVmFsaWRWYWx1ZSIsInZhbHVlIiwiZ2E0IiwiZ2FtZVVwIiwiZ2FtZVVwVGVzdEhhcm5lc3MiLCJnYW1lVXBMb2dnaW5nIiwiZ2FQYWdlIiwiaG9tZVNjcmVlbiIsImluaXRpYWxTY3JlZW4iLCJsZWdlbmRzT2ZMZWFybmluZyIsImxpc3RlbmVyTGltaXQiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsImxvY2FsZSIsInN1cHBvcnRzRHluYW1pY0xvY2FsZSIsImhhc093blByb3BlcnR5IiwibG9nIiwibWVtb3J5TGltaXQiLCJtb2JpbGVBMTF5VGVzdCIsInBsYXliYWNrTW9kZSIsInBvc3RNZXNzYWdlT25CZWZvcmVVbmxvYWQiLCJwb3N0TWVzc2FnZU9uRXJyb3IiLCJwb3N0TWVzc2FnZU9uTG9hZCIsInBvc3RNZXNzYWdlT25SZWFkeSIsInByZXZlbnRGdWxsU2NyZWVuIiwicHJvZmlsZXIiLCJxckNvZGUiLCJyYW5kb21TZWVkIiwiTWF0aCIsInJhbmRvbSIsInJlZ2lvbkFuZEN1bHR1cmUiLCJkZWZhdWx0UmVnaW9uQW5kQ3VsdHVyZSIsInN1cHBvcnRlZFJlZ2lvbnNBbmRDdWx0dXJlcyIsInJvb3RSZW5kZXJlciIsInNjZW5lcnlMb2ciLCJlbGVtZW50U2NoZW1hIiwic2NlbmVyeVN0cmluZ0xvZyIsInNjcmVlbnMiLCJpc0ludGVnZXIiLCJsZW5ndGgiLCJfIiwidW5pcSIsInNob3dBbnN3ZXJzIiwicHJpdmF0ZSIsInNob3dDYW52YXNOb2RlQm91bmRzIiwic2hvd0ZpdHRlZEJsb2NrQm91bmRzIiwic2hvd0hpdEFyZWFzIiwic2hvd1BvaW50ZXJBcmVhcyIsInNob3dQb2ludGVycyIsInNob3dWaXNpYmxlQm91bmRzIiwibGlzdGVuZXJPcmRlciIsInJlZ2V4IiwibWF0Y2giLCJzcGVlY2hTeW50aGVzaXNGcm9tUGFyZW50Iiwic3BlZWQiLCJzdHJpbmdUZXN0Iiwia2V5Ym9hcmRMb2NhbGVTd2l0Y2hlciIsInN1cHBvcnRzRGVzY3JpcHRpb25QbHVnaW4iLCJzdXBwb3J0c0ludGVyYWN0aXZlRGVzY3JpcHRpb24iLCJzdXBwb3J0c0ludGVyYWN0aXZlSGlnaGxpZ2h0cyIsImludGVyYWN0aXZlSGlnaGxpZ2h0c0luaXRpYWxseUVuYWJsZWQiLCJzdXBwb3J0c0dlc3R1cmVDb250cm9sIiwic3VwcG9ydHNWb2ljaW5nIiwic3dhc2hUZXh0Iiwic3dhc2hUZXh0Q29sb3IiLCJ2b2ljaW5nSW5pdGlhbGx5RW5hYmxlZCIsInByZWZlcmVuY2VzU3RvcmFnZSIsInByaW50Vm9pY2luZ1Jlc3BvbnNlcyIsInN1cHBvcnRzUGFuQW5kWm9vbSIsInN1cHBvcnRzU291bmQiLCJzdXBwb3J0c0V4dHJhU291bmQiLCJ2aWJyYXRpb25QYXJhZGlnbSIsInZvaWNpbmdBZGRPYmplY3RSZXNwb25zZXMiLCJ2b2ljaW5nQWRkQ29udGV4dFJlc3BvbnNlcyIsInZvaWNpbmdBZGRIaW50UmVzcG9uc2VzIiwidm9pY2luZ0NvbGxhcHNlVG9vbGJhciIsInZvaWNpbmdSZW1vdmVUb29sYmFyIiwid2ViZ2wiLCJ5b3R0YSIsInF1ZXJ5UGFyYW1ldGVycyIsImdldEFsbCIsImlzUHJvZHVjdGlvbiIsIiQiLCJhdHRyIiwiaXNBcHAiLCJlbmFibGVBbGxBc3NlcnRpb25zIiwiZW5hYmxlQmFzaWNBc3NlcnRpb25zIiwiaXNEZWJ1Z0J1aWxkIiwiYXNzZXJ0aW9ucyIsImVuYWJsZUFzc2VydCIsImVuYWJsZUFzc2VydFNsb3ciLCJpc0Z1enpFbmFibGVkIiwibWVzc2FnZSIsIm9wdGlvbnMiLCJhc3NpZ25JbiIsImNvbG9yIiwiY29uc29sZSIsIm1hcFN0cmluZyIsInN0cmluZyIsInNjcmlwdCIsInJlbWFwTG9jYWxlIiwiYXNzZXJ0SW5zdGVhZE9mV2FybiIsImxvY2FsZURhdGEiLCJpbnB1dFZhbHVlTG9jYWxlIiwidG9Mb3dlckNhc2UiLCJyZXBsYWNlIiwicGFydHMiLCJzcGxpdCIsInRvVXBwZXJDYXNlIiwiY2FuZGlkYXRlTG9jYWxlIiwiT2JqZWN0Iiwia2V5cyIsImxvY2FsZTMiLCJwYWlyUmVnZXgiLCJ0cmlwbGVSZWdleCIsImRvdWJsZVBhaXJSZWdleCIsInRlc3QiLCJmYWxsYmFja0xvY2FsZXMiLCJmYWxsYmFja0xvY2FsZSIsImJhZExvY2FsZSIsImFkZFdhcm5pbmciLCJnZXRWYWxpZFJ1bnRpbWVMb2NhbGUiLCJzdHJpbmdzIiwicG9zc2libGVMb2NhbGVzIiwiYXZhaWxhYmxlTG9jYWxlIiwiZmluZCIsInBvc3NpYmxlTG9jYWxlIiwiY2hlY2tBbmRSZW1hcExvY2FsZSIsInJlbWFwcGVkTG9jYWxlIiwiZmluYWxMb2NhbGUiLCJzbGVlcCIsIm1pbGxpcyIsImRhdGUiLCJEYXRlIiwiY3VyRGF0ZSIsIm1ha2VFdmVyeXRoaW5nU2xvdyIsInNldEludGVydmFsIiwibWFrZVJhbmRvbVNsb3duZXNzIiwiY2VpbCIsInJlcG9ydENvbnRpbnVvdXNUZXN0UmVzdWx0IiwicGFyZW50IiwicG9zdE1lc3NhZ2UiLCJKU09OIiwic3RyaW5naWZ5IiwicGFyc2UiLCJ1cmwiLCJsb2NhdGlvbiIsImhyZWYiLCJhZGRFdmVudExpc3RlbmVyIiwiYSIsInN0YWNrIiwiZXJyb3IiLCJlIiwib3BlbiIsImZvY3VzIiwiYmx1ciIsInNpbUZlYXR1cmVzU2NoZW1hIiwiZm9yRWFjaCIsInNjaGVtYUtleSIsInNpbUZlYXR1cmVOYW1lIiwic2ltRmVhdHVyZVZhbHVlIiwiQXJyYXkiLCJpc0FycmF5IiwiZXZlcnkiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTRCQyxHQUNDLENBQUE7UUF5YmtCQSwwQkFDREE7SUF4YmpCQyxVQUFVQSxPQUFRQyxPQUFPQyxrQkFBa0IsRUFBRTtRQUcvQkQ7SUFEZCxtREFBbUQ7SUFDbkRBLE9BQU9FLElBQUksR0FBR0YsQ0FBQUEsZUFBQUEsT0FBT0UsSUFBSSxZQUFYRixlQUFlLENBQUM7SUFDOUJBLE9BQU9FLElBQUksQ0FBQ0MsUUFBUSxHQUFHSCxPQUFPRSxJQUFJLENBQUNDLFFBQVEsSUFBSSxDQUFDO1FBQzFCSDtJQUF0QkEsT0FBT0UsSUFBSSxDQUFDRSxPQUFPLEdBQUdKLENBQUFBLHVCQUFBQSxPQUFPRSxJQUFJLENBQUNFLE9BQU8sWUFBbkJKLHVCQUF1QixDQUFDO1FBR3hCRTtJQUR0Qix5R0FBeUc7SUFD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