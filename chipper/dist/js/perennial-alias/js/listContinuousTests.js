// Copyright 2020, University of Colorado Boulder
/**
 * This prints out (in JSON form) the tests and operations requested for continuous testing for whatever is in main
 * at this point.
 *
 * usage: sage run ../perennial/js/listContinuousTests.js
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ const getActiveRepos = require('./common/getActiveRepos');
const getRepoList = require('./common/getRepoList');
const fs = require('fs');
const repos = getActiveRepos();
const phetioRepos = getRepoList('phet-io');
const phetioAPIStableRepos = getRepoList('phet-io-api-stable');
const runnableRepos = getRepoList('active-runnables');
const interactiveDescriptionRepos = getRepoList('interactive-description');
const phetioNoUnsupportedRepos = getRepoList('phet-io-state-unsupported');
const unitTestRepos = getRepoList('unit-tests');
const voicingRepos = getRepoList('voicing');
const phetioWrapperSuiteWrappers = getRepoList('wrappers');
const phetioHydrogenSims = JSON.parse(fs.readFileSync(`${__dirname}/../data/phet-io-hydrogen.json`, 'utf8').trim());
// repos to not test multitouch fuzzing
const REPOS_EXCLUDED_FROM_MULTITOUCH_FUZZING = [
    'number-compare',
    'number-play'
];
const REPOS_EXCLUDED_FROM_LISTENER_ORDER_RANDOM = [
    'density',
    'buoyancy',
    'buoyancy-basics',
    'fourier-making-waves' // see https://github.com/phetsims/fourier-making-waves/issues/240
];
/**
 * {Array.<Object>} test
 * {string} type
 * {string} [url]
 * {string} [repo]
 * {string} [queryParameters]
 * {string} [testQueryParameters]
 * {boolean} [es5]
 * {string} [brand]
 * {number} [priority=1] - higher priorities are tested more eagerly
 * {Array.<string>} buildDependencies
 */ const tests = [];
tests.push({
    test: [
        'perennial',
        'lint',
        'all'
    ],
    type: 'npm-run',
    command: 'lint-all',
    repo: 'perennial',
    priority: 100
});
tests.push({
    test: [
        'perennial',
        'type-check',
        'all'
    ],
    type: 'npm-run',
    command: 'type-check-all',
    repo: 'perennial',
    priority: 100
});
// Node unit tests
[
    'chipper',
    'perennial',
    'perennial-alias'
].forEach((repo)=>{
    tests.push({
        test: [
            repo,
            'qunit',
            'node'
        ],
        type: 'npm-run',
        command: 'test',
        repo: repo
    });
});
// phet and phet-io brand builds
[
    ...runnableRepos,
    'scenery',
    'kite',
    'dot'
].forEach((repo)=>{
    tests.push({
        test: [
            repo,
            'build'
        ],
        type: 'build',
        brands: phetioRepos.includes(repo) ? [
            'phet',
            'phet-io'
        ] : [
            'phet'
        ],
        repo: repo,
        priority: 1
    });
});
// lints
repos.forEach((repo)=>{
    if (fs.existsSync(`../${repo}/Gruntfile.cjs`)) {
        tests.push({
            test: [
                repo,
                'lint'
            ],
            type: 'lint',
            repo: repo,
            priority: 8
        });
    }
});
runnableRepos.forEach((repo)=>{
    tests.push({
        test: [
            repo,
            'fuzz',
            'unbuilt'
        ],
        type: 'sim-test',
        url: `${repo}/${repo}_en.html`,
        queryParameters: 'brand=phet&ea&fuzz',
        testQueryParameters: 'duration=90000' // This is the most important test, let's get some good coverage!
    });
    tests.push({
        test: [
            repo,
            'xss-fuzz'
        ],
        type: 'sim-test',
        url: `${repo}/${repo}_en.html`,
        queryParameters: 'brand=phet&ea&fuzz&stringTest=xss',
        testQueryParameters: 'duration=10000',
        priority: 0.3
    });
    tests.push({
        test: [
            repo,
            'fuzz',
            'unbuilt',
            'assertSlow'
        ],
        type: 'sim-test',
        url: `${repo}/${repo}_en.html`,
        queryParameters: 'brand=phet&eall&fuzz',
        priority: 0.001
    });
    if (!REPOS_EXCLUDED_FROM_LISTENER_ORDER_RANDOM.includes(repo)) {
        tests.push({
            test: [
                repo,
                'fuzz',
                'unbuilt',
                'listenerOrderRandom'
            ],
            type: 'sim-test',
            url: `${repo}/${repo}_en.html`,
            queryParameters: 'brand=phet&ea&fuzz&listenerOrder=random',
            priority: 0.3
        });
    }
    // don't test select repos for fuzzPointers=2
    if (!REPOS_EXCLUDED_FROM_MULTITOUCH_FUZZING.includes(repo)) {
        tests.push({
            test: [
                repo,
                'multitouch-fuzz',
                'unbuilt'
            ],
            type: 'sim-test',
            url: `${repo}/${repo}_en.html`,
            queryParameters: 'brand=phet&ea&fuzz&fuzzPointers=2&supportsPanAndZoom=false'
        });
        tests.push({
            test: [
                repo,
                'pan-and-zoom-fuzz',
                'unbuilt'
            ],
            type: 'sim-test',
            url: `${repo}/${repo}_en.html`,
            queryParameters: 'brand=phet&ea&fuzz&fuzzPointers=2&supportsPanAndZoom=true',
            priority: 0.5 // test this when there isn't other work to be done
        });
    }
    tests.push({
        test: [
            repo,
            'fuzz',
            'built'
        ],
        type: 'sim-test',
        url: `${repo}/build/phet/${repo}_en_phet.html`,
        queryParameters: 'fuzz',
        testQueryParameters: 'duration=80000',
        // We want to elevate the priority so that we get a more even balance (we can't test these until they are built,
        // which doesn't happen always)
        priority: 2,
        brand: 'phet',
        buildDependencies: [
            repo
        ],
        es5: true
    });
    tests.push({
        test: [
            repo,
            'fuzz',
            'built',
            'debug'
        ],
        type: 'sim-test',
        url: `${repo}/build/phet/${repo}_en_phet_debug.html`,
        queryParameters: 'fuzz',
        testQueryParameters: 'duration=80000',
        // We want to elevate the priority so that we get a more even balance (we can't test these until they are built,
        // which doesn't happen always)
        priority: 2,
        brand: 'phet',
        buildDependencies: [
            repo
        ]
    });
    if (phetioRepos.includes(repo)) {
        tests.push({
            test: [
                repo,
                'fuzz',
                'built-phet-io'
            ],
            type: 'sim-test',
            url: `${repo}/build/phet-io/${repo}_all_phet-io.html`,
            queryParameters: 'fuzz&phetioStandalone',
            testQueryParameters: 'duration=80000',
            brand: 'phet-io',
            buildDependencies: [
                repo
            ],
            es5: true
        });
    }
});
phetioRepos.forEach((repo)=>{
    tests.push({
        test: [
            repo,
            'phet-io-fuzz',
            'unbuilt'
        ],
        type: 'sim-test',
        url: `${repo}/${repo}_en.html`,
        queryParameters: 'ea&brand=phet-io&phetioStandalone&fuzz'
    });
    tests.push({
        test: [
            repo,
            'phet-io-fuzz',
            'unbuilt',
            'assertSlow'
        ],
        type: 'sim-test',
        url: `${repo}/${repo}_en.html`,
        queryParameters: 'eall&brand=phet-io&phetioStandalone&fuzz'
    });
    // Test for API compatibility, for sims that support it
    phetioAPIStableRepos.includes(repo) && tests.push({
        test: [
            repo,
            'phet-io-api-compatibility',
            'unbuilt'
        ],
        type: 'sim-test',
        url: `${repo}/${repo}_en.html`,
        queryParameters: 'ea&brand=phet-io&phetioStandalone&phetioCompareAPI&randomSeed=332211&locales=*&webgl=false',
        priority: 1.5 // more often than the average test
    });
    const phetioStateSupported = !phetioNoUnsupportedRepos.includes(repo);
    // phet-io wrappers tests for each PhET-iO Sim, these tests rely on phet-io state working
    phetioStateSupported && [
        false,
        true
    ].forEach((useAssert)=>{
        tests.push({
            test: [
                repo,
                'phet-io-wrappers-tests',
                useAssert ? 'assert' : 'no-assert'
            ],
            type: 'qunit-test',
            url: `phet-io-wrappers/phet-io-wrappers-tests.html?sim=${repo}${useAssert ? '&phetioDebug=true&phetioWrapperDebug=true' : ''}`,
            testQueryParameters: 'duration=600000' // phet-io-wrapper tests load the sim >5 times
        });
    });
    const wrappersToIgnore = [
        'migration',
        'playback',
        'login',
        'input-record-and-playback'
    ];
    phetioWrapperSuiteWrappers.forEach((wrapperPath)=>{
        const wrapperPathParts = wrapperPath.split('/');
        const wrapperName = wrapperPathParts[wrapperPathParts.length - 1];
        if (wrappersToIgnore.includes(wrapperName)) {
            return;
        }
        const testName = `phet-io-${wrapperName}-fuzz`;
        const wrapperQueryParameters = `sim=${repo}&locales=*&phetioWrapperDebug=true&fuzz`;
        if (wrapperName === 'studio') {
            // fuzz test important wrappers
            tests.push({
                test: [
                    repo,
                    testName,
                    'unbuilt'
                ],
                type: 'wrapper-test',
                url: `studio/?${wrapperQueryParameters}`
            });
        } else if (wrapperName === 'state') {
            // only test state on phet-io sims that support it
            phetioStateSupported && tests.push({
                test: [
                    repo,
                    testName,
                    'unbuilt'
                ],
                type: 'wrapper-test',
                url: `phet-io-wrappers/state/?${wrapperQueryParameters}&phetioDebug=true`
            });
        } else {
            tests.push({
                test: [
                    repo,
                    testName,
                    'unbuilt'
                ],
                type: 'wrapper-test',
                url: `phet-io-wrappers/${wrapperName}/?${wrapperQueryParameters}&phetioDebug=true`,
                testQueryParameters: `duration=${wrapperName === 'multi' ? '60000' : '15000'}`
            });
        }
    });
});
interactiveDescriptionRepos.forEach((repo)=>{
    tests.push({
        test: [
            repo,
            'interactive-description-fuzz',
            'unbuilt'
        ],
        type: 'sim-test',
        url: `${repo}/${repo}_en.html`,
        queryParameters: 'brand=phet&ea&fuzz&supportsInteractiveDescription=true',
        testQueryParameters: 'duration=40000'
    });
    tests.push({
        test: [
            repo,
            'interactive-description-fuzz-fuzzBoard-combo',
            'unbuilt'
        ],
        type: 'sim-test',
        url: `${repo}/${repo}_en.html`,
        queryParameters: 'brand=phet&ea&supportsInteractiveDescription=true&fuzz&fuzzBoard',
        testQueryParameters: 'duration=40000'
    });
    tests.push({
        test: [
            repo,
            'interactive-description-fuzzBoard',
            'unbuilt'
        ],
        type: 'sim-test',
        url: `${repo}/${repo}_en.html`,
        queryParameters: 'brand=phet&ea&fuzzBoard&supportsInteractiveDescription=true',
        testQueryParameters: 'duration=40000'
    });
    tests.push({
        test: [
            repo,
            'interactive-description-fuzz',
            'built'
        ],
        type: 'sim-test',
        url: `${repo}/build/phet/${repo}_en_phet.html`,
        queryParameters: 'fuzz&supportsInteractiveDescription=true',
        testQueryParameters: 'duration=40000',
        brand: 'phet',
        buildDependencies: [
            repo
        ],
        es5: true
    });
    tests.push({
        test: [
            repo,
            'interactive-description-fuzzBoard',
            'built'
        ],
        type: 'sim-test',
        url: `${repo}/build/phet/${repo}_en_phet.html`,
        queryParameters: 'fuzzBoard&supportsInteractiveDescription=true',
        testQueryParameters: 'duration=40000',
        brand: 'phet',
        buildDependencies: [
            repo
        ],
        es5: true
    });
});
voicingRepos.forEach((repo)=>{
    tests.push({
        test: [
            repo,
            'voicing-fuzz',
            'unbuilt'
        ],
        type: 'sim-test',
        url: `${repo}/${repo}_en.html`,
        queryParameters: 'brand=phet&ea&fuzz&voicingInitiallyEnabled',
        testQueryParameters: 'duration=40000'
    });
    tests.push({
        test: [
            repo,
            'voicing-fuzzBoard',
            'unbuilt'
        ],
        type: 'sim-test',
        url: `${repo}/${repo}_en.html`,
        queryParameters: 'brand=phet&ea&fuzzBoard&voicingInitiallyEnabled',
        testQueryParameters: 'duration=40000'
    });
});
// repo-specific Unit tests (unbuilt mode) from `grunt generate-test-harness`
unitTestRepos.forEach((repo)=>{
    // All tests should work with no query parameters, with assertions enabled, and should support PhET-iO also, so test
    // with brand=phet-io
    const queryParameters = [
        '',
        '?ea',
        '?brand=phet-io',
        '?ea&brand=phet-io'
    ];
    queryParameters.forEach((queryString)=>{
        // Don't test phet-io or tandem unit tests in phet brand, they are meant for phet-io brand
        if ((repo === 'phet-io' || repo === 'tandem' || repo === 'phet-io-wrappers') && !queryString.includes('phet-io')) {
            return;
        }
        if (repo === 'phet-io-wrappers') {
            queryString += '&sim=gravity-and-orbits';
        }
        tests.push({
            test: [
                repo,
                'top-level-unit-tests',
                `unbuilt${queryString}`
            ],
            type: 'qunit-test',
            url: `${repo}/${repo}-tests.html${queryString}`
        });
    });
});
// Page-load tests (non-built)
[
    {
        repo: 'dot',
        urls: [
            '',
            'doc/',
            'examples/',
            'examples/convex-hull-2.html',
            'tests/',
            'tests/playground.html'
        ]
    },
    {
        repo: 'kite',
        urls: [
            '',
            'doc/',
            'examples/',
            'tests/',
            'tests/playground.html',
            'tests/visual-shape-test.html'
        ]
    },
    {
        repo: 'scenery',
        urls: [
            '',
            'doc/',
            'doc/accessibility/accessibility.html',
            'doc/accessibility/voicing.html',
            'doc/a-tour-of-scenery.html',
            'doc/implementation-notes.html',
            'doc/layout.html',
            'doc/user-input.html',
            'examples/',
            'examples/creator-pattern.html',
            'examples/cursors.html',
            'examples/hello-world.html',
            'examples/input-multiple-displays.html',
            'examples/input.html',
            'examples/mouse-wheel.html',
            'examples/multi-touch.html',
            'examples/nodes.html',
            'examples/shapes.html',
            'examples/sprites.html',
            'examples/accessibility-shapes.html',
            'examples/accessibility-button.html',
            'examples/accessibility-animation.html',
            'examples/accessibility-listeners.html',
            'examples/accessibility-updating-pdom.html',
            'examples/accessibility-slider.html',
            // 'examples/webglnode.html', // currently disabled, since it fails without webgl
            'tests/',
            'tests/playground.html',
            'tests/renderer-comparison.html?renderers=canvas,svg,dom',
            'tests/sandbox.html',
            'tests/text-bounds-comparison.html',
            'tests/text-quality-test.html'
        ]
    },
    {
        repo: 'phet-lib',
        urls: [
            'doc/layout-exemplars.html'
        ]
    },
    {
        repo: 'phet-io-wrappers',
        urls: [
            'tests/FAMB-2.2-phetio-wrapper-test.html'
        ]
    },
    {
        repo: 'phet-io-website',
        urls: [
            'root/devguide/',
            'root/devguide/api_overview.html',
            'root/io-solutions/',
            'root/io-features/',
            'root/io-solutions/virtual-lab/saturation.html',
            'root/io-solutions/online-homework/',
            'root/io-solutions/e-textbook/',
            'root/io-features/customize.html',
            'root/io-features/integrate.html',
            'root/io-features/assess.html',
            'root/contact/',
            'root/about/',
            'root/about/team/',
            'root/partnerships/',
            'root/'
        ]
    }
].forEach(({ repo, urls })=>{
    urls.forEach((pageloadRelativeURL)=>{
        tests.push({
            test: [
                repo,
                'pageload',
                `/${pageloadRelativeURL}`
            ],
            type: 'pageload-test',
            url: `${repo}/${pageloadRelativeURL}`,
            priority: 4 // Fast to test, so test them more
        });
    });
});
// // Page-load tests (built)
// [
//
// ].forEach( ( { repo, urls } ) => {
//   urls.forEach( pageloadRelativeURL => {
//     tests.push( {
//       test: [ repo, 'pageload', `/${pageloadRelativeURL}` ],
//       type: 'pageload-test',
//       url: `${repo}/${pageloadRelativeURL}`,
//       priority: 5, // When these are built, it should be really quick to test
//
//       brand: 'phet',
//       es5: true
//     } );
//   } );
// } );
//----------------------------------------------------------------------------------------------------------------------
// Public query parameter tests
//----------------------------------------------------------------------------------------------------------------------
// test non-default public query parameter values to make sure there are no obvious problems.
const commonQueryParameters = {
    allowLinksFalse: 'brand=phet&fuzz&ea&allowLinks=false',
    screens1: 'brand=phet&fuzz&ea&screens=1',
    screens21: 'brand=phet&fuzz&ea&screens=2,1',
    screens21NoHome: 'brand=phet&fuzz&ea&screens=2,1&homeScreen=false',
    initialScreen2NoHome: 'brand=phet&fuzz&ea&initialScreen=2&homeScreen=false',
    initialScreen2: 'brand=phet&fuzz&ea&initialScreen=2',
    // Purposefully use incorrect syntax to make sure it is caught correctly without crashing
    screensVerbose: 'brand=phet&fuzz&screens=Screen1,Screen2',
    wrongInitialScreen1: 'brand=phet&fuzz&initialScreen=3',
    wrongInitialScreen2: 'brand=phet&fuzz&initialScreen=2&screens=1',
    wrongScreens1: 'brand=phet&fuzz&screens=3',
    wrongScreens2: 'brand=phet&fuzz&screens=1,2,3',
    screensOther: 'brand=phet&fuzz&screens=1.1,Screen2'
};
Object.keys(commonQueryParameters).forEach((name)=>{
    const queryString = commonQueryParameters[name];
    // randomly picked multi-screen sim to test query parameters (hence calling it a joist test)
    tests.push({
        test: [
            'joist',
            'fuzz',
            'unbuilt',
            'query-parameters',
            name
        ],
        type: 'sim-test',
        url: 'acid-base-solutions/acid-base-solutions_en.html',
        queryParameters: queryString
    });
});
/////////////////////////////////////////////////////
// PhET-iO migration testing
phetioHydrogenSims.forEach((testData)=>{
    const simName = testData.sim;
    const oldVersion = testData.version;
    const getTest = (reportContext)=>{
        return {
            test: [
                simName,
                'migration',
                `${oldVersion}->main`,
                reportContext
            ],
            type: 'wrapper-test',
            testQueryParameters: 'duration=80000',
            url: `phet-io-wrappers/migration/?sim=${simName}&oldVersion=${oldVersion}&phetioMigrationReport=${reportContext}` + '&locales=*&phetioDebug=true&phetioWrapperDebug=true&fuzz&migrationRate=5000&'
        };
    };
    tests.push(getTest('assert'));
    tests.push(getTest('dev')); // we still want to support state grace to make sure we don't fail while setting the state.
});
////////////////////////////////////////////
//----------------------------------------------------------------------------------------------------------------------
// Additional sim-specific tests
//----------------------------------------------------------------------------------------------------------------------
// beers-law-lab: test various query parameters
tests.push({
    test: [
        'beers-law-lab',
        'fuzz',
        'unbuilt',
        'query-parameters'
    ],
    type: 'sim-test',
    url: 'beers-law-lab/beers-law-lab_en.html',
    queryParameters: 'brand=phet&ea&fuzz&showSoluteAmount&concentrationMeterUnits=percent&beakerUnits=milliliters'
});
// circuit-construction-kit-ac: test various query parameters
tests.push({
    test: [
        'circuit-construction-kit-ac',
        'fuzz',
        'unbuilt',
        'query-parameters'
    ],
    type: 'sim-test',
    url: 'circuit-construction-kit-ac/circuit-construction-kit-ac_en.html',
    // Public query parameters that cannot be triggered from options within the sim
    queryParameters: 'brand=phet&ea&fuzz&showCurrent&addRealBulbs&moreWires&moreInductors'
});
// energy forms and changes: four blocks and one burner
tests.push({
    test: [
        'energy-forms-and-changes',
        'fuzz',
        'unbuilt',
        'query-parameters'
    ],
    type: 'sim-test',
    url: 'energy-forms-and-changes/energy-forms-and-changes_en.html',
    queryParameters: 'brand=phet&ea&fuzz&screens=1&elements=iron,brick,iron,brick&burners=1'
});
// energy forms and changes: two beakers and 2 burners
tests.push({
    test: [
        'energy-forms-and-changes',
        'fuzz',
        'unbuilt',
        'query-parameters-2'
    ],
    type: 'sim-test',
    url: 'energy-forms-and-changes/energy-forms-and-changes_en.html',
    queryParameters: 'brand=phet&ea&fuzz&screens=1&&elements=oliveOil,water&burners=2'
});
// gas-properties: test pressureNoise query parameter
tests.push({
    test: [
        'gas-properties',
        'fuzz',
        'unbuilt',
        'query-parameters'
    ],
    type: 'sim-test',
    url: 'gas-properties/gas-properties_en.html',
    queryParameters: 'brand=phet&ea&fuzz&pressureNoise=false'
});
// natural-selection: test various query parameters
tests.push({
    test: [
        'natural-selection',
        'fuzz',
        'unbuilt',
        'query-parameters'
    ],
    type: 'sim-test',
    url: 'natural-selection/natural-selection_en.html',
    queryParameters: 'brand=phet&ea&fuzz&allelesVisible=false&introMutations=F&introPopulation=10Ff&labMutations=FeT&labPopulation=2FFeett,2ffEEtt,2ffeeTT'
});
// natural-selection: run the generation clock faster, so that more things are liable to happen
tests.push({
    test: [
        'natural-selection',
        'fuzz',
        'unbuilt',
        'secondsPerGeneration'
    ],
    type: 'sim-test',
    url: 'natural-selection/natural-selection_en.html',
    queryParameters: 'brand=phet&ea&fuzz&secondsPerGeneration=1'
});
// ph-scale: test the autofill query parameter
tests.push({
    test: [
        'ph-scale',
        'autofill-fuzz',
        'unbuilt',
        'query-parameters'
    ],
    type: 'sim-test',
    url: 'ph-scale/ph-scale_en.html',
    queryParameters: 'brand=phet&ea&fuzz&autoFill=false'
});
// number-play: test the second language preference
tests.push({
    test: [
        'number-play',
        'second-language-fuzz',
        'unbuilt',
        'query-parameters'
    ],
    type: 'sim-test',
    url: 'number-play/number-play_en.html',
    queryParameters: 'brand=phet&ea&fuzz&locales=*&secondLocale=es'
});
// number-compare: test the second language preference
tests.push({
    test: [
        'number-compare',
        'second-language-fuzz',
        'unbuilt',
        'query-parameters'
    ],
    type: 'sim-test',
    url: 'number-compare/number-compare_en.html',
    queryParameters: 'brand=phet&ea&fuzz&locales=*&secondLocale=es'
});
// quadrilateral: tests the public query parameters for configurations that cannot be changed during runtime
tests.push({
    test: [
        'quadrilateral',
        'fuzz',
        'unbuilt',
        'query-parameters'
    ],
    type: 'sim-test',
    url: 'quadrilateral/quadrilateral_en.html',
    queryParameters: 'brand=phet&ea&fuzz&inheritTrapezoidSound&reducedStepSize'
});
// build-a-nucleus: tests the public query parameters for configurations that cannot be changed during runtime
const decayProtons = Math.floor(Math.random() * 94.99);
const decayNeutrons = Math.floor(Math.random() * 146.99);
const chartIntroProtons = Math.floor(Math.random() * 10.99);
const chartIntroNeutrons = Math.floor(Math.random() * 12.99);
tests.push({
    test: [
        'build-a-nucleus',
        'fuzz',
        'unbuilt',
        'query-parameters'
    ],
    type: 'sim-test',
    url: 'build-a-nucleus/build-a-nucleus_en.html',
    queryParameters: `brand=phet&ea&fuzz&decayScreenProtons=${decayProtons}&decayScreenNeutrons=${decayNeutrons}&chartIntoScreenProtons=${chartIntroProtons}&chartIntoScreenNeutrons=${chartIntroNeutrons}`
});
tests.push({
    test: [
        'build-a-nucleus',
        'fuzz',
        'unbuilt',
        'query-parameters-wrong'
    ],
    type: 'sim-test',
    url: 'build-a-nucleus/build-a-nucleus_en.html',
    queryParameters: 'brand=phet&ea&fuzz&decayScreenProtons=200&decayScreenNeutrons=200&chartIntoScreenProtons=200&chartIntoScreenNeutrons=200'
});
// my-solar-system
tests.push({
    test: [
        'my-solar-system',
        'custom-wrapper',
        'unbuilt'
    ],
    type: 'wrapper-test',
    testQueryParameters: 'duration=70000',
    url: 'phet-io-sim-specific/repos/my-solar-system/wrappers/my-solar-system-tests/?sim=my-solar-system&phetioDebug=true&phetioWrapperDebug=true'
});
// buoyancy
tests.push({
    test: [
        'buoyancy',
        'custom-wrapper',
        'unbuilt'
    ],
    type: 'wrapper-test',
    testQueryParameters: 'duration=70000',
    url: 'phet-io-sim-specific/repos/buoyancy/wrappers/buoyancy-tests/?sim=buoyancy&phetioDebug=true&phetioWrapperDebug=true'
});
console.log(JSON.stringify(tests, null, 2));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9saXN0Q29udGludW91c1Rlc3RzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBUaGlzIHByaW50cyBvdXQgKGluIEpTT04gZm9ybSkgdGhlIHRlc3RzIGFuZCBvcGVyYXRpb25zIHJlcXVlc3RlZCBmb3IgY29udGludW91cyB0ZXN0aW5nIGZvciB3aGF0ZXZlciBpcyBpbiBtYWluXG4gKiBhdCB0aGlzIHBvaW50LlxuICpcbiAqIHVzYWdlOiBzYWdlIHJ1biAuLi9wZXJlbm5pYWwvanMvbGlzdENvbnRpbnVvdXNUZXN0cy5qc1xuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBnZXRBY3RpdmVSZXBvcyA9IHJlcXVpcmUoICcuL2NvbW1vbi9nZXRBY3RpdmVSZXBvcycgKTtcbmNvbnN0IGdldFJlcG9MaXN0ID0gcmVxdWlyZSggJy4vY29tbW9uL2dldFJlcG9MaXN0JyApO1xuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XG5cbmNvbnN0IHJlcG9zID0gZ2V0QWN0aXZlUmVwb3MoKTtcbmNvbnN0IHBoZXRpb1JlcG9zID0gZ2V0UmVwb0xpc3QoICdwaGV0LWlvJyApO1xuY29uc3QgcGhldGlvQVBJU3RhYmxlUmVwb3MgPSBnZXRSZXBvTGlzdCggJ3BoZXQtaW8tYXBpLXN0YWJsZScgKTtcbmNvbnN0IHJ1bm5hYmxlUmVwb3MgPSBnZXRSZXBvTGlzdCggJ2FjdGl2ZS1ydW5uYWJsZXMnICk7XG5jb25zdCBpbnRlcmFjdGl2ZURlc2NyaXB0aW9uUmVwb3MgPSBnZXRSZXBvTGlzdCggJ2ludGVyYWN0aXZlLWRlc2NyaXB0aW9uJyApO1xuY29uc3QgcGhldGlvTm9VbnN1cHBvcnRlZFJlcG9zID0gZ2V0UmVwb0xpc3QoICdwaGV0LWlvLXN0YXRlLXVuc3VwcG9ydGVkJyApO1xuY29uc3QgdW5pdFRlc3RSZXBvcyA9IGdldFJlcG9MaXN0KCAndW5pdC10ZXN0cycgKTtcbmNvbnN0IHZvaWNpbmdSZXBvcyA9IGdldFJlcG9MaXN0KCAndm9pY2luZycgKTtcbmNvbnN0IHBoZXRpb1dyYXBwZXJTdWl0ZVdyYXBwZXJzID0gZ2V0UmVwb0xpc3QoICd3cmFwcGVycycgKTtcbmNvbnN0IHBoZXRpb0h5ZHJvZ2VuU2ltcyA9IEpTT04ucGFyc2UoIGZzLnJlYWRGaWxlU3luYyggYCR7X19kaXJuYW1lfS8uLi9kYXRhL3BoZXQtaW8taHlkcm9nZW4uanNvbmAsICd1dGY4JyApLnRyaW0oKSApO1xuXG4vLyByZXBvcyB0byBub3QgdGVzdCBtdWx0aXRvdWNoIGZ1enppbmdcbmNvbnN0IFJFUE9TX0VYQ0xVREVEX0ZST01fTVVMVElUT1VDSF9GVVpaSU5HID0gW1xuICAnbnVtYmVyLWNvbXBhcmUnLFxuICAnbnVtYmVyLXBsYXknXG5dO1xuXG5jb25zdCBSRVBPU19FWENMVURFRF9GUk9NX0xJU1RFTkVSX09SREVSX1JBTkRPTSA9IFtcbiAgJ2RlbnNpdHknLFxuICAnYnVveWFuY3knLFxuICAnYnVveWFuY3ktYmFzaWNzJyxcbiAgJ2ZvdXJpZXItbWFraW5nLXdhdmVzJyAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2ZvdXJpZXItbWFraW5nLXdhdmVzL2lzc3Vlcy8yNDBcbl07XG5cbi8qKlxuICoge0FycmF5LjxPYmplY3Q+fSB0ZXN0XG4gKiB7c3RyaW5nfSB0eXBlXG4gKiB7c3RyaW5nfSBbdXJsXVxuICoge3N0cmluZ30gW3JlcG9dXG4gKiB7c3RyaW5nfSBbcXVlcnlQYXJhbWV0ZXJzXVxuICoge3N0cmluZ30gW3Rlc3RRdWVyeVBhcmFtZXRlcnNdXG4gKiB7Ym9vbGVhbn0gW2VzNV1cbiAqIHtzdHJpbmd9IFticmFuZF1cbiAqIHtudW1iZXJ9IFtwcmlvcml0eT0xXSAtIGhpZ2hlciBwcmlvcml0aWVzIGFyZSB0ZXN0ZWQgbW9yZSBlYWdlcmx5XG4gKiB7QXJyYXkuPHN0cmluZz59IGJ1aWxkRGVwZW5kZW5jaWVzXG4gKi9cbmNvbnN0IHRlc3RzID0gW107XG5cbnRlc3RzLnB1c2goIHtcbiAgdGVzdDogWyAncGVyZW5uaWFsJywgJ2xpbnQnLCAnYWxsJyBdLFxuICB0eXBlOiAnbnBtLXJ1bicsXG4gIGNvbW1hbmQ6ICdsaW50LWFsbCcsXG4gIHJlcG86ICdwZXJlbm5pYWwnLFxuICBwcmlvcml0eTogMTAwXG59ICk7XG5cbnRlc3RzLnB1c2goIHtcbiAgdGVzdDogWyAncGVyZW5uaWFsJywgJ3R5cGUtY2hlY2snLCAnYWxsJyBdLFxuICB0eXBlOiAnbnBtLXJ1bicsXG4gIGNvbW1hbmQ6ICd0eXBlLWNoZWNrLWFsbCcsXG4gIHJlcG86ICdwZXJlbm5pYWwnLFxuICBwcmlvcml0eTogMTAwXG59ICk7XG5cblxuLy8gTm9kZSB1bml0IHRlc3RzXG5bICdjaGlwcGVyJywgJ3BlcmVubmlhbCcsICdwZXJlbm5pYWwtYWxpYXMnIF0uZm9yRWFjaCggcmVwbyA9PiB7XG4gIHRlc3RzLnB1c2goIHtcbiAgICB0ZXN0OiBbIHJlcG8sICdxdW5pdCcsICdub2RlJyBdLFxuICAgIHR5cGU6ICducG0tcnVuJyxcbiAgICBjb21tYW5kOiAndGVzdCcsIC8vIHJ1biBsaWtlIFwibnBtIHJ1biB0ZXN0XCJcbiAgICByZXBvOiByZXBvXG4gIH0gKTtcbn0gKTtcblxuLy8gcGhldCBhbmQgcGhldC1pbyBicmFuZCBidWlsZHNcbltcbiAgLi4ucnVubmFibGVSZXBvcyxcbiAgJ3NjZW5lcnknLFxuICAna2l0ZScsXG4gICdkb3QnXG5dLmZvckVhY2goIHJlcG8gPT4ge1xuICB0ZXN0cy5wdXNoKCB7XG4gICAgdGVzdDogWyByZXBvLCAnYnVpbGQnIF0sXG4gICAgdHlwZTogJ2J1aWxkJyxcbiAgICBicmFuZHM6IHBoZXRpb1JlcG9zLmluY2x1ZGVzKCByZXBvICkgPyBbICdwaGV0JywgJ3BoZXQtaW8nIF0gOiBbICdwaGV0JyBdLFxuICAgIHJlcG86IHJlcG8sXG4gICAgcHJpb3JpdHk6IDFcbiAgfSApO1xufSApO1xuXG4vLyBsaW50c1xucmVwb3MuZm9yRWFjaCggcmVwbyA9PiB7XG4gIGlmICggZnMuZXhpc3RzU3luYyggYC4uLyR7cmVwb30vR3J1bnRmaWxlLmNqc2AgKSApIHtcbiAgICB0ZXN0cy5wdXNoKCB7XG4gICAgICB0ZXN0OiBbIHJlcG8sICdsaW50JyBdLFxuICAgICAgdHlwZTogJ2xpbnQnLFxuICAgICAgcmVwbzogcmVwbyxcbiAgICAgIHByaW9yaXR5OiA4XG4gICAgfSApO1xuICB9XG59ICk7XG5cbnJ1bm5hYmxlUmVwb3MuZm9yRWFjaCggcmVwbyA9PiB7XG4gIHRlc3RzLnB1c2goIHtcbiAgICB0ZXN0OiBbIHJlcG8sICdmdXp6JywgJ3VuYnVpbHQnIF0sXG4gICAgdHlwZTogJ3NpbS10ZXN0JyxcbiAgICB1cmw6IGAke3JlcG99LyR7cmVwb31fZW4uaHRtbGAsXG4gICAgcXVlcnlQYXJhbWV0ZXJzOiAnYnJhbmQ9cGhldCZlYSZmdXp6JyxcbiAgICB0ZXN0UXVlcnlQYXJhbWV0ZXJzOiAnZHVyYXRpb249OTAwMDAnIC8vIFRoaXMgaXMgdGhlIG1vc3QgaW1wb3J0YW50IHRlc3QsIGxldCdzIGdldCBzb21lIGdvb2QgY292ZXJhZ2UhXG4gIH0gKTtcblxuICB0ZXN0cy5wdXNoKCB7XG4gICAgdGVzdDogWyByZXBvLCAneHNzLWZ1enonIF0sXG4gICAgdHlwZTogJ3NpbS10ZXN0JyxcbiAgICB1cmw6IGAke3JlcG99LyR7cmVwb31fZW4uaHRtbGAsXG4gICAgcXVlcnlQYXJhbWV0ZXJzOiAnYnJhbmQ9cGhldCZlYSZmdXp6JnN0cmluZ1Rlc3Q9eHNzJyxcbiAgICB0ZXN0UXVlcnlQYXJhbWV0ZXJzOiAnZHVyYXRpb249MTAwMDAnLFxuICAgIHByaW9yaXR5OiAwLjNcbiAgfSApO1xuXG4gIHRlc3RzLnB1c2goIHtcbiAgICB0ZXN0OiBbIHJlcG8sICdmdXp6JywgJ3VuYnVpbHQnLCAnYXNzZXJ0U2xvdycgXSxcbiAgICB0eXBlOiAnc2ltLXRlc3QnLFxuICAgIHVybDogYCR7cmVwb30vJHtyZXBvfV9lbi5odG1sYCxcbiAgICBxdWVyeVBhcmFtZXRlcnM6ICdicmFuZD1waGV0JmVhbGwmZnV6eicsXG4gICAgcHJpb3JpdHk6IDAuMDAxXG4gIH0gKTtcblxuICBpZiAoICFSRVBPU19FWENMVURFRF9GUk9NX0xJU1RFTkVSX09SREVSX1JBTkRPTS5pbmNsdWRlcyggcmVwbyApICkge1xuICAgIHRlc3RzLnB1c2goIHtcbiAgICAgIHRlc3Q6IFsgcmVwbywgJ2Z1enonLCAndW5idWlsdCcsICdsaXN0ZW5lck9yZGVyUmFuZG9tJyBdLFxuICAgICAgdHlwZTogJ3NpbS10ZXN0JyxcbiAgICAgIHVybDogYCR7cmVwb30vJHtyZXBvfV9lbi5odG1sYCxcbiAgICAgIHF1ZXJ5UGFyYW1ldGVyczogJ2JyYW5kPXBoZXQmZWEmZnV6eiZsaXN0ZW5lck9yZGVyPXJhbmRvbScsXG4gICAgICBwcmlvcml0eTogMC4zXG4gICAgfSApO1xuICB9XG5cbiAgLy8gZG9uJ3QgdGVzdCBzZWxlY3QgcmVwb3MgZm9yIGZ1enpQb2ludGVycz0yXG4gIGlmICggIVJFUE9TX0VYQ0xVREVEX0ZST01fTVVMVElUT1VDSF9GVVpaSU5HLmluY2x1ZGVzKCByZXBvICkgKSB7XG4gICAgdGVzdHMucHVzaCgge1xuICAgICAgdGVzdDogWyByZXBvLCAnbXVsdGl0b3VjaC1mdXp6JywgJ3VuYnVpbHQnIF0sXG4gICAgICB0eXBlOiAnc2ltLXRlc3QnLFxuICAgICAgdXJsOiBgJHtyZXBvfS8ke3JlcG99X2VuLmh0bWxgLFxuICAgICAgcXVlcnlQYXJhbWV0ZXJzOiAnYnJhbmQ9cGhldCZlYSZmdXp6JmZ1enpQb2ludGVycz0yJnN1cHBvcnRzUGFuQW5kWm9vbT1mYWxzZSdcbiAgICB9ICk7XG5cbiAgICB0ZXN0cy5wdXNoKCB7XG4gICAgICB0ZXN0OiBbIHJlcG8sICdwYW4tYW5kLXpvb20tZnV6eicsICd1bmJ1aWx0JyBdLFxuICAgICAgdHlwZTogJ3NpbS10ZXN0JyxcbiAgICAgIHVybDogYCR7cmVwb30vJHtyZXBvfV9lbi5odG1sYCxcbiAgICAgIHF1ZXJ5UGFyYW1ldGVyczogJ2JyYW5kPXBoZXQmZWEmZnV6eiZmdXp6UG9pbnRlcnM9MiZzdXBwb3J0c1BhbkFuZFpvb209dHJ1ZScsXG4gICAgICBwcmlvcml0eTogMC41IC8vIHRlc3QgdGhpcyB3aGVuIHRoZXJlIGlzbid0IG90aGVyIHdvcmsgdG8gYmUgZG9uZVxuICAgIH0gKTtcbiAgfVxuXG4gIHRlc3RzLnB1c2goIHtcbiAgICB0ZXN0OiBbIHJlcG8sICdmdXp6JywgJ2J1aWx0JyBdLFxuICAgIHR5cGU6ICdzaW0tdGVzdCcsXG4gICAgdXJsOiBgJHtyZXBvfS9idWlsZC9waGV0LyR7cmVwb31fZW5fcGhldC5odG1sYCxcbiAgICBxdWVyeVBhcmFtZXRlcnM6ICdmdXp6JyxcbiAgICB0ZXN0UXVlcnlQYXJhbWV0ZXJzOiAnZHVyYXRpb249ODAwMDAnLFxuXG4gICAgLy8gV2Ugd2FudCB0byBlbGV2YXRlIHRoZSBwcmlvcml0eSBzbyB0aGF0IHdlIGdldCBhIG1vcmUgZXZlbiBiYWxhbmNlICh3ZSBjYW4ndCB0ZXN0IHRoZXNlIHVudGlsIHRoZXkgYXJlIGJ1aWx0LFxuICAgIC8vIHdoaWNoIGRvZXNuJ3QgaGFwcGVuIGFsd2F5cylcbiAgICBwcmlvcml0eTogMixcblxuICAgIGJyYW5kOiAncGhldCcsXG4gICAgYnVpbGREZXBlbmRlbmNpZXM6IFsgcmVwbyBdLFxuICAgIGVzNTogdHJ1ZVxuICB9ICk7XG4gIHRlc3RzLnB1c2goIHtcbiAgICB0ZXN0OiBbIHJlcG8sICdmdXp6JywgJ2J1aWx0JywgJ2RlYnVnJyBdLFxuICAgIHR5cGU6ICdzaW0tdGVzdCcsXG4gICAgdXJsOiBgJHtyZXBvfS9idWlsZC9waGV0LyR7cmVwb31fZW5fcGhldF9kZWJ1Zy5odG1sYCxcbiAgICBxdWVyeVBhcmFtZXRlcnM6ICdmdXp6JyxcbiAgICB0ZXN0UXVlcnlQYXJhbWV0ZXJzOiAnZHVyYXRpb249ODAwMDAnLFxuXG4gICAgLy8gV2Ugd2FudCB0byBlbGV2YXRlIHRoZSBwcmlvcml0eSBzbyB0aGF0IHdlIGdldCBhIG1vcmUgZXZlbiBiYWxhbmNlICh3ZSBjYW4ndCB0ZXN0IHRoZXNlIHVudGlsIHRoZXkgYXJlIGJ1aWx0LFxuICAgIC8vIHdoaWNoIGRvZXNuJ3QgaGFwcGVuIGFsd2F5cylcbiAgICBwcmlvcml0eTogMixcblxuICAgIGJyYW5kOiAncGhldCcsXG4gICAgYnVpbGREZXBlbmRlbmNpZXM6IFsgcmVwbyBdXG4gIH0gKTtcblxuICBpZiAoIHBoZXRpb1JlcG9zLmluY2x1ZGVzKCByZXBvICkgKSB7XG4gICAgdGVzdHMucHVzaCgge1xuICAgICAgdGVzdDogWyByZXBvLCAnZnV6eicsICdidWlsdC1waGV0LWlvJyBdLFxuICAgICAgdHlwZTogJ3NpbS10ZXN0JyxcbiAgICAgIHVybDogYCR7cmVwb30vYnVpbGQvcGhldC1pby8ke3JlcG99X2FsbF9waGV0LWlvLmh0bWxgLFxuICAgICAgcXVlcnlQYXJhbWV0ZXJzOiAnZnV6eiZwaGV0aW9TdGFuZGFsb25lJyxcbiAgICAgIHRlc3RRdWVyeVBhcmFtZXRlcnM6ICdkdXJhdGlvbj04MDAwMCcsXG5cbiAgICAgIGJyYW5kOiAncGhldC1pbycsXG4gICAgICBidWlsZERlcGVuZGVuY2llczogWyByZXBvIF0sXG4gICAgICBlczU6IHRydWVcbiAgICB9ICk7XG4gIH1cbn0gKTtcblxucGhldGlvUmVwb3MuZm9yRWFjaCggcmVwbyA9PiB7XG5cbiAgdGVzdHMucHVzaCgge1xuICAgIHRlc3Q6IFsgcmVwbywgJ3BoZXQtaW8tZnV6eicsICd1bmJ1aWx0JyBdLFxuICAgIHR5cGU6ICdzaW0tdGVzdCcsXG4gICAgdXJsOiBgJHtyZXBvfS8ke3JlcG99X2VuLmh0bWxgLFxuICAgIHF1ZXJ5UGFyYW1ldGVyczogJ2VhJmJyYW5kPXBoZXQtaW8mcGhldGlvU3RhbmRhbG9uZSZmdXp6J1xuICB9ICk7XG5cbiAgdGVzdHMucHVzaCgge1xuICAgIHRlc3Q6IFsgcmVwbywgJ3BoZXQtaW8tZnV6eicsICd1bmJ1aWx0JywgJ2Fzc2VydFNsb3cnIF0sXG4gICAgdHlwZTogJ3NpbS10ZXN0JyxcbiAgICB1cmw6IGAke3JlcG99LyR7cmVwb31fZW4uaHRtbGAsXG4gICAgcXVlcnlQYXJhbWV0ZXJzOiAnZWFsbCZicmFuZD1waGV0LWlvJnBoZXRpb1N0YW5kYWxvbmUmZnV6eidcbiAgfSApO1xuXG4gIC8vIFRlc3QgZm9yIEFQSSBjb21wYXRpYmlsaXR5LCBmb3Igc2ltcyB0aGF0IHN1cHBvcnQgaXRcbiAgcGhldGlvQVBJU3RhYmxlUmVwb3MuaW5jbHVkZXMoIHJlcG8gKSAmJiB0ZXN0cy5wdXNoKCB7XG4gICAgdGVzdDogWyByZXBvLCAncGhldC1pby1hcGktY29tcGF0aWJpbGl0eScsICd1bmJ1aWx0JyBdLFxuICAgIHR5cGU6ICdzaW0tdGVzdCcsXG4gICAgdXJsOiBgJHtyZXBvfS8ke3JlcG99X2VuLmh0bWxgLFxuICAgIHF1ZXJ5UGFyYW1ldGVyczogJ2VhJmJyYW5kPXBoZXQtaW8mcGhldGlvU3RhbmRhbG9uZSZwaGV0aW9Db21wYXJlQVBJJnJhbmRvbVNlZWQ9MzMyMjExJmxvY2FsZXM9KiZ3ZWJnbD1mYWxzZScsIC8vIE5PVEU6IERVUExJQ0FUSU9OIEFMRVJUOiByYW5kb20gc2VlZCBtdXN0IG1hdGNoIHRoYXQgb2YgQVBJIGdlbmVyYXRpb24sIHNlZSBnZW5lcmF0ZVBoZXRpb01hY3JvQVBJXG4gICAgcHJpb3JpdHk6IDEuNSAvLyBtb3JlIG9mdGVuIHRoYW4gdGhlIGF2ZXJhZ2UgdGVzdFxuICB9ICk7XG5cbiAgY29uc3QgcGhldGlvU3RhdGVTdXBwb3J0ZWQgPSAhcGhldGlvTm9VbnN1cHBvcnRlZFJlcG9zLmluY2x1ZGVzKCByZXBvICk7XG5cbiAgLy8gcGhldC1pbyB3cmFwcGVycyB0ZXN0cyBmb3IgZWFjaCBQaEVULWlPIFNpbSwgdGhlc2UgdGVzdHMgcmVseSBvbiBwaGV0LWlvIHN0YXRlIHdvcmtpbmdcbiAgcGhldGlvU3RhdGVTdXBwb3J0ZWQgJiYgWyBmYWxzZSwgdHJ1ZSBdLmZvckVhY2goIHVzZUFzc2VydCA9PiB7XG4gICAgdGVzdHMucHVzaCgge1xuICAgICAgdGVzdDogWyByZXBvLCAncGhldC1pby13cmFwcGVycy10ZXN0cycsIHVzZUFzc2VydCA/ICdhc3NlcnQnIDogJ25vLWFzc2VydCcgXSxcbiAgICAgIHR5cGU6ICdxdW5pdC10ZXN0JyxcbiAgICAgIHVybDogYHBoZXQtaW8td3JhcHBlcnMvcGhldC1pby13cmFwcGVycy10ZXN0cy5odG1sP3NpbT0ke3JlcG99JHt1c2VBc3NlcnQgPyAnJnBoZXRpb0RlYnVnPXRydWUmcGhldGlvV3JhcHBlckRlYnVnPXRydWUnIDogJyd9YCxcbiAgICAgIHRlc3RRdWVyeVBhcmFtZXRlcnM6ICdkdXJhdGlvbj02MDAwMDAnIC8vIHBoZXQtaW8td3JhcHBlciB0ZXN0cyBsb2FkIHRoZSBzaW0gPjUgdGltZXNcbiAgICB9ICk7XG4gIH0gKTtcblxuICBjb25zdCB3cmFwcGVyc1RvSWdub3JlID0gWyAnbWlncmF0aW9uJywgJ3BsYXliYWNrJywgJ2xvZ2luJywgJ2lucHV0LXJlY29yZC1hbmQtcGxheWJhY2snIF07XG5cbiAgcGhldGlvV3JhcHBlclN1aXRlV3JhcHBlcnMuZm9yRWFjaCggd3JhcHBlclBhdGggPT4ge1xuXG4gICAgY29uc3Qgd3JhcHBlclBhdGhQYXJ0cyA9IHdyYXBwZXJQYXRoLnNwbGl0KCAnLycgKTtcbiAgICBjb25zdCB3cmFwcGVyTmFtZSA9IHdyYXBwZXJQYXRoUGFydHNbIHdyYXBwZXJQYXRoUGFydHMubGVuZ3RoIC0gMSBdO1xuXG4gICAgaWYgKCB3cmFwcGVyc1RvSWdub3JlLmluY2x1ZGVzKCB3cmFwcGVyTmFtZSApICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRlc3ROYW1lID0gYHBoZXQtaW8tJHt3cmFwcGVyTmFtZX0tZnV6emA7XG4gICAgY29uc3Qgd3JhcHBlclF1ZXJ5UGFyYW1ldGVycyA9IGBzaW09JHtyZXBvfSZsb2NhbGVzPSomcGhldGlvV3JhcHBlckRlYnVnPXRydWUmZnV6emA7XG5cbiAgICBpZiAoIHdyYXBwZXJOYW1lID09PSAnc3R1ZGlvJyApIHtcblxuICAgICAgLy8gZnV6eiB0ZXN0IGltcG9ydGFudCB3cmFwcGVyc1xuICAgICAgdGVzdHMucHVzaCgge1xuICAgICAgICB0ZXN0OiBbIHJlcG8sIHRlc3ROYW1lLCAndW5idWlsdCcgXSxcbiAgICAgICAgdHlwZTogJ3dyYXBwZXItdGVzdCcsXG4gICAgICAgIHVybDogYHN0dWRpby8/JHt3cmFwcGVyUXVlcnlQYXJhbWV0ZXJzfWBcbiAgICAgIH0gKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHdyYXBwZXJOYW1lID09PSAnc3RhdGUnICkge1xuXG4gICAgICAvLyBvbmx5IHRlc3Qgc3RhdGUgb24gcGhldC1pbyBzaW1zIHRoYXQgc3VwcG9ydCBpdFxuICAgICAgcGhldGlvU3RhdGVTdXBwb3J0ZWQgJiYgdGVzdHMucHVzaCgge1xuICAgICAgICB0ZXN0OiBbIHJlcG8sIHRlc3ROYW1lLCAndW5idWlsdCcgXSxcbiAgICAgICAgdHlwZTogJ3dyYXBwZXItdGVzdCcsXG4gICAgICAgIHVybDogYHBoZXQtaW8td3JhcHBlcnMvc3RhdGUvPyR7d3JhcHBlclF1ZXJ5UGFyYW1ldGVyc30mcGhldGlvRGVidWc9dHJ1ZWBcbiAgICAgIH0gKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0ZXN0cy5wdXNoKCB7XG4gICAgICAgIHRlc3Q6IFsgcmVwbywgdGVzdE5hbWUsICd1bmJ1aWx0JyBdLFxuICAgICAgICB0eXBlOiAnd3JhcHBlci10ZXN0JyxcbiAgICAgICAgdXJsOiBgcGhldC1pby13cmFwcGVycy8ke3dyYXBwZXJOYW1lfS8/JHt3cmFwcGVyUXVlcnlQYXJhbWV0ZXJzfSZwaGV0aW9EZWJ1Zz10cnVlYCxcbiAgICAgICAgdGVzdFF1ZXJ5UGFyYW1ldGVyczogYGR1cmF0aW9uPSR7d3JhcHBlck5hbWUgPT09ICdtdWx0aScgPyAnNjAwMDAnIDogJzE1MDAwJ31gXG4gICAgICB9ICk7XG4gICAgfVxuICB9ICk7XG59ICk7XG5cbmludGVyYWN0aXZlRGVzY3JpcHRpb25SZXBvcy5mb3JFYWNoKCByZXBvID0+IHtcbiAgdGVzdHMucHVzaCgge1xuICAgIHRlc3Q6IFsgcmVwbywgJ2ludGVyYWN0aXZlLWRlc2NyaXB0aW9uLWZ1enonLCAndW5idWlsdCcgXSxcbiAgICB0eXBlOiAnc2ltLXRlc3QnLFxuICAgIHVybDogYCR7cmVwb30vJHtyZXBvfV9lbi5odG1sYCxcbiAgICBxdWVyeVBhcmFtZXRlcnM6ICdicmFuZD1waGV0JmVhJmZ1enomc3VwcG9ydHNJbnRlcmFjdGl2ZURlc2NyaXB0aW9uPXRydWUnLFxuICAgIHRlc3RRdWVyeVBhcmFtZXRlcnM6ICdkdXJhdGlvbj00MDAwMCdcbiAgfSApO1xuXG4gIHRlc3RzLnB1c2goIHtcbiAgICB0ZXN0OiBbIHJlcG8sICdpbnRlcmFjdGl2ZS1kZXNjcmlwdGlvbi1mdXp6LWZ1enpCb2FyZC1jb21ibycsICd1bmJ1aWx0JyBdLFxuICAgIHR5cGU6ICdzaW0tdGVzdCcsXG4gICAgdXJsOiBgJHtyZXBvfS8ke3JlcG99X2VuLmh0bWxgLFxuICAgIHF1ZXJ5UGFyYW1ldGVyczogJ2JyYW5kPXBoZXQmZWEmc3VwcG9ydHNJbnRlcmFjdGl2ZURlc2NyaXB0aW9uPXRydWUmZnV6eiZmdXp6Qm9hcmQnLFxuICAgIHRlc3RRdWVyeVBhcmFtZXRlcnM6ICdkdXJhdGlvbj00MDAwMCdcbiAgfSApO1xuXG4gIHRlc3RzLnB1c2goIHtcbiAgICB0ZXN0OiBbIHJlcG8sICdpbnRlcmFjdGl2ZS1kZXNjcmlwdGlvbi1mdXp6Qm9hcmQnLCAndW5idWlsdCcgXSxcbiAgICB0eXBlOiAnc2ltLXRlc3QnLFxuICAgIHVybDogYCR7cmVwb30vJHtyZXBvfV9lbi5odG1sYCxcbiAgICBxdWVyeVBhcmFtZXRlcnM6ICdicmFuZD1waGV0JmVhJmZ1enpCb2FyZCZzdXBwb3J0c0ludGVyYWN0aXZlRGVzY3JpcHRpb249dHJ1ZScsXG4gICAgdGVzdFF1ZXJ5UGFyYW1ldGVyczogJ2R1cmF0aW9uPTQwMDAwJ1xuICB9ICk7XG5cbiAgdGVzdHMucHVzaCgge1xuICAgIHRlc3Q6IFsgcmVwbywgJ2ludGVyYWN0aXZlLWRlc2NyaXB0aW9uLWZ1enonLCAnYnVpbHQnIF0sXG4gICAgdHlwZTogJ3NpbS10ZXN0JyxcbiAgICB1cmw6IGAke3JlcG99L2J1aWxkL3BoZXQvJHtyZXBvfV9lbl9waGV0Lmh0bWxgLFxuICAgIHF1ZXJ5UGFyYW1ldGVyczogJ2Z1enomc3VwcG9ydHNJbnRlcmFjdGl2ZURlc2NyaXB0aW9uPXRydWUnLFxuICAgIHRlc3RRdWVyeVBhcmFtZXRlcnM6ICdkdXJhdGlvbj00MDAwMCcsXG5cbiAgICBicmFuZDogJ3BoZXQnLFxuICAgIGJ1aWxkRGVwZW5kZW5jaWVzOiBbIHJlcG8gXSxcbiAgICBlczU6IHRydWVcbiAgfSApO1xuXG4gIHRlc3RzLnB1c2goIHtcbiAgICB0ZXN0OiBbIHJlcG8sICdpbnRlcmFjdGl2ZS1kZXNjcmlwdGlvbi1mdXp6Qm9hcmQnLCAnYnVpbHQnIF0sXG4gICAgdHlwZTogJ3NpbS10ZXN0JyxcbiAgICB1cmw6IGAke3JlcG99L2J1aWxkL3BoZXQvJHtyZXBvfV9lbl9waGV0Lmh0bWxgLFxuICAgIHF1ZXJ5UGFyYW1ldGVyczogJ2Z1enpCb2FyZCZzdXBwb3J0c0ludGVyYWN0aXZlRGVzY3JpcHRpb249dHJ1ZScsXG4gICAgdGVzdFF1ZXJ5UGFyYW1ldGVyczogJ2R1cmF0aW9uPTQwMDAwJyxcblxuICAgIGJyYW5kOiAncGhldCcsXG4gICAgYnVpbGREZXBlbmRlbmNpZXM6IFsgcmVwbyBdLFxuICAgIGVzNTogdHJ1ZVxuICB9ICk7XG59ICk7XG5cbnZvaWNpbmdSZXBvcy5mb3JFYWNoKCByZXBvID0+IHtcbiAgdGVzdHMucHVzaCgge1xuICAgIHRlc3Q6IFsgcmVwbywgJ3ZvaWNpbmctZnV6eicsICd1bmJ1aWx0JyBdLFxuICAgIHR5cGU6ICdzaW0tdGVzdCcsXG4gICAgdXJsOiBgJHtyZXBvfS8ke3JlcG99X2VuLmh0bWxgLFxuICAgIHF1ZXJ5UGFyYW1ldGVyczogJ2JyYW5kPXBoZXQmZWEmZnV6eiZ2b2ljaW5nSW5pdGlhbGx5RW5hYmxlZCcsXG4gICAgdGVzdFF1ZXJ5UGFyYW1ldGVyczogJ2R1cmF0aW9uPTQwMDAwJ1xuICB9ICk7XG4gIHRlc3RzLnB1c2goIHtcbiAgICB0ZXN0OiBbIHJlcG8sICd2b2ljaW5nLWZ1enpCb2FyZCcsICd1bmJ1aWx0JyBdLFxuICAgIHR5cGU6ICdzaW0tdGVzdCcsXG4gICAgdXJsOiBgJHtyZXBvfS8ke3JlcG99X2VuLmh0bWxgLFxuICAgIHF1ZXJ5UGFyYW1ldGVyczogJ2JyYW5kPXBoZXQmZWEmZnV6ekJvYXJkJnZvaWNpbmdJbml0aWFsbHlFbmFibGVkJyxcbiAgICB0ZXN0UXVlcnlQYXJhbWV0ZXJzOiAnZHVyYXRpb249NDAwMDAnXG4gIH0gKTtcbn0gKTtcblxuLy8gcmVwby1zcGVjaWZpYyBVbml0IHRlc3RzICh1bmJ1aWx0IG1vZGUpIGZyb20gYGdydW50IGdlbmVyYXRlLXRlc3QtaGFybmVzc2BcbnVuaXRUZXN0UmVwb3MuZm9yRWFjaCggcmVwbyA9PiB7XG5cbiAgLy8gQWxsIHRlc3RzIHNob3VsZCB3b3JrIHdpdGggbm8gcXVlcnkgcGFyYW1ldGVycywgd2l0aCBhc3NlcnRpb25zIGVuYWJsZWQsIGFuZCBzaG91bGQgc3VwcG9ydCBQaEVULWlPIGFsc28sIHNvIHRlc3RcbiAgLy8gd2l0aCBicmFuZD1waGV0LWlvXG4gIGNvbnN0IHF1ZXJ5UGFyYW1ldGVycyA9IFsgJycsICc/ZWEnLCAnP2JyYW5kPXBoZXQtaW8nLCAnP2VhJmJyYW5kPXBoZXQtaW8nIF07XG4gIHF1ZXJ5UGFyYW1ldGVycy5mb3JFYWNoKCBxdWVyeVN0cmluZyA9PiB7XG5cbiAgICAvLyBEb24ndCB0ZXN0IHBoZXQtaW8gb3IgdGFuZGVtIHVuaXQgdGVzdHMgaW4gcGhldCBicmFuZCwgdGhleSBhcmUgbWVhbnQgZm9yIHBoZXQtaW8gYnJhbmRcbiAgICBpZiAoICggcmVwbyA9PT0gJ3BoZXQtaW8nIHx8IHJlcG8gPT09ICd0YW5kZW0nIHx8IHJlcG8gPT09ICdwaGV0LWlvLXdyYXBwZXJzJyApICYmICFxdWVyeVN0cmluZy5pbmNsdWRlcyggJ3BoZXQtaW8nICkgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICggcmVwbyA9PT0gJ3BoZXQtaW8td3JhcHBlcnMnICkge1xuICAgICAgcXVlcnlTdHJpbmcgKz0gJyZzaW09Z3Jhdml0eS1hbmQtb3JiaXRzJztcbiAgICB9XG4gICAgdGVzdHMucHVzaCgge1xuICAgICAgdGVzdDogWyByZXBvLCAndG9wLWxldmVsLXVuaXQtdGVzdHMnLCBgdW5idWlsdCR7cXVlcnlTdHJpbmd9YCBdLFxuICAgICAgdHlwZTogJ3F1bml0LXRlc3QnLFxuICAgICAgdXJsOiBgJHtyZXBvfS8ke3JlcG99LXRlc3RzLmh0bWwke3F1ZXJ5U3RyaW5nfWBcbiAgICB9ICk7XG4gIH0gKTtcbn0gKTtcblxuLy8gUGFnZS1sb2FkIHRlc3RzIChub24tYnVpbHQpXG5bIHtcbiAgcmVwbzogJ2RvdCcsXG4gIHVybHM6IFtcbiAgICAnJywgLy8gdGhlIHJvb3QgVVJMXG4gICAgJ2RvYy8nLFxuICAgICdleGFtcGxlcy8nLFxuICAgICdleGFtcGxlcy9jb252ZXgtaHVsbC0yLmh0bWwnLFxuICAgICd0ZXN0cy8nLFxuICAgICd0ZXN0cy9wbGF5Z3JvdW5kLmh0bWwnXG4gIF1cbn0sIHtcbiAgcmVwbzogJ2tpdGUnLFxuICB1cmxzOiBbXG4gICAgJycsIC8vIHRoZSByb290IFVSTFxuICAgICdkb2MvJyxcbiAgICAnZXhhbXBsZXMvJyxcbiAgICAndGVzdHMvJyxcbiAgICAndGVzdHMvcGxheWdyb3VuZC5odG1sJyxcbiAgICAndGVzdHMvdmlzdWFsLXNoYXBlLXRlc3QuaHRtbCdcbiAgXVxufSwge1xuICByZXBvOiAnc2NlbmVyeScsXG4gIHVybHM6IFtcbiAgICAnJywgLy8gdGhlIHJvb3QgVVJMXG4gICAgJ2RvYy8nLFxuICAgICdkb2MvYWNjZXNzaWJpbGl0eS9hY2Nlc3NpYmlsaXR5Lmh0bWwnLFxuICAgICdkb2MvYWNjZXNzaWJpbGl0eS92b2ljaW5nLmh0bWwnLFxuICAgICdkb2MvYS10b3VyLW9mLXNjZW5lcnkuaHRtbCcsXG4gICAgJ2RvYy9pbXBsZW1lbnRhdGlvbi1ub3Rlcy5odG1sJyxcbiAgICAnZG9jL2xheW91dC5odG1sJyxcbiAgICAnZG9jL3VzZXItaW5wdXQuaHRtbCcsXG4gICAgJ2V4YW1wbGVzLycsXG4gICAgJ2V4YW1wbGVzL2NyZWF0b3ItcGF0dGVybi5odG1sJyxcbiAgICAnZXhhbXBsZXMvY3Vyc29ycy5odG1sJyxcbiAgICAnZXhhbXBsZXMvaGVsbG8td29ybGQuaHRtbCcsXG4gICAgJ2V4YW1wbGVzL2lucHV0LW11bHRpcGxlLWRpc3BsYXlzLmh0bWwnLFxuICAgICdleGFtcGxlcy9pbnB1dC5odG1sJyxcbiAgICAnZXhhbXBsZXMvbW91c2Utd2hlZWwuaHRtbCcsXG4gICAgJ2V4YW1wbGVzL211bHRpLXRvdWNoLmh0bWwnLFxuICAgICdleGFtcGxlcy9ub2Rlcy5odG1sJyxcbiAgICAnZXhhbXBsZXMvc2hhcGVzLmh0bWwnLFxuICAgICdleGFtcGxlcy9zcHJpdGVzLmh0bWwnLFxuICAgICdleGFtcGxlcy9hY2Nlc3NpYmlsaXR5LXNoYXBlcy5odG1sJyxcbiAgICAnZXhhbXBsZXMvYWNjZXNzaWJpbGl0eS1idXR0b24uaHRtbCcsXG4gICAgJ2V4YW1wbGVzL2FjY2Vzc2liaWxpdHktYW5pbWF0aW9uLmh0bWwnLFxuICAgICdleGFtcGxlcy9hY2Nlc3NpYmlsaXR5LWxpc3RlbmVycy5odG1sJyxcbiAgICAnZXhhbXBsZXMvYWNjZXNzaWJpbGl0eS11cGRhdGluZy1wZG9tLmh0bWwnLFxuICAgICdleGFtcGxlcy9hY2Nlc3NpYmlsaXR5LXNsaWRlci5odG1sJyxcbiAgICAvLyAnZXhhbXBsZXMvd2ViZ2xub2RlLmh0bWwnLCAvLyBjdXJyZW50bHkgZGlzYWJsZWQsIHNpbmNlIGl0IGZhaWxzIHdpdGhvdXQgd2ViZ2xcbiAgICAndGVzdHMvJyxcbiAgICAndGVzdHMvcGxheWdyb3VuZC5odG1sJyxcbiAgICAndGVzdHMvcmVuZGVyZXItY29tcGFyaXNvbi5odG1sP3JlbmRlcmVycz1jYW52YXMsc3ZnLGRvbScsXG4gICAgJ3Rlc3RzL3NhbmRib3guaHRtbCcsXG4gICAgJ3Rlc3RzL3RleHQtYm91bmRzLWNvbXBhcmlzb24uaHRtbCcsXG4gICAgJ3Rlc3RzL3RleHQtcXVhbGl0eS10ZXN0Lmh0bWwnXG4gIF1cbn0sIHtcbiAgcmVwbzogJ3BoZXQtbGliJyxcbiAgdXJsczogW1xuICAgICdkb2MvbGF5b3V0LWV4ZW1wbGFycy5odG1sJ1xuICBdXG59LCB7XG4gIHJlcG86ICdwaGV0LWlvLXdyYXBwZXJzJyxcbiAgdXJsczogW1xuICAgICd0ZXN0cy9GQU1CLTIuMi1waGV0aW8td3JhcHBlci10ZXN0Lmh0bWwnXG4gIF1cbn0sIHtcbiAgcmVwbzogJ3BoZXQtaW8td2Vic2l0ZScsXG4gIHVybHM6IFtcbiAgICAncm9vdC9kZXZndWlkZS8nLFxuICAgICdyb290L2Rldmd1aWRlL2FwaV9vdmVydmlldy5odG1sJyxcbiAgICAncm9vdC9pby1zb2x1dGlvbnMvJyxcbiAgICAncm9vdC9pby1mZWF0dXJlcy8nLFxuICAgICdyb290L2lvLXNvbHV0aW9ucy92aXJ0dWFsLWxhYi9zYXR1cmF0aW9uLmh0bWwnLFxuICAgICdyb290L2lvLXNvbHV0aW9ucy9vbmxpbmUtaG9tZXdvcmsvJyxcbiAgICAncm9vdC9pby1zb2x1dGlvbnMvZS10ZXh0Ym9vay8nLFxuICAgICdyb290L2lvLWZlYXR1cmVzL2N1c3RvbWl6ZS5odG1sJyxcbiAgICAncm9vdC9pby1mZWF0dXJlcy9pbnRlZ3JhdGUuaHRtbCcsXG4gICAgJ3Jvb3QvaW8tZmVhdHVyZXMvYXNzZXNzLmh0bWwnLFxuICAgICdyb290L2NvbnRhY3QvJyxcbiAgICAncm9vdC9hYm91dC8nLFxuICAgICdyb290L2Fib3V0L3RlYW0vJyxcbiAgICAncm9vdC9wYXJ0bmVyc2hpcHMvJyxcbiAgICAncm9vdC8nXG4gIF1cbn0gXS5mb3JFYWNoKCAoIHsgcmVwbywgdXJscyB9ICkgPT4ge1xuICB1cmxzLmZvckVhY2goIHBhZ2Vsb2FkUmVsYXRpdmVVUkwgPT4ge1xuICAgIHRlc3RzLnB1c2goIHtcbiAgICAgIHRlc3Q6IFsgcmVwbywgJ3BhZ2Vsb2FkJywgYC8ke3BhZ2Vsb2FkUmVsYXRpdmVVUkx9YCBdLFxuICAgICAgdHlwZTogJ3BhZ2Vsb2FkLXRlc3QnLFxuICAgICAgdXJsOiBgJHtyZXBvfS8ke3BhZ2Vsb2FkUmVsYXRpdmVVUkx9YCxcbiAgICAgIHByaW9yaXR5OiA0IC8vIEZhc3QgdG8gdGVzdCwgc28gdGVzdCB0aGVtIG1vcmVcbiAgICB9ICk7XG4gIH0gKTtcbn0gKTtcblxuLy8gLy8gUGFnZS1sb2FkIHRlc3RzIChidWlsdClcbi8vIFtcbi8vXG4vLyBdLmZvckVhY2goICggeyByZXBvLCB1cmxzIH0gKSA9PiB7XG4vLyAgIHVybHMuZm9yRWFjaCggcGFnZWxvYWRSZWxhdGl2ZVVSTCA9PiB7XG4vLyAgICAgdGVzdHMucHVzaCgge1xuLy8gICAgICAgdGVzdDogWyByZXBvLCAncGFnZWxvYWQnLCBgLyR7cGFnZWxvYWRSZWxhdGl2ZVVSTH1gIF0sXG4vLyAgICAgICB0eXBlOiAncGFnZWxvYWQtdGVzdCcsXG4vLyAgICAgICB1cmw6IGAke3JlcG99LyR7cGFnZWxvYWRSZWxhdGl2ZVVSTH1gLFxuLy8gICAgICAgcHJpb3JpdHk6IDUsIC8vIFdoZW4gdGhlc2UgYXJlIGJ1aWx0LCBpdCBzaG91bGQgYmUgcmVhbGx5IHF1aWNrIHRvIHRlc3Rcbi8vXG4vLyAgICAgICBicmFuZDogJ3BoZXQnLFxuLy8gICAgICAgZXM1OiB0cnVlXG4vLyAgICAgfSApO1xuLy8gICB9ICk7XG4vLyB9ICk7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUHVibGljIHF1ZXJ5IHBhcmFtZXRlciB0ZXN0c1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8vIHRlc3Qgbm9uLWRlZmF1bHQgcHVibGljIHF1ZXJ5IHBhcmFtZXRlciB2YWx1ZXMgdG8gbWFrZSBzdXJlIHRoZXJlIGFyZSBubyBvYnZpb3VzIHByb2JsZW1zLlxuY29uc3QgY29tbW9uUXVlcnlQYXJhbWV0ZXJzID0ge1xuICBhbGxvd0xpbmtzRmFsc2U6ICdicmFuZD1waGV0JmZ1enomZWEmYWxsb3dMaW5rcz1mYWxzZScsXG4gIHNjcmVlbnMxOiAnYnJhbmQ9cGhldCZmdXp6JmVhJnNjcmVlbnM9MScsXG4gIHNjcmVlbnMyMTogJ2JyYW5kPXBoZXQmZnV6eiZlYSZzY3JlZW5zPTIsMScsXG4gIHNjcmVlbnMyMU5vSG9tZTogJ2JyYW5kPXBoZXQmZnV6eiZlYSZzY3JlZW5zPTIsMSZob21lU2NyZWVuPWZhbHNlJyxcbiAgaW5pdGlhbFNjcmVlbjJOb0hvbWU6ICdicmFuZD1waGV0JmZ1enomZWEmaW5pdGlhbFNjcmVlbj0yJmhvbWVTY3JlZW49ZmFsc2UnLFxuICBpbml0aWFsU2NyZWVuMjogJ2JyYW5kPXBoZXQmZnV6eiZlYSZpbml0aWFsU2NyZWVuPTInLFxuXG4gIC8vIFB1cnBvc2VmdWxseSB1c2UgaW5jb3JyZWN0IHN5bnRheCB0byBtYWtlIHN1cmUgaXQgaXMgY2F1Z2h0IGNvcnJlY3RseSB3aXRob3V0IGNyYXNoaW5nXG4gIHNjcmVlbnNWZXJib3NlOiAnYnJhbmQ9cGhldCZmdXp6JnNjcmVlbnM9U2NyZWVuMSxTY3JlZW4yJyxcbiAgd3JvbmdJbml0aWFsU2NyZWVuMTogJ2JyYW5kPXBoZXQmZnV6eiZpbml0aWFsU2NyZWVuPTMnLFxuICB3cm9uZ0luaXRpYWxTY3JlZW4yOiAnYnJhbmQ9cGhldCZmdXp6JmluaXRpYWxTY3JlZW49MiZzY3JlZW5zPTEnLFxuICB3cm9uZ1NjcmVlbnMxOiAnYnJhbmQ9cGhldCZmdXp6JnNjcmVlbnM9MycsXG4gIHdyb25nU2NyZWVuczI6ICdicmFuZD1waGV0JmZ1enomc2NyZWVucz0xLDIsMycsXG4gIHNjcmVlbnNPdGhlcjogJ2JyYW5kPXBoZXQmZnV6eiZzY3JlZW5zPTEuMSxTY3JlZW4yJ1xufTtcbk9iamVjdC5rZXlzKCBjb21tb25RdWVyeVBhcmFtZXRlcnMgKS5mb3JFYWNoKCBuYW1lID0+IHtcbiAgY29uc3QgcXVlcnlTdHJpbmcgPSBjb21tb25RdWVyeVBhcmFtZXRlcnNbIG5hbWUgXTtcblxuICAvLyByYW5kb21seSBwaWNrZWQgbXVsdGktc2NyZWVuIHNpbSB0byB0ZXN0IHF1ZXJ5IHBhcmFtZXRlcnMgKGhlbmNlIGNhbGxpbmcgaXQgYSBqb2lzdCB0ZXN0KVxuICB0ZXN0cy5wdXNoKCB7XG4gICAgdGVzdDogWyAnam9pc3QnLCAnZnV6eicsICd1bmJ1aWx0JywgJ3F1ZXJ5LXBhcmFtZXRlcnMnLCBuYW1lIF0sXG4gICAgdHlwZTogJ3NpbS10ZXN0JyxcbiAgICB1cmw6ICdhY2lkLWJhc2Utc29sdXRpb25zL2FjaWQtYmFzZS1zb2x1dGlvbnNfZW4uaHRtbCcsXG4gICAgcXVlcnlQYXJhbWV0ZXJzOiBxdWVyeVN0cmluZ1xuICB9ICk7XG59ICk7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBQaEVULWlPIG1pZ3JhdGlvbiB0ZXN0aW5nXG5waGV0aW9IeWRyb2dlblNpbXMuZm9yRWFjaCggdGVzdERhdGEgPT4ge1xuICBjb25zdCBzaW1OYW1lID0gdGVzdERhdGEuc2ltO1xuICBjb25zdCBvbGRWZXJzaW9uID0gdGVzdERhdGEudmVyc2lvbjtcbiAgY29uc3QgZ2V0VGVzdCA9IHJlcG9ydENvbnRleHQgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICB0ZXN0OiBbIHNpbU5hbWUsICdtaWdyYXRpb24nLCBgJHtvbGRWZXJzaW9ufS0+bWFpbmAsIHJlcG9ydENvbnRleHQgXSxcbiAgICAgIHR5cGU6ICd3cmFwcGVyLXRlc3QnLFxuICAgICAgdGVzdFF1ZXJ5UGFyYW1ldGVyczogJ2R1cmF0aW9uPTgwMDAwJywgLy8gTG9hZGluZyAyIHN0dWRpb3MgdGFrZXMgdGltZSFcbiAgICAgIHVybDogYHBoZXQtaW8td3JhcHBlcnMvbWlncmF0aW9uLz9zaW09JHtzaW1OYW1lfSZvbGRWZXJzaW9uPSR7b2xkVmVyc2lvbn0mcGhldGlvTWlncmF0aW9uUmVwb3J0PSR7cmVwb3J0Q29udGV4dH1gICtcbiAgICAgICAgICAgJyZsb2NhbGVzPSomcGhldGlvRGVidWc9dHJ1ZSZwaGV0aW9XcmFwcGVyRGVidWc9dHJ1ZSZmdXp6Jm1pZ3JhdGlvblJhdGU9NTAwMCYnXG4gICAgfTtcbiAgfTtcbiAgdGVzdHMucHVzaCggZ2V0VGVzdCggJ2Fzc2VydCcgKSApO1xuICB0ZXN0cy5wdXNoKCBnZXRUZXN0KCAnZGV2JyApICk7IC8vIHdlIHN0aWxsIHdhbnQgdG8gc3VwcG9ydCBzdGF0ZSBncmFjZSB0byBtYWtlIHN1cmUgd2UgZG9uJ3QgZmFpbCB3aGlsZSBzZXR0aW5nIHRoZSBzdGF0ZS5cbn0gKTtcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQWRkaXRpb25hbCBzaW0tc3BlY2lmaWMgdGVzdHNcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vLyBiZWVycy1sYXctbGFiOiB0ZXN0IHZhcmlvdXMgcXVlcnkgcGFyYW1ldGVyc1xudGVzdHMucHVzaCgge1xuICB0ZXN0OiBbICdiZWVycy1sYXctbGFiJywgJ2Z1enonLCAndW5idWlsdCcsICdxdWVyeS1wYXJhbWV0ZXJzJyBdLFxuICB0eXBlOiAnc2ltLXRlc3QnLFxuICB1cmw6ICdiZWVycy1sYXctbGFiL2JlZXJzLWxhdy1sYWJfZW4uaHRtbCcsXG4gIHF1ZXJ5UGFyYW1ldGVyczogJ2JyYW5kPXBoZXQmZWEmZnV6eiZzaG93U29sdXRlQW1vdW50JmNvbmNlbnRyYXRpb25NZXRlclVuaXRzPXBlcmNlbnQmYmVha2VyVW5pdHM9bWlsbGlsaXRlcnMnXG59ICk7XG5cbi8vIGNpcmN1aXQtY29uc3RydWN0aW9uLWtpdC1hYzogdGVzdCB2YXJpb3VzIHF1ZXJ5IHBhcmFtZXRlcnNcbnRlc3RzLnB1c2goIHtcbiAgdGVzdDogWyAnY2lyY3VpdC1jb25zdHJ1Y3Rpb24ta2l0LWFjJywgJ2Z1enonLCAndW5idWlsdCcsICdxdWVyeS1wYXJhbWV0ZXJzJyBdLFxuICB0eXBlOiAnc2ltLXRlc3QnLFxuICB1cmw6ICdjaXJjdWl0LWNvbnN0cnVjdGlvbi1raXQtYWMvY2lyY3VpdC1jb25zdHJ1Y3Rpb24ta2l0LWFjX2VuLmh0bWwnLFxuXG4gIC8vIFB1YmxpYyBxdWVyeSBwYXJhbWV0ZXJzIHRoYXQgY2Fubm90IGJlIHRyaWdnZXJlZCBmcm9tIG9wdGlvbnMgd2l0aGluIHRoZSBzaW1cbiAgcXVlcnlQYXJhbWV0ZXJzOiAnYnJhbmQ9cGhldCZlYSZmdXp6JnNob3dDdXJyZW50JmFkZFJlYWxCdWxicyZtb3JlV2lyZXMmbW9yZUluZHVjdG9ycydcbn0gKTtcblxuLy8gZW5lcmd5IGZvcm1zIGFuZCBjaGFuZ2VzOiBmb3VyIGJsb2NrcyBhbmQgb25lIGJ1cm5lclxudGVzdHMucHVzaCgge1xuICB0ZXN0OiBbICdlbmVyZ3ktZm9ybXMtYW5kLWNoYW5nZXMnLCAnZnV6eicsICd1bmJ1aWx0JywgJ3F1ZXJ5LXBhcmFtZXRlcnMnIF0sXG4gIHR5cGU6ICdzaW0tdGVzdCcsXG4gIHVybDogJ2VuZXJneS1mb3Jtcy1hbmQtY2hhbmdlcy9lbmVyZ3ktZm9ybXMtYW5kLWNoYW5nZXNfZW4uaHRtbCcsXG4gIHF1ZXJ5UGFyYW1ldGVyczogJ2JyYW5kPXBoZXQmZWEmZnV6eiZzY3JlZW5zPTEmZWxlbWVudHM9aXJvbixicmljayxpcm9uLGJyaWNrJmJ1cm5lcnM9MSdcbn0gKTtcblxuLy8gZW5lcmd5IGZvcm1zIGFuZCBjaGFuZ2VzOiB0d28gYmVha2VycyBhbmQgMiBidXJuZXJzXG50ZXN0cy5wdXNoKCB7XG4gIHRlc3Q6IFsgJ2VuZXJneS1mb3Jtcy1hbmQtY2hhbmdlcycsICdmdXp6JywgJ3VuYnVpbHQnLCAncXVlcnktcGFyYW1ldGVycy0yJyBdLFxuICB0eXBlOiAnc2ltLXRlc3QnLFxuICB1cmw6ICdlbmVyZ3ktZm9ybXMtYW5kLWNoYW5nZXMvZW5lcmd5LWZvcm1zLWFuZC1jaGFuZ2VzX2VuLmh0bWwnLFxuICBxdWVyeVBhcmFtZXRlcnM6ICdicmFuZD1waGV0JmVhJmZ1enomc2NyZWVucz0xJiZlbGVtZW50cz1vbGl2ZU9pbCx3YXRlciZidXJuZXJzPTInXG59ICk7XG5cbi8vIGdhcy1wcm9wZXJ0aWVzOiB0ZXN0IHByZXNzdXJlTm9pc2UgcXVlcnkgcGFyYW1ldGVyXG50ZXN0cy5wdXNoKCB7XG4gIHRlc3Q6IFsgJ2dhcy1wcm9wZXJ0aWVzJywgJ2Z1enonLCAndW5idWlsdCcsICdxdWVyeS1wYXJhbWV0ZXJzJyBdLFxuICB0eXBlOiAnc2ltLXRlc3QnLFxuICB1cmw6ICdnYXMtcHJvcGVydGllcy9nYXMtcHJvcGVydGllc19lbi5odG1sJyxcbiAgcXVlcnlQYXJhbWV0ZXJzOiAnYnJhbmQ9cGhldCZlYSZmdXp6JnByZXNzdXJlTm9pc2U9ZmFsc2UnXG59ICk7XG5cbi8vIG5hdHVyYWwtc2VsZWN0aW9uOiB0ZXN0IHZhcmlvdXMgcXVlcnkgcGFyYW1ldGVyc1xudGVzdHMucHVzaCgge1xuICB0ZXN0OiBbICduYXR1cmFsLXNlbGVjdGlvbicsICdmdXp6JywgJ3VuYnVpbHQnLCAncXVlcnktcGFyYW1ldGVycycgXSxcbiAgdHlwZTogJ3NpbS10ZXN0JyxcbiAgdXJsOiAnbmF0dXJhbC1zZWxlY3Rpb24vbmF0dXJhbC1zZWxlY3Rpb25fZW4uaHRtbCcsXG4gIHF1ZXJ5UGFyYW1ldGVyczogJ2JyYW5kPXBoZXQmZWEmZnV6eiZhbGxlbGVzVmlzaWJsZT1mYWxzZSZpbnRyb011dGF0aW9ucz1GJmludHJvUG9wdWxhdGlvbj0xMEZmJmxhYk11dGF0aW9ucz1GZVQmbGFiUG9wdWxhdGlvbj0yRkZlZXR0LDJmZkVFdHQsMmZmZWVUVCdcbn0gKTtcblxuLy8gbmF0dXJhbC1zZWxlY3Rpb246IHJ1biB0aGUgZ2VuZXJhdGlvbiBjbG9jayBmYXN0ZXIsIHNvIHRoYXQgbW9yZSB0aGluZ3MgYXJlIGxpYWJsZSB0byBoYXBwZW5cbnRlc3RzLnB1c2goIHtcbiAgdGVzdDogWyAnbmF0dXJhbC1zZWxlY3Rpb24nLCAnZnV6eicsICd1bmJ1aWx0JywgJ3NlY29uZHNQZXJHZW5lcmF0aW9uJyBdLFxuICB0eXBlOiAnc2ltLXRlc3QnLFxuICB1cmw6ICduYXR1cmFsLXNlbGVjdGlvbi9uYXR1cmFsLXNlbGVjdGlvbl9lbi5odG1sJyxcbiAgcXVlcnlQYXJhbWV0ZXJzOiAnYnJhbmQ9cGhldCZlYSZmdXp6JnNlY29uZHNQZXJHZW5lcmF0aW9uPTEnXG59ICk7XG5cbi8vIHBoLXNjYWxlOiB0ZXN0IHRoZSBhdXRvZmlsbCBxdWVyeSBwYXJhbWV0ZXJcbnRlc3RzLnB1c2goIHtcbiAgdGVzdDogWyAncGgtc2NhbGUnLCAnYXV0b2ZpbGwtZnV6eicsICd1bmJ1aWx0JywgJ3F1ZXJ5LXBhcmFtZXRlcnMnIF0sXG4gIHR5cGU6ICdzaW0tdGVzdCcsXG4gIHVybDogJ3BoLXNjYWxlL3BoLXNjYWxlX2VuLmh0bWwnLFxuICBxdWVyeVBhcmFtZXRlcnM6ICdicmFuZD1waGV0JmVhJmZ1enomYXV0b0ZpbGw9ZmFsc2UnXG59ICk7XG5cbi8vIG51bWJlci1wbGF5OiB0ZXN0IHRoZSBzZWNvbmQgbGFuZ3VhZ2UgcHJlZmVyZW5jZVxudGVzdHMucHVzaCgge1xuICB0ZXN0OiBbICdudW1iZXItcGxheScsICdzZWNvbmQtbGFuZ3VhZ2UtZnV6eicsICd1bmJ1aWx0JywgJ3F1ZXJ5LXBhcmFtZXRlcnMnIF0sXG4gIHR5cGU6ICdzaW0tdGVzdCcsXG4gIHVybDogJ251bWJlci1wbGF5L251bWJlci1wbGF5X2VuLmh0bWwnLFxuICBxdWVyeVBhcmFtZXRlcnM6ICdicmFuZD1waGV0JmVhJmZ1enombG9jYWxlcz0qJnNlY29uZExvY2FsZT1lcydcbn0gKTtcblxuLy8gbnVtYmVyLWNvbXBhcmU6IHRlc3QgdGhlIHNlY29uZCBsYW5ndWFnZSBwcmVmZXJlbmNlXG50ZXN0cy5wdXNoKCB7XG4gIHRlc3Q6IFsgJ251bWJlci1jb21wYXJlJywgJ3NlY29uZC1sYW5ndWFnZS1mdXp6JywgJ3VuYnVpbHQnLCAncXVlcnktcGFyYW1ldGVycycgXSxcbiAgdHlwZTogJ3NpbS10ZXN0JyxcbiAgdXJsOiAnbnVtYmVyLWNvbXBhcmUvbnVtYmVyLWNvbXBhcmVfZW4uaHRtbCcsXG4gIHF1ZXJ5UGFyYW1ldGVyczogJ2JyYW5kPXBoZXQmZWEmZnV6eiZsb2NhbGVzPSomc2Vjb25kTG9jYWxlPWVzJ1xufSApO1xuXG4vLyBxdWFkcmlsYXRlcmFsOiB0ZXN0cyB0aGUgcHVibGljIHF1ZXJ5IHBhcmFtZXRlcnMgZm9yIGNvbmZpZ3VyYXRpb25zIHRoYXQgY2Fubm90IGJlIGNoYW5nZWQgZHVyaW5nIHJ1bnRpbWVcbnRlc3RzLnB1c2goIHtcbiAgdGVzdDogWyAncXVhZHJpbGF0ZXJhbCcsICdmdXp6JywgJ3VuYnVpbHQnLCAncXVlcnktcGFyYW1ldGVycycgXSxcbiAgdHlwZTogJ3NpbS10ZXN0JyxcbiAgdXJsOiAncXVhZHJpbGF0ZXJhbC9xdWFkcmlsYXRlcmFsX2VuLmh0bWwnLFxuICBxdWVyeVBhcmFtZXRlcnM6ICdicmFuZD1waGV0JmVhJmZ1enomaW5oZXJpdFRyYXBlem9pZFNvdW5kJnJlZHVjZWRTdGVwU2l6ZSdcbn0gKTtcblxuLy8gYnVpbGQtYS1udWNsZXVzOiB0ZXN0cyB0aGUgcHVibGljIHF1ZXJ5IHBhcmFtZXRlcnMgZm9yIGNvbmZpZ3VyYXRpb25zIHRoYXQgY2Fubm90IGJlIGNoYW5nZWQgZHVyaW5nIHJ1bnRpbWVcbmNvbnN0IGRlY2F5UHJvdG9ucyA9IE1hdGguZmxvb3IoIE1hdGgucmFuZG9tKCkgKiA5NC45OSApO1xuY29uc3QgZGVjYXlOZXV0cm9ucyA9IE1hdGguZmxvb3IoIE1hdGgucmFuZG9tKCkgKiAxNDYuOTkgKTtcbmNvbnN0IGNoYXJ0SW50cm9Qcm90b25zID0gTWF0aC5mbG9vciggTWF0aC5yYW5kb20oKSAqIDEwLjk5ICk7XG5jb25zdCBjaGFydEludHJvTmV1dHJvbnMgPSBNYXRoLmZsb29yKCBNYXRoLnJhbmRvbSgpICogMTIuOTkgKTtcbnRlc3RzLnB1c2goIHtcbiAgdGVzdDogWyAnYnVpbGQtYS1udWNsZXVzJywgJ2Z1enonLCAndW5idWlsdCcsICdxdWVyeS1wYXJhbWV0ZXJzJyBdLFxuICB0eXBlOiAnc2ltLXRlc3QnLFxuICB1cmw6ICdidWlsZC1hLW51Y2xldXMvYnVpbGQtYS1udWNsZXVzX2VuLmh0bWwnLFxuICBxdWVyeVBhcmFtZXRlcnM6IGBicmFuZD1waGV0JmVhJmZ1enomZGVjYXlTY3JlZW5Qcm90b25zPSR7ZGVjYXlQcm90b25zfSZkZWNheVNjcmVlbk5ldXRyb25zPSR7ZGVjYXlOZXV0cm9uc30mY2hhcnRJbnRvU2NyZWVuUHJvdG9ucz0ke2NoYXJ0SW50cm9Qcm90b25zfSZjaGFydEludG9TY3JlZW5OZXV0cm9ucz0ke2NoYXJ0SW50cm9OZXV0cm9uc31gXG59ICk7XG5cbnRlc3RzLnB1c2goIHtcbiAgdGVzdDogWyAnYnVpbGQtYS1udWNsZXVzJywgJ2Z1enonLCAndW5idWlsdCcsICdxdWVyeS1wYXJhbWV0ZXJzLXdyb25nJyBdLFxuICB0eXBlOiAnc2ltLXRlc3QnLFxuICB1cmw6ICdidWlsZC1hLW51Y2xldXMvYnVpbGQtYS1udWNsZXVzX2VuLmh0bWwnLFxuICBxdWVyeVBhcmFtZXRlcnM6ICdicmFuZD1waGV0JmVhJmZ1enomZGVjYXlTY3JlZW5Qcm90b25zPTIwMCZkZWNheVNjcmVlbk5ldXRyb25zPTIwMCZjaGFydEludG9TY3JlZW5Qcm90b25zPTIwMCZjaGFydEludG9TY3JlZW5OZXV0cm9ucz0yMDAnXG59ICk7XG5cbi8vIG15LXNvbGFyLXN5c3RlbVxudGVzdHMucHVzaCgge1xuICB0ZXN0OiBbICdteS1zb2xhci1zeXN0ZW0nLCAnY3VzdG9tLXdyYXBwZXInLCAndW5idWlsdCcgXSxcbiAgdHlwZTogJ3dyYXBwZXItdGVzdCcsXG4gIHRlc3RRdWVyeVBhcmFtZXRlcnM6ICdkdXJhdGlvbj03MDAwMCcsIC8vIHRoZXJlIGFyZSBtdWx0aXBsZSBzeXN0ZW1zIHRvIHBsYXkgdGhyb3VnaCBhbmQgZnV6elxuICB1cmw6ICdwaGV0LWlvLXNpbS1zcGVjaWZpYy9yZXBvcy9teS1zb2xhci1zeXN0ZW0vd3JhcHBlcnMvbXktc29sYXItc3lzdGVtLXRlc3RzLz9zaW09bXktc29sYXItc3lzdGVtJnBoZXRpb0RlYnVnPXRydWUmcGhldGlvV3JhcHBlckRlYnVnPXRydWUnXG59ICk7XG5cbi8vIGJ1b3lhbmN5XG50ZXN0cy5wdXNoKCB7XG4gIHRlc3Q6IFsgJ2J1b3lhbmN5JywgJ2N1c3RvbS13cmFwcGVyJywgJ3VuYnVpbHQnIF0sXG4gIHR5cGU6ICd3cmFwcGVyLXRlc3QnLFxuICB0ZXN0UXVlcnlQYXJhbWV0ZXJzOiAnZHVyYXRpb249NzAwMDAnLCAvLyB0aGVyZSBhcmUgbXVsdGlwbGUgc3lzdGVtcyB0byBwbGF5IHRocm91Z2ggYW5kIGZ1enpcbiAgdXJsOiAncGhldC1pby1zaW0tc3BlY2lmaWMvcmVwb3MvYnVveWFuY3kvd3JhcHBlcnMvYnVveWFuY3ktdGVzdHMvP3NpbT1idW95YW5jeSZwaGV0aW9EZWJ1Zz10cnVlJnBoZXRpb1dyYXBwZXJEZWJ1Zz10cnVlJ1xufSApO1xuXG5jb25zb2xlLmxvZyggSlNPTi5zdHJpbmdpZnkoIHRlc3RzLCBudWxsLCAyICkgKTsiXSwibmFtZXMiOlsiZ2V0QWN0aXZlUmVwb3MiLCJyZXF1aXJlIiwiZ2V0UmVwb0xpc3QiLCJmcyIsInJlcG9zIiwicGhldGlvUmVwb3MiLCJwaGV0aW9BUElTdGFibGVSZXBvcyIsInJ1bm5hYmxlUmVwb3MiLCJpbnRlcmFjdGl2ZURlc2NyaXB0aW9uUmVwb3MiLCJwaGV0aW9Ob1Vuc3VwcG9ydGVkUmVwb3MiLCJ1bml0VGVzdFJlcG9zIiwidm9pY2luZ1JlcG9zIiwicGhldGlvV3JhcHBlclN1aXRlV3JhcHBlcnMiLCJwaGV0aW9IeWRyb2dlblNpbXMiLCJKU09OIiwicGFyc2UiLCJyZWFkRmlsZVN5bmMiLCJfX2Rpcm5hbWUiLCJ0cmltIiwiUkVQT1NfRVhDTFVERURfRlJPTV9NVUxUSVRPVUNIX0ZVWlpJTkciLCJSRVBPU19FWENMVURFRF9GUk9NX0xJU1RFTkVSX09SREVSX1JBTkRPTSIsInRlc3RzIiwicHVzaCIsInRlc3QiLCJ0eXBlIiwiY29tbWFuZCIsInJlcG8iLCJwcmlvcml0eSIsImZvckVhY2giLCJicmFuZHMiLCJpbmNsdWRlcyIsImV4aXN0c1N5bmMiLCJ1cmwiLCJxdWVyeVBhcmFtZXRlcnMiLCJ0ZXN0UXVlcnlQYXJhbWV0ZXJzIiwiYnJhbmQiLCJidWlsZERlcGVuZGVuY2llcyIsImVzNSIsInBoZXRpb1N0YXRlU3VwcG9ydGVkIiwidXNlQXNzZXJ0Iiwid3JhcHBlcnNUb0lnbm9yZSIsIndyYXBwZXJQYXRoIiwid3JhcHBlclBhdGhQYXJ0cyIsInNwbGl0Iiwid3JhcHBlck5hbWUiLCJsZW5ndGgiLCJ0ZXN0TmFtZSIsIndyYXBwZXJRdWVyeVBhcmFtZXRlcnMiLCJxdWVyeVN0cmluZyIsInVybHMiLCJwYWdlbG9hZFJlbGF0aXZlVVJMIiwiY29tbW9uUXVlcnlQYXJhbWV0ZXJzIiwiYWxsb3dMaW5rc0ZhbHNlIiwic2NyZWVuczEiLCJzY3JlZW5zMjEiLCJzY3JlZW5zMjFOb0hvbWUiLCJpbml0aWFsU2NyZWVuMk5vSG9tZSIsImluaXRpYWxTY3JlZW4yIiwic2NyZWVuc1ZlcmJvc2UiLCJ3cm9uZ0luaXRpYWxTY3JlZW4xIiwid3JvbmdJbml0aWFsU2NyZWVuMiIsIndyb25nU2NyZWVuczEiLCJ3cm9uZ1NjcmVlbnMyIiwic2NyZWVuc090aGVyIiwiT2JqZWN0Iiwia2V5cyIsIm5hbWUiLCJ0ZXN0RGF0YSIsInNpbU5hbWUiLCJzaW0iLCJvbGRWZXJzaW9uIiwidmVyc2lvbiIsImdldFRlc3QiLCJyZXBvcnRDb250ZXh0IiwiZGVjYXlQcm90b25zIiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwiZGVjYXlOZXV0cm9ucyIsImNoYXJ0SW50cm9Qcm90b25zIiwiY2hhcnRJbnRyb05ldXRyb25zIiwiY29uc29sZSIsImxvZyIsInN0cmluZ2lmeSJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Ozs7O0NBT0MsR0FFRCxNQUFNQSxpQkFBaUJDLFFBQVM7QUFDaEMsTUFBTUMsY0FBY0QsUUFBUztBQUM3QixNQUFNRSxLQUFLRixRQUFTO0FBRXBCLE1BQU1HLFFBQVFKO0FBQ2QsTUFBTUssY0FBY0gsWUFBYTtBQUNqQyxNQUFNSSx1QkFBdUJKLFlBQWE7QUFDMUMsTUFBTUssZ0JBQWdCTCxZQUFhO0FBQ25DLE1BQU1NLDhCQUE4Qk4sWUFBYTtBQUNqRCxNQUFNTywyQkFBMkJQLFlBQWE7QUFDOUMsTUFBTVEsZ0JBQWdCUixZQUFhO0FBQ25DLE1BQU1TLGVBQWVULFlBQWE7QUFDbEMsTUFBTVUsNkJBQTZCVixZQUFhO0FBQ2hELE1BQU1XLHFCQUFxQkMsS0FBS0MsS0FBSyxDQUFFWixHQUFHYSxZQUFZLENBQUUsR0FBR0MsVUFBVSw4QkFBOEIsQ0FBQyxFQUFFLFFBQVNDLElBQUk7QUFFbkgsdUNBQXVDO0FBQ3ZDLE1BQU1DLHlDQUF5QztJQUM3QztJQUNBO0NBQ0Q7QUFFRCxNQUFNQyw0Q0FBNEM7SUFDaEQ7SUFDQTtJQUNBO0lBQ0EsdUJBQXVCLGtFQUFrRTtDQUMxRjtBQUVEOzs7Ozs7Ozs7OztDQVdD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