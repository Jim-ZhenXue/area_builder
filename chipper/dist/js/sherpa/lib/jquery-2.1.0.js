/*!
 * jQuery JavaScript Library v2.1.0
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-01-23T21:10Z
 */ (function(global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        // For CommonJS and CommonJS-like environments where a proper window is present,
        // execute the factory and get jQuery
        // For environments that do not inherently posses a window with a document
        // (such as Node.js), expose a jQuery-making factory as module.exports
        // This accentuates the need for the creation of a real window
        // e.g. var jQuery = require("jquery")(window);
        // See ticket #14549 for more info
        module.exports = global.document ? factory(global, true) : function(w) {
            if (!w.document) {
                throw new Error("jQuery requires a window with a document");
            }
            return factory(w);
        };
    } else {
        factory(global);
    }
// Pass this if window is not defined yet
})(typeof window !== "undefined" ? window : this, function(window1, noGlobal) {
    // Can't do this because several apps including ASP.NET trace
    // the stack via arguments.caller.callee and Firefox dies if
    // you try to trace through "use strict" call chains. (#13335)
    // Support: Firefox 18+
    //
    var arr = [];
    var slice = arr.slice;
    var concat = arr.concat;
    var push = arr.push;
    var indexOf = arr.indexOf;
    var class2type = {};
    var toString = class2type.toString;
    var hasOwn = class2type.hasOwnProperty;
    var trim = "".trim;
    var support = {};
    var // Use the correct document accordingly with window argument (sandbox)
    document = window1.document, version = "2.1.0", // Define a local copy of jQuery
    jQuery = function(selector, context) {
        // The jQuery object is actually just the init constructor 'enhanced'
        // Need init if jQuery is called (just allow error to be thrown if not included)
        return new jQuery.fn.init(selector, context);
    }, // Matches dashed string for camelizing
    rmsPrefix = /^-ms-/, rdashAlpha = /-([\da-z])/gi, // Used by jQuery.camelCase as callback to replace()
    fcamelCase = function(all, letter) {
        return letter.toUpperCase();
    };
    jQuery.fn = jQuery.prototype = {
        // The current version of jQuery being used
        jquery: version,
        constructor: jQuery,
        // Start with an empty selector
        selector: "",
        // The default length of a jQuery object is 0
        length: 0,
        toArray: function() {
            return slice.call(this);
        },
        // Get the Nth element in the matched element set OR
        // Get the whole matched element set as a clean array
        get: function(num) {
            return num != null ? // Return a 'clean' array
            num < 0 ? this[num + this.length] : this[num] : // Return just the object
            slice.call(this);
        },
        // Take an array of elements and push it onto the stack
        // (returning the new matched element set)
        pushStack: function(elems) {
            // Build a new jQuery matched element set
            var ret = jQuery.merge(this.constructor(), elems);
            // Add the old object onto the stack (as a reference)
            ret.prevObject = this;
            ret.context = this.context;
            // Return the newly-formed element set
            return ret;
        },
        // Execute a callback for every element in the matched set.
        // (You can seed the arguments with an array of args, but this is
        // only used internally.)
        each: function(callback, args) {
            return jQuery.each(this, callback, args);
        },
        map: function(callback) {
            return this.pushStack(jQuery.map(this, function(elem, i) {
                return callback.call(elem, i, elem);
            }));
        },
        slice: function() {
            return this.pushStack(slice.apply(this, arguments));
        },
        first: function() {
            return this.eq(0);
        },
        last: function() {
            return this.eq(-1);
        },
        eq: function(i) {
            var len = this.length, j = +i + (i < 0 ? len : 0);
            return this.pushStack(j >= 0 && j < len ? [
                this[j]
            ] : []);
        },
        end: function() {
            return this.prevObject || this.constructor(null);
        },
        // For internal use only.
        // Behaves like an Array's method, not like a jQuery method.
        push: push,
        sort: arr.sort,
        splice: arr.splice
    };
    jQuery.extend = jQuery.fn.extend = function() {
        var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
        // Handle a deep copy situation
        if (typeof target === "boolean") {
            deep = target;
            // skip the boolean and the target
            target = arguments[i] || {};
            i++;
        }
        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target !== "object" && !jQuery.isFunction(target)) {
            target = {};
        }
        // extend jQuery itself if only one argument is passed
        if (i === length) {
            target = this;
            i--;
        }
        for(; i < length; i++){
            // Only deal with non-null/undefined values
            if ((options = arguments[i]) != null) {
                // Extend the base object
                for(name in options){
                    src = target[name];
                    copy = options[name];
                    // Prevent never-ending loop
                    if (target === copy) {
                        continue;
                    }
                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && jQuery.isArray(src) ? src : [];
                        } else {
                            clone = src && jQuery.isPlainObject(src) ? src : {};
                        }
                        // Never move original objects, clone them
                        target[name] = jQuery.extend(deep, clone, copy);
                    // Don't bring in undefined values
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        // Return the modified object
        return target;
    };
    jQuery.extend({
        // Unique for each copy of jQuery on the page
        expando: "jQuery" + (version + Math.random()).replace(/\D/g, ""),
        // Assume jQuery is ready without the ready module
        isReady: true,
        error: function(msg) {
            throw new Error(msg);
        },
        noop: function() {},
        // See test/unit/core.js for details concerning isFunction.
        // Since version 1.3, DOM methods and functions like alert
        // aren't supported. They return false on IE (#2968).
        isFunction: function(obj) {
            return jQuery.type(obj) === "function";
        },
        isArray: Array.isArray,
        isWindow: function(obj) {
            return obj != null && obj === obj.window;
        },
        isNumeric: function(obj) {
            // parseFloat NaNs numeric-cast false positives (null|true|false|"")
            // ...but misinterprets leading-number strings, particularly hex literals ("0x...")
            // subtraction forces infinities to NaN
            return obj - parseFloat(obj) >= 0;
        },
        isPlainObject: function(obj) {
            // Not plain objects:
            // - Any object or value whose internal [[Class]] property is not "[object Object]"
            // - DOM nodes
            // - window
            if (jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow(obj)) {
                return false;
            }
            // Support: Firefox <20
            // The try/catch suppresses exceptions thrown when attempting to access
            // the "constructor" property of certain host objects, ie. |window.location|
            // https://bugzilla.mozilla.org/show_bug.cgi?id=814622
            try {
                if (obj.constructor && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                    return false;
                }
            } catch (e) {
                return false;
            }
            // If the function hasn't returned already, we're confident that
            // |obj| is a plain object, created by {} or constructed with new Object
            return true;
        },
        isEmptyObject: function(obj) {
            var name;
            for(name in obj){
                return false;
            }
            return true;
        },
        type: function(obj) {
            if (obj == null) {
                return obj + "";
            }
            // Support: Android < 4.0, iOS < 6 (functionish RegExp)
            return typeof obj === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" : typeof obj;
        },
        // Evaluates a script in a global context
        globalEval: function(code) {
            var script, indirect = eval;
            code = jQuery.trim(code);
            if (code) {
                // If the code includes a valid, prologue position
                // strict mode pragma, execute code by injecting a
                // script tag into the document.
                if (code.indexOf("use strict") === 1) {
                    script = document.createElement("script");
                    script.text = code;
                    document.head.appendChild(script).parentNode.removeChild(script);
                } else {
                    // Otherwise, avoid the DOM node creation, insertion
                    // and removal by using an indirect global eval
                    indirect(code);
                }
            }
        },
        // Convert dashed to camelCase; used by the css and data modules
        // Microsoft forgot to hump their vendor prefix (#9572)
        camelCase: function(string) {
            return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
        },
        nodeName: function(elem, name) {
            return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
        },
        // args is for internal usage only
        each: function(obj, callback, args) {
            var value, i = 0, length = obj.length, isArray = isArraylike(obj);
            if (args) {
                if (isArray) {
                    for(; i < length; i++){
                        value = callback.apply(obj[i], args);
                        if (value === false) {
                            break;
                        }
                    }
                } else {
                    for(i in obj){
                        value = callback.apply(obj[i], args);
                        if (value === false) {
                            break;
                        }
                    }
                }
            // A special, fast, case for the most common use of each
            } else {
                if (isArray) {
                    for(; i < length; i++){
                        value = callback.call(obj[i], i, obj[i]);
                        if (value === false) {
                            break;
                        }
                    }
                } else {
                    for(i in obj){
                        value = callback.call(obj[i], i, obj[i]);
                        if (value === false) {
                            break;
                        }
                    }
                }
            }
            return obj;
        },
        trim: function(text) {
            return text == null ? "" : trim.call(text);
        },
        // results is for internal usage only
        makeArray: function(arr, results) {
            var ret = results || [];
            if (arr != null) {
                if (isArraylike(Object(arr))) {
                    jQuery.merge(ret, typeof arr === "string" ? [
                        arr
                    ] : arr);
                } else {
                    push.call(ret, arr);
                }
            }
            return ret;
        },
        inArray: function(elem, arr, i) {
            return arr == null ? -1 : indexOf.call(arr, elem, i);
        },
        merge: function(first, second) {
            var len = +second.length, j = 0, i = first.length;
            for(; j < len; j++){
                first[i++] = second[j];
            }
            first.length = i;
            return first;
        },
        grep: function(elems, callback, invert) {
            var callbackInverse, matches = [], i = 0, length = elems.length, callbackExpect = !invert;
            // Go through the array, only saving the items
            // that pass the validator function
            for(; i < length; i++){
                callbackInverse = !callback(elems[i], i);
                if (callbackInverse !== callbackExpect) {
                    matches.push(elems[i]);
                }
            }
            return matches;
        },
        // arg is for internal usage only
        map: function(elems, callback, arg) {
            var value, i = 0, length = elems.length, isArray = isArraylike(elems), ret = [];
            // Go through the array, translating each of the items to their new values
            if (isArray) {
                for(; i < length; i++){
                    value = callback(elems[i], i, arg);
                    if (value != null) {
                        ret.push(value);
                    }
                }
            // Go through every key on the object,
            } else {
                for(i in elems){
                    value = callback(elems[i], i, arg);
                    if (value != null) {
                        ret.push(value);
                    }
                }
            }
            // Flatten any nested arrays
            return concat.apply([], ret);
        },
        // A global GUID counter for objects
        guid: 1,
        // Bind a function to a context, optionally partially applying any
        // arguments.
        proxy: function(fn, context) {
            var tmp, args, proxy;
            if (typeof context === "string") {
                tmp = fn[context];
                context = fn;
                fn = tmp;
            }
            // Quick check to determine if target is callable, in the spec
            // this throws a TypeError, but we will just return undefined.
            if (!jQuery.isFunction(fn)) {
                return undefined;
            }
            // Simulated bind
            args = slice.call(arguments, 2);
            proxy = function() {
                return fn.apply(context || this, args.concat(slice.call(arguments)));
            };
            // Set the guid of unique handler to the same of original handler, so it can be removed
            proxy.guid = fn.guid = fn.guid || jQuery.guid++;
            return proxy;
        },
        now: Date.now,
        // jQuery.support is not used in Core but other projects attach their
        // properties to it so it needs to exist.
        support: support
    });
    // Populate the class2type map
    jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
    });
    function isArraylike(obj) {
        var length = obj.length, type = jQuery.type(obj);
        if (type === "function" || jQuery.isWindow(obj)) {
            return false;
        }
        if (obj.nodeType === 1 && length) {
            return true;
        }
        return type === "array" || length === 0 || typeof length === "number" && length > 0 && length - 1 in obj;
    }
    var Sizzle = /*!
 * Sizzle CSS Selector Engine v1.10.16
 * http://sizzlejs.com/
 *
 * Copyright 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-01-13
 */ function(window1) {
        var i, support, Expr, getText, isXML, compile, outermostContext, sortInput, hasDuplicate, // Local document vars
        setDocument, document, docElem, documentIsHTML, rbuggyQSA, rbuggyMatches, matches, contains, // Instance-specific data
        expando = "sizzle" + -new Date(), preferredDoc = window1.document, dirruns = 0, done = 0, classCache = createCache(), tokenCache = createCache(), compilerCache = createCache(), sortOrder = function(a, b) {
            if (a === b) {
                hasDuplicate = true;
            }
            return 0;
        }, // General-purpose constants
        strundefined = typeof undefined, MAX_NEGATIVE = 1 << 31, // Instance methods
        hasOwn = {}.hasOwnProperty, arr = [], pop = arr.pop, push_native = arr.push, push = arr.push, slice = arr.slice, // Use a stripped-down indexOf if we can't use a native one
        indexOf = arr.indexOf || function(elem) {
            var i = 0, len = this.length;
            for(; i < len; i++){
                if (this[i] === elem) {
                    return i;
                }
            }
            return -1;
        }, booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped", // Regular expressions
        // Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
        whitespace = "[\\x20\\t\\r\\n\\f]", // http://www.w3.org/TR/css3-syntax/#characters
        characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+", // Loosely modeled on CSS identifier characters
        // An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
        // Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
        identifier = characterEncoding.replace("w", "w#"), // Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
        attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace + "*(?:([*^$|!~]?=)" + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]", // Prefer arguments quoted,
        //   then not containing pseudos/brackets,
        //   then attribute selectors/non-parenthetical expressions,
        //   then anything else
        // These preferences are here to reduce the number of selectors
        //   needing tokenize in the PSEUDO preFilter
        pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace(3, 8) + ")*)|.*)\\)|)", // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
        rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"), rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"), rcombinators = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"), rattributeQuotes = new RegExp("=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g"), rpseudo = new RegExp(pseudos), ridentifier = new RegExp("^" + identifier + "$"), matchExpr = {
            "ID": new RegExp("^#(" + characterEncoding + ")"),
            "CLASS": new RegExp("^\\.(" + characterEncoding + ")"),
            "TAG": new RegExp("^(" + characterEncoding.replace("w", "w*") + ")"),
            "ATTR": new RegExp("^" + attributes),
            "PSEUDO": new RegExp("^" + pseudos),
            "CHILD": new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
            "bool": new RegExp("^(?:" + booleans + ")$", "i"),
            // For use in libraries implementing .is()
            // We use this for POS matching in `select`
            "needsContext": new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
        }, rinputs = /^(?:input|select|textarea|button)$/i, rheader = /^h\d$/i, rnative = /^[^{]+\{\s*\[native \w/, // Easily-parseable/retrievable ID or TAG or CLASS selectors
        rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, rsibling = /[+~]/, rescape = /'|\\/g, // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
        runescape = new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig"), funescape = function(_, escaped, escapedWhitespace) {
            var high = "0x" + escaped - 0x10000;
            // NaN means non-codepoint
            // Support: Firefox
            // Workaround erroneous numeric interpretation of +"0x"
            return high !== high || escapedWhitespace ? escaped : high < 0 ? // BMP codepoint
            String.fromCharCode(high + 0x10000) : // Supplemental Plane codepoint (surrogate pair)
            String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
        };
        // Optimize for push.apply( _, NodeList )
        try {
            push.apply(arr = slice.call(preferredDoc.childNodes), preferredDoc.childNodes);
            // Support: Android<4.0
            // Detect silently failing push.apply
            arr[preferredDoc.childNodes.length].nodeType;
        } catch (e) {
            push = {
                apply: arr.length ? // Leverage slice if possible
                function(target, els) {
                    push_native.apply(target, slice.call(els));
                } : // Support: IE<9
                // Otherwise append directly
                function(target, els) {
                    var j = target.length, i = 0;
                    // Can't trust NodeList.length
                    while(target[j++] = els[i++]){}
                    target.length = j - 1;
                }
            };
        }
        function Sizzle(selector, context, results, seed) {
            var match, elem, m, nodeType, // QSA vars
            i, groups, old, nid, newContext, newSelector;
            if ((context ? context.ownerDocument || context : preferredDoc) !== document) {
                setDocument(context);
            }
            context = context || document;
            results = results || [];
            if (!selector || typeof selector !== "string") {
                return results;
            }
            if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
                return [];
            }
            if (documentIsHTML && !seed) {
                // Shortcuts
                if (match = rquickExpr.exec(selector)) {
                    // Speed-up: Sizzle("#ID")
                    if (m = match[1]) {
                        if (nodeType === 9) {
                            elem = context.getElementById(m);
                            // Check parentNode to catch when Blackberry 4.6 returns
                            // nodes that are no longer in the document (jQuery #6963)
                            if (elem && elem.parentNode) {
                                // Handle the case where IE, Opera, and Webkit return items
                                // by name instead of ID
                                if (elem.id === m) {
                                    results.push(elem);
                                    return results;
                                }
                            } else {
                                return results;
                            }
                        } else {
                            // Context is not a document
                            if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) && contains(context, elem) && elem.id === m) {
                                results.push(elem);
                                return results;
                            }
                        }
                    // Speed-up: Sizzle("TAG")
                    } else if (match[2]) {
                        push.apply(results, context.getElementsByTagName(selector));
                        return results;
                    // Speed-up: Sizzle(".CLASS")
                    } else if ((m = match[3]) && support.getElementsByClassName && context.getElementsByClassName) {
                        push.apply(results, context.getElementsByClassName(m));
                        return results;
                    }
                }
                // QSA path
                if (support.qsa && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
                    nid = old = expando;
                    newContext = context;
                    newSelector = nodeType === 9 && selector;
                    // qSA works strangely on Element-rooted queries
                    // We can work around this by specifying an extra ID on the root
                    // and working up from there (Thanks to Andrew Dupont for the technique)
                    // IE 8 doesn't work on object elements
                    if (nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
                        groups = tokenize(selector);
                        if (old = context.getAttribute("id")) {
                            nid = old.replace(rescape, "\\$&");
                        } else {
                            context.setAttribute("id", nid);
                        }
                        nid = "[id='" + nid + "'] ";
                        i = groups.length;
                        while(i--){
                            groups[i] = nid + toSelector(groups[i]);
                        }
                        newContext = rsibling.test(selector) && testContext(context.parentNode) || context;
                        newSelector = groups.join(",");
                    }
                    if (newSelector) {
                        try {
                            push.apply(results, newContext.querySelectorAll(newSelector));
                            return results;
                        } catch (qsaError) {} finally{
                            if (!old) {
                                context.removeAttribute("id");
                            }
                        }
                    }
                }
            }
            // All others
            return select(selector.replace(rtrim, "$1"), context, results, seed);
        }
        /**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */ function createCache() {
            var keys = [];
            function cache(key, value) {
                // Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
                if (keys.push(key + " ") > Expr.cacheLength) {
                    // Only keep the most recent entries
                    delete cache[keys.shift()];
                }
                return cache[key + " "] = value;
            }
            return cache;
        }
        /**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */ function markFunction(fn) {
            fn[expando] = true;
            return fn;
        }
        /**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */ function assert(fn) {
            var div = document.createElement("div");
            try {
                return !!fn(div);
            } catch (e) {
                return false;
            } finally{
                // Remove from its parent by default
                if (div.parentNode) {
                    div.parentNode.removeChild(div);
                }
                // release memory in IE
                div = null;
            }
        }
        /**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */ function addHandle(attrs, handler) {
            var arr = attrs.split("|"), i = attrs.length;
            while(i--){
                Expr.attrHandle[arr[i]] = handler;
            }
        }
        /**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */ function siblingCheck(a, b) {
            var cur = b && a, diff = cur && a.nodeType === 1 && b.nodeType === 1 && (~b.sourceIndex || MAX_NEGATIVE) - (~a.sourceIndex || MAX_NEGATIVE);
            // Use IE sourceIndex if available on both nodes
            if (diff) {
                return diff;
            }
            // Check if b follows a
            if (cur) {
                while(cur = cur.nextSibling){
                    if (cur === b) {
                        return -1;
                    }
                }
            }
            return a ? 1 : -1;
        }
        /**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */ function createInputPseudo(type) {
            return function(elem) {
                var name = elem.nodeName.toLowerCase();
                return name === "input" && elem.type === type;
            };
        }
        /**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */ function createButtonPseudo(type) {
            return function(elem) {
                var name = elem.nodeName.toLowerCase();
                return (name === "input" || name === "button") && elem.type === type;
            };
        }
        /**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */ function createPositionalPseudo(fn) {
            return markFunction(function(argument) {
                argument = +argument;
                return markFunction(function(seed, matches) {
                    var j, matchIndexes = fn([], seed.length, argument), i = matchIndexes.length;
                    // Match elements found at the specified indexes
                    while(i--){
                        if (seed[j = matchIndexes[i]]) {
                            seed[j] = !(matches[j] = seed[j]);
                        }
                    }
                });
            });
        }
        /**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */ function testContext(context) {
            return context && typeof context.getElementsByTagName !== strundefined && context;
        }
        // Expose support vars for convenience
        support = Sizzle.support = {};
        /**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */ isXML = Sizzle.isXML = function(elem) {
            // documentElement is verified for cases where it doesn't yet exist
            // (such as loading iframes in IE - #4833)
            var documentElement = elem && (elem.ownerDocument || elem).documentElement;
            return documentElement ? documentElement.nodeName !== "HTML" : false;
        };
        /**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */ setDocument = Sizzle.setDocument = function(node) {
            var hasCompare, doc = node ? node.ownerDocument || node : preferredDoc, parent = doc.defaultView;
            // If no document and documentElement is available, return
            if (doc === document || doc.nodeType !== 9 || !doc.documentElement) {
                return document;
            }
            // Set our document
            document = doc;
            docElem = doc.documentElement;
            // Support tests
            documentIsHTML = !isXML(doc);
            // Support: IE>8
            // If iframe document is assigned to "document" variable and if iframe has been reloaded,
            // IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
            // IE6-8 do not support the defaultView property so parent will be undefined
            if (parent && parent !== parent.top) {
                // IE11 does not have attachEvent, so all must suffer
                if (parent.addEventListener) {
                    parent.addEventListener("unload", function() {
                        setDocument();
                    }, false);
                } else if (parent.attachEvent) {
                    parent.attachEvent("onunload", function() {
                        setDocument();
                    });
                }
            }
            /* Attributes
	---------------------------------------------------------------------- */ // Support: IE<8
            // Verify that getAttribute really returns attributes and not properties (excepting IE8 booleans)
            support.attributes = assert(function(div) {
                div.className = "i";
                return !div.getAttribute("className");
            });
            /* getElement(s)By*
	---------------------------------------------------------------------- */ // Check if getElementsByTagName("*") returns only elements
            support.getElementsByTagName = assert(function(div) {
                div.appendChild(doc.createComment(""));
                return !div.getElementsByTagName("*").length;
            });
            // Check if getElementsByClassName can be trusted
            support.getElementsByClassName = rnative.test(doc.getElementsByClassName) && assert(function(div) {
                div.innerHTML = "<div class='a'></div><div class='a i'></div>";
                // Support: Safari<4
                // Catch class over-caching
                div.firstChild.className = "i";
                // Support: Opera<10
                // Catch gEBCN failure to find non-leading classes
                return div.getElementsByClassName("i").length === 2;
            });
            // Support: IE<10
            // Check if getElementById returns elements by name
            // The broken getElementById methods don't pick up programatically-set names,
            // so use a roundabout getElementsByName test
            support.getById = assert(function(div) {
                docElem.appendChild(div).id = expando;
                return !doc.getElementsByName || !doc.getElementsByName(expando).length;
            });
            // ID find and filter
            if (support.getById) {
                Expr.find["ID"] = function(id, context) {
                    if (typeof context.getElementById !== strundefined && documentIsHTML) {
                        var m = context.getElementById(id);
                        // Check parentNode to catch when Blackberry 4.6 returns
                        // nodes that are no longer in the document #6963
                        return m && m.parentNode ? [
                            m
                        ] : [];
                    }
                };
                Expr.filter["ID"] = function(id) {
                    var attrId = id.replace(runescape, funescape);
                    return function(elem) {
                        return elem.getAttribute("id") === attrId;
                    };
                };
            } else {
                // Support: IE6/7
                // getElementById is not reliable as a find shortcut
                delete Expr.find["ID"];
                Expr.filter["ID"] = function(id) {
                    var attrId = id.replace(runescape, funescape);
                    return function(elem) {
                        var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
                        return node && node.value === attrId;
                    };
                };
            }
            // Tag
            Expr.find["TAG"] = support.getElementsByTagName ? function(tag, context) {
                if (typeof context.getElementsByTagName !== strundefined) {
                    return context.getElementsByTagName(tag);
                }
            } : function(tag, context) {
                var elem, tmp = [], i = 0, results = context.getElementsByTagName(tag);
                // Filter out possible comments
                if (tag === "*") {
                    while(elem = results[i++]){
                        if (elem.nodeType === 1) {
                            tmp.push(elem);
                        }
                    }
                    return tmp;
                }
                return results;
            };
            // Class
            Expr.find["CLASS"] = support.getElementsByClassName && function(className, context) {
                if (typeof context.getElementsByClassName !== strundefined && documentIsHTML) {
                    return context.getElementsByClassName(className);
                }
            };
            /* QSA/matchesSelector
	---------------------------------------------------------------------- */ // QSA and matchesSelector support
            // matchesSelector(:active) reports false when true (IE9/Opera 11.5)
            rbuggyMatches = [];
            // qSa(:focus) reports false when true (Chrome 21)
            // We allow this because of a bug in IE8/9 that throws an error
            // whenever `document.activeElement` is accessed on an iframe
            // So, we allow :focus to pass through QSA all the time to avoid the IE error
            // See http://bugs.jquery.com/ticket/13378
            rbuggyQSA = [];
            if (support.qsa = rnative.test(doc.querySelectorAll)) {
                // Build QSA regex
                // Regex strategy adopted from Diego Perini
                assert(function(div) {
                    // Select is set to empty string on purpose
                    // This is to test IE's treatment of not explicitly
                    // setting a boolean content attribute,
                    // since its presence should be enough
                    // http://bugs.jquery.com/ticket/12359
                    div.innerHTML = "<select t=''><option selected=''></option></select>";
                    // Support: IE8, Opera 10-12
                    // Nothing should be selected when empty strings follow ^= or $= or *=
                    if (div.querySelectorAll("[t^='']").length) {
                        rbuggyQSA.push("[*^$]=" + whitespace + "*(?:''|\"\")");
                    }
                    // Support: IE8
                    // Boolean attributes and "value" are not treated correctly
                    if (!div.querySelectorAll("[selected]").length) {
                        rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")");
                    }
                    // Webkit/Opera - :checked should return selected option elements
                    // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
                    // IE8 throws error here and will not see later tests
                    if (!div.querySelectorAll(":checked").length) {
                        rbuggyQSA.push(":checked");
                    }
                });
                assert(function(div) {
                    // Support: Windows 8 Native Apps
                    // The type and name attributes are restricted during .innerHTML assignment
                    var input = doc.createElement("input");
                    input.setAttribute("type", "hidden");
                    div.appendChild(input).setAttribute("name", "D");
                    // Support: IE8
                    // Enforce case-sensitivity of name attribute
                    if (div.querySelectorAll("[name=d]").length) {
                        rbuggyQSA.push("name" + whitespace + "*[*^$|!~]?=");
                    }
                    // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
                    // IE8 throws error here and will not see later tests
                    if (!div.querySelectorAll(":enabled").length) {
                        rbuggyQSA.push(":enabled", ":disabled");
                    }
                    // Opera 10-11 does not throw on post-comma invalid pseudos
                    div.querySelectorAll("*,:x");
                    rbuggyQSA.push(",.*:");
                });
            }
            if (support.matchesSelector = rnative.test(matches = docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector)) {
                assert(function(div) {
                    // Check to see if it's possible to do matchesSelector
                    // on a disconnected node (IE 9)
                    support.disconnectedMatch = matches.call(div, "div");
                    // This should fail with an exception
                    // Gecko does not error, returns false instead
                    matches.call(div, "[s!='']:x");
                    rbuggyMatches.push("!=", pseudos);
                });
            }
            rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
            rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|"));
            /* Contains
	---------------------------------------------------------------------- */ hasCompare = rnative.test(docElem.compareDocumentPosition);
            // Element contains another
            // Purposefully does not implement inclusive descendent
            // As in, an element does not contain itself
            contains = hasCompare || rnative.test(docElem.contains) ? function(a, b) {
                var adown = a.nodeType === 9 ? a.documentElement : a, bup = b && b.parentNode;
                return a === bup || !!(bup && bup.nodeType === 1 && (adown.contains ? adown.contains(bup) : a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16));
            } : function(a, b) {
                if (b) {
                    while(b = b.parentNode){
                        if (b === a) {
                            return true;
                        }
                    }
                }
                return false;
            };
            /* Sorting
	---------------------------------------------------------------------- */ // Document order sorting
            sortOrder = hasCompare ? function(a, b) {
                // Flag for duplicate removal
                if (a === b) {
                    hasDuplicate = true;
                    return 0;
                }
                // Sort on method existence if only one input has compareDocumentPosition
                var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
                if (compare) {
                    return compare;
                }
                // Calculate position if both inputs belong to the same document
                compare = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : // Otherwise we know they are disconnected
                1;
                // Disconnected nodes
                if (compare & 1 || !support.sortDetached && b.compareDocumentPosition(a) === compare) {
                    // Choose the first element that is related to our preferred document
                    if (a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a)) {
                        return -1;
                    }
                    if (b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b)) {
                        return 1;
                    }
                    // Maintain original order
                    return sortInput ? indexOf.call(sortInput, a) - indexOf.call(sortInput, b) : 0;
                }
                return compare & 4 ? -1 : 1;
            } : function(a, b) {
                // Exit early if the nodes are identical
                if (a === b) {
                    hasDuplicate = true;
                    return 0;
                }
                var cur, i = 0, aup = a.parentNode, bup = b.parentNode, ap = [
                    a
                ], bp = [
                    b
                ];
                // Parentless nodes are either documents or disconnected
                if (!aup || !bup) {
                    return a === doc ? -1 : b === doc ? 1 : aup ? -1 : bup ? 1 : sortInput ? indexOf.call(sortInput, a) - indexOf.call(sortInput, b) : 0;
                // If the nodes are siblings, we can do a quick check
                } else if (aup === bup) {
                    return siblingCheck(a, b);
                }
                // Otherwise we need full lists of their ancestors for comparison
                cur = a;
                while(cur = cur.parentNode){
                    ap.unshift(cur);
                }
                cur = b;
                while(cur = cur.parentNode){
                    bp.unshift(cur);
                }
                // Walk down the tree looking for a discrepancy
                while(ap[i] === bp[i]){
                    i++;
                }
                return i ? // Do a sibling check if the nodes have a common ancestor
                siblingCheck(ap[i], bp[i]) : // Otherwise nodes in our document sort first
                ap[i] === preferredDoc ? -1 : bp[i] === preferredDoc ? 1 : 0;
            };
            return doc;
        };
        Sizzle.matches = function(expr, elements) {
            return Sizzle(expr, null, null, elements);
        };
        Sizzle.matchesSelector = function(elem, expr) {
            // Set document vars if needed
            if ((elem.ownerDocument || elem) !== document) {
                setDocument(elem);
            }
            // Make sure that attribute selectors are quoted
            expr = expr.replace(rattributeQuotes, "='$1']");
            if (support.matchesSelector && documentIsHTML && (!rbuggyMatches || !rbuggyMatches.test(expr)) && (!rbuggyQSA || !rbuggyQSA.test(expr))) {
                try {
                    var ret = matches.call(elem, expr);
                    // IE 9's matchesSelector returns false on disconnected nodes
                    if (ret || support.disconnectedMatch || // As well, disconnected nodes are said to be in a document
                    // fragment in IE 9
                    elem.document && elem.document.nodeType !== 11) {
                        return ret;
                    }
                } catch (e) {}
            }
            return Sizzle(expr, document, null, [
                elem
            ]).length > 0;
        };
        Sizzle.contains = function(context, elem) {
            // Set document vars if needed
            if ((context.ownerDocument || context) !== document) {
                setDocument(context);
            }
            return contains(context, elem);
        };
        Sizzle.attr = function(elem, name) {
            // Set document vars if needed
            if ((elem.ownerDocument || elem) !== document) {
                setDocument(elem);
            }
            var fn = Expr.attrHandle[name.toLowerCase()], // Don't get fooled by Object.prototype properties (jQuery #13807)
            val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ? fn(elem, name, !documentIsHTML) : undefined;
            return val !== undefined ? val : support.attributes || !documentIsHTML ? elem.getAttribute(name) : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
        };
        Sizzle.error = function(msg) {
            throw new Error("Syntax error, unrecognized expression: " + msg);
        };
        /**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */ Sizzle.uniqueSort = function(results) {
            var elem, duplicates = [], j = 0, i = 0;
            // Unless we *know* we can detect duplicates, assume their presence
            hasDuplicate = !support.detectDuplicates;
            sortInput = !support.sortStable && results.slice(0);
            results.sort(sortOrder);
            if (hasDuplicate) {
                while(elem = results[i++]){
                    if (elem === results[i]) {
                        j = duplicates.push(i);
                    }
                }
                while(j--){
                    results.splice(duplicates[j], 1);
                }
            }
            // Clear input after sorting to release objects
            // See https://github.com/jquery/sizzle/pull/225
            sortInput = null;
            return results;
        };
        /**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */ getText = Sizzle.getText = function(elem) {
            var node, ret = "", i = 0, nodeType = elem.nodeType;
            if (!nodeType) {
                // If no nodeType, this is expected to be an array
                while(node = elem[i++]){
                    // Do not traverse comment nodes
                    ret += getText(node);
                }
            } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
                // Use textContent for elements
                // innerText usage removed for consistency of new lines (jQuery #11153)
                if (typeof elem.textContent === "string") {
                    return elem.textContent;
                } else {
                    // Traverse its children
                    for(elem = elem.firstChild; elem; elem = elem.nextSibling){
                        ret += getText(elem);
                    }
                }
            } else if (nodeType === 3 || nodeType === 4) {
                return elem.nodeValue;
            }
            // Do not include comment or processing instruction nodes
            return ret;
        };
        Expr = Sizzle.selectors = {
            // Can be adjusted by the user
            cacheLength: 50,
            createPseudo: markFunction,
            match: matchExpr,
            attrHandle: {},
            find: {},
            relative: {
                ">": {
                    dir: "parentNode",
                    first: true
                },
                " ": {
                    dir: "parentNode"
                },
                "+": {
                    dir: "previousSibling",
                    first: true
                },
                "~": {
                    dir: "previousSibling"
                }
            },
            preFilter: {
                "ATTR": function(match) {
                    match[1] = match[1].replace(runescape, funescape);
                    // Move the given value to match[3] whether quoted or unquoted
                    match[3] = (match[4] || match[5] || "").replace(runescape, funescape);
                    if (match[2] === "~=") {
                        match[3] = " " + match[3] + " ";
                    }
                    return match.slice(0, 4);
                },
                "CHILD": function(match) {
                    /* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/ match[1] = match[1].toLowerCase();
                    if (match[1].slice(0, 3) === "nth") {
                        // nth-* requires argument
                        if (!match[3]) {
                            Sizzle.error(match[0]);
                        }
                        // numeric x and y parameters for Expr.filter.CHILD
                        // remember that false/true cast respectively to 0/1
                        match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * (match[3] === "even" || match[3] === "odd"));
                        match[5] = +(match[7] + match[8] || match[3] === "odd");
                    // other types prohibit arguments
                    } else if (match[3]) {
                        Sizzle.error(match[0]);
                    }
                    return match;
                },
                "PSEUDO": function(match) {
                    var excess, unquoted = !match[5] && match[2];
                    if (matchExpr["CHILD"].test(match[0])) {
                        return null;
                    }
                    // Accept quoted arguments as-is
                    if (match[3] && match[4] !== undefined) {
                        match[2] = match[4];
                    // Strip excess characters from unquoted arguments
                    } else if (unquoted && rpseudo.test(unquoted) && // Get excess from tokenize (recursively)
                    (excess = tokenize(unquoted, true)) && // advance to the next closing parenthesis
                    (excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {
                        // excess is a negative index
                        match[0] = match[0].slice(0, excess);
                        match[2] = unquoted.slice(0, excess);
                    }
                    // Return only captures needed by the pseudo filter method (type and argument)
                    return match.slice(0, 3);
                }
            },
            filter: {
                "TAG": function(nodeNameSelector) {
                    var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
                    return nodeNameSelector === "*" ? function() {
                        return true;
                    } : function(elem) {
                        return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
                    };
                },
                "CLASS": function(className) {
                    var pattern = classCache[className + " "];
                    return pattern || (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) && classCache(className, function(elem) {
                        return pattern.test(typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "");
                    });
                },
                "ATTR": function(name, operator, check) {
                    return function(elem) {
                        var result = Sizzle.attr(elem, name);
                        if (result == null) {
                            return operator === "!=";
                        }
                        if (!operator) {
                            return true;
                        }
                        result += "";
                        return operator === "=" ? result === check : operator === "!=" ? result !== check : operator === "^=" ? check && result.indexOf(check) === 0 : operator === "*=" ? check && result.indexOf(check) > -1 : operator === "$=" ? check && result.slice(-check.length) === check : operator === "~=" ? (" " + result + " ").indexOf(check) > -1 : operator === "|=" ? result === check || result.slice(0, check.length + 1) === check + "-" : false;
                    };
                },
                "CHILD": function(type, what, argument, first, last) {
                    var simple = type.slice(0, 3) !== "nth", forward = type.slice(-4) !== "last", ofType = what === "of-type";
                    return first === 1 && last === 0 ? // Shortcut for :nth-*(n)
                    function(elem) {
                        return !!elem.parentNode;
                    } : function(elem, context, xml) {
                        var cache, outerCache, node, diff, nodeIndex, start, dir = simple !== forward ? "nextSibling" : "previousSibling", parent = elem.parentNode, name = ofType && elem.nodeName.toLowerCase(), useCache = !xml && !ofType;
                        if (parent) {
                            // :(first|last|only)-(child|of-type)
                            if (simple) {
                                while(dir){
                                    node = elem;
                                    while(node = node[dir]){
                                        if (ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) {
                                            return false;
                                        }
                                    }
                                    // Reverse direction for :only-* (if we haven't yet done so)
                                    start = dir = type === "only" && !start && "nextSibling";
                                }
                                return true;
                            }
                            start = [
                                forward ? parent.firstChild : parent.lastChild
                            ];
                            // non-xml :nth-child(...) stores cache data on `parent`
                            if (forward && useCache) {
                                // Seek `elem` from a previously-cached index
                                outerCache = parent[expando] || (parent[expando] = {});
                                cache = outerCache[type] || [];
                                nodeIndex = cache[0] === dirruns && cache[1];
                                diff = cache[0] === dirruns && cache[2];
                                node = nodeIndex && parent.childNodes[nodeIndex];
                                while(node = ++nodeIndex && node && node[dir] || // Fallback to seeking `elem` from the start
                                (diff = nodeIndex = 0) || start.pop()){
                                    // When found, cache indexes on `parent` and break
                                    if (node.nodeType === 1 && ++diff && node === elem) {
                                        outerCache[type] = [
                                            dirruns,
                                            nodeIndex,
                                            diff
                                        ];
                                        break;
                                    }
                                }
                            // Use previously-cached element index if available
                            } else if (useCache && (cache = (elem[expando] || (elem[expando] = {}))[type]) && cache[0] === dirruns) {
                                diff = cache[1];
                            // xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
                            } else {
                                // Use the same loop as above to seek `elem` from the start
                                while(node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop()){
                                    if ((ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) && ++diff) {
                                        // Cache the index of each encountered element
                                        if (useCache) {
                                            (node[expando] || (node[expando] = {}))[type] = [
                                                dirruns,
                                                diff
                                            ];
                                        }
                                        if (node === elem) {
                                            break;
                                        }
                                    }
                                }
                            }
                            // Incorporate the offset, then check against cycle size
                            diff -= last;
                            return diff === first || diff % first === 0 && diff / first >= 0;
                        }
                    };
                },
                "PSEUDO": function(pseudo, argument) {
                    // pseudo-class names are case-insensitive
                    // http://www.w3.org/TR/selectors/#pseudo-classes
                    // Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
                    // Remember that setFilters inherits from pseudos
                    var args, fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] || Sizzle.error("unsupported pseudo: " + pseudo);
                    // The user may use createPseudo to indicate that
                    // arguments are needed to create the filter function
                    // just as Sizzle does
                    if (fn[expando]) {
                        return fn(argument);
                    }
                    // But maintain support for old signatures
                    if (fn.length > 1) {
                        args = [
                            pseudo,
                            pseudo,
                            "",
                            argument
                        ];
                        return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ? markFunction(function(seed, matches) {
                            var idx, matched = fn(seed, argument), i = matched.length;
                            while(i--){
                                idx = indexOf.call(seed, matched[i]);
                                seed[idx] = !(matches[idx] = matched[i]);
                            }
                        }) : function(elem) {
                            return fn(elem, 0, args);
                        };
                    }
                    return fn;
                }
            },
            pseudos: {
                // Potentially complex pseudos
                "not": markFunction(function(selector) {
                    // Trim the selector passed to compile
                    // to avoid treating leading and trailing
                    // spaces as combinators
                    var input = [], results = [], matcher = compile(selector.replace(rtrim, "$1"));
                    return matcher[expando] ? markFunction(function(seed, matches, context, xml) {
                        var elem, unmatched = matcher(seed, null, xml, []), i = seed.length;
                        // Match elements unmatched by `matcher`
                        while(i--){
                            if (elem = unmatched[i]) {
                                seed[i] = !(matches[i] = elem);
                            }
                        }
                    }) : function(elem, context, xml) {
                        input[0] = elem;
                        matcher(input, null, xml, results);
                        return !results.pop();
                    };
                }),
                "has": markFunction(function(selector) {
                    return function(elem) {
                        return Sizzle(selector, elem).length > 0;
                    };
                }),
                "contains": markFunction(function(text) {
                    return function(elem) {
                        return (elem.textContent || elem.innerText || getText(elem)).indexOf(text) > -1;
                    };
                }),
                // "Whether an element is represented by a :lang() selector
                // is based solely on the element's language value
                // being equal to the identifier C,
                // or beginning with the identifier C immediately followed by "-".
                // The matching of C against the element's language value is performed case-insensitively.
                // The identifier C does not have to be a valid language name."
                // http://www.w3.org/TR/selectors/#lang-pseudo
                "lang": markFunction(function(lang) {
                    // lang value must be a valid identifier
                    if (!ridentifier.test(lang || "")) {
                        Sizzle.error("unsupported lang: " + lang);
                    }
                    lang = lang.replace(runescape, funescape).toLowerCase();
                    return function(elem) {
                        var elemLang;
                        do {
                            if (elemLang = documentIsHTML ? elem.lang : elem.getAttribute("xml:lang") || elem.getAttribute("lang")) {
                                elemLang = elemLang.toLowerCase();
                                return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
                            }
                        }while ((elem = elem.parentNode) && elem.nodeType === 1)
                        return false;
                    };
                }),
                // Miscellaneous
                "target": function(elem) {
                    var hash = window1.location && window1.location.hash;
                    return hash && hash.slice(1) === elem.id;
                },
                "root": function(elem) {
                    return elem === docElem;
                },
                "focus": function(elem) {
                    return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
                },
                // Boolean properties
                "enabled": function(elem) {
                    return elem.disabled === false;
                },
                "disabled": function(elem) {
                    return elem.disabled === true;
                },
                "checked": function(elem) {
                    // In CSS3, :checked should return both checked and selected elements
                    // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
                    var nodeName = elem.nodeName.toLowerCase();
                    return nodeName === "input" && !!elem.checked || nodeName === "option" && !!elem.selected;
                },
                "selected": function(elem) {
                    // Accessing this property makes selected-by-default
                    // options in Safari work properly
                    if (elem.parentNode) {
                        elem.parentNode.selectedIndex;
                    }
                    return elem.selected === true;
                },
                // Contents
                "empty": function(elem) {
                    // http://www.w3.org/TR/selectors/#empty-pseudo
                    // :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
                    //   but not by others (comment: 8; processing instruction: 7; etc.)
                    // nodeType < 6 works because attributes (2) do not appear as children
                    for(elem = elem.firstChild; elem; elem = elem.nextSibling){
                        if (elem.nodeType < 6) {
                            return false;
                        }
                    }
                    return true;
                },
                "parent": function(elem) {
                    return !Expr.pseudos["empty"](elem);
                },
                // Element/input types
                "header": function(elem) {
                    return rheader.test(elem.nodeName);
                },
                "input": function(elem) {
                    return rinputs.test(elem.nodeName);
                },
                "button": function(elem) {
                    var name = elem.nodeName.toLowerCase();
                    return name === "input" && elem.type === "button" || name === "button";
                },
                "text": function(elem) {
                    var attr;
                    return elem.nodeName.toLowerCase() === "input" && elem.type === "text" && // Support: IE<8
                    // New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
                    ((attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text");
                },
                // Position-in-collection
                "first": createPositionalPseudo(function() {
                    return [
                        0
                    ];
                }),
                "last": createPositionalPseudo(function(matchIndexes, length) {
                    return [
                        length - 1
                    ];
                }),
                "eq": createPositionalPseudo(function(matchIndexes, length, argument) {
                    return [
                        argument < 0 ? argument + length : argument
                    ];
                }),
                "even": createPositionalPseudo(function(matchIndexes, length) {
                    var i = 0;
                    for(; i < length; i += 2){
                        matchIndexes.push(i);
                    }
                    return matchIndexes;
                }),
                "odd": createPositionalPseudo(function(matchIndexes, length) {
                    var i = 1;
                    for(; i < length; i += 2){
                        matchIndexes.push(i);
                    }
                    return matchIndexes;
                }),
                "lt": createPositionalPseudo(function(matchIndexes, length, argument) {
                    var i = argument < 0 ? argument + length : argument;
                    for(; --i >= 0;){
                        matchIndexes.push(i);
                    }
                    return matchIndexes;
                }),
                "gt": createPositionalPseudo(function(matchIndexes, length, argument) {
                    var i = argument < 0 ? argument + length : argument;
                    for(; ++i < length;){
                        matchIndexes.push(i);
                    }
                    return matchIndexes;
                })
            }
        };
        Expr.pseudos["nth"] = Expr.pseudos["eq"];
        // Add button/input type pseudos
        for(i in {
            radio: true,
            checkbox: true,
            file: true,
            password: true,
            image: true
        }){
            Expr.pseudos[i] = createInputPseudo(i);
        }
        for(i in {
            submit: true,
            reset: true
        }){
            Expr.pseudos[i] = createButtonPseudo(i);
        }
        // Easy API for creating new setFilters
        function setFilters() {}
        setFilters.prototype = Expr.filters = Expr.pseudos;
        Expr.setFilters = new setFilters();
        function tokenize(selector, parseOnly) {
            var matched, match, tokens, type, soFar, groups, preFilters, cached = tokenCache[selector + " "];
            if (cached) {
                return parseOnly ? 0 : cached.slice(0);
            }
            soFar = selector;
            groups = [];
            preFilters = Expr.preFilter;
            while(soFar){
                // Comma and first run
                if (!matched || (match = rcomma.exec(soFar))) {
                    if (match) {
                        // Don't consume trailing commas as valid
                        soFar = soFar.slice(match[0].length) || soFar;
                    }
                    groups.push(tokens = []);
                }
                matched = false;
                // Combinators
                if (match = rcombinators.exec(soFar)) {
                    matched = match.shift();
                    tokens.push({
                        value: matched,
                        // Cast descendant combinators to space
                        type: match[0].replace(rtrim, " ")
                    });
                    soFar = soFar.slice(matched.length);
                }
                // Filters
                for(type in Expr.filter){
                    if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] || (match = preFilters[type](match)))) {
                        matched = match.shift();
                        tokens.push({
                            value: matched,
                            type: type,
                            matches: match
                        });
                        soFar = soFar.slice(matched.length);
                    }
                }
                if (!matched) {
                    break;
                }
            }
            // Return the length of the invalid excess
            // if we're just parsing
            // Otherwise, throw an error or return tokens
            return parseOnly ? soFar.length : soFar ? Sizzle.error(selector) : // Cache the tokens
            tokenCache(selector, groups).slice(0);
        }
        function toSelector(tokens) {
            var i = 0, len = tokens.length, selector = "";
            for(; i < len; i++){
                selector += tokens[i].value;
            }
            return selector;
        }
        function addCombinator(matcher, combinator, base) {
            var dir = combinator.dir, checkNonElements = base && dir === "parentNode", doneName = done++;
            return combinator.first ? // Check against closest ancestor/preceding element
            function(elem, context, xml) {
                while(elem = elem[dir]){
                    if (elem.nodeType === 1 || checkNonElements) {
                        return matcher(elem, context, xml);
                    }
                }
            } : // Check against all ancestor/preceding elements
            function(elem, context, xml) {
                var oldCache, outerCache, newCache = [
                    dirruns,
                    doneName
                ];
                // We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
                if (xml) {
                    while(elem = elem[dir]){
                        if (elem.nodeType === 1 || checkNonElements) {
                            if (matcher(elem, context, xml)) {
                                return true;
                            }
                        }
                    }
                } else {
                    while(elem = elem[dir]){
                        if (elem.nodeType === 1 || checkNonElements) {
                            outerCache = elem[expando] || (elem[expando] = {});
                            if ((oldCache = outerCache[dir]) && oldCache[0] === dirruns && oldCache[1] === doneName) {
                                // Assign to newCache so results back-propagate to previous elements
                                return newCache[2] = oldCache[2];
                            } else {
                                // Reuse newcache so results back-propagate to previous elements
                                outerCache[dir] = newCache;
                                // A match means we're done; a fail means we have to keep checking
                                if (newCache[2] = matcher(elem, context, xml)) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            };
        }
        function elementMatcher(matchers) {
            return matchers.length > 1 ? function(elem, context, xml) {
                var i = matchers.length;
                while(i--){
                    if (!matchers[i](elem, context, xml)) {
                        return false;
                    }
                }
                return true;
            } : matchers[0];
        }
        function condense(unmatched, map, filter, context, xml) {
            var elem, newUnmatched = [], i = 0, len = unmatched.length, mapped = map != null;
            for(; i < len; i++){
                if (elem = unmatched[i]) {
                    if (!filter || filter(elem, context, xml)) {
                        newUnmatched.push(elem);
                        if (mapped) {
                            map.push(i);
                        }
                    }
                }
            }
            return newUnmatched;
        }
        function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
            if (postFilter && !postFilter[expando]) {
                postFilter = setMatcher(postFilter);
            }
            if (postFinder && !postFinder[expando]) {
                postFinder = setMatcher(postFinder, postSelector);
            }
            return markFunction(function(seed, results, context, xml) {
                var temp, i, elem, preMap = [], postMap = [], preexisting = results.length, // Get initial elements from seed or context
                elems = seed || multipleContexts(selector || "*", context.nodeType ? [
                    context
                ] : context, []), // Prefilter to get matcher input, preserving a map for seed-results synchronization
                matcherIn = preFilter && (seed || !selector) ? condense(elems, preMap, preFilter, context, xml) : elems, matcherOut = matcher ? // If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
                postFinder || (seed ? preFilter : preexisting || postFilter) ? // ...intermediate processing is necessary
                [] : // ...otherwise use results directly
                results : matcherIn;
                // Find primary matches
                if (matcher) {
                    matcher(matcherIn, matcherOut, context, xml);
                }
                // Apply postFilter
                if (postFilter) {
                    temp = condense(matcherOut, postMap);
                    postFilter(temp, [], context, xml);
                    // Un-match failing elements by moving them back to matcherIn
                    i = temp.length;
                    while(i--){
                        if (elem = temp[i]) {
                            matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem);
                        }
                    }
                }
                if (seed) {
                    if (postFinder || preFilter) {
                        if (postFinder) {
                            // Get the final matcherOut by condensing this intermediate into postFinder contexts
                            temp = [];
                            i = matcherOut.length;
                            while(i--){
                                if (elem = matcherOut[i]) {
                                    // Restore matcherIn since elem is not yet a final match
                                    temp.push(matcherIn[i] = elem);
                                }
                            }
                            postFinder(null, matcherOut = [], temp, xml);
                        }
                        // Move matched elements from seed to results to keep them synchronized
                        i = matcherOut.length;
                        while(i--){
                            if ((elem = matcherOut[i]) && (temp = postFinder ? indexOf.call(seed, elem) : preMap[i]) > -1) {
                                seed[temp] = !(results[temp] = elem);
                            }
                        }
                    }
                // Add elements to results, through postFinder if defined
                } else {
                    matcherOut = condense(matcherOut === results ? matcherOut.splice(preexisting, matcherOut.length) : matcherOut);
                    if (postFinder) {
                        postFinder(null, results, matcherOut, xml);
                    } else {
                        push.apply(results, matcherOut);
                    }
                }
            });
        }
        function matcherFromTokens(tokens) {
            var checkContext, matcher, j, len = tokens.length, leadingRelative = Expr.relative[tokens[0].type], implicitRelative = leadingRelative || Expr.relative[" "], i = leadingRelative ? 1 : 0, // The foundational matcher ensures that elements are reachable from top-level context(s)
            matchContext = addCombinator(function(elem) {
                return elem === checkContext;
            }, implicitRelative, true), matchAnyContext = addCombinator(function(elem) {
                return indexOf.call(checkContext, elem) > -1;
            }, implicitRelative, true), matchers = [
                function(elem, context, xml) {
                    return !leadingRelative && (xml || context !== outermostContext) || ((checkContext = context).nodeType ? matchContext(elem, context, xml) : matchAnyContext(elem, context, xml));
                }
            ];
            for(; i < len; i++){
                if (matcher = Expr.relative[tokens[i].type]) {
                    matchers = [
                        addCombinator(elementMatcher(matchers), matcher)
                    ];
                } else {
                    matcher = Expr.filter[tokens[i].type].apply(null, tokens[i].matches);
                    // Return special upon seeing a positional matcher
                    if (matcher[expando]) {
                        // Find the next relative operator (if any) for proper handling
                        j = ++i;
                        for(; j < len; j++){
                            if (Expr.relative[tokens[j].type]) {
                                break;
                            }
                        }
                        return setMatcher(i > 1 && elementMatcher(matchers), i > 1 && toSelector(// If the preceding token was a descendant combinator, insert an implicit any-element `*`
                        tokens.slice(0, i - 1).concat({
                            value: tokens[i - 2].type === " " ? "*" : ""
                        })).replace(rtrim, "$1"), matcher, i < j && matcherFromTokens(tokens.slice(i, j)), j < len && matcherFromTokens(tokens = tokens.slice(j)), j < len && toSelector(tokens));
                    }
                    matchers.push(matcher);
                }
            }
            return elementMatcher(matchers);
        }
        function matcherFromGroupMatchers(elementMatchers, setMatchers) {
            var bySet = setMatchers.length > 0, byElement = elementMatchers.length > 0, superMatcher = function(seed, context, xml, results, outermost) {
                var elem, j, matcher, matchedCount = 0, i = "0", unmatched = seed && [], setMatched = [], contextBackup = outermostContext, // We must always have either seed elements or outermost context
                elems = seed || byElement && Expr.find["TAG"]("*", outermost), // Use integer dirruns iff this is the outermost matcher
                dirrunsUnique = dirruns += contextBackup == null ? 1 : Math.random() || 0.1, len = elems.length;
                if (outermost) {
                    outermostContext = context !== document && context;
                }
                // Add elements passing elementMatchers directly to results
                // Keep `i` a string if there are no elements so `matchedCount` will be "00" below
                // Support: IE<9, Safari
                // Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
                for(; i !== len && (elem = elems[i]) != null; i++){
                    if (byElement && elem) {
                        j = 0;
                        while(matcher = elementMatchers[j++]){
                            if (matcher(elem, context, xml)) {
                                results.push(elem);
                                break;
                            }
                        }
                        if (outermost) {
                            dirruns = dirrunsUnique;
                        }
                    }
                    // Track unmatched elements for set filters
                    if (bySet) {
                        // They will have gone through all possible matchers
                        if (elem = !matcher && elem) {
                            matchedCount--;
                        }
                        // Lengthen the array for every element, matched or not
                        if (seed) {
                            unmatched.push(elem);
                        }
                    }
                }
                // Apply set filters to unmatched elements
                matchedCount += i;
                if (bySet && i !== matchedCount) {
                    j = 0;
                    while(matcher = setMatchers[j++]){
                        matcher(unmatched, setMatched, context, xml);
                    }
                    if (seed) {
                        // Reintegrate element matches to eliminate the need for sorting
                        if (matchedCount > 0) {
                            while(i--){
                                if (!(unmatched[i] || setMatched[i])) {
                                    setMatched[i] = pop.call(results);
                                }
                            }
                        }
                        // Discard index placeholder values to get only actual matches
                        setMatched = condense(setMatched);
                    }
                    // Add matches to results
                    push.apply(results, setMatched);
                    // Seedless set matches succeeding multiple successful matchers stipulate sorting
                    if (outermost && !seed && setMatched.length > 0 && matchedCount + setMatchers.length > 1) {
                        Sizzle.uniqueSort(results);
                    }
                }
                // Override manipulation of globals by nested matchers
                if (outermost) {
                    dirruns = dirrunsUnique;
                    outermostContext = contextBackup;
                }
                return unmatched;
            };
            return bySet ? markFunction(superMatcher) : superMatcher;
        }
        compile = Sizzle.compile = function(selector, group /* Internal Use Only */ ) {
            var i, setMatchers = [], elementMatchers = [], cached = compilerCache[selector + " "];
            if (!cached) {
                // Generate a function of recursive functions that can be used to check each element
                if (!group) {
                    group = tokenize(selector);
                }
                i = group.length;
                while(i--){
                    cached = matcherFromTokens(group[i]);
                    if (cached[expando]) {
                        setMatchers.push(cached);
                    } else {
                        elementMatchers.push(cached);
                    }
                }
                // Cache the compiled function
                cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers));
            }
            return cached;
        };
        function multipleContexts(selector, contexts, results) {
            var i = 0, len = contexts.length;
            for(; i < len; i++){
                Sizzle(selector, contexts[i], results);
            }
            return results;
        }
        function select(selector, context, results, seed) {
            var i, tokens, token, type, find, match = tokenize(selector);
            if (!seed) {
                // Try to minimize operations if there is only one group
                if (match.length === 1) {
                    // Take a shortcut and set the context if the root selector is an ID
                    tokens = match[0] = match[0].slice(0);
                    if (tokens.length > 2 && (token = tokens[0]).type === "ID" && support.getById && context.nodeType === 9 && documentIsHTML && Expr.relative[tokens[1].type]) {
                        context = (Expr.find["ID"](token.matches[0].replace(runescape, funescape), context) || [])[0];
                        if (!context) {
                            return results;
                        }
                        selector = selector.slice(tokens.shift().value.length);
                    }
                    // Fetch a seed set for right-to-left matching
                    i = matchExpr["needsContext"].test(selector) ? 0 : tokens.length;
                    while(i--){
                        token = tokens[i];
                        // Abort if we hit a combinator
                        if (Expr.relative[type = token.type]) {
                            break;
                        }
                        if (find = Expr.find[type]) {
                            // Search, expanding context for leading sibling combinators
                            if (seed = find(token.matches[0].replace(runescape, funescape), rsibling.test(tokens[0].type) && testContext(context.parentNode) || context)) {
                                // If seed is empty or no tokens remain, we can return early
                                tokens.splice(i, 1);
                                selector = seed.length && toSelector(tokens);
                                if (!selector) {
                                    push.apply(results, seed);
                                    return results;
                                }
                                break;
                            }
                        }
                    }
                }
            }
            // Compile and execute a filtering function
            // Provide `match` to avoid retokenization if we modified the selector above
            compile(selector, match)(seed, context, !documentIsHTML, results, rsibling.test(selector) && testContext(context.parentNode) || context);
            return results;
        }
        // One-time assignments
        // Sort stability
        support.sortStable = expando.split("").sort(sortOrder).join("") === expando;
        // Support: Chrome<14
        // Always assume duplicates if they aren't passed to the comparison function
        support.detectDuplicates = !!hasDuplicate;
        // Initialize against the default document
        setDocument();
        // Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
        // Detached nodes confoundingly follow *each other*
        support.sortDetached = assert(function(div1) {
            // Should return 1, but returns 4 (following)
            return div1.compareDocumentPosition(document.createElement("div")) & 1;
        });
        // Support: IE<8
        // Prevent attribute/property "interpolation"
        // http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
        if (!assert(function(div) {
            div.innerHTML = "<a href='#'></a>";
            return div.firstChild.getAttribute("href") === "#";
        })) {
            addHandle("type|href|height|width", function(elem, name, isXML) {
                if (!isXML) {
                    return elem.getAttribute(name, name.toLowerCase() === "type" ? 1 : 2);
                }
            });
        }
        // Support: IE<9
        // Use defaultValue in place of getAttribute("value")
        if (!support.attributes || !assert(function(div) {
            div.innerHTML = "<input/>";
            div.firstChild.setAttribute("value", "");
            return div.firstChild.getAttribute("value") === "";
        })) {
            addHandle("value", function(elem, name, isXML) {
                if (!isXML && elem.nodeName.toLowerCase() === "input") {
                    return elem.defaultValue;
                }
            });
        }
        // Support: IE<9
        // Use getAttributeNode to fetch booleans when getAttribute lies
        if (!assert(function(div) {
            return div.getAttribute("disabled") == null;
        })) {
            addHandle(booleans, function(elem, name, isXML) {
                var val;
                if (!isXML) {
                    return elem[name] === true ? name.toLowerCase() : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
                }
            });
        }
        return Sizzle;
    }(window1);
    jQuery.find = Sizzle;
    jQuery.expr = Sizzle.selectors;
    jQuery.expr[":"] = jQuery.expr.pseudos;
    jQuery.unique = Sizzle.uniqueSort;
    jQuery.text = Sizzle.getText;
    jQuery.isXMLDoc = Sizzle.isXML;
    jQuery.contains = Sizzle.contains;
    var rneedsContext = jQuery.expr.match.needsContext;
    var rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;
    var risSimple = /^.[^:#\[\.,]*$/;
    // Implement the identical functionality for filter and not
    function winnow(elements, qualifier, not) {
        if (jQuery.isFunction(qualifier)) {
            return jQuery.grep(elements, function(elem, i) {
                /* jshint -W018 */ return !!qualifier.call(elem, i, elem) !== not;
            });
        }
        if (qualifier.nodeType) {
            return jQuery.grep(elements, function(elem) {
                return elem === qualifier !== not;
            });
        }
        if (typeof qualifier === "string") {
            if (risSimple.test(qualifier)) {
                return jQuery.filter(qualifier, elements, not);
            }
            qualifier = jQuery.filter(qualifier, elements);
        }
        return jQuery.grep(elements, function(elem) {
            return indexOf.call(qualifier, elem) >= 0 !== not;
        });
    }
    jQuery.filter = function(expr, elems, not) {
        var elem = elems[0];
        if (not) {
            expr = ":not(" + expr + ")";
        }
        return elems.length === 1 && elem.nodeType === 1 ? jQuery.find.matchesSelector(elem, expr) ? [
            elem
        ] : [] : jQuery.find.matches(expr, jQuery.grep(elems, function(elem) {
            return elem.nodeType === 1;
        }));
    };
    jQuery.fn.extend({
        find: function(selector) {
            var i, len = this.length, ret = [], self = this;
            if (typeof selector !== "string") {
                return this.pushStack(jQuery(selector).filter(function() {
                    for(i = 0; i < len; i++){
                        if (jQuery.contains(self[i], this)) {
                            return true;
                        }
                    }
                }));
            }
            for(i = 0; i < len; i++){
                jQuery.find(selector, self[i], ret);
            }
            // Needed because $( selector, context ) becomes $( context ).find( selector )
            ret = this.pushStack(len > 1 ? jQuery.unique(ret) : ret);
            ret.selector = this.selector ? this.selector + " " + selector : selector;
            return ret;
        },
        filter: function(selector) {
            return this.pushStack(winnow(this, selector || [], false));
        },
        not: function(selector) {
            return this.pushStack(winnow(this, selector || [], true));
        },
        is: function(selector) {
            return !!winnow(this, // If this is a positional/relative selector, check membership in the returned set
            // so $("p:first").is("p:last") won't return true for a doc with two "p".
            typeof selector === "string" && rneedsContext.test(selector) ? jQuery(selector) : selector || [], false).length;
        }
    });
    // Initialize a jQuery object
    // A central reference to the root jQuery(document)
    var rootjQuery, // A simple way to check for HTML strings
    // Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
    // Strict HTML recognition (#11290: must start with <)
    rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/, init = jQuery.fn.init = function(selector, context) {
        var match, elem;
        // HANDLE: $(""), $(null), $(undefined), $(false)
        if (!selector) {
            return this;
        }
        // Handle HTML strings
        if (typeof selector === "string") {
            if (selector[0] === "<" && selector[selector.length - 1] === ">" && selector.length >= 3) {
                // Assume that strings that start and end with <> are HTML and skip the regex check
                match = [
                    null,
                    selector,
                    null
                ];
            } else {
                match = rquickExpr.exec(selector);
            }
            // Match html or make sure no context is specified for #id
            if (match && (match[1] || !context)) {
                // HANDLE: $(html) -> $(array)
                if (match[1]) {
                    context = context instanceof jQuery ? context[0] : context;
                    // scripts is true for back-compat
                    // Intentionally let the error be thrown if parseHTML is not present
                    jQuery.merge(this, jQuery.parseHTML(match[1], context && context.nodeType ? context.ownerDocument || context : document, true));
                    // HANDLE: $(html, props)
                    if (rsingleTag.test(match[1]) && jQuery.isPlainObject(context)) {
                        for(match in context){
                            // Properties of context are called as methods if possible
                            if (jQuery.isFunction(this[match])) {
                                this[match](context[match]);
                            // ...and otherwise set as attributes
                            } else {
                                this.attr(match, context[match]);
                            }
                        }
                    }
                    return this;
                // HANDLE: $(#id)
                } else {
                    elem = document.getElementById(match[2]);
                    // Check parentNode to catch when Blackberry 4.6 returns
                    // nodes that are no longer in the document #6963
                    if (elem && elem.parentNode) {
                        // Inject the element directly into the jQuery object
                        this.length = 1;
                        this[0] = elem;
                    }
                    this.context = document;
                    this.selector = selector;
                    return this;
                }
            // HANDLE: $(expr, $(...))
            } else if (!context || context.jquery) {
                return (context || rootjQuery).find(selector);
            // HANDLE: $(expr, context)
            // (which is just equivalent to: $(context).find(expr)
            } else {
                return this.constructor(context).find(selector);
            }
        // HANDLE: $(DOMElement)
        } else if (selector.nodeType) {
            this.context = this[0] = selector;
            this.length = 1;
            return this;
        // HANDLE: $(function)
        // Shortcut for document ready
        } else if (jQuery.isFunction(selector)) {
            return typeof rootjQuery.ready !== "undefined" ? rootjQuery.ready(selector) : // Execute immediately if ready is not present
            selector(jQuery);
        }
        if (selector.selector !== undefined) {
            this.selector = selector.selector;
            this.context = selector.context;
        }
        return jQuery.makeArray(selector, this);
    };
    // Give the init function the jQuery prototype for later instantiation
    init.prototype = jQuery.fn;
    // Initialize central reference
    rootjQuery = jQuery(document);
    var rparentsprev = /^(?:parents|prev(?:Until|All))/, // methods guaranteed to produce a unique set when starting from a unique set
    guaranteedUnique = {
        children: true,
        contents: true,
        next: true,
        prev: true
    };
    jQuery.extend({
        dir: function(elem, dir, until) {
            var matched = [], truncate = until !== undefined;
            while((elem = elem[dir]) && elem.nodeType !== 9){
                if (elem.nodeType === 1) {
                    if (truncate && jQuery(elem).is(until)) {
                        break;
                    }
                    matched.push(elem);
                }
            }
            return matched;
        },
        sibling: function(n, elem) {
            var matched = [];
            for(; n; n = n.nextSibling){
                if (n.nodeType === 1 && n !== elem) {
                    matched.push(n);
                }
            }
            return matched;
        }
    });
    jQuery.fn.extend({
        has: function(target) {
            var targets = jQuery(target, this), l = targets.length;
            return this.filter(function() {
                var i = 0;
                for(; i < l; i++){
                    if (jQuery.contains(this, targets[i])) {
                        return true;
                    }
                }
            });
        },
        closest: function(selectors, context) {
            var cur, i = 0, l = this.length, matched = [], pos = rneedsContext.test(selectors) || typeof selectors !== "string" ? jQuery(selectors, context || this.context) : 0;
            for(; i < l; i++){
                for(cur = this[i]; cur && cur !== context; cur = cur.parentNode){
                    // Always skip document fragments
                    if (cur.nodeType < 11 && (pos ? pos.index(cur) > -1 : // Don't pass non-elements to Sizzle
                    cur.nodeType === 1 && jQuery.find.matchesSelector(cur, selectors))) {
                        matched.push(cur);
                        break;
                    }
                }
            }
            return this.pushStack(matched.length > 1 ? jQuery.unique(matched) : matched);
        },
        // Determine the position of an element within
        // the matched set of elements
        index: function(elem) {
            // No argument, return index in parent
            if (!elem) {
                return this[0] && this[0].parentNode ? this.first().prevAll().length : -1;
            }
            // index in selector
            if (typeof elem === "string") {
                return indexOf.call(jQuery(elem), this[0]);
            }
            // Locate the position of the desired element
            return indexOf.call(this, // If it receives a jQuery object, the first element is used
            elem.jquery ? elem[0] : elem);
        },
        add: function(selector, context) {
            return this.pushStack(jQuery.unique(jQuery.merge(this.get(), jQuery(selector, context))));
        },
        addBack: function(selector) {
            return this.add(selector == null ? this.prevObject : this.prevObject.filter(selector));
        }
    });
    function sibling(cur, dir) {
        while((cur = cur[dir]) && cur.nodeType !== 1){}
        return cur;
    }
    jQuery.each({
        parent: function(elem) {
            var parent = elem.parentNode;
            return parent && parent.nodeType !== 11 ? parent : null;
        },
        parents: function(elem) {
            return jQuery.dir(elem, "parentNode");
        },
        parentsUntil: function(elem, i, until) {
            return jQuery.dir(elem, "parentNode", until);
        },
        next: function(elem) {
            return sibling(elem, "nextSibling");
        },
        prev: function(elem) {
            return sibling(elem, "previousSibling");
        },
        nextAll: function(elem) {
            return jQuery.dir(elem, "nextSibling");
        },
        prevAll: function(elem) {
            return jQuery.dir(elem, "previousSibling");
        },
        nextUntil: function(elem, i, until) {
            return jQuery.dir(elem, "nextSibling", until);
        },
        prevUntil: function(elem, i, until) {
            return jQuery.dir(elem, "previousSibling", until);
        },
        siblings: function(elem) {
            return jQuery.sibling((elem.parentNode || {}).firstChild, elem);
        },
        children: function(elem) {
            return jQuery.sibling(elem.firstChild);
        },
        contents: function(elem) {
            return elem.contentDocument || jQuery.merge([], elem.childNodes);
        }
    }, function(name, fn) {
        jQuery.fn[name] = function(until, selector) {
            var matched = jQuery.map(this, fn, until);
            if (name.slice(-5) !== "Until") {
                selector = until;
            }
            if (selector && typeof selector === "string") {
                matched = jQuery.filter(selector, matched);
            }
            if (this.length > 1) {
                // Remove duplicates
                if (!guaranteedUnique[name]) {
                    jQuery.unique(matched);
                }
                // Reverse order for parents* and prev-derivatives
                if (rparentsprev.test(name)) {
                    matched.reverse();
                }
            }
            return this.pushStack(matched);
        };
    });
    var rnotwhite = /\S+/g;
    // String to Object options format cache
    var optionsCache = {};
    // Convert String-formatted options into Object-formatted ones and store in cache
    function createOptions(options) {
        var object = optionsCache[options] = {};
        jQuery.each(options.match(rnotwhite) || [], function(_, flag) {
            object[flag] = true;
        });
        return object;
    }
    /*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */ jQuery.Callbacks = function(options) {
        // Convert options from String-formatted to Object-formatted if needed
        // (we check in cache first)
        options = typeof options === "string" ? optionsCache[options] || createOptions(options) : jQuery.extend({}, options);
        var memory, // Flag to know if list was already fired
        fired, // Flag to know if list is currently firing
        firing, // First callback to fire (used internally by add and fireWith)
        firingStart, // End of the loop when firing
        firingLength, // Index of currently firing callback (modified by remove if needed)
        firingIndex, // Actual callback list
        list = [], // Stack of fire calls for repeatable lists
        stack = !options.once && [], // Fire callbacks
        fire = function(data) {
            memory = options.memory && data;
            fired = true;
            firingIndex = firingStart || 0;
            firingStart = 0;
            firingLength = list.length;
            firing = true;
            for(; list && firingIndex < firingLength; firingIndex++){
                if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
                    memory = false; // To prevent further calls using add
                    break;
                }
            }
            firing = false;
            if (list) {
                if (stack) {
                    if (stack.length) {
                        fire(stack.shift());
                    }
                } else if (memory) {
                    list = [];
                } else {
                    self.disable();
                }
            }
        }, // Actual Callbacks object
        self = {
            // Add a callback or a collection of callbacks to the list
            add: function() {
                if (list) {
                    // First, we save the current length
                    var start = list.length;
                    (function add(args) {
                        jQuery.each(args, function(_, arg) {
                            var type = jQuery.type(arg);
                            if (type === "function") {
                                if (!options.unique || !self.has(arg)) {
                                    list.push(arg);
                                }
                            } else if (arg && arg.length && type !== "string") {
                                // Inspect recursively
                                add(arg);
                            }
                        });
                    })(arguments);
                    // Do we need to add the callbacks to the
                    // current firing batch?
                    if (firing) {
                        firingLength = list.length;
                    // With memory, if we're not firing then
                    // we should call right away
                    } else if (memory) {
                        firingStart = start;
                        fire(memory);
                    }
                }
                return this;
            },
            // Remove a callback from the list
            remove: function() {
                if (list) {
                    jQuery.each(arguments, function(_, arg) {
                        var index;
                        while((index = jQuery.inArray(arg, list, index)) > -1){
                            list.splice(index, 1);
                            // Handle firing indexes
                            if (firing) {
                                if (index <= firingLength) {
                                    firingLength--;
                                }
                                if (index <= firingIndex) {
                                    firingIndex--;
                                }
                            }
                        }
                    });
                }
                return this;
            },
            // Check if a given callback is in the list.
            // If no argument is given, return whether or not list has callbacks attached.
            has: function(fn) {
                return fn ? jQuery.inArray(fn, list) > -1 : !!(list && list.length);
            },
            // Remove all callbacks from the list
            empty: function() {
                list = [];
                firingLength = 0;
                return this;
            },
            // Have the list do nothing anymore
            disable: function() {
                list = stack = memory = undefined;
                return this;
            },
            // Is it disabled?
            disabled: function() {
                return !list;
            },
            // Lock the list in its current state
            lock: function() {
                stack = undefined;
                if (!memory) {
                    self.disable();
                }
                return this;
            },
            // Is it locked?
            locked: function() {
                return !stack;
            },
            // Call all callbacks with the given context and arguments
            fireWith: function(context, args) {
                if (list && (!fired || stack)) {
                    args = args || [];
                    args = [
                        context,
                        args.slice ? args.slice() : args
                    ];
                    if (firing) {
                        stack.push(args);
                    } else {
                        fire(args);
                    }
                }
                return this;
            },
            // Call all the callbacks with the given arguments
            fire: function() {
                self.fireWith(this, arguments);
                return this;
            },
            // To know if the callbacks have already been called at least once
            fired: function() {
                return !!fired;
            }
        };
        return self;
    };
    jQuery.extend({
        Deferred: function(func) {
            var tuples = [
                // action, add listener, listener list, final state
                [
                    "resolve",
                    "done",
                    jQuery.Callbacks("once memory"),
                    "resolved"
                ],
                [
                    "reject",
                    "fail",
                    jQuery.Callbacks("once memory"),
                    "rejected"
                ],
                [
                    "notify",
                    "progress",
                    jQuery.Callbacks("memory")
                ]
            ], state = "pending", promise = {
                state: function() {
                    return state;
                },
                always: function() {
                    deferred.done(arguments).fail(arguments);
                    return this;
                },
                then: function() {
                    var fns = arguments;
                    return jQuery.Deferred(function(newDefer) {
                        jQuery.each(tuples, function(i, tuple) {
                            var fn = jQuery.isFunction(fns[i]) && fns[i];
                            // deferred[ done | fail | progress ] for forwarding actions to newDefer
                            deferred[tuple[1]](function() {
                                var returned = fn && fn.apply(this, arguments);
                                if (returned && jQuery.isFunction(returned.promise)) {
                                    returned.promise().done(newDefer.resolve).fail(newDefer.reject).progress(newDefer.notify);
                                } else {
                                    newDefer[tuple[0] + "With"](this === promise ? newDefer.promise() : this, fn ? [
                                        returned
                                    ] : arguments);
                                }
                            });
                        });
                        fns = null;
                    }).promise();
                },
                // Get a promise for this deferred
                // If obj is provided, the promise aspect is added to the object
                promise: function(obj) {
                    return obj != null ? jQuery.extend(obj, promise) : promise;
                }
            }, deferred = {};
            // Keep pipe for back-compat
            promise.pipe = promise.then;
            // Add list-specific methods
            jQuery.each(tuples, function(i, tuple) {
                var list = tuple[2], stateString = tuple[3];
                // promise[ done | fail | progress ] = list.add
                promise[tuple[1]] = list.add;
                // Handle state
                if (stateString) {
                    list.add(function() {
                        // state = [ resolved | rejected ]
                        state = stateString;
                    // [ reject_list | resolve_list ].disable; progress_list.lock
                    }, tuples[i ^ 1][2].disable, tuples[2][2].lock);
                }
                // deferred[ resolve | reject | notify ]
                deferred[tuple[0]] = function() {
                    deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments);
                    return this;
                };
                deferred[tuple[0] + "With"] = list.fireWith;
            });
            // Make the deferred a promise
            promise.promise(deferred);
            // Call given func if any
            if (func) {
                func.call(deferred, deferred);
            }
            // All done!
            return deferred;
        },
        // Deferred helper
        when: function(subordinate /* , ..., subordinateN */ ) {
            var i = 0, resolveValues = slice.call(arguments), length = resolveValues.length, // the count of uncompleted subordinates
            remaining = length !== 1 || subordinate && jQuery.isFunction(subordinate.promise) ? length : 0, // the master Deferred. If resolveValues consist of only a single Deferred, just use that.
            deferred = remaining === 1 ? subordinate : jQuery.Deferred(), // Update function for both resolve and progress values
            updateFunc = function(i, contexts, values) {
                return function(value) {
                    contexts[i] = this;
                    values[i] = arguments.length > 1 ? slice.call(arguments) : value;
                    if (values === progressValues) {
                        deferred.notifyWith(contexts, values);
                    } else if (!--remaining) {
                        deferred.resolveWith(contexts, values);
                    }
                };
            }, progressValues, progressContexts, resolveContexts;
            // add listeners to Deferred subordinates; treat others as resolved
            if (length > 1) {
                progressValues = new Array(length);
                progressContexts = new Array(length);
                resolveContexts = new Array(length);
                for(; i < length; i++){
                    if (resolveValues[i] && jQuery.isFunction(resolveValues[i].promise)) {
                        resolveValues[i].promise().done(updateFunc(i, resolveContexts, resolveValues)).fail(deferred.reject).progress(updateFunc(i, progressContexts, progressValues));
                    } else {
                        --remaining;
                    }
                }
            }
            // if we're not waiting on anything, resolve the master
            if (!remaining) {
                deferred.resolveWith(resolveContexts, resolveValues);
            }
            return deferred.promise();
        }
    });
    // The deferred used on DOM ready
    var readyList;
    jQuery.fn.ready = function(fn) {
        // Add the callback
        jQuery.ready.promise().done(fn);
        return this;
    };
    jQuery.extend({
        // Is the DOM ready to be used? Set to true once it occurs.
        isReady: false,
        // A counter to track how many items to wait for before
        // the ready event fires. See #6781
        readyWait: 1,
        // Hold (or release) the ready event
        holdReady: function(hold) {
            if (hold) {
                jQuery.readyWait++;
            } else {
                jQuery.ready(true);
            }
        },
        // Handle when the DOM is ready
        ready: function(wait) {
            // Abort if there are pending holds or we're already ready
            if (wait === true ? --jQuery.readyWait : jQuery.isReady) {
                return;
            }
            // Remember that the DOM is ready
            jQuery.isReady = true;
            // If a normal DOM Ready event fired, decrement, and wait if need be
            if (wait !== true && --jQuery.readyWait > 0) {
                return;
            }
            // If there are functions bound, to execute
            readyList.resolveWith(document, [
                jQuery
            ]);
            // Trigger any bound ready events
            if (jQuery.fn.trigger) {
                jQuery(document).trigger("ready").off("ready");
            }
        }
    });
    /**
 * The ready event handler and self cleanup method
 */ function completed() {
        document.removeEventListener("DOMContentLoaded", completed, false);
        window1.removeEventListener("load", completed, false);
        jQuery.ready();
    }
    jQuery.ready.promise = function(obj) {
        if (!readyList) {
            readyList = jQuery.Deferred();
            // Catch cases where $(document).ready() is called after the browser event has already occurred.
            // we once tried to use readyState "interactive" here, but it caused issues like the one
            // discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
            if (document.readyState === "complete") {
                // Handle it asynchronously to allow scripts the opportunity to delay ready
                setTimeout(jQuery.ready);
            } else {
                // Use the handy event callback
                document.addEventListener("DOMContentLoaded", completed, false);
                // A fallback to window.onload, that will always work
                window1.addEventListener("load", completed, false);
            }
        }
        return readyList.promise(obj);
    };
    // Kick off the DOM ready check even if the user does not
    jQuery.ready.promise();
    // Multifunctional method to get and set values of a collection
    // The value/s can optionally be executed if it's a function
    var access = jQuery.access = function(elems, fn, key, value, chainable, emptyGet, raw) {
        var i = 0, len = elems.length, bulk = key == null;
        // Sets many values
        if (jQuery.type(key) === "object") {
            chainable = true;
            for(i in key){
                jQuery.access(elems, fn, i, key[i], true, emptyGet, raw);
            }
        // Sets one value
        } else if (value !== undefined) {
            chainable = true;
            if (!jQuery.isFunction(value)) {
                raw = true;
            }
            if (bulk) {
                // Bulk operations run against the entire set
                if (raw) {
                    fn.call(elems, value);
                    fn = null;
                // ...except when executing function values
                } else {
                    bulk = fn;
                    fn = function(elem, key, value) {
                        return bulk.call(jQuery(elem), value);
                    };
                }
            }
            if (fn) {
                for(; i < len; i++){
                    fn(elems[i], key, raw ? value : value.call(elems[i], i, fn(elems[i], key)));
                }
            }
        }
        return chainable ? elems : // Gets
        bulk ? fn.call(elems) : len ? fn(elems[0], key) : emptyGet;
    };
    /**
 * Determines whether an object can have data
 */ jQuery.acceptData = function(owner) {
        // Accepts only:
        //  - Node
        //    - Node.ELEMENT_NODE
        //    - Node.DOCUMENT_NODE
        //  - Object
        //    - Any
        /* jshint -W018 */ return owner.nodeType === 1 || owner.nodeType === 9 || !+owner.nodeType;
    };
    function Data() {
        // Support: Android < 4,
        // Old WebKit does not have Object.preventExtensions/freeze method,
        // return new empty object instead with no [[set]] accessor
        Object.defineProperty(this.cache = {}, 0, {
            get: function() {
                return {};
            }
        });
        this.expando = jQuery.expando + Math.random();
    }
    Data.uid = 1;
    Data.accepts = jQuery.acceptData;
    Data.prototype = {
        key: function(owner) {
            // We can accept data for non-element nodes in modern browsers,
            // but we should not, see #8335.
            // Always return the key for a frozen object.
            if (!Data.accepts(owner)) {
                return 0;
            }
            var descriptor = {}, // Check if the owner object already has a cache key
            unlock = owner[this.expando];
            // If not, create one
            if (!unlock) {
                unlock = Data.uid++;
                // Secure it in a non-enumerable, non-writable property
                try {
                    descriptor[this.expando] = {
                        value: unlock
                    };
                    Object.defineProperties(owner, descriptor);
                // Support: Android < 4
                // Fallback to a less secure definition
                } catch (e) {
                    descriptor[this.expando] = unlock;
                    jQuery.extend(owner, descriptor);
                }
            }
            // Ensure the cache object
            if (!this.cache[unlock]) {
                this.cache[unlock] = {};
            }
            return unlock;
        },
        set: function(owner, data, value) {
            var prop, // There may be an unlock assigned to this node,
            // if there is no entry for this "owner", create one inline
            // and set the unlock as though an owner entry had always existed
            unlock = this.key(owner), cache = this.cache[unlock];
            // Handle: [ owner, key, value ] args
            if (typeof data === "string") {
                cache[data] = value;
            // Handle: [ owner, { properties } ] args
            } else {
                // Fresh assignments by object are shallow copied
                if (jQuery.isEmptyObject(cache)) {
                    jQuery.extend(this.cache[unlock], data);
                // Otherwise, copy the properties one-by-one to the cache object
                } else {
                    for(prop in data){
                        cache[prop] = data[prop];
                    }
                }
            }
            return cache;
        },
        get: function(owner, key) {
            // Either a valid cache is found, or will be created.
            // New caches will be created and the unlock returned,
            // allowing direct access to the newly created
            // empty data object. A valid owner object must be provided.
            var cache = this.cache[this.key(owner)];
            return key === undefined ? cache : cache[key];
        },
        access: function(owner, key, value) {
            var stored;
            // In cases where either:
            //
            //   1. No key was specified
            //   2. A string key was specified, but no value provided
            //
            // Take the "read" path and allow the get method to determine
            // which value to return, respectively either:
            //
            //   1. The entire cache object
            //   2. The data stored at the key
            //
            if (key === undefined || key && typeof key === "string" && value === undefined) {
                stored = this.get(owner, key);
                return stored !== undefined ? stored : this.get(owner, jQuery.camelCase(key));
            }
            // [*]When the key is not a string, or both a key and value
            // are specified, set or extend (existing objects) with either:
            //
            //   1. An object of properties
            //   2. A key and value
            //
            this.set(owner, key, value);
            // Since the "set" path can have two possible entry points
            // return the expected data based on which path was taken[*]
            return value !== undefined ? value : key;
        },
        remove: function(owner, key) {
            var i, name, camel, unlock = this.key(owner), cache = this.cache[unlock];
            if (key === undefined) {
                this.cache[unlock] = {};
            } else {
                // Support array or space separated string of keys
                if (jQuery.isArray(key)) {
                    // If "name" is an array of keys...
                    // When data is initially created, via ("key", "val") signature,
                    // keys will be converted to camelCase.
                    // Since there is no way to tell _how_ a key was added, remove
                    // both plain key and camelCase key. #12786
                    // This will only penalize the array argument path.
                    name = key.concat(key.map(jQuery.camelCase));
                } else {
                    camel = jQuery.camelCase(key);
                    // Try the string as a key before any manipulation
                    if (key in cache) {
                        name = [
                            key,
                            camel
                        ];
                    } else {
                        // If a key with the spaces exists, use it.
                        // Otherwise, create an array by matching non-whitespace
                        name = camel;
                        name = name in cache ? [
                            name
                        ] : name.match(rnotwhite) || [];
                    }
                }
                i = name.length;
                while(i--){
                    delete cache[name[i]];
                }
            }
        },
        hasData: function(owner) {
            return !jQuery.isEmptyObject(this.cache[owner[this.expando]] || {});
        },
        discard: function(owner) {
            if (owner[this.expando]) {
                delete this.cache[owner[this.expando]];
            }
        }
    };
    var data_priv = new Data();
    var data_user = new Data();
    /*
	Implementation Summary

	1. Enforce API surface and semantic compatibility with 1.9.x branch
	2. Improve the module's maintainability by reducing the storage
		paths to a single mechanism.
	3. Use the same single mechanism to support "private" and "user" data.
	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
	5. Avoid exposing implementation details on user objects (eg. expando properties)
	6. Provide a clear path for implementation upgrade to WeakMap in 2014
*/ var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/, rmultiDash = /([A-Z])/g;
    function dataAttr(elem, key, data) {
        var name;
        // If nothing was found internally, try to fetch any
        // data from the HTML5 data-* attribute
        if (data === undefined && elem.nodeType === 1) {
            name = "data-" + key.replace(rmultiDash, "-$1").toLowerCase();
            data = elem.getAttribute(name);
            if (typeof data === "string") {
                try {
                    data = data === "true" ? true : data === "false" ? false : data === "null" ? null : // Only convert to a number if it doesn't change the string
                    +data + "" === data ? +data : rbrace.test(data) ? jQuery.parseJSON(data) : data;
                } catch (e) {}
                // Make sure we set the data so it isn't changed later
                data_user.set(elem, key, data);
            } else {
                data = undefined;
            }
        }
        return data;
    }
    jQuery.extend({
        hasData: function(elem) {
            return data_user.hasData(elem) || data_priv.hasData(elem);
        },
        data: function(elem, name, data) {
            return data_user.access(elem, name, data);
        },
        removeData: function(elem, name) {
            data_user.remove(elem, name);
        },
        // TODO: Now that all calls to _data and _removeData have been replaced
        // with direct calls to data_priv methods, these can be deprecated.
        _data: function(elem, name, data) {
            return data_priv.access(elem, name, data);
        },
        _removeData: function(elem, name) {
            data_priv.remove(elem, name);
        }
    });
    jQuery.fn.extend({
        data: function(key, value) {
            var i, name, data, elem = this[0], attrs = elem && elem.attributes;
            // Gets all values
            if (key === undefined) {
                if (this.length) {
                    data = data_user.get(elem);
                    if (elem.nodeType === 1 && !data_priv.get(elem, "hasDataAttrs")) {
                        i = attrs.length;
                        while(i--){
                            name = attrs[i].name;
                            if (name.indexOf("data-") === 0) {
                                name = jQuery.camelCase(name.slice(5));
                                dataAttr(elem, name, data[name]);
                            }
                        }
                        data_priv.set(elem, "hasDataAttrs", true);
                    }
                }
                return data;
            }
            // Sets multiple values
            if (typeof key === "object") {
                return this.each(function() {
                    data_user.set(this, key);
                });
            }
            return access(this, function(value) {
                var data, camelKey = jQuery.camelCase(key);
                // The calling jQuery object (element matches) is not empty
                // (and therefore has an element appears at this[ 0 ]) and the
                // `value` parameter was not undefined. An empty jQuery object
                // will result in `undefined` for elem = this[ 0 ] which will
                // throw an exception if an attempt to read a data cache is made.
                if (elem && value === undefined) {
                    // Attempt to get data from the cache
                    // with the key as-is
                    data = data_user.get(elem, key);
                    if (data !== undefined) {
                        return data;
                    }
                    // Attempt to get data from the cache
                    // with the key camelized
                    data = data_user.get(elem, camelKey);
                    if (data !== undefined) {
                        return data;
                    }
                    // Attempt to "discover" the data in
                    // HTML5 custom data-* attrs
                    data = dataAttr(elem, camelKey, undefined);
                    if (data !== undefined) {
                        return data;
                    }
                    // We tried really hard, but the data doesn't exist.
                    return;
                }
                // Set the data...
                this.each(function() {
                    // First, attempt to store a copy or reference of any
                    // data that might've been store with a camelCased key.
                    var data = data_user.get(this, camelKey);
                    // For HTML5 data-* attribute interop, we have to
                    // store property names with dashes in a camelCase form.
                    // This might not apply to all properties...*
                    data_user.set(this, camelKey, value);
                    // *... In the case of properties that might _actually_
                    // have dashes, we need to also store a copy of that
                    // unchanged property.
                    if (key.indexOf("-") !== -1 && data !== undefined) {
                        data_user.set(this, key, value);
                    }
                });
            }, null, value, arguments.length > 1, null, true);
        },
        removeData: function(key) {
            return this.each(function() {
                data_user.remove(this, key);
            });
        }
    });
    jQuery.extend({
        queue: function(elem, type, data) {
            var queue;
            if (elem) {
                type = (type || "fx") + "queue";
                queue = data_priv.get(elem, type);
                // Speed up dequeue by getting out quickly if this is just a lookup
                if (data) {
                    if (!queue || jQuery.isArray(data)) {
                        queue = data_priv.access(elem, type, jQuery.makeArray(data));
                    } else {
                        queue.push(data);
                    }
                }
                return queue || [];
            }
        },
        dequeue: function(elem, type) {
            type = type || "fx";
            var queue = jQuery.queue(elem, type), startLength = queue.length, fn = queue.shift(), hooks = jQuery._queueHooks(elem, type), next = function() {
                jQuery.dequeue(elem, type);
            };
            // If the fx queue is dequeued, always remove the progress sentinel
            if (fn === "inprogress") {
                fn = queue.shift();
                startLength--;
            }
            if (fn) {
                // Add a progress sentinel to prevent the fx queue from being
                // automatically dequeued
                if (type === "fx") {
                    queue.unshift("inprogress");
                }
                // clear up the last queue stop function
                delete hooks.stop;
                fn.call(elem, next, hooks);
            }
            if (!startLength && hooks) {
                hooks.empty.fire();
            }
        },
        // not intended for public consumption - generates a queueHooks object, or returns the current one
        _queueHooks: function(elem, type) {
            var key = type + "queueHooks";
            return data_priv.get(elem, key) || data_priv.access(elem, key, {
                empty: jQuery.Callbacks("once memory").add(function() {
                    data_priv.remove(elem, [
                        type + "queue",
                        key
                    ]);
                })
            });
        }
    });
    jQuery.fn.extend({
        queue: function(type, data) {
            var setter = 2;
            if (typeof type !== "string") {
                data = type;
                type = "fx";
                setter--;
            }
            if (arguments.length < setter) {
                return jQuery.queue(this[0], type);
            }
            return data === undefined ? this : this.each(function() {
                var queue = jQuery.queue(this, type, data);
                // ensure a hooks for this queue
                jQuery._queueHooks(this, type);
                if (type === "fx" && queue[0] !== "inprogress") {
                    jQuery.dequeue(this, type);
                }
            });
        },
        dequeue: function(type) {
            return this.each(function() {
                jQuery.dequeue(this, type);
            });
        },
        clearQueue: function(type) {
            return this.queue(type || "fx", []);
        },
        // Get a promise resolved when queues of a certain type
        // are emptied (fx is the type by default)
        promise: function(type, obj) {
            var tmp, count = 1, defer = jQuery.Deferred(), elements = this, i = this.length, resolve = function() {
                if (!--count) {
                    defer.resolveWith(elements, [
                        elements
                    ]);
                }
            };
            if (typeof type !== "string") {
                obj = type;
                type = undefined;
            }
            type = type || "fx";
            while(i--){
                tmp = data_priv.get(elements[i], type + "queueHooks");
                if (tmp && tmp.empty) {
                    count++;
                    tmp.empty.add(resolve);
                }
            }
            resolve();
            return defer.promise(obj);
        }
    });
    var pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
    var cssExpand = [
        "Top",
        "Right",
        "Bottom",
        "Left"
    ];
    var isHidden = function(elem, el) {
        // isHidden might be called from jQuery#filter function;
        // in that case, element will be second argument
        elem = el || elem;
        return jQuery.css(elem, "display") === "none" || !jQuery.contains(elem.ownerDocument, elem);
    };
    var rcheckableType = /^(?:checkbox|radio)$/i;
    (function() {
        var fragment = document.createDocumentFragment(), div = fragment.appendChild(document.createElement("div"));
        // #11217 - WebKit loses check when the name is after the checked attribute
        div.innerHTML = "<input type='radio' checked='checked' name='t'/>";
        // Support: Safari 5.1, iOS 5.1, Android 4.x, Android 2.3
        // old WebKit doesn't clone checked state correctly in fragments
        support.checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked;
        // Make sure textarea (and checkbox) defaultValue is properly cloned
        // Support: IE9-IE11+
        div.innerHTML = "<textarea>x</textarea>";
        support.noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue;
    })();
    var strundefined = typeof undefined;
    support.focusinBubbles = "onfocusin" in window1;
    var rkeyEvent = /^key/, rmouseEvent = /^(?:mouse|contextmenu)|click/, rfocusMorph = /^(?:focusinfocus|focusoutblur)$/, rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;
    function returnTrue() {
        return true;
    }
    function returnFalse() {
        return false;
    }
    function safeActiveElement() {
        try {
            return document.activeElement;
        } catch (err) {}
    }
    /*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */ jQuery.event = {
        global: {},
        add: function(elem, types, handler, data, selector) {
            var handleObjIn, eventHandle, tmp, events, t, handleObj, special, handlers, type, namespaces, origType, elemData = data_priv.get(elem);
            // Don't attach events to noData or text/comment nodes (but allow plain objects)
            if (!elemData) {
                return;
            }
            // Caller can pass in an object of custom data in lieu of the handler
            if (handler.handler) {
                handleObjIn = handler;
                handler = handleObjIn.handler;
                selector = handleObjIn.selector;
            }
            // Make sure that the handler has a unique ID, used to find/remove it later
            if (!handler.guid) {
                handler.guid = jQuery.guid++;
            }
            // Init the element's event structure and main handler, if this is the first
            if (!(events = elemData.events)) {
                events = elemData.events = {};
            }
            if (!(eventHandle = elemData.handle)) {
                eventHandle = elemData.handle = function(e) {
                    // Discard the second event of a jQuery.event.trigger() and
                    // when an event is called after a page has unloaded
                    return typeof jQuery !== strundefined && jQuery.event.triggered !== e.type ? jQuery.event.dispatch.apply(elem, arguments) : undefined;
                };
            }
            // Handle multiple events separated by a space
            types = (types || "").match(rnotwhite) || [
                ""
            ];
            t = types.length;
            while(t--){
                tmp = rtypenamespace.exec(types[t]) || [];
                type = origType = tmp[1];
                namespaces = (tmp[2] || "").split(".").sort();
                // There *must* be a type, no attaching namespace-only handlers
                if (!type) {
                    continue;
                }
                // If event changes its type, use the special event handlers for the changed type
                special = jQuery.event.special[type] || {};
                // If selector defined, determine special event api type, otherwise given type
                type = (selector ? special.delegateType : special.bindType) || type;
                // Update special based on newly reset type
                special = jQuery.event.special[type] || {};
                // handleObj is passed to all event handlers
                handleObj = jQuery.extend({
                    type: type,
                    origType: origType,
                    data: data,
                    handler: handler,
                    guid: handler.guid,
                    selector: selector,
                    needsContext: selector && jQuery.expr.match.needsContext.test(selector),
                    namespace: namespaces.join(".")
                }, handleObjIn);
                // Init the event handler queue if we're the first
                if (!(handlers = events[type])) {
                    handlers = events[type] = [];
                    handlers.delegateCount = 0;
                    // Only use addEventListener if the special events handler returns false
                    if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
                        if (elem.addEventListener) {
                            elem.addEventListener(type, eventHandle, false);
                        }
                    }
                }
                if (special.add) {
                    special.add.call(elem, handleObj);
                    if (!handleObj.handler.guid) {
                        handleObj.handler.guid = handler.guid;
                    }
                }
                // Add to the element's handler list, delegates in front
                if (selector) {
                    handlers.splice(handlers.delegateCount++, 0, handleObj);
                } else {
                    handlers.push(handleObj);
                }
                // Keep track of which events have ever been used, for event optimization
                jQuery.event.global[type] = true;
            }
        },
        // Detach an event or set of events from an element
        remove: function(elem, types, handler, selector, mappedTypes) {
            var j, origCount, tmp, events, t, handleObj, special, handlers, type, namespaces, origType, elemData = data_priv.hasData(elem) && data_priv.get(elem);
            if (!elemData || !(events = elemData.events)) {
                return;
            }
            // Once for each type.namespace in types; type may be omitted
            types = (types || "").match(rnotwhite) || [
                ""
            ];
            t = types.length;
            while(t--){
                tmp = rtypenamespace.exec(types[t]) || [];
                type = origType = tmp[1];
                namespaces = (tmp[2] || "").split(".").sort();
                // Unbind all events (on this namespace, if provided) for the element
                if (!type) {
                    for(type in events){
                        jQuery.event.remove(elem, type + types[t], handler, selector, true);
                    }
                    continue;
                }
                special = jQuery.event.special[type] || {};
                type = (selector ? special.delegateType : special.bindType) || type;
                handlers = events[type] || [];
                tmp = tmp[2] && new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)");
                // Remove matching events
                origCount = j = handlers.length;
                while(j--){
                    handleObj = handlers[j];
                    if ((mappedTypes || origType === handleObj.origType) && (!handler || handler.guid === handleObj.guid) && (!tmp || tmp.test(handleObj.namespace)) && (!selector || selector === handleObj.selector || selector === "**" && handleObj.selector)) {
                        handlers.splice(j, 1);
                        if (handleObj.selector) {
                            handlers.delegateCount--;
                        }
                        if (special.remove) {
                            special.remove.call(elem, handleObj);
                        }
                    }
                }
                // Remove generic event handler if we removed something and no more handlers exist
                // (avoids potential for endless recursion during removal of special event handlers)
                if (origCount && !handlers.length) {
                    if (!special.teardown || special.teardown.call(elem, namespaces, elemData.handle) === false) {
                        jQuery.removeEvent(elem, type, elemData.handle);
                    }
                    delete events[type];
                }
            }
            // Remove the expando if it's no longer used
            if (jQuery.isEmptyObject(events)) {
                delete elemData.handle;
                data_priv.remove(elem, "events");
            }
        },
        trigger: function(event, data, elem, onlyHandlers) {
            var i, cur, tmp, bubbleType, ontype, handle, special, eventPath = [
                elem || document
            ], type = hasOwn.call(event, "type") ? event.type : event, namespaces = hasOwn.call(event, "namespace") ? event.namespace.split(".") : [];
            cur = tmp = elem = elem || document;
            // Don't do events on text and comment nodes
            if (elem.nodeType === 3 || elem.nodeType === 8) {
                return;
            }
            // focus/blur morphs to focusin/out; ensure we're not firing them right now
            if (rfocusMorph.test(type + jQuery.event.triggered)) {
                return;
            }
            if (type.indexOf(".") >= 0) {
                // Namespaced trigger; create a regexp to match event type in handle()
                namespaces = type.split(".");
                type = namespaces.shift();
                namespaces.sort();
            }
            ontype = type.indexOf(":") < 0 && "on" + type;
            // Caller can pass in a jQuery.Event object, Object, or just an event type string
            event = event[jQuery.expando] ? event : new jQuery.Event(type, typeof event === "object" && event);
            // Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
            event.isTrigger = onlyHandlers ? 2 : 3;
            event.namespace = namespaces.join(".");
            event.namespace_re = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
            // Clean up the event in case it is being reused
            event.result = undefined;
            if (!event.target) {
                event.target = elem;
            }
            // Clone any incoming data and prepend the event, creating the handler arg list
            data = data == null ? [
                event
            ] : jQuery.makeArray(data, [
                event
            ]);
            // Allow special events to draw outside the lines
            special = jQuery.event.special[type] || {};
            if (!onlyHandlers && special.trigger && special.trigger.apply(elem, data) === false) {
                return;
            }
            // Determine event propagation path in advance, per W3C events spec (#9951)
            // Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
            if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)) {
                bubbleType = special.delegateType || type;
                if (!rfocusMorph.test(bubbleType + type)) {
                    cur = cur.parentNode;
                }
                for(; cur; cur = cur.parentNode){
                    eventPath.push(cur);
                    tmp = cur;
                }
                // Only add window if we got to document (e.g., not plain obj or detached DOM)
                if (tmp === (elem.ownerDocument || document)) {
                    eventPath.push(tmp.defaultView || tmp.parentWindow || window1);
                }
            }
            // Fire handlers on the event path
            i = 0;
            while((cur = eventPath[i++]) && !event.isPropagationStopped()){
                event.type = i > 1 ? bubbleType : special.bindType || type;
                // jQuery handler
                handle = (data_priv.get(cur, "events") || {})[event.type] && data_priv.get(cur, "handle");
                if (handle) {
                    handle.apply(cur, data);
                }
                // Native handler
                handle = ontype && cur[ontype];
                if (handle && handle.apply && jQuery.acceptData(cur)) {
                    event.result = handle.apply(cur, data);
                    if (event.result === false) {
                        event.preventDefault();
                    }
                }
            }
            event.type = type;
            // If nobody prevented the default action, do it now
            if (!onlyHandlers && !event.isDefaultPrevented()) {
                if ((!special._default || special._default.apply(eventPath.pop(), data) === false) && jQuery.acceptData(elem)) {
                    // Call a native DOM method on the target with the same name name as the event.
                    // Don't do default actions on window, that's where global variables be (#6170)
                    if (ontype && jQuery.isFunction(elem[type]) && !jQuery.isWindow(elem)) {
                        // Don't re-trigger an onFOO event when we call its FOO() method
                        tmp = elem[ontype];
                        if (tmp) {
                            elem[ontype] = null;
                        }
                        // Prevent re-triggering of the same event, since we already bubbled it above
                        jQuery.event.triggered = type;
                        elem[type]();
                        jQuery.event.triggered = undefined;
                        if (tmp) {
                            elem[ontype] = tmp;
                        }
                    }
                }
            }
            return event.result;
        },
        dispatch: function(event) {
            // Make a writable jQuery.Event from the native event object
            event = jQuery.event.fix(event);
            var i, j, ret, matched, handleObj, handlerQueue = [], args = slice.call(arguments), handlers = (data_priv.get(this, "events") || {})[event.type] || [], special = jQuery.event.special[event.type] || {};
            // Use the fix-ed jQuery.Event rather than the (read-only) native event
            args[0] = event;
            event.delegateTarget = this;
            // Call the preDispatch hook for the mapped type, and let it bail if desired
            if (special.preDispatch && special.preDispatch.call(this, event) === false) {
                return;
            }
            // Determine handlers
            handlerQueue = jQuery.event.handlers.call(this, event, handlers);
            // Run delegates first; they may want to stop propagation beneath us
            i = 0;
            while((matched = handlerQueue[i++]) && !event.isPropagationStopped()){
                event.currentTarget = matched.elem;
                j = 0;
                while((handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped()){
                    // Triggered event must either 1) have no namespace, or
                    // 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
                    if (!event.namespace_re || event.namespace_re.test(handleObj.namespace)) {
                        event.handleObj = handleObj;
                        event.data = handleObj.data;
                        ret = ((jQuery.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem, args);
                        if (ret !== undefined) {
                            if ((event.result = ret) === false) {
                                event.preventDefault();
                                event.stopPropagation();
                            }
                        }
                    }
                }
            }
            // Call the postDispatch hook for the mapped type
            if (special.postDispatch) {
                special.postDispatch.call(this, event);
            }
            return event.result;
        },
        handlers: function(event, handlers) {
            var i, matches, sel, handleObj, handlerQueue = [], delegateCount = handlers.delegateCount, cur = event.target;
            // Find delegate handlers
            // Black-hole SVG <use> instance trees (#13180)
            // Avoid non-left-click bubbling in Firefox (#3861)
            if (delegateCount && cur.nodeType && (!event.button || event.type !== "click")) {
                for(; cur !== this; cur = cur.parentNode || this){
                    // Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
                    if (cur.disabled !== true || event.type !== "click") {
                        matches = [];
                        for(i = 0; i < delegateCount; i++){
                            handleObj = handlers[i];
                            // Don't conflict with Object.prototype properties (#13203)
                            sel = handleObj.selector + " ";
                            if (matches[sel] === undefined) {
                                matches[sel] = handleObj.needsContext ? jQuery(sel, this).index(cur) >= 0 : jQuery.find(sel, this, null, [
                                    cur
                                ]).length;
                            }
                            if (matches[sel]) {
                                matches.push(handleObj);
                            }
                        }
                        if (matches.length) {
                            handlerQueue.push({
                                elem: cur,
                                handlers: matches
                            });
                        }
                    }
                }
            }
            // Add the remaining (directly-bound) handlers
            if (delegateCount < handlers.length) {
                handlerQueue.push({
                    elem: this,
                    handlers: handlers.slice(delegateCount)
                });
            }
            return handlerQueue;
        },
        // Includes some event props shared by KeyEvent and MouseEvent
        props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
        fixHooks: {},
        keyHooks: {
            props: "char charCode key keyCode".split(" "),
            filter: function(event, original) {
                // Add which for key events
                if (event.which == null) {
                    event.which = original.charCode != null ? original.charCode : original.keyCode;
                }
                return event;
            }
        },
        mouseHooks: {
            props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
            filter: function(event, original) {
                var eventDoc, doc, body, button = original.button;
                // Calculate pageX/Y if missing and clientX/Y available
                if (event.pageX == null && original.clientX != null) {
                    eventDoc = event.target.ownerDocument || document;
                    doc = eventDoc.documentElement;
                    body = eventDoc.body;
                    event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
                    event.pageY = original.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
                }
                // Add which for click: 1 === left; 2 === middle; 3 === right
                // Note: button is not normalized, so don't use it
                if (!event.which && button !== undefined) {
                    event.which = button & 1 ? 1 : button & 2 ? 3 : button & 4 ? 2 : 0;
                }
                return event;
            }
        },
        fix: function(event) {
            if (event[jQuery.expando]) {
                return event;
            }
            // Create a writable copy of the event object and normalize some properties
            var i, prop, copy, type = event.type, originalEvent = event, fixHook = this.fixHooks[type];
            if (!fixHook) {
                this.fixHooks[type] = fixHook = rmouseEvent.test(type) ? this.mouseHooks : rkeyEvent.test(type) ? this.keyHooks : {};
            }
            copy = fixHook.props ? this.props.concat(fixHook.props) : this.props;
            event = new jQuery.Event(originalEvent);
            i = copy.length;
            while(i--){
                prop = copy[i];
                event[prop] = originalEvent[prop];
            }
            // Support: Cordova 2.5 (WebKit) (#13255)
            // All events should have a target; Cordova deviceready doesn't
            if (!event.target) {
                event.target = document;
            }
            // Support: Safari 6.0+, Chrome < 28
            // Target should not be a text node (#504, #13143)
            if (event.target.nodeType === 3) {
                event.target = event.target.parentNode;
            }
            return fixHook.filter ? fixHook.filter(event, originalEvent) : event;
        },
        special: {
            load: {
                // Prevent triggered image.load events from bubbling to window.load
                noBubble: true
            },
            focus: {
                // Fire native event if possible so blur/focus sequence is correct
                trigger: function() {
                    if (this !== safeActiveElement() && this.focus) {
                        this.focus();
                        return false;
                    }
                },
                delegateType: "focusin"
            },
            blur: {
                trigger: function() {
                    if (this === safeActiveElement() && this.blur) {
                        this.blur();
                        return false;
                    }
                },
                delegateType: "focusout"
            },
            click: {
                // For checkbox, fire native event so checked state will be right
                trigger: function() {
                    if (this.type === "checkbox" && this.click && jQuery.nodeName(this, "input")) {
                        this.click();
                        return false;
                    }
                },
                // For cross-browser consistency, don't fire native .click() on links
                _default: function(event) {
                    return jQuery.nodeName(event.target, "a");
                }
            },
            beforeunload: {
                postDispatch: function(event) {
                    // Support: Firefox 20+
                    // Firefox doesn't alert if the returnValue field is not set.
                    if (event.result !== undefined) {
                        event.originalEvent.returnValue = event.result;
                    }
                }
            }
        },
        simulate: function(type, elem, event, bubble) {
            // Piggyback on a donor event to simulate a different one.
            // Fake originalEvent to avoid donor's stopPropagation, but if the
            // simulated event prevents default then we do the same on the donor.
            var e = jQuery.extend(new jQuery.Event(), event, {
                type: type,
                isSimulated: true,
                originalEvent: {}
            });
            if (bubble) {
                jQuery.event.trigger(e, null, elem);
            } else {
                jQuery.event.dispatch.call(elem, e);
            }
            if (e.isDefaultPrevented()) {
                event.preventDefault();
            }
        }
    };
    jQuery.removeEvent = function(elem, type, handle) {
        if (elem.removeEventListener) {
            elem.removeEventListener(type, handle, false);
        }
    };
    jQuery.Event = function(src, props) {
        // Allow instantiation without the 'new' keyword
        if (!(this instanceof jQuery.Event)) {
            return new jQuery.Event(src, props);
        }
        // Event object
        if (src && src.type) {
            this.originalEvent = src;
            this.type = src.type;
            // Events bubbling up the document may have been marked as prevented
            // by a handler lower down the tree; reflect the correct value.
            this.isDefaultPrevented = src.defaultPrevented || // Support: Android < 4.0
            src.defaultPrevented === undefined && src.getPreventDefault && src.getPreventDefault() ? returnTrue : returnFalse;
        // Event type
        } else {
            this.type = src;
        }
        // Put explicitly provided properties onto the event object
        if (props) {
            jQuery.extend(this, props);
        }
        // Create a timestamp if incoming event doesn't have one
        this.timeStamp = src && src.timeStamp || jQuery.now();
        // Mark it as fixed
        this[jQuery.expando] = true;
    };
    // jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
    // http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
    jQuery.Event.prototype = {
        isDefaultPrevented: returnFalse,
        isPropagationStopped: returnFalse,
        isImmediatePropagationStopped: returnFalse,
        preventDefault: function() {
            var e = this.originalEvent;
            this.isDefaultPrevented = returnTrue;
            if (e && e.preventDefault) {
                e.preventDefault();
            }
        },
        stopPropagation: function() {
            var e = this.originalEvent;
            this.isPropagationStopped = returnTrue;
            if (e && e.stopPropagation) {
                e.stopPropagation();
            }
        },
        stopImmediatePropagation: function() {
            this.isImmediatePropagationStopped = returnTrue;
            this.stopPropagation();
        }
    };
    // Create mouseenter/leave events using mouseover/out and event-time checks
    // Support: Chrome 15+
    jQuery.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    }, function(orig, fix) {
        jQuery.event.special[orig] = {
            delegateType: fix,
            bindType: fix,
            handle: function(event) {
                var ret, target = this, related = event.relatedTarget, handleObj = event.handleObj;
                // For mousenter/leave call the handler if related is outside the target.
                // NB: No relatedTarget if the mouse left/entered the browser window
                if (!related || related !== target && !jQuery.contains(target, related)) {
                    event.type = handleObj.origType;
                    ret = handleObj.handler.apply(this, arguments);
                    event.type = fix;
                }
                return ret;
            }
        };
    });
    // Create "bubbling" focus and blur events
    // Support: Firefox, Chrome, Safari
    if (!support.focusinBubbles) {
        jQuery.each({
            focus: "focusin",
            blur: "focusout"
        }, function(orig, fix) {
            // Attach a single capturing handler on the document while someone wants focusin/focusout
            var handler = function(event) {
                jQuery.event.simulate(fix, event.target, jQuery.event.fix(event), true);
            };
            jQuery.event.special[fix] = {
                setup: function() {
                    var doc = this.ownerDocument || this, attaches = data_priv.access(doc, fix);
                    if (!attaches) {
                        doc.addEventListener(orig, handler, true);
                    }
                    data_priv.access(doc, fix, (attaches || 0) + 1);
                },
                teardown: function() {
                    var doc = this.ownerDocument || this, attaches = data_priv.access(doc, fix) - 1;
                    if (!attaches) {
                        doc.removeEventListener(orig, handler, true);
                        data_priv.remove(doc, fix);
                    } else {
                        data_priv.access(doc, fix, attaches);
                    }
                }
            };
        });
    }
    jQuery.fn.extend({
        on: function(types, selector, data, fn, /*INTERNAL*/ one) {
            var origFn, type;
            // Types can be a map of types/handlers
            if (typeof types === "object") {
                // ( types-Object, selector, data )
                if (typeof selector !== "string") {
                    // ( types-Object, data )
                    data = data || selector;
                    selector = undefined;
                }
                for(type in types){
                    this.on(type, selector, data, types[type], one);
                }
                return this;
            }
            if (data == null && fn == null) {
                // ( types, fn )
                fn = selector;
                data = selector = undefined;
            } else if (fn == null) {
                if (typeof selector === "string") {
                    // ( types, selector, fn )
                    fn = data;
                    data = undefined;
                } else {
                    // ( types, data, fn )
                    fn = data;
                    data = selector;
                    selector = undefined;
                }
            }
            if (fn === false) {
                fn = returnFalse;
            } else if (!fn) {
                return this;
            }
            if (one === 1) {
                origFn = fn;
                fn = function(event) {
                    // Can use an empty set, since event contains the info
                    jQuery().off(event);
                    return origFn.apply(this, arguments);
                };
                // Use same guid so caller can remove using origFn
                fn.guid = origFn.guid || (origFn.guid = jQuery.guid++);
            }
            return this.each(function() {
                jQuery.event.add(this, types, fn, data, selector);
            });
        },
        one: function(types, selector, data, fn) {
            return this.on(types, selector, data, fn, 1);
        },
        off: function(types, selector, fn) {
            var handleObj, type;
            if (types && types.preventDefault && types.handleObj) {
                // ( event )  dispatched jQuery.Event
                handleObj = types.handleObj;
                jQuery(types.delegateTarget).off(handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType, handleObj.selector, handleObj.handler);
                return this;
            }
            if (typeof types === "object") {
                // ( types-object [, selector] )
                for(type in types){
                    this.off(type, selector, types[type]);
                }
                return this;
            }
            if (selector === false || typeof selector === "function") {
                // ( types [, fn] )
                fn = selector;
                selector = undefined;
            }
            if (fn === false) {
                fn = returnFalse;
            }
            return this.each(function() {
                jQuery.event.remove(this, types, fn, selector);
            });
        },
        trigger: function(type, data) {
            return this.each(function() {
                jQuery.event.trigger(type, data, this);
            });
        },
        triggerHandler: function(type, data) {
            var elem = this[0];
            if (elem) {
                return jQuery.event.trigger(type, data, elem, true);
            }
        }
    });
    var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, rtagName = /<([\w:]+)/, rhtml = /<|&#?\w+;/, rnoInnerhtml = /<(?:script|style|link)/i, // checked="checked" or checked
    rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i, rscriptType = /^$|\/(?:java|ecma)script/i, rscriptTypeMasked = /^true\/(.*)/, rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g, // We have to close these tags to support XHTML (#13200)
    wrapMap = {
        // Support: IE 9
        option: [
            1,
            "<select multiple='multiple'>",
            "</select>"
        ],
        thead: [
            1,
            "<table>",
            "</table>"
        ],
        col: [
            2,
            "<table><colgroup>",
            "</colgroup></table>"
        ],
        tr: [
            2,
            "<table><tbody>",
            "</tbody></table>"
        ],
        td: [
            3,
            "<table><tbody><tr>",
            "</tr></tbody></table>"
        ],
        _default: [
            0,
            "",
            ""
        ]
    };
    // Support: IE 9
    wrapMap.optgroup = wrapMap.option;
    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;
    // Support: 1.x compatibility
    // Manipulating tables requires a tbody
    function manipulationTarget(elem, content) {
        return jQuery.nodeName(elem, "table") && jQuery.nodeName(content.nodeType !== 11 ? content : content.firstChild, "tr") ? elem.getElementsByTagName("tbody")[0] || elem.appendChild(elem.ownerDocument.createElement("tbody")) : elem;
    }
    // Replace/restore the type attribute of script elements for safe DOM manipulation
    function disableScript(elem) {
        elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
        return elem;
    }
    function restoreScript(elem) {
        var match = rscriptTypeMasked.exec(elem.type);
        if (match) {
            elem.type = match[1];
        } else {
            elem.removeAttribute("type");
        }
        return elem;
    }
    // Mark scripts as having already been evaluated
    function setGlobalEval(elems, refElements) {
        var i = 0, l = elems.length;
        for(; i < l; i++){
            data_priv.set(elems[i], "globalEval", !refElements || data_priv.get(refElements[i], "globalEval"));
        }
    }
    function cloneCopyEvent(src, dest) {
        var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;
        if (dest.nodeType !== 1) {
            return;
        }
        // 1. Copy private data: events, handlers, etc.
        if (data_priv.hasData(src)) {
            pdataOld = data_priv.access(src);
            pdataCur = data_priv.set(dest, pdataOld);
            events = pdataOld.events;
            if (events) {
                delete pdataCur.handle;
                pdataCur.events = {};
                for(type in events){
                    for(i = 0, l = events[type].length; i < l; i++){
                        jQuery.event.add(dest, type, events[type][i]);
                    }
                }
            }
        }
        // 2. Copy user data
        if (data_user.hasData(src)) {
            udataOld = data_user.access(src);
            udataCur = jQuery.extend({}, udataOld);
            data_user.set(dest, udataCur);
        }
    }
    function getAll(context, tag) {
        var ret = context.getElementsByTagName ? context.getElementsByTagName(tag || "*") : context.querySelectorAll ? context.querySelectorAll(tag || "*") : [];
        return tag === undefined || tag && jQuery.nodeName(context, tag) ? jQuery.merge([
            context
        ], ret) : ret;
    }
    // Support: IE >= 9
    function fixInput(src, dest) {
        var nodeName = dest.nodeName.toLowerCase();
        // Fails to persist the checked state of a cloned checkbox or radio button.
        if (nodeName === "input" && rcheckableType.test(src.type)) {
            dest.checked = src.checked;
        // Fails to return the selected option to the default selected state when cloning options
        } else if (nodeName === "input" || nodeName === "textarea") {
            dest.defaultValue = src.defaultValue;
        }
    }
    jQuery.extend({
        clone: function(elem, dataAndEvents, deepDataAndEvents) {
            var i, l, srcElements, destElements, clone = elem.cloneNode(true), inPage = jQuery.contains(elem.ownerDocument, elem);
            // Support: IE >= 9
            // Fix Cloning issues
            if (!support.noCloneChecked && (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem)) {
                // We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
                destElements = getAll(clone);
                srcElements = getAll(elem);
                for(i = 0, l = srcElements.length; i < l; i++){
                    fixInput(srcElements[i], destElements[i]);
                }
            }
            // Copy the events from the original to the clone
            if (dataAndEvents) {
                if (deepDataAndEvents) {
                    srcElements = srcElements || getAll(elem);
                    destElements = destElements || getAll(clone);
                    for(i = 0, l = srcElements.length; i < l; i++){
                        cloneCopyEvent(srcElements[i], destElements[i]);
                    }
                } else {
                    cloneCopyEvent(elem, clone);
                }
            }
            // Preserve script evaluation history
            destElements = getAll(clone, "script");
            if (destElements.length > 0) {
                setGlobalEval(destElements, !inPage && getAll(elem, "script"));
            }
            // Return the cloned set
            return clone;
        },
        buildFragment: function(elems, context, scripts, selection) {
            var elem, tmp, tag, wrap, contains, j, fragment = context.createDocumentFragment(), nodes = [], i = 0, l = elems.length;
            for(; i < l; i++){
                elem = elems[i];
                if (elem || elem === 0) {
                    // Add nodes directly
                    if (jQuery.type(elem) === "object") {
                        // Support: QtWebKit
                        // jQuery.merge because push.apply(_, arraylike) throws
                        jQuery.merge(nodes, elem.nodeType ? [
                            elem
                        ] : elem);
                    // Convert non-html into a text node
                    } else if (!rhtml.test(elem)) {
                        nodes.push(context.createTextNode(elem));
                    // Convert html into DOM nodes
                    } else {
                        tmp = tmp || fragment.appendChild(context.createElement("div"));
                        // Deserialize a standard representation
                        tag = (rtagName.exec(elem) || [
                            "",
                            ""
                        ])[1].toLowerCase();
                        wrap = wrapMap[tag] || wrapMap._default;
                        tmp.innerHTML = wrap[1] + elem.replace(rxhtmlTag, "<$1></$2>") + wrap[2];
                        // Descend through wrappers to the right content
                        j = wrap[0];
                        while(j--){
                            tmp = tmp.lastChild;
                        }
                        // Support: QtWebKit
                        // jQuery.merge because push.apply(_, arraylike) throws
                        jQuery.merge(nodes, tmp.childNodes);
                        // Remember the top-level container
                        tmp = fragment.firstChild;
                        // Fixes #12346
                        // Support: Webkit, IE
                        tmp.textContent = "";
                    }
                }
            }
            // Remove wrapper from fragment
            fragment.textContent = "";
            i = 0;
            while(elem = nodes[i++]){
                // #4087 - If origin and destination elements are the same, and this is
                // that element, do not do anything
                if (selection && jQuery.inArray(elem, selection) !== -1) {
                    continue;
                }
                contains = jQuery.contains(elem.ownerDocument, elem);
                // Append to fragment
                tmp = getAll(fragment.appendChild(elem), "script");
                // Preserve script evaluation history
                if (contains) {
                    setGlobalEval(tmp);
                }
                // Capture executables
                if (scripts) {
                    j = 0;
                    while(elem = tmp[j++]){
                        if (rscriptType.test(elem.type || "")) {
                            scripts.push(elem);
                        }
                    }
                }
            }
            return fragment;
        },
        cleanData: function(elems) {
            var data, elem, events, type, key, j, special = jQuery.event.special, i = 0;
            for(; (elem = elems[i]) !== undefined; i++){
                if (jQuery.acceptData(elem)) {
                    key = elem[data_priv.expando];
                    if (key && (data = data_priv.cache[key])) {
                        events = Object.keys(data.events || {});
                        if (events.length) {
                            for(j = 0; (type = events[j]) !== undefined; j++){
                                if (special[type]) {
                                    jQuery.event.remove(elem, type);
                                // This is a shortcut to avoid jQuery.event.remove's overhead
                                } else {
                                    jQuery.removeEvent(elem, type, data.handle);
                                }
                            }
                        }
                        if (data_priv.cache[key]) {
                            // Discard any remaining `private` data
                            delete data_priv.cache[key];
                        }
                    }
                }
                // Discard any remaining `user` data
                delete data_user.cache[elem[data_user.expando]];
            }
        }
    });
    jQuery.fn.extend({
        text: function(value) {
            return access(this, function(value) {
                return value === undefined ? jQuery.text(this) : this.empty().each(function() {
                    if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                        this.textContent = value;
                    }
                });
            }, null, value, arguments.length);
        },
        append: function() {
            return this.domManip(arguments, function(elem) {
                if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                    var target = manipulationTarget(this, elem);
                    target.appendChild(elem);
                }
            });
        },
        prepend: function() {
            return this.domManip(arguments, function(elem) {
                if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                    var target = manipulationTarget(this, elem);
                    target.insertBefore(elem, target.firstChild);
                }
            });
        },
        before: function() {
            return this.domManip(arguments, function(elem) {
                if (this.parentNode) {
                    this.parentNode.insertBefore(elem, this);
                }
            });
        },
        after: function() {
            return this.domManip(arguments, function(elem) {
                if (this.parentNode) {
                    this.parentNode.insertBefore(elem, this.nextSibling);
                }
            });
        },
        remove: function(selector, keepData /* Internal Use Only */ ) {
            var elem, elems = selector ? jQuery.filter(selector, this) : this, i = 0;
            for(; (elem = elems[i]) != null; i++){
                if (!keepData && elem.nodeType === 1) {
                    jQuery.cleanData(getAll(elem));
                }
                if (elem.parentNode) {
                    if (keepData && jQuery.contains(elem.ownerDocument, elem)) {
                        setGlobalEval(getAll(elem, "script"));
                    }
                    elem.parentNode.removeChild(elem);
                }
            }
            return this;
        },
        empty: function() {
            var elem, i = 0;
            for(; (elem = this[i]) != null; i++){
                if (elem.nodeType === 1) {
                    // Prevent memory leaks
                    jQuery.cleanData(getAll(elem, false));
                    // Remove any remaining nodes
                    elem.textContent = "";
                }
            }
            return this;
        },
        clone: function(dataAndEvents, deepDataAndEvents) {
            dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
            deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
            return this.map(function() {
                return jQuery.clone(this, dataAndEvents, deepDataAndEvents);
            });
        },
        html: function(value) {
            return access(this, function(value) {
                var elem = this[0] || {}, i = 0, l = this.length;
                if (value === undefined && elem.nodeType === 1) {
                    return elem.innerHTML;
                }
                // See if we can take a shortcut and just use innerHTML
                if (typeof value === "string" && !rnoInnerhtml.test(value) && !wrapMap[(rtagName.exec(value) || [
                    "",
                    ""
                ])[1].toLowerCase()]) {
                    value = value.replace(rxhtmlTag, "<$1></$2>");
                    try {
                        for(; i < l; i++){
                            elem = this[i] || {};
                            // Remove element nodes and prevent memory leaks
                            if (elem.nodeType === 1) {
                                jQuery.cleanData(getAll(elem, false));
                                elem.innerHTML = value;
                            }
                        }
                        elem = 0;
                    // If using innerHTML throws an exception, use the fallback method
                    } catch (e) {}
                }
                if (elem) {
                    this.empty().append(value);
                }
            }, null, value, arguments.length);
        },
        replaceWith: function() {
            var arg = arguments[0];
            // Make the changes, replacing each context element with the new content
            this.domManip(arguments, function(elem) {
                arg = this.parentNode;
                jQuery.cleanData(getAll(this));
                if (arg) {
                    arg.replaceChild(elem, this);
                }
            });
            // Force removal if there was no new content (e.g., from empty arguments)
            return arg && (arg.length || arg.nodeType) ? this : this.remove();
        },
        detach: function(selector) {
            return this.remove(selector, true);
        },
        domManip: function(args, callback) {
            // Flatten any nested arrays
            args = concat.apply([], args);
            var fragment, first, scripts, hasScripts, node, doc, i = 0, l = this.length, set = this, iNoClone = l - 1, value = args[0], isFunction = jQuery.isFunction(value);
            // We can't cloneNode fragments that contain checked, in WebKit
            if (isFunction || l > 1 && typeof value === "string" && !support.checkClone && rchecked.test(value)) {
                return this.each(function(index) {
                    var self = set.eq(index);
                    if (isFunction) {
                        args[0] = value.call(this, index, self.html());
                    }
                    self.domManip(args, callback);
                });
            }
            if (l) {
                fragment = jQuery.buildFragment(args, this[0].ownerDocument, false, this);
                first = fragment.firstChild;
                if (fragment.childNodes.length === 1) {
                    fragment = first;
                }
                if (first) {
                    scripts = jQuery.map(getAll(fragment, "script"), disableScript);
                    hasScripts = scripts.length;
                    // Use the original fragment for the last item instead of the first because it can end up
                    // being emptied incorrectly in certain situations (#8070).
                    for(; i < l; i++){
                        node = fragment;
                        if (i !== iNoClone) {
                            node = jQuery.clone(node, true, true);
                            // Keep references to cloned scripts for later restoration
                            if (hasScripts) {
                                // Support: QtWebKit
                                // jQuery.merge because push.apply(_, arraylike) throws
                                jQuery.merge(scripts, getAll(node, "script"));
                            }
                        }
                        callback.call(this[i], node, i);
                    }
                    if (hasScripts) {
                        doc = scripts[scripts.length - 1].ownerDocument;
                        // Reenable scripts
                        jQuery.map(scripts, restoreScript);
                        // Evaluate executable scripts on first document insertion
                        for(i = 0; i < hasScripts; i++){
                            node = scripts[i];
                            if (rscriptType.test(node.type || "") && !data_priv.access(node, "globalEval") && jQuery.contains(doc, node)) {
                                if (node.src) {
                                    // Optional AJAX dependency, but won't run scripts if not present
                                    if (jQuery._evalUrl) {
                                        jQuery._evalUrl(node.src);
                                    }
                                } else {
                                    jQuery.globalEval(node.textContent.replace(rcleanScript, ""));
                                }
                            }
                        }
                    }
                }
            }
            return this;
        }
    });
    jQuery.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function(name, original) {
        jQuery.fn[name] = function(selector) {
            var elems, ret = [], insert = jQuery(selector), last = insert.length - 1, i = 0;
            for(; i <= last; i++){
                elems = i === last ? this : this.clone(true);
                jQuery(insert[i])[original](elems);
                // Support: QtWebKit
                // .get() because push.apply(_, arraylike) throws
                push.apply(ret, elems.get());
            }
            return this.pushStack(ret);
        };
    });
    var iframe, elemdisplay = {};
    /**
 * Retrieve the actual display of a element
 * @param {String} name nodeName of the element
 * @param {Object} doc Document object
 */ // Called only from within defaultDisplay
    function actualDisplay(name, doc) {
        var elem = jQuery(doc.createElement(name)).appendTo(doc.body), // getDefaultComputedStyle might be reliably used only on attached element
        display = window1.getDefaultComputedStyle ? // Use of this method is a temporary fix (more like optmization) until something better comes along,
        // since it was removed from specification and supported only in FF
        window1.getDefaultComputedStyle(elem[0]).display : jQuery.css(elem[0], "display");
        // We don't have any data stored on the element,
        // so use "detach" method as fast way to get rid of the element
        elem.detach();
        return display;
    }
    /**
 * Try to determine the default display value of an element
 * @param {String} nodeName
 */ function defaultDisplay(nodeName) {
        var doc = document, display = elemdisplay[nodeName];
        if (!display) {
            display = actualDisplay(nodeName, doc);
            // If the simple way fails, read from inside an iframe
            if (display === "none" || !display) {
                // Use the already-created iframe if possible
                iframe = (iframe || jQuery("<iframe frameborder='0' width='0' height='0'/>")).appendTo(doc.documentElement);
                // Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
                doc = iframe[0].contentDocument;
                // Support: IE
                doc.write();
                doc.close();
                display = actualDisplay(nodeName, doc);
                iframe.detach();
            }
            // Store the correct default display
            elemdisplay[nodeName] = display;
        }
        return display;
    }
    var rmargin = /^margin/;
    var rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i");
    var getStyles = function(elem) {
        return elem.ownerDocument.defaultView.getComputedStyle(elem, null);
    };
    function curCSS(elem, name, computed) {
        var width, minWidth, maxWidth, ret, style = elem.style;
        computed = computed || getStyles(elem);
        // Support: IE9
        // getPropertyValue is only needed for .css('filter') in IE9, see #12537
        if (computed) {
            ret = computed.getPropertyValue(name) || computed[name];
        }
        if (computed) {
            if (ret === "" && !jQuery.contains(elem.ownerDocument, elem)) {
                ret = jQuery.style(elem, name);
            }
            // Support: iOS < 6
            // A tribute to the "awesome hack by Dean Edwards"
            // iOS < 6 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
            // this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
            if (rnumnonpx.test(ret) && rmargin.test(name)) {
                // Remember the original values
                width = style.width;
                minWidth = style.minWidth;
                maxWidth = style.maxWidth;
                // Put in the new values to get a computed value out
                style.minWidth = style.maxWidth = style.width = ret;
                ret = computed.width;
                // Revert the changed values
                style.width = width;
                style.minWidth = minWidth;
                style.maxWidth = maxWidth;
            }
        }
        return ret !== undefined ? // Support: IE
        // IE returns zIndex value as an integer.
        ret + "" : ret;
    }
    function addGetHookIf(conditionFn, hookFn) {
        // Define the hook, we'll check on the first run if it's really needed.
        return {
            get: function() {
                if (conditionFn()) {
                    // Hook not needed (or it's not possible to use it due to missing dependency),
                    // remove it.
                    // Since there are no other hooks for marginRight, remove the whole object.
                    delete this.get;
                    return;
                }
                // Hook needed; redefine it so that the support test is not executed again.
                return (this.get = hookFn).apply(this, arguments);
            }
        };
    }
    (function() {
        var pixelPositionVal, boxSizingReliableVal, // Support: Firefox, Android 2.3 (Prefixed box-sizing versions).
        divReset = "padding:0;margin:0;border:0;display:block;-webkit-box-sizing:content-box;" + "-moz-box-sizing:content-box;box-sizing:content-box", docElem = document.documentElement, container = document.createElement("div"), div = document.createElement("div");
        div.style.backgroundClip = "content-box";
        div.cloneNode(true).style.backgroundClip = "";
        support.clearCloneStyle = div.style.backgroundClip === "content-box";
        container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;" + "margin-top:1px";
        container.appendChild(div);
        // Executing both pixelPosition & boxSizingReliable tests require only one layout
        // so they're executed at the same time to save the second computation.
        function computePixelPositionAndBoxSizingReliable() {
            // Support: Firefox, Android 2.3 (Prefixed box-sizing versions).
            div.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" + "box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;" + "position:absolute;top:1%";
            docElem.appendChild(container);
            var divStyle = window1.getComputedStyle(div, null);
            pixelPositionVal = divStyle.top !== "1%";
            boxSizingReliableVal = divStyle.width === "4px";
            docElem.removeChild(container);
        }
        // Use window.getComputedStyle because jsdom on node.js will break without it.
        if (window1.getComputedStyle) {
            jQuery.extend(support, {
                pixelPosition: function() {
                    // This test is executed only once but we still do memoizing
                    // since we can use the boxSizingReliable pre-computing.
                    // No need to check if the test was already performed, though.
                    computePixelPositionAndBoxSizingReliable();
                    return pixelPositionVal;
                },
                boxSizingReliable: function() {
                    if (boxSizingReliableVal == null) {
                        computePixelPositionAndBoxSizingReliable();
                    }
                    return boxSizingReliableVal;
                },
                reliableMarginRight: function() {
                    // Support: Android 2.3
                    // Check if div with explicit width and no margin-right incorrectly
                    // gets computed margin-right based on width of container. (#3333)
                    // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
                    // This support function is only executed once so no memoizing is needed.
                    var ret, marginDiv = div.appendChild(document.createElement("div"));
                    marginDiv.style.cssText = div.style.cssText = divReset;
                    marginDiv.style.marginRight = marginDiv.style.width = "0";
                    div.style.width = "1px";
                    docElem.appendChild(container);
                    ret = !parseFloat(window1.getComputedStyle(marginDiv, null).marginRight);
                    docElem.removeChild(container);
                    // Clean up the div for other support tests.
                    div.innerHTML = "";
                    return ret;
                }
            });
        }
    })();
    // A method for quickly swapping in/out CSS properties to get correct calculations.
    jQuery.swap = function(elem, options, callback, args) {
        var ret, name, old = {};
        // Remember the old values, and insert the new ones
        for(name in options){
            old[name] = elem.style[name];
            elem.style[name] = options[name];
        }
        ret = callback.apply(elem, args || []);
        // Revert the old values
        for(name in options){
            elem.style[name] = old[name];
        }
        return ret;
    };
    var // swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
    // see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
    rdisplayswap = /^(none|table(?!-c[ea]).+)/, rnumsplit = new RegExp("^(" + pnum + ")(.*)$", "i"), rrelNum = new RegExp("^([+-])=(" + pnum + ")", "i"), cssShow = {
        position: "absolute",
        visibility: "hidden",
        display: "block"
    }, cssNormalTransform = {
        letterSpacing: 0,
        fontWeight: 400
    }, cssPrefixes = [
        "Webkit",
        "O",
        "Moz",
        "ms"
    ];
    // return a css property mapped to a potentially vendor prefixed property
    function vendorPropName(style, name) {
        // shortcut for names that are not vendor prefixed
        if (name in style) {
            return name;
        }
        // check for vendor prefixed names
        var capName = name[0].toUpperCase() + name.slice(1), origName = name, i = cssPrefixes.length;
        while(i--){
            name = cssPrefixes[i] + capName;
            if (name in style) {
                return name;
            }
        }
        return origName;
    }
    function setPositiveNumber(elem, value, subtract) {
        var matches = rnumsplit.exec(value);
        return matches ? // Guard against undefined "subtract", e.g., when used as in cssHooks
        Math.max(0, matches[1] - (subtract || 0)) + (matches[2] || "px") : value;
    }
    function augmentWidthOrHeight(elem, name, extra, isBorderBox, styles) {
        var i = extra === (isBorderBox ? "border" : "content") ? // If we already have the right measurement, avoid augmentation
        4 : // Otherwise initialize for horizontal or vertical properties
        name === "width" ? 1 : 0, val = 0;
        for(; i < 4; i += 2){
            // both box models exclude margin, so add it if we want it
            if (extra === "margin") {
                val += jQuery.css(elem, extra + cssExpand[i], true, styles);
            }
            if (isBorderBox) {
                // border-box includes padding, so remove it if we want content
                if (extra === "content") {
                    val -= jQuery.css(elem, "padding" + cssExpand[i], true, styles);
                }
                // at this point, extra isn't border nor margin, so remove border
                if (extra !== "margin") {
                    val -= jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
                }
            } else {
                // at this point, extra isn't content, so add padding
                val += jQuery.css(elem, "padding" + cssExpand[i], true, styles);
                // at this point, extra isn't content nor padding, so add border
                if (extra !== "padding") {
                    val += jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
                }
            }
        }
        return val;
    }
    function getWidthOrHeight(elem, name, extra) {
        // Start with offset property, which is equivalent to the border-box value
        var valueIsBorderBox = true, val = name === "width" ? elem.offsetWidth : elem.offsetHeight, styles = getStyles(elem), isBorderBox = jQuery.css(elem, "boxSizing", false, styles) === "border-box";
        // some non-html elements return undefined for offsetWidth, so check for null/undefined
        // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
        // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
        if (val <= 0 || val == null) {
            // Fall back to computed then uncomputed css if necessary
            val = curCSS(elem, name, styles);
            if (val < 0 || val == null) {
                val = elem.style[name];
            }
            // Computed unit is not pixels. Stop here and return.
            if (rnumnonpx.test(val)) {
                return val;
            }
            // we need the check for style in case a browser which returns unreliable values
            // for getComputedStyle silently falls back to the reliable elem.style
            valueIsBorderBox = isBorderBox && (support.boxSizingReliable() || val === elem.style[name]);
            // Normalize "", auto, and prepare for extra
            val = parseFloat(val) || 0;
        }
        // use the active box-sizing model to add/subtract irrelevant styles
        return val + augmentWidthOrHeight(elem, name, extra || (isBorderBox ? "border" : "content"), valueIsBorderBox, styles) + "px";
    }
    function showHide(elements, show) {
        var display, elem, hidden, values = [], index = 0, length = elements.length;
        for(; index < length; index++){
            elem = elements[index];
            if (!elem.style) {
                continue;
            }
            values[index] = data_priv.get(elem, "olddisplay");
            display = elem.style.display;
            if (show) {
                // Reset the inline display of this element to learn if it is
                // being hidden by cascaded rules or not
                if (!values[index] && display === "none") {
                    elem.style.display = "";
                }
                // Set elements which have been overridden with display: none
                // in a stylesheet to whatever the default browser style is
                // for such an element
                if (elem.style.display === "" && isHidden(elem)) {
                    values[index] = data_priv.access(elem, "olddisplay", defaultDisplay(elem.nodeName));
                }
            } else {
                if (!values[index]) {
                    hidden = isHidden(elem);
                    if (display && display !== "none" || !hidden) {
                        data_priv.set(elem, "olddisplay", hidden ? display : jQuery.css(elem, "display"));
                    }
                }
            }
        }
        // Set the display of most of the elements in a second loop
        // to avoid the constant reflow
        for(index = 0; index < length; index++){
            elem = elements[index];
            if (!elem.style) {
                continue;
            }
            if (!show || elem.style.display === "none" || elem.style.display === "") {
                elem.style.display = show ? values[index] || "" : "none";
            }
        }
        return elements;
    }
    jQuery.extend({
        // Add in style property hooks for overriding the default
        // behavior of getting and setting a style property
        cssHooks: {
            opacity: {
                get: function(elem, computed) {
                    if (computed) {
                        // We should always get a number back from opacity
                        var ret = curCSS(elem, "opacity");
                        return ret === "" ? "1" : ret;
                    }
                }
            }
        },
        // Don't automatically add "px" to these possibly-unitless properties
        cssNumber: {
            "columnCount": true,
            "fillOpacity": true,
            "fontWeight": true,
            "lineHeight": true,
            "opacity": true,
            "order": true,
            "orphans": true,
            "widows": true,
            "zIndex": true,
            "zoom": true
        },
        // Add in properties whose names you wish to fix before
        // setting or getting the value
        cssProps: {
            // normalize float css property
            "float": "cssFloat"
        },
        // Get and set the style property on a DOM Node
        style: function(elem, name, value, extra) {
            // Don't set styles on text and comment nodes
            if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
                return;
            }
            // Make sure that we're working with the right name
            var ret, type, hooks, origName = jQuery.camelCase(name), style = elem.style;
            name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(style, origName));
            // gets hook for the prefixed version
            // followed by the unprefixed version
            hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];
            // Check if we're setting a value
            if (value !== undefined) {
                type = typeof value;
                // convert relative number strings (+= or -=) to relative numbers. #7345
                if (type === "string" && (ret = rrelNum.exec(value))) {
                    value = (ret[1] + 1) * ret[2] + parseFloat(jQuery.css(elem, name));
                    // Fixes bug #9237
                    type = "number";
                }
                // Make sure that null and NaN values aren't set. See: #7116
                if (value == null || value !== value) {
                    return;
                }
                // If a number was passed in, add 'px' to the (except for certain CSS properties)
                if (type === "number" && !jQuery.cssNumber[origName]) {
                    value += "px";
                }
                // Fixes #8908, it can be done more correctly by specifying setters in cssHooks,
                // but it would mean to define eight (for every problematic property) identical functions
                if (!support.clearCloneStyle && value === "" && name.indexOf("background") === 0) {
                    style[name] = "inherit";
                }
                // If a hook was provided, use that value, otherwise just set the specified value
                if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== undefined) {
                    // Support: Chrome, Safari
                    // Setting style to blank string required to delete "style: x !important;"
                    style[name] = "";
                    style[name] = value;
                }
            } else {
                // If a hook was provided get the non-computed value from there
                if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== undefined) {
                    return ret;
                }
                // Otherwise just get the value from the style object
                return style[name];
            }
        },
        css: function(elem, name, extra, styles) {
            var val, num, hooks, origName = jQuery.camelCase(name);
            // Make sure that we're working with the right name
            name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(elem.style, origName));
            // gets hook for the prefixed version
            // followed by the unprefixed version
            hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];
            // If a hook was provided get the computed value from there
            if (hooks && "get" in hooks) {
                val = hooks.get(elem, true, extra);
            }
            // Otherwise, if a way to get the computed value exists, use that
            if (val === undefined) {
                val = curCSS(elem, name, styles);
            }
            //convert "normal" to computed value
            if (val === "normal" && name in cssNormalTransform) {
                val = cssNormalTransform[name];
            }
            // Return, converting to number if forced or a qualifier was provided and val looks numeric
            if (extra === "" || extra) {
                num = parseFloat(val);
                return extra === true || jQuery.isNumeric(num) ? num || 0 : val;
            }
            return val;
        }
    });
    jQuery.each([
        "height",
        "width"
    ], function(i, name) {
        jQuery.cssHooks[name] = {
            get: function(elem, computed, extra) {
                if (computed) {
                    // certain elements can have dimension info if we invisibly show them
                    // however, it must have a current display style that would benefit from this
                    return elem.offsetWidth === 0 && rdisplayswap.test(jQuery.css(elem, "display")) ? jQuery.swap(elem, cssShow, function() {
                        return getWidthOrHeight(elem, name, extra);
                    }) : getWidthOrHeight(elem, name, extra);
                }
            },
            set: function(elem, value, extra) {
                var styles = extra && getStyles(elem);
                return setPositiveNumber(elem, value, extra ? augmentWidthOrHeight(elem, name, extra, jQuery.css(elem, "boxSizing", false, styles) === "border-box", styles) : 0);
            }
        };
    });
    // Support: Android 2.3
    jQuery.cssHooks.marginRight = addGetHookIf(support.reliableMarginRight, function(elem, computed) {
        if (computed) {
            // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
            // Work around by temporarily setting element display to inline-block
            return jQuery.swap(elem, {
                "display": "inline-block"
            }, curCSS, [
                elem,
                "marginRight"
            ]);
        }
    });
    // These hooks are used by animate to expand properties
    jQuery.each({
        margin: "",
        padding: "",
        border: "Width"
    }, function(prefix, suffix) {
        jQuery.cssHooks[prefix + suffix] = {
            expand: function(value) {
                var i = 0, expanded = {}, // assumes a single number if not a string
                parts = typeof value === "string" ? value.split(" ") : [
                    value
                ];
                for(; i < 4; i++){
                    expanded[prefix + cssExpand[i] + suffix] = parts[i] || parts[i - 2] || parts[0];
                }
                return expanded;
            }
        };
        if (!rmargin.test(prefix)) {
            jQuery.cssHooks[prefix + suffix].set = setPositiveNumber;
        }
    });
    jQuery.fn.extend({
        css: function(name, value) {
            return access(this, function(elem, name, value) {
                var styles, len, map = {}, i = 0;
                if (jQuery.isArray(name)) {
                    styles = getStyles(elem);
                    len = name.length;
                    for(; i < len; i++){
                        map[name[i]] = jQuery.css(elem, name[i], false, styles);
                    }
                    return map;
                }
                return value !== undefined ? jQuery.style(elem, name, value) : jQuery.css(elem, name);
            }, name, value, arguments.length > 1);
        },
        show: function() {
            return showHide(this, true);
        },
        hide: function() {
            return showHide(this);
        },
        toggle: function(state) {
            if (typeof state === "boolean") {
                return state ? this.show() : this.hide();
            }
            return this.each(function() {
                if (isHidden(this)) {
                    jQuery(this).show();
                } else {
                    jQuery(this).hide();
                }
            });
        }
    });
    function Tween(elem, options, prop, end, easing) {
        return new Tween.prototype.init(elem, options, prop, end, easing);
    }
    jQuery.Tween = Tween;
    Tween.prototype = {
        constructor: Tween,
        init: function(elem, options, prop, end, easing, unit) {
            this.elem = elem;
            this.prop = prop;
            this.easing = easing || "swing";
            this.options = options;
            this.start = this.now = this.cur();
            this.end = end;
            this.unit = unit || (jQuery.cssNumber[prop] ? "" : "px");
        },
        cur: function() {
            var hooks = Tween.propHooks[this.prop];
            return hooks && hooks.get ? hooks.get(this) : Tween.propHooks._default.get(this);
        },
        run: function(percent) {
            var eased, hooks = Tween.propHooks[this.prop];
            if (this.options.duration) {
                this.pos = eased = jQuery.easing[this.easing](percent, this.options.duration * percent, 0, 1, this.options.duration);
            } else {
                this.pos = eased = percent;
            }
            this.now = (this.end - this.start) * eased + this.start;
            if (this.options.step) {
                this.options.step.call(this.elem, this.now, this);
            }
            if (hooks && hooks.set) {
                hooks.set(this);
            } else {
                Tween.propHooks._default.set(this);
            }
            return this;
        }
    };
    Tween.prototype.init.prototype = Tween.prototype;
    Tween.propHooks = {
        _default: {
            get: function(tween) {
                var result;
                if (tween.elem[tween.prop] != null && (!tween.elem.style || tween.elem.style[tween.prop] == null)) {
                    return tween.elem[tween.prop];
                }
                // passing an empty string as a 3rd parameter to .css will automatically
                // attempt a parseFloat and fallback to a string if the parse fails
                // so, simple values such as "10px" are parsed to Float.
                // complex values such as "rotate(1rad)" are returned as is.
                result = jQuery.css(tween.elem, tween.prop, "");
                // Empty strings, null, undefined and "auto" are converted to 0.
                return !result || result === "auto" ? 0 : result;
            },
            set: function(tween) {
                // use step hook for back compat - use cssHook if its there - use .style if its
                // available and use plain properties where available
                if (jQuery.fx.step[tween.prop]) {
                    jQuery.fx.step[tween.prop](tween);
                } else if (tween.elem.style && (tween.elem.style[jQuery.cssProps[tween.prop]] != null || jQuery.cssHooks[tween.prop])) {
                    jQuery.style(tween.elem, tween.prop, tween.now + tween.unit);
                } else {
                    tween.elem[tween.prop] = tween.now;
                }
            }
        }
    };
    // Support: IE9
    // Panic based approach to setting things on disconnected nodes
    Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
        set: function(tween) {
            if (tween.elem.nodeType && tween.elem.parentNode) {
                tween.elem[tween.prop] = tween.now;
            }
        }
    };
    jQuery.easing = {
        linear: function(p) {
            return p;
        },
        swing: function(p) {
            return 0.5 - Math.cos(p * Math.PI) / 2;
        }
    };
    jQuery.fx = Tween.prototype.init;
    // Back Compat <1.8 extension point
    jQuery.fx.step = {};
    var fxNow, timerId, rfxtypes = /^(?:toggle|show|hide)$/, rfxnum = new RegExp("^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i"), rrun = /queueHooks$/, animationPrefilters = [
        defaultPrefilter
    ], tweeners = {
        "*": [
            function(prop, value) {
                var tween = this.createTween(prop, value), target = tween.cur(), parts = rfxnum.exec(value), unit = parts && parts[3] || (jQuery.cssNumber[prop] ? "" : "px"), // Starting value computation is required for potential unit mismatches
                start = (jQuery.cssNumber[prop] || unit !== "px" && +target) && rfxnum.exec(jQuery.css(tween.elem, prop)), scale = 1, maxIterations = 20;
                if (start && start[3] !== unit) {
                    // Trust units reported by jQuery.css
                    unit = unit || start[3];
                    // Make sure we update the tween properties later on
                    parts = parts || [];
                    // Iteratively approximate from a nonzero starting point
                    start = +target || 1;
                    do {
                        // If previous iteration zeroed out, double until we get *something*
                        // Use a string for doubling factor so we don't accidentally see scale as unchanged below
                        scale = scale || ".5";
                        // Adjust and apply
                        start = start / scale;
                        jQuery.style(tween.elem, prop, start + unit);
                    // Update scale, tolerating zero or NaN from tween.cur()
                    // And breaking the loop if scale is unchanged or perfect, or if we've just had enough
                    }while (scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations)
                }
                // Update tween properties
                if (parts) {
                    start = tween.start = +start || +target || 0;
                    tween.unit = unit;
                    // If a +=/-= token was provided, we're doing a relative animation
                    tween.end = parts[1] ? start + (parts[1] + 1) * parts[2] : +parts[2];
                }
                return tween;
            }
        ]
    };
    // Animations created synchronously will run synchronously
    function createFxNow() {
        setTimeout(function() {
            fxNow = undefined;
        });
        return fxNow = jQuery.now();
    }
    // Generate parameters to create a standard animation
    function genFx(type, includeWidth) {
        var which, i = 0, attrs = {
            height: type
        };
        // if we include width, step value is 1 to do all cssExpand values,
        // if we don't include width, step value is 2 to skip over Left and Right
        includeWidth = includeWidth ? 1 : 0;
        for(; i < 4; i += 2 - includeWidth){
            which = cssExpand[i];
            attrs["margin" + which] = attrs["padding" + which] = type;
        }
        if (includeWidth) {
            attrs.opacity = attrs.width = type;
        }
        return attrs;
    }
    function createTween(value, prop, animation) {
        var tween, collection = (tweeners[prop] || []).concat(tweeners["*"]), index = 0, length = collection.length;
        for(; index < length; index++){
            if (tween = collection[index].call(animation, prop, value)) {
                // we're done with this property
                return tween;
            }
        }
    }
    function defaultPrefilter(elem, props, opts) {
        /* jshint validthis: true */ var prop, value, toggle, tween, hooks, oldfire, display, anim = this, orig = {}, style = elem.style, hidden = elem.nodeType && isHidden(elem), dataShow = data_priv.get(elem, "fxshow");
        // handle queue: false promises
        if (!opts.queue) {
            hooks = jQuery._queueHooks(elem, "fx");
            if (hooks.unqueued == null) {
                hooks.unqueued = 0;
                oldfire = hooks.empty.fire;
                hooks.empty.fire = function() {
                    if (!hooks.unqueued) {
                        oldfire();
                    }
                };
            }
            hooks.unqueued++;
            anim.always(function() {
                // doing this makes sure that the complete handler will be called
                // before this completes
                anim.always(function() {
                    hooks.unqueued--;
                    if (!jQuery.queue(elem, "fx").length) {
                        hooks.empty.fire();
                    }
                });
            });
        }
        // height/width overflow pass
        if (elem.nodeType === 1 && ("height" in props || "width" in props)) {
            // Make sure that nothing sneaks out
            // Record all 3 overflow attributes because IE9-10 do not
            // change the overflow attribute when overflowX and
            // overflowY are set to the same value
            opts.overflow = [
                style.overflow,
                style.overflowX,
                style.overflowY
            ];
            // Set display property to inline-block for height/width
            // animations on inline elements that are having width/height animated
            display = jQuery.css(elem, "display");
            // Get default display if display is currently "none"
            if (display === "none") {
                display = defaultDisplay(elem.nodeName);
            }
            if (display === "inline" && jQuery.css(elem, "float") === "none") {
                style.display = "inline-block";
            }
        }
        if (opts.overflow) {
            style.overflow = "hidden";
            anim.always(function() {
                style.overflow = opts.overflow[0];
                style.overflowX = opts.overflow[1];
                style.overflowY = opts.overflow[2];
            });
        }
        // show/hide pass
        for(prop in props){
            value = props[prop];
            if (rfxtypes.exec(value)) {
                delete props[prop];
                toggle = toggle || value === "toggle";
                if (value === (hidden ? "hide" : "show")) {
                    // If there is dataShow left over from a stopped hide or show and we are going to proceed with show, we should pretend to be hidden
                    if (value === "show" && dataShow && dataShow[prop] !== undefined) {
                        hidden = true;
                    } else {
                        continue;
                    }
                }
                orig[prop] = dataShow && dataShow[prop] || jQuery.style(elem, prop);
            }
        }
        if (!jQuery.isEmptyObject(orig)) {
            if (dataShow) {
                if ("hidden" in dataShow) {
                    hidden = dataShow.hidden;
                }
            } else {
                dataShow = data_priv.access(elem, "fxshow", {});
            }
            // store state if its toggle - enables .stop().toggle() to "reverse"
            if (toggle) {
                dataShow.hidden = !hidden;
            }
            if (hidden) {
                jQuery(elem).show();
            } else {
                anim.done(function() {
                    jQuery(elem).hide();
                });
            }
            anim.done(function() {
                var prop;
                data_priv.remove(elem, "fxshow");
                for(prop in orig){
                    jQuery.style(elem, prop, orig[prop]);
                }
            });
            for(prop in orig){
                tween = createTween(hidden ? dataShow[prop] : 0, prop, anim);
                if (!(prop in dataShow)) {
                    dataShow[prop] = tween.start;
                    if (hidden) {
                        tween.end = tween.start;
                        tween.start = prop === "width" || prop === "height" ? 1 : 0;
                    }
                }
            }
        }
    }
    function propFilter(props, specialEasing) {
        var index, name, easing, value, hooks;
        // camelCase, specialEasing and expand cssHook pass
        for(index in props){
            name = jQuery.camelCase(index);
            easing = specialEasing[name];
            value = props[index];
            if (jQuery.isArray(value)) {
                easing = value[1];
                value = props[index] = value[0];
            }
            if (index !== name) {
                props[name] = value;
                delete props[index];
            }
            hooks = jQuery.cssHooks[name];
            if (hooks && "expand" in hooks) {
                value = hooks.expand(value);
                delete props[name];
                // not quite $.extend, this wont overwrite keys already present.
                // also - reusing 'index' from above because we have the correct "name"
                for(index in value){
                    if (!(index in props)) {
                        props[index] = value[index];
                        specialEasing[index] = easing;
                    }
                }
            } else {
                specialEasing[name] = easing;
            }
        }
    }
    function Animation(elem, properties, options) {
        var result, stopped, index = 0, length = animationPrefilters.length, deferred = jQuery.Deferred().always(function() {
            // don't match elem in the :animated selector
            delete tick.elem;
        }), tick = function() {
            if (stopped) {
                return false;
            }
            var currentTime = fxNow || createFxNow(), remaining = Math.max(0, animation.startTime + animation.duration - currentTime), // archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
            temp = remaining / animation.duration || 0, percent = 1 - temp, index = 0, length = animation.tweens.length;
            for(; index < length; index++){
                animation.tweens[index].run(percent);
            }
            deferred.notifyWith(elem, [
                animation,
                percent,
                remaining
            ]);
            if (percent < 1 && length) {
                return remaining;
            } else {
                deferred.resolveWith(elem, [
                    animation
                ]);
                return false;
            }
        }, animation = deferred.promise({
            elem: elem,
            props: jQuery.extend({}, properties),
            opts: jQuery.extend(true, {
                specialEasing: {}
            }, options),
            originalProperties: properties,
            originalOptions: options,
            startTime: fxNow || createFxNow(),
            duration: options.duration,
            tweens: [],
            createTween: function(prop, end) {
                var tween = jQuery.Tween(elem, animation.opts, prop, end, animation.opts.specialEasing[prop] || animation.opts.easing);
                animation.tweens.push(tween);
                return tween;
            },
            stop: function(gotoEnd) {
                var index = 0, // if we are going to the end, we want to run all the tweens
                // otherwise we skip this part
                length = gotoEnd ? animation.tweens.length : 0;
                if (stopped) {
                    return this;
                }
                stopped = true;
                for(; index < length; index++){
                    animation.tweens[index].run(1);
                }
                // resolve when we played the last frame
                // otherwise, reject
                if (gotoEnd) {
                    deferred.resolveWith(elem, [
                        animation,
                        gotoEnd
                    ]);
                } else {
                    deferred.rejectWith(elem, [
                        animation,
                        gotoEnd
                    ]);
                }
                return this;
            }
        }), props = animation.props;
        propFilter(props, animation.opts.specialEasing);
        for(; index < length; index++){
            result = animationPrefilters[index].call(animation, elem, props, animation.opts);
            if (result) {
                return result;
            }
        }
        jQuery.map(props, createTween, animation);
        if (jQuery.isFunction(animation.opts.start)) {
            animation.opts.start.call(elem, animation);
        }
        jQuery.fx.timer(jQuery.extend(tick, {
            elem: elem,
            anim: animation,
            queue: animation.opts.queue
        }));
        // attach callbacks from options
        return animation.progress(animation.opts.progress).done(animation.opts.done, animation.opts.complete).fail(animation.opts.fail).always(animation.opts.always);
    }
    jQuery.Animation = jQuery.extend(Animation, {
        tweener: function(props, callback) {
            if (jQuery.isFunction(props)) {
                callback = props;
                props = [
                    "*"
                ];
            } else {
                props = props.split(" ");
            }
            var prop, index = 0, length = props.length;
            for(; index < length; index++){
                prop = props[index];
                tweeners[prop] = tweeners[prop] || [];
                tweeners[prop].unshift(callback);
            }
        },
        prefilter: function(callback, prepend) {
            if (prepend) {
                animationPrefilters.unshift(callback);
            } else {
                animationPrefilters.push(callback);
            }
        }
    });
    jQuery.speed = function(speed, easing, fn) {
        var opt = speed && typeof speed === "object" ? jQuery.extend({}, speed) : {
            complete: fn || !fn && easing || jQuery.isFunction(speed) && speed,
            duration: speed,
            easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
        };
        opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration : opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;
        // normalize opt.queue - true/undefined/null -> "fx"
        if (opt.queue == null || opt.queue === true) {
            opt.queue = "fx";
        }
        // Queueing
        opt.old = opt.complete;
        opt.complete = function() {
            if (jQuery.isFunction(opt.old)) {
                opt.old.call(this);
            }
            if (opt.queue) {
                jQuery.dequeue(this, opt.queue);
            }
        };
        return opt;
    };
    jQuery.fn.extend({
        fadeTo: function(speed, to, easing, callback) {
            // show any hidden elements after setting opacity to 0
            return this.filter(isHidden).css("opacity", 0).show()// animate to the value specified
            .end().animate({
                opacity: to
            }, speed, easing, callback);
        },
        animate: function(prop, speed, easing, callback) {
            var empty = jQuery.isEmptyObject(prop), optall = jQuery.speed(speed, easing, callback), doAnimation = function() {
                // Operate on a copy of prop so per-property easing won't be lost
                var anim = Animation(this, jQuery.extend({}, prop), optall);
                // Empty animations, or finishing resolves immediately
                if (empty || data_priv.get(this, "finish")) {
                    anim.stop(true);
                }
            };
            doAnimation.finish = doAnimation;
            return empty || optall.queue === false ? this.each(doAnimation) : this.queue(optall.queue, doAnimation);
        },
        stop: function(type, clearQueue, gotoEnd) {
            var stopQueue = function(hooks) {
                var stop = hooks.stop;
                delete hooks.stop;
                stop(gotoEnd);
            };
            if (typeof type !== "string") {
                gotoEnd = clearQueue;
                clearQueue = type;
                type = undefined;
            }
            if (clearQueue && type !== false) {
                this.queue(type || "fx", []);
            }
            return this.each(function() {
                var dequeue = true, index = type != null && type + "queueHooks", timers = jQuery.timers, data = data_priv.get(this);
                if (index) {
                    if (data[index] && data[index].stop) {
                        stopQueue(data[index]);
                    }
                } else {
                    for(index in data){
                        if (data[index] && data[index].stop && rrun.test(index)) {
                            stopQueue(data[index]);
                        }
                    }
                }
                for(index = timers.length; index--;){
                    if (timers[index].elem === this && (type == null || timers[index].queue === type)) {
                        timers[index].anim.stop(gotoEnd);
                        dequeue = false;
                        timers.splice(index, 1);
                    }
                }
                // start the next in the queue if the last step wasn't forced
                // timers currently will call their complete callbacks, which will dequeue
                // but only if they were gotoEnd
                if (dequeue || !gotoEnd) {
                    jQuery.dequeue(this, type);
                }
            });
        },
        finish: function(type) {
            if (type !== false) {
                type = type || "fx";
            }
            return this.each(function() {
                var index, data = data_priv.get(this), queue = data[type + "queue"], hooks = data[type + "queueHooks"], timers = jQuery.timers, length = queue ? queue.length : 0;
                // enable finishing flag on private data
                data.finish = true;
                // empty the queue first
                jQuery.queue(this, type, []);
                if (hooks && hooks.stop) {
                    hooks.stop.call(this, true);
                }
                // look for any active animations, and finish them
                for(index = timers.length; index--;){
                    if (timers[index].elem === this && timers[index].queue === type) {
                        timers[index].anim.stop(true);
                        timers.splice(index, 1);
                    }
                }
                // look for any animations in the old queue and finish them
                for(index = 0; index < length; index++){
                    if (queue[index] && queue[index].finish) {
                        queue[index].finish.call(this);
                    }
                }
                // turn off finishing flag
                delete data.finish;
            });
        }
    });
    jQuery.each([
        "toggle",
        "show",
        "hide"
    ], function(i, name) {
        var cssFn = jQuery.fn[name];
        jQuery.fn[name] = function(speed, easing, callback) {
            return speed == null || typeof speed === "boolean" ? cssFn.apply(this, arguments) : this.animate(genFx(name, true), speed, easing, callback);
        };
    });
    // Generate shortcuts for custom animations
    jQuery.each({
        slideDown: genFx("show"),
        slideUp: genFx("hide"),
        slideToggle: genFx("toggle"),
        fadeIn: {
            opacity: "show"
        },
        fadeOut: {
            opacity: "hide"
        },
        fadeToggle: {
            opacity: "toggle"
        }
    }, function(name, props) {
        jQuery.fn[name] = function(speed, easing, callback) {
            return this.animate(props, speed, easing, callback);
        };
    });
    jQuery.timers = [];
    jQuery.fx.tick = function() {
        var timer, i = 0, timers = jQuery.timers;
        fxNow = jQuery.now();
        for(; i < timers.length; i++){
            timer = timers[i];
            // Checks the timer has not already been removed
            if (!timer() && timers[i] === timer) {
                timers.splice(i--, 1);
            }
        }
        if (!timers.length) {
            jQuery.fx.stop();
        }
        fxNow = undefined;
    };
    jQuery.fx.timer = function(timer) {
        jQuery.timers.push(timer);
        if (timer()) {
            jQuery.fx.start();
        } else {
            jQuery.timers.pop();
        }
    };
    jQuery.fx.interval = 13;
    jQuery.fx.start = function() {
        if (!timerId) {
            timerId = setInterval(jQuery.fx.tick, jQuery.fx.interval);
        }
    };
    jQuery.fx.stop = function() {
        clearInterval(timerId);
        timerId = null;
    };
    jQuery.fx.speeds = {
        slow: 600,
        fast: 200,
        // Default speed
        _default: 400
    };
    // Based off of the plugin by Clint Helfers, with permission.
    // http://blindsignals.com/index.php/2009/07/jquery-delay/
    jQuery.fn.delay = function(time, type) {
        time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
        type = type || "fx";
        return this.queue(type, function(next, hooks) {
            var timeout = setTimeout(next, time);
            hooks.stop = function() {
                clearTimeout(timeout);
            };
        });
    };
    (function() {
        var input = document.createElement("input"), select = document.createElement("select"), opt = select.appendChild(document.createElement("option"));
        input.type = "checkbox";
        // Support: iOS 5.1, Android 4.x, Android 2.3
        // Check the default checkbox/radio value ("" on old WebKit; "on" elsewhere)
        support.checkOn = input.value !== "";
        // Must access the parent to make an option select properly
        // Support: IE9, IE10
        support.optSelected = opt.selected;
        // Make sure that the options inside disabled selects aren't marked as disabled
        // (WebKit marks them as disabled)
        select.disabled = true;
        support.optDisabled = !opt.disabled;
        // Check if an input maintains its value after becoming a radio
        // Support: IE9, IE10
        input = document.createElement("input");
        input.value = "t";
        input.type = "radio";
        support.radioValue = input.value === "t";
    })();
    var nodeHook, boolHook, attrHandle = jQuery.expr.attrHandle;
    jQuery.fn.extend({
        attr: function(name, value) {
            return access(this, jQuery.attr, name, value, arguments.length > 1);
        },
        removeAttr: function(name) {
            return this.each(function() {
                jQuery.removeAttr(this, name);
            });
        }
    });
    jQuery.extend({
        attr: function(elem, name, value) {
            var hooks, ret, nType = elem.nodeType;
            // don't get/set attributes on text, comment and attribute nodes
            if (!elem || nType === 3 || nType === 8 || nType === 2) {
                return;
            }
            // Fallback to prop when attributes are not supported
            if (typeof elem.getAttribute === strundefined) {
                return jQuery.prop(elem, name, value);
            }
            // All attributes are lowercase
            // Grab necessary hook if one is defined
            if (nType !== 1 || !jQuery.isXMLDoc(elem)) {
                name = name.toLowerCase();
                hooks = jQuery.attrHooks[name] || (jQuery.expr.match.bool.test(name) ? boolHook : nodeHook);
            }
            if (value !== undefined) {
                if (value === null) {
                    jQuery.removeAttr(elem, name);
                } else if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
                    return ret;
                } else {
                    elem.setAttribute(name, value + "");
                    return value;
                }
            } else if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
                return ret;
            } else {
                ret = jQuery.find.attr(elem, name);
                // Non-existent attributes return null, we normalize to undefined
                return ret == null ? undefined : ret;
            }
        },
        removeAttr: function(elem, value) {
            var name, propName, i = 0, attrNames = value && value.match(rnotwhite);
            if (attrNames && elem.nodeType === 1) {
                while(name = attrNames[i++]){
                    propName = jQuery.propFix[name] || name;
                    // Boolean attributes get special treatment (#10870)
                    if (jQuery.expr.match.bool.test(name)) {
                        // Set corresponding property to false
                        elem[propName] = false;
                    }
                    elem.removeAttribute(name);
                }
            }
        },
        attrHooks: {
            type: {
                set: function(elem, value) {
                    if (!support.radioValue && value === "radio" && jQuery.nodeName(elem, "input")) {
                        // Setting the type on a radio button after the value resets the value in IE6-9
                        // Reset value to default in case type is set after value during creation
                        var val = elem.value;
                        elem.setAttribute("type", value);
                        if (val) {
                            elem.value = val;
                        }
                        return value;
                    }
                }
            }
        }
    });
    // Hooks for boolean attributes
    boolHook = {
        set: function(elem, value, name) {
            if (value === false) {
                // Remove boolean attributes when set to false
                jQuery.removeAttr(elem, name);
            } else {
                elem.setAttribute(name, name);
            }
            return name;
        }
    };
    jQuery.each(jQuery.expr.match.bool.source.match(/\w+/g), function(i, name) {
        var getter = attrHandle[name] || jQuery.find.attr;
        attrHandle[name] = function(elem, name, isXML) {
            var ret, handle;
            if (!isXML) {
                // Avoid an infinite loop by temporarily removing this function from the getter
                handle = attrHandle[name];
                attrHandle[name] = ret;
                ret = getter(elem, name, isXML) != null ? name.toLowerCase() : null;
                attrHandle[name] = handle;
            }
            return ret;
        };
    });
    var rfocusable = /^(?:input|select|textarea|button)$/i;
    jQuery.fn.extend({
        prop: function(name, value) {
            return access(this, jQuery.prop, name, value, arguments.length > 1);
        },
        removeProp: function(name) {
            return this.each(function() {
                delete this[jQuery.propFix[name] || name];
            });
        }
    });
    jQuery.extend({
        propFix: {
            "for": "htmlFor",
            "class": "className"
        },
        prop: function(elem, name, value) {
            var ret, hooks, notxml, nType = elem.nodeType;
            // don't get/set properties on text, comment and attribute nodes
            if (!elem || nType === 3 || nType === 8 || nType === 2) {
                return;
            }
            notxml = nType !== 1 || !jQuery.isXMLDoc(elem);
            if (notxml) {
                // Fix name and attach hooks
                name = jQuery.propFix[name] || name;
                hooks = jQuery.propHooks[name];
            }
            if (value !== undefined) {
                return hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined ? ret : elem[name] = value;
            } else {
                return hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null ? ret : elem[name];
            }
        },
        propHooks: {
            tabIndex: {
                get: function(elem) {
                    return elem.hasAttribute("tabindex") || rfocusable.test(elem.nodeName) || elem.href ? elem.tabIndex : -1;
                }
            }
        }
    });
    // Support: IE9+
    // Selectedness for an option in an optgroup can be inaccurate
    if (!support.optSelected) {
        jQuery.propHooks.selected = {
            get: function(elem) {
                var parent = elem.parentNode;
                if (parent && parent.parentNode) {
                    parent.parentNode.selectedIndex;
                }
                return null;
            }
        };
    }
    jQuery.each([
        "tabIndex",
        "readOnly",
        "maxLength",
        "cellSpacing",
        "cellPadding",
        "rowSpan",
        "colSpan",
        "useMap",
        "frameBorder",
        "contentEditable"
    ], function() {
        jQuery.propFix[this.toLowerCase()] = this;
    });
    var rclass = /[\t\r\n\f]/g;
    jQuery.fn.extend({
        addClass: function(value) {
            var classes, elem, cur, clazz, j, finalValue, proceed = typeof value === "string" && value, i = 0, len = this.length;
            if (jQuery.isFunction(value)) {
                return this.each(function(j) {
                    jQuery(this).addClass(value.call(this, j, this.className));
                });
            }
            if (proceed) {
                // The disjunction here is for better compressibility (see removeClass)
                classes = (value || "").match(rnotwhite) || [];
                for(; i < len; i++){
                    elem = this[i];
                    cur = elem.nodeType === 1 && (elem.className ? (" " + elem.className + " ").replace(rclass, " ") : " ");
                    if (cur) {
                        j = 0;
                        while(clazz = classes[j++]){
                            if (cur.indexOf(" " + clazz + " ") < 0) {
                                cur += clazz + " ";
                            }
                        }
                        // only assign if different to avoid unneeded rendering.
                        finalValue = jQuery.trim(cur);
                        if (elem.className !== finalValue) {
                            elem.className = finalValue;
                        }
                    }
                }
            }
            return this;
        },
        removeClass: function(value) {
            var classes, elem, cur, clazz, j, finalValue, proceed = arguments.length === 0 || typeof value === "string" && value, i = 0, len = this.length;
            if (jQuery.isFunction(value)) {
                return this.each(function(j) {
                    jQuery(this).removeClass(value.call(this, j, this.className));
                });
            }
            if (proceed) {
                classes = (value || "").match(rnotwhite) || [];
                for(; i < len; i++){
                    elem = this[i];
                    // This expression is here for better compressibility (see addClass)
                    cur = elem.nodeType === 1 && (elem.className ? (" " + elem.className + " ").replace(rclass, " ") : "");
                    if (cur) {
                        j = 0;
                        while(clazz = classes[j++]){
                            // Remove *all* instances
                            while(cur.indexOf(" " + clazz + " ") >= 0){
                                cur = cur.replace(" " + clazz + " ", " ");
                            }
                        }
                        // only assign if different to avoid unneeded rendering.
                        finalValue = value ? jQuery.trim(cur) : "";
                        if (elem.className !== finalValue) {
                            elem.className = finalValue;
                        }
                    }
                }
            }
            return this;
        },
        toggleClass: function(value, stateVal) {
            var type = typeof value;
            if (typeof stateVal === "boolean" && type === "string") {
                return stateVal ? this.addClass(value) : this.removeClass(value);
            }
            if (jQuery.isFunction(value)) {
                return this.each(function(i) {
                    jQuery(this).toggleClass(value.call(this, i, this.className, stateVal), stateVal);
                });
            }
            return this.each(function() {
                if (type === "string") {
                    // toggle individual class names
                    var className, i = 0, self = jQuery(this), classNames = value.match(rnotwhite) || [];
                    while(className = classNames[i++]){
                        // check each className given, space separated list
                        if (self.hasClass(className)) {
                            self.removeClass(className);
                        } else {
                            self.addClass(className);
                        }
                    }
                // Toggle whole class name
                } else if (type === strundefined || type === "boolean") {
                    if (this.className) {
                        // store className if set
                        data_priv.set(this, "__className__", this.className);
                    }
                    // If the element has a class name or if we're passed "false",
                    // then remove the whole classname (if there was one, the above saved it).
                    // Otherwise bring back whatever was previously saved (if anything),
                    // falling back to the empty string if nothing was stored.
                    this.className = this.className || value === false ? "" : data_priv.get(this, "__className__") || "";
                }
            });
        },
        hasClass: function(selector) {
            var className = " " + selector + " ", i = 0, l = this.length;
            for(; i < l; i++){
                if (this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf(className) >= 0) {
                    return true;
                }
            }
            return false;
        }
    });
    var rreturn = /\r/g;
    jQuery.fn.extend({
        val: function(value) {
            var hooks, ret, isFunction, elem = this[0];
            if (!arguments.length) {
                if (elem) {
                    hooks = jQuery.valHooks[elem.type] || jQuery.valHooks[elem.nodeName.toLowerCase()];
                    if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== undefined) {
                        return ret;
                    }
                    ret = elem.value;
                    return typeof ret === "string" ? // handle most common string cases
                    ret.replace(rreturn, "") : // handle cases where value is null/undef or number
                    ret == null ? "" : ret;
                }
                return;
            }
            isFunction = jQuery.isFunction(value);
            return this.each(function(i) {
                var val;
                if (this.nodeType !== 1) {
                    return;
                }
                if (isFunction) {
                    val = value.call(this, i, jQuery(this).val());
                } else {
                    val = value;
                }
                // Treat null/undefined as ""; convert numbers to string
                if (val == null) {
                    val = "";
                } else if (typeof val === "number") {
                    val += "";
                } else if (jQuery.isArray(val)) {
                    val = jQuery.map(val, function(value) {
                        return value == null ? "" : value + "";
                    });
                }
                hooks = jQuery.valHooks[this.type] || jQuery.valHooks[this.nodeName.toLowerCase()];
                // If set returns undefined, fall back to normal setting
                if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === undefined) {
                    this.value = val;
                }
            });
        }
    });
    jQuery.extend({
        valHooks: {
            select: {
                get: function(elem) {
                    var value, option, options = elem.options, index = elem.selectedIndex, one = elem.type === "select-one" || index < 0, values = one ? null : [], max = one ? index + 1 : options.length, i = index < 0 ? max : one ? index : 0;
                    // Loop through all the selected options
                    for(; i < max; i++){
                        option = options[i];
                        // IE6-9 doesn't update selected after form reset (#2551)
                        if ((option.selected || i === index) && // Don't return options that are disabled or in a disabled optgroup
                        (support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) && (!option.parentNode.disabled || !jQuery.nodeName(option.parentNode, "optgroup"))) {
                            // Get the specific value for the option
                            value = jQuery(option).val();
                            // We don't need an array for one selects
                            if (one) {
                                return value;
                            }
                            // Multi-Selects return an array
                            values.push(value);
                        }
                    }
                    return values;
                },
                set: function(elem, value) {
                    var optionSet, option, options = elem.options, values = jQuery.makeArray(value), i = options.length;
                    while(i--){
                        option = options[i];
                        if (option.selected = jQuery.inArray(jQuery(option).val(), values) >= 0) {
                            optionSet = true;
                        }
                    }
                    // force browsers to behave consistently when non-matching value is set
                    if (!optionSet) {
                        elem.selectedIndex = -1;
                    }
                    return values;
                }
            }
        }
    });
    // Radios and checkboxes getter/setter
    jQuery.each([
        "radio",
        "checkbox"
    ], function() {
        jQuery.valHooks[this] = {
            set: function(elem, value) {
                if (jQuery.isArray(value)) {
                    return elem.checked = jQuery.inArray(jQuery(elem).val(), value) >= 0;
                }
            }
        };
        if (!support.checkOn) {
            jQuery.valHooks[this].get = function(elem) {
                // Support: Webkit
                // "" is returned instead of "on" if a value isn't specified
                return elem.getAttribute("value") === null ? "on" : elem.value;
            };
        }
    });
    // Return jQuery for attributes-only inclusion
    jQuery.each(("blur focus focusin focusout load resize scroll unload click dblclick " + "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " + "change select submit keydown keypress keyup error contextmenu").split(" "), function(i, name) {
        // Handle event binding
        jQuery.fn[name] = function(data, fn) {
            return arguments.length > 0 ? this.on(name, null, data, fn) : this.trigger(name);
        };
    });
    jQuery.fn.extend({
        hover: function(fnOver, fnOut) {
            return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
        },
        bind: function(types, data, fn) {
            return this.on(types, null, data, fn);
        },
        unbind: function(types, fn) {
            return this.off(types, null, fn);
        },
        delegate: function(selector, types, data, fn) {
            return this.on(types, selector, data, fn);
        },
        undelegate: function(selector, types, fn) {
            // ( namespace ) or ( selector, types [, fn] )
            return arguments.length === 1 ? this.off(selector, "**") : this.off(types, selector || "**", fn);
        }
    });
    var nonce = jQuery.now();
    var rquery = /\?/;
    // Support: Android 2.3
    // Workaround failure to string-cast null input
    jQuery.parseJSON = function(data) {
        return JSON.parse(data + "");
    };
    // Cross-browser xml parsing
    jQuery.parseXML = function(data) {
        var xml, tmp;
        if (!data || typeof data !== "string") {
            return null;
        }
        // Support: IE9
        try {
            tmp = new DOMParser();
            xml = tmp.parseFromString(data, "text/xml");
        } catch (e) {
            xml = undefined;
        }
        if (!xml || xml.getElementsByTagName("parsererror").length) {
            jQuery.error("Invalid XML: " + data);
        }
        return xml;
    };
    var // Document location
    ajaxLocParts, ajaxLocation, rhash = /#.*$/, rts = /([?&])_=[^&]*/, rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg, // #7653, #8125, #8152: local protocol detection
    rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/, rnoContent = /^(?:GET|HEAD)$/, rprotocol = /^\/\//, rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/, /* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */ prefilters = {}, /* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */ transports = {}, // Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
    allTypes = "*/".concat("*");
    // #8138, IE may throw an exception when accessing
    // a field from window.location if document.domain has been set
    try {
        ajaxLocation = location.href;
    } catch (e) {
        // Use the href attribute of an A element
        // since IE will modify it given document.location
        ajaxLocation = document.createElement("a");
        ajaxLocation.href = "";
        ajaxLocation = ajaxLocation.href;
    }
    // Segment location into parts
    ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [];
    // Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
    function addToPrefiltersOrTransports(structure) {
        // dataTypeExpression is optional and defaults to "*"
        return function(dataTypeExpression, func) {
            if (typeof dataTypeExpression !== "string") {
                func = dataTypeExpression;
                dataTypeExpression = "*";
            }
            var dataType, i = 0, dataTypes = dataTypeExpression.toLowerCase().match(rnotwhite) || [];
            if (jQuery.isFunction(func)) {
                // For each dataType in the dataTypeExpression
                while(dataType = dataTypes[i++]){
                    // Prepend if requested
                    if (dataType[0] === "+") {
                        dataType = dataType.slice(1) || "*";
                        (structure[dataType] = structure[dataType] || []).unshift(func);
                    // Otherwise append
                    } else {
                        (structure[dataType] = structure[dataType] || []).push(func);
                    }
                }
            }
        };
    }
    // Base inspection function for prefilters and transports
    function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {
        var inspected = {}, seekingTransport = structure === transports;
        function inspect(dataType) {
            var selected;
            inspected[dataType] = true;
            jQuery.each(structure[dataType] || [], function(_, prefilterOrFactory) {
                var dataTypeOrTransport = prefilterOrFactory(options, originalOptions, jqXHR);
                if (typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[dataTypeOrTransport]) {
                    options.dataTypes.unshift(dataTypeOrTransport);
                    inspect(dataTypeOrTransport);
                    return false;
                } else if (seekingTransport) {
                    return !(selected = dataTypeOrTransport);
                }
            });
            return selected;
        }
        return inspect(options.dataTypes[0]) || !inspected["*"] && inspect("*");
    }
    // A special extend for ajax options
    // that takes "flat" options (not to be deep extended)
    // Fixes #9887
    function ajaxExtend(target, src) {
        var key, deep, flatOptions = jQuery.ajaxSettings.flatOptions || {};
        for(key in src){
            if (src[key] !== undefined) {
                (flatOptions[key] ? target : deep || (deep = {}))[key] = src[key];
            }
        }
        if (deep) {
            jQuery.extend(true, target, deep);
        }
        return target;
    }
    /* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */ function ajaxHandleResponses(s, jqXHR, responses) {
        var ct, type, finalDataType, firstDataType, contents = s.contents, dataTypes = s.dataTypes;
        // Remove auto dataType and get content-type in the process
        while(dataTypes[0] === "*"){
            dataTypes.shift();
            if (ct === undefined) {
                ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
            }
        }
        // Check if we're dealing with a known content-type
        if (ct) {
            for(type in contents){
                if (contents[type] && contents[type].test(ct)) {
                    dataTypes.unshift(type);
                    break;
                }
            }
        }
        // Check to see if we have a response for the expected dataType
        if (dataTypes[0] in responses) {
            finalDataType = dataTypes[0];
        } else {
            // Try convertible dataTypes
            for(type in responses){
                if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
                    finalDataType = type;
                    break;
                }
                if (!firstDataType) {
                    firstDataType = type;
                }
            }
            // Or just use first one
            finalDataType = finalDataType || firstDataType;
        }
        // If we found a dataType
        // We add the dataType to the list if needed
        // and return the corresponding response
        if (finalDataType) {
            if (finalDataType !== dataTypes[0]) {
                dataTypes.unshift(finalDataType);
            }
            return responses[finalDataType];
        }
    }
    /* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */ function ajaxConvert(s, response, jqXHR, isSuccess) {
        var conv2, current, conv, tmp, prev, converters = {}, // Work with a copy of dataTypes in case we need to modify it for conversion
        dataTypes = s.dataTypes.slice();
        // Create converters map with lowercased keys
        if (dataTypes[1]) {
            for(conv in s.converters){
                converters[conv.toLowerCase()] = s.converters[conv];
            }
        }
        current = dataTypes.shift();
        // Convert to each sequential dataType
        while(current){
            if (s.responseFields[current]) {
                jqXHR[s.responseFields[current]] = response;
            }
            // Apply the dataFilter if provided
            if (!prev && isSuccess && s.dataFilter) {
                response = s.dataFilter(response, s.dataType);
            }
            prev = current;
            current = dataTypes.shift();
            if (current) {
                // There's only work to do if current dataType is non-auto
                if (current === "*") {
                    current = prev;
                // Convert response if prev dataType is non-auto and differs from current
                } else if (prev !== "*" && prev !== current) {
                    // Seek a direct converter
                    conv = converters[prev + " " + current] || converters["* " + current];
                    // If none found, seek a pair
                    if (!conv) {
                        for(conv2 in converters){
                            // If conv2 outputs current
                            tmp = conv2.split(" ");
                            if (tmp[1] === current) {
                                // If prev can be converted to accepted input
                                conv = converters[prev + " " + tmp[0]] || converters["* " + tmp[0]];
                                if (conv) {
                                    // Condense equivalence converters
                                    if (conv === true) {
                                        conv = converters[conv2];
                                    // Otherwise, insert the intermediate dataType
                                    } else if (converters[conv2] !== true) {
                                        current = tmp[0];
                                        dataTypes.unshift(tmp[1]);
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    // Apply converter (if not an equivalence)
                    if (conv !== true) {
                        // Unless errors are allowed to bubble, catch and return them
                        if (conv && s["throws"]) {
                            response = conv(response);
                        } else {
                            try {
                                response = conv(response);
                            } catch (e) {
                                return {
                                    state: "parsererror",
                                    error: conv ? e : "No conversion from " + prev + " to " + current
                                };
                            }
                        }
                    }
                }
            }
        }
        return {
            state: "success",
            data: response
        };
    }
    jQuery.extend({
        // Counter for holding the number of active queries
        active: 0,
        // Last-Modified header cache for next request
        lastModified: {},
        etag: {},
        ajaxSettings: {
            url: ajaxLocation,
            type: "GET",
            isLocal: rlocalProtocol.test(ajaxLocParts[1]),
            global: true,
            processData: true,
            async: true,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            /*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/ accepts: {
                "*": allTypes,
                text: "text/plain",
                html: "text/html",
                xml: "application/xml, text/xml",
                json: "application/json, text/javascript"
            },
            contents: {
                xml: /xml/,
                html: /html/,
                json: /json/
            },
            responseFields: {
                xml: "responseXML",
                text: "responseText",
                json: "responseJSON"
            },
            // Data converters
            // Keys separate source (or catchall "*") and destination types with a single space
            converters: {
                // Convert anything to text
                "* text": String,
                // Text to html (true = no transformation)
                "text html": true,
                // Evaluate text as a json expression
                "text json": jQuery.parseJSON,
                // Parse text as xml
                "text xml": jQuery.parseXML
            },
            // For options that shouldn't be deep extended:
            // you can add your own custom options here if
            // and when you create one that shouldn't be
            // deep extended (see ajaxExtend)
            flatOptions: {
                url: true,
                context: true
            }
        },
        // Creates a full fledged settings object into target
        // with both ajaxSettings and settings fields.
        // If target is omitted, writes into ajaxSettings.
        ajaxSetup: function(target, settings) {
            return settings ? // Building a settings object
            ajaxExtend(ajaxExtend(target, jQuery.ajaxSettings), settings) : // Extending ajaxSettings
            ajaxExtend(jQuery.ajaxSettings, target);
        },
        ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
        ajaxTransport: addToPrefiltersOrTransports(transports),
        // Main method
        ajax: function(url, options) {
            // If url is an object, simulate pre-1.5 signature
            if (typeof url === "object") {
                options = url;
                url = undefined;
            }
            // Force options to be an object
            options = options || {};
            var transport, // URL without anti-cache param
            cacheURL, // Response headers
            responseHeadersString, responseHeaders, // timeout handle
            timeoutTimer, // Cross-domain detection vars
            parts, // To know if global events are to be dispatched
            fireGlobals, // Loop variable
            i, // Create the final options object
            s = jQuery.ajaxSetup({}, options), // Callbacks context
            callbackContext = s.context || s, // Context for global events is callbackContext if it is a DOM node or jQuery collection
            globalEventContext = s.context && (callbackContext.nodeType || callbackContext.jquery) ? jQuery(callbackContext) : jQuery.event, // Deferreds
            deferred = jQuery.Deferred(), completeDeferred = jQuery.Callbacks("once memory"), // Status-dependent callbacks
            statusCode = s.statusCode || {}, // Headers (they are sent all at once)
            requestHeaders = {}, requestHeadersNames = {}, // The jqXHR state
            state = 0, // Default abort message
            strAbort = "canceled", // Fake xhr
            jqXHR = {
                readyState: 0,
                // Builds headers hashtable if needed
                getResponseHeader: function(key) {
                    var match;
                    if (state === 2) {
                        if (!responseHeaders) {
                            responseHeaders = {};
                            while(match = rheaders.exec(responseHeadersString)){
                                responseHeaders[match[1].toLowerCase()] = match[2];
                            }
                        }
                        match = responseHeaders[key.toLowerCase()];
                    }
                    return match == null ? null : match;
                },
                // Raw string
                getAllResponseHeaders: function() {
                    return state === 2 ? responseHeadersString : null;
                },
                // Caches the header
                setRequestHeader: function(name, value) {
                    var lname = name.toLowerCase();
                    if (!state) {
                        name = requestHeadersNames[lname] = requestHeadersNames[lname] || name;
                        requestHeaders[name] = value;
                    }
                    return this;
                },
                // Overrides response content-type header
                overrideMimeType: function(type) {
                    if (!state) {
                        s.mimeType = type;
                    }
                    return this;
                },
                // Status-dependent callbacks
                statusCode: function(map) {
                    var code;
                    if (map) {
                        if (state < 2) {
                            for(code in map){
                                // Lazy-add the new callback in a way that preserves old ones
                                statusCode[code] = [
                                    statusCode[code],
                                    map[code]
                                ];
                            }
                        } else {
                            // Execute the appropriate callbacks
                            jqXHR.always(map[jqXHR.status]);
                        }
                    }
                    return this;
                },
                // Cancel the request
                abort: function(statusText) {
                    var finalText = statusText || strAbort;
                    if (transport) {
                        transport.abort(finalText);
                    }
                    done(0, finalText);
                    return this;
                }
            };
            // Attach deferreds
            deferred.promise(jqXHR).complete = completeDeferred.add;
            jqXHR.success = jqXHR.done;
            jqXHR.error = jqXHR.fail;
            // Remove hash character (#7531: and string promotion)
            // Add protocol if not provided (prefilters might expect it)
            // Handle falsy url in the settings object (#10093: consistency with old signature)
            // We also use the url parameter if available
            s.url = ((url || s.url || ajaxLocation) + "").replace(rhash, "").replace(rprotocol, ajaxLocParts[1] + "//");
            // Alias method option to type as per ticket #12004
            s.type = options.method || options.type || s.method || s.type;
            // Extract dataTypes list
            s.dataTypes = jQuery.trim(s.dataType || "*").toLowerCase().match(rnotwhite) || [
                ""
            ];
            // A cross-domain request is in order when we have a protocol:host:port mismatch
            if (s.crossDomain == null) {
                parts = rurl.exec(s.url.toLowerCase());
                s.crossDomain = !!(parts && (parts[1] !== ajaxLocParts[1] || parts[2] !== ajaxLocParts[2] || (parts[3] || (parts[1] === "http:" ? "80" : "443")) !== (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? "80" : "443"))));
            }
            // Convert data if not already a string
            if (s.data && s.processData && typeof s.data !== "string") {
                s.data = jQuery.param(s.data, s.traditional);
            }
            // Apply prefilters
            inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);
            // If request was aborted inside a prefilter, stop there
            if (state === 2) {
                return jqXHR;
            }
            // We can fire global events as of now if asked to
            fireGlobals = s.global;
            // Watch for a new set of requests
            if (fireGlobals && jQuery.active++ === 0) {
                jQuery.event.trigger("ajaxStart");
            }
            // Uppercase the type
            s.type = s.type.toUpperCase();
            // Determine if request has content
            s.hasContent = !rnoContent.test(s.type);
            // Save the URL in case we're toying with the If-Modified-Since
            // and/or If-None-Match header later on
            cacheURL = s.url;
            // More options handling for requests with no content
            if (!s.hasContent) {
                // If data is available, append data to url
                if (s.data) {
                    cacheURL = s.url += (rquery.test(cacheURL) ? "&" : "?") + s.data;
                    // #9682: remove data so that it's not used in an eventual retry
                    delete s.data;
                }
                // Add anti-cache in url if needed
                if (s.cache === false) {
                    s.url = rts.test(cacheURL) ? // If there is already a '_' parameter, set its value
                    cacheURL.replace(rts, "$1_=" + nonce++) : // Otherwise add one to the end
                    cacheURL + (rquery.test(cacheURL) ? "&" : "?") + "_=" + nonce++;
                }
            }
            // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
            if (s.ifModified) {
                if (jQuery.lastModified[cacheURL]) {
                    jqXHR.setRequestHeader("If-Modified-Since", jQuery.lastModified[cacheURL]);
                }
                if (jQuery.etag[cacheURL]) {
                    jqXHR.setRequestHeader("If-None-Match", jQuery.etag[cacheURL]);
                }
            }
            // Set the correct header, if data is being sent
            if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
                jqXHR.setRequestHeader("Content-Type", s.contentType);
            }
            // Set the Accepts header for the server, depending on the dataType
            jqXHR.setRequestHeader("Accept", s.dataTypes[0] && s.accepts[s.dataTypes[0]] ? s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") : s.accepts["*"]);
            // Check for headers option
            for(i in s.headers){
                jqXHR.setRequestHeader(i, s.headers[i]);
            }
            // Allow custom headers/mimetypes and early abort
            if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || state === 2)) {
                // Abort if not done already and return
                return jqXHR.abort();
            }
            // aborting is no longer a cancellation
            strAbort = "abort";
            // Install callbacks on deferreds
            for(i in {
                success: 1,
                error: 1,
                complete: 1
            }){
                jqXHR[i](s[i]);
            }
            // Get transport
            transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);
            // If no transport, we auto-abort
            if (!transport) {
                done(-1, "No Transport");
            } else {
                jqXHR.readyState = 1;
                // Send global event
                if (fireGlobals) {
                    globalEventContext.trigger("ajaxSend", [
                        jqXHR,
                        s
                    ]);
                }
                // Timeout
                if (s.async && s.timeout > 0) {
                    timeoutTimer = setTimeout(function() {
                        jqXHR.abort("timeout");
                    }, s.timeout);
                }
                try {
                    state = 1;
                    transport.send(requestHeaders, done);
                } catch (e) {
                    // Propagate exception as error if not done
                    if (state < 2) {
                        done(-1, e);
                    // Simply rethrow otherwise
                    } else {
                        throw e;
                    }
                }
            }
            // Callback for when everything is done
            function done(status, nativeStatusText, responses, headers) {
                var isSuccess, success, error, response, modified, statusText = nativeStatusText;
                // Called once
                if (state === 2) {
                    return;
                }
                // State is "done" now
                state = 2;
                // Clear timeout if it exists
                if (timeoutTimer) {
                    clearTimeout(timeoutTimer);
                }
                // Dereference transport for early garbage collection
                // (no matter how long the jqXHR object will be used)
                transport = undefined;
                // Cache response headers
                responseHeadersString = headers || "";
                // Set readyState
                jqXHR.readyState = status > 0 ? 4 : 0;
                // Determine if successful
                isSuccess = status >= 200 && status < 300 || status === 304;
                // Get response data
                if (responses) {
                    response = ajaxHandleResponses(s, jqXHR, responses);
                }
                // Convert no matter what (that way responseXXX fields are always set)
                response = ajaxConvert(s, response, jqXHR, isSuccess);
                // If successful, handle type chaining
                if (isSuccess) {
                    // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
                    if (s.ifModified) {
                        modified = jqXHR.getResponseHeader("Last-Modified");
                        if (modified) {
                            jQuery.lastModified[cacheURL] = modified;
                        }
                        modified = jqXHR.getResponseHeader("etag");
                        if (modified) {
                            jQuery.etag[cacheURL] = modified;
                        }
                    }
                    // if no content
                    if (status === 204 || s.type === "HEAD") {
                        statusText = "nocontent";
                    // if not modified
                    } else if (status === 304) {
                        statusText = "notmodified";
                    // If we have data, let's convert it
                    } else {
                        statusText = response.state;
                        success = response.data;
                        error = response.error;
                        isSuccess = !error;
                    }
                } else {
                    // We extract error from statusText
                    // then normalize statusText and status for non-aborts
                    error = statusText;
                    if (status || !statusText) {
                        statusText = "error";
                        if (status < 0) {
                            status = 0;
                        }
                    }
                }
                // Set data for the fake xhr object
                jqXHR.status = status;
                jqXHR.statusText = (nativeStatusText || statusText) + "";
                // Success/Error
                if (isSuccess) {
                    deferred.resolveWith(callbackContext, [
                        success,
                        statusText,
                        jqXHR
                    ]);
                } else {
                    deferred.rejectWith(callbackContext, [
                        jqXHR,
                        statusText,
                        error
                    ]);
                }
                // Status-dependent callbacks
                jqXHR.statusCode(statusCode);
                statusCode = undefined;
                if (fireGlobals) {
                    globalEventContext.trigger(isSuccess ? "ajaxSuccess" : "ajaxError", [
                        jqXHR,
                        s,
                        isSuccess ? success : error
                    ]);
                }
                // Complete
                completeDeferred.fireWith(callbackContext, [
                    jqXHR,
                    statusText
                ]);
                if (fireGlobals) {
                    globalEventContext.trigger("ajaxComplete", [
                        jqXHR,
                        s
                    ]);
                    // Handle the global AJAX counter
                    if (!--jQuery.active) {
                        jQuery.event.trigger("ajaxStop");
                    }
                }
            }
            return jqXHR;
        },
        getJSON: function(url, data, callback) {
            return jQuery.get(url, data, callback, "json");
        },
        getScript: function(url, callback) {
            return jQuery.get(url, undefined, callback, "script");
        }
    });
    jQuery.each([
        "get",
        "post"
    ], function(i, method) {
        jQuery[method] = function(url, data, callback, type) {
            // shift arguments if data argument was omitted
            if (jQuery.isFunction(data)) {
                type = type || callback;
                callback = data;
                data = undefined;
            }
            return jQuery.ajax({
                url: url,
                type: method,
                dataType: type,
                data: data,
                success: callback
            });
        };
    });
    // Attach a bunch of functions for handling common AJAX events
    jQuery.each([
        "ajaxStart",
        "ajaxStop",
        "ajaxComplete",
        "ajaxError",
        "ajaxSuccess",
        "ajaxSend"
    ], function(i, type) {
        jQuery.fn[type] = function(fn) {
            return this.on(type, fn);
        };
    });
    jQuery._evalUrl = function(url) {
        return jQuery.ajax({
            url: url,
            type: "GET",
            dataType: "script",
            async: false,
            global: false,
            "throws": true
        });
    };
    jQuery.fn.extend({
        wrapAll: function(html) {
            var wrap;
            if (jQuery.isFunction(html)) {
                return this.each(function(i) {
                    jQuery(this).wrapAll(html.call(this, i));
                });
            }
            if (this[0]) {
                // The elements to wrap the target around
                wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);
                if (this[0].parentNode) {
                    wrap.insertBefore(this[0]);
                }
                wrap.map(function() {
                    var elem = this;
                    while(elem.firstElementChild){
                        elem = elem.firstElementChild;
                    }
                    return elem;
                }).append(this);
            }
            return this;
        },
        wrapInner: function(html) {
            if (jQuery.isFunction(html)) {
                return this.each(function(i) {
                    jQuery(this).wrapInner(html.call(this, i));
                });
            }
            return this.each(function() {
                var self = jQuery(this), contents = self.contents();
                if (contents.length) {
                    contents.wrapAll(html);
                } else {
                    self.append(html);
                }
            });
        },
        wrap: function(html) {
            var isFunction = jQuery.isFunction(html);
            return this.each(function(i) {
                jQuery(this).wrapAll(isFunction ? html.call(this, i) : html);
            });
        },
        unwrap: function() {
            return this.parent().each(function() {
                if (!jQuery.nodeName(this, "body")) {
                    jQuery(this).replaceWith(this.childNodes);
                }
            }).end();
        }
    });
    jQuery.expr.filters.hidden = function(elem) {
        // Support: Opera <= 12.12
        // Opera reports offsetWidths and offsetHeights less than zero on some elements
        return elem.offsetWidth <= 0 && elem.offsetHeight <= 0;
    };
    jQuery.expr.filters.visible = function(elem) {
        return !jQuery.expr.filters.hidden(elem);
    };
    var r20 = /%20/g, rbracket = /\[\]$/, rCRLF = /\r?\n/g, rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i, rsubmittable = /^(?:input|select|textarea|keygen)/i;
    function buildParams(prefix, obj, traditional, add) {
        var name;
        if (jQuery.isArray(obj)) {
            // Serialize array item.
            jQuery.each(obj, function(i, v) {
                if (traditional || rbracket.test(prefix)) {
                    // Treat each array item as a scalar.
                    add(prefix, v);
                } else {
                    // Item is non-scalar (array or object), encode its numeric index.
                    buildParams(prefix + "[" + (typeof v === "object" ? i : "") + "]", v, traditional, add);
                }
            });
        } else if (!traditional && jQuery.type(obj) === "object") {
            // Serialize object item.
            for(name in obj){
                buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
            }
        } else {
            // Serialize scalar item.
            add(prefix, obj);
        }
    }
    // Serialize an array of form elements or a set of
    // key/values into a query string
    jQuery.param = function(a, traditional) {
        var prefix, s = [], add = function(key, value) {
            // If value is a function, invoke it and return its value
            value = jQuery.isFunction(value) ? value() : value == null ? "" : value;
            s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
        };
        // Set traditional to true for jQuery <= 1.3.2 behavior.
        if (traditional === undefined) {
            traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
        }
        // If an array was passed in, assume that it is an array of form elements.
        if (jQuery.isArray(a) || a.jquery && !jQuery.isPlainObject(a)) {
            // Serialize the form elements
            jQuery.each(a, function() {
                add(this.name, this.value);
            });
        } else {
            // If traditional, encode the "old" way (the way 1.3.2 or older
            // did it), otherwise encode params recursively.
            for(prefix in a){
                buildParams(prefix, a[prefix], traditional, add);
            }
        }
        // Return the resulting serialization
        return s.join("&").replace(r20, "+");
    };
    jQuery.fn.extend({
        serialize: function() {
            return jQuery.param(this.serializeArray());
        },
        serializeArray: function() {
            return this.map(function() {
                // Can add propHook for "elements" to filter or add form elements
                var elements = jQuery.prop(this, "elements");
                return elements ? jQuery.makeArray(elements) : this;
            }).filter(function() {
                var type = this.type;
                // Use .is( ":disabled" ) so that fieldset[disabled] works
                return this.name && !jQuery(this).is(":disabled") && rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) && (this.checked || !rcheckableType.test(type));
            }).map(function(i, elem) {
                var val = jQuery(this).val();
                return val == null ? null : jQuery.isArray(val) ? jQuery.map(val, function(val) {
                    return {
                        name: elem.name,
                        value: val.replace(rCRLF, "\r\n")
                    };
                }) : {
                    name: elem.name,
                    value: val.replace(rCRLF, "\r\n")
                };
            }).get();
        }
    });
    jQuery.ajaxSettings.xhr = function() {
        try {
            return new XMLHttpRequest();
        } catch (e) {}
    };
    var xhrId = 0, xhrCallbacks = {}, xhrSuccessStatus = {
        // file protocol always yields status code 0, assume 200
        0: 200,
        // Support: IE9
        // #1450: sometimes IE returns 1223 when it should be 204
        1223: 204
    }, xhrSupported = jQuery.ajaxSettings.xhr();
    // Support: IE9
    // Open requests must be manually aborted on unload (#5280)
    if (window1.ActiveXObject) {
        jQuery(window1).on("unload", function() {
            for(var key in xhrCallbacks){
                xhrCallbacks[key]();
            }
        });
    }
    support.cors = !!xhrSupported && "withCredentials" in xhrSupported;
    support.ajax = xhrSupported = !!xhrSupported;
    jQuery.ajaxTransport(function(options) {
        var callback;
        // Cross domain only allowed if supported through XMLHttpRequest
        if (support.cors || xhrSupported && !options.crossDomain) {
            return {
                send: function(headers, complete) {
                    var i, xhr = options.xhr(), id = ++xhrId;
                    xhr.open(options.type, options.url, options.async, options.username, options.password);
                    // Apply custom fields if provided
                    if (options.xhrFields) {
                        for(i in options.xhrFields){
                            xhr[i] = options.xhrFields[i];
                        }
                    }
                    // Override mime type if needed
                    if (options.mimeType && xhr.overrideMimeType) {
                        xhr.overrideMimeType(options.mimeType);
                    }
                    // X-Requested-With header
                    // For cross-domain requests, seeing as conditions for a preflight are
                    // akin to a jigsaw puzzle, we simply never set it to be sure.
                    // (it can always be set on a per-request basis or even using ajaxSetup)
                    // For same-domain requests, won't change header if already provided.
                    if (!options.crossDomain && !headers["X-Requested-With"]) {
                        headers["X-Requested-With"] = "XMLHttpRequest";
                    }
                    // Set headers
                    for(i in headers){
                        xhr.setRequestHeader(i, headers[i]);
                    }
                    // Callback
                    callback = function(type) {
                        return function() {
                            if (callback) {
                                delete xhrCallbacks[id];
                                callback = xhr.onload = xhr.onerror = null;
                                if (type === "abort") {
                                    xhr.abort();
                                } else if (type === "error") {
                                    complete(// file: protocol always yields status 0; see #8605, #14207
                                    xhr.status, xhr.statusText);
                                } else {
                                    complete(xhrSuccessStatus[xhr.status] || xhr.status, xhr.statusText, // Support: IE9
                                    // Accessing binary-data responseText throws an exception
                                    // (#11426)
                                    typeof xhr.responseText === "string" ? {
                                        text: xhr.responseText
                                    } : undefined, xhr.getAllResponseHeaders());
                                }
                            }
                        };
                    };
                    // Listen to events
                    xhr.onload = callback();
                    xhr.onerror = callback("error");
                    // Create the abort callback
                    callback = xhrCallbacks[id] = callback("abort");
                    // Do send the request
                    // This may raise an exception which is actually
                    // handled in jQuery.ajax (so no try/catch here)
                    xhr.send(options.hasContent && options.data || null);
                },
                abort: function() {
                    if (callback) {
                        callback();
                    }
                }
            };
        }
    });
    // Install script dataType
    jQuery.ajaxSetup({
        accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },
        contents: {
            script: /(?:java|ecma)script/
        },
        converters: {
            "text script": function(text) {
                jQuery.globalEval(text);
                return text;
            }
        }
    });
    // Handle cache's special case and crossDomain
    jQuery.ajaxPrefilter("script", function(s) {
        if (s.cache === undefined) {
            s.cache = false;
        }
        if (s.crossDomain) {
            s.type = "GET";
        }
    });
    // Bind script tag hack transport
    jQuery.ajaxTransport("script", function(s) {
        // This transport only deals with cross domain requests
        if (s.crossDomain) {
            var script, callback;
            return {
                send: function(_, complete) {
                    script = jQuery("<script>").prop({
                        async: true,
                        charset: s.scriptCharset,
                        src: s.url
                    }).on("load error", callback = function(evt) {
                        script.remove();
                        callback = null;
                        if (evt) {
                            complete(evt.type === "error" ? 404 : 200, evt.type);
                        }
                    });
                    document.head.appendChild(script[0]);
                },
                abort: function() {
                    if (callback) {
                        callback();
                    }
                }
            };
        }
    });
    var oldCallbacks = [], rjsonp = /(=)\?(?=&|$)|\?\?/;
    // Default jsonp settings
    jQuery.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function() {
            var callback = oldCallbacks.pop() || jQuery.expando + "_" + nonce++;
            this[callback] = true;
            return callback;
        }
    });
    // Detect, normalize options and install callbacks for jsonp requests
    jQuery.ajaxPrefilter("json jsonp", function(s, originalSettings, jqXHR) {
        var callbackName, overwritten, responseContainer, jsonProp = s.jsonp !== false && (rjsonp.test(s.url) ? "url" : typeof s.data === "string" && !(s.contentType || "").indexOf("application/x-www-form-urlencoded") && rjsonp.test(s.data) && "data");
        // Handle iff the expected data type is "jsonp" or we have a parameter to set
        if (jsonProp || s.dataTypes[0] === "jsonp") {
            // Get callback name, remembering preexisting value associated with it
            callbackName = s.jsonpCallback = jQuery.isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback;
            // Insert callback into url or form data
            if (jsonProp) {
                s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName);
            } else if (s.jsonp !== false) {
                s.url += (rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName;
            }
            // Use data converter to retrieve json after script execution
            s.converters["script json"] = function() {
                if (!responseContainer) {
                    jQuery.error(callbackName + " was not called");
                }
                return responseContainer[0];
            };
            // force json dataType
            s.dataTypes[0] = "json";
            // Install callback
            overwritten = window1[callbackName];
            window1[callbackName] = function() {
                responseContainer = arguments;
            };
            // Clean-up function (fires after converters)
            jqXHR.always(function() {
                // Restore preexisting value
                window1[callbackName] = overwritten;
                // Save back as free
                if (s[callbackName]) {
                    // make sure that re-using the options doesn't screw things around
                    s.jsonpCallback = originalSettings.jsonpCallback;
                    // save the callback name for future use
                    oldCallbacks.push(callbackName);
                }
                // Call if it was a function and we have a response
                if (responseContainer && jQuery.isFunction(overwritten)) {
                    overwritten(responseContainer[0]);
                }
                responseContainer = overwritten = undefined;
            });
            // Delegate to script
            return "script";
        }
    });
    // data: string of html
    // context (optional): If specified, the fragment will be created in this context, defaults to document
    // keepScripts (optional): If true, will include scripts passed in the html string
    jQuery.parseHTML = function(data, context, keepScripts) {
        if (!data || typeof data !== "string") {
            return null;
        }
        if (typeof context === "boolean") {
            keepScripts = context;
            context = false;
        }
        context = context || document;
        var parsed = rsingleTag.exec(data), scripts = !keepScripts && [];
        // Single tag
        if (parsed) {
            return [
                context.createElement(parsed[1])
            ];
        }
        parsed = jQuery.buildFragment([
            data
        ], context, scripts);
        if (scripts && scripts.length) {
            jQuery(scripts).remove();
        }
        return jQuery.merge([], parsed.childNodes);
    };
    // Keep a copy of the old load method
    var _load = jQuery.fn.load;
    /**
 * Load a url into a page
 */ jQuery.fn.load = function(url, params, callback) {
        if (typeof url !== "string" && _load) {
            return _load.apply(this, arguments);
        }
        var selector, type, response, self = this, off = url.indexOf(" ");
        if (off >= 0) {
            selector = url.slice(off);
            url = url.slice(0, off);
        }
        // If it's a function
        if (jQuery.isFunction(params)) {
            // We assume that it's the callback
            callback = params;
            params = undefined;
        // Otherwise, build a param string
        } else if (params && typeof params === "object") {
            type = "POST";
        }
        // If we have elements to modify, make the request
        if (self.length > 0) {
            jQuery.ajax({
                url: url,
                // if "type" variable is undefined, then "GET" method will be used
                type: type,
                dataType: "html",
                data: params
            }).done(function(responseText) {
                // Save response for use in complete callback
                response = arguments;
                self.html(selector ? // If a selector was specified, locate the right elements in a dummy div
                // Exclude scripts to avoid IE 'Permission Denied' errors
                jQuery("<div>").append(jQuery.parseHTML(responseText)).find(selector) : // Otherwise use the full result
                responseText);
            }).complete(callback && function(jqXHR, status) {
                self.each(callback, response || [
                    jqXHR.responseText,
                    status,
                    jqXHR
                ]);
            });
        }
        return this;
    };
    jQuery.expr.filters.animated = function(elem) {
        return jQuery.grep(jQuery.timers, function(fn) {
            return elem === fn.elem;
        }).length;
    };
    var docElem = window1.document.documentElement;
    /**
 * Gets a window from an element
 */ function getWindow(elem) {
        return jQuery.isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
    }
    jQuery.offset = {
        setOffset: function(elem, options, i) {
            var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition, position = jQuery.css(elem, "position"), curElem = jQuery(elem), props = {};
            // Set position first, in-case top/left are set even on static elem
            if (position === "static") {
                elem.style.position = "relative";
            }
            curOffset = curElem.offset();
            curCSSTop = jQuery.css(elem, "top");
            curCSSLeft = jQuery.css(elem, "left");
            calculatePosition = (position === "absolute" || position === "fixed") && (curCSSTop + curCSSLeft).indexOf("auto") > -1;
            // Need to be able to calculate position if either top or left is auto and position is either absolute or fixed
            if (calculatePosition) {
                curPosition = curElem.position();
                curTop = curPosition.top;
                curLeft = curPosition.left;
            } else {
                curTop = parseFloat(curCSSTop) || 0;
                curLeft = parseFloat(curCSSLeft) || 0;
            }
            if (jQuery.isFunction(options)) {
                options = options.call(elem, i, curOffset);
            }
            if (options.top != null) {
                props.top = options.top - curOffset.top + curTop;
            }
            if (options.left != null) {
                props.left = options.left - curOffset.left + curLeft;
            }
            if ("using" in options) {
                options.using.call(elem, props);
            } else {
                curElem.css(props);
            }
        }
    };
    jQuery.fn.extend({
        offset: function(options) {
            if (arguments.length) {
                return options === undefined ? this : this.each(function(i) {
                    jQuery.offset.setOffset(this, options, i);
                });
            }
            var docElem, win, elem = this[0], box = {
                top: 0,
                left: 0
            }, doc = elem && elem.ownerDocument;
            if (!doc) {
                return;
            }
            docElem = doc.documentElement;
            // Make sure it's not a disconnected DOM node
            if (!jQuery.contains(docElem, elem)) {
                return box;
            }
            // If we don't have gBCR, just use 0,0 rather than error
            // BlackBerry 5, iOS 3 (original iPhone)
            if (typeof elem.getBoundingClientRect !== strundefined) {
                box = elem.getBoundingClientRect();
            }
            win = getWindow(doc);
            return {
                top: box.top + win.pageYOffset - docElem.clientTop,
                left: box.left + win.pageXOffset - docElem.clientLeft
            };
        },
        position: function() {
            if (!this[0]) {
                return;
            }
            var offsetParent, offset, elem = this[0], parentOffset = {
                top: 0,
                left: 0
            };
            // Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is its only offset parent
            if (jQuery.css(elem, "position") === "fixed") {
                // We assume that getBoundingClientRect is available when computed position is fixed
                offset = elem.getBoundingClientRect();
            } else {
                // Get *real* offsetParent
                offsetParent = this.offsetParent();
                // Get correct offsets
                offset = this.offset();
                if (!jQuery.nodeName(offsetParent[0], "html")) {
                    parentOffset = offsetParent.offset();
                }
                // Add offsetParent borders
                parentOffset.top += jQuery.css(offsetParent[0], "borderTopWidth", true);
                parentOffset.left += jQuery.css(offsetParent[0], "borderLeftWidth", true);
            }
            // Subtract parent offsets and element margins
            return {
                top: offset.top - parentOffset.top - jQuery.css(elem, "marginTop", true),
                left: offset.left - parentOffset.left - jQuery.css(elem, "marginLeft", true)
            };
        },
        offsetParent: function() {
            return this.map(function() {
                var offsetParent = this.offsetParent || docElem;
                while(offsetParent && !jQuery.nodeName(offsetParent, "html") && jQuery.css(offsetParent, "position") === "static"){
                    offsetParent = offsetParent.offsetParent;
                }
                return offsetParent || docElem;
            });
        }
    });
    // Create scrollLeft and scrollTop methods
    jQuery.each({
        scrollLeft: "pageXOffset",
        scrollTop: "pageYOffset"
    }, function(method, prop) {
        var top = "pageYOffset" === prop;
        jQuery.fn[method] = function(val) {
            return access(this, function(elem, method, val) {
                var win = getWindow(elem);
                if (val === undefined) {
                    return win ? win[prop] : elem[method];
                }
                if (win) {
                    win.scrollTo(!top ? val : window1.pageXOffset, top ? val : window1.pageYOffset);
                } else {
                    elem[method] = val;
                }
            }, method, val, arguments.length, null);
        };
    });
    // Add the top/left cssHooks using jQuery.fn.position
    // Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
    // getComputedStyle returns percent when specified for top/left/bottom/right
    // rather than make the css module depend on the offset module, we just check for it here
    jQuery.each([
        "top",
        "left"
    ], function(i, prop) {
        jQuery.cssHooks[prop] = addGetHookIf(support.pixelPosition, function(elem, computed) {
            if (computed) {
                computed = curCSS(elem, prop);
                // if curCSS returns percentage, fallback to offset
                return rnumnonpx.test(computed) ? jQuery(elem).position()[prop] + "px" : computed;
            }
        });
    });
    // Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
    jQuery.each({
        Height: "height",
        Width: "width"
    }, function(name, type) {
        jQuery.each({
            padding: "inner" + name,
            content: type,
            "": "outer" + name
        }, function(defaultExtra, funcName) {
            // margin is only for outerHeight, outerWidth
            jQuery.fn[funcName] = function(margin, value) {
                var chainable = arguments.length && (defaultExtra || typeof margin !== "boolean"), extra = defaultExtra || (margin === true || value === true ? "margin" : "border");
                return access(this, function(elem, type, value) {
                    var doc;
                    if (jQuery.isWindow(elem)) {
                        // As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
                        // isn't a whole lot we can do. See pull request at this URL for discussion:
                        // https://github.com/jquery/jquery/pull/764
                        return elem.document.documentElement["client" + name];
                    }
                    // Get document width or height
                    if (elem.nodeType === 9) {
                        doc = elem.documentElement;
                        // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
                        // whichever is greatest
                        return Math.max(elem.body["scroll" + name], doc["scroll" + name], elem.body["offset" + name], doc["offset" + name], doc["client" + name]);
                    }
                    return value === undefined ? // Get width or height on the element, requesting but not forcing parseFloat
                    jQuery.css(elem, type, extra) : // Set width or height on the element
                    jQuery.style(elem, type, value, extra);
                }, type, chainable ? margin : undefined, chainable, null);
            };
        });
    });
    // The number of elements contained in the matched element set
    jQuery.fn.size = function() {
        return this.length;
    };
    jQuery.fn.andSelf = jQuery.fn.addBack;
    // Register as a named AMD module, since jQuery can be concatenated with other
    // files that may use define, but not via a proper concatenation script that
    // understands anonymous AMD modules. A named AMD is safest and most robust
    // way to register. Lowercase jquery is used because AMD module names are
    // derived from file names, and jQuery is normally delivered in a lowercase
    // file name. Do this after creating the global so that if an AMD module wants
    // to call noConflict to hide this version of jQuery, it will work.
    if (typeof define === "function" && define.amd) {
        define("jquery", [], function() {
            return jQuery;
        });
    }
    var // Map over jQuery in case of overwrite
    _jQuery = window1.jQuery, // Map over the $ in case of overwrite
    _$ = window1.$;
    jQuery.noConflict = function(deep) {
        if (window1.$ === jQuery) {
            window1.$ = _$;
        }
        if (deep && window1.jQuery === jQuery) {
            window1.jQuery = _jQuery;
        }
        return jQuery;
    };
    // Expose jQuery and $ identifiers, even in
    // AMD (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
    // and CommonJS for browser emulators (#13566)
    if (typeof noGlobal === strundefined) {
        window1.jQuery = window1.$ = jQuery;
    }
    return jQuery;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvanF1ZXJ5LTIuMS4wLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICogalF1ZXJ5IEphdmFTY3JpcHQgTGlicmFyeSB2Mi4xLjBcbiAqIGh0dHA6Ly9qcXVlcnkuY29tL1xuICpcbiAqIEluY2x1ZGVzIFNpenpsZS5qc1xuICogaHR0cDovL3NpenpsZWpzLmNvbS9cbiAqXG4gKiBDb3B5cmlnaHQgMjAwNSwgMjAxNCBqUXVlcnkgRm91bmRhdGlvbiwgSW5jLiBhbmQgb3RoZXIgY29udHJpYnV0b3JzXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqIGh0dHA6Ly9qcXVlcnkub3JnL2xpY2Vuc2VcbiAqXG4gKiBEYXRlOiAyMDE0LTAxLTIzVDIxOjEwWlxuICovXG5cbihmdW5jdGlvbiggZ2xvYmFsLCBmYWN0b3J5ICkge1xuXG5cdGlmICggdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIgKSB7XG5cdFx0Ly8gRm9yIENvbW1vbkpTIGFuZCBDb21tb25KUy1saWtlIGVudmlyb25tZW50cyB3aGVyZSBhIHByb3BlciB3aW5kb3cgaXMgcHJlc2VudCxcblx0XHQvLyBleGVjdXRlIHRoZSBmYWN0b3J5IGFuZCBnZXQgalF1ZXJ5XG5cdFx0Ly8gRm9yIGVudmlyb25tZW50cyB0aGF0IGRvIG5vdCBpbmhlcmVudGx5IHBvc3NlcyBhIHdpbmRvdyB3aXRoIGEgZG9jdW1lbnRcblx0XHQvLyAoc3VjaCBhcyBOb2RlLmpzKSwgZXhwb3NlIGEgalF1ZXJ5LW1ha2luZyBmYWN0b3J5IGFzIG1vZHVsZS5leHBvcnRzXG5cdFx0Ly8gVGhpcyBhY2NlbnR1YXRlcyB0aGUgbmVlZCBmb3IgdGhlIGNyZWF0aW9uIG9mIGEgcmVhbCB3aW5kb3dcblx0XHQvLyBlLmcuIHZhciBqUXVlcnkgPSByZXF1aXJlKFwianF1ZXJ5XCIpKHdpbmRvdyk7XG5cdFx0Ly8gU2VlIHRpY2tldCAjMTQ1NDkgZm9yIG1vcmUgaW5mb1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZ2xvYmFsLmRvY3VtZW50ID9cblx0XHRcdGZhY3RvcnkoIGdsb2JhbCwgdHJ1ZSApIDpcblx0XHRcdGZ1bmN0aW9uKCB3ICkge1xuXHRcdFx0XHRpZiAoICF3LmRvY3VtZW50ICkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvciggXCJqUXVlcnkgcmVxdWlyZXMgYSB3aW5kb3cgd2l0aCBhIGRvY3VtZW50XCIgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gZmFjdG9yeSggdyApO1xuXHRcdFx0fTtcblx0fSBlbHNlIHtcblx0XHRmYWN0b3J5KCBnbG9iYWwgKTtcblx0fVxuXG4vLyBQYXNzIHRoaXMgaWYgd2luZG93IGlzIG5vdCBkZWZpbmVkIHlldFxufSh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDogdGhpcywgZnVuY3Rpb24oIHdpbmRvdywgbm9HbG9iYWwgKSB7XG5cbi8vIENhbid0IGRvIHRoaXMgYmVjYXVzZSBzZXZlcmFsIGFwcHMgaW5jbHVkaW5nIEFTUC5ORVQgdHJhY2Vcbi8vIHRoZSBzdGFjayB2aWEgYXJndW1lbnRzLmNhbGxlci5jYWxsZWUgYW5kIEZpcmVmb3ggZGllcyBpZlxuLy8geW91IHRyeSB0byB0cmFjZSB0aHJvdWdoIFwidXNlIHN0cmljdFwiIGNhbGwgY2hhaW5zLiAoIzEzMzM1KVxuLy8gU3VwcG9ydDogRmlyZWZveCAxOCtcbi8vXG5cbnZhciBhcnIgPSBbXTtcblxudmFyIHNsaWNlID0gYXJyLnNsaWNlO1xuXG52YXIgY29uY2F0ID0gYXJyLmNvbmNhdDtcblxudmFyIHB1c2ggPSBhcnIucHVzaDtcblxudmFyIGluZGV4T2YgPSBhcnIuaW5kZXhPZjtcblxudmFyIGNsYXNzMnR5cGUgPSB7fTtcblxudmFyIHRvU3RyaW5nID0gY2xhc3MydHlwZS50b1N0cmluZztcblxudmFyIGhhc093biA9IGNsYXNzMnR5cGUuaGFzT3duUHJvcGVydHk7XG5cbnZhciB0cmltID0gXCJcIi50cmltO1xuXG52YXIgc3VwcG9ydCA9IHt9O1xuXG5cblxudmFyXG5cdC8vIFVzZSB0aGUgY29ycmVjdCBkb2N1bWVudCBhY2NvcmRpbmdseSB3aXRoIHdpbmRvdyBhcmd1bWVudCAoc2FuZGJveClcblx0ZG9jdW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQsXG5cblx0dmVyc2lvbiA9IFwiMi4xLjBcIixcblxuXHQvLyBEZWZpbmUgYSBsb2NhbCBjb3B5IG9mIGpRdWVyeVxuXHRqUXVlcnkgPSBmdW5jdGlvbiggc2VsZWN0b3IsIGNvbnRleHQgKSB7XG5cdFx0Ly8gVGhlIGpRdWVyeSBvYmplY3QgaXMgYWN0dWFsbHkganVzdCB0aGUgaW5pdCBjb25zdHJ1Y3RvciAnZW5oYW5jZWQnXG5cdFx0Ly8gTmVlZCBpbml0IGlmIGpRdWVyeSBpcyBjYWxsZWQgKGp1c3QgYWxsb3cgZXJyb3IgdG8gYmUgdGhyb3duIGlmIG5vdCBpbmNsdWRlZClcblx0XHRyZXR1cm4gbmV3IGpRdWVyeS5mbi5pbml0KCBzZWxlY3RvciwgY29udGV4dCApO1xuXHR9LFxuXG5cdC8vIE1hdGNoZXMgZGFzaGVkIHN0cmluZyBmb3IgY2FtZWxpemluZ1xuXHRybXNQcmVmaXggPSAvXi1tcy0vLFxuXHRyZGFzaEFscGhhID0gLy0oW1xcZGEtel0pL2dpLFxuXG5cdC8vIFVzZWQgYnkgalF1ZXJ5LmNhbWVsQ2FzZSBhcyBjYWxsYmFjayB0byByZXBsYWNlKClcblx0ZmNhbWVsQ2FzZSA9IGZ1bmN0aW9uKCBhbGwsIGxldHRlciApIHtcblx0XHRyZXR1cm4gbGV0dGVyLnRvVXBwZXJDYXNlKCk7XG5cdH07XG5cbmpRdWVyeS5mbiA9IGpRdWVyeS5wcm90b3R5cGUgPSB7XG5cdC8vIFRoZSBjdXJyZW50IHZlcnNpb24gb2YgalF1ZXJ5IGJlaW5nIHVzZWRcblx0anF1ZXJ5OiB2ZXJzaW9uLFxuXG5cdGNvbnN0cnVjdG9yOiBqUXVlcnksXG5cblx0Ly8gU3RhcnQgd2l0aCBhbiBlbXB0eSBzZWxlY3RvclxuXHRzZWxlY3RvcjogXCJcIixcblxuXHQvLyBUaGUgZGVmYXVsdCBsZW5ndGggb2YgYSBqUXVlcnkgb2JqZWN0IGlzIDBcblx0bGVuZ3RoOiAwLFxuXG5cdHRvQXJyYXk6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBzbGljZS5jYWxsKCB0aGlzICk7XG5cdH0sXG5cblx0Ly8gR2V0IHRoZSBOdGggZWxlbWVudCBpbiB0aGUgbWF0Y2hlZCBlbGVtZW50IHNldCBPUlxuXHQvLyBHZXQgdGhlIHdob2xlIG1hdGNoZWQgZWxlbWVudCBzZXQgYXMgYSBjbGVhbiBhcnJheVxuXHRnZXQ6IGZ1bmN0aW9uKCBudW0gKSB7XG5cdFx0cmV0dXJuIG51bSAhPSBudWxsID9cblxuXHRcdFx0Ly8gUmV0dXJuIGEgJ2NsZWFuJyBhcnJheVxuXHRcdFx0KCBudW0gPCAwID8gdGhpc1sgbnVtICsgdGhpcy5sZW5ndGggXSA6IHRoaXNbIG51bSBdICkgOlxuXG5cdFx0XHQvLyBSZXR1cm4ganVzdCB0aGUgb2JqZWN0XG5cdFx0XHRzbGljZS5jYWxsKCB0aGlzICk7XG5cdH0sXG5cblx0Ly8gVGFrZSBhbiBhcnJheSBvZiBlbGVtZW50cyBhbmQgcHVzaCBpdCBvbnRvIHRoZSBzdGFja1xuXHQvLyAocmV0dXJuaW5nIHRoZSBuZXcgbWF0Y2hlZCBlbGVtZW50IHNldClcblx0cHVzaFN0YWNrOiBmdW5jdGlvbiggZWxlbXMgKSB7XG5cblx0XHQvLyBCdWlsZCBhIG5ldyBqUXVlcnkgbWF0Y2hlZCBlbGVtZW50IHNldFxuXHRcdHZhciByZXQgPSBqUXVlcnkubWVyZ2UoIHRoaXMuY29uc3RydWN0b3IoKSwgZWxlbXMgKTtcblxuXHRcdC8vIEFkZCB0aGUgb2xkIG9iamVjdCBvbnRvIHRoZSBzdGFjayAoYXMgYSByZWZlcmVuY2UpXG5cdFx0cmV0LnByZXZPYmplY3QgPSB0aGlzO1xuXHRcdHJldC5jb250ZXh0ID0gdGhpcy5jb250ZXh0O1xuXG5cdFx0Ly8gUmV0dXJuIHRoZSBuZXdseS1mb3JtZWQgZWxlbWVudCBzZXRcblx0XHRyZXR1cm4gcmV0O1xuXHR9LFxuXG5cdC8vIEV4ZWN1dGUgYSBjYWxsYmFjayBmb3IgZXZlcnkgZWxlbWVudCBpbiB0aGUgbWF0Y2hlZCBzZXQuXG5cdC8vIChZb3UgY2FuIHNlZWQgdGhlIGFyZ3VtZW50cyB3aXRoIGFuIGFycmF5IG9mIGFyZ3MsIGJ1dCB0aGlzIGlzXG5cdC8vIG9ubHkgdXNlZCBpbnRlcm5hbGx5Lilcblx0ZWFjaDogZnVuY3Rpb24oIGNhbGxiYWNrLCBhcmdzICkge1xuXHRcdHJldHVybiBqUXVlcnkuZWFjaCggdGhpcywgY2FsbGJhY2ssIGFyZ3MgKTtcblx0fSxcblxuXHRtYXA6IGZ1bmN0aW9uKCBjYWxsYmFjayApIHtcblx0XHRyZXR1cm4gdGhpcy5wdXNoU3RhY2soIGpRdWVyeS5tYXAodGhpcywgZnVuY3Rpb24oIGVsZW0sIGkgKSB7XG5cdFx0XHRyZXR1cm4gY2FsbGJhY2suY2FsbCggZWxlbSwgaSwgZWxlbSApO1xuXHRcdH0pKTtcblx0fSxcblxuXHRzbGljZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMucHVzaFN0YWNrKCBzbGljZS5hcHBseSggdGhpcywgYXJndW1lbnRzICkgKTtcblx0fSxcblxuXHRmaXJzdDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuZXEoIDAgKTtcblx0fSxcblxuXHRsYXN0OiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5lcSggLTEgKTtcblx0fSxcblxuXHRlcTogZnVuY3Rpb24oIGkgKSB7XG5cdFx0dmFyIGxlbiA9IHRoaXMubGVuZ3RoLFxuXHRcdFx0aiA9ICtpICsgKCBpIDwgMCA/IGxlbiA6IDAgKTtcblx0XHRyZXR1cm4gdGhpcy5wdXNoU3RhY2soIGogPj0gMCAmJiBqIDwgbGVuID8gWyB0aGlzW2pdIF0gOiBbXSApO1xuXHR9LFxuXG5cdGVuZDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMucHJldk9iamVjdCB8fCB0aGlzLmNvbnN0cnVjdG9yKG51bGwpO1xuXHR9LFxuXG5cdC8vIEZvciBpbnRlcm5hbCB1c2Ugb25seS5cblx0Ly8gQmVoYXZlcyBsaWtlIGFuIEFycmF5J3MgbWV0aG9kLCBub3QgbGlrZSBhIGpRdWVyeSBtZXRob2QuXG5cdHB1c2g6IHB1c2gsXG5cdHNvcnQ6IGFyci5zb3J0LFxuXHRzcGxpY2U6IGFyci5zcGxpY2Vcbn07XG5cbmpRdWVyeS5leHRlbmQgPSBqUXVlcnkuZm4uZXh0ZW5kID0gZnVuY3Rpb24oKSB7XG5cdHZhciBvcHRpb25zLCBuYW1lLCBzcmMsIGNvcHksIGNvcHlJc0FycmF5LCBjbG9uZSxcblx0XHR0YXJnZXQgPSBhcmd1bWVudHNbMF0gfHwge30sXG5cdFx0aSA9IDEsXG5cdFx0bGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aCxcblx0XHRkZWVwID0gZmFsc2U7XG5cblx0Ly8gSGFuZGxlIGEgZGVlcCBjb3B5IHNpdHVhdGlvblxuXHRpZiAoIHR5cGVvZiB0YXJnZXQgPT09IFwiYm9vbGVhblwiICkge1xuXHRcdGRlZXAgPSB0YXJnZXQ7XG5cblx0XHQvLyBza2lwIHRoZSBib29sZWFuIGFuZCB0aGUgdGFyZ2V0XG5cdFx0dGFyZ2V0ID0gYXJndW1lbnRzWyBpIF0gfHwge307XG5cdFx0aSsrO1xuXHR9XG5cblx0Ly8gSGFuZGxlIGNhc2Ugd2hlbiB0YXJnZXQgaXMgYSBzdHJpbmcgb3Igc29tZXRoaW5nIChwb3NzaWJsZSBpbiBkZWVwIGNvcHkpXG5cdGlmICggdHlwZW9mIHRhcmdldCAhPT0gXCJvYmplY3RcIiAmJiAhalF1ZXJ5LmlzRnVuY3Rpb24odGFyZ2V0KSApIHtcblx0XHR0YXJnZXQgPSB7fTtcblx0fVxuXG5cdC8vIGV4dGVuZCBqUXVlcnkgaXRzZWxmIGlmIG9ubHkgb25lIGFyZ3VtZW50IGlzIHBhc3NlZFxuXHRpZiAoIGkgPT09IGxlbmd0aCApIHtcblx0XHR0YXJnZXQgPSB0aGlzO1xuXHRcdGktLTtcblx0fVxuXG5cdGZvciAoIDsgaSA8IGxlbmd0aDsgaSsrICkge1xuXHRcdC8vIE9ubHkgZGVhbCB3aXRoIG5vbi1udWxsL3VuZGVmaW5lZCB2YWx1ZXNcblx0XHRpZiAoIChvcHRpb25zID0gYXJndW1lbnRzWyBpIF0pICE9IG51bGwgKSB7XG5cdFx0XHQvLyBFeHRlbmQgdGhlIGJhc2Ugb2JqZWN0XG5cdFx0XHRmb3IgKCBuYW1lIGluIG9wdGlvbnMgKSB7XG5cdFx0XHRcdHNyYyA9IHRhcmdldFsgbmFtZSBdO1xuXHRcdFx0XHRjb3B5ID0gb3B0aW9uc1sgbmFtZSBdO1xuXG5cdFx0XHRcdC8vIFByZXZlbnQgbmV2ZXItZW5kaW5nIGxvb3Bcblx0XHRcdFx0aWYgKCB0YXJnZXQgPT09IGNvcHkgKSB7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBSZWN1cnNlIGlmIHdlJ3JlIG1lcmdpbmcgcGxhaW4gb2JqZWN0cyBvciBhcnJheXNcblx0XHRcdFx0aWYgKCBkZWVwICYmIGNvcHkgJiYgKCBqUXVlcnkuaXNQbGFpbk9iamVjdChjb3B5KSB8fCAoY29weUlzQXJyYXkgPSBqUXVlcnkuaXNBcnJheShjb3B5KSkgKSApIHtcblx0XHRcdFx0XHRpZiAoIGNvcHlJc0FycmF5ICkge1xuXHRcdFx0XHRcdFx0Y29weUlzQXJyYXkgPSBmYWxzZTtcblx0XHRcdFx0XHRcdGNsb25lID0gc3JjICYmIGpRdWVyeS5pc0FycmF5KHNyYykgPyBzcmMgOiBbXTtcblxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBqUXVlcnkuaXNQbGFpbk9iamVjdChzcmMpID8gc3JjIDoge307XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gTmV2ZXIgbW92ZSBvcmlnaW5hbCBvYmplY3RzLCBjbG9uZSB0aGVtXG5cdFx0XHRcdFx0dGFyZ2V0WyBuYW1lIF0gPSBqUXVlcnkuZXh0ZW5kKCBkZWVwLCBjbG9uZSwgY29weSApO1xuXG5cdFx0XHRcdC8vIERvbid0IGJyaW5nIGluIHVuZGVmaW5lZCB2YWx1ZXNcblx0XHRcdFx0fSBlbHNlIGlmICggY29weSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRcdHRhcmdldFsgbmFtZSBdID0gY29weTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIFJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0XG5cdHJldHVybiB0YXJnZXQ7XG59O1xuXG5qUXVlcnkuZXh0ZW5kKHtcblx0Ly8gVW5pcXVlIGZvciBlYWNoIGNvcHkgb2YgalF1ZXJ5IG9uIHRoZSBwYWdlXG5cdGV4cGFuZG86IFwialF1ZXJ5XCIgKyAoIHZlcnNpb24gKyBNYXRoLnJhbmRvbSgpICkucmVwbGFjZSggL1xcRC9nLCBcIlwiICksXG5cblx0Ly8gQXNzdW1lIGpRdWVyeSBpcyByZWFkeSB3aXRob3V0IHRoZSByZWFkeSBtb2R1bGVcblx0aXNSZWFkeTogdHJ1ZSxcblxuXHRlcnJvcjogZnVuY3Rpb24oIG1zZyApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIG1zZyApO1xuXHR9LFxuXG5cdG5vb3A6IGZ1bmN0aW9uKCkge30sXG5cblx0Ly8gU2VlIHRlc3QvdW5pdC9jb3JlLmpzIGZvciBkZXRhaWxzIGNvbmNlcm5pbmcgaXNGdW5jdGlvbi5cblx0Ly8gU2luY2UgdmVyc2lvbiAxLjMsIERPTSBtZXRob2RzIGFuZCBmdW5jdGlvbnMgbGlrZSBhbGVydFxuXHQvLyBhcmVuJ3Qgc3VwcG9ydGVkLiBUaGV5IHJldHVybiBmYWxzZSBvbiBJRSAoIzI5NjgpLlxuXHRpc0Z1bmN0aW9uOiBmdW5jdGlvbiggb2JqICkge1xuXHRcdHJldHVybiBqUXVlcnkudHlwZShvYmopID09PSBcImZ1bmN0aW9uXCI7XG5cdH0sXG5cblx0aXNBcnJheTogQXJyYXkuaXNBcnJheSxcblxuXHRpc1dpbmRvdzogZnVuY3Rpb24oIG9iaiApIHtcblx0XHRyZXR1cm4gb2JqICE9IG51bGwgJiYgb2JqID09PSBvYmoud2luZG93O1xuXHR9LFxuXG5cdGlzTnVtZXJpYzogZnVuY3Rpb24oIG9iaiApIHtcblx0XHQvLyBwYXJzZUZsb2F0IE5hTnMgbnVtZXJpYy1jYXN0IGZhbHNlIHBvc2l0aXZlcyAobnVsbHx0cnVlfGZhbHNlfFwiXCIpXG5cdFx0Ly8gLi4uYnV0IG1pc2ludGVycHJldHMgbGVhZGluZy1udW1iZXIgc3RyaW5ncywgcGFydGljdWxhcmx5IGhleCBsaXRlcmFscyAoXCIweC4uLlwiKVxuXHRcdC8vIHN1YnRyYWN0aW9uIGZvcmNlcyBpbmZpbml0aWVzIHRvIE5hTlxuXHRcdHJldHVybiBvYmogLSBwYXJzZUZsb2F0KCBvYmogKSA+PSAwO1xuXHR9LFxuXG5cdGlzUGxhaW5PYmplY3Q6IGZ1bmN0aW9uKCBvYmogKSB7XG5cdFx0Ly8gTm90IHBsYWluIG9iamVjdHM6XG5cdFx0Ly8gLSBBbnkgb2JqZWN0IG9yIHZhbHVlIHdob3NlIGludGVybmFsIFtbQ2xhc3NdXSBwcm9wZXJ0eSBpcyBub3QgXCJbb2JqZWN0IE9iamVjdF1cIlxuXHRcdC8vIC0gRE9NIG5vZGVzXG5cdFx0Ly8gLSB3aW5kb3dcblx0XHRpZiAoIGpRdWVyeS50eXBlKCBvYmogKSAhPT0gXCJvYmplY3RcIiB8fCBvYmoubm9kZVR5cGUgfHwgalF1ZXJ5LmlzV2luZG93KCBvYmogKSApIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBTdXBwb3J0OiBGaXJlZm94IDwyMFxuXHRcdC8vIFRoZSB0cnkvY2F0Y2ggc3VwcHJlc3NlcyBleGNlcHRpb25zIHRocm93biB3aGVuIGF0dGVtcHRpbmcgdG8gYWNjZXNzXG5cdFx0Ly8gdGhlIFwiY29uc3RydWN0b3JcIiBwcm9wZXJ0eSBvZiBjZXJ0YWluIGhvc3Qgb2JqZWN0cywgaWUuIHx3aW5kb3cubG9jYXRpb258XG5cdFx0Ly8gaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9ODE0NjIyXG5cdFx0dHJ5IHtcblx0XHRcdGlmICggb2JqLmNvbnN0cnVjdG9yICYmXG5cdFx0XHRcdFx0IWhhc093bi5jYWxsKCBvYmouY29uc3RydWN0b3IucHJvdG90eXBlLCBcImlzUHJvdG90eXBlT2ZcIiApICkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoIGUgKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgdGhlIGZ1bmN0aW9uIGhhc24ndCByZXR1cm5lZCBhbHJlYWR5LCB3ZSdyZSBjb25maWRlbnQgdGhhdFxuXHRcdC8vIHxvYmp8IGlzIGEgcGxhaW4gb2JqZWN0LCBjcmVhdGVkIGJ5IHt9IG9yIGNvbnN0cnVjdGVkIHdpdGggbmV3IE9iamVjdFxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXG5cdGlzRW1wdHlPYmplY3Q6IGZ1bmN0aW9uKCBvYmogKSB7XG5cdFx0dmFyIG5hbWU7XG5cdFx0Zm9yICggbmFtZSBpbiBvYmogKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXG5cdHR5cGU6IGZ1bmN0aW9uKCBvYmogKSB7XG5cdFx0aWYgKCBvYmogPT0gbnVsbCApIHtcblx0XHRcdHJldHVybiBvYmogKyBcIlwiO1xuXHRcdH1cblx0XHQvLyBTdXBwb3J0OiBBbmRyb2lkIDwgNC4wLCBpT1MgPCA2IChmdW5jdGlvbmlzaCBSZWdFeHApXG5cdFx0cmV0dXJuIHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIG9iaiA9PT0gXCJmdW5jdGlvblwiID9cblx0XHRcdGNsYXNzMnR5cGVbIHRvU3RyaW5nLmNhbGwob2JqKSBdIHx8IFwib2JqZWN0XCIgOlxuXHRcdFx0dHlwZW9mIG9iajtcblx0fSxcblxuXHQvLyBFdmFsdWF0ZXMgYSBzY3JpcHQgaW4gYSBnbG9iYWwgY29udGV4dFxuXHRnbG9iYWxFdmFsOiBmdW5jdGlvbiggY29kZSApIHtcblx0XHR2YXIgc2NyaXB0LFxuXHRcdFx0aW5kaXJlY3QgPSBldmFsO1xuXG5cdFx0Y29kZSA9IGpRdWVyeS50cmltKCBjb2RlICk7XG5cblx0XHRpZiAoIGNvZGUgKSB7XG5cdFx0XHQvLyBJZiB0aGUgY29kZSBpbmNsdWRlcyBhIHZhbGlkLCBwcm9sb2d1ZSBwb3NpdGlvblxuXHRcdFx0Ly8gc3RyaWN0IG1vZGUgcHJhZ21hLCBleGVjdXRlIGNvZGUgYnkgaW5qZWN0aW5nIGFcblx0XHRcdC8vIHNjcmlwdCB0YWcgaW50byB0aGUgZG9jdW1lbnQuXG5cdFx0XHRpZiAoIGNvZGUuaW5kZXhPZihcInVzZSBzdHJpY3RcIikgPT09IDEgKSB7XG5cdFx0XHRcdHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XG5cdFx0XHRcdHNjcmlwdC50ZXh0ID0gY29kZTtcblx0XHRcdFx0ZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZCggc2NyaXB0ICkucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCggc2NyaXB0ICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gT3RoZXJ3aXNlLCBhdm9pZCB0aGUgRE9NIG5vZGUgY3JlYXRpb24sIGluc2VydGlvblxuXHRcdFx0Ly8gYW5kIHJlbW92YWwgYnkgdXNpbmcgYW4gaW5kaXJlY3QgZ2xvYmFsIGV2YWxcblx0XHRcdFx0aW5kaXJlY3QoIGNvZGUgKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0Ly8gQ29udmVydCBkYXNoZWQgdG8gY2FtZWxDYXNlOyB1c2VkIGJ5IHRoZSBjc3MgYW5kIGRhdGEgbW9kdWxlc1xuXHQvLyBNaWNyb3NvZnQgZm9yZ290IHRvIGh1bXAgdGhlaXIgdmVuZG9yIHByZWZpeCAoIzk1NzIpXG5cdGNhbWVsQ2FzZTogZnVuY3Rpb24oIHN0cmluZyApIHtcblx0XHRyZXR1cm4gc3RyaW5nLnJlcGxhY2UoIHJtc1ByZWZpeCwgXCJtcy1cIiApLnJlcGxhY2UoIHJkYXNoQWxwaGEsIGZjYW1lbENhc2UgKTtcblx0fSxcblxuXHRub2RlTmFtZTogZnVuY3Rpb24oIGVsZW0sIG5hbWUgKSB7XG5cdFx0cmV0dXJuIGVsZW0ubm9kZU5hbWUgJiYgZWxlbS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSBuYW1lLnRvTG93ZXJDYXNlKCk7XG5cdH0sXG5cblx0Ly8gYXJncyBpcyBmb3IgaW50ZXJuYWwgdXNhZ2Ugb25seVxuXHRlYWNoOiBmdW5jdGlvbiggb2JqLCBjYWxsYmFjaywgYXJncyApIHtcblx0XHR2YXIgdmFsdWUsXG5cdFx0XHRpID0gMCxcblx0XHRcdGxlbmd0aCA9IG9iai5sZW5ndGgsXG5cdFx0XHRpc0FycmF5ID0gaXNBcnJheWxpa2UoIG9iaiApO1xuXG5cdFx0aWYgKCBhcmdzICkge1xuXHRcdFx0aWYgKCBpc0FycmF5ICkge1xuXHRcdFx0XHRmb3IgKCA7IGkgPCBsZW5ndGg7IGkrKyApIHtcblx0XHRcdFx0XHR2YWx1ZSA9IGNhbGxiYWNrLmFwcGx5KCBvYmpbIGkgXSwgYXJncyApO1xuXG5cdFx0XHRcdFx0aWYgKCB2YWx1ZSA9PT0gZmFsc2UgKSB7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZvciAoIGkgaW4gb2JqICkge1xuXHRcdFx0XHRcdHZhbHVlID0gY2FsbGJhY2suYXBwbHkoIG9ialsgaSBdLCBhcmdzICk7XG5cblx0XHRcdFx0XHRpZiAoIHZhbHVlID09PSBmYWxzZSApIHtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0Ly8gQSBzcGVjaWFsLCBmYXN0LCBjYXNlIGZvciB0aGUgbW9zdCBjb21tb24gdXNlIG9mIGVhY2hcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKCBpc0FycmF5ICkge1xuXHRcdFx0XHRmb3IgKCA7IGkgPCBsZW5ndGg7IGkrKyApIHtcblx0XHRcdFx0XHR2YWx1ZSA9IGNhbGxiYWNrLmNhbGwoIG9ialsgaSBdLCBpLCBvYmpbIGkgXSApO1xuXG5cdFx0XHRcdFx0aWYgKCB2YWx1ZSA9PT0gZmFsc2UgKSB7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZvciAoIGkgaW4gb2JqICkge1xuXHRcdFx0XHRcdHZhbHVlID0gY2FsbGJhY2suY2FsbCggb2JqWyBpIF0sIGksIG9ialsgaSBdICk7XG5cblx0XHRcdFx0XHRpZiAoIHZhbHVlID09PSBmYWxzZSApIHtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBvYmo7XG5cdH0sXG5cblx0dHJpbTogZnVuY3Rpb24oIHRleHQgKSB7XG5cdFx0cmV0dXJuIHRleHQgPT0gbnVsbCA/IFwiXCIgOiB0cmltLmNhbGwoIHRleHQgKTtcblx0fSxcblxuXHQvLyByZXN1bHRzIGlzIGZvciBpbnRlcm5hbCB1c2FnZSBvbmx5XG5cdG1ha2VBcnJheTogZnVuY3Rpb24oIGFyciwgcmVzdWx0cyApIHtcblx0XHR2YXIgcmV0ID0gcmVzdWx0cyB8fCBbXTtcblxuXHRcdGlmICggYXJyICE9IG51bGwgKSB7XG5cdFx0XHRpZiAoIGlzQXJyYXlsaWtlKCBPYmplY3QoYXJyKSApICkge1xuXHRcdFx0XHRqUXVlcnkubWVyZ2UoIHJldCxcblx0XHRcdFx0XHR0eXBlb2YgYXJyID09PSBcInN0cmluZ1wiID9cblx0XHRcdFx0XHRbIGFyciBdIDogYXJyXG5cdFx0XHRcdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRwdXNoLmNhbGwoIHJldCwgYXJyICk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJldDtcblx0fSxcblxuXHRpbkFycmF5OiBmdW5jdGlvbiggZWxlbSwgYXJyLCBpICkge1xuXHRcdHJldHVybiBhcnIgPT0gbnVsbCA/IC0xIDogaW5kZXhPZi5jYWxsKCBhcnIsIGVsZW0sIGkgKTtcblx0fSxcblxuXHRtZXJnZTogZnVuY3Rpb24oIGZpcnN0LCBzZWNvbmQgKSB7XG5cdFx0dmFyIGxlbiA9ICtzZWNvbmQubGVuZ3RoLFxuXHRcdFx0aiA9IDAsXG5cdFx0XHRpID0gZmlyc3QubGVuZ3RoO1xuXG5cdFx0Zm9yICggOyBqIDwgbGVuOyBqKysgKSB7XG5cdFx0XHRmaXJzdFsgaSsrIF0gPSBzZWNvbmRbIGogXTtcblx0XHR9XG5cblx0XHRmaXJzdC5sZW5ndGggPSBpO1xuXG5cdFx0cmV0dXJuIGZpcnN0O1xuXHR9LFxuXG5cdGdyZXA6IGZ1bmN0aW9uKCBlbGVtcywgY2FsbGJhY2ssIGludmVydCApIHtcblx0XHR2YXIgY2FsbGJhY2tJbnZlcnNlLFxuXHRcdFx0bWF0Y2hlcyA9IFtdLFxuXHRcdFx0aSA9IDAsXG5cdFx0XHRsZW5ndGggPSBlbGVtcy5sZW5ndGgsXG5cdFx0XHRjYWxsYmFja0V4cGVjdCA9ICFpbnZlcnQ7XG5cblx0XHQvLyBHbyB0aHJvdWdoIHRoZSBhcnJheSwgb25seSBzYXZpbmcgdGhlIGl0ZW1zXG5cdFx0Ly8gdGhhdCBwYXNzIHRoZSB2YWxpZGF0b3IgZnVuY3Rpb25cblx0XHRmb3IgKCA7IGkgPCBsZW5ndGg7IGkrKyApIHtcblx0XHRcdGNhbGxiYWNrSW52ZXJzZSA9ICFjYWxsYmFjayggZWxlbXNbIGkgXSwgaSApO1xuXHRcdFx0aWYgKCBjYWxsYmFja0ludmVyc2UgIT09IGNhbGxiYWNrRXhwZWN0ICkge1xuXHRcdFx0XHRtYXRjaGVzLnB1c2goIGVsZW1zWyBpIF0gKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gbWF0Y2hlcztcblx0fSxcblxuXHQvLyBhcmcgaXMgZm9yIGludGVybmFsIHVzYWdlIG9ubHlcblx0bWFwOiBmdW5jdGlvbiggZWxlbXMsIGNhbGxiYWNrLCBhcmcgKSB7XG5cdFx0dmFyIHZhbHVlLFxuXHRcdFx0aSA9IDAsXG5cdFx0XHRsZW5ndGggPSBlbGVtcy5sZW5ndGgsXG5cdFx0XHRpc0FycmF5ID0gaXNBcnJheWxpa2UoIGVsZW1zICksXG5cdFx0XHRyZXQgPSBbXTtcblxuXHRcdC8vIEdvIHRocm91Z2ggdGhlIGFycmF5LCB0cmFuc2xhdGluZyBlYWNoIG9mIHRoZSBpdGVtcyB0byB0aGVpciBuZXcgdmFsdWVzXG5cdFx0aWYgKCBpc0FycmF5ICkge1xuXHRcdFx0Zm9yICggOyBpIDwgbGVuZ3RoOyBpKysgKSB7XG5cdFx0XHRcdHZhbHVlID0gY2FsbGJhY2soIGVsZW1zWyBpIF0sIGksIGFyZyApO1xuXG5cdFx0XHRcdGlmICggdmFsdWUgIT0gbnVsbCApIHtcblx0XHRcdFx0XHRyZXQucHVzaCggdmFsdWUgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0Ly8gR28gdGhyb3VnaCBldmVyeSBrZXkgb24gdGhlIG9iamVjdCxcblx0XHR9IGVsc2Uge1xuXHRcdFx0Zm9yICggaSBpbiBlbGVtcyApIHtcblx0XHRcdFx0dmFsdWUgPSBjYWxsYmFjayggZWxlbXNbIGkgXSwgaSwgYXJnICk7XG5cblx0XHRcdFx0aWYgKCB2YWx1ZSAhPSBudWxsICkge1xuXHRcdFx0XHRcdHJldC5wdXNoKCB2YWx1ZSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gRmxhdHRlbiBhbnkgbmVzdGVkIGFycmF5c1xuXHRcdHJldHVybiBjb25jYXQuYXBwbHkoIFtdLCByZXQgKTtcblx0fSxcblxuXHQvLyBBIGdsb2JhbCBHVUlEIGNvdW50ZXIgZm9yIG9iamVjdHNcblx0Z3VpZDogMSxcblxuXHQvLyBCaW5kIGEgZnVuY3Rpb24gdG8gYSBjb250ZXh0LCBvcHRpb25hbGx5IHBhcnRpYWxseSBhcHBseWluZyBhbnlcblx0Ly8gYXJndW1lbnRzLlxuXHRwcm94eTogZnVuY3Rpb24oIGZuLCBjb250ZXh0ICkge1xuXHRcdHZhciB0bXAsIGFyZ3MsIHByb3h5O1xuXG5cdFx0aWYgKCB0eXBlb2YgY29udGV4dCA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdHRtcCA9IGZuWyBjb250ZXh0IF07XG5cdFx0XHRjb250ZXh0ID0gZm47XG5cdFx0XHRmbiA9IHRtcDtcblx0XHR9XG5cblx0XHQvLyBRdWljayBjaGVjayB0byBkZXRlcm1pbmUgaWYgdGFyZ2V0IGlzIGNhbGxhYmxlLCBpbiB0aGUgc3BlY1xuXHRcdC8vIHRoaXMgdGhyb3dzIGEgVHlwZUVycm9yLCBidXQgd2Ugd2lsbCBqdXN0IHJldHVybiB1bmRlZmluZWQuXG5cdFx0aWYgKCAhalF1ZXJ5LmlzRnVuY3Rpb24oIGZuICkgKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdC8vIFNpbXVsYXRlZCBiaW5kXG5cdFx0YXJncyA9IHNsaWNlLmNhbGwoIGFyZ3VtZW50cywgMiApO1xuXHRcdHByb3h5ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gZm4uYXBwbHkoIGNvbnRleHQgfHwgdGhpcywgYXJncy5jb25jYXQoIHNsaWNlLmNhbGwoIGFyZ3VtZW50cyApICkgKTtcblx0XHR9O1xuXG5cdFx0Ly8gU2V0IHRoZSBndWlkIG9mIHVuaXF1ZSBoYW5kbGVyIHRvIHRoZSBzYW1lIG9mIG9yaWdpbmFsIGhhbmRsZXIsIHNvIGl0IGNhbiBiZSByZW1vdmVkXG5cdFx0cHJveHkuZ3VpZCA9IGZuLmd1aWQgPSBmbi5ndWlkIHx8IGpRdWVyeS5ndWlkKys7XG5cblx0XHRyZXR1cm4gcHJveHk7XG5cdH0sXG5cblx0bm93OiBEYXRlLm5vdyxcblxuXHQvLyBqUXVlcnkuc3VwcG9ydCBpcyBub3QgdXNlZCBpbiBDb3JlIGJ1dCBvdGhlciBwcm9qZWN0cyBhdHRhY2ggdGhlaXJcblx0Ly8gcHJvcGVydGllcyB0byBpdCBzbyBpdCBuZWVkcyB0byBleGlzdC5cblx0c3VwcG9ydDogc3VwcG9ydFxufSk7XG5cbi8vIFBvcHVsYXRlIHRoZSBjbGFzczJ0eXBlIG1hcFxualF1ZXJ5LmVhY2goXCJCb29sZWFuIE51bWJlciBTdHJpbmcgRnVuY3Rpb24gQXJyYXkgRGF0ZSBSZWdFeHAgT2JqZWN0IEVycm9yXCIuc3BsaXQoXCIgXCIpLCBmdW5jdGlvbihpLCBuYW1lKSB7XG5cdGNsYXNzMnR5cGVbIFwiW29iamVjdCBcIiArIG5hbWUgKyBcIl1cIiBdID0gbmFtZS50b0xvd2VyQ2FzZSgpO1xufSk7XG5cbmZ1bmN0aW9uIGlzQXJyYXlsaWtlKCBvYmogKSB7XG5cdHZhciBsZW5ndGggPSBvYmoubGVuZ3RoLFxuXHRcdHR5cGUgPSBqUXVlcnkudHlwZSggb2JqICk7XG5cblx0aWYgKCB0eXBlID09PSBcImZ1bmN0aW9uXCIgfHwgalF1ZXJ5LmlzV2luZG93KCBvYmogKSApIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRpZiAoIG9iai5ub2RlVHlwZSA9PT0gMSAmJiBsZW5ndGggKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRyZXR1cm4gdHlwZSA9PT0gXCJhcnJheVwiIHx8IGxlbmd0aCA9PT0gMCB8fFxuXHRcdHR5cGVvZiBsZW5ndGggPT09IFwibnVtYmVyXCIgJiYgbGVuZ3RoID4gMCAmJiAoIGxlbmd0aCAtIDEgKSBpbiBvYmo7XG59XG52YXIgU2l6emxlID1cbi8qIVxuICogU2l6emxlIENTUyBTZWxlY3RvciBFbmdpbmUgdjEuMTAuMTZcbiAqIGh0dHA6Ly9zaXp6bGVqcy5jb20vXG4gKlxuICogQ29weXJpZ2h0IDIwMTMgalF1ZXJ5IEZvdW5kYXRpb24sIEluYy4gYW5kIG90aGVyIGNvbnRyaWJ1dG9yc1xuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKiBodHRwOi8vanF1ZXJ5Lm9yZy9saWNlbnNlXG4gKlxuICogRGF0ZTogMjAxNC0wMS0xM1xuICovXG4oZnVuY3Rpb24oIHdpbmRvdyApIHtcblxudmFyIGksXG5cdHN1cHBvcnQsXG5cdEV4cHIsXG5cdGdldFRleHQsXG5cdGlzWE1MLFxuXHRjb21waWxlLFxuXHRvdXRlcm1vc3RDb250ZXh0LFxuXHRzb3J0SW5wdXQsXG5cdGhhc0R1cGxpY2F0ZSxcblxuXHQvLyBMb2NhbCBkb2N1bWVudCB2YXJzXG5cdHNldERvY3VtZW50LFxuXHRkb2N1bWVudCxcblx0ZG9jRWxlbSxcblx0ZG9jdW1lbnRJc0hUTUwsXG5cdHJidWdneVFTQSxcblx0cmJ1Z2d5TWF0Y2hlcyxcblx0bWF0Y2hlcyxcblx0Y29udGFpbnMsXG5cblx0Ly8gSW5zdGFuY2Utc3BlY2lmaWMgZGF0YVxuXHRleHBhbmRvID0gXCJzaXp6bGVcIiArIC0obmV3IERhdGUoKSksXG5cdHByZWZlcnJlZERvYyA9IHdpbmRvdy5kb2N1bWVudCxcblx0ZGlycnVucyA9IDAsXG5cdGRvbmUgPSAwLFxuXHRjbGFzc0NhY2hlID0gY3JlYXRlQ2FjaGUoKSxcblx0dG9rZW5DYWNoZSA9IGNyZWF0ZUNhY2hlKCksXG5cdGNvbXBpbGVyQ2FjaGUgPSBjcmVhdGVDYWNoZSgpLFxuXHRzb3J0T3JkZXIgPSBmdW5jdGlvbiggYSwgYiApIHtcblx0XHRpZiAoIGEgPT09IGIgKSB7XG5cdFx0XHRoYXNEdXBsaWNhdGUgPSB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gMDtcblx0fSxcblxuXHQvLyBHZW5lcmFsLXB1cnBvc2UgY29uc3RhbnRzXG5cdHN0cnVuZGVmaW5lZCA9IHR5cGVvZiB1bmRlZmluZWQsXG5cdE1BWF9ORUdBVElWRSA9IDEgPDwgMzEsXG5cblx0Ly8gSW5zdGFuY2UgbWV0aG9kc1xuXHRoYXNPd24gPSAoe30pLmhhc093blByb3BlcnR5LFxuXHRhcnIgPSBbXSxcblx0cG9wID0gYXJyLnBvcCxcblx0cHVzaF9uYXRpdmUgPSBhcnIucHVzaCxcblx0cHVzaCA9IGFyci5wdXNoLFxuXHRzbGljZSA9IGFyci5zbGljZSxcblx0Ly8gVXNlIGEgc3RyaXBwZWQtZG93biBpbmRleE9mIGlmIHdlIGNhbid0IHVzZSBhIG5hdGl2ZSBvbmVcblx0aW5kZXhPZiA9IGFyci5pbmRleE9mIHx8IGZ1bmN0aW9uKCBlbGVtICkge1xuXHRcdHZhciBpID0gMCxcblx0XHRcdGxlbiA9IHRoaXMubGVuZ3RoO1xuXHRcdGZvciAoIDsgaSA8IGxlbjsgaSsrICkge1xuXHRcdFx0aWYgKCB0aGlzW2ldID09PSBlbGVtICkge1xuXHRcdFx0XHRyZXR1cm4gaTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIC0xO1xuXHR9LFxuXG5cdGJvb2xlYW5zID0gXCJjaGVja2VkfHNlbGVjdGVkfGFzeW5jfGF1dG9mb2N1c3xhdXRvcGxheXxjb250cm9sc3xkZWZlcnxkaXNhYmxlZHxoaWRkZW58aXNtYXB8bG9vcHxtdWx0aXBsZXxvcGVufHJlYWRvbmx5fHJlcXVpcmVkfHNjb3BlZFwiLFxuXG5cdC8vIFJlZ3VsYXIgZXhwcmVzc2lvbnNcblxuXHQvLyBXaGl0ZXNwYWNlIGNoYXJhY3RlcnMgaHR0cDovL3d3dy53My5vcmcvVFIvY3NzMy1zZWxlY3RvcnMvI3doaXRlc3BhY2Vcblx0d2hpdGVzcGFjZSA9IFwiW1xcXFx4MjBcXFxcdFxcXFxyXFxcXG5cXFxcZl1cIixcblx0Ly8gaHR0cDovL3d3dy53My5vcmcvVFIvY3NzMy1zeW50YXgvI2NoYXJhY3RlcnNcblx0Y2hhcmFjdGVyRW5jb2RpbmcgPSBcIig/OlxcXFxcXFxcLnxbXFxcXHctXXxbXlxcXFx4MDAtXFxcXHhhMF0pK1wiLFxuXG5cdC8vIExvb3NlbHkgbW9kZWxlZCBvbiBDU1MgaWRlbnRpZmllciBjaGFyYWN0ZXJzXG5cdC8vIEFuIHVucXVvdGVkIHZhbHVlIHNob3VsZCBiZSBhIENTUyBpZGVudGlmaWVyIGh0dHA6Ly93d3cudzMub3JnL1RSL2NzczMtc2VsZWN0b3JzLyNhdHRyaWJ1dGUtc2VsZWN0b3JzXG5cdC8vIFByb3BlciBzeW50YXg6IGh0dHA6Ly93d3cudzMub3JnL1RSL0NTUzIxL3N5bmRhdGEuaHRtbCN2YWx1ZS1kZWYtaWRlbnRpZmllclxuXHRpZGVudGlmaWVyID0gY2hhcmFjdGVyRW5jb2RpbmcucmVwbGFjZSggXCJ3XCIsIFwidyNcIiApLFxuXG5cdC8vIEFjY2VwdGFibGUgb3BlcmF0b3JzIGh0dHA6Ly93d3cudzMub3JnL1RSL3NlbGVjdG9ycy8jYXR0cmlidXRlLXNlbGVjdG9yc1xuXHRhdHRyaWJ1dGVzID0gXCJcXFxcW1wiICsgd2hpdGVzcGFjZSArIFwiKihcIiArIGNoYXJhY3RlckVuY29kaW5nICsgXCIpXCIgKyB3aGl0ZXNwYWNlICtcblx0XHRcIiooPzooWypeJHwhfl0/PSlcIiArIHdoaXRlc3BhY2UgKyBcIiooPzooWydcXFwiXSkoKD86XFxcXFxcXFwufFteXFxcXFxcXFxdKSo/KVxcXFwzfChcIiArIGlkZW50aWZpZXIgKyBcIil8KXwpXCIgKyB3aGl0ZXNwYWNlICsgXCIqXFxcXF1cIixcblxuXHQvLyBQcmVmZXIgYXJndW1lbnRzIHF1b3RlZCxcblx0Ly8gICB0aGVuIG5vdCBjb250YWluaW5nIHBzZXVkb3MvYnJhY2tldHMsXG5cdC8vICAgdGhlbiBhdHRyaWJ1dGUgc2VsZWN0b3JzL25vbi1wYXJlbnRoZXRpY2FsIGV4cHJlc3Npb25zLFxuXHQvLyAgIHRoZW4gYW55dGhpbmcgZWxzZVxuXHQvLyBUaGVzZSBwcmVmZXJlbmNlcyBhcmUgaGVyZSB0byByZWR1Y2UgdGhlIG51bWJlciBvZiBzZWxlY3RvcnNcblx0Ly8gICBuZWVkaW5nIHRva2VuaXplIGluIHRoZSBQU0VVRE8gcHJlRmlsdGVyXG5cdHBzZXVkb3MgPSBcIjooXCIgKyBjaGFyYWN0ZXJFbmNvZGluZyArIFwiKSg/OlxcXFwoKChbJ1xcXCJdKSgoPzpcXFxcXFxcXC58W15cXFxcXFxcXF0pKj8pXFxcXDN8KCg/OlxcXFxcXFxcLnxbXlxcXFxcXFxcKClbXFxcXF1dfFwiICsgYXR0cmlidXRlcy5yZXBsYWNlKCAzLCA4ICkgKyBcIikqKXwuKilcXFxcKXwpXCIsXG5cblx0Ly8gTGVhZGluZyBhbmQgbm9uLWVzY2FwZWQgdHJhaWxpbmcgd2hpdGVzcGFjZSwgY2FwdHVyaW5nIHNvbWUgbm9uLXdoaXRlc3BhY2UgY2hhcmFjdGVycyBwcmVjZWRpbmcgdGhlIGxhdHRlclxuXHRydHJpbSA9IG5ldyBSZWdFeHAoIFwiXlwiICsgd2hpdGVzcGFjZSArIFwiK3woKD86XnxbXlxcXFxcXFxcXSkoPzpcXFxcXFxcXC4pKilcIiArIHdoaXRlc3BhY2UgKyBcIiskXCIsIFwiZ1wiICksXG5cblx0cmNvbW1hID0gbmV3IFJlZ0V4cCggXCJeXCIgKyB3aGl0ZXNwYWNlICsgXCIqLFwiICsgd2hpdGVzcGFjZSArIFwiKlwiICksXG5cdHJjb21iaW5hdG9ycyA9IG5ldyBSZWdFeHAoIFwiXlwiICsgd2hpdGVzcGFjZSArIFwiKihbPit+XXxcIiArIHdoaXRlc3BhY2UgKyBcIilcIiArIHdoaXRlc3BhY2UgKyBcIipcIiApLFxuXG5cdHJhdHRyaWJ1dGVRdW90ZXMgPSBuZXcgUmVnRXhwKCBcIj1cIiArIHdoaXRlc3BhY2UgKyBcIiooW15cXFxcXSdcXFwiXSo/KVwiICsgd2hpdGVzcGFjZSArIFwiKlxcXFxdXCIsIFwiZ1wiICksXG5cblx0cnBzZXVkbyA9IG5ldyBSZWdFeHAoIHBzZXVkb3MgKSxcblx0cmlkZW50aWZpZXIgPSBuZXcgUmVnRXhwKCBcIl5cIiArIGlkZW50aWZpZXIgKyBcIiRcIiApLFxuXG5cdG1hdGNoRXhwciA9IHtcblx0XHRcIklEXCI6IG5ldyBSZWdFeHAoIFwiXiMoXCIgKyBjaGFyYWN0ZXJFbmNvZGluZyArIFwiKVwiICksXG5cdFx0XCJDTEFTU1wiOiBuZXcgUmVnRXhwKCBcIl5cXFxcLihcIiArIGNoYXJhY3RlckVuY29kaW5nICsgXCIpXCIgKSxcblx0XHRcIlRBR1wiOiBuZXcgUmVnRXhwKCBcIl4oXCIgKyBjaGFyYWN0ZXJFbmNvZGluZy5yZXBsYWNlKCBcIndcIiwgXCJ3KlwiICkgKyBcIilcIiApLFxuXHRcdFwiQVRUUlwiOiBuZXcgUmVnRXhwKCBcIl5cIiArIGF0dHJpYnV0ZXMgKSxcblx0XHRcIlBTRVVET1wiOiBuZXcgUmVnRXhwKCBcIl5cIiArIHBzZXVkb3MgKSxcblx0XHRcIkNISUxEXCI6IG5ldyBSZWdFeHAoIFwiXjoob25seXxmaXJzdHxsYXN0fG50aHxudGgtbGFzdCktKGNoaWxkfG9mLXR5cGUpKD86XFxcXChcIiArIHdoaXRlc3BhY2UgK1xuXHRcdFx0XCIqKGV2ZW58b2RkfCgoWystXXwpKFxcXFxkKilufClcIiArIHdoaXRlc3BhY2UgKyBcIiooPzooWystXXwpXCIgKyB3aGl0ZXNwYWNlICtcblx0XHRcdFwiKihcXFxcZCspfCkpXCIgKyB3aGl0ZXNwYWNlICsgXCIqXFxcXCl8KVwiLCBcImlcIiApLFxuXHRcdFwiYm9vbFwiOiBuZXcgUmVnRXhwKCBcIl4oPzpcIiArIGJvb2xlYW5zICsgXCIpJFwiLCBcImlcIiApLFxuXHRcdC8vIEZvciB1c2UgaW4gbGlicmFyaWVzIGltcGxlbWVudGluZyAuaXMoKVxuXHRcdC8vIFdlIHVzZSB0aGlzIGZvciBQT1MgbWF0Y2hpbmcgaW4gYHNlbGVjdGBcblx0XHRcIm5lZWRzQ29udGV4dFwiOiBuZXcgUmVnRXhwKCBcIl5cIiArIHdoaXRlc3BhY2UgKyBcIipbPit+XXw6KGV2ZW58b2RkfGVxfGd0fGx0fG50aHxmaXJzdHxsYXN0KSg/OlxcXFwoXCIgK1xuXHRcdFx0d2hpdGVzcGFjZSArIFwiKigoPzotXFxcXGQpP1xcXFxkKilcIiArIHdoaXRlc3BhY2UgKyBcIipcXFxcKXwpKD89W14tXXwkKVwiLCBcImlcIiApXG5cdH0sXG5cblx0cmlucHV0cyA9IC9eKD86aW5wdXR8c2VsZWN0fHRleHRhcmVhfGJ1dHRvbikkL2ksXG5cdHJoZWFkZXIgPSAvXmhcXGQkL2ksXG5cblx0cm5hdGl2ZSA9IC9eW157XStcXHtcXHMqXFxbbmF0aXZlIFxcdy8sXG5cblx0Ly8gRWFzaWx5LXBhcnNlYWJsZS9yZXRyaWV2YWJsZSBJRCBvciBUQUcgb3IgQ0xBU1Mgc2VsZWN0b3JzXG5cdHJxdWlja0V4cHIgPSAvXig/OiMoW1xcdy1dKyl8KFxcdyspfFxcLihbXFx3LV0rKSkkLyxcblxuXHRyc2libGluZyA9IC9bK35dLyxcblx0cmVzY2FwZSA9IC8nfFxcXFwvZyxcblxuXHQvLyBDU1MgZXNjYXBlcyBodHRwOi8vd3d3LnczLm9yZy9UUi9DU1MyMS9zeW5kYXRhLmh0bWwjZXNjYXBlZC1jaGFyYWN0ZXJzXG5cdHJ1bmVzY2FwZSA9IG5ldyBSZWdFeHAoIFwiXFxcXFxcXFwoW1xcXFxkYS1mXXsxLDZ9XCIgKyB3aGl0ZXNwYWNlICsgXCI/fChcIiArIHdoaXRlc3BhY2UgKyBcIil8LilcIiwgXCJpZ1wiICksXG5cdGZ1bmVzY2FwZSA9IGZ1bmN0aW9uKCBfLCBlc2NhcGVkLCBlc2NhcGVkV2hpdGVzcGFjZSApIHtcblx0XHR2YXIgaGlnaCA9IFwiMHhcIiArIGVzY2FwZWQgLSAweDEwMDAwO1xuXHRcdC8vIE5hTiBtZWFucyBub24tY29kZXBvaW50XG5cdFx0Ly8gU3VwcG9ydDogRmlyZWZveFxuXHRcdC8vIFdvcmthcm91bmQgZXJyb25lb3VzIG51bWVyaWMgaW50ZXJwcmV0YXRpb24gb2YgK1wiMHhcIlxuXHRcdHJldHVybiBoaWdoICE9PSBoaWdoIHx8IGVzY2FwZWRXaGl0ZXNwYWNlID9cblx0XHRcdGVzY2FwZWQgOlxuXHRcdFx0aGlnaCA8IDAgP1xuXHRcdFx0XHQvLyBCTVAgY29kZXBvaW50XG5cdFx0XHRcdFN0cmluZy5mcm9tQ2hhckNvZGUoIGhpZ2ggKyAweDEwMDAwICkgOlxuXHRcdFx0XHQvLyBTdXBwbGVtZW50YWwgUGxhbmUgY29kZXBvaW50IChzdXJyb2dhdGUgcGFpcilcblx0XHRcdFx0U3RyaW5nLmZyb21DaGFyQ29kZSggaGlnaCA+PiAxMCB8IDB4RDgwMCwgaGlnaCAmIDB4M0ZGIHwgMHhEQzAwICk7XG5cdH07XG5cbi8vIE9wdGltaXplIGZvciBwdXNoLmFwcGx5KCBfLCBOb2RlTGlzdCApXG50cnkge1xuXHRwdXNoLmFwcGx5KFxuXHRcdChhcnIgPSBzbGljZS5jYWxsKCBwcmVmZXJyZWREb2MuY2hpbGROb2RlcyApKSxcblx0XHRwcmVmZXJyZWREb2MuY2hpbGROb2Rlc1xuXHQpO1xuXHQvLyBTdXBwb3J0OiBBbmRyb2lkPDQuMFxuXHQvLyBEZXRlY3Qgc2lsZW50bHkgZmFpbGluZyBwdXNoLmFwcGx5XG5cdGFyclsgcHJlZmVycmVkRG9jLmNoaWxkTm9kZXMubGVuZ3RoIF0ubm9kZVR5cGU7XG59IGNhdGNoICggZSApIHtcblx0cHVzaCA9IHsgYXBwbHk6IGFyci5sZW5ndGggP1xuXG5cdFx0Ly8gTGV2ZXJhZ2Ugc2xpY2UgaWYgcG9zc2libGVcblx0XHRmdW5jdGlvbiggdGFyZ2V0LCBlbHMgKSB7XG5cdFx0XHRwdXNoX25hdGl2ZS5hcHBseSggdGFyZ2V0LCBzbGljZS5jYWxsKGVscykgKTtcblx0XHR9IDpcblxuXHRcdC8vIFN1cHBvcnQ6IElFPDlcblx0XHQvLyBPdGhlcndpc2UgYXBwZW5kIGRpcmVjdGx5XG5cdFx0ZnVuY3Rpb24oIHRhcmdldCwgZWxzICkge1xuXHRcdFx0dmFyIGogPSB0YXJnZXQubGVuZ3RoLFxuXHRcdFx0XHRpID0gMDtcblx0XHRcdC8vIENhbid0IHRydXN0IE5vZGVMaXN0Lmxlbmd0aFxuXHRcdFx0d2hpbGUgKCAodGFyZ2V0W2orK10gPSBlbHNbaSsrXSkgKSB7fVxuXHRcdFx0dGFyZ2V0Lmxlbmd0aCA9IGogLSAxO1xuXHRcdH1cblx0fTtcbn1cblxuZnVuY3Rpb24gU2l6emxlKCBzZWxlY3RvciwgY29udGV4dCwgcmVzdWx0cywgc2VlZCApIHtcblx0dmFyIG1hdGNoLCBlbGVtLCBtLCBub2RlVHlwZSxcblx0XHQvLyBRU0EgdmFyc1xuXHRcdGksIGdyb3Vwcywgb2xkLCBuaWQsIG5ld0NvbnRleHQsIG5ld1NlbGVjdG9yO1xuXG5cdGlmICggKCBjb250ZXh0ID8gY29udGV4dC5vd25lckRvY3VtZW50IHx8IGNvbnRleHQgOiBwcmVmZXJyZWREb2MgKSAhPT0gZG9jdW1lbnQgKSB7XG5cdFx0c2V0RG9jdW1lbnQoIGNvbnRleHQgKTtcblx0fVxuXG5cdGNvbnRleHQgPSBjb250ZXh0IHx8IGRvY3VtZW50O1xuXHRyZXN1bHRzID0gcmVzdWx0cyB8fCBbXTtcblxuXHRpZiAoICFzZWxlY3RvciB8fCB0eXBlb2Ygc2VsZWN0b3IgIT09IFwic3RyaW5nXCIgKSB7XG5cdFx0cmV0dXJuIHJlc3VsdHM7XG5cdH1cblxuXHRpZiAoIChub2RlVHlwZSA9IGNvbnRleHQubm9kZVR5cGUpICE9PSAxICYmIG5vZGVUeXBlICE9PSA5ICkge1xuXHRcdHJldHVybiBbXTtcblx0fVxuXG5cdGlmICggZG9jdW1lbnRJc0hUTUwgJiYgIXNlZWQgKSB7XG5cblx0XHQvLyBTaG9ydGN1dHNcblx0XHRpZiAoIChtYXRjaCA9IHJxdWlja0V4cHIuZXhlYyggc2VsZWN0b3IgKSkgKSB7XG5cdFx0XHQvLyBTcGVlZC11cDogU2l6emxlKFwiI0lEXCIpXG5cdFx0XHRpZiAoIChtID0gbWF0Y2hbMV0pICkge1xuXHRcdFx0XHRpZiAoIG5vZGVUeXBlID09PSA5ICkge1xuXHRcdFx0XHRcdGVsZW0gPSBjb250ZXh0LmdldEVsZW1lbnRCeUlkKCBtICk7XG5cdFx0XHRcdFx0Ly8gQ2hlY2sgcGFyZW50Tm9kZSB0byBjYXRjaCB3aGVuIEJsYWNrYmVycnkgNC42IHJldHVybnNcblx0XHRcdFx0XHQvLyBub2RlcyB0aGF0IGFyZSBubyBsb25nZXIgaW4gdGhlIGRvY3VtZW50IChqUXVlcnkgIzY5NjMpXG5cdFx0XHRcdFx0aWYgKCBlbGVtICYmIGVsZW0ucGFyZW50Tm9kZSApIHtcblx0XHRcdFx0XHRcdC8vIEhhbmRsZSB0aGUgY2FzZSB3aGVyZSBJRSwgT3BlcmEsIGFuZCBXZWJraXQgcmV0dXJuIGl0ZW1zXG5cdFx0XHRcdFx0XHQvLyBieSBuYW1lIGluc3RlYWQgb2YgSURcblx0XHRcdFx0XHRcdGlmICggZWxlbS5pZCA9PT0gbSApIHtcblx0XHRcdFx0XHRcdFx0cmVzdWx0cy5wdXNoKCBlbGVtICk7XG5cdFx0XHRcdFx0XHRcdHJldHVybiByZXN1bHRzO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0cztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gQ29udGV4dCBpcyBub3QgYSBkb2N1bWVudFxuXHRcdFx0XHRcdGlmICggY29udGV4dC5vd25lckRvY3VtZW50ICYmIChlbGVtID0gY29udGV4dC5vd25lckRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBtICkpICYmXG5cdFx0XHRcdFx0XHRjb250YWlucyggY29udGV4dCwgZWxlbSApICYmIGVsZW0uaWQgPT09IG0gKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHRzLnB1c2goIGVsZW0gKTtcblx0XHRcdFx0XHRcdHJldHVybiByZXN1bHRzO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHQvLyBTcGVlZC11cDogU2l6emxlKFwiVEFHXCIpXG5cdFx0XHR9IGVsc2UgaWYgKCBtYXRjaFsyXSApIHtcblx0XHRcdFx0cHVzaC5hcHBseSggcmVzdWx0cywgY29udGV4dC5nZXRFbGVtZW50c0J5VGFnTmFtZSggc2VsZWN0b3IgKSApO1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0cztcblxuXHRcdFx0Ly8gU3BlZWQtdXA6IFNpenpsZShcIi5DTEFTU1wiKVxuXHRcdFx0fSBlbHNlIGlmICggKG0gPSBtYXRjaFszXSkgJiYgc3VwcG9ydC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lICYmIGNvbnRleHQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSApIHtcblx0XHRcdFx0cHVzaC5hcHBseSggcmVzdWx0cywgY29udGV4dC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCBtICkgKTtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdHM7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gUVNBIHBhdGhcblx0XHRpZiAoIHN1cHBvcnQucXNhICYmICghcmJ1Z2d5UVNBIHx8ICFyYnVnZ3lRU0EudGVzdCggc2VsZWN0b3IgKSkgKSB7XG5cdFx0XHRuaWQgPSBvbGQgPSBleHBhbmRvO1xuXHRcdFx0bmV3Q29udGV4dCA9IGNvbnRleHQ7XG5cdFx0XHRuZXdTZWxlY3RvciA9IG5vZGVUeXBlID09PSA5ICYmIHNlbGVjdG9yO1xuXG5cdFx0XHQvLyBxU0Egd29ya3Mgc3RyYW5nZWx5IG9uIEVsZW1lbnQtcm9vdGVkIHF1ZXJpZXNcblx0XHRcdC8vIFdlIGNhbiB3b3JrIGFyb3VuZCB0aGlzIGJ5IHNwZWNpZnlpbmcgYW4gZXh0cmEgSUQgb24gdGhlIHJvb3Rcblx0XHRcdC8vIGFuZCB3b3JraW5nIHVwIGZyb20gdGhlcmUgKFRoYW5rcyB0byBBbmRyZXcgRHVwb250IGZvciB0aGUgdGVjaG5pcXVlKVxuXHRcdFx0Ly8gSUUgOCBkb2Vzbid0IHdvcmsgb24gb2JqZWN0IGVsZW1lbnRzXG5cdFx0XHRpZiAoIG5vZGVUeXBlID09PSAxICYmIGNvbnRleHQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSAhPT0gXCJvYmplY3RcIiApIHtcblx0XHRcdFx0Z3JvdXBzID0gdG9rZW5pemUoIHNlbGVjdG9yICk7XG5cblx0XHRcdFx0aWYgKCAob2xkID0gY29udGV4dC5nZXRBdHRyaWJ1dGUoXCJpZFwiKSkgKSB7XG5cdFx0XHRcdFx0bmlkID0gb2xkLnJlcGxhY2UoIHJlc2NhcGUsIFwiXFxcXCQmXCIgKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb250ZXh0LnNldEF0dHJpYnV0ZSggXCJpZFwiLCBuaWQgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRuaWQgPSBcIltpZD0nXCIgKyBuaWQgKyBcIiddIFwiO1xuXG5cdFx0XHRcdGkgPSBncm91cHMubGVuZ3RoO1xuXHRcdFx0XHR3aGlsZSAoIGktLSApIHtcblx0XHRcdFx0XHRncm91cHNbaV0gPSBuaWQgKyB0b1NlbGVjdG9yKCBncm91cHNbaV0gKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRuZXdDb250ZXh0ID0gcnNpYmxpbmcudGVzdCggc2VsZWN0b3IgKSAmJiB0ZXN0Q29udGV4dCggY29udGV4dC5wYXJlbnROb2RlICkgfHwgY29udGV4dDtcblx0XHRcdFx0bmV3U2VsZWN0b3IgPSBncm91cHMuam9pbihcIixcIik7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggbmV3U2VsZWN0b3IgKSB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0cHVzaC5hcHBseSggcmVzdWx0cyxcblx0XHRcdFx0XHRcdG5ld0NvbnRleHQucXVlcnlTZWxlY3RvckFsbCggbmV3U2VsZWN0b3IgKVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3VsdHM7XG5cdFx0XHRcdH0gY2F0Y2gocXNhRXJyb3IpIHtcblx0XHRcdFx0fSBmaW5hbGx5IHtcblx0XHRcdFx0XHRpZiAoICFvbGQgKSB7XG5cdFx0XHRcdFx0XHRjb250ZXh0LnJlbW92ZUF0dHJpYnV0ZShcImlkXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIEFsbCBvdGhlcnNcblx0cmV0dXJuIHNlbGVjdCggc2VsZWN0b3IucmVwbGFjZSggcnRyaW0sIFwiJDFcIiApLCBjb250ZXh0LCByZXN1bHRzLCBzZWVkICk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGtleS12YWx1ZSBjYWNoZXMgb2YgbGltaXRlZCBzaXplXG4gKiBAcmV0dXJucyB7RnVuY3Rpb24oc3RyaW5nLCBPYmplY3QpfSBSZXR1cm5zIHRoZSBPYmplY3QgZGF0YSBhZnRlciBzdG9yaW5nIGl0IG9uIGl0c2VsZiB3aXRoXG4gKlx0cHJvcGVydHkgbmFtZSB0aGUgKHNwYWNlLXN1ZmZpeGVkKSBzdHJpbmcgYW5kIChpZiB0aGUgY2FjaGUgaXMgbGFyZ2VyIHRoYW4gRXhwci5jYWNoZUxlbmd0aClcbiAqXHRkZWxldGluZyB0aGUgb2xkZXN0IGVudHJ5XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUNhY2hlKCkge1xuXHR2YXIga2V5cyA9IFtdO1xuXG5cdGZ1bmN0aW9uIGNhY2hlKCBrZXksIHZhbHVlICkge1xuXHRcdC8vIFVzZSAoa2V5ICsgXCIgXCIpIHRvIGF2b2lkIGNvbGxpc2lvbiB3aXRoIG5hdGl2ZSBwcm90b3R5cGUgcHJvcGVydGllcyAoc2VlIElzc3VlICMxNTcpXG5cdFx0aWYgKCBrZXlzLnB1c2goIGtleSArIFwiIFwiICkgPiBFeHByLmNhY2hlTGVuZ3RoICkge1xuXHRcdFx0Ly8gT25seSBrZWVwIHRoZSBtb3N0IHJlY2VudCBlbnRyaWVzXG5cdFx0XHRkZWxldGUgY2FjaGVbIGtleXMuc2hpZnQoKSBdO1xuXHRcdH1cblx0XHRyZXR1cm4gKGNhY2hlWyBrZXkgKyBcIiBcIiBdID0gdmFsdWUpO1xuXHR9XG5cdHJldHVybiBjYWNoZTtcbn1cblxuLyoqXG4gKiBNYXJrIGEgZnVuY3Rpb24gZm9yIHNwZWNpYWwgdXNlIGJ5IFNpenpsZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIG1hcmtcbiAqL1xuZnVuY3Rpb24gbWFya0Z1bmN0aW9uKCBmbiApIHtcblx0Zm5bIGV4cGFuZG8gXSA9IHRydWU7XG5cdHJldHVybiBmbjtcbn1cblxuLyoqXG4gKiBTdXBwb3J0IHRlc3RpbmcgdXNpbmcgYW4gZWxlbWVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gUGFzc2VkIHRoZSBjcmVhdGVkIGRpdiBhbmQgZXhwZWN0cyBhIGJvb2xlYW4gcmVzdWx0XG4gKi9cbmZ1bmN0aW9uIGFzc2VydCggZm4gKSB7XG5cdHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXG5cdHRyeSB7XG5cdFx0cmV0dXJuICEhZm4oIGRpdiApO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9IGZpbmFsbHkge1xuXHRcdC8vIFJlbW92ZSBmcm9tIGl0cyBwYXJlbnQgYnkgZGVmYXVsdFxuXHRcdGlmICggZGl2LnBhcmVudE5vZGUgKSB7XG5cdFx0XHRkaXYucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCggZGl2ICk7XG5cdFx0fVxuXHRcdC8vIHJlbGVhc2UgbWVtb3J5IGluIElFXG5cdFx0ZGl2ID0gbnVsbDtcblx0fVxufVxuXG4vKipcbiAqIEFkZHMgdGhlIHNhbWUgaGFuZGxlciBmb3IgYWxsIG9mIHRoZSBzcGVjaWZpZWQgYXR0cnNcbiAqIEBwYXJhbSB7U3RyaW5nfSBhdHRycyBQaXBlLXNlcGFyYXRlZCBsaXN0IG9mIGF0dHJpYnV0ZXNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXIgVGhlIG1ldGhvZCB0aGF0IHdpbGwgYmUgYXBwbGllZFxuICovXG5mdW5jdGlvbiBhZGRIYW5kbGUoIGF0dHJzLCBoYW5kbGVyICkge1xuXHR2YXIgYXJyID0gYXR0cnMuc3BsaXQoXCJ8XCIpLFxuXHRcdGkgPSBhdHRycy5sZW5ndGg7XG5cblx0d2hpbGUgKCBpLS0gKSB7XG5cdFx0RXhwci5hdHRySGFuZGxlWyBhcnJbaV0gXSA9IGhhbmRsZXI7XG5cdH1cbn1cblxuLyoqXG4gKiBDaGVja3MgZG9jdW1lbnQgb3JkZXIgb2YgdHdvIHNpYmxpbmdzXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGFcbiAqIEBwYXJhbSB7RWxlbWVudH0gYlxuICogQHJldHVybnMge051bWJlcn0gUmV0dXJucyBsZXNzIHRoYW4gMCBpZiBhIHByZWNlZGVzIGIsIGdyZWF0ZXIgdGhhbiAwIGlmIGEgZm9sbG93cyBiXG4gKi9cbmZ1bmN0aW9uIHNpYmxpbmdDaGVjayggYSwgYiApIHtcblx0dmFyIGN1ciA9IGIgJiYgYSxcblx0XHRkaWZmID0gY3VyICYmIGEubm9kZVR5cGUgPT09IDEgJiYgYi5ub2RlVHlwZSA9PT0gMSAmJlxuXHRcdFx0KCB+Yi5zb3VyY2VJbmRleCB8fCBNQVhfTkVHQVRJVkUgKSAtXG5cdFx0XHQoIH5hLnNvdXJjZUluZGV4IHx8IE1BWF9ORUdBVElWRSApO1xuXG5cdC8vIFVzZSBJRSBzb3VyY2VJbmRleCBpZiBhdmFpbGFibGUgb24gYm90aCBub2Rlc1xuXHRpZiAoIGRpZmYgKSB7XG5cdFx0cmV0dXJuIGRpZmY7XG5cdH1cblxuXHQvLyBDaGVjayBpZiBiIGZvbGxvd3MgYVxuXHRpZiAoIGN1ciApIHtcblx0XHR3aGlsZSAoIChjdXIgPSBjdXIubmV4dFNpYmxpbmcpICkge1xuXHRcdFx0aWYgKCBjdXIgPT09IGIgKSB7XG5cdFx0XHRcdHJldHVybiAtMTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gYSA/IDEgOiAtMTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZnVuY3Rpb24gdG8gdXNlIGluIHBzZXVkb3MgZm9yIGlucHV0IHR5cGVzXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICovXG5mdW5jdGlvbiBjcmVhdGVJbnB1dFBzZXVkbyggdHlwZSApIHtcblx0cmV0dXJuIGZ1bmN0aW9uKCBlbGVtICkge1xuXHRcdHZhciBuYW1lID0gZWxlbS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuXHRcdHJldHVybiBuYW1lID09PSBcImlucHV0XCIgJiYgZWxlbS50eXBlID09PSB0eXBlO1xuXHR9O1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBmdW5jdGlvbiB0byB1c2UgaW4gcHNldWRvcyBmb3IgYnV0dG9uc1xuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqL1xuZnVuY3Rpb24gY3JlYXRlQnV0dG9uUHNldWRvKCB0eXBlICkge1xuXHRyZXR1cm4gZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0dmFyIG5hbWUgPSBlbGVtLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG5cdFx0cmV0dXJuIChuYW1lID09PSBcImlucHV0XCIgfHwgbmFtZSA9PT0gXCJidXR0b25cIikgJiYgZWxlbS50eXBlID09PSB0eXBlO1xuXHR9O1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBmdW5jdGlvbiB0byB1c2UgaW4gcHNldWRvcyBmb3IgcG9zaXRpb25hbHNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVBvc2l0aW9uYWxQc2V1ZG8oIGZuICkge1xuXHRyZXR1cm4gbWFya0Z1bmN0aW9uKGZ1bmN0aW9uKCBhcmd1bWVudCApIHtcblx0XHRhcmd1bWVudCA9ICthcmd1bWVudDtcblx0XHRyZXR1cm4gbWFya0Z1bmN0aW9uKGZ1bmN0aW9uKCBzZWVkLCBtYXRjaGVzICkge1xuXHRcdFx0dmFyIGosXG5cdFx0XHRcdG1hdGNoSW5kZXhlcyA9IGZuKCBbXSwgc2VlZC5sZW5ndGgsIGFyZ3VtZW50ICksXG5cdFx0XHRcdGkgPSBtYXRjaEluZGV4ZXMubGVuZ3RoO1xuXG5cdFx0XHQvLyBNYXRjaCBlbGVtZW50cyBmb3VuZCBhdCB0aGUgc3BlY2lmaWVkIGluZGV4ZXNcblx0XHRcdHdoaWxlICggaS0tICkge1xuXHRcdFx0XHRpZiAoIHNlZWRbIChqID0gbWF0Y2hJbmRleGVzW2ldKSBdICkge1xuXHRcdFx0XHRcdHNlZWRbal0gPSAhKG1hdGNoZXNbal0gPSBzZWVkW2pdKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBDaGVja3MgYSBub2RlIGZvciB2YWxpZGl0eSBhcyBhIFNpenpsZSBjb250ZXh0XG4gKiBAcGFyYW0ge0VsZW1lbnR8T2JqZWN0PX0gY29udGV4dFxuICogQHJldHVybnMge0VsZW1lbnR8T2JqZWN0fEJvb2xlYW59IFRoZSBpbnB1dCBub2RlIGlmIGFjY2VwdGFibGUsIG90aGVyd2lzZSBhIGZhbHN5IHZhbHVlXG4gKi9cbmZ1bmN0aW9uIHRlc3RDb250ZXh0KCBjb250ZXh0ICkge1xuXHRyZXR1cm4gY29udGV4dCAmJiB0eXBlb2YgY29udGV4dC5nZXRFbGVtZW50c0J5VGFnTmFtZSAhPT0gc3RydW5kZWZpbmVkICYmIGNvbnRleHQ7XG59XG5cbi8vIEV4cG9zZSBzdXBwb3J0IHZhcnMgZm9yIGNvbnZlbmllbmNlXG5zdXBwb3J0ID0gU2l6emxlLnN1cHBvcnQgPSB7fTtcblxuLyoqXG4gKiBEZXRlY3RzIFhNTCBub2Rlc1xuICogQHBhcmFtIHtFbGVtZW50fE9iamVjdH0gZWxlbSBBbiBlbGVtZW50IG9yIGEgZG9jdW1lbnRcbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmZiBlbGVtIGlzIGEgbm9uLUhUTUwgWE1MIG5vZGVcbiAqL1xuaXNYTUwgPSBTaXp6bGUuaXNYTUwgPSBmdW5jdGlvbiggZWxlbSApIHtcblx0Ly8gZG9jdW1lbnRFbGVtZW50IGlzIHZlcmlmaWVkIGZvciBjYXNlcyB3aGVyZSBpdCBkb2Vzbid0IHlldCBleGlzdFxuXHQvLyAoc3VjaCBhcyBsb2FkaW5nIGlmcmFtZXMgaW4gSUUgLSAjNDgzMylcblx0dmFyIGRvY3VtZW50RWxlbWVudCA9IGVsZW0gJiYgKGVsZW0ub3duZXJEb2N1bWVudCB8fCBlbGVtKS5kb2N1bWVudEVsZW1lbnQ7XG5cdHJldHVybiBkb2N1bWVudEVsZW1lbnQgPyBkb2N1bWVudEVsZW1lbnQubm9kZU5hbWUgIT09IFwiSFRNTFwiIDogZmFsc2U7XG59O1xuXG4vKipcbiAqIFNldHMgZG9jdW1lbnQtcmVsYXRlZCB2YXJpYWJsZXMgb25jZSBiYXNlZCBvbiB0aGUgY3VycmVudCBkb2N1bWVudFxuICogQHBhcmFtIHtFbGVtZW50fE9iamVjdH0gW2RvY10gQW4gZWxlbWVudCBvciBkb2N1bWVudCBvYmplY3QgdG8gdXNlIHRvIHNldCB0aGUgZG9jdW1lbnRcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGN1cnJlbnQgZG9jdW1lbnRcbiAqL1xuc2V0RG9jdW1lbnQgPSBTaXp6bGUuc2V0RG9jdW1lbnQgPSBmdW5jdGlvbiggbm9kZSApIHtcblx0dmFyIGhhc0NvbXBhcmUsXG5cdFx0ZG9jID0gbm9kZSA/IG5vZGUub3duZXJEb2N1bWVudCB8fCBub2RlIDogcHJlZmVycmVkRG9jLFxuXHRcdHBhcmVudCA9IGRvYy5kZWZhdWx0VmlldztcblxuXHQvLyBJZiBubyBkb2N1bWVudCBhbmQgZG9jdW1lbnRFbGVtZW50IGlzIGF2YWlsYWJsZSwgcmV0dXJuXG5cdGlmICggZG9jID09PSBkb2N1bWVudCB8fCBkb2Mubm9kZVR5cGUgIT09IDkgfHwgIWRvYy5kb2N1bWVudEVsZW1lbnQgKSB7XG5cdFx0cmV0dXJuIGRvY3VtZW50O1xuXHR9XG5cblx0Ly8gU2V0IG91ciBkb2N1bWVudFxuXHRkb2N1bWVudCA9IGRvYztcblx0ZG9jRWxlbSA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XG5cblx0Ly8gU3VwcG9ydCB0ZXN0c1xuXHRkb2N1bWVudElzSFRNTCA9ICFpc1hNTCggZG9jICk7XG5cblx0Ly8gU3VwcG9ydDogSUU+OFxuXHQvLyBJZiBpZnJhbWUgZG9jdW1lbnQgaXMgYXNzaWduZWQgdG8gXCJkb2N1bWVudFwiIHZhcmlhYmxlIGFuZCBpZiBpZnJhbWUgaGFzIGJlZW4gcmVsb2FkZWQsXG5cdC8vIElFIHdpbGwgdGhyb3cgXCJwZXJtaXNzaW9uIGRlbmllZFwiIGVycm9yIHdoZW4gYWNjZXNzaW5nIFwiZG9jdW1lbnRcIiB2YXJpYWJsZSwgc2VlIGpRdWVyeSAjMTM5MzZcblx0Ly8gSUU2LTggZG8gbm90IHN1cHBvcnQgdGhlIGRlZmF1bHRWaWV3IHByb3BlcnR5IHNvIHBhcmVudCB3aWxsIGJlIHVuZGVmaW5lZFxuXHRpZiAoIHBhcmVudCAmJiBwYXJlbnQgIT09IHBhcmVudC50b3AgKSB7XG5cdFx0Ly8gSUUxMSBkb2VzIG5vdCBoYXZlIGF0dGFjaEV2ZW50LCBzbyBhbGwgbXVzdCBzdWZmZXJcblx0XHRpZiAoIHBhcmVudC5hZGRFdmVudExpc3RlbmVyICkge1xuXHRcdFx0cGFyZW50LmFkZEV2ZW50TGlzdGVuZXIoIFwidW5sb2FkXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRzZXREb2N1bWVudCgpO1xuXHRcdFx0fSwgZmFsc2UgKTtcblx0XHR9IGVsc2UgaWYgKCBwYXJlbnQuYXR0YWNoRXZlbnQgKSB7XG5cdFx0XHRwYXJlbnQuYXR0YWNoRXZlbnQoIFwib251bmxvYWRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHNldERvY3VtZW50KCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHQvKiBBdHRyaWJ1dGVzXG5cdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuXHQvLyBTdXBwb3J0OiBJRTw4XG5cdC8vIFZlcmlmeSB0aGF0IGdldEF0dHJpYnV0ZSByZWFsbHkgcmV0dXJucyBhdHRyaWJ1dGVzIGFuZCBub3QgcHJvcGVydGllcyAoZXhjZXB0aW5nIElFOCBib29sZWFucylcblx0c3VwcG9ydC5hdHRyaWJ1dGVzID0gYXNzZXJ0KGZ1bmN0aW9uKCBkaXYgKSB7XG5cdFx0ZGl2LmNsYXNzTmFtZSA9IFwiaVwiO1xuXHRcdHJldHVybiAhZGl2LmdldEF0dHJpYnV0ZShcImNsYXNzTmFtZVwiKTtcblx0fSk7XG5cblx0LyogZ2V0RWxlbWVudChzKUJ5KlxuXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cblx0Ly8gQ2hlY2sgaWYgZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCIqXCIpIHJldHVybnMgb25seSBlbGVtZW50c1xuXHRzdXBwb3J0LmdldEVsZW1lbnRzQnlUYWdOYW1lID0gYXNzZXJ0KGZ1bmN0aW9uKCBkaXYgKSB7XG5cdFx0ZGl2LmFwcGVuZENoaWxkKCBkb2MuY3JlYXRlQ29tbWVudChcIlwiKSApO1xuXHRcdHJldHVybiAhZGl2LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiKlwiKS5sZW5ndGg7XG5cdH0pO1xuXG5cdC8vIENoZWNrIGlmIGdldEVsZW1lbnRzQnlDbGFzc05hbWUgY2FuIGJlIHRydXN0ZWRcblx0c3VwcG9ydC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lID0gcm5hdGl2ZS50ZXN0KCBkb2MuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSApICYmIGFzc2VydChmdW5jdGlvbiggZGl2ICkge1xuXHRcdGRpdi5pbm5lckhUTUwgPSBcIjxkaXYgY2xhc3M9J2EnPjwvZGl2PjxkaXYgY2xhc3M9J2EgaSc+PC9kaXY+XCI7XG5cblx0XHQvLyBTdXBwb3J0OiBTYWZhcmk8NFxuXHRcdC8vIENhdGNoIGNsYXNzIG92ZXItY2FjaGluZ1xuXHRcdGRpdi5maXJzdENoaWxkLmNsYXNzTmFtZSA9IFwiaVwiO1xuXHRcdC8vIFN1cHBvcnQ6IE9wZXJhPDEwXG5cdFx0Ly8gQ2F0Y2ggZ0VCQ04gZmFpbHVyZSB0byBmaW5kIG5vbi1sZWFkaW5nIGNsYXNzZXNcblx0XHRyZXR1cm4gZGl2LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJpXCIpLmxlbmd0aCA9PT0gMjtcblx0fSk7XG5cblx0Ly8gU3VwcG9ydDogSUU8MTBcblx0Ly8gQ2hlY2sgaWYgZ2V0RWxlbWVudEJ5SWQgcmV0dXJucyBlbGVtZW50cyBieSBuYW1lXG5cdC8vIFRoZSBicm9rZW4gZ2V0RWxlbWVudEJ5SWQgbWV0aG9kcyBkb24ndCBwaWNrIHVwIHByb2dyYW1hdGljYWxseS1zZXQgbmFtZXMsXG5cdC8vIHNvIHVzZSBhIHJvdW5kYWJvdXQgZ2V0RWxlbWVudHNCeU5hbWUgdGVzdFxuXHRzdXBwb3J0LmdldEJ5SWQgPSBhc3NlcnQoZnVuY3Rpb24oIGRpdiApIHtcblx0XHRkb2NFbGVtLmFwcGVuZENoaWxkKCBkaXYgKS5pZCA9IGV4cGFuZG87XG5cdFx0cmV0dXJuICFkb2MuZ2V0RWxlbWVudHNCeU5hbWUgfHwgIWRvYy5nZXRFbGVtZW50c0J5TmFtZSggZXhwYW5kbyApLmxlbmd0aDtcblx0fSk7XG5cblx0Ly8gSUQgZmluZCBhbmQgZmlsdGVyXG5cdGlmICggc3VwcG9ydC5nZXRCeUlkICkge1xuXHRcdEV4cHIuZmluZFtcIklEXCJdID0gZnVuY3Rpb24oIGlkLCBjb250ZXh0ICkge1xuXHRcdFx0aWYgKCB0eXBlb2YgY29udGV4dC5nZXRFbGVtZW50QnlJZCAhPT0gc3RydW5kZWZpbmVkICYmIGRvY3VtZW50SXNIVE1MICkge1xuXHRcdFx0XHR2YXIgbSA9IGNvbnRleHQuZ2V0RWxlbWVudEJ5SWQoIGlkICk7XG5cdFx0XHRcdC8vIENoZWNrIHBhcmVudE5vZGUgdG8gY2F0Y2ggd2hlbiBCbGFja2JlcnJ5IDQuNiByZXR1cm5zXG5cdFx0XHRcdC8vIG5vZGVzIHRoYXQgYXJlIG5vIGxvbmdlciBpbiB0aGUgZG9jdW1lbnQgIzY5NjNcblx0XHRcdFx0cmV0dXJuIG0gJiYgbS5wYXJlbnROb2RlID8gW21dIDogW107XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRFeHByLmZpbHRlcltcIklEXCJdID0gZnVuY3Rpb24oIGlkICkge1xuXHRcdFx0dmFyIGF0dHJJZCA9IGlkLnJlcGxhY2UoIHJ1bmVzY2FwZSwgZnVuZXNjYXBlICk7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0XHRcdHJldHVybiBlbGVtLmdldEF0dHJpYnV0ZShcImlkXCIpID09PSBhdHRySWQ7XG5cdFx0XHR9O1xuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0Ly8gU3VwcG9ydDogSUU2Lzdcblx0XHQvLyBnZXRFbGVtZW50QnlJZCBpcyBub3QgcmVsaWFibGUgYXMgYSBmaW5kIHNob3J0Y3V0XG5cdFx0ZGVsZXRlIEV4cHIuZmluZFtcIklEXCJdO1xuXG5cdFx0RXhwci5maWx0ZXJbXCJJRFwiXSA9ICBmdW5jdGlvbiggaWQgKSB7XG5cdFx0XHR2YXIgYXR0cklkID0gaWQucmVwbGFjZSggcnVuZXNjYXBlLCBmdW5lc2NhcGUgKTtcblx0XHRcdHJldHVybiBmdW5jdGlvbiggZWxlbSApIHtcblx0XHRcdFx0dmFyIG5vZGUgPSB0eXBlb2YgZWxlbS5nZXRBdHRyaWJ1dGVOb2RlICE9PSBzdHJ1bmRlZmluZWQgJiYgZWxlbS5nZXRBdHRyaWJ1dGVOb2RlKFwiaWRcIik7XG5cdFx0XHRcdHJldHVybiBub2RlICYmIG5vZGUudmFsdWUgPT09IGF0dHJJZDtcblx0XHRcdH07XG5cdFx0fTtcblx0fVxuXG5cdC8vIFRhZ1xuXHRFeHByLmZpbmRbXCJUQUdcIl0gPSBzdXBwb3J0LmdldEVsZW1lbnRzQnlUYWdOYW1lID9cblx0XHRmdW5jdGlvbiggdGFnLCBjb250ZXh0ICkge1xuXHRcdFx0aWYgKCB0eXBlb2YgY29udGV4dC5nZXRFbGVtZW50c0J5VGFnTmFtZSAhPT0gc3RydW5kZWZpbmVkICkge1xuXHRcdFx0XHRyZXR1cm4gY29udGV4dC5nZXRFbGVtZW50c0J5VGFnTmFtZSggdGFnICk7XG5cdFx0XHR9XG5cdFx0fSA6XG5cdFx0ZnVuY3Rpb24oIHRhZywgY29udGV4dCApIHtcblx0XHRcdHZhciBlbGVtLFxuXHRcdFx0XHR0bXAgPSBbXSxcblx0XHRcdFx0aSA9IDAsXG5cdFx0XHRcdHJlc3VsdHMgPSBjb250ZXh0LmdldEVsZW1lbnRzQnlUYWdOYW1lKCB0YWcgKTtcblxuXHRcdFx0Ly8gRmlsdGVyIG91dCBwb3NzaWJsZSBjb21tZW50c1xuXHRcdFx0aWYgKCB0YWcgPT09IFwiKlwiICkge1xuXHRcdFx0XHR3aGlsZSAoIChlbGVtID0gcmVzdWx0c1tpKytdKSApIHtcblx0XHRcdFx0XHRpZiAoIGVsZW0ubm9kZVR5cGUgPT09IDEgKSB7XG5cdFx0XHRcdFx0XHR0bXAucHVzaCggZWxlbSApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiB0bXA7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcmVzdWx0cztcblx0XHR9O1xuXG5cdC8vIENsYXNzXG5cdEV4cHIuZmluZFtcIkNMQVNTXCJdID0gc3VwcG9ydC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lICYmIGZ1bmN0aW9uKCBjbGFzc05hbWUsIGNvbnRleHQgKSB7XG5cdFx0aWYgKCB0eXBlb2YgY29udGV4dC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lICE9PSBzdHJ1bmRlZmluZWQgJiYgZG9jdW1lbnRJc0hUTUwgKSB7XG5cdFx0XHRyZXR1cm4gY29udGV4dC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCBjbGFzc05hbWUgKTtcblx0XHR9XG5cdH07XG5cblx0LyogUVNBL21hdGNoZXNTZWxlY3RvclxuXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cblx0Ly8gUVNBIGFuZCBtYXRjaGVzU2VsZWN0b3Igc3VwcG9ydFxuXG5cdC8vIG1hdGNoZXNTZWxlY3Rvcig6YWN0aXZlKSByZXBvcnRzIGZhbHNlIHdoZW4gdHJ1ZSAoSUU5L09wZXJhIDExLjUpXG5cdHJidWdneU1hdGNoZXMgPSBbXTtcblxuXHQvLyBxU2EoOmZvY3VzKSByZXBvcnRzIGZhbHNlIHdoZW4gdHJ1ZSAoQ2hyb21lIDIxKVxuXHQvLyBXZSBhbGxvdyB0aGlzIGJlY2F1c2Ugb2YgYSBidWcgaW4gSUU4LzkgdGhhdCB0aHJvd3MgYW4gZXJyb3Jcblx0Ly8gd2hlbmV2ZXIgYGRvY3VtZW50LmFjdGl2ZUVsZW1lbnRgIGlzIGFjY2Vzc2VkIG9uIGFuIGlmcmFtZVxuXHQvLyBTbywgd2UgYWxsb3cgOmZvY3VzIHRvIHBhc3MgdGhyb3VnaCBRU0EgYWxsIHRoZSB0aW1lIHRvIGF2b2lkIHRoZSBJRSBlcnJvclxuXHQvLyBTZWUgaHR0cDovL2J1Z3MuanF1ZXJ5LmNvbS90aWNrZXQvMTMzNzhcblx0cmJ1Z2d5UVNBID0gW107XG5cblx0aWYgKCAoc3VwcG9ydC5xc2EgPSBybmF0aXZlLnRlc3QoIGRvYy5xdWVyeVNlbGVjdG9yQWxsICkpICkge1xuXHRcdC8vIEJ1aWxkIFFTQSByZWdleFxuXHRcdC8vIFJlZ2V4IHN0cmF0ZWd5IGFkb3B0ZWQgZnJvbSBEaWVnbyBQZXJpbmlcblx0XHRhc3NlcnQoZnVuY3Rpb24oIGRpdiApIHtcblx0XHRcdC8vIFNlbGVjdCBpcyBzZXQgdG8gZW1wdHkgc3RyaW5nIG9uIHB1cnBvc2Vcblx0XHRcdC8vIFRoaXMgaXMgdG8gdGVzdCBJRSdzIHRyZWF0bWVudCBvZiBub3QgZXhwbGljaXRseVxuXHRcdFx0Ly8gc2V0dGluZyBhIGJvb2xlYW4gY29udGVudCBhdHRyaWJ1dGUsXG5cdFx0XHQvLyBzaW5jZSBpdHMgcHJlc2VuY2Ugc2hvdWxkIGJlIGVub3VnaFxuXHRcdFx0Ly8gaHR0cDovL2J1Z3MuanF1ZXJ5LmNvbS90aWNrZXQvMTIzNTlcblx0XHRcdGRpdi5pbm5lckhUTUwgPSBcIjxzZWxlY3QgdD0nJz48b3B0aW9uIHNlbGVjdGVkPScnPjwvb3B0aW9uPjwvc2VsZWN0PlwiO1xuXG5cdFx0XHQvLyBTdXBwb3J0OiBJRTgsIE9wZXJhIDEwLTEyXG5cdFx0XHQvLyBOb3RoaW5nIHNob3VsZCBiZSBzZWxlY3RlZCB3aGVuIGVtcHR5IHN0cmluZ3MgZm9sbG93IF49IG9yICQ9IG9yICo9XG5cdFx0XHRpZiAoIGRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiW3RePScnXVwiKS5sZW5ndGggKSB7XG5cdFx0XHRcdHJidWdneVFTQS5wdXNoKCBcIlsqXiRdPVwiICsgd2hpdGVzcGFjZSArIFwiKig/OicnfFxcXCJcXFwiKVwiICk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFN1cHBvcnQ6IElFOFxuXHRcdFx0Ly8gQm9vbGVhbiBhdHRyaWJ1dGVzIGFuZCBcInZhbHVlXCIgYXJlIG5vdCB0cmVhdGVkIGNvcnJlY3RseVxuXHRcdFx0aWYgKCAhZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCJbc2VsZWN0ZWRdXCIpLmxlbmd0aCApIHtcblx0XHRcdFx0cmJ1Z2d5UVNBLnB1c2goIFwiXFxcXFtcIiArIHdoaXRlc3BhY2UgKyBcIiooPzp2YWx1ZXxcIiArIGJvb2xlYW5zICsgXCIpXCIgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gV2Via2l0L09wZXJhIC0gOmNoZWNrZWQgc2hvdWxkIHJldHVybiBzZWxlY3RlZCBvcHRpb24gZWxlbWVudHNcblx0XHRcdC8vIGh0dHA6Ly93d3cudzMub3JnL1RSLzIwMTEvUkVDLWNzczMtc2VsZWN0b3JzLTIwMTEwOTI5LyNjaGVja2VkXG5cdFx0XHQvLyBJRTggdGhyb3dzIGVycm9yIGhlcmUgYW5kIHdpbGwgbm90IHNlZSBsYXRlciB0ZXN0c1xuXHRcdFx0aWYgKCAhZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCI6Y2hlY2tlZFwiKS5sZW5ndGggKSB7XG5cdFx0XHRcdHJidWdneVFTQS5wdXNoKFwiOmNoZWNrZWRcIik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRhc3NlcnQoZnVuY3Rpb24oIGRpdiApIHtcblx0XHRcdC8vIFN1cHBvcnQ6IFdpbmRvd3MgOCBOYXRpdmUgQXBwc1xuXHRcdFx0Ly8gVGhlIHR5cGUgYW5kIG5hbWUgYXR0cmlidXRlcyBhcmUgcmVzdHJpY3RlZCBkdXJpbmcgLmlubmVySFRNTCBhc3NpZ25tZW50XG5cdFx0XHR2YXIgaW5wdXQgPSBkb2MuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuXHRcdFx0aW5wdXQuc2V0QXR0cmlidXRlKCBcInR5cGVcIiwgXCJoaWRkZW5cIiApO1xuXHRcdFx0ZGl2LmFwcGVuZENoaWxkKCBpbnB1dCApLnNldEF0dHJpYnV0ZSggXCJuYW1lXCIsIFwiRFwiICk7XG5cblx0XHRcdC8vIFN1cHBvcnQ6IElFOFxuXHRcdFx0Ly8gRW5mb3JjZSBjYXNlLXNlbnNpdGl2aXR5IG9mIG5hbWUgYXR0cmlidXRlXG5cdFx0XHRpZiAoIGRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiW25hbWU9ZF1cIikubGVuZ3RoICkge1xuXHRcdFx0XHRyYnVnZ3lRU0EucHVzaCggXCJuYW1lXCIgKyB3aGl0ZXNwYWNlICsgXCIqWypeJHwhfl0/PVwiICk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEZGIDMuNSAtIDplbmFibGVkLzpkaXNhYmxlZCBhbmQgaGlkZGVuIGVsZW1lbnRzIChoaWRkZW4gZWxlbWVudHMgYXJlIHN0aWxsIGVuYWJsZWQpXG5cdFx0XHQvLyBJRTggdGhyb3dzIGVycm9yIGhlcmUgYW5kIHdpbGwgbm90IHNlZSBsYXRlciB0ZXN0c1xuXHRcdFx0aWYgKCAhZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCI6ZW5hYmxlZFwiKS5sZW5ndGggKSB7XG5cdFx0XHRcdHJidWdneVFTQS5wdXNoKCBcIjplbmFibGVkXCIsIFwiOmRpc2FibGVkXCIgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gT3BlcmEgMTAtMTEgZG9lcyBub3QgdGhyb3cgb24gcG9zdC1jb21tYSBpbnZhbGlkIHBzZXVkb3Ncblx0XHRcdGRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiKiw6eFwiKTtcblx0XHRcdHJidWdneVFTQS5wdXNoKFwiLC4qOlwiKTtcblx0XHR9KTtcblx0fVxuXG5cdGlmICggKHN1cHBvcnQubWF0Y2hlc1NlbGVjdG9yID0gcm5hdGl2ZS50ZXN0KCAobWF0Y2hlcyA9IGRvY0VsZW0ud2Via2l0TWF0Y2hlc1NlbGVjdG9yIHx8XG5cdFx0ZG9jRWxlbS5tb3pNYXRjaGVzU2VsZWN0b3IgfHxcblx0XHRkb2NFbGVtLm9NYXRjaGVzU2VsZWN0b3IgfHxcblx0XHRkb2NFbGVtLm1zTWF0Y2hlc1NlbGVjdG9yKSApKSApIHtcblxuXHRcdGFzc2VydChmdW5jdGlvbiggZGl2ICkge1xuXHRcdFx0Ly8gQ2hlY2sgdG8gc2VlIGlmIGl0J3MgcG9zc2libGUgdG8gZG8gbWF0Y2hlc1NlbGVjdG9yXG5cdFx0XHQvLyBvbiBhIGRpc2Nvbm5lY3RlZCBub2RlIChJRSA5KVxuXHRcdFx0c3VwcG9ydC5kaXNjb25uZWN0ZWRNYXRjaCA9IG1hdGNoZXMuY2FsbCggZGl2LCBcImRpdlwiICk7XG5cblx0XHRcdC8vIFRoaXMgc2hvdWxkIGZhaWwgd2l0aCBhbiBleGNlcHRpb25cblx0XHRcdC8vIEdlY2tvIGRvZXMgbm90IGVycm9yLCByZXR1cm5zIGZhbHNlIGluc3RlYWRcblx0XHRcdG1hdGNoZXMuY2FsbCggZGl2LCBcIltzIT0nJ106eFwiICk7XG5cdFx0XHRyYnVnZ3lNYXRjaGVzLnB1c2goIFwiIT1cIiwgcHNldWRvcyApO1xuXHRcdH0pO1xuXHR9XG5cblx0cmJ1Z2d5UVNBID0gcmJ1Z2d5UVNBLmxlbmd0aCAmJiBuZXcgUmVnRXhwKCByYnVnZ3lRU0Euam9pbihcInxcIikgKTtcblx0cmJ1Z2d5TWF0Y2hlcyA9IHJidWdneU1hdGNoZXMubGVuZ3RoICYmIG5ldyBSZWdFeHAoIHJidWdneU1hdGNoZXMuam9pbihcInxcIikgKTtcblxuXHQvKiBDb250YWluc1xuXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cdGhhc0NvbXBhcmUgPSBybmF0aXZlLnRlc3QoIGRvY0VsZW0uY29tcGFyZURvY3VtZW50UG9zaXRpb24gKTtcblxuXHQvLyBFbGVtZW50IGNvbnRhaW5zIGFub3RoZXJcblx0Ly8gUHVycG9zZWZ1bGx5IGRvZXMgbm90IGltcGxlbWVudCBpbmNsdXNpdmUgZGVzY2VuZGVudFxuXHQvLyBBcyBpbiwgYW4gZWxlbWVudCBkb2VzIG5vdCBjb250YWluIGl0c2VsZlxuXHRjb250YWlucyA9IGhhc0NvbXBhcmUgfHwgcm5hdGl2ZS50ZXN0KCBkb2NFbGVtLmNvbnRhaW5zICkgP1xuXHRcdGZ1bmN0aW9uKCBhLCBiICkge1xuXHRcdFx0dmFyIGFkb3duID0gYS5ub2RlVHlwZSA9PT0gOSA/IGEuZG9jdW1lbnRFbGVtZW50IDogYSxcblx0XHRcdFx0YnVwID0gYiAmJiBiLnBhcmVudE5vZGU7XG5cdFx0XHRyZXR1cm4gYSA9PT0gYnVwIHx8ICEhKCBidXAgJiYgYnVwLm5vZGVUeXBlID09PSAxICYmIChcblx0XHRcdFx0YWRvd24uY29udGFpbnMgP1xuXHRcdFx0XHRcdGFkb3duLmNvbnRhaW5zKCBidXAgKSA6XG5cdFx0XHRcdFx0YS5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbiAmJiBhLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKCBidXAgKSAmIDE2XG5cdFx0XHQpKTtcblx0XHR9IDpcblx0XHRmdW5jdGlvbiggYSwgYiApIHtcblx0XHRcdGlmICggYiApIHtcblx0XHRcdFx0d2hpbGUgKCAoYiA9IGIucGFyZW50Tm9kZSkgKSB7XG5cdFx0XHRcdFx0aWYgKCBiID09PSBhICkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fTtcblxuXHQvKiBTb3J0aW5nXG5cdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuXHQvLyBEb2N1bWVudCBvcmRlciBzb3J0aW5nXG5cdHNvcnRPcmRlciA9IGhhc0NvbXBhcmUgP1xuXHRmdW5jdGlvbiggYSwgYiApIHtcblxuXHRcdC8vIEZsYWcgZm9yIGR1cGxpY2F0ZSByZW1vdmFsXG5cdFx0aWYgKCBhID09PSBiICkge1xuXHRcdFx0aGFzRHVwbGljYXRlID0gdHJ1ZTtcblx0XHRcdHJldHVybiAwO1xuXHRcdH1cblxuXHRcdC8vIFNvcnQgb24gbWV0aG9kIGV4aXN0ZW5jZSBpZiBvbmx5IG9uZSBpbnB1dCBoYXMgY29tcGFyZURvY3VtZW50UG9zaXRpb25cblx0XHR2YXIgY29tcGFyZSA9ICFhLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uIC0gIWIuY29tcGFyZURvY3VtZW50UG9zaXRpb247XG5cdFx0aWYgKCBjb21wYXJlICkge1xuXHRcdFx0cmV0dXJuIGNvbXBhcmU7XG5cdFx0fVxuXG5cdFx0Ly8gQ2FsY3VsYXRlIHBvc2l0aW9uIGlmIGJvdGggaW5wdXRzIGJlbG9uZyB0byB0aGUgc2FtZSBkb2N1bWVudFxuXHRcdGNvbXBhcmUgPSAoIGEub3duZXJEb2N1bWVudCB8fCBhICkgPT09ICggYi5vd25lckRvY3VtZW50IHx8IGIgKSA/XG5cdFx0XHRhLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKCBiICkgOlxuXG5cdFx0XHQvLyBPdGhlcndpc2Ugd2Uga25vdyB0aGV5IGFyZSBkaXNjb25uZWN0ZWRcblx0XHRcdDE7XG5cblx0XHQvLyBEaXNjb25uZWN0ZWQgbm9kZXNcblx0XHRpZiAoIGNvbXBhcmUgJiAxIHx8XG5cdFx0XHQoIXN1cHBvcnQuc29ydERldGFjaGVkICYmIGIuY29tcGFyZURvY3VtZW50UG9zaXRpb24oIGEgKSA9PT0gY29tcGFyZSkgKSB7XG5cblx0XHRcdC8vIENob29zZSB0aGUgZmlyc3QgZWxlbWVudCB0aGF0IGlzIHJlbGF0ZWQgdG8gb3VyIHByZWZlcnJlZCBkb2N1bWVudFxuXHRcdFx0aWYgKCBhID09PSBkb2MgfHwgYS5vd25lckRvY3VtZW50ID09PSBwcmVmZXJyZWREb2MgJiYgY29udGFpbnMocHJlZmVycmVkRG9jLCBhKSApIHtcblx0XHRcdFx0cmV0dXJuIC0xO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCBiID09PSBkb2MgfHwgYi5vd25lckRvY3VtZW50ID09PSBwcmVmZXJyZWREb2MgJiYgY29udGFpbnMocHJlZmVycmVkRG9jLCBiKSApIHtcblx0XHRcdFx0cmV0dXJuIDE7XG5cdFx0XHR9XG5cblx0XHRcdC8vIE1haW50YWluIG9yaWdpbmFsIG9yZGVyXG5cdFx0XHRyZXR1cm4gc29ydElucHV0ID9cblx0XHRcdFx0KCBpbmRleE9mLmNhbGwoIHNvcnRJbnB1dCwgYSApIC0gaW5kZXhPZi5jYWxsKCBzb3J0SW5wdXQsIGIgKSApIDpcblx0XHRcdFx0MDtcblx0XHR9XG5cblx0XHRyZXR1cm4gY29tcGFyZSAmIDQgPyAtMSA6IDE7XG5cdH0gOlxuXHRmdW5jdGlvbiggYSwgYiApIHtcblx0XHQvLyBFeGl0IGVhcmx5IGlmIHRoZSBub2RlcyBhcmUgaWRlbnRpY2FsXG5cdFx0aWYgKCBhID09PSBiICkge1xuXHRcdFx0aGFzRHVwbGljYXRlID0gdHJ1ZTtcblx0XHRcdHJldHVybiAwO1xuXHRcdH1cblxuXHRcdHZhciBjdXIsXG5cdFx0XHRpID0gMCxcblx0XHRcdGF1cCA9IGEucGFyZW50Tm9kZSxcblx0XHRcdGJ1cCA9IGIucGFyZW50Tm9kZSxcblx0XHRcdGFwID0gWyBhIF0sXG5cdFx0XHRicCA9IFsgYiBdO1xuXG5cdFx0Ly8gUGFyZW50bGVzcyBub2RlcyBhcmUgZWl0aGVyIGRvY3VtZW50cyBvciBkaXNjb25uZWN0ZWRcblx0XHRpZiAoICFhdXAgfHwgIWJ1cCApIHtcblx0XHRcdHJldHVybiBhID09PSBkb2MgPyAtMSA6XG5cdFx0XHRcdGIgPT09IGRvYyA/IDEgOlxuXHRcdFx0XHRhdXAgPyAtMSA6XG5cdFx0XHRcdGJ1cCA/IDEgOlxuXHRcdFx0XHRzb3J0SW5wdXQgP1xuXHRcdFx0XHQoIGluZGV4T2YuY2FsbCggc29ydElucHV0LCBhICkgLSBpbmRleE9mLmNhbGwoIHNvcnRJbnB1dCwgYiApICkgOlxuXHRcdFx0XHQwO1xuXG5cdFx0Ly8gSWYgdGhlIG5vZGVzIGFyZSBzaWJsaW5ncywgd2UgY2FuIGRvIGEgcXVpY2sgY2hlY2tcblx0XHR9IGVsc2UgaWYgKCBhdXAgPT09IGJ1cCApIHtcblx0XHRcdHJldHVybiBzaWJsaW5nQ2hlY2soIGEsIGIgKTtcblx0XHR9XG5cblx0XHQvLyBPdGhlcndpc2Ugd2UgbmVlZCBmdWxsIGxpc3RzIG9mIHRoZWlyIGFuY2VzdG9ycyBmb3IgY29tcGFyaXNvblxuXHRcdGN1ciA9IGE7XG5cdFx0d2hpbGUgKCAoY3VyID0gY3VyLnBhcmVudE5vZGUpICkge1xuXHRcdFx0YXAudW5zaGlmdCggY3VyICk7XG5cdFx0fVxuXHRcdGN1ciA9IGI7XG5cdFx0d2hpbGUgKCAoY3VyID0gY3VyLnBhcmVudE5vZGUpICkge1xuXHRcdFx0YnAudW5zaGlmdCggY3VyICk7XG5cdFx0fVxuXG5cdFx0Ly8gV2FsayBkb3duIHRoZSB0cmVlIGxvb2tpbmcgZm9yIGEgZGlzY3JlcGFuY3lcblx0XHR3aGlsZSAoIGFwW2ldID09PSBicFtpXSApIHtcblx0XHRcdGkrKztcblx0XHR9XG5cblx0XHRyZXR1cm4gaSA/XG5cdFx0XHQvLyBEbyBhIHNpYmxpbmcgY2hlY2sgaWYgdGhlIG5vZGVzIGhhdmUgYSBjb21tb24gYW5jZXN0b3Jcblx0XHRcdHNpYmxpbmdDaGVjayggYXBbaV0sIGJwW2ldICkgOlxuXG5cdFx0XHQvLyBPdGhlcndpc2Ugbm9kZXMgaW4gb3VyIGRvY3VtZW50IHNvcnQgZmlyc3Rcblx0XHRcdGFwW2ldID09PSBwcmVmZXJyZWREb2MgPyAtMSA6XG5cdFx0XHRicFtpXSA9PT0gcHJlZmVycmVkRG9jID8gMSA6XG5cdFx0XHQwO1xuXHR9O1xuXG5cdHJldHVybiBkb2M7XG59O1xuXG5TaXp6bGUubWF0Y2hlcyA9IGZ1bmN0aW9uKCBleHByLCBlbGVtZW50cyApIHtcblx0cmV0dXJuIFNpenpsZSggZXhwciwgbnVsbCwgbnVsbCwgZWxlbWVudHMgKTtcbn07XG5cblNpenpsZS5tYXRjaGVzU2VsZWN0b3IgPSBmdW5jdGlvbiggZWxlbSwgZXhwciApIHtcblx0Ly8gU2V0IGRvY3VtZW50IHZhcnMgaWYgbmVlZGVkXG5cdGlmICggKCBlbGVtLm93bmVyRG9jdW1lbnQgfHwgZWxlbSApICE9PSBkb2N1bWVudCApIHtcblx0XHRzZXREb2N1bWVudCggZWxlbSApO1xuXHR9XG5cblx0Ly8gTWFrZSBzdXJlIHRoYXQgYXR0cmlidXRlIHNlbGVjdG9ycyBhcmUgcXVvdGVkXG5cdGV4cHIgPSBleHByLnJlcGxhY2UoIHJhdHRyaWJ1dGVRdW90ZXMsIFwiPSckMSddXCIgKTtcblxuXHRpZiAoIHN1cHBvcnQubWF0Y2hlc1NlbGVjdG9yICYmIGRvY3VtZW50SXNIVE1MICYmXG5cdFx0KCAhcmJ1Z2d5TWF0Y2hlcyB8fCAhcmJ1Z2d5TWF0Y2hlcy50ZXN0KCBleHByICkgKSAmJlxuXHRcdCggIXJidWdneVFTQSAgICAgfHwgIXJidWdneVFTQS50ZXN0KCBleHByICkgKSApIHtcblxuXHRcdHRyeSB7XG5cdFx0XHR2YXIgcmV0ID0gbWF0Y2hlcy5jYWxsKCBlbGVtLCBleHByICk7XG5cblx0XHRcdC8vIElFIDkncyBtYXRjaGVzU2VsZWN0b3IgcmV0dXJucyBmYWxzZSBvbiBkaXNjb25uZWN0ZWQgbm9kZXNcblx0XHRcdGlmICggcmV0IHx8IHN1cHBvcnQuZGlzY29ubmVjdGVkTWF0Y2ggfHxcblx0XHRcdFx0XHQvLyBBcyB3ZWxsLCBkaXNjb25uZWN0ZWQgbm9kZXMgYXJlIHNhaWQgdG8gYmUgaW4gYSBkb2N1bWVudFxuXHRcdFx0XHRcdC8vIGZyYWdtZW50IGluIElFIDlcblx0XHRcdFx0XHRlbGVtLmRvY3VtZW50ICYmIGVsZW0uZG9jdW1lbnQubm9kZVR5cGUgIT09IDExICkge1xuXHRcdFx0XHRyZXR1cm4gcmV0O1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2goZSkge31cblx0fVxuXG5cdHJldHVybiBTaXp6bGUoIGV4cHIsIGRvY3VtZW50LCBudWxsLCBbZWxlbV0gKS5sZW5ndGggPiAwO1xufTtcblxuU2l6emxlLmNvbnRhaW5zID0gZnVuY3Rpb24oIGNvbnRleHQsIGVsZW0gKSB7XG5cdC8vIFNldCBkb2N1bWVudCB2YXJzIGlmIG5lZWRlZFxuXHRpZiAoICggY29udGV4dC5vd25lckRvY3VtZW50IHx8IGNvbnRleHQgKSAhPT0gZG9jdW1lbnQgKSB7XG5cdFx0c2V0RG9jdW1lbnQoIGNvbnRleHQgKTtcblx0fVxuXHRyZXR1cm4gY29udGFpbnMoIGNvbnRleHQsIGVsZW0gKTtcbn07XG5cblNpenpsZS5hdHRyID0gZnVuY3Rpb24oIGVsZW0sIG5hbWUgKSB7XG5cdC8vIFNldCBkb2N1bWVudCB2YXJzIGlmIG5lZWRlZFxuXHRpZiAoICggZWxlbS5vd25lckRvY3VtZW50IHx8IGVsZW0gKSAhPT0gZG9jdW1lbnQgKSB7XG5cdFx0c2V0RG9jdW1lbnQoIGVsZW0gKTtcblx0fVxuXG5cdHZhciBmbiA9IEV4cHIuYXR0ckhhbmRsZVsgbmFtZS50b0xvd2VyQ2FzZSgpIF0sXG5cdFx0Ly8gRG9uJ3QgZ2V0IGZvb2xlZCBieSBPYmplY3QucHJvdG90eXBlIHByb3BlcnRpZXMgKGpRdWVyeSAjMTM4MDcpXG5cdFx0dmFsID0gZm4gJiYgaGFzT3duLmNhbGwoIEV4cHIuYXR0ckhhbmRsZSwgbmFtZS50b0xvd2VyQ2FzZSgpICkgP1xuXHRcdFx0Zm4oIGVsZW0sIG5hbWUsICFkb2N1bWVudElzSFRNTCApIDpcblx0XHRcdHVuZGVmaW5lZDtcblxuXHRyZXR1cm4gdmFsICE9PSB1bmRlZmluZWQgP1xuXHRcdHZhbCA6XG5cdFx0c3VwcG9ydC5hdHRyaWJ1dGVzIHx8ICFkb2N1bWVudElzSFRNTCA/XG5cdFx0XHRlbGVtLmdldEF0dHJpYnV0ZSggbmFtZSApIDpcblx0XHRcdCh2YWwgPSBlbGVtLmdldEF0dHJpYnV0ZU5vZGUobmFtZSkpICYmIHZhbC5zcGVjaWZpZWQgP1xuXHRcdFx0XHR2YWwudmFsdWUgOlxuXHRcdFx0XHRudWxsO1xufTtcblxuU2l6emxlLmVycm9yID0gZnVuY3Rpb24oIG1zZyApIHtcblx0dGhyb3cgbmV3IEVycm9yKCBcIlN5bnRheCBlcnJvciwgdW5yZWNvZ25pemVkIGV4cHJlc3Npb246IFwiICsgbXNnICk7XG59O1xuXG4vKipcbiAqIERvY3VtZW50IHNvcnRpbmcgYW5kIHJlbW92aW5nIGR1cGxpY2F0ZXNcbiAqIEBwYXJhbSB7QXJyYXlMaWtlfSByZXN1bHRzXG4gKi9cblNpenpsZS51bmlxdWVTb3J0ID0gZnVuY3Rpb24oIHJlc3VsdHMgKSB7XG5cdHZhciBlbGVtLFxuXHRcdGR1cGxpY2F0ZXMgPSBbXSxcblx0XHRqID0gMCxcblx0XHRpID0gMDtcblxuXHQvLyBVbmxlc3Mgd2UgKmtub3cqIHdlIGNhbiBkZXRlY3QgZHVwbGljYXRlcywgYXNzdW1lIHRoZWlyIHByZXNlbmNlXG5cdGhhc0R1cGxpY2F0ZSA9ICFzdXBwb3J0LmRldGVjdER1cGxpY2F0ZXM7XG5cdHNvcnRJbnB1dCA9ICFzdXBwb3J0LnNvcnRTdGFibGUgJiYgcmVzdWx0cy5zbGljZSggMCApO1xuXHRyZXN1bHRzLnNvcnQoIHNvcnRPcmRlciApO1xuXG5cdGlmICggaGFzRHVwbGljYXRlICkge1xuXHRcdHdoaWxlICggKGVsZW0gPSByZXN1bHRzW2krK10pICkge1xuXHRcdFx0aWYgKCBlbGVtID09PSByZXN1bHRzWyBpIF0gKSB7XG5cdFx0XHRcdGogPSBkdXBsaWNhdGVzLnB1c2goIGkgKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0d2hpbGUgKCBqLS0gKSB7XG5cdFx0XHRyZXN1bHRzLnNwbGljZSggZHVwbGljYXRlc1sgaiBdLCAxICk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gQ2xlYXIgaW5wdXQgYWZ0ZXIgc29ydGluZyB0byByZWxlYXNlIG9iamVjdHNcblx0Ly8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qcXVlcnkvc2l6emxlL3B1bGwvMjI1XG5cdHNvcnRJbnB1dCA9IG51bGw7XG5cblx0cmV0dXJuIHJlc3VsdHM7XG59O1xuXG4vKipcbiAqIFV0aWxpdHkgZnVuY3Rpb24gZm9yIHJldHJpZXZpbmcgdGhlIHRleHQgdmFsdWUgb2YgYW4gYXJyYXkgb2YgRE9NIG5vZGVzXG4gKiBAcGFyYW0ge0FycmF5fEVsZW1lbnR9IGVsZW1cbiAqL1xuZ2V0VGV4dCA9IFNpenpsZS5nZXRUZXh0ID0gZnVuY3Rpb24oIGVsZW0gKSB7XG5cdHZhciBub2RlLFxuXHRcdHJldCA9IFwiXCIsXG5cdFx0aSA9IDAsXG5cdFx0bm9kZVR5cGUgPSBlbGVtLm5vZGVUeXBlO1xuXG5cdGlmICggIW5vZGVUeXBlICkge1xuXHRcdC8vIElmIG5vIG5vZGVUeXBlLCB0aGlzIGlzIGV4cGVjdGVkIHRvIGJlIGFuIGFycmF5XG5cdFx0d2hpbGUgKCAobm9kZSA9IGVsZW1baSsrXSkgKSB7XG5cdFx0XHQvLyBEbyBub3QgdHJhdmVyc2UgY29tbWVudCBub2Rlc1xuXHRcdFx0cmV0ICs9IGdldFRleHQoIG5vZGUgKTtcblx0XHR9XG5cdH0gZWxzZSBpZiAoIG5vZGVUeXBlID09PSAxIHx8IG5vZGVUeXBlID09PSA5IHx8IG5vZGVUeXBlID09PSAxMSApIHtcblx0XHQvLyBVc2UgdGV4dENvbnRlbnQgZm9yIGVsZW1lbnRzXG5cdFx0Ly8gaW5uZXJUZXh0IHVzYWdlIHJlbW92ZWQgZm9yIGNvbnNpc3RlbmN5IG9mIG5ldyBsaW5lcyAoalF1ZXJ5ICMxMTE1Mylcblx0XHRpZiAoIHR5cGVvZiBlbGVtLnRleHRDb250ZW50ID09PSBcInN0cmluZ1wiICkge1xuXHRcdFx0cmV0dXJuIGVsZW0udGV4dENvbnRlbnQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIFRyYXZlcnNlIGl0cyBjaGlsZHJlblxuXHRcdFx0Zm9yICggZWxlbSA9IGVsZW0uZmlyc3RDaGlsZDsgZWxlbTsgZWxlbSA9IGVsZW0ubmV4dFNpYmxpbmcgKSB7XG5cdFx0XHRcdHJldCArPSBnZXRUZXh0KCBlbGVtICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2UgaWYgKCBub2RlVHlwZSA9PT0gMyB8fCBub2RlVHlwZSA9PT0gNCApIHtcblx0XHRyZXR1cm4gZWxlbS5ub2RlVmFsdWU7XG5cdH1cblx0Ly8gRG8gbm90IGluY2x1ZGUgY29tbWVudCBvciBwcm9jZXNzaW5nIGluc3RydWN0aW9uIG5vZGVzXG5cblx0cmV0dXJuIHJldDtcbn07XG5cbkV4cHIgPSBTaXp6bGUuc2VsZWN0b3JzID0ge1xuXG5cdC8vIENhbiBiZSBhZGp1c3RlZCBieSB0aGUgdXNlclxuXHRjYWNoZUxlbmd0aDogNTAsXG5cblx0Y3JlYXRlUHNldWRvOiBtYXJrRnVuY3Rpb24sXG5cblx0bWF0Y2g6IG1hdGNoRXhwcixcblxuXHRhdHRySGFuZGxlOiB7fSxcblxuXHRmaW5kOiB7fSxcblxuXHRyZWxhdGl2ZToge1xuXHRcdFwiPlwiOiB7IGRpcjogXCJwYXJlbnROb2RlXCIsIGZpcnN0OiB0cnVlIH0sXG5cdFx0XCIgXCI6IHsgZGlyOiBcInBhcmVudE5vZGVcIiB9LFxuXHRcdFwiK1wiOiB7IGRpcjogXCJwcmV2aW91c1NpYmxpbmdcIiwgZmlyc3Q6IHRydWUgfSxcblx0XHRcIn5cIjogeyBkaXI6IFwicHJldmlvdXNTaWJsaW5nXCIgfVxuXHR9LFxuXG5cdHByZUZpbHRlcjoge1xuXHRcdFwiQVRUUlwiOiBmdW5jdGlvbiggbWF0Y2ggKSB7XG5cdFx0XHRtYXRjaFsxXSA9IG1hdGNoWzFdLnJlcGxhY2UoIHJ1bmVzY2FwZSwgZnVuZXNjYXBlICk7XG5cblx0XHRcdC8vIE1vdmUgdGhlIGdpdmVuIHZhbHVlIHRvIG1hdGNoWzNdIHdoZXRoZXIgcXVvdGVkIG9yIHVucXVvdGVkXG5cdFx0XHRtYXRjaFszXSA9ICggbWF0Y2hbNF0gfHwgbWF0Y2hbNV0gfHwgXCJcIiApLnJlcGxhY2UoIHJ1bmVzY2FwZSwgZnVuZXNjYXBlICk7XG5cblx0XHRcdGlmICggbWF0Y2hbMl0gPT09IFwifj1cIiApIHtcblx0XHRcdFx0bWF0Y2hbM10gPSBcIiBcIiArIG1hdGNoWzNdICsgXCIgXCI7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBtYXRjaC5zbGljZSggMCwgNCApO1xuXHRcdH0sXG5cblx0XHRcIkNISUxEXCI6IGZ1bmN0aW9uKCBtYXRjaCApIHtcblx0XHRcdC8qIG1hdGNoZXMgZnJvbSBtYXRjaEV4cHJbXCJDSElMRFwiXVxuXHRcdFx0XHQxIHR5cGUgKG9ubHl8bnRofC4uLilcblx0XHRcdFx0MiB3aGF0IChjaGlsZHxvZi10eXBlKVxuXHRcdFx0XHQzIGFyZ3VtZW50IChldmVufG9kZHxcXGQqfFxcZCpuKFsrLV1cXGQrKT98Li4uKVxuXHRcdFx0XHQ0IHhuLWNvbXBvbmVudCBvZiB4bit5IGFyZ3VtZW50IChbKy1dP1xcZCpufClcblx0XHRcdFx0NSBzaWduIG9mIHhuLWNvbXBvbmVudFxuXHRcdFx0XHQ2IHggb2YgeG4tY29tcG9uZW50XG5cdFx0XHRcdDcgc2lnbiBvZiB5LWNvbXBvbmVudFxuXHRcdFx0XHQ4IHkgb2YgeS1jb21wb25lbnRcblx0XHRcdCovXG5cdFx0XHRtYXRjaFsxXSA9IG1hdGNoWzFdLnRvTG93ZXJDYXNlKCk7XG5cblx0XHRcdGlmICggbWF0Y2hbMV0uc2xpY2UoIDAsIDMgKSA9PT0gXCJudGhcIiApIHtcblx0XHRcdFx0Ly8gbnRoLSogcmVxdWlyZXMgYXJndW1lbnRcblx0XHRcdFx0aWYgKCAhbWF0Y2hbM10gKSB7XG5cdFx0XHRcdFx0U2l6emxlLmVycm9yKCBtYXRjaFswXSApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gbnVtZXJpYyB4IGFuZCB5IHBhcmFtZXRlcnMgZm9yIEV4cHIuZmlsdGVyLkNISUxEXG5cdFx0XHRcdC8vIHJlbWVtYmVyIHRoYXQgZmFsc2UvdHJ1ZSBjYXN0IHJlc3BlY3RpdmVseSB0byAwLzFcblx0XHRcdFx0bWF0Y2hbNF0gPSArKCBtYXRjaFs0XSA/IG1hdGNoWzVdICsgKG1hdGNoWzZdIHx8IDEpIDogMiAqICggbWF0Y2hbM10gPT09IFwiZXZlblwiIHx8IG1hdGNoWzNdID09PSBcIm9kZFwiICkgKTtcblx0XHRcdFx0bWF0Y2hbNV0gPSArKCAoIG1hdGNoWzddICsgbWF0Y2hbOF0gKSB8fCBtYXRjaFszXSA9PT0gXCJvZGRcIiApO1xuXG5cdFx0XHQvLyBvdGhlciB0eXBlcyBwcm9oaWJpdCBhcmd1bWVudHNcblx0XHRcdH0gZWxzZSBpZiAoIG1hdGNoWzNdICkge1xuXHRcdFx0XHRTaXp6bGUuZXJyb3IoIG1hdGNoWzBdICk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBtYXRjaDtcblx0XHR9LFxuXG5cdFx0XCJQU0VVRE9cIjogZnVuY3Rpb24oIG1hdGNoICkge1xuXHRcdFx0dmFyIGV4Y2Vzcyxcblx0XHRcdFx0dW5xdW90ZWQgPSAhbWF0Y2hbNV0gJiYgbWF0Y2hbMl07XG5cblx0XHRcdGlmICggbWF0Y2hFeHByW1wiQ0hJTERcIl0udGVzdCggbWF0Y2hbMF0gKSApIHtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEFjY2VwdCBxdW90ZWQgYXJndW1lbnRzIGFzLWlzXG5cdFx0XHRpZiAoIG1hdGNoWzNdICYmIG1hdGNoWzRdICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdG1hdGNoWzJdID0gbWF0Y2hbNF07XG5cblx0XHRcdC8vIFN0cmlwIGV4Y2VzcyBjaGFyYWN0ZXJzIGZyb20gdW5xdW90ZWQgYXJndW1lbnRzXG5cdFx0XHR9IGVsc2UgaWYgKCB1bnF1b3RlZCAmJiBycHNldWRvLnRlc3QoIHVucXVvdGVkICkgJiZcblx0XHRcdFx0Ly8gR2V0IGV4Y2VzcyBmcm9tIHRva2VuaXplIChyZWN1cnNpdmVseSlcblx0XHRcdFx0KGV4Y2VzcyA9IHRva2VuaXplKCB1bnF1b3RlZCwgdHJ1ZSApKSAmJlxuXHRcdFx0XHQvLyBhZHZhbmNlIHRvIHRoZSBuZXh0IGNsb3NpbmcgcGFyZW50aGVzaXNcblx0XHRcdFx0KGV4Y2VzcyA9IHVucXVvdGVkLmluZGV4T2YoIFwiKVwiLCB1bnF1b3RlZC5sZW5ndGggLSBleGNlc3MgKSAtIHVucXVvdGVkLmxlbmd0aCkgKSB7XG5cblx0XHRcdFx0Ly8gZXhjZXNzIGlzIGEgbmVnYXRpdmUgaW5kZXhcblx0XHRcdFx0bWF0Y2hbMF0gPSBtYXRjaFswXS5zbGljZSggMCwgZXhjZXNzICk7XG5cdFx0XHRcdG1hdGNoWzJdID0gdW5xdW90ZWQuc2xpY2UoIDAsIGV4Y2VzcyApO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBSZXR1cm4gb25seSBjYXB0dXJlcyBuZWVkZWQgYnkgdGhlIHBzZXVkbyBmaWx0ZXIgbWV0aG9kICh0eXBlIGFuZCBhcmd1bWVudClcblx0XHRcdHJldHVybiBtYXRjaC5zbGljZSggMCwgMyApO1xuXHRcdH1cblx0fSxcblxuXHRmaWx0ZXI6IHtcblxuXHRcdFwiVEFHXCI6IGZ1bmN0aW9uKCBub2RlTmFtZVNlbGVjdG9yICkge1xuXHRcdFx0dmFyIG5vZGVOYW1lID0gbm9kZU5hbWVTZWxlY3Rvci5yZXBsYWNlKCBydW5lc2NhcGUsIGZ1bmVzY2FwZSApLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRyZXR1cm4gbm9kZU5hbWVTZWxlY3RvciA9PT0gXCIqXCIgP1xuXHRcdFx0XHRmdW5jdGlvbigpIHsgcmV0dXJuIHRydWU7IH0gOlxuXHRcdFx0XHRmdW5jdGlvbiggZWxlbSApIHtcblx0XHRcdFx0XHRyZXR1cm4gZWxlbS5ub2RlTmFtZSAmJiBlbGVtLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT09IG5vZGVOYW1lO1xuXHRcdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRcIkNMQVNTXCI6IGZ1bmN0aW9uKCBjbGFzc05hbWUgKSB7XG5cdFx0XHR2YXIgcGF0dGVybiA9IGNsYXNzQ2FjaGVbIGNsYXNzTmFtZSArIFwiIFwiIF07XG5cblx0XHRcdHJldHVybiBwYXR0ZXJuIHx8XG5cdFx0XHRcdChwYXR0ZXJuID0gbmV3IFJlZ0V4cCggXCIoXnxcIiArIHdoaXRlc3BhY2UgKyBcIilcIiArIGNsYXNzTmFtZSArIFwiKFwiICsgd2hpdGVzcGFjZSArIFwifCQpXCIgKSkgJiZcblx0XHRcdFx0Y2xhc3NDYWNoZSggY2xhc3NOYW1lLCBmdW5jdGlvbiggZWxlbSApIHtcblx0XHRcdFx0XHRyZXR1cm4gcGF0dGVybi50ZXN0KCB0eXBlb2YgZWxlbS5jbGFzc05hbWUgPT09IFwic3RyaW5nXCIgJiYgZWxlbS5jbGFzc05hbWUgfHwgdHlwZW9mIGVsZW0uZ2V0QXR0cmlidXRlICE9PSBzdHJ1bmRlZmluZWQgJiYgZWxlbS5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKSB8fCBcIlwiICk7XG5cdFx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHRcIkFUVFJcIjogZnVuY3Rpb24oIG5hbWUsIG9wZXJhdG9yLCBjaGVjayApIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbiggZWxlbSApIHtcblx0XHRcdFx0dmFyIHJlc3VsdCA9IFNpenpsZS5hdHRyKCBlbGVtLCBuYW1lICk7XG5cblx0XHRcdFx0aWYgKCByZXN1bHQgPT0gbnVsbCApIHtcblx0XHRcdFx0XHRyZXR1cm4gb3BlcmF0b3IgPT09IFwiIT1cIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoICFvcGVyYXRvciApIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJlc3VsdCArPSBcIlwiO1xuXG5cdFx0XHRcdHJldHVybiBvcGVyYXRvciA9PT0gXCI9XCIgPyByZXN1bHQgPT09IGNoZWNrIDpcblx0XHRcdFx0XHRvcGVyYXRvciA9PT0gXCIhPVwiID8gcmVzdWx0ICE9PSBjaGVjayA6XG5cdFx0XHRcdFx0b3BlcmF0b3IgPT09IFwiXj1cIiA/IGNoZWNrICYmIHJlc3VsdC5pbmRleE9mKCBjaGVjayApID09PSAwIDpcblx0XHRcdFx0XHRvcGVyYXRvciA9PT0gXCIqPVwiID8gY2hlY2sgJiYgcmVzdWx0LmluZGV4T2YoIGNoZWNrICkgPiAtMSA6XG5cdFx0XHRcdFx0b3BlcmF0b3IgPT09IFwiJD1cIiA/IGNoZWNrICYmIHJlc3VsdC5zbGljZSggLWNoZWNrLmxlbmd0aCApID09PSBjaGVjayA6XG5cdFx0XHRcdFx0b3BlcmF0b3IgPT09IFwifj1cIiA/ICggXCIgXCIgKyByZXN1bHQgKyBcIiBcIiApLmluZGV4T2YoIGNoZWNrICkgPiAtMSA6XG5cdFx0XHRcdFx0b3BlcmF0b3IgPT09IFwifD1cIiA/IHJlc3VsdCA9PT0gY2hlY2sgfHwgcmVzdWx0LnNsaWNlKCAwLCBjaGVjay5sZW5ndGggKyAxICkgPT09IGNoZWNrICsgXCItXCIgOlxuXHRcdFx0XHRcdGZhbHNlO1xuXHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0XCJDSElMRFwiOiBmdW5jdGlvbiggdHlwZSwgd2hhdCwgYXJndW1lbnQsIGZpcnN0LCBsYXN0ICkge1xuXHRcdFx0dmFyIHNpbXBsZSA9IHR5cGUuc2xpY2UoIDAsIDMgKSAhPT0gXCJudGhcIixcblx0XHRcdFx0Zm9yd2FyZCA9IHR5cGUuc2xpY2UoIC00ICkgIT09IFwibGFzdFwiLFxuXHRcdFx0XHRvZlR5cGUgPSB3aGF0ID09PSBcIm9mLXR5cGVcIjtcblxuXHRcdFx0cmV0dXJuIGZpcnN0ID09PSAxICYmIGxhc3QgPT09IDAgP1xuXG5cdFx0XHRcdC8vIFNob3J0Y3V0IGZvciA6bnRoLSoobilcblx0XHRcdFx0ZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0XHRcdFx0cmV0dXJuICEhZWxlbS5wYXJlbnROb2RlO1xuXHRcdFx0XHR9IDpcblxuXHRcdFx0XHRmdW5jdGlvbiggZWxlbSwgY29udGV4dCwgeG1sICkge1xuXHRcdFx0XHRcdHZhciBjYWNoZSwgb3V0ZXJDYWNoZSwgbm9kZSwgZGlmZiwgbm9kZUluZGV4LCBzdGFydCxcblx0XHRcdFx0XHRcdGRpciA9IHNpbXBsZSAhPT0gZm9yd2FyZCA/IFwibmV4dFNpYmxpbmdcIiA6IFwicHJldmlvdXNTaWJsaW5nXCIsXG5cdFx0XHRcdFx0XHRwYXJlbnQgPSBlbGVtLnBhcmVudE5vZGUsXG5cdFx0XHRcdFx0XHRuYW1lID0gb2ZUeXBlICYmIGVsZW0ubm9kZU5hbWUudG9Mb3dlckNhc2UoKSxcblx0XHRcdFx0XHRcdHVzZUNhY2hlID0gIXhtbCAmJiAhb2ZUeXBlO1xuXG5cdFx0XHRcdFx0aWYgKCBwYXJlbnQgKSB7XG5cblx0XHRcdFx0XHRcdC8vIDooZmlyc3R8bGFzdHxvbmx5KS0oY2hpbGR8b2YtdHlwZSlcblx0XHRcdFx0XHRcdGlmICggc2ltcGxlICkge1xuXHRcdFx0XHRcdFx0XHR3aGlsZSAoIGRpciApIHtcblx0XHRcdFx0XHRcdFx0XHRub2RlID0gZWxlbTtcblx0XHRcdFx0XHRcdFx0XHR3aGlsZSAoIChub2RlID0gbm9kZVsgZGlyIF0pICkge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCBvZlR5cGUgPyBub2RlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT09IG5hbWUgOiBub2RlLm5vZGVUeXBlID09PSAxICkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdC8vIFJldmVyc2UgZGlyZWN0aW9uIGZvciA6b25seS0qIChpZiB3ZSBoYXZlbid0IHlldCBkb25lIHNvKVxuXHRcdFx0XHRcdFx0XHRcdHN0YXJ0ID0gZGlyID0gdHlwZSA9PT0gXCJvbmx5XCIgJiYgIXN0YXJ0ICYmIFwibmV4dFNpYmxpbmdcIjtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0c3RhcnQgPSBbIGZvcndhcmQgPyBwYXJlbnQuZmlyc3RDaGlsZCA6IHBhcmVudC5sYXN0Q2hpbGQgXTtcblxuXHRcdFx0XHRcdFx0Ly8gbm9uLXhtbCA6bnRoLWNoaWxkKC4uLikgc3RvcmVzIGNhY2hlIGRhdGEgb24gYHBhcmVudGBcblx0XHRcdFx0XHRcdGlmICggZm9yd2FyZCAmJiB1c2VDYWNoZSApIHtcblx0XHRcdFx0XHRcdFx0Ly8gU2VlayBgZWxlbWAgZnJvbSBhIHByZXZpb3VzbHktY2FjaGVkIGluZGV4XG5cdFx0XHRcdFx0XHRcdG91dGVyQ2FjaGUgPSBwYXJlbnRbIGV4cGFuZG8gXSB8fCAocGFyZW50WyBleHBhbmRvIF0gPSB7fSk7XG5cdFx0XHRcdFx0XHRcdGNhY2hlID0gb3V0ZXJDYWNoZVsgdHlwZSBdIHx8IFtdO1xuXHRcdFx0XHRcdFx0XHRub2RlSW5kZXggPSBjYWNoZVswXSA9PT0gZGlycnVucyAmJiBjYWNoZVsxXTtcblx0XHRcdFx0XHRcdFx0ZGlmZiA9IGNhY2hlWzBdID09PSBkaXJydW5zICYmIGNhY2hlWzJdO1xuXHRcdFx0XHRcdFx0XHRub2RlID0gbm9kZUluZGV4ICYmIHBhcmVudC5jaGlsZE5vZGVzWyBub2RlSW5kZXggXTtcblxuXHRcdFx0XHRcdFx0XHR3aGlsZSAoIChub2RlID0gKytub2RlSW5kZXggJiYgbm9kZSAmJiBub2RlWyBkaXIgXSB8fFxuXG5cdFx0XHRcdFx0XHRcdFx0Ly8gRmFsbGJhY2sgdG8gc2Vla2luZyBgZWxlbWAgZnJvbSB0aGUgc3RhcnRcblx0XHRcdFx0XHRcdFx0XHQoZGlmZiA9IG5vZGVJbmRleCA9IDApIHx8IHN0YXJ0LnBvcCgpKSApIHtcblxuXHRcdFx0XHRcdFx0XHRcdC8vIFdoZW4gZm91bmQsIGNhY2hlIGluZGV4ZXMgb24gYHBhcmVudGAgYW5kIGJyZWFrXG5cdFx0XHRcdFx0XHRcdFx0aWYgKCBub2RlLm5vZGVUeXBlID09PSAxICYmICsrZGlmZiAmJiBub2RlID09PSBlbGVtICkge1xuXHRcdFx0XHRcdFx0XHRcdFx0b3V0ZXJDYWNoZVsgdHlwZSBdID0gWyBkaXJydW5zLCBub2RlSW5kZXgsIGRpZmYgXTtcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBVc2UgcHJldmlvdXNseS1jYWNoZWQgZWxlbWVudCBpbmRleCBpZiBhdmFpbGFibGVcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoIHVzZUNhY2hlICYmIChjYWNoZSA9IChlbGVtWyBleHBhbmRvIF0gfHwgKGVsZW1bIGV4cGFuZG8gXSA9IHt9KSlbIHR5cGUgXSkgJiYgY2FjaGVbMF0gPT09IGRpcnJ1bnMgKSB7XG5cdFx0XHRcdFx0XHRcdGRpZmYgPSBjYWNoZVsxXTtcblxuXHRcdFx0XHRcdFx0Ly8geG1sIDpudGgtY2hpbGQoLi4uKSBvciA6bnRoLWxhc3QtY2hpbGQoLi4uKSBvciA6bnRoKC1sYXN0KT8tb2YtdHlwZSguLi4pXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHQvLyBVc2UgdGhlIHNhbWUgbG9vcCBhcyBhYm92ZSB0byBzZWVrIGBlbGVtYCBmcm9tIHRoZSBzdGFydFxuXHRcdFx0XHRcdFx0XHR3aGlsZSAoIChub2RlID0gKytub2RlSW5kZXggJiYgbm9kZSAmJiBub2RlWyBkaXIgXSB8fFxuXHRcdFx0XHRcdFx0XHRcdChkaWZmID0gbm9kZUluZGV4ID0gMCkgfHwgc3RhcnQucG9wKCkpICkge1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKCAoIG9mVHlwZSA/IG5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gbmFtZSA6IG5vZGUubm9kZVR5cGUgPT09IDEgKSAmJiArK2RpZmYgKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBDYWNoZSB0aGUgaW5kZXggb2YgZWFjaCBlbmNvdW50ZXJlZCBlbGVtZW50XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoIHVzZUNhY2hlICkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQobm9kZVsgZXhwYW5kbyBdIHx8IChub2RlWyBleHBhbmRvIF0gPSB7fSkpWyB0eXBlIF0gPSBbIGRpcnJ1bnMsIGRpZmYgXTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCBub2RlID09PSBlbGVtICkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8gSW5jb3Jwb3JhdGUgdGhlIG9mZnNldCwgdGhlbiBjaGVjayBhZ2FpbnN0IGN5Y2xlIHNpemVcblx0XHRcdFx0XHRcdGRpZmYgLT0gbGFzdDtcblx0XHRcdFx0XHRcdHJldHVybiBkaWZmID09PSBmaXJzdCB8fCAoIGRpZmYgJSBmaXJzdCA9PT0gMCAmJiBkaWZmIC8gZmlyc3QgPj0gMCApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0XCJQU0VVRE9cIjogZnVuY3Rpb24oIHBzZXVkbywgYXJndW1lbnQgKSB7XG5cdFx0XHQvLyBwc2V1ZG8tY2xhc3MgbmFtZXMgYXJlIGNhc2UtaW5zZW5zaXRpdmVcblx0XHRcdC8vIGh0dHA6Ly93d3cudzMub3JnL1RSL3NlbGVjdG9ycy8jcHNldWRvLWNsYXNzZXNcblx0XHRcdC8vIFByaW9yaXRpemUgYnkgY2FzZSBzZW5zaXRpdml0eSBpbiBjYXNlIGN1c3RvbSBwc2V1ZG9zIGFyZSBhZGRlZCB3aXRoIHVwcGVyY2FzZSBsZXR0ZXJzXG5cdFx0XHQvLyBSZW1lbWJlciB0aGF0IHNldEZpbHRlcnMgaW5oZXJpdHMgZnJvbSBwc2V1ZG9zXG5cdFx0XHR2YXIgYXJncyxcblx0XHRcdFx0Zm4gPSBFeHByLnBzZXVkb3NbIHBzZXVkbyBdIHx8IEV4cHIuc2V0RmlsdGVyc1sgcHNldWRvLnRvTG93ZXJDYXNlKCkgXSB8fFxuXHRcdFx0XHRcdFNpenpsZS5lcnJvciggXCJ1bnN1cHBvcnRlZCBwc2V1ZG86IFwiICsgcHNldWRvICk7XG5cblx0XHRcdC8vIFRoZSB1c2VyIG1heSB1c2UgY3JlYXRlUHNldWRvIHRvIGluZGljYXRlIHRoYXRcblx0XHRcdC8vIGFyZ3VtZW50cyBhcmUgbmVlZGVkIHRvIGNyZWF0ZSB0aGUgZmlsdGVyIGZ1bmN0aW9uXG5cdFx0XHQvLyBqdXN0IGFzIFNpenpsZSBkb2VzXG5cdFx0XHRpZiAoIGZuWyBleHBhbmRvIF0gKSB7XG5cdFx0XHRcdHJldHVybiBmbiggYXJndW1lbnQgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQnV0IG1haW50YWluIHN1cHBvcnQgZm9yIG9sZCBzaWduYXR1cmVzXG5cdFx0XHRpZiAoIGZuLmxlbmd0aCA+IDEgKSB7XG5cdFx0XHRcdGFyZ3MgPSBbIHBzZXVkbywgcHNldWRvLCBcIlwiLCBhcmd1bWVudCBdO1xuXHRcdFx0XHRyZXR1cm4gRXhwci5zZXRGaWx0ZXJzLmhhc093blByb3BlcnR5KCBwc2V1ZG8udG9Mb3dlckNhc2UoKSApID9cblx0XHRcdFx0XHRtYXJrRnVuY3Rpb24oZnVuY3Rpb24oIHNlZWQsIG1hdGNoZXMgKSB7XG5cdFx0XHRcdFx0XHR2YXIgaWR4LFxuXHRcdFx0XHRcdFx0XHRtYXRjaGVkID0gZm4oIHNlZWQsIGFyZ3VtZW50ICksXG5cdFx0XHRcdFx0XHRcdGkgPSBtYXRjaGVkLmxlbmd0aDtcblx0XHRcdFx0XHRcdHdoaWxlICggaS0tICkge1xuXHRcdFx0XHRcdFx0XHRpZHggPSBpbmRleE9mLmNhbGwoIHNlZWQsIG1hdGNoZWRbaV0gKTtcblx0XHRcdFx0XHRcdFx0c2VlZFsgaWR4IF0gPSAhKCBtYXRjaGVzWyBpZHggXSA9IG1hdGNoZWRbaV0gKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KSA6XG5cdFx0XHRcdFx0ZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZm4oIGVsZW0sIDAsIGFyZ3MgKTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gZm47XG5cdFx0fVxuXHR9LFxuXG5cdHBzZXVkb3M6IHtcblx0XHQvLyBQb3RlbnRpYWxseSBjb21wbGV4IHBzZXVkb3Ncblx0XHRcIm5vdFwiOiBtYXJrRnVuY3Rpb24oZnVuY3Rpb24oIHNlbGVjdG9yICkge1xuXHRcdFx0Ly8gVHJpbSB0aGUgc2VsZWN0b3IgcGFzc2VkIHRvIGNvbXBpbGVcblx0XHRcdC8vIHRvIGF2b2lkIHRyZWF0aW5nIGxlYWRpbmcgYW5kIHRyYWlsaW5nXG5cdFx0XHQvLyBzcGFjZXMgYXMgY29tYmluYXRvcnNcblx0XHRcdHZhciBpbnB1dCA9IFtdLFxuXHRcdFx0XHRyZXN1bHRzID0gW10sXG5cdFx0XHRcdG1hdGNoZXIgPSBjb21waWxlKCBzZWxlY3Rvci5yZXBsYWNlKCBydHJpbSwgXCIkMVwiICkgKTtcblxuXHRcdFx0cmV0dXJuIG1hdGNoZXJbIGV4cGFuZG8gXSA/XG5cdFx0XHRcdG1hcmtGdW5jdGlvbihmdW5jdGlvbiggc2VlZCwgbWF0Y2hlcywgY29udGV4dCwgeG1sICkge1xuXHRcdFx0XHRcdHZhciBlbGVtLFxuXHRcdFx0XHRcdFx0dW5tYXRjaGVkID0gbWF0Y2hlciggc2VlZCwgbnVsbCwgeG1sLCBbXSApLFxuXHRcdFx0XHRcdFx0aSA9IHNlZWQubGVuZ3RoO1xuXG5cdFx0XHRcdFx0Ly8gTWF0Y2ggZWxlbWVudHMgdW5tYXRjaGVkIGJ5IGBtYXRjaGVyYFxuXHRcdFx0XHRcdHdoaWxlICggaS0tICkge1xuXHRcdFx0XHRcdFx0aWYgKCAoZWxlbSA9IHVubWF0Y2hlZFtpXSkgKSB7XG5cdFx0XHRcdFx0XHRcdHNlZWRbaV0gPSAhKG1hdGNoZXNbaV0gPSBlbGVtKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pIDpcblx0XHRcdFx0ZnVuY3Rpb24oIGVsZW0sIGNvbnRleHQsIHhtbCApIHtcblx0XHRcdFx0XHRpbnB1dFswXSA9IGVsZW07XG5cdFx0XHRcdFx0bWF0Y2hlciggaW5wdXQsIG51bGwsIHhtbCwgcmVzdWx0cyApO1xuXHRcdFx0XHRcdHJldHVybiAhcmVzdWx0cy5wb3AoKTtcblx0XHRcdFx0fTtcblx0XHR9KSxcblxuXHRcdFwiaGFzXCI6IG1hcmtGdW5jdGlvbihmdW5jdGlvbiggc2VsZWN0b3IgKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0XHRcdHJldHVybiBTaXp6bGUoIHNlbGVjdG9yLCBlbGVtICkubGVuZ3RoID4gMDtcblx0XHRcdH07XG5cdFx0fSksXG5cblx0XHRcImNvbnRhaW5zXCI6IG1hcmtGdW5jdGlvbihmdW5jdGlvbiggdGV4dCApIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbiggZWxlbSApIHtcblx0XHRcdFx0cmV0dXJuICggZWxlbS50ZXh0Q29udGVudCB8fCBlbGVtLmlubmVyVGV4dCB8fCBnZXRUZXh0KCBlbGVtICkgKS5pbmRleE9mKCB0ZXh0ICkgPiAtMTtcblx0XHRcdH07XG5cdFx0fSksXG5cblx0XHQvLyBcIldoZXRoZXIgYW4gZWxlbWVudCBpcyByZXByZXNlbnRlZCBieSBhIDpsYW5nKCkgc2VsZWN0b3Jcblx0XHQvLyBpcyBiYXNlZCBzb2xlbHkgb24gdGhlIGVsZW1lbnQncyBsYW5ndWFnZSB2YWx1ZVxuXHRcdC8vIGJlaW5nIGVxdWFsIHRvIHRoZSBpZGVudGlmaWVyIEMsXG5cdFx0Ly8gb3IgYmVnaW5uaW5nIHdpdGggdGhlIGlkZW50aWZpZXIgQyBpbW1lZGlhdGVseSBmb2xsb3dlZCBieSBcIi1cIi5cblx0XHQvLyBUaGUgbWF0Y2hpbmcgb2YgQyBhZ2FpbnN0IHRoZSBlbGVtZW50J3MgbGFuZ3VhZ2UgdmFsdWUgaXMgcGVyZm9ybWVkIGNhc2UtaW5zZW5zaXRpdmVseS5cblx0XHQvLyBUaGUgaWRlbnRpZmllciBDIGRvZXMgbm90IGhhdmUgdG8gYmUgYSB2YWxpZCBsYW5ndWFnZSBuYW1lLlwiXG5cdFx0Ly8gaHR0cDovL3d3dy53My5vcmcvVFIvc2VsZWN0b3JzLyNsYW5nLXBzZXVkb1xuXHRcdFwibGFuZ1wiOiBtYXJrRnVuY3Rpb24oIGZ1bmN0aW9uKCBsYW5nICkge1xuXHRcdFx0Ly8gbGFuZyB2YWx1ZSBtdXN0IGJlIGEgdmFsaWQgaWRlbnRpZmllclxuXHRcdFx0aWYgKCAhcmlkZW50aWZpZXIudGVzdChsYW5nIHx8IFwiXCIpICkge1xuXHRcdFx0XHRTaXp6bGUuZXJyb3IoIFwidW5zdXBwb3J0ZWQgbGFuZzogXCIgKyBsYW5nICk7XG5cdFx0XHR9XG5cdFx0XHRsYW5nID0gbGFuZy5yZXBsYWNlKCBydW5lc2NhcGUsIGZ1bmVzY2FwZSApLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0XHRcdHZhciBlbGVtTGFuZztcblx0XHRcdFx0ZG8ge1xuXHRcdFx0XHRcdGlmICggKGVsZW1MYW5nID0gZG9jdW1lbnRJc0hUTUwgP1xuXHRcdFx0XHRcdFx0ZWxlbS5sYW5nIDpcblx0XHRcdFx0XHRcdGVsZW0uZ2V0QXR0cmlidXRlKFwieG1sOmxhbmdcIikgfHwgZWxlbS5nZXRBdHRyaWJ1dGUoXCJsYW5nXCIpKSApIHtcblxuXHRcdFx0XHRcdFx0ZWxlbUxhbmcgPSBlbGVtTGFuZy50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGVsZW1MYW5nID09PSBsYW5nIHx8IGVsZW1MYW5nLmluZGV4T2YoIGxhbmcgKyBcIi1cIiApID09PSAwO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSB3aGlsZSAoIChlbGVtID0gZWxlbS5wYXJlbnROb2RlKSAmJiBlbGVtLm5vZGVUeXBlID09PSAxICk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH07XG5cdFx0fSksXG5cblx0XHQvLyBNaXNjZWxsYW5lb3VzXG5cdFx0XCJ0YXJnZXRcIjogZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0XHR2YXIgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbiAmJiB3aW5kb3cubG9jYXRpb24uaGFzaDtcblx0XHRcdHJldHVybiBoYXNoICYmIGhhc2guc2xpY2UoIDEgKSA9PT0gZWxlbS5pZDtcblx0XHR9LFxuXG5cdFx0XCJyb290XCI6IGZ1bmN0aW9uKCBlbGVtICkge1xuXHRcdFx0cmV0dXJuIGVsZW0gPT09IGRvY0VsZW07XG5cdFx0fSxcblxuXHRcdFwiZm9jdXNcIjogZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0XHRyZXR1cm4gZWxlbSA9PT0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAmJiAoIWRvY3VtZW50Lmhhc0ZvY3VzIHx8IGRvY3VtZW50Lmhhc0ZvY3VzKCkpICYmICEhKGVsZW0udHlwZSB8fCBlbGVtLmhyZWYgfHwgfmVsZW0udGFiSW5kZXgpO1xuXHRcdH0sXG5cblx0XHQvLyBCb29sZWFuIHByb3BlcnRpZXNcblx0XHRcImVuYWJsZWRcIjogZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0XHRyZXR1cm4gZWxlbS5kaXNhYmxlZCA9PT0gZmFsc2U7XG5cdFx0fSxcblxuXHRcdFwiZGlzYWJsZWRcIjogZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0XHRyZXR1cm4gZWxlbS5kaXNhYmxlZCA9PT0gdHJ1ZTtcblx0XHR9LFxuXG5cdFx0XCJjaGVja2VkXCI6IGZ1bmN0aW9uKCBlbGVtICkge1xuXHRcdFx0Ly8gSW4gQ1NTMywgOmNoZWNrZWQgc2hvdWxkIHJldHVybiBib3RoIGNoZWNrZWQgYW5kIHNlbGVjdGVkIGVsZW1lbnRzXG5cdFx0XHQvLyBodHRwOi8vd3d3LnczLm9yZy9UUi8yMDExL1JFQy1jc3MzLXNlbGVjdG9ycy0yMDExMDkyOS8jY2hlY2tlZFxuXHRcdFx0dmFyIG5vZGVOYW1lID0gZWxlbS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0cmV0dXJuIChub2RlTmFtZSA9PT0gXCJpbnB1dFwiICYmICEhZWxlbS5jaGVja2VkKSB8fCAobm9kZU5hbWUgPT09IFwib3B0aW9uXCIgJiYgISFlbGVtLnNlbGVjdGVkKTtcblx0XHR9LFxuXG5cdFx0XCJzZWxlY3RlZFwiOiBmdW5jdGlvbiggZWxlbSApIHtcblx0XHRcdC8vIEFjY2Vzc2luZyB0aGlzIHByb3BlcnR5IG1ha2VzIHNlbGVjdGVkLWJ5LWRlZmF1bHRcblx0XHRcdC8vIG9wdGlvbnMgaW4gU2FmYXJpIHdvcmsgcHJvcGVybHlcblx0XHRcdGlmICggZWxlbS5wYXJlbnROb2RlICkge1xuXHRcdFx0XHRlbGVtLnBhcmVudE5vZGUuc2VsZWN0ZWRJbmRleDtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGVsZW0uc2VsZWN0ZWQgPT09IHRydWU7XG5cdFx0fSxcblxuXHRcdC8vIENvbnRlbnRzXG5cdFx0XCJlbXB0eVwiOiBmdW5jdGlvbiggZWxlbSApIHtcblx0XHRcdC8vIGh0dHA6Ly93d3cudzMub3JnL1RSL3NlbGVjdG9ycy8jZW1wdHktcHNldWRvXG5cdFx0XHQvLyA6ZW1wdHkgaXMgbmVnYXRlZCBieSBlbGVtZW50ICgxKSBvciBjb250ZW50IG5vZGVzICh0ZXh0OiAzOyBjZGF0YTogNDsgZW50aXR5IHJlZjogNSksXG5cdFx0XHQvLyAgIGJ1dCBub3QgYnkgb3RoZXJzIChjb21tZW50OiA4OyBwcm9jZXNzaW5nIGluc3RydWN0aW9uOiA3OyBldGMuKVxuXHRcdFx0Ly8gbm9kZVR5cGUgPCA2IHdvcmtzIGJlY2F1c2UgYXR0cmlidXRlcyAoMikgZG8gbm90IGFwcGVhciBhcyBjaGlsZHJlblxuXHRcdFx0Zm9yICggZWxlbSA9IGVsZW0uZmlyc3RDaGlsZDsgZWxlbTsgZWxlbSA9IGVsZW0ubmV4dFNpYmxpbmcgKSB7XG5cdFx0XHRcdGlmICggZWxlbS5ub2RlVHlwZSA8IDYgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9LFxuXG5cdFx0XCJwYXJlbnRcIjogZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0XHRyZXR1cm4gIUV4cHIucHNldWRvc1tcImVtcHR5XCJdKCBlbGVtICk7XG5cdFx0fSxcblxuXHRcdC8vIEVsZW1lbnQvaW5wdXQgdHlwZXNcblx0XHRcImhlYWRlclwiOiBmdW5jdGlvbiggZWxlbSApIHtcblx0XHRcdHJldHVybiByaGVhZGVyLnRlc3QoIGVsZW0ubm9kZU5hbWUgKTtcblx0XHR9LFxuXG5cdFx0XCJpbnB1dFwiOiBmdW5jdGlvbiggZWxlbSApIHtcblx0XHRcdHJldHVybiByaW5wdXRzLnRlc3QoIGVsZW0ubm9kZU5hbWUgKTtcblx0XHR9LFxuXG5cdFx0XCJidXR0b25cIjogZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0XHR2YXIgbmFtZSA9IGVsZW0ubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcblx0XHRcdHJldHVybiBuYW1lID09PSBcImlucHV0XCIgJiYgZWxlbS50eXBlID09PSBcImJ1dHRvblwiIHx8IG5hbWUgPT09IFwiYnV0dG9uXCI7XG5cdFx0fSxcblxuXHRcdFwidGV4dFwiOiBmdW5jdGlvbiggZWxlbSApIHtcblx0XHRcdHZhciBhdHRyO1xuXHRcdFx0cmV0dXJuIGVsZW0ubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gXCJpbnB1dFwiICYmXG5cdFx0XHRcdGVsZW0udHlwZSA9PT0gXCJ0ZXh0XCIgJiZcblxuXHRcdFx0XHQvLyBTdXBwb3J0OiBJRTw4XG5cdFx0XHRcdC8vIE5ldyBIVE1MNSBhdHRyaWJ1dGUgdmFsdWVzIChlLmcuLCBcInNlYXJjaFwiKSBhcHBlYXIgd2l0aCBlbGVtLnR5cGUgPT09IFwidGV4dFwiXG5cdFx0XHRcdCggKGF0dHIgPSBlbGVtLmdldEF0dHJpYnV0ZShcInR5cGVcIikpID09IG51bGwgfHwgYXR0ci50b0xvd2VyQ2FzZSgpID09PSBcInRleHRcIiApO1xuXHRcdH0sXG5cblx0XHQvLyBQb3NpdGlvbi1pbi1jb2xsZWN0aW9uXG5cdFx0XCJmaXJzdFwiOiBjcmVhdGVQb3NpdGlvbmFsUHNldWRvKGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIFsgMCBdO1xuXHRcdH0pLFxuXG5cdFx0XCJsYXN0XCI6IGNyZWF0ZVBvc2l0aW9uYWxQc2V1ZG8oZnVuY3Rpb24oIG1hdGNoSW5kZXhlcywgbGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuIFsgbGVuZ3RoIC0gMSBdO1xuXHRcdH0pLFxuXG5cdFx0XCJlcVwiOiBjcmVhdGVQb3NpdGlvbmFsUHNldWRvKGZ1bmN0aW9uKCBtYXRjaEluZGV4ZXMsIGxlbmd0aCwgYXJndW1lbnQgKSB7XG5cdFx0XHRyZXR1cm4gWyBhcmd1bWVudCA8IDAgPyBhcmd1bWVudCArIGxlbmd0aCA6IGFyZ3VtZW50IF07XG5cdFx0fSksXG5cblx0XHRcImV2ZW5cIjogY3JlYXRlUG9zaXRpb25hbFBzZXVkbyhmdW5jdGlvbiggbWF0Y2hJbmRleGVzLCBsZW5ndGggKSB7XG5cdFx0XHR2YXIgaSA9IDA7XG5cdFx0XHRmb3IgKCA7IGkgPCBsZW5ndGg7IGkgKz0gMiApIHtcblx0XHRcdFx0bWF0Y2hJbmRleGVzLnB1c2goIGkgKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBtYXRjaEluZGV4ZXM7XG5cdFx0fSksXG5cblx0XHRcIm9kZFwiOiBjcmVhdGVQb3NpdGlvbmFsUHNldWRvKGZ1bmN0aW9uKCBtYXRjaEluZGV4ZXMsIGxlbmd0aCApIHtcblx0XHRcdHZhciBpID0gMTtcblx0XHRcdGZvciAoIDsgaSA8IGxlbmd0aDsgaSArPSAyICkge1xuXHRcdFx0XHRtYXRjaEluZGV4ZXMucHVzaCggaSApO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG1hdGNoSW5kZXhlcztcblx0XHR9KSxcblxuXHRcdFwibHRcIjogY3JlYXRlUG9zaXRpb25hbFBzZXVkbyhmdW5jdGlvbiggbWF0Y2hJbmRleGVzLCBsZW5ndGgsIGFyZ3VtZW50ICkge1xuXHRcdFx0dmFyIGkgPSBhcmd1bWVudCA8IDAgPyBhcmd1bWVudCArIGxlbmd0aCA6IGFyZ3VtZW50O1xuXHRcdFx0Zm9yICggOyAtLWkgPj0gMDsgKSB7XG5cdFx0XHRcdG1hdGNoSW5kZXhlcy5wdXNoKCBpICk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbWF0Y2hJbmRleGVzO1xuXHRcdH0pLFxuXG5cdFx0XCJndFwiOiBjcmVhdGVQb3NpdGlvbmFsUHNldWRvKGZ1bmN0aW9uKCBtYXRjaEluZGV4ZXMsIGxlbmd0aCwgYXJndW1lbnQgKSB7XG5cdFx0XHR2YXIgaSA9IGFyZ3VtZW50IDwgMCA/IGFyZ3VtZW50ICsgbGVuZ3RoIDogYXJndW1lbnQ7XG5cdFx0XHRmb3IgKCA7ICsraSA8IGxlbmd0aDsgKSB7XG5cdFx0XHRcdG1hdGNoSW5kZXhlcy5wdXNoKCBpICk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbWF0Y2hJbmRleGVzO1xuXHRcdH0pXG5cdH1cbn07XG5cbkV4cHIucHNldWRvc1tcIm50aFwiXSA9IEV4cHIucHNldWRvc1tcImVxXCJdO1xuXG4vLyBBZGQgYnV0dG9uL2lucHV0IHR5cGUgcHNldWRvc1xuZm9yICggaSBpbiB7IHJhZGlvOiB0cnVlLCBjaGVja2JveDogdHJ1ZSwgZmlsZTogdHJ1ZSwgcGFzc3dvcmQ6IHRydWUsIGltYWdlOiB0cnVlIH0gKSB7XG5cdEV4cHIucHNldWRvc1sgaSBdID0gY3JlYXRlSW5wdXRQc2V1ZG8oIGkgKTtcbn1cbmZvciAoIGkgaW4geyBzdWJtaXQ6IHRydWUsIHJlc2V0OiB0cnVlIH0gKSB7XG5cdEV4cHIucHNldWRvc1sgaSBdID0gY3JlYXRlQnV0dG9uUHNldWRvKCBpICk7XG59XG5cbi8vIEVhc3kgQVBJIGZvciBjcmVhdGluZyBuZXcgc2V0RmlsdGVyc1xuZnVuY3Rpb24gc2V0RmlsdGVycygpIHt9XG5zZXRGaWx0ZXJzLnByb3RvdHlwZSA9IEV4cHIuZmlsdGVycyA9IEV4cHIucHNldWRvcztcbkV4cHIuc2V0RmlsdGVycyA9IG5ldyBzZXRGaWx0ZXJzKCk7XG5cbmZ1bmN0aW9uIHRva2VuaXplKCBzZWxlY3RvciwgcGFyc2VPbmx5ICkge1xuXHR2YXIgbWF0Y2hlZCwgbWF0Y2gsIHRva2VucywgdHlwZSxcblx0XHRzb0ZhciwgZ3JvdXBzLCBwcmVGaWx0ZXJzLFxuXHRcdGNhY2hlZCA9IHRva2VuQ2FjaGVbIHNlbGVjdG9yICsgXCIgXCIgXTtcblxuXHRpZiAoIGNhY2hlZCApIHtcblx0XHRyZXR1cm4gcGFyc2VPbmx5ID8gMCA6IGNhY2hlZC5zbGljZSggMCApO1xuXHR9XG5cblx0c29GYXIgPSBzZWxlY3Rvcjtcblx0Z3JvdXBzID0gW107XG5cdHByZUZpbHRlcnMgPSBFeHByLnByZUZpbHRlcjtcblxuXHR3aGlsZSAoIHNvRmFyICkge1xuXG5cdFx0Ly8gQ29tbWEgYW5kIGZpcnN0IHJ1blxuXHRcdGlmICggIW1hdGNoZWQgfHwgKG1hdGNoID0gcmNvbW1hLmV4ZWMoIHNvRmFyICkpICkge1xuXHRcdFx0aWYgKCBtYXRjaCApIHtcblx0XHRcdFx0Ly8gRG9uJ3QgY29uc3VtZSB0cmFpbGluZyBjb21tYXMgYXMgdmFsaWRcblx0XHRcdFx0c29GYXIgPSBzb0Zhci5zbGljZSggbWF0Y2hbMF0ubGVuZ3RoICkgfHwgc29GYXI7XG5cdFx0XHR9XG5cdFx0XHRncm91cHMucHVzaCggKHRva2VucyA9IFtdKSApO1xuXHRcdH1cblxuXHRcdG1hdGNoZWQgPSBmYWxzZTtcblxuXHRcdC8vIENvbWJpbmF0b3JzXG5cdFx0aWYgKCAobWF0Y2ggPSByY29tYmluYXRvcnMuZXhlYyggc29GYXIgKSkgKSB7XG5cdFx0XHRtYXRjaGVkID0gbWF0Y2guc2hpZnQoKTtcblx0XHRcdHRva2Vucy5wdXNoKHtcblx0XHRcdFx0dmFsdWU6IG1hdGNoZWQsXG5cdFx0XHRcdC8vIENhc3QgZGVzY2VuZGFudCBjb21iaW5hdG9ycyB0byBzcGFjZVxuXHRcdFx0XHR0eXBlOiBtYXRjaFswXS5yZXBsYWNlKCBydHJpbSwgXCIgXCIgKVxuXHRcdFx0fSk7XG5cdFx0XHRzb0ZhciA9IHNvRmFyLnNsaWNlKCBtYXRjaGVkLmxlbmd0aCApO1xuXHRcdH1cblxuXHRcdC8vIEZpbHRlcnNcblx0XHRmb3IgKCB0eXBlIGluIEV4cHIuZmlsdGVyICkge1xuXHRcdFx0aWYgKCAobWF0Y2ggPSBtYXRjaEV4cHJbIHR5cGUgXS5leGVjKCBzb0ZhciApKSAmJiAoIXByZUZpbHRlcnNbIHR5cGUgXSB8fFxuXHRcdFx0XHQobWF0Y2ggPSBwcmVGaWx0ZXJzWyB0eXBlIF0oIG1hdGNoICkpKSApIHtcblx0XHRcdFx0bWF0Y2hlZCA9IG1hdGNoLnNoaWZ0KCk7XG5cdFx0XHRcdHRva2Vucy5wdXNoKHtcblx0XHRcdFx0XHR2YWx1ZTogbWF0Y2hlZCxcblx0XHRcdFx0XHR0eXBlOiB0eXBlLFxuXHRcdFx0XHRcdG1hdGNoZXM6IG1hdGNoXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRzb0ZhciA9IHNvRmFyLnNsaWNlKCBtYXRjaGVkLmxlbmd0aCApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICggIW1hdGNoZWQgKSB7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIGxlbmd0aCBvZiB0aGUgaW52YWxpZCBleGNlc3Ncblx0Ly8gaWYgd2UncmUganVzdCBwYXJzaW5nXG5cdC8vIE90aGVyd2lzZSwgdGhyb3cgYW4gZXJyb3Igb3IgcmV0dXJuIHRva2Vuc1xuXHRyZXR1cm4gcGFyc2VPbmx5ID9cblx0XHRzb0Zhci5sZW5ndGggOlxuXHRcdHNvRmFyID9cblx0XHRcdFNpenpsZS5lcnJvciggc2VsZWN0b3IgKSA6XG5cdFx0XHQvLyBDYWNoZSB0aGUgdG9rZW5zXG5cdFx0XHR0b2tlbkNhY2hlKCBzZWxlY3RvciwgZ3JvdXBzICkuc2xpY2UoIDAgKTtcbn1cblxuZnVuY3Rpb24gdG9TZWxlY3RvciggdG9rZW5zICkge1xuXHR2YXIgaSA9IDAsXG5cdFx0bGVuID0gdG9rZW5zLmxlbmd0aCxcblx0XHRzZWxlY3RvciA9IFwiXCI7XG5cdGZvciAoIDsgaSA8IGxlbjsgaSsrICkge1xuXHRcdHNlbGVjdG9yICs9IHRva2Vuc1tpXS52YWx1ZTtcblx0fVxuXHRyZXR1cm4gc2VsZWN0b3I7XG59XG5cbmZ1bmN0aW9uIGFkZENvbWJpbmF0b3IoIG1hdGNoZXIsIGNvbWJpbmF0b3IsIGJhc2UgKSB7XG5cdHZhciBkaXIgPSBjb21iaW5hdG9yLmRpcixcblx0XHRjaGVja05vbkVsZW1lbnRzID0gYmFzZSAmJiBkaXIgPT09IFwicGFyZW50Tm9kZVwiLFxuXHRcdGRvbmVOYW1lID0gZG9uZSsrO1xuXG5cdHJldHVybiBjb21iaW5hdG9yLmZpcnN0ID9cblx0XHQvLyBDaGVjayBhZ2FpbnN0IGNsb3Nlc3QgYW5jZXN0b3IvcHJlY2VkaW5nIGVsZW1lbnRcblx0XHRmdW5jdGlvbiggZWxlbSwgY29udGV4dCwgeG1sICkge1xuXHRcdFx0d2hpbGUgKCAoZWxlbSA9IGVsZW1bIGRpciBdKSApIHtcblx0XHRcdFx0aWYgKCBlbGVtLm5vZGVUeXBlID09PSAxIHx8IGNoZWNrTm9uRWxlbWVudHMgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG1hdGNoZXIoIGVsZW0sIGNvbnRleHQsIHhtbCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSA6XG5cblx0XHQvLyBDaGVjayBhZ2FpbnN0IGFsbCBhbmNlc3Rvci9wcmVjZWRpbmcgZWxlbWVudHNcblx0XHRmdW5jdGlvbiggZWxlbSwgY29udGV4dCwgeG1sICkge1xuXHRcdFx0dmFyIG9sZENhY2hlLCBvdXRlckNhY2hlLFxuXHRcdFx0XHRuZXdDYWNoZSA9IFsgZGlycnVucywgZG9uZU5hbWUgXTtcblxuXHRcdFx0Ly8gV2UgY2FuJ3Qgc2V0IGFyYml0cmFyeSBkYXRhIG9uIFhNTCBub2Rlcywgc28gdGhleSBkb24ndCBiZW5lZml0IGZyb20gZGlyIGNhY2hpbmdcblx0XHRcdGlmICggeG1sICkge1xuXHRcdFx0XHR3aGlsZSAoIChlbGVtID0gZWxlbVsgZGlyIF0pICkge1xuXHRcdFx0XHRcdGlmICggZWxlbS5ub2RlVHlwZSA9PT0gMSB8fCBjaGVja05vbkVsZW1lbnRzICkge1xuXHRcdFx0XHRcdFx0aWYgKCBtYXRjaGVyKCBlbGVtLCBjb250ZXh0LCB4bWwgKSApIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR3aGlsZSAoIChlbGVtID0gZWxlbVsgZGlyIF0pICkge1xuXHRcdFx0XHRcdGlmICggZWxlbS5ub2RlVHlwZSA9PT0gMSB8fCBjaGVja05vbkVsZW1lbnRzICkge1xuXHRcdFx0XHRcdFx0b3V0ZXJDYWNoZSA9IGVsZW1bIGV4cGFuZG8gXSB8fCAoZWxlbVsgZXhwYW5kbyBdID0ge30pO1xuXHRcdFx0XHRcdFx0aWYgKCAob2xkQ2FjaGUgPSBvdXRlckNhY2hlWyBkaXIgXSkgJiZcblx0XHRcdFx0XHRcdFx0b2xkQ2FjaGVbIDAgXSA9PT0gZGlycnVucyAmJiBvbGRDYWNoZVsgMSBdID09PSBkb25lTmFtZSApIHtcblxuXHRcdFx0XHRcdFx0XHQvLyBBc3NpZ24gdG8gbmV3Q2FjaGUgc28gcmVzdWx0cyBiYWNrLXByb3BhZ2F0ZSB0byBwcmV2aW91cyBlbGVtZW50c1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gKG5ld0NhY2hlWyAyIF0gPSBvbGRDYWNoZVsgMiBdKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdC8vIFJldXNlIG5ld2NhY2hlIHNvIHJlc3VsdHMgYmFjay1wcm9wYWdhdGUgdG8gcHJldmlvdXMgZWxlbWVudHNcblx0XHRcdFx0XHRcdFx0b3V0ZXJDYWNoZVsgZGlyIF0gPSBuZXdDYWNoZTtcblxuXHRcdFx0XHRcdFx0XHQvLyBBIG1hdGNoIG1lYW5zIHdlJ3JlIGRvbmU7IGEgZmFpbCBtZWFucyB3ZSBoYXZlIHRvIGtlZXAgY2hlY2tpbmdcblx0XHRcdFx0XHRcdFx0aWYgKCAobmV3Q2FjaGVbIDIgXSA9IG1hdGNoZXIoIGVsZW0sIGNvbnRleHQsIHhtbCApKSApIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG59XG5cbmZ1bmN0aW9uIGVsZW1lbnRNYXRjaGVyKCBtYXRjaGVycyApIHtcblx0cmV0dXJuIG1hdGNoZXJzLmxlbmd0aCA+IDEgP1xuXHRcdGZ1bmN0aW9uKCBlbGVtLCBjb250ZXh0LCB4bWwgKSB7XG5cdFx0XHR2YXIgaSA9IG1hdGNoZXJzLmxlbmd0aDtcblx0XHRcdHdoaWxlICggaS0tICkge1xuXHRcdFx0XHRpZiAoICFtYXRjaGVyc1tpXSggZWxlbSwgY29udGV4dCwgeG1sICkgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9IDpcblx0XHRtYXRjaGVyc1swXTtcbn1cblxuZnVuY3Rpb24gY29uZGVuc2UoIHVubWF0Y2hlZCwgbWFwLCBmaWx0ZXIsIGNvbnRleHQsIHhtbCApIHtcblx0dmFyIGVsZW0sXG5cdFx0bmV3VW5tYXRjaGVkID0gW10sXG5cdFx0aSA9IDAsXG5cdFx0bGVuID0gdW5tYXRjaGVkLmxlbmd0aCxcblx0XHRtYXBwZWQgPSBtYXAgIT0gbnVsbDtcblxuXHRmb3IgKCA7IGkgPCBsZW47IGkrKyApIHtcblx0XHRpZiAoIChlbGVtID0gdW5tYXRjaGVkW2ldKSApIHtcblx0XHRcdGlmICggIWZpbHRlciB8fCBmaWx0ZXIoIGVsZW0sIGNvbnRleHQsIHhtbCApICkge1xuXHRcdFx0XHRuZXdVbm1hdGNoZWQucHVzaCggZWxlbSApO1xuXHRcdFx0XHRpZiAoIG1hcHBlZCApIHtcblx0XHRcdFx0XHRtYXAucHVzaCggaSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG5ld1VubWF0Y2hlZDtcbn1cblxuZnVuY3Rpb24gc2V0TWF0Y2hlciggcHJlRmlsdGVyLCBzZWxlY3RvciwgbWF0Y2hlciwgcG9zdEZpbHRlciwgcG9zdEZpbmRlciwgcG9zdFNlbGVjdG9yICkge1xuXHRpZiAoIHBvc3RGaWx0ZXIgJiYgIXBvc3RGaWx0ZXJbIGV4cGFuZG8gXSApIHtcblx0XHRwb3N0RmlsdGVyID0gc2V0TWF0Y2hlciggcG9zdEZpbHRlciApO1xuXHR9XG5cdGlmICggcG9zdEZpbmRlciAmJiAhcG9zdEZpbmRlclsgZXhwYW5kbyBdICkge1xuXHRcdHBvc3RGaW5kZXIgPSBzZXRNYXRjaGVyKCBwb3N0RmluZGVyLCBwb3N0U2VsZWN0b3IgKTtcblx0fVxuXHRyZXR1cm4gbWFya0Z1bmN0aW9uKGZ1bmN0aW9uKCBzZWVkLCByZXN1bHRzLCBjb250ZXh0LCB4bWwgKSB7XG5cdFx0dmFyIHRlbXAsIGksIGVsZW0sXG5cdFx0XHRwcmVNYXAgPSBbXSxcblx0XHRcdHBvc3RNYXAgPSBbXSxcblx0XHRcdHByZWV4aXN0aW5nID0gcmVzdWx0cy5sZW5ndGgsXG5cblx0XHRcdC8vIEdldCBpbml0aWFsIGVsZW1lbnRzIGZyb20gc2VlZCBvciBjb250ZXh0XG5cdFx0XHRlbGVtcyA9IHNlZWQgfHwgbXVsdGlwbGVDb250ZXh0cyggc2VsZWN0b3IgfHwgXCIqXCIsIGNvbnRleHQubm9kZVR5cGUgPyBbIGNvbnRleHQgXSA6IGNvbnRleHQsIFtdICksXG5cblx0XHRcdC8vIFByZWZpbHRlciB0byBnZXQgbWF0Y2hlciBpbnB1dCwgcHJlc2VydmluZyBhIG1hcCBmb3Igc2VlZC1yZXN1bHRzIHN5bmNocm9uaXphdGlvblxuXHRcdFx0bWF0Y2hlckluID0gcHJlRmlsdGVyICYmICggc2VlZCB8fCAhc2VsZWN0b3IgKSA/XG5cdFx0XHRcdGNvbmRlbnNlKCBlbGVtcywgcHJlTWFwLCBwcmVGaWx0ZXIsIGNvbnRleHQsIHhtbCApIDpcblx0XHRcdFx0ZWxlbXMsXG5cblx0XHRcdG1hdGNoZXJPdXQgPSBtYXRjaGVyID9cblx0XHRcdFx0Ly8gSWYgd2UgaGF2ZSBhIHBvc3RGaW5kZXIsIG9yIGZpbHRlcmVkIHNlZWQsIG9yIG5vbi1zZWVkIHBvc3RGaWx0ZXIgb3IgcHJlZXhpc3RpbmcgcmVzdWx0cyxcblx0XHRcdFx0cG9zdEZpbmRlciB8fCAoIHNlZWQgPyBwcmVGaWx0ZXIgOiBwcmVleGlzdGluZyB8fCBwb3N0RmlsdGVyICkgP1xuXG5cdFx0XHRcdFx0Ly8gLi4uaW50ZXJtZWRpYXRlIHByb2Nlc3NpbmcgaXMgbmVjZXNzYXJ5XG5cdFx0XHRcdFx0W10gOlxuXG5cdFx0XHRcdFx0Ly8gLi4ub3RoZXJ3aXNlIHVzZSByZXN1bHRzIGRpcmVjdGx5XG5cdFx0XHRcdFx0cmVzdWx0cyA6XG5cdFx0XHRcdG1hdGNoZXJJbjtcblxuXHRcdC8vIEZpbmQgcHJpbWFyeSBtYXRjaGVzXG5cdFx0aWYgKCBtYXRjaGVyICkge1xuXHRcdFx0bWF0Y2hlciggbWF0Y2hlckluLCBtYXRjaGVyT3V0LCBjb250ZXh0LCB4bWwgKTtcblx0XHR9XG5cblx0XHQvLyBBcHBseSBwb3N0RmlsdGVyXG5cdFx0aWYgKCBwb3N0RmlsdGVyICkge1xuXHRcdFx0dGVtcCA9IGNvbmRlbnNlKCBtYXRjaGVyT3V0LCBwb3N0TWFwICk7XG5cdFx0XHRwb3N0RmlsdGVyKCB0ZW1wLCBbXSwgY29udGV4dCwgeG1sICk7XG5cblx0XHRcdC8vIFVuLW1hdGNoIGZhaWxpbmcgZWxlbWVudHMgYnkgbW92aW5nIHRoZW0gYmFjayB0byBtYXRjaGVySW5cblx0XHRcdGkgPSB0ZW1wLmxlbmd0aDtcblx0XHRcdHdoaWxlICggaS0tICkge1xuXHRcdFx0XHRpZiAoIChlbGVtID0gdGVtcFtpXSkgKSB7XG5cdFx0XHRcdFx0bWF0Y2hlck91dFsgcG9zdE1hcFtpXSBdID0gIShtYXRjaGVySW5bIHBvc3RNYXBbaV0gXSA9IGVsZW0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKCBzZWVkICkge1xuXHRcdFx0aWYgKCBwb3N0RmluZGVyIHx8IHByZUZpbHRlciApIHtcblx0XHRcdFx0aWYgKCBwb3N0RmluZGVyICkge1xuXHRcdFx0XHRcdC8vIEdldCB0aGUgZmluYWwgbWF0Y2hlck91dCBieSBjb25kZW5zaW5nIHRoaXMgaW50ZXJtZWRpYXRlIGludG8gcG9zdEZpbmRlciBjb250ZXh0c1xuXHRcdFx0XHRcdHRlbXAgPSBbXTtcblx0XHRcdFx0XHRpID0gbWF0Y2hlck91dC5sZW5ndGg7XG5cdFx0XHRcdFx0d2hpbGUgKCBpLS0gKSB7XG5cdFx0XHRcdFx0XHRpZiAoIChlbGVtID0gbWF0Y2hlck91dFtpXSkgKSB7XG5cdFx0XHRcdFx0XHRcdC8vIFJlc3RvcmUgbWF0Y2hlckluIHNpbmNlIGVsZW0gaXMgbm90IHlldCBhIGZpbmFsIG1hdGNoXG5cdFx0XHRcdFx0XHRcdHRlbXAucHVzaCggKG1hdGNoZXJJbltpXSA9IGVsZW0pICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHBvc3RGaW5kZXIoIG51bGwsIChtYXRjaGVyT3V0ID0gW10pLCB0ZW1wLCB4bWwgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIE1vdmUgbWF0Y2hlZCBlbGVtZW50cyBmcm9tIHNlZWQgdG8gcmVzdWx0cyB0byBrZWVwIHRoZW0gc3luY2hyb25pemVkXG5cdFx0XHRcdGkgPSBtYXRjaGVyT3V0Lmxlbmd0aDtcblx0XHRcdFx0d2hpbGUgKCBpLS0gKSB7XG5cdFx0XHRcdFx0aWYgKCAoZWxlbSA9IG1hdGNoZXJPdXRbaV0pICYmXG5cdFx0XHRcdFx0XHQodGVtcCA9IHBvc3RGaW5kZXIgPyBpbmRleE9mLmNhbGwoIHNlZWQsIGVsZW0gKSA6IHByZU1hcFtpXSkgPiAtMSApIHtcblxuXHRcdFx0XHRcdFx0c2VlZFt0ZW1wXSA9ICEocmVzdWx0c1t0ZW1wXSA9IGVsZW0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0Ly8gQWRkIGVsZW1lbnRzIHRvIHJlc3VsdHMsIHRocm91Z2ggcG9zdEZpbmRlciBpZiBkZWZpbmVkXG5cdFx0fSBlbHNlIHtcblx0XHRcdG1hdGNoZXJPdXQgPSBjb25kZW5zZShcblx0XHRcdFx0bWF0Y2hlck91dCA9PT0gcmVzdWx0cyA/XG5cdFx0XHRcdFx0bWF0Y2hlck91dC5zcGxpY2UoIHByZWV4aXN0aW5nLCBtYXRjaGVyT3V0Lmxlbmd0aCApIDpcblx0XHRcdFx0XHRtYXRjaGVyT3V0XG5cdFx0XHQpO1xuXHRcdFx0aWYgKCBwb3N0RmluZGVyICkge1xuXHRcdFx0XHRwb3N0RmluZGVyKCBudWxsLCByZXN1bHRzLCBtYXRjaGVyT3V0LCB4bWwgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHB1c2guYXBwbHkoIHJlc3VsdHMsIG1hdGNoZXJPdXQgKTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBtYXRjaGVyRnJvbVRva2VucyggdG9rZW5zICkge1xuXHR2YXIgY2hlY2tDb250ZXh0LCBtYXRjaGVyLCBqLFxuXHRcdGxlbiA9IHRva2Vucy5sZW5ndGgsXG5cdFx0bGVhZGluZ1JlbGF0aXZlID0gRXhwci5yZWxhdGl2ZVsgdG9rZW5zWzBdLnR5cGUgXSxcblx0XHRpbXBsaWNpdFJlbGF0aXZlID0gbGVhZGluZ1JlbGF0aXZlIHx8IEV4cHIucmVsYXRpdmVbXCIgXCJdLFxuXHRcdGkgPSBsZWFkaW5nUmVsYXRpdmUgPyAxIDogMCxcblxuXHRcdC8vIFRoZSBmb3VuZGF0aW9uYWwgbWF0Y2hlciBlbnN1cmVzIHRoYXQgZWxlbWVudHMgYXJlIHJlYWNoYWJsZSBmcm9tIHRvcC1sZXZlbCBjb250ZXh0KHMpXG5cdFx0bWF0Y2hDb250ZXh0ID0gYWRkQ29tYmluYXRvciggZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0XHRyZXR1cm4gZWxlbSA9PT0gY2hlY2tDb250ZXh0O1xuXHRcdH0sIGltcGxpY2l0UmVsYXRpdmUsIHRydWUgKSxcblx0XHRtYXRjaEFueUNvbnRleHQgPSBhZGRDb21iaW5hdG9yKCBmdW5jdGlvbiggZWxlbSApIHtcblx0XHRcdHJldHVybiBpbmRleE9mLmNhbGwoIGNoZWNrQ29udGV4dCwgZWxlbSApID4gLTE7XG5cdFx0fSwgaW1wbGljaXRSZWxhdGl2ZSwgdHJ1ZSApLFxuXHRcdG1hdGNoZXJzID0gWyBmdW5jdGlvbiggZWxlbSwgY29udGV4dCwgeG1sICkge1xuXHRcdFx0cmV0dXJuICggIWxlYWRpbmdSZWxhdGl2ZSAmJiAoIHhtbCB8fCBjb250ZXh0ICE9PSBvdXRlcm1vc3RDb250ZXh0ICkgKSB8fCAoXG5cdFx0XHRcdChjaGVja0NvbnRleHQgPSBjb250ZXh0KS5ub2RlVHlwZSA/XG5cdFx0XHRcdFx0bWF0Y2hDb250ZXh0KCBlbGVtLCBjb250ZXh0LCB4bWwgKSA6XG5cdFx0XHRcdFx0bWF0Y2hBbnlDb250ZXh0KCBlbGVtLCBjb250ZXh0LCB4bWwgKSApO1xuXHRcdH0gXTtcblxuXHRmb3IgKCA7IGkgPCBsZW47IGkrKyApIHtcblx0XHRpZiAoIChtYXRjaGVyID0gRXhwci5yZWxhdGl2ZVsgdG9rZW5zW2ldLnR5cGUgXSkgKSB7XG5cdFx0XHRtYXRjaGVycyA9IFsgYWRkQ29tYmluYXRvcihlbGVtZW50TWF0Y2hlciggbWF0Y2hlcnMgKSwgbWF0Y2hlcikgXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bWF0Y2hlciA9IEV4cHIuZmlsdGVyWyB0b2tlbnNbaV0udHlwZSBdLmFwcGx5KCBudWxsLCB0b2tlbnNbaV0ubWF0Y2hlcyApO1xuXG5cdFx0XHQvLyBSZXR1cm4gc3BlY2lhbCB1cG9uIHNlZWluZyBhIHBvc2l0aW9uYWwgbWF0Y2hlclxuXHRcdFx0aWYgKCBtYXRjaGVyWyBleHBhbmRvIF0gKSB7XG5cdFx0XHRcdC8vIEZpbmQgdGhlIG5leHQgcmVsYXRpdmUgb3BlcmF0b3IgKGlmIGFueSkgZm9yIHByb3BlciBoYW5kbGluZ1xuXHRcdFx0XHRqID0gKytpO1xuXHRcdFx0XHRmb3IgKCA7IGogPCBsZW47IGorKyApIHtcblx0XHRcdFx0XHRpZiAoIEV4cHIucmVsYXRpdmVbIHRva2Vuc1tqXS50eXBlIF0gKSB7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHNldE1hdGNoZXIoXG5cdFx0XHRcdFx0aSA+IDEgJiYgZWxlbWVudE1hdGNoZXIoIG1hdGNoZXJzICksXG5cdFx0XHRcdFx0aSA+IDEgJiYgdG9TZWxlY3Rvcihcblx0XHRcdFx0XHRcdC8vIElmIHRoZSBwcmVjZWRpbmcgdG9rZW4gd2FzIGEgZGVzY2VuZGFudCBjb21iaW5hdG9yLCBpbnNlcnQgYW4gaW1wbGljaXQgYW55LWVsZW1lbnQgYCpgXG5cdFx0XHRcdFx0XHR0b2tlbnMuc2xpY2UoIDAsIGkgLSAxICkuY29uY2F0KHsgdmFsdWU6IHRva2Vuc1sgaSAtIDIgXS50eXBlID09PSBcIiBcIiA/IFwiKlwiIDogXCJcIiB9KVxuXHRcdFx0XHRcdCkucmVwbGFjZSggcnRyaW0sIFwiJDFcIiApLFxuXHRcdFx0XHRcdG1hdGNoZXIsXG5cdFx0XHRcdFx0aSA8IGogJiYgbWF0Y2hlckZyb21Ub2tlbnMoIHRva2Vucy5zbGljZSggaSwgaiApICksXG5cdFx0XHRcdFx0aiA8IGxlbiAmJiBtYXRjaGVyRnJvbVRva2VucyggKHRva2VucyA9IHRva2Vucy5zbGljZSggaiApKSApLFxuXHRcdFx0XHRcdGogPCBsZW4gJiYgdG9TZWxlY3RvciggdG9rZW5zIClcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHRcdG1hdGNoZXJzLnB1c2goIG1hdGNoZXIgKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gZWxlbWVudE1hdGNoZXIoIG1hdGNoZXJzICk7XG59XG5cbmZ1bmN0aW9uIG1hdGNoZXJGcm9tR3JvdXBNYXRjaGVycyggZWxlbWVudE1hdGNoZXJzLCBzZXRNYXRjaGVycyApIHtcblx0dmFyIGJ5U2V0ID0gc2V0TWF0Y2hlcnMubGVuZ3RoID4gMCxcblx0XHRieUVsZW1lbnQgPSBlbGVtZW50TWF0Y2hlcnMubGVuZ3RoID4gMCxcblx0XHRzdXBlck1hdGNoZXIgPSBmdW5jdGlvbiggc2VlZCwgY29udGV4dCwgeG1sLCByZXN1bHRzLCBvdXRlcm1vc3QgKSB7XG5cdFx0XHR2YXIgZWxlbSwgaiwgbWF0Y2hlcixcblx0XHRcdFx0bWF0Y2hlZENvdW50ID0gMCxcblx0XHRcdFx0aSA9IFwiMFwiLFxuXHRcdFx0XHR1bm1hdGNoZWQgPSBzZWVkICYmIFtdLFxuXHRcdFx0XHRzZXRNYXRjaGVkID0gW10sXG5cdFx0XHRcdGNvbnRleHRCYWNrdXAgPSBvdXRlcm1vc3RDb250ZXh0LFxuXHRcdFx0XHQvLyBXZSBtdXN0IGFsd2F5cyBoYXZlIGVpdGhlciBzZWVkIGVsZW1lbnRzIG9yIG91dGVybW9zdCBjb250ZXh0XG5cdFx0XHRcdGVsZW1zID0gc2VlZCB8fCBieUVsZW1lbnQgJiYgRXhwci5maW5kW1wiVEFHXCJdKCBcIipcIiwgb3V0ZXJtb3N0ICksXG5cdFx0XHRcdC8vIFVzZSBpbnRlZ2VyIGRpcnJ1bnMgaWZmIHRoaXMgaXMgdGhlIG91dGVybW9zdCBtYXRjaGVyXG5cdFx0XHRcdGRpcnJ1bnNVbmlxdWUgPSAoZGlycnVucyArPSBjb250ZXh0QmFja3VwID09IG51bGwgPyAxIDogTWF0aC5yYW5kb20oKSB8fCAwLjEpLFxuXHRcdFx0XHRsZW4gPSBlbGVtcy5sZW5ndGg7XG5cblx0XHRcdGlmICggb3V0ZXJtb3N0ICkge1xuXHRcdFx0XHRvdXRlcm1vc3RDb250ZXh0ID0gY29udGV4dCAhPT0gZG9jdW1lbnQgJiYgY29udGV4dDtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQWRkIGVsZW1lbnRzIHBhc3NpbmcgZWxlbWVudE1hdGNoZXJzIGRpcmVjdGx5IHRvIHJlc3VsdHNcblx0XHRcdC8vIEtlZXAgYGlgIGEgc3RyaW5nIGlmIHRoZXJlIGFyZSBubyBlbGVtZW50cyBzbyBgbWF0Y2hlZENvdW50YCB3aWxsIGJlIFwiMDBcIiBiZWxvd1xuXHRcdFx0Ly8gU3VwcG9ydDogSUU8OSwgU2FmYXJpXG5cdFx0XHQvLyBUb2xlcmF0ZSBOb2RlTGlzdCBwcm9wZXJ0aWVzIChJRTogXCJsZW5ndGhcIjsgU2FmYXJpOiA8bnVtYmVyPikgbWF0Y2hpbmcgZWxlbWVudHMgYnkgaWRcblx0XHRcdGZvciAoIDsgaSAhPT0gbGVuICYmIChlbGVtID0gZWxlbXNbaV0pICE9IG51bGw7IGkrKyApIHtcblx0XHRcdFx0aWYgKCBieUVsZW1lbnQgJiYgZWxlbSApIHtcblx0XHRcdFx0XHRqID0gMDtcblx0XHRcdFx0XHR3aGlsZSAoIChtYXRjaGVyID0gZWxlbWVudE1hdGNoZXJzW2orK10pICkge1xuXHRcdFx0XHRcdFx0aWYgKCBtYXRjaGVyKCBlbGVtLCBjb250ZXh0LCB4bWwgKSApIHtcblx0XHRcdFx0XHRcdFx0cmVzdWx0cy5wdXNoKCBlbGVtICk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoIG91dGVybW9zdCApIHtcblx0XHRcdFx0XHRcdGRpcnJ1bnMgPSBkaXJydW5zVW5pcXVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFRyYWNrIHVubWF0Y2hlZCBlbGVtZW50cyBmb3Igc2V0IGZpbHRlcnNcblx0XHRcdFx0aWYgKCBieVNldCApIHtcblx0XHRcdFx0XHQvLyBUaGV5IHdpbGwgaGF2ZSBnb25lIHRocm91Z2ggYWxsIHBvc3NpYmxlIG1hdGNoZXJzXG5cdFx0XHRcdFx0aWYgKCAoZWxlbSA9ICFtYXRjaGVyICYmIGVsZW0pICkge1xuXHRcdFx0XHRcdFx0bWF0Y2hlZENvdW50LS07XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gTGVuZ3RoZW4gdGhlIGFycmF5IGZvciBldmVyeSBlbGVtZW50LCBtYXRjaGVkIG9yIG5vdFxuXHRcdFx0XHRcdGlmICggc2VlZCApIHtcblx0XHRcdFx0XHRcdHVubWF0Y2hlZC5wdXNoKCBlbGVtICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIEFwcGx5IHNldCBmaWx0ZXJzIHRvIHVubWF0Y2hlZCBlbGVtZW50c1xuXHRcdFx0bWF0Y2hlZENvdW50ICs9IGk7XG5cdFx0XHRpZiAoIGJ5U2V0ICYmIGkgIT09IG1hdGNoZWRDb3VudCApIHtcblx0XHRcdFx0aiA9IDA7XG5cdFx0XHRcdHdoaWxlICggKG1hdGNoZXIgPSBzZXRNYXRjaGVyc1tqKytdKSApIHtcblx0XHRcdFx0XHRtYXRjaGVyKCB1bm1hdGNoZWQsIHNldE1hdGNoZWQsIGNvbnRleHQsIHhtbCApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCBzZWVkICkge1xuXHRcdFx0XHRcdC8vIFJlaW50ZWdyYXRlIGVsZW1lbnQgbWF0Y2hlcyB0byBlbGltaW5hdGUgdGhlIG5lZWQgZm9yIHNvcnRpbmdcblx0XHRcdFx0XHRpZiAoIG1hdGNoZWRDb3VudCA+IDAgKSB7XG5cdFx0XHRcdFx0XHR3aGlsZSAoIGktLSApIHtcblx0XHRcdFx0XHRcdFx0aWYgKCAhKHVubWF0Y2hlZFtpXSB8fCBzZXRNYXRjaGVkW2ldKSApIHtcblx0XHRcdFx0XHRcdFx0XHRzZXRNYXRjaGVkW2ldID0gcG9wLmNhbGwoIHJlc3VsdHMgKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIERpc2NhcmQgaW5kZXggcGxhY2Vob2xkZXIgdmFsdWVzIHRvIGdldCBvbmx5IGFjdHVhbCBtYXRjaGVzXG5cdFx0XHRcdFx0c2V0TWF0Y2hlZCA9IGNvbmRlbnNlKCBzZXRNYXRjaGVkICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBBZGQgbWF0Y2hlcyB0byByZXN1bHRzXG5cdFx0XHRcdHB1c2guYXBwbHkoIHJlc3VsdHMsIHNldE1hdGNoZWQgKTtcblxuXHRcdFx0XHQvLyBTZWVkbGVzcyBzZXQgbWF0Y2hlcyBzdWNjZWVkaW5nIG11bHRpcGxlIHN1Y2Nlc3NmdWwgbWF0Y2hlcnMgc3RpcHVsYXRlIHNvcnRpbmdcblx0XHRcdFx0aWYgKCBvdXRlcm1vc3QgJiYgIXNlZWQgJiYgc2V0TWF0Y2hlZC5sZW5ndGggPiAwICYmXG5cdFx0XHRcdFx0KCBtYXRjaGVkQ291bnQgKyBzZXRNYXRjaGVycy5sZW5ndGggKSA+IDEgKSB7XG5cblx0XHRcdFx0XHRTaXp6bGUudW5pcXVlU29ydCggcmVzdWx0cyApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIE92ZXJyaWRlIG1hbmlwdWxhdGlvbiBvZiBnbG9iYWxzIGJ5IG5lc3RlZCBtYXRjaGVyc1xuXHRcdFx0aWYgKCBvdXRlcm1vc3QgKSB7XG5cdFx0XHRcdGRpcnJ1bnMgPSBkaXJydW5zVW5pcXVlO1xuXHRcdFx0XHRvdXRlcm1vc3RDb250ZXh0ID0gY29udGV4dEJhY2t1cDtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHVubWF0Y2hlZDtcblx0XHR9O1xuXG5cdHJldHVybiBieVNldCA/XG5cdFx0bWFya0Z1bmN0aW9uKCBzdXBlck1hdGNoZXIgKSA6XG5cdFx0c3VwZXJNYXRjaGVyO1xufVxuXG5jb21waWxlID0gU2l6emxlLmNvbXBpbGUgPSBmdW5jdGlvbiggc2VsZWN0b3IsIGdyb3VwIC8qIEludGVybmFsIFVzZSBPbmx5ICovICkge1xuXHR2YXIgaSxcblx0XHRzZXRNYXRjaGVycyA9IFtdLFxuXHRcdGVsZW1lbnRNYXRjaGVycyA9IFtdLFxuXHRcdGNhY2hlZCA9IGNvbXBpbGVyQ2FjaGVbIHNlbGVjdG9yICsgXCIgXCIgXTtcblxuXHRpZiAoICFjYWNoZWQgKSB7XG5cdFx0Ly8gR2VuZXJhdGUgYSBmdW5jdGlvbiBvZiByZWN1cnNpdmUgZnVuY3Rpb25zIHRoYXQgY2FuIGJlIHVzZWQgdG8gY2hlY2sgZWFjaCBlbGVtZW50XG5cdFx0aWYgKCAhZ3JvdXAgKSB7XG5cdFx0XHRncm91cCA9IHRva2VuaXplKCBzZWxlY3RvciApO1xuXHRcdH1cblx0XHRpID0gZ3JvdXAubGVuZ3RoO1xuXHRcdHdoaWxlICggaS0tICkge1xuXHRcdFx0Y2FjaGVkID0gbWF0Y2hlckZyb21Ub2tlbnMoIGdyb3VwW2ldICk7XG5cdFx0XHRpZiAoIGNhY2hlZFsgZXhwYW5kbyBdICkge1xuXHRcdFx0XHRzZXRNYXRjaGVycy5wdXNoKCBjYWNoZWQgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGVsZW1lbnRNYXRjaGVycy5wdXNoKCBjYWNoZWQgKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBDYWNoZSB0aGUgY29tcGlsZWQgZnVuY3Rpb25cblx0XHRjYWNoZWQgPSBjb21waWxlckNhY2hlKCBzZWxlY3RvciwgbWF0Y2hlckZyb21Hcm91cE1hdGNoZXJzKCBlbGVtZW50TWF0Y2hlcnMsIHNldE1hdGNoZXJzICkgKTtcblx0fVxuXHRyZXR1cm4gY2FjaGVkO1xufTtcblxuZnVuY3Rpb24gbXVsdGlwbGVDb250ZXh0cyggc2VsZWN0b3IsIGNvbnRleHRzLCByZXN1bHRzICkge1xuXHR2YXIgaSA9IDAsXG5cdFx0bGVuID0gY29udGV4dHMubGVuZ3RoO1xuXHRmb3IgKCA7IGkgPCBsZW47IGkrKyApIHtcblx0XHRTaXp6bGUoIHNlbGVjdG9yLCBjb250ZXh0c1tpXSwgcmVzdWx0cyApO1xuXHR9XG5cdHJldHVybiByZXN1bHRzO1xufVxuXG5mdW5jdGlvbiBzZWxlY3QoIHNlbGVjdG9yLCBjb250ZXh0LCByZXN1bHRzLCBzZWVkICkge1xuXHR2YXIgaSwgdG9rZW5zLCB0b2tlbiwgdHlwZSwgZmluZCxcblx0XHRtYXRjaCA9IHRva2VuaXplKCBzZWxlY3RvciApO1xuXG5cdGlmICggIXNlZWQgKSB7XG5cdFx0Ly8gVHJ5IHRvIG1pbmltaXplIG9wZXJhdGlvbnMgaWYgdGhlcmUgaXMgb25seSBvbmUgZ3JvdXBcblx0XHRpZiAoIG1hdGNoLmxlbmd0aCA9PT0gMSApIHtcblxuXHRcdFx0Ly8gVGFrZSBhIHNob3J0Y3V0IGFuZCBzZXQgdGhlIGNvbnRleHQgaWYgdGhlIHJvb3Qgc2VsZWN0b3IgaXMgYW4gSURcblx0XHRcdHRva2VucyA9IG1hdGNoWzBdID0gbWF0Y2hbMF0uc2xpY2UoIDAgKTtcblx0XHRcdGlmICggdG9rZW5zLmxlbmd0aCA+IDIgJiYgKHRva2VuID0gdG9rZW5zWzBdKS50eXBlID09PSBcIklEXCIgJiZcblx0XHRcdFx0XHRzdXBwb3J0LmdldEJ5SWQgJiYgY29udGV4dC5ub2RlVHlwZSA9PT0gOSAmJiBkb2N1bWVudElzSFRNTCAmJlxuXHRcdFx0XHRcdEV4cHIucmVsYXRpdmVbIHRva2Vuc1sxXS50eXBlIF0gKSB7XG5cblx0XHRcdFx0Y29udGV4dCA9ICggRXhwci5maW5kW1wiSURcIl0oIHRva2VuLm1hdGNoZXNbMF0ucmVwbGFjZShydW5lc2NhcGUsIGZ1bmVzY2FwZSksIGNvbnRleHQgKSB8fCBbXSApWzBdO1xuXHRcdFx0XHRpZiAoICFjb250ZXh0ICkge1xuXHRcdFx0XHRcdHJldHVybiByZXN1bHRzO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHNlbGVjdG9yID0gc2VsZWN0b3Iuc2xpY2UoIHRva2Vucy5zaGlmdCgpLnZhbHVlLmxlbmd0aCApO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBGZXRjaCBhIHNlZWQgc2V0IGZvciByaWdodC10by1sZWZ0IG1hdGNoaW5nXG5cdFx0XHRpID0gbWF0Y2hFeHByW1wibmVlZHNDb250ZXh0XCJdLnRlc3QoIHNlbGVjdG9yICkgPyAwIDogdG9rZW5zLmxlbmd0aDtcblx0XHRcdHdoaWxlICggaS0tICkge1xuXHRcdFx0XHR0b2tlbiA9IHRva2Vuc1tpXTtcblxuXHRcdFx0XHQvLyBBYm9ydCBpZiB3ZSBoaXQgYSBjb21iaW5hdG9yXG5cdFx0XHRcdGlmICggRXhwci5yZWxhdGl2ZVsgKHR5cGUgPSB0b2tlbi50eXBlKSBdICkge1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggKGZpbmQgPSBFeHByLmZpbmRbIHR5cGUgXSkgKSB7XG5cdFx0XHRcdFx0Ly8gU2VhcmNoLCBleHBhbmRpbmcgY29udGV4dCBmb3IgbGVhZGluZyBzaWJsaW5nIGNvbWJpbmF0b3JzXG5cdFx0XHRcdFx0aWYgKCAoc2VlZCA9IGZpbmQoXG5cdFx0XHRcdFx0XHR0b2tlbi5tYXRjaGVzWzBdLnJlcGxhY2UoIHJ1bmVzY2FwZSwgZnVuZXNjYXBlICksXG5cdFx0XHRcdFx0XHRyc2libGluZy50ZXN0KCB0b2tlbnNbMF0udHlwZSApICYmIHRlc3RDb250ZXh0KCBjb250ZXh0LnBhcmVudE5vZGUgKSB8fCBjb250ZXh0XG5cdFx0XHRcdFx0KSkgKSB7XG5cblx0XHRcdFx0XHRcdC8vIElmIHNlZWQgaXMgZW1wdHkgb3Igbm8gdG9rZW5zIHJlbWFpbiwgd2UgY2FuIHJldHVybiBlYXJseVxuXHRcdFx0XHRcdFx0dG9rZW5zLnNwbGljZSggaSwgMSApO1xuXHRcdFx0XHRcdFx0c2VsZWN0b3IgPSBzZWVkLmxlbmd0aCAmJiB0b1NlbGVjdG9yKCB0b2tlbnMgKTtcblx0XHRcdFx0XHRcdGlmICggIXNlbGVjdG9yICkge1xuXHRcdFx0XHRcdFx0XHRwdXNoLmFwcGx5KCByZXN1bHRzLCBzZWVkICk7XG5cdFx0XHRcdFx0XHRcdHJldHVybiByZXN1bHRzO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBDb21waWxlIGFuZCBleGVjdXRlIGEgZmlsdGVyaW5nIGZ1bmN0aW9uXG5cdC8vIFByb3ZpZGUgYG1hdGNoYCB0byBhdm9pZCByZXRva2VuaXphdGlvbiBpZiB3ZSBtb2RpZmllZCB0aGUgc2VsZWN0b3IgYWJvdmVcblx0Y29tcGlsZSggc2VsZWN0b3IsIG1hdGNoICkoXG5cdFx0c2VlZCxcblx0XHRjb250ZXh0LFxuXHRcdCFkb2N1bWVudElzSFRNTCxcblx0XHRyZXN1bHRzLFxuXHRcdHJzaWJsaW5nLnRlc3QoIHNlbGVjdG9yICkgJiYgdGVzdENvbnRleHQoIGNvbnRleHQucGFyZW50Tm9kZSApIHx8IGNvbnRleHRcblx0KTtcblx0cmV0dXJuIHJlc3VsdHM7XG59XG5cbi8vIE9uZS10aW1lIGFzc2lnbm1lbnRzXG5cbi8vIFNvcnQgc3RhYmlsaXR5XG5zdXBwb3J0LnNvcnRTdGFibGUgPSBleHBhbmRvLnNwbGl0KFwiXCIpLnNvcnQoIHNvcnRPcmRlciApLmpvaW4oXCJcIikgPT09IGV4cGFuZG87XG5cbi8vIFN1cHBvcnQ6IENocm9tZTwxNFxuLy8gQWx3YXlzIGFzc3VtZSBkdXBsaWNhdGVzIGlmIHRoZXkgYXJlbid0IHBhc3NlZCB0byB0aGUgY29tcGFyaXNvbiBmdW5jdGlvblxuc3VwcG9ydC5kZXRlY3REdXBsaWNhdGVzID0gISFoYXNEdXBsaWNhdGU7XG5cbi8vIEluaXRpYWxpemUgYWdhaW5zdCB0aGUgZGVmYXVsdCBkb2N1bWVudFxuc2V0RG9jdW1lbnQoKTtcblxuLy8gU3VwcG9ydDogV2Via2l0PDUzNy4zMiAtIFNhZmFyaSA2LjAuMy9DaHJvbWUgMjUgKGZpeGVkIGluIENocm9tZSAyNylcbi8vIERldGFjaGVkIG5vZGVzIGNvbmZvdW5kaW5nbHkgZm9sbG93ICplYWNoIG90aGVyKlxuc3VwcG9ydC5zb3J0RGV0YWNoZWQgPSBhc3NlcnQoZnVuY3Rpb24oIGRpdjEgKSB7XG5cdC8vIFNob3VsZCByZXR1cm4gMSwgYnV0IHJldHVybnMgNCAoZm9sbG93aW5nKVxuXHRyZXR1cm4gZGl2MS5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbiggZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSApICYgMTtcbn0pO1xuXG4vLyBTdXBwb3J0OiBJRTw4XG4vLyBQcmV2ZW50IGF0dHJpYnV0ZS9wcm9wZXJ0eSBcImludGVycG9sYXRpb25cIlxuLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L21zNTM2NDI5JTI4VlMuODUlMjkuYXNweFxuaWYgKCAhYXNzZXJ0KGZ1bmN0aW9uKCBkaXYgKSB7XG5cdGRpdi5pbm5lckhUTUwgPSBcIjxhIGhyZWY9JyMnPjwvYT5cIjtcblx0cmV0dXJuIGRpdi5maXJzdENoaWxkLmdldEF0dHJpYnV0ZShcImhyZWZcIikgPT09IFwiI1wiIDtcbn0pICkge1xuXHRhZGRIYW5kbGUoIFwidHlwZXxocmVmfGhlaWdodHx3aWR0aFwiLCBmdW5jdGlvbiggZWxlbSwgbmFtZSwgaXNYTUwgKSB7XG5cdFx0aWYgKCAhaXNYTUwgKSB7XG5cdFx0XHRyZXR1cm4gZWxlbS5nZXRBdHRyaWJ1dGUoIG5hbWUsIG5hbWUudG9Mb3dlckNhc2UoKSA9PT0gXCJ0eXBlXCIgPyAxIDogMiApO1xuXHRcdH1cblx0fSk7XG59XG5cbi8vIFN1cHBvcnQ6IElFPDlcbi8vIFVzZSBkZWZhdWx0VmFsdWUgaW4gcGxhY2Ugb2YgZ2V0QXR0cmlidXRlKFwidmFsdWVcIilcbmlmICggIXN1cHBvcnQuYXR0cmlidXRlcyB8fCAhYXNzZXJ0KGZ1bmN0aW9uKCBkaXYgKSB7XG5cdGRpdi5pbm5lckhUTUwgPSBcIjxpbnB1dC8+XCI7XG5cdGRpdi5maXJzdENoaWxkLnNldEF0dHJpYnV0ZSggXCJ2YWx1ZVwiLCBcIlwiICk7XG5cdHJldHVybiBkaXYuZmlyc3RDaGlsZC5nZXRBdHRyaWJ1dGUoIFwidmFsdWVcIiApID09PSBcIlwiO1xufSkgKSB7XG5cdGFkZEhhbmRsZSggXCJ2YWx1ZVwiLCBmdW5jdGlvbiggZWxlbSwgbmFtZSwgaXNYTUwgKSB7XG5cdFx0aWYgKCAhaXNYTUwgJiYgZWxlbS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSBcImlucHV0XCIgKSB7XG5cdFx0XHRyZXR1cm4gZWxlbS5kZWZhdWx0VmFsdWU7XG5cdFx0fVxuXHR9KTtcbn1cblxuLy8gU3VwcG9ydDogSUU8OVxuLy8gVXNlIGdldEF0dHJpYnV0ZU5vZGUgdG8gZmV0Y2ggYm9vbGVhbnMgd2hlbiBnZXRBdHRyaWJ1dGUgbGllc1xuaWYgKCAhYXNzZXJ0KGZ1bmN0aW9uKCBkaXYgKSB7XG5cdHJldHVybiBkaXYuZ2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIikgPT0gbnVsbDtcbn0pICkge1xuXHRhZGRIYW5kbGUoIGJvb2xlYW5zLCBmdW5jdGlvbiggZWxlbSwgbmFtZSwgaXNYTUwgKSB7XG5cdFx0dmFyIHZhbDtcblx0XHRpZiAoICFpc1hNTCApIHtcblx0XHRcdHJldHVybiBlbGVtWyBuYW1lIF0gPT09IHRydWUgPyBuYW1lLnRvTG93ZXJDYXNlKCkgOlxuXHRcdFx0XHRcdCh2YWwgPSBlbGVtLmdldEF0dHJpYnV0ZU5vZGUoIG5hbWUgKSkgJiYgdmFsLnNwZWNpZmllZCA/XG5cdFx0XHRcdFx0dmFsLnZhbHVlIDpcblx0XHRcdFx0bnVsbDtcblx0XHR9XG5cdH0pO1xufVxuXG5yZXR1cm4gU2l6emxlO1xuXG59KSggd2luZG93ICk7XG5cblxuXG5qUXVlcnkuZmluZCA9IFNpenpsZTtcbmpRdWVyeS5leHByID0gU2l6emxlLnNlbGVjdG9ycztcbmpRdWVyeS5leHByW1wiOlwiXSA9IGpRdWVyeS5leHByLnBzZXVkb3M7XG5qUXVlcnkudW5pcXVlID0gU2l6emxlLnVuaXF1ZVNvcnQ7XG5qUXVlcnkudGV4dCA9IFNpenpsZS5nZXRUZXh0O1xualF1ZXJ5LmlzWE1MRG9jID0gU2l6emxlLmlzWE1MO1xualF1ZXJ5LmNvbnRhaW5zID0gU2l6emxlLmNvbnRhaW5zO1xuXG5cblxudmFyIHJuZWVkc0NvbnRleHQgPSBqUXVlcnkuZXhwci5tYXRjaC5uZWVkc0NvbnRleHQ7XG5cbnZhciByc2luZ2xlVGFnID0gKC9ePChcXHcrKVxccypcXC8/Pig/OjxcXC9cXDE+fCkkLyk7XG5cblxuXG52YXIgcmlzU2ltcGxlID0gL14uW146I1xcW1xcLixdKiQvO1xuXG4vLyBJbXBsZW1lbnQgdGhlIGlkZW50aWNhbCBmdW5jdGlvbmFsaXR5IGZvciBmaWx0ZXIgYW5kIG5vdFxuZnVuY3Rpb24gd2lubm93KCBlbGVtZW50cywgcXVhbGlmaWVyLCBub3QgKSB7XG5cdGlmICggalF1ZXJ5LmlzRnVuY3Rpb24oIHF1YWxpZmllciApICkge1xuXHRcdHJldHVybiBqUXVlcnkuZ3JlcCggZWxlbWVudHMsIGZ1bmN0aW9uKCBlbGVtLCBpICkge1xuXHRcdFx0LyoganNoaW50IC1XMDE4ICovXG5cdFx0XHRyZXR1cm4gISFxdWFsaWZpZXIuY2FsbCggZWxlbSwgaSwgZWxlbSApICE9PSBub3Q7XG5cdFx0fSk7XG5cblx0fVxuXG5cdGlmICggcXVhbGlmaWVyLm5vZGVUeXBlICkge1xuXHRcdHJldHVybiBqUXVlcnkuZ3JlcCggZWxlbWVudHMsIGZ1bmN0aW9uKCBlbGVtICkge1xuXHRcdFx0cmV0dXJuICggZWxlbSA9PT0gcXVhbGlmaWVyICkgIT09IG5vdDtcblx0XHR9KTtcblxuXHR9XG5cblx0aWYgKCB0eXBlb2YgcXVhbGlmaWVyID09PSBcInN0cmluZ1wiICkge1xuXHRcdGlmICggcmlzU2ltcGxlLnRlc3QoIHF1YWxpZmllciApICkge1xuXHRcdFx0cmV0dXJuIGpRdWVyeS5maWx0ZXIoIHF1YWxpZmllciwgZWxlbWVudHMsIG5vdCApO1xuXHRcdH1cblxuXHRcdHF1YWxpZmllciA9IGpRdWVyeS5maWx0ZXIoIHF1YWxpZmllciwgZWxlbWVudHMgKTtcblx0fVxuXG5cdHJldHVybiBqUXVlcnkuZ3JlcCggZWxlbWVudHMsIGZ1bmN0aW9uKCBlbGVtICkge1xuXHRcdHJldHVybiAoIGluZGV4T2YuY2FsbCggcXVhbGlmaWVyLCBlbGVtICkgPj0gMCApICE9PSBub3Q7XG5cdH0pO1xufVxuXG5qUXVlcnkuZmlsdGVyID0gZnVuY3Rpb24oIGV4cHIsIGVsZW1zLCBub3QgKSB7XG5cdHZhciBlbGVtID0gZWxlbXNbIDAgXTtcblxuXHRpZiAoIG5vdCApIHtcblx0XHRleHByID0gXCI6bm90KFwiICsgZXhwciArIFwiKVwiO1xuXHR9XG5cblx0cmV0dXJuIGVsZW1zLmxlbmd0aCA9PT0gMSAmJiBlbGVtLm5vZGVUeXBlID09PSAxID9cblx0XHRqUXVlcnkuZmluZC5tYXRjaGVzU2VsZWN0b3IoIGVsZW0sIGV4cHIgKSA/IFsgZWxlbSBdIDogW10gOlxuXHRcdGpRdWVyeS5maW5kLm1hdGNoZXMoIGV4cHIsIGpRdWVyeS5ncmVwKCBlbGVtcywgZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0XHRyZXR1cm4gZWxlbS5ub2RlVHlwZSA9PT0gMTtcblx0XHR9KSk7XG59O1xuXG5qUXVlcnkuZm4uZXh0ZW5kKHtcblx0ZmluZDogZnVuY3Rpb24oIHNlbGVjdG9yICkge1xuXHRcdHZhciBpLFxuXHRcdFx0bGVuID0gdGhpcy5sZW5ndGgsXG5cdFx0XHRyZXQgPSBbXSxcblx0XHRcdHNlbGYgPSB0aGlzO1xuXG5cdFx0aWYgKCB0eXBlb2Ygc2VsZWN0b3IgIT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5wdXNoU3RhY2soIGpRdWVyeSggc2VsZWN0b3IgKS5maWx0ZXIoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGZvciAoIGkgPSAwOyBpIDwgbGVuOyBpKysgKSB7XG5cdFx0XHRcdFx0aWYgKCBqUXVlcnkuY29udGFpbnMoIHNlbGZbIGkgXSwgdGhpcyApICkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KSApO1xuXHRcdH1cblxuXHRcdGZvciAoIGkgPSAwOyBpIDwgbGVuOyBpKysgKSB7XG5cdFx0XHRqUXVlcnkuZmluZCggc2VsZWN0b3IsIHNlbGZbIGkgXSwgcmV0ICk7XG5cdFx0fVxuXG5cdFx0Ly8gTmVlZGVkIGJlY2F1c2UgJCggc2VsZWN0b3IsIGNvbnRleHQgKSBiZWNvbWVzICQoIGNvbnRleHQgKS5maW5kKCBzZWxlY3RvciApXG5cdFx0cmV0ID0gdGhpcy5wdXNoU3RhY2soIGxlbiA+IDEgPyBqUXVlcnkudW5pcXVlKCByZXQgKSA6IHJldCApO1xuXHRcdHJldC5zZWxlY3RvciA9IHRoaXMuc2VsZWN0b3IgPyB0aGlzLnNlbGVjdG9yICsgXCIgXCIgKyBzZWxlY3RvciA6IHNlbGVjdG9yO1xuXHRcdHJldHVybiByZXQ7XG5cdH0sXG5cdGZpbHRlcjogZnVuY3Rpb24oIHNlbGVjdG9yICkge1xuXHRcdHJldHVybiB0aGlzLnB1c2hTdGFjayggd2lubm93KHRoaXMsIHNlbGVjdG9yIHx8IFtdLCBmYWxzZSkgKTtcblx0fSxcblx0bm90OiBmdW5jdGlvbiggc2VsZWN0b3IgKSB7XG5cdFx0cmV0dXJuIHRoaXMucHVzaFN0YWNrKCB3aW5ub3codGhpcywgc2VsZWN0b3IgfHwgW10sIHRydWUpICk7XG5cdH0sXG5cdGlzOiBmdW5jdGlvbiggc2VsZWN0b3IgKSB7XG5cdFx0cmV0dXJuICEhd2lubm93KFxuXHRcdFx0dGhpcyxcblxuXHRcdFx0Ly8gSWYgdGhpcyBpcyBhIHBvc2l0aW9uYWwvcmVsYXRpdmUgc2VsZWN0b3IsIGNoZWNrIG1lbWJlcnNoaXAgaW4gdGhlIHJldHVybmVkIHNldFxuXHRcdFx0Ly8gc28gJChcInA6Zmlyc3RcIikuaXMoXCJwOmxhc3RcIikgd29uJ3QgcmV0dXJuIHRydWUgZm9yIGEgZG9jIHdpdGggdHdvIFwicFwiLlxuXHRcdFx0dHlwZW9mIHNlbGVjdG9yID09PSBcInN0cmluZ1wiICYmIHJuZWVkc0NvbnRleHQudGVzdCggc2VsZWN0b3IgKSA/XG5cdFx0XHRcdGpRdWVyeSggc2VsZWN0b3IgKSA6XG5cdFx0XHRcdHNlbGVjdG9yIHx8IFtdLFxuXHRcdFx0ZmFsc2Vcblx0XHQpLmxlbmd0aDtcblx0fVxufSk7XG5cblxuLy8gSW5pdGlhbGl6ZSBhIGpRdWVyeSBvYmplY3RcblxuXG4vLyBBIGNlbnRyYWwgcmVmZXJlbmNlIHRvIHRoZSByb290IGpRdWVyeShkb2N1bWVudClcbnZhciByb290alF1ZXJ5LFxuXG5cdC8vIEEgc2ltcGxlIHdheSB0byBjaGVjayBmb3IgSFRNTCBzdHJpbmdzXG5cdC8vIFByaW9yaXRpemUgI2lkIG92ZXIgPHRhZz4gdG8gYXZvaWQgWFNTIHZpYSBsb2NhdGlvbi5oYXNoICgjOTUyMSlcblx0Ly8gU3RyaWN0IEhUTUwgcmVjb2duaXRpb24gKCMxMTI5MDogbXVzdCBzdGFydCB3aXRoIDwpXG5cdHJxdWlja0V4cHIgPSAvXig/OlxccyooPFtcXHdcXFddKz4pW14+XSp8IyhbXFx3LV0qKSkkLyxcblxuXHRpbml0ID0galF1ZXJ5LmZuLmluaXQgPSBmdW5jdGlvbiggc2VsZWN0b3IsIGNvbnRleHQgKSB7XG5cdFx0dmFyIG1hdGNoLCBlbGVtO1xuXG5cdFx0Ly8gSEFORExFOiAkKFwiXCIpLCAkKG51bGwpLCAkKHVuZGVmaW5lZCksICQoZmFsc2UpXG5cdFx0aWYgKCAhc2VsZWN0b3IgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvLyBIYW5kbGUgSFRNTCBzdHJpbmdzXG5cdFx0aWYgKCB0eXBlb2Ygc2VsZWN0b3IgPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHRpZiAoIHNlbGVjdG9yWzBdID09PSBcIjxcIiAmJiBzZWxlY3Rvclsgc2VsZWN0b3IubGVuZ3RoIC0gMSBdID09PSBcIj5cIiAmJiBzZWxlY3Rvci5sZW5ndGggPj0gMyApIHtcblx0XHRcdFx0Ly8gQXNzdW1lIHRoYXQgc3RyaW5ncyB0aGF0IHN0YXJ0IGFuZCBlbmQgd2l0aCA8PiBhcmUgSFRNTCBhbmQgc2tpcCB0aGUgcmVnZXggY2hlY2tcblx0XHRcdFx0bWF0Y2ggPSBbIG51bGwsIHNlbGVjdG9yLCBudWxsIF07XG5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG1hdGNoID0gcnF1aWNrRXhwci5leGVjKCBzZWxlY3RvciApO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBNYXRjaCBodG1sIG9yIG1ha2Ugc3VyZSBubyBjb250ZXh0IGlzIHNwZWNpZmllZCBmb3IgI2lkXG5cdFx0XHRpZiAoIG1hdGNoICYmIChtYXRjaFsxXSB8fCAhY29udGV4dCkgKSB7XG5cblx0XHRcdFx0Ly8gSEFORExFOiAkKGh0bWwpIC0+ICQoYXJyYXkpXG5cdFx0XHRcdGlmICggbWF0Y2hbMV0gKSB7XG5cdFx0XHRcdFx0Y29udGV4dCA9IGNvbnRleHQgaW5zdGFuY2VvZiBqUXVlcnkgPyBjb250ZXh0WzBdIDogY29udGV4dDtcblxuXHRcdFx0XHRcdC8vIHNjcmlwdHMgaXMgdHJ1ZSBmb3IgYmFjay1jb21wYXRcblx0XHRcdFx0XHQvLyBJbnRlbnRpb25hbGx5IGxldCB0aGUgZXJyb3IgYmUgdGhyb3duIGlmIHBhcnNlSFRNTCBpcyBub3QgcHJlc2VudFxuXHRcdFx0XHRcdGpRdWVyeS5tZXJnZSggdGhpcywgalF1ZXJ5LnBhcnNlSFRNTChcblx0XHRcdFx0XHRcdG1hdGNoWzFdLFxuXHRcdFx0XHRcdFx0Y29udGV4dCAmJiBjb250ZXh0Lm5vZGVUeXBlID8gY29udGV4dC5vd25lckRvY3VtZW50IHx8IGNvbnRleHQgOiBkb2N1bWVudCxcblx0XHRcdFx0XHRcdHRydWVcblx0XHRcdFx0XHQpICk7XG5cblx0XHRcdFx0XHQvLyBIQU5ETEU6ICQoaHRtbCwgcHJvcHMpXG5cdFx0XHRcdFx0aWYgKCByc2luZ2xlVGFnLnRlc3QoIG1hdGNoWzFdICkgJiYgalF1ZXJ5LmlzUGxhaW5PYmplY3QoIGNvbnRleHQgKSApIHtcblx0XHRcdFx0XHRcdGZvciAoIG1hdGNoIGluIGNvbnRleHQgKSB7XG5cdFx0XHRcdFx0XHRcdC8vIFByb3BlcnRpZXMgb2YgY29udGV4dCBhcmUgY2FsbGVkIGFzIG1ldGhvZHMgaWYgcG9zc2libGVcblx0XHRcdFx0XHRcdFx0aWYgKCBqUXVlcnkuaXNGdW5jdGlvbiggdGhpc1sgbWF0Y2ggXSApICkge1xuXHRcdFx0XHRcdFx0XHRcdHRoaXNbIG1hdGNoIF0oIGNvbnRleHRbIG1hdGNoIF0gKTtcblxuXHRcdFx0XHRcdFx0XHQvLyAuLi5hbmQgb3RoZXJ3aXNlIHNldCBhcyBhdHRyaWJ1dGVzXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5hdHRyKCBtYXRjaCwgY29udGV4dFsgbWF0Y2ggXSApO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXM7XG5cblx0XHRcdFx0Ly8gSEFORExFOiAkKCNpZClcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRlbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIG1hdGNoWzJdICk7XG5cblx0XHRcdFx0XHQvLyBDaGVjayBwYXJlbnROb2RlIHRvIGNhdGNoIHdoZW4gQmxhY2tiZXJyeSA0LjYgcmV0dXJuc1xuXHRcdFx0XHRcdC8vIG5vZGVzIHRoYXQgYXJlIG5vIGxvbmdlciBpbiB0aGUgZG9jdW1lbnQgIzY5NjNcblx0XHRcdFx0XHRpZiAoIGVsZW0gJiYgZWxlbS5wYXJlbnROb2RlICkge1xuXHRcdFx0XHRcdFx0Ly8gSW5qZWN0IHRoZSBlbGVtZW50IGRpcmVjdGx5IGludG8gdGhlIGpRdWVyeSBvYmplY3Rcblx0XHRcdFx0XHRcdHRoaXMubGVuZ3RoID0gMTtcblx0XHRcdFx0XHRcdHRoaXNbMF0gPSBlbGVtO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHRoaXMuY29udGV4dCA9IGRvY3VtZW50O1xuXHRcdFx0XHRcdHRoaXMuc2VsZWN0b3IgPSBzZWxlY3Rvcjtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcztcblx0XHRcdFx0fVxuXG5cdFx0XHQvLyBIQU5ETEU6ICQoZXhwciwgJCguLi4pKVxuXHRcdFx0fSBlbHNlIGlmICggIWNvbnRleHQgfHwgY29udGV4dC5qcXVlcnkgKSB7XG5cdFx0XHRcdHJldHVybiAoIGNvbnRleHQgfHwgcm9vdGpRdWVyeSApLmZpbmQoIHNlbGVjdG9yICk7XG5cblx0XHRcdC8vIEhBTkRMRTogJChleHByLCBjb250ZXh0KVxuXHRcdFx0Ly8gKHdoaWNoIGlzIGp1c3QgZXF1aXZhbGVudCB0bzogJChjb250ZXh0KS5maW5kKGV4cHIpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jb25zdHJ1Y3RvciggY29udGV4dCApLmZpbmQoIHNlbGVjdG9yICk7XG5cdFx0XHR9XG5cblx0XHQvLyBIQU5ETEU6ICQoRE9NRWxlbWVudClcblx0XHR9IGVsc2UgaWYgKCBzZWxlY3Rvci5ub2RlVHlwZSApIHtcblx0XHRcdHRoaXMuY29udGV4dCA9IHRoaXNbMF0gPSBzZWxlY3Rvcjtcblx0XHRcdHRoaXMubGVuZ3RoID0gMTtcblx0XHRcdHJldHVybiB0aGlzO1xuXG5cdFx0Ly8gSEFORExFOiAkKGZ1bmN0aW9uKVxuXHRcdC8vIFNob3J0Y3V0IGZvciBkb2N1bWVudCByZWFkeVxuXHRcdH0gZWxzZSBpZiAoIGpRdWVyeS5pc0Z1bmN0aW9uKCBzZWxlY3RvciApICkge1xuXHRcdFx0cmV0dXJuIHR5cGVvZiByb290alF1ZXJ5LnJlYWR5ICE9PSBcInVuZGVmaW5lZFwiID9cblx0XHRcdFx0cm9vdGpRdWVyeS5yZWFkeSggc2VsZWN0b3IgKSA6XG5cdFx0XHRcdC8vIEV4ZWN1dGUgaW1tZWRpYXRlbHkgaWYgcmVhZHkgaXMgbm90IHByZXNlbnRcblx0XHRcdFx0c2VsZWN0b3IoIGpRdWVyeSApO1xuXHRcdH1cblxuXHRcdGlmICggc2VsZWN0b3Iuc2VsZWN0b3IgIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdHRoaXMuc2VsZWN0b3IgPSBzZWxlY3Rvci5zZWxlY3Rvcjtcblx0XHRcdHRoaXMuY29udGV4dCA9IHNlbGVjdG9yLmNvbnRleHQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGpRdWVyeS5tYWtlQXJyYXkoIHNlbGVjdG9yLCB0aGlzICk7XG5cdH07XG5cbi8vIEdpdmUgdGhlIGluaXQgZnVuY3Rpb24gdGhlIGpRdWVyeSBwcm90b3R5cGUgZm9yIGxhdGVyIGluc3RhbnRpYXRpb25cbmluaXQucHJvdG90eXBlID0galF1ZXJ5LmZuO1xuXG4vLyBJbml0aWFsaXplIGNlbnRyYWwgcmVmZXJlbmNlXG5yb290alF1ZXJ5ID0galF1ZXJ5KCBkb2N1bWVudCApO1xuXG5cbnZhciBycGFyZW50c3ByZXYgPSAvXig/OnBhcmVudHN8cHJldig/OlVudGlsfEFsbCkpLyxcblx0Ly8gbWV0aG9kcyBndWFyYW50ZWVkIHRvIHByb2R1Y2UgYSB1bmlxdWUgc2V0IHdoZW4gc3RhcnRpbmcgZnJvbSBhIHVuaXF1ZSBzZXRcblx0Z3VhcmFudGVlZFVuaXF1ZSA9IHtcblx0XHRjaGlsZHJlbjogdHJ1ZSxcblx0XHRjb250ZW50czogdHJ1ZSxcblx0XHRuZXh0OiB0cnVlLFxuXHRcdHByZXY6IHRydWVcblx0fTtcblxualF1ZXJ5LmV4dGVuZCh7XG5cdGRpcjogZnVuY3Rpb24oIGVsZW0sIGRpciwgdW50aWwgKSB7XG5cdFx0dmFyIG1hdGNoZWQgPSBbXSxcblx0XHRcdHRydW5jYXRlID0gdW50aWwgIT09IHVuZGVmaW5lZDtcblxuXHRcdHdoaWxlICggKGVsZW0gPSBlbGVtWyBkaXIgXSkgJiYgZWxlbS5ub2RlVHlwZSAhPT0gOSApIHtcblx0XHRcdGlmICggZWxlbS5ub2RlVHlwZSA9PT0gMSApIHtcblx0XHRcdFx0aWYgKCB0cnVuY2F0ZSAmJiBqUXVlcnkoIGVsZW0gKS5pcyggdW50aWwgKSApIHtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0XHRtYXRjaGVkLnB1c2goIGVsZW0gKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG1hdGNoZWQ7XG5cdH0sXG5cblx0c2libGluZzogZnVuY3Rpb24oIG4sIGVsZW0gKSB7XG5cdFx0dmFyIG1hdGNoZWQgPSBbXTtcblxuXHRcdGZvciAoIDsgbjsgbiA9IG4ubmV4dFNpYmxpbmcgKSB7XG5cdFx0XHRpZiAoIG4ubm9kZVR5cGUgPT09IDEgJiYgbiAhPT0gZWxlbSApIHtcblx0XHRcdFx0bWF0Y2hlZC5wdXNoKCBuICk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG1hdGNoZWQ7XG5cdH1cbn0pO1xuXG5qUXVlcnkuZm4uZXh0ZW5kKHtcblx0aGFzOiBmdW5jdGlvbiggdGFyZ2V0ICkge1xuXHRcdHZhciB0YXJnZXRzID0galF1ZXJ5KCB0YXJnZXQsIHRoaXMgKSxcblx0XHRcdGwgPSB0YXJnZXRzLmxlbmd0aDtcblxuXHRcdHJldHVybiB0aGlzLmZpbHRlcihmdW5jdGlvbigpIHtcblx0XHRcdHZhciBpID0gMDtcblx0XHRcdGZvciAoIDsgaSA8IGw7IGkrKyApIHtcblx0XHRcdFx0aWYgKCBqUXVlcnkuY29udGFpbnMoIHRoaXMsIHRhcmdldHNbaV0gKSApIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXG5cdGNsb3Nlc3Q6IGZ1bmN0aW9uKCBzZWxlY3RvcnMsIGNvbnRleHQgKSB7XG5cdFx0dmFyIGN1cixcblx0XHRcdGkgPSAwLFxuXHRcdFx0bCA9IHRoaXMubGVuZ3RoLFxuXHRcdFx0bWF0Y2hlZCA9IFtdLFxuXHRcdFx0cG9zID0gcm5lZWRzQ29udGV4dC50ZXN0KCBzZWxlY3RvcnMgKSB8fCB0eXBlb2Ygc2VsZWN0b3JzICE9PSBcInN0cmluZ1wiID9cblx0XHRcdFx0alF1ZXJ5KCBzZWxlY3RvcnMsIGNvbnRleHQgfHwgdGhpcy5jb250ZXh0ICkgOlxuXHRcdFx0XHQwO1xuXG5cdFx0Zm9yICggOyBpIDwgbDsgaSsrICkge1xuXHRcdFx0Zm9yICggY3VyID0gdGhpc1tpXTsgY3VyICYmIGN1ciAhPT0gY29udGV4dDsgY3VyID0gY3VyLnBhcmVudE5vZGUgKSB7XG5cdFx0XHRcdC8vIEFsd2F5cyBza2lwIGRvY3VtZW50IGZyYWdtZW50c1xuXHRcdFx0XHRpZiAoIGN1ci5ub2RlVHlwZSA8IDExICYmIChwb3MgP1xuXHRcdFx0XHRcdHBvcy5pbmRleChjdXIpID4gLTEgOlxuXG5cdFx0XHRcdFx0Ly8gRG9uJ3QgcGFzcyBub24tZWxlbWVudHMgdG8gU2l6emxlXG5cdFx0XHRcdFx0Y3VyLm5vZGVUeXBlID09PSAxICYmXG5cdFx0XHRcdFx0XHRqUXVlcnkuZmluZC5tYXRjaGVzU2VsZWN0b3IoY3VyLCBzZWxlY3RvcnMpKSApIHtcblxuXHRcdFx0XHRcdG1hdGNoZWQucHVzaCggY3VyICk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5wdXNoU3RhY2soIG1hdGNoZWQubGVuZ3RoID4gMSA/IGpRdWVyeS51bmlxdWUoIG1hdGNoZWQgKSA6IG1hdGNoZWQgKTtcblx0fSxcblxuXHQvLyBEZXRlcm1pbmUgdGhlIHBvc2l0aW9uIG9mIGFuIGVsZW1lbnQgd2l0aGluXG5cdC8vIHRoZSBtYXRjaGVkIHNldCBvZiBlbGVtZW50c1xuXHRpbmRleDogZnVuY3Rpb24oIGVsZW0gKSB7XG5cblx0XHQvLyBObyBhcmd1bWVudCwgcmV0dXJuIGluZGV4IGluIHBhcmVudFxuXHRcdGlmICggIWVsZW0gKSB7XG5cdFx0XHRyZXR1cm4gKCB0aGlzWyAwIF0gJiYgdGhpc1sgMCBdLnBhcmVudE5vZGUgKSA/IHRoaXMuZmlyc3QoKS5wcmV2QWxsKCkubGVuZ3RoIDogLTE7XG5cdFx0fVxuXG5cdFx0Ly8gaW5kZXggaW4gc2VsZWN0b3Jcblx0XHRpZiAoIHR5cGVvZiBlbGVtID09PSBcInN0cmluZ1wiICkge1xuXHRcdFx0cmV0dXJuIGluZGV4T2YuY2FsbCggalF1ZXJ5KCBlbGVtICksIHRoaXNbIDAgXSApO1xuXHRcdH1cblxuXHRcdC8vIExvY2F0ZSB0aGUgcG9zaXRpb24gb2YgdGhlIGRlc2lyZWQgZWxlbWVudFxuXHRcdHJldHVybiBpbmRleE9mLmNhbGwoIHRoaXMsXG5cblx0XHRcdC8vIElmIGl0IHJlY2VpdmVzIGEgalF1ZXJ5IG9iamVjdCwgdGhlIGZpcnN0IGVsZW1lbnQgaXMgdXNlZFxuXHRcdFx0ZWxlbS5qcXVlcnkgPyBlbGVtWyAwIF0gOiBlbGVtXG5cdFx0KTtcblx0fSxcblxuXHRhZGQ6IGZ1bmN0aW9uKCBzZWxlY3RvciwgY29udGV4dCApIHtcblx0XHRyZXR1cm4gdGhpcy5wdXNoU3RhY2soXG5cdFx0XHRqUXVlcnkudW5pcXVlKFxuXHRcdFx0XHRqUXVlcnkubWVyZ2UoIHRoaXMuZ2V0KCksIGpRdWVyeSggc2VsZWN0b3IsIGNvbnRleHQgKSApXG5cdFx0XHQpXG5cdFx0KTtcblx0fSxcblxuXHRhZGRCYWNrOiBmdW5jdGlvbiggc2VsZWN0b3IgKSB7XG5cdFx0cmV0dXJuIHRoaXMuYWRkKCBzZWxlY3RvciA9PSBudWxsID9cblx0XHRcdHRoaXMucHJldk9iamVjdCA6IHRoaXMucHJldk9iamVjdC5maWx0ZXIoc2VsZWN0b3IpXG5cdFx0KTtcblx0fVxufSk7XG5cbmZ1bmN0aW9uIHNpYmxpbmcoIGN1ciwgZGlyICkge1xuXHR3aGlsZSAoIChjdXIgPSBjdXJbZGlyXSkgJiYgY3VyLm5vZGVUeXBlICE9PSAxICkge31cblx0cmV0dXJuIGN1cjtcbn1cblxualF1ZXJ5LmVhY2goe1xuXHRwYXJlbnQ6IGZ1bmN0aW9uKCBlbGVtICkge1xuXHRcdHZhciBwYXJlbnQgPSBlbGVtLnBhcmVudE5vZGU7XG5cdFx0cmV0dXJuIHBhcmVudCAmJiBwYXJlbnQubm9kZVR5cGUgIT09IDExID8gcGFyZW50IDogbnVsbDtcblx0fSxcblx0cGFyZW50czogZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0cmV0dXJuIGpRdWVyeS5kaXIoIGVsZW0sIFwicGFyZW50Tm9kZVwiICk7XG5cdH0sXG5cdHBhcmVudHNVbnRpbDogZnVuY3Rpb24oIGVsZW0sIGksIHVudGlsICkge1xuXHRcdHJldHVybiBqUXVlcnkuZGlyKCBlbGVtLCBcInBhcmVudE5vZGVcIiwgdW50aWwgKTtcblx0fSxcblx0bmV4dDogZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0cmV0dXJuIHNpYmxpbmcoIGVsZW0sIFwibmV4dFNpYmxpbmdcIiApO1xuXHR9LFxuXHRwcmV2OiBmdW5jdGlvbiggZWxlbSApIHtcblx0XHRyZXR1cm4gc2libGluZyggZWxlbSwgXCJwcmV2aW91c1NpYmxpbmdcIiApO1xuXHR9LFxuXHRuZXh0QWxsOiBmdW5jdGlvbiggZWxlbSApIHtcblx0XHRyZXR1cm4galF1ZXJ5LmRpciggZWxlbSwgXCJuZXh0U2libGluZ1wiICk7XG5cdH0sXG5cdHByZXZBbGw6IGZ1bmN0aW9uKCBlbGVtICkge1xuXHRcdHJldHVybiBqUXVlcnkuZGlyKCBlbGVtLCBcInByZXZpb3VzU2libGluZ1wiICk7XG5cdH0sXG5cdG5leHRVbnRpbDogZnVuY3Rpb24oIGVsZW0sIGksIHVudGlsICkge1xuXHRcdHJldHVybiBqUXVlcnkuZGlyKCBlbGVtLCBcIm5leHRTaWJsaW5nXCIsIHVudGlsICk7XG5cdH0sXG5cdHByZXZVbnRpbDogZnVuY3Rpb24oIGVsZW0sIGksIHVudGlsICkge1xuXHRcdHJldHVybiBqUXVlcnkuZGlyKCBlbGVtLCBcInByZXZpb3VzU2libGluZ1wiLCB1bnRpbCApO1xuXHR9LFxuXHRzaWJsaW5nczogZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0cmV0dXJuIGpRdWVyeS5zaWJsaW5nKCAoIGVsZW0ucGFyZW50Tm9kZSB8fCB7fSApLmZpcnN0Q2hpbGQsIGVsZW0gKTtcblx0fSxcblx0Y2hpbGRyZW46IGZ1bmN0aW9uKCBlbGVtICkge1xuXHRcdHJldHVybiBqUXVlcnkuc2libGluZyggZWxlbS5maXJzdENoaWxkICk7XG5cdH0sXG5cdGNvbnRlbnRzOiBmdW5jdGlvbiggZWxlbSApIHtcblx0XHRyZXR1cm4gZWxlbS5jb250ZW50RG9jdW1lbnQgfHwgalF1ZXJ5Lm1lcmdlKCBbXSwgZWxlbS5jaGlsZE5vZGVzICk7XG5cdH1cbn0sIGZ1bmN0aW9uKCBuYW1lLCBmbiApIHtcblx0alF1ZXJ5LmZuWyBuYW1lIF0gPSBmdW5jdGlvbiggdW50aWwsIHNlbGVjdG9yICkge1xuXHRcdHZhciBtYXRjaGVkID0galF1ZXJ5Lm1hcCggdGhpcywgZm4sIHVudGlsICk7XG5cblx0XHRpZiAoIG5hbWUuc2xpY2UoIC01ICkgIT09IFwiVW50aWxcIiApIHtcblx0XHRcdHNlbGVjdG9yID0gdW50aWw7XG5cdFx0fVxuXG5cdFx0aWYgKCBzZWxlY3RvciAmJiB0eXBlb2Ygc2VsZWN0b3IgPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHRtYXRjaGVkID0galF1ZXJ5LmZpbHRlciggc2VsZWN0b3IsIG1hdGNoZWQgKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMubGVuZ3RoID4gMSApIHtcblx0XHRcdC8vIFJlbW92ZSBkdXBsaWNhdGVzXG5cdFx0XHRpZiAoICFndWFyYW50ZWVkVW5pcXVlWyBuYW1lIF0gKSB7XG5cdFx0XHRcdGpRdWVyeS51bmlxdWUoIG1hdGNoZWQgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gUmV2ZXJzZSBvcmRlciBmb3IgcGFyZW50cyogYW5kIHByZXYtZGVyaXZhdGl2ZXNcblx0XHRcdGlmICggcnBhcmVudHNwcmV2LnRlc3QoIG5hbWUgKSApIHtcblx0XHRcdFx0bWF0Y2hlZC5yZXZlcnNlKCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMucHVzaFN0YWNrKCBtYXRjaGVkICk7XG5cdH07XG59KTtcbnZhciBybm90d2hpdGUgPSAoL1xcUysvZyk7XG5cblxuXG4vLyBTdHJpbmcgdG8gT2JqZWN0IG9wdGlvbnMgZm9ybWF0IGNhY2hlXG52YXIgb3B0aW9uc0NhY2hlID0ge307XG5cbi8vIENvbnZlcnQgU3RyaW5nLWZvcm1hdHRlZCBvcHRpb25zIGludG8gT2JqZWN0LWZvcm1hdHRlZCBvbmVzIGFuZCBzdG9yZSBpbiBjYWNoZVxuZnVuY3Rpb24gY3JlYXRlT3B0aW9ucyggb3B0aW9ucyApIHtcblx0dmFyIG9iamVjdCA9IG9wdGlvbnNDYWNoZVsgb3B0aW9ucyBdID0ge307XG5cdGpRdWVyeS5lYWNoKCBvcHRpb25zLm1hdGNoKCBybm90d2hpdGUgKSB8fCBbXSwgZnVuY3Rpb24oIF8sIGZsYWcgKSB7XG5cdFx0b2JqZWN0WyBmbGFnIF0gPSB0cnVlO1xuXHR9KTtcblx0cmV0dXJuIG9iamVjdDtcbn1cblxuLypcbiAqIENyZWF0ZSBhIGNhbGxiYWNrIGxpc3QgdXNpbmcgdGhlIGZvbGxvd2luZyBwYXJhbWV0ZXJzOlxuICpcbiAqXHRvcHRpb25zOiBhbiBvcHRpb25hbCBsaXN0IG9mIHNwYWNlLXNlcGFyYXRlZCBvcHRpb25zIHRoYXQgd2lsbCBjaGFuZ2UgaG93XG4gKlx0XHRcdHRoZSBjYWxsYmFjayBsaXN0IGJlaGF2ZXMgb3IgYSBtb3JlIHRyYWRpdGlvbmFsIG9wdGlvbiBvYmplY3RcbiAqXG4gKiBCeSBkZWZhdWx0IGEgY2FsbGJhY2sgbGlzdCB3aWxsIGFjdCBsaWtlIGFuIGV2ZW50IGNhbGxiYWNrIGxpc3QgYW5kIGNhbiBiZVxuICogXCJmaXJlZFwiIG11bHRpcGxlIHRpbWVzLlxuICpcbiAqIFBvc3NpYmxlIG9wdGlvbnM6XG4gKlxuICpcdG9uY2U6XHRcdFx0d2lsbCBlbnN1cmUgdGhlIGNhbGxiYWNrIGxpc3QgY2FuIG9ubHkgYmUgZmlyZWQgb25jZSAobGlrZSBhIERlZmVycmVkKVxuICpcbiAqXHRtZW1vcnk6XHRcdFx0d2lsbCBrZWVwIHRyYWNrIG9mIHByZXZpb3VzIHZhbHVlcyBhbmQgd2lsbCBjYWxsIGFueSBjYWxsYmFjayBhZGRlZFxuICpcdFx0XHRcdFx0YWZ0ZXIgdGhlIGxpc3QgaGFzIGJlZW4gZmlyZWQgcmlnaHQgYXdheSB3aXRoIHRoZSBsYXRlc3QgXCJtZW1vcml6ZWRcIlxuICpcdFx0XHRcdFx0dmFsdWVzIChsaWtlIGEgRGVmZXJyZWQpXG4gKlxuICpcdHVuaXF1ZTpcdFx0XHR3aWxsIGVuc3VyZSBhIGNhbGxiYWNrIGNhbiBvbmx5IGJlIGFkZGVkIG9uY2UgKG5vIGR1cGxpY2F0ZSBpbiB0aGUgbGlzdClcbiAqXG4gKlx0c3RvcE9uRmFsc2U6XHRpbnRlcnJ1cHQgY2FsbGluZ3Mgd2hlbiBhIGNhbGxiYWNrIHJldHVybnMgZmFsc2VcbiAqXG4gKi9cbmpRdWVyeS5DYWxsYmFja3MgPSBmdW5jdGlvbiggb3B0aW9ucyApIHtcblxuXHQvLyBDb252ZXJ0IG9wdGlvbnMgZnJvbSBTdHJpbmctZm9ybWF0dGVkIHRvIE9iamVjdC1mb3JtYXR0ZWQgaWYgbmVlZGVkXG5cdC8vICh3ZSBjaGVjayBpbiBjYWNoZSBmaXJzdClcblx0b3B0aW9ucyA9IHR5cGVvZiBvcHRpb25zID09PSBcInN0cmluZ1wiID9cblx0XHQoIG9wdGlvbnNDYWNoZVsgb3B0aW9ucyBdIHx8IGNyZWF0ZU9wdGlvbnMoIG9wdGlvbnMgKSApIDpcblx0XHRqUXVlcnkuZXh0ZW5kKCB7fSwgb3B0aW9ucyApO1xuXG5cdHZhciAvLyBMYXN0IGZpcmUgdmFsdWUgKGZvciBub24tZm9yZ2V0dGFibGUgbGlzdHMpXG5cdFx0bWVtb3J5LFxuXHRcdC8vIEZsYWcgdG8ga25vdyBpZiBsaXN0IHdhcyBhbHJlYWR5IGZpcmVkXG5cdFx0ZmlyZWQsXG5cdFx0Ly8gRmxhZyB0byBrbm93IGlmIGxpc3QgaXMgY3VycmVudGx5IGZpcmluZ1xuXHRcdGZpcmluZyxcblx0XHQvLyBGaXJzdCBjYWxsYmFjayB0byBmaXJlICh1c2VkIGludGVybmFsbHkgYnkgYWRkIGFuZCBmaXJlV2l0aClcblx0XHRmaXJpbmdTdGFydCxcblx0XHQvLyBFbmQgb2YgdGhlIGxvb3Agd2hlbiBmaXJpbmdcblx0XHRmaXJpbmdMZW5ndGgsXG5cdFx0Ly8gSW5kZXggb2YgY3VycmVudGx5IGZpcmluZyBjYWxsYmFjayAobW9kaWZpZWQgYnkgcmVtb3ZlIGlmIG5lZWRlZClcblx0XHRmaXJpbmdJbmRleCxcblx0XHQvLyBBY3R1YWwgY2FsbGJhY2sgbGlzdFxuXHRcdGxpc3QgPSBbXSxcblx0XHQvLyBTdGFjayBvZiBmaXJlIGNhbGxzIGZvciByZXBlYXRhYmxlIGxpc3RzXG5cdFx0c3RhY2sgPSAhb3B0aW9ucy5vbmNlICYmIFtdLFxuXHRcdC8vIEZpcmUgY2FsbGJhY2tzXG5cdFx0ZmlyZSA9IGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdFx0bWVtb3J5ID0gb3B0aW9ucy5tZW1vcnkgJiYgZGF0YTtcblx0XHRcdGZpcmVkID0gdHJ1ZTtcblx0XHRcdGZpcmluZ0luZGV4ID0gZmlyaW5nU3RhcnQgfHwgMDtcblx0XHRcdGZpcmluZ1N0YXJ0ID0gMDtcblx0XHRcdGZpcmluZ0xlbmd0aCA9IGxpc3QubGVuZ3RoO1xuXHRcdFx0ZmlyaW5nID0gdHJ1ZTtcblx0XHRcdGZvciAoIDsgbGlzdCAmJiBmaXJpbmdJbmRleCA8IGZpcmluZ0xlbmd0aDsgZmlyaW5nSW5kZXgrKyApIHtcblx0XHRcdFx0aWYgKCBsaXN0WyBmaXJpbmdJbmRleCBdLmFwcGx5KCBkYXRhWyAwIF0sIGRhdGFbIDEgXSApID09PSBmYWxzZSAmJiBvcHRpb25zLnN0b3BPbkZhbHNlICkge1xuXHRcdFx0XHRcdG1lbW9yeSA9IGZhbHNlOyAvLyBUbyBwcmV2ZW50IGZ1cnRoZXIgY2FsbHMgdXNpbmcgYWRkXG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGZpcmluZyA9IGZhbHNlO1xuXHRcdFx0aWYgKCBsaXN0ICkge1xuXHRcdFx0XHRpZiAoIHN0YWNrICkge1xuXHRcdFx0XHRcdGlmICggc3RhY2subGVuZ3RoICkge1xuXHRcdFx0XHRcdFx0ZmlyZSggc3RhY2suc2hpZnQoKSApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmICggbWVtb3J5ICkge1xuXHRcdFx0XHRcdGxpc3QgPSBbXTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzZWxmLmRpc2FibGUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Ly8gQWN0dWFsIENhbGxiYWNrcyBvYmplY3Rcblx0XHRzZWxmID0ge1xuXHRcdFx0Ly8gQWRkIGEgY2FsbGJhY2sgb3IgYSBjb2xsZWN0aW9uIG9mIGNhbGxiYWNrcyB0byB0aGUgbGlzdFxuXHRcdFx0YWRkOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKCBsaXN0ICkge1xuXHRcdFx0XHRcdC8vIEZpcnN0LCB3ZSBzYXZlIHRoZSBjdXJyZW50IGxlbmd0aFxuXHRcdFx0XHRcdHZhciBzdGFydCA9IGxpc3QubGVuZ3RoO1xuXHRcdFx0XHRcdChmdW5jdGlvbiBhZGQoIGFyZ3MgKSB7XG5cdFx0XHRcdFx0XHRqUXVlcnkuZWFjaCggYXJncywgZnVuY3Rpb24oIF8sIGFyZyApIHtcblx0XHRcdFx0XHRcdFx0dmFyIHR5cGUgPSBqUXVlcnkudHlwZSggYXJnICk7XG5cdFx0XHRcdFx0XHRcdGlmICggdHlwZSA9PT0gXCJmdW5jdGlvblwiICkge1xuXHRcdFx0XHRcdFx0XHRcdGlmICggIW9wdGlvbnMudW5pcXVlIHx8ICFzZWxmLmhhcyggYXJnICkgKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRsaXN0LnB1c2goIGFyZyApO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmICggYXJnICYmIGFyZy5sZW5ndGggJiYgdHlwZSAhPT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBJbnNwZWN0IHJlY3Vyc2l2ZWx5XG5cdFx0XHRcdFx0XHRcdFx0YWRkKCBhcmcgKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSkoIGFyZ3VtZW50cyApO1xuXHRcdFx0XHRcdC8vIERvIHdlIG5lZWQgdG8gYWRkIHRoZSBjYWxsYmFja3MgdG8gdGhlXG5cdFx0XHRcdFx0Ly8gY3VycmVudCBmaXJpbmcgYmF0Y2g/XG5cdFx0XHRcdFx0aWYgKCBmaXJpbmcgKSB7XG5cdFx0XHRcdFx0XHRmaXJpbmdMZW5ndGggPSBsaXN0Lmxlbmd0aDtcblx0XHRcdFx0XHQvLyBXaXRoIG1lbW9yeSwgaWYgd2UncmUgbm90IGZpcmluZyB0aGVuXG5cdFx0XHRcdFx0Ly8gd2Ugc2hvdWxkIGNhbGwgcmlnaHQgYXdheVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoIG1lbW9yeSApIHtcblx0XHRcdFx0XHRcdGZpcmluZ1N0YXJ0ID0gc3RhcnQ7XG5cdFx0XHRcdFx0XHRmaXJlKCBtZW1vcnkgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0XHR9LFxuXHRcdFx0Ly8gUmVtb3ZlIGEgY2FsbGJhY2sgZnJvbSB0aGUgbGlzdFxuXHRcdFx0cmVtb3ZlOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKCBsaXN0ICkge1xuXHRcdFx0XHRcdGpRdWVyeS5lYWNoKCBhcmd1bWVudHMsIGZ1bmN0aW9uKCBfLCBhcmcgKSB7XG5cdFx0XHRcdFx0XHR2YXIgaW5kZXg7XG5cdFx0XHRcdFx0XHR3aGlsZSAoICggaW5kZXggPSBqUXVlcnkuaW5BcnJheSggYXJnLCBsaXN0LCBpbmRleCApICkgPiAtMSApIHtcblx0XHRcdFx0XHRcdFx0bGlzdC5zcGxpY2UoIGluZGV4LCAxICk7XG5cdFx0XHRcdFx0XHRcdC8vIEhhbmRsZSBmaXJpbmcgaW5kZXhlc1xuXHRcdFx0XHRcdFx0XHRpZiAoIGZpcmluZyApIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoIGluZGV4IDw9IGZpcmluZ0xlbmd0aCApIHtcblx0XHRcdFx0XHRcdFx0XHRcdGZpcmluZ0xlbmd0aC0tO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRpZiAoIGluZGV4IDw9IGZpcmluZ0luZGV4ICkge1xuXHRcdFx0XHRcdFx0XHRcdFx0ZmlyaW5nSW5kZXgtLTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdGhpcztcblx0XHRcdH0sXG5cdFx0XHQvLyBDaGVjayBpZiBhIGdpdmVuIGNhbGxiYWNrIGlzIGluIHRoZSBsaXN0LlxuXHRcdFx0Ly8gSWYgbm8gYXJndW1lbnQgaXMgZ2l2ZW4sIHJldHVybiB3aGV0aGVyIG9yIG5vdCBsaXN0IGhhcyBjYWxsYmFja3MgYXR0YWNoZWQuXG5cdFx0XHRoYXM6IGZ1bmN0aW9uKCBmbiApIHtcblx0XHRcdFx0cmV0dXJuIGZuID8galF1ZXJ5LmluQXJyYXkoIGZuLCBsaXN0ICkgPiAtMSA6ICEhKCBsaXN0ICYmIGxpc3QubGVuZ3RoICk7XG5cdFx0XHR9LFxuXHRcdFx0Ly8gUmVtb3ZlIGFsbCBjYWxsYmFja3MgZnJvbSB0aGUgbGlzdFxuXHRcdFx0ZW1wdHk6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRsaXN0ID0gW107XG5cdFx0XHRcdGZpcmluZ0xlbmd0aCA9IDA7XG5cdFx0XHRcdHJldHVybiB0aGlzO1xuXHRcdFx0fSxcblx0XHRcdC8vIEhhdmUgdGhlIGxpc3QgZG8gbm90aGluZyBhbnltb3JlXG5cdFx0XHRkaXNhYmxlOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0bGlzdCA9IHN0YWNrID0gbWVtb3J5ID0gdW5kZWZpbmVkO1xuXHRcdFx0XHRyZXR1cm4gdGhpcztcblx0XHRcdH0sXG5cdFx0XHQvLyBJcyBpdCBkaXNhYmxlZD9cblx0XHRcdGRpc2FibGVkOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuICFsaXN0O1xuXHRcdFx0fSxcblx0XHRcdC8vIExvY2sgdGhlIGxpc3QgaW4gaXRzIGN1cnJlbnQgc3RhdGVcblx0XHRcdGxvY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRzdGFjayA9IHVuZGVmaW5lZDtcblx0XHRcdFx0aWYgKCAhbWVtb3J5ICkge1xuXHRcdFx0XHRcdHNlbGYuZGlzYWJsZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB0aGlzO1xuXHRcdFx0fSxcblx0XHRcdC8vIElzIGl0IGxvY2tlZD9cblx0XHRcdGxvY2tlZDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiAhc3RhY2s7XG5cdFx0XHR9LFxuXHRcdFx0Ly8gQ2FsbCBhbGwgY2FsbGJhY2tzIHdpdGggdGhlIGdpdmVuIGNvbnRleHQgYW5kIGFyZ3VtZW50c1xuXHRcdFx0ZmlyZVdpdGg6IGZ1bmN0aW9uKCBjb250ZXh0LCBhcmdzICkge1xuXHRcdFx0XHRpZiAoIGxpc3QgJiYgKCAhZmlyZWQgfHwgc3RhY2sgKSApIHtcblx0XHRcdFx0XHRhcmdzID0gYXJncyB8fCBbXTtcblx0XHRcdFx0XHRhcmdzID0gWyBjb250ZXh0LCBhcmdzLnNsaWNlID8gYXJncy5zbGljZSgpIDogYXJncyBdO1xuXHRcdFx0XHRcdGlmICggZmlyaW5nICkge1xuXHRcdFx0XHRcdFx0c3RhY2sucHVzaCggYXJncyApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRmaXJlKCBhcmdzICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB0aGlzO1xuXHRcdFx0fSxcblx0XHRcdC8vIENhbGwgYWxsIHRoZSBjYWxsYmFja3Mgd2l0aCB0aGUgZ2l2ZW4gYXJndW1lbnRzXG5cdFx0XHRmaXJlOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0c2VsZi5maXJlV2l0aCggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0XHRcdHJldHVybiB0aGlzO1xuXHRcdFx0fSxcblx0XHRcdC8vIFRvIGtub3cgaWYgdGhlIGNhbGxiYWNrcyBoYXZlIGFscmVhZHkgYmVlbiBjYWxsZWQgYXQgbGVhc3Qgb25jZVxuXHRcdFx0ZmlyZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gISFmaXJlZDtcblx0XHRcdH1cblx0XHR9O1xuXG5cdHJldHVybiBzZWxmO1xufTtcblxuXG5qUXVlcnkuZXh0ZW5kKHtcblxuXHREZWZlcnJlZDogZnVuY3Rpb24oIGZ1bmMgKSB7XG5cdFx0dmFyIHR1cGxlcyA9IFtcblx0XHRcdFx0Ly8gYWN0aW9uLCBhZGQgbGlzdGVuZXIsIGxpc3RlbmVyIGxpc3QsIGZpbmFsIHN0YXRlXG5cdFx0XHRcdFsgXCJyZXNvbHZlXCIsIFwiZG9uZVwiLCBqUXVlcnkuQ2FsbGJhY2tzKFwib25jZSBtZW1vcnlcIiksIFwicmVzb2x2ZWRcIiBdLFxuXHRcdFx0XHRbIFwicmVqZWN0XCIsIFwiZmFpbFwiLCBqUXVlcnkuQ2FsbGJhY2tzKFwib25jZSBtZW1vcnlcIiksIFwicmVqZWN0ZWRcIiBdLFxuXHRcdFx0XHRbIFwibm90aWZ5XCIsIFwicHJvZ3Jlc3NcIiwgalF1ZXJ5LkNhbGxiYWNrcyhcIm1lbW9yeVwiKSBdXG5cdFx0XHRdLFxuXHRcdFx0c3RhdGUgPSBcInBlbmRpbmdcIixcblx0XHRcdHByb21pc2UgPSB7XG5cdFx0XHRcdHN0YXRlOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRyZXR1cm4gc3RhdGU7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGFsd2F5czogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0ZGVmZXJyZWQuZG9uZSggYXJndW1lbnRzICkuZmFpbCggYXJndW1lbnRzICk7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHRoZW46IGZ1bmN0aW9uKCAvKiBmbkRvbmUsIGZuRmFpbCwgZm5Qcm9ncmVzcyAqLyApIHtcblx0XHRcdFx0XHR2YXIgZm5zID0gYXJndW1lbnRzO1xuXHRcdFx0XHRcdHJldHVybiBqUXVlcnkuRGVmZXJyZWQoZnVuY3Rpb24oIG5ld0RlZmVyICkge1xuXHRcdFx0XHRcdFx0alF1ZXJ5LmVhY2goIHR1cGxlcywgZnVuY3Rpb24oIGksIHR1cGxlICkge1xuXHRcdFx0XHRcdFx0XHR2YXIgZm4gPSBqUXVlcnkuaXNGdW5jdGlvbiggZm5zWyBpIF0gKSAmJiBmbnNbIGkgXTtcblx0XHRcdFx0XHRcdFx0Ly8gZGVmZXJyZWRbIGRvbmUgfCBmYWlsIHwgcHJvZ3Jlc3MgXSBmb3IgZm9yd2FyZGluZyBhY3Rpb25zIHRvIG5ld0RlZmVyXG5cdFx0XHRcdFx0XHRcdGRlZmVycmVkWyB0dXBsZVsxXSBdKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdHZhciByZXR1cm5lZCA9IGZuICYmIGZuLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHRcdFx0XHRcdFx0XHRpZiAoIHJldHVybmVkICYmIGpRdWVyeS5pc0Z1bmN0aW9uKCByZXR1cm5lZC5wcm9taXNlICkgKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm5lZC5wcm9taXNlKClcblx0XHRcdFx0XHRcdFx0XHRcdFx0LmRvbmUoIG5ld0RlZmVyLnJlc29sdmUgKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQuZmFpbCggbmV3RGVmZXIucmVqZWN0IClcblx0XHRcdFx0XHRcdFx0XHRcdFx0LnByb2dyZXNzKCBuZXdEZWZlci5ub3RpZnkgKTtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0bmV3RGVmZXJbIHR1cGxlWyAwIF0gKyBcIldpdGhcIiBdKCB0aGlzID09PSBwcm9taXNlID8gbmV3RGVmZXIucHJvbWlzZSgpIDogdGhpcywgZm4gPyBbIHJldHVybmVkIF0gOiBhcmd1bWVudHMgKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRmbnMgPSBudWxsO1xuXHRcdFx0XHRcdH0pLnByb21pc2UoKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0Ly8gR2V0IGEgcHJvbWlzZSBmb3IgdGhpcyBkZWZlcnJlZFxuXHRcdFx0XHQvLyBJZiBvYmogaXMgcHJvdmlkZWQsIHRoZSBwcm9taXNlIGFzcGVjdCBpcyBhZGRlZCB0byB0aGUgb2JqZWN0XG5cdFx0XHRcdHByb21pc2U6IGZ1bmN0aW9uKCBvYmogKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9iaiAhPSBudWxsID8galF1ZXJ5LmV4dGVuZCggb2JqLCBwcm9taXNlICkgOiBwcm9taXNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0ZGVmZXJyZWQgPSB7fTtcblxuXHRcdC8vIEtlZXAgcGlwZSBmb3IgYmFjay1jb21wYXRcblx0XHRwcm9taXNlLnBpcGUgPSBwcm9taXNlLnRoZW47XG5cblx0XHQvLyBBZGQgbGlzdC1zcGVjaWZpYyBtZXRob2RzXG5cdFx0alF1ZXJ5LmVhY2goIHR1cGxlcywgZnVuY3Rpb24oIGksIHR1cGxlICkge1xuXHRcdFx0dmFyIGxpc3QgPSB0dXBsZVsgMiBdLFxuXHRcdFx0XHRzdGF0ZVN0cmluZyA9IHR1cGxlWyAzIF07XG5cblx0XHRcdC8vIHByb21pc2VbIGRvbmUgfCBmYWlsIHwgcHJvZ3Jlc3MgXSA9IGxpc3QuYWRkXG5cdFx0XHRwcm9taXNlWyB0dXBsZVsxXSBdID0gbGlzdC5hZGQ7XG5cblx0XHRcdC8vIEhhbmRsZSBzdGF0ZVxuXHRcdFx0aWYgKCBzdGF0ZVN0cmluZyApIHtcblx0XHRcdFx0bGlzdC5hZGQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0Ly8gc3RhdGUgPSBbIHJlc29sdmVkIHwgcmVqZWN0ZWQgXVxuXHRcdFx0XHRcdHN0YXRlID0gc3RhdGVTdHJpbmc7XG5cblx0XHRcdFx0Ly8gWyByZWplY3RfbGlzdCB8IHJlc29sdmVfbGlzdCBdLmRpc2FibGU7IHByb2dyZXNzX2xpc3QubG9ja1xuXHRcdFx0XHR9LCB0dXBsZXNbIGkgXiAxIF1bIDIgXS5kaXNhYmxlLCB0dXBsZXNbIDIgXVsgMiBdLmxvY2sgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gZGVmZXJyZWRbIHJlc29sdmUgfCByZWplY3QgfCBub3RpZnkgXVxuXHRcdFx0ZGVmZXJyZWRbIHR1cGxlWzBdIF0gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0ZGVmZXJyZWRbIHR1cGxlWzBdICsgXCJXaXRoXCIgXSggdGhpcyA9PT0gZGVmZXJyZWQgPyBwcm9taXNlIDogdGhpcywgYXJndW1lbnRzICk7XG5cdFx0XHRcdHJldHVybiB0aGlzO1xuXHRcdFx0fTtcblx0XHRcdGRlZmVycmVkWyB0dXBsZVswXSArIFwiV2l0aFwiIF0gPSBsaXN0LmZpcmVXaXRoO1xuXHRcdH0pO1xuXG5cdFx0Ly8gTWFrZSB0aGUgZGVmZXJyZWQgYSBwcm9taXNlXG5cdFx0cHJvbWlzZS5wcm9taXNlKCBkZWZlcnJlZCApO1xuXG5cdFx0Ly8gQ2FsbCBnaXZlbiBmdW5jIGlmIGFueVxuXHRcdGlmICggZnVuYyApIHtcblx0XHRcdGZ1bmMuY2FsbCggZGVmZXJyZWQsIGRlZmVycmVkICk7XG5cdFx0fVxuXG5cdFx0Ly8gQWxsIGRvbmUhXG5cdFx0cmV0dXJuIGRlZmVycmVkO1xuXHR9LFxuXG5cdC8vIERlZmVycmVkIGhlbHBlclxuXHR3aGVuOiBmdW5jdGlvbiggc3Vib3JkaW5hdGUgLyogLCAuLi4sIHN1Ym9yZGluYXRlTiAqLyApIHtcblx0XHR2YXIgaSA9IDAsXG5cdFx0XHRyZXNvbHZlVmFsdWVzID0gc2xpY2UuY2FsbCggYXJndW1lbnRzICksXG5cdFx0XHRsZW5ndGggPSByZXNvbHZlVmFsdWVzLmxlbmd0aCxcblxuXHRcdFx0Ly8gdGhlIGNvdW50IG9mIHVuY29tcGxldGVkIHN1Ym9yZGluYXRlc1xuXHRcdFx0cmVtYWluaW5nID0gbGVuZ3RoICE9PSAxIHx8ICggc3Vib3JkaW5hdGUgJiYgalF1ZXJ5LmlzRnVuY3Rpb24oIHN1Ym9yZGluYXRlLnByb21pc2UgKSApID8gbGVuZ3RoIDogMCxcblxuXHRcdFx0Ly8gdGhlIG1hc3RlciBEZWZlcnJlZC4gSWYgcmVzb2x2ZVZhbHVlcyBjb25zaXN0IG9mIG9ubHkgYSBzaW5nbGUgRGVmZXJyZWQsIGp1c3QgdXNlIHRoYXQuXG5cdFx0XHRkZWZlcnJlZCA9IHJlbWFpbmluZyA9PT0gMSA/IHN1Ym9yZGluYXRlIDogalF1ZXJ5LkRlZmVycmVkKCksXG5cblx0XHRcdC8vIFVwZGF0ZSBmdW5jdGlvbiBmb3IgYm90aCByZXNvbHZlIGFuZCBwcm9ncmVzcyB2YWx1ZXNcblx0XHRcdHVwZGF0ZUZ1bmMgPSBmdW5jdGlvbiggaSwgY29udGV4dHMsIHZhbHVlcyApIHtcblx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCB2YWx1ZSApIHtcblx0XHRcdFx0XHRjb250ZXh0c1sgaSBdID0gdGhpcztcblx0XHRcdFx0XHR2YWx1ZXNbIGkgXSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gc2xpY2UuY2FsbCggYXJndW1lbnRzICkgOiB2YWx1ZTtcblx0XHRcdFx0XHRpZiAoIHZhbHVlcyA9PT0gcHJvZ3Jlc3NWYWx1ZXMgKSB7XG5cdFx0XHRcdFx0XHRkZWZlcnJlZC5ub3RpZnlXaXRoKCBjb250ZXh0cywgdmFsdWVzICk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmICggISggLS1yZW1haW5pbmcgKSApIHtcblx0XHRcdFx0XHRcdGRlZmVycmVkLnJlc29sdmVXaXRoKCBjb250ZXh0cywgdmFsdWVzICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXHRcdFx0fSxcblxuXHRcdFx0cHJvZ3Jlc3NWYWx1ZXMsIHByb2dyZXNzQ29udGV4dHMsIHJlc29sdmVDb250ZXh0cztcblxuXHRcdC8vIGFkZCBsaXN0ZW5lcnMgdG8gRGVmZXJyZWQgc3Vib3JkaW5hdGVzOyB0cmVhdCBvdGhlcnMgYXMgcmVzb2x2ZWRcblx0XHRpZiAoIGxlbmd0aCA+IDEgKSB7XG5cdFx0XHRwcm9ncmVzc1ZhbHVlcyA9IG5ldyBBcnJheSggbGVuZ3RoICk7XG5cdFx0XHRwcm9ncmVzc0NvbnRleHRzID0gbmV3IEFycmF5KCBsZW5ndGggKTtcblx0XHRcdHJlc29sdmVDb250ZXh0cyA9IG5ldyBBcnJheSggbGVuZ3RoICk7XG5cdFx0XHRmb3IgKCA7IGkgPCBsZW5ndGg7IGkrKyApIHtcblx0XHRcdFx0aWYgKCByZXNvbHZlVmFsdWVzWyBpIF0gJiYgalF1ZXJ5LmlzRnVuY3Rpb24oIHJlc29sdmVWYWx1ZXNbIGkgXS5wcm9taXNlICkgKSB7XG5cdFx0XHRcdFx0cmVzb2x2ZVZhbHVlc1sgaSBdLnByb21pc2UoKVxuXHRcdFx0XHRcdFx0LmRvbmUoIHVwZGF0ZUZ1bmMoIGksIHJlc29sdmVDb250ZXh0cywgcmVzb2x2ZVZhbHVlcyApIClcblx0XHRcdFx0XHRcdC5mYWlsKCBkZWZlcnJlZC5yZWplY3QgKVxuXHRcdFx0XHRcdFx0LnByb2dyZXNzKCB1cGRhdGVGdW5jKCBpLCBwcm9ncmVzc0NvbnRleHRzLCBwcm9ncmVzc1ZhbHVlcyApICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0LS1yZW1haW5pbmc7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBpZiB3ZSdyZSBub3Qgd2FpdGluZyBvbiBhbnl0aGluZywgcmVzb2x2ZSB0aGUgbWFzdGVyXG5cdFx0aWYgKCAhcmVtYWluaW5nICkge1xuXHRcdFx0ZGVmZXJyZWQucmVzb2x2ZVdpdGgoIHJlc29sdmVDb250ZXh0cywgcmVzb2x2ZVZhbHVlcyApO1xuXHRcdH1cblxuXHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlKCk7XG5cdH1cbn0pO1xuXG5cbi8vIFRoZSBkZWZlcnJlZCB1c2VkIG9uIERPTSByZWFkeVxudmFyIHJlYWR5TGlzdDtcblxualF1ZXJ5LmZuLnJlYWR5ID0gZnVuY3Rpb24oIGZuICkge1xuXHQvLyBBZGQgdGhlIGNhbGxiYWNrXG5cdGpRdWVyeS5yZWFkeS5wcm9taXNlKCkuZG9uZSggZm4gKTtcblxuXHRyZXR1cm4gdGhpcztcbn07XG5cbmpRdWVyeS5leHRlbmQoe1xuXHQvLyBJcyB0aGUgRE9NIHJlYWR5IHRvIGJlIHVzZWQ/IFNldCB0byB0cnVlIG9uY2UgaXQgb2NjdXJzLlxuXHRpc1JlYWR5OiBmYWxzZSxcblxuXHQvLyBBIGNvdW50ZXIgdG8gdHJhY2sgaG93IG1hbnkgaXRlbXMgdG8gd2FpdCBmb3IgYmVmb3JlXG5cdC8vIHRoZSByZWFkeSBldmVudCBmaXJlcy4gU2VlICM2NzgxXG5cdHJlYWR5V2FpdDogMSxcblxuXHQvLyBIb2xkIChvciByZWxlYXNlKSB0aGUgcmVhZHkgZXZlbnRcblx0aG9sZFJlYWR5OiBmdW5jdGlvbiggaG9sZCApIHtcblx0XHRpZiAoIGhvbGQgKSB7XG5cdFx0XHRqUXVlcnkucmVhZHlXYWl0Kys7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGpRdWVyeS5yZWFkeSggdHJ1ZSApO1xuXHRcdH1cblx0fSxcblxuXHQvLyBIYW5kbGUgd2hlbiB0aGUgRE9NIGlzIHJlYWR5XG5cdHJlYWR5OiBmdW5jdGlvbiggd2FpdCApIHtcblxuXHRcdC8vIEFib3J0IGlmIHRoZXJlIGFyZSBwZW5kaW5nIGhvbGRzIG9yIHdlJ3JlIGFscmVhZHkgcmVhZHlcblx0XHRpZiAoIHdhaXQgPT09IHRydWUgPyAtLWpRdWVyeS5yZWFkeVdhaXQgOiBqUXVlcnkuaXNSZWFkeSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBSZW1lbWJlciB0aGF0IHRoZSBET00gaXMgcmVhZHlcblx0XHRqUXVlcnkuaXNSZWFkeSA9IHRydWU7XG5cblx0XHQvLyBJZiBhIG5vcm1hbCBET00gUmVhZHkgZXZlbnQgZmlyZWQsIGRlY3JlbWVudCwgYW5kIHdhaXQgaWYgbmVlZCBiZVxuXHRcdGlmICggd2FpdCAhPT0gdHJ1ZSAmJiAtLWpRdWVyeS5yZWFkeVdhaXQgPiAwICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIElmIHRoZXJlIGFyZSBmdW5jdGlvbnMgYm91bmQsIHRvIGV4ZWN1dGVcblx0XHRyZWFkeUxpc3QucmVzb2x2ZVdpdGgoIGRvY3VtZW50LCBbIGpRdWVyeSBdICk7XG5cblx0XHQvLyBUcmlnZ2VyIGFueSBib3VuZCByZWFkeSBldmVudHNcblx0XHRpZiAoIGpRdWVyeS5mbi50cmlnZ2VyICkge1xuXHRcdFx0alF1ZXJ5KCBkb2N1bWVudCApLnRyaWdnZXIoXCJyZWFkeVwiKS5vZmYoXCJyZWFkeVwiKTtcblx0XHR9XG5cdH1cbn0pO1xuXG4vKipcbiAqIFRoZSByZWFkeSBldmVudCBoYW5kbGVyIGFuZCBzZWxmIGNsZWFudXAgbWV0aG9kXG4gKi9cbmZ1bmN0aW9uIGNvbXBsZXRlZCgpIHtcblx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggXCJET01Db250ZW50TG9hZGVkXCIsIGNvbXBsZXRlZCwgZmFsc2UgKTtcblx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoIFwibG9hZFwiLCBjb21wbGV0ZWQsIGZhbHNlICk7XG5cdGpRdWVyeS5yZWFkeSgpO1xufVxuXG5qUXVlcnkucmVhZHkucHJvbWlzZSA9IGZ1bmN0aW9uKCBvYmogKSB7XG5cdGlmICggIXJlYWR5TGlzdCApIHtcblxuXHRcdHJlYWR5TGlzdCA9IGpRdWVyeS5EZWZlcnJlZCgpO1xuXG5cdFx0Ly8gQ2F0Y2ggY2FzZXMgd2hlcmUgJChkb2N1bWVudCkucmVhZHkoKSBpcyBjYWxsZWQgYWZ0ZXIgdGhlIGJyb3dzZXIgZXZlbnQgaGFzIGFscmVhZHkgb2NjdXJyZWQuXG5cdFx0Ly8gd2Ugb25jZSB0cmllZCB0byB1c2UgcmVhZHlTdGF0ZSBcImludGVyYWN0aXZlXCIgaGVyZSwgYnV0IGl0IGNhdXNlZCBpc3N1ZXMgbGlrZSB0aGUgb25lXG5cdFx0Ly8gZGlzY292ZXJlZCBieSBDaHJpc1MgaGVyZTogaHR0cDovL2J1Z3MuanF1ZXJ5LmNvbS90aWNrZXQvMTIyODIjY29tbWVudDoxNVxuXHRcdGlmICggZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiICkge1xuXHRcdFx0Ly8gSGFuZGxlIGl0IGFzeW5jaHJvbm91c2x5IHRvIGFsbG93IHNjcmlwdHMgdGhlIG9wcG9ydHVuaXR5IHRvIGRlbGF5IHJlYWR5XG5cdFx0XHRzZXRUaW1lb3V0KCBqUXVlcnkucmVhZHkgKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdC8vIFVzZSB0aGUgaGFuZHkgZXZlbnQgY2FsbGJhY2tcblx0XHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoIFwiRE9NQ29udGVudExvYWRlZFwiLCBjb21wbGV0ZWQsIGZhbHNlICk7XG5cblx0XHRcdC8vIEEgZmFsbGJhY2sgdG8gd2luZG93Lm9ubG9hZCwgdGhhdCB3aWxsIGFsd2F5cyB3b3JrXG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggXCJsb2FkXCIsIGNvbXBsZXRlZCwgZmFsc2UgKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJlYWR5TGlzdC5wcm9taXNlKCBvYmogKTtcbn07XG5cbi8vIEtpY2sgb2ZmIHRoZSBET00gcmVhZHkgY2hlY2sgZXZlbiBpZiB0aGUgdXNlciBkb2VzIG5vdFxualF1ZXJ5LnJlYWR5LnByb21pc2UoKTtcblxuXG5cblxuLy8gTXVsdGlmdW5jdGlvbmFsIG1ldGhvZCB0byBnZXQgYW5kIHNldCB2YWx1ZXMgb2YgYSBjb2xsZWN0aW9uXG4vLyBUaGUgdmFsdWUvcyBjYW4gb3B0aW9uYWxseSBiZSBleGVjdXRlZCBpZiBpdCdzIGEgZnVuY3Rpb25cbnZhciBhY2Nlc3MgPSBqUXVlcnkuYWNjZXNzID0gZnVuY3Rpb24oIGVsZW1zLCBmbiwga2V5LCB2YWx1ZSwgY2hhaW5hYmxlLCBlbXB0eUdldCwgcmF3ICkge1xuXHR2YXIgaSA9IDAsXG5cdFx0bGVuID0gZWxlbXMubGVuZ3RoLFxuXHRcdGJ1bGsgPSBrZXkgPT0gbnVsbDtcblxuXHQvLyBTZXRzIG1hbnkgdmFsdWVzXG5cdGlmICggalF1ZXJ5LnR5cGUoIGtleSApID09PSBcIm9iamVjdFwiICkge1xuXHRcdGNoYWluYWJsZSA9IHRydWU7XG5cdFx0Zm9yICggaSBpbiBrZXkgKSB7XG5cdFx0XHRqUXVlcnkuYWNjZXNzKCBlbGVtcywgZm4sIGksIGtleVtpXSwgdHJ1ZSwgZW1wdHlHZXQsIHJhdyApO1xuXHRcdH1cblxuXHQvLyBTZXRzIG9uZSB2YWx1ZVxuXHR9IGVsc2UgaWYgKCB2YWx1ZSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdGNoYWluYWJsZSA9IHRydWU7XG5cblx0XHRpZiAoICFqUXVlcnkuaXNGdW5jdGlvbiggdmFsdWUgKSApIHtcblx0XHRcdHJhdyA9IHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKCBidWxrICkge1xuXHRcdFx0Ly8gQnVsayBvcGVyYXRpb25zIHJ1biBhZ2FpbnN0IHRoZSBlbnRpcmUgc2V0XG5cdFx0XHRpZiAoIHJhdyApIHtcblx0XHRcdFx0Zm4uY2FsbCggZWxlbXMsIHZhbHVlICk7XG5cdFx0XHRcdGZuID0gbnVsbDtcblxuXHRcdFx0Ly8gLi4uZXhjZXB0IHdoZW4gZXhlY3V0aW5nIGZ1bmN0aW9uIHZhbHVlc1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YnVsayA9IGZuO1xuXHRcdFx0XHRmbiA9IGZ1bmN0aW9uKCBlbGVtLCBrZXksIHZhbHVlICkge1xuXHRcdFx0XHRcdHJldHVybiBidWxrLmNhbGwoIGpRdWVyeSggZWxlbSApLCB2YWx1ZSApO1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICggZm4gKSB7XG5cdFx0XHRmb3IgKCA7IGkgPCBsZW47IGkrKyApIHtcblx0XHRcdFx0Zm4oIGVsZW1zW2ldLCBrZXksIHJhdyA/IHZhbHVlIDogdmFsdWUuY2FsbCggZWxlbXNbaV0sIGksIGZuKCBlbGVtc1tpXSwga2V5ICkgKSApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBjaGFpbmFibGUgP1xuXHRcdGVsZW1zIDpcblxuXHRcdC8vIEdldHNcblx0XHRidWxrID9cblx0XHRcdGZuLmNhbGwoIGVsZW1zICkgOlxuXHRcdFx0bGVuID8gZm4oIGVsZW1zWzBdLCBrZXkgKSA6IGVtcHR5R2V0O1xufTtcblxuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciBhbiBvYmplY3QgY2FuIGhhdmUgZGF0YVxuICovXG5qUXVlcnkuYWNjZXB0RGF0YSA9IGZ1bmN0aW9uKCBvd25lciApIHtcblx0Ly8gQWNjZXB0cyBvbmx5OlxuXHQvLyAgLSBOb2RlXG5cdC8vICAgIC0gTm9kZS5FTEVNRU5UX05PREVcblx0Ly8gICAgLSBOb2RlLkRPQ1VNRU5UX05PREVcblx0Ly8gIC0gT2JqZWN0XG5cdC8vICAgIC0gQW55XG5cdC8qIGpzaGludCAtVzAxOCAqL1xuXHRyZXR1cm4gb3duZXIubm9kZVR5cGUgPT09IDEgfHwgb3duZXIubm9kZVR5cGUgPT09IDkgfHwgISggK293bmVyLm5vZGVUeXBlICk7XG59O1xuXG5cbmZ1bmN0aW9uIERhdGEoKSB7XG5cdC8vIFN1cHBvcnQ6IEFuZHJvaWQgPCA0LFxuXHQvLyBPbGQgV2ViS2l0IGRvZXMgbm90IGhhdmUgT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zL2ZyZWV6ZSBtZXRob2QsXG5cdC8vIHJldHVybiBuZXcgZW1wdHkgb2JqZWN0IGluc3RlYWQgd2l0aCBubyBbW3NldF1dIGFjY2Vzc29yXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcy5jYWNoZSA9IHt9LCAwLCB7XG5cdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB7fTtcblx0XHR9XG5cdH0pO1xuXG5cdHRoaXMuZXhwYW5kbyA9IGpRdWVyeS5leHBhbmRvICsgTWF0aC5yYW5kb20oKTtcbn1cblxuRGF0YS51aWQgPSAxO1xuRGF0YS5hY2NlcHRzID0galF1ZXJ5LmFjY2VwdERhdGE7XG5cbkRhdGEucHJvdG90eXBlID0ge1xuXHRrZXk6IGZ1bmN0aW9uKCBvd25lciApIHtcblx0XHQvLyBXZSBjYW4gYWNjZXB0IGRhdGEgZm9yIG5vbi1lbGVtZW50IG5vZGVzIGluIG1vZGVybiBicm93c2Vycyxcblx0XHQvLyBidXQgd2Ugc2hvdWxkIG5vdCwgc2VlICM4MzM1LlxuXHRcdC8vIEFsd2F5cyByZXR1cm4gdGhlIGtleSBmb3IgYSBmcm96ZW4gb2JqZWN0LlxuXHRcdGlmICggIURhdGEuYWNjZXB0cyggb3duZXIgKSApIHtcblx0XHRcdHJldHVybiAwO1xuXHRcdH1cblxuXHRcdHZhciBkZXNjcmlwdG9yID0ge30sXG5cdFx0XHQvLyBDaGVjayBpZiB0aGUgb3duZXIgb2JqZWN0IGFscmVhZHkgaGFzIGEgY2FjaGUga2V5XG5cdFx0XHR1bmxvY2sgPSBvd25lclsgdGhpcy5leHBhbmRvIF07XG5cblx0XHQvLyBJZiBub3QsIGNyZWF0ZSBvbmVcblx0XHRpZiAoICF1bmxvY2sgKSB7XG5cdFx0XHR1bmxvY2sgPSBEYXRhLnVpZCsrO1xuXG5cdFx0XHQvLyBTZWN1cmUgaXQgaW4gYSBub24tZW51bWVyYWJsZSwgbm9uLXdyaXRhYmxlIHByb3BlcnR5XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRkZXNjcmlwdG9yWyB0aGlzLmV4cGFuZG8gXSA9IHsgdmFsdWU6IHVubG9jayB9O1xuXHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydGllcyggb3duZXIsIGRlc2NyaXB0b3IgKTtcblxuXHRcdFx0Ly8gU3VwcG9ydDogQW5kcm9pZCA8IDRcblx0XHRcdC8vIEZhbGxiYWNrIHRvIGEgbGVzcyBzZWN1cmUgZGVmaW5pdGlvblxuXHRcdFx0fSBjYXRjaCAoIGUgKSB7XG5cdFx0XHRcdGRlc2NyaXB0b3JbIHRoaXMuZXhwYW5kbyBdID0gdW5sb2NrO1xuXHRcdFx0XHRqUXVlcnkuZXh0ZW5kKCBvd25lciwgZGVzY3JpcHRvciApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIEVuc3VyZSB0aGUgY2FjaGUgb2JqZWN0XG5cdFx0aWYgKCAhdGhpcy5jYWNoZVsgdW5sb2NrIF0gKSB7XG5cdFx0XHR0aGlzLmNhY2hlWyB1bmxvY2sgXSA9IHt9O1xuXHRcdH1cblxuXHRcdHJldHVybiB1bmxvY2s7XG5cdH0sXG5cdHNldDogZnVuY3Rpb24oIG93bmVyLCBkYXRhLCB2YWx1ZSApIHtcblx0XHR2YXIgcHJvcCxcblx0XHRcdC8vIFRoZXJlIG1heSBiZSBhbiB1bmxvY2sgYXNzaWduZWQgdG8gdGhpcyBub2RlLFxuXHRcdFx0Ly8gaWYgdGhlcmUgaXMgbm8gZW50cnkgZm9yIHRoaXMgXCJvd25lclwiLCBjcmVhdGUgb25lIGlubGluZVxuXHRcdFx0Ly8gYW5kIHNldCB0aGUgdW5sb2NrIGFzIHRob3VnaCBhbiBvd25lciBlbnRyeSBoYWQgYWx3YXlzIGV4aXN0ZWRcblx0XHRcdHVubG9jayA9IHRoaXMua2V5KCBvd25lciApLFxuXHRcdFx0Y2FjaGUgPSB0aGlzLmNhY2hlWyB1bmxvY2sgXTtcblxuXHRcdC8vIEhhbmRsZTogWyBvd25lciwga2V5LCB2YWx1ZSBdIGFyZ3Ncblx0XHRpZiAoIHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiICkge1xuXHRcdFx0Y2FjaGVbIGRhdGEgXSA9IHZhbHVlO1xuXG5cdFx0Ly8gSGFuZGxlOiBbIG93bmVyLCB7IHByb3BlcnRpZXMgfSBdIGFyZ3Ncblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gRnJlc2ggYXNzaWdubWVudHMgYnkgb2JqZWN0IGFyZSBzaGFsbG93IGNvcGllZFxuXHRcdFx0aWYgKCBqUXVlcnkuaXNFbXB0eU9iamVjdCggY2FjaGUgKSApIHtcblx0XHRcdFx0alF1ZXJ5LmV4dGVuZCggdGhpcy5jYWNoZVsgdW5sb2NrIF0sIGRhdGEgKTtcblx0XHRcdC8vIE90aGVyd2lzZSwgY29weSB0aGUgcHJvcGVydGllcyBvbmUtYnktb25lIHRvIHRoZSBjYWNoZSBvYmplY3Rcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZvciAoIHByb3AgaW4gZGF0YSApIHtcblx0XHRcdFx0XHRjYWNoZVsgcHJvcCBdID0gZGF0YVsgcHJvcCBdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBjYWNoZTtcblx0fSxcblx0Z2V0OiBmdW5jdGlvbiggb3duZXIsIGtleSApIHtcblx0XHQvLyBFaXRoZXIgYSB2YWxpZCBjYWNoZSBpcyBmb3VuZCwgb3Igd2lsbCBiZSBjcmVhdGVkLlxuXHRcdC8vIE5ldyBjYWNoZXMgd2lsbCBiZSBjcmVhdGVkIGFuZCB0aGUgdW5sb2NrIHJldHVybmVkLFxuXHRcdC8vIGFsbG93aW5nIGRpcmVjdCBhY2Nlc3MgdG8gdGhlIG5ld2x5IGNyZWF0ZWRcblx0XHQvLyBlbXB0eSBkYXRhIG9iamVjdC4gQSB2YWxpZCBvd25lciBvYmplY3QgbXVzdCBiZSBwcm92aWRlZC5cblx0XHR2YXIgY2FjaGUgPSB0aGlzLmNhY2hlWyB0aGlzLmtleSggb3duZXIgKSBdO1xuXG5cdFx0cmV0dXJuIGtleSA9PT0gdW5kZWZpbmVkID9cblx0XHRcdGNhY2hlIDogY2FjaGVbIGtleSBdO1xuXHR9LFxuXHRhY2Nlc3M6IGZ1bmN0aW9uKCBvd25lciwga2V5LCB2YWx1ZSApIHtcblx0XHR2YXIgc3RvcmVkO1xuXHRcdC8vIEluIGNhc2VzIHdoZXJlIGVpdGhlcjpcblx0XHQvL1xuXHRcdC8vICAgMS4gTm8ga2V5IHdhcyBzcGVjaWZpZWRcblx0XHQvLyAgIDIuIEEgc3RyaW5nIGtleSB3YXMgc3BlY2lmaWVkLCBidXQgbm8gdmFsdWUgcHJvdmlkZWRcblx0XHQvL1xuXHRcdC8vIFRha2UgdGhlIFwicmVhZFwiIHBhdGggYW5kIGFsbG93IHRoZSBnZXQgbWV0aG9kIHRvIGRldGVybWluZVxuXHRcdC8vIHdoaWNoIHZhbHVlIHRvIHJldHVybiwgcmVzcGVjdGl2ZWx5IGVpdGhlcjpcblx0XHQvL1xuXHRcdC8vICAgMS4gVGhlIGVudGlyZSBjYWNoZSBvYmplY3Rcblx0XHQvLyAgIDIuIFRoZSBkYXRhIHN0b3JlZCBhdCB0aGUga2V5XG5cdFx0Ly9cblx0XHRpZiAoIGtleSA9PT0gdW5kZWZpbmVkIHx8XG5cdFx0XHRcdCgoa2V5ICYmIHR5cGVvZiBrZXkgPT09IFwic3RyaW5nXCIpICYmIHZhbHVlID09PSB1bmRlZmluZWQpICkge1xuXG5cdFx0XHRzdG9yZWQgPSB0aGlzLmdldCggb3duZXIsIGtleSApO1xuXG5cdFx0XHRyZXR1cm4gc3RvcmVkICE9PSB1bmRlZmluZWQgP1xuXHRcdFx0XHRzdG9yZWQgOiB0aGlzLmdldCggb3duZXIsIGpRdWVyeS5jYW1lbENhc2Uoa2V5KSApO1xuXHRcdH1cblxuXHRcdC8vIFsqXVdoZW4gdGhlIGtleSBpcyBub3QgYSBzdHJpbmcsIG9yIGJvdGggYSBrZXkgYW5kIHZhbHVlXG5cdFx0Ly8gYXJlIHNwZWNpZmllZCwgc2V0IG9yIGV4dGVuZCAoZXhpc3Rpbmcgb2JqZWN0cykgd2l0aCBlaXRoZXI6XG5cdFx0Ly9cblx0XHQvLyAgIDEuIEFuIG9iamVjdCBvZiBwcm9wZXJ0aWVzXG5cdFx0Ly8gICAyLiBBIGtleSBhbmQgdmFsdWVcblx0XHQvL1xuXHRcdHRoaXMuc2V0KCBvd25lciwga2V5LCB2YWx1ZSApO1xuXG5cdFx0Ly8gU2luY2UgdGhlIFwic2V0XCIgcGF0aCBjYW4gaGF2ZSB0d28gcG9zc2libGUgZW50cnkgcG9pbnRzXG5cdFx0Ly8gcmV0dXJuIHRoZSBleHBlY3RlZCBkYXRhIGJhc2VkIG9uIHdoaWNoIHBhdGggd2FzIHRha2VuWypdXG5cdFx0cmV0dXJuIHZhbHVlICE9PSB1bmRlZmluZWQgPyB2YWx1ZSA6IGtleTtcblx0fSxcblx0cmVtb3ZlOiBmdW5jdGlvbiggb3duZXIsIGtleSApIHtcblx0XHR2YXIgaSwgbmFtZSwgY2FtZWwsXG5cdFx0XHR1bmxvY2sgPSB0aGlzLmtleSggb3duZXIgKSxcblx0XHRcdGNhY2hlID0gdGhpcy5jYWNoZVsgdW5sb2NrIF07XG5cblx0XHRpZiAoIGtleSA9PT0gdW5kZWZpbmVkICkge1xuXHRcdFx0dGhpcy5jYWNoZVsgdW5sb2NrIF0gPSB7fTtcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBTdXBwb3J0IGFycmF5IG9yIHNwYWNlIHNlcGFyYXRlZCBzdHJpbmcgb2Yga2V5c1xuXHRcdFx0aWYgKCBqUXVlcnkuaXNBcnJheSgga2V5ICkgKSB7XG5cdFx0XHRcdC8vIElmIFwibmFtZVwiIGlzIGFuIGFycmF5IG9mIGtleXMuLi5cblx0XHRcdFx0Ly8gV2hlbiBkYXRhIGlzIGluaXRpYWxseSBjcmVhdGVkLCB2aWEgKFwia2V5XCIsIFwidmFsXCIpIHNpZ25hdHVyZSxcblx0XHRcdFx0Ly8ga2V5cyB3aWxsIGJlIGNvbnZlcnRlZCB0byBjYW1lbENhc2UuXG5cdFx0XHRcdC8vIFNpbmNlIHRoZXJlIGlzIG5vIHdheSB0byB0ZWxsIF9ob3dfIGEga2V5IHdhcyBhZGRlZCwgcmVtb3ZlXG5cdFx0XHRcdC8vIGJvdGggcGxhaW4ga2V5IGFuZCBjYW1lbENhc2Uga2V5LiAjMTI3ODZcblx0XHRcdFx0Ly8gVGhpcyB3aWxsIG9ubHkgcGVuYWxpemUgdGhlIGFycmF5IGFyZ3VtZW50IHBhdGguXG5cdFx0XHRcdG5hbWUgPSBrZXkuY29uY2F0KCBrZXkubWFwKCBqUXVlcnkuY2FtZWxDYXNlICkgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNhbWVsID0galF1ZXJ5LmNhbWVsQ2FzZSgga2V5ICk7XG5cdFx0XHRcdC8vIFRyeSB0aGUgc3RyaW5nIGFzIGEga2V5IGJlZm9yZSBhbnkgbWFuaXB1bGF0aW9uXG5cdFx0XHRcdGlmICgga2V5IGluIGNhY2hlICkge1xuXHRcdFx0XHRcdG5hbWUgPSBbIGtleSwgY2FtZWwgXTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBJZiBhIGtleSB3aXRoIHRoZSBzcGFjZXMgZXhpc3RzLCB1c2UgaXQuXG5cdFx0XHRcdFx0Ly8gT3RoZXJ3aXNlLCBjcmVhdGUgYW4gYXJyYXkgYnkgbWF0Y2hpbmcgbm9uLXdoaXRlc3BhY2Vcblx0XHRcdFx0XHRuYW1lID0gY2FtZWw7XG5cdFx0XHRcdFx0bmFtZSA9IG5hbWUgaW4gY2FjaGUgP1xuXHRcdFx0XHRcdFx0WyBuYW1lIF0gOiAoIG5hbWUubWF0Y2goIHJub3R3aGl0ZSApIHx8IFtdICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aSA9IG5hbWUubGVuZ3RoO1xuXHRcdFx0d2hpbGUgKCBpLS0gKSB7XG5cdFx0XHRcdGRlbGV0ZSBjYWNoZVsgbmFtZVsgaSBdIF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRoYXNEYXRhOiBmdW5jdGlvbiggb3duZXIgKSB7XG5cdFx0cmV0dXJuICFqUXVlcnkuaXNFbXB0eU9iamVjdChcblx0XHRcdHRoaXMuY2FjaGVbIG93bmVyWyB0aGlzLmV4cGFuZG8gXSBdIHx8IHt9XG5cdFx0KTtcblx0fSxcblx0ZGlzY2FyZDogZnVuY3Rpb24oIG93bmVyICkge1xuXHRcdGlmICggb3duZXJbIHRoaXMuZXhwYW5kbyBdICkge1xuXHRcdFx0ZGVsZXRlIHRoaXMuY2FjaGVbIG93bmVyWyB0aGlzLmV4cGFuZG8gXSBdO1xuXHRcdH1cblx0fVxufTtcbnZhciBkYXRhX3ByaXYgPSBuZXcgRGF0YSgpO1xuXG52YXIgZGF0YV91c2VyID0gbmV3IERhdGEoKTtcblxuXG5cbi8qXG5cdEltcGxlbWVudGF0aW9uIFN1bW1hcnlcblxuXHQxLiBFbmZvcmNlIEFQSSBzdXJmYWNlIGFuZCBzZW1hbnRpYyBjb21wYXRpYmlsaXR5IHdpdGggMS45LnggYnJhbmNoXG5cdDIuIEltcHJvdmUgdGhlIG1vZHVsZSdzIG1haW50YWluYWJpbGl0eSBieSByZWR1Y2luZyB0aGUgc3RvcmFnZVxuXHRcdHBhdGhzIHRvIGEgc2luZ2xlIG1lY2hhbmlzbS5cblx0My4gVXNlIHRoZSBzYW1lIHNpbmdsZSBtZWNoYW5pc20gdG8gc3VwcG9ydCBcInByaXZhdGVcIiBhbmQgXCJ1c2VyXCIgZGF0YS5cblx0NC4gX05ldmVyXyBleHBvc2UgXCJwcml2YXRlXCIgZGF0YSB0byB1c2VyIGNvZGUgKFRPRE86IERyb3AgX2RhdGEsIF9yZW1vdmVEYXRhKVxuXHQ1LiBBdm9pZCBleHBvc2luZyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzIG9uIHVzZXIgb2JqZWN0cyAoZWcuIGV4cGFuZG8gcHJvcGVydGllcylcblx0Ni4gUHJvdmlkZSBhIGNsZWFyIHBhdGggZm9yIGltcGxlbWVudGF0aW9uIHVwZ3JhZGUgdG8gV2Vha01hcCBpbiAyMDE0XG4qL1xudmFyIHJicmFjZSA9IC9eKD86XFx7W1xcd1xcV10qXFx9fFxcW1tcXHdcXFddKlxcXSkkLyxcblx0cm11bHRpRGFzaCA9IC8oW0EtWl0pL2c7XG5cbmZ1bmN0aW9uIGRhdGFBdHRyKCBlbGVtLCBrZXksIGRhdGEgKSB7XG5cdHZhciBuYW1lO1xuXG5cdC8vIElmIG5vdGhpbmcgd2FzIGZvdW5kIGludGVybmFsbHksIHRyeSB0byBmZXRjaCBhbnlcblx0Ly8gZGF0YSBmcm9tIHRoZSBIVE1MNSBkYXRhLSogYXR0cmlidXRlXG5cdGlmICggZGF0YSA9PT0gdW5kZWZpbmVkICYmIGVsZW0ubm9kZVR5cGUgPT09IDEgKSB7XG5cdFx0bmFtZSA9IFwiZGF0YS1cIiArIGtleS5yZXBsYWNlKCBybXVsdGlEYXNoLCBcIi0kMVwiICkudG9Mb3dlckNhc2UoKTtcblx0XHRkYXRhID0gZWxlbS5nZXRBdHRyaWJ1dGUoIG5hbWUgKTtcblxuXHRcdGlmICggdHlwZW9mIGRhdGEgPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRkYXRhID0gZGF0YSA9PT0gXCJ0cnVlXCIgPyB0cnVlIDpcblx0XHRcdFx0XHRkYXRhID09PSBcImZhbHNlXCIgPyBmYWxzZSA6XG5cdFx0XHRcdFx0ZGF0YSA9PT0gXCJudWxsXCIgPyBudWxsIDpcblx0XHRcdFx0XHQvLyBPbmx5IGNvbnZlcnQgdG8gYSBudW1iZXIgaWYgaXQgZG9lc24ndCBjaGFuZ2UgdGhlIHN0cmluZ1xuXHRcdFx0XHRcdCtkYXRhICsgXCJcIiA9PT0gZGF0YSA/ICtkYXRhIDpcblx0XHRcdFx0XHRyYnJhY2UudGVzdCggZGF0YSApID8galF1ZXJ5LnBhcnNlSlNPTiggZGF0YSApIDpcblx0XHRcdFx0XHRkYXRhO1xuXHRcdFx0fSBjYXRjaCggZSApIHt9XG5cblx0XHRcdC8vIE1ha2Ugc3VyZSB3ZSBzZXQgdGhlIGRhdGEgc28gaXQgaXNuJ3QgY2hhbmdlZCBsYXRlclxuXHRcdFx0ZGF0YV91c2VyLnNldCggZWxlbSwga2V5LCBkYXRhICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGRhdGEgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBkYXRhO1xufVxuXG5qUXVlcnkuZXh0ZW5kKHtcblx0aGFzRGF0YTogZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0cmV0dXJuIGRhdGFfdXNlci5oYXNEYXRhKCBlbGVtICkgfHwgZGF0YV9wcml2Lmhhc0RhdGEoIGVsZW0gKTtcblx0fSxcblxuXHRkYXRhOiBmdW5jdGlvbiggZWxlbSwgbmFtZSwgZGF0YSApIHtcblx0XHRyZXR1cm4gZGF0YV91c2VyLmFjY2VzcyggZWxlbSwgbmFtZSwgZGF0YSApO1xuXHR9LFxuXG5cdHJlbW92ZURhdGE6IGZ1bmN0aW9uKCBlbGVtLCBuYW1lICkge1xuXHRcdGRhdGFfdXNlci5yZW1vdmUoIGVsZW0sIG5hbWUgKTtcblx0fSxcblxuXHQvLyBUT0RPOiBOb3cgdGhhdCBhbGwgY2FsbHMgdG8gX2RhdGEgYW5kIF9yZW1vdmVEYXRhIGhhdmUgYmVlbiByZXBsYWNlZFxuXHQvLyB3aXRoIGRpcmVjdCBjYWxscyB0byBkYXRhX3ByaXYgbWV0aG9kcywgdGhlc2UgY2FuIGJlIGRlcHJlY2F0ZWQuXG5cdF9kYXRhOiBmdW5jdGlvbiggZWxlbSwgbmFtZSwgZGF0YSApIHtcblx0XHRyZXR1cm4gZGF0YV9wcml2LmFjY2VzcyggZWxlbSwgbmFtZSwgZGF0YSApO1xuXHR9LFxuXG5cdF9yZW1vdmVEYXRhOiBmdW5jdGlvbiggZWxlbSwgbmFtZSApIHtcblx0XHRkYXRhX3ByaXYucmVtb3ZlKCBlbGVtLCBuYW1lICk7XG5cdH1cbn0pO1xuXG5qUXVlcnkuZm4uZXh0ZW5kKHtcblx0ZGF0YTogZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cdFx0dmFyIGksIG5hbWUsIGRhdGEsXG5cdFx0XHRlbGVtID0gdGhpc1sgMCBdLFxuXHRcdFx0YXR0cnMgPSBlbGVtICYmIGVsZW0uYXR0cmlidXRlcztcblxuXHRcdC8vIEdldHMgYWxsIHZhbHVlc1xuXHRcdGlmICgga2V5ID09PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRpZiAoIHRoaXMubGVuZ3RoICkge1xuXHRcdFx0XHRkYXRhID0gZGF0YV91c2VyLmdldCggZWxlbSApO1xuXG5cdFx0XHRcdGlmICggZWxlbS5ub2RlVHlwZSA9PT0gMSAmJiAhZGF0YV9wcml2LmdldCggZWxlbSwgXCJoYXNEYXRhQXR0cnNcIiApICkge1xuXHRcdFx0XHRcdGkgPSBhdHRycy5sZW5ndGg7XG5cdFx0XHRcdFx0d2hpbGUgKCBpLS0gKSB7XG5cdFx0XHRcdFx0XHRuYW1lID0gYXR0cnNbIGkgXS5uYW1lO1xuXG5cdFx0XHRcdFx0XHRpZiAoIG5hbWUuaW5kZXhPZiggXCJkYXRhLVwiICkgPT09IDAgKSB7XG5cdFx0XHRcdFx0XHRcdG5hbWUgPSBqUXVlcnkuY2FtZWxDYXNlKCBuYW1lLnNsaWNlKDUpICk7XG5cdFx0XHRcdFx0XHRcdGRhdGFBdHRyKCBlbGVtLCBuYW1lLCBkYXRhWyBuYW1lIF0gKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZGF0YV9wcml2LnNldCggZWxlbSwgXCJoYXNEYXRhQXR0cnNcIiwgdHJ1ZSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBkYXRhO1xuXHRcdH1cblxuXHRcdC8vIFNldHMgbXVsdGlwbGUgdmFsdWVzXG5cdFx0aWYgKCB0eXBlb2Yga2V5ID09PSBcIm9iamVjdFwiICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdFx0ZGF0YV91c2VyLnNldCggdGhpcywga2V5ICk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gYWNjZXNzKCB0aGlzLCBmdW5jdGlvbiggdmFsdWUgKSB7XG5cdFx0XHR2YXIgZGF0YSxcblx0XHRcdFx0Y2FtZWxLZXkgPSBqUXVlcnkuY2FtZWxDYXNlKCBrZXkgKTtcblxuXHRcdFx0Ly8gVGhlIGNhbGxpbmcgalF1ZXJ5IG9iamVjdCAoZWxlbWVudCBtYXRjaGVzKSBpcyBub3QgZW1wdHlcblx0XHRcdC8vIChhbmQgdGhlcmVmb3JlIGhhcyBhbiBlbGVtZW50IGFwcGVhcnMgYXQgdGhpc1sgMCBdKSBhbmQgdGhlXG5cdFx0XHQvLyBgdmFsdWVgIHBhcmFtZXRlciB3YXMgbm90IHVuZGVmaW5lZC4gQW4gZW1wdHkgalF1ZXJ5IG9iamVjdFxuXHRcdFx0Ly8gd2lsbCByZXN1bHQgaW4gYHVuZGVmaW5lZGAgZm9yIGVsZW0gPSB0aGlzWyAwIF0gd2hpY2ggd2lsbFxuXHRcdFx0Ly8gdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFuIGF0dGVtcHQgdG8gcmVhZCBhIGRhdGEgY2FjaGUgaXMgbWFkZS5cblx0XHRcdGlmICggZWxlbSAmJiB2YWx1ZSA9PT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHQvLyBBdHRlbXB0IHRvIGdldCBkYXRhIGZyb20gdGhlIGNhY2hlXG5cdFx0XHRcdC8vIHdpdGggdGhlIGtleSBhcy1pc1xuXHRcdFx0XHRkYXRhID0gZGF0YV91c2VyLmdldCggZWxlbSwga2V5ICk7XG5cdFx0XHRcdGlmICggZGF0YSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRcdHJldHVybiBkYXRhO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gQXR0ZW1wdCB0byBnZXQgZGF0YSBmcm9tIHRoZSBjYWNoZVxuXHRcdFx0XHQvLyB3aXRoIHRoZSBrZXkgY2FtZWxpemVkXG5cdFx0XHRcdGRhdGEgPSBkYXRhX3VzZXIuZ2V0KCBlbGVtLCBjYW1lbEtleSApO1xuXHRcdFx0XHRpZiAoIGRhdGEgIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdFx0XHRyZXR1cm4gZGF0YTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIEF0dGVtcHQgdG8gXCJkaXNjb3ZlclwiIHRoZSBkYXRhIGluXG5cdFx0XHRcdC8vIEhUTUw1IGN1c3RvbSBkYXRhLSogYXR0cnNcblx0XHRcdFx0ZGF0YSA9IGRhdGFBdHRyKCBlbGVtLCBjYW1lbEtleSwgdW5kZWZpbmVkICk7XG5cdFx0XHRcdGlmICggZGF0YSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRcdHJldHVybiBkYXRhO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gV2UgdHJpZWQgcmVhbGx5IGhhcmQsIGJ1dCB0aGUgZGF0YSBkb2Vzbid0IGV4aXN0LlxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIFNldCB0aGUgZGF0YS4uLlxuXHRcdFx0dGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQvLyBGaXJzdCwgYXR0ZW1wdCB0byBzdG9yZSBhIGNvcHkgb3IgcmVmZXJlbmNlIG9mIGFueVxuXHRcdFx0XHQvLyBkYXRhIHRoYXQgbWlnaHQndmUgYmVlbiBzdG9yZSB3aXRoIGEgY2FtZWxDYXNlZCBrZXkuXG5cdFx0XHRcdHZhciBkYXRhID0gZGF0YV91c2VyLmdldCggdGhpcywgY2FtZWxLZXkgKTtcblxuXHRcdFx0XHQvLyBGb3IgSFRNTDUgZGF0YS0qIGF0dHJpYnV0ZSBpbnRlcm9wLCB3ZSBoYXZlIHRvXG5cdFx0XHRcdC8vIHN0b3JlIHByb3BlcnR5IG5hbWVzIHdpdGggZGFzaGVzIGluIGEgY2FtZWxDYXNlIGZvcm0uXG5cdFx0XHRcdC8vIFRoaXMgbWlnaHQgbm90IGFwcGx5IHRvIGFsbCBwcm9wZXJ0aWVzLi4uKlxuXHRcdFx0XHRkYXRhX3VzZXIuc2V0KCB0aGlzLCBjYW1lbEtleSwgdmFsdWUgKTtcblxuXHRcdFx0XHQvLyAqLi4uIEluIHRoZSBjYXNlIG9mIHByb3BlcnRpZXMgdGhhdCBtaWdodCBfYWN0dWFsbHlfXG5cdFx0XHRcdC8vIGhhdmUgZGFzaGVzLCB3ZSBuZWVkIHRvIGFsc28gc3RvcmUgYSBjb3B5IG9mIHRoYXRcblx0XHRcdFx0Ly8gdW5jaGFuZ2VkIHByb3BlcnR5LlxuXHRcdFx0XHRpZiAoIGtleS5pbmRleE9mKFwiLVwiKSAhPT0gLTEgJiYgZGF0YSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRcdGRhdGFfdXNlci5zZXQoIHRoaXMsIGtleSwgdmFsdWUgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSwgbnVsbCwgdmFsdWUsIGFyZ3VtZW50cy5sZW5ndGggPiAxLCBudWxsLCB0cnVlICk7XG5cdH0sXG5cblx0cmVtb3ZlRGF0YTogZnVuY3Rpb24oIGtleSApIHtcblx0XHRyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0ZGF0YV91c2VyLnJlbW92ZSggdGhpcywga2V5ICk7XG5cdFx0fSk7XG5cdH1cbn0pO1xuXG5cbmpRdWVyeS5leHRlbmQoe1xuXHRxdWV1ZTogZnVuY3Rpb24oIGVsZW0sIHR5cGUsIGRhdGEgKSB7XG5cdFx0dmFyIHF1ZXVlO1xuXG5cdFx0aWYgKCBlbGVtICkge1xuXHRcdFx0dHlwZSA9ICggdHlwZSB8fCBcImZ4XCIgKSArIFwicXVldWVcIjtcblx0XHRcdHF1ZXVlID0gZGF0YV9wcml2LmdldCggZWxlbSwgdHlwZSApO1xuXG5cdFx0XHQvLyBTcGVlZCB1cCBkZXF1ZXVlIGJ5IGdldHRpbmcgb3V0IHF1aWNrbHkgaWYgdGhpcyBpcyBqdXN0IGEgbG9va3VwXG5cdFx0XHRpZiAoIGRhdGEgKSB7XG5cdFx0XHRcdGlmICggIXF1ZXVlIHx8IGpRdWVyeS5pc0FycmF5KCBkYXRhICkgKSB7XG5cdFx0XHRcdFx0cXVldWUgPSBkYXRhX3ByaXYuYWNjZXNzKCBlbGVtLCB0eXBlLCBqUXVlcnkubWFrZUFycmF5KGRhdGEpICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cXVldWUucHVzaCggZGF0YSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcXVldWUgfHwgW107XG5cdFx0fVxuXHR9LFxuXG5cdGRlcXVldWU6IGZ1bmN0aW9uKCBlbGVtLCB0eXBlICkge1xuXHRcdHR5cGUgPSB0eXBlIHx8IFwiZnhcIjtcblxuXHRcdHZhciBxdWV1ZSA9IGpRdWVyeS5xdWV1ZSggZWxlbSwgdHlwZSApLFxuXHRcdFx0c3RhcnRMZW5ndGggPSBxdWV1ZS5sZW5ndGgsXG5cdFx0XHRmbiA9IHF1ZXVlLnNoaWZ0KCksXG5cdFx0XHRob29rcyA9IGpRdWVyeS5fcXVldWVIb29rcyggZWxlbSwgdHlwZSApLFxuXHRcdFx0bmV4dCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRqUXVlcnkuZGVxdWV1ZSggZWxlbSwgdHlwZSApO1xuXHRcdFx0fTtcblxuXHRcdC8vIElmIHRoZSBmeCBxdWV1ZSBpcyBkZXF1ZXVlZCwgYWx3YXlzIHJlbW92ZSB0aGUgcHJvZ3Jlc3Mgc2VudGluZWxcblx0XHRpZiAoIGZuID09PSBcImlucHJvZ3Jlc3NcIiApIHtcblx0XHRcdGZuID0gcXVldWUuc2hpZnQoKTtcblx0XHRcdHN0YXJ0TGVuZ3RoLS07XG5cdFx0fVxuXG5cdFx0aWYgKCBmbiApIHtcblxuXHRcdFx0Ly8gQWRkIGEgcHJvZ3Jlc3Mgc2VudGluZWwgdG8gcHJldmVudCB0aGUgZnggcXVldWUgZnJvbSBiZWluZ1xuXHRcdFx0Ly8gYXV0b21hdGljYWxseSBkZXF1ZXVlZFxuXHRcdFx0aWYgKCB0eXBlID09PSBcImZ4XCIgKSB7XG5cdFx0XHRcdHF1ZXVlLnVuc2hpZnQoIFwiaW5wcm9ncmVzc1wiICk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGNsZWFyIHVwIHRoZSBsYXN0IHF1ZXVlIHN0b3AgZnVuY3Rpb25cblx0XHRcdGRlbGV0ZSBob29rcy5zdG9wO1xuXHRcdFx0Zm4uY2FsbCggZWxlbSwgbmV4dCwgaG9va3MgKTtcblx0XHR9XG5cblx0XHRpZiAoICFzdGFydExlbmd0aCAmJiBob29rcyApIHtcblx0XHRcdGhvb2tzLmVtcHR5LmZpcmUoKTtcblx0XHR9XG5cdH0sXG5cblx0Ly8gbm90IGludGVuZGVkIGZvciBwdWJsaWMgY29uc3VtcHRpb24gLSBnZW5lcmF0ZXMgYSBxdWV1ZUhvb2tzIG9iamVjdCwgb3IgcmV0dXJucyB0aGUgY3VycmVudCBvbmVcblx0X3F1ZXVlSG9va3M6IGZ1bmN0aW9uKCBlbGVtLCB0eXBlICkge1xuXHRcdHZhciBrZXkgPSB0eXBlICsgXCJxdWV1ZUhvb2tzXCI7XG5cdFx0cmV0dXJuIGRhdGFfcHJpdi5nZXQoIGVsZW0sIGtleSApIHx8IGRhdGFfcHJpdi5hY2Nlc3MoIGVsZW0sIGtleSwge1xuXHRcdFx0ZW1wdHk6IGpRdWVyeS5DYWxsYmFja3MoXCJvbmNlIG1lbW9yeVwiKS5hZGQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGRhdGFfcHJpdi5yZW1vdmUoIGVsZW0sIFsgdHlwZSArIFwicXVldWVcIiwga2V5IF0gKTtcblx0XHRcdH0pXG5cdFx0fSk7XG5cdH1cbn0pO1xuXG5qUXVlcnkuZm4uZXh0ZW5kKHtcblx0cXVldWU6IGZ1bmN0aW9uKCB0eXBlLCBkYXRhICkge1xuXHRcdHZhciBzZXR0ZXIgPSAyO1xuXG5cdFx0aWYgKCB0eXBlb2YgdHlwZSAhPT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdGRhdGEgPSB0eXBlO1xuXHRcdFx0dHlwZSA9IFwiZnhcIjtcblx0XHRcdHNldHRlci0tO1xuXHRcdH1cblxuXHRcdGlmICggYXJndW1lbnRzLmxlbmd0aCA8IHNldHRlciApIHtcblx0XHRcdHJldHVybiBqUXVlcnkucXVldWUoIHRoaXNbMF0sIHR5cGUgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZGF0YSA9PT0gdW5kZWZpbmVkID9cblx0XHRcdHRoaXMgOlxuXHRcdFx0dGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgcXVldWUgPSBqUXVlcnkucXVldWUoIHRoaXMsIHR5cGUsIGRhdGEgKTtcblxuXHRcdFx0XHQvLyBlbnN1cmUgYSBob29rcyBmb3IgdGhpcyBxdWV1ZVxuXHRcdFx0XHRqUXVlcnkuX3F1ZXVlSG9va3MoIHRoaXMsIHR5cGUgKTtcblxuXHRcdFx0XHRpZiAoIHR5cGUgPT09IFwiZnhcIiAmJiBxdWV1ZVswXSAhPT0gXCJpbnByb2dyZXNzXCIgKSB7XG5cdFx0XHRcdFx0alF1ZXJ5LmRlcXVldWUoIHRoaXMsIHR5cGUgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdH0sXG5cdGRlcXVldWU6IGZ1bmN0aW9uKCB0eXBlICkge1xuXHRcdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHRqUXVlcnkuZGVxdWV1ZSggdGhpcywgdHlwZSApO1xuXHRcdH0pO1xuXHR9LFxuXHRjbGVhclF1ZXVlOiBmdW5jdGlvbiggdHlwZSApIHtcblx0XHRyZXR1cm4gdGhpcy5xdWV1ZSggdHlwZSB8fCBcImZ4XCIsIFtdICk7XG5cdH0sXG5cdC8vIEdldCBhIHByb21pc2UgcmVzb2x2ZWQgd2hlbiBxdWV1ZXMgb2YgYSBjZXJ0YWluIHR5cGVcblx0Ly8gYXJlIGVtcHRpZWQgKGZ4IGlzIHRoZSB0eXBlIGJ5IGRlZmF1bHQpXG5cdHByb21pc2U6IGZ1bmN0aW9uKCB0eXBlLCBvYmogKSB7XG5cdFx0dmFyIHRtcCxcblx0XHRcdGNvdW50ID0gMSxcblx0XHRcdGRlZmVyID0galF1ZXJ5LkRlZmVycmVkKCksXG5cdFx0XHRlbGVtZW50cyA9IHRoaXMsXG5cdFx0XHRpID0gdGhpcy5sZW5ndGgsXG5cdFx0XHRyZXNvbHZlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICggISggLS1jb3VudCApICkge1xuXHRcdFx0XHRcdGRlZmVyLnJlc29sdmVXaXRoKCBlbGVtZW50cywgWyBlbGVtZW50cyBdICk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRpZiAoIHR5cGVvZiB0eXBlICE9PSBcInN0cmluZ1wiICkge1xuXHRcdFx0b2JqID0gdHlwZTtcblx0XHRcdHR5cGUgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdHR5cGUgPSB0eXBlIHx8IFwiZnhcIjtcblxuXHRcdHdoaWxlICggaS0tICkge1xuXHRcdFx0dG1wID0gZGF0YV9wcml2LmdldCggZWxlbWVudHNbIGkgXSwgdHlwZSArIFwicXVldWVIb29rc1wiICk7XG5cdFx0XHRpZiAoIHRtcCAmJiB0bXAuZW1wdHkgKSB7XG5cdFx0XHRcdGNvdW50Kys7XG5cdFx0XHRcdHRtcC5lbXB0eS5hZGQoIHJlc29sdmUgKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmVzb2x2ZSgpO1xuXHRcdHJldHVybiBkZWZlci5wcm9taXNlKCBvYmogKTtcblx0fVxufSk7XG52YXIgcG51bSA9ICgvWystXT8oPzpcXGQqXFwufClcXGQrKD86W2VFXVsrLV0/XFxkK3wpLykuc291cmNlO1xuXG52YXIgY3NzRXhwYW5kID0gWyBcIlRvcFwiLCBcIlJpZ2h0XCIsIFwiQm90dG9tXCIsIFwiTGVmdFwiIF07XG5cbnZhciBpc0hpZGRlbiA9IGZ1bmN0aW9uKCBlbGVtLCBlbCApIHtcblx0XHQvLyBpc0hpZGRlbiBtaWdodCBiZSBjYWxsZWQgZnJvbSBqUXVlcnkjZmlsdGVyIGZ1bmN0aW9uO1xuXHRcdC8vIGluIHRoYXQgY2FzZSwgZWxlbWVudCB3aWxsIGJlIHNlY29uZCBhcmd1bWVudFxuXHRcdGVsZW0gPSBlbCB8fCBlbGVtO1xuXHRcdHJldHVybiBqUXVlcnkuY3NzKCBlbGVtLCBcImRpc3BsYXlcIiApID09PSBcIm5vbmVcIiB8fCAhalF1ZXJ5LmNvbnRhaW5zKCBlbGVtLm93bmVyRG9jdW1lbnQsIGVsZW0gKTtcblx0fTtcblxudmFyIHJjaGVja2FibGVUeXBlID0gKC9eKD86Y2hlY2tib3h8cmFkaW8pJC9pKTtcblxuXG5cbihmdW5jdGlvbigpIHtcblx0dmFyIGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLFxuXHRcdGRpdiA9IGZyYWdtZW50LmFwcGVuZENoaWxkKCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCBcImRpdlwiICkgKTtcblxuXHQvLyAjMTEyMTcgLSBXZWJLaXQgbG9zZXMgY2hlY2sgd2hlbiB0aGUgbmFtZSBpcyBhZnRlciB0aGUgY2hlY2tlZCBhdHRyaWJ1dGVcblx0ZGl2LmlubmVySFRNTCA9IFwiPGlucHV0IHR5cGU9J3JhZGlvJyBjaGVja2VkPSdjaGVja2VkJyBuYW1lPSd0Jy8+XCI7XG5cblx0Ly8gU3VwcG9ydDogU2FmYXJpIDUuMSwgaU9TIDUuMSwgQW5kcm9pZCA0LngsIEFuZHJvaWQgMi4zXG5cdC8vIG9sZCBXZWJLaXQgZG9lc24ndCBjbG9uZSBjaGVja2VkIHN0YXRlIGNvcnJlY3RseSBpbiBmcmFnbWVudHNcblx0c3VwcG9ydC5jaGVja0Nsb25lID0gZGl2LmNsb25lTm9kZSggdHJ1ZSApLmNsb25lTm9kZSggdHJ1ZSApLmxhc3RDaGlsZC5jaGVja2VkO1xuXG5cdC8vIE1ha2Ugc3VyZSB0ZXh0YXJlYSAoYW5kIGNoZWNrYm94KSBkZWZhdWx0VmFsdWUgaXMgcHJvcGVybHkgY2xvbmVkXG5cdC8vIFN1cHBvcnQ6IElFOS1JRTExK1xuXHRkaXYuaW5uZXJIVE1MID0gXCI8dGV4dGFyZWE+eDwvdGV4dGFyZWE+XCI7XG5cdHN1cHBvcnQubm9DbG9uZUNoZWNrZWQgPSAhIWRpdi5jbG9uZU5vZGUoIHRydWUgKS5sYXN0Q2hpbGQuZGVmYXVsdFZhbHVlO1xufSkoKTtcbnZhciBzdHJ1bmRlZmluZWQgPSB0eXBlb2YgdW5kZWZpbmVkO1xuXG5cblxuc3VwcG9ydC5mb2N1c2luQnViYmxlcyA9IFwib25mb2N1c2luXCIgaW4gd2luZG93O1xuXG5cbnZhclxuXHRya2V5RXZlbnQgPSAvXmtleS8sXG5cdHJtb3VzZUV2ZW50ID0gL14oPzptb3VzZXxjb250ZXh0bWVudSl8Y2xpY2svLFxuXHRyZm9jdXNNb3JwaCA9IC9eKD86Zm9jdXNpbmZvY3VzfGZvY3Vzb3V0Ymx1cikkLyxcblx0cnR5cGVuYW1lc3BhY2UgPSAvXihbXi5dKikoPzpcXC4oLispfCkkLztcblxuZnVuY3Rpb24gcmV0dXJuVHJ1ZSgpIHtcblx0cmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIHJldHVybkZhbHNlKCkge1xuXHRyZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHNhZmVBY3RpdmVFbGVtZW50KCkge1xuXHR0cnkge1xuXHRcdHJldHVybiBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuXHR9IGNhdGNoICggZXJyICkgeyB9XG59XG5cbi8qXG4gKiBIZWxwZXIgZnVuY3Rpb25zIGZvciBtYW5hZ2luZyBldmVudHMgLS0gbm90IHBhcnQgb2YgdGhlIHB1YmxpYyBpbnRlcmZhY2UuXG4gKiBQcm9wcyB0byBEZWFuIEVkd2FyZHMnIGFkZEV2ZW50IGxpYnJhcnkgZm9yIG1hbnkgb2YgdGhlIGlkZWFzLlxuICovXG5qUXVlcnkuZXZlbnQgPSB7XG5cblx0Z2xvYmFsOiB7fSxcblxuXHRhZGQ6IGZ1bmN0aW9uKCBlbGVtLCB0eXBlcywgaGFuZGxlciwgZGF0YSwgc2VsZWN0b3IgKSB7XG5cblx0XHR2YXIgaGFuZGxlT2JqSW4sIGV2ZW50SGFuZGxlLCB0bXAsXG5cdFx0XHRldmVudHMsIHQsIGhhbmRsZU9iaixcblx0XHRcdHNwZWNpYWwsIGhhbmRsZXJzLCB0eXBlLCBuYW1lc3BhY2VzLCBvcmlnVHlwZSxcblx0XHRcdGVsZW1EYXRhID0gZGF0YV9wcml2LmdldCggZWxlbSApO1xuXG5cdFx0Ly8gRG9uJ3QgYXR0YWNoIGV2ZW50cyB0byBub0RhdGEgb3IgdGV4dC9jb21tZW50IG5vZGVzIChidXQgYWxsb3cgcGxhaW4gb2JqZWN0cylcblx0XHRpZiAoICFlbGVtRGF0YSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBDYWxsZXIgY2FuIHBhc3MgaW4gYW4gb2JqZWN0IG9mIGN1c3RvbSBkYXRhIGluIGxpZXUgb2YgdGhlIGhhbmRsZXJcblx0XHRpZiAoIGhhbmRsZXIuaGFuZGxlciApIHtcblx0XHRcdGhhbmRsZU9iakluID0gaGFuZGxlcjtcblx0XHRcdGhhbmRsZXIgPSBoYW5kbGVPYmpJbi5oYW5kbGVyO1xuXHRcdFx0c2VsZWN0b3IgPSBoYW5kbGVPYmpJbi5zZWxlY3Rvcjtcblx0XHR9XG5cblx0XHQvLyBNYWtlIHN1cmUgdGhhdCB0aGUgaGFuZGxlciBoYXMgYSB1bmlxdWUgSUQsIHVzZWQgdG8gZmluZC9yZW1vdmUgaXQgbGF0ZXJcblx0XHRpZiAoICFoYW5kbGVyLmd1aWQgKSB7XG5cdFx0XHRoYW5kbGVyLmd1aWQgPSBqUXVlcnkuZ3VpZCsrO1xuXHRcdH1cblxuXHRcdC8vIEluaXQgdGhlIGVsZW1lbnQncyBldmVudCBzdHJ1Y3R1cmUgYW5kIG1haW4gaGFuZGxlciwgaWYgdGhpcyBpcyB0aGUgZmlyc3Rcblx0XHRpZiAoICEoZXZlbnRzID0gZWxlbURhdGEuZXZlbnRzKSApIHtcblx0XHRcdGV2ZW50cyA9IGVsZW1EYXRhLmV2ZW50cyA9IHt9O1xuXHRcdH1cblx0XHRpZiAoICEoZXZlbnRIYW5kbGUgPSBlbGVtRGF0YS5oYW5kbGUpICkge1xuXHRcdFx0ZXZlbnRIYW5kbGUgPSBlbGVtRGF0YS5oYW5kbGUgPSBmdW5jdGlvbiggZSApIHtcblx0XHRcdFx0Ly8gRGlzY2FyZCB0aGUgc2Vjb25kIGV2ZW50IG9mIGEgalF1ZXJ5LmV2ZW50LnRyaWdnZXIoKSBhbmRcblx0XHRcdFx0Ly8gd2hlbiBhbiBldmVudCBpcyBjYWxsZWQgYWZ0ZXIgYSBwYWdlIGhhcyB1bmxvYWRlZFxuXHRcdFx0XHRyZXR1cm4gdHlwZW9mIGpRdWVyeSAhPT0gc3RydW5kZWZpbmVkICYmIGpRdWVyeS5ldmVudC50cmlnZ2VyZWQgIT09IGUudHlwZSA/XG5cdFx0XHRcdFx0alF1ZXJ5LmV2ZW50LmRpc3BhdGNoLmFwcGx5KCBlbGVtLCBhcmd1bWVudHMgKSA6IHVuZGVmaW5lZDtcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0Ly8gSGFuZGxlIG11bHRpcGxlIGV2ZW50cyBzZXBhcmF0ZWQgYnkgYSBzcGFjZVxuXHRcdHR5cGVzID0gKCB0eXBlcyB8fCBcIlwiICkubWF0Y2goIHJub3R3aGl0ZSApIHx8IFsgXCJcIiBdO1xuXHRcdHQgPSB0eXBlcy5sZW5ndGg7XG5cdFx0d2hpbGUgKCB0LS0gKSB7XG5cdFx0XHR0bXAgPSBydHlwZW5hbWVzcGFjZS5leGVjKCB0eXBlc1t0XSApIHx8IFtdO1xuXHRcdFx0dHlwZSA9IG9yaWdUeXBlID0gdG1wWzFdO1xuXHRcdFx0bmFtZXNwYWNlcyA9ICggdG1wWzJdIHx8IFwiXCIgKS5zcGxpdCggXCIuXCIgKS5zb3J0KCk7XG5cblx0XHRcdC8vIFRoZXJlICptdXN0KiBiZSBhIHR5cGUsIG5vIGF0dGFjaGluZyBuYW1lc3BhY2Utb25seSBoYW5kbGVyc1xuXHRcdFx0aWYgKCAhdHlwZSApIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdC8vIElmIGV2ZW50IGNoYW5nZXMgaXRzIHR5cGUsIHVzZSB0aGUgc3BlY2lhbCBldmVudCBoYW5kbGVycyBmb3IgdGhlIGNoYW5nZWQgdHlwZVxuXHRcdFx0c3BlY2lhbCA9IGpRdWVyeS5ldmVudC5zcGVjaWFsWyB0eXBlIF0gfHwge307XG5cblx0XHRcdC8vIElmIHNlbGVjdG9yIGRlZmluZWQsIGRldGVybWluZSBzcGVjaWFsIGV2ZW50IGFwaSB0eXBlLCBvdGhlcndpc2UgZ2l2ZW4gdHlwZVxuXHRcdFx0dHlwZSA9ICggc2VsZWN0b3IgPyBzcGVjaWFsLmRlbGVnYXRlVHlwZSA6IHNwZWNpYWwuYmluZFR5cGUgKSB8fCB0eXBlO1xuXG5cdFx0XHQvLyBVcGRhdGUgc3BlY2lhbCBiYXNlZCBvbiBuZXdseSByZXNldCB0eXBlXG5cdFx0XHRzcGVjaWFsID0galF1ZXJ5LmV2ZW50LnNwZWNpYWxbIHR5cGUgXSB8fCB7fTtcblxuXHRcdFx0Ly8gaGFuZGxlT2JqIGlzIHBhc3NlZCB0byBhbGwgZXZlbnQgaGFuZGxlcnNcblx0XHRcdGhhbmRsZU9iaiA9IGpRdWVyeS5leHRlbmQoe1xuXHRcdFx0XHR0eXBlOiB0eXBlLFxuXHRcdFx0XHRvcmlnVHlwZTogb3JpZ1R5cGUsXG5cdFx0XHRcdGRhdGE6IGRhdGEsXG5cdFx0XHRcdGhhbmRsZXI6IGhhbmRsZXIsXG5cdFx0XHRcdGd1aWQ6IGhhbmRsZXIuZ3VpZCxcblx0XHRcdFx0c2VsZWN0b3I6IHNlbGVjdG9yLFxuXHRcdFx0XHRuZWVkc0NvbnRleHQ6IHNlbGVjdG9yICYmIGpRdWVyeS5leHByLm1hdGNoLm5lZWRzQ29udGV4dC50ZXN0KCBzZWxlY3RvciApLFxuXHRcdFx0XHRuYW1lc3BhY2U6IG5hbWVzcGFjZXMuam9pbihcIi5cIilcblx0XHRcdH0sIGhhbmRsZU9iakluICk7XG5cblx0XHRcdC8vIEluaXQgdGhlIGV2ZW50IGhhbmRsZXIgcXVldWUgaWYgd2UncmUgdGhlIGZpcnN0XG5cdFx0XHRpZiAoICEoaGFuZGxlcnMgPSBldmVudHNbIHR5cGUgXSkgKSB7XG5cdFx0XHRcdGhhbmRsZXJzID0gZXZlbnRzWyB0eXBlIF0gPSBbXTtcblx0XHRcdFx0aGFuZGxlcnMuZGVsZWdhdGVDb3VudCA9IDA7XG5cblx0XHRcdFx0Ly8gT25seSB1c2UgYWRkRXZlbnRMaXN0ZW5lciBpZiB0aGUgc3BlY2lhbCBldmVudHMgaGFuZGxlciByZXR1cm5zIGZhbHNlXG5cdFx0XHRcdGlmICggIXNwZWNpYWwuc2V0dXAgfHwgc3BlY2lhbC5zZXR1cC5jYWxsKCBlbGVtLCBkYXRhLCBuYW1lc3BhY2VzLCBldmVudEhhbmRsZSApID09PSBmYWxzZSApIHtcblx0XHRcdFx0XHRpZiAoIGVsZW0uYWRkRXZlbnRMaXN0ZW5lciApIHtcblx0XHRcdFx0XHRcdGVsZW0uYWRkRXZlbnRMaXN0ZW5lciggdHlwZSwgZXZlbnRIYW5kbGUsIGZhbHNlICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICggc3BlY2lhbC5hZGQgKSB7XG5cdFx0XHRcdHNwZWNpYWwuYWRkLmNhbGwoIGVsZW0sIGhhbmRsZU9iaiApO1xuXG5cdFx0XHRcdGlmICggIWhhbmRsZU9iai5oYW5kbGVyLmd1aWQgKSB7XG5cdFx0XHRcdFx0aGFuZGxlT2JqLmhhbmRsZXIuZ3VpZCA9IGhhbmRsZXIuZ3VpZDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBBZGQgdG8gdGhlIGVsZW1lbnQncyBoYW5kbGVyIGxpc3QsIGRlbGVnYXRlcyBpbiBmcm9udFxuXHRcdFx0aWYgKCBzZWxlY3RvciApIHtcblx0XHRcdFx0aGFuZGxlcnMuc3BsaWNlKCBoYW5kbGVycy5kZWxlZ2F0ZUNvdW50KyssIDAsIGhhbmRsZU9iaiApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aGFuZGxlcnMucHVzaCggaGFuZGxlT2JqICk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEtlZXAgdHJhY2sgb2Ygd2hpY2ggZXZlbnRzIGhhdmUgZXZlciBiZWVuIHVzZWQsIGZvciBldmVudCBvcHRpbWl6YXRpb25cblx0XHRcdGpRdWVyeS5ldmVudC5nbG9iYWxbIHR5cGUgXSA9IHRydWU7XG5cdFx0fVxuXG5cdH0sXG5cblx0Ly8gRGV0YWNoIGFuIGV2ZW50IG9yIHNldCBvZiBldmVudHMgZnJvbSBhbiBlbGVtZW50XG5cdHJlbW92ZTogZnVuY3Rpb24oIGVsZW0sIHR5cGVzLCBoYW5kbGVyLCBzZWxlY3RvciwgbWFwcGVkVHlwZXMgKSB7XG5cblx0XHR2YXIgaiwgb3JpZ0NvdW50LCB0bXAsXG5cdFx0XHRldmVudHMsIHQsIGhhbmRsZU9iaixcblx0XHRcdHNwZWNpYWwsIGhhbmRsZXJzLCB0eXBlLCBuYW1lc3BhY2VzLCBvcmlnVHlwZSxcblx0XHRcdGVsZW1EYXRhID0gZGF0YV9wcml2Lmhhc0RhdGEoIGVsZW0gKSAmJiBkYXRhX3ByaXYuZ2V0KCBlbGVtICk7XG5cblx0XHRpZiAoICFlbGVtRGF0YSB8fCAhKGV2ZW50cyA9IGVsZW1EYXRhLmV2ZW50cykgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gT25jZSBmb3IgZWFjaCB0eXBlLm5hbWVzcGFjZSBpbiB0eXBlczsgdHlwZSBtYXkgYmUgb21pdHRlZFxuXHRcdHR5cGVzID0gKCB0eXBlcyB8fCBcIlwiICkubWF0Y2goIHJub3R3aGl0ZSApIHx8IFsgXCJcIiBdO1xuXHRcdHQgPSB0eXBlcy5sZW5ndGg7XG5cdFx0d2hpbGUgKCB0LS0gKSB7XG5cdFx0XHR0bXAgPSBydHlwZW5hbWVzcGFjZS5leGVjKCB0eXBlc1t0XSApIHx8IFtdO1xuXHRcdFx0dHlwZSA9IG9yaWdUeXBlID0gdG1wWzFdO1xuXHRcdFx0bmFtZXNwYWNlcyA9ICggdG1wWzJdIHx8IFwiXCIgKS5zcGxpdCggXCIuXCIgKS5zb3J0KCk7XG5cblx0XHRcdC8vIFVuYmluZCBhbGwgZXZlbnRzIChvbiB0aGlzIG5hbWVzcGFjZSwgaWYgcHJvdmlkZWQpIGZvciB0aGUgZWxlbWVudFxuXHRcdFx0aWYgKCAhdHlwZSApIHtcblx0XHRcdFx0Zm9yICggdHlwZSBpbiBldmVudHMgKSB7XG5cdFx0XHRcdFx0alF1ZXJ5LmV2ZW50LnJlbW92ZSggZWxlbSwgdHlwZSArIHR5cGVzWyB0IF0sIGhhbmRsZXIsIHNlbGVjdG9yLCB0cnVlICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdHNwZWNpYWwgPSBqUXVlcnkuZXZlbnQuc3BlY2lhbFsgdHlwZSBdIHx8IHt9O1xuXHRcdFx0dHlwZSA9ICggc2VsZWN0b3IgPyBzcGVjaWFsLmRlbGVnYXRlVHlwZSA6IHNwZWNpYWwuYmluZFR5cGUgKSB8fCB0eXBlO1xuXHRcdFx0aGFuZGxlcnMgPSBldmVudHNbIHR5cGUgXSB8fCBbXTtcblx0XHRcdHRtcCA9IHRtcFsyXSAmJiBuZXcgUmVnRXhwKCBcIihefFxcXFwuKVwiICsgbmFtZXNwYWNlcy5qb2luKFwiXFxcXC4oPzouKlxcXFwufClcIikgKyBcIihcXFxcLnwkKVwiICk7XG5cblx0XHRcdC8vIFJlbW92ZSBtYXRjaGluZyBldmVudHNcblx0XHRcdG9yaWdDb3VudCA9IGogPSBoYW5kbGVycy5sZW5ndGg7XG5cdFx0XHR3aGlsZSAoIGotLSApIHtcblx0XHRcdFx0aGFuZGxlT2JqID0gaGFuZGxlcnNbIGogXTtcblxuXHRcdFx0XHRpZiAoICggbWFwcGVkVHlwZXMgfHwgb3JpZ1R5cGUgPT09IGhhbmRsZU9iai5vcmlnVHlwZSApICYmXG5cdFx0XHRcdFx0KCAhaGFuZGxlciB8fCBoYW5kbGVyLmd1aWQgPT09IGhhbmRsZU9iai5ndWlkICkgJiZcblx0XHRcdFx0XHQoICF0bXAgfHwgdG1wLnRlc3QoIGhhbmRsZU9iai5uYW1lc3BhY2UgKSApICYmXG5cdFx0XHRcdFx0KCAhc2VsZWN0b3IgfHwgc2VsZWN0b3IgPT09IGhhbmRsZU9iai5zZWxlY3RvciB8fCBzZWxlY3RvciA9PT0gXCIqKlwiICYmIGhhbmRsZU9iai5zZWxlY3RvciApICkge1xuXHRcdFx0XHRcdGhhbmRsZXJzLnNwbGljZSggaiwgMSApO1xuXG5cdFx0XHRcdFx0aWYgKCBoYW5kbGVPYmouc2VsZWN0b3IgKSB7XG5cdFx0XHRcdFx0XHRoYW5kbGVycy5kZWxlZ2F0ZUNvdW50LS07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICggc3BlY2lhbC5yZW1vdmUgKSB7XG5cdFx0XHRcdFx0XHRzcGVjaWFsLnJlbW92ZS5jYWxsKCBlbGVtLCBoYW5kbGVPYmogKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gUmVtb3ZlIGdlbmVyaWMgZXZlbnQgaGFuZGxlciBpZiB3ZSByZW1vdmVkIHNvbWV0aGluZyBhbmQgbm8gbW9yZSBoYW5kbGVycyBleGlzdFxuXHRcdFx0Ly8gKGF2b2lkcyBwb3RlbnRpYWwgZm9yIGVuZGxlc3MgcmVjdXJzaW9uIGR1cmluZyByZW1vdmFsIG9mIHNwZWNpYWwgZXZlbnQgaGFuZGxlcnMpXG5cdFx0XHRpZiAoIG9yaWdDb3VudCAmJiAhaGFuZGxlcnMubGVuZ3RoICkge1xuXHRcdFx0XHRpZiAoICFzcGVjaWFsLnRlYXJkb3duIHx8IHNwZWNpYWwudGVhcmRvd24uY2FsbCggZWxlbSwgbmFtZXNwYWNlcywgZWxlbURhdGEuaGFuZGxlICkgPT09IGZhbHNlICkge1xuXHRcdFx0XHRcdGpRdWVyeS5yZW1vdmVFdmVudCggZWxlbSwgdHlwZSwgZWxlbURhdGEuaGFuZGxlICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRkZWxldGUgZXZlbnRzWyB0eXBlIF07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gUmVtb3ZlIHRoZSBleHBhbmRvIGlmIGl0J3Mgbm8gbG9uZ2VyIHVzZWRcblx0XHRpZiAoIGpRdWVyeS5pc0VtcHR5T2JqZWN0KCBldmVudHMgKSApIHtcblx0XHRcdGRlbGV0ZSBlbGVtRGF0YS5oYW5kbGU7XG5cdFx0XHRkYXRhX3ByaXYucmVtb3ZlKCBlbGVtLCBcImV2ZW50c1wiICk7XG5cdFx0fVxuXHR9LFxuXG5cdHRyaWdnZXI6IGZ1bmN0aW9uKCBldmVudCwgZGF0YSwgZWxlbSwgb25seUhhbmRsZXJzICkge1xuXG5cdFx0dmFyIGksIGN1ciwgdG1wLCBidWJibGVUeXBlLCBvbnR5cGUsIGhhbmRsZSwgc3BlY2lhbCxcblx0XHRcdGV2ZW50UGF0aCA9IFsgZWxlbSB8fCBkb2N1bWVudCBdLFxuXHRcdFx0dHlwZSA9IGhhc093bi5jYWxsKCBldmVudCwgXCJ0eXBlXCIgKSA/IGV2ZW50LnR5cGUgOiBldmVudCxcblx0XHRcdG5hbWVzcGFjZXMgPSBoYXNPd24uY2FsbCggZXZlbnQsIFwibmFtZXNwYWNlXCIgKSA/IGV2ZW50Lm5hbWVzcGFjZS5zcGxpdChcIi5cIikgOiBbXTtcblxuXHRcdGN1ciA9IHRtcCA9IGVsZW0gPSBlbGVtIHx8IGRvY3VtZW50O1xuXG5cdFx0Ly8gRG9uJ3QgZG8gZXZlbnRzIG9uIHRleHQgYW5kIGNvbW1lbnQgbm9kZXNcblx0XHRpZiAoIGVsZW0ubm9kZVR5cGUgPT09IDMgfHwgZWxlbS5ub2RlVHlwZSA9PT0gOCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBmb2N1cy9ibHVyIG1vcnBocyB0byBmb2N1c2luL291dDsgZW5zdXJlIHdlJ3JlIG5vdCBmaXJpbmcgdGhlbSByaWdodCBub3dcblx0XHRpZiAoIHJmb2N1c01vcnBoLnRlc3QoIHR5cGUgKyBqUXVlcnkuZXZlbnQudHJpZ2dlcmVkICkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCB0eXBlLmluZGV4T2YoXCIuXCIpID49IDAgKSB7XG5cdFx0XHQvLyBOYW1lc3BhY2VkIHRyaWdnZXI7IGNyZWF0ZSBhIHJlZ2V4cCB0byBtYXRjaCBldmVudCB0eXBlIGluIGhhbmRsZSgpXG5cdFx0XHRuYW1lc3BhY2VzID0gdHlwZS5zcGxpdChcIi5cIik7XG5cdFx0XHR0eXBlID0gbmFtZXNwYWNlcy5zaGlmdCgpO1xuXHRcdFx0bmFtZXNwYWNlcy5zb3J0KCk7XG5cdFx0fVxuXHRcdG9udHlwZSA9IHR5cGUuaW5kZXhPZihcIjpcIikgPCAwICYmIFwib25cIiArIHR5cGU7XG5cblx0XHQvLyBDYWxsZXIgY2FuIHBhc3MgaW4gYSBqUXVlcnkuRXZlbnQgb2JqZWN0LCBPYmplY3QsIG9yIGp1c3QgYW4gZXZlbnQgdHlwZSBzdHJpbmdcblx0XHRldmVudCA9IGV2ZW50WyBqUXVlcnkuZXhwYW5kbyBdID9cblx0XHRcdGV2ZW50IDpcblx0XHRcdG5ldyBqUXVlcnkuRXZlbnQoIHR5cGUsIHR5cGVvZiBldmVudCA9PT0gXCJvYmplY3RcIiAmJiBldmVudCApO1xuXG5cdFx0Ly8gVHJpZ2dlciBiaXRtYXNrOiAmIDEgZm9yIG5hdGl2ZSBoYW5kbGVyczsgJiAyIGZvciBqUXVlcnkgKGFsd2F5cyB0cnVlKVxuXHRcdGV2ZW50LmlzVHJpZ2dlciA9IG9ubHlIYW5kbGVycyA/IDIgOiAzO1xuXHRcdGV2ZW50Lm5hbWVzcGFjZSA9IG5hbWVzcGFjZXMuam9pbihcIi5cIik7XG5cdFx0ZXZlbnQubmFtZXNwYWNlX3JlID0gZXZlbnQubmFtZXNwYWNlID9cblx0XHRcdG5ldyBSZWdFeHAoIFwiKF58XFxcXC4pXCIgKyBuYW1lc3BhY2VzLmpvaW4oXCJcXFxcLig/Oi4qXFxcXC58KVwiKSArIFwiKFxcXFwufCQpXCIgKSA6XG5cdFx0XHRudWxsO1xuXG5cdFx0Ly8gQ2xlYW4gdXAgdGhlIGV2ZW50IGluIGNhc2UgaXQgaXMgYmVpbmcgcmV1c2VkXG5cdFx0ZXZlbnQucmVzdWx0ID0gdW5kZWZpbmVkO1xuXHRcdGlmICggIWV2ZW50LnRhcmdldCApIHtcblx0XHRcdGV2ZW50LnRhcmdldCA9IGVsZW07XG5cdFx0fVxuXG5cdFx0Ly8gQ2xvbmUgYW55IGluY29taW5nIGRhdGEgYW5kIHByZXBlbmQgdGhlIGV2ZW50LCBjcmVhdGluZyB0aGUgaGFuZGxlciBhcmcgbGlzdFxuXHRcdGRhdGEgPSBkYXRhID09IG51bGwgP1xuXHRcdFx0WyBldmVudCBdIDpcblx0XHRcdGpRdWVyeS5tYWtlQXJyYXkoIGRhdGEsIFsgZXZlbnQgXSApO1xuXG5cdFx0Ly8gQWxsb3cgc3BlY2lhbCBldmVudHMgdG8gZHJhdyBvdXRzaWRlIHRoZSBsaW5lc1xuXHRcdHNwZWNpYWwgPSBqUXVlcnkuZXZlbnQuc3BlY2lhbFsgdHlwZSBdIHx8IHt9O1xuXHRcdGlmICggIW9ubHlIYW5kbGVycyAmJiBzcGVjaWFsLnRyaWdnZXIgJiYgc3BlY2lhbC50cmlnZ2VyLmFwcGx5KCBlbGVtLCBkYXRhICkgPT09IGZhbHNlICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIERldGVybWluZSBldmVudCBwcm9wYWdhdGlvbiBwYXRoIGluIGFkdmFuY2UsIHBlciBXM0MgZXZlbnRzIHNwZWMgKCM5OTUxKVxuXHRcdC8vIEJ1YmJsZSB1cCB0byBkb2N1bWVudCwgdGhlbiB0byB3aW5kb3c7IHdhdGNoIGZvciBhIGdsb2JhbCBvd25lckRvY3VtZW50IHZhciAoIzk3MjQpXG5cdFx0aWYgKCAhb25seUhhbmRsZXJzICYmICFzcGVjaWFsLm5vQnViYmxlICYmICFqUXVlcnkuaXNXaW5kb3coIGVsZW0gKSApIHtcblxuXHRcdFx0YnViYmxlVHlwZSA9IHNwZWNpYWwuZGVsZWdhdGVUeXBlIHx8IHR5cGU7XG5cdFx0XHRpZiAoICFyZm9jdXNNb3JwaC50ZXN0KCBidWJibGVUeXBlICsgdHlwZSApICkge1xuXHRcdFx0XHRjdXIgPSBjdXIucGFyZW50Tm9kZTtcblx0XHRcdH1cblx0XHRcdGZvciAoIDsgY3VyOyBjdXIgPSBjdXIucGFyZW50Tm9kZSApIHtcblx0XHRcdFx0ZXZlbnRQYXRoLnB1c2goIGN1ciApO1xuXHRcdFx0XHR0bXAgPSBjdXI7XG5cdFx0XHR9XG5cblx0XHRcdC8vIE9ubHkgYWRkIHdpbmRvdyBpZiB3ZSBnb3QgdG8gZG9jdW1lbnQgKGUuZy4sIG5vdCBwbGFpbiBvYmogb3IgZGV0YWNoZWQgRE9NKVxuXHRcdFx0aWYgKCB0bXAgPT09IChlbGVtLm93bmVyRG9jdW1lbnQgfHwgZG9jdW1lbnQpICkge1xuXHRcdFx0XHRldmVudFBhdGgucHVzaCggdG1wLmRlZmF1bHRWaWV3IHx8IHRtcC5wYXJlbnRXaW5kb3cgfHwgd2luZG93ICk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gRmlyZSBoYW5kbGVycyBvbiB0aGUgZXZlbnQgcGF0aFxuXHRcdGkgPSAwO1xuXHRcdHdoaWxlICggKGN1ciA9IGV2ZW50UGF0aFtpKytdKSAmJiAhZXZlbnQuaXNQcm9wYWdhdGlvblN0b3BwZWQoKSApIHtcblxuXHRcdFx0ZXZlbnQudHlwZSA9IGkgPiAxID9cblx0XHRcdFx0YnViYmxlVHlwZSA6XG5cdFx0XHRcdHNwZWNpYWwuYmluZFR5cGUgfHwgdHlwZTtcblxuXHRcdFx0Ly8galF1ZXJ5IGhhbmRsZXJcblx0XHRcdGhhbmRsZSA9ICggZGF0YV9wcml2LmdldCggY3VyLCBcImV2ZW50c1wiICkgfHwge30gKVsgZXZlbnQudHlwZSBdICYmIGRhdGFfcHJpdi5nZXQoIGN1ciwgXCJoYW5kbGVcIiApO1xuXHRcdFx0aWYgKCBoYW5kbGUgKSB7XG5cdFx0XHRcdGhhbmRsZS5hcHBseSggY3VyLCBkYXRhICk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIE5hdGl2ZSBoYW5kbGVyXG5cdFx0XHRoYW5kbGUgPSBvbnR5cGUgJiYgY3VyWyBvbnR5cGUgXTtcblx0XHRcdGlmICggaGFuZGxlICYmIGhhbmRsZS5hcHBseSAmJiBqUXVlcnkuYWNjZXB0RGF0YSggY3VyICkgKSB7XG5cdFx0XHRcdGV2ZW50LnJlc3VsdCA9IGhhbmRsZS5hcHBseSggY3VyLCBkYXRhICk7XG5cdFx0XHRcdGlmICggZXZlbnQucmVzdWx0ID09PSBmYWxzZSApIHtcblx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGV2ZW50LnR5cGUgPSB0eXBlO1xuXG5cdFx0Ly8gSWYgbm9ib2R5IHByZXZlbnRlZCB0aGUgZGVmYXVsdCBhY3Rpb24sIGRvIGl0IG5vd1xuXHRcdGlmICggIW9ubHlIYW5kbGVycyAmJiAhZXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkgKSB7XG5cblx0XHRcdGlmICggKCFzcGVjaWFsLl9kZWZhdWx0IHx8IHNwZWNpYWwuX2RlZmF1bHQuYXBwbHkoIGV2ZW50UGF0aC5wb3AoKSwgZGF0YSApID09PSBmYWxzZSkgJiZcblx0XHRcdFx0alF1ZXJ5LmFjY2VwdERhdGEoIGVsZW0gKSApIHtcblxuXHRcdFx0XHQvLyBDYWxsIGEgbmF0aXZlIERPTSBtZXRob2Qgb24gdGhlIHRhcmdldCB3aXRoIHRoZSBzYW1lIG5hbWUgbmFtZSBhcyB0aGUgZXZlbnQuXG5cdFx0XHRcdC8vIERvbid0IGRvIGRlZmF1bHQgYWN0aW9ucyBvbiB3aW5kb3csIHRoYXQncyB3aGVyZSBnbG9iYWwgdmFyaWFibGVzIGJlICgjNjE3MClcblx0XHRcdFx0aWYgKCBvbnR5cGUgJiYgalF1ZXJ5LmlzRnVuY3Rpb24oIGVsZW1bIHR5cGUgXSApICYmICFqUXVlcnkuaXNXaW5kb3coIGVsZW0gKSApIHtcblxuXHRcdFx0XHRcdC8vIERvbid0IHJlLXRyaWdnZXIgYW4gb25GT08gZXZlbnQgd2hlbiB3ZSBjYWxsIGl0cyBGT08oKSBtZXRob2Rcblx0XHRcdFx0XHR0bXAgPSBlbGVtWyBvbnR5cGUgXTtcblxuXHRcdFx0XHRcdGlmICggdG1wICkge1xuXHRcdFx0XHRcdFx0ZWxlbVsgb250eXBlIF0gPSBudWxsO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIFByZXZlbnQgcmUtdHJpZ2dlcmluZyBvZiB0aGUgc2FtZSBldmVudCwgc2luY2Ugd2UgYWxyZWFkeSBidWJibGVkIGl0IGFib3ZlXG5cdFx0XHRcdFx0alF1ZXJ5LmV2ZW50LnRyaWdnZXJlZCA9IHR5cGU7XG5cdFx0XHRcdFx0ZWxlbVsgdHlwZSBdKCk7XG5cdFx0XHRcdFx0alF1ZXJ5LmV2ZW50LnRyaWdnZXJlZCA9IHVuZGVmaW5lZDtcblxuXHRcdFx0XHRcdGlmICggdG1wICkge1xuXHRcdFx0XHRcdFx0ZWxlbVsgb250eXBlIF0gPSB0bXA7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGV2ZW50LnJlc3VsdDtcblx0fSxcblxuXHRkaXNwYXRjaDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXG5cdFx0Ly8gTWFrZSBhIHdyaXRhYmxlIGpRdWVyeS5FdmVudCBmcm9tIHRoZSBuYXRpdmUgZXZlbnQgb2JqZWN0XG5cdFx0ZXZlbnQgPSBqUXVlcnkuZXZlbnQuZml4KCBldmVudCApO1xuXG5cdFx0dmFyIGksIGosIHJldCwgbWF0Y2hlZCwgaGFuZGxlT2JqLFxuXHRcdFx0aGFuZGxlclF1ZXVlID0gW10sXG5cdFx0XHRhcmdzID0gc2xpY2UuY2FsbCggYXJndW1lbnRzICksXG5cdFx0XHRoYW5kbGVycyA9ICggZGF0YV9wcml2LmdldCggdGhpcywgXCJldmVudHNcIiApIHx8IHt9IClbIGV2ZW50LnR5cGUgXSB8fCBbXSxcblx0XHRcdHNwZWNpYWwgPSBqUXVlcnkuZXZlbnQuc3BlY2lhbFsgZXZlbnQudHlwZSBdIHx8IHt9O1xuXG5cdFx0Ly8gVXNlIHRoZSBmaXgtZWQgalF1ZXJ5LkV2ZW50IHJhdGhlciB0aGFuIHRoZSAocmVhZC1vbmx5KSBuYXRpdmUgZXZlbnRcblx0XHRhcmdzWzBdID0gZXZlbnQ7XG5cdFx0ZXZlbnQuZGVsZWdhdGVUYXJnZXQgPSB0aGlzO1xuXG5cdFx0Ly8gQ2FsbCB0aGUgcHJlRGlzcGF0Y2ggaG9vayBmb3IgdGhlIG1hcHBlZCB0eXBlLCBhbmQgbGV0IGl0IGJhaWwgaWYgZGVzaXJlZFxuXHRcdGlmICggc3BlY2lhbC5wcmVEaXNwYXRjaCAmJiBzcGVjaWFsLnByZURpc3BhdGNoLmNhbGwoIHRoaXMsIGV2ZW50ICkgPT09IGZhbHNlICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIERldGVybWluZSBoYW5kbGVyc1xuXHRcdGhhbmRsZXJRdWV1ZSA9IGpRdWVyeS5ldmVudC5oYW5kbGVycy5jYWxsKCB0aGlzLCBldmVudCwgaGFuZGxlcnMgKTtcblxuXHRcdC8vIFJ1biBkZWxlZ2F0ZXMgZmlyc3Q7IHRoZXkgbWF5IHdhbnQgdG8gc3RvcCBwcm9wYWdhdGlvbiBiZW5lYXRoIHVzXG5cdFx0aSA9IDA7XG5cdFx0d2hpbGUgKCAobWF0Y2hlZCA9IGhhbmRsZXJRdWV1ZVsgaSsrIF0pICYmICFldmVudC5pc1Byb3BhZ2F0aW9uU3RvcHBlZCgpICkge1xuXHRcdFx0ZXZlbnQuY3VycmVudFRhcmdldCA9IG1hdGNoZWQuZWxlbTtcblxuXHRcdFx0aiA9IDA7XG5cdFx0XHR3aGlsZSAoIChoYW5kbGVPYmogPSBtYXRjaGVkLmhhbmRsZXJzWyBqKysgXSkgJiYgIWV2ZW50LmlzSW1tZWRpYXRlUHJvcGFnYXRpb25TdG9wcGVkKCkgKSB7XG5cblx0XHRcdFx0Ly8gVHJpZ2dlcmVkIGV2ZW50IG11c3QgZWl0aGVyIDEpIGhhdmUgbm8gbmFtZXNwYWNlLCBvclxuXHRcdFx0XHQvLyAyKSBoYXZlIG5hbWVzcGFjZShzKSBhIHN1YnNldCBvciBlcXVhbCB0byB0aG9zZSBpbiB0aGUgYm91bmQgZXZlbnQgKGJvdGggY2FuIGhhdmUgbm8gbmFtZXNwYWNlKS5cblx0XHRcdFx0aWYgKCAhZXZlbnQubmFtZXNwYWNlX3JlIHx8IGV2ZW50Lm5hbWVzcGFjZV9yZS50ZXN0KCBoYW5kbGVPYmoubmFtZXNwYWNlICkgKSB7XG5cblx0XHRcdFx0XHRldmVudC5oYW5kbGVPYmogPSBoYW5kbGVPYmo7XG5cdFx0XHRcdFx0ZXZlbnQuZGF0YSA9IGhhbmRsZU9iai5kYXRhO1xuXG5cdFx0XHRcdFx0cmV0ID0gKCAoalF1ZXJ5LmV2ZW50LnNwZWNpYWxbIGhhbmRsZU9iai5vcmlnVHlwZSBdIHx8IHt9KS5oYW5kbGUgfHwgaGFuZGxlT2JqLmhhbmRsZXIgKVxuXHRcdFx0XHRcdFx0XHQuYXBwbHkoIG1hdGNoZWQuZWxlbSwgYXJncyApO1xuXG5cdFx0XHRcdFx0aWYgKCByZXQgIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdFx0XHRcdGlmICggKGV2ZW50LnJlc3VsdCA9IHJldCkgPT09IGZhbHNlICkge1xuXHRcdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBDYWxsIHRoZSBwb3N0RGlzcGF0Y2ggaG9vayBmb3IgdGhlIG1hcHBlZCB0eXBlXG5cdFx0aWYgKCBzcGVjaWFsLnBvc3REaXNwYXRjaCApIHtcblx0XHRcdHNwZWNpYWwucG9zdERpc3BhdGNoLmNhbGwoIHRoaXMsIGV2ZW50ICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGV2ZW50LnJlc3VsdDtcblx0fSxcblxuXHRoYW5kbGVyczogZnVuY3Rpb24oIGV2ZW50LCBoYW5kbGVycyApIHtcblx0XHR2YXIgaSwgbWF0Y2hlcywgc2VsLCBoYW5kbGVPYmosXG5cdFx0XHRoYW5kbGVyUXVldWUgPSBbXSxcblx0XHRcdGRlbGVnYXRlQ291bnQgPSBoYW5kbGVycy5kZWxlZ2F0ZUNvdW50LFxuXHRcdFx0Y3VyID0gZXZlbnQudGFyZ2V0O1xuXG5cdFx0Ly8gRmluZCBkZWxlZ2F0ZSBoYW5kbGVyc1xuXHRcdC8vIEJsYWNrLWhvbGUgU1ZHIDx1c2U+IGluc3RhbmNlIHRyZWVzICgjMTMxODApXG5cdFx0Ly8gQXZvaWQgbm9uLWxlZnQtY2xpY2sgYnViYmxpbmcgaW4gRmlyZWZveCAoIzM4NjEpXG5cdFx0aWYgKCBkZWxlZ2F0ZUNvdW50ICYmIGN1ci5ub2RlVHlwZSAmJiAoIWV2ZW50LmJ1dHRvbiB8fCBldmVudC50eXBlICE9PSBcImNsaWNrXCIpICkge1xuXG5cdFx0XHRmb3IgKCA7IGN1ciAhPT0gdGhpczsgY3VyID0gY3VyLnBhcmVudE5vZGUgfHwgdGhpcyApIHtcblxuXHRcdFx0XHQvLyBEb24ndCBwcm9jZXNzIGNsaWNrcyBvbiBkaXNhYmxlZCBlbGVtZW50cyAoIzY5MTEsICM4MTY1LCAjMTEzODIsICMxMTc2NClcblx0XHRcdFx0aWYgKCBjdXIuZGlzYWJsZWQgIT09IHRydWUgfHwgZXZlbnQudHlwZSAhPT0gXCJjbGlja1wiICkge1xuXHRcdFx0XHRcdG1hdGNoZXMgPSBbXTtcblx0XHRcdFx0XHRmb3IgKCBpID0gMDsgaSA8IGRlbGVnYXRlQ291bnQ7IGkrKyApIHtcblx0XHRcdFx0XHRcdGhhbmRsZU9iaiA9IGhhbmRsZXJzWyBpIF07XG5cblx0XHRcdFx0XHRcdC8vIERvbid0IGNvbmZsaWN0IHdpdGggT2JqZWN0LnByb3RvdHlwZSBwcm9wZXJ0aWVzICgjMTMyMDMpXG5cdFx0XHRcdFx0XHRzZWwgPSBoYW5kbGVPYmouc2VsZWN0b3IgKyBcIiBcIjtcblxuXHRcdFx0XHRcdFx0aWYgKCBtYXRjaGVzWyBzZWwgXSA9PT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRcdFx0XHRtYXRjaGVzWyBzZWwgXSA9IGhhbmRsZU9iai5uZWVkc0NvbnRleHQgP1xuXHRcdFx0XHRcdFx0XHRcdGpRdWVyeSggc2VsLCB0aGlzICkuaW5kZXgoIGN1ciApID49IDAgOlxuXHRcdFx0XHRcdFx0XHRcdGpRdWVyeS5maW5kKCBzZWwsIHRoaXMsIG51bGwsIFsgY3VyIF0gKS5sZW5ndGg7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAoIG1hdGNoZXNbIHNlbCBdICkge1xuXHRcdFx0XHRcdFx0XHRtYXRjaGVzLnB1c2goIGhhbmRsZU9iaiApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoIG1hdGNoZXMubGVuZ3RoICkge1xuXHRcdFx0XHRcdFx0aGFuZGxlclF1ZXVlLnB1c2goeyBlbGVtOiBjdXIsIGhhbmRsZXJzOiBtYXRjaGVzIH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIEFkZCB0aGUgcmVtYWluaW5nIChkaXJlY3RseS1ib3VuZCkgaGFuZGxlcnNcblx0XHRpZiAoIGRlbGVnYXRlQ291bnQgPCBoYW5kbGVycy5sZW5ndGggKSB7XG5cdFx0XHRoYW5kbGVyUXVldWUucHVzaCh7IGVsZW06IHRoaXMsIGhhbmRsZXJzOiBoYW5kbGVycy5zbGljZSggZGVsZWdhdGVDb3VudCApIH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiBoYW5kbGVyUXVldWU7XG5cdH0sXG5cblx0Ly8gSW5jbHVkZXMgc29tZSBldmVudCBwcm9wcyBzaGFyZWQgYnkgS2V5RXZlbnQgYW5kIE1vdXNlRXZlbnRcblx0cHJvcHM6IFwiYWx0S2V5IGJ1YmJsZXMgY2FuY2VsYWJsZSBjdHJsS2V5IGN1cnJlbnRUYXJnZXQgZXZlbnRQaGFzZSBtZXRhS2V5IHJlbGF0ZWRUYXJnZXQgc2hpZnRLZXkgdGFyZ2V0IHRpbWVTdGFtcCB2aWV3IHdoaWNoXCIuc3BsaXQoXCIgXCIpLFxuXG5cdGZpeEhvb2tzOiB7fSxcblxuXHRrZXlIb29rczoge1xuXHRcdHByb3BzOiBcImNoYXIgY2hhckNvZGUga2V5IGtleUNvZGVcIi5zcGxpdChcIiBcIiksXG5cdFx0ZmlsdGVyOiBmdW5jdGlvbiggZXZlbnQsIG9yaWdpbmFsICkge1xuXG5cdFx0XHQvLyBBZGQgd2hpY2ggZm9yIGtleSBldmVudHNcblx0XHRcdGlmICggZXZlbnQud2hpY2ggPT0gbnVsbCApIHtcblx0XHRcdFx0ZXZlbnQud2hpY2ggPSBvcmlnaW5hbC5jaGFyQ29kZSAhPSBudWxsID8gb3JpZ2luYWwuY2hhckNvZGUgOiBvcmlnaW5hbC5rZXlDb2RlO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gZXZlbnQ7XG5cdFx0fVxuXHR9LFxuXG5cdG1vdXNlSG9va3M6IHtcblx0XHRwcm9wczogXCJidXR0b24gYnV0dG9ucyBjbGllbnRYIGNsaWVudFkgb2Zmc2V0WCBvZmZzZXRZIHBhZ2VYIHBhZ2VZIHNjcmVlblggc2NyZWVuWSB0b0VsZW1lbnRcIi5zcGxpdChcIiBcIiksXG5cdFx0ZmlsdGVyOiBmdW5jdGlvbiggZXZlbnQsIG9yaWdpbmFsICkge1xuXHRcdFx0dmFyIGV2ZW50RG9jLCBkb2MsIGJvZHksXG5cdFx0XHRcdGJ1dHRvbiA9IG9yaWdpbmFsLmJ1dHRvbjtcblxuXHRcdFx0Ly8gQ2FsY3VsYXRlIHBhZ2VYL1kgaWYgbWlzc2luZyBhbmQgY2xpZW50WC9ZIGF2YWlsYWJsZVxuXHRcdFx0aWYgKCBldmVudC5wYWdlWCA9PSBudWxsICYmIG9yaWdpbmFsLmNsaWVudFggIT0gbnVsbCApIHtcblx0XHRcdFx0ZXZlbnREb2MgPSBldmVudC50YXJnZXQub3duZXJEb2N1bWVudCB8fCBkb2N1bWVudDtcblx0XHRcdFx0ZG9jID0gZXZlbnREb2MuZG9jdW1lbnRFbGVtZW50O1xuXHRcdFx0XHRib2R5ID0gZXZlbnREb2MuYm9keTtcblxuXHRcdFx0XHRldmVudC5wYWdlWCA9IG9yaWdpbmFsLmNsaWVudFggKyAoIGRvYyAmJiBkb2Muc2Nyb2xsTGVmdCB8fCBib2R5ICYmIGJvZHkuc2Nyb2xsTGVmdCB8fCAwICkgLSAoIGRvYyAmJiBkb2MuY2xpZW50TGVmdCB8fCBib2R5ICYmIGJvZHkuY2xpZW50TGVmdCB8fCAwICk7XG5cdFx0XHRcdGV2ZW50LnBhZ2VZID0gb3JpZ2luYWwuY2xpZW50WSArICggZG9jICYmIGRvYy5zY3JvbGxUb3AgIHx8IGJvZHkgJiYgYm9keS5zY3JvbGxUb3AgIHx8IDAgKSAtICggZG9jICYmIGRvYy5jbGllbnRUb3AgIHx8IGJvZHkgJiYgYm9keS5jbGllbnRUb3AgIHx8IDAgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQWRkIHdoaWNoIGZvciBjbGljazogMSA9PT0gbGVmdDsgMiA9PT0gbWlkZGxlOyAzID09PSByaWdodFxuXHRcdFx0Ly8gTm90ZTogYnV0dG9uIGlzIG5vdCBub3JtYWxpemVkLCBzbyBkb24ndCB1c2UgaXRcblx0XHRcdGlmICggIWV2ZW50LndoaWNoICYmIGJ1dHRvbiAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRldmVudC53aGljaCA9ICggYnV0dG9uICYgMSA/IDEgOiAoIGJ1dHRvbiAmIDIgPyAzIDogKCBidXR0b24gJiA0ID8gMiA6IDAgKSApICk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBldmVudDtcblx0XHR9XG5cdH0sXG5cblx0Zml4OiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0aWYgKCBldmVudFsgalF1ZXJ5LmV4cGFuZG8gXSApIHtcblx0XHRcdHJldHVybiBldmVudDtcblx0XHR9XG5cblx0XHQvLyBDcmVhdGUgYSB3cml0YWJsZSBjb3B5IG9mIHRoZSBldmVudCBvYmplY3QgYW5kIG5vcm1hbGl6ZSBzb21lIHByb3BlcnRpZXNcblx0XHR2YXIgaSwgcHJvcCwgY29weSxcblx0XHRcdHR5cGUgPSBldmVudC50eXBlLFxuXHRcdFx0b3JpZ2luYWxFdmVudCA9IGV2ZW50LFxuXHRcdFx0Zml4SG9vayA9IHRoaXMuZml4SG9va3NbIHR5cGUgXTtcblxuXHRcdGlmICggIWZpeEhvb2sgKSB7XG5cdFx0XHR0aGlzLmZpeEhvb2tzWyB0eXBlIF0gPSBmaXhIb29rID1cblx0XHRcdFx0cm1vdXNlRXZlbnQudGVzdCggdHlwZSApID8gdGhpcy5tb3VzZUhvb2tzIDpcblx0XHRcdFx0cmtleUV2ZW50LnRlc3QoIHR5cGUgKSA/IHRoaXMua2V5SG9va3MgOlxuXHRcdFx0XHR7fTtcblx0XHR9XG5cdFx0Y29weSA9IGZpeEhvb2sucHJvcHMgPyB0aGlzLnByb3BzLmNvbmNhdCggZml4SG9vay5wcm9wcyApIDogdGhpcy5wcm9wcztcblxuXHRcdGV2ZW50ID0gbmV3IGpRdWVyeS5FdmVudCggb3JpZ2luYWxFdmVudCApO1xuXG5cdFx0aSA9IGNvcHkubGVuZ3RoO1xuXHRcdHdoaWxlICggaS0tICkge1xuXHRcdFx0cHJvcCA9IGNvcHlbIGkgXTtcblx0XHRcdGV2ZW50WyBwcm9wIF0gPSBvcmlnaW5hbEV2ZW50WyBwcm9wIF07XG5cdFx0fVxuXG5cdFx0Ly8gU3VwcG9ydDogQ29yZG92YSAyLjUgKFdlYktpdCkgKCMxMzI1NSlcblx0XHQvLyBBbGwgZXZlbnRzIHNob3VsZCBoYXZlIGEgdGFyZ2V0OyBDb3Jkb3ZhIGRldmljZXJlYWR5IGRvZXNuJ3Rcblx0XHRpZiAoICFldmVudC50YXJnZXQgKSB7XG5cdFx0XHRldmVudC50YXJnZXQgPSBkb2N1bWVudDtcblx0XHR9XG5cblx0XHQvLyBTdXBwb3J0OiBTYWZhcmkgNi4wKywgQ2hyb21lIDwgMjhcblx0XHQvLyBUYXJnZXQgc2hvdWxkIG5vdCBiZSBhIHRleHQgbm9kZSAoIzUwNCwgIzEzMTQzKVxuXHRcdGlmICggZXZlbnQudGFyZ2V0Lm5vZGVUeXBlID09PSAzICkge1xuXHRcdFx0ZXZlbnQudGFyZ2V0ID0gZXZlbnQudGFyZ2V0LnBhcmVudE5vZGU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZpeEhvb2suZmlsdGVyID8gZml4SG9vay5maWx0ZXIoIGV2ZW50LCBvcmlnaW5hbEV2ZW50ICkgOiBldmVudDtcblx0fSxcblxuXHRzcGVjaWFsOiB7XG5cdFx0bG9hZDoge1xuXHRcdFx0Ly8gUHJldmVudCB0cmlnZ2VyZWQgaW1hZ2UubG9hZCBldmVudHMgZnJvbSBidWJibGluZyB0byB3aW5kb3cubG9hZFxuXHRcdFx0bm9CdWJibGU6IHRydWVcblx0XHR9LFxuXHRcdGZvY3VzOiB7XG5cdFx0XHQvLyBGaXJlIG5hdGl2ZSBldmVudCBpZiBwb3NzaWJsZSBzbyBibHVyL2ZvY3VzIHNlcXVlbmNlIGlzIGNvcnJlY3Rcblx0XHRcdHRyaWdnZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAoIHRoaXMgIT09IHNhZmVBY3RpdmVFbGVtZW50KCkgJiYgdGhpcy5mb2N1cyApIHtcblx0XHRcdFx0XHR0aGlzLmZvY3VzKCk7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0ZGVsZWdhdGVUeXBlOiBcImZvY3VzaW5cIlxuXHRcdH0sXG5cdFx0Ymx1cjoge1xuXHRcdFx0dHJpZ2dlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICggdGhpcyA9PT0gc2FmZUFjdGl2ZUVsZW1lbnQoKSAmJiB0aGlzLmJsdXIgKSB7XG5cdFx0XHRcdFx0dGhpcy5ibHVyKCk7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0ZGVsZWdhdGVUeXBlOiBcImZvY3Vzb3V0XCJcblx0XHR9LFxuXHRcdGNsaWNrOiB7XG5cdFx0XHQvLyBGb3IgY2hlY2tib3gsIGZpcmUgbmF0aXZlIGV2ZW50IHNvIGNoZWNrZWQgc3RhdGUgd2lsbCBiZSByaWdodFxuXHRcdFx0dHJpZ2dlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICggdGhpcy50eXBlID09PSBcImNoZWNrYm94XCIgJiYgdGhpcy5jbGljayAmJiBqUXVlcnkubm9kZU5hbWUoIHRoaXMsIFwiaW5wdXRcIiApICkge1xuXHRcdFx0XHRcdHRoaXMuY2xpY2soKTtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cblx0XHRcdC8vIEZvciBjcm9zcy1icm93c2VyIGNvbnNpc3RlbmN5LCBkb24ndCBmaXJlIG5hdGl2ZSAuY2xpY2soKSBvbiBsaW5rc1xuXHRcdFx0X2RlZmF1bHQ6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0cmV0dXJuIGpRdWVyeS5ub2RlTmFtZSggZXZlbnQudGFyZ2V0LCBcImFcIiApO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRiZWZvcmV1bmxvYWQ6IHtcblx0XHRcdHBvc3REaXNwYXRjaDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXG5cdFx0XHRcdC8vIFN1cHBvcnQ6IEZpcmVmb3ggMjArXG5cdFx0XHRcdC8vIEZpcmVmb3ggZG9lc24ndCBhbGVydCBpZiB0aGUgcmV0dXJuVmFsdWUgZmllbGQgaXMgbm90IHNldC5cblx0XHRcdFx0aWYgKCBldmVudC5yZXN1bHQgIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdFx0XHRldmVudC5vcmlnaW5hbEV2ZW50LnJldHVyblZhbHVlID0gZXZlbnQucmVzdWx0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdHNpbXVsYXRlOiBmdW5jdGlvbiggdHlwZSwgZWxlbSwgZXZlbnQsIGJ1YmJsZSApIHtcblx0XHQvLyBQaWdneWJhY2sgb24gYSBkb25vciBldmVudCB0byBzaW11bGF0ZSBhIGRpZmZlcmVudCBvbmUuXG5cdFx0Ly8gRmFrZSBvcmlnaW5hbEV2ZW50IHRvIGF2b2lkIGRvbm9yJ3Mgc3RvcFByb3BhZ2F0aW9uLCBidXQgaWYgdGhlXG5cdFx0Ly8gc2ltdWxhdGVkIGV2ZW50IHByZXZlbnRzIGRlZmF1bHQgdGhlbiB3ZSBkbyB0aGUgc2FtZSBvbiB0aGUgZG9ub3IuXG5cdFx0dmFyIGUgPSBqUXVlcnkuZXh0ZW5kKFxuXHRcdFx0bmV3IGpRdWVyeS5FdmVudCgpLFxuXHRcdFx0ZXZlbnQsXG5cdFx0XHR7XG5cdFx0XHRcdHR5cGU6IHR5cGUsXG5cdFx0XHRcdGlzU2ltdWxhdGVkOiB0cnVlLFxuXHRcdFx0XHRvcmlnaW5hbEV2ZW50OiB7fVxuXHRcdFx0fVxuXHRcdCk7XG5cdFx0aWYgKCBidWJibGUgKSB7XG5cdFx0XHRqUXVlcnkuZXZlbnQudHJpZ2dlciggZSwgbnVsbCwgZWxlbSApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRqUXVlcnkuZXZlbnQuZGlzcGF0Y2guY2FsbCggZWxlbSwgZSApO1xuXHRcdH1cblx0XHRpZiAoIGUuaXNEZWZhdWx0UHJldmVudGVkKCkgKSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblx0fVxufTtcblxualF1ZXJ5LnJlbW92ZUV2ZW50ID0gZnVuY3Rpb24oIGVsZW0sIHR5cGUsIGhhbmRsZSApIHtcblx0aWYgKCBlbGVtLnJlbW92ZUV2ZW50TGlzdGVuZXIgKSB7XG5cdFx0ZWxlbS5yZW1vdmVFdmVudExpc3RlbmVyKCB0eXBlLCBoYW5kbGUsIGZhbHNlICk7XG5cdH1cbn07XG5cbmpRdWVyeS5FdmVudCA9IGZ1bmN0aW9uKCBzcmMsIHByb3BzICkge1xuXHQvLyBBbGxvdyBpbnN0YW50aWF0aW9uIHdpdGhvdXQgdGhlICduZXcnIGtleXdvcmRcblx0aWYgKCAhKHRoaXMgaW5zdGFuY2VvZiBqUXVlcnkuRXZlbnQpICkge1xuXHRcdHJldHVybiBuZXcgalF1ZXJ5LkV2ZW50KCBzcmMsIHByb3BzICk7XG5cdH1cblxuXHQvLyBFdmVudCBvYmplY3Rcblx0aWYgKCBzcmMgJiYgc3JjLnR5cGUgKSB7XG5cdFx0dGhpcy5vcmlnaW5hbEV2ZW50ID0gc3JjO1xuXHRcdHRoaXMudHlwZSA9IHNyYy50eXBlO1xuXG5cdFx0Ly8gRXZlbnRzIGJ1YmJsaW5nIHVwIHRoZSBkb2N1bWVudCBtYXkgaGF2ZSBiZWVuIG1hcmtlZCBhcyBwcmV2ZW50ZWRcblx0XHQvLyBieSBhIGhhbmRsZXIgbG93ZXIgZG93biB0aGUgdHJlZTsgcmVmbGVjdCB0aGUgY29ycmVjdCB2YWx1ZS5cblx0XHR0aGlzLmlzRGVmYXVsdFByZXZlbnRlZCA9IHNyYy5kZWZhdWx0UHJldmVudGVkIHx8XG5cdFx0XHRcdC8vIFN1cHBvcnQ6IEFuZHJvaWQgPCA0LjBcblx0XHRcdFx0c3JjLmRlZmF1bHRQcmV2ZW50ZWQgPT09IHVuZGVmaW5lZCAmJlxuXHRcdFx0XHRzcmMuZ2V0UHJldmVudERlZmF1bHQgJiYgc3JjLmdldFByZXZlbnREZWZhdWx0KCkgP1xuXHRcdFx0cmV0dXJuVHJ1ZSA6XG5cdFx0XHRyZXR1cm5GYWxzZTtcblxuXHQvLyBFdmVudCB0eXBlXG5cdH0gZWxzZSB7XG5cdFx0dGhpcy50eXBlID0gc3JjO1xuXHR9XG5cblx0Ly8gUHV0IGV4cGxpY2l0bHkgcHJvdmlkZWQgcHJvcGVydGllcyBvbnRvIHRoZSBldmVudCBvYmplY3Rcblx0aWYgKCBwcm9wcyApIHtcblx0XHRqUXVlcnkuZXh0ZW5kKCB0aGlzLCBwcm9wcyApO1xuXHR9XG5cblx0Ly8gQ3JlYXRlIGEgdGltZXN0YW1wIGlmIGluY29taW5nIGV2ZW50IGRvZXNuJ3QgaGF2ZSBvbmVcblx0dGhpcy50aW1lU3RhbXAgPSBzcmMgJiYgc3JjLnRpbWVTdGFtcCB8fCBqUXVlcnkubm93KCk7XG5cblx0Ly8gTWFyayBpdCBhcyBmaXhlZFxuXHR0aGlzWyBqUXVlcnkuZXhwYW5kbyBdID0gdHJ1ZTtcbn07XG5cbi8vIGpRdWVyeS5FdmVudCBpcyBiYXNlZCBvbiBET00zIEV2ZW50cyBhcyBzcGVjaWZpZWQgYnkgdGhlIEVDTUFTY3JpcHQgTGFuZ3VhZ2UgQmluZGluZ1xuLy8gaHR0cDovL3d3dy53My5vcmcvVFIvMjAwMy9XRC1ET00tTGV2ZWwtMy1FdmVudHMtMjAwMzAzMzEvZWNtYS1zY3JpcHQtYmluZGluZy5odG1sXG5qUXVlcnkuRXZlbnQucHJvdG90eXBlID0ge1xuXHRpc0RlZmF1bHRQcmV2ZW50ZWQ6IHJldHVybkZhbHNlLFxuXHRpc1Byb3BhZ2F0aW9uU3RvcHBlZDogcmV0dXJuRmFsc2UsXG5cdGlzSW1tZWRpYXRlUHJvcGFnYXRpb25TdG9wcGVkOiByZXR1cm5GYWxzZSxcblxuXHRwcmV2ZW50RGVmYXVsdDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGUgPSB0aGlzLm9yaWdpbmFsRXZlbnQ7XG5cblx0XHR0aGlzLmlzRGVmYXVsdFByZXZlbnRlZCA9IHJldHVyblRydWU7XG5cblx0XHRpZiAoIGUgJiYgZS5wcmV2ZW50RGVmYXVsdCApIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHR9XG5cdH0sXG5cdHN0b3BQcm9wYWdhdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGUgPSB0aGlzLm9yaWdpbmFsRXZlbnQ7XG5cblx0XHR0aGlzLmlzUHJvcGFnYXRpb25TdG9wcGVkID0gcmV0dXJuVHJ1ZTtcblxuXHRcdGlmICggZSAmJiBlLnN0b3BQcm9wYWdhdGlvbiApIHtcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0fVxuXHR9LFxuXHRzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb246IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuaXNJbW1lZGlhdGVQcm9wYWdhdGlvblN0b3BwZWQgPSByZXR1cm5UcnVlO1xuXHRcdHRoaXMuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdH1cbn07XG5cbi8vIENyZWF0ZSBtb3VzZWVudGVyL2xlYXZlIGV2ZW50cyB1c2luZyBtb3VzZW92ZXIvb3V0IGFuZCBldmVudC10aW1lIGNoZWNrc1xuLy8gU3VwcG9ydDogQ2hyb21lIDE1K1xualF1ZXJ5LmVhY2goe1xuXHRtb3VzZWVudGVyOiBcIm1vdXNlb3ZlclwiLFxuXHRtb3VzZWxlYXZlOiBcIm1vdXNlb3V0XCJcbn0sIGZ1bmN0aW9uKCBvcmlnLCBmaXggKSB7XG5cdGpRdWVyeS5ldmVudC5zcGVjaWFsWyBvcmlnIF0gPSB7XG5cdFx0ZGVsZWdhdGVUeXBlOiBmaXgsXG5cdFx0YmluZFR5cGU6IGZpeCxcblxuXHRcdGhhbmRsZTogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0dmFyIHJldCxcblx0XHRcdFx0dGFyZ2V0ID0gdGhpcyxcblx0XHRcdFx0cmVsYXRlZCA9IGV2ZW50LnJlbGF0ZWRUYXJnZXQsXG5cdFx0XHRcdGhhbmRsZU9iaiA9IGV2ZW50LmhhbmRsZU9iajtcblxuXHRcdFx0Ly8gRm9yIG1vdXNlbnRlci9sZWF2ZSBjYWxsIHRoZSBoYW5kbGVyIGlmIHJlbGF0ZWQgaXMgb3V0c2lkZSB0aGUgdGFyZ2V0LlxuXHRcdFx0Ly8gTkI6IE5vIHJlbGF0ZWRUYXJnZXQgaWYgdGhlIG1vdXNlIGxlZnQvZW50ZXJlZCB0aGUgYnJvd3NlciB3aW5kb3dcblx0XHRcdGlmICggIXJlbGF0ZWQgfHwgKHJlbGF0ZWQgIT09IHRhcmdldCAmJiAhalF1ZXJ5LmNvbnRhaW5zKCB0YXJnZXQsIHJlbGF0ZWQgKSkgKSB7XG5cdFx0XHRcdGV2ZW50LnR5cGUgPSBoYW5kbGVPYmoub3JpZ1R5cGU7XG5cdFx0XHRcdHJldCA9IGhhbmRsZU9iai5oYW5kbGVyLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHRcdFx0ZXZlbnQudHlwZSA9IGZpeDtcblx0XHRcdH1cblx0XHRcdHJldHVybiByZXQ7XG5cdFx0fVxuXHR9O1xufSk7XG5cbi8vIENyZWF0ZSBcImJ1YmJsaW5nXCIgZm9jdXMgYW5kIGJsdXIgZXZlbnRzXG4vLyBTdXBwb3J0OiBGaXJlZm94LCBDaHJvbWUsIFNhZmFyaVxuaWYgKCAhc3VwcG9ydC5mb2N1c2luQnViYmxlcyApIHtcblx0alF1ZXJ5LmVhY2goeyBmb2N1czogXCJmb2N1c2luXCIsIGJsdXI6IFwiZm9jdXNvdXRcIiB9LCBmdW5jdGlvbiggb3JpZywgZml4ICkge1xuXG5cdFx0Ly8gQXR0YWNoIGEgc2luZ2xlIGNhcHR1cmluZyBoYW5kbGVyIG9uIHRoZSBkb2N1bWVudCB3aGlsZSBzb21lb25lIHdhbnRzIGZvY3VzaW4vZm9jdXNvdXRcblx0XHR2YXIgaGFuZGxlciA9IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0alF1ZXJ5LmV2ZW50LnNpbXVsYXRlKCBmaXgsIGV2ZW50LnRhcmdldCwgalF1ZXJ5LmV2ZW50LmZpeCggZXZlbnQgKSwgdHJ1ZSApO1xuXHRcdFx0fTtcblxuXHRcdGpRdWVyeS5ldmVudC5zcGVjaWFsWyBmaXggXSA9IHtcblx0XHRcdHNldHVwOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGRvYyA9IHRoaXMub3duZXJEb2N1bWVudCB8fCB0aGlzLFxuXHRcdFx0XHRcdGF0dGFjaGVzID0gZGF0YV9wcml2LmFjY2VzcyggZG9jLCBmaXggKTtcblxuXHRcdFx0XHRpZiAoICFhdHRhY2hlcyApIHtcblx0XHRcdFx0XHRkb2MuYWRkRXZlbnRMaXN0ZW5lciggb3JpZywgaGFuZGxlciwgdHJ1ZSApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGRhdGFfcHJpdi5hY2Nlc3MoIGRvYywgZml4LCAoIGF0dGFjaGVzIHx8IDAgKSArIDEgKTtcblx0XHRcdH0sXG5cdFx0XHR0ZWFyZG93bjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBkb2MgPSB0aGlzLm93bmVyRG9jdW1lbnQgfHwgdGhpcyxcblx0XHRcdFx0XHRhdHRhY2hlcyA9IGRhdGFfcHJpdi5hY2Nlc3MoIGRvYywgZml4ICkgLSAxO1xuXG5cdFx0XHRcdGlmICggIWF0dGFjaGVzICkge1xuXHRcdFx0XHRcdGRvYy5yZW1vdmVFdmVudExpc3RlbmVyKCBvcmlnLCBoYW5kbGVyLCB0cnVlICk7XG5cdFx0XHRcdFx0ZGF0YV9wcml2LnJlbW92ZSggZG9jLCBmaXggKTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGRhdGFfcHJpdi5hY2Nlc3MoIGRvYywgZml4LCBhdHRhY2hlcyApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0fSk7XG59XG5cbmpRdWVyeS5mbi5leHRlbmQoe1xuXG5cdG9uOiBmdW5jdGlvbiggdHlwZXMsIHNlbGVjdG9yLCBkYXRhLCBmbiwgLypJTlRFUk5BTCovIG9uZSApIHtcblx0XHR2YXIgb3JpZ0ZuLCB0eXBlO1xuXG5cdFx0Ly8gVHlwZXMgY2FuIGJlIGEgbWFwIG9mIHR5cGVzL2hhbmRsZXJzXG5cdFx0aWYgKCB0eXBlb2YgdHlwZXMgPT09IFwib2JqZWN0XCIgKSB7XG5cdFx0XHQvLyAoIHR5cGVzLU9iamVjdCwgc2VsZWN0b3IsIGRhdGEgKVxuXHRcdFx0aWYgKCB0eXBlb2Ygc2VsZWN0b3IgIT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHRcdC8vICggdHlwZXMtT2JqZWN0LCBkYXRhIClcblx0XHRcdFx0ZGF0YSA9IGRhdGEgfHwgc2VsZWN0b3I7XG5cdFx0XHRcdHNlbGVjdG9yID0gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdFx0Zm9yICggdHlwZSBpbiB0eXBlcyApIHtcblx0XHRcdFx0dGhpcy5vbiggdHlwZSwgc2VsZWN0b3IsIGRhdGEsIHR5cGVzWyB0eXBlIF0sIG9uZSApO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0aWYgKCBkYXRhID09IG51bGwgJiYgZm4gPT0gbnVsbCApIHtcblx0XHRcdC8vICggdHlwZXMsIGZuIClcblx0XHRcdGZuID0gc2VsZWN0b3I7XG5cdFx0XHRkYXRhID0gc2VsZWN0b3IgPSB1bmRlZmluZWQ7XG5cdFx0fSBlbHNlIGlmICggZm4gPT0gbnVsbCApIHtcblx0XHRcdGlmICggdHlwZW9mIHNlbGVjdG9yID09PSBcInN0cmluZ1wiICkge1xuXHRcdFx0XHQvLyAoIHR5cGVzLCBzZWxlY3RvciwgZm4gKVxuXHRcdFx0XHRmbiA9IGRhdGE7XG5cdFx0XHRcdGRhdGEgPSB1bmRlZmluZWQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyAoIHR5cGVzLCBkYXRhLCBmbiApXG5cdFx0XHRcdGZuID0gZGF0YTtcblx0XHRcdFx0ZGF0YSA9IHNlbGVjdG9yO1xuXHRcdFx0XHRzZWxlY3RvciA9IHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKCBmbiA9PT0gZmFsc2UgKSB7XG5cdFx0XHRmbiA9IHJldHVybkZhbHNlO1xuXHRcdH0gZWxzZSBpZiAoICFmbiApIHtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGlmICggb25lID09PSAxICkge1xuXHRcdFx0b3JpZ0ZuID0gZm47XG5cdFx0XHRmbiA9IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0Ly8gQ2FuIHVzZSBhbiBlbXB0eSBzZXQsIHNpbmNlIGV2ZW50IGNvbnRhaW5zIHRoZSBpbmZvXG5cdFx0XHRcdGpRdWVyeSgpLm9mZiggZXZlbnQgKTtcblx0XHRcdFx0cmV0dXJuIG9yaWdGbi5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0XHR9O1xuXHRcdFx0Ly8gVXNlIHNhbWUgZ3VpZCBzbyBjYWxsZXIgY2FuIHJlbW92ZSB1c2luZyBvcmlnRm5cblx0XHRcdGZuLmd1aWQgPSBvcmlnRm4uZ3VpZCB8fCAoIG9yaWdGbi5ndWlkID0galF1ZXJ5Lmd1aWQrKyApO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5lYWNoKCBmdW5jdGlvbigpIHtcblx0XHRcdGpRdWVyeS5ldmVudC5hZGQoIHRoaXMsIHR5cGVzLCBmbiwgZGF0YSwgc2VsZWN0b3IgKTtcblx0XHR9KTtcblx0fSxcblx0b25lOiBmdW5jdGlvbiggdHlwZXMsIHNlbGVjdG9yLCBkYXRhLCBmbiApIHtcblx0XHRyZXR1cm4gdGhpcy5vbiggdHlwZXMsIHNlbGVjdG9yLCBkYXRhLCBmbiwgMSApO1xuXHR9LFxuXHRvZmY6IGZ1bmN0aW9uKCB0eXBlcywgc2VsZWN0b3IsIGZuICkge1xuXHRcdHZhciBoYW5kbGVPYmosIHR5cGU7XG5cdFx0aWYgKCB0eXBlcyAmJiB0eXBlcy5wcmV2ZW50RGVmYXVsdCAmJiB0eXBlcy5oYW5kbGVPYmogKSB7XG5cdFx0XHQvLyAoIGV2ZW50ICkgIGRpc3BhdGNoZWQgalF1ZXJ5LkV2ZW50XG5cdFx0XHRoYW5kbGVPYmogPSB0eXBlcy5oYW5kbGVPYmo7XG5cdFx0XHRqUXVlcnkoIHR5cGVzLmRlbGVnYXRlVGFyZ2V0ICkub2ZmKFxuXHRcdFx0XHRoYW5kbGVPYmoubmFtZXNwYWNlID8gaGFuZGxlT2JqLm9yaWdUeXBlICsgXCIuXCIgKyBoYW5kbGVPYmoubmFtZXNwYWNlIDogaGFuZGxlT2JqLm9yaWdUeXBlLFxuXHRcdFx0XHRoYW5kbGVPYmouc2VsZWN0b3IsXG5cdFx0XHRcdGhhbmRsZU9iai5oYW5kbGVyXG5cdFx0XHQpO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXHRcdGlmICggdHlwZW9mIHR5cGVzID09PSBcIm9iamVjdFwiICkge1xuXHRcdFx0Ly8gKCB0eXBlcy1vYmplY3QgWywgc2VsZWN0b3JdIClcblx0XHRcdGZvciAoIHR5cGUgaW4gdHlwZXMgKSB7XG5cdFx0XHRcdHRoaXMub2ZmKCB0eXBlLCBzZWxlY3RvciwgdHlwZXNbIHR5cGUgXSApO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXHRcdGlmICggc2VsZWN0b3IgPT09IGZhbHNlIHx8IHR5cGVvZiBzZWxlY3RvciA9PT0gXCJmdW5jdGlvblwiICkge1xuXHRcdFx0Ly8gKCB0eXBlcyBbLCBmbl0gKVxuXHRcdFx0Zm4gPSBzZWxlY3Rvcjtcblx0XHRcdHNlbGVjdG9yID0gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRpZiAoIGZuID09PSBmYWxzZSApIHtcblx0XHRcdGZuID0gcmV0dXJuRmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHRqUXVlcnkuZXZlbnQucmVtb3ZlKCB0aGlzLCB0eXBlcywgZm4sIHNlbGVjdG9yICk7XG5cdFx0fSk7XG5cdH0sXG5cblx0dHJpZ2dlcjogZnVuY3Rpb24oIHR5cGUsIGRhdGEgKSB7XG5cdFx0cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdGpRdWVyeS5ldmVudC50cmlnZ2VyKCB0eXBlLCBkYXRhLCB0aGlzICk7XG5cdFx0fSk7XG5cdH0sXG5cdHRyaWdnZXJIYW5kbGVyOiBmdW5jdGlvbiggdHlwZSwgZGF0YSApIHtcblx0XHR2YXIgZWxlbSA9IHRoaXNbMF07XG5cdFx0aWYgKCBlbGVtICkge1xuXHRcdFx0cmV0dXJuIGpRdWVyeS5ldmVudC50cmlnZ2VyKCB0eXBlLCBkYXRhLCBlbGVtLCB0cnVlICk7XG5cdFx0fVxuXHR9XG59KTtcblxuXG52YXJcblx0cnhodG1sVGFnID0gLzwoPyFhcmVhfGJyfGNvbHxlbWJlZHxocnxpbWd8aW5wdXR8bGlua3xtZXRhfHBhcmFtKSgoW1xcdzpdKylbXj5dKilcXC8+L2dpLFxuXHRydGFnTmFtZSA9IC88KFtcXHc6XSspLyxcblx0cmh0bWwgPSAvPHwmIz9cXHcrOy8sXG5cdHJub0lubmVyaHRtbCA9IC88KD86c2NyaXB0fHN0eWxlfGxpbmspL2ksXG5cdC8vIGNoZWNrZWQ9XCJjaGVja2VkXCIgb3IgY2hlY2tlZFxuXHRyY2hlY2tlZCA9IC9jaGVja2VkXFxzKig/OltePV18PVxccyouY2hlY2tlZC4pL2ksXG5cdHJzY3JpcHRUeXBlID0gL14kfFxcLyg/OmphdmF8ZWNtYSlzY3JpcHQvaSxcblx0cnNjcmlwdFR5cGVNYXNrZWQgPSAvXnRydWVcXC8oLiopLyxcblx0cmNsZWFuU2NyaXB0ID0gL15cXHMqPCEoPzpcXFtDREFUQVxcW3wtLSl8KD86XFxdXFxdfC0tKT5cXHMqJC9nLFxuXG5cdC8vIFdlIGhhdmUgdG8gY2xvc2UgdGhlc2UgdGFncyB0byBzdXBwb3J0IFhIVE1MICgjMTMyMDApXG5cdHdyYXBNYXAgPSB7XG5cblx0XHQvLyBTdXBwb3J0OiBJRSA5XG5cdFx0b3B0aW9uOiBbIDEsIFwiPHNlbGVjdCBtdWx0aXBsZT0nbXVsdGlwbGUnPlwiLCBcIjwvc2VsZWN0PlwiIF0sXG5cblx0XHR0aGVhZDogWyAxLCBcIjx0YWJsZT5cIiwgXCI8L3RhYmxlPlwiIF0sXG5cdFx0Y29sOiBbIDIsIFwiPHRhYmxlPjxjb2xncm91cD5cIiwgXCI8L2NvbGdyb3VwPjwvdGFibGU+XCIgXSxcblx0XHR0cjogWyAyLCBcIjx0YWJsZT48dGJvZHk+XCIsIFwiPC90Ym9keT48L3RhYmxlPlwiIF0sXG5cdFx0dGQ6IFsgMywgXCI8dGFibGU+PHRib2R5Pjx0cj5cIiwgXCI8L3RyPjwvdGJvZHk+PC90YWJsZT5cIiBdLFxuXG5cdFx0X2RlZmF1bHQ6IFsgMCwgXCJcIiwgXCJcIiBdXG5cdH07XG5cbi8vIFN1cHBvcnQ6IElFIDlcbndyYXBNYXAub3B0Z3JvdXAgPSB3cmFwTWFwLm9wdGlvbjtcblxud3JhcE1hcC50Ym9keSA9IHdyYXBNYXAudGZvb3QgPSB3cmFwTWFwLmNvbGdyb3VwID0gd3JhcE1hcC5jYXB0aW9uID0gd3JhcE1hcC50aGVhZDtcbndyYXBNYXAudGggPSB3cmFwTWFwLnRkO1xuXG4vLyBTdXBwb3J0OiAxLnggY29tcGF0aWJpbGl0eVxuLy8gTWFuaXB1bGF0aW5nIHRhYmxlcyByZXF1aXJlcyBhIHRib2R5XG5mdW5jdGlvbiBtYW5pcHVsYXRpb25UYXJnZXQoIGVsZW0sIGNvbnRlbnQgKSB7XG5cdHJldHVybiBqUXVlcnkubm9kZU5hbWUoIGVsZW0sIFwidGFibGVcIiApICYmXG5cdFx0alF1ZXJ5Lm5vZGVOYW1lKCBjb250ZW50Lm5vZGVUeXBlICE9PSAxMSA/IGNvbnRlbnQgOiBjb250ZW50LmZpcnN0Q2hpbGQsIFwidHJcIiApID9cblxuXHRcdGVsZW0uZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJ0Ym9keVwiKVswXSB8fFxuXHRcdFx0ZWxlbS5hcHBlbmRDaGlsZCggZWxlbS5vd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0Ym9keVwiKSApIDpcblx0XHRlbGVtO1xufVxuXG4vLyBSZXBsYWNlL3Jlc3RvcmUgdGhlIHR5cGUgYXR0cmlidXRlIG9mIHNjcmlwdCBlbGVtZW50cyBmb3Igc2FmZSBET00gbWFuaXB1bGF0aW9uXG5mdW5jdGlvbiBkaXNhYmxlU2NyaXB0KCBlbGVtICkge1xuXHRlbGVtLnR5cGUgPSAoZWxlbS5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpICE9PSBudWxsKSArIFwiL1wiICsgZWxlbS50eXBlO1xuXHRyZXR1cm4gZWxlbTtcbn1cbmZ1bmN0aW9uIHJlc3RvcmVTY3JpcHQoIGVsZW0gKSB7XG5cdHZhciBtYXRjaCA9IHJzY3JpcHRUeXBlTWFza2VkLmV4ZWMoIGVsZW0udHlwZSApO1xuXG5cdGlmICggbWF0Y2ggKSB7XG5cdFx0ZWxlbS50eXBlID0gbWF0Y2hbIDEgXTtcblx0fSBlbHNlIHtcblx0XHRlbGVtLnJlbW92ZUF0dHJpYnV0ZShcInR5cGVcIik7XG5cdH1cblxuXHRyZXR1cm4gZWxlbTtcbn1cblxuLy8gTWFyayBzY3JpcHRzIGFzIGhhdmluZyBhbHJlYWR5IGJlZW4gZXZhbHVhdGVkXG5mdW5jdGlvbiBzZXRHbG9iYWxFdmFsKCBlbGVtcywgcmVmRWxlbWVudHMgKSB7XG5cdHZhciBpID0gMCxcblx0XHRsID0gZWxlbXMubGVuZ3RoO1xuXG5cdGZvciAoIDsgaSA8IGw7IGkrKyApIHtcblx0XHRkYXRhX3ByaXYuc2V0KFxuXHRcdFx0ZWxlbXNbIGkgXSwgXCJnbG9iYWxFdmFsXCIsICFyZWZFbGVtZW50cyB8fCBkYXRhX3ByaXYuZ2V0KCByZWZFbGVtZW50c1sgaSBdLCBcImdsb2JhbEV2YWxcIiApXG5cdFx0KTtcblx0fVxufVxuXG5mdW5jdGlvbiBjbG9uZUNvcHlFdmVudCggc3JjLCBkZXN0ICkge1xuXHR2YXIgaSwgbCwgdHlwZSwgcGRhdGFPbGQsIHBkYXRhQ3VyLCB1ZGF0YU9sZCwgdWRhdGFDdXIsIGV2ZW50cztcblxuXHRpZiAoIGRlc3Qubm9kZVR5cGUgIT09IDEgKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Ly8gMS4gQ29weSBwcml2YXRlIGRhdGE6IGV2ZW50cywgaGFuZGxlcnMsIGV0Yy5cblx0aWYgKCBkYXRhX3ByaXYuaGFzRGF0YSggc3JjICkgKSB7XG5cdFx0cGRhdGFPbGQgPSBkYXRhX3ByaXYuYWNjZXNzKCBzcmMgKTtcblx0XHRwZGF0YUN1ciA9IGRhdGFfcHJpdi5zZXQoIGRlc3QsIHBkYXRhT2xkICk7XG5cdFx0ZXZlbnRzID0gcGRhdGFPbGQuZXZlbnRzO1xuXG5cdFx0aWYgKCBldmVudHMgKSB7XG5cdFx0XHRkZWxldGUgcGRhdGFDdXIuaGFuZGxlO1xuXHRcdFx0cGRhdGFDdXIuZXZlbnRzID0ge307XG5cblx0XHRcdGZvciAoIHR5cGUgaW4gZXZlbnRzICkge1xuXHRcdFx0XHRmb3IgKCBpID0gMCwgbCA9IGV2ZW50c1sgdHlwZSBdLmxlbmd0aDsgaSA8IGw7IGkrKyApIHtcblx0XHRcdFx0XHRqUXVlcnkuZXZlbnQuYWRkKCBkZXN0LCB0eXBlLCBldmVudHNbIHR5cGUgXVsgaSBdICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyAyLiBDb3B5IHVzZXIgZGF0YVxuXHRpZiAoIGRhdGFfdXNlci5oYXNEYXRhKCBzcmMgKSApIHtcblx0XHR1ZGF0YU9sZCA9IGRhdGFfdXNlci5hY2Nlc3MoIHNyYyApO1xuXHRcdHVkYXRhQ3VyID0galF1ZXJ5LmV4dGVuZCgge30sIHVkYXRhT2xkICk7XG5cblx0XHRkYXRhX3VzZXIuc2V0KCBkZXN0LCB1ZGF0YUN1ciApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEFsbCggY29udGV4dCwgdGFnICkge1xuXHR2YXIgcmV0ID0gY29udGV4dC5nZXRFbGVtZW50c0J5VGFnTmFtZSA/IGNvbnRleHQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoIHRhZyB8fCBcIipcIiApIDpcblx0XHRcdGNvbnRleHQucXVlcnlTZWxlY3RvckFsbCA/IGNvbnRleHQucXVlcnlTZWxlY3RvckFsbCggdGFnIHx8IFwiKlwiICkgOlxuXHRcdFx0W107XG5cblx0cmV0dXJuIHRhZyA9PT0gdW5kZWZpbmVkIHx8IHRhZyAmJiBqUXVlcnkubm9kZU5hbWUoIGNvbnRleHQsIHRhZyApID9cblx0XHRqUXVlcnkubWVyZ2UoIFsgY29udGV4dCBdLCByZXQgKSA6XG5cdFx0cmV0O1xufVxuXG4vLyBTdXBwb3J0OiBJRSA+PSA5XG5mdW5jdGlvbiBmaXhJbnB1dCggc3JjLCBkZXN0ICkge1xuXHR2YXIgbm9kZU5hbWUgPSBkZXN0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG5cblx0Ly8gRmFpbHMgdG8gcGVyc2lzdCB0aGUgY2hlY2tlZCBzdGF0ZSBvZiBhIGNsb25lZCBjaGVja2JveCBvciByYWRpbyBidXR0b24uXG5cdGlmICggbm9kZU5hbWUgPT09IFwiaW5wdXRcIiAmJiByY2hlY2thYmxlVHlwZS50ZXN0KCBzcmMudHlwZSApICkge1xuXHRcdGRlc3QuY2hlY2tlZCA9IHNyYy5jaGVja2VkO1xuXG5cdC8vIEZhaWxzIHRvIHJldHVybiB0aGUgc2VsZWN0ZWQgb3B0aW9uIHRvIHRoZSBkZWZhdWx0IHNlbGVjdGVkIHN0YXRlIHdoZW4gY2xvbmluZyBvcHRpb25zXG5cdH0gZWxzZSBpZiAoIG5vZGVOYW1lID09PSBcImlucHV0XCIgfHwgbm9kZU5hbWUgPT09IFwidGV4dGFyZWFcIiApIHtcblx0XHRkZXN0LmRlZmF1bHRWYWx1ZSA9IHNyYy5kZWZhdWx0VmFsdWU7XG5cdH1cbn1cblxualF1ZXJ5LmV4dGVuZCh7XG5cdGNsb25lOiBmdW5jdGlvbiggZWxlbSwgZGF0YUFuZEV2ZW50cywgZGVlcERhdGFBbmRFdmVudHMgKSB7XG5cdFx0dmFyIGksIGwsIHNyY0VsZW1lbnRzLCBkZXN0RWxlbWVudHMsXG5cdFx0XHRjbG9uZSA9IGVsZW0uY2xvbmVOb2RlKCB0cnVlICksXG5cdFx0XHRpblBhZ2UgPSBqUXVlcnkuY29udGFpbnMoIGVsZW0ub3duZXJEb2N1bWVudCwgZWxlbSApO1xuXG5cdFx0Ly8gU3VwcG9ydDogSUUgPj0gOVxuXHRcdC8vIEZpeCBDbG9uaW5nIGlzc3Vlc1xuXHRcdGlmICggIXN1cHBvcnQubm9DbG9uZUNoZWNrZWQgJiYgKCBlbGVtLm5vZGVUeXBlID09PSAxIHx8IGVsZW0ubm9kZVR5cGUgPT09IDExICkgJiZcblx0XHRcdFx0IWpRdWVyeS5pc1hNTERvYyggZWxlbSApICkge1xuXG5cdFx0XHQvLyBXZSBlc2NoZXcgU2l6emxlIGhlcmUgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnM6IGh0dHA6Ly9qc3BlcmYuY29tL2dldGFsbC12cy1zaXp6bGUvMlxuXHRcdFx0ZGVzdEVsZW1lbnRzID0gZ2V0QWxsKCBjbG9uZSApO1xuXHRcdFx0c3JjRWxlbWVudHMgPSBnZXRBbGwoIGVsZW0gKTtcblxuXHRcdFx0Zm9yICggaSA9IDAsIGwgPSBzcmNFbGVtZW50cy5sZW5ndGg7IGkgPCBsOyBpKysgKSB7XG5cdFx0XHRcdGZpeElucHV0KCBzcmNFbGVtZW50c1sgaSBdLCBkZXN0RWxlbWVudHNbIGkgXSApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIENvcHkgdGhlIGV2ZW50cyBmcm9tIHRoZSBvcmlnaW5hbCB0byB0aGUgY2xvbmVcblx0XHRpZiAoIGRhdGFBbmRFdmVudHMgKSB7XG5cdFx0XHRpZiAoIGRlZXBEYXRhQW5kRXZlbnRzICkge1xuXHRcdFx0XHRzcmNFbGVtZW50cyA9IHNyY0VsZW1lbnRzIHx8IGdldEFsbCggZWxlbSApO1xuXHRcdFx0XHRkZXN0RWxlbWVudHMgPSBkZXN0RWxlbWVudHMgfHwgZ2V0QWxsKCBjbG9uZSApO1xuXG5cdFx0XHRcdGZvciAoIGkgPSAwLCBsID0gc3JjRWxlbWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrICkge1xuXHRcdFx0XHRcdGNsb25lQ29weUV2ZW50KCBzcmNFbGVtZW50c1sgaSBdLCBkZXN0RWxlbWVudHNbIGkgXSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjbG9uZUNvcHlFdmVudCggZWxlbSwgY2xvbmUgKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBQcmVzZXJ2ZSBzY3JpcHQgZXZhbHVhdGlvbiBoaXN0b3J5XG5cdFx0ZGVzdEVsZW1lbnRzID0gZ2V0QWxsKCBjbG9uZSwgXCJzY3JpcHRcIiApO1xuXHRcdGlmICggZGVzdEVsZW1lbnRzLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHRzZXRHbG9iYWxFdmFsKCBkZXN0RWxlbWVudHMsICFpblBhZ2UgJiYgZ2V0QWxsKCBlbGVtLCBcInNjcmlwdFwiICkgKTtcblx0XHR9XG5cblx0XHQvLyBSZXR1cm4gdGhlIGNsb25lZCBzZXRcblx0XHRyZXR1cm4gY2xvbmU7XG5cdH0sXG5cblx0YnVpbGRGcmFnbWVudDogZnVuY3Rpb24oIGVsZW1zLCBjb250ZXh0LCBzY3JpcHRzLCBzZWxlY3Rpb24gKSB7XG5cdFx0dmFyIGVsZW0sIHRtcCwgdGFnLCB3cmFwLCBjb250YWlucywgaixcblx0XHRcdGZyYWdtZW50ID0gY29udGV4dC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksXG5cdFx0XHRub2RlcyA9IFtdLFxuXHRcdFx0aSA9IDAsXG5cdFx0XHRsID0gZWxlbXMubGVuZ3RoO1xuXG5cdFx0Zm9yICggOyBpIDwgbDsgaSsrICkge1xuXHRcdFx0ZWxlbSA9IGVsZW1zWyBpIF07XG5cblx0XHRcdGlmICggZWxlbSB8fCBlbGVtID09PSAwICkge1xuXG5cdFx0XHRcdC8vIEFkZCBub2RlcyBkaXJlY3RseVxuXHRcdFx0XHRpZiAoIGpRdWVyeS50eXBlKCBlbGVtICkgPT09IFwib2JqZWN0XCIgKSB7XG5cdFx0XHRcdFx0Ly8gU3VwcG9ydDogUXRXZWJLaXRcblx0XHRcdFx0XHQvLyBqUXVlcnkubWVyZ2UgYmVjYXVzZSBwdXNoLmFwcGx5KF8sIGFycmF5bGlrZSkgdGhyb3dzXG5cdFx0XHRcdFx0alF1ZXJ5Lm1lcmdlKCBub2RlcywgZWxlbS5ub2RlVHlwZSA/IFsgZWxlbSBdIDogZWxlbSApO1xuXG5cdFx0XHRcdC8vIENvbnZlcnQgbm9uLWh0bWwgaW50byBhIHRleHQgbm9kZVxuXHRcdFx0XHR9IGVsc2UgaWYgKCAhcmh0bWwudGVzdCggZWxlbSApICkge1xuXHRcdFx0XHRcdG5vZGVzLnB1c2goIGNvbnRleHQuY3JlYXRlVGV4dE5vZGUoIGVsZW0gKSApO1xuXG5cdFx0XHRcdC8vIENvbnZlcnQgaHRtbCBpbnRvIERPTSBub2Rlc1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRtcCA9IHRtcCB8fCBmcmFnbWVudC5hcHBlbmRDaGlsZCggY29udGV4dC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpICk7XG5cblx0XHRcdFx0XHQvLyBEZXNlcmlhbGl6ZSBhIHN0YW5kYXJkIHJlcHJlc2VudGF0aW9uXG5cdFx0XHRcdFx0dGFnID0gKCBydGFnTmFtZS5leGVjKCBlbGVtICkgfHwgWyBcIlwiLCBcIlwiIF0gKVsgMSBdLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdFx0d3JhcCA9IHdyYXBNYXBbIHRhZyBdIHx8IHdyYXBNYXAuX2RlZmF1bHQ7XG5cdFx0XHRcdFx0dG1wLmlubmVySFRNTCA9IHdyYXBbIDEgXSArIGVsZW0ucmVwbGFjZSggcnhodG1sVGFnLCBcIjwkMT48LyQyPlwiICkgKyB3cmFwWyAyIF07XG5cblx0XHRcdFx0XHQvLyBEZXNjZW5kIHRocm91Z2ggd3JhcHBlcnMgdG8gdGhlIHJpZ2h0IGNvbnRlbnRcblx0XHRcdFx0XHRqID0gd3JhcFsgMCBdO1xuXHRcdFx0XHRcdHdoaWxlICggai0tICkge1xuXHRcdFx0XHRcdFx0dG1wID0gdG1wLmxhc3RDaGlsZDtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBTdXBwb3J0OiBRdFdlYktpdFxuXHRcdFx0XHRcdC8vIGpRdWVyeS5tZXJnZSBiZWNhdXNlIHB1c2guYXBwbHkoXywgYXJyYXlsaWtlKSB0aHJvd3Ncblx0XHRcdFx0XHRqUXVlcnkubWVyZ2UoIG5vZGVzLCB0bXAuY2hpbGROb2RlcyApO1xuXG5cdFx0XHRcdFx0Ly8gUmVtZW1iZXIgdGhlIHRvcC1sZXZlbCBjb250YWluZXJcblx0XHRcdFx0XHR0bXAgPSBmcmFnbWVudC5maXJzdENoaWxkO1xuXG5cdFx0XHRcdFx0Ly8gRml4ZXMgIzEyMzQ2XG5cdFx0XHRcdFx0Ly8gU3VwcG9ydDogV2Via2l0LCBJRVxuXHRcdFx0XHRcdHRtcC50ZXh0Q29udGVudCA9IFwiXCI7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBSZW1vdmUgd3JhcHBlciBmcm9tIGZyYWdtZW50XG5cdFx0ZnJhZ21lbnQudGV4dENvbnRlbnQgPSBcIlwiO1xuXG5cdFx0aSA9IDA7XG5cdFx0d2hpbGUgKCAoZWxlbSA9IG5vZGVzWyBpKysgXSkgKSB7XG5cblx0XHRcdC8vICM0MDg3IC0gSWYgb3JpZ2luIGFuZCBkZXN0aW5hdGlvbiBlbGVtZW50cyBhcmUgdGhlIHNhbWUsIGFuZCB0aGlzIGlzXG5cdFx0XHQvLyB0aGF0IGVsZW1lbnQsIGRvIG5vdCBkbyBhbnl0aGluZ1xuXHRcdFx0aWYgKCBzZWxlY3Rpb24gJiYgalF1ZXJ5LmluQXJyYXkoIGVsZW0sIHNlbGVjdGlvbiApICE9PSAtMSApIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnRhaW5zID0galF1ZXJ5LmNvbnRhaW5zKCBlbGVtLm93bmVyRG9jdW1lbnQsIGVsZW0gKTtcblxuXHRcdFx0Ly8gQXBwZW5kIHRvIGZyYWdtZW50XG5cdFx0XHR0bXAgPSBnZXRBbGwoIGZyYWdtZW50LmFwcGVuZENoaWxkKCBlbGVtICksIFwic2NyaXB0XCIgKTtcblxuXHRcdFx0Ly8gUHJlc2VydmUgc2NyaXB0IGV2YWx1YXRpb24gaGlzdG9yeVxuXHRcdFx0aWYgKCBjb250YWlucyApIHtcblx0XHRcdFx0c2V0R2xvYmFsRXZhbCggdG1wICk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIENhcHR1cmUgZXhlY3V0YWJsZXNcblx0XHRcdGlmICggc2NyaXB0cyApIHtcblx0XHRcdFx0aiA9IDA7XG5cdFx0XHRcdHdoaWxlICggKGVsZW0gPSB0bXBbIGorKyBdKSApIHtcblx0XHRcdFx0XHRpZiAoIHJzY3JpcHRUeXBlLnRlc3QoIGVsZW0udHlwZSB8fCBcIlwiICkgKSB7XG5cdFx0XHRcdFx0XHRzY3JpcHRzLnB1c2goIGVsZW0gKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZnJhZ21lbnQ7XG5cdH0sXG5cblx0Y2xlYW5EYXRhOiBmdW5jdGlvbiggZWxlbXMgKSB7XG5cdFx0dmFyIGRhdGEsIGVsZW0sIGV2ZW50cywgdHlwZSwga2V5LCBqLFxuXHRcdFx0c3BlY2lhbCA9IGpRdWVyeS5ldmVudC5zcGVjaWFsLFxuXHRcdFx0aSA9IDA7XG5cblx0XHRmb3IgKCA7IChlbGVtID0gZWxlbXNbIGkgXSkgIT09IHVuZGVmaW5lZDsgaSsrICkge1xuXHRcdFx0aWYgKCBqUXVlcnkuYWNjZXB0RGF0YSggZWxlbSApICkge1xuXHRcdFx0XHRrZXkgPSBlbGVtWyBkYXRhX3ByaXYuZXhwYW5kbyBdO1xuXG5cdFx0XHRcdGlmICgga2V5ICYmIChkYXRhID0gZGF0YV9wcml2LmNhY2hlWyBrZXkgXSkgKSB7XG5cdFx0XHRcdFx0ZXZlbnRzID0gT2JqZWN0LmtleXMoIGRhdGEuZXZlbnRzIHx8IHt9ICk7XG5cdFx0XHRcdFx0aWYgKCBldmVudHMubGVuZ3RoICkge1xuXHRcdFx0XHRcdFx0Zm9yICggaiA9IDA7ICh0eXBlID0gZXZlbnRzW2pdKSAhPT0gdW5kZWZpbmVkOyBqKysgKSB7XG5cdFx0XHRcdFx0XHRcdGlmICggc3BlY2lhbFsgdHlwZSBdICkge1xuXHRcdFx0XHRcdFx0XHRcdGpRdWVyeS5ldmVudC5yZW1vdmUoIGVsZW0sIHR5cGUgKTtcblxuXHRcdFx0XHRcdFx0XHQvLyBUaGlzIGlzIGEgc2hvcnRjdXQgdG8gYXZvaWQgalF1ZXJ5LmV2ZW50LnJlbW92ZSdzIG92ZXJoZWFkXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0alF1ZXJ5LnJlbW92ZUV2ZW50KCBlbGVtLCB0eXBlLCBkYXRhLmhhbmRsZSApO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICggZGF0YV9wcml2LmNhY2hlWyBrZXkgXSApIHtcblx0XHRcdFx0XHRcdC8vIERpc2NhcmQgYW55IHJlbWFpbmluZyBgcHJpdmF0ZWAgZGF0YVxuXHRcdFx0XHRcdFx0ZGVsZXRlIGRhdGFfcHJpdi5jYWNoZVsga2V5IF07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvLyBEaXNjYXJkIGFueSByZW1haW5pbmcgYHVzZXJgIGRhdGFcblx0XHRcdGRlbGV0ZSBkYXRhX3VzZXIuY2FjaGVbIGVsZW1bIGRhdGFfdXNlci5leHBhbmRvIF0gXTtcblx0XHR9XG5cdH1cbn0pO1xuXG5qUXVlcnkuZm4uZXh0ZW5kKHtcblx0dGV4dDogZnVuY3Rpb24oIHZhbHVlICkge1xuXHRcdHJldHVybiBhY2Nlc3MoIHRoaXMsIGZ1bmN0aW9uKCB2YWx1ZSApIHtcblx0XHRcdHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkID9cblx0XHRcdFx0alF1ZXJ5LnRleHQoIHRoaXMgKSA6XG5cdFx0XHRcdHRoaXMuZW1wdHkoKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmICggdGhpcy5ub2RlVHlwZSA9PT0gMSB8fCB0aGlzLm5vZGVUeXBlID09PSAxMSB8fCB0aGlzLm5vZGVUeXBlID09PSA5ICkge1xuXHRcdFx0XHRcdFx0dGhpcy50ZXh0Q29udGVudCA9IHZhbHVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0fSwgbnVsbCwgdmFsdWUsIGFyZ3VtZW50cy5sZW5ndGggKTtcblx0fSxcblxuXHRhcHBlbmQ6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLmRvbU1hbmlwKCBhcmd1bWVudHMsIGZ1bmN0aW9uKCBlbGVtICkge1xuXHRcdFx0aWYgKCB0aGlzLm5vZGVUeXBlID09PSAxIHx8IHRoaXMubm9kZVR5cGUgPT09IDExIHx8IHRoaXMubm9kZVR5cGUgPT09IDkgKSB7XG5cdFx0XHRcdHZhciB0YXJnZXQgPSBtYW5pcHVsYXRpb25UYXJnZXQoIHRoaXMsIGVsZW0gKTtcblx0XHRcdFx0dGFyZ2V0LmFwcGVuZENoaWxkKCBlbGVtICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0cHJlcGVuZDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuZG9tTWFuaXAoIGFyZ3VtZW50cywgZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0XHRpZiAoIHRoaXMubm9kZVR5cGUgPT09IDEgfHwgdGhpcy5ub2RlVHlwZSA9PT0gMTEgfHwgdGhpcy5ub2RlVHlwZSA9PT0gOSApIHtcblx0XHRcdFx0dmFyIHRhcmdldCA9IG1hbmlwdWxhdGlvblRhcmdldCggdGhpcywgZWxlbSApO1xuXHRcdFx0XHR0YXJnZXQuaW5zZXJ0QmVmb3JlKCBlbGVtLCB0YXJnZXQuZmlyc3RDaGlsZCApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXG5cdGJlZm9yZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuZG9tTWFuaXAoIGFyZ3VtZW50cywgZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0XHRpZiAoIHRoaXMucGFyZW50Tm9kZSApIHtcblx0XHRcdFx0dGhpcy5wYXJlbnROb2RlLmluc2VydEJlZm9yZSggZWxlbSwgdGhpcyApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXG5cdGFmdGVyOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5kb21NYW5pcCggYXJndW1lbnRzLCBmdW5jdGlvbiggZWxlbSApIHtcblx0XHRcdGlmICggdGhpcy5wYXJlbnROb2RlICkge1xuXHRcdFx0XHR0aGlzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKCBlbGVtLCB0aGlzLm5leHRTaWJsaW5nICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0cmVtb3ZlOiBmdW5jdGlvbiggc2VsZWN0b3IsIGtlZXBEYXRhIC8qIEludGVybmFsIFVzZSBPbmx5ICovICkge1xuXHRcdHZhciBlbGVtLFxuXHRcdFx0ZWxlbXMgPSBzZWxlY3RvciA/IGpRdWVyeS5maWx0ZXIoIHNlbGVjdG9yLCB0aGlzICkgOiB0aGlzLFxuXHRcdFx0aSA9IDA7XG5cblx0XHRmb3IgKCA7IChlbGVtID0gZWxlbXNbaV0pICE9IG51bGw7IGkrKyApIHtcblx0XHRcdGlmICggIWtlZXBEYXRhICYmIGVsZW0ubm9kZVR5cGUgPT09IDEgKSB7XG5cdFx0XHRcdGpRdWVyeS5jbGVhbkRhdGEoIGdldEFsbCggZWxlbSApICk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggZWxlbS5wYXJlbnROb2RlICkge1xuXHRcdFx0XHRpZiAoIGtlZXBEYXRhICYmIGpRdWVyeS5jb250YWlucyggZWxlbS5vd25lckRvY3VtZW50LCBlbGVtICkgKSB7XG5cdFx0XHRcdFx0c2V0R2xvYmFsRXZhbCggZ2V0QWxsKCBlbGVtLCBcInNjcmlwdFwiICkgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbGVtLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoIGVsZW0gKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRlbXB0eTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGVsZW0sXG5cdFx0XHRpID0gMDtcblxuXHRcdGZvciAoIDsgKGVsZW0gPSB0aGlzW2ldKSAhPSBudWxsOyBpKysgKSB7XG5cdFx0XHRpZiAoIGVsZW0ubm9kZVR5cGUgPT09IDEgKSB7XG5cblx0XHRcdFx0Ly8gUHJldmVudCBtZW1vcnkgbGVha3Ncblx0XHRcdFx0alF1ZXJ5LmNsZWFuRGF0YSggZ2V0QWxsKCBlbGVtLCBmYWxzZSApICk7XG5cblx0XHRcdFx0Ly8gUmVtb3ZlIGFueSByZW1haW5pbmcgbm9kZXNcblx0XHRcdFx0ZWxlbS50ZXh0Q29udGVudCA9IFwiXCI7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0Y2xvbmU6IGZ1bmN0aW9uKCBkYXRhQW5kRXZlbnRzLCBkZWVwRGF0YUFuZEV2ZW50cyApIHtcblx0XHRkYXRhQW5kRXZlbnRzID0gZGF0YUFuZEV2ZW50cyA9PSBudWxsID8gZmFsc2UgOiBkYXRhQW5kRXZlbnRzO1xuXHRcdGRlZXBEYXRhQW5kRXZlbnRzID0gZGVlcERhdGFBbmRFdmVudHMgPT0gbnVsbCA/IGRhdGFBbmRFdmVudHMgOiBkZWVwRGF0YUFuZEV2ZW50cztcblxuXHRcdHJldHVybiB0aGlzLm1hcChmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBqUXVlcnkuY2xvbmUoIHRoaXMsIGRhdGFBbmRFdmVudHMsIGRlZXBEYXRhQW5kRXZlbnRzICk7XG5cdFx0fSk7XG5cdH0sXG5cblx0aHRtbDogZnVuY3Rpb24oIHZhbHVlICkge1xuXHRcdHJldHVybiBhY2Nlc3MoIHRoaXMsIGZ1bmN0aW9uKCB2YWx1ZSApIHtcblx0XHRcdHZhciBlbGVtID0gdGhpc1sgMCBdIHx8IHt9LFxuXHRcdFx0XHRpID0gMCxcblx0XHRcdFx0bCA9IHRoaXMubGVuZ3RoO1xuXG5cdFx0XHRpZiAoIHZhbHVlID09PSB1bmRlZmluZWQgJiYgZWxlbS5ub2RlVHlwZSA9PT0gMSApIHtcblx0XHRcdFx0cmV0dXJuIGVsZW0uaW5uZXJIVE1MO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBTZWUgaWYgd2UgY2FuIHRha2UgYSBzaG9ydGN1dCBhbmQganVzdCB1c2UgaW5uZXJIVE1MXG5cdFx0XHRpZiAoIHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiAmJiAhcm5vSW5uZXJodG1sLnRlc3QoIHZhbHVlICkgJiZcblx0XHRcdFx0IXdyYXBNYXBbICggcnRhZ05hbWUuZXhlYyggdmFsdWUgKSB8fCBbIFwiXCIsIFwiXCIgXSApWyAxIF0udG9Mb3dlckNhc2UoKSBdICkge1xuXG5cdFx0XHRcdHZhbHVlID0gdmFsdWUucmVwbGFjZSggcnhodG1sVGFnLCBcIjwkMT48LyQyPlwiICk7XG5cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRmb3IgKCA7IGkgPCBsOyBpKysgKSB7XG5cdFx0XHRcdFx0XHRlbGVtID0gdGhpc1sgaSBdIHx8IHt9O1xuXG5cdFx0XHRcdFx0XHQvLyBSZW1vdmUgZWxlbWVudCBub2RlcyBhbmQgcHJldmVudCBtZW1vcnkgbGVha3Ncblx0XHRcdFx0XHRcdGlmICggZWxlbS5ub2RlVHlwZSA9PT0gMSApIHtcblx0XHRcdFx0XHRcdFx0alF1ZXJ5LmNsZWFuRGF0YSggZ2V0QWxsKCBlbGVtLCBmYWxzZSApICk7XG5cdFx0XHRcdFx0XHRcdGVsZW0uaW5uZXJIVE1MID0gdmFsdWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0ZWxlbSA9IDA7XG5cblx0XHRcdFx0Ly8gSWYgdXNpbmcgaW5uZXJIVE1MIHRocm93cyBhbiBleGNlcHRpb24sIHVzZSB0aGUgZmFsbGJhY2sgbWV0aG9kXG5cdFx0XHRcdH0gY2F0Y2goIGUgKSB7fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIGVsZW0gKSB7XG5cdFx0XHRcdHRoaXMuZW1wdHkoKS5hcHBlbmQoIHZhbHVlICk7XG5cdFx0XHR9XG5cdFx0fSwgbnVsbCwgdmFsdWUsIGFyZ3VtZW50cy5sZW5ndGggKTtcblx0fSxcblxuXHRyZXBsYWNlV2l0aDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGFyZyA9IGFyZ3VtZW50c1sgMCBdO1xuXG5cdFx0Ly8gTWFrZSB0aGUgY2hhbmdlcywgcmVwbGFjaW5nIGVhY2ggY29udGV4dCBlbGVtZW50IHdpdGggdGhlIG5ldyBjb250ZW50XG5cdFx0dGhpcy5kb21NYW5pcCggYXJndW1lbnRzLCBmdW5jdGlvbiggZWxlbSApIHtcblx0XHRcdGFyZyA9IHRoaXMucGFyZW50Tm9kZTtcblxuXHRcdFx0alF1ZXJ5LmNsZWFuRGF0YSggZ2V0QWxsKCB0aGlzICkgKTtcblxuXHRcdFx0aWYgKCBhcmcgKSB7XG5cdFx0XHRcdGFyZy5yZXBsYWNlQ2hpbGQoIGVsZW0sIHRoaXMgKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIEZvcmNlIHJlbW92YWwgaWYgdGhlcmUgd2FzIG5vIG5ldyBjb250ZW50IChlLmcuLCBmcm9tIGVtcHR5IGFyZ3VtZW50cylcblx0XHRyZXR1cm4gYXJnICYmIChhcmcubGVuZ3RoIHx8IGFyZy5ub2RlVHlwZSkgPyB0aGlzIDogdGhpcy5yZW1vdmUoKTtcblx0fSxcblxuXHRkZXRhY2g6IGZ1bmN0aW9uKCBzZWxlY3RvciApIHtcblx0XHRyZXR1cm4gdGhpcy5yZW1vdmUoIHNlbGVjdG9yLCB0cnVlICk7XG5cdH0sXG5cblx0ZG9tTWFuaXA6IGZ1bmN0aW9uKCBhcmdzLCBjYWxsYmFjayApIHtcblxuXHRcdC8vIEZsYXR0ZW4gYW55IG5lc3RlZCBhcnJheXNcblx0XHRhcmdzID0gY29uY2F0LmFwcGx5KCBbXSwgYXJncyApO1xuXG5cdFx0dmFyIGZyYWdtZW50LCBmaXJzdCwgc2NyaXB0cywgaGFzU2NyaXB0cywgbm9kZSwgZG9jLFxuXHRcdFx0aSA9IDAsXG5cdFx0XHRsID0gdGhpcy5sZW5ndGgsXG5cdFx0XHRzZXQgPSB0aGlzLFxuXHRcdFx0aU5vQ2xvbmUgPSBsIC0gMSxcblx0XHRcdHZhbHVlID0gYXJnc1sgMCBdLFxuXHRcdFx0aXNGdW5jdGlvbiA9IGpRdWVyeS5pc0Z1bmN0aW9uKCB2YWx1ZSApO1xuXG5cdFx0Ly8gV2UgY2FuJ3QgY2xvbmVOb2RlIGZyYWdtZW50cyB0aGF0IGNvbnRhaW4gY2hlY2tlZCwgaW4gV2ViS2l0XG5cdFx0aWYgKCBpc0Z1bmN0aW9uIHx8XG5cdFx0XHRcdCggbCA+IDEgJiYgdHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiICYmXG5cdFx0XHRcdFx0IXN1cHBvcnQuY2hlY2tDbG9uZSAmJiByY2hlY2tlZC50ZXN0KCB2YWx1ZSApICkgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCBpbmRleCApIHtcblx0XHRcdFx0dmFyIHNlbGYgPSBzZXQuZXEoIGluZGV4ICk7XG5cdFx0XHRcdGlmICggaXNGdW5jdGlvbiApIHtcblx0XHRcdFx0XHRhcmdzWyAwIF0gPSB2YWx1ZS5jYWxsKCB0aGlzLCBpbmRleCwgc2VsZi5odG1sKCkgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRzZWxmLmRvbU1hbmlwKCBhcmdzLCBjYWxsYmFjayApO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKCBsICkge1xuXHRcdFx0ZnJhZ21lbnQgPSBqUXVlcnkuYnVpbGRGcmFnbWVudCggYXJncywgdGhpc1sgMCBdLm93bmVyRG9jdW1lbnQsIGZhbHNlLCB0aGlzICk7XG5cdFx0XHRmaXJzdCA9IGZyYWdtZW50LmZpcnN0Q2hpbGQ7XG5cblx0XHRcdGlmICggZnJhZ21lbnQuY2hpbGROb2Rlcy5sZW5ndGggPT09IDEgKSB7XG5cdFx0XHRcdGZyYWdtZW50ID0gZmlyc3Q7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggZmlyc3QgKSB7XG5cdFx0XHRcdHNjcmlwdHMgPSBqUXVlcnkubWFwKCBnZXRBbGwoIGZyYWdtZW50LCBcInNjcmlwdFwiICksIGRpc2FibGVTY3JpcHQgKTtcblx0XHRcdFx0aGFzU2NyaXB0cyA9IHNjcmlwdHMubGVuZ3RoO1xuXG5cdFx0XHRcdC8vIFVzZSB0aGUgb3JpZ2luYWwgZnJhZ21lbnQgZm9yIHRoZSBsYXN0IGl0ZW0gaW5zdGVhZCBvZiB0aGUgZmlyc3QgYmVjYXVzZSBpdCBjYW4gZW5kIHVwXG5cdFx0XHRcdC8vIGJlaW5nIGVtcHRpZWQgaW5jb3JyZWN0bHkgaW4gY2VydGFpbiBzaXR1YXRpb25zICgjODA3MCkuXG5cdFx0XHRcdGZvciAoIDsgaSA8IGw7IGkrKyApIHtcblx0XHRcdFx0XHRub2RlID0gZnJhZ21lbnQ7XG5cblx0XHRcdFx0XHRpZiAoIGkgIT09IGlOb0Nsb25lICkge1xuXHRcdFx0XHRcdFx0bm9kZSA9IGpRdWVyeS5jbG9uZSggbm9kZSwgdHJ1ZSwgdHJ1ZSApO1xuXG5cdFx0XHRcdFx0XHQvLyBLZWVwIHJlZmVyZW5jZXMgdG8gY2xvbmVkIHNjcmlwdHMgZm9yIGxhdGVyIHJlc3RvcmF0aW9uXG5cdFx0XHRcdFx0XHRpZiAoIGhhc1NjcmlwdHMgKSB7XG5cdFx0XHRcdFx0XHRcdC8vIFN1cHBvcnQ6IFF0V2ViS2l0XG5cdFx0XHRcdFx0XHRcdC8vIGpRdWVyeS5tZXJnZSBiZWNhdXNlIHB1c2guYXBwbHkoXywgYXJyYXlsaWtlKSB0aHJvd3Ncblx0XHRcdFx0XHRcdFx0alF1ZXJ5Lm1lcmdlKCBzY3JpcHRzLCBnZXRBbGwoIG5vZGUsIFwic2NyaXB0XCIgKSApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNhbGxiYWNrLmNhbGwoIHRoaXNbIGkgXSwgbm9kZSwgaSApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCBoYXNTY3JpcHRzICkge1xuXHRcdFx0XHRcdGRvYyA9IHNjcmlwdHNbIHNjcmlwdHMubGVuZ3RoIC0gMSBdLm93bmVyRG9jdW1lbnQ7XG5cblx0XHRcdFx0XHQvLyBSZWVuYWJsZSBzY3JpcHRzXG5cdFx0XHRcdFx0alF1ZXJ5Lm1hcCggc2NyaXB0cywgcmVzdG9yZVNjcmlwdCApO1xuXG5cdFx0XHRcdFx0Ly8gRXZhbHVhdGUgZXhlY3V0YWJsZSBzY3JpcHRzIG9uIGZpcnN0IGRvY3VtZW50IGluc2VydGlvblxuXHRcdFx0XHRcdGZvciAoIGkgPSAwOyBpIDwgaGFzU2NyaXB0czsgaSsrICkge1xuXHRcdFx0XHRcdFx0bm9kZSA9IHNjcmlwdHNbIGkgXTtcblx0XHRcdFx0XHRcdGlmICggcnNjcmlwdFR5cGUudGVzdCggbm9kZS50eXBlIHx8IFwiXCIgKSAmJlxuXHRcdFx0XHRcdFx0XHQhZGF0YV9wcml2LmFjY2Vzcyggbm9kZSwgXCJnbG9iYWxFdmFsXCIgKSAmJiBqUXVlcnkuY29udGFpbnMoIGRvYywgbm9kZSApICkge1xuXG5cdFx0XHRcdFx0XHRcdGlmICggbm9kZS5zcmMgKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gT3B0aW9uYWwgQUpBWCBkZXBlbmRlbmN5LCBidXQgd29uJ3QgcnVuIHNjcmlwdHMgaWYgbm90IHByZXNlbnRcblx0XHRcdFx0XHRcdFx0XHRpZiAoIGpRdWVyeS5fZXZhbFVybCApIHtcblx0XHRcdFx0XHRcdFx0XHRcdGpRdWVyeS5fZXZhbFVybCggbm9kZS5zcmMgKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0alF1ZXJ5Lmdsb2JhbEV2YWwoIG5vZGUudGV4dENvbnRlbnQucmVwbGFjZSggcmNsZWFuU2NyaXB0LCBcIlwiICkgKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59KTtcblxualF1ZXJ5LmVhY2goe1xuXHRhcHBlbmRUbzogXCJhcHBlbmRcIixcblx0cHJlcGVuZFRvOiBcInByZXBlbmRcIixcblx0aW5zZXJ0QmVmb3JlOiBcImJlZm9yZVwiLFxuXHRpbnNlcnRBZnRlcjogXCJhZnRlclwiLFxuXHRyZXBsYWNlQWxsOiBcInJlcGxhY2VXaXRoXCJcbn0sIGZ1bmN0aW9uKCBuYW1lLCBvcmlnaW5hbCApIHtcblx0alF1ZXJ5LmZuWyBuYW1lIF0gPSBmdW5jdGlvbiggc2VsZWN0b3IgKSB7XG5cdFx0dmFyIGVsZW1zLFxuXHRcdFx0cmV0ID0gW10sXG5cdFx0XHRpbnNlcnQgPSBqUXVlcnkoIHNlbGVjdG9yICksXG5cdFx0XHRsYXN0ID0gaW5zZXJ0Lmxlbmd0aCAtIDEsXG5cdFx0XHRpID0gMDtcblxuXHRcdGZvciAoIDsgaSA8PSBsYXN0OyBpKysgKSB7XG5cdFx0XHRlbGVtcyA9IGkgPT09IGxhc3QgPyB0aGlzIDogdGhpcy5jbG9uZSggdHJ1ZSApO1xuXHRcdFx0alF1ZXJ5KCBpbnNlcnRbIGkgXSApWyBvcmlnaW5hbCBdKCBlbGVtcyApO1xuXG5cdFx0XHQvLyBTdXBwb3J0OiBRdFdlYktpdFxuXHRcdFx0Ly8gLmdldCgpIGJlY2F1c2UgcHVzaC5hcHBseShfLCBhcnJheWxpa2UpIHRocm93c1xuXHRcdFx0cHVzaC5hcHBseSggcmV0LCBlbGVtcy5nZXQoKSApO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLnB1c2hTdGFjayggcmV0ICk7XG5cdH07XG59KTtcblxuXG52YXIgaWZyYW1lLFxuXHRlbGVtZGlzcGxheSA9IHt9O1xuXG4vKipcbiAqIFJldHJpZXZlIHRoZSBhY3R1YWwgZGlzcGxheSBvZiBhIGVsZW1lbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIG5vZGVOYW1lIG9mIHRoZSBlbGVtZW50XG4gKiBAcGFyYW0ge09iamVjdH0gZG9jIERvY3VtZW50IG9iamVjdFxuICovXG4vLyBDYWxsZWQgb25seSBmcm9tIHdpdGhpbiBkZWZhdWx0RGlzcGxheVxuZnVuY3Rpb24gYWN0dWFsRGlzcGxheSggbmFtZSwgZG9jICkge1xuXHR2YXIgZWxlbSA9IGpRdWVyeSggZG9jLmNyZWF0ZUVsZW1lbnQoIG5hbWUgKSApLmFwcGVuZFRvKCBkb2MuYm9keSApLFxuXG5cdFx0Ly8gZ2V0RGVmYXVsdENvbXB1dGVkU3R5bGUgbWlnaHQgYmUgcmVsaWFibHkgdXNlZCBvbmx5IG9uIGF0dGFjaGVkIGVsZW1lbnRcblx0XHRkaXNwbGF5ID0gd2luZG93LmdldERlZmF1bHRDb21wdXRlZFN0eWxlID9cblxuXHRcdFx0Ly8gVXNlIG9mIHRoaXMgbWV0aG9kIGlzIGEgdGVtcG9yYXJ5IGZpeCAobW9yZSBsaWtlIG9wdG1pemF0aW9uKSB1bnRpbCBzb21ldGhpbmcgYmV0dGVyIGNvbWVzIGFsb25nLFxuXHRcdFx0Ly8gc2luY2UgaXQgd2FzIHJlbW92ZWQgZnJvbSBzcGVjaWZpY2F0aW9uIGFuZCBzdXBwb3J0ZWQgb25seSBpbiBGRlxuXHRcdFx0d2luZG93LmdldERlZmF1bHRDb21wdXRlZFN0eWxlKCBlbGVtWyAwIF0gKS5kaXNwbGF5IDogalF1ZXJ5LmNzcyggZWxlbVsgMCBdLCBcImRpc3BsYXlcIiApO1xuXG5cdC8vIFdlIGRvbid0IGhhdmUgYW55IGRhdGEgc3RvcmVkIG9uIHRoZSBlbGVtZW50LFxuXHQvLyBzbyB1c2UgXCJkZXRhY2hcIiBtZXRob2QgYXMgZmFzdCB3YXkgdG8gZ2V0IHJpZCBvZiB0aGUgZWxlbWVudFxuXHRlbGVtLmRldGFjaCgpO1xuXG5cdHJldHVybiBkaXNwbGF5O1xufVxuXG4vKipcbiAqIFRyeSB0byBkZXRlcm1pbmUgdGhlIGRlZmF1bHQgZGlzcGxheSB2YWx1ZSBvZiBhbiBlbGVtZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gbm9kZU5hbWVcbiAqL1xuZnVuY3Rpb24gZGVmYXVsdERpc3BsYXkoIG5vZGVOYW1lICkge1xuXHR2YXIgZG9jID0gZG9jdW1lbnQsXG5cdFx0ZGlzcGxheSA9IGVsZW1kaXNwbGF5WyBub2RlTmFtZSBdO1xuXG5cdGlmICggIWRpc3BsYXkgKSB7XG5cdFx0ZGlzcGxheSA9IGFjdHVhbERpc3BsYXkoIG5vZGVOYW1lLCBkb2MgKTtcblxuXHRcdC8vIElmIHRoZSBzaW1wbGUgd2F5IGZhaWxzLCByZWFkIGZyb20gaW5zaWRlIGFuIGlmcmFtZVxuXHRcdGlmICggZGlzcGxheSA9PT0gXCJub25lXCIgfHwgIWRpc3BsYXkgKSB7XG5cblx0XHRcdC8vIFVzZSB0aGUgYWxyZWFkeS1jcmVhdGVkIGlmcmFtZSBpZiBwb3NzaWJsZVxuXHRcdFx0aWZyYW1lID0gKGlmcmFtZSB8fCBqUXVlcnkoIFwiPGlmcmFtZSBmcmFtZWJvcmRlcj0nMCcgd2lkdGg9JzAnIGhlaWdodD0nMCcvPlwiICkpLmFwcGVuZFRvKCBkb2MuZG9jdW1lbnRFbGVtZW50ICk7XG5cblx0XHRcdC8vIEFsd2F5cyB3cml0ZSBhIG5ldyBIVE1MIHNrZWxldG9uIHNvIFdlYmtpdCBhbmQgRmlyZWZveCBkb24ndCBjaG9rZSBvbiByZXVzZVxuXHRcdFx0ZG9jID0gaWZyYW1lWyAwIF0uY29udGVudERvY3VtZW50O1xuXG5cdFx0XHQvLyBTdXBwb3J0OiBJRVxuXHRcdFx0ZG9jLndyaXRlKCk7XG5cdFx0XHRkb2MuY2xvc2UoKTtcblxuXHRcdFx0ZGlzcGxheSA9IGFjdHVhbERpc3BsYXkoIG5vZGVOYW1lLCBkb2MgKTtcblx0XHRcdGlmcmFtZS5kZXRhY2goKTtcblx0XHR9XG5cblx0XHQvLyBTdG9yZSB0aGUgY29ycmVjdCBkZWZhdWx0IGRpc3BsYXlcblx0XHRlbGVtZGlzcGxheVsgbm9kZU5hbWUgXSA9IGRpc3BsYXk7XG5cdH1cblxuXHRyZXR1cm4gZGlzcGxheTtcbn1cbnZhciBybWFyZ2luID0gKC9ebWFyZ2luLyk7XG5cbnZhciBybnVtbm9ucHggPSBuZXcgUmVnRXhwKCBcIl4oXCIgKyBwbnVtICsgXCIpKD8hcHgpW2EteiVdKyRcIiwgXCJpXCIgKTtcblxudmFyIGdldFN0eWxlcyA9IGZ1bmN0aW9uKCBlbGVtICkge1xuXHRcdHJldHVybiBlbGVtLm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcuZ2V0Q29tcHV0ZWRTdHlsZSggZWxlbSwgbnVsbCApO1xuXHR9O1xuXG5cblxuZnVuY3Rpb24gY3VyQ1NTKCBlbGVtLCBuYW1lLCBjb21wdXRlZCApIHtcblx0dmFyIHdpZHRoLCBtaW5XaWR0aCwgbWF4V2lkdGgsIHJldCxcblx0XHRzdHlsZSA9IGVsZW0uc3R5bGU7XG5cblx0Y29tcHV0ZWQgPSBjb21wdXRlZCB8fCBnZXRTdHlsZXMoIGVsZW0gKTtcblxuXHQvLyBTdXBwb3J0OiBJRTlcblx0Ly8gZ2V0UHJvcGVydHlWYWx1ZSBpcyBvbmx5IG5lZWRlZCBmb3IgLmNzcygnZmlsdGVyJykgaW4gSUU5LCBzZWUgIzEyNTM3XG5cdGlmICggY29tcHV0ZWQgKSB7XG5cdFx0cmV0ID0gY29tcHV0ZWQuZ2V0UHJvcGVydHlWYWx1ZSggbmFtZSApIHx8IGNvbXB1dGVkWyBuYW1lIF07XG5cdH1cblxuXHRpZiAoIGNvbXB1dGVkICkge1xuXG5cdFx0aWYgKCByZXQgPT09IFwiXCIgJiYgIWpRdWVyeS5jb250YWlucyggZWxlbS5vd25lckRvY3VtZW50LCBlbGVtICkgKSB7XG5cdFx0XHRyZXQgPSBqUXVlcnkuc3R5bGUoIGVsZW0sIG5hbWUgKTtcblx0XHR9XG5cblx0XHQvLyBTdXBwb3J0OiBpT1MgPCA2XG5cdFx0Ly8gQSB0cmlidXRlIHRvIHRoZSBcImF3ZXNvbWUgaGFjayBieSBEZWFuIEVkd2FyZHNcIlxuXHRcdC8vIGlPUyA8IDYgKGF0IGxlYXN0KSByZXR1cm5zIHBlcmNlbnRhZ2UgZm9yIGEgbGFyZ2VyIHNldCBvZiB2YWx1ZXMsIGJ1dCB3aWR0aCBzZWVtcyB0byBiZSByZWxpYWJseSBwaXhlbHNcblx0XHQvLyB0aGlzIGlzIGFnYWluc3QgdGhlIENTU09NIGRyYWZ0IHNwZWM6IGh0dHA6Ly9kZXYudzMub3JnL2Nzc3dnL2Nzc29tLyNyZXNvbHZlZC12YWx1ZXNcblx0XHRpZiAoIHJudW1ub25weC50ZXN0KCByZXQgKSAmJiBybWFyZ2luLnRlc3QoIG5hbWUgKSApIHtcblxuXHRcdFx0Ly8gUmVtZW1iZXIgdGhlIG9yaWdpbmFsIHZhbHVlc1xuXHRcdFx0d2lkdGggPSBzdHlsZS53aWR0aDtcblx0XHRcdG1pbldpZHRoID0gc3R5bGUubWluV2lkdGg7XG5cdFx0XHRtYXhXaWR0aCA9IHN0eWxlLm1heFdpZHRoO1xuXG5cdFx0XHQvLyBQdXQgaW4gdGhlIG5ldyB2YWx1ZXMgdG8gZ2V0IGEgY29tcHV0ZWQgdmFsdWUgb3V0XG5cdFx0XHRzdHlsZS5taW5XaWR0aCA9IHN0eWxlLm1heFdpZHRoID0gc3R5bGUud2lkdGggPSByZXQ7XG5cdFx0XHRyZXQgPSBjb21wdXRlZC53aWR0aDtcblxuXHRcdFx0Ly8gUmV2ZXJ0IHRoZSBjaGFuZ2VkIHZhbHVlc1xuXHRcdFx0c3R5bGUud2lkdGggPSB3aWR0aDtcblx0XHRcdHN0eWxlLm1pbldpZHRoID0gbWluV2lkdGg7XG5cdFx0XHRzdHlsZS5tYXhXaWR0aCA9IG1heFdpZHRoO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiByZXQgIT09IHVuZGVmaW5lZCA/XG5cdFx0Ly8gU3VwcG9ydDogSUVcblx0XHQvLyBJRSByZXR1cm5zIHpJbmRleCB2YWx1ZSBhcyBhbiBpbnRlZ2VyLlxuXHRcdHJldCArIFwiXCIgOlxuXHRcdHJldDtcbn1cblxuXG5mdW5jdGlvbiBhZGRHZXRIb29rSWYoIGNvbmRpdGlvbkZuLCBob29rRm4gKSB7XG5cdC8vIERlZmluZSB0aGUgaG9vaywgd2UnbGwgY2hlY2sgb24gdGhlIGZpcnN0IHJ1biBpZiBpdCdzIHJlYWxseSBuZWVkZWQuXG5cdHJldHVybiB7XG5cdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdGlmICggY29uZGl0aW9uRm4oKSApIHtcblx0XHRcdFx0Ly8gSG9vayBub3QgbmVlZGVkIChvciBpdCdzIG5vdCBwb3NzaWJsZSB0byB1c2UgaXQgZHVlIHRvIG1pc3NpbmcgZGVwZW5kZW5jeSksXG5cdFx0XHRcdC8vIHJlbW92ZSBpdC5cblx0XHRcdFx0Ly8gU2luY2UgdGhlcmUgYXJlIG5vIG90aGVyIGhvb2tzIGZvciBtYXJnaW5SaWdodCwgcmVtb3ZlIHRoZSB3aG9sZSBvYmplY3QuXG5cdFx0XHRcdGRlbGV0ZSB0aGlzLmdldDtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBIb29rIG5lZWRlZDsgcmVkZWZpbmUgaXQgc28gdGhhdCB0aGUgc3VwcG9ydCB0ZXN0IGlzIG5vdCBleGVjdXRlZCBhZ2Fpbi5cblxuXHRcdFx0cmV0dXJuICh0aGlzLmdldCA9IGhvb2tGbikuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHRcdH1cblx0fTtcbn1cblxuXG4oZnVuY3Rpb24oKSB7XG5cdHZhciBwaXhlbFBvc2l0aW9uVmFsLCBib3hTaXppbmdSZWxpYWJsZVZhbCxcblx0XHQvLyBTdXBwb3J0OiBGaXJlZm94LCBBbmRyb2lkIDIuMyAoUHJlZml4ZWQgYm94LXNpemluZyB2ZXJzaW9ucykuXG5cdFx0ZGl2UmVzZXQgPSBcInBhZGRpbmc6MDttYXJnaW46MDtib3JkZXI6MDtkaXNwbGF5OmJsb2NrOy13ZWJraXQtYm94LXNpemluZzpjb250ZW50LWJveDtcIiArXG5cdFx0XHRcIi1tb3otYm94LXNpemluZzpjb250ZW50LWJveDtib3gtc2l6aW5nOmNvbnRlbnQtYm94XCIsXG5cdFx0ZG9jRWxlbSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxcblx0XHRjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCBcImRpdlwiICksXG5cdFx0ZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggXCJkaXZcIiApO1xuXG5cdGRpdi5zdHlsZS5iYWNrZ3JvdW5kQ2xpcCA9IFwiY29udGVudC1ib3hcIjtcblx0ZGl2LmNsb25lTm9kZSggdHJ1ZSApLnN0eWxlLmJhY2tncm91bmRDbGlwID0gXCJcIjtcblx0c3VwcG9ydC5jbGVhckNsb25lU3R5bGUgPSBkaXYuc3R5bGUuYmFja2dyb3VuZENsaXAgPT09IFwiY29udGVudC1ib3hcIjtcblxuXHRjb250YWluZXIuc3R5bGUuY3NzVGV4dCA9IFwiYm9yZGVyOjA7d2lkdGg6MDtoZWlnaHQ6MDtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MDtsZWZ0Oi05OTk5cHg7XCIgK1xuXHRcdFwibWFyZ2luLXRvcDoxcHhcIjtcblx0Y29udGFpbmVyLmFwcGVuZENoaWxkKCBkaXYgKTtcblxuXHQvLyBFeGVjdXRpbmcgYm90aCBwaXhlbFBvc2l0aW9uICYgYm94U2l6aW5nUmVsaWFibGUgdGVzdHMgcmVxdWlyZSBvbmx5IG9uZSBsYXlvdXRcblx0Ly8gc28gdGhleSdyZSBleGVjdXRlZCBhdCB0aGUgc2FtZSB0aW1lIHRvIHNhdmUgdGhlIHNlY29uZCBjb21wdXRhdGlvbi5cblx0ZnVuY3Rpb24gY29tcHV0ZVBpeGVsUG9zaXRpb25BbmRCb3hTaXppbmdSZWxpYWJsZSgpIHtcblx0XHQvLyBTdXBwb3J0OiBGaXJlZm94LCBBbmRyb2lkIDIuMyAoUHJlZml4ZWQgYm94LXNpemluZyB2ZXJzaW9ucykuXG5cdFx0ZGl2LnN0eWxlLmNzc1RleHQgPSBcIi13ZWJraXQtYm94LXNpemluZzpib3JkZXItYm94Oy1tb3otYm94LXNpemluZzpib3JkZXItYm94O1wiICtcblx0XHRcdFwiYm94LXNpemluZzpib3JkZXItYm94O3BhZGRpbmc6MXB4O2JvcmRlcjoxcHg7ZGlzcGxheTpibG9jazt3aWR0aDo0cHg7bWFyZ2luLXRvcDoxJTtcIiArXG5cdFx0XHRcInBvc2l0aW9uOmFic29sdXRlO3RvcDoxJVwiO1xuXHRcdGRvY0VsZW0uYXBwZW5kQ2hpbGQoIGNvbnRhaW5lciApO1xuXG5cdFx0dmFyIGRpdlN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoIGRpdiwgbnVsbCApO1xuXHRcdHBpeGVsUG9zaXRpb25WYWwgPSBkaXZTdHlsZS50b3AgIT09IFwiMSVcIjtcblx0XHRib3hTaXppbmdSZWxpYWJsZVZhbCA9IGRpdlN0eWxlLndpZHRoID09PSBcIjRweFwiO1xuXG5cdFx0ZG9jRWxlbS5yZW1vdmVDaGlsZCggY29udGFpbmVyICk7XG5cdH1cblxuXHQvLyBVc2Ugd2luZG93LmdldENvbXB1dGVkU3R5bGUgYmVjYXVzZSBqc2RvbSBvbiBub2RlLmpzIHdpbGwgYnJlYWsgd2l0aG91dCBpdC5cblx0aWYgKCB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSApIHtcblx0XHRqUXVlcnkuZXh0ZW5kKHN1cHBvcnQsIHtcblx0XHRcdHBpeGVsUG9zaXRpb246IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQvLyBUaGlzIHRlc3QgaXMgZXhlY3V0ZWQgb25seSBvbmNlIGJ1dCB3ZSBzdGlsbCBkbyBtZW1vaXppbmdcblx0XHRcdFx0Ly8gc2luY2Ugd2UgY2FuIHVzZSB0aGUgYm94U2l6aW5nUmVsaWFibGUgcHJlLWNvbXB1dGluZy5cblx0XHRcdFx0Ly8gTm8gbmVlZCB0byBjaGVjayBpZiB0aGUgdGVzdCB3YXMgYWxyZWFkeSBwZXJmb3JtZWQsIHRob3VnaC5cblx0XHRcdFx0Y29tcHV0ZVBpeGVsUG9zaXRpb25BbmRCb3hTaXppbmdSZWxpYWJsZSgpO1xuXHRcdFx0XHRyZXR1cm4gcGl4ZWxQb3NpdGlvblZhbDtcblx0XHRcdH0sXG5cdFx0XHRib3hTaXppbmdSZWxpYWJsZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICggYm94U2l6aW5nUmVsaWFibGVWYWwgPT0gbnVsbCApIHtcblx0XHRcdFx0XHRjb21wdXRlUGl4ZWxQb3NpdGlvbkFuZEJveFNpemluZ1JlbGlhYmxlKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGJveFNpemluZ1JlbGlhYmxlVmFsO1xuXHRcdFx0fSxcblx0XHRcdHJlbGlhYmxlTWFyZ2luUmlnaHQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQvLyBTdXBwb3J0OiBBbmRyb2lkIDIuM1xuXHRcdFx0XHQvLyBDaGVjayBpZiBkaXYgd2l0aCBleHBsaWNpdCB3aWR0aCBhbmQgbm8gbWFyZ2luLXJpZ2h0IGluY29ycmVjdGx5XG5cdFx0XHRcdC8vIGdldHMgY29tcHV0ZWQgbWFyZ2luLXJpZ2h0IGJhc2VkIG9uIHdpZHRoIG9mIGNvbnRhaW5lci4gKCMzMzMzKVxuXHRcdFx0XHQvLyBXZWJLaXQgQnVnIDEzMzQzIC0gZ2V0Q29tcHV0ZWRTdHlsZSByZXR1cm5zIHdyb25nIHZhbHVlIGZvciBtYXJnaW4tcmlnaHRcblx0XHRcdFx0Ly8gVGhpcyBzdXBwb3J0IGZ1bmN0aW9uIGlzIG9ubHkgZXhlY3V0ZWQgb25jZSBzbyBubyBtZW1vaXppbmcgaXMgbmVlZGVkLlxuXHRcdFx0XHR2YXIgcmV0LFxuXHRcdFx0XHRcdG1hcmdpbkRpdiA9IGRpdi5hcHBlbmRDaGlsZCggZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggXCJkaXZcIiApICk7XG5cdFx0XHRcdG1hcmdpbkRpdi5zdHlsZS5jc3NUZXh0ID0gZGl2LnN0eWxlLmNzc1RleHQgPSBkaXZSZXNldDtcblx0XHRcdFx0bWFyZ2luRGl2LnN0eWxlLm1hcmdpblJpZ2h0ID0gbWFyZ2luRGl2LnN0eWxlLndpZHRoID0gXCIwXCI7XG5cdFx0XHRcdGRpdi5zdHlsZS53aWR0aCA9IFwiMXB4XCI7XG5cdFx0XHRcdGRvY0VsZW0uYXBwZW5kQ2hpbGQoIGNvbnRhaW5lciApO1xuXG5cdFx0XHRcdHJldCA9ICFwYXJzZUZsb2F0KCB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSggbWFyZ2luRGl2LCBudWxsICkubWFyZ2luUmlnaHQgKTtcblxuXHRcdFx0XHRkb2NFbGVtLnJlbW92ZUNoaWxkKCBjb250YWluZXIgKTtcblxuXHRcdFx0XHQvLyBDbGVhbiB1cCB0aGUgZGl2IGZvciBvdGhlciBzdXBwb3J0IHRlc3RzLlxuXHRcdFx0XHRkaXYuaW5uZXJIVE1MID0gXCJcIjtcblxuXHRcdFx0XHRyZXR1cm4gcmV0O1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59KSgpO1xuXG5cbi8vIEEgbWV0aG9kIGZvciBxdWlja2x5IHN3YXBwaW5nIGluL291dCBDU1MgcHJvcGVydGllcyB0byBnZXQgY29ycmVjdCBjYWxjdWxhdGlvbnMuXG5qUXVlcnkuc3dhcCA9IGZ1bmN0aW9uKCBlbGVtLCBvcHRpb25zLCBjYWxsYmFjaywgYXJncyApIHtcblx0dmFyIHJldCwgbmFtZSxcblx0XHRvbGQgPSB7fTtcblxuXHQvLyBSZW1lbWJlciB0aGUgb2xkIHZhbHVlcywgYW5kIGluc2VydCB0aGUgbmV3IG9uZXNcblx0Zm9yICggbmFtZSBpbiBvcHRpb25zICkge1xuXHRcdG9sZFsgbmFtZSBdID0gZWxlbS5zdHlsZVsgbmFtZSBdO1xuXHRcdGVsZW0uc3R5bGVbIG5hbWUgXSA9IG9wdGlvbnNbIG5hbWUgXTtcblx0fVxuXG5cdHJldCA9IGNhbGxiYWNrLmFwcGx5KCBlbGVtLCBhcmdzIHx8IFtdICk7XG5cblx0Ly8gUmV2ZXJ0IHRoZSBvbGQgdmFsdWVzXG5cdGZvciAoIG5hbWUgaW4gb3B0aW9ucyApIHtcblx0XHRlbGVtLnN0eWxlWyBuYW1lIF0gPSBvbGRbIG5hbWUgXTtcblx0fVxuXG5cdHJldHVybiByZXQ7XG59O1xuXG5cbnZhclxuXHQvLyBzd2FwcGFibGUgaWYgZGlzcGxheSBpcyBub25lIG9yIHN0YXJ0cyB3aXRoIHRhYmxlIGV4Y2VwdCBcInRhYmxlXCIsIFwidGFibGUtY2VsbFwiLCBvciBcInRhYmxlLWNhcHRpb25cIlxuXHQvLyBzZWUgaGVyZSBmb3IgZGlzcGxheSB2YWx1ZXM6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvQ1NTL2Rpc3BsYXlcblx0cmRpc3BsYXlzd2FwID0gL14obm9uZXx0YWJsZSg/IS1jW2VhXSkuKykvLFxuXHRybnVtc3BsaXQgPSBuZXcgUmVnRXhwKCBcIl4oXCIgKyBwbnVtICsgXCIpKC4qKSRcIiwgXCJpXCIgKSxcblx0cnJlbE51bSA9IG5ldyBSZWdFeHAoIFwiXihbKy1dKT0oXCIgKyBwbnVtICsgXCIpXCIsIFwiaVwiICksXG5cblx0Y3NzU2hvdyA9IHsgcG9zaXRpb246IFwiYWJzb2x1dGVcIiwgdmlzaWJpbGl0eTogXCJoaWRkZW5cIiwgZGlzcGxheTogXCJibG9ja1wiIH0sXG5cdGNzc05vcm1hbFRyYW5zZm9ybSA9IHtcblx0XHRsZXR0ZXJTcGFjaW5nOiAwLFxuXHRcdGZvbnRXZWlnaHQ6IDQwMFxuXHR9LFxuXG5cdGNzc1ByZWZpeGVzID0gWyBcIldlYmtpdFwiLCBcIk9cIiwgXCJNb3pcIiwgXCJtc1wiIF07XG5cbi8vIHJldHVybiBhIGNzcyBwcm9wZXJ0eSBtYXBwZWQgdG8gYSBwb3RlbnRpYWxseSB2ZW5kb3IgcHJlZml4ZWQgcHJvcGVydHlcbmZ1bmN0aW9uIHZlbmRvclByb3BOYW1lKCBzdHlsZSwgbmFtZSApIHtcblxuXHQvLyBzaG9ydGN1dCBmb3IgbmFtZXMgdGhhdCBhcmUgbm90IHZlbmRvciBwcmVmaXhlZFxuXHRpZiAoIG5hbWUgaW4gc3R5bGUgKSB7XG5cdFx0cmV0dXJuIG5hbWU7XG5cdH1cblxuXHQvLyBjaGVjayBmb3IgdmVuZG9yIHByZWZpeGVkIG5hbWVzXG5cdHZhciBjYXBOYW1lID0gbmFtZVswXS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zbGljZSgxKSxcblx0XHRvcmlnTmFtZSA9IG5hbWUsXG5cdFx0aSA9IGNzc1ByZWZpeGVzLmxlbmd0aDtcblxuXHR3aGlsZSAoIGktLSApIHtcblx0XHRuYW1lID0gY3NzUHJlZml4ZXNbIGkgXSArIGNhcE5hbWU7XG5cdFx0aWYgKCBuYW1lIGluIHN0eWxlICkge1xuXHRcdFx0cmV0dXJuIG5hbWU7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG9yaWdOYW1lO1xufVxuXG5mdW5jdGlvbiBzZXRQb3NpdGl2ZU51bWJlciggZWxlbSwgdmFsdWUsIHN1YnRyYWN0ICkge1xuXHR2YXIgbWF0Y2hlcyA9IHJudW1zcGxpdC5leGVjKCB2YWx1ZSApO1xuXHRyZXR1cm4gbWF0Y2hlcyA/XG5cdFx0Ly8gR3VhcmQgYWdhaW5zdCB1bmRlZmluZWQgXCJzdWJ0cmFjdFwiLCBlLmcuLCB3aGVuIHVzZWQgYXMgaW4gY3NzSG9va3Ncblx0XHRNYXRoLm1heCggMCwgbWF0Y2hlc1sgMSBdIC0gKCBzdWJ0cmFjdCB8fCAwICkgKSArICggbWF0Y2hlc1sgMiBdIHx8IFwicHhcIiApIDpcblx0XHR2YWx1ZTtcbn1cblxuZnVuY3Rpb24gYXVnbWVudFdpZHRoT3JIZWlnaHQoIGVsZW0sIG5hbWUsIGV4dHJhLCBpc0JvcmRlckJveCwgc3R5bGVzICkge1xuXHR2YXIgaSA9IGV4dHJhID09PSAoIGlzQm9yZGVyQm94ID8gXCJib3JkZXJcIiA6IFwiY29udGVudFwiICkgP1xuXHRcdC8vIElmIHdlIGFscmVhZHkgaGF2ZSB0aGUgcmlnaHQgbWVhc3VyZW1lbnQsIGF2b2lkIGF1Z21lbnRhdGlvblxuXHRcdDQgOlxuXHRcdC8vIE90aGVyd2lzZSBpbml0aWFsaXplIGZvciBob3Jpem9udGFsIG9yIHZlcnRpY2FsIHByb3BlcnRpZXNcblx0XHRuYW1lID09PSBcIndpZHRoXCIgPyAxIDogMCxcblxuXHRcdHZhbCA9IDA7XG5cblx0Zm9yICggOyBpIDwgNDsgaSArPSAyICkge1xuXHRcdC8vIGJvdGggYm94IG1vZGVscyBleGNsdWRlIG1hcmdpbiwgc28gYWRkIGl0IGlmIHdlIHdhbnQgaXRcblx0XHRpZiAoIGV4dHJhID09PSBcIm1hcmdpblwiICkge1xuXHRcdFx0dmFsICs9IGpRdWVyeS5jc3MoIGVsZW0sIGV4dHJhICsgY3NzRXhwYW5kWyBpIF0sIHRydWUsIHN0eWxlcyApO1xuXHRcdH1cblxuXHRcdGlmICggaXNCb3JkZXJCb3ggKSB7XG5cdFx0XHQvLyBib3JkZXItYm94IGluY2x1ZGVzIHBhZGRpbmcsIHNvIHJlbW92ZSBpdCBpZiB3ZSB3YW50IGNvbnRlbnRcblx0XHRcdGlmICggZXh0cmEgPT09IFwiY29udGVudFwiICkge1xuXHRcdFx0XHR2YWwgLT0galF1ZXJ5LmNzcyggZWxlbSwgXCJwYWRkaW5nXCIgKyBjc3NFeHBhbmRbIGkgXSwgdHJ1ZSwgc3R5bGVzICk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGF0IHRoaXMgcG9pbnQsIGV4dHJhIGlzbid0IGJvcmRlciBub3IgbWFyZ2luLCBzbyByZW1vdmUgYm9yZGVyXG5cdFx0XHRpZiAoIGV4dHJhICE9PSBcIm1hcmdpblwiICkge1xuXHRcdFx0XHR2YWwgLT0galF1ZXJ5LmNzcyggZWxlbSwgXCJib3JkZXJcIiArIGNzc0V4cGFuZFsgaSBdICsgXCJXaWR0aFwiLCB0cnVlLCBzdHlsZXMgKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gYXQgdGhpcyBwb2ludCwgZXh0cmEgaXNuJ3QgY29udGVudCwgc28gYWRkIHBhZGRpbmdcblx0XHRcdHZhbCArPSBqUXVlcnkuY3NzKCBlbGVtLCBcInBhZGRpbmdcIiArIGNzc0V4cGFuZFsgaSBdLCB0cnVlLCBzdHlsZXMgKTtcblxuXHRcdFx0Ly8gYXQgdGhpcyBwb2ludCwgZXh0cmEgaXNuJ3QgY29udGVudCBub3IgcGFkZGluZywgc28gYWRkIGJvcmRlclxuXHRcdFx0aWYgKCBleHRyYSAhPT0gXCJwYWRkaW5nXCIgKSB7XG5cdFx0XHRcdHZhbCArPSBqUXVlcnkuY3NzKCBlbGVtLCBcImJvcmRlclwiICsgY3NzRXhwYW5kWyBpIF0gKyBcIldpZHRoXCIsIHRydWUsIHN0eWxlcyApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiB2YWw7XG59XG5cbmZ1bmN0aW9uIGdldFdpZHRoT3JIZWlnaHQoIGVsZW0sIG5hbWUsIGV4dHJhICkge1xuXG5cdC8vIFN0YXJ0IHdpdGggb2Zmc2V0IHByb3BlcnR5LCB3aGljaCBpcyBlcXVpdmFsZW50IHRvIHRoZSBib3JkZXItYm94IHZhbHVlXG5cdHZhciB2YWx1ZUlzQm9yZGVyQm94ID0gdHJ1ZSxcblx0XHR2YWwgPSBuYW1lID09PSBcIndpZHRoXCIgPyBlbGVtLm9mZnNldFdpZHRoIDogZWxlbS5vZmZzZXRIZWlnaHQsXG5cdFx0c3R5bGVzID0gZ2V0U3R5bGVzKCBlbGVtICksXG5cdFx0aXNCb3JkZXJCb3ggPSBqUXVlcnkuY3NzKCBlbGVtLCBcImJveFNpemluZ1wiLCBmYWxzZSwgc3R5bGVzICkgPT09IFwiYm9yZGVyLWJveFwiO1xuXG5cdC8vIHNvbWUgbm9uLWh0bWwgZWxlbWVudHMgcmV0dXJuIHVuZGVmaW5lZCBmb3Igb2Zmc2V0V2lkdGgsIHNvIGNoZWNrIGZvciBudWxsL3VuZGVmaW5lZFxuXHQvLyBzdmcgLSBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02NDkyODVcblx0Ly8gTWF0aE1MIC0gaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9NDkxNjY4XG5cdGlmICggdmFsIDw9IDAgfHwgdmFsID09IG51bGwgKSB7XG5cdFx0Ly8gRmFsbCBiYWNrIHRvIGNvbXB1dGVkIHRoZW4gdW5jb21wdXRlZCBjc3MgaWYgbmVjZXNzYXJ5XG5cdFx0dmFsID0gY3VyQ1NTKCBlbGVtLCBuYW1lLCBzdHlsZXMgKTtcblx0XHRpZiAoIHZhbCA8IDAgfHwgdmFsID09IG51bGwgKSB7XG5cdFx0XHR2YWwgPSBlbGVtLnN0eWxlWyBuYW1lIF07XG5cdFx0fVxuXG5cdFx0Ly8gQ29tcHV0ZWQgdW5pdCBpcyBub3QgcGl4ZWxzLiBTdG9wIGhlcmUgYW5kIHJldHVybi5cblx0XHRpZiAoIHJudW1ub25weC50ZXN0KHZhbCkgKSB7XG5cdFx0XHRyZXR1cm4gdmFsO1xuXHRcdH1cblxuXHRcdC8vIHdlIG5lZWQgdGhlIGNoZWNrIGZvciBzdHlsZSBpbiBjYXNlIGEgYnJvd3NlciB3aGljaCByZXR1cm5zIHVucmVsaWFibGUgdmFsdWVzXG5cdFx0Ly8gZm9yIGdldENvbXB1dGVkU3R5bGUgc2lsZW50bHkgZmFsbHMgYmFjayB0byB0aGUgcmVsaWFibGUgZWxlbS5zdHlsZVxuXHRcdHZhbHVlSXNCb3JkZXJCb3ggPSBpc0JvcmRlckJveCAmJlxuXHRcdFx0KCBzdXBwb3J0LmJveFNpemluZ1JlbGlhYmxlKCkgfHwgdmFsID09PSBlbGVtLnN0eWxlWyBuYW1lIF0gKTtcblxuXHRcdC8vIE5vcm1hbGl6ZSBcIlwiLCBhdXRvLCBhbmQgcHJlcGFyZSBmb3IgZXh0cmFcblx0XHR2YWwgPSBwYXJzZUZsb2F0KCB2YWwgKSB8fCAwO1xuXHR9XG5cblx0Ly8gdXNlIHRoZSBhY3RpdmUgYm94LXNpemluZyBtb2RlbCB0byBhZGQvc3VidHJhY3QgaXJyZWxldmFudCBzdHlsZXNcblx0cmV0dXJuICggdmFsICtcblx0XHRhdWdtZW50V2lkdGhPckhlaWdodChcblx0XHRcdGVsZW0sXG5cdFx0XHRuYW1lLFxuXHRcdFx0ZXh0cmEgfHwgKCBpc0JvcmRlckJveCA/IFwiYm9yZGVyXCIgOiBcImNvbnRlbnRcIiApLFxuXHRcdFx0dmFsdWVJc0JvcmRlckJveCxcblx0XHRcdHN0eWxlc1xuXHRcdClcblx0KSArIFwicHhcIjtcbn1cblxuZnVuY3Rpb24gc2hvd0hpZGUoIGVsZW1lbnRzLCBzaG93ICkge1xuXHR2YXIgZGlzcGxheSwgZWxlbSwgaGlkZGVuLFxuXHRcdHZhbHVlcyA9IFtdLFxuXHRcdGluZGV4ID0gMCxcblx0XHRsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7XG5cblx0Zm9yICggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKyApIHtcblx0XHRlbGVtID0gZWxlbWVudHNbIGluZGV4IF07XG5cdFx0aWYgKCAhZWxlbS5zdHlsZSApIHtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdHZhbHVlc1sgaW5kZXggXSA9IGRhdGFfcHJpdi5nZXQoIGVsZW0sIFwib2xkZGlzcGxheVwiICk7XG5cdFx0ZGlzcGxheSA9IGVsZW0uc3R5bGUuZGlzcGxheTtcblx0XHRpZiAoIHNob3cgKSB7XG5cdFx0XHQvLyBSZXNldCB0aGUgaW5saW5lIGRpc3BsYXkgb2YgdGhpcyBlbGVtZW50IHRvIGxlYXJuIGlmIGl0IGlzXG5cdFx0XHQvLyBiZWluZyBoaWRkZW4gYnkgY2FzY2FkZWQgcnVsZXMgb3Igbm90XG5cdFx0XHRpZiAoICF2YWx1ZXNbIGluZGV4IF0gJiYgZGlzcGxheSA9PT0gXCJub25lXCIgKSB7XG5cdFx0XHRcdGVsZW0uc3R5bGUuZGlzcGxheSA9IFwiXCI7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFNldCBlbGVtZW50cyB3aGljaCBoYXZlIGJlZW4gb3ZlcnJpZGRlbiB3aXRoIGRpc3BsYXk6IG5vbmVcblx0XHRcdC8vIGluIGEgc3R5bGVzaGVldCB0byB3aGF0ZXZlciB0aGUgZGVmYXVsdCBicm93c2VyIHN0eWxlIGlzXG5cdFx0XHQvLyBmb3Igc3VjaCBhbiBlbGVtZW50XG5cdFx0XHRpZiAoIGVsZW0uc3R5bGUuZGlzcGxheSA9PT0gXCJcIiAmJiBpc0hpZGRlbiggZWxlbSApICkge1xuXHRcdFx0XHR2YWx1ZXNbIGluZGV4IF0gPSBkYXRhX3ByaXYuYWNjZXNzKCBlbGVtLCBcIm9sZGRpc3BsYXlcIiwgZGVmYXVsdERpc3BsYXkoZWxlbS5ub2RlTmFtZSkgKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRpZiAoICF2YWx1ZXNbIGluZGV4IF0gKSB7XG5cdFx0XHRcdGhpZGRlbiA9IGlzSGlkZGVuKCBlbGVtICk7XG5cblx0XHRcdFx0aWYgKCBkaXNwbGF5ICYmIGRpc3BsYXkgIT09IFwibm9uZVwiIHx8ICFoaWRkZW4gKSB7XG5cdFx0XHRcdFx0ZGF0YV9wcml2LnNldCggZWxlbSwgXCJvbGRkaXNwbGF5XCIsIGhpZGRlbiA/IGRpc3BsYXkgOiBqUXVlcnkuY3NzKGVsZW0sIFwiZGlzcGxheVwiKSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gU2V0IHRoZSBkaXNwbGF5IG9mIG1vc3Qgb2YgdGhlIGVsZW1lbnRzIGluIGEgc2Vjb25kIGxvb3Bcblx0Ly8gdG8gYXZvaWQgdGhlIGNvbnN0YW50IHJlZmxvd1xuXHRmb3IgKCBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrICkge1xuXHRcdGVsZW0gPSBlbGVtZW50c1sgaW5kZXggXTtcblx0XHRpZiAoICFlbGVtLnN0eWxlICkge1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXHRcdGlmICggIXNob3cgfHwgZWxlbS5zdHlsZS5kaXNwbGF5ID09PSBcIm5vbmVcIiB8fCBlbGVtLnN0eWxlLmRpc3BsYXkgPT09IFwiXCIgKSB7XG5cdFx0XHRlbGVtLnN0eWxlLmRpc3BsYXkgPSBzaG93ID8gdmFsdWVzWyBpbmRleCBdIHx8IFwiXCIgOiBcIm5vbmVcIjtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gZWxlbWVudHM7XG59XG5cbmpRdWVyeS5leHRlbmQoe1xuXHQvLyBBZGQgaW4gc3R5bGUgcHJvcGVydHkgaG9va3MgZm9yIG92ZXJyaWRpbmcgdGhlIGRlZmF1bHRcblx0Ly8gYmVoYXZpb3Igb2YgZ2V0dGluZyBhbmQgc2V0dGluZyBhIHN0eWxlIHByb3BlcnR5XG5cdGNzc0hvb2tzOiB7XG5cdFx0b3BhY2l0eToge1xuXHRcdFx0Z2V0OiBmdW5jdGlvbiggZWxlbSwgY29tcHV0ZWQgKSB7XG5cdFx0XHRcdGlmICggY29tcHV0ZWQgKSB7XG5cdFx0XHRcdFx0Ly8gV2Ugc2hvdWxkIGFsd2F5cyBnZXQgYSBudW1iZXIgYmFjayBmcm9tIG9wYWNpdHlcblx0XHRcdFx0XHR2YXIgcmV0ID0gY3VyQ1NTKCBlbGVtLCBcIm9wYWNpdHlcIiApO1xuXHRcdFx0XHRcdHJldHVybiByZXQgPT09IFwiXCIgPyBcIjFcIiA6IHJldDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHQvLyBEb24ndCBhdXRvbWF0aWNhbGx5IGFkZCBcInB4XCIgdG8gdGhlc2UgcG9zc2libHktdW5pdGxlc3MgcHJvcGVydGllc1xuXHRjc3NOdW1iZXI6IHtcblx0XHRcImNvbHVtbkNvdW50XCI6IHRydWUsXG5cdFx0XCJmaWxsT3BhY2l0eVwiOiB0cnVlLFxuXHRcdFwiZm9udFdlaWdodFwiOiB0cnVlLFxuXHRcdFwibGluZUhlaWdodFwiOiB0cnVlLFxuXHRcdFwib3BhY2l0eVwiOiB0cnVlLFxuXHRcdFwib3JkZXJcIjogdHJ1ZSxcblx0XHRcIm9ycGhhbnNcIjogdHJ1ZSxcblx0XHRcIndpZG93c1wiOiB0cnVlLFxuXHRcdFwiekluZGV4XCI6IHRydWUsXG5cdFx0XCJ6b29tXCI6IHRydWVcblx0fSxcblxuXHQvLyBBZGQgaW4gcHJvcGVydGllcyB3aG9zZSBuYW1lcyB5b3Ugd2lzaCB0byBmaXggYmVmb3JlXG5cdC8vIHNldHRpbmcgb3IgZ2V0dGluZyB0aGUgdmFsdWVcblx0Y3NzUHJvcHM6IHtcblx0XHQvLyBub3JtYWxpemUgZmxvYXQgY3NzIHByb3BlcnR5XG5cdFx0XCJmbG9hdFwiOiBcImNzc0Zsb2F0XCJcblx0fSxcblxuXHQvLyBHZXQgYW5kIHNldCB0aGUgc3R5bGUgcHJvcGVydHkgb24gYSBET00gTm9kZVxuXHRzdHlsZTogZnVuY3Rpb24oIGVsZW0sIG5hbWUsIHZhbHVlLCBleHRyYSApIHtcblx0XHQvLyBEb24ndCBzZXQgc3R5bGVzIG9uIHRleHQgYW5kIGNvbW1lbnQgbm9kZXNcblx0XHRpZiAoICFlbGVtIHx8IGVsZW0ubm9kZVR5cGUgPT09IDMgfHwgZWxlbS5ub2RlVHlwZSA9PT0gOCB8fCAhZWxlbS5zdHlsZSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBNYWtlIHN1cmUgdGhhdCB3ZSdyZSB3b3JraW5nIHdpdGggdGhlIHJpZ2h0IG5hbWVcblx0XHR2YXIgcmV0LCB0eXBlLCBob29rcyxcblx0XHRcdG9yaWdOYW1lID0galF1ZXJ5LmNhbWVsQ2FzZSggbmFtZSApLFxuXHRcdFx0c3R5bGUgPSBlbGVtLnN0eWxlO1xuXG5cdFx0bmFtZSA9IGpRdWVyeS5jc3NQcm9wc1sgb3JpZ05hbWUgXSB8fCAoIGpRdWVyeS5jc3NQcm9wc1sgb3JpZ05hbWUgXSA9IHZlbmRvclByb3BOYW1lKCBzdHlsZSwgb3JpZ05hbWUgKSApO1xuXG5cdFx0Ly8gZ2V0cyBob29rIGZvciB0aGUgcHJlZml4ZWQgdmVyc2lvblxuXHRcdC8vIGZvbGxvd2VkIGJ5IHRoZSB1bnByZWZpeGVkIHZlcnNpb25cblx0XHRob29rcyA9IGpRdWVyeS5jc3NIb29rc1sgbmFtZSBdIHx8IGpRdWVyeS5jc3NIb29rc1sgb3JpZ05hbWUgXTtcblxuXHRcdC8vIENoZWNrIGlmIHdlJ3JlIHNldHRpbmcgYSB2YWx1ZVxuXHRcdGlmICggdmFsdWUgIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdHR5cGUgPSB0eXBlb2YgdmFsdWU7XG5cblx0XHRcdC8vIGNvbnZlcnQgcmVsYXRpdmUgbnVtYmVyIHN0cmluZ3MgKCs9IG9yIC09KSB0byByZWxhdGl2ZSBudW1iZXJzLiAjNzM0NVxuXHRcdFx0aWYgKCB0eXBlID09PSBcInN0cmluZ1wiICYmIChyZXQgPSBycmVsTnVtLmV4ZWMoIHZhbHVlICkpICkge1xuXHRcdFx0XHR2YWx1ZSA9ICggcmV0WzFdICsgMSApICogcmV0WzJdICsgcGFyc2VGbG9hdCggalF1ZXJ5LmNzcyggZWxlbSwgbmFtZSApICk7XG5cdFx0XHRcdC8vIEZpeGVzIGJ1ZyAjOTIzN1xuXHRcdFx0XHR0eXBlID0gXCJudW1iZXJcIjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gTWFrZSBzdXJlIHRoYXQgbnVsbCBhbmQgTmFOIHZhbHVlcyBhcmVuJ3Qgc2V0LiBTZWU6ICM3MTE2XG5cdFx0XHRpZiAoIHZhbHVlID09IG51bGwgfHwgdmFsdWUgIT09IHZhbHVlICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIElmIGEgbnVtYmVyIHdhcyBwYXNzZWQgaW4sIGFkZCAncHgnIHRvIHRoZSAoZXhjZXB0IGZvciBjZXJ0YWluIENTUyBwcm9wZXJ0aWVzKVxuXHRcdFx0aWYgKCB0eXBlID09PSBcIm51bWJlclwiICYmICFqUXVlcnkuY3NzTnVtYmVyWyBvcmlnTmFtZSBdICkge1xuXHRcdFx0XHR2YWx1ZSArPSBcInB4XCI7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEZpeGVzICM4OTA4LCBpdCBjYW4gYmUgZG9uZSBtb3JlIGNvcnJlY3RseSBieSBzcGVjaWZ5aW5nIHNldHRlcnMgaW4gY3NzSG9va3MsXG5cdFx0XHQvLyBidXQgaXQgd291bGQgbWVhbiB0byBkZWZpbmUgZWlnaHQgKGZvciBldmVyeSBwcm9ibGVtYXRpYyBwcm9wZXJ0eSkgaWRlbnRpY2FsIGZ1bmN0aW9uc1xuXHRcdFx0aWYgKCAhc3VwcG9ydC5jbGVhckNsb25lU3R5bGUgJiYgdmFsdWUgPT09IFwiXCIgJiYgbmFtZS5pbmRleE9mKCBcImJhY2tncm91bmRcIiApID09PSAwICkge1xuXHRcdFx0XHRzdHlsZVsgbmFtZSBdID0gXCJpbmhlcml0XCI7XG5cdFx0XHR9XG5cblx0XHRcdC8vIElmIGEgaG9vayB3YXMgcHJvdmlkZWQsIHVzZSB0aGF0IHZhbHVlLCBvdGhlcndpc2UganVzdCBzZXQgdGhlIHNwZWNpZmllZCB2YWx1ZVxuXHRcdFx0aWYgKCAhaG9va3MgfHwgIShcInNldFwiIGluIGhvb2tzKSB8fCAodmFsdWUgPSBob29rcy5zZXQoIGVsZW0sIHZhbHVlLCBleHRyYSApKSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHQvLyBTdXBwb3J0OiBDaHJvbWUsIFNhZmFyaVxuXHRcdFx0XHQvLyBTZXR0aW5nIHN0eWxlIHRvIGJsYW5rIHN0cmluZyByZXF1aXJlZCB0byBkZWxldGUgXCJzdHlsZTogeCAhaW1wb3J0YW50O1wiXG5cdFx0XHRcdHN0eWxlWyBuYW1lIF0gPSBcIlwiO1xuXHRcdFx0XHRzdHlsZVsgbmFtZSBdID0gdmFsdWU7XG5cdFx0XHR9XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gSWYgYSBob29rIHdhcyBwcm92aWRlZCBnZXQgdGhlIG5vbi1jb21wdXRlZCB2YWx1ZSBmcm9tIHRoZXJlXG5cdFx0XHRpZiAoIGhvb2tzICYmIFwiZ2V0XCIgaW4gaG9va3MgJiYgKHJldCA9IGhvb2tzLmdldCggZWxlbSwgZmFsc2UsIGV4dHJhICkpICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdHJldHVybiByZXQ7XG5cdFx0XHR9XG5cblx0XHRcdC8vIE90aGVyd2lzZSBqdXN0IGdldCB0aGUgdmFsdWUgZnJvbSB0aGUgc3R5bGUgb2JqZWN0XG5cdFx0XHRyZXR1cm4gc3R5bGVbIG5hbWUgXTtcblx0XHR9XG5cdH0sXG5cblx0Y3NzOiBmdW5jdGlvbiggZWxlbSwgbmFtZSwgZXh0cmEsIHN0eWxlcyApIHtcblx0XHR2YXIgdmFsLCBudW0sIGhvb2tzLFxuXHRcdFx0b3JpZ05hbWUgPSBqUXVlcnkuY2FtZWxDYXNlKCBuYW1lICk7XG5cblx0XHQvLyBNYWtlIHN1cmUgdGhhdCB3ZSdyZSB3b3JraW5nIHdpdGggdGhlIHJpZ2h0IG5hbWVcblx0XHRuYW1lID0galF1ZXJ5LmNzc1Byb3BzWyBvcmlnTmFtZSBdIHx8ICggalF1ZXJ5LmNzc1Byb3BzWyBvcmlnTmFtZSBdID0gdmVuZG9yUHJvcE5hbWUoIGVsZW0uc3R5bGUsIG9yaWdOYW1lICkgKTtcblxuXHRcdC8vIGdldHMgaG9vayBmb3IgdGhlIHByZWZpeGVkIHZlcnNpb25cblx0XHQvLyBmb2xsb3dlZCBieSB0aGUgdW5wcmVmaXhlZCB2ZXJzaW9uXG5cdFx0aG9va3MgPSBqUXVlcnkuY3NzSG9va3NbIG5hbWUgXSB8fCBqUXVlcnkuY3NzSG9va3NbIG9yaWdOYW1lIF07XG5cblx0XHQvLyBJZiBhIGhvb2sgd2FzIHByb3ZpZGVkIGdldCB0aGUgY29tcHV0ZWQgdmFsdWUgZnJvbSB0aGVyZVxuXHRcdGlmICggaG9va3MgJiYgXCJnZXRcIiBpbiBob29rcyApIHtcblx0XHRcdHZhbCA9IGhvb2tzLmdldCggZWxlbSwgdHJ1ZSwgZXh0cmEgKTtcblx0XHR9XG5cblx0XHQvLyBPdGhlcndpc2UsIGlmIGEgd2F5IHRvIGdldCB0aGUgY29tcHV0ZWQgdmFsdWUgZXhpc3RzLCB1c2UgdGhhdFxuXHRcdGlmICggdmFsID09PSB1bmRlZmluZWQgKSB7XG5cdFx0XHR2YWwgPSBjdXJDU1MoIGVsZW0sIG5hbWUsIHN0eWxlcyApO1xuXHRcdH1cblxuXHRcdC8vY29udmVydCBcIm5vcm1hbFwiIHRvIGNvbXB1dGVkIHZhbHVlXG5cdFx0aWYgKCB2YWwgPT09IFwibm9ybWFsXCIgJiYgbmFtZSBpbiBjc3NOb3JtYWxUcmFuc2Zvcm0gKSB7XG5cdFx0XHR2YWwgPSBjc3NOb3JtYWxUcmFuc2Zvcm1bIG5hbWUgXTtcblx0XHR9XG5cblx0XHQvLyBSZXR1cm4sIGNvbnZlcnRpbmcgdG8gbnVtYmVyIGlmIGZvcmNlZCBvciBhIHF1YWxpZmllciB3YXMgcHJvdmlkZWQgYW5kIHZhbCBsb29rcyBudW1lcmljXG5cdFx0aWYgKCBleHRyYSA9PT0gXCJcIiB8fCBleHRyYSApIHtcblx0XHRcdG51bSA9IHBhcnNlRmxvYXQoIHZhbCApO1xuXHRcdFx0cmV0dXJuIGV4dHJhID09PSB0cnVlIHx8IGpRdWVyeS5pc051bWVyaWMoIG51bSApID8gbnVtIHx8IDAgOiB2YWw7XG5cdFx0fVxuXHRcdHJldHVybiB2YWw7XG5cdH1cbn0pO1xuXG5qUXVlcnkuZWFjaChbIFwiaGVpZ2h0XCIsIFwid2lkdGhcIiBdLCBmdW5jdGlvbiggaSwgbmFtZSApIHtcblx0alF1ZXJ5LmNzc0hvb2tzWyBuYW1lIF0gPSB7XG5cdFx0Z2V0OiBmdW5jdGlvbiggZWxlbSwgY29tcHV0ZWQsIGV4dHJhICkge1xuXHRcdFx0aWYgKCBjb21wdXRlZCApIHtcblx0XHRcdFx0Ly8gY2VydGFpbiBlbGVtZW50cyBjYW4gaGF2ZSBkaW1lbnNpb24gaW5mbyBpZiB3ZSBpbnZpc2libHkgc2hvdyB0aGVtXG5cdFx0XHRcdC8vIGhvd2V2ZXIsIGl0IG11c3QgaGF2ZSBhIGN1cnJlbnQgZGlzcGxheSBzdHlsZSB0aGF0IHdvdWxkIGJlbmVmaXQgZnJvbSB0aGlzXG5cdFx0XHRcdHJldHVybiBlbGVtLm9mZnNldFdpZHRoID09PSAwICYmIHJkaXNwbGF5c3dhcC50ZXN0KCBqUXVlcnkuY3NzKCBlbGVtLCBcImRpc3BsYXlcIiApICkgP1xuXHRcdFx0XHRcdGpRdWVyeS5zd2FwKCBlbGVtLCBjc3NTaG93LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHJldHVybiBnZXRXaWR0aE9ySGVpZ2h0KCBlbGVtLCBuYW1lLCBleHRyYSApO1xuXHRcdFx0XHRcdH0pIDpcblx0XHRcdFx0XHRnZXRXaWR0aE9ySGVpZ2h0KCBlbGVtLCBuYW1lLCBleHRyYSApO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRzZXQ6IGZ1bmN0aW9uKCBlbGVtLCB2YWx1ZSwgZXh0cmEgKSB7XG5cdFx0XHR2YXIgc3R5bGVzID0gZXh0cmEgJiYgZ2V0U3R5bGVzKCBlbGVtICk7XG5cdFx0XHRyZXR1cm4gc2V0UG9zaXRpdmVOdW1iZXIoIGVsZW0sIHZhbHVlLCBleHRyYSA/XG5cdFx0XHRcdGF1Z21lbnRXaWR0aE9ySGVpZ2h0KFxuXHRcdFx0XHRcdGVsZW0sXG5cdFx0XHRcdFx0bmFtZSxcblx0XHRcdFx0XHRleHRyYSxcblx0XHRcdFx0XHRqUXVlcnkuY3NzKCBlbGVtLCBcImJveFNpemluZ1wiLCBmYWxzZSwgc3R5bGVzICkgPT09IFwiYm9yZGVyLWJveFwiLFxuXHRcdFx0XHRcdHN0eWxlc1xuXHRcdFx0XHQpIDogMFxuXHRcdFx0KTtcblx0XHR9XG5cdH07XG59KTtcblxuLy8gU3VwcG9ydDogQW5kcm9pZCAyLjNcbmpRdWVyeS5jc3NIb29rcy5tYXJnaW5SaWdodCA9IGFkZEdldEhvb2tJZiggc3VwcG9ydC5yZWxpYWJsZU1hcmdpblJpZ2h0LFxuXHRmdW5jdGlvbiggZWxlbSwgY29tcHV0ZWQgKSB7XG5cdFx0aWYgKCBjb21wdXRlZCApIHtcblx0XHRcdC8vIFdlYktpdCBCdWcgMTMzNDMgLSBnZXRDb21wdXRlZFN0eWxlIHJldHVybnMgd3JvbmcgdmFsdWUgZm9yIG1hcmdpbi1yaWdodFxuXHRcdFx0Ly8gV29yayBhcm91bmQgYnkgdGVtcG9yYXJpbHkgc2V0dGluZyBlbGVtZW50IGRpc3BsYXkgdG8gaW5saW5lLWJsb2NrXG5cdFx0XHRyZXR1cm4galF1ZXJ5LnN3YXAoIGVsZW0sIHsgXCJkaXNwbGF5XCI6IFwiaW5saW5lLWJsb2NrXCIgfSxcblx0XHRcdFx0Y3VyQ1NTLCBbIGVsZW0sIFwibWFyZ2luUmlnaHRcIiBdICk7XG5cdFx0fVxuXHR9XG4pO1xuXG4vLyBUaGVzZSBob29rcyBhcmUgdXNlZCBieSBhbmltYXRlIHRvIGV4cGFuZCBwcm9wZXJ0aWVzXG5qUXVlcnkuZWFjaCh7XG5cdG1hcmdpbjogXCJcIixcblx0cGFkZGluZzogXCJcIixcblx0Ym9yZGVyOiBcIldpZHRoXCJcbn0sIGZ1bmN0aW9uKCBwcmVmaXgsIHN1ZmZpeCApIHtcblx0alF1ZXJ5LmNzc0hvb2tzWyBwcmVmaXggKyBzdWZmaXggXSA9IHtcblx0XHRleHBhbmQ6IGZ1bmN0aW9uKCB2YWx1ZSApIHtcblx0XHRcdHZhciBpID0gMCxcblx0XHRcdFx0ZXhwYW5kZWQgPSB7fSxcblxuXHRcdFx0XHQvLyBhc3N1bWVzIGEgc2luZ2xlIG51bWJlciBpZiBub3QgYSBzdHJpbmdcblx0XHRcdFx0cGFydHMgPSB0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgPyB2YWx1ZS5zcGxpdChcIiBcIikgOiBbIHZhbHVlIF07XG5cblx0XHRcdGZvciAoIDsgaSA8IDQ7IGkrKyApIHtcblx0XHRcdFx0ZXhwYW5kZWRbIHByZWZpeCArIGNzc0V4cGFuZFsgaSBdICsgc3VmZml4IF0gPVxuXHRcdFx0XHRcdHBhcnRzWyBpIF0gfHwgcGFydHNbIGkgLSAyIF0gfHwgcGFydHNbIDAgXTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGV4cGFuZGVkO1xuXHRcdH1cblx0fTtcblxuXHRpZiAoICFybWFyZ2luLnRlc3QoIHByZWZpeCApICkge1xuXHRcdGpRdWVyeS5jc3NIb29rc1sgcHJlZml4ICsgc3VmZml4IF0uc2V0ID0gc2V0UG9zaXRpdmVOdW1iZXI7XG5cdH1cbn0pO1xuXG5qUXVlcnkuZm4uZXh0ZW5kKHtcblx0Y3NzOiBmdW5jdGlvbiggbmFtZSwgdmFsdWUgKSB7XG5cdFx0cmV0dXJuIGFjY2VzcyggdGhpcywgZnVuY3Rpb24oIGVsZW0sIG5hbWUsIHZhbHVlICkge1xuXHRcdFx0dmFyIHN0eWxlcywgbGVuLFxuXHRcdFx0XHRtYXAgPSB7fSxcblx0XHRcdFx0aSA9IDA7XG5cblx0XHRcdGlmICggalF1ZXJ5LmlzQXJyYXkoIG5hbWUgKSApIHtcblx0XHRcdFx0c3R5bGVzID0gZ2V0U3R5bGVzKCBlbGVtICk7XG5cdFx0XHRcdGxlbiA9IG5hbWUubGVuZ3RoO1xuXG5cdFx0XHRcdGZvciAoIDsgaSA8IGxlbjsgaSsrICkge1xuXHRcdFx0XHRcdG1hcFsgbmFtZVsgaSBdIF0gPSBqUXVlcnkuY3NzKCBlbGVtLCBuYW1lWyBpIF0sIGZhbHNlLCBzdHlsZXMgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBtYXA7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB2YWx1ZSAhPT0gdW5kZWZpbmVkID9cblx0XHRcdFx0alF1ZXJ5LnN0eWxlKCBlbGVtLCBuYW1lLCB2YWx1ZSApIDpcblx0XHRcdFx0alF1ZXJ5LmNzcyggZWxlbSwgbmFtZSApO1xuXHRcdH0sIG5hbWUsIHZhbHVlLCBhcmd1bWVudHMubGVuZ3RoID4gMSApO1xuXHR9LFxuXHRzaG93OiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gc2hvd0hpZGUoIHRoaXMsIHRydWUgKTtcblx0fSxcblx0aGlkZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHNob3dIaWRlKCB0aGlzICk7XG5cdH0sXG5cdHRvZ2dsZTogZnVuY3Rpb24oIHN0YXRlICkge1xuXHRcdGlmICggdHlwZW9mIHN0YXRlID09PSBcImJvb2xlYW5cIiApIHtcblx0XHRcdHJldHVybiBzdGF0ZSA/IHRoaXMuc2hvdygpIDogdGhpcy5oaWRlKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdGlmICggaXNIaWRkZW4oIHRoaXMgKSApIHtcblx0XHRcdFx0alF1ZXJ5KCB0aGlzICkuc2hvdygpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0alF1ZXJ5KCB0aGlzICkuaGlkZSgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59KTtcblxuXG5mdW5jdGlvbiBUd2VlbiggZWxlbSwgb3B0aW9ucywgcHJvcCwgZW5kLCBlYXNpbmcgKSB7XG5cdHJldHVybiBuZXcgVHdlZW4ucHJvdG90eXBlLmluaXQoIGVsZW0sIG9wdGlvbnMsIHByb3AsIGVuZCwgZWFzaW5nICk7XG59XG5qUXVlcnkuVHdlZW4gPSBUd2VlbjtcblxuVHdlZW4ucHJvdG90eXBlID0ge1xuXHRjb25zdHJ1Y3RvcjogVHdlZW4sXG5cdGluaXQ6IGZ1bmN0aW9uKCBlbGVtLCBvcHRpb25zLCBwcm9wLCBlbmQsIGVhc2luZywgdW5pdCApIHtcblx0XHR0aGlzLmVsZW0gPSBlbGVtO1xuXHRcdHRoaXMucHJvcCA9IHByb3A7XG5cdFx0dGhpcy5lYXNpbmcgPSBlYXNpbmcgfHwgXCJzd2luZ1wiO1xuXHRcdHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cdFx0dGhpcy5zdGFydCA9IHRoaXMubm93ID0gdGhpcy5jdXIoKTtcblx0XHR0aGlzLmVuZCA9IGVuZDtcblx0XHR0aGlzLnVuaXQgPSB1bml0IHx8ICggalF1ZXJ5LmNzc051bWJlclsgcHJvcCBdID8gXCJcIiA6IFwicHhcIiApO1xuXHR9LFxuXHRjdXI6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBob29rcyA9IFR3ZWVuLnByb3BIb29rc1sgdGhpcy5wcm9wIF07XG5cblx0XHRyZXR1cm4gaG9va3MgJiYgaG9va3MuZ2V0ID9cblx0XHRcdGhvb2tzLmdldCggdGhpcyApIDpcblx0XHRcdFR3ZWVuLnByb3BIb29rcy5fZGVmYXVsdC5nZXQoIHRoaXMgKTtcblx0fSxcblx0cnVuOiBmdW5jdGlvbiggcGVyY2VudCApIHtcblx0XHR2YXIgZWFzZWQsXG5cdFx0XHRob29rcyA9IFR3ZWVuLnByb3BIb29rc1sgdGhpcy5wcm9wIF07XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5kdXJhdGlvbiApIHtcblx0XHRcdHRoaXMucG9zID0gZWFzZWQgPSBqUXVlcnkuZWFzaW5nWyB0aGlzLmVhc2luZyBdKFxuXHRcdFx0XHRwZXJjZW50LCB0aGlzLm9wdGlvbnMuZHVyYXRpb24gKiBwZXJjZW50LCAwLCAxLCB0aGlzLm9wdGlvbnMuZHVyYXRpb25cblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMucG9zID0gZWFzZWQgPSBwZXJjZW50O1xuXHRcdH1cblx0XHR0aGlzLm5vdyA9ICggdGhpcy5lbmQgLSB0aGlzLnN0YXJ0ICkgKiBlYXNlZCArIHRoaXMuc3RhcnQ7XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5zdGVwICkge1xuXHRcdFx0dGhpcy5vcHRpb25zLnN0ZXAuY2FsbCggdGhpcy5lbGVtLCB0aGlzLm5vdywgdGhpcyApO1xuXHRcdH1cblxuXHRcdGlmICggaG9va3MgJiYgaG9va3Muc2V0ICkge1xuXHRcdFx0aG9va3Muc2V0KCB0aGlzICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdFR3ZWVuLnByb3BIb29rcy5fZGVmYXVsdC5zZXQoIHRoaXMgKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn07XG5cblR3ZWVuLnByb3RvdHlwZS5pbml0LnByb3RvdHlwZSA9IFR3ZWVuLnByb3RvdHlwZTtcblxuVHdlZW4ucHJvcEhvb2tzID0ge1xuXHRfZGVmYXVsdDoge1xuXHRcdGdldDogZnVuY3Rpb24oIHR3ZWVuICkge1xuXHRcdFx0dmFyIHJlc3VsdDtcblxuXHRcdFx0aWYgKCB0d2Vlbi5lbGVtWyB0d2Vlbi5wcm9wIF0gIT0gbnVsbCAmJlxuXHRcdFx0XHQoIXR3ZWVuLmVsZW0uc3R5bGUgfHwgdHdlZW4uZWxlbS5zdHlsZVsgdHdlZW4ucHJvcCBdID09IG51bGwpICkge1xuXHRcdFx0XHRyZXR1cm4gdHdlZW4uZWxlbVsgdHdlZW4ucHJvcCBdO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBwYXNzaW5nIGFuIGVtcHR5IHN0cmluZyBhcyBhIDNyZCBwYXJhbWV0ZXIgdG8gLmNzcyB3aWxsIGF1dG9tYXRpY2FsbHlcblx0XHRcdC8vIGF0dGVtcHQgYSBwYXJzZUZsb2F0IGFuZCBmYWxsYmFjayB0byBhIHN0cmluZyBpZiB0aGUgcGFyc2UgZmFpbHNcblx0XHRcdC8vIHNvLCBzaW1wbGUgdmFsdWVzIHN1Y2ggYXMgXCIxMHB4XCIgYXJlIHBhcnNlZCB0byBGbG9hdC5cblx0XHRcdC8vIGNvbXBsZXggdmFsdWVzIHN1Y2ggYXMgXCJyb3RhdGUoMXJhZClcIiBhcmUgcmV0dXJuZWQgYXMgaXMuXG5cdFx0XHRyZXN1bHQgPSBqUXVlcnkuY3NzKCB0d2Vlbi5lbGVtLCB0d2Vlbi5wcm9wLCBcIlwiICk7XG5cdFx0XHQvLyBFbXB0eSBzdHJpbmdzLCBudWxsLCB1bmRlZmluZWQgYW5kIFwiYXV0b1wiIGFyZSBjb252ZXJ0ZWQgdG8gMC5cblx0XHRcdHJldHVybiAhcmVzdWx0IHx8IHJlc3VsdCA9PT0gXCJhdXRvXCIgPyAwIDogcmVzdWx0O1xuXHRcdH0sXG5cdFx0c2V0OiBmdW5jdGlvbiggdHdlZW4gKSB7XG5cdFx0XHQvLyB1c2Ugc3RlcCBob29rIGZvciBiYWNrIGNvbXBhdCAtIHVzZSBjc3NIb29rIGlmIGl0cyB0aGVyZSAtIHVzZSAuc3R5bGUgaWYgaXRzXG5cdFx0XHQvLyBhdmFpbGFibGUgYW5kIHVzZSBwbGFpbiBwcm9wZXJ0aWVzIHdoZXJlIGF2YWlsYWJsZVxuXHRcdFx0aWYgKCBqUXVlcnkuZnguc3RlcFsgdHdlZW4ucHJvcCBdICkge1xuXHRcdFx0XHRqUXVlcnkuZnguc3RlcFsgdHdlZW4ucHJvcCBdKCB0d2VlbiApO1xuXHRcdFx0fSBlbHNlIGlmICggdHdlZW4uZWxlbS5zdHlsZSAmJiAoIHR3ZWVuLmVsZW0uc3R5bGVbIGpRdWVyeS5jc3NQcm9wc1sgdHdlZW4ucHJvcCBdIF0gIT0gbnVsbCB8fCBqUXVlcnkuY3NzSG9va3NbIHR3ZWVuLnByb3AgXSApICkge1xuXHRcdFx0XHRqUXVlcnkuc3R5bGUoIHR3ZWVuLmVsZW0sIHR3ZWVuLnByb3AsIHR3ZWVuLm5vdyArIHR3ZWVuLnVuaXQgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHR3ZWVuLmVsZW1bIHR3ZWVuLnByb3AgXSA9IHR3ZWVuLm5vdztcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5cbi8vIFN1cHBvcnQ6IElFOVxuLy8gUGFuaWMgYmFzZWQgYXBwcm9hY2ggdG8gc2V0dGluZyB0aGluZ3Mgb24gZGlzY29ubmVjdGVkIG5vZGVzXG5cblR3ZWVuLnByb3BIb29rcy5zY3JvbGxUb3AgPSBUd2Vlbi5wcm9wSG9va3Muc2Nyb2xsTGVmdCA9IHtcblx0c2V0OiBmdW5jdGlvbiggdHdlZW4gKSB7XG5cdFx0aWYgKCB0d2Vlbi5lbGVtLm5vZGVUeXBlICYmIHR3ZWVuLmVsZW0ucGFyZW50Tm9kZSApIHtcblx0XHRcdHR3ZWVuLmVsZW1bIHR3ZWVuLnByb3AgXSA9IHR3ZWVuLm5vdztcblx0XHR9XG5cdH1cbn07XG5cbmpRdWVyeS5lYXNpbmcgPSB7XG5cdGxpbmVhcjogZnVuY3Rpb24oIHAgKSB7XG5cdFx0cmV0dXJuIHA7XG5cdH0sXG5cdHN3aW5nOiBmdW5jdGlvbiggcCApIHtcblx0XHRyZXR1cm4gMC41IC0gTWF0aC5jb3MoIHAgKiBNYXRoLlBJICkgLyAyO1xuXHR9XG59O1xuXG5qUXVlcnkuZnggPSBUd2Vlbi5wcm90b3R5cGUuaW5pdDtcblxuLy8gQmFjayBDb21wYXQgPDEuOCBleHRlbnNpb24gcG9pbnRcbmpRdWVyeS5meC5zdGVwID0ge307XG5cblxuXG5cbnZhclxuXHRmeE5vdywgdGltZXJJZCxcblx0cmZ4dHlwZXMgPSAvXig/OnRvZ2dsZXxzaG93fGhpZGUpJC8sXG5cdHJmeG51bSA9IG5ldyBSZWdFeHAoIFwiXig/OihbKy1dKT18KShcIiArIHBudW0gKyBcIikoW2EteiVdKikkXCIsIFwiaVwiICksXG5cdHJydW4gPSAvcXVldWVIb29rcyQvLFxuXHRhbmltYXRpb25QcmVmaWx0ZXJzID0gWyBkZWZhdWx0UHJlZmlsdGVyIF0sXG5cdHR3ZWVuZXJzID0ge1xuXHRcdFwiKlwiOiBbIGZ1bmN0aW9uKCBwcm9wLCB2YWx1ZSApIHtcblx0XHRcdHZhciB0d2VlbiA9IHRoaXMuY3JlYXRlVHdlZW4oIHByb3AsIHZhbHVlICksXG5cdFx0XHRcdHRhcmdldCA9IHR3ZWVuLmN1cigpLFxuXHRcdFx0XHRwYXJ0cyA9IHJmeG51bS5leGVjKCB2YWx1ZSApLFxuXHRcdFx0XHR1bml0ID0gcGFydHMgJiYgcGFydHNbIDMgXSB8fCAoIGpRdWVyeS5jc3NOdW1iZXJbIHByb3AgXSA/IFwiXCIgOiBcInB4XCIgKSxcblxuXHRcdFx0XHQvLyBTdGFydGluZyB2YWx1ZSBjb21wdXRhdGlvbiBpcyByZXF1aXJlZCBmb3IgcG90ZW50aWFsIHVuaXQgbWlzbWF0Y2hlc1xuXHRcdFx0XHRzdGFydCA9ICggalF1ZXJ5LmNzc051bWJlclsgcHJvcCBdIHx8IHVuaXQgIT09IFwicHhcIiAmJiArdGFyZ2V0ICkgJiZcblx0XHRcdFx0XHRyZnhudW0uZXhlYyggalF1ZXJ5LmNzcyggdHdlZW4uZWxlbSwgcHJvcCApICksXG5cdFx0XHRcdHNjYWxlID0gMSxcblx0XHRcdFx0bWF4SXRlcmF0aW9ucyA9IDIwO1xuXG5cdFx0XHRpZiAoIHN0YXJ0ICYmIHN0YXJ0WyAzIF0gIT09IHVuaXQgKSB7XG5cdFx0XHRcdC8vIFRydXN0IHVuaXRzIHJlcG9ydGVkIGJ5IGpRdWVyeS5jc3Ncblx0XHRcdFx0dW5pdCA9IHVuaXQgfHwgc3RhcnRbIDMgXTtcblxuXHRcdFx0XHQvLyBNYWtlIHN1cmUgd2UgdXBkYXRlIHRoZSB0d2VlbiBwcm9wZXJ0aWVzIGxhdGVyIG9uXG5cdFx0XHRcdHBhcnRzID0gcGFydHMgfHwgW107XG5cblx0XHRcdFx0Ly8gSXRlcmF0aXZlbHkgYXBwcm94aW1hdGUgZnJvbSBhIG5vbnplcm8gc3RhcnRpbmcgcG9pbnRcblx0XHRcdFx0c3RhcnQgPSArdGFyZ2V0IHx8IDE7XG5cblx0XHRcdFx0ZG8ge1xuXHRcdFx0XHRcdC8vIElmIHByZXZpb3VzIGl0ZXJhdGlvbiB6ZXJvZWQgb3V0LCBkb3VibGUgdW50aWwgd2UgZ2V0ICpzb21ldGhpbmcqXG5cdFx0XHRcdFx0Ly8gVXNlIGEgc3RyaW5nIGZvciBkb3VibGluZyBmYWN0b3Igc28gd2UgZG9uJ3QgYWNjaWRlbnRhbGx5IHNlZSBzY2FsZSBhcyB1bmNoYW5nZWQgYmVsb3dcblx0XHRcdFx0XHRzY2FsZSA9IHNjYWxlIHx8IFwiLjVcIjtcblxuXHRcdFx0XHRcdC8vIEFkanVzdCBhbmQgYXBwbHlcblx0XHRcdFx0XHRzdGFydCA9IHN0YXJ0IC8gc2NhbGU7XG5cdFx0XHRcdFx0alF1ZXJ5LnN0eWxlKCB0d2Vlbi5lbGVtLCBwcm9wLCBzdGFydCArIHVuaXQgKTtcblxuXHRcdFx0XHQvLyBVcGRhdGUgc2NhbGUsIHRvbGVyYXRpbmcgemVybyBvciBOYU4gZnJvbSB0d2Vlbi5jdXIoKVxuXHRcdFx0XHQvLyBBbmQgYnJlYWtpbmcgdGhlIGxvb3AgaWYgc2NhbGUgaXMgdW5jaGFuZ2VkIG9yIHBlcmZlY3QsIG9yIGlmIHdlJ3ZlIGp1c3QgaGFkIGVub3VnaFxuXHRcdFx0XHR9IHdoaWxlICggc2NhbGUgIT09IChzY2FsZSA9IHR3ZWVuLmN1cigpIC8gdGFyZ2V0KSAmJiBzY2FsZSAhPT0gMSAmJiAtLW1heEl0ZXJhdGlvbnMgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gVXBkYXRlIHR3ZWVuIHByb3BlcnRpZXNcblx0XHRcdGlmICggcGFydHMgKSB7XG5cdFx0XHRcdHN0YXJ0ID0gdHdlZW4uc3RhcnQgPSArc3RhcnQgfHwgK3RhcmdldCB8fCAwO1xuXHRcdFx0XHR0d2Vlbi51bml0ID0gdW5pdDtcblx0XHRcdFx0Ly8gSWYgYSArPS8tPSB0b2tlbiB3YXMgcHJvdmlkZWQsIHdlJ3JlIGRvaW5nIGEgcmVsYXRpdmUgYW5pbWF0aW9uXG5cdFx0XHRcdHR3ZWVuLmVuZCA9IHBhcnRzWyAxIF0gP1xuXHRcdFx0XHRcdHN0YXJ0ICsgKCBwYXJ0c1sgMSBdICsgMSApICogcGFydHNbIDIgXSA6XG5cdFx0XHRcdFx0K3BhcnRzWyAyIF07XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0d2Vlbjtcblx0XHR9IF1cblx0fTtcblxuLy8gQW5pbWF0aW9ucyBjcmVhdGVkIHN5bmNocm9ub3VzbHkgd2lsbCBydW4gc3luY2hyb25vdXNseVxuZnVuY3Rpb24gY3JlYXRlRnhOb3coKSB7XG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0ZnhOb3cgPSB1bmRlZmluZWQ7XG5cdH0pO1xuXHRyZXR1cm4gKCBmeE5vdyA9IGpRdWVyeS5ub3coKSApO1xufVxuXG4vLyBHZW5lcmF0ZSBwYXJhbWV0ZXJzIHRvIGNyZWF0ZSBhIHN0YW5kYXJkIGFuaW1hdGlvblxuZnVuY3Rpb24gZ2VuRngoIHR5cGUsIGluY2x1ZGVXaWR0aCApIHtcblx0dmFyIHdoaWNoLFxuXHRcdGkgPSAwLFxuXHRcdGF0dHJzID0geyBoZWlnaHQ6IHR5cGUgfTtcblxuXHQvLyBpZiB3ZSBpbmNsdWRlIHdpZHRoLCBzdGVwIHZhbHVlIGlzIDEgdG8gZG8gYWxsIGNzc0V4cGFuZCB2YWx1ZXMsXG5cdC8vIGlmIHdlIGRvbid0IGluY2x1ZGUgd2lkdGgsIHN0ZXAgdmFsdWUgaXMgMiB0byBza2lwIG92ZXIgTGVmdCBhbmQgUmlnaHRcblx0aW5jbHVkZVdpZHRoID0gaW5jbHVkZVdpZHRoID8gMSA6IDA7XG5cdGZvciAoIDsgaSA8IDQgOyBpICs9IDIgLSBpbmNsdWRlV2lkdGggKSB7XG5cdFx0d2hpY2ggPSBjc3NFeHBhbmRbIGkgXTtcblx0XHRhdHRyc1sgXCJtYXJnaW5cIiArIHdoaWNoIF0gPSBhdHRyc1sgXCJwYWRkaW5nXCIgKyB3aGljaCBdID0gdHlwZTtcblx0fVxuXG5cdGlmICggaW5jbHVkZVdpZHRoICkge1xuXHRcdGF0dHJzLm9wYWNpdHkgPSBhdHRycy53aWR0aCA9IHR5cGU7XG5cdH1cblxuXHRyZXR1cm4gYXR0cnM7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVR3ZWVuKCB2YWx1ZSwgcHJvcCwgYW5pbWF0aW9uICkge1xuXHR2YXIgdHdlZW4sXG5cdFx0Y29sbGVjdGlvbiA9ICggdHdlZW5lcnNbIHByb3AgXSB8fCBbXSApLmNvbmNhdCggdHdlZW5lcnNbIFwiKlwiIF0gKSxcblx0XHRpbmRleCA9IDAsXG5cdFx0bGVuZ3RoID0gY29sbGVjdGlvbi5sZW5ndGg7XG5cdGZvciAoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KysgKSB7XG5cdFx0aWYgKCAodHdlZW4gPSBjb2xsZWN0aW9uWyBpbmRleCBdLmNhbGwoIGFuaW1hdGlvbiwgcHJvcCwgdmFsdWUgKSkgKSB7XG5cblx0XHRcdC8vIHdlJ3JlIGRvbmUgd2l0aCB0aGlzIHByb3BlcnR5XG5cdFx0XHRyZXR1cm4gdHdlZW47XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRQcmVmaWx0ZXIoIGVsZW0sIHByb3BzLCBvcHRzICkge1xuXHQvKiBqc2hpbnQgdmFsaWR0aGlzOiB0cnVlICovXG5cdHZhciBwcm9wLCB2YWx1ZSwgdG9nZ2xlLCB0d2VlbiwgaG9va3MsIG9sZGZpcmUsIGRpc3BsYXksXG5cdFx0YW5pbSA9IHRoaXMsXG5cdFx0b3JpZyA9IHt9LFxuXHRcdHN0eWxlID0gZWxlbS5zdHlsZSxcblx0XHRoaWRkZW4gPSBlbGVtLm5vZGVUeXBlICYmIGlzSGlkZGVuKCBlbGVtICksXG5cdFx0ZGF0YVNob3cgPSBkYXRhX3ByaXYuZ2V0KCBlbGVtLCBcImZ4c2hvd1wiICk7XG5cblx0Ly8gaGFuZGxlIHF1ZXVlOiBmYWxzZSBwcm9taXNlc1xuXHRpZiAoICFvcHRzLnF1ZXVlICkge1xuXHRcdGhvb2tzID0galF1ZXJ5Ll9xdWV1ZUhvb2tzKCBlbGVtLCBcImZ4XCIgKTtcblx0XHRpZiAoIGhvb2tzLnVucXVldWVkID09IG51bGwgKSB7XG5cdFx0XHRob29rcy51bnF1ZXVlZCA9IDA7XG5cdFx0XHRvbGRmaXJlID0gaG9va3MuZW1wdHkuZmlyZTtcblx0XHRcdGhvb2tzLmVtcHR5LmZpcmUgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKCAhaG9va3MudW5xdWV1ZWQgKSB7XG5cdFx0XHRcdFx0b2xkZmlyZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH1cblx0XHRob29rcy51bnF1ZXVlZCsrO1xuXG5cdFx0YW5pbS5hbHdheXMoZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBkb2luZyB0aGlzIG1ha2VzIHN1cmUgdGhhdCB0aGUgY29tcGxldGUgaGFuZGxlciB3aWxsIGJlIGNhbGxlZFxuXHRcdFx0Ly8gYmVmb3JlIHRoaXMgY29tcGxldGVzXG5cdFx0XHRhbmltLmFsd2F5cyhmdW5jdGlvbigpIHtcblx0XHRcdFx0aG9va3MudW5xdWV1ZWQtLTtcblx0XHRcdFx0aWYgKCAhalF1ZXJ5LnF1ZXVlKCBlbGVtLCBcImZ4XCIgKS5sZW5ndGggKSB7XG5cdFx0XHRcdFx0aG9va3MuZW1wdHkuZmlyZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIGhlaWdodC93aWR0aCBvdmVyZmxvdyBwYXNzXG5cdGlmICggZWxlbS5ub2RlVHlwZSA9PT0gMSAmJiAoIFwiaGVpZ2h0XCIgaW4gcHJvcHMgfHwgXCJ3aWR0aFwiIGluIHByb3BzICkgKSB7XG5cdFx0Ly8gTWFrZSBzdXJlIHRoYXQgbm90aGluZyBzbmVha3Mgb3V0XG5cdFx0Ly8gUmVjb3JkIGFsbCAzIG92ZXJmbG93IGF0dHJpYnV0ZXMgYmVjYXVzZSBJRTktMTAgZG8gbm90XG5cdFx0Ly8gY2hhbmdlIHRoZSBvdmVyZmxvdyBhdHRyaWJ1dGUgd2hlbiBvdmVyZmxvd1ggYW5kXG5cdFx0Ly8gb3ZlcmZsb3dZIGFyZSBzZXQgdG8gdGhlIHNhbWUgdmFsdWVcblx0XHRvcHRzLm92ZXJmbG93ID0gWyBzdHlsZS5vdmVyZmxvdywgc3R5bGUub3ZlcmZsb3dYLCBzdHlsZS5vdmVyZmxvd1kgXTtcblxuXHRcdC8vIFNldCBkaXNwbGF5IHByb3BlcnR5IHRvIGlubGluZS1ibG9jayBmb3IgaGVpZ2h0L3dpZHRoXG5cdFx0Ly8gYW5pbWF0aW9ucyBvbiBpbmxpbmUgZWxlbWVudHMgdGhhdCBhcmUgaGF2aW5nIHdpZHRoL2hlaWdodCBhbmltYXRlZFxuXHRcdGRpc3BsYXkgPSBqUXVlcnkuY3NzKCBlbGVtLCBcImRpc3BsYXlcIiApO1xuXHRcdC8vIEdldCBkZWZhdWx0IGRpc3BsYXkgaWYgZGlzcGxheSBpcyBjdXJyZW50bHkgXCJub25lXCJcblx0XHRpZiAoIGRpc3BsYXkgPT09IFwibm9uZVwiICkge1xuXHRcdFx0ZGlzcGxheSA9IGRlZmF1bHREaXNwbGF5KCBlbGVtLm5vZGVOYW1lICk7XG5cdFx0fVxuXHRcdGlmICggZGlzcGxheSA9PT0gXCJpbmxpbmVcIiAmJlxuXHRcdFx0XHRqUXVlcnkuY3NzKCBlbGVtLCBcImZsb2F0XCIgKSA9PT0gXCJub25lXCIgKSB7XG5cblx0XHRcdHN0eWxlLmRpc3BsYXkgPSBcImlubGluZS1ibG9ja1wiO1xuXHRcdH1cblx0fVxuXG5cdGlmICggb3B0cy5vdmVyZmxvdyApIHtcblx0XHRzdHlsZS5vdmVyZmxvdyA9IFwiaGlkZGVuXCI7XG5cdFx0YW5pbS5hbHdheXMoZnVuY3Rpb24oKSB7XG5cdFx0XHRzdHlsZS5vdmVyZmxvdyA9IG9wdHMub3ZlcmZsb3dbIDAgXTtcblx0XHRcdHN0eWxlLm92ZXJmbG93WCA9IG9wdHMub3ZlcmZsb3dbIDEgXTtcblx0XHRcdHN0eWxlLm92ZXJmbG93WSA9IG9wdHMub3ZlcmZsb3dbIDIgXTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIHNob3cvaGlkZSBwYXNzXG5cdGZvciAoIHByb3AgaW4gcHJvcHMgKSB7XG5cdFx0dmFsdWUgPSBwcm9wc1sgcHJvcCBdO1xuXHRcdGlmICggcmZ4dHlwZXMuZXhlYyggdmFsdWUgKSApIHtcblx0XHRcdGRlbGV0ZSBwcm9wc1sgcHJvcCBdO1xuXHRcdFx0dG9nZ2xlID0gdG9nZ2xlIHx8IHZhbHVlID09PSBcInRvZ2dsZVwiO1xuXHRcdFx0aWYgKCB2YWx1ZSA9PT0gKCBoaWRkZW4gPyBcImhpZGVcIiA6IFwic2hvd1wiICkgKSB7XG5cblx0XHRcdFx0Ly8gSWYgdGhlcmUgaXMgZGF0YVNob3cgbGVmdCBvdmVyIGZyb20gYSBzdG9wcGVkIGhpZGUgb3Igc2hvdyBhbmQgd2UgYXJlIGdvaW5nIHRvIHByb2NlZWQgd2l0aCBzaG93LCB3ZSBzaG91bGQgcHJldGVuZCB0byBiZSBoaWRkZW5cblx0XHRcdFx0aWYgKCB2YWx1ZSA9PT0gXCJzaG93XCIgJiYgZGF0YVNob3cgJiYgZGF0YVNob3dbIHByb3AgXSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRcdGhpZGRlbiA9IHRydWU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdG9yaWdbIHByb3AgXSA9IGRhdGFTaG93ICYmIGRhdGFTaG93WyBwcm9wIF0gfHwgalF1ZXJ5LnN0eWxlKCBlbGVtLCBwcm9wICk7XG5cdFx0fVxuXHR9XG5cblx0aWYgKCAhalF1ZXJ5LmlzRW1wdHlPYmplY3QoIG9yaWcgKSApIHtcblx0XHRpZiAoIGRhdGFTaG93ICkge1xuXHRcdFx0aWYgKCBcImhpZGRlblwiIGluIGRhdGFTaG93ICkge1xuXHRcdFx0XHRoaWRkZW4gPSBkYXRhU2hvdy5oaWRkZW47XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGRhdGFTaG93ID0gZGF0YV9wcml2LmFjY2VzcyggZWxlbSwgXCJmeHNob3dcIiwge30gKTtcblx0XHR9XG5cblx0XHQvLyBzdG9yZSBzdGF0ZSBpZiBpdHMgdG9nZ2xlIC0gZW5hYmxlcyAuc3RvcCgpLnRvZ2dsZSgpIHRvIFwicmV2ZXJzZVwiXG5cdFx0aWYgKCB0b2dnbGUgKSB7XG5cdFx0XHRkYXRhU2hvdy5oaWRkZW4gPSAhaGlkZGVuO1xuXHRcdH1cblx0XHRpZiAoIGhpZGRlbiApIHtcblx0XHRcdGpRdWVyeSggZWxlbSApLnNob3coKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YW5pbS5kb25lKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRqUXVlcnkoIGVsZW0gKS5oaWRlKCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0YW5pbS5kb25lKGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHByb3A7XG5cblx0XHRcdGRhdGFfcHJpdi5yZW1vdmUoIGVsZW0sIFwiZnhzaG93XCIgKTtcblx0XHRcdGZvciAoIHByb3AgaW4gb3JpZyApIHtcblx0XHRcdFx0alF1ZXJ5LnN0eWxlKCBlbGVtLCBwcm9wLCBvcmlnWyBwcm9wIF0gKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRmb3IgKCBwcm9wIGluIG9yaWcgKSB7XG5cdFx0XHR0d2VlbiA9IGNyZWF0ZVR3ZWVuKCBoaWRkZW4gPyBkYXRhU2hvd1sgcHJvcCBdIDogMCwgcHJvcCwgYW5pbSApO1xuXG5cdFx0XHRpZiAoICEoIHByb3AgaW4gZGF0YVNob3cgKSApIHtcblx0XHRcdFx0ZGF0YVNob3dbIHByb3AgXSA9IHR3ZWVuLnN0YXJ0O1xuXHRcdFx0XHRpZiAoIGhpZGRlbiApIHtcblx0XHRcdFx0XHR0d2Vlbi5lbmQgPSB0d2Vlbi5zdGFydDtcblx0XHRcdFx0XHR0d2Vlbi5zdGFydCA9IHByb3AgPT09IFwid2lkdGhcIiB8fCBwcm9wID09PSBcImhlaWdodFwiID8gMSA6IDA7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gcHJvcEZpbHRlciggcHJvcHMsIHNwZWNpYWxFYXNpbmcgKSB7XG5cdHZhciBpbmRleCwgbmFtZSwgZWFzaW5nLCB2YWx1ZSwgaG9va3M7XG5cblx0Ly8gY2FtZWxDYXNlLCBzcGVjaWFsRWFzaW5nIGFuZCBleHBhbmQgY3NzSG9vayBwYXNzXG5cdGZvciAoIGluZGV4IGluIHByb3BzICkge1xuXHRcdG5hbWUgPSBqUXVlcnkuY2FtZWxDYXNlKCBpbmRleCApO1xuXHRcdGVhc2luZyA9IHNwZWNpYWxFYXNpbmdbIG5hbWUgXTtcblx0XHR2YWx1ZSA9IHByb3BzWyBpbmRleCBdO1xuXHRcdGlmICggalF1ZXJ5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG5cdFx0XHRlYXNpbmcgPSB2YWx1ZVsgMSBdO1xuXHRcdFx0dmFsdWUgPSBwcm9wc1sgaW5kZXggXSA9IHZhbHVlWyAwIF07XG5cdFx0fVxuXG5cdFx0aWYgKCBpbmRleCAhPT0gbmFtZSApIHtcblx0XHRcdHByb3BzWyBuYW1lIF0gPSB2YWx1ZTtcblx0XHRcdGRlbGV0ZSBwcm9wc1sgaW5kZXggXTtcblx0XHR9XG5cblx0XHRob29rcyA9IGpRdWVyeS5jc3NIb29rc1sgbmFtZSBdO1xuXHRcdGlmICggaG9va3MgJiYgXCJleHBhbmRcIiBpbiBob29rcyApIHtcblx0XHRcdHZhbHVlID0gaG9va3MuZXhwYW5kKCB2YWx1ZSApO1xuXHRcdFx0ZGVsZXRlIHByb3BzWyBuYW1lIF07XG5cblx0XHRcdC8vIG5vdCBxdWl0ZSAkLmV4dGVuZCwgdGhpcyB3b250IG92ZXJ3cml0ZSBrZXlzIGFscmVhZHkgcHJlc2VudC5cblx0XHRcdC8vIGFsc28gLSByZXVzaW5nICdpbmRleCcgZnJvbSBhYm92ZSBiZWNhdXNlIHdlIGhhdmUgdGhlIGNvcnJlY3QgXCJuYW1lXCJcblx0XHRcdGZvciAoIGluZGV4IGluIHZhbHVlICkge1xuXHRcdFx0XHRpZiAoICEoIGluZGV4IGluIHByb3BzICkgKSB7XG5cdFx0XHRcdFx0cHJvcHNbIGluZGV4IF0gPSB2YWx1ZVsgaW5kZXggXTtcblx0XHRcdFx0XHRzcGVjaWFsRWFzaW5nWyBpbmRleCBdID0gZWFzaW5nO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNwZWNpYWxFYXNpbmdbIG5hbWUgXSA9IGVhc2luZztcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gQW5pbWF0aW9uKCBlbGVtLCBwcm9wZXJ0aWVzLCBvcHRpb25zICkge1xuXHR2YXIgcmVzdWx0LFxuXHRcdHN0b3BwZWQsXG5cdFx0aW5kZXggPSAwLFxuXHRcdGxlbmd0aCA9IGFuaW1hdGlvblByZWZpbHRlcnMubGVuZ3RoLFxuXHRcdGRlZmVycmVkID0galF1ZXJ5LkRlZmVycmVkKCkuYWx3YXlzKCBmdW5jdGlvbigpIHtcblx0XHRcdC8vIGRvbid0IG1hdGNoIGVsZW0gaW4gdGhlIDphbmltYXRlZCBzZWxlY3RvclxuXHRcdFx0ZGVsZXRlIHRpY2suZWxlbTtcblx0XHR9KSxcblx0XHR0aWNrID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoIHN0b3BwZWQgKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdHZhciBjdXJyZW50VGltZSA9IGZ4Tm93IHx8IGNyZWF0ZUZ4Tm93KCksXG5cdFx0XHRcdHJlbWFpbmluZyA9IE1hdGgubWF4KCAwLCBhbmltYXRpb24uc3RhcnRUaW1lICsgYW5pbWF0aW9uLmR1cmF0aW9uIC0gY3VycmVudFRpbWUgKSxcblx0XHRcdFx0Ly8gYXJjaGFpYyBjcmFzaCBidWcgd29uJ3QgYWxsb3cgdXMgdG8gdXNlIDEgLSAoIDAuNSB8fCAwICkgKCMxMjQ5Nylcblx0XHRcdFx0dGVtcCA9IHJlbWFpbmluZyAvIGFuaW1hdGlvbi5kdXJhdGlvbiB8fCAwLFxuXHRcdFx0XHRwZXJjZW50ID0gMSAtIHRlbXAsXG5cdFx0XHRcdGluZGV4ID0gMCxcblx0XHRcdFx0bGVuZ3RoID0gYW5pbWF0aW9uLnR3ZWVucy5sZW5ndGg7XG5cblx0XHRcdGZvciAoIDsgaW5kZXggPCBsZW5ndGggOyBpbmRleCsrICkge1xuXHRcdFx0XHRhbmltYXRpb24udHdlZW5zWyBpbmRleCBdLnJ1biggcGVyY2VudCApO1xuXHRcdFx0fVxuXG5cdFx0XHRkZWZlcnJlZC5ub3RpZnlXaXRoKCBlbGVtLCBbIGFuaW1hdGlvbiwgcGVyY2VudCwgcmVtYWluaW5nIF0pO1xuXG5cdFx0XHRpZiAoIHBlcmNlbnQgPCAxICYmIGxlbmd0aCApIHtcblx0XHRcdFx0cmV0dXJuIHJlbWFpbmluZztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGRlZmVycmVkLnJlc29sdmVXaXRoKCBlbGVtLCBbIGFuaW1hdGlvbiBdICk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGFuaW1hdGlvbiA9IGRlZmVycmVkLnByb21pc2Uoe1xuXHRcdFx0ZWxlbTogZWxlbSxcblx0XHRcdHByb3BzOiBqUXVlcnkuZXh0ZW5kKCB7fSwgcHJvcGVydGllcyApLFxuXHRcdFx0b3B0czogalF1ZXJ5LmV4dGVuZCggdHJ1ZSwgeyBzcGVjaWFsRWFzaW5nOiB7fSB9LCBvcHRpb25zICksXG5cdFx0XHRvcmlnaW5hbFByb3BlcnRpZXM6IHByb3BlcnRpZXMsXG5cdFx0XHRvcmlnaW5hbE9wdGlvbnM6IG9wdGlvbnMsXG5cdFx0XHRzdGFydFRpbWU6IGZ4Tm93IHx8IGNyZWF0ZUZ4Tm93KCksXG5cdFx0XHRkdXJhdGlvbjogb3B0aW9ucy5kdXJhdGlvbixcblx0XHRcdHR3ZWVuczogW10sXG5cdFx0XHRjcmVhdGVUd2VlbjogZnVuY3Rpb24oIHByb3AsIGVuZCApIHtcblx0XHRcdFx0dmFyIHR3ZWVuID0galF1ZXJ5LlR3ZWVuKCBlbGVtLCBhbmltYXRpb24ub3B0cywgcHJvcCwgZW5kLFxuXHRcdFx0XHRcdFx0YW5pbWF0aW9uLm9wdHMuc3BlY2lhbEVhc2luZ1sgcHJvcCBdIHx8IGFuaW1hdGlvbi5vcHRzLmVhc2luZyApO1xuXHRcdFx0XHRhbmltYXRpb24udHdlZW5zLnB1c2goIHR3ZWVuICk7XG5cdFx0XHRcdHJldHVybiB0d2Vlbjtcblx0XHRcdH0sXG5cdFx0XHRzdG9wOiBmdW5jdGlvbiggZ290b0VuZCApIHtcblx0XHRcdFx0dmFyIGluZGV4ID0gMCxcblx0XHRcdFx0XHQvLyBpZiB3ZSBhcmUgZ29pbmcgdG8gdGhlIGVuZCwgd2Ugd2FudCB0byBydW4gYWxsIHRoZSB0d2VlbnNcblx0XHRcdFx0XHQvLyBvdGhlcndpc2Ugd2Ugc2tpcCB0aGlzIHBhcnRcblx0XHRcdFx0XHRsZW5ndGggPSBnb3RvRW5kID8gYW5pbWF0aW9uLnR3ZWVucy5sZW5ndGggOiAwO1xuXHRcdFx0XHRpZiAoIHN0b3BwZWQgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0XHRcdH1cblx0XHRcdFx0c3RvcHBlZCA9IHRydWU7XG5cdFx0XHRcdGZvciAoIDsgaW5kZXggPCBsZW5ndGggOyBpbmRleCsrICkge1xuXHRcdFx0XHRcdGFuaW1hdGlvbi50d2VlbnNbIGluZGV4IF0ucnVuKCAxICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyByZXNvbHZlIHdoZW4gd2UgcGxheWVkIHRoZSBsYXN0IGZyYW1lXG5cdFx0XHRcdC8vIG90aGVyd2lzZSwgcmVqZWN0XG5cdFx0XHRcdGlmICggZ290b0VuZCApIHtcblx0XHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlV2l0aCggZWxlbSwgWyBhbmltYXRpb24sIGdvdG9FbmQgXSApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGRlZmVycmVkLnJlamVjdFdpdGgoIGVsZW0sIFsgYW5pbWF0aW9uLCBnb3RvRW5kIF0gKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdGhpcztcblx0XHRcdH1cblx0XHR9KSxcblx0XHRwcm9wcyA9IGFuaW1hdGlvbi5wcm9wcztcblxuXHRwcm9wRmlsdGVyKCBwcm9wcywgYW5pbWF0aW9uLm9wdHMuc3BlY2lhbEVhc2luZyApO1xuXG5cdGZvciAoIDsgaW5kZXggPCBsZW5ndGggOyBpbmRleCsrICkge1xuXHRcdHJlc3VsdCA9IGFuaW1hdGlvblByZWZpbHRlcnNbIGluZGV4IF0uY2FsbCggYW5pbWF0aW9uLCBlbGVtLCBwcm9wcywgYW5pbWF0aW9uLm9wdHMgKTtcblx0XHRpZiAoIHJlc3VsdCApIHtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHR9XG5cblx0alF1ZXJ5Lm1hcCggcHJvcHMsIGNyZWF0ZVR3ZWVuLCBhbmltYXRpb24gKTtcblxuXHRpZiAoIGpRdWVyeS5pc0Z1bmN0aW9uKCBhbmltYXRpb24ub3B0cy5zdGFydCApICkge1xuXHRcdGFuaW1hdGlvbi5vcHRzLnN0YXJ0LmNhbGwoIGVsZW0sIGFuaW1hdGlvbiApO1xuXHR9XG5cblx0alF1ZXJ5LmZ4LnRpbWVyKFxuXHRcdGpRdWVyeS5leHRlbmQoIHRpY2ssIHtcblx0XHRcdGVsZW06IGVsZW0sXG5cdFx0XHRhbmltOiBhbmltYXRpb24sXG5cdFx0XHRxdWV1ZTogYW5pbWF0aW9uLm9wdHMucXVldWVcblx0XHR9KVxuXHQpO1xuXG5cdC8vIGF0dGFjaCBjYWxsYmFja3MgZnJvbSBvcHRpb25zXG5cdHJldHVybiBhbmltYXRpb24ucHJvZ3Jlc3MoIGFuaW1hdGlvbi5vcHRzLnByb2dyZXNzIClcblx0XHQuZG9uZSggYW5pbWF0aW9uLm9wdHMuZG9uZSwgYW5pbWF0aW9uLm9wdHMuY29tcGxldGUgKVxuXHRcdC5mYWlsKCBhbmltYXRpb24ub3B0cy5mYWlsIClcblx0XHQuYWx3YXlzKCBhbmltYXRpb24ub3B0cy5hbHdheXMgKTtcbn1cblxualF1ZXJ5LkFuaW1hdGlvbiA9IGpRdWVyeS5leHRlbmQoIEFuaW1hdGlvbiwge1xuXG5cdHR3ZWVuZXI6IGZ1bmN0aW9uKCBwcm9wcywgY2FsbGJhY2sgKSB7XG5cdFx0aWYgKCBqUXVlcnkuaXNGdW5jdGlvbiggcHJvcHMgKSApIHtcblx0XHRcdGNhbGxiYWNrID0gcHJvcHM7XG5cdFx0XHRwcm9wcyA9IFsgXCIqXCIgXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cHJvcHMgPSBwcm9wcy5zcGxpdChcIiBcIik7XG5cdFx0fVxuXG5cdFx0dmFyIHByb3AsXG5cdFx0XHRpbmRleCA9IDAsXG5cdFx0XHRsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG5cblx0XHRmb3IgKCA7IGluZGV4IDwgbGVuZ3RoIDsgaW5kZXgrKyApIHtcblx0XHRcdHByb3AgPSBwcm9wc1sgaW5kZXggXTtcblx0XHRcdHR3ZWVuZXJzWyBwcm9wIF0gPSB0d2VlbmVyc1sgcHJvcCBdIHx8IFtdO1xuXHRcdFx0dHdlZW5lcnNbIHByb3AgXS51bnNoaWZ0KCBjYWxsYmFjayApO1xuXHRcdH1cblx0fSxcblxuXHRwcmVmaWx0ZXI6IGZ1bmN0aW9uKCBjYWxsYmFjaywgcHJlcGVuZCApIHtcblx0XHRpZiAoIHByZXBlbmQgKSB7XG5cdFx0XHRhbmltYXRpb25QcmVmaWx0ZXJzLnVuc2hpZnQoIGNhbGxiYWNrICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFuaW1hdGlvblByZWZpbHRlcnMucHVzaCggY2FsbGJhY2sgKTtcblx0XHR9XG5cdH1cbn0pO1xuXG5qUXVlcnkuc3BlZWQgPSBmdW5jdGlvbiggc3BlZWQsIGVhc2luZywgZm4gKSB7XG5cdHZhciBvcHQgPSBzcGVlZCAmJiB0eXBlb2Ygc3BlZWQgPT09IFwib2JqZWN0XCIgPyBqUXVlcnkuZXh0ZW5kKCB7fSwgc3BlZWQgKSA6IHtcblx0XHRjb21wbGV0ZTogZm4gfHwgIWZuICYmIGVhc2luZyB8fFxuXHRcdFx0alF1ZXJ5LmlzRnVuY3Rpb24oIHNwZWVkICkgJiYgc3BlZWQsXG5cdFx0ZHVyYXRpb246IHNwZWVkLFxuXHRcdGVhc2luZzogZm4gJiYgZWFzaW5nIHx8IGVhc2luZyAmJiAhalF1ZXJ5LmlzRnVuY3Rpb24oIGVhc2luZyApICYmIGVhc2luZ1xuXHR9O1xuXG5cdG9wdC5kdXJhdGlvbiA9IGpRdWVyeS5meC5vZmYgPyAwIDogdHlwZW9mIG9wdC5kdXJhdGlvbiA9PT0gXCJudW1iZXJcIiA/IG9wdC5kdXJhdGlvbiA6XG5cdFx0b3B0LmR1cmF0aW9uIGluIGpRdWVyeS5meC5zcGVlZHMgPyBqUXVlcnkuZnguc3BlZWRzWyBvcHQuZHVyYXRpb24gXSA6IGpRdWVyeS5meC5zcGVlZHMuX2RlZmF1bHQ7XG5cblx0Ly8gbm9ybWFsaXplIG9wdC5xdWV1ZSAtIHRydWUvdW5kZWZpbmVkL251bGwgLT4gXCJmeFwiXG5cdGlmICggb3B0LnF1ZXVlID09IG51bGwgfHwgb3B0LnF1ZXVlID09PSB0cnVlICkge1xuXHRcdG9wdC5xdWV1ZSA9IFwiZnhcIjtcblx0fVxuXG5cdC8vIFF1ZXVlaW5nXG5cdG9wdC5vbGQgPSBvcHQuY29tcGxldGU7XG5cblx0b3B0LmNvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCBqUXVlcnkuaXNGdW5jdGlvbiggb3B0Lm9sZCApICkge1xuXHRcdFx0b3B0Lm9sZC5jYWxsKCB0aGlzICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBvcHQucXVldWUgKSB7XG5cdFx0XHRqUXVlcnkuZGVxdWV1ZSggdGhpcywgb3B0LnF1ZXVlICk7XG5cdFx0fVxuXHR9O1xuXG5cdHJldHVybiBvcHQ7XG59O1xuXG5qUXVlcnkuZm4uZXh0ZW5kKHtcblx0ZmFkZVRvOiBmdW5jdGlvbiggc3BlZWQsIHRvLCBlYXNpbmcsIGNhbGxiYWNrICkge1xuXG5cdFx0Ly8gc2hvdyBhbnkgaGlkZGVuIGVsZW1lbnRzIGFmdGVyIHNldHRpbmcgb3BhY2l0eSB0byAwXG5cdFx0cmV0dXJuIHRoaXMuZmlsdGVyKCBpc0hpZGRlbiApLmNzcyggXCJvcGFjaXR5XCIsIDAgKS5zaG93KClcblxuXHRcdFx0Ly8gYW5pbWF0ZSB0byB0aGUgdmFsdWUgc3BlY2lmaWVkXG5cdFx0XHQuZW5kKCkuYW5pbWF0ZSh7IG9wYWNpdHk6IHRvIH0sIHNwZWVkLCBlYXNpbmcsIGNhbGxiYWNrICk7XG5cdH0sXG5cdGFuaW1hdGU6IGZ1bmN0aW9uKCBwcm9wLCBzcGVlZCwgZWFzaW5nLCBjYWxsYmFjayApIHtcblx0XHR2YXIgZW1wdHkgPSBqUXVlcnkuaXNFbXB0eU9iamVjdCggcHJvcCApLFxuXHRcdFx0b3B0YWxsID0galF1ZXJ5LnNwZWVkKCBzcGVlZCwgZWFzaW5nLCBjYWxsYmFjayApLFxuXHRcdFx0ZG9BbmltYXRpb24gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0Ly8gT3BlcmF0ZSBvbiBhIGNvcHkgb2YgcHJvcCBzbyBwZXItcHJvcGVydHkgZWFzaW5nIHdvbid0IGJlIGxvc3Rcblx0XHRcdFx0dmFyIGFuaW0gPSBBbmltYXRpb24oIHRoaXMsIGpRdWVyeS5leHRlbmQoIHt9LCBwcm9wICksIG9wdGFsbCApO1xuXG5cdFx0XHRcdC8vIEVtcHR5IGFuaW1hdGlvbnMsIG9yIGZpbmlzaGluZyByZXNvbHZlcyBpbW1lZGlhdGVseVxuXHRcdFx0XHRpZiAoIGVtcHR5IHx8IGRhdGFfcHJpdi5nZXQoIHRoaXMsIFwiZmluaXNoXCIgKSApIHtcblx0XHRcdFx0XHRhbmltLnN0b3AoIHRydWUgKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdGRvQW5pbWF0aW9uLmZpbmlzaCA9IGRvQW5pbWF0aW9uO1xuXG5cdFx0cmV0dXJuIGVtcHR5IHx8IG9wdGFsbC5xdWV1ZSA9PT0gZmFsc2UgP1xuXHRcdFx0dGhpcy5lYWNoKCBkb0FuaW1hdGlvbiApIDpcblx0XHRcdHRoaXMucXVldWUoIG9wdGFsbC5xdWV1ZSwgZG9BbmltYXRpb24gKTtcblx0fSxcblx0c3RvcDogZnVuY3Rpb24oIHR5cGUsIGNsZWFyUXVldWUsIGdvdG9FbmQgKSB7XG5cdFx0dmFyIHN0b3BRdWV1ZSA9IGZ1bmN0aW9uKCBob29rcyApIHtcblx0XHRcdHZhciBzdG9wID0gaG9va3Muc3RvcDtcblx0XHRcdGRlbGV0ZSBob29rcy5zdG9wO1xuXHRcdFx0c3RvcCggZ290b0VuZCApO1xuXHRcdH07XG5cblx0XHRpZiAoIHR5cGVvZiB0eXBlICE9PSBcInN0cmluZ1wiICkge1xuXHRcdFx0Z290b0VuZCA9IGNsZWFyUXVldWU7XG5cdFx0XHRjbGVhclF1ZXVlID0gdHlwZTtcblx0XHRcdHR5cGUgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdGlmICggY2xlYXJRdWV1ZSAmJiB0eXBlICE9PSBmYWxzZSApIHtcblx0XHRcdHRoaXMucXVldWUoIHR5cGUgfHwgXCJmeFwiLCBbXSApO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgZGVxdWV1ZSA9IHRydWUsXG5cdFx0XHRcdGluZGV4ID0gdHlwZSAhPSBudWxsICYmIHR5cGUgKyBcInF1ZXVlSG9va3NcIixcblx0XHRcdFx0dGltZXJzID0galF1ZXJ5LnRpbWVycyxcblx0XHRcdFx0ZGF0YSA9IGRhdGFfcHJpdi5nZXQoIHRoaXMgKTtcblxuXHRcdFx0aWYgKCBpbmRleCApIHtcblx0XHRcdFx0aWYgKCBkYXRhWyBpbmRleCBdICYmIGRhdGFbIGluZGV4IF0uc3RvcCApIHtcblx0XHRcdFx0XHRzdG9wUXVldWUoIGRhdGFbIGluZGV4IF0gKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Zm9yICggaW5kZXggaW4gZGF0YSApIHtcblx0XHRcdFx0XHRpZiAoIGRhdGFbIGluZGV4IF0gJiYgZGF0YVsgaW5kZXggXS5zdG9wICYmIHJydW4udGVzdCggaW5kZXggKSApIHtcblx0XHRcdFx0XHRcdHN0b3BRdWV1ZSggZGF0YVsgaW5kZXggXSApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRmb3IgKCBpbmRleCA9IHRpbWVycy5sZW5ndGg7IGluZGV4LS07ICkge1xuXHRcdFx0XHRpZiAoIHRpbWVyc1sgaW5kZXggXS5lbGVtID09PSB0aGlzICYmICh0eXBlID09IG51bGwgfHwgdGltZXJzWyBpbmRleCBdLnF1ZXVlID09PSB0eXBlKSApIHtcblx0XHRcdFx0XHR0aW1lcnNbIGluZGV4IF0uYW5pbS5zdG9wKCBnb3RvRW5kICk7XG5cdFx0XHRcdFx0ZGVxdWV1ZSA9IGZhbHNlO1xuXHRcdFx0XHRcdHRpbWVycy5zcGxpY2UoIGluZGV4LCAxICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gc3RhcnQgdGhlIG5leHQgaW4gdGhlIHF1ZXVlIGlmIHRoZSBsYXN0IHN0ZXAgd2Fzbid0IGZvcmNlZFxuXHRcdFx0Ly8gdGltZXJzIGN1cnJlbnRseSB3aWxsIGNhbGwgdGhlaXIgY29tcGxldGUgY2FsbGJhY2tzLCB3aGljaCB3aWxsIGRlcXVldWVcblx0XHRcdC8vIGJ1dCBvbmx5IGlmIHRoZXkgd2VyZSBnb3RvRW5kXG5cdFx0XHRpZiAoIGRlcXVldWUgfHwgIWdvdG9FbmQgKSB7XG5cdFx0XHRcdGpRdWVyeS5kZXF1ZXVlKCB0aGlzLCB0eXBlICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdGZpbmlzaDogZnVuY3Rpb24oIHR5cGUgKSB7XG5cdFx0aWYgKCB0eXBlICE9PSBmYWxzZSApIHtcblx0XHRcdHR5cGUgPSB0eXBlIHx8IFwiZnhcIjtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdHZhciBpbmRleCxcblx0XHRcdFx0ZGF0YSA9IGRhdGFfcHJpdi5nZXQoIHRoaXMgKSxcblx0XHRcdFx0cXVldWUgPSBkYXRhWyB0eXBlICsgXCJxdWV1ZVwiIF0sXG5cdFx0XHRcdGhvb2tzID0gZGF0YVsgdHlwZSArIFwicXVldWVIb29rc1wiIF0sXG5cdFx0XHRcdHRpbWVycyA9IGpRdWVyeS50aW1lcnMsXG5cdFx0XHRcdGxlbmd0aCA9IHF1ZXVlID8gcXVldWUubGVuZ3RoIDogMDtcblxuXHRcdFx0Ly8gZW5hYmxlIGZpbmlzaGluZyBmbGFnIG9uIHByaXZhdGUgZGF0YVxuXHRcdFx0ZGF0YS5maW5pc2ggPSB0cnVlO1xuXG5cdFx0XHQvLyBlbXB0eSB0aGUgcXVldWUgZmlyc3Rcblx0XHRcdGpRdWVyeS5xdWV1ZSggdGhpcywgdHlwZSwgW10gKTtcblxuXHRcdFx0aWYgKCBob29rcyAmJiBob29rcy5zdG9wICkge1xuXHRcdFx0XHRob29rcy5zdG9wLmNhbGwoIHRoaXMsIHRydWUgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gbG9vayBmb3IgYW55IGFjdGl2ZSBhbmltYXRpb25zLCBhbmQgZmluaXNoIHRoZW1cblx0XHRcdGZvciAoIGluZGV4ID0gdGltZXJzLmxlbmd0aDsgaW5kZXgtLTsgKSB7XG5cdFx0XHRcdGlmICggdGltZXJzWyBpbmRleCBdLmVsZW0gPT09IHRoaXMgJiYgdGltZXJzWyBpbmRleCBdLnF1ZXVlID09PSB0eXBlICkge1xuXHRcdFx0XHRcdHRpbWVyc1sgaW5kZXggXS5hbmltLnN0b3AoIHRydWUgKTtcblx0XHRcdFx0XHR0aW1lcnMuc3BsaWNlKCBpbmRleCwgMSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIGxvb2sgZm9yIGFueSBhbmltYXRpb25zIGluIHRoZSBvbGQgcXVldWUgYW5kIGZpbmlzaCB0aGVtXG5cdFx0XHRmb3IgKCBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrICkge1xuXHRcdFx0XHRpZiAoIHF1ZXVlWyBpbmRleCBdICYmIHF1ZXVlWyBpbmRleCBdLmZpbmlzaCApIHtcblx0XHRcdFx0XHRxdWV1ZVsgaW5kZXggXS5maW5pc2guY2FsbCggdGhpcyApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIHR1cm4gb2ZmIGZpbmlzaGluZyBmbGFnXG5cdFx0XHRkZWxldGUgZGF0YS5maW5pc2g7XG5cdFx0fSk7XG5cdH1cbn0pO1xuXG5qUXVlcnkuZWFjaChbIFwidG9nZ2xlXCIsIFwic2hvd1wiLCBcImhpZGVcIiBdLCBmdW5jdGlvbiggaSwgbmFtZSApIHtcblx0dmFyIGNzc0ZuID0galF1ZXJ5LmZuWyBuYW1lIF07XG5cdGpRdWVyeS5mblsgbmFtZSBdID0gZnVuY3Rpb24oIHNwZWVkLCBlYXNpbmcsIGNhbGxiYWNrICkge1xuXHRcdHJldHVybiBzcGVlZCA9PSBudWxsIHx8IHR5cGVvZiBzcGVlZCA9PT0gXCJib29sZWFuXCIgP1xuXHRcdFx0Y3NzRm4uYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApIDpcblx0XHRcdHRoaXMuYW5pbWF0ZSggZ2VuRngoIG5hbWUsIHRydWUgKSwgc3BlZWQsIGVhc2luZywgY2FsbGJhY2sgKTtcblx0fTtcbn0pO1xuXG4vLyBHZW5lcmF0ZSBzaG9ydGN1dHMgZm9yIGN1c3RvbSBhbmltYXRpb25zXG5qUXVlcnkuZWFjaCh7XG5cdHNsaWRlRG93bjogZ2VuRngoXCJzaG93XCIpLFxuXHRzbGlkZVVwOiBnZW5GeChcImhpZGVcIiksXG5cdHNsaWRlVG9nZ2xlOiBnZW5GeChcInRvZ2dsZVwiKSxcblx0ZmFkZUluOiB7IG9wYWNpdHk6IFwic2hvd1wiIH0sXG5cdGZhZGVPdXQ6IHsgb3BhY2l0eTogXCJoaWRlXCIgfSxcblx0ZmFkZVRvZ2dsZTogeyBvcGFjaXR5OiBcInRvZ2dsZVwiIH1cbn0sIGZ1bmN0aW9uKCBuYW1lLCBwcm9wcyApIHtcblx0alF1ZXJ5LmZuWyBuYW1lIF0gPSBmdW5jdGlvbiggc3BlZWQsIGVhc2luZywgY2FsbGJhY2sgKSB7XG5cdFx0cmV0dXJuIHRoaXMuYW5pbWF0ZSggcHJvcHMsIHNwZWVkLCBlYXNpbmcsIGNhbGxiYWNrICk7XG5cdH07XG59KTtcblxualF1ZXJ5LnRpbWVycyA9IFtdO1xualF1ZXJ5LmZ4LnRpY2sgPSBmdW5jdGlvbigpIHtcblx0dmFyIHRpbWVyLFxuXHRcdGkgPSAwLFxuXHRcdHRpbWVycyA9IGpRdWVyeS50aW1lcnM7XG5cblx0ZnhOb3cgPSBqUXVlcnkubm93KCk7XG5cblx0Zm9yICggOyBpIDwgdGltZXJzLmxlbmd0aDsgaSsrICkge1xuXHRcdHRpbWVyID0gdGltZXJzWyBpIF07XG5cdFx0Ly8gQ2hlY2tzIHRoZSB0aW1lciBoYXMgbm90IGFscmVhZHkgYmVlbiByZW1vdmVkXG5cdFx0aWYgKCAhdGltZXIoKSAmJiB0aW1lcnNbIGkgXSA9PT0gdGltZXIgKSB7XG5cdFx0XHR0aW1lcnMuc3BsaWNlKCBpLS0sIDEgKTtcblx0XHR9XG5cdH1cblxuXHRpZiAoICF0aW1lcnMubGVuZ3RoICkge1xuXHRcdGpRdWVyeS5meC5zdG9wKCk7XG5cdH1cblx0ZnhOb3cgPSB1bmRlZmluZWQ7XG59O1xuXG5qUXVlcnkuZngudGltZXIgPSBmdW5jdGlvbiggdGltZXIgKSB7XG5cdGpRdWVyeS50aW1lcnMucHVzaCggdGltZXIgKTtcblx0aWYgKCB0aW1lcigpICkge1xuXHRcdGpRdWVyeS5meC5zdGFydCgpO1xuXHR9IGVsc2Uge1xuXHRcdGpRdWVyeS50aW1lcnMucG9wKCk7XG5cdH1cbn07XG5cbmpRdWVyeS5meC5pbnRlcnZhbCA9IDEzO1xuXG5qUXVlcnkuZnguc3RhcnQgPSBmdW5jdGlvbigpIHtcblx0aWYgKCAhdGltZXJJZCApIHtcblx0XHR0aW1lcklkID0gc2V0SW50ZXJ2YWwoIGpRdWVyeS5meC50aWNrLCBqUXVlcnkuZnguaW50ZXJ2YWwgKTtcblx0fVxufTtcblxualF1ZXJ5LmZ4LnN0b3AgPSBmdW5jdGlvbigpIHtcblx0Y2xlYXJJbnRlcnZhbCggdGltZXJJZCApO1xuXHR0aW1lcklkID0gbnVsbDtcbn07XG5cbmpRdWVyeS5meC5zcGVlZHMgPSB7XG5cdHNsb3c6IDYwMCxcblx0ZmFzdDogMjAwLFxuXHQvLyBEZWZhdWx0IHNwZWVkXG5cdF9kZWZhdWx0OiA0MDBcbn07XG5cblxuLy8gQmFzZWQgb2ZmIG9mIHRoZSBwbHVnaW4gYnkgQ2xpbnQgSGVsZmVycywgd2l0aCBwZXJtaXNzaW9uLlxuLy8gaHR0cDovL2JsaW5kc2lnbmFscy5jb20vaW5kZXgucGhwLzIwMDkvMDcvanF1ZXJ5LWRlbGF5L1xualF1ZXJ5LmZuLmRlbGF5ID0gZnVuY3Rpb24oIHRpbWUsIHR5cGUgKSB7XG5cdHRpbWUgPSBqUXVlcnkuZnggPyBqUXVlcnkuZnguc3BlZWRzWyB0aW1lIF0gfHwgdGltZSA6IHRpbWU7XG5cdHR5cGUgPSB0eXBlIHx8IFwiZnhcIjtcblxuXHRyZXR1cm4gdGhpcy5xdWV1ZSggdHlwZSwgZnVuY3Rpb24oIG5leHQsIGhvb2tzICkge1xuXHRcdHZhciB0aW1lb3V0ID0gc2V0VGltZW91dCggbmV4dCwgdGltZSApO1xuXHRcdGhvb2tzLnN0b3AgPSBmdW5jdGlvbigpIHtcblx0XHRcdGNsZWFyVGltZW91dCggdGltZW91dCApO1xuXHRcdH07XG5cdH0pO1xufTtcblxuXG4oZnVuY3Rpb24oKSB7XG5cdHZhciBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoIFwiaW5wdXRcIiApLFxuXHRcdHNlbGVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoIFwic2VsZWN0XCIgKSxcblx0XHRvcHQgPSBzZWxlY3QuYXBwZW5kQ2hpbGQoIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoIFwib3B0aW9uXCIgKSApO1xuXG5cdGlucHV0LnR5cGUgPSBcImNoZWNrYm94XCI7XG5cblx0Ly8gU3VwcG9ydDogaU9TIDUuMSwgQW5kcm9pZCA0LngsIEFuZHJvaWQgMi4zXG5cdC8vIENoZWNrIHRoZSBkZWZhdWx0IGNoZWNrYm94L3JhZGlvIHZhbHVlIChcIlwiIG9uIG9sZCBXZWJLaXQ7IFwib25cIiBlbHNld2hlcmUpXG5cdHN1cHBvcnQuY2hlY2tPbiA9IGlucHV0LnZhbHVlICE9PSBcIlwiO1xuXG5cdC8vIE11c3QgYWNjZXNzIHRoZSBwYXJlbnQgdG8gbWFrZSBhbiBvcHRpb24gc2VsZWN0IHByb3Blcmx5XG5cdC8vIFN1cHBvcnQ6IElFOSwgSUUxMFxuXHRzdXBwb3J0Lm9wdFNlbGVjdGVkID0gb3B0LnNlbGVjdGVkO1xuXG5cdC8vIE1ha2Ugc3VyZSB0aGF0IHRoZSBvcHRpb25zIGluc2lkZSBkaXNhYmxlZCBzZWxlY3RzIGFyZW4ndCBtYXJrZWQgYXMgZGlzYWJsZWRcblx0Ly8gKFdlYktpdCBtYXJrcyB0aGVtIGFzIGRpc2FibGVkKVxuXHRzZWxlY3QuZGlzYWJsZWQgPSB0cnVlO1xuXHRzdXBwb3J0Lm9wdERpc2FibGVkID0gIW9wdC5kaXNhYmxlZDtcblxuXHQvLyBDaGVjayBpZiBhbiBpbnB1dCBtYWludGFpbnMgaXRzIHZhbHVlIGFmdGVyIGJlY29taW5nIGEgcmFkaW9cblx0Ly8gU3VwcG9ydDogSUU5LCBJRTEwXG5cdGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggXCJpbnB1dFwiICk7XG5cdGlucHV0LnZhbHVlID0gXCJ0XCI7XG5cdGlucHV0LnR5cGUgPSBcInJhZGlvXCI7XG5cdHN1cHBvcnQucmFkaW9WYWx1ZSA9IGlucHV0LnZhbHVlID09PSBcInRcIjtcbn0pKCk7XG5cblxudmFyIG5vZGVIb29rLCBib29sSG9vayxcblx0YXR0ckhhbmRsZSA9IGpRdWVyeS5leHByLmF0dHJIYW5kbGU7XG5cbmpRdWVyeS5mbi5leHRlbmQoe1xuXHRhdHRyOiBmdW5jdGlvbiggbmFtZSwgdmFsdWUgKSB7XG5cdFx0cmV0dXJuIGFjY2VzcyggdGhpcywgalF1ZXJ5LmF0dHIsIG5hbWUsIHZhbHVlLCBhcmd1bWVudHMubGVuZ3RoID4gMSApO1xuXHR9LFxuXG5cdHJlbW92ZUF0dHI6IGZ1bmN0aW9uKCBuYW1lICkge1xuXHRcdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHRqUXVlcnkucmVtb3ZlQXR0ciggdGhpcywgbmFtZSApO1xuXHRcdH0pO1xuXHR9XG59KTtcblxualF1ZXJ5LmV4dGVuZCh7XG5cdGF0dHI6IGZ1bmN0aW9uKCBlbGVtLCBuYW1lLCB2YWx1ZSApIHtcblx0XHR2YXIgaG9va3MsIHJldCxcblx0XHRcdG5UeXBlID0gZWxlbS5ub2RlVHlwZTtcblxuXHRcdC8vIGRvbid0IGdldC9zZXQgYXR0cmlidXRlcyBvbiB0ZXh0LCBjb21tZW50IGFuZCBhdHRyaWJ1dGUgbm9kZXNcblx0XHRpZiAoICFlbGVtIHx8IG5UeXBlID09PSAzIHx8IG5UeXBlID09PSA4IHx8IG5UeXBlID09PSAyICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIEZhbGxiYWNrIHRvIHByb3Agd2hlbiBhdHRyaWJ1dGVzIGFyZSBub3Qgc3VwcG9ydGVkXG5cdFx0aWYgKCB0eXBlb2YgZWxlbS5nZXRBdHRyaWJ1dGUgPT09IHN0cnVuZGVmaW5lZCApIHtcblx0XHRcdHJldHVybiBqUXVlcnkucHJvcCggZWxlbSwgbmFtZSwgdmFsdWUgKTtcblx0XHR9XG5cblx0XHQvLyBBbGwgYXR0cmlidXRlcyBhcmUgbG93ZXJjYXNlXG5cdFx0Ly8gR3JhYiBuZWNlc3NhcnkgaG9vayBpZiBvbmUgaXMgZGVmaW5lZFxuXHRcdGlmICggblR5cGUgIT09IDEgfHwgIWpRdWVyeS5pc1hNTERvYyggZWxlbSApICkge1xuXHRcdFx0bmFtZSA9IG5hbWUudG9Mb3dlckNhc2UoKTtcblx0XHRcdGhvb2tzID0galF1ZXJ5LmF0dHJIb29rc1sgbmFtZSBdIHx8XG5cdFx0XHRcdCggalF1ZXJ5LmV4cHIubWF0Y2guYm9vbC50ZXN0KCBuYW1lICkgPyBib29sSG9vayA6IG5vZGVIb29rICk7XG5cdFx0fVxuXG5cdFx0aWYgKCB2YWx1ZSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRpZiAoIHZhbHVlID09PSBudWxsICkge1xuXHRcdFx0XHRqUXVlcnkucmVtb3ZlQXR0ciggZWxlbSwgbmFtZSApO1xuXG5cdFx0XHR9IGVsc2UgaWYgKCBob29rcyAmJiBcInNldFwiIGluIGhvb2tzICYmIChyZXQgPSBob29rcy5zZXQoIGVsZW0sIHZhbHVlLCBuYW1lICkpICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdHJldHVybiByZXQ7XG5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGVsZW0uc2V0QXR0cmlidXRlKCBuYW1lLCB2YWx1ZSArIFwiXCIgKTtcblx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIGlmICggaG9va3MgJiYgXCJnZXRcIiBpbiBob29rcyAmJiAocmV0ID0gaG9va3MuZ2V0KCBlbGVtLCBuYW1lICkpICE9PSBudWxsICkge1xuXHRcdFx0cmV0dXJuIHJldDtcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXQgPSBqUXVlcnkuZmluZC5hdHRyKCBlbGVtLCBuYW1lICk7XG5cblx0XHRcdC8vIE5vbi1leGlzdGVudCBhdHRyaWJ1dGVzIHJldHVybiBudWxsLCB3ZSBub3JtYWxpemUgdG8gdW5kZWZpbmVkXG5cdFx0XHRyZXR1cm4gcmV0ID09IG51bGwgP1xuXHRcdFx0XHR1bmRlZmluZWQgOlxuXHRcdFx0XHRyZXQ7XG5cdFx0fVxuXHR9LFxuXG5cdHJlbW92ZUF0dHI6IGZ1bmN0aW9uKCBlbGVtLCB2YWx1ZSApIHtcblx0XHR2YXIgbmFtZSwgcHJvcE5hbWUsXG5cdFx0XHRpID0gMCxcblx0XHRcdGF0dHJOYW1lcyA9IHZhbHVlICYmIHZhbHVlLm1hdGNoKCBybm90d2hpdGUgKTtcblxuXHRcdGlmICggYXR0ck5hbWVzICYmIGVsZW0ubm9kZVR5cGUgPT09IDEgKSB7XG5cdFx0XHR3aGlsZSAoIChuYW1lID0gYXR0ck5hbWVzW2krK10pICkge1xuXHRcdFx0XHRwcm9wTmFtZSA9IGpRdWVyeS5wcm9wRml4WyBuYW1lIF0gfHwgbmFtZTtcblxuXHRcdFx0XHQvLyBCb29sZWFuIGF0dHJpYnV0ZXMgZ2V0IHNwZWNpYWwgdHJlYXRtZW50ICgjMTA4NzApXG5cdFx0XHRcdGlmICggalF1ZXJ5LmV4cHIubWF0Y2guYm9vbC50ZXN0KCBuYW1lICkgKSB7XG5cdFx0XHRcdFx0Ly8gU2V0IGNvcnJlc3BvbmRpbmcgcHJvcGVydHkgdG8gZmFsc2Vcblx0XHRcdFx0XHRlbGVtWyBwcm9wTmFtZSBdID0gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRlbGVtLnJlbW92ZUF0dHJpYnV0ZSggbmFtZSApO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRhdHRySG9va3M6IHtcblx0XHR0eXBlOiB7XG5cdFx0XHRzZXQ6IGZ1bmN0aW9uKCBlbGVtLCB2YWx1ZSApIHtcblx0XHRcdFx0aWYgKCAhc3VwcG9ydC5yYWRpb1ZhbHVlICYmIHZhbHVlID09PSBcInJhZGlvXCIgJiZcblx0XHRcdFx0XHRqUXVlcnkubm9kZU5hbWUoIGVsZW0sIFwiaW5wdXRcIiApICkge1xuXHRcdFx0XHRcdC8vIFNldHRpbmcgdGhlIHR5cGUgb24gYSByYWRpbyBidXR0b24gYWZ0ZXIgdGhlIHZhbHVlIHJlc2V0cyB0aGUgdmFsdWUgaW4gSUU2LTlcblx0XHRcdFx0XHQvLyBSZXNldCB2YWx1ZSB0byBkZWZhdWx0IGluIGNhc2UgdHlwZSBpcyBzZXQgYWZ0ZXIgdmFsdWUgZHVyaW5nIGNyZWF0aW9uXG5cdFx0XHRcdFx0dmFyIHZhbCA9IGVsZW0udmFsdWU7XG5cdFx0XHRcdFx0ZWxlbS5zZXRBdHRyaWJ1dGUoIFwidHlwZVwiLCB2YWx1ZSApO1xuXHRcdFx0XHRcdGlmICggdmFsICkge1xuXHRcdFx0XHRcdFx0ZWxlbS52YWx1ZSA9IHZhbDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59KTtcblxuLy8gSG9va3MgZm9yIGJvb2xlYW4gYXR0cmlidXRlc1xuYm9vbEhvb2sgPSB7XG5cdHNldDogZnVuY3Rpb24oIGVsZW0sIHZhbHVlLCBuYW1lICkge1xuXHRcdGlmICggdmFsdWUgPT09IGZhbHNlICkge1xuXHRcdFx0Ly8gUmVtb3ZlIGJvb2xlYW4gYXR0cmlidXRlcyB3aGVuIHNldCB0byBmYWxzZVxuXHRcdFx0alF1ZXJ5LnJlbW92ZUF0dHIoIGVsZW0sIG5hbWUgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZWxlbS5zZXRBdHRyaWJ1dGUoIG5hbWUsIG5hbWUgKTtcblx0XHR9XG5cdFx0cmV0dXJuIG5hbWU7XG5cdH1cbn07XG5qUXVlcnkuZWFjaCggalF1ZXJ5LmV4cHIubWF0Y2guYm9vbC5zb3VyY2UubWF0Y2goIC9cXHcrL2cgKSwgZnVuY3Rpb24oIGksIG5hbWUgKSB7XG5cdHZhciBnZXR0ZXIgPSBhdHRySGFuZGxlWyBuYW1lIF0gfHwgalF1ZXJ5LmZpbmQuYXR0cjtcblxuXHRhdHRySGFuZGxlWyBuYW1lIF0gPSBmdW5jdGlvbiggZWxlbSwgbmFtZSwgaXNYTUwgKSB7XG5cdFx0dmFyIHJldCwgaGFuZGxlO1xuXHRcdGlmICggIWlzWE1MICkge1xuXHRcdFx0Ly8gQXZvaWQgYW4gaW5maW5pdGUgbG9vcCBieSB0ZW1wb3JhcmlseSByZW1vdmluZyB0aGlzIGZ1bmN0aW9uIGZyb20gdGhlIGdldHRlclxuXHRcdFx0aGFuZGxlID0gYXR0ckhhbmRsZVsgbmFtZSBdO1xuXHRcdFx0YXR0ckhhbmRsZVsgbmFtZSBdID0gcmV0O1xuXHRcdFx0cmV0ID0gZ2V0dGVyKCBlbGVtLCBuYW1lLCBpc1hNTCApICE9IG51bGwgP1xuXHRcdFx0XHRuYW1lLnRvTG93ZXJDYXNlKCkgOlxuXHRcdFx0XHRudWxsO1xuXHRcdFx0YXR0ckhhbmRsZVsgbmFtZSBdID0gaGFuZGxlO1xuXHRcdH1cblx0XHRyZXR1cm4gcmV0O1xuXHR9O1xufSk7XG5cblxuXG5cbnZhciByZm9jdXNhYmxlID0gL14oPzppbnB1dHxzZWxlY3R8dGV4dGFyZWF8YnV0dG9uKSQvaTtcblxualF1ZXJ5LmZuLmV4dGVuZCh7XG5cdHByb3A6IGZ1bmN0aW9uKCBuYW1lLCB2YWx1ZSApIHtcblx0XHRyZXR1cm4gYWNjZXNzKCB0aGlzLCBqUXVlcnkucHJvcCwgbmFtZSwgdmFsdWUsIGFyZ3VtZW50cy5sZW5ndGggPiAxICk7XG5cdH0sXG5cblx0cmVtb3ZlUHJvcDogZnVuY3Rpb24oIG5hbWUgKSB7XG5cdFx0cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdGRlbGV0ZSB0aGlzWyBqUXVlcnkucHJvcEZpeFsgbmFtZSBdIHx8IG5hbWUgXTtcblx0XHR9KTtcblx0fVxufSk7XG5cbmpRdWVyeS5leHRlbmQoe1xuXHRwcm9wRml4OiB7XG5cdFx0XCJmb3JcIjogXCJodG1sRm9yXCIsXG5cdFx0XCJjbGFzc1wiOiBcImNsYXNzTmFtZVwiXG5cdH0sXG5cblx0cHJvcDogZnVuY3Rpb24oIGVsZW0sIG5hbWUsIHZhbHVlICkge1xuXHRcdHZhciByZXQsIGhvb2tzLCBub3R4bWwsXG5cdFx0XHRuVHlwZSA9IGVsZW0ubm9kZVR5cGU7XG5cblx0XHQvLyBkb24ndCBnZXQvc2V0IHByb3BlcnRpZXMgb24gdGV4dCwgY29tbWVudCBhbmQgYXR0cmlidXRlIG5vZGVzXG5cdFx0aWYgKCAhZWxlbSB8fCBuVHlwZSA9PT0gMyB8fCBuVHlwZSA9PT0gOCB8fCBuVHlwZSA9PT0gMiApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRub3R4bWwgPSBuVHlwZSAhPT0gMSB8fCAhalF1ZXJ5LmlzWE1MRG9jKCBlbGVtICk7XG5cblx0XHRpZiAoIG5vdHhtbCApIHtcblx0XHRcdC8vIEZpeCBuYW1lIGFuZCBhdHRhY2ggaG9va3Ncblx0XHRcdG5hbWUgPSBqUXVlcnkucHJvcEZpeFsgbmFtZSBdIHx8IG5hbWU7XG5cdFx0XHRob29rcyA9IGpRdWVyeS5wcm9wSG9va3NbIG5hbWUgXTtcblx0XHR9XG5cblx0XHRpZiAoIHZhbHVlICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRyZXR1cm4gaG9va3MgJiYgXCJzZXRcIiBpbiBob29rcyAmJiAocmV0ID0gaG9va3Muc2V0KCBlbGVtLCB2YWx1ZSwgbmFtZSApKSAhPT0gdW5kZWZpbmVkID9cblx0XHRcdFx0cmV0IDpcblx0XHRcdFx0KCBlbGVtWyBuYW1lIF0gPSB2YWx1ZSApO1xuXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBob29rcyAmJiBcImdldFwiIGluIGhvb2tzICYmIChyZXQgPSBob29rcy5nZXQoIGVsZW0sIG5hbWUgKSkgIT09IG51bGwgP1xuXHRcdFx0XHRyZXQgOlxuXHRcdFx0XHRlbGVtWyBuYW1lIF07XG5cdFx0fVxuXHR9LFxuXG5cdHByb3BIb29rczoge1xuXHRcdHRhYkluZGV4OiB7XG5cdFx0XHRnZXQ6IGZ1bmN0aW9uKCBlbGVtICkge1xuXHRcdFx0XHRyZXR1cm4gZWxlbS5oYXNBdHRyaWJ1dGUoIFwidGFiaW5kZXhcIiApIHx8IHJmb2N1c2FibGUudGVzdCggZWxlbS5ub2RlTmFtZSApIHx8IGVsZW0uaHJlZiA/XG5cdFx0XHRcdFx0ZWxlbS50YWJJbmRleCA6XG5cdFx0XHRcdFx0LTE7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59KTtcblxuLy8gU3VwcG9ydDogSUU5K1xuLy8gU2VsZWN0ZWRuZXNzIGZvciBhbiBvcHRpb24gaW4gYW4gb3B0Z3JvdXAgY2FuIGJlIGluYWNjdXJhdGVcbmlmICggIXN1cHBvcnQub3B0U2VsZWN0ZWQgKSB7XG5cdGpRdWVyeS5wcm9wSG9va3Muc2VsZWN0ZWQgPSB7XG5cdFx0Z2V0OiBmdW5jdGlvbiggZWxlbSApIHtcblx0XHRcdHZhciBwYXJlbnQgPSBlbGVtLnBhcmVudE5vZGU7XG5cdFx0XHRpZiAoIHBhcmVudCAmJiBwYXJlbnQucGFyZW50Tm9kZSApIHtcblx0XHRcdFx0cGFyZW50LnBhcmVudE5vZGUuc2VsZWN0ZWRJbmRleDtcblx0XHRcdH1cblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fTtcbn1cblxualF1ZXJ5LmVhY2goW1xuXHRcInRhYkluZGV4XCIsXG5cdFwicmVhZE9ubHlcIixcblx0XCJtYXhMZW5ndGhcIixcblx0XCJjZWxsU3BhY2luZ1wiLFxuXHRcImNlbGxQYWRkaW5nXCIsXG5cdFwicm93U3BhblwiLFxuXHRcImNvbFNwYW5cIixcblx0XCJ1c2VNYXBcIixcblx0XCJmcmFtZUJvcmRlclwiLFxuXHRcImNvbnRlbnRFZGl0YWJsZVwiXG5dLCBmdW5jdGlvbigpIHtcblx0alF1ZXJ5LnByb3BGaXhbIHRoaXMudG9Mb3dlckNhc2UoKSBdID0gdGhpcztcbn0pO1xuXG5cblxuXG52YXIgcmNsYXNzID0gL1tcXHRcXHJcXG5cXGZdL2c7XG5cbmpRdWVyeS5mbi5leHRlbmQoe1xuXHRhZGRDbGFzczogZnVuY3Rpb24oIHZhbHVlICkge1xuXHRcdHZhciBjbGFzc2VzLCBlbGVtLCBjdXIsIGNsYXp6LCBqLCBmaW5hbFZhbHVlLFxuXHRcdFx0cHJvY2VlZCA9IHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiAmJiB2YWx1ZSxcblx0XHRcdGkgPSAwLFxuXHRcdFx0bGVuID0gdGhpcy5sZW5ndGg7XG5cblx0XHRpZiAoIGpRdWVyeS5pc0Z1bmN0aW9uKCB2YWx1ZSApICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiggaiApIHtcblx0XHRcdFx0alF1ZXJ5KCB0aGlzICkuYWRkQ2xhc3MoIHZhbHVlLmNhbGwoIHRoaXMsIGosIHRoaXMuY2xhc3NOYW1lICkgKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGlmICggcHJvY2VlZCApIHtcblx0XHRcdC8vIFRoZSBkaXNqdW5jdGlvbiBoZXJlIGlzIGZvciBiZXR0ZXIgY29tcHJlc3NpYmlsaXR5IChzZWUgcmVtb3ZlQ2xhc3MpXG5cdFx0XHRjbGFzc2VzID0gKCB2YWx1ZSB8fCBcIlwiICkubWF0Y2goIHJub3R3aGl0ZSApIHx8IFtdO1xuXG5cdFx0XHRmb3IgKCA7IGkgPCBsZW47IGkrKyApIHtcblx0XHRcdFx0ZWxlbSA9IHRoaXNbIGkgXTtcblx0XHRcdFx0Y3VyID0gZWxlbS5ub2RlVHlwZSA9PT0gMSAmJiAoIGVsZW0uY2xhc3NOYW1lID9cblx0XHRcdFx0XHQoIFwiIFwiICsgZWxlbS5jbGFzc05hbWUgKyBcIiBcIiApLnJlcGxhY2UoIHJjbGFzcywgXCIgXCIgKSA6XG5cdFx0XHRcdFx0XCIgXCJcblx0XHRcdFx0KTtcblxuXHRcdFx0XHRpZiAoIGN1ciApIHtcblx0XHRcdFx0XHRqID0gMDtcblx0XHRcdFx0XHR3aGlsZSAoIChjbGF6eiA9IGNsYXNzZXNbaisrXSkgKSB7XG5cdFx0XHRcdFx0XHRpZiAoIGN1ci5pbmRleE9mKCBcIiBcIiArIGNsYXp6ICsgXCIgXCIgKSA8IDAgKSB7XG5cdFx0XHRcdFx0XHRcdGN1ciArPSBjbGF6eiArIFwiIFwiO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIG9ubHkgYXNzaWduIGlmIGRpZmZlcmVudCB0byBhdm9pZCB1bm5lZWRlZCByZW5kZXJpbmcuXG5cdFx0XHRcdFx0ZmluYWxWYWx1ZSA9IGpRdWVyeS50cmltKCBjdXIgKTtcblx0XHRcdFx0XHRpZiAoIGVsZW0uY2xhc3NOYW1lICE9PSBmaW5hbFZhbHVlICkge1xuXHRcdFx0XHRcdFx0ZWxlbS5jbGFzc05hbWUgPSBmaW5hbFZhbHVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdHJlbW92ZUNsYXNzOiBmdW5jdGlvbiggdmFsdWUgKSB7XG5cdFx0dmFyIGNsYXNzZXMsIGVsZW0sIGN1ciwgY2xhenosIGosIGZpbmFsVmFsdWUsXG5cdFx0XHRwcm9jZWVkID0gYXJndW1lbnRzLmxlbmd0aCA9PT0gMCB8fCB0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgJiYgdmFsdWUsXG5cdFx0XHRpID0gMCxcblx0XHRcdGxlbiA9IHRoaXMubGVuZ3RoO1xuXG5cdFx0aWYgKCBqUXVlcnkuaXNGdW5jdGlvbiggdmFsdWUgKSApIHtcblx0XHRcdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oIGogKSB7XG5cdFx0XHRcdGpRdWVyeSggdGhpcyApLnJlbW92ZUNsYXNzKCB2YWx1ZS5jYWxsKCB0aGlzLCBqLCB0aGlzLmNsYXNzTmFtZSApICk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0aWYgKCBwcm9jZWVkICkge1xuXHRcdFx0Y2xhc3NlcyA9ICggdmFsdWUgfHwgXCJcIiApLm1hdGNoKCBybm90d2hpdGUgKSB8fCBbXTtcblxuXHRcdFx0Zm9yICggOyBpIDwgbGVuOyBpKysgKSB7XG5cdFx0XHRcdGVsZW0gPSB0aGlzWyBpIF07XG5cdFx0XHRcdC8vIFRoaXMgZXhwcmVzc2lvbiBpcyBoZXJlIGZvciBiZXR0ZXIgY29tcHJlc3NpYmlsaXR5IChzZWUgYWRkQ2xhc3MpXG5cdFx0XHRcdGN1ciA9IGVsZW0ubm9kZVR5cGUgPT09IDEgJiYgKCBlbGVtLmNsYXNzTmFtZSA/XG5cdFx0XHRcdFx0KCBcIiBcIiArIGVsZW0uY2xhc3NOYW1lICsgXCIgXCIgKS5yZXBsYWNlKCByY2xhc3MsIFwiIFwiICkgOlxuXHRcdFx0XHRcdFwiXCJcblx0XHRcdFx0KTtcblxuXHRcdFx0XHRpZiAoIGN1ciApIHtcblx0XHRcdFx0XHRqID0gMDtcblx0XHRcdFx0XHR3aGlsZSAoIChjbGF6eiA9IGNsYXNzZXNbaisrXSkgKSB7XG5cdFx0XHRcdFx0XHQvLyBSZW1vdmUgKmFsbCogaW5zdGFuY2VzXG5cdFx0XHRcdFx0XHR3aGlsZSAoIGN1ci5pbmRleE9mKCBcIiBcIiArIGNsYXp6ICsgXCIgXCIgKSA+PSAwICkge1xuXHRcdFx0XHRcdFx0XHRjdXIgPSBjdXIucmVwbGFjZSggXCIgXCIgKyBjbGF6eiArIFwiIFwiLCBcIiBcIiApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIG9ubHkgYXNzaWduIGlmIGRpZmZlcmVudCB0byBhdm9pZCB1bm5lZWRlZCByZW5kZXJpbmcuXG5cdFx0XHRcdFx0ZmluYWxWYWx1ZSA9IHZhbHVlID8galF1ZXJ5LnRyaW0oIGN1ciApIDogXCJcIjtcblx0XHRcdFx0XHRpZiAoIGVsZW0uY2xhc3NOYW1lICE9PSBmaW5hbFZhbHVlICkge1xuXHRcdFx0XHRcdFx0ZWxlbS5jbGFzc05hbWUgPSBmaW5hbFZhbHVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdHRvZ2dsZUNsYXNzOiBmdW5jdGlvbiggdmFsdWUsIHN0YXRlVmFsICkge1xuXHRcdHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuXG5cdFx0aWYgKCB0eXBlb2Ygc3RhdGVWYWwgPT09IFwiYm9vbGVhblwiICYmIHR5cGUgPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHRyZXR1cm4gc3RhdGVWYWwgPyB0aGlzLmFkZENsYXNzKCB2YWx1ZSApIDogdGhpcy5yZW1vdmVDbGFzcyggdmFsdWUgKTtcblx0XHR9XG5cblx0XHRpZiAoIGpRdWVyeS5pc0Z1bmN0aW9uKCB2YWx1ZSApICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiggaSApIHtcblx0XHRcdFx0alF1ZXJ5KCB0aGlzICkudG9nZ2xlQ2xhc3MoIHZhbHVlLmNhbGwodGhpcywgaSwgdGhpcy5jbGFzc05hbWUsIHN0YXRlVmFsKSwgc3RhdGVWYWwgKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoIHR5cGUgPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHRcdC8vIHRvZ2dsZSBpbmRpdmlkdWFsIGNsYXNzIG5hbWVzXG5cdFx0XHRcdHZhciBjbGFzc05hbWUsXG5cdFx0XHRcdFx0aSA9IDAsXG5cdFx0XHRcdFx0c2VsZiA9IGpRdWVyeSggdGhpcyApLFxuXHRcdFx0XHRcdGNsYXNzTmFtZXMgPSB2YWx1ZS5tYXRjaCggcm5vdHdoaXRlICkgfHwgW107XG5cblx0XHRcdFx0d2hpbGUgKCAoY2xhc3NOYW1lID0gY2xhc3NOYW1lc1sgaSsrIF0pICkge1xuXHRcdFx0XHRcdC8vIGNoZWNrIGVhY2ggY2xhc3NOYW1lIGdpdmVuLCBzcGFjZSBzZXBhcmF0ZWQgbGlzdFxuXHRcdFx0XHRcdGlmICggc2VsZi5oYXNDbGFzcyggY2xhc3NOYW1lICkgKSB7XG5cdFx0XHRcdFx0XHRzZWxmLnJlbW92ZUNsYXNzKCBjbGFzc05hbWUgKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c2VsZi5hZGRDbGFzcyggY2xhc3NOYW1lICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdC8vIFRvZ2dsZSB3aG9sZSBjbGFzcyBuYW1lXG5cdFx0XHR9IGVsc2UgaWYgKCB0eXBlID09PSBzdHJ1bmRlZmluZWQgfHwgdHlwZSA9PT0gXCJib29sZWFuXCIgKSB7XG5cdFx0XHRcdGlmICggdGhpcy5jbGFzc05hbWUgKSB7XG5cdFx0XHRcdFx0Ly8gc3RvcmUgY2xhc3NOYW1lIGlmIHNldFxuXHRcdFx0XHRcdGRhdGFfcHJpdi5zZXQoIHRoaXMsIFwiX19jbGFzc05hbWVfX1wiLCB0aGlzLmNsYXNzTmFtZSApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gSWYgdGhlIGVsZW1lbnQgaGFzIGEgY2xhc3MgbmFtZSBvciBpZiB3ZSdyZSBwYXNzZWQgXCJmYWxzZVwiLFxuXHRcdFx0XHQvLyB0aGVuIHJlbW92ZSB0aGUgd2hvbGUgY2xhc3NuYW1lIChpZiB0aGVyZSB3YXMgb25lLCB0aGUgYWJvdmUgc2F2ZWQgaXQpLlxuXHRcdFx0XHQvLyBPdGhlcndpc2UgYnJpbmcgYmFjayB3aGF0ZXZlciB3YXMgcHJldmlvdXNseSBzYXZlZCAoaWYgYW55dGhpbmcpLFxuXHRcdFx0XHQvLyBmYWxsaW5nIGJhY2sgdG8gdGhlIGVtcHR5IHN0cmluZyBpZiBub3RoaW5nIHdhcyBzdG9yZWQuXG5cdFx0XHRcdHRoaXMuY2xhc3NOYW1lID0gdGhpcy5jbGFzc05hbWUgfHwgdmFsdWUgPT09IGZhbHNlID8gXCJcIiA6IGRhdGFfcHJpdi5nZXQoIHRoaXMsIFwiX19jbGFzc05hbWVfX1wiICkgfHwgXCJcIjtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHRoYXNDbGFzczogZnVuY3Rpb24oIHNlbGVjdG9yICkge1xuXHRcdHZhciBjbGFzc05hbWUgPSBcIiBcIiArIHNlbGVjdG9yICsgXCIgXCIsXG5cdFx0XHRpID0gMCxcblx0XHRcdGwgPSB0aGlzLmxlbmd0aDtcblx0XHRmb3IgKCA7IGkgPCBsOyBpKysgKSB7XG5cdFx0XHRpZiAoIHRoaXNbaV0ubm9kZVR5cGUgPT09IDEgJiYgKFwiIFwiICsgdGhpc1tpXS5jbGFzc05hbWUgKyBcIiBcIikucmVwbGFjZShyY2xhc3MsIFwiIFwiKS5pbmRleE9mKCBjbGFzc05hbWUgKSA+PSAwICkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn0pO1xuXG5cblxuXG52YXIgcnJldHVybiA9IC9cXHIvZztcblxualF1ZXJ5LmZuLmV4dGVuZCh7XG5cdHZhbDogZnVuY3Rpb24oIHZhbHVlICkge1xuXHRcdHZhciBob29rcywgcmV0LCBpc0Z1bmN0aW9uLFxuXHRcdFx0ZWxlbSA9IHRoaXNbMF07XG5cblx0XHRpZiAoICFhcmd1bWVudHMubGVuZ3RoICkge1xuXHRcdFx0aWYgKCBlbGVtICkge1xuXHRcdFx0XHRob29rcyA9IGpRdWVyeS52YWxIb29rc1sgZWxlbS50eXBlIF0gfHwgalF1ZXJ5LnZhbEhvb2tzWyBlbGVtLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgXTtcblxuXHRcdFx0XHRpZiAoIGhvb2tzICYmIFwiZ2V0XCIgaW4gaG9va3MgJiYgKHJldCA9IGhvb2tzLmdldCggZWxlbSwgXCJ2YWx1ZVwiICkpICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJldDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldCA9IGVsZW0udmFsdWU7XG5cblx0XHRcdFx0cmV0dXJuIHR5cGVvZiByZXQgPT09IFwic3RyaW5nXCIgP1xuXHRcdFx0XHRcdC8vIGhhbmRsZSBtb3N0IGNvbW1vbiBzdHJpbmcgY2FzZXNcblx0XHRcdFx0XHRyZXQucmVwbGFjZShycmV0dXJuLCBcIlwiKSA6XG5cdFx0XHRcdFx0Ly8gaGFuZGxlIGNhc2VzIHdoZXJlIHZhbHVlIGlzIG51bGwvdW5kZWYgb3IgbnVtYmVyXG5cdFx0XHRcdFx0cmV0ID09IG51bGwgPyBcIlwiIDogcmV0O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aXNGdW5jdGlvbiA9IGpRdWVyeS5pc0Z1bmN0aW9uKCB2YWx1ZSApO1xuXG5cdFx0cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiggaSApIHtcblx0XHRcdHZhciB2YWw7XG5cblx0XHRcdGlmICggdGhpcy5ub2RlVHlwZSAhPT0gMSApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIGlzRnVuY3Rpb24gKSB7XG5cdFx0XHRcdHZhbCA9IHZhbHVlLmNhbGwoIHRoaXMsIGksIGpRdWVyeSggdGhpcyApLnZhbCgpICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YWwgPSB2YWx1ZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gVHJlYXQgbnVsbC91bmRlZmluZWQgYXMgXCJcIjsgY29udmVydCBudW1iZXJzIHRvIHN0cmluZ1xuXHRcdFx0aWYgKCB2YWwgPT0gbnVsbCApIHtcblx0XHRcdFx0dmFsID0gXCJcIjtcblxuXHRcdFx0fSBlbHNlIGlmICggdHlwZW9mIHZhbCA9PT0gXCJudW1iZXJcIiApIHtcblx0XHRcdFx0dmFsICs9IFwiXCI7XG5cblx0XHRcdH0gZWxzZSBpZiAoIGpRdWVyeS5pc0FycmF5KCB2YWwgKSApIHtcblx0XHRcdFx0dmFsID0galF1ZXJ5Lm1hcCggdmFsLCBmdW5jdGlvbiggdmFsdWUgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHZhbHVlID09IG51bGwgPyBcIlwiIDogdmFsdWUgKyBcIlwiO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0aG9va3MgPSBqUXVlcnkudmFsSG9va3NbIHRoaXMudHlwZSBdIHx8IGpRdWVyeS52YWxIb29rc1sgdGhpcy5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpIF07XG5cblx0XHRcdC8vIElmIHNldCByZXR1cm5zIHVuZGVmaW5lZCwgZmFsbCBiYWNrIHRvIG5vcm1hbCBzZXR0aW5nXG5cdFx0XHRpZiAoICFob29rcyB8fCAhKFwic2V0XCIgaW4gaG9va3MpIHx8IGhvb2tzLnNldCggdGhpcywgdmFsLCBcInZhbHVlXCIgKSA9PT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHR0aGlzLnZhbHVlID0gdmFsO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59KTtcblxualF1ZXJ5LmV4dGVuZCh7XG5cdHZhbEhvb2tzOiB7XG5cdFx0c2VsZWN0OiB7XG5cdFx0XHRnZXQ6IGZ1bmN0aW9uKCBlbGVtICkge1xuXHRcdFx0XHR2YXIgdmFsdWUsIG9wdGlvbixcblx0XHRcdFx0XHRvcHRpb25zID0gZWxlbS5vcHRpb25zLFxuXHRcdFx0XHRcdGluZGV4ID0gZWxlbS5zZWxlY3RlZEluZGV4LFxuXHRcdFx0XHRcdG9uZSA9IGVsZW0udHlwZSA9PT0gXCJzZWxlY3Qtb25lXCIgfHwgaW5kZXggPCAwLFxuXHRcdFx0XHRcdHZhbHVlcyA9IG9uZSA/IG51bGwgOiBbXSxcblx0XHRcdFx0XHRtYXggPSBvbmUgPyBpbmRleCArIDEgOiBvcHRpb25zLmxlbmd0aCxcblx0XHRcdFx0XHRpID0gaW5kZXggPCAwID9cblx0XHRcdFx0XHRcdG1heCA6XG5cdFx0XHRcdFx0XHRvbmUgPyBpbmRleCA6IDA7XG5cblx0XHRcdFx0Ly8gTG9vcCB0aHJvdWdoIGFsbCB0aGUgc2VsZWN0ZWQgb3B0aW9uc1xuXHRcdFx0XHRmb3IgKCA7IGkgPCBtYXg7IGkrKyApIHtcblx0XHRcdFx0XHRvcHRpb24gPSBvcHRpb25zWyBpIF07XG5cblx0XHRcdFx0XHQvLyBJRTYtOSBkb2Vzbid0IHVwZGF0ZSBzZWxlY3RlZCBhZnRlciBmb3JtIHJlc2V0ICgjMjU1MSlcblx0XHRcdFx0XHRpZiAoICggb3B0aW9uLnNlbGVjdGVkIHx8IGkgPT09IGluZGV4ICkgJiZcblx0XHRcdFx0XHRcdFx0Ly8gRG9uJ3QgcmV0dXJuIG9wdGlvbnMgdGhhdCBhcmUgZGlzYWJsZWQgb3IgaW4gYSBkaXNhYmxlZCBvcHRncm91cFxuXHRcdFx0XHRcdFx0XHQoIHN1cHBvcnQub3B0RGlzYWJsZWQgPyAhb3B0aW9uLmRpc2FibGVkIDogb3B0aW9uLmdldEF0dHJpYnV0ZSggXCJkaXNhYmxlZFwiICkgPT09IG51bGwgKSAmJlxuXHRcdFx0XHRcdFx0XHQoICFvcHRpb24ucGFyZW50Tm9kZS5kaXNhYmxlZCB8fCAhalF1ZXJ5Lm5vZGVOYW1lKCBvcHRpb24ucGFyZW50Tm9kZSwgXCJvcHRncm91cFwiICkgKSApIHtcblxuXHRcdFx0XHRcdFx0Ly8gR2V0IHRoZSBzcGVjaWZpYyB2YWx1ZSBmb3IgdGhlIG9wdGlvblxuXHRcdFx0XHRcdFx0dmFsdWUgPSBqUXVlcnkoIG9wdGlvbiApLnZhbCgpO1xuXG5cdFx0XHRcdFx0XHQvLyBXZSBkb24ndCBuZWVkIGFuIGFycmF5IGZvciBvbmUgc2VsZWN0c1xuXHRcdFx0XHRcdFx0aWYgKCBvbmUgKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8gTXVsdGktU2VsZWN0cyByZXR1cm4gYW4gYXJyYXlcblx0XHRcdFx0XHRcdHZhbHVlcy5wdXNoKCB2YWx1ZSApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiB2YWx1ZXM7XG5cdFx0XHR9LFxuXG5cdFx0XHRzZXQ6IGZ1bmN0aW9uKCBlbGVtLCB2YWx1ZSApIHtcblx0XHRcdFx0dmFyIG9wdGlvblNldCwgb3B0aW9uLFxuXHRcdFx0XHRcdG9wdGlvbnMgPSBlbGVtLm9wdGlvbnMsXG5cdFx0XHRcdFx0dmFsdWVzID0galF1ZXJ5Lm1ha2VBcnJheSggdmFsdWUgKSxcblx0XHRcdFx0XHRpID0gb3B0aW9ucy5sZW5ndGg7XG5cblx0XHRcdFx0d2hpbGUgKCBpLS0gKSB7XG5cdFx0XHRcdFx0b3B0aW9uID0gb3B0aW9uc1sgaSBdO1xuXHRcdFx0XHRcdGlmICggKG9wdGlvbi5zZWxlY3RlZCA9IGpRdWVyeS5pbkFycmF5KCBqUXVlcnkob3B0aW9uKS52YWwoKSwgdmFsdWVzICkgPj0gMCkgKSB7XG5cdFx0XHRcdFx0XHRvcHRpb25TZXQgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIGZvcmNlIGJyb3dzZXJzIHRvIGJlaGF2ZSBjb25zaXN0ZW50bHkgd2hlbiBub24tbWF0Y2hpbmcgdmFsdWUgaXMgc2V0XG5cdFx0XHRcdGlmICggIW9wdGlvblNldCApIHtcblx0XHRcdFx0XHRlbGVtLnNlbGVjdGVkSW5kZXggPSAtMTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdmFsdWVzO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufSk7XG5cbi8vIFJhZGlvcyBhbmQgY2hlY2tib3hlcyBnZXR0ZXIvc2V0dGVyXG5qUXVlcnkuZWFjaChbIFwicmFkaW9cIiwgXCJjaGVja2JveFwiIF0sIGZ1bmN0aW9uKCkge1xuXHRqUXVlcnkudmFsSG9va3NbIHRoaXMgXSA9IHtcblx0XHRzZXQ6IGZ1bmN0aW9uKCBlbGVtLCB2YWx1ZSApIHtcblx0XHRcdGlmICggalF1ZXJ5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG5cdFx0XHRcdHJldHVybiAoIGVsZW0uY2hlY2tlZCA9IGpRdWVyeS5pbkFycmF5KCBqUXVlcnkoZWxlbSkudmFsKCksIHZhbHVlICkgPj0gMCApO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0aWYgKCAhc3VwcG9ydC5jaGVja09uICkge1xuXHRcdGpRdWVyeS52YWxIb29rc1sgdGhpcyBdLmdldCA9IGZ1bmN0aW9uKCBlbGVtICkge1xuXHRcdFx0Ly8gU3VwcG9ydDogV2Via2l0XG5cdFx0XHQvLyBcIlwiIGlzIHJldHVybmVkIGluc3RlYWQgb2YgXCJvblwiIGlmIGEgdmFsdWUgaXNuJ3Qgc3BlY2lmaWVkXG5cdFx0XHRyZXR1cm4gZWxlbS5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKSA9PT0gbnVsbCA/IFwib25cIiA6IGVsZW0udmFsdWU7XG5cdFx0fTtcblx0fVxufSk7XG5cblxuXG5cbi8vIFJldHVybiBqUXVlcnkgZm9yIGF0dHJpYnV0ZXMtb25seSBpbmNsdXNpb25cblxuXG5qUXVlcnkuZWFjaCggKFwiYmx1ciBmb2N1cyBmb2N1c2luIGZvY3Vzb3V0IGxvYWQgcmVzaXplIHNjcm9sbCB1bmxvYWQgY2xpY2sgZGJsY2xpY2sgXCIgK1xuXHRcIm1vdXNlZG93biBtb3VzZXVwIG1vdXNlbW92ZSBtb3VzZW92ZXIgbW91c2VvdXQgbW91c2VlbnRlciBtb3VzZWxlYXZlIFwiICtcblx0XCJjaGFuZ2Ugc2VsZWN0IHN1Ym1pdCBrZXlkb3duIGtleXByZXNzIGtleXVwIGVycm9yIGNvbnRleHRtZW51XCIpLnNwbGl0KFwiIFwiKSwgZnVuY3Rpb24oIGksIG5hbWUgKSB7XG5cblx0Ly8gSGFuZGxlIGV2ZW50IGJpbmRpbmdcblx0alF1ZXJ5LmZuWyBuYW1lIF0gPSBmdW5jdGlvbiggZGF0YSwgZm4gKSB7XG5cdFx0cmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPiAwID9cblx0XHRcdHRoaXMub24oIG5hbWUsIG51bGwsIGRhdGEsIGZuICkgOlxuXHRcdFx0dGhpcy50cmlnZ2VyKCBuYW1lICk7XG5cdH07XG59KTtcblxualF1ZXJ5LmZuLmV4dGVuZCh7XG5cdGhvdmVyOiBmdW5jdGlvbiggZm5PdmVyLCBmbk91dCApIHtcblx0XHRyZXR1cm4gdGhpcy5tb3VzZWVudGVyKCBmbk92ZXIgKS5tb3VzZWxlYXZlKCBmbk91dCB8fCBmbk92ZXIgKTtcblx0fSxcblxuXHRiaW5kOiBmdW5jdGlvbiggdHlwZXMsIGRhdGEsIGZuICkge1xuXHRcdHJldHVybiB0aGlzLm9uKCB0eXBlcywgbnVsbCwgZGF0YSwgZm4gKTtcblx0fSxcblx0dW5iaW5kOiBmdW5jdGlvbiggdHlwZXMsIGZuICkge1xuXHRcdHJldHVybiB0aGlzLm9mZiggdHlwZXMsIG51bGwsIGZuICk7XG5cdH0sXG5cblx0ZGVsZWdhdGU6IGZ1bmN0aW9uKCBzZWxlY3RvciwgdHlwZXMsIGRhdGEsIGZuICkge1xuXHRcdHJldHVybiB0aGlzLm9uKCB0eXBlcywgc2VsZWN0b3IsIGRhdGEsIGZuICk7XG5cdH0sXG5cdHVuZGVsZWdhdGU6IGZ1bmN0aW9uKCBzZWxlY3RvciwgdHlwZXMsIGZuICkge1xuXHRcdC8vICggbmFtZXNwYWNlICkgb3IgKCBzZWxlY3RvciwgdHlwZXMgWywgZm5dIClcblx0XHRyZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA9PT0gMSA/IHRoaXMub2ZmKCBzZWxlY3RvciwgXCIqKlwiICkgOiB0aGlzLm9mZiggdHlwZXMsIHNlbGVjdG9yIHx8IFwiKipcIiwgZm4gKTtcblx0fVxufSk7XG5cblxudmFyIG5vbmNlID0galF1ZXJ5Lm5vdygpO1xuXG52YXIgcnF1ZXJ5ID0gKC9cXD8vKTtcblxuXG5cbi8vIFN1cHBvcnQ6IEFuZHJvaWQgMi4zXG4vLyBXb3JrYXJvdW5kIGZhaWx1cmUgdG8gc3RyaW5nLWNhc3QgbnVsbCBpbnB1dFxualF1ZXJ5LnBhcnNlSlNPTiA9IGZ1bmN0aW9uKCBkYXRhICkge1xuXHRyZXR1cm4gSlNPTi5wYXJzZSggZGF0YSArIFwiXCIgKTtcbn07XG5cblxuLy8gQ3Jvc3MtYnJvd3NlciB4bWwgcGFyc2luZ1xualF1ZXJ5LnBhcnNlWE1MID0gZnVuY3Rpb24oIGRhdGEgKSB7XG5cdHZhciB4bWwsIHRtcDtcblx0aWYgKCAhZGF0YSB8fCB0eXBlb2YgZGF0YSAhPT0gXCJzdHJpbmdcIiApIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdC8vIFN1cHBvcnQ6IElFOVxuXHR0cnkge1xuXHRcdHRtcCA9IG5ldyBET01QYXJzZXIoKTtcblx0XHR4bWwgPSB0bXAucGFyc2VGcm9tU3RyaW5nKCBkYXRhLCBcInRleHQveG1sXCIgKTtcblx0fSBjYXRjaCAoIGUgKSB7XG5cdFx0eG1sID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0aWYgKCAheG1sIHx8IHhtbC5nZXRFbGVtZW50c0J5VGFnTmFtZSggXCJwYXJzZXJlcnJvclwiICkubGVuZ3RoICkge1xuXHRcdGpRdWVyeS5lcnJvciggXCJJbnZhbGlkIFhNTDogXCIgKyBkYXRhICk7XG5cdH1cblx0cmV0dXJuIHhtbDtcbn07XG5cblxudmFyXG5cdC8vIERvY3VtZW50IGxvY2F0aW9uXG5cdGFqYXhMb2NQYXJ0cyxcblx0YWpheExvY2F0aW9uLFxuXG5cdHJoYXNoID0gLyMuKiQvLFxuXHRydHMgPSAvKFs/Jl0pXz1bXiZdKi8sXG5cdHJoZWFkZXJzID0gL14oLio/KTpbIFxcdF0qKFteXFxyXFxuXSopJC9tZyxcblx0Ly8gIzc2NTMsICM4MTI1LCAjODE1MjogbG9jYWwgcHJvdG9jb2wgZGV0ZWN0aW9uXG5cdHJsb2NhbFByb3RvY29sID0gL14oPzphYm91dHxhcHB8YXBwLXN0b3JhZ2V8ListZXh0ZW5zaW9ufGZpbGV8cmVzfHdpZGdldCk6JC8sXG5cdHJub0NvbnRlbnQgPSAvXig/OkdFVHxIRUFEKSQvLFxuXHRycHJvdG9jb2wgPSAvXlxcL1xcLy8sXG5cdHJ1cmwgPSAvXihbXFx3ListXSs6KSg/OlxcL1xcLyg/OlteXFwvPyNdKkB8KShbXlxcLz8jOl0qKSg/OjooXFxkKyl8KXwpLyxcblxuXHQvKiBQcmVmaWx0ZXJzXG5cdCAqIDEpIFRoZXkgYXJlIHVzZWZ1bCB0byBpbnRyb2R1Y2UgY3VzdG9tIGRhdGFUeXBlcyAoc2VlIGFqYXgvanNvbnAuanMgZm9yIGFuIGV4YW1wbGUpXG5cdCAqIDIpIFRoZXNlIGFyZSBjYWxsZWQ6XG5cdCAqICAgIC0gQkVGT1JFIGFza2luZyBmb3IgYSB0cmFuc3BvcnRcblx0ICogICAgLSBBRlRFUiBwYXJhbSBzZXJpYWxpemF0aW9uIChzLmRhdGEgaXMgYSBzdHJpbmcgaWYgcy5wcm9jZXNzRGF0YSBpcyB0cnVlKVxuXHQgKiAzKSBrZXkgaXMgdGhlIGRhdGFUeXBlXG5cdCAqIDQpIHRoZSBjYXRjaGFsbCBzeW1ib2wgXCIqXCIgY2FuIGJlIHVzZWRcblx0ICogNSkgZXhlY3V0aW9uIHdpbGwgc3RhcnQgd2l0aCB0cmFuc3BvcnQgZGF0YVR5cGUgYW5kIFRIRU4gY29udGludWUgZG93biB0byBcIipcIiBpZiBuZWVkZWRcblx0ICovXG5cdHByZWZpbHRlcnMgPSB7fSxcblxuXHQvKiBUcmFuc3BvcnRzIGJpbmRpbmdzXG5cdCAqIDEpIGtleSBpcyB0aGUgZGF0YVR5cGVcblx0ICogMikgdGhlIGNhdGNoYWxsIHN5bWJvbCBcIipcIiBjYW4gYmUgdXNlZFxuXHQgKiAzKSBzZWxlY3Rpb24gd2lsbCBzdGFydCB3aXRoIHRyYW5zcG9ydCBkYXRhVHlwZSBhbmQgVEhFTiBnbyB0byBcIipcIiBpZiBuZWVkZWRcblx0ICovXG5cdHRyYW5zcG9ydHMgPSB7fSxcblxuXHQvLyBBdm9pZCBjb21tZW50LXByb2xvZyBjaGFyIHNlcXVlbmNlICgjMTAwOTgpOyBtdXN0IGFwcGVhc2UgbGludCBhbmQgZXZhZGUgY29tcHJlc3Npb25cblx0YWxsVHlwZXMgPSBcIiovXCIuY29uY2F0KFwiKlwiKTtcblxuLy8gIzgxMzgsIElFIG1heSB0aHJvdyBhbiBleGNlcHRpb24gd2hlbiBhY2Nlc3Npbmdcbi8vIGEgZmllbGQgZnJvbSB3aW5kb3cubG9jYXRpb24gaWYgZG9jdW1lbnQuZG9tYWluIGhhcyBiZWVuIHNldFxudHJ5IHtcblx0YWpheExvY2F0aW9uID0gbG9jYXRpb24uaHJlZjtcbn0gY2F0Y2goIGUgKSB7XG5cdC8vIFVzZSB0aGUgaHJlZiBhdHRyaWJ1dGUgb2YgYW4gQSBlbGVtZW50XG5cdC8vIHNpbmNlIElFIHdpbGwgbW9kaWZ5IGl0IGdpdmVuIGRvY3VtZW50LmxvY2F0aW9uXG5cdGFqYXhMb2NhdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoIFwiYVwiICk7XG5cdGFqYXhMb2NhdGlvbi5ocmVmID0gXCJcIjtcblx0YWpheExvY2F0aW9uID0gYWpheExvY2F0aW9uLmhyZWY7XG59XG5cbi8vIFNlZ21lbnQgbG9jYXRpb24gaW50byBwYXJ0c1xuYWpheExvY1BhcnRzID0gcnVybC5leGVjKCBhamF4TG9jYXRpb24udG9Mb3dlckNhc2UoKSApIHx8IFtdO1xuXG4vLyBCYXNlIFwiY29uc3RydWN0b3JcIiBmb3IgalF1ZXJ5LmFqYXhQcmVmaWx0ZXIgYW5kIGpRdWVyeS5hamF4VHJhbnNwb3J0XG5mdW5jdGlvbiBhZGRUb1ByZWZpbHRlcnNPclRyYW5zcG9ydHMoIHN0cnVjdHVyZSApIHtcblxuXHQvLyBkYXRhVHlwZUV4cHJlc3Npb24gaXMgb3B0aW9uYWwgYW5kIGRlZmF1bHRzIHRvIFwiKlwiXG5cdHJldHVybiBmdW5jdGlvbiggZGF0YVR5cGVFeHByZXNzaW9uLCBmdW5jICkge1xuXG5cdFx0aWYgKCB0eXBlb2YgZGF0YVR5cGVFeHByZXNzaW9uICE9PSBcInN0cmluZ1wiICkge1xuXHRcdFx0ZnVuYyA9IGRhdGFUeXBlRXhwcmVzc2lvbjtcblx0XHRcdGRhdGFUeXBlRXhwcmVzc2lvbiA9IFwiKlwiO1xuXHRcdH1cblxuXHRcdHZhciBkYXRhVHlwZSxcblx0XHRcdGkgPSAwLFxuXHRcdFx0ZGF0YVR5cGVzID0gZGF0YVR5cGVFeHByZXNzaW9uLnRvTG93ZXJDYXNlKCkubWF0Y2goIHJub3R3aGl0ZSApIHx8IFtdO1xuXG5cdFx0aWYgKCBqUXVlcnkuaXNGdW5jdGlvbiggZnVuYyApICkge1xuXHRcdFx0Ly8gRm9yIGVhY2ggZGF0YVR5cGUgaW4gdGhlIGRhdGFUeXBlRXhwcmVzc2lvblxuXHRcdFx0d2hpbGUgKCAoZGF0YVR5cGUgPSBkYXRhVHlwZXNbaSsrXSkgKSB7XG5cdFx0XHRcdC8vIFByZXBlbmQgaWYgcmVxdWVzdGVkXG5cdFx0XHRcdGlmICggZGF0YVR5cGVbMF0gPT09IFwiK1wiICkge1xuXHRcdFx0XHRcdGRhdGFUeXBlID0gZGF0YVR5cGUuc2xpY2UoIDEgKSB8fCBcIipcIjtcblx0XHRcdFx0XHQoc3RydWN0dXJlWyBkYXRhVHlwZSBdID0gc3RydWN0dXJlWyBkYXRhVHlwZSBdIHx8IFtdKS51bnNoaWZ0KCBmdW5jICk7XG5cblx0XHRcdFx0Ly8gT3RoZXJ3aXNlIGFwcGVuZFxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdChzdHJ1Y3R1cmVbIGRhdGFUeXBlIF0gPSBzdHJ1Y3R1cmVbIGRhdGFUeXBlIF0gfHwgW10pLnB1c2goIGZ1bmMgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcbn1cblxuLy8gQmFzZSBpbnNwZWN0aW9uIGZ1bmN0aW9uIGZvciBwcmVmaWx0ZXJzIGFuZCB0cmFuc3BvcnRzXG5mdW5jdGlvbiBpbnNwZWN0UHJlZmlsdGVyc09yVHJhbnNwb3J0cyggc3RydWN0dXJlLCBvcHRpb25zLCBvcmlnaW5hbE9wdGlvbnMsIGpxWEhSICkge1xuXG5cdHZhciBpbnNwZWN0ZWQgPSB7fSxcblx0XHRzZWVraW5nVHJhbnNwb3J0ID0gKCBzdHJ1Y3R1cmUgPT09IHRyYW5zcG9ydHMgKTtcblxuXHRmdW5jdGlvbiBpbnNwZWN0KCBkYXRhVHlwZSApIHtcblx0XHR2YXIgc2VsZWN0ZWQ7XG5cdFx0aW5zcGVjdGVkWyBkYXRhVHlwZSBdID0gdHJ1ZTtcblx0XHRqUXVlcnkuZWFjaCggc3RydWN0dXJlWyBkYXRhVHlwZSBdIHx8IFtdLCBmdW5jdGlvbiggXywgcHJlZmlsdGVyT3JGYWN0b3J5ICkge1xuXHRcdFx0dmFyIGRhdGFUeXBlT3JUcmFuc3BvcnQgPSBwcmVmaWx0ZXJPckZhY3RvcnkoIG9wdGlvbnMsIG9yaWdpbmFsT3B0aW9ucywganFYSFIgKTtcblx0XHRcdGlmICggdHlwZW9mIGRhdGFUeXBlT3JUcmFuc3BvcnQgPT09IFwic3RyaW5nXCIgJiYgIXNlZWtpbmdUcmFuc3BvcnQgJiYgIWluc3BlY3RlZFsgZGF0YVR5cGVPclRyYW5zcG9ydCBdICkge1xuXHRcdFx0XHRvcHRpb25zLmRhdGFUeXBlcy51bnNoaWZ0KCBkYXRhVHlwZU9yVHJhbnNwb3J0ICk7XG5cdFx0XHRcdGluc3BlY3QoIGRhdGFUeXBlT3JUcmFuc3BvcnQgKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSBlbHNlIGlmICggc2Vla2luZ1RyYW5zcG9ydCApIHtcblx0XHRcdFx0cmV0dXJuICEoIHNlbGVjdGVkID0gZGF0YVR5cGVPclRyYW5zcG9ydCApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBzZWxlY3RlZDtcblx0fVxuXG5cdHJldHVybiBpbnNwZWN0KCBvcHRpb25zLmRhdGFUeXBlc1sgMCBdICkgfHwgIWluc3BlY3RlZFsgXCIqXCIgXSAmJiBpbnNwZWN0KCBcIipcIiApO1xufVxuXG4vLyBBIHNwZWNpYWwgZXh0ZW5kIGZvciBhamF4IG9wdGlvbnNcbi8vIHRoYXQgdGFrZXMgXCJmbGF0XCIgb3B0aW9ucyAobm90IHRvIGJlIGRlZXAgZXh0ZW5kZWQpXG4vLyBGaXhlcyAjOTg4N1xuZnVuY3Rpb24gYWpheEV4dGVuZCggdGFyZ2V0LCBzcmMgKSB7XG5cdHZhciBrZXksIGRlZXAsXG5cdFx0ZmxhdE9wdGlvbnMgPSBqUXVlcnkuYWpheFNldHRpbmdzLmZsYXRPcHRpb25zIHx8IHt9O1xuXG5cdGZvciAoIGtleSBpbiBzcmMgKSB7XG5cdFx0aWYgKCBzcmNbIGtleSBdICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHQoIGZsYXRPcHRpb25zWyBrZXkgXSA/IHRhcmdldCA6ICggZGVlcCB8fCAoZGVlcCA9IHt9KSApIClbIGtleSBdID0gc3JjWyBrZXkgXTtcblx0XHR9XG5cdH1cblx0aWYgKCBkZWVwICkge1xuXHRcdGpRdWVyeS5leHRlbmQoIHRydWUsIHRhcmdldCwgZGVlcCApO1xuXHR9XG5cblx0cmV0dXJuIHRhcmdldDtcbn1cblxuLyogSGFuZGxlcyByZXNwb25zZXMgdG8gYW4gYWpheCByZXF1ZXN0OlxuICogLSBmaW5kcyB0aGUgcmlnaHQgZGF0YVR5cGUgKG1lZGlhdGVzIGJldHdlZW4gY29udGVudC10eXBlIGFuZCBleHBlY3RlZCBkYXRhVHlwZSlcbiAqIC0gcmV0dXJucyB0aGUgY29ycmVzcG9uZGluZyByZXNwb25zZVxuICovXG5mdW5jdGlvbiBhamF4SGFuZGxlUmVzcG9uc2VzKCBzLCBqcVhIUiwgcmVzcG9uc2VzICkge1xuXG5cdHZhciBjdCwgdHlwZSwgZmluYWxEYXRhVHlwZSwgZmlyc3REYXRhVHlwZSxcblx0XHRjb250ZW50cyA9IHMuY29udGVudHMsXG5cdFx0ZGF0YVR5cGVzID0gcy5kYXRhVHlwZXM7XG5cblx0Ly8gUmVtb3ZlIGF1dG8gZGF0YVR5cGUgYW5kIGdldCBjb250ZW50LXR5cGUgaW4gdGhlIHByb2Nlc3Ncblx0d2hpbGUgKCBkYXRhVHlwZXNbIDAgXSA9PT0gXCIqXCIgKSB7XG5cdFx0ZGF0YVR5cGVzLnNoaWZ0KCk7XG5cdFx0aWYgKCBjdCA9PT0gdW5kZWZpbmVkICkge1xuXHRcdFx0Y3QgPSBzLm1pbWVUeXBlIHx8IGpxWEhSLmdldFJlc3BvbnNlSGVhZGVyKFwiQ29udGVudC1UeXBlXCIpO1xuXHRcdH1cblx0fVxuXG5cdC8vIENoZWNrIGlmIHdlJ3JlIGRlYWxpbmcgd2l0aCBhIGtub3duIGNvbnRlbnQtdHlwZVxuXHRpZiAoIGN0ICkge1xuXHRcdGZvciAoIHR5cGUgaW4gY29udGVudHMgKSB7XG5cdFx0XHRpZiAoIGNvbnRlbnRzWyB0eXBlIF0gJiYgY29udGVudHNbIHR5cGUgXS50ZXN0KCBjdCApICkge1xuXHRcdFx0XHRkYXRhVHlwZXMudW5zaGlmdCggdHlwZSApO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBDaGVjayB0byBzZWUgaWYgd2UgaGF2ZSBhIHJlc3BvbnNlIGZvciB0aGUgZXhwZWN0ZWQgZGF0YVR5cGVcblx0aWYgKCBkYXRhVHlwZXNbIDAgXSBpbiByZXNwb25zZXMgKSB7XG5cdFx0ZmluYWxEYXRhVHlwZSA9IGRhdGFUeXBlc1sgMCBdO1xuXHR9IGVsc2Uge1xuXHRcdC8vIFRyeSBjb252ZXJ0aWJsZSBkYXRhVHlwZXNcblx0XHRmb3IgKCB0eXBlIGluIHJlc3BvbnNlcyApIHtcblx0XHRcdGlmICggIWRhdGFUeXBlc1sgMCBdIHx8IHMuY29udmVydGVyc1sgdHlwZSArIFwiIFwiICsgZGF0YVR5cGVzWzBdIF0gKSB7XG5cdFx0XHRcdGZpbmFsRGF0YVR5cGUgPSB0eXBlO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdGlmICggIWZpcnN0RGF0YVR5cGUgKSB7XG5cdFx0XHRcdGZpcnN0RGF0YVR5cGUgPSB0eXBlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBPciBqdXN0IHVzZSBmaXJzdCBvbmVcblx0XHRmaW5hbERhdGFUeXBlID0gZmluYWxEYXRhVHlwZSB8fCBmaXJzdERhdGFUeXBlO1xuXHR9XG5cblx0Ly8gSWYgd2UgZm91bmQgYSBkYXRhVHlwZVxuXHQvLyBXZSBhZGQgdGhlIGRhdGFUeXBlIHRvIHRoZSBsaXN0IGlmIG5lZWRlZFxuXHQvLyBhbmQgcmV0dXJuIHRoZSBjb3JyZXNwb25kaW5nIHJlc3BvbnNlXG5cdGlmICggZmluYWxEYXRhVHlwZSApIHtcblx0XHRpZiAoIGZpbmFsRGF0YVR5cGUgIT09IGRhdGFUeXBlc1sgMCBdICkge1xuXHRcdFx0ZGF0YVR5cGVzLnVuc2hpZnQoIGZpbmFsRGF0YVR5cGUgKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3BvbnNlc1sgZmluYWxEYXRhVHlwZSBdO1xuXHR9XG59XG5cbi8qIENoYWluIGNvbnZlcnNpb25zIGdpdmVuIHRoZSByZXF1ZXN0IGFuZCB0aGUgb3JpZ2luYWwgcmVzcG9uc2VcbiAqIEFsc28gc2V0cyB0aGUgcmVzcG9uc2VYWFggZmllbGRzIG9uIHRoZSBqcVhIUiBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBhamF4Q29udmVydCggcywgcmVzcG9uc2UsIGpxWEhSLCBpc1N1Y2Nlc3MgKSB7XG5cdHZhciBjb252MiwgY3VycmVudCwgY29udiwgdG1wLCBwcmV2LFxuXHRcdGNvbnZlcnRlcnMgPSB7fSxcblx0XHQvLyBXb3JrIHdpdGggYSBjb3B5IG9mIGRhdGFUeXBlcyBpbiBjYXNlIHdlIG5lZWQgdG8gbW9kaWZ5IGl0IGZvciBjb252ZXJzaW9uXG5cdFx0ZGF0YVR5cGVzID0gcy5kYXRhVHlwZXMuc2xpY2UoKTtcblxuXHQvLyBDcmVhdGUgY29udmVydGVycyBtYXAgd2l0aCBsb3dlcmNhc2VkIGtleXNcblx0aWYgKCBkYXRhVHlwZXNbIDEgXSApIHtcblx0XHRmb3IgKCBjb252IGluIHMuY29udmVydGVycyApIHtcblx0XHRcdGNvbnZlcnRlcnNbIGNvbnYudG9Mb3dlckNhc2UoKSBdID0gcy5jb252ZXJ0ZXJzWyBjb252IF07XG5cdFx0fVxuXHR9XG5cblx0Y3VycmVudCA9IGRhdGFUeXBlcy5zaGlmdCgpO1xuXG5cdC8vIENvbnZlcnQgdG8gZWFjaCBzZXF1ZW50aWFsIGRhdGFUeXBlXG5cdHdoaWxlICggY3VycmVudCApIHtcblxuXHRcdGlmICggcy5yZXNwb25zZUZpZWxkc1sgY3VycmVudCBdICkge1xuXHRcdFx0anFYSFJbIHMucmVzcG9uc2VGaWVsZHNbIGN1cnJlbnQgXSBdID0gcmVzcG9uc2U7XG5cdFx0fVxuXG5cdFx0Ly8gQXBwbHkgdGhlIGRhdGFGaWx0ZXIgaWYgcHJvdmlkZWRcblx0XHRpZiAoICFwcmV2ICYmIGlzU3VjY2VzcyAmJiBzLmRhdGFGaWx0ZXIgKSB7XG5cdFx0XHRyZXNwb25zZSA9IHMuZGF0YUZpbHRlciggcmVzcG9uc2UsIHMuZGF0YVR5cGUgKTtcblx0XHR9XG5cblx0XHRwcmV2ID0gY3VycmVudDtcblx0XHRjdXJyZW50ID0gZGF0YVR5cGVzLnNoaWZ0KCk7XG5cblx0XHRpZiAoIGN1cnJlbnQgKSB7XG5cblx0XHQvLyBUaGVyZSdzIG9ubHkgd29yayB0byBkbyBpZiBjdXJyZW50IGRhdGFUeXBlIGlzIG5vbi1hdXRvXG5cdFx0XHRpZiAoIGN1cnJlbnQgPT09IFwiKlwiICkge1xuXG5cdFx0XHRcdGN1cnJlbnQgPSBwcmV2O1xuXG5cdFx0XHQvLyBDb252ZXJ0IHJlc3BvbnNlIGlmIHByZXYgZGF0YVR5cGUgaXMgbm9uLWF1dG8gYW5kIGRpZmZlcnMgZnJvbSBjdXJyZW50XG5cdFx0XHR9IGVsc2UgaWYgKCBwcmV2ICE9PSBcIipcIiAmJiBwcmV2ICE9PSBjdXJyZW50ICkge1xuXG5cdFx0XHRcdC8vIFNlZWsgYSBkaXJlY3QgY29udmVydGVyXG5cdFx0XHRcdGNvbnYgPSBjb252ZXJ0ZXJzWyBwcmV2ICsgXCIgXCIgKyBjdXJyZW50IF0gfHwgY29udmVydGVyc1sgXCIqIFwiICsgY3VycmVudCBdO1xuXG5cdFx0XHRcdC8vIElmIG5vbmUgZm91bmQsIHNlZWsgYSBwYWlyXG5cdFx0XHRcdGlmICggIWNvbnYgKSB7XG5cdFx0XHRcdFx0Zm9yICggY29udjIgaW4gY29udmVydGVycyApIHtcblxuXHRcdFx0XHRcdFx0Ly8gSWYgY29udjIgb3V0cHV0cyBjdXJyZW50XG5cdFx0XHRcdFx0XHR0bXAgPSBjb252Mi5zcGxpdCggXCIgXCIgKTtcblx0XHRcdFx0XHRcdGlmICggdG1wWyAxIF0gPT09IGN1cnJlbnQgKSB7XG5cblx0XHRcdFx0XHRcdFx0Ly8gSWYgcHJldiBjYW4gYmUgY29udmVydGVkIHRvIGFjY2VwdGVkIGlucHV0XG5cdFx0XHRcdFx0XHRcdGNvbnYgPSBjb252ZXJ0ZXJzWyBwcmV2ICsgXCIgXCIgKyB0bXBbIDAgXSBdIHx8XG5cdFx0XHRcdFx0XHRcdFx0Y29udmVydGVyc1sgXCIqIFwiICsgdG1wWyAwIF0gXTtcblx0XHRcdFx0XHRcdFx0aWYgKCBjb252ICkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIENvbmRlbnNlIGVxdWl2YWxlbmNlIGNvbnZlcnRlcnNcblx0XHRcdFx0XHRcdFx0XHRpZiAoIGNvbnYgPT09IHRydWUgKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb252ID0gY29udmVydGVyc1sgY29udjIgXTtcblxuXHRcdFx0XHRcdFx0XHRcdC8vIE90aGVyd2lzZSwgaW5zZXJ0IHRoZSBpbnRlcm1lZGlhdGUgZGF0YVR5cGVcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKCBjb252ZXJ0ZXJzWyBjb252MiBdICE9PSB0cnVlICkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y3VycmVudCA9IHRtcFsgMCBdO1xuXHRcdFx0XHRcdFx0XHRcdFx0ZGF0YVR5cGVzLnVuc2hpZnQoIHRtcFsgMSBdICk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gQXBwbHkgY29udmVydGVyIChpZiBub3QgYW4gZXF1aXZhbGVuY2UpXG5cdFx0XHRcdGlmICggY29udiAhPT0gdHJ1ZSApIHtcblxuXHRcdFx0XHRcdC8vIFVubGVzcyBlcnJvcnMgYXJlIGFsbG93ZWQgdG8gYnViYmxlLCBjYXRjaCBhbmQgcmV0dXJuIHRoZW1cblx0XHRcdFx0XHRpZiAoIGNvbnYgJiYgc1sgXCJ0aHJvd3NcIiBdICkge1xuXHRcdFx0XHRcdFx0cmVzcG9uc2UgPSBjb252KCByZXNwb25zZSApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRyZXNwb25zZSA9IGNvbnYoIHJlc3BvbnNlICk7XG5cdFx0XHRcdFx0XHR9IGNhdGNoICggZSApIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHsgc3RhdGU6IFwicGFyc2VyZXJyb3JcIiwgZXJyb3I6IGNvbnYgPyBlIDogXCJObyBjb252ZXJzaW9uIGZyb20gXCIgKyBwcmV2ICsgXCIgdG8gXCIgKyBjdXJyZW50IH07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHsgc3RhdGU6IFwic3VjY2Vzc1wiLCBkYXRhOiByZXNwb25zZSB9O1xufVxuXG5qUXVlcnkuZXh0ZW5kKHtcblxuXHQvLyBDb3VudGVyIGZvciBob2xkaW5nIHRoZSBudW1iZXIgb2YgYWN0aXZlIHF1ZXJpZXNcblx0YWN0aXZlOiAwLFxuXG5cdC8vIExhc3QtTW9kaWZpZWQgaGVhZGVyIGNhY2hlIGZvciBuZXh0IHJlcXVlc3Rcblx0bGFzdE1vZGlmaWVkOiB7fSxcblx0ZXRhZzoge30sXG5cblx0YWpheFNldHRpbmdzOiB7XG5cdFx0dXJsOiBhamF4TG9jYXRpb24sXG5cdFx0dHlwZTogXCJHRVRcIixcblx0XHRpc0xvY2FsOiBybG9jYWxQcm90b2NvbC50ZXN0KCBhamF4TG9jUGFydHNbIDEgXSApLFxuXHRcdGdsb2JhbDogdHJ1ZSxcblx0XHRwcm9jZXNzRGF0YTogdHJ1ZSxcblx0XHRhc3luYzogdHJ1ZSxcblx0XHRjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7IGNoYXJzZXQ9VVRGLThcIixcblx0XHQvKlxuXHRcdHRpbWVvdXQ6IDAsXG5cdFx0ZGF0YTogbnVsbCxcblx0XHRkYXRhVHlwZTogbnVsbCxcblx0XHR1c2VybmFtZTogbnVsbCxcblx0XHRwYXNzd29yZDogbnVsbCxcblx0XHRjYWNoZTogbnVsbCxcblx0XHR0aHJvd3M6IGZhbHNlLFxuXHRcdHRyYWRpdGlvbmFsOiBmYWxzZSxcblx0XHRoZWFkZXJzOiB7fSxcblx0XHQqL1xuXG5cdFx0YWNjZXB0czoge1xuXHRcdFx0XCIqXCI6IGFsbFR5cGVzLFxuXHRcdFx0dGV4dDogXCJ0ZXh0L3BsYWluXCIsXG5cdFx0XHRodG1sOiBcInRleHQvaHRtbFwiLFxuXHRcdFx0eG1sOiBcImFwcGxpY2F0aW9uL3htbCwgdGV4dC94bWxcIixcblx0XHRcdGpzb246IFwiYXBwbGljYXRpb24vanNvbiwgdGV4dC9qYXZhc2NyaXB0XCJcblx0XHR9LFxuXG5cdFx0Y29udGVudHM6IHtcblx0XHRcdHhtbDogL3htbC8sXG5cdFx0XHRodG1sOiAvaHRtbC8sXG5cdFx0XHRqc29uOiAvanNvbi9cblx0XHR9LFxuXG5cdFx0cmVzcG9uc2VGaWVsZHM6IHtcblx0XHRcdHhtbDogXCJyZXNwb25zZVhNTFwiLFxuXHRcdFx0dGV4dDogXCJyZXNwb25zZVRleHRcIixcblx0XHRcdGpzb246IFwicmVzcG9uc2VKU09OXCJcblx0XHR9LFxuXG5cdFx0Ly8gRGF0YSBjb252ZXJ0ZXJzXG5cdFx0Ly8gS2V5cyBzZXBhcmF0ZSBzb3VyY2UgKG9yIGNhdGNoYWxsIFwiKlwiKSBhbmQgZGVzdGluYXRpb24gdHlwZXMgd2l0aCBhIHNpbmdsZSBzcGFjZVxuXHRcdGNvbnZlcnRlcnM6IHtcblxuXHRcdFx0Ly8gQ29udmVydCBhbnl0aGluZyB0byB0ZXh0XG5cdFx0XHRcIiogdGV4dFwiOiBTdHJpbmcsXG5cblx0XHRcdC8vIFRleHQgdG8gaHRtbCAodHJ1ZSA9IG5vIHRyYW5zZm9ybWF0aW9uKVxuXHRcdFx0XCJ0ZXh0IGh0bWxcIjogdHJ1ZSxcblxuXHRcdFx0Ly8gRXZhbHVhdGUgdGV4dCBhcyBhIGpzb24gZXhwcmVzc2lvblxuXHRcdFx0XCJ0ZXh0IGpzb25cIjogalF1ZXJ5LnBhcnNlSlNPTixcblxuXHRcdFx0Ly8gUGFyc2UgdGV4dCBhcyB4bWxcblx0XHRcdFwidGV4dCB4bWxcIjogalF1ZXJ5LnBhcnNlWE1MXG5cdFx0fSxcblxuXHRcdC8vIEZvciBvcHRpb25zIHRoYXQgc2hvdWxkbid0IGJlIGRlZXAgZXh0ZW5kZWQ6XG5cdFx0Ly8geW91IGNhbiBhZGQgeW91ciBvd24gY3VzdG9tIG9wdGlvbnMgaGVyZSBpZlxuXHRcdC8vIGFuZCB3aGVuIHlvdSBjcmVhdGUgb25lIHRoYXQgc2hvdWxkbid0IGJlXG5cdFx0Ly8gZGVlcCBleHRlbmRlZCAoc2VlIGFqYXhFeHRlbmQpXG5cdFx0ZmxhdE9wdGlvbnM6IHtcblx0XHRcdHVybDogdHJ1ZSxcblx0XHRcdGNvbnRleHQ6IHRydWVcblx0XHR9XG5cdH0sXG5cblx0Ly8gQ3JlYXRlcyBhIGZ1bGwgZmxlZGdlZCBzZXR0aW5ncyBvYmplY3QgaW50byB0YXJnZXRcblx0Ly8gd2l0aCBib3RoIGFqYXhTZXR0aW5ncyBhbmQgc2V0dGluZ3MgZmllbGRzLlxuXHQvLyBJZiB0YXJnZXQgaXMgb21pdHRlZCwgd3JpdGVzIGludG8gYWpheFNldHRpbmdzLlxuXHRhamF4U2V0dXA6IGZ1bmN0aW9uKCB0YXJnZXQsIHNldHRpbmdzICkge1xuXHRcdHJldHVybiBzZXR0aW5ncyA/XG5cblx0XHRcdC8vIEJ1aWxkaW5nIGEgc2V0dGluZ3Mgb2JqZWN0XG5cdFx0XHRhamF4RXh0ZW5kKCBhamF4RXh0ZW5kKCB0YXJnZXQsIGpRdWVyeS5hamF4U2V0dGluZ3MgKSwgc2V0dGluZ3MgKSA6XG5cblx0XHRcdC8vIEV4dGVuZGluZyBhamF4U2V0dGluZ3Ncblx0XHRcdGFqYXhFeHRlbmQoIGpRdWVyeS5hamF4U2V0dGluZ3MsIHRhcmdldCApO1xuXHR9LFxuXG5cdGFqYXhQcmVmaWx0ZXI6IGFkZFRvUHJlZmlsdGVyc09yVHJhbnNwb3J0cyggcHJlZmlsdGVycyApLFxuXHRhamF4VHJhbnNwb3J0OiBhZGRUb1ByZWZpbHRlcnNPclRyYW5zcG9ydHMoIHRyYW5zcG9ydHMgKSxcblxuXHQvLyBNYWluIG1ldGhvZFxuXHRhamF4OiBmdW5jdGlvbiggdXJsLCBvcHRpb25zICkge1xuXG5cdFx0Ly8gSWYgdXJsIGlzIGFuIG9iamVjdCwgc2ltdWxhdGUgcHJlLTEuNSBzaWduYXR1cmVcblx0XHRpZiAoIHR5cGVvZiB1cmwgPT09IFwib2JqZWN0XCIgKSB7XG5cdFx0XHRvcHRpb25zID0gdXJsO1xuXHRcdFx0dXJsID0gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdC8vIEZvcmNlIG9wdGlvbnMgdG8gYmUgYW4gb2JqZWN0XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0XHR2YXIgdHJhbnNwb3J0LFxuXHRcdFx0Ly8gVVJMIHdpdGhvdXQgYW50aS1jYWNoZSBwYXJhbVxuXHRcdFx0Y2FjaGVVUkwsXG5cdFx0XHQvLyBSZXNwb25zZSBoZWFkZXJzXG5cdFx0XHRyZXNwb25zZUhlYWRlcnNTdHJpbmcsXG5cdFx0XHRyZXNwb25zZUhlYWRlcnMsXG5cdFx0XHQvLyB0aW1lb3V0IGhhbmRsZVxuXHRcdFx0dGltZW91dFRpbWVyLFxuXHRcdFx0Ly8gQ3Jvc3MtZG9tYWluIGRldGVjdGlvbiB2YXJzXG5cdFx0XHRwYXJ0cyxcblx0XHRcdC8vIFRvIGtub3cgaWYgZ2xvYmFsIGV2ZW50cyBhcmUgdG8gYmUgZGlzcGF0Y2hlZFxuXHRcdFx0ZmlyZUdsb2JhbHMsXG5cdFx0XHQvLyBMb29wIHZhcmlhYmxlXG5cdFx0XHRpLFxuXHRcdFx0Ly8gQ3JlYXRlIHRoZSBmaW5hbCBvcHRpb25zIG9iamVjdFxuXHRcdFx0cyA9IGpRdWVyeS5hamF4U2V0dXAoIHt9LCBvcHRpb25zICksXG5cdFx0XHQvLyBDYWxsYmFja3MgY29udGV4dFxuXHRcdFx0Y2FsbGJhY2tDb250ZXh0ID0gcy5jb250ZXh0IHx8IHMsXG5cdFx0XHQvLyBDb250ZXh0IGZvciBnbG9iYWwgZXZlbnRzIGlzIGNhbGxiYWNrQ29udGV4dCBpZiBpdCBpcyBhIERPTSBub2RlIG9yIGpRdWVyeSBjb2xsZWN0aW9uXG5cdFx0XHRnbG9iYWxFdmVudENvbnRleHQgPSBzLmNvbnRleHQgJiYgKCBjYWxsYmFja0NvbnRleHQubm9kZVR5cGUgfHwgY2FsbGJhY2tDb250ZXh0LmpxdWVyeSApID9cblx0XHRcdFx0alF1ZXJ5KCBjYWxsYmFja0NvbnRleHQgKSA6XG5cdFx0XHRcdGpRdWVyeS5ldmVudCxcblx0XHRcdC8vIERlZmVycmVkc1xuXHRcdFx0ZGVmZXJyZWQgPSBqUXVlcnkuRGVmZXJyZWQoKSxcblx0XHRcdGNvbXBsZXRlRGVmZXJyZWQgPSBqUXVlcnkuQ2FsbGJhY2tzKFwib25jZSBtZW1vcnlcIiksXG5cdFx0XHQvLyBTdGF0dXMtZGVwZW5kZW50IGNhbGxiYWNrc1xuXHRcdFx0c3RhdHVzQ29kZSA9IHMuc3RhdHVzQ29kZSB8fCB7fSxcblx0XHRcdC8vIEhlYWRlcnMgKHRoZXkgYXJlIHNlbnQgYWxsIGF0IG9uY2UpXG5cdFx0XHRyZXF1ZXN0SGVhZGVycyA9IHt9LFxuXHRcdFx0cmVxdWVzdEhlYWRlcnNOYW1lcyA9IHt9LFxuXHRcdFx0Ly8gVGhlIGpxWEhSIHN0YXRlXG5cdFx0XHRzdGF0ZSA9IDAsXG5cdFx0XHQvLyBEZWZhdWx0IGFib3J0IG1lc3NhZ2Vcblx0XHRcdHN0ckFib3J0ID0gXCJjYW5jZWxlZFwiLFxuXHRcdFx0Ly8gRmFrZSB4aHJcblx0XHRcdGpxWEhSID0ge1xuXHRcdFx0XHRyZWFkeVN0YXRlOiAwLFxuXG5cdFx0XHRcdC8vIEJ1aWxkcyBoZWFkZXJzIGhhc2h0YWJsZSBpZiBuZWVkZWRcblx0XHRcdFx0Z2V0UmVzcG9uc2VIZWFkZXI6IGZ1bmN0aW9uKCBrZXkgKSB7XG5cdFx0XHRcdFx0dmFyIG1hdGNoO1xuXHRcdFx0XHRcdGlmICggc3RhdGUgPT09IDIgKSB7XG5cdFx0XHRcdFx0XHRpZiAoICFyZXNwb25zZUhlYWRlcnMgKSB7XG5cdFx0XHRcdFx0XHRcdHJlc3BvbnNlSGVhZGVycyA9IHt9O1xuXHRcdFx0XHRcdFx0XHR3aGlsZSAoIChtYXRjaCA9IHJoZWFkZXJzLmV4ZWMoIHJlc3BvbnNlSGVhZGVyc1N0cmluZyApKSApIHtcblx0XHRcdFx0XHRcdFx0XHRyZXNwb25zZUhlYWRlcnNbIG1hdGNoWzFdLnRvTG93ZXJDYXNlKCkgXSA9IG1hdGNoWyAyIF07XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG1hdGNoID0gcmVzcG9uc2VIZWFkZXJzWyBrZXkudG9Mb3dlckNhc2UoKSBdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gbWF0Y2ggPT0gbnVsbCA/IG51bGwgOiBtYXRjaDtcblx0XHRcdFx0fSxcblxuXHRcdFx0XHQvLyBSYXcgc3RyaW5nXG5cdFx0XHRcdGdldEFsbFJlc3BvbnNlSGVhZGVyczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHN0YXRlID09PSAyID8gcmVzcG9uc2VIZWFkZXJzU3RyaW5nIDogbnVsbDtcblx0XHRcdFx0fSxcblxuXHRcdFx0XHQvLyBDYWNoZXMgdGhlIGhlYWRlclxuXHRcdFx0XHRzZXRSZXF1ZXN0SGVhZGVyOiBmdW5jdGlvbiggbmFtZSwgdmFsdWUgKSB7XG5cdFx0XHRcdFx0dmFyIGxuYW1lID0gbmFtZS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XHRcdGlmICggIXN0YXRlICkge1xuXHRcdFx0XHRcdFx0bmFtZSA9IHJlcXVlc3RIZWFkZXJzTmFtZXNbIGxuYW1lIF0gPSByZXF1ZXN0SGVhZGVyc05hbWVzWyBsbmFtZSBdIHx8IG5hbWU7XG5cdFx0XHRcdFx0XHRyZXF1ZXN0SGVhZGVyc1sgbmFtZSBdID0gdmFsdWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiB0aGlzO1xuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdC8vIE92ZXJyaWRlcyByZXNwb25zZSBjb250ZW50LXR5cGUgaGVhZGVyXG5cdFx0XHRcdG92ZXJyaWRlTWltZVR5cGU6IGZ1bmN0aW9uKCB0eXBlICkge1xuXHRcdFx0XHRcdGlmICggIXN0YXRlICkge1xuXHRcdFx0XHRcdFx0cy5taW1lVHlwZSA9IHR5cGU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiB0aGlzO1xuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdC8vIFN0YXR1cy1kZXBlbmRlbnQgY2FsbGJhY2tzXG5cdFx0XHRcdHN0YXR1c0NvZGU6IGZ1bmN0aW9uKCBtYXAgKSB7XG5cdFx0XHRcdFx0dmFyIGNvZGU7XG5cdFx0XHRcdFx0aWYgKCBtYXAgKSB7XG5cdFx0XHRcdFx0XHRpZiAoIHN0YXRlIDwgMiApIHtcblx0XHRcdFx0XHRcdFx0Zm9yICggY29kZSBpbiBtYXAgKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gTGF6eS1hZGQgdGhlIG5ldyBjYWxsYmFjayBpbiBhIHdheSB0aGF0IHByZXNlcnZlcyBvbGQgb25lc1xuXHRcdFx0XHRcdFx0XHRcdHN0YXR1c0NvZGVbIGNvZGUgXSA9IFsgc3RhdHVzQ29kZVsgY29kZSBdLCBtYXBbIGNvZGUgXSBdO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHQvLyBFeGVjdXRlIHRoZSBhcHByb3ByaWF0ZSBjYWxsYmFja3Ncblx0XHRcdFx0XHRcdFx0anFYSFIuYWx3YXlzKCBtYXBbIGpxWEhSLnN0YXR1cyBdICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiB0aGlzO1xuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdC8vIENhbmNlbCB0aGUgcmVxdWVzdFxuXHRcdFx0XHRhYm9ydDogZnVuY3Rpb24oIHN0YXR1c1RleHQgKSB7XG5cdFx0XHRcdFx0dmFyIGZpbmFsVGV4dCA9IHN0YXR1c1RleHQgfHwgc3RyQWJvcnQ7XG5cdFx0XHRcdFx0aWYgKCB0cmFuc3BvcnQgKSB7XG5cdFx0XHRcdFx0XHR0cmFuc3BvcnQuYWJvcnQoIGZpbmFsVGV4dCApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkb25lKCAwLCBmaW5hbFRleHQgKTtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcztcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdC8vIEF0dGFjaCBkZWZlcnJlZHNcblx0XHRkZWZlcnJlZC5wcm9taXNlKCBqcVhIUiApLmNvbXBsZXRlID0gY29tcGxldGVEZWZlcnJlZC5hZGQ7XG5cdFx0anFYSFIuc3VjY2VzcyA9IGpxWEhSLmRvbmU7XG5cdFx0anFYSFIuZXJyb3IgPSBqcVhIUi5mYWlsO1xuXG5cdFx0Ly8gUmVtb3ZlIGhhc2ggY2hhcmFjdGVyICgjNzUzMTogYW5kIHN0cmluZyBwcm9tb3Rpb24pXG5cdFx0Ly8gQWRkIHByb3RvY29sIGlmIG5vdCBwcm92aWRlZCAocHJlZmlsdGVycyBtaWdodCBleHBlY3QgaXQpXG5cdFx0Ly8gSGFuZGxlIGZhbHN5IHVybCBpbiB0aGUgc2V0dGluZ3Mgb2JqZWN0ICgjMTAwOTM6IGNvbnNpc3RlbmN5IHdpdGggb2xkIHNpZ25hdHVyZSlcblx0XHQvLyBXZSBhbHNvIHVzZSB0aGUgdXJsIHBhcmFtZXRlciBpZiBhdmFpbGFibGVcblx0XHRzLnVybCA9ICggKCB1cmwgfHwgcy51cmwgfHwgYWpheExvY2F0aW9uICkgKyBcIlwiICkucmVwbGFjZSggcmhhc2gsIFwiXCIgKVxuXHRcdFx0LnJlcGxhY2UoIHJwcm90b2NvbCwgYWpheExvY1BhcnRzWyAxIF0gKyBcIi8vXCIgKTtcblxuXHRcdC8vIEFsaWFzIG1ldGhvZCBvcHRpb24gdG8gdHlwZSBhcyBwZXIgdGlja2V0ICMxMjAwNFxuXHRcdHMudHlwZSA9IG9wdGlvbnMubWV0aG9kIHx8IG9wdGlvbnMudHlwZSB8fCBzLm1ldGhvZCB8fCBzLnR5cGU7XG5cblx0XHQvLyBFeHRyYWN0IGRhdGFUeXBlcyBsaXN0XG5cdFx0cy5kYXRhVHlwZXMgPSBqUXVlcnkudHJpbSggcy5kYXRhVHlwZSB8fCBcIipcIiApLnRvTG93ZXJDYXNlKCkubWF0Y2goIHJub3R3aGl0ZSApIHx8IFsgXCJcIiBdO1xuXG5cdFx0Ly8gQSBjcm9zcy1kb21haW4gcmVxdWVzdCBpcyBpbiBvcmRlciB3aGVuIHdlIGhhdmUgYSBwcm90b2NvbDpob3N0OnBvcnQgbWlzbWF0Y2hcblx0XHRpZiAoIHMuY3Jvc3NEb21haW4gPT0gbnVsbCApIHtcblx0XHRcdHBhcnRzID0gcnVybC5leGVjKCBzLnVybC50b0xvd2VyQ2FzZSgpICk7XG5cdFx0XHRzLmNyb3NzRG9tYWluID0gISEoIHBhcnRzICYmXG5cdFx0XHRcdCggcGFydHNbIDEgXSAhPT0gYWpheExvY1BhcnRzWyAxIF0gfHwgcGFydHNbIDIgXSAhPT0gYWpheExvY1BhcnRzWyAyIF0gfHxcblx0XHRcdFx0XHQoIHBhcnRzWyAzIF0gfHwgKCBwYXJ0c1sgMSBdID09PSBcImh0dHA6XCIgPyBcIjgwXCIgOiBcIjQ0M1wiICkgKSAhPT1cblx0XHRcdFx0XHRcdCggYWpheExvY1BhcnRzWyAzIF0gfHwgKCBhamF4TG9jUGFydHNbIDEgXSA9PT0gXCJodHRwOlwiID8gXCI4MFwiIDogXCI0NDNcIiApICkgKVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHQvLyBDb252ZXJ0IGRhdGEgaWYgbm90IGFscmVhZHkgYSBzdHJpbmdcblx0XHRpZiAoIHMuZGF0YSAmJiBzLnByb2Nlc3NEYXRhICYmIHR5cGVvZiBzLmRhdGEgIT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHRzLmRhdGEgPSBqUXVlcnkucGFyYW0oIHMuZGF0YSwgcy50cmFkaXRpb25hbCApO1xuXHRcdH1cblxuXHRcdC8vIEFwcGx5IHByZWZpbHRlcnNcblx0XHRpbnNwZWN0UHJlZmlsdGVyc09yVHJhbnNwb3J0cyggcHJlZmlsdGVycywgcywgb3B0aW9ucywganFYSFIgKTtcblxuXHRcdC8vIElmIHJlcXVlc3Qgd2FzIGFib3J0ZWQgaW5zaWRlIGEgcHJlZmlsdGVyLCBzdG9wIHRoZXJlXG5cdFx0aWYgKCBzdGF0ZSA9PT0gMiApIHtcblx0XHRcdHJldHVybiBqcVhIUjtcblx0XHR9XG5cblx0XHQvLyBXZSBjYW4gZmlyZSBnbG9iYWwgZXZlbnRzIGFzIG9mIG5vdyBpZiBhc2tlZCB0b1xuXHRcdGZpcmVHbG9iYWxzID0gcy5nbG9iYWw7XG5cblx0XHQvLyBXYXRjaCBmb3IgYSBuZXcgc2V0IG9mIHJlcXVlc3RzXG5cdFx0aWYgKCBmaXJlR2xvYmFscyAmJiBqUXVlcnkuYWN0aXZlKysgPT09IDAgKSB7XG5cdFx0XHRqUXVlcnkuZXZlbnQudHJpZ2dlcihcImFqYXhTdGFydFwiKTtcblx0XHR9XG5cblx0XHQvLyBVcHBlcmNhc2UgdGhlIHR5cGVcblx0XHRzLnR5cGUgPSBzLnR5cGUudG9VcHBlckNhc2UoKTtcblxuXHRcdC8vIERldGVybWluZSBpZiByZXF1ZXN0IGhhcyBjb250ZW50XG5cdFx0cy5oYXNDb250ZW50ID0gIXJub0NvbnRlbnQudGVzdCggcy50eXBlICk7XG5cblx0XHQvLyBTYXZlIHRoZSBVUkwgaW4gY2FzZSB3ZSdyZSB0b3lpbmcgd2l0aCB0aGUgSWYtTW9kaWZpZWQtU2luY2Vcblx0XHQvLyBhbmQvb3IgSWYtTm9uZS1NYXRjaCBoZWFkZXIgbGF0ZXIgb25cblx0XHRjYWNoZVVSTCA9IHMudXJsO1xuXG5cdFx0Ly8gTW9yZSBvcHRpb25zIGhhbmRsaW5nIGZvciByZXF1ZXN0cyB3aXRoIG5vIGNvbnRlbnRcblx0XHRpZiAoICFzLmhhc0NvbnRlbnQgKSB7XG5cblx0XHRcdC8vIElmIGRhdGEgaXMgYXZhaWxhYmxlLCBhcHBlbmQgZGF0YSB0byB1cmxcblx0XHRcdGlmICggcy5kYXRhICkge1xuXHRcdFx0XHRjYWNoZVVSTCA9ICggcy51cmwgKz0gKCBycXVlcnkudGVzdCggY2FjaGVVUkwgKSA/IFwiJlwiIDogXCI/XCIgKSArIHMuZGF0YSApO1xuXHRcdFx0XHQvLyAjOTY4MjogcmVtb3ZlIGRhdGEgc28gdGhhdCBpdCdzIG5vdCB1c2VkIGluIGFuIGV2ZW50dWFsIHJldHJ5XG5cdFx0XHRcdGRlbGV0ZSBzLmRhdGE7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEFkZCBhbnRpLWNhY2hlIGluIHVybCBpZiBuZWVkZWRcblx0XHRcdGlmICggcy5jYWNoZSA9PT0gZmFsc2UgKSB7XG5cdFx0XHRcdHMudXJsID0gcnRzLnRlc3QoIGNhY2hlVVJMICkgP1xuXG5cdFx0XHRcdFx0Ly8gSWYgdGhlcmUgaXMgYWxyZWFkeSBhICdfJyBwYXJhbWV0ZXIsIHNldCBpdHMgdmFsdWVcblx0XHRcdFx0XHRjYWNoZVVSTC5yZXBsYWNlKCBydHMsIFwiJDFfPVwiICsgbm9uY2UrKyApIDpcblxuXHRcdFx0XHRcdC8vIE90aGVyd2lzZSBhZGQgb25lIHRvIHRoZSBlbmRcblx0XHRcdFx0XHRjYWNoZVVSTCArICggcnF1ZXJ5LnRlc3QoIGNhY2hlVVJMICkgPyBcIiZcIiA6IFwiP1wiICkgKyBcIl89XCIgKyBub25jZSsrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIFNldCB0aGUgSWYtTW9kaWZpZWQtU2luY2UgYW5kL29yIElmLU5vbmUtTWF0Y2ggaGVhZGVyLCBpZiBpbiBpZk1vZGlmaWVkIG1vZGUuXG5cdFx0aWYgKCBzLmlmTW9kaWZpZWQgKSB7XG5cdFx0XHRpZiAoIGpRdWVyeS5sYXN0TW9kaWZpZWRbIGNhY2hlVVJMIF0gKSB7XG5cdFx0XHRcdGpxWEhSLnNldFJlcXVlc3RIZWFkZXIoIFwiSWYtTW9kaWZpZWQtU2luY2VcIiwgalF1ZXJ5Lmxhc3RNb2RpZmllZFsgY2FjaGVVUkwgXSApO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCBqUXVlcnkuZXRhZ1sgY2FjaGVVUkwgXSApIHtcblx0XHRcdFx0anFYSFIuc2V0UmVxdWVzdEhlYWRlciggXCJJZi1Ob25lLU1hdGNoXCIsIGpRdWVyeS5ldGFnWyBjYWNoZVVSTCBdICk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gU2V0IHRoZSBjb3JyZWN0IGhlYWRlciwgaWYgZGF0YSBpcyBiZWluZyBzZW50XG5cdFx0aWYgKCBzLmRhdGEgJiYgcy5oYXNDb250ZW50ICYmIHMuY29udGVudFR5cGUgIT09IGZhbHNlIHx8IG9wdGlvbnMuY29udGVudFR5cGUgKSB7XG5cdFx0XHRqcVhIUi5zZXRSZXF1ZXN0SGVhZGVyKCBcIkNvbnRlbnQtVHlwZVwiLCBzLmNvbnRlbnRUeXBlICk7XG5cdFx0fVxuXG5cdFx0Ly8gU2V0IHRoZSBBY2NlcHRzIGhlYWRlciBmb3IgdGhlIHNlcnZlciwgZGVwZW5kaW5nIG9uIHRoZSBkYXRhVHlwZVxuXHRcdGpxWEhSLnNldFJlcXVlc3RIZWFkZXIoXG5cdFx0XHRcIkFjY2VwdFwiLFxuXHRcdFx0cy5kYXRhVHlwZXNbIDAgXSAmJiBzLmFjY2VwdHNbIHMuZGF0YVR5cGVzWzBdIF0gP1xuXHRcdFx0XHRzLmFjY2VwdHNbIHMuZGF0YVR5cGVzWzBdIF0gKyAoIHMuZGF0YVR5cGVzWyAwIF0gIT09IFwiKlwiID8gXCIsIFwiICsgYWxsVHlwZXMgKyBcIjsgcT0wLjAxXCIgOiBcIlwiICkgOlxuXHRcdFx0XHRzLmFjY2VwdHNbIFwiKlwiIF1cblx0XHQpO1xuXG5cdFx0Ly8gQ2hlY2sgZm9yIGhlYWRlcnMgb3B0aW9uXG5cdFx0Zm9yICggaSBpbiBzLmhlYWRlcnMgKSB7XG5cdFx0XHRqcVhIUi5zZXRSZXF1ZXN0SGVhZGVyKCBpLCBzLmhlYWRlcnNbIGkgXSApO1xuXHRcdH1cblxuXHRcdC8vIEFsbG93IGN1c3RvbSBoZWFkZXJzL21pbWV0eXBlcyBhbmQgZWFybHkgYWJvcnRcblx0XHRpZiAoIHMuYmVmb3JlU2VuZCAmJiAoIHMuYmVmb3JlU2VuZC5jYWxsKCBjYWxsYmFja0NvbnRleHQsIGpxWEhSLCBzICkgPT09IGZhbHNlIHx8IHN0YXRlID09PSAyICkgKSB7XG5cdFx0XHQvLyBBYm9ydCBpZiBub3QgZG9uZSBhbHJlYWR5IGFuZCByZXR1cm5cblx0XHRcdHJldHVybiBqcVhIUi5hYm9ydCgpO1xuXHRcdH1cblxuXHRcdC8vIGFib3J0aW5nIGlzIG5vIGxvbmdlciBhIGNhbmNlbGxhdGlvblxuXHRcdHN0ckFib3J0ID0gXCJhYm9ydFwiO1xuXG5cdFx0Ly8gSW5zdGFsbCBjYWxsYmFja3Mgb24gZGVmZXJyZWRzXG5cdFx0Zm9yICggaSBpbiB7IHN1Y2Nlc3M6IDEsIGVycm9yOiAxLCBjb21wbGV0ZTogMSB9ICkge1xuXHRcdFx0anFYSFJbIGkgXSggc1sgaSBdICk7XG5cdFx0fVxuXG5cdFx0Ly8gR2V0IHRyYW5zcG9ydFxuXHRcdHRyYW5zcG9ydCA9IGluc3BlY3RQcmVmaWx0ZXJzT3JUcmFuc3BvcnRzKCB0cmFuc3BvcnRzLCBzLCBvcHRpb25zLCBqcVhIUiApO1xuXG5cdFx0Ly8gSWYgbm8gdHJhbnNwb3J0LCB3ZSBhdXRvLWFib3J0XG5cdFx0aWYgKCAhdHJhbnNwb3J0ICkge1xuXHRcdFx0ZG9uZSggLTEsIFwiTm8gVHJhbnNwb3J0XCIgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0anFYSFIucmVhZHlTdGF0ZSA9IDE7XG5cblx0XHRcdC8vIFNlbmQgZ2xvYmFsIGV2ZW50XG5cdFx0XHRpZiAoIGZpcmVHbG9iYWxzICkge1xuXHRcdFx0XHRnbG9iYWxFdmVudENvbnRleHQudHJpZ2dlciggXCJhamF4U2VuZFwiLCBbIGpxWEhSLCBzIF0gKTtcblx0XHRcdH1cblx0XHRcdC8vIFRpbWVvdXRcblx0XHRcdGlmICggcy5hc3luYyAmJiBzLnRpbWVvdXQgPiAwICkge1xuXHRcdFx0XHR0aW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGpxWEhSLmFib3J0KFwidGltZW91dFwiKTtcblx0XHRcdFx0fSwgcy50aW1lb3V0ICk7XG5cdFx0XHR9XG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdHN0YXRlID0gMTtcblx0XHRcdFx0dHJhbnNwb3J0LnNlbmQoIHJlcXVlc3RIZWFkZXJzLCBkb25lICk7XG5cdFx0XHR9IGNhdGNoICggZSApIHtcblx0XHRcdFx0Ly8gUHJvcGFnYXRlIGV4Y2VwdGlvbiBhcyBlcnJvciBpZiBub3QgZG9uZVxuXHRcdFx0XHRpZiAoIHN0YXRlIDwgMiApIHtcblx0XHRcdFx0XHRkb25lKCAtMSwgZSApO1xuXHRcdFx0XHQvLyBTaW1wbHkgcmV0aHJvdyBvdGhlcndpc2Vcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aHJvdyBlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gQ2FsbGJhY2sgZm9yIHdoZW4gZXZlcnl0aGluZyBpcyBkb25lXG5cdFx0ZnVuY3Rpb24gZG9uZSggc3RhdHVzLCBuYXRpdmVTdGF0dXNUZXh0LCByZXNwb25zZXMsIGhlYWRlcnMgKSB7XG5cdFx0XHR2YXIgaXNTdWNjZXNzLCBzdWNjZXNzLCBlcnJvciwgcmVzcG9uc2UsIG1vZGlmaWVkLFxuXHRcdFx0XHRzdGF0dXNUZXh0ID0gbmF0aXZlU3RhdHVzVGV4dDtcblxuXHRcdFx0Ly8gQ2FsbGVkIG9uY2Vcblx0XHRcdGlmICggc3RhdGUgPT09IDIgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gU3RhdGUgaXMgXCJkb25lXCIgbm93XG5cdFx0XHRzdGF0ZSA9IDI7XG5cblx0XHRcdC8vIENsZWFyIHRpbWVvdXQgaWYgaXQgZXhpc3RzXG5cdFx0XHRpZiAoIHRpbWVvdXRUaW1lciApIHtcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KCB0aW1lb3V0VGltZXIgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gRGVyZWZlcmVuY2UgdHJhbnNwb3J0IGZvciBlYXJseSBnYXJiYWdlIGNvbGxlY3Rpb25cblx0XHRcdC8vIChubyBtYXR0ZXIgaG93IGxvbmcgdGhlIGpxWEhSIG9iamVjdCB3aWxsIGJlIHVzZWQpXG5cdFx0XHR0cmFuc3BvcnQgPSB1bmRlZmluZWQ7XG5cblx0XHRcdC8vIENhY2hlIHJlc3BvbnNlIGhlYWRlcnNcblx0XHRcdHJlc3BvbnNlSGVhZGVyc1N0cmluZyA9IGhlYWRlcnMgfHwgXCJcIjtcblxuXHRcdFx0Ly8gU2V0IHJlYWR5U3RhdGVcblx0XHRcdGpxWEhSLnJlYWR5U3RhdGUgPSBzdGF0dXMgPiAwID8gNCA6IDA7XG5cblx0XHRcdC8vIERldGVybWluZSBpZiBzdWNjZXNzZnVsXG5cdFx0XHRpc1N1Y2Nlc3MgPSBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMCB8fCBzdGF0dXMgPT09IDMwNDtcblxuXHRcdFx0Ly8gR2V0IHJlc3BvbnNlIGRhdGFcblx0XHRcdGlmICggcmVzcG9uc2VzICkge1xuXHRcdFx0XHRyZXNwb25zZSA9IGFqYXhIYW5kbGVSZXNwb25zZXMoIHMsIGpxWEhSLCByZXNwb25zZXMgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQ29udmVydCBubyBtYXR0ZXIgd2hhdCAodGhhdCB3YXkgcmVzcG9uc2VYWFggZmllbGRzIGFyZSBhbHdheXMgc2V0KVxuXHRcdFx0cmVzcG9uc2UgPSBhamF4Q29udmVydCggcywgcmVzcG9uc2UsIGpxWEhSLCBpc1N1Y2Nlc3MgKTtcblxuXHRcdFx0Ly8gSWYgc3VjY2Vzc2Z1bCwgaGFuZGxlIHR5cGUgY2hhaW5pbmdcblx0XHRcdGlmICggaXNTdWNjZXNzICkge1xuXG5cdFx0XHRcdC8vIFNldCB0aGUgSWYtTW9kaWZpZWQtU2luY2UgYW5kL29yIElmLU5vbmUtTWF0Y2ggaGVhZGVyLCBpZiBpbiBpZk1vZGlmaWVkIG1vZGUuXG5cdFx0XHRcdGlmICggcy5pZk1vZGlmaWVkICkge1xuXHRcdFx0XHRcdG1vZGlmaWVkID0ganFYSFIuZ2V0UmVzcG9uc2VIZWFkZXIoXCJMYXN0LU1vZGlmaWVkXCIpO1xuXHRcdFx0XHRcdGlmICggbW9kaWZpZWQgKSB7XG5cdFx0XHRcdFx0XHRqUXVlcnkubGFzdE1vZGlmaWVkWyBjYWNoZVVSTCBdID0gbW9kaWZpZWQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG1vZGlmaWVkID0ganFYSFIuZ2V0UmVzcG9uc2VIZWFkZXIoXCJldGFnXCIpO1xuXHRcdFx0XHRcdGlmICggbW9kaWZpZWQgKSB7XG5cdFx0XHRcdFx0XHRqUXVlcnkuZXRhZ1sgY2FjaGVVUkwgXSA9IG1vZGlmaWVkO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIGlmIG5vIGNvbnRlbnRcblx0XHRcdFx0aWYgKCBzdGF0dXMgPT09IDIwNCB8fCBzLnR5cGUgPT09IFwiSEVBRFwiICkge1xuXHRcdFx0XHRcdHN0YXR1c1RleHQgPSBcIm5vY29udGVudFwiO1xuXG5cdFx0XHRcdC8vIGlmIG5vdCBtb2RpZmllZFxuXHRcdFx0XHR9IGVsc2UgaWYgKCBzdGF0dXMgPT09IDMwNCApIHtcblx0XHRcdFx0XHRzdGF0dXNUZXh0ID0gXCJub3Rtb2RpZmllZFwiO1xuXG5cdFx0XHRcdC8vIElmIHdlIGhhdmUgZGF0YSwgbGV0J3MgY29udmVydCBpdFxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHN0YXR1c1RleHQgPSByZXNwb25zZS5zdGF0ZTtcblx0XHRcdFx0XHRzdWNjZXNzID0gcmVzcG9uc2UuZGF0YTtcblx0XHRcdFx0XHRlcnJvciA9IHJlc3BvbnNlLmVycm9yO1xuXHRcdFx0XHRcdGlzU3VjY2VzcyA9ICFlcnJvcjtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gV2UgZXh0cmFjdCBlcnJvciBmcm9tIHN0YXR1c1RleHRcblx0XHRcdFx0Ly8gdGhlbiBub3JtYWxpemUgc3RhdHVzVGV4dCBhbmQgc3RhdHVzIGZvciBub24tYWJvcnRzXG5cdFx0XHRcdGVycm9yID0gc3RhdHVzVGV4dDtcblx0XHRcdFx0aWYgKCBzdGF0dXMgfHwgIXN0YXR1c1RleHQgKSB7XG5cdFx0XHRcdFx0c3RhdHVzVGV4dCA9IFwiZXJyb3JcIjtcblx0XHRcdFx0XHRpZiAoIHN0YXR1cyA8IDAgKSB7XG5cdFx0XHRcdFx0XHRzdGF0dXMgPSAwO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBTZXQgZGF0YSBmb3IgdGhlIGZha2UgeGhyIG9iamVjdFxuXHRcdFx0anFYSFIuc3RhdHVzID0gc3RhdHVzO1xuXHRcdFx0anFYSFIuc3RhdHVzVGV4dCA9ICggbmF0aXZlU3RhdHVzVGV4dCB8fCBzdGF0dXNUZXh0ICkgKyBcIlwiO1xuXG5cdFx0XHQvLyBTdWNjZXNzL0Vycm9yXG5cdFx0XHRpZiAoIGlzU3VjY2VzcyApIHtcblx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZVdpdGgoIGNhbGxiYWNrQ29udGV4dCwgWyBzdWNjZXNzLCBzdGF0dXNUZXh0LCBqcVhIUiBdICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRkZWZlcnJlZC5yZWplY3RXaXRoKCBjYWxsYmFja0NvbnRleHQsIFsganFYSFIsIHN0YXR1c1RleHQsIGVycm9yIF0gKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gU3RhdHVzLWRlcGVuZGVudCBjYWxsYmFja3Ncblx0XHRcdGpxWEhSLnN0YXR1c0NvZGUoIHN0YXR1c0NvZGUgKTtcblx0XHRcdHN0YXR1c0NvZGUgPSB1bmRlZmluZWQ7XG5cblx0XHRcdGlmICggZmlyZUdsb2JhbHMgKSB7XG5cdFx0XHRcdGdsb2JhbEV2ZW50Q29udGV4dC50cmlnZ2VyKCBpc1N1Y2Nlc3MgPyBcImFqYXhTdWNjZXNzXCIgOiBcImFqYXhFcnJvclwiLFxuXHRcdFx0XHRcdFsganFYSFIsIHMsIGlzU3VjY2VzcyA/IHN1Y2Nlc3MgOiBlcnJvciBdICk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIENvbXBsZXRlXG5cdFx0XHRjb21wbGV0ZURlZmVycmVkLmZpcmVXaXRoKCBjYWxsYmFja0NvbnRleHQsIFsganFYSFIsIHN0YXR1c1RleHQgXSApO1xuXG5cdFx0XHRpZiAoIGZpcmVHbG9iYWxzICkge1xuXHRcdFx0XHRnbG9iYWxFdmVudENvbnRleHQudHJpZ2dlciggXCJhamF4Q29tcGxldGVcIiwgWyBqcVhIUiwgcyBdICk7XG5cdFx0XHRcdC8vIEhhbmRsZSB0aGUgZ2xvYmFsIEFKQVggY291bnRlclxuXHRcdFx0XHRpZiAoICEoIC0talF1ZXJ5LmFjdGl2ZSApICkge1xuXHRcdFx0XHRcdGpRdWVyeS5ldmVudC50cmlnZ2VyKFwiYWpheFN0b3BcIik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4ganFYSFI7XG5cdH0sXG5cblx0Z2V0SlNPTjogZnVuY3Rpb24oIHVybCwgZGF0YSwgY2FsbGJhY2sgKSB7XG5cdFx0cmV0dXJuIGpRdWVyeS5nZXQoIHVybCwgZGF0YSwgY2FsbGJhY2ssIFwianNvblwiICk7XG5cdH0sXG5cblx0Z2V0U2NyaXB0OiBmdW5jdGlvbiggdXJsLCBjYWxsYmFjayApIHtcblx0XHRyZXR1cm4galF1ZXJ5LmdldCggdXJsLCB1bmRlZmluZWQsIGNhbGxiYWNrLCBcInNjcmlwdFwiICk7XG5cdH1cbn0pO1xuXG5qUXVlcnkuZWFjaCggWyBcImdldFwiLCBcInBvc3RcIiBdLCBmdW5jdGlvbiggaSwgbWV0aG9kICkge1xuXHRqUXVlcnlbIG1ldGhvZCBdID0gZnVuY3Rpb24oIHVybCwgZGF0YSwgY2FsbGJhY2ssIHR5cGUgKSB7XG5cdFx0Ly8gc2hpZnQgYXJndW1lbnRzIGlmIGRhdGEgYXJndW1lbnQgd2FzIG9taXR0ZWRcblx0XHRpZiAoIGpRdWVyeS5pc0Z1bmN0aW9uKCBkYXRhICkgKSB7XG5cdFx0XHR0eXBlID0gdHlwZSB8fCBjYWxsYmFjaztcblx0XHRcdGNhbGxiYWNrID0gZGF0YTtcblx0XHRcdGRhdGEgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGpRdWVyeS5hamF4KHtcblx0XHRcdHVybDogdXJsLFxuXHRcdFx0dHlwZTogbWV0aG9kLFxuXHRcdFx0ZGF0YVR5cGU6IHR5cGUsXG5cdFx0XHRkYXRhOiBkYXRhLFxuXHRcdFx0c3VjY2VzczogY2FsbGJhY2tcblx0XHR9KTtcblx0fTtcbn0pO1xuXG4vLyBBdHRhY2ggYSBidW5jaCBvZiBmdW5jdGlvbnMgZm9yIGhhbmRsaW5nIGNvbW1vbiBBSkFYIGV2ZW50c1xualF1ZXJ5LmVhY2goIFsgXCJhamF4U3RhcnRcIiwgXCJhamF4U3RvcFwiLCBcImFqYXhDb21wbGV0ZVwiLCBcImFqYXhFcnJvclwiLCBcImFqYXhTdWNjZXNzXCIsIFwiYWpheFNlbmRcIiBdLCBmdW5jdGlvbiggaSwgdHlwZSApIHtcblx0alF1ZXJ5LmZuWyB0eXBlIF0gPSBmdW5jdGlvbiggZm4gKSB7XG5cdFx0cmV0dXJuIHRoaXMub24oIHR5cGUsIGZuICk7XG5cdH07XG59KTtcblxuXG5qUXVlcnkuX2V2YWxVcmwgPSBmdW5jdGlvbiggdXJsICkge1xuXHRyZXR1cm4galF1ZXJ5LmFqYXgoe1xuXHRcdHVybDogdXJsLFxuXHRcdHR5cGU6IFwiR0VUXCIsXG5cdFx0ZGF0YVR5cGU6IFwic2NyaXB0XCIsXG5cdFx0YXN5bmM6IGZhbHNlLFxuXHRcdGdsb2JhbDogZmFsc2UsXG5cdFx0XCJ0aHJvd3NcIjogdHJ1ZVxuXHR9KTtcbn07XG5cblxualF1ZXJ5LmZuLmV4dGVuZCh7XG5cdHdyYXBBbGw6IGZ1bmN0aW9uKCBodG1sICkge1xuXHRcdHZhciB3cmFwO1xuXG5cdFx0aWYgKCBqUXVlcnkuaXNGdW5jdGlvbiggaHRtbCApICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiggaSApIHtcblx0XHRcdFx0alF1ZXJ5KCB0aGlzICkud3JhcEFsbCggaHRtbC5jYWxsKHRoaXMsIGkpICk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXNbIDAgXSApIHtcblxuXHRcdFx0Ly8gVGhlIGVsZW1lbnRzIHRvIHdyYXAgdGhlIHRhcmdldCBhcm91bmRcblx0XHRcdHdyYXAgPSBqUXVlcnkoIGh0bWwsIHRoaXNbIDAgXS5vd25lckRvY3VtZW50ICkuZXEoIDAgKS5jbG9uZSggdHJ1ZSApO1xuXG5cdFx0XHRpZiAoIHRoaXNbIDAgXS5wYXJlbnROb2RlICkge1xuXHRcdFx0XHR3cmFwLmluc2VydEJlZm9yZSggdGhpc1sgMCBdICk7XG5cdFx0XHR9XG5cblx0XHRcdHdyYXAubWFwKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZWxlbSA9IHRoaXM7XG5cblx0XHRcdFx0d2hpbGUgKCBlbGVtLmZpcnN0RWxlbWVudENoaWxkICkge1xuXHRcdFx0XHRcdGVsZW0gPSBlbGVtLmZpcnN0RWxlbWVudENoaWxkO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGVsZW07XG5cdFx0XHR9KS5hcHBlbmQoIHRoaXMgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHR3cmFwSW5uZXI6IGZ1bmN0aW9uKCBodG1sICkge1xuXHRcdGlmICggalF1ZXJ5LmlzRnVuY3Rpb24oIGh0bWwgKSApIHtcblx0XHRcdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oIGkgKSB7XG5cdFx0XHRcdGpRdWVyeSggdGhpcyApLndyYXBJbm5lciggaHRtbC5jYWxsKHRoaXMsIGkpICk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHNlbGYgPSBqUXVlcnkoIHRoaXMgKSxcblx0XHRcdFx0Y29udGVudHMgPSBzZWxmLmNvbnRlbnRzKCk7XG5cblx0XHRcdGlmICggY29udGVudHMubGVuZ3RoICkge1xuXHRcdFx0XHRjb250ZW50cy53cmFwQWxsKCBodG1sICk7XG5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNlbGYuYXBwZW5kKCBodG1sICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0d3JhcDogZnVuY3Rpb24oIGh0bWwgKSB7XG5cdFx0dmFyIGlzRnVuY3Rpb24gPSBqUXVlcnkuaXNGdW5jdGlvbiggaHRtbCApO1xuXG5cdFx0cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiggaSApIHtcblx0XHRcdGpRdWVyeSggdGhpcyApLndyYXBBbGwoIGlzRnVuY3Rpb24gPyBodG1sLmNhbGwodGhpcywgaSkgOiBodG1sICk7XG5cdFx0fSk7XG5cdH0sXG5cblx0dW53cmFwOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5wYXJlbnQoKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKCAhalF1ZXJ5Lm5vZGVOYW1lKCB0aGlzLCBcImJvZHlcIiApICkge1xuXHRcdFx0XHRqUXVlcnkoIHRoaXMgKS5yZXBsYWNlV2l0aCggdGhpcy5jaGlsZE5vZGVzICk7XG5cdFx0XHR9XG5cdFx0fSkuZW5kKCk7XG5cdH1cbn0pO1xuXG5cbmpRdWVyeS5leHByLmZpbHRlcnMuaGlkZGVuID0gZnVuY3Rpb24oIGVsZW0gKSB7XG5cdC8vIFN1cHBvcnQ6IE9wZXJhIDw9IDEyLjEyXG5cdC8vIE9wZXJhIHJlcG9ydHMgb2Zmc2V0V2lkdGhzIGFuZCBvZmZzZXRIZWlnaHRzIGxlc3MgdGhhbiB6ZXJvIG9uIHNvbWUgZWxlbWVudHNcblx0cmV0dXJuIGVsZW0ub2Zmc2V0V2lkdGggPD0gMCAmJiBlbGVtLm9mZnNldEhlaWdodCA8PSAwO1xufTtcbmpRdWVyeS5leHByLmZpbHRlcnMudmlzaWJsZSA9IGZ1bmN0aW9uKCBlbGVtICkge1xuXHRyZXR1cm4gIWpRdWVyeS5leHByLmZpbHRlcnMuaGlkZGVuKCBlbGVtICk7XG59O1xuXG5cblxuXG52YXIgcjIwID0gLyUyMC9nLFxuXHRyYnJhY2tldCA9IC9cXFtcXF0kLyxcblx0ckNSTEYgPSAvXFxyP1xcbi9nLFxuXHRyc3VibWl0dGVyVHlwZXMgPSAvXig/OnN1Ym1pdHxidXR0b258aW1hZ2V8cmVzZXR8ZmlsZSkkL2ksXG5cdHJzdWJtaXR0YWJsZSA9IC9eKD86aW5wdXR8c2VsZWN0fHRleHRhcmVhfGtleWdlbikvaTtcblxuZnVuY3Rpb24gYnVpbGRQYXJhbXMoIHByZWZpeCwgb2JqLCB0cmFkaXRpb25hbCwgYWRkICkge1xuXHR2YXIgbmFtZTtcblxuXHRpZiAoIGpRdWVyeS5pc0FycmF5KCBvYmogKSApIHtcblx0XHQvLyBTZXJpYWxpemUgYXJyYXkgaXRlbS5cblx0XHRqUXVlcnkuZWFjaCggb2JqLCBmdW5jdGlvbiggaSwgdiApIHtcblx0XHRcdGlmICggdHJhZGl0aW9uYWwgfHwgcmJyYWNrZXQudGVzdCggcHJlZml4ICkgKSB7XG5cdFx0XHRcdC8vIFRyZWF0IGVhY2ggYXJyYXkgaXRlbSBhcyBhIHNjYWxhci5cblx0XHRcdFx0YWRkKCBwcmVmaXgsIHYgKTtcblxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gSXRlbSBpcyBub24tc2NhbGFyIChhcnJheSBvciBvYmplY3QpLCBlbmNvZGUgaXRzIG51bWVyaWMgaW5kZXguXG5cdFx0XHRcdGJ1aWxkUGFyYW1zKCBwcmVmaXggKyBcIltcIiArICggdHlwZW9mIHYgPT09IFwib2JqZWN0XCIgPyBpIDogXCJcIiApICsgXCJdXCIsIHYsIHRyYWRpdGlvbmFsLCBhZGQgKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHR9IGVsc2UgaWYgKCAhdHJhZGl0aW9uYWwgJiYgalF1ZXJ5LnR5cGUoIG9iaiApID09PSBcIm9iamVjdFwiICkge1xuXHRcdC8vIFNlcmlhbGl6ZSBvYmplY3QgaXRlbS5cblx0XHRmb3IgKCBuYW1lIGluIG9iaiApIHtcblx0XHRcdGJ1aWxkUGFyYW1zKCBwcmVmaXggKyBcIltcIiArIG5hbWUgKyBcIl1cIiwgb2JqWyBuYW1lIF0sIHRyYWRpdGlvbmFsLCBhZGQgKTtcblx0XHR9XG5cblx0fSBlbHNlIHtcblx0XHQvLyBTZXJpYWxpemUgc2NhbGFyIGl0ZW0uXG5cdFx0YWRkKCBwcmVmaXgsIG9iaiApO1xuXHR9XG59XG5cbi8vIFNlcmlhbGl6ZSBhbiBhcnJheSBvZiBmb3JtIGVsZW1lbnRzIG9yIGEgc2V0IG9mXG4vLyBrZXkvdmFsdWVzIGludG8gYSBxdWVyeSBzdHJpbmdcbmpRdWVyeS5wYXJhbSA9IGZ1bmN0aW9uKCBhLCB0cmFkaXRpb25hbCApIHtcblx0dmFyIHByZWZpeCxcblx0XHRzID0gW10sXG5cdFx0YWRkID0gZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cdFx0XHQvLyBJZiB2YWx1ZSBpcyBhIGZ1bmN0aW9uLCBpbnZva2UgaXQgYW5kIHJldHVybiBpdHMgdmFsdWVcblx0XHRcdHZhbHVlID0galF1ZXJ5LmlzRnVuY3Rpb24oIHZhbHVlICkgPyB2YWx1ZSgpIDogKCB2YWx1ZSA9PSBudWxsID8gXCJcIiA6IHZhbHVlICk7XG5cdFx0XHRzWyBzLmxlbmd0aCBdID0gZW5jb2RlVVJJQ29tcG9uZW50KCBrZXkgKSArIFwiPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KCB2YWx1ZSApO1xuXHRcdH07XG5cblx0Ly8gU2V0IHRyYWRpdGlvbmFsIHRvIHRydWUgZm9yIGpRdWVyeSA8PSAxLjMuMiBiZWhhdmlvci5cblx0aWYgKCB0cmFkaXRpb25hbCA9PT0gdW5kZWZpbmVkICkge1xuXHRcdHRyYWRpdGlvbmFsID0galF1ZXJ5LmFqYXhTZXR0aW5ncyAmJiBqUXVlcnkuYWpheFNldHRpbmdzLnRyYWRpdGlvbmFsO1xuXHR9XG5cblx0Ly8gSWYgYW4gYXJyYXkgd2FzIHBhc3NlZCBpbiwgYXNzdW1lIHRoYXQgaXQgaXMgYW4gYXJyYXkgb2YgZm9ybSBlbGVtZW50cy5cblx0aWYgKCBqUXVlcnkuaXNBcnJheSggYSApIHx8ICggYS5qcXVlcnkgJiYgIWpRdWVyeS5pc1BsYWluT2JqZWN0KCBhICkgKSApIHtcblx0XHQvLyBTZXJpYWxpemUgdGhlIGZvcm0gZWxlbWVudHNcblx0XHRqUXVlcnkuZWFjaCggYSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRhZGQoIHRoaXMubmFtZSwgdGhpcy52YWx1ZSApO1xuXHRcdH0pO1xuXG5cdH0gZWxzZSB7XG5cdFx0Ly8gSWYgdHJhZGl0aW9uYWwsIGVuY29kZSB0aGUgXCJvbGRcIiB3YXkgKHRoZSB3YXkgMS4zLjIgb3Igb2xkZXJcblx0XHQvLyBkaWQgaXQpLCBvdGhlcndpc2UgZW5jb2RlIHBhcmFtcyByZWN1cnNpdmVseS5cblx0XHRmb3IgKCBwcmVmaXggaW4gYSApIHtcblx0XHRcdGJ1aWxkUGFyYW1zKCBwcmVmaXgsIGFbIHByZWZpeCBdLCB0cmFkaXRpb25hbCwgYWRkICk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gUmV0dXJuIHRoZSByZXN1bHRpbmcgc2VyaWFsaXphdGlvblxuXHRyZXR1cm4gcy5qb2luKCBcIiZcIiApLnJlcGxhY2UoIHIyMCwgXCIrXCIgKTtcbn07XG5cbmpRdWVyeS5mbi5leHRlbmQoe1xuXHRzZXJpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBqUXVlcnkucGFyYW0oIHRoaXMuc2VyaWFsaXplQXJyYXkoKSApO1xuXHR9LFxuXHRzZXJpYWxpemVBcnJheTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gQ2FuIGFkZCBwcm9wSG9vayBmb3IgXCJlbGVtZW50c1wiIHRvIGZpbHRlciBvciBhZGQgZm9ybSBlbGVtZW50c1xuXHRcdFx0dmFyIGVsZW1lbnRzID0galF1ZXJ5LnByb3AoIHRoaXMsIFwiZWxlbWVudHNcIiApO1xuXHRcdFx0cmV0dXJuIGVsZW1lbnRzID8galF1ZXJ5Lm1ha2VBcnJheSggZWxlbWVudHMgKSA6IHRoaXM7XG5cdFx0fSlcblx0XHQuZmlsdGVyKGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHR5cGUgPSB0aGlzLnR5cGU7XG5cblx0XHRcdC8vIFVzZSAuaXMoIFwiOmRpc2FibGVkXCIgKSBzbyB0aGF0IGZpZWxkc2V0W2Rpc2FibGVkXSB3b3Jrc1xuXHRcdFx0cmV0dXJuIHRoaXMubmFtZSAmJiAhalF1ZXJ5KCB0aGlzICkuaXMoIFwiOmRpc2FibGVkXCIgKSAmJlxuXHRcdFx0XHRyc3VibWl0dGFibGUudGVzdCggdGhpcy5ub2RlTmFtZSApICYmICFyc3VibWl0dGVyVHlwZXMudGVzdCggdHlwZSApICYmXG5cdFx0XHRcdCggdGhpcy5jaGVja2VkIHx8ICFyY2hlY2thYmxlVHlwZS50ZXN0KCB0eXBlICkgKTtcblx0XHR9KVxuXHRcdC5tYXAoZnVuY3Rpb24oIGksIGVsZW0gKSB7XG5cdFx0XHR2YXIgdmFsID0galF1ZXJ5KCB0aGlzICkudmFsKCk7XG5cblx0XHRcdHJldHVybiB2YWwgPT0gbnVsbCA/XG5cdFx0XHRcdG51bGwgOlxuXHRcdFx0XHRqUXVlcnkuaXNBcnJheSggdmFsICkgP1xuXHRcdFx0XHRcdGpRdWVyeS5tYXAoIHZhbCwgZnVuY3Rpb24oIHZhbCApIHtcblx0XHRcdFx0XHRcdHJldHVybiB7IG5hbWU6IGVsZW0ubmFtZSwgdmFsdWU6IHZhbC5yZXBsYWNlKCByQ1JMRiwgXCJcXHJcXG5cIiApIH07XG5cdFx0XHRcdFx0fSkgOlxuXHRcdFx0XHRcdHsgbmFtZTogZWxlbS5uYW1lLCB2YWx1ZTogdmFsLnJlcGxhY2UoIHJDUkxGLCBcIlxcclxcblwiICkgfTtcblx0XHR9KS5nZXQoKTtcblx0fVxufSk7XG5cblxualF1ZXJ5LmFqYXhTZXR0aW5ncy54aHIgPSBmdW5jdGlvbigpIHtcblx0dHJ5IHtcblx0XHRyZXR1cm4gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cdH0gY2F0Y2goIGUgKSB7fVxufTtcblxudmFyIHhocklkID0gMCxcblx0eGhyQ2FsbGJhY2tzID0ge30sXG5cdHhoclN1Y2Nlc3NTdGF0dXMgPSB7XG5cdFx0Ly8gZmlsZSBwcm90b2NvbCBhbHdheXMgeWllbGRzIHN0YXR1cyBjb2RlIDAsIGFzc3VtZSAyMDBcblx0XHQwOiAyMDAsXG5cdFx0Ly8gU3VwcG9ydDogSUU5XG5cdFx0Ly8gIzE0NTA6IHNvbWV0aW1lcyBJRSByZXR1cm5zIDEyMjMgd2hlbiBpdCBzaG91bGQgYmUgMjA0XG5cdFx0MTIyMzogMjA0XG5cdH0sXG5cdHhoclN1cHBvcnRlZCA9IGpRdWVyeS5hamF4U2V0dGluZ3MueGhyKCk7XG5cbi8vIFN1cHBvcnQ6IElFOVxuLy8gT3BlbiByZXF1ZXN0cyBtdXN0IGJlIG1hbnVhbGx5IGFib3J0ZWQgb24gdW5sb2FkICgjNTI4MClcbmlmICggd2luZG93LkFjdGl2ZVhPYmplY3QgKSB7XG5cdGpRdWVyeSggd2luZG93ICkub24oIFwidW5sb2FkXCIsIGZ1bmN0aW9uKCkge1xuXHRcdGZvciAoIHZhciBrZXkgaW4geGhyQ2FsbGJhY2tzICkge1xuXHRcdFx0eGhyQ2FsbGJhY2tzWyBrZXkgXSgpO1xuXHRcdH1cblx0fSk7XG59XG5cbnN1cHBvcnQuY29ycyA9ICEheGhyU3VwcG9ydGVkICYmICggXCJ3aXRoQ3JlZGVudGlhbHNcIiBpbiB4aHJTdXBwb3J0ZWQgKTtcbnN1cHBvcnQuYWpheCA9IHhoclN1cHBvcnRlZCA9ICEheGhyU3VwcG9ydGVkO1xuXG5qUXVlcnkuYWpheFRyYW5zcG9ydChmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0dmFyIGNhbGxiYWNrO1xuXG5cdC8vIENyb3NzIGRvbWFpbiBvbmx5IGFsbG93ZWQgaWYgc3VwcG9ydGVkIHRocm91Z2ggWE1MSHR0cFJlcXVlc3Rcblx0aWYgKCBzdXBwb3J0LmNvcnMgfHwgeGhyU3VwcG9ydGVkICYmICFvcHRpb25zLmNyb3NzRG9tYWluICkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRzZW5kOiBmdW5jdGlvbiggaGVhZGVycywgY29tcGxldGUgKSB7XG5cdFx0XHRcdHZhciBpLFxuXHRcdFx0XHRcdHhociA9IG9wdGlvbnMueGhyKCksXG5cdFx0XHRcdFx0aWQgPSArK3hocklkO1xuXG5cdFx0XHRcdHhoci5vcGVuKCBvcHRpb25zLnR5cGUsIG9wdGlvbnMudXJsLCBvcHRpb25zLmFzeW5jLCBvcHRpb25zLnVzZXJuYW1lLCBvcHRpb25zLnBhc3N3b3JkICk7XG5cblx0XHRcdFx0Ly8gQXBwbHkgY3VzdG9tIGZpZWxkcyBpZiBwcm92aWRlZFxuXHRcdFx0XHRpZiAoIG9wdGlvbnMueGhyRmllbGRzICkge1xuXHRcdFx0XHRcdGZvciAoIGkgaW4gb3B0aW9ucy54aHJGaWVsZHMgKSB7XG5cdFx0XHRcdFx0XHR4aHJbIGkgXSA9IG9wdGlvbnMueGhyRmllbGRzWyBpIF07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gT3ZlcnJpZGUgbWltZSB0eXBlIGlmIG5lZWRlZFxuXHRcdFx0XHRpZiAoIG9wdGlvbnMubWltZVR5cGUgJiYgeGhyLm92ZXJyaWRlTWltZVR5cGUgKSB7XG5cdFx0XHRcdFx0eGhyLm92ZXJyaWRlTWltZVR5cGUoIG9wdGlvbnMubWltZVR5cGUgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFgtUmVxdWVzdGVkLVdpdGggaGVhZGVyXG5cdFx0XHRcdC8vIEZvciBjcm9zcy1kb21haW4gcmVxdWVzdHMsIHNlZWluZyBhcyBjb25kaXRpb25zIGZvciBhIHByZWZsaWdodCBhcmVcblx0XHRcdFx0Ly8gYWtpbiB0byBhIGppZ3NhdyBwdXp6bGUsIHdlIHNpbXBseSBuZXZlciBzZXQgaXQgdG8gYmUgc3VyZS5cblx0XHRcdFx0Ly8gKGl0IGNhbiBhbHdheXMgYmUgc2V0IG9uIGEgcGVyLXJlcXVlc3QgYmFzaXMgb3IgZXZlbiB1c2luZyBhamF4U2V0dXApXG5cdFx0XHRcdC8vIEZvciBzYW1lLWRvbWFpbiByZXF1ZXN0cywgd29uJ3QgY2hhbmdlIGhlYWRlciBpZiBhbHJlYWR5IHByb3ZpZGVkLlxuXHRcdFx0XHRpZiAoICFvcHRpb25zLmNyb3NzRG9tYWluICYmICFoZWFkZXJzW1wiWC1SZXF1ZXN0ZWQtV2l0aFwiXSApIHtcblx0XHRcdFx0XHRoZWFkZXJzW1wiWC1SZXF1ZXN0ZWQtV2l0aFwiXSA9IFwiWE1MSHR0cFJlcXVlc3RcIjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFNldCBoZWFkZXJzXG5cdFx0XHRcdGZvciAoIGkgaW4gaGVhZGVycyApIHtcblx0XHRcdFx0XHR4aHIuc2V0UmVxdWVzdEhlYWRlciggaSwgaGVhZGVyc1sgaSBdICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBDYWxsYmFja1xuXHRcdFx0XHRjYWxsYmFjayA9IGZ1bmN0aW9uKCB0eXBlICkge1xuXHRcdFx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGlmICggY2FsbGJhY2sgKSB7XG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSB4aHJDYWxsYmFja3NbIGlkIF07XG5cdFx0XHRcdFx0XHRcdGNhbGxiYWNrID0geGhyLm9ubG9hZCA9IHhoci5vbmVycm9yID0gbnVsbDtcblxuXHRcdFx0XHRcdFx0XHRpZiAoIHR5cGUgPT09IFwiYWJvcnRcIiApIHtcblx0XHRcdFx0XHRcdFx0XHR4aHIuYWJvcnQoKTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmICggdHlwZSA9PT0gXCJlcnJvclwiICkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbXBsZXRlKFxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gZmlsZTogcHJvdG9jb2wgYWx3YXlzIHlpZWxkcyBzdGF0dXMgMDsgc2VlICM4NjA1LCAjMTQyMDdcblx0XHRcdFx0XHRcdFx0XHRcdHhoci5zdGF0dXMsXG5cdFx0XHRcdFx0XHRcdFx0XHR4aHIuc3RhdHVzVGV4dFxuXHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29tcGxldGUoXG5cdFx0XHRcdFx0XHRcdFx0XHR4aHJTdWNjZXNzU3RhdHVzWyB4aHIuc3RhdHVzIF0gfHwgeGhyLnN0YXR1cyxcblx0XHRcdFx0XHRcdFx0XHRcdHhoci5zdGF0dXNUZXh0LFxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gU3VwcG9ydDogSUU5XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBBY2Nlc3NpbmcgYmluYXJ5LWRhdGEgcmVzcG9uc2VUZXh0IHRocm93cyBhbiBleGNlcHRpb25cblx0XHRcdFx0XHRcdFx0XHRcdC8vICgjMTE0MjYpXG5cdFx0XHRcdFx0XHRcdFx0XHR0eXBlb2YgeGhyLnJlc3BvbnNlVGV4dCA9PT0gXCJzdHJpbmdcIiA/IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dGV4dDogeGhyLnJlc3BvbnNlVGV4dFxuXHRcdFx0XHRcdFx0XHRcdFx0fSA6IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdFx0XHRcdHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKVxuXHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdC8vIExpc3RlbiB0byBldmVudHNcblx0XHRcdFx0eGhyLm9ubG9hZCA9IGNhbGxiYWNrKCk7XG5cdFx0XHRcdHhoci5vbmVycm9yID0gY2FsbGJhY2soXCJlcnJvclwiKTtcblxuXHRcdFx0XHQvLyBDcmVhdGUgdGhlIGFib3J0IGNhbGxiYWNrXG5cdFx0XHRcdGNhbGxiYWNrID0geGhyQ2FsbGJhY2tzWyBpZCBdID0gY2FsbGJhY2soXCJhYm9ydFwiKTtcblxuXHRcdFx0XHQvLyBEbyBzZW5kIHRoZSByZXF1ZXN0XG5cdFx0XHRcdC8vIFRoaXMgbWF5IHJhaXNlIGFuIGV4Y2VwdGlvbiB3aGljaCBpcyBhY3R1YWxseVxuXHRcdFx0XHQvLyBoYW5kbGVkIGluIGpRdWVyeS5hamF4IChzbyBubyB0cnkvY2F0Y2ggaGVyZSlcblx0XHRcdFx0eGhyLnNlbmQoIG9wdGlvbnMuaGFzQ29udGVudCAmJiBvcHRpb25zLmRhdGEgfHwgbnVsbCApO1xuXHRcdFx0fSxcblxuXHRcdFx0YWJvcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAoIGNhbGxiYWNrICkge1xuXHRcdFx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHR9XG59KTtcblxuXG5cblxuLy8gSW5zdGFsbCBzY3JpcHQgZGF0YVR5cGVcbmpRdWVyeS5hamF4U2V0dXAoe1xuXHRhY2NlcHRzOiB7XG5cdFx0c2NyaXB0OiBcInRleHQvamF2YXNjcmlwdCwgYXBwbGljYXRpb24vamF2YXNjcmlwdCwgYXBwbGljYXRpb24vZWNtYXNjcmlwdCwgYXBwbGljYXRpb24veC1lY21hc2NyaXB0XCJcblx0fSxcblx0Y29udGVudHM6IHtcblx0XHRzY3JpcHQ6IC8oPzpqYXZhfGVjbWEpc2NyaXB0L1xuXHR9LFxuXHRjb252ZXJ0ZXJzOiB7XG5cdFx0XCJ0ZXh0IHNjcmlwdFwiOiBmdW5jdGlvbiggdGV4dCApIHtcblx0XHRcdGpRdWVyeS5nbG9iYWxFdmFsKCB0ZXh0ICk7XG5cdFx0XHRyZXR1cm4gdGV4dDtcblx0XHR9XG5cdH1cbn0pO1xuXG4vLyBIYW5kbGUgY2FjaGUncyBzcGVjaWFsIGNhc2UgYW5kIGNyb3NzRG9tYWluXG5qUXVlcnkuYWpheFByZWZpbHRlciggXCJzY3JpcHRcIiwgZnVuY3Rpb24oIHMgKSB7XG5cdGlmICggcy5jYWNoZSA9PT0gdW5kZWZpbmVkICkge1xuXHRcdHMuY2FjaGUgPSBmYWxzZTtcblx0fVxuXHRpZiAoIHMuY3Jvc3NEb21haW4gKSB7XG5cdFx0cy50eXBlID0gXCJHRVRcIjtcblx0fVxufSk7XG5cbi8vIEJpbmQgc2NyaXB0IHRhZyBoYWNrIHRyYW5zcG9ydFxualF1ZXJ5LmFqYXhUcmFuc3BvcnQoIFwic2NyaXB0XCIsIGZ1bmN0aW9uKCBzICkge1xuXHQvLyBUaGlzIHRyYW5zcG9ydCBvbmx5IGRlYWxzIHdpdGggY3Jvc3MgZG9tYWluIHJlcXVlc3RzXG5cdGlmICggcy5jcm9zc0RvbWFpbiApIHtcblx0XHR2YXIgc2NyaXB0LCBjYWxsYmFjaztcblx0XHRyZXR1cm4ge1xuXHRcdFx0c2VuZDogZnVuY3Rpb24oIF8sIGNvbXBsZXRlICkge1xuXHRcdFx0XHRzY3JpcHQgPSBqUXVlcnkoXCI8c2NyaXB0PlwiKS5wcm9wKHtcblx0XHRcdFx0XHRhc3luYzogdHJ1ZSxcblx0XHRcdFx0XHRjaGFyc2V0OiBzLnNjcmlwdENoYXJzZXQsXG5cdFx0XHRcdFx0c3JjOiBzLnVybFxuXHRcdFx0XHR9KS5vbihcblx0XHRcdFx0XHRcImxvYWQgZXJyb3JcIixcblx0XHRcdFx0XHRjYWxsYmFjayA9IGZ1bmN0aW9uKCBldnQgKSB7XG5cdFx0XHRcdFx0XHRzY3JpcHQucmVtb3ZlKCk7XG5cdFx0XHRcdFx0XHRjYWxsYmFjayA9IG51bGw7XG5cdFx0XHRcdFx0XHRpZiAoIGV2dCApIHtcblx0XHRcdFx0XHRcdFx0Y29tcGxldGUoIGV2dC50eXBlID09PSBcImVycm9yXCIgPyA0MDQgOiAyMDAsIGV2dC50eXBlICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKCBzY3JpcHRbIDAgXSApO1xuXHRcdFx0fSxcblx0XHRcdGFib3J0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKCBjYWxsYmFjayApIHtcblx0XHRcdFx0XHRjYWxsYmFjaygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxufSk7XG5cblxuXG5cbnZhciBvbGRDYWxsYmFja3MgPSBbXSxcblx0cmpzb25wID0gLyg9KVxcPyg/PSZ8JCl8XFw/XFw/LztcblxuLy8gRGVmYXVsdCBqc29ucCBzZXR0aW5nc1xualF1ZXJ5LmFqYXhTZXR1cCh7XG5cdGpzb25wOiBcImNhbGxiYWNrXCIsXG5cdGpzb25wQ2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBjYWxsYmFjayA9IG9sZENhbGxiYWNrcy5wb3AoKSB8fCAoIGpRdWVyeS5leHBhbmRvICsgXCJfXCIgKyAoIG5vbmNlKysgKSApO1xuXHRcdHRoaXNbIGNhbGxiYWNrIF0gPSB0cnVlO1xuXHRcdHJldHVybiBjYWxsYmFjaztcblx0fVxufSk7XG5cbi8vIERldGVjdCwgbm9ybWFsaXplIG9wdGlvbnMgYW5kIGluc3RhbGwgY2FsbGJhY2tzIGZvciBqc29ucCByZXF1ZXN0c1xualF1ZXJ5LmFqYXhQcmVmaWx0ZXIoIFwianNvbiBqc29ucFwiLCBmdW5jdGlvbiggcywgb3JpZ2luYWxTZXR0aW5ncywganFYSFIgKSB7XG5cblx0dmFyIGNhbGxiYWNrTmFtZSwgb3ZlcndyaXR0ZW4sIHJlc3BvbnNlQ29udGFpbmVyLFxuXHRcdGpzb25Qcm9wID0gcy5qc29ucCAhPT0gZmFsc2UgJiYgKCByanNvbnAudGVzdCggcy51cmwgKSA/XG5cdFx0XHRcInVybFwiIDpcblx0XHRcdHR5cGVvZiBzLmRhdGEgPT09IFwic3RyaW5nXCIgJiYgISggcy5jb250ZW50VHlwZSB8fCBcIlwiICkuaW5kZXhPZihcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiKSAmJiByanNvbnAudGVzdCggcy5kYXRhICkgJiYgXCJkYXRhXCJcblx0XHQpO1xuXG5cdC8vIEhhbmRsZSBpZmYgdGhlIGV4cGVjdGVkIGRhdGEgdHlwZSBpcyBcImpzb25wXCIgb3Igd2UgaGF2ZSBhIHBhcmFtZXRlciB0byBzZXRcblx0aWYgKCBqc29uUHJvcCB8fCBzLmRhdGFUeXBlc1sgMCBdID09PSBcImpzb25wXCIgKSB7XG5cblx0XHQvLyBHZXQgY2FsbGJhY2sgbmFtZSwgcmVtZW1iZXJpbmcgcHJlZXhpc3RpbmcgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIGl0XG5cdFx0Y2FsbGJhY2tOYW1lID0gcy5qc29ucENhbGxiYWNrID0galF1ZXJ5LmlzRnVuY3Rpb24oIHMuanNvbnBDYWxsYmFjayApID9cblx0XHRcdHMuanNvbnBDYWxsYmFjaygpIDpcblx0XHRcdHMuanNvbnBDYWxsYmFjaztcblxuXHRcdC8vIEluc2VydCBjYWxsYmFjayBpbnRvIHVybCBvciBmb3JtIGRhdGFcblx0XHRpZiAoIGpzb25Qcm9wICkge1xuXHRcdFx0c1sganNvblByb3AgXSA9IHNbIGpzb25Qcm9wIF0ucmVwbGFjZSggcmpzb25wLCBcIiQxXCIgKyBjYWxsYmFja05hbWUgKTtcblx0XHR9IGVsc2UgaWYgKCBzLmpzb25wICE9PSBmYWxzZSApIHtcblx0XHRcdHMudXJsICs9ICggcnF1ZXJ5LnRlc3QoIHMudXJsICkgPyBcIiZcIiA6IFwiP1wiICkgKyBzLmpzb25wICsgXCI9XCIgKyBjYWxsYmFja05hbWU7XG5cdFx0fVxuXG5cdFx0Ly8gVXNlIGRhdGEgY29udmVydGVyIHRvIHJldHJpZXZlIGpzb24gYWZ0ZXIgc2NyaXB0IGV4ZWN1dGlvblxuXHRcdHMuY29udmVydGVyc1tcInNjcmlwdCBqc29uXCJdID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoICFyZXNwb25zZUNvbnRhaW5lciApIHtcblx0XHRcdFx0alF1ZXJ5LmVycm9yKCBjYWxsYmFja05hbWUgKyBcIiB3YXMgbm90IGNhbGxlZFwiICk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcmVzcG9uc2VDb250YWluZXJbIDAgXTtcblx0XHR9O1xuXG5cdFx0Ly8gZm9yY2UganNvbiBkYXRhVHlwZVxuXHRcdHMuZGF0YVR5cGVzWyAwIF0gPSBcImpzb25cIjtcblxuXHRcdC8vIEluc3RhbGwgY2FsbGJhY2tcblx0XHRvdmVyd3JpdHRlbiA9IHdpbmRvd1sgY2FsbGJhY2tOYW1lIF07XG5cdFx0d2luZG93WyBjYWxsYmFja05hbWUgXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmVzcG9uc2VDb250YWluZXIgPSBhcmd1bWVudHM7XG5cdFx0fTtcblxuXHRcdC8vIENsZWFuLXVwIGZ1bmN0aW9uIChmaXJlcyBhZnRlciBjb252ZXJ0ZXJzKVxuXHRcdGpxWEhSLmFsd2F5cyhmdW5jdGlvbigpIHtcblx0XHRcdC8vIFJlc3RvcmUgcHJlZXhpc3RpbmcgdmFsdWVcblx0XHRcdHdpbmRvd1sgY2FsbGJhY2tOYW1lIF0gPSBvdmVyd3JpdHRlbjtcblxuXHRcdFx0Ly8gU2F2ZSBiYWNrIGFzIGZyZWVcblx0XHRcdGlmICggc1sgY2FsbGJhY2tOYW1lIF0gKSB7XG5cdFx0XHRcdC8vIG1ha2Ugc3VyZSB0aGF0IHJlLXVzaW5nIHRoZSBvcHRpb25zIGRvZXNuJ3Qgc2NyZXcgdGhpbmdzIGFyb3VuZFxuXHRcdFx0XHRzLmpzb25wQ2FsbGJhY2sgPSBvcmlnaW5hbFNldHRpbmdzLmpzb25wQ2FsbGJhY2s7XG5cblx0XHRcdFx0Ly8gc2F2ZSB0aGUgY2FsbGJhY2sgbmFtZSBmb3IgZnV0dXJlIHVzZVxuXHRcdFx0XHRvbGRDYWxsYmFja3MucHVzaCggY2FsbGJhY2tOYW1lICk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIENhbGwgaWYgaXQgd2FzIGEgZnVuY3Rpb24gYW5kIHdlIGhhdmUgYSByZXNwb25zZVxuXHRcdFx0aWYgKCByZXNwb25zZUNvbnRhaW5lciAmJiBqUXVlcnkuaXNGdW5jdGlvbiggb3ZlcndyaXR0ZW4gKSApIHtcblx0XHRcdFx0b3ZlcndyaXR0ZW4oIHJlc3BvbnNlQ29udGFpbmVyWyAwIF0gKTtcblx0XHRcdH1cblxuXHRcdFx0cmVzcG9uc2VDb250YWluZXIgPSBvdmVyd3JpdHRlbiA9IHVuZGVmaW5lZDtcblx0XHR9KTtcblxuXHRcdC8vIERlbGVnYXRlIHRvIHNjcmlwdFxuXHRcdHJldHVybiBcInNjcmlwdFwiO1xuXHR9XG59KTtcblxuXG5cblxuLy8gZGF0YTogc3RyaW5nIG9mIGh0bWxcbi8vIGNvbnRleHQgKG9wdGlvbmFsKTogSWYgc3BlY2lmaWVkLCB0aGUgZnJhZ21lbnQgd2lsbCBiZSBjcmVhdGVkIGluIHRoaXMgY29udGV4dCwgZGVmYXVsdHMgdG8gZG9jdW1lbnRcbi8vIGtlZXBTY3JpcHRzIChvcHRpb25hbCk6IElmIHRydWUsIHdpbGwgaW5jbHVkZSBzY3JpcHRzIHBhc3NlZCBpbiB0aGUgaHRtbCBzdHJpbmdcbmpRdWVyeS5wYXJzZUhUTUwgPSBmdW5jdGlvbiggZGF0YSwgY29udGV4dCwga2VlcFNjcmlwdHMgKSB7XG5cdGlmICggIWRhdGEgfHwgdHlwZW9mIGRhdGEgIT09IFwic3RyaW5nXCIgKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0aWYgKCB0eXBlb2YgY29udGV4dCA9PT0gXCJib29sZWFuXCIgKSB7XG5cdFx0a2VlcFNjcmlwdHMgPSBjb250ZXh0O1xuXHRcdGNvbnRleHQgPSBmYWxzZTtcblx0fVxuXHRjb250ZXh0ID0gY29udGV4dCB8fCBkb2N1bWVudDtcblxuXHR2YXIgcGFyc2VkID0gcnNpbmdsZVRhZy5leGVjKCBkYXRhICksXG5cdFx0c2NyaXB0cyA9ICFrZWVwU2NyaXB0cyAmJiBbXTtcblxuXHQvLyBTaW5nbGUgdGFnXG5cdGlmICggcGFyc2VkICkge1xuXHRcdHJldHVybiBbIGNvbnRleHQuY3JlYXRlRWxlbWVudCggcGFyc2VkWzFdICkgXTtcblx0fVxuXG5cdHBhcnNlZCA9IGpRdWVyeS5idWlsZEZyYWdtZW50KCBbIGRhdGEgXSwgY29udGV4dCwgc2NyaXB0cyApO1xuXG5cdGlmICggc2NyaXB0cyAmJiBzY3JpcHRzLmxlbmd0aCApIHtcblx0XHRqUXVlcnkoIHNjcmlwdHMgKS5yZW1vdmUoKTtcblx0fVxuXG5cdHJldHVybiBqUXVlcnkubWVyZ2UoIFtdLCBwYXJzZWQuY2hpbGROb2RlcyApO1xufTtcblxuXG4vLyBLZWVwIGEgY29weSBvZiB0aGUgb2xkIGxvYWQgbWV0aG9kXG52YXIgX2xvYWQgPSBqUXVlcnkuZm4ubG9hZDtcblxuLyoqXG4gKiBMb2FkIGEgdXJsIGludG8gYSBwYWdlXG4gKi9cbmpRdWVyeS5mbi5sb2FkID0gZnVuY3Rpb24oIHVybCwgcGFyYW1zLCBjYWxsYmFjayApIHtcblx0aWYgKCB0eXBlb2YgdXJsICE9PSBcInN0cmluZ1wiICYmIF9sb2FkICkge1xuXHRcdHJldHVybiBfbG9hZC5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdH1cblxuXHR2YXIgc2VsZWN0b3IsIHR5cGUsIHJlc3BvbnNlLFxuXHRcdHNlbGYgPSB0aGlzLFxuXHRcdG9mZiA9IHVybC5pbmRleE9mKFwiIFwiKTtcblxuXHRpZiAoIG9mZiA+PSAwICkge1xuXHRcdHNlbGVjdG9yID0gdXJsLnNsaWNlKCBvZmYgKTtcblx0XHR1cmwgPSB1cmwuc2xpY2UoIDAsIG9mZiApO1xuXHR9XG5cblx0Ly8gSWYgaXQncyBhIGZ1bmN0aW9uXG5cdGlmICggalF1ZXJ5LmlzRnVuY3Rpb24oIHBhcmFtcyApICkge1xuXG5cdFx0Ly8gV2UgYXNzdW1lIHRoYXQgaXQncyB0aGUgY2FsbGJhY2tcblx0XHRjYWxsYmFjayA9IHBhcmFtcztcblx0XHRwYXJhbXMgPSB1bmRlZmluZWQ7XG5cblx0Ly8gT3RoZXJ3aXNlLCBidWlsZCBhIHBhcmFtIHN0cmluZ1xuXHR9IGVsc2UgaWYgKCBwYXJhbXMgJiYgdHlwZW9mIHBhcmFtcyA9PT0gXCJvYmplY3RcIiApIHtcblx0XHR0eXBlID0gXCJQT1NUXCI7XG5cdH1cblxuXHQvLyBJZiB3ZSBoYXZlIGVsZW1lbnRzIHRvIG1vZGlmeSwgbWFrZSB0aGUgcmVxdWVzdFxuXHRpZiAoIHNlbGYubGVuZ3RoID4gMCApIHtcblx0XHRqUXVlcnkuYWpheCh7XG5cdFx0XHR1cmw6IHVybCxcblxuXHRcdFx0Ly8gaWYgXCJ0eXBlXCIgdmFyaWFibGUgaXMgdW5kZWZpbmVkLCB0aGVuIFwiR0VUXCIgbWV0aG9kIHdpbGwgYmUgdXNlZFxuXHRcdFx0dHlwZTogdHlwZSxcblx0XHRcdGRhdGFUeXBlOiBcImh0bWxcIixcblx0XHRcdGRhdGE6IHBhcmFtc1xuXHRcdH0pLmRvbmUoZnVuY3Rpb24oIHJlc3BvbnNlVGV4dCApIHtcblxuXHRcdFx0Ly8gU2F2ZSByZXNwb25zZSBmb3IgdXNlIGluIGNvbXBsZXRlIGNhbGxiYWNrXG5cdFx0XHRyZXNwb25zZSA9IGFyZ3VtZW50cztcblxuXHRcdFx0c2VsZi5odG1sKCBzZWxlY3RvciA/XG5cblx0XHRcdFx0Ly8gSWYgYSBzZWxlY3RvciB3YXMgc3BlY2lmaWVkLCBsb2NhdGUgdGhlIHJpZ2h0IGVsZW1lbnRzIGluIGEgZHVtbXkgZGl2XG5cdFx0XHRcdC8vIEV4Y2x1ZGUgc2NyaXB0cyB0byBhdm9pZCBJRSAnUGVybWlzc2lvbiBEZW5pZWQnIGVycm9yc1xuXHRcdFx0XHRqUXVlcnkoXCI8ZGl2PlwiKS5hcHBlbmQoIGpRdWVyeS5wYXJzZUhUTUwoIHJlc3BvbnNlVGV4dCApICkuZmluZCggc2VsZWN0b3IgKSA6XG5cblx0XHRcdFx0Ly8gT3RoZXJ3aXNlIHVzZSB0aGUgZnVsbCByZXN1bHRcblx0XHRcdFx0cmVzcG9uc2VUZXh0ICk7XG5cblx0XHR9KS5jb21wbGV0ZSggY2FsbGJhY2sgJiYgZnVuY3Rpb24oIGpxWEhSLCBzdGF0dXMgKSB7XG5cdFx0XHRzZWxmLmVhY2goIGNhbGxiYWNrLCByZXNwb25zZSB8fCBbIGpxWEhSLnJlc3BvbnNlVGV4dCwgc3RhdHVzLCBqcVhIUiBdICk7XG5cdFx0fSk7XG5cdH1cblxuXHRyZXR1cm4gdGhpcztcbn07XG5cblxuXG5cbmpRdWVyeS5leHByLmZpbHRlcnMuYW5pbWF0ZWQgPSBmdW5jdGlvbiggZWxlbSApIHtcblx0cmV0dXJuIGpRdWVyeS5ncmVwKGpRdWVyeS50aW1lcnMsIGZ1bmN0aW9uKCBmbiApIHtcblx0XHRyZXR1cm4gZWxlbSA9PT0gZm4uZWxlbTtcblx0fSkubGVuZ3RoO1xufTtcblxuXG5cblxudmFyIGRvY0VsZW0gPSB3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG4vKipcbiAqIEdldHMgYSB3aW5kb3cgZnJvbSBhbiBlbGVtZW50XG4gKi9cbmZ1bmN0aW9uIGdldFdpbmRvdyggZWxlbSApIHtcblx0cmV0dXJuIGpRdWVyeS5pc1dpbmRvdyggZWxlbSApID8gZWxlbSA6IGVsZW0ubm9kZVR5cGUgPT09IDkgJiYgZWxlbS5kZWZhdWx0Vmlldztcbn1cblxualF1ZXJ5Lm9mZnNldCA9IHtcblx0c2V0T2Zmc2V0OiBmdW5jdGlvbiggZWxlbSwgb3B0aW9ucywgaSApIHtcblx0XHR2YXIgY3VyUG9zaXRpb24sIGN1ckxlZnQsIGN1ckNTU1RvcCwgY3VyVG9wLCBjdXJPZmZzZXQsIGN1ckNTU0xlZnQsIGNhbGN1bGF0ZVBvc2l0aW9uLFxuXHRcdFx0cG9zaXRpb24gPSBqUXVlcnkuY3NzKCBlbGVtLCBcInBvc2l0aW9uXCIgKSxcblx0XHRcdGN1ckVsZW0gPSBqUXVlcnkoIGVsZW0gKSxcblx0XHRcdHByb3BzID0ge307XG5cblx0XHQvLyBTZXQgcG9zaXRpb24gZmlyc3QsIGluLWNhc2UgdG9wL2xlZnQgYXJlIHNldCBldmVuIG9uIHN0YXRpYyBlbGVtXG5cdFx0aWYgKCBwb3NpdGlvbiA9PT0gXCJzdGF0aWNcIiApIHtcblx0XHRcdGVsZW0uc3R5bGUucG9zaXRpb24gPSBcInJlbGF0aXZlXCI7XG5cdFx0fVxuXG5cdFx0Y3VyT2Zmc2V0ID0gY3VyRWxlbS5vZmZzZXQoKTtcblx0XHRjdXJDU1NUb3AgPSBqUXVlcnkuY3NzKCBlbGVtLCBcInRvcFwiICk7XG5cdFx0Y3VyQ1NTTGVmdCA9IGpRdWVyeS5jc3MoIGVsZW0sIFwibGVmdFwiICk7XG5cdFx0Y2FsY3VsYXRlUG9zaXRpb24gPSAoIHBvc2l0aW9uID09PSBcImFic29sdXRlXCIgfHwgcG9zaXRpb24gPT09IFwiZml4ZWRcIiApICYmXG5cdFx0XHQoIGN1ckNTU1RvcCArIGN1ckNTU0xlZnQgKS5pbmRleE9mKFwiYXV0b1wiKSA+IC0xO1xuXG5cdFx0Ly8gTmVlZCB0byBiZSBhYmxlIHRvIGNhbGN1bGF0ZSBwb3NpdGlvbiBpZiBlaXRoZXIgdG9wIG9yIGxlZnQgaXMgYXV0byBhbmQgcG9zaXRpb24gaXMgZWl0aGVyIGFic29sdXRlIG9yIGZpeGVkXG5cdFx0aWYgKCBjYWxjdWxhdGVQb3NpdGlvbiApIHtcblx0XHRcdGN1clBvc2l0aW9uID0gY3VyRWxlbS5wb3NpdGlvbigpO1xuXHRcdFx0Y3VyVG9wID0gY3VyUG9zaXRpb24udG9wO1xuXHRcdFx0Y3VyTGVmdCA9IGN1clBvc2l0aW9uLmxlZnQ7XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0Y3VyVG9wID0gcGFyc2VGbG9hdCggY3VyQ1NTVG9wICkgfHwgMDtcblx0XHRcdGN1ckxlZnQgPSBwYXJzZUZsb2F0KCBjdXJDU1NMZWZ0ICkgfHwgMDtcblx0XHR9XG5cblx0XHRpZiAoIGpRdWVyeS5pc0Z1bmN0aW9uKCBvcHRpb25zICkgKSB7XG5cdFx0XHRvcHRpb25zID0gb3B0aW9ucy5jYWxsKCBlbGVtLCBpLCBjdXJPZmZzZXQgKTtcblx0XHR9XG5cblx0XHRpZiAoIG9wdGlvbnMudG9wICE9IG51bGwgKSB7XG5cdFx0XHRwcm9wcy50b3AgPSAoIG9wdGlvbnMudG9wIC0gY3VyT2Zmc2V0LnRvcCApICsgY3VyVG9wO1xuXHRcdH1cblx0XHRpZiAoIG9wdGlvbnMubGVmdCAhPSBudWxsICkge1xuXHRcdFx0cHJvcHMubGVmdCA9ICggb3B0aW9ucy5sZWZ0IC0gY3VyT2Zmc2V0LmxlZnQgKSArIGN1ckxlZnQ7XG5cdFx0fVxuXG5cdFx0aWYgKCBcInVzaW5nXCIgaW4gb3B0aW9ucyApIHtcblx0XHRcdG9wdGlvbnMudXNpbmcuY2FsbCggZWxlbSwgcHJvcHMgKTtcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjdXJFbGVtLmNzcyggcHJvcHMgKTtcblx0XHR9XG5cdH1cbn07XG5cbmpRdWVyeS5mbi5leHRlbmQoe1xuXHRvZmZzZXQ6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXHRcdGlmICggYXJndW1lbnRzLmxlbmd0aCApIHtcblx0XHRcdHJldHVybiBvcHRpb25zID09PSB1bmRlZmluZWQgP1xuXHRcdFx0XHR0aGlzIDpcblx0XHRcdFx0dGhpcy5lYWNoKGZ1bmN0aW9uKCBpICkge1xuXHRcdFx0XHRcdGpRdWVyeS5vZmZzZXQuc2V0T2Zmc2V0KCB0aGlzLCBvcHRpb25zLCBpICk7XG5cdFx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHZhciBkb2NFbGVtLCB3aW4sXG5cdFx0XHRlbGVtID0gdGhpc1sgMCBdLFxuXHRcdFx0Ym94ID0geyB0b3A6IDAsIGxlZnQ6IDAgfSxcblx0XHRcdGRvYyA9IGVsZW0gJiYgZWxlbS5vd25lckRvY3VtZW50O1xuXG5cdFx0aWYgKCAhZG9jICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGRvY0VsZW0gPSBkb2MuZG9jdW1lbnRFbGVtZW50O1xuXG5cdFx0Ly8gTWFrZSBzdXJlIGl0J3Mgbm90IGEgZGlzY29ubmVjdGVkIERPTSBub2RlXG5cdFx0aWYgKCAhalF1ZXJ5LmNvbnRhaW5zKCBkb2NFbGVtLCBlbGVtICkgKSB7XG5cdFx0XHRyZXR1cm4gYm94O1xuXHRcdH1cblxuXHRcdC8vIElmIHdlIGRvbid0IGhhdmUgZ0JDUiwganVzdCB1c2UgMCwwIHJhdGhlciB0aGFuIGVycm9yXG5cdFx0Ly8gQmxhY2tCZXJyeSA1LCBpT1MgMyAob3JpZ2luYWwgaVBob25lKVxuXHRcdGlmICggdHlwZW9mIGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0ICE9PSBzdHJ1bmRlZmluZWQgKSB7XG5cdFx0XHRib3ggPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdH1cblx0XHR3aW4gPSBnZXRXaW5kb3coIGRvYyApO1xuXHRcdHJldHVybiB7XG5cdFx0XHR0b3A6IGJveC50b3AgKyB3aW4ucGFnZVlPZmZzZXQgLSBkb2NFbGVtLmNsaWVudFRvcCxcblx0XHRcdGxlZnQ6IGJveC5sZWZ0ICsgd2luLnBhZ2VYT2Zmc2V0IC0gZG9jRWxlbS5jbGllbnRMZWZ0XG5cdFx0fTtcblx0fSxcblxuXHRwb3NpdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCAhdGhpc1sgMCBdICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBvZmZzZXRQYXJlbnQsIG9mZnNldCxcblx0XHRcdGVsZW0gPSB0aGlzWyAwIF0sXG5cdFx0XHRwYXJlbnRPZmZzZXQgPSB7IHRvcDogMCwgbGVmdDogMCB9O1xuXG5cdFx0Ly8gRml4ZWQgZWxlbWVudHMgYXJlIG9mZnNldCBmcm9tIHdpbmRvdyAocGFyZW50T2Zmc2V0ID0ge3RvcDowLCBsZWZ0OiAwfSwgYmVjYXVzZSBpdCBpcyBpdHMgb25seSBvZmZzZXQgcGFyZW50XG5cdFx0aWYgKCBqUXVlcnkuY3NzKCBlbGVtLCBcInBvc2l0aW9uXCIgKSA9PT0gXCJmaXhlZFwiICkge1xuXHRcdFx0Ly8gV2UgYXNzdW1lIHRoYXQgZ2V0Qm91bmRpbmdDbGllbnRSZWN0IGlzIGF2YWlsYWJsZSB3aGVuIGNvbXB1dGVkIHBvc2l0aW9uIGlzIGZpeGVkXG5cdFx0XHRvZmZzZXQgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIEdldCAqcmVhbCogb2Zmc2V0UGFyZW50XG5cdFx0XHRvZmZzZXRQYXJlbnQgPSB0aGlzLm9mZnNldFBhcmVudCgpO1xuXG5cdFx0XHQvLyBHZXQgY29ycmVjdCBvZmZzZXRzXG5cdFx0XHRvZmZzZXQgPSB0aGlzLm9mZnNldCgpO1xuXHRcdFx0aWYgKCAhalF1ZXJ5Lm5vZGVOYW1lKCBvZmZzZXRQYXJlbnRbIDAgXSwgXCJodG1sXCIgKSApIHtcblx0XHRcdFx0cGFyZW50T2Zmc2V0ID0gb2Zmc2V0UGFyZW50Lm9mZnNldCgpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBBZGQgb2Zmc2V0UGFyZW50IGJvcmRlcnNcblx0XHRcdHBhcmVudE9mZnNldC50b3AgKz0galF1ZXJ5LmNzcyggb2Zmc2V0UGFyZW50WyAwIF0sIFwiYm9yZGVyVG9wV2lkdGhcIiwgdHJ1ZSApO1xuXHRcdFx0cGFyZW50T2Zmc2V0LmxlZnQgKz0galF1ZXJ5LmNzcyggb2Zmc2V0UGFyZW50WyAwIF0sIFwiYm9yZGVyTGVmdFdpZHRoXCIsIHRydWUgKTtcblx0XHR9XG5cblx0XHQvLyBTdWJ0cmFjdCBwYXJlbnQgb2Zmc2V0cyBhbmQgZWxlbWVudCBtYXJnaW5zXG5cdFx0cmV0dXJuIHtcblx0XHRcdHRvcDogb2Zmc2V0LnRvcCAtIHBhcmVudE9mZnNldC50b3AgLSBqUXVlcnkuY3NzKCBlbGVtLCBcIm1hcmdpblRvcFwiLCB0cnVlICksXG5cdFx0XHRsZWZ0OiBvZmZzZXQubGVmdCAtIHBhcmVudE9mZnNldC5sZWZ0IC0galF1ZXJ5LmNzcyggZWxlbSwgXCJtYXJnaW5MZWZ0XCIsIHRydWUgKVxuXHRcdH07XG5cdH0sXG5cblx0b2Zmc2V0UGFyZW50OiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgb2Zmc2V0UGFyZW50ID0gdGhpcy5vZmZzZXRQYXJlbnQgfHwgZG9jRWxlbTtcblxuXHRcdFx0d2hpbGUgKCBvZmZzZXRQYXJlbnQgJiYgKCAhalF1ZXJ5Lm5vZGVOYW1lKCBvZmZzZXRQYXJlbnQsIFwiaHRtbFwiICkgJiYgalF1ZXJ5LmNzcyggb2Zmc2V0UGFyZW50LCBcInBvc2l0aW9uXCIgKSA9PT0gXCJzdGF0aWNcIiApICkge1xuXHRcdFx0XHRvZmZzZXRQYXJlbnQgPSBvZmZzZXRQYXJlbnQub2Zmc2V0UGFyZW50O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gb2Zmc2V0UGFyZW50IHx8IGRvY0VsZW07XG5cdFx0fSk7XG5cdH1cbn0pO1xuXG4vLyBDcmVhdGUgc2Nyb2xsTGVmdCBhbmQgc2Nyb2xsVG9wIG1ldGhvZHNcbmpRdWVyeS5lYWNoKCB7IHNjcm9sbExlZnQ6IFwicGFnZVhPZmZzZXRcIiwgc2Nyb2xsVG9wOiBcInBhZ2VZT2Zmc2V0XCIgfSwgZnVuY3Rpb24oIG1ldGhvZCwgcHJvcCApIHtcblx0dmFyIHRvcCA9IFwicGFnZVlPZmZzZXRcIiA9PT0gcHJvcDtcblxuXHRqUXVlcnkuZm5bIG1ldGhvZCBdID0gZnVuY3Rpb24oIHZhbCApIHtcblx0XHRyZXR1cm4gYWNjZXNzKCB0aGlzLCBmdW5jdGlvbiggZWxlbSwgbWV0aG9kLCB2YWwgKSB7XG5cdFx0XHR2YXIgd2luID0gZ2V0V2luZG93KCBlbGVtICk7XG5cblx0XHRcdGlmICggdmFsID09PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdHJldHVybiB3aW4gPyB3aW5bIHByb3AgXSA6IGVsZW1bIG1ldGhvZCBdO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIHdpbiApIHtcblx0XHRcdFx0d2luLnNjcm9sbFRvKFxuXHRcdFx0XHRcdCF0b3AgPyB2YWwgOiB3aW5kb3cucGFnZVhPZmZzZXQsXG5cdFx0XHRcdFx0dG9wID8gdmFsIDogd2luZG93LnBhZ2VZT2Zmc2V0XG5cdFx0XHRcdCk7XG5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGVsZW1bIG1ldGhvZCBdID0gdmFsO1xuXHRcdFx0fVxuXHRcdH0sIG1ldGhvZCwgdmFsLCBhcmd1bWVudHMubGVuZ3RoLCBudWxsICk7XG5cdH07XG59KTtcblxuLy8gQWRkIHRoZSB0b3AvbGVmdCBjc3NIb29rcyB1c2luZyBqUXVlcnkuZm4ucG9zaXRpb25cbi8vIFdlYmtpdCBidWc6IGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0yOTA4NFxuLy8gZ2V0Q29tcHV0ZWRTdHlsZSByZXR1cm5zIHBlcmNlbnQgd2hlbiBzcGVjaWZpZWQgZm9yIHRvcC9sZWZ0L2JvdHRvbS9yaWdodFxuLy8gcmF0aGVyIHRoYW4gbWFrZSB0aGUgY3NzIG1vZHVsZSBkZXBlbmQgb24gdGhlIG9mZnNldCBtb2R1bGUsIHdlIGp1c3QgY2hlY2sgZm9yIGl0IGhlcmVcbmpRdWVyeS5lYWNoKCBbIFwidG9wXCIsIFwibGVmdFwiIF0sIGZ1bmN0aW9uKCBpLCBwcm9wICkge1xuXHRqUXVlcnkuY3NzSG9va3NbIHByb3AgXSA9IGFkZEdldEhvb2tJZiggc3VwcG9ydC5waXhlbFBvc2l0aW9uLFxuXHRcdGZ1bmN0aW9uKCBlbGVtLCBjb21wdXRlZCApIHtcblx0XHRcdGlmICggY29tcHV0ZWQgKSB7XG5cdFx0XHRcdGNvbXB1dGVkID0gY3VyQ1NTKCBlbGVtLCBwcm9wICk7XG5cdFx0XHRcdC8vIGlmIGN1ckNTUyByZXR1cm5zIHBlcmNlbnRhZ2UsIGZhbGxiYWNrIHRvIG9mZnNldFxuXHRcdFx0XHRyZXR1cm4gcm51bW5vbnB4LnRlc3QoIGNvbXB1dGVkICkgP1xuXHRcdFx0XHRcdGpRdWVyeSggZWxlbSApLnBvc2l0aW9uKClbIHByb3AgXSArIFwicHhcIiA6XG5cdFx0XHRcdFx0Y29tcHV0ZWQ7XG5cdFx0XHR9XG5cdFx0fVxuXHQpO1xufSk7XG5cblxuLy8gQ3JlYXRlIGlubmVySGVpZ2h0LCBpbm5lcldpZHRoLCBoZWlnaHQsIHdpZHRoLCBvdXRlckhlaWdodCBhbmQgb3V0ZXJXaWR0aCBtZXRob2RzXG5qUXVlcnkuZWFjaCggeyBIZWlnaHQ6IFwiaGVpZ2h0XCIsIFdpZHRoOiBcIndpZHRoXCIgfSwgZnVuY3Rpb24oIG5hbWUsIHR5cGUgKSB7XG5cdGpRdWVyeS5lYWNoKCB7IHBhZGRpbmc6IFwiaW5uZXJcIiArIG5hbWUsIGNvbnRlbnQ6IHR5cGUsIFwiXCI6IFwib3V0ZXJcIiArIG5hbWUgfSwgZnVuY3Rpb24oIGRlZmF1bHRFeHRyYSwgZnVuY05hbWUgKSB7XG5cdFx0Ly8gbWFyZ2luIGlzIG9ubHkgZm9yIG91dGVySGVpZ2h0LCBvdXRlcldpZHRoXG5cdFx0alF1ZXJ5LmZuWyBmdW5jTmFtZSBdID0gZnVuY3Rpb24oIG1hcmdpbiwgdmFsdWUgKSB7XG5cdFx0XHR2YXIgY2hhaW5hYmxlID0gYXJndW1lbnRzLmxlbmd0aCAmJiAoIGRlZmF1bHRFeHRyYSB8fCB0eXBlb2YgbWFyZ2luICE9PSBcImJvb2xlYW5cIiApLFxuXHRcdFx0XHRleHRyYSA9IGRlZmF1bHRFeHRyYSB8fCAoIG1hcmdpbiA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gdHJ1ZSA/IFwibWFyZ2luXCIgOiBcImJvcmRlclwiICk7XG5cblx0XHRcdHJldHVybiBhY2Nlc3MoIHRoaXMsIGZ1bmN0aW9uKCBlbGVtLCB0eXBlLCB2YWx1ZSApIHtcblx0XHRcdFx0dmFyIGRvYztcblxuXHRcdFx0XHRpZiAoIGpRdWVyeS5pc1dpbmRvdyggZWxlbSApICkge1xuXHRcdFx0XHRcdC8vIEFzIG9mIDUvOC8yMDEyIHRoaXMgd2lsbCB5aWVsZCBpbmNvcnJlY3QgcmVzdWx0cyBmb3IgTW9iaWxlIFNhZmFyaSwgYnV0IHRoZXJlXG5cdFx0XHRcdFx0Ly8gaXNuJ3QgYSB3aG9sZSBsb3Qgd2UgY2FuIGRvLiBTZWUgcHVsbCByZXF1ZXN0IGF0IHRoaXMgVVJMIGZvciBkaXNjdXNzaW9uOlxuXHRcdFx0XHRcdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9qcXVlcnkvanF1ZXJ5L3B1bGwvNzY0XG5cdFx0XHRcdFx0cmV0dXJuIGVsZW0uZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50WyBcImNsaWVudFwiICsgbmFtZSBdO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gR2V0IGRvY3VtZW50IHdpZHRoIG9yIGhlaWdodFxuXHRcdFx0XHRpZiAoIGVsZW0ubm9kZVR5cGUgPT09IDkgKSB7XG5cdFx0XHRcdFx0ZG9jID0gZWxlbS5kb2N1bWVudEVsZW1lbnQ7XG5cblx0XHRcdFx0XHQvLyBFaXRoZXIgc2Nyb2xsW1dpZHRoL0hlaWdodF0gb3Igb2Zmc2V0W1dpZHRoL0hlaWdodF0gb3IgY2xpZW50W1dpZHRoL0hlaWdodF0sXG5cdFx0XHRcdFx0Ly8gd2hpY2hldmVyIGlzIGdyZWF0ZXN0XG5cdFx0XHRcdFx0cmV0dXJuIE1hdGgubWF4KFxuXHRcdFx0XHRcdFx0ZWxlbS5ib2R5WyBcInNjcm9sbFwiICsgbmFtZSBdLCBkb2NbIFwic2Nyb2xsXCIgKyBuYW1lIF0sXG5cdFx0XHRcdFx0XHRlbGVtLmJvZHlbIFwib2Zmc2V0XCIgKyBuYW1lIF0sIGRvY1sgXCJvZmZzZXRcIiArIG5hbWUgXSxcblx0XHRcdFx0XHRcdGRvY1sgXCJjbGllbnRcIiArIG5hbWUgXVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCA/XG5cdFx0XHRcdFx0Ly8gR2V0IHdpZHRoIG9yIGhlaWdodCBvbiB0aGUgZWxlbWVudCwgcmVxdWVzdGluZyBidXQgbm90IGZvcmNpbmcgcGFyc2VGbG9hdFxuXHRcdFx0XHRcdGpRdWVyeS5jc3MoIGVsZW0sIHR5cGUsIGV4dHJhICkgOlxuXG5cdFx0XHRcdFx0Ly8gU2V0IHdpZHRoIG9yIGhlaWdodCBvbiB0aGUgZWxlbWVudFxuXHRcdFx0XHRcdGpRdWVyeS5zdHlsZSggZWxlbSwgdHlwZSwgdmFsdWUsIGV4dHJhICk7XG5cdFx0XHR9LCB0eXBlLCBjaGFpbmFibGUgPyBtYXJnaW4gOiB1bmRlZmluZWQsIGNoYWluYWJsZSwgbnVsbCApO1xuXHRcdH07XG5cdH0pO1xufSk7XG5cblxuLy8gVGhlIG51bWJlciBvZiBlbGVtZW50cyBjb250YWluZWQgaW4gdGhlIG1hdGNoZWQgZWxlbWVudCBzZXRcbmpRdWVyeS5mbi5zaXplID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLmxlbmd0aDtcbn07XG5cbmpRdWVyeS5mbi5hbmRTZWxmID0galF1ZXJ5LmZuLmFkZEJhY2s7XG5cblxuXG5cbi8vIFJlZ2lzdGVyIGFzIGEgbmFtZWQgQU1EIG1vZHVsZSwgc2luY2UgalF1ZXJ5IGNhbiBiZSBjb25jYXRlbmF0ZWQgd2l0aCBvdGhlclxuLy8gZmlsZXMgdGhhdCBtYXkgdXNlIGRlZmluZSwgYnV0IG5vdCB2aWEgYSBwcm9wZXIgY29uY2F0ZW5hdGlvbiBzY3JpcHQgdGhhdFxuLy8gdW5kZXJzdGFuZHMgYW5vbnltb3VzIEFNRCBtb2R1bGVzLiBBIG5hbWVkIEFNRCBpcyBzYWZlc3QgYW5kIG1vc3Qgcm9idXN0XG4vLyB3YXkgdG8gcmVnaXN0ZXIuIExvd2VyY2FzZSBqcXVlcnkgaXMgdXNlZCBiZWNhdXNlIEFNRCBtb2R1bGUgbmFtZXMgYXJlXG4vLyBkZXJpdmVkIGZyb20gZmlsZSBuYW1lcywgYW5kIGpRdWVyeSBpcyBub3JtYWxseSBkZWxpdmVyZWQgaW4gYSBsb3dlcmNhc2Vcbi8vIGZpbGUgbmFtZS4gRG8gdGhpcyBhZnRlciBjcmVhdGluZyB0aGUgZ2xvYmFsIHNvIHRoYXQgaWYgYW4gQU1EIG1vZHVsZSB3YW50c1xuLy8gdG8gY2FsbCBub0NvbmZsaWN0IHRvIGhpZGUgdGhpcyB2ZXJzaW9uIG9mIGpRdWVyeSwgaXQgd2lsbCB3b3JrLlxuaWYgKCB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCApIHtcblx0ZGVmaW5lKCBcImpxdWVyeVwiLCBbXSwgZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIGpRdWVyeTtcblx0fSk7XG59XG5cblxuXG5cbnZhclxuXHQvLyBNYXAgb3ZlciBqUXVlcnkgaW4gY2FzZSBvZiBvdmVyd3JpdGVcblx0X2pRdWVyeSA9IHdpbmRvdy5qUXVlcnksXG5cblx0Ly8gTWFwIG92ZXIgdGhlICQgaW4gY2FzZSBvZiBvdmVyd3JpdGVcblx0XyQgPSB3aW5kb3cuJDtcblxualF1ZXJ5Lm5vQ29uZmxpY3QgPSBmdW5jdGlvbiggZGVlcCApIHtcblx0aWYgKCB3aW5kb3cuJCA9PT0galF1ZXJ5ICkge1xuXHRcdHdpbmRvdy4kID0gXyQ7XG5cdH1cblxuXHRpZiAoIGRlZXAgJiYgd2luZG93LmpRdWVyeSA9PT0galF1ZXJ5ICkge1xuXHRcdHdpbmRvdy5qUXVlcnkgPSBfalF1ZXJ5O1xuXHR9XG5cblx0cmV0dXJuIGpRdWVyeTtcbn07XG5cbi8vIEV4cG9zZSBqUXVlcnkgYW5kICQgaWRlbnRpZmllcnMsIGV2ZW4gaW5cbi8vIEFNRCAoIzcxMDIjY29tbWVudDoxMCwgaHR0cHM6Ly9naXRodWIuY29tL2pxdWVyeS9qcXVlcnkvcHVsbC81NTcpXG4vLyBhbmQgQ29tbW9uSlMgZm9yIGJyb3dzZXIgZW11bGF0b3JzICgjMTM1NjYpXG5pZiAoIHR5cGVvZiBub0dsb2JhbCA9PT0gc3RydW5kZWZpbmVkICkge1xuXHR3aW5kb3cualF1ZXJ5ID0gd2luZG93LiQgPSBqUXVlcnk7XG59XG5cblxuXG5cbnJldHVybiBqUXVlcnk7XG5cbn0pKTtcbiJdLCJuYW1lcyI6WyJnbG9iYWwiLCJmYWN0b3J5IiwibW9kdWxlIiwiZXhwb3J0cyIsImRvY3VtZW50IiwidyIsIkVycm9yIiwid2luZG93Iiwibm9HbG9iYWwiLCJhcnIiLCJzbGljZSIsImNvbmNhdCIsInB1c2giLCJpbmRleE9mIiwiY2xhc3MydHlwZSIsInRvU3RyaW5nIiwiaGFzT3duIiwiaGFzT3duUHJvcGVydHkiLCJ0cmltIiwic3VwcG9ydCIsInZlcnNpb24iLCJqUXVlcnkiLCJzZWxlY3RvciIsImNvbnRleHQiLCJmbiIsImluaXQiLCJybXNQcmVmaXgiLCJyZGFzaEFscGhhIiwiZmNhbWVsQ2FzZSIsImFsbCIsImxldHRlciIsInRvVXBwZXJDYXNlIiwicHJvdG90eXBlIiwianF1ZXJ5IiwiY29uc3RydWN0b3IiLCJsZW5ndGgiLCJ0b0FycmF5IiwiY2FsbCIsImdldCIsIm51bSIsInB1c2hTdGFjayIsImVsZW1zIiwicmV0IiwibWVyZ2UiLCJwcmV2T2JqZWN0IiwiZWFjaCIsImNhbGxiYWNrIiwiYXJncyIsIm1hcCIsImVsZW0iLCJpIiwiYXBwbHkiLCJhcmd1bWVudHMiLCJmaXJzdCIsImVxIiwibGFzdCIsImxlbiIsImoiLCJlbmQiLCJzb3J0Iiwic3BsaWNlIiwiZXh0ZW5kIiwib3B0aW9ucyIsIm5hbWUiLCJzcmMiLCJjb3B5IiwiY29weUlzQXJyYXkiLCJjbG9uZSIsInRhcmdldCIsImRlZXAiLCJpc0Z1bmN0aW9uIiwiaXNQbGFpbk9iamVjdCIsImlzQXJyYXkiLCJ1bmRlZmluZWQiLCJleHBhbmRvIiwiTWF0aCIsInJhbmRvbSIsInJlcGxhY2UiLCJpc1JlYWR5IiwiZXJyb3IiLCJtc2ciLCJub29wIiwib2JqIiwidHlwZSIsIkFycmF5IiwiaXNXaW5kb3ciLCJpc051bWVyaWMiLCJwYXJzZUZsb2F0Iiwibm9kZVR5cGUiLCJlIiwiaXNFbXB0eU9iamVjdCIsImdsb2JhbEV2YWwiLCJjb2RlIiwic2NyaXB0IiwiaW5kaXJlY3QiLCJldmFsIiwiY3JlYXRlRWxlbWVudCIsInRleHQiLCJoZWFkIiwiYXBwZW5kQ2hpbGQiLCJwYXJlbnROb2RlIiwicmVtb3ZlQ2hpbGQiLCJjYW1lbENhc2UiLCJzdHJpbmciLCJub2RlTmFtZSIsInRvTG93ZXJDYXNlIiwidmFsdWUiLCJpc0FycmF5bGlrZSIsIm1ha2VBcnJheSIsInJlc3VsdHMiLCJPYmplY3QiLCJpbkFycmF5Iiwic2Vjb25kIiwiZ3JlcCIsImludmVydCIsImNhbGxiYWNrSW52ZXJzZSIsIm1hdGNoZXMiLCJjYWxsYmFja0V4cGVjdCIsImFyZyIsImd1aWQiLCJwcm94eSIsInRtcCIsIm5vdyIsIkRhdGUiLCJzcGxpdCIsIlNpenpsZSIsIkV4cHIiLCJnZXRUZXh0IiwiaXNYTUwiLCJjb21waWxlIiwib3V0ZXJtb3N0Q29udGV4dCIsInNvcnRJbnB1dCIsImhhc0R1cGxpY2F0ZSIsInNldERvY3VtZW50IiwiZG9jRWxlbSIsImRvY3VtZW50SXNIVE1MIiwicmJ1Z2d5UVNBIiwicmJ1Z2d5TWF0Y2hlcyIsImNvbnRhaW5zIiwicHJlZmVycmVkRG9jIiwiZGlycnVucyIsImRvbmUiLCJjbGFzc0NhY2hlIiwiY3JlYXRlQ2FjaGUiLCJ0b2tlbkNhY2hlIiwiY29tcGlsZXJDYWNoZSIsInNvcnRPcmRlciIsImEiLCJiIiwic3RydW5kZWZpbmVkIiwiTUFYX05FR0FUSVZFIiwicG9wIiwicHVzaF9uYXRpdmUiLCJib29sZWFucyIsIndoaXRlc3BhY2UiLCJjaGFyYWN0ZXJFbmNvZGluZyIsImlkZW50aWZpZXIiLCJhdHRyaWJ1dGVzIiwicHNldWRvcyIsInJ0cmltIiwiUmVnRXhwIiwicmNvbW1hIiwicmNvbWJpbmF0b3JzIiwicmF0dHJpYnV0ZVF1b3RlcyIsInJwc2V1ZG8iLCJyaWRlbnRpZmllciIsIm1hdGNoRXhwciIsInJpbnB1dHMiLCJyaGVhZGVyIiwicm5hdGl2ZSIsInJxdWlja0V4cHIiLCJyc2libGluZyIsInJlc2NhcGUiLCJydW5lc2NhcGUiLCJmdW5lc2NhcGUiLCJfIiwiZXNjYXBlZCIsImVzY2FwZWRXaGl0ZXNwYWNlIiwiaGlnaCIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsImNoaWxkTm9kZXMiLCJlbHMiLCJzZWVkIiwibWF0Y2giLCJtIiwiZ3JvdXBzIiwib2xkIiwibmlkIiwibmV3Q29udGV4dCIsIm5ld1NlbGVjdG9yIiwib3duZXJEb2N1bWVudCIsImV4ZWMiLCJnZXRFbGVtZW50QnlJZCIsImlkIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwicXNhIiwidGVzdCIsInRva2VuaXplIiwiZ2V0QXR0cmlidXRlIiwic2V0QXR0cmlidXRlIiwidG9TZWxlY3RvciIsInRlc3RDb250ZXh0Iiwiam9pbiIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJxc2FFcnJvciIsInJlbW92ZUF0dHJpYnV0ZSIsInNlbGVjdCIsImtleXMiLCJjYWNoZSIsImtleSIsImNhY2hlTGVuZ3RoIiwic2hpZnQiLCJtYXJrRnVuY3Rpb24iLCJhc3NlcnQiLCJkaXYiLCJhZGRIYW5kbGUiLCJhdHRycyIsImhhbmRsZXIiLCJhdHRySGFuZGxlIiwic2libGluZ0NoZWNrIiwiY3VyIiwiZGlmZiIsInNvdXJjZUluZGV4IiwibmV4dFNpYmxpbmciLCJjcmVhdGVJbnB1dFBzZXVkbyIsImNyZWF0ZUJ1dHRvblBzZXVkbyIsImNyZWF0ZVBvc2l0aW9uYWxQc2V1ZG8iLCJhcmd1bWVudCIsIm1hdGNoSW5kZXhlcyIsImRvY3VtZW50RWxlbWVudCIsIm5vZGUiLCJoYXNDb21wYXJlIiwiZG9jIiwicGFyZW50IiwiZGVmYXVsdFZpZXciLCJ0b3AiLCJhZGRFdmVudExpc3RlbmVyIiwiYXR0YWNoRXZlbnQiLCJjbGFzc05hbWUiLCJjcmVhdGVDb21tZW50IiwiaW5uZXJIVE1MIiwiZmlyc3RDaGlsZCIsImdldEJ5SWQiLCJnZXRFbGVtZW50c0J5TmFtZSIsImZpbmQiLCJmaWx0ZXIiLCJhdHRySWQiLCJnZXRBdHRyaWJ1dGVOb2RlIiwidGFnIiwiaW5wdXQiLCJtYXRjaGVzU2VsZWN0b3IiLCJ3ZWJraXRNYXRjaGVzU2VsZWN0b3IiLCJtb3pNYXRjaGVzU2VsZWN0b3IiLCJvTWF0Y2hlc1NlbGVjdG9yIiwibXNNYXRjaGVzU2VsZWN0b3IiLCJkaXNjb25uZWN0ZWRNYXRjaCIsImNvbXBhcmVEb2N1bWVudFBvc2l0aW9uIiwiYWRvd24iLCJidXAiLCJjb21wYXJlIiwic29ydERldGFjaGVkIiwiYXVwIiwiYXAiLCJicCIsInVuc2hpZnQiLCJleHByIiwiZWxlbWVudHMiLCJhdHRyIiwidmFsIiwic3BlY2lmaWVkIiwidW5pcXVlU29ydCIsImR1cGxpY2F0ZXMiLCJkZXRlY3REdXBsaWNhdGVzIiwic29ydFN0YWJsZSIsInRleHRDb250ZW50Iiwibm9kZVZhbHVlIiwic2VsZWN0b3JzIiwiY3JlYXRlUHNldWRvIiwicmVsYXRpdmUiLCJkaXIiLCJwcmVGaWx0ZXIiLCJleGNlc3MiLCJ1bnF1b3RlZCIsIm5vZGVOYW1lU2VsZWN0b3IiLCJwYXR0ZXJuIiwib3BlcmF0b3IiLCJjaGVjayIsInJlc3VsdCIsIndoYXQiLCJzaW1wbGUiLCJmb3J3YXJkIiwib2ZUeXBlIiwieG1sIiwib3V0ZXJDYWNoZSIsIm5vZGVJbmRleCIsInN0YXJ0IiwidXNlQ2FjaGUiLCJsYXN0Q2hpbGQiLCJwc2V1ZG8iLCJzZXRGaWx0ZXJzIiwiaWR4IiwibWF0Y2hlZCIsIm1hdGNoZXIiLCJ1bm1hdGNoZWQiLCJpbm5lclRleHQiLCJsYW5nIiwiZWxlbUxhbmciLCJoYXNoIiwibG9jYXRpb24iLCJhY3RpdmVFbGVtZW50IiwiaGFzRm9jdXMiLCJocmVmIiwidGFiSW5kZXgiLCJkaXNhYmxlZCIsImNoZWNrZWQiLCJzZWxlY3RlZCIsInNlbGVjdGVkSW5kZXgiLCJyYWRpbyIsImNoZWNrYm94IiwiZmlsZSIsInBhc3N3b3JkIiwiaW1hZ2UiLCJzdWJtaXQiLCJyZXNldCIsImZpbHRlcnMiLCJwYXJzZU9ubHkiLCJ0b2tlbnMiLCJzb0ZhciIsInByZUZpbHRlcnMiLCJjYWNoZWQiLCJhZGRDb21iaW5hdG9yIiwiY29tYmluYXRvciIsImJhc2UiLCJjaGVja05vbkVsZW1lbnRzIiwiZG9uZU5hbWUiLCJvbGRDYWNoZSIsIm5ld0NhY2hlIiwiZWxlbWVudE1hdGNoZXIiLCJtYXRjaGVycyIsImNvbmRlbnNlIiwibmV3VW5tYXRjaGVkIiwibWFwcGVkIiwic2V0TWF0Y2hlciIsInBvc3RGaWx0ZXIiLCJwb3N0RmluZGVyIiwicG9zdFNlbGVjdG9yIiwidGVtcCIsInByZU1hcCIsInBvc3RNYXAiLCJwcmVleGlzdGluZyIsIm11bHRpcGxlQ29udGV4dHMiLCJtYXRjaGVySW4iLCJtYXRjaGVyT3V0IiwibWF0Y2hlckZyb21Ub2tlbnMiLCJjaGVja0NvbnRleHQiLCJsZWFkaW5nUmVsYXRpdmUiLCJpbXBsaWNpdFJlbGF0aXZlIiwibWF0Y2hDb250ZXh0IiwibWF0Y2hBbnlDb250ZXh0IiwibWF0Y2hlckZyb21Hcm91cE1hdGNoZXJzIiwiZWxlbWVudE1hdGNoZXJzIiwic2V0TWF0Y2hlcnMiLCJieVNldCIsImJ5RWxlbWVudCIsInN1cGVyTWF0Y2hlciIsIm91dGVybW9zdCIsIm1hdGNoZWRDb3VudCIsInNldE1hdGNoZWQiLCJjb250ZXh0QmFja3VwIiwiZGlycnVuc1VuaXF1ZSIsImdyb3VwIiwiY29udGV4dHMiLCJ0b2tlbiIsImRpdjEiLCJkZWZhdWx0VmFsdWUiLCJ1bmlxdWUiLCJpc1hNTERvYyIsInJuZWVkc0NvbnRleHQiLCJuZWVkc0NvbnRleHQiLCJyc2luZ2xlVGFnIiwicmlzU2ltcGxlIiwid2lubm93IiwicXVhbGlmaWVyIiwibm90Iiwic2VsZiIsImlzIiwicm9vdGpRdWVyeSIsInBhcnNlSFRNTCIsInJlYWR5IiwicnBhcmVudHNwcmV2IiwiZ3VhcmFudGVlZFVuaXF1ZSIsImNoaWxkcmVuIiwiY29udGVudHMiLCJuZXh0IiwicHJldiIsInVudGlsIiwidHJ1bmNhdGUiLCJzaWJsaW5nIiwibiIsImhhcyIsInRhcmdldHMiLCJsIiwiY2xvc2VzdCIsInBvcyIsImluZGV4IiwicHJldkFsbCIsImFkZCIsImFkZEJhY2siLCJwYXJlbnRzIiwicGFyZW50c1VudGlsIiwibmV4dEFsbCIsIm5leHRVbnRpbCIsInByZXZVbnRpbCIsInNpYmxpbmdzIiwiY29udGVudERvY3VtZW50IiwicmV2ZXJzZSIsInJub3R3aGl0ZSIsIm9wdGlvbnNDYWNoZSIsImNyZWF0ZU9wdGlvbnMiLCJvYmplY3QiLCJmbGFnIiwiQ2FsbGJhY2tzIiwibWVtb3J5IiwiZmlyZWQiLCJmaXJpbmciLCJmaXJpbmdTdGFydCIsImZpcmluZ0xlbmd0aCIsImZpcmluZ0luZGV4IiwibGlzdCIsInN0YWNrIiwib25jZSIsImZpcmUiLCJkYXRhIiwic3RvcE9uRmFsc2UiLCJkaXNhYmxlIiwicmVtb3ZlIiwiZW1wdHkiLCJsb2NrIiwibG9ja2VkIiwiZmlyZVdpdGgiLCJEZWZlcnJlZCIsImZ1bmMiLCJ0dXBsZXMiLCJzdGF0ZSIsInByb21pc2UiLCJhbHdheXMiLCJkZWZlcnJlZCIsImZhaWwiLCJ0aGVuIiwiZm5zIiwibmV3RGVmZXIiLCJ0dXBsZSIsInJldHVybmVkIiwicmVzb2x2ZSIsInJlamVjdCIsInByb2dyZXNzIiwibm90aWZ5IiwicGlwZSIsInN0YXRlU3RyaW5nIiwid2hlbiIsInN1Ym9yZGluYXRlIiwicmVzb2x2ZVZhbHVlcyIsInJlbWFpbmluZyIsInVwZGF0ZUZ1bmMiLCJ2YWx1ZXMiLCJwcm9ncmVzc1ZhbHVlcyIsIm5vdGlmeVdpdGgiLCJyZXNvbHZlV2l0aCIsInByb2dyZXNzQ29udGV4dHMiLCJyZXNvbHZlQ29udGV4dHMiLCJyZWFkeUxpc3QiLCJyZWFkeVdhaXQiLCJob2xkUmVhZHkiLCJob2xkIiwid2FpdCIsInRyaWdnZXIiLCJvZmYiLCJjb21wbGV0ZWQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicmVhZHlTdGF0ZSIsInNldFRpbWVvdXQiLCJhY2Nlc3MiLCJjaGFpbmFibGUiLCJlbXB0eUdldCIsInJhdyIsImJ1bGsiLCJhY2NlcHREYXRhIiwib3duZXIiLCJEYXRhIiwiZGVmaW5lUHJvcGVydHkiLCJ1aWQiLCJhY2NlcHRzIiwiZGVzY3JpcHRvciIsInVubG9jayIsImRlZmluZVByb3BlcnRpZXMiLCJzZXQiLCJwcm9wIiwic3RvcmVkIiwiY2FtZWwiLCJoYXNEYXRhIiwiZGlzY2FyZCIsImRhdGFfcHJpdiIsImRhdGFfdXNlciIsInJicmFjZSIsInJtdWx0aURhc2giLCJkYXRhQXR0ciIsInBhcnNlSlNPTiIsInJlbW92ZURhdGEiLCJfZGF0YSIsIl9yZW1vdmVEYXRhIiwiY2FtZWxLZXkiLCJxdWV1ZSIsImRlcXVldWUiLCJzdGFydExlbmd0aCIsImhvb2tzIiwiX3F1ZXVlSG9va3MiLCJzdG9wIiwic2V0dGVyIiwiY2xlYXJRdWV1ZSIsImNvdW50IiwiZGVmZXIiLCJwbnVtIiwic291cmNlIiwiY3NzRXhwYW5kIiwiaXNIaWRkZW4iLCJlbCIsImNzcyIsInJjaGVja2FibGVUeXBlIiwiZnJhZ21lbnQiLCJjcmVhdGVEb2N1bWVudEZyYWdtZW50IiwiY2hlY2tDbG9uZSIsImNsb25lTm9kZSIsIm5vQ2xvbmVDaGVja2VkIiwiZm9jdXNpbkJ1YmJsZXMiLCJya2V5RXZlbnQiLCJybW91c2VFdmVudCIsInJmb2N1c01vcnBoIiwicnR5cGVuYW1lc3BhY2UiLCJyZXR1cm5UcnVlIiwicmV0dXJuRmFsc2UiLCJzYWZlQWN0aXZlRWxlbWVudCIsImVyciIsImV2ZW50IiwidHlwZXMiLCJoYW5kbGVPYmpJbiIsImV2ZW50SGFuZGxlIiwiZXZlbnRzIiwidCIsImhhbmRsZU9iaiIsInNwZWNpYWwiLCJoYW5kbGVycyIsIm5hbWVzcGFjZXMiLCJvcmlnVHlwZSIsImVsZW1EYXRhIiwiaGFuZGxlIiwidHJpZ2dlcmVkIiwiZGlzcGF0Y2giLCJkZWxlZ2F0ZVR5cGUiLCJiaW5kVHlwZSIsIm5hbWVzcGFjZSIsImRlbGVnYXRlQ291bnQiLCJzZXR1cCIsIm1hcHBlZFR5cGVzIiwib3JpZ0NvdW50IiwidGVhcmRvd24iLCJyZW1vdmVFdmVudCIsIm9ubHlIYW5kbGVycyIsImJ1YmJsZVR5cGUiLCJvbnR5cGUiLCJldmVudFBhdGgiLCJFdmVudCIsImlzVHJpZ2dlciIsIm5hbWVzcGFjZV9yZSIsIm5vQnViYmxlIiwicGFyZW50V2luZG93IiwiaXNQcm9wYWdhdGlvblN0b3BwZWQiLCJwcmV2ZW50RGVmYXVsdCIsImlzRGVmYXVsdFByZXZlbnRlZCIsIl9kZWZhdWx0IiwiZml4IiwiaGFuZGxlclF1ZXVlIiwiZGVsZWdhdGVUYXJnZXQiLCJwcmVEaXNwYXRjaCIsImN1cnJlbnRUYXJnZXQiLCJpc0ltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZCIsInN0b3BQcm9wYWdhdGlvbiIsInBvc3REaXNwYXRjaCIsInNlbCIsImJ1dHRvbiIsInByb3BzIiwiZml4SG9va3MiLCJrZXlIb29rcyIsIm9yaWdpbmFsIiwid2hpY2giLCJjaGFyQ29kZSIsImtleUNvZGUiLCJtb3VzZUhvb2tzIiwiZXZlbnREb2MiLCJib2R5IiwicGFnZVgiLCJjbGllbnRYIiwic2Nyb2xsTGVmdCIsImNsaWVudExlZnQiLCJwYWdlWSIsImNsaWVudFkiLCJzY3JvbGxUb3AiLCJjbGllbnRUb3AiLCJvcmlnaW5hbEV2ZW50IiwiZml4SG9vayIsImxvYWQiLCJmb2N1cyIsImJsdXIiLCJjbGljayIsImJlZm9yZXVubG9hZCIsInJldHVyblZhbHVlIiwic2ltdWxhdGUiLCJidWJibGUiLCJpc1NpbXVsYXRlZCIsImRlZmF1bHRQcmV2ZW50ZWQiLCJnZXRQcmV2ZW50RGVmYXVsdCIsInRpbWVTdGFtcCIsInN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbiIsIm1vdXNlZW50ZXIiLCJtb3VzZWxlYXZlIiwib3JpZyIsInJlbGF0ZWQiLCJyZWxhdGVkVGFyZ2V0IiwiYXR0YWNoZXMiLCJvbiIsIm9uZSIsIm9yaWdGbiIsInRyaWdnZXJIYW5kbGVyIiwicnhodG1sVGFnIiwicnRhZ05hbWUiLCJyaHRtbCIsInJub0lubmVyaHRtbCIsInJjaGVja2VkIiwicnNjcmlwdFR5cGUiLCJyc2NyaXB0VHlwZU1hc2tlZCIsInJjbGVhblNjcmlwdCIsIndyYXBNYXAiLCJvcHRpb24iLCJ0aGVhZCIsImNvbCIsInRyIiwidGQiLCJvcHRncm91cCIsInRib2R5IiwidGZvb3QiLCJjb2xncm91cCIsImNhcHRpb24iLCJ0aCIsIm1hbmlwdWxhdGlvblRhcmdldCIsImNvbnRlbnQiLCJkaXNhYmxlU2NyaXB0IiwicmVzdG9yZVNjcmlwdCIsInNldEdsb2JhbEV2YWwiLCJyZWZFbGVtZW50cyIsImNsb25lQ29weUV2ZW50IiwiZGVzdCIsInBkYXRhT2xkIiwicGRhdGFDdXIiLCJ1ZGF0YU9sZCIsInVkYXRhQ3VyIiwiZ2V0QWxsIiwiZml4SW5wdXQiLCJkYXRhQW5kRXZlbnRzIiwiZGVlcERhdGFBbmRFdmVudHMiLCJzcmNFbGVtZW50cyIsImRlc3RFbGVtZW50cyIsImluUGFnZSIsImJ1aWxkRnJhZ21lbnQiLCJzY3JpcHRzIiwic2VsZWN0aW9uIiwid3JhcCIsIm5vZGVzIiwiY3JlYXRlVGV4dE5vZGUiLCJjbGVhbkRhdGEiLCJhcHBlbmQiLCJkb21NYW5pcCIsInByZXBlbmQiLCJpbnNlcnRCZWZvcmUiLCJiZWZvcmUiLCJhZnRlciIsImtlZXBEYXRhIiwiaHRtbCIsInJlcGxhY2VXaXRoIiwicmVwbGFjZUNoaWxkIiwiZGV0YWNoIiwiaGFzU2NyaXB0cyIsImlOb0Nsb25lIiwiX2V2YWxVcmwiLCJhcHBlbmRUbyIsInByZXBlbmRUbyIsImluc2VydEFmdGVyIiwicmVwbGFjZUFsbCIsImluc2VydCIsImlmcmFtZSIsImVsZW1kaXNwbGF5IiwiYWN0dWFsRGlzcGxheSIsImRpc3BsYXkiLCJnZXREZWZhdWx0Q29tcHV0ZWRTdHlsZSIsImRlZmF1bHREaXNwbGF5Iiwid3JpdGUiLCJjbG9zZSIsInJtYXJnaW4iLCJybnVtbm9ucHgiLCJnZXRTdHlsZXMiLCJnZXRDb21wdXRlZFN0eWxlIiwiY3VyQ1NTIiwiY29tcHV0ZWQiLCJ3aWR0aCIsIm1pbldpZHRoIiwibWF4V2lkdGgiLCJzdHlsZSIsImdldFByb3BlcnR5VmFsdWUiLCJhZGRHZXRIb29rSWYiLCJjb25kaXRpb25GbiIsImhvb2tGbiIsInBpeGVsUG9zaXRpb25WYWwiLCJib3hTaXppbmdSZWxpYWJsZVZhbCIsImRpdlJlc2V0IiwiY29udGFpbmVyIiwiYmFja2dyb3VuZENsaXAiLCJjbGVhckNsb25lU3R5bGUiLCJjc3NUZXh0IiwiY29tcHV0ZVBpeGVsUG9zaXRpb25BbmRCb3hTaXppbmdSZWxpYWJsZSIsImRpdlN0eWxlIiwicGl4ZWxQb3NpdGlvbiIsImJveFNpemluZ1JlbGlhYmxlIiwicmVsaWFibGVNYXJnaW5SaWdodCIsIm1hcmdpbkRpdiIsIm1hcmdpblJpZ2h0Iiwic3dhcCIsInJkaXNwbGF5c3dhcCIsInJudW1zcGxpdCIsInJyZWxOdW0iLCJjc3NTaG93IiwicG9zaXRpb24iLCJ2aXNpYmlsaXR5IiwiY3NzTm9ybWFsVHJhbnNmb3JtIiwibGV0dGVyU3BhY2luZyIsImZvbnRXZWlnaHQiLCJjc3NQcmVmaXhlcyIsInZlbmRvclByb3BOYW1lIiwiY2FwTmFtZSIsIm9yaWdOYW1lIiwic2V0UG9zaXRpdmVOdW1iZXIiLCJzdWJ0cmFjdCIsIm1heCIsImF1Z21lbnRXaWR0aE9ySGVpZ2h0IiwiZXh0cmEiLCJpc0JvcmRlckJveCIsInN0eWxlcyIsImdldFdpZHRoT3JIZWlnaHQiLCJ2YWx1ZUlzQm9yZGVyQm94Iiwib2Zmc2V0V2lkdGgiLCJvZmZzZXRIZWlnaHQiLCJzaG93SGlkZSIsInNob3ciLCJoaWRkZW4iLCJjc3NIb29rcyIsIm9wYWNpdHkiLCJjc3NOdW1iZXIiLCJjc3NQcm9wcyIsIm1hcmdpbiIsInBhZGRpbmciLCJib3JkZXIiLCJwcmVmaXgiLCJzdWZmaXgiLCJleHBhbmQiLCJleHBhbmRlZCIsInBhcnRzIiwiaGlkZSIsInRvZ2dsZSIsIlR3ZWVuIiwiZWFzaW5nIiwidW5pdCIsInByb3BIb29rcyIsInJ1biIsInBlcmNlbnQiLCJlYXNlZCIsImR1cmF0aW9uIiwic3RlcCIsInR3ZWVuIiwiZngiLCJsaW5lYXIiLCJwIiwic3dpbmciLCJjb3MiLCJQSSIsImZ4Tm93IiwidGltZXJJZCIsInJmeHR5cGVzIiwicmZ4bnVtIiwicnJ1biIsImFuaW1hdGlvblByZWZpbHRlcnMiLCJkZWZhdWx0UHJlZmlsdGVyIiwidHdlZW5lcnMiLCJjcmVhdGVUd2VlbiIsInNjYWxlIiwibWF4SXRlcmF0aW9ucyIsImNyZWF0ZUZ4Tm93IiwiZ2VuRngiLCJpbmNsdWRlV2lkdGgiLCJoZWlnaHQiLCJhbmltYXRpb24iLCJjb2xsZWN0aW9uIiwib3B0cyIsIm9sZGZpcmUiLCJhbmltIiwiZGF0YVNob3ciLCJ1bnF1ZXVlZCIsIm92ZXJmbG93Iiwib3ZlcmZsb3dYIiwib3ZlcmZsb3dZIiwicHJvcEZpbHRlciIsInNwZWNpYWxFYXNpbmciLCJBbmltYXRpb24iLCJwcm9wZXJ0aWVzIiwic3RvcHBlZCIsInRpY2siLCJjdXJyZW50VGltZSIsInN0YXJ0VGltZSIsInR3ZWVucyIsIm9yaWdpbmFsUHJvcGVydGllcyIsIm9yaWdpbmFsT3B0aW9ucyIsImdvdG9FbmQiLCJyZWplY3RXaXRoIiwidGltZXIiLCJjb21wbGV0ZSIsInR3ZWVuZXIiLCJwcmVmaWx0ZXIiLCJzcGVlZCIsIm9wdCIsInNwZWVkcyIsImZhZGVUbyIsInRvIiwiYW5pbWF0ZSIsIm9wdGFsbCIsImRvQW5pbWF0aW9uIiwiZmluaXNoIiwic3RvcFF1ZXVlIiwidGltZXJzIiwiY3NzRm4iLCJzbGlkZURvd24iLCJzbGlkZVVwIiwic2xpZGVUb2dnbGUiLCJmYWRlSW4iLCJmYWRlT3V0IiwiZmFkZVRvZ2dsZSIsImludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJjbGVhckludGVydmFsIiwic2xvdyIsImZhc3QiLCJkZWxheSIsInRpbWUiLCJ0aW1lb3V0IiwiY2xlYXJUaW1lb3V0IiwiY2hlY2tPbiIsIm9wdFNlbGVjdGVkIiwib3B0RGlzYWJsZWQiLCJyYWRpb1ZhbHVlIiwibm9kZUhvb2siLCJib29sSG9vayIsInJlbW92ZUF0dHIiLCJuVHlwZSIsImF0dHJIb29rcyIsImJvb2wiLCJwcm9wTmFtZSIsImF0dHJOYW1lcyIsInByb3BGaXgiLCJnZXR0ZXIiLCJyZm9jdXNhYmxlIiwicmVtb3ZlUHJvcCIsIm5vdHhtbCIsImhhc0F0dHJpYnV0ZSIsInJjbGFzcyIsImFkZENsYXNzIiwiY2xhc3NlcyIsImNsYXp6IiwiZmluYWxWYWx1ZSIsInByb2NlZWQiLCJyZW1vdmVDbGFzcyIsInRvZ2dsZUNsYXNzIiwic3RhdGVWYWwiLCJjbGFzc05hbWVzIiwiaGFzQ2xhc3MiLCJycmV0dXJuIiwidmFsSG9va3MiLCJvcHRpb25TZXQiLCJob3ZlciIsImZuT3ZlciIsImZuT3V0IiwiYmluZCIsInVuYmluZCIsImRlbGVnYXRlIiwidW5kZWxlZ2F0ZSIsIm5vbmNlIiwicnF1ZXJ5IiwiSlNPTiIsInBhcnNlIiwicGFyc2VYTUwiLCJET01QYXJzZXIiLCJwYXJzZUZyb21TdHJpbmciLCJhamF4TG9jUGFydHMiLCJhamF4TG9jYXRpb24iLCJyaGFzaCIsInJ0cyIsInJoZWFkZXJzIiwicmxvY2FsUHJvdG9jb2wiLCJybm9Db250ZW50IiwicnByb3RvY29sIiwicnVybCIsInByZWZpbHRlcnMiLCJ0cmFuc3BvcnRzIiwiYWxsVHlwZXMiLCJhZGRUb1ByZWZpbHRlcnNPclRyYW5zcG9ydHMiLCJzdHJ1Y3R1cmUiLCJkYXRhVHlwZUV4cHJlc3Npb24iLCJkYXRhVHlwZSIsImRhdGFUeXBlcyIsImluc3BlY3RQcmVmaWx0ZXJzT3JUcmFuc3BvcnRzIiwianFYSFIiLCJpbnNwZWN0ZWQiLCJzZWVraW5nVHJhbnNwb3J0IiwiaW5zcGVjdCIsInByZWZpbHRlck9yRmFjdG9yeSIsImRhdGFUeXBlT3JUcmFuc3BvcnQiLCJhamF4RXh0ZW5kIiwiZmxhdE9wdGlvbnMiLCJhamF4U2V0dGluZ3MiLCJhamF4SGFuZGxlUmVzcG9uc2VzIiwicyIsInJlc3BvbnNlcyIsImN0IiwiZmluYWxEYXRhVHlwZSIsImZpcnN0RGF0YVR5cGUiLCJtaW1lVHlwZSIsImdldFJlc3BvbnNlSGVhZGVyIiwiY29udmVydGVycyIsImFqYXhDb252ZXJ0IiwicmVzcG9uc2UiLCJpc1N1Y2Nlc3MiLCJjb252MiIsImN1cnJlbnQiLCJjb252IiwicmVzcG9uc2VGaWVsZHMiLCJkYXRhRmlsdGVyIiwiYWN0aXZlIiwibGFzdE1vZGlmaWVkIiwiZXRhZyIsInVybCIsImlzTG9jYWwiLCJwcm9jZXNzRGF0YSIsImFzeW5jIiwiY29udGVudFR5cGUiLCJqc29uIiwiYWpheFNldHVwIiwic2V0dGluZ3MiLCJhamF4UHJlZmlsdGVyIiwiYWpheFRyYW5zcG9ydCIsImFqYXgiLCJ0cmFuc3BvcnQiLCJjYWNoZVVSTCIsInJlc3BvbnNlSGVhZGVyc1N0cmluZyIsInJlc3BvbnNlSGVhZGVycyIsInRpbWVvdXRUaW1lciIsImZpcmVHbG9iYWxzIiwiY2FsbGJhY2tDb250ZXh0IiwiZ2xvYmFsRXZlbnRDb250ZXh0IiwiY29tcGxldGVEZWZlcnJlZCIsInN0YXR1c0NvZGUiLCJyZXF1ZXN0SGVhZGVycyIsInJlcXVlc3RIZWFkZXJzTmFtZXMiLCJzdHJBYm9ydCIsImdldEFsbFJlc3BvbnNlSGVhZGVycyIsInNldFJlcXVlc3RIZWFkZXIiLCJsbmFtZSIsIm92ZXJyaWRlTWltZVR5cGUiLCJzdGF0dXMiLCJhYm9ydCIsInN0YXR1c1RleHQiLCJmaW5hbFRleHQiLCJzdWNjZXNzIiwibWV0aG9kIiwiY3Jvc3NEb21haW4iLCJwYXJhbSIsInRyYWRpdGlvbmFsIiwiaGFzQ29udGVudCIsImlmTW9kaWZpZWQiLCJoZWFkZXJzIiwiYmVmb3JlU2VuZCIsInNlbmQiLCJuYXRpdmVTdGF0dXNUZXh0IiwibW9kaWZpZWQiLCJnZXRKU09OIiwiZ2V0U2NyaXB0Iiwid3JhcEFsbCIsImZpcnN0RWxlbWVudENoaWxkIiwid3JhcElubmVyIiwidW53cmFwIiwidmlzaWJsZSIsInIyMCIsInJicmFja2V0IiwickNSTEYiLCJyc3VibWl0dGVyVHlwZXMiLCJyc3VibWl0dGFibGUiLCJidWlsZFBhcmFtcyIsInYiLCJlbmNvZGVVUklDb21wb25lbnQiLCJzZXJpYWxpemUiLCJzZXJpYWxpemVBcnJheSIsInhociIsIlhNTEh0dHBSZXF1ZXN0IiwieGhySWQiLCJ4aHJDYWxsYmFja3MiLCJ4aHJTdWNjZXNzU3RhdHVzIiwieGhyU3VwcG9ydGVkIiwiQWN0aXZlWE9iamVjdCIsImNvcnMiLCJvcGVuIiwidXNlcm5hbWUiLCJ4aHJGaWVsZHMiLCJvbmxvYWQiLCJvbmVycm9yIiwicmVzcG9uc2VUZXh0IiwiY2hhcnNldCIsInNjcmlwdENoYXJzZXQiLCJldnQiLCJvbGRDYWxsYmFja3MiLCJyanNvbnAiLCJqc29ucCIsImpzb25wQ2FsbGJhY2siLCJvcmlnaW5hbFNldHRpbmdzIiwiY2FsbGJhY2tOYW1lIiwib3ZlcndyaXR0ZW4iLCJyZXNwb25zZUNvbnRhaW5lciIsImpzb25Qcm9wIiwia2VlcFNjcmlwdHMiLCJwYXJzZWQiLCJfbG9hZCIsInBhcmFtcyIsImFuaW1hdGVkIiwiZ2V0V2luZG93Iiwib2Zmc2V0Iiwic2V0T2Zmc2V0IiwiY3VyUG9zaXRpb24iLCJjdXJMZWZ0IiwiY3VyQ1NTVG9wIiwiY3VyVG9wIiwiY3VyT2Zmc2V0IiwiY3VyQ1NTTGVmdCIsImNhbGN1bGF0ZVBvc2l0aW9uIiwiY3VyRWxlbSIsImxlZnQiLCJ1c2luZyIsIndpbiIsImJveCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInBhZ2VZT2Zmc2V0IiwicGFnZVhPZmZzZXQiLCJvZmZzZXRQYXJlbnQiLCJwYXJlbnRPZmZzZXQiLCJzY3JvbGxUbyIsIkhlaWdodCIsIldpZHRoIiwiZGVmYXVsdEV4dHJhIiwiZnVuY05hbWUiLCJzaXplIiwiYW5kU2VsZiIsImRlZmluZSIsImFtZCIsIl9qUXVlcnkiLCJfJCIsIiQiLCJub0NvbmZsaWN0Il0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7O0NBWUMsR0FFQSxDQUFBLFNBQVVBLE1BQU0sRUFBRUMsT0FBTztJQUV6QixJQUFLLE9BQU9DLFdBQVcsWUFBWSxPQUFPQSxPQUFPQyxPQUFPLEtBQUssVUFBVztRQUN2RSxnRkFBZ0Y7UUFDaEYscUNBQXFDO1FBQ3JDLDBFQUEwRTtRQUMxRSxzRUFBc0U7UUFDdEUsOERBQThEO1FBQzlELCtDQUErQztRQUMvQyxrQ0FBa0M7UUFDbENELE9BQU9DLE9BQU8sR0FBR0gsT0FBT0ksUUFBUSxHQUMvQkgsUUFBU0QsUUFBUSxRQUNqQixTQUFVSyxDQUFDO1lBQ1YsSUFBSyxDQUFDQSxFQUFFRCxRQUFRLEVBQUc7Z0JBQ2xCLE1BQU0sSUFBSUUsTUFBTztZQUNsQjtZQUNBLE9BQU9MLFFBQVNJO1FBQ2pCO0lBQ0Ys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