// Copyright 2024, University of Colorado Boulder
/**
 * General checks to ensure release branches are working as expected.
 *
 * Different tests were added from various MR work. Paper trails:
 * - 3/20/24: Checking yotta=false (https://github.com/phetsims/phetcommon/issues/65) and yotta*=*
 *   (https://github.com/phetsims/phetcommon/issues/66) behavior on non-refreshed release branches.
 * - 5/14/24: new locale query parameter parsing: running on BABEL/localeData and supporting locale3/fallbacks/etc. (https://github.com/phetsims/joist/issues/963)
 * - 6/14/24: second locale MR for supporting in Standard PhET-iO Wrapper. (https://github.com/phetsims/joist/issues/970)
 *
 * USAGE:
 * cd perennial;
 * node js/scripts/test/release-branch-checks.js
 *
 * NOTE: refresh release branches if not doing an active MR:
 * cd perennial;
 * node js/scripts/main-pull-status.js --allBranches
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ // Used for evaluating browser-side code in puppeteer tests.
/* global window document phet phetio */ function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
const _ = require('lodash');
const puppeteerLoad = require('../../common/puppeteerLoad');
const Maintenance = require('../../common/Maintenance');
const withServer = require('../../common/withServer');
const winston = require('winston');
const puppeteer = require('puppeteer');
const fs = require('fs');
winston.default.transports.console.level = 'error';
////////////////////////
// RUNNING OPTIONS:
// Test one sim from main, instead of from release-branches/. To test from main, ensure you first run
// `cd acid-base-solutions; grunt --brands=phet,phet-io --locales=*`
const TEST_FROM_MAIN = false;
// Log tests that pass in addition to failures.
const VERBOSE_LOG_SUCCESS = false;
// Specific tests to run
const TEST_LOCALES = true; // general locale feature upgrade
const TEST_ANALYTICS = false; // GA analytics testing
const TEST_PHET_IO_LOCALE = true; // phet-io + standard wrapper locale testing
const SKIP_TITLE_STRING_PATTERN = true;
///////////////////////////////////////////////
const localeData = JSON.parse(fs.readFileSync('../babel/localeData.json', 'utf8'));
const logResult = (success, message, url)=>{
    if (success) {
        VERBOSE_LOG_SUCCESS && console.log(`      [OK] ${message} URL: ${url}`);
    } else {
        console.log(`  [FAIL] ${message} URL: ${url}`);
    }
};
_async_to_generator(function*() {
    const browser = yield puppeteer.launch({
        args: [
            '--disable-gpu'
        ]
    });
    // Use withServer for cross-dev environment execution.
    yield withServer(/*#__PURE__*/ _async_to_generator(function*(port) {
        const releaseBranches = TEST_FROM_MAIN ? [
            null
        ] : yield Maintenance.loadAllMaintenanceBranches();
        const getBuiltURLs = /*#__PURE__*/ _async_to_generator(function*(releaseBranch) {
            const urls = [];
            const repo = releaseBranch ? releaseBranch.repo : 'acid-base-solutions';
            const branch = releaseBranch ? releaseBranch.branch : 'main';
            const releaseBranchPath = releaseBranch ? `release-branches/${repo}-${branch}/` : '';
            const buildDir = `http://localhost:${port}/${releaseBranchPath}${repo}/build`;
            if (!releaseBranch) {
                urls.push(`${buildDir}/phet/${repo}_all_phet_debug.html?webgl=false`);
                urls.push(`${buildDir}/phet-io/${repo}_all_phet-io.html?webgl=false&phetioStandalone`);
                return urls;
            }
            const usesChipper2 = yield releaseBranch.usesChipper2();
            if (releaseBranch.brands.includes('phet')) {
                urls.push(`${buildDir}/${usesChipper2 ? 'phet/' : ''}${repo}_all${usesChipper2 ? '_phet' : ''}.html?webgl=false`);
            }
            if (releaseBranch.brands.includes('phet-io')) {
                const standaloneParams = yield releaseBranch.getPhetioStandaloneQueryParameter();
                const phetioSuffix = usesChipper2 ? '_all_phet-io' : '_en-phetio';
                urls.push(`${buildDir}/${usesChipper2 ? 'phet-io/' : ''}${repo}${phetioSuffix}.html?${standaloneParams}&webgl=false`);
            }
            return urls;
        });
        const getUnbuiltURLs = /*#__PURE__*/ _async_to_generator(function*(releaseBranch) {
            const urls = [];
            if (!releaseBranch) {
                const repo = 'acid-base-solutions';
                urls.push(`http://localhost:${port}/${repo}/${repo}_en.html?webgl=false`);
                urls.push(`http://localhost:${port}/${repo}/${repo}_en.html?webgl=false&brand=phet-io&phetioStandalone`);
                return urls;
            }
            const repo = releaseBranch.repo;
            const branch = releaseBranch.branch;
            urls.push(`http://localhost:${port}/release-branches/${repo}-${branch}/${repo}/${repo}_en.html?webgl=false`);
            if (releaseBranch.brands.includes('phet-io')) {
                const standaloneParams = yield releaseBranch.getPhetioStandaloneQueryParameter();
                urls.push(`http://localhost:${port}/release-branches/${repo}-${branch}/${repo}/${repo}_en.html?webgl=false&${standaloneParams}&brand=phet-io`);
            }
            return urls;
        });
        const getAllURLs = /*#__PURE__*/ _async_to_generator(function*(releaseBranch) {
            return [
                ...yield getBuiltURLs(releaseBranch),
                ...yield getUnbuiltURLs(releaseBranch)
            ];
        });
        const getLoadedURLs = /*#__PURE__*/ _async_to_generator(function*(url) {
            const urls = [];
            yield puppeteerLoad(url, {
                onPageCreation: (page)=>page.on('request', (request)=>{
                        const url = request.url();
                        if (!url.startsWith('data:')) {
                            urls.push(url);
                        }
                    }),
                gotoTimeout: 60000,
                waitAfterLoad: 3000,
                browser: browser
            });
            return urls;
        });
        const demoYottaQueryParameterKey = 'yottaSomeFlag';
        const demoYottaQueryParameterValue = 'someValue';
        const analyzeURLs = (urls)=>{
            return {
                sentGoogleAnalytics: urls.some((url)=>url.includes('collect?')),
                sentYotta: urls.some((url)=>url.includes('yotta/immediate.gif')),
                sentExternalRequest: urls.some((url)=>!url.startsWith('http://localhost')),
                hasDemoYottaQueryParameter: urls.some((url)=>{
                    return new URLSearchParams(new URL(url).search).get(demoYottaQueryParameterKey) === demoYottaQueryParameterValue;
                })
            };
        };
        const evaluate = /*#__PURE__*/ _async_to_generator(function*(url, evaluate, options) {
            try {
                return yield puppeteerLoad(url, _extends({}, options, {
                    evaluate: evaluate,
                    gotoTimeout: 60000,
                    waitAfterLoad: 2000,
                    allowedTimeToLoad: 40000,
                    browser: browser
                }));
            } catch (e) {
                console.log('    ERROR', e.message.split('\n')[0]);
                return `error running ${url}`;
            }
        });
        for (const releaseBranch of releaseBranches){
            // releaseBranch=== null when running on main
            const isUnbultOnMain = !releaseBranch;
            const repo = isUnbultOnMain ? 'acid-base-solutions' : releaseBranch.repo;
            const branch = isUnbultOnMain ? 'main' : releaseBranch.branch;
            const releaseBranchPath = isUnbultOnMain ? '' : `release-branches/${repo}-${branch}/`;
            const urls = yield getAllURLs(releaseBranch);
            console.log('-', releaseBranch ? releaseBranch.toString() : repo);
            for (const url of urls){
                // Because `planet` and `planet.controls.title` keys present in translations OVERLAP in the string object created by
                // getStringModule, and FAILS hard on these. Built versions work ok.
                if (repo === 'gravity-force-lab' && branch === '2.2' && url.includes('_en.html')) {
                    console.log(' skipping gravity-force-lab 2.2 unbuilt, since planet / planet.controls.title strings in translations will not run in unbuilt mode');
                    continue;
                }
                if (repo === 'gravity-force-lab-basics' && branch === '1.1' && url.includes('_en.html')) {
                    console.log(' skipping gravity-force-lab 2.2 unbuilt, since planet / planet.controls.title strings in translations will not run in unbuilt mode');
                    continue;
                }
                const getUrlWithLocale = (locale)=>url.includes('?') ? `${url}&locale=${locale}` : `${url}?locale=${locale}`;
                const getLocaleSpecificURL = (locale)=>{
                    return isUnbultOnMain ? url.replace('_all_phet_debug', `_${locale}_phet`) : url.replace('_all', `_${locale}`);
                };
                const logStatus = (status, message, loggedURL = url)=>{
                    logResult(status, message, loggedURL);
                };
                if (TEST_LOCALES) {
                    // Check locale MR. es_PY should always be in localeData
                    const localeValues = yield evaluate(url, ()=>{
                        var _phet_chipper_localeData;
                        return [
                            !!phet.chipper.localeData,
                            !!((_phet_chipper_localeData = phet.chipper.localeData) == null ? void 0 : _phet_chipper_localeData.es_PY)
                        ];
                    });
                    logStatus(localeValues[0] && localeValues[1], 'localeData (general, es_PY)');
                    const getRunningLocale = /*#__PURE__*/ _async_to_generator(function*(locale) {
                        return evaluate(getUrlWithLocale(locale), ()=>phet.chipper.locale);
                    });
                    const esLocale = yield getRunningLocale('es');
                    logStatus(esLocale === 'es', 'es phet.chipper.locale');
                    const spaLocale = yield getRunningLocale('spa');
                    logStatus(spaLocale === 'es', 'spa phet.chipper.locale');
                    const espyLocale = yield getRunningLocale('ES_PY');
                    logStatus(espyLocale === 'es' || espyLocale === 'es_PY', 'ES_PY phet.chipper.locale');
                    const armaLocale = yield getRunningLocale('ar_SA');
                    const armaStatus = armaLocale === 'ar' || armaLocale === 'ar_SA' || armaLocale === 'ar_MA' || repo.includes('projectile-') && armaLocale === 'en';
                    logStatus(armaStatus, 'ar_SA phet.chipper.locale');
                    const invalidLocale = yield getRunningLocale('aenrtpyarntSRTS');
                    logStatus(invalidLocale === 'en', 'nonsense phet.chipper.locale');
                    const repoPackageObject = JSON.parse(fs.readFileSync(`../${repo}/package.json`, 'utf8'));
                    // Title testing
                    {
                        // We would be testing the English version(!)
                        if (!url.includes('_en-phetio')) {
                            const partialPotentialTitleStringKey = `${repo}.title`;
                            const fullPotentialTitleStringKey = `${repoPackageObject.phet.requirejsNamespace}/${partialPotentialTitleStringKey}`;
                            const hasTitleKey = SKIP_TITLE_STRING_PATTERN ? true : yield evaluate(url, `!!phet.chipper.strings.en[ "${fullPotentialTitleStringKey}" ]`);
                            if (hasTitleKey) {
                                const getTitle = /*#__PURE__*/ _async_to_generator(function*(locale) {
                                    return evaluate(getUrlWithLocale(locale), ()=>document.title, {
                                        // PhET-iO Hydrogen sims won't have this behavior until the localeProperty has statically imported/loaded
                                        waitForFunction: '(phet.joist?.sim && !phet.joist.sim.isConstructionCompleteProperty) || phet.joist?.sim?.isConstructionCompleteProperty.value'
                                    });
                                });
                                // null if could not be found
                                const lookupSpecificTitleTranslation = (locale)=>{
                                    var _json_partialPotentialTitleStringKey;
                                    let json;
                                    if (locale === 'en') {
                                        json = JSON.parse(fs.readFileSync(`../${repo}/${repo}-strings_en.json`, 'utf8'));
                                    } else {
                                        try {
                                            json = JSON.parse(fs.readFileSync(`../babel/${repo}/${repo}-strings_${locale}.json`, 'utf8'));
                                        } catch (e) {
                                            return null;
                                        }
                                    }
                                    var _json_partialPotentialTitleStringKey_value;
                                    return (_json_partialPotentialTitleStringKey_value = (_json_partialPotentialTitleStringKey = json[partialPotentialTitleStringKey]) == null ? void 0 : _json_partialPotentialTitleStringKey.value) != null ? _json_partialPotentialTitleStringKey_value : null;
                                };
                                const lookupFallbackTitle = (locale)=>{
                                    var _localeData_locale;
                                    const locales = [
                                        locale,
                                        ...((_localeData_locale = localeData[locale]) == null ? void 0 : _localeData_locale.fallbackLocales) || [],
                                        'en'
                                    ];
                                    for (const testLocale of locales){
                                        const title = lookupSpecificTitleTranslation(testLocale);
                                        if (title) {
                                            return title;
                                        }
                                    }
                                    throw new Error(`could not compute fallback title for locale ${locale}`);
                                };
                                const checkTitle = /*#__PURE__*/ _async_to_generator(function*(locale, lookupLocale) {
                                    const actualTitle = yield getTitle(locale);
                                    const expectedTitle = lookupFallbackTitle(lookupLocale);
                                    if (actualTitle.trim().includes(expectedTitle.trim())) {
                                        return null;
                                    } else {
                                        return `Actual title ${JSON.stringify(actualTitle)} does not match expected title ${JSON.stringify(expectedTitle)} for locale ${locale} / ${lookupLocale}`;
                                    }
                                });
                                const esTitleError = yield checkTitle('es', 'es');
                                logStatus(!esTitleError, `es title ${esTitleError}`);
                                const spaTitleError = yield checkTitle('spa', 'es');
                                logStatus(!spaTitleError, `spa title ${spaTitleError}`);
                                const espyTitleError = yield checkTitle('ES_PY', 'es_PY');
                                logStatus(!espyTitleError, `ES_PY title ${espyTitleError}`);
                            } else {
                                logResult(false, 'could not find title string key', url);
                            }
                        }
                    }
                    // QueryStringMachine.warnings testing
                    {
                        // boolean | null - null if warnings array not supported
                        const getHasQSMWarning = /*#__PURE__*/ _async_to_generator(function*(locale) {
                            return evaluate(getUrlWithLocale(locale), '( window.QueryStringMachine && QueryStringMachine.warnings !== undefined ) ? ( QueryStringMachine.warnings.length > 0 ) : null');
                        });
                        logStatus(!(yield getHasQSMWarning('en')), 'en QSM warning');
                        logStatus(!(yield getHasQSMWarning('ES')), 'ES QSM warning');
                        logStatus(!(yield getHasQSMWarning('XX')), 'XX QSM warning');
                        logStatus(!(yield getHasQSMWarning('XX-wX')), 'XX-wX QSM warning');
                        logStatus((yield getHasQSMWarning('alkrtnalrc9SRTXX')) !== false, 'nonsense QSM warning (expected)');
                    }
                    const nonEnglishTranslationLocales = fs.readdirSync(`../${releaseBranchPath}babel/${repo}/`).filter((file)=>file.startsWith(`${repo}-strings_`)).map((file)=>file.substring(file.indexOf('_') + 1, file.lastIndexOf('.')));
                    const getSomeRandomTranslatedLocales = ()=>{
                        return _.uniq([
                            'en',
                            'es',
                            ..._.sampleSize(nonEnglishTranslationLocales, 8)
                        ]);
                    };
                    const includedDataLocales = _.sortBy(_.uniq([
                        // Always include the fallback (en)
                        'en',
                        // Include directly-used locales
                        ...nonEnglishTranslationLocales,
                        // Include locales that will fall back to directly-used locales
                        ...Object.keys(localeData).filter((locale)=>{
                            return localeData[locale].fallbackLocales && localeData[locale].fallbackLocales.some((fallbackLocale)=>{
                                return nonEnglishTranslationLocales.includes(fallbackLocale);
                            });
                        })
                    ]));
                    // Check presence of included data locales
                    {
                        const dataLocaleCheck = yield evaluate(getUrlWithLocale('en'), `${JSON.stringify(includedDataLocales)}.every( locale => phet.chipper.localeData[ locale ] )`);
                        logStatus(dataLocaleCheck, 'All included data locales present');
                    }
                    // Locale-specific file testing (everything has _es)
                    {
                        if (!url.includes('phet-io') && !url.includes('phetio') && url.includes('/build/')) {
                            for (const locale of getSomeRandomTranslatedLocales()){
                                const specificURL = getLocaleSpecificURL(locale);
                                const checkLocale = yield evaluate(specificURL, ()=>phet.chipper.locale);
                                logStatus(checkLocale === locale, `Locale-specific ${locale} build should be ${checkLocale}`, specificURL);
                            }
                        }
                    }
                    // Translation _all testing
                    {
                        for (const locale of getSomeRandomTranslatedLocales()){
                            logStatus((yield getRunningLocale(locale)) === locale, `_all test for locale ${locale}`);
                        }
                    }
                }
                if (TEST_ANALYTICS && url.includes('/build/')) {
                    const plainURL = url;
                    const plainAnalysis = analyzeURLs((yield getLoadedURLs(plainURL)));
                    if (!plainAnalysis.sentGoogleAnalytics) {
                        logResult(false, 'No Google Analytics sent', plainURL);
                    }
                    if (!plainAnalysis.sentYotta) {
                        logResult(false, 'No yotta sent', plainURL);
                    }
                    const yottaFalseURL = `${url}&yotta=false`;
                    const yottaFalseAnalysis = analyzeURLs((yield getLoadedURLs(yottaFalseURL)));
                    if (yottaFalseAnalysis.sentExternalRequest || yottaFalseAnalysis.sentGoogleAnalytics || yottaFalseAnalysis.sentYotta) {
                        logResult(false, 'yotta=false sent something', yottaFalseAnalysis);
                    }
                    const yottaSomeFlagURL = `${url}&${demoYottaQueryParameterKey}=${demoYottaQueryParameterValue}`;
                    const yottaSomeFlagAnalysis = analyzeURLs((yield getLoadedURLs(yottaSomeFlagURL)));
                    if (!yottaSomeFlagAnalysis.hasDemoYottaQueryParameter) {
                        logResult(false, `No ${demoYottaQueryParameterKey}=${demoYottaQueryParameterValue} sent`, yottaSomeFlagAnalysis);
                    }
                }
            // Consider adding fuzzing in the future, it seems like we're unable to get things to run after a fuzz failure though
            // const fuzzURL = `${url}&fuzz&fuzzMouse&fuzzTouch&fuzzBoard`;
            // try {
            //   await puppeteerLoad( fuzzURL, {
            //     waitForFunction: 'window.phet.joist.sim',
            //     gotoTimeout: 60000,
            //     waitAfterLoad: 5000,
            //     browser: browser
            //   } );
            // }
            // catch( e ) {
            //   console.log( `fuzz failure on ${fuzzURL}:\n${e}` );
            // }
            }
            if (TEST_PHET_IO_LOCALE && (!releaseBranch || (yield releaseBranch.isPhetioHydrogen()))) {
                const testURLs = [
                    `http://localhost:${port}/${releaseBranchPath}${repo}/build/phet-io/wrappers/studio/?`
                ];
                for (const url of testURLs){
                    // Wrong format locale should result in a error dialog and resulting locale to fall back to 'en'
                    const fallbackLocale = yield evaluate(`${url}&locale=es_PY`, ()=>new Promise((resolve, reject)=>{
                            resolve(phetio.phetioClient.frame.contentWindow.phet.chipper.locale);
                        }), {
                        waitForFunction: '!!phetio.phetioClient.simStarted'
                    });
                    logResult(fallbackLocale === 'es', 'es fallback expected for non existent es_PY', `${url}&locale=es_PY`);
                    // Wrong format locale should result in a error dialog and resulting locale to fall back to 'en'
                    const emptyLocaleParam = yield evaluate(`${url}&locale=`, ()=>new Promise((resolve, reject)=>{
                            resolve(phetio.phetioClient.frame.contentWindow.phet.chipper.locale);
                        }), {
                        waitForFunction: '!!phetio.phetioClient.simStarted'
                    });
                    logResult(emptyLocaleParam === 'en', 'en fallback expected for empty locale in studio', `${url}&locale=`);
                    // Wrong format locale should result in a error dialog and resulting locale to fall back to 'en'
                    const badFormatLocaleParam = yield evaluate(`${url}&locale=fdsa`, ()=>new Promise((resolve, reject)=>{
                            resolve(phetio.phetioClient.frame.contentWindow.phet.chipper.locale);
                        }), {
                        waitForFunction: '!!phetio.phetioClient.simStarted'
                    });
                    logResult(badFormatLocaleParam === 'en', 'en fallback expected for badly formatted locale in studio', `${url}&locale=fdsa`);
                    const standardWrapper = yield evaluate(`${url}&exposeStandardPhetioWrapper`, ()=>new Promise((resolve, reject)=>{
                            window.addEventListener('message', (event)=>{
                                if (event.data.standardPhetioWrapper) {
                                    resolve(event.data.standardPhetioWrapper);
                                }
                            });
                            window.phetioClient.invoke(`${phetio.PhetioClient.CAMEL_CASE_SIMULATION_NAME}.general.model.localeProperty`, 'setValue', [
                                'de'
                            ], ()=>{
                                window.postMessage({
                                    type: 'getStandardPhetioWrapper'
                                }, '*');
                            });
                        }), {
                        waitForFunction: '!!window.phetioClient.simStarted'
                    });
                    const parentDir = '../temp/release-branch-tests/';
                    if (!fs.existsSync(parentDir)) {
                        fs.mkdirSync(parentDir, {
                            recursive: true
                        });
                    }
                    const path = `temp/release-branch-tests/${repo}-standard-wrapper.html`;
                    const filePath = `../${path}`;
                    fs.writeFileSync(filePath, standardWrapper);
                    const testLocale = /*#__PURE__*/ _async_to_generator(function*(locale, expectedLocale, debug = true) {
                        const standardWrapperURL = `http://localhost:${port}/${path}?${locale ? `locale=${locale}` : ''}&phetioDebug=${debug}`;
                        const actualLocale = yield evaluate(standardWrapperURL, ()=>new Promise((resolve)=>{
                                setTimeout(()=>{
                                    resolve(document.getElementById('sim').contentWindow.phet.chipper.locale);
                                }, 1000); // wait for state to be set after loading
                            }), {
                            waitForFunction: '!!window.phetioClient.simStarted'
                        });
                        const success = actualLocale === expectedLocale;
                        const message = `phet-io built locale ${locale} should be ${expectedLocale}`;
                        logResult(success, message, standardWrapperURL);
                    });
                    yield testLocale(null, 'de');
                    yield testLocale('spa', 'es');
                    yield testLocale('ES-py', 'es');
                    yield testLocale('xx_pW', 'en');
                    yield testLocale('artlakernt', 'en', false);
                    fs.rmSync(filePath);
                }
            }
        }
    }));
    browser.close();
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL3Rlc3QvcmVsZWFzZS1icmFuY2gtY2hlY2tzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBHZW5lcmFsIGNoZWNrcyB0byBlbnN1cmUgcmVsZWFzZSBicmFuY2hlcyBhcmUgd29ya2luZyBhcyBleHBlY3RlZC5cbiAqXG4gKiBEaWZmZXJlbnQgdGVzdHMgd2VyZSBhZGRlZCBmcm9tIHZhcmlvdXMgTVIgd29yay4gUGFwZXIgdHJhaWxzOlxuICogLSAzLzIwLzI0OiBDaGVja2luZyB5b3R0YT1mYWxzZSAoaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXRjb21tb24vaXNzdWVzLzY1KSBhbmQgeW90dGEqPSpcbiAqICAgKGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0Y29tbW9uL2lzc3Vlcy82NikgYmVoYXZpb3Igb24gbm9uLXJlZnJlc2hlZCByZWxlYXNlIGJyYW5jaGVzLlxuICogLSA1LzE0LzI0OiBuZXcgbG9jYWxlIHF1ZXJ5IHBhcmFtZXRlciBwYXJzaW5nOiBydW5uaW5nIG9uIEJBQkVML2xvY2FsZURhdGEgYW5kIHN1cHBvcnRpbmcgbG9jYWxlMy9mYWxsYmFja3MvZXRjLiAoaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy85NjMpXG4gKiAtIDYvMTQvMjQ6IHNlY29uZCBsb2NhbGUgTVIgZm9yIHN1cHBvcnRpbmcgaW4gU3RhbmRhcmQgUGhFVC1pTyBXcmFwcGVyLiAoaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy85NzApXG4gKlxuICogVVNBR0U6XG4gKiBjZCBwZXJlbm5pYWw7XG4gKiBub2RlIGpzL3NjcmlwdHMvdGVzdC9yZWxlYXNlLWJyYW5jaC1jaGVja3MuanNcbiAqXG4gKiBOT1RFOiByZWZyZXNoIHJlbGVhc2UgYnJhbmNoZXMgaWYgbm90IGRvaW5nIGFuIGFjdGl2ZSBNUjpcbiAqIGNkIHBlcmVubmlhbDtcbiAqIG5vZGUganMvc2NyaXB0cy9tYWluLXB1bGwtc3RhdHVzLmpzIC0tYWxsQnJhbmNoZXNcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuLy8gVXNlZCBmb3IgZXZhbHVhdGluZyBicm93c2VyLXNpZGUgY29kZSBpbiBwdXBwZXRlZXIgdGVzdHMuXG4vKiBnbG9iYWwgd2luZG93IGRvY3VtZW50IHBoZXQgcGhldGlvICovXG5cbmNvbnN0IF8gPSByZXF1aXJlKCAnbG9kYXNoJyApO1xuY29uc3QgcHVwcGV0ZWVyTG9hZCA9IHJlcXVpcmUoICcuLi8uLi9jb21tb24vcHVwcGV0ZWVyTG9hZCcgKTtcbmNvbnN0IE1haW50ZW5hbmNlID0gcmVxdWlyZSggJy4uLy4uL2NvbW1vbi9NYWludGVuYW5jZScgKTtcbmNvbnN0IHdpdGhTZXJ2ZXIgPSByZXF1aXJlKCAnLi4vLi4vY29tbW9uL3dpdGhTZXJ2ZXInICk7XG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSggJ3dpbnN0b24nICk7XG5jb25zdCBwdXBwZXRlZXIgPSByZXF1aXJlKCAncHVwcGV0ZWVyJyApO1xuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XG5cbndpbnN0b24uZGVmYXVsdC50cmFuc3BvcnRzLmNvbnNvbGUubGV2ZWwgPSAnZXJyb3InO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFJVTk5JTkcgT1BUSU9OUzpcblxuLy8gVGVzdCBvbmUgc2ltIGZyb20gbWFpbiwgaW5zdGVhZCBvZiBmcm9tIHJlbGVhc2UtYnJhbmNoZXMvLiBUbyB0ZXN0IGZyb20gbWFpbiwgZW5zdXJlIHlvdSBmaXJzdCBydW5cbi8vIGBjZCBhY2lkLWJhc2Utc29sdXRpb25zOyBncnVudCAtLWJyYW5kcz1waGV0LHBoZXQtaW8gLS1sb2NhbGVzPSpgXG5jb25zdCBURVNUX0ZST01fTUFJTiA9IGZhbHNlO1xuLy8gTG9nIHRlc3RzIHRoYXQgcGFzcyBpbiBhZGRpdGlvbiB0byBmYWlsdXJlcy5cbmNvbnN0IFZFUkJPU0VfTE9HX1NVQ0NFU1MgPSBmYWxzZTtcblxuLy8gU3BlY2lmaWMgdGVzdHMgdG8gcnVuXG5jb25zdCBURVNUX0xPQ0FMRVMgPSB0cnVlOyAvLyBnZW5lcmFsIGxvY2FsZSBmZWF0dXJlIHVwZ3JhZGVcbmNvbnN0IFRFU1RfQU5BTFlUSUNTID0gZmFsc2U7IC8vIEdBIGFuYWx5dGljcyB0ZXN0aW5nXG5jb25zdCBURVNUX1BIRVRfSU9fTE9DQUxFID0gdHJ1ZTsgLy8gcGhldC1pbyArIHN0YW5kYXJkIHdyYXBwZXIgbG9jYWxlIHRlc3RpbmdcbmNvbnN0IFNLSVBfVElUTEVfU1RSSU5HX1BBVFRFUk4gPSB0cnVlO1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuY29uc3QgbG9jYWxlRGF0YSA9IEpTT04ucGFyc2UoIGZzLnJlYWRGaWxlU3luYyggJy4uL2JhYmVsL2xvY2FsZURhdGEuanNvbicsICd1dGY4JyApICk7XG5cbmNvbnN0IGxvZ1Jlc3VsdCA9ICggc3VjY2VzcywgbWVzc2FnZSwgdXJsICkgPT4ge1xuICBpZiAoIHN1Y2Nlc3MgKSB7XG4gICAgVkVSQk9TRV9MT0dfU1VDQ0VTUyAmJiBjb25zb2xlLmxvZyggYCAgICAgIFtPS10gJHttZXNzYWdlfSBVUkw6ICR7dXJsfWAgKTtcbiAgfVxuICBlbHNlIHtcbiAgICBjb25zb2xlLmxvZyggYCAgW0ZBSUxdICR7bWVzc2FnZX0gVVJMOiAke3VybH1gICk7XG4gIH1cbn07XG5cbiggYXN5bmMgKCkgPT4ge1xuICBjb25zdCBicm93c2VyID0gYXdhaXQgcHVwcGV0ZWVyLmxhdW5jaCgge1xuICAgIGFyZ3M6IFtcbiAgICAgICctLWRpc2FibGUtZ3B1J1xuICAgIF1cbiAgfSApO1xuXG4gIC8vIFVzZSB3aXRoU2VydmVyIGZvciBjcm9zcy1kZXYgZW52aXJvbm1lbnQgZXhlY3V0aW9uLlxuICBhd2FpdCB3aXRoU2VydmVyKCBhc3luYyBwb3J0ID0+IHtcblxuICAgIGNvbnN0IHJlbGVhc2VCcmFuY2hlcyA9IFRFU1RfRlJPTV9NQUlOID8gWyBudWxsIF0gOiBhd2FpdCBNYWludGVuYW5jZS5sb2FkQWxsTWFpbnRlbmFuY2VCcmFuY2hlcygpO1xuXG4gICAgY29uc3QgZ2V0QnVpbHRVUkxzID0gYXN5bmMgcmVsZWFzZUJyYW5jaCA9PiB7XG4gICAgICBjb25zdCB1cmxzID0gW107XG4gICAgICBjb25zdCByZXBvID0gcmVsZWFzZUJyYW5jaCA/IHJlbGVhc2VCcmFuY2gucmVwbyA6ICdhY2lkLWJhc2Utc29sdXRpb25zJztcbiAgICAgIGNvbnN0IGJyYW5jaCA9IHJlbGVhc2VCcmFuY2ggPyByZWxlYXNlQnJhbmNoLmJyYW5jaCA6ICdtYWluJztcbiAgICAgIGNvbnN0IHJlbGVhc2VCcmFuY2hQYXRoID0gcmVsZWFzZUJyYW5jaCA/IGByZWxlYXNlLWJyYW5jaGVzLyR7cmVwb30tJHticmFuY2h9L2AgOiAnJztcbiAgICAgIGNvbnN0IGJ1aWxkRGlyID0gYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fS8ke3JlbGVhc2VCcmFuY2hQYXRofSR7cmVwb30vYnVpbGRgO1xuXG4gICAgICBpZiAoICFyZWxlYXNlQnJhbmNoICkge1xuICAgICAgICB1cmxzLnB1c2goIGAke2J1aWxkRGlyfS9waGV0LyR7cmVwb31fYWxsX3BoZXRfZGVidWcuaHRtbD93ZWJnbD1mYWxzZWAgKTtcbiAgICAgICAgdXJscy5wdXNoKCBgJHtidWlsZERpcn0vcGhldC1pby8ke3JlcG99X2FsbF9waGV0LWlvLmh0bWw/d2ViZ2w9ZmFsc2UmcGhldGlvU3RhbmRhbG9uZWAgKTtcbiAgICAgICAgcmV0dXJuIHVybHM7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHVzZXNDaGlwcGVyMiA9IGF3YWl0IHJlbGVhc2VCcmFuY2gudXNlc0NoaXBwZXIyKCk7XG5cbiAgICAgIGlmICggcmVsZWFzZUJyYW5jaC5icmFuZHMuaW5jbHVkZXMoICdwaGV0JyApICkge1xuICAgICAgICB1cmxzLnB1c2goIGAke2J1aWxkRGlyfS8ke3VzZXNDaGlwcGVyMiA/ICdwaGV0LycgOiAnJ30ke3JlcG99X2FsbCR7dXNlc0NoaXBwZXIyID8gJ19waGV0JyA6ICcnfS5odG1sP3dlYmdsPWZhbHNlYCApO1xuICAgICAgfVxuICAgICAgaWYgKCByZWxlYXNlQnJhbmNoLmJyYW5kcy5pbmNsdWRlcyggJ3BoZXQtaW8nICkgKSB7XG4gICAgICAgIGNvbnN0IHN0YW5kYWxvbmVQYXJhbXMgPSBhd2FpdCByZWxlYXNlQnJhbmNoLmdldFBoZXRpb1N0YW5kYWxvbmVRdWVyeVBhcmFtZXRlcigpO1xuXG4gICAgICAgIGNvbnN0IHBoZXRpb1N1ZmZpeCA9IHVzZXNDaGlwcGVyMiA/ICdfYWxsX3BoZXQtaW8nIDogJ19lbi1waGV0aW8nO1xuXG4gICAgICAgIHVybHMucHVzaCggYCR7YnVpbGREaXJ9LyR7dXNlc0NoaXBwZXIyID8gJ3BoZXQtaW8vJyA6ICcnfSR7cmVwb30ke3BoZXRpb1N1ZmZpeH0uaHRtbD8ke3N0YW5kYWxvbmVQYXJhbXN9JndlYmdsPWZhbHNlYCApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdXJscztcbiAgICB9O1xuXG4gICAgY29uc3QgZ2V0VW5idWlsdFVSTHMgPSBhc3luYyByZWxlYXNlQnJhbmNoID0+IHtcbiAgICAgIGNvbnN0IHVybHMgPSBbXTtcblxuICAgICAgaWYgKCAhcmVsZWFzZUJyYW5jaCApIHtcbiAgICAgICAgY29uc3QgcmVwbyA9ICdhY2lkLWJhc2Utc29sdXRpb25zJztcbiAgICAgICAgdXJscy5wdXNoKCBgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9LyR7cmVwb30vJHtyZXBvfV9lbi5odG1sP3dlYmdsPWZhbHNlYCApO1xuICAgICAgICB1cmxzLnB1c2goIGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0vJHtyZXBvfS8ke3JlcG99X2VuLmh0bWw/d2ViZ2w9ZmFsc2UmYnJhbmQ9cGhldC1pbyZwaGV0aW9TdGFuZGFsb25lYCApO1xuICAgICAgICByZXR1cm4gdXJscztcbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVwbyA9IHJlbGVhc2VCcmFuY2gucmVwbztcbiAgICAgIGNvbnN0IGJyYW5jaCA9IHJlbGVhc2VCcmFuY2guYnJhbmNoO1xuICAgICAgdXJscy5wdXNoKCBgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9L3JlbGVhc2UtYnJhbmNoZXMvJHtyZXBvfS0ke2JyYW5jaH0vJHtyZXBvfS8ke3JlcG99X2VuLmh0bWw/d2ViZ2w9ZmFsc2VgICk7XG5cbiAgICAgIGlmICggcmVsZWFzZUJyYW5jaC5icmFuZHMuaW5jbHVkZXMoICdwaGV0LWlvJyApICkge1xuICAgICAgICBjb25zdCBzdGFuZGFsb25lUGFyYW1zID0gYXdhaXQgcmVsZWFzZUJyYW5jaC5nZXRQaGV0aW9TdGFuZGFsb25lUXVlcnlQYXJhbWV0ZXIoKTtcbiAgICAgICAgdXJscy5wdXNoKCBgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9L3JlbGVhc2UtYnJhbmNoZXMvJHtyZXBvfS0ke2JyYW5jaH0vJHtyZXBvfS8ke3JlcG99X2VuLmh0bWw/d2ViZ2w9ZmFsc2UmJHtzdGFuZGFsb25lUGFyYW1zfSZicmFuZD1waGV0LWlvYCApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdXJscztcbiAgICB9O1xuXG4gICAgY29uc3QgZ2V0QWxsVVJMcyA9IGFzeW5jIHJlbGVhc2VCcmFuY2ggPT4ge1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgLi4uKCBhd2FpdCBnZXRCdWlsdFVSTHMoIHJlbGVhc2VCcmFuY2ggKSApLFxuICAgICAgICAuLi4oIGF3YWl0IGdldFVuYnVpbHRVUkxzKCByZWxlYXNlQnJhbmNoICkgKVxuICAgICAgXTtcbiAgICB9O1xuXG4gICAgY29uc3QgZ2V0TG9hZGVkVVJMcyA9IGFzeW5jIHVybCA9PiB7XG4gICAgICBjb25zdCB1cmxzID0gW107XG5cbiAgICAgIGF3YWl0IHB1cHBldGVlckxvYWQoIHVybCwge1xuICAgICAgICBvblBhZ2VDcmVhdGlvbjogcGFnZSA9PiBwYWdlLm9uKCAncmVxdWVzdCcsIHJlcXVlc3QgPT4ge1xuICAgICAgICAgIGNvbnN0IHVybCA9IHJlcXVlc3QudXJsKCk7XG5cbiAgICAgICAgICBpZiAoICF1cmwuc3RhcnRzV2l0aCggJ2RhdGE6JyApICkge1xuICAgICAgICAgICAgdXJscy5wdXNoKCB1cmwgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gKSxcbiAgICAgICAgZ290b1RpbWVvdXQ6IDYwMDAwLFxuICAgICAgICB3YWl0QWZ0ZXJMb2FkOiAzMDAwLFxuICAgICAgICBicm93c2VyOiBicm93c2VyXG4gICAgICB9ICk7XG5cbiAgICAgIHJldHVybiB1cmxzO1xuICAgIH07XG5cbiAgICBjb25zdCBkZW1vWW90dGFRdWVyeVBhcmFtZXRlcktleSA9ICd5b3R0YVNvbWVGbGFnJztcbiAgICBjb25zdCBkZW1vWW90dGFRdWVyeVBhcmFtZXRlclZhbHVlID0gJ3NvbWVWYWx1ZSc7XG5cbiAgICBjb25zdCBhbmFseXplVVJMcyA9IHVybHMgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc2VudEdvb2dsZUFuYWx5dGljczogdXJscy5zb21lKCB1cmwgPT4gdXJsLmluY2x1ZGVzKCAnY29sbGVjdD8nICkgKSxcbiAgICAgICAgc2VudFlvdHRhOiB1cmxzLnNvbWUoIHVybCA9PiB1cmwuaW5jbHVkZXMoICd5b3R0YS9pbW1lZGlhdGUuZ2lmJyApICksXG4gICAgICAgIHNlbnRFeHRlcm5hbFJlcXVlc3Q6IHVybHMuc29tZSggdXJsID0+ICF1cmwuc3RhcnRzV2l0aCggJ2h0dHA6Ly9sb2NhbGhvc3QnICkgKSxcbiAgICAgICAgaGFzRGVtb1lvdHRhUXVlcnlQYXJhbWV0ZXI6IHVybHMuc29tZSggdXJsID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV3IFVSTFNlYXJjaFBhcmFtcyggbmV3IFVSTCggdXJsICkuc2VhcmNoICkuZ2V0KCBkZW1vWW90dGFRdWVyeVBhcmFtZXRlcktleSApID09PSBkZW1vWW90dGFRdWVyeVBhcmFtZXRlclZhbHVlO1xuICAgICAgICB9IClcbiAgICAgIH07XG4gICAgfTtcblxuICAgIGNvbnN0IGV2YWx1YXRlID0gYXN5bmMgKCB1cmwsIGV2YWx1YXRlLCBvcHRpb25zICkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHB1cHBldGVlckxvYWQoIHVybCwge1xuICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgZXZhbHVhdGU6IGV2YWx1YXRlLFxuICAgICAgICAgIGdvdG9UaW1lb3V0OiA2MDAwMCxcbiAgICAgICAgICB3YWl0QWZ0ZXJMb2FkOiAyMDAwLFxuICAgICAgICAgIGFsbG93ZWRUaW1lVG9Mb2FkOiA0MDAwMCxcbiAgICAgICAgICBicm93c2VyOiBicm93c2VyXG4gICAgICAgICAgLy8gLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNvbW1hLXN0eWxlXG4gICAgICAgICAgLy8gbG9nQ29uc29sZU91dHB1dDogdHJ1ZSxcbiAgICAgICAgICAvLyBsb2dnZXI6IGNvbnNvbGUubG9nXG4gICAgICAgIH0gKTtcbiAgICAgIH1cbiAgICAgIGNhdGNoKCBlICkge1xuICAgICAgICBjb25zb2xlLmxvZyggJyAgICBFUlJPUicsIGUubWVzc2FnZS5zcGxpdCggJ1xcbicgKVsgMCBdICk7XG4gICAgICAgIHJldHVybiBgZXJyb3IgcnVubmluZyAke3VybH1gO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBmb3IgKCBjb25zdCByZWxlYXNlQnJhbmNoIG9mIHJlbGVhc2VCcmFuY2hlcyApIHtcblxuICAgICAgLy8gcmVsZWFzZUJyYW5jaD09PSBudWxsIHdoZW4gcnVubmluZyBvbiBtYWluXG4gICAgICBjb25zdCBpc1VuYnVsdE9uTWFpbiA9ICFyZWxlYXNlQnJhbmNoO1xuXG4gICAgICBjb25zdCByZXBvID0gaXNVbmJ1bHRPbk1haW4gPyAnYWNpZC1iYXNlLXNvbHV0aW9ucycgOiByZWxlYXNlQnJhbmNoLnJlcG87XG4gICAgICBjb25zdCBicmFuY2ggPSBpc1VuYnVsdE9uTWFpbiA/ICdtYWluJyA6IHJlbGVhc2VCcmFuY2guYnJhbmNoO1xuICAgICAgY29uc3QgcmVsZWFzZUJyYW5jaFBhdGggPSBpc1VuYnVsdE9uTWFpbiA/ICcnIDogYHJlbGVhc2UtYnJhbmNoZXMvJHtyZXBvfS0ke2JyYW5jaH0vYDtcblxuICAgICAgY29uc3QgdXJscyA9IGF3YWl0IGdldEFsbFVSTHMoIHJlbGVhc2VCcmFuY2ggKTtcblxuICAgICAgY29uc29sZS5sb2coICctJywgcmVsZWFzZUJyYW5jaCA/IHJlbGVhc2VCcmFuY2gudG9TdHJpbmcoKSA6IHJlcG8gKTtcblxuICAgICAgZm9yICggY29uc3QgdXJsIG9mIHVybHMgKSB7XG5cbiAgICAgICAgLy8gQmVjYXVzZSBgcGxhbmV0YCBhbmQgYHBsYW5ldC5jb250cm9scy50aXRsZWAga2V5cyBwcmVzZW50IGluIHRyYW5zbGF0aW9ucyBPVkVSTEFQIGluIHRoZSBzdHJpbmcgb2JqZWN0IGNyZWF0ZWQgYnlcbiAgICAgICAgLy8gZ2V0U3RyaW5nTW9kdWxlLCBhbmQgRkFJTFMgaGFyZCBvbiB0aGVzZS4gQnVpbHQgdmVyc2lvbnMgd29yayBvay5cbiAgICAgICAgaWYgKCByZXBvID09PSAnZ3Jhdml0eS1mb3JjZS1sYWInICYmIGJyYW5jaCA9PT0gJzIuMicgJiYgdXJsLmluY2x1ZGVzKCAnX2VuLmh0bWwnICkgKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coICcgc2tpcHBpbmcgZ3Jhdml0eS1mb3JjZS1sYWIgMi4yIHVuYnVpbHQsIHNpbmNlIHBsYW5ldCAvIHBsYW5ldC5jb250cm9scy50aXRsZSBzdHJpbmdzIGluIHRyYW5zbGF0aW9ucyB3aWxsIG5vdCBydW4gaW4gdW5idWlsdCBtb2RlJyApO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICggcmVwbyA9PT0gJ2dyYXZpdHktZm9yY2UtbGFiLWJhc2ljcycgJiYgYnJhbmNoID09PSAnMS4xJyAmJiB1cmwuaW5jbHVkZXMoICdfZW4uaHRtbCcgKSApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyggJyBza2lwcGluZyBncmF2aXR5LWZvcmNlLWxhYiAyLjIgdW5idWlsdCwgc2luY2UgcGxhbmV0IC8gcGxhbmV0LmNvbnRyb2xzLnRpdGxlIHN0cmluZ3MgaW4gdHJhbnNsYXRpb25zIHdpbGwgbm90IHJ1biBpbiB1bmJ1aWx0IG1vZGUnICk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBnZXRVcmxXaXRoTG9jYWxlID0gbG9jYWxlID0+IHVybC5pbmNsdWRlcyggJz8nICkgPyBgJHt1cmx9JmxvY2FsZT0ke2xvY2FsZX1gIDogYCR7dXJsfT9sb2NhbGU9JHtsb2NhbGV9YDtcbiAgICAgICAgY29uc3QgZ2V0TG9jYWxlU3BlY2lmaWNVUkwgPSBsb2NhbGUgPT4ge1xuICAgICAgICAgIHJldHVybiBpc1VuYnVsdE9uTWFpbiA/IHVybC5yZXBsYWNlKCAnX2FsbF9waGV0X2RlYnVnJywgYF8ke2xvY2FsZX1fcGhldGAgKSA6IHVybC5yZXBsYWNlKCAnX2FsbCcsIGBfJHtsb2NhbGV9YCApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGxvZ1N0YXR1cyA9ICggc3RhdHVzLCBtZXNzYWdlLCBsb2dnZWRVUkwgPSB1cmwgKSA9PiB7XG4gICAgICAgICAgbG9nUmVzdWx0KCBzdGF0dXMsIG1lc3NhZ2UsIGxvZ2dlZFVSTCApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmICggVEVTVF9MT0NBTEVTICkge1xuICAgICAgICAgIC8vIENoZWNrIGxvY2FsZSBNUi4gZXNfUFkgc2hvdWxkIGFsd2F5cyBiZSBpbiBsb2NhbGVEYXRhXG4gICAgICAgICAgY29uc3QgbG9jYWxlVmFsdWVzID0gYXdhaXQgZXZhbHVhdGUoIHVybCwgKCkgPT4gWyAhIXBoZXQuY2hpcHBlci5sb2NhbGVEYXRhLCAhISggcGhldC5jaGlwcGVyLmxvY2FsZURhdGE/LmVzX1BZICkgXSApO1xuICAgICAgICAgIGxvZ1N0YXR1cyggbG9jYWxlVmFsdWVzWyAwIF0gJiYgbG9jYWxlVmFsdWVzWyAxIF0sICdsb2NhbGVEYXRhIChnZW5lcmFsLCBlc19QWSknICk7XG5cbiAgICAgICAgICBjb25zdCBnZXRSdW5uaW5nTG9jYWxlID0gYXN5bmMgbG9jYWxlID0+IGV2YWx1YXRlKCBnZXRVcmxXaXRoTG9jYWxlKCBsb2NhbGUgKSwgKCkgPT4gcGhldC5jaGlwcGVyLmxvY2FsZSApO1xuXG4gICAgICAgICAgY29uc3QgZXNMb2NhbGUgPSBhd2FpdCBnZXRSdW5uaW5nTG9jYWxlKCAnZXMnICk7XG4gICAgICAgICAgbG9nU3RhdHVzKCBlc0xvY2FsZSA9PT0gJ2VzJywgJ2VzIHBoZXQuY2hpcHBlci5sb2NhbGUnICk7XG5cbiAgICAgICAgICBjb25zdCBzcGFMb2NhbGUgPSBhd2FpdCBnZXRSdW5uaW5nTG9jYWxlKCAnc3BhJyApO1xuICAgICAgICAgIGxvZ1N0YXR1cyggc3BhTG9jYWxlID09PSAnZXMnLCAnc3BhIHBoZXQuY2hpcHBlci5sb2NhbGUnICk7XG5cbiAgICAgICAgICBjb25zdCBlc3B5TG9jYWxlID0gYXdhaXQgZ2V0UnVubmluZ0xvY2FsZSggJ0VTX1BZJyApO1xuICAgICAgICAgIGxvZ1N0YXR1cyggZXNweUxvY2FsZSA9PT0gJ2VzJyB8fCBlc3B5TG9jYWxlID09PSAnZXNfUFknLCAnRVNfUFkgcGhldC5jaGlwcGVyLmxvY2FsZScgKTtcblxuICAgICAgICAgIGNvbnN0IGFybWFMb2NhbGUgPSBhd2FpdCBnZXRSdW5uaW5nTG9jYWxlKCAnYXJfU0EnICk7XG4gICAgICAgICAgY29uc3QgYXJtYVN0YXR1cyA9IGFybWFMb2NhbGUgPT09ICdhcicgfHwgYXJtYUxvY2FsZSA9PT0gJ2FyX1NBJyB8fCBhcm1hTG9jYWxlID09PSAnYXJfTUEnIHx8ICggcmVwby5pbmNsdWRlcyggJ3Byb2plY3RpbGUtJyApICYmIGFybWFMb2NhbGUgPT09ICdlbicgKTtcbiAgICAgICAgICBsb2dTdGF0dXMoIGFybWFTdGF0dXMsICdhcl9TQSBwaGV0LmNoaXBwZXIubG9jYWxlJyApO1xuXG4gICAgICAgICAgY29uc3QgaW52YWxpZExvY2FsZSA9IGF3YWl0IGdldFJ1bm5pbmdMb2NhbGUoICdhZW5ydHB5YXJudFNSVFMnICk7XG4gICAgICAgICAgbG9nU3RhdHVzKCBpbnZhbGlkTG9jYWxlID09PSAnZW4nLCAnbm9uc2Vuc2UgcGhldC5jaGlwcGVyLmxvY2FsZScgKTtcblxuICAgICAgICAgIGNvbnN0IHJlcG9QYWNrYWdlT2JqZWN0ID0gSlNPTi5wYXJzZSggZnMucmVhZEZpbGVTeW5jKCBgLi4vJHtyZXBvfS9wYWNrYWdlLmpzb25gLCAndXRmOCcgKSApO1xuXG4gICAgICAgICAgLy8gVGl0bGUgdGVzdGluZ1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIC8vIFdlIHdvdWxkIGJlIHRlc3RpbmcgdGhlIEVuZ2xpc2ggdmVyc2lvbighKVxuICAgICAgICAgICAgaWYgKCAhdXJsLmluY2x1ZGVzKCAnX2VuLXBoZXRpbycgKSApIHtcblxuICAgICAgICAgICAgICBjb25zdCBwYXJ0aWFsUG90ZW50aWFsVGl0bGVTdHJpbmdLZXkgPSBgJHtyZXBvfS50aXRsZWA7XG4gICAgICAgICAgICAgIGNvbnN0IGZ1bGxQb3RlbnRpYWxUaXRsZVN0cmluZ0tleSA9IGAke3JlcG9QYWNrYWdlT2JqZWN0LnBoZXQucmVxdWlyZWpzTmFtZXNwYWNlfS8ke3BhcnRpYWxQb3RlbnRpYWxUaXRsZVN0cmluZ0tleX1gO1xuXG4gICAgICAgICAgICAgIGNvbnN0IGhhc1RpdGxlS2V5ID0gU0tJUF9USVRMRV9TVFJJTkdfUEFUVEVSTiA/IHRydWUgOiBhd2FpdCBldmFsdWF0ZSggdXJsLCBgISFwaGV0LmNoaXBwZXIuc3RyaW5ncy5lblsgXCIke2Z1bGxQb3RlbnRpYWxUaXRsZVN0cmluZ0tleX1cIiBdYCApO1xuXG4gICAgICAgICAgICAgIGlmICggaGFzVGl0bGVLZXkgKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZ2V0VGl0bGUgPSBhc3luYyBsb2NhbGUgPT4gZXZhbHVhdGUoIGdldFVybFdpdGhMb2NhbGUoIGxvY2FsZSApLCAoKSA9PiBkb2N1bWVudC50aXRsZSwge1xuXG4gICAgICAgICAgICAgICAgICAvLyBQaEVULWlPIEh5ZHJvZ2VuIHNpbXMgd29uJ3QgaGF2ZSB0aGlzIGJlaGF2aW9yIHVudGlsIHRoZSBsb2NhbGVQcm9wZXJ0eSBoYXMgc3RhdGljYWxseSBpbXBvcnRlZC9sb2FkZWRcbiAgICAgICAgICAgICAgICAgIHdhaXRGb3JGdW5jdGlvbjogJyhwaGV0LmpvaXN0Py5zaW0gJiYgIXBoZXQuam9pc3Quc2ltLmlzQ29uc3RydWN0aW9uQ29tcGxldGVQcm9wZXJ0eSkgfHwgcGhldC5qb2lzdD8uc2ltPy5pc0NvbnN0cnVjdGlvbkNvbXBsZXRlUHJvcGVydHkudmFsdWUnXG4gICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgLy8gbnVsbCBpZiBjb3VsZCBub3QgYmUgZm91bmRcbiAgICAgICAgICAgICAgICBjb25zdCBsb29rdXBTcGVjaWZpY1RpdGxlVHJhbnNsYXRpb24gPSBsb2NhbGUgPT4ge1xuICAgICAgICAgICAgICAgICAgbGV0IGpzb247XG4gICAgICAgICAgICAgICAgICBpZiAoIGxvY2FsZSA9PT0gJ2VuJyApIHtcbiAgICAgICAgICAgICAgICAgICAganNvbiA9IEpTT04ucGFyc2UoIGZzLnJlYWRGaWxlU3luYyggYC4uLyR7cmVwb30vJHtyZXBvfS1zdHJpbmdzX2VuLmpzb25gLCAndXRmOCcgKSApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAganNvbiA9IEpTT04ucGFyc2UoIGZzLnJlYWRGaWxlU3luYyggYC4uL2JhYmVsLyR7cmVwb30vJHtyZXBvfS1zdHJpbmdzXyR7bG9jYWxlfS5qc29uYCwgJ3V0ZjgnICkgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCggZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGpzb25bIHBhcnRpYWxQb3RlbnRpYWxUaXRsZVN0cmluZ0tleSBdPy52YWx1ZSA/PyBudWxsO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBjb25zdCBsb29rdXBGYWxsYmFja1RpdGxlID0gbG9jYWxlID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsZXMgPSBbXG4gICAgICAgICAgICAgICAgICAgIGxvY2FsZSxcbiAgICAgICAgICAgICAgICAgICAgLi4uKCBsb2NhbGVEYXRhWyBsb2NhbGUgXT8uZmFsbGJhY2tMb2NhbGVzIHx8IFtdICksXG4gICAgICAgICAgICAgICAgICAgICdlbidcbiAgICAgICAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgICAgICAgIGZvciAoIGNvbnN0IHRlc3RMb2NhbGUgb2YgbG9jYWxlcyApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBsb29rdXBTcGVjaWZpY1RpdGxlVHJhbnNsYXRpb24oIHRlc3RMb2NhbGUgKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCB0aXRsZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGl0bGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgY291bGQgbm90IGNvbXB1dGUgZmFsbGJhY2sgdGl0bGUgZm9yIGxvY2FsZSAke2xvY2FsZX1gICk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGNoZWNrVGl0bGUgPSBhc3luYyAoIGxvY2FsZSwgbG9va3VwTG9jYWxlICkgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc3QgYWN0dWFsVGl0bGUgPSBhd2FpdCBnZXRUaXRsZSggbG9jYWxlICk7XG4gICAgICAgICAgICAgICAgICBjb25zdCBleHBlY3RlZFRpdGxlID0gbG9va3VwRmFsbGJhY2tUaXRsZSggbG9va3VwTG9jYWxlICk7XG5cbiAgICAgICAgICAgICAgICAgIGlmICggYWN0dWFsVGl0bGUudHJpbSgpLmluY2x1ZGVzKCBleHBlY3RlZFRpdGxlLnRyaW0oKSApICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYEFjdHVhbCB0aXRsZSAke0pTT04uc3RyaW5naWZ5KCBhY3R1YWxUaXRsZSApfSBkb2VzIG5vdCBtYXRjaCBleHBlY3RlZCB0aXRsZSAke0pTT04uc3RyaW5naWZ5KCBleHBlY3RlZFRpdGxlICl9IGZvciBsb2NhbGUgJHtsb2NhbGV9IC8gJHtsb29rdXBMb2NhbGV9YDtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgY29uc3QgZXNUaXRsZUVycm9yID0gYXdhaXQgY2hlY2tUaXRsZSggJ2VzJywgJ2VzJyApO1xuICAgICAgICAgICAgICAgIGxvZ1N0YXR1cyggIWVzVGl0bGVFcnJvciwgYGVzIHRpdGxlICR7ZXNUaXRsZUVycm9yfWAgKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHNwYVRpdGxlRXJyb3IgPSBhd2FpdCBjaGVja1RpdGxlKCAnc3BhJywgJ2VzJyApO1xuICAgICAgICAgICAgICAgIGxvZ1N0YXR1cyggIXNwYVRpdGxlRXJyb3IsIGBzcGEgdGl0bGUgJHtzcGFUaXRsZUVycm9yfWAgKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGVzcHlUaXRsZUVycm9yID0gYXdhaXQgY2hlY2tUaXRsZSggJ0VTX1BZJywgJ2VzX1BZJyApO1xuICAgICAgICAgICAgICAgIGxvZ1N0YXR1cyggIWVzcHlUaXRsZUVycm9yLCBgRVNfUFkgdGl0bGUgJHtlc3B5VGl0bGVFcnJvcn1gICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9nUmVzdWx0KCBmYWxzZSwgJ2NvdWxkIG5vdCBmaW5kIHRpdGxlIHN0cmluZyBrZXknLCB1cmwgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFF1ZXJ5U3RyaW5nTWFjaGluZS53YXJuaW5ncyB0ZXN0aW5nXG4gICAgICAgICAge1xuICAgICAgICAgICAgLy8gYm9vbGVhbiB8IG51bGwgLSBudWxsIGlmIHdhcm5pbmdzIGFycmF5IG5vdCBzdXBwb3J0ZWRcbiAgICAgICAgICAgIGNvbnN0IGdldEhhc1FTTVdhcm5pbmcgPSBhc3luYyBsb2NhbGUgPT4gZXZhbHVhdGUoXG4gICAgICAgICAgICAgIGdldFVybFdpdGhMb2NhbGUoIGxvY2FsZSApLFxuICAgICAgICAgICAgICAnKCB3aW5kb3cuUXVlcnlTdHJpbmdNYWNoaW5lICYmIFF1ZXJ5U3RyaW5nTWFjaGluZS53YXJuaW5ncyAhPT0gdW5kZWZpbmVkICkgPyAoIFF1ZXJ5U3RyaW5nTWFjaGluZS53YXJuaW5ncy5sZW5ndGggPiAwICkgOiBudWxsJ1xuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgbG9nU3RhdHVzKCAhKCBhd2FpdCBnZXRIYXNRU01XYXJuaW5nKCAnZW4nICkgKSwgJ2VuIFFTTSB3YXJuaW5nJyApO1xuICAgICAgICAgICAgbG9nU3RhdHVzKCAhKCBhd2FpdCBnZXRIYXNRU01XYXJuaW5nKCAnRVMnICkgKSwgJ0VTIFFTTSB3YXJuaW5nJyApO1xuICAgICAgICAgICAgbG9nU3RhdHVzKCAhKCBhd2FpdCBnZXRIYXNRU01XYXJuaW5nKCAnWFgnICkgKSwgJ1hYIFFTTSB3YXJuaW5nJyApO1xuICAgICAgICAgICAgbG9nU3RhdHVzKCAhKCBhd2FpdCBnZXRIYXNRU01XYXJuaW5nKCAnWFgtd1gnICkgKSwgJ1hYLXdYIFFTTSB3YXJuaW5nJyApO1xuICAgICAgICAgICAgbG9nU3RhdHVzKCAoIGF3YWl0IGdldEhhc1FTTVdhcm5pbmcoICdhbGtydG5hbHJjOVNSVFhYJyApICkgIT09IGZhbHNlLCAnbm9uc2Vuc2UgUVNNIHdhcm5pbmcgKGV4cGVjdGVkKScgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBub25FbmdsaXNoVHJhbnNsYXRpb25Mb2NhbGVzID0gZnMucmVhZGRpclN5bmMoIGAuLi8ke3JlbGVhc2VCcmFuY2hQYXRofWJhYmVsLyR7cmVwb30vYCApXG4gICAgICAgICAgICAuZmlsdGVyKCBmaWxlID0+IGZpbGUuc3RhcnRzV2l0aCggYCR7cmVwb30tc3RyaW5nc19gICkgKVxuICAgICAgICAgICAgLm1hcCggZmlsZSA9PiBmaWxlLnN1YnN0cmluZyggZmlsZS5pbmRleE9mKCAnXycgKSArIDEsIGZpbGUubGFzdEluZGV4T2YoICcuJyApICkgKTtcblxuICAgICAgICAgIGNvbnN0IGdldFNvbWVSYW5kb21UcmFuc2xhdGVkTG9jYWxlcyA9ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBfLnVuaXEoXG4gICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAnZW4nLFxuICAgICAgICAgICAgICAgICdlcycsXG4gICAgICAgICAgICAgICAgLi4uXy5zYW1wbGVTaXplKCBub25FbmdsaXNoVHJhbnNsYXRpb25Mb2NhbGVzLCA4IClcbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgY29uc3QgaW5jbHVkZWREYXRhTG9jYWxlcyA9IF8uc29ydEJ5KCBfLnVuaXEoIFtcbiAgICAgICAgICAgIC8vIEFsd2F5cyBpbmNsdWRlIHRoZSBmYWxsYmFjayAoZW4pXG4gICAgICAgICAgICAnZW4nLFxuXG4gICAgICAgICAgICAvLyBJbmNsdWRlIGRpcmVjdGx5LXVzZWQgbG9jYWxlc1xuICAgICAgICAgICAgLi4ubm9uRW5nbGlzaFRyYW5zbGF0aW9uTG9jYWxlcyxcblxuICAgICAgICAgICAgLy8gSW5jbHVkZSBsb2NhbGVzIHRoYXQgd2lsbCBmYWxsIGJhY2sgdG8gZGlyZWN0bHktdXNlZCBsb2NhbGVzXG4gICAgICAgICAgICAuLi5PYmplY3Qua2V5cyggbG9jYWxlRGF0YSApLmZpbHRlciggbG9jYWxlID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZURhdGFbIGxvY2FsZSBdLmZhbGxiYWNrTG9jYWxlcyAmJiBsb2NhbGVEYXRhWyBsb2NhbGUgXS5mYWxsYmFja0xvY2FsZXMuc29tZSggZmFsbGJhY2tMb2NhbGUgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBub25FbmdsaXNoVHJhbnNsYXRpb25Mb2NhbGVzLmluY2x1ZGVzKCBmYWxsYmFja0xvY2FsZSApO1xuICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB9IClcbiAgICAgICAgICBdICkgKTtcblxuICAgICAgICAgIC8vIENoZWNrIHByZXNlbmNlIG9mIGluY2x1ZGVkIGRhdGEgbG9jYWxlc1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGFMb2NhbGVDaGVjayA9IGF3YWl0IGV2YWx1YXRlKCBnZXRVcmxXaXRoTG9jYWxlKCAnZW4nICksIGAke0pTT04uc3RyaW5naWZ5KCBpbmNsdWRlZERhdGFMb2NhbGVzICl9LmV2ZXJ5KCBsb2NhbGUgPT4gcGhldC5jaGlwcGVyLmxvY2FsZURhdGFbIGxvY2FsZSBdIClgICk7XG5cbiAgICAgICAgICAgIGxvZ1N0YXR1cyggZGF0YUxvY2FsZUNoZWNrLCAnQWxsIGluY2x1ZGVkIGRhdGEgbG9jYWxlcyBwcmVzZW50JyApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIExvY2FsZS1zcGVjaWZpYyBmaWxlIHRlc3RpbmcgKGV2ZXJ5dGhpbmcgaGFzIF9lcylcbiAgICAgICAgICB7XG4gICAgICAgICAgICBpZiAoICF1cmwuaW5jbHVkZXMoICdwaGV0LWlvJyApICYmICF1cmwuaW5jbHVkZXMoICdwaGV0aW8nICkgJiYgdXJsLmluY2x1ZGVzKCAnL2J1aWxkLycgKSApIHtcblxuICAgICAgICAgICAgICBmb3IgKCBjb25zdCBsb2NhbGUgb2YgZ2V0U29tZVJhbmRvbVRyYW5zbGF0ZWRMb2NhbGVzKCkgKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3BlY2lmaWNVUkwgPSBnZXRMb2NhbGVTcGVjaWZpY1VSTCggbG9jYWxlICk7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hlY2tMb2NhbGUgPSBhd2FpdCBldmFsdWF0ZSggc3BlY2lmaWNVUkwsICgpID0+IHBoZXQuY2hpcHBlci5sb2NhbGUgKTtcblxuICAgICAgICAgICAgICAgIGxvZ1N0YXR1cyggY2hlY2tMb2NhbGUgPT09IGxvY2FsZSwgYExvY2FsZS1zcGVjaWZpYyAke2xvY2FsZX0gYnVpbGQgc2hvdWxkIGJlICR7Y2hlY2tMb2NhbGV9YCwgc3BlY2lmaWNVUkwgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFRyYW5zbGF0aW9uIF9hbGwgdGVzdGluZ1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGZvciAoIGNvbnN0IGxvY2FsZSBvZiBnZXRTb21lUmFuZG9tVHJhbnNsYXRlZExvY2FsZXMoKSApIHtcbiAgICAgICAgICAgICAgbG9nU3RhdHVzKCAoIGF3YWl0IGdldFJ1bm5pbmdMb2NhbGUoIGxvY2FsZSApICkgPT09IGxvY2FsZSwgYF9hbGwgdGVzdCBmb3IgbG9jYWxlICR7bG9jYWxlfWAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIFRFU1RfQU5BTFlUSUNTICYmIHVybC5pbmNsdWRlcyggJy9idWlsZC8nICkgKSB7XG4gICAgICAgICAgY29uc3QgcGxhaW5VUkwgPSB1cmw7XG4gICAgICAgICAgY29uc3QgcGxhaW5BbmFseXNpcyA9IGFuYWx5emVVUkxzKCBhd2FpdCBnZXRMb2FkZWRVUkxzKCBwbGFpblVSTCApICk7XG4gICAgICAgICAgaWYgKCAhcGxhaW5BbmFseXNpcy5zZW50R29vZ2xlQW5hbHl0aWNzICkge1xuICAgICAgICAgICAgbG9nUmVzdWx0KCBmYWxzZSwgJ05vIEdvb2dsZSBBbmFseXRpY3Mgc2VudCcsIHBsYWluVVJMICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICggIXBsYWluQW5hbHlzaXMuc2VudFlvdHRhICkge1xuICAgICAgICAgICAgbG9nUmVzdWx0KCBmYWxzZSwgJ05vIHlvdHRhIHNlbnQnLCBwbGFpblVSTCApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHlvdHRhRmFsc2VVUkwgPSBgJHt1cmx9JnlvdHRhPWZhbHNlYDtcbiAgICAgICAgICBjb25zdCB5b3R0YUZhbHNlQW5hbHlzaXMgPSBhbmFseXplVVJMcyggYXdhaXQgZ2V0TG9hZGVkVVJMcyggeW90dGFGYWxzZVVSTCApICk7XG4gICAgICAgICAgaWYgKCB5b3R0YUZhbHNlQW5hbHlzaXMuc2VudEV4dGVybmFsUmVxdWVzdCB8fCB5b3R0YUZhbHNlQW5hbHlzaXMuc2VudEdvb2dsZUFuYWx5dGljcyB8fCB5b3R0YUZhbHNlQW5hbHlzaXMuc2VudFlvdHRhICkge1xuICAgICAgICAgICAgbG9nUmVzdWx0KCBmYWxzZSwgJ3lvdHRhPWZhbHNlIHNlbnQgc29tZXRoaW5nJywgeW90dGFGYWxzZUFuYWx5c2lzICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgeW90dGFTb21lRmxhZ1VSTCA9IGAke3VybH0mJHtkZW1vWW90dGFRdWVyeVBhcmFtZXRlcktleX09JHtkZW1vWW90dGFRdWVyeVBhcmFtZXRlclZhbHVlfWA7XG4gICAgICAgICAgY29uc3QgeW90dGFTb21lRmxhZ0FuYWx5c2lzID0gYW5hbHl6ZVVSTHMoIGF3YWl0IGdldExvYWRlZFVSTHMoIHlvdHRhU29tZUZsYWdVUkwgKSApO1xuICAgICAgICAgIGlmICggIXlvdHRhU29tZUZsYWdBbmFseXNpcy5oYXNEZW1vWW90dGFRdWVyeVBhcmFtZXRlciApIHtcbiAgICAgICAgICAgIGxvZ1Jlc3VsdCggZmFsc2UsIGBObyAke2RlbW9Zb3R0YVF1ZXJ5UGFyYW1ldGVyS2V5fT0ke2RlbW9Zb3R0YVF1ZXJ5UGFyYW1ldGVyVmFsdWV9IHNlbnRgLCB5b3R0YVNvbWVGbGFnQW5hbHlzaXMgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vIENvbnNpZGVyIGFkZGluZyBmdXp6aW5nIGluIHRoZSBmdXR1cmUsIGl0IHNlZW1zIGxpa2Ugd2UncmUgdW5hYmxlIHRvIGdldCB0aGluZ3MgdG8gcnVuIGFmdGVyIGEgZnV6eiBmYWlsdXJlIHRob3VnaFxuICAgICAgICAvLyBjb25zdCBmdXp6VVJMID0gYCR7dXJsfSZmdXp6JmZ1enpNb3VzZSZmdXp6VG91Y2gmZnV6ekJvYXJkYDtcbiAgICAgICAgLy8gdHJ5IHtcbiAgICAgICAgLy8gICBhd2FpdCBwdXBwZXRlZXJMb2FkKCBmdXp6VVJMLCB7XG4gICAgICAgIC8vICAgICB3YWl0Rm9yRnVuY3Rpb246ICd3aW5kb3cucGhldC5qb2lzdC5zaW0nLFxuICAgICAgICAvLyAgICAgZ290b1RpbWVvdXQ6IDYwMDAwLFxuICAgICAgICAvLyAgICAgd2FpdEFmdGVyTG9hZDogNTAwMCxcbiAgICAgICAgLy8gICAgIGJyb3dzZXI6IGJyb3dzZXJcbiAgICAgICAgLy8gICB9ICk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gY2F0Y2goIGUgKSB7XG4gICAgICAgIC8vICAgY29uc29sZS5sb2coIGBmdXp6IGZhaWx1cmUgb24gJHtmdXp6VVJMfTpcXG4ke2V9YCApO1xuICAgICAgICAvLyB9XG4gICAgICB9XG5cbiAgICAgIGlmICggVEVTVF9QSEVUX0lPX0xPQ0FMRSAmJiAoICFyZWxlYXNlQnJhbmNoIHx8IGF3YWl0IHJlbGVhc2VCcmFuY2guaXNQaGV0aW9IeWRyb2dlbigpICkgKSB7XG5cbiAgICAgICAgY29uc3QgdGVzdFVSTHMgPSBbXG4gICAgICAgICAgYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fS8ke3JlbGVhc2VCcmFuY2hQYXRofSR7cmVwb30vYnVpbGQvcGhldC1pby93cmFwcGVycy9zdHVkaW8vP2BcbiAgICAgICAgXTtcblxuICAgICAgICBmb3IgKCBjb25zdCB1cmwgb2YgdGVzdFVSTHMgKSB7XG5cbiAgICAgICAgICAvLyBXcm9uZyBmb3JtYXQgbG9jYWxlIHNob3VsZCByZXN1bHQgaW4gYSBlcnJvciBkaWFsb2cgYW5kIHJlc3VsdGluZyBsb2NhbGUgdG8gZmFsbCBiYWNrIHRvICdlbidcbiAgICAgICAgICBjb25zdCBmYWxsYmFja0xvY2FsZSA9IGF3YWl0IGV2YWx1YXRlKCBgJHt1cmx9JmxvY2FsZT1lc19QWWAsICgpID0+IG5ldyBQcm9taXNlKCAoIHJlc29sdmUsIHJlamVjdCApID0+IHtcbiAgICAgICAgICAgICAgcmVzb2x2ZSggcGhldGlvLnBoZXRpb0NsaWVudC5mcmFtZS5jb250ZW50V2luZG93LnBoZXQuY2hpcHBlci5sb2NhbGUgKTtcbiAgICAgICAgICAgIH0gKSwgeyB3YWl0Rm9yRnVuY3Rpb246ICchIXBoZXRpby5waGV0aW9DbGllbnQuc2ltU3RhcnRlZCcgfVxuICAgICAgICAgICk7XG4gICAgICAgICAgbG9nUmVzdWx0KCBmYWxsYmFja0xvY2FsZSA9PT0gJ2VzJywgJ2VzIGZhbGxiYWNrIGV4cGVjdGVkIGZvciBub24gZXhpc3RlbnQgZXNfUFknLCBgJHt1cmx9JmxvY2FsZT1lc19QWWAgKTtcblxuICAgICAgICAgIC8vIFdyb25nIGZvcm1hdCBsb2NhbGUgc2hvdWxkIHJlc3VsdCBpbiBhIGVycm9yIGRpYWxvZyBhbmQgcmVzdWx0aW5nIGxvY2FsZSB0byBmYWxsIGJhY2sgdG8gJ2VuJ1xuICAgICAgICAgIGNvbnN0IGVtcHR5TG9jYWxlUGFyYW0gPSBhd2FpdCBldmFsdWF0ZSggYCR7dXJsfSZsb2NhbGU9YCwgKCkgPT4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xuICAgICAgICAgICAgICByZXNvbHZlKCBwaGV0aW8ucGhldGlvQ2xpZW50LmZyYW1lLmNvbnRlbnRXaW5kb3cucGhldC5jaGlwcGVyLmxvY2FsZSApO1xuICAgICAgICAgICAgfSApLCB7IHdhaXRGb3JGdW5jdGlvbjogJyEhcGhldGlvLnBoZXRpb0NsaWVudC5zaW1TdGFydGVkJyB9XG4gICAgICAgICAgKTtcbiAgICAgICAgICBsb2dSZXN1bHQoIGVtcHR5TG9jYWxlUGFyYW0gPT09ICdlbicsICdlbiBmYWxsYmFjayBleHBlY3RlZCBmb3IgZW1wdHkgbG9jYWxlIGluIHN0dWRpbycsIGAke3VybH0mbG9jYWxlPWAgKTtcblxuICAgICAgICAgIC8vIFdyb25nIGZvcm1hdCBsb2NhbGUgc2hvdWxkIHJlc3VsdCBpbiBhIGVycm9yIGRpYWxvZyBhbmQgcmVzdWx0aW5nIGxvY2FsZSB0byBmYWxsIGJhY2sgdG8gJ2VuJ1xuICAgICAgICAgIGNvbnN0IGJhZEZvcm1hdExvY2FsZVBhcmFtID0gYXdhaXQgZXZhbHVhdGUoIGAke3VybH0mbG9jYWxlPWZkc2FgLCAoKSA9PiBuZXcgUHJvbWlzZSggKCByZXNvbHZlLCByZWplY3QgKSA9PiB7XG4gICAgICAgICAgICAgIHJlc29sdmUoIHBoZXRpby5waGV0aW9DbGllbnQuZnJhbWUuY29udGVudFdpbmRvdy5waGV0LmNoaXBwZXIubG9jYWxlICk7XG4gICAgICAgICAgICB9ICksIHsgd2FpdEZvckZ1bmN0aW9uOiAnISFwaGV0aW8ucGhldGlvQ2xpZW50LnNpbVN0YXJ0ZWQnIH1cbiAgICAgICAgICApO1xuICAgICAgICAgIGxvZ1Jlc3VsdCggYmFkRm9ybWF0TG9jYWxlUGFyYW0gPT09ICdlbicsICdlbiBmYWxsYmFjayBleHBlY3RlZCBmb3IgYmFkbHkgZm9ybWF0dGVkIGxvY2FsZSBpbiBzdHVkaW8nLCBgJHt1cmx9JmxvY2FsZT1mZHNhYCApO1xuXG4gICAgICAgICAgY29uc3Qgc3RhbmRhcmRXcmFwcGVyID0gYXdhaXQgZXZhbHVhdGUoIGAke3VybH0mZXhwb3NlU3RhbmRhcmRQaGV0aW9XcmFwcGVyYCwgKCkgPT4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdtZXNzYWdlJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgICBpZiAoIGV2ZW50LmRhdGEuc3RhbmRhcmRQaGV0aW9XcmFwcGVyICkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoIGV2ZW50LmRhdGEuc3RhbmRhcmRQaGV0aW9XcmFwcGVyICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgd2luZG93LnBoZXRpb0NsaWVudC5pbnZva2UoIGAke3BoZXRpby5QaGV0aW9DbGllbnQuQ0FNRUxfQ0FTRV9TSU1VTEFUSU9OX05BTUV9LmdlbmVyYWwubW9kZWwubG9jYWxlUHJvcGVydHlgLCAnc2V0VmFsdWUnLCBbICdkZScgXSwgKCkgPT4ge1xuICAgICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoIHsgdHlwZTogJ2dldFN0YW5kYXJkUGhldGlvV3JhcHBlcicgfSwgJyonICk7XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgfSApLCB7IHdhaXRGb3JGdW5jdGlvbjogJyEhd2luZG93LnBoZXRpb0NsaWVudC5zaW1TdGFydGVkJyB9ICk7XG5cbiAgICAgICAgICBjb25zdCBwYXJlbnREaXIgPSAnLi4vdGVtcC9yZWxlYXNlLWJyYW5jaC10ZXN0cy8nO1xuICAgICAgICAgIGlmICggIWZzLmV4aXN0c1N5bmMoIHBhcmVudERpciApICkge1xuICAgICAgICAgICAgZnMubWtkaXJTeW5jKCBwYXJlbnREaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0gKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBwYXRoID0gYHRlbXAvcmVsZWFzZS1icmFuY2gtdGVzdHMvJHtyZXBvfS1zdGFuZGFyZC13cmFwcGVyLmh0bWxgO1xuICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gYC4uLyR7cGF0aH1gO1xuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoIGZpbGVQYXRoLCBzdGFuZGFyZFdyYXBwZXIgKTtcblxuICAgICAgICAgIGNvbnN0IHRlc3RMb2NhbGUgPSBhc3luYyAoIGxvY2FsZSwgZXhwZWN0ZWRMb2NhbGUsIGRlYnVnID0gdHJ1ZSApID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN0YW5kYXJkV3JhcHBlclVSTCA9IGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0vJHtwYXRofT8ke2xvY2FsZSA/IGBsb2NhbGU9JHtsb2NhbGV9YCA6ICcnfSZwaGV0aW9EZWJ1Zz0ke2RlYnVnfWA7XG4gICAgICAgICAgICBjb25zdCBhY3R1YWxMb2NhbGUgPSBhd2FpdCBldmFsdWF0ZSggc3RhbmRhcmRXcmFwcGVyVVJMLCAoKSA9PiBuZXcgUHJvbWlzZSggcmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoICgpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ3NpbScgKS5jb250ZW50V2luZG93LnBoZXQuY2hpcHBlci5sb2NhbGUgKTtcbiAgICAgICAgICAgICAgfSwgMTAwMCApOyAvLyB3YWl0IGZvciBzdGF0ZSB0byBiZSBzZXQgYWZ0ZXIgbG9hZGluZ1xuICAgICAgICAgICAgfSApLCB7IHdhaXRGb3JGdW5jdGlvbjogJyEhd2luZG93LnBoZXRpb0NsaWVudC5zaW1TdGFydGVkJyB9ICk7XG4gICAgICAgICAgICBjb25zdCBzdWNjZXNzID0gYWN0dWFsTG9jYWxlID09PSBleHBlY3RlZExvY2FsZTtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgcGhldC1pbyBidWlsdCBsb2NhbGUgJHtsb2NhbGV9IHNob3VsZCBiZSAke2V4cGVjdGVkTG9jYWxlfWA7XG4gICAgICAgICAgICBsb2dSZXN1bHQoIHN1Y2Nlc3MsIG1lc3NhZ2UsIHN0YW5kYXJkV3JhcHBlclVSTCApO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICBhd2FpdCB0ZXN0TG9jYWxlKCBudWxsLCAnZGUnICk7XG4gICAgICAgICAgYXdhaXQgdGVzdExvY2FsZSggJ3NwYScsICdlcycgKTtcbiAgICAgICAgICBhd2FpdCB0ZXN0TG9jYWxlKCAnRVMtcHknLCAnZXMnICk7XG4gICAgICAgICAgYXdhaXQgdGVzdExvY2FsZSggJ3h4X3BXJywgJ2VuJyApO1xuICAgICAgICAgIGF3YWl0IHRlc3RMb2NhbGUoICdhcnRsYWtlcm50JywgJ2VuJywgZmFsc2UgKTtcblxuICAgICAgICAgIGZzLnJtU3luYyggZmlsZVBhdGggKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSApO1xuXG4gIGJyb3dzZXIuY2xvc2UoKTtcbn0gKSgpOyJdLCJuYW1lcyI6WyJfIiwicmVxdWlyZSIsInB1cHBldGVlckxvYWQiLCJNYWludGVuYW5jZSIsIndpdGhTZXJ2ZXIiLCJ3aW5zdG9uIiwicHVwcGV0ZWVyIiwiZnMiLCJkZWZhdWx0IiwidHJhbnNwb3J0cyIsImNvbnNvbGUiLCJsZXZlbCIsIlRFU1RfRlJPTV9NQUlOIiwiVkVSQk9TRV9MT0dfU1VDQ0VTUyIsIlRFU1RfTE9DQUxFUyIsIlRFU1RfQU5BTFlUSUNTIiwiVEVTVF9QSEVUX0lPX0xPQ0FMRSIsIlNLSVBfVElUTEVfU1RSSU5HX1BBVFRFUk4iLCJsb2NhbGVEYXRhIiwiSlNPTiIsInBhcnNlIiwicmVhZEZpbGVTeW5jIiwibG9nUmVzdWx0Iiwic3VjY2VzcyIsIm1lc3NhZ2UiLCJ1cmwiLCJsb2ciLCJicm93c2VyIiwibGF1bmNoIiwiYXJncyIsInBvcnQiLCJyZWxlYXNlQnJhbmNoZXMiLCJsb2FkQWxsTWFpbnRlbmFuY2VCcmFuY2hlcyIsImdldEJ1aWx0VVJMcyIsInJlbGVhc2VCcmFuY2giLCJ1cmxzIiwicmVwbyIsImJyYW5jaCIsInJlbGVhc2VCcmFuY2hQYXRoIiwiYnVpbGREaXIiLCJwdXNoIiwidXNlc0NoaXBwZXIyIiwiYnJhbmRzIiwiaW5jbHVkZXMiLCJzdGFuZGFsb25lUGFyYW1zIiwiZ2V0UGhldGlvU3RhbmRhbG9uZVF1ZXJ5UGFyYW1ldGVyIiwicGhldGlvU3VmZml4IiwiZ2V0VW5idWlsdFVSTHMiLCJnZXRBbGxVUkxzIiwiZ2V0TG9hZGVkVVJMcyIsIm9uUGFnZUNyZWF0aW9uIiwicGFnZSIsIm9uIiwicmVxdWVzdCIsInN0YXJ0c1dpdGgiLCJnb3RvVGltZW91dCIsIndhaXRBZnRlckxvYWQiLCJkZW1vWW90dGFRdWVyeVBhcmFtZXRlcktleSIsImRlbW9Zb3R0YVF1ZXJ5UGFyYW1ldGVyVmFsdWUiLCJhbmFseXplVVJMcyIsInNlbnRHb29nbGVBbmFseXRpY3MiLCJzb21lIiwic2VudFlvdHRhIiwic2VudEV4dGVybmFsUmVxdWVzdCIsImhhc0RlbW9Zb3R0YVF1ZXJ5UGFyYW1ldGVyIiwiVVJMU2VhcmNoUGFyYW1zIiwiVVJMIiwic2VhcmNoIiwiZ2V0IiwiZXZhbHVhdGUiLCJvcHRpb25zIiwiYWxsb3dlZFRpbWVUb0xvYWQiLCJlIiwic3BsaXQiLCJpc1VuYnVsdE9uTWFpbiIsInRvU3RyaW5nIiwiZ2V0VXJsV2l0aExvY2FsZSIsImxvY2FsZSIsImdldExvY2FsZVNwZWNpZmljVVJMIiwicmVwbGFjZSIsImxvZ1N0YXR1cyIsInN0YXR1cyIsImxvZ2dlZFVSTCIsImxvY2FsZVZhbHVlcyIsInBoZXQiLCJjaGlwcGVyIiwiZXNfUFkiLCJnZXRSdW5uaW5nTG9jYWxlIiwiZXNMb2NhbGUiLCJzcGFMb2NhbGUiLCJlc3B5TG9jYWxlIiwiYXJtYUxvY2FsZSIsImFybWFTdGF0dXMiLCJpbnZhbGlkTG9jYWxlIiwicmVwb1BhY2thZ2VPYmplY3QiLCJwYXJ0aWFsUG90ZW50aWFsVGl0bGVTdHJpbmdLZXkiLCJmdWxsUG90ZW50aWFsVGl0bGVTdHJpbmdLZXkiLCJyZXF1aXJlanNOYW1lc3BhY2UiLCJoYXNUaXRsZUtleSIsImdldFRpdGxlIiwiZG9jdW1lbnQiLCJ0aXRsZSIsIndhaXRGb3JGdW5jdGlvbiIsImxvb2t1cFNwZWNpZmljVGl0bGVUcmFuc2xhdGlvbiIsImpzb24iLCJ2YWx1ZSIsImxvb2t1cEZhbGxiYWNrVGl0bGUiLCJsb2NhbGVzIiwiZmFsbGJhY2tMb2NhbGVzIiwidGVzdExvY2FsZSIsIkVycm9yIiwiY2hlY2tUaXRsZSIsImxvb2t1cExvY2FsZSIsImFjdHVhbFRpdGxlIiwiZXhwZWN0ZWRUaXRsZSIsInRyaW0iLCJzdHJpbmdpZnkiLCJlc1RpdGxlRXJyb3IiLCJzcGFUaXRsZUVycm9yIiwiZXNweVRpdGxlRXJyb3IiLCJnZXRIYXNRU01XYXJuaW5nIiwibm9uRW5nbGlzaFRyYW5zbGF0aW9uTG9jYWxlcyIsInJlYWRkaXJTeW5jIiwiZmlsdGVyIiwiZmlsZSIsIm1hcCIsInN1YnN0cmluZyIsImluZGV4T2YiLCJsYXN0SW5kZXhPZiIsImdldFNvbWVSYW5kb21UcmFuc2xhdGVkTG9jYWxlcyIsInVuaXEiLCJzYW1wbGVTaXplIiwiaW5jbHVkZWREYXRhTG9jYWxlcyIsInNvcnRCeSIsIk9iamVjdCIsImtleXMiLCJmYWxsYmFja0xvY2FsZSIsImRhdGFMb2NhbGVDaGVjayIsInNwZWNpZmljVVJMIiwiY2hlY2tMb2NhbGUiLCJwbGFpblVSTCIsInBsYWluQW5hbHlzaXMiLCJ5b3R0YUZhbHNlVVJMIiwieW90dGFGYWxzZUFuYWx5c2lzIiwieW90dGFTb21lRmxhZ1VSTCIsInlvdHRhU29tZUZsYWdBbmFseXNpcyIsImlzUGhldGlvSHlkcm9nZW4iLCJ0ZXN0VVJMcyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwicGhldGlvIiwicGhldGlvQ2xpZW50IiwiZnJhbWUiLCJjb250ZW50V2luZG93IiwiZW1wdHlMb2NhbGVQYXJhbSIsImJhZEZvcm1hdExvY2FsZVBhcmFtIiwic3RhbmRhcmRXcmFwcGVyIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwiZGF0YSIsInN0YW5kYXJkUGhldGlvV3JhcHBlciIsImludm9rZSIsIlBoZXRpb0NsaWVudCIsIkNBTUVMX0NBU0VfU0lNVUxBVElPTl9OQU1FIiwicG9zdE1lc3NhZ2UiLCJ0eXBlIiwicGFyZW50RGlyIiwiZXhpc3RzU3luYyIsIm1rZGlyU3luYyIsInJlY3Vyc2l2ZSIsInBhdGgiLCJmaWxlUGF0aCIsIndyaXRlRmlsZVN5bmMiLCJleHBlY3RlZExvY2FsZSIsImRlYnVnIiwic3RhbmRhcmRXcmFwcGVyVVJMIiwiYWN0dWFsTG9jYWxlIiwic2V0VGltZW91dCIsImdldEVsZW1lbnRCeUlkIiwicm1TeW5jIiwiY2xvc2UiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBa0JDLEdBRUQsNERBQTREO0FBQzVELHNDQUFzQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUV0QyxNQUFNQSxJQUFJQyxRQUFTO0FBQ25CLE1BQU1DLGdCQUFnQkQsUUFBUztBQUMvQixNQUFNRSxjQUFjRixRQUFTO0FBQzdCLE1BQU1HLGFBQWFILFFBQVM7QUFDNUIsTUFBTUksVUFBVUosUUFBUztBQUN6QixNQUFNSyxZQUFZTCxRQUFTO0FBQzNCLE1BQU1NLEtBQUtOLFFBQVM7QUFFcEJJLFFBQVFHLE9BQU8sQ0FBQ0MsVUFBVSxDQUFDQyxPQUFPLENBQUNDLEtBQUssR0FBRztBQUUzQyx3QkFBd0I7QUFDeEIsbUJBQW1CO0FBRW5CLHFHQUFxRztBQUNyRyxvRUFBb0U7QUFDcEUsTUFBTUMsaUJBQWlCO0FBQ3ZCLCtDQUErQztBQUMvQyxNQUFNQyxzQkFBc0I7QUFFNUIsd0JBQXdCO0FBQ3hCLE1BQU1DLGVBQWUsTUFBTSxpQ0FBaUM7QUFDNUQsTUFBTUMsaUJBQWlCLE9BQU8sdUJBQXVCO0FBQ3JELE1BQU1DLHNCQUFzQixNQUFNLDRDQUE0QztBQUM5RSxNQUFNQyw0QkFBNEI7QUFDbEMsK0NB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