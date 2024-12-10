// Copyright 2016-2024, University of Colorado Boulder
/**
 * Copies all supporting PhET-iO files, including wrappers, indices, lib files, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Matt Pennington (PhET Interactive Simulations)
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
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import SimVersion from '../../../perennial-alias/js/browser-and-node/SimVersion.js';
import dirname from '../../../perennial-alias/js/common/dirname.js';
import execute from '../../../perennial-alias/js/common/execute.js';
import typeCheck from '../../../perennial-alias/js/grunt/typeCheck.js';
import grunt from '../../../perennial-alias/js/npm-dependencies/grunt.js';
import ChipperStringUtils from '../common/ChipperStringUtils.js';
import copyDirectory from '../grunt/copyDirectory.js';
import minify from '../grunt/minify.js';
import formatPhetioAPI from '../phet-io/formatPhetioAPI.js';
import generatePhetioMacroAPI from '../phet-io/generatePhetioMacroAPI.js';
import buildStandalone from './buildStandalone.js';
import getPhetLibs from './getPhetLibs.js';
import webpackBuild from './webpackBuild.js';
const webpack = require('webpack');
const archiver = require('archiver');
const marked = require('marked');
// @ts-expect-error - until we have "type": "module" in our package.json
const __dirname = dirname(import.meta.url);
// constants
const DEDICATED_REPO_WRAPPER_PREFIX = 'phet-io-wrapper-';
const WRAPPER_COMMON_FOLDER = 'phet-io-wrappers/common';
const WRAPPERS_FOLDER = 'wrappers/'; // The wrapper index assumes this constant, please see phet-io-wrappers/index/index.js before changing
// For PhET-iO Client Guides
const PHET_IO_SIM_SPECIFIC = '../phet-io-sim-specific';
const GUIDES_COMMON_DIR = 'client-guide-common/client-guide';
const EXAMPLES_FILENAME = 'examples';
const PHET_IO_GUIDE_FILENAME = 'phet-io-guide';
const LIB_OUTPUT_FILE = 'phet-io.js';
// These files are bundled into the lib/phet-io.js file before PhET's phet-io code, and can be used by any wrapper
const THIRD_PARTY_LIB_PRELOADS = [
    '../sherpa/lib/react-18.1.0.production.min.js',
    '../sherpa/lib/react-dom-18.1.0.production.min.js',
    '../sherpa/lib/pako-2.0.3.min.js',
    '../sherpa/lib/lodash-4.17.4.min.js'
];
// phet-io internal files to be consolidated into 1 file and publicly served as a minified phet-io library.
// Make sure to add new files to the jsdoc generation list below also
const PHET_IO_LIB_PRELOADS = [
    '../query-string-machine/js/QueryStringMachine.js',
    '../assert/js/assert.js',
    '../tandem/js/PhetioIDUtils.js'
];
const LIB_PRELOADS = THIRD_PARTY_LIB_PRELOADS.concat(PHET_IO_LIB_PRELOADS);
// Additional libraries and third party files that are used by some phet-io wrappers, copied to a contrib/ directory.
// These are not bundled with the lib file to reduce the size of the central dependency of PhET-iO wrappers.
const CONTRIB_FILES = [
    '../sherpa/lib/ua-parser-0.7.21.min.js',
    '../sherpa/lib/bootstrap-2.2.2.js',
    '../sherpa/lib/font-awesome-4.5.0',
    '../sherpa/lib/jquery-2.1.0.min.js',
    '../sherpa/lib/jquery-ui-1.8.24.min.js',
    '../sherpa/lib/d3-4.2.2.js',
    '../sherpa/lib/jsondiffpatch-v0.3.11.umd.js',
    '../sherpa/lib/jsondiffpatch-v0.3.11-annotated.css',
    '../sherpa/lib/jsondiffpatch-v0.3.11-html.css',
    '../sherpa/lib/prism-1.23.0.js',
    '../sherpa/lib/prism-okaidia-1.23.0.css',
    '../sherpa/lib/clarinet-0.12.4.js'
];
// This path is used for jsdoc. Transpilation happens before we get to this point. SR and MK recognize that this feels
// a bit risky, even though comments are currently preserved in the babel transpile step. See https://stackoverflow.com/questions/51720894/is-there-any-way-to-use-jsdoc-with-ts-files-maybe-transpile-with-babel-the
const transpiledClientPath = `../chipper/dist/js/${WRAPPER_COMMON_FOLDER}/js/Client.js`;
// List of files to run jsdoc generation with. This list is manual to keep files from sneaking into the public documentation.
const JSDOC_FILES = [
    `../chipper/dist/js/${WRAPPER_COMMON_FOLDER}/js/PhetioClient.js`,
    transpiledClientPath,
    '../tandem/js/PhetioIDUtils.js',
    '../phet-io/js/phet-io-initialize-globals.js',
    '../chipper/js/browser/initialize-globals.js',
    '../chipper/dist/js/perennial-alias/js/browser-and-node/SimVersion.js'
];
const JSDOC_README_FILE = '../phet-io/doc/wrapper/phet-io-documentation_README.md';
const STUDIO_BUILT_FILENAME = 'studio.min.js';
export default /*#__PURE__*/ _async_to_generator(function*(repo, version, simulationDisplayName, packageObject, generateMacroAPIFile = false, typeCheck = true) {
    const repoPhetLibs = getPhetLibs(repo, 'phet-io');
    assert(_.every(getPhetLibs('phet-io-wrappers'), (repo)=>repoPhetLibs.includes(repo)), 'every dependency of phet-io-wrappers is not included in phetLibs of ' + repo + ' ' + repoPhetLibs + ' ' + getPhetLibs('phet-io-wrappers'));
    assert(_.every(getPhetLibs('studio'), (repo)=>repoPhetLibs.includes(repo)), 'every dependency of studio is not included in phetLibs of ' + repo + ' ' + repoPhetLibs + ' ' + getPhetLibs('studio'));
    // This must be checked after copySupplementalPhetioFiles is called, since all the imports and outer code is run in
    // every brand. Developers without phet-io checked out still need to be able to build.
    assert(fs.readFileSync(transpiledClientPath).toString().includes('/**'), 'babel should not strip comments from transpiling');
    const simRepoSHA = (yield execute('git', [
        'rev-parse',
        'HEAD'
    ], `../${repo}`)).trim();
    const buildDir = `../${repo}/build/phet-io/`;
    const wrappersLocation = `${buildDir}${WRAPPERS_FOLDER}`;
    const simVersion = SimVersion.parse(version);
    const latestVersion = `${simVersion.major}.${simVersion.minor}`;
    const standardPhetioWrapperTemplateSkeleton = fs.readFileSync('../phet-io-wrappers/common/html/standardPhetioWrapperTemplateSkeleton.html', 'utf8');
    const customPhetioWrapperTemplateSkeleton = fs.readFileSync('../phet-io-wrappers/common/html/customPhetioWrapperTemplateSkeleton.html', 'utf8');
    assert(!standardPhetioWrapperTemplateSkeleton.includes('`'), 'The templates cannot contain backticks due to how the templates are passed through below');
    assert(!customPhetioWrapperTemplateSkeleton.includes('`'), 'The templates cannot contain backticks due to how the templates are passed through below');
    // The filter that we run every phet-io wrapper file through to transform dev content into built content. This mainly
    // involves lots of hard coded copy replace of template strings and marker values.
    const filterWrapper = (absPath, contents)=>{
        const originalContents = `${contents}`;
        const isWrapperIndex = absPath.includes('index/index.html');
        // For info about LIB_OUTPUT_FILE, see handleLib()
        const pathToLib = `lib/${LIB_OUTPUT_FILE}`;
        if (absPath.includes('.html')) {
            // change the paths of sherpa files to point to the contrib/ folder
            CONTRIB_FILES.forEach((filePath)=>{
                // No need to do this is this file doesn't have this contrib import in it.
                if (contents.includes(filePath)) {
                    const filePathParts = filePath.split('/');
                    // If the file is in a dedicated wrapper repo, then it is one level higher in the dir tree, and needs 1 less set of dots.
                    // see https://github.com/phetsims/phet-io-wrappers/issues/17 for more info. This is hopefully a temporary workaround
                    const needsExtraDots = absPath.includes(DEDICATED_REPO_WRAPPER_PREFIX);
                    const fileName = filePathParts[filePathParts.length - 1];
                    const contribFileName = `contrib/${fileName}`;
                    let pathToContrib = needsExtraDots ? `../../${contribFileName}` : `../${contribFileName}`;
                    // The wrapper index is a different case because it is placed at the top level of the build dir.
                    if (isWrapperIndex) {
                        pathToContrib = contribFileName;
                        filePath = `../${filePath}`; // filePath has one less set of relative than are actually in the index.html file.
                    }
                    contents = ChipperStringUtils.replaceAll(contents, filePath, pathToContrib);
                }
            });
            const includesElement = (line, array)=>!!array.find((element)=>line.includes(element));
            // Remove files listed as preloads to the phet-io lib file.
            contents = contents.split(/\r?\n/).filter((line)=>!includesElement(line, LIB_PRELOADS)).join('\n');
            // Delete the imports the phet-io-wrappers-main, as it will be bundled with the phet-io.js lib file.
            // MUST GO BEFORE BELOW REPLACE: 'phet-io-wrappers/' -> '/'
            contents = contents.replace(/<script type="module" src="(..\/)+chipper\/dist\/js\/phet-io-wrappers\/js\/phet-io-wrappers-main.js"><\/script>/g, '');
            // Support wrappers that use code from phet-io-wrappers
            contents = ChipperStringUtils.replaceAll(contents, '/phet-io-wrappers/', '/');
            // Don't use ChipperStringUtils because we want to capture the relative path and transfer it to the new script.
            // This is to support providing the relative path through the build instead of just hard coding it.
            contents = contents.replace(/<!--(<script src="[./]*\{\{PATH_TO_LIB_FILE}}".*><\/script>)-->/g, '$1' // just uncomment, don't fill it in yet
            );
            contents = ChipperStringUtils.replaceAll(contents, '<!--{{GOOGLE_ANALYTICS.js}}-->', '<script src="/assets/js/phet-io-ga.js"></script>');
            contents = ChipperStringUtils.replaceAll(contents, '<!--{{FAVICON.ico}}-->', '<link rel="shortcut icon" href="/assets/favicon.ico"/>');
            // There should not be any imports of PhetioClient directly except using the "multi-wrapper" functionality of
            // providing a ?clientName, for unbuilt only, so we remove it here.
            contents = contents.replace(/^.*\/common\/js\/PhetioClient.js.*$/mg, '');
        }
        if (absPath.includes('.js') || absPath.includes('.html')) {
            // Fill these in first so the following lines will also hit the content in these template vars
            contents = ChipperStringUtils.replaceAll(contents, '{{CUSTOM_WRAPPER_SKELETON}}', customPhetioWrapperTemplateSkeleton);
            contents = ChipperStringUtils.replaceAll(contents, '{{STANDARD_WRAPPER_SKELETON}}', standardPhetioWrapperTemplateSkeleton);
            // The rest
            contents = ChipperStringUtils.replaceAll(contents, '{{PATH_TO_LIB_FILE}}', pathToLib); // This must be after the script replacement that uses this variable above.
            contents = ChipperStringUtils.replaceAll(contents, '{{SIMULATION_NAME}}', repo);
            contents = ChipperStringUtils.replaceAll(contents, '{{SIMULATION_DISPLAY_NAME}}', simulationDisplayName);
            contents = ChipperStringUtils.replaceAll(contents, '{{SIMULATION_DISPLAY_NAME_ESCAPED}}', simulationDisplayName.replace(/'/g, '\\\''));
            contents = ChipperStringUtils.replaceAll(contents, '{{SIMULATION_VERSION_STRING}}', version);
            contents = ChipperStringUtils.replaceAll(contents, '{{SIMULATION_LATEST_VERSION}}', latestVersion);
            contents = ChipperStringUtils.replaceAll(contents, '{{SIMULATION_IS_BUILT}}', 'true');
            contents = ChipperStringUtils.replaceAll(contents, '{{PHET_IO_LIB_RELATIVE_PATH}}', pathToLib);
            contents = ChipperStringUtils.replaceAll(contents, '{{Built API Docs not available in unbuilt mode}}', 'API Docs');
            // phet-io-wrappers/common will be in the top level of wrappers/ in the build directory
            contents = ChipperStringUtils.replaceAll(contents, `${WRAPPER_COMMON_FOLDER}/`, 'common/');
        }
        if (isWrapperIndex) {
            const getGuideRowText = (fileName, linkText, description)=>{
                return `<tr>
        <td><a href="doc/guides/${fileName}.html">${linkText}</a>
        </td>
        <td>${description}</td>
      </tr>`;
            };
            // The phet-io-guide is not sim-specific, so always create it.
            contents = ChipperStringUtils.replaceAll(contents, '{{PHET_IO_GUIDE_ROW}}', getGuideRowText(PHET_IO_GUIDE_FILENAME, 'PhET-iO Guide', 'Documentation for instructional designers about best practices for simulation customization with PhET-iO Studio.'));
            const exampleRowContents = fs.existsSync(`${PHET_IO_SIM_SPECIFIC}/repos/${repo}/${EXAMPLES_FILENAME}.md`) ? getGuideRowText(EXAMPLES_FILENAME, 'Examples', 'Provides instructions and the specific phetioIDs for customizing the simulation.') : '';
            contents = ChipperStringUtils.replaceAll(contents, '{{EXAMPLES_ROW}}', exampleRowContents);
        }
        // Special handling for studio paths since it is not nested under phet-io-wrappers
        if (absPath.includes('studio/index.html')) {
            contents = ChipperStringUtils.replaceAll(contents, '<script src="../contrib/', '<script src="../../contrib/');
            contents = ChipperStringUtils.replaceAll(contents, '<script type="module" src="../chipper/dist/js/studio/js/studio-main.js"></script>', `<script src="./${STUDIO_BUILT_FILENAME}"></script>`);
            contents = ChipperStringUtils.replaceAll(contents, '{{PHET_IO_GUIDE_LINK}}', `../../doc/guides/${PHET_IO_GUIDE_FILENAME}.html`);
            contents = ChipperStringUtils.replaceAll(contents, '{{EXAMPLES_LINK}}', `../../doc/guides/${EXAMPLES_FILENAME}.html`);
        }
        // Collapse >1 blank lines in html files.  This helps as a postprocessing step after removing lines with <script> tags
        if (absPath.endsWith('.html')) {
            const lines = contents.split(/\r?\n/);
            const pruned = [];
            for(let i = 0; i < lines.length; i++){
                if (i >= 1 && lines[i - 1].trim().length === 0 && lines[i].trim().length === 0) {
                // skip redundant blank line
                } else {
                    pruned.push(lines[i]);
                }
            }
            contents = pruned.join('\n');
        }
        if (contents !== originalContents) {
            return contents;
        } else {
            return null; // signify no change (helps for images)
        }
    };
    // a list of the phet-io wrappers that are built with the phet-io sim
    const wrappers = fs.readFileSync('../perennial-alias/data/wrappers', 'utf-8').trim().split('\n').map((wrappers)=>wrappers.trim());
    // Files and directories from wrapper folders that we don't want to copy
    const wrappersUnallowed = [
        '.git',
        'README.md',
        '.gitignore',
        'node_modules',
        'package.json',
        'build'
    ];
    const libFileNames = PHET_IO_LIB_PRELOADS.map((filePath)=>{
        const parts = filePath.split('/');
        return parts[parts.length - 1];
    });
    // Don't copy over the files that are in the lib file, this way we can catch wrapper bugs that are not pointing to the lib.
    const fullUnallowedList = wrappersUnallowed.concat(libFileNames);
    // wrapping function for copying the wrappers to the build dir
    const copyWrapper = (src, dest, wrapper, wrapperName)=>{
        const wrapperFilterWithNameFilter = (absPath, contents)=>{
            const result = filterWrapper(absPath, contents);
            // Support loading relative-path resources, like
            //{ url: '../phet-io-wrapper-my-wrapper/sounds/precipitate-chimes-v1-shorter.mp3' }
            // -->
            //{ url: 'wrappers/my-wrapper/sounds/precipitate-chimes-v1-shorter.mp3' }
            if (wrapper && wrapperName && result) {
                return ChipperStringUtils.replaceAll(result, `../${wrapper}/`, `wrappers/${wrapperName}/`);
            }
            return result;
        };
        copyDirectory(src, dest, wrapperFilterWithNameFilter, {
            exclude: fullUnallowedList,
            minifyJS: true,
            minifyOptions: {
                stripAssertions: false
            }
        });
    };
    // Make sure to copy the phet-io-wrappers common wrapper code too.
    wrappers.push(WRAPPER_COMMON_FOLDER);
    // Add sim-specific wrappers
    let simSpecificWrappers;
    try {
        simSpecificWrappers = fs.readdirSync(`../phet-io-sim-specific/repos/${repo}/wrappers/`, {
            withFileTypes: true
        }).filter((dirent)=>dirent.isDirectory()).map((dirent)=>`phet-io-sim-specific/repos/${repo}/wrappers/${dirent.name}`);
    } catch (e) {
        simSpecificWrappers = [];
    }
    wrappers.push(...simSpecificWrappers);
    const additionalWrappers = packageObject.phet && packageObject.phet['phet-io'] && packageObject.phet['phet-io'].wrappers ? packageObject.phet['phet-io'].wrappers : [];
    // phet-io-sim-specific wrappers are automatically added above
    wrappers.push(...additionalWrappers.filter((x)=>!x.includes('phet-io-sim-specific')));
    wrappers.forEach((wrapper)=>{
        const wrapperParts = wrapper.split('/');
        // either take the last path part, or take the first (repo name) and remove the wrapper prefix
        const wrapperName = wrapperParts.length > 1 ? wrapperParts[wrapperParts.length - 1] : wrapperParts[0].replace(DEDICATED_REPO_WRAPPER_PREFIX, '');
        // Copy the wrapper into the build dir /wrappers/, exclude the excluded list
        copyWrapper(`../${wrapper}`, `${wrappersLocation}${wrapperName}`, wrapper, wrapperName);
    });
    // Copy the wrapper index into the top level of the build dir, exclude the excluded list
    copyWrapper('../phet-io-wrappers/index', `${buildDir}`, null, null);
    // Create the lib file that is minified and publicly available under the /lib folder of the build
    yield handleLib(repo, buildDir, typeCheck, filterWrapper);
    // Create the zipped file that holds all needed items to run PhET-iO offline. NOTE: this must happen after copying wrapper
    yield handleOfflineArtifact(buildDir, repo, version);
    // Create the contrib folder and add to it third party libraries used by wrappers.
    handleContrib(buildDir);
    // Create the rendered jsdoc in the `doc` folder
    yield handleJSDOC(buildDir);
    // create the client guides
    handleClientGuides(repo, simulationDisplayName, buildDir, version, simRepoSHA);
    yield handleStudio(repo, wrappersLocation, typeCheck);
    if (generateMacroAPIFile) {
        const fullAPI = (yield generatePhetioMacroAPI([
            repo
        ], {
            fromBuiltVersion: true
        }))[repo];
        assert(fullAPI, 'Full API expected but not created from puppeteer step, likely caused by https://github.com/phetsims/chipper/issues/1022.');
        grunt.file.write(`${buildDir}${repo}-phet-io-api.json`, formatPhetioAPI(fullAPI));
    }
    // The nested index wrapper will be broken on build, so get rid of it for clarity
    fs.rmSync(`${wrappersLocation}index/`, {
        recursive: true
    });
});
/**
 * Given the list of lib files, apply a filter function to them. Then minify them and consolidate into a single string.
 * Finally, write them to the build dir with a license prepended. See https://github.com/phetsims/phet-io/issues/353

 * @param repo
 * @param buildDir
 * @param typeCheck
 * @param filter - the filter function used when copying over wrapper files to fix relative paths and such.
 *                            Has arguments like "function(absPath, contents)"
 */ const handleLib = /*#__PURE__*/ _async_to_generator(function*(repo, buildDir, shouldTypeCheck, filter) {
    grunt.log.verbose.writeln(`Creating phet-io lib file from: ${PHET_IO_LIB_PRELOADS.join(', ')}`);
    fs.mkdirSync(`${buildDir}lib`, {
        recursive: true
    });
    // phet-written preloads
    const phetioLibCode = PHET_IO_LIB_PRELOADS.map((libFile)=>{
        const contents = grunt.file.read(libFile);
        const filteredContents = filter(libFile, contents);
        // The filter returns null if nothing changes
        return filteredContents || contents;
    }).join('');
    const migrationProcessorsCode = yield getCompiledMigrationProcessors(repo, buildDir);
    const minifiedPhetioCode = minify(`${phetioLibCode}\n${migrationProcessorsCode}`, {
        stripAssertions: false
    });
    if (shouldTypeCheck) {
        const success = yield typeCheck({
            repo: 'phet-io-wrappers'
        });
        if (!success) {
            grunt.fail.fatal('Type checking failed');
        }
    }
    let wrappersMain = yield buildStandalone('phet-io-wrappers', {
        stripAssertions: false,
        stripLogging: false,
        tempOutputDir: repo,
        brand: 'phet-io',
        // Avoid getting a 2nd copy of the files that are already bundled into the lib file
        omitPreloads: THIRD_PARTY_LIB_PRELOADS
    });
    // In loadWrapperTemplate in unbuilt mode, it uses readFile to dynamically load the templates at runtime.
    // In built mode, we must inline the templates into the build artifact. See loadWrapperTemplate.js
    assert(wrappersMain.includes('"{{STANDARD_WRAPPER_SKELETON}}"') || wrappersMain.includes('\'{{STANDARD_WRAPPER_SKELETON}}\''), 'Template variable is missing: STANDARD_WRAPPER_SKELETON');
    assert(wrappersMain.includes('"{{CUSTOM_WRAPPER_SKELETON}}"') || wrappersMain.includes('\'{{CUSTOM_WRAPPER_SKELETON}}\''), 'Template variable is missing: CUSTOM_WRAPPER_SKELETON');
    // Robustly handle double or single quotes.  At the moment it is double quotes.
    // buildStandalone will mangle a template string into "" because it hasn't been filled in yet, bring it back here (with
    // support for it changing in the future from double to single quotes).
    wrappersMain = wrappersMain.replace('"{{STANDARD_WRAPPER_SKELETON}}"', '`{{STANDARD_WRAPPER_SKELETON}}`');
    wrappersMain = wrappersMain.replace('\'{{STANDARD_WRAPPER_SKELETON}}\'', '`{{STANDARD_WRAPPER_SKELETON}}`');
    wrappersMain = wrappersMain.replace('"{{CUSTOM_WRAPPER_SKELETON}}"', '`{{CUSTOM_WRAPPER_SKELETON}}`');
    wrappersMain = wrappersMain.replace('\'{{CUSTOM_WRAPPER_SKELETON}}\'', '`{{CUSTOM_WRAPPER_SKELETON}}`');
    const filteredMain = filter(LIB_OUTPUT_FILE, wrappersMain);
    const mainCopyright = `// Copyright 2002-${new Date().getFullYear()}, University of Colorado Boulder
// This PhET-iO file requires a license
// USE WITHOUT A LICENSE AGREEMENT IS STRICTLY PROHIBITED.
// For licensing, please contact phethelp@colorado.edu`;
    grunt.file.write(`${buildDir}lib/${LIB_OUTPUT_FILE}`, `${mainCopyright}
//
// Contains additional code under the specified licenses:

${THIRD_PARTY_LIB_PRELOADS.map((contribFile)=>grunt.file.read(contribFile)).join('\n\n')}

${mainCopyright}

${minifiedPhetioCode}\n${filteredMain}`);
});
/**
 * Copy all the third party libraries from sherpa to the build directory under the 'contrib' folder.
 */ const handleContrib = (buildDir)=>{
    grunt.log.verbose.writeln('Creating phet-io contrib folder');
    CONTRIB_FILES.forEach((filePath)=>{
        const filePathParts = filePath.split('/');
        const filename = filePathParts[filePathParts.length - 1];
        grunt.file.copy(filePath, `${buildDir}contrib/${filename}`);
    });
};
/**
 * Combine the files necessary to run and host PhET-iO locally into a zip that can be easily downloaded by the client.
 * This does not include any documentation, or wrapper suite wrapper examples.
 */ const handleOfflineArtifact = /*#__PURE__*/ _async_to_generator(function*(buildDir, repo, version) {
    const output = fs.createWriteStream(`${buildDir}${repo}-phet-io-${version}.zip`);
    const archive = archiver('zip');
    archive.on('error', (err)=>grunt.fail.fatal(`error creating archive: ${err}`));
    archive.pipe(output);
    // copy over the lib directory and its contents, and an index to test. Note that these use the files from the buildDir
    // because they have been post-processed and contain filled in template vars.
    archive.directory(`${buildDir}lib`, 'lib');
    // Take from build directory so that it has been filtered/mapped to correct paths.
    archive.file(`${buildDir}${WRAPPERS_FOLDER}/common/html/offline-example.html`, {
        name: 'index.html'
    });
    // get the all html and the debug version too, use `cwd` so that they are at the top level of the zip.
    archive.glob(`${repo}*all*.html`, {
        cwd: `${buildDir}`
    });
    archive.finalize();
    return new Promise((resolve)=>output.on('close', resolve));
});
/**
 * Generate jsdoc and put it in "build/phet-io/doc"
 */ const handleJSDOC = /*#__PURE__*/ _async_to_generator(function*(buildDir) {
    // Make sure each file exists
    for(let i = 0; i < JSDOC_FILES.length; i++){
        if (!fs.existsSync(JSDOC_FILES[i])) {
            throw new Error(`file doesnt exist: ${JSDOC_FILES[i]}`);
        }
    }
    const getJSDocArgs = (explain)=>[
            '../chipper/node_modules/jsdoc/jsdoc.js',
            ...explain ? [
                '-X'
            ] : [],
            ...JSDOC_FILES,
            '-c',
            '../phet-io/doc/wrapper/jsdoc-config.json',
            '-d',
            `${buildDir}doc/api`,
            '-t',
            '../chipper/node_modules/docdash',
            '--readme',
            JSDOC_README_FILE
        ];
    // FOR DEBUGGING JSDOC:
    // uncomment this line, and run it from the top level of a sim directory
    // console.log( 'node', getJSDocArgs( false ).join( ' ' ) );
    // First we tried to run the jsdoc binary as the cmd, but that wasn't working, and was quite finicky. Then @samreid
    // found https://stackoverflow.com/questions/33664843/how-to-use-jsdoc-with-gulp which recommends the following method
    // (node executable with jsdoc js file)
    yield execute('node', getJSDocArgs(false), process.cwd());
    // Running with explanation -X appears to not output the files, so we have to run it twice.
    const explanation = (yield execute('node', getJSDocArgs(true), process.cwd())).trim();
    // Copy the logo file
    const imageDir = `${buildDir}doc/images`;
    if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir);
    }
    fs.copyFileSync('../brand/phet-io/images/logoOnWhite.png', `${imageDir}/logo.png`);
    const json = explanation.substring(explanation.indexOf('['), explanation.lastIndexOf(']') + 1);
    // basic sanity checks
    assert(json.length > 5000, 'JSON seems odd');
    try {
        JSON.parse(json);
    } catch (e) {
        assert(false, 'JSON parsing failed');
    }
    fs.writeFileSync(`${buildDir}doc/jsdoc-explanation.json`, json);
});
/**
 * Generates the phet-io client guides and puts them in `build/phet-io/doc/guides/`
 */ const handleClientGuides = (repoName, simulationDisplayName, buildDir, version, simRepoSHA)=>{
    const builtClientGuidesOutputDir = `${buildDir}doc/guides/`;
    const clientGuidesSourceRoot = `${PHET_IO_SIM_SPECIFIC}/repos/${repoName}/`;
    const commonDir = `${PHET_IO_SIM_SPECIFIC}/${GUIDES_COMMON_DIR}`;
    // copy over common images and styles
    copyDirectory(commonDir, `${builtClientGuidesOutputDir}`);
    // handle generating and writing the html file for each client guide
    generateAndWriteClientGuide(repoName, `${simulationDisplayName} PhET-iO Guide`, simulationDisplayName, `${commonDir}/${PHET_IO_GUIDE_FILENAME}.md`, `${builtClientGuidesOutputDir}${PHET_IO_GUIDE_FILENAME}.html`, version, simRepoSHA, false);
    generateAndWriteClientGuide(repoName, `${simulationDisplayName} Examples`, simulationDisplayName, `${clientGuidesSourceRoot}${EXAMPLES_FILENAME}.md`, `${builtClientGuidesOutputDir}${EXAMPLES_FILENAME}.html`, version, simRepoSHA, true);
};
/**
 * Takes a markdown client guides, fills in the links, and then generates and writes it as html
 * @param repoName
 * @param title
 * @param simulationDisplayName
 * @param mdFilePath - to get the source md file
 * @param destinationPath - to write to
 * @param version
 * @param simRepoSHA
 * @param assertNoConstAwait - handle asserting for "const X = await ..." in examples, see https://github.com/phetsims/phet-io-sim-specific/issues/34
 */ const generateAndWriteClientGuide = (repoName, title, simulationDisplayName, mdFilePath, destinationPath, version, simRepoSHA, assertNoConstAwait)=>{
    // make sure the source markdown file exists
    if (!fs.existsSync(mdFilePath)) {
        grunt.log.warn(`no client guide found at ${mdFilePath}, no guide being built.`);
        return;
    }
    const simCamelCaseName = _.camelCase(repoName);
    let modelDocumentationLine = '';
    if (fs.existsSync(`../${repoName}/doc/model.md`)) {
        modelDocumentationLine = `* [Model Documentation](https://github.com/phetsims/${repoName}/blob/${simRepoSHA}/doc/model.md)`;
    }
    // fill in links
    let clientGuideSource = grunt.file.read(mdFilePath);
    ///////////////////////////////////////////
    // DO NOT UPDATE OR ADD TO THESE WITHOUT ALSO UPDATING THE LIST IN phet-io-sim-specific/client-guide-common/README.md
    clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, '{{WRAPPER_INDEX_PATH}}', '../../');
    clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, '{{SIMULATION_DISPLAY_NAME}}', simulationDisplayName);
    clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, '{{SIM_PATH}}', `../../${repoName}_all_phet-io.html?postMessageOnError&phetioStandalone`);
    clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, '{{STUDIO_PATH}}', '../../wrappers/studio/');
    clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, '{{PHET_IO_GUIDE_PATH}}', `./${PHET_IO_GUIDE_FILENAME}.html`);
    clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, '{{DATE}}', new Date().toString());
    clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, '{{simCamelCaseName}}', simCamelCaseName);
    clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, '{{simKebabName}}', repoName);
    clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, '{{SIMULATION_VERSION_STRING}}', version);
    clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, '{{MODEL_DOCUMENTATION_LINE}}', modelDocumentationLine);
    ///////////////////////////////////////////
    // support relative and absolute paths for unbuilt common image previews by replacing them with the correct relative path. Order matters!
    clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, `../../../${GUIDES_COMMON_DIR}`, '');
    clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, `../../${GUIDES_COMMON_DIR}`, '');
    clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, `../${GUIDES_COMMON_DIR}`, '');
    clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, `/${GUIDES_COMMON_DIR}`, '');
    // Since we don't have a phet/bad-text lint rule for md files, see https://github.com/phetsims/phet-io-sim-specific/issues/34
    assertNoConstAwait && assert(!/^.*const.*await.*$/gm.test(clientGuideSource), `use let instead of const when awaiting values in PhET-iO "${EXAMPLES_FILENAME}" files`);
    const renderedClientGuide = marked.parse(clientGuideSource);
    // link a stylesheet
    const clientGuideHTML = `<head>
                   <link rel='stylesheet' href='css/github-markdown.css' type='text/css'>
                   <title>${title}</title>
                 </head>
                 <body>
                 <div class="markdown-body">
                   ${renderedClientGuide}
                 </div>
                 </body>`;
    // write the output to the build directory
    grunt.file.write(destinationPath, clientGuideHTML);
};
/**
 * Support building studio. This compiles the studio modules into a runnable, and copies that over to the expected spot
 * on build.
 */ const handleStudio = /*#__PURE__*/ _async_to_generator(function*(repo, wrappersLocation, shouldTypeCheck) {
    grunt.log.verbose.writeln('building studio');
    if (shouldTypeCheck) {
        const success = yield typeCheck({
            repo: 'studio'
        });
        if (!success) {
            grunt.fail.fatal('Type checking failed');
        }
    }
    fs.writeFileSync(`${wrappersLocation}studio/${STUDIO_BUILT_FILENAME}`, (yield buildStandalone('studio', {
        stripAssertions: false,
        stripLogging: false,
        tempOutputDir: repo,
        brand: 'phet-io'
    })));
});
/**
 * Use webpack to bundle the migration processors into a compiled code string, for use in phet-io lib file.
 */ const getCompiledMigrationProcessors = /*#__PURE__*/ _async_to_generator(function*(repo, buildDir) {
    return new Promise((resolve, reject)=>{
        const migrationProcessorsFilename = `${repo}-migration-processors.js`;
        const entryPointFilename = `../chipper/dist/js/phet-io-sim-specific/repos/${repo}/js/${migrationProcessorsFilename}`;
        if (!fs.existsSync(entryPointFilename)) {
            grunt.log.verbose.writeln(`No migration processors found at ${entryPointFilename}, no processors to be bundled with ${LIB_OUTPUT_FILE}.`);
            resolve(''); // blank string because there are no processors to add.
        } else {
            // output dir must be an absolute path
            const outputDir = path.resolve(__dirname, `../../../${repo}/${buildDir}`);
            const compiler = webpack({
                module: {
                    rules: webpackBuild.getModuleRules() // Support preload-like library globals used via `import`
                },
                // We uglify as a step after this, with many custom rules. So we do NOT optimize or uglify in this step.
                optimization: {
                    minimize: false
                },
                // Simulations or runnables will have a single entry point
                entry: {
                    repo: entryPointFilename
                },
                // We output our builds to the following dir
                output: {
                    path: outputDir,
                    filename: migrationProcessorsFilename
                }
            });
            compiler.run((err, stats)=>{
                if (err || stats.hasErrors()) {
                    console.error('Migration processors webpack build errors:', stats.compilation.errors);
                    reject(err || stats.compilation.errors[0]);
                } else {
                    const jsFile = `${outputDir}/${migrationProcessorsFilename}`;
                    const js = fs.readFileSync(jsFile, 'utf-8');
                    fs.unlinkSync(jsFile);
                    resolve(js);
                }
            });
        }
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L2NvcHlTdXBwbGVtZW50YWxQaGV0aW9GaWxlcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDb3BpZXMgYWxsIHN1cHBvcnRpbmcgUGhFVC1pTyBmaWxlcywgaW5jbHVkaW5nIHdyYXBwZXJzLCBpbmRpY2VzLCBsaWIgZmlsZXMsIGV0Yy5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNYXR0IFBlbm5pbmd0b24gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IFN0YXRzIH0gZnJvbSAnd2VicGFjayc7XG5pbXBvcnQgU2ltVmVyc2lvbiBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvYnJvd3Nlci1hbmQtbm9kZS9TaW1WZXJzaW9uLmpzJztcbmltcG9ydCBkaXJuYW1lIGZyb20gJy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZGlybmFtZS5qcyc7XG5pbXBvcnQgZXhlY3V0ZSBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvY29tbW9uL2V4ZWN1dGUuanMnO1xuaW1wb3J0IHR5cGVDaGVjayBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvZ3J1bnQvdHlwZUNoZWNrLmpzJztcbmltcG9ydCBncnVudCBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvbnBtLWRlcGVuZGVuY2llcy9ncnVudC5qcyc7XG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcbmltcG9ydCBDaGlwcGVyU3RyaW5nVXRpbHMgZnJvbSAnLi4vY29tbW9uL0NoaXBwZXJTdHJpbmdVdGlscy5qcyc7XG5pbXBvcnQgY29weURpcmVjdG9yeSBmcm9tICcuLi9ncnVudC9jb3B5RGlyZWN0b3J5LmpzJztcbmltcG9ydCBtaW5pZnkgZnJvbSAnLi4vZ3J1bnQvbWluaWZ5LmpzJztcbmltcG9ydCBmb3JtYXRQaGV0aW9BUEkgZnJvbSAnLi4vcGhldC1pby9mb3JtYXRQaGV0aW9BUEkuanMnO1xuaW1wb3J0IGdlbmVyYXRlUGhldGlvTWFjcm9BUEkgZnJvbSAnLi4vcGhldC1pby9nZW5lcmF0ZVBoZXRpb01hY3JvQVBJLmpzJztcbmltcG9ydCBidWlsZFN0YW5kYWxvbmUgZnJvbSAnLi9idWlsZFN0YW5kYWxvbmUuanMnO1xuaW1wb3J0IGdldFBoZXRMaWJzIGZyb20gJy4vZ2V0UGhldExpYnMuanMnO1xuaW1wb3J0IHdlYnBhY2tCdWlsZCBmcm9tICcuL3dlYnBhY2tCdWlsZC5qcyc7XG5cbmNvbnN0IHdlYnBhY2sgPSByZXF1aXJlKCAnd2VicGFjaycgKTtcbmNvbnN0IGFyY2hpdmVyID0gcmVxdWlyZSggJ2FyY2hpdmVyJyApO1xuY29uc3QgbWFya2VkID0gcmVxdWlyZSggJ21hcmtlZCcgKTtcblxuLy8gQHRzLWV4cGVjdC1lcnJvciAtIHVudGlsIHdlIGhhdmUgXCJ0eXBlXCI6IFwibW9kdWxlXCIgaW4gb3VyIHBhY2thZ2UuanNvblxuY29uc3QgX19kaXJuYW1lID0gZGlybmFtZSggaW1wb3J0Lm1ldGEudXJsICk7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgREVESUNBVEVEX1JFUE9fV1JBUFBFUl9QUkVGSVggPSAncGhldC1pby13cmFwcGVyLSc7XG5jb25zdCBXUkFQUEVSX0NPTU1PTl9GT0xERVIgPSAncGhldC1pby13cmFwcGVycy9jb21tb24nO1xuY29uc3QgV1JBUFBFUlNfRk9MREVSID0gJ3dyYXBwZXJzLyc7IC8vIFRoZSB3cmFwcGVyIGluZGV4IGFzc3VtZXMgdGhpcyBjb25zdGFudCwgcGxlYXNlIHNlZSBwaGV0LWlvLXdyYXBwZXJzL2luZGV4L2luZGV4LmpzIGJlZm9yZSBjaGFuZ2luZ1xuXG4vLyBGb3IgUGhFVC1pTyBDbGllbnQgR3VpZGVzXG5jb25zdCBQSEVUX0lPX1NJTV9TUEVDSUZJQyA9ICcuLi9waGV0LWlvLXNpbS1zcGVjaWZpYyc7XG5jb25zdCBHVUlERVNfQ09NTU9OX0RJUiA9ICdjbGllbnQtZ3VpZGUtY29tbW9uL2NsaWVudC1ndWlkZSc7XG5cbmNvbnN0IEVYQU1QTEVTX0ZJTEVOQU1FID0gJ2V4YW1wbGVzJztcbmNvbnN0IFBIRVRfSU9fR1VJREVfRklMRU5BTUUgPSAncGhldC1pby1ndWlkZSc7XG5cbmNvbnN0IExJQl9PVVRQVVRfRklMRSA9ICdwaGV0LWlvLmpzJztcblxuLy8gVGhlc2UgZmlsZXMgYXJlIGJ1bmRsZWQgaW50byB0aGUgbGliL3BoZXQtaW8uanMgZmlsZSBiZWZvcmUgUGhFVCdzIHBoZXQtaW8gY29kZSwgYW5kIGNhbiBiZSB1c2VkIGJ5IGFueSB3cmFwcGVyXG5jb25zdCBUSElSRF9QQVJUWV9MSUJfUFJFTE9BRFMgPSBbXG4gICcuLi9zaGVycGEvbGliL3JlYWN0LTE4LjEuMC5wcm9kdWN0aW9uLm1pbi5qcycsXG4gICcuLi9zaGVycGEvbGliL3JlYWN0LWRvbS0xOC4xLjAucHJvZHVjdGlvbi5taW4uanMnLFxuICAnLi4vc2hlcnBhL2xpYi9wYWtvLTIuMC4zLm1pbi5qcycsXG4gICcuLi9zaGVycGEvbGliL2xvZGFzaC00LjE3LjQubWluLmpzJ1xuXTtcblxuLy8gcGhldC1pbyBpbnRlcm5hbCBmaWxlcyB0byBiZSBjb25zb2xpZGF0ZWQgaW50byAxIGZpbGUgYW5kIHB1YmxpY2x5IHNlcnZlZCBhcyBhIG1pbmlmaWVkIHBoZXQtaW8gbGlicmFyeS5cbi8vIE1ha2Ugc3VyZSB0byBhZGQgbmV3IGZpbGVzIHRvIHRoZSBqc2RvYyBnZW5lcmF0aW9uIGxpc3QgYmVsb3cgYWxzb1xuY29uc3QgUEhFVF9JT19MSUJfUFJFTE9BRFMgPSBbXG4gICcuLi9xdWVyeS1zdHJpbmctbWFjaGluZS9qcy9RdWVyeVN0cmluZ01hY2hpbmUuanMnLCAvLyBtdXN0IGJlIGZpcnN0LCBvdGhlciB0eXBlcyB1c2UgdGhpc1xuICAnLi4vYXNzZXJ0L2pzL2Fzc2VydC5qcycsXG4gICcuLi90YW5kZW0vanMvUGhldGlvSURVdGlscy5qcydcbl07XG5cbmNvbnN0IExJQl9QUkVMT0FEUyA9IFRISVJEX1BBUlRZX0xJQl9QUkVMT0FEUy5jb25jYXQoIFBIRVRfSU9fTElCX1BSRUxPQURTICk7XG5cbi8vIEFkZGl0aW9uYWwgbGlicmFyaWVzIGFuZCB0aGlyZCBwYXJ0eSBmaWxlcyB0aGF0IGFyZSB1c2VkIGJ5IHNvbWUgcGhldC1pbyB3cmFwcGVycywgY29waWVkIHRvIGEgY29udHJpYi8gZGlyZWN0b3J5LlxuLy8gVGhlc2UgYXJlIG5vdCBidW5kbGVkIHdpdGggdGhlIGxpYiBmaWxlIHRvIHJlZHVjZSB0aGUgc2l6ZSBvZiB0aGUgY2VudHJhbCBkZXBlbmRlbmN5IG9mIFBoRVQtaU8gd3JhcHBlcnMuXG5jb25zdCBDT05UUklCX0ZJTEVTID0gW1xuICAnLi4vc2hlcnBhL2xpYi91YS1wYXJzZXItMC43LjIxLm1pbi5qcycsXG4gICcuLi9zaGVycGEvbGliL2Jvb3RzdHJhcC0yLjIuMi5qcycsXG4gICcuLi9zaGVycGEvbGliL2ZvbnQtYXdlc29tZS00LjUuMCcsXG4gICcuLi9zaGVycGEvbGliL2pxdWVyeS0yLjEuMC5taW4uanMnLFxuICAnLi4vc2hlcnBhL2xpYi9qcXVlcnktdWktMS44LjI0Lm1pbi5qcycsXG4gICcuLi9zaGVycGEvbGliL2QzLTQuMi4yLmpzJyxcbiAgJy4uL3NoZXJwYS9saWIvanNvbmRpZmZwYXRjaC12MC4zLjExLnVtZC5qcycsXG4gICcuLi9zaGVycGEvbGliL2pzb25kaWZmcGF0Y2gtdjAuMy4xMS1hbm5vdGF0ZWQuY3NzJyxcbiAgJy4uL3NoZXJwYS9saWIvanNvbmRpZmZwYXRjaC12MC4zLjExLWh0bWwuY3NzJyxcbiAgJy4uL3NoZXJwYS9saWIvcHJpc20tMS4yMy4wLmpzJyxcbiAgJy4uL3NoZXJwYS9saWIvcHJpc20tb2thaWRpYS0xLjIzLjAuY3NzJyxcbiAgJy4uL3NoZXJwYS9saWIvY2xhcmluZXQtMC4xMi40LmpzJ1xuXTtcblxuLy8gVGhpcyBwYXRoIGlzIHVzZWQgZm9yIGpzZG9jLiBUcmFuc3BpbGF0aW9uIGhhcHBlbnMgYmVmb3JlIHdlIGdldCB0byB0aGlzIHBvaW50LiBTUiBhbmQgTUsgcmVjb2duaXplIHRoYXQgdGhpcyBmZWVsc1xuLy8gYSBiaXQgcmlza3ksIGV2ZW4gdGhvdWdoIGNvbW1lbnRzIGFyZSBjdXJyZW50bHkgcHJlc2VydmVkIGluIHRoZSBiYWJlbCB0cmFuc3BpbGUgc3RlcC4gU2VlIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzUxNzIwODk0L2lzLXRoZXJlLWFueS13YXktdG8tdXNlLWpzZG9jLXdpdGgtdHMtZmlsZXMtbWF5YmUtdHJhbnNwaWxlLXdpdGgtYmFiZWwtdGhlXG5jb25zdCB0cmFuc3BpbGVkQ2xpZW50UGF0aCA9IGAuLi9jaGlwcGVyL2Rpc3QvanMvJHtXUkFQUEVSX0NPTU1PTl9GT0xERVJ9L2pzL0NsaWVudC5qc2A7XG5cbi8vIExpc3Qgb2YgZmlsZXMgdG8gcnVuIGpzZG9jIGdlbmVyYXRpb24gd2l0aC4gVGhpcyBsaXN0IGlzIG1hbnVhbCB0byBrZWVwIGZpbGVzIGZyb20gc25lYWtpbmcgaW50byB0aGUgcHVibGljIGRvY3VtZW50YXRpb24uXG5jb25zdCBKU0RPQ19GSUxFUyA9IFtcbiAgYC4uL2NoaXBwZXIvZGlzdC9qcy8ke1dSQVBQRVJfQ09NTU9OX0ZPTERFUn0vanMvUGhldGlvQ2xpZW50LmpzYCxcbiAgdHJhbnNwaWxlZENsaWVudFBhdGgsXG4gICcuLi90YW5kZW0vanMvUGhldGlvSURVdGlscy5qcycsXG4gICcuLi9waGV0LWlvL2pzL3BoZXQtaW8taW5pdGlhbGl6ZS1nbG9iYWxzLmpzJyxcbiAgJy4uL2NoaXBwZXIvanMvYnJvd3Nlci9pbml0aWFsaXplLWdsb2JhbHMuanMnLFxuICAnLi4vY2hpcHBlci9kaXN0L2pzL3BlcmVubmlhbC1hbGlhcy9qcy9icm93c2VyLWFuZC1ub2RlL1NpbVZlcnNpb24uanMnXG5dO1xuY29uc3QgSlNET0NfUkVBRE1FX0ZJTEUgPSAnLi4vcGhldC1pby9kb2Mvd3JhcHBlci9waGV0LWlvLWRvY3VtZW50YXRpb25fUkVBRE1FLm1kJztcblxuY29uc3QgU1RVRElPX0JVSUxUX0ZJTEVOQU1FID0gJ3N0dWRpby5taW4uanMnO1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyAoIHJlcG86IHN0cmluZywgdmVyc2lvbjogc3RyaW5nLCBzaW11bGF0aW9uRGlzcGxheU5hbWU6IHN0cmluZywgcGFja2FnZU9iamVjdDogSW50ZW50aW9uYWxBbnksIGdlbmVyYXRlTWFjcm9BUElGaWxlID0gZmFsc2UsIHR5cGVDaGVjayA9IHRydWUgKTogUHJvbWlzZTx2b2lkPiA9PiB7XG5cbiAgY29uc3QgcmVwb1BoZXRMaWJzID0gZ2V0UGhldExpYnMoIHJlcG8sICdwaGV0LWlvJyApO1xuICBhc3NlcnQoIF8uZXZlcnkoIGdldFBoZXRMaWJzKCAncGhldC1pby13cmFwcGVycycgKSwgcmVwbyA9PiByZXBvUGhldExpYnMuaW5jbHVkZXMoIHJlcG8gKSApLFxuICAgICdldmVyeSBkZXBlbmRlbmN5IG9mIHBoZXQtaW8td3JhcHBlcnMgaXMgbm90IGluY2x1ZGVkIGluIHBoZXRMaWJzIG9mICcgKyByZXBvICsgJyAnICsgcmVwb1BoZXRMaWJzICsgJyAnICsgZ2V0UGhldExpYnMoICdwaGV0LWlvLXdyYXBwZXJzJyApICk7XG4gIGFzc2VydCggXy5ldmVyeSggZ2V0UGhldExpYnMoICdzdHVkaW8nICksIHJlcG8gPT4gcmVwb1BoZXRMaWJzLmluY2x1ZGVzKCByZXBvICkgKSxcbiAgICAnZXZlcnkgZGVwZW5kZW5jeSBvZiBzdHVkaW8gaXMgbm90IGluY2x1ZGVkIGluIHBoZXRMaWJzIG9mICcgKyByZXBvICsgJyAnICsgcmVwb1BoZXRMaWJzICsgJyAnICsgZ2V0UGhldExpYnMoICdzdHVkaW8nICkgKTtcblxuICAvLyBUaGlzIG11c3QgYmUgY2hlY2tlZCBhZnRlciBjb3B5U3VwcGxlbWVudGFsUGhldGlvRmlsZXMgaXMgY2FsbGVkLCBzaW5jZSBhbGwgdGhlIGltcG9ydHMgYW5kIG91dGVyIGNvZGUgaXMgcnVuIGluXG4gIC8vIGV2ZXJ5IGJyYW5kLiBEZXZlbG9wZXJzIHdpdGhvdXQgcGhldC1pbyBjaGVja2VkIG91dCBzdGlsbCBuZWVkIHRvIGJlIGFibGUgdG8gYnVpbGQuXG4gIGFzc2VydCggZnMucmVhZEZpbGVTeW5jKCB0cmFuc3BpbGVkQ2xpZW50UGF0aCApLnRvU3RyaW5nKCkuaW5jbHVkZXMoICcvKionICksICdiYWJlbCBzaG91bGQgbm90IHN0cmlwIGNvbW1lbnRzIGZyb20gdHJhbnNwaWxpbmcnICk7XG5cbiAgY29uc3Qgc2ltUmVwb1NIQSA9ICggYXdhaXQgZXhlY3V0ZSggJ2dpdCcsIFsgJ3Jldi1wYXJzZScsICdIRUFEJyBdLCBgLi4vJHtyZXBvfWAgKSApLnRyaW0oKTtcblxuICBjb25zdCBidWlsZERpciA9IGAuLi8ke3JlcG99L2J1aWxkL3BoZXQtaW8vYDtcbiAgY29uc3Qgd3JhcHBlcnNMb2NhdGlvbiA9IGAke2J1aWxkRGlyfSR7V1JBUFBFUlNfRk9MREVSfWA7XG5cbiAgY29uc3Qgc2ltVmVyc2lvbiA9IFNpbVZlcnNpb24ucGFyc2UoIHZlcnNpb24gKTtcbiAgY29uc3QgbGF0ZXN0VmVyc2lvbiA9IGAke3NpbVZlcnNpb24ubWFqb3J9LiR7c2ltVmVyc2lvbi5taW5vcn1gO1xuXG4gIGNvbnN0IHN0YW5kYXJkUGhldGlvV3JhcHBlclRlbXBsYXRlU2tlbGV0b24gPSBmcy5yZWFkRmlsZVN5bmMoICcuLi9waGV0LWlvLXdyYXBwZXJzL2NvbW1vbi9odG1sL3N0YW5kYXJkUGhldGlvV3JhcHBlclRlbXBsYXRlU2tlbGV0b24uaHRtbCcsICd1dGY4JyApO1xuICBjb25zdCBjdXN0b21QaGV0aW9XcmFwcGVyVGVtcGxhdGVTa2VsZXRvbiA9IGZzLnJlYWRGaWxlU3luYyggJy4uL3BoZXQtaW8td3JhcHBlcnMvY29tbW9uL2h0bWwvY3VzdG9tUGhldGlvV3JhcHBlclRlbXBsYXRlU2tlbGV0b24uaHRtbCcsICd1dGY4JyApO1xuXG4gIGFzc2VydCggIXN0YW5kYXJkUGhldGlvV3JhcHBlclRlbXBsYXRlU2tlbGV0b24uaW5jbHVkZXMoICdgJyApLCAnVGhlIHRlbXBsYXRlcyBjYW5ub3QgY29udGFpbiBiYWNrdGlja3MgZHVlIHRvIGhvdyB0aGUgdGVtcGxhdGVzIGFyZSBwYXNzZWQgdGhyb3VnaCBiZWxvdycgKTtcbiAgYXNzZXJ0KCAhY3VzdG9tUGhldGlvV3JhcHBlclRlbXBsYXRlU2tlbGV0b24uaW5jbHVkZXMoICdgJyApLCAnVGhlIHRlbXBsYXRlcyBjYW5ub3QgY29udGFpbiBiYWNrdGlja3MgZHVlIHRvIGhvdyB0aGUgdGVtcGxhdGVzIGFyZSBwYXNzZWQgdGhyb3VnaCBiZWxvdycgKTtcblxuICAvLyBUaGUgZmlsdGVyIHRoYXQgd2UgcnVuIGV2ZXJ5IHBoZXQtaW8gd3JhcHBlciBmaWxlIHRocm91Z2ggdG8gdHJhbnNmb3JtIGRldiBjb250ZW50IGludG8gYnVpbHQgY29udGVudC4gVGhpcyBtYWlubHlcbiAgLy8gaW52b2x2ZXMgbG90cyBvZiBoYXJkIGNvZGVkIGNvcHkgcmVwbGFjZSBvZiB0ZW1wbGF0ZSBzdHJpbmdzIGFuZCBtYXJrZXIgdmFsdWVzLlxuICBjb25zdCBmaWx0ZXJXcmFwcGVyID0gKCBhYnNQYXRoOiBzdHJpbmcsIGNvbnRlbnRzOiBzdHJpbmcgKSA9PiB7XG4gICAgY29uc3Qgb3JpZ2luYWxDb250ZW50cyA9IGAke2NvbnRlbnRzfWA7XG5cbiAgICBjb25zdCBpc1dyYXBwZXJJbmRleCA9IGFic1BhdGguaW5jbHVkZXMoICdpbmRleC9pbmRleC5odG1sJyApO1xuXG4gICAgLy8gRm9yIGluZm8gYWJvdXQgTElCX09VVFBVVF9GSUxFLCBzZWUgaGFuZGxlTGliKClcbiAgICBjb25zdCBwYXRoVG9MaWIgPSBgbGliLyR7TElCX09VVFBVVF9GSUxFfWA7XG5cbiAgICBpZiAoIGFic1BhdGguaW5jbHVkZXMoICcuaHRtbCcgKSApIHtcblxuICAgICAgLy8gY2hhbmdlIHRoZSBwYXRocyBvZiBzaGVycGEgZmlsZXMgdG8gcG9pbnQgdG8gdGhlIGNvbnRyaWIvIGZvbGRlclxuICAgICAgQ09OVFJJQl9GSUxFUy5mb3JFYWNoKCBmaWxlUGF0aCA9PiB7XG5cbiAgICAgICAgLy8gTm8gbmVlZCB0byBkbyB0aGlzIGlzIHRoaXMgZmlsZSBkb2Vzbid0IGhhdmUgdGhpcyBjb250cmliIGltcG9ydCBpbiBpdC5cbiAgICAgICAgaWYgKCBjb250ZW50cy5pbmNsdWRlcyggZmlsZVBhdGggKSApIHtcblxuICAgICAgICAgIGNvbnN0IGZpbGVQYXRoUGFydHMgPSBmaWxlUGF0aC5zcGxpdCggJy8nICk7XG5cbiAgICAgICAgICAvLyBJZiB0aGUgZmlsZSBpcyBpbiBhIGRlZGljYXRlZCB3cmFwcGVyIHJlcG8sIHRoZW4gaXQgaXMgb25lIGxldmVsIGhpZ2hlciBpbiB0aGUgZGlyIHRyZWUsIGFuZCBuZWVkcyAxIGxlc3Mgc2V0IG9mIGRvdHMuXG4gICAgICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvLXdyYXBwZXJzL2lzc3Vlcy8xNyBmb3IgbW9yZSBpbmZvLiBUaGlzIGlzIGhvcGVmdWxseSBhIHRlbXBvcmFyeSB3b3JrYXJvdW5kXG4gICAgICAgICAgY29uc3QgbmVlZHNFeHRyYURvdHMgPSBhYnNQYXRoLmluY2x1ZGVzKCBERURJQ0FURURfUkVQT19XUkFQUEVSX1BSRUZJWCApO1xuICAgICAgICAgIGNvbnN0IGZpbGVOYW1lID0gZmlsZVBhdGhQYXJ0c1sgZmlsZVBhdGhQYXJ0cy5sZW5ndGggLSAxIF07XG4gICAgICAgICAgY29uc3QgY29udHJpYkZpbGVOYW1lID0gYGNvbnRyaWIvJHtmaWxlTmFtZX1gO1xuICAgICAgICAgIGxldCBwYXRoVG9Db250cmliID0gbmVlZHNFeHRyYURvdHMgPyBgLi4vLi4vJHtjb250cmliRmlsZU5hbWV9YCA6IGAuLi8ke2NvbnRyaWJGaWxlTmFtZX1gO1xuXG4gICAgICAgICAgLy8gVGhlIHdyYXBwZXIgaW5kZXggaXMgYSBkaWZmZXJlbnQgY2FzZSBiZWNhdXNlIGl0IGlzIHBsYWNlZCBhdCB0aGUgdG9wIGxldmVsIG9mIHRoZSBidWlsZCBkaXIuXG4gICAgICAgICAgaWYgKCBpc1dyYXBwZXJJbmRleCApIHtcblxuICAgICAgICAgICAgcGF0aFRvQ29udHJpYiA9IGNvbnRyaWJGaWxlTmFtZTtcbiAgICAgICAgICAgIGZpbGVQYXRoID0gYC4uLyR7ZmlsZVBhdGh9YDsgLy8gZmlsZVBhdGggaGFzIG9uZSBsZXNzIHNldCBvZiByZWxhdGl2ZSB0aGFuIGFyZSBhY3R1YWxseSBpbiB0aGUgaW5kZXguaHRtbCBmaWxlLlxuICAgICAgICAgIH1cbiAgICAgICAgICBjb250ZW50cyA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBjb250ZW50cywgZmlsZVBhdGgsIHBhdGhUb0NvbnRyaWIgKTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuXG4gICAgICBjb25zdCBpbmNsdWRlc0VsZW1lbnQgPSAoIGxpbmU6IHN0cmluZywgYXJyYXk6IHN0cmluZ1tdICkgPT4gISFhcnJheS5maW5kKCBlbGVtZW50ID0+IGxpbmUuaW5jbHVkZXMoIGVsZW1lbnQgKSApO1xuXG4gICAgICAvLyBSZW1vdmUgZmlsZXMgbGlzdGVkIGFzIHByZWxvYWRzIHRvIHRoZSBwaGV0LWlvIGxpYiBmaWxlLlxuICAgICAgY29udGVudHMgPSBjb250ZW50cy5zcGxpdCggL1xccj9cXG4vICkuZmlsdGVyKCBsaW5lID0+ICFpbmNsdWRlc0VsZW1lbnQoIGxpbmUsIExJQl9QUkVMT0FEUyApICkuam9pbiggJ1xcbicgKTtcblxuICAgICAgLy8gRGVsZXRlIHRoZSBpbXBvcnRzIHRoZSBwaGV0LWlvLXdyYXBwZXJzLW1haW4sIGFzIGl0IHdpbGwgYmUgYnVuZGxlZCB3aXRoIHRoZSBwaGV0LWlvLmpzIGxpYiBmaWxlLlxuICAgICAgLy8gTVVTVCBHTyBCRUZPUkUgQkVMT1cgUkVQTEFDRTogJ3BoZXQtaW8td3JhcHBlcnMvJyAtPiAnLydcbiAgICAgIGNvbnRlbnRzID0gY29udGVudHMucmVwbGFjZShcbiAgICAgICAgLzxzY3JpcHQgdHlwZT1cIm1vZHVsZVwiIHNyYz1cIiguLlxcLykrY2hpcHBlclxcL2Rpc3RcXC9qc1xcL3BoZXQtaW8td3JhcHBlcnNcXC9qc1xcL3BoZXQtaW8td3JhcHBlcnMtbWFpbi5qc1wiPjxcXC9zY3JpcHQ+L2csIC8vICcuKicgaXMgdG8gc3VwcG9ydCBgZGF0YS1waGV0LWlvLWNsaWVudC1uYW1lYCBpbiB3cmFwcGVycyBsaWtlIFwibXVsdGlcIlxuICAgICAgICAnJyApO1xuXG4gICAgICAvLyBTdXBwb3J0IHdyYXBwZXJzIHRoYXQgdXNlIGNvZGUgZnJvbSBwaGV0LWlvLXdyYXBwZXJzXG4gICAgICBjb250ZW50cyA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBjb250ZW50cywgJy9waGV0LWlvLXdyYXBwZXJzLycsICcvJyApO1xuXG4gICAgICAvLyBEb24ndCB1c2UgQ2hpcHBlclN0cmluZ1V0aWxzIGJlY2F1c2Ugd2Ugd2FudCB0byBjYXB0dXJlIHRoZSByZWxhdGl2ZSBwYXRoIGFuZCB0cmFuc2ZlciBpdCB0byB0aGUgbmV3IHNjcmlwdC5cbiAgICAgIC8vIFRoaXMgaXMgdG8gc3VwcG9ydCBwcm92aWRpbmcgdGhlIHJlbGF0aXZlIHBhdGggdGhyb3VnaCB0aGUgYnVpbGQgaW5zdGVhZCBvZiBqdXN0IGhhcmQgY29kaW5nIGl0LlxuICAgICAgY29udGVudHMgPSBjb250ZW50cy5yZXBsYWNlKFxuICAgICAgICAvPCEtLSg8c2NyaXB0IHNyYz1cIlsuL10qXFx7XFx7UEFUSF9UT19MSUJfRklMRX19XCIuKj48XFwvc2NyaXB0PiktLT4vZywgLy8gJy4qJyBpcyB0byBzdXBwb3J0IGBkYXRhLXBoZXQtaW8tY2xpZW50LW5hbWVgIGluIHdyYXBwZXJzIGxpa2UgXCJtdWx0aVwiXG4gICAgICAgICckMScgLy8ganVzdCB1bmNvbW1lbnQsIGRvbid0IGZpbGwgaXQgaW4geWV0XG4gICAgICApO1xuXG4gICAgICBjb250ZW50cyA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBjb250ZW50cyxcbiAgICAgICAgJzwhLS17e0dPT0dMRV9BTkFMWVRJQ1MuanN9fS0tPicsXG4gICAgICAgICc8c2NyaXB0IHNyYz1cIi9hc3NldHMvanMvcGhldC1pby1nYS5qc1wiPjwvc2NyaXB0PidcbiAgICAgICk7XG4gICAgICBjb250ZW50cyA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBjb250ZW50cyxcbiAgICAgICAgJzwhLS17e0ZBVklDT04uaWNvfX0tLT4nLFxuICAgICAgICAnPGxpbmsgcmVsPVwic2hvcnRjdXQgaWNvblwiIGhyZWY9XCIvYXNzZXRzL2Zhdmljb24uaWNvXCIvPidcbiAgICAgICk7XG5cbiAgICAgIC8vIFRoZXJlIHNob3VsZCBub3QgYmUgYW55IGltcG9ydHMgb2YgUGhldGlvQ2xpZW50IGRpcmVjdGx5IGV4Y2VwdCB1c2luZyB0aGUgXCJtdWx0aS13cmFwcGVyXCIgZnVuY3Rpb25hbGl0eSBvZlxuICAgICAgLy8gcHJvdmlkaW5nIGEgP2NsaWVudE5hbWUsIGZvciB1bmJ1aWx0IG9ubHksIHNvIHdlIHJlbW92ZSBpdCBoZXJlLlxuICAgICAgY29udGVudHMgPSBjb250ZW50cy5yZXBsYWNlKFxuICAgICAgICAvXi4qXFwvY29tbW9uXFwvanNcXC9QaGV0aW9DbGllbnQuanMuKiQvbWcsXG4gICAgICAgICcnXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoIGFic1BhdGguaW5jbHVkZXMoICcuanMnICkgfHwgYWJzUGF0aC5pbmNsdWRlcyggJy5odG1sJyApICkge1xuXG4gICAgICAvLyBGaWxsIHRoZXNlIGluIGZpcnN0IHNvIHRoZSBmb2xsb3dpbmcgbGluZXMgd2lsbCBhbHNvIGhpdCB0aGUgY29udGVudCBpbiB0aGVzZSB0ZW1wbGF0ZSB2YXJzXG4gICAgICBjb250ZW50cyA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBjb250ZW50cywgJ3t7Q1VTVE9NX1dSQVBQRVJfU0tFTEVUT059fScsIGN1c3RvbVBoZXRpb1dyYXBwZXJUZW1wbGF0ZVNrZWxldG9uICk7XG4gICAgICBjb250ZW50cyA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBjb250ZW50cywgJ3t7U1RBTkRBUkRfV1JBUFBFUl9TS0VMRVRPTn19Jywgc3RhbmRhcmRQaGV0aW9XcmFwcGVyVGVtcGxhdGVTa2VsZXRvbiApO1xuXG4gICAgICAvLyBUaGUgcmVzdFxuICAgICAgY29udGVudHMgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggY29udGVudHMsICd7e1BBVEhfVE9fTElCX0ZJTEV9fScsIHBhdGhUb0xpYiApOyAvLyBUaGlzIG11c3QgYmUgYWZ0ZXIgdGhlIHNjcmlwdCByZXBsYWNlbWVudCB0aGF0IHVzZXMgdGhpcyB2YXJpYWJsZSBhYm92ZS5cbiAgICAgIGNvbnRlbnRzID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNvbnRlbnRzLCAne3tTSU1VTEFUSU9OX05BTUV9fScsIHJlcG8gKTtcbiAgICAgIGNvbnRlbnRzID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNvbnRlbnRzLCAne3tTSU1VTEFUSU9OX0RJU1BMQVlfTkFNRX19Jywgc2ltdWxhdGlvbkRpc3BsYXlOYW1lICk7XG4gICAgICBjb250ZW50cyA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBjb250ZW50cywgJ3t7U0lNVUxBVElPTl9ESVNQTEFZX05BTUVfRVNDQVBFRH19Jywgc2ltdWxhdGlvbkRpc3BsYXlOYW1lLnJlcGxhY2UoIC8nL2csICdcXFxcXFwnJyApICk7XG4gICAgICBjb250ZW50cyA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBjb250ZW50cywgJ3t7U0lNVUxBVElPTl9WRVJTSU9OX1NUUklOR319JywgdmVyc2lvbiApO1xuICAgICAgY29udGVudHMgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggY29udGVudHMsICd7e1NJTVVMQVRJT05fTEFURVNUX1ZFUlNJT059fScsIGxhdGVzdFZlcnNpb24gKTtcbiAgICAgIGNvbnRlbnRzID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNvbnRlbnRzLCAne3tTSU1VTEFUSU9OX0lTX0JVSUxUfX0nLCAndHJ1ZScgKTtcbiAgICAgIGNvbnRlbnRzID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNvbnRlbnRzLCAne3tQSEVUX0lPX0xJQl9SRUxBVElWRV9QQVRIfX0nLCBwYXRoVG9MaWIgKTtcbiAgICAgIGNvbnRlbnRzID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNvbnRlbnRzLCAne3tCdWlsdCBBUEkgRG9jcyBub3QgYXZhaWxhYmxlIGluIHVuYnVpbHQgbW9kZX19JywgJ0FQSSBEb2NzJyApO1xuXG4gICAgICAvLyBwaGV0LWlvLXdyYXBwZXJzL2NvbW1vbiB3aWxsIGJlIGluIHRoZSB0b3AgbGV2ZWwgb2Ygd3JhcHBlcnMvIGluIHRoZSBidWlsZCBkaXJlY3RvcnlcbiAgICAgIGNvbnRlbnRzID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNvbnRlbnRzLCBgJHtXUkFQUEVSX0NPTU1PTl9GT0xERVJ9L2AsICdjb21tb24vJyApO1xuICAgIH1cblxuICAgIGlmICggaXNXcmFwcGVySW5kZXggKSB7XG4gICAgICBjb25zdCBnZXRHdWlkZVJvd1RleHQgPSAoIGZpbGVOYW1lOiBzdHJpbmcsIGxpbmtUZXh0OiBzdHJpbmcsIGRlc2NyaXB0aW9uOiBzdHJpbmcgKSA9PiB7XG4gICAgICAgIHJldHVybiBgPHRyPlxuICAgICAgICA8dGQ+PGEgaHJlZj1cImRvYy9ndWlkZXMvJHtmaWxlTmFtZX0uaHRtbFwiPiR7bGlua1RleHR9PC9hPlxuICAgICAgICA8L3RkPlxuICAgICAgICA8dGQ+JHtkZXNjcmlwdGlvbn08L3RkPlxuICAgICAgPC90cj5gO1xuICAgICAgfTtcblxuICAgICAgLy8gVGhlIHBoZXQtaW8tZ3VpZGUgaXMgbm90IHNpbS1zcGVjaWZpYywgc28gYWx3YXlzIGNyZWF0ZSBpdC5cbiAgICAgIGNvbnRlbnRzID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNvbnRlbnRzLCAne3tQSEVUX0lPX0dVSURFX1JPV319JyxcbiAgICAgICAgZ2V0R3VpZGVSb3dUZXh0KCBQSEVUX0lPX0dVSURFX0ZJTEVOQU1FLCAnUGhFVC1pTyBHdWlkZScsXG4gICAgICAgICAgJ0RvY3VtZW50YXRpb24gZm9yIGluc3RydWN0aW9uYWwgZGVzaWduZXJzIGFib3V0IGJlc3QgcHJhY3RpY2VzIGZvciBzaW11bGF0aW9uIGN1c3RvbWl6YXRpb24gd2l0aCBQaEVULWlPIFN0dWRpby4nICkgKTtcblxuXG4gICAgICBjb25zdCBleGFtcGxlUm93Q29udGVudHMgPSBmcy5leGlzdHNTeW5jKCBgJHtQSEVUX0lPX1NJTV9TUEVDSUZJQ30vcmVwb3MvJHtyZXBvfS8ke0VYQU1QTEVTX0ZJTEVOQU1FfS5tZGAgKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRHdWlkZVJvd1RleHQoIEVYQU1QTEVTX0ZJTEVOQU1FLCAnRXhhbXBsZXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUHJvdmlkZXMgaW5zdHJ1Y3Rpb25zIGFuZCB0aGUgc3BlY2lmaWMgcGhldGlvSURzIGZvciBjdXN0b21pemluZyB0aGUgc2ltdWxhdGlvbi4nICkgOiAnJztcbiAgICAgIGNvbnRlbnRzID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNvbnRlbnRzLCAne3tFWEFNUExFU19ST1d9fScsIGV4YW1wbGVSb3dDb250ZW50cyApO1xuICAgIH1cblxuICAgIC8vIFNwZWNpYWwgaGFuZGxpbmcgZm9yIHN0dWRpbyBwYXRocyBzaW5jZSBpdCBpcyBub3QgbmVzdGVkIHVuZGVyIHBoZXQtaW8td3JhcHBlcnNcbiAgICBpZiAoIGFic1BhdGguaW5jbHVkZXMoICdzdHVkaW8vaW5kZXguaHRtbCcgKSApIHtcbiAgICAgIGNvbnRlbnRzID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNvbnRlbnRzLCAnPHNjcmlwdCBzcmM9XCIuLi9jb250cmliLycsICc8c2NyaXB0IHNyYz1cIi4uLy4uL2NvbnRyaWIvJyApO1xuICAgICAgY29udGVudHMgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggY29udGVudHMsICc8c2NyaXB0IHR5cGU9XCJtb2R1bGVcIiBzcmM9XCIuLi9jaGlwcGVyL2Rpc3QvanMvc3R1ZGlvL2pzL3N0dWRpby1tYWluLmpzXCI+PC9zY3JpcHQ+JyxcbiAgICAgICAgYDxzY3JpcHQgc3JjPVwiLi8ke1NUVURJT19CVUlMVF9GSUxFTkFNRX1cIj48L3NjcmlwdD5gICk7XG5cbiAgICAgIGNvbnRlbnRzID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNvbnRlbnRzLCAne3tQSEVUX0lPX0dVSURFX0xJTkt9fScsIGAuLi8uLi9kb2MvZ3VpZGVzLyR7UEhFVF9JT19HVUlERV9GSUxFTkFNRX0uaHRtbGAgKTtcbiAgICAgIGNvbnRlbnRzID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNvbnRlbnRzLCAne3tFWEFNUExFU19MSU5LfX0nLCBgLi4vLi4vZG9jL2d1aWRlcy8ke0VYQU1QTEVTX0ZJTEVOQU1FfS5odG1sYCApO1xuICAgIH1cblxuICAgIC8vIENvbGxhcHNlID4xIGJsYW5rIGxpbmVzIGluIGh0bWwgZmlsZXMuICBUaGlzIGhlbHBzIGFzIGEgcG9zdHByb2Nlc3Npbmcgc3RlcCBhZnRlciByZW1vdmluZyBsaW5lcyB3aXRoIDxzY3JpcHQ+IHRhZ3NcbiAgICBpZiAoIGFic1BhdGguZW5kc1dpdGgoICcuaHRtbCcgKSApIHtcbiAgICAgIGNvbnN0IGxpbmVzID0gY29udGVudHMuc3BsaXQoIC9cXHI/XFxuLyApO1xuICAgICAgY29uc3QgcHJ1bmVkID0gW107XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgaWYgKCBpID49IDEgJiZcbiAgICAgICAgICAgICBsaW5lc1sgaSAtIDEgXS50cmltKCkubGVuZ3RoID09PSAwICYmXG4gICAgICAgICAgICAgbGluZXNbIGkgXS50cmltKCkubGVuZ3RoID09PSAwICkge1xuXG4gICAgICAgICAgLy8gc2tpcCByZWR1bmRhbnQgYmxhbmsgbGluZVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHBydW5lZC5wdXNoKCBsaW5lc1sgaSBdICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnRlbnRzID0gcHJ1bmVkLmpvaW4oICdcXG4nICk7XG4gICAgfVxuXG4gICAgaWYgKCBjb250ZW50cyAhPT0gb3JpZ2luYWxDb250ZW50cyApIHtcbiAgICAgIHJldHVybiBjb250ZW50cztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDsgLy8gc2lnbmlmeSBubyBjaGFuZ2UgKGhlbHBzIGZvciBpbWFnZXMpXG4gICAgfVxuICB9O1xuXG4gIC8vIGEgbGlzdCBvZiB0aGUgcGhldC1pbyB3cmFwcGVycyB0aGF0IGFyZSBidWlsdCB3aXRoIHRoZSBwaGV0LWlvIHNpbVxuICBjb25zdCB3cmFwcGVycyA9IGZzLnJlYWRGaWxlU3luYyggJy4uL3BlcmVubmlhbC1hbGlhcy9kYXRhL3dyYXBwZXJzJywgJ3V0Zi04JyApLnRyaW0oKS5zcGxpdCggJ1xcbicgKS5tYXAoIHdyYXBwZXJzID0+IHdyYXBwZXJzLnRyaW0oKSApO1xuXG4gIC8vIEZpbGVzIGFuZCBkaXJlY3RvcmllcyBmcm9tIHdyYXBwZXIgZm9sZGVycyB0aGF0IHdlIGRvbid0IHdhbnQgdG8gY29weVxuICBjb25zdCB3cmFwcGVyc1VuYWxsb3dlZCA9IFsgJy5naXQnLCAnUkVBRE1FLm1kJywgJy5naXRpZ25vcmUnLCAnbm9kZV9tb2R1bGVzJywgJ3BhY2thZ2UuanNvbicsICdidWlsZCcgXTtcblxuICBjb25zdCBsaWJGaWxlTmFtZXMgPSBQSEVUX0lPX0xJQl9QUkVMT0FEUy5tYXAoIGZpbGVQYXRoID0+IHtcbiAgICBjb25zdCBwYXJ0cyA9IGZpbGVQYXRoLnNwbGl0KCAnLycgKTtcbiAgICByZXR1cm4gcGFydHNbIHBhcnRzLmxlbmd0aCAtIDEgXTtcbiAgfSApO1xuXG4gIC8vIERvbid0IGNvcHkgb3ZlciB0aGUgZmlsZXMgdGhhdCBhcmUgaW4gdGhlIGxpYiBmaWxlLCB0aGlzIHdheSB3ZSBjYW4gY2F0Y2ggd3JhcHBlciBidWdzIHRoYXQgYXJlIG5vdCBwb2ludGluZyB0byB0aGUgbGliLlxuICBjb25zdCBmdWxsVW5hbGxvd2VkTGlzdCA9IHdyYXBwZXJzVW5hbGxvd2VkLmNvbmNhdCggbGliRmlsZU5hbWVzICk7XG5cbiAgLy8gd3JhcHBpbmcgZnVuY3Rpb24gZm9yIGNvcHlpbmcgdGhlIHdyYXBwZXJzIHRvIHRoZSBidWlsZCBkaXJcbiAgY29uc3QgY29weVdyYXBwZXIgPSAoIHNyYzogc3RyaW5nLCBkZXN0OiBzdHJpbmcsIHdyYXBwZXI6IHN0cmluZyB8IG51bGwsIHdyYXBwZXJOYW1lOiBzdHJpbmcgfCBudWxsICkgPT4ge1xuXG4gICAgY29uc3Qgd3JhcHBlckZpbHRlcldpdGhOYW1lRmlsdGVyID0gKCBhYnNQYXRoOiBzdHJpbmcsIGNvbnRlbnRzOiBzdHJpbmcgKSA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSBmaWx0ZXJXcmFwcGVyKCBhYnNQYXRoLCBjb250ZW50cyApO1xuXG4gICAgICAvLyBTdXBwb3J0IGxvYWRpbmcgcmVsYXRpdmUtcGF0aCByZXNvdXJjZXMsIGxpa2VcbiAgICAgIC8veyB1cmw6ICcuLi9waGV0LWlvLXdyYXBwZXItbXktd3JhcHBlci9zb3VuZHMvcHJlY2lwaXRhdGUtY2hpbWVzLXYxLXNob3J0ZXIubXAzJyB9XG4gICAgICAvLyAtLT5cbiAgICAgIC8veyB1cmw6ICd3cmFwcGVycy9teS13cmFwcGVyL3NvdW5kcy9wcmVjaXBpdGF0ZS1jaGltZXMtdjEtc2hvcnRlci5tcDMnIH1cbiAgICAgIGlmICggd3JhcHBlciAmJiB3cmFwcGVyTmFtZSAmJiByZXN1bHQgKSB7XG4gICAgICAgIHJldHVybiBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggcmVzdWx0LCBgLi4vJHt3cmFwcGVyfS9gLCBgd3JhcHBlcnMvJHt3cmFwcGVyTmFtZX0vYCApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICAgIGNvcHlEaXJlY3RvcnkoIHNyYywgZGVzdCwgd3JhcHBlckZpbHRlcldpdGhOYW1lRmlsdGVyLCB7XG4gICAgICBleGNsdWRlOiBmdWxsVW5hbGxvd2VkTGlzdCxcbiAgICAgIG1pbmlmeUpTOiB0cnVlLFxuICAgICAgbWluaWZ5T3B0aW9uczoge1xuICAgICAgICBzdHJpcEFzc2VydGlvbnM6IGZhbHNlXG4gICAgICB9XG4gICAgfSApO1xuICB9O1xuXG4gIC8vIE1ha2Ugc3VyZSB0byBjb3B5IHRoZSBwaGV0LWlvLXdyYXBwZXJzIGNvbW1vbiB3cmFwcGVyIGNvZGUgdG9vLlxuICB3cmFwcGVycy5wdXNoKCBXUkFQUEVSX0NPTU1PTl9GT0xERVIgKTtcblxuICAvLyBBZGQgc2ltLXNwZWNpZmljIHdyYXBwZXJzXG4gIGxldCBzaW1TcGVjaWZpY1dyYXBwZXJzOiBzdHJpbmdbXTtcbiAgdHJ5IHtcbiAgICBzaW1TcGVjaWZpY1dyYXBwZXJzID0gZnMucmVhZGRpclN5bmMoIGAuLi9waGV0LWlvLXNpbS1zcGVjaWZpYy9yZXBvcy8ke3JlcG99L3dyYXBwZXJzL2AsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9IClcbiAgICAgIC5maWx0ZXIoIGRpcmVudCA9PiBkaXJlbnQuaXNEaXJlY3RvcnkoKSApXG4gICAgICAubWFwKCBkaXJlbnQgPT4gYHBoZXQtaW8tc2ltLXNwZWNpZmljL3JlcG9zLyR7cmVwb30vd3JhcHBlcnMvJHtkaXJlbnQubmFtZX1gICk7XG4gIH1cbiAgY2F0Y2goIGUgKSB7XG4gICAgc2ltU3BlY2lmaWNXcmFwcGVycyA9IFtdO1xuICB9XG5cbiAgd3JhcHBlcnMucHVzaCggLi4uc2ltU3BlY2lmaWNXcmFwcGVycyApO1xuXG5cbiAgY29uc3QgYWRkaXRpb25hbFdyYXBwZXJzOiBzdHJpbmdbXSA9IHBhY2thZ2VPYmplY3QucGhldCAmJiBwYWNrYWdlT2JqZWN0LnBoZXRbICdwaGV0LWlvJyBdICYmIHBhY2thZ2VPYmplY3QucGhldFsgJ3BoZXQtaW8nIF0ud3JhcHBlcnMgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFja2FnZU9iamVjdC5waGV0WyAncGhldC1pbycgXS53cmFwcGVycyA6IFtdO1xuXG4gIC8vIHBoZXQtaW8tc2ltLXNwZWNpZmljIHdyYXBwZXJzIGFyZSBhdXRvbWF0aWNhbGx5IGFkZGVkIGFib3ZlXG4gIHdyYXBwZXJzLnB1c2goIC4uLmFkZGl0aW9uYWxXcmFwcGVycy5maWx0ZXIoIHggPT4gIXguaW5jbHVkZXMoICdwaGV0LWlvLXNpbS1zcGVjaWZpYycgKSApICk7XG5cbiAgd3JhcHBlcnMuZm9yRWFjaCggd3JhcHBlciA9PiB7XG5cbiAgICBjb25zdCB3cmFwcGVyUGFydHMgPSB3cmFwcGVyLnNwbGl0KCAnLycgKTtcblxuICAgIC8vIGVpdGhlciB0YWtlIHRoZSBsYXN0IHBhdGggcGFydCwgb3IgdGFrZSB0aGUgZmlyc3QgKHJlcG8gbmFtZSkgYW5kIHJlbW92ZSB0aGUgd3JhcHBlciBwcmVmaXhcbiAgICBjb25zdCB3cmFwcGVyTmFtZSA9IHdyYXBwZXJQYXJ0cy5sZW5ndGggPiAxID8gd3JhcHBlclBhcnRzWyB3cmFwcGVyUGFydHMubGVuZ3RoIC0gMSBdIDogd3JhcHBlclBhcnRzWyAwIF0ucmVwbGFjZSggREVESUNBVEVEX1JFUE9fV1JBUFBFUl9QUkVGSVgsICcnICk7XG5cbiAgICAvLyBDb3B5IHRoZSB3cmFwcGVyIGludG8gdGhlIGJ1aWxkIGRpciAvd3JhcHBlcnMvLCBleGNsdWRlIHRoZSBleGNsdWRlZCBsaXN0XG4gICAgY29weVdyYXBwZXIoIGAuLi8ke3dyYXBwZXJ9YCwgYCR7d3JhcHBlcnNMb2NhdGlvbn0ke3dyYXBwZXJOYW1lfWAsIHdyYXBwZXIsIHdyYXBwZXJOYW1lICk7XG4gIH0gKTtcblxuICAvLyBDb3B5IHRoZSB3cmFwcGVyIGluZGV4IGludG8gdGhlIHRvcCBsZXZlbCBvZiB0aGUgYnVpbGQgZGlyLCBleGNsdWRlIHRoZSBleGNsdWRlZCBsaXN0XG4gIGNvcHlXcmFwcGVyKCAnLi4vcGhldC1pby13cmFwcGVycy9pbmRleCcsIGAke2J1aWxkRGlyfWAsIG51bGwsIG51bGwgKTtcblxuICAvLyBDcmVhdGUgdGhlIGxpYiBmaWxlIHRoYXQgaXMgbWluaWZpZWQgYW5kIHB1YmxpY2x5IGF2YWlsYWJsZSB1bmRlciB0aGUgL2xpYiBmb2xkZXIgb2YgdGhlIGJ1aWxkXG4gIGF3YWl0IGhhbmRsZUxpYiggcmVwbywgYnVpbGREaXIsIHR5cGVDaGVjaywgZmlsdGVyV3JhcHBlciApO1xuXG4gIC8vIENyZWF0ZSB0aGUgemlwcGVkIGZpbGUgdGhhdCBob2xkcyBhbGwgbmVlZGVkIGl0ZW1zIHRvIHJ1biBQaEVULWlPIG9mZmxpbmUuIE5PVEU6IHRoaXMgbXVzdCBoYXBwZW4gYWZ0ZXIgY29weWluZyB3cmFwcGVyXG4gIGF3YWl0IGhhbmRsZU9mZmxpbmVBcnRpZmFjdCggYnVpbGREaXIsIHJlcG8sIHZlcnNpb24gKTtcblxuICAvLyBDcmVhdGUgdGhlIGNvbnRyaWIgZm9sZGVyIGFuZCBhZGQgdG8gaXQgdGhpcmQgcGFydHkgbGlicmFyaWVzIHVzZWQgYnkgd3JhcHBlcnMuXG4gIGhhbmRsZUNvbnRyaWIoIGJ1aWxkRGlyICk7XG5cbiAgLy8gQ3JlYXRlIHRoZSByZW5kZXJlZCBqc2RvYyBpbiB0aGUgYGRvY2AgZm9sZGVyXG4gIGF3YWl0IGhhbmRsZUpTRE9DKCBidWlsZERpciApO1xuXG4gIC8vIGNyZWF0ZSB0aGUgY2xpZW50IGd1aWRlc1xuICBoYW5kbGVDbGllbnRHdWlkZXMoIHJlcG8sIHNpbXVsYXRpb25EaXNwbGF5TmFtZSwgYnVpbGREaXIsIHZlcnNpb24sIHNpbVJlcG9TSEEgKTtcblxuICBhd2FpdCBoYW5kbGVTdHVkaW8oIHJlcG8sIHdyYXBwZXJzTG9jYXRpb24sIHR5cGVDaGVjayApO1xuXG4gIGlmICggZ2VuZXJhdGVNYWNyb0FQSUZpbGUgKSB7XG4gICAgY29uc3QgZnVsbEFQSSA9ICggYXdhaXQgZ2VuZXJhdGVQaGV0aW9NYWNyb0FQSSggWyByZXBvIF0sIHtcbiAgICAgIGZyb21CdWlsdFZlcnNpb246IHRydWVcbiAgICB9ICkgKVsgcmVwbyBdO1xuICAgIGFzc2VydCggZnVsbEFQSSwgJ0Z1bGwgQVBJIGV4cGVjdGVkIGJ1dCBub3QgY3JlYXRlZCBmcm9tIHB1cHBldGVlciBzdGVwLCBsaWtlbHkgY2F1c2VkIGJ5IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xMDIyLicgKTtcbiAgICBncnVudC5maWxlLndyaXRlKCBgJHtidWlsZERpcn0ke3JlcG99LXBoZXQtaW8tYXBpLmpzb25gLCBmb3JtYXRQaGV0aW9BUEkoIGZ1bGxBUEkgKSApO1xuICB9XG5cbiAgLy8gVGhlIG5lc3RlZCBpbmRleCB3cmFwcGVyIHdpbGwgYmUgYnJva2VuIG9uIGJ1aWxkLCBzbyBnZXQgcmlkIG9mIGl0IGZvciBjbGFyaXR5XG4gIGZzLnJtU3luYyggYCR7d3JhcHBlcnNMb2NhdGlvbn1pbmRleC9gLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9ICk7XG59O1xuXG4vKipcbiAqIEdpdmVuIHRoZSBsaXN0IG9mIGxpYiBmaWxlcywgYXBwbHkgYSBmaWx0ZXIgZnVuY3Rpb24gdG8gdGhlbS4gVGhlbiBtaW5pZnkgdGhlbSBhbmQgY29uc29saWRhdGUgaW50byBhIHNpbmdsZSBzdHJpbmcuXG4gKiBGaW5hbGx5LCB3cml0ZSB0aGVtIHRvIHRoZSBidWlsZCBkaXIgd2l0aCBhIGxpY2Vuc2UgcHJlcGVuZGVkLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vaXNzdWVzLzM1M1xuXG4gKiBAcGFyYW0gcmVwb1xuICogQHBhcmFtIGJ1aWxkRGlyXG4gKiBAcGFyYW0gdHlwZUNoZWNrXG4gKiBAcGFyYW0gZmlsdGVyIC0gdGhlIGZpbHRlciBmdW5jdGlvbiB1c2VkIHdoZW4gY29weWluZyBvdmVyIHdyYXBwZXIgZmlsZXMgdG8gZml4IHJlbGF0aXZlIHBhdGhzIGFuZCBzdWNoLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgSGFzIGFyZ3VtZW50cyBsaWtlIFwiZnVuY3Rpb24oYWJzUGF0aCwgY29udGVudHMpXCJcbiAqL1xuY29uc3QgaGFuZGxlTGliID0gYXN5bmMgKCByZXBvOiBzdHJpbmcsIGJ1aWxkRGlyOiBzdHJpbmcsIHNob3VsZFR5cGVDaGVjazogYm9vbGVhbiwgZmlsdGVyOiAoIGFic1BhdGg6IHN0cmluZywgY29udGVudHM6IHN0cmluZyApID0+IHN0cmluZyB8IG51bGwgKSA9PiB7XG4gIGdydW50LmxvZy52ZXJib3NlLndyaXRlbG4oIGBDcmVhdGluZyBwaGV0LWlvIGxpYiBmaWxlIGZyb206ICR7UEhFVF9JT19MSUJfUFJFTE9BRFMuam9pbiggJywgJyApfWAgKTtcbiAgZnMubWtkaXJTeW5jKCBgJHtidWlsZERpcn1saWJgLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9ICk7XG5cbiAgLy8gcGhldC13cml0dGVuIHByZWxvYWRzXG4gIGNvbnN0IHBoZXRpb0xpYkNvZGUgPSBQSEVUX0lPX0xJQl9QUkVMT0FEUy5tYXAoIGxpYkZpbGUgPT4ge1xuICAgIGNvbnN0IGNvbnRlbnRzID0gZ3J1bnQuZmlsZS5yZWFkKCBsaWJGaWxlICk7XG4gICAgY29uc3QgZmlsdGVyZWRDb250ZW50cyA9IGZpbHRlciggbGliRmlsZSwgY29udGVudHMgKTtcblxuICAgIC8vIFRoZSBmaWx0ZXIgcmV0dXJucyBudWxsIGlmIG5vdGhpbmcgY2hhbmdlc1xuICAgIHJldHVybiBmaWx0ZXJlZENvbnRlbnRzIHx8IGNvbnRlbnRzO1xuICB9ICkuam9pbiggJycgKTtcblxuICBjb25zdCBtaWdyYXRpb25Qcm9jZXNzb3JzQ29kZSA9IGF3YWl0IGdldENvbXBpbGVkTWlncmF0aW9uUHJvY2Vzc29ycyggcmVwbywgYnVpbGREaXIgKTtcbiAgY29uc3QgbWluaWZpZWRQaGV0aW9Db2RlID0gbWluaWZ5KCBgJHtwaGV0aW9MaWJDb2RlfVxcbiR7bWlncmF0aW9uUHJvY2Vzc29yc0NvZGV9YCwgeyBzdHJpcEFzc2VydGlvbnM6IGZhbHNlIH0gKTtcblxuICBpZiAoIHNob3VsZFR5cGVDaGVjayApIHtcbiAgICBjb25zdCBzdWNjZXNzID0gYXdhaXQgdHlwZUNoZWNrKCB7XG4gICAgICByZXBvOiAncGhldC1pby13cmFwcGVycydcbiAgICB9ICk7XG4gICAgaWYgKCAhc3VjY2VzcyApIHtcbiAgICAgIGdydW50LmZhaWwuZmF0YWwoICdUeXBlIGNoZWNraW5nIGZhaWxlZCcgKTtcbiAgICB9XG4gIH1cblxuICBsZXQgd3JhcHBlcnNNYWluID0gYXdhaXQgYnVpbGRTdGFuZGFsb25lKCAncGhldC1pby13cmFwcGVycycsIHtcbiAgICBzdHJpcEFzc2VydGlvbnM6IGZhbHNlLFxuICAgIHN0cmlwTG9nZ2luZzogZmFsc2UsXG4gICAgdGVtcE91dHB1dERpcjogcmVwbyxcbiAgICBicmFuZDogJ3BoZXQtaW8nLFxuXG4gICAgLy8gQXZvaWQgZ2V0dGluZyBhIDJuZCBjb3B5IG9mIHRoZSBmaWxlcyB0aGF0IGFyZSBhbHJlYWR5IGJ1bmRsZWQgaW50byB0aGUgbGliIGZpbGVcbiAgICBvbWl0UHJlbG9hZHM6IFRISVJEX1BBUlRZX0xJQl9QUkVMT0FEU1xuICB9ICk7XG5cbiAgLy8gSW4gbG9hZFdyYXBwZXJUZW1wbGF0ZSBpbiB1bmJ1aWx0IG1vZGUsIGl0IHVzZXMgcmVhZEZpbGUgdG8gZHluYW1pY2FsbHkgbG9hZCB0aGUgdGVtcGxhdGVzIGF0IHJ1bnRpbWUuXG4gIC8vIEluIGJ1aWx0IG1vZGUsIHdlIG11c3QgaW5saW5lIHRoZSB0ZW1wbGF0ZXMgaW50byB0aGUgYnVpbGQgYXJ0aWZhY3QuIFNlZSBsb2FkV3JhcHBlclRlbXBsYXRlLmpzXG4gIGFzc2VydCggd3JhcHBlcnNNYWluLmluY2x1ZGVzKCAnXCJ7e1NUQU5EQVJEX1dSQVBQRVJfU0tFTEVUT059fVwiJyApIHx8IHdyYXBwZXJzTWFpbi5pbmNsdWRlcyggJ1xcJ3t7U1RBTkRBUkRfV1JBUFBFUl9TS0VMRVRPTn19XFwnJyApLCAnVGVtcGxhdGUgdmFyaWFibGUgaXMgbWlzc2luZzogU1RBTkRBUkRfV1JBUFBFUl9TS0VMRVRPTicgKTtcbiAgYXNzZXJ0KCB3cmFwcGVyc01haW4uaW5jbHVkZXMoICdcInt7Q1VTVE9NX1dSQVBQRVJfU0tFTEVUT059fVwiJyApIHx8IHdyYXBwZXJzTWFpbi5pbmNsdWRlcyggJ1xcJ3t7Q1VTVE9NX1dSQVBQRVJfU0tFTEVUT059fVxcJycgKSwgJ1RlbXBsYXRlIHZhcmlhYmxlIGlzIG1pc3Npbmc6IENVU1RPTV9XUkFQUEVSX1NLRUxFVE9OJyApO1xuXG4gIC8vIFJvYnVzdGx5IGhhbmRsZSBkb3VibGUgb3Igc2luZ2xlIHF1b3Rlcy4gIEF0IHRoZSBtb21lbnQgaXQgaXMgZG91YmxlIHF1b3Rlcy5cbiAgLy8gYnVpbGRTdGFuZGFsb25lIHdpbGwgbWFuZ2xlIGEgdGVtcGxhdGUgc3RyaW5nIGludG8gXCJcIiBiZWNhdXNlIGl0IGhhc24ndCBiZWVuIGZpbGxlZCBpbiB5ZXQsIGJyaW5nIGl0IGJhY2sgaGVyZSAod2l0aFxuICAvLyBzdXBwb3J0IGZvciBpdCBjaGFuZ2luZyBpbiB0aGUgZnV0dXJlIGZyb20gZG91YmxlIHRvIHNpbmdsZSBxdW90ZXMpLlxuICB3cmFwcGVyc01haW4gPSB3cmFwcGVyc01haW4ucmVwbGFjZSggJ1wie3tTVEFOREFSRF9XUkFQUEVSX1NLRUxFVE9OfX1cIicsICdge3tTVEFOREFSRF9XUkFQUEVSX1NLRUxFVE9OfX1gJyApO1xuICB3cmFwcGVyc01haW4gPSB3cmFwcGVyc01haW4ucmVwbGFjZSggJ1xcJ3t7U1RBTkRBUkRfV1JBUFBFUl9TS0VMRVRPTn19XFwnJywgJ2B7e1NUQU5EQVJEX1dSQVBQRVJfU0tFTEVUT059fWAnICk7XG4gIHdyYXBwZXJzTWFpbiA9IHdyYXBwZXJzTWFpbi5yZXBsYWNlKCAnXCJ7e0NVU1RPTV9XUkFQUEVSX1NLRUxFVE9OfX1cIicsICdge3tDVVNUT01fV1JBUFBFUl9TS0VMRVRPTn19YCcgKTtcbiAgd3JhcHBlcnNNYWluID0gd3JhcHBlcnNNYWluLnJlcGxhY2UoICdcXCd7e0NVU1RPTV9XUkFQUEVSX1NLRUxFVE9OfX1cXCcnLCAnYHt7Q1VTVE9NX1dSQVBQRVJfU0tFTEVUT059fWAnICk7XG5cbiAgY29uc3QgZmlsdGVyZWRNYWluID0gZmlsdGVyKCBMSUJfT1VUUFVUX0ZJTEUsIHdyYXBwZXJzTWFpbiApO1xuXG4gIGNvbnN0IG1haW5Db3B5cmlnaHQgPSBgLy8gQ29weXJpZ2h0IDIwMDItJHtuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCl9LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbi8vIFRoaXMgUGhFVC1pTyBmaWxlIHJlcXVpcmVzIGEgbGljZW5zZVxuLy8gVVNFIFdJVEhPVVQgQSBMSUNFTlNFIEFHUkVFTUVOVCBJUyBTVFJJQ1RMWSBQUk9ISUJJVEVELlxuLy8gRm9yIGxpY2Vuc2luZywgcGxlYXNlIGNvbnRhY3QgcGhldGhlbHBAY29sb3JhZG8uZWR1YDtcblxuICBncnVudC5maWxlLndyaXRlKCBgJHtidWlsZERpcn1saWIvJHtMSUJfT1VUUFVUX0ZJTEV9YCxcbiAgICBgJHttYWluQ29weXJpZ2h0fVxuLy9cbi8vIENvbnRhaW5zIGFkZGl0aW9uYWwgY29kZSB1bmRlciB0aGUgc3BlY2lmaWVkIGxpY2Vuc2VzOlxuXG4ke1RISVJEX1BBUlRZX0xJQl9QUkVMT0FEUy5tYXAoIGNvbnRyaWJGaWxlID0+IGdydW50LmZpbGUucmVhZCggY29udHJpYkZpbGUgKSApLmpvaW4oICdcXG5cXG4nICl9XG5cbiR7bWFpbkNvcHlyaWdodH1cblxuJHttaW5pZmllZFBoZXRpb0NvZGV9XFxuJHtmaWx0ZXJlZE1haW59YCApO1xufTtcblxuLyoqXG4gKiBDb3B5IGFsbCB0aGUgdGhpcmQgcGFydHkgbGlicmFyaWVzIGZyb20gc2hlcnBhIHRvIHRoZSBidWlsZCBkaXJlY3RvcnkgdW5kZXIgdGhlICdjb250cmliJyBmb2xkZXIuXG4gKi9cbmNvbnN0IGhhbmRsZUNvbnRyaWIgPSAoIGJ1aWxkRGlyOiBzdHJpbmcgKSA9PiB7XG4gIGdydW50LmxvZy52ZXJib3NlLndyaXRlbG4oICdDcmVhdGluZyBwaGV0LWlvIGNvbnRyaWIgZm9sZGVyJyApO1xuXG4gIENPTlRSSUJfRklMRVMuZm9yRWFjaCggZmlsZVBhdGggPT4ge1xuICAgIGNvbnN0IGZpbGVQYXRoUGFydHMgPSBmaWxlUGF0aC5zcGxpdCggJy8nICk7XG4gICAgY29uc3QgZmlsZW5hbWUgPSBmaWxlUGF0aFBhcnRzWyBmaWxlUGF0aFBhcnRzLmxlbmd0aCAtIDEgXTtcblxuICAgIGdydW50LmZpbGUuY29weSggZmlsZVBhdGgsIGAke2J1aWxkRGlyfWNvbnRyaWIvJHtmaWxlbmFtZX1gICk7XG4gIH0gKTtcbn07XG5cbi8qKlxuICogQ29tYmluZSB0aGUgZmlsZXMgbmVjZXNzYXJ5IHRvIHJ1biBhbmQgaG9zdCBQaEVULWlPIGxvY2FsbHkgaW50byBhIHppcCB0aGF0IGNhbiBiZSBlYXNpbHkgZG93bmxvYWRlZCBieSB0aGUgY2xpZW50LlxuICogVGhpcyBkb2VzIG5vdCBpbmNsdWRlIGFueSBkb2N1bWVudGF0aW9uLCBvciB3cmFwcGVyIHN1aXRlIHdyYXBwZXIgZXhhbXBsZXMuXG4gKi9cbmNvbnN0IGhhbmRsZU9mZmxpbmVBcnRpZmFjdCA9IGFzeW5jICggYnVpbGREaXI6IHN0cmluZywgcmVwbzogc3RyaW5nLCB2ZXJzaW9uOiBzdHJpbmcgKTogUHJvbWlzZTx2b2lkPiA9PiB7XG5cbiAgY29uc3Qgb3V0cHV0ID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0oIGAke2J1aWxkRGlyfSR7cmVwb30tcGhldC1pby0ke3ZlcnNpb259LnppcGAgKTtcbiAgY29uc3QgYXJjaGl2ZSA9IGFyY2hpdmVyKCAnemlwJyApO1xuXG4gIGFyY2hpdmUub24oICdlcnJvcicsICggZXJyOiB1bmtub3duICkgPT4gZ3J1bnQuZmFpbC5mYXRhbCggYGVycm9yIGNyZWF0aW5nIGFyY2hpdmU6ICR7ZXJyfWAgKSApO1xuXG4gIGFyY2hpdmUucGlwZSggb3V0cHV0ICk7XG5cbiAgLy8gY29weSBvdmVyIHRoZSBsaWIgZGlyZWN0b3J5IGFuZCBpdHMgY29udGVudHMsIGFuZCBhbiBpbmRleCB0byB0ZXN0LiBOb3RlIHRoYXQgdGhlc2UgdXNlIHRoZSBmaWxlcyBmcm9tIHRoZSBidWlsZERpclxuICAvLyBiZWNhdXNlIHRoZXkgaGF2ZSBiZWVuIHBvc3QtcHJvY2Vzc2VkIGFuZCBjb250YWluIGZpbGxlZCBpbiB0ZW1wbGF0ZSB2YXJzLlxuICBhcmNoaXZlLmRpcmVjdG9yeSggYCR7YnVpbGREaXJ9bGliYCwgJ2xpYicgKTtcblxuICAvLyBUYWtlIGZyb20gYnVpbGQgZGlyZWN0b3J5IHNvIHRoYXQgaXQgaGFzIGJlZW4gZmlsdGVyZWQvbWFwcGVkIHRvIGNvcnJlY3QgcGF0aHMuXG4gIGFyY2hpdmUuZmlsZSggYCR7YnVpbGREaXJ9JHtXUkFQUEVSU19GT0xERVJ9L2NvbW1vbi9odG1sL29mZmxpbmUtZXhhbXBsZS5odG1sYCwgeyBuYW1lOiAnaW5kZXguaHRtbCcgfSApO1xuXG4gIC8vIGdldCB0aGUgYWxsIGh0bWwgYW5kIHRoZSBkZWJ1ZyB2ZXJzaW9uIHRvbywgdXNlIGBjd2RgIHNvIHRoYXQgdGhleSBhcmUgYXQgdGhlIHRvcCBsZXZlbCBvZiB0aGUgemlwLlxuICBhcmNoaXZlLmdsb2IoIGAke3JlcG99KmFsbCouaHRtbGAsIHsgY3dkOiBgJHtidWlsZERpcn1gIH0gKTtcbiAgYXJjaGl2ZS5maW5hbGl6ZSgpO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZSggcmVzb2x2ZSA9PiBvdXRwdXQub24oICdjbG9zZScsIHJlc29sdmUgKSApO1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZSBqc2RvYyBhbmQgcHV0IGl0IGluIFwiYnVpbGQvcGhldC1pby9kb2NcIlxuICovXG5jb25zdCBoYW5kbGVKU0RPQyA9IGFzeW5jICggYnVpbGREaXI6IHN0cmluZyApOiBQcm9taXNlPHZvaWQ+ID0+IHtcblxuICAvLyBNYWtlIHN1cmUgZWFjaCBmaWxlIGV4aXN0c1xuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBKU0RPQ19GSUxFUy5sZW5ndGg7IGkrKyApIHtcbiAgICBpZiAoICFmcy5leGlzdHNTeW5jKCBKU0RPQ19GSUxFU1sgaSBdICkgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGBmaWxlIGRvZXNudCBleGlzdDogJHtKU0RPQ19GSUxFU1sgaSBdfWAgKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBnZXRKU0RvY0FyZ3MgPSAoIGV4cGxhaW46IGJvb2xlYW4gKSA9PiBbXG4gICAgJy4uL2NoaXBwZXIvbm9kZV9tb2R1bGVzL2pzZG9jL2pzZG9jLmpzJyxcbiAgICAuLi4oIGV4cGxhaW4gPyBbICctWCcgXSA6IFtdICksXG4gICAgLi4uSlNET0NfRklMRVMsXG4gICAgJy1jJywgJy4uL3BoZXQtaW8vZG9jL3dyYXBwZXIvanNkb2MtY29uZmlnLmpzb24nLFxuICAgICctZCcsIGAke2J1aWxkRGlyfWRvYy9hcGlgLFxuICAgICctdCcsICcuLi9jaGlwcGVyL25vZGVfbW9kdWxlcy9kb2NkYXNoJyxcbiAgICAnLS1yZWFkbWUnLCBKU0RPQ19SRUFETUVfRklMRVxuICBdO1xuXG5cbiAgLy8gRk9SIERFQlVHR0lORyBKU0RPQzpcbiAgLy8gdW5jb21tZW50IHRoaXMgbGluZSwgYW5kIHJ1biBpdCBmcm9tIHRoZSB0b3AgbGV2ZWwgb2YgYSBzaW0gZGlyZWN0b3J5XG4gIC8vIGNvbnNvbGUubG9nKCAnbm9kZScsIGdldEpTRG9jQXJncyggZmFsc2UgKS5qb2luKCAnICcgKSApO1xuXG4gIC8vIEZpcnN0IHdlIHRyaWVkIHRvIHJ1biB0aGUganNkb2MgYmluYXJ5IGFzIHRoZSBjbWQsIGJ1dCB0aGF0IHdhc24ndCB3b3JraW5nLCBhbmQgd2FzIHF1aXRlIGZpbmlja3kuIFRoZW4gQHNhbXJlaWRcbiAgLy8gZm91bmQgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzM2NjQ4NDMvaG93LXRvLXVzZS1qc2RvYy13aXRoLWd1bHAgd2hpY2ggcmVjb21tZW5kcyB0aGUgZm9sbG93aW5nIG1ldGhvZFxuICAvLyAobm9kZSBleGVjdXRhYmxlIHdpdGgganNkb2MganMgZmlsZSlcbiAgYXdhaXQgZXhlY3V0ZSggJ25vZGUnLCBnZXRKU0RvY0FyZ3MoIGZhbHNlICksIHByb2Nlc3MuY3dkKCkgKTtcblxuICAvLyBSdW5uaW5nIHdpdGggZXhwbGFuYXRpb24gLVggYXBwZWFycyB0byBub3Qgb3V0cHV0IHRoZSBmaWxlcywgc28gd2UgaGF2ZSB0byBydW4gaXQgdHdpY2UuXG4gIGNvbnN0IGV4cGxhbmF0aW9uID0gKCBhd2FpdCBleGVjdXRlKCAnbm9kZScsIGdldEpTRG9jQXJncyggdHJ1ZSApLCBwcm9jZXNzLmN3ZCgpICkgKS50cmltKCk7XG5cbiAgLy8gQ29weSB0aGUgbG9nbyBmaWxlXG4gIGNvbnN0IGltYWdlRGlyID0gYCR7YnVpbGREaXJ9ZG9jL2ltYWdlc2A7XG4gIGlmICggIWZzLmV4aXN0c1N5bmMoIGltYWdlRGlyICkgKSB7XG4gICAgZnMubWtkaXJTeW5jKCBpbWFnZURpciApO1xuICB9XG4gIGZzLmNvcHlGaWxlU3luYyggJy4uL2JyYW5kL3BoZXQtaW8vaW1hZ2VzL2xvZ29PbldoaXRlLnBuZycsIGAke2ltYWdlRGlyfS9sb2dvLnBuZ2AgKTtcblxuICBjb25zdCBqc29uID0gZXhwbGFuYXRpb24uc3Vic3RyaW5nKCBleHBsYW5hdGlvbi5pbmRleE9mKCAnWycgKSwgZXhwbGFuYXRpb24ubGFzdEluZGV4T2YoICddJyApICsgMSApO1xuXG4gIC8vIGJhc2ljIHNhbml0eSBjaGVja3NcbiAgYXNzZXJ0KCBqc29uLmxlbmd0aCA+IDUwMDAsICdKU09OIHNlZW1zIG9kZCcgKTtcbiAgdHJ5IHtcbiAgICBKU09OLnBhcnNlKCBqc29uICk7XG4gIH1cbiAgY2F0Y2goIGUgKSB7XG4gICAgYXNzZXJ0KCBmYWxzZSwgJ0pTT04gcGFyc2luZyBmYWlsZWQnICk7XG4gIH1cblxuICBmcy53cml0ZUZpbGVTeW5jKCBgJHtidWlsZERpcn1kb2MvanNkb2MtZXhwbGFuYXRpb24uanNvbmAsIGpzb24gKTtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIHRoZSBwaGV0LWlvIGNsaWVudCBndWlkZXMgYW5kIHB1dHMgdGhlbSBpbiBgYnVpbGQvcGhldC1pby9kb2MvZ3VpZGVzL2BcbiAqL1xuY29uc3QgaGFuZGxlQ2xpZW50R3VpZGVzID0gKCByZXBvTmFtZTogc3RyaW5nLCBzaW11bGF0aW9uRGlzcGxheU5hbWU6IHN0cmluZywgYnVpbGREaXI6IHN0cmluZywgdmVyc2lvbjogc3RyaW5nLCBzaW1SZXBvU0hBOiBzdHJpbmcgKTogdm9pZCA9PiB7XG4gIGNvbnN0IGJ1aWx0Q2xpZW50R3VpZGVzT3V0cHV0RGlyID0gYCR7YnVpbGREaXJ9ZG9jL2d1aWRlcy9gO1xuICBjb25zdCBjbGllbnRHdWlkZXNTb3VyY2VSb290ID0gYCR7UEhFVF9JT19TSU1fU1BFQ0lGSUN9L3JlcG9zLyR7cmVwb05hbWV9L2A7XG4gIGNvbnN0IGNvbW1vbkRpciA9IGAke1BIRVRfSU9fU0lNX1NQRUNJRklDfS8ke0dVSURFU19DT01NT05fRElSfWA7XG5cbiAgLy8gY29weSBvdmVyIGNvbW1vbiBpbWFnZXMgYW5kIHN0eWxlc1xuICBjb3B5RGlyZWN0b3J5KCBjb21tb25EaXIsIGAke2J1aWx0Q2xpZW50R3VpZGVzT3V0cHV0RGlyfWAgKTtcblxuICAvLyBoYW5kbGUgZ2VuZXJhdGluZyBhbmQgd3JpdGluZyB0aGUgaHRtbCBmaWxlIGZvciBlYWNoIGNsaWVudCBndWlkZVxuICBnZW5lcmF0ZUFuZFdyaXRlQ2xpZW50R3VpZGUoIHJlcG9OYW1lLFxuICAgIGAke3NpbXVsYXRpb25EaXNwbGF5TmFtZX0gUGhFVC1pTyBHdWlkZWAsXG4gICAgc2ltdWxhdGlvbkRpc3BsYXlOYW1lLFxuICAgIGAke2NvbW1vbkRpcn0vJHtQSEVUX0lPX0dVSURFX0ZJTEVOQU1FfS5tZGAsXG4gICAgYCR7YnVpbHRDbGllbnRHdWlkZXNPdXRwdXREaXJ9JHtQSEVUX0lPX0dVSURFX0ZJTEVOQU1FfS5odG1sYCxcbiAgICB2ZXJzaW9uLCBzaW1SZXBvU0hBLCBmYWxzZSApO1xuICBnZW5lcmF0ZUFuZFdyaXRlQ2xpZW50R3VpZGUoIHJlcG9OYW1lLFxuICAgIGAke3NpbXVsYXRpb25EaXNwbGF5TmFtZX0gRXhhbXBsZXNgLFxuICAgIHNpbXVsYXRpb25EaXNwbGF5TmFtZSxcbiAgICBgJHtjbGllbnRHdWlkZXNTb3VyY2VSb290fSR7RVhBTVBMRVNfRklMRU5BTUV9Lm1kYCxcbiAgICBgJHtidWlsdENsaWVudEd1aWRlc091dHB1dERpcn0ke0VYQU1QTEVTX0ZJTEVOQU1FfS5odG1sYCxcbiAgICB2ZXJzaW9uLCBzaW1SZXBvU0hBLCB0cnVlICk7XG59O1xuXG4vKipcbiAqIFRha2VzIGEgbWFya2Rvd24gY2xpZW50IGd1aWRlcywgZmlsbHMgaW4gdGhlIGxpbmtzLCBhbmQgdGhlbiBnZW5lcmF0ZXMgYW5kIHdyaXRlcyBpdCBhcyBodG1sXG4gKiBAcGFyYW0gcmVwb05hbWVcbiAqIEBwYXJhbSB0aXRsZVxuICogQHBhcmFtIHNpbXVsYXRpb25EaXNwbGF5TmFtZVxuICogQHBhcmFtIG1kRmlsZVBhdGggLSB0byBnZXQgdGhlIHNvdXJjZSBtZCBmaWxlXG4gKiBAcGFyYW0gZGVzdGluYXRpb25QYXRoIC0gdG8gd3JpdGUgdG9cbiAqIEBwYXJhbSB2ZXJzaW9uXG4gKiBAcGFyYW0gc2ltUmVwb1NIQVxuICogQHBhcmFtIGFzc2VydE5vQ29uc3RBd2FpdCAtIGhhbmRsZSBhc3NlcnRpbmcgZm9yIFwiY29uc3QgWCA9IGF3YWl0IC4uLlwiIGluIGV4YW1wbGVzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8tc2ltLXNwZWNpZmljL2lzc3Vlcy8zNFxuICovXG5jb25zdCBnZW5lcmF0ZUFuZFdyaXRlQ2xpZW50R3VpZGUgPSAoIHJlcG9OYW1lOiBzdHJpbmcsIHRpdGxlOiBzdHJpbmcsIHNpbXVsYXRpb25EaXNwbGF5TmFtZTogc3RyaW5nLCBtZEZpbGVQYXRoOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uUGF0aDogc3RyaW5nLCB2ZXJzaW9uOiBzdHJpbmcsIHNpbVJlcG9TSEE6IHN0cmluZywgYXNzZXJ0Tm9Db25zdEF3YWl0OiBib29sZWFuICk6IHZvaWQgPT4ge1xuXG4gIC8vIG1ha2Ugc3VyZSB0aGUgc291cmNlIG1hcmtkb3duIGZpbGUgZXhpc3RzXG4gIGlmICggIWZzLmV4aXN0c1N5bmMoIG1kRmlsZVBhdGggKSApIHtcbiAgICBncnVudC5sb2cud2FybiggYG5vIGNsaWVudCBndWlkZSBmb3VuZCBhdCAke21kRmlsZVBhdGh9LCBubyBndWlkZSBiZWluZyBidWlsdC5gICk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3Qgc2ltQ2FtZWxDYXNlTmFtZSA9IF8uY2FtZWxDYXNlKCByZXBvTmFtZSApO1xuXG4gIGxldCBtb2RlbERvY3VtZW50YXRpb25MaW5lID0gJyc7XG5cbiAgaWYgKCBmcy5leGlzdHNTeW5jKCBgLi4vJHtyZXBvTmFtZX0vZG9jL21vZGVsLm1kYCApICkge1xuICAgIG1vZGVsRG9jdW1lbnRhdGlvbkxpbmUgPSBgKiBbTW9kZWwgRG9jdW1lbnRhdGlvbl0oaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zLyR7cmVwb05hbWV9L2Jsb2IvJHtzaW1SZXBvU0hBfS9kb2MvbW9kZWwubWQpYDtcbiAgfVxuXG4gIC8vIGZpbGwgaW4gbGlua3NcbiAgbGV0IGNsaWVudEd1aWRlU291cmNlID0gZ3J1bnQuZmlsZS5yZWFkKCBtZEZpbGVQYXRoICk7XG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyBETyBOT1QgVVBEQVRFIE9SIEFERCBUTyBUSEVTRSBXSVRIT1VUIEFMU08gVVBEQVRJTkcgVEhFIExJU1QgSU4gcGhldC1pby1zaW0tc3BlY2lmaWMvY2xpZW50LWd1aWRlLWNvbW1vbi9SRUFETUUubWRcbiAgY2xpZW50R3VpZGVTb3VyY2UgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggY2xpZW50R3VpZGVTb3VyY2UsICd7e1dSQVBQRVJfSU5ERVhfUEFUSH19JywgJy4uLy4uLycgKTtcbiAgY2xpZW50R3VpZGVTb3VyY2UgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggY2xpZW50R3VpZGVTb3VyY2UsICd7e1NJTVVMQVRJT05fRElTUExBWV9OQU1FfX0nLCBzaW11bGF0aW9uRGlzcGxheU5hbWUgKTtcbiAgY2xpZW50R3VpZGVTb3VyY2UgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggY2xpZW50R3VpZGVTb3VyY2UsICd7e1NJTV9QQVRIfX0nLCBgLi4vLi4vJHtyZXBvTmFtZX1fYWxsX3BoZXQtaW8uaHRtbD9wb3N0TWVzc2FnZU9uRXJyb3ImcGhldGlvU3RhbmRhbG9uZWAgKTtcbiAgY2xpZW50R3VpZGVTb3VyY2UgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggY2xpZW50R3VpZGVTb3VyY2UsICd7e1NUVURJT19QQVRIfX0nLCAnLi4vLi4vd3JhcHBlcnMvc3R1ZGlvLycgKTtcbiAgY2xpZW50R3VpZGVTb3VyY2UgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggY2xpZW50R3VpZGVTb3VyY2UsICd7e1BIRVRfSU9fR1VJREVfUEFUSH19JywgYC4vJHtQSEVUX0lPX0dVSURFX0ZJTEVOQU1FfS5odG1sYCApO1xuICBjbGllbnRHdWlkZVNvdXJjZSA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBjbGllbnRHdWlkZVNvdXJjZSwgJ3t7REFURX19JywgbmV3IERhdGUoKS50b1N0cmluZygpICk7XG4gIGNsaWVudEd1aWRlU291cmNlID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNsaWVudEd1aWRlU291cmNlLCAne3tzaW1DYW1lbENhc2VOYW1lfX0nLCBzaW1DYW1lbENhc2VOYW1lICk7XG4gIGNsaWVudEd1aWRlU291cmNlID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNsaWVudEd1aWRlU291cmNlLCAne3tzaW1LZWJhYk5hbWV9fScsIHJlcG9OYW1lICk7XG4gIGNsaWVudEd1aWRlU291cmNlID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNsaWVudEd1aWRlU291cmNlLCAne3tTSU1VTEFUSU9OX1ZFUlNJT05fU1RSSU5HfX0nLCB2ZXJzaW9uICk7XG4gIGNsaWVudEd1aWRlU291cmNlID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNsaWVudEd1aWRlU291cmNlLCAne3tNT0RFTF9ET0NVTUVOVEFUSU9OX0xJTkV9fScsIG1vZGVsRG9jdW1lbnRhdGlvbkxpbmUgKTtcbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gIC8vIHN1cHBvcnQgcmVsYXRpdmUgYW5kIGFic29sdXRlIHBhdGhzIGZvciB1bmJ1aWx0IGNvbW1vbiBpbWFnZSBwcmV2aWV3cyBieSByZXBsYWNpbmcgdGhlbSB3aXRoIHRoZSBjb3JyZWN0IHJlbGF0aXZlIHBhdGguIE9yZGVyIG1hdHRlcnMhXG4gIGNsaWVudEd1aWRlU291cmNlID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNsaWVudEd1aWRlU291cmNlLCBgLi4vLi4vLi4vJHtHVUlERVNfQ09NTU9OX0RJUn1gLCAnJyApO1xuICBjbGllbnRHdWlkZVNvdXJjZSA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBjbGllbnRHdWlkZVNvdXJjZSwgYC4uLy4uLyR7R1VJREVTX0NPTU1PTl9ESVJ9YCwgJycgKTtcbiAgY2xpZW50R3VpZGVTb3VyY2UgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggY2xpZW50R3VpZGVTb3VyY2UsIGAuLi8ke0dVSURFU19DT01NT05fRElSfWAsICcnICk7XG4gIGNsaWVudEd1aWRlU291cmNlID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNsaWVudEd1aWRlU291cmNlLCBgLyR7R1VJREVTX0NPTU1PTl9ESVJ9YCwgJycgKTtcblxuICAvLyBTaW5jZSB3ZSBkb24ndCBoYXZlIGEgcGhldC9iYWQtdGV4dCBsaW50IHJ1bGUgZm9yIG1kIGZpbGVzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8tc2ltLXNwZWNpZmljL2lzc3Vlcy8zNFxuICBhc3NlcnROb0NvbnN0QXdhaXQgJiYgYXNzZXJ0KCAhL14uKmNvbnN0Liphd2FpdC4qJC9nbS50ZXN0KCBjbGllbnRHdWlkZVNvdXJjZSApLFxuICAgIGB1c2UgbGV0IGluc3RlYWQgb2YgY29uc3Qgd2hlbiBhd2FpdGluZyB2YWx1ZXMgaW4gUGhFVC1pTyBcIiR7RVhBTVBMRVNfRklMRU5BTUV9XCIgZmlsZXNgICk7XG5cbiAgY29uc3QgcmVuZGVyZWRDbGllbnRHdWlkZSA9IG1hcmtlZC5wYXJzZSggY2xpZW50R3VpZGVTb3VyY2UgKTtcblxuICAvLyBsaW5rIGEgc3R5bGVzaGVldFxuICBjb25zdCBjbGllbnRHdWlkZUhUTUwgPSBgPGhlYWQ+XG4gICAgICAgICAgICAgICAgICAgPGxpbmsgcmVsPSdzdHlsZXNoZWV0JyBocmVmPSdjc3MvZ2l0aHViLW1hcmtkb3duLmNzcycgdHlwZT0ndGV4dC9jc3MnPlxuICAgICAgICAgICAgICAgICAgIDx0aXRsZT4ke3RpdGxlfTwvdGl0bGU+XG4gICAgICAgICAgICAgICAgIDwvaGVhZD5cbiAgICAgICAgICAgICAgICAgPGJvZHk+XG4gICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtYXJrZG93bi1ib2R5XCI+XG4gICAgICAgICAgICAgICAgICAgJHtyZW5kZXJlZENsaWVudEd1aWRlfVxuICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgPC9ib2R5PmA7XG5cbiAgLy8gd3JpdGUgdGhlIG91dHB1dCB0byB0aGUgYnVpbGQgZGlyZWN0b3J5XG4gIGdydW50LmZpbGUud3JpdGUoIGRlc3RpbmF0aW9uUGF0aCwgY2xpZW50R3VpZGVIVE1MICk7XG59O1xuXG4vKipcbiAqIFN1cHBvcnQgYnVpbGRpbmcgc3R1ZGlvLiBUaGlzIGNvbXBpbGVzIHRoZSBzdHVkaW8gbW9kdWxlcyBpbnRvIGEgcnVubmFibGUsIGFuZCBjb3BpZXMgdGhhdCBvdmVyIHRvIHRoZSBleHBlY3RlZCBzcG90XG4gKiBvbiBidWlsZC5cbiAqL1xuY29uc3QgaGFuZGxlU3R1ZGlvID0gYXN5bmMgKCByZXBvOiBzdHJpbmcsIHdyYXBwZXJzTG9jYXRpb246IHN0cmluZywgc2hvdWxkVHlwZUNoZWNrOiBib29sZWFuICk6IFByb21pc2U8dm9pZD4gPT4ge1xuXG4gIGdydW50LmxvZy52ZXJib3NlLndyaXRlbG4oICdidWlsZGluZyBzdHVkaW8nICk7XG5cbiAgaWYgKCBzaG91bGRUeXBlQ2hlY2sgKSB7XG4gICAgY29uc3Qgc3VjY2VzcyA9IGF3YWl0IHR5cGVDaGVjaygge1xuICAgICAgcmVwbzogJ3N0dWRpbydcbiAgICB9ICk7XG4gICAgaWYgKCAhc3VjY2VzcyApIHtcbiAgICAgIGdydW50LmZhaWwuZmF0YWwoICdUeXBlIGNoZWNraW5nIGZhaWxlZCcgKTtcbiAgICB9XG4gIH1cblxuICBmcy53cml0ZUZpbGVTeW5jKCBgJHt3cmFwcGVyc0xvY2F0aW9ufXN0dWRpby8ke1NUVURJT19CVUlMVF9GSUxFTkFNRX1gLCBhd2FpdCBidWlsZFN0YW5kYWxvbmUoICdzdHVkaW8nLCB7XG4gICAgc3RyaXBBc3NlcnRpb25zOiBmYWxzZSxcbiAgICBzdHJpcExvZ2dpbmc6IGZhbHNlLFxuICAgIHRlbXBPdXRwdXREaXI6IHJlcG8sXG4gICAgYnJhbmQ6ICdwaGV0LWlvJ1xuICB9ICkgKTtcbn07XG5cbi8qKlxuICogVXNlIHdlYnBhY2sgdG8gYnVuZGxlIHRoZSBtaWdyYXRpb24gcHJvY2Vzc29ycyBpbnRvIGEgY29tcGlsZWQgY29kZSBzdHJpbmcsIGZvciB1c2UgaW4gcGhldC1pbyBsaWIgZmlsZS5cbiAqL1xuY29uc3QgZ2V0Q29tcGlsZWRNaWdyYXRpb25Qcm9jZXNzb3JzID0gYXN5bmMgKCByZXBvOiBzdHJpbmcsIGJ1aWxkRGlyOiBzdHJpbmcgKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUsIHJlamVjdCApID0+IHtcblxuICAgIGNvbnN0IG1pZ3JhdGlvblByb2Nlc3NvcnNGaWxlbmFtZSA9IGAke3JlcG99LW1pZ3JhdGlvbi1wcm9jZXNzb3JzLmpzYDtcbiAgICBjb25zdCBlbnRyeVBvaW50RmlsZW5hbWUgPSBgLi4vY2hpcHBlci9kaXN0L2pzL3BoZXQtaW8tc2ltLXNwZWNpZmljL3JlcG9zLyR7cmVwb30vanMvJHttaWdyYXRpb25Qcm9jZXNzb3JzRmlsZW5hbWV9YDtcbiAgICBpZiAoICFmcy5leGlzdHNTeW5jKCBlbnRyeVBvaW50RmlsZW5hbWUgKSApIHtcbiAgICAgIGdydW50LmxvZy52ZXJib3NlLndyaXRlbG4oIGBObyBtaWdyYXRpb24gcHJvY2Vzc29ycyBmb3VuZCBhdCAke2VudHJ5UG9pbnRGaWxlbmFtZX0sIG5vIHByb2Nlc3NvcnMgdG8gYmUgYnVuZGxlZCB3aXRoICR7TElCX09VVFBVVF9GSUxFfS5gICk7XG4gICAgICByZXNvbHZlKCAnJyApOyAvLyBibGFuayBzdHJpbmcgYmVjYXVzZSB0aGVyZSBhcmUgbm8gcHJvY2Vzc29ycyB0byBhZGQuXG4gICAgfVxuICAgIGVsc2Uge1xuXG4gICAgICAvLyBvdXRwdXQgZGlyIG11c3QgYmUgYW4gYWJzb2x1dGUgcGF0aFxuICAgICAgY29uc3Qgb3V0cHV0RGlyID0gcGF0aC5yZXNvbHZlKCBfX2Rpcm5hbWUsIGAuLi8uLi8uLi8ke3JlcG99LyR7YnVpbGREaXJ9YCApO1xuXG4gICAgICBjb25zdCBjb21waWxlciA9IHdlYnBhY2soIHtcbiAgICAgICAgbW9kdWxlOiB7XG4gICAgICAgICAgcnVsZXM6IHdlYnBhY2tCdWlsZC5nZXRNb2R1bGVSdWxlcygpIC8vIFN1cHBvcnQgcHJlbG9hZC1saWtlIGxpYnJhcnkgZ2xvYmFscyB1c2VkIHZpYSBgaW1wb3J0YFxuICAgICAgICB9LFxuICAgICAgICAvLyBXZSB1Z2xpZnkgYXMgYSBzdGVwIGFmdGVyIHRoaXMsIHdpdGggbWFueSBjdXN0b20gcnVsZXMuIFNvIHdlIGRvIE5PVCBvcHRpbWl6ZSBvciB1Z2xpZnkgaW4gdGhpcyBzdGVwLlxuICAgICAgICBvcHRpbWl6YXRpb246IHtcbiAgICAgICAgICBtaW5pbWl6ZTogZmFsc2VcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBTaW11bGF0aW9ucyBvciBydW5uYWJsZXMgd2lsbCBoYXZlIGEgc2luZ2xlIGVudHJ5IHBvaW50XG4gICAgICAgIGVudHJ5OiB7XG4gICAgICAgICAgcmVwbzogZW50cnlQb2ludEZpbGVuYW1lXG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gV2Ugb3V0cHV0IG91ciBidWlsZHMgdG8gdGhlIGZvbGxvd2luZyBkaXJcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgcGF0aDogb3V0cHV0RGlyLFxuICAgICAgICAgIGZpbGVuYW1lOiBtaWdyYXRpb25Qcm9jZXNzb3JzRmlsZW5hbWVcbiAgICAgICAgfVxuICAgICAgfSApO1xuXG4gICAgICBjb21waWxlci5ydW4oICggZXJyOiBFcnJvciwgc3RhdHM6IFN0YXRzICkgPT4ge1xuICAgICAgICBpZiAoIGVyciB8fCBzdGF0cy5oYXNFcnJvcnMoKSApIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCAnTWlncmF0aW9uIHByb2Nlc3NvcnMgd2VicGFjayBidWlsZCBlcnJvcnM6Jywgc3RhdHMuY29tcGlsYXRpb24uZXJyb3JzICk7XG4gICAgICAgICAgcmVqZWN0KCBlcnIgfHwgc3RhdHMuY29tcGlsYXRpb24uZXJyb3JzWyAwIF0gKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBjb25zdCBqc0ZpbGUgPSBgJHtvdXRwdXREaXJ9LyR7bWlncmF0aW9uUHJvY2Vzc29yc0ZpbGVuYW1lfWA7XG4gICAgICAgICAgY29uc3QganMgPSBmcy5yZWFkRmlsZVN5bmMoIGpzRmlsZSwgJ3V0Zi04JyApO1xuXG4gICAgICAgICAgZnMudW5saW5rU3luYygganNGaWxlICk7XG5cbiAgICAgICAgICByZXNvbHZlKCBqcyApO1xuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgfVxuICB9ICk7XG59OyJdLCJuYW1lcyI6WyJhc3NlcnQiLCJmcyIsIl8iLCJwYXRoIiwiU2ltVmVyc2lvbiIsImRpcm5hbWUiLCJleGVjdXRlIiwidHlwZUNoZWNrIiwiZ3J1bnQiLCJDaGlwcGVyU3RyaW5nVXRpbHMiLCJjb3B5RGlyZWN0b3J5IiwibWluaWZ5IiwiZm9ybWF0UGhldGlvQVBJIiwiZ2VuZXJhdGVQaGV0aW9NYWNyb0FQSSIsImJ1aWxkU3RhbmRhbG9uZSIsImdldFBoZXRMaWJzIiwid2VicGFja0J1aWxkIiwid2VicGFjayIsInJlcXVpcmUiLCJhcmNoaXZlciIsIm1hcmtlZCIsIl9fZGlybmFtZSIsInVybCIsIkRFRElDQVRFRF9SRVBPX1dSQVBQRVJfUFJFRklYIiwiV1JBUFBFUl9DT01NT05fRk9MREVSIiwiV1JBUFBFUlNfRk9MREVSIiwiUEhFVF9JT19TSU1fU1BFQ0lGSUMiLCJHVUlERVNfQ09NTU9OX0RJUiIsIkVYQU1QTEVTX0ZJTEVOQU1FIiwiUEhFVF9JT19HVUlERV9GSUxFTkFNRSIsIkxJQl9PVVRQVVRfRklMRSIsIlRISVJEX1BBUlRZX0xJQl9QUkVMT0FEUyIsIlBIRVRfSU9fTElCX1BSRUxPQURTIiwiTElCX1BSRUxPQURTIiwiY29uY2F0IiwiQ09OVFJJQl9GSUxFUyIsInRyYW5zcGlsZWRDbGllbnRQYXRoIiwiSlNET0NfRklMRVMiLCJKU0RPQ19SRUFETUVfRklMRSIsIlNUVURJT19CVUlMVF9GSUxFTkFNRSIsInJlcG8iLCJ2ZXJzaW9uIiwic2ltdWxhdGlvbkRpc3BsYXlOYW1lIiwicGFja2FnZU9iamVjdCIsImdlbmVyYXRlTWFjcm9BUElGaWxlIiwicmVwb1BoZXRMaWJzIiwiZXZlcnkiLCJpbmNsdWRlcyIsInJlYWRGaWxlU3luYyIsInRvU3RyaW5nIiwic2ltUmVwb1NIQSIsInRyaW0iLCJidWlsZERpciIsIndyYXBwZXJzTG9jYXRpb24iLCJzaW1WZXJzaW9uIiwicGFyc2UiLCJsYXRlc3RWZXJzaW9uIiwibWFqb3IiLCJtaW5vciIsInN0YW5kYXJkUGhldGlvV3JhcHBlclRlbXBsYXRlU2tlbGV0b24iLCJjdXN0b21QaGV0aW9XcmFwcGVyVGVtcGxhdGVTa2VsZXRvbiIsImZpbHRlcldyYXBwZXIiLCJhYnNQYXRoIiwiY29udGVudHMiLCJvcmlnaW5hbENvbnRlbnRzIiwiaXNXcmFwcGVySW5kZXgiLCJwYXRoVG9MaWIiLCJmb3JFYWNoIiwiZmlsZVBhdGgiLCJmaWxlUGF0aFBhcnRzIiwic3BsaXQiLCJuZWVkc0V4dHJhRG90cyIsImZpbGVOYW1lIiwibGVuZ3RoIiwiY29udHJpYkZpbGVOYW1lIiwicGF0aFRvQ29udHJpYiIsInJlcGxhY2VBbGwiLCJpbmNsdWRlc0VsZW1lbnQiLCJsaW5lIiwiYXJyYXkiLCJmaW5kIiwiZWxlbWVudCIsImZpbHRlciIsImpvaW4iLCJyZXBsYWNlIiwiZ2V0R3VpZGVSb3dUZXh0IiwibGlua1RleHQiLCJkZXNjcmlwdGlvbiIsImV4YW1wbGVSb3dDb250ZW50cyIsImV4aXN0c1N5bmMiLCJlbmRzV2l0aCIsImxpbmVzIiwicHJ1bmVkIiwiaSIsInB1c2giLCJ3cmFwcGVycyIsIm1hcCIsIndyYXBwZXJzVW5hbGxvd2VkIiwibGliRmlsZU5hbWVzIiwicGFydHMiLCJmdWxsVW5hbGxvd2VkTGlzdCIsImNvcHlXcmFwcGVyIiwic3JjIiwiZGVzdCIsIndyYXBwZXIiLCJ3cmFwcGVyTmFtZSIsIndyYXBwZXJGaWx0ZXJXaXRoTmFtZUZpbHRlciIsInJlc3VsdCIsImV4Y2x1ZGUiLCJtaW5pZnlKUyIsIm1pbmlmeU9wdGlvbnMiLCJzdHJpcEFzc2VydGlvbnMiLCJzaW1TcGVjaWZpY1dyYXBwZXJzIiwicmVhZGRpclN5bmMiLCJ3aXRoRmlsZVR5cGVzIiwiZGlyZW50IiwiaXNEaXJlY3RvcnkiLCJuYW1lIiwiZSIsImFkZGl0aW9uYWxXcmFwcGVycyIsInBoZXQiLCJ4Iiwid3JhcHBlclBhcnRzIiwiaGFuZGxlTGliIiwiaGFuZGxlT2ZmbGluZUFydGlmYWN0IiwiaGFuZGxlQ29udHJpYiIsImhhbmRsZUpTRE9DIiwiaGFuZGxlQ2xpZW50R3VpZGVzIiwiaGFuZGxlU3R1ZGlvIiwiZnVsbEFQSSIsImZyb21CdWlsdFZlcnNpb24iLCJmaWxlIiwid3JpdGUiLCJybVN5bmMiLCJyZWN1cnNpdmUiLCJzaG91bGRUeXBlQ2hlY2siLCJsb2ciLCJ2ZXJib3NlIiwid3JpdGVsbiIsIm1rZGlyU3luYyIsInBoZXRpb0xpYkNvZGUiLCJsaWJGaWxlIiwicmVhZCIsImZpbHRlcmVkQ29udGVudHMiLCJtaWdyYXRpb25Qcm9jZXNzb3JzQ29kZSIsImdldENvbXBpbGVkTWlncmF0aW9uUHJvY2Vzc29ycyIsIm1pbmlmaWVkUGhldGlvQ29kZSIsInN1Y2Nlc3MiLCJmYWlsIiwiZmF0YWwiLCJ3cmFwcGVyc01haW4iLCJzdHJpcExvZ2dpbmciLCJ0ZW1wT3V0cHV0RGlyIiwiYnJhbmQiLCJvbWl0UHJlbG9hZHMiLCJmaWx0ZXJlZE1haW4iLCJtYWluQ29weXJpZ2h0IiwiRGF0ZSIsImdldEZ1bGxZZWFyIiwiY29udHJpYkZpbGUiLCJmaWxlbmFtZSIsImNvcHkiLCJvdXRwdXQiLCJjcmVhdGVXcml0ZVN0cmVhbSIsImFyY2hpdmUiLCJvbiIsImVyciIsInBpcGUiLCJkaXJlY3RvcnkiLCJnbG9iIiwiY3dkIiwiZmluYWxpemUiLCJQcm9taXNlIiwicmVzb2x2ZSIsIkVycm9yIiwiZ2V0SlNEb2NBcmdzIiwiZXhwbGFpbiIsInByb2Nlc3MiLCJleHBsYW5hdGlvbiIsImltYWdlRGlyIiwiY29weUZpbGVTeW5jIiwianNvbiIsInN1YnN0cmluZyIsImluZGV4T2YiLCJsYXN0SW5kZXhPZiIsIkpTT04iLCJ3cml0ZUZpbGVTeW5jIiwicmVwb05hbWUiLCJidWlsdENsaWVudEd1aWRlc091dHB1dERpciIsImNsaWVudEd1aWRlc1NvdXJjZVJvb3QiLCJjb21tb25EaXIiLCJnZW5lcmF0ZUFuZFdyaXRlQ2xpZW50R3VpZGUiLCJ0aXRsZSIsIm1kRmlsZVBhdGgiLCJkZXN0aW5hdGlvblBhdGgiLCJhc3NlcnROb0NvbnN0QXdhaXQiLCJ3YXJuIiwic2ltQ2FtZWxDYXNlTmFtZSIsImNhbWVsQ2FzZSIsIm1vZGVsRG9jdW1lbnRhdGlvbkxpbmUiLCJjbGllbnRHdWlkZVNvdXJjZSIsInRlc3QiLCJyZW5kZXJlZENsaWVudEd1aWRlIiwiY2xpZW50R3VpZGVIVE1MIiwicmVqZWN0IiwibWlncmF0aW9uUHJvY2Vzc29yc0ZpbGVuYW1lIiwiZW50cnlQb2ludEZpbGVuYW1lIiwib3V0cHV0RGlyIiwiY29tcGlsZXIiLCJtb2R1bGUiLCJydWxlcyIsImdldE1vZHVsZVJ1bGVzIiwib3B0aW1pemF0aW9uIiwibWluaW1pemUiLCJlbnRyeSIsInJ1biIsInN0YXRzIiwiaGFzRXJyb3JzIiwiY29uc29sZSIsImVycm9yIiwiY29tcGlsYXRpb24iLCJlcnJvcnMiLCJqc0ZpbGUiLCJqcyIsInVubGlua1N5bmMiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFz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