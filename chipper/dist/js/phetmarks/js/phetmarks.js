function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _extends() {
    _extends = Object.assign || function(target) {
        for(var i = 1; i < arguments.length; i++){
            var source = arguments[i];
            for(var key in source){
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    };
    return _extends.apply(this, arguments);
}
// Copyright 2016-2024, University of Colorado Boulder
/**
 * Page for quickly launching phet-related tasks, such as simulations, automated/unit tests, or other utilities.
 *
 * Displays three columns. See type information below for details:
 *
 * - Repositories: A list of repositories to select from, each one of which has a number of modes.
 * - Modes: Based on the repository selected. Decides what type of URL is loaded when "Launch" or the enter key is
 *          pressed.
 * - Query Parameters: If available, controls what optional query parameters will be added to the end of the URL.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ _async_to_generator(function*() {
    const demoRepos = [
        'bamboo',
        'griddle',
        'scenery-phet',
        'sun',
        'tambo',
        'vegas'
    ];
    const docRepos = [
        'scenery',
        'kite',
        'dot',
        'phet-io',
        'binder'
    ];
    // Use this as a parameter value to omit the query parameter selection (even if not the default selection)
    const NO_VALUE = 'No Value';
    // Query parameters that appear in multiple arrays.
    const audioQueryParameter = {
        value: 'audio',
        text: 'Audio support',
        type: 'parameterValues',
        parameterValues: [
            'enabled',
            'disabled',
            'muted'
        ],
        omitIfDefault: true
    };
    const eaQueryParameter = {
        value: 'ea',
        text: 'Assertions',
        default: true
    };
    const localesQueryParameter = {
        value: 'locales=*',
        text: 'Load all locales',
        dependentQueryParameters: [
            {
                value: 'keyboardLocaleSwitcher',
                text: 'ctrl + u/i to cycle locales'
            }
        ]
    };
    const phetioDebugParameter = {
        value: 'phetioDebug',
        text: 'Enable sim assertions from wrapper',
        type: 'boolean'
    };
    const phetioDebugTrueParameter = _.assign({
        default: true
    }, phetioDebugParameter);
    const phetioElementsDisplayParameter = {
        value: 'phetioElementsDisplay',
        text: 'What PhET-iO Elements to show',
        type: 'parameterValues',
        parameterValues: [
            'all',
            'featured'
        ]
    };
    const phetioPrintAPIProblemsQueryParameter = {
        value: 'phetioPrintAPIProblems',
        text: 'Print all API problems at once'
    };
    const phetioPrintMissingTandemsQueryParameter = {
        value: 'phetioPrintMissingTandems',
        text: 'Print uninstrumented tandems'
    };
    const screensQueryParameter = {
        value: 'screens',
        text: 'Sim Screen',
        type: 'parameterValues',
        parameterValues: [
            'all',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6'
        ],
        omitIfDefault: true
    };
    const demosQueryParameters = [
        {
            value: 'component=Something',
            text: 'Component selection'
        }
    ];
    const webGLParameter = {
        value: 'webgl',
        text: 'WebGL',
        type: 'boolean'
    };
    // Query parameters used for the following modes: unbuilt, compiled, production
    const simNoLocalesQueryParameters = [
        audioQueryParameter,
        {
            value: 'fuzz',
            text: 'Fuzz',
            dependentQueryParameters: [
                {
                    value: 'fuzzPointers=2',
                    text: 'Multitouch-fuzz'
                }
            ]
        },
        {
            value: 'fuzzBoard',
            text: 'Keyboard Fuzz'
        },
        {
            value: 'debugger',
            text: 'Debugger',
            default: true
        },
        {
            value: 'deprecationWarnings',
            text: 'Deprecation Warnings'
        },
        {
            value: 'dev',
            text: 'Dev'
        },
        {
            value: 'profiler',
            text: 'Profiler'
        },
        {
            value: 'showPointers',
            text: 'Pointers'
        },
        {
            value: 'showPointerAreas',
            text: 'Pointer Areas'
        },
        {
            value: 'showFittedBlockBounds',
            text: 'Fitted Block Bounds'
        },
        {
            value: 'showCanvasNodeBounds',
            text: 'CanvasNode Bounds'
        },
        {
            value: 'supportsInteractiveDescription',
            text: 'Supports Interactive Description',
            type: 'boolean'
        },
        {
            value: 'supportsSound',
            text: 'Supports Sound',
            type: 'boolean'
        },
        {
            value: 'supportsExtraSound',
            text: 'Supports Extra Sound',
            type: 'boolean'
        },
        {
            value: 'extraSoundInitiallyEnabled',
            text: 'Extra Sound on by default'
        },
        {
            value: 'supportsPanAndZoom',
            text: 'Supports Pan and Zoom',
            type: 'boolean'
        },
        {
            value: 'supportsVoicing',
            text: 'Supports Voicing',
            type: 'boolean'
        },
        {
            value: 'voicingInitiallyEnabled',
            text: 'Voicing on by default'
        },
        {
            value: 'printVoicingResponses',
            text: 'console.log() voicing responses'
        },
        {
            value: 'interactiveHighlightsInitiallyEnabled',
            text: 'Interactive Highlights on by default'
        },
        {
            value: 'preferencesStorage',
            text: 'Load Preferences from localStorage.'
        },
        webGLParameter,
        {
            value: 'disableModals',
            text: 'Disable Modals'
        },
        {
            value: 'regionAndCulture',
            text: 'Initial Region and Culture',
            type: 'parameterValues',
            omitIfDefault: true,
            parameterValues: [
                'default',
                'usa',
                'africa',
                'africaModest',
                'asia',
                'latinAmerica',
                'oceania',
                'multi'
            ]
        },
        {
            value: 'listenerOrder',
            text: 'Alter listener order',
            type: 'parameterValues',
            omitIfDefault: true,
            parameterValues: [
                'default',
                'reverse',
                'random',
                'random(42)' // very random, do not change
            ]
        }
    ];
    // This weirdness is to keep the order the same (screens last), while allowing phet-io to change the default of locales=*;
    const simQueryParameters = simNoLocalesQueryParameters.concat([
        localesQueryParameter
    ]);
    simQueryParameters.push(screensQueryParameter);
    simNoLocalesQueryParameters.push(screensQueryParameter);
    const phetBrandQueryParameter = {
        value: 'brand=phet',
        text: 'PhET Brand',
        default: true
    };
    // Query parameters used for unbuilt and PhET-iO wrappers
    const devSimQueryParameters = [
        phetBrandQueryParameter,
        eaQueryParameter,
        {
            value: 'eall',
            text: 'All Assertions'
        }
    ];
    const phetioBaseParameters = [
        audioQueryParameter,
        {
            value: 'phetioEmitHighFrequencyEvents',
            type: 'boolean',
            text: 'Emit events that occur often'
        },
        {
            value: 'phetioEmitStates',
            type: 'boolean',
            text: 'Emit state events'
        },
        {
            value: 'phetioCompareAPI&randomSeed=332211',
            text: 'Compare with reference API'
        },
        phetioPrintMissingTandemsQueryParameter,
        phetioPrintAPIProblemsQueryParameter,
        _.extend({
            default: true
        }, localesQueryParameter),
        {
            value: 'phetioValidation',
            text: 'Stricter, PhET-iO-specific validation',
            type: 'boolean'
        }
    ];
    // See aqua/fuzz-lightyear for details
    const getFuzzLightyearParameters = (duration = 10000, testTask = true, moreFuzzers = true)=>{
        return [
            {
                value: 'ea&audio=disabled',
                text: 'general sim params to include',
                default: true
            },
            {
                value: 'randomize',
                text: 'Randomize'
            },
            {
                value: 'reverse',
                text: 'Reverse'
            },
            {
                value: 'loadTimeout=30000',
                text: 'time sim has to load',
                default: true
            },
            {
                value: `testDuration=${duration}`,
                text: 'fuzz time after load',
                default: true
            },
            {
                value: 'fuzzers=2',
                text: 'More fuzzers',
                default: moreFuzzers
            },
            {
                value: 'wrapperName',
                text: 'PhET-iO Wrapper',
                type: 'parameterValues',
                omitIfDefault: true,
                parameterValues: [
                    'default',
                    'studio',
                    'state'
                ]
            },
            {
                value: `testTask=${testTask}`,
                text: 'test fuzzing after loading, set to false to just test loading',
                default: true
            }
        ];
    };
    // See perennial-alias/data/wrappers for format
    const nonPublishedPhetioWrappersToAddToPhetmarks = [
        'phet-io-wrappers/mirror-inputs'
    ];
    // Query parameters for the PhET-iO wrappers (including iframe tests)
    const phetioWrapperQueryParameters = phetioBaseParameters.concat([
        phetioDebugTrueParameter,
        {
            value: 'phetioWrapperDebug',
            text: 'Enable wrapper-side assertions',
            type: 'boolean',
            default: true
        }
    ]);
    // For phetio sim frame links
    const phetioSimQueryParameters = phetioBaseParameters.concat([
        eaQueryParameter,
        {
            value: 'brand=phet-io&phetioStandalone&phetioConsoleLog=colorized',
            text: 'Formatted PhET-IO Console Output'
        },
        phetioPrintMissingTandemsQueryParameter,
        phetioPrintAPIProblemsQueryParameter,
        {
            value: 'phetioPrintAPI',
            text: 'Print the API to the console'
        }
    ]);
    const migrationQueryParameters = [
        ...phetioWrapperQueryParameters,
        phetioElementsDisplayParameter
    ];
    /**
   * Returns a local-storage key that has additional information included, to prevent collision with other applications (or in the future, previous
   * versions of phetmarks).
   */ function storageKey(key) {
        return `phetmarks-${key}`;
    }
    /**
   * From the wrapper path in perennial-alias/data/wrappers, get the name of the wrapper.
   */ const getWrapperName = function(wrapper) {
        // If the wrapper has its own individual repo, then get the name 'classroom-activity' from 'phet-io-wrapper-classroom-activity'
        // Maintain compatibility for wrappers in 'phet-io-wrappers-'
        const wrapperParts = wrapper.split('phet-io-wrapper-');
        const wrapperName = wrapperParts.length > 1 ? wrapperParts[1] : wrapper.startsWith('phet-io-sim-specific') ? wrapper.split('/')[wrapper.split('/').length - 1] : wrapper;
        // If the wrapper still has slashes in it, then it looks like 'phet-io-wrappers/active'
        const splitOnSlash = wrapperName.split('/');
        return splitOnSlash[splitOnSlash.length - 1];
    };
    // Track whether 'shift' key is pressed, so that we can change how windows are opened.  If shift is pressed, the
    // page is launched in a separate tab.
    let shiftPressed = false;
    window.addEventListener('keydown', (event)=>{
        shiftPressed = event.shiftKey;
    });
    window.addEventListener('keyup', (event)=>{
        shiftPressed = event.shiftKey;
    });
    function openURL(url) {
        if (shiftPressed) {
            window.open(url, '_blank');
        } else {
            // @ts-expect-error - the browser supports setting to a string.
            window.location = url;
        }
    }
    /**
   * Fills out the modeData map with information about repositories, modes and query parameters. Parameters are largely
   * repo lists from perennial-alias/data files.
   *
   */ function populate(activeRunnables, activeRepos, phetioSims, interactiveDescriptionSims, wrappers, unitTestsRepos, phetioHydrogenSims, phetioPackageJSONs) {
        const modeData = {};
        activeRepos.forEach((repo)=>{
            const modes = [];
            modeData[repo] = modes;
            const isPhetio = _.includes(phetioSims, repo);
            const hasUnitTests = _.includes(unitTestsRepos, repo);
            const isRunnable = _.includes(activeRunnables, repo);
            const supportsInteractiveDescription = _.includes(interactiveDescriptionSims, repo);
            if (isRunnable) {
                modes.push({
                    name: 'unbuilt',
                    text: 'Unbuilt',
                    description: 'Runs the simulation from the top-level development HTML in unbuilt mode',
                    url: `../${repo}/${repo}_en.html`,
                    queryParameters: [
                        ...devSimQueryParameters,
                        ...demoRepos.includes(repo) ? demosQueryParameters : [],
                        ...simQueryParameters
                    ]
                });
                modes.push({
                    name: 'compiled',
                    text: 'Compiled',
                    description: 'Runs the English simulation from the build/phet/ directory (built from chipper)',
                    url: `../${repo}/build/phet/${repo}_en_phet.html`,
                    queryParameters: simQueryParameters
                });
                modes.push({
                    name: 'compiledXHTML',
                    text: 'Compiled XHTML',
                    description: 'Runs the English simulation from the build/phet/xhtml directory (built from chipper)',
                    url: `../${repo}/build/phet/xhtml/${repo}_all.xhtml`,
                    queryParameters: simQueryParameters
                });
                modes.push({
                    name: 'production',
                    text: 'Production',
                    description: 'Runs the latest English simulation from the production server',
                    url: `https://phet.colorado.edu/sims/html/${repo}/latest/${repo}_all.html`,
                    queryParameters: simQueryParameters
                });
                modes.push({
                    name: 'spot',
                    text: 'Dev (bayes)',
                    description: 'Loads the location on phet-dev.colorado.edu with versions for each dev deploy',
                    url: `https://phet-dev.colorado.edu/html/${repo}`
                });
                // Color picker UI
                modes.push({
                    name: 'colors',
                    text: 'Color Editor',
                    description: 'Runs the top-level -colors.html file (allows editing/viewing different profile colors)',
                    url: `color-editor.html?sim=${repo}`,
                    queryParameters: [
                        phetBrandQueryParameter
                    ]
                });
            }
            if (repo === 'scenery') {
                modes.push({
                    name: 'inspector',
                    text: 'Inspector',
                    description: 'Displays saved Scenery snapshots',
                    url: `../${repo}/tests/inspector.html`
                });
            }
            if (repo === 'phet-io') {
                modes.push({
                    name: 'test-studio-sims',
                    text: 'Fuzz Test Studio Wrapper',
                    description: 'Runs automated testing with fuzzing on studio, 15 second timer',
                    url: '../aqua/fuzz-lightyear/',
                    queryParameters: getFuzzLightyearParameters(15000).concat([
                        {
                            value: `fuzz&wrapperName=studio&wrapperContinuousTest=%7B%7D&repos=${phetioSims.join(',')}`,
                            text: 'Fuzz Test PhET-IO sims',
                            default: true
                        }
                    ])
                });
                modes.push({
                    name: 'test-migration-sims',
                    text: 'Fuzz Test Migration',
                    description: 'Runs automated testing with fuzzing on studio, 10 second timer',
                    url: '../aqua/fuzz-lightyear/',
                    queryParameters: getFuzzLightyearParameters(20000).concat(migrationQueryParameters).concat([
                        {
                            value: 'fuzz&wrapperName=migration&wrapperContinuousTest=%7B%7D&migrationRate=2000&' + `phetioMigrationReport=assert&repos=${phetioHydrogenSims.map((simData)=>simData.sim).join(',')}`,
                            text: 'Fuzz Test PhET-IO sims',
                            default: true
                        }
                    ])
                });
                modes.push({
                    name: 'test-state-sims',
                    text: 'Fuzz Test State Wrapper',
                    description: 'Runs automated testing with fuzzing on state, 15 second timer',
                    url: '../aqua/fuzz-lightyear/',
                    queryParameters: getFuzzLightyearParameters(15000).concat([
                        {
                            value: `fuzz&wrapperName=state&setStateRate=3000&wrapperContinuousTest=%7B%7D&repos=${phetioSims.join(',')}`,
                            text: 'Fuzz Test PhET-IO sims',
                            default: true
                        }
                    ])
                });
            }
            if (repo === 'phet-io-website') {
                modes.push({
                    name: 'viewRoot',
                    text: 'View Local',
                    description: 'view the local roon of the website',
                    url: `../${repo}/root/`
                });
            }
            if (hasUnitTests) {
                modes.push({
                    name: 'unitTestsUnbuilt',
                    text: 'Unit Tests (unbuilt)',
                    description: 'Runs unit tests in unbuilt mode',
                    url: `../${repo}/${repo}-tests.html`,
                    queryParameters: [
                        eaQueryParameter,
                        {
                            value: 'brand=phet-io',
                            text: 'PhET-iO Brand',
                            default: repo === 'phet-io' || repo === 'tandem' || repo === 'phet-io-wrappers'
                        },
                        ...repo === 'phet-io-wrappers' ? [
                            {
                                value: 'sim=gravity-and-orbits',
                                text: 'neededTestParams',
                                default: true
                            }
                        ] : []
                    ]
                });
            }
            if (docRepos.includes(repo)) {
                modes.push({
                    name: 'documentation',
                    text: 'Documentation',
                    description: 'Browse HTML documentation',
                    url: `../${repo}/doc${repo === 'binder' ? 's' : ''}/`
                });
            }
            if (repo === 'scenery') {
                modes.push({
                    name: 'layout-documentation',
                    text: 'Layout Documentation',
                    description: 'Browse HTML layout documentation',
                    url: `../${repo}/doc/layout.html`
                });
            }
            if (repo === 'scenery' || repo === 'kite' || repo === 'dot') {
                modes.push({
                    name: 'examples',
                    text: 'Examples',
                    description: 'Browse Examples',
                    url: `../${repo}/examples/`
                });
            }
            if (repo === 'scenery' || repo === 'kite' || repo === 'dot' || repo === 'phet-core') {
                modes.push({
                    name: 'playground',
                    text: 'Playground',
                    description: `Loads ${repo} and dependencies in the tab, and allows quick testing`,
                    url: `../${repo}/tests/playground.html`
                });
            }
            if (repo === 'scenery') {
                modes.push({
                    name: 'sandbox',
                    text: 'Sandbox',
                    description: 'Allows quick testing of Scenery features',
                    url: `../${repo}/tests/sandbox.html`
                });
            }
            if (repo === 'chipper' || repo === 'aqua') {
                modes.push({
                    name: 'test-phet-sims',
                    text: 'Fuzz Test PhET Sims',
                    description: 'Runs automated testing with fuzzing, 10 second timer',
                    url: '../aqua/fuzz-lightyear/',
                    queryParameters: getFuzzLightyearParameters().concat([
                        {
                            value: 'brand=phet&fuzz',
                            text: 'Fuzz PhET sims',
                            default: true
                        }
                    ])
                });
                modes.push({
                    name: 'test-phet-io-sims',
                    text: 'Fuzz Test PhET-iO Sims',
                    description: 'Runs automated testing with fuzzing, 10 second timer',
                    url: '../aqua/fuzz-lightyear/',
                    queryParameters: getFuzzLightyearParameters().concat([
                        {
                            value: 'brand=phet-io&fuzz&phetioStandalone',
                            text: 'Fuzz PhET-IO brand',
                            default: true
                        },
                        {
                            value: `repos=${phetioSims.join(',')}`,
                            text: 'Test only PhET-iO sims',
                            default: true
                        }
                    ])
                });
                modes.push({
                    name: 'test-interactive-description-sims',
                    text: 'Fuzz Test Interactive Description Sims',
                    description: 'Runs automated testing with fuzzing, 10 second timer',
                    url: '../aqua/fuzz-lightyear/',
                    // only one fuzzer because two iframes cannot both receive focus/blur events
                    queryParameters: getFuzzLightyearParameters(10000, true, false).concat([
                        phetBrandQueryParameter,
                        {
                            value: 'fuzzBoard&supportsInteractiveDescription=true',
                            text: 'Keyboard Fuzz Test sims',
                            default: true
                        },
                        {
                            value: 'fuzz&supportsInteractiveDescription=true',
                            text: 'Normal Fuzz Test sims'
                        },
                        {
                            value: `repos=${interactiveDescriptionSims.join(',')}`,
                            text: 'Test only A11y sims',
                            default: true
                        }
                    ])
                });
                modes.push({
                    name: 'fuzz-sims-load-only',
                    text: 'Load Sims',
                    description: 'Runs automated testing that just loads sims (without fuzzing or building)',
                    url: '../aqua/fuzz-lightyear/',
                    queryParameters: getFuzzLightyearParameters(10000, false).concat([
                        phetBrandQueryParameter
                    ])
                });
                modes.push({
                    name: 'continuous-testing',
                    text: 'Continuous Testing',
                    description: 'Link to the continuous testing on Bayes.',
                    url: 'sparky.colorado.edu/continuous-testing/aqua/html/continuous-report.html?maxColumns=10'
                });
                modes.push({
                    name: 'continuous-testing-local',
                    text: 'Continuous Testing (local unbuilt)',
                    description: 'Link to the continuous testing on Bayes.',
                    url: '../aqua/html/continuous-unbuilt-report.html?server=https://sparky.colorado.edu/&maxColumns=10'
                });
                // Shared by old and multi snapshop comparison.
                const sharedComparisonQueryParameters = [
                    {
                        value: 'simSeed=123',
                        text: 'Custom seed (defaults to a non random value)'
                    },
                    {
                        value: `simWidth=${1024 / 2}`,
                        text: 'Larger sim width'
                    },
                    {
                        value: `simHeight=${768 / 2}`,
                        text: 'Larger sim height'
                    },
                    {
                        value: 'numFrames=30',
                        text: 'more comparison frames'
                    }
                ];
                modes.push({
                    name: 'snapshot-comparison',
                    text: 'Snapshot Comparison',
                    description: 'Sets up snapshot screenshot comparison that can be run on different SHAs',
                    url: '../aqua/html/snapshot-comparison.html',
                    queryParameters: [
                        eaQueryParameter,
                        {
                            value: 'repos=density,buoyancy',
                            text: 'Sims to compare'
                        },
                        {
                            value: 'randomSims=10',
                            text: 'Test a random number of sims'
                        },
                        ...sharedComparisonQueryParameters,
                        {
                            value: 'simQueryParameters=ea',
                            text: 'sim frame parameters'
                        },
                        {
                            value: 'showTime',
                            text: 'show time taken for each snpashot',
                            type: 'boolean'
                        },
                        {
                            value: 'compareDescription',
                            text: 'compare description PDOM and text too',
                            type: 'boolean'
                        }
                    ]
                });
                modes.push({
                    name: 'multi-snapshot-comparison',
                    text: 'Multi-snapshot Comparison',
                    description: 'Sets up snapshot screenshot comparison for two different checkouts',
                    url: '../aqua/html/multi-snapshot-comparison.html',
                    queryParameters: [
                        eaQueryParameter,
                        {
                            value: 'repos=density,buoyancy',
                            text: 'Sims to compare'
                        },
                        {
                            value: 'urls=http://localhost,http://localhost:8080',
                            text: 'Testing urls',
                            default: true
                        },
                        ...sharedComparisonQueryParameters,
                        {
                            value: 'testPhetio',
                            type: 'boolean',
                            text: 'Test PhET-iO Brand'
                        },
                        {
                            value: 'simQueryParameters=ea',
                            text: 'sim parameters (not ?brand)',
                            default: true
                        },
                        {
                            value: 'copies=1',
                            text: 'IFrames per column'
                        }
                    ]
                });
            }
            if (repo === 'yotta') {
                modes.push({
                    name: 'yotta-statistics',
                    text: 'Statistics page',
                    description: 'Goes to the yotta report page, credentials in the Google Doc',
                    url: 'https://bayes.colorado.edu/statistics/yotta/'
                });
            }
            if (repo === 'skiffle') {
                modes.push({
                    name: 'sound-board',
                    text: 'Sound Board',
                    description: 'Interactive HTML page for exploring existing sounds in sims and common code',
                    url: '../skiffle/html/sound-board.html'
                });
            }
            if (repo === 'quake') {
                modes.push({
                    name: 'quake-built',
                    text: 'Haptics Playground (built for browser)',
                    description: 'Built browser version of the Haptics Playground app',
                    url: '../quake/platforms/browser/www/haptics-playground.html'
                });
            }
            if (repo === 'phettest') {
                modes.push({
                    name: 'phettest',
                    text: 'PhET Test',
                    description: 'local version of phettest pointing to the server on bayes',
                    url: '../phettest/'
                });
            }
            if (supportsInteractiveDescription) {
                modes.push({
                    name: 'a11y-view',
                    text: 'A11y View',
                    description: 'Runs the simulation in an iframe next to a copy of the PDOM tot easily inspect accessible content.',
                    url: `../${repo}/${repo}_a11y_view.html`,
                    queryParameters: devSimQueryParameters.concat(simQueryParameters)
                });
            }
            if (repo === 'interaction-dashboard') {
                modes.push({
                    name: 'preprocessor',
                    text: 'Preprocessor',
                    description: 'Load the preprocessor for parsing data logs down to a size that can be used by the simulation.',
                    url: `../${repo}/preprocessor.html`,
                    queryParameters: [
                        eaQueryParameter,
                        {
                            value: 'parseX=10',
                            text: 'Test only 10 sessions'
                        },
                        {
                            value: 'forSpreadsheet',
                            text: 'Create output for a spreadsheet.'
                        }
                    ]
                });
            }
            modes.push({
                name: 'github',
                text: 'GitHub',
                description: 'Opens to the repository\'s GitHub main page',
                url: `https://github.com/phetsims/${repo}`
            });
            modes.push({
                name: 'issues',
                text: 'Issues',
                description: 'Opens to the repository\'s GitHub issues page',
                url: `https://github.com/phetsims/${repo}/issues`
            });
            // if a phet-io sim, then add the wrappers to them
            if (isPhetio) {
                var _phetioPackageJSONs_repo_phet_phetio, _phetioPackageJSONs_repo;
                // Add the console logging, not a wrapper but nice to have
                modes.push({
                    name: 'one-sim-wrapper-tests',
                    text: 'Wrapper Unit Tests',
                    group: 'PhET-iO',
                    description: 'Test the PhET-iO API for this sim.',
                    // Each sim gets its own test, just run sim-less tests here
                    url: `../phet-io-wrappers/phet-io-wrappers-tests.html?sim=${repo}`,
                    queryParameters: phetioWrapperQueryParameters
                });
                // Add a link to the compiled wrapper index;
                modes.push({
                    name: 'compiled-index',
                    text: 'Compiled Index',
                    group: 'PhET-iO',
                    description: 'Runs the PhET-iO wrapper index from build/ directory (built from chipper)',
                    url: `../${repo}/build/phet-io/`,
                    queryParameters: phetioWrapperQueryParameters
                });
                modes.push({
                    name: 'standalone',
                    text: 'Standalone',
                    group: 'PhET-iO',
                    description: 'Runs the sim in phet-io brand with the standalone query parameter',
                    url: `../${repo}/${repo}_en.html?brand=phet-io&phetioStandalone`,
                    queryParameters: phetioSimQueryParameters.concat(simNoLocalesQueryParameters)
                });
                const simSpecificWrappers = ((_phetioPackageJSONs_repo = phetioPackageJSONs[repo]) == null ? void 0 : (_phetioPackageJSONs_repo_phet_phetio = _phetioPackageJSONs_repo.phet['phet-io']) == null ? void 0 : _phetioPackageJSONs_repo_phet_phetio.wrappers) || [];
                const allWrappers = wrappers.concat(nonPublishedPhetioWrappersToAddToPhetmarks).concat(simSpecificWrappers);
                // phet-io wrappers
                _.sortBy(allWrappers, getWrapperName).forEach((wrapper)=>{
                    const wrapperName = getWrapperName(wrapper);
                    let url = '';
                    // Process for dedicated wrapper repos
                    if (wrapper.startsWith('phet-io-wrapper-')) {
                        // Special use case for the sonification wrapper
                        url = wrapperName === 'sonification' ? `../phet-io-wrapper-${wrapperName}/${repo}-sonification.html?sim=${repo}` : `../${wrapper}/?sim=${repo}`;
                    } else {
                        url = `../${wrapper}/?sim=${repo}`;
                    }
                    // add recording to the console by default
                    if (wrapper === 'phet-io-wrappers/record') {
                        url += '&console';
                    }
                    let queryParameters = [];
                    if (wrapperName === 'studio') {
                        // So we don't mutate the common list
                        const studioQueryParameters = [
                            ...phetioWrapperQueryParameters
                        ];
                        // Studio defaults to phetioDebug=true, so this parameter can't be on by default
                        _.remove(studioQueryParameters, (item)=>item === phetioDebugTrueParameter);
                        queryParameters = studioQueryParameters.concat([
                            phetioDebugParameter,
                            phetioElementsDisplayParameter
                        ]);
                    } else if (wrapperName === 'migration') {
                        queryParameters = [
                            ...migrationQueryParameters,
                            _extends({}, webGLParameter, {
                                default: true
                            }),
                            {
                                value: 'phetioMigrationReport',
                                type: 'parameterValues',
                                text: 'How should the migration report be reported?',
                                parameterValues: [
                                    'dev',
                                    'client',
                                    'verbose',
                                    'assert'
                                ],
                                omitIfDefault: false
                            }
                        ];
                    } else if (wrapperName === 'state') {
                        queryParameters = [
                            ...phetioWrapperQueryParameters,
                            {
                                value: 'setStateRate=1000',
                                text: 'Customize the "set state" rate for how often a state is set to the downstream sim (in ms)',
                                default: true
                            },
                            {
                                value: 'logTiming',
                                text: 'Console log the amount of time it took to set the state of the simulation.'
                            }
                        ];
                    } else if (wrapperName === 'playback') {
                        queryParameters = [];
                    } else {
                        queryParameters = phetioWrapperQueryParameters;
                    }
                    modes.push({
                        name: wrapperName,
                        text: wrapperName,
                        group: 'PhET-iO',
                        description: `Runs the phet-io wrapper ${wrapperName}`,
                        url: url,
                        queryParameters: queryParameters
                    });
                });
                // Add the console logging, not a wrapper but nice to have
                modes.push({
                    name: 'colorized',
                    text: 'Data: colorized',
                    group: 'PhET-iO',
                    description: 'Show the colorized event log in the console of the stand alone sim.',
                    url: `../${repo}/${repo}_en.html?brand=phet-io&phetioConsoleLog=colorized&phetioStandalone&phetioEmitHighFrequencyEvents=false`,
                    queryParameters: phetioSimQueryParameters.concat(simNoLocalesQueryParameters)
                });
            }
        });
        return modeData;
    }
    function clearChildren(element) {
        while(element.childNodes.length){
            element.removeChild(element.childNodes[0]);
        }
    }
    function createRepositorySelector(repositories) {
        const select = document.createElement('select');
        select.autofocus = true;
        repositories.forEach((repo)=>{
            const option = document.createElement('option');
            option.value = option.label = option.innerHTML = repo;
            select.appendChild(option);
        });
        // IE or no-scrollIntoView will need to be height-limited
        // @ts-expect-error
        if (select.scrollIntoView && !navigator.userAgent.includes('Trident/')) {
            select.setAttribute('size', `${repositories.length}`);
        } else {
            select.setAttribute('size', '30');
        }
        // Select a repository if it's been stored in localStorage before
        const repoKey = storageKey('repo');
        const value = localStorage.getItem(repoKey);
        if (value) {
            select.value = value;
        }
        select.focus();
        // Scroll to the selected element
        function tryScroll() {
            const element = select.childNodes[select.selectedIndex];
            // @ts-expect-error
            if (element.scrollIntoViewIfNeeded) {
                // @ts-expect-error
                element.scrollIntoViewIfNeeded();
            } else if (element.scrollIntoView) {
                element.scrollIntoView();
            }
        }
        select.addEventListener('change', tryScroll);
        // We need to wait for things to load fully before scrolling (in Chrome).
        // See https://github.com/phetsims/phetmarks/issues/13
        setTimeout(tryScroll, 0);
        return {
            element: select,
            get value () {
                // @ts-expect-error - it is an HTMLElement, not just a node
                return select.childNodes[select.selectedIndex].value;
            }
        };
    }
    function createModeSelector(modeData, repositorySelector) {
        const select = document.createElement('select');
        const selector = {
            element: select,
            get value () {
                return select.value;
            },
            get mode () {
                const currentModeName = selector.value;
                return _.filter(modeData[repositorySelector.value], (mode)=>{
                    return mode.name === currentModeName;
                })[0];
            },
            update: function() {
                localStorage.setItem(storageKey('repo'), repositorySelector.value);
                clearChildren(select);
                const groups = {};
                modeData[repositorySelector.value].forEach((choice)=>{
                    const choiceOption = document.createElement('option');
                    choiceOption.value = choice.name;
                    choiceOption.label = choice.text;
                    choiceOption.title = choice.description;
                    choiceOption.innerHTML = choice.text;
                    // add to an `optgroup` instead of having all modes on the `select`
                    choice.group = choice.group || 'General';
                    // create if the group doesn't exist
                    if (!groups[choice.group]) {
                        const optGroup = document.createElement('optgroup');
                        optGroup.label = choice.group;
                        groups[choice.group] = optGroup;
                        select.appendChild(optGroup);
                    }
                    // add the choice to the property group
                    groups[choice.group].appendChild(choiceOption);
                });
                select.setAttribute('size', modeData[repositorySelector.value].length + Object.keys(groups).length + '');
                if (select.selectedIndex < 0) {
                    select.selectedIndex = 0;
                }
            }
        };
        return selector;
    }
    // Create control for type 'parameterValues', and also 'boolean' which has hard coded values true/false/sim default.
    function createParameterValuesSelector(queryParameter) {
        // We don't want to mutate the provided data
        queryParameter = _.assignIn({}, queryParameter);
        if (queryParameter.type === 'boolean') {
            assert && assert(!queryParameter.hasOwnProperty('parameterValues'), 'parameterValues are filled in for boolean');
            assert && assert(!queryParameter.hasOwnProperty('omitIfDefault'), 'omitIfDefault is filled in for boolean');
            queryParameter.parameterValues = [
                'true',
                'false',
                NO_VALUE
            ];
            // sim default is the default for booleans
            if (!queryParameter.hasOwnProperty('default')) {
                queryParameter.default = NO_VALUE;
            }
        } else {
            assert && assert(queryParameter.type === 'parameterValues', `parameterValues type only please: ${queryParameter.value} - ${queryParameter.type}`);
        }
        assert && assert(queryParameter.parameterValues, 'parameterValues expected');
        assert && assert(queryParameter.parameterValues.length > 0, 'parameterValues expected (more than 0 of them)');
        assert && assert(!queryParameter.hasOwnProperty('dependentQueryParameters'), 'type=parameterValues and type=boolean do not support dependent query parameters at this time.');
        const div = document.createElement('div');
        const queryParameterName = queryParameter.value;
        const parameterValues = queryParameter.parameterValues;
        const providedADefault = queryParameter.hasOwnProperty('default');
        const theProvidedDefault = queryParameter.default + '';
        if (providedADefault) {
            assert && assert(parameterValues.includes(theProvidedDefault), `parameter default for ${queryParameterName} is not an available value: ${theProvidedDefault}`);
        }
        const defaultValue = providedADefault ? theProvidedDefault : parameterValues[0];
        const createParameterValuesRadioButton = (value)=>{
            const label = document.createElement('label');
            label.className = 'choiceLabel';
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = queryParameterName;
            radio.value = value;
            radio.checked = value === defaultValue;
            label.appendChild(radio);
            label.appendChild(document.createTextNode(value)); // use the query parameter value as the display text for clarity
            return label;
        };
        const bullet = document.createElement('span');
        bullet.innerHTML = '⚫';
        bullet.className = 'bullet';
        div.appendChild(bullet);
        const label = document.createTextNode(`${queryParameter.text} (?${queryParameterName})`);
        div.appendChild(label);
        for(let i = 0; i < parameterValues.length; i++){
            div.appendChild(createParameterValuesRadioButton(parameterValues[i]));
        }
        return {
            element: div,
            get value () {
                const radioButtonValue = $(`input[name=${queryParameterName}]:checked`).val() + '';
                // A value of "Simulation Default" tells us not to provide the query parameter.
                const omitQueryParameter = radioButtonValue === NO_VALUE || queryParameter.omitIfDefault && radioButtonValue === defaultValue;
                return omitQueryParameter ? '' : `${queryParameterName}=${radioButtonValue}`;
            }
        };
    }
    // get Flag checkboxes as their individual query strings (in a list), but only if they are different from their default.
    function getFlagParameters(toggleContainer) {
        const checkboxElements = $(toggleContainer).find('.flagParameter');
        // Only checked boxed.
        return _.filter(checkboxElements, (checkbox)=>checkbox.checked).map((checkbox)=>checkbox.name);
    }
    // Create a checkbox to toggle if the flag parameter should be added to the mode URL
    function createFlagSelector(parameter, toggleContainer, elementToQueryParameter) {
        assert && assert(!parameter.hasOwnProperty('parameterValues'), 'parameterValues are for type=parameterValues');
        assert && assert(!parameter.hasOwnProperty('omitIfDefault'), 'omitIfDefault are for type=parameterValues');
        assert && parameter.hasOwnProperty('default') && assert(typeof parameter.default === 'boolean', 'default is a boolean for flags');
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = parameter.value;
        checkbox.classList.add('flagParameter');
        label.appendChild(checkbox);
        assert && assert(!elementToQueryParameter.has(checkbox), 'sanity check for overwriting');
        elementToQueryParameter.set(checkbox, parameter);
        const queryParameterDisplay = parameter.value;
        label.appendChild(document.createTextNode(`${parameter.text} (?${queryParameterDisplay})`));
        toggleContainer.appendChild(label);
        toggleContainer.appendChild(document.createElement('br'));
        checkbox.checked = !!parameter.default;
        if (parameter.dependentQueryParameters) {
            /**
       * Creates a checkbox whose value is dependent on another checkbox, it is only used if the parent
       * checkbox is checked.
       */ const createDependentCheckbox = (label, value, checked)=>{
                const dependentQueryParametersContainer = document.createElement('div');
                const dependentCheckbox = document.createElement('input');
                dependentCheckbox.id = getDependentParameterControlId(value);
                dependentCheckbox.type = 'checkbox';
                dependentCheckbox.name = value;
                dependentCheckbox.classList.add('flagParameter');
                dependentCheckbox.style.marginLeft = '40px';
                dependentCheckbox.checked = checked;
                const labelElement = document.createElement('label');
                labelElement.appendChild(document.createTextNode(label));
                labelElement.htmlFor = dependentCheckbox.id;
                dependentQueryParametersContainer.appendChild(dependentCheckbox);
                dependentQueryParametersContainer.appendChild(labelElement);
                // checkbox becomes unchecked and disabled if dependency checkbox is unchecked
                const enableButton = ()=>{
                    dependentCheckbox.disabled = !checkbox.checked;
                    if (!checkbox.checked) {
                        dependentCheckbox.checked = false;
                    }
                };
                checkbox.addEventListener('change', enableButton);
                enableButton();
                return dependentQueryParametersContainer;
            };
            const containerDiv = document.createElement('div');
            parameter.dependentQueryParameters.forEach((relatedParameter)=>{
                const dependentCheckbox = createDependentCheckbox(`${relatedParameter.text} (${relatedParameter.value})`, relatedParameter.value, !!relatedParameter.default);
                containerDiv.appendChild(dependentCheckbox);
            });
            toggleContainer.appendChild(containerDiv);
        }
    }
    function createQueryParametersSelector(modeSelector) {
        const customTextBox = document.createElement('input');
        customTextBox.type = 'text';
        const toggleContainer = document.createElement('div');
        let elementToQueryParameter = new Map();
        const parameterValuesSelectors = [];
        return {
            toggleElement: toggleContainer,
            customElement: customTextBox,
            get value () {
                // flag query parameters, in string form
                const flagQueryParameters = getFlagParameters(toggleContainer);
                const parameterValuesQueryParameters = parameterValuesSelectors.map((selector)=>selector.value).filter((queryParameter)=>queryParameter !== '');
                const customQueryParameters = customTextBox.value.length ? [
                    customTextBox.value
                ] : [];
                return flagQueryParameters.concat(parameterValuesQueryParameters).concat(customQueryParameters).join('&');
            },
            update: function() {
                // Rebuild based on a new mode/repo change
                elementToQueryParameter = new Map();
                parameterValuesSelectors.length = 0;
                clearChildren(toggleContainer);
                const queryParameters = modeSelector.mode.queryParameters || [];
                queryParameters.forEach((parameter)=>{
                    if (parameter.type === 'parameterValues' || parameter.type === 'boolean') {
                        const selector = createParameterValuesSelector(parameter);
                        toggleContainer.appendChild(selector.element);
                        parameterValuesSelectors.push(selector);
                    } else {
                        createFlagSelector(parameter, toggleContainer, elementToQueryParameter);
                    }
                });
            }
        };
    }
    /**
   * Create the view and hook everything up.
   */ function render(modeData) {
        const repositorySelector = createRepositorySelector(Object.keys(modeData));
        const modeSelector = createModeSelector(modeData, repositorySelector);
        const queryParameterSelector = createQueryParametersSelector(modeSelector);
        function getCurrentURL() {
            const queryParameters = queryParameterSelector.value;
            const url = modeSelector.mode.url;
            const separator = url.includes('?') ? '&' : '?';
            return url + (queryParameters.length ? separator + queryParameters : '');
        }
        const launchButton = document.createElement('button');
        launchButton.id = 'launchButton';
        launchButton.name = 'launch';
        launchButton.innerHTML = 'Launch';
        const resetButton = document.createElement('button');
        resetButton.name = 'reset';
        resetButton.innerHTML = 'Reset Query Parameters';
        function header(string) {
            const head = document.createElement('h3');
            head.appendChild(document.createTextNode(string));
            return head;
        }
        // Divs for our three columns
        const repoDiv = document.createElement('div');
        repoDiv.id = 'repositories';
        const modeDiv = document.createElement('div');
        modeDiv.id = 'choices';
        const queryParametersDiv = document.createElement('div');
        queryParametersDiv.id = 'queryParameters';
        // Layout of all the major elements
        repoDiv.appendChild(header('Repositories'));
        repoDiv.appendChild(repositorySelector.element);
        modeDiv.appendChild(header('Modes'));
        modeDiv.appendChild(modeSelector.element);
        modeDiv.appendChild(document.createElement('br'));
        modeDiv.appendChild(document.createElement('br'));
        modeDiv.appendChild(launchButton);
        queryParametersDiv.appendChild(header('Query Parameters'));
        queryParametersDiv.appendChild(queryParameterSelector.toggleElement);
        queryParametersDiv.appendChild(document.createTextNode('Query Parameters: '));
        queryParametersDiv.appendChild(queryParameterSelector.customElement);
        queryParametersDiv.appendChild(document.createElement('br'));
        queryParametersDiv.appendChild(resetButton);
        document.body.appendChild(repoDiv);
        document.body.appendChild(modeDiv);
        document.body.appendChild(queryParametersDiv);
        function updateQueryParameterVisibility() {
            queryParametersDiv.style.visibility = modeSelector.mode.queryParameters ? 'inherit' : 'hidden';
        }
        // Align panels based on width
        function layout() {
            modeDiv.style.left = `${repositorySelector.element.clientWidth + 20}px`;
            queryParametersDiv.style.left = `${repositorySelector.element.clientWidth + +modeDiv.clientWidth + 40}px`;
        }
        window.addEventListener('resize', layout);
        // Hook updates to change listeners
        function onRepositoryChanged() {
            modeSelector.update();
            onModeChanged();
        }
        function onModeChanged() {
            queryParameterSelector.update();
            updateQueryParameterVisibility();
            layout();
        }
        repositorySelector.element.addEventListener('change', onRepositoryChanged);
        modeSelector.element.addEventListener('change', onModeChanged);
        onRepositoryChanged();
        // Clicking 'Launch' or pressing 'enter' opens the URL
        function openCurrentURL() {
            openURL(getCurrentURL());
        }
        window.addEventListener('keydown', (event)=>{
            // Check for enter key
            if (event.which === 13) {
                openCurrentURL();
            }
        }, false);
        launchButton.addEventListener('click', openCurrentURL);
        // Reset by redrawing everything
        resetButton.addEventListener('click', queryParameterSelector.update);
    }
    function loadPackageJSONs(repos) {
        return _loadPackageJSONs.apply(this, arguments);
    }
    function _loadPackageJSONs() {
        _loadPackageJSONs = _async_to_generator(function*(repos) {
            const packageJSONs = {};
            for (const repo of repos){
                packageJSONs[repo] = yield $.ajax({
                    url: `../${repo}/package.json`
                });
            }
            return packageJSONs;
        });
        return _loadPackageJSONs.apply(this, arguments);
    }
    // Splits file strings (such as perennial-alias/data/active-runnables) into a list of entries, ignoring blank lines.
    function whiteSplitAndSort(rawDataList) {
        return rawDataList.split('\n').map((line)=>{
            return line.replace('\r', '');
        }).filter((line)=>{
            return line.length > 0;
        }).sort();
    }
    // get the ID for a checkbox that is "dependent" on another value
    const getDependentParameterControlId = (value)=>`dependent-checkbox-${value}`;
    // Load files serially, populate then render
    const activeRunnables = whiteSplitAndSort((yield $.ajax({
        url: '../perennial-alias/data/active-runnables'
    })));
    const activeRepos = whiteSplitAndSort((yield $.ajax({
        url: '../perennial-alias/data/active-repos'
    })));
    const phetioSims = whiteSplitAndSort((yield $.ajax({
        url: '../perennial-alias/data/phet-io'
    })));
    const interactiveDescriptionSims = whiteSplitAndSort((yield $.ajax({
        url: '../perennial-alias/data/interactive-description'
    })));
    const wrappers = whiteSplitAndSort((yield $.ajax({
        url: '../perennial-alias/data/wrappers'
    })));
    const unitTestsRepos = whiteSplitAndSort((yield $.ajax({
        url: '../perennial-alias/data/unit-tests'
    })));
    const phetioHydrogenSims = yield $.ajax({
        url: '../perennial-alias/data/phet-io-hydrogen.json'
    });
    const phetioPackageJSONs = yield loadPackageJSONs(phetioSims);
    render(populate(activeRunnables, activeRepos, phetioSims, interactiveDescriptionSims, wrappers, unitTestsRepos, phetioHydrogenSims, phetioPackageJSONs));
})().catch((e)=>{
    throw e;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXRtYXJrcy9qcy9waGV0bWFya3MudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUGFnZSBmb3IgcXVpY2tseSBsYXVuY2hpbmcgcGhldC1yZWxhdGVkIHRhc2tzLCBzdWNoIGFzIHNpbXVsYXRpb25zLCBhdXRvbWF0ZWQvdW5pdCB0ZXN0cywgb3Igb3RoZXIgdXRpbGl0aWVzLlxuICpcbiAqIERpc3BsYXlzIHRocmVlIGNvbHVtbnMuIFNlZSB0eXBlIGluZm9ybWF0aW9uIGJlbG93IGZvciBkZXRhaWxzOlxuICpcbiAqIC0gUmVwb3NpdG9yaWVzOiBBIGxpc3Qgb2YgcmVwb3NpdG9yaWVzIHRvIHNlbGVjdCBmcm9tLCBlYWNoIG9uZSBvZiB3aGljaCBoYXMgYSBudW1iZXIgb2YgbW9kZXMuXG4gKiAtIE1vZGVzOiBCYXNlZCBvbiB0aGUgcmVwb3NpdG9yeSBzZWxlY3RlZC4gRGVjaWRlcyB3aGF0IHR5cGUgb2YgVVJMIGlzIGxvYWRlZCB3aGVuIFwiTGF1bmNoXCIgb3IgdGhlIGVudGVyIGtleSBpc1xuICogICAgICAgICAgcHJlc3NlZC5cbiAqIC0gUXVlcnkgUGFyYW1ldGVyczogSWYgYXZhaWxhYmxlLCBjb250cm9scyB3aGF0IG9wdGlvbmFsIHF1ZXJ5IHBhcmFtZXRlcnMgd2lsbCBiZSBhZGRlZCB0byB0aGUgZW5kIG9mIHRoZSBVUkwuXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuKCBhc3luYyBmdW5jdGlvbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgdHlwZSBQYWNrYWdlSlNPTiA9IHtcbiAgICB2ZXJzaW9uOiBzdHJpbmc7XG4gICAgcGhldDoge1xuICAgICAgJ3BoZXQtaW8nOiB7XG4gICAgICAgIHdyYXBwZXJzOiBzdHJpbmdbXTtcbiAgICAgIH07XG4gICAgfTtcbiAgfTtcbiAgLy8gUXVlcnlQYXJhbWV0ZXIgaGFzIHRoZSBmb3JtYXRcbiAgdHlwZSBQaGV0bWFya3NRdWVyeVBhcmFtZXRlciA9IHtcbiAgICB2YWx1ZTogc3RyaW5nOyAvLyBUaGUgYWN0dWFsIHF1ZXJ5IHBhcmFtZXRlciBpbmNsdWRlZCBpbiB0aGUgVVJMLFxuICAgIHRleHQ6IHN0cmluZzsgLy8gRGlzcGxheSBzdHJpbmcgc2hvd24gaW4gdGhlIHF1ZXJ5IHBhcmFtZXRlciBsaXN0LFxuXG4gICAgLy8gZGVmYXVsdHMgdG8gZmxhZywgd2l0aCBhIGNoZWNrYm94IHRvIGFkZCB0aGUgcGFyYW1ldGVyLlxuICAgIC8vIElmIGJvb2xlYW4sIHRoZW4gaXQgd2lsbCBtYXAgb3ZlciB0byBhIHBhcmFtZXRlclZhbHVlcyB3aXRoIHRydWUvZmFsc2Uvc2ltIGRlZmF1bHQgcmFkaW8gYnV0dG9uc1xuICAgIC8vIElmIHBhcmFtZXRlclZhbHVlcywgbXVzdCBwcm92aWRlIFwicGFyYW1ldGVyVmFsdWVzXCIga2V5LCB3aGVyZSBmaXJzdCBvbmUgaXMgdGhlIGRlZmF1bHQuXG4gICAgdHlwZT86ICdmbGFnJyB8ICdib29sZWFuJyB8ICdwYXJhbWV0ZXJWYWx1ZXMnO1xuXG4gICAgLy8gKiBGb3IgdHlwZT1mbGFnOiBJZiB0cnVlLCB0aGUgcXVlcnkgcGFyYW1ldGVyIHdpbGwgYmUgaW5jbHVkZWQgYnkgZGVmYXVsdC4gVGhpcyB3aWxsIGJlIGZhbHNlIGlmIG5vdCBwcm92aWRlZC5cbiAgICAvLyAqIEZvciB0eXBlPWJvb2xlYW58cGFyYW1ldGVyVmFsdWVzOiBkZWZhdWx0IHNob3VsZCBiZSB0aGUgZGVmYXVsdFZhbHVlLCBhbmQgbXVzdCBiZSBpbiB0aGUgcGFyYW1ldGVyIHZhbHVlcyBhbmRcbiAgICAvLyBkZWZhdWx0cyB0byB0aGUgZmlyc3QgZWxlbWVudCBpbiBwYXJhbWV0ZXJWYWx1ZXNcbiAgICBkZWZhdWx0PzogYm9vbGVhbiB8IHN0cmluZztcblxuICAgIC8vIEZvciB0eXBlPSdmbGFnJyBvbmx5IEEgXCJzdWIgcXVlcnkgcGFyYW1ldGVyXCIgbGlzdCB0aGF0IGlzIG5lc3RlZCB1bmRlcm5lYXRoIGFub3RoZXIsIGFuZCBpcyBvbmx5IGF2YWlsYWJsZSBpZiB0aGUgcGFyZW50IGlzIGNoZWNrZWQuXG4gICAgZGVwZW5kZW50UXVlcnlQYXJhbWV0ZXJzPzogUGhldG1hcmtzUXVlcnlQYXJhbWV0ZXJbXTtcblxuICAgIC8vIE11c3QgYmUgcHJvdmlkZWQgZm9yIHR5cGUgJ3BhcmFtZXRlclZhbHVlcycsIGlmIHR5cGU9J2Jvb2xlYW4nLCB0aGVuIHRoaXMgaXMgZmlsbGVkIGluIGFzIHNpbSBkZWZhdWx0LCB0cnVlLCBhbmQgZmFsc2UuXG4gICAgcGFyYW1ldGVyVmFsdWVzPzogc3RyaW5nW107IC8vIHZhbHVlcyBvZiB0aGUgcGFyYW1ldGVyLlxuICAgIG9taXRJZkRlZmF1bHQ/OiBib29sZWFuOyAvLyBpZiB0cnVlLCBvbWl0IHRoZSBkZWZhdWx0IHNlbGVjdGlvbiBvZiB0aGUgcXVlcnkgcGFyYW1ldGVyLCBvbmx5IGFkZGluZyBpdCB3aGVuIGNoYW5nZWQuIERlZmF1bHRzIHRvIGZhbHNlXG4gIH07XG5cbiAgY29uc3QgZGVtb1JlcG9zID0gW1xuICAgICdiYW1ib28nLFxuICAgICdncmlkZGxlJyxcbiAgICAnc2NlbmVyeS1waGV0JyxcbiAgICAnc3VuJyxcbiAgICAndGFtYm8nLFxuICAgICd2ZWdhcydcbiAgXTtcblxuICBjb25zdCBkb2NSZXBvcyA9IFtcbiAgICAnc2NlbmVyeScsXG4gICAgJ2tpdGUnLFxuICAgICdkb3QnLFxuICAgICdwaGV0LWlvJyxcbiAgICAnYmluZGVyJ1xuICBdO1xuXG4gIHR5cGUgUmVwb05hbWUgPSBzdHJpbmc7IC8vIHRoZSBuYW1lIG9mIGEgcmVwbztcblxuICAvLyBVc2UgdGhpcyBhcyBhIHBhcmFtZXRlciB2YWx1ZSB0byBvbWl0IHRoZSBxdWVyeSBwYXJhbWV0ZXIgc2VsZWN0aW9uIChldmVuIGlmIG5vdCB0aGUgZGVmYXVsdCBzZWxlY3Rpb24pXG4gIGNvbnN0IE5PX1ZBTFVFID0gJ05vIFZhbHVlJztcblxuICB0eXBlIE1pZ3JhdGlvbkRhdGEgPSB7XG4gICAgc2ltOiBzdHJpbmc7XG4gICAgdmVyc2lvbjogc3RyaW5nO1xuICB9O1xuXG4gIC8vIFwiR2VuZXJhbFwiIGlzIHRoZSBkZWZhdWx0XG4gIHR5cGUgTW9kZUdyb3VwID0gJ1BoRVQtaU8nIHwgJ0dlbmVyYWwnO1xuXG4gIC8vIE1vZGUgaGFzIHRoZSBmb3JtYXRcbiAgdHlwZSBNb2RlID0ge1xuICAgIG5hbWU6IHN0cmluZzsgLy8gSW50ZXJuYWwgdW5pcXVlIHZhbHVlIChmb3IgbG9va2luZyB1cCB3aGljaCBvcHRpb24gd2FzIGNob3NlbiksXG4gICAgdGV4dDogc3RyaW5nOyAvLyBTaG93biBpbiB0aGUgbW9kZSBsaXN0XG4gICAgZ3JvdXA/OiBNb2RlR3JvdXA7IC8vIFRoZSBvcHRncm91cCB0aGF0IHRoaXMgbW9kZSBiZWxvbmdzIHRvLCBkZWZhdWx0cyB0byBcIkdlbmVyYWxcIlxuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7IC8vIFNob3duIHdoZW4gaG92ZXJpbmcgb3ZlciB0aGUgbW9kZSBpbiB0aGUgbGlzdCxcbiAgICB1cmw6IHN0cmluZzsgLy8gVGhlIGJhc2UgVVJMIHRvIHZpc2l0ICh3aXRob3V0IGFkZGVkIHF1ZXJ5IHBhcmFtZXRlcnMpIHdoZW4gdGhlIG1vZGUgaXMgY2hvc2VuLFxuICAgIHF1ZXJ5UGFyYW1ldGVycz86IFBoZXRtYXJrc1F1ZXJ5UGFyYW1ldGVyW107XG4gIH07XG4gIHR5cGUgTW9kZURhdGEgPSBSZWNvcmQ8UmVwb05hbWUsIE1vZGVbXT47XG4gIHR5cGUgUmVwb1NlbGVjdG9yID0ge1xuICAgIGVsZW1lbnQ6IEhUTUxTZWxlY3RFbGVtZW50O1xuICAgIGdldCB2YWx1ZSgpOiBzdHJpbmc7XG4gIH07XG5cbiAgdHlwZSBNb2RlU2VsZWN0b3IgPSB7XG4gICAgZWxlbWVudDogSFRNTFNlbGVjdEVsZW1lbnQ7XG4gICAgdmFsdWU6IHN0cmluZztcbiAgICBtb2RlOiBNb2RlO1xuICAgIHVwZGF0ZTogKCkgPT4gdm9pZDtcbiAgfTtcblxuICB0eXBlIFF1ZXJ5UGFyYW1ldGVyU2VsZWN0b3IgPSB7XG4gICAgZWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gICAgdmFsdWU6IHN0cmluZzsgLy8gVGhlIHNpbmdsZSBxdWVyeVN0cmluZywgbGlrZSBgc2NyZWVucz0xYCwgb3IgJycgaWYgbm90aGluZyBzaG91bGQgYmUgYWRkZWQgdG8gdGhlIHF1ZXJ5IHN0cmluZy5cbiAgfTtcblxuICB0eXBlIFF1ZXJ5UGFyYW1ldGVyc1NlbGVjdG9yID0ge1xuICAgIHRvZ2dsZUVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICAgIGN1c3RvbUVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuXG4gICAgLy8gR2V0IHRoZSBjdXJyZW50IHF1ZXJ5U3RyaW5nIHZhbHVlIGJhc2VkIG9uIHRoZSBjdXJyZW50IHNlbGVjdGlvbi5cbiAgICB2YWx1ZTogc3RyaW5nO1xuICAgIHVwZGF0ZTogKCkgPT4gdm9pZDtcbiAgfTtcblxuICB0eXBlIEVsZW1lbnRUb1BhcmFtZXRlck1hcCA9IE1hcDxIVE1MRWxlbWVudCwgUGhldG1hcmtzUXVlcnlQYXJhbWV0ZXI+O1xuXG4gIC8vIFF1ZXJ5IHBhcmFtZXRlcnMgdGhhdCBhcHBlYXIgaW4gbXVsdGlwbGUgYXJyYXlzLlxuICBjb25zdCBhdWRpb1F1ZXJ5UGFyYW1ldGVyOiBQaGV0bWFya3NRdWVyeVBhcmFtZXRlciA9IHtcbiAgICB2YWx1ZTogJ2F1ZGlvJyxcbiAgICB0ZXh0OiAnQXVkaW8gc3VwcG9ydCcsXG4gICAgdHlwZTogJ3BhcmFtZXRlclZhbHVlcycsXG4gICAgcGFyYW1ldGVyVmFsdWVzOiBbICdlbmFibGVkJywgJ2Rpc2FibGVkJywgJ211dGVkJyBdLFxuICAgIG9taXRJZkRlZmF1bHQ6IHRydWVcbiAgfTtcbiAgY29uc3QgZWFRdWVyeVBhcmFtZXRlcjogUGhldG1hcmtzUXVlcnlQYXJhbWV0ZXIgPSB7XG4gICAgdmFsdWU6ICdlYScsXG4gICAgdGV4dDogJ0Fzc2VydGlvbnMnLFxuICAgIGRlZmF1bHQ6IHRydWVcbiAgfTtcbiAgY29uc3QgbG9jYWxlc1F1ZXJ5UGFyYW1ldGVyOiBQaGV0bWFya3NRdWVyeVBhcmFtZXRlciA9IHtcbiAgICB2YWx1ZTogJ2xvY2FsZXM9KicsXG4gICAgdGV4dDogJ0xvYWQgYWxsIGxvY2FsZXMnLFxuICAgIGRlcGVuZGVudFF1ZXJ5UGFyYW1ldGVyczogW1xuICAgICAgeyB2YWx1ZTogJ2tleWJvYXJkTG9jYWxlU3dpdGNoZXInLCB0ZXh0OiAnY3RybCArIHUvaSB0byBjeWNsZSBsb2NhbGVzJyB9XG4gICAgXVxuICB9O1xuICBjb25zdCBwaGV0aW9EZWJ1Z1BhcmFtZXRlcjogUGhldG1hcmtzUXVlcnlQYXJhbWV0ZXIgPSB7XG4gICAgdmFsdWU6ICdwaGV0aW9EZWJ1ZycsXG4gICAgdGV4dDogJ0VuYWJsZSBzaW0gYXNzZXJ0aW9ucyBmcm9tIHdyYXBwZXInLFxuICAgIHR5cGU6ICdib29sZWFuJ1xuICB9O1xuICBjb25zdCBwaGV0aW9EZWJ1Z1RydWVQYXJhbWV0ZXI6IFBoZXRtYXJrc1F1ZXJ5UGFyYW1ldGVyID0gXy5hc3NpZ24oIHtcbiAgICBkZWZhdWx0OiB0cnVlXG4gIH0sIHBoZXRpb0RlYnVnUGFyYW1ldGVyICk7XG4gIGNvbnN0IHBoZXRpb0VsZW1lbnRzRGlzcGxheVBhcmFtZXRlcjogUGhldG1hcmtzUXVlcnlQYXJhbWV0ZXIgPSB7XG4gICAgdmFsdWU6ICdwaGV0aW9FbGVtZW50c0Rpc3BsYXknLFxuICAgIHRleHQ6ICdXaGF0IFBoRVQtaU8gRWxlbWVudHMgdG8gc2hvdycsXG4gICAgdHlwZTogJ3BhcmFtZXRlclZhbHVlcycsXG4gICAgcGFyYW1ldGVyVmFsdWVzOiBbICdhbGwnLCAnZmVhdHVyZWQnIF1cbiAgfTtcbiAgY29uc3QgcGhldGlvUHJpbnRBUElQcm9ibGVtc1F1ZXJ5UGFyYW1ldGVyOiBQaGV0bWFya3NRdWVyeVBhcmFtZXRlciA9IHtcbiAgICB2YWx1ZTogJ3BoZXRpb1ByaW50QVBJUHJvYmxlbXMnLFxuICAgIHRleHQ6ICdQcmludCBhbGwgQVBJIHByb2JsZW1zIGF0IG9uY2UnXG4gIH07XG4gIGNvbnN0IHBoZXRpb1ByaW50TWlzc2luZ1RhbmRlbXNRdWVyeVBhcmFtZXRlcjogUGhldG1hcmtzUXVlcnlQYXJhbWV0ZXIgPSB7XG4gICAgdmFsdWU6ICdwaGV0aW9QcmludE1pc3NpbmdUYW5kZW1zJyxcbiAgICB0ZXh0OiAnUHJpbnQgdW5pbnN0cnVtZW50ZWQgdGFuZGVtcydcbiAgfTtcbiAgY29uc3Qgc2NyZWVuc1F1ZXJ5UGFyYW1ldGVyOiBQaGV0bWFya3NRdWVyeVBhcmFtZXRlciA9IHtcbiAgICB2YWx1ZTogJ3NjcmVlbnMnLFxuICAgIHRleHQ6ICdTaW0gU2NyZWVuJyxcbiAgICB0eXBlOiAncGFyYW1ldGVyVmFsdWVzJyxcbiAgICBwYXJhbWV0ZXJWYWx1ZXM6IFsgJ2FsbCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicgXSxcbiAgICBvbWl0SWZEZWZhdWx0OiB0cnVlXG4gIH07XG5cbiAgY29uc3QgZGVtb3NRdWVyeVBhcmFtZXRlcnM6IFBoZXRtYXJrc1F1ZXJ5UGFyYW1ldGVyW10gPSBbIHtcbiAgICB2YWx1ZTogJ2NvbXBvbmVudD1Tb21ldGhpbmcnLFxuICAgIHRleHQ6ICdDb21wb25lbnQgc2VsZWN0aW9uJ1xuICB9IF07XG5cbiAgY29uc3Qgd2ViR0xQYXJhbWV0ZXI6IFBoZXRtYXJrc1F1ZXJ5UGFyYW1ldGVyID0geyB2YWx1ZTogJ3dlYmdsJywgdGV4dDogJ1dlYkdMJywgdHlwZTogJ2Jvb2xlYW4nIH07XG5cbiAgLy8gUXVlcnkgcGFyYW1ldGVycyB1c2VkIGZvciB0aGUgZm9sbG93aW5nIG1vZGVzOiB1bmJ1aWx0LCBjb21waWxlZCwgcHJvZHVjdGlvblxuICBjb25zdCBzaW1Ob0xvY2FsZXNRdWVyeVBhcmFtZXRlcnM6IFBoZXRtYXJrc1F1ZXJ5UGFyYW1ldGVyW10gPSBbXG4gICAgYXVkaW9RdWVyeVBhcmFtZXRlciwge1xuICAgICAgdmFsdWU6ICdmdXp6JywgdGV4dDogJ0Z1enonLCBkZXBlbmRlbnRRdWVyeVBhcmFtZXRlcnM6IFtcbiAgICAgICAgeyB2YWx1ZTogJ2Z1enpQb2ludGVycz0yJywgdGV4dDogJ011bHRpdG91Y2gtZnV6eicgfVxuICAgICAgXVxuICAgIH0sXG4gICAgeyB2YWx1ZTogJ2Z1enpCb2FyZCcsIHRleHQ6ICdLZXlib2FyZCBGdXp6JyB9LFxuICAgIHsgdmFsdWU6ICdkZWJ1Z2dlcicsIHRleHQ6ICdEZWJ1Z2dlcicsIGRlZmF1bHQ6IHRydWUgfSxcbiAgICB7IHZhbHVlOiAnZGVwcmVjYXRpb25XYXJuaW5ncycsIHRleHQ6ICdEZXByZWNhdGlvbiBXYXJuaW5ncycgfSxcbiAgICB7IHZhbHVlOiAnZGV2JywgdGV4dDogJ0RldicgfSxcbiAgICB7IHZhbHVlOiAncHJvZmlsZXInLCB0ZXh0OiAnUHJvZmlsZXInIH0sXG4gICAgeyB2YWx1ZTogJ3Nob3dQb2ludGVycycsIHRleHQ6ICdQb2ludGVycycgfSxcbiAgICB7IHZhbHVlOiAnc2hvd1BvaW50ZXJBcmVhcycsIHRleHQ6ICdQb2ludGVyIEFyZWFzJyB9LFxuICAgIHsgdmFsdWU6ICdzaG93Rml0dGVkQmxvY2tCb3VuZHMnLCB0ZXh0OiAnRml0dGVkIEJsb2NrIEJvdW5kcycgfSxcbiAgICB7IHZhbHVlOiAnc2hvd0NhbnZhc05vZGVCb3VuZHMnLCB0ZXh0OiAnQ2FudmFzTm9kZSBCb3VuZHMnIH0sXG4gICAgeyB2YWx1ZTogJ3N1cHBvcnRzSW50ZXJhY3RpdmVEZXNjcmlwdGlvbicsIHRleHQ6ICdTdXBwb3J0cyBJbnRlcmFjdGl2ZSBEZXNjcmlwdGlvbicsIHR5cGU6ICdib29sZWFuJyB9LFxuICAgIHsgdmFsdWU6ICdzdXBwb3J0c1NvdW5kJywgdGV4dDogJ1N1cHBvcnRzIFNvdW5kJywgdHlwZTogJ2Jvb2xlYW4nIH0sXG4gICAgeyB2YWx1ZTogJ3N1cHBvcnRzRXh0cmFTb3VuZCcsIHRleHQ6ICdTdXBwb3J0cyBFeHRyYSBTb3VuZCcsIHR5cGU6ICdib29sZWFuJyB9LFxuICAgIHsgdmFsdWU6ICdleHRyYVNvdW5kSW5pdGlhbGx5RW5hYmxlZCcsIHRleHQ6ICdFeHRyYSBTb3VuZCBvbiBieSBkZWZhdWx0JyB9LFxuICAgIHsgdmFsdWU6ICdzdXBwb3J0c1BhbkFuZFpvb20nLCB0ZXh0OiAnU3VwcG9ydHMgUGFuIGFuZCBab29tJywgdHlwZTogJ2Jvb2xlYW4nIH0sXG4gICAgeyB2YWx1ZTogJ3N1cHBvcnRzVm9pY2luZycsIHRleHQ6ICdTdXBwb3J0cyBWb2ljaW5nJywgdHlwZTogJ2Jvb2xlYW4nIH0sXG4gICAgeyB2YWx1ZTogJ3ZvaWNpbmdJbml0aWFsbHlFbmFibGVkJywgdGV4dDogJ1ZvaWNpbmcgb24gYnkgZGVmYXVsdCcgfSxcbiAgICB7IHZhbHVlOiAncHJpbnRWb2ljaW5nUmVzcG9uc2VzJywgdGV4dDogJ2NvbnNvbGUubG9nKCkgdm9pY2luZyByZXNwb25zZXMnIH0sXG4gICAgeyB2YWx1ZTogJ2ludGVyYWN0aXZlSGlnaGxpZ2h0c0luaXRpYWxseUVuYWJsZWQnLCB0ZXh0OiAnSW50ZXJhY3RpdmUgSGlnaGxpZ2h0cyBvbiBieSBkZWZhdWx0JyB9LFxuICAgIHsgdmFsdWU6ICdwcmVmZXJlbmNlc1N0b3JhZ2UnLCB0ZXh0OiAnTG9hZCBQcmVmZXJlbmNlcyBmcm9tIGxvY2FsU3RvcmFnZS4nIH0sXG4gICAgd2ViR0xQYXJhbWV0ZXIsXG4gICAgeyB2YWx1ZTogJ2Rpc2FibGVNb2RhbHMnLCB0ZXh0OiAnRGlzYWJsZSBNb2RhbHMnIH0sXG4gICAge1xuICAgICAgdmFsdWU6ICdyZWdpb25BbmRDdWx0dXJlJyxcbiAgICAgIHRleHQ6ICdJbml0aWFsIFJlZ2lvbiBhbmQgQ3VsdHVyZScsXG4gICAgICB0eXBlOiAncGFyYW1ldGVyVmFsdWVzJyxcbiAgICAgIG9taXRJZkRlZmF1bHQ6IHRydWUsXG4gICAgICBwYXJhbWV0ZXJWYWx1ZXM6IFtcbiAgICAgICAgJ2RlZmF1bHQnLFxuICAgICAgICAndXNhJyxcbiAgICAgICAgJ2FmcmljYScsXG4gICAgICAgICdhZnJpY2FNb2Rlc3QnLFxuICAgICAgICAnYXNpYScsXG4gICAgICAgICdsYXRpbkFtZXJpY2EnLFxuICAgICAgICAnb2NlYW5pYScsXG4gICAgICAgICdtdWx0aSdcbiAgICAgIF1cbiAgICB9LCB7XG4gICAgICB2YWx1ZTogJ2xpc3RlbmVyT3JkZXInLFxuICAgICAgdGV4dDogJ0FsdGVyIGxpc3RlbmVyIG9yZGVyJyxcbiAgICAgIHR5cGU6ICdwYXJhbWV0ZXJWYWx1ZXMnLFxuICAgICAgb21pdElmRGVmYXVsdDogdHJ1ZSxcbiAgICAgIHBhcmFtZXRlclZhbHVlczogW1xuICAgICAgICAnZGVmYXVsdCcsXG4gICAgICAgICdyZXZlcnNlJyxcbiAgICAgICAgJ3JhbmRvbScsXG4gICAgICAgICdyYW5kb20oNDIpJyAvLyB2ZXJ5IHJhbmRvbSwgZG8gbm90IGNoYW5nZVxuICAgICAgXVxuICAgIH1cbiAgXTtcblxuICAvLyBUaGlzIHdlaXJkbmVzcyBpcyB0byBrZWVwIHRoZSBvcmRlciB0aGUgc2FtZSAoc2NyZWVucyBsYXN0KSwgd2hpbGUgYWxsb3dpbmcgcGhldC1pbyB0byBjaGFuZ2UgdGhlIGRlZmF1bHQgb2YgbG9jYWxlcz0qO1xuICBjb25zdCBzaW1RdWVyeVBhcmFtZXRlcnMgPSBzaW1Ob0xvY2FsZXNRdWVyeVBhcmFtZXRlcnMuY29uY2F0KCBbIGxvY2FsZXNRdWVyeVBhcmFtZXRlciBdICk7XG4gIHNpbVF1ZXJ5UGFyYW1ldGVycy5wdXNoKCBzY3JlZW5zUXVlcnlQYXJhbWV0ZXIgKTtcbiAgc2ltTm9Mb2NhbGVzUXVlcnlQYXJhbWV0ZXJzLnB1c2goIHNjcmVlbnNRdWVyeVBhcmFtZXRlciApO1xuXG4gIGNvbnN0IHBoZXRCcmFuZFF1ZXJ5UGFyYW1ldGVyID0geyB2YWx1ZTogJ2JyYW5kPXBoZXQnLCB0ZXh0OiAnUGhFVCBCcmFuZCcsIGRlZmF1bHQ6IHRydWUgfTtcblxuICAvLyBRdWVyeSBwYXJhbWV0ZXJzIHVzZWQgZm9yIHVuYnVpbHQgYW5kIFBoRVQtaU8gd3JhcHBlcnNcbiAgY29uc3QgZGV2U2ltUXVlcnlQYXJhbWV0ZXJzOiBQaGV0bWFya3NRdWVyeVBhcmFtZXRlcltdID0gW1xuICAgIHBoZXRCcmFuZFF1ZXJ5UGFyYW1ldGVyLFxuICAgIGVhUXVlcnlQYXJhbWV0ZXIsXG4gICAgeyB2YWx1ZTogJ2VhbGwnLCB0ZXh0OiAnQWxsIEFzc2VydGlvbnMnIH1cbiAgXTtcblxuICBjb25zdCBwaGV0aW9CYXNlUGFyYW1ldGVyczogUGhldG1hcmtzUXVlcnlQYXJhbWV0ZXJbXSA9IFtcbiAgICBhdWRpb1F1ZXJ5UGFyYW1ldGVyLCB7XG4gICAgICB2YWx1ZTogJ3BoZXRpb0VtaXRIaWdoRnJlcXVlbmN5RXZlbnRzJyxcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIHRleHQ6ICdFbWl0IGV2ZW50cyB0aGF0IG9jY3VyIG9mdGVuJ1xuICAgIH0sIHtcbiAgICAgIHZhbHVlOiAncGhldGlvRW1pdFN0YXRlcycsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICB0ZXh0OiAnRW1pdCBzdGF0ZSBldmVudHMnXG4gICAgfSwge1xuICAgICAgdmFsdWU6ICdwaGV0aW9Db21wYXJlQVBJJnJhbmRvbVNlZWQ9MzMyMjExJywgLy8gTk9URTogRFVQTElDQVRJT04gQUxFUlQ6IHJhbmRvbSBzZWVkIG11c3QgbWF0Y2ggdGhhdCBvZiBBUEkgZ2VuZXJhdGlvbiwgc2VlIGdlbmVyYXRlUGhldGlvTWFjcm9BUElcbiAgICAgIHRleHQ6ICdDb21wYXJlIHdpdGggcmVmZXJlbmNlIEFQSSdcbiAgICB9LFxuICAgIHBoZXRpb1ByaW50TWlzc2luZ1RhbmRlbXNRdWVyeVBhcmFtZXRlcixcbiAgICBwaGV0aW9QcmludEFQSVByb2JsZW1zUXVlcnlQYXJhbWV0ZXIsXG4gICAgXy5leHRlbmQoIHsgZGVmYXVsdDogdHJ1ZSB9LCBsb2NhbGVzUXVlcnlQYXJhbWV0ZXIgKSwge1xuICAgICAgdmFsdWU6ICdwaGV0aW9WYWxpZGF0aW9uJyxcbiAgICAgIHRleHQ6ICdTdHJpY3RlciwgUGhFVC1pTy1zcGVjaWZpYyB2YWxpZGF0aW9uJyxcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgIH1cbiAgXTtcblxuICAvLyBTZWUgYXF1YS9mdXp6LWxpZ2h0eWVhciBmb3IgZGV0YWlsc1xuICBjb25zdCBnZXRGdXp6TGlnaHR5ZWFyUGFyYW1ldGVycyA9ICggZHVyYXRpb24gPSAxMDAwMCwgdGVzdFRhc2sgPSB0cnVlLCBtb3JlRnV6emVycyA9IHRydWUgKTogUGhldG1hcmtzUXVlcnlQYXJhbWV0ZXJbXSA9PiB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHsgdmFsdWU6ICdlYSZhdWRpbz1kaXNhYmxlZCcsIHRleHQ6ICdnZW5lcmFsIHNpbSBwYXJhbXMgdG8gaW5jbHVkZScsIGRlZmF1bHQ6IHRydWUgfSxcbiAgICAgIHsgdmFsdWU6ICdyYW5kb21pemUnLCB0ZXh0OiAnUmFuZG9taXplJyB9LFxuICAgICAgeyB2YWx1ZTogJ3JldmVyc2UnLCB0ZXh0OiAnUmV2ZXJzZScgfSxcbiAgICAgIHtcbiAgICAgICAgdmFsdWU6ICdsb2FkVGltZW91dD0zMDAwMCcsXG4gICAgICAgIHRleHQ6ICd0aW1lIHNpbSBoYXMgdG8gbG9hZCcsXG4gICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIH0sIHtcbiAgICAgICAgdmFsdWU6IGB0ZXN0RHVyYXRpb249JHtkdXJhdGlvbn1gLFxuICAgICAgICB0ZXh0OiAnZnV6eiB0aW1lIGFmdGVyIGxvYWQnLFxuICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICB9LCB7XG4gICAgICAgIHZhbHVlOiAnZnV6emVycz0yJyxcbiAgICAgICAgdGV4dDogJ01vcmUgZnV6emVycycsXG4gICAgICAgIGRlZmF1bHQ6IG1vcmVGdXp6ZXJzXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB2YWx1ZTogJ3dyYXBwZXJOYW1lJyxcbiAgICAgICAgdGV4dDogJ1BoRVQtaU8gV3JhcHBlcicsXG4gICAgICAgIHR5cGU6ICdwYXJhbWV0ZXJWYWx1ZXMnLFxuICAgICAgICBvbWl0SWZEZWZhdWx0OiB0cnVlLFxuICAgICAgICBwYXJhbWV0ZXJWYWx1ZXM6IFtcbiAgICAgICAgICAnZGVmYXVsdCcsXG4gICAgICAgICAgJ3N0dWRpbycsXG4gICAgICAgICAgJ3N0YXRlJ1xuICAgICAgICBdXG4gICAgICB9LCB7XG4gICAgICAgIHZhbHVlOiBgdGVzdFRhc2s9JHt0ZXN0VGFza31gLFxuICAgICAgICB0ZXh0OiAndGVzdCBmdXp6aW5nIGFmdGVyIGxvYWRpbmcsIHNldCB0byBmYWxzZSB0byBqdXN0IHRlc3QgbG9hZGluZycsXG4gICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIH1cbiAgICBdO1xuICB9O1xuXG4gIC8vIFNlZSBwZXJlbm5pYWwtYWxpYXMvZGF0YS93cmFwcGVycyBmb3IgZm9ybWF0XG4gIGNvbnN0IG5vblB1Ymxpc2hlZFBoZXRpb1dyYXBwZXJzVG9BZGRUb1BoZXRtYXJrcyA9IFsgJ3BoZXQtaW8td3JhcHBlcnMvbWlycm9yLWlucHV0cycgXTtcblxuICAvLyBRdWVyeSBwYXJhbWV0ZXJzIGZvciB0aGUgUGhFVC1pTyB3cmFwcGVycyAoaW5jbHVkaW5nIGlmcmFtZSB0ZXN0cylcbiAgY29uc3QgcGhldGlvV3JhcHBlclF1ZXJ5UGFyYW1ldGVyczogUGhldG1hcmtzUXVlcnlQYXJhbWV0ZXJbXSA9IHBoZXRpb0Jhc2VQYXJhbWV0ZXJzLmNvbmNhdCggWyBwaGV0aW9EZWJ1Z1RydWVQYXJhbWV0ZXIsIHtcbiAgICB2YWx1ZTogJ3BoZXRpb1dyYXBwZXJEZWJ1ZycsXG4gICAgdGV4dDogJ0VuYWJsZSB3cmFwcGVyLXNpZGUgYXNzZXJ0aW9ucycsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWVcbiAgfSBdICk7XG5cbiAgLy8gRm9yIHBoZXRpbyBzaW0gZnJhbWUgbGlua3NcbiAgY29uc3QgcGhldGlvU2ltUXVlcnlQYXJhbWV0ZXJzOiBQaGV0bWFya3NRdWVyeVBhcmFtZXRlcltdID0gcGhldGlvQmFzZVBhcmFtZXRlcnMuY29uY2F0KCBbXG4gICAgZWFRdWVyeVBhcmFtZXRlciwgLy8gdGhpcyBuZWVkcyB0byBiZSBmaXJzdCBpbiB0aGlzIGxpc3RcbiAgICB7IHZhbHVlOiAnYnJhbmQ9cGhldC1pbyZwaGV0aW9TdGFuZGFsb25lJnBoZXRpb0NvbnNvbGVMb2c9Y29sb3JpemVkJywgdGV4dDogJ0Zvcm1hdHRlZCBQaEVULUlPIENvbnNvbGUgT3V0cHV0JyB9LFxuICAgIHBoZXRpb1ByaW50TWlzc2luZ1RhbmRlbXNRdWVyeVBhcmFtZXRlcixcbiAgICBwaGV0aW9QcmludEFQSVByb2JsZW1zUXVlcnlQYXJhbWV0ZXIsIHtcbiAgICAgIHZhbHVlOiAncGhldGlvUHJpbnRBUEknLFxuICAgICAgdGV4dDogJ1ByaW50IHRoZSBBUEkgdG8gdGhlIGNvbnNvbGUnXG4gICAgfVxuICBdICk7XG5cbiAgY29uc3QgbWlncmF0aW9uUXVlcnlQYXJhbWV0ZXJzOiBQaGV0bWFya3NRdWVyeVBhcmFtZXRlcltdID0gWyAuLi5waGV0aW9XcmFwcGVyUXVlcnlQYXJhbWV0ZXJzLCBwaGV0aW9FbGVtZW50c0Rpc3BsYXlQYXJhbWV0ZXIgXTtcblxuICAvKipcbiAgICogUmV0dXJucyBhIGxvY2FsLXN0b3JhZ2Uga2V5IHRoYXQgaGFzIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gaW5jbHVkZWQsIHRvIHByZXZlbnQgY29sbGlzaW9uIHdpdGggb3RoZXIgYXBwbGljYXRpb25zIChvciBpbiB0aGUgZnV0dXJlLCBwcmV2aW91c1xuICAgKiB2ZXJzaW9ucyBvZiBwaGV0bWFya3MpLlxuICAgKi9cbiAgZnVuY3Rpb24gc3RvcmFnZUtleSgga2V5OiBzdHJpbmcgKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYHBoZXRtYXJrcy0ke2tleX1gO1xuICB9XG5cbiAgLyoqXG4gICAqIEZyb20gdGhlIHdyYXBwZXIgcGF0aCBpbiBwZXJlbm5pYWwtYWxpYXMvZGF0YS93cmFwcGVycywgZ2V0IHRoZSBuYW1lIG9mIHRoZSB3cmFwcGVyLlxuICAgKi9cbiAgY29uc3QgZ2V0V3JhcHBlck5hbWUgPSBmdW5jdGlvbiggd3JhcHBlcjogc3RyaW5nICk6IHN0cmluZyB7XG5cbiAgICAvLyBJZiB0aGUgd3JhcHBlciBoYXMgaXRzIG93biBpbmRpdmlkdWFsIHJlcG8sIHRoZW4gZ2V0IHRoZSBuYW1lICdjbGFzc3Jvb20tYWN0aXZpdHknIGZyb20gJ3BoZXQtaW8td3JhcHBlci1jbGFzc3Jvb20tYWN0aXZpdHknXG4gICAgLy8gTWFpbnRhaW4gY29tcGF0aWJpbGl0eSBmb3Igd3JhcHBlcnMgaW4gJ3BoZXQtaW8td3JhcHBlcnMtJ1xuICAgIGNvbnN0IHdyYXBwZXJQYXJ0cyA9IHdyYXBwZXIuc3BsaXQoICdwaGV0LWlvLXdyYXBwZXItJyApO1xuICAgIGNvbnN0IHdyYXBwZXJOYW1lID0gd3JhcHBlclBhcnRzLmxlbmd0aCA+IDEgP1xuICAgICAgICAgICAgICAgICAgICAgICAgd3JhcHBlclBhcnRzWyAxIF0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgd3JhcHBlci5zdGFydHNXaXRoKCAncGhldC1pby1zaW0tc3BlY2lmaWMnICkgPyB3cmFwcGVyLnNwbGl0KCAnLycgKVsgd3JhcHBlci5zcGxpdCggJy8nICkubGVuZ3RoIC0gMSBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHdyYXBwZXI7XG5cbiAgICAvLyBJZiB0aGUgd3JhcHBlciBzdGlsbCBoYXMgc2xhc2hlcyBpbiBpdCwgdGhlbiBpdCBsb29rcyBsaWtlICdwaGV0LWlvLXdyYXBwZXJzL2FjdGl2ZSdcbiAgICBjb25zdCBzcGxpdE9uU2xhc2ggPSB3cmFwcGVyTmFtZS5zcGxpdCggJy8nICk7XG4gICAgcmV0dXJuIHNwbGl0T25TbGFzaFsgc3BsaXRPblNsYXNoLmxlbmd0aCAtIDEgXTtcbiAgfTtcblxuICAvLyBUcmFjayB3aGV0aGVyICdzaGlmdCcga2V5IGlzIHByZXNzZWQsIHNvIHRoYXQgd2UgY2FuIGNoYW5nZSBob3cgd2luZG93cyBhcmUgb3BlbmVkLiAgSWYgc2hpZnQgaXMgcHJlc3NlZCwgdGhlXG4gIC8vIHBhZ2UgaXMgbGF1bmNoZWQgaW4gYSBzZXBhcmF0ZSB0YWIuXG4gIGxldCBzaGlmdFByZXNzZWQgPSBmYWxzZTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgZXZlbnQgPT4ge1xuICAgIHNoaWZ0UHJlc3NlZCA9IGV2ZW50LnNoaWZ0S2V5O1xuICB9ICk7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5dXAnLCBldmVudCA9PiB7XG4gICAgc2hpZnRQcmVzc2VkID0gZXZlbnQuc2hpZnRLZXk7XG4gIH0gKTtcblxuICBmdW5jdGlvbiBvcGVuVVJMKCB1cmw6IHN0cmluZyApOiB2b2lkIHtcbiAgICBpZiAoIHNoaWZ0UHJlc3NlZCApIHtcbiAgICAgIHdpbmRvdy5vcGVuKCB1cmwsICdfYmxhbmsnICk7XG4gICAgfVxuICAgIGVsc2Uge1xuXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gdGhlIGJyb3dzZXIgc3VwcG9ydHMgc2V0dGluZyB0byBhIHN0cmluZy5cbiAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IHVybDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRmlsbHMgb3V0IHRoZSBtb2RlRGF0YSBtYXAgd2l0aCBpbmZvcm1hdGlvbiBhYm91dCByZXBvc2l0b3JpZXMsIG1vZGVzIGFuZCBxdWVyeSBwYXJhbWV0ZXJzLiBQYXJhbWV0ZXJzIGFyZSBsYXJnZWx5XG4gICAqIHJlcG8gbGlzdHMgZnJvbSBwZXJlbm5pYWwtYWxpYXMvZGF0YSBmaWxlcy5cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIHBvcHVsYXRlKCBhY3RpdmVSdW5uYWJsZXM6IFJlcG9OYW1lW10sIGFjdGl2ZVJlcG9zOiBSZXBvTmFtZVtdLCBwaGV0aW9TaW1zOiBSZXBvTmFtZVtdLFxuICAgICAgICAgICAgICAgICAgICAgaW50ZXJhY3RpdmVEZXNjcmlwdGlvblNpbXM6IFJlcG9OYW1lW10sIHdyYXBwZXJzOiBzdHJpbmdbXSxcbiAgICAgICAgICAgICAgICAgICAgIHVuaXRUZXN0c1JlcG9zOiBSZXBvTmFtZVtdLCBwaGV0aW9IeWRyb2dlblNpbXM6IE1pZ3JhdGlvbkRhdGFbXSwgcGhldGlvUGFja2FnZUpTT05zOiBSZWNvcmQ8UmVwb05hbWUsIFBhY2thZ2VKU09OPiApOiBNb2RlRGF0YSB7XG4gICAgY29uc3QgbW9kZURhdGE6IE1vZGVEYXRhID0ge307XG5cbiAgICBhY3RpdmVSZXBvcy5mb3JFYWNoKCAoIHJlcG86IFJlcG9OYW1lICkgPT4ge1xuICAgICAgY29uc3QgbW9kZXM6IE1vZGVbXSA9IFtdO1xuICAgICAgbW9kZURhdGFbIHJlcG8gXSA9IG1vZGVzO1xuXG4gICAgICBjb25zdCBpc1BoZXRpbyA9IF8uaW5jbHVkZXMoIHBoZXRpb1NpbXMsIHJlcG8gKTtcbiAgICAgIGNvbnN0IGhhc1VuaXRUZXN0cyA9IF8uaW5jbHVkZXMoIHVuaXRUZXN0c1JlcG9zLCByZXBvICk7XG4gICAgICBjb25zdCBpc1J1bm5hYmxlID0gXy5pbmNsdWRlcyggYWN0aXZlUnVubmFibGVzLCByZXBvICk7XG4gICAgICBjb25zdCBzdXBwb3J0c0ludGVyYWN0aXZlRGVzY3JpcHRpb24gPSBfLmluY2x1ZGVzKCBpbnRlcmFjdGl2ZURlc2NyaXB0aW9uU2ltcywgcmVwbyApO1xuXG4gICAgICBpZiAoIGlzUnVubmFibGUgKSB7XG4gICAgICAgIG1vZGVzLnB1c2goIHtcbiAgICAgICAgICBuYW1lOiAndW5idWlsdCcsXG4gICAgICAgICAgdGV4dDogJ1VuYnVpbHQnLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUnVucyB0aGUgc2ltdWxhdGlvbiBmcm9tIHRoZSB0b3AtbGV2ZWwgZGV2ZWxvcG1lbnQgSFRNTCBpbiB1bmJ1aWx0IG1vZGUnLFxuICAgICAgICAgIHVybDogYC4uLyR7cmVwb30vJHtyZXBvfV9lbi5odG1sYCxcbiAgICAgICAgICBxdWVyeVBhcmFtZXRlcnM6IFtcbiAgICAgICAgICAgIC4uLmRldlNpbVF1ZXJ5UGFyYW1ldGVycyxcbiAgICAgICAgICAgIC4uLiggZGVtb1JlcG9zLmluY2x1ZGVzKCByZXBvICkgPyBkZW1vc1F1ZXJ5UGFyYW1ldGVycyA6IFtdICksXG4gICAgICAgICAgICAuLi5zaW1RdWVyeVBhcmFtZXRlcnNcbiAgICAgICAgICBdXG4gICAgICAgIH0gKTtcbiAgICAgICAgbW9kZXMucHVzaCgge1xuICAgICAgICAgIG5hbWU6ICdjb21waWxlZCcsXG4gICAgICAgICAgdGV4dDogJ0NvbXBpbGVkJyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1J1bnMgdGhlIEVuZ2xpc2ggc2ltdWxhdGlvbiBmcm9tIHRoZSBidWlsZC9waGV0LyBkaXJlY3RvcnkgKGJ1aWx0IGZyb20gY2hpcHBlciknLFxuICAgICAgICAgIHVybDogYC4uLyR7cmVwb30vYnVpbGQvcGhldC8ke3JlcG99X2VuX3BoZXQuaHRtbGAsXG4gICAgICAgICAgcXVlcnlQYXJhbWV0ZXJzOiBzaW1RdWVyeVBhcmFtZXRlcnNcbiAgICAgICAgfSApO1xuICAgICAgICBtb2Rlcy5wdXNoKCB7XG4gICAgICAgICAgbmFtZTogJ2NvbXBpbGVkWEhUTUwnLFxuICAgICAgICAgIHRleHQ6ICdDb21waWxlZCBYSFRNTCcsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdSdW5zIHRoZSBFbmdsaXNoIHNpbXVsYXRpb24gZnJvbSB0aGUgYnVpbGQvcGhldC94aHRtbCBkaXJlY3RvcnkgKGJ1aWx0IGZyb20gY2hpcHBlciknLFxuICAgICAgICAgIHVybDogYC4uLyR7cmVwb30vYnVpbGQvcGhldC94aHRtbC8ke3JlcG99X2FsbC54aHRtbGAsXG4gICAgICAgICAgcXVlcnlQYXJhbWV0ZXJzOiBzaW1RdWVyeVBhcmFtZXRlcnNcbiAgICAgICAgfSApO1xuICAgICAgICBtb2Rlcy5wdXNoKCB7XG4gICAgICAgICAgbmFtZTogJ3Byb2R1Y3Rpb24nLFxuICAgICAgICAgIHRleHQ6ICdQcm9kdWN0aW9uJyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1J1bnMgdGhlIGxhdGVzdCBFbmdsaXNoIHNpbXVsYXRpb24gZnJvbSB0aGUgcHJvZHVjdGlvbiBzZXJ2ZXInLFxuICAgICAgICAgIHVybDogYGh0dHBzOi8vcGhldC5jb2xvcmFkby5lZHUvc2ltcy9odG1sLyR7cmVwb30vbGF0ZXN0LyR7cmVwb31fYWxsLmh0bWxgLFxuICAgICAgICAgIHF1ZXJ5UGFyYW1ldGVyczogc2ltUXVlcnlQYXJhbWV0ZXJzXG4gICAgICAgIH0gKTtcbiAgICAgICAgbW9kZXMucHVzaCgge1xuICAgICAgICAgIG5hbWU6ICdzcG90JyxcbiAgICAgICAgICB0ZXh0OiAnRGV2IChiYXllcyknLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTG9hZHMgdGhlIGxvY2F0aW9uIG9uIHBoZXQtZGV2LmNvbG9yYWRvLmVkdSB3aXRoIHZlcnNpb25zIGZvciBlYWNoIGRldiBkZXBsb3knLFxuICAgICAgICAgIHVybDogYGh0dHBzOi8vcGhldC1kZXYuY29sb3JhZG8uZWR1L2h0bWwvJHtyZXBvfWBcbiAgICAgICAgfSApO1xuXG4gICAgICAgIC8vIENvbG9yIHBpY2tlciBVSVxuICAgICAgICBtb2Rlcy5wdXNoKCB7XG4gICAgICAgICAgbmFtZTogJ2NvbG9ycycsXG4gICAgICAgICAgdGV4dDogJ0NvbG9yIEVkaXRvcicsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdSdW5zIHRoZSB0b3AtbGV2ZWwgLWNvbG9ycy5odG1sIGZpbGUgKGFsbG93cyBlZGl0aW5nL3ZpZXdpbmcgZGlmZmVyZW50IHByb2ZpbGUgY29sb3JzKScsXG4gICAgICAgICAgdXJsOiBgY29sb3ItZWRpdG9yLmh0bWw/c2ltPSR7cmVwb31gLFxuICAgICAgICAgIHF1ZXJ5UGFyYW1ldGVyczogWyBwaGV0QnJhbmRRdWVyeVBhcmFtZXRlciBdXG4gICAgICAgIH0gKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCByZXBvID09PSAnc2NlbmVyeScgKSB7XG4gICAgICAgIG1vZGVzLnB1c2goIHtcbiAgICAgICAgICBuYW1lOiAnaW5zcGVjdG9yJyxcbiAgICAgICAgICB0ZXh0OiAnSW5zcGVjdG9yJyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc3BsYXlzIHNhdmVkIFNjZW5lcnkgc25hcHNob3RzJyxcbiAgICAgICAgICB1cmw6IGAuLi8ke3JlcG99L3Rlc3RzL2luc3BlY3Rvci5odG1sYFxuICAgICAgICB9ICk7XG4gICAgICB9XG5cbiAgICAgIGlmICggcmVwbyA9PT0gJ3BoZXQtaW8nICkge1xuICAgICAgICBtb2Rlcy5wdXNoKCB7XG4gICAgICAgICAgbmFtZTogJ3Rlc3Qtc3R1ZGlvLXNpbXMnLFxuICAgICAgICAgIHRleHQ6ICdGdXp6IFRlc3QgU3R1ZGlvIFdyYXBwZXInLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUnVucyBhdXRvbWF0ZWQgdGVzdGluZyB3aXRoIGZ1enppbmcgb24gc3R1ZGlvLCAxNSBzZWNvbmQgdGltZXInLFxuICAgICAgICAgIHVybDogJy4uL2FxdWEvZnV6ei1saWdodHllYXIvJyxcbiAgICAgICAgICBxdWVyeVBhcmFtZXRlcnM6IGdldEZ1enpMaWdodHllYXJQYXJhbWV0ZXJzKCAxNTAwMCApLmNvbmNhdCggWyB7XG4gICAgICAgICAgICB2YWx1ZTogYGZ1enomd3JhcHBlck5hbWU9c3R1ZGlvJndyYXBwZXJDb250aW51b3VzVGVzdD0lN0IlN0QmcmVwb3M9JHtwaGV0aW9TaW1zLmpvaW4oICcsJyApfWAsXG4gICAgICAgICAgICB0ZXh0OiAnRnV6eiBUZXN0IFBoRVQtSU8gc2ltcycsXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgfSBdIClcbiAgICAgICAgfSApO1xuICAgICAgICBtb2Rlcy5wdXNoKCB7XG4gICAgICAgICAgbmFtZTogJ3Rlc3QtbWlncmF0aW9uLXNpbXMnLFxuICAgICAgICAgIHRleHQ6ICdGdXp6IFRlc3QgTWlncmF0aW9uJyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1J1bnMgYXV0b21hdGVkIHRlc3Rpbmcgd2l0aCBmdXp6aW5nIG9uIHN0dWRpbywgMTAgc2Vjb25kIHRpbWVyJyxcbiAgICAgICAgICB1cmw6ICcuLi9hcXVhL2Z1enotbGlnaHR5ZWFyLycsXG4gICAgICAgICAgcXVlcnlQYXJhbWV0ZXJzOiBnZXRGdXp6TGlnaHR5ZWFyUGFyYW1ldGVycyggMjAwMDAgKS5jb25jYXQoIG1pZ3JhdGlvblF1ZXJ5UGFyYW1ldGVycyApLmNvbmNhdCggWyB7XG4gICAgICAgICAgICB2YWx1ZTogJ2Z1enomd3JhcHBlck5hbWU9bWlncmF0aW9uJndyYXBwZXJDb250aW51b3VzVGVzdD0lN0IlN0QmbWlncmF0aW9uUmF0ZT0yMDAwJicgK1xuICAgICAgICAgICAgICAgICAgIGBwaGV0aW9NaWdyYXRpb25SZXBvcnQ9YXNzZXJ0JnJlcG9zPSR7cGhldGlvSHlkcm9nZW5TaW1zLm1hcCggc2ltRGF0YSA9PiBzaW1EYXRhLnNpbSApLmpvaW4oICcsJyApfWAsXG4gICAgICAgICAgICB0ZXh0OiAnRnV6eiBUZXN0IFBoRVQtSU8gc2ltcycsXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgfSBdIClcbiAgICAgICAgfSApO1xuICAgICAgICBtb2Rlcy5wdXNoKCB7XG4gICAgICAgICAgbmFtZTogJ3Rlc3Qtc3RhdGUtc2ltcycsXG4gICAgICAgICAgdGV4dDogJ0Z1enogVGVzdCBTdGF0ZSBXcmFwcGVyJyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1J1bnMgYXV0b21hdGVkIHRlc3Rpbmcgd2l0aCBmdXp6aW5nIG9uIHN0YXRlLCAxNSBzZWNvbmQgdGltZXInLFxuICAgICAgICAgIHVybDogJy4uL2FxdWEvZnV6ei1saWdodHllYXIvJyxcbiAgICAgICAgICBxdWVyeVBhcmFtZXRlcnM6IGdldEZ1enpMaWdodHllYXJQYXJhbWV0ZXJzKCAxNTAwMCApLmNvbmNhdCggWyB7XG4gICAgICAgICAgICB2YWx1ZTogYGZ1enomd3JhcHBlck5hbWU9c3RhdGUmc2V0U3RhdGVSYXRlPTMwMDAmd3JhcHBlckNvbnRpbnVvdXNUZXN0PSU3QiU3RCZyZXBvcz0ke3BoZXRpb1NpbXMuam9pbiggJywnICl9YCxcbiAgICAgICAgICAgIHRleHQ6ICdGdXp6IFRlc3QgUGhFVC1JTyBzaW1zJyxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICB9IF0gKVxuICAgICAgICB9ICk7XG4gICAgICB9XG5cbiAgICAgIGlmICggcmVwbyA9PT0gJ3BoZXQtaW8td2Vic2l0ZScgKSB7XG4gICAgICAgIG1vZGVzLnB1c2goIHtcbiAgICAgICAgICBuYW1lOiAndmlld1Jvb3QnLFxuICAgICAgICAgIHRleHQ6ICdWaWV3IExvY2FsJyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ3ZpZXcgdGhlIGxvY2FsIHJvb24gb2YgdGhlIHdlYnNpdGUnLFxuICAgICAgICAgIHVybDogYC4uLyR7cmVwb30vcm9vdC9gXG4gICAgICAgIH0gKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCBoYXNVbml0VGVzdHMgKSB7XG4gICAgICAgIG1vZGVzLnB1c2goIHtcbiAgICAgICAgICBuYW1lOiAndW5pdFRlc3RzVW5idWlsdCcsXG4gICAgICAgICAgdGV4dDogJ1VuaXQgVGVzdHMgKHVuYnVpbHQpJyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1J1bnMgdW5pdCB0ZXN0cyBpbiB1bmJ1aWx0IG1vZGUnLFxuICAgICAgICAgIHVybDogYC4uLyR7cmVwb30vJHtyZXBvfS10ZXN0cy5odG1sYCxcbiAgICAgICAgICBxdWVyeVBhcmFtZXRlcnM6IFtcbiAgICAgICAgICAgIGVhUXVlcnlQYXJhbWV0ZXIsXG4gICAgICAgICAgICB7IHZhbHVlOiAnYnJhbmQ9cGhldC1pbycsIHRleHQ6ICdQaEVULWlPIEJyYW5kJywgZGVmYXVsdDogcmVwbyA9PT0gJ3BoZXQtaW8nIHx8IHJlcG8gPT09ICd0YW5kZW0nIHx8IHJlcG8gPT09ICdwaGV0LWlvLXdyYXBwZXJzJyB9LFxuICAgICAgICAgICAgLi4uKCByZXBvID09PSAncGhldC1pby13cmFwcGVycycgPyBbIHsgdmFsdWU6ICdzaW09Z3Jhdml0eS1hbmQtb3JiaXRzJywgdGV4dDogJ25lZWRlZFRlc3RQYXJhbXMnLCBkZWZhdWx0OiB0cnVlIH0gXSA6IFtdIClcbiAgICAgICAgICBdXG4gICAgICAgIH0gKTtcbiAgICAgIH1cbiAgICAgIGlmICggZG9jUmVwb3MuaW5jbHVkZXMoIHJlcG8gKSApIHtcbiAgICAgICAgbW9kZXMucHVzaCgge1xuICAgICAgICAgIG5hbWU6ICdkb2N1bWVudGF0aW9uJyxcbiAgICAgICAgICB0ZXh0OiAnRG9jdW1lbnRhdGlvbicsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdCcm93c2UgSFRNTCBkb2N1bWVudGF0aW9uJyxcbiAgICAgICAgICB1cmw6IGAuLi8ke3JlcG99L2RvYyR7cmVwbyA9PT0gJ2JpbmRlcicgPyAncycgOiAnJ30vYFxuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgICBpZiAoIHJlcG8gPT09ICdzY2VuZXJ5JyApIHtcbiAgICAgICAgbW9kZXMucHVzaCgge1xuICAgICAgICAgIG5hbWU6ICdsYXlvdXQtZG9jdW1lbnRhdGlvbicsXG4gICAgICAgICAgdGV4dDogJ0xheW91dCBEb2N1bWVudGF0aW9uJyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0Jyb3dzZSBIVE1MIGxheW91dCBkb2N1bWVudGF0aW9uJyxcbiAgICAgICAgICB1cmw6IGAuLi8ke3JlcG99L2RvYy9sYXlvdXQuaHRtbGBcbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgICAgaWYgKCByZXBvID09PSAnc2NlbmVyeScgfHwgcmVwbyA9PT0gJ2tpdGUnIHx8IHJlcG8gPT09ICdkb3QnICkge1xuICAgICAgICBtb2Rlcy5wdXNoKCB7XG4gICAgICAgICAgbmFtZTogJ2V4YW1wbGVzJyxcbiAgICAgICAgICB0ZXh0OiAnRXhhbXBsZXMnLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQnJvd3NlIEV4YW1wbGVzJyxcbiAgICAgICAgICB1cmw6IGAuLi8ke3JlcG99L2V4YW1wbGVzL2BcbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgICAgaWYgKCByZXBvID09PSAnc2NlbmVyeScgfHwgcmVwbyA9PT0gJ2tpdGUnIHx8IHJlcG8gPT09ICdkb3QnIHx8IHJlcG8gPT09ICdwaGV0LWNvcmUnICkge1xuICAgICAgICBtb2Rlcy5wdXNoKCB7XG4gICAgICAgICAgbmFtZTogJ3BsYXlncm91bmQnLFxuICAgICAgICAgIHRleHQ6ICdQbGF5Z3JvdW5kJyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogYExvYWRzICR7cmVwb30gYW5kIGRlcGVuZGVuY2llcyBpbiB0aGUgdGFiLCBhbmQgYWxsb3dzIHF1aWNrIHRlc3RpbmdgLFxuICAgICAgICAgIHVybDogYC4uLyR7cmVwb30vdGVzdHMvcGxheWdyb3VuZC5odG1sYFxuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgICBpZiAoIHJlcG8gPT09ICdzY2VuZXJ5JyApIHtcbiAgICAgICAgbW9kZXMucHVzaCgge1xuICAgICAgICAgIG5hbWU6ICdzYW5kYm94JyxcbiAgICAgICAgICB0ZXh0OiAnU2FuZGJveCcsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdBbGxvd3MgcXVpY2sgdGVzdGluZyBvZiBTY2VuZXJ5IGZlYXR1cmVzJyxcbiAgICAgICAgICB1cmw6IGAuLi8ke3JlcG99L3Rlc3RzL3NhbmRib3guaHRtbGBcbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgICAgaWYgKCByZXBvID09PSAnY2hpcHBlcicgfHwgcmVwbyA9PT0gJ2FxdWEnICkge1xuICAgICAgICBtb2Rlcy5wdXNoKCB7XG4gICAgICAgICAgbmFtZTogJ3Rlc3QtcGhldC1zaW1zJyxcbiAgICAgICAgICB0ZXh0OiAnRnV6eiBUZXN0IFBoRVQgU2ltcycsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdSdW5zIGF1dG9tYXRlZCB0ZXN0aW5nIHdpdGggZnV6emluZywgMTAgc2Vjb25kIHRpbWVyJyxcbiAgICAgICAgICB1cmw6ICcuLi9hcXVhL2Z1enotbGlnaHR5ZWFyLycsXG4gICAgICAgICAgcXVlcnlQYXJhbWV0ZXJzOiBnZXRGdXp6TGlnaHR5ZWFyUGFyYW1ldGVycygpLmNvbmNhdCggWyB7XG4gICAgICAgICAgICB2YWx1ZTogJ2JyYW5kPXBoZXQmZnV6eicsXG4gICAgICAgICAgICB0ZXh0OiAnRnV6eiBQaEVUIHNpbXMnLFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgIH0gXSApXG4gICAgICAgIH0gKTtcbiAgICAgICAgbW9kZXMucHVzaCgge1xuICAgICAgICAgIG5hbWU6ICd0ZXN0LXBoZXQtaW8tc2ltcycsXG4gICAgICAgICAgdGV4dDogJ0Z1enogVGVzdCBQaEVULWlPIFNpbXMnLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUnVucyBhdXRvbWF0ZWQgdGVzdGluZyB3aXRoIGZ1enppbmcsIDEwIHNlY29uZCB0aW1lcicsXG4gICAgICAgICAgdXJsOiAnLi4vYXF1YS9mdXp6LWxpZ2h0eWVhci8nLFxuICAgICAgICAgIHF1ZXJ5UGFyYW1ldGVyczogZ2V0RnV6ekxpZ2h0eWVhclBhcmFtZXRlcnMoKS5jb25jYXQoIFsge1xuICAgICAgICAgICAgdmFsdWU6ICdicmFuZD1waGV0LWlvJmZ1enomcGhldGlvU3RhbmRhbG9uZScsXG4gICAgICAgICAgICB0ZXh0OiAnRnV6eiBQaEVULUlPIGJyYW5kJyxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICB2YWx1ZTogYHJlcG9zPSR7cGhldGlvU2ltcy5qb2luKCAnLCcgKX1gLFxuICAgICAgICAgICAgdGV4dDogJ1Rlc3Qgb25seSBQaEVULWlPIHNpbXMnLFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgIH0gXSApXG4gICAgICAgIH0gKTtcbiAgICAgICAgbW9kZXMucHVzaCgge1xuICAgICAgICAgIG5hbWU6ICd0ZXN0LWludGVyYWN0aXZlLWRlc2NyaXB0aW9uLXNpbXMnLFxuICAgICAgICAgIHRleHQ6ICdGdXp6IFRlc3QgSW50ZXJhY3RpdmUgRGVzY3JpcHRpb24gU2ltcycsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdSdW5zIGF1dG9tYXRlZCB0ZXN0aW5nIHdpdGggZnV6emluZywgMTAgc2Vjb25kIHRpbWVyJyxcbiAgICAgICAgICB1cmw6ICcuLi9hcXVhL2Z1enotbGlnaHR5ZWFyLycsXG5cbiAgICAgICAgICAvLyBvbmx5IG9uZSBmdXp6ZXIgYmVjYXVzZSB0d28gaWZyYW1lcyBjYW5ub3QgYm90aCByZWNlaXZlIGZvY3VzL2JsdXIgZXZlbnRzXG4gICAgICAgICAgcXVlcnlQYXJhbWV0ZXJzOiBnZXRGdXp6TGlnaHR5ZWFyUGFyYW1ldGVycyggMTAwMDAsIHRydWUsIGZhbHNlICkuY29uY2F0KCBbXG4gICAgICAgICAgICBwaGV0QnJhbmRRdWVyeVBhcmFtZXRlciwge1xuICAgICAgICAgICAgICB2YWx1ZTogJ2Z1enpCb2FyZCZzdXBwb3J0c0ludGVyYWN0aXZlRGVzY3JpcHRpb249dHJ1ZScsXG4gICAgICAgICAgICAgIHRleHQ6ICdLZXlib2FyZCBGdXp6IFRlc3Qgc2ltcycsXG4gICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgdmFsdWU6ICdmdXp6JnN1cHBvcnRzSW50ZXJhY3RpdmVEZXNjcmlwdGlvbj10cnVlJyxcbiAgICAgICAgICAgICAgdGV4dDogJ05vcm1hbCBGdXp6IFRlc3Qgc2ltcydcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgdmFsdWU6IGByZXBvcz0ke2ludGVyYWN0aXZlRGVzY3JpcHRpb25TaW1zLmpvaW4oICcsJyApfWAsXG4gICAgICAgICAgICAgIHRleHQ6ICdUZXN0IG9ubHkgQTExeSBzaW1zJyxcbiAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSBdIClcbiAgICAgICAgfSApO1xuICAgICAgICBtb2Rlcy5wdXNoKCB7XG4gICAgICAgICAgbmFtZTogJ2Z1enotc2ltcy1sb2FkLW9ubHknLFxuICAgICAgICAgIHRleHQ6ICdMb2FkIFNpbXMnLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUnVucyBhdXRvbWF0ZWQgdGVzdGluZyB0aGF0IGp1c3QgbG9hZHMgc2ltcyAod2l0aG91dCBmdXp6aW5nIG9yIGJ1aWxkaW5nKScsXG4gICAgICAgICAgdXJsOiAnLi4vYXF1YS9mdXp6LWxpZ2h0eWVhci8nLFxuICAgICAgICAgIHF1ZXJ5UGFyYW1ldGVyczogZ2V0RnV6ekxpZ2h0eWVhclBhcmFtZXRlcnMoIDEwMDAwLCBmYWxzZSApLmNvbmNhdCggWyBwaGV0QnJhbmRRdWVyeVBhcmFtZXRlciBdIClcbiAgICAgICAgfSApO1xuICAgICAgICBtb2Rlcy5wdXNoKCB7XG4gICAgICAgICAgbmFtZTogJ2NvbnRpbnVvdXMtdGVzdGluZycsXG4gICAgICAgICAgdGV4dDogJ0NvbnRpbnVvdXMgVGVzdGluZycsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdMaW5rIHRvIHRoZSBjb250aW51b3VzIHRlc3Rpbmcgb24gQmF5ZXMuJyxcbiAgICAgICAgICB1cmw6ICdzcGFya3kuY29sb3JhZG8uZWR1L2NvbnRpbnVvdXMtdGVzdGluZy9hcXVhL2h0bWwvY29udGludW91cy1yZXBvcnQuaHRtbD9tYXhDb2x1bW5zPTEwJ1xuICAgICAgICB9ICk7XG4gICAgICAgIG1vZGVzLnB1c2goIHtcbiAgICAgICAgICBuYW1lOiAnY29udGludW91cy10ZXN0aW5nLWxvY2FsJyxcbiAgICAgICAgICB0ZXh0OiAnQ29udGludW91cyBUZXN0aW5nIChsb2NhbCB1bmJ1aWx0KScsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdMaW5rIHRvIHRoZSBjb250aW51b3VzIHRlc3Rpbmcgb24gQmF5ZXMuJyxcbiAgICAgICAgICB1cmw6ICcuLi9hcXVhL2h0bWwvY29udGludW91cy11bmJ1aWx0LXJlcG9ydC5odG1sP3NlcnZlcj1odHRwczovL3NwYXJreS5jb2xvcmFkby5lZHUvJm1heENvbHVtbnM9MTAnXG4gICAgICAgIH0gKTtcblxuICAgICAgICAvLyBTaGFyZWQgYnkgb2xkIGFuZCBtdWx0aSBzbmFwc2hvcCBjb21wYXJpc29uLlxuICAgICAgICBjb25zdCBzaGFyZWRDb21wYXJpc29uUXVlcnlQYXJhbWV0ZXJzOiBQaGV0bWFya3NRdWVyeVBhcmFtZXRlcltdID0gW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHZhbHVlOiAnc2ltU2VlZD0xMjMnLFxuICAgICAgICAgICAgdGV4dDogJ0N1c3RvbSBzZWVkIChkZWZhdWx0cyB0byBhIG5vbiByYW5kb20gdmFsdWUpJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdmFsdWU6IGBzaW1XaWR0aD0kezEwMjQgLyAyfWAsXG4gICAgICAgICAgICB0ZXh0OiAnTGFyZ2VyIHNpbSB3aWR0aCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHZhbHVlOiBgc2ltSGVpZ2h0PSR7NzY4IC8gMn1gLFxuICAgICAgICAgICAgdGV4dDogJ0xhcmdlciBzaW0gaGVpZ2h0J1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdmFsdWU6ICdudW1GcmFtZXM9MzAnLFxuICAgICAgICAgICAgdGV4dDogJ21vcmUgY29tcGFyaXNvbiBmcmFtZXMnXG4gICAgICAgICAgfVxuICAgICAgICBdO1xuICAgICAgICBtb2Rlcy5wdXNoKCB7XG4gICAgICAgICAgbmFtZTogJ3NuYXBzaG90LWNvbXBhcmlzb24nLFxuICAgICAgICAgIHRleHQ6ICdTbmFwc2hvdCBDb21wYXJpc29uJyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NldHMgdXAgc25hcHNob3Qgc2NyZWVuc2hvdCBjb21wYXJpc29uIHRoYXQgY2FuIGJlIHJ1biBvbiBkaWZmZXJlbnQgU0hBcycsXG4gICAgICAgICAgdXJsOiAnLi4vYXF1YS9odG1sL3NuYXBzaG90LWNvbXBhcmlzb24uaHRtbCcsXG4gICAgICAgICAgcXVlcnlQYXJhbWV0ZXJzOiBbXG4gICAgICAgICAgICBlYVF1ZXJ5UGFyYW1ldGVyLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB2YWx1ZTogJ3JlcG9zPWRlbnNpdHksYnVveWFuY3knLFxuICAgICAgICAgICAgICB0ZXh0OiAnU2ltcyB0byBjb21wYXJlJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdmFsdWU6ICdyYW5kb21TaW1zPTEwJyxcbiAgICAgICAgICAgICAgdGV4dDogJ1Rlc3QgYSByYW5kb20gbnVtYmVyIG9mIHNpbXMnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLi4uc2hhcmVkQ29tcGFyaXNvblF1ZXJ5UGFyYW1ldGVycyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdmFsdWU6ICdzaW1RdWVyeVBhcmFtZXRlcnM9ZWEnLFxuICAgICAgICAgICAgICB0ZXh0OiAnc2ltIGZyYW1lIHBhcmFtZXRlcnMnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB2YWx1ZTogJ3Nob3dUaW1lJyxcbiAgICAgICAgICAgICAgdGV4dDogJ3Nob3cgdGltZSB0YWtlbiBmb3IgZWFjaCBzbnBhc2hvdCcsXG4gICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdmFsdWU6ICdjb21wYXJlRGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgICB0ZXh0OiAnY29tcGFyZSBkZXNjcmlwdGlvbiBQRE9NIGFuZCB0ZXh0IHRvbycsXG4gICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIF1cbiAgICAgICAgfSApO1xuICAgICAgICBtb2Rlcy5wdXNoKCB7XG4gICAgICAgICAgbmFtZTogJ211bHRpLXNuYXBzaG90LWNvbXBhcmlzb24nLFxuICAgICAgICAgIHRleHQ6ICdNdWx0aS1zbmFwc2hvdCBDb21wYXJpc29uJyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NldHMgdXAgc25hcHNob3Qgc2NyZWVuc2hvdCBjb21wYXJpc29uIGZvciB0d28gZGlmZmVyZW50IGNoZWNrb3V0cycsXG4gICAgICAgICAgdXJsOiAnLi4vYXF1YS9odG1sL211bHRpLXNuYXBzaG90LWNvbXBhcmlzb24uaHRtbCcsXG4gICAgICAgICAgcXVlcnlQYXJhbWV0ZXJzOiBbXG4gICAgICAgICAgICBlYVF1ZXJ5UGFyYW1ldGVyLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB2YWx1ZTogJ3JlcG9zPWRlbnNpdHksYnVveWFuY3knLFxuICAgICAgICAgICAgICB0ZXh0OiAnU2ltcyB0byBjb21wYXJlJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdmFsdWU6ICd1cmxzPWh0dHA6Ly9sb2NhbGhvc3QsaHR0cDovL2xvY2FsaG9zdDo4MDgwJyxcbiAgICAgICAgICAgICAgdGV4dDogJ1Rlc3RpbmcgdXJscycsXG4gICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAuLi5zaGFyZWRDb21wYXJpc29uUXVlcnlQYXJhbWV0ZXJzLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB2YWx1ZTogJ3Rlc3RQaGV0aW8nLFxuICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICAgIHRleHQ6ICdUZXN0IFBoRVQtaU8gQnJhbmQnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB2YWx1ZTogJ3NpbVF1ZXJ5UGFyYW1ldGVycz1lYScsXG4gICAgICAgICAgICAgIHRleHQ6ICdzaW0gcGFyYW1ldGVycyAobm90ID9icmFuZCknLFxuICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB2YWx1ZTogJ2NvcGllcz0xJyxcbiAgICAgICAgICAgICAgdGV4dDogJ0lGcmFtZXMgcGVyIGNvbHVtbidcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdXG4gICAgICAgIH0gKTtcbiAgICAgIH1cbiAgICAgIGlmICggcmVwbyA9PT0gJ3lvdHRhJyApIHtcbiAgICAgICAgbW9kZXMucHVzaCgge1xuICAgICAgICAgIG5hbWU6ICd5b3R0YS1zdGF0aXN0aWNzJyxcbiAgICAgICAgICB0ZXh0OiAnU3RhdGlzdGljcyBwYWdlJyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0dvZXMgdG8gdGhlIHlvdHRhIHJlcG9ydCBwYWdlLCBjcmVkZW50aWFscyBpbiB0aGUgR29vZ2xlIERvYycsXG4gICAgICAgICAgdXJsOiAnaHR0cHM6Ly9iYXllcy5jb2xvcmFkby5lZHUvc3RhdGlzdGljcy95b3R0YS8nXG4gICAgICAgIH0gKTtcbiAgICAgIH1cbiAgICAgIGlmICggcmVwbyA9PT0gJ3NraWZmbGUnICkge1xuICAgICAgICBtb2Rlcy5wdXNoKCB7XG4gICAgICAgICAgbmFtZTogJ3NvdW5kLWJvYXJkJyxcbiAgICAgICAgICB0ZXh0OiAnU291bmQgQm9hcmQnLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnSW50ZXJhY3RpdmUgSFRNTCBwYWdlIGZvciBleHBsb3JpbmcgZXhpc3Rpbmcgc291bmRzIGluIHNpbXMgYW5kIGNvbW1vbiBjb2RlJyxcbiAgICAgICAgICB1cmw6ICcuLi9za2lmZmxlL2h0bWwvc291bmQtYm9hcmQuaHRtbCdcbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgICAgaWYgKCByZXBvID09PSAncXVha2UnICkge1xuICAgICAgICBtb2Rlcy5wdXNoKCB7XG4gICAgICAgICAgbmFtZTogJ3F1YWtlLWJ1aWx0JyxcbiAgICAgICAgICB0ZXh0OiAnSGFwdGljcyBQbGF5Z3JvdW5kIChidWlsdCBmb3IgYnJvd3NlciknLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQnVpbHQgYnJvd3NlciB2ZXJzaW9uIG9mIHRoZSBIYXB0aWNzIFBsYXlncm91bmQgYXBwJyxcbiAgICAgICAgICB1cmw6ICcuLi9xdWFrZS9wbGF0Zm9ybXMvYnJvd3Nlci93d3cvaGFwdGljcy1wbGF5Z3JvdW5kLmh0bWwnXG4gICAgICAgIH0gKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCByZXBvID09PSAncGhldHRlc3QnICkge1xuICAgICAgICBtb2Rlcy5wdXNoKCB7XG4gICAgICAgICAgbmFtZTogJ3BoZXR0ZXN0JyxcbiAgICAgICAgICB0ZXh0OiAnUGhFVCBUZXN0JyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ2xvY2FsIHZlcnNpb24gb2YgcGhldHRlc3QgcG9pbnRpbmcgdG8gdGhlIHNlcnZlciBvbiBiYXllcycsXG4gICAgICAgICAgdXJsOiAnLi4vcGhldHRlc3QvJ1xuICAgICAgICB9ICk7XG4gICAgICB9XG5cbiAgICAgIGlmICggc3VwcG9ydHNJbnRlcmFjdGl2ZURlc2NyaXB0aW9uICkge1xuICAgICAgICBtb2Rlcy5wdXNoKCB7XG4gICAgICAgICAgbmFtZTogJ2ExMXktdmlldycsXG4gICAgICAgICAgdGV4dDogJ0ExMXkgVmlldycsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdSdW5zIHRoZSBzaW11bGF0aW9uIGluIGFuIGlmcmFtZSBuZXh0IHRvIGEgY29weSBvZiB0aGUgUERPTSB0b3QgZWFzaWx5IGluc3BlY3QgYWNjZXNzaWJsZSBjb250ZW50LicsXG4gICAgICAgICAgdXJsOiBgLi4vJHtyZXBvfS8ke3JlcG99X2ExMXlfdmlldy5odG1sYCxcbiAgICAgICAgICBxdWVyeVBhcmFtZXRlcnM6IGRldlNpbVF1ZXJ5UGFyYW1ldGVycy5jb25jYXQoIHNpbVF1ZXJ5UGFyYW1ldGVycyApXG4gICAgICAgIH0gKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCByZXBvID09PSAnaW50ZXJhY3Rpb24tZGFzaGJvYXJkJyApIHtcbiAgICAgICAgbW9kZXMucHVzaCgge1xuICAgICAgICAgIG5hbWU6ICdwcmVwcm9jZXNzb3InLFxuICAgICAgICAgIHRleHQ6ICdQcmVwcm9jZXNzb3InLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTG9hZCB0aGUgcHJlcHJvY2Vzc29yIGZvciBwYXJzaW5nIGRhdGEgbG9ncyBkb3duIHRvIGEgc2l6ZSB0aGF0IGNhbiBiZSB1c2VkIGJ5IHRoZSBzaW11bGF0aW9uLicsXG4gICAgICAgICAgdXJsOiBgLi4vJHtyZXBvfS9wcmVwcm9jZXNzb3IuaHRtbGAsXG4gICAgICAgICAgcXVlcnlQYXJhbWV0ZXJzOiBbIGVhUXVlcnlQYXJhbWV0ZXIsIHtcbiAgICAgICAgICAgIHZhbHVlOiAncGFyc2VYPTEwJyxcbiAgICAgICAgICAgIHRleHQ6ICdUZXN0IG9ubHkgMTAgc2Vzc2lvbnMnXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgdmFsdWU6ICdmb3JTcHJlYWRzaGVldCcsXG4gICAgICAgICAgICB0ZXh0OiAnQ3JlYXRlIG91dHB1dCBmb3IgYSBzcHJlYWRzaGVldC4nXG4gICAgICAgICAgfSBdXG4gICAgICAgIH0gKTtcbiAgICAgIH1cblxuICAgICAgbW9kZXMucHVzaCgge1xuICAgICAgICBuYW1lOiAnZ2l0aHViJyxcbiAgICAgICAgdGV4dDogJ0dpdEh1YicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnT3BlbnMgdG8gdGhlIHJlcG9zaXRvcnlcXCdzIEdpdEh1YiBtYWluIHBhZ2UnLFxuICAgICAgICB1cmw6IGBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvJHtyZXBvfWBcbiAgICAgIH0gKTtcbiAgICAgIG1vZGVzLnB1c2goIHtcbiAgICAgICAgbmFtZTogJ2lzc3VlcycsXG4gICAgICAgIHRleHQ6ICdJc3N1ZXMnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ09wZW5zIHRvIHRoZSByZXBvc2l0b3J5XFwncyBHaXRIdWIgaXNzdWVzIHBhZ2UnLFxuICAgICAgICB1cmw6IGBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvJHtyZXBvfS9pc3N1ZXNgXG4gICAgICB9ICk7XG5cbiAgICAgIC8vIGlmIGEgcGhldC1pbyBzaW0sIHRoZW4gYWRkIHRoZSB3cmFwcGVycyB0byB0aGVtXG4gICAgICBpZiAoIGlzUGhldGlvICkge1xuXG4gICAgICAgIC8vIEFkZCB0aGUgY29uc29sZSBsb2dnaW5nLCBub3QgYSB3cmFwcGVyIGJ1dCBuaWNlIHRvIGhhdmVcbiAgICAgICAgbW9kZXMucHVzaCgge1xuICAgICAgICAgIG5hbWU6ICdvbmUtc2ltLXdyYXBwZXItdGVzdHMnLFxuICAgICAgICAgIHRleHQ6ICdXcmFwcGVyIFVuaXQgVGVzdHMnLFxuICAgICAgICAgIGdyb3VwOiAnUGhFVC1pTycsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdUZXN0IHRoZSBQaEVULWlPIEFQSSBmb3IgdGhpcyBzaW0uJyxcblxuICAgICAgICAgIC8vIEVhY2ggc2ltIGdldHMgaXRzIG93biB0ZXN0LCBqdXN0IHJ1biBzaW0tbGVzcyB0ZXN0cyBoZXJlXG4gICAgICAgICAgdXJsOiBgLi4vcGhldC1pby13cmFwcGVycy9waGV0LWlvLXdyYXBwZXJzLXRlc3RzLmh0bWw/c2ltPSR7cmVwb31gLFxuICAgICAgICAgIHF1ZXJ5UGFyYW1ldGVyczogcGhldGlvV3JhcHBlclF1ZXJ5UGFyYW1ldGVyc1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgLy8gQWRkIGEgbGluayB0byB0aGUgY29tcGlsZWQgd3JhcHBlciBpbmRleDtcbiAgICAgICAgbW9kZXMucHVzaCgge1xuICAgICAgICAgIG5hbWU6ICdjb21waWxlZC1pbmRleCcsXG4gICAgICAgICAgdGV4dDogJ0NvbXBpbGVkIEluZGV4JyxcbiAgICAgICAgICBncm91cDogJ1BoRVQtaU8nLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUnVucyB0aGUgUGhFVC1pTyB3cmFwcGVyIGluZGV4IGZyb20gYnVpbGQvIGRpcmVjdG9yeSAoYnVpbHQgZnJvbSBjaGlwcGVyKScsXG4gICAgICAgICAgdXJsOiBgLi4vJHtyZXBvfS9idWlsZC9waGV0LWlvL2AsXG4gICAgICAgICAgcXVlcnlQYXJhbWV0ZXJzOiBwaGV0aW9XcmFwcGVyUXVlcnlQYXJhbWV0ZXJzXG4gICAgICAgIH0gKTtcblxuICAgICAgICBtb2Rlcy5wdXNoKCB7XG4gICAgICAgICAgbmFtZTogJ3N0YW5kYWxvbmUnLFxuICAgICAgICAgIHRleHQ6ICdTdGFuZGFsb25lJyxcbiAgICAgICAgICBncm91cDogJ1BoRVQtaU8nLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUnVucyB0aGUgc2ltIGluIHBoZXQtaW8gYnJhbmQgd2l0aCB0aGUgc3RhbmRhbG9uZSBxdWVyeSBwYXJhbWV0ZXInLFxuICAgICAgICAgIHVybDogYC4uLyR7cmVwb30vJHtyZXBvfV9lbi5odG1sP2JyYW5kPXBoZXQtaW8mcGhldGlvU3RhbmRhbG9uZWAsXG4gICAgICAgICAgcXVlcnlQYXJhbWV0ZXJzOiBwaGV0aW9TaW1RdWVyeVBhcmFtZXRlcnMuY29uY2F0KCBzaW1Ob0xvY2FsZXNRdWVyeVBhcmFtZXRlcnMgKVxuICAgICAgICB9ICk7XG5cbiAgICAgICAgY29uc3Qgc2ltU3BlY2lmaWNXcmFwcGVycyA9IHBoZXRpb1BhY2thZ2VKU09Oc1sgcmVwbyBdPy5waGV0WyAncGhldC1pbycgXT8ud3JhcHBlcnMgfHwgW107XG4gICAgICAgIGNvbnN0IGFsbFdyYXBwZXJzID0gd3JhcHBlcnMuY29uY2F0KCBub25QdWJsaXNoZWRQaGV0aW9XcmFwcGVyc1RvQWRkVG9QaGV0bWFya3MgKS5jb25jYXQoIHNpbVNwZWNpZmljV3JhcHBlcnMgKTtcblxuICAgICAgICAvLyBwaGV0LWlvIHdyYXBwZXJzXG4gICAgICAgIF8uc29ydEJ5KCBhbGxXcmFwcGVycywgZ2V0V3JhcHBlck5hbWUgKS5mb3JFYWNoKCB3cmFwcGVyID0+IHtcblxuICAgICAgICAgIGNvbnN0IHdyYXBwZXJOYW1lID0gZ2V0V3JhcHBlck5hbWUoIHdyYXBwZXIgKTtcblxuICAgICAgICAgIGxldCB1cmwgPSAnJztcblxuICAgICAgICAgIC8vIFByb2Nlc3MgZm9yIGRlZGljYXRlZCB3cmFwcGVyIHJlcG9zXG4gICAgICAgICAgaWYgKCB3cmFwcGVyLnN0YXJ0c1dpdGgoICdwaGV0LWlvLXdyYXBwZXItJyApICkge1xuXG4gICAgICAgICAgICAvLyBTcGVjaWFsIHVzZSBjYXNlIGZvciB0aGUgc29uaWZpY2F0aW9uIHdyYXBwZXJcbiAgICAgICAgICAgIHVybCA9IHdyYXBwZXJOYW1lID09PSAnc29uaWZpY2F0aW9uJyA/IGAuLi9waGV0LWlvLXdyYXBwZXItJHt3cmFwcGVyTmFtZX0vJHtyZXBvfS1zb25pZmljYXRpb24uaHRtbD9zaW09JHtyZXBvfWAgOlxuICAgICAgICAgICAgICAgICAgYC4uLyR7d3JhcHBlcn0vP3NpbT0ke3JlcG99YDtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gTG9hZCB0aGUgd3JhcHBlciB1cmxzIGZvciB0aGUgcGhldC1pby13cmFwcGVycy9cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHVybCA9IGAuLi8ke3dyYXBwZXJ9Lz9zaW09JHtyZXBvfWA7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gYWRkIHJlY29yZGluZyB0byB0aGUgY29uc29sZSBieSBkZWZhdWx0XG4gICAgICAgICAgaWYgKCB3cmFwcGVyID09PSAncGhldC1pby13cmFwcGVycy9yZWNvcmQnICkge1xuICAgICAgICAgICAgdXJsICs9ICcmY29uc29sZSc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGV0IHF1ZXJ5UGFyYW1ldGVyczogUGhldG1hcmtzUXVlcnlQYXJhbWV0ZXJbXSA9IFtdO1xuICAgICAgICAgIGlmICggd3JhcHBlck5hbWUgPT09ICdzdHVkaW8nICkge1xuXG4gICAgICAgICAgICAvLyBTbyB3ZSBkb24ndCBtdXRhdGUgdGhlIGNvbW1vbiBsaXN0XG4gICAgICAgICAgICBjb25zdCBzdHVkaW9RdWVyeVBhcmFtZXRlcnMgPSBbIC4uLnBoZXRpb1dyYXBwZXJRdWVyeVBhcmFtZXRlcnMgXTtcblxuICAgICAgICAgICAgLy8gU3R1ZGlvIGRlZmF1bHRzIHRvIHBoZXRpb0RlYnVnPXRydWUsIHNvIHRoaXMgcGFyYW1ldGVyIGNhbid0IGJlIG9uIGJ5IGRlZmF1bHRcbiAgICAgICAgICAgIF8ucmVtb3ZlKCBzdHVkaW9RdWVyeVBhcmFtZXRlcnMsIGl0ZW0gPT4gaXRlbSA9PT0gcGhldGlvRGVidWdUcnVlUGFyYW1ldGVyICk7XG5cbiAgICAgICAgICAgIHF1ZXJ5UGFyYW1ldGVycyA9IHN0dWRpb1F1ZXJ5UGFyYW1ldGVycy5jb25jYXQoIFsgcGhldGlvRGVidWdQYXJhbWV0ZXIsIHBoZXRpb0VsZW1lbnRzRGlzcGxheVBhcmFtZXRlciBdICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKCB3cmFwcGVyTmFtZSA9PT0gJ21pZ3JhdGlvbicgKSB7XG4gICAgICAgICAgICBxdWVyeVBhcmFtZXRlcnMgPSBbXG4gICAgICAgICAgICAgIC4uLm1pZ3JhdGlvblF1ZXJ5UGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgeyAuLi53ZWJHTFBhcmFtZXRlciwgZGVmYXVsdDogdHJ1ZSB9LCB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC9uby1vYmplY3Qtc3ByZWFkLW9uLW5vbi1saXRlcmFsc1xuICAgICAgICAgICAgICAgIHZhbHVlOiAncGhldGlvTWlncmF0aW9uUmVwb3J0JyxcbiAgICAgICAgICAgICAgICB0eXBlOiAncGFyYW1ldGVyVmFsdWVzJyxcbiAgICAgICAgICAgICAgICB0ZXh0OiAnSG93IHNob3VsZCB0aGUgbWlncmF0aW9uIHJlcG9ydCBiZSByZXBvcnRlZD8nLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlclZhbHVlczogWyAnZGV2JywgJ2NsaWVudCcsICd2ZXJib3NlJywgJ2Fzc2VydCcgXSxcbiAgICAgICAgICAgICAgICBvbWl0SWZEZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmICggd3JhcHBlck5hbWUgPT09ICdzdGF0ZScgKSB7XG4gICAgICAgICAgICBxdWVyeVBhcmFtZXRlcnMgPSBbIC4uLnBoZXRpb1dyYXBwZXJRdWVyeVBhcmFtZXRlcnMsIHtcbiAgICAgICAgICAgICAgdmFsdWU6ICdzZXRTdGF0ZVJhdGU9MTAwMCcsXG4gICAgICAgICAgICAgIHRleHQ6ICdDdXN0b21pemUgdGhlIFwic2V0IHN0YXRlXCIgcmF0ZSBmb3IgaG93IG9mdGVuIGEgc3RhdGUgaXMgc2V0IHRvIHRoZSBkb3duc3RyZWFtIHNpbSAoaW4gbXMpJyxcbiAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICB2YWx1ZTogJ2xvZ1RpbWluZycsXG4gICAgICAgICAgICAgIHRleHQ6ICdDb25zb2xlIGxvZyB0aGUgYW1vdW50IG9mIHRpbWUgaXQgdG9vayB0byBzZXQgdGhlIHN0YXRlIG9mIHRoZSBzaW11bGF0aW9uLidcbiAgICAgICAgICAgIH0gXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAoIHdyYXBwZXJOYW1lID09PSAncGxheWJhY2snICkge1xuICAgICAgICAgICAgcXVlcnlQYXJhbWV0ZXJzID0gW107XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcXVlcnlQYXJhbWV0ZXJzID0gcGhldGlvV3JhcHBlclF1ZXJ5UGFyYW1ldGVycztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBtb2Rlcy5wdXNoKCB7XG4gICAgICAgICAgICBuYW1lOiB3cmFwcGVyTmFtZSxcbiAgICAgICAgICAgIHRleHQ6IHdyYXBwZXJOYW1lLFxuICAgICAgICAgICAgZ3JvdXA6ICdQaEVULWlPJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBgUnVucyB0aGUgcGhldC1pbyB3cmFwcGVyICR7d3JhcHBlck5hbWV9YCxcbiAgICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgICAgcXVlcnlQYXJhbWV0ZXJzOiBxdWVyeVBhcmFtZXRlcnNcbiAgICAgICAgICB9ICk7XG4gICAgICAgIH0gKTtcblxuICAgICAgICAvLyBBZGQgdGhlIGNvbnNvbGUgbG9nZ2luZywgbm90IGEgd3JhcHBlciBidXQgbmljZSB0byBoYXZlXG4gICAgICAgIG1vZGVzLnB1c2goIHtcbiAgICAgICAgICBuYW1lOiAnY29sb3JpemVkJyxcbiAgICAgICAgICB0ZXh0OiAnRGF0YTogY29sb3JpemVkJyxcbiAgICAgICAgICBncm91cDogJ1BoRVQtaU8nLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnU2hvdyB0aGUgY29sb3JpemVkIGV2ZW50IGxvZyBpbiB0aGUgY29uc29sZSBvZiB0aGUgc3RhbmQgYWxvbmUgc2ltLicsXG4gICAgICAgICAgdXJsOiBgLi4vJHtyZXBvfS8ke3JlcG99X2VuLmh0bWw/YnJhbmQ9cGhldC1pbyZwaGV0aW9Db25zb2xlTG9nPWNvbG9yaXplZCZwaGV0aW9TdGFuZGFsb25lJnBoZXRpb0VtaXRIaWdoRnJlcXVlbmN5RXZlbnRzPWZhbHNlYCxcbiAgICAgICAgICBxdWVyeVBhcmFtZXRlcnM6IHBoZXRpb1NpbVF1ZXJ5UGFyYW1ldGVycy5jb25jYXQoIHNpbU5vTG9jYWxlc1F1ZXJ5UGFyYW1ldGVycyApXG4gICAgICAgIH0gKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICByZXR1cm4gbW9kZURhdGE7XG4gIH1cblxuICBmdW5jdGlvbiBjbGVhckNoaWxkcmVuKCBlbGVtZW50OiBIVE1MRWxlbWVudCApOiB2b2lkIHtcbiAgICB3aGlsZSAoIGVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGggKSB7IGVsZW1lbnQucmVtb3ZlQ2hpbGQoIGVsZW1lbnQuY2hpbGROb2Rlc1sgMCBdICk7IH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVJlcG9zaXRvcnlTZWxlY3RvciggcmVwb3NpdG9yaWVzOiBSZXBvTmFtZVtdICk6IFJlcG9TZWxlY3RvciB7XG4gICAgY29uc3Qgc2VsZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ3NlbGVjdCcgKTtcbiAgICBzZWxlY3QuYXV0b2ZvY3VzID0gdHJ1ZTtcbiAgICByZXBvc2l0b3JpZXMuZm9yRWFjaCggcmVwbyA9PiB7XG4gICAgICBjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnb3B0aW9uJyApO1xuICAgICAgb3B0aW9uLnZhbHVlID0gb3B0aW9uLmxhYmVsID0gb3B0aW9uLmlubmVySFRNTCA9IHJlcG87XG4gICAgICBzZWxlY3QuYXBwZW5kQ2hpbGQoIG9wdGlvbiApO1xuICAgIH0gKTtcblxuICAgIC8vIElFIG9yIG5vLXNjcm9sbEludG9WaWV3IHdpbGwgbmVlZCB0byBiZSBoZWlnaHQtbGltaXRlZFxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICBpZiAoIHNlbGVjdC5zY3JvbGxJbnRvVmlldyAmJiAhbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmNsdWRlcyggJ1RyaWRlbnQvJyApICkge1xuICAgICAgc2VsZWN0LnNldEF0dHJpYnV0ZSggJ3NpemUnLCBgJHtyZXBvc2l0b3JpZXMubGVuZ3RofWAgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBzZWxlY3Quc2V0QXR0cmlidXRlKCAnc2l6ZScsICczMCcgKTtcbiAgICB9XG5cbiAgICAvLyBTZWxlY3QgYSByZXBvc2l0b3J5IGlmIGl0J3MgYmVlbiBzdG9yZWQgaW4gbG9jYWxTdG9yYWdlIGJlZm9yZVxuICAgIGNvbnN0IHJlcG9LZXkgPSBzdG9yYWdlS2V5KCAncmVwbycgKTtcbiAgICBjb25zdCB2YWx1ZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCByZXBvS2V5ICk7XG4gICAgaWYgKCB2YWx1ZSApIHtcbiAgICAgIHNlbGVjdC52YWx1ZSA9IHZhbHVlO1xuICAgIH1cblxuICAgIHNlbGVjdC5mb2N1cygpO1xuXG4gICAgLy8gU2Nyb2xsIHRvIHRoZSBzZWxlY3RlZCBlbGVtZW50XG4gICAgZnVuY3Rpb24gdHJ5U2Nyb2xsKCk6IHZvaWQge1xuICAgICAgY29uc3QgZWxlbWVudCA9IHNlbGVjdC5jaGlsZE5vZGVzWyBzZWxlY3Quc2VsZWN0ZWRJbmRleCBdIGFzIEhUTUxFbGVtZW50O1xuXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgICBpZiAoIGVsZW1lbnQuc2Nyb2xsSW50b1ZpZXdJZk5lZWRlZCApIHtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgICBlbGVtZW50LnNjcm9sbEludG9WaWV3SWZOZWVkZWQoKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCBlbGVtZW50LnNjcm9sbEludG9WaWV3ICkge1xuICAgICAgICBlbGVtZW50LnNjcm9sbEludG9WaWV3KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoICdjaGFuZ2UnLCB0cnlTY3JvbGwgKTtcbiAgICAvLyBXZSBuZWVkIHRvIHdhaXQgZm9yIHRoaW5ncyB0byBsb2FkIGZ1bGx5IGJlZm9yZSBzY3JvbGxpbmcgKGluIENocm9tZSkuXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0bWFya3MvaXNzdWVzLzEzXG4gICAgc2V0VGltZW91dCggdHJ5U2Nyb2xsLCAwICk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgZWxlbWVudDogc2VsZWN0LFxuICAgICAgZ2V0IHZhbHVlKCkge1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gaXQgaXMgYW4gSFRNTEVsZW1lbnQsIG5vdCBqdXN0IGEgbm9kZVxuICAgICAgICByZXR1cm4gc2VsZWN0LmNoaWxkTm9kZXNbIHNlbGVjdC5zZWxlY3RlZEluZGV4IF0udmFsdWU7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZU1vZGVTZWxlY3RvciggbW9kZURhdGE6IE1vZGVEYXRhLCByZXBvc2l0b3J5U2VsZWN0b3I6IFJlcG9TZWxlY3RvciApOiBNb2RlU2VsZWN0b3Ige1xuICAgIGNvbnN0IHNlbGVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdzZWxlY3QnICk7XG5cbiAgICBjb25zdCBzZWxlY3RvciA9IHtcbiAgICAgIGVsZW1lbnQ6IHNlbGVjdCxcbiAgICAgIGdldCB2YWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHNlbGVjdC52YWx1ZTtcbiAgICAgIH0sXG4gICAgICBnZXQgbW9kZSgpIHtcbiAgICAgICAgY29uc3QgY3VycmVudE1vZGVOYW1lID0gc2VsZWN0b3IudmFsdWU7XG4gICAgICAgIHJldHVybiBfLmZpbHRlciggbW9kZURhdGFbIHJlcG9zaXRvcnlTZWxlY3Rvci52YWx1ZSBdLCBtb2RlID0+IHtcbiAgICAgICAgICByZXR1cm4gbW9kZS5uYW1lID09PSBjdXJyZW50TW9kZU5hbWU7XG4gICAgICAgIH0gKVsgMCBdO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCBzdG9yYWdlS2V5KCAncmVwbycgKSwgcmVwb3NpdG9yeVNlbGVjdG9yLnZhbHVlICk7XG5cbiAgICAgICAgY2xlYXJDaGlsZHJlbiggc2VsZWN0ICk7XG5cbiAgICAgICAgY29uc3QgZ3JvdXBzOiBQYXJ0aWFsPFJlY29yZDxNb2RlR3JvdXAsIEhUTUxPcHRHcm91cEVsZW1lbnQ+PiA9IHt9O1xuICAgICAgICBtb2RlRGF0YVsgcmVwb3NpdG9yeVNlbGVjdG9yLnZhbHVlIF0uZm9yRWFjaCggKCBjaG9pY2U6IE1vZGUgKSA9PiB7XG4gICAgICAgICAgY29uc3QgY2hvaWNlT3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ29wdGlvbicgKTtcbiAgICAgICAgICBjaG9pY2VPcHRpb24udmFsdWUgPSBjaG9pY2UubmFtZTtcbiAgICAgICAgICBjaG9pY2VPcHRpb24ubGFiZWwgPSBjaG9pY2UudGV4dDtcbiAgICAgICAgICBjaG9pY2VPcHRpb24udGl0bGUgPSBjaG9pY2UuZGVzY3JpcHRpb247XG4gICAgICAgICAgY2hvaWNlT3B0aW9uLmlubmVySFRNTCA9IGNob2ljZS50ZXh0O1xuXG4gICAgICAgICAgLy8gYWRkIHRvIGFuIGBvcHRncm91cGAgaW5zdGVhZCBvZiBoYXZpbmcgYWxsIG1vZGVzIG9uIHRoZSBgc2VsZWN0YFxuICAgICAgICAgIGNob2ljZS5ncm91cCA9IGNob2ljZS5ncm91cCB8fCAnR2VuZXJhbCc7XG5cbiAgICAgICAgICAvLyBjcmVhdGUgaWYgdGhlIGdyb3VwIGRvZXNuJ3QgZXhpc3RcbiAgICAgICAgICBpZiAoICFncm91cHNbIGNob2ljZS5ncm91cCBdICkge1xuICAgICAgICAgICAgY29uc3Qgb3B0R3JvdXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnb3B0Z3JvdXAnICk7XG4gICAgICAgICAgICBvcHRHcm91cC5sYWJlbCA9IGNob2ljZS5ncm91cDtcbiAgICAgICAgICAgIGdyb3Vwc1sgY2hvaWNlLmdyb3VwIF0gPSBvcHRHcm91cDtcbiAgICAgICAgICAgIHNlbGVjdC5hcHBlbmRDaGlsZCggb3B0R3JvdXAgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBhZGQgdGhlIGNob2ljZSB0byB0aGUgcHJvcGVydHkgZ3JvdXBcbiAgICAgICAgICBncm91cHNbIGNob2ljZS5ncm91cCBdIS5hcHBlbmRDaGlsZCggY2hvaWNlT3B0aW9uICk7XG4gICAgICAgIH0gKTtcblxuICAgICAgICBzZWxlY3Quc2V0QXR0cmlidXRlKCAnc2l6ZScsIG1vZGVEYXRhWyByZXBvc2l0b3J5U2VsZWN0b3IudmFsdWUgXS5sZW5ndGggKyBPYmplY3Qua2V5cyggZ3JvdXBzICkubGVuZ3RoICsgJycgKTtcbiAgICAgICAgaWYgKCBzZWxlY3Quc2VsZWN0ZWRJbmRleCA8IDAgKSB7XG4gICAgICAgICAgc2VsZWN0LnNlbGVjdGVkSW5kZXggPSAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBzZWxlY3RvcjtcbiAgfVxuXG4gIC8vIENyZWF0ZSBjb250cm9sIGZvciB0eXBlICdwYXJhbWV0ZXJWYWx1ZXMnLCBhbmQgYWxzbyAnYm9vbGVhbicgd2hpY2ggaGFzIGhhcmQgY29kZWQgdmFsdWVzIHRydWUvZmFsc2Uvc2ltIGRlZmF1bHQuXG4gIGZ1bmN0aW9uIGNyZWF0ZVBhcmFtZXRlclZhbHVlc1NlbGVjdG9yKCBxdWVyeVBhcmFtZXRlcjogUGhldG1hcmtzUXVlcnlQYXJhbWV0ZXIgKTogUXVlcnlQYXJhbWV0ZXJTZWxlY3RvciB7XG5cbiAgICAvLyBXZSBkb24ndCB3YW50IHRvIG11dGF0ZSB0aGUgcHJvdmlkZWQgZGF0YVxuICAgIHF1ZXJ5UGFyYW1ldGVyID0gXy5hc3NpZ25Jbigge30sIHF1ZXJ5UGFyYW1ldGVyICk7XG5cbiAgICBpZiAoIHF1ZXJ5UGFyYW1ldGVyLnR5cGUgPT09ICdib29sZWFuJyApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFxdWVyeVBhcmFtZXRlci5oYXNPd25Qcm9wZXJ0eSggJ3BhcmFtZXRlclZhbHVlcycgKSwgJ3BhcmFtZXRlclZhbHVlcyBhcmUgZmlsbGVkIGluIGZvciBib29sZWFuJyApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIXF1ZXJ5UGFyYW1ldGVyLmhhc093blByb3BlcnR5KCAnb21pdElmRGVmYXVsdCcgKSwgJ29taXRJZkRlZmF1bHQgaXMgZmlsbGVkIGluIGZvciBib29sZWFuJyApO1xuICAgICAgcXVlcnlQYXJhbWV0ZXIucGFyYW1ldGVyVmFsdWVzID0gWyAndHJ1ZScsICdmYWxzZScsIE5PX1ZBTFVFIF07XG5cbiAgICAgIC8vIHNpbSBkZWZhdWx0IGlzIHRoZSBkZWZhdWx0IGZvciBib29sZWFuc1xuICAgICAgaWYgKCAhcXVlcnlQYXJhbWV0ZXIuaGFzT3duUHJvcGVydHkoICdkZWZhdWx0JyApICkge1xuICAgICAgICBxdWVyeVBhcmFtZXRlci5kZWZhdWx0ID0gTk9fVkFMVUU7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcXVlcnlQYXJhbWV0ZXIudHlwZSA9PT0gJ3BhcmFtZXRlclZhbHVlcycsIGBwYXJhbWV0ZXJWYWx1ZXMgdHlwZSBvbmx5IHBsZWFzZTogJHtxdWVyeVBhcmFtZXRlci52YWx1ZX0gLSAke3F1ZXJ5UGFyYW1ldGVyLnR5cGV9YCApO1xuICAgIH1cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBxdWVyeVBhcmFtZXRlci5wYXJhbWV0ZXJWYWx1ZXMsICdwYXJhbWV0ZXJWYWx1ZXMgZXhwZWN0ZWQnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcXVlcnlQYXJhbWV0ZXIucGFyYW1ldGVyVmFsdWVzIS5sZW5ndGggPiAwLCAncGFyYW1ldGVyVmFsdWVzIGV4cGVjdGVkIChtb3JlIHRoYW4gMCBvZiB0aGVtKScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhcXVlcnlQYXJhbWV0ZXIuaGFzT3duUHJvcGVydHkoICdkZXBlbmRlbnRRdWVyeVBhcmFtZXRlcnMnICksXG4gICAgICAndHlwZT1wYXJhbWV0ZXJWYWx1ZXMgYW5kIHR5cGU9Ym9vbGVhbiBkbyBub3Qgc3VwcG9ydCBkZXBlbmRlbnQgcXVlcnkgcGFyYW1ldGVycyBhdCB0aGlzIHRpbWUuJyApO1xuXG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcbiAgICBjb25zdCBxdWVyeVBhcmFtZXRlck5hbWUgPSBxdWVyeVBhcmFtZXRlci52YWx1ZTtcbiAgICBjb25zdCBwYXJhbWV0ZXJWYWx1ZXMgPSBxdWVyeVBhcmFtZXRlci5wYXJhbWV0ZXJWYWx1ZXMhO1xuXG4gICAgY29uc3QgcHJvdmlkZWRBRGVmYXVsdCA9IHF1ZXJ5UGFyYW1ldGVyLmhhc093blByb3BlcnR5KCAnZGVmYXVsdCcgKTtcbiAgICBjb25zdCB0aGVQcm92aWRlZERlZmF1bHQgPSBxdWVyeVBhcmFtZXRlci5kZWZhdWx0ICsgJyc7XG4gICAgaWYgKCBwcm92aWRlZEFEZWZhdWx0ICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcGFyYW1ldGVyVmFsdWVzLmluY2x1ZGVzKCB0aGVQcm92aWRlZERlZmF1bHQgKSxcbiAgICAgICAgYHBhcmFtZXRlciBkZWZhdWx0IGZvciAke3F1ZXJ5UGFyYW1ldGVyTmFtZX0gaXMgbm90IGFuIGF2YWlsYWJsZSB2YWx1ZTogJHt0aGVQcm92aWRlZERlZmF1bHR9YCApO1xuICAgIH1cblxuICAgIGNvbnN0IGRlZmF1bHRWYWx1ZSA9IHByb3ZpZGVkQURlZmF1bHQgPyB0aGVQcm92aWRlZERlZmF1bHQgOiBwYXJhbWV0ZXJWYWx1ZXNbIDAgXTtcblxuICAgIGNvbnN0IGNyZWF0ZVBhcmFtZXRlclZhbHVlc1JhZGlvQnV0dG9uID0gKCB2YWx1ZTogc3RyaW5nICk6IEhUTUxFbGVtZW50ID0+IHtcbiAgICAgIGNvbnN0IGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2xhYmVsJyApO1xuICAgICAgbGFiZWwuY2xhc3NOYW1lID0gJ2Nob2ljZUxhYmVsJztcbiAgICAgIGNvbnN0IHJhZGlvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2lucHV0JyApO1xuICAgICAgcmFkaW8udHlwZSA9ICdyYWRpbyc7XG4gICAgICByYWRpby5uYW1lID0gcXVlcnlQYXJhbWV0ZXJOYW1lO1xuICAgICAgcmFkaW8udmFsdWUgPSB2YWx1ZTtcbiAgICAgIHJhZGlvLmNoZWNrZWQgPSB2YWx1ZSA9PT0gZGVmYXVsdFZhbHVlO1xuICAgICAgbGFiZWwuYXBwZW5kQ2hpbGQoIHJhZGlvICk7XG4gICAgICBsYWJlbC5hcHBlbmRDaGlsZCggZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoIHZhbHVlICkgKTsgLy8gdXNlIHRoZSBxdWVyeSBwYXJhbWV0ZXIgdmFsdWUgYXMgdGhlIGRpc3BsYXkgdGV4dCBmb3IgY2xhcml0eVxuICAgICAgcmV0dXJuIGxhYmVsO1xuICAgIH07XG5cbiAgICBjb25zdCBidWxsZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc3BhbicgKTtcbiAgICBidWxsZXQuaW5uZXJIVE1MID0gJ+Kaqyc7XG4gICAgYnVsbGV0LmNsYXNzTmFtZSA9ICdidWxsZXQnO1xuICAgIGRpdi5hcHBlbmRDaGlsZCggYnVsbGV0ICk7XG4gICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSggYCR7cXVlcnlQYXJhbWV0ZXIudGV4dH0gKD8ke3F1ZXJ5UGFyYW1ldGVyTmFtZX0pYCApO1xuICAgIGRpdi5hcHBlbmRDaGlsZCggbGFiZWwgKTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBwYXJhbWV0ZXJWYWx1ZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBkaXYuYXBwZW5kQ2hpbGQoIGNyZWF0ZVBhcmFtZXRlclZhbHVlc1JhZGlvQnV0dG9uKCBwYXJhbWV0ZXJWYWx1ZXNbIGkgXSApICk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBlbGVtZW50OiBkaXYsXG4gICAgICBnZXQgdmFsdWUoKSB7XG4gICAgICAgIGNvbnN0IHJhZGlvQnV0dG9uVmFsdWUgPSAkKCBgaW5wdXRbbmFtZT0ke3F1ZXJ5UGFyYW1ldGVyTmFtZX1dOmNoZWNrZWRgICkudmFsKCkgKyAnJztcblxuICAgICAgICAvLyBBIHZhbHVlIG9mIFwiU2ltdWxhdGlvbiBEZWZhdWx0XCIgdGVsbHMgdXMgbm90IHRvIHByb3ZpZGUgdGhlIHF1ZXJ5IHBhcmFtZXRlci5cbiAgICAgICAgY29uc3Qgb21pdFF1ZXJ5UGFyYW1ldGVyID0gcmFkaW9CdXR0b25WYWx1ZSA9PT0gTk9fVkFMVUUgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBxdWVyeVBhcmFtZXRlci5vbWl0SWZEZWZhdWx0ICYmIHJhZGlvQnV0dG9uVmFsdWUgPT09IGRlZmF1bHRWYWx1ZSApO1xuICAgICAgICByZXR1cm4gb21pdFF1ZXJ5UGFyYW1ldGVyID8gJycgOiBgJHtxdWVyeVBhcmFtZXRlck5hbWV9PSR7cmFkaW9CdXR0b25WYWx1ZX1gO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBnZXQgRmxhZyBjaGVja2JveGVzIGFzIHRoZWlyIGluZGl2aWR1YWwgcXVlcnkgc3RyaW5ncyAoaW4gYSBsaXN0KSwgYnV0IG9ubHkgaWYgdGhleSBhcmUgZGlmZmVyZW50IGZyb20gdGhlaXIgZGVmYXVsdC5cbiAgZnVuY3Rpb24gZ2V0RmxhZ1BhcmFtZXRlcnMoIHRvZ2dsZUNvbnRhaW5lcjogSFRNTEVsZW1lbnQgKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IGNoZWNrYm94RWxlbWVudHMgPSAkKCB0b2dnbGVDb250YWluZXIgKS5maW5kKCAnLmZsYWdQYXJhbWV0ZXInICkgYXMgdW5rbm93biBhcyBIVE1MSW5wdXRFbGVtZW50W107XG5cbiAgICAvLyBPbmx5IGNoZWNrZWQgYm94ZWQuXG4gICAgcmV0dXJuIF8uZmlsdGVyKCBjaGVja2JveEVsZW1lbnRzLCAoIGNoZWNrYm94OiBIVE1MSW5wdXRFbGVtZW50ICkgPT4gY2hlY2tib3guY2hlY2tlZCApXG4gICAgICAubWFwKCAoIGNoZWNrYm94OiBIVE1MSW5wdXRFbGVtZW50ICkgPT4gY2hlY2tib3gubmFtZSApO1xuICB9XG5cbiAgLy8gQ3JlYXRlIGEgY2hlY2tib3ggdG8gdG9nZ2xlIGlmIHRoZSBmbGFnIHBhcmFtZXRlciBzaG91bGQgYmUgYWRkZWQgdG8gdGhlIG1vZGUgVVJMXG4gIGZ1bmN0aW9uIGNyZWF0ZUZsYWdTZWxlY3RvciggcGFyYW1ldGVyOiBQaGV0bWFya3NRdWVyeVBhcmFtZXRlciwgdG9nZ2xlQ29udGFpbmVyOiBIVE1MRWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50VG9RdWVyeVBhcmFtZXRlcjogRWxlbWVudFRvUGFyYW1ldGVyTWFwICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICFwYXJhbWV0ZXIuaGFzT3duUHJvcGVydHkoICdwYXJhbWV0ZXJWYWx1ZXMnICksICdwYXJhbWV0ZXJWYWx1ZXMgYXJlIGZvciB0eXBlPXBhcmFtZXRlclZhbHVlcycgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhcGFyYW1ldGVyLmhhc093blByb3BlcnR5KCAnb21pdElmRGVmYXVsdCcgKSwgJ29taXRJZkRlZmF1bHQgYXJlIGZvciB0eXBlPXBhcmFtZXRlclZhbHVlcycgKTtcblxuICAgIGFzc2VydCAmJiBwYXJhbWV0ZXIuaGFzT3duUHJvcGVydHkoICdkZWZhdWx0JyApICYmIGFzc2VydCggdHlwZW9mIHBhcmFtZXRlci5kZWZhdWx0ID09PSAnYm9vbGVhbicsICdkZWZhdWx0IGlzIGEgYm9vbGVhbiBmb3IgZmxhZ3MnICk7XG5cbiAgICBjb25zdCBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdsYWJlbCcgKTtcbiAgICBjb25zdCBjaGVja2JveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdpbnB1dCcgKTtcbiAgICBjaGVja2JveC50eXBlID0gJ2NoZWNrYm94JztcbiAgICBjaGVja2JveC5uYW1lID0gcGFyYW1ldGVyLnZhbHVlO1xuICAgIGNoZWNrYm94LmNsYXNzTGlzdC5hZGQoICdmbGFnUGFyYW1ldGVyJyApO1xuICAgIGxhYmVsLmFwcGVuZENoaWxkKCBjaGVja2JveCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICFlbGVtZW50VG9RdWVyeVBhcmFtZXRlci5oYXMoIGNoZWNrYm94ICksICdzYW5pdHkgY2hlY2sgZm9yIG92ZXJ3cml0aW5nJyApO1xuICAgIGVsZW1lbnRUb1F1ZXJ5UGFyYW1ldGVyLnNldCggY2hlY2tib3gsIHBhcmFtZXRlciApO1xuXG4gICAgY29uc3QgcXVlcnlQYXJhbWV0ZXJEaXNwbGF5ID0gcGFyYW1ldGVyLnZhbHVlO1xuXG4gICAgbGFiZWwuYXBwZW5kQ2hpbGQoIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCBgJHtwYXJhbWV0ZXIudGV4dH0gKD8ke3F1ZXJ5UGFyYW1ldGVyRGlzcGxheX0pYCApICk7XG4gICAgdG9nZ2xlQ29udGFpbmVyLmFwcGVuZENoaWxkKCBsYWJlbCApO1xuICAgIHRvZ2dsZUNvbnRhaW5lci5hcHBlbmRDaGlsZCggZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2JyJyApICk7XG4gICAgY2hlY2tib3guY2hlY2tlZCA9ICEhcGFyYW1ldGVyLmRlZmF1bHQ7XG5cbiAgICBpZiAoIHBhcmFtZXRlci5kZXBlbmRlbnRRdWVyeVBhcmFtZXRlcnMgKSB7XG5cbiAgICAgIC8qKlxuICAgICAgICogQ3JlYXRlcyBhIGNoZWNrYm94IHdob3NlIHZhbHVlIGlzIGRlcGVuZGVudCBvbiBhbm90aGVyIGNoZWNrYm94LCBpdCBpcyBvbmx5IHVzZWQgaWYgdGhlIHBhcmVudFxuICAgICAgICogY2hlY2tib3ggaXMgY2hlY2tlZC5cbiAgICAgICAqL1xuICAgICAgY29uc3QgY3JlYXRlRGVwZW5kZW50Q2hlY2tib3ggPSAoIGxhYmVsOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIGNoZWNrZWQ6IGJvb2xlYW4gKTogSFRNTERpdkVsZW1lbnQgPT4ge1xuICAgICAgICBjb25zdCBkZXBlbmRlbnRRdWVyeVBhcmFtZXRlcnNDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXG4gICAgICAgIGNvbnN0IGRlcGVuZGVudENoZWNrYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2lucHV0JyApO1xuICAgICAgICBkZXBlbmRlbnRDaGVja2JveC5pZCA9IGdldERlcGVuZGVudFBhcmFtZXRlckNvbnRyb2xJZCggdmFsdWUgKTtcbiAgICAgICAgZGVwZW5kZW50Q2hlY2tib3gudHlwZSA9ICdjaGVja2JveCc7XG4gICAgICAgIGRlcGVuZGVudENoZWNrYm94Lm5hbWUgPSB2YWx1ZTtcbiAgICAgICAgZGVwZW5kZW50Q2hlY2tib3guY2xhc3NMaXN0LmFkZCggJ2ZsYWdQYXJhbWV0ZXInICk7XG4gICAgICAgIGRlcGVuZGVudENoZWNrYm94LnN0eWxlLm1hcmdpbkxlZnQgPSAnNDBweCc7XG4gICAgICAgIGRlcGVuZGVudENoZWNrYm94LmNoZWNrZWQgPSBjaGVja2VkO1xuICAgICAgICBjb25zdCBsYWJlbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnbGFiZWwnICk7XG4gICAgICAgIGxhYmVsRWxlbWVudC5hcHBlbmRDaGlsZCggZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoIGxhYmVsICkgKTtcbiAgICAgICAgbGFiZWxFbGVtZW50Lmh0bWxGb3IgPSBkZXBlbmRlbnRDaGVja2JveC5pZDtcblxuICAgICAgICBkZXBlbmRlbnRRdWVyeVBhcmFtZXRlcnNDb250YWluZXIuYXBwZW5kQ2hpbGQoIGRlcGVuZGVudENoZWNrYm94ICk7XG4gICAgICAgIGRlcGVuZGVudFF1ZXJ5UGFyYW1ldGVyc0NvbnRhaW5lci5hcHBlbmRDaGlsZCggbGFiZWxFbGVtZW50ICk7XG5cbiAgICAgICAgLy8gY2hlY2tib3ggYmVjb21lcyB1bmNoZWNrZWQgYW5kIGRpc2FibGVkIGlmIGRlcGVuZGVuY3kgY2hlY2tib3ggaXMgdW5jaGVja2VkXG4gICAgICAgIGNvbnN0IGVuYWJsZUJ1dHRvbiA9ICgpID0+IHtcbiAgICAgICAgICBkZXBlbmRlbnRDaGVja2JveC5kaXNhYmxlZCA9ICFjaGVja2JveC5jaGVja2VkO1xuICAgICAgICAgIGlmICggIWNoZWNrYm94LmNoZWNrZWQgKSB7XG4gICAgICAgICAgICBkZXBlbmRlbnRDaGVja2JveC5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjaGVja2JveC5hZGRFdmVudExpc3RlbmVyKCAnY2hhbmdlJywgZW5hYmxlQnV0dG9uICk7XG4gICAgICAgIGVuYWJsZUJ1dHRvbigpO1xuXG4gICAgICAgIHJldHVybiBkZXBlbmRlbnRRdWVyeVBhcmFtZXRlcnNDb250YWluZXI7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBjb250YWluZXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuICAgICAgcGFyYW1ldGVyLmRlcGVuZGVudFF1ZXJ5UGFyYW1ldGVycy5mb3JFYWNoKCByZWxhdGVkUGFyYW1ldGVyID0+IHtcbiAgICAgICAgY29uc3QgZGVwZW5kZW50Q2hlY2tib3ggPSBjcmVhdGVEZXBlbmRlbnRDaGVja2JveCggYCR7cmVsYXRlZFBhcmFtZXRlci50ZXh0fSAoJHtyZWxhdGVkUGFyYW1ldGVyLnZhbHVlfSlgLCByZWxhdGVkUGFyYW1ldGVyLnZhbHVlLCAhIXJlbGF0ZWRQYXJhbWV0ZXIuZGVmYXVsdCApO1xuICAgICAgICBjb250YWluZXJEaXYuYXBwZW5kQ2hpbGQoIGRlcGVuZGVudENoZWNrYm94ICk7XG4gICAgICB9ICk7XG4gICAgICB0b2dnbGVDb250YWluZXIuYXBwZW5kQ2hpbGQoIGNvbnRhaW5lckRpdiApO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVF1ZXJ5UGFyYW1ldGVyc1NlbGVjdG9yKCBtb2RlU2VsZWN0b3I6IE1vZGVTZWxlY3RvciApOiBRdWVyeVBhcmFtZXRlcnNTZWxlY3RvciB7XG5cbiAgICBjb25zdCBjdXN0b21UZXh0Qm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2lucHV0JyApO1xuICAgIGN1c3RvbVRleHRCb3gudHlwZSA9ICd0ZXh0JztcblxuICAgIGNvbnN0IHRvZ2dsZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cbiAgICBsZXQgZWxlbWVudFRvUXVlcnlQYXJhbWV0ZXI6IEVsZW1lbnRUb1BhcmFtZXRlck1hcCA9IG5ldyBNYXAoKTtcbiAgICBjb25zdCBwYXJhbWV0ZXJWYWx1ZXNTZWxlY3RvcnM6IFF1ZXJ5UGFyYW1ldGVyU2VsZWN0b3JbXSA9IFtdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRvZ2dsZUVsZW1lbnQ6IHRvZ2dsZUNvbnRhaW5lcixcbiAgICAgIGN1c3RvbUVsZW1lbnQ6IGN1c3RvbVRleHRCb3gsXG4gICAgICBnZXQgdmFsdWUoKSB7XG5cbiAgICAgICAgLy8gZmxhZyBxdWVyeSBwYXJhbWV0ZXJzLCBpbiBzdHJpbmcgZm9ybVxuICAgICAgICBjb25zdCBmbGFnUXVlcnlQYXJhbWV0ZXJzID0gZ2V0RmxhZ1BhcmFtZXRlcnMoIHRvZ2dsZUNvbnRhaW5lciApO1xuICAgICAgICBjb25zdCBwYXJhbWV0ZXJWYWx1ZXNRdWVyeVBhcmFtZXRlcnMgPSBwYXJhbWV0ZXJWYWx1ZXNTZWxlY3RvcnNcbiAgICAgICAgICAubWFwKCAoIHNlbGVjdG9yOiBRdWVyeVBhcmFtZXRlclNlbGVjdG9yICkgPT4gc2VsZWN0b3IudmFsdWUgKVxuICAgICAgICAgIC5maWx0ZXIoICggcXVlcnlQYXJhbWV0ZXI6IHN0cmluZyApID0+IHF1ZXJ5UGFyYW1ldGVyICE9PSAnJyApO1xuXG4gICAgICAgIGNvbnN0IGN1c3RvbVF1ZXJ5UGFyYW1ldGVycyA9IGN1c3RvbVRleHRCb3gudmFsdWUubGVuZ3RoID8gWyBjdXN0b21UZXh0Qm94LnZhbHVlIF0gOiBbXTtcblxuICAgICAgICByZXR1cm4gZmxhZ1F1ZXJ5UGFyYW1ldGVycy5jb25jYXQoIHBhcmFtZXRlclZhbHVlc1F1ZXJ5UGFyYW1ldGVycyApLmNvbmNhdCggY3VzdG9tUXVlcnlQYXJhbWV0ZXJzICkuam9pbiggJyYnICk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gUmVidWlsZCBiYXNlZCBvbiBhIG5ldyBtb2RlL3JlcG8gY2hhbmdlXG5cbiAgICAgICAgZWxlbWVudFRvUXVlcnlQYXJhbWV0ZXIgPSBuZXcgTWFwKCk7XG4gICAgICAgIHBhcmFtZXRlclZhbHVlc1NlbGVjdG9ycy5sZW5ndGggPSAwO1xuICAgICAgICBjbGVhckNoaWxkcmVuKCB0b2dnbGVDb250YWluZXIgKTtcblxuICAgICAgICBjb25zdCBxdWVyeVBhcmFtZXRlcnMgPSBtb2RlU2VsZWN0b3IubW9kZS5xdWVyeVBhcmFtZXRlcnMgfHwgW107XG4gICAgICAgIHF1ZXJ5UGFyYW1ldGVycy5mb3JFYWNoKCBwYXJhbWV0ZXIgPT4ge1xuICAgICAgICAgIGlmICggcGFyYW1ldGVyLnR5cGUgPT09ICdwYXJhbWV0ZXJWYWx1ZXMnIHx8IHBhcmFtZXRlci50eXBlID09PSAnYm9vbGVhbicgKSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RvciA9IGNyZWF0ZVBhcmFtZXRlclZhbHVlc1NlbGVjdG9yKCBwYXJhbWV0ZXIgKTtcbiAgICAgICAgICAgIHRvZ2dsZUNvbnRhaW5lci5hcHBlbmRDaGlsZCggc2VsZWN0b3IuZWxlbWVudCApO1xuICAgICAgICAgICAgcGFyYW1ldGVyVmFsdWVzU2VsZWN0b3JzLnB1c2goIHNlbGVjdG9yICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY3JlYXRlRmxhZ1NlbGVjdG9yKCBwYXJhbWV0ZXIsIHRvZ2dsZUNvbnRhaW5lciwgZWxlbWVudFRvUXVlcnlQYXJhbWV0ZXIgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSB0aGUgdmlldyBhbmQgaG9vayBldmVyeXRoaW5nIHVwLlxuICAgKi9cbiAgZnVuY3Rpb24gcmVuZGVyKCBtb2RlRGF0YTogTW9kZURhdGEgKTogdm9pZCB7XG4gICAgY29uc3QgcmVwb3NpdG9yeVNlbGVjdG9yID0gY3JlYXRlUmVwb3NpdG9yeVNlbGVjdG9yKCBPYmplY3Qua2V5cyggbW9kZURhdGEgKSApO1xuICAgIGNvbnN0IG1vZGVTZWxlY3RvciA9IGNyZWF0ZU1vZGVTZWxlY3RvciggbW9kZURhdGEsIHJlcG9zaXRvcnlTZWxlY3RvciApO1xuICAgIGNvbnN0IHF1ZXJ5UGFyYW1ldGVyU2VsZWN0b3IgPSBjcmVhdGVRdWVyeVBhcmFtZXRlcnNTZWxlY3RvciggbW9kZVNlbGVjdG9yICk7XG5cbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50VVJMKCk6IHN0cmluZyB7XG4gICAgICBjb25zdCBxdWVyeVBhcmFtZXRlcnMgPSBxdWVyeVBhcmFtZXRlclNlbGVjdG9yLnZhbHVlO1xuICAgICAgY29uc3QgdXJsID0gbW9kZVNlbGVjdG9yLm1vZGUudXJsO1xuICAgICAgY29uc3Qgc2VwYXJhdG9yID0gdXJsLmluY2x1ZGVzKCAnPycgKSA/ICcmJyA6ICc/JztcbiAgICAgIHJldHVybiB1cmwgKyAoIHF1ZXJ5UGFyYW1ldGVycy5sZW5ndGggPyBzZXBhcmF0b3IgKyBxdWVyeVBhcmFtZXRlcnMgOiAnJyApO1xuICAgIH1cblxuICAgIGNvbnN0IGxhdW5jaEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdidXR0b24nICk7XG4gICAgbGF1bmNoQnV0dG9uLmlkID0gJ2xhdW5jaEJ1dHRvbic7XG4gICAgbGF1bmNoQnV0dG9uLm5hbWUgPSAnbGF1bmNoJztcbiAgICBsYXVuY2hCdXR0b24uaW5uZXJIVE1MID0gJ0xhdW5jaCc7XG5cbiAgICBjb25zdCByZXNldEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdidXR0b24nICk7XG4gICAgcmVzZXRCdXR0b24ubmFtZSA9ICdyZXNldCc7XG4gICAgcmVzZXRCdXR0b24uaW5uZXJIVE1MID0gJ1Jlc2V0IFF1ZXJ5IFBhcmFtZXRlcnMnO1xuXG4gICAgZnVuY3Rpb24gaGVhZGVyKCBzdHJpbmc6IHN0cmluZyApOiBIVE1MRWxlbWVudCB7XG4gICAgICBjb25zdCBoZWFkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2gzJyApO1xuICAgICAgaGVhZC5hcHBlbmRDaGlsZCggZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoIHN0cmluZyApICk7XG4gICAgICByZXR1cm4gaGVhZDtcbiAgICB9XG5cbiAgICAvLyBEaXZzIGZvciBvdXIgdGhyZWUgY29sdW1uc1xuICAgIGNvbnN0IHJlcG9EaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuICAgIHJlcG9EaXYuaWQgPSAncmVwb3NpdG9yaWVzJztcbiAgICBjb25zdCBtb2RlRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcbiAgICBtb2RlRGl2LmlkID0gJ2Nob2ljZXMnO1xuICAgIGNvbnN0IHF1ZXJ5UGFyYW1ldGVyc0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG4gICAgcXVlcnlQYXJhbWV0ZXJzRGl2LmlkID0gJ3F1ZXJ5UGFyYW1ldGVycyc7XG5cbiAgICAvLyBMYXlvdXQgb2YgYWxsIHRoZSBtYWpvciBlbGVtZW50c1xuICAgIHJlcG9EaXYuYXBwZW5kQ2hpbGQoIGhlYWRlciggJ1JlcG9zaXRvcmllcycgKSApO1xuICAgIHJlcG9EaXYuYXBwZW5kQ2hpbGQoIHJlcG9zaXRvcnlTZWxlY3Rvci5lbGVtZW50ICk7XG4gICAgbW9kZURpdi5hcHBlbmRDaGlsZCggaGVhZGVyKCAnTW9kZXMnICkgKTtcbiAgICBtb2RlRGl2LmFwcGVuZENoaWxkKCBtb2RlU2VsZWN0b3IuZWxlbWVudCApO1xuICAgIG1vZGVEaXYuYXBwZW5kQ2hpbGQoIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdicicgKSApO1xuICAgIG1vZGVEaXYuYXBwZW5kQ2hpbGQoIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdicicgKSApO1xuICAgIG1vZGVEaXYuYXBwZW5kQ2hpbGQoIGxhdW5jaEJ1dHRvbiApO1xuICAgIHF1ZXJ5UGFyYW1ldGVyc0Rpdi5hcHBlbmRDaGlsZCggaGVhZGVyKCAnUXVlcnkgUGFyYW1ldGVycycgKSApO1xuICAgIHF1ZXJ5UGFyYW1ldGVyc0Rpdi5hcHBlbmRDaGlsZCggcXVlcnlQYXJhbWV0ZXJTZWxlY3Rvci50b2dnbGVFbGVtZW50ICk7XG4gICAgcXVlcnlQYXJhbWV0ZXJzRGl2LmFwcGVuZENoaWxkKCBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSggJ1F1ZXJ5IFBhcmFtZXRlcnM6ICcgKSApO1xuICAgIHF1ZXJ5UGFyYW1ldGVyc0Rpdi5hcHBlbmRDaGlsZCggcXVlcnlQYXJhbWV0ZXJTZWxlY3Rvci5jdXN0b21FbGVtZW50ICk7XG4gICAgcXVlcnlQYXJhbWV0ZXJzRGl2LmFwcGVuZENoaWxkKCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnYnInICkgKTtcbiAgICBxdWVyeVBhcmFtZXRlcnNEaXYuYXBwZW5kQ2hpbGQoIHJlc2V0QnV0dG9uICk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggcmVwb0RpdiApO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIG1vZGVEaXYgKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBxdWVyeVBhcmFtZXRlcnNEaXYgKTtcblxuICAgIGZ1bmN0aW9uIHVwZGF0ZVF1ZXJ5UGFyYW1ldGVyVmlzaWJpbGl0eSgpOiB2b2lkIHtcbiAgICAgIHF1ZXJ5UGFyYW1ldGVyc0Rpdi5zdHlsZS52aXNpYmlsaXR5ID0gbW9kZVNlbGVjdG9yLm1vZGUucXVlcnlQYXJhbWV0ZXJzID8gJ2luaGVyaXQnIDogJ2hpZGRlbic7XG4gICAgfVxuXG4gICAgLy8gQWxpZ24gcGFuZWxzIGJhc2VkIG9uIHdpZHRoXG4gICAgZnVuY3Rpb24gbGF5b3V0KCk6IHZvaWQge1xuICAgICAgbW9kZURpdi5zdHlsZS5sZWZ0ID0gYCR7cmVwb3NpdG9yeVNlbGVjdG9yLmVsZW1lbnQuY2xpZW50V2lkdGggKyAyMH1weGA7XG4gICAgICBxdWVyeVBhcmFtZXRlcnNEaXYuc3R5bGUubGVmdCA9IGAke3JlcG9zaXRvcnlTZWxlY3Rvci5lbGVtZW50LmNsaWVudFdpZHRoICsgK21vZGVEaXYuY2xpZW50V2lkdGggKyA0MH1weGA7XG4gICAgfVxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdyZXNpemUnLCBsYXlvdXQgKTtcblxuICAgIC8vIEhvb2sgdXBkYXRlcyB0byBjaGFuZ2UgbGlzdGVuZXJzXG4gICAgZnVuY3Rpb24gb25SZXBvc2l0b3J5Q2hhbmdlZCgpOiB2b2lkIHtcbiAgICAgIG1vZGVTZWxlY3Rvci51cGRhdGUoKTtcbiAgICAgIG9uTW9kZUNoYW5nZWQoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbk1vZGVDaGFuZ2VkKCk6IHZvaWQge1xuICAgICAgcXVlcnlQYXJhbWV0ZXJTZWxlY3Rvci51cGRhdGUoKTtcbiAgICAgIHVwZGF0ZVF1ZXJ5UGFyYW1ldGVyVmlzaWJpbGl0eSgpO1xuICAgICAgbGF5b3V0KCk7XG4gICAgfVxuXG4gICAgcmVwb3NpdG9yeVNlbGVjdG9yLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2NoYW5nZScsIG9uUmVwb3NpdG9yeUNoYW5nZWQgKTtcbiAgICBtb2RlU2VsZWN0b3IuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnY2hhbmdlJywgb25Nb2RlQ2hhbmdlZCApO1xuICAgIG9uUmVwb3NpdG9yeUNoYW5nZWQoKTtcblxuICAgIC8vIENsaWNraW5nICdMYXVuY2gnIG9yIHByZXNzaW5nICdlbnRlcicgb3BlbnMgdGhlIFVSTFxuICAgIGZ1bmN0aW9uIG9wZW5DdXJyZW50VVJMKCk6IHZvaWQge1xuICAgICAgb3BlblVSTCggZ2V0Q3VycmVudFVSTCgpICk7XG4gICAgfVxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgZXZlbnQgPT4ge1xuICAgICAgLy8gQ2hlY2sgZm9yIGVudGVyIGtleVxuICAgICAgaWYgKCBldmVudC53aGljaCA9PT0gMTMgKSB7XG4gICAgICAgIG9wZW5DdXJyZW50VVJMKCk7XG4gICAgICB9XG4gICAgfSwgZmFsc2UgKTtcbiAgICBsYXVuY2hCdXR0b24uYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgb3BlbkN1cnJlbnRVUkwgKTtcblxuICAgIC8vIFJlc2V0IGJ5IHJlZHJhd2luZyBldmVyeXRoaW5nXG4gICAgcmVzZXRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgcXVlcnlQYXJhbWV0ZXJTZWxlY3Rvci51cGRhdGUgKTtcbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIGxvYWRQYWNrYWdlSlNPTnMoIHJlcG9zOiBSZXBvTmFtZVtdICk6IFByb21pc2U8UmVjb3JkPFJlcG9OYW1lLCBQYWNrYWdlSlNPTj4+IHtcbiAgICBjb25zdCBwYWNrYWdlSlNPTnM6IFJlY29yZDxSZXBvTmFtZSwgUGFja2FnZUpTT04+ID0ge307XG4gICAgZm9yICggY29uc3QgcmVwbyBvZiByZXBvcyApIHtcbiAgICAgIHBhY2thZ2VKU09Oc1sgcmVwbyBdID0gYXdhaXQgJC5hamF4KCB7IHVybDogYC4uLyR7cmVwb30vcGFja2FnZS5qc29uYCB9ICk7XG4gICAgfVxuICAgIHJldHVybiBwYWNrYWdlSlNPTnM7XG4gIH1cblxuICAvLyBTcGxpdHMgZmlsZSBzdHJpbmdzIChzdWNoIGFzIHBlcmVubmlhbC1hbGlhcy9kYXRhL2FjdGl2ZS1ydW5uYWJsZXMpIGludG8gYSBsaXN0IG9mIGVudHJpZXMsIGlnbm9yaW5nIGJsYW5rIGxpbmVzLlxuICBmdW5jdGlvbiB3aGl0ZVNwbGl0QW5kU29ydCggcmF3RGF0YUxpc3Q6IHN0cmluZyApOiBSZXBvTmFtZVtdIHtcbiAgICByZXR1cm4gcmF3RGF0YUxpc3Quc3BsaXQoICdcXG4nICkubWFwKCBsaW5lID0+IHtcbiAgICAgIHJldHVybiBsaW5lLnJlcGxhY2UoICdcXHInLCAnJyApO1xuICAgIH0gKS5maWx0ZXIoIGxpbmUgPT4ge1xuICAgICAgcmV0dXJuIGxpbmUubGVuZ3RoID4gMDtcbiAgICB9ICkuc29ydCgpO1xuICB9XG5cbiAgLy8gZ2V0IHRoZSBJRCBmb3IgYSBjaGVja2JveCB0aGF0IGlzIFwiZGVwZW5kZW50XCIgb24gYW5vdGhlciB2YWx1ZVxuICBjb25zdCBnZXREZXBlbmRlbnRQYXJhbWV0ZXJDb250cm9sSWQgPSAoIHZhbHVlOiBzdHJpbmcgKSA9PiBgZGVwZW5kZW50LWNoZWNrYm94LSR7dmFsdWV9YDtcblxuICAvLyBMb2FkIGZpbGVzIHNlcmlhbGx5LCBwb3B1bGF0ZSB0aGVuIHJlbmRlclxuICBjb25zdCBhY3RpdmVSdW5uYWJsZXMgPSB3aGl0ZVNwbGl0QW5kU29ydCggYXdhaXQgJC5hamF4KCB7IHVybDogJy4uL3BlcmVubmlhbC1hbGlhcy9kYXRhL2FjdGl2ZS1ydW5uYWJsZXMnIH0gKSApO1xuICBjb25zdCBhY3RpdmVSZXBvcyA9IHdoaXRlU3BsaXRBbmRTb3J0KCBhd2FpdCAkLmFqYXgoIHsgdXJsOiAnLi4vcGVyZW5uaWFsLWFsaWFzL2RhdGEvYWN0aXZlLXJlcG9zJyB9ICkgKTtcbiAgY29uc3QgcGhldGlvU2ltcyA9IHdoaXRlU3BsaXRBbmRTb3J0KCBhd2FpdCAkLmFqYXgoIHsgdXJsOiAnLi4vcGVyZW5uaWFsLWFsaWFzL2RhdGEvcGhldC1pbycgfSApICk7XG4gIGNvbnN0IGludGVyYWN0aXZlRGVzY3JpcHRpb25TaW1zID0gd2hpdGVTcGxpdEFuZFNvcnQoIGF3YWl0ICQuYWpheCggeyB1cmw6ICcuLi9wZXJlbm5pYWwtYWxpYXMvZGF0YS9pbnRlcmFjdGl2ZS1kZXNjcmlwdGlvbicgfSApICk7XG4gIGNvbnN0IHdyYXBwZXJzID0gd2hpdGVTcGxpdEFuZFNvcnQoIGF3YWl0ICQuYWpheCggeyB1cmw6ICcuLi9wZXJlbm5pYWwtYWxpYXMvZGF0YS93cmFwcGVycycgfSApICk7XG4gIGNvbnN0IHVuaXRUZXN0c1JlcG9zID0gd2hpdGVTcGxpdEFuZFNvcnQoIGF3YWl0ICQuYWpheCggeyB1cmw6ICcuLi9wZXJlbm5pYWwtYWxpYXMvZGF0YS91bml0LXRlc3RzJyB9ICkgKTtcbiAgY29uc3QgcGhldGlvSHlkcm9nZW5TaW1zID0gYXdhaXQgJC5hamF4KCB7IHVybDogJy4uL3BlcmVubmlhbC1hbGlhcy9kYXRhL3BoZXQtaW8taHlkcm9nZW4uanNvbicgfSApO1xuICBjb25zdCBwaGV0aW9QYWNrYWdlSlNPTnMgPSBhd2FpdCBsb2FkUGFja2FnZUpTT05zKCBwaGV0aW9TaW1zICk7XG5cbiAgcmVuZGVyKCBwb3B1bGF0ZSggYWN0aXZlUnVubmFibGVzLCBhY3RpdmVSZXBvcywgcGhldGlvU2ltcywgaW50ZXJhY3RpdmVEZXNjcmlwdGlvblNpbXMsIHdyYXBwZXJzLCB1bml0VGVzdHNSZXBvcywgcGhldGlvSHlkcm9nZW5TaW1zLCBwaGV0aW9QYWNrYWdlSlNPTnMgKSApO1xufSApKCkuY2F0Y2goICggZTogRXJyb3IgKSA9PiB7XG4gIHRocm93IGU7XG59ICk7Il0sIm5hbWVzIjpbImRlbW9SZXBvcyIsImRvY1JlcG9zIiwiTk9fVkFMVUUiLCJhdWRpb1F1ZXJ5UGFyYW1ldGVyIiwidmFsdWUiLCJ0ZXh0IiwidHlwZSIsInBhcmFtZXRlclZhbHVlcyIsIm9taXRJZkRlZmF1bHQiLCJlYVF1ZXJ5UGFyYW1ldGVyIiwiZGVmYXVsdCIsImxvY2FsZXNRdWVyeVBhcmFtZXRlciIsImRlcGVuZGVudFF1ZXJ5UGFyYW1ldGVycyIsInBoZXRpb0RlYnVnUGFyYW1ldGVyIiwicGhldGlvRGVidWdUcnVlUGFyYW1ldGVyIiwiXyIsImFzc2lnbiIsInBoZXRpb0VsZW1lbnRzRGlzcGxheVBhcmFtZXRlciIsInBoZXRpb1ByaW50QVBJUHJvYmxlbXNRdWVyeVBhcmFtZXRlciIsInBoZXRpb1ByaW50TWlzc2luZ1RhbmRlbXNRdWVyeVBhcmFtZXRlciIsInNjcmVlbnNRdWVyeVBhcmFtZXRlciIsImRlbW9zUXVlcnlQYXJhbWV0ZXJzIiwid2ViR0xQYXJhbWV0ZXIiLCJzaW1Ob0xvY2FsZXNRdWVyeVBhcmFtZXRlcnMiLCJzaW1RdWVyeVBhcmFtZXRlcnMiLCJjb25jYXQiLCJwdXNoIiwicGhldEJyYW5kUXVlcnlQYXJhbWV0ZXIiLCJkZXZTaW1RdWVyeVBhcmFtZXRlcnMiLCJwaGV0aW9CYXNlUGFyYW1ldGVycyIsImV4dGVuZCIsImdldEZ1enpMaWdodHllYXJQYXJhbWV0ZXJzIiwiZHVyYXRpb24iLCJ0ZXN0VGFzayIsIm1vcmVGdXp6ZXJzIiwibm9uUHVibGlzaGVkUGhldGlvV3JhcHBlcnNUb0FkZFRvUGhldG1hcmtzIiwicGhldGlvV3JhcHBlclF1ZXJ5UGFyYW1ldGVycyIsInBoZXRpb1NpbVF1ZXJ5UGFyYW1ldGVycyIsIm1pZ3JhdGlvblF1ZXJ5UGFyYW1ldGVycyIsInN0b3JhZ2VLZXkiLCJrZXkiLCJnZXRXcmFwcGVyTmFtZSIsIndyYXBwZXIiLCJ3cmFwcGVyUGFydHMiLCJzcGxpdCIsIndyYXBwZXJOYW1lIiwibGVuZ3RoIiwic3RhcnRzV2l0aCIsInNwbGl0T25TbGFzaCIsInNoaWZ0UHJlc3NlZCIsIndpbmRvdyIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsInNoaWZ0S2V5Iiwib3BlblVSTCIsInVybCIsIm9wZW4iLCJsb2NhdGlvbiIsInBvcHVsYXRlIiwiYWN0aXZlUnVubmFibGVzIiwiYWN0aXZlUmVwb3MiLCJwaGV0aW9TaW1zIiwiaW50ZXJhY3RpdmVEZXNjcmlwdGlvblNpbXMiLCJ3cmFwcGVycyIsInVuaXRUZXN0c1JlcG9zIiwicGhldGlvSHlkcm9nZW5TaW1zIiwicGhldGlvUGFja2FnZUpTT05zIiwibW9kZURhdGEiLCJmb3JFYWNoIiwicmVwbyIsIm1vZGVzIiwiaXNQaGV0aW8iLCJpbmNsdWRlcyIsImhhc1VuaXRUZXN0cyIsImlzUnVubmFibGUiLCJzdXBwb3J0c0ludGVyYWN0aXZlRGVzY3JpcHRpb24iLCJuYW1lIiwiZGVzY3JpcHRpb24iLCJxdWVyeVBhcmFtZXRlcnMiLCJqb2luIiwibWFwIiwic2ltRGF0YSIsInNpbSIsInNoYXJlZENvbXBhcmlzb25RdWVyeVBhcmFtZXRlcnMiLCJncm91cCIsInNpbVNwZWNpZmljV3JhcHBlcnMiLCJwaGV0IiwiYWxsV3JhcHBlcnMiLCJzb3J0QnkiLCJzdHVkaW9RdWVyeVBhcmFtZXRlcnMiLCJyZW1vdmUiLCJpdGVtIiwiY2xlYXJDaGlsZHJlbiIsImVsZW1lbnQiLCJjaGlsZE5vZGVzIiwicmVtb3ZlQ2hpbGQiLCJjcmVhdGVSZXBvc2l0b3J5U2VsZWN0b3IiLCJyZXBvc2l0b3JpZXMiLCJzZWxlY3QiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJhdXRvZm9jdXMiLCJvcHRpb24iLCJsYWJlbCIsImlubmVySFRNTCIsImFwcGVuZENoaWxkIiwic2Nyb2xsSW50b1ZpZXciLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJzZXRBdHRyaWJ1dGUiLCJyZXBvS2V5IiwibG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsImZvY3VzIiwidHJ5U2Nyb2xsIiwic2VsZWN0ZWRJbmRleCIsInNjcm9sbEludG9WaWV3SWZOZWVkZWQiLCJzZXRUaW1lb3V0IiwiY3JlYXRlTW9kZVNlbGVjdG9yIiwicmVwb3NpdG9yeVNlbGVjdG9yIiwic2VsZWN0b3IiLCJtb2RlIiwiY3VycmVudE1vZGVOYW1lIiwiZmlsdGVyIiwidXBkYXRlIiwic2V0SXRlbSIsImdyb3VwcyIsImNob2ljZSIsImNob2ljZU9wdGlvbiIsInRpdGxlIiwib3B0R3JvdXAiLCJPYmplY3QiLCJrZXlzIiwiY3JlYXRlUGFyYW1ldGVyVmFsdWVzU2VsZWN0b3IiLCJxdWVyeVBhcmFtZXRlciIsImFzc2lnbkluIiwiYXNzZXJ0IiwiaGFzT3duUHJvcGVydHkiLCJkaXYiLCJxdWVyeVBhcmFtZXRlck5hbWUiLCJwcm92aWRlZEFEZWZhdWx0IiwidGhlUHJvdmlkZWREZWZhdWx0IiwiZGVmYXVsdFZhbHVlIiwiY3JlYXRlUGFyYW1ldGVyVmFsdWVzUmFkaW9CdXR0b24iLCJjbGFzc05hbWUiLCJyYWRpbyIsImNoZWNrZWQiLCJjcmVhdGVUZXh0Tm9kZSIsImJ1bGxldCIsImkiLCJyYWRpb0J1dHRvblZhbHVlIiwiJCIsInZhbCIsIm9taXRRdWVyeVBhcmFtZXRlciIsImdldEZsYWdQYXJhbWV0ZXJzIiwidG9nZ2xlQ29udGFpbmVyIiwiY2hlY2tib3hFbGVtZW50cyIsImZpbmQiLCJjaGVja2JveCIsImNyZWF0ZUZsYWdTZWxlY3RvciIsInBhcmFtZXRlciIsImVsZW1lbnRUb1F1ZXJ5UGFyYW1ldGVyIiwiY2xhc3NMaXN0IiwiYWRkIiwiaGFzIiwic2V0IiwicXVlcnlQYXJhbWV0ZXJEaXNwbGF5IiwiY3JlYXRlRGVwZW5kZW50Q2hlY2tib3giLCJkZXBlbmRlbnRRdWVyeVBhcmFtZXRlcnNDb250YWluZXIiLCJkZXBlbmRlbnRDaGVja2JveCIsImlkIiwiZ2V0RGVwZW5kZW50UGFyYW1ldGVyQ29udHJvbElkIiwic3R5bGUiLCJtYXJnaW5MZWZ0IiwibGFiZWxFbGVtZW50IiwiaHRtbEZvciIsImVuYWJsZUJ1dHRvbiIsImRpc2FibGVkIiwiY29udGFpbmVyRGl2IiwicmVsYXRlZFBhcmFtZXRlciIsImNyZWF0ZVF1ZXJ5UGFyYW1ldGVyc1NlbGVjdG9yIiwibW9kZVNlbGVjdG9yIiwiY3VzdG9tVGV4dEJveCIsIk1hcCIsInBhcmFtZXRlclZhbHVlc1NlbGVjdG9ycyIsInRvZ2dsZUVsZW1lbnQiLCJjdXN0b21FbGVtZW50IiwiZmxhZ1F1ZXJ5UGFyYW1ldGVycyIsInBhcmFtZXRlclZhbHVlc1F1ZXJ5UGFyYW1ldGVycyIsImN1c3RvbVF1ZXJ5UGFyYW1ldGVycyIsInJlbmRlciIsInF1ZXJ5UGFyYW1ldGVyU2VsZWN0b3IiLCJnZXRDdXJyZW50VVJMIiwic2VwYXJhdG9yIiwibGF1bmNoQnV0dG9uIiwicmVzZXRCdXR0b24iLCJoZWFkZXIiLCJzdHJpbmciLCJoZWFkIiwicmVwb0RpdiIsIm1vZGVEaXYiLCJxdWVyeVBhcmFtZXRlcnNEaXYiLCJib2R5IiwidXBkYXRlUXVlcnlQYXJhbWV0ZXJWaXNpYmlsaXR5IiwidmlzaWJpbGl0eSIsImxheW91dCIsImxlZnQiLCJjbGllbnRXaWR0aCIsIm9uUmVwb3NpdG9yeUNoYW5nZWQiLCJvbk1vZGVDaGFuZ2VkIiwib3BlbkN1cnJlbnRVUkwiLCJ3aGljaCIsImxvYWRQYWNrYWdlSlNPTnMiLCJyZXBvcyIsInBhY2thZ2VKU09OcyIsImFqYXgiLCJ3aGl0ZVNwbGl0QW5kU29ydCIsInJhd0RhdGFMaXN0IiwibGluZSIsInJlcGxhY2UiLCJzb3J0IiwiY2F0Y2giLCJlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7O0NBVUMsR0FFQyxvQkFBQTtJQWdDQSxNQUFNQSxZQUFZO1FBQ2hCO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtLQUNEO0lBRUQsTUFBTUMsV0FBVztRQUNmO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7S0FDRDtJQUlELDBHQUEwRztJQUMxRyxNQUFNQyxX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