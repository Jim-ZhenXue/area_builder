// Copyright 2017-2024, University of Colorado Boulder
/**
 * Builds a runnable (something that builds like a simulation)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
import assert from 'assert';
import fs, { readFileSync } from 'fs';
import jimp from 'jimp';
import _ from 'lodash';
import zlib from 'zlib';
import affirm from '../../../perennial-alias/js/browser-and-node/affirm.js';
import phetTimingLog from '../../../perennial-alias/js/common/phetTimingLog.js';
import grunt from '../../../perennial-alias/js/npm-dependencies/grunt.js';
import ChipperConstants from '../common/ChipperConstants.js';
import ChipperStringUtils from '../common/ChipperStringUtils.js';
import getLicenseEntry from '../common/getLicenseEntry.js';
import loadFileAsDataURI from '../common/loadFileAsDataURI.js';
import copyDirectory from './copyDirectory.js';
import copySupplementalPhetioFiles from './copySupplementalPhetioFiles.js';
import generateThumbnails from './generateThumbnails.js';
import generateTwitterCard from './generateTwitterCard.js';
import getA11yViewHTMLFromTemplate from './getA11yViewHTMLFromTemplate.js';
import getAllThirdPartyEntries from './getAllThirdPartyEntries.js';
import getDependencies from './getDependencies.js';
import getInitializationScript from './getInitializationScript.js';
import getLocalesFromRepository from './getLocalesFromRepository.js';
import getPhetLibs from './getPhetLibs.js';
import getPreloads from './getPreloads.js';
import getPrunedLocaleData from './getPrunedLocaleData.js';
import getStringMap from './getStringMap.js';
import getTitleStringKey from './getTitleStringKey.js';
import minify from './minify.js';
import packageRunnable from './packageRunnable.js';
import packageXHTML from './packageXHTML.js';
import reportUnusedMedia from './reportUnusedMedia.js';
import reportUnusedStrings from './reportUnusedStrings.js';
import webpackBuild from './webpackBuild.js';
const nodeHtmlEncoder = require('node-html-encoder');
const recordTime = /*#__PURE__*/ _async_to_generator(function*(name, asyncCallback, timeCallback) {
    const beforeTime = Date.now();
    const result = yield phetTimingLog.startAsync(name, /*#__PURE__*/ _async_to_generator(function*() {
        return asyncCallback();
    }));
    const afterTime = Date.now();
    timeCallback(afterTime - beforeTime, result);
    return result;
});
/**
 * Builds a runnable (e.g. a simulation).
 *
 * @param repo
 * @param minifyOptions - see minify.js
 * @param allHTML - If the _all.html file should be generated
 * @param brand
 * @param localesOption - e.g,. '*', 'en,es', etc.
 * @param encodeStringMap
 * @param compressScripts
 * @param profileFileSize
 * @param typeCheck
 */ export default function(repo, minifyOptions, allHTML, brand, localesOption, encodeStringMap, compressScripts, profileFileSize, typeCheck) {
    return _ref.apply(this, arguments);
}
function _ref() {
    _ref = _async_to_generator(function*(repo, minifyOptions, allHTML, brand, localesOption, encodeStringMap, compressScripts, profileFileSize, typeCheck) {
        if (brand === 'phet-io') {
            affirm(grunt.file.exists('../phet-io'), 'Aborting the build of phet-io brand since proprietary repositories are not checked out.\nPlease use --brands=={{BRAND}} in the future to avoid this.');
        }
        const packageObject = JSON.parse(readFileSync(`../${repo}/package.json`, 'utf8'));
        const encoder = new nodeHtmlEncoder.Encoder('entity');
        // All html files share the same build timestamp
        let timestamp = new Date().toISOString().split('T').join(' ');
        timestamp = `${timestamp.substring(0, timestamp.indexOf('.'))} UTC`;
        // Start running webpack
        const webpackResult = yield recordTime('webpack', /*#__PURE__*/ _async_to_generator(function*() {
            return webpackBuild(repo, brand, {
                profileFileSize: profileFileSize
            });
        }), (time)=>{
            grunt.log.ok(`Webpack build complete: ${time}ms`);
        });
        // NOTE: This build currently (due to the string/mipmap plugins) modifies globals. Some operations need to be done after this.
        const webpackJS = wrapProfileFileSize(`phet.chipper.runWebpack = function() {${webpackResult.js}};`, profileFileSize, 'WEBPACK');
        // Debug version is independent of passed in minifyOptions.  PhET-iO brand is minified, but leaves assertions & logging.
        const debugMinifyOptions = brand === 'phet-io' ? {
            stripAssertions: false,
            stripLogging: false
        } : {
            minify: false
        };
        // If turning off minification for the main build, don't minify the debug version also
        if (!minifyOptions.minify) {
            debugMinifyOptions.minify = false;
        }
        const usedModules = webpackResult.usedModules;
        reportUnusedMedia(repo, usedModules);
        // TODO: More specific object type, see https://github.com/phetsims/chipper/issues/1538
        const licenseEntries = {};
        ChipperConstants.MEDIA_TYPES.forEach((mediaType)=>{
            licenseEntries[mediaType] = {};
        });
        usedModules.forEach((module)=>{
            ChipperConstants.MEDIA_TYPES.forEach((mediaType)=>{
                if (module.split('/')[1] === mediaType) {
                    // The file suffix is stripped and restored to its non-js extension. This is because getLicenseEntry doesn't
                    // handle modulified media files.
                    const index = module.lastIndexOf('_');
                    const path = `${module.slice(0, index)}.${module.slice(index + 1, -3)}`;
                    // TODO: More specific object type, see https://github.com/phetsims/chipper/issues/1538
                    // @ts-expect-error https://github.com/phetsims/chipper/issues/1538
                    licenseEntries[mediaType][module] = getLicenseEntry(`../${path}`);
                }
            });
        });
        const phetLibs = getPhetLibs(repo, brand);
        const allLocales = [
            ChipperConstants.FALLBACK_LOCALE,
            ...getLocalesFromRepository(repo)
        ];
        const locales = localesOption === '*' ? allLocales : localesOption.split(',');
        const dependencies = yield getDependencies(repo);
        const dependencyReps = Object.keys(dependencies);
        // on Windows, paths are reported with a backslash, normalize to forward slashes so this works everywhere
        usedModules.map((module)=>module.split('\\').join('/')).forEach((moduleDependency)=>{
            // The first part of the path is the repo.  Or if no directory is specified, the file is in the sim repo.
            const pathSeparatorIndex = moduleDependency.indexOf('/');
            const moduleRepo = pathSeparatorIndex >= 0 ? moduleDependency.slice(0, pathSeparatorIndex) : repo;
            assert && assert(dependencyReps.includes(moduleRepo), `repo ${moduleRepo} missing from package.json's phetLibs for ${moduleDependency}`);
            // Also check if the module was coming from chipper dist
            if (moduleDependency.includes('chipper/dist/js/')) {
                var _moduleDependency_split_;
                const distRepo = (_moduleDependency_split_ = moduleDependency.split('chipper/dist/js/')[1]) == null ? void 0 : _moduleDependency_split_.split('/')[0];
                distRepo && assert && assert(dependencyReps.includes(distRepo), `repo ${distRepo} missing from package.json's phetLibs for ${moduleDependency}`);
            }
        });
        const version = packageObject.version; // Include the one-off name in the version
        const thirdPartyEntries = getAllThirdPartyEntries(repo, brand, licenseEntries);
        const simTitleStringKey = getTitleStringKey(repo);
        const { stringMap, stringMetadata } = getStringMap(repo, allLocales, phetLibs, webpackResult.usedModules);
        // After our string map is constructed, report which of the translatable strings are unused.
        reportUnusedStrings(repo, packageObject.phet.requirejsNamespace, stringMap[ChipperConstants.FALLBACK_LOCALE]);
        // If we have NO strings for a given locale that we want, we'll need to fill it in with all English strings, see
        // https://github.com/phetsims/perennial/issues/83
        for (const locale of locales){
            if (!stringMap[locale]) {
                stringMap[locale] = stringMap[ChipperConstants.FALLBACK_LOCALE];
            }
        }
        const englishTitle = stringMap[ChipperConstants.FALLBACK_LOCALE][simTitleStringKey];
        assert && assert(englishTitle, `missing entry for sim title, key = ${simTitleStringKey}`);
        // Select the HTML comment header based on the brand, see https://github.com/phetsims/chipper/issues/156
        let htmlHeader;
        if (brand === 'phet-io') {
            // License text provided by @kathy-phet in https://github.com/phetsims/chipper/issues/148#issuecomment-112584773
            htmlHeader = `${englishTitle} ${version}\n` + `Copyright 2002-${grunt.template.today('yyyy')}, Regents of the University of Colorado\n` + 'PhET Interactive Simulations, University of Colorado Boulder\n' + '\n' + 'This Interoperable PhET Simulation file requires a license.\n' + 'USE WITHOUT A LICENSE AGREEMENT IS STRICTLY PROHIBITED.\n' + 'Contact phethelp@colorado.edu regarding licensing.\n' + 'https://phet.colorado.edu/en/licensing';
        } else {
            htmlHeader = `${englishTitle} ${version}\n` + `Copyright 2002-${grunt.template.today('yyyy')}, Regents of the University of Colorado\n` + 'PhET Interactive Simulations, University of Colorado Boulder\n' + '\n' + 'This file is licensed under Creative Commons Attribution 4.0\n' + 'For alternate source code licensing, see https://github.com/phetsims\n' + 'For licenses for third-party software used by this simulation, see below\n' + 'For more information, see https://phet.colorado.edu/en/licensing/html\n' + '\n' + 'The PhET name and PhET logo are registered trademarks of The Regents of the\n' + 'University of Colorado. Permission is granted to use the PhET name and PhET logo\n' + 'only for attribution purposes. Use of the PhET name and/or PhET logo for promotional,\n' + 'marketing, or advertising purposes requires a separate license agreement from the\n' + 'University of Colorado. Contact phethelp@colorado.edu regarding licensing.';
        }
        // Scripts that are run before our main minifiable content
        const startupScripts = [
            // Splash image
            wrapProfileFileSize(`window.PHET_SPLASH_DATA_URI="${loadFileAsDataURI(`../brand/${brand}/images/splash.svg`)}";`, profileFileSize, 'SPLASH')
        ];
        const minifiableScripts = [
            // Preloads
            ...getPreloads(repo, brand, true).map((filename)=>wrapProfileFileSize(grunt.file.read(filename), profileFileSize, 'PRELOAD', filename)),
            // Our main module content, wrapped in a function called in the startup below
            webpackJS,
            // Main startup
            wrapProfileFileSize(grunt.file.read('../chipper/templates/chipper-startup.js'), profileFileSize, 'STARTUP')
        ];
        const productionScripts = yield recordTime('minify-production', /*#__PURE__*/ _async_to_generator(function*() {
            return [
                ...startupScripts,
                ...minifiableScripts.map((js)=>minify(js, minifyOptions))
            ];
        }), (time, scripts)=>{
            grunt.log.ok(`Production minification complete: ${time}ms (${_.sum(scripts.map((js)=>js.length))} bytes)`);
        });
        const debugScripts = yield recordTime('minify-debug', /*#__PURE__*/ _async_to_generator(function*() {
            return [
                ...startupScripts,
                ...minifiableScripts.map((js)=>minify(js, debugMinifyOptions))
            ];
        }), (time, scripts)=>{
            grunt.log.ok(`Debug minification complete: ${time}ms (${_.sum(scripts.map((js)=>js.length))} bytes)`);
        });
        const licenseScript = wrapProfileFileSize(ChipperStringUtils.replacePlaceholders(grunt.file.read('../chipper/templates/license-initialization.js'), {
            PHET_START_THIRD_PARTY_LICENSE_ENTRIES: ChipperConstants.START_THIRD_PARTY_LICENSE_ENTRIES,
            PHET_THIRD_PARTY_LICENSE_ENTRIES: JSON.stringify(thirdPartyEntries, null, 2),
            PHET_END_THIRD_PARTY_LICENSE_ENTRIES: ChipperConstants.END_THIRD_PARTY_LICENSE_ENTRIES
        }), profileFileSize, 'LICENSE');
        const commonInitializationOptions = {
            brand: brand,
            repo: repo,
            localeData: getPrunedLocaleData(allLocales),
            stringMap: stringMap,
            stringMetadata: stringMetadata,
            dependencies: dependencies,
            timestamp: timestamp,
            version: version,
            packageObject: packageObject,
            allowLocaleSwitching: false,
            encodeStringMap: encodeStringMap,
            profileFileSize: profileFileSize,
            wrapStringsJS: (stringsJS)=>wrapProfileFileSize(stringsJS, profileFileSize, 'STRINGS')
        };
        // Create the build-specific directory
        const buildDir = `../${repo}/build/${brand}`;
        fs.mkdirSync(buildDir, {
            recursive: true
        });
        // {{locale}}.html
        if (brand !== 'phet-io') {
            for (const locale of locales){
                const initializationScript = getInitializationScript(_.assignIn({
                    locale: locale,
                    includeAllLocales: false,
                    isDebugBuild: false
                }, commonInitializationOptions));
                grunt.file.write(`${buildDir}/${repo}_${locale}_${brand}.html`, packageRunnable({
                    repo: repo,
                    stringMap: stringMap,
                    htmlHeader: htmlHeader,
                    locale: locale,
                    compressScripts: compressScripts,
                    licenseScript: licenseScript,
                    scripts: [
                        initializationScript,
                        ...productionScripts
                    ]
                }));
            }
        }
        // _all.html (forced for phet-io)
        if (allHTML || brand === 'phet-io') {
            const initializationScript = getInitializationScript(_.assignIn({
                locale: ChipperConstants.FALLBACK_LOCALE,
                includeAllLocales: true,
                isDebugBuild: false
            }, commonInitializationOptions, {
                allowLocaleSwitching: true
            }));
            const allHTMLFilename = `${buildDir}/${repo}_all_${brand}.html`;
            const allHTMLContents = packageRunnable({
                repo: repo,
                stringMap: stringMap,
                htmlHeader: htmlHeader,
                locale: ChipperConstants.FALLBACK_LOCALE,
                compressScripts: compressScripts,
                licenseScript: licenseScript,
                scripts: [
                    initializationScript,
                    ...productionScripts
                ]
            });
            grunt.file.write(allHTMLFilename, allHTMLContents);
            // Add a compressed file to improve performance in the iOS app, see https://github.com/phetsims/chipper/issues/746
            grunt.file.write(`${allHTMLFilename}.gz`, zlib.gzipSync(allHTMLContents));
        }
        // Debug build (always included)
        const debugInitializationScript = getInitializationScript(_.assignIn({
            locale: ChipperConstants.FALLBACK_LOCALE,
            includeAllLocales: true,
            isDebugBuild: true
        }, commonInitializationOptions, {
            allowLocaleSwitching: true
        }));
        grunt.file.write(`${buildDir}/${repo}_all_${brand}_debug.html`, packageRunnable({
            repo: repo,
            stringMap: stringMap,
            htmlHeader: htmlHeader,
            locale: ChipperConstants.FALLBACK_LOCALE,
            compressScripts: compressScripts,
            licenseScript: licenseScript,
            scripts: [
                debugInitializationScript,
                ...debugScripts
            ]
        }));
        // XHTML build (ePub compatibility, etc.)
        const xhtmlDir = `${buildDir}/xhtml`;
        fs.mkdirSync(xhtmlDir, {
            recursive: true
        });
        const xhtmlInitializationScript = getInitializationScript(_.assignIn({
            locale: ChipperConstants.FALLBACK_LOCALE,
            includeAllLocales: true,
            isDebugBuild: false
        }, commonInitializationOptions, {
            allowLocaleSwitching: true
        }));
        packageXHTML(xhtmlDir, {
            repo: repo,
            brand: brand,
            stringMap: stringMap,
            htmlHeader: htmlHeader,
            initializationScript: xhtmlInitializationScript,
            licenseScript: licenseScript,
            scripts: productionScripts
        });
        // dependencies.json
        grunt.file.write(`${buildDir}/dependencies.json`, JSON.stringify(dependencies, null, 2));
        // string-map.json and english-string-map.json, for things like Rosetta that need to know what strings are used
        grunt.file.write(`${buildDir}/string-map.json`, JSON.stringify(stringMap, null, 2));
        grunt.file.write(`${buildDir}/english-string-map.json`, JSON.stringify(stringMap.en, null, 2));
        // -iframe.html (English is assumed as the locale).
        if (_.includes(locales, ChipperConstants.FALLBACK_LOCALE) && brand === 'phet') {
            const englishTitle = stringMap[ChipperConstants.FALLBACK_LOCALE][getTitleStringKey(repo)];
            grunt.log.verbose.writeln('Constructing HTML for iframe testing from template');
            let iframeTestHtml = grunt.file.read('../chipper/templates/sim-iframe.html');
            iframeTestHtml = ChipperStringUtils.replaceFirst(iframeTestHtml, '{{PHET_SIM_TITLE}}', encoder.htmlEncode(`${englishTitle} iframe test`));
            iframeTestHtml = ChipperStringUtils.replaceFirst(iframeTestHtml, '{{PHET_REPOSITORY}}', repo);
            const iframeLocales = [
                'en'
            ].concat(allHTML ? [
                'all'
            ] : []);
            iframeLocales.forEach((locale)=>{
                const iframeHtml = ChipperStringUtils.replaceFirst(iframeTestHtml, '{{PHET_LOCALE}}', locale);
                grunt.file.write(`${buildDir}/${repo}_${locale}_iframe_phet.html`, iframeHtml);
            });
        }
        // If the sim is a11y outfitted, then add the a11y pdom viewer to the build dir. NOTE: Not for phet-io builds.
        if (packageObject.phet.simFeatures && packageObject.phet.simFeatures.supportsInteractiveDescription && brand === 'phet') {
            // (a11y) Create the a11y-view HTML file for PDOM viewing.
            let a11yHTML = getA11yViewHTMLFromTemplate(repo);
            // this replaceAll is outside of the getA11yViewHTMLFromTemplate because we only want it filled in during the build
            a11yHTML = ChipperStringUtils.replaceAll(a11yHTML, '{{IS_BUILT}}', 'true');
            grunt.file.write(`${buildDir}/${repo}${ChipperConstants.A11Y_VIEW_HTML_SUFFIX}`, a11yHTML);
        }
        // copy over supplemental files or dirs to package with the build. Only supported in phet brand
        if (packageObject.phet && packageObject.phet.packageWithBuild) {
            assert && assert(Array.isArray(packageObject.phet.packageWithBuild));
            packageObject.phet.packageWithBuild.forEach((path)=>{
                // eslint-disable-next-line phet/no-simple-type-checking-assertions
                assert && assert(typeof path === 'string', 'path should be a string');
                assert && assert(grunt.file.exists(path), `path does not exist: ${path}`);
                if (grunt.file.isDir(path)) {
                    copyDirectory(path, `${buildDir}/${path}`);
                } else {
                    grunt.file.copy(path, `${buildDir}/${path}`);
                }
            });
        }
        if (brand === 'phet-io') {
            yield copySupplementalPhetioFiles(repo, version, englishTitle, packageObject, true, typeCheck);
        }
        // Thumbnails and twitter card
        if (grunt.file.exists(`../${repo}/assets/${repo}-screenshot.png`)) {
            const thumbnailSizes = [
                {
                    width: 128,
                    height: 84
                },
                {
                    width: 600,
                    height: 394
                }
            ];
            for (const size of thumbnailSizes){
                grunt.file.write(`${buildDir}/${repo}-${size.width}.png`, (yield generateThumbnails(repo, size.width, size.height, 100, jimp.MIME_PNG)));
            }
            if (brand === 'phet') {
                grunt.file.write(`${buildDir}/${repo}-ios.png`, (yield generateThumbnails(repo, 420, 276, 90, jimp.MIME_JPEG)));
                grunt.file.write(`${buildDir}/${repo}-twitter-card.png`, (yield generateTwitterCard(repo)));
            }
        }
    });
    return _ref.apply(this, arguments);
}
// For profiling file size. Name is optional
const wrapProfileFileSize = (string, profileFileSize, type, name)=>{
    if (profileFileSize) {
        const conditionalName = name ? `,"${name}"` : '';
        return `console.log("START_${type.toUpperCase()}"${conditionalName});\n${string}\nconsole.log("END_${type.toUpperCase()}"${conditionalName});\n\n`;
    } else {
        return string;
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L2J1aWxkUnVubmFibGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQnVpbGRzIGEgcnVubmFibGUgKHNvbWV0aGluZyB0aGF0IGJ1aWxkcyBsaWtlIGEgc2ltdWxhdGlvbilcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IGZzLCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCBqaW1wIGZyb20gJ2ppbXAnO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB6bGliIGZyb20gJ3psaWInO1xuaW1wb3J0IGFmZmlybSBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvYnJvd3Nlci1hbmQtbm9kZS9hZmZpcm0uanMnO1xuaW1wb3J0IHBoZXRUaW1pbmdMb2cgZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2NvbW1vbi9waGV0VGltaW5nTG9nLmpzJztcbmltcG9ydCBncnVudCBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvbnBtLWRlcGVuZGVuY2llcy9ncnVudC5qcyc7XG5pbXBvcnQgQ2hpcHBlckNvbnN0YW50cyBmcm9tICcuLi9jb21tb24vQ2hpcHBlckNvbnN0YW50cy5qcyc7XG5pbXBvcnQgQ2hpcHBlclN0cmluZ1V0aWxzIGZyb20gJy4uL2NvbW1vbi9DaGlwcGVyU3RyaW5nVXRpbHMuanMnO1xuaW1wb3J0IGdldExpY2Vuc2VFbnRyeSBmcm9tICcuLi9jb21tb24vZ2V0TGljZW5zZUVudHJ5LmpzJztcbmltcG9ydCBsb2FkRmlsZUFzRGF0YVVSSSBmcm9tICcuLi9jb21tb24vbG9hZEZpbGVBc0RhdGFVUkkuanMnO1xuaW1wb3J0IGNvcHlEaXJlY3RvcnkgZnJvbSAnLi9jb3B5RGlyZWN0b3J5LmpzJztcbmltcG9ydCBjb3B5U3VwcGxlbWVudGFsUGhldGlvRmlsZXMgZnJvbSAnLi9jb3B5U3VwcGxlbWVudGFsUGhldGlvRmlsZXMuanMnO1xuaW1wb3J0IGdlbmVyYXRlVGh1bWJuYWlscyBmcm9tICcuL2dlbmVyYXRlVGh1bWJuYWlscy5qcyc7XG5pbXBvcnQgZ2VuZXJhdGVUd2l0dGVyQ2FyZCBmcm9tICcuL2dlbmVyYXRlVHdpdHRlckNhcmQuanMnO1xuaW1wb3J0IGdldEExMXlWaWV3SFRNTEZyb21UZW1wbGF0ZSBmcm9tICcuL2dldEExMXlWaWV3SFRNTEZyb21UZW1wbGF0ZS5qcyc7XG5pbXBvcnQgZ2V0QWxsVGhpcmRQYXJ0eUVudHJpZXMsIHsgTGljZW5zZUVudHJpZXMgfSBmcm9tICcuL2dldEFsbFRoaXJkUGFydHlFbnRyaWVzLmpzJztcbmltcG9ydCBnZXREZXBlbmRlbmNpZXMgZnJvbSAnLi9nZXREZXBlbmRlbmNpZXMuanMnO1xuaW1wb3J0IGdldEluaXRpYWxpemF0aW9uU2NyaXB0IGZyb20gJy4vZ2V0SW5pdGlhbGl6YXRpb25TY3JpcHQuanMnO1xuaW1wb3J0IGdldExvY2FsZXNGcm9tUmVwb3NpdG9yeSBmcm9tICcuL2dldExvY2FsZXNGcm9tUmVwb3NpdG9yeS5qcyc7XG5pbXBvcnQgZ2V0UGhldExpYnMgZnJvbSAnLi9nZXRQaGV0TGlicy5qcyc7XG5pbXBvcnQgZ2V0UHJlbG9hZHMgZnJvbSAnLi9nZXRQcmVsb2Fkcy5qcyc7XG5pbXBvcnQgZ2V0UHJ1bmVkTG9jYWxlRGF0YSBmcm9tICcuL2dldFBydW5lZExvY2FsZURhdGEuanMnO1xuaW1wb3J0IGdldFN0cmluZ01hcCBmcm9tICcuL2dldFN0cmluZ01hcC5qcyc7XG5pbXBvcnQgZ2V0VGl0bGVTdHJpbmdLZXkgZnJvbSAnLi9nZXRUaXRsZVN0cmluZ0tleS5qcyc7XG5pbXBvcnQgbWluaWZ5LCB7IE1pbmlmeU9wdGlvbnMgfSBmcm9tICcuL21pbmlmeS5qcyc7XG5pbXBvcnQgcGFja2FnZVJ1bm5hYmxlIGZyb20gJy4vcGFja2FnZVJ1bm5hYmxlLmpzJztcbmltcG9ydCBwYWNrYWdlWEhUTUwgZnJvbSAnLi9wYWNrYWdlWEhUTUwuanMnO1xuaW1wb3J0IHJlcG9ydFVudXNlZE1lZGlhIGZyb20gJy4vcmVwb3J0VW51c2VkTWVkaWEuanMnO1xuaW1wb3J0IHJlcG9ydFVudXNlZFN0cmluZ3MgZnJvbSAnLi9yZXBvcnRVbnVzZWRTdHJpbmdzLmpzJztcbmltcG9ydCB3ZWJwYWNrQnVpbGQgZnJvbSAnLi93ZWJwYWNrQnVpbGQuanMnO1xuXG5jb25zdCBub2RlSHRtbEVuY29kZXIgPSByZXF1aXJlKCAnbm9kZS1odG1sLWVuY29kZXInICk7XG5cbmNvbnN0IHJlY29yZFRpbWUgPSBhc3luYyA8VD4oIG5hbWU6IHN0cmluZywgYXN5bmNDYWxsYmFjazogKCkgPT4gUHJvbWlzZTxUPiwgdGltZUNhbGxiYWNrOiAoIHRpbWU6IG51bWJlciwgcmVzdWx0OiBUICkgPT4gdm9pZCApOiBQcm9taXNlPFQ+ID0+IHtcbiAgY29uc3QgYmVmb3JlVGltZSA9IERhdGUubm93KCk7XG5cbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcGhldFRpbWluZ0xvZy5zdGFydEFzeW5jKCBuYW1lLCBhc3luYyAoKSA9PiBhc3luY0NhbGxiYWNrKCkgKTtcblxuICBjb25zdCBhZnRlclRpbWUgPSBEYXRlLm5vdygpO1xuICB0aW1lQ2FsbGJhY2soIGFmdGVyVGltZSAtIGJlZm9yZVRpbWUsIHJlc3VsdCApO1xuICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBCdWlsZHMgYSBydW5uYWJsZSAoZS5nLiBhIHNpbXVsYXRpb24pLlxuICpcbiAqIEBwYXJhbSByZXBvXG4gKiBAcGFyYW0gbWluaWZ5T3B0aW9ucyAtIHNlZSBtaW5pZnkuanNcbiAqIEBwYXJhbSBhbGxIVE1MIC0gSWYgdGhlIF9hbGwuaHRtbCBmaWxlIHNob3VsZCBiZSBnZW5lcmF0ZWRcbiAqIEBwYXJhbSBicmFuZFxuICogQHBhcmFtIGxvY2FsZXNPcHRpb24gLSBlLmcsLiAnKicsICdlbixlcycsIGV0Yy5cbiAqIEBwYXJhbSBlbmNvZGVTdHJpbmdNYXBcbiAqIEBwYXJhbSBjb21wcmVzc1NjcmlwdHNcbiAqIEBwYXJhbSBwcm9maWxlRmlsZVNpemVcbiAqIEBwYXJhbSB0eXBlQ2hlY2tcbiAqL1xuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24oIHJlcG86IHN0cmluZywgbWluaWZ5T3B0aW9uczogTWluaWZ5T3B0aW9ucywgYWxsSFRNTDogYm9vbGVhbiwgYnJhbmQ6IHN0cmluZywgbG9jYWxlc09wdGlvbjogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kZVN0cmluZ01hcDogYm9vbGVhbiwgY29tcHJlc3NTY3JpcHRzOiBib29sZWFuLCBwcm9maWxlRmlsZVNpemU6IGJvb2xlYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZUNoZWNrOiBib29sZWFuICk6IFByb21pc2U8dm9pZD4ge1xuXG4gIGlmICggYnJhbmQgPT09ICdwaGV0LWlvJyApIHtcbiAgICBhZmZpcm0oIGdydW50LmZpbGUuZXhpc3RzKCAnLi4vcGhldC1pbycgKSwgJ0Fib3J0aW5nIHRoZSBidWlsZCBvZiBwaGV0LWlvIGJyYW5kIHNpbmNlIHByb3ByaWV0YXJ5IHJlcG9zaXRvcmllcyBhcmUgbm90IGNoZWNrZWQgb3V0LlxcblBsZWFzZSB1c2UgLS1icmFuZHM9PXt7QlJBTkR9fSBpbiB0aGUgZnV0dXJlIHRvIGF2b2lkIHRoaXMuJyApO1xuICB9XG5cbiAgY29uc3QgcGFja2FnZU9iamVjdCA9IEpTT04ucGFyc2UoIHJlYWRGaWxlU3luYyggYC4uLyR7cmVwb30vcGFja2FnZS5qc29uYCwgJ3V0ZjgnICkgKTtcbiAgY29uc3QgZW5jb2RlciA9IG5ldyBub2RlSHRtbEVuY29kZXIuRW5jb2RlciggJ2VudGl0eScgKTtcblxuICAvLyBBbGwgaHRtbCBmaWxlcyBzaGFyZSB0aGUgc2FtZSBidWlsZCB0aW1lc3RhbXBcbiAgbGV0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zcGxpdCggJ1QnICkuam9pbiggJyAnICk7XG4gIHRpbWVzdGFtcCA9IGAke3RpbWVzdGFtcC5zdWJzdHJpbmcoIDAsIHRpbWVzdGFtcC5pbmRleE9mKCAnLicgKSApfSBVVENgO1xuXG4gIC8vIFN0YXJ0IHJ1bm5pbmcgd2VicGFja1xuICBjb25zdCB3ZWJwYWNrUmVzdWx0ID0gYXdhaXQgcmVjb3JkVGltZSggJ3dlYnBhY2snLCBhc3luYyAoKSA9PiB3ZWJwYWNrQnVpbGQoIHJlcG8sIGJyYW5kLCB7XG4gICAgcHJvZmlsZUZpbGVTaXplOiBwcm9maWxlRmlsZVNpemVcbiAgfSApLCB0aW1lID0+IHtcbiAgICBncnVudC5sb2cub2soIGBXZWJwYWNrIGJ1aWxkIGNvbXBsZXRlOiAke3RpbWV9bXNgICk7XG4gIH0gKTtcblxuICAvLyBOT1RFOiBUaGlzIGJ1aWxkIGN1cnJlbnRseSAoZHVlIHRvIHRoZSBzdHJpbmcvbWlwbWFwIHBsdWdpbnMpIG1vZGlmaWVzIGdsb2JhbHMuIFNvbWUgb3BlcmF0aW9ucyBuZWVkIHRvIGJlIGRvbmUgYWZ0ZXIgdGhpcy5cbiAgY29uc3Qgd2VicGFja0pTID0gd3JhcFByb2ZpbGVGaWxlU2l6ZSggYHBoZXQuY2hpcHBlci5ydW5XZWJwYWNrID0gZnVuY3Rpb24oKSB7JHt3ZWJwYWNrUmVzdWx0LmpzfX07YCwgcHJvZmlsZUZpbGVTaXplLCAnV0VCUEFDSycgKTtcblxuICAvLyBEZWJ1ZyB2ZXJzaW9uIGlzIGluZGVwZW5kZW50IG9mIHBhc3NlZCBpbiBtaW5pZnlPcHRpb25zLiAgUGhFVC1pTyBicmFuZCBpcyBtaW5pZmllZCwgYnV0IGxlYXZlcyBhc3NlcnRpb25zICYgbG9nZ2luZy5cbiAgY29uc3QgZGVidWdNaW5pZnlPcHRpb25zID0gYnJhbmQgPT09ICdwaGV0LWlvJyA/IHtcbiAgICBzdHJpcEFzc2VydGlvbnM6IGZhbHNlLFxuICAgIHN0cmlwTG9nZ2luZzogZmFsc2VcbiAgfSA6IHtcbiAgICBtaW5pZnk6IGZhbHNlXG4gIH07XG5cbiAgLy8gSWYgdHVybmluZyBvZmYgbWluaWZpY2F0aW9uIGZvciB0aGUgbWFpbiBidWlsZCwgZG9uJ3QgbWluaWZ5IHRoZSBkZWJ1ZyB2ZXJzaW9uIGFsc29cbiAgaWYgKCAhbWluaWZ5T3B0aW9ucy5taW5pZnkgKSB7XG4gICAgZGVidWdNaW5pZnlPcHRpb25zLm1pbmlmeSA9IGZhbHNlO1xuICB9XG5cbiAgY29uc3QgdXNlZE1vZHVsZXMgPSB3ZWJwYWNrUmVzdWx0LnVzZWRNb2R1bGVzO1xuICByZXBvcnRVbnVzZWRNZWRpYSggcmVwbywgdXNlZE1vZHVsZXMgKTtcblxuICAvLyBUT0RPOiBNb3JlIHNwZWNpZmljIG9iamVjdCB0eXBlLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzE1MzhcbiAgY29uc3QgbGljZW5zZUVudHJpZXM6IExpY2Vuc2VFbnRyaWVzID0ge307XG4gIENoaXBwZXJDb25zdGFudHMuTUVESUFfVFlQRVMuZm9yRWFjaCggbWVkaWFUeXBlID0+IHtcbiAgICBsaWNlbnNlRW50cmllc1sgbWVkaWFUeXBlIF0gPSB7fTtcbiAgfSApO1xuXG4gIHVzZWRNb2R1bGVzLmZvckVhY2goIG1vZHVsZSA9PiB7XG4gICAgQ2hpcHBlckNvbnN0YW50cy5NRURJQV9UWVBFUy5mb3JFYWNoKCBtZWRpYVR5cGUgPT4ge1xuICAgICAgaWYgKCBtb2R1bGUuc3BsaXQoICcvJyApWyAxIF0gPT09IG1lZGlhVHlwZSApIHtcblxuICAgICAgICAvLyBUaGUgZmlsZSBzdWZmaXggaXMgc3RyaXBwZWQgYW5kIHJlc3RvcmVkIHRvIGl0cyBub24tanMgZXh0ZW5zaW9uLiBUaGlzIGlzIGJlY2F1c2UgZ2V0TGljZW5zZUVudHJ5IGRvZXNuJ3RcbiAgICAgICAgLy8gaGFuZGxlIG1vZHVsaWZpZWQgbWVkaWEgZmlsZXMuXG4gICAgICAgIGNvbnN0IGluZGV4ID0gbW9kdWxlLmxhc3RJbmRleE9mKCAnXycgKTtcbiAgICAgICAgY29uc3QgcGF0aCA9IGAke21vZHVsZS5zbGljZSggMCwgaW5kZXggKX0uJHttb2R1bGUuc2xpY2UoIGluZGV4ICsgMSwgLTMgKX1gO1xuXG4gICAgICAgIC8vIFRPRE86IE1vcmUgc3BlY2lmaWMgb2JqZWN0IHR5cGUsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvMTUzOFxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xNTM4XG4gICAgICAgIGxpY2Vuc2VFbnRyaWVzWyBtZWRpYVR5cGUgXVsgbW9kdWxlIF0gPSBnZXRMaWNlbnNlRW50cnkoIGAuLi8ke3BhdGh9YCApO1xuICAgICAgfVxuICAgIH0gKTtcbiAgfSApO1xuXG4gIGNvbnN0IHBoZXRMaWJzID0gZ2V0UGhldExpYnMoIHJlcG8sIGJyYW5kICk7XG4gIGNvbnN0IGFsbExvY2FsZXMgPSBbIENoaXBwZXJDb25zdGFudHMuRkFMTEJBQ0tfTE9DQUxFLCAuLi5nZXRMb2NhbGVzRnJvbVJlcG9zaXRvcnkoIHJlcG8gKSBdO1xuICBjb25zdCBsb2NhbGVzID0gbG9jYWxlc09wdGlvbiA9PT0gJyonID8gYWxsTG9jYWxlcyA6IGxvY2FsZXNPcHRpb24uc3BsaXQoICcsJyApO1xuICBjb25zdCBkZXBlbmRlbmNpZXMgPSBhd2FpdCBnZXREZXBlbmRlbmNpZXMoIHJlcG8gKTtcbiAgY29uc3QgZGVwZW5kZW5jeVJlcHMgPSBPYmplY3Qua2V5cyggZGVwZW5kZW5jaWVzICk7XG5cbiAgLy8gb24gV2luZG93cywgcGF0aHMgYXJlIHJlcG9ydGVkIHdpdGggYSBiYWNrc2xhc2gsIG5vcm1hbGl6ZSB0byBmb3J3YXJkIHNsYXNoZXMgc28gdGhpcyB3b3JrcyBldmVyeXdoZXJlXG5cbiAgdXNlZE1vZHVsZXMubWFwKCBtb2R1bGUgPT4gbW9kdWxlLnNwbGl0KCAnXFxcXCcgKS5qb2luKCAnLycgKSApLmZvckVhY2goIG1vZHVsZURlcGVuZGVuY3kgPT4ge1xuXG4gICAgLy8gVGhlIGZpcnN0IHBhcnQgb2YgdGhlIHBhdGggaXMgdGhlIHJlcG8uICBPciBpZiBubyBkaXJlY3RvcnkgaXMgc3BlY2lmaWVkLCB0aGUgZmlsZSBpcyBpbiB0aGUgc2ltIHJlcG8uXG4gICAgY29uc3QgcGF0aFNlcGFyYXRvckluZGV4ID0gbW9kdWxlRGVwZW5kZW5jeS5pbmRleE9mKCAnLycgKTtcbiAgICBjb25zdCBtb2R1bGVSZXBvID0gcGF0aFNlcGFyYXRvckluZGV4ID49IDAgPyBtb2R1bGVEZXBlbmRlbmN5LnNsaWNlKCAwLCBwYXRoU2VwYXJhdG9ySW5kZXggKSA6XG4gICAgICAgICAgICAgICAgICAgICAgIHJlcG87XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZGVwZW5kZW5jeVJlcHMuaW5jbHVkZXMoIG1vZHVsZVJlcG8gKSwgYHJlcG8gJHttb2R1bGVSZXBvfSBtaXNzaW5nIGZyb20gcGFja2FnZS5qc29uJ3MgcGhldExpYnMgZm9yICR7bW9kdWxlRGVwZW5kZW5jeX1gICk7XG5cbiAgICAvLyBBbHNvIGNoZWNrIGlmIHRoZSBtb2R1bGUgd2FzIGNvbWluZyBmcm9tIGNoaXBwZXIgZGlzdFxuICAgIGlmICggbW9kdWxlRGVwZW5kZW5jeS5pbmNsdWRlcyggJ2NoaXBwZXIvZGlzdC9qcy8nICkgKSB7XG4gICAgICBjb25zdCBkaXN0UmVwbyA9IG1vZHVsZURlcGVuZGVuY3kuc3BsaXQoICdjaGlwcGVyL2Rpc3QvanMvJyApWyAxIF0/LnNwbGl0KCAnLycgKVsgMCBdO1xuICAgICAgZGlzdFJlcG8gJiYgYXNzZXJ0ICYmIGFzc2VydCggZGVwZW5kZW5jeVJlcHMuaW5jbHVkZXMoIGRpc3RSZXBvICksIGByZXBvICR7ZGlzdFJlcG99IG1pc3NpbmcgZnJvbSBwYWNrYWdlLmpzb24ncyBwaGV0TGlicyBmb3IgJHttb2R1bGVEZXBlbmRlbmN5fWAgKTtcbiAgICB9XG4gIH0gKTtcblxuICBjb25zdCB2ZXJzaW9uID0gcGFja2FnZU9iamVjdC52ZXJzaW9uOyAvLyBJbmNsdWRlIHRoZSBvbmUtb2ZmIG5hbWUgaW4gdGhlIHZlcnNpb25cbiAgY29uc3QgdGhpcmRQYXJ0eUVudHJpZXMgPSBnZXRBbGxUaGlyZFBhcnR5RW50cmllcyggcmVwbywgYnJhbmQsIGxpY2Vuc2VFbnRyaWVzICk7XG4gIGNvbnN0IHNpbVRpdGxlU3RyaW5nS2V5ID0gZ2V0VGl0bGVTdHJpbmdLZXkoIHJlcG8gKTtcblxuICBjb25zdCB7IHN0cmluZ01hcCwgc3RyaW5nTWV0YWRhdGEgfSA9IGdldFN0cmluZ01hcCggcmVwbywgYWxsTG9jYWxlcywgcGhldExpYnMsIHdlYnBhY2tSZXN1bHQudXNlZE1vZHVsZXMgKTtcblxuICAvLyBBZnRlciBvdXIgc3RyaW5nIG1hcCBpcyBjb25zdHJ1Y3RlZCwgcmVwb3J0IHdoaWNoIG9mIHRoZSB0cmFuc2xhdGFibGUgc3RyaW5ncyBhcmUgdW51c2VkLlxuICByZXBvcnRVbnVzZWRTdHJpbmdzKCByZXBvLCBwYWNrYWdlT2JqZWN0LnBoZXQucmVxdWlyZWpzTmFtZXNwYWNlLCBzdHJpbmdNYXBbIENoaXBwZXJDb25zdGFudHMuRkFMTEJBQ0tfTE9DQUxFIF0gKTtcblxuICAvLyBJZiB3ZSBoYXZlIE5PIHN0cmluZ3MgZm9yIGEgZ2l2ZW4gbG9jYWxlIHRoYXQgd2Ugd2FudCwgd2UnbGwgbmVlZCB0byBmaWxsIGl0IGluIHdpdGggYWxsIEVuZ2xpc2ggc3RyaW5ncywgc2VlXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9wZXJlbm5pYWwvaXNzdWVzLzgzXG4gIGZvciAoIGNvbnN0IGxvY2FsZSBvZiBsb2NhbGVzICkge1xuICAgIGlmICggIXN0cmluZ01hcFsgbG9jYWxlIF0gKSB7XG4gICAgICBzdHJpbmdNYXBbIGxvY2FsZSBdID0gc3RyaW5nTWFwWyBDaGlwcGVyQ29uc3RhbnRzLkZBTExCQUNLX0xPQ0FMRSBdO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGVuZ2xpc2hUaXRsZSA9IHN0cmluZ01hcFsgQ2hpcHBlckNvbnN0YW50cy5GQUxMQkFDS19MT0NBTEUgXVsgc2ltVGl0bGVTdHJpbmdLZXkgXTtcbiAgYXNzZXJ0ICYmIGFzc2VydCggZW5nbGlzaFRpdGxlLCBgbWlzc2luZyBlbnRyeSBmb3Igc2ltIHRpdGxlLCBrZXkgPSAke3NpbVRpdGxlU3RyaW5nS2V5fWAgKTtcblxuICAvLyBTZWxlY3QgdGhlIEhUTUwgY29tbWVudCBoZWFkZXIgYmFzZWQgb24gdGhlIGJyYW5kLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzE1NlxuICBsZXQgaHRtbEhlYWRlcjtcbiAgaWYgKCBicmFuZCA9PT0gJ3BoZXQtaW8nICkge1xuXG4gICAgLy8gTGljZW5zZSB0ZXh0IHByb3ZpZGVkIGJ5IEBrYXRoeS1waGV0IGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xNDgjaXNzdWVjb21tZW50LTExMjU4NDc3M1xuICAgIGh0bWxIZWFkZXIgPSBgJHtlbmdsaXNoVGl0bGV9ICR7dmVyc2lvbn1cXG5gICtcbiAgICAgICAgICAgICAgICAgYENvcHlyaWdodCAyMDAyLSR7Z3J1bnQudGVtcGxhdGUudG9kYXkoICd5eXl5JyApfSwgUmVnZW50cyBvZiB0aGUgVW5pdmVyc2l0eSBvZiBDb2xvcmFkb1xcbmAgK1xuICAgICAgICAgICAgICAgICAnUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXFxuJyArXG4gICAgICAgICAgICAgICAgICdcXG4nICtcbiAgICAgICAgICAgICAgICAgJ1RoaXMgSW50ZXJvcGVyYWJsZSBQaEVUIFNpbXVsYXRpb24gZmlsZSByZXF1aXJlcyBhIGxpY2Vuc2UuXFxuJyArXG4gICAgICAgICAgICAgICAgICdVU0UgV0lUSE9VVCBBIExJQ0VOU0UgQUdSRUVNRU5UIElTIFNUUklDVExZIFBST0hJQklURUQuXFxuJyArXG4gICAgICAgICAgICAgICAgICdDb250YWN0IHBoZXRoZWxwQGNvbG9yYWRvLmVkdSByZWdhcmRpbmcgbGljZW5zaW5nLlxcbicgK1xuICAgICAgICAgICAgICAgICAnaHR0cHM6Ly9waGV0LmNvbG9yYWRvLmVkdS9lbi9saWNlbnNpbmcnO1xuICB9XG4gIGVsc2Uge1xuICAgIGh0bWxIZWFkZXIgPSBgJHtlbmdsaXNoVGl0bGV9ICR7dmVyc2lvbn1cXG5gICtcbiAgICAgICAgICAgICAgICAgYENvcHlyaWdodCAyMDAyLSR7Z3J1bnQudGVtcGxhdGUudG9kYXkoICd5eXl5JyApfSwgUmVnZW50cyBvZiB0aGUgVW5pdmVyc2l0eSBvZiBDb2xvcmFkb1xcbmAgK1xuICAgICAgICAgICAgICAgICAnUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXFxuJyArXG4gICAgICAgICAgICAgICAgICdcXG4nICtcbiAgICAgICAgICAgICAgICAgJ1RoaXMgZmlsZSBpcyBsaWNlbnNlZCB1bmRlciBDcmVhdGl2ZSBDb21tb25zIEF0dHJpYnV0aW9uIDQuMFxcbicgK1xuICAgICAgICAgICAgICAgICAnRm9yIGFsdGVybmF0ZSBzb3VyY2UgY29kZSBsaWNlbnNpbmcsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXNcXG4nICtcbiAgICAgICAgICAgICAgICAgJ0ZvciBsaWNlbnNlcyBmb3IgdGhpcmQtcGFydHkgc29mdHdhcmUgdXNlZCBieSB0aGlzIHNpbXVsYXRpb24sIHNlZSBiZWxvd1xcbicgK1xuICAgICAgICAgICAgICAgICAnRm9yIG1vcmUgaW5mb3JtYXRpb24sIHNlZSBodHRwczovL3BoZXQuY29sb3JhZG8uZWR1L2VuL2xpY2Vuc2luZy9odG1sXFxuJyArXG4gICAgICAgICAgICAgICAgICdcXG4nICtcbiAgICAgICAgICAgICAgICAgJ1RoZSBQaEVUIG5hbWUgYW5kIFBoRVQgbG9nbyBhcmUgcmVnaXN0ZXJlZCB0cmFkZW1hcmtzIG9mIFRoZSBSZWdlbnRzIG9mIHRoZVxcbicgK1xuICAgICAgICAgICAgICAgICAnVW5pdmVyc2l0eSBvZiBDb2xvcmFkby4gUGVybWlzc2lvbiBpcyBncmFudGVkIHRvIHVzZSB0aGUgUGhFVCBuYW1lIGFuZCBQaEVUIGxvZ29cXG4nICtcbiAgICAgICAgICAgICAgICAgJ29ubHkgZm9yIGF0dHJpYnV0aW9uIHB1cnBvc2VzLiBVc2Ugb2YgdGhlIFBoRVQgbmFtZSBhbmQvb3IgUGhFVCBsb2dvIGZvciBwcm9tb3Rpb25hbCxcXG4nICtcbiAgICAgICAgICAgICAgICAgJ21hcmtldGluZywgb3IgYWR2ZXJ0aXNpbmcgcHVycG9zZXMgcmVxdWlyZXMgYSBzZXBhcmF0ZSBsaWNlbnNlIGFncmVlbWVudCBmcm9tIHRoZVxcbicgK1xuICAgICAgICAgICAgICAgICAnVW5pdmVyc2l0eSBvZiBDb2xvcmFkby4gQ29udGFjdCBwaGV0aGVscEBjb2xvcmFkby5lZHUgcmVnYXJkaW5nIGxpY2Vuc2luZy4nO1xuICB9XG5cbiAgLy8gU2NyaXB0cyB0aGF0IGFyZSBydW4gYmVmb3JlIG91ciBtYWluIG1pbmlmaWFibGUgY29udGVudFxuICBjb25zdCBzdGFydHVwU2NyaXB0cyA9IFtcbiAgICAvLyBTcGxhc2ggaW1hZ2VcbiAgICB3cmFwUHJvZmlsZUZpbGVTaXplKCBgd2luZG93LlBIRVRfU1BMQVNIX0RBVEFfVVJJPVwiJHtsb2FkRmlsZUFzRGF0YVVSSSggYC4uL2JyYW5kLyR7YnJhbmR9L2ltYWdlcy9zcGxhc2guc3ZnYCApfVwiO2AsIHByb2ZpbGVGaWxlU2l6ZSwgJ1NQTEFTSCcgKVxuICBdO1xuXG4gIGNvbnN0IG1pbmlmaWFibGVTY3JpcHRzID0gW1xuICAgIC8vIFByZWxvYWRzXG5cbiAgICAuLi5nZXRQcmVsb2FkcyggcmVwbywgYnJhbmQsIHRydWUgKS5tYXAoIGZpbGVuYW1lID0+IHdyYXBQcm9maWxlRmlsZVNpemUoIGdydW50LmZpbGUucmVhZCggZmlsZW5hbWUgKSwgcHJvZmlsZUZpbGVTaXplLCAnUFJFTE9BRCcsIGZpbGVuYW1lICkgKSxcblxuICAgIC8vIE91ciBtYWluIG1vZHVsZSBjb250ZW50LCB3cmFwcGVkIGluIGEgZnVuY3Rpb24gY2FsbGVkIGluIHRoZSBzdGFydHVwIGJlbG93XG4gICAgd2VicGFja0pTLFxuXG4gICAgLy8gTWFpbiBzdGFydHVwXG4gICAgd3JhcFByb2ZpbGVGaWxlU2l6ZSggZ3J1bnQuZmlsZS5yZWFkKCAnLi4vY2hpcHBlci90ZW1wbGF0ZXMvY2hpcHBlci1zdGFydHVwLmpzJyApLCBwcm9maWxlRmlsZVNpemUsICdTVEFSVFVQJyApXG4gIF07XG5cbiAgY29uc3QgcHJvZHVjdGlvblNjcmlwdHMgPSBhd2FpdCByZWNvcmRUaW1lKCAnbWluaWZ5LXByb2R1Y3Rpb24nLCBhc3luYyAoKSA9PiB7XG4gICAgcmV0dXJuIFtcbiAgICAgIC4uLnN0YXJ0dXBTY3JpcHRzLFxuICAgICAgLi4ubWluaWZpYWJsZVNjcmlwdHMubWFwKCBqcyA9PiBtaW5pZnkoIGpzLCBtaW5pZnlPcHRpb25zICkgKVxuICAgIF0gc2F0aXNmaWVzIHN0cmluZ1tdO1xuICB9LCAoIHRpbWUsIHNjcmlwdHMgKSA9PiB7XG5cbiAgICBncnVudC5sb2cub2soIGBQcm9kdWN0aW9uIG1pbmlmaWNhdGlvbiBjb21wbGV0ZTogJHt0aW1lfW1zICgke18uc3VtKCBzY3JpcHRzLm1hcCgganMgPT4ganMubGVuZ3RoICkgKX0gYnl0ZXMpYCApO1xuICB9ICk7XG4gIGNvbnN0IGRlYnVnU2NyaXB0cyA9IGF3YWl0IHJlY29yZFRpbWUoICdtaW5pZnktZGVidWcnLCBhc3luYyAoKSA9PiB7XG4gICAgcmV0dXJuIFtcbiAgICAgIC4uLnN0YXJ0dXBTY3JpcHRzLFxuICAgICAgLi4ubWluaWZpYWJsZVNjcmlwdHMubWFwKCBqcyA9PiBtaW5pZnkoIGpzLCBkZWJ1Z01pbmlmeU9wdGlvbnMgKSApXG4gICAgXTtcbiAgfSwgKCB0aW1lLCBzY3JpcHRzICkgPT4ge1xuXG4gICAgZ3J1bnQubG9nLm9rKCBgRGVidWcgbWluaWZpY2F0aW9uIGNvbXBsZXRlOiAke3RpbWV9bXMgKCR7Xy5zdW0oIHNjcmlwdHMubWFwKCBqcyA9PiBqcy5sZW5ndGggKSApfSBieXRlcylgICk7XG4gIH0gKTtcblxuICBjb25zdCBsaWNlbnNlU2NyaXB0ID0gd3JhcFByb2ZpbGVGaWxlU2l6ZSggQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VQbGFjZWhvbGRlcnMoIGdydW50LmZpbGUucmVhZCggJy4uL2NoaXBwZXIvdGVtcGxhdGVzL2xpY2Vuc2UtaW5pdGlhbGl6YXRpb24uanMnICksIHtcbiAgICBQSEVUX1NUQVJUX1RISVJEX1BBUlRZX0xJQ0VOU0VfRU5UUklFUzogQ2hpcHBlckNvbnN0YW50cy5TVEFSVF9USElSRF9QQVJUWV9MSUNFTlNFX0VOVFJJRVMsXG4gICAgUEhFVF9USElSRF9QQVJUWV9MSUNFTlNFX0VOVFJJRVM6IEpTT04uc3RyaW5naWZ5KCB0aGlyZFBhcnR5RW50cmllcywgbnVsbCwgMiApLFxuICAgIFBIRVRfRU5EX1RISVJEX1BBUlRZX0xJQ0VOU0VfRU5UUklFUzogQ2hpcHBlckNvbnN0YW50cy5FTkRfVEhJUkRfUEFSVFlfTElDRU5TRV9FTlRSSUVTXG4gIH0gKSwgcHJvZmlsZUZpbGVTaXplLCAnTElDRU5TRScgKTtcblxuICBjb25zdCBjb21tb25Jbml0aWFsaXphdGlvbk9wdGlvbnMgPSB7XG4gICAgYnJhbmQ6IGJyYW5kLFxuICAgIHJlcG86IHJlcG8sXG4gICAgbG9jYWxlRGF0YTogZ2V0UHJ1bmVkTG9jYWxlRGF0YSggYWxsTG9jYWxlcyApLFxuICAgIHN0cmluZ01hcDogc3RyaW5nTWFwLFxuICAgIHN0cmluZ01ldGFkYXRhOiBzdHJpbmdNZXRhZGF0YSxcbiAgICBkZXBlbmRlbmNpZXM6IGRlcGVuZGVuY2llcyxcbiAgICB0aW1lc3RhbXA6IHRpbWVzdGFtcCxcbiAgICB2ZXJzaW9uOiB2ZXJzaW9uLFxuICAgIHBhY2thZ2VPYmplY3Q6IHBhY2thZ2VPYmplY3QsXG4gICAgYWxsb3dMb2NhbGVTd2l0Y2hpbmc6IGZhbHNlLFxuICAgIGVuY29kZVN0cmluZ01hcDogZW5jb2RlU3RyaW5nTWFwLFxuICAgIHByb2ZpbGVGaWxlU2l6ZTogcHJvZmlsZUZpbGVTaXplLFxuICAgIHdyYXBTdHJpbmdzSlM6ICggc3RyaW5nc0pTOiBzdHJpbmcgKSA9PiB3cmFwUHJvZmlsZUZpbGVTaXplKCBzdHJpbmdzSlMsIHByb2ZpbGVGaWxlU2l6ZSwgJ1NUUklOR1MnIClcbiAgfTtcblxuICAvLyBDcmVhdGUgdGhlIGJ1aWxkLXNwZWNpZmljIGRpcmVjdG9yeVxuICBjb25zdCBidWlsZERpciA9IGAuLi8ke3JlcG99L2J1aWxkLyR7YnJhbmR9YDtcbiAgZnMubWtkaXJTeW5jKCBidWlsZERpciwgeyByZWN1cnNpdmU6IHRydWUgfSApO1xuXG4gIC8vIHt7bG9jYWxlfX0uaHRtbFxuICBpZiAoIGJyYW5kICE9PSAncGhldC1pbycgKSB7XG4gICAgZm9yICggY29uc3QgbG9jYWxlIG9mIGxvY2FsZXMgKSB7XG4gICAgICBjb25zdCBpbml0aWFsaXphdGlvblNjcmlwdCA9IGdldEluaXRpYWxpemF0aW9uU2NyaXB0KCBfLmFzc2lnbkluKCB7XG4gICAgICAgIGxvY2FsZTogbG9jYWxlLFxuICAgICAgICBpbmNsdWRlQWxsTG9jYWxlczogZmFsc2UsXG4gICAgICAgIGlzRGVidWdCdWlsZDogZmFsc2VcbiAgICAgIH0sIGNvbW1vbkluaXRpYWxpemF0aW9uT3B0aW9ucyApICk7XG5cbiAgICAgIGdydW50LmZpbGUud3JpdGUoIGAke2J1aWxkRGlyfS8ke3JlcG99XyR7bG9jYWxlfV8ke2JyYW5kfS5odG1sYCwgcGFja2FnZVJ1bm5hYmxlKCB7XG4gICAgICAgIHJlcG86IHJlcG8sXG4gICAgICAgIHN0cmluZ01hcDogc3RyaW5nTWFwLFxuICAgICAgICBodG1sSGVhZGVyOiBodG1sSGVhZGVyLFxuICAgICAgICBsb2NhbGU6IGxvY2FsZSxcbiAgICAgICAgY29tcHJlc3NTY3JpcHRzOiBjb21wcmVzc1NjcmlwdHMsXG4gICAgICAgIGxpY2Vuc2VTY3JpcHQ6IGxpY2Vuc2VTY3JpcHQsXG4gICAgICAgIHNjcmlwdHM6IFsgaW5pdGlhbGl6YXRpb25TY3JpcHQsIC4uLnByb2R1Y3Rpb25TY3JpcHRzIF1cbiAgICAgIH0gKSApO1xuICAgIH1cbiAgfVxuXG4gIC8vIF9hbGwuaHRtbCAoZm9yY2VkIGZvciBwaGV0LWlvKVxuICBpZiAoIGFsbEhUTUwgfHwgYnJhbmQgPT09ICdwaGV0LWlvJyApIHtcbiAgICBjb25zdCBpbml0aWFsaXphdGlvblNjcmlwdCA9IGdldEluaXRpYWxpemF0aW9uU2NyaXB0KCBfLmFzc2lnbkluKCB7XG4gICAgICBsb2NhbGU6IENoaXBwZXJDb25zdGFudHMuRkFMTEJBQ0tfTE9DQUxFLFxuICAgICAgaW5jbHVkZUFsbExvY2FsZXM6IHRydWUsXG4gICAgICBpc0RlYnVnQnVpbGQ6IGZhbHNlXG4gICAgfSwgY29tbW9uSW5pdGlhbGl6YXRpb25PcHRpb25zLCB7XG4gICAgICBhbGxvd0xvY2FsZVN3aXRjaGluZzogdHJ1ZVxuICAgIH0gKSApO1xuXG4gICAgY29uc3QgYWxsSFRNTEZpbGVuYW1lID0gYCR7YnVpbGREaXJ9LyR7cmVwb31fYWxsXyR7YnJhbmR9Lmh0bWxgO1xuICAgIGNvbnN0IGFsbEhUTUxDb250ZW50cyA9IHBhY2thZ2VSdW5uYWJsZSgge1xuICAgICAgcmVwbzogcmVwbyxcbiAgICAgIHN0cmluZ01hcDogc3RyaW5nTWFwLFxuICAgICAgaHRtbEhlYWRlcjogaHRtbEhlYWRlcixcbiAgICAgIGxvY2FsZTogQ2hpcHBlckNvbnN0YW50cy5GQUxMQkFDS19MT0NBTEUsXG4gICAgICBjb21wcmVzc1NjcmlwdHM6IGNvbXByZXNzU2NyaXB0cyxcbiAgICAgIGxpY2Vuc2VTY3JpcHQ6IGxpY2Vuc2VTY3JpcHQsXG4gICAgICBzY3JpcHRzOiBbIGluaXRpYWxpemF0aW9uU2NyaXB0LCAuLi5wcm9kdWN0aW9uU2NyaXB0cyBdXG4gICAgfSApO1xuXG4gICAgZ3J1bnQuZmlsZS53cml0ZSggYWxsSFRNTEZpbGVuYW1lLCBhbGxIVE1MQ29udGVudHMgKTtcblxuICAgIC8vIEFkZCBhIGNvbXByZXNzZWQgZmlsZSB0byBpbXByb3ZlIHBlcmZvcm1hbmNlIGluIHRoZSBpT1MgYXBwLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzc0NlxuICAgIGdydW50LmZpbGUud3JpdGUoIGAke2FsbEhUTUxGaWxlbmFtZX0uZ3pgLCB6bGliLmd6aXBTeW5jKCBhbGxIVE1MQ29udGVudHMgKSApO1xuICB9XG5cbiAgLy8gRGVidWcgYnVpbGQgKGFsd2F5cyBpbmNsdWRlZClcbiAgY29uc3QgZGVidWdJbml0aWFsaXphdGlvblNjcmlwdCA9IGdldEluaXRpYWxpemF0aW9uU2NyaXB0KCBfLmFzc2lnbkluKCB7XG4gICAgbG9jYWxlOiBDaGlwcGVyQ29uc3RhbnRzLkZBTExCQUNLX0xPQ0FMRSxcbiAgICBpbmNsdWRlQWxsTG9jYWxlczogdHJ1ZSxcbiAgICBpc0RlYnVnQnVpbGQ6IHRydWVcbiAgfSwgY29tbW9uSW5pdGlhbGl6YXRpb25PcHRpb25zLCB7XG4gICAgYWxsb3dMb2NhbGVTd2l0Y2hpbmc6IHRydWVcbiAgfSApICk7XG5cbiAgZ3J1bnQuZmlsZS53cml0ZSggYCR7YnVpbGREaXJ9LyR7cmVwb31fYWxsXyR7YnJhbmR9X2RlYnVnLmh0bWxgLCBwYWNrYWdlUnVubmFibGUoIHtcbiAgICByZXBvOiByZXBvLFxuICAgIHN0cmluZ01hcDogc3RyaW5nTWFwLFxuICAgIGh0bWxIZWFkZXI6IGh0bWxIZWFkZXIsXG4gICAgbG9jYWxlOiBDaGlwcGVyQ29uc3RhbnRzLkZBTExCQUNLX0xPQ0FMRSxcbiAgICBjb21wcmVzc1NjcmlwdHM6IGNvbXByZXNzU2NyaXB0cyxcbiAgICBsaWNlbnNlU2NyaXB0OiBsaWNlbnNlU2NyaXB0LFxuICAgIHNjcmlwdHM6IFsgZGVidWdJbml0aWFsaXphdGlvblNjcmlwdCwgLi4uZGVidWdTY3JpcHRzIF1cbiAgfSApICk7XG5cbiAgLy8gWEhUTUwgYnVpbGQgKGVQdWIgY29tcGF0aWJpbGl0eSwgZXRjLilcbiAgY29uc3QgeGh0bWxEaXIgPSBgJHtidWlsZERpcn0veGh0bWxgO1xuICBmcy5ta2RpclN5bmMoIHhodG1sRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9ICk7XG5cbiAgY29uc3QgeGh0bWxJbml0aWFsaXphdGlvblNjcmlwdCA9IGdldEluaXRpYWxpemF0aW9uU2NyaXB0KCBfLmFzc2lnbkluKCB7XG4gICAgbG9jYWxlOiBDaGlwcGVyQ29uc3RhbnRzLkZBTExCQUNLX0xPQ0FMRSxcbiAgICBpbmNsdWRlQWxsTG9jYWxlczogdHJ1ZSxcbiAgICBpc0RlYnVnQnVpbGQ6IGZhbHNlXG4gIH0sIGNvbW1vbkluaXRpYWxpemF0aW9uT3B0aW9ucywge1xuICAgIGFsbG93TG9jYWxlU3dpdGNoaW5nOiB0cnVlXG4gIH0gKSApO1xuXG4gIHBhY2thZ2VYSFRNTCggeGh0bWxEaXIsIHtcbiAgICByZXBvOiByZXBvLFxuICAgIGJyYW5kOiBicmFuZCxcbiAgICBzdHJpbmdNYXA6IHN0cmluZ01hcCxcbiAgICBodG1sSGVhZGVyOiBodG1sSGVhZGVyLFxuICAgIGluaXRpYWxpemF0aW9uU2NyaXB0OiB4aHRtbEluaXRpYWxpemF0aW9uU2NyaXB0LFxuICAgIGxpY2Vuc2VTY3JpcHQ6IGxpY2Vuc2VTY3JpcHQsXG4gICAgc2NyaXB0czogcHJvZHVjdGlvblNjcmlwdHNcbiAgfSApO1xuXG4gIC8vIGRlcGVuZGVuY2llcy5qc29uXG4gIGdydW50LmZpbGUud3JpdGUoIGAke2J1aWxkRGlyfS9kZXBlbmRlbmNpZXMuanNvbmAsIEpTT04uc3RyaW5naWZ5KCBkZXBlbmRlbmNpZXMsIG51bGwsIDIgKSApO1xuXG4gIC8vIHN0cmluZy1tYXAuanNvbiBhbmQgZW5nbGlzaC1zdHJpbmctbWFwLmpzb24sIGZvciB0aGluZ3MgbGlrZSBSb3NldHRhIHRoYXQgbmVlZCB0byBrbm93IHdoYXQgc3RyaW5ncyBhcmUgdXNlZFxuICBncnVudC5maWxlLndyaXRlKCBgJHtidWlsZERpcn0vc3RyaW5nLW1hcC5qc29uYCwgSlNPTi5zdHJpbmdpZnkoIHN0cmluZ01hcCwgbnVsbCwgMiApICk7XG4gIGdydW50LmZpbGUud3JpdGUoIGAke2J1aWxkRGlyfS9lbmdsaXNoLXN0cmluZy1tYXAuanNvbmAsIEpTT04uc3RyaW5naWZ5KCBzdHJpbmdNYXAuZW4sIG51bGwsIDIgKSApO1xuXG4gIC8vIC1pZnJhbWUuaHRtbCAoRW5nbGlzaCBpcyBhc3N1bWVkIGFzIHRoZSBsb2NhbGUpLlxuICBpZiAoIF8uaW5jbHVkZXMoIGxvY2FsZXMsIENoaXBwZXJDb25zdGFudHMuRkFMTEJBQ0tfTE9DQUxFICkgJiYgYnJhbmQgPT09ICdwaGV0JyApIHtcbiAgICBjb25zdCBlbmdsaXNoVGl0bGUgPSBzdHJpbmdNYXBbIENoaXBwZXJDb25zdGFudHMuRkFMTEJBQ0tfTE9DQUxFIF1bIGdldFRpdGxlU3RyaW5nS2V5KCByZXBvICkgXTtcblxuICAgIGdydW50LmxvZy52ZXJib3NlLndyaXRlbG4oICdDb25zdHJ1Y3RpbmcgSFRNTCBmb3IgaWZyYW1lIHRlc3RpbmcgZnJvbSB0ZW1wbGF0ZScgKTtcbiAgICBsZXQgaWZyYW1lVGVzdEh0bWwgPSBncnVudC5maWxlLnJlYWQoICcuLi9jaGlwcGVyL3RlbXBsYXRlcy9zaW0taWZyYW1lLmh0bWwnICk7XG4gICAgaWZyYW1lVGVzdEh0bWwgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUZpcnN0KCBpZnJhbWVUZXN0SHRtbCwgJ3t7UEhFVF9TSU1fVElUTEV9fScsIGVuY29kZXIuaHRtbEVuY29kZSggYCR7ZW5nbGlzaFRpdGxlfSBpZnJhbWUgdGVzdGAgKSApO1xuICAgIGlmcmFtZVRlc3RIdG1sID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VGaXJzdCggaWZyYW1lVGVzdEh0bWwsICd7e1BIRVRfUkVQT1NJVE9SWX19JywgcmVwbyApO1xuXG4gICAgY29uc3QgaWZyYW1lTG9jYWxlcyA9IFsgJ2VuJyBdLmNvbmNhdCggYWxsSFRNTCA/IFsgJ2FsbCcgXSA6IFtdICk7XG4gICAgaWZyYW1lTG9jYWxlcy5mb3JFYWNoKCBsb2NhbGUgPT4ge1xuICAgICAgY29uc3QgaWZyYW1lSHRtbCA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlRmlyc3QoIGlmcmFtZVRlc3RIdG1sLCAne3tQSEVUX0xPQ0FMRX19JywgbG9jYWxlICk7XG4gICAgICBncnVudC5maWxlLndyaXRlKCBgJHtidWlsZERpcn0vJHtyZXBvfV8ke2xvY2FsZX1faWZyYW1lX3BoZXQuaHRtbGAsIGlmcmFtZUh0bWwgKTtcbiAgICB9ICk7XG4gIH1cblxuICAvLyBJZiB0aGUgc2ltIGlzIGExMXkgb3V0Zml0dGVkLCB0aGVuIGFkZCB0aGUgYTExeSBwZG9tIHZpZXdlciB0byB0aGUgYnVpbGQgZGlyLiBOT1RFOiBOb3QgZm9yIHBoZXQtaW8gYnVpbGRzLlxuICBpZiAoIHBhY2thZ2VPYmplY3QucGhldC5zaW1GZWF0dXJlcyAmJiBwYWNrYWdlT2JqZWN0LnBoZXQuc2ltRmVhdHVyZXMuc3VwcG9ydHNJbnRlcmFjdGl2ZURlc2NyaXB0aW9uICYmIGJyYW5kID09PSAncGhldCcgKSB7XG4gICAgLy8gKGExMXkpIENyZWF0ZSB0aGUgYTExeS12aWV3IEhUTUwgZmlsZSBmb3IgUERPTSB2aWV3aW5nLlxuICAgIGxldCBhMTF5SFRNTCA9IGdldEExMXlWaWV3SFRNTEZyb21UZW1wbGF0ZSggcmVwbyApO1xuXG4gICAgLy8gdGhpcyByZXBsYWNlQWxsIGlzIG91dHNpZGUgb2YgdGhlIGdldEExMXlWaWV3SFRNTEZyb21UZW1wbGF0ZSBiZWNhdXNlIHdlIG9ubHkgd2FudCBpdCBmaWxsZWQgaW4gZHVyaW5nIHRoZSBidWlsZFxuICAgIGExMXlIVE1MID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGExMXlIVE1MLCAne3tJU19CVUlMVH19JywgJ3RydWUnICk7XG5cbiAgICBncnVudC5maWxlLndyaXRlKCBgJHtidWlsZERpcn0vJHtyZXBvfSR7Q2hpcHBlckNvbnN0YW50cy5BMTFZX1ZJRVdfSFRNTF9TVUZGSVh9YCwgYTExeUhUTUwgKTtcbiAgfVxuXG4gIC8vIGNvcHkgb3ZlciBzdXBwbGVtZW50YWwgZmlsZXMgb3IgZGlycyB0byBwYWNrYWdlIHdpdGggdGhlIGJ1aWxkLiBPbmx5IHN1cHBvcnRlZCBpbiBwaGV0IGJyYW5kXG4gIGlmICggcGFja2FnZU9iamVjdC5waGV0ICYmIHBhY2thZ2VPYmplY3QucGhldC5wYWNrYWdlV2l0aEJ1aWxkICkge1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggcGFja2FnZU9iamVjdC5waGV0LnBhY2thZ2VXaXRoQnVpbGQgKSApO1xuXG4gICAgcGFja2FnZU9iamVjdC5waGV0LnBhY2thZ2VXaXRoQnVpbGQuZm9yRWFjaCggKCBwYXRoOiBzdHJpbmcgKSA9PiB7XG5cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwaGV0L25vLXNpbXBsZS10eXBlLWNoZWNraW5nLWFzc2VydGlvbnNcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJywgJ3BhdGggc2hvdWxkIGJlIGEgc3RyaW5nJyApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZ3J1bnQuZmlsZS5leGlzdHMoIHBhdGggKSwgYHBhdGggZG9lcyBub3QgZXhpc3Q6ICR7cGF0aH1gICk7XG4gICAgICBpZiAoIGdydW50LmZpbGUuaXNEaXIoIHBhdGggKSApIHtcbiAgICAgICAgY29weURpcmVjdG9yeSggcGF0aCwgYCR7YnVpbGREaXJ9LyR7cGF0aH1gICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZ3J1bnQuZmlsZS5jb3B5KCBwYXRoLCBgJHtidWlsZERpcn0vJHtwYXRofWAgKTtcbiAgICAgIH1cbiAgICB9ICk7XG4gIH1cblxuICBpZiAoIGJyYW5kID09PSAncGhldC1pbycgKSB7XG4gICAgYXdhaXQgY29weVN1cHBsZW1lbnRhbFBoZXRpb0ZpbGVzKCByZXBvLCB2ZXJzaW9uLCBlbmdsaXNoVGl0bGUsIHBhY2thZ2VPYmplY3QsIHRydWUsIHR5cGVDaGVjayApO1xuICB9XG5cbiAgLy8gVGh1bWJuYWlscyBhbmQgdHdpdHRlciBjYXJkXG4gIGlmICggZ3J1bnQuZmlsZS5leGlzdHMoIGAuLi8ke3JlcG99L2Fzc2V0cy8ke3JlcG99LXNjcmVlbnNob3QucG5nYCApICkge1xuICAgIGNvbnN0IHRodW1ibmFpbFNpemVzID0gW1xuICAgICAgeyB3aWR0aDogMTI4LCBoZWlnaHQ6IDg0IH0sXG4gICAgICB7IHdpZHRoOiA2MDAsIGhlaWdodDogMzk0IH1cbiAgICBdO1xuICAgIGZvciAoIGNvbnN0IHNpemUgb2YgdGh1bWJuYWlsU2l6ZXMgKSB7XG4gICAgICBncnVudC5maWxlLndyaXRlKCBgJHtidWlsZERpcn0vJHtyZXBvfS0ke3NpemUud2lkdGh9LnBuZ2AsIGF3YWl0IGdlbmVyYXRlVGh1bWJuYWlscyggcmVwbywgc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQsIDEwMCwgamltcC5NSU1FX1BORyApICk7XG4gICAgfVxuXG4gICAgaWYgKCBicmFuZCA9PT0gJ3BoZXQnICkge1xuICAgICAgZ3J1bnQuZmlsZS53cml0ZSggYCR7YnVpbGREaXJ9LyR7cmVwb30taW9zLnBuZ2AsIGF3YWl0IGdlbmVyYXRlVGh1bWJuYWlscyggcmVwbywgNDIwLCAyNzYsIDkwLCBqaW1wLk1JTUVfSlBFRyApICk7XG4gICAgICBncnVudC5maWxlLndyaXRlKCBgJHtidWlsZERpcn0vJHtyZXBvfS10d2l0dGVyLWNhcmQucG5nYCwgYXdhaXQgZ2VuZXJhdGVUd2l0dGVyQ2FyZCggcmVwbyApICk7XG4gICAgfVxuICB9XG59XG5cbi8vIEZvciBwcm9maWxpbmcgZmlsZSBzaXplLiBOYW1lIGlzIG9wdGlvbmFsXG5jb25zdCB3cmFwUHJvZmlsZUZpbGVTaXplID0gKCBzdHJpbmc6IHN0cmluZywgcHJvZmlsZUZpbGVTaXplOiBib29sZWFuLCB0eXBlOiBzdHJpbmcsIG5hbWU/OiBzdHJpbmcgKSA9PiB7XG4gIGlmICggcHJvZmlsZUZpbGVTaXplICkge1xuICAgIGNvbnN0IGNvbmRpdGlvbmFsTmFtZSA9IG5hbWUgPyBgLFwiJHtuYW1lfVwiYCA6ICcnO1xuICAgIHJldHVybiBgY29uc29sZS5sb2coXCJTVEFSVF8ke3R5cGUudG9VcHBlckNhc2UoKX1cIiR7Y29uZGl0aW9uYWxOYW1lfSk7XFxuJHtzdHJpbmd9XFxuY29uc29sZS5sb2coXCJFTkRfJHt0eXBlLnRvVXBwZXJDYXNlKCl9XCIke2NvbmRpdGlvbmFsTmFtZX0pO1xcblxcbmA7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIHN0cmluZztcbiAgfVxufTsiXSwibmFtZXMiOlsiYXNzZXJ0IiwiZnMiLCJyZWFkRmlsZVN5bmMiLCJqaW1wIiwiXyIsInpsaWIiLCJhZmZpcm0iLCJwaGV0VGltaW5nTG9nIiwiZ3J1bnQiLCJDaGlwcGVyQ29uc3RhbnRzIiwiQ2hpcHBlclN0cmluZ1V0aWxzIiwiZ2V0TGljZW5zZUVudHJ5IiwibG9hZEZpbGVBc0RhdGFVUkkiLCJjb3B5RGlyZWN0b3J5IiwiY29weVN1cHBsZW1lbnRhbFBoZXRpb0ZpbGVzIiwiZ2VuZXJhdGVUaHVtYm5haWxzIiwiZ2VuZXJhdGVUd2l0dGVyQ2FyZCIsImdldEExMXlWaWV3SFRNTEZyb21UZW1wbGF0ZSIsImdldEFsbFRoaXJkUGFydHlFbnRyaWVzIiwiZ2V0RGVwZW5kZW5jaWVzIiwiZ2V0SW5pdGlhbGl6YXRpb25TY3JpcHQiLCJnZXRMb2NhbGVzRnJvbVJlcG9zaXRvcnkiLCJnZXRQaGV0TGlicyIsImdldFByZWxvYWRzIiwiZ2V0UHJ1bmVkTG9jYWxlRGF0YSIsImdldFN0cmluZ01hcCIsImdldFRpdGxlU3RyaW5nS2V5IiwibWluaWZ5IiwicGFja2FnZVJ1bm5hYmxlIiwicGFja2FnZVhIVE1MIiwicmVwb3J0VW51c2VkTWVkaWEiLCJyZXBvcnRVbnVzZWRTdHJpbmdzIiwid2VicGFja0J1aWxkIiwibm9kZUh0bWxFbmNvZGVyIiwicmVxdWlyZSIsInJlY29yZFRpbWUiLCJuYW1lIiwiYXN5bmNDYWxsYmFjayIsInRpbWVDYWxsYmFjayIsImJlZm9yZVRpbWUiLCJEYXRlIiwibm93IiwicmVzdWx0Iiwic3RhcnRBc3luYyIsImFmdGVyVGltZSIsInJlcG8iLCJtaW5pZnlPcHRpb25zIiwiYWxsSFRNTCIsImJyYW5kIiwibG9jYWxlc09wdGlvbiIsImVuY29kZVN0cmluZ01hcCIsImNvbXByZXNzU2NyaXB0cyIsInByb2ZpbGVGaWxlU2l6ZSIsInR5cGVDaGVjayIsImZpbGUiLCJleGlzdHMiLCJwYWNrYWdlT2JqZWN0IiwiSlNPTiIsInBhcnNlIiwiZW5jb2RlciIsIkVuY29kZXIiLCJ0aW1lc3RhbXAiLCJ0b0lTT1N0cmluZyIsInNwbGl0Iiwiam9pbiIsInN1YnN0cmluZyIsImluZGV4T2YiLCJ3ZWJwYWNrUmVzdWx0IiwidGltZSIsImxvZyIsIm9rIiwid2VicGFja0pTIiwid3JhcFByb2ZpbGVGaWxlU2l6ZSIsImpzIiwiZGVidWdNaW5pZnlPcHRpb25zIiwic3RyaXBBc3NlcnRpb25zIiwic3RyaXBMb2dnaW5nIiwidXNlZE1vZHVsZXMiLCJsaWNlbnNlRW50cmllcyIsIk1FRElBX1RZUEVTIiwiZm9yRWFjaCIsIm1lZGlhVHlwZSIsIm1vZHVsZSIsImluZGV4IiwibGFzdEluZGV4T2YiLCJwYXRoIiwic2xpY2UiLCJwaGV0TGlicyIsImFsbExvY2FsZXMiLCJGQUxMQkFDS19MT0NBTEUiLCJsb2NhbGVzIiwiZGVwZW5kZW5jaWVzIiwiZGVwZW5kZW5jeVJlcHMiLCJPYmplY3QiLCJrZXlzIiwibWFwIiwibW9kdWxlRGVwZW5kZW5jeSIsInBhdGhTZXBhcmF0b3JJbmRleCIsIm1vZHVsZVJlcG8iLCJpbmNsdWRlcyIsImRpc3RSZXBvIiwidmVyc2lvbiIsInRoaXJkUGFydHlFbnRyaWVzIiwic2ltVGl0bGVTdHJpbmdLZXkiLCJzdHJpbmdNYXAiLCJzdHJpbmdNZXRhZGF0YSIsInBoZXQiLCJyZXF1aXJlanNOYW1lc3BhY2UiLCJsb2NhbGUiLCJlbmdsaXNoVGl0bGUiLCJodG1sSGVhZGVyIiwidGVtcGxhdGUiLCJ0b2RheSIsInN0YXJ0dXBTY3JpcHRzIiwibWluaWZpYWJsZVNjcmlwdHMiLCJmaWxlbmFtZSIsInJlYWQiLCJwcm9kdWN0aW9uU2NyaXB0cyIsInNjcmlwdHMiLCJzdW0iLCJsZW5ndGgiLCJkZWJ1Z1NjcmlwdHMiLCJsaWNlbnNlU2NyaXB0IiwicmVwbGFjZVBsYWNlaG9sZGVycyIsIlBIRVRfU1RBUlRfVEhJUkRfUEFSVFlfTElDRU5TRV9FTlRSSUVTIiwiU1RBUlRfVEhJUkRfUEFSVFlfTElDRU5TRV9FTlRSSUVTIiwiUEhFVF9USElSRF9QQVJUWV9MSUNFTlNFX0VOVFJJRVMiLCJzdHJpbmdpZnkiLCJQSEVUX0VORF9USElSRF9QQVJUWV9MSUNFTlNFX0VOVFJJRVMiLCJFTkRfVEhJUkRfUEFSVFlfTElDRU5TRV9FTlRSSUVTIiwiY29tbW9uSW5pdGlhbGl6YXRpb25PcHRpb25zIiwibG9jYWxlRGF0YSIsImFsbG93TG9jYWxlU3dpdGNoaW5nIiwid3JhcFN0cmluZ3NKUyIsInN0cmluZ3NKUyIsImJ1aWxkRGlyIiwibWtkaXJTeW5jIiwicmVjdXJzaXZlIiwiaW5pdGlhbGl6YXRpb25TY3JpcHQiLCJhc3NpZ25JbiIsImluY2x1ZGVBbGxMb2NhbGVzIiwiaXNEZWJ1Z0J1aWxkIiwid3JpdGUiLCJhbGxIVE1MRmlsZW5hbWUiLCJhbGxIVE1MQ29udGVudHMiLCJnemlwU3luYyIsImRlYnVnSW5pdGlhbGl6YXRpb25TY3JpcHQiLCJ4aHRtbERpciIsInhodG1sSW5pdGlhbGl6YXRpb25TY3JpcHQiLCJlbiIsInZlcmJvc2UiLCJ3cml0ZWxuIiwiaWZyYW1lVGVzdEh0bWwiLCJyZXBsYWNlRmlyc3QiLCJodG1sRW5jb2RlIiwiaWZyYW1lTG9jYWxlcyIsImNvbmNhdCIsImlmcmFtZUh0bWwiLCJzaW1GZWF0dXJlcyIsInN1cHBvcnRzSW50ZXJhY3RpdmVEZXNjcmlwdGlvbiIsImExMXlIVE1MIiwicmVwbGFjZUFsbCIsIkExMVlfVklFV19IVE1MX1NVRkZJWCIsInBhY2thZ2VXaXRoQnVpbGQiLCJBcnJheSIsImlzQXJyYXkiLCJpc0RpciIsImNvcHkiLCJ0aHVtYm5haWxTaXplcyIsIndpZHRoIiwiaGVpZ2h0Iiwic2l6ZSIsIk1JTUVfUE5HIiwiTUlNRV9KUEVHIiwic3RyaW5nIiwidHlwZSIsImNvbmRpdGlvbmFsTmFtZSIsInRvVXBwZXJDYXNlIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxPQUFPQSxZQUFZLFNBQVM7QUFDNUIsT0FBT0MsTUFBTUMsWUFBWSxRQUFRLEtBQUs7QUFDdEMsT0FBT0MsVUFBVSxPQUFPO0FBQ3hCLE9BQU9DLE9BQU8sU0FBUztBQUN2QixPQUFPQyxVQUFVLE9BQU87QUFDeEIsT0FBT0MsWUFBWSx5REFBeUQ7QUFDNUUsT0FBT0MsbUJBQW1CLHNEQUFzRDtBQUNoRixPQUFPQyxXQUFXLHdEQUF3RDtBQUMxRSxPQUFPQyxzQkFBc0IsZ0NBQWdDO0FBQzdELE9BQU9DLHdCQUF3QixrQ0FBa0M7QUFDakUsT0FBT0MscUJBQXFCLCtCQUErQjtBQUMzRCxPQUFPQyx1QkFBdUIsaUNBQWlDO0FBQy9ELE9BQU9DLG1CQUFtQixxQkFBcUI7QUFDL0MsT0FBT0MsaUNBQWlDLG1DQUFtQztBQUMzRSxPQUFPQyx3QkFBd0IsMEJBQTBCO0FBQ3pELE9BQU9DLHlCQUF5QiwyQkFBMkI7QUFDM0QsT0FBT0MsaUNBQWlDLG1DQUFtQztBQUMzRSxPQUFPQyw2QkFBaUQsK0JBQStCO0FBQ3ZGLE9BQU9DLHFCQUFxQix1QkFBdUI7QUFDbkQsT0FBT0MsNkJBQTZCLCtCQUErQjtBQUNuRSxPQUFPQyw4QkFBOEIsZ0NBQWdDO0FBQ3JFLE9BQU9DLGlCQUFpQixtQkFBbUI7QUFDM0MsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQUMzQyxPQUFPQyx5QkFBeUIsMkJBQTJCO0FBQzNELE9BQU9DLGtCQUFrQixvQkFB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