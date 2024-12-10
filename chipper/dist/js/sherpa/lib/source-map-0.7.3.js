(function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === 'object' && typeof module === 'object') module.exports = factory(require("fs"), require("path"));
    else if (typeof define === 'function' && define.amd) define([
        "fs",
        "path"
    ], factory);
    else if (typeof exports === 'object') exports["sourceMap"] = factory(require("fs"), require("path"));
    else root["sourceMap"] = factory(root["fs"], root["path"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_10__, __WEBPACK_EXTERNAL_MODULE_11__) {
    return /******/ function(modules) {
        /******/ // The module cache
        /******/ var installedModules = {};
        /******/ /******/ // The require function
        /******/ function __webpack_require__(moduleId) {
            /******/ /******/ // Check if module is in cache
            /******/ if (installedModules[moduleId]) {
                /******/ return installedModules[moduleId].exports;
            /******/ }
            /******/ // Create a new module (and put it into the cache)
            /******/ var module1 = installedModules[moduleId] = {
                /******/ i: moduleId,
                /******/ l: false,
                /******/ exports: {}
            };
            /******/ /******/ // Execute the module function
            /******/ modules[moduleId].call(module1.exports, module1, module1.exports, __webpack_require__);
            /******/ /******/ // Flag the module as loaded
            /******/ module1.l = true;
            /******/ /******/ // Return the exports of the module
            /******/ return module1.exports;
        /******/ }
        /******/ /******/ /******/ // expose the modules object (__webpack_modules__)
        /******/ __webpack_require__.m = modules;
        /******/ /******/ // expose the module cache
        /******/ __webpack_require__.c = installedModules;
        /******/ /******/ // define getter function for harmony exports
        /******/ __webpack_require__.d = function(exports1, name, getter) {
            /******/ if (!__webpack_require__.o(exports1, name)) {
                /******/ Object.defineProperty(exports1, name, {
                    /******/ configurable: false,
                    /******/ enumerable: true,
                    /******/ get: getter
                });
            /******/ }
        /******/ };
        /******/ /******/ // getDefaultExport function for compatibility with non-harmony modules
        /******/ __webpack_require__.n = function(module1) {
            /******/ var getter = module1 && module1.__esModule ? /******/ function getDefault() {
                return module1['default'];
            } : /******/ function getModuleExports() {
                return module1;
            };
            /******/ __webpack_require__.d(getter, 'a', getter);
            /******/ return getter;
        /******/ };
        /******/ /******/ // Object.prototype.hasOwnProperty.call
        /******/ __webpack_require__.o = function(object, property) {
            return Object.prototype.hasOwnProperty.call(object, property);
        };
        /******/ /******/ // __webpack_public_path__
        /******/ __webpack_require__.p = "";
        /******/ /******/ // Load entry module and return exports
        /******/ return __webpack_require__(__webpack_require__.s = 5);
    /******/ }([
        /* 0 */ /***/ function(module1, exports1) {
            /* -*- Mode: js; js-indent-level: 2; -*- */ /*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */ /**
 * This is a helper function for getting values from parameter/options
 * objects.
 *
 * @param args The object we are extracting values from
 * @param name The name of the property we are getting.
 * @param defaultValue An optional value to return if the property is missing
 * from the object. If this is not specified and the property is missing, an
 * error will be thrown.
 */ function getArg(aArgs, aName, aDefaultValue) {
                if (aName in aArgs) {
                    return aArgs[aName];
                } else if (arguments.length === 3) {
                    return aDefaultValue;
                }
                throw new Error('"' + aName + '" is a required argument.');
            }
            exports1.getArg = getArg;
            const urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
            const dataUrlRegexp = /^data:.+\,.+$/;
            function urlParse(aUrl) {
                const match = aUrl.match(urlRegexp);
                if (!match) {
                    return null;
                }
                return {
                    scheme: match[1],
                    auth: match[2],
                    host: match[3],
                    port: match[4],
                    path: match[5]
                };
            }
            exports1.urlParse = urlParse;
            function urlGenerate(aParsedUrl) {
                let url = "";
                if (aParsedUrl.scheme) {
                    url += aParsedUrl.scheme + ":";
                }
                url += "//";
                if (aParsedUrl.auth) {
                    url += aParsedUrl.auth + "@";
                }
                if (aParsedUrl.host) {
                    url += aParsedUrl.host;
                }
                if (aParsedUrl.port) {
                    url += ":" + aParsedUrl.port;
                }
                if (aParsedUrl.path) {
                    url += aParsedUrl.path;
                }
                return url;
            }
            exports1.urlGenerate = urlGenerate;
            const MAX_CACHED_INPUTS = 32;
            /**
 * Takes some function `f(input) -> result` and returns a memoized version of
 * `f`.
 *
 * We keep at most `MAX_CACHED_INPUTS` memoized results of `f` alive. The
 * memoization is a dumb-simple, linear least-recently-used cache.
 */ function lruMemoize(f) {
                const cache = [];
                return function(input) {
                    for(let i = 0; i < cache.length; i++){
                        if (cache[i].input === input) {
                            const temp = cache[0];
                            cache[0] = cache[i];
                            cache[i] = temp;
                            return cache[0].result;
                        }
                    }
                    const result = f(input);
                    cache.unshift({
                        input,
                        result
                    });
                    if (cache.length > MAX_CACHED_INPUTS) {
                        cache.pop();
                    }
                    return result;
                };
            }
            /**
 * Normalizes a path, or the path portion of a URL:
 *
 * - Replaces consecutive slashes with one slash.
 * - Removes unnecessary '.' parts.
 * - Removes unnecessary '<dir>/..' parts.
 *
 * Based on code in the Node.js 'path' core module.
 *
 * @param aPath The path or url to normalize.
 */ const normalize = lruMemoize(function normalize(aPath) {
                let path = aPath;
                const url = urlParse(aPath);
                if (url) {
                    if (!url.path) {
                        return aPath;
                    }
                    path = url.path;
                }
                const isAbsolute = exports1.isAbsolute(path);
                // Split the path into parts between `/` characters. This is much faster than
                // using `.split(/\/+/g)`.
                const parts = [];
                let start = 0;
                let i = 0;
                while(true){
                    start = i;
                    i = path.indexOf("/", start);
                    if (i === -1) {
                        parts.push(path.slice(start));
                        break;
                    } else {
                        parts.push(path.slice(start, i));
                        while(i < path.length && path[i] === "/"){
                            i++;
                        }
                    }
                }
                let up = 0;
                for(i = parts.length - 1; i >= 0; i--){
                    const part = parts[i];
                    if (part === ".") {
                        parts.splice(i, 1);
                    } else if (part === "..") {
                        up++;
                    } else if (up > 0) {
                        if (part === "") {
                            // The first part is blank if the path is absolute. Trying to go
                            // above the root is a no-op. Therefore we can remove all '..' parts
                            // directly after the root.
                            parts.splice(i + 1, up);
                            up = 0;
                        } else {
                            parts.splice(i, 2);
                            up--;
                        }
                    }
                }
                path = parts.join("/");
                if (path === "") {
                    path = isAbsolute ? "/" : ".";
                }
                if (url) {
                    url.path = path;
                    return urlGenerate(url);
                }
                return path;
            });
            exports1.normalize = normalize;
            /**
 * Joins two paths/URLs.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be joined with the root.
 *
 * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
 *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
 *   first.
 * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
 *   is updated with the result and aRoot is returned. Otherwise the result
 *   is returned.
 *   - If aPath is absolute, the result is aPath.
 *   - Otherwise the two paths are joined with a slash.
 * - Joining for example 'http://' and 'www.example.com' is also supported.
 */ function join(aRoot, aPath) {
                if (aRoot === "") {
                    aRoot = ".";
                }
                if (aPath === "") {
                    aPath = ".";
                }
                const aPathUrl = urlParse(aPath);
                const aRootUrl = urlParse(aRoot);
                if (aRootUrl) {
                    aRoot = aRootUrl.path || "/";
                }
                // `join(foo, '//www.example.org')`
                if (aPathUrl && !aPathUrl.scheme) {
                    if (aRootUrl) {
                        aPathUrl.scheme = aRootUrl.scheme;
                    }
                    return urlGenerate(aPathUrl);
                }
                if (aPathUrl || aPath.match(dataUrlRegexp)) {
                    return aPath;
                }
                // `join('http://', 'www.example.com')`
                if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
                    aRootUrl.host = aPath;
                    return urlGenerate(aRootUrl);
                }
                const joined = aPath.charAt(0) === "/" ? aPath : normalize(aRoot.replace(/\/+$/, "") + "/" + aPath);
                if (aRootUrl) {
                    aRootUrl.path = joined;
                    return urlGenerate(aRootUrl);
                }
                return joined;
            }
            exports1.join = join;
            exports1.isAbsolute = function(aPath) {
                return aPath.charAt(0) === "/" || urlRegexp.test(aPath);
            };
            /**
 * Make a path relative to a URL or another path.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be made relative to aRoot.
 */ function relative(aRoot, aPath) {
                if (aRoot === "") {
                    aRoot = ".";
                }
                aRoot = aRoot.replace(/\/$/, "");
                // It is possible for the path to be above the root. In this case, simply
                // checking whether the root is a prefix of the path won't work. Instead, we
                // need to remove components from the root one by one, until either we find
                // a prefix that fits, or we run out of components to remove.
                let level = 0;
                while(aPath.indexOf(aRoot + "/") !== 0){
                    const index = aRoot.lastIndexOf("/");
                    if (index < 0) {
                        return aPath;
                    }
                    // If the only part of the root that is left is the scheme (i.e. http://,
                    // file:///, etc.), one or more slashes (/), or simply nothing at all, we
                    // have exhausted all components, so the path is not relative to the root.
                    aRoot = aRoot.slice(0, index);
                    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
                        return aPath;
                    }
                    ++level;
                }
                // Make sure we add a "../" for each component we removed from the root.
                return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
            }
            exports1.relative = relative;
            const supportsNullProto = function() {
                const obj = Object.create(null);
                return !("__proto__" in obj);
            }();
            function identity(s) {
                return s;
            }
            /**
 * Because behavior goes wacky when you set `__proto__` on objects, we
 * have to prefix all the strings in our set with an arbitrary character.
 *
 * See https://github.com/mozilla/source-map/pull/31 and
 * https://github.com/mozilla/source-map/issues/30
 *
 * @param String aStr
 */ function toSetString(aStr) {
                if (isProtoString(aStr)) {
                    return "$" + aStr;
                }
                return aStr;
            }
            exports1.toSetString = supportsNullProto ? identity : toSetString;
            function fromSetString(aStr) {
                if (isProtoString(aStr)) {
                    return aStr.slice(1);
                }
                return aStr;
            }
            exports1.fromSetString = supportsNullProto ? identity : fromSetString;
            function isProtoString(s) {
                if (!s) {
                    return false;
                }
                const length = s.length;
                if (length < 9 /* "__proto__".length */ ) {
                    return false;
                }
                /* eslint-disable no-multi-spaces */ if (s.charCodeAt(length - 1) !== 95 /* '_' */  || s.charCodeAt(length - 2) !== 95 /* '_' */  || s.charCodeAt(length - 3) !== 111 /* 'o' */  || s.charCodeAt(length - 4) !== 116 /* 't' */  || s.charCodeAt(length - 5) !== 111 /* 'o' */  || s.charCodeAt(length - 6) !== 114 /* 'r' */  || s.charCodeAt(length - 7) !== 112 /* 'p' */  || s.charCodeAt(length - 8) !== 95 /* '_' */  || s.charCodeAt(length - 9) !== 95 /* '_' */ ) {
                    return false;
                }
                /* eslint-enable no-multi-spaces */ for(let i = length - 10; i >= 0; i--){
                    if (s.charCodeAt(i) !== 36 /* '$' */ ) {
                        return false;
                    }
                }
                return true;
            }
            /**
 * Comparator between two mappings where the original positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same original source/line/column, but different generated
 * line and column the same. Useful when searching for a mapping with a
 * stubbed out mapping.
 */ function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
                let cmp = strcmp(mappingA.source, mappingB.source);
                if (cmp !== 0) {
                    return cmp;
                }
                cmp = mappingA.originalLine - mappingB.originalLine;
                if (cmp !== 0) {
                    return cmp;
                }
                cmp = mappingA.originalColumn - mappingB.originalColumn;
                if (cmp !== 0 || onlyCompareOriginal) {
                    return cmp;
                }
                cmp = mappingA.generatedColumn - mappingB.generatedColumn;
                if (cmp !== 0) {
                    return cmp;
                }
                cmp = mappingA.generatedLine - mappingB.generatedLine;
                if (cmp !== 0) {
                    return cmp;
                }
                return strcmp(mappingA.name, mappingB.name);
            }
            exports1.compareByOriginalPositions = compareByOriginalPositions;
            /**
 * Comparator between two mappings with deflated source and name indices where
 * the generated positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same generated line and column, but different
 * source/name/original line and column the same. Useful when searching for a
 * mapping with a stubbed out mapping.
 */ function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
                let cmp = mappingA.generatedLine - mappingB.generatedLine;
                if (cmp !== 0) {
                    return cmp;
                }
                cmp = mappingA.generatedColumn - mappingB.generatedColumn;
                if (cmp !== 0 || onlyCompareGenerated) {
                    return cmp;
                }
                cmp = strcmp(mappingA.source, mappingB.source);
                if (cmp !== 0) {
                    return cmp;
                }
                cmp = mappingA.originalLine - mappingB.originalLine;
                if (cmp !== 0) {
                    return cmp;
                }
                cmp = mappingA.originalColumn - mappingB.originalColumn;
                if (cmp !== 0) {
                    return cmp;
                }
                return strcmp(mappingA.name, mappingB.name);
            }
            exports1.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;
            function strcmp(aStr1, aStr2) {
                if (aStr1 === aStr2) {
                    return 0;
                }
                if (aStr1 === null) {
                    return 1; // aStr2 !== null
                }
                if (aStr2 === null) {
                    return -1; // aStr1 !== null
                }
                if (aStr1 > aStr2) {
                    return 1;
                }
                return -1;
            }
            /**
 * Comparator between two mappings with inflated source and name strings where
 * the generated positions are compared.
 */ function compareByGeneratedPositionsInflated(mappingA, mappingB) {
                let cmp = mappingA.generatedLine - mappingB.generatedLine;
                if (cmp !== 0) {
                    return cmp;
                }
                cmp = mappingA.generatedColumn - mappingB.generatedColumn;
                if (cmp !== 0) {
                    return cmp;
                }
                cmp = strcmp(mappingA.source, mappingB.source);
                if (cmp !== 0) {
                    return cmp;
                }
                cmp = mappingA.originalLine - mappingB.originalLine;
                if (cmp !== 0) {
                    return cmp;
                }
                cmp = mappingA.originalColumn - mappingB.originalColumn;
                if (cmp !== 0) {
                    return cmp;
                }
                return strcmp(mappingA.name, mappingB.name);
            }
            exports1.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;
            /**
 * Strip any JSON XSSI avoidance prefix from the string (as documented
 * in the source maps specification), and then parse the string as
 * JSON.
 */ function parseSourceMapInput(str) {
                return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ""));
            }
            exports1.parseSourceMapInput = parseSourceMapInput;
            /**
 * Compute the URL of a source given the the source root, the source's
 * URL, and the source map's URL.
 */ function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
                sourceURL = sourceURL || "";
                if (sourceRoot) {
                    // This follows what Chrome does.
                    if (sourceRoot[sourceRoot.length - 1] !== "/" && sourceURL[0] !== "/") {
                        sourceRoot += "/";
                    }
                    // The spec says:
                    //   Line 4: An optional source root, useful for relocating source
                    //   files on a server or removing repeated values in the
                    //   “sources” entry.  This value is prepended to the individual
                    //   entries in the “source” field.
                    sourceURL = sourceRoot + sourceURL;
                }
                // Historically, SourceMapConsumer did not take the sourceMapURL as
                // a parameter.  This mode is still somewhat supported, which is why
                // this code block is conditional.  However, it's preferable to pass
                // the source map URL to SourceMapConsumer, so that this function
                // can implement the source URL resolution algorithm as outlined in
                // the spec.  This block is basically the equivalent of:
                //    new URL(sourceURL, sourceMapURL).toString()
                // ... except it avoids using URL, which wasn't available in the
                // older releases of node still supported by this library.
                //
                // The spec says:
                //   If the sources are not absolute URLs after prepending of the
                //   “sourceRoot”, the sources are resolved relative to the
                //   SourceMap (like resolving script src in a html document).
                if (sourceMapURL) {
                    const parsed = urlParse(sourceMapURL);
                    if (!parsed) {
                        throw new Error("sourceMapURL could not be parsed");
                    }
                    if (parsed.path) {
                        // Strip the last path component, but keep the "/".
                        const index = parsed.path.lastIndexOf("/");
                        if (index >= 0) {
                            parsed.path = parsed.path.substring(0, index + 1);
                        }
                    }
                    sourceURL = join(urlGenerate(parsed), sourceURL);
                }
                return normalize(sourceURL);
            }
            exports1.computeSourceURL = computeSourceURL;
        /***/ },
        /* 1 */ /***/ function(module1, exports1, __webpack_require__) {
            /* -*- Mode: js; js-indent-level: 2; -*- */ /*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */ const base64VLQ = __webpack_require__(2);
            const util = __webpack_require__(0);
            const ArraySet = __webpack_require__(3).ArraySet;
            const MappingList = __webpack_require__(7).MappingList;
            /**
 * An instance of the SourceMapGenerator represents a source map which is
 * being built incrementally. You may pass an object with the following
 * properties:
 *
 *   - file: The filename of the generated source.
 *   - sourceRoot: A root for all relative URLs in this source map.
 */ let SourceMapGenerator = class SourceMapGenerator {
                /**
   * Creates a new SourceMapGenerator based on a SourceMapConsumer
   *
   * @param aSourceMapConsumer The SourceMap.
   */ static fromSourceMap(aSourceMapConsumer) {
                    const sourceRoot = aSourceMapConsumer.sourceRoot;
                    const generator = new SourceMapGenerator({
                        file: aSourceMapConsumer.file,
                        sourceRoot
                    });
                    aSourceMapConsumer.eachMapping(function(mapping) {
                        const newMapping = {
                            generated: {
                                line: mapping.generatedLine,
                                column: mapping.generatedColumn
                            }
                        };
                        if (mapping.source != null) {
                            newMapping.source = mapping.source;
                            if (sourceRoot != null) {
                                newMapping.source = util.relative(sourceRoot, newMapping.source);
                            }
                            newMapping.original = {
                                line: mapping.originalLine,
                                column: mapping.originalColumn
                            };
                            if (mapping.name != null) {
                                newMapping.name = mapping.name;
                            }
                        }
                        generator.addMapping(newMapping);
                    });
                    aSourceMapConsumer.sources.forEach(function(sourceFile) {
                        let sourceRelative = sourceFile;
                        if (sourceRoot !== null) {
                            sourceRelative = util.relative(sourceRoot, sourceFile);
                        }
                        if (!generator._sources.has(sourceRelative)) {
                            generator._sources.add(sourceRelative);
                        }
                        const content = aSourceMapConsumer.sourceContentFor(sourceFile);
                        if (content != null) {
                            generator.setSourceContent(sourceFile, content);
                        }
                    });
                    return generator;
                }
                /**
   * Add a single mapping from original source line and column to the generated
   * source's line and column for this source map being created. The mapping
   * object should have the following properties:
   *
   *   - generated: An object with the generated line and column positions.
   *   - original: An object with the original line and column positions.
   *   - source: The original source file (relative to the sourceRoot).
   *   - name: An optional original token name for this mapping.
   */ addMapping(aArgs) {
                    const generated = util.getArg(aArgs, "generated");
                    const original = util.getArg(aArgs, "original", null);
                    let source = util.getArg(aArgs, "source", null);
                    let name = util.getArg(aArgs, "name", null);
                    if (!this._skipValidation) {
                        this._validateMapping(generated, original, source, name);
                    }
                    if (source != null) {
                        source = String(source);
                        if (!this._sources.has(source)) {
                            this._sources.add(source);
                        }
                    }
                    if (name != null) {
                        name = String(name);
                        if (!this._names.has(name)) {
                            this._names.add(name);
                        }
                    }
                    this._mappings.add({
                        generatedLine: generated.line,
                        generatedColumn: generated.column,
                        originalLine: original != null && original.line,
                        originalColumn: original != null && original.column,
                        source,
                        name
                    });
                }
                /**
   * Set the source content for a source file.
   */ setSourceContent(aSourceFile, aSourceContent) {
                    let source = aSourceFile;
                    if (this._sourceRoot != null) {
                        source = util.relative(this._sourceRoot, source);
                    }
                    if (aSourceContent != null) {
                        // Add the source content to the _sourcesContents map.
                        // Create a new _sourcesContents map if the property is null.
                        if (!this._sourcesContents) {
                            this._sourcesContents = Object.create(null);
                        }
                        this._sourcesContents[util.toSetString(source)] = aSourceContent;
                    } else if (this._sourcesContents) {
                        // Remove the source file from the _sourcesContents map.
                        // If the _sourcesContents map is empty, set the property to null.
                        delete this._sourcesContents[util.toSetString(source)];
                        if (Object.keys(this._sourcesContents).length === 0) {
                            this._sourcesContents = null;
                        }
                    }
                }
                /**
   * Applies the mappings of a sub-source-map for a specific source file to the
   * source map being generated. Each mapping to the supplied source file is
   * rewritten using the supplied source map. Note: The resolution for the
   * resulting mappings is the minimium of this map and the supplied map.
   *
   * @param aSourceMapConsumer The source map to be applied.
   * @param aSourceFile Optional. The filename of the source file.
   *        If omitted, SourceMapConsumer's file property will be used.
   * @param aSourceMapPath Optional. The dirname of the path to the source map
   *        to be applied. If relative, it is relative to the SourceMapConsumer.
   *        This parameter is needed when the two source maps aren't in the same
   *        directory, and the source map to be applied contains relative source
   *        paths. If so, those relative source paths need to be rewritten
   *        relative to the SourceMapGenerator.
   */ applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
                    let sourceFile = aSourceFile;
                    // If aSourceFile is omitted, we will use the file property of the SourceMap
                    if (aSourceFile == null) {
                        if (aSourceMapConsumer.file == null) {
                            throw new Error("SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, " + 'or the source map\'s "file" property. Both were omitted.');
                        }
                        sourceFile = aSourceMapConsumer.file;
                    }
                    const sourceRoot = this._sourceRoot;
                    // Make "sourceFile" relative if an absolute Url is passed.
                    if (sourceRoot != null) {
                        sourceFile = util.relative(sourceRoot, sourceFile);
                    }
                    // Applying the SourceMap can add and remove items from the sources and
                    // the names array.
                    const newSources = this._mappings.toArray().length > 0 ? new ArraySet() : this._sources;
                    const newNames = new ArraySet();
                    // Find mappings for the "sourceFile"
                    this._mappings.unsortedForEach(function(mapping) {
                        if (mapping.source === sourceFile && mapping.originalLine != null) {
                            // Check if it can be mapped by the source map, then update the mapping.
                            const original = aSourceMapConsumer.originalPositionFor({
                                line: mapping.originalLine,
                                column: mapping.originalColumn
                            });
                            if (original.source != null) {
                                // Copy mapping
                                mapping.source = original.source;
                                if (aSourceMapPath != null) {
                                    mapping.source = util.join(aSourceMapPath, mapping.source);
                                }
                                if (sourceRoot != null) {
                                    mapping.source = util.relative(sourceRoot, mapping.source);
                                }
                                mapping.originalLine = original.line;
                                mapping.originalColumn = original.column;
                                if (original.name != null) {
                                    mapping.name = original.name;
                                }
                            }
                        }
                        const source = mapping.source;
                        if (source != null && !newSources.has(source)) {
                            newSources.add(source);
                        }
                        const name = mapping.name;
                        if (name != null && !newNames.has(name)) {
                            newNames.add(name);
                        }
                    }, this);
                    this._sources = newSources;
                    this._names = newNames;
                    // Copy sourcesContents of applied map.
                    aSourceMapConsumer.sources.forEach(function(srcFile) {
                        const content = aSourceMapConsumer.sourceContentFor(srcFile);
                        if (content != null) {
                            if (aSourceMapPath != null) {
                                srcFile = util.join(aSourceMapPath, srcFile);
                            }
                            if (sourceRoot != null) {
                                srcFile = util.relative(sourceRoot, srcFile);
                            }
                            this.setSourceContent(srcFile, content);
                        }
                    }, this);
                }
                /**
   * A mapping can have one of the three levels of data:
   *
   *   1. Just the generated position.
   *   2. The Generated position, original position, and original source.
   *   3. Generated and original position, original source, as well as a name
   *      token.
   *
   * To maintain consistency, we validate that any new mapping being added falls
   * in to one of these categories.
   */ _validateMapping(aGenerated, aOriginal, aSource, aName) {
                    // When aOriginal is truthy but has empty values for .line and .column,
                    // it is most likely a programmer error. In this case we throw a very
                    // specific error message to try to guide them the right way.
                    // For example: https://github.com/Polymer/polymer-bundler/pull/519
                    if (aOriginal && typeof aOriginal.line !== "number" && typeof aOriginal.column !== "number") {
                        throw new Error("original.line and original.column are not numbers -- you probably meant to omit " + "the original mapping entirely and only map the generated position. If so, pass " + "null for the original mapping instead of an object with empty or null values.");
                    }
                    if (aGenerated && "line" in aGenerated && "column" in aGenerated && aGenerated.line > 0 && aGenerated.column >= 0 && !aOriginal && !aSource && !aName) {
                    // Case 1.
                    } else if (aGenerated && "line" in aGenerated && "column" in aGenerated && aOriginal && "line" in aOriginal && "column" in aOriginal && aGenerated.line > 0 && aGenerated.column >= 0 && aOriginal.line > 0 && aOriginal.column >= 0 && aSource) {
                    // Cases 2 and 3.
                    } else {
                        throw new Error("Invalid mapping: " + JSON.stringify({
                            generated: aGenerated,
                            source: aSource,
                            original: aOriginal,
                            name: aName
                        }));
                    }
                }
                /**
   * Serialize the accumulated mappings in to the stream of base 64 VLQs
   * specified by the source map format.
   */ _serializeMappings() {
                    let previousGeneratedColumn = 0;
                    let previousGeneratedLine = 1;
                    let previousOriginalColumn = 0;
                    let previousOriginalLine = 0;
                    let previousName = 0;
                    let previousSource = 0;
                    let result = "";
                    let next;
                    let mapping;
                    let nameIdx;
                    let sourceIdx;
                    const mappings = this._mappings.toArray();
                    for(let i = 0, len = mappings.length; i < len; i++){
                        mapping = mappings[i];
                        next = "";
                        if (mapping.generatedLine !== previousGeneratedLine) {
                            previousGeneratedColumn = 0;
                            while(mapping.generatedLine !== previousGeneratedLine){
                                next += ";";
                                previousGeneratedLine++;
                            }
                        } else if (i > 0) {
                            if (!util.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
                                continue;
                            }
                            next += ",";
                        }
                        next += base64VLQ.encode(mapping.generatedColumn - previousGeneratedColumn);
                        previousGeneratedColumn = mapping.generatedColumn;
                        if (mapping.source != null) {
                            sourceIdx = this._sources.indexOf(mapping.source);
                            next += base64VLQ.encode(sourceIdx - previousSource);
                            previousSource = sourceIdx;
                            // lines are stored 0-based in SourceMap spec version 3
                            next += base64VLQ.encode(mapping.originalLine - 1 - previousOriginalLine);
                            previousOriginalLine = mapping.originalLine - 1;
                            next += base64VLQ.encode(mapping.originalColumn - previousOriginalColumn);
                            previousOriginalColumn = mapping.originalColumn;
                            if (mapping.name != null) {
                                nameIdx = this._names.indexOf(mapping.name);
                                next += base64VLQ.encode(nameIdx - previousName);
                                previousName = nameIdx;
                            }
                        }
                        result += next;
                    }
                    return result;
                }
                _generateSourcesContent(aSources, aSourceRoot) {
                    return aSources.map(function(source) {
                        if (!this._sourcesContents) {
                            return null;
                        }
                        if (aSourceRoot != null) {
                            source = util.relative(aSourceRoot, source);
                        }
                        const key = util.toSetString(source);
                        return Object.prototype.hasOwnProperty.call(this._sourcesContents, key) ? this._sourcesContents[key] : null;
                    }, this);
                }
                /**
   * Externalize the source map.
   */ toJSON() {
                    const map = {
                        version: this._version,
                        sources: this._sources.toArray(),
                        names: this._names.toArray(),
                        mappings: this._serializeMappings()
                    };
                    if (this._file != null) {
                        map.file = this._file;
                    }
                    if (this._sourceRoot != null) {
                        map.sourceRoot = this._sourceRoot;
                    }
                    if (this._sourcesContents) {
                        map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
                    }
                    return map;
                }
                /**
   * Render the source map being generated to a string.
   */ toString() {
                    return JSON.stringify(this.toJSON());
                }
                constructor(aArgs){
                    if (!aArgs) {
                        aArgs = {};
                    }
                    this._file = util.getArg(aArgs, "file", null);
                    this._sourceRoot = util.getArg(aArgs, "sourceRoot", null);
                    this._skipValidation = util.getArg(aArgs, "skipValidation", false);
                    this._sources = new ArraySet();
                    this._names = new ArraySet();
                    this._mappings = new MappingList();
                    this._sourcesContents = null;
                }
            };
            SourceMapGenerator.prototype._version = 3;
            exports1.SourceMapGenerator = SourceMapGenerator;
        /***/ },
        /* 2 */ /***/ function(module1, exports1, __webpack_require__) {
            /* -*- Mode: js; js-indent-level: 2; -*- */ /*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */ const base64 = __webpack_require__(6);
            // A single base 64 digit can contain 6 bits of data. For the base 64 variable
            // length quantities we use in the source map spec, the first bit is the sign,
            // the next four bits are the actual value, and the 6th bit is the
            // continuation bit. The continuation bit tells us whether there are more
            // digits in this value following this digit.
            //
            //   Continuation
            //   |    Sign
            //   |    |
            //   V    V
            //   101011
            const VLQ_BASE_SHIFT = 5;
            // binary: 100000
            const VLQ_BASE = 1 << VLQ_BASE_SHIFT;
            // binary: 011111
            const VLQ_BASE_MASK = VLQ_BASE - 1;
            // binary: 100000
            const VLQ_CONTINUATION_BIT = VLQ_BASE;
            /**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */ function toVLQSigned(aValue) {
                return aValue < 0 ? (-aValue << 1) + 1 : (aValue << 1) + 0;
            }
            /**
 * Converts to a two-complement value from a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
 */ // eslint-disable-next-line no-unused-vars
            function fromVLQSigned(aValue) {
                const isNegative = (aValue & 1) === 1;
                const shifted = aValue >> 1;
                return isNegative ? -shifted : shifted;
            }
            /**
 * Returns the base 64 VLQ encoded value.
 */ exports1.encode = function base64VLQ_encode(aValue) {
                let encoded = "";
                let digit;
                let vlq = toVLQSigned(aValue);
                do {
                    digit = vlq & VLQ_BASE_MASK;
                    vlq >>>= VLQ_BASE_SHIFT;
                    if (vlq > 0) {
                        // There are still more digits in this value, so we must make sure the
                        // continuation bit is marked.
                        digit |= VLQ_CONTINUATION_BIT;
                    }
                    encoded += base64.encode(digit);
                }while (vlq > 0)
                return encoded;
            };
        /***/ },
        /* 3 */ /***/ function(module1, exports1) {
            /* -*- Mode: js; js-indent-level: 2; -*- */ /*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */ /**
 * A data structure which is a combination of an array and a set. Adding a new
 * member is O(1), testing for membership is O(1), and finding the index of an
 * element is O(1). Removing elements from the set is not supported. Only
 * strings are supported for membership.
 */ let ArraySet = class ArraySet {
                /**
   * Static method for creating ArraySet instances from an existing array.
   */ static fromArray(aArray, aAllowDuplicates) {
                    const set = new ArraySet();
                    for(let i = 0, len = aArray.length; i < len; i++){
                        set.add(aArray[i], aAllowDuplicates);
                    }
                    return set;
                }
                /**
   * Return how many unique items are in this ArraySet. If duplicates have been
   * added, than those do not count towards the size.
   *
   * @returns Number
   */ size() {
                    return this._set.size;
                }
                /**
   * Add the given string to this set.
   *
   * @param String aStr
   */ add(aStr, aAllowDuplicates) {
                    const isDuplicate = this.has(aStr);
                    const idx = this._array.length;
                    if (!isDuplicate || aAllowDuplicates) {
                        this._array.push(aStr);
                    }
                    if (!isDuplicate) {
                        this._set.set(aStr, idx);
                    }
                }
                /**
   * Is the given string a member of this set?
   *
   * @param String aStr
   */ has(aStr) {
                    return this._set.has(aStr);
                }
                /**
   * What is the index of the given string in the array?
   *
   * @param String aStr
   */ indexOf(aStr) {
                    const idx = this._set.get(aStr);
                    if (idx >= 0) {
                        return idx;
                    }
                    throw new Error('"' + aStr + '" is not in the set.');
                }
                /**
   * What is the element at the given index?
   *
   * @param Number aIdx
   */ at(aIdx) {
                    if (aIdx >= 0 && aIdx < this._array.length) {
                        return this._array[aIdx];
                    }
                    throw new Error("No element indexed by " + aIdx);
                }
                /**
   * Returns the array representation of this set (which has the proper indices
   * indicated by indexOf). Note that this is a copy of the internal array used
   * for storing the members so that no one can mess with internal state.
   */ toArray() {
                    return this._array.slice();
                }
                constructor(){
                    this._array = [];
                    this._set = new Map();
                }
            };
            exports1.ArraySet = ArraySet;
        /***/ },
        /* 4 */ /***/ function(module1, exports1, __webpack_require__) {
            /* WEBPACK VAR INJECTION */ (function(__dirname) {
                if (typeof fetch === "function") {
                    // Web version of reading a wasm file into an array buffer.
                    let mappingsWasmUrl = null;
                    module1.exports = function readWasm() {
                        if (typeof mappingsWasmUrl !== "string") {
                            throw new Error("You must provide the URL of lib/mappings.wasm by calling " + "SourceMapConsumer.initialize({ 'lib/mappings.wasm': ... }) " + "before using SourceMapConsumer");
                        }
                        return fetch(mappingsWasmUrl).then((response)=>response.arrayBuffer());
                    };
                    module1.exports.initialize = (url)=>mappingsWasmUrl = url;
                } else {
                    // Node version of reading a wasm file into an array buffer.
                    const fs = __webpack_require__(10);
                    const path = __webpack_require__(11);
                    module1.exports = function readWasm() {
                        return new Promise((resolve, reject)=>{
                            const wasmPath = path.join(__dirname, "mappings.wasm");
                            fs.readFile(wasmPath, null, (error, data)=>{
                                if (error) {
                                    reject(error);
                                    return;
                                }
                                resolve(data.buffer);
                            });
                        });
                    };
                    module1.exports.initialize = (_)=>{
                        console.debug("SourceMapConsumer.initialize is a no-op when running in node.js");
                    };
                }
            /* WEBPACK VAR INJECTION */ }).call(exports1, "/");
        /***/ },
        /* 5 */ /***/ function(module1, exports1, __webpack_require__) {
            /*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */ exports1.SourceMapGenerator = __webpack_require__(1).SourceMapGenerator;
            exports1.SourceMapConsumer = __webpack_require__(8).SourceMapConsumer;
            exports1.SourceNode = __webpack_require__(13).SourceNode;
        /***/ },
        /* 6 */ /***/ function(module1, exports1) {
            /* -*- Mode: js; js-indent-level: 2; -*- */ /*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */ const intToCharMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
            /**
 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
 */ exports1.encode = function(number) {
                if (0 <= number && number < intToCharMap.length) {
                    return intToCharMap[number];
                }
                throw new TypeError("Must be between 0 and 63: " + number);
            };
        /***/ },
        /* 7 */ /***/ function(module1, exports1, __webpack_require__) {
            /* -*- Mode: js; js-indent-level: 2; -*- */ /*
 * Copyright 2014 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */ const util = __webpack_require__(0);
            /**
 * Determine whether mappingB is after mappingA with respect to generated
 * position.
 */ function generatedPositionAfter(mappingA, mappingB) {
                // Optimized for most common case
                const lineA = mappingA.generatedLine;
                const lineB = mappingB.generatedLine;
                const columnA = mappingA.generatedColumn;
                const columnB = mappingB.generatedColumn;
                return lineB > lineA || lineB == lineA && columnB >= columnA || util.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
            }
            /**
 * A data structure to provide a sorted view of accumulated mappings in a
 * performance conscious manner. It trades a negligible overhead in general
 * case for a large speedup in case of mappings being added in order.
 */ let MappingList = class MappingList {
                /**
   * Iterate through internal items. This method takes the same arguments that
   * `Array.prototype.forEach` takes.
   *
   * NOTE: The order of the mappings is NOT guaranteed.
   */ unsortedForEach(aCallback, aThisArg) {
                    this._array.forEach(aCallback, aThisArg);
                }
                /**
   * Add the given source mapping.
   *
   * @param Object aMapping
   */ add(aMapping) {
                    if (generatedPositionAfter(this._last, aMapping)) {
                        this._last = aMapping;
                        this._array.push(aMapping);
                    } else {
                        this._sorted = false;
                        this._array.push(aMapping);
                    }
                }
                /**
   * Returns the flat, sorted array of mappings. The mappings are sorted by
   * generated position.
   *
   * WARNING: This method returns internal data without copying, for
   * performance. The return value must NOT be mutated, and should be treated as
   * an immutable borrow. If you want to take ownership, you must make your own
   * copy.
   */ toArray() {
                    if (!this._sorted) {
                        this._array.sort(util.compareByGeneratedPositionsInflated);
                        this._sorted = true;
                    }
                    return this._array;
                }
                constructor(){
                    this._array = [];
                    this._sorted = true;
                    // Serves as infimum
                    this._last = {
                        generatedLine: -1,
                        generatedColumn: 0
                    };
                }
            };
            exports1.MappingList = MappingList;
        /***/ },
        /* 8 */ /***/ function(module1, exports1, __webpack_require__) {
            /* -*- Mode: js; js-indent-level: 2; -*- */ /*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */ const util = __webpack_require__(0);
            const binarySearch = __webpack_require__(9);
            const ArraySet = __webpack_require__(3).ArraySet;
            const base64VLQ = __webpack_require__(2); // eslint-disable-line no-unused-vars
            const readWasm = __webpack_require__(4);
            const wasm = __webpack_require__(12);
            const INTERNAL = Symbol("smcInternal");
            let SourceMapConsumer = class SourceMapConsumer {
                static initialize(opts) {
                    readWasm.initialize(opts["lib/mappings.wasm"]);
                }
                static fromSourceMap(aSourceMap, aSourceMapURL) {
                    return _factoryBSM(aSourceMap, aSourceMapURL);
                }
                /**
   * Construct a new `SourceMapConsumer` from `rawSourceMap` and `sourceMapUrl`
   * (see the `SourceMapConsumer` constructor for details. Then, invoke the `async
   * function f(SourceMapConsumer) -> T` with the newly constructed consumer, wait
   * for `f` to complete, call `destroy` on the consumer, and return `f`'s return
   * value.
   *
   * You must not use the consumer after `f` completes!
   *
   * By using `with`, you do not have to remember to manually call `destroy` on
   * the consumer, since it will be called automatically once `f` completes.
   *
   * ```js
   * const xSquared = await SourceMapConsumer.with(
   *   myRawSourceMap,
   *   null,
   *   async function (consumer) {
   *     // Use `consumer` inside here and don't worry about remembering
   *     // to call `destroy`.
   *
   *     const x = await whatever(consumer);
   *     return x * x;
   *   }
   * );
   *
   * // You may not use that `consumer` anymore out here; it has
   * // been destroyed. But you can use `xSquared`.
   * console.log(xSquared);
   * ```
   */ static with(rawSourceMap, sourceMapUrl, f) {
                    // Note: The `acorn` version that `webpack` currently depends on doesn't
                    // support `async` functions, and the nodes that we support don't all have
                    // `.finally`. Therefore, this is written a bit more convolutedly than it
                    // should really be.
                    let consumer = null;
                    const promise = new SourceMapConsumer(rawSourceMap, sourceMapUrl);
                    return promise.then((c)=>{
                        consumer = c;
                        return f(c);
                    }).then((x)=>{
                        if (consumer) {
                            consumer.destroy();
                        }
                        return x;
                    }, (e)=>{
                        if (consumer) {
                            consumer.destroy();
                        }
                        throw e;
                    });
                }
                /**
   * Parse the mappings in a string in to a data structure which we can easily
   * query (the ordered arrays in the `this.__generatedMappings` and
   * `this.__originalMappings` properties).
   */ _parseMappings(aStr, aSourceRoot) {
                    throw new Error("Subclasses must implement _parseMappings");
                }
                /**
   * Iterate over each mapping between an original source/line/column and a
   * generated line/column in this source map.
   *
   * @param Function aCallback
   *        The function that is called with each mapping.
   * @param Object aContext
   *        Optional. If specified, this object will be the value of `this` every
   *        time that `aCallback` is called.
   * @param aOrder
   *        Either `SourceMapConsumer.GENERATED_ORDER` or
   *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
   *        iterate over the mappings sorted by the generated file's line/column
   *        order or the original's source/line/column order, respectively. Defaults to
   *        `SourceMapConsumer.GENERATED_ORDER`.
   */ eachMapping(aCallback, aContext, aOrder) {
                    throw new Error("Subclasses must implement eachMapping");
                }
                /**
   * Returns all generated line and column information for the original source,
   * line, and column provided. If no column is provided, returns all mappings
   * corresponding to a either the line we are searching for or the next
   * closest line that has any mappings. Otherwise, returns all mappings
   * corresponding to the given line and either the column we are searching for
   * or the next closest column that has any offsets.
   *
   * The only argument is an object with the following properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.  The line number is 1-based.
   *   - column: Optional. the column number in the original source.
   *    The column number is 0-based.
   *
   * and an array of objects is returned, each with the following properties:
   *
   *   - line: The line number in the generated source, or null.  The
   *    line number is 1-based.
   *   - column: The column number in the generated source, or null.
   *    The column number is 0-based.
   */ allGeneratedPositionsFor(aArgs) {
                    throw new Error("Subclasses must implement allGeneratedPositionsFor");
                }
                destroy() {
                    throw new Error("Subclasses must implement destroy");
                }
                constructor(aSourceMap, aSourceMapURL){
                    // If the constructor was called by super(), just return Promise<this>.
                    // Yes, this is a hack to retain the pre-existing API of the base-class
                    // constructor also being an async factory function.
                    if (aSourceMap == INTERNAL) {
                        return Promise.resolve(this);
                    }
                    return _factory(aSourceMap, aSourceMapURL);
                }
            };
            /**
 * The version of the source mapping spec that we are consuming.
 */ SourceMapConsumer.prototype._version = 3;
            SourceMapConsumer.GENERATED_ORDER = 1;
            SourceMapConsumer.ORIGINAL_ORDER = 2;
            SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
            SourceMapConsumer.LEAST_UPPER_BOUND = 2;
            exports1.SourceMapConsumer = SourceMapConsumer;
            /**
 * A BasicSourceMapConsumer instance represents a parsed source map which we can
 * query for information about the original file positions by giving it a file
 * position in the generated source.
 *
 * The first parameter is the raw source map (either as a JSON string, or
 * already parsed to an object). According to the spec, source maps have the
 * following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - sources: An array of URLs to the original source files.
 *   - names: An array of identifiers which can be referenced by individual mappings.
 *   - sourceRoot: Optional. The URL root from which all sources are relative.
 *   - sourcesContent: Optional. An array of contents of the original source files.
 *   - mappings: A string of base64 VLQs which contain the actual mappings.
 *   - file: Optional. The generated file this source map is associated with.
 *
 * Here is an example source map, taken from the source map spec[0]:
 *
 *     {
 *       version : 3,
 *       file: "out.js",
 *       sourceRoot : "",
 *       sources: ["foo.js", "bar.js"],
 *       names: ["src", "maps", "are", "fun"],
 *       mappings: "AA,AB;;ABCDE;"
 *     }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
 */ let BasicSourceMapConsumer = class BasicSourceMapConsumer extends SourceMapConsumer {
                /**
   * Utility function to find the index of a source.  Returns -1 if not
   * found.
   */ _findSourceIndex(aSource) {
                    let relativeSource = aSource;
                    if (this.sourceRoot != null) {
                        relativeSource = util.relative(this.sourceRoot, relativeSource);
                    }
                    if (this._sources.has(relativeSource)) {
                        return this._sources.indexOf(relativeSource);
                    }
                    // Maybe aSource is an absolute URL as returned by |sources|.  In
                    // this case we can't simply undo the transform.
                    for(let i = 0; i < this._absoluteSources.length; ++i){
                        if (this._absoluteSources[i] == aSource) {
                            return i;
                        }
                    }
                    return -1;
                }
                /**
   * Create a BasicSourceMapConsumer from a SourceMapGenerator.
   *
   * @param SourceMapGenerator aSourceMap
   *        The source map that will be consumed.
   * @param String aSourceMapURL
   *        The URL at which the source map can be found (optional)
   * @returns BasicSourceMapConsumer
   */ static fromSourceMap(aSourceMap, aSourceMapURL) {
                    return new BasicSourceMapConsumer(aSourceMap.toString());
                }
                get sources() {
                    return this._absoluteSources.slice();
                }
                _getMappingsPtr() {
                    if (this._mappingsPtr === 0) {
                        this._parseMappings(this._mappings, this.sourceRoot);
                    }
                    return this._mappingsPtr;
                }
                /**
   * Parse the mappings in a string in to a data structure which we can easily
   * query (the ordered arrays in the `this.__generatedMappings` and
   * `this.__originalMappings` properties).
   */ _parseMappings(aStr, aSourceRoot) {
                    const size = aStr.length;
                    const mappingsBufPtr = this._wasm.exports.allocate_mappings(size);
                    const mappingsBuf = new Uint8Array(this._wasm.exports.memory.buffer, mappingsBufPtr, size);
                    for(let i = 0; i < size; i++){
                        mappingsBuf[i] = aStr.charCodeAt(i);
                    }
                    const mappingsPtr = this._wasm.exports.parse_mappings(mappingsBufPtr);
                    if (!mappingsPtr) {
                        const error = this._wasm.exports.get_last_error();
                        let msg = `Error parsing mappings (code ${error}): `;
                        // XXX: keep these error codes in sync with `fitzgen/source-map-mappings`.
                        switch(error){
                            case 1:
                                msg += "the mappings contained a negative line, column, source index, or name index";
                                break;
                            case 2:
                                msg += "the mappings contained a number larger than 2**32";
                                break;
                            case 3:
                                msg += "reached EOF while in the middle of parsing a VLQ";
                                break;
                            case 4:
                                msg += "invalid base 64 character while parsing a VLQ";
                                break;
                            default:
                                msg += "unknown error code";
                                break;
                        }
                        throw new Error(msg);
                    }
                    this._mappingsPtr = mappingsPtr;
                }
                eachMapping(aCallback, aContext, aOrder) {
                    const context = aContext || null;
                    const order = aOrder || SourceMapConsumer.GENERATED_ORDER;
                    const sourceRoot = this.sourceRoot;
                    this._wasm.withMappingCallback((mapping)=>{
                        if (mapping.source !== null) {
                            mapping.source = this._sources.at(mapping.source);
                            mapping.source = util.computeSourceURL(sourceRoot, mapping.source, this._sourceMapURL);
                            if (mapping.name !== null) {
                                mapping.name = this._names.at(mapping.name);
                            }
                        }
                        aCallback.call(context, mapping);
                    }, ()=>{
                        switch(order){
                            case SourceMapConsumer.GENERATED_ORDER:
                                this._wasm.exports.by_generated_location(this._getMappingsPtr());
                                break;
                            case SourceMapConsumer.ORIGINAL_ORDER:
                                this._wasm.exports.by_original_location(this._getMappingsPtr());
                                break;
                            default:
                                throw new Error("Unknown order of iteration.");
                        }
                    });
                }
                allGeneratedPositionsFor(aArgs) {
                    let source = util.getArg(aArgs, "source");
                    const originalLine = util.getArg(aArgs, "line");
                    const originalColumn = aArgs.column || 0;
                    source = this._findSourceIndex(source);
                    if (source < 0) {
                        return [];
                    }
                    if (originalLine < 1) {
                        throw new Error("Line numbers must be >= 1");
                    }
                    if (originalColumn < 0) {
                        throw new Error("Column numbers must be >= 0");
                    }
                    const mappings = [];
                    this._wasm.withMappingCallback((m)=>{
                        let lastColumn = m.lastGeneratedColumn;
                        if (this._computedColumnSpans && lastColumn === null) {
                            lastColumn = Infinity;
                        }
                        mappings.push({
                            line: m.generatedLine,
                            column: m.generatedColumn,
                            lastColumn
                        });
                    }, ()=>{
                        this._wasm.exports.all_generated_locations_for(this._getMappingsPtr(), source, originalLine - 1, "column" in aArgs, originalColumn);
                    });
                    return mappings;
                }
                destroy() {
                    if (this._mappingsPtr !== 0) {
                        this._wasm.exports.free_mappings(this._mappingsPtr);
                        this._mappingsPtr = 0;
                    }
                }
                /**
   * Compute the last column for each generated mapping. The last column is
   * inclusive.
   */ computeColumnSpans() {
                    if (this._computedColumnSpans) {
                        return;
                    }
                    this._wasm.exports.compute_column_spans(this._getMappingsPtr());
                    this._computedColumnSpans = true;
                }
                /**
   * Returns the original source, line, and column information for the generated
   * source's line and column positions provided. The only argument is an object
   * with the following properties:
   *
   *   - line: The line number in the generated source.  The line number
   *     is 1-based.
   *   - column: The column number in the generated source.  The column
   *     number is 0-based.
   *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
   *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
   *     closest element that is smaller than or greater than the one we are
   *     searching for, respectively, if the exact element cannot be found.
   *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
   *
   * and an object is returned with the following properties:
   *
   *   - source: The original source file, or null.
   *   - line: The line number in the original source, or null.  The
   *     line number is 1-based.
   *   - column: The column number in the original source, or null.  The
   *     column number is 0-based.
   *   - name: The original identifier, or null.
   */ originalPositionFor(aArgs) {
                    const needle = {
                        generatedLine: util.getArg(aArgs, "line"),
                        generatedColumn: util.getArg(aArgs, "column")
                    };
                    if (needle.generatedLine < 1) {
                        throw new Error("Line numbers must be >= 1");
                    }
                    if (needle.generatedColumn < 0) {
                        throw new Error("Column numbers must be >= 0");
                    }
                    let bias = util.getArg(aArgs, "bias", SourceMapConsumer.GREATEST_LOWER_BOUND);
                    if (bias == null) {
                        bias = SourceMapConsumer.GREATEST_LOWER_BOUND;
                    }
                    let mapping;
                    this._wasm.withMappingCallback((m)=>mapping = m, ()=>{
                        this._wasm.exports.original_location_for(this._getMappingsPtr(), needle.generatedLine - 1, needle.generatedColumn, bias);
                    });
                    if (mapping) {
                        if (mapping.generatedLine === needle.generatedLine) {
                            let source = util.getArg(mapping, "source", null);
                            if (source !== null) {
                                source = this._sources.at(source);
                                source = util.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
                            }
                            let name = util.getArg(mapping, "name", null);
                            if (name !== null) {
                                name = this._names.at(name);
                            }
                            return {
                                source,
                                line: util.getArg(mapping, "originalLine", null),
                                column: util.getArg(mapping, "originalColumn", null),
                                name
                            };
                        }
                    }
                    return {
                        source: null,
                        line: null,
                        column: null,
                        name: null
                    };
                }
                /**
   * Return true if we have the source content for every source in the source
   * map, false otherwise.
   */ hasContentsOfAllSources() {
                    if (!this.sourcesContent) {
                        return false;
                    }
                    return this.sourcesContent.length >= this._sources.size() && !this.sourcesContent.some(function(sc) {
                        return sc == null;
                    });
                }
                /**
   * Returns the original source content. The only argument is the url of the
   * original source file. Returns null if no original source content is
   * available.
   */ sourceContentFor(aSource, nullOnMissing) {
                    if (!this.sourcesContent) {
                        return null;
                    }
                    const index = this._findSourceIndex(aSource);
                    if (index >= 0) {
                        return this.sourcesContent[index];
                    }
                    let relativeSource = aSource;
                    if (this.sourceRoot != null) {
                        relativeSource = util.relative(this.sourceRoot, relativeSource);
                    }
                    let url;
                    if (this.sourceRoot != null && (url = util.urlParse(this.sourceRoot))) {
                        // XXX: file:// URIs and absolute paths lead to unexpected behavior for
                        // many users. We can help them out when they expect file:// URIs to
                        // behave like it would if they were running a local HTTP server. See
                        // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
                        const fileUriAbsPath = relativeSource.replace(/^file:\/\//, "");
                        if (url.scheme == "file" && this._sources.has(fileUriAbsPath)) {
                            return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)];
                        }
                        if ((!url.path || url.path == "/") && this._sources.has("/" + relativeSource)) {
                            return this.sourcesContent[this._sources.indexOf("/" + relativeSource)];
                        }
                    }
                    // This function is used recursively from
                    // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
                    // don't want to throw if we can't find the source - we just want to
                    // return null, so we provide a flag to exit gracefully.
                    if (nullOnMissing) {
                        return null;
                    }
                    throw new Error('"' + relativeSource + '" is not in the SourceMap.');
                }
                /**
   * Returns the generated line and column information for the original source,
   * line, and column positions provided. The only argument is an object with
   * the following properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.  The line number
   *     is 1-based.
   *   - column: The column number in the original source.  The column
   *     number is 0-based.
   *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
   *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
   *     closest element that is smaller than or greater than the one we are
   *     searching for, respectively, if the exact element cannot be found.
   *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
   *
   * and an object is returned with the following properties:
   *
   *   - line: The line number in the generated source, or null.  The
   *     line number is 1-based.
   *   - column: The column number in the generated source, or null.
   *     The column number is 0-based.
   */ generatedPositionFor(aArgs) {
                    let source = util.getArg(aArgs, "source");
                    source = this._findSourceIndex(source);
                    if (source < 0) {
                        return {
                            line: null,
                            column: null,
                            lastColumn: null
                        };
                    }
                    const needle = {
                        source,
                        originalLine: util.getArg(aArgs, "line"),
                        originalColumn: util.getArg(aArgs, "column")
                    };
                    if (needle.originalLine < 1) {
                        throw new Error("Line numbers must be >= 1");
                    }
                    if (needle.originalColumn < 0) {
                        throw new Error("Column numbers must be >= 0");
                    }
                    let bias = util.getArg(aArgs, "bias", SourceMapConsumer.GREATEST_LOWER_BOUND);
                    if (bias == null) {
                        bias = SourceMapConsumer.GREATEST_LOWER_BOUND;
                    }
                    let mapping;
                    this._wasm.withMappingCallback((m)=>mapping = m, ()=>{
                        this._wasm.exports.generated_location_for(this._getMappingsPtr(), needle.source, needle.originalLine - 1, needle.originalColumn, bias);
                    });
                    if (mapping) {
                        if (mapping.source === needle.source) {
                            let lastColumn = mapping.lastGeneratedColumn;
                            if (this._computedColumnSpans && lastColumn === null) {
                                lastColumn = Infinity;
                            }
                            return {
                                line: util.getArg(mapping, "generatedLine", null),
                                column: util.getArg(mapping, "generatedColumn", null),
                                lastColumn
                            };
                        }
                    }
                    return {
                        line: null,
                        column: null,
                        lastColumn: null
                    };
                }
                constructor(aSourceMap, aSourceMapURL){
                    return super(INTERNAL).then((that)=>{
                        let sourceMap = aSourceMap;
                        if (typeof aSourceMap === "string") {
                            sourceMap = util.parseSourceMapInput(aSourceMap);
                        }
                        const version = util.getArg(sourceMap, "version");
                        let sources = util.getArg(sourceMap, "sources");
                        // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
                        // requires the array) to play nice here.
                        const names = util.getArg(sourceMap, "names", []);
                        let sourceRoot = util.getArg(sourceMap, "sourceRoot", null);
                        const sourcesContent = util.getArg(sourceMap, "sourcesContent", null);
                        const mappings = util.getArg(sourceMap, "mappings");
                        const file = util.getArg(sourceMap, "file", null);
                        // Once again, Sass deviates from the spec and supplies the version as a
                        // string rather than a number, so we use loose equality checking here.
                        if (version != that._version) {
                            throw new Error("Unsupported version: " + version);
                        }
                        if (sourceRoot) {
                            sourceRoot = util.normalize(sourceRoot);
                        }
                        sources = sources.map(String)// Some source maps produce relative source paths like "./foo.js" instead of
                        // "foo.js".  Normalize these first so that future comparisons will succeed.
                        // See bugzil.la/1090768.
                        .map(util.normalize)// Always ensure that absolute sources are internally stored relative to
                        // the source root, if the source root is absolute. Not doing this would
                        // be particularly problematic when the source root is a prefix of the
                        // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
                        .map(function(source) {
                            return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source) ? util.relative(sourceRoot, source) : source;
                        });
                        // Pass `true` below to allow duplicate names and sources. While source maps
                        // are intended to be compressed and deduplicated, the TypeScript compiler
                        // sometimes generates source maps with duplicates in them. See Github issue
                        // #72 and bugzil.la/889492.
                        that._names = ArraySet.fromArray(names.map(String), true);
                        that._sources = ArraySet.fromArray(sources, true);
                        that._absoluteSources = that._sources.toArray().map(function(s) {
                            return util.computeSourceURL(sourceRoot, s, aSourceMapURL);
                        });
                        that.sourceRoot = sourceRoot;
                        that.sourcesContent = sourcesContent;
                        that._mappings = mappings;
                        that._sourceMapURL = aSourceMapURL;
                        that.file = file;
                        that._computedColumnSpans = false;
                        that._mappingsPtr = 0;
                        that._wasm = null;
                        return wasm().then((w)=>{
                            that._wasm = w;
                            return that;
                        });
                    });
                }
            };
            BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;
            exports1.BasicSourceMapConsumer = BasicSourceMapConsumer;
            /**
 * An IndexedSourceMapConsumer instance represents a parsed source map which
 * we can query for information. It differs from BasicSourceMapConsumer in
 * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
 * input.
 *
 * The first parameter is a raw source map (either as a JSON string, or already
 * parsed to an object). According to the spec for indexed source maps, they
 * have the following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - file: Optional. The generated file this source map is associated with.
 *   - sections: A list of section definitions.
 *
 * Each value under the "sections" field has two fields:
 *   - offset: The offset into the original specified at which this section
 *       begins to apply, defined as an object with a "line" and "column"
 *       field.
 *   - map: A source map definition. This source map could also be indexed,
 *       but doesn't have to be.
 *
 * Instead of the "map" field, it's also possible to have a "url" field
 * specifying a URL to retrieve a source map from, but that's currently
 * unsupported.
 *
 * Here's an example source map, taken from the source map spec[0], but
 * modified to omit a section which uses the "url" field.
 *
 *  {
 *    version : 3,
 *    file: "app.js",
 *    sections: [{
 *      offset: {line:100, column:10},
 *      map: {
 *        version : 3,
 *        file: "section.js",
 *        sources: ["foo.js", "bar.js"],
 *        names: ["src", "maps", "are", "fun"],
 *        mappings: "AAAA,E;;ABCDE;"
 *      }
 *    }],
 *  }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
 */ let IndexedSourceMapConsumer = class IndexedSourceMapConsumer extends SourceMapConsumer {
                // `__generatedMappings` and `__originalMappings` are arrays that hold the
                // parsed mapping coordinates from the source map's "mappings" attribute. They
                // are lazily instantiated, accessed via the `_generatedMappings` and
                // `_originalMappings` getters respectively, and we only parse the mappings
                // and create these arrays once queried for a source location. We jump through
                // these hoops because there can be many thousands of mappings, and parsing
                // them is expensive, so we only want to do it if we must.
                //
                // Each object in the arrays is of the form:
                //
                //     {
                //       generatedLine: The line number in the generated code,
                //       generatedColumn: The column number in the generated code,
                //       source: The path to the original source file that generated this
                //               chunk of code,
                //       originalLine: The line number in the original source that
                //                     corresponds to this chunk of generated code,
                //       originalColumn: The column number in the original source that
                //                       corresponds to this chunk of generated code,
                //       name: The name of the original symbol which generated this chunk of
                //             code.
                //     }
                //
                // All properties except for `generatedLine` and `generatedColumn` can be
                // `null`.
                //
                // `_generatedMappings` is ordered by the generated positions.
                //
                // `_originalMappings` is ordered by the original positions.
                get _generatedMappings() {
                    if (!this.__generatedMappings) {
                        this._sortGeneratedMappings();
                    }
                    return this.__generatedMappings;
                }
                get _originalMappings() {
                    if (!this.__originalMappings) {
                        this._sortOriginalMappings();
                    }
                    return this.__originalMappings;
                }
                get _generatedMappingsUnsorted() {
                    if (!this.__generatedMappingsUnsorted) {
                        this._parseMappings(this._mappings, this.sourceRoot);
                    }
                    return this.__generatedMappingsUnsorted;
                }
                get _originalMappingsUnsorted() {
                    if (!this.__originalMappingsUnsorted) {
                        this._parseMappings(this._mappings, this.sourceRoot);
                    }
                    return this.__originalMappingsUnsorted;
                }
                _sortGeneratedMappings() {
                    const mappings = this._generatedMappingsUnsorted;
                    mappings.sort(util.compareByGeneratedPositionsDeflated);
                    this.__generatedMappings = mappings;
                }
                _sortOriginalMappings() {
                    const mappings = this._originalMappingsUnsorted;
                    mappings.sort(util.compareByOriginalPositions);
                    this.__originalMappings = mappings;
                }
                /**
   * The list of original sources.
   */ get sources() {
                    const sources = [];
                    for(let i = 0; i < this._sections.length; i++){
                        for(let j = 0; j < this._sections[i].consumer.sources.length; j++){
                            sources.push(this._sections[i].consumer.sources[j]);
                        }
                    }
                    return sources;
                }
                /**
   * Returns the original source, line, and column information for the generated
   * source's line and column positions provided. The only argument is an object
   * with the following properties:
   *
   *   - line: The line number in the generated source.  The line number
   *     is 1-based.
   *   - column: The column number in the generated source.  The column
   *     number is 0-based.
   *
   * and an object is returned with the following properties:
   *
   *   - source: The original source file, or null.
   *   - line: The line number in the original source, or null.  The
   *     line number is 1-based.
   *   - column: The column number in the original source, or null.  The
   *     column number is 0-based.
   *   - name: The original identifier, or null.
   */ originalPositionFor(aArgs) {
                    const needle = {
                        generatedLine: util.getArg(aArgs, "line"),
                        generatedColumn: util.getArg(aArgs, "column")
                    };
                    // Find the section containing the generated position we're trying to map
                    // to an original position.
                    const sectionIndex = binarySearch.search(needle, this._sections, function(aNeedle, section) {
                        const cmp = aNeedle.generatedLine - section.generatedOffset.generatedLine;
                        if (cmp) {
                            return cmp;
                        }
                        return aNeedle.generatedColumn - section.generatedOffset.generatedColumn;
                    });
                    const section = this._sections[sectionIndex];
                    if (!section) {
                        return {
                            source: null,
                            line: null,
                            column: null,
                            name: null
                        };
                    }
                    return section.consumer.originalPositionFor({
                        line: needle.generatedLine - (section.generatedOffset.generatedLine - 1),
                        column: needle.generatedColumn - (section.generatedOffset.generatedLine === needle.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0),
                        bias: aArgs.bias
                    });
                }
                /**
   * Return true if we have the source content for every source in the source
   * map, false otherwise.
   */ hasContentsOfAllSources() {
                    return this._sections.every(function(s) {
                        return s.consumer.hasContentsOfAllSources();
                    });
                }
                /**
   * Returns the original source content. The only argument is the url of the
   * original source file. Returns null if no original source content is
   * available.
   */ sourceContentFor(aSource, nullOnMissing) {
                    for(let i = 0; i < this._sections.length; i++){
                        const section = this._sections[i];
                        const content = section.consumer.sourceContentFor(aSource, true);
                        if (content) {
                            return content;
                        }
                    }
                    if (nullOnMissing) {
                        return null;
                    }
                    throw new Error('"' + aSource + '" is not in the SourceMap.');
                }
                /**
   * Returns the generated line and column information for the original source,
   * line, and column positions provided. The only argument is an object with
   * the following properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.  The line number
   *     is 1-based.
   *   - column: The column number in the original source.  The column
   *     number is 0-based.
   *
   * and an object is returned with the following properties:
   *
   *   - line: The line number in the generated source, or null.  The
   *     line number is 1-based.
   *   - column: The column number in the generated source, or null.
   *     The column number is 0-based.
   */ generatedPositionFor(aArgs) {
                    for(let i = 0; i < this._sections.length; i++){
                        const section = this._sections[i];
                        // Only consider this section if the requested source is in the list of
                        // sources of the consumer.
                        if (section.consumer._findSourceIndex(util.getArg(aArgs, "source")) === -1) {
                            continue;
                        }
                        const generatedPosition = section.consumer.generatedPositionFor(aArgs);
                        if (generatedPosition) {
                            const ret = {
                                line: generatedPosition.line + (section.generatedOffset.generatedLine - 1),
                                column: generatedPosition.column + (section.generatedOffset.generatedLine === generatedPosition.line ? section.generatedOffset.generatedColumn - 1 : 0)
                            };
                            return ret;
                        }
                    }
                    return {
                        line: null,
                        column: null
                    };
                }
                /**
   * Parse the mappings in a string in to a data structure which we can easily
   * query (the ordered arrays in the `this.__generatedMappings` and
   * `this.__originalMappings` properties).
   */ _parseMappings(aStr, aSourceRoot) {
                    const generatedMappings = this.__generatedMappingsUnsorted = [];
                    const originalMappings = this.__originalMappingsUnsorted = [];
                    for(let i = 0; i < this._sections.length; i++){
                        const section = this._sections[i];
                        const sectionMappings = [];
                        section.consumer.eachMapping((m)=>sectionMappings.push(m));
                        for(let j = 0; j < sectionMappings.length; j++){
                            const mapping = sectionMappings[j];
                            // TODO: test if null is correct here.  The original code used
                            // `source`, which would actually have gotten used as null because
                            // var's get hoisted.
                            // See: https://github.com/mozilla/source-map/issues/333
                            let source = util.computeSourceURL(section.consumer.sourceRoot, null, this._sourceMapURL);
                            this._sources.add(source);
                            source = this._sources.indexOf(source);
                            let name = null;
                            if (mapping.name) {
                                this._names.add(mapping.name);
                                name = this._names.indexOf(mapping.name);
                            }
                            // The mappings coming from the consumer for the section have
                            // generated positions relative to the start of the section, so we
                            // need to offset them to be relative to the start of the concatenated
                            // generated file.
                            const adjustedMapping = {
                                source,
                                generatedLine: mapping.generatedLine + (section.generatedOffset.generatedLine - 1),
                                generatedColumn: mapping.generatedColumn + (section.generatedOffset.generatedLine === mapping.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0),
                                originalLine: mapping.originalLine,
                                originalColumn: mapping.originalColumn,
                                name
                            };
                            generatedMappings.push(adjustedMapping);
                            if (typeof adjustedMapping.originalLine === "number") {
                                originalMappings.push(adjustedMapping);
                            }
                        }
                    }
                }
                eachMapping(aCallback, aContext, aOrder) {
                    const context = aContext || null;
                    const order = aOrder || SourceMapConsumer.GENERATED_ORDER;
                    let mappings;
                    switch(order){
                        case SourceMapConsumer.GENERATED_ORDER:
                            mappings = this._generatedMappings;
                            break;
                        case SourceMapConsumer.ORIGINAL_ORDER:
                            mappings = this._originalMappings;
                            break;
                        default:
                            throw new Error("Unknown order of iteration.");
                    }
                    const sourceRoot = this.sourceRoot;
                    mappings.map(function(mapping) {
                        let source = null;
                        if (mapping.source !== null) {
                            source = this._sources.at(mapping.source);
                            source = util.computeSourceURL(sourceRoot, source, this._sourceMapURL);
                        }
                        return {
                            source,
                            generatedLine: mapping.generatedLine,
                            generatedColumn: mapping.generatedColumn,
                            originalLine: mapping.originalLine,
                            originalColumn: mapping.originalColumn,
                            name: mapping.name === null ? null : this._names.at(mapping.name)
                        };
                    }, this).forEach(aCallback, context);
                }
                /**
   * Find the mapping that best matches the hypothetical "needle" mapping that
   * we are searching for in the given "haystack" of mappings.
   */ _findMapping(aNeedle, aMappings, aLineName, aColumnName, aComparator, aBias) {
                    // To return the position we are searching for, we must first find the
                    // mapping for the given position and then return the opposite position it
                    // points to. Because the mappings are sorted, we can use binary search to
                    // find the best mapping.
                    if (aNeedle[aLineName] <= 0) {
                        throw new TypeError("Line must be greater than or equal to 1, got " + aNeedle[aLineName]);
                    }
                    if (aNeedle[aColumnName] < 0) {
                        throw new TypeError("Column must be greater than or equal to 0, got " + aNeedle[aColumnName]);
                    }
                    return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
                }
                allGeneratedPositionsFor(aArgs) {
                    const line = util.getArg(aArgs, "line");
                    // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
                    // returns the index of the closest mapping less than the needle. By
                    // setting needle.originalColumn to 0, we thus find the last mapping for
                    // the given line, provided such a mapping exists.
                    const needle = {
                        source: util.getArg(aArgs, "source"),
                        originalLine: line,
                        originalColumn: util.getArg(aArgs, "column", 0)
                    };
                    needle.source = this._findSourceIndex(needle.source);
                    if (needle.source < 0) {
                        return [];
                    }
                    if (needle.originalLine < 1) {
                        throw new Error("Line numbers must be >= 1");
                    }
                    if (needle.originalColumn < 0) {
                        throw new Error("Column numbers must be >= 0");
                    }
                    const mappings = [];
                    let index = this._findMapping(needle, this._originalMappings, "originalLine", "originalColumn", util.compareByOriginalPositions, binarySearch.LEAST_UPPER_BOUND);
                    if (index >= 0) {
                        let mapping = this._originalMappings[index];
                        if (aArgs.column === undefined) {
                            const originalLine = mapping.originalLine;
                            // Iterate until either we run out of mappings, or we run into
                            // a mapping for a different line than the one we found. Since
                            // mappings are sorted, this is guaranteed to find all mappings for
                            // the line we found.
                            while(mapping && mapping.originalLine === originalLine){
                                let lastColumn = mapping.lastGeneratedColumn;
                                if (this._computedColumnSpans && lastColumn === null) {
                                    lastColumn = Infinity;
                                }
                                mappings.push({
                                    line: util.getArg(mapping, "generatedLine", null),
                                    column: util.getArg(mapping, "generatedColumn", null),
                                    lastColumn
                                });
                                mapping = this._originalMappings[++index];
                            }
                        } else {
                            const originalColumn = mapping.originalColumn;
                            // Iterate until either we run out of mappings, or we run into
                            // a mapping for a different line than the one we were searching for.
                            // Since mappings are sorted, this is guaranteed to find all mappings for
                            // the line we are searching for.
                            while(mapping && mapping.originalLine === line && mapping.originalColumn == originalColumn){
                                let lastColumn = mapping.lastGeneratedColumn;
                                if (this._computedColumnSpans && lastColumn === null) {
                                    lastColumn = Infinity;
                                }
                                mappings.push({
                                    line: util.getArg(mapping, "generatedLine", null),
                                    column: util.getArg(mapping, "generatedColumn", null),
                                    lastColumn
                                });
                                mapping = this._originalMappings[++index];
                            }
                        }
                    }
                    return mappings;
                }
                destroy() {
                    for(let i = 0; i < this._sections.length; i++){
                        this._sections[i].consumer.destroy();
                    }
                }
                constructor(aSourceMap, aSourceMapURL){
                    return super(INTERNAL).then((that)=>{
                        let sourceMap = aSourceMap;
                        if (typeof aSourceMap === "string") {
                            sourceMap = util.parseSourceMapInput(aSourceMap);
                        }
                        const version = util.getArg(sourceMap, "version");
                        const sections = util.getArg(sourceMap, "sections");
                        if (version != that._version) {
                            throw new Error("Unsupported version: " + version);
                        }
                        that._sources = new ArraySet();
                        that._names = new ArraySet();
                        that.__generatedMappings = null;
                        that.__originalMappings = null;
                        that.__generatedMappingsUnsorted = null;
                        that.__originalMappingsUnsorted = null;
                        let lastOffset = {
                            line: -1,
                            column: 0
                        };
                        return Promise.all(sections.map((s)=>{
                            if (s.url) {
                                // The url field will require support for asynchronicity.
                                // See https://github.com/mozilla/source-map/issues/16
                                throw new Error("Support for url field in sections not implemented.");
                            }
                            const offset = util.getArg(s, "offset");
                            const offsetLine = util.getArg(offset, "line");
                            const offsetColumn = util.getArg(offset, "column");
                            if (offsetLine < lastOffset.line || offsetLine === lastOffset.line && offsetColumn < lastOffset.column) {
                                throw new Error("Section offsets must be ordered and non-overlapping.");
                            }
                            lastOffset = offset;
                            const cons = new SourceMapConsumer(util.getArg(s, "map"), aSourceMapURL);
                            return cons.then((consumer)=>{
                                return {
                                    generatedOffset: {
                                        // The offset fields are 0-based, but we use 1-based indices when
                                        // encoding/decoding from VLQ.
                                        generatedLine: offsetLine + 1,
                                        generatedColumn: offsetColumn + 1
                                    },
                                    consumer
                                };
                            });
                        })).then((s)=>{
                            that._sections = s;
                            return that;
                        });
                    });
                }
            };
            exports1.IndexedSourceMapConsumer = IndexedSourceMapConsumer;
            /*
 * Cheat to get around inter-twingled classes.  `factory()` can be at the end
 * where it has access to non-hoisted classes, but it gets hoisted itself.
 */ function _factory(aSourceMap, aSourceMapURL) {
                let sourceMap = aSourceMap;
                if (typeof aSourceMap === "string") {
                    sourceMap = util.parseSourceMapInput(aSourceMap);
                }
                const consumer = sourceMap.sections != null ? new IndexedSourceMapConsumer(sourceMap, aSourceMapURL) : new BasicSourceMapConsumer(sourceMap, aSourceMapURL);
                return Promise.resolve(consumer);
            }
            function _factoryBSM(aSourceMap, aSourceMapURL) {
                return BasicSourceMapConsumer.fromSourceMap(aSourceMap, aSourceMapURL);
            }
        /***/ },
        /* 9 */ /***/ function(module1, exports1) {
            /* -*- Mode: js; js-indent-level: 2; -*- */ /*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */ exports1.GREATEST_LOWER_BOUND = 1;
            exports1.LEAST_UPPER_BOUND = 2;
            /**
 * Recursive implementation of binary search.
 *
 * @param aLow Indices here and lower do not contain the needle.
 * @param aHigh Indices here and higher do not contain the needle.
 * @param aNeedle The element being searched for.
 * @param aHaystack The non-empty array being searched.
 * @param aCompare Function which takes two elements and returns -1, 0, or 1.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 */ function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
                // This function terminates when one of the following is true:
                //
                //   1. We find the exact element we are looking for.
                //
                //   2. We did not find the exact element, but we can return the index of
                //      the next-closest element.
                //
                //   3. We did not find the exact element, and there is no next-closest
                //      element than the one we are searching for, so we return -1.
                const mid = Math.floor((aHigh - aLow) / 2) + aLow;
                const cmp = aCompare(aNeedle, aHaystack[mid], true);
                if (cmp === 0) {
                    // Found the element we are looking for.
                    return mid;
                } else if (cmp > 0) {
                    // Our needle is greater than aHaystack[mid].
                    if (aHigh - mid > 1) {
                        // The element is in the upper half.
                        return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
                    }
                    // The exact needle element was not found in this haystack. Determine if
                    // we are in termination case (3) or (2) and return the appropriate thing.
                    if (aBias == exports1.LEAST_UPPER_BOUND) {
                        return aHigh < aHaystack.length ? aHigh : -1;
                    }
                    return mid;
                }
                // Our needle is less than aHaystack[mid].
                if (mid - aLow > 1) {
                    // The element is in the lower half.
                    return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
                }
                // we are in termination case (3) or (2) and return the appropriate thing.
                if (aBias == exports1.LEAST_UPPER_BOUND) {
                    return mid;
                }
                return aLow < 0 ? -1 : aLow;
            }
            /**
 * This is an implementation of binary search which will always try and return
 * the index of the closest element if there is no exact hit. This is because
 * mappings between original and generated line/col pairs are single points,
 * and there is an implicit region between each of them, so a miss just means
 * that you aren't on the very start of a region.
 *
 * @param aNeedle The element you are looking for.
 * @param aHaystack The array that is being searched.
 * @param aCompare A function which takes the needle and an element in the
 *     array and returns -1, 0, or 1 depending on whether the needle is less
 *     than, equal to, or greater than the element, respectively.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
 */ exports1.search = function search(aNeedle, aHaystack, aCompare, aBias) {
                if (aHaystack.length === 0) {
                    return -1;
                }
                let index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare, aBias || exports1.GREATEST_LOWER_BOUND);
                if (index < 0) {
                    return -1;
                }
                // We have found either the exact element, or the next-closest element than
                // the one we are searching for. However, there may be more than one such
                // element. Make sure we always return the smallest of these.
                while(index - 1 >= 0){
                    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
                        break;
                    }
                    --index;
                }
                return index;
            };
        /***/ },
        /* 10 */ /***/ function(module1, exports1) {
            module1.exports = __WEBPACK_EXTERNAL_MODULE_10__;
        /***/ },
        /* 11 */ /***/ function(module1, exports1) {
            module1.exports = __WEBPACK_EXTERNAL_MODULE_11__;
        /***/ },
        /* 12 */ /***/ function(module1, exports1, __webpack_require__) {
            const readWasm = __webpack_require__(4);
            /**
 * Provide the JIT with a nice shape / hidden class.
 */ function Mapping() {
                this.generatedLine = 0;
                this.generatedColumn = 0;
                this.lastGeneratedColumn = null;
                this.source = null;
                this.originalLine = null;
                this.originalColumn = null;
                this.name = null;
            }
            let cachedWasm = null;
            module1.exports = function wasm() {
                if (cachedWasm) {
                    return cachedWasm;
                }
                const callbackStack = [];
                cachedWasm = readWasm().then((buffer)=>{
                    return WebAssembly.instantiate(buffer, {
                        env: {
                            mapping_callback (generatedLine, generatedColumn, hasLastGeneratedColumn, lastGeneratedColumn, hasOriginal, source, originalLine, originalColumn, hasName, name) {
                                const mapping = new Mapping();
                                // JS uses 1-based line numbers, wasm uses 0-based.
                                mapping.generatedLine = generatedLine + 1;
                                mapping.generatedColumn = generatedColumn;
                                if (hasLastGeneratedColumn) {
                                    // JS uses inclusive last generated column, wasm uses exclusive.
                                    mapping.lastGeneratedColumn = lastGeneratedColumn - 1;
                                }
                                if (hasOriginal) {
                                    mapping.source = source;
                                    // JS uses 1-based line numbers, wasm uses 0-based.
                                    mapping.originalLine = originalLine + 1;
                                    mapping.originalColumn = originalColumn;
                                    if (hasName) {
                                        mapping.name = name;
                                    }
                                }
                                callbackStack[callbackStack.length - 1](mapping);
                            },
                            start_all_generated_locations_for () {
                                console.time("all_generated_locations_for");
                            },
                            end_all_generated_locations_for () {
                                console.timeEnd("all_generated_locations_for");
                            },
                            start_compute_column_spans () {
                                console.time("compute_column_spans");
                            },
                            end_compute_column_spans () {
                                console.timeEnd("compute_column_spans");
                            },
                            start_generated_location_for () {
                                console.time("generated_location_for");
                            },
                            end_generated_location_for () {
                                console.timeEnd("generated_location_for");
                            },
                            start_original_location_for () {
                                console.time("original_location_for");
                            },
                            end_original_location_for () {
                                console.timeEnd("original_location_for");
                            },
                            start_parse_mappings () {
                                console.time("parse_mappings");
                            },
                            end_parse_mappings () {
                                console.timeEnd("parse_mappings");
                            },
                            start_sort_by_generated_location () {
                                console.time("sort_by_generated_location");
                            },
                            end_sort_by_generated_location () {
                                console.timeEnd("sort_by_generated_location");
                            },
                            start_sort_by_original_location () {
                                console.time("sort_by_original_location");
                            },
                            end_sort_by_original_location () {
                                console.timeEnd("sort_by_original_location");
                            }
                        }
                    });
                }).then((Wasm)=>{
                    return {
                        exports: Wasm.instance.exports,
                        withMappingCallback: (mappingCallback, f)=>{
                            callbackStack.push(mappingCallback);
                            try {
                                f();
                            } finally{
                                callbackStack.pop();
                            }
                        }
                    };
                }).then(null, (e)=>{
                    cachedWasm = null;
                    throw e;
                });
                return cachedWasm;
            };
        /***/ },
        /* 13 */ /***/ function(module1, exports1, __webpack_require__) {
            /* -*- Mode: js; js-indent-level: 2; -*- */ /*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */ const SourceMapGenerator = __webpack_require__(1).SourceMapGenerator;
            const util = __webpack_require__(0);
            // Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
            // operating systems these days (capturing the result).
            const REGEX_NEWLINE = /(\r?\n)/;
            // Newline character code for charCodeAt() comparisons
            const NEWLINE_CODE = 10;
            // Private symbol for identifying `SourceNode`s when multiple versions of
            // the source-map library are loaded. This MUST NOT CHANGE across
            // versions!
            const isSourceNode = "$$$isSourceNode$$$";
            /**
 * SourceNodes provide a way to abstract over interpolating/concatenating
 * snippets of generated JavaScript source code while maintaining the line and
 * column information associated with the original source code.
 *
 * @param aLine The original line number.
 * @param aColumn The original column number.
 * @param aSource The original source's filename.
 * @param aChunks Optional. An array of strings which are snippets of
 *        generated JS, or other SourceNodes.
 * @param aName The original identifier.
 */ let SourceNode = class SourceNode {
                /**
   * Creates a SourceNode from generated code and a SourceMapConsumer.
   *
   * @param aGeneratedCode The generated code
   * @param aSourceMapConsumer The SourceMap for the generated code
   * @param aRelativePath Optional. The path that relative sources in the
   *        SourceMapConsumer should be relative to.
   */ static fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
                    // The SourceNode we want to fill with the generated code
                    // and the SourceMap
                    const node = new SourceNode();
                    // All even indices of this array are one line of the generated code,
                    // while all odd indices are the newlines between two adjacent lines
                    // (since `REGEX_NEWLINE` captures its match).
                    // Processed fragments are accessed by calling `shiftNextLine`.
                    const remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
                    let remainingLinesIndex = 0;
                    const shiftNextLine = function() {
                        const lineContents = getNextLine();
                        // The last line of a file might not have a newline.
                        const newLine = getNextLine() || "";
                        return lineContents + newLine;
                        function getNextLine() {
                            return remainingLinesIndex < remainingLines.length ? remainingLines[remainingLinesIndex++] : undefined;
                        }
                    };
                    // We need to remember the position of "remainingLines"
                    let lastGeneratedLine = 1, lastGeneratedColumn = 0;
                    // The generate SourceNodes we need a code range.
                    // To extract it current and last mapping is used.
                    // Here we store the last mapping.
                    let lastMapping = null;
                    let nextLine;
                    aSourceMapConsumer.eachMapping(function(mapping) {
                        if (lastMapping !== null) {
                            // We add the code from "lastMapping" to "mapping":
                            // First check if there is a new line in between.
                            if (lastGeneratedLine < mapping.generatedLine) {
                                // Associate first line with "lastMapping"
                                addMappingWithCode(lastMapping, shiftNextLine());
                                lastGeneratedLine++;
                                lastGeneratedColumn = 0;
                            // The remaining code is added without mapping
                            } else {
                                // There is no new line in between.
                                // Associate the code between "lastGeneratedColumn" and
                                // "mapping.generatedColumn" with "lastMapping"
                                nextLine = remainingLines[remainingLinesIndex] || "";
                                const code = nextLine.substr(0, mapping.generatedColumn - lastGeneratedColumn);
                                remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn - lastGeneratedColumn);
                                lastGeneratedColumn = mapping.generatedColumn;
                                addMappingWithCode(lastMapping, code);
                                // No more remaining code, continue
                                lastMapping = mapping;
                                return;
                            }
                        }
                        // We add the generated code until the first mapping
                        // to the SourceNode without any mapping.
                        // Each line is added as separate string.
                        while(lastGeneratedLine < mapping.generatedLine){
                            node.add(shiftNextLine());
                            lastGeneratedLine++;
                        }
                        if (lastGeneratedColumn < mapping.generatedColumn) {
                            nextLine = remainingLines[remainingLinesIndex] || "";
                            node.add(nextLine.substr(0, mapping.generatedColumn));
                            remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn);
                            lastGeneratedColumn = mapping.generatedColumn;
                        }
                        lastMapping = mapping;
                    }, this);
                    // We have processed all mappings.
                    if (remainingLinesIndex < remainingLines.length) {
                        if (lastMapping) {
                            // Associate the remaining code in the current line with "lastMapping"
                            addMappingWithCode(lastMapping, shiftNextLine());
                        }
                        // and add the remaining lines without any mapping
                        node.add(remainingLines.splice(remainingLinesIndex).join(""));
                    }
                    // Copy sourcesContent into SourceNode
                    aSourceMapConsumer.sources.forEach(function(sourceFile) {
                        const content = aSourceMapConsumer.sourceContentFor(sourceFile);
                        if (content != null) {
                            if (aRelativePath != null) {
                                sourceFile = util.join(aRelativePath, sourceFile);
                            }
                            node.setSourceContent(sourceFile, content);
                        }
                    });
                    return node;
                    function addMappingWithCode(mapping, code) {
                        if (mapping === null || mapping.source === undefined) {
                            node.add(code);
                        } else {
                            const source = aRelativePath ? util.join(aRelativePath, mapping.source) : mapping.source;
                            node.add(new SourceNode(mapping.originalLine, mapping.originalColumn, source, code, mapping.name));
                        }
                    }
                }
                /**
   * Add a chunk of generated JS to this source node.
   *
   * @param aChunk A string snippet of generated JS code, another instance of
   *        SourceNode, or an array where each member is one of those things.
   */ add(aChunk) {
                    if (Array.isArray(aChunk)) {
                        aChunk.forEach(function(chunk) {
                            this.add(chunk);
                        }, this);
                    } else if (aChunk[isSourceNode] || typeof aChunk === "string") {
                        if (aChunk) {
                            this.children.push(aChunk);
                        }
                    } else {
                        throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk);
                    }
                    return this;
                }
                /**
   * Add a chunk of generated JS to the beginning of this source node.
   *
   * @param aChunk A string snippet of generated JS code, another instance of
   *        SourceNode, or an array where each member is one of those things.
   */ prepend(aChunk) {
                    if (Array.isArray(aChunk)) {
                        for(let i = aChunk.length - 1; i >= 0; i--){
                            this.prepend(aChunk[i]);
                        }
                    } else if (aChunk[isSourceNode] || typeof aChunk === "string") {
                        this.children.unshift(aChunk);
                    } else {
                        throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk);
                    }
                    return this;
                }
                /**
   * Walk over the tree of JS snippets in this node and its children. The
   * walking function is called once for each snippet of JS and is passed that
   * snippet and the its original associated source's line/column location.
   *
   * @param aFn The traversal function.
   */ walk(aFn) {
                    let chunk;
                    for(let i = 0, len = this.children.length; i < len; i++){
                        chunk = this.children[i];
                        if (chunk[isSourceNode]) {
                            chunk.walk(aFn);
                        } else if (chunk !== "") {
                            aFn(chunk, {
                                source: this.source,
                                line: this.line,
                                column: this.column,
                                name: this.name
                            });
                        }
                    }
                }
                /**
   * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
   * each of `this.children`.
   *
   * @param aSep The separator.
   */ join(aSep) {
                    let newChildren;
                    let i;
                    const len = this.children.length;
                    if (len > 0) {
                        newChildren = [];
                        for(i = 0; i < len - 1; i++){
                            newChildren.push(this.children[i]);
                            newChildren.push(aSep);
                        }
                        newChildren.push(this.children[i]);
                        this.children = newChildren;
                    }
                    return this;
                }
                /**
   * Call String.prototype.replace on the very right-most source snippet. Useful
   * for trimming whitespace from the end of a source node, etc.
   *
   * @param aPattern The pattern to replace.
   * @param aReplacement The thing to replace the pattern with.
   */ replaceRight(aPattern, aReplacement) {
                    const lastChild = this.children[this.children.length - 1];
                    if (lastChild[isSourceNode]) {
                        lastChild.replaceRight(aPattern, aReplacement);
                    } else if (typeof lastChild === "string") {
                        this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
                    } else {
                        this.children.push("".replace(aPattern, aReplacement));
                    }
                    return this;
                }
                /**
   * Set the source content for a source file. This will be added to the SourceMapGenerator
   * in the sourcesContent field.
   *
   * @param aSourceFile The filename of the source file
   * @param aSourceContent The content of the source file
   */ setSourceContent(aSourceFile, aSourceContent) {
                    this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
                }
                /**
   * Walk over the tree of SourceNodes. The walking function is called for each
   * source file content and is passed the filename and source content.
   *
   * @param aFn The traversal function.
   */ walkSourceContents(aFn) {
                    for(let i = 0, len = this.children.length; i < len; i++){
                        if (this.children[i][isSourceNode]) {
                            this.children[i].walkSourceContents(aFn);
                        }
                    }
                    const sources = Object.keys(this.sourceContents);
                    for(let i = 0, len = sources.length; i < len; i++){
                        aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
                    }
                }
                /**
   * Return the string representation of this source node. Walks over the tree
   * and concatenates all the various snippets together to one string.
   */ toString() {
                    let str = "";
                    this.walk(function(chunk) {
                        str += chunk;
                    });
                    return str;
                }
                /**
   * Returns the string representation of this source node along with a source
   * map.
   */ toStringWithSourceMap(aArgs) {
                    const generated = {
                        code: "",
                        line: 1,
                        column: 0
                    };
                    const map = new SourceMapGenerator(aArgs);
                    let sourceMappingActive = false;
                    let lastOriginalSource = null;
                    let lastOriginalLine = null;
                    let lastOriginalColumn = null;
                    let lastOriginalName = null;
                    this.walk(function(chunk, original) {
                        generated.code += chunk;
                        if (original.source !== null && original.line !== null && original.column !== null) {
                            if (lastOriginalSource !== original.source || lastOriginalLine !== original.line || lastOriginalColumn !== original.column || lastOriginalName !== original.name) {
                                map.addMapping({
                                    source: original.source,
                                    original: {
                                        line: original.line,
                                        column: original.column
                                    },
                                    generated: {
                                        line: generated.line,
                                        column: generated.column
                                    },
                                    name: original.name
                                });
                            }
                            lastOriginalSource = original.source;
                            lastOriginalLine = original.line;
                            lastOriginalColumn = original.column;
                            lastOriginalName = original.name;
                            sourceMappingActive = true;
                        } else if (sourceMappingActive) {
                            map.addMapping({
                                generated: {
                                    line: generated.line,
                                    column: generated.column
                                }
                            });
                            lastOriginalSource = null;
                            sourceMappingActive = false;
                        }
                        for(let idx = 0, length = chunk.length; idx < length; idx++){
                            if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
                                generated.line++;
                                generated.column = 0;
                                // Mappings end at eol
                                if (idx + 1 === length) {
                                    lastOriginalSource = null;
                                    sourceMappingActive = false;
                                } else if (sourceMappingActive) {
                                    map.addMapping({
                                        source: original.source,
                                        original: {
                                            line: original.line,
                                            column: original.column
                                        },
                                        generated: {
                                            line: generated.line,
                                            column: generated.column
                                        },
                                        name: original.name
                                    });
                                }
                            } else {
                                generated.column++;
                            }
                        }
                    });
                    this.walkSourceContents(function(sourceFile, sourceContent) {
                        map.setSourceContent(sourceFile, sourceContent);
                    });
                    return {
                        code: generated.code,
                        map
                    };
                }
                constructor(aLine, aColumn, aSource, aChunks, aName){
                    this.children = [];
                    this.sourceContents = {};
                    this.line = aLine == null ? null : aLine;
                    this.column = aColumn == null ? null : aColumn;
                    this.source = aSource == null ? null : aSource;
                    this.name = aName == null ? null : aName;
                    this[isSourceNode] = true;
                    if (aChunks != null) this.add(aChunks);
                }
            };
            exports1.SourceNode = SourceNode;
        /***/ }
    ]);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvc291cmNlLW1hcC0wLjcuMy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoXCJmc1wiKSwgcmVxdWlyZShcInBhdGhcIikpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW1wiZnNcIiwgXCJwYXRoXCJdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcInNvdXJjZU1hcFwiXSA9IGZhY3RvcnkocmVxdWlyZShcImZzXCIpLCByZXF1aXJlKFwicGF0aFwiKSk7XG5cdGVsc2Vcblx0XHRyb290W1wic291cmNlTWFwXCJdID0gZmFjdG9yeShyb290W1wiZnNcIl0sIHJvb3RbXCJwYXRoXCJdKTtcbn0pKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiB0aGlzLCBmdW5jdGlvbihfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzEwX18sIF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfMTFfXykge1xucmV0dXJuIC8qKioqKiovIChmdW5jdGlvbihtb2R1bGVzKSB7IC8vIHdlYnBhY2tCb290c3RyYXBcbi8qKioqKiovIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbi8qKioqKiovIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbi8qKioqKiovIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuLyoqKioqKi8gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4vKioqKioqLyBcdFx0fVxuLyoqKioqKi8gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4vKioqKioqLyBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuLyoqKioqKi8gXHRcdFx0aTogbW9kdWxlSWQsXG4vKioqKioqLyBcdFx0XHRsOiBmYWxzZSxcbi8qKioqKiovIFx0XHRcdGV4cG9ydHM6IHt9XG4vKioqKioqLyBcdFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4vKioqKioqLyBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbi8qKioqKiovIFx0XHRtb2R1bGUubCA9IHRydWU7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4vKioqKioqLyBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuLyoqKioqKi8gXHR9XG4vKioqKioqL1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4vKioqKioqLyBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuLyoqKioqKi8gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbi8qKioqKiovIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbi8qKioqKiovIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbi8qKioqKiovIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbi8qKioqKiovIFx0XHRcdH0pO1xuLyoqKioqKi8gXHRcdH1cbi8qKioqKiovIFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuLyoqKioqKi8gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuLyoqKioqKi8gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbi8qKioqKiovIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4vKioqKioqLyBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuLyoqKioqKi8gXHRcdHJldHVybiBnZXR0ZXI7XG4vKioqKioqLyBcdH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLyoqKioqKi8gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSA1KTtcbi8qKioqKiovIH0pXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gKFtcbi8qIDAgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxuLyogLSotIE1vZGU6IGpzOyBqcy1pbmRlbnQtbGV2ZWw6IDI7IC0qLSAqL1xuLypcbiAqIENvcHlyaWdodCAyMDExIE1vemlsbGEgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTmV3IEJTRCBsaWNlbnNlLiBTZWUgTElDRU5TRSBvcjpcbiAqIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9CU0QtMy1DbGF1c2VcbiAqL1xuXG4vKipcbiAqIFRoaXMgaXMgYSBoZWxwZXIgZnVuY3Rpb24gZm9yIGdldHRpbmcgdmFsdWVzIGZyb20gcGFyYW1ldGVyL29wdGlvbnNcbiAqIG9iamVjdHMuXG4gKlxuICogQHBhcmFtIGFyZ3MgVGhlIG9iamVjdCB3ZSBhcmUgZXh0cmFjdGluZyB2YWx1ZXMgZnJvbVxuICogQHBhcmFtIG5hbWUgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHdlIGFyZSBnZXR0aW5nLlxuICogQHBhcmFtIGRlZmF1bHRWYWx1ZSBBbiBvcHRpb25hbCB2YWx1ZSB0byByZXR1cm4gaWYgdGhlIHByb3BlcnR5IGlzIG1pc3NpbmdcbiAqIGZyb20gdGhlIG9iamVjdC4gSWYgdGhpcyBpcyBub3Qgc3BlY2lmaWVkIGFuZCB0aGUgcHJvcGVydHkgaXMgbWlzc2luZywgYW5cbiAqIGVycm9yIHdpbGwgYmUgdGhyb3duLlxuICovXG5mdW5jdGlvbiBnZXRBcmcoYUFyZ3MsIGFOYW1lLCBhRGVmYXVsdFZhbHVlKSB7XG4gIGlmIChhTmFtZSBpbiBhQXJncykge1xuICAgIHJldHVybiBhQXJnc1thTmFtZV07XG4gIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgIHJldHVybiBhRGVmYXVsdFZhbHVlO1xuICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdcIicgKyBhTmFtZSArICdcIiBpcyBhIHJlcXVpcmVkIGFyZ3VtZW50LicpO1xuXG59XG5leHBvcnRzLmdldEFyZyA9IGdldEFyZztcblxuY29uc3QgdXJsUmVnZXhwID0gL14oPzooW1xcdytcXC0uXSspOik/XFwvXFwvKD86KFxcdys6XFx3KylAKT8oW1xcdy4tXSopKD86OihcXGQrKSk/KC4qKSQvO1xuY29uc3QgZGF0YVVybFJlZ2V4cCA9IC9eZGF0YTouK1xcLC4rJC87XG5cbmZ1bmN0aW9uIHVybFBhcnNlKGFVcmwpIHtcbiAgY29uc3QgbWF0Y2ggPSBhVXJsLm1hdGNoKHVybFJlZ2V4cCk7XG4gIGlmICghbWF0Y2gpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4ge1xuICAgIHNjaGVtZTogbWF0Y2hbMV0sXG4gICAgYXV0aDogbWF0Y2hbMl0sXG4gICAgaG9zdDogbWF0Y2hbM10sXG4gICAgcG9ydDogbWF0Y2hbNF0sXG4gICAgcGF0aDogbWF0Y2hbNV1cbiAgfTtcbn1cbmV4cG9ydHMudXJsUGFyc2UgPSB1cmxQYXJzZTtcblxuZnVuY3Rpb24gdXJsR2VuZXJhdGUoYVBhcnNlZFVybCkge1xuICBsZXQgdXJsID0gXCJcIjtcbiAgaWYgKGFQYXJzZWRVcmwuc2NoZW1lKSB7XG4gICAgdXJsICs9IGFQYXJzZWRVcmwuc2NoZW1lICsgXCI6XCI7XG4gIH1cbiAgdXJsICs9IFwiLy9cIjtcbiAgaWYgKGFQYXJzZWRVcmwuYXV0aCkge1xuICAgIHVybCArPSBhUGFyc2VkVXJsLmF1dGggKyBcIkBcIjtcbiAgfVxuICBpZiAoYVBhcnNlZFVybC5ob3N0KSB7XG4gICAgdXJsICs9IGFQYXJzZWRVcmwuaG9zdDtcbiAgfVxuICBpZiAoYVBhcnNlZFVybC5wb3J0KSB7XG4gICAgdXJsICs9IFwiOlwiICsgYVBhcnNlZFVybC5wb3J0O1xuICB9XG4gIGlmIChhUGFyc2VkVXJsLnBhdGgpIHtcbiAgICB1cmwgKz0gYVBhcnNlZFVybC5wYXRoO1xuICB9XG4gIHJldHVybiB1cmw7XG59XG5leHBvcnRzLnVybEdlbmVyYXRlID0gdXJsR2VuZXJhdGU7XG5cbmNvbnN0IE1BWF9DQUNIRURfSU5QVVRTID0gMzI7XG5cbi8qKlxuICogVGFrZXMgc29tZSBmdW5jdGlvbiBgZihpbnB1dCkgLT4gcmVzdWx0YCBhbmQgcmV0dXJucyBhIG1lbW9pemVkIHZlcnNpb24gb2ZcbiAqIGBmYC5cbiAqXG4gKiBXZSBrZWVwIGF0IG1vc3QgYE1BWF9DQUNIRURfSU5QVVRTYCBtZW1vaXplZCByZXN1bHRzIG9mIGBmYCBhbGl2ZS4gVGhlXG4gKiBtZW1vaXphdGlvbiBpcyBhIGR1bWItc2ltcGxlLCBsaW5lYXIgbGVhc3QtcmVjZW50bHktdXNlZCBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gbHJ1TWVtb2l6ZShmKSB7XG4gIGNvbnN0IGNhY2hlID0gW107XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjYWNoZS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGNhY2hlW2ldLmlucHV0ID09PSBpbnB1dCkge1xuICAgICAgICBjb25zdCB0ZW1wID0gY2FjaGVbMF07XG4gICAgICAgIGNhY2hlWzBdID0gY2FjaGVbaV07XG4gICAgICAgIGNhY2hlW2ldID0gdGVtcDtcbiAgICAgICAgcmV0dXJuIGNhY2hlWzBdLnJlc3VsdDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQgPSBmKGlucHV0KTtcblxuICAgIGNhY2hlLnVuc2hpZnQoe1xuICAgICAgaW5wdXQsXG4gICAgICByZXN1bHQsXG4gICAgfSk7XG5cbiAgICBpZiAoY2FjaGUubGVuZ3RoID4gTUFYX0NBQ0hFRF9JTlBVVFMpIHtcbiAgICAgIGNhY2hlLnBvcCgpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG5cbi8qKlxuICogTm9ybWFsaXplcyBhIHBhdGgsIG9yIHRoZSBwYXRoIHBvcnRpb24gb2YgYSBVUkw6XG4gKlxuICogLSBSZXBsYWNlcyBjb25zZWN1dGl2ZSBzbGFzaGVzIHdpdGggb25lIHNsYXNoLlxuICogLSBSZW1vdmVzIHVubmVjZXNzYXJ5ICcuJyBwYXJ0cy5cbiAqIC0gUmVtb3ZlcyB1bm5lY2Vzc2FyeSAnPGRpcj4vLi4nIHBhcnRzLlxuICpcbiAqIEJhc2VkIG9uIGNvZGUgaW4gdGhlIE5vZGUuanMgJ3BhdGgnIGNvcmUgbW9kdWxlLlxuICpcbiAqIEBwYXJhbSBhUGF0aCBUaGUgcGF0aCBvciB1cmwgdG8gbm9ybWFsaXplLlxuICovXG5jb25zdCBub3JtYWxpemUgPSBscnVNZW1vaXplKGZ1bmN0aW9uIG5vcm1hbGl6ZShhUGF0aCkge1xuICBsZXQgcGF0aCA9IGFQYXRoO1xuICBjb25zdCB1cmwgPSB1cmxQYXJzZShhUGF0aCk7XG4gIGlmICh1cmwpIHtcbiAgICBpZiAoIXVybC5wYXRoKSB7XG4gICAgICByZXR1cm4gYVBhdGg7XG4gICAgfVxuICAgIHBhdGggPSB1cmwucGF0aDtcbiAgfVxuICBjb25zdCBpc0Fic29sdXRlID0gZXhwb3J0cy5pc0Fic29sdXRlKHBhdGgpO1xuXG4gIC8vIFNwbGl0IHRoZSBwYXRoIGludG8gcGFydHMgYmV0d2VlbiBgL2AgY2hhcmFjdGVycy4gVGhpcyBpcyBtdWNoIGZhc3RlciB0aGFuXG4gIC8vIHVzaW5nIGAuc3BsaXQoL1xcLysvZylgLlxuICBjb25zdCBwYXJ0cyA9IFtdO1xuICBsZXQgc3RhcnQgPSAwO1xuICBsZXQgaSA9IDA7XG4gIHdoaWxlICh0cnVlKSB7XG4gICAgc3RhcnQgPSBpO1xuICAgIGkgPSBwYXRoLmluZGV4T2YoXCIvXCIsIHN0YXJ0KTtcbiAgICBpZiAoaSA9PT0gLTEpIHtcbiAgICAgIHBhcnRzLnB1c2gocGF0aC5zbGljZShzdGFydCkpO1xuICAgICAgYnJlYWs7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnRzLnB1c2gocGF0aC5zbGljZShzdGFydCwgaSkpO1xuICAgICAgd2hpbGUgKGkgPCBwYXRoLmxlbmd0aCAmJiBwYXRoW2ldID09PSBcIi9cIikge1xuICAgICAgICBpKys7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbGV0IHVwID0gMDtcbiAgZm9yIChpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBjb25zdCBwYXJ0ID0gcGFydHNbaV07XG4gICAgaWYgKHBhcnQgPT09IFwiLlwiKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgfSBlbHNlIGlmIChwYXJ0ID09PSBcIi4uXCIpIHtcbiAgICAgIHVwKys7XG4gICAgfSBlbHNlIGlmICh1cCA+IDApIHtcbiAgICAgIGlmIChwYXJ0ID09PSBcIlwiKSB7XG4gICAgICAgIC8vIFRoZSBmaXJzdCBwYXJ0IGlzIGJsYW5rIGlmIHRoZSBwYXRoIGlzIGFic29sdXRlLiBUcnlpbmcgdG8gZ29cbiAgICAgICAgLy8gYWJvdmUgdGhlIHJvb3QgaXMgYSBuby1vcC4gVGhlcmVmb3JlIHdlIGNhbiByZW1vdmUgYWxsICcuLicgcGFydHNcbiAgICAgICAgLy8gZGlyZWN0bHkgYWZ0ZXIgdGhlIHJvb3QuXG4gICAgICAgIHBhcnRzLnNwbGljZShpICsgMSwgdXApO1xuICAgICAgICB1cCA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJ0cy5zcGxpY2UoaSwgMik7XG4gICAgICAgIHVwLS07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHBhdGggPSBwYXJ0cy5qb2luKFwiL1wiKTtcblxuICBpZiAocGF0aCA9PT0gXCJcIikge1xuICAgIHBhdGggPSBpc0Fic29sdXRlID8gXCIvXCIgOiBcIi5cIjtcbiAgfVxuXG4gIGlmICh1cmwpIHtcbiAgICB1cmwucGF0aCA9IHBhdGg7XG4gICAgcmV0dXJuIHVybEdlbmVyYXRlKHVybCk7XG4gIH1cbiAgcmV0dXJuIHBhdGg7XG59KTtcbmV4cG9ydHMubm9ybWFsaXplID0gbm9ybWFsaXplO1xuXG4vKipcbiAqIEpvaW5zIHR3byBwYXRocy9VUkxzLlxuICpcbiAqIEBwYXJhbSBhUm9vdCBUaGUgcm9vdCBwYXRoIG9yIFVSTC5cbiAqIEBwYXJhbSBhUGF0aCBUaGUgcGF0aCBvciBVUkwgdG8gYmUgam9pbmVkIHdpdGggdGhlIHJvb3QuXG4gKlxuICogLSBJZiBhUGF0aCBpcyBhIFVSTCBvciBhIGRhdGEgVVJJLCBhUGF0aCBpcyByZXR1cm5lZCwgdW5sZXNzIGFQYXRoIGlzIGFcbiAqICAgc2NoZW1lLXJlbGF0aXZlIFVSTDogVGhlbiB0aGUgc2NoZW1lIG9mIGFSb290LCBpZiBhbnksIGlzIHByZXBlbmRlZFxuICogICBmaXJzdC5cbiAqIC0gT3RoZXJ3aXNlIGFQYXRoIGlzIGEgcGF0aC4gSWYgYVJvb3QgaXMgYSBVUkwsIHRoZW4gaXRzIHBhdGggcG9ydGlvblxuICogICBpcyB1cGRhdGVkIHdpdGggdGhlIHJlc3VsdCBhbmQgYVJvb3QgaXMgcmV0dXJuZWQuIE90aGVyd2lzZSB0aGUgcmVzdWx0XG4gKiAgIGlzIHJldHVybmVkLlxuICogICAtIElmIGFQYXRoIGlzIGFic29sdXRlLCB0aGUgcmVzdWx0IGlzIGFQYXRoLlxuICogICAtIE90aGVyd2lzZSB0aGUgdHdvIHBhdGhzIGFyZSBqb2luZWQgd2l0aCBhIHNsYXNoLlxuICogLSBKb2luaW5nIGZvciBleGFtcGxlICdodHRwOi8vJyBhbmQgJ3d3dy5leGFtcGxlLmNvbScgaXMgYWxzbyBzdXBwb3J0ZWQuXG4gKi9cbmZ1bmN0aW9uIGpvaW4oYVJvb3QsIGFQYXRoKSB7XG4gIGlmIChhUm9vdCA9PT0gXCJcIikge1xuICAgIGFSb290ID0gXCIuXCI7XG4gIH1cbiAgaWYgKGFQYXRoID09PSBcIlwiKSB7XG4gICAgYVBhdGggPSBcIi5cIjtcbiAgfVxuICBjb25zdCBhUGF0aFVybCA9IHVybFBhcnNlKGFQYXRoKTtcbiAgY29uc3QgYVJvb3RVcmwgPSB1cmxQYXJzZShhUm9vdCk7XG4gIGlmIChhUm9vdFVybCkge1xuICAgIGFSb290ID0gYVJvb3RVcmwucGF0aCB8fCBcIi9cIjtcbiAgfVxuXG4gIC8vIGBqb2luKGZvbywgJy8vd3d3LmV4YW1wbGUub3JnJylgXG4gIGlmIChhUGF0aFVybCAmJiAhYVBhdGhVcmwuc2NoZW1lKSB7XG4gICAgaWYgKGFSb290VXJsKSB7XG4gICAgICBhUGF0aFVybC5zY2hlbWUgPSBhUm9vdFVybC5zY2hlbWU7XG4gICAgfVxuICAgIHJldHVybiB1cmxHZW5lcmF0ZShhUGF0aFVybCk7XG4gIH1cblxuICBpZiAoYVBhdGhVcmwgfHwgYVBhdGgubWF0Y2goZGF0YVVybFJlZ2V4cCkpIHtcbiAgICByZXR1cm4gYVBhdGg7XG4gIH1cblxuICAvLyBgam9pbignaHR0cDovLycsICd3d3cuZXhhbXBsZS5jb20nKWBcbiAgaWYgKGFSb290VXJsICYmICFhUm9vdFVybC5ob3N0ICYmICFhUm9vdFVybC5wYXRoKSB7XG4gICAgYVJvb3RVcmwuaG9zdCA9IGFQYXRoO1xuICAgIHJldHVybiB1cmxHZW5lcmF0ZShhUm9vdFVybCk7XG4gIH1cblxuICBjb25zdCBqb2luZWQgPSBhUGF0aC5jaGFyQXQoMCkgPT09IFwiL1wiXG4gICAgPyBhUGF0aFxuICAgIDogbm9ybWFsaXplKGFSb290LnJlcGxhY2UoL1xcLyskLywgXCJcIikgKyBcIi9cIiArIGFQYXRoKTtcblxuICBpZiAoYVJvb3RVcmwpIHtcbiAgICBhUm9vdFVybC5wYXRoID0gam9pbmVkO1xuICAgIHJldHVybiB1cmxHZW5lcmF0ZShhUm9vdFVybCk7XG4gIH1cbiAgcmV0dXJuIGpvaW5lZDtcbn1cbmV4cG9ydHMuam9pbiA9IGpvaW47XG5cbmV4cG9ydHMuaXNBYnNvbHV0ZSA9IGZ1bmN0aW9uKGFQYXRoKSB7XG4gIHJldHVybiBhUGF0aC5jaGFyQXQoMCkgPT09IFwiL1wiIHx8IHVybFJlZ2V4cC50ZXN0KGFQYXRoKTtcbn07XG5cbi8qKlxuICogTWFrZSBhIHBhdGggcmVsYXRpdmUgdG8gYSBVUkwgb3IgYW5vdGhlciBwYXRoLlxuICpcbiAqIEBwYXJhbSBhUm9vdCBUaGUgcm9vdCBwYXRoIG9yIFVSTC5cbiAqIEBwYXJhbSBhUGF0aCBUaGUgcGF0aCBvciBVUkwgdG8gYmUgbWFkZSByZWxhdGl2ZSB0byBhUm9vdC5cbiAqL1xuZnVuY3Rpb24gcmVsYXRpdmUoYVJvb3QsIGFQYXRoKSB7XG4gIGlmIChhUm9vdCA9PT0gXCJcIikge1xuICAgIGFSb290ID0gXCIuXCI7XG4gIH1cblxuICBhUm9vdCA9IGFSb290LnJlcGxhY2UoL1xcLyQvLCBcIlwiKTtcblxuICAvLyBJdCBpcyBwb3NzaWJsZSBmb3IgdGhlIHBhdGggdG8gYmUgYWJvdmUgdGhlIHJvb3QuIEluIHRoaXMgY2FzZSwgc2ltcGx5XG4gIC8vIGNoZWNraW5nIHdoZXRoZXIgdGhlIHJvb3QgaXMgYSBwcmVmaXggb2YgdGhlIHBhdGggd29uJ3Qgd29yay4gSW5zdGVhZCwgd2VcbiAgLy8gbmVlZCB0byByZW1vdmUgY29tcG9uZW50cyBmcm9tIHRoZSByb290IG9uZSBieSBvbmUsIHVudGlsIGVpdGhlciB3ZSBmaW5kXG4gIC8vIGEgcHJlZml4IHRoYXQgZml0cywgb3Igd2UgcnVuIG91dCBvZiBjb21wb25lbnRzIHRvIHJlbW92ZS5cbiAgbGV0IGxldmVsID0gMDtcbiAgd2hpbGUgKGFQYXRoLmluZGV4T2YoYVJvb3QgKyBcIi9cIikgIT09IDApIHtcbiAgICBjb25zdCBpbmRleCA9IGFSb290Lmxhc3RJbmRleE9mKFwiL1wiKTtcbiAgICBpZiAoaW5kZXggPCAwKSB7XG4gICAgICByZXR1cm4gYVBhdGg7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIG9ubHkgcGFydCBvZiB0aGUgcm9vdCB0aGF0IGlzIGxlZnQgaXMgdGhlIHNjaGVtZSAoaS5lLiBodHRwOi8vLFxuICAgIC8vIGZpbGU6Ly8vLCBldGMuKSwgb25lIG9yIG1vcmUgc2xhc2hlcyAoLyksIG9yIHNpbXBseSBub3RoaW5nIGF0IGFsbCwgd2VcbiAgICAvLyBoYXZlIGV4aGF1c3RlZCBhbGwgY29tcG9uZW50cywgc28gdGhlIHBhdGggaXMgbm90IHJlbGF0aXZlIHRvIHRoZSByb290LlxuICAgIGFSb290ID0gYVJvb3Quc2xpY2UoMCwgaW5kZXgpO1xuICAgIGlmIChhUm9vdC5tYXRjaCgvXihbXlxcL10rOlxcLyk/XFwvKiQvKSkge1xuICAgICAgcmV0dXJuIGFQYXRoO1xuICAgIH1cblxuICAgICsrbGV2ZWw7XG4gIH1cblxuICAvLyBNYWtlIHN1cmUgd2UgYWRkIGEgXCIuLi9cIiBmb3IgZWFjaCBjb21wb25lbnQgd2UgcmVtb3ZlZCBmcm9tIHRoZSByb290LlxuICByZXR1cm4gQXJyYXkobGV2ZWwgKyAxKS5qb2luKFwiLi4vXCIpICsgYVBhdGguc3Vic3RyKGFSb290Lmxlbmd0aCArIDEpO1xufVxuZXhwb3J0cy5yZWxhdGl2ZSA9IHJlbGF0aXZlO1xuXG5jb25zdCBzdXBwb3J0c051bGxQcm90byA9IChmdW5jdGlvbigpIHtcbiAgY29uc3Qgb2JqID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgcmV0dXJuICEoXCJfX3Byb3RvX19cIiBpbiBvYmopO1xufSgpKTtcblxuZnVuY3Rpb24gaWRlbnRpdHkocykge1xuICByZXR1cm4gcztcbn1cblxuLyoqXG4gKiBCZWNhdXNlIGJlaGF2aW9yIGdvZXMgd2Fja3kgd2hlbiB5b3Ugc2V0IGBfX3Byb3RvX19gIG9uIG9iamVjdHMsIHdlXG4gKiBoYXZlIHRvIHByZWZpeCBhbGwgdGhlIHN0cmluZ3MgaW4gb3VyIHNldCB3aXRoIGFuIGFyYml0cmFyeSBjaGFyYWN0ZXIuXG4gKlxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhL3NvdXJjZS1tYXAvcHVsbC8zMSBhbmRcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhL3NvdXJjZS1tYXAvaXNzdWVzLzMwXG4gKlxuICogQHBhcmFtIFN0cmluZyBhU3RyXG4gKi9cbmZ1bmN0aW9uIHRvU2V0U3RyaW5nKGFTdHIpIHtcbiAgaWYgKGlzUHJvdG9TdHJpbmcoYVN0cikpIHtcbiAgICByZXR1cm4gXCIkXCIgKyBhU3RyO1xuICB9XG5cbiAgcmV0dXJuIGFTdHI7XG59XG5leHBvcnRzLnRvU2V0U3RyaW5nID0gc3VwcG9ydHNOdWxsUHJvdG8gPyBpZGVudGl0eSA6IHRvU2V0U3RyaW5nO1xuXG5mdW5jdGlvbiBmcm9tU2V0U3RyaW5nKGFTdHIpIHtcbiAgaWYgKGlzUHJvdG9TdHJpbmcoYVN0cikpIHtcbiAgICByZXR1cm4gYVN0ci5zbGljZSgxKTtcbiAgfVxuXG4gIHJldHVybiBhU3RyO1xufVxuZXhwb3J0cy5mcm9tU2V0U3RyaW5nID0gc3VwcG9ydHNOdWxsUHJvdG8gPyBpZGVudGl0eSA6IGZyb21TZXRTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzUHJvdG9TdHJpbmcocykge1xuICBpZiAoIXMpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCBsZW5ndGggPSBzLmxlbmd0aDtcblxuICBpZiAobGVuZ3RoIDwgOSAvKiBcIl9fcHJvdG9fX1wiLmxlbmd0aCAqLykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qIGVzbGludC1kaXNhYmxlIG5vLW11bHRpLXNwYWNlcyAqL1xuICBpZiAocy5jaGFyQ29kZUF0KGxlbmd0aCAtIDEpICE9PSA5NSAgLyogJ18nICovIHx8XG4gICAgICBzLmNoYXJDb2RlQXQobGVuZ3RoIC0gMikgIT09IDk1ICAvKiAnXycgKi8gfHxcbiAgICAgIHMuY2hhckNvZGVBdChsZW5ndGggLSAzKSAhPT0gMTExIC8qICdvJyAqLyB8fFxuICAgICAgcy5jaGFyQ29kZUF0KGxlbmd0aCAtIDQpICE9PSAxMTYgLyogJ3QnICovIHx8XG4gICAgICBzLmNoYXJDb2RlQXQobGVuZ3RoIC0gNSkgIT09IDExMSAvKiAnbycgKi8gfHxcbiAgICAgIHMuY2hhckNvZGVBdChsZW5ndGggLSA2KSAhPT0gMTE0IC8qICdyJyAqLyB8fFxuICAgICAgcy5jaGFyQ29kZUF0KGxlbmd0aCAtIDcpICE9PSAxMTIgLyogJ3AnICovIHx8XG4gICAgICBzLmNoYXJDb2RlQXQobGVuZ3RoIC0gOCkgIT09IDk1ICAvKiAnXycgKi8gfHxcbiAgICAgIHMuY2hhckNvZGVBdChsZW5ndGggLSA5KSAhPT0gOTUgIC8qICdfJyAqLykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIG5vLW11bHRpLXNwYWNlcyAqL1xuXG4gIGZvciAobGV0IGkgPSBsZW5ndGggLSAxMDsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAocy5jaGFyQ29kZUF0KGkpICE9PSAzNiAvKiAnJCcgKi8pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBDb21wYXJhdG9yIGJldHdlZW4gdHdvIG1hcHBpbmdzIHdoZXJlIHRoZSBvcmlnaW5hbCBwb3NpdGlvbnMgYXJlIGNvbXBhcmVkLlxuICpcbiAqIE9wdGlvbmFsbHkgcGFzcyBpbiBgdHJ1ZWAgYXMgYG9ubHlDb21wYXJlR2VuZXJhdGVkYCB0byBjb25zaWRlciB0d29cbiAqIG1hcHBpbmdzIHdpdGggdGhlIHNhbWUgb3JpZ2luYWwgc291cmNlL2xpbmUvY29sdW1uLCBidXQgZGlmZmVyZW50IGdlbmVyYXRlZFxuICogbGluZSBhbmQgY29sdW1uIHRoZSBzYW1lLiBVc2VmdWwgd2hlbiBzZWFyY2hpbmcgZm9yIGEgbWFwcGluZyB3aXRoIGFcbiAqIHN0dWJiZWQgb3V0IG1hcHBpbmcuXG4gKi9cbmZ1bmN0aW9uIGNvbXBhcmVCeU9yaWdpbmFsUG9zaXRpb25zKG1hcHBpbmdBLCBtYXBwaW5nQiwgb25seUNvbXBhcmVPcmlnaW5hbCkge1xuICBsZXQgY21wID0gc3RyY21wKG1hcHBpbmdBLnNvdXJjZSwgbWFwcGluZ0Iuc291cmNlKTtcbiAgaWYgKGNtcCAhPT0gMCkge1xuICAgIHJldHVybiBjbXA7XG4gIH1cblxuICBjbXAgPSBtYXBwaW5nQS5vcmlnaW5hbExpbmUgLSBtYXBwaW5nQi5vcmlnaW5hbExpbmU7XG4gIGlmIChjbXAgIT09IDApIHtcbiAgICByZXR1cm4gY21wO1xuICB9XG5cbiAgY21wID0gbWFwcGluZ0Eub3JpZ2luYWxDb2x1bW4gLSBtYXBwaW5nQi5vcmlnaW5hbENvbHVtbjtcbiAgaWYgKGNtcCAhPT0gMCB8fCBvbmx5Q29tcGFyZU9yaWdpbmFsKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIGNtcCA9IG1hcHBpbmdBLmdlbmVyYXRlZENvbHVtbiAtIG1hcHBpbmdCLmdlbmVyYXRlZENvbHVtbjtcbiAgaWYgKGNtcCAhPT0gMCkge1xuICAgIHJldHVybiBjbXA7XG4gIH1cblxuICBjbXAgPSBtYXBwaW5nQS5nZW5lcmF0ZWRMaW5lIC0gbWFwcGluZ0IuZ2VuZXJhdGVkTGluZTtcbiAgaWYgKGNtcCAhPT0gMCkge1xuICAgIHJldHVybiBjbXA7XG4gIH1cblxuICByZXR1cm4gc3RyY21wKG1hcHBpbmdBLm5hbWUsIG1hcHBpbmdCLm5hbWUpO1xufVxuZXhwb3J0cy5jb21wYXJlQnlPcmlnaW5hbFBvc2l0aW9ucyA9IGNvbXBhcmVCeU9yaWdpbmFsUG9zaXRpb25zO1xuXG4vKipcbiAqIENvbXBhcmF0b3IgYmV0d2VlbiB0d28gbWFwcGluZ3Mgd2l0aCBkZWZsYXRlZCBzb3VyY2UgYW5kIG5hbWUgaW5kaWNlcyB3aGVyZVxuICogdGhlIGdlbmVyYXRlZCBwb3NpdGlvbnMgYXJlIGNvbXBhcmVkLlxuICpcbiAqIE9wdGlvbmFsbHkgcGFzcyBpbiBgdHJ1ZWAgYXMgYG9ubHlDb21wYXJlR2VuZXJhdGVkYCB0byBjb25zaWRlciB0d29cbiAqIG1hcHBpbmdzIHdpdGggdGhlIHNhbWUgZ2VuZXJhdGVkIGxpbmUgYW5kIGNvbHVtbiwgYnV0IGRpZmZlcmVudFxuICogc291cmNlL25hbWUvb3JpZ2luYWwgbGluZSBhbmQgY29sdW1uIHRoZSBzYW1lLiBVc2VmdWwgd2hlbiBzZWFyY2hpbmcgZm9yIGFcbiAqIG1hcHBpbmcgd2l0aCBhIHN0dWJiZWQgb3V0IG1hcHBpbmcuXG4gKi9cbmZ1bmN0aW9uIGNvbXBhcmVCeUdlbmVyYXRlZFBvc2l0aW9uc0RlZmxhdGVkKG1hcHBpbmdBLCBtYXBwaW5nQiwgb25seUNvbXBhcmVHZW5lcmF0ZWQpIHtcbiAgbGV0IGNtcCA9IG1hcHBpbmdBLmdlbmVyYXRlZExpbmUgLSBtYXBwaW5nQi5nZW5lcmF0ZWRMaW5lO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIGNtcCA9IG1hcHBpbmdBLmdlbmVyYXRlZENvbHVtbiAtIG1hcHBpbmdCLmdlbmVyYXRlZENvbHVtbjtcbiAgaWYgKGNtcCAhPT0gMCB8fCBvbmx5Q29tcGFyZUdlbmVyYXRlZCkge1xuICAgIHJldHVybiBjbXA7XG4gIH1cblxuICBjbXAgPSBzdHJjbXAobWFwcGluZ0Euc291cmNlLCBtYXBwaW5nQi5zb3VyY2UpO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIGNtcCA9IG1hcHBpbmdBLm9yaWdpbmFsTGluZSAtIG1hcHBpbmdCLm9yaWdpbmFsTGluZTtcbiAgaWYgKGNtcCAhPT0gMCkge1xuICAgIHJldHVybiBjbXA7XG4gIH1cblxuICBjbXAgPSBtYXBwaW5nQS5vcmlnaW5hbENvbHVtbiAtIG1hcHBpbmdCLm9yaWdpbmFsQ29sdW1uO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIHJldHVybiBzdHJjbXAobWFwcGluZ0EubmFtZSwgbWFwcGluZ0IubmFtZSk7XG59XG5leHBvcnRzLmNvbXBhcmVCeUdlbmVyYXRlZFBvc2l0aW9uc0RlZmxhdGVkID0gY29tcGFyZUJ5R2VuZXJhdGVkUG9zaXRpb25zRGVmbGF0ZWQ7XG5cbmZ1bmN0aW9uIHN0cmNtcChhU3RyMSwgYVN0cjIpIHtcbiAgaWYgKGFTdHIxID09PSBhU3RyMikge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgaWYgKGFTdHIxID09PSBudWxsKSB7XG4gICAgcmV0dXJuIDE7IC8vIGFTdHIyICE9PSBudWxsXG4gIH1cblxuICBpZiAoYVN0cjIgPT09IG51bGwpIHtcbiAgICByZXR1cm4gLTE7IC8vIGFTdHIxICE9PSBudWxsXG4gIH1cblxuICBpZiAoYVN0cjEgPiBhU3RyMikge1xuICAgIHJldHVybiAxO1xuICB9XG5cbiAgcmV0dXJuIC0xO1xufVxuXG4vKipcbiAqIENvbXBhcmF0b3IgYmV0d2VlbiB0d28gbWFwcGluZ3Mgd2l0aCBpbmZsYXRlZCBzb3VyY2UgYW5kIG5hbWUgc3RyaW5ncyB3aGVyZVxuICogdGhlIGdlbmVyYXRlZCBwb3NpdGlvbnMgYXJlIGNvbXBhcmVkLlxuICovXG5mdW5jdGlvbiBjb21wYXJlQnlHZW5lcmF0ZWRQb3NpdGlvbnNJbmZsYXRlZChtYXBwaW5nQSwgbWFwcGluZ0IpIHtcbiAgbGV0IGNtcCA9IG1hcHBpbmdBLmdlbmVyYXRlZExpbmUgLSBtYXBwaW5nQi5nZW5lcmF0ZWRMaW5lO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIGNtcCA9IG1hcHBpbmdBLmdlbmVyYXRlZENvbHVtbiAtIG1hcHBpbmdCLmdlbmVyYXRlZENvbHVtbjtcbiAgaWYgKGNtcCAhPT0gMCkge1xuICAgIHJldHVybiBjbXA7XG4gIH1cblxuICBjbXAgPSBzdHJjbXAobWFwcGluZ0Euc291cmNlLCBtYXBwaW5nQi5zb3VyY2UpO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIGNtcCA9IG1hcHBpbmdBLm9yaWdpbmFsTGluZSAtIG1hcHBpbmdCLm9yaWdpbmFsTGluZTtcbiAgaWYgKGNtcCAhPT0gMCkge1xuICAgIHJldHVybiBjbXA7XG4gIH1cblxuICBjbXAgPSBtYXBwaW5nQS5vcmlnaW5hbENvbHVtbiAtIG1hcHBpbmdCLm9yaWdpbmFsQ29sdW1uO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIHJldHVybiBzdHJjbXAobWFwcGluZ0EubmFtZSwgbWFwcGluZ0IubmFtZSk7XG59XG5leHBvcnRzLmNvbXBhcmVCeUdlbmVyYXRlZFBvc2l0aW9uc0luZmxhdGVkID0gY29tcGFyZUJ5R2VuZXJhdGVkUG9zaXRpb25zSW5mbGF0ZWQ7XG5cbi8qKlxuICogU3RyaXAgYW55IEpTT04gWFNTSSBhdm9pZGFuY2UgcHJlZml4IGZyb20gdGhlIHN0cmluZyAoYXMgZG9jdW1lbnRlZFxuICogaW4gdGhlIHNvdXJjZSBtYXBzIHNwZWNpZmljYXRpb24pLCBhbmQgdGhlbiBwYXJzZSB0aGUgc3RyaW5nIGFzXG4gKiBKU09OLlxuICovXG5mdW5jdGlvbiBwYXJzZVNvdXJjZU1hcElucHV0KHN0cikge1xuICByZXR1cm4gSlNPTi5wYXJzZShzdHIucmVwbGFjZSgvXlxcKV19J1teXFxuXSpcXG4vLCBcIlwiKSk7XG59XG5leHBvcnRzLnBhcnNlU291cmNlTWFwSW5wdXQgPSBwYXJzZVNvdXJjZU1hcElucHV0O1xuXG4vKipcbiAqIENvbXB1dGUgdGhlIFVSTCBvZiBhIHNvdXJjZSBnaXZlbiB0aGUgdGhlIHNvdXJjZSByb290LCB0aGUgc291cmNlJ3NcbiAqIFVSTCwgYW5kIHRoZSBzb3VyY2UgbWFwJ3MgVVJMLlxuICovXG5mdW5jdGlvbiBjb21wdXRlU291cmNlVVJMKHNvdXJjZVJvb3QsIHNvdXJjZVVSTCwgc291cmNlTWFwVVJMKSB7XG4gIHNvdXJjZVVSTCA9IHNvdXJjZVVSTCB8fCBcIlwiO1xuXG4gIGlmIChzb3VyY2VSb290KSB7XG4gICAgLy8gVGhpcyBmb2xsb3dzIHdoYXQgQ2hyb21lIGRvZXMuXG4gICAgaWYgKHNvdXJjZVJvb3Rbc291cmNlUm9vdC5sZW5ndGggLSAxXSAhPT0gXCIvXCIgJiYgc291cmNlVVJMWzBdICE9PSBcIi9cIikge1xuICAgICAgc291cmNlUm9vdCArPSBcIi9cIjtcbiAgICB9XG4gICAgLy8gVGhlIHNwZWMgc2F5czpcbiAgICAvLyAgIExpbmUgNDogQW4gb3B0aW9uYWwgc291cmNlIHJvb3QsIHVzZWZ1bCBmb3IgcmVsb2NhdGluZyBzb3VyY2VcbiAgICAvLyAgIGZpbGVzIG9uIGEgc2VydmVyIG9yIHJlbW92aW5nIHJlcGVhdGVkIHZhbHVlcyBpbiB0aGVcbiAgICAvLyAgIOKAnHNvdXJjZXPigJ0gZW50cnkuICBUaGlzIHZhbHVlIGlzIHByZXBlbmRlZCB0byB0aGUgaW5kaXZpZHVhbFxuICAgIC8vICAgZW50cmllcyBpbiB0aGUg4oCcc291cmNl4oCdIGZpZWxkLlxuICAgIHNvdXJjZVVSTCA9IHNvdXJjZVJvb3QgKyBzb3VyY2VVUkw7XG4gIH1cblxuICAvLyBIaXN0b3JpY2FsbHksIFNvdXJjZU1hcENvbnN1bWVyIGRpZCBub3QgdGFrZSB0aGUgc291cmNlTWFwVVJMIGFzXG4gIC8vIGEgcGFyYW1ldGVyLiAgVGhpcyBtb2RlIGlzIHN0aWxsIHNvbWV3aGF0IHN1cHBvcnRlZCwgd2hpY2ggaXMgd2h5XG4gIC8vIHRoaXMgY29kZSBibG9jayBpcyBjb25kaXRpb25hbC4gIEhvd2V2ZXIsIGl0J3MgcHJlZmVyYWJsZSB0byBwYXNzXG4gIC8vIHRoZSBzb3VyY2UgbWFwIFVSTCB0byBTb3VyY2VNYXBDb25zdW1lciwgc28gdGhhdCB0aGlzIGZ1bmN0aW9uXG4gIC8vIGNhbiBpbXBsZW1lbnQgdGhlIHNvdXJjZSBVUkwgcmVzb2x1dGlvbiBhbGdvcml0aG0gYXMgb3V0bGluZWQgaW5cbiAgLy8gdGhlIHNwZWMuICBUaGlzIGJsb2NrIGlzIGJhc2ljYWxseSB0aGUgZXF1aXZhbGVudCBvZjpcbiAgLy8gICAgbmV3IFVSTChzb3VyY2VVUkwsIHNvdXJjZU1hcFVSTCkudG9TdHJpbmcoKVxuICAvLyAuLi4gZXhjZXB0IGl0IGF2b2lkcyB1c2luZyBVUkwsIHdoaWNoIHdhc24ndCBhdmFpbGFibGUgaW4gdGhlXG4gIC8vIG9sZGVyIHJlbGVhc2VzIG9mIG5vZGUgc3RpbGwgc3VwcG9ydGVkIGJ5IHRoaXMgbGlicmFyeS5cbiAgLy9cbiAgLy8gVGhlIHNwZWMgc2F5czpcbiAgLy8gICBJZiB0aGUgc291cmNlcyBhcmUgbm90IGFic29sdXRlIFVSTHMgYWZ0ZXIgcHJlcGVuZGluZyBvZiB0aGVcbiAgLy8gICDigJxzb3VyY2VSb2904oCdLCB0aGUgc291cmNlcyBhcmUgcmVzb2x2ZWQgcmVsYXRpdmUgdG8gdGhlXG4gIC8vICAgU291cmNlTWFwIChsaWtlIHJlc29sdmluZyBzY3JpcHQgc3JjIGluIGEgaHRtbCBkb2N1bWVudCkuXG4gIGlmIChzb3VyY2VNYXBVUkwpIHtcbiAgICBjb25zdCBwYXJzZWQgPSB1cmxQYXJzZShzb3VyY2VNYXBVUkwpO1xuICAgIGlmICghcGFyc2VkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJzb3VyY2VNYXBVUkwgY291bGQgbm90IGJlIHBhcnNlZFwiKTtcbiAgICB9XG4gICAgaWYgKHBhcnNlZC5wYXRoKSB7XG4gICAgICAvLyBTdHJpcCB0aGUgbGFzdCBwYXRoIGNvbXBvbmVudCwgYnV0IGtlZXAgdGhlIFwiL1wiLlxuICAgICAgY29uc3QgaW5kZXggPSBwYXJzZWQucGF0aC5sYXN0SW5kZXhPZihcIi9cIik7XG4gICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICBwYXJzZWQucGF0aCA9IHBhcnNlZC5wYXRoLnN1YnN0cmluZygwLCBpbmRleCArIDEpO1xuICAgICAgfVxuICAgIH1cbiAgICBzb3VyY2VVUkwgPSBqb2luKHVybEdlbmVyYXRlKHBhcnNlZCksIHNvdXJjZVVSTCk7XG4gIH1cblxuICByZXR1cm4gbm9ybWFsaXplKHNvdXJjZVVSTCk7XG59XG5leHBvcnRzLmNvbXB1dGVTb3VyY2VVUkwgPSBjb21wdXRlU291cmNlVVJMO1xuXG5cbi8qKiovIH0pLFxuLyogMSAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG4vKiAtKi0gTW9kZToganM7IGpzLWluZGVudC1sZXZlbDogMjsgLSotICovXG4vKlxuICogQ29weXJpZ2h0IDIwMTEgTW96aWxsYSBGb3VuZGF0aW9uIGFuZCBjb250cmlidXRvcnNcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBOZXcgQlNEIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIG9yOlxuICogaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICovXG5cbmNvbnN0IGJhc2U2NFZMUSA9IF9fd2VicGFja19yZXF1aXJlX18oMik7XG5jb25zdCB1dGlsID0gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcbmNvbnN0IEFycmF5U2V0ID0gX193ZWJwYWNrX3JlcXVpcmVfXygzKS5BcnJheVNldDtcbmNvbnN0IE1hcHBpbmdMaXN0ID0gX193ZWJwYWNrX3JlcXVpcmVfXyg3KS5NYXBwaW5nTGlzdDtcblxuLyoqXG4gKiBBbiBpbnN0YW5jZSBvZiB0aGUgU291cmNlTWFwR2VuZXJhdG9yIHJlcHJlc2VudHMgYSBzb3VyY2UgbWFwIHdoaWNoIGlzXG4gKiBiZWluZyBidWlsdCBpbmNyZW1lbnRhbGx5LiBZb3UgbWF5IHBhc3MgYW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZ1xuICogcHJvcGVydGllczpcbiAqXG4gKiAgIC0gZmlsZTogVGhlIGZpbGVuYW1lIG9mIHRoZSBnZW5lcmF0ZWQgc291cmNlLlxuICogICAtIHNvdXJjZVJvb3Q6IEEgcm9vdCBmb3IgYWxsIHJlbGF0aXZlIFVSTHMgaW4gdGhpcyBzb3VyY2UgbWFwLlxuICovXG5jbGFzcyBTb3VyY2VNYXBHZW5lcmF0b3Ige1xuICBjb25zdHJ1Y3RvcihhQXJncykge1xuICAgIGlmICghYUFyZ3MpIHtcbiAgICAgIGFBcmdzID0ge307XG4gICAgfVxuICAgIHRoaXMuX2ZpbGUgPSB1dGlsLmdldEFyZyhhQXJncywgXCJmaWxlXCIsIG51bGwpO1xuICAgIHRoaXMuX3NvdXJjZVJvb3QgPSB1dGlsLmdldEFyZyhhQXJncywgXCJzb3VyY2VSb290XCIsIG51bGwpO1xuICAgIHRoaXMuX3NraXBWYWxpZGF0aW9uID0gdXRpbC5nZXRBcmcoYUFyZ3MsIFwic2tpcFZhbGlkYXRpb25cIiwgZmFsc2UpO1xuICAgIHRoaXMuX3NvdXJjZXMgPSBuZXcgQXJyYXlTZXQoKTtcbiAgICB0aGlzLl9uYW1lcyA9IG5ldyBBcnJheVNldCgpO1xuICAgIHRoaXMuX21hcHBpbmdzID0gbmV3IE1hcHBpbmdMaXN0KCk7XG4gICAgdGhpcy5fc291cmNlc0NvbnRlbnRzID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IFNvdXJjZU1hcEdlbmVyYXRvciBiYXNlZCBvbiBhIFNvdXJjZU1hcENvbnN1bWVyXG4gICAqXG4gICAqIEBwYXJhbSBhU291cmNlTWFwQ29uc3VtZXIgVGhlIFNvdXJjZU1hcC5cbiAgICovXG4gIHN0YXRpYyBmcm9tU291cmNlTWFwKGFTb3VyY2VNYXBDb25zdW1lcikge1xuICAgIGNvbnN0IHNvdXJjZVJvb3QgPSBhU291cmNlTWFwQ29uc3VtZXIuc291cmNlUm9vdDtcbiAgICBjb25zdCBnZW5lcmF0b3IgPSBuZXcgU291cmNlTWFwR2VuZXJhdG9yKHtcbiAgICAgIGZpbGU6IGFTb3VyY2VNYXBDb25zdW1lci5maWxlLFxuICAgICAgc291cmNlUm9vdFxuICAgIH0pO1xuICAgIGFTb3VyY2VNYXBDb25zdW1lci5lYWNoTWFwcGluZyhmdW5jdGlvbihtYXBwaW5nKSB7XG4gICAgICBjb25zdCBuZXdNYXBwaW5nID0ge1xuICAgICAgICBnZW5lcmF0ZWQ6IHtcbiAgICAgICAgICBsaW5lOiBtYXBwaW5nLmdlbmVyYXRlZExpbmUsXG4gICAgICAgICAgY29sdW1uOiBtYXBwaW5nLmdlbmVyYXRlZENvbHVtblxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBpZiAobWFwcGluZy5zb3VyY2UgIT0gbnVsbCkge1xuICAgICAgICBuZXdNYXBwaW5nLnNvdXJjZSA9IG1hcHBpbmcuc291cmNlO1xuICAgICAgICBpZiAoc291cmNlUm9vdCAhPSBudWxsKSB7XG4gICAgICAgICAgbmV3TWFwcGluZy5zb3VyY2UgPSB1dGlsLnJlbGF0aXZlKHNvdXJjZVJvb3QsIG5ld01hcHBpbmcuc291cmNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5ld01hcHBpbmcub3JpZ2luYWwgPSB7XG4gICAgICAgICAgbGluZTogbWFwcGluZy5vcmlnaW5hbExpbmUsXG4gICAgICAgICAgY29sdW1uOiBtYXBwaW5nLm9yaWdpbmFsQ29sdW1uXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKG1hcHBpbmcubmFtZSAhPSBudWxsKSB7XG4gICAgICAgICAgbmV3TWFwcGluZy5uYW1lID0gbWFwcGluZy5uYW1lO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGdlbmVyYXRvci5hZGRNYXBwaW5nKG5ld01hcHBpbmcpO1xuICAgIH0pO1xuICAgIGFTb3VyY2VNYXBDb25zdW1lci5zb3VyY2VzLmZvckVhY2goZnVuY3Rpb24oc291cmNlRmlsZSkge1xuICAgICAgbGV0IHNvdXJjZVJlbGF0aXZlID0gc291cmNlRmlsZTtcbiAgICAgIGlmIChzb3VyY2VSb290ICE9PSBudWxsKSB7XG4gICAgICAgIHNvdXJjZVJlbGF0aXZlID0gdXRpbC5yZWxhdGl2ZShzb3VyY2VSb290LCBzb3VyY2VGaWxlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFnZW5lcmF0b3IuX3NvdXJjZXMuaGFzKHNvdXJjZVJlbGF0aXZlKSkge1xuICAgICAgICBnZW5lcmF0b3IuX3NvdXJjZXMuYWRkKHNvdXJjZVJlbGF0aXZlKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY29udGVudCA9IGFTb3VyY2VNYXBDb25zdW1lci5zb3VyY2VDb250ZW50Rm9yKHNvdXJjZUZpbGUpO1xuICAgICAgaWYgKGNvbnRlbnQgIT0gbnVsbCkge1xuICAgICAgICBnZW5lcmF0b3Iuc2V0U291cmNlQ29udGVudChzb3VyY2VGaWxlLCBjb250ZW50KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHNpbmdsZSBtYXBwaW5nIGZyb20gb3JpZ2luYWwgc291cmNlIGxpbmUgYW5kIGNvbHVtbiB0byB0aGUgZ2VuZXJhdGVkXG4gICAqIHNvdXJjZSdzIGxpbmUgYW5kIGNvbHVtbiBmb3IgdGhpcyBzb3VyY2UgbWFwIGJlaW5nIGNyZWF0ZWQuIFRoZSBtYXBwaW5nXG4gICAqIG9iamVjdCBzaG91bGQgaGF2ZSB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gICAqXG4gICAqICAgLSBnZW5lcmF0ZWQ6IEFuIG9iamVjdCB3aXRoIHRoZSBnZW5lcmF0ZWQgbGluZSBhbmQgY29sdW1uIHBvc2l0aW9ucy5cbiAgICogICAtIG9yaWdpbmFsOiBBbiBvYmplY3Qgd2l0aCB0aGUgb3JpZ2luYWwgbGluZSBhbmQgY29sdW1uIHBvc2l0aW9ucy5cbiAgICogICAtIHNvdXJjZTogVGhlIG9yaWdpbmFsIHNvdXJjZSBmaWxlIChyZWxhdGl2ZSB0byB0aGUgc291cmNlUm9vdCkuXG4gICAqICAgLSBuYW1lOiBBbiBvcHRpb25hbCBvcmlnaW5hbCB0b2tlbiBuYW1lIGZvciB0aGlzIG1hcHBpbmcuXG4gICAqL1xuICBhZGRNYXBwaW5nKGFBcmdzKSB7XG4gICAgY29uc3QgZ2VuZXJhdGVkID0gdXRpbC5nZXRBcmcoYUFyZ3MsIFwiZ2VuZXJhdGVkXCIpO1xuICAgIGNvbnN0IG9yaWdpbmFsID0gdXRpbC5nZXRBcmcoYUFyZ3MsIFwib3JpZ2luYWxcIiwgbnVsbCk7XG4gICAgbGV0IHNvdXJjZSA9IHV0aWwuZ2V0QXJnKGFBcmdzLCBcInNvdXJjZVwiLCBudWxsKTtcbiAgICBsZXQgbmFtZSA9IHV0aWwuZ2V0QXJnKGFBcmdzLCBcIm5hbWVcIiwgbnVsbCk7XG5cbiAgICBpZiAoIXRoaXMuX3NraXBWYWxpZGF0aW9uKSB7XG4gICAgICB0aGlzLl92YWxpZGF0ZU1hcHBpbmcoZ2VuZXJhdGVkLCBvcmlnaW5hbCwgc291cmNlLCBuYW1lKTtcbiAgICB9XG5cbiAgICBpZiAoc291cmNlICE9IG51bGwpIHtcbiAgICAgIHNvdXJjZSA9IFN0cmluZyhzb3VyY2UpO1xuICAgICAgaWYgKCF0aGlzLl9zb3VyY2VzLmhhcyhzb3VyY2UpKSB7XG4gICAgICAgIHRoaXMuX3NvdXJjZXMuYWRkKHNvdXJjZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG5hbWUgIT0gbnVsbCkge1xuICAgICAgbmFtZSA9IFN0cmluZyhuYW1lKTtcbiAgICAgIGlmICghdGhpcy5fbmFtZXMuaGFzKG5hbWUpKSB7XG4gICAgICAgIHRoaXMuX25hbWVzLmFkZChuYW1lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9tYXBwaW5ncy5hZGQoe1xuICAgICAgZ2VuZXJhdGVkTGluZTogZ2VuZXJhdGVkLmxpbmUsXG4gICAgICBnZW5lcmF0ZWRDb2x1bW46IGdlbmVyYXRlZC5jb2x1bW4sXG4gICAgICBvcmlnaW5hbExpbmU6IG9yaWdpbmFsICE9IG51bGwgJiYgb3JpZ2luYWwubGluZSxcbiAgICAgIG9yaWdpbmFsQ29sdW1uOiBvcmlnaW5hbCAhPSBudWxsICYmIG9yaWdpbmFsLmNvbHVtbixcbiAgICAgIHNvdXJjZSxcbiAgICAgIG5hbWVcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHNvdXJjZSBjb250ZW50IGZvciBhIHNvdXJjZSBmaWxlLlxuICAgKi9cbiAgc2V0U291cmNlQ29udGVudChhU291cmNlRmlsZSwgYVNvdXJjZUNvbnRlbnQpIHtcbiAgICBsZXQgc291cmNlID0gYVNvdXJjZUZpbGU7XG4gICAgaWYgKHRoaXMuX3NvdXJjZVJvb3QgIT0gbnVsbCkge1xuICAgICAgc291cmNlID0gdXRpbC5yZWxhdGl2ZSh0aGlzLl9zb3VyY2VSb290LCBzb3VyY2UpO1xuICAgIH1cblxuICAgIGlmIChhU291cmNlQ29udGVudCAhPSBudWxsKSB7XG4gICAgICAvLyBBZGQgdGhlIHNvdXJjZSBjb250ZW50IHRvIHRoZSBfc291cmNlc0NvbnRlbnRzIG1hcC5cbiAgICAgIC8vIENyZWF0ZSBhIG5ldyBfc291cmNlc0NvbnRlbnRzIG1hcCBpZiB0aGUgcHJvcGVydHkgaXMgbnVsbC5cbiAgICAgIGlmICghdGhpcy5fc291cmNlc0NvbnRlbnRzKSB7XG4gICAgICAgIHRoaXMuX3NvdXJjZXNDb250ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9zb3VyY2VzQ29udGVudHNbdXRpbC50b1NldFN0cmluZyhzb3VyY2UpXSA9IGFTb3VyY2VDb250ZW50O1xuICAgIH0gZWxzZSBpZiAodGhpcy5fc291cmNlc0NvbnRlbnRzKSB7XG4gICAgICAvLyBSZW1vdmUgdGhlIHNvdXJjZSBmaWxlIGZyb20gdGhlIF9zb3VyY2VzQ29udGVudHMgbWFwLlxuICAgICAgLy8gSWYgdGhlIF9zb3VyY2VzQ29udGVudHMgbWFwIGlzIGVtcHR5LCBzZXQgdGhlIHByb3BlcnR5IHRvIG51bGwuXG4gICAgICBkZWxldGUgdGhpcy5fc291cmNlc0NvbnRlbnRzW3V0aWwudG9TZXRTdHJpbmcoc291cmNlKV07XG4gICAgICBpZiAoT2JqZWN0LmtleXModGhpcy5fc291cmNlc0NvbnRlbnRzKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5fc291cmNlc0NvbnRlbnRzID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQXBwbGllcyB0aGUgbWFwcGluZ3Mgb2YgYSBzdWItc291cmNlLW1hcCBmb3IgYSBzcGVjaWZpYyBzb3VyY2UgZmlsZSB0byB0aGVcbiAgICogc291cmNlIG1hcCBiZWluZyBnZW5lcmF0ZWQuIEVhY2ggbWFwcGluZyB0byB0aGUgc3VwcGxpZWQgc291cmNlIGZpbGUgaXNcbiAgICogcmV3cml0dGVuIHVzaW5nIHRoZSBzdXBwbGllZCBzb3VyY2UgbWFwLiBOb3RlOiBUaGUgcmVzb2x1dGlvbiBmb3IgdGhlXG4gICAqIHJlc3VsdGluZyBtYXBwaW5ncyBpcyB0aGUgbWluaW1pdW0gb2YgdGhpcyBtYXAgYW5kIHRoZSBzdXBwbGllZCBtYXAuXG4gICAqXG4gICAqIEBwYXJhbSBhU291cmNlTWFwQ29uc3VtZXIgVGhlIHNvdXJjZSBtYXAgdG8gYmUgYXBwbGllZC5cbiAgICogQHBhcmFtIGFTb3VyY2VGaWxlIE9wdGlvbmFsLiBUaGUgZmlsZW5hbWUgb2YgdGhlIHNvdXJjZSBmaWxlLlxuICAgKiAgICAgICAgSWYgb21pdHRlZCwgU291cmNlTWFwQ29uc3VtZXIncyBmaWxlIHByb3BlcnR5IHdpbGwgYmUgdXNlZC5cbiAgICogQHBhcmFtIGFTb3VyY2VNYXBQYXRoIE9wdGlvbmFsLiBUaGUgZGlybmFtZSBvZiB0aGUgcGF0aCB0byB0aGUgc291cmNlIG1hcFxuICAgKiAgICAgICAgdG8gYmUgYXBwbGllZC4gSWYgcmVsYXRpdmUsIGl0IGlzIHJlbGF0aXZlIHRvIHRoZSBTb3VyY2VNYXBDb25zdW1lci5cbiAgICogICAgICAgIFRoaXMgcGFyYW1ldGVyIGlzIG5lZWRlZCB3aGVuIHRoZSB0d28gc291cmNlIG1hcHMgYXJlbid0IGluIHRoZSBzYW1lXG4gICAqICAgICAgICBkaXJlY3RvcnksIGFuZCB0aGUgc291cmNlIG1hcCB0byBiZSBhcHBsaWVkIGNvbnRhaW5zIHJlbGF0aXZlIHNvdXJjZVxuICAgKiAgICAgICAgcGF0aHMuIElmIHNvLCB0aG9zZSByZWxhdGl2ZSBzb3VyY2UgcGF0aHMgbmVlZCB0byBiZSByZXdyaXR0ZW5cbiAgICogICAgICAgIHJlbGF0aXZlIHRvIHRoZSBTb3VyY2VNYXBHZW5lcmF0b3IuXG4gICAqL1xuICBhcHBseVNvdXJjZU1hcChhU291cmNlTWFwQ29uc3VtZXIsIGFTb3VyY2VGaWxlLCBhU291cmNlTWFwUGF0aCkge1xuICAgIGxldCBzb3VyY2VGaWxlID0gYVNvdXJjZUZpbGU7XG4gICAgLy8gSWYgYVNvdXJjZUZpbGUgaXMgb21pdHRlZCwgd2Ugd2lsbCB1c2UgdGhlIGZpbGUgcHJvcGVydHkgb2YgdGhlIFNvdXJjZU1hcFxuICAgIGlmIChhU291cmNlRmlsZSA9PSBudWxsKSB7XG4gICAgICBpZiAoYVNvdXJjZU1hcENvbnN1bWVyLmZpbGUgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgXCJTb3VyY2VNYXBHZW5lcmF0b3IucHJvdG90eXBlLmFwcGx5U291cmNlTWFwIHJlcXVpcmVzIGVpdGhlciBhbiBleHBsaWNpdCBzb3VyY2UgZmlsZSwgXCIgK1xuICAgICAgICAgICdvciB0aGUgc291cmNlIG1hcFxcJ3MgXCJmaWxlXCIgcHJvcGVydHkuIEJvdGggd2VyZSBvbWl0dGVkLidcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHNvdXJjZUZpbGUgPSBhU291cmNlTWFwQ29uc3VtZXIuZmlsZTtcbiAgICB9XG4gICAgY29uc3Qgc291cmNlUm9vdCA9IHRoaXMuX3NvdXJjZVJvb3Q7XG4gICAgLy8gTWFrZSBcInNvdXJjZUZpbGVcIiByZWxhdGl2ZSBpZiBhbiBhYnNvbHV0ZSBVcmwgaXMgcGFzc2VkLlxuICAgIGlmIChzb3VyY2VSb290ICE9IG51bGwpIHtcbiAgICAgIHNvdXJjZUZpbGUgPSB1dGlsLnJlbGF0aXZlKHNvdXJjZVJvb3QsIHNvdXJjZUZpbGUpO1xuICAgIH1cbiAgICAvLyBBcHBseWluZyB0aGUgU291cmNlTWFwIGNhbiBhZGQgYW5kIHJlbW92ZSBpdGVtcyBmcm9tIHRoZSBzb3VyY2VzIGFuZFxuICAgIC8vIHRoZSBuYW1lcyBhcnJheS5cbiAgICBjb25zdCBuZXdTb3VyY2VzID0gdGhpcy5fbWFwcGluZ3MudG9BcnJheSgpLmxlbmd0aCA+IDBcbiAgICAgID8gbmV3IEFycmF5U2V0KClcbiAgICAgIDogdGhpcy5fc291cmNlcztcbiAgICBjb25zdCBuZXdOYW1lcyA9IG5ldyBBcnJheVNldCgpO1xuXG4gICAgLy8gRmluZCBtYXBwaW5ncyBmb3IgdGhlIFwic291cmNlRmlsZVwiXG4gICAgdGhpcy5fbWFwcGluZ3MudW5zb3J0ZWRGb3JFYWNoKGZ1bmN0aW9uKG1hcHBpbmcpIHtcbiAgICAgIGlmIChtYXBwaW5nLnNvdXJjZSA9PT0gc291cmNlRmlsZSAmJiBtYXBwaW5nLm9yaWdpbmFsTGluZSAhPSBudWxsKSB7XG4gICAgICAgIC8vIENoZWNrIGlmIGl0IGNhbiBiZSBtYXBwZWQgYnkgdGhlIHNvdXJjZSBtYXAsIHRoZW4gdXBkYXRlIHRoZSBtYXBwaW5nLlxuICAgICAgICBjb25zdCBvcmlnaW5hbCA9IGFTb3VyY2VNYXBDb25zdW1lci5vcmlnaW5hbFBvc2l0aW9uRm9yKHtcbiAgICAgICAgICBsaW5lOiBtYXBwaW5nLm9yaWdpbmFsTGluZSxcbiAgICAgICAgICBjb2x1bW46IG1hcHBpbmcub3JpZ2luYWxDb2x1bW5cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChvcmlnaW5hbC5zb3VyY2UgIT0gbnVsbCkge1xuICAgICAgICAgIC8vIENvcHkgbWFwcGluZ1xuICAgICAgICAgIG1hcHBpbmcuc291cmNlID0gb3JpZ2luYWwuc291cmNlO1xuICAgICAgICAgIGlmIChhU291cmNlTWFwUGF0aCAhPSBudWxsKSB7XG4gICAgICAgICAgICBtYXBwaW5nLnNvdXJjZSA9IHV0aWwuam9pbihhU291cmNlTWFwUGF0aCwgbWFwcGluZy5zb3VyY2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc291cmNlUm9vdCAhPSBudWxsKSB7XG4gICAgICAgICAgICBtYXBwaW5nLnNvdXJjZSA9IHV0aWwucmVsYXRpdmUoc291cmNlUm9vdCwgbWFwcGluZy5zb3VyY2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBtYXBwaW5nLm9yaWdpbmFsTGluZSA9IG9yaWdpbmFsLmxpbmU7XG4gICAgICAgICAgbWFwcGluZy5vcmlnaW5hbENvbHVtbiA9IG9yaWdpbmFsLmNvbHVtbjtcbiAgICAgICAgICBpZiAob3JpZ2luYWwubmFtZSAhPSBudWxsKSB7XG4gICAgICAgICAgICBtYXBwaW5nLm5hbWUgPSBvcmlnaW5hbC5uYW1lO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBzb3VyY2UgPSBtYXBwaW5nLnNvdXJjZTtcbiAgICAgIGlmIChzb3VyY2UgIT0gbnVsbCAmJiAhbmV3U291cmNlcy5oYXMoc291cmNlKSkge1xuICAgICAgICBuZXdTb3VyY2VzLmFkZChzb3VyY2UpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBuYW1lID0gbWFwcGluZy5uYW1lO1xuICAgICAgaWYgKG5hbWUgIT0gbnVsbCAmJiAhbmV3TmFtZXMuaGFzKG5hbWUpKSB7XG4gICAgICAgIG5ld05hbWVzLmFkZChuYW1lKTtcbiAgICAgIH1cblxuICAgIH0sIHRoaXMpO1xuICAgIHRoaXMuX3NvdXJjZXMgPSBuZXdTb3VyY2VzO1xuICAgIHRoaXMuX25hbWVzID0gbmV3TmFtZXM7XG5cbiAgICAvLyBDb3B5IHNvdXJjZXNDb250ZW50cyBvZiBhcHBsaWVkIG1hcC5cbiAgICBhU291cmNlTWFwQ29uc3VtZXIuc291cmNlcy5mb3JFYWNoKGZ1bmN0aW9uKHNyY0ZpbGUpIHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBhU291cmNlTWFwQ29uc3VtZXIuc291cmNlQ29udGVudEZvcihzcmNGaWxlKTtcbiAgICAgIGlmIChjb250ZW50ICE9IG51bGwpIHtcbiAgICAgICAgaWYgKGFTb3VyY2VNYXBQYXRoICE9IG51bGwpIHtcbiAgICAgICAgICBzcmNGaWxlID0gdXRpbC5qb2luKGFTb3VyY2VNYXBQYXRoLCBzcmNGaWxlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc291cmNlUm9vdCAhPSBudWxsKSB7XG4gICAgICAgICAgc3JjRmlsZSA9IHV0aWwucmVsYXRpdmUoc291cmNlUm9vdCwgc3JjRmlsZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTb3VyY2VDb250ZW50KHNyY0ZpbGUsIGNvbnRlbnQpO1xuICAgICAgfVxuICAgIH0sIHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgbWFwcGluZyBjYW4gaGF2ZSBvbmUgb2YgdGhlIHRocmVlIGxldmVscyBvZiBkYXRhOlxuICAgKlxuICAgKiAgIDEuIEp1c3QgdGhlIGdlbmVyYXRlZCBwb3NpdGlvbi5cbiAgICogICAyLiBUaGUgR2VuZXJhdGVkIHBvc2l0aW9uLCBvcmlnaW5hbCBwb3NpdGlvbiwgYW5kIG9yaWdpbmFsIHNvdXJjZS5cbiAgICogICAzLiBHZW5lcmF0ZWQgYW5kIG9yaWdpbmFsIHBvc2l0aW9uLCBvcmlnaW5hbCBzb3VyY2UsIGFzIHdlbGwgYXMgYSBuYW1lXG4gICAqICAgICAgdG9rZW4uXG4gICAqXG4gICAqIFRvIG1haW50YWluIGNvbnNpc3RlbmN5LCB3ZSB2YWxpZGF0ZSB0aGF0IGFueSBuZXcgbWFwcGluZyBiZWluZyBhZGRlZCBmYWxsc1xuICAgKiBpbiB0byBvbmUgb2YgdGhlc2UgY2F0ZWdvcmllcy5cbiAgICovXG4gIF92YWxpZGF0ZU1hcHBpbmcoYUdlbmVyYXRlZCwgYU9yaWdpbmFsLCBhU291cmNlLCBhTmFtZSkge1xuICAgIC8vIFdoZW4gYU9yaWdpbmFsIGlzIHRydXRoeSBidXQgaGFzIGVtcHR5IHZhbHVlcyBmb3IgLmxpbmUgYW5kIC5jb2x1bW4sXG4gICAgLy8gaXQgaXMgbW9zdCBsaWtlbHkgYSBwcm9ncmFtbWVyIGVycm9yLiBJbiB0aGlzIGNhc2Ugd2UgdGhyb3cgYSB2ZXJ5XG4gICAgLy8gc3BlY2lmaWMgZXJyb3IgbWVzc2FnZSB0byB0cnkgdG8gZ3VpZGUgdGhlbSB0aGUgcmlnaHQgd2F5LlxuICAgIC8vIEZvciBleGFtcGxlOiBodHRwczovL2dpdGh1Yi5jb20vUG9seW1lci9wb2x5bWVyLWJ1bmRsZXIvcHVsbC81MTlcbiAgICBpZiAoYU9yaWdpbmFsICYmIHR5cGVvZiBhT3JpZ2luYWwubGluZSAhPT0gXCJudW1iZXJcIiAmJiB0eXBlb2YgYU9yaWdpbmFsLmNvbHVtbiAhPT0gXCJudW1iZXJcIikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBcIm9yaWdpbmFsLmxpbmUgYW5kIG9yaWdpbmFsLmNvbHVtbiBhcmUgbm90IG51bWJlcnMgLS0geW91IHByb2JhYmx5IG1lYW50IHRvIG9taXQgXCIgK1xuICAgICAgICAgICAgXCJ0aGUgb3JpZ2luYWwgbWFwcGluZyBlbnRpcmVseSBhbmQgb25seSBtYXAgdGhlIGdlbmVyYXRlZCBwb3NpdGlvbi4gSWYgc28sIHBhc3MgXCIgK1xuICAgICAgICAgICAgXCJudWxsIGZvciB0aGUgb3JpZ2luYWwgbWFwcGluZyBpbnN0ZWFkIG9mIGFuIG9iamVjdCB3aXRoIGVtcHR5IG9yIG51bGwgdmFsdWVzLlwiXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKGFHZW5lcmF0ZWQgJiYgXCJsaW5lXCIgaW4gYUdlbmVyYXRlZCAmJiBcImNvbHVtblwiIGluIGFHZW5lcmF0ZWRcbiAgICAgICAgJiYgYUdlbmVyYXRlZC5saW5lID4gMCAmJiBhR2VuZXJhdGVkLmNvbHVtbiA+PSAwXG4gICAgICAgICYmICFhT3JpZ2luYWwgJiYgIWFTb3VyY2UgJiYgIWFOYW1lKSB7XG4gICAgICAvLyBDYXNlIDEuXG5cbiAgICB9IGVsc2UgaWYgKGFHZW5lcmF0ZWQgJiYgXCJsaW5lXCIgaW4gYUdlbmVyYXRlZCAmJiBcImNvbHVtblwiIGluIGFHZW5lcmF0ZWRcbiAgICAgICAgICAgICAmJiBhT3JpZ2luYWwgJiYgXCJsaW5lXCIgaW4gYU9yaWdpbmFsICYmIFwiY29sdW1uXCIgaW4gYU9yaWdpbmFsXG4gICAgICAgICAgICAgJiYgYUdlbmVyYXRlZC5saW5lID4gMCAmJiBhR2VuZXJhdGVkLmNvbHVtbiA+PSAwXG4gICAgICAgICAgICAgJiYgYU9yaWdpbmFsLmxpbmUgPiAwICYmIGFPcmlnaW5hbC5jb2x1bW4gPj0gMFxuICAgICAgICAgICAgICYmIGFTb3VyY2UpIHtcbiAgICAgIC8vIENhc2VzIDIgYW5kIDMuXG5cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBtYXBwaW5nOiBcIiArIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgZ2VuZXJhdGVkOiBhR2VuZXJhdGVkLFxuICAgICAgICBzb3VyY2U6IGFTb3VyY2UsXG4gICAgICAgIG9yaWdpbmFsOiBhT3JpZ2luYWwsXG4gICAgICAgIG5hbWU6IGFOYW1lXG4gICAgICB9KSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNlcmlhbGl6ZSB0aGUgYWNjdW11bGF0ZWQgbWFwcGluZ3MgaW4gdG8gdGhlIHN0cmVhbSBvZiBiYXNlIDY0IFZMUXNcbiAgICogc3BlY2lmaWVkIGJ5IHRoZSBzb3VyY2UgbWFwIGZvcm1hdC5cbiAgICovXG4gIF9zZXJpYWxpemVNYXBwaW5ncygpIHtcbiAgICBsZXQgcHJldmlvdXNHZW5lcmF0ZWRDb2x1bW4gPSAwO1xuICAgIGxldCBwcmV2aW91c0dlbmVyYXRlZExpbmUgPSAxO1xuICAgIGxldCBwcmV2aW91c09yaWdpbmFsQ29sdW1uID0gMDtcbiAgICBsZXQgcHJldmlvdXNPcmlnaW5hbExpbmUgPSAwO1xuICAgIGxldCBwcmV2aW91c05hbWUgPSAwO1xuICAgIGxldCBwcmV2aW91c1NvdXJjZSA9IDA7XG4gICAgbGV0IHJlc3VsdCA9IFwiXCI7XG4gICAgbGV0IG5leHQ7XG4gICAgbGV0IG1hcHBpbmc7XG4gICAgbGV0IG5hbWVJZHg7XG4gICAgbGV0IHNvdXJjZUlkeDtcblxuICAgIGNvbnN0IG1hcHBpbmdzID0gdGhpcy5fbWFwcGluZ3MudG9BcnJheSgpO1xuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBtYXBwaW5ncy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgbWFwcGluZyA9IG1hcHBpbmdzW2ldO1xuICAgICAgbmV4dCA9IFwiXCI7XG5cbiAgICAgIGlmIChtYXBwaW5nLmdlbmVyYXRlZExpbmUgIT09IHByZXZpb3VzR2VuZXJhdGVkTGluZSkge1xuICAgICAgICBwcmV2aW91c0dlbmVyYXRlZENvbHVtbiA9IDA7XG4gICAgICAgIHdoaWxlIChtYXBwaW5nLmdlbmVyYXRlZExpbmUgIT09IHByZXZpb3VzR2VuZXJhdGVkTGluZSkge1xuICAgICAgICAgIG5leHQgKz0gXCI7XCI7XG4gICAgICAgICAgcHJldmlvdXNHZW5lcmF0ZWRMaW5lKys7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoaSA+IDApIHtcbiAgICAgICAgaWYgKCF1dGlsLmNvbXBhcmVCeUdlbmVyYXRlZFBvc2l0aW9uc0luZmxhdGVkKG1hcHBpbmcsIG1hcHBpbmdzW2kgLSAxXSkpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBuZXh0ICs9IFwiLFwiO1xuICAgICAgfVxuXG4gICAgICBuZXh0ICs9IGJhc2U2NFZMUS5lbmNvZGUobWFwcGluZy5nZW5lcmF0ZWRDb2x1bW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gcHJldmlvdXNHZW5lcmF0ZWRDb2x1bW4pO1xuICAgICAgcHJldmlvdXNHZW5lcmF0ZWRDb2x1bW4gPSBtYXBwaW5nLmdlbmVyYXRlZENvbHVtbjtcblxuICAgICAgaWYgKG1hcHBpbmcuc291cmNlICE9IG51bGwpIHtcbiAgICAgICAgc291cmNlSWR4ID0gdGhpcy5fc291cmNlcy5pbmRleE9mKG1hcHBpbmcuc291cmNlKTtcbiAgICAgICAgbmV4dCArPSBiYXNlNjRWTFEuZW5jb2RlKHNvdXJjZUlkeCAtIHByZXZpb3VzU291cmNlKTtcbiAgICAgICAgcHJldmlvdXNTb3VyY2UgPSBzb3VyY2VJZHg7XG5cbiAgICAgICAgLy8gbGluZXMgYXJlIHN0b3JlZCAwLWJhc2VkIGluIFNvdXJjZU1hcCBzcGVjIHZlcnNpb24gM1xuICAgICAgICBuZXh0ICs9IGJhc2U2NFZMUS5lbmNvZGUobWFwcGluZy5vcmlnaW5hbExpbmUgLSAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gcHJldmlvdXNPcmlnaW5hbExpbmUpO1xuICAgICAgICBwcmV2aW91c09yaWdpbmFsTGluZSA9IG1hcHBpbmcub3JpZ2luYWxMaW5lIC0gMTtcblxuICAgICAgICBuZXh0ICs9IGJhc2U2NFZMUS5lbmNvZGUobWFwcGluZy5vcmlnaW5hbENvbHVtblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIHByZXZpb3VzT3JpZ2luYWxDb2x1bW4pO1xuICAgICAgICBwcmV2aW91c09yaWdpbmFsQ29sdW1uID0gbWFwcGluZy5vcmlnaW5hbENvbHVtbjtcblxuICAgICAgICBpZiAobWFwcGluZy5uYW1lICE9IG51bGwpIHtcbiAgICAgICAgICBuYW1lSWR4ID0gdGhpcy5fbmFtZXMuaW5kZXhPZihtYXBwaW5nLm5hbWUpO1xuICAgICAgICAgIG5leHQgKz0gYmFzZTY0VkxRLmVuY29kZShuYW1lSWR4IC0gcHJldmlvdXNOYW1lKTtcbiAgICAgICAgICBwcmV2aW91c05hbWUgPSBuYW1lSWR4O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJlc3VsdCArPSBuZXh0O1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBfZ2VuZXJhdGVTb3VyY2VzQ29udGVudChhU291cmNlcywgYVNvdXJjZVJvb3QpIHtcbiAgICByZXR1cm4gYVNvdXJjZXMubWFwKGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgaWYgKCF0aGlzLl9zb3VyY2VzQ29udGVudHMpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBpZiAoYVNvdXJjZVJvb3QgIT0gbnVsbCkge1xuICAgICAgICBzb3VyY2UgPSB1dGlsLnJlbGF0aXZlKGFTb3VyY2VSb290LCBzb3VyY2UpO1xuICAgICAgfVxuICAgICAgY29uc3Qga2V5ID0gdXRpbC50b1NldFN0cmluZyhzb3VyY2UpO1xuICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLl9zb3VyY2VzQ29udGVudHMsIGtleSlcbiAgICAgICAgPyB0aGlzLl9zb3VyY2VzQ29udGVudHNba2V5XVxuICAgICAgICA6IG51bGw7XG4gICAgfSwgdGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogRXh0ZXJuYWxpemUgdGhlIHNvdXJjZSBtYXAuXG4gICAqL1xuICB0b0pTT04oKSB7XG4gICAgY29uc3QgbWFwID0ge1xuICAgICAgdmVyc2lvbjogdGhpcy5fdmVyc2lvbixcbiAgICAgIHNvdXJjZXM6IHRoaXMuX3NvdXJjZXMudG9BcnJheSgpLFxuICAgICAgbmFtZXM6IHRoaXMuX25hbWVzLnRvQXJyYXkoKSxcbiAgICAgIG1hcHBpbmdzOiB0aGlzLl9zZXJpYWxpemVNYXBwaW5ncygpXG4gICAgfTtcbiAgICBpZiAodGhpcy5fZmlsZSAhPSBudWxsKSB7XG4gICAgICBtYXAuZmlsZSA9IHRoaXMuX2ZpbGU7XG4gICAgfVxuICAgIGlmICh0aGlzLl9zb3VyY2VSb290ICE9IG51bGwpIHtcbiAgICAgIG1hcC5zb3VyY2VSb290ID0gdGhpcy5fc291cmNlUm9vdDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3NvdXJjZXNDb250ZW50cykge1xuICAgICAgbWFwLnNvdXJjZXNDb250ZW50ID0gdGhpcy5fZ2VuZXJhdGVTb3VyY2VzQ29udGVudChtYXAuc291cmNlcywgbWFwLnNvdXJjZVJvb3QpO1xuICAgIH1cblxuICAgIHJldHVybiBtYXA7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIHRoZSBzb3VyY2UgbWFwIGJlaW5nIGdlbmVyYXRlZCB0byBhIHN0cmluZy5cbiAgICovXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLnRvSlNPTigpKTtcbiAgfVxufVxuXG5Tb3VyY2VNYXBHZW5lcmF0b3IucHJvdG90eXBlLl92ZXJzaW9uID0gMztcbmV4cG9ydHMuU291cmNlTWFwR2VuZXJhdG9yID0gU291cmNlTWFwR2VuZXJhdG9yO1xuXG5cbi8qKiovIH0pLFxuLyogMiAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG4vKiAtKi0gTW9kZToganM7IGpzLWluZGVudC1sZXZlbDogMjsgLSotICovXG4vKlxuICogQ29weXJpZ2h0IDIwMTEgTW96aWxsYSBGb3VuZGF0aW9uIGFuZCBjb250cmlidXRvcnNcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBOZXcgQlNEIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIG9yOlxuICogaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICpcbiAqIEJhc2VkIG9uIHRoZSBCYXNlIDY0IFZMUSBpbXBsZW1lbnRhdGlvbiBpbiBDbG9zdXJlIENvbXBpbGVyOlxuICogaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jbG9zdXJlLWNvbXBpbGVyL3NvdXJjZS9icm93c2UvdHJ1bmsvc3JjL2NvbS9nb29nbGUvZGVidWdnaW5nL3NvdXJjZW1hcC9CYXNlNjRWTFEuamF2YVxuICpcbiAqIENvcHlyaWdodCAyMDExIFRoZSBDbG9zdXJlIENvbXBpbGVyIEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAqIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmVcbiAqIG1ldDpcbiAqXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodFxuICogICAgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZVxuICogICAgY29weXJpZ2h0IG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmdcbiAqICAgIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZFxuICogICAgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuICogICogTmVpdGhlciB0aGUgbmFtZSBvZiBHb29nbGUgSW5jLiBub3IgdGhlIG5hbWVzIG9mIGl0c1xuICogICAgY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkXG4gKiAgICBmcm9tIHRoaXMgc29mdHdhcmUgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SU1xuICogXCJBUyBJU1wiIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVFxuICogTElNSVRFRCBUTywgVEhFIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SXG4gKiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVFxuICogT1dORVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsXG4gKiBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UXG4gKiBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSxcbiAqIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWVxuICogVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuICogKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFXG4gKiBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5cbmNvbnN0IGJhc2U2NCA9IF9fd2VicGFja19yZXF1aXJlX18oNik7XG5cbi8vIEEgc2luZ2xlIGJhc2UgNjQgZGlnaXQgY2FuIGNvbnRhaW4gNiBiaXRzIG9mIGRhdGEuIEZvciB0aGUgYmFzZSA2NCB2YXJpYWJsZVxuLy8gbGVuZ3RoIHF1YW50aXRpZXMgd2UgdXNlIGluIHRoZSBzb3VyY2UgbWFwIHNwZWMsIHRoZSBmaXJzdCBiaXQgaXMgdGhlIHNpZ24sXG4vLyB0aGUgbmV4dCBmb3VyIGJpdHMgYXJlIHRoZSBhY3R1YWwgdmFsdWUsIGFuZCB0aGUgNnRoIGJpdCBpcyB0aGVcbi8vIGNvbnRpbnVhdGlvbiBiaXQuIFRoZSBjb250aW51YXRpb24gYml0IHRlbGxzIHVzIHdoZXRoZXIgdGhlcmUgYXJlIG1vcmVcbi8vIGRpZ2l0cyBpbiB0aGlzIHZhbHVlIGZvbGxvd2luZyB0aGlzIGRpZ2l0LlxuLy9cbi8vICAgQ29udGludWF0aW9uXG4vLyAgIHwgICAgU2lnblxuLy8gICB8ICAgIHxcbi8vICAgViAgICBWXG4vLyAgIDEwMTAxMVxuXG5jb25zdCBWTFFfQkFTRV9TSElGVCA9IDU7XG5cbi8vIGJpbmFyeTogMTAwMDAwXG5jb25zdCBWTFFfQkFTRSA9IDEgPDwgVkxRX0JBU0VfU0hJRlQ7XG5cbi8vIGJpbmFyeTogMDExMTExXG5jb25zdCBWTFFfQkFTRV9NQVNLID0gVkxRX0JBU0UgLSAxO1xuXG4vLyBiaW5hcnk6IDEwMDAwMFxuY29uc3QgVkxRX0NPTlRJTlVBVElPTl9CSVQgPSBWTFFfQkFTRTtcblxuLyoqXG4gKiBDb252ZXJ0cyBmcm9tIGEgdHdvLWNvbXBsZW1lbnQgdmFsdWUgdG8gYSB2YWx1ZSB3aGVyZSB0aGUgc2lnbiBiaXQgaXNcbiAqIHBsYWNlZCBpbiB0aGUgbGVhc3Qgc2lnbmlmaWNhbnQgYml0LiAgRm9yIGV4YW1wbGUsIGFzIGRlY2ltYWxzOlxuICogICAxIGJlY29tZXMgMiAoMTAgYmluYXJ5KSwgLTEgYmVjb21lcyAzICgxMSBiaW5hcnkpXG4gKiAgIDIgYmVjb21lcyA0ICgxMDAgYmluYXJ5KSwgLTIgYmVjb21lcyA1ICgxMDEgYmluYXJ5KVxuICovXG5mdW5jdGlvbiB0b1ZMUVNpZ25lZChhVmFsdWUpIHtcbiAgcmV0dXJuIGFWYWx1ZSA8IDBcbiAgICA/ICgoLWFWYWx1ZSkgPDwgMSkgKyAxXG4gICAgOiAoYVZhbHVlIDw8IDEpICsgMDtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyB0byBhIHR3by1jb21wbGVtZW50IHZhbHVlIGZyb20gYSB2YWx1ZSB3aGVyZSB0aGUgc2lnbiBiaXQgaXNcbiAqIHBsYWNlZCBpbiB0aGUgbGVhc3Qgc2lnbmlmaWNhbnQgYml0LiAgRm9yIGV4YW1wbGUsIGFzIGRlY2ltYWxzOlxuICogICAyICgxMCBiaW5hcnkpIGJlY29tZXMgMSwgMyAoMTEgYmluYXJ5KSBiZWNvbWVzIC0xXG4gKiAgIDQgKDEwMCBiaW5hcnkpIGJlY29tZXMgMiwgNSAoMTAxIGJpbmFyeSkgYmVjb21lcyAtMlxuICovXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbmZ1bmN0aW9uIGZyb21WTFFTaWduZWQoYVZhbHVlKSB7XG4gIGNvbnN0IGlzTmVnYXRpdmUgPSAoYVZhbHVlICYgMSkgPT09IDE7XG4gIGNvbnN0IHNoaWZ0ZWQgPSBhVmFsdWUgPj4gMTtcbiAgcmV0dXJuIGlzTmVnYXRpdmVcbiAgICA/IC1zaGlmdGVkXG4gICAgOiBzaGlmdGVkO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGJhc2UgNjQgVkxRIGVuY29kZWQgdmFsdWUuXG4gKi9cbmV4cG9ydHMuZW5jb2RlID0gZnVuY3Rpb24gYmFzZTY0VkxRX2VuY29kZShhVmFsdWUpIHtcbiAgbGV0IGVuY29kZWQgPSBcIlwiO1xuICBsZXQgZGlnaXQ7XG5cbiAgbGV0IHZscSA9IHRvVkxRU2lnbmVkKGFWYWx1ZSk7XG5cbiAgZG8ge1xuICAgIGRpZ2l0ID0gdmxxICYgVkxRX0JBU0VfTUFTSztcbiAgICB2bHEgPj4+PSBWTFFfQkFTRV9TSElGVDtcbiAgICBpZiAodmxxID4gMCkge1xuICAgICAgLy8gVGhlcmUgYXJlIHN0aWxsIG1vcmUgZGlnaXRzIGluIHRoaXMgdmFsdWUsIHNvIHdlIG11c3QgbWFrZSBzdXJlIHRoZVxuICAgICAgLy8gY29udGludWF0aW9uIGJpdCBpcyBtYXJrZWQuXG4gICAgICBkaWdpdCB8PSBWTFFfQ09OVElOVUFUSU9OX0JJVDtcbiAgICB9XG4gICAgZW5jb2RlZCArPSBiYXNlNjQuZW5jb2RlKGRpZ2l0KTtcbiAgfSB3aGlsZSAodmxxID4gMCk7XG5cbiAgcmV0dXJuIGVuY29kZWQ7XG59O1xuXG5cbi8qKiovIH0pLFxuLyogMyAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG4vKiAtKi0gTW9kZToganM7IGpzLWluZGVudC1sZXZlbDogMjsgLSotICovXG4vKlxuICogQ29weXJpZ2h0IDIwMTEgTW96aWxsYSBGb3VuZGF0aW9uIGFuZCBjb250cmlidXRvcnNcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBOZXcgQlNEIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIG9yOlxuICogaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICovXG5cbi8qKlxuICogQSBkYXRhIHN0cnVjdHVyZSB3aGljaCBpcyBhIGNvbWJpbmF0aW9uIG9mIGFuIGFycmF5IGFuZCBhIHNldC4gQWRkaW5nIGEgbmV3XG4gKiBtZW1iZXIgaXMgTygxKSwgdGVzdGluZyBmb3IgbWVtYmVyc2hpcCBpcyBPKDEpLCBhbmQgZmluZGluZyB0aGUgaW5kZXggb2YgYW5cbiAqIGVsZW1lbnQgaXMgTygxKS4gUmVtb3ZpbmcgZWxlbWVudHMgZnJvbSB0aGUgc2V0IGlzIG5vdCBzdXBwb3J0ZWQuIE9ubHlcbiAqIHN0cmluZ3MgYXJlIHN1cHBvcnRlZCBmb3IgbWVtYmVyc2hpcC5cbiAqL1xuY2xhc3MgQXJyYXlTZXQge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9hcnJheSA9IFtdO1xuICAgIHRoaXMuX3NldCA9IG5ldyBNYXAoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGF0aWMgbWV0aG9kIGZvciBjcmVhdGluZyBBcnJheVNldCBpbnN0YW5jZXMgZnJvbSBhbiBleGlzdGluZyBhcnJheS5cbiAgICovXG4gIHN0YXRpYyBmcm9tQXJyYXkoYUFycmF5LCBhQWxsb3dEdXBsaWNhdGVzKSB7XG4gICAgY29uc3Qgc2V0ID0gbmV3IEFycmF5U2V0KCk7XG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGFBcnJheS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgc2V0LmFkZChhQXJyYXlbaV0sIGFBbGxvd0R1cGxpY2F0ZXMpO1xuICAgIH1cbiAgICByZXR1cm4gc2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBob3cgbWFueSB1bmlxdWUgaXRlbXMgYXJlIGluIHRoaXMgQXJyYXlTZXQuIElmIGR1cGxpY2F0ZXMgaGF2ZSBiZWVuXG4gICAqIGFkZGVkLCB0aGFuIHRob3NlIGRvIG5vdCBjb3VudCB0b3dhcmRzIHRoZSBzaXplLlxuICAgKlxuICAgKiBAcmV0dXJucyBOdW1iZXJcbiAgICovXG4gIHNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NldC5zaXplO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgZ2l2ZW4gc3RyaW5nIHRvIHRoaXMgc2V0LlxuICAgKlxuICAgKiBAcGFyYW0gU3RyaW5nIGFTdHJcbiAgICovXG4gIGFkZChhU3RyLCBhQWxsb3dEdXBsaWNhdGVzKSB7XG4gICAgY29uc3QgaXNEdXBsaWNhdGUgPSB0aGlzLmhhcyhhU3RyKTtcbiAgICBjb25zdCBpZHggPSB0aGlzLl9hcnJheS5sZW5ndGg7XG4gICAgaWYgKCFpc0R1cGxpY2F0ZSB8fCBhQWxsb3dEdXBsaWNhdGVzKSB7XG4gICAgICB0aGlzLl9hcnJheS5wdXNoKGFTdHIpO1xuICAgIH1cbiAgICBpZiAoIWlzRHVwbGljYXRlKSB7XG4gICAgICB0aGlzLl9zZXQuc2V0KGFTdHIsIGlkeCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIElzIHRoZSBnaXZlbiBzdHJpbmcgYSBtZW1iZXIgb2YgdGhpcyBzZXQ/XG4gICAqXG4gICAqIEBwYXJhbSBTdHJpbmcgYVN0clxuICAgKi9cbiAgaGFzKGFTdHIpIHtcbiAgICAgIHJldHVybiB0aGlzLl9zZXQuaGFzKGFTdHIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoYXQgaXMgdGhlIGluZGV4IG9mIHRoZSBnaXZlbiBzdHJpbmcgaW4gdGhlIGFycmF5P1xuICAgKlxuICAgKiBAcGFyYW0gU3RyaW5nIGFTdHJcbiAgICovXG4gIGluZGV4T2YoYVN0cikge1xuICAgIGNvbnN0IGlkeCA9IHRoaXMuX3NldC5nZXQoYVN0cik7XG4gICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICAgIHJldHVybiBpZHg7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcignXCInICsgYVN0ciArICdcIiBpcyBub3QgaW4gdGhlIHNldC4nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGF0IGlzIHRoZSBlbGVtZW50IGF0IHRoZSBnaXZlbiBpbmRleD9cbiAgICpcbiAgICogQHBhcmFtIE51bWJlciBhSWR4XG4gICAqL1xuICBhdChhSWR4KSB7XG4gICAgaWYgKGFJZHggPj0gMCAmJiBhSWR4IDwgdGhpcy5fYXJyYXkubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYXJyYXlbYUlkeF07XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGVsZW1lbnQgaW5kZXhlZCBieSBcIiArIGFJZHgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGFycmF5IHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgc2V0ICh3aGljaCBoYXMgdGhlIHByb3BlciBpbmRpY2VzXG4gICAqIGluZGljYXRlZCBieSBpbmRleE9mKS4gTm90ZSB0aGF0IHRoaXMgaXMgYSBjb3B5IG9mIHRoZSBpbnRlcm5hbCBhcnJheSB1c2VkXG4gICAqIGZvciBzdG9yaW5nIHRoZSBtZW1iZXJzIHNvIHRoYXQgbm8gb25lIGNhbiBtZXNzIHdpdGggaW50ZXJuYWwgc3RhdGUuXG4gICAqL1xuICB0b0FycmF5KCkge1xuICAgIHJldHVybiB0aGlzLl9hcnJheS5zbGljZSgpO1xuICB9XG59XG5leHBvcnRzLkFycmF5U2V0ID0gQXJyYXlTZXQ7XG5cblxuLyoqKi8gfSksXG4vKiA0ICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbi8qIFdFQlBBQ0sgVkFSIElOSkVDVElPTiAqLyhmdW5jdGlvbihfX2Rpcm5hbWUpIHtpZiAodHlwZW9mIGZldGNoID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgLy8gV2ViIHZlcnNpb24gb2YgcmVhZGluZyBhIHdhc20gZmlsZSBpbnRvIGFuIGFycmF5IGJ1ZmZlci5cblxuICBsZXQgbWFwcGluZ3NXYXNtVXJsID0gbnVsbDtcblxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHJlYWRXYXNtKCkge1xuICAgIGlmICh0eXBlb2YgbWFwcGluZ3NXYXNtVXJsICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBwcm92aWRlIHRoZSBVUkwgb2YgbGliL21hcHBpbmdzLndhc20gYnkgY2FsbGluZyBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgXCJTb3VyY2VNYXBDb25zdW1lci5pbml0aWFsaXplKHsgJ2xpYi9tYXBwaW5ncy53YXNtJzogLi4uIH0pIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICBcImJlZm9yZSB1c2luZyBTb3VyY2VNYXBDb25zdW1lclwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmV0Y2gobWFwcGluZ3NXYXNtVXJsKVxuICAgICAgLnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UuYXJyYXlCdWZmZXIoKSk7XG4gIH07XG5cbiAgbW9kdWxlLmV4cG9ydHMuaW5pdGlhbGl6ZSA9IHVybCA9PiBtYXBwaW5nc1dhc21VcmwgPSB1cmw7XG59IGVsc2Uge1xuICAvLyBOb2RlIHZlcnNpb24gb2YgcmVhZGluZyBhIHdhc20gZmlsZSBpbnRvIGFuIGFycmF5IGJ1ZmZlci5cbiAgY29uc3QgZnMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEwKTtcbiAgY29uc3QgcGF0aCA9IF9fd2VicGFja19yZXF1aXJlX18oMTEpO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcmVhZFdhc20oKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHdhc21QYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgXCJtYXBwaW5ncy53YXNtXCIpO1xuICAgICAgZnMucmVhZEZpbGUod2FzbVBhdGgsIG51bGwsIChlcnJvciwgZGF0YSkgPT4ge1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc29sdmUoZGF0YS5idWZmZXIpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgbW9kdWxlLmV4cG9ydHMuaW5pdGlhbGl6ZSA9IF8gPT4ge1xuICAgIGNvbnNvbGUuZGVidWcoXCJTb3VyY2VNYXBDb25zdW1lci5pbml0aWFsaXplIGlzIGEgbm8tb3Agd2hlbiBydW5uaW5nIGluIG5vZGUuanNcIik7XG4gIH07XG59XG5cbi8qIFdFQlBBQ0sgVkFSIElOSkVDVElPTiAqL30uY2FsbChleHBvcnRzLCBcIi9cIikpXG5cbi8qKiovIH0pLFxuLyogNSAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG4vKlxuICogQ29weXJpZ2h0IDIwMDktMjAxMSBNb3ppbGxhIEZvdW5kYXRpb24gYW5kIGNvbnRyaWJ1dG9yc1xuICogTGljZW5zZWQgdW5kZXIgdGhlIE5ldyBCU0QgbGljZW5zZS4gU2VlIExJQ0VOU0UudHh0IG9yOlxuICogaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICovXG5leHBvcnRzLlNvdXJjZU1hcEdlbmVyYXRvciA9IF9fd2VicGFja19yZXF1aXJlX18oMSkuU291cmNlTWFwR2VuZXJhdG9yO1xuZXhwb3J0cy5Tb3VyY2VNYXBDb25zdW1lciA9IF9fd2VicGFja19yZXF1aXJlX18oOCkuU291cmNlTWFwQ29uc3VtZXI7XG5leHBvcnRzLlNvdXJjZU5vZGUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEzKS5Tb3VyY2VOb2RlO1xuXG5cbi8qKiovIH0pLFxuLyogNiAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG4vKiAtKi0gTW9kZToganM7IGpzLWluZGVudC1sZXZlbDogMjsgLSotICovXG4vKlxuICogQ29weXJpZ2h0IDIwMTEgTW96aWxsYSBGb3VuZGF0aW9uIGFuZCBjb250cmlidXRvcnNcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBOZXcgQlNEIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIG9yOlxuICogaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICovXG5cbmNvbnN0IGludFRvQ2hhck1hcCA9IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrL1wiLnNwbGl0KFwiXCIpO1xuXG4vKipcbiAqIEVuY29kZSBhbiBpbnRlZ2VyIGluIHRoZSByYW5nZSBvZiAwIHRvIDYzIHRvIGEgc2luZ2xlIGJhc2UgNjQgZGlnaXQuXG4gKi9cbmV4cG9ydHMuZW5jb2RlID0gZnVuY3Rpb24obnVtYmVyKSB7XG4gIGlmICgwIDw9IG51bWJlciAmJiBudW1iZXIgPCBpbnRUb0NoYXJNYXAubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGludFRvQ2hhck1hcFtudW1iZXJdO1xuICB9XG4gIHRocm93IG5ldyBUeXBlRXJyb3IoXCJNdXN0IGJlIGJldHdlZW4gMCBhbmQgNjM6IFwiICsgbnVtYmVyKTtcbn07XG5cblxuLyoqKi8gfSksXG4vKiA3ICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbi8qIC0qLSBNb2RlOiBqczsganMtaW5kZW50LWxldmVsOiAyOyAtKi0gKi9cbi8qXG4gKiBDb3B5cmlnaHQgMjAxNCBNb3ppbGxhIEZvdW5kYXRpb24gYW5kIGNvbnRyaWJ1dG9yc1xuICogTGljZW5zZWQgdW5kZXIgdGhlIE5ldyBCU0QgbGljZW5zZS4gU2VlIExJQ0VOU0Ugb3I6XG4gKiBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvQlNELTMtQ2xhdXNlXG4gKi9cblxuY29uc3QgdXRpbCA9IF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cbi8qKlxuICogRGV0ZXJtaW5lIHdoZXRoZXIgbWFwcGluZ0IgaXMgYWZ0ZXIgbWFwcGluZ0Egd2l0aCByZXNwZWN0IHRvIGdlbmVyYXRlZFxuICogcG9zaXRpb24uXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlZFBvc2l0aW9uQWZ0ZXIobWFwcGluZ0EsIG1hcHBpbmdCKSB7XG4gIC8vIE9wdGltaXplZCBmb3IgbW9zdCBjb21tb24gY2FzZVxuICBjb25zdCBsaW5lQSA9IG1hcHBpbmdBLmdlbmVyYXRlZExpbmU7XG4gIGNvbnN0IGxpbmVCID0gbWFwcGluZ0IuZ2VuZXJhdGVkTGluZTtcbiAgY29uc3QgY29sdW1uQSA9IG1hcHBpbmdBLmdlbmVyYXRlZENvbHVtbjtcbiAgY29uc3QgY29sdW1uQiA9IG1hcHBpbmdCLmdlbmVyYXRlZENvbHVtbjtcbiAgcmV0dXJuIGxpbmVCID4gbGluZUEgfHwgbGluZUIgPT0gbGluZUEgJiYgY29sdW1uQiA+PSBjb2x1bW5BIHx8XG4gICAgICAgICB1dGlsLmNvbXBhcmVCeUdlbmVyYXRlZFBvc2l0aW9uc0luZmxhdGVkKG1hcHBpbmdBLCBtYXBwaW5nQikgPD0gMDtcbn1cblxuLyoqXG4gKiBBIGRhdGEgc3RydWN0dXJlIHRvIHByb3ZpZGUgYSBzb3J0ZWQgdmlldyBvZiBhY2N1bXVsYXRlZCBtYXBwaW5ncyBpbiBhXG4gKiBwZXJmb3JtYW5jZSBjb25zY2lvdXMgbWFubmVyLiBJdCB0cmFkZXMgYSBuZWdsaWdpYmxlIG92ZXJoZWFkIGluIGdlbmVyYWxcbiAqIGNhc2UgZm9yIGEgbGFyZ2Ugc3BlZWR1cCBpbiBjYXNlIG9mIG1hcHBpbmdzIGJlaW5nIGFkZGVkIGluIG9yZGVyLlxuICovXG5jbGFzcyBNYXBwaW5nTGlzdCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2FycmF5ID0gW107XG4gICAgdGhpcy5fc29ydGVkID0gdHJ1ZTtcbiAgICAvLyBTZXJ2ZXMgYXMgaW5maW11bVxuICAgIHRoaXMuX2xhc3QgPSB7Z2VuZXJhdGVkTGluZTogLTEsIGdlbmVyYXRlZENvbHVtbjogMH07XG4gIH1cblxuICAvKipcbiAgICogSXRlcmF0ZSB0aHJvdWdoIGludGVybmFsIGl0ZW1zLiBUaGlzIG1ldGhvZCB0YWtlcyB0aGUgc2FtZSBhcmd1bWVudHMgdGhhdFxuICAgKiBgQXJyYXkucHJvdG90eXBlLmZvckVhY2hgIHRha2VzLlxuICAgKlxuICAgKiBOT1RFOiBUaGUgb3JkZXIgb2YgdGhlIG1hcHBpbmdzIGlzIE5PVCBndWFyYW50ZWVkLlxuICAgKi9cbiAgdW5zb3J0ZWRGb3JFYWNoKGFDYWxsYmFjaywgYVRoaXNBcmcpIHtcbiAgICB0aGlzLl9hcnJheS5mb3JFYWNoKGFDYWxsYmFjaywgYVRoaXNBcmcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgZ2l2ZW4gc291cmNlIG1hcHBpbmcuXG4gICAqXG4gICAqIEBwYXJhbSBPYmplY3QgYU1hcHBpbmdcbiAgICovXG4gIGFkZChhTWFwcGluZykge1xuICAgIGlmIChnZW5lcmF0ZWRQb3NpdGlvbkFmdGVyKHRoaXMuX2xhc3QsIGFNYXBwaW5nKSkge1xuICAgICAgdGhpcy5fbGFzdCA9IGFNYXBwaW5nO1xuICAgICAgdGhpcy5fYXJyYXkucHVzaChhTWFwcGluZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3NvcnRlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5fYXJyYXkucHVzaChhTWFwcGluZyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGZsYXQsIHNvcnRlZCBhcnJheSBvZiBtYXBwaW5ncy4gVGhlIG1hcHBpbmdzIGFyZSBzb3J0ZWQgYnlcbiAgICogZ2VuZXJhdGVkIHBvc2l0aW9uLlxuICAgKlxuICAgKiBXQVJOSU5HOiBUaGlzIG1ldGhvZCByZXR1cm5zIGludGVybmFsIGRhdGEgd2l0aG91dCBjb3B5aW5nLCBmb3JcbiAgICogcGVyZm9ybWFuY2UuIFRoZSByZXR1cm4gdmFsdWUgbXVzdCBOT1QgYmUgbXV0YXRlZCwgYW5kIHNob3VsZCBiZSB0cmVhdGVkIGFzXG4gICAqIGFuIGltbXV0YWJsZSBib3Jyb3cuIElmIHlvdSB3YW50IHRvIHRha2Ugb3duZXJzaGlwLCB5b3UgbXVzdCBtYWtlIHlvdXIgb3duXG4gICAqIGNvcHkuXG4gICAqL1xuICB0b0FycmF5KCkge1xuICAgIGlmICghdGhpcy5fc29ydGVkKSB7XG4gICAgICB0aGlzLl9hcnJheS5zb3J0KHV0aWwuY29tcGFyZUJ5R2VuZXJhdGVkUG9zaXRpb25zSW5mbGF0ZWQpO1xuICAgICAgdGhpcy5fc29ydGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2FycmF5O1xuICB9XG59XG5cbmV4cG9ydHMuTWFwcGluZ0xpc3QgPSBNYXBwaW5nTGlzdDtcblxuXG4vKioqLyB9KSxcbi8qIDggKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuLyogLSotIE1vZGU6IGpzOyBqcy1pbmRlbnQtbGV2ZWw6IDI7IC0qLSAqL1xuLypcbiAqIENvcHlyaWdodCAyMDExIE1vemlsbGEgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTmV3IEJTRCBsaWNlbnNlLiBTZWUgTElDRU5TRSBvcjpcbiAqIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9CU0QtMy1DbGF1c2VcbiAqL1xuXG5jb25zdCB1dGlsID0gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcbmNvbnN0IGJpbmFyeVNlYXJjaCA9IF9fd2VicGFja19yZXF1aXJlX18oOSk7XG5jb25zdCBBcnJheVNldCA9IF9fd2VicGFja19yZXF1aXJlX18oMykuQXJyYXlTZXQ7XG5jb25zdCBiYXNlNjRWTFEgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDIpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5jb25zdCByZWFkV2FzbSA9IF9fd2VicGFja19yZXF1aXJlX18oNCk7XG5jb25zdCB3YXNtID0gX193ZWJwYWNrX3JlcXVpcmVfXygxMik7XG5cbmNvbnN0IElOVEVSTkFMID0gU3ltYm9sKFwic21jSW50ZXJuYWxcIik7XG5cbmNsYXNzIFNvdXJjZU1hcENvbnN1bWVyIHtcbiAgY29uc3RydWN0b3IoYVNvdXJjZU1hcCwgYVNvdXJjZU1hcFVSTCkge1xuICAgIC8vIElmIHRoZSBjb25zdHJ1Y3RvciB3YXMgY2FsbGVkIGJ5IHN1cGVyKCksIGp1c3QgcmV0dXJuIFByb21pc2U8dGhpcz4uXG4gICAgLy8gWWVzLCB0aGlzIGlzIGEgaGFjayB0byByZXRhaW4gdGhlIHByZS1leGlzdGluZyBBUEkgb2YgdGhlIGJhc2UtY2xhc3NcbiAgICAvLyBjb25zdHJ1Y3RvciBhbHNvIGJlaW5nIGFuIGFzeW5jIGZhY3RvcnkgZnVuY3Rpb24uXG4gICAgaWYgKGFTb3VyY2VNYXAgPT0gSU5URVJOQUwpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIF9mYWN0b3J5KGFTb3VyY2VNYXAsIGFTb3VyY2VNYXBVUkwpO1xuICB9XG5cbiAgc3RhdGljIGluaXRpYWxpemUob3B0cykge1xuICAgIHJlYWRXYXNtLmluaXRpYWxpemUob3B0c1tcImxpYi9tYXBwaW5ncy53YXNtXCJdKTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tU291cmNlTWFwKGFTb3VyY2VNYXAsIGFTb3VyY2VNYXBVUkwpIHtcbiAgICByZXR1cm4gX2ZhY3RvcnlCU00oYVNvdXJjZU1hcCwgYVNvdXJjZU1hcFVSTCk7XG4gIH1cblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IGBTb3VyY2VNYXBDb25zdW1lcmAgZnJvbSBgcmF3U291cmNlTWFwYCBhbmQgYHNvdXJjZU1hcFVybGBcbiAgICogKHNlZSB0aGUgYFNvdXJjZU1hcENvbnN1bWVyYCBjb25zdHJ1Y3RvciBmb3IgZGV0YWlscy4gVGhlbiwgaW52b2tlIHRoZSBgYXN5bmNcbiAgICogZnVuY3Rpb24gZihTb3VyY2VNYXBDb25zdW1lcikgLT4gVGAgd2l0aCB0aGUgbmV3bHkgY29uc3RydWN0ZWQgY29uc3VtZXIsIHdhaXRcbiAgICogZm9yIGBmYCB0byBjb21wbGV0ZSwgY2FsbCBgZGVzdHJveWAgb24gdGhlIGNvbnN1bWVyLCBhbmQgcmV0dXJuIGBmYCdzIHJldHVyblxuICAgKiB2YWx1ZS5cbiAgICpcbiAgICogWW91IG11c3Qgbm90IHVzZSB0aGUgY29uc3VtZXIgYWZ0ZXIgYGZgIGNvbXBsZXRlcyFcbiAgICpcbiAgICogQnkgdXNpbmcgYHdpdGhgLCB5b3UgZG8gbm90IGhhdmUgdG8gcmVtZW1iZXIgdG8gbWFudWFsbHkgY2FsbCBgZGVzdHJveWAgb25cbiAgICogdGhlIGNvbnN1bWVyLCBzaW5jZSBpdCB3aWxsIGJlIGNhbGxlZCBhdXRvbWF0aWNhbGx5IG9uY2UgYGZgIGNvbXBsZXRlcy5cbiAgICpcbiAgICogYGBganNcbiAgICogY29uc3QgeFNxdWFyZWQgPSBhd2FpdCBTb3VyY2VNYXBDb25zdW1lci53aXRoKFxuICAgKiAgIG15UmF3U291cmNlTWFwLFxuICAgKiAgIG51bGwsXG4gICAqICAgYXN5bmMgZnVuY3Rpb24gKGNvbnN1bWVyKSB7XG4gICAqICAgICAvLyBVc2UgYGNvbnN1bWVyYCBpbnNpZGUgaGVyZSBhbmQgZG9uJ3Qgd29ycnkgYWJvdXQgcmVtZW1iZXJpbmdcbiAgICogICAgIC8vIHRvIGNhbGwgYGRlc3Ryb3lgLlxuICAgKlxuICAgKiAgICAgY29uc3QgeCA9IGF3YWl0IHdoYXRldmVyKGNvbnN1bWVyKTtcbiAgICogICAgIHJldHVybiB4ICogeDtcbiAgICogICB9XG4gICAqICk7XG4gICAqXG4gICAqIC8vIFlvdSBtYXkgbm90IHVzZSB0aGF0IGBjb25zdW1lcmAgYW55bW9yZSBvdXQgaGVyZTsgaXQgaGFzXG4gICAqIC8vIGJlZW4gZGVzdHJveWVkLiBCdXQgeW91IGNhbiB1c2UgYHhTcXVhcmVkYC5cbiAgICogY29uc29sZS5sb2coeFNxdWFyZWQpO1xuICAgKiBgYGBcbiAgICovXG4gIHN0YXRpYyB3aXRoKHJhd1NvdXJjZU1hcCwgc291cmNlTWFwVXJsLCBmKSB7XG4gICAgLy8gTm90ZTogVGhlIGBhY29ybmAgdmVyc2lvbiB0aGF0IGB3ZWJwYWNrYCBjdXJyZW50bHkgZGVwZW5kcyBvbiBkb2Vzbid0XG4gICAgLy8gc3VwcG9ydCBgYXN5bmNgIGZ1bmN0aW9ucywgYW5kIHRoZSBub2RlcyB0aGF0IHdlIHN1cHBvcnQgZG9uJ3QgYWxsIGhhdmVcbiAgICAvLyBgLmZpbmFsbHlgLiBUaGVyZWZvcmUsIHRoaXMgaXMgd3JpdHRlbiBhIGJpdCBtb3JlIGNvbnZvbHV0ZWRseSB0aGFuIGl0XG4gICAgLy8gc2hvdWxkIHJlYWxseSBiZS5cblxuICAgIGxldCBjb25zdW1lciA9IG51bGw7XG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBTb3VyY2VNYXBDb25zdW1lcihyYXdTb3VyY2VNYXAsIHNvdXJjZU1hcFVybCk7XG4gICAgcmV0dXJuIHByb21pc2VcbiAgICAgIC50aGVuKGMgPT4ge1xuICAgICAgICBjb25zdW1lciA9IGM7XG4gICAgICAgIHJldHVybiBmKGMpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKHggPT4ge1xuICAgICAgICBpZiAoY29uc3VtZXIpIHtcbiAgICAgICAgICBjb25zdW1lci5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHg7XG4gICAgICB9LCBlID0+IHtcbiAgICAgICAgaWYgKGNvbnN1bWVyKSB7XG4gICAgICAgICAgY29uc3VtZXIuZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSB0aGUgbWFwcGluZ3MgaW4gYSBzdHJpbmcgaW4gdG8gYSBkYXRhIHN0cnVjdHVyZSB3aGljaCB3ZSBjYW4gZWFzaWx5XG4gICAqIHF1ZXJ5ICh0aGUgb3JkZXJlZCBhcnJheXMgaW4gdGhlIGB0aGlzLl9fZ2VuZXJhdGVkTWFwcGluZ3NgIGFuZFxuICAgKiBgdGhpcy5fX29yaWdpbmFsTWFwcGluZ3NgIHByb3BlcnRpZXMpLlxuICAgKi9cbiAgX3BhcnNlTWFwcGluZ3MoYVN0ciwgYVNvdXJjZVJvb3QpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJTdWJjbGFzc2VzIG11c3QgaW1wbGVtZW50IF9wYXJzZU1hcHBpbmdzXCIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgb3ZlciBlYWNoIG1hcHBpbmcgYmV0d2VlbiBhbiBvcmlnaW5hbCBzb3VyY2UvbGluZS9jb2x1bW4gYW5kIGFcbiAgICogZ2VuZXJhdGVkIGxpbmUvY29sdW1uIGluIHRoaXMgc291cmNlIG1hcC5cbiAgICpcbiAgICogQHBhcmFtIEZ1bmN0aW9uIGFDYWxsYmFja1xuICAgKiAgICAgICAgVGhlIGZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIHdpdGggZWFjaCBtYXBwaW5nLlxuICAgKiBAcGFyYW0gT2JqZWN0IGFDb250ZXh0XG4gICAqICAgICAgICBPcHRpb25hbC4gSWYgc3BlY2lmaWVkLCB0aGlzIG9iamVjdCB3aWxsIGJlIHRoZSB2YWx1ZSBvZiBgdGhpc2AgZXZlcnlcbiAgICogICAgICAgIHRpbWUgdGhhdCBgYUNhbGxiYWNrYCBpcyBjYWxsZWQuXG4gICAqIEBwYXJhbSBhT3JkZXJcbiAgICogICAgICAgIEVpdGhlciBgU291cmNlTWFwQ29uc3VtZXIuR0VORVJBVEVEX09SREVSYCBvclxuICAgKiAgICAgICAgYFNvdXJjZU1hcENvbnN1bWVyLk9SSUdJTkFMX09SREVSYC4gU3BlY2lmaWVzIHdoZXRoZXIgeW91IHdhbnQgdG9cbiAgICogICAgICAgIGl0ZXJhdGUgb3ZlciB0aGUgbWFwcGluZ3Mgc29ydGVkIGJ5IHRoZSBnZW5lcmF0ZWQgZmlsZSdzIGxpbmUvY29sdW1uXG4gICAqICAgICAgICBvcmRlciBvciB0aGUgb3JpZ2luYWwncyBzb3VyY2UvbGluZS9jb2x1bW4gb3JkZXIsIHJlc3BlY3RpdmVseS4gRGVmYXVsdHMgdG9cbiAgICogICAgICAgIGBTb3VyY2VNYXBDb25zdW1lci5HRU5FUkFURURfT1JERVJgLlxuICAgKi9cbiAgZWFjaE1hcHBpbmcoYUNhbGxiYWNrLCBhQ29udGV4dCwgYU9yZGVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiU3ViY2xhc3NlcyBtdXN0IGltcGxlbWVudCBlYWNoTWFwcGluZ1wiKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFsbCBnZW5lcmF0ZWQgbGluZSBhbmQgY29sdW1uIGluZm9ybWF0aW9uIGZvciB0aGUgb3JpZ2luYWwgc291cmNlLFxuICAgKiBsaW5lLCBhbmQgY29sdW1uIHByb3ZpZGVkLiBJZiBubyBjb2x1bW4gaXMgcHJvdmlkZWQsIHJldHVybnMgYWxsIG1hcHBpbmdzXG4gICAqIGNvcnJlc3BvbmRpbmcgdG8gYSBlaXRoZXIgdGhlIGxpbmUgd2UgYXJlIHNlYXJjaGluZyBmb3Igb3IgdGhlIG5leHRcbiAgICogY2xvc2VzdCBsaW5lIHRoYXQgaGFzIGFueSBtYXBwaW5ncy4gT3RoZXJ3aXNlLCByZXR1cm5zIGFsbCBtYXBwaW5nc1xuICAgKiBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlbiBsaW5lIGFuZCBlaXRoZXIgdGhlIGNvbHVtbiB3ZSBhcmUgc2VhcmNoaW5nIGZvclxuICAgKiBvciB0aGUgbmV4dCBjbG9zZXN0IGNvbHVtbiB0aGF0IGhhcyBhbnkgb2Zmc2V0cy5cbiAgICpcbiAgICogVGhlIG9ubHkgYXJndW1lbnQgaXMgYW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICAgKlxuICAgKiAgIC0gc291cmNlOiBUaGUgZmlsZW5hbWUgb2YgdGhlIG9yaWdpbmFsIHNvdXJjZS5cbiAgICogICAtIGxpbmU6IFRoZSBsaW5lIG51bWJlciBpbiB0aGUgb3JpZ2luYWwgc291cmNlLiAgVGhlIGxpbmUgbnVtYmVyIGlzIDEtYmFzZWQuXG4gICAqICAgLSBjb2x1bW46IE9wdGlvbmFsLiB0aGUgY29sdW1uIG51bWJlciBpbiB0aGUgb3JpZ2luYWwgc291cmNlLlxuICAgKiAgICBUaGUgY29sdW1uIG51bWJlciBpcyAwLWJhc2VkLlxuICAgKlxuICAgKiBhbmQgYW4gYXJyYXkgb2Ygb2JqZWN0cyBpcyByZXR1cm5lZCwgZWFjaCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAgICpcbiAgICogICAtIGxpbmU6IFRoZSBsaW5lIG51bWJlciBpbiB0aGUgZ2VuZXJhdGVkIHNvdXJjZSwgb3IgbnVsbC4gIFRoZVxuICAgKiAgICBsaW5lIG51bWJlciBpcyAxLWJhc2VkLlxuICAgKiAgIC0gY29sdW1uOiBUaGUgY29sdW1uIG51bWJlciBpbiB0aGUgZ2VuZXJhdGVkIHNvdXJjZSwgb3IgbnVsbC5cbiAgICogICAgVGhlIGNvbHVtbiBudW1iZXIgaXMgMC1iYXNlZC5cbiAgICovXG4gIGFsbEdlbmVyYXRlZFBvc2l0aW9uc0ZvcihhQXJncykge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlN1YmNsYXNzZXMgbXVzdCBpbXBsZW1lbnQgYWxsR2VuZXJhdGVkUG9zaXRpb25zRm9yXCIpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJTdWJjbGFzc2VzIG11c3QgaW1wbGVtZW50IGRlc3Ryb3lcIik7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgdmVyc2lvbiBvZiB0aGUgc291cmNlIG1hcHBpbmcgc3BlYyB0aGF0IHdlIGFyZSBjb25zdW1pbmcuXG4gKi9cblNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5fdmVyc2lvbiA9IDM7XG5Tb3VyY2VNYXBDb25zdW1lci5HRU5FUkFURURfT1JERVIgPSAxO1xuU291cmNlTWFwQ29uc3VtZXIuT1JJR0lOQUxfT1JERVIgPSAyO1xuXG5Tb3VyY2VNYXBDb25zdW1lci5HUkVBVEVTVF9MT1dFUl9CT1VORCA9IDE7XG5Tb3VyY2VNYXBDb25zdW1lci5MRUFTVF9VUFBFUl9CT1VORCA9IDI7XG5cbmV4cG9ydHMuU291cmNlTWFwQ29uc3VtZXIgPSBTb3VyY2VNYXBDb25zdW1lcjtcblxuLyoqXG4gKiBBIEJhc2ljU291cmNlTWFwQ29uc3VtZXIgaW5zdGFuY2UgcmVwcmVzZW50cyBhIHBhcnNlZCBzb3VyY2UgbWFwIHdoaWNoIHdlIGNhblxuICogcXVlcnkgZm9yIGluZm9ybWF0aW9uIGFib3V0IHRoZSBvcmlnaW5hbCBmaWxlIHBvc2l0aW9ucyBieSBnaXZpbmcgaXQgYSBmaWxlXG4gKiBwb3NpdGlvbiBpbiB0aGUgZ2VuZXJhdGVkIHNvdXJjZS5cbiAqXG4gKiBUaGUgZmlyc3QgcGFyYW1ldGVyIGlzIHRoZSByYXcgc291cmNlIG1hcCAoZWl0aGVyIGFzIGEgSlNPTiBzdHJpbmcsIG9yXG4gKiBhbHJlYWR5IHBhcnNlZCB0byBhbiBvYmplY3QpLiBBY2NvcmRpbmcgdG8gdGhlIHNwZWMsIHNvdXJjZSBtYXBzIGhhdmUgdGhlXG4gKiBmb2xsb3dpbmcgYXR0cmlidXRlczpcbiAqXG4gKiAgIC0gdmVyc2lvbjogV2hpY2ggdmVyc2lvbiBvZiB0aGUgc291cmNlIG1hcCBzcGVjIHRoaXMgbWFwIGlzIGZvbGxvd2luZy5cbiAqICAgLSBzb3VyY2VzOiBBbiBhcnJheSBvZiBVUkxzIHRvIHRoZSBvcmlnaW5hbCBzb3VyY2UgZmlsZXMuXG4gKiAgIC0gbmFtZXM6IEFuIGFycmF5IG9mIGlkZW50aWZpZXJzIHdoaWNoIGNhbiBiZSByZWZlcmVuY2VkIGJ5IGluZGl2aWR1YWwgbWFwcGluZ3MuXG4gKiAgIC0gc291cmNlUm9vdDogT3B0aW9uYWwuIFRoZSBVUkwgcm9vdCBmcm9tIHdoaWNoIGFsbCBzb3VyY2VzIGFyZSByZWxhdGl2ZS5cbiAqICAgLSBzb3VyY2VzQ29udGVudDogT3B0aW9uYWwuIEFuIGFycmF5IG9mIGNvbnRlbnRzIG9mIHRoZSBvcmlnaW5hbCBzb3VyY2UgZmlsZXMuXG4gKiAgIC0gbWFwcGluZ3M6IEEgc3RyaW5nIG9mIGJhc2U2NCBWTFFzIHdoaWNoIGNvbnRhaW4gdGhlIGFjdHVhbCBtYXBwaW5ncy5cbiAqICAgLSBmaWxlOiBPcHRpb25hbC4gVGhlIGdlbmVyYXRlZCBmaWxlIHRoaXMgc291cmNlIG1hcCBpcyBhc3NvY2lhdGVkIHdpdGguXG4gKlxuICogSGVyZSBpcyBhbiBleGFtcGxlIHNvdXJjZSBtYXAsIHRha2VuIGZyb20gdGhlIHNvdXJjZSBtYXAgc3BlY1swXTpcbiAqXG4gKiAgICAge1xuICogICAgICAgdmVyc2lvbiA6IDMsXG4gKiAgICAgICBmaWxlOiBcIm91dC5qc1wiLFxuICogICAgICAgc291cmNlUm9vdCA6IFwiXCIsXG4gKiAgICAgICBzb3VyY2VzOiBbXCJmb28uanNcIiwgXCJiYXIuanNcIl0sXG4gKiAgICAgICBuYW1lczogW1wic3JjXCIsIFwibWFwc1wiLCBcImFyZVwiLCBcImZ1blwiXSxcbiAqICAgICAgIG1hcHBpbmdzOiBcIkFBLEFCOztBQkNERTtcIlxuICogICAgIH1cbiAqXG4gKiBUaGUgc2Vjb25kIHBhcmFtZXRlciwgaWYgZ2l2ZW4sIGlzIGEgc3RyaW5nIHdob3NlIHZhbHVlIGlzIHRoZSBVUkxcbiAqIGF0IHdoaWNoIHRoZSBzb3VyY2UgbWFwIHdhcyBmb3VuZC4gIFRoaXMgVVJMIGlzIHVzZWQgdG8gY29tcHV0ZSB0aGVcbiAqIHNvdXJjZXMgYXJyYXkuXG4gKlxuICogWzBdOiBodHRwczovL2RvY3MuZ29vZ2xlLmNvbS9kb2N1bWVudC9kLzFVMVJHQWVoUXdSeXBVVG92RjFLUmxwaU9GemUwYi1fMmdjNmZBSDBLWTBrL2VkaXQ/cGxpPTEjXG4gKi9cbmNsYXNzIEJhc2ljU291cmNlTWFwQ29uc3VtZXIgZXh0ZW5kcyBTb3VyY2VNYXBDb25zdW1lciB7XG4gIGNvbnN0cnVjdG9yKGFTb3VyY2VNYXAsIGFTb3VyY2VNYXBVUkwpIHtcbiAgICByZXR1cm4gc3VwZXIoSU5URVJOQUwpLnRoZW4odGhhdCA9PiB7XG4gICAgICBsZXQgc291cmNlTWFwID0gYVNvdXJjZU1hcDtcbiAgICAgIGlmICh0eXBlb2YgYVNvdXJjZU1hcCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBzb3VyY2VNYXAgPSB1dGlsLnBhcnNlU291cmNlTWFwSW5wdXQoYVNvdXJjZU1hcCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHZlcnNpb24gPSB1dGlsLmdldEFyZyhzb3VyY2VNYXAsIFwidmVyc2lvblwiKTtcbiAgICAgIGxldCBzb3VyY2VzID0gdXRpbC5nZXRBcmcoc291cmNlTWFwLCBcInNvdXJjZXNcIik7XG4gICAgICAvLyBTYXNzIDMuMyBsZWF2ZXMgb3V0IHRoZSAnbmFtZXMnIGFycmF5LCBzbyB3ZSBkZXZpYXRlIGZyb20gdGhlIHNwZWMgKHdoaWNoXG4gICAgICAvLyByZXF1aXJlcyB0aGUgYXJyYXkpIHRvIHBsYXkgbmljZSBoZXJlLlxuICAgICAgY29uc3QgbmFtZXMgPSB1dGlsLmdldEFyZyhzb3VyY2VNYXAsIFwibmFtZXNcIiwgW10pO1xuICAgICAgbGV0IHNvdXJjZVJvb3QgPSB1dGlsLmdldEFyZyhzb3VyY2VNYXAsIFwic291cmNlUm9vdFwiLCBudWxsKTtcbiAgICAgIGNvbnN0IHNvdXJjZXNDb250ZW50ID0gdXRpbC5nZXRBcmcoc291cmNlTWFwLCBcInNvdXJjZXNDb250ZW50XCIsIG51bGwpO1xuICAgICAgY29uc3QgbWFwcGluZ3MgPSB1dGlsLmdldEFyZyhzb3VyY2VNYXAsIFwibWFwcGluZ3NcIik7XG4gICAgICBjb25zdCBmaWxlID0gdXRpbC5nZXRBcmcoc291cmNlTWFwLCBcImZpbGVcIiwgbnVsbCk7XG5cbiAgICAgIC8vIE9uY2UgYWdhaW4sIFNhc3MgZGV2aWF0ZXMgZnJvbSB0aGUgc3BlYyBhbmQgc3VwcGxpZXMgdGhlIHZlcnNpb24gYXMgYVxuICAgICAgLy8gc3RyaW5nIHJhdGhlciB0aGFuIGEgbnVtYmVyLCBzbyB3ZSB1c2UgbG9vc2UgZXF1YWxpdHkgY2hlY2tpbmcgaGVyZS5cbiAgICAgIGlmICh2ZXJzaW9uICE9IHRoYXQuX3ZlcnNpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5zdXBwb3J0ZWQgdmVyc2lvbjogXCIgKyB2ZXJzaW9uKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNvdXJjZVJvb3QpIHtcbiAgICAgICAgc291cmNlUm9vdCA9IHV0aWwubm9ybWFsaXplKHNvdXJjZVJvb3QpO1xuICAgICAgfVxuXG4gICAgICBzb3VyY2VzID0gc291cmNlc1xuICAgICAgICAubWFwKFN0cmluZylcbiAgICAgICAgLy8gU29tZSBzb3VyY2UgbWFwcyBwcm9kdWNlIHJlbGF0aXZlIHNvdXJjZSBwYXRocyBsaWtlIFwiLi9mb28uanNcIiBpbnN0ZWFkIG9mXG4gICAgICAgIC8vIFwiZm9vLmpzXCIuICBOb3JtYWxpemUgdGhlc2UgZmlyc3Qgc28gdGhhdCBmdXR1cmUgY29tcGFyaXNvbnMgd2lsbCBzdWNjZWVkLlxuICAgICAgICAvLyBTZWUgYnVnemlsLmxhLzEwOTA3NjguXG4gICAgICAgIC5tYXAodXRpbC5ub3JtYWxpemUpXG4gICAgICAgIC8vIEFsd2F5cyBlbnN1cmUgdGhhdCBhYnNvbHV0ZSBzb3VyY2VzIGFyZSBpbnRlcm5hbGx5IHN0b3JlZCByZWxhdGl2ZSB0b1xuICAgICAgICAvLyB0aGUgc291cmNlIHJvb3QsIGlmIHRoZSBzb3VyY2Ugcm9vdCBpcyBhYnNvbHV0ZS4gTm90IGRvaW5nIHRoaXMgd291bGRcbiAgICAgICAgLy8gYmUgcGFydGljdWxhcmx5IHByb2JsZW1hdGljIHdoZW4gdGhlIHNvdXJjZSByb290IGlzIGEgcHJlZml4IG9mIHRoZVxuICAgICAgICAvLyBzb3VyY2UgKHZhbGlkLCBidXQgd2h5Pz8pLiBTZWUgZ2l0aHViIGlzc3VlICMxOTkgYW5kIGJ1Z3ppbC5sYS8xMTg4OTgyLlxuICAgICAgICAubWFwKGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgICAgIHJldHVybiBzb3VyY2VSb290ICYmIHV0aWwuaXNBYnNvbHV0ZShzb3VyY2VSb290KSAmJiB1dGlsLmlzQWJzb2x1dGUoc291cmNlKVxuICAgICAgICAgICAgPyB1dGlsLnJlbGF0aXZlKHNvdXJjZVJvb3QsIHNvdXJjZSlcbiAgICAgICAgICAgIDogc291cmNlO1xuICAgICAgICB9KTtcblxuICAgICAgLy8gUGFzcyBgdHJ1ZWAgYmVsb3cgdG8gYWxsb3cgZHVwbGljYXRlIG5hbWVzIGFuZCBzb3VyY2VzLiBXaGlsZSBzb3VyY2UgbWFwc1xuICAgICAgLy8gYXJlIGludGVuZGVkIHRvIGJlIGNvbXByZXNzZWQgYW5kIGRlZHVwbGljYXRlZCwgdGhlIFR5cGVTY3JpcHQgY29tcGlsZXJcbiAgICAgIC8vIHNvbWV0aW1lcyBnZW5lcmF0ZXMgc291cmNlIG1hcHMgd2l0aCBkdXBsaWNhdGVzIGluIHRoZW0uIFNlZSBHaXRodWIgaXNzdWVcbiAgICAgIC8vICM3MiBhbmQgYnVnemlsLmxhLzg4OTQ5Mi5cbiAgICAgIHRoYXQuX25hbWVzID0gQXJyYXlTZXQuZnJvbUFycmF5KG5hbWVzLm1hcChTdHJpbmcpLCB0cnVlKTtcbiAgICAgIHRoYXQuX3NvdXJjZXMgPSBBcnJheVNldC5mcm9tQXJyYXkoc291cmNlcywgdHJ1ZSk7XG5cbiAgICAgIHRoYXQuX2Fic29sdXRlU291cmNlcyA9IHRoYXQuX3NvdXJjZXMudG9BcnJheSgpLm1hcChmdW5jdGlvbihzKSB7XG4gICAgICAgIHJldHVybiB1dGlsLmNvbXB1dGVTb3VyY2VVUkwoc291cmNlUm9vdCwgcywgYVNvdXJjZU1hcFVSTCk7XG4gICAgICB9KTtcblxuICAgICAgdGhhdC5zb3VyY2VSb290ID0gc291cmNlUm9vdDtcbiAgICAgIHRoYXQuc291cmNlc0NvbnRlbnQgPSBzb3VyY2VzQ29udGVudDtcbiAgICAgIHRoYXQuX21hcHBpbmdzID0gbWFwcGluZ3M7XG4gICAgICB0aGF0Ll9zb3VyY2VNYXBVUkwgPSBhU291cmNlTWFwVVJMO1xuICAgICAgdGhhdC5maWxlID0gZmlsZTtcblxuICAgICAgdGhhdC5fY29tcHV0ZWRDb2x1bW5TcGFucyA9IGZhbHNlO1xuICAgICAgdGhhdC5fbWFwcGluZ3NQdHIgPSAwO1xuICAgICAgdGhhdC5fd2FzbSA9IG51bGw7XG5cbiAgICAgIHJldHVybiB3YXNtKCkudGhlbih3ID0+IHtcbiAgICAgICAgdGhhdC5fd2FzbSA9IHc7XG4gICAgICAgIHJldHVybiB0aGF0O1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXRpbGl0eSBmdW5jdGlvbiB0byBmaW5kIHRoZSBpbmRleCBvZiBhIHNvdXJjZS4gIFJldHVybnMgLTEgaWYgbm90XG4gICAqIGZvdW5kLlxuICAgKi9cbiAgX2ZpbmRTb3VyY2VJbmRleChhU291cmNlKSB7XG4gICAgbGV0IHJlbGF0aXZlU291cmNlID0gYVNvdXJjZTtcbiAgICBpZiAodGhpcy5zb3VyY2VSb290ICE9IG51bGwpIHtcbiAgICAgIHJlbGF0aXZlU291cmNlID0gdXRpbC5yZWxhdGl2ZSh0aGlzLnNvdXJjZVJvb3QsIHJlbGF0aXZlU291cmNlKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fc291cmNlcy5oYXMocmVsYXRpdmVTb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc291cmNlcy5pbmRleE9mKHJlbGF0aXZlU291cmNlKTtcbiAgICB9XG5cbiAgICAvLyBNYXliZSBhU291cmNlIGlzIGFuIGFic29sdXRlIFVSTCBhcyByZXR1cm5lZCBieSB8c291cmNlc3wuICBJblxuICAgIC8vIHRoaXMgY2FzZSB3ZSBjYW4ndCBzaW1wbHkgdW5kbyB0aGUgdHJhbnNmb3JtLlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fYWJzb2x1dGVTb3VyY2VzLmxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAodGhpcy5fYWJzb2x1dGVTb3VyY2VzW2ldID09IGFTb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIEJhc2ljU291cmNlTWFwQ29uc3VtZXIgZnJvbSBhIFNvdXJjZU1hcEdlbmVyYXRvci5cbiAgICpcbiAgICogQHBhcmFtIFNvdXJjZU1hcEdlbmVyYXRvciBhU291cmNlTWFwXG4gICAqICAgICAgICBUaGUgc291cmNlIG1hcCB0aGF0IHdpbGwgYmUgY29uc3VtZWQuXG4gICAqIEBwYXJhbSBTdHJpbmcgYVNvdXJjZU1hcFVSTFxuICAgKiAgICAgICAgVGhlIFVSTCBhdCB3aGljaCB0aGUgc291cmNlIG1hcCBjYW4gYmUgZm91bmQgKG9wdGlvbmFsKVxuICAgKiBAcmV0dXJucyBCYXNpY1NvdXJjZU1hcENvbnN1bWVyXG4gICAqL1xuICBzdGF0aWMgZnJvbVNvdXJjZU1hcChhU291cmNlTWFwLCBhU291cmNlTWFwVVJMKSB7XG4gICAgcmV0dXJuIG5ldyBCYXNpY1NvdXJjZU1hcENvbnN1bWVyKGFTb3VyY2VNYXAudG9TdHJpbmcoKSk7XG4gIH1cblxuICBnZXQgc291cmNlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fYWJzb2x1dGVTb3VyY2VzLnNsaWNlKCk7XG4gIH1cblxuICBfZ2V0TWFwcGluZ3NQdHIoKSB7XG4gICAgaWYgKHRoaXMuX21hcHBpbmdzUHRyID09PSAwKSB7XG4gICAgICB0aGlzLl9wYXJzZU1hcHBpbmdzKHRoaXMuX21hcHBpbmdzLCB0aGlzLnNvdXJjZVJvb3QpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9tYXBwaW5nc1B0cjtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSB0aGUgbWFwcGluZ3MgaW4gYSBzdHJpbmcgaW4gdG8gYSBkYXRhIHN0cnVjdHVyZSB3aGljaCB3ZSBjYW4gZWFzaWx5XG4gICAqIHF1ZXJ5ICh0aGUgb3JkZXJlZCBhcnJheXMgaW4gdGhlIGB0aGlzLl9fZ2VuZXJhdGVkTWFwcGluZ3NgIGFuZFxuICAgKiBgdGhpcy5fX29yaWdpbmFsTWFwcGluZ3NgIHByb3BlcnRpZXMpLlxuICAgKi9cbiAgX3BhcnNlTWFwcGluZ3MoYVN0ciwgYVNvdXJjZVJvb3QpIHtcbiAgICBjb25zdCBzaXplID0gYVN0ci5sZW5ndGg7XG5cbiAgICBjb25zdCBtYXBwaW5nc0J1ZlB0ciA9IHRoaXMuX3dhc20uZXhwb3J0cy5hbGxvY2F0ZV9tYXBwaW5ncyhzaXplKTtcbiAgICBjb25zdCBtYXBwaW5nc0J1ZiA9IG5ldyBVaW50OEFycmF5KHRoaXMuX3dhc20uZXhwb3J0cy5tZW1vcnkuYnVmZmVyLCBtYXBwaW5nc0J1ZlB0ciwgc2l6ZSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICAgIG1hcHBpbmdzQnVmW2ldID0gYVN0ci5jaGFyQ29kZUF0KGkpO1xuICAgIH1cblxuICAgIGNvbnN0IG1hcHBpbmdzUHRyID0gdGhpcy5fd2FzbS5leHBvcnRzLnBhcnNlX21hcHBpbmdzKG1hcHBpbmdzQnVmUHRyKTtcblxuICAgIGlmICghbWFwcGluZ3NQdHIpIHtcbiAgICAgIGNvbnN0IGVycm9yID0gdGhpcy5fd2FzbS5leHBvcnRzLmdldF9sYXN0X2Vycm9yKCk7XG4gICAgICBsZXQgbXNnID0gYEVycm9yIHBhcnNpbmcgbWFwcGluZ3MgKGNvZGUgJHtlcnJvcn0pOiBgO1xuXG4gICAgICAvLyBYWFg6IGtlZXAgdGhlc2UgZXJyb3IgY29kZXMgaW4gc3luYyB3aXRoIGBmaXR6Z2VuL3NvdXJjZS1tYXAtbWFwcGluZ3NgLlxuICAgICAgc3dpdGNoIChlcnJvcikge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgbXNnICs9IFwidGhlIG1hcHBpbmdzIGNvbnRhaW5lZCBhIG5lZ2F0aXZlIGxpbmUsIGNvbHVtbiwgc291cmNlIGluZGV4LCBvciBuYW1lIGluZGV4XCI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICBtc2cgKz0gXCJ0aGUgbWFwcGluZ3MgY29udGFpbmVkIGEgbnVtYmVyIGxhcmdlciB0aGFuIDIqKjMyXCI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICBtc2cgKz0gXCJyZWFjaGVkIEVPRiB3aGlsZSBpbiB0aGUgbWlkZGxlIG9mIHBhcnNpbmcgYSBWTFFcIjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIG1zZyArPSBcImludmFsaWQgYmFzZSA2NCBjaGFyYWN0ZXIgd2hpbGUgcGFyc2luZyBhIFZMUVwiO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIG1zZyArPSBcInVua25vd24gZXJyb3IgY29kZVwiO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICB9XG5cbiAgICB0aGlzLl9tYXBwaW5nc1B0ciA9IG1hcHBpbmdzUHRyO1xuICB9XG5cbiAgZWFjaE1hcHBpbmcoYUNhbGxiYWNrLCBhQ29udGV4dCwgYU9yZGVyKSB7XG4gICAgY29uc3QgY29udGV4dCA9IGFDb250ZXh0IHx8IG51bGw7XG4gICAgY29uc3Qgb3JkZXIgPSBhT3JkZXIgfHwgU291cmNlTWFwQ29uc3VtZXIuR0VORVJBVEVEX09SREVSO1xuICAgIGNvbnN0IHNvdXJjZVJvb3QgPSB0aGlzLnNvdXJjZVJvb3Q7XG5cbiAgICB0aGlzLl93YXNtLndpdGhNYXBwaW5nQ2FsbGJhY2soXG4gICAgICBtYXBwaW5nID0+IHtcbiAgICAgICAgaWYgKG1hcHBpbmcuc291cmNlICE9PSBudWxsKSB7XG4gICAgICAgICAgbWFwcGluZy5zb3VyY2UgPSB0aGlzLl9zb3VyY2VzLmF0KG1hcHBpbmcuc291cmNlKTtcbiAgICAgICAgICBtYXBwaW5nLnNvdXJjZSA9IHV0aWwuY29tcHV0ZVNvdXJjZVVSTChzb3VyY2VSb290LCBtYXBwaW5nLnNvdXJjZSwgdGhpcy5fc291cmNlTWFwVVJMKTtcblxuICAgICAgICAgIGlmIChtYXBwaW5nLm5hbWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIG1hcHBpbmcubmFtZSA9IHRoaXMuX25hbWVzLmF0KG1hcHBpbmcubmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYUNhbGxiYWNrLmNhbGwoY29udGV4dCwgbWFwcGluZyk7XG4gICAgICB9LFxuICAgICAgKCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKG9yZGVyKSB7XG4gICAgICAgIGNhc2UgU291cmNlTWFwQ29uc3VtZXIuR0VORVJBVEVEX09SREVSOlxuICAgICAgICAgIHRoaXMuX3dhc20uZXhwb3J0cy5ieV9nZW5lcmF0ZWRfbG9jYXRpb24odGhpcy5fZ2V0TWFwcGluZ3NQdHIoKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU291cmNlTWFwQ29uc3VtZXIuT1JJR0lOQUxfT1JERVI6XG4gICAgICAgICAgdGhpcy5fd2FzbS5leHBvcnRzLmJ5X29yaWdpbmFsX2xvY2F0aW9uKHRoaXMuX2dldE1hcHBpbmdzUHRyKCkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gb3JkZXIgb2YgaXRlcmF0aW9uLlwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG4gIH1cblxuICBhbGxHZW5lcmF0ZWRQb3NpdGlvbnNGb3IoYUFyZ3MpIHtcbiAgICBsZXQgc291cmNlID0gdXRpbC5nZXRBcmcoYUFyZ3MsIFwic291cmNlXCIpO1xuICAgIGNvbnN0IG9yaWdpbmFsTGluZSA9IHV0aWwuZ2V0QXJnKGFBcmdzLCBcImxpbmVcIik7XG4gICAgY29uc3Qgb3JpZ2luYWxDb2x1bW4gPSBhQXJncy5jb2x1bW4gfHwgMDtcblxuICAgIHNvdXJjZSA9IHRoaXMuX2ZpbmRTb3VyY2VJbmRleChzb3VyY2UpO1xuICAgIGlmIChzb3VyY2UgPCAwKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgaWYgKG9yaWdpbmFsTGluZSA8IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkxpbmUgbnVtYmVycyBtdXN0IGJlID49IDFcIik7XG4gICAgfVxuXG4gICAgaWYgKG9yaWdpbmFsQ29sdW1uIDwgMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29sdW1uIG51bWJlcnMgbXVzdCBiZSA+PSAwXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IG1hcHBpbmdzID0gW107XG5cbiAgICB0aGlzLl93YXNtLndpdGhNYXBwaW5nQ2FsbGJhY2soXG4gICAgICBtID0+IHtcbiAgICAgICAgbGV0IGxhc3RDb2x1bW4gPSBtLmxhc3RHZW5lcmF0ZWRDb2x1bW47XG4gICAgICAgIGlmICh0aGlzLl9jb21wdXRlZENvbHVtblNwYW5zICYmIGxhc3RDb2x1bW4gPT09IG51bGwpIHtcbiAgICAgICAgICBsYXN0Q29sdW1uID0gSW5maW5pdHk7XG4gICAgICAgIH1cbiAgICAgICAgbWFwcGluZ3MucHVzaCh7XG4gICAgICAgICAgbGluZTogbS5nZW5lcmF0ZWRMaW5lLFxuICAgICAgICAgIGNvbHVtbjogbS5nZW5lcmF0ZWRDb2x1bW4sXG4gICAgICAgICAgbGFzdENvbHVtbixcbiAgICAgICAgfSk7XG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIHRoaXMuX3dhc20uZXhwb3J0cy5hbGxfZ2VuZXJhdGVkX2xvY2F0aW9uc19mb3IoXG4gICAgICAgICAgdGhpcy5fZ2V0TWFwcGluZ3NQdHIoKSxcbiAgICAgICAgICBzb3VyY2UsXG4gICAgICAgICAgb3JpZ2luYWxMaW5lIC0gMSxcbiAgICAgICAgICBcImNvbHVtblwiIGluIGFBcmdzLFxuICAgICAgICAgIG9yaWdpbmFsQ29sdW1uXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIHJldHVybiBtYXBwaW5ncztcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuX21hcHBpbmdzUHRyICE9PSAwKSB7XG4gICAgICB0aGlzLl93YXNtLmV4cG9ydHMuZnJlZV9tYXBwaW5ncyh0aGlzLl9tYXBwaW5nc1B0cik7XG4gICAgICB0aGlzLl9tYXBwaW5nc1B0ciA9IDA7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGUgdGhlIGxhc3QgY29sdW1uIGZvciBlYWNoIGdlbmVyYXRlZCBtYXBwaW5nLiBUaGUgbGFzdCBjb2x1bW4gaXNcbiAgICogaW5jbHVzaXZlLlxuICAgKi9cbiAgY29tcHV0ZUNvbHVtblNwYW5zKCkge1xuICAgIGlmICh0aGlzLl9jb21wdXRlZENvbHVtblNwYW5zKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fd2FzbS5leHBvcnRzLmNvbXB1dGVfY29sdW1uX3NwYW5zKHRoaXMuX2dldE1hcHBpbmdzUHRyKCkpO1xuICAgIHRoaXMuX2NvbXB1dGVkQ29sdW1uU3BhbnMgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG9yaWdpbmFsIHNvdXJjZSwgbGluZSwgYW5kIGNvbHVtbiBpbmZvcm1hdGlvbiBmb3IgdGhlIGdlbmVyYXRlZFxuICAgKiBzb3VyY2UncyBsaW5lIGFuZCBjb2x1bW4gcG9zaXRpb25zIHByb3ZpZGVkLiBUaGUgb25seSBhcmd1bWVudCBpcyBhbiBvYmplY3RcbiAgICogd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gICAqXG4gICAqICAgLSBsaW5lOiBUaGUgbGluZSBudW1iZXIgaW4gdGhlIGdlbmVyYXRlZCBzb3VyY2UuICBUaGUgbGluZSBudW1iZXJcbiAgICogICAgIGlzIDEtYmFzZWQuXG4gICAqICAgLSBjb2x1bW46IFRoZSBjb2x1bW4gbnVtYmVyIGluIHRoZSBnZW5lcmF0ZWQgc291cmNlLiAgVGhlIGNvbHVtblxuICAgKiAgICAgbnVtYmVyIGlzIDAtYmFzZWQuXG4gICAqICAgLSBiaWFzOiBFaXRoZXIgJ1NvdXJjZU1hcENvbnN1bWVyLkdSRUFURVNUX0xPV0VSX0JPVU5EJyBvclxuICAgKiAgICAgJ1NvdXJjZU1hcENvbnN1bWVyLkxFQVNUX1VQUEVSX0JPVU5EJy4gU3BlY2lmaWVzIHdoZXRoZXIgdG8gcmV0dXJuIHRoZVxuICAgKiAgICAgY2xvc2VzdCBlbGVtZW50IHRoYXQgaXMgc21hbGxlciB0aGFuIG9yIGdyZWF0ZXIgdGhhbiB0aGUgb25lIHdlIGFyZVxuICAgKiAgICAgc2VhcmNoaW5nIGZvciwgcmVzcGVjdGl2ZWx5LCBpZiB0aGUgZXhhY3QgZWxlbWVudCBjYW5ub3QgYmUgZm91bmQuXG4gICAqICAgICBEZWZhdWx0cyB0byAnU291cmNlTWFwQ29uc3VtZXIuR1JFQVRFU1RfTE9XRVJfQk9VTkQnLlxuICAgKlxuICAgKiBhbmQgYW4gb2JqZWN0IGlzIHJldHVybmVkIHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICAgKlxuICAgKiAgIC0gc291cmNlOiBUaGUgb3JpZ2luYWwgc291cmNlIGZpbGUsIG9yIG51bGwuXG4gICAqICAgLSBsaW5lOiBUaGUgbGluZSBudW1iZXIgaW4gdGhlIG9yaWdpbmFsIHNvdXJjZSwgb3IgbnVsbC4gIFRoZVxuICAgKiAgICAgbGluZSBudW1iZXIgaXMgMS1iYXNlZC5cbiAgICogICAtIGNvbHVtbjogVGhlIGNvbHVtbiBudW1iZXIgaW4gdGhlIG9yaWdpbmFsIHNvdXJjZSwgb3IgbnVsbC4gIFRoZVxuICAgKiAgICAgY29sdW1uIG51bWJlciBpcyAwLWJhc2VkLlxuICAgKiAgIC0gbmFtZTogVGhlIG9yaWdpbmFsIGlkZW50aWZpZXIsIG9yIG51bGwuXG4gICAqL1xuICBvcmlnaW5hbFBvc2l0aW9uRm9yKGFBcmdzKSB7XG4gICAgY29uc3QgbmVlZGxlID0ge1xuICAgICAgZ2VuZXJhdGVkTGluZTogdXRpbC5nZXRBcmcoYUFyZ3MsIFwibGluZVwiKSxcbiAgICAgIGdlbmVyYXRlZENvbHVtbjogdXRpbC5nZXRBcmcoYUFyZ3MsIFwiY29sdW1uXCIpXG4gICAgfTtcblxuICAgIGlmIChuZWVkbGUuZ2VuZXJhdGVkTGluZSA8IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkxpbmUgbnVtYmVycyBtdXN0IGJlID49IDFcIik7XG4gICAgfVxuXG4gICAgaWYgKG5lZWRsZS5nZW5lcmF0ZWRDb2x1bW4gPCAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb2x1bW4gbnVtYmVycyBtdXN0IGJlID49IDBcIik7XG4gICAgfVxuXG4gICAgbGV0IGJpYXMgPSB1dGlsLmdldEFyZyhhQXJncywgXCJiaWFzXCIsIFNvdXJjZU1hcENvbnN1bWVyLkdSRUFURVNUX0xPV0VSX0JPVU5EKTtcbiAgICBpZiAoYmlhcyA9PSBudWxsKSB7XG4gICAgICBiaWFzID0gU291cmNlTWFwQ29uc3VtZXIuR1JFQVRFU1RfTE9XRVJfQk9VTkQ7XG4gICAgfVxuXG4gICAgbGV0IG1hcHBpbmc7XG4gICAgdGhpcy5fd2FzbS53aXRoTWFwcGluZ0NhbGxiYWNrKG0gPT4gbWFwcGluZyA9IG0sICgpID0+IHtcbiAgICAgIHRoaXMuX3dhc20uZXhwb3J0cy5vcmlnaW5hbF9sb2NhdGlvbl9mb3IoXG4gICAgICAgIHRoaXMuX2dldE1hcHBpbmdzUHRyKCksXG4gICAgICAgIG5lZWRsZS5nZW5lcmF0ZWRMaW5lIC0gMSxcbiAgICAgICAgbmVlZGxlLmdlbmVyYXRlZENvbHVtbixcbiAgICAgICAgYmlhc1xuICAgICAgKTtcbiAgICB9KTtcblxuICAgIGlmIChtYXBwaW5nKSB7XG4gICAgICBpZiAobWFwcGluZy5nZW5lcmF0ZWRMaW5lID09PSBuZWVkbGUuZ2VuZXJhdGVkTGluZSkge1xuICAgICAgICBsZXQgc291cmNlID0gdXRpbC5nZXRBcmcobWFwcGluZywgXCJzb3VyY2VcIiwgbnVsbCk7XG4gICAgICAgIGlmIChzb3VyY2UgIT09IG51bGwpIHtcbiAgICAgICAgICBzb3VyY2UgPSB0aGlzLl9zb3VyY2VzLmF0KHNvdXJjZSk7XG4gICAgICAgICAgc291cmNlID0gdXRpbC5jb21wdXRlU291cmNlVVJMKHRoaXMuc291cmNlUm9vdCwgc291cmNlLCB0aGlzLl9zb3VyY2VNYXBVUkwpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG5hbWUgPSB1dGlsLmdldEFyZyhtYXBwaW5nLCBcIm5hbWVcIiwgbnVsbCk7XG4gICAgICAgIGlmIChuYW1lICE9PSBudWxsKSB7XG4gICAgICAgICAgbmFtZSA9IHRoaXMuX25hbWVzLmF0KG5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzb3VyY2UsXG4gICAgICAgICAgbGluZTogdXRpbC5nZXRBcmcobWFwcGluZywgXCJvcmlnaW5hbExpbmVcIiwgbnVsbCksXG4gICAgICAgICAgY29sdW1uOiB1dGlsLmdldEFyZyhtYXBwaW5nLCBcIm9yaWdpbmFsQ29sdW1uXCIsIG51bGwpLFxuICAgICAgICAgIG5hbWVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgc291cmNlOiBudWxsLFxuICAgICAgbGluZTogbnVsbCxcbiAgICAgIGNvbHVtbjogbnVsbCxcbiAgICAgIG5hbWU6IG51bGxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0cnVlIGlmIHdlIGhhdmUgdGhlIHNvdXJjZSBjb250ZW50IGZvciBldmVyeSBzb3VyY2UgaW4gdGhlIHNvdXJjZVxuICAgKiBtYXAsIGZhbHNlIG90aGVyd2lzZS5cbiAgICovXG4gIGhhc0NvbnRlbnRzT2ZBbGxTb3VyY2VzKCkge1xuICAgIGlmICghdGhpcy5zb3VyY2VzQ29udGVudCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zb3VyY2VzQ29udGVudC5sZW5ndGggPj0gdGhpcy5fc291cmNlcy5zaXplKCkgJiZcbiAgICAgICF0aGlzLnNvdXJjZXNDb250ZW50LnNvbWUoZnVuY3Rpb24oc2MpIHsgcmV0dXJuIHNjID09IG51bGw7IH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG9yaWdpbmFsIHNvdXJjZSBjb250ZW50LiBUaGUgb25seSBhcmd1bWVudCBpcyB0aGUgdXJsIG9mIHRoZVxuICAgKiBvcmlnaW5hbCBzb3VyY2UgZmlsZS4gUmV0dXJucyBudWxsIGlmIG5vIG9yaWdpbmFsIHNvdXJjZSBjb250ZW50IGlzXG4gICAqIGF2YWlsYWJsZS5cbiAgICovXG4gIHNvdXJjZUNvbnRlbnRGb3IoYVNvdXJjZSwgbnVsbE9uTWlzc2luZykge1xuICAgIGlmICghdGhpcy5zb3VyY2VzQ29udGVudCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgaW5kZXggPSB0aGlzLl9maW5kU291cmNlSW5kZXgoYVNvdXJjZSk7XG4gICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgIHJldHVybiB0aGlzLnNvdXJjZXNDb250ZW50W2luZGV4XTtcbiAgICB9XG5cbiAgICBsZXQgcmVsYXRpdmVTb3VyY2UgPSBhU291cmNlO1xuICAgIGlmICh0aGlzLnNvdXJjZVJvb3QgIT0gbnVsbCkge1xuICAgICAgcmVsYXRpdmVTb3VyY2UgPSB1dGlsLnJlbGF0aXZlKHRoaXMuc291cmNlUm9vdCwgcmVsYXRpdmVTb3VyY2UpO1xuICAgIH1cblxuICAgIGxldCB1cmw7XG4gICAgaWYgKHRoaXMuc291cmNlUm9vdCAhPSBudWxsXG4gICAgICAgICYmICh1cmwgPSB1dGlsLnVybFBhcnNlKHRoaXMuc291cmNlUm9vdCkpKSB7XG4gICAgICAvLyBYWFg6IGZpbGU6Ly8gVVJJcyBhbmQgYWJzb2x1dGUgcGF0aHMgbGVhZCB0byB1bmV4cGVjdGVkIGJlaGF2aW9yIGZvclxuICAgICAgLy8gbWFueSB1c2Vycy4gV2UgY2FuIGhlbHAgdGhlbSBvdXQgd2hlbiB0aGV5IGV4cGVjdCBmaWxlOi8vIFVSSXMgdG9cbiAgICAgIC8vIGJlaGF2ZSBsaWtlIGl0IHdvdWxkIGlmIHRoZXkgd2VyZSBydW5uaW5nIGEgbG9jYWwgSFRUUCBzZXJ2ZXIuIFNlZVxuICAgICAgLy8gaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9ODg1NTk3LlxuICAgICAgY29uc3QgZmlsZVVyaUFic1BhdGggPSByZWxhdGl2ZVNvdXJjZS5yZXBsYWNlKC9eZmlsZTpcXC9cXC8vLCBcIlwiKTtcbiAgICAgIGlmICh1cmwuc2NoZW1lID09IFwiZmlsZVwiXG4gICAgICAgICAgJiYgdGhpcy5fc291cmNlcy5oYXMoZmlsZVVyaUFic1BhdGgpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNvdXJjZXNDb250ZW50W3RoaXMuX3NvdXJjZXMuaW5kZXhPZihmaWxlVXJpQWJzUGF0aCldO1xuICAgICAgfVxuXG4gICAgICBpZiAoKCF1cmwucGF0aCB8fCB1cmwucGF0aCA9PSBcIi9cIilcbiAgICAgICAgICAmJiB0aGlzLl9zb3VyY2VzLmhhcyhcIi9cIiArIHJlbGF0aXZlU291cmNlKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zb3VyY2VzQ29udGVudFt0aGlzLl9zb3VyY2VzLmluZGV4T2YoXCIvXCIgKyByZWxhdGl2ZVNvdXJjZSldO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCByZWN1cnNpdmVseSBmcm9tXG4gICAgLy8gSW5kZXhlZFNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5zb3VyY2VDb250ZW50Rm9yLiBJbiB0aGF0IGNhc2UsIHdlXG4gICAgLy8gZG9uJ3Qgd2FudCB0byB0aHJvdyBpZiB3ZSBjYW4ndCBmaW5kIHRoZSBzb3VyY2UgLSB3ZSBqdXN0IHdhbnQgdG9cbiAgICAvLyByZXR1cm4gbnVsbCwgc28gd2UgcHJvdmlkZSBhIGZsYWcgdG8gZXhpdCBncmFjZWZ1bGx5LlxuICAgIGlmIChudWxsT25NaXNzaW5nKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1wiJyArIHJlbGF0aXZlU291cmNlICsgJ1wiIGlzIG5vdCBpbiB0aGUgU291cmNlTWFwLicpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGdlbmVyYXRlZCBsaW5lIGFuZCBjb2x1bW4gaW5mb3JtYXRpb24gZm9yIHRoZSBvcmlnaW5hbCBzb3VyY2UsXG4gICAqIGxpbmUsIGFuZCBjb2x1bW4gcG9zaXRpb25zIHByb3ZpZGVkLiBUaGUgb25seSBhcmd1bWVudCBpcyBhbiBvYmplY3Qgd2l0aFxuICAgKiB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gICAqXG4gICAqICAgLSBzb3VyY2U6IFRoZSBmaWxlbmFtZSBvZiB0aGUgb3JpZ2luYWwgc291cmNlLlxuICAgKiAgIC0gbGluZTogVGhlIGxpbmUgbnVtYmVyIGluIHRoZSBvcmlnaW5hbCBzb3VyY2UuICBUaGUgbGluZSBudW1iZXJcbiAgICogICAgIGlzIDEtYmFzZWQuXG4gICAqICAgLSBjb2x1bW46IFRoZSBjb2x1bW4gbnVtYmVyIGluIHRoZSBvcmlnaW5hbCBzb3VyY2UuICBUaGUgY29sdW1uXG4gICAqICAgICBudW1iZXIgaXMgMC1iYXNlZC5cbiAgICogICAtIGJpYXM6IEVpdGhlciAnU291cmNlTWFwQ29uc3VtZXIuR1JFQVRFU1RfTE9XRVJfQk9VTkQnIG9yXG4gICAqICAgICAnU291cmNlTWFwQ29uc3VtZXIuTEVBU1RfVVBQRVJfQk9VTkQnLiBTcGVjaWZpZXMgd2hldGhlciB0byByZXR1cm4gdGhlXG4gICAqICAgICBjbG9zZXN0IGVsZW1lbnQgdGhhdCBpcyBzbWFsbGVyIHRoYW4gb3IgZ3JlYXRlciB0aGFuIHRoZSBvbmUgd2UgYXJlXG4gICAqICAgICBzZWFyY2hpbmcgZm9yLCByZXNwZWN0aXZlbHksIGlmIHRoZSBleGFjdCBlbGVtZW50IGNhbm5vdCBiZSBmb3VuZC5cbiAgICogICAgIERlZmF1bHRzIHRvICdTb3VyY2VNYXBDb25zdW1lci5HUkVBVEVTVF9MT1dFUl9CT1VORCcuXG4gICAqXG4gICAqIGFuZCBhbiBvYmplY3QgaXMgcmV0dXJuZWQgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gICAqXG4gICAqICAgLSBsaW5lOiBUaGUgbGluZSBudW1iZXIgaW4gdGhlIGdlbmVyYXRlZCBzb3VyY2UsIG9yIG51bGwuICBUaGVcbiAgICogICAgIGxpbmUgbnVtYmVyIGlzIDEtYmFzZWQuXG4gICAqICAgLSBjb2x1bW46IFRoZSBjb2x1bW4gbnVtYmVyIGluIHRoZSBnZW5lcmF0ZWQgc291cmNlLCBvciBudWxsLlxuICAgKiAgICAgVGhlIGNvbHVtbiBudW1iZXIgaXMgMC1iYXNlZC5cbiAgICovXG4gIGdlbmVyYXRlZFBvc2l0aW9uRm9yKGFBcmdzKSB7XG4gICAgbGV0IHNvdXJjZSA9IHV0aWwuZ2V0QXJnKGFBcmdzLCBcInNvdXJjZVwiKTtcbiAgICBzb3VyY2UgPSB0aGlzLl9maW5kU291cmNlSW5kZXgoc291cmNlKTtcbiAgICBpZiAoc291cmNlIDwgMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGluZTogbnVsbCxcbiAgICAgICAgY29sdW1uOiBudWxsLFxuICAgICAgICBsYXN0Q29sdW1uOiBudWxsXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IG5lZWRsZSA9IHtcbiAgICAgIHNvdXJjZSxcbiAgICAgIG9yaWdpbmFsTGluZTogdXRpbC5nZXRBcmcoYUFyZ3MsIFwibGluZVwiKSxcbiAgICAgIG9yaWdpbmFsQ29sdW1uOiB1dGlsLmdldEFyZyhhQXJncywgXCJjb2x1bW5cIilcbiAgICB9O1xuXG4gICAgaWYgKG5lZWRsZS5vcmlnaW5hbExpbmUgPCAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMaW5lIG51bWJlcnMgbXVzdCBiZSA+PSAxXCIpO1xuICAgIH1cblxuICAgIGlmIChuZWVkbGUub3JpZ2luYWxDb2x1bW4gPCAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb2x1bW4gbnVtYmVycyBtdXN0IGJlID49IDBcIik7XG4gICAgfVxuXG4gICAgbGV0IGJpYXMgPSB1dGlsLmdldEFyZyhhQXJncywgXCJiaWFzXCIsIFNvdXJjZU1hcENvbnN1bWVyLkdSRUFURVNUX0xPV0VSX0JPVU5EKTtcbiAgICBpZiAoYmlhcyA9PSBudWxsKSB7XG4gICAgICBiaWFzID0gU291cmNlTWFwQ29uc3VtZXIuR1JFQVRFU1RfTE9XRVJfQk9VTkQ7XG4gICAgfVxuXG4gICAgbGV0IG1hcHBpbmc7XG4gICAgdGhpcy5fd2FzbS53aXRoTWFwcGluZ0NhbGxiYWNrKG0gPT4gbWFwcGluZyA9IG0sICgpID0+IHtcbiAgICAgIHRoaXMuX3dhc20uZXhwb3J0cy5nZW5lcmF0ZWRfbG9jYXRpb25fZm9yKFxuICAgICAgICB0aGlzLl9nZXRNYXBwaW5nc1B0cigpLFxuICAgICAgICBuZWVkbGUuc291cmNlLFxuICAgICAgICBuZWVkbGUub3JpZ2luYWxMaW5lIC0gMSxcbiAgICAgICAgbmVlZGxlLm9yaWdpbmFsQ29sdW1uLFxuICAgICAgICBiaWFzXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgaWYgKG1hcHBpbmcpIHtcbiAgICAgIGlmIChtYXBwaW5nLnNvdXJjZSA9PT0gbmVlZGxlLnNvdXJjZSkge1xuICAgICAgICBsZXQgbGFzdENvbHVtbiA9IG1hcHBpbmcubGFzdEdlbmVyYXRlZENvbHVtbjtcbiAgICAgICAgaWYgKHRoaXMuX2NvbXB1dGVkQ29sdW1uU3BhbnMgJiYgbGFzdENvbHVtbiA9PT0gbnVsbCkge1xuICAgICAgICAgIGxhc3RDb2x1bW4gPSBJbmZpbml0eTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxpbmU6IHV0aWwuZ2V0QXJnKG1hcHBpbmcsIFwiZ2VuZXJhdGVkTGluZVwiLCBudWxsKSxcbiAgICAgICAgICBjb2x1bW46IHV0aWwuZ2V0QXJnKG1hcHBpbmcsIFwiZ2VuZXJhdGVkQ29sdW1uXCIsIG51bGwpLFxuICAgICAgICAgIGxhc3RDb2x1bW4sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGxpbmU6IG51bGwsXG4gICAgICBjb2x1bW46IG51bGwsXG4gICAgICBsYXN0Q29sdW1uOiBudWxsXG4gICAgfTtcbiAgfVxufVxuXG5CYXNpY1NvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5jb25zdW1lciA9IFNvdXJjZU1hcENvbnN1bWVyO1xuZXhwb3J0cy5CYXNpY1NvdXJjZU1hcENvbnN1bWVyID0gQmFzaWNTb3VyY2VNYXBDb25zdW1lcjtcblxuLyoqXG4gKiBBbiBJbmRleGVkU291cmNlTWFwQ29uc3VtZXIgaW5zdGFuY2UgcmVwcmVzZW50cyBhIHBhcnNlZCBzb3VyY2UgbWFwIHdoaWNoXG4gKiB3ZSBjYW4gcXVlcnkgZm9yIGluZm9ybWF0aW9uLiBJdCBkaWZmZXJzIGZyb20gQmFzaWNTb3VyY2VNYXBDb25zdW1lciBpblxuICogdGhhdCBpdCB0YWtlcyBcImluZGV4ZWRcIiBzb3VyY2UgbWFwcyAoaS5lLiBvbmVzIHdpdGggYSBcInNlY3Rpb25zXCIgZmllbGQpIGFzXG4gKiBpbnB1dC5cbiAqXG4gKiBUaGUgZmlyc3QgcGFyYW1ldGVyIGlzIGEgcmF3IHNvdXJjZSBtYXAgKGVpdGhlciBhcyBhIEpTT04gc3RyaW5nLCBvciBhbHJlYWR5XG4gKiBwYXJzZWQgdG8gYW4gb2JqZWN0KS4gQWNjb3JkaW5nIHRvIHRoZSBzcGVjIGZvciBpbmRleGVkIHNvdXJjZSBtYXBzLCB0aGV5XG4gKiBoYXZlIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcbiAqXG4gKiAgIC0gdmVyc2lvbjogV2hpY2ggdmVyc2lvbiBvZiB0aGUgc291cmNlIG1hcCBzcGVjIHRoaXMgbWFwIGlzIGZvbGxvd2luZy5cbiAqICAgLSBmaWxlOiBPcHRpb25hbC4gVGhlIGdlbmVyYXRlZCBmaWxlIHRoaXMgc291cmNlIG1hcCBpcyBhc3NvY2lhdGVkIHdpdGguXG4gKiAgIC0gc2VjdGlvbnM6IEEgbGlzdCBvZiBzZWN0aW9uIGRlZmluaXRpb25zLlxuICpcbiAqIEVhY2ggdmFsdWUgdW5kZXIgdGhlIFwic2VjdGlvbnNcIiBmaWVsZCBoYXMgdHdvIGZpZWxkczpcbiAqICAgLSBvZmZzZXQ6IFRoZSBvZmZzZXQgaW50byB0aGUgb3JpZ2luYWwgc3BlY2lmaWVkIGF0IHdoaWNoIHRoaXMgc2VjdGlvblxuICogICAgICAgYmVnaW5zIHRvIGFwcGx5LCBkZWZpbmVkIGFzIGFuIG9iamVjdCB3aXRoIGEgXCJsaW5lXCIgYW5kIFwiY29sdW1uXCJcbiAqICAgICAgIGZpZWxkLlxuICogICAtIG1hcDogQSBzb3VyY2UgbWFwIGRlZmluaXRpb24uIFRoaXMgc291cmNlIG1hcCBjb3VsZCBhbHNvIGJlIGluZGV4ZWQsXG4gKiAgICAgICBidXQgZG9lc24ndCBoYXZlIHRvIGJlLlxuICpcbiAqIEluc3RlYWQgb2YgdGhlIFwibWFwXCIgZmllbGQsIGl0J3MgYWxzbyBwb3NzaWJsZSB0byBoYXZlIGEgXCJ1cmxcIiBmaWVsZFxuICogc3BlY2lmeWluZyBhIFVSTCB0byByZXRyaWV2ZSBhIHNvdXJjZSBtYXAgZnJvbSwgYnV0IHRoYXQncyBjdXJyZW50bHlcbiAqIHVuc3VwcG9ydGVkLlxuICpcbiAqIEhlcmUncyBhbiBleGFtcGxlIHNvdXJjZSBtYXAsIHRha2VuIGZyb20gdGhlIHNvdXJjZSBtYXAgc3BlY1swXSwgYnV0XG4gKiBtb2RpZmllZCB0byBvbWl0IGEgc2VjdGlvbiB3aGljaCB1c2VzIHRoZSBcInVybFwiIGZpZWxkLlxuICpcbiAqICB7XG4gKiAgICB2ZXJzaW9uIDogMyxcbiAqICAgIGZpbGU6IFwiYXBwLmpzXCIsXG4gKiAgICBzZWN0aW9uczogW3tcbiAqICAgICAgb2Zmc2V0OiB7bGluZToxMDAsIGNvbHVtbjoxMH0sXG4gKiAgICAgIG1hcDoge1xuICogICAgICAgIHZlcnNpb24gOiAzLFxuICogICAgICAgIGZpbGU6IFwic2VjdGlvbi5qc1wiLFxuICogICAgICAgIHNvdXJjZXM6IFtcImZvby5qc1wiLCBcImJhci5qc1wiXSxcbiAqICAgICAgICBuYW1lczogW1wic3JjXCIsIFwibWFwc1wiLCBcImFyZVwiLCBcImZ1blwiXSxcbiAqICAgICAgICBtYXBwaW5nczogXCJBQUFBLEU7O0FCQ0RFO1wiXG4gKiAgICAgIH1cbiAqICAgIH1dLFxuICogIH1cbiAqXG4gKiBUaGUgc2Vjb25kIHBhcmFtZXRlciwgaWYgZ2l2ZW4sIGlzIGEgc3RyaW5nIHdob3NlIHZhbHVlIGlzIHRoZSBVUkxcbiAqIGF0IHdoaWNoIHRoZSBzb3VyY2UgbWFwIHdhcyBmb3VuZC4gIFRoaXMgVVJMIGlzIHVzZWQgdG8gY29tcHV0ZSB0aGVcbiAqIHNvdXJjZXMgYXJyYXkuXG4gKlxuICogWzBdOiBodHRwczovL2RvY3MuZ29vZ2xlLmNvbS9kb2N1bWVudC9kLzFVMVJHQWVoUXdSeXBVVG92RjFLUmxwaU9GemUwYi1fMmdjNmZBSDBLWTBrL2VkaXQjaGVhZGluZz1oLjUzNWVzM3hlcHJndFxuICovXG5jbGFzcyBJbmRleGVkU291cmNlTWFwQ29uc3VtZXIgZXh0ZW5kcyBTb3VyY2VNYXBDb25zdW1lciB7XG4gIGNvbnN0cnVjdG9yKGFTb3VyY2VNYXAsIGFTb3VyY2VNYXBVUkwpIHtcbiAgICByZXR1cm4gc3VwZXIoSU5URVJOQUwpLnRoZW4odGhhdCA9PiB7XG4gICAgICBsZXQgc291cmNlTWFwID0gYVNvdXJjZU1hcDtcbiAgICAgIGlmICh0eXBlb2YgYVNvdXJjZU1hcCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBzb3VyY2VNYXAgPSB1dGlsLnBhcnNlU291cmNlTWFwSW5wdXQoYVNvdXJjZU1hcCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHZlcnNpb24gPSB1dGlsLmdldEFyZyhzb3VyY2VNYXAsIFwidmVyc2lvblwiKTtcbiAgICAgIGNvbnN0IHNlY3Rpb25zID0gdXRpbC5nZXRBcmcoc291cmNlTWFwLCBcInNlY3Rpb25zXCIpO1xuXG4gICAgICBpZiAodmVyc2lvbiAhPSB0aGF0Ll92ZXJzaW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuc3VwcG9ydGVkIHZlcnNpb246IFwiICsgdmVyc2lvbik7XG4gICAgICB9XG5cbiAgICAgIHRoYXQuX3NvdXJjZXMgPSBuZXcgQXJyYXlTZXQoKTtcbiAgICAgIHRoYXQuX25hbWVzID0gbmV3IEFycmF5U2V0KCk7XG4gICAgICB0aGF0Ll9fZ2VuZXJhdGVkTWFwcGluZ3MgPSBudWxsO1xuICAgICAgdGhhdC5fX29yaWdpbmFsTWFwcGluZ3MgPSBudWxsO1xuICAgICAgdGhhdC5fX2dlbmVyYXRlZE1hcHBpbmdzVW5zb3J0ZWQgPSBudWxsO1xuICAgICAgdGhhdC5fX29yaWdpbmFsTWFwcGluZ3NVbnNvcnRlZCA9IG51bGw7XG5cbiAgICAgIGxldCBsYXN0T2Zmc2V0ID0ge1xuICAgICAgICBsaW5lOiAtMSxcbiAgICAgICAgY29sdW1uOiAwXG4gICAgICB9O1xuICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHNlY3Rpb25zLm1hcChzID0+IHtcbiAgICAgICAgaWYgKHMudXJsKSB7XG4gICAgICAgICAgLy8gVGhlIHVybCBmaWVsZCB3aWxsIHJlcXVpcmUgc3VwcG9ydCBmb3IgYXN5bmNocm9uaWNpdHkuXG4gICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhL3NvdXJjZS1tYXAvaXNzdWVzLzE2XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3VwcG9ydCBmb3IgdXJsIGZpZWxkIGluIHNlY3Rpb25zIG5vdCBpbXBsZW1lbnRlZC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0gdXRpbC5nZXRBcmcocywgXCJvZmZzZXRcIik7XG4gICAgICAgIGNvbnN0IG9mZnNldExpbmUgPSB1dGlsLmdldEFyZyhvZmZzZXQsIFwibGluZVwiKTtcbiAgICAgICAgY29uc3Qgb2Zmc2V0Q29sdW1uID0gdXRpbC5nZXRBcmcob2Zmc2V0LCBcImNvbHVtblwiKTtcblxuICAgICAgICBpZiAob2Zmc2V0TGluZSA8IGxhc3RPZmZzZXQubGluZSB8fFxuICAgICAgICAgICAgKG9mZnNldExpbmUgPT09IGxhc3RPZmZzZXQubGluZSAmJiBvZmZzZXRDb2x1bW4gPCBsYXN0T2Zmc2V0LmNvbHVtbikpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWN0aW9uIG9mZnNldHMgbXVzdCBiZSBvcmRlcmVkIGFuZCBub24tb3ZlcmxhcHBpbmcuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGxhc3RPZmZzZXQgPSBvZmZzZXQ7XG5cbiAgICAgICAgY29uc3QgY29ucyA9IG5ldyBTb3VyY2VNYXBDb25zdW1lcih1dGlsLmdldEFyZyhzLCBcIm1hcFwiKSwgYVNvdXJjZU1hcFVSTCk7XG4gICAgICAgIHJldHVybiBjb25zLnRoZW4oY29uc3VtZXIgPT4ge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBnZW5lcmF0ZWRPZmZzZXQ6IHtcbiAgICAgICAgICAgICAgLy8gVGhlIG9mZnNldCBmaWVsZHMgYXJlIDAtYmFzZWQsIGJ1dCB3ZSB1c2UgMS1iYXNlZCBpbmRpY2VzIHdoZW5cbiAgICAgICAgICAgICAgLy8gZW5jb2RpbmcvZGVjb2RpbmcgZnJvbSBWTFEuXG4gICAgICAgICAgICAgIGdlbmVyYXRlZExpbmU6IG9mZnNldExpbmUgKyAxLFxuICAgICAgICAgICAgICBnZW5lcmF0ZWRDb2x1bW46IG9mZnNldENvbHVtbiArIDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25zdW1lclxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgfSkpLnRoZW4ocyA9PiB7XG4gICAgICAgIHRoYXQuX3NlY3Rpb25zID0gcztcbiAgICAgICAgcmV0dXJuIHRoYXQ7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIGBfX2dlbmVyYXRlZE1hcHBpbmdzYCBhbmQgYF9fb3JpZ2luYWxNYXBwaW5nc2AgYXJlIGFycmF5cyB0aGF0IGhvbGQgdGhlXG4gIC8vIHBhcnNlZCBtYXBwaW5nIGNvb3JkaW5hdGVzIGZyb20gdGhlIHNvdXJjZSBtYXAncyBcIm1hcHBpbmdzXCIgYXR0cmlidXRlLiBUaGV5XG4gIC8vIGFyZSBsYXppbHkgaW5zdGFudGlhdGVkLCBhY2Nlc3NlZCB2aWEgdGhlIGBfZ2VuZXJhdGVkTWFwcGluZ3NgIGFuZFxuICAvLyBgX29yaWdpbmFsTWFwcGluZ3NgIGdldHRlcnMgcmVzcGVjdGl2ZWx5LCBhbmQgd2Ugb25seSBwYXJzZSB0aGUgbWFwcGluZ3NcbiAgLy8gYW5kIGNyZWF0ZSB0aGVzZSBhcnJheXMgb25jZSBxdWVyaWVkIGZvciBhIHNvdXJjZSBsb2NhdGlvbi4gV2UganVtcCB0aHJvdWdoXG4gIC8vIHRoZXNlIGhvb3BzIGJlY2F1c2UgdGhlcmUgY2FuIGJlIG1hbnkgdGhvdXNhbmRzIG9mIG1hcHBpbmdzLCBhbmQgcGFyc2luZ1xuICAvLyB0aGVtIGlzIGV4cGVuc2l2ZSwgc28gd2Ugb25seSB3YW50IHRvIGRvIGl0IGlmIHdlIG11c3QuXG4gIC8vXG4gIC8vIEVhY2ggb2JqZWN0IGluIHRoZSBhcnJheXMgaXMgb2YgdGhlIGZvcm06XG4gIC8vXG4gIC8vICAgICB7XG4gIC8vICAgICAgIGdlbmVyYXRlZExpbmU6IFRoZSBsaW5lIG51bWJlciBpbiB0aGUgZ2VuZXJhdGVkIGNvZGUsXG4gIC8vICAgICAgIGdlbmVyYXRlZENvbHVtbjogVGhlIGNvbHVtbiBudW1iZXIgaW4gdGhlIGdlbmVyYXRlZCBjb2RlLFxuICAvLyAgICAgICBzb3VyY2U6IFRoZSBwYXRoIHRvIHRoZSBvcmlnaW5hbCBzb3VyY2UgZmlsZSB0aGF0IGdlbmVyYXRlZCB0aGlzXG4gIC8vICAgICAgICAgICAgICAgY2h1bmsgb2YgY29kZSxcbiAgLy8gICAgICAgb3JpZ2luYWxMaW5lOiBUaGUgbGluZSBudW1iZXIgaW4gdGhlIG9yaWdpbmFsIHNvdXJjZSB0aGF0XG4gIC8vICAgICAgICAgICAgICAgICAgICAgY29ycmVzcG9uZHMgdG8gdGhpcyBjaHVuayBvZiBnZW5lcmF0ZWQgY29kZSxcbiAgLy8gICAgICAgb3JpZ2luYWxDb2x1bW46IFRoZSBjb2x1bW4gbnVtYmVyIGluIHRoZSBvcmlnaW5hbCBzb3VyY2UgdGhhdFxuICAvLyAgICAgICAgICAgICAgICAgICAgICAgY29ycmVzcG9uZHMgdG8gdGhpcyBjaHVuayBvZiBnZW5lcmF0ZWQgY29kZSxcbiAgLy8gICAgICAgbmFtZTogVGhlIG5hbWUgb2YgdGhlIG9yaWdpbmFsIHN5bWJvbCB3aGljaCBnZW5lcmF0ZWQgdGhpcyBjaHVuayBvZlxuICAvLyAgICAgICAgICAgICBjb2RlLlxuICAvLyAgICAgfVxuICAvL1xuICAvLyBBbGwgcHJvcGVydGllcyBleGNlcHQgZm9yIGBnZW5lcmF0ZWRMaW5lYCBhbmQgYGdlbmVyYXRlZENvbHVtbmAgY2FuIGJlXG4gIC8vIGBudWxsYC5cbiAgLy9cbiAgLy8gYF9nZW5lcmF0ZWRNYXBwaW5nc2AgaXMgb3JkZXJlZCBieSB0aGUgZ2VuZXJhdGVkIHBvc2l0aW9ucy5cbiAgLy9cbiAgLy8gYF9vcmlnaW5hbE1hcHBpbmdzYCBpcyBvcmRlcmVkIGJ5IHRoZSBvcmlnaW5hbCBwb3NpdGlvbnMuXG4gIGdldCBfZ2VuZXJhdGVkTWFwcGluZ3MoKSB7XG4gICAgaWYgKCF0aGlzLl9fZ2VuZXJhdGVkTWFwcGluZ3MpIHtcbiAgICAgIHRoaXMuX3NvcnRHZW5lcmF0ZWRNYXBwaW5ncygpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9fZ2VuZXJhdGVkTWFwcGluZ3M7XG4gIH1cblxuICBnZXQgX29yaWdpbmFsTWFwcGluZ3MoKSB7XG4gICAgaWYgKCF0aGlzLl9fb3JpZ2luYWxNYXBwaW5ncykge1xuICAgICAgdGhpcy5fc29ydE9yaWdpbmFsTWFwcGluZ3MoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fX29yaWdpbmFsTWFwcGluZ3M7XG4gIH1cblxuICBnZXQgX2dlbmVyYXRlZE1hcHBpbmdzVW5zb3J0ZWQoKSB7XG4gICAgaWYgKCF0aGlzLl9fZ2VuZXJhdGVkTWFwcGluZ3NVbnNvcnRlZCkge1xuICAgICAgdGhpcy5fcGFyc2VNYXBwaW5ncyh0aGlzLl9tYXBwaW5ncywgdGhpcy5zb3VyY2VSb290KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fX2dlbmVyYXRlZE1hcHBpbmdzVW5zb3J0ZWQ7XG4gIH1cblxuICBnZXQgX29yaWdpbmFsTWFwcGluZ3NVbnNvcnRlZCgpIHtcbiAgICBpZiAoIXRoaXMuX19vcmlnaW5hbE1hcHBpbmdzVW5zb3J0ZWQpIHtcbiAgICAgIHRoaXMuX3BhcnNlTWFwcGluZ3ModGhpcy5fbWFwcGluZ3MsIHRoaXMuc291cmNlUm9vdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX19vcmlnaW5hbE1hcHBpbmdzVW5zb3J0ZWQ7XG4gIH1cblxuICBfc29ydEdlbmVyYXRlZE1hcHBpbmdzKCkge1xuICAgIGNvbnN0IG1hcHBpbmdzID0gdGhpcy5fZ2VuZXJhdGVkTWFwcGluZ3NVbnNvcnRlZDtcbiAgICBtYXBwaW5ncy5zb3J0KHV0aWwuY29tcGFyZUJ5R2VuZXJhdGVkUG9zaXRpb25zRGVmbGF0ZWQpO1xuICAgIHRoaXMuX19nZW5lcmF0ZWRNYXBwaW5ncyA9IG1hcHBpbmdzO1xuICB9XG5cbiAgX3NvcnRPcmlnaW5hbE1hcHBpbmdzKCkge1xuICAgIGNvbnN0IG1hcHBpbmdzID0gdGhpcy5fb3JpZ2luYWxNYXBwaW5nc1Vuc29ydGVkO1xuICAgIG1hcHBpbmdzLnNvcnQodXRpbC5jb21wYXJlQnlPcmlnaW5hbFBvc2l0aW9ucyk7XG4gICAgdGhpcy5fX29yaWdpbmFsTWFwcGluZ3MgPSBtYXBwaW5ncztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbGlzdCBvZiBvcmlnaW5hbCBzb3VyY2VzLlxuICAgKi9cbiAgZ2V0IHNvdXJjZXMoKSB7XG4gICAgY29uc3Qgc291cmNlcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fc2VjdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5fc2VjdGlvbnNbaV0uY29uc3VtZXIuc291cmNlcy5sZW5ndGg7IGorKykge1xuICAgICAgICBzb3VyY2VzLnB1c2godGhpcy5fc2VjdGlvbnNbaV0uY29uc3VtZXIuc291cmNlc1tqXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2VzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG9yaWdpbmFsIHNvdXJjZSwgbGluZSwgYW5kIGNvbHVtbiBpbmZvcm1hdGlvbiBmb3IgdGhlIGdlbmVyYXRlZFxuICAgKiBzb3VyY2UncyBsaW5lIGFuZCBjb2x1bW4gcG9zaXRpb25zIHByb3ZpZGVkLiBUaGUgb25seSBhcmd1bWVudCBpcyBhbiBvYmplY3RcbiAgICogd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gICAqXG4gICAqICAgLSBsaW5lOiBUaGUgbGluZSBudW1iZXIgaW4gdGhlIGdlbmVyYXRlZCBzb3VyY2UuICBUaGUgbGluZSBudW1iZXJcbiAgICogICAgIGlzIDEtYmFzZWQuXG4gICAqICAgLSBjb2x1bW46IFRoZSBjb2x1bW4gbnVtYmVyIGluIHRoZSBnZW5lcmF0ZWQgc291cmNlLiAgVGhlIGNvbHVtblxuICAgKiAgICAgbnVtYmVyIGlzIDAtYmFzZWQuXG4gICAqXG4gICAqIGFuZCBhbiBvYmplY3QgaXMgcmV0dXJuZWQgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gICAqXG4gICAqICAgLSBzb3VyY2U6IFRoZSBvcmlnaW5hbCBzb3VyY2UgZmlsZSwgb3IgbnVsbC5cbiAgICogICAtIGxpbmU6IFRoZSBsaW5lIG51bWJlciBpbiB0aGUgb3JpZ2luYWwgc291cmNlLCBvciBudWxsLiAgVGhlXG4gICAqICAgICBsaW5lIG51bWJlciBpcyAxLWJhc2VkLlxuICAgKiAgIC0gY29sdW1uOiBUaGUgY29sdW1uIG51bWJlciBpbiB0aGUgb3JpZ2luYWwgc291cmNlLCBvciBudWxsLiAgVGhlXG4gICAqICAgICBjb2x1bW4gbnVtYmVyIGlzIDAtYmFzZWQuXG4gICAqICAgLSBuYW1lOiBUaGUgb3JpZ2luYWwgaWRlbnRpZmllciwgb3IgbnVsbC5cbiAgICovXG4gIG9yaWdpbmFsUG9zaXRpb25Gb3IoYUFyZ3MpIHtcbiAgICBjb25zdCBuZWVkbGUgPSB7XG4gICAgICBnZW5lcmF0ZWRMaW5lOiB1dGlsLmdldEFyZyhhQXJncywgXCJsaW5lXCIpLFxuICAgICAgZ2VuZXJhdGVkQ29sdW1uOiB1dGlsLmdldEFyZyhhQXJncywgXCJjb2x1bW5cIilcbiAgICB9O1xuXG4gICAgLy8gRmluZCB0aGUgc2VjdGlvbiBjb250YWluaW5nIHRoZSBnZW5lcmF0ZWQgcG9zaXRpb24gd2UncmUgdHJ5aW5nIHRvIG1hcFxuICAgIC8vIHRvIGFuIG9yaWdpbmFsIHBvc2l0aW9uLlxuICAgIGNvbnN0IHNlY3Rpb25JbmRleCA9IGJpbmFyeVNlYXJjaC5zZWFyY2gobmVlZGxlLCB0aGlzLl9zZWN0aW9ucyxcbiAgICAgIGZ1bmN0aW9uKGFOZWVkbGUsIHNlY3Rpb24pIHtcbiAgICAgICAgY29uc3QgY21wID0gYU5lZWRsZS5nZW5lcmF0ZWRMaW5lIC0gc2VjdGlvbi5nZW5lcmF0ZWRPZmZzZXQuZ2VuZXJhdGVkTGluZTtcbiAgICAgICAgaWYgKGNtcCkge1xuICAgICAgICAgIHJldHVybiBjbXA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKGFOZWVkbGUuZ2VuZXJhdGVkQ29sdW1uIC1cbiAgICAgICAgICAgICAgICBzZWN0aW9uLmdlbmVyYXRlZE9mZnNldC5nZW5lcmF0ZWRDb2x1bW4pO1xuICAgICAgfSk7XG4gICAgY29uc3Qgc2VjdGlvbiA9IHRoaXMuX3NlY3Rpb25zW3NlY3Rpb25JbmRleF07XG5cbiAgICBpZiAoIXNlY3Rpb24pIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNvdXJjZTogbnVsbCxcbiAgICAgICAgbGluZTogbnVsbCxcbiAgICAgICAgY29sdW1uOiBudWxsLFxuICAgICAgICBuYW1lOiBudWxsXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBzZWN0aW9uLmNvbnN1bWVyLm9yaWdpbmFsUG9zaXRpb25Gb3Ioe1xuICAgICAgbGluZTogbmVlZGxlLmdlbmVyYXRlZExpbmUgLVxuICAgICAgICAoc2VjdGlvbi5nZW5lcmF0ZWRPZmZzZXQuZ2VuZXJhdGVkTGluZSAtIDEpLFxuICAgICAgY29sdW1uOiBuZWVkbGUuZ2VuZXJhdGVkQ29sdW1uIC1cbiAgICAgICAgKHNlY3Rpb24uZ2VuZXJhdGVkT2Zmc2V0LmdlbmVyYXRlZExpbmUgPT09IG5lZWRsZS5nZW5lcmF0ZWRMaW5lXG4gICAgICAgICA/IHNlY3Rpb24uZ2VuZXJhdGVkT2Zmc2V0LmdlbmVyYXRlZENvbHVtbiAtIDFcbiAgICAgICAgIDogMCksXG4gICAgICBiaWFzOiBhQXJncy5iaWFzXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRydWUgaWYgd2UgaGF2ZSB0aGUgc291cmNlIGNvbnRlbnQgZm9yIGV2ZXJ5IHNvdXJjZSBpbiB0aGUgc291cmNlXG4gICAqIG1hcCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgKi9cbiAgaGFzQ29udGVudHNPZkFsbFNvdXJjZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlY3Rpb25zLmV2ZXJ5KGZ1bmN0aW9uKHMpIHtcbiAgICAgIHJldHVybiBzLmNvbnN1bWVyLmhhc0NvbnRlbnRzT2ZBbGxTb3VyY2VzKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgb3JpZ2luYWwgc291cmNlIGNvbnRlbnQuIFRoZSBvbmx5IGFyZ3VtZW50IGlzIHRoZSB1cmwgb2YgdGhlXG4gICAqIG9yaWdpbmFsIHNvdXJjZSBmaWxlLiBSZXR1cm5zIG51bGwgaWYgbm8gb3JpZ2luYWwgc291cmNlIGNvbnRlbnQgaXNcbiAgICogYXZhaWxhYmxlLlxuICAgKi9cbiAgc291cmNlQ29udGVudEZvcihhU291cmNlLCBudWxsT25NaXNzaW5nKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9zZWN0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3Qgc2VjdGlvbiA9IHRoaXMuX3NlY3Rpb25zW2ldO1xuXG4gICAgICBjb25zdCBjb250ZW50ID0gc2VjdGlvbi5jb25zdW1lci5zb3VyY2VDb250ZW50Rm9yKGFTb3VyY2UsIHRydWUpO1xuICAgICAgaWYgKGNvbnRlbnQpIHtcbiAgICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChudWxsT25NaXNzaW5nKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdcIicgKyBhU291cmNlICsgJ1wiIGlzIG5vdCBpbiB0aGUgU291cmNlTWFwLicpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGdlbmVyYXRlZCBsaW5lIGFuZCBjb2x1bW4gaW5mb3JtYXRpb24gZm9yIHRoZSBvcmlnaW5hbCBzb3VyY2UsXG4gICAqIGxpbmUsIGFuZCBjb2x1bW4gcG9zaXRpb25zIHByb3ZpZGVkLiBUaGUgb25seSBhcmd1bWVudCBpcyBhbiBvYmplY3Qgd2l0aFxuICAgKiB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gICAqXG4gICAqICAgLSBzb3VyY2U6IFRoZSBmaWxlbmFtZSBvZiB0aGUgb3JpZ2luYWwgc291cmNlLlxuICAgKiAgIC0gbGluZTogVGhlIGxpbmUgbnVtYmVyIGluIHRoZSBvcmlnaW5hbCBzb3VyY2UuICBUaGUgbGluZSBudW1iZXJcbiAgICogICAgIGlzIDEtYmFzZWQuXG4gICAqICAgLSBjb2x1bW46IFRoZSBjb2x1bW4gbnVtYmVyIGluIHRoZSBvcmlnaW5hbCBzb3VyY2UuICBUaGUgY29sdW1uXG4gICAqICAgICBudW1iZXIgaXMgMC1iYXNlZC5cbiAgICpcbiAgICogYW5kIGFuIG9iamVjdCBpcyByZXR1cm5lZCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAgICpcbiAgICogICAtIGxpbmU6IFRoZSBsaW5lIG51bWJlciBpbiB0aGUgZ2VuZXJhdGVkIHNvdXJjZSwgb3IgbnVsbC4gIFRoZVxuICAgKiAgICAgbGluZSBudW1iZXIgaXMgMS1iYXNlZC5cbiAgICogICAtIGNvbHVtbjogVGhlIGNvbHVtbiBudW1iZXIgaW4gdGhlIGdlbmVyYXRlZCBzb3VyY2UsIG9yIG51bGwuXG4gICAqICAgICBUaGUgY29sdW1uIG51bWJlciBpcyAwLWJhc2VkLlxuICAgKi9cbiAgZ2VuZXJhdGVkUG9zaXRpb25Gb3IoYUFyZ3MpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3NlY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBzZWN0aW9uID0gdGhpcy5fc2VjdGlvbnNbaV07XG5cbiAgICAgIC8vIE9ubHkgY29uc2lkZXIgdGhpcyBzZWN0aW9uIGlmIHRoZSByZXF1ZXN0ZWQgc291cmNlIGlzIGluIHRoZSBsaXN0IG9mXG4gICAgICAvLyBzb3VyY2VzIG9mIHRoZSBjb25zdW1lci5cbiAgICAgIGlmIChzZWN0aW9uLmNvbnN1bWVyLl9maW5kU291cmNlSW5kZXgodXRpbC5nZXRBcmcoYUFyZ3MsIFwic291cmNlXCIpKSA9PT0gLTEpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBjb25zdCBnZW5lcmF0ZWRQb3NpdGlvbiA9IHNlY3Rpb24uY29uc3VtZXIuZ2VuZXJhdGVkUG9zaXRpb25Gb3IoYUFyZ3MpO1xuICAgICAgaWYgKGdlbmVyYXRlZFBvc2l0aW9uKSB7XG4gICAgICAgIGNvbnN0IHJldCA9IHtcbiAgICAgICAgICBsaW5lOiBnZW5lcmF0ZWRQb3NpdGlvbi5saW5lICtcbiAgICAgICAgICAgIChzZWN0aW9uLmdlbmVyYXRlZE9mZnNldC5nZW5lcmF0ZWRMaW5lIC0gMSksXG4gICAgICAgICAgY29sdW1uOiBnZW5lcmF0ZWRQb3NpdGlvbi5jb2x1bW4gK1xuICAgICAgICAgICAgKHNlY3Rpb24uZ2VuZXJhdGVkT2Zmc2V0LmdlbmVyYXRlZExpbmUgPT09IGdlbmVyYXRlZFBvc2l0aW9uLmxpbmVcbiAgICAgICAgICAgICA/IHNlY3Rpb24uZ2VuZXJhdGVkT2Zmc2V0LmdlbmVyYXRlZENvbHVtbiAtIDFcbiAgICAgICAgICAgICA6IDApXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGxpbmU6IG51bGwsXG4gICAgICBjb2x1bW46IG51bGxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIHRoZSBtYXBwaW5ncyBpbiBhIHN0cmluZyBpbiB0byBhIGRhdGEgc3RydWN0dXJlIHdoaWNoIHdlIGNhbiBlYXNpbHlcbiAgICogcXVlcnkgKHRoZSBvcmRlcmVkIGFycmF5cyBpbiB0aGUgYHRoaXMuX19nZW5lcmF0ZWRNYXBwaW5nc2AgYW5kXG4gICAqIGB0aGlzLl9fb3JpZ2luYWxNYXBwaW5nc2AgcHJvcGVydGllcykuXG4gICAqL1xuICBfcGFyc2VNYXBwaW5ncyhhU3RyLCBhU291cmNlUm9vdCkge1xuICAgIGNvbnN0IGdlbmVyYXRlZE1hcHBpbmdzID0gdGhpcy5fX2dlbmVyYXRlZE1hcHBpbmdzVW5zb3J0ZWQgPSBbXTtcbiAgICBjb25zdCBvcmlnaW5hbE1hcHBpbmdzID0gdGhpcy5fX29yaWdpbmFsTWFwcGluZ3NVbnNvcnRlZCA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fc2VjdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHNlY3Rpb24gPSB0aGlzLl9zZWN0aW9uc1tpXTtcblxuICAgICAgY29uc3Qgc2VjdGlvbk1hcHBpbmdzID0gW107XG4gICAgICBzZWN0aW9uLmNvbnN1bWVyLmVhY2hNYXBwaW5nKG0gPT4gc2VjdGlvbk1hcHBpbmdzLnB1c2gobSkpO1xuXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNlY3Rpb25NYXBwaW5ncy5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCBtYXBwaW5nID0gc2VjdGlvbk1hcHBpbmdzW2pdO1xuXG4gICAgICAgIC8vIFRPRE86IHRlc3QgaWYgbnVsbCBpcyBjb3JyZWN0IGhlcmUuICBUaGUgb3JpZ2luYWwgY29kZSB1c2VkXG4gICAgICAgIC8vIGBzb3VyY2VgLCB3aGljaCB3b3VsZCBhY3R1YWxseSBoYXZlIGdvdHRlbiB1c2VkIGFzIG51bGwgYmVjYXVzZVxuICAgICAgICAvLyB2YXIncyBnZXQgaG9pc3RlZC5cbiAgICAgICAgLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9zb3VyY2UtbWFwL2lzc3Vlcy8zMzNcbiAgICAgICAgbGV0IHNvdXJjZSA9IHV0aWwuY29tcHV0ZVNvdXJjZVVSTChzZWN0aW9uLmNvbnN1bWVyLnNvdXJjZVJvb3QsIG51bGwsIHRoaXMuX3NvdXJjZU1hcFVSTCk7XG4gICAgICAgIHRoaXMuX3NvdXJjZXMuYWRkKHNvdXJjZSk7XG4gICAgICAgIHNvdXJjZSA9IHRoaXMuX3NvdXJjZXMuaW5kZXhPZihzb3VyY2UpO1xuXG4gICAgICAgIGxldCBuYW1lID0gbnVsbDtcbiAgICAgICAgaWYgKG1hcHBpbmcubmFtZSkge1xuICAgICAgICAgIHRoaXMuX25hbWVzLmFkZChtYXBwaW5nLm5hbWUpO1xuICAgICAgICAgIG5hbWUgPSB0aGlzLl9uYW1lcy5pbmRleE9mKG1hcHBpbmcubmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgbWFwcGluZ3MgY29taW5nIGZyb20gdGhlIGNvbnN1bWVyIGZvciB0aGUgc2VjdGlvbiBoYXZlXG4gICAgICAgIC8vIGdlbmVyYXRlZCBwb3NpdGlvbnMgcmVsYXRpdmUgdG8gdGhlIHN0YXJ0IG9mIHRoZSBzZWN0aW9uLCBzbyB3ZVxuICAgICAgICAvLyBuZWVkIHRvIG9mZnNldCB0aGVtIHRvIGJlIHJlbGF0aXZlIHRvIHRoZSBzdGFydCBvZiB0aGUgY29uY2F0ZW5hdGVkXG4gICAgICAgIC8vIGdlbmVyYXRlZCBmaWxlLlxuICAgICAgICBjb25zdCBhZGp1c3RlZE1hcHBpbmcgPSB7XG4gICAgICAgICAgc291cmNlLFxuICAgICAgICAgIGdlbmVyYXRlZExpbmU6IG1hcHBpbmcuZ2VuZXJhdGVkTGluZSArXG4gICAgICAgICAgICAoc2VjdGlvbi5nZW5lcmF0ZWRPZmZzZXQuZ2VuZXJhdGVkTGluZSAtIDEpLFxuICAgICAgICAgIGdlbmVyYXRlZENvbHVtbjogbWFwcGluZy5nZW5lcmF0ZWRDb2x1bW4gK1xuICAgICAgICAgICAgKHNlY3Rpb24uZ2VuZXJhdGVkT2Zmc2V0LmdlbmVyYXRlZExpbmUgPT09IG1hcHBpbmcuZ2VuZXJhdGVkTGluZVxuICAgICAgICAgICAgPyBzZWN0aW9uLmdlbmVyYXRlZE9mZnNldC5nZW5lcmF0ZWRDb2x1bW4gLSAxXG4gICAgICAgICAgICA6IDApLFxuICAgICAgICAgIG9yaWdpbmFsTGluZTogbWFwcGluZy5vcmlnaW5hbExpbmUsXG4gICAgICAgICAgb3JpZ2luYWxDb2x1bW46IG1hcHBpbmcub3JpZ2luYWxDb2x1bW4sXG4gICAgICAgICAgbmFtZVxuICAgICAgICB9O1xuXG4gICAgICAgIGdlbmVyYXRlZE1hcHBpbmdzLnB1c2goYWRqdXN0ZWRNYXBwaW5nKTtcbiAgICAgICAgaWYgKHR5cGVvZiBhZGp1c3RlZE1hcHBpbmcub3JpZ2luYWxMaW5lID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgb3JpZ2luYWxNYXBwaW5ncy5wdXNoKGFkanVzdGVkTWFwcGluZyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBlYWNoTWFwcGluZyhhQ2FsbGJhY2ssIGFDb250ZXh0LCBhT3JkZXIpIHtcbiAgICBjb25zdCBjb250ZXh0ID0gYUNvbnRleHQgfHwgbnVsbDtcbiAgICBjb25zdCBvcmRlciA9IGFPcmRlciB8fCBTb3VyY2VNYXBDb25zdW1lci5HRU5FUkFURURfT1JERVI7XG5cbiAgICBsZXQgbWFwcGluZ3M7XG4gICAgc3dpdGNoIChvcmRlcikge1xuICAgIGNhc2UgU291cmNlTWFwQ29uc3VtZXIuR0VORVJBVEVEX09SREVSOlxuICAgICAgbWFwcGluZ3MgPSB0aGlzLl9nZW5lcmF0ZWRNYXBwaW5ncztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgU291cmNlTWFwQ29uc3VtZXIuT1JJR0lOQUxfT1JERVI6XG4gICAgICBtYXBwaW5ncyA9IHRoaXMuX29yaWdpbmFsTWFwcGluZ3M7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBvcmRlciBvZiBpdGVyYXRpb24uXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IHNvdXJjZVJvb3QgPSB0aGlzLnNvdXJjZVJvb3Q7XG4gICAgbWFwcGluZ3MubWFwKGZ1bmN0aW9uKG1hcHBpbmcpIHtcbiAgICAgIGxldCBzb3VyY2UgPSBudWxsO1xuICAgICAgaWYgKG1hcHBpbmcuc291cmNlICE9PSBudWxsKSB7XG4gICAgICAgIHNvdXJjZSA9IHRoaXMuX3NvdXJjZXMuYXQobWFwcGluZy5zb3VyY2UpO1xuICAgICAgICBzb3VyY2UgPSB1dGlsLmNvbXB1dGVTb3VyY2VVUkwoc291cmNlUm9vdCwgc291cmNlLCB0aGlzLl9zb3VyY2VNYXBVUkwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc291cmNlLFxuICAgICAgICBnZW5lcmF0ZWRMaW5lOiBtYXBwaW5nLmdlbmVyYXRlZExpbmUsXG4gICAgICAgIGdlbmVyYXRlZENvbHVtbjogbWFwcGluZy5nZW5lcmF0ZWRDb2x1bW4sXG4gICAgICAgIG9yaWdpbmFsTGluZTogbWFwcGluZy5vcmlnaW5hbExpbmUsXG4gICAgICAgIG9yaWdpbmFsQ29sdW1uOiBtYXBwaW5nLm9yaWdpbmFsQ29sdW1uLFxuICAgICAgICBuYW1lOiBtYXBwaW5nLm5hbWUgPT09IG51bGwgPyBudWxsIDogdGhpcy5fbmFtZXMuYXQobWFwcGluZy5uYW1lKVxuICAgICAgfTtcbiAgICB9LCB0aGlzKS5mb3JFYWNoKGFDYWxsYmFjaywgY29udGV4dCk7XG4gIH1cblxuICAvKipcbiAgICogRmluZCB0aGUgbWFwcGluZyB0aGF0IGJlc3QgbWF0Y2hlcyB0aGUgaHlwb3RoZXRpY2FsIFwibmVlZGxlXCIgbWFwcGluZyB0aGF0XG4gICAqIHdlIGFyZSBzZWFyY2hpbmcgZm9yIGluIHRoZSBnaXZlbiBcImhheXN0YWNrXCIgb2YgbWFwcGluZ3MuXG4gICAqL1xuICBfZmluZE1hcHBpbmcoYU5lZWRsZSwgYU1hcHBpbmdzLCBhTGluZU5hbWUsXG4gICAgICAgICAgICAgIGFDb2x1bW5OYW1lLCBhQ29tcGFyYXRvciwgYUJpYXMpIHtcbiAgICAvLyBUbyByZXR1cm4gdGhlIHBvc2l0aW9uIHdlIGFyZSBzZWFyY2hpbmcgZm9yLCB3ZSBtdXN0IGZpcnN0IGZpbmQgdGhlXG4gICAgLy8gbWFwcGluZyBmb3IgdGhlIGdpdmVuIHBvc2l0aW9uIGFuZCB0aGVuIHJldHVybiB0aGUgb3Bwb3NpdGUgcG9zaXRpb24gaXRcbiAgICAvLyBwb2ludHMgdG8uIEJlY2F1c2UgdGhlIG1hcHBpbmdzIGFyZSBzb3J0ZWQsIHdlIGNhbiB1c2UgYmluYXJ5IHNlYXJjaCB0b1xuICAgIC8vIGZpbmQgdGhlIGJlc3QgbWFwcGluZy5cblxuICAgIGlmIChhTmVlZGxlW2FMaW5lTmFtZV0gPD0gMCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkxpbmUgbXVzdCBiZSBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gMSwgZ290IFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICsgYU5lZWRsZVthTGluZU5hbWVdKTtcbiAgICB9XG4gICAgaWYgKGFOZWVkbGVbYUNvbHVtbk5hbWVdIDwgMCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNvbHVtbiBtdXN0IGJlIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byAwLCBnb3QgXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKyBhTmVlZGxlW2FDb2x1bW5OYW1lXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJpbmFyeVNlYXJjaC5zZWFyY2goYU5lZWRsZSwgYU1hcHBpbmdzLCBhQ29tcGFyYXRvciwgYUJpYXMpO1xuICB9XG5cbiAgYWxsR2VuZXJhdGVkUG9zaXRpb25zRm9yKGFBcmdzKSB7XG4gICAgY29uc3QgbGluZSA9IHV0aWwuZ2V0QXJnKGFBcmdzLCBcImxpbmVcIik7XG5cbiAgICAvLyBXaGVuIHRoZXJlIGlzIG5vIGV4YWN0IG1hdGNoLCBCYXNpY1NvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5fZmluZE1hcHBpbmdcbiAgICAvLyByZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgY2xvc2VzdCBtYXBwaW5nIGxlc3MgdGhhbiB0aGUgbmVlZGxlLiBCeVxuICAgIC8vIHNldHRpbmcgbmVlZGxlLm9yaWdpbmFsQ29sdW1uIHRvIDAsIHdlIHRodXMgZmluZCB0aGUgbGFzdCBtYXBwaW5nIGZvclxuICAgIC8vIHRoZSBnaXZlbiBsaW5lLCBwcm92aWRlZCBzdWNoIGEgbWFwcGluZyBleGlzdHMuXG4gICAgY29uc3QgbmVlZGxlID0ge1xuICAgICAgc291cmNlOiB1dGlsLmdldEFyZyhhQXJncywgXCJzb3VyY2VcIiksXG4gICAgICBvcmlnaW5hbExpbmU6IGxpbmUsXG4gICAgICBvcmlnaW5hbENvbHVtbjogdXRpbC5nZXRBcmcoYUFyZ3MsIFwiY29sdW1uXCIsIDApXG4gICAgfTtcblxuICAgIG5lZWRsZS5zb3VyY2UgPSB0aGlzLl9maW5kU291cmNlSW5kZXgobmVlZGxlLnNvdXJjZSk7XG4gICAgaWYgKG5lZWRsZS5zb3VyY2UgPCAwKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgaWYgKG5lZWRsZS5vcmlnaW5hbExpbmUgPCAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMaW5lIG51bWJlcnMgbXVzdCBiZSA+PSAxXCIpO1xuICAgIH1cblxuICAgIGlmIChuZWVkbGUub3JpZ2luYWxDb2x1bW4gPCAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb2x1bW4gbnVtYmVycyBtdXN0IGJlID49IDBcIik7XG4gICAgfVxuXG4gICAgY29uc3QgbWFwcGluZ3MgPSBbXTtcblxuICAgIGxldCBpbmRleCA9IHRoaXMuX2ZpbmRNYXBwaW5nKG5lZWRsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vcmlnaW5hbE1hcHBpbmdzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwib3JpZ2luYWxMaW5lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJvcmlnaW5hbENvbHVtblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0aWwuY29tcGFyZUJ5T3JpZ2luYWxQb3NpdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmluYXJ5U2VhcmNoLkxFQVNUX1VQUEVSX0JPVU5EKTtcbiAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgbGV0IG1hcHBpbmcgPSB0aGlzLl9vcmlnaW5hbE1hcHBpbmdzW2luZGV4XTtcblxuICAgICAgaWYgKGFBcmdzLmNvbHVtbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsTGluZSA9IG1hcHBpbmcub3JpZ2luYWxMaW5lO1xuXG4gICAgICAgIC8vIEl0ZXJhdGUgdW50aWwgZWl0aGVyIHdlIHJ1biBvdXQgb2YgbWFwcGluZ3MsIG9yIHdlIHJ1biBpbnRvXG4gICAgICAgIC8vIGEgbWFwcGluZyBmb3IgYSBkaWZmZXJlbnQgbGluZSB0aGFuIHRoZSBvbmUgd2UgZm91bmQuIFNpbmNlXG4gICAgICAgIC8vIG1hcHBpbmdzIGFyZSBzb3J0ZWQsIHRoaXMgaXMgZ3VhcmFudGVlZCB0byBmaW5kIGFsbCBtYXBwaW5ncyBmb3JcbiAgICAgICAgLy8gdGhlIGxpbmUgd2UgZm91bmQuXG4gICAgICAgIHdoaWxlIChtYXBwaW5nICYmIG1hcHBpbmcub3JpZ2luYWxMaW5lID09PSBvcmlnaW5hbExpbmUpIHtcbiAgICAgICAgICBsZXQgbGFzdENvbHVtbiA9IG1hcHBpbmcubGFzdEdlbmVyYXRlZENvbHVtbjtcbiAgICAgICAgICBpZiAodGhpcy5fY29tcHV0ZWRDb2x1bW5TcGFucyAmJiBsYXN0Q29sdW1uID09PSBudWxsKSB7XG4gICAgICAgICAgICBsYXN0Q29sdW1uID0gSW5maW5pdHk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG1hcHBpbmdzLnB1c2goe1xuICAgICAgICAgICAgbGluZTogdXRpbC5nZXRBcmcobWFwcGluZywgXCJnZW5lcmF0ZWRMaW5lXCIsIG51bGwpLFxuICAgICAgICAgICAgY29sdW1uOiB1dGlsLmdldEFyZyhtYXBwaW5nLCBcImdlbmVyYXRlZENvbHVtblwiLCBudWxsKSxcbiAgICAgICAgICAgIGxhc3RDb2x1bW4sXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBtYXBwaW5nID0gdGhpcy5fb3JpZ2luYWxNYXBwaW5nc1srK2luZGV4XTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxDb2x1bW4gPSBtYXBwaW5nLm9yaWdpbmFsQ29sdW1uO1xuXG4gICAgICAgIC8vIEl0ZXJhdGUgdW50aWwgZWl0aGVyIHdlIHJ1biBvdXQgb2YgbWFwcGluZ3MsIG9yIHdlIHJ1biBpbnRvXG4gICAgICAgIC8vIGEgbWFwcGluZyBmb3IgYSBkaWZmZXJlbnQgbGluZSB0aGFuIHRoZSBvbmUgd2Ugd2VyZSBzZWFyY2hpbmcgZm9yLlxuICAgICAgICAvLyBTaW5jZSBtYXBwaW5ncyBhcmUgc29ydGVkLCB0aGlzIGlzIGd1YXJhbnRlZWQgdG8gZmluZCBhbGwgbWFwcGluZ3MgZm9yXG4gICAgICAgIC8vIHRoZSBsaW5lIHdlIGFyZSBzZWFyY2hpbmcgZm9yLlxuICAgICAgICB3aGlsZSAobWFwcGluZyAmJlxuICAgICAgICAgICAgICAgbWFwcGluZy5vcmlnaW5hbExpbmUgPT09IGxpbmUgJiZcbiAgICAgICAgICAgICAgIG1hcHBpbmcub3JpZ2luYWxDb2x1bW4gPT0gb3JpZ2luYWxDb2x1bW4pIHtcbiAgICAgICAgICBsZXQgbGFzdENvbHVtbiA9IG1hcHBpbmcubGFzdEdlbmVyYXRlZENvbHVtbjtcbiAgICAgICAgICBpZiAodGhpcy5fY29tcHV0ZWRDb2x1bW5TcGFucyAmJiBsYXN0Q29sdW1uID09PSBudWxsKSB7XG4gICAgICAgICAgICBsYXN0Q29sdW1uID0gSW5maW5pdHk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG1hcHBpbmdzLnB1c2goe1xuICAgICAgICAgICAgbGluZTogdXRpbC5nZXRBcmcobWFwcGluZywgXCJnZW5lcmF0ZWRMaW5lXCIsIG51bGwpLFxuICAgICAgICAgICAgY29sdW1uOiB1dGlsLmdldEFyZyhtYXBwaW5nLCBcImdlbmVyYXRlZENvbHVtblwiLCBudWxsKSxcbiAgICAgICAgICAgIGxhc3RDb2x1bW4sXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBtYXBwaW5nID0gdGhpcy5fb3JpZ2luYWxNYXBwaW5nc1srK2luZGV4XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtYXBwaW5ncztcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9zZWN0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5fc2VjdGlvbnNbaV0uY29uc3VtZXIuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxufVxuZXhwb3J0cy5JbmRleGVkU291cmNlTWFwQ29uc3VtZXIgPSBJbmRleGVkU291cmNlTWFwQ29uc3VtZXI7XG5cbi8qXG4gKiBDaGVhdCB0byBnZXQgYXJvdW5kIGludGVyLXR3aW5nbGVkIGNsYXNzZXMuICBgZmFjdG9yeSgpYCBjYW4gYmUgYXQgdGhlIGVuZFxuICogd2hlcmUgaXQgaGFzIGFjY2VzcyB0byBub24taG9pc3RlZCBjbGFzc2VzLCBidXQgaXQgZ2V0cyBob2lzdGVkIGl0c2VsZi5cbiAqL1xuZnVuY3Rpb24gX2ZhY3RvcnkoYVNvdXJjZU1hcCwgYVNvdXJjZU1hcFVSTCkge1xuICBsZXQgc291cmNlTWFwID0gYVNvdXJjZU1hcDtcbiAgaWYgKHR5cGVvZiBhU291cmNlTWFwID09PSBcInN0cmluZ1wiKSB7XG4gICAgc291cmNlTWFwID0gdXRpbC5wYXJzZVNvdXJjZU1hcElucHV0KGFTb3VyY2VNYXApO1xuICB9XG5cbiAgY29uc3QgY29uc3VtZXIgPSBzb3VyY2VNYXAuc2VjdGlvbnMgIT0gbnVsbFxuICAgICAgPyBuZXcgSW5kZXhlZFNvdXJjZU1hcENvbnN1bWVyKHNvdXJjZU1hcCwgYVNvdXJjZU1hcFVSTClcbiAgICAgIDogbmV3IEJhc2ljU291cmNlTWFwQ29uc3VtZXIoc291cmNlTWFwLCBhU291cmNlTWFwVVJMKTtcbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjb25zdW1lcik7XG59XG5cbmZ1bmN0aW9uIF9mYWN0b3J5QlNNKGFTb3VyY2VNYXAsIGFTb3VyY2VNYXBVUkwpIHtcbiAgcmV0dXJuIEJhc2ljU291cmNlTWFwQ29uc3VtZXIuZnJvbVNvdXJjZU1hcChhU291cmNlTWFwLCBhU291cmNlTWFwVVJMKTtcbn1cblxuXG4vKioqLyB9KSxcbi8qIDkgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxuLyogLSotIE1vZGU6IGpzOyBqcy1pbmRlbnQtbGV2ZWw6IDI7IC0qLSAqL1xuLypcbiAqIENvcHlyaWdodCAyMDExIE1vemlsbGEgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTmV3IEJTRCBsaWNlbnNlLiBTZWUgTElDRU5TRSBvcjpcbiAqIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9CU0QtMy1DbGF1c2VcbiAqL1xuXG5leHBvcnRzLkdSRUFURVNUX0xPV0VSX0JPVU5EID0gMTtcbmV4cG9ydHMuTEVBU1RfVVBQRVJfQk9VTkQgPSAyO1xuXG4vKipcbiAqIFJlY3Vyc2l2ZSBpbXBsZW1lbnRhdGlvbiBvZiBiaW5hcnkgc2VhcmNoLlxuICpcbiAqIEBwYXJhbSBhTG93IEluZGljZXMgaGVyZSBhbmQgbG93ZXIgZG8gbm90IGNvbnRhaW4gdGhlIG5lZWRsZS5cbiAqIEBwYXJhbSBhSGlnaCBJbmRpY2VzIGhlcmUgYW5kIGhpZ2hlciBkbyBub3QgY29udGFpbiB0aGUgbmVlZGxlLlxuICogQHBhcmFtIGFOZWVkbGUgVGhlIGVsZW1lbnQgYmVpbmcgc2VhcmNoZWQgZm9yLlxuICogQHBhcmFtIGFIYXlzdGFjayBUaGUgbm9uLWVtcHR5IGFycmF5IGJlaW5nIHNlYXJjaGVkLlxuICogQHBhcmFtIGFDb21wYXJlIEZ1bmN0aW9uIHdoaWNoIHRha2VzIHR3byBlbGVtZW50cyBhbmQgcmV0dXJucyAtMSwgMCwgb3IgMS5cbiAqIEBwYXJhbSBhQmlhcyBFaXRoZXIgJ2JpbmFyeVNlYXJjaC5HUkVBVEVTVF9MT1dFUl9CT1VORCcgb3JcbiAqICAgICAnYmluYXJ5U2VhcmNoLkxFQVNUX1VQUEVSX0JPVU5EJy4gU3BlY2lmaWVzIHdoZXRoZXIgdG8gcmV0dXJuIHRoZVxuICogICAgIGNsb3Nlc3QgZWxlbWVudCB0aGF0IGlzIHNtYWxsZXIgdGhhbiBvciBncmVhdGVyIHRoYW4gdGhlIG9uZSB3ZSBhcmVcbiAqICAgICBzZWFyY2hpbmcgZm9yLCByZXNwZWN0aXZlbHksIGlmIHRoZSBleGFjdCBlbGVtZW50IGNhbm5vdCBiZSBmb3VuZC5cbiAqL1xuZnVuY3Rpb24gcmVjdXJzaXZlU2VhcmNoKGFMb3csIGFIaWdoLCBhTmVlZGxlLCBhSGF5c3RhY2ssIGFDb21wYXJlLCBhQmlhcykge1xuICAvLyBUaGlzIGZ1bmN0aW9uIHRlcm1pbmF0ZXMgd2hlbiBvbmUgb2YgdGhlIGZvbGxvd2luZyBpcyB0cnVlOlxuICAvL1xuICAvLyAgIDEuIFdlIGZpbmQgdGhlIGV4YWN0IGVsZW1lbnQgd2UgYXJlIGxvb2tpbmcgZm9yLlxuICAvL1xuICAvLyAgIDIuIFdlIGRpZCBub3QgZmluZCB0aGUgZXhhY3QgZWxlbWVudCwgYnV0IHdlIGNhbiByZXR1cm4gdGhlIGluZGV4IG9mXG4gIC8vICAgICAgdGhlIG5leHQtY2xvc2VzdCBlbGVtZW50LlxuICAvL1xuICAvLyAgIDMuIFdlIGRpZCBub3QgZmluZCB0aGUgZXhhY3QgZWxlbWVudCwgYW5kIHRoZXJlIGlzIG5vIG5leHQtY2xvc2VzdFxuICAvLyAgICAgIGVsZW1lbnQgdGhhbiB0aGUgb25lIHdlIGFyZSBzZWFyY2hpbmcgZm9yLCBzbyB3ZSByZXR1cm4gLTEuXG4gIGNvbnN0IG1pZCA9IE1hdGguZmxvb3IoKGFIaWdoIC0gYUxvdykgLyAyKSArIGFMb3c7XG4gIGNvbnN0IGNtcCA9IGFDb21wYXJlKGFOZWVkbGUsIGFIYXlzdGFja1ttaWRdLCB0cnVlKTtcbiAgaWYgKGNtcCA9PT0gMCkge1xuICAgIC8vIEZvdW5kIHRoZSBlbGVtZW50IHdlIGFyZSBsb29raW5nIGZvci5cbiAgICByZXR1cm4gbWlkO1xuICB9IGVsc2UgaWYgKGNtcCA+IDApIHtcbiAgICAvLyBPdXIgbmVlZGxlIGlzIGdyZWF0ZXIgdGhhbiBhSGF5c3RhY2tbbWlkXS5cbiAgICBpZiAoYUhpZ2ggLSBtaWQgPiAxKSB7XG4gICAgICAvLyBUaGUgZWxlbWVudCBpcyBpbiB0aGUgdXBwZXIgaGFsZi5cbiAgICAgIHJldHVybiByZWN1cnNpdmVTZWFyY2gobWlkLCBhSGlnaCwgYU5lZWRsZSwgYUhheXN0YWNrLCBhQ29tcGFyZSwgYUJpYXMpO1xuICAgIH1cblxuICAgIC8vIFRoZSBleGFjdCBuZWVkbGUgZWxlbWVudCB3YXMgbm90IGZvdW5kIGluIHRoaXMgaGF5c3RhY2suIERldGVybWluZSBpZlxuICAgIC8vIHdlIGFyZSBpbiB0ZXJtaW5hdGlvbiBjYXNlICgzKSBvciAoMikgYW5kIHJldHVybiB0aGUgYXBwcm9wcmlhdGUgdGhpbmcuXG4gICAgaWYgKGFCaWFzID09IGV4cG9ydHMuTEVBU1RfVVBQRVJfQk9VTkQpIHtcbiAgICAgIHJldHVybiBhSGlnaCA8IGFIYXlzdGFjay5sZW5ndGggPyBhSGlnaCA6IC0xO1xuICAgIH1cbiAgICByZXR1cm4gbWlkO1xuICB9XG5cbiAgLy8gT3VyIG5lZWRsZSBpcyBsZXNzIHRoYW4gYUhheXN0YWNrW21pZF0uXG4gIGlmIChtaWQgLSBhTG93ID4gMSkge1xuICAgIC8vIFRoZSBlbGVtZW50IGlzIGluIHRoZSBsb3dlciBoYWxmLlxuICAgIHJldHVybiByZWN1cnNpdmVTZWFyY2goYUxvdywgbWlkLCBhTmVlZGxlLCBhSGF5c3RhY2ssIGFDb21wYXJlLCBhQmlhcyk7XG4gIH1cblxuICAvLyB3ZSBhcmUgaW4gdGVybWluYXRpb24gY2FzZSAoMykgb3IgKDIpIGFuZCByZXR1cm4gdGhlIGFwcHJvcHJpYXRlIHRoaW5nLlxuICBpZiAoYUJpYXMgPT0gZXhwb3J0cy5MRUFTVF9VUFBFUl9CT1VORCkge1xuICAgIHJldHVybiBtaWQ7XG4gIH1cbiAgcmV0dXJuIGFMb3cgPCAwID8gLTEgOiBhTG93O1xufVxuXG4vKipcbiAqIFRoaXMgaXMgYW4gaW1wbGVtZW50YXRpb24gb2YgYmluYXJ5IHNlYXJjaCB3aGljaCB3aWxsIGFsd2F5cyB0cnkgYW5kIHJldHVyblxuICogdGhlIGluZGV4IG9mIHRoZSBjbG9zZXN0IGVsZW1lbnQgaWYgdGhlcmUgaXMgbm8gZXhhY3QgaGl0LiBUaGlzIGlzIGJlY2F1c2VcbiAqIG1hcHBpbmdzIGJldHdlZW4gb3JpZ2luYWwgYW5kIGdlbmVyYXRlZCBsaW5lL2NvbCBwYWlycyBhcmUgc2luZ2xlIHBvaW50cyxcbiAqIGFuZCB0aGVyZSBpcyBhbiBpbXBsaWNpdCByZWdpb24gYmV0d2VlbiBlYWNoIG9mIHRoZW0sIHNvIGEgbWlzcyBqdXN0IG1lYW5zXG4gKiB0aGF0IHlvdSBhcmVuJ3Qgb24gdGhlIHZlcnkgc3RhcnQgb2YgYSByZWdpb24uXG4gKlxuICogQHBhcmFtIGFOZWVkbGUgVGhlIGVsZW1lbnQgeW91IGFyZSBsb29raW5nIGZvci5cbiAqIEBwYXJhbSBhSGF5c3RhY2sgVGhlIGFycmF5IHRoYXQgaXMgYmVpbmcgc2VhcmNoZWQuXG4gKiBAcGFyYW0gYUNvbXBhcmUgQSBmdW5jdGlvbiB3aGljaCB0YWtlcyB0aGUgbmVlZGxlIGFuZCBhbiBlbGVtZW50IGluIHRoZVxuICogICAgIGFycmF5IGFuZCByZXR1cm5zIC0xLCAwLCBvciAxIGRlcGVuZGluZyBvbiB3aGV0aGVyIHRoZSBuZWVkbGUgaXMgbGVzc1xuICogICAgIHRoYW4sIGVxdWFsIHRvLCBvciBncmVhdGVyIHRoYW4gdGhlIGVsZW1lbnQsIHJlc3BlY3RpdmVseS5cbiAqIEBwYXJhbSBhQmlhcyBFaXRoZXIgJ2JpbmFyeVNlYXJjaC5HUkVBVEVTVF9MT1dFUl9CT1VORCcgb3JcbiAqICAgICAnYmluYXJ5U2VhcmNoLkxFQVNUX1VQUEVSX0JPVU5EJy4gU3BlY2lmaWVzIHdoZXRoZXIgdG8gcmV0dXJuIHRoZVxuICogICAgIGNsb3Nlc3QgZWxlbWVudCB0aGF0IGlzIHNtYWxsZXIgdGhhbiBvciBncmVhdGVyIHRoYW4gdGhlIG9uZSB3ZSBhcmVcbiAqICAgICBzZWFyY2hpbmcgZm9yLCByZXNwZWN0aXZlbHksIGlmIHRoZSBleGFjdCBlbGVtZW50IGNhbm5vdCBiZSBmb3VuZC5cbiAqICAgICBEZWZhdWx0cyB0byAnYmluYXJ5U2VhcmNoLkdSRUFURVNUX0xPV0VSX0JPVU5EJy5cbiAqL1xuZXhwb3J0cy5zZWFyY2ggPSBmdW5jdGlvbiBzZWFyY2goYU5lZWRsZSwgYUhheXN0YWNrLCBhQ29tcGFyZSwgYUJpYXMpIHtcbiAgaWYgKGFIYXlzdGFjay5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICBsZXQgaW5kZXggPSByZWN1cnNpdmVTZWFyY2goLTEsIGFIYXlzdGFjay5sZW5ndGgsIGFOZWVkbGUsIGFIYXlzdGFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFDb21wYXJlLCBhQmlhcyB8fCBleHBvcnRzLkdSRUFURVNUX0xPV0VSX0JPVU5EKTtcbiAgaWYgKGluZGV4IDwgMCkge1xuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIC8vIFdlIGhhdmUgZm91bmQgZWl0aGVyIHRoZSBleGFjdCBlbGVtZW50LCBvciB0aGUgbmV4dC1jbG9zZXN0IGVsZW1lbnQgdGhhblxuICAvLyB0aGUgb25lIHdlIGFyZSBzZWFyY2hpbmcgZm9yLiBIb3dldmVyLCB0aGVyZSBtYXkgYmUgbW9yZSB0aGFuIG9uZSBzdWNoXG4gIC8vIGVsZW1lbnQuIE1ha2Ugc3VyZSB3ZSBhbHdheXMgcmV0dXJuIHRoZSBzbWFsbGVzdCBvZiB0aGVzZS5cbiAgd2hpbGUgKGluZGV4IC0gMSA+PSAwKSB7XG4gICAgaWYgKGFDb21wYXJlKGFIYXlzdGFja1tpbmRleF0sIGFIYXlzdGFja1tpbmRleCAtIDFdLCB0cnVlKSAhPT0gMCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIC0taW5kZXg7XG4gIH1cblxuICByZXR1cm4gaW5kZXg7XG59O1xuXG5cbi8qKiovIH0pLFxuLyogMTAgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzEwX187XG5cbi8qKiovIH0pLFxuLyogMTEgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzExX187XG5cbi8qKiovIH0pLFxuLyogMTIgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuY29uc3QgcmVhZFdhc20gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDQpO1xuXG4vKipcbiAqIFByb3ZpZGUgdGhlIEpJVCB3aXRoIGEgbmljZSBzaGFwZSAvIGhpZGRlbiBjbGFzcy5cbiAqL1xuZnVuY3Rpb24gTWFwcGluZygpIHtcbiAgdGhpcy5nZW5lcmF0ZWRMaW5lID0gMDtcbiAgdGhpcy5nZW5lcmF0ZWRDb2x1bW4gPSAwO1xuICB0aGlzLmxhc3RHZW5lcmF0ZWRDb2x1bW4gPSBudWxsO1xuICB0aGlzLnNvdXJjZSA9IG51bGw7XG4gIHRoaXMub3JpZ2luYWxMaW5lID0gbnVsbDtcbiAgdGhpcy5vcmlnaW5hbENvbHVtbiA9IG51bGw7XG4gIHRoaXMubmFtZSA9IG51bGw7XG59XG5cbmxldCBjYWNoZWRXYXNtID0gbnVsbDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB3YXNtKCkge1xuICBpZiAoY2FjaGVkV2FzbSkge1xuICAgIHJldHVybiBjYWNoZWRXYXNtO1xuICB9XG5cbiAgY29uc3QgY2FsbGJhY2tTdGFjayA9IFtdO1xuXG4gIGNhY2hlZFdhc20gPSByZWFkV2FzbSgpLnRoZW4oYnVmZmVyID0+IHtcbiAgICAgIHJldHVybiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZShidWZmZXIsIHtcbiAgICAgICAgZW52OiB7XG4gICAgICAgICAgbWFwcGluZ19jYWxsYmFjayhcbiAgICAgICAgICAgIGdlbmVyYXRlZExpbmUsXG4gICAgICAgICAgICBnZW5lcmF0ZWRDb2x1bW4sXG5cbiAgICAgICAgICAgIGhhc0xhc3RHZW5lcmF0ZWRDb2x1bW4sXG4gICAgICAgICAgICBsYXN0R2VuZXJhdGVkQ29sdW1uLFxuXG4gICAgICAgICAgICBoYXNPcmlnaW5hbCxcbiAgICAgICAgICAgIHNvdXJjZSxcbiAgICAgICAgICAgIG9yaWdpbmFsTGluZSxcbiAgICAgICAgICAgIG9yaWdpbmFsQ29sdW1uLFxuXG4gICAgICAgICAgICBoYXNOYW1lLFxuICAgICAgICAgICAgbmFtZVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgY29uc3QgbWFwcGluZyA9IG5ldyBNYXBwaW5nKCk7XG4gICAgICAgICAgICAvLyBKUyB1c2VzIDEtYmFzZWQgbGluZSBudW1iZXJzLCB3YXNtIHVzZXMgMC1iYXNlZC5cbiAgICAgICAgICAgIG1hcHBpbmcuZ2VuZXJhdGVkTGluZSA9IGdlbmVyYXRlZExpbmUgKyAxO1xuICAgICAgICAgICAgbWFwcGluZy5nZW5lcmF0ZWRDb2x1bW4gPSBnZW5lcmF0ZWRDb2x1bW47XG5cbiAgICAgICAgICAgIGlmIChoYXNMYXN0R2VuZXJhdGVkQ29sdW1uKSB7XG4gICAgICAgICAgICAgIC8vIEpTIHVzZXMgaW5jbHVzaXZlIGxhc3QgZ2VuZXJhdGVkIGNvbHVtbiwgd2FzbSB1c2VzIGV4Y2x1c2l2ZS5cbiAgICAgICAgICAgICAgbWFwcGluZy5sYXN0R2VuZXJhdGVkQ29sdW1uID0gbGFzdEdlbmVyYXRlZENvbHVtbiAtIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChoYXNPcmlnaW5hbCkge1xuICAgICAgICAgICAgICBtYXBwaW5nLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgICAgLy8gSlMgdXNlcyAxLWJhc2VkIGxpbmUgbnVtYmVycywgd2FzbSB1c2VzIDAtYmFzZWQuXG4gICAgICAgICAgICAgIG1hcHBpbmcub3JpZ2luYWxMaW5lID0gb3JpZ2luYWxMaW5lICsgMTtcbiAgICAgICAgICAgICAgbWFwcGluZy5vcmlnaW5hbENvbHVtbiA9IG9yaWdpbmFsQ29sdW1uO1xuXG4gICAgICAgICAgICAgIGlmIChoYXNOYW1lKSB7XG4gICAgICAgICAgICAgICAgbWFwcGluZy5uYW1lID0gbmFtZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYWxsYmFja1N0YWNrW2NhbGxiYWNrU3RhY2subGVuZ3RoIC0gMV0obWFwcGluZyk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHN0YXJ0X2FsbF9nZW5lcmF0ZWRfbG9jYXRpb25zX2ZvcigpIHsgY29uc29sZS50aW1lKFwiYWxsX2dlbmVyYXRlZF9sb2NhdGlvbnNfZm9yXCIpOyB9LFxuICAgICAgICAgIGVuZF9hbGxfZ2VuZXJhdGVkX2xvY2F0aW9uc19mb3IoKSB7IGNvbnNvbGUudGltZUVuZChcImFsbF9nZW5lcmF0ZWRfbG9jYXRpb25zX2ZvclwiKTsgfSxcblxuICAgICAgICAgIHN0YXJ0X2NvbXB1dGVfY29sdW1uX3NwYW5zKCkgeyBjb25zb2xlLnRpbWUoXCJjb21wdXRlX2NvbHVtbl9zcGFuc1wiKTsgfSxcbiAgICAgICAgICBlbmRfY29tcHV0ZV9jb2x1bW5fc3BhbnMoKSB7IGNvbnNvbGUudGltZUVuZChcImNvbXB1dGVfY29sdW1uX3NwYW5zXCIpOyB9LFxuXG4gICAgICAgICAgc3RhcnRfZ2VuZXJhdGVkX2xvY2F0aW9uX2ZvcigpIHsgY29uc29sZS50aW1lKFwiZ2VuZXJhdGVkX2xvY2F0aW9uX2ZvclwiKTsgfSxcbiAgICAgICAgICBlbmRfZ2VuZXJhdGVkX2xvY2F0aW9uX2ZvcigpIHsgY29uc29sZS50aW1lRW5kKFwiZ2VuZXJhdGVkX2xvY2F0aW9uX2ZvclwiKTsgfSxcblxuICAgICAgICAgIHN0YXJ0X29yaWdpbmFsX2xvY2F0aW9uX2ZvcigpIHsgY29uc29sZS50aW1lKFwib3JpZ2luYWxfbG9jYXRpb25fZm9yXCIpOyB9LFxuICAgICAgICAgIGVuZF9vcmlnaW5hbF9sb2NhdGlvbl9mb3IoKSB7IGNvbnNvbGUudGltZUVuZChcIm9yaWdpbmFsX2xvY2F0aW9uX2ZvclwiKTsgfSxcblxuICAgICAgICAgIHN0YXJ0X3BhcnNlX21hcHBpbmdzKCkgeyBjb25zb2xlLnRpbWUoXCJwYXJzZV9tYXBwaW5nc1wiKTsgfSxcbiAgICAgICAgICBlbmRfcGFyc2VfbWFwcGluZ3MoKSB7IGNvbnNvbGUudGltZUVuZChcInBhcnNlX21hcHBpbmdzXCIpOyB9LFxuXG4gICAgICAgICAgc3RhcnRfc29ydF9ieV9nZW5lcmF0ZWRfbG9jYXRpb24oKSB7IGNvbnNvbGUudGltZShcInNvcnRfYnlfZ2VuZXJhdGVkX2xvY2F0aW9uXCIpOyB9LFxuICAgICAgICAgIGVuZF9zb3J0X2J5X2dlbmVyYXRlZF9sb2NhdGlvbigpIHsgY29uc29sZS50aW1lRW5kKFwic29ydF9ieV9nZW5lcmF0ZWRfbG9jYXRpb25cIik7IH0sXG5cbiAgICAgICAgICBzdGFydF9zb3J0X2J5X29yaWdpbmFsX2xvY2F0aW9uKCkgeyBjb25zb2xlLnRpbWUoXCJzb3J0X2J5X29yaWdpbmFsX2xvY2F0aW9uXCIpOyB9LFxuICAgICAgICAgIGVuZF9zb3J0X2J5X29yaWdpbmFsX2xvY2F0aW9uKCkgeyBjb25zb2xlLnRpbWVFbmQoXCJzb3J0X2J5X29yaWdpbmFsX2xvY2F0aW9uXCIpOyB9LFxuICAgICAgICB9XG4gICAgICB9KTtcbiAgfSkudGhlbihXYXNtID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgZXhwb3J0czogV2FzbS5pbnN0YW5jZS5leHBvcnRzLFxuICAgICAgd2l0aE1hcHBpbmdDYWxsYmFjazogKG1hcHBpbmdDYWxsYmFjaywgZikgPT4ge1xuICAgICAgICBjYWxsYmFja1N0YWNrLnB1c2gobWFwcGluZ0NhbGxiYWNrKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBmKCk7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgY2FsbGJhY2tTdGFjay5wb3AoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH0pLnRoZW4obnVsbCwgZSA9PiB7XG4gICAgY2FjaGVkV2FzbSA9IG51bGw7XG4gICAgdGhyb3cgZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGNhY2hlZFdhc207XG59O1xuXG5cbi8qKiovIH0pLFxuLyogMTMgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuLyogLSotIE1vZGU6IGpzOyBqcy1pbmRlbnQtbGV2ZWw6IDI7IC0qLSAqL1xuLypcbiAqIENvcHlyaWdodCAyMDExIE1vemlsbGEgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTmV3IEJTRCBsaWNlbnNlLiBTZWUgTElDRU5TRSBvcjpcbiAqIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9CU0QtMy1DbGF1c2VcbiAqL1xuXG5jb25zdCBTb3VyY2VNYXBHZW5lcmF0b3IgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEpLlNvdXJjZU1hcEdlbmVyYXRvcjtcbmNvbnN0IHV0aWwgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG4vLyBNYXRjaGVzIGEgV2luZG93cy1zdHlsZSBgXFxyXFxuYCBuZXdsaW5lIG9yIGEgYFxcbmAgbmV3bGluZSB1c2VkIGJ5IGFsbCBvdGhlclxuLy8gb3BlcmF0aW5nIHN5c3RlbXMgdGhlc2UgZGF5cyAoY2FwdHVyaW5nIHRoZSByZXN1bHQpLlxuY29uc3QgUkVHRVhfTkVXTElORSA9IC8oXFxyP1xcbikvO1xuXG4vLyBOZXdsaW5lIGNoYXJhY3RlciBjb2RlIGZvciBjaGFyQ29kZUF0KCkgY29tcGFyaXNvbnNcbmNvbnN0IE5FV0xJTkVfQ09ERSA9IDEwO1xuXG4vLyBQcml2YXRlIHN5bWJvbCBmb3IgaWRlbnRpZnlpbmcgYFNvdXJjZU5vZGVgcyB3aGVuIG11bHRpcGxlIHZlcnNpb25zIG9mXG4vLyB0aGUgc291cmNlLW1hcCBsaWJyYXJ5IGFyZSBsb2FkZWQuIFRoaXMgTVVTVCBOT1QgQ0hBTkdFIGFjcm9zc1xuLy8gdmVyc2lvbnMhXG5jb25zdCBpc1NvdXJjZU5vZGUgPSBcIiQkJGlzU291cmNlTm9kZSQkJFwiO1xuXG4vKipcbiAqIFNvdXJjZU5vZGVzIHByb3ZpZGUgYSB3YXkgdG8gYWJzdHJhY3Qgb3ZlciBpbnRlcnBvbGF0aW5nL2NvbmNhdGVuYXRpbmdcbiAqIHNuaXBwZXRzIG9mIGdlbmVyYXRlZCBKYXZhU2NyaXB0IHNvdXJjZSBjb2RlIHdoaWxlIG1haW50YWluaW5nIHRoZSBsaW5lIGFuZFxuICogY29sdW1uIGluZm9ybWF0aW9uIGFzc29jaWF0ZWQgd2l0aCB0aGUgb3JpZ2luYWwgc291cmNlIGNvZGUuXG4gKlxuICogQHBhcmFtIGFMaW5lIFRoZSBvcmlnaW5hbCBsaW5lIG51bWJlci5cbiAqIEBwYXJhbSBhQ29sdW1uIFRoZSBvcmlnaW5hbCBjb2x1bW4gbnVtYmVyLlxuICogQHBhcmFtIGFTb3VyY2UgVGhlIG9yaWdpbmFsIHNvdXJjZSdzIGZpbGVuYW1lLlxuICogQHBhcmFtIGFDaHVua3MgT3B0aW9uYWwuIEFuIGFycmF5IG9mIHN0cmluZ3Mgd2hpY2ggYXJlIHNuaXBwZXRzIG9mXG4gKiAgICAgICAgZ2VuZXJhdGVkIEpTLCBvciBvdGhlciBTb3VyY2VOb2Rlcy5cbiAqIEBwYXJhbSBhTmFtZSBUaGUgb3JpZ2luYWwgaWRlbnRpZmllci5cbiAqL1xuY2xhc3MgU291cmNlTm9kZSB7XG4gIGNvbnN0cnVjdG9yKGFMaW5lLCBhQ29sdW1uLCBhU291cmNlLCBhQ2h1bmtzLCBhTmFtZSkge1xuICAgIHRoaXMuY2hpbGRyZW4gPSBbXTtcbiAgICB0aGlzLnNvdXJjZUNvbnRlbnRzID0ge307XG4gICAgdGhpcy5saW5lID0gYUxpbmUgPT0gbnVsbCA/IG51bGwgOiBhTGluZTtcbiAgICB0aGlzLmNvbHVtbiA9IGFDb2x1bW4gPT0gbnVsbCA/IG51bGwgOiBhQ29sdW1uO1xuICAgIHRoaXMuc291cmNlID0gYVNvdXJjZSA9PSBudWxsID8gbnVsbCA6IGFTb3VyY2U7XG4gICAgdGhpcy5uYW1lID0gYU5hbWUgPT0gbnVsbCA/IG51bGwgOiBhTmFtZTtcbiAgICB0aGlzW2lzU291cmNlTm9kZV0gPSB0cnVlO1xuICAgIGlmIChhQ2h1bmtzICE9IG51bGwpIHRoaXMuYWRkKGFDaHVua3MpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBTb3VyY2VOb2RlIGZyb20gZ2VuZXJhdGVkIGNvZGUgYW5kIGEgU291cmNlTWFwQ29uc3VtZXIuXG4gICAqXG4gICAqIEBwYXJhbSBhR2VuZXJhdGVkQ29kZSBUaGUgZ2VuZXJhdGVkIGNvZGVcbiAgICogQHBhcmFtIGFTb3VyY2VNYXBDb25zdW1lciBUaGUgU291cmNlTWFwIGZvciB0aGUgZ2VuZXJhdGVkIGNvZGVcbiAgICogQHBhcmFtIGFSZWxhdGl2ZVBhdGggT3B0aW9uYWwuIFRoZSBwYXRoIHRoYXQgcmVsYXRpdmUgc291cmNlcyBpbiB0aGVcbiAgICogICAgICAgIFNvdXJjZU1hcENvbnN1bWVyIHNob3VsZCBiZSByZWxhdGl2ZSB0by5cbiAgICovXG4gIHN0YXRpYyBmcm9tU3RyaW5nV2l0aFNvdXJjZU1hcChhR2VuZXJhdGVkQ29kZSwgYVNvdXJjZU1hcENvbnN1bWVyLCBhUmVsYXRpdmVQYXRoKSB7XG4gICAgLy8gVGhlIFNvdXJjZU5vZGUgd2Ugd2FudCB0byBmaWxsIHdpdGggdGhlIGdlbmVyYXRlZCBjb2RlXG4gICAgLy8gYW5kIHRoZSBTb3VyY2VNYXBcbiAgICBjb25zdCBub2RlID0gbmV3IFNvdXJjZU5vZGUoKTtcblxuICAgIC8vIEFsbCBldmVuIGluZGljZXMgb2YgdGhpcyBhcnJheSBhcmUgb25lIGxpbmUgb2YgdGhlIGdlbmVyYXRlZCBjb2RlLFxuICAgIC8vIHdoaWxlIGFsbCBvZGQgaW5kaWNlcyBhcmUgdGhlIG5ld2xpbmVzIGJldHdlZW4gdHdvIGFkamFjZW50IGxpbmVzXG4gICAgLy8gKHNpbmNlIGBSRUdFWF9ORVdMSU5FYCBjYXB0dXJlcyBpdHMgbWF0Y2gpLlxuICAgIC8vIFByb2Nlc3NlZCBmcmFnbWVudHMgYXJlIGFjY2Vzc2VkIGJ5IGNhbGxpbmcgYHNoaWZ0TmV4dExpbmVgLlxuICAgIGNvbnN0IHJlbWFpbmluZ0xpbmVzID0gYUdlbmVyYXRlZENvZGUuc3BsaXQoUkVHRVhfTkVXTElORSk7XG4gICAgbGV0IHJlbWFpbmluZ0xpbmVzSW5kZXggPSAwO1xuICAgIGNvbnN0IHNoaWZ0TmV4dExpbmUgPSBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGxpbmVDb250ZW50cyA9IGdldE5leHRMaW5lKCk7XG4gICAgICAvLyBUaGUgbGFzdCBsaW5lIG9mIGEgZmlsZSBtaWdodCBub3QgaGF2ZSBhIG5ld2xpbmUuXG4gICAgICBjb25zdCBuZXdMaW5lID0gZ2V0TmV4dExpbmUoKSB8fCBcIlwiO1xuICAgICAgcmV0dXJuIGxpbmVDb250ZW50cyArIG5ld0xpbmU7XG5cbiAgICAgIGZ1bmN0aW9uIGdldE5leHRMaW5lKCkge1xuICAgICAgICByZXR1cm4gcmVtYWluaW5nTGluZXNJbmRleCA8IHJlbWFpbmluZ0xpbmVzLmxlbmd0aCA/XG4gICAgICAgICAgICByZW1haW5pbmdMaW5lc1tyZW1haW5pbmdMaW5lc0luZGV4KytdIDogdW5kZWZpbmVkO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBXZSBuZWVkIHRvIHJlbWVtYmVyIHRoZSBwb3NpdGlvbiBvZiBcInJlbWFpbmluZ0xpbmVzXCJcbiAgICBsZXQgbGFzdEdlbmVyYXRlZExpbmUgPSAxLCBsYXN0R2VuZXJhdGVkQ29sdW1uID0gMDtcblxuICAgIC8vIFRoZSBnZW5lcmF0ZSBTb3VyY2VOb2RlcyB3ZSBuZWVkIGEgY29kZSByYW5nZS5cbiAgICAvLyBUbyBleHRyYWN0IGl0IGN1cnJlbnQgYW5kIGxhc3QgbWFwcGluZyBpcyB1c2VkLlxuICAgIC8vIEhlcmUgd2Ugc3RvcmUgdGhlIGxhc3QgbWFwcGluZy5cbiAgICBsZXQgbGFzdE1hcHBpbmcgPSBudWxsO1xuICAgIGxldCBuZXh0TGluZTtcblxuICAgIGFTb3VyY2VNYXBDb25zdW1lci5lYWNoTWFwcGluZyhmdW5jdGlvbihtYXBwaW5nKSB7XG4gICAgICBpZiAobGFzdE1hcHBpbmcgIT09IG51bGwpIHtcbiAgICAgICAgLy8gV2UgYWRkIHRoZSBjb2RlIGZyb20gXCJsYXN0TWFwcGluZ1wiIHRvIFwibWFwcGluZ1wiOlxuICAgICAgICAvLyBGaXJzdCBjaGVjayBpZiB0aGVyZSBpcyBhIG5ldyBsaW5lIGluIGJldHdlZW4uXG4gICAgICAgIGlmIChsYXN0R2VuZXJhdGVkTGluZSA8IG1hcHBpbmcuZ2VuZXJhdGVkTGluZSkge1xuICAgICAgICAgIC8vIEFzc29jaWF0ZSBmaXJzdCBsaW5lIHdpdGggXCJsYXN0TWFwcGluZ1wiXG4gICAgICAgICAgYWRkTWFwcGluZ1dpdGhDb2RlKGxhc3RNYXBwaW5nLCBzaGlmdE5leHRMaW5lKCkpO1xuICAgICAgICAgIGxhc3RHZW5lcmF0ZWRMaW5lKys7XG4gICAgICAgICAgbGFzdEdlbmVyYXRlZENvbHVtbiA9IDA7XG4gICAgICAgICAgLy8gVGhlIHJlbWFpbmluZyBjb2RlIGlzIGFkZGVkIHdpdGhvdXQgbWFwcGluZ1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFRoZXJlIGlzIG5vIG5ldyBsaW5lIGluIGJldHdlZW4uXG4gICAgICAgICAgLy8gQXNzb2NpYXRlIHRoZSBjb2RlIGJldHdlZW4gXCJsYXN0R2VuZXJhdGVkQ29sdW1uXCIgYW5kXG4gICAgICAgICAgLy8gXCJtYXBwaW5nLmdlbmVyYXRlZENvbHVtblwiIHdpdGggXCJsYXN0TWFwcGluZ1wiXG4gICAgICAgICAgbmV4dExpbmUgPSByZW1haW5pbmdMaW5lc1tyZW1haW5pbmdMaW5lc0luZGV4XSB8fCBcIlwiO1xuICAgICAgICAgIGNvbnN0IGNvZGUgPSBuZXh0TGluZS5zdWJzdHIoMCwgbWFwcGluZy5nZW5lcmF0ZWRDb2x1bW4gLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RHZW5lcmF0ZWRDb2x1bW4pO1xuICAgICAgICAgIHJlbWFpbmluZ0xpbmVzW3JlbWFpbmluZ0xpbmVzSW5kZXhdID0gbmV4dExpbmUuc3Vic3RyKG1hcHBpbmcuZ2VuZXJhdGVkQ29sdW1uIC1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0R2VuZXJhdGVkQ29sdW1uKTtcbiAgICAgICAgICBsYXN0R2VuZXJhdGVkQ29sdW1uID0gbWFwcGluZy5nZW5lcmF0ZWRDb2x1bW47XG4gICAgICAgICAgYWRkTWFwcGluZ1dpdGhDb2RlKGxhc3RNYXBwaW5nLCBjb2RlKTtcbiAgICAgICAgICAvLyBObyBtb3JlIHJlbWFpbmluZyBjb2RlLCBjb250aW51ZVxuICAgICAgICAgIGxhc3RNYXBwaW5nID0gbWFwcGluZztcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIFdlIGFkZCB0aGUgZ2VuZXJhdGVkIGNvZGUgdW50aWwgdGhlIGZpcnN0IG1hcHBpbmdcbiAgICAgIC8vIHRvIHRoZSBTb3VyY2VOb2RlIHdpdGhvdXQgYW55IG1hcHBpbmcuXG4gICAgICAvLyBFYWNoIGxpbmUgaXMgYWRkZWQgYXMgc2VwYXJhdGUgc3RyaW5nLlxuICAgICAgd2hpbGUgKGxhc3RHZW5lcmF0ZWRMaW5lIDwgbWFwcGluZy5nZW5lcmF0ZWRMaW5lKSB7XG4gICAgICAgIG5vZGUuYWRkKHNoaWZ0TmV4dExpbmUoKSk7XG4gICAgICAgIGxhc3RHZW5lcmF0ZWRMaW5lKys7XG4gICAgICB9XG4gICAgICBpZiAobGFzdEdlbmVyYXRlZENvbHVtbiA8IG1hcHBpbmcuZ2VuZXJhdGVkQ29sdW1uKSB7XG4gICAgICAgIG5leHRMaW5lID0gcmVtYWluaW5nTGluZXNbcmVtYWluaW5nTGluZXNJbmRleF0gfHwgXCJcIjtcbiAgICAgICAgbm9kZS5hZGQobmV4dExpbmUuc3Vic3RyKDAsIG1hcHBpbmcuZ2VuZXJhdGVkQ29sdW1uKSk7XG4gICAgICAgIHJlbWFpbmluZ0xpbmVzW3JlbWFpbmluZ0xpbmVzSW5kZXhdID0gbmV4dExpbmUuc3Vic3RyKG1hcHBpbmcuZ2VuZXJhdGVkQ29sdW1uKTtcbiAgICAgICAgbGFzdEdlbmVyYXRlZENvbHVtbiA9IG1hcHBpbmcuZ2VuZXJhdGVkQ29sdW1uO1xuICAgICAgfVxuICAgICAgbGFzdE1hcHBpbmcgPSBtYXBwaW5nO1xuICAgIH0sIHRoaXMpO1xuICAgIC8vIFdlIGhhdmUgcHJvY2Vzc2VkIGFsbCBtYXBwaW5ncy5cbiAgICBpZiAocmVtYWluaW5nTGluZXNJbmRleCA8IHJlbWFpbmluZ0xpbmVzLmxlbmd0aCkge1xuICAgICAgaWYgKGxhc3RNYXBwaW5nKSB7XG4gICAgICAgIC8vIEFzc29jaWF0ZSB0aGUgcmVtYWluaW5nIGNvZGUgaW4gdGhlIGN1cnJlbnQgbGluZSB3aXRoIFwibGFzdE1hcHBpbmdcIlxuICAgICAgICBhZGRNYXBwaW5nV2l0aENvZGUobGFzdE1hcHBpbmcsIHNoaWZ0TmV4dExpbmUoKSk7XG4gICAgICB9XG4gICAgICAvLyBhbmQgYWRkIHRoZSByZW1haW5pbmcgbGluZXMgd2l0aG91dCBhbnkgbWFwcGluZ1xuICAgICAgbm9kZS5hZGQocmVtYWluaW5nTGluZXMuc3BsaWNlKHJlbWFpbmluZ0xpbmVzSW5kZXgpLmpvaW4oXCJcIikpO1xuICAgIH1cblxuICAgIC8vIENvcHkgc291cmNlc0NvbnRlbnQgaW50byBTb3VyY2VOb2RlXG4gICAgYVNvdXJjZU1hcENvbnN1bWVyLnNvdXJjZXMuZm9yRWFjaChmdW5jdGlvbihzb3VyY2VGaWxlKSB7XG4gICAgICBjb25zdCBjb250ZW50ID0gYVNvdXJjZU1hcENvbnN1bWVyLnNvdXJjZUNvbnRlbnRGb3Ioc291cmNlRmlsZSk7XG4gICAgICBpZiAoY29udGVudCAhPSBudWxsKSB7XG4gICAgICAgIGlmIChhUmVsYXRpdmVQYXRoICE9IG51bGwpIHtcbiAgICAgICAgICBzb3VyY2VGaWxlID0gdXRpbC5qb2luKGFSZWxhdGl2ZVBhdGgsIHNvdXJjZUZpbGUpO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUuc2V0U291cmNlQ29udGVudChzb3VyY2VGaWxlLCBjb250ZW50KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBub2RlO1xuXG4gICAgZnVuY3Rpb24gYWRkTWFwcGluZ1dpdGhDb2RlKG1hcHBpbmcsIGNvZGUpIHtcbiAgICAgIGlmIChtYXBwaW5nID09PSBudWxsIHx8IG1hcHBpbmcuc291cmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbm9kZS5hZGQoY29kZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBzb3VyY2UgPSBhUmVsYXRpdmVQYXRoXG4gICAgICAgICAgPyB1dGlsLmpvaW4oYVJlbGF0aXZlUGF0aCwgbWFwcGluZy5zb3VyY2UpXG4gICAgICAgICAgOiBtYXBwaW5nLnNvdXJjZTtcbiAgICAgICAgbm9kZS5hZGQobmV3IFNvdXJjZU5vZGUobWFwcGluZy5vcmlnaW5hbExpbmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcHBpbmcub3JpZ2luYWxDb2x1bW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwcGluZy5uYW1lKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIGNodW5rIG9mIGdlbmVyYXRlZCBKUyB0byB0aGlzIHNvdXJjZSBub2RlLlxuICAgKlxuICAgKiBAcGFyYW0gYUNodW5rIEEgc3RyaW5nIHNuaXBwZXQgb2YgZ2VuZXJhdGVkIEpTIGNvZGUsIGFub3RoZXIgaW5zdGFuY2Ugb2ZcbiAgICogICAgICAgIFNvdXJjZU5vZGUsIG9yIGFuIGFycmF5IHdoZXJlIGVhY2ggbWVtYmVyIGlzIG9uZSBvZiB0aG9zZSB0aGluZ3MuXG4gICAqL1xuICBhZGQoYUNodW5rKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYUNodW5rKSkge1xuICAgICAgYUNodW5rLmZvckVhY2goZnVuY3Rpb24oY2h1bmspIHtcbiAgICAgICAgdGhpcy5hZGQoY2h1bmspO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfSBlbHNlIGlmIChhQ2h1bmtbaXNTb3VyY2VOb2RlXSB8fCB0eXBlb2YgYUNodW5rID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBpZiAoYUNodW5rKSB7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaChhQ2h1bmspO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICBcIkV4cGVjdGVkIGEgU291cmNlTm9kZSwgc3RyaW5nLCBvciBhbiBhcnJheSBvZiBTb3VyY2VOb2RlcyBhbmQgc3RyaW5ncy4gR290IFwiICsgYUNodW5rXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBjaHVuayBvZiBnZW5lcmF0ZWQgSlMgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGlzIHNvdXJjZSBub2RlLlxuICAgKlxuICAgKiBAcGFyYW0gYUNodW5rIEEgc3RyaW5nIHNuaXBwZXQgb2YgZ2VuZXJhdGVkIEpTIGNvZGUsIGFub3RoZXIgaW5zdGFuY2Ugb2ZcbiAgICogICAgICAgIFNvdXJjZU5vZGUsIG9yIGFuIGFycmF5IHdoZXJlIGVhY2ggbWVtYmVyIGlzIG9uZSBvZiB0aG9zZSB0aGluZ3MuXG4gICAqL1xuICBwcmVwZW5kKGFDaHVuaykge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGFDaHVuaykpIHtcbiAgICAgIGZvciAobGV0IGkgPSBhQ2h1bmsubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgdGhpcy5wcmVwZW5kKGFDaHVua1tpXSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChhQ2h1bmtbaXNTb3VyY2VOb2RlXSB8fCB0eXBlb2YgYUNodW5rID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB0aGlzLmNoaWxkcmVuLnVuc2hpZnQoYUNodW5rKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgXCJFeHBlY3RlZCBhIFNvdXJjZU5vZGUsIHN0cmluZywgb3IgYW4gYXJyYXkgb2YgU291cmNlTm9kZXMgYW5kIHN0cmluZ3MuIEdvdCBcIiArIGFDaHVua1xuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogV2FsayBvdmVyIHRoZSB0cmVlIG9mIEpTIHNuaXBwZXRzIGluIHRoaXMgbm9kZSBhbmQgaXRzIGNoaWxkcmVuLiBUaGVcbiAgICogd2Fsa2luZyBmdW5jdGlvbiBpcyBjYWxsZWQgb25jZSBmb3IgZWFjaCBzbmlwcGV0IG9mIEpTIGFuZCBpcyBwYXNzZWQgdGhhdFxuICAgKiBzbmlwcGV0IGFuZCB0aGUgaXRzIG9yaWdpbmFsIGFzc29jaWF0ZWQgc291cmNlJ3MgbGluZS9jb2x1bW4gbG9jYXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSBhRm4gVGhlIHRyYXZlcnNhbCBmdW5jdGlvbi5cbiAgICovXG4gIHdhbGsoYUZuKSB7XG4gICAgbGV0IGNodW5rO1xuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjaHVuayA9IHRoaXMuY2hpbGRyZW5baV07XG4gICAgICBpZiAoY2h1bmtbaXNTb3VyY2VOb2RlXSkge1xuICAgICAgICBjaHVuay53YWxrKGFGbik7XG4gICAgICB9IGVsc2UgaWYgKGNodW5rICE9PSBcIlwiKSB7XG4gICAgICAgIGFGbihjaHVuaywgeyBzb3VyY2U6IHRoaXMuc291cmNlLFxuICAgICAgICAgICAgICAgICAgICAgIGxpbmU6IHRoaXMubGluZSxcbiAgICAgICAgICAgICAgICAgICAgICBjb2x1bW46IHRoaXMuY29sdW1uLFxuICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMubmFtZSB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTGlrZSBgU3RyaW5nLnByb3RvdHlwZS5qb2luYCBleGNlcHQgZm9yIFNvdXJjZU5vZGVzLiBJbnNlcnRzIGBhU3RyYCBiZXR3ZWVuXG4gICAqIGVhY2ggb2YgYHRoaXMuY2hpbGRyZW5gLlxuICAgKlxuICAgKiBAcGFyYW0gYVNlcCBUaGUgc2VwYXJhdG9yLlxuICAgKi9cbiAgam9pbihhU2VwKSB7XG4gICAgbGV0IG5ld0NoaWxkcmVuO1xuICAgIGxldCBpO1xuICAgIGNvbnN0IGxlbiA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoO1xuICAgIGlmIChsZW4gPiAwKSB7XG4gICAgICBuZXdDaGlsZHJlbiA9IFtdO1xuICAgICAgZm9yIChpID0gMDsgaSA8IGxlbiAtIDE7IGkrKykge1xuICAgICAgICBuZXdDaGlsZHJlbi5wdXNoKHRoaXMuY2hpbGRyZW5baV0pO1xuICAgICAgICBuZXdDaGlsZHJlbi5wdXNoKGFTZXApO1xuICAgICAgfVxuICAgICAgbmV3Q2hpbGRyZW4ucHVzaCh0aGlzLmNoaWxkcmVuW2ldKTtcbiAgICAgIHRoaXMuY2hpbGRyZW4gPSBuZXdDaGlsZHJlbjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbCBTdHJpbmcucHJvdG90eXBlLnJlcGxhY2Ugb24gdGhlIHZlcnkgcmlnaHQtbW9zdCBzb3VyY2Ugc25pcHBldC4gVXNlZnVsXG4gICAqIGZvciB0cmltbWluZyB3aGl0ZXNwYWNlIGZyb20gdGhlIGVuZCBvZiBhIHNvdXJjZSBub2RlLCBldGMuXG4gICAqXG4gICAqIEBwYXJhbSBhUGF0dGVybiBUaGUgcGF0dGVybiB0byByZXBsYWNlLlxuICAgKiBAcGFyYW0gYVJlcGxhY2VtZW50IFRoZSB0aGluZyB0byByZXBsYWNlIHRoZSBwYXR0ZXJuIHdpdGguXG4gICAqL1xuICByZXBsYWNlUmlnaHQoYVBhdHRlcm4sIGFSZXBsYWNlbWVudCkge1xuICAgIGNvbnN0IGxhc3RDaGlsZCA9IHRoaXMuY2hpbGRyZW5bdGhpcy5jaGlsZHJlbi5sZW5ndGggLSAxXTtcbiAgICBpZiAobGFzdENoaWxkW2lzU291cmNlTm9kZV0pIHtcbiAgICAgIGxhc3RDaGlsZC5yZXBsYWNlUmlnaHQoYVBhdHRlcm4sIGFSZXBsYWNlbWVudCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbGFzdENoaWxkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB0aGlzLmNoaWxkcmVuW3RoaXMuY2hpbGRyZW4ubGVuZ3RoIC0gMV0gPSBsYXN0Q2hpbGQucmVwbGFjZShhUGF0dGVybiwgYVJlcGxhY2VtZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jaGlsZHJlbi5wdXNoKFwiXCIucmVwbGFjZShhUGF0dGVybiwgYVJlcGxhY2VtZW50KSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgc291cmNlIGNvbnRlbnQgZm9yIGEgc291cmNlIGZpbGUuIFRoaXMgd2lsbCBiZSBhZGRlZCB0byB0aGUgU291cmNlTWFwR2VuZXJhdG9yXG4gICAqIGluIHRoZSBzb3VyY2VzQ29udGVudCBmaWVsZC5cbiAgICpcbiAgICogQHBhcmFtIGFTb3VyY2VGaWxlIFRoZSBmaWxlbmFtZSBvZiB0aGUgc291cmNlIGZpbGVcbiAgICogQHBhcmFtIGFTb3VyY2VDb250ZW50IFRoZSBjb250ZW50IG9mIHRoZSBzb3VyY2UgZmlsZVxuICAgKi9cbiAgc2V0U291cmNlQ29udGVudChhU291cmNlRmlsZSwgYVNvdXJjZUNvbnRlbnQpIHtcbiAgICB0aGlzLnNvdXJjZUNvbnRlbnRzW3V0aWwudG9TZXRTdHJpbmcoYVNvdXJjZUZpbGUpXSA9IGFTb3VyY2VDb250ZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIFdhbGsgb3ZlciB0aGUgdHJlZSBvZiBTb3VyY2VOb2Rlcy4gVGhlIHdhbGtpbmcgZnVuY3Rpb24gaXMgY2FsbGVkIGZvciBlYWNoXG4gICAqIHNvdXJjZSBmaWxlIGNvbnRlbnQgYW5kIGlzIHBhc3NlZCB0aGUgZmlsZW5hbWUgYW5kIHNvdXJjZSBjb250ZW50LlxuICAgKlxuICAgKiBAcGFyYW0gYUZuIFRoZSB0cmF2ZXJzYWwgZnVuY3Rpb24uXG4gICAqL1xuICB3YWxrU291cmNlQ29udGVudHMoYUZuKSB7XG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLmNoaWxkcmVuW2ldW2lzU291cmNlTm9kZV0pIHtcbiAgICAgICAgdGhpcy5jaGlsZHJlbltpXS53YWxrU291cmNlQ29udGVudHMoYUZuKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBzb3VyY2VzID0gT2JqZWN0LmtleXModGhpcy5zb3VyY2VDb250ZW50cyk7XG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHNvdXJjZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGFGbih1dGlsLmZyb21TZXRTdHJpbmcoc291cmNlc1tpXSksIHRoaXMuc291cmNlQ29udGVudHNbc291cmNlc1tpXV0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGlzIHNvdXJjZSBub2RlLiBXYWxrcyBvdmVyIHRoZSB0cmVlXG4gICAqIGFuZCBjb25jYXRlbmF0ZXMgYWxsIHRoZSB2YXJpb3VzIHNuaXBwZXRzIHRvZ2V0aGVyIHRvIG9uZSBzdHJpbmcuXG4gICAqL1xuICB0b1N0cmluZygpIHtcbiAgICBsZXQgc3RyID0gXCJcIjtcbiAgICB0aGlzLndhbGsoZnVuY3Rpb24oY2h1bmspIHtcbiAgICAgIHN0ciArPSBjaHVuaztcbiAgICB9KTtcbiAgICByZXR1cm4gc3RyO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGlzIHNvdXJjZSBub2RlIGFsb25nIHdpdGggYSBzb3VyY2VcbiAgICogbWFwLlxuICAgKi9cbiAgdG9TdHJpbmdXaXRoU291cmNlTWFwKGFBcmdzKSB7XG4gICAgY29uc3QgZ2VuZXJhdGVkID0ge1xuICAgICAgY29kZTogXCJcIixcbiAgICAgIGxpbmU6IDEsXG4gICAgICBjb2x1bW46IDBcbiAgICB9O1xuICAgIGNvbnN0IG1hcCA9IG5ldyBTb3VyY2VNYXBHZW5lcmF0b3IoYUFyZ3MpO1xuICAgIGxldCBzb3VyY2VNYXBwaW5nQWN0aXZlID0gZmFsc2U7XG4gICAgbGV0IGxhc3RPcmlnaW5hbFNvdXJjZSA9IG51bGw7XG4gICAgbGV0IGxhc3RPcmlnaW5hbExpbmUgPSBudWxsO1xuICAgIGxldCBsYXN0T3JpZ2luYWxDb2x1bW4gPSBudWxsO1xuICAgIGxldCBsYXN0T3JpZ2luYWxOYW1lID0gbnVsbDtcbiAgICB0aGlzLndhbGsoZnVuY3Rpb24oY2h1bmssIG9yaWdpbmFsKSB7XG4gICAgICBnZW5lcmF0ZWQuY29kZSArPSBjaHVuaztcbiAgICAgIGlmIChvcmlnaW5hbC5zb3VyY2UgIT09IG51bGxcbiAgICAgICAgICAmJiBvcmlnaW5hbC5saW5lICE9PSBudWxsXG4gICAgICAgICAgJiYgb3JpZ2luYWwuY29sdW1uICE9PSBudWxsKSB7XG4gICAgICAgIGlmIChsYXN0T3JpZ2luYWxTb3VyY2UgIT09IG9yaWdpbmFsLnNvdXJjZVxuICAgICAgICAgIHx8IGxhc3RPcmlnaW5hbExpbmUgIT09IG9yaWdpbmFsLmxpbmVcbiAgICAgICAgICB8fCBsYXN0T3JpZ2luYWxDb2x1bW4gIT09IG9yaWdpbmFsLmNvbHVtblxuICAgICAgICAgIHx8IGxhc3RPcmlnaW5hbE5hbWUgIT09IG9yaWdpbmFsLm5hbWUpIHtcbiAgICAgICAgICBtYXAuYWRkTWFwcGluZyh7XG4gICAgICAgICAgICBzb3VyY2U6IG9yaWdpbmFsLnNvdXJjZSxcbiAgICAgICAgICAgIG9yaWdpbmFsOiB7XG4gICAgICAgICAgICAgIGxpbmU6IG9yaWdpbmFsLmxpbmUsXG4gICAgICAgICAgICAgIGNvbHVtbjogb3JpZ2luYWwuY29sdW1uXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2VuZXJhdGVkOiB7XG4gICAgICAgICAgICAgIGxpbmU6IGdlbmVyYXRlZC5saW5lLFxuICAgICAgICAgICAgICBjb2x1bW46IGdlbmVyYXRlZC5jb2x1bW5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBuYW1lOiBvcmlnaW5hbC5uYW1lXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgbGFzdE9yaWdpbmFsU291cmNlID0gb3JpZ2luYWwuc291cmNlO1xuICAgICAgICBsYXN0T3JpZ2luYWxMaW5lID0gb3JpZ2luYWwubGluZTtcbiAgICAgICAgbGFzdE9yaWdpbmFsQ29sdW1uID0gb3JpZ2luYWwuY29sdW1uO1xuICAgICAgICBsYXN0T3JpZ2luYWxOYW1lID0gb3JpZ2luYWwubmFtZTtcbiAgICAgICAgc291cmNlTWFwcGluZ0FjdGl2ZSA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHNvdXJjZU1hcHBpbmdBY3RpdmUpIHtcbiAgICAgICAgbWFwLmFkZE1hcHBpbmcoe1xuICAgICAgICAgIGdlbmVyYXRlZDoge1xuICAgICAgICAgICAgbGluZTogZ2VuZXJhdGVkLmxpbmUsXG4gICAgICAgICAgICBjb2x1bW46IGdlbmVyYXRlZC5jb2x1bW5cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBsYXN0T3JpZ2luYWxTb3VyY2UgPSBudWxsO1xuICAgICAgICBzb3VyY2VNYXBwaW5nQWN0aXZlID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBmb3IgKGxldCBpZHggPSAwLCBsZW5ndGggPSBjaHVuay5sZW5ndGg7IGlkeCA8IGxlbmd0aDsgaWR4KyspIHtcbiAgICAgICAgaWYgKGNodW5rLmNoYXJDb2RlQXQoaWR4KSA9PT0gTkVXTElORV9DT0RFKSB7XG4gICAgICAgICAgZ2VuZXJhdGVkLmxpbmUrKztcbiAgICAgICAgICBnZW5lcmF0ZWQuY29sdW1uID0gMDtcbiAgICAgICAgICAvLyBNYXBwaW5ncyBlbmQgYXQgZW9sXG4gICAgICAgICAgaWYgKGlkeCArIDEgPT09IGxlbmd0aCkge1xuICAgICAgICAgICAgbGFzdE9yaWdpbmFsU291cmNlID0gbnVsbDtcbiAgICAgICAgICAgIHNvdXJjZU1hcHBpbmdBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHNvdXJjZU1hcHBpbmdBY3RpdmUpIHtcbiAgICAgICAgICAgIG1hcC5hZGRNYXBwaW5nKHtcbiAgICAgICAgICAgICAgc291cmNlOiBvcmlnaW5hbC5zb3VyY2UsXG4gICAgICAgICAgICAgIG9yaWdpbmFsOiB7XG4gICAgICAgICAgICAgICAgbGluZTogb3JpZ2luYWwubGluZSxcbiAgICAgICAgICAgICAgICBjb2x1bW46IG9yaWdpbmFsLmNvbHVtblxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBnZW5lcmF0ZWQ6IHtcbiAgICAgICAgICAgICAgICBsaW5lOiBnZW5lcmF0ZWQubGluZSxcbiAgICAgICAgICAgICAgICBjb2x1bW46IGdlbmVyYXRlZC5jb2x1bW5cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgbmFtZTogb3JpZ2luYWwubmFtZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGdlbmVyYXRlZC5jb2x1bW4rKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMud2Fsa1NvdXJjZUNvbnRlbnRzKGZ1bmN0aW9uKHNvdXJjZUZpbGUsIHNvdXJjZUNvbnRlbnQpIHtcbiAgICAgIG1hcC5zZXRTb3VyY2VDb250ZW50KHNvdXJjZUZpbGUsIHNvdXJjZUNvbnRlbnQpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHsgY29kZTogZ2VuZXJhdGVkLmNvZGUsIG1hcCB9O1xuICB9XG59XG5cbmV4cG9ydHMuU291cmNlTm9kZSA9IFNvdXJjZU5vZGU7XG5cblxuLyoqKi8gfSlcbi8qKioqKiovIF0pO1xufSk7Il0sIm5hbWVzIjpbIndlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwicm9vdCIsImZhY3RvcnkiLCJleHBvcnRzIiwibW9kdWxlIiwicmVxdWlyZSIsImRlZmluZSIsImFtZCIsInNlbGYiLCJfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzEwX18iLCJfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzExX18iLCJtb2R1bGVzIiwiaW5zdGFsbGVkTW9kdWxlcyIsIl9fd2VicGFja19yZXF1aXJlX18iLCJtb2R1bGVJZCIsImkiLCJsIiwiY2FsbCIsIm0iLCJjIiwiZCIsIm5hbWUiLCJnZXR0ZXIiLCJvIiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydHkiLCJjb25maWd1cmFibGUiLCJlbnVtZXJhYmxlIiwiZ2V0IiwibiIsIl9fZXNNb2R1bGUiLCJnZXREZWZhdWx0IiwiZ2V0TW9kdWxlRXhwb3J0cyIsIm9iamVjdCIsInByb3BlcnR5IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJwIiwicyIsImdldEFyZyIsImFBcmdzIiwiYU5hbWUiLCJhRGVmYXVsdFZhbHVlIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwiRXJyb3IiLCJ1cmxSZWdleHAiLCJkYXRhVXJsUmVnZXhwIiwidXJsUGFyc2UiLCJhVXJsIiwibWF0Y2giLCJzY2hlbWUiLCJhdXRoIiwiaG9zdCIsInBvcnQiLCJwYXRoIiwidXJsR2VuZXJhdGUiLCJhUGFyc2VkVXJsIiwidXJsIiwiTUFYX0NBQ0hFRF9JTlBVVFMiLCJscnVNZW1vaXplIiwiZiIsImNhY2hlIiwiaW5wdXQiLCJ0ZW1wIiwicmVzdWx0IiwidW5zaGlmdCIsInBvcCIsIm5vcm1hbGl6ZSIsImFQYXRoIiwiaXNBYnNvbHV0ZSIsInBhcnRzIiwic3RhcnQiLCJpbmRleE9mIiwicHVzaCIsInNsaWNlIiwidXAiLCJwYXJ0Iiwic3BsaWNlIiwiam9pbiIsImFSb290IiwiYVBhdGhVcmwiLCJhUm9vdFVybCIsImpvaW5lZCIsImNoYXJBdCIsInJlcGxhY2UiLCJ0ZXN0IiwicmVsYXRpdmUiLCJsZXZlbCIsImluZGV4IiwibGFzdEluZGV4T2YiLCJBcnJheSIsInN1YnN0ciIsInN1cHBvcnRzTnVsbFByb3RvIiwib2JqIiwiY3JlYXRlIiwiaWRlbnRpdHkiLCJ0b1NldFN0cmluZyIsImFTdHIiLCJpc1Byb3RvU3RyaW5nIiwiZnJvbVNldFN0cmluZyIsImNoYXJDb2RlQXQiLCJjb21wYXJlQnlPcmlnaW5hbFBvc2l0aW9ucyIsIm1hcHBpbmdBIiwibWFwcGluZ0IiLCJvbmx5Q29tcGFyZU9yaWdpbmFsIiwiY21wIiwic3RyY21wIiwic291cmNlIiwib3JpZ2luYWxMaW5lIiwib3JpZ2luYWxDb2x1bW4iLCJnZW5lcmF0ZWRDb2x1bW4iLCJnZW5lcmF0ZWRMaW5lIiwiY29tcGFyZUJ5R2VuZXJhdGVkUG9zaXRpb25zRGVmbGF0ZWQiLCJvbmx5Q29tcGFyZUdlbmVyYXRlZCIsImFTdHIxIiwiYVN0cjIiLCJjb21wYXJlQnlHZW5lcmF0ZWRQb3NpdGlvbnNJbmZsYXRlZCIsInBhcnNlU291cmNlTWFwSW5wdXQiLCJzdHIiLCJKU09OIiwicGFyc2UiLCJjb21wdXRlU291cmNlVVJMIiwic291cmNlUm9vdCIsInNvdXJjZVVSTCIsInNvdXJjZU1hcFVSTCIsInBhcnNlZCIsInN1YnN0cmluZyIsImJhc2U2NFZMUSIsInV0aWwiLCJBcnJheVNldCIsIk1hcHBpbmdMaXN0IiwiU291cmNlTWFwR2VuZXJhdG9yIiwiZnJvbVNvdXJjZU1hcCIsImFTb3VyY2VNYXBDb25zdW1lciIsImdlbmVyYXRvciIsImZpbGUiLCJlYWNoTWFwcGluZyIsIm1hcHBpbmciLCJuZXdNYXBwaW5nIiwiZ2VuZXJhdGVkIiwibGluZSIsImNvbHVtbiIsIm9yaWdpbmFsIiwiYWRkTWFwcGluZyIsInNvdXJjZXMiLCJmb3JFYWNoIiwic291cmNlRmlsZSIsInNvdXJjZVJlbGF0aXZlIiwiX3NvdXJjZXMiLCJoYXMiLCJhZGQiLCJjb250ZW50Iiwic291cmNlQ29udGVudEZvciIsInNldFNvdXJjZUNvbnRlbnQiLCJfc2tpcFZhbGlkYXRpb24iLCJfdmFsaWRhdGVNYXBwaW5nIiwiU3RyaW5nIiwiX25hbWVzIiwiX21hcHBpbmdzIiwiYVNvdXJjZUZpbGUiLCJhU291cmNlQ29udGVudCIsIl9zb3VyY2VSb290IiwiX3NvdXJjZXNDb250ZW50cyIsImtleXMiLCJhcHBseVNvdXJjZU1hcCIsImFTb3VyY2VNYXBQYXRoIiwibmV3U291cmNlcyIsInRvQXJyYXkiLCJuZXdOYW1lcyIsInVuc29ydGVkRm9yRWFjaCIsIm9yaWdpbmFsUG9zaXRpb25Gb3IiLCJzcmNGaWxlIiwiYUdlbmVyYXRlZCIsImFPcmlnaW5hbCIsImFTb3VyY2UiLCJzdHJpbmdpZnkiLCJfc2VyaWFsaXplTWFwcGluZ3MiLCJwcmV2aW91c0dlbmVyYXRlZENvbHVtbiIsInByZXZpb3VzR2VuZXJhdGVkTGluZSIsInByZXZpb3VzT3JpZ2luYWxDb2x1bW4iLCJwcmV2aW91c09yaWdpbmFsTGluZSIsInByZXZpb3VzTmFtZSIsInByZXZpb3VzU291cmNlIiwibmV4dCIsIm5hbWVJZHgiLCJzb3VyY2VJZHgiLCJtYXBwaW5ncyIsImxlbiIsImVuY29kZSIsIl9nZW5lcmF0ZVNvdXJjZXNDb250ZW50IiwiYVNvdXJjZXMiLCJhU291cmNlUm9vdCIsIm1hcCIsImtleSIsInRvSlNPTiIsInZlcnNpb24iLCJfdmVyc2lvbiIsIm5hbWVzIiwiX2ZpbGUiLCJzb3VyY2VzQ29udGVudCIsInRvU3RyaW5nIiwiY29uc3RydWN0b3IiLCJiYXNlNjQiLCJWTFFfQkFTRV9TSElGVCIsIlZMUV9CQVNFIiwiVkxRX0JBU0VfTUFTSyIsIlZMUV9DT05USU5VQVRJT05fQklUIiwidG9WTFFTaWduZWQiLCJhVmFsdWUiLCJmcm9tVkxRU2lnbmVkIiwiaXNOZWdhdGl2ZSIsInNoaWZ0ZWQiLCJiYXNlNjRWTFFfZW5jb2RlIiwiZW5jb2RlZCIsImRpZ2l0IiwidmxxIiwiZnJvbUFycmF5IiwiYUFycmF5IiwiYUFsbG93RHVwbGljYXRlcyIsInNldCIsInNpemUiLCJfc2V0IiwiaXNEdXBsaWNhdGUiLCJpZHgiLCJfYXJyYXkiLCJhdCIsImFJZHgiLCJNYXAiLCJfX2Rpcm5hbWUiLCJmZXRjaCIsIm1hcHBpbmdzV2FzbVVybCIsInJlYWRXYXNtIiwidGhlbiIsInJlc3BvbnNlIiwiYXJyYXlCdWZmZXIiLCJpbml0aWFsaXplIiwiZnMiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIndhc21QYXRoIiwicmVhZEZpbGUiLCJlcnJvciIsImRhdGEiLCJidWZmZXIiLCJfIiwiY29uc29sZSIsImRlYnVnIiwiU291cmNlTWFwQ29uc3VtZXIiLCJTb3VyY2VOb2RlIiwiaW50VG9DaGFyTWFwIiwic3BsaXQiLCJudW1iZXIiLCJUeXBlRXJyb3IiLCJnZW5lcmF0ZWRQb3NpdGlvbkFmdGVyIiwibGluZUEiLCJsaW5lQiIsImNvbHVtbkEiLCJjb2x1bW5CIiwiYUNhbGxiYWNrIiwiYVRoaXNBcmciLCJhTWFwcGluZyIsIl9sYXN0IiwiX3NvcnRlZCIsInNvcnQiLCJiaW5hcnlTZWFyY2giLCJ3YXNtIiwiSU5URVJOQUwiLCJTeW1ib2wiLCJvcHRzIiwiYVNvdXJjZU1hcCIsImFTb3VyY2VNYXBVUkwiLCJfZmFjdG9yeUJTTSIsIndpdGgiLCJyYXdTb3VyY2VNYXAiLCJzb3VyY2VNYXBVcmwiLCJjb25zdW1lciIsInByb21pc2UiLCJ4IiwiZGVzdHJveSIsImUiLCJfcGFyc2VNYXBwaW5ncyIsImFDb250ZXh0IiwiYU9yZGVyIiwiYWxsR2VuZXJhdGVkUG9zaXRpb25zRm9yIiwiX2ZhY3RvcnkiLCJHRU5FUkFURURfT1JERVIiLCJPUklHSU5BTF9PUkRFUiIsIkdSRUFURVNUX0xPV0VSX0JPVU5EIiwiTEVBU1RfVVBQRVJfQk9VTkQiLCJCYXNpY1NvdXJjZU1hcENvbnN1bWVyIiwiX2ZpbmRTb3VyY2VJbmRleCIsInJlbGF0aXZlU291cmNlIiwiX2Fic29sdXRlU291cmNlcyIsIl9nZXRNYXBwaW5nc1B0ciIsIl9tYXBwaW5nc1B0ciIsIm1hcHBpbmdzQnVmUHRyIiwiX3dhc20iLCJhbGxvY2F0ZV9tYXBwaW5ncyIsIm1hcHBpbmdzQnVmIiwiVWludDhBcnJheSIsIm1lbW9yeSIsIm1hcHBpbmdzUHRyIiwicGFyc2VfbWFwcGluZ3MiLCJnZXRfbGFzdF9lcnJvciIsIm1zZyIsImNvbnRleHQiLCJvcmRlciIsIndpdGhNYXBwaW5nQ2FsbGJhY2siLCJfc291cmNlTWFwVVJMIiwiYnlfZ2VuZXJhdGVkX2xvY2F0aW9uIiwiYnlfb3JpZ2luYWxfbG9jYXRpb24iLCJsYXN0Q29sdW1uIiwibGFzdEdlbmVyYXRlZENvbHVtbiIsIl9jb21wdXRlZENvbHVtblNwYW5zIiwiSW5maW5pdHkiLCJhbGxfZ2VuZXJhdGVkX2xvY2F0aW9uc19mb3IiLCJmcmVlX21hcHBpbmdzIiwiY29tcHV0ZUNvbHVtblNwYW5zIiwiY29tcHV0ZV9jb2x1bW5fc3BhbnMiLCJuZWVkbGUiLCJiaWFzIiwib3JpZ2luYWxfbG9jYXRpb25fZm9yIiwiaGFzQ29udGVudHNPZkFsbFNvdXJjZXMiLCJzb21lIiwic2MiLCJudWxsT25NaXNzaW5nIiwiZmlsZVVyaUFic1BhdGgiLCJnZW5lcmF0ZWRQb3NpdGlvbkZvciIsImdlbmVyYXRlZF9sb2NhdGlvbl9mb3IiLCJ0aGF0Iiwic291cmNlTWFwIiwidyIsIkluZGV4ZWRTb3VyY2VNYXBDb25zdW1lciIsIl9nZW5lcmF0ZWRNYXBwaW5ncyIsIl9fZ2VuZXJhdGVkTWFwcGluZ3MiLCJfc29ydEdlbmVyYXRlZE1hcHBpbmdzIiwiX29yaWdpbmFsTWFwcGluZ3MiLCJfX29yaWdpbmFsTWFwcGluZ3MiLCJfc29ydE9yaWdpbmFsTWFwcGluZ3MiLCJfZ2VuZXJhdGVkTWFwcGluZ3NVbnNvcnRlZCIsIl9fZ2VuZXJhdGVkTWFwcGluZ3NVbnNvcnRlZCIsIl9vcmlnaW5hbE1hcHBpbmdzVW5zb3J0ZWQiLCJfX29yaWdpbmFsTWFwcGluZ3NVbnNvcnRlZCIsIl9zZWN0aW9ucyIsImoiLCJzZWN0aW9uSW5kZXgiLCJzZWFyY2giLCJhTmVlZGxlIiwic2VjdGlvbiIsImdlbmVyYXRlZE9mZnNldCIsImV2ZXJ5IiwiZ2VuZXJhdGVkUG9zaXRpb24iLCJyZXQiLCJnZW5lcmF0ZWRNYXBwaW5ncyIsIm9yaWdpbmFsTWFwcGluZ3MiLCJzZWN0aW9uTWFwcGluZ3MiLCJhZGp1c3RlZE1hcHBpbmciLCJfZmluZE1hcHBpbmciLCJhTWFwcGluZ3MiLCJhTGluZU5hbWUiLCJhQ29sdW1uTmFtZSIsImFDb21wYXJhdG9yIiwiYUJpYXMiLCJ1bmRlZmluZWQiLCJzZWN0aW9ucyIsImxhc3RPZmZzZXQiLCJhbGwiLCJvZmZzZXQiLCJvZmZzZXRMaW5lIiwib2Zmc2V0Q29sdW1uIiwiY29ucyIsInJlY3Vyc2l2ZVNlYXJjaCIsImFMb3ciLCJhSGlnaCIsImFIYXlzdGFjayIsImFDb21wYXJlIiwibWlkIiwiTWF0aCIsImZsb29yIiwiTWFwcGluZyIsImNhY2hlZFdhc20iLCJjYWxsYmFja1N0YWNrIiwiV2ViQXNzZW1ibHkiLCJpbnN0YW50aWF0ZSIsImVudiIsIm1hcHBpbmdfY2FsbGJhY2siLCJoYXNMYXN0R2VuZXJhdGVkQ29sdW1uIiwiaGFzT3JpZ2luYWwiLCJoYXNOYW1lIiwic3RhcnRfYWxsX2dlbmVyYXRlZF9sb2NhdGlvbnNfZm9yIiwidGltZSIsImVuZF9hbGxfZ2VuZXJhdGVkX2xvY2F0aW9uc19mb3IiLCJ0aW1lRW5kIiwic3RhcnRfY29tcHV0ZV9jb2x1bW5fc3BhbnMiLCJlbmRfY29tcHV0ZV9jb2x1bW5fc3BhbnMiLCJzdGFydF9nZW5lcmF0ZWRfbG9jYXRpb25fZm9yIiwiZW5kX2dlbmVyYXRlZF9sb2NhdGlvbl9mb3IiLCJzdGFydF9vcmlnaW5hbF9sb2NhdGlvbl9mb3IiLCJlbmRfb3JpZ2luYWxfbG9jYXRpb25fZm9yIiwic3RhcnRfcGFyc2VfbWFwcGluZ3MiLCJlbmRfcGFyc2VfbWFwcGluZ3MiLCJzdGFydF9zb3J0X2J5X2dlbmVyYXRlZF9sb2NhdGlvbiIsImVuZF9zb3J0X2J5X2dlbmVyYXRlZF9sb2NhdGlvbiIsInN0YXJ0X3NvcnRfYnlfb3JpZ2luYWxfbG9jYXRpb24iLCJlbmRfc29ydF9ieV9vcmlnaW5hbF9sb2NhdGlvbiIsIldhc20iLCJpbnN0YW5jZSIsIm1hcHBpbmdDYWxsYmFjayIsIlJFR0VYX05FV0xJTkUiLCJORVdMSU5FX0NPREUiLCJpc1NvdXJjZU5vZGUiLCJmcm9tU3RyaW5nV2l0aFNvdXJjZU1hcCIsImFHZW5lcmF0ZWRDb2RlIiwiYVJlbGF0aXZlUGF0aCIsIm5vZGUiLCJyZW1haW5pbmdMaW5lcyIsInJlbWFpbmluZ0xpbmVzSW5kZXgiLCJzaGlmdE5leHRMaW5lIiwibGluZUNvbnRlbnRzIiwiZ2V0TmV4dExpbmUiLCJuZXdMaW5lIiwibGFzdEdlbmVyYXRlZExpbmUiLCJsYXN0TWFwcGluZyIsIm5leHRMaW5lIiwiYWRkTWFwcGluZ1dpdGhDb2RlIiwiY29kZSIsImFDaHVuayIsImlzQXJyYXkiLCJjaHVuayIsImNoaWxkcmVuIiwicHJlcGVuZCIsIndhbGsiLCJhRm4iLCJhU2VwIiwibmV3Q2hpbGRyZW4iLCJyZXBsYWNlUmlnaHQiLCJhUGF0dGVybiIsImFSZXBsYWNlbWVudCIsImxhc3RDaGlsZCIsInNvdXJjZUNvbnRlbnRzIiwid2Fsa1NvdXJjZUNvbnRlbnRzIiwidG9TdHJpbmdXaXRoU291cmNlTWFwIiwic291cmNlTWFwcGluZ0FjdGl2ZSIsImxhc3RPcmlnaW5hbFNvdXJjZSIsImxhc3RPcmlnaW5hbExpbmUiLCJsYXN0T3JpZ2luYWxDb2x1bW4iLCJsYXN0T3JpZ2luYWxOYW1lIiwic291cmNlQ29udGVudCIsImFMaW5lIiwiYUNvbHVtbiIsImFDaHVua3MiXSwibWFwcGluZ3MiOiJBQUFDLENBQUEsU0FBU0EsaUNBQWlDQyxJQUFJLEVBQUVDLE9BQU87SUFDdkQsSUFBRyxPQUFPQyxZQUFZLFlBQVksT0FBT0MsV0FBVyxVQUNuREEsT0FBT0QsT0FBTyxHQUFHRCxRQUFRRyxRQUFRLE9BQU9BLFFBQVE7U0FDNUMsSUFBRyxPQUFPQyxXQUFXLGNBQWNBLE9BQU9DLEdBQUcsRUFDakRELE9BQU87UUFBQztRQUFNO0tBQU8sRUFBRUo7U0FDbkIsSUFBRyxPQUFPQyxZQUFZLFVBQzFCQSxPQUFPLENBQUMsWUFBWSxHQUFHRCxRQUFRRyxRQUFRLE9BQU9BLFFBQVE7U0FFdERKLElBQUksQ0FBQyxZQUFZLEdBQUdDLFFBQVFELElBQUksQ0FBQyxLQUFLLEVBQUVBLElBQUksQ0FBQyxPQUFPO0FBQ3RELENBQUEsRUFBRyxPQUFPTyxTQUFTLGNBQWNBLE9BQU8sSUFBSSxFQUFFLFNBQVNDLDhCQUE4QixFQUFFQyw4QkFBOEI7SUFDckgsT0FBZ0Is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