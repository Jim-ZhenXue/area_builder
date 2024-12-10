// Copyright 2020-2024, University of Colorado Boulder
/**
 * Generates JS modules from resources such as images/strings/audio/etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jonathan Olson (PhET Interactive Simulations)
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
import _ from 'lodash';
import os from 'os';
import path from 'path';
import writeFileAndGitAdd from '../../../perennial-alias/js/common/writeFileAndGitAdd.js';
import grunt from '../../../perennial-alias/js/npm-dependencies/grunt.js';
import loadFileAsDataURI from '../common/loadFileAsDataURI.js';
import pascalCase from '../common/pascalCase.js';
import toLessEscapedString from '../common/toLessEscapedString.js';
import createMipmap from './createMipmap.js';
import getCopyrightLine from './getCopyrightLine.js';
const svgo = require('svgo');
// disable lint in compiled files, because it increases the linting time
const HEADER = '/* eslint-disable */\n/* @formatter:off */\n';
// supported image types, not case-sensitive
const IMAGE_SUFFIXES = [
    '.png',
    '.jpg',
    '.cur',
    '.svg'
];
// supported sound file types, not case-sensitive
const SOUND_SUFFIXES = [
    '.mp3',
    '.wav'
];
// supported shader file types, not case-sensitive
const SHADER_SUFFIXES = [
    '.glsl',
    '.vert',
    '.shader'
];
/**
 * String replacement
 * @param string - the string which will be searched
 * @param search - the text to be replaced
 * @param replacement - the new text
 */ const replace = (string, search, replacement)=>string.split(search).join(replacement);
/**
 * Get the relative from the modulified repo to the filename through the provided subdirectory.
 */ const getRelativePath = (subdir, filename)=>{
    return `${subdir}/${filename}`;
};
/**
 * Gets the relative path to the root based on the depth of a resource
 */ const expandDots = (abspath)=>{
    // Finds the depths of a directory relative to the root of where grunt.recurse was called from (a repo root)
    const depth = abspath.split('/').length - 2;
    let parentDirectory = '';
    for(let i = 0; i < depth; i++){
        parentDirectory = `${parentDirectory}../`;
    }
    return parentDirectory;
};
/**
 * Output with an OS-specific EOL sequence, see https://github.com/phetsims/chipper/issues/908
 */ const fixEOL = (string)=>replace(string, '\n', os.EOL);
/**
 * Transform an image file to a JS file that loads the image.
 * @param abspath - the absolute path of the image
 * @param repo - repository name for the modulify command
 * @param subdir - subdirectory location for modulified assets
 * @param filename - name of file being modulified
 */ const modulifyImage = /*#__PURE__*/ _async_to_generator(function*(abspath, repo, subdir, filename) {
    const dataURI = loadFileAsDataURI(abspath);
    const contents = `${HEADER}
import asyncLoader from '${expandDots(abspath)}phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = '${dataURI}';
export default image;`;
    const tsFilename = convertSuffix(filename, '.ts');
    yield writeFileAndGitAdd(repo, getRelativePath(subdir, tsFilename), fixEOL(contents));
});
/**
 * Transform an SVG image file to a JS file that loads the image.
 * @param abspath - the absolute path of the image
 * @param repo - repository name for the modulify command
 * @param subdir - subdirectory location for modulified assets
 * @param filename - name of file being modulified
 */ const modulifySVG = /*#__PURE__*/ _async_to_generator(function*(abspath, repo, subdir, filename) {
    const fileContents = fs.readFileSync(abspath, 'utf-8');
    if (!fileContents.includes('width="') || !fileContents.includes('height="')) {
        throw new Error(`SVG file ${abspath} does not contain width and height attributes`);
    }
    // Use SVGO to optimize the SVG contents, see https://github.com/phetsims/arithmetic/issues/201
    const optimizedContents = svgo.optimize(fileContents, {
        multipass: true,
        plugins: [
            {
                name: 'preset-default',
                params: {
                    overrides: {
                        // We can't scale things and get the right bounds if the view box is removed.
                        removeViewBox: false
                    }
                }
            }
        ]
    }).data;
    const contents = `${HEADER}
import asyncLoader from '${expandDots(abspath)}phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = \`data:image/svg+xml;base64,\${btoa(${toLessEscapedString(optimizedContents)})}\`;
export default image;`;
    const tsFilename = convertSuffix(filename, '.ts');
    yield writeFileAndGitAdd(repo, getRelativePath(subdir, tsFilename), fixEOL(contents));
});
/**
 * Transform an image file to a JS file that loads the image as a mipmap.
 * @param abspath - the absolute path of the image
 * @param repo - repository name for the modulify command
 * @param subdir - subdirectory location for modulified assets
 * @param filename - name of file being modulified
 */ const modulifyMipmap = /*#__PURE__*/ _async_to_generator(function*(abspath, repo, subdir, filename) {
    // Defaults. NOTE: using the default settings because we have not run into a need, see
    // https://github.com/phetsims/chipper/issues/820 and https://github.com/phetsims/chipper/issues/945
    const config = {
        level: 4,
        quality: 98
    };
    const mipmapLevels = yield createMipmap(abspath, config.level, config.quality);
    const entries = mipmapLevels.map(({ width, height, url })=>`  new MipmapElement( ${width}, ${height}, '${url}' )`);
    const mipmapContents = `${HEADER}
import MipmapElement from '${expandDots(abspath)}phet-core/js/MipmapElement.js';

// The levels in the mipmap. Specify explicit types rather than inferring to assist the type checker, for this boilerplate case.
const mipmaps = [
${entries.join(',\n')}
];

export default mipmaps;`;
    const jsFilename = convertSuffix(filename, '.ts');
    yield writeFileAndGitAdd(repo, getRelativePath(subdir, jsFilename), fixEOL(mipmapContents));
});
/**
 * Transform a GLSL shader file to a JS file that is represented by a string.
 * @param abspath - the absolute path of the image
 * @param repo - repository name for the modulify command
 * @param subdir - subdirectory location for modulified assets
 * @param filename - name of file being modulified
 */ const modulifyShader = /*#__PURE__*/ _async_to_generator(function*(abspath, repo, subdir, filename) {
    // load the shader file
    const shaderString = fs.readFileSync(abspath, 'utf-8').replace(/\r/g, '');
    // output the contents of the file that will define the shader in JS format
    const contents = `${HEADER}
export default ${JSON.stringify(shaderString)}`;
    const jsFilename = convertSuffix(filename, '.js');
    yield writeFileAndGitAdd(repo, getRelativePath(subdir, jsFilename), fixEOL(contents));
});
/**
 * Decode a sound file into a Web Audio AudioBuffer.
 * @param abspath - the absolute path of the image
 * @param repo - repository name for the modulify command
 * @param subdir - subdirectory location for modulified assets
 * @param filename - name of file being modulified
 */ const modulifySound = /*#__PURE__*/ _async_to_generator(function*(abspath, repo, subdir, filename) {
    // load the sound file
    const dataURI = loadFileAsDataURI(abspath);
    // output the contents of the file that will define the sound in JS format
    const contents = `${HEADER}
import asyncLoader from '${expandDots(abspath)}phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '${expandDots(abspath)}tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '${expandDots(abspath)}tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '${expandDots(abspath)}tambo/js/phetAudioContext.js';

const soundURI = '${dataURI}';
const soundByteArray = base64SoundToByteArray( phetAudioContext, soundURI );
const unlock = asyncLoader.createLock( soundURI );
const wrappedAudioBuffer = new WrappedAudioBuffer();

// safe way to unlock
let unlocked = false;
const safeUnlock = () => {
  if ( !unlocked ) {
    unlock();
    unlocked = true;
  }
};

const onDecodeSuccess = decodedAudio => {
  if ( wrappedAudioBuffer.audioBufferProperty.value === null ) {
    wrappedAudioBuffer.audioBufferProperty.set( decodedAudio );
    safeUnlock();
  }
};
const onDecodeError = decodeError => {
  console.warn( 'decode of audio data failed, using stubbed sound, error: ' + decodeError );
  wrappedAudioBuffer.audioBufferProperty.set( phetAudioContext.createBuffer( 1, 1, phetAudioContext.sampleRate ) );
  safeUnlock();
};
const decodePromise = phetAudioContext.decodeAudioData( soundByteArray.buffer, onDecodeSuccess, onDecodeError );
if ( decodePromise ) {
  decodePromise
    .then( decodedAudio => {
      if ( wrappedAudioBuffer.audioBufferProperty.value === null ) {
        wrappedAudioBuffer.audioBufferProperty.set( decodedAudio );
        safeUnlock();
      }
    } )
    .catch( e => {
      console.warn( 'promise rejection caught for audio decode, error = ' + e );
      safeUnlock();
    } );
}
export default wrappedAudioBuffer;`;
    const jsFilename = convertSuffix(filename, '.js');
    yield writeFileAndGitAdd(repo, getRelativePath(subdir, jsFilename), fixEOL(contents));
});
/**
 * Convert .png => _png_mipmap.js, etc.
 *
 * @param abspath - file name with a suffix or a path to it
 * @param suffix - the new suffix, such as '.js'
 */ const convertSuffix = (abspath, suffix)=>{
    const lastDotIndex = abspath.lastIndexOf('.');
    return `${abspath.substring(0, lastDotIndex)}_${abspath.substring(lastDotIndex + 1)}${suffix}`;
};
/**
 * Determines the suffix from a filename, everything after the final '.'
 */ const getSuffix = (filename)=>{
    const index = filename.lastIndexOf('.');
    return filename.substring(index);
};
/**
 * Creates a *.js file corresponding to matching resources such as images or sounds.
 */ const modulifyFile = /*#__PURE__*/ _async_to_generator(function*(abspath, rootdir, subdir, filename, repo) {
    if (subdir && (subdir.startsWith('images') || // for brand
    subdir.startsWith('phet/images') || subdir.startsWith('phet-io/images') || subdir.startsWith('adapted-from-phet/images')) && IMAGE_SUFFIXES.includes(getSuffix(filename))) {
        if (getSuffix(filename) === '.svg') {
            yield modulifySVG(abspath, repo, subdir, filename);
        } else {
            yield modulifyImage(abspath, repo, subdir, filename);
        }
    }
    if (subdir && (subdir.startsWith('mipmaps') || // for brand
    subdir.startsWith('phet/mipmaps') || subdir.startsWith('phet-io/mipmaps') || subdir.startsWith('adapted-from-phet/mipmaps')) && IMAGE_SUFFIXES.includes(getSuffix(filename))) {
        yield modulifyMipmap(abspath, repo, subdir, filename);
    }
    if (subdir && subdir.startsWith('sounds') && SOUND_SUFFIXES.includes(getSuffix(filename))) {
        yield modulifySound(abspath, repo, subdir, filename);
    }
    if (subdir && subdir.startsWith('shaders') && SHADER_SUFFIXES.includes(getSuffix(filename))) {
        yield modulifyShader(abspath, repo, subdir, filename);
    }
});
/**
 * Creates the image module at js/${_.camelCase( repo )}Images.js for repos that need it.
 */ const createImageModule = /*#__PURE__*/ _async_to_generator(function*(repo, supportedRegionsAndCultures) {
    const spec = JSON.parse(readFileSync(`../${repo}/${repo}-images.json`, 'utf8'));
    const namespace = _.camelCase(repo);
    const imageModuleName = `${pascalCase(repo)}Images`;
    const relativeImageModuleFile = `js/${imageModuleName}.ts`;
    const providedRegionsAndCultures = Object.keys(spec);
    // Ensure our regionAndCultures in the -images.json file match with the supportedRegionsAndCultures in the package.json
    supportedRegionsAndCultures.forEach((regionAndCulture)=>{
        if (!providedRegionsAndCultures.includes(regionAndCulture)) {
            throw new Error(`regionAndCulture '${regionAndCulture}' is required, but not found in ${repo}-images.json`);
        }
    });
    providedRegionsAndCultures.forEach((regionAndCulture)=>{
        if (!supportedRegionsAndCultures.includes(regionAndCulture)) {
            throw new Error(`regionAndCulture '${regionAndCulture}' is not supported, but found in ${repo}-images.json`);
        }
    });
    const imageNames = _.uniq(providedRegionsAndCultures.flatMap((regionAndCulture)=>{
        return Object.keys(spec[regionAndCulture]);
    })).sort();
    const imageFiles = _.uniq(providedRegionsAndCultures.flatMap((regionAndCulture)=>{
        return Object.values(spec[regionAndCulture]);
    })).sort();
    // Do images exist?
    imageFiles.forEach((imageFile)=>{
        if (!fs.existsSync(`../${repo}/${imageFile}`)) {
            throw new Error(`Image file ${imageFile} is referenced in ${repo}-images.json, but does not exist`);
        }
    });
    // Ensure that all image names are provided for all regionAndCultures
    providedRegionsAndCultures.forEach((regionAndCulture)=>{
        imageNames.forEach((imageName)=>{
            if (!spec[regionAndCulture].hasOwnProperty(imageName)) {
                throw new Error(`Image name ${imageName} is not provided for regionAndCulture ${regionAndCulture} (but provided for others)`);
            }
        });
    });
    const getImportName = (imageFile)=>path.basename(imageFile, path.extname(imageFile));
    // Check that import names are unique
    // NOTE: we could disambiguate in the future in an automated way fairly easily, but should it be done?
    if (_.uniq(imageFiles.map(getImportName)).length !== imageFiles.length) {
        // Find and report the name collision
        const importNames = imageFiles.map(getImportName);
        const duplicates = importNames.filter((name, index)=>importNames.indexOf(name) !== index);
        if (duplicates.length) {
            const firstDuplicate = duplicates[0];
            const originalNames = imageFiles.filter((imageFile)=>getImportName(imageFile) === firstDuplicate);
            throw new Error(`Multiple images result in the same import name ${firstDuplicate}: ${originalNames.join(', ')}`);
        }
    }
    const copyrightLine = yield getCopyrightLine(repo, relativeImageModuleFile);
    yield writeFileAndGitAdd(repo, relativeImageModuleFile, fixEOL(`${copyrightLine}
/* eslint-disable */
/* @formatter:off */
/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
 
import LocalizedImageProperty from '../../joist/js/i18n/LocalizedImageProperty.js';
import ${namespace} from './${namespace}.js';
${imageFiles.map((imageFile)=>`import ${getImportName(imageFile)} from '../${imageFile.replace('.ts', '.js')}';`).join('\n')}

const ${imageModuleName} = {
  ${imageNames.map((imageName)=>`${imageName}ImageProperty: new LocalizedImageProperty( '${imageName}', {
    ${supportedRegionsAndCultures.map((regionAndCulture)=>`${regionAndCulture}: ${getImportName(spec[regionAndCulture][imageName])}`).join(',\n    ')}
  } )`).join(',\n  ')}
};

${namespace}.register( '${imageModuleName}', ${imageModuleName} );

export default ${imageModuleName};
`));
});
/**
 * Creates the string module at js/${_.camelCase( repo )}Strings.js for repos that need it.
 */ const createStringModule = /*#__PURE__*/ _async_to_generator(function*(repo) {
    const packageObject = JSON.parse(readFileSync(`../${repo}/package.json`, 'utf8'));
    const stringModuleName = `${pascalCase(repo)}Strings`;
    const relativeStringModuleFile = `js/${stringModuleName}.ts`;
    const stringModuleFileJS = `../${repo}/js/${stringModuleName}.js`;
    const namespace = _.camelCase(repo);
    if (fs.existsSync(stringModuleFileJS)) {
        console.log('Found JS string file in TS repo.  It should be deleted manually.  ' + stringModuleFileJS);
    }
    const copyrightLine = yield getCopyrightLine(repo, relativeStringModuleFile);
    yield writeFileAndGitAdd(repo, relativeStringModuleFile, fixEOL(`${copyrightLine}

/* eslint-disable */
/* @formatter:off */

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */

import getStringModule from '../../chipper/js/browser/getStringModule.js';
import type LocalizedStringProperty from '../../chipper/js/browser/LocalizedStringProperty.js';
import ${namespace} from './${namespace}.js';

type StringsType = ${getStringTypes(repo)};

const ${stringModuleName} = getStringModule( '${packageObject.phet.requirejsNamespace}' ) as StringsType;

${namespace}.register( '${stringModuleName}', ${stringModuleName} );

export default ${stringModuleName};
`));
});
/**
 * Creates a *.d.ts file that represents the types of the strings for the repo.
 */ const getStringTypes = (repo)=>{
    const packageObject = JSON.parse(readFileSync(`../${repo}/package.json`, 'utf8'));
    const json = JSON.parse(readFileSync(`../${repo}/${repo}-strings_en.json`, 'utf8'));
    // Track paths to all the keys with values.
    const all = [];
    // Recursively collect all of the paths to keys with values.
    const visit = (level, path)=>{
        Object.keys(level).forEach((key)=>{
            if (key !== '_comment') {
                if (level[key].value && typeof level[key].value === 'string') {
                    // Deprecated means that it is used by release branches, but shouldn't be used in new code, so keep it out of the type.
                    if (!level[key].deprecated) {
                        all.push({
                            path: [
                                ...path,
                                key
                            ],
                            value: level[key].value
                        });
                    }
                } else {
                    visit(level[key], [
                        ...path,
                        key
                    ]);
                }
            }
        });
    };
    visit(json, []);
    // Transform to a new structure that matches the types we access at runtime.
    const structure = {};
    for(let i = 0; i < all.length; i++){
        const allElement = all[i];
        const path = allElement.path;
        let level = structure;
        for(let k = 0; k < path.length; k++){
            const pathElement = path[k];
            const tokens = pathElement.split('.');
            for(let m = 0; m < tokens.length; m++){
                const token = tokens[m];
                assert(!token.includes(';'), `Token ${token} cannot include forbidden characters`);
                assert(!token.includes(','), `Token ${token} cannot include forbidden characters`);
                assert(!token.includes(' '), `Token ${token} cannot include forbidden characters`);
                if (k === path.length - 1 && m === tokens.length - 1) {
                    if (!(packageObject.phet && packageObject.phet.simFeatures && packageObject.phet.simFeatures.supportsDynamicLocale)) {
                        level[token] = '{{STRING}}'; // instead of value = allElement.value
                    }
                    level[`${token}StringProperty`] = '{{STRING_PROPERTY}}';
                } else {
                    level[token] = level[token] || {};
                    level = level[token];
                }
            }
        }
    }
    let text = JSON.stringify(structure, null, 2);
    // Use single quotes instead of the double quotes from JSON
    text = replace(text, '"', '\'');
    text = replace(text, '\'{{STRING}}\'', 'string');
    text = replace(text, '\'{{STRING_PROPERTY}}\'', 'LocalizedStringProperty');
    // Add ; to the last in the list
    text = replace(text, ': string\n', ': string;\n');
    text = replace(text, ': LocalizedStringProperty\n', ': LocalizedStringProperty;\n');
    // Use ; instead of ,
    text = replace(text, ',', ';');
    return text;
};
/**
 * Entry point for modulify, which transforms all of the resources in a repo to *.js files.
 * @param repo - the name of a repo, such as 'joist'
 */ export default /*#__PURE__*/ _async_to_generator(function*(repo) {
    console.log(`modulifying ${repo}`);
    const relativeFiles = [];
    grunt.file.recurse(`../${repo}`, /*#__PURE__*/ _async_to_generator(function*(abspath, rootdir, subdir, filename) {
        relativeFiles.push({
            abspath: abspath,
            rootdir: rootdir,
            subdir: subdir,
            filename: filename
        });
    }));
    for(let i = 0; i < relativeFiles.length; i++){
        const entry = relativeFiles[i];
        yield modulifyFile(entry.abspath, entry.rootdir, entry.subdir, entry.filename, repo);
    }
    const packageObject = JSON.parse(readFileSync(`../${repo}/package.json`, 'utf8'));
    // Strings module file
    if (fs.existsSync(`../${repo}/${repo}-strings_en.json`) && packageObject.phet && packageObject.phet.requirejsNamespace) {
        yield createStringModule(repo);
    }
    // Images module file (localized images)
    if (fs.existsSync(`../${repo}/${repo}-images.json`)) {
        var _packageObject_phet_simFeatures, _packageObject_phet;
        const supportedRegionsAndCultures = packageObject == null ? void 0 : (_packageObject_phet = packageObject.phet) == null ? void 0 : (_packageObject_phet_simFeatures = _packageObject_phet.simFeatures) == null ? void 0 : _packageObject_phet_simFeatures.supportedRegionsAndCultures;
        if (!supportedRegionsAndCultures) {
            throw new Error(`supportedRegionsAndCultures is not defined in package.json, but ${repo}-images.json exists`);
        }
        if (!supportedRegionsAndCultures.includes('usa')) {
            throw new Error('regionAndCulture \'usa\' is required, but not found in supportedRegionsAndCultures');
        }
        if (supportedRegionsAndCultures.includes('multi') && supportedRegionsAndCultures.length < 3) {
            throw new Error('regionAndCulture \'multi\' is supported, but there are not enough regionAndCultures to support it');
        }
        const concreteRegionsAndCultures = supportedRegionsAndCultures.filter((regionAndCulture)=>regionAndCulture !== 'random');
        // Update the images module file
        yield createImageModule(repo, concreteRegionsAndCultures);
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L21vZHVsaWZ5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEdlbmVyYXRlcyBKUyBtb2R1bGVzIGZyb20gcmVzb3VyY2VzIHN1Y2ggYXMgaW1hZ2VzL3N0cmluZ3MvYXVkaW8vZXRjLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBmcywgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHdyaXRlRmlsZUFuZEdpdEFkZCBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvY29tbW9uL3dyaXRlRmlsZUFuZEdpdEFkZC5qcyc7XG5pbXBvcnQgZ3J1bnQgZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL25wbS1kZXBlbmRlbmNpZXMvZ3J1bnQuanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgbG9hZEZpbGVBc0RhdGFVUkkgZnJvbSAnLi4vY29tbW9uL2xvYWRGaWxlQXNEYXRhVVJJLmpzJztcbmltcG9ydCBwYXNjYWxDYXNlIGZyb20gJy4uL2NvbW1vbi9wYXNjYWxDYXNlLmpzJztcbmltcG9ydCB0b0xlc3NFc2NhcGVkU3RyaW5nIGZyb20gJy4uL2NvbW1vbi90b0xlc3NFc2NhcGVkU3RyaW5nLmpzJztcbmltcG9ydCBjcmVhdGVNaXBtYXAgZnJvbSAnLi9jcmVhdGVNaXBtYXAuanMnO1xuaW1wb3J0IGdldENvcHlyaWdodExpbmUgZnJvbSAnLi9nZXRDb3B5cmlnaHRMaW5lLmpzJztcblxuY29uc3Qgc3ZnbyA9IHJlcXVpcmUoICdzdmdvJyApO1xuXG4vLyBkaXNhYmxlIGxpbnQgaW4gY29tcGlsZWQgZmlsZXMsIGJlY2F1c2UgaXQgaW5jcmVhc2VzIHRoZSBsaW50aW5nIHRpbWVcbmNvbnN0IEhFQURFUiA9ICcvKiBlc2xpbnQtZGlzYWJsZSAqL1xcbi8qIEBmb3JtYXR0ZXI6b2ZmICovXFxuJztcblxuLy8gc3VwcG9ydGVkIGltYWdlIHR5cGVzLCBub3QgY2FzZS1zZW5zaXRpdmVcbmNvbnN0IElNQUdFX1NVRkZJWEVTID0gWyAnLnBuZycsICcuanBnJywgJy5jdXInLCAnLnN2ZycgXTtcblxuLy8gc3VwcG9ydGVkIHNvdW5kIGZpbGUgdHlwZXMsIG5vdCBjYXNlLXNlbnNpdGl2ZVxuY29uc3QgU09VTkRfU1VGRklYRVMgPSBbICcubXAzJywgJy53YXYnIF07XG5cbi8vIHN1cHBvcnRlZCBzaGFkZXIgZmlsZSB0eXBlcywgbm90IGNhc2Utc2Vuc2l0aXZlXG5jb25zdCBTSEFERVJfU1VGRklYRVMgPSBbICcuZ2xzbCcsICcudmVydCcsICcuc2hhZGVyJyBdO1xuXG4vKipcbiAqIFN0cmluZyByZXBsYWNlbWVudFxuICogQHBhcmFtIHN0cmluZyAtIHRoZSBzdHJpbmcgd2hpY2ggd2lsbCBiZSBzZWFyY2hlZFxuICogQHBhcmFtIHNlYXJjaCAtIHRoZSB0ZXh0IHRvIGJlIHJlcGxhY2VkXG4gKiBAcGFyYW0gcmVwbGFjZW1lbnQgLSB0aGUgbmV3IHRleHRcbiAqL1xuY29uc3QgcmVwbGFjZSA9ICggc3RyaW5nOiBzdHJpbmcsIHNlYXJjaDogc3RyaW5nLCByZXBsYWNlbWVudDogc3RyaW5nICkgPT4gc3RyaW5nLnNwbGl0KCBzZWFyY2ggKS5qb2luKCByZXBsYWNlbWVudCApO1xuXG4vKipcbiAqIEdldCB0aGUgcmVsYXRpdmUgZnJvbSB0aGUgbW9kdWxpZmllZCByZXBvIHRvIHRoZSBmaWxlbmFtZSB0aHJvdWdoIHRoZSBwcm92aWRlZCBzdWJkaXJlY3RvcnkuXG4gKi9cbmNvbnN0IGdldFJlbGF0aXZlUGF0aCA9ICggc3ViZGlyOiBzdHJpbmcsIGZpbGVuYW1lOiBzdHJpbmcgKSA9PiB7XG4gIHJldHVybiBgJHtzdWJkaXJ9LyR7ZmlsZW5hbWV9YDtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgcmVsYXRpdmUgcGF0aCB0byB0aGUgcm9vdCBiYXNlZCBvbiB0aGUgZGVwdGggb2YgYSByZXNvdXJjZVxuICovXG5jb25zdCBleHBhbmREb3RzID0gKCBhYnNwYXRoOiBzdHJpbmcgKTogc3RyaW5nID0+IHtcblxuICAvLyBGaW5kcyB0aGUgZGVwdGhzIG9mIGEgZGlyZWN0b3J5IHJlbGF0aXZlIHRvIHRoZSByb290IG9mIHdoZXJlIGdydW50LnJlY3Vyc2Ugd2FzIGNhbGxlZCBmcm9tIChhIHJlcG8gcm9vdClcbiAgY29uc3QgZGVwdGggPSBhYnNwYXRoLnNwbGl0KCAnLycgKS5sZW5ndGggLSAyO1xuICBsZXQgcGFyZW50RGlyZWN0b3J5ID0gJyc7XG4gIGZvciAoIGxldCBpID0gMDsgaSA8IGRlcHRoOyBpKysgKSB7XG4gICAgcGFyZW50RGlyZWN0b3J5ID0gYCR7cGFyZW50RGlyZWN0b3J5fS4uL2A7XG4gIH1cbiAgcmV0dXJuIHBhcmVudERpcmVjdG9yeTtcbn07XG5cbi8qKlxuICogT3V0cHV0IHdpdGggYW4gT1Mtc3BlY2lmaWMgRU9MIHNlcXVlbmNlLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzkwOFxuICovXG5jb25zdCBmaXhFT0wgPSAoIHN0cmluZzogc3RyaW5nICkgPT4gcmVwbGFjZSggc3RyaW5nLCAnXFxuJywgb3MuRU9MICk7XG5cbi8qKlxuICogVHJhbnNmb3JtIGFuIGltYWdlIGZpbGUgdG8gYSBKUyBmaWxlIHRoYXQgbG9hZHMgdGhlIGltYWdlLlxuICogQHBhcmFtIGFic3BhdGggLSB0aGUgYWJzb2x1dGUgcGF0aCBvZiB0aGUgaW1hZ2VcbiAqIEBwYXJhbSByZXBvIC0gcmVwb3NpdG9yeSBuYW1lIGZvciB0aGUgbW9kdWxpZnkgY29tbWFuZFxuICogQHBhcmFtIHN1YmRpciAtIHN1YmRpcmVjdG9yeSBsb2NhdGlvbiBmb3IgbW9kdWxpZmllZCBhc3NldHNcbiAqIEBwYXJhbSBmaWxlbmFtZSAtIG5hbWUgb2YgZmlsZSBiZWluZyBtb2R1bGlmaWVkXG4gKi9cbmNvbnN0IG1vZHVsaWZ5SW1hZ2UgPSBhc3luYyAoIGFic3BhdGg6IHN0cmluZywgcmVwbzogc3RyaW5nLCBzdWJkaXI6IHN0cmluZywgZmlsZW5hbWU6IHN0cmluZyApID0+IHtcblxuICBjb25zdCBkYXRhVVJJID0gbG9hZEZpbGVBc0RhdGFVUkkoIGFic3BhdGggKTtcblxuICBjb25zdCBjb250ZW50cyA9IGAke0hFQURFUn1cbmltcG9ydCBhc3luY0xvYWRlciBmcm9tICcke2V4cGFuZERvdHMoIGFic3BhdGggKX1waGV0LWNvcmUvanMvYXN5bmNMb2FkZXIuanMnO1xuXG5jb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuY29uc3QgdW5sb2NrID0gYXN5bmNMb2FkZXIuY3JlYXRlTG9jayggaW1hZ2UgKTtcbmltYWdlLm9ubG9hZCA9IHVubG9jaztcbmltYWdlLnNyYyA9ICcke2RhdGFVUkl9JztcbmV4cG9ydCBkZWZhdWx0IGltYWdlO2A7XG5cbiAgY29uc3QgdHNGaWxlbmFtZSA9IGNvbnZlcnRTdWZmaXgoIGZpbGVuYW1lLCAnLnRzJyApO1xuICBhd2FpdCB3cml0ZUZpbGVBbmRHaXRBZGQoIHJlcG8sIGdldFJlbGF0aXZlUGF0aCggc3ViZGlyLCB0c0ZpbGVuYW1lICksIGZpeEVPTCggY29udGVudHMgKSApO1xufTtcblxuLyoqXG4gKiBUcmFuc2Zvcm0gYW4gU1ZHIGltYWdlIGZpbGUgdG8gYSBKUyBmaWxlIHRoYXQgbG9hZHMgdGhlIGltYWdlLlxuICogQHBhcmFtIGFic3BhdGggLSB0aGUgYWJzb2x1dGUgcGF0aCBvZiB0aGUgaW1hZ2VcbiAqIEBwYXJhbSByZXBvIC0gcmVwb3NpdG9yeSBuYW1lIGZvciB0aGUgbW9kdWxpZnkgY29tbWFuZFxuICogQHBhcmFtIHN1YmRpciAtIHN1YmRpcmVjdG9yeSBsb2NhdGlvbiBmb3IgbW9kdWxpZmllZCBhc3NldHNcbiAqIEBwYXJhbSBmaWxlbmFtZSAtIG5hbWUgb2YgZmlsZSBiZWluZyBtb2R1bGlmaWVkXG4gKi9cbmNvbnN0IG1vZHVsaWZ5U1ZHID0gYXN5bmMgKCBhYnNwYXRoOiBzdHJpbmcsIHJlcG86IHN0cmluZywgc3ViZGlyOiBzdHJpbmcsIGZpbGVuYW1lOiBzdHJpbmcgKSA9PiB7XG5cbiAgY29uc3QgZmlsZUNvbnRlbnRzID0gZnMucmVhZEZpbGVTeW5jKCBhYnNwYXRoLCAndXRmLTgnICk7XG5cbiAgaWYgKCAhZmlsZUNvbnRlbnRzLmluY2x1ZGVzKCAnd2lkdGg9XCInICkgfHwgIWZpbGVDb250ZW50cy5pbmNsdWRlcyggJ2hlaWdodD1cIicgKSApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoIGBTVkcgZmlsZSAke2Fic3BhdGh9IGRvZXMgbm90IGNvbnRhaW4gd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzYCApO1xuICB9XG5cbiAgLy8gVXNlIFNWR08gdG8gb3B0aW1pemUgdGhlIFNWRyBjb250ZW50cywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9hcml0aG1ldGljL2lzc3Vlcy8yMDFcbiAgY29uc3Qgb3B0aW1pemVkQ29udGVudHMgPSBzdmdvLm9wdGltaXplKCBmaWxlQ29udGVudHMsIHtcbiAgICBtdWx0aXBhc3M6IHRydWUsXG4gICAgcGx1Z2luczogW1xuICAgICAge1xuICAgICAgICBuYW1lOiAncHJlc2V0LWRlZmF1bHQnLFxuICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICBvdmVycmlkZXM6IHtcbiAgICAgICAgICAgIC8vIFdlIGNhbid0IHNjYWxlIHRoaW5ncyBhbmQgZ2V0IHRoZSByaWdodCBib3VuZHMgaWYgdGhlIHZpZXcgYm94IGlzIHJlbW92ZWQuXG4gICAgICAgICAgICByZW1vdmVWaWV3Qm94OiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIF1cbiAgfSApLmRhdGE7XG5cbiAgY29uc3QgY29udGVudHMgPSBgJHtIRUFERVJ9XG5pbXBvcnQgYXN5bmNMb2FkZXIgZnJvbSAnJHtleHBhbmREb3RzKCBhYnNwYXRoICl9cGhldC1jb3JlL2pzL2FzeW5jTG9hZGVyLmpzJztcblxuY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbmNvbnN0IHVubG9jayA9IGFzeW5jTG9hZGVyLmNyZWF0ZUxvY2soIGltYWdlICk7XG5pbWFnZS5vbmxvYWQgPSB1bmxvY2s7XG5pbWFnZS5zcmMgPSBcXGBkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFxcJHtidG9hKCR7dG9MZXNzRXNjYXBlZFN0cmluZyggb3B0aW1pemVkQ29udGVudHMgKX0pfVxcYDtcbmV4cG9ydCBkZWZhdWx0IGltYWdlO2A7XG5cbiAgY29uc3QgdHNGaWxlbmFtZSA9IGNvbnZlcnRTdWZmaXgoIGZpbGVuYW1lLCAnLnRzJyApO1xuICBhd2FpdCB3cml0ZUZpbGVBbmRHaXRBZGQoIHJlcG8sIGdldFJlbGF0aXZlUGF0aCggc3ViZGlyLCB0c0ZpbGVuYW1lICksIGZpeEVPTCggY29udGVudHMgKSApO1xufTtcblxuLyoqXG4gKiBUcmFuc2Zvcm0gYW4gaW1hZ2UgZmlsZSB0byBhIEpTIGZpbGUgdGhhdCBsb2FkcyB0aGUgaW1hZ2UgYXMgYSBtaXBtYXAuXG4gKiBAcGFyYW0gYWJzcGF0aCAtIHRoZSBhYnNvbHV0ZSBwYXRoIG9mIHRoZSBpbWFnZVxuICogQHBhcmFtIHJlcG8gLSByZXBvc2l0b3J5IG5hbWUgZm9yIHRoZSBtb2R1bGlmeSBjb21tYW5kXG4gKiBAcGFyYW0gc3ViZGlyIC0gc3ViZGlyZWN0b3J5IGxvY2F0aW9uIGZvciBtb2R1bGlmaWVkIGFzc2V0c1xuICogQHBhcmFtIGZpbGVuYW1lIC0gbmFtZSBvZiBmaWxlIGJlaW5nIG1vZHVsaWZpZWRcbiAqL1xuY29uc3QgbW9kdWxpZnlNaXBtYXAgPSBhc3luYyAoIGFic3BhdGg6IHN0cmluZywgcmVwbzogc3RyaW5nLCBzdWJkaXI6IHN0cmluZywgZmlsZW5hbWU6IHN0cmluZyApID0+IHtcblxuICAvLyBEZWZhdWx0cy4gTk9URTogdXNpbmcgdGhlIGRlZmF1bHQgc2V0dGluZ3MgYmVjYXVzZSB3ZSBoYXZlIG5vdCBydW4gaW50byBhIG5lZWQsIHNlZVxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvODIwIGFuZCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvOTQ1XG4gIGNvbnN0IGNvbmZpZyA9IHtcbiAgICBsZXZlbDogNCwgLy8gbWF4aW11bSBsZXZlbFxuICAgIHF1YWxpdHk6IDk4XG4gIH07XG5cbiAgY29uc3QgbWlwbWFwTGV2ZWxzID0gYXdhaXQgY3JlYXRlTWlwbWFwKCBhYnNwYXRoLCBjb25maWcubGV2ZWwsIGNvbmZpZy5xdWFsaXR5ICk7XG4gIGNvbnN0IGVudHJpZXMgPSBtaXBtYXBMZXZlbHMubWFwKCAoIHsgd2lkdGgsIGhlaWdodCwgdXJsIH0gKSA9PiBgICBuZXcgTWlwbWFwRWxlbWVudCggJHt3aWR0aH0sICR7aGVpZ2h0fSwgJyR7dXJsfScgKWAgKTtcblxuICBjb25zdCBtaXBtYXBDb250ZW50cyA9IGAke0hFQURFUn1cbmltcG9ydCBNaXBtYXBFbGVtZW50IGZyb20gJyR7ZXhwYW5kRG90cyggYWJzcGF0aCApfXBoZXQtY29yZS9qcy9NaXBtYXBFbGVtZW50LmpzJztcblxuLy8gVGhlIGxldmVscyBpbiB0aGUgbWlwbWFwLiBTcGVjaWZ5IGV4cGxpY2l0IHR5cGVzIHJhdGhlciB0aGFuIGluZmVycmluZyB0byBhc3Npc3QgdGhlIHR5cGUgY2hlY2tlciwgZm9yIHRoaXMgYm9pbGVycGxhdGUgY2FzZS5cbmNvbnN0IG1pcG1hcHMgPSBbXG4ke2VudHJpZXMuam9pbiggJyxcXG4nICl9XG5dO1xuXG5leHBvcnQgZGVmYXVsdCBtaXBtYXBzO2A7XG4gIGNvbnN0IGpzRmlsZW5hbWUgPSBjb252ZXJ0U3VmZml4KCBmaWxlbmFtZSwgJy50cycgKTtcbiAgYXdhaXQgd3JpdGVGaWxlQW5kR2l0QWRkKCByZXBvLCBnZXRSZWxhdGl2ZVBhdGgoIHN1YmRpciwganNGaWxlbmFtZSApLCBmaXhFT0woIG1pcG1hcENvbnRlbnRzICkgKTtcbn07XG5cbi8qKlxuICogVHJhbnNmb3JtIGEgR0xTTCBzaGFkZXIgZmlsZSB0byBhIEpTIGZpbGUgdGhhdCBpcyByZXByZXNlbnRlZCBieSBhIHN0cmluZy5cbiAqIEBwYXJhbSBhYnNwYXRoIC0gdGhlIGFic29sdXRlIHBhdGggb2YgdGhlIGltYWdlXG4gKiBAcGFyYW0gcmVwbyAtIHJlcG9zaXRvcnkgbmFtZSBmb3IgdGhlIG1vZHVsaWZ5IGNvbW1hbmRcbiAqIEBwYXJhbSBzdWJkaXIgLSBzdWJkaXJlY3RvcnkgbG9jYXRpb24gZm9yIG1vZHVsaWZpZWQgYXNzZXRzXG4gKiBAcGFyYW0gZmlsZW5hbWUgLSBuYW1lIG9mIGZpbGUgYmVpbmcgbW9kdWxpZmllZFxuICovXG5jb25zdCBtb2R1bGlmeVNoYWRlciA9IGFzeW5jICggYWJzcGF0aDogc3RyaW5nLCByZXBvOiBzdHJpbmcsIHN1YmRpcjogc3RyaW5nLCBmaWxlbmFtZTogc3RyaW5nICkgPT4ge1xuXG4gIC8vIGxvYWQgdGhlIHNoYWRlciBmaWxlXG4gIGNvbnN0IHNoYWRlclN0cmluZyA9IGZzLnJlYWRGaWxlU3luYyggYWJzcGF0aCwgJ3V0Zi04JyApLnJlcGxhY2UoIC9cXHIvZywgJycgKTtcblxuICAvLyBvdXRwdXQgdGhlIGNvbnRlbnRzIG9mIHRoZSBmaWxlIHRoYXQgd2lsbCBkZWZpbmUgdGhlIHNoYWRlciBpbiBKUyBmb3JtYXRcbiAgY29uc3QgY29udGVudHMgPSBgJHtIRUFERVJ9XG5leHBvcnQgZGVmYXVsdCAke0pTT04uc3RyaW5naWZ5KCBzaGFkZXJTdHJpbmcgKX1gO1xuXG4gIGNvbnN0IGpzRmlsZW5hbWUgPSBjb252ZXJ0U3VmZml4KCBmaWxlbmFtZSwgJy5qcycgKTtcbiAgYXdhaXQgd3JpdGVGaWxlQW5kR2l0QWRkKCByZXBvLCBnZXRSZWxhdGl2ZVBhdGgoIHN1YmRpciwganNGaWxlbmFtZSApLCBmaXhFT0woIGNvbnRlbnRzICkgKTtcbn07XG5cbi8qKlxuICogRGVjb2RlIGEgc291bmQgZmlsZSBpbnRvIGEgV2ViIEF1ZGlvIEF1ZGlvQnVmZmVyLlxuICogQHBhcmFtIGFic3BhdGggLSB0aGUgYWJzb2x1dGUgcGF0aCBvZiB0aGUgaW1hZ2VcbiAqIEBwYXJhbSByZXBvIC0gcmVwb3NpdG9yeSBuYW1lIGZvciB0aGUgbW9kdWxpZnkgY29tbWFuZFxuICogQHBhcmFtIHN1YmRpciAtIHN1YmRpcmVjdG9yeSBsb2NhdGlvbiBmb3IgbW9kdWxpZmllZCBhc3NldHNcbiAqIEBwYXJhbSBmaWxlbmFtZSAtIG5hbWUgb2YgZmlsZSBiZWluZyBtb2R1bGlmaWVkXG4gKi9cbmNvbnN0IG1vZHVsaWZ5U291bmQgPSBhc3luYyAoIGFic3BhdGg6IHN0cmluZywgcmVwbzogc3RyaW5nLCBzdWJkaXI6IHN0cmluZywgZmlsZW5hbWU6IHN0cmluZyApID0+IHtcblxuICAvLyBsb2FkIHRoZSBzb3VuZCBmaWxlXG4gIGNvbnN0IGRhdGFVUkkgPSBsb2FkRmlsZUFzRGF0YVVSSSggYWJzcGF0aCApO1xuXG4gIC8vIG91dHB1dCB0aGUgY29udGVudHMgb2YgdGhlIGZpbGUgdGhhdCB3aWxsIGRlZmluZSB0aGUgc291bmQgaW4gSlMgZm9ybWF0XG4gIGNvbnN0IGNvbnRlbnRzID0gYCR7SEVBREVSfVxuaW1wb3J0IGFzeW5jTG9hZGVyIGZyb20gJyR7ZXhwYW5kRG90cyggYWJzcGF0aCApfXBoZXQtY29yZS9qcy9hc3luY0xvYWRlci5qcyc7XG5pbXBvcnQgYmFzZTY0U291bmRUb0J5dGVBcnJheSBmcm9tICcke2V4cGFuZERvdHMoIGFic3BhdGggKX10YW1iby9qcy9iYXNlNjRTb3VuZFRvQnl0ZUFycmF5LmpzJztcbmltcG9ydCBXcmFwcGVkQXVkaW9CdWZmZXIgZnJvbSAnJHtleHBhbmREb3RzKCBhYnNwYXRoICl9dGFtYm8vanMvV3JhcHBlZEF1ZGlvQnVmZmVyLmpzJztcbmltcG9ydCBwaGV0QXVkaW9Db250ZXh0IGZyb20gJyR7ZXhwYW5kRG90cyggYWJzcGF0aCApfXRhbWJvL2pzL3BoZXRBdWRpb0NvbnRleHQuanMnO1xuXG5jb25zdCBzb3VuZFVSSSA9ICcke2RhdGFVUkl9JztcbmNvbnN0IHNvdW5kQnl0ZUFycmF5ID0gYmFzZTY0U291bmRUb0J5dGVBcnJheSggcGhldEF1ZGlvQ29udGV4dCwgc291bmRVUkkgKTtcbmNvbnN0IHVubG9jayA9IGFzeW5jTG9hZGVyLmNyZWF0ZUxvY2soIHNvdW5kVVJJICk7XG5jb25zdCB3cmFwcGVkQXVkaW9CdWZmZXIgPSBuZXcgV3JhcHBlZEF1ZGlvQnVmZmVyKCk7XG5cbi8vIHNhZmUgd2F5IHRvIHVubG9ja1xubGV0IHVubG9ja2VkID0gZmFsc2U7XG5jb25zdCBzYWZlVW5sb2NrID0gKCkgPT4ge1xuICBpZiAoICF1bmxvY2tlZCApIHtcbiAgICB1bmxvY2soKTtcbiAgICB1bmxvY2tlZCA9IHRydWU7XG4gIH1cbn07XG5cbmNvbnN0IG9uRGVjb2RlU3VjY2VzcyA9IGRlY29kZWRBdWRpbyA9PiB7XG4gIGlmICggd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkudmFsdWUgPT09IG51bGwgKSB7XG4gICAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBkZWNvZGVkQXVkaW8gKTtcbiAgICBzYWZlVW5sb2NrKCk7XG4gIH1cbn07XG5jb25zdCBvbkRlY29kZUVycm9yID0gZGVjb2RlRXJyb3IgPT4ge1xuICBjb25zb2xlLndhcm4oICdkZWNvZGUgb2YgYXVkaW8gZGF0YSBmYWlsZWQsIHVzaW5nIHN0dWJiZWQgc291bmQsIGVycm9yOiAnICsgZGVjb2RlRXJyb3IgKTtcbiAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBwaGV0QXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlciggMSwgMSwgcGhldEF1ZGlvQ29udGV4dC5zYW1wbGVSYXRlICkgKTtcbiAgc2FmZVVubG9jaygpO1xufTtcbmNvbnN0IGRlY29kZVByb21pc2UgPSBwaGV0QXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YSggc291bmRCeXRlQXJyYXkuYnVmZmVyLCBvbkRlY29kZVN1Y2Nlc3MsIG9uRGVjb2RlRXJyb3IgKTtcbmlmICggZGVjb2RlUHJvbWlzZSApIHtcbiAgZGVjb2RlUHJvbWlzZVxuICAgIC50aGVuKCBkZWNvZGVkQXVkaW8gPT4ge1xuICAgICAgaWYgKCB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS52YWx1ZSA9PT0gbnVsbCApIHtcbiAgICAgICAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBkZWNvZGVkQXVkaW8gKTtcbiAgICAgICAgc2FmZVVubG9jaygpO1xuICAgICAgfVxuICAgIH0gKVxuICAgIC5jYXRjaCggZSA9PiB7XG4gICAgICBjb25zb2xlLndhcm4oICdwcm9taXNlIHJlamVjdGlvbiBjYXVnaHQgZm9yIGF1ZGlvIGRlY29kZSwgZXJyb3IgPSAnICsgZSApO1xuICAgICAgc2FmZVVubG9jaygpO1xuICAgIH0gKTtcbn1cbmV4cG9ydCBkZWZhdWx0IHdyYXBwZWRBdWRpb0J1ZmZlcjtgO1xuXG4gIGNvbnN0IGpzRmlsZW5hbWUgPSBjb252ZXJ0U3VmZml4KCBmaWxlbmFtZSwgJy5qcycgKTtcbiAgYXdhaXQgd3JpdGVGaWxlQW5kR2l0QWRkKCByZXBvLCBnZXRSZWxhdGl2ZVBhdGgoIHN1YmRpciwganNGaWxlbmFtZSApLCBmaXhFT0woIGNvbnRlbnRzICkgKTtcbn07XG5cbi8qKlxuICogQ29udmVydCAucG5nID0+IF9wbmdfbWlwbWFwLmpzLCBldGMuXG4gKlxuICogQHBhcmFtIGFic3BhdGggLSBmaWxlIG5hbWUgd2l0aCBhIHN1ZmZpeCBvciBhIHBhdGggdG8gaXRcbiAqIEBwYXJhbSBzdWZmaXggLSB0aGUgbmV3IHN1ZmZpeCwgc3VjaCBhcyAnLmpzJ1xuICovXG5jb25zdCBjb252ZXJ0U3VmZml4ID0gKCBhYnNwYXRoOiBzdHJpbmcsIHN1ZmZpeDogc3RyaW5nICkgPT4ge1xuICBjb25zdCBsYXN0RG90SW5kZXggPSBhYnNwYXRoLmxhc3RJbmRleE9mKCAnLicgKTtcbiAgcmV0dXJuIGAke2Fic3BhdGguc3Vic3RyaW5nKCAwLCBsYXN0RG90SW5kZXggKX1fJHthYnNwYXRoLnN1YnN0cmluZyggbGFzdERvdEluZGV4ICsgMSApfSR7c3VmZml4fWA7XG59O1xuXG4vKipcbiAqIERldGVybWluZXMgdGhlIHN1ZmZpeCBmcm9tIGEgZmlsZW5hbWUsIGV2ZXJ5dGhpbmcgYWZ0ZXIgdGhlIGZpbmFsICcuJ1xuICovXG5jb25zdCBnZXRTdWZmaXggPSAoIGZpbGVuYW1lOiBzdHJpbmcgKSA9PiB7XG4gIGNvbnN0IGluZGV4ID0gZmlsZW5hbWUubGFzdEluZGV4T2YoICcuJyApO1xuICByZXR1cm4gZmlsZW5hbWUuc3Vic3RyaW5nKCBpbmRleCApO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgKi5qcyBmaWxlIGNvcnJlc3BvbmRpbmcgdG8gbWF0Y2hpbmcgcmVzb3VyY2VzIHN1Y2ggYXMgaW1hZ2VzIG9yIHNvdW5kcy5cbiAqL1xuY29uc3QgbW9kdWxpZnlGaWxlID0gYXN5bmMgKCBhYnNwYXRoOiBzdHJpbmcsIHJvb3RkaXI6IHN0cmluZywgc3ViZGlyOiBzdHJpbmcsIGZpbGVuYW1lOiBzdHJpbmcsIHJlcG86IHN0cmluZyApID0+IHtcblxuICBpZiAoIHN1YmRpciAmJiAoIHN1YmRpci5zdGFydHNXaXRoKCAnaW1hZ2VzJyApIHx8XG5cbiAgICAgICAgICAgICAgICAgICAvLyBmb3IgYnJhbmRcbiAgICAgICAgICAgICAgICAgICBzdWJkaXIuc3RhcnRzV2l0aCggJ3BoZXQvaW1hZ2VzJyApIHx8XG4gICAgICAgICAgICAgICAgICAgc3ViZGlyLnN0YXJ0c1dpdGgoICdwaGV0LWlvL2ltYWdlcycgKSB8fFxuICAgICAgICAgICAgICAgICAgIHN1YmRpci5zdGFydHNXaXRoKCAnYWRhcHRlZC1mcm9tLXBoZXQvaW1hZ2VzJyApIClcbiAgICAgICAmJiBJTUFHRV9TVUZGSVhFUy5pbmNsdWRlcyggZ2V0U3VmZml4KCBmaWxlbmFtZSApICkgKSB7XG4gICAgaWYgKCBnZXRTdWZmaXgoIGZpbGVuYW1lICkgPT09ICcuc3ZnJyApIHtcbiAgICAgIGF3YWl0IG1vZHVsaWZ5U1ZHKCBhYnNwYXRoLCByZXBvLCBzdWJkaXIsIGZpbGVuYW1lICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgYXdhaXQgbW9kdWxpZnlJbWFnZSggYWJzcGF0aCwgcmVwbywgc3ViZGlyLCBmaWxlbmFtZSApO1xuICAgIH1cbiAgfVxuXG4gIGlmICggc3ViZGlyICYmICggc3ViZGlyLnN0YXJ0c1dpdGgoICdtaXBtYXBzJyApIHx8XG5cbiAgICAgICAgICAgICAgICAgICAvLyBmb3IgYnJhbmRcbiAgICAgICAgICAgICAgICAgICBzdWJkaXIuc3RhcnRzV2l0aCggJ3BoZXQvbWlwbWFwcycgKSB8fFxuICAgICAgICAgICAgICAgICAgIHN1YmRpci5zdGFydHNXaXRoKCAncGhldC1pby9taXBtYXBzJyApIHx8XG4gICAgICAgICAgICAgICAgICAgc3ViZGlyLnN0YXJ0c1dpdGgoICdhZGFwdGVkLWZyb20tcGhldC9taXBtYXBzJyApIClcbiAgICAgICAmJiBJTUFHRV9TVUZGSVhFUy5pbmNsdWRlcyggZ2V0U3VmZml4KCBmaWxlbmFtZSApICkgKSB7XG4gICAgYXdhaXQgbW9kdWxpZnlNaXBtYXAoIGFic3BhdGgsIHJlcG8sIHN1YmRpciwgZmlsZW5hbWUgKTtcbiAgfVxuXG4gIGlmICggc3ViZGlyICYmIHN1YmRpci5zdGFydHNXaXRoKCAnc291bmRzJyApICYmIFNPVU5EX1NVRkZJWEVTLmluY2x1ZGVzKCBnZXRTdWZmaXgoIGZpbGVuYW1lICkgKSApIHtcbiAgICBhd2FpdCBtb2R1bGlmeVNvdW5kKCBhYnNwYXRoLCByZXBvLCBzdWJkaXIsIGZpbGVuYW1lICk7XG4gIH1cblxuICBpZiAoIHN1YmRpciAmJiBzdWJkaXIuc3RhcnRzV2l0aCggJ3NoYWRlcnMnICkgJiYgU0hBREVSX1NVRkZJWEVTLmluY2x1ZGVzKCBnZXRTdWZmaXgoIGZpbGVuYW1lICkgKSApIHtcbiAgICBhd2FpdCBtb2R1bGlmeVNoYWRlciggYWJzcGF0aCwgcmVwbywgc3ViZGlyLCBmaWxlbmFtZSApO1xuICB9XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgdGhlIGltYWdlIG1vZHVsZSBhdCBqcy8ke18uY2FtZWxDYXNlKCByZXBvICl9SW1hZ2VzLmpzIGZvciByZXBvcyB0aGF0IG5lZWQgaXQuXG4gKi9cbmNvbnN0IGNyZWF0ZUltYWdlTW9kdWxlID0gYXN5bmMgKCByZXBvOiBzdHJpbmcsIHN1cHBvcnRlZFJlZ2lvbnNBbmRDdWx0dXJlczogc3RyaW5nW10gKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIGNvbnN0IHNwZWM6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIHN0cmluZz4+ID0gSlNPTi5wYXJzZSggcmVhZEZpbGVTeW5jKCBgLi4vJHtyZXBvfS8ke3JlcG99LWltYWdlcy5qc29uYCwgJ3V0ZjgnICkgKTtcbiAgY29uc3QgbmFtZXNwYWNlID0gXy5jYW1lbENhc2UoIHJlcG8gKTtcbiAgY29uc3QgaW1hZ2VNb2R1bGVOYW1lID0gYCR7cGFzY2FsQ2FzZSggcmVwbyApfUltYWdlc2A7XG4gIGNvbnN0IHJlbGF0aXZlSW1hZ2VNb2R1bGVGaWxlID0gYGpzLyR7aW1hZ2VNb2R1bGVOYW1lfS50c2A7XG5cbiAgY29uc3QgcHJvdmlkZWRSZWdpb25zQW5kQ3VsdHVyZXMgPSBPYmplY3Qua2V5cyggc3BlYyApO1xuXG4gIC8vIEVuc3VyZSBvdXIgcmVnaW9uQW5kQ3VsdHVyZXMgaW4gdGhlIC1pbWFnZXMuanNvbiBmaWxlIG1hdGNoIHdpdGggdGhlIHN1cHBvcnRlZFJlZ2lvbnNBbmRDdWx0dXJlcyBpbiB0aGUgcGFja2FnZS5qc29uXG4gIHN1cHBvcnRlZFJlZ2lvbnNBbmRDdWx0dXJlcy5mb3JFYWNoKCByZWdpb25BbmRDdWx0dXJlID0+IHtcbiAgICBpZiAoICFwcm92aWRlZFJlZ2lvbnNBbmRDdWx0dXJlcy5pbmNsdWRlcyggcmVnaW9uQW5kQ3VsdHVyZSApICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCBgcmVnaW9uQW5kQ3VsdHVyZSAnJHtyZWdpb25BbmRDdWx0dXJlfScgaXMgcmVxdWlyZWQsIGJ1dCBub3QgZm91bmQgaW4gJHtyZXBvfS1pbWFnZXMuanNvbmAgKTtcbiAgICB9XG4gIH0gKTtcbiAgcHJvdmlkZWRSZWdpb25zQW5kQ3VsdHVyZXMuZm9yRWFjaCggcmVnaW9uQW5kQ3VsdHVyZSA9PiB7XG4gICAgaWYgKCAhc3VwcG9ydGVkUmVnaW9uc0FuZEN1bHR1cmVzLmluY2x1ZGVzKCByZWdpb25BbmRDdWx0dXJlICkgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGByZWdpb25BbmRDdWx0dXJlICcke3JlZ2lvbkFuZEN1bHR1cmV9JyBpcyBub3Qgc3VwcG9ydGVkLCBidXQgZm91bmQgaW4gJHtyZXBvfS1pbWFnZXMuanNvbmAgKTtcbiAgICB9XG4gIH0gKTtcblxuICBjb25zdCBpbWFnZU5hbWVzOiBzdHJpbmdbXSA9IF8udW5pcSggcHJvdmlkZWRSZWdpb25zQW5kQ3VsdHVyZXMuZmxhdE1hcCggcmVnaW9uQW5kQ3VsdHVyZSA9PiB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKCBzcGVjWyByZWdpb25BbmRDdWx0dXJlIF0gKTtcbiAgfSApICkuc29ydCgpO1xuXG4gIGNvbnN0IGltYWdlRmlsZXM6IHN0cmluZ1tdID0gXy51bmlxKCBwcm92aWRlZFJlZ2lvbnNBbmRDdWx0dXJlcy5mbGF0TWFwKCByZWdpb25BbmRDdWx0dXJlID0+IHtcbiAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyggc3BlY1sgcmVnaW9uQW5kQ3VsdHVyZSBdICk7XG4gIH0gKSApLnNvcnQoKTtcblxuICAvLyBEbyBpbWFnZXMgZXhpc3Q/XG4gIGltYWdlRmlsZXMuZm9yRWFjaCggaW1hZ2VGaWxlID0+IHtcbiAgICBpZiAoICFmcy5leGlzdHNTeW5jKCBgLi4vJHtyZXBvfS8ke2ltYWdlRmlsZX1gICkgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGBJbWFnZSBmaWxlICR7aW1hZ2VGaWxlfSBpcyByZWZlcmVuY2VkIGluICR7cmVwb30taW1hZ2VzLmpzb24sIGJ1dCBkb2VzIG5vdCBleGlzdGAgKTtcbiAgICB9XG4gIH0gKTtcblxuICAvLyBFbnN1cmUgdGhhdCBhbGwgaW1hZ2UgbmFtZXMgYXJlIHByb3ZpZGVkIGZvciBhbGwgcmVnaW9uQW5kQ3VsdHVyZXNcbiAgcHJvdmlkZWRSZWdpb25zQW5kQ3VsdHVyZXMuZm9yRWFjaCggcmVnaW9uQW5kQ3VsdHVyZSA9PiB7XG4gICAgaW1hZ2VOYW1lcy5mb3JFYWNoKCBpbWFnZU5hbWUgPT4ge1xuICAgICAgaWYgKCAhc3BlY1sgcmVnaW9uQW5kQ3VsdHVyZSBdLmhhc093blByb3BlcnR5KCBpbWFnZU5hbWUgKSApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgSW1hZ2UgbmFtZSAke2ltYWdlTmFtZX0gaXMgbm90IHByb3ZpZGVkIGZvciByZWdpb25BbmRDdWx0dXJlICR7cmVnaW9uQW5kQ3VsdHVyZX0gKGJ1dCBwcm92aWRlZCBmb3Igb3RoZXJzKWAgKTtcbiAgICAgIH1cbiAgICB9ICk7XG4gIH0gKTtcblxuICBjb25zdCBnZXRJbXBvcnROYW1lID0gKCBpbWFnZUZpbGU6IHN0cmluZyApID0+IHBhdGguYmFzZW5hbWUoIGltYWdlRmlsZSwgcGF0aC5leHRuYW1lKCBpbWFnZUZpbGUgKSApO1xuXG4gIC8vIENoZWNrIHRoYXQgaW1wb3J0IG5hbWVzIGFyZSB1bmlxdWVcbiAgLy8gTk9URTogd2UgY291bGQgZGlzYW1iaWd1YXRlIGluIHRoZSBmdXR1cmUgaW4gYW4gYXV0b21hdGVkIHdheSBmYWlybHkgZWFzaWx5LCBidXQgc2hvdWxkIGl0IGJlIGRvbmU/XG4gIGlmICggXy51bmlxKCBpbWFnZUZpbGVzLm1hcCggZ2V0SW1wb3J0TmFtZSApICkubGVuZ3RoICE9PSBpbWFnZUZpbGVzLmxlbmd0aCApIHtcbiAgICAvLyBGaW5kIGFuZCByZXBvcnQgdGhlIG5hbWUgY29sbGlzaW9uXG4gICAgY29uc3QgaW1wb3J0TmFtZXMgPSBpbWFnZUZpbGVzLm1hcCggZ2V0SW1wb3J0TmFtZSApO1xuICAgIGNvbnN0IGR1cGxpY2F0ZXMgPSBpbXBvcnROYW1lcy5maWx0ZXIoICggbmFtZSwgaW5kZXggKSA9PiBpbXBvcnROYW1lcy5pbmRleE9mKCBuYW1lICkgIT09IGluZGV4ICk7XG4gICAgaWYgKCBkdXBsaWNhdGVzLmxlbmd0aCApIHsgLy8gc2FuaXR5IGNoZWNrIVxuICAgICAgY29uc3QgZmlyc3REdXBsaWNhdGUgPSBkdXBsaWNhdGVzWyAwIF07XG4gICAgICBjb25zdCBvcmlnaW5hbE5hbWVzID0gaW1hZ2VGaWxlcy5maWx0ZXIoIGltYWdlRmlsZSA9PiBnZXRJbXBvcnROYW1lKCBpbWFnZUZpbGUgKSA9PT0gZmlyc3REdXBsaWNhdGUgKTtcbiAgICAgIHRocm93IG5ldyBFcnJvciggYE11bHRpcGxlIGltYWdlcyByZXN1bHQgaW4gdGhlIHNhbWUgaW1wb3J0IG5hbWUgJHtmaXJzdER1cGxpY2F0ZX06ICR7b3JpZ2luYWxOYW1lcy5qb2luKCAnLCAnICl9YCApO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGNvcHlyaWdodExpbmUgPSBhd2FpdCBnZXRDb3B5cmlnaHRMaW5lKCByZXBvLCByZWxhdGl2ZUltYWdlTW9kdWxlRmlsZSApO1xuICBhd2FpdCB3cml0ZUZpbGVBbmRHaXRBZGQoIHJlcG8sIHJlbGF0aXZlSW1hZ2VNb2R1bGVGaWxlLCBmaXhFT0woXG4gICAgYCR7Y29weXJpZ2h0TGluZX1cbi8qIGVzbGludC1kaXNhYmxlICovXG4vKiBAZm9ybWF0dGVyOm9mZiAqL1xuLyoqXG4gKiBBdXRvLWdlbmVyYXRlZCBmcm9tIG1vZHVsaWZ5LCBETyBOT1QgbWFudWFsbHkgbW9kaWZ5LlxuICovXG4gXG5pbXBvcnQgTG9jYWxpemVkSW1hZ2VQcm9wZXJ0eSBmcm9tICcuLi8uLi9qb2lzdC9qcy9pMThuL0xvY2FsaXplZEltYWdlUHJvcGVydHkuanMnO1xuaW1wb3J0ICR7bmFtZXNwYWNlfSBmcm9tICcuLyR7bmFtZXNwYWNlfS5qcyc7XG4ke2ltYWdlRmlsZXMubWFwKCBpbWFnZUZpbGUgPT4gYGltcG9ydCAke2dldEltcG9ydE5hbWUoIGltYWdlRmlsZSApfSBmcm9tICcuLi8ke2ltYWdlRmlsZS5yZXBsYWNlKCAnLnRzJywgJy5qcycgKX0nO2AgKS5qb2luKCAnXFxuJyApfVxuXG5jb25zdCAke2ltYWdlTW9kdWxlTmFtZX0gPSB7XG4gICR7aW1hZ2VOYW1lcy5tYXAoIGltYWdlTmFtZSA9PlxuICAgICAgYCR7aW1hZ2VOYW1lfUltYWdlUHJvcGVydHk6IG5ldyBMb2NhbGl6ZWRJbWFnZVByb3BlcnR5KCAnJHtpbWFnZU5hbWV9Jywge1xuICAgICR7c3VwcG9ydGVkUmVnaW9uc0FuZEN1bHR1cmVzLm1hcCggcmVnaW9uQW5kQ3VsdHVyZSA9PiBgJHtyZWdpb25BbmRDdWx0dXJlfTogJHtnZXRJbXBvcnROYW1lKCBzcGVjWyByZWdpb25BbmRDdWx0dXJlIF1bIGltYWdlTmFtZSBdICl9YCApLmpvaW4oICcsXFxuICAgICcgKX1cbiAgfSApYCApLmpvaW4oICcsXFxuICAnICl9XG59O1xuXG4ke25hbWVzcGFjZX0ucmVnaXN0ZXIoICcke2ltYWdlTW9kdWxlTmFtZX0nLCAke2ltYWdlTW9kdWxlTmFtZX0gKTtcblxuZXhwb3J0IGRlZmF1bHQgJHtpbWFnZU1vZHVsZU5hbWV9O1xuYCApICk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgdGhlIHN0cmluZyBtb2R1bGUgYXQganMvJHtfLmNhbWVsQ2FzZSggcmVwbyApfVN0cmluZ3MuanMgZm9yIHJlcG9zIHRoYXQgbmVlZCBpdC5cbiAqL1xuY29uc3QgY3JlYXRlU3RyaW5nTW9kdWxlID0gYXN5bmMgKCByZXBvOnN0cmluZyApID0+IHtcblxuICBjb25zdCBwYWNrYWdlT2JqZWN0ID0gSlNPTi5wYXJzZSggcmVhZEZpbGVTeW5jKCBgLi4vJHtyZXBvfS9wYWNrYWdlLmpzb25gLCAndXRmOCcgKSApO1xuICBjb25zdCBzdHJpbmdNb2R1bGVOYW1lID0gYCR7cGFzY2FsQ2FzZSggcmVwbyApfVN0cmluZ3NgO1xuICBjb25zdCByZWxhdGl2ZVN0cmluZ01vZHVsZUZpbGUgPSBganMvJHtzdHJpbmdNb2R1bGVOYW1lfS50c2A7XG4gIGNvbnN0IHN0cmluZ01vZHVsZUZpbGVKUyA9IGAuLi8ke3JlcG99L2pzLyR7c3RyaW5nTW9kdWxlTmFtZX0uanNgO1xuICBjb25zdCBuYW1lc3BhY2UgPSBfLmNhbWVsQ2FzZSggcmVwbyApO1xuXG4gIGlmICggZnMuZXhpc3RzU3luYyggc3RyaW5nTW9kdWxlRmlsZUpTICkgKSB7XG4gICAgY29uc29sZS5sb2coICdGb3VuZCBKUyBzdHJpbmcgZmlsZSBpbiBUUyByZXBvLiAgSXQgc2hvdWxkIGJlIGRlbGV0ZWQgbWFudWFsbHkuICAnICsgc3RyaW5nTW9kdWxlRmlsZUpTICk7XG4gIH1cblxuICBjb25zdCBjb3B5cmlnaHRMaW5lID0gYXdhaXQgZ2V0Q29weXJpZ2h0TGluZSggcmVwbywgcmVsYXRpdmVTdHJpbmdNb2R1bGVGaWxlICk7XG4gIGF3YWl0IHdyaXRlRmlsZUFuZEdpdEFkZCggcmVwbywgcmVsYXRpdmVTdHJpbmdNb2R1bGVGaWxlLCBmaXhFT0woXG4gICAgYCR7Y29weXJpZ2h0TGluZX1cblxuLyogZXNsaW50LWRpc2FibGUgKi9cbi8qIEBmb3JtYXR0ZXI6b2ZmICovXG5cbi8qKlxuICogQXV0by1nZW5lcmF0ZWQgZnJvbSBtb2R1bGlmeSwgRE8gTk9UIG1hbnVhbGx5IG1vZGlmeS5cbiAqL1xuXG5pbXBvcnQgZ2V0U3RyaW5nTW9kdWxlIGZyb20gJy4uLy4uL2NoaXBwZXIvanMvYnJvd3Nlci9nZXRTdHJpbmdNb2R1bGUuanMnO1xuaW1wb3J0IHR5cGUgTG9jYWxpemVkU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vY2hpcHBlci9qcy9icm93c2VyL0xvY2FsaXplZFN0cmluZ1Byb3BlcnR5LmpzJztcbmltcG9ydCAke25hbWVzcGFjZX0gZnJvbSAnLi8ke25hbWVzcGFjZX0uanMnO1xuXG50eXBlIFN0cmluZ3NUeXBlID0gJHtnZXRTdHJpbmdUeXBlcyggcmVwbyApfTtcblxuY29uc3QgJHtzdHJpbmdNb2R1bGVOYW1lfSA9IGdldFN0cmluZ01vZHVsZSggJyR7cGFja2FnZU9iamVjdC5waGV0LnJlcXVpcmVqc05hbWVzcGFjZX0nICkgYXMgU3RyaW5nc1R5cGU7XG5cbiR7bmFtZXNwYWNlfS5yZWdpc3RlciggJyR7c3RyaW5nTW9kdWxlTmFtZX0nLCAke3N0cmluZ01vZHVsZU5hbWV9ICk7XG5cbmV4cG9ydCBkZWZhdWx0ICR7c3RyaW5nTW9kdWxlTmFtZX07XG5gICkgKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhICouZC50cyBmaWxlIHRoYXQgcmVwcmVzZW50cyB0aGUgdHlwZXMgb2YgdGhlIHN0cmluZ3MgZm9yIHRoZSByZXBvLlxuICovXG5jb25zdCBnZXRTdHJpbmdUeXBlcyA9ICggcmVwbzogc3RyaW5nICkgPT4ge1xuICBjb25zdCBwYWNrYWdlT2JqZWN0ID0gSlNPTi5wYXJzZSggcmVhZEZpbGVTeW5jKCBgLi4vJHtyZXBvfS9wYWNrYWdlLmpzb25gLCAndXRmOCcgKSApO1xuICBjb25zdCBqc29uID0gSlNPTi5wYXJzZSggcmVhZEZpbGVTeW5jKCBgLi4vJHtyZXBvfS8ke3JlcG99LXN0cmluZ3NfZW4uanNvbmAsICd1dGY4JyApICk7XG5cbiAgLy8gVHJhY2sgcGF0aHMgdG8gYWxsIHRoZSBrZXlzIHdpdGggdmFsdWVzLlxuICBjb25zdCBhbGw6SW50ZW50aW9uYWxBbnlbXSA9IFtdO1xuXG4gIC8vIFJlY3Vyc2l2ZWx5IGNvbGxlY3QgYWxsIG9mIHRoZSBwYXRocyB0byBrZXlzIHdpdGggdmFsdWVzLlxuICBjb25zdCB2aXNpdCA9ICggbGV2ZWw6SW50ZW50aW9uYWxBbnksIHBhdGg6c3RyaW5nW10gKSA9PiB7XG4gICAgT2JqZWN0LmtleXMoIGxldmVsICkuZm9yRWFjaCgga2V5ID0+IHtcbiAgICAgIGlmICgga2V5ICE9PSAnX2NvbW1lbnQnICkge1xuICAgICAgICBpZiAoIGxldmVsWyBrZXkgXS52YWx1ZSAmJiB0eXBlb2YgbGV2ZWxbIGtleSBdLnZhbHVlID09PSAnc3RyaW5nJyApIHtcblxuICAgICAgICAgIC8vIERlcHJlY2F0ZWQgbWVhbnMgdGhhdCBpdCBpcyB1c2VkIGJ5IHJlbGVhc2UgYnJhbmNoZXMsIGJ1dCBzaG91bGRuJ3QgYmUgdXNlZCBpbiBuZXcgY29kZSwgc28ga2VlcCBpdCBvdXQgb2YgdGhlIHR5cGUuXG4gICAgICAgICAgaWYgKCAhbGV2ZWxbIGtleSBdLmRlcHJlY2F0ZWQgKSB7XG4gICAgICAgICAgICBhbGwucHVzaCggeyBwYXRoOiBbIC4uLnBhdGgsIGtleSBdLCB2YWx1ZTogbGV2ZWxbIGtleSBdLnZhbHVlIH0gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdmlzaXQoIGxldmVsWyBrZXkgXSwgWyAuLi5wYXRoLCBrZXkgXSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSApO1xuICB9O1xuICB2aXNpdCgganNvbiwgW10gKTtcblxuICAvLyBUcmFuc2Zvcm0gdG8gYSBuZXcgc3RydWN0dXJlIHRoYXQgbWF0Y2hlcyB0aGUgdHlwZXMgd2UgYWNjZXNzIGF0IHJ1bnRpbWUuXG4gIGNvbnN0IHN0cnVjdHVyZTpJbnRlbnRpb25hbEFueSA9IHt9O1xuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhbGwubGVuZ3RoOyBpKysgKSB7XG4gICAgY29uc3QgYWxsRWxlbWVudCA9IGFsbFsgaSBdO1xuICAgIGNvbnN0IHBhdGggPSBhbGxFbGVtZW50LnBhdGg7XG4gICAgbGV0IGxldmVsID0gc3RydWN0dXJlO1xuICAgIGZvciAoIGxldCBrID0gMDsgayA8IHBhdGgubGVuZ3RoOyBrKysgKSB7XG4gICAgICBjb25zdCBwYXRoRWxlbWVudCA9IHBhdGhbIGsgXTtcbiAgICAgIGNvbnN0IHRva2VucyA9IHBhdGhFbGVtZW50LnNwbGl0KCAnLicgKTtcbiAgICAgIGZvciAoIGxldCBtID0gMDsgbSA8IHRva2Vucy5sZW5ndGg7IG0rKyApIHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSB0b2tlbnNbIG0gXTtcblxuICAgICAgICBhc3NlcnQoICF0b2tlbi5pbmNsdWRlcyggJzsnICksIGBUb2tlbiAke3Rva2VufSBjYW5ub3QgaW5jbHVkZSBmb3JiaWRkZW4gY2hhcmFjdGVyc2AgKTtcbiAgICAgICAgYXNzZXJ0KCAhdG9rZW4uaW5jbHVkZXMoICcsJyApLCBgVG9rZW4gJHt0b2tlbn0gY2Fubm90IGluY2x1ZGUgZm9yYmlkZGVuIGNoYXJhY3RlcnNgICk7XG4gICAgICAgIGFzc2VydCggIXRva2VuLmluY2x1ZGVzKCAnICcgKSwgYFRva2VuICR7dG9rZW59IGNhbm5vdCBpbmNsdWRlIGZvcmJpZGRlbiBjaGFyYWN0ZXJzYCApO1xuXG4gICAgICAgIGlmICggayA9PT0gcGF0aC5sZW5ndGggLSAxICYmIG0gPT09IHRva2Vucy5sZW5ndGggLSAxICkge1xuICAgICAgICAgIGlmICggISggcGFja2FnZU9iamVjdC5waGV0ICYmIHBhY2thZ2VPYmplY3QucGhldC5zaW1GZWF0dXJlcyAmJiBwYWNrYWdlT2JqZWN0LnBoZXQuc2ltRmVhdHVyZXMuc3VwcG9ydHNEeW5hbWljTG9jYWxlICkgKSB7XG4gICAgICAgICAgICBsZXZlbFsgdG9rZW4gXSA9ICd7e1NUUklOR319JzsgLy8gaW5zdGVhZCBvZiB2YWx1ZSA9IGFsbEVsZW1lbnQudmFsdWVcbiAgICAgICAgICB9XG4gICAgICAgICAgbGV2ZWxbIGAke3Rva2VufVN0cmluZ1Byb3BlcnR5YCBdID0gJ3t7U1RSSU5HX1BST1BFUlRZfX0nO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGxldmVsWyB0b2tlbiBdID0gbGV2ZWxbIHRva2VuIF0gfHwge307XG4gICAgICAgICAgbGV2ZWwgPSBsZXZlbFsgdG9rZW4gXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGxldCB0ZXh0ID0gSlNPTi5zdHJpbmdpZnkoIHN0cnVjdHVyZSwgbnVsbCwgMiApO1xuXG4gIC8vIFVzZSBzaW5nbGUgcXVvdGVzIGluc3RlYWQgb2YgdGhlIGRvdWJsZSBxdW90ZXMgZnJvbSBKU09OXG4gIHRleHQgPSByZXBsYWNlKCB0ZXh0LCAnXCInLCAnXFwnJyApO1xuXG4gIHRleHQgPSByZXBsYWNlKCB0ZXh0LCAnXFwne3tTVFJJTkd9fVxcJycsICdzdHJpbmcnICk7XG4gIHRleHQgPSByZXBsYWNlKCB0ZXh0LCAnXFwne3tTVFJJTkdfUFJPUEVSVFl9fVxcJycsICdMb2NhbGl6ZWRTdHJpbmdQcm9wZXJ0eScgKTtcblxuICAvLyBBZGQgOyB0byB0aGUgbGFzdCBpbiB0aGUgbGlzdFxuICB0ZXh0ID0gcmVwbGFjZSggdGV4dCwgJzogc3RyaW5nXFxuJywgJzogc3RyaW5nO1xcbicgKTtcbiAgdGV4dCA9IHJlcGxhY2UoIHRleHQsICc6IExvY2FsaXplZFN0cmluZ1Byb3BlcnR5XFxuJywgJzogTG9jYWxpemVkU3RyaW5nUHJvcGVydHk7XFxuJyApO1xuXG4gIC8vIFVzZSA7IGluc3RlYWQgb2YgLFxuICB0ZXh0ID0gcmVwbGFjZSggdGV4dCwgJywnLCAnOycgKTtcblxuICByZXR1cm4gdGV4dDtcbn07XG5cbi8qKlxuICogRW50cnkgcG9pbnQgZm9yIG1vZHVsaWZ5LCB3aGljaCB0cmFuc2Zvcm1zIGFsbCBvZiB0aGUgcmVzb3VyY2VzIGluIGEgcmVwbyB0byAqLmpzIGZpbGVzLlxuICogQHBhcmFtIHJlcG8gLSB0aGUgbmFtZSBvZiBhIHJlcG8sIHN1Y2ggYXMgJ2pvaXN0J1xuICovXG5leHBvcnQgZGVmYXVsdCBhc3luYyAoIHJlcG86IHN0cmluZyApOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgY29uc29sZS5sb2coIGBtb2R1bGlmeWluZyAke3JlcG99YCApO1xuICBjb25zdCByZWxhdGl2ZUZpbGVzOkludGVudGlvbmFsQW55W10gPSBbXTtcbiAgZ3J1bnQuZmlsZS5yZWN1cnNlKCBgLi4vJHtyZXBvfWAsIGFzeW5jICggYWJzcGF0aDpzdHJpbmcsIHJvb3RkaXI6c3RyaW5nLCBzdWJkaXI6c3RyaW5nLCBmaWxlbmFtZTpzdHJpbmcgKSA9PiB7XG4gICAgcmVsYXRpdmVGaWxlcy5wdXNoKCB7IGFic3BhdGg6IGFic3BhdGgsIHJvb3RkaXI6IHJvb3RkaXIsIHN1YmRpcjogc3ViZGlyLCBmaWxlbmFtZTogZmlsZW5hbWUgfSApO1xuICB9ICk7XG5cbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgcmVsYXRpdmVGaWxlcy5sZW5ndGg7IGkrKyApIHtcbiAgICBjb25zdCBlbnRyeSA9IHJlbGF0aXZlRmlsZXNbIGkgXTtcbiAgICBhd2FpdCBtb2R1bGlmeUZpbGUoIGVudHJ5LmFic3BhdGgsIGVudHJ5LnJvb3RkaXIsIGVudHJ5LnN1YmRpciwgZW50cnkuZmlsZW5hbWUsIHJlcG8gKTtcbiAgfVxuXG4gIGNvbnN0IHBhY2thZ2VPYmplY3QgPSBKU09OLnBhcnNlKCByZWFkRmlsZVN5bmMoIGAuLi8ke3JlcG99L3BhY2thZ2UuanNvbmAsICd1dGY4JyApICk7XG5cbiAgLy8gU3RyaW5ncyBtb2R1bGUgZmlsZVxuICBpZiAoIGZzLmV4aXN0c1N5bmMoIGAuLi8ke3JlcG99LyR7cmVwb30tc3RyaW5nc19lbi5qc29uYCApICYmIHBhY2thZ2VPYmplY3QucGhldCAmJiBwYWNrYWdlT2JqZWN0LnBoZXQucmVxdWlyZWpzTmFtZXNwYWNlICkge1xuICAgIGF3YWl0IGNyZWF0ZVN0cmluZ01vZHVsZSggcmVwbyApO1xuICB9XG5cbiAgLy8gSW1hZ2VzIG1vZHVsZSBmaWxlIChsb2NhbGl6ZWQgaW1hZ2VzKVxuICBpZiAoIGZzLmV4aXN0c1N5bmMoIGAuLi8ke3JlcG99LyR7cmVwb30taW1hZ2VzLmpzb25gICkgKSB7XG4gICAgY29uc3Qgc3VwcG9ydGVkUmVnaW9uc0FuZEN1bHR1cmVzOnN0cmluZ1tdID0gcGFja2FnZU9iamVjdD8ucGhldD8uc2ltRmVhdHVyZXM/LnN1cHBvcnRlZFJlZ2lvbnNBbmRDdWx0dXJlcztcblxuICAgIGlmICggIXN1cHBvcnRlZFJlZ2lvbnNBbmRDdWx0dXJlcyApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggYHN1cHBvcnRlZFJlZ2lvbnNBbmRDdWx0dXJlcyBpcyBub3QgZGVmaW5lZCBpbiBwYWNrYWdlLmpzb24sIGJ1dCAke3JlcG99LWltYWdlcy5qc29uIGV4aXN0c2AgKTtcbiAgICB9XG5cbiAgICBpZiAoICFzdXBwb3J0ZWRSZWdpb25zQW5kQ3VsdHVyZXMuaW5jbHVkZXMoICd1c2EnICkgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICdyZWdpb25BbmRDdWx0dXJlIFxcJ3VzYVxcJyBpcyByZXF1aXJlZCwgYnV0IG5vdCBmb3VuZCBpbiBzdXBwb3J0ZWRSZWdpb25zQW5kQ3VsdHVyZXMnICk7XG4gICAgfVxuXG4gICAgaWYgKCBzdXBwb3J0ZWRSZWdpb25zQW5kQ3VsdHVyZXMuaW5jbHVkZXMoICdtdWx0aScgKSAmJiBzdXBwb3J0ZWRSZWdpb25zQW5kQ3VsdHVyZXMubGVuZ3RoIDwgMyApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ3JlZ2lvbkFuZEN1bHR1cmUgXFwnbXVsdGlcXCcgaXMgc3VwcG9ydGVkLCBidXQgdGhlcmUgYXJlIG5vdCBlbm91Z2ggcmVnaW9uQW5kQ3VsdHVyZXMgdG8gc3VwcG9ydCBpdCcgKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb25jcmV0ZVJlZ2lvbnNBbmRDdWx0dXJlcyA9IHN1cHBvcnRlZFJlZ2lvbnNBbmRDdWx0dXJlcy5maWx0ZXIoIHJlZ2lvbkFuZEN1bHR1cmUgPT4gcmVnaW9uQW5kQ3VsdHVyZSAhPT0gJ3JhbmRvbScgKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgaW1hZ2VzIG1vZHVsZSBmaWxlXG4gICAgYXdhaXQgY3JlYXRlSW1hZ2VNb2R1bGUoIHJlcG8sIGNvbmNyZXRlUmVnaW9uc0FuZEN1bHR1cmVzICk7XG4gIH1cbn07Il0sIm5hbWVzIjpbImFzc2VydCIsImZzIiwicmVhZEZpbGVTeW5jIiwiXyIsIm9zIiwicGF0aCIsIndyaXRlRmlsZUFuZEdpdEFkZCIsImdydW50IiwibG9hZEZpbGVBc0RhdGFVUkkiLCJwYXNjYWxDYXNlIiwidG9MZXNzRXNjYXBlZFN0cmluZyIsImNyZWF0ZU1pcG1hcCIsImdldENvcHlyaWdodExpbmUiLCJzdmdvIiwicmVxdWlyZSIsIkhFQURFUiIsIklNQUdFX1NVRkZJWEVTIiwiU09VTkRfU1VGRklYRVMiLCJTSEFERVJfU1VGRklYRVMiLCJyZXBsYWNlIiwic3RyaW5nIiwic2VhcmNoIiwicmVwbGFjZW1lbnQiLCJzcGxpdCIsImpvaW4iLCJnZXRSZWxhdGl2ZVBhdGgiLCJzdWJkaXIiLCJmaWxlbmFtZSIsImV4cGFuZERvdHMiLCJhYnNwYXRoIiwiZGVwdGgiLCJsZW5ndGgiLCJwYXJlbnREaXJlY3RvcnkiLCJpIiwiZml4RU9MIiwiRU9MIiwibW9kdWxpZnlJbWFnZSIsInJlcG8iLCJkYXRhVVJJIiwiY29udGVudHMiLCJ0c0ZpbGVuYW1lIiwiY29udmVydFN1ZmZpeCIsIm1vZHVsaWZ5U1ZHIiwiZmlsZUNvbnRlbnRzIiwiaW5jbHVkZXMiLCJFcnJvciIsIm9wdGltaXplZENvbnRlbnRzIiwib3B0aW1pemUiLCJtdWx0aXBhc3MiLCJwbHVnaW5zIiwibmFtZSIsInBhcmFtcyIsIm92ZXJyaWRlcyIsInJlbW92ZVZpZXdCb3giLCJkYXRhIiwibW9kdWxpZnlNaXBtYXAiLCJjb25maWciLCJsZXZlbCIsInF1YWxpdHkiLCJtaXBtYXBMZXZlbHMiLCJlbnRyaWVzIiwibWFwIiwid2lkdGgiLCJoZWlnaHQiLCJ1cmwiLCJtaXBtYXBDb250ZW50cyIsImpzRmlsZW5hbWUiLCJtb2R1bGlmeVNoYWRlciIsInNoYWRlclN0cmluZyIsIkpTT04iLCJzdHJpbmdpZnkiLCJtb2R1bGlmeVNvdW5kIiwic3VmZml4IiwibGFzdERvdEluZGV4IiwibGFzdEluZGV4T2YiLCJzdWJzdHJpbmciLCJnZXRTdWZmaXgiLCJpbmRleCIsIm1vZHVsaWZ5RmlsZSIsInJvb3RkaXIiLCJzdGFydHNXaXRoIiwiY3JlYXRlSW1hZ2VNb2R1bGUiLCJzdXBwb3J0ZWRSZWdpb25zQW5kQ3VsdHVyZXMiLCJzcGVjIiwicGFyc2UiLCJuYW1lc3BhY2UiLCJjYW1lbENhc2UiLCJpbWFnZU1vZHVsZU5hbWUiLCJyZWxhdGl2ZUltYWdlTW9kdWxlRmlsZSIsInByb3ZpZGVkUmVnaW9uc0FuZEN1bHR1cmVzIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJyZWdpb25BbmRDdWx0dXJlIiwiaW1hZ2VOYW1lcyIsInVuaXEiLCJmbGF0TWFwIiwic29ydCIsImltYWdlRmlsZXMiLCJ2YWx1ZXMiLCJpbWFnZUZpbGUiLCJleGlzdHNTeW5jIiwiaW1hZ2VOYW1lIiwiaGFzT3duUHJvcGVydHkiLCJnZXRJbXBvcnROYW1lIiwiYmFzZW5hbWUiLCJleHRuYW1lIiwiaW1wb3J0TmFtZXMiLCJkdXBsaWNhdGVzIiwiZmlsdGVyIiwiaW5kZXhPZiIsImZpcnN0RHVwbGljYXRlIiwib3JpZ2luYWxOYW1lcyIsImNvcHlyaWdodExpbmUiLCJjcmVhdGVTdHJpbmdNb2R1bGUiLCJwYWNrYWdlT2JqZWN0Iiwic3RyaW5nTW9kdWxlTmFtZSIsInJlbGF0aXZlU3RyaW5nTW9kdWxlRmlsZSIsInN0cmluZ01vZHVsZUZpbGVKUyIsImNvbnNvbGUiLCJsb2ciLCJnZXRTdHJpbmdUeXBlcyIsInBoZXQiLCJyZXF1aXJlanNOYW1lc3BhY2UiLCJqc29uIiwiYWxsIiwidmlzaXQiLCJrZXkiLCJ2YWx1ZSIsImRlcHJlY2F0ZWQiLCJwdXNoIiwic3RydWN0dXJlIiwiYWxsRWxlbWVudCIsImsiLCJwYXRoRWxlbWVudCIsInRva2VucyIsIm0iLCJ0b2tlbiIsInNpbUZlYXR1cmVzIiwic3VwcG9ydHNEeW5hbWljTG9jYWxlIiwidGV4dCIsInJlbGF0aXZlRmlsZXMiLCJmaWxlIiwicmVjdXJzZSIsImVudHJ5IiwiY29uY3JldGVSZWdpb25zQW5kQ3VsdHVyZXMiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxPQUFPQSxZQUFZLFNBQVM7QUFDNUIsT0FBT0MsTUFBTUMsWUFBWSxRQUFRLEtBQUs7QUFDdEMsT0FBT0MsT0FBTyxTQUFTO0FBQ3ZCLE9BQU9DLFFBQVEsS0FBSztBQUNwQixPQUFPQyxVQUFVLE9BQU87QUFDeEIsT0FBT0Msd0JBQXdCLDJEQUEyRDtBQUMxRixPQUFPQyxXQUFXLHdEQUF3RDtBQUUxRSxPQUFPQyx1QkFBdUIsaUNBQWlDO0FBQy9ELE9BQU9DLGdCQUFnQiwwQkFBMEI7QUFDakQsT0FBT0MseUJBQXlCLG1DQUFtQztBQUNuRSxPQUFPQyxrQkFBa0Isb0JBQW9CO0FBQzdDLE9BQU9DLHNCQUFzQix3QkFBd0I7QUFFckQsTUFBTUMsT0FBT0MsUUFBUztBQUV0Qix3RUFBd0U7QUFDeEUsTUFBTUMsU0FBUztBQUVmLDRDQUE0QztBQUM1QyxNQUFNQyxpQkFBaUI7SUFBRTtJQUFRO0lBQVE7SUFBUTtDQUFRO0FBRXpELGlEQUFpRDtBQUNqRCxNQUFNQyxpQkFBaUI7SUFBRTtJQUFRO0NBQVE7QUFFekMsa0RBQWtEO0FBQ2xELE1BQU1DLGtCQUFrQjtJQUFFO0lBQVM7SUFBUztDQUFXO0FBRXZEOzs7OztDQUtDLEdBQ0QsTUFBTUMsVUFBVSxDQUFFQyxRQUFnQkMsUUFBZ0JDLGNBQXlCRixPQUFPRyxLQUFLLENBQUVGLFFBQVNHLElBQUksQ0FBRUY7QUFFeEc7O0NBRUMsR0FDRCxNQUFNRyxrQkFBa0IsQ0FBRUMsUUFBZ0JDO0lBQ3hDLE9BQU8sR0FBR0QsT0FBTyxDQUFDLEVBQUVDLFVBQVU7QUFDaEM7QUFFQTs7Q0FF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