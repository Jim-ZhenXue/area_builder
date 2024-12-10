/*!
 * QUnit 2.20.0
 * https://qunitjs.com/
 *
 * Copyright OpenJS Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 */ (function() {
    'use strict';
    function _typeof(obj) {
        "@babel/helpers - typeof";
        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
            return typeof obj;
        } : function(obj) {
            return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        }, _typeof(obj);
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }
    function _defineProperties(target, props) {
        for(var i = 0; i < props.length; i++){
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        Object.defineProperty(Constructor, "prototype", {
            writable: false
        });
        return Constructor;
    }
    function _slicedToArray(arr, i) {
        return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }
    function _toConsumableArray(arr) {
        return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
    }
    function _arrayWithoutHoles(arr) {
        if (Array.isArray(arr)) return _arrayLikeToArray(arr);
    }
    function _arrayWithHoles(arr) {
        if (Array.isArray(arr)) return arr;
    }
    function _iterableToArray(iter) {
        if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
    }
    function _iterableToArrayLimit(arr, i) {
        var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
        if (_i == null) return;
        var _arr = [];
        var _n = true;
        var _d = false;
        var _s, _e;
        try {
            for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
                _arr.push(_s.value);
                if (i && _arr.length === i) break;
            }
        } catch (err) {
            _d = true;
            _e = err;
        } finally{
            try {
                if (!_n && _i["return"] != null) _i["return"]();
            } finally{
                if (_d) throw _e;
            }
        }
        return _arr;
    }
    function _unsupportedIterableToArray(o, minLen) {
        if (!o) return;
        if (typeof o === "string") return _arrayLikeToArray(o, minLen);
        var n = Object.prototype.toString.call(o).slice(8, -1);
        if (n === "Object" && o.constructor) n = o.constructor.name;
        if (n === "Map" || n === "Set") return Array.from(o);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }
    function _arrayLikeToArray(arr, len) {
        if (len == null || len > arr.length) len = arr.length;
        for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
        return arr2;
    }
    function _nonIterableSpread() {
        throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _nonIterableRest() {
        throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _createForOfIteratorHelper(o, allowArrayLike) {
        var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
        if (!it) {
            if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
                if (it) o = it;
                var i = 0;
                var F = function() {};
                return {
                    s: F,
                    n: function() {
                        if (i >= o.length) return {
                            done: true
                        };
                        return {
                            done: false,
                            value: o[i++]
                        };
                    },
                    e: function(e) {
                        throw e;
                    },
                    f: F
                };
            }
            throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }
        var normalCompletion = true, didErr = false, err;
        return {
            s: function() {
                it = it.call(o);
            },
            n: function() {
                var step = it.next();
                normalCompletion = step.done;
                return step;
            },
            e: function(e) {
                didErr = true;
                err = e;
            },
            f: function() {
                try {
                    if (!normalCompletion && it.return != null) it.return();
                } finally{
                    if (didErr) throw err;
                }
            }
        };
    }
    // We don't use global-this-polyfill [1], because it modifies
    // the globals scope by default. QUnit must not affect the host context
    // as developers may test their project may be such a polyfill, and/or
    // they may intentionally test their project with and without certain
    // polyfills and we must not affect that. It also uses an obscure
    // mechanism that seems to sometimes causes a runtime error in older
    // browsers (specifically Safari and IE versions that support
    // Object.defineProperty but then report _T_ as undefined).
    // [1] https://github.com/ungap/global-this/blob/v0.4.4/esm/index.js
    //
    // Another way is `Function('return this')()`, but doing so relies
    // on eval which will cause a CSP error on some servers.
    //
    // Instead, simply check the four options that already exist
    // in all supported environments.
    function getGlobalThis() {
        if (typeof globalThis !== 'undefined') {
            // For SpiderMonkey, modern browsers, and recent Node.js
            // eslint-disable-next-line no-undef
            return globalThis;
        }
        if (typeof self !== 'undefined') {
            // For web workers
            // eslint-disable-next-line no-undef
            return self;
        }
        if (typeof window$1 !== 'undefined') {
            // For document context in browsers
            return window$1;
        }
        if (typeof global !== 'undefined') {
            // For Node.js
            // eslint-disable-next-line no-undef
            return global;
        }
        throw new Error('Unable to locate global object');
    }
    // This avoids a simple `export const` assignment as that would lead Rollup
    // to change getGlobalThis and use the same (generated) variable name there.
    var g = getGlobalThis();
    var window$1 = g.window;
    var console$1 = g.console;
    var setTimeout$1 = g.setTimeout;
    var clearTimeout = g.clearTimeout;
    var document = window$1 && window$1.document;
    var navigator = window$1 && window$1.navigator;
    var localSessionStorage = function() {
        var x = 'qunit-test-string';
        try {
            g.sessionStorage.setItem(x, x);
            g.sessionStorage.removeItem(x);
            return g.sessionStorage;
        } catch (e) {
            return undefined;
        }
    }();
    // Basic fallback for ES6 Map
    // Support: IE 9-10, Safari 7, PhantomJS; Map is undefined
    // Support: iOS 8; `new Map(iterable)` is not supported
    //
    // Fallback for ES7 Map#keys
    // Support: IE 11; Map#keys is undefined
    var StringMap = typeof g.Map === 'function' && typeof g.Map.prototype.keys === 'function' && typeof g.Symbol === 'function' && _typeof(g.Symbol.iterator) === 'symbol' ? g.Map : function StringMap(input) {
        var _this = this;
        var store = Object.create(null);
        var hasOwn = Object.prototype.hasOwnProperty;
        this.has = function(strKey) {
            return hasOwn.call(store, strKey);
        };
        this.get = function(strKey) {
            return store[strKey];
        };
        this.set = function(strKey, val) {
            if (!hasOwn.call(store, strKey)) {
                this.size++;
            }
            store[strKey] = val;
            return this;
        };
        this.delete = function(strKey) {
            if (hasOwn.call(store, strKey)) {
                delete store[strKey];
                this.size--;
            }
        };
        this.forEach = function(callback) {
            for(var strKey in store){
                callback(store[strKey], strKey);
            }
        };
        this.keys = function() {
            return Object.keys(store);
        };
        this.clear = function() {
            store = Object.create(null);
            this.size = 0;
        };
        this.size = 0;
        if (input) {
            input.forEach(function(val, strKey) {
                _this.set(strKey, val);
            });
        }
    };
    // Basic fallback for ES6 Set
    // Support: IE 11, `new Set(iterable)` parameter not yet implemented
    // Test for Set#values() which came after Set(iterable).
    var StringSet = typeof g.Set === 'function' && typeof g.Set.prototype.values === 'function' ? g.Set : function(input) {
        var set = Object.create(null);
        if (Array.isArray(input)) {
            input.forEach(function(item) {
                set[item] = true;
            });
        }
        return {
            add: function add(value) {
                set[value] = true;
            },
            has: function has(value) {
                return value in set;
            },
            get size () {
                return Object.keys(set).length;
            }
        };
    };
    var toString = Object.prototype.toString;
    var hasOwn$1 = Object.prototype.hasOwnProperty;
    var performance = {
        // eslint-disable-next-line compat/compat -- Checked
        now: window$1 && window$1.performance && window$1.performance.now ? window$1.performance.now.bind(window$1.performance) : Date.now
    };
    // Returns a new Array with the elements that are in a but not in b
    function diff(a, b) {
        return a.filter(function(a) {
            return b.indexOf(a) === -1;
        });
    }
    /**
	 * Determines whether an element exists in a given array or not.
	 *
	 * @method inArray
	 * @param {any} elem
	 * @param {Array} array
	 * @return {boolean}
	 */ var inArray = Array.prototype.includes ? function(elem, array) {
        return array.includes(elem);
    } : function(elem, array) {
        return array.indexOf(elem) !== -1;
    };
    /**
	 * Recursively clone an object into a plain array or object, taking only the
	 * own enumerable properties.
	 *
	 * @param {any} obj
	 * @param {bool} [allowArray=true]
	 * @return {Object|Array}
	 */ function objectValues(obj) {
        var allowArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        var vals = allowArray && is('array', obj) ? [] : {};
        for(var key in obj){
            if (hasOwn$1.call(obj, key)) {
                var val = obj[key];
                vals[key] = val === Object(val) ? objectValues(val, allowArray) : val;
            }
        }
        return vals;
    }
    /**
	 * Recursively clone an object into a plain object, taking only the
	 * subset of own enumerable properties that exist a given model.
	 *
	 * @param {any} obj
	 * @param {any} model
	 * @return {Object}
	 */ function objectValuesSubset(obj, model) {
        // Return primitive values unchanged to avoid false positives or confusing
        // results from assert.propContains().
        // E.g. an actual null or false wrongly equaling an empty object,
        // or an actual string being reported as object not matching a partial object.
        if (obj !== Object(obj)) {
            return obj;
        }
        // Unlike objectValues(), subset arrays to a plain objects as well.
        // This enables subsetting [20, 30] with {1: 30}.
        var subset = {};
        for(var key in model){
            if (hasOwn$1.call(model, key) && hasOwn$1.call(obj, key)) {
                subset[key] = objectValuesSubset(obj[key], model[key]);
            }
        }
        return subset;
    }
    function extend(a, b, undefOnly) {
        for(var prop in b){
            if (hasOwn$1.call(b, prop)) {
                if (b[prop] === undefined) {
                    delete a[prop];
                } else if (!(undefOnly && typeof a[prop] !== 'undefined')) {
                    a[prop] = b[prop];
                }
            }
        }
        return a;
    }
    function objectType(obj) {
        if (typeof obj === 'undefined') {
            return 'undefined';
        }
        // Consider: typeof null === object
        if (obj === null) {
            return 'null';
        }
        var match = toString.call(obj).match(/^\[object\s(.*)\]$/);
        var type = match && match[1];
        switch(type){
            case 'Number':
                if (isNaN(obj)) {
                    return 'nan';
                }
                return 'number';
            case 'String':
            case 'Boolean':
            case 'Array':
            case 'Set':
            case 'Map':
            case 'Date':
            case 'RegExp':
            case 'Function':
            case 'Symbol':
                return type.toLowerCase();
            default:
                return _typeof(obj);
        }
    }
    // Safe object type checking
    function is(type, obj) {
        return objectType(obj) === type;
    }
    // Based on Java's String.hashCode, a simple but not
    // rigorously collision resistant hashing function
    function generateHash(module1, testName) {
        var str = module1 + '\x1C' + testName;
        var hash = 0;
        for(var i = 0; i < str.length; i++){
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        // Convert the possibly negative integer hash code into an 8 character hex string, which isn't
        // strictly necessary but increases user understanding that the id is a SHA-like hash
        var hex = (0x100000000 + hash).toString(16);
        if (hex.length < 8) {
            hex = '0000000' + hex;
        }
        return hex.slice(-8);
    }
    /**
	 * Converts an error into a simple string for comparisons.
	 *
	 * @param {Error|any} error
	 * @return {string}
	 */ function errorString(error) {
        // Use String() instead of toString() to handle non-object values like undefined or null.
        var resultErrorString = String(error);
        // If the error wasn't a subclass of Error but something like
        // an object literal with name and message properties...
        if (resultErrorString.slice(0, 7) === '[object') {
            // Based on https://es5.github.io/#x15.11.4.4
            return (error.name || 'Error') + (error.message ? ": ".concat(error.message) : '');
        } else {
            return resultErrorString;
        }
    }
    var BOXABLE_TYPES = new StringSet([
        'boolean',
        'number',
        'string'
    ]);
    // Memory for previously seen containers (object, array, map, set).
    // Used for recursion detection, and to avoid repeated comparison.
    //
    // Elements are { a: val, b: val }.
    var memory = [];
    function useStrictEquality(a, b) {
        return a === b;
    }
    function useObjectValueEquality(a, b) {
        return a === b || a.valueOf() === b.valueOf();
    }
    function compareConstructors(a, b) {
        // Comparing constructors is more strict than using `instanceof`
        return getConstructor(a) === getConstructor(b);
    }
    function getConstructor(obj) {
        var proto = Object.getPrototypeOf(obj);
        // If the obj prototype descends from a null constructor, treat it
        // as a null prototype.
        // Ref https://github.com/qunitjs/qunit/issues/851
        //
        // Allow objects with no prototype, from Object.create(null), to be equivalent to
        // plain objects that have Object as their constructor.
        return !proto || proto.constructor === null ? Object : obj.constructor;
    }
    function getRegExpFlags(regexp) {
        return 'flags' in regexp ? regexp.flags : regexp.toString().match(/[gimuy]*$/)[0];
    }
    // Specialised comparisons after entryTypeCallbacks.object, based on `objectType()`
    var objTypeCallbacks = {
        undefined: useStrictEquality,
        null: useStrictEquality,
        // Handle boxed boolean
        boolean: useObjectValueEquality,
        number: function number(a, b) {
            // Handle NaN and boxed number
            return a === b || a.valueOf() === b.valueOf() || isNaN(a.valueOf()) && isNaN(b.valueOf());
        },
        // Handle boxed string
        string: useObjectValueEquality,
        symbol: useStrictEquality,
        date: useObjectValueEquality,
        nan: function nan() {
            return true;
        },
        regexp: function regexp(a, b) {
            return a.source === b.source && // Include flags in the comparison
            getRegExpFlags(a) === getRegExpFlags(b);
        },
        // identical reference only
        function: useStrictEquality,
        array: function array(a, b) {
            if (a.length !== b.length) {
                // Safe and faster
                return false;
            }
            for(var i = 0; i < a.length; i++){
                if (!typeEquiv(a[i], b[i])) {
                    return false;
                }
            }
            return true;
        },
        // Define sets a and b to be equivalent if for each element aVal in a, there
        // is some element bVal in b such that aVal and bVal are equivalent. Element
        // repetitions are not counted, so these are equivalent:
        // a = new Set( [ X={}, Y=[], Y ] );
        // b = new Set( [ Y, X, X ] );
        set: function set(a, b) {
            if (a.size !== b.size) {
                // This optimization has certain quirks because of the lack of
                // repetition counting. For instance, adding the same
                // (reference-identical) element to two equivalent sets can
                // make them non-equivalent.
                return false;
            }
            var outerEq = true;
            a.forEach(function(aVal) {
                // Short-circuit if the result is already known. (Using for...of
                // with a break clause would be cleaner here, but it would cause
                // a syntax error on older JavaScript implementations even if
                // Set is unused)
                if (!outerEq) {
                    return;
                }
                var innerEq = false;
                b.forEach(function(bVal) {
                    // Likewise, short-circuit if the result is already known
                    if (innerEq) {
                        return;
                    }
                    // Swap out the global memory, as nested typeEquiv() would clobber it
                    var originalMemory = memory;
                    memory = [];
                    if (typeEquiv(bVal, aVal)) {
                        innerEq = true;
                    }
                    // Restore
                    memory = originalMemory;
                });
                if (!innerEq) {
                    outerEq = false;
                }
            });
            return outerEq;
        },
        // Define maps a and b to be equivalent if for each key-value pair (aKey, aVal)
        // in a, there is some key-value pair (bKey, bVal) in b such that
        // [ aKey, aVal ] and [ bKey, bVal ] are equivalent. Key repetitions are not
        // counted, so these are equivalent:
        // a = new Map( [ [ {}, 1 ], [ {}, 1 ], [ [], 1 ] ] );
        // b = new Map( [ [ {}, 1 ], [ [], 1 ], [ [], 1 ] ] );
        map: function map(a, b) {
            if (a.size !== b.size) {
                // This optimization has certain quirks because of the lack of
                // repetition counting. For instance, adding the same
                // (reference-identical) key-value pair to two equivalent maps
                // can make them non-equivalent.
                return false;
            }
            var outerEq = true;
            a.forEach(function(aVal, aKey) {
                // Short-circuit if the result is already known. (Using for...of
                // with a break clause would be cleaner here, but it would cause
                // a syntax error on older JavaScript implementations even if
                // Map is unused)
                if (!outerEq) {
                    return;
                }
                var innerEq = false;
                b.forEach(function(bVal, bKey) {
                    // Likewise, short-circuit if the result is already known
                    if (innerEq) {
                        return;
                    }
                    // Swap out the global memory, as nested typeEquiv() would clobber it
                    var originalMemory = memory;
                    memory = [];
                    if (objTypeCallbacks.array([
                        bVal,
                        bKey
                    ], [
                        aVal,
                        aKey
                    ])) {
                        innerEq = true;
                    }
                    // Restore
                    memory = originalMemory;
                });
                if (!innerEq) {
                    outerEq = false;
                }
            });
            return outerEq;
        }
    };
    // Entry points from typeEquiv, based on `typeof`
    var entryTypeCallbacks = {
        undefined: useStrictEquality,
        null: useStrictEquality,
        boolean: useStrictEquality,
        number: function number(a, b) {
            // Handle NaN
            return a === b || isNaN(a) && isNaN(b);
        },
        string: useStrictEquality,
        symbol: useStrictEquality,
        function: useStrictEquality,
        object: function object(a, b) {
            // Handle memory (skip recursion)
            if (memory.some(function(pair) {
                return pair.a === a && pair.b === b;
            })) {
                return true;
            }
            memory.push({
                a: a,
                b: b
            });
            var aObjType = objectType(a);
            var bObjType = objectType(b);
            if (aObjType !== 'object' || bObjType !== 'object') {
                // Handle literal `null`
                // Handle: Array, Map/Set, Date, Regxp/Function, boxed primitives
                return aObjType === bObjType && objTypeCallbacks[aObjType](a, b);
            }
            // NOTE: Literal null must not make it here as it would throw
            if (compareConstructors(a, b) === false) {
                return false;
            }
            var aProperties = [];
            var bProperties = [];
            // Be strict and go deep, no filtering with hasOwnProperty.
            for(var i in a){
                // Collect a's properties
                aProperties.push(i);
                // Skip OOP methods that look the same
                if (a.constructor !== Object && typeof a.constructor !== 'undefined' && typeof a[i] === 'function' && typeof b[i] === 'function' && a[i].toString() === b[i].toString()) {
                    continue;
                }
                if (!typeEquiv(a[i], b[i])) {
                    return false;
                }
            }
            for(var _i in b){
                // Collect b's properties
                bProperties.push(_i);
            }
            return objTypeCallbacks.array(aProperties.sort(), bProperties.sort());
        }
    };
    function typeEquiv(a, b) {
        // Optimization: Only perform type-specific comparison when pairs are not strictly equal.
        if (a === b) {
            return true;
        }
        var aType = _typeof(a);
        var bType = _typeof(b);
        if (aType !== bType) {
            // Support comparing primitive to boxed primitives
            // Try again after possibly unwrapping one
            return (aType === 'object' && BOXABLE_TYPES.has(objectType(a)) ? a.valueOf() : a) === (bType === 'object' && BOXABLE_TYPES.has(objectType(b)) ? b.valueOf() : b);
        }
        return entryTypeCallbacks[aType](a, b);
    }
    function innerEquiv(a, b) {
        var res = typeEquiv(a, b);
        // Release any retained objects and reset recursion detection for next call
        memory = [];
        return res;
    }
    /**
	 * Test any two types of JavaScript values for equality.
	 *
	 * @author Philippe Rathé <prathe@gmail.com>
	 * @author David Chan <david@troi.org>
	 */ function equiv(a, b) {
        if (arguments.length === 2) {
            return a === b || innerEquiv(a, b);
        }
        // Given 0 or 1 arguments, just return true (nothing to compare).
        // Given (A,B,C,D) compare C,D then B,C then A,B.
        var i = arguments.length - 1;
        while(i > 0){
            if (!innerEquiv(arguments[i - 1], arguments[i])) {
                return false;
            }
            i--;
        }
        return true;
    }
    /**
	 * Config object: Maintain internal state
	 * Later exposed as QUnit.config
	 * `config` initialized at top of scope
	 */ var config = {
        // HTML Reporter: Modify document.title when suite is done
        altertitle: true,
        // HTML Reporter: collapse every test except the first failing test
        // If false, all failing tests will be expanded
        collapse: true,
        // whether or not to fail when there are zero tests
        // defaults to `true`
        failOnZeroTests: true,
        // Select by pattern or case-insensitive substring match against "moduleName: testName"
        filter: undefined,
        // Depth up-to which object will be dumped
        maxDepth: 5,
        // Select case-insensitive match of the module name
        module: undefined,
        // HTML Reporter: Select module/test by array of internal IDs
        moduleId: undefined,
        // By default, run previously failed tests first
        // very useful in combination with "Hide passed tests" checked
        reorder: true,
        // When enabled, all tests must call expect()
        requireExpects: false,
        // By default, scroll to top of the page when suite is done
        scrolltop: true,
        // The storage module to use for reordering tests
        storage: localSessionStorage,
        testId: undefined,
        // HTML Reporter: List of URL parameters that are given visual controls
        urlConfig: [],
        // Internal: The first unnamed module
        //
        // By being defined as the intial value for currentModule, it is the
        // receptacle and implied parent for any global tests. It is as if we
        // called `QUnit.module( "" );` before any other tests were defined.
        //
        // If we reach begin() and no tests were put in it, we dequeue it as if it
        // never existed, and in that case never expose it to the events and
        // callbacks API.
        //
        // When global tests are defined, then this unnamed module will execute
        // as any other module, including moduleStart/moduleDone events etc.
        //
        // Since this module isn't explicitly created by the user, they have no
        // access to add hooks for it. The hooks object is defined to comply
        // with internal expectations of test.js, but they will be empty.
        // To apply hooks, place tests explicitly in a QUnit.module(), and use
        // its hooks accordingly.
        //
        // For global hooks that apply to all tests and all modules, use QUnit.hooks.
        //
        // NOTE: This is *not* a "global module". It is not an ancestor of all modules
        // and tests. It is merely the parent for any tests defined globally,
        // before the first QUnit.module(). As such, the events for this unnamed
        // module will fire as normal, right after its last test, and *not* at
        // the end of the test run.
        //
        // NOTE: This also should probably also not become a global module, unless
        // we keep it out of the public API. For example, it would likely not
        // improve the user interface and plugin behaviour if all modules became
        // wrapped between the start and end events of this module, and thus
        // needlessly add indentation, indirection, or other visible noise.
        // Unit tests for the callbacks API would detect that as a regression.
        currentModule: {
            name: '',
            tests: [],
            childModules: [],
            testsRun: 0,
            testsIgnored: 0,
            hooks: {
                before: [],
                beforeEach: [],
                afterEach: [],
                after: []
            }
        },
        // Internal: Exposed to make resets easier
        // Ref https://github.com/qunitjs/qunit/pull/1598
        globalHooks: {},
        // Internal state
        blocking: true,
        callbacks: {},
        modules: [],
        queue: [],
        stats: {
            all: 0,
            bad: 0,
            testCount: 0
        }
    };
    // Apply a predefined QUnit.config object
    //
    // Ignore QUnit.config if it is a QUnit distribution instead of preconfig.
    // That means QUnit was loaded twice! (Use the same approach as export.js)
    var preConfig = g && g.QUnit && !g.QUnit.version && g.QUnit.config;
    if (preConfig) {
        extend(config, preConfig);
    }
    // Push a loose unnamed module to the modules collection
    config.modules.push(config.currentModule);
    var dump = function() {
        function quote(str) {
            return '"' + str.toString().replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
        }
        function literal(o) {
            return o + '';
        }
        function join(pre, arr, post) {
            var s = dump.separator();
            var inner = dump.indent(1);
            if (arr.join) {
                arr = arr.join(',' + s + inner);
            }
            if (!arr) {
                return pre + post;
            }
            var base = dump.indent();
            return [
                pre,
                inner + arr,
                base + post
            ].join(s);
        }
        function array(arr, stack) {
            if (dump.maxDepth && dump.depth > dump.maxDepth) {
                return '[object Array]';
            }
            this.up();
            var i = arr.length;
            var ret = new Array(i);
            while(i--){
                ret[i] = this.parse(arr[i], undefined, stack);
            }
            this.down();
            return join('[', ret, ']');
        }
        function isArray(obj) {
            return(// Native Arrays
            toString.call(obj) === '[object Array]' || // NodeList objects
            typeof obj.length === 'number' && obj.item !== undefined && (obj.length ? obj.item(0) === obj[0] : obj.item(0) === null && obj[0] === undefined));
        }
        var reName = /^function (\w+)/;
        var dump = {
            // The objType is used mostly internally, you can fix a (custom) type in advance
            parse: function parse(obj, objType, stack) {
                stack = stack || [];
                var objIndex = stack.indexOf(obj);
                if (objIndex !== -1) {
                    return "recursion(".concat(objIndex - stack.length, ")");
                }
                objType = objType || this.typeOf(obj);
                var parser = this.parsers[objType];
                var parserType = _typeof(parser);
                if (parserType === 'function') {
                    stack.push(obj);
                    var res = parser.call(this, obj, stack);
                    stack.pop();
                    return res;
                }
                if (parserType === 'string') {
                    return parser;
                }
                return '[ERROR: Missing QUnit.dump formatter for type ' + objType + ']';
            },
            typeOf: function typeOf(obj) {
                var type;
                if (obj === null) {
                    type = 'null';
                } else if (typeof obj === 'undefined') {
                    type = 'undefined';
                } else if (is('regexp', obj)) {
                    type = 'regexp';
                } else if (is('date', obj)) {
                    type = 'date';
                } else if (is('function', obj)) {
                    type = 'function';
                } else if (obj.setInterval !== undefined && obj.document !== undefined && obj.nodeType === undefined) {
                    type = 'window';
                } else if (obj.nodeType === 9) {
                    type = 'document';
                } else if (obj.nodeType) {
                    type = 'node';
                } else if (isArray(obj)) {
                    type = 'array';
                } else if (obj.constructor === Error.prototype.constructor) {
                    type = 'error';
                } else {
                    type = _typeof(obj);
                }
                return type;
            },
            separator: function separator() {
                if (this.multiline) {
                    return this.HTML ? '<br />' : '\n';
                } else {
                    return this.HTML ? '&#160;' : ' ';
                }
            },
            // Extra can be a number, shortcut for increasing-calling-decreasing
            indent: function indent(extra) {
                if (!this.multiline) {
                    return '';
                }
                var chr = this.indentChar;
                if (this.HTML) {
                    chr = chr.replace(/\t/g, '   ').replace(/ /g, '&#160;');
                }
                return new Array(this.depth + (extra || 0)).join(chr);
            },
            up: function up(a) {
                this.depth += a || 1;
            },
            down: function down(a) {
                this.depth -= a || 1;
            },
            setParser: function setParser(name, parser) {
                this.parsers[name] = parser;
            },
            // The next 3 are exposed so you can use them
            quote: quote,
            literal: literal,
            join: join,
            depth: 1,
            maxDepth: config.maxDepth,
            // This is the list of parsers, to modify them, use dump.setParser
            parsers: {
                window: '[Window]',
                document: '[Document]',
                error: function error(_error) {
                    return 'Error("' + _error.message + '")';
                },
                // This has been unused since QUnit 1.0.0.
                // @todo Deprecate and remove.
                unknown: '[Unknown]',
                null: 'null',
                undefined: 'undefined',
                function: function _function(fn) {
                    var ret = 'function';
                    // Functions never have name in IE
                    var name = 'name' in fn ? fn.name : (reName.exec(fn) || [])[1];
                    if (name) {
                        ret += ' ' + name;
                    }
                    ret += '(';
                    ret = [
                        ret,
                        dump.parse(fn, 'functionArgs'),
                        '){'
                    ].join('');
                    return join(ret, dump.parse(fn, 'functionCode'), '}');
                },
                array: array,
                nodelist: array,
                arguments: array,
                object: function object(map, stack) {
                    var ret = [];
                    if (dump.maxDepth && dump.depth > dump.maxDepth) {
                        return '[object Object]';
                    }
                    dump.up();
                    var keys = [];
                    for(var key in map){
                        keys.push(key);
                    }
                    // Some properties are not always enumerable on Error objects.
                    var nonEnumerableProperties = [
                        'message',
                        'name'
                    ];
                    for(var i in nonEnumerableProperties){
                        var _key = nonEnumerableProperties[i];
                        if (_key in map && !inArray(_key, keys)) {
                            keys.push(_key);
                        }
                    }
                    keys.sort();
                    for(var _i = 0; _i < keys.length; _i++){
                        var _key2 = keys[_i];
                        var val = map[_key2];
                        ret.push(dump.parse(_key2, 'key') + ': ' + dump.parse(val, undefined, stack));
                    }
                    dump.down();
                    return join('{', ret, '}');
                },
                node: function node(_node) {
                    var open = dump.HTML ? '&lt;' : '<';
                    var close = dump.HTML ? '&gt;' : '>';
                    var tag = _node.nodeName.toLowerCase();
                    var ret = open + tag;
                    var attrs = _node.attributes;
                    if (attrs) {
                        for(var i = 0; i < attrs.length; i++){
                            var val = attrs[i].nodeValue;
                            // IE6 includes all attributes in .attributes, even ones not explicitly
                            // set. Those have values like undefined, null, 0, false, "" or
                            // "inherit".
                            if (val && val !== 'inherit') {
                                ret += ' ' + attrs[i].nodeName + '=' + dump.parse(val, 'attribute');
                            }
                        }
                    }
                    ret += close;
                    // Show content of TextNode or CDATASection
                    if (_node.nodeType === 3 || _node.nodeType === 4) {
                        ret += _node.nodeValue;
                    }
                    return ret + open + '/' + tag + close;
                },
                // Function calls it internally, it's the arguments part of the function
                functionArgs: function functionArgs(fn) {
                    var l = fn.length;
                    if (!l) {
                        return '';
                    }
                    var args = new Array(l);
                    while(l--){
                        // 97 is 'a'
                        args[l] = String.fromCharCode(97 + l);
                    }
                    return ' ' + args.join(', ') + ' ';
                },
                // Object calls it internally, the key part of an item in a map
                key: quote,
                // Function calls it internally, it's the content of the function
                functionCode: '[code]',
                // Node calls it internally, it's a html attribute value
                attribute: quote,
                string: quote,
                date: quote,
                regexp: literal,
                number: literal,
                boolean: literal,
                symbol: function symbol(sym) {
                    return sym.toString();
                }
            },
            // If true, entities are escaped ( <, >, \t, space and \n )
            HTML: false,
            // Indentation unit
            indentChar: '  ',
            // If true, items in a collection, are separated by a \n, else just a space.
            multiline: true
        };
        return dump;
    }();
    // Support: IE 9
    // Detect if the console object exists and no-op otherwise.
    // This allows support for IE 9, which doesn't have a console
    // object if the developer tools are not open.
    // Support: IE 9
    // Function#bind is supported, but no console.log.bind().
    // Support: SpiderMonkey (mozjs 68+)
    // The console object has a log method, but no warn method.
    var Logger = {
        warn: console$1 ? Function.prototype.bind.call(console$1.warn || console$1.log, console$1) : function() {}
    };
    var SuiteReport = /*#__PURE__*/ function() {
        function SuiteReport(name, parentSuite) {
            _classCallCheck(this, SuiteReport);
            this.name = name;
            this.fullName = parentSuite ? parentSuite.fullName.concat(name) : [];
            // When an "error" event is emitted from onUncaughtException(), the
            // "runEnd" event should report the status as failed. The "runEnd" event data
            // is tracked through this property (via the "runSuite" instance).
            this.globalFailureCount = 0;
            this.tests = [];
            this.childSuites = [];
            if (parentSuite) {
                parentSuite.pushChildSuite(this);
            }
        }
        _createClass(SuiteReport, [
            {
                key: "start",
                value: function start(recordTime) {
                    if (recordTime) {
                        this._startTime = performance.now();
                    }
                    return {
                        name: this.name,
                        fullName: this.fullName.slice(),
                        tests: this.tests.map(function(test) {
                            return test.start();
                        }),
                        childSuites: this.childSuites.map(function(suite) {
                            return suite.start();
                        }),
                        testCounts: {
                            total: this.getTestCounts().total
                        }
                    };
                }
            },
            {
                key: "end",
                value: function end(recordTime) {
                    if (recordTime) {
                        this._endTime = performance.now();
                    }
                    return {
                        name: this.name,
                        fullName: this.fullName.slice(),
                        tests: this.tests.map(function(test) {
                            return test.end();
                        }),
                        childSuites: this.childSuites.map(function(suite) {
                            return suite.end();
                        }),
                        testCounts: this.getTestCounts(),
                        runtime: this.getRuntime(),
                        status: this.getStatus()
                    };
                }
            },
            {
                key: "pushChildSuite",
                value: function pushChildSuite(suite) {
                    this.childSuites.push(suite);
                }
            },
            {
                key: "pushTest",
                value: function pushTest(test) {
                    this.tests.push(test);
                }
            },
            {
                key: "getRuntime",
                value: function getRuntime() {
                    return Math.round(this._endTime - this._startTime);
                }
            },
            {
                key: "getTestCounts",
                value: function getTestCounts() {
                    var counts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
                        passed: 0,
                        failed: 0,
                        skipped: 0,
                        todo: 0,
                        total: 0
                    };
                    counts.failed += this.globalFailureCount;
                    counts.total += this.globalFailureCount;
                    counts = this.tests.reduce(function(counts, test) {
                        if (test.valid) {
                            counts[test.getStatus()]++;
                            counts.total++;
                        }
                        return counts;
                    }, counts);
                    return this.childSuites.reduce(function(counts, suite) {
                        return suite.getTestCounts(counts);
                    }, counts);
                }
            },
            {
                key: "getStatus",
                value: function getStatus() {
                    var _this$getTestCounts = this.getTestCounts(), total = _this$getTestCounts.total, failed = _this$getTestCounts.failed, skipped = _this$getTestCounts.skipped, todo = _this$getTestCounts.todo;
                    if (failed) {
                        return 'failed';
                    } else {
                        if (skipped === total) {
                            return 'skipped';
                        } else if (todo === total) {
                            return 'todo';
                        } else {
                            return 'passed';
                        }
                    }
                }
            }
        ]);
        return SuiteReport;
    }();
    var moduleStack = [];
    var runSuite = new SuiteReport();
    function isParentModuleInQueue() {
        var modulesInQueue = config.modules.filter(function(module1) {
            return !module1.ignored;
        }).map(function(module1) {
            return module1.moduleId;
        });
        return moduleStack.some(function(module1) {
            return modulesInQueue.includes(module1.moduleId);
        });
    }
    function createModule(name, testEnvironment, modifiers) {
        var parentModule = moduleStack.length ? moduleStack.slice(-1)[0] : null;
        var moduleName = parentModule !== null ? [
            parentModule.name,
            name
        ].join(' > ') : name;
        var parentSuite = parentModule ? parentModule.suiteReport : runSuite;
        var skip = parentModule !== null && parentModule.skip || modifiers.skip;
        var todo = parentModule !== null && parentModule.todo || modifiers.todo;
        var env = {};
        if (parentModule) {
            extend(env, parentModule.testEnvironment);
        }
        extend(env, testEnvironment);
        var module1 = {
            name: moduleName,
            parentModule: parentModule,
            hooks: {
                before: [],
                beforeEach: [],
                afterEach: [],
                after: []
            },
            testEnvironment: env,
            tests: [],
            moduleId: generateHash(moduleName),
            testsRun: 0,
            testsIgnored: 0,
            childModules: [],
            suiteReport: new SuiteReport(name, parentSuite),
            // Initialised by test.js when the module start executing,
            // i.e. before the first test in this module (or a child).
            stats: null,
            // Pass along `skip` and `todo` properties from parent module, in case
            // there is one, to childs. And use own otherwise.
            // This property will be used to mark own tests and tests of child suites
            // as either `skipped` or `todo`.
            skip: skip,
            todo: skip ? false : todo,
            ignored: modifiers.ignored || false
        };
        if (parentModule) {
            parentModule.childModules.push(module1);
        }
        config.modules.push(module1);
        return module1;
    }
    function setHookFromEnvironment(hooks, environment, name) {
        var potentialHook = environment[name];
        if (typeof potentialHook === 'function') {
            hooks[name].push(potentialHook);
        }
        delete environment[name];
    }
    function makeSetHook(module1, hookName) {
        return function setHook(callback) {
            if (config.currentModule !== module1) {
                Logger.warn('The `' + hookName + '` hook was called inside the wrong module (`' + config.currentModule.name + '`). ' + 'Instead, use hooks provided by the callback to the containing module (`' + module1.name + '`). ' + 'This will become an error in QUnit 3.0.');
            }
            module1.hooks[hookName].push(callback);
        };
    }
    function processModule(name, options, executeNow) {
        var modifiers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        if (typeof options === 'function') {
            executeNow = options;
            options = undefined;
        }
        var module1 = createModule(name, options, modifiers);
        // Transfer any initial hooks from the options object to the 'hooks' object
        var testEnvironment = module1.testEnvironment;
        var hooks = module1.hooks;
        setHookFromEnvironment(hooks, testEnvironment, 'before');
        setHookFromEnvironment(hooks, testEnvironment, 'beforeEach');
        setHookFromEnvironment(hooks, testEnvironment, 'afterEach');
        setHookFromEnvironment(hooks, testEnvironment, 'after');
        var moduleFns = {
            before: makeSetHook(module1, 'before'),
            beforeEach: makeSetHook(module1, 'beforeEach'),
            afterEach: makeSetHook(module1, 'afterEach'),
            after: makeSetHook(module1, 'after')
        };
        var prevModule = config.currentModule;
        config.currentModule = module1;
        if (typeof executeNow === 'function') {
            moduleStack.push(module1);
            try {
                var cbReturnValue = executeNow.call(module1.testEnvironment, moduleFns);
                if (cbReturnValue && typeof cbReturnValue.then === 'function') {
                    Logger.warn('Returning a promise from a module callback is not supported. ' + 'Instead, use hooks for async behavior. ' + 'This will become an error in QUnit 3.0.');
                }
            } finally{
                // If the module closure threw an uncaught error during the load phase,
                // we let this bubble up to global error handlers. But, not until after
                // we teardown internal state to ensure correct module nesting.
                // Ref https://github.com/qunitjs/qunit/issues/1478.
                moduleStack.pop();
                config.currentModule = module1.parentModule || prevModule;
            }
        }
    }
    var focused$1 = false; // indicates that the "only" filter was used
    function module$1(name, options, executeNow) {
        var ignored = focused$1 && !isParentModuleInQueue();
        processModule(name, options, executeNow, {
            ignored: ignored
        });
    }
    module$1.only = function() {
        if (!focused$1) {
            // Upon the first module.only() call,
            // delete any and all previously registered modules and tests.
            config.modules.length = 0;
            config.queue.length = 0;
            // Ignore any tests declared after this block within the same
            // module parent. https://github.com/qunitjs/qunit/issues/1645
            config.currentModule.ignored = true;
        }
        focused$1 = true;
        processModule.apply(void 0, arguments);
    };
    module$1.skip = function(name, options, executeNow) {
        if (focused$1) {
            return;
        }
        processModule(name, options, executeNow, {
            skip: true
        });
    };
    module$1.todo = function(name, options, executeNow) {
        if (focused$1) {
            return;
        }
        processModule(name, options, executeNow, {
            todo: true
        });
    };
    // Doesn't support IE9, it will return undefined on these browsers
    // See also https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error/Stack
    var fileName = (sourceFromStacktrace(0) || '').replace(/(:\d+)+\)?/, '')// Remove anything prior to the last slash (Unix/Windows)
    // from the last frame
    .replace(/.+[/\\]/, '');
    function extractStacktrace(e, offset) {
        offset = offset === undefined ? 4 : offset;
        if (e && e.stack) {
            var stack = e.stack.split('\n');
            if (/^error$/i.test(stack[0])) {
                stack.shift();
            }
            if (fileName) {
                var include = [];
                for(var i = offset; i < stack.length; i++){
                    if (stack[i].indexOf(fileName) !== -1) {
                        break;
                    }
                    include.push(stack[i]);
                }
                if (include.length) {
                    return include.join('\n');
                }
            }
            return stack[offset];
        }
    }
    function sourceFromStacktrace(offset) {
        var error = new Error();
        // Support: Safari <=7 only, IE <=10 - 11 only
        // Not all browsers generate the `stack` property for `new Error()`, see also #636
        if (!error.stack) {
            try {
                throw error;
            } catch (err) {
                error = err;
            }
        }
        return extractStacktrace(error, offset);
    }
    var Assert = /*#__PURE__*/ function() {
        function Assert(testContext) {
            _classCallCheck(this, Assert);
            this.test = testContext;
        }
        _createClass(Assert, [
            {
                key: "timeout",
                value: function timeout(duration) {
                    if (typeof duration !== 'number') {
                        throw new Error('You must pass a number as the duration to assert.timeout');
                    }
                    this.test.timeout = duration;
                    // If a timeout has been set, clear it and reset with the new duration
                    if (config.timeout) {
                        clearTimeout(config.timeout);
                        config.timeout = null;
                        if (config.timeoutHandler && this.test.timeout > 0) {
                            this.test.internalResetTimeout(this.test.timeout);
                        }
                    }
                }
            },
            {
                key: "step",
                value: function step(message) {
                    var assertionMessage = message;
                    var result = !!message;
                    this.test.steps.push(message);
                    if (typeof message === 'undefined' || message === '') {
                        assertionMessage = 'You must provide a message to assert.step';
                    } else if (typeof message !== 'string') {
                        assertionMessage = 'You must provide a string value to assert.step';
                        result = false;
                    }
                    this.pushResult({
                        result: result,
                        message: assertionMessage
                    });
                }
            },
            {
                key: "verifySteps",
                value: function verifySteps(steps, message) {
                    // Since the steps array is just string values, we can clone with slice
                    var actualStepsClone = this.test.steps.slice();
                    this.deepEqual(actualStepsClone, steps, message);
                    this.test.steps.length = 0;
                }
            },
            {
                key: "expect",
                value: function expect(asserts) {
                    if (arguments.length === 1) {
                        this.test.expected = asserts;
                    } else {
                        return this.test.expected;
                    }
                }
            },
            {
                key: "async",
                value: function async(count) {
                    if (count === undefined) {
                        count = 1;
                    } else if (typeof count !== 'number') {
                        throw new TypeError('async takes number as an input');
                    }
                    var requiredCalls = count;
                    return this.test.internalStop(requiredCalls);
                }
            },
            {
                key: "push",
                value: function push(result, actual, expected, message, negative) {
                    Logger.warn('assert.push is deprecated and will be removed in QUnit 3.0.' + ' Please use assert.pushResult instead (https://api.qunitjs.com/assert/pushResult).');
                    var currentAssert = this instanceof Assert ? this : config.current.assert;
                    return currentAssert.pushResult({
                        result: result,
                        actual: actual,
                        expected: expected,
                        message: message,
                        negative: negative
                    });
                }
            },
            {
                key: "pushResult",
                value: function pushResult(resultInfo) {
                    // Destructure of resultInfo = { result, actual, expected, message, negative }
                    var assert = this;
                    var currentTest = assert instanceof Assert && assert.test || config.current;
                    // Backwards compatibility fix.
                    // Allows the direct use of global exported assertions and QUnit.assert.*
                    // Although, it's use is not recommended as it can leak assertions
                    // to other tests from async tests, because we only get a reference to the current test,
                    // not exactly the test where assertion were intended to be called.
                    if (!currentTest) {
                        throw new Error('assertion outside test context, in ' + sourceFromStacktrace(2));
                    }
                    if (!(assert instanceof Assert)) {
                        assert = currentTest.assert;
                    }
                    return assert.test.pushResult(resultInfo);
                }
            },
            {
                key: "ok",
                value: function ok(result, message) {
                    if (!message) {
                        message = result ? 'okay' : "failed, expected argument to be truthy, was: ".concat(dump.parse(result));
                    }
                    this.pushResult({
                        result: !!result,
                        actual: result,
                        expected: true,
                        message: message
                    });
                }
            },
            {
                key: "notOk",
                value: function notOk(result, message) {
                    if (!message) {
                        message = !result ? 'okay' : "failed, expected argument to be falsy, was: ".concat(dump.parse(result));
                    }
                    this.pushResult({
                        result: !result,
                        actual: result,
                        expected: false,
                        message: message
                    });
                }
            },
            {
                key: "true",
                value: function _true(result, message) {
                    this.pushResult({
                        result: result === true,
                        actual: result,
                        expected: true,
                        message: message
                    });
                }
            },
            {
                key: "false",
                value: function _false(result, message) {
                    this.pushResult({
                        result: result === false,
                        actual: result,
                        expected: false,
                        message: message
                    });
                }
            },
            {
                key: "equal",
                value: function equal(actual, expected, message) {
                    this.pushResult({
                        // eslint-disable-next-line eqeqeq
                        result: expected == actual,
                        actual: actual,
                        expected: expected,
                        message: message
                    });
                }
            },
            {
                key: "notEqual",
                value: function notEqual(actual, expected, message) {
                    this.pushResult({
                        // eslint-disable-next-line eqeqeq
                        result: expected != actual,
                        actual: actual,
                        expected: expected,
                        message: message,
                        negative: true
                    });
                }
            },
            {
                key: "propEqual",
                value: function propEqual(actual, expected, message) {
                    actual = objectValues(actual);
                    expected = objectValues(expected);
                    this.pushResult({
                        result: equiv(actual, expected),
                        actual: actual,
                        expected: expected,
                        message: message
                    });
                }
            },
            {
                key: "notPropEqual",
                value: function notPropEqual(actual, expected, message) {
                    actual = objectValues(actual);
                    expected = objectValues(expected);
                    this.pushResult({
                        result: !equiv(actual, expected),
                        actual: actual,
                        expected: expected,
                        message: message,
                        negative: true
                    });
                }
            },
            {
                key: "propContains",
                value: function propContains(actual, expected, message) {
                    actual = objectValuesSubset(actual, expected);
                    // The expected parameter is usually a plain object, but clone it for
                    // consistency with propEqual(), and to make it easy to explain that
                    // inheritence is not considered (on either side), and to support
                    // recursively checking subsets of nested objects.
                    expected = objectValues(expected, false);
                    this.pushResult({
                        result: equiv(actual, expected),
                        actual: actual,
                        expected: expected,
                        message: message
                    });
                }
            },
            {
                key: "notPropContains",
                value: function notPropContains(actual, expected, message) {
                    actual = objectValuesSubset(actual, expected);
                    expected = objectValues(expected);
                    this.pushResult({
                        result: !equiv(actual, expected),
                        actual: actual,
                        expected: expected,
                        message: message,
                        negative: true
                    });
                }
            },
            {
                key: "deepEqual",
                value: function deepEqual(actual, expected, message) {
                    this.pushResult({
                        result: equiv(actual, expected),
                        actual: actual,
                        expected: expected,
                        message: message
                    });
                }
            },
            {
                key: "notDeepEqual",
                value: function notDeepEqual(actual, expected, message) {
                    this.pushResult({
                        result: !equiv(actual, expected),
                        actual: actual,
                        expected: expected,
                        message: message,
                        negative: true
                    });
                }
            },
            {
                key: "strictEqual",
                value: function strictEqual(actual, expected, message) {
                    this.pushResult({
                        result: expected === actual,
                        actual: actual,
                        expected: expected,
                        message: message
                    });
                }
            },
            {
                key: "notStrictEqual",
                value: function notStrictEqual(actual, expected, message) {
                    this.pushResult({
                        result: expected !== actual,
                        actual: actual,
                        expected: expected,
                        message: message,
                        negative: true
                    });
                }
            },
            {
                key: 'throws',
                value: function throws(block, expected, message) {
                    var _validateExpectedExce = validateExpectedExceptionArgs(expected, message, 'throws');
                    var _validateExpectedExce2 = _slicedToArray(_validateExpectedExce, 2);
                    expected = _validateExpectedExce2[0];
                    message = _validateExpectedExce2[1];
                    var currentTest = this instanceof Assert && this.test || config.current;
                    if (typeof block !== 'function') {
                        currentTest.assert.pushResult({
                            result: false,
                            actual: block,
                            message: 'The value provided to `assert.throws` in ' + '"' + currentTest.testName + '" was not a function.'
                        });
                        return;
                    }
                    var actual;
                    var result = false;
                    currentTest.ignoreGlobalErrors = true;
                    try {
                        block.call(currentTest.testEnvironment);
                    } catch (e) {
                        actual = e;
                    }
                    currentTest.ignoreGlobalErrors = false;
                    if (actual) {
                        var _validateException = validateException(actual, expected, message);
                        var _validateException2 = _slicedToArray(_validateException, 3);
                        result = _validateException2[0];
                        expected = _validateException2[1];
                        message = _validateException2[2];
                    }
                    currentTest.assert.pushResult({
                        result: result,
                        // undefined if it didn't throw
                        actual: actual && errorString(actual),
                        expected: expected,
                        message: message
                    });
                }
            },
            {
                key: "rejects",
                value: function rejects(promise, expected, message) {
                    var _validateExpectedExce3 = validateExpectedExceptionArgs(expected, message, 'rejects');
                    var _validateExpectedExce4 = _slicedToArray(_validateExpectedExce3, 2);
                    expected = _validateExpectedExce4[0];
                    message = _validateExpectedExce4[1];
                    var currentTest = this instanceof Assert && this.test || config.current;
                    var then = promise && promise.then;
                    if (typeof then !== 'function') {
                        currentTest.assert.pushResult({
                            result: false,
                            message: 'The value provided to `assert.rejects` in ' + '"' + currentTest.testName + '" was not a promise.',
                            actual: promise
                        });
                        return;
                    }
                    var done = this.async();
                    return then.call(promise, function handleFulfillment() {
                        currentTest.assert.pushResult({
                            result: false,
                            message: 'The promise returned by the `assert.rejects` callback in ' + '"' + currentTest.testName + '" did not reject.',
                            actual: promise
                        });
                        done();
                    }, function handleRejection(actual) {
                        var result;
                        var _validateException3 = validateException(actual, expected, message);
                        var _validateException4 = _slicedToArray(_validateException3, 3);
                        result = _validateException4[0];
                        expected = _validateException4[1];
                        message = _validateException4[2];
                        currentTest.assert.pushResult({
                            result: result,
                            // leave rejection value of undefined as-is
                            actual: actual && errorString(actual),
                            expected: expected,
                            message: message
                        });
                        done();
                    });
                }
            }
        ]);
        return Assert;
    }();
    function validateExpectedExceptionArgs(expected, message, assertionMethod) {
        var expectedType = objectType(expected);
        // 'expected' is optional unless doing string comparison
        if (expectedType === 'string') {
            if (message === undefined) {
                message = expected;
                expected = undefined;
                return [
                    expected,
                    message
                ];
            } else {
                throw new Error('assert.' + assertionMethod + ' does not accept a string value for the expected argument.\n' + 'Use a non-string object value (e.g. RegExp or validator function) ' + 'instead if necessary.');
            }
        }
        var valid = !expected || // TODO: be more explicit here
        expectedType === 'regexp' || expectedType === 'function' || expectedType === 'object';
        if (!valid) {
            throw new Error('Invalid expected value type (' + expectedType + ') ' + 'provided to assert.' + assertionMethod + '.');
        }
        return [
            expected,
            message
        ];
    }
    function validateException(actual, expected, message) {
        var result = false;
        var expectedType = objectType(expected);
        // These branches should be exhaustive, based on validation done in validateExpectedException
        // We don't want to validate
        if (!expected) {
            result = true;
        // Expected is a regexp
        } else if (expectedType === 'regexp') {
            result = expected.test(errorString(actual));
            // Log the string form of the regexp
            expected = String(expected);
        // Expected is a constructor, maybe an Error constructor.
        // Note the extra check on its prototype - this is an implicit
        // requirement of "instanceof", else it will throw a TypeError.
        } else if (expectedType === 'function' && expected.prototype !== undefined && actual instanceof expected) {
            result = true;
        // Expected is an Error object
        } else if (expectedType === 'object') {
            result = actual instanceof expected.constructor && actual.name === expected.name && actual.message === expected.message;
            // Log the string form of the Error object
            expected = errorString(expected);
        // Expected is a validation function which returns true if validation passed
        } else if (expectedType === 'function') {
            // protect against accidental semantics which could hard error in the test
            try {
                result = expected.call({}, actual) === true;
                expected = null;
            } catch (e) {
                // assign the "expected" to a nice error string to communicate the local failure to the user
                expected = errorString(e);
            }
        }
        return [
            result,
            expected,
            message
        ];
    }
    // Provide an alternative to assert.throws(), for environments that consider throws a reserved word
    // Known to us are: Closure Compiler, Narwhal
    // eslint-disable-next-line dot-notation
    Assert.prototype.raises = Assert.prototype['throws'];
    var LISTENERS = Object.create(null);
    var SUPPORTED_EVENTS = [
        'error',
        'runStart',
        'suiteStart',
        'testStart',
        'assertion',
        'testEnd',
        'suiteEnd',
        'runEnd'
    ];
    /**
	 * Emits an event with the specified data to all currently registered listeners.
	 * Callbacks will fire in the order in which they are registered (FIFO). This
	 * function is not exposed publicly; it is used by QUnit internals to emit
	 * logging events.
	 *
	 * @private
	 * @method emit
	 * @param {string} eventName
	 * @param {Object} data
	 * @return {void}
	 */ function emit(eventName, data) {
        if (typeof eventName !== 'string') {
            throw new TypeError('eventName must be a string when emitting an event');
        }
        // Clone the callbacks in case one of them registers a new callback
        var originalCallbacks = LISTENERS[eventName];
        var callbacks = originalCallbacks ? _toConsumableArray(originalCallbacks) : [];
        for(var i = 0; i < callbacks.length; i++){
            callbacks[i](data);
        }
    }
    /**
	 * Registers a callback as a listener to the specified event.
	 *
	 * @public
	 * @method on
	 * @param {string} eventName
	 * @param {Function} callback
	 * @return {void}
	 */ function on(eventName, callback) {
        if (typeof eventName !== 'string') {
            throw new TypeError('eventName must be a string when registering a listener');
        } else if (!inArray(eventName, SUPPORTED_EVENTS)) {
            var events = SUPPORTED_EVENTS.join(', ');
            throw new Error("\"".concat(eventName, "\" is not a valid event; must be one of: ").concat(events, "."));
        } else if (typeof callback !== 'function') {
            throw new TypeError('callback must be a function when registering a listener');
        }
        if (!LISTENERS[eventName]) {
            LISTENERS[eventName] = [];
        }
        // Don't register the same callback more than once
        if (!inArray(callback, LISTENERS[eventName])) {
            LISTENERS[eventName].push(callback);
        }
    }
    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};
    function commonjsRequire(path) {
        throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
    }
    var promisePolyfill = {
        exports: {}
    };
    (function() {
        /** @suppress {undefinedVars} */ var globalNS = function() {
            // the only reliable means to get the global object is
            // `Function('return this')()`
            // However, this causes CSP violations in Chrome apps.
            if (typeof globalThis !== 'undefined') {
                return globalThis;
            }
            if (typeof self !== 'undefined') {
                return self;
            }
            if (typeof window !== 'undefined') {
                return window;
            }
            if (typeof commonjsGlobal !== 'undefined') {
                return commonjsGlobal;
            }
            throw new Error('unable to locate global object');
        }();
        // Expose the polyfill if Promise is undefined or set to a
        // non-function value. The latter can be due to a named HTMLElement
        // being exposed by browsers for legacy reasons.
        // https://github.com/taylorhakes/promise-polyfill/issues/114
        if (typeof globalNS['Promise'] === 'function') {
            promisePolyfill.exports = globalNS['Promise'];
            return;
        }
        /**
		 * @this {Promise}
		 */ function finallyConstructor(callback) {
            var constructor = this.constructor;
            return this.then(function(value) {
                // @ts-ignore
                return constructor.resolve(callback()).then(function() {
                    return value;
                });
            }, function(reason) {
                // @ts-ignore
                return constructor.resolve(callback()).then(function() {
                    // @ts-ignore
                    return constructor.reject(reason);
                });
            });
        }
        function allSettled(arr) {
            var P = this;
            return new P(function(resolve, reject) {
                if (!(arr && typeof arr.length !== 'undefined')) {
                    return reject(new TypeError(_typeof(arr) + ' ' + arr + ' is not iterable(cannot read property Symbol(Symbol.iterator))'));
                }
                var args = Array.prototype.slice.call(arr);
                if (args.length === 0) return resolve([]);
                var remaining = args.length;
                function res(i, val) {
                    if (val && (_typeof(val) === 'object' || typeof val === 'function')) {
                        var then = val.then;
                        if (typeof then === 'function') {
                            then.call(val, function(val) {
                                res(i, val);
                            }, function(e) {
                                args[i] = {
                                    status: 'rejected',
                                    reason: e
                                };
                                if (--remaining === 0) {
                                    resolve(args);
                                }
                            });
                            return;
                        }
                    }
                    args[i] = {
                        status: 'fulfilled',
                        value: val
                    };
                    if (--remaining === 0) {
                        resolve(args);
                    }
                }
                for(var i = 0; i < args.length; i++){
                    res(i, args[i]);
                }
            });
        }
        // Store setTimeout reference so promise-polyfill will be unaffected by
        // other code modifying setTimeout (like sinon.useFakeTimers())
        var setTimeoutFunc = setTimeout;
        function isArray(x) {
            return Boolean(x && typeof x.length !== 'undefined');
        }
        function noop() {}
        // Polyfill for Function.prototype.bind
        function bind(fn, thisArg) {
            return function() {
                fn.apply(thisArg, arguments);
            };
        }
        /**
		 * @constructor
		 * @param {Function} fn
		 */ function Promise1(fn) {
            if (!(this instanceof Promise1)) throw new TypeError('Promises must be constructed via new');
            if (typeof fn !== 'function') throw new TypeError('not a function');
            /** @type {!number} */ this._state = 0;
            /** @type {!boolean} */ this._handled = false;
            /** @type {Promise|undefined} */ this._value = undefined;
            /** @type {!Array<!Function>} */ this._deferreds = [];
            doResolve(fn, this);
        }
        function handle(self1, deferred) {
            while(self1._state === 3){
                self1 = self1._value;
            }
            if (self1._state === 0) {
                self1._deferreds.push(deferred);
                return;
            }
            self1._handled = true;
            Promise1._immediateFn(function() {
                var cb = self1._state === 1 ? deferred.onFulfilled : deferred.onRejected;
                if (cb === null) {
                    (self1._state === 1 ? resolve : reject)(deferred.promise, self1._value);
                    return;
                }
                var ret;
                try {
                    ret = cb(self1._value);
                } catch (e) {
                    reject(deferred.promise, e);
                    return;
                }
                resolve(deferred.promise, ret);
            });
        }
        function resolve(self1, newValue) {
            try {
                // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
                if (newValue === self1) throw new TypeError('A promise cannot be resolved with itself.');
                if (newValue && (_typeof(newValue) === 'object' || typeof newValue === 'function')) {
                    var then = newValue.then;
                    if (newValue instanceof Promise1) {
                        self1._state = 3;
                        self1._value = newValue;
                        finale(self1);
                        return;
                    } else if (typeof then === 'function') {
                        doResolve(bind(then, newValue), self1);
                        return;
                    }
                }
                self1._state = 1;
                self1._value = newValue;
                finale(self1);
            } catch (e) {
                reject(self1, e);
            }
        }
        function reject(self1, newValue) {
            self1._state = 2;
            self1._value = newValue;
            finale(self1);
        }
        function finale(self1) {
            if (self1._state === 2 && self1._deferreds.length === 0) {
                Promise1._immediateFn(function() {
                    if (!self1._handled) {
                        Promise1._unhandledRejectionFn(self1._value);
                    }
                });
            }
            for(var i = 0, len = self1._deferreds.length; i < len; i++){
                handle(self1, self1._deferreds[i]);
            }
            self1._deferreds = null;
        }
        /**
		 * @constructor
		 */ function Handler(onFulfilled, onRejected, promise) {
            this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
            this.onRejected = typeof onRejected === 'function' ? onRejected : null;
            this.promise = promise;
        }
        /**
		 * Take a potentially misbehaving resolver function and make sure
		 * onFulfilled and onRejected are only called once.
		 *
		 * Makes no guarantees about asynchrony.
		 */ function doResolve(fn, self1) {
            var done = false;
            try {
                fn(function(value) {
                    if (done) return;
                    done = true;
                    resolve(self1, value);
                }, function(reason) {
                    if (done) return;
                    done = true;
                    reject(self1, reason);
                });
            } catch (ex) {
                if (done) return;
                done = true;
                reject(self1, ex);
            }
        }
        Promise1.prototype['catch'] = function(onRejected) {
            return this.then(null, onRejected);
        };
        Promise1.prototype.then = function(onFulfilled, onRejected) {
            // @ts-ignore
            var prom = new this.constructor(noop);
            handle(this, new Handler(onFulfilled, onRejected, prom));
            return prom;
        };
        Promise1.prototype['finally'] = finallyConstructor;
        Promise1.all = function(arr) {
            return new Promise1(function(resolve, reject) {
                if (!isArray(arr)) {
                    return reject(new TypeError('Promise.all accepts an array'));
                }
                var args = Array.prototype.slice.call(arr);
                if (args.length === 0) return resolve([]);
                var remaining = args.length;
                function res(i, val) {
                    try {
                        if (val && (_typeof(val) === 'object' || typeof val === 'function')) {
                            var then = val.then;
                            if (typeof then === 'function') {
                                then.call(val, function(val) {
                                    res(i, val);
                                }, reject);
                                return;
                            }
                        }
                        args[i] = val;
                        if (--remaining === 0) {
                            resolve(args);
                        }
                    } catch (ex) {
                        reject(ex);
                    }
                }
                for(var i = 0; i < args.length; i++){
                    res(i, args[i]);
                }
            });
        };
        Promise1.allSettled = allSettled;
        Promise1.resolve = function(value) {
            if (value && _typeof(value) === 'object' && value.constructor === Promise1) {
                return value;
            }
            return new Promise1(function(resolve) {
                resolve(value);
            });
        };
        Promise1.reject = function(value) {
            return new Promise1(function(resolve, reject) {
                reject(value);
            });
        };
        Promise1.race = function(arr) {
            return new Promise1(function(resolve, reject) {
                if (!isArray(arr)) {
                    return reject(new TypeError('Promise.race accepts an array'));
                }
                for(var i = 0, len = arr.length; i < len; i++){
                    Promise1.resolve(arr[i]).then(resolve, reject);
                }
            });
        };
        // Use polyfill for setImmediate for performance gains
        Promise1._immediateFn = // @ts-ignore
        typeof setImmediate === 'function' && function(fn) {
            // @ts-ignore
            setImmediate(fn);
        } || function(fn) {
            setTimeoutFunc(fn, 0);
        };
        Promise1._unhandledRejectionFn = function _unhandledRejectionFn(err) {
            if (typeof console !== 'undefined' && console) {
                console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
            }
        };
        promisePolyfill.exports = Promise1;
    })();
    var _Promise = promisePolyfill.exports;
    // Register logging callbacks
    function registerLoggingCallbacks(obj) {
        var callbackNames = [
            'begin',
            'done',
            'log',
            'testStart',
            'testDone',
            'moduleStart',
            'moduleDone'
        ];
        function registerLoggingCallback(key) {
            return function loggingCallback(callback) {
                if (typeof callback !== 'function') {
                    throw new Error('Callback parameter must be a function');
                }
                config.callbacks[key].push(callback);
            };
        }
        for(var i = 0; i < callbackNames.length; i++){
            var key = callbackNames[i];
            // Initialize key collection of logging callback
            if (typeof config.callbacks[key] === 'undefined') {
                config.callbacks[key] = [];
            }
            obj[key] = registerLoggingCallback(key);
        }
    }
    function runLoggingCallbacks(key, args) {
        var callbacks = config.callbacks[key];
        // Handling 'log' callbacks separately. Unlike the other callbacks,
        // the log callback is not controlled by the processing queue,
        // but rather used by asserts. Hence to promisfy the 'log' callback
        // would mean promisfying each step of a test
        if (key === 'log') {
            callbacks.map(function(callback) {
                return callback(args);
            });
            return;
        }
        // ensure that each callback is executed serially
        var promiseChain = _Promise.resolve();
        callbacks.forEach(function(callback) {
            promiseChain = promiseChain.then(function() {
                return _Promise.resolve(callback(args));
            });
        });
        return promiseChain;
    }
    var priorityCount = 0;
    var unitSampler;
    // This is a queue of functions that are tasks within a single test.
    // After tests are dequeued from config.queue they are expanded into
    // a set of tasks in this queue.
    var taskQueue = [];
    /**
	 * Advances the taskQueue to the next task. If the taskQueue is empty,
	 * process the testQueue
	 */ function advance() {
        advanceTaskQueue();
        if (!taskQueue.length && !config.blocking && !config.current) {
            advanceTestQueue();
        }
    }
    /**
	 * Advances the taskQueue with an increased depth
	 */ function advanceTaskQueue() {
        var start = performance.now();
        config.depth = (config.depth || 0) + 1;
        processTaskQueue(start);
        config.depth--;
    }
    /**
	 * Process the first task on the taskQueue as a promise.
	 * Each task is a function added by Test#queue() in /src/test.js
	 */ function processTaskQueue(start) {
        if (taskQueue.length && !config.blocking) {
            var elapsedTime = performance.now() - start;
            // The updateRate ensures that a user interface (HTML Reporter) can be updated
            // at least once every second. This can also prevent browsers from prompting
            // a warning about long running scripts.
            if (!setTimeout$1 || config.updateRate <= 0 || elapsedTime < config.updateRate) {
                var task = taskQueue.shift();
                _Promise.resolve(task()).then(function() {
                    if (!taskQueue.length) {
                        advance();
                    } else {
                        processTaskQueue(start);
                    }
                });
            } else {
                setTimeout$1(advance);
            }
        }
    }
    /**
	 * Advance the testQueue to the next test to process. Call done() if testQueue completes.
	 */ function advanceTestQueue() {
        if (!config.blocking && !config.queue.length && config.depth === 0) {
            done();
            return;
        }
        var testTasks = config.queue.shift();
        addToTaskQueue(testTasks());
        if (priorityCount > 0) {
            priorityCount--;
        }
        advance();
    }
    /**
	 * Enqueue the tasks for a test into the task queue.
	 * @param {Array} tasksArray
	 */ function addToTaskQueue(tasksArray) {
        taskQueue.push.apply(taskQueue, _toConsumableArray(tasksArray));
    }
    /**
	 * Return the number of tasks remaining in the task queue to be processed.
	 * @return {number}
	 */ function taskQueueLength() {
        return taskQueue.length;
    }
    /**
	 * Adds a test to the TestQueue for execution.
	 * @param {Function} testTasksFunc
	 * @param {boolean} prioritize
	 * @param {string} seed
	 */ function addToTestQueue(testTasksFunc, prioritize, seed) {
        if (prioritize) {
            config.queue.splice(priorityCount++, 0, testTasksFunc);
        } else if (seed) {
            if (!unitSampler) {
                unitSampler = unitSamplerGenerator(seed);
            }
            // Insert into a random position after all prioritized items
            var index = Math.floor(unitSampler() * (config.queue.length - priorityCount + 1));
            config.queue.splice(priorityCount + index, 0, testTasksFunc);
        } else {
            config.queue.push(testTasksFunc);
        }
    }
    /**
	 * Creates a seeded "sample" generator which is used for randomizing tests.
	 */ function unitSamplerGenerator(seed) {
        // 32-bit xorshift, requires only a nonzero seed
        // https://excamera.com/sphinx/article-xorshift.html
        var sample = parseInt(generateHash(seed), 16) || -1;
        return function() {
            sample ^= sample << 13;
            sample ^= sample >>> 17;
            sample ^= sample << 5;
            // ECMAScript has no unsigned number type
            if (sample < 0) {
                sample += 0x100000000;
            }
            return sample / 0x100000000;
        };
    }
    /**
	 * This function is called when the ProcessingQueue is done processing all
	 * items. It handles emitting the final run events.
	 */ function done() {
        // We have reached the end of the processing queue and are about to emit the
        // "runEnd" event after which reporters typically stop listening and exit
        // the process. First, check if we need to emit one final test.
        if (config.stats.testCount === 0 && config.failOnZeroTests === true) {
            var error;
            if (config.filter && config.filter.length) {
                error = new Error("No tests matched the filter \"".concat(config.filter, "\"."));
            } else if (config.module && config.module.length) {
                error = new Error("No tests matched the module \"".concat(config.module, "\"."));
            } else if (config.moduleId && config.moduleId.length) {
                error = new Error("No tests matched the moduleId \"".concat(config.moduleId, "\"."));
            } else if (config.testId && config.testId.length) {
                error = new Error("No tests matched the testId \"".concat(config.testId, "\"."));
            } else {
                error = new Error('No tests were run.');
            }
            test('global failure', extend(function(assert) {
                assert.pushResult({
                    result: false,
                    message: error.message,
                    source: error.stack
                });
            }, {
                validTest: true
            }));
            // We do need to call `advance()` in order to resume the processing queue.
            // Once this new test is finished processing, we'll reach `done` again, and
            // that time the above condition will evaluate to false.
            advance();
            return;
        }
        var storage = config.storage;
        var runtime = Math.round(performance.now() - config.started);
        var passed = config.stats.all - config.stats.bad;
        ProcessingQueue.finished = true;
        emit('runEnd', runSuite.end(true));
        runLoggingCallbacks('done', {
            // @deprecated since 2.19.0 Use done() without `details` parameter,
            // or use `QUnit.on('runEnd')` instead. Parameter to be replaced in
            // QUnit 3.0 with test counts.
            passed: passed,
            failed: config.stats.bad,
            total: config.stats.all,
            runtime: runtime
        }).then(function() {
            // Clear own storage items if all tests passed
            if (storage && config.stats.bad === 0) {
                for(var i = storage.length - 1; i >= 0; i--){
                    var key = storage.key(i);
                    if (key.indexOf('qunit-test-') === 0) {
                        storage.removeItem(key);
                    }
                }
            }
        });
    }
    var ProcessingQueue = {
        finished: false,
        add: addToTestQueue,
        advance: advance,
        taskCount: taskQueueLength
    };
    var TestReport = /*#__PURE__*/ function() {
        function TestReport(name, suite, options) {
            _classCallCheck(this, TestReport);
            this.name = name;
            this.suiteName = suite.name;
            this.fullName = suite.fullName.concat(name);
            this.runtime = 0;
            this.assertions = [];
            this.skipped = !!options.skip;
            this.todo = !!options.todo;
            this.valid = options.valid;
            this._startTime = 0;
            this._endTime = 0;
            suite.pushTest(this);
        }
        _createClass(TestReport, [
            {
                key: "start",
                value: function start(recordTime) {
                    if (recordTime) {
                        this._startTime = performance.now();
                    }
                    return {
                        name: this.name,
                        suiteName: this.suiteName,
                        fullName: this.fullName.slice()
                    };
                }
            },
            {
                key: "end",
                value: function end(recordTime) {
                    if (recordTime) {
                        this._endTime = performance.now();
                    }
                    return extend(this.start(), {
                        runtime: this.getRuntime(),
                        status: this.getStatus(),
                        errors: this.getFailedAssertions(),
                        assertions: this.getAssertions()
                    });
                }
            },
            {
                key: "pushAssertion",
                value: function pushAssertion(assertion) {
                    this.assertions.push(assertion);
                }
            },
            {
                key: "getRuntime",
                value: function getRuntime() {
                    return Math.round(this._endTime - this._startTime);
                }
            },
            {
                key: "getStatus",
                value: function getStatus() {
                    if (this.skipped) {
                        return 'skipped';
                    }
                    var testPassed = this.getFailedAssertions().length > 0 ? this.todo : !this.todo;
                    if (!testPassed) {
                        return 'failed';
                    } else if (this.todo) {
                        return 'todo';
                    } else {
                        return 'passed';
                    }
                }
            },
            {
                key: "getFailedAssertions",
                value: function getFailedAssertions() {
                    return this.assertions.filter(function(assertion) {
                        return !assertion.passed;
                    });
                }
            },
            {
                key: "getAssertions",
                value: function getAssertions() {
                    return this.assertions.slice();
                }
            },
            {
                key: "slimAssertions",
                value: function slimAssertions() {
                    this.assertions = this.assertions.map(function(assertion) {
                        delete assertion.actual;
                        delete assertion.expected;
                        return assertion;
                    });
                }
            }
        ]);
        return TestReport;
    }();
    function Test(settings) {
        this.expected = null;
        this.assertions = [];
        this.module = config.currentModule;
        this.steps = [];
        this.timeout = undefined;
        this.data = undefined;
        this.withData = false;
        this.pauses = new StringMap();
        this.nextPauseId = 1;
        // For the most common case, we have:
        // - 0: new Test
        // - 1: addTest
        // - 2: QUnit.test
        // - 3: user file
        //
        // This needs is customised by test.each()
        this.stackOffset = 3;
        extend(this, settings);
        // If a module is skipped, all its tests and the tests of the child suites
        // should be treated as skipped even if they are defined as `only` or `todo`.
        // As for `todo` module, all its tests will be treated as `todo` except for
        // tests defined as `skip` which will be left intact.
        //
        // So, if a test is defined as `todo` and is inside a skipped module, we should
        // then treat that test as if was defined as `skip`.
        if (this.module.skip) {
            this.skip = true;
            this.todo = false;
        // Skipped tests should be left intact
        } else if (this.module.todo && !this.skip) {
            this.todo = true;
        }
        // Queuing a late test after the run has ended is not allowed.
        // This was once supported for internal use by QUnit.onError().
        // Ref https://github.com/qunitjs/qunit/issues/1377
        if (ProcessingQueue.finished) {
            // Using this for anything other than onError(), such as testing in QUnit.done(),
            // is unstable and will likely result in the added tests being ignored by CI.
            // (Meaning the CI passes irregardless of the added tests).
            //
            // TODO: Make this an error in QUnit 3.0
            // throw new Error( "Unexpected test after runEnd" );
            Logger.warn('Unexpected test after runEnd. This is unstable and will fail in QUnit 3.0.');
            return;
        }
        if (!this.skip && typeof this.callback !== 'function') {
            var method = this.todo ? 'QUnit.todo' : 'QUnit.test';
            throw new TypeError("You must provide a callback to ".concat(method, "(\"").concat(this.testName, "\")"));
        }
        // Register unique strings
        for(var i = 0, l = this.module.tests; i < l.length; i++){
            if (this.module.tests[i].name === this.testName) {
                this.testName += ' ';
            }
        }
        this.testId = generateHash(this.module.name, this.testName);
        // No validation after this. Beyond this point, failures must be recorded as
        // a completed test with errors, instead of early bail out.
        // Otherwise, internals may be left in an inconsistent state.
        // Ref https://github.com/qunitjs/qunit/issues/1514
        ++Test.count;
        this.errorForStack = new Error();
        if (this.callback && this.callback.validTest) {
            // Omit the test-level trace for the internal "No tests" test failure,
            // There is already an assertion-level trace, and that's noisy enough
            // as it is.
            this.errorForStack.stack = undefined;
        }
        this.testReport = new TestReport(this.testName, this.module.suiteReport, {
            todo: this.todo,
            skip: this.skip,
            valid: this.valid()
        });
        this.module.tests.push({
            name: this.testName,
            testId: this.testId,
            skip: !!this.skip
        });
        if (this.skip) {
            // Skipped tests will fully ignore any sent callback
            this.callback = function() {};
            this.async = false;
            this.expected = 0;
        } else {
            this.assert = new Assert(this);
        }
    }
    Test.count = 0;
    function getNotStartedModules(startModule) {
        var module1 = startModule;
        var modules = [];
        while(module1 && module1.testsRun === 0){
            modules.push(module1);
            module1 = module1.parentModule;
        }
        // The above push modules from the child to the parent
        // return a reversed order with the top being the top most parent module
        return modules.reverse();
    }
    Test.prototype = {
        // Use a getter to avoid computing a stack trace (which can be expensive),
        // This is displayed by the HTML Reporter, but most other integrations do
        // not access it.
        get stack () {
            return extractStacktrace(this.errorForStack, this.stackOffset);
        },
        before: function before() {
            var _this = this;
            var module1 = this.module;
            var notStartedModules = getNotStartedModules(module1);
            // ensure the callbacks are executed serially for each module
            var moduleStartChain = _Promise.resolve();
            notStartedModules.forEach(function(startModule) {
                moduleStartChain = moduleStartChain.then(function() {
                    startModule.stats = {
                        all: 0,
                        bad: 0,
                        started: performance.now()
                    };
                    emit('suiteStart', startModule.suiteReport.start(true));
                    return runLoggingCallbacks('moduleStart', {
                        name: startModule.name,
                        tests: startModule.tests
                    });
                });
            });
            return moduleStartChain.then(function() {
                config.current = _this;
                _this.testEnvironment = extend({}, module1.testEnvironment);
                _this.started = performance.now();
                emit('testStart', _this.testReport.start(true));
                return runLoggingCallbacks('testStart', {
                    name: _this.testName,
                    module: module1.name,
                    testId: _this.testId,
                    previousFailure: _this.previousFailure
                }).then(function() {
                    if (!config.pollution) {
                        saveGlobal();
                    }
                });
            });
        },
        run: function run() {
            config.current = this;
            if (config.notrycatch) {
                runTest(this);
                return;
            }
            try {
                runTest(this);
            } catch (e) {
                this.pushFailure('Died on test #' + (this.assertions.length + 1) + ': ' + (e.message || e) + '\n' + this.stack, extractStacktrace(e, 0));
                // Else next test will carry the responsibility
                saveGlobal();
                // Restart the tests if they're blocking
                if (config.blocking) {
                    internalRecover(this);
                }
            }
            function runTest(test) {
                var promise;
                if (test.withData) {
                    promise = test.callback.call(test.testEnvironment, test.assert, test.data);
                } else {
                    promise = test.callback.call(test.testEnvironment, test.assert);
                }
                test.resolvePromise(promise);
                // If the test has an async "pause" on it, but the timeout is 0, then we push a
                // failure as the test should be synchronous.
                if (test.timeout === 0 && test.pauses.size > 0) {
                    pushFailure('Test did not finish synchronously even though assert.timeout( 0 ) was used.', sourceFromStacktrace(2));
                }
            }
        },
        after: function after() {
            checkPollution();
        },
        queueGlobalHook: function queueGlobalHook(hook, hookName) {
            var _this2 = this;
            var runHook = function runHook() {
                config.current = _this2;
                var promise;
                if (config.notrycatch) {
                    promise = hook.call(_this2.testEnvironment, _this2.assert);
                } else {
                    try {
                        promise = hook.call(_this2.testEnvironment, _this2.assert);
                    } catch (error) {
                        _this2.pushFailure('Global ' + hookName + ' failed on ' + _this2.testName + ': ' + errorString(error), extractStacktrace(error, 0));
                        return;
                    }
                }
                _this2.resolvePromise(promise, hookName);
            };
            return runHook;
        },
        queueHook: function queueHook(hook, hookName, hookOwner) {
            var _this3 = this;
            var callHook = function callHook() {
                var promise = hook.call(_this3.testEnvironment, _this3.assert);
                _this3.resolvePromise(promise, hookName);
            };
            var runHook = function runHook() {
                if (hookName === 'before') {
                    if (hookOwner.testsRun !== 0) {
                        return;
                    }
                    _this3.preserveEnvironment = true;
                }
                // The 'after' hook should only execute when there are not tests left and
                // when the 'after' and 'finish' tasks are the only tasks left to process
                if (hookName === 'after' && !lastTestWithinModuleExecuted(hookOwner) && (config.queue.length > 0 || ProcessingQueue.taskCount() > 2)) {
                    return;
                }
                config.current = _this3;
                if (config.notrycatch) {
                    callHook();
                    return;
                }
                try {
                    // This try-block includes the indirect call to resolvePromise, which shouldn't
                    // have to be inside try-catch. But, since we support any user-provided thenable
                    // object, the thenable might throw in some unexpected way.
                    // This subtle behaviour is undocumented. To avoid new failures in minor releases
                    // we will not change this until QUnit 3.
                    // TODO: In QUnit 3, reduce this try-block to just hook.call(), matching
                    // the simplicity of queueGlobalHook.
                    callHook();
                } catch (error) {
                    _this3.pushFailure(hookName + ' failed on ' + _this3.testName + ': ' + (error.message || error), extractStacktrace(error, 0));
                }
            };
            return runHook;
        },
        // Currently only used for module level hooks, can be used to add global level ones
        hooks: function hooks(handler) {
            var hooks = [];
            function processGlobalhooks(test) {
                if ((handler === 'beforeEach' || handler === 'afterEach') && config.globalHooks[handler]) {
                    for(var i = 0; i < config.globalHooks[handler].length; i++){
                        hooks.push(test.queueGlobalHook(config.globalHooks[handler][i], handler));
                    }
                }
            }
            function processHooks(test, module1) {
                if (module1.parentModule) {
                    processHooks(test, module1.parentModule);
                }
                if (module1.hooks[handler].length) {
                    for(var i = 0; i < module1.hooks[handler].length; i++){
                        hooks.push(test.queueHook(module1.hooks[handler][i], handler, module1));
                    }
                }
            }
            // Hooks are ignored on skipped tests
            if (!this.skip) {
                processGlobalhooks(this);
                processHooks(this, this.module);
            }
            return hooks;
        },
        finish: function finish() {
            config.current = this;
            // Release the timeout and timeout callback references to be garbage collected.
            // https://github.com/qunitjs/qunit/pull/1708
            if (setTimeout$1) {
                clearTimeout(this.timeout);
                config.timeoutHandler = null;
            }
            // Release the test callback to ensure that anything referenced has been
            // released to be garbage collected.
            this.callback = undefined;
            if (this.steps.length) {
                var stepsList = this.steps.join(', ');
                this.pushFailure('Expected assert.verifySteps() to be called before end of test ' + "after using assert.step(). Unverified steps: ".concat(stepsList), this.stack);
            }
            if (config.requireExpects && this.expected === null) {
                this.pushFailure('Expected number of assertions to be defined, but expect() was ' + 'not called.', this.stack);
            } else if (this.expected !== null && this.expected !== this.assertions.length) {
                this.pushFailure('Expected ' + this.expected + ' assertions, but ' + this.assertions.length + ' were run', this.stack);
            } else if (this.expected === null && !this.assertions.length) {
                this.pushFailure('Expected at least one assertion, but none were run - call ' + 'expect(0) to accept zero assertions.', this.stack);
            }
            var module1 = this.module;
            var moduleName = module1.name;
            var testName = this.testName;
            var skipped = !!this.skip;
            var todo = !!this.todo;
            var bad = 0;
            var storage = config.storage;
            this.runtime = Math.round(performance.now() - this.started);
            config.stats.all += this.assertions.length;
            config.stats.testCount += 1;
            module1.stats.all += this.assertions.length;
            for(var i = 0; i < this.assertions.length; i++){
                // A failing assertion will counts toward the HTML Reporter's
                // "X assertions, Y failed" line even if it was inside a todo.
                // Inverting this would be similarly confusing since all but the last
                // passing assertion inside a todo test should be considered as good.
                // These stats don't decide the outcome of anything, so counting them
                // as failing seems the most intuitive.
                if (!this.assertions[i].result) {
                    bad++;
                    config.stats.bad++;
                    module1.stats.bad++;
                }
            }
            if (skipped) {
                incrementTestsIgnored(module1);
            } else {
                incrementTestsRun(module1);
            }
            // Store result when possible.
            // Note that this also marks todo tests as bad, thus they get hoisted,
            // and always run first on refresh.
            if (storage) {
                if (bad) {
                    storage.setItem('qunit-test-' + moduleName + '-' + testName, bad);
                } else {
                    storage.removeItem('qunit-test-' + moduleName + '-' + testName);
                }
            }
            // After emitting the js-reporters event we cleanup the assertion data to
            // avoid leaking it. It is not used by the legacy testDone callbacks.
            emit('testEnd', this.testReport.end(true));
            this.testReport.slimAssertions();
            var test = this;
            return runLoggingCallbacks('testDone', {
                name: testName,
                module: moduleName,
                skipped: skipped,
                todo: todo,
                failed: bad,
                passed: this.assertions.length - bad,
                total: this.assertions.length,
                runtime: skipped ? 0 : this.runtime,
                // HTML Reporter use
                assertions: this.assertions,
                testId: this.testId,
                // Source of Test
                // generating stack trace is expensive, so using a getter will help defer this until we need it
                get source () {
                    return test.stack;
                }
            }).then(function() {
                if (allTestsExecuted(module1)) {
                    var completedModules = [
                        module1
                    ];
                    // Check if the parent modules, iteratively, are done. If that the case,
                    // we emit the `suiteEnd` event and trigger `moduleDone` callback.
                    var parent = module1.parentModule;
                    while(parent && allTestsExecuted(parent)){
                        completedModules.push(parent);
                        parent = parent.parentModule;
                    }
                    var moduleDoneChain = _Promise.resolve();
                    completedModules.forEach(function(completedModule) {
                        moduleDoneChain = moduleDoneChain.then(function() {
                            return logSuiteEnd(completedModule);
                        });
                    });
                    return moduleDoneChain;
                }
            }).then(function() {
                config.current = undefined;
            });
            function logSuiteEnd(module1) {
                // Reset `module.hooks` to ensure that anything referenced in these hooks
                // has been released to be garbage collected. Descendant modules that were
                // entirely skipped, e.g. due to filtering, will never have this method
                // called for them, but might have hooks with references pinning data in
                // memory (even if the hooks weren't actually executed), so we reset the
                // hooks on all descendant modules here as well. This is safe because we
                // will never call this as long as any descendant modules still have tests
                // to run. This also means that in multi-tiered nesting scenarios we might
                // reset the hooks multiple times on some modules, but that's harmless.
                var modules = [
                    module1
                ];
                while(modules.length){
                    var nextModule = modules.shift();
                    nextModule.hooks = {};
                    modules.push.apply(modules, _toConsumableArray(nextModule.childModules));
                }
                emit('suiteEnd', module1.suiteReport.end(true));
                return runLoggingCallbacks('moduleDone', {
                    name: module1.name,
                    tests: module1.tests,
                    failed: module1.stats.bad,
                    passed: module1.stats.all - module1.stats.bad,
                    total: module1.stats.all,
                    runtime: Math.round(performance.now() - module1.stats.started)
                });
            }
        },
        preserveTestEnvironment: function preserveTestEnvironment() {
            if (this.preserveEnvironment) {
                this.module.testEnvironment = this.testEnvironment;
                this.testEnvironment = extend({}, this.module.testEnvironment);
            }
        },
        queue: function queue() {
            var test = this;
            if (!this.valid()) {
                incrementTestsIgnored(this.module);
                return;
            }
            function runTest() {
                return [
                    function() {
                        return test.before();
                    }
                ].concat(_toConsumableArray(test.hooks('before')), [
                    function() {
                        test.preserveTestEnvironment();
                    }
                ], _toConsumableArray(test.hooks('beforeEach')), [
                    function() {
                        test.run();
                    }
                ], _toConsumableArray(test.hooks('afterEach').reverse()), _toConsumableArray(test.hooks('after').reverse()), [
                    function() {
                        test.after();
                    },
                    function() {
                        return test.finish();
                    }
                ]);
            }
            var previousFailCount = config.storage && +config.storage.getItem('qunit-test-' + this.module.name + '-' + this.testName);
            // Prioritize previously failed tests, detected from storage
            var prioritize = config.reorder && !!previousFailCount;
            this.previousFailure = !!previousFailCount;
            ProcessingQueue.add(runTest, prioritize, config.seed);
        },
        pushResult: function pushResult(resultInfo) {
            if (this !== config.current) {
                var message = resultInfo && resultInfo.message || '';
                var testName = this && this.testName || '';
                var error = 'Assertion occurred after test finished.\n' + '> Test: ' + testName + '\n' + '> Message: ' + message + '\n';
                throw new Error(error);
            }
            // Destructure of resultInfo = { result, actual, expected, message, negative }
            var details = {
                module: this.module.name,
                name: this.testName,
                result: resultInfo.result,
                message: resultInfo.message,
                actual: resultInfo.actual,
                testId: this.testId,
                negative: resultInfo.negative || false,
                runtime: Math.round(performance.now() - this.started),
                todo: !!this.todo
            };
            if (hasOwn$1.call(resultInfo, 'expected')) {
                details.expected = resultInfo.expected;
            }
            if (!resultInfo.result) {
                var source = resultInfo.source || sourceFromStacktrace();
                if (source) {
                    details.source = source;
                }
            }
            this.logAssertion(details);
            this.assertions.push({
                result: !!resultInfo.result,
                message: resultInfo.message
            });
        },
        pushFailure: function pushFailure(message, source, actual) {
            if (!(this instanceof Test)) {
                throw new Error('pushFailure() assertion outside test context, was ' + sourceFromStacktrace(2));
            }
            this.pushResult({
                result: false,
                message: message || 'error',
                actual: actual || null,
                source: source
            });
        },
        /**
		 * Log assertion details using both the old QUnit.log interface and
		 * QUnit.on( "assertion" ) interface.
		 *
		 * @private
		 */ logAssertion: function logAssertion(details) {
            runLoggingCallbacks('log', details);
            var assertion = {
                passed: details.result,
                actual: details.actual,
                expected: details.expected,
                message: details.message,
                stack: details.source,
                todo: details.todo
            };
            this.testReport.pushAssertion(assertion);
            emit('assertion', assertion);
        },
        /**
		 * Reset config.timeout with a new timeout duration.
		 *
		 * @param {number} timeoutDuration
		 */ internalResetTimeout: function internalResetTimeout(timeoutDuration) {
            clearTimeout(config.timeout);
            config.timeout = setTimeout$1(config.timeoutHandler(timeoutDuration), timeoutDuration);
        },
        /**
		 * Create a new async pause and return a new function that can release the pause.
		 *
		 * This mechanism is internally used by:
		 *
		 * - explicit async pauses, created by calling `assert.async()`,
		 * - implicit async pauses, created when `QUnit.test()` or module hook callbacks
		 *   use async-await or otherwise return a Promise.
		 *
		 * Happy scenario:
		 *
		 * - Pause is created by calling internalStop().
		 *
		 *   Pause is released normally by invoking release() during the same test.
		 *
		 *   The release() callback lets internal processing resume.
		 *
		 * Failure scenarios:
		 *
		 * - The test fails due to an uncaught exception.
		 *
		 *   In this case, Test.run() will call internalRecover() which empties the clears all
		 *   async pauses and sets the cancelled flag, which means we silently ignore any
		 *   late calls to the resume() callback, as we will have moved on to a different
		 *   test by then, and we don't want to cause an extra "release during a different test"
		 *   errors that the developer isn't really responsible for. This can happen when a test
		 *   correctly schedules a call to release(), but also causes an uncaught error. The
		 *   uncaught error means we will no longer wait for the release (as it might not arrive).
		 *
		 * - Pause is never released, or called an insufficient number of times.
		 *
		 *   Our timeout handler will kill the pause and resume test processing, basically
		 *   like internalRecover(), but for one pause instead of any/all.
		 *
		 *   Here, too, any late calls to resume() will be silently ignored to avoid
		 *   extra errors. We tolerate this since the original test will have already been
		 *   marked as failure.
		 *
		 *   TODO: QUnit 3 will enable timeouts by default <https://github.com/qunitjs/qunit/issues/1483>,
		 *   but right now a test will hang indefinitely if async pauses are not released,
		 *   unless QUnit.config.testTimeout or assert.timeout() is used.
		 *
		 * - Pause is spontaneously released during a different test,
		 *   or when no test is currently running.
		 *
		 *   This is close to impossible because this error only happens if the original test
		 *   succesfully finished first (since other failure scenarios kill pauses and ignore
		 *   late calls). It can happen if a test ended exactly as expected, but has some
		 *   external or shared state continuing to hold a reference to the release callback,
		 *   and either the same test scheduled another call to it in the future, or a later test
		 *   causes it to be called through some shared state.
		 *
		 * - Pause release() is called too often, during the same test.
		 *
		 *   This simply throws an error, after which uncaught error handling picks it up
		 *   and processing resumes.
		 *
		 * @param {number} [requiredCalls=1]
		 */ internalStop: function internalStop() {
            var requiredCalls = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
            config.blocking = true;
            var test = this;
            var pauseId = this.nextPauseId++;
            var pause = {
                cancelled: false,
                remaining: requiredCalls
            };
            test.pauses.set(pauseId, pause);
            function release() {
                if (pause.cancelled) {
                    return;
                }
                if (config.current === undefined) {
                    throw new Error('Unexpected release of async pause after tests finished.\n' + "> Test: ".concat(test.testName, " [async #").concat(pauseId, "]"));
                }
                if (config.current !== test) {
                    throw new Error('Unexpected release of async pause during a different test.\n' + "> Test: ".concat(test.testName, " [async #").concat(pauseId, "]"));
                }
                if (pause.remaining <= 0) {
                    throw new Error('Tried to release async pause that was already released.\n' + "> Test: ".concat(test.testName, " [async #").concat(pauseId, "]"));
                }
                // The `requiredCalls` parameter exists to support `assert.async(count)`
                pause.remaining--;
                if (pause.remaining === 0) {
                    test.pauses.delete(pauseId);
                }
                internalStart(test);
            }
            // Set a recovery timeout, if so configured.
            if (setTimeout$1) {
                var timeoutDuration;
                if (typeof test.timeout === 'number') {
                    timeoutDuration = test.timeout;
                } else if (typeof config.testTimeout === 'number') {
                    timeoutDuration = config.testTimeout;
                }
                if (typeof timeoutDuration === 'number' && timeoutDuration > 0) {
                    config.timeoutHandler = function(timeout) {
                        return function() {
                            config.timeout = null;
                            pause.cancelled = true;
                            test.pauses.delete(pauseId);
                            test.pushFailure("Test took longer than ".concat(timeout, "ms; test timed out."), sourceFromStacktrace(2));
                            internalStart(test);
                        };
                    };
                    clearTimeout(config.timeout);
                    config.timeout = setTimeout$1(config.timeoutHandler(timeoutDuration), timeoutDuration);
                }
            }
            return release;
        },
        resolvePromise: function resolvePromise(promise, phase) {
            if (promise != null) {
                var _test = this;
                var then = promise.then;
                if (typeof then === 'function') {
                    var resume = _test.internalStop();
                    var resolve = function resolve() {
                        resume();
                    };
                    if (config.notrycatch) {
                        then.call(promise, resolve);
                    } else {
                        var reject = function reject(error) {
                            var message = 'Promise rejected ' + (!phase ? 'during' : phase.replace(/Each$/, '')) + ' "' + _test.testName + '": ' + (error && error.message || error);
                            _test.pushFailure(message, extractStacktrace(error, 0));
                            // Else next test will carry the responsibility
                            saveGlobal();
                            // Unblock
                            internalRecover(_test);
                        };
                        then.call(promise, resolve, reject);
                    }
                }
            }
        },
        valid: function valid() {
            // Internally-generated tests are always valid
            if (this.callback && this.callback.validTest) {
                return true;
            }
            function moduleChainIdMatch(testModule, selectedId) {
                return(// undefined or empty array
                !selectedId || !selectedId.length || inArray(testModule.moduleId, selectedId) || testModule.parentModule && moduleChainIdMatch(testModule.parentModule, selectedId));
            }
            if (!moduleChainIdMatch(this.module, config.moduleId)) {
                return false;
            }
            if (config.testId && config.testId.length && !inArray(this.testId, config.testId)) {
                return false;
            }
            function moduleChainNameMatch(testModule, selectedModule) {
                if (!selectedModule) {
                    // undefined or empty string
                    return true;
                }
                var testModuleName = testModule.name ? testModule.name.toLowerCase() : null;
                if (testModuleName === selectedModule) {
                    return true;
                } else if (testModule.parentModule) {
                    return moduleChainNameMatch(testModule.parentModule, selectedModule);
                } else {
                    return false;
                }
            }
            var selectedModule = config.module && config.module.toLowerCase();
            if (!moduleChainNameMatch(this.module, selectedModule)) {
                return false;
            }
            var filter = config.filter;
            if (!filter) {
                return true;
            }
            var regexFilter = /^(!?)\/([\w\W]*)\/(i?$)/.exec(filter);
            var fullName = this.module.name + ': ' + this.testName;
            return regexFilter ? this.regexFilter(!!regexFilter[1], regexFilter[2], regexFilter[3], fullName) : this.stringFilter(filter, fullName);
        },
        regexFilter: function regexFilter(exclude, pattern, flags, fullName) {
            var regex = new RegExp(pattern, flags);
            var match = regex.test(fullName);
            return match !== exclude;
        },
        stringFilter: function stringFilter(filter, fullName) {
            filter = filter.toLowerCase();
            fullName = fullName.toLowerCase();
            var include = filter.charAt(0) !== '!';
            if (!include) {
                filter = filter.slice(1);
            }
            // If the filter matches, we need to honour include
            if (fullName.indexOf(filter) !== -1) {
                return include;
            }
            // Otherwise, do the opposite
            return !include;
        }
    };
    function pushFailure() {
        if (!config.current) {
            throw new Error('pushFailure() assertion outside test context, in ' + sourceFromStacktrace(2));
        }
        // Gets current test obj
        var currentTest = config.current;
        return currentTest.pushFailure.apply(currentTest, arguments);
    }
    function saveGlobal() {
        config.pollution = [];
        if (config.noglobals) {
            for(var key in g){
                if (hasOwn$1.call(g, key)) {
                    // In Opera sometimes DOM element ids show up here, ignore them
                    if (/^qunit-test-output/.test(key)) {
                        continue;
                    }
                    config.pollution.push(key);
                }
            }
        }
    }
    function checkPollution() {
        var old = config.pollution;
        saveGlobal();
        var newGlobals = diff(config.pollution, old);
        if (newGlobals.length > 0) {
            pushFailure('Introduced global variable(s): ' + newGlobals.join(', '));
        }
        var deletedGlobals = diff(old, config.pollution);
        if (deletedGlobals.length > 0) {
            pushFailure('Deleted global variable(s): ' + deletedGlobals.join(', '));
        }
    }
    var focused = false; // indicates that the "only" filter was used
    function addTest(settings) {
        if (focused || config.currentModule.ignored) {
            return;
        }
        var newTest = new Test(settings);
        newTest.queue();
    }
    function addOnlyTest(settings) {
        if (config.currentModule.ignored) {
            return;
        }
        if (!focused) {
            config.queue.length = 0;
            focused = true;
        }
        var newTest = new Test(settings);
        newTest.queue();
    }
    // Will be exposed as QUnit.test
    function test(testName, callback) {
        addTest({
            testName: testName,
            callback: callback
        });
    }
    function makeEachTestName(testName, argument) {
        return "".concat(testName, " [").concat(argument, "]");
    }
    function runEach(data, eachFn) {
        if (Array.isArray(data)) {
            for(var i = 0; i < data.length; i++){
                eachFn(data[i], i);
            }
        } else if (_typeof(data) === 'object' && data !== null) {
            for(var key in data){
                eachFn(data[key], key);
            }
        } else {
            throw new Error("test.each() expects an array or object as input, but\nfound ".concat(_typeof(data), " instead."));
        }
    }
    extend(test, {
        todo: function todo(testName, callback) {
            addTest({
                testName: testName,
                callback: callback,
                todo: true
            });
        },
        skip: function skip(testName) {
            addTest({
                testName: testName,
                skip: true
            });
        },
        only: function only(testName, callback) {
            addOnlyTest({
                testName: testName,
                callback: callback
            });
        },
        each: function each(testName, dataset, callback) {
            runEach(dataset, function(data, testKey) {
                addTest({
                    testName: makeEachTestName(testName, testKey),
                    callback: callback,
                    withData: true,
                    stackOffset: 5,
                    data: data
                });
            });
        }
    });
    test.todo.each = function(testName, dataset, callback) {
        runEach(dataset, function(data, testKey) {
            addTest({
                testName: makeEachTestName(testName, testKey),
                callback: callback,
                todo: true,
                withData: true,
                stackOffset: 5,
                data: data
            });
        });
    };
    test.skip.each = function(testName, dataset) {
        runEach(dataset, function(_, testKey) {
            addTest({
                testName: makeEachTestName(testName, testKey),
                stackOffset: 5,
                skip: true
            });
        });
    };
    test.only.each = function(testName, dataset, callback) {
        runEach(dataset, function(data, testKey) {
            addOnlyTest({
                testName: makeEachTestName(testName, testKey),
                callback: callback,
                withData: true,
                stackOffset: 5,
                data: data
            });
        });
    };
    // Forcefully release all processing holds.
    function internalRecover(test) {
        test.pauses.forEach(function(pause) {
            pause.cancelled = true;
        });
        test.pauses.clear();
        internalStart(test);
    }
    // Release a processing hold, scheduling a resumption attempt if no holds remain.
    function internalStart(test) {
        // Ignore if other async pauses still exist.
        if (test.pauses.size > 0) {
            return;
        }
        // Add a slight delay to allow more assertions etc.
        if (setTimeout$1) {
            clearTimeout(config.timeout);
            config.timeout = setTimeout$1(function() {
                if (test.pauses.size > 0) {
                    return;
                }
                clearTimeout(config.timeout);
                config.timeout = null;
                config.blocking = false;
                ProcessingQueue.advance();
            });
        } else {
            config.blocking = false;
            ProcessingQueue.advance();
        }
    }
    function collectTests(module1) {
        var tests = [].concat(module1.tests);
        var modules = _toConsumableArray(module1.childModules);
        // Do a breadth-first traversal of the child modules
        while(modules.length){
            var nextModule = modules.shift();
            tests.push.apply(tests, nextModule.tests);
            modules.push.apply(modules, _toConsumableArray(nextModule.childModules));
        }
        return tests;
    }
    // This returns true after all executable and skippable tests
    // in a module have been proccessed, and informs 'suiteEnd'
    // and moduleDone().
    function allTestsExecuted(module1) {
        return module1.testsRun + module1.testsIgnored === collectTests(module1).length;
    }
    // This returns true during the last executable non-skipped test
    // within a module, and informs the running of the 'after' hook
    // for a given module. This runs only once for a given module,
    // but must run during the last non-skipped test. When it runs,
    // there may be non-zero skipped tests left.
    function lastTestWithinModuleExecuted(module1) {
        return module1.testsRun === collectTests(module1).filter(function(test) {
            return !test.skip;
        }).length - 1;
    }
    function incrementTestsRun(module1) {
        module1.testsRun++;
        while(module1 = module1.parentModule){
            module1.testsRun++;
        }
    }
    function incrementTestsIgnored(module1) {
        module1.testsIgnored++;
        while(module1 = module1.parentModule){
            module1.testsIgnored++;
        }
    }
    /* global module, exports, define */ function exportQUnit(QUnit) {
        var exportedModule = false;
        if (window$1 && document) {
            // QUnit may be defined when it is preconfigured but then only QUnit and QUnit.config may be defined.
            if (window$1.QUnit && window$1.QUnit.version) {
                throw new Error('QUnit has already been defined.');
            }
            window$1.QUnit = QUnit;
            exportedModule = true;
        }
        // For Node.js
        if (typeof module !== 'undefined' && module && module.exports) {
            module.exports = QUnit;
            // For consistency with CommonJS environments' exports
            module.exports.QUnit = QUnit;
            exportedModule = true;
        }
        // For CommonJS with exports, but without module.exports, like Rhino
        if (typeof exports !== 'undefined' && exports) {
            exports.QUnit = QUnit;
            exportedModule = true;
        }
        // For AMD
        if (typeof define === 'function' && define.amd) {
            define(function() {
                return QUnit;
            });
            QUnit.config.autostart = false;
            exportedModule = true;
        }
        // For other environments, including Web Workers (globalThis === self),
        // SpiderMonkey (mozjs), and other embedded JavaScript engines
        if (!exportedModule) {
            g.QUnit = QUnit;
        }
    }
    var ConsoleReporter = /*#__PURE__*/ function() {
        function ConsoleReporter(runner) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            _classCallCheck(this, ConsoleReporter);
            // Cache references to console methods to ensure we can report failures
            // from tests tests that mock the console object itself.
            // https://github.com/qunitjs/qunit/issues/1340
            // Support IE 9: Function#bind is supported, but no console.log.bind().
            this.log = options.log || Function.prototype.bind.call(console$1.log, console$1);
            runner.on('error', this.onError.bind(this));
            runner.on('runStart', this.onRunStart.bind(this));
            runner.on('testStart', this.onTestStart.bind(this));
            runner.on('testEnd', this.onTestEnd.bind(this));
            runner.on('runEnd', this.onRunEnd.bind(this));
        }
        _createClass(ConsoleReporter, [
            {
                key: "onError",
                value: function onError(error) {
                    this.log('error', error);
                }
            },
            {
                key: "onRunStart",
                value: function onRunStart(runStart) {
                    this.log('runStart', runStart);
                }
            },
            {
                key: "onTestStart",
                value: function onTestStart(test) {
                    this.log('testStart', test);
                }
            },
            {
                key: "onTestEnd",
                value: function onTestEnd(test) {
                    this.log('testEnd', test);
                }
            },
            {
                key: "onRunEnd",
                value: function onRunEnd(runEnd) {
                    this.log('runEnd', runEnd);
                }
            }
        ], [
            {
                key: "init",
                value: function init(runner, options) {
                    return new ConsoleReporter(runner, options);
                }
            }
        ]);
        return ConsoleReporter;
    }();
    // TODO: Consider using globalThis instead of window, so that the reporter
    // works for Node.js as well. As this can add overhead, we should make
    // this opt-in before we enable it for CLI.
    //
    // QUnit 3 will switch from `window` to `globalThis` and then make it
    // no longer an implicit feature of the HTML Reporter, but rather let
    // it be opt-in via `QUnit.config.reporters = ['perf']` or something
    // like that.
    var nativePerf = window$1 && typeof window$1.performance !== 'undefined' && // eslint-disable-next-line compat/compat -- Checked
    typeof window$1.performance.mark === 'function' && // eslint-disable-next-line compat/compat -- Checked
    typeof window$1.performance.measure === 'function' ? window$1.performance : undefined;
    var perf = {
        measure: nativePerf ? function(comment, startMark, endMark) {
            // `performance.measure` may fail if the mark could not be found.
            // reasons a specific mark could not be found include: outside code invoking `performance.clearMarks()`
            try {
                nativePerf.measure(comment, startMark, endMark);
            } catch (ex) {
                Logger.warn('performance.measure could not be executed because of ', ex.message);
            }
        } : function() {},
        mark: nativePerf ? nativePerf.mark.bind(nativePerf) : function() {}
    };
    var PerfReporter = /*#__PURE__*/ function() {
        function PerfReporter(runner) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            _classCallCheck(this, PerfReporter);
            this.perf = options.perf || perf;
            runner.on('runStart', this.onRunStart.bind(this));
            runner.on('runEnd', this.onRunEnd.bind(this));
            runner.on('suiteStart', this.onSuiteStart.bind(this));
            runner.on('suiteEnd', this.onSuiteEnd.bind(this));
            runner.on('testStart', this.onTestStart.bind(this));
            runner.on('testEnd', this.onTestEnd.bind(this));
        }
        _createClass(PerfReporter, [
            {
                key: "onRunStart",
                value: function onRunStart() {
                    this.perf.mark('qunit_suite_0_start');
                }
            },
            {
                key: "onSuiteStart",
                value: function onSuiteStart(suiteStart) {
                    var suiteLevel = suiteStart.fullName.length;
                    this.perf.mark("qunit_suite_".concat(suiteLevel, "_start"));
                }
            },
            {
                key: "onSuiteEnd",
                value: function onSuiteEnd(suiteEnd) {
                    var suiteLevel = suiteEnd.fullName.length;
                    var suiteName = suiteEnd.fullName.join(' – ');
                    this.perf.mark("qunit_suite_".concat(suiteLevel, "_end"));
                    this.perf.measure("QUnit Test Suite: ".concat(suiteName), "qunit_suite_".concat(suiteLevel, "_start"), "qunit_suite_".concat(suiteLevel, "_end"));
                }
            },
            {
                key: "onTestStart",
                value: function onTestStart() {
                    this.perf.mark('qunit_test_start');
                }
            },
            {
                key: "onTestEnd",
                value: function onTestEnd(testEnd) {
                    this.perf.mark('qunit_test_end');
                    var testName = testEnd.fullName.join(' – ');
                    this.perf.measure("QUnit Test: ".concat(testName), 'qunit_test_start', 'qunit_test_end');
                }
            },
            {
                key: "onRunEnd",
                value: function onRunEnd() {
                    this.perf.mark('qunit_suite_0_end');
                    this.perf.measure('QUnit Test Run', 'qunit_suite_0_start', 'qunit_suite_0_end');
                }
            }
        ], [
            {
                key: "init",
                value: function init(runner, options) {
                    return new PerfReporter(runner, options);
                }
            }
        ]);
        return PerfReporter;
    }();
    var FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM, isTTY = true;
    if (typeof process !== 'undefined') {
        var _ref = process.env || {};
        FORCE_COLOR = _ref.FORCE_COLOR;
        NODE_DISABLE_COLORS = _ref.NODE_DISABLE_COLORS;
        NO_COLOR = _ref.NO_COLOR;
        TERM = _ref.TERM;
        isTTY = process.stdout && process.stdout.isTTY;
    }
    var $ = {
        enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== 'dumb' && (FORCE_COLOR != null && FORCE_COLOR !== '0' || isTTY),
        // modifiers
        reset: init(0, 0),
        bold: init(1, 22),
        dim: init(2, 22),
        italic: init(3, 23),
        underline: init(4, 24),
        inverse: init(7, 27),
        hidden: init(8, 28),
        strikethrough: init(9, 29),
        // colors
        black: init(30, 39),
        red: init(31, 39),
        green: init(32, 39),
        yellow: init(33, 39),
        blue: init(34, 39),
        magenta: init(35, 39),
        cyan: init(36, 39),
        white: init(37, 39),
        gray: init(90, 39),
        grey: init(90, 39),
        // background colors
        bgBlack: init(40, 49),
        bgRed: init(41, 49),
        bgGreen: init(42, 49),
        bgYellow: init(43, 49),
        bgBlue: init(44, 49),
        bgMagenta: init(45, 49),
        bgCyan: init(46, 49),
        bgWhite: init(47, 49)
    };
    function run(arr, str) {
        var i = 0, tmp, beg = '', end = '';
        for(; i < arr.length; i++){
            tmp = arr[i];
            beg += tmp.open;
            end += tmp.close;
            if (!!~str.indexOf(tmp.close)) {
                str = str.replace(tmp.rgx, tmp.close + tmp.open);
            }
        }
        return beg + str + end;
    }
    function chain(has, keys) {
        var ctx = {
            has: has,
            keys: keys
        };
        ctx.reset = $.reset.bind(ctx);
        ctx.bold = $.bold.bind(ctx);
        ctx.dim = $.dim.bind(ctx);
        ctx.italic = $.italic.bind(ctx);
        ctx.underline = $.underline.bind(ctx);
        ctx.inverse = $.inverse.bind(ctx);
        ctx.hidden = $.hidden.bind(ctx);
        ctx.strikethrough = $.strikethrough.bind(ctx);
        ctx.black = $.black.bind(ctx);
        ctx.red = $.red.bind(ctx);
        ctx.green = $.green.bind(ctx);
        ctx.yellow = $.yellow.bind(ctx);
        ctx.blue = $.blue.bind(ctx);
        ctx.magenta = $.magenta.bind(ctx);
        ctx.cyan = $.cyan.bind(ctx);
        ctx.white = $.white.bind(ctx);
        ctx.gray = $.gray.bind(ctx);
        ctx.grey = $.grey.bind(ctx);
        ctx.bgBlack = $.bgBlack.bind(ctx);
        ctx.bgRed = $.bgRed.bind(ctx);
        ctx.bgGreen = $.bgGreen.bind(ctx);
        ctx.bgYellow = $.bgYellow.bind(ctx);
        ctx.bgBlue = $.bgBlue.bind(ctx);
        ctx.bgMagenta = $.bgMagenta.bind(ctx);
        ctx.bgCyan = $.bgCyan.bind(ctx);
        ctx.bgWhite = $.bgWhite.bind(ctx);
        return ctx;
    }
    function init(open, close) {
        var blk = {
            open: "\x1B[".concat(open, "m"),
            close: "\x1B[".concat(close, "m"),
            rgx: new RegExp("\\x1b\\[".concat(close, "m"), 'g')
        };
        return function(txt) {
            if (this !== void 0 && this.has !== void 0) {
                !!~this.has.indexOf(open) || (this.has.push(open), this.keys.push(blk));
                return txt === void 0 ? this : $.enabled ? run(this.keys, txt + '') : txt + '';
            }
            return txt === void 0 ? chain([
                open
            ], [
                blk
            ]) : $.enabled ? run([
                blk
            ], txt + '') : txt + '';
        };
    }
    var hasOwn = Object.prototype.hasOwnProperty;
    /**
	 * Format a given value into YAML.
	 *
	 * YAML is a superset of JSON that supports all the same data
	 * types and syntax, and more. As such, it is always possible
	 * to fallback to JSON.stringfify, but we generally avoid
	 * that to make output easier to read for humans.
	 *
	 * Supported data types:
	 *
	 * - null
	 * - boolean
	 * - number
	 * - string
	 * - array
	 * - object
	 *
	 * Anything else (including NaN, Infinity, and undefined)
	 * must be described in strings, for display purposes.
	 *
	 * Note that quotes are optional in YAML strings if the
	 * strings are "simple", and as such we generally prefer
	 * that for improved readability. We output strings in
	 * one of three ways:
	 *
	 * - bare unquoted text, for simple one-line strings.
	 * - JSON (quoted text), for complex one-line strings.
	 * - YAML Block, for complex multi-line strings.
	 *
	 * Objects with cyclical references will be stringifed as
	 * "[Circular]" as they cannot otherwise be represented.
	 */ function prettyYamlValue(value) {
        var indent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 4;
        if (value === undefined) {
            // Not supported in JSON/YAML, turn into string
            // and let the below output it as bare string.
            value = String(value);
        }
        // Support IE 9-11: Use isFinite instead of ES6 Number.isFinite
        if (typeof value === 'number' && !isFinite(value)) {
            // Turn NaN and Infinity into simple strings.
            // Paranoia: Don't return directly just in case there's
            // a way to add special characters here.
            value = String(value);
        }
        if (typeof value === 'number') {
            // Simple numbers
            return JSON.stringify(value);
        }
        if (typeof value === 'string') {
            // If any of these match, then we can't output it
            // as bare unquoted text, because that would either
            // cause data loss or invalid YAML syntax.
            //
            // - Quotes, escapes, line breaks, or JSON-like stuff.
            var rSpecialJson = /['"\\/[{}\]\r\n]/;
            // - Characters that are special at the start of a YAML value
            var rSpecialYaml = /[-?:,[\]{}#&*!|=>'"%@`]/;
            // - Leading or trailing whitespace.
            var rUntrimmed = /(^\s|\s$)/;
            // - Ambiguous as YAML number, e.g. '2', '-1.2', '.2', or '2_000'
            var rNumerical = /^[\d._-]+$/;
            // - Ambiguous as YAML bool.
            //   Use case-insensitive match, although technically only
            //   fully-lower, fully-upper, or uppercase-first would be ambiguous.
            //   e.g. true/True/TRUE, but not tRUe.
            var rBool = /^(true|false|y|n|yes|no|on|off)$/i;
            // Is this a complex string?
            if (value === '' || rSpecialJson.test(value) || rSpecialYaml.test(value[0]) || rUntrimmed.test(value) || rNumerical.test(value) || rBool.test(value)) {
                if (!/\n/.test(value)) {
                    // Complex one-line string, use JSON (quoted string)
                    return JSON.stringify(value);
                }
                // See also <https://yaml-multiline.info/>
                // Support IE 9-11: Avoid ES6 String#repeat
                var prefix = new Array(indent + 1).join(' ');
                var trailingLinebreakMatch = value.match(/\n+$/);
                var trailingLinebreaks = trailingLinebreakMatch ? trailingLinebreakMatch[0].length : 0;
                if (trailingLinebreaks === 1) {
                    // Use the most straight-forward "Block" string in YAML
                    // without any "Chomping" indicators.
                    var lines = value// Ignore the last new line, since we'll get that one for free
                    // with the straight-forward Block syntax.
                    .replace(/\n$/, '').split('\n').map(function(line) {
                        return prefix + line;
                    });
                    return '|\n' + lines.join('\n');
                } else {
                    // This has either no trailing new lines, or more than 1.
                    // Use |+ so that YAML parsers will preserve it exactly.
                    var _lines = value.split('\n').map(function(line) {
                        return prefix + line;
                    });
                    return '|+\n' + _lines.join('\n');
                }
            } else {
                // Simple string, use bare unquoted text
                return value;
            }
        }
        // Handle null, boolean, array, and object
        return JSON.stringify(decycledShallowClone(value), null, 2);
    }
    /**
	 * Creates a shallow clone of an object where cycles have
	 * been replaced with "[Circular]".
	 */ function decycledShallowClone(object) {
        var ancestors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        if (ancestors.indexOf(object) !== -1) {
            return '[Circular]';
        }
        var type = Object.prototype.toString.call(object).replace(/^\[.+\s(.+?)]$/, '$1').toLowerCase();
        var clone;
        switch(type){
            case 'array':
                ancestors.push(object);
                clone = object.map(function(element) {
                    return decycledShallowClone(element, ancestors);
                });
                ancestors.pop();
                break;
            case 'object':
                ancestors.push(object);
                clone = {};
                Object.keys(object).forEach(function(key) {
                    clone[key] = decycledShallowClone(object[key], ancestors);
                });
                ancestors.pop();
                break;
            default:
                clone = object;
        }
        return clone;
    }
    var TapReporter = /*#__PURE__*/ function() {
        function TapReporter(runner) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            _classCallCheck(this, TapReporter);
            // Cache references to console methods to ensure we can report failures
            // from tests tests that mock the console object itself.
            // https://github.com/qunitjs/qunit/issues/1340
            // Support IE 9: Function#bind is supported, but no console.log.bind().
            this.log = options.log || Function.prototype.bind.call(console$1.log, console$1);
            this.testCount = 0;
            this.ended = false;
            this.bailed = false;
            runner.on('error', this.onError.bind(this));
            runner.on('runStart', this.onRunStart.bind(this));
            runner.on('testEnd', this.onTestEnd.bind(this));
            runner.on('runEnd', this.onRunEnd.bind(this));
        }
        _createClass(TapReporter, [
            {
                key: "onRunStart",
                value: function onRunStart(_runSuite) {
                    this.log('TAP version 13');
                }
            },
            {
                key: "onError",
                value: function onError(error) {
                    if (this.bailed) {
                        return;
                    }
                    this.bailed = true;
                    // Imitate onTestEnd
                    // Skip this if we're past "runEnd" as it would look odd
                    if (!this.ended) {
                        this.testCount = this.testCount + 1;
                        this.log($.red("not ok ".concat(this.testCount, " global failure")));
                        this.logError(error);
                    }
                    this.log('Bail out! ' + errorString(error).split('\n')[0]);
                    if (this.ended) {
                        this.logError(error);
                    }
                }
            },
            {
                key: "onTestEnd",
                value: function onTestEnd(test) {
                    var _this = this;
                    this.testCount = this.testCount + 1;
                    if (test.status === 'passed') {
                        this.log("ok ".concat(this.testCount, " ").concat(test.fullName.join(' > ')));
                    } else if (test.status === 'skipped') {
                        this.log($.yellow("ok ".concat(this.testCount, " # SKIP ").concat(test.fullName.join(' > '))));
                    } else if (test.status === 'todo') {
                        this.log($.cyan("not ok ".concat(this.testCount, " # TODO ").concat(test.fullName.join(' > '))));
                        test.errors.forEach(function(error) {
                            return _this.logAssertion(error, 'todo');
                        });
                    } else {
                        this.log($.red("not ok ".concat(this.testCount, " ").concat(test.fullName.join(' > '))));
                        test.errors.forEach(function(error) {
                            return _this.logAssertion(error);
                        });
                    }
                }
            },
            {
                key: "onRunEnd",
                value: function onRunEnd(runSuite) {
                    this.ended = true;
                    this.log("1..".concat(runSuite.testCounts.total));
                    this.log("# pass ".concat(runSuite.testCounts.passed));
                    this.log($.yellow("# skip ".concat(runSuite.testCounts.skipped)));
                    this.log($.cyan("# todo ".concat(runSuite.testCounts.todo)));
                    this.log($.red("# fail ".concat(runSuite.testCounts.failed)));
                }
            },
            {
                key: "logAssertion",
                value: function logAssertion(error, severity) {
                    var out = '  ---';
                    out += "\n  message: ".concat(prettyYamlValue(error.message || 'failed'));
                    out += "\n  severity: ".concat(prettyYamlValue(severity || 'failed'));
                    if (hasOwn.call(error, 'actual')) {
                        out += "\n  actual  : ".concat(prettyYamlValue(error.actual));
                    }
                    if (hasOwn.call(error, 'expected')) {
                        out += "\n  expected: ".concat(prettyYamlValue(error.expected));
                    }
                    if (error.stack) {
                        // Since stacks aren't user generated, take a bit of liberty by
                        // adding a trailing new line to allow a straight-forward YAML Blocks.
                        out += "\n  stack: ".concat(prettyYamlValue(error.stack + '\n'));
                    }
                    out += '\n  ...';
                    this.log(out);
                }
            },
            {
                key: "logError",
                value: function logError(error) {
                    var out = '  ---';
                    out += "\n  message: ".concat(prettyYamlValue(errorString(error)));
                    out += "\n  severity: ".concat(prettyYamlValue('failed'));
                    if (error && error.stack) {
                        out += "\n  stack: ".concat(prettyYamlValue(error.stack + '\n'));
                    }
                    out += '\n  ...';
                    this.log(out);
                }
            }
        ], [
            {
                key: "init",
                value: function init(runner, options) {
                    return new TapReporter(runner, options);
                }
            }
        ]);
        return TapReporter;
    }();
    var reporters = {
        console: ConsoleReporter,
        perf: PerfReporter,
        tap: TapReporter
    };
    function makeAddGlobalHook(hookName) {
        return function addGlobalHook(callback) {
            if (!config.globalHooks[hookName]) {
                config.globalHooks[hookName] = [];
            }
            config.globalHooks[hookName].push(callback);
        };
    }
    var hooks = {
        beforeEach: makeAddGlobalHook('beforeEach'),
        afterEach: makeAddGlobalHook('afterEach')
    };
    /**
	 * Handle a global error that should result in a failed test run.
	 *
	 * Summary:
	 *
	 * - If we're strictly inside a test (or one if its module hooks), the exception
	 *   becomes a failed assertion.
	 *
	 *   This has the important side-effect that uncaught exceptions (such as
	 *   calling an undefined function) during a "todo" test do NOT result in
	 *   a failed test run.
	 *
	 * - If we're anywhere outside a test (be it in early event callbacks, or
	 *   internally between tests, or somewhere after "runEnd" if the process is
	 *   still alive for some reason), then send an "error" event to the reporters.
	 *
	 * @since 2.17.0
	 * @param {Error|any} error
	 */ function onUncaughtException(error) {
        if (config.current) {
            config.current.assert.pushResult({
                result: false,
                message: "global failure: ".concat(errorString(error)),
                // We could let callers specify an offset to subtract a number of frames via
                // sourceFromStacktrace, in case they are a wrapper further away from the error
                // handler, and thus reduce some noise in the stack trace. However, we're not
                // doing this right now because it would almost never be used in practice given
                // the vast majority of error values will be Error objects, and thus have their
                // own stack trace already.
                source: error && error.stack || sourceFromStacktrace(2)
            });
        } else {
            // The "error" event was added in QUnit 2.17.
            // Increase "bad assertion" stats despite no longer pushing an assertion in this case.
            // This ensures "runEnd" and "QUnit.done()" handlers behave as expected, since the "bad"
            // count is typically how reporters decide on the boolean outcome of the test run.
            runSuite.globalFailureCount++;
            config.stats.bad++;
            config.stats.all++;
            emit('error', error);
        }
    }
    /**
	 * Handle a window.onerror error.
	 *
	 * If there is a current test that sets the internal `ignoreGlobalErrors` field
	 * (such as during `assert.throws()`), then the error is ignored and native
	 * error reporting is suppressed as well. This is because in browsers, an error
	 * can sometimes end up in `window.onerror` instead of in the local try/catch.
	 * This ignoring of errors does not apply to our general onUncaughtException
	 * method, nor to our `unhandledRejection` handlers, as those are not meant
	 * to receive an "expected" error during `assert.throws()`.
	 *
	 * @see <https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror>
	 * @deprecated since 2.17.0 Use QUnit.onUncaughtException instead.
	 * @param {Object} details
	 * @param {string} details.message
	 * @param {string} details.fileName
	 * @param {number} details.lineNumber
	 * @param {string|undefined} [details.stacktrace]
	 * @return {bool} True if native error reporting should be suppressed.
	 */ function onWindowError(details) {
        Logger.warn('QUnit.onError is deprecated and will be removed in QUnit 3.0.' + ' Please use QUnit.onUncaughtException instead.');
        if (config.current && config.current.ignoreGlobalErrors) {
            return true;
        }
        var err = new Error(details.message);
        err.stack = details.stacktrace || details.fileName + ':' + details.lineNumber;
        onUncaughtException(err);
        return false;
    }
    var QUnit = {};
    // The "currentModule" object would ideally be defined using the createModule()
    // function. Since it isn't, add the missing suiteReport property to it now that
    // we have loaded all source code required to do so.
    //
    // TODO: Consider defining currentModule in core.js or module.js in its entirely
    // rather than partly in config.js and partly here.
    config.currentModule.suiteReport = runSuite;
    var globalStartCalled = false;
    var runStarted = false;
    // Figure out if we're running the tests from a server or not
    QUnit.isLocal = window$1 && window$1.location && window$1.location.protocol === 'file:';
    // Expose the current QUnit version
    QUnit.version = '2.20.0';
    extend(QUnit, {
        config: config,
        dump: dump,
        equiv: equiv,
        reporters: reporters,
        hooks: hooks,
        is: is,
        objectType: objectType,
        on: on,
        onError: onWindowError,
        onUncaughtException: onUncaughtException,
        pushFailure: pushFailure,
        assert: Assert.prototype,
        module: module$1,
        test: test,
        // alias other test flavors for easy access
        todo: test.todo,
        skip: test.skip,
        only: test.only,
        start: function start(count) {
            if (config.current) {
                throw new Error('QUnit.start cannot be called inside a test context.');
            }
            var globalStartAlreadyCalled = globalStartCalled;
            globalStartCalled = true;
            if (runStarted) {
                throw new Error('Called start() while test already started running');
            }
            if (globalStartAlreadyCalled || count > 1) {
                throw new Error('Called start() outside of a test context too many times');
            }
            if (config.autostart) {
                throw new Error('Called start() outside of a test context when ' + 'QUnit.config.autostart was true');
            }
            if (!config.pageLoaded) {
                // The page isn't completely loaded yet, so we set autostart and then
                // load if we're in Node or wait for the browser's load event.
                config.autostart = true;
                // Starts from Node even if .load was not previously called. We still return
                // early otherwise we'll wind up "beginning" twice.
                if (!document) {
                    QUnit.load();
                }
                return;
            }
            scheduleBegin();
        },
        onUnhandledRejection: function onUnhandledRejection(reason) {
            Logger.warn('QUnit.onUnhandledRejection is deprecated and will be removed in QUnit 3.0.' + ' Please use QUnit.onUncaughtException instead.');
            onUncaughtException(reason);
        },
        extend: function extend$1() {
            Logger.warn('QUnit.extend is deprecated and will be removed in QUnit 3.0.' + ' Please use Object.assign instead.');
            // delegate to utility implementation, which does not warn and can be used elsewhere internally
            for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                args[_key] = arguments[_key];
            }
            return extend.apply(this, args);
        },
        load: function load() {
            config.pageLoaded = true;
            // Initialize the configuration options
            extend(config, {
                started: 0,
                updateRate: 1000,
                autostart: true,
                filter: ''
            }, true);
            if (!runStarted) {
                config.blocking = false;
                if (config.autostart) {
                    scheduleBegin();
                }
            }
        },
        stack: function stack(offset) {
            offset = (offset || 0) + 2;
            return sourceFromStacktrace(offset);
        }
    });
    registerLoggingCallbacks(QUnit);
    function scheduleBegin() {
        runStarted = true;
        // Add a slight delay to allow definition of more modules and tests.
        if (setTimeout$1) {
            setTimeout$1(function() {
                begin();
            });
        } else {
            begin();
        }
    }
    function unblockAndAdvanceQueue() {
        config.blocking = false;
        ProcessingQueue.advance();
    }
    function begin() {
        if (config.started) {
            unblockAndAdvanceQueue();
            return;
        }
        // The test run hasn't officially begun yet
        // Record the time of the test run's beginning
        config.started = performance.now();
        // Delete the loose unnamed module if unused.
        if (config.modules[0].name === '' && config.modules[0].tests.length === 0) {
            config.modules.shift();
        }
        var modulesLog = [];
        for(var i = 0; i < config.modules.length; i++){
            // Don't expose the unnamed global test module to plugins.
            if (config.modules[i].name !== '') {
                modulesLog.push({
                    name: config.modules[i].name,
                    moduleId: config.modules[i].moduleId,
                    // Added in QUnit 1.16.0 for internal use by html-reporter,
                    // but no longer used since QUnit 2.7.0.
                    // @deprecated Kept unofficially to be removed in QUnit 3.0.
                    tests: config.modules[i].tests
                });
            }
        }
        // The test run is officially beginning now
        emit('runStart', runSuite.start(true));
        runLoggingCallbacks('begin', {
            totalTests: Test.count,
            modules: modulesLog
        }).then(unblockAndAdvanceQueue);
    }
    exportQUnit(QUnit);
    (function() {
        if (!window$1 || !document) {
            return;
        }
        var config = QUnit.config;
        var hasOwn = Object.prototype.hasOwnProperty;
        // Stores fixture HTML for resetting later
        function storeFixture() {
            // Avoid overwriting user-defined values
            if (hasOwn.call(config, 'fixture')) {
                return;
            }
            var fixture = document.getElementById('qunit-fixture');
            if (fixture) {
                config.fixture = fixture.cloneNode(true);
            }
        }
        QUnit.begin(storeFixture);
        // Resets the fixture DOM element if available.
        function resetFixture() {
            if (config.fixture == null) {
                return;
            }
            var fixture = document.getElementById('qunit-fixture');
            var resetFixtureType = _typeof(config.fixture);
            if (resetFixtureType === 'string') {
                // support user defined values for `config.fixture`
                var newFixture = document.createElement('div');
                newFixture.setAttribute('id', 'qunit-fixture');
                newFixture.innerHTML = config.fixture;
                fixture.parentNode.replaceChild(newFixture, fixture);
            } else {
                var clonedFixture = config.fixture.cloneNode(true);
                fixture.parentNode.replaceChild(clonedFixture, fixture);
            }
        }
        QUnit.testStart(resetFixture);
    })();
    (function() {
        // Only interact with URLs via window.location
        var location = typeof window$1 !== 'undefined' && window$1.location;
        if (!location) {
            return;
        }
        var urlParams = getUrlParams();
        QUnit.urlParams = urlParams;
        QUnit.config.filter = urlParams.filter;
        QUnit.config.module = urlParams.module;
        QUnit.config.moduleId = [].concat(urlParams.moduleId || []);
        QUnit.config.testId = [].concat(urlParams.testId || []);
        // Test order randomization
        if (urlParams.seed === true) {
            // Generate a random seed if the option is specified without a value
            QUnit.config.seed = Math.random().toString(36).slice(2);
        } else if (urlParams.seed) {
            QUnit.config.seed = urlParams.seed;
        }
        // Add URL-parameter-mapped config values with UI form rendering data
        QUnit.config.urlConfig.push({
            id: 'hidepassed',
            label: 'Hide passed tests',
            tooltip: 'Only show tests and assertions that fail. Stored as query-strings.'
        }, {
            id: 'noglobals',
            label: 'Check for Globals',
            tooltip: 'Enabling this will test if any test introduces new properties on the ' + 'global object (`window` in Browsers). Stored as query-strings.'
        }, {
            id: 'notrycatch',
            label: 'No try-catch',
            tooltip: 'Enabling this will run tests outside of a try-catch block. Makes debugging ' + 'exceptions in IE reasonable. Stored as query-strings.'
        });
        QUnit.begin(function() {
            var urlConfig = QUnit.config.urlConfig;
            for(var i = 0; i < urlConfig.length; i++){
                // Options can be either strings or objects with nonempty "id" properties
                var option = QUnit.config.urlConfig[i];
                if (typeof option !== 'string') {
                    option = option.id;
                }
                if (QUnit.config[option] === undefined) {
                    QUnit.config[option] = urlParams[option];
                }
            }
        });
        function getUrlParams() {
            var urlParams = Object.create(null);
            var params = location.search.slice(1).split('&');
            var length = params.length;
            for(var i = 0; i < length; i++){
                if (params[i]) {
                    var param = params[i].split('=');
                    var name = decodeQueryParam(param[0]);
                    // Allow just a key to turn on a flag, e.g., test.html?noglobals
                    var value = param.length === 1 || decodeQueryParam(param.slice(1).join('='));
                    if (name in urlParams) {
                        urlParams[name] = [].concat(urlParams[name], value);
                    } else {
                        urlParams[name] = value;
                    }
                }
            }
            return urlParams;
        }
        function decodeQueryParam(param) {
            return decodeURIComponent(param.replace(/\+/g, '%20'));
        }
    })();
    var fuzzysort$1 = {
        exports: {}
    };
    (function(module1) {
        (function(root, UMD) {
            if (module1.exports) module1.exports = UMD();
            else root.fuzzysort = UMD();
        })(commonjsGlobal, function UMD() {
            function fuzzysortNew(instanceOptions) {
                var fuzzysort = {
                    single: function single(search, target, options) {
                        if (search == 'farzher') return {
                            target: "farzher was here (^-^*)/",
                            score: 0,
                            indexes: [
                                0,
                                1,
                                2,
                                3,
                                4,
                                5,
                                6
                            ]
                        };
                        if (!search) return null;
                        if (!isObj(search)) search = fuzzysort.getPreparedSearch(search);
                        if (!target) return null;
                        if (!isObj(target)) target = fuzzysort.getPrepared(target);
                        var allowTypo = options && options.allowTypo !== undefined ? options.allowTypo : instanceOptions && instanceOptions.allowTypo !== undefined ? instanceOptions.allowTypo : true;
                        var algorithm = allowTypo ? fuzzysort.algorithm : fuzzysort.algorithmNoTypo;
                        return algorithm(search, target, search[0]);
                    },
                    go: function go(search, targets, options) {
                        if (search == 'farzher') return [
                            {
                                target: "farzher was here (^-^*)/",
                                score: 0,
                                indexes: [
                                    0,
                                    1,
                                    2,
                                    3,
                                    4,
                                    5,
                                    6
                                ],
                                obj: targets ? targets[0] : null
                            }
                        ];
                        if (!search) return noResults;
                        search = fuzzysort.prepareSearch(search);
                        var searchLowerCode = search[0];
                        var threshold = options && options.threshold || instanceOptions && instanceOptions.threshold || -9007199254740991;
                        var limit = options && options.limit || instanceOptions && instanceOptions.limit || 9007199254740991;
                        var allowTypo = options && options.allowTypo !== undefined ? options.allowTypo : instanceOptions && instanceOptions.allowTypo !== undefined ? instanceOptions.allowTypo : true;
                        var algorithm = allowTypo ? fuzzysort.algorithm : fuzzysort.algorithmNoTypo;
                        var resultsLen = 0;
                        var limitedCount = 0;
                        var targetsLen = targets.length;
                        // This code is copy/pasted 3 times for performance reasons [options.keys, options.key, no keys]
                        // options.keys
                        if (options && options.keys) {
                            var scoreFn = options.scoreFn || defaultScoreFn;
                            var keys = options.keys;
                            var keysLen = keys.length;
                            for(var i = targetsLen - 1; i >= 0; --i){
                                var obj = targets[i];
                                var objResults = new Array(keysLen);
                                for(var keyI = keysLen - 1; keyI >= 0; --keyI){
                                    var key = keys[keyI];
                                    var target = getValue(obj, key);
                                    if (!target) {
                                        objResults[keyI] = null;
                                        continue;
                                    }
                                    if (!isObj(target)) target = fuzzysort.getPrepared(target);
                                    objResults[keyI] = algorithm(search, target, searchLowerCode);
                                }
                                objResults.obj = obj; // before scoreFn so scoreFn can use it
                                var score = scoreFn(objResults);
                                if (score === null) continue;
                                if (score < threshold) continue;
                                objResults.score = score;
                                if (resultsLen < limit) {
                                    q.add(objResults);
                                    ++resultsLen;
                                } else {
                                    ++limitedCount;
                                    if (score > q.peek().score) q.replaceTop(objResults);
                                }
                            }
                        // options.key
                        } else if (options && options.key) {
                            var key = options.key;
                            for(var i = targetsLen - 1; i >= 0; --i){
                                var obj = targets[i];
                                var target = getValue(obj, key);
                                if (!target) continue;
                                if (!isObj(target)) target = fuzzysort.getPrepared(target);
                                var result = algorithm(search, target, searchLowerCode);
                                if (result === null) continue;
                                if (result.score < threshold) continue;
                                // have to clone result so duplicate targets from different obj can each reference the correct obj
                                result = {
                                    target: result.target,
                                    _targetLowerCodes: null,
                                    _nextBeginningIndexes: null,
                                    score: result.score,
                                    indexes: result.indexes,
                                    obj: obj
                                }; // hidden
                                if (resultsLen < limit) {
                                    q.add(result);
                                    ++resultsLen;
                                } else {
                                    ++limitedCount;
                                    if (result.score > q.peek().score) q.replaceTop(result);
                                }
                            }
                        // no keys
                        } else {
                            for(var i = targetsLen - 1; i >= 0; --i){
                                var target = targets[i];
                                if (!target) continue;
                                if (!isObj(target)) target = fuzzysort.getPrepared(target);
                                var result = algorithm(search, target, searchLowerCode);
                                if (result === null) continue;
                                if (result.score < threshold) continue;
                                if (resultsLen < limit) {
                                    q.add(result);
                                    ++resultsLen;
                                } else {
                                    ++limitedCount;
                                    if (result.score > q.peek().score) q.replaceTop(result);
                                }
                            }
                        }
                        if (resultsLen === 0) return noResults;
                        var results = new Array(resultsLen);
                        for(var i = resultsLen - 1; i >= 0; --i){
                            results[i] = q.poll();
                        }
                        results.total = resultsLen + limitedCount;
                        return results;
                    },
                    goAsync: function goAsync(search, targets, options) {
                        var canceled = false;
                        var p = new Promise(function(resolve, reject) {
                            if (search == 'farzher') return resolve([
                                {
                                    target: "farzher was here (^-^*)/",
                                    score: 0,
                                    indexes: [
                                        0,
                                        1,
                                        2,
                                        3,
                                        4,
                                        5,
                                        6
                                    ],
                                    obj: targets ? targets[0] : null
                                }
                            ]);
                            if (!search) return resolve(noResults);
                            search = fuzzysort.prepareSearch(search);
                            var searchLowerCode = search[0];
                            var q = fastpriorityqueue();
                            var iCurrent = targets.length - 1;
                            var threshold = options && options.threshold || instanceOptions && instanceOptions.threshold || -9007199254740991;
                            var limit = options && options.limit || instanceOptions && instanceOptions.limit || 9007199254740991;
                            var allowTypo = options && options.allowTypo !== undefined ? options.allowTypo : instanceOptions && instanceOptions.allowTypo !== undefined ? instanceOptions.allowTypo : true;
                            var algorithm = allowTypo ? fuzzysort.algorithm : fuzzysort.algorithmNoTypo;
                            var resultsLen = 0;
                            var limitedCount = 0;
                            function step() {
                                if (canceled) return reject('canceled');
                                var startMs = Date.now();
                                // This code is copy/pasted 3 times for performance reasons [options.keys, options.key, no keys]
                                // options.keys
                                if (options && options.keys) {
                                    var scoreFn = options.scoreFn || defaultScoreFn;
                                    var keys = options.keys;
                                    var keysLen = keys.length;
                                    for(; iCurrent >= 0; --iCurrent){
                                        if (iCurrent % 1000 /*itemsPerCheck*/  === 0) {
                                            if (Date.now() - startMs >= 10 /*asyncInterval*/ ) {
                                                isNode ? setImmediate(step) : setTimeout(step);
                                                return;
                                            }
                                        }
                                        var obj = targets[iCurrent];
                                        var objResults = new Array(keysLen);
                                        for(var keyI = keysLen - 1; keyI >= 0; --keyI){
                                            var key = keys[keyI];
                                            var target = getValue(obj, key);
                                            if (!target) {
                                                objResults[keyI] = null;
                                                continue;
                                            }
                                            if (!isObj(target)) target = fuzzysort.getPrepared(target);
                                            objResults[keyI] = algorithm(search, target, searchLowerCode);
                                        }
                                        objResults.obj = obj; // before scoreFn so scoreFn can use it
                                        var score = scoreFn(objResults);
                                        if (score === null) continue;
                                        if (score < threshold) continue;
                                        objResults.score = score;
                                        if (resultsLen < limit) {
                                            q.add(objResults);
                                            ++resultsLen;
                                        } else {
                                            ++limitedCount;
                                            if (score > q.peek().score) q.replaceTop(objResults);
                                        }
                                    }
                                // options.key
                                } else if (options && options.key) {
                                    var key = options.key;
                                    for(; iCurrent >= 0; --iCurrent){
                                        if (iCurrent % 1000 /*itemsPerCheck*/  === 0) {
                                            if (Date.now() - startMs >= 10 /*asyncInterval*/ ) {
                                                isNode ? setImmediate(step) : setTimeout(step);
                                                return;
                                            }
                                        }
                                        var obj = targets[iCurrent];
                                        var target = getValue(obj, key);
                                        if (!target) continue;
                                        if (!isObj(target)) target = fuzzysort.getPrepared(target);
                                        var result = algorithm(search, target, searchLowerCode);
                                        if (result === null) continue;
                                        if (result.score < threshold) continue;
                                        // have to clone result so duplicate targets from different obj can each reference the correct obj
                                        result = {
                                            target: result.target,
                                            _targetLowerCodes: null,
                                            _nextBeginningIndexes: null,
                                            score: result.score,
                                            indexes: result.indexes,
                                            obj: obj
                                        }; // hidden
                                        if (resultsLen < limit) {
                                            q.add(result);
                                            ++resultsLen;
                                        } else {
                                            ++limitedCount;
                                            if (result.score > q.peek().score) q.replaceTop(result);
                                        }
                                    }
                                // no keys
                                } else {
                                    for(; iCurrent >= 0; --iCurrent){
                                        if (iCurrent % 1000 /*itemsPerCheck*/  === 0) {
                                            if (Date.now() - startMs >= 10 /*asyncInterval*/ ) {
                                                isNode ? setImmediate(step) : setTimeout(step);
                                                return;
                                            }
                                        }
                                        var target = targets[iCurrent];
                                        if (!target) continue;
                                        if (!isObj(target)) target = fuzzysort.getPrepared(target);
                                        var result = algorithm(search, target, searchLowerCode);
                                        if (result === null) continue;
                                        if (result.score < threshold) continue;
                                        if (resultsLen < limit) {
                                            q.add(result);
                                            ++resultsLen;
                                        } else {
                                            ++limitedCount;
                                            if (result.score > q.peek().score) q.replaceTop(result);
                                        }
                                    }
                                }
                                if (resultsLen === 0) return resolve(noResults);
                                var results = new Array(resultsLen);
                                for(var i = resultsLen - 1; i >= 0; --i){
                                    results[i] = q.poll();
                                }
                                results.total = resultsLen + limitedCount;
                                resolve(results);
                            }
                            isNode ? setImmediate(step) : step(); //setTimeout here is too slow
                        });
                        p.cancel = function() {
                            canceled = true;
                        };
                        return p;
                    },
                    highlight: function highlight(result, hOpen, hClose) {
                        if (typeof hOpen == 'function') return fuzzysort.highlightCallback(result, hOpen);
                        if (result === null) return null;
                        if (hOpen === undefined) hOpen = '<b>';
                        if (hClose === undefined) hClose = '</b>';
                        var highlighted = '';
                        var matchesIndex = 0;
                        var opened = false;
                        var target = result.target;
                        var targetLen = target.length;
                        var matchesBest = result.indexes;
                        for(var i = 0; i < targetLen; ++i){
                            var char = target[i];
                            if (matchesBest[matchesIndex] === i) {
                                ++matchesIndex;
                                if (!opened) {
                                    opened = true;
                                    highlighted += hOpen;
                                }
                                if (matchesIndex === matchesBest.length) {
                                    highlighted += char + hClose + target.substr(i + 1);
                                    break;
                                }
                            } else {
                                if (opened) {
                                    opened = false;
                                    highlighted += hClose;
                                }
                            }
                            highlighted += char;
                        }
                        return highlighted;
                    },
                    highlightCallback: function highlightCallback(result, cb) {
                        if (result === null) return null;
                        var target = result.target;
                        var targetLen = target.length;
                        var indexes = result.indexes;
                        var highlighted = '';
                        var matchI = 0;
                        var indexesI = 0;
                        var opened = false;
                        var result = [];
                        for(var i = 0; i < targetLen; ++i){
                            var char = target[i];
                            if (indexes[indexesI] === i) {
                                ++indexesI;
                                if (!opened) {
                                    opened = true;
                                    result.push(highlighted);
                                    highlighted = '';
                                }
                                if (indexesI === indexes.length) {
                                    highlighted += char;
                                    result.push(cb(highlighted, matchI++));
                                    highlighted = '';
                                    result.push(target.substr(i + 1));
                                    break;
                                }
                            } else {
                                if (opened) {
                                    opened = false;
                                    result.push(cb(highlighted, matchI++));
                                    highlighted = '';
                                }
                            }
                            highlighted += char;
                        }
                        return result;
                    },
                    prepare: function prepare(target) {
                        if (!target) return {
                            target: '',
                            _targetLowerCodes: [
                                0 /*this 0 doesn't make sense. here because an empty array causes the algorithm to deoptimize and run 50% slower!*/ 
                            ],
                            _nextBeginningIndexes: null,
                            score: null,
                            indexes: null,
                            obj: null
                        }; // hidden
                        return {
                            target: target,
                            _targetLowerCodes: fuzzysort.prepareLowerCodes(target),
                            _nextBeginningIndexes: null,
                            score: null,
                            indexes: null,
                            obj: null
                        }; // hidden
                    },
                    prepareSlow: function prepareSlow(target) {
                        if (!target) return {
                            target: '',
                            _targetLowerCodes: [
                                0 /*this 0 doesn't make sense. here because an empty array causes the algorithm to deoptimize and run 50% slower!*/ 
                            ],
                            _nextBeginningIndexes: null,
                            score: null,
                            indexes: null,
                            obj: null
                        }; // hidden
                        return {
                            target: target,
                            _targetLowerCodes: fuzzysort.prepareLowerCodes(target),
                            _nextBeginningIndexes: fuzzysort.prepareNextBeginningIndexes(target),
                            score: null,
                            indexes: null,
                            obj: null
                        }; // hidden
                    },
                    prepareSearch: function prepareSearch(search) {
                        if (!search) search = '';
                        return fuzzysort.prepareLowerCodes(search);
                    },
                    // Below this point is only internal code
                    // Below this point is only internal code
                    // Below this point is only internal code
                    // Below this point is only internal code
                    getPrepared: function getPrepared(target) {
                        if (target.length > 999) return fuzzysort.prepare(target); // don't cache huge targets
                        var targetPrepared = preparedCache.get(target);
                        if (targetPrepared !== undefined) return targetPrepared;
                        targetPrepared = fuzzysort.prepare(target);
                        preparedCache.set(target, targetPrepared);
                        return targetPrepared;
                    },
                    getPreparedSearch: function getPreparedSearch(search) {
                        if (search.length > 999) return fuzzysort.prepareSearch(search); // don't cache huge searches
                        var searchPrepared = preparedSearchCache.get(search);
                        if (searchPrepared !== undefined) return searchPrepared;
                        searchPrepared = fuzzysort.prepareSearch(search);
                        preparedSearchCache.set(search, searchPrepared);
                        return searchPrepared;
                    },
                    algorithm: function algorithm(searchLowerCodes, prepared, searchLowerCode) {
                        var targetLowerCodes = prepared._targetLowerCodes;
                        var searchLen = searchLowerCodes.length;
                        var targetLen = targetLowerCodes.length;
                        var searchI = 0; // where we at
                        var targetI = 0; // where you at
                        var typoSimpleI = 0;
                        var matchesSimpleLen = 0;
                        // very basic fuzzy match; to remove non-matching targets ASAP!
                        // walk through target. find sequential matches.
                        // if all chars aren't found then exit
                        for(;;){
                            var isMatch = searchLowerCode === targetLowerCodes[targetI];
                            if (isMatch) {
                                matchesSimple[matchesSimpleLen++] = targetI;
                                ++searchI;
                                if (searchI === searchLen) break;
                                searchLowerCode = searchLowerCodes[typoSimpleI === 0 ? searchI : typoSimpleI === searchI ? searchI + 1 : typoSimpleI === searchI - 1 ? searchI - 1 : searchI];
                            }
                            ++targetI;
                            if (targetI >= targetLen) {
                                // Failed to find searchI
                                // Check for typo or exit
                                // we go as far as possible before trying to transpose
                                // then we transpose backwards until we reach the beginning
                                for(;;){
                                    if (searchI <= 1) return null; // not allowed to transpose first char
                                    if (typoSimpleI === 0) {
                                        // we haven't tried to transpose yet
                                        --searchI;
                                        var searchLowerCodeNew = searchLowerCodes[searchI];
                                        if (searchLowerCode === searchLowerCodeNew) continue; // doesn't make sense to transpose a repeat char
                                        typoSimpleI = searchI;
                                    } else {
                                        if (typoSimpleI === 1) return null; // reached the end of the line for transposing
                                        --typoSimpleI;
                                        searchI = typoSimpleI;
                                        searchLowerCode = searchLowerCodes[searchI + 1];
                                        var searchLowerCodeNew = searchLowerCodes[searchI];
                                        if (searchLowerCode === searchLowerCodeNew) continue; // doesn't make sense to transpose a repeat char
                                    }
                                    matchesSimpleLen = searchI;
                                    targetI = matchesSimple[matchesSimpleLen - 1] + 1;
                                    break;
                                }
                            }
                        }
                        var searchI = 0;
                        var typoStrictI = 0;
                        var successStrict = false;
                        var matchesStrictLen = 0;
                        var nextBeginningIndexes = prepared._nextBeginningIndexes;
                        if (nextBeginningIndexes === null) nextBeginningIndexes = prepared._nextBeginningIndexes = fuzzysort.prepareNextBeginningIndexes(prepared.target);
                        var firstPossibleI = targetI = matchesSimple[0] === 0 ? 0 : nextBeginningIndexes[matchesSimple[0] - 1];
                        // Our target string successfully matched all characters in sequence!
                        // Let's try a more advanced and strict test to improve the score
                        // only count it as a match if it's consecutive or a beginning character!
                        if (targetI !== targetLen) for(;;){
                            if (targetI >= targetLen) {
                                // We failed to find a good spot for this search char, go back to the previous search char and force it forward
                                if (searchI <= 0) {
                                    // We failed to push chars forward for a better match
                                    // transpose, starting from the beginning
                                    ++typoStrictI;
                                    if (typoStrictI > searchLen - 2) break;
                                    if (searchLowerCodes[typoStrictI] === searchLowerCodes[typoStrictI + 1]) continue; // doesn't make sense to transpose a repeat char
                                    targetI = firstPossibleI;
                                    continue;
                                }
                                --searchI;
                                var lastMatch = matchesStrict[--matchesStrictLen];
                                targetI = nextBeginningIndexes[lastMatch];
                            } else {
                                var isMatch = searchLowerCodes[typoStrictI === 0 ? searchI : typoStrictI === searchI ? searchI + 1 : typoStrictI === searchI - 1 ? searchI - 1 : searchI] === targetLowerCodes[targetI];
                                if (isMatch) {
                                    matchesStrict[matchesStrictLen++] = targetI;
                                    ++searchI;
                                    if (searchI === searchLen) {
                                        successStrict = true;
                                        break;
                                    }
                                    ++targetI;
                                } else {
                                    targetI = nextBeginningIndexes[targetI];
                                }
                            }
                        }
                        {
                            // tally up the score & keep track of matches for highlighting later
                            if (successStrict) {
                                var matchesBest = matchesStrict;
                                var matchesBestLen = matchesStrictLen;
                            } else {
                                var matchesBest = matchesSimple;
                                var matchesBestLen = matchesSimpleLen;
                            }
                            var score = 0;
                            var lastTargetI = -1;
                            for(var i = 0; i < searchLen; ++i){
                                var targetI = matchesBest[i];
                                // score only goes down if they're not consecutive
                                if (lastTargetI !== targetI - 1) score -= targetI;
                                lastTargetI = targetI;
                            }
                            if (!successStrict) {
                                score *= 1000;
                                if (typoSimpleI !== 0) score += -20; /*typoPenalty*/ 
                            } else {
                                if (typoStrictI !== 0) score += -20; /*typoPenalty*/ 
                            }
                            score -= targetLen - searchLen;
                            prepared.score = score;
                            prepared.indexes = new Array(matchesBestLen);
                            for(var i = matchesBestLen - 1; i >= 0; --i){
                                prepared.indexes[i] = matchesBest[i];
                            }
                            return prepared;
                        }
                    },
                    algorithmNoTypo: function algorithmNoTypo(searchLowerCodes, prepared, searchLowerCode) {
                        var targetLowerCodes = prepared._targetLowerCodes;
                        var searchLen = searchLowerCodes.length;
                        var targetLen = targetLowerCodes.length;
                        var searchI = 0; // where we at
                        var targetI = 0; // where you at
                        var matchesSimpleLen = 0;
                        // very basic fuzzy match; to remove non-matching targets ASAP!
                        // walk through target. find sequential matches.
                        // if all chars aren't found then exit
                        for(;;){
                            var isMatch = searchLowerCode === targetLowerCodes[targetI];
                            if (isMatch) {
                                matchesSimple[matchesSimpleLen++] = targetI;
                                ++searchI;
                                if (searchI === searchLen) break;
                                searchLowerCode = searchLowerCodes[searchI];
                            }
                            ++targetI;
                            if (targetI >= targetLen) return null; // Failed to find searchI
                        }
                        var searchI = 0;
                        var successStrict = false;
                        var matchesStrictLen = 0;
                        var nextBeginningIndexes = prepared._nextBeginningIndexes;
                        if (nextBeginningIndexes === null) nextBeginningIndexes = prepared._nextBeginningIndexes = fuzzysort.prepareNextBeginningIndexes(prepared.target);
                        targetI = matchesSimple[0] === 0 ? 0 : nextBeginningIndexes[matchesSimple[0] - 1];
                        // Our target string successfully matched all characters in sequence!
                        // Let's try a more advanced and strict test to improve the score
                        // only count it as a match if it's consecutive or a beginning character!
                        if (targetI !== targetLen) for(;;){
                            if (targetI >= targetLen) {
                                // We failed to find a good spot for this search char, go back to the previous search char and force it forward
                                if (searchI <= 0) break; // We failed to push chars forward for a better match
                                --searchI;
                                var lastMatch = matchesStrict[--matchesStrictLen];
                                targetI = nextBeginningIndexes[lastMatch];
                            } else {
                                var isMatch = searchLowerCodes[searchI] === targetLowerCodes[targetI];
                                if (isMatch) {
                                    matchesStrict[matchesStrictLen++] = targetI;
                                    ++searchI;
                                    if (searchI === searchLen) {
                                        successStrict = true;
                                        break;
                                    }
                                    ++targetI;
                                } else {
                                    targetI = nextBeginningIndexes[targetI];
                                }
                            }
                        }
                        {
                            // tally up the score & keep track of matches for highlighting later
                            if (successStrict) {
                                var matchesBest = matchesStrict;
                                var matchesBestLen = matchesStrictLen;
                            } else {
                                var matchesBest = matchesSimple;
                                var matchesBestLen = matchesSimpleLen;
                            }
                            var score = 0;
                            var lastTargetI = -1;
                            for(var i = 0; i < searchLen; ++i){
                                var targetI = matchesBest[i];
                                // score only goes down if they're not consecutive
                                if (lastTargetI !== targetI - 1) score -= targetI;
                                lastTargetI = targetI;
                            }
                            if (!successStrict) score *= 1000;
                            score -= targetLen - searchLen;
                            prepared.score = score;
                            prepared.indexes = new Array(matchesBestLen);
                            for(var i = matchesBestLen - 1; i >= 0; --i){
                                prepared.indexes[i] = matchesBest[i];
                            }
                            return prepared;
                        }
                    },
                    prepareLowerCodes: function prepareLowerCodes(str) {
                        var strLen = str.length;
                        var lowerCodes = []; // new Array(strLen)    sparse array is too slow
                        var lower = str.toLowerCase();
                        for(var i = 0; i < strLen; ++i){
                            lowerCodes[i] = lower.charCodeAt(i);
                        }
                        return lowerCodes;
                    },
                    prepareBeginningIndexes: function prepareBeginningIndexes(target) {
                        var targetLen = target.length;
                        var beginningIndexes = [];
                        var beginningIndexesLen = 0;
                        var wasUpper = false;
                        var wasAlphanum = false;
                        for(var i = 0; i < targetLen; ++i){
                            var targetCode = target.charCodeAt(i);
                            var isUpper = targetCode >= 65 && targetCode <= 90;
                            var isAlphanum = isUpper || targetCode >= 97 && targetCode <= 122 || targetCode >= 48 && targetCode <= 57;
                            var isBeginning = isUpper && !wasUpper || !wasAlphanum || !isAlphanum;
                            wasUpper = isUpper;
                            wasAlphanum = isAlphanum;
                            if (isBeginning) beginningIndexes[beginningIndexesLen++] = i;
                        }
                        return beginningIndexes;
                    },
                    prepareNextBeginningIndexes: function prepareNextBeginningIndexes(target) {
                        var targetLen = target.length;
                        var beginningIndexes = fuzzysort.prepareBeginningIndexes(target);
                        var nextBeginningIndexes = []; // new Array(targetLen)     sparse array is too slow
                        var lastIsBeginning = beginningIndexes[0];
                        var lastIsBeginningI = 0;
                        for(var i = 0; i < targetLen; ++i){
                            if (lastIsBeginning > i) {
                                nextBeginningIndexes[i] = lastIsBeginning;
                            } else {
                                lastIsBeginning = beginningIndexes[++lastIsBeginningI];
                                nextBeginningIndexes[i] = lastIsBeginning === undefined ? targetLen : lastIsBeginning;
                            }
                        }
                        return nextBeginningIndexes;
                    },
                    cleanup: cleanup,
                    new: fuzzysortNew
                };
                return fuzzysort;
            } // fuzzysortNew
            // This stuff is outside fuzzysortNew, because it's shared with instances of fuzzysort.new()
            var isNode = typeof commonjsRequire !== 'undefined' && typeof window === 'undefined';
            var MyMap = typeof Map === 'function' ? Map : function() {
                var s = Object.create(null);
                this.get = function(k) {
                    return s[k];
                };
                this.set = function(k, val) {
                    s[k] = val;
                    return this;
                };
                this.clear = function() {
                    s = Object.create(null);
                };
            };
            var preparedCache = new MyMap();
            var preparedSearchCache = new MyMap();
            var noResults = [];
            noResults.total = 0;
            var matchesSimple = [];
            var matchesStrict = [];
            function cleanup() {
                preparedCache.clear();
                preparedSearchCache.clear();
                matchesSimple = [];
                matchesStrict = [];
            }
            function defaultScoreFn(a) {
                var max = -9007199254740991;
                for(var i = a.length - 1; i >= 0; --i){
                    var result = a[i];
                    if (result === null) continue;
                    var score = result.score;
                    if (score > max) max = score;
                }
                if (max === -9007199254740991) return null;
                return max;
            }
            // prop = 'key'              2.5ms optimized for this case, seems to be about as fast as direct obj[prop]
            // prop = 'key1.key2'        10ms
            // prop = ['key1', 'key2']   27ms
            function getValue(obj, prop) {
                var tmp = obj[prop];
                if (tmp !== undefined) return tmp;
                var segs = prop;
                if (!Array.isArray(prop)) segs = prop.split('.');
                var len = segs.length;
                var i = -1;
                while(obj && ++i < len){
                    obj = obj[segs[i]];
                }
                return obj;
            }
            function isObj(x) {
                return _typeof(x) === 'object';
            } // faster as a function
            // Hacked version of https://github.com/lemire/FastPriorityQueue.js
            var fastpriorityqueue = function fastpriorityqueue() {
                var r = [], o = 0, e = {};
                function n() {
                    for(var e = 0, n = r[e], c = 1; c < o;){
                        var f = c + 1;
                        e = c, f < o && r[f].score < r[c].score && (e = f), r[e - 1 >> 1] = r[e], c = 1 + (e << 1);
                    }
                    for(var a = e - 1 >> 1; e > 0 && n.score < r[a].score; a = (e = a) - 1 >> 1){
                        r[e] = r[a];
                    }
                    r[e] = n;
                }
                return e.add = function(e) {
                    var n = o;
                    r[o++] = e;
                    for(var c = n - 1 >> 1; n > 0 && e.score < r[c].score; c = (n = c) - 1 >> 1){
                        r[n] = r[c];
                    }
                    r[n] = e;
                }, e.poll = function() {
                    if (0 !== o) {
                        var e = r[0];
                        return r[0] = r[--o], n(), e;
                    }
                }, e.peek = function(e) {
                    if (0 !== o) return r[0];
                }, e.replaceTop = function(o) {
                    r[0] = o, n();
                }, e;
            };
            var q = fastpriorityqueue(); // reuse this, except for async, it needs to make its own
            return fuzzysortNew();
        }); // UMD
    // TODO: (performance) wasm version!?
    // TODO: (performance) threads?
    // TODO: (performance) avoid cache misses
    // TODO: (performance) preparedCache is a memory leak
    // TODO: (like sublime) backslash === forwardslash
    // TODO: (like sublime) spaces: "a b" should do 2 searches 1 for a and 1 for b
    // TODO: (scoring) garbage in targets that allows most searches to strict match need a penality
    // TODO: (performance) idk if allowTypo is optimized
    })(fuzzysort$1);
    var fuzzysort = fuzzysort$1.exports;
    var stats = {
        failedTests: [],
        defined: 0,
        completed: 0
    };
    // Escape text for attribute or text content.
    function escapeText(str) {
        if (!str) {
            return '';
        }
        // Both single quotes and double quotes (for attributes)
        return ('' + str).replace(/['"<>&]/g, function(s) {
            switch(s){
                case "'":
                    return '&#039;';
                case '"':
                    return '&quot;';
                case '<':
                    return '&lt;';
                case '>':
                    return '&gt;';
                case '&':
                    return '&amp;';
            }
        });
    }
    (function() {
        // Don't load the HTML Reporter on non-browser environments
        if (!window$1 || !document) {
            return;
        }
        QUnit.reporters.perf.init(QUnit);
        var config = QUnit.config;
        var hiddenTests = [];
        var collapseNext = false;
        var hasOwn = Object.prototype.hasOwnProperty;
        var unfilteredUrl = setUrl({
            filter: undefined,
            module: undefined,
            moduleId: undefined,
            testId: undefined
        });
        var dropdownData = null;
        function trim(string) {
            if (typeof string.trim === 'function') {
                return string.trim();
            } else {
                return string.replace(/^\s+|\s+$/g, '');
            }
        }
        function addEvent(elem, type, fn) {
            elem.addEventListener(type, fn, false);
        }
        function removeEvent(elem, type, fn) {
            elem.removeEventListener(type, fn, false);
        }
        function addEvents(elems, type, fn) {
            var i = elems.length;
            while(i--){
                addEvent(elems[i], type, fn);
            }
        }
        function hasClass(elem, name) {
            return (' ' + elem.className + ' ').indexOf(' ' + name + ' ') >= 0;
        }
        function addClass(elem, name) {
            if (!hasClass(elem, name)) {
                elem.className += (elem.className ? ' ' : '') + name;
            }
        }
        function toggleClass(elem, name, force) {
            if (force || typeof force === 'undefined' && !hasClass(elem, name)) {
                addClass(elem, name);
            } else {
                removeClass(elem, name);
            }
        }
        function removeClass(elem, name) {
            var set = ' ' + elem.className + ' ';
            // Class name may appear multiple times
            while(set.indexOf(' ' + name + ' ') >= 0){
                set = set.replace(' ' + name + ' ', ' ');
            }
            // Trim for prettiness
            elem.className = trim(set);
        }
        function id(name) {
            return document.getElementById && document.getElementById(name);
        }
        function abortTests() {
            var abortButton = id('qunit-abort-tests-button');
            if (abortButton) {
                abortButton.disabled = true;
                abortButton.innerHTML = 'Aborting...';
            }
            QUnit.config.queue.length = 0;
            return false;
        }
        function interceptNavigation(ev) {
            // Trim potential accidental whitespace so that QUnit doesn't throw an error about no tests matching the filter.
            var filterInputElem = id('qunit-filter-input');
            filterInputElem.value = trim(filterInputElem.value);
            applyUrlParams();
            if (ev && ev.preventDefault) {
                ev.preventDefault();
            }
            return false;
        }
        function getUrlConfigHtml() {
            var selection = false;
            var urlConfig = config.urlConfig;
            var urlConfigHtml = '';
            for(var i = 0; i < urlConfig.length; i++){
                // Options can be either strings or objects with nonempty "id" properties
                var val = config.urlConfig[i];
                if (typeof val === 'string') {
                    val = {
                        id: val,
                        label: val
                    };
                }
                var escaped = escapeText(val.id);
                var escapedTooltip = escapeText(val.tooltip);
                if (!val.value || typeof val.value === 'string') {
                    urlConfigHtml += "<label for='qunit-urlconfig-" + escaped + "' title='" + escapedTooltip + "'><input id='qunit-urlconfig-" + escaped + "' name='" + escaped + "' type='checkbox'" + (val.value ? " value='" + escapeText(val.value) + "'" : '') + (config[val.id] ? " checked='checked'" : '') + " title='" + escapedTooltip + "' />" + escapeText(val.label) + '</label>';
                } else {
                    urlConfigHtml += "<label for='qunit-urlconfig-" + escaped + "' title='" + escapedTooltip + "'>" + val.label + ": </label><select id='qunit-urlconfig-" + escaped + "' name='" + escaped + "' title='" + escapedTooltip + "'><option></option>";
                    if (Array.isArray(val.value)) {
                        for(var j = 0; j < val.value.length; j++){
                            escaped = escapeText(val.value[j]);
                            urlConfigHtml += "<option value='" + escaped + "'" + (config[val.id] === val.value[j] ? (selection = true) && " selected='selected'" : '') + '>' + escaped + '</option>';
                        }
                    } else {
                        for(var _j in val.value){
                            if (hasOwn.call(val.value, _j)) {
                                urlConfigHtml += "<option value='" + escapeText(_j) + "'" + (config[val.id] === _j ? (selection = true) && " selected='selected'" : '') + '>' + escapeText(val.value[_j]) + '</option>';
                            }
                        }
                    }
                    if (config[val.id] && !selection) {
                        escaped = escapeText(config[val.id]);
                        urlConfigHtml += "<option value='" + escaped + "' selected='selected' disabled='disabled'>" + escaped + '</option>';
                    }
                    urlConfigHtml += '</select>';
                }
            }
            return urlConfigHtml;
        }
        // Handle "click" events on toolbar checkboxes and "change" for select menus.
        // Updates the URL with the new state of `config.urlConfig` values.
        function toolbarChanged() {
            var field = this;
            var params = {};
            // Detect if field is a select menu or a checkbox
            var value;
            if ('selectedIndex' in field) {
                value = field.options[field.selectedIndex].value || undefined;
            } else {
                value = field.checked ? field.defaultValue || true : undefined;
            }
            params[field.name] = value;
            var updatedUrl = setUrl(params);
            // Check if we can apply the change without a page refresh
            if (field.name === 'hidepassed' && 'replaceState' in window$1.history) {
                QUnit.urlParams[field.name] = value;
                config[field.name] = value || false;
                var tests = id('qunit-tests');
                if (tests) {
                    var length = tests.children.length;
                    var children = tests.children;
                    if (field.checked) {
                        for(var i = 0; i < length; i++){
                            var test = children[i];
                            var className = test ? test.className : '';
                            var classNameHasPass = className.indexOf('pass') > -1;
                            var classNameHasSkipped = className.indexOf('skipped') > -1;
                            if (classNameHasPass || classNameHasSkipped) {
                                hiddenTests.push(test);
                            }
                        }
                        var _iterator = _createForOfIteratorHelper(hiddenTests), _step;
                        try {
                            for(_iterator.s(); !(_step = _iterator.n()).done;){
                                var hiddenTest = _step.value;
                                tests.removeChild(hiddenTest);
                            }
                        } catch (err) {
                            _iterator.e(err);
                        } finally{
                            _iterator.f();
                        }
                    } else {
                        var _test;
                        while((_test = hiddenTests.pop()) != null){
                            tests.appendChild(_test);
                        }
                    }
                }
                window$1.history.replaceState(null, '', updatedUrl);
            } else {
                window$1.location = updatedUrl;
            }
        }
        function setUrl(params) {
            var querystring = '?';
            var location = window$1.location;
            params = extend(extend({}, QUnit.urlParams), params);
            for(var key in params){
                // Skip inherited or undefined properties
                if (hasOwn.call(params, key) && params[key] !== undefined) {
                    // Output a parameter for each value of this key
                    // (but usually just one)
                    var arrValue = [].concat(params[key]);
                    for(var i = 0; i < arrValue.length; i++){
                        querystring += encodeURIComponent(key);
                        if (arrValue[i] !== true) {
                            querystring += '=' + encodeURIComponent(arrValue[i]);
                        }
                        querystring += '&';
                    }
                }
            }
            return location.protocol + '//' + location.host + location.pathname + querystring.slice(0, -1);
        }
        function applyUrlParams() {
            var filter = id('qunit-filter-input').value;
            window$1.location = setUrl({
                filter: filter === '' ? undefined : filter,
                moduleId: _toConsumableArray(dropdownData.selectedMap.keys()),
                // Remove module and testId filter
                module: undefined,
                testId: undefined
            });
        }
        function toolbarUrlConfigContainer() {
            var urlConfigContainer = document.createElement('span');
            urlConfigContainer.innerHTML = getUrlConfigHtml();
            addClass(urlConfigContainer, 'qunit-url-config');
            addEvents(urlConfigContainer.getElementsByTagName('input'), 'change', toolbarChanged);
            addEvents(urlConfigContainer.getElementsByTagName('select'), 'change', toolbarChanged);
            return urlConfigContainer;
        }
        function abortTestsButton() {
            var button = document.createElement('button');
            button.id = 'qunit-abort-tests-button';
            button.innerHTML = 'Abort';
            addEvent(button, 'click', abortTests);
            return button;
        }
        function toolbarLooseFilter() {
            var filter = document.createElement('form');
            var label = document.createElement('label');
            var input = document.createElement('input');
            var button = document.createElement('button');
            addClass(filter, 'qunit-filter');
            label.innerHTML = 'Filter: ';
            input.type = 'text';
            input.value = config.filter || '';
            input.name = 'filter';
            input.id = 'qunit-filter-input';
            button.innerHTML = 'Go';
            label.appendChild(input);
            filter.appendChild(label);
            filter.appendChild(document.createTextNode(' '));
            filter.appendChild(button);
            addEvent(filter, 'submit', interceptNavigation);
            return filter;
        }
        function createModuleListItem(moduleId, name, checked) {
            return '<li><label class="clickable' + (checked ? ' checked' : '') + '"><input type="checkbox" ' + 'value="' + escapeText(moduleId) + '"' + (checked ? ' checked="checked"' : '') + ' />' + escapeText(name) + '</label></li>';
        }
        /**
		 * @param {Array} Results from fuzzysort
		 * @return {string} HTML
		 */ function moduleListHtml(results) {
            var html = '';
            // Hoist the already selected items, and show them always
            // even if not matched by the current search.
            dropdownData.selectedMap.forEach(function(name, moduleId) {
                html += createModuleListItem(moduleId, name, true);
            });
            for(var i = 0; i < results.length; i++){
                var mod = results[i].obj;
                if (!dropdownData.selectedMap.has(mod.moduleId)) {
                    html += createModuleListItem(mod.moduleId, mod.name, false);
                }
            }
            return html;
        }
        function toolbarModuleFilter(beginDetails) {
            var initialSelected = null;
            dropdownData = {
                options: beginDetails.modules.slice(),
                selectedMap: new StringMap(),
                isDirty: function isDirty() {
                    return _toConsumableArray(dropdownData.selectedMap.keys()).sort().join(',') !== _toConsumableArray(initialSelected.keys()).sort().join(',');
                }
            };
            if (config.moduleId.length) {
                // The module dropdown is seeded with the runtime configuration of the last run.
                //
                // We don't reference `config.moduleId` directly after this and keep our own
                // copy because:
                // 1. This naturally filters out unknown moduleIds.
                // 2. Gives us a place to manage and remember unsubmitted checkbox changes.
                // 3. Gives us an efficient way to map a selected moduleId to module name
                //    during rendering.
                for(var i = 0; i < beginDetails.modules.length; i++){
                    var mod = beginDetails.modules[i];
                    if (config.moduleId.indexOf(mod.moduleId) !== -1) {
                        dropdownData.selectedMap.set(mod.moduleId, mod.name);
                    }
                }
            }
            initialSelected = new StringMap(dropdownData.selectedMap);
            var moduleSearch = document.createElement('input');
            moduleSearch.id = 'qunit-modulefilter-search';
            moduleSearch.autocomplete = 'off';
            addEvent(moduleSearch, 'input', searchInput);
            addEvent(moduleSearch, 'input', searchFocus);
            addEvent(moduleSearch, 'focus', searchFocus);
            addEvent(moduleSearch, 'click', searchFocus);
            var label = document.createElement('label');
            label.htmlFor = 'qunit-modulefilter-search';
            label.textContent = 'Module:';
            var searchContainer = document.createElement('span');
            searchContainer.id = 'qunit-modulefilter-search-container';
            searchContainer.appendChild(moduleSearch);
            var applyButton = document.createElement('button');
            applyButton.textContent = 'Apply';
            applyButton.title = 'Re-run the selected test modules';
            addEvent(applyButton, 'click', applyUrlParams);
            var resetButton = document.createElement('button');
            resetButton.textContent = 'Reset';
            resetButton.type = 'reset';
            resetButton.title = 'Restore the previous module selection';
            var clearButton = document.createElement('button');
            clearButton.textContent = 'Select none';
            clearButton.type = 'button';
            clearButton.title = 'Clear the current module selection';
            addEvent(clearButton, 'click', function() {
                dropdownData.selectedMap.clear();
                selectionChange();
                searchInput();
            });
            var actions = document.createElement('span');
            actions.id = 'qunit-modulefilter-actions';
            actions.appendChild(applyButton);
            actions.appendChild(resetButton);
            if (initialSelected.size) {
                // Only show clear button if functionally different from reset
                actions.appendChild(clearButton);
            }
            var dropDownList = document.createElement('ul');
            dropDownList.id = 'qunit-modulefilter-dropdown-list';
            var dropDown = document.createElement('div');
            dropDown.id = 'qunit-modulefilter-dropdown';
            dropDown.style.display = 'none';
            dropDown.appendChild(actions);
            dropDown.appendChild(dropDownList);
            addEvent(dropDown, 'change', selectionChange);
            searchContainer.appendChild(dropDown);
            // Set initial moduleSearch.placeholder and clearButton/resetButton.
            selectionChange();
            var moduleFilter = document.createElement('form');
            moduleFilter.id = 'qunit-modulefilter';
            moduleFilter.appendChild(label);
            moduleFilter.appendChild(document.createTextNode(' '));
            moduleFilter.appendChild(searchContainer);
            addEvent(moduleFilter, 'submit', interceptNavigation);
            addEvent(moduleFilter, 'reset', function() {
                dropdownData.selectedMap = new StringMap(initialSelected);
                // Set moduleSearch.placeholder and reflect non-dirty state
                selectionChange();
                searchInput();
            });
            // Enables show/hide for the dropdown
            function searchFocus() {
                if (dropDown.style.display !== 'none') {
                    return;
                }
                // Optimization: Defer rendering options until focussed.
                // https://github.com/qunitjs/qunit/issues/1664
                searchInput();
                dropDown.style.display = 'block';
                // Hide on Escape keydown or on click outside the container
                addEvent(document, 'click', hideHandler);
                addEvent(document, 'keydown', hideHandler);
                function hideHandler(e) {
                    var inContainer = moduleFilter.contains(e.target);
                    if (e.keyCode === 27 || !inContainer) {
                        if (e.keyCode === 27 && inContainer) {
                            moduleSearch.focus();
                        }
                        dropDown.style.display = 'none';
                        removeEvent(document, 'click', hideHandler);
                        removeEvent(document, 'keydown', hideHandler);
                        moduleSearch.value = '';
                        searchInput();
                    }
                }
            }
            /**
			 * @param {string} searchText
			 * @return {string} HTML
			 */ function filterModules(searchText) {
                var results;
                if (searchText === '') {
                    // Improve on-boarding experience by having an immediate display of
                    // module names, indicating how the interface works. This also makes
                    // for a quicker interaction in the common case of small projects.
                    // Don't mandate typing just to get the menu.
                    results = dropdownData.options.slice(0, 20).map(function(obj) {
                        // Fake empty results. https://github.com/farzher/fuzzysort/issues/41
                        return {
                            obj: obj
                        };
                    });
                } else {
                    results = fuzzysort.go(searchText, dropdownData.options, {
                        limit: 20,
                        key: 'name',
                        allowTypo: true
                    });
                }
                return moduleListHtml(results);
            }
            // Processes module search box input
            var searchInputTimeout;
            function searchInput() {
                // Use a debounce with a ~0ms timeout. This is effectively instantaneous,
                // but is better than undebounced because it avoids an ever-growing
                // backlog of unprocessed now-outdated input events if fuzzysearch or
                // drodown DOM is slow (e.g. very large test suite).
                window$1.clearTimeout(searchInputTimeout);
                searchInputTimeout = window$1.setTimeout(function() {
                    dropDownList.innerHTML = filterModules(moduleSearch.value);
                });
            }
            // Processes checkbox change, or a generic render (initial render, or after reset event)
            // Avoid any dropdown rendering here as this is used by toolbarModuleFilter()
            // during the initial render, which should not delay test execution.
            function selectionChange(evt) {
                var checkbox = evt && evt.target || null;
                if (checkbox) {
                    // Update internal state
                    if (checkbox.checked) {
                        dropdownData.selectedMap.set(checkbox.value, checkbox.parentNode.textContent);
                    } else {
                        dropdownData.selectedMap.delete(checkbox.value);
                    }
                    // Update UI state
                    toggleClass(checkbox.parentNode, 'checked', checkbox.checked);
                }
                var textForm = dropdownData.selectedMap.size ? dropdownData.selectedMap.size + ' ' + (dropdownData.selectedMap.size === 1 ? 'module' : 'modules') : 'All modules';
                moduleSearch.placeholder = textForm;
                moduleSearch.title = 'Type to search through and reduce the list.';
                resetButton.disabled = !dropdownData.isDirty();
                clearButton.style.display = dropdownData.selectedMap.size ? '' : 'none';
            }
            return moduleFilter;
        }
        function appendToolbar(beginDetails) {
            var toolbar = id('qunit-testrunner-toolbar');
            if (toolbar) {
                toolbar.appendChild(toolbarUrlConfigContainer());
                var toolbarFilters = document.createElement('span');
                toolbarFilters.id = 'qunit-toolbar-filters';
                toolbarFilters.appendChild(toolbarLooseFilter());
                toolbarFilters.appendChild(toolbarModuleFilter(beginDetails));
                var clearfix = document.createElement('div');
                clearfix.className = 'clearfix';
                toolbar.appendChild(toolbarFilters);
                toolbar.appendChild(clearfix);
            }
        }
        function appendHeader() {
            var header = id('qunit-header');
            if (header) {
                header.innerHTML = "<a href='" + escapeText(unfilteredUrl) + "'>" + header.innerHTML + '</a> ';
            }
        }
        function appendBanner() {
            var banner = id('qunit-banner');
            if (banner) {
                banner.className = '';
            }
        }
        function appendTestResults() {
            var tests = id('qunit-tests');
            var result = id('qunit-testresult');
            var controls;
            if (result) {
                result.parentNode.removeChild(result);
            }
            if (tests) {
                tests.innerHTML = '';
                result = document.createElement('p');
                result.id = 'qunit-testresult';
                result.className = 'result';
                tests.parentNode.insertBefore(result, tests);
                result.innerHTML = '<div id="qunit-testresult-display">Running...<br />&#160;</div>' + '<div id="qunit-testresult-controls"></div>' + '<div class="clearfix"></div>';
                controls = id('qunit-testresult-controls');
            }
            if (controls) {
                controls.appendChild(abortTestsButton());
            }
        }
        function appendFilteredTest() {
            var testId = QUnit.config.testId;
            if (!testId || testId.length <= 0) {
                return '';
            }
            return "<div id='qunit-filteredTest'>Rerunning selected tests: " + escapeText(testId.join(', ')) + " <a id='qunit-clearFilter' href='" + escapeText(unfilteredUrl) + "'>Run all tests</a></div>";
        }
        function appendUserAgent() {
            var userAgent = id('qunit-userAgent');
            if (userAgent) {
                userAgent.innerHTML = '';
                userAgent.appendChild(document.createTextNode('QUnit ' + QUnit.version + '; ' + navigator.userAgent));
            }
        }
        function appendInterface(beginDetails) {
            var qunit = id('qunit');
            // For compat with QUnit 1.2, and to support fully custom theme HTML,
            // we will use any existing elements if no id="qunit" element exists.
            //
            // Note that we don't fail or fallback to creating it ourselves,
            // because not having id="qunit" (and not having the below elements)
            // simply means QUnit acts headless, allowing users to use their own
            // reporters, or for a test runner to listen for events directly without
            // having the HTML reporter actively render anything.
            if (qunit) {
                qunit.setAttribute('role', 'main');
                // Since QUnit 1.3, these are created automatically if the page
                // contains id="qunit".
                qunit.innerHTML = "<h1 id='qunit-header'>" + escapeText(document.title) + '</h1>' + "<h2 id='qunit-banner'></h2>" + "<div id='qunit-testrunner-toolbar' role='navigation'></div>" + appendFilteredTest() + "<h2 id='qunit-userAgent'></h2>" + "<ol id='qunit-tests'></ol>";
            }
            appendHeader();
            appendBanner();
            appendTestResults();
            appendUserAgent();
            appendToolbar(beginDetails);
        }
        function appendTest(name, testId, moduleName) {
            var tests = id('qunit-tests');
            if (!tests) {
                return;
            }
            var title = document.createElement('strong');
            title.innerHTML = getNameHtml(name, moduleName);
            var testBlock = document.createElement('li');
            testBlock.appendChild(title);
            // No ID or rerun link for "global failure" blocks
            if (testId !== undefined) {
                var rerunTrigger = document.createElement('a');
                rerunTrigger.innerHTML = 'Rerun';
                rerunTrigger.href = setUrl({
                    testId: testId
                });
                testBlock.id = 'qunit-test-output-' + testId;
                testBlock.appendChild(rerunTrigger);
            }
            var assertList = document.createElement('ol');
            assertList.className = 'qunit-assert-list';
            testBlock.appendChild(assertList);
            tests.appendChild(testBlock);
            return testBlock;
        }
        // HTML Reporter initialization and load
        QUnit.on('runStart', function(runStart) {
            stats.defined = runStart.testCounts.total;
        });
        QUnit.begin(function(beginDetails) {
            // Initialize QUnit elements
            // This is done from begin() instead of runStart, because
            // urlparams.js uses begin(), which we need to wait for.
            // urlparams.js in turn uses begin() to allow plugins to
            // add entries to QUnit.config.urlConfig, which may be done
            // asynchronously.
            // <https://github.com/qunitjs/qunit/issues/1657>
            appendInterface(beginDetails);
        });
        function getRerunFailedHtml(failedTests) {
            if (failedTests.length === 0) {
                return '';
            }
            var href = setUrl({
                testId: failedTests
            });
            return [
                "<br /><a href='" + escapeText(href) + "'>",
                failedTests.length === 1 ? 'Rerun 1 failed test' : 'Rerun ' + failedTests.length + ' failed tests',
                '</a>'
            ].join('');
        }
        QUnit.on('runEnd', function(runEnd) {
            var banner = id('qunit-banner');
            var tests = id('qunit-tests');
            var abortButton = id('qunit-abort-tests-button');
            var assertPassed = config.stats.all - config.stats.bad;
            var html = [
                runEnd.testCounts.total,
                ' tests completed in ',
                runEnd.runtime,
                ' milliseconds, with ',
                runEnd.testCounts.failed,
                ' failed, ',
                runEnd.testCounts.skipped,
                ' skipped, and ',
                runEnd.testCounts.todo,
                ' todo.<br />',
                "<span class='passed'>",
                assertPassed,
                "</span> assertions of <span class='total'>",
                config.stats.all,
                "</span> passed, <span class='failed'>",
                config.stats.bad,
                '</span> failed.',
                getRerunFailedHtml(stats.failedTests)
            ].join('');
            var test;
            var assertLi;
            var assertList;
            // Update remaining tests to aborted
            if (abortButton && abortButton.disabled) {
                html = 'Tests aborted after ' + runEnd.runtime + ' milliseconds.';
                for(var i = 0; i < tests.children.length; i++){
                    test = tests.children[i];
                    if (test.className === '' || test.className === 'running') {
                        test.className = 'aborted';
                        assertList = test.getElementsByTagName('ol')[0];
                        assertLi = document.createElement('li');
                        assertLi.className = 'fail';
                        assertLi.innerHTML = 'Test aborted.';
                        assertList.appendChild(assertLi);
                    }
                }
            }
            if (banner && (!abortButton || abortButton.disabled === false)) {
                banner.className = runEnd.status === 'failed' ? 'qunit-fail' : 'qunit-pass';
            }
            if (abortButton) {
                abortButton.parentNode.removeChild(abortButton);
            }
            if (tests) {
                id('qunit-testresult-display').innerHTML = html;
            }
            if (config.altertitle && document.title) {
                // Show ✖ for good, ✔ for bad suite result in title
                // use escape sequences in case file gets loaded with non-utf-8
                // charset
                document.title = [
                    runEnd.status === 'failed' ? "\u2716" : "\u2714",
                    document.title.replace(/^[\u2714\u2716] /i, '')
                ].join(' ');
            }
            // Scroll back to top to show results
            if (config.scrolltop && window$1.scrollTo) {
                window$1.scrollTo(0, 0);
            }
        });
        function getNameHtml(name, module1) {
            var nameHtml = '';
            if (module1) {
                nameHtml = "<span class='module-name'>" + escapeText(module1) + '</span>: ';
            }
            nameHtml += "<span class='test-name'>" + escapeText(name) + '</span>';
            return nameHtml;
        }
        function getProgressHtml(stats) {
            return [
                stats.completed,
                ' / ',
                stats.defined,
                ' tests completed.<br />'
            ].join('');
        }
        QUnit.testStart(function(details) {
            var running, bad;
            appendTest(details.name, details.testId, details.module);
            running = id('qunit-testresult-display');
            if (running) {
                addClass(running, 'running');
                bad = QUnit.config.reorder && details.previousFailure;
                running.innerHTML = [
                    getProgressHtml(stats),
                    bad ? 'Rerunning previously failed test: <br />' : 'Running: ',
                    getNameHtml(details.name, details.module),
                    getRerunFailedHtml(stats.failedTests)
                ].join('');
            }
        });
        function stripHtml(string) {
            // Strip tags, html entity and whitespaces
            return string.replace(/<\/?[^>]+(>|$)/g, '').replace(/&quot;/g, '').replace(/\s+/g, '');
        }
        QUnit.log(function(details) {
            var testItem = id('qunit-test-output-' + details.testId);
            if (!testItem) {
                return;
            }
            var message = escapeText(details.message) || (details.result ? 'okay' : 'failed');
            message = "<span class='test-message'>" + message + '</span>';
            message += "<span class='runtime'>@ " + details.runtime + ' ms</span>';
            var expected;
            var actual;
            var diff;
            var showDiff = false;
            // The pushFailure doesn't provide details.expected
            // when it calls, it's implicit to also not show expected and diff stuff
            // Also, we need to check details.expected existence, as it can exist and be undefined
            if (!details.result && hasOwn.call(details, 'expected')) {
                if (details.negative) {
                    expected = 'NOT ' + QUnit.dump.parse(details.expected);
                } else {
                    expected = QUnit.dump.parse(details.expected);
                }
                actual = QUnit.dump.parse(details.actual);
                message += "<table><tr class='test-expected'><th>Expected: </th><td><pre>" + escapeText(expected) + '</pre></td></tr>';
                if (actual !== expected) {
                    message += "<tr class='test-actual'><th>Result: </th><td><pre>" + escapeText(actual) + '</pre></td></tr>';
                    if (typeof details.actual === 'number' && typeof details.expected === 'number') {
                        if (!isNaN(details.actual) && !isNaN(details.expected)) {
                            showDiff = true;
                            diff = details.actual - details.expected;
                            diff = (diff > 0 ? '+' : '') + diff;
                        }
                    } else if (typeof details.actual !== 'boolean' && typeof details.expected !== 'boolean') {
                        diff = QUnit.diff(expected, actual);
                        // don't show diff if there is zero overlap
                        showDiff = stripHtml(diff).length !== stripHtml(expected).length + stripHtml(actual).length;
                    }
                    if (showDiff) {
                        message += "<tr class='test-diff'><th>Diff: </th><td><pre>" + diff + '</pre></td></tr>';
                    }
                } else if (expected.indexOf('[object Array]') !== -1 || expected.indexOf('[object Object]') !== -1) {
                    message += "<tr class='test-message'><th>Message: </th><td>" + 'Diff suppressed as the depth of object is more than current max depth (' + QUnit.config.maxDepth + ').<p>Hint: Use <code>QUnit.dump.maxDepth</code> to ' + " run with a higher max depth or <a href='" + escapeText(setUrl({
                        maxDepth: -1
                    })) + "'>" + 'Rerun</a> without max depth.</p></td></tr>';
                } else {
                    message += "<tr class='test-message'><th>Message: </th><td>" + 'Diff suppressed as the expected and actual results have an equivalent' + ' serialization</td></tr>';
                }
                if (details.source) {
                    message += "<tr class='test-source'><th>Source: </th><td><pre>" + escapeText(details.source) + '</pre></td></tr>';
                }
                message += '</table>';
            // This occurs when pushFailure is set and we have an extracted stack trace
            } else if (!details.result && details.source) {
                message += '<table>' + "<tr class='test-source'><th>Source: </th><td><pre>" + escapeText(details.source) + '</pre></td></tr>' + '</table>';
            }
            var assertList = testItem.getElementsByTagName('ol')[0];
            var assertLi = document.createElement('li');
            assertLi.className = details.result ? 'pass' : 'fail';
            assertLi.innerHTML = message;
            assertList.appendChild(assertLi);
        });
        QUnit.testDone(function(details) {
            var tests = id('qunit-tests');
            var testItem = id('qunit-test-output-' + details.testId);
            if (!tests || !testItem) {
                return;
            }
            removeClass(testItem, 'running');
            var status;
            if (details.failed > 0) {
                status = 'failed';
            } else if (details.todo) {
                status = 'todo';
            } else {
                status = details.skipped ? 'skipped' : 'passed';
            }
            var assertList = testItem.getElementsByTagName('ol')[0];
            var good = details.passed;
            var bad = details.failed;
            // This test passed if it has no unexpected failed assertions
            var testPassed = details.failed > 0 ? details.todo : !details.todo;
            if (testPassed) {
                // Collapse the passing tests
                addClass(assertList, 'qunit-collapsed');
            } else {
                stats.failedTests.push(details.testId);
                if (config.collapse) {
                    if (!collapseNext) {
                        // Skip collapsing the first failing test
                        collapseNext = true;
                    } else {
                        // Collapse remaining tests
                        addClass(assertList, 'qunit-collapsed');
                    }
                }
            }
            // The testItem.firstChild is the test name
            var testTitle = testItem.firstChild;
            var testCounts = bad ? "<b class='failed'>" + bad + '</b>, ' + "<b class='passed'>" + good + '</b>, ' : '';
            testTitle.innerHTML += " <b class='counts'>(" + testCounts + details.assertions.length + ')</b>';
            stats.completed++;
            if (details.skipped) {
                testItem.className = 'skipped';
                var skipped = document.createElement('em');
                skipped.className = 'qunit-skipped-label';
                skipped.innerHTML = 'skipped';
                testItem.insertBefore(skipped, testTitle);
            } else {
                addEvent(testTitle, 'click', function() {
                    toggleClass(assertList, 'qunit-collapsed');
                });
                testItem.className = testPassed ? 'pass' : 'fail';
                if (details.todo) {
                    var todoLabel = document.createElement('em');
                    todoLabel.className = 'qunit-todo-label';
                    todoLabel.innerHTML = 'todo';
                    testItem.className += ' todo';
                    testItem.insertBefore(todoLabel, testTitle);
                }
                var time = document.createElement('span');
                time.className = 'runtime';
                time.innerHTML = details.runtime + ' ms';
                testItem.insertBefore(time, assertList);
            }
            // Show the source of the test when showing assertions
            if (details.source) {
                var sourceName = document.createElement('p');
                sourceName.innerHTML = '<strong>Source: </strong>' + escapeText(details.source);
                addClass(sourceName, 'qunit-source');
                if (testPassed) {
                    addClass(sourceName, 'qunit-collapsed');
                }
                addEvent(testTitle, 'click', function() {
                    toggleClass(sourceName, 'qunit-collapsed');
                });
                testItem.appendChild(sourceName);
            }
            if (config.hidepassed && (status === 'passed' || details.skipped)) {
                // use removeChild instead of remove because of support
                hiddenTests.push(testItem);
                tests.removeChild(testItem);
            }
        });
        QUnit.on('error', function(error) {
            var testItem = appendTest('global failure');
            if (!testItem) {
                // HTML Reporter is probably disabled or not yet initialized.
                return;
            }
            // Render similar to a failed assertion (see above QUnit.log callback)
            var message = escapeText(errorString(error));
            message = "<span class='test-message'>" + message + '</span>';
            if (error && error.stack) {
                message += '<table>' + "<tr class='test-source'><th>Source: </th><td><pre>" + escapeText(error.stack) + '</pre></td></tr>' + '</table>';
            }
            var assertList = testItem.getElementsByTagName('ol')[0];
            var assertLi = document.createElement('li');
            assertLi.className = 'fail';
            assertLi.innerHTML = message;
            assertList.appendChild(assertLi);
            // Make it visible
            testItem.className = 'fail';
        });
        // Avoid readyState issue with phantomjs
        // Ref: #818
        var usingPhantom = function(p) {
            return p && p.version && p.version.major > 0;
        }(window$1.phantom);
        if (usingPhantom) {
            console$1.warn('Support for PhantomJS is deprecated and will be removed in QUnit 3.0.');
        }
        if (!usingPhantom && document.readyState === 'complete') {
            QUnit.load();
        } else {
            addEvent(window$1, 'load', QUnit.load);
        }
        // Wrap window.onerror. We will call the original window.onerror to see if
        // the existing handler fully handles the error; if not, we will call the
        // QUnit.onError function.
        var originalWindowOnError = window$1.onerror;
        // Cover uncaught exceptions
        // Returning true will suppress the default browser handler,
        // returning false will let it run.
        window$1.onerror = function(message, fileName, lineNumber, columnNumber, errorObj) {
            var ret = false;
            if (originalWindowOnError) {
                for(var _len = arguments.length, args = new Array(_len > 5 ? _len - 5 : 0), _key = 5; _key < _len; _key++){
                    args[_key - 5] = arguments[_key];
                }
                ret = originalWindowOnError.call.apply(originalWindowOnError, [
                    this,
                    message,
                    fileName,
                    lineNumber,
                    columnNumber,
                    errorObj
                ].concat(args));
            }
            // Treat return value as window.onerror itself does,
            // Only do our handling if not suppressed.
            if (ret !== true) {
                // If there is a current test that sets the internal `ignoreGlobalErrors` field
                // (such as during `assert.throws()`), then the error is ignored and native
                // error reporting is suppressed as well. This is because in browsers, an error
                // can sometimes end up in `window.onerror` instead of in the local try/catch.
                // This ignoring of errors does not apply to our general onUncaughtException
                // method, nor to our `unhandledRejection` handlers, as those are not meant
                // to receive an "expected" error during `assert.throws()`.
                if (config.current && config.current.ignoreGlobalErrors) {
                    return true;
                }
                // According to
                // https://blog.sentry.io/2016/01/04/client-javascript-reporting-window-onerror,
                // most modern browsers support an errorObj argument; use that to
                // get a full stack trace if it's available.
                var error = errorObj || new Error(message);
                if (!error.stack && fileName && lineNumber) {
                    error.stack = "".concat(fileName, ":").concat(lineNumber);
                }
                QUnit.onUncaughtException(error);
            }
            return ret;
        };
        window$1.addEventListener('unhandledrejection', function(event) {
            QUnit.onUncaughtException(event.reason);
        });
    })();
    /*
   * This file is a modified version of google-diff-match-patch's JavaScript implementation
   * (https://code.google.com/p/google-diff-match-patch/source/browse/trunk/javascript/diff_match_patch_uncompressed.js),
   * modifications are licensed as more fully set forth in LICENSE.txt.
   *
   * The original source of google-diff-match-patch is attributable and licensed as follows:
   *
   * Copyright 2006 Google Inc.
   * https://code.google.com/p/google-diff-match-patch/
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * https://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * More Info:
   *  https://code.google.com/p/google-diff-match-patch/
   *
   * Usage: QUnit.diff(expected, actual)
   *
   */ QUnit.diff = function() {
        function DiffMatchPatch() {}
        //  DIFF FUNCTIONS
        /**
		 * The data structure representing a diff is an array of tuples:
		 * [[DIFF_DELETE, 'Hello'], [DIFF_INSERT, 'Goodbye'], [DIFF_EQUAL, ' world.']]
		 * which means: delete 'Hello', add 'Goodbye' and keep ' world.'
		 */ var DIFF_DELETE = -1;
        var DIFF_INSERT = 1;
        var DIFF_EQUAL = 0;
        var hasOwn = Object.prototype.hasOwnProperty;
        /**
		 * Find the differences between two texts.  Simplifies the problem by stripping
		 * any common prefix or suffix off the texts before diffing.
		 * @param {string} text1 Old string to be diffed.
		 * @param {string} text2 New string to be diffed.
		 * @param {boolean=} optChecklines Optional speedup flag. If present and false,
		 *     then don't run a line-level diff first to identify the changed areas.
		 *     Defaults to true, which does a faster, slightly less optimal diff.
		 * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.
		 */ DiffMatchPatch.prototype.DiffMain = function(text1, text2, optChecklines) {
            // The diff must be complete in up to 1 second.
            var deadline = Date.now() + 1000;
            // Check for null inputs.
            if (text1 === null || text2 === null) {
                throw new Error('Cannot diff null input.');
            }
            // Check for equality (speedup).
            if (text1 === text2) {
                if (text1) {
                    return [
                        [
                            DIFF_EQUAL,
                            text1
                        ]
                    ];
                }
                return [];
            }
            if (typeof optChecklines === 'undefined') {
                optChecklines = true;
            }
            // Trim off common prefix (speedup).
            var commonlength = this.diffCommonPrefix(text1, text2);
            var commonprefix = text1.substring(0, commonlength);
            text1 = text1.substring(commonlength);
            text2 = text2.substring(commonlength);
            // Trim off common suffix (speedup).
            commonlength = this.diffCommonSuffix(text1, text2);
            var commonsuffix = text1.substring(text1.length - commonlength);
            text1 = text1.substring(0, text1.length - commonlength);
            text2 = text2.substring(0, text2.length - commonlength);
            // Compute the diff on the middle block.
            var diffs = this.diffCompute(text1, text2, optChecklines, deadline);
            // Restore the prefix and suffix.
            if (commonprefix) {
                diffs.unshift([
                    DIFF_EQUAL,
                    commonprefix
                ]);
            }
            if (commonsuffix) {
                diffs.push([
                    DIFF_EQUAL,
                    commonsuffix
                ]);
            }
            this.diffCleanupMerge(diffs);
            return diffs;
        };
        /**
		 * Reduce the number of edits by eliminating operationally trivial equalities.
		 * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.
		 */ DiffMatchPatch.prototype.diffCleanupEfficiency = function(diffs) {
            var changes, equalities, equalitiesLength, lastequality, pointer, preIns, preDel, postIns, postDel;
            changes = false;
            equalities = []; // Stack of indices where equalities are found.
            equalitiesLength = 0; // Keeping our own length var is faster in JS.
            /** @type {?string} */ lastequality = null;
            // Always equal to diffs[equalities[equalitiesLength - 1]][1]
            pointer = 0; // Index of current position.
            // Is there an insertion operation before the last equality.
            preIns = false;
            // Is there a deletion operation before the last equality.
            preDel = false;
            // Is there an insertion operation after the last equality.
            postIns = false;
            // Is there a deletion operation after the last equality.
            postDel = false;
            while(pointer < diffs.length){
                // Equality found.
                if (diffs[pointer][0] === DIFF_EQUAL) {
                    if (diffs[pointer][1].length < 4 && (postIns || postDel)) {
                        // Candidate found.
                        equalities[equalitiesLength++] = pointer;
                        preIns = postIns;
                        preDel = postDel;
                        lastequality = diffs[pointer][1];
                    } else {
                        // Not a candidate, and can never become one.
                        equalitiesLength = 0;
                        lastequality = null;
                    }
                    postIns = postDel = false;
                // An insertion or deletion.
                } else {
                    if (diffs[pointer][0] === DIFF_DELETE) {
                        postDel = true;
                    } else {
                        postIns = true;
                    }
                    /*
           * Five types to be split:
           * <ins>A</ins><del>B</del>XY<ins>C</ins><del>D</del>
           * <ins>A</ins>X<ins>C</ins><del>D</del>
           * <ins>A</ins><del>B</del>X<ins>C</ins>
           * <ins>A</del>X<ins>C</ins><del>D</del>
           * <ins>A</ins><del>B</del>X<del>C</del>
           */ if (lastequality && (preIns && preDel && postIns && postDel || lastequality.length < 2 && preIns + preDel + postIns + postDel === 3)) {
                        // Duplicate record.
                        diffs.splice(equalities[equalitiesLength - 1], 0, [
                            DIFF_DELETE,
                            lastequality
                        ]);
                        // Change second copy to insert.
                        diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
                        equalitiesLength--; // Throw away the equality we just deleted;
                        lastequality = null;
                        if (preIns && preDel) {
                            // No changes made which could affect previous entry, keep going.
                            postIns = postDel = true;
                            equalitiesLength = 0;
                        } else {
                            equalitiesLength--; // Throw away the previous equality.
                            pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
                            postIns = postDel = false;
                        }
                        changes = true;
                    }
                }
                pointer++;
            }
            if (changes) {
                this.diffCleanupMerge(diffs);
            }
        };
        /**
		 * Convert a diff array into a pretty HTML report.
		 * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.
		 * @param {integer} string to be beautified.
		 * @return {string} HTML representation.
		 */ DiffMatchPatch.prototype.diffPrettyHtml = function(diffs) {
            var html = [];
            for(var x = 0; x < diffs.length; x++){
                var op = diffs[x][0]; // Operation (insert, delete, equal)
                var data = diffs[x][1]; // Text of change.
                switch(op){
                    case DIFF_INSERT:
                        html[x] = '<ins>' + escapeText(data) + '</ins>';
                        break;
                    case DIFF_DELETE:
                        html[x] = '<del>' + escapeText(data) + '</del>';
                        break;
                    case DIFF_EQUAL:
                        html[x] = '<span>' + escapeText(data) + '</span>';
                        break;
                }
            }
            return html.join('');
        };
        /**
		 * Determine the common prefix of two strings.
		 * @param {string} text1 First string.
		 * @param {string} text2 Second string.
		 * @return {number} The number of characters common to the start of each
		 *     string.
		 */ DiffMatchPatch.prototype.diffCommonPrefix = function(text1, text2) {
            var pointermid, pointermax, pointermin, pointerstart;
            // Quick check for common null cases.
            if (!text1 || !text2 || text1.charAt(0) !== text2.charAt(0)) {
                return 0;
            }
            // Binary search.
            // Performance analysis: https://neil.fraser.name/news/2007/10/09/
            pointermin = 0;
            pointermax = Math.min(text1.length, text2.length);
            pointermid = pointermax;
            pointerstart = 0;
            while(pointermin < pointermid){
                if (text1.substring(pointerstart, pointermid) === text2.substring(pointerstart, pointermid)) {
                    pointermin = pointermid;
                    pointerstart = pointermin;
                } else {
                    pointermax = pointermid;
                }
                pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
            }
            return pointermid;
        };
        /**
		 * Determine the common suffix of two strings.
		 * @param {string} text1 First string.
		 * @param {string} text2 Second string.
		 * @return {number} The number of characters common to the end of each string.
		 */ DiffMatchPatch.prototype.diffCommonSuffix = function(text1, text2) {
            var pointermid, pointermax, pointermin, pointerend;
            // Quick check for common null cases.
            if (!text1 || !text2 || text1.charAt(text1.length - 1) !== text2.charAt(text2.length - 1)) {
                return 0;
            }
            // Binary search.
            // Performance analysis: https://neil.fraser.name/news/2007/10/09/
            pointermin = 0;
            pointermax = Math.min(text1.length, text2.length);
            pointermid = pointermax;
            pointerend = 0;
            while(pointermin < pointermid){
                if (text1.substring(text1.length - pointermid, text1.length - pointerend) === text2.substring(text2.length - pointermid, text2.length - pointerend)) {
                    pointermin = pointermid;
                    pointerend = pointermin;
                } else {
                    pointermax = pointermid;
                }
                pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
            }
            return pointermid;
        };
        /**
		 * Find the differences between two texts.  Assumes that the texts do not
		 * have any common prefix or suffix.
		 * @param {string} text1 Old string to be diffed.
		 * @param {string} text2 New string to be diffed.
		 * @param {boolean} checklines Speedup flag.  If false, then don't run a
		 *     line-level diff first to identify the changed areas.
		 *     If true, then run a faster, slightly less optimal diff.
		 * @param {number} deadline Time when the diff should be complete by.
		 * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.
		 * @private
		 */ DiffMatchPatch.prototype.diffCompute = function(text1, text2, checklines, deadline) {
            var diffs, longtext, shorttext, i, hm, text1A, text2A, text1B, text2B, midCommon, diffsA, diffsB;
            if (!text1) {
                // Just add some text (speedup).
                return [
                    [
                        DIFF_INSERT,
                        text2
                    ]
                ];
            }
            if (!text2) {
                // Just delete some text (speedup).
                return [
                    [
                        DIFF_DELETE,
                        text1
                    ]
                ];
            }
            longtext = text1.length > text2.length ? text1 : text2;
            shorttext = text1.length > text2.length ? text2 : text1;
            i = longtext.indexOf(shorttext);
            if (i !== -1) {
                // Shorter text is inside the longer text (speedup).
                diffs = [
                    [
                        DIFF_INSERT,
                        longtext.substring(0, i)
                    ],
                    [
                        DIFF_EQUAL,
                        shorttext
                    ],
                    [
                        DIFF_INSERT,
                        longtext.substring(i + shorttext.length)
                    ]
                ];
                // Swap insertions for deletions if diff is reversed.
                if (text1.length > text2.length) {
                    diffs[0][0] = diffs[2][0] = DIFF_DELETE;
                }
                return diffs;
            }
            if (shorttext.length === 1) {
                // Single character string.
                // After the previous speedup, the character can't be an equality.
                return [
                    [
                        DIFF_DELETE,
                        text1
                    ],
                    [
                        DIFF_INSERT,
                        text2
                    ]
                ];
            }
            // Check to see if the problem can be split in two.
            hm = this.diffHalfMatch(text1, text2);
            if (hm) {
                // A half-match was found, sort out the return data.
                text1A = hm[0];
                text1B = hm[1];
                text2A = hm[2];
                text2B = hm[3];
                midCommon = hm[4];
                // Send both pairs off for separate processing.
                diffsA = this.DiffMain(text1A, text2A, checklines, deadline);
                diffsB = this.DiffMain(text1B, text2B, checklines, deadline);
                // Merge the results.
                return diffsA.concat([
                    [
                        DIFF_EQUAL,
                        midCommon
                    ]
                ], diffsB);
            }
            if (checklines && text1.length > 100 && text2.length > 100) {
                return this.diffLineMode(text1, text2, deadline);
            }
            return this.diffBisect(text1, text2, deadline);
        };
        /**
		 * Do the two texts share a substring which is at least half the length of the
		 * longer text?
		 * This speedup can produce non-minimal diffs.
		 * @param {string} text1 First string.
		 * @param {string} text2 Second string.
		 * @return {Array.<string>} Five element Array, containing the prefix of
		 *     text1, the suffix of text1, the prefix of text2, the suffix of
		 *     text2 and the common middle.  Or null if there was no match.
		 * @private
		 */ DiffMatchPatch.prototype.diffHalfMatch = function(text1, text2) {
            var longtext, shorttext, dmp, text1A, text2B, text2A, text1B, midCommon, hm1, hm2, hm;
            longtext = text1.length > text2.length ? text1 : text2;
            shorttext = text1.length > text2.length ? text2 : text1;
            if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
                return null; // Pointless.
            }
            dmp = this; // 'this' becomes 'window' in a closure.
            /**
			 * Does a substring of shorttext exist within longtext such that the substring
			 * is at least half the length of longtext?
			 * Closure, but does not reference any external variables.
			 * @param {string} longtext Longer string.
			 * @param {string} shorttext Shorter string.
			 * @param {number} i Start index of quarter length substring within longtext.
			 * @return {Array.<string>} Five element Array, containing the prefix of
			 *     longtext, the suffix of longtext, the prefix of shorttext, the suffix
			 *     of shorttext and the common middle.  Or null if there was no match.
			 * @private
			 */ function diffHalfMatchI(longtext, shorttext, i) {
                var seed, j, bestCommon, prefixLength, suffixLength, bestLongtextA, bestLongtextB, bestShorttextA, bestShorttextB;
                // Start with a 1/4 length substring at position i as a seed.
                seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
                j = -1;
                bestCommon = '';
                while((j = shorttext.indexOf(seed, j + 1)) !== -1){
                    prefixLength = dmp.diffCommonPrefix(longtext.substring(i), shorttext.substring(j));
                    suffixLength = dmp.diffCommonSuffix(longtext.substring(0, i), shorttext.substring(0, j));
                    if (bestCommon.length < suffixLength + prefixLength) {
                        bestCommon = shorttext.substring(j - suffixLength, j) + shorttext.substring(j, j + prefixLength);
                        bestLongtextA = longtext.substring(0, i - suffixLength);
                        bestLongtextB = longtext.substring(i + prefixLength);
                        bestShorttextA = shorttext.substring(0, j - suffixLength);
                        bestShorttextB = shorttext.substring(j + prefixLength);
                    }
                }
                if (bestCommon.length * 2 >= longtext.length) {
                    return [
                        bestLongtextA,
                        bestLongtextB,
                        bestShorttextA,
                        bestShorttextB,
                        bestCommon
                    ];
                } else {
                    return null;
                }
            }
            // First check if the second quarter is the seed for a half-match.
            hm1 = diffHalfMatchI(longtext, shorttext, Math.ceil(longtext.length / 4));
            // Check again based on the third quarter.
            hm2 = diffHalfMatchI(longtext, shorttext, Math.ceil(longtext.length / 2));
            if (!hm1 && !hm2) {
                return null;
            } else if (!hm2) {
                hm = hm1;
            } else if (!hm1) {
                hm = hm2;
            } else {
                // Both matched.  Select the longest.
                hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
            }
            // A half-match was found, sort out the return data.
            if (text1.length > text2.length) {
                text1A = hm[0];
                text1B = hm[1];
                text2A = hm[2];
                text2B = hm[3];
            } else {
                text2A = hm[0];
                text2B = hm[1];
                text1A = hm[2];
                text1B = hm[3];
            }
            midCommon = hm[4];
            return [
                text1A,
                text1B,
                text2A,
                text2B,
                midCommon
            ];
        };
        /**
		 * Do a quick line-level diff on both strings, then rediff the parts for
		 * greater accuracy.
		 * This speedup can produce non-minimal diffs.
		 * @param {string} text1 Old string to be diffed.
		 * @param {string} text2 New string to be diffed.
		 * @param {number} deadline Time when the diff should be complete by.
		 * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.
		 * @private
		 */ DiffMatchPatch.prototype.diffLineMode = function(text1, text2, deadline) {
            var a, diffs, linearray, pointer, countInsert, countDelete, textInsert, textDelete, j;
            // Scan the text on a line-by-line basis first.
            a = this.diffLinesToChars(text1, text2);
            text1 = a.chars1;
            text2 = a.chars2;
            linearray = a.lineArray;
            diffs = this.DiffMain(text1, text2, false, deadline);
            // Convert the diff back to original text.
            this.diffCharsToLines(diffs, linearray);
            // Eliminate freak matches (e.g. blank lines)
            this.diffCleanupSemantic(diffs);
            // Rediff any replacement blocks, this time character-by-character.
            // Add a dummy entry at the end.
            diffs.push([
                DIFF_EQUAL,
                ''
            ]);
            pointer = 0;
            countDelete = 0;
            countInsert = 0;
            textDelete = '';
            textInsert = '';
            while(pointer < diffs.length){
                switch(diffs[pointer][0]){
                    case DIFF_INSERT:
                        countInsert++;
                        textInsert += diffs[pointer][1];
                        break;
                    case DIFF_DELETE:
                        countDelete++;
                        textDelete += diffs[pointer][1];
                        break;
                    case DIFF_EQUAL:
                        // Upon reaching an equality, check for prior redundancies.
                        if (countDelete >= 1 && countInsert >= 1) {
                            // Delete the offending records and add the merged ones.
                            diffs.splice(pointer - countDelete - countInsert, countDelete + countInsert);
                            pointer = pointer - countDelete - countInsert;
                            a = this.DiffMain(textDelete, textInsert, false, deadline);
                            for(j = a.length - 1; j >= 0; j--){
                                diffs.splice(pointer, 0, a[j]);
                            }
                            pointer = pointer + a.length;
                        }
                        countInsert = 0;
                        countDelete = 0;
                        textDelete = '';
                        textInsert = '';
                        break;
                }
                pointer++;
            }
            diffs.pop(); // Remove the dummy entry at the end.
            return diffs;
        };
        /**
		 * Find the 'middle snake' of a diff, split the problem in two
		 * and return the recursively constructed diff.
		 * See Myers 1986 paper: An O(ND) Difference Algorithm and Its Variations.
		 * @param {string} text1 Old string to be diffed.
		 * @param {string} text2 New string to be diffed.
		 * @param {number} deadline Time at which to bail if not yet complete.
		 * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.
		 * @private
		 */ DiffMatchPatch.prototype.diffBisect = function(text1, text2, deadline) {
            var text1Length, text2Length, maxD, vOffset, vLength, v1, v2, x, delta, front, k1start, k1end, k2start, k2end, k2Offset, k1Offset, x1, x2, y1, y2, d, k1, k2;
            // Cache the text lengths to prevent multiple calls.
            text1Length = text1.length;
            text2Length = text2.length;
            maxD = Math.ceil((text1Length + text2Length) / 2);
            vOffset = maxD;
            vLength = 2 * maxD;
            v1 = new Array(vLength);
            v2 = new Array(vLength);
            // Setting all elements to -1 is faster in Chrome & Firefox than mixing
            // integers and undefined.
            for(x = 0; x < vLength; x++){
                v1[x] = -1;
                v2[x] = -1;
            }
            v1[vOffset + 1] = 0;
            v2[vOffset + 1] = 0;
            delta = text1Length - text2Length;
            // If the total number of characters is odd, then the front path will collide
            // with the reverse path.
            front = delta % 2 !== 0;
            // Offsets for start and end of k loop.
            // Prevents mapping of space beyond the grid.
            k1start = 0;
            k1end = 0;
            k2start = 0;
            k2end = 0;
            for(d = 0; d < maxD; d++){
                // Bail out if deadline is reached.
                if (Date.now() > deadline) {
                    break;
                }
                // Walk the front path one step.
                for(k1 = -d + k1start; k1 <= d - k1end; k1 += 2){
                    k1Offset = vOffset + k1;
                    if (k1 === -d || k1 !== d && v1[k1Offset - 1] < v1[k1Offset + 1]) {
                        x1 = v1[k1Offset + 1];
                    } else {
                        x1 = v1[k1Offset - 1] + 1;
                    }
                    y1 = x1 - k1;
                    while(x1 < text1Length && y1 < text2Length && text1.charAt(x1) === text2.charAt(y1)){
                        x1++;
                        y1++;
                    }
                    v1[k1Offset] = x1;
                    if (x1 > text1Length) {
                        // Ran off the right of the graph.
                        k1end += 2;
                    } else if (y1 > text2Length) {
                        // Ran off the bottom of the graph.
                        k1start += 2;
                    } else if (front) {
                        k2Offset = vOffset + delta - k1;
                        if (k2Offset >= 0 && k2Offset < vLength && v2[k2Offset] !== -1) {
                            // Mirror x2 onto top-left coordinate system.
                            x2 = text1Length - v2[k2Offset];
                            if (x1 >= x2) {
                                // Overlap detected.
                                return this.diffBisectSplit(text1, text2, x1, y1, deadline);
                            }
                        }
                    }
                }
                // Walk the reverse path one step.
                for(k2 = -d + k2start; k2 <= d - k2end; k2 += 2){
                    k2Offset = vOffset + k2;
                    if (k2 === -d || k2 !== d && v2[k2Offset - 1] < v2[k2Offset + 1]) {
                        x2 = v2[k2Offset + 1];
                    } else {
                        x2 = v2[k2Offset - 1] + 1;
                    }
                    y2 = x2 - k2;
                    while(x2 < text1Length && y2 < text2Length && text1.charAt(text1Length - x2 - 1) === text2.charAt(text2Length - y2 - 1)){
                        x2++;
                        y2++;
                    }
                    v2[k2Offset] = x2;
                    if (x2 > text1Length) {
                        // Ran off the left of the graph.
                        k2end += 2;
                    } else if (y2 > text2Length) {
                        // Ran off the top of the graph.
                        k2start += 2;
                    } else if (!front) {
                        k1Offset = vOffset + delta - k2;
                        if (k1Offset >= 0 && k1Offset < vLength && v1[k1Offset] !== -1) {
                            x1 = v1[k1Offset];
                            y1 = vOffset + x1 - k1Offset;
                            // Mirror x2 onto top-left coordinate system.
                            x2 = text1Length - x2;
                            if (x1 >= x2) {
                                // Overlap detected.
                                return this.diffBisectSplit(text1, text2, x1, y1, deadline);
                            }
                        }
                    }
                }
            }
            // Diff took too long and hit the deadline or
            // number of diffs equals number of characters, no commonality at all.
            return [
                [
                    DIFF_DELETE,
                    text1
                ],
                [
                    DIFF_INSERT,
                    text2
                ]
            ];
        };
        /**
		 * Given the location of the 'middle snake', split the diff in two parts
		 * and recurse.
		 * @param {string} text1 Old string to be diffed.
		 * @param {string} text2 New string to be diffed.
		 * @param {number} x Index of split point in text1.
		 * @param {number} y Index of split point in text2.
		 * @param {number} deadline Time at which to bail if not yet complete.
		 * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.
		 * @private
		 */ DiffMatchPatch.prototype.diffBisectSplit = function(text1, text2, x, y, deadline) {
            var text1a, text1b, text2a, text2b, diffs, diffsb;
            text1a = text1.substring(0, x);
            text2a = text2.substring(0, y);
            text1b = text1.substring(x);
            text2b = text2.substring(y);
            // Compute both diffs serially.
            diffs = this.DiffMain(text1a, text2a, false, deadline);
            diffsb = this.DiffMain(text1b, text2b, false, deadline);
            return diffs.concat(diffsb);
        };
        /**
		 * Reduce the number of edits by eliminating semantically trivial equalities.
		 * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.
		 */ DiffMatchPatch.prototype.diffCleanupSemantic = function(diffs) {
            var changes = false;
            var equalities = []; // Stack of indices where equalities are found.
            var equalitiesLength = 0; // Keeping our own length var is faster in JS.
            /** @type {?string} */ var lastequality = null;
            // Always equal to diffs[equalities[equalitiesLength - 1]][1]
            var pointer = 0; // Index of current position.
            // Number of characters that changed prior to the equality.
            var lengthInsertions1 = 0;
            var lengthDeletions1 = 0;
            // Number of characters that changed after the equality.
            var lengthInsertions2 = 0;
            var lengthDeletions2 = 0;
            while(pointer < diffs.length){
                if (diffs[pointer][0] === DIFF_EQUAL) {
                    // Equality found.
                    equalities[equalitiesLength++] = pointer;
                    lengthInsertions1 = lengthInsertions2;
                    lengthDeletions1 = lengthDeletions2;
                    lengthInsertions2 = 0;
                    lengthDeletions2 = 0;
                    lastequality = diffs[pointer][1];
                } else {
                    // An insertion or deletion.
                    if (diffs[pointer][0] === DIFF_INSERT) {
                        lengthInsertions2 += diffs[pointer][1].length;
                    } else {
                        lengthDeletions2 += diffs[pointer][1].length;
                    }
                    // Eliminate an equality that is smaller or equal to the edits on both
                    // sides of it.
                    if (lastequality && lastequality.length <= Math.max(lengthInsertions1, lengthDeletions1) && lastequality.length <= Math.max(lengthInsertions2, lengthDeletions2)) {
                        // Duplicate record.
                        diffs.splice(equalities[equalitiesLength - 1], 0, [
                            DIFF_DELETE,
                            lastequality
                        ]);
                        // Change second copy to insert.
                        diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
                        // Throw away the equality we just deleted.
                        equalitiesLength--;
                        // Throw away the previous equality (it needs to be reevaluated).
                        equalitiesLength--;
                        pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
                        // Reset the counters.
                        lengthInsertions1 = 0;
                        lengthDeletions1 = 0;
                        lengthInsertions2 = 0;
                        lengthDeletions2 = 0;
                        lastequality = null;
                        changes = true;
                    }
                }
                pointer++;
            }
            // Normalize the diff.
            if (changes) {
                this.diffCleanupMerge(diffs);
            }
            var deletion, insertion, overlapLength1, overlapLength2;
            // Find any overlaps between deletions and insertions.
            // e.g: <del>abcxxx</del><ins>xxxdef</ins>
            //   -> <del>abc</del>xxx<ins>def</ins>
            // e.g: <del>xxxabc</del><ins>defxxx</ins>
            //   -> <ins>def</ins>xxx<del>abc</del>
            // Only extract an overlap if it is as big as the edit ahead or behind it.
            pointer = 1;
            while(pointer < diffs.length){
                if (diffs[pointer - 1][0] === DIFF_DELETE && diffs[pointer][0] === DIFF_INSERT) {
                    deletion = diffs[pointer - 1][1];
                    insertion = diffs[pointer][1];
                    overlapLength1 = this.diffCommonOverlap(deletion, insertion);
                    overlapLength2 = this.diffCommonOverlap(insertion, deletion);
                    if (overlapLength1 >= overlapLength2) {
                        if (overlapLength1 >= deletion.length / 2 || overlapLength1 >= insertion.length / 2) {
                            // Overlap found.  Insert an equality and trim the surrounding edits.
                            diffs.splice(pointer, 0, [
                                DIFF_EQUAL,
                                insertion.substring(0, overlapLength1)
                            ]);
                            diffs[pointer - 1][1] = deletion.substring(0, deletion.length - overlapLength1);
                            diffs[pointer + 1][1] = insertion.substring(overlapLength1);
                            pointer++;
                        }
                    } else {
                        if (overlapLength2 >= deletion.length / 2 || overlapLength2 >= insertion.length / 2) {
                            // Reverse overlap found.
                            // Insert an equality and swap and trim the surrounding edits.
                            diffs.splice(pointer, 0, [
                                DIFF_EQUAL,
                                deletion.substring(0, overlapLength2)
                            ]);
                            diffs[pointer - 1][0] = DIFF_INSERT;
                            diffs[pointer - 1][1] = insertion.substring(0, insertion.length - overlapLength2);
                            diffs[pointer + 1][0] = DIFF_DELETE;
                            diffs[pointer + 1][1] = deletion.substring(overlapLength2);
                            pointer++;
                        }
                    }
                    pointer++;
                }
                pointer++;
            }
        };
        /**
		 * Determine if the suffix of one string is the prefix of another.
		 * @param {string} text1 First string.
		 * @param {string} text2 Second string.
		 * @return {number} The number of characters common to the end of the first
		 *     string and the start of the second string.
		 * @private
		 */ DiffMatchPatch.prototype.diffCommonOverlap = function(text1, text2) {
            // Cache the text lengths to prevent multiple calls.
            var text1Length = text1.length;
            var text2Length = text2.length;
            // Eliminate the null case.
            if (text1Length === 0 || text2Length === 0) {
                return 0;
            }
            // Truncate the longer string.
            if (text1Length > text2Length) {
                text1 = text1.substring(text1Length - text2Length);
            } else if (text1Length < text2Length) {
                text2 = text2.substring(0, text1Length);
            }
            var textLength = Math.min(text1Length, text2Length);
            // Quick check for the worst case.
            if (text1 === text2) {
                return textLength;
            }
            // Start by looking for a single character match
            // and increase length until no match is found.
            // Performance analysis: https://neil.fraser.name/news/2010/11/04/
            var best = 0;
            var length = 1;
            while(true){
                var pattern = text1.substring(textLength - length);
                var found = text2.indexOf(pattern);
                if (found === -1) {
                    return best;
                }
                length += found;
                if (found === 0 || text1.substring(textLength - length) === text2.substring(0, length)) {
                    best = length;
                    length++;
                }
            }
        };
        /**
		 * Split two texts into an array of strings.  Reduce the texts to a string of
		 * hashes where each Unicode character represents one line.
		 * @param {string} text1 First string.
		 * @param {string} text2 Second string.
		 * @return {{chars1: string, chars2: string, lineArray: !Array.<string>}}
		 *     An object containing the encoded text1, the encoded text2 and
		 *     the array of unique strings.
		 *     The zeroth element of the array of unique strings is intentionally blank.
		 * @private
		 */ DiffMatchPatch.prototype.diffLinesToChars = function(text1, text2) {
            var lineArray = []; // E.g. lineArray[4] === 'Hello\n'
            var lineHash = {}; // E.g. lineHash['Hello\n'] === 4
            // '\x00' is a valid character, but various debuggers don't like it.
            // So we'll insert a junk entry to avoid generating a null character.
            lineArray[0] = '';
            /**
			 * Split a text into an array of strings.  Reduce the texts to a string of
			 * hashes where each Unicode character represents one line.
			 * Modifies linearray and linehash through being a closure.
			 * @param {string} text String to encode.
			 * @return {string} Encoded string.
			 * @private
			 */ function diffLinesToCharsMunge(text) {
                var chars = '';
                // Walk the text, pulling out a substring for each line.
                // text.split('\n') would would temporarily double our memory footprint.
                // Modifying text would create many large strings to garbage collect.
                var lineStart = 0;
                var lineEnd = -1;
                // Keeping our own length variable is faster than looking it up.
                var lineArrayLength = lineArray.length;
                while(lineEnd < text.length - 1){
                    lineEnd = text.indexOf('\n', lineStart);
                    if (lineEnd === -1) {
                        lineEnd = text.length - 1;
                    }
                    var line = text.substring(lineStart, lineEnd + 1);
                    lineStart = lineEnd + 1;
                    if (hasOwn.call(lineHash, line)) {
                        chars += String.fromCharCode(lineHash[line]);
                    } else {
                        chars += String.fromCharCode(lineArrayLength);
                        lineHash[line] = lineArrayLength;
                        lineArray[lineArrayLength++] = line;
                    }
                }
                return chars;
            }
            var chars1 = diffLinesToCharsMunge(text1);
            var chars2 = diffLinesToCharsMunge(text2);
            return {
                chars1: chars1,
                chars2: chars2,
                lineArray: lineArray
            };
        };
        /**
		 * Rehydrate the text in a diff from a string of line hashes to real lines of
		 * text.
		 * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.
		 * @param {!Array.<string>} lineArray Array of unique strings.
		 * @private
		 */ DiffMatchPatch.prototype.diffCharsToLines = function(diffs, lineArray) {
            for(var x = 0; x < diffs.length; x++){
                var chars = diffs[x][1];
                var text = [];
                for(var y = 0; y < chars.length; y++){
                    text[y] = lineArray[chars.charCodeAt(y)];
                }
                diffs[x][1] = text.join('');
            }
        };
        /**
		 * Reorder and merge like edit sections.  Merge equalities.
		 * Any edit section can move as long as it doesn't cross an equality.
		 * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.
		 */ DiffMatchPatch.prototype.diffCleanupMerge = function(diffs) {
            diffs.push([
                DIFF_EQUAL,
                ''
            ]); // Add a dummy entry at the end.
            var pointer = 0;
            var countDelete = 0;
            var countInsert = 0;
            var textDelete = '';
            var textInsert = '';
            while(pointer < diffs.length){
                switch(diffs[pointer][0]){
                    case DIFF_INSERT:
                        countInsert++;
                        textInsert += diffs[pointer][1];
                        pointer++;
                        break;
                    case DIFF_DELETE:
                        countDelete++;
                        textDelete += diffs[pointer][1];
                        pointer++;
                        break;
                    case DIFF_EQUAL:
                        // Upon reaching an equality, check for prior redundancies.
                        if (countDelete + countInsert > 1) {
                            if (countDelete !== 0 && countInsert !== 0) {
                                // Factor out any common prefixes.
                                var commonlength = this.diffCommonPrefix(textInsert, textDelete);
                                if (commonlength !== 0) {
                                    if (pointer - countDelete - countInsert > 0 && diffs[pointer - countDelete - countInsert - 1][0] === DIFF_EQUAL) {
                                        diffs[pointer - countDelete - countInsert - 1][1] += textInsert.substring(0, commonlength);
                                    } else {
                                        diffs.splice(0, 0, [
                                            DIFF_EQUAL,
                                            textInsert.substring(0, commonlength)
                                        ]);
                                        pointer++;
                                    }
                                    textInsert = textInsert.substring(commonlength);
                                    textDelete = textDelete.substring(commonlength);
                                }
                                // Factor out any common suffixies.
                                commonlength = this.diffCommonSuffix(textInsert, textDelete);
                                if (commonlength !== 0) {
                                    diffs[pointer][1] = textInsert.substring(textInsert.length - commonlength) + diffs[pointer][1];
                                    textInsert = textInsert.substring(0, textInsert.length - commonlength);
                                    textDelete = textDelete.substring(0, textDelete.length - commonlength);
                                }
                            }
                            // Delete the offending records and add the merged ones.
                            if (countDelete === 0) {
                                diffs.splice(pointer - countInsert, countDelete + countInsert, [
                                    DIFF_INSERT,
                                    textInsert
                                ]);
                            } else if (countInsert === 0) {
                                diffs.splice(pointer - countDelete, countDelete + countInsert, [
                                    DIFF_DELETE,
                                    textDelete
                                ]);
                            } else {
                                diffs.splice(pointer - countDelete - countInsert, countDelete + countInsert, [
                                    DIFF_DELETE,
                                    textDelete
                                ], [
                                    DIFF_INSERT,
                                    textInsert
                                ]);
                            }
                            pointer = pointer - countDelete - countInsert + (countDelete ? 1 : 0) + (countInsert ? 1 : 0) + 1;
                        } else if (pointer !== 0 && diffs[pointer - 1][0] === DIFF_EQUAL) {
                            // Merge this equality with the previous one.
                            diffs[pointer - 1][1] += diffs[pointer][1];
                            diffs.splice(pointer, 1);
                        } else {
                            pointer++;
                        }
                        countInsert = 0;
                        countDelete = 0;
                        textDelete = '';
                        textInsert = '';
                        break;
                }
            }
            if (diffs[diffs.length - 1][1] === '') {
                diffs.pop(); // Remove the dummy entry at the end.
            }
            // Second pass: look for single edits surrounded on both sides by equalities
            // which can be shifted sideways to eliminate an equality.
            // e.g: A<ins>BA</ins>C -> <ins>AB</ins>AC
            var changes = false;
            pointer = 1;
            // Intentionally ignore the first and last element (don't need checking).
            while(pointer < diffs.length - 1){
                if (diffs[pointer - 1][0] === DIFF_EQUAL && diffs[pointer + 1][0] === DIFF_EQUAL) {
                    var diffPointer = diffs[pointer][1];
                    var position = diffPointer.substring(diffPointer.length - diffs[pointer - 1][1].length);
                    // This is a single edit surrounded by equalities.
                    if (position === diffs[pointer - 1][1]) {
                        // Shift the edit over the previous equality.
                        diffs[pointer][1] = diffs[pointer - 1][1] + diffs[pointer][1].substring(0, diffs[pointer][1].length - diffs[pointer - 1][1].length);
                        diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
                        diffs.splice(pointer - 1, 1);
                        changes = true;
                    } else if (diffPointer.substring(0, diffs[pointer + 1][1].length) === diffs[pointer + 1][1]) {
                        // Shift the edit over the next equality.
                        diffs[pointer - 1][1] += diffs[pointer + 1][1];
                        diffs[pointer][1] = diffs[pointer][1].substring(diffs[pointer + 1][1].length) + diffs[pointer + 1][1];
                        diffs.splice(pointer + 1, 1);
                        changes = true;
                    }
                }
                pointer++;
            }
            // If shifts were made, the diff needs reordering and another shift sweep.
            if (changes) {
                this.diffCleanupMerge(diffs);
            }
        };
        return function(o, n) {
            var diff, output, text;
            diff = new DiffMatchPatch();
            output = diff.DiffMain(o, n);
            diff.diffCleanupEfficiency(output);
            text = diff.diffPrettyHtml(output);
            return text;
        };
    }();
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvcXVuaXQtMi4yMC4wLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICogUVVuaXQgMi4yMC4wXG4gKiBodHRwczovL3F1bml0anMuY29tL1xuICpcbiAqIENvcHlyaWdodCBPcGVuSlMgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqIGh0dHBzOi8vanF1ZXJ5Lm9yZy9saWNlbnNlXG4gKi9cbihmdW5jdGlvbiAoKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRmdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuXHRcdFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjtcblxuXHRcdHJldHVybiBfdHlwZW9mID0gXCJmdW5jdGlvblwiID09IHR5cGVvZiBTeW1ib2wgJiYgXCJzeW1ib2xcIiA9PSB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID8gZnVuY3Rpb24gKG9iaikge1xuXHRcdFx0cmV0dXJuIHR5cGVvZiBvYmo7XG5cdFx0fSA6IGZ1bmN0aW9uIChvYmopIHtcblx0XHRcdHJldHVybiBvYmogJiYgXCJmdW5jdGlvblwiID09IHR5cGVvZiBTeW1ib2wgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7XG5cdFx0fSwgX3R5cGVvZihvYmopO1xuXHR9XG5cdGZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcblx0XHRpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gX2RlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG5cdFx0XHRkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG5cdFx0XHRkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG5cdFx0XHRpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiBfY3JlYXRlQ2xhc3MoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG5cdFx0aWYgKHByb3RvUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG5cdFx0aWYgKHN0YXRpY1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb25zdHJ1Y3RvciwgXCJwcm90b3R5cGVcIiwge1xuXHRcdFx0d3JpdGFibGU6IGZhbHNlXG5cdFx0fSk7XG5cdFx0cmV0dXJuIENvbnN0cnVjdG9yO1xuXHR9XG5cdGZ1bmN0aW9uIF9zbGljZWRUb0FycmF5KGFyciwgaSkge1xuXHRcdHJldHVybiBfYXJyYXlXaXRoSG9sZXMoYXJyKSB8fCBfaXRlcmFibGVUb0FycmF5TGltaXQoYXJyLCBpKSB8fCBfdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkoYXJyLCBpKSB8fCBfbm9uSXRlcmFibGVSZXN0KCk7XG5cdH1cblx0ZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikge1xuXHRcdHJldHVybiBfYXJyYXlXaXRob3V0SG9sZXMoYXJyKSB8fCBfaXRlcmFibGVUb0FycmF5KGFycikgfHwgX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5KGFycikgfHwgX25vbkl0ZXJhYmxlU3ByZWFkKCk7XG5cdH1cblx0ZnVuY3Rpb24gX2FycmF5V2l0aG91dEhvbGVzKGFycikge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KGFycikpIHJldHVybiBfYXJyYXlMaWtlVG9BcnJheShhcnIpO1xuXHR9XG5cdGZ1bmN0aW9uIF9hcnJheVdpdGhIb2xlcyhhcnIpIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShhcnIpKSByZXR1cm4gYXJyO1xuXHR9XG5cdGZ1bmN0aW9uIF9pdGVyYWJsZVRvQXJyYXkoaXRlcikge1xuXHRcdGlmICh0eXBlb2YgU3ltYm9sICE9PSBcInVuZGVmaW5lZFwiICYmIGl0ZXJbU3ltYm9sLml0ZXJhdG9yXSAhPSBudWxsIHx8IGl0ZXJbXCJAQGl0ZXJhdG9yXCJdICE9IG51bGwpIHJldHVybiBBcnJheS5mcm9tKGl0ZXIpO1xuXHR9XG5cdGZ1bmN0aW9uIF9pdGVyYWJsZVRvQXJyYXlMaW1pdChhcnIsIGkpIHtcblx0XHR2YXIgX2kgPSBhcnIgPT0gbnVsbCA/IG51bGwgOiB0eXBlb2YgU3ltYm9sICE9PSBcInVuZGVmaW5lZFwiICYmIGFycltTeW1ib2wuaXRlcmF0b3JdIHx8IGFycltcIkBAaXRlcmF0b3JcIl07XG5cdFx0aWYgKF9pID09IG51bGwpIHJldHVybjtcblx0XHR2YXIgX2FyciA9IFtdO1xuXHRcdHZhciBfbiA9IHRydWU7XG5cdFx0dmFyIF9kID0gZmFsc2U7XG5cdFx0dmFyIF9zLCBfZTtcblx0XHR0cnkge1xuXHRcdFx0Zm9yIChfaSA9IF9pLmNhbGwoYXJyKTsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkge1xuXHRcdFx0XHRfYXJyLnB1c2goX3MudmFsdWUpO1xuXHRcdFx0XHRpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRfZCA9IHRydWU7XG5cdFx0XHRfZSA9IGVycjtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSAhPSBudWxsKSBfaVtcInJldHVyblwiXSgpO1xuXHRcdFx0fSBmaW5hbGx5IHtcblx0XHRcdFx0aWYgKF9kKSB0aHJvdyBfZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIF9hcnI7XG5cdH1cblx0ZnVuY3Rpb24gX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5KG8sIG1pbkxlbikge1xuXHRcdGlmICghbykgcmV0dXJuO1xuXHRcdGlmICh0eXBlb2YgbyA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIF9hcnJheUxpa2VUb0FycmF5KG8sIG1pbkxlbik7XG5cdFx0dmFyIG4gPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykuc2xpY2UoOCwgLTEpO1xuXHRcdGlmIChuID09PSBcIk9iamVjdFwiICYmIG8uY29uc3RydWN0b3IpIG4gPSBvLmNvbnN0cnVjdG9yLm5hbWU7XG5cdFx0aWYgKG4gPT09IFwiTWFwXCIgfHwgbiA9PT0gXCJTZXRcIikgcmV0dXJuIEFycmF5LmZyb20obyk7XG5cdFx0aWYgKG4gPT09IFwiQXJndW1lbnRzXCIgfHwgL14oPzpVaXxJKW50KD86OHwxNnwzMikoPzpDbGFtcGVkKT9BcnJheSQvLnRlc3QobikpIHJldHVybiBfYXJyYXlMaWtlVG9BcnJheShvLCBtaW5MZW4pO1xuXHR9XG5cdGZ1bmN0aW9uIF9hcnJheUxpa2VUb0FycmF5KGFyciwgbGVuKSB7XG5cdFx0aWYgKGxlbiA9PSBudWxsIHx8IGxlbiA+IGFyci5sZW5ndGgpIGxlbiA9IGFyci5sZW5ndGg7XG5cdFx0Zm9yICh2YXIgaSA9IDAsIGFycjIgPSBuZXcgQXJyYXkobGVuKTsgaSA8IGxlbjsgaSsrKSBhcnIyW2ldID0gYXJyW2ldO1xuXHRcdHJldHVybiBhcnIyO1xuXHR9XG5cdGZ1bmN0aW9uIF9ub25JdGVyYWJsZVNwcmVhZCgpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIHNwcmVhZCBub24taXRlcmFibGUgaW5zdGFuY2UuXFxuSW4gb3JkZXIgdG8gYmUgaXRlcmFibGUsIG5vbi1hcnJheSBvYmplY3RzIG11c3QgaGF2ZSBhIFtTeW1ib2wuaXRlcmF0b3JdKCkgbWV0aG9kLlwiKTtcblx0fVxuXHRmdW5jdGlvbiBfbm9uSXRlcmFibGVSZXN0KCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIik7XG5cdH1cblx0ZnVuY3Rpb24gX2NyZWF0ZUZvck9mSXRlcmF0b3JIZWxwZXIobywgYWxsb3dBcnJheUxpa2UpIHtcblx0XHR2YXIgaXQgPSB0eXBlb2YgU3ltYm9sICE9PSBcInVuZGVmaW5lZFwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXSB8fCBvW1wiQEBpdGVyYXRvclwiXTtcblx0XHRpZiAoIWl0KSB7XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShvKSB8fCAoaXQgPSBfdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkobykpIHx8IGFsbG93QXJyYXlMaWtlICYmIG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSB7XG5cdFx0XHRcdGlmIChpdCkgbyA9IGl0O1xuXHRcdFx0XHR2YXIgaSA9IDA7XG5cdFx0XHRcdHZhciBGID0gZnVuY3Rpb24gKCkge307XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0czogRixcblx0XHRcdFx0XHRuOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRpZiAoaSA+PSBvLmxlbmd0aCkgcmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0ZG9uZTogdHJ1ZVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdGRvbmU6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHR2YWx1ZTogb1tpKytdXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZTogZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0XHRcdHRocm93IGU7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRmOiBGXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGl0ZXJhdGUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIik7XG5cdFx0fVxuXHRcdHZhciBub3JtYWxDb21wbGV0aW9uID0gdHJ1ZSxcblx0XHRcdGRpZEVyciA9IGZhbHNlLFxuXHRcdFx0ZXJyO1xuXHRcdHJldHVybiB7XG5cdFx0XHRzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGl0ID0gaXQuY2FsbChvKTtcblx0XHRcdH0sXG5cdFx0XHRuOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHZhciBzdGVwID0gaXQubmV4dCgpO1xuXHRcdFx0XHRub3JtYWxDb21wbGV0aW9uID0gc3RlcC5kb25lO1xuXHRcdFx0XHRyZXR1cm4gc3RlcDtcblx0XHRcdH0sXG5cdFx0XHRlOiBmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHRkaWRFcnIgPSB0cnVlO1xuXHRcdFx0XHRlcnIgPSBlO1xuXHRcdFx0fSxcblx0XHRcdGY6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRpZiAoIW5vcm1hbENvbXBsZXRpb24gJiYgaXQucmV0dXJuICE9IG51bGwpIGl0LnJldHVybigpO1xuXHRcdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRcdGlmIChkaWRFcnIpIHRocm93IGVycjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdH1cblxuXHQvLyBXZSBkb24ndCB1c2UgZ2xvYmFsLXRoaXMtcG9seWZpbGwgWzFdLCBiZWNhdXNlIGl0IG1vZGlmaWVzXG5cdC8vIHRoZSBnbG9iYWxzIHNjb3BlIGJ5IGRlZmF1bHQuIFFVbml0IG11c3Qgbm90IGFmZmVjdCB0aGUgaG9zdCBjb250ZXh0XG5cdC8vIGFzIGRldmVsb3BlcnMgbWF5IHRlc3QgdGhlaXIgcHJvamVjdCBtYXkgYmUgc3VjaCBhIHBvbHlmaWxsLCBhbmQvb3Jcblx0Ly8gdGhleSBtYXkgaW50ZW50aW9uYWxseSB0ZXN0IHRoZWlyIHByb2plY3Qgd2l0aCBhbmQgd2l0aG91dCBjZXJ0YWluXG5cdC8vIHBvbHlmaWxscyBhbmQgd2UgbXVzdCBub3QgYWZmZWN0IHRoYXQuIEl0IGFsc28gdXNlcyBhbiBvYnNjdXJlXG5cdC8vIG1lY2hhbmlzbSB0aGF0IHNlZW1zIHRvIHNvbWV0aW1lcyBjYXVzZXMgYSBydW50aW1lIGVycm9yIGluIG9sZGVyXG5cdC8vIGJyb3dzZXJzIChzcGVjaWZpY2FsbHkgU2FmYXJpIGFuZCBJRSB2ZXJzaW9ucyB0aGF0IHN1cHBvcnRcblx0Ly8gT2JqZWN0LmRlZmluZVByb3BlcnR5IGJ1dCB0aGVuIHJlcG9ydCBfVF8gYXMgdW5kZWZpbmVkKS5cblx0Ly8gWzFdIGh0dHBzOi8vZ2l0aHViLmNvbS91bmdhcC9nbG9iYWwtdGhpcy9ibG9iL3YwLjQuNC9lc20vaW5kZXguanNcblx0Ly9cblx0Ly8gQW5vdGhlciB3YXkgaXMgYEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKClgLCBidXQgZG9pbmcgc28gcmVsaWVzXG5cdC8vIG9uIGV2YWwgd2hpY2ggd2lsbCBjYXVzZSBhIENTUCBlcnJvciBvbiBzb21lIHNlcnZlcnMuXG5cdC8vXG5cdC8vIEluc3RlYWQsIHNpbXBseSBjaGVjayB0aGUgZm91ciBvcHRpb25zIHRoYXQgYWxyZWFkeSBleGlzdFxuXHQvLyBpbiBhbGwgc3VwcG9ydGVkIGVudmlyb25tZW50cy5cblx0ZnVuY3Rpb24gZ2V0R2xvYmFsVGhpcygpIHtcblx0XHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHQvLyBGb3IgU3BpZGVyTW9ua2V5LCBtb2Rlcm4gYnJvd3NlcnMsIGFuZCByZWNlbnQgTm9kZS5qc1xuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5cdFx0XHRyZXR1cm4gZ2xvYmFsVGhpcztcblx0XHR9XG5cdFx0aWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0Ly8gRm9yIHdlYiB3b3JrZXJzXG5cdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcblx0XHRcdHJldHVybiBzZWxmO1xuXHRcdH1cblx0XHRpZiAodHlwZW9mIHdpbmRvdyQxICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0Ly8gRm9yIGRvY3VtZW50IGNvbnRleHQgaW4gYnJvd3NlcnNcblx0XHRcdHJldHVybiB3aW5kb3ckMTtcblx0XHR9XG5cdFx0aWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHQvLyBGb3IgTm9kZS5qc1xuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5cdFx0XHRyZXR1cm4gZ2xvYmFsO1xuXHRcdH1cblx0XHR0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBsb2NhdGUgZ2xvYmFsIG9iamVjdCcpO1xuXHR9XG5cblx0Ly8gVGhpcyBhdm9pZHMgYSBzaW1wbGUgYGV4cG9ydCBjb25zdGAgYXNzaWdubWVudCBhcyB0aGF0IHdvdWxkIGxlYWQgUm9sbHVwXG5cdC8vIHRvIGNoYW5nZSBnZXRHbG9iYWxUaGlzIGFuZCB1c2UgdGhlIHNhbWUgKGdlbmVyYXRlZCkgdmFyaWFibGUgbmFtZSB0aGVyZS5cblx0dmFyIGcgPSBnZXRHbG9iYWxUaGlzKCk7XG5cdHZhciB3aW5kb3ckMSA9IGcud2luZG93O1xuXHR2YXIgY29uc29sZSQxID0gZy5jb25zb2xlO1xuXHR2YXIgc2V0VGltZW91dCQxID0gZy5zZXRUaW1lb3V0O1xuXHR2YXIgY2xlYXJUaW1lb3V0ID0gZy5jbGVhclRpbWVvdXQ7XG5cdHZhciBkb2N1bWVudCA9IHdpbmRvdyQxICYmIHdpbmRvdyQxLmRvY3VtZW50O1xuXHR2YXIgbmF2aWdhdG9yID0gd2luZG93JDEgJiYgd2luZG93JDEubmF2aWdhdG9yO1xuXHR2YXIgbG9jYWxTZXNzaW9uU3RvcmFnZSA9IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgeCA9ICdxdW5pdC10ZXN0LXN0cmluZyc7XG5cdFx0dHJ5IHtcblx0XHRcdGcuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSh4LCB4KTtcblx0XHRcdGcuc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbSh4KTtcblx0XHRcdHJldHVybiBnLnNlc3Npb25TdG9yYWdlO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9KCk7XG5cblx0Ly8gQmFzaWMgZmFsbGJhY2sgZm9yIEVTNiBNYXBcblx0Ly8gU3VwcG9ydDogSUUgOS0xMCwgU2FmYXJpIDcsIFBoYW50b21KUzsgTWFwIGlzIHVuZGVmaW5lZFxuXHQvLyBTdXBwb3J0OiBpT1MgODsgYG5ldyBNYXAoaXRlcmFibGUpYCBpcyBub3Qgc3VwcG9ydGVkXG5cdC8vXG5cdC8vIEZhbGxiYWNrIGZvciBFUzcgTWFwI2tleXNcblx0Ly8gU3VwcG9ydDogSUUgMTE7IE1hcCNrZXlzIGlzIHVuZGVmaW5lZFxuXHR2YXIgU3RyaW5nTWFwID0gdHlwZW9mIGcuTWFwID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBnLk1hcC5wcm90b3R5cGUua2V5cyA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZy5TeW1ib2wgPT09ICdmdW5jdGlvbicgJiYgX3R5cGVvZihnLlN5bWJvbC5pdGVyYXRvcikgPT09ICdzeW1ib2wnID8gZy5NYXAgOiBmdW5jdGlvbiBTdHJpbmdNYXAoaW5wdXQpIHtcblx0XHR2YXIgX3RoaXMgPSB0aGlzO1xuXHRcdHZhciBzdG9yZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cdFx0dmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cdFx0dGhpcy5oYXMgPSBmdW5jdGlvbiAoc3RyS2V5KSB7XG5cdFx0XHRyZXR1cm4gaGFzT3duLmNhbGwoc3RvcmUsIHN0cktleSk7XG5cdFx0fTtcblx0XHR0aGlzLmdldCA9IGZ1bmN0aW9uIChzdHJLZXkpIHtcblx0XHRcdHJldHVybiBzdG9yZVtzdHJLZXldO1xuXHRcdH07XG5cdFx0dGhpcy5zZXQgPSBmdW5jdGlvbiAoc3RyS2V5LCB2YWwpIHtcblx0XHRcdGlmICghaGFzT3duLmNhbGwoc3RvcmUsIHN0cktleSkpIHtcblx0XHRcdFx0dGhpcy5zaXplKys7XG5cdFx0XHR9XG5cdFx0XHRzdG9yZVtzdHJLZXldID0gdmFsO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fTtcblx0XHR0aGlzLmRlbGV0ZSA9IGZ1bmN0aW9uIChzdHJLZXkpIHtcblx0XHRcdGlmIChoYXNPd24uY2FsbChzdG9yZSwgc3RyS2V5KSkge1xuXHRcdFx0XHRkZWxldGUgc3RvcmVbc3RyS2V5XTtcblx0XHRcdFx0dGhpcy5zaXplLS07XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR0aGlzLmZvckVhY2ggPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcblx0XHRcdGZvciAodmFyIHN0cktleSBpbiBzdG9yZSkge1xuXHRcdFx0XHRjYWxsYmFjayhzdG9yZVtzdHJLZXldLCBzdHJLZXkpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5rZXlzID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIE9iamVjdC5rZXlzKHN0b3JlKTtcblx0XHR9O1xuXHRcdHRoaXMuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRzdG9yZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cdFx0XHR0aGlzLnNpemUgPSAwO1xuXHRcdH07XG5cdFx0dGhpcy5zaXplID0gMDtcblx0XHRpZiAoaW5wdXQpIHtcblx0XHRcdGlucHV0LmZvckVhY2goZnVuY3Rpb24gKHZhbCwgc3RyS2V5KSB7XG5cdFx0XHRcdF90aGlzLnNldChzdHJLZXksIHZhbCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG5cblx0Ly8gQmFzaWMgZmFsbGJhY2sgZm9yIEVTNiBTZXRcblx0Ly8gU3VwcG9ydDogSUUgMTEsIGBuZXcgU2V0KGl0ZXJhYmxlKWAgcGFyYW1ldGVyIG5vdCB5ZXQgaW1wbGVtZW50ZWRcblx0Ly8gVGVzdCBmb3IgU2V0I3ZhbHVlcygpIHdoaWNoIGNhbWUgYWZ0ZXIgU2V0KGl0ZXJhYmxlKS5cblx0dmFyIFN0cmluZ1NldCA9IHR5cGVvZiBnLlNldCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZy5TZXQucHJvdG90eXBlLnZhbHVlcyA9PT0gJ2Z1bmN0aW9uJyA/IGcuU2V0IDogZnVuY3Rpb24gKGlucHV0KSB7XG5cdFx0dmFyIHNldCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoaW5wdXQpKSB7XG5cdFx0XHRpbnB1dC5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG5cdFx0XHRcdHNldFtpdGVtXSA9IHRydWU7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIHtcblx0XHRcdGFkZDogZnVuY3Rpb24gYWRkKHZhbHVlKSB7XG5cdFx0XHRcdHNldFt2YWx1ZV0gPSB0cnVlO1xuXHRcdFx0fSxcblx0XHRcdGhhczogZnVuY3Rpb24gaGFzKHZhbHVlKSB7XG5cdFx0XHRcdHJldHVybiB2YWx1ZSBpbiBzZXQ7XG5cdFx0XHR9LFxuXHRcdFx0Z2V0IHNpemUoKSB7XG5cdFx0XHRcdHJldHVybiBPYmplY3Qua2V5cyhzZXQpLmxlbmd0aDtcblx0XHRcdH1cblx0XHR9O1xuXHR9O1xuXG5cdHZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cdHZhciBoYXNPd24kMSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cdHZhciBwZXJmb3JtYW5jZSA9IHtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29tcGF0L2NvbXBhdCAtLSBDaGVja2VkXG5cdFx0bm93OiB3aW5kb3ckMSAmJiB3aW5kb3ckMS5wZXJmb3JtYW5jZSAmJiB3aW5kb3ckMS5wZXJmb3JtYW5jZS5ub3cgPyB3aW5kb3ckMS5wZXJmb3JtYW5jZS5ub3cuYmluZCh3aW5kb3ckMS5wZXJmb3JtYW5jZSkgOiBEYXRlLm5vd1xuXHR9O1xuXG5cdC8vIFJldHVybnMgYSBuZXcgQXJyYXkgd2l0aCB0aGUgZWxlbWVudHMgdGhhdCBhcmUgaW4gYSBidXQgbm90IGluIGJcblx0ZnVuY3Rpb24gZGlmZihhLCBiKSB7XG5cdFx0cmV0dXJuIGEuZmlsdGVyKGZ1bmN0aW9uIChhKSB7XG5cdFx0XHRyZXR1cm4gYi5pbmRleE9mKGEpID09PSAtMTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZXRlcm1pbmVzIHdoZXRoZXIgYW4gZWxlbWVudCBleGlzdHMgaW4gYSBnaXZlbiBhcnJheSBvciBub3QuXG5cdCAqXG5cdCAqIEBtZXRob2QgaW5BcnJheVxuXHQgKiBAcGFyYW0ge2FueX0gZWxlbVxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcnJheVxuXHQgKiBAcmV0dXJuIHtib29sZWFufVxuXHQgKi9cblx0dmFyIGluQXJyYXkgPSBBcnJheS5wcm90b3R5cGUuaW5jbHVkZXMgPyBmdW5jdGlvbiAoZWxlbSwgYXJyYXkpIHtcblx0XHRyZXR1cm4gYXJyYXkuaW5jbHVkZXMoZWxlbSk7XG5cdH0gOiBmdW5jdGlvbiAoZWxlbSwgYXJyYXkpIHtcblx0XHRyZXR1cm4gYXJyYXkuaW5kZXhPZihlbGVtKSAhPT0gLTE7XG5cdH07XG5cblx0LyoqXG5cdCAqIFJlY3Vyc2l2ZWx5IGNsb25lIGFuIG9iamVjdCBpbnRvIGEgcGxhaW4gYXJyYXkgb3Igb2JqZWN0LCB0YWtpbmcgb25seSB0aGVcblx0ICogb3duIGVudW1lcmFibGUgcHJvcGVydGllcy5cblx0ICpcblx0ICogQHBhcmFtIHthbnl9IG9ialxuXHQgKiBAcGFyYW0ge2Jvb2x9IFthbGxvd0FycmF5PXRydWVdXG5cdCAqIEByZXR1cm4ge09iamVjdHxBcnJheX1cblx0ICovXG5cdGZ1bmN0aW9uIG9iamVjdFZhbHVlcyhvYmopIHtcblx0XHR2YXIgYWxsb3dBcnJheSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogdHJ1ZTtcblx0XHR2YXIgdmFscyA9IGFsbG93QXJyYXkgJiYgaXMoJ2FycmF5Jywgb2JqKSA/IFtdIDoge307XG5cdFx0Zm9yICh2YXIga2V5IGluIG9iaikge1xuXHRcdFx0aWYgKGhhc093biQxLmNhbGwob2JqLCBrZXkpKSB7XG5cdFx0XHRcdHZhciB2YWwgPSBvYmpba2V5XTtcblx0XHRcdFx0dmFsc1trZXldID0gdmFsID09PSBPYmplY3QodmFsKSA/IG9iamVjdFZhbHVlcyh2YWwsIGFsbG93QXJyYXkpIDogdmFsO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdmFscztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWN1cnNpdmVseSBjbG9uZSBhbiBvYmplY3QgaW50byBhIHBsYWluIG9iamVjdCwgdGFraW5nIG9ubHkgdGhlXG5cdCAqIHN1YnNldCBvZiBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIHRoYXQgZXhpc3QgYSBnaXZlbiBtb2RlbC5cblx0ICpcblx0ICogQHBhcmFtIHthbnl9IG9ialxuXHQgKiBAcGFyYW0ge2FueX0gbW9kZWxcblx0ICogQHJldHVybiB7T2JqZWN0fVxuXHQgKi9cblx0ZnVuY3Rpb24gb2JqZWN0VmFsdWVzU3Vic2V0KG9iaiwgbW9kZWwpIHtcblx0XHQvLyBSZXR1cm4gcHJpbWl0aXZlIHZhbHVlcyB1bmNoYW5nZWQgdG8gYXZvaWQgZmFsc2UgcG9zaXRpdmVzIG9yIGNvbmZ1c2luZ1xuXHRcdC8vIHJlc3VsdHMgZnJvbSBhc3NlcnQucHJvcENvbnRhaW5zKCkuXG5cdFx0Ly8gRS5nLiBhbiBhY3R1YWwgbnVsbCBvciBmYWxzZSB3cm9uZ2x5IGVxdWFsaW5nIGFuIGVtcHR5IG9iamVjdCxcblx0XHQvLyBvciBhbiBhY3R1YWwgc3RyaW5nIGJlaW5nIHJlcG9ydGVkIGFzIG9iamVjdCBub3QgbWF0Y2hpbmcgYSBwYXJ0aWFsIG9iamVjdC5cblx0XHRpZiAob2JqICE9PSBPYmplY3Qob2JqKSkge1xuXHRcdFx0cmV0dXJuIG9iajtcblx0XHR9XG5cblx0XHQvLyBVbmxpa2Ugb2JqZWN0VmFsdWVzKCksIHN1YnNldCBhcnJheXMgdG8gYSBwbGFpbiBvYmplY3RzIGFzIHdlbGwuXG5cdFx0Ly8gVGhpcyBlbmFibGVzIHN1YnNldHRpbmcgWzIwLCAzMF0gd2l0aCB7MTogMzB9LlxuXHRcdHZhciBzdWJzZXQgPSB7fTtcblx0XHRmb3IgKHZhciBrZXkgaW4gbW9kZWwpIHtcblx0XHRcdGlmIChoYXNPd24kMS5jYWxsKG1vZGVsLCBrZXkpICYmIGhhc093biQxLmNhbGwob2JqLCBrZXkpKSB7XG5cdFx0XHRcdHN1YnNldFtrZXldID0gb2JqZWN0VmFsdWVzU3Vic2V0KG9ialtrZXldLCBtb2RlbFtrZXldKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHN1YnNldDtcblx0fVxuXHRmdW5jdGlvbiBleHRlbmQoYSwgYiwgdW5kZWZPbmx5KSB7XG5cdFx0Zm9yICh2YXIgcHJvcCBpbiBiKSB7XG5cdFx0XHRpZiAoaGFzT3duJDEuY2FsbChiLCBwcm9wKSkge1xuXHRcdFx0XHRpZiAoYltwcm9wXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0ZGVsZXRlIGFbcHJvcF07XG5cdFx0XHRcdH0gZWxzZSBpZiAoISh1bmRlZk9ubHkgJiYgdHlwZW9mIGFbcHJvcF0gIT09ICd1bmRlZmluZWQnKSkge1xuXHRcdFx0XHRcdGFbcHJvcF0gPSBiW3Byb3BdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBhO1xuXHR9XG5cdGZ1bmN0aW9uIG9iamVjdFR5cGUob2JqKSB7XG5cdFx0aWYgKHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRyZXR1cm4gJ3VuZGVmaW5lZCc7XG5cdFx0fVxuXG5cdFx0Ly8gQ29uc2lkZXI6IHR5cGVvZiBudWxsID09PSBvYmplY3Rcblx0XHRpZiAob2JqID09PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gJ251bGwnO1xuXHRcdH1cblx0XHR2YXIgbWF0Y2ggPSB0b1N0cmluZy5jYWxsKG9iaikubWF0Y2goL15cXFtvYmplY3RcXHMoLiopXFxdJC8pO1xuXHRcdHZhciB0eXBlID0gbWF0Y2ggJiYgbWF0Y2hbMV07XG5cdFx0c3dpdGNoICh0eXBlKSB7XG5cdFx0XHRjYXNlICdOdW1iZXInOlxuXHRcdFx0XHRpZiAoaXNOYU4ob2JqKSkge1xuXHRcdFx0XHRcdHJldHVybiAnbmFuJztcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gJ251bWJlcic7XG5cdFx0XHRjYXNlICdTdHJpbmcnOlxuXHRcdFx0Y2FzZSAnQm9vbGVhbic6XG5cdFx0XHRjYXNlICdBcnJheSc6XG5cdFx0XHRjYXNlICdTZXQnOlxuXHRcdFx0Y2FzZSAnTWFwJzpcblx0XHRcdGNhc2UgJ0RhdGUnOlxuXHRcdFx0Y2FzZSAnUmVnRXhwJzpcblx0XHRcdGNhc2UgJ0Z1bmN0aW9uJzpcblx0XHRcdGNhc2UgJ1N5bWJvbCc6XG5cdFx0XHRcdHJldHVybiB0eXBlLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gX3R5cGVvZihvYmopO1xuXHRcdH1cblx0fVxuXG5cdC8vIFNhZmUgb2JqZWN0IHR5cGUgY2hlY2tpbmdcblx0ZnVuY3Rpb24gaXModHlwZSwgb2JqKSB7XG5cdFx0cmV0dXJuIG9iamVjdFR5cGUob2JqKSA9PT0gdHlwZTtcblx0fVxuXG5cdC8vIEJhc2VkIG9uIEphdmEncyBTdHJpbmcuaGFzaENvZGUsIGEgc2ltcGxlIGJ1dCBub3Rcblx0Ly8gcmlnb3JvdXNseSBjb2xsaXNpb24gcmVzaXN0YW50IGhhc2hpbmcgZnVuY3Rpb25cblx0ZnVuY3Rpb24gZ2VuZXJhdGVIYXNoKG1vZHVsZSwgdGVzdE5hbWUpIHtcblx0XHR2YXIgc3RyID0gbW9kdWxlICsgJ1xceDFDJyArIHRlc3ROYW1lO1xuXHRcdHZhciBoYXNoID0gMDtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuXHRcdFx0aGFzaCA9IChoYXNoIDw8IDUpIC0gaGFzaCArIHN0ci5jaGFyQ29kZUF0KGkpO1xuXHRcdFx0aGFzaCB8PSAwO1xuXHRcdH1cblxuXHRcdC8vIENvbnZlcnQgdGhlIHBvc3NpYmx5IG5lZ2F0aXZlIGludGVnZXIgaGFzaCBjb2RlIGludG8gYW4gOCBjaGFyYWN0ZXIgaGV4IHN0cmluZywgd2hpY2ggaXNuJ3Rcblx0XHQvLyBzdHJpY3RseSBuZWNlc3NhcnkgYnV0IGluY3JlYXNlcyB1c2VyIHVuZGVyc3RhbmRpbmcgdGhhdCB0aGUgaWQgaXMgYSBTSEEtbGlrZSBoYXNoXG5cdFx0dmFyIGhleCA9ICgweDEwMDAwMDAwMCArIGhhc2gpLnRvU3RyaW5nKDE2KTtcblx0XHRpZiAoaGV4Lmxlbmd0aCA8IDgpIHtcblx0XHRcdGhleCA9ICcwMDAwMDAwJyArIGhleDtcblx0XHR9XG5cdFx0cmV0dXJuIGhleC5zbGljZSgtOCk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYW4gZXJyb3IgaW50byBhIHNpbXBsZSBzdHJpbmcgZm9yIGNvbXBhcmlzb25zLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0Vycm9yfGFueX0gZXJyb3Jcblx0ICogQHJldHVybiB7c3RyaW5nfVxuXHQgKi9cblx0ZnVuY3Rpb24gZXJyb3JTdHJpbmcoZXJyb3IpIHtcblx0XHQvLyBVc2UgU3RyaW5nKCkgaW5zdGVhZCBvZiB0b1N0cmluZygpIHRvIGhhbmRsZSBub24tb2JqZWN0IHZhbHVlcyBsaWtlIHVuZGVmaW5lZCBvciBudWxsLlxuXHRcdHZhciByZXN1bHRFcnJvclN0cmluZyA9IFN0cmluZyhlcnJvcik7XG5cblx0XHQvLyBJZiB0aGUgZXJyb3Igd2Fzbid0IGEgc3ViY2xhc3Mgb2YgRXJyb3IgYnV0IHNvbWV0aGluZyBsaWtlXG5cdFx0Ly8gYW4gb2JqZWN0IGxpdGVyYWwgd2l0aCBuYW1lIGFuZCBtZXNzYWdlIHByb3BlcnRpZXMuLi5cblx0XHRpZiAocmVzdWx0RXJyb3JTdHJpbmcuc2xpY2UoMCwgNykgPT09ICdbb2JqZWN0Jykge1xuXHRcdFx0Ly8gQmFzZWQgb24gaHR0cHM6Ly9lczUuZ2l0aHViLmlvLyN4MTUuMTEuNC40XG5cdFx0XHRyZXR1cm4gKGVycm9yLm5hbWUgfHwgJ0Vycm9yJykgKyAoZXJyb3IubWVzc2FnZSA/IFwiOiBcIi5jb25jYXQoZXJyb3IubWVzc2FnZSkgOiAnJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiByZXN1bHRFcnJvclN0cmluZztcblx0XHR9XG5cdH1cblxuXHR2YXIgQk9YQUJMRV9UWVBFUyA9IG5ldyBTdHJpbmdTZXQoWydib29sZWFuJywgJ251bWJlcicsICdzdHJpbmcnXSk7XG5cblx0Ly8gTWVtb3J5IGZvciBwcmV2aW91c2x5IHNlZW4gY29udGFpbmVycyAob2JqZWN0LCBhcnJheSwgbWFwLCBzZXQpLlxuXHQvLyBVc2VkIGZvciByZWN1cnNpb24gZGV0ZWN0aW9uLCBhbmQgdG8gYXZvaWQgcmVwZWF0ZWQgY29tcGFyaXNvbi5cblx0Ly9cblx0Ly8gRWxlbWVudHMgYXJlIHsgYTogdmFsLCBiOiB2YWwgfS5cblx0dmFyIG1lbW9yeSA9IFtdO1xuXHRmdW5jdGlvbiB1c2VTdHJpY3RFcXVhbGl0eShhLCBiKSB7XG5cdFx0cmV0dXJuIGEgPT09IGI7XG5cdH1cblx0ZnVuY3Rpb24gdXNlT2JqZWN0VmFsdWVFcXVhbGl0eShhLCBiKSB7XG5cdFx0cmV0dXJuIGEgPT09IGIgfHwgYS52YWx1ZU9mKCkgPT09IGIudmFsdWVPZigpO1xuXHR9XG5cdGZ1bmN0aW9uIGNvbXBhcmVDb25zdHJ1Y3RvcnMoYSwgYikge1xuXHRcdC8vIENvbXBhcmluZyBjb25zdHJ1Y3RvcnMgaXMgbW9yZSBzdHJpY3QgdGhhbiB1c2luZyBgaW5zdGFuY2VvZmBcblx0XHRyZXR1cm4gZ2V0Q29uc3RydWN0b3IoYSkgPT09IGdldENvbnN0cnVjdG9yKGIpO1xuXHR9XG5cdGZ1bmN0aW9uIGdldENvbnN0cnVjdG9yKG9iaikge1xuXHRcdHZhciBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopO1xuXG5cdFx0Ly8gSWYgdGhlIG9iaiBwcm90b3R5cGUgZGVzY2VuZHMgZnJvbSBhIG51bGwgY29uc3RydWN0b3IsIHRyZWF0IGl0XG5cdFx0Ly8gYXMgYSBudWxsIHByb3RvdHlwZS5cblx0XHQvLyBSZWYgaHR0cHM6Ly9naXRodWIuY29tL3F1bml0anMvcXVuaXQvaXNzdWVzLzg1MVxuXHRcdC8vXG5cdFx0Ly8gQWxsb3cgb2JqZWN0cyB3aXRoIG5vIHByb3RvdHlwZSwgZnJvbSBPYmplY3QuY3JlYXRlKG51bGwpLCB0byBiZSBlcXVpdmFsZW50IHRvXG5cdFx0Ly8gcGxhaW4gb2JqZWN0cyB0aGF0IGhhdmUgT2JqZWN0IGFzIHRoZWlyIGNvbnN0cnVjdG9yLlxuXHRcdHJldHVybiAhcHJvdG8gfHwgcHJvdG8uY29uc3RydWN0b3IgPT09IG51bGwgPyBPYmplY3QgOiBvYmouY29uc3RydWN0b3I7XG5cdH1cblx0ZnVuY3Rpb24gZ2V0UmVnRXhwRmxhZ3MocmVnZXhwKSB7XG5cdFx0cmV0dXJuICdmbGFncycgaW4gcmVnZXhwID8gcmVnZXhwLmZsYWdzIDogcmVnZXhwLnRvU3RyaW5nKCkubWF0Y2goL1tnaW11eV0qJC8pWzBdO1xuXHR9XG5cblx0Ly8gU3BlY2lhbGlzZWQgY29tcGFyaXNvbnMgYWZ0ZXIgZW50cnlUeXBlQ2FsbGJhY2tzLm9iamVjdCwgYmFzZWQgb24gYG9iamVjdFR5cGUoKWBcblx0dmFyIG9ialR5cGVDYWxsYmFja3MgPSB7XG5cdFx0dW5kZWZpbmVkOiB1c2VTdHJpY3RFcXVhbGl0eSxcblx0XHRudWxsOiB1c2VTdHJpY3RFcXVhbGl0eSxcblx0XHQvLyBIYW5kbGUgYm94ZWQgYm9vbGVhblxuXHRcdGJvb2xlYW46IHVzZU9iamVjdFZhbHVlRXF1YWxpdHksXG5cdFx0bnVtYmVyOiBmdW5jdGlvbiBudW1iZXIoYSwgYikge1xuXHRcdFx0Ly8gSGFuZGxlIE5hTiBhbmQgYm94ZWQgbnVtYmVyXG5cdFx0XHRyZXR1cm4gYSA9PT0gYiB8fCBhLnZhbHVlT2YoKSA9PT0gYi52YWx1ZU9mKCkgfHwgaXNOYU4oYS52YWx1ZU9mKCkpICYmIGlzTmFOKGIudmFsdWVPZigpKTtcblx0XHR9LFxuXHRcdC8vIEhhbmRsZSBib3hlZCBzdHJpbmdcblx0XHRzdHJpbmc6IHVzZU9iamVjdFZhbHVlRXF1YWxpdHksXG5cdFx0c3ltYm9sOiB1c2VTdHJpY3RFcXVhbGl0eSxcblx0XHRkYXRlOiB1c2VPYmplY3RWYWx1ZUVxdWFsaXR5LFxuXHRcdG5hbjogZnVuY3Rpb24gbmFuKCkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSxcblx0XHRyZWdleHA6IGZ1bmN0aW9uIHJlZ2V4cChhLCBiKSB7XG5cdFx0XHRyZXR1cm4gYS5zb3VyY2UgPT09IGIuc291cmNlICYmXG5cdFx0XHRcdFx0XHQgLy8gSW5jbHVkZSBmbGFncyBpbiB0aGUgY29tcGFyaXNvblxuXHRcdFx0XHRcdFx0IGdldFJlZ0V4cEZsYWdzKGEpID09PSBnZXRSZWdFeHBGbGFncyhiKTtcblx0XHR9LFxuXHRcdC8vIGlkZW50aWNhbCByZWZlcmVuY2Ugb25seVxuXHRcdGZ1bmN0aW9uOiB1c2VTdHJpY3RFcXVhbGl0eSxcblx0XHRhcnJheTogZnVuY3Rpb24gYXJyYXkoYSwgYikge1xuXHRcdFx0aWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkge1xuXHRcdFx0XHQvLyBTYWZlIGFuZCBmYXN0ZXJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmICghdHlwZUVxdWl2KGFbaV0sIGJbaV0pKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9LFxuXHRcdC8vIERlZmluZSBzZXRzIGEgYW5kIGIgdG8gYmUgZXF1aXZhbGVudCBpZiBmb3IgZWFjaCBlbGVtZW50IGFWYWwgaW4gYSwgdGhlcmVcblx0XHQvLyBpcyBzb21lIGVsZW1lbnQgYlZhbCBpbiBiIHN1Y2ggdGhhdCBhVmFsIGFuZCBiVmFsIGFyZSBlcXVpdmFsZW50LiBFbGVtZW50XG5cdFx0Ly8gcmVwZXRpdGlvbnMgYXJlIG5vdCBjb3VudGVkLCBzbyB0aGVzZSBhcmUgZXF1aXZhbGVudDpcblx0XHQvLyBhID0gbmV3IFNldCggWyBYPXt9LCBZPVtdLCBZIF0gKTtcblx0XHQvLyBiID0gbmV3IFNldCggWyBZLCBYLCBYIF0gKTtcblx0XHRzZXQ6IGZ1bmN0aW9uIHNldChhLCBiKSB7XG5cdFx0XHRpZiAoYS5zaXplICE9PSBiLnNpemUpIHtcblx0XHRcdFx0Ly8gVGhpcyBvcHRpbWl6YXRpb24gaGFzIGNlcnRhaW4gcXVpcmtzIGJlY2F1c2Ugb2YgdGhlIGxhY2sgb2Zcblx0XHRcdFx0Ly8gcmVwZXRpdGlvbiBjb3VudGluZy4gRm9yIGluc3RhbmNlLCBhZGRpbmcgdGhlIHNhbWVcblx0XHRcdFx0Ly8gKHJlZmVyZW5jZS1pZGVudGljYWwpIGVsZW1lbnQgdG8gdHdvIGVxdWl2YWxlbnQgc2V0cyBjYW5cblx0XHRcdFx0Ly8gbWFrZSB0aGVtIG5vbi1lcXVpdmFsZW50LlxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHR2YXIgb3V0ZXJFcSA9IHRydWU7XG5cdFx0XHRhLmZvckVhY2goZnVuY3Rpb24gKGFWYWwpIHtcblx0XHRcdFx0Ly8gU2hvcnQtY2lyY3VpdCBpZiB0aGUgcmVzdWx0IGlzIGFscmVhZHkga25vd24uIChVc2luZyBmb3IuLi5vZlxuXHRcdFx0XHQvLyB3aXRoIGEgYnJlYWsgY2xhdXNlIHdvdWxkIGJlIGNsZWFuZXIgaGVyZSwgYnV0IGl0IHdvdWxkIGNhdXNlXG5cdFx0XHRcdC8vIGEgc3ludGF4IGVycm9yIG9uIG9sZGVyIEphdmFTY3JpcHQgaW1wbGVtZW50YXRpb25zIGV2ZW4gaWZcblx0XHRcdFx0Ly8gU2V0IGlzIHVudXNlZClcblx0XHRcdFx0aWYgKCFvdXRlckVxKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciBpbm5lckVxID0gZmFsc2U7XG5cdFx0XHRcdGIuZm9yRWFjaChmdW5jdGlvbiAoYlZhbCkge1xuXHRcdFx0XHRcdC8vIExpa2V3aXNlLCBzaG9ydC1jaXJjdWl0IGlmIHRoZSByZXN1bHQgaXMgYWxyZWFkeSBrbm93blxuXHRcdFx0XHRcdGlmIChpbm5lckVxKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gU3dhcCBvdXQgdGhlIGdsb2JhbCBtZW1vcnksIGFzIG5lc3RlZCB0eXBlRXF1aXYoKSB3b3VsZCBjbG9iYmVyIGl0XG5cdFx0XHRcdFx0dmFyIG9yaWdpbmFsTWVtb3J5ID0gbWVtb3J5O1xuXHRcdFx0XHRcdG1lbW9yeSA9IFtdO1xuXHRcdFx0XHRcdGlmICh0eXBlRXF1aXYoYlZhbCwgYVZhbCkpIHtcblx0XHRcdFx0XHRcdGlubmVyRXEgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBSZXN0b3JlXG5cdFx0XHRcdFx0bWVtb3J5ID0gb3JpZ2luYWxNZW1vcnk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAoIWlubmVyRXEpIHtcblx0XHRcdFx0XHRvdXRlckVxID0gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIG91dGVyRXE7XG5cdFx0fSxcblx0XHQvLyBEZWZpbmUgbWFwcyBhIGFuZCBiIHRvIGJlIGVxdWl2YWxlbnQgaWYgZm9yIGVhY2gga2V5LXZhbHVlIHBhaXIgKGFLZXksIGFWYWwpXG5cdFx0Ly8gaW4gYSwgdGhlcmUgaXMgc29tZSBrZXktdmFsdWUgcGFpciAoYktleSwgYlZhbCkgaW4gYiBzdWNoIHRoYXRcblx0XHQvLyBbIGFLZXksIGFWYWwgXSBhbmQgWyBiS2V5LCBiVmFsIF0gYXJlIGVxdWl2YWxlbnQuIEtleSByZXBldGl0aW9ucyBhcmUgbm90XG5cdFx0Ly8gY291bnRlZCwgc28gdGhlc2UgYXJlIGVxdWl2YWxlbnQ6XG5cdFx0Ly8gYSA9IG5ldyBNYXAoIFsgWyB7fSwgMSBdLCBbIHt9LCAxIF0sIFsgW10sIDEgXSBdICk7XG5cdFx0Ly8gYiA9IG5ldyBNYXAoIFsgWyB7fSwgMSBdLCBbIFtdLCAxIF0sIFsgW10sIDEgXSBdICk7XG5cdFx0bWFwOiBmdW5jdGlvbiBtYXAoYSwgYikge1xuXHRcdFx0aWYgKGEuc2l6ZSAhPT0gYi5zaXplKSB7XG5cdFx0XHRcdC8vIFRoaXMgb3B0aW1pemF0aW9uIGhhcyBjZXJ0YWluIHF1aXJrcyBiZWNhdXNlIG9mIHRoZSBsYWNrIG9mXG5cdFx0XHRcdC8vIHJlcGV0aXRpb24gY291bnRpbmcuIEZvciBpbnN0YW5jZSwgYWRkaW5nIHRoZSBzYW1lXG5cdFx0XHRcdC8vIChyZWZlcmVuY2UtaWRlbnRpY2FsKSBrZXktdmFsdWUgcGFpciB0byB0d28gZXF1aXZhbGVudCBtYXBzXG5cdFx0XHRcdC8vIGNhbiBtYWtlIHRoZW0gbm9uLWVxdWl2YWxlbnQuXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdHZhciBvdXRlckVxID0gdHJ1ZTtcblx0XHRcdGEuZm9yRWFjaChmdW5jdGlvbiAoYVZhbCwgYUtleSkge1xuXHRcdFx0XHQvLyBTaG9ydC1jaXJjdWl0IGlmIHRoZSByZXN1bHQgaXMgYWxyZWFkeSBrbm93bi4gKFVzaW5nIGZvci4uLm9mXG5cdFx0XHRcdC8vIHdpdGggYSBicmVhayBjbGF1c2Ugd291bGQgYmUgY2xlYW5lciBoZXJlLCBidXQgaXQgd291bGQgY2F1c2Vcblx0XHRcdFx0Ly8gYSBzeW50YXggZXJyb3Igb24gb2xkZXIgSmF2YVNjcmlwdCBpbXBsZW1lbnRhdGlvbnMgZXZlbiBpZlxuXHRcdFx0XHQvLyBNYXAgaXMgdW51c2VkKVxuXHRcdFx0XHRpZiAoIW91dGVyRXEpIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIGlubmVyRXEgPSBmYWxzZTtcblx0XHRcdFx0Yi5mb3JFYWNoKGZ1bmN0aW9uIChiVmFsLCBiS2V5KSB7XG5cdFx0XHRcdFx0Ly8gTGlrZXdpc2UsIHNob3J0LWNpcmN1aXQgaWYgdGhlIHJlc3VsdCBpcyBhbHJlYWR5IGtub3duXG5cdFx0XHRcdFx0aWYgKGlubmVyRXEpIHtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBTd2FwIG91dCB0aGUgZ2xvYmFsIG1lbW9yeSwgYXMgbmVzdGVkIHR5cGVFcXVpdigpIHdvdWxkIGNsb2JiZXIgaXRcblx0XHRcdFx0XHR2YXIgb3JpZ2luYWxNZW1vcnkgPSBtZW1vcnk7XG5cdFx0XHRcdFx0bWVtb3J5ID0gW107XG5cdFx0XHRcdFx0aWYgKG9ialR5cGVDYWxsYmFja3MuYXJyYXkoW2JWYWwsIGJLZXldLCBbYVZhbCwgYUtleV0pKSB7XG5cdFx0XHRcdFx0XHRpbm5lckVxID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gUmVzdG9yZVxuXHRcdFx0XHRcdG1lbW9yeSA9IG9yaWdpbmFsTWVtb3J5O1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKCFpbm5lckVxKSB7XG5cdFx0XHRcdFx0b3V0ZXJFcSA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBvdXRlckVxO1xuXHRcdH1cblx0fTtcblxuXHQvLyBFbnRyeSBwb2ludHMgZnJvbSB0eXBlRXF1aXYsIGJhc2VkIG9uIGB0eXBlb2ZgXG5cdHZhciBlbnRyeVR5cGVDYWxsYmFja3MgPSB7XG5cdFx0dW5kZWZpbmVkOiB1c2VTdHJpY3RFcXVhbGl0eSxcblx0XHRudWxsOiB1c2VTdHJpY3RFcXVhbGl0eSxcblx0XHRib29sZWFuOiB1c2VTdHJpY3RFcXVhbGl0eSxcblx0XHRudW1iZXI6IGZ1bmN0aW9uIG51bWJlcihhLCBiKSB7XG5cdFx0XHQvLyBIYW5kbGUgTmFOXG5cdFx0XHRyZXR1cm4gYSA9PT0gYiB8fCBpc05hTihhKSAmJiBpc05hTihiKTtcblx0XHR9LFxuXHRcdHN0cmluZzogdXNlU3RyaWN0RXF1YWxpdHksXG5cdFx0c3ltYm9sOiB1c2VTdHJpY3RFcXVhbGl0eSxcblx0XHRmdW5jdGlvbjogdXNlU3RyaWN0RXF1YWxpdHksXG5cdFx0b2JqZWN0OiBmdW5jdGlvbiBvYmplY3QoYSwgYikge1xuXHRcdFx0Ly8gSGFuZGxlIG1lbW9yeSAoc2tpcCByZWN1cnNpb24pXG5cdFx0XHRpZiAobWVtb3J5LnNvbWUoZnVuY3Rpb24gKHBhaXIpIHtcblx0XHRcdFx0cmV0dXJuIHBhaXIuYSA9PT0gYSAmJiBwYWlyLmIgPT09IGI7XG5cdFx0XHR9KSkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdG1lbW9yeS5wdXNoKHtcblx0XHRcdFx0YTogYSxcblx0XHRcdFx0YjogYlxuXHRcdFx0fSk7XG5cdFx0XHR2YXIgYU9ialR5cGUgPSBvYmplY3RUeXBlKGEpO1xuXHRcdFx0dmFyIGJPYmpUeXBlID0gb2JqZWN0VHlwZShiKTtcblx0XHRcdGlmIChhT2JqVHlwZSAhPT0gJ29iamVjdCcgfHwgYk9ialR5cGUgIT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdC8vIEhhbmRsZSBsaXRlcmFsIGBudWxsYFxuXHRcdFx0XHQvLyBIYW5kbGU6IEFycmF5LCBNYXAvU2V0LCBEYXRlLCBSZWd4cC9GdW5jdGlvbiwgYm94ZWQgcHJpbWl0aXZlc1xuXHRcdFx0XHRyZXR1cm4gYU9ialR5cGUgPT09IGJPYmpUeXBlICYmIG9ialR5cGVDYWxsYmFja3NbYU9ialR5cGVdKGEsIGIpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBOT1RFOiBMaXRlcmFsIG51bGwgbXVzdCBub3QgbWFrZSBpdCBoZXJlIGFzIGl0IHdvdWxkIHRocm93XG5cdFx0XHRpZiAoY29tcGFyZUNvbnN0cnVjdG9ycyhhLCBiKSA9PT0gZmFsc2UpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGFQcm9wZXJ0aWVzID0gW107XG5cdFx0XHR2YXIgYlByb3BlcnRpZXMgPSBbXTtcblxuXHRcdFx0Ly8gQmUgc3RyaWN0IGFuZCBnbyBkZWVwLCBubyBmaWx0ZXJpbmcgd2l0aCBoYXNPd25Qcm9wZXJ0eS5cblx0XHRcdGZvciAodmFyIGkgaW4gYSkge1xuXHRcdFx0XHQvLyBDb2xsZWN0IGEncyBwcm9wZXJ0aWVzXG5cdFx0XHRcdGFQcm9wZXJ0aWVzLnB1c2goaSk7XG5cblx0XHRcdFx0Ly8gU2tpcCBPT1AgbWV0aG9kcyB0aGF0IGxvb2sgdGhlIHNhbWVcblx0XHRcdFx0aWYgKGEuY29uc3RydWN0b3IgIT09IE9iamVjdCAmJiB0eXBlb2YgYS5jb25zdHJ1Y3RvciAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGFbaV0gPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGJbaV0gPT09ICdmdW5jdGlvbicgJiYgYVtpXS50b1N0cmluZygpID09PSBiW2ldLnRvU3RyaW5nKCkpIHtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIXR5cGVFcXVpdihhW2ldLCBiW2ldKSkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Zm9yICh2YXIgX2kgaW4gYikge1xuXHRcdFx0XHQvLyBDb2xsZWN0IGIncyBwcm9wZXJ0aWVzXG5cdFx0XHRcdGJQcm9wZXJ0aWVzLnB1c2goX2kpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG9ialR5cGVDYWxsYmFja3MuYXJyYXkoYVByb3BlcnRpZXMuc29ydCgpLCBiUHJvcGVydGllcy5zb3J0KCkpO1xuXHRcdH1cblx0fTtcblx0ZnVuY3Rpb24gdHlwZUVxdWl2KGEsIGIpIHtcblx0XHQvLyBPcHRpbWl6YXRpb246IE9ubHkgcGVyZm9ybSB0eXBlLXNwZWNpZmljIGNvbXBhcmlzb24gd2hlbiBwYWlycyBhcmUgbm90IHN0cmljdGx5IGVxdWFsLlxuXHRcdGlmIChhID09PSBiKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0dmFyIGFUeXBlID0gX3R5cGVvZihhKTtcblx0XHR2YXIgYlR5cGUgPSBfdHlwZW9mKGIpO1xuXHRcdGlmIChhVHlwZSAhPT0gYlR5cGUpIHtcblx0XHRcdC8vIFN1cHBvcnQgY29tcGFyaW5nIHByaW1pdGl2ZSB0byBib3hlZCBwcmltaXRpdmVzXG5cdFx0XHQvLyBUcnkgYWdhaW4gYWZ0ZXIgcG9zc2libHkgdW53cmFwcGluZyBvbmVcblx0XHRcdHJldHVybiAoYVR5cGUgPT09ICdvYmplY3QnICYmIEJPWEFCTEVfVFlQRVMuaGFzKG9iamVjdFR5cGUoYSkpID8gYS52YWx1ZU9mKCkgOiBhKSA9PT0gKGJUeXBlID09PSAnb2JqZWN0JyAmJiBCT1hBQkxFX1RZUEVTLmhhcyhvYmplY3RUeXBlKGIpKSA/IGIudmFsdWVPZigpIDogYik7XG5cdFx0fVxuXHRcdHJldHVybiBlbnRyeVR5cGVDYWxsYmFja3NbYVR5cGVdKGEsIGIpO1xuXHR9XG5cdGZ1bmN0aW9uIGlubmVyRXF1aXYoYSwgYikge1xuXHRcdHZhciByZXMgPSB0eXBlRXF1aXYoYSwgYik7XG5cdFx0Ly8gUmVsZWFzZSBhbnkgcmV0YWluZWQgb2JqZWN0cyBhbmQgcmVzZXQgcmVjdXJzaW9uIGRldGVjdGlvbiBmb3IgbmV4dCBjYWxsXG5cdFx0bWVtb3J5ID0gW107XG5cdFx0cmV0dXJuIHJlcztcblx0fVxuXG5cdC8qKlxuXHQgKiBUZXN0IGFueSB0d28gdHlwZXMgb2YgSmF2YVNjcmlwdCB2YWx1ZXMgZm9yIGVxdWFsaXR5LlxuXHQgKlxuXHQgKiBAYXV0aG9yIFBoaWxpcHBlIFJhdGjDqSA8cHJhdGhlQGdtYWlsLmNvbT5cblx0ICogQGF1dGhvciBEYXZpZCBDaGFuIDxkYXZpZEB0cm9pLm9yZz5cblx0ICovXG5cdGZ1bmN0aW9uIGVxdWl2KGEsIGIpIHtcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuXHRcdFx0cmV0dXJuIGEgPT09IGIgfHwgaW5uZXJFcXVpdihhLCBiKTtcblx0XHR9XG5cblx0XHQvLyBHaXZlbiAwIG9yIDEgYXJndW1lbnRzLCBqdXN0IHJldHVybiB0cnVlIChub3RoaW5nIHRvIGNvbXBhcmUpLlxuXHRcdC8vIEdpdmVuIChBLEIsQyxEKSBjb21wYXJlIEMsRCB0aGVuIEIsQyB0aGVuIEEsQi5cblx0XHR2YXIgaSA9IGFyZ3VtZW50cy5sZW5ndGggLSAxO1xuXHRcdHdoaWxlIChpID4gMCkge1xuXHRcdFx0aWYgKCFpbm5lckVxdWl2KGFyZ3VtZW50c1tpIC0gMV0sIGFyZ3VtZW50c1tpXSkpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0aS0tO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb25maWcgb2JqZWN0OiBNYWludGFpbiBpbnRlcm5hbCBzdGF0ZVxuXHQgKiBMYXRlciBleHBvc2VkIGFzIFFVbml0LmNvbmZpZ1xuXHQgKiBgY29uZmlnYCBpbml0aWFsaXplZCBhdCB0b3Agb2Ygc2NvcGVcblx0ICovXG5cdHZhciBjb25maWcgPSB7XG5cdFx0Ly8gSFRNTCBSZXBvcnRlcjogTW9kaWZ5IGRvY3VtZW50LnRpdGxlIHdoZW4gc3VpdGUgaXMgZG9uZVxuXHRcdGFsdGVydGl0bGU6IHRydWUsXG5cdFx0Ly8gSFRNTCBSZXBvcnRlcjogY29sbGFwc2UgZXZlcnkgdGVzdCBleGNlcHQgdGhlIGZpcnN0IGZhaWxpbmcgdGVzdFxuXHRcdC8vIElmIGZhbHNlLCBhbGwgZmFpbGluZyB0ZXN0cyB3aWxsIGJlIGV4cGFuZGVkXG5cdFx0Y29sbGFwc2U6IHRydWUsXG5cdFx0Ly8gd2hldGhlciBvciBub3QgdG8gZmFpbCB3aGVuIHRoZXJlIGFyZSB6ZXJvIHRlc3RzXG5cdFx0Ly8gZGVmYXVsdHMgdG8gYHRydWVgXG5cdFx0ZmFpbE9uWmVyb1Rlc3RzOiB0cnVlLFxuXHRcdC8vIFNlbGVjdCBieSBwYXR0ZXJuIG9yIGNhc2UtaW5zZW5zaXRpdmUgc3Vic3RyaW5nIG1hdGNoIGFnYWluc3QgXCJtb2R1bGVOYW1lOiB0ZXN0TmFtZVwiXG5cdFx0ZmlsdGVyOiB1bmRlZmluZWQsXG5cdFx0Ly8gRGVwdGggdXAtdG8gd2hpY2ggb2JqZWN0IHdpbGwgYmUgZHVtcGVkXG5cdFx0bWF4RGVwdGg6IDUsXG5cdFx0Ly8gU2VsZWN0IGNhc2UtaW5zZW5zaXRpdmUgbWF0Y2ggb2YgdGhlIG1vZHVsZSBuYW1lXG5cdFx0bW9kdWxlOiB1bmRlZmluZWQsXG5cdFx0Ly8gSFRNTCBSZXBvcnRlcjogU2VsZWN0IG1vZHVsZS90ZXN0IGJ5IGFycmF5IG9mIGludGVybmFsIElEc1xuXHRcdG1vZHVsZUlkOiB1bmRlZmluZWQsXG5cdFx0Ly8gQnkgZGVmYXVsdCwgcnVuIHByZXZpb3VzbHkgZmFpbGVkIHRlc3RzIGZpcnN0XG5cdFx0Ly8gdmVyeSB1c2VmdWwgaW4gY29tYmluYXRpb24gd2l0aCBcIkhpZGUgcGFzc2VkIHRlc3RzXCIgY2hlY2tlZFxuXHRcdHJlb3JkZXI6IHRydWUsXG5cdFx0Ly8gV2hlbiBlbmFibGVkLCBhbGwgdGVzdHMgbXVzdCBjYWxsIGV4cGVjdCgpXG5cdFx0cmVxdWlyZUV4cGVjdHM6IGZhbHNlLFxuXHRcdC8vIEJ5IGRlZmF1bHQsIHNjcm9sbCB0byB0b3Agb2YgdGhlIHBhZ2Ugd2hlbiBzdWl0ZSBpcyBkb25lXG5cdFx0c2Nyb2xsdG9wOiB0cnVlLFxuXHRcdC8vIFRoZSBzdG9yYWdlIG1vZHVsZSB0byB1c2UgZm9yIHJlb3JkZXJpbmcgdGVzdHNcblx0XHRzdG9yYWdlOiBsb2NhbFNlc3Npb25TdG9yYWdlLFxuXHRcdHRlc3RJZDogdW5kZWZpbmVkLFxuXHRcdC8vIEhUTUwgUmVwb3J0ZXI6IExpc3Qgb2YgVVJMIHBhcmFtZXRlcnMgdGhhdCBhcmUgZ2l2ZW4gdmlzdWFsIGNvbnRyb2xzXG5cdFx0dXJsQ29uZmlnOiBbXSxcblx0XHQvLyBJbnRlcm5hbDogVGhlIGZpcnN0IHVubmFtZWQgbW9kdWxlXG5cdFx0Ly9cblx0XHQvLyBCeSBiZWluZyBkZWZpbmVkIGFzIHRoZSBpbnRpYWwgdmFsdWUgZm9yIGN1cnJlbnRNb2R1bGUsIGl0IGlzIHRoZVxuXHRcdC8vIHJlY2VwdGFjbGUgYW5kIGltcGxpZWQgcGFyZW50IGZvciBhbnkgZ2xvYmFsIHRlc3RzLiBJdCBpcyBhcyBpZiB3ZVxuXHRcdC8vIGNhbGxlZCBgUVVuaXQubW9kdWxlKCBcIlwiICk7YCBiZWZvcmUgYW55IG90aGVyIHRlc3RzIHdlcmUgZGVmaW5lZC5cblx0XHQvL1xuXHRcdC8vIElmIHdlIHJlYWNoIGJlZ2luKCkgYW5kIG5vIHRlc3RzIHdlcmUgcHV0IGluIGl0LCB3ZSBkZXF1ZXVlIGl0IGFzIGlmIGl0XG5cdFx0Ly8gbmV2ZXIgZXhpc3RlZCwgYW5kIGluIHRoYXQgY2FzZSBuZXZlciBleHBvc2UgaXQgdG8gdGhlIGV2ZW50cyBhbmRcblx0XHQvLyBjYWxsYmFja3MgQVBJLlxuXHRcdC8vXG5cdFx0Ly8gV2hlbiBnbG9iYWwgdGVzdHMgYXJlIGRlZmluZWQsIHRoZW4gdGhpcyB1bm5hbWVkIG1vZHVsZSB3aWxsIGV4ZWN1dGVcblx0XHQvLyBhcyBhbnkgb3RoZXIgbW9kdWxlLCBpbmNsdWRpbmcgbW9kdWxlU3RhcnQvbW9kdWxlRG9uZSBldmVudHMgZXRjLlxuXHRcdC8vXG5cdFx0Ly8gU2luY2UgdGhpcyBtb2R1bGUgaXNuJ3QgZXhwbGljaXRseSBjcmVhdGVkIGJ5IHRoZSB1c2VyLCB0aGV5IGhhdmUgbm9cblx0XHQvLyBhY2Nlc3MgdG8gYWRkIGhvb2tzIGZvciBpdC4gVGhlIGhvb2tzIG9iamVjdCBpcyBkZWZpbmVkIHRvIGNvbXBseVxuXHRcdC8vIHdpdGggaW50ZXJuYWwgZXhwZWN0YXRpb25zIG9mIHRlc3QuanMsIGJ1dCB0aGV5IHdpbGwgYmUgZW1wdHkuXG5cdFx0Ly8gVG8gYXBwbHkgaG9va3MsIHBsYWNlIHRlc3RzIGV4cGxpY2l0bHkgaW4gYSBRVW5pdC5tb2R1bGUoKSwgYW5kIHVzZVxuXHRcdC8vIGl0cyBob29rcyBhY2NvcmRpbmdseS5cblx0XHQvL1xuXHRcdC8vIEZvciBnbG9iYWwgaG9va3MgdGhhdCBhcHBseSB0byBhbGwgdGVzdHMgYW5kIGFsbCBtb2R1bGVzLCB1c2UgUVVuaXQuaG9va3MuXG5cdFx0Ly9cblx0XHQvLyBOT1RFOiBUaGlzIGlzICpub3QqIGEgXCJnbG9iYWwgbW9kdWxlXCIuIEl0IGlzIG5vdCBhbiBhbmNlc3RvciBvZiBhbGwgbW9kdWxlc1xuXHRcdC8vIGFuZCB0ZXN0cy4gSXQgaXMgbWVyZWx5IHRoZSBwYXJlbnQgZm9yIGFueSB0ZXN0cyBkZWZpbmVkIGdsb2JhbGx5LFxuXHRcdC8vIGJlZm9yZSB0aGUgZmlyc3QgUVVuaXQubW9kdWxlKCkuIEFzIHN1Y2gsIHRoZSBldmVudHMgZm9yIHRoaXMgdW5uYW1lZFxuXHRcdC8vIG1vZHVsZSB3aWxsIGZpcmUgYXMgbm9ybWFsLCByaWdodCBhZnRlciBpdHMgbGFzdCB0ZXN0LCBhbmQgKm5vdCogYXRcblx0XHQvLyB0aGUgZW5kIG9mIHRoZSB0ZXN0IHJ1bi5cblx0XHQvL1xuXHRcdC8vIE5PVEU6IFRoaXMgYWxzbyBzaG91bGQgcHJvYmFibHkgYWxzbyBub3QgYmVjb21lIGEgZ2xvYmFsIG1vZHVsZSwgdW5sZXNzXG5cdFx0Ly8gd2Uga2VlcCBpdCBvdXQgb2YgdGhlIHB1YmxpYyBBUEkuIEZvciBleGFtcGxlLCBpdCB3b3VsZCBsaWtlbHkgbm90XG5cdFx0Ly8gaW1wcm92ZSB0aGUgdXNlciBpbnRlcmZhY2UgYW5kIHBsdWdpbiBiZWhhdmlvdXIgaWYgYWxsIG1vZHVsZXMgYmVjYW1lXG5cdFx0Ly8gd3JhcHBlZCBiZXR3ZWVuIHRoZSBzdGFydCBhbmQgZW5kIGV2ZW50cyBvZiB0aGlzIG1vZHVsZSwgYW5kIHRodXNcblx0XHQvLyBuZWVkbGVzc2x5IGFkZCBpbmRlbnRhdGlvbiwgaW5kaXJlY3Rpb24sIG9yIG90aGVyIHZpc2libGUgbm9pc2UuXG5cdFx0Ly8gVW5pdCB0ZXN0cyBmb3IgdGhlIGNhbGxiYWNrcyBBUEkgd291bGQgZGV0ZWN0IHRoYXQgYXMgYSByZWdyZXNzaW9uLlxuXHRcdGN1cnJlbnRNb2R1bGU6IHtcblx0XHRcdG5hbWU6ICcnLFxuXHRcdFx0dGVzdHM6IFtdLFxuXHRcdFx0Y2hpbGRNb2R1bGVzOiBbXSxcblx0XHRcdHRlc3RzUnVuOiAwLFxuXHRcdFx0dGVzdHNJZ25vcmVkOiAwLFxuXHRcdFx0aG9va3M6IHtcblx0XHRcdFx0YmVmb3JlOiBbXSxcblx0XHRcdFx0YmVmb3JlRWFjaDogW10sXG5cdFx0XHRcdGFmdGVyRWFjaDogW10sXG5cdFx0XHRcdGFmdGVyOiBbXVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Ly8gSW50ZXJuYWw6IEV4cG9zZWQgdG8gbWFrZSByZXNldHMgZWFzaWVyXG5cdFx0Ly8gUmVmIGh0dHBzOi8vZ2l0aHViLmNvbS9xdW5pdGpzL3F1bml0L3B1bGwvMTU5OFxuXHRcdGdsb2JhbEhvb2tzOiB7fSxcblx0XHQvLyBJbnRlcm5hbCBzdGF0ZVxuXHRcdGJsb2NraW5nOiB0cnVlLFxuXHRcdGNhbGxiYWNrczoge30sXG5cdFx0bW9kdWxlczogW10sXG5cdFx0cXVldWU6IFtdLFxuXHRcdHN0YXRzOiB7XG5cdFx0XHRhbGw6IDAsXG5cdFx0XHRiYWQ6IDAsXG5cdFx0XHR0ZXN0Q291bnQ6IDBcblx0XHR9XG5cdH07XG5cblx0Ly8gQXBwbHkgYSBwcmVkZWZpbmVkIFFVbml0LmNvbmZpZyBvYmplY3Rcblx0Ly9cblx0Ly8gSWdub3JlIFFVbml0LmNvbmZpZyBpZiBpdCBpcyBhIFFVbml0IGRpc3RyaWJ1dGlvbiBpbnN0ZWFkIG9mIHByZWNvbmZpZy5cblx0Ly8gVGhhdCBtZWFucyBRVW5pdCB3YXMgbG9hZGVkIHR3aWNlISAoVXNlIHRoZSBzYW1lIGFwcHJvYWNoIGFzIGV4cG9ydC5qcylcblx0dmFyIHByZUNvbmZpZyA9IGcgJiYgZy5RVW5pdCAmJiAhZy5RVW5pdC52ZXJzaW9uICYmIGcuUVVuaXQuY29uZmlnO1xuXHRpZiAocHJlQ29uZmlnKSB7XG5cdFx0ZXh0ZW5kKGNvbmZpZywgcHJlQ29uZmlnKTtcblx0fVxuXG5cdC8vIFB1c2ggYSBsb29zZSB1bm5hbWVkIG1vZHVsZSB0byB0aGUgbW9kdWxlcyBjb2xsZWN0aW9uXG5cdGNvbmZpZy5tb2R1bGVzLnB1c2goY29uZmlnLmN1cnJlbnRNb2R1bGUpO1xuXG5cdHZhciBkdW1wID0gKGZ1bmN0aW9uICgpIHtcblx0XHRmdW5jdGlvbiBxdW90ZShzdHIpIHtcblx0XHRcdHJldHVybiAnXCInICsgc3RyLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxcXC9nLCAnXFxcXFxcXFwnKS5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJykgKyAnXCInO1xuXHRcdH1cblx0XHRmdW5jdGlvbiBsaXRlcmFsKG8pIHtcblx0XHRcdHJldHVybiBvICsgJyc7XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIGpvaW4ocHJlLCBhcnIsIHBvc3QpIHtcblx0XHRcdHZhciBzID0gZHVtcC5zZXBhcmF0b3IoKTtcblx0XHRcdHZhciBpbm5lciA9IGR1bXAuaW5kZW50KDEpO1xuXHRcdFx0aWYgKGFyci5qb2luKSB7XG5cdFx0XHRcdGFyciA9IGFyci5qb2luKCcsJyArIHMgKyBpbm5lcik7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIWFycikge1xuXHRcdFx0XHRyZXR1cm4gcHJlICsgcG9zdDtcblx0XHRcdH1cblx0XHRcdHZhciBiYXNlID0gZHVtcC5pbmRlbnQoKTtcblx0XHRcdHJldHVybiBbcHJlLCBpbm5lciArIGFyciwgYmFzZSArIHBvc3RdLmpvaW4ocyk7XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIGFycmF5KGFyciwgc3RhY2spIHtcblx0XHRcdGlmIChkdW1wLm1heERlcHRoICYmIGR1bXAuZGVwdGggPiBkdW1wLm1heERlcHRoKSB7XG5cdFx0XHRcdHJldHVybiAnW29iamVjdCBBcnJheV0nO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy51cCgpO1xuXHRcdFx0dmFyIGkgPSBhcnIubGVuZ3RoO1xuXHRcdFx0dmFyIHJldCA9IG5ldyBBcnJheShpKTtcblx0XHRcdHdoaWxlIChpLS0pIHtcblx0XHRcdFx0cmV0W2ldID0gdGhpcy5wYXJzZShhcnJbaV0sIHVuZGVmaW5lZCwgc3RhY2spO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5kb3duKCk7XG5cdFx0XHRyZXR1cm4gam9pbignWycsIHJldCwgJ10nKTtcblx0XHR9XG5cdFx0ZnVuY3Rpb24gaXNBcnJheShvYmopIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdC8vIE5hdGl2ZSBBcnJheXNcblx0XHRcdFx0dG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nIHx8XG5cdFx0XHRcdC8vIE5vZGVMaXN0IG9iamVjdHNcblx0XHRcdFx0dHlwZW9mIG9iai5sZW5ndGggPT09ICdudW1iZXInICYmIG9iai5pdGVtICE9PSB1bmRlZmluZWQgJiYgKG9iai5sZW5ndGggPyBvYmouaXRlbSgwKSA9PT0gb2JqWzBdIDogb2JqLml0ZW0oMCkgPT09IG51bGwgJiYgb2JqWzBdID09PSB1bmRlZmluZWQpXG5cdFx0XHQpO1xuXHRcdH1cblx0XHR2YXIgcmVOYW1lID0gL15mdW5jdGlvbiAoXFx3KykvO1xuXHRcdHZhciBkdW1wID0ge1xuXHRcdFx0Ly8gVGhlIG9ialR5cGUgaXMgdXNlZCBtb3N0bHkgaW50ZXJuYWxseSwgeW91IGNhbiBmaXggYSAoY3VzdG9tKSB0eXBlIGluIGFkdmFuY2Vcblx0XHRcdHBhcnNlOiBmdW5jdGlvbiBwYXJzZShvYmosIG9ialR5cGUsIHN0YWNrKSB7XG5cdFx0XHRcdHN0YWNrID0gc3RhY2sgfHwgW107XG5cdFx0XHRcdHZhciBvYmpJbmRleCA9IHN0YWNrLmluZGV4T2Yob2JqKTtcblx0XHRcdFx0aWYgKG9iakluZGV4ICE9PSAtMSkge1xuXHRcdFx0XHRcdHJldHVybiBcInJlY3Vyc2lvbihcIi5jb25jYXQob2JqSW5kZXggLSBzdGFjay5sZW5ndGgsIFwiKVwiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRvYmpUeXBlID0gb2JqVHlwZSB8fCB0aGlzLnR5cGVPZihvYmopO1xuXHRcdFx0XHR2YXIgcGFyc2VyID0gdGhpcy5wYXJzZXJzW29ialR5cGVdO1xuXHRcdFx0XHR2YXIgcGFyc2VyVHlwZSA9IF90eXBlb2YocGFyc2VyKTtcblx0XHRcdFx0aWYgKHBhcnNlclR5cGUgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRzdGFjay5wdXNoKG9iaik7XG5cdFx0XHRcdFx0dmFyIHJlcyA9IHBhcnNlci5jYWxsKHRoaXMsIG9iaiwgc3RhY2spO1xuXHRcdFx0XHRcdHN0YWNrLnBvcCgpO1xuXHRcdFx0XHRcdHJldHVybiByZXM7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHBhcnNlclR5cGUgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlcjtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gJ1tFUlJPUjogTWlzc2luZyBRVW5pdC5kdW1wIGZvcm1hdHRlciBmb3IgdHlwZSAnICsgb2JqVHlwZSArICddJztcblx0XHRcdH0sXG5cdFx0XHR0eXBlT2Y6IGZ1bmN0aW9uIHR5cGVPZihvYmopIHtcblx0XHRcdFx0dmFyIHR5cGU7XG5cdFx0XHRcdGlmIChvYmogPT09IG51bGwpIHtcblx0XHRcdFx0XHR0eXBlID0gJ251bGwnO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdFx0dHlwZSA9ICd1bmRlZmluZWQnO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGlzKCdyZWdleHAnLCBvYmopKSB7XG5cdFx0XHRcdFx0dHlwZSA9ICdyZWdleHAnO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGlzKCdkYXRlJywgb2JqKSkge1xuXHRcdFx0XHRcdHR5cGUgPSAnZGF0ZSc7XG5cdFx0XHRcdH0gZWxzZSBpZiAoaXMoJ2Z1bmN0aW9uJywgb2JqKSkge1xuXHRcdFx0XHRcdHR5cGUgPSAnZnVuY3Rpb24nO1xuXHRcdFx0XHR9IGVsc2UgaWYgKG9iai5zZXRJbnRlcnZhbCAhPT0gdW5kZWZpbmVkICYmIG9iai5kb2N1bWVudCAhPT0gdW5kZWZpbmVkICYmIG9iai5ub2RlVHlwZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0dHlwZSA9ICd3aW5kb3cnO1xuXHRcdFx0XHR9IGVsc2UgaWYgKG9iai5ub2RlVHlwZSA9PT0gOSkge1xuXHRcdFx0XHRcdHR5cGUgPSAnZG9jdW1lbnQnO1xuXHRcdFx0XHR9IGVsc2UgaWYgKG9iai5ub2RlVHlwZSkge1xuXHRcdFx0XHRcdHR5cGUgPSAnbm9kZSc7XG5cdFx0XHRcdH0gZWxzZSBpZiAoaXNBcnJheShvYmopKSB7XG5cdFx0XHRcdFx0dHlwZSA9ICdhcnJheSc7XG5cdFx0XHRcdH0gZWxzZSBpZiAob2JqLmNvbnN0cnVjdG9yID09PSBFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IpIHtcblx0XHRcdFx0XHR0eXBlID0gJ2Vycm9yJztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0eXBlID0gX3R5cGVvZihvYmopO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB0eXBlO1xuXHRcdFx0fSxcblx0XHRcdHNlcGFyYXRvcjogZnVuY3Rpb24gc2VwYXJhdG9yKCkge1xuXHRcdFx0XHRpZiAodGhpcy5tdWx0aWxpbmUpIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5IVE1MID8gJzxiciAvPicgOiAnXFxuJztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5IVE1MID8gJyYjMTYwOycgOiAnICc7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHQvLyBFeHRyYSBjYW4gYmUgYSBudW1iZXIsIHNob3J0Y3V0IGZvciBpbmNyZWFzaW5nLWNhbGxpbmctZGVjcmVhc2luZ1xuXHRcdFx0aW5kZW50OiBmdW5jdGlvbiBpbmRlbnQoZXh0cmEpIHtcblx0XHRcdFx0aWYgKCF0aGlzLm11bHRpbGluZSkge1xuXHRcdFx0XHRcdHJldHVybiAnJztcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgY2hyID0gdGhpcy5pbmRlbnRDaGFyO1xuXHRcdFx0XHRpZiAodGhpcy5IVE1MKSB7XG5cdFx0XHRcdFx0Y2hyID0gY2hyLnJlcGxhY2UoL1xcdC9nLCAnICAgJykucmVwbGFjZSgvIC9nLCAnJiMxNjA7Jyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIG5ldyBBcnJheSh0aGlzLmRlcHRoICsgKGV4dHJhIHx8IDApKS5qb2luKGNocik7XG5cdFx0XHR9LFxuXHRcdFx0dXA6IGZ1bmN0aW9uIHVwKGEpIHtcblx0XHRcdFx0dGhpcy5kZXB0aCArPSBhIHx8IDE7XG5cdFx0XHR9LFxuXHRcdFx0ZG93bjogZnVuY3Rpb24gZG93bihhKSB7XG5cdFx0XHRcdHRoaXMuZGVwdGggLT0gYSB8fCAxO1xuXHRcdFx0fSxcblx0XHRcdHNldFBhcnNlcjogZnVuY3Rpb24gc2V0UGFyc2VyKG5hbWUsIHBhcnNlcikge1xuXHRcdFx0XHR0aGlzLnBhcnNlcnNbbmFtZV0gPSBwYXJzZXI7XG5cdFx0XHR9LFxuXHRcdFx0Ly8gVGhlIG5leHQgMyBhcmUgZXhwb3NlZCBzbyB5b3UgY2FuIHVzZSB0aGVtXG5cdFx0XHRxdW90ZTogcXVvdGUsXG5cdFx0XHRsaXRlcmFsOiBsaXRlcmFsLFxuXHRcdFx0am9pbjogam9pbixcblx0XHRcdGRlcHRoOiAxLFxuXHRcdFx0bWF4RGVwdGg6IGNvbmZpZy5tYXhEZXB0aCxcblx0XHRcdC8vIFRoaXMgaXMgdGhlIGxpc3Qgb2YgcGFyc2VycywgdG8gbW9kaWZ5IHRoZW0sIHVzZSBkdW1wLnNldFBhcnNlclxuXHRcdFx0cGFyc2Vyczoge1xuXHRcdFx0XHR3aW5kb3c6ICdbV2luZG93XScsXG5cdFx0XHRcdGRvY3VtZW50OiAnW0RvY3VtZW50XScsXG5cdFx0XHRcdGVycm9yOiBmdW5jdGlvbiBlcnJvcihfZXJyb3IpIHtcblx0XHRcdFx0XHRyZXR1cm4gJ0Vycm9yKFwiJyArIF9lcnJvci5tZXNzYWdlICsgJ1wiKSc7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdC8vIFRoaXMgaGFzIGJlZW4gdW51c2VkIHNpbmNlIFFVbml0IDEuMC4wLlxuXHRcdFx0XHQvLyBAdG9kbyBEZXByZWNhdGUgYW5kIHJlbW92ZS5cblx0XHRcdFx0dW5rbm93bjogJ1tVbmtub3duXScsXG5cdFx0XHRcdG51bGw6ICdudWxsJyxcblx0XHRcdFx0dW5kZWZpbmVkOiAndW5kZWZpbmVkJyxcblx0XHRcdFx0ZnVuY3Rpb246IGZ1bmN0aW9uIF9mdW5jdGlvbihmbikge1xuXHRcdFx0XHRcdHZhciByZXQgPSAnZnVuY3Rpb24nO1xuXG5cdFx0XHRcdFx0Ly8gRnVuY3Rpb25zIG5ldmVyIGhhdmUgbmFtZSBpbiBJRVxuXHRcdFx0XHRcdHZhciBuYW1lID0gJ25hbWUnIGluIGZuID8gZm4ubmFtZSA6IChyZU5hbWUuZXhlYyhmbikgfHwgW10pWzFdO1xuXHRcdFx0XHRcdGlmIChuYW1lKSB7XG5cdFx0XHRcdFx0XHRyZXQgKz0gJyAnICsgbmFtZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0ICs9ICcoJztcblx0XHRcdFx0XHRyZXQgPSBbcmV0LCBkdW1wLnBhcnNlKGZuLCAnZnVuY3Rpb25BcmdzJyksICcpeyddLmpvaW4oJycpO1xuXHRcdFx0XHRcdHJldHVybiBqb2luKHJldCwgZHVtcC5wYXJzZShmbiwgJ2Z1bmN0aW9uQ29kZScpLCAnfScpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRhcnJheTogYXJyYXksXG5cdFx0XHRcdG5vZGVsaXN0OiBhcnJheSxcblx0XHRcdFx0YXJndW1lbnRzOiBhcnJheSxcblx0XHRcdFx0b2JqZWN0OiBmdW5jdGlvbiBvYmplY3QobWFwLCBzdGFjaykge1xuXHRcdFx0XHRcdHZhciByZXQgPSBbXTtcblx0XHRcdFx0XHRpZiAoZHVtcC5tYXhEZXB0aCAmJiBkdW1wLmRlcHRoID4gZHVtcC5tYXhEZXB0aCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuICdbb2JqZWN0IE9iamVjdF0nO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkdW1wLnVwKCk7XG5cdFx0XHRcdFx0dmFyIGtleXMgPSBbXTtcblx0XHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gbWFwKSB7XG5cdFx0XHRcdFx0XHRrZXlzLnB1c2goa2V5KTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBTb21lIHByb3BlcnRpZXMgYXJlIG5vdCBhbHdheXMgZW51bWVyYWJsZSBvbiBFcnJvciBvYmplY3RzLlxuXHRcdFx0XHRcdHZhciBub25FbnVtZXJhYmxlUHJvcGVydGllcyA9IFsnbWVzc2FnZScsICduYW1lJ107XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSBpbiBub25FbnVtZXJhYmxlUHJvcGVydGllcykge1xuXHRcdFx0XHRcdFx0dmFyIF9rZXkgPSBub25FbnVtZXJhYmxlUHJvcGVydGllc1tpXTtcblx0XHRcdFx0XHRcdGlmIChfa2V5IGluIG1hcCAmJiAhaW5BcnJheShfa2V5LCBrZXlzKSkge1xuXHRcdFx0XHRcdFx0XHRrZXlzLnB1c2goX2tleSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGtleXMuc29ydCgpO1xuXHRcdFx0XHRcdGZvciAodmFyIF9pID0gMDsgX2kgPCBrZXlzLmxlbmd0aDsgX2krKykge1xuXHRcdFx0XHRcdFx0dmFyIF9rZXkyID0ga2V5c1tfaV07XG5cdFx0XHRcdFx0XHR2YXIgdmFsID0gbWFwW19rZXkyXTtcblx0XHRcdFx0XHRcdHJldC5wdXNoKGR1bXAucGFyc2UoX2tleTIsICdrZXknKSArICc6ICcgKyBkdW1wLnBhcnNlKHZhbCwgdW5kZWZpbmVkLCBzdGFjaykpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkdW1wLmRvd24oKTtcblx0XHRcdFx0XHRyZXR1cm4gam9pbigneycsIHJldCwgJ30nKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0bm9kZTogZnVuY3Rpb24gbm9kZShfbm9kZSkge1xuXHRcdFx0XHRcdHZhciBvcGVuID0gZHVtcC5IVE1MID8gJyZsdDsnIDogJzwnO1xuXHRcdFx0XHRcdHZhciBjbG9zZSA9IGR1bXAuSFRNTCA/ICcmZ3Q7JyA6ICc+Jztcblx0XHRcdFx0XHR2YXIgdGFnID0gX25vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0XHR2YXIgcmV0ID0gb3BlbiArIHRhZztcblx0XHRcdFx0XHR2YXIgYXR0cnMgPSBfbm9kZS5hdHRyaWJ1dGVzO1xuXHRcdFx0XHRcdGlmIChhdHRycykge1xuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhdHRycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHR2YXIgdmFsID0gYXR0cnNbaV0ubm9kZVZhbHVlO1xuXG5cdFx0XHRcdFx0XHRcdC8vIElFNiBpbmNsdWRlcyBhbGwgYXR0cmlidXRlcyBpbiAuYXR0cmlidXRlcywgZXZlbiBvbmVzIG5vdCBleHBsaWNpdGx5XG5cdFx0XHRcdFx0XHRcdC8vIHNldC4gVGhvc2UgaGF2ZSB2YWx1ZXMgbGlrZSB1bmRlZmluZWQsIG51bGwsIDAsIGZhbHNlLCBcIlwiIG9yXG5cdFx0XHRcdFx0XHRcdC8vIFwiaW5oZXJpdFwiLlxuXHRcdFx0XHRcdFx0XHRpZiAodmFsICYmIHZhbCAhPT0gJ2luaGVyaXQnKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0ICs9ICcgJyArIGF0dHJzW2ldLm5vZGVOYW1lICsgJz0nICsgZHVtcC5wYXJzZSh2YWwsICdhdHRyaWJ1dGUnKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXQgKz0gY2xvc2U7XG5cblx0XHRcdFx0XHQvLyBTaG93IGNvbnRlbnQgb2YgVGV4dE5vZGUgb3IgQ0RBVEFTZWN0aW9uXG5cdFx0XHRcdFx0aWYgKF9ub2RlLm5vZGVUeXBlID09PSAzIHx8IF9ub2RlLm5vZGVUeXBlID09PSA0KSB7XG5cdFx0XHRcdFx0XHRyZXQgKz0gX25vZGUubm9kZVZhbHVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gcmV0ICsgb3BlbiArICcvJyArIHRhZyArIGNsb3NlO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHQvLyBGdW5jdGlvbiBjYWxscyBpdCBpbnRlcm5hbGx5LCBpdCdzIHRoZSBhcmd1bWVudHMgcGFydCBvZiB0aGUgZnVuY3Rpb25cblx0XHRcdFx0ZnVuY3Rpb25BcmdzOiBmdW5jdGlvbiBmdW5jdGlvbkFyZ3MoZm4pIHtcblx0XHRcdFx0XHR2YXIgbCA9IGZuLmxlbmd0aDtcblx0XHRcdFx0XHRpZiAoIWwpIHtcblx0XHRcdFx0XHRcdHJldHVybiAnJztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dmFyIGFyZ3MgPSBuZXcgQXJyYXkobCk7XG5cdFx0XHRcdFx0d2hpbGUgKGwtLSkge1xuXHRcdFx0XHRcdFx0Ly8gOTcgaXMgJ2EnXG5cdFx0XHRcdFx0XHRhcmdzW2xdID0gU3RyaW5nLmZyb21DaGFyQ29kZSg5NyArIGwpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gJyAnICsgYXJncy5qb2luKCcsICcpICsgJyAnO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHQvLyBPYmplY3QgY2FsbHMgaXQgaW50ZXJuYWxseSwgdGhlIGtleSBwYXJ0IG9mIGFuIGl0ZW0gaW4gYSBtYXBcblx0XHRcdFx0a2V5OiBxdW90ZSxcblx0XHRcdFx0Ly8gRnVuY3Rpb24gY2FsbHMgaXQgaW50ZXJuYWxseSwgaXQncyB0aGUgY29udGVudCBvZiB0aGUgZnVuY3Rpb25cblx0XHRcdFx0ZnVuY3Rpb25Db2RlOiAnW2NvZGVdJyxcblx0XHRcdFx0Ly8gTm9kZSBjYWxscyBpdCBpbnRlcm5hbGx5LCBpdCdzIGEgaHRtbCBhdHRyaWJ1dGUgdmFsdWVcblx0XHRcdFx0YXR0cmlidXRlOiBxdW90ZSxcblx0XHRcdFx0c3RyaW5nOiBxdW90ZSxcblx0XHRcdFx0ZGF0ZTogcXVvdGUsXG5cdFx0XHRcdHJlZ2V4cDogbGl0ZXJhbCxcblx0XHRcdFx0bnVtYmVyOiBsaXRlcmFsLFxuXHRcdFx0XHRib29sZWFuOiBsaXRlcmFsLFxuXHRcdFx0XHRzeW1ib2w6IGZ1bmN0aW9uIHN5bWJvbChzeW0pIHtcblx0XHRcdFx0XHRyZXR1cm4gc3ltLnRvU3RyaW5nKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHQvLyBJZiB0cnVlLCBlbnRpdGllcyBhcmUgZXNjYXBlZCAoIDwsID4sIFxcdCwgc3BhY2UgYW5kIFxcbiApXG5cdFx0XHRIVE1MOiBmYWxzZSxcblx0XHRcdC8vIEluZGVudGF0aW9uIHVuaXRcblx0XHRcdGluZGVudENoYXI6ICcgICcsXG5cdFx0XHQvLyBJZiB0cnVlLCBpdGVtcyBpbiBhIGNvbGxlY3Rpb24sIGFyZSBzZXBhcmF0ZWQgYnkgYSBcXG4sIGVsc2UganVzdCBhIHNwYWNlLlxuXHRcdFx0bXVsdGlsaW5lOiB0cnVlXG5cdFx0fTtcblx0XHRyZXR1cm4gZHVtcDtcblx0fSkoKTtcblxuXHQvLyBTdXBwb3J0OiBJRSA5XG5cdC8vIERldGVjdCBpZiB0aGUgY29uc29sZSBvYmplY3QgZXhpc3RzIGFuZCBuby1vcCBvdGhlcndpc2UuXG5cdC8vIFRoaXMgYWxsb3dzIHN1cHBvcnQgZm9yIElFIDksIHdoaWNoIGRvZXNuJ3QgaGF2ZSBhIGNvbnNvbGVcblx0Ly8gb2JqZWN0IGlmIHRoZSBkZXZlbG9wZXIgdG9vbHMgYXJlIG5vdCBvcGVuLlxuXG5cdC8vIFN1cHBvcnQ6IElFIDlcblx0Ly8gRnVuY3Rpb24jYmluZCBpcyBzdXBwb3J0ZWQsIGJ1dCBubyBjb25zb2xlLmxvZy5iaW5kKCkuXG5cblx0Ly8gU3VwcG9ydDogU3BpZGVyTW9ua2V5IChtb3pqcyA2OCspXG5cdC8vIFRoZSBjb25zb2xlIG9iamVjdCBoYXMgYSBsb2cgbWV0aG9kLCBidXQgbm8gd2FybiBtZXRob2QuXG5cblx0dmFyIExvZ2dlciA9IHtcblx0XHR3YXJuOiBjb25zb2xlJDEgPyBGdW5jdGlvbi5wcm90b3R5cGUuYmluZC5jYWxsKGNvbnNvbGUkMS53YXJuIHx8IGNvbnNvbGUkMS5sb2csIGNvbnNvbGUkMSkgOiBmdW5jdGlvbiAoKSB7fVxuXHR9O1xuXG5cdHZhciBTdWl0ZVJlcG9ydCA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoKSB7XG5cdFx0ZnVuY3Rpb24gU3VpdGVSZXBvcnQobmFtZSwgcGFyZW50U3VpdGUpIHtcblx0XHRcdF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTdWl0ZVJlcG9ydCk7XG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lO1xuXHRcdFx0dGhpcy5mdWxsTmFtZSA9IHBhcmVudFN1aXRlID8gcGFyZW50U3VpdGUuZnVsbE5hbWUuY29uY2F0KG5hbWUpIDogW107XG5cblx0XHRcdC8vIFdoZW4gYW4gXCJlcnJvclwiIGV2ZW50IGlzIGVtaXR0ZWQgZnJvbSBvblVuY2F1Z2h0RXhjZXB0aW9uKCksIHRoZVxuXHRcdFx0Ly8gXCJydW5FbmRcIiBldmVudCBzaG91bGQgcmVwb3J0IHRoZSBzdGF0dXMgYXMgZmFpbGVkLiBUaGUgXCJydW5FbmRcIiBldmVudCBkYXRhXG5cdFx0XHQvLyBpcyB0cmFja2VkIHRocm91Z2ggdGhpcyBwcm9wZXJ0eSAodmlhIHRoZSBcInJ1blN1aXRlXCIgaW5zdGFuY2UpLlxuXHRcdFx0dGhpcy5nbG9iYWxGYWlsdXJlQ291bnQgPSAwO1xuXHRcdFx0dGhpcy50ZXN0cyA9IFtdO1xuXHRcdFx0dGhpcy5jaGlsZFN1aXRlcyA9IFtdO1xuXHRcdFx0aWYgKHBhcmVudFN1aXRlKSB7XG5cdFx0XHRcdHBhcmVudFN1aXRlLnB1c2hDaGlsZFN1aXRlKHRoaXMpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRfY3JlYXRlQ2xhc3MoU3VpdGVSZXBvcnQsIFt7XG5cdFx0XHRrZXk6IFwic3RhcnRcIixcblx0XHRcdHZhbHVlOiBmdW5jdGlvbiBzdGFydChyZWNvcmRUaW1lKSB7XG5cdFx0XHRcdGlmIChyZWNvcmRUaW1lKSB7XG5cdFx0XHRcdFx0dGhpcy5fc3RhcnRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRuYW1lOiB0aGlzLm5hbWUsXG5cdFx0XHRcdFx0ZnVsbE5hbWU6IHRoaXMuZnVsbE5hbWUuc2xpY2UoKSxcblx0XHRcdFx0XHR0ZXN0czogdGhpcy50ZXN0cy5tYXAoZnVuY3Rpb24gKHRlc3QpIHtcblx0XHRcdFx0XHRcdHJldHVybiB0ZXN0LnN0YXJ0KCk7XG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0Y2hpbGRTdWl0ZXM6IHRoaXMuY2hpbGRTdWl0ZXMubWFwKGZ1bmN0aW9uIChzdWl0ZSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHN1aXRlLnN0YXJ0KCk7XG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0dGVzdENvdW50czoge1xuXHRcdFx0XHRcdFx0dG90YWw6IHRoaXMuZ2V0VGVzdENvdW50cygpLnRvdGFsXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdGtleTogXCJlbmRcIixcblx0XHRcdHZhbHVlOiBmdW5jdGlvbiBlbmQocmVjb3JkVGltZSkge1xuXHRcdFx0XHRpZiAocmVjb3JkVGltZSkge1xuXHRcdFx0XHRcdHRoaXMuX2VuZFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdG5hbWU6IHRoaXMubmFtZSxcblx0XHRcdFx0XHRmdWxsTmFtZTogdGhpcy5mdWxsTmFtZS5zbGljZSgpLFxuXHRcdFx0XHRcdHRlc3RzOiB0aGlzLnRlc3RzLm1hcChmdW5jdGlvbiAodGVzdCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRlc3QuZW5kKCk7XG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0Y2hpbGRTdWl0ZXM6IHRoaXMuY2hpbGRTdWl0ZXMubWFwKGZ1bmN0aW9uIChzdWl0ZSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHN1aXRlLmVuZCgpO1xuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdHRlc3RDb3VudHM6IHRoaXMuZ2V0VGVzdENvdW50cygpLFxuXHRcdFx0XHRcdHJ1bnRpbWU6IHRoaXMuZ2V0UnVudGltZSgpLFxuXHRcdFx0XHRcdHN0YXR1czogdGhpcy5nZXRTdGF0dXMoKVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdGtleTogXCJwdXNoQ2hpbGRTdWl0ZVwiLFxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIHB1c2hDaGlsZFN1aXRlKHN1aXRlKSB7XG5cdFx0XHRcdHRoaXMuY2hpbGRTdWl0ZXMucHVzaChzdWl0ZSk7XG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0a2V5OiBcInB1c2hUZXN0XCIsXG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24gcHVzaFRlc3QodGVzdCkge1xuXHRcdFx0XHR0aGlzLnRlc3RzLnB1c2godGVzdCk7XG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0a2V5OiBcImdldFJ1bnRpbWVcIixcblx0XHRcdHZhbHVlOiBmdW5jdGlvbiBnZXRSdW50aW1lKCkge1xuXHRcdFx0XHRyZXR1cm4gTWF0aC5yb3VuZCh0aGlzLl9lbmRUaW1lIC0gdGhpcy5fc3RhcnRUaW1lKTtcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRrZXk6IFwiZ2V0VGVzdENvdW50c1wiLFxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIGdldFRlc3RDb3VudHMoKSB7XG5cdFx0XHRcdHZhciBjb3VudHMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHtcblx0XHRcdFx0XHRwYXNzZWQ6IDAsXG5cdFx0XHRcdFx0ZmFpbGVkOiAwLFxuXHRcdFx0XHRcdHNraXBwZWQ6IDAsXG5cdFx0XHRcdFx0dG9kbzogMCxcblx0XHRcdFx0XHR0b3RhbDogMFxuXHRcdFx0XHR9O1xuXHRcdFx0XHRjb3VudHMuZmFpbGVkICs9IHRoaXMuZ2xvYmFsRmFpbHVyZUNvdW50O1xuXHRcdFx0XHRjb3VudHMudG90YWwgKz0gdGhpcy5nbG9iYWxGYWlsdXJlQ291bnQ7XG5cdFx0XHRcdGNvdW50cyA9IHRoaXMudGVzdHMucmVkdWNlKGZ1bmN0aW9uIChjb3VudHMsIHRlc3QpIHtcblx0XHRcdFx0XHRpZiAodGVzdC52YWxpZCkge1xuXHRcdFx0XHRcdFx0Y291bnRzW3Rlc3QuZ2V0U3RhdHVzKCldKys7XG5cdFx0XHRcdFx0XHRjb3VudHMudG90YWwrKztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIGNvdW50cztcblx0XHRcdFx0fSwgY291bnRzKTtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY2hpbGRTdWl0ZXMucmVkdWNlKGZ1bmN0aW9uIChjb3VudHMsIHN1aXRlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHN1aXRlLmdldFRlc3RDb3VudHMoY291bnRzKTtcblx0XHRcdFx0fSwgY291bnRzKTtcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRrZXk6IFwiZ2V0U3RhdHVzXCIsXG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24gZ2V0U3RhdHVzKCkge1xuXHRcdFx0XHR2YXIgX3RoaXMkZ2V0VGVzdENvdW50cyA9IHRoaXMuZ2V0VGVzdENvdW50cygpLFxuXHRcdFx0XHRcdHRvdGFsID0gX3RoaXMkZ2V0VGVzdENvdW50cy50b3RhbCxcblx0XHRcdFx0XHRmYWlsZWQgPSBfdGhpcyRnZXRUZXN0Q291bnRzLmZhaWxlZCxcblx0XHRcdFx0XHRza2lwcGVkID0gX3RoaXMkZ2V0VGVzdENvdW50cy5za2lwcGVkLFxuXHRcdFx0XHRcdHRvZG8gPSBfdGhpcyRnZXRUZXN0Q291bnRzLnRvZG87XG5cdFx0XHRcdGlmIChmYWlsZWQpIHtcblx0XHRcdFx0XHRyZXR1cm4gJ2ZhaWxlZCc7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aWYgKHNraXBwZWQgPT09IHRvdGFsKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gJ3NraXBwZWQnO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAodG9kbyA9PT0gdG90YWwpIHtcblx0XHRcdFx0XHRcdHJldHVybiAndG9kbyc7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJldHVybiAncGFzc2VkJztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XSk7XG5cdFx0cmV0dXJuIFN1aXRlUmVwb3J0O1xuXHR9KCk7XG5cblx0dmFyIG1vZHVsZVN0YWNrID0gW107XG5cdHZhciBydW5TdWl0ZSA9IG5ldyBTdWl0ZVJlcG9ydCgpO1xuXHRmdW5jdGlvbiBpc1BhcmVudE1vZHVsZUluUXVldWUoKSB7XG5cdFx0dmFyIG1vZHVsZXNJblF1ZXVlID0gY29uZmlnLm1vZHVsZXMuZmlsdGVyKGZ1bmN0aW9uIChtb2R1bGUpIHtcblx0XHRcdHJldHVybiAhbW9kdWxlLmlnbm9yZWQ7XG5cdFx0fSkubWFwKGZ1bmN0aW9uIChtb2R1bGUpIHtcblx0XHRcdHJldHVybiBtb2R1bGUubW9kdWxlSWQ7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIG1vZHVsZVN0YWNrLnNvbWUoZnVuY3Rpb24gKG1vZHVsZSkge1xuXHRcdFx0cmV0dXJuIG1vZHVsZXNJblF1ZXVlLmluY2x1ZGVzKG1vZHVsZS5tb2R1bGVJZCk7XG5cdFx0fSk7XG5cdH1cblx0ZnVuY3Rpb24gY3JlYXRlTW9kdWxlKG5hbWUsIHRlc3RFbnZpcm9ubWVudCwgbW9kaWZpZXJzKSB7XG5cdFx0dmFyIHBhcmVudE1vZHVsZSA9IG1vZHVsZVN0YWNrLmxlbmd0aCA/IG1vZHVsZVN0YWNrLnNsaWNlKC0xKVswXSA6IG51bGw7XG5cdFx0dmFyIG1vZHVsZU5hbWUgPSBwYXJlbnRNb2R1bGUgIT09IG51bGwgPyBbcGFyZW50TW9kdWxlLm5hbWUsIG5hbWVdLmpvaW4oJyA+ICcpIDogbmFtZTtcblx0XHR2YXIgcGFyZW50U3VpdGUgPSBwYXJlbnRNb2R1bGUgPyBwYXJlbnRNb2R1bGUuc3VpdGVSZXBvcnQgOiBydW5TdWl0ZTtcblx0XHR2YXIgc2tpcCA9IHBhcmVudE1vZHVsZSAhPT0gbnVsbCAmJiBwYXJlbnRNb2R1bGUuc2tpcCB8fCBtb2RpZmllcnMuc2tpcDtcblx0XHR2YXIgdG9kbyA9IHBhcmVudE1vZHVsZSAhPT0gbnVsbCAmJiBwYXJlbnRNb2R1bGUudG9kbyB8fCBtb2RpZmllcnMudG9kbztcblx0XHR2YXIgZW52ID0ge307XG5cdFx0aWYgKHBhcmVudE1vZHVsZSkge1xuXHRcdFx0ZXh0ZW5kKGVudiwgcGFyZW50TW9kdWxlLnRlc3RFbnZpcm9ubWVudCk7XG5cdFx0fVxuXHRcdGV4dGVuZChlbnYsIHRlc3RFbnZpcm9ubWVudCk7XG5cdFx0dmFyIG1vZHVsZSA9IHtcblx0XHRcdG5hbWU6IG1vZHVsZU5hbWUsXG5cdFx0XHRwYXJlbnRNb2R1bGU6IHBhcmVudE1vZHVsZSxcblx0XHRcdGhvb2tzOiB7XG5cdFx0XHRcdGJlZm9yZTogW10sXG5cdFx0XHRcdGJlZm9yZUVhY2g6IFtdLFxuXHRcdFx0XHRhZnRlckVhY2g6IFtdLFxuXHRcdFx0XHRhZnRlcjogW11cblx0XHRcdH0sXG5cdFx0XHR0ZXN0RW52aXJvbm1lbnQ6IGVudixcblx0XHRcdHRlc3RzOiBbXSxcblx0XHRcdG1vZHVsZUlkOiBnZW5lcmF0ZUhhc2gobW9kdWxlTmFtZSksXG5cdFx0XHR0ZXN0c1J1bjogMCxcblx0XHRcdHRlc3RzSWdub3JlZDogMCxcblx0XHRcdGNoaWxkTW9kdWxlczogW10sXG5cdFx0XHRzdWl0ZVJlcG9ydDogbmV3IFN1aXRlUmVwb3J0KG5hbWUsIHBhcmVudFN1aXRlKSxcblx0XHRcdC8vIEluaXRpYWxpc2VkIGJ5IHRlc3QuanMgd2hlbiB0aGUgbW9kdWxlIHN0YXJ0IGV4ZWN1dGluZyxcblx0XHRcdC8vIGkuZS4gYmVmb3JlIHRoZSBmaXJzdCB0ZXN0IGluIHRoaXMgbW9kdWxlIChvciBhIGNoaWxkKS5cblx0XHRcdHN0YXRzOiBudWxsLFxuXHRcdFx0Ly8gUGFzcyBhbG9uZyBgc2tpcGAgYW5kIGB0b2RvYCBwcm9wZXJ0aWVzIGZyb20gcGFyZW50IG1vZHVsZSwgaW4gY2FzZVxuXHRcdFx0Ly8gdGhlcmUgaXMgb25lLCB0byBjaGlsZHMuIEFuZCB1c2Ugb3duIG90aGVyd2lzZS5cblx0XHRcdC8vIFRoaXMgcHJvcGVydHkgd2lsbCBiZSB1c2VkIHRvIG1hcmsgb3duIHRlc3RzIGFuZCB0ZXN0cyBvZiBjaGlsZCBzdWl0ZXNcblx0XHRcdC8vIGFzIGVpdGhlciBgc2tpcHBlZGAgb3IgYHRvZG9gLlxuXHRcdFx0c2tpcDogc2tpcCxcblx0XHRcdHRvZG86IHNraXAgPyBmYWxzZSA6IHRvZG8sXG5cdFx0XHRpZ25vcmVkOiBtb2RpZmllcnMuaWdub3JlZCB8fCBmYWxzZVxuXHRcdH07XG5cdFx0aWYgKHBhcmVudE1vZHVsZSkge1xuXHRcdFx0cGFyZW50TW9kdWxlLmNoaWxkTW9kdWxlcy5wdXNoKG1vZHVsZSk7XG5cdFx0fVxuXHRcdGNvbmZpZy5tb2R1bGVzLnB1c2gobW9kdWxlKTtcblx0XHRyZXR1cm4gbW9kdWxlO1xuXHR9XG5cdGZ1bmN0aW9uIHNldEhvb2tGcm9tRW52aXJvbm1lbnQoaG9va3MsIGVudmlyb25tZW50LCBuYW1lKSB7XG5cdFx0dmFyIHBvdGVudGlhbEhvb2sgPSBlbnZpcm9ubWVudFtuYW1lXTtcblx0XHRpZiAodHlwZW9mIHBvdGVudGlhbEhvb2sgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdGhvb2tzW25hbWVdLnB1c2gocG90ZW50aWFsSG9vayk7XG5cdFx0fVxuXHRcdGRlbGV0ZSBlbnZpcm9ubWVudFtuYW1lXTtcblx0fVxuXHRmdW5jdGlvbiBtYWtlU2V0SG9vayhtb2R1bGUsIGhvb2tOYW1lKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uIHNldEhvb2soY2FsbGJhY2spIHtcblx0XHRcdGlmIChjb25maWcuY3VycmVudE1vZHVsZSAhPT0gbW9kdWxlKSB7XG5cdFx0XHRcdExvZ2dlci53YXJuKCdUaGUgYCcgKyBob29rTmFtZSArICdgIGhvb2sgd2FzIGNhbGxlZCBpbnNpZGUgdGhlIHdyb25nIG1vZHVsZSAoYCcgKyBjb25maWcuY3VycmVudE1vZHVsZS5uYW1lICsgJ2ApLiAnICsgJ0luc3RlYWQsIHVzZSBob29rcyBwcm92aWRlZCBieSB0aGUgY2FsbGJhY2sgdG8gdGhlIGNvbnRhaW5pbmcgbW9kdWxlIChgJyArIG1vZHVsZS5uYW1lICsgJ2ApLiAnICsgJ1RoaXMgd2lsbCBiZWNvbWUgYW4gZXJyb3IgaW4gUVVuaXQgMy4wLicpO1xuXHRcdFx0fVxuXHRcdFx0bW9kdWxlLmhvb2tzW2hvb2tOYW1lXS5wdXNoKGNhbGxiYWNrKTtcblx0XHR9O1xuXHR9XG5cdGZ1bmN0aW9uIHByb2Nlc3NNb2R1bGUobmFtZSwgb3B0aW9ucywgZXhlY3V0ZU5vdykge1xuXHRcdHZhciBtb2RpZmllcnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IHt9O1xuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0ZXhlY3V0ZU5vdyA9IG9wdGlvbnM7XG5cdFx0XHRvcHRpb25zID0gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHR2YXIgbW9kdWxlID0gY3JlYXRlTW9kdWxlKG5hbWUsIG9wdGlvbnMsIG1vZGlmaWVycyk7XG5cblx0XHQvLyBUcmFuc2ZlciBhbnkgaW5pdGlhbCBob29rcyBmcm9tIHRoZSBvcHRpb25zIG9iamVjdCB0byB0aGUgJ2hvb2tzJyBvYmplY3Rcblx0XHR2YXIgdGVzdEVudmlyb25tZW50ID0gbW9kdWxlLnRlc3RFbnZpcm9ubWVudDtcblx0XHR2YXIgaG9va3MgPSBtb2R1bGUuaG9va3M7XG5cdFx0c2V0SG9va0Zyb21FbnZpcm9ubWVudChob29rcywgdGVzdEVudmlyb25tZW50LCAnYmVmb3JlJyk7XG5cdFx0c2V0SG9va0Zyb21FbnZpcm9ubWVudChob29rcywgdGVzdEVudmlyb25tZW50LCAnYmVmb3JlRWFjaCcpO1xuXHRcdHNldEhvb2tGcm9tRW52aXJvbm1lbnQoaG9va3MsIHRlc3RFbnZpcm9ubWVudCwgJ2FmdGVyRWFjaCcpO1xuXHRcdHNldEhvb2tGcm9tRW52aXJvbm1lbnQoaG9va3MsIHRlc3RFbnZpcm9ubWVudCwgJ2FmdGVyJyk7XG5cdFx0dmFyIG1vZHVsZUZucyA9IHtcblx0XHRcdGJlZm9yZTogbWFrZVNldEhvb2sobW9kdWxlLCAnYmVmb3JlJyksXG5cdFx0XHRiZWZvcmVFYWNoOiBtYWtlU2V0SG9vayhtb2R1bGUsICdiZWZvcmVFYWNoJyksXG5cdFx0XHRhZnRlckVhY2g6IG1ha2VTZXRIb29rKG1vZHVsZSwgJ2FmdGVyRWFjaCcpLFxuXHRcdFx0YWZ0ZXI6IG1ha2VTZXRIb29rKG1vZHVsZSwgJ2FmdGVyJylcblx0XHR9O1xuXHRcdHZhciBwcmV2TW9kdWxlID0gY29uZmlnLmN1cnJlbnRNb2R1bGU7XG5cdFx0Y29uZmlnLmN1cnJlbnRNb2R1bGUgPSBtb2R1bGU7XG5cdFx0aWYgKHR5cGVvZiBleGVjdXRlTm93ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRtb2R1bGVTdGFjay5wdXNoKG1vZHVsZSk7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHR2YXIgY2JSZXR1cm5WYWx1ZSA9IGV4ZWN1dGVOb3cuY2FsbChtb2R1bGUudGVzdEVudmlyb25tZW50LCBtb2R1bGVGbnMpO1xuXHRcdFx0XHRpZiAoY2JSZXR1cm5WYWx1ZSAmJiB0eXBlb2YgY2JSZXR1cm5WYWx1ZS50aGVuID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0TG9nZ2VyLndhcm4oJ1JldHVybmluZyBhIHByb21pc2UgZnJvbSBhIG1vZHVsZSBjYWxsYmFjayBpcyBub3Qgc3VwcG9ydGVkLiAnICsgJ0luc3RlYWQsIHVzZSBob29rcyBmb3IgYXN5bmMgYmVoYXZpb3IuICcgKyAnVGhpcyB3aWxsIGJlY29tZSBhbiBlcnJvciBpbiBRVW5pdCAzLjAuJyk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZmluYWxseSB7XG5cdFx0XHRcdC8vIElmIHRoZSBtb2R1bGUgY2xvc3VyZSB0aHJldyBhbiB1bmNhdWdodCBlcnJvciBkdXJpbmcgdGhlIGxvYWQgcGhhc2UsXG5cdFx0XHRcdC8vIHdlIGxldCB0aGlzIGJ1YmJsZSB1cCB0byBnbG9iYWwgZXJyb3IgaGFuZGxlcnMuIEJ1dCwgbm90IHVudGlsIGFmdGVyXG5cdFx0XHRcdC8vIHdlIHRlYXJkb3duIGludGVybmFsIHN0YXRlIHRvIGVuc3VyZSBjb3JyZWN0IG1vZHVsZSBuZXN0aW5nLlxuXHRcdFx0XHQvLyBSZWYgaHR0cHM6Ly9naXRodWIuY29tL3F1bml0anMvcXVuaXQvaXNzdWVzLzE0NzguXG5cdFx0XHRcdG1vZHVsZVN0YWNrLnBvcCgpO1xuXHRcdFx0XHRjb25maWcuY3VycmVudE1vZHVsZSA9IG1vZHVsZS5wYXJlbnRNb2R1bGUgfHwgcHJldk1vZHVsZTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0dmFyIGZvY3VzZWQkMSA9IGZhbHNlOyAvLyBpbmRpY2F0ZXMgdGhhdCB0aGUgXCJvbmx5XCIgZmlsdGVyIHdhcyB1c2VkXG5cblx0ZnVuY3Rpb24gbW9kdWxlJDEobmFtZSwgb3B0aW9ucywgZXhlY3V0ZU5vdykge1xuXHRcdHZhciBpZ25vcmVkID0gZm9jdXNlZCQxICYmICFpc1BhcmVudE1vZHVsZUluUXVldWUoKTtcblx0XHRwcm9jZXNzTW9kdWxlKG5hbWUsIG9wdGlvbnMsIGV4ZWN1dGVOb3csIHtcblx0XHRcdGlnbm9yZWQ6IGlnbm9yZWRcblx0XHR9KTtcblx0fVxuXHRtb2R1bGUkMS5vbmx5ID0gZnVuY3Rpb24gKCkge1xuXHRcdGlmICghZm9jdXNlZCQxKSB7XG5cdFx0XHQvLyBVcG9uIHRoZSBmaXJzdCBtb2R1bGUub25seSgpIGNhbGwsXG5cdFx0XHQvLyBkZWxldGUgYW55IGFuZCBhbGwgcHJldmlvdXNseSByZWdpc3RlcmVkIG1vZHVsZXMgYW5kIHRlc3RzLlxuXHRcdFx0Y29uZmlnLm1vZHVsZXMubGVuZ3RoID0gMDtcblx0XHRcdGNvbmZpZy5xdWV1ZS5sZW5ndGggPSAwO1xuXG5cdFx0XHQvLyBJZ25vcmUgYW55IHRlc3RzIGRlY2xhcmVkIGFmdGVyIHRoaXMgYmxvY2sgd2l0aGluIHRoZSBzYW1lXG5cdFx0XHQvLyBtb2R1bGUgcGFyZW50LiBodHRwczovL2dpdGh1Yi5jb20vcXVuaXRqcy9xdW5pdC9pc3N1ZXMvMTY0NVxuXHRcdFx0Y29uZmlnLmN1cnJlbnRNb2R1bGUuaWdub3JlZCA9IHRydWU7XG5cdFx0fVxuXHRcdGZvY3VzZWQkMSA9IHRydWU7XG5cdFx0cHJvY2Vzc01vZHVsZS5hcHBseSh2b2lkIDAsIGFyZ3VtZW50cyk7XG5cdH07XG5cdG1vZHVsZSQxLnNraXAgPSBmdW5jdGlvbiAobmFtZSwgb3B0aW9ucywgZXhlY3V0ZU5vdykge1xuXHRcdGlmIChmb2N1c2VkJDEpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0cHJvY2Vzc01vZHVsZShuYW1lLCBvcHRpb25zLCBleGVjdXRlTm93LCB7XG5cdFx0XHRza2lwOiB0cnVlXG5cdFx0fSk7XG5cdH07XG5cdG1vZHVsZSQxLnRvZG8gPSBmdW5jdGlvbiAobmFtZSwgb3B0aW9ucywgZXhlY3V0ZU5vdykge1xuXHRcdGlmIChmb2N1c2VkJDEpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0cHJvY2Vzc01vZHVsZShuYW1lLCBvcHRpb25zLCBleGVjdXRlTm93LCB7XG5cdFx0XHR0b2RvOiB0cnVlXG5cdFx0fSk7XG5cdH07XG5cblx0Ly8gRG9lc24ndCBzdXBwb3J0IElFOSwgaXQgd2lsbCByZXR1cm4gdW5kZWZpbmVkIG9uIHRoZXNlIGJyb3dzZXJzXG5cdC8vIFNlZSBhbHNvIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Vycm9yL1N0YWNrXG5cdHZhciBmaWxlTmFtZSA9IChzb3VyY2VGcm9tU3RhY2t0cmFjZSgwKSB8fCAnJykucmVwbGFjZSgvKDpcXGQrKStcXCk/LywgJycpXG5cdFx0Ly8gUmVtb3ZlIGFueXRoaW5nIHByaW9yIHRvIHRoZSBsYXN0IHNsYXNoIChVbml4L1dpbmRvd3MpXG5cdFx0Ly8gZnJvbSB0aGUgbGFzdCBmcmFtZVxuXHRcdC5yZXBsYWNlKC8uK1svXFxcXF0vLCAnJyk7XG5cdGZ1bmN0aW9uIGV4dHJhY3RTdGFja3RyYWNlKGUsIG9mZnNldCkge1xuXHRcdG9mZnNldCA9IG9mZnNldCA9PT0gdW5kZWZpbmVkID8gNCA6IG9mZnNldDtcblx0XHRpZiAoZSAmJiBlLnN0YWNrKSB7XG5cdFx0XHR2YXIgc3RhY2sgPSBlLnN0YWNrLnNwbGl0KCdcXG4nKTtcblx0XHRcdGlmICgvXmVycm9yJC9pLnRlc3Qoc3RhY2tbMF0pKSB7XG5cdFx0XHRcdHN0YWNrLnNoaWZ0KCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoZmlsZU5hbWUpIHtcblx0XHRcdFx0dmFyIGluY2x1ZGUgPSBbXTtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IG9mZnNldDsgaSA8IHN0YWNrLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0aWYgKHN0YWNrW2ldLmluZGV4T2YoZmlsZU5hbWUpICE9PSAtMSkge1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGluY2x1ZGUucHVzaChzdGFja1tpXSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGluY2x1ZGUubGVuZ3RoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGluY2x1ZGUuam9pbignXFxuJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBzdGFja1tvZmZzZXRdO1xuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiBzb3VyY2VGcm9tU3RhY2t0cmFjZShvZmZzZXQpIHtcblx0XHR2YXIgZXJyb3IgPSBuZXcgRXJyb3IoKTtcblxuXHRcdC8vIFN1cHBvcnQ6IFNhZmFyaSA8PTcgb25seSwgSUUgPD0xMCAtIDExIG9ubHlcblx0XHQvLyBOb3QgYWxsIGJyb3dzZXJzIGdlbmVyYXRlIHRoZSBgc3RhY2tgIHByb3BlcnR5IGZvciBgbmV3IEVycm9yKClgLCBzZWUgYWxzbyAjNjM2XG5cdFx0aWYgKCFlcnJvci5zdGFjaykge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0dGhyb3cgZXJyb3I7XG5cdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0ZXJyb3IgPSBlcnI7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBleHRyYWN0U3RhY2t0cmFjZShlcnJvciwgb2Zmc2V0KTtcblx0fVxuXG5cdHZhciBBc3NlcnQgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKCkge1xuXHRcdGZ1bmN0aW9uIEFzc2VydCh0ZXN0Q29udGV4dCkge1xuXHRcdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIEFzc2VydCk7XG5cdFx0XHR0aGlzLnRlc3QgPSB0ZXN0Q29udGV4dDtcblx0XHR9XG5cdFx0X2NyZWF0ZUNsYXNzKEFzc2VydCwgW3tcblx0XHRcdGtleTogXCJ0aW1lb3V0XCIsXG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24gdGltZW91dChkdXJhdGlvbikge1xuXHRcdFx0XHRpZiAodHlwZW9mIGR1cmF0aW9uICE9PSAnbnVtYmVyJykge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcignWW91IG11c3QgcGFzcyBhIG51bWJlciBhcyB0aGUgZHVyYXRpb24gdG8gYXNzZXJ0LnRpbWVvdXQnKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnRlc3QudGltZW91dCA9IGR1cmF0aW9uO1xuXG5cdFx0XHRcdC8vIElmIGEgdGltZW91dCBoYXMgYmVlbiBzZXQsIGNsZWFyIGl0IGFuZCByZXNldCB3aXRoIHRoZSBuZXcgZHVyYXRpb25cblx0XHRcdFx0aWYgKGNvbmZpZy50aW1lb3V0KSB7XG5cdFx0XHRcdFx0Y2xlYXJUaW1lb3V0KGNvbmZpZy50aW1lb3V0KTtcblx0XHRcdFx0XHRjb25maWcudGltZW91dCA9IG51bGw7XG5cdFx0XHRcdFx0aWYgKGNvbmZpZy50aW1lb3V0SGFuZGxlciAmJiB0aGlzLnRlc3QudGltZW91dCA+IDApIHtcblx0XHRcdFx0XHRcdHRoaXMudGVzdC5pbnRlcm5hbFJlc2V0VGltZW91dCh0aGlzLnRlc3QudGltZW91dCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIERvY3VtZW50cyBhIFwic3RlcFwiLCB3aGljaCBpcyBhIHN0cmluZyB2YWx1ZSwgaW4gYSB0ZXN0IGFzIGEgcGFzc2luZyBhc3NlcnRpb25cblx0XHR9LCB7XG5cdFx0XHRrZXk6IFwic3RlcFwiLFxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIHN0ZXAobWVzc2FnZSkge1xuXHRcdFx0XHR2YXIgYXNzZXJ0aW9uTWVzc2FnZSA9IG1lc3NhZ2U7XG5cdFx0XHRcdHZhciByZXN1bHQgPSAhIW1lc3NhZ2U7XG5cdFx0XHRcdHRoaXMudGVzdC5zdGVwcy5wdXNoKG1lc3NhZ2UpO1xuXHRcdFx0XHRpZiAodHlwZW9mIG1lc3NhZ2UgPT09ICd1bmRlZmluZWQnIHx8IG1lc3NhZ2UgPT09ICcnKSB7XG5cdFx0XHRcdFx0YXNzZXJ0aW9uTWVzc2FnZSA9ICdZb3UgbXVzdCBwcm92aWRlIGEgbWVzc2FnZSB0byBhc3NlcnQuc3RlcCc7XG5cdFx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIG1lc3NhZ2UgIT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdFx0YXNzZXJ0aW9uTWVzc2FnZSA9ICdZb3UgbXVzdCBwcm92aWRlIGEgc3RyaW5nIHZhbHVlIHRvIGFzc2VydC5zdGVwJztcblx0XHRcdFx0XHRyZXN1bHQgPSBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnB1c2hSZXN1bHQoe1xuXHRcdFx0XHRcdHJlc3VsdDogcmVzdWx0LFxuXHRcdFx0XHRcdG1lc3NhZ2U6IGFzc2VydGlvbk1lc3NhZ2Vcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFZlcmlmaWVzIHRoZSBzdGVwcyBpbiBhIHRlc3QgbWF0Y2ggYSBnaXZlbiBhcnJheSBvZiBzdHJpbmcgdmFsdWVzXG5cdFx0fSwge1xuXHRcdFx0a2V5OiBcInZlcmlmeVN0ZXBzXCIsXG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24gdmVyaWZ5U3RlcHMoc3RlcHMsIG1lc3NhZ2UpIHtcblx0XHRcdFx0Ly8gU2luY2UgdGhlIHN0ZXBzIGFycmF5IGlzIGp1c3Qgc3RyaW5nIHZhbHVlcywgd2UgY2FuIGNsb25lIHdpdGggc2xpY2Vcblx0XHRcdFx0dmFyIGFjdHVhbFN0ZXBzQ2xvbmUgPSB0aGlzLnRlc3Quc3RlcHMuc2xpY2UoKTtcblx0XHRcdFx0dGhpcy5kZWVwRXF1YWwoYWN0dWFsU3RlcHNDbG9uZSwgc3RlcHMsIG1lc3NhZ2UpO1xuXHRcdFx0XHR0aGlzLnRlc3Quc3RlcHMubGVuZ3RoID0gMDtcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRrZXk6IFwiZXhwZWN0XCIsXG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24gZXhwZWN0KGFzc2VydHMpIHtcblx0XHRcdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0XHR0aGlzLnRlc3QuZXhwZWN0ZWQgPSBhc3NlcnRzO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLnRlc3QuZXhwZWN0ZWQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gQ3JlYXRlIGEgbmV3IGFzeW5jIHBhdXNlIGFuZCByZXR1cm4gYSBuZXcgZnVuY3Rpb24gdGhhdCBjYW4gcmVsZWFzZSB0aGUgcGF1c2UuXG5cdFx0fSwge1xuXHRcdFx0a2V5OiBcImFzeW5jXCIsXG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24gYXN5bmMoY291bnQpIHtcblx0XHRcdFx0aWYgKGNvdW50ID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRjb3VudCA9IDE7XG5cdFx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIGNvdW50ICE9PSAnbnVtYmVyJykge1xuXHRcdFx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ2FzeW5jIHRha2VzIG51bWJlciBhcyBhbiBpbnB1dCcpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciByZXF1aXJlZENhbGxzID0gY291bnQ7XG5cdFx0XHRcdHJldHVybiB0aGlzLnRlc3QuaW50ZXJuYWxTdG9wKHJlcXVpcmVkQ2FsbHMpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBFeHBvcnRzIHRlc3QucHVzaCgpIHRvIHRoZSB1c2VyIEFQSVxuXHRcdFx0Ly8gQWxpYXMgb2YgcHVzaFJlc3VsdC5cblx0XHR9LCB7XG5cdFx0XHRrZXk6IFwicHVzaFwiLFxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIHB1c2gocmVzdWx0LCBhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCBuZWdhdGl2ZSkge1xuXHRcdFx0XHRMb2dnZXIud2FybignYXNzZXJ0LnB1c2ggaXMgZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIFFVbml0IDMuMC4nICsgJyBQbGVhc2UgdXNlIGFzc2VydC5wdXNoUmVzdWx0IGluc3RlYWQgKGh0dHBzOi8vYXBpLnF1bml0anMuY29tL2Fzc2VydC9wdXNoUmVzdWx0KS4nKTtcblx0XHRcdFx0dmFyIGN1cnJlbnRBc3NlcnQgPSB0aGlzIGluc3RhbmNlb2YgQXNzZXJ0ID8gdGhpcyA6IGNvbmZpZy5jdXJyZW50LmFzc2VydDtcblx0XHRcdFx0cmV0dXJuIGN1cnJlbnRBc3NlcnQucHVzaFJlc3VsdCh7XG5cdFx0XHRcdFx0cmVzdWx0OiByZXN1bHQsXG5cdFx0XHRcdFx0YWN0dWFsOiBhY3R1YWwsXG5cdFx0XHRcdFx0ZXhwZWN0ZWQ6IGV4cGVjdGVkLFxuXHRcdFx0XHRcdG1lc3NhZ2U6IG1lc3NhZ2UsXG5cdFx0XHRcdFx0bmVnYXRpdmU6IG5lZ2F0aXZlXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdGtleTogXCJwdXNoUmVzdWx0XCIsXG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24gcHVzaFJlc3VsdChyZXN1bHRJbmZvKSB7XG5cdFx0XHRcdC8vIERlc3RydWN0dXJlIG9mIHJlc3VsdEluZm8gPSB7IHJlc3VsdCwgYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgbmVnYXRpdmUgfVxuXHRcdFx0XHR2YXIgYXNzZXJ0ID0gdGhpcztcblx0XHRcdFx0dmFyIGN1cnJlbnRUZXN0ID0gYXNzZXJ0IGluc3RhbmNlb2YgQXNzZXJ0ICYmIGFzc2VydC50ZXN0IHx8IGNvbmZpZy5jdXJyZW50O1xuXG5cdFx0XHRcdC8vIEJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IGZpeC5cblx0XHRcdFx0Ly8gQWxsb3dzIHRoZSBkaXJlY3QgdXNlIG9mIGdsb2JhbCBleHBvcnRlZCBhc3NlcnRpb25zIGFuZCBRVW5pdC5hc3NlcnQuKlxuXHRcdFx0XHQvLyBBbHRob3VnaCwgaXQncyB1c2UgaXMgbm90IHJlY29tbWVuZGVkIGFzIGl0IGNhbiBsZWFrIGFzc2VydGlvbnNcblx0XHRcdFx0Ly8gdG8gb3RoZXIgdGVzdHMgZnJvbSBhc3luYyB0ZXN0cywgYmVjYXVzZSB3ZSBvbmx5IGdldCBhIHJlZmVyZW5jZSB0byB0aGUgY3VycmVudCB0ZXN0LFxuXHRcdFx0XHQvLyBub3QgZXhhY3RseSB0aGUgdGVzdCB3aGVyZSBhc3NlcnRpb24gd2VyZSBpbnRlbmRlZCB0byBiZSBjYWxsZWQuXG5cdFx0XHRcdGlmICghY3VycmVudFRlc3QpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ2Fzc2VydGlvbiBvdXRzaWRlIHRlc3QgY29udGV4dCwgaW4gJyArIHNvdXJjZUZyb21TdGFja3RyYWNlKDIpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIShhc3NlcnQgaW5zdGFuY2VvZiBBc3NlcnQpKSB7XG5cdFx0XHRcdFx0YXNzZXJ0ID0gY3VycmVudFRlc3QuYXNzZXJ0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBhc3NlcnQudGVzdC5wdXNoUmVzdWx0KHJlc3VsdEluZm8pO1xuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdGtleTogXCJva1wiLFxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIG9rKHJlc3VsdCwgbWVzc2FnZSkge1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UpIHtcblx0XHRcdFx0XHRtZXNzYWdlID0gcmVzdWx0ID8gJ29rYXknIDogXCJmYWlsZWQsIGV4cGVjdGVkIGFyZ3VtZW50IHRvIGJlIHRydXRoeSwgd2FzOiBcIi5jb25jYXQoZHVtcC5wYXJzZShyZXN1bHQpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnB1c2hSZXN1bHQoe1xuXHRcdFx0XHRcdHJlc3VsdDogISFyZXN1bHQsXG5cdFx0XHRcdFx0YWN0dWFsOiByZXN1bHQsXG5cdFx0XHRcdFx0ZXhwZWN0ZWQ6IHRydWUsXG5cdFx0XHRcdFx0bWVzc2FnZTogbWVzc2FnZVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRrZXk6IFwibm90T2tcIixcblx0XHRcdHZhbHVlOiBmdW5jdGlvbiBub3RPayhyZXN1bHQsIG1lc3NhZ2UpIHtcblx0XHRcdFx0aWYgKCFtZXNzYWdlKSB7XG5cdFx0XHRcdFx0bWVzc2FnZSA9ICFyZXN1bHQgPyAnb2theScgOiBcImZhaWxlZCwgZXhwZWN0ZWQgYXJndW1lbnQgdG8gYmUgZmFsc3ksIHdhczogXCIuY29uY2F0KGR1bXAucGFyc2UocmVzdWx0KSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5wdXNoUmVzdWx0KHtcblx0XHRcdFx0XHRyZXN1bHQ6ICFyZXN1bHQsXG5cdFx0XHRcdFx0YWN0dWFsOiByZXN1bHQsXG5cdFx0XHRcdFx0ZXhwZWN0ZWQ6IGZhbHNlLFxuXHRcdFx0XHRcdG1lc3NhZ2U6IG1lc3NhZ2Vcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0a2V5OiBcInRydWVcIixcblx0XHRcdHZhbHVlOiBmdW5jdGlvbiBfdHJ1ZShyZXN1bHQsIG1lc3NhZ2UpIHtcblx0XHRcdFx0dGhpcy5wdXNoUmVzdWx0KHtcblx0XHRcdFx0XHRyZXN1bHQ6IHJlc3VsdCA9PT0gdHJ1ZSxcblx0XHRcdFx0XHRhY3R1YWw6IHJlc3VsdCxcblx0XHRcdFx0XHRleHBlY3RlZDogdHJ1ZSxcblx0XHRcdFx0XHRtZXNzYWdlOiBtZXNzYWdlXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdGtleTogXCJmYWxzZVwiLFxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIF9mYWxzZShyZXN1bHQsIG1lc3NhZ2UpIHtcblx0XHRcdFx0dGhpcy5wdXNoUmVzdWx0KHtcblx0XHRcdFx0XHRyZXN1bHQ6IHJlc3VsdCA9PT0gZmFsc2UsXG5cdFx0XHRcdFx0YWN0dWFsOiByZXN1bHQsXG5cdFx0XHRcdFx0ZXhwZWN0ZWQ6IGZhbHNlLFxuXHRcdFx0XHRcdG1lc3NhZ2U6IG1lc3NhZ2Vcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0a2V5OiBcImVxdWFsXCIsXG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24gZXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuXHRcdFx0XHR0aGlzLnB1c2hSZXN1bHQoe1xuXHRcdFx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBlcWVxZXFcblx0XHRcdFx0XHRyZXN1bHQ6IGV4cGVjdGVkID09IGFjdHVhbCxcblx0XHRcdFx0XHRhY3R1YWw6IGFjdHVhbCxcblx0XHRcdFx0XHRleHBlY3RlZDogZXhwZWN0ZWQsXG5cdFx0XHRcdFx0bWVzc2FnZTogbWVzc2FnZVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRrZXk6IFwibm90RXF1YWxcIixcblx0XHRcdHZhbHVlOiBmdW5jdGlvbiBub3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG5cdFx0XHRcdHRoaXMucHVzaFJlc3VsdCh7XG5cdFx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGVxZXFlcVxuXHRcdFx0XHRcdHJlc3VsdDogZXhwZWN0ZWQgIT0gYWN0dWFsLFxuXHRcdFx0XHRcdGFjdHVhbDogYWN0dWFsLFxuXHRcdFx0XHRcdGV4cGVjdGVkOiBleHBlY3RlZCxcblx0XHRcdFx0XHRtZXNzYWdlOiBtZXNzYWdlLFxuXHRcdFx0XHRcdG5lZ2F0aXZlOiB0cnVlXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdGtleTogXCJwcm9wRXF1YWxcIixcblx0XHRcdHZhbHVlOiBmdW5jdGlvbiBwcm9wRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuXHRcdFx0XHRhY3R1YWwgPSBvYmplY3RWYWx1ZXMoYWN0dWFsKTtcblx0XHRcdFx0ZXhwZWN0ZWQgPSBvYmplY3RWYWx1ZXMoZXhwZWN0ZWQpO1xuXHRcdFx0XHR0aGlzLnB1c2hSZXN1bHQoe1xuXHRcdFx0XHRcdHJlc3VsdDogZXF1aXYoYWN0dWFsLCBleHBlY3RlZCksXG5cdFx0XHRcdFx0YWN0dWFsOiBhY3R1YWwsXG5cdFx0XHRcdFx0ZXhwZWN0ZWQ6IGV4cGVjdGVkLFxuXHRcdFx0XHRcdG1lc3NhZ2U6IG1lc3NhZ2Vcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0a2V5OiBcIm5vdFByb3BFcXVhbFwiLFxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIG5vdFByb3BFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG5cdFx0XHRcdGFjdHVhbCA9IG9iamVjdFZhbHVlcyhhY3R1YWwpO1xuXHRcdFx0XHRleHBlY3RlZCA9IG9iamVjdFZhbHVlcyhleHBlY3RlZCk7XG5cdFx0XHRcdHRoaXMucHVzaFJlc3VsdCh7XG5cdFx0XHRcdFx0cmVzdWx0OiAhZXF1aXYoYWN0dWFsLCBleHBlY3RlZCksXG5cdFx0XHRcdFx0YWN0dWFsOiBhY3R1YWwsXG5cdFx0XHRcdFx0ZXhwZWN0ZWQ6IGV4cGVjdGVkLFxuXHRcdFx0XHRcdG1lc3NhZ2U6IG1lc3NhZ2UsXG5cdFx0XHRcdFx0bmVnYXRpdmU6IHRydWVcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0a2V5OiBcInByb3BDb250YWluc1wiLFxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIHByb3BDb250YWlucyhhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG5cdFx0XHRcdGFjdHVhbCA9IG9iamVjdFZhbHVlc1N1YnNldChhY3R1YWwsIGV4cGVjdGVkKTtcblxuXHRcdFx0XHQvLyBUaGUgZXhwZWN0ZWQgcGFyYW1ldGVyIGlzIHVzdWFsbHkgYSBwbGFpbiBvYmplY3QsIGJ1dCBjbG9uZSBpdCBmb3Jcblx0XHRcdFx0Ly8gY29uc2lzdGVuY3kgd2l0aCBwcm9wRXF1YWwoKSwgYW5kIHRvIG1ha2UgaXQgZWFzeSB0byBleHBsYWluIHRoYXRcblx0XHRcdFx0Ly8gaW5oZXJpdGVuY2UgaXMgbm90IGNvbnNpZGVyZWQgKG9uIGVpdGhlciBzaWRlKSwgYW5kIHRvIHN1cHBvcnRcblx0XHRcdFx0Ly8gcmVjdXJzaXZlbHkgY2hlY2tpbmcgc3Vic2V0cyBvZiBuZXN0ZWQgb2JqZWN0cy5cblx0XHRcdFx0ZXhwZWN0ZWQgPSBvYmplY3RWYWx1ZXMoZXhwZWN0ZWQsIGZhbHNlKTtcblx0XHRcdFx0dGhpcy5wdXNoUmVzdWx0KHtcblx0XHRcdFx0XHRyZXN1bHQ6IGVxdWl2KGFjdHVhbCwgZXhwZWN0ZWQpLFxuXHRcdFx0XHRcdGFjdHVhbDogYWN0dWFsLFxuXHRcdFx0XHRcdGV4cGVjdGVkOiBleHBlY3RlZCxcblx0XHRcdFx0XHRtZXNzYWdlOiBtZXNzYWdlXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdGtleTogXCJub3RQcm9wQ29udGFpbnNcIixcblx0XHRcdHZhbHVlOiBmdW5jdGlvbiBub3RQcm9wQ29udGFpbnMoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuXHRcdFx0XHRhY3R1YWwgPSBvYmplY3RWYWx1ZXNTdWJzZXQoYWN0dWFsLCBleHBlY3RlZCk7XG5cdFx0XHRcdGV4cGVjdGVkID0gb2JqZWN0VmFsdWVzKGV4cGVjdGVkKTtcblx0XHRcdFx0dGhpcy5wdXNoUmVzdWx0KHtcblx0XHRcdFx0XHRyZXN1bHQ6ICFlcXVpdihhY3R1YWwsIGV4cGVjdGVkKSxcblx0XHRcdFx0XHRhY3R1YWw6IGFjdHVhbCxcblx0XHRcdFx0XHRleHBlY3RlZDogZXhwZWN0ZWQsXG5cdFx0XHRcdFx0bWVzc2FnZTogbWVzc2FnZSxcblx0XHRcdFx0XHRuZWdhdGl2ZTogdHJ1ZVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRrZXk6IFwiZGVlcEVxdWFsXCIsXG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24gZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcblx0XHRcdFx0dGhpcy5wdXNoUmVzdWx0KHtcblx0XHRcdFx0XHRyZXN1bHQ6IGVxdWl2KGFjdHVhbCwgZXhwZWN0ZWQpLFxuXHRcdFx0XHRcdGFjdHVhbDogYWN0dWFsLFxuXHRcdFx0XHRcdGV4cGVjdGVkOiBleHBlY3RlZCxcblx0XHRcdFx0XHRtZXNzYWdlOiBtZXNzYWdlXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdGtleTogXCJub3REZWVwRXF1YWxcIixcblx0XHRcdHZhbHVlOiBmdW5jdGlvbiBub3REZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuXHRcdFx0XHR0aGlzLnB1c2hSZXN1bHQoe1xuXHRcdFx0XHRcdHJlc3VsdDogIWVxdWl2KGFjdHVhbCwgZXhwZWN0ZWQpLFxuXHRcdFx0XHRcdGFjdHVhbDogYWN0dWFsLFxuXHRcdFx0XHRcdGV4cGVjdGVkOiBleHBlY3RlZCxcblx0XHRcdFx0XHRtZXNzYWdlOiBtZXNzYWdlLFxuXHRcdFx0XHRcdG5lZ2F0aXZlOiB0cnVlXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdGtleTogXCJzdHJpY3RFcXVhbFwiLFxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIHN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcblx0XHRcdFx0dGhpcy5wdXNoUmVzdWx0KHtcblx0XHRcdFx0XHRyZXN1bHQ6IGV4cGVjdGVkID09PSBhY3R1YWwsXG5cdFx0XHRcdFx0YWN0dWFsOiBhY3R1YWwsXG5cdFx0XHRcdFx0ZXhwZWN0ZWQ6IGV4cGVjdGVkLFxuXHRcdFx0XHRcdG1lc3NhZ2U6IG1lc3NhZ2Vcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0a2V5OiBcIm5vdFN0cmljdEVxdWFsXCIsXG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24gbm90U3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuXHRcdFx0XHR0aGlzLnB1c2hSZXN1bHQoe1xuXHRcdFx0XHRcdHJlc3VsdDogZXhwZWN0ZWQgIT09IGFjdHVhbCxcblx0XHRcdFx0XHRhY3R1YWw6IGFjdHVhbCxcblx0XHRcdFx0XHRleHBlY3RlZDogZXhwZWN0ZWQsXG5cdFx0XHRcdFx0bWVzc2FnZTogbWVzc2FnZSxcblx0XHRcdFx0XHRuZWdhdGl2ZTogdHJ1ZVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRrZXk6ICd0aHJvd3MnLFxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIHRocm93cyhibG9jaywgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcblx0XHRcdFx0dmFyIF92YWxpZGF0ZUV4cGVjdGVkRXhjZSA9IHZhbGlkYXRlRXhwZWN0ZWRFeGNlcHRpb25BcmdzKGV4cGVjdGVkLCBtZXNzYWdlLCAndGhyb3dzJyk7XG5cdFx0XHRcdHZhciBfdmFsaWRhdGVFeHBlY3RlZEV4Y2UyID0gX3NsaWNlZFRvQXJyYXkoX3ZhbGlkYXRlRXhwZWN0ZWRFeGNlLCAyKTtcblx0XHRcdFx0ZXhwZWN0ZWQgPSBfdmFsaWRhdGVFeHBlY3RlZEV4Y2UyWzBdO1xuXHRcdFx0XHRtZXNzYWdlID0gX3ZhbGlkYXRlRXhwZWN0ZWRFeGNlMlsxXTtcblx0XHRcdFx0dmFyIGN1cnJlbnRUZXN0ID0gdGhpcyBpbnN0YW5jZW9mIEFzc2VydCAmJiB0aGlzLnRlc3QgfHwgY29uZmlnLmN1cnJlbnQ7XG5cdFx0XHRcdGlmICh0eXBlb2YgYmxvY2sgIT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRjdXJyZW50VGVzdC5hc3NlcnQucHVzaFJlc3VsdCh7XG5cdFx0XHRcdFx0XHRyZXN1bHQ6IGZhbHNlLFxuXHRcdFx0XHRcdFx0YWN0dWFsOiBibG9jayxcblx0XHRcdFx0XHRcdG1lc3NhZ2U6ICdUaGUgdmFsdWUgcHJvdmlkZWQgdG8gYGFzc2VydC50aHJvd3NgIGluICcgKyAnXCInICsgY3VycmVudFRlc3QudGVzdE5hbWUgKyAnXCIgd2FzIG5vdCBhIGZ1bmN0aW9uLidcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIGFjdHVhbDtcblx0XHRcdFx0dmFyIHJlc3VsdCA9IGZhbHNlO1xuXHRcdFx0XHRjdXJyZW50VGVzdC5pZ25vcmVHbG9iYWxFcnJvcnMgPSB0cnVlO1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGJsb2NrLmNhbGwoY3VycmVudFRlc3QudGVzdEVudmlyb25tZW50KTtcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdGFjdHVhbCA9IGU7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y3VycmVudFRlc3QuaWdub3JlR2xvYmFsRXJyb3JzID0gZmFsc2U7XG5cdFx0XHRcdGlmIChhY3R1YWwpIHtcblx0XHRcdFx0XHR2YXIgX3ZhbGlkYXRlRXhjZXB0aW9uID0gdmFsaWRhdGVFeGNlcHRpb24oYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSk7XG5cdFx0XHRcdFx0dmFyIF92YWxpZGF0ZUV4Y2VwdGlvbjIgPSBfc2xpY2VkVG9BcnJheShfdmFsaWRhdGVFeGNlcHRpb24sIDMpO1xuXHRcdFx0XHRcdHJlc3VsdCA9IF92YWxpZGF0ZUV4Y2VwdGlvbjJbMF07XG5cdFx0XHRcdFx0ZXhwZWN0ZWQgPSBfdmFsaWRhdGVFeGNlcHRpb24yWzFdO1xuXHRcdFx0XHRcdG1lc3NhZ2UgPSBfdmFsaWRhdGVFeGNlcHRpb24yWzJdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGN1cnJlbnRUZXN0LmFzc2VydC5wdXNoUmVzdWx0KHtcblx0XHRcdFx0XHRyZXN1bHQ6IHJlc3VsdCxcblx0XHRcdFx0XHQvLyB1bmRlZmluZWQgaWYgaXQgZGlkbid0IHRocm93XG5cdFx0XHRcdFx0YWN0dWFsOiBhY3R1YWwgJiYgZXJyb3JTdHJpbmcoYWN0dWFsKSxcblx0XHRcdFx0XHRleHBlY3RlZDogZXhwZWN0ZWQsXG5cdFx0XHRcdFx0bWVzc2FnZTogbWVzc2FnZVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRrZXk6IFwicmVqZWN0c1wiLFxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIHJlamVjdHMocHJvbWlzZSwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcblx0XHRcdFx0dmFyIF92YWxpZGF0ZUV4cGVjdGVkRXhjZTMgPSB2YWxpZGF0ZUV4cGVjdGVkRXhjZXB0aW9uQXJncyhleHBlY3RlZCwgbWVzc2FnZSwgJ3JlamVjdHMnKTtcblx0XHRcdFx0dmFyIF92YWxpZGF0ZUV4cGVjdGVkRXhjZTQgPSBfc2xpY2VkVG9BcnJheShfdmFsaWRhdGVFeHBlY3RlZEV4Y2UzLCAyKTtcblx0XHRcdFx0ZXhwZWN0ZWQgPSBfdmFsaWRhdGVFeHBlY3RlZEV4Y2U0WzBdO1xuXHRcdFx0XHRtZXNzYWdlID0gX3ZhbGlkYXRlRXhwZWN0ZWRFeGNlNFsxXTtcblx0XHRcdFx0dmFyIGN1cnJlbnRUZXN0ID0gdGhpcyBpbnN0YW5jZW9mIEFzc2VydCAmJiB0aGlzLnRlc3QgfHwgY29uZmlnLmN1cnJlbnQ7XG5cdFx0XHRcdHZhciB0aGVuID0gcHJvbWlzZSAmJiBwcm9taXNlLnRoZW47XG5cdFx0XHRcdGlmICh0eXBlb2YgdGhlbiAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdGN1cnJlbnRUZXN0LmFzc2VydC5wdXNoUmVzdWx0KHtcblx0XHRcdFx0XHRcdHJlc3VsdDogZmFsc2UsXG5cdFx0XHRcdFx0XHRtZXNzYWdlOiAnVGhlIHZhbHVlIHByb3ZpZGVkIHRvIGBhc3NlcnQucmVqZWN0c2AgaW4gJyArICdcIicgKyBjdXJyZW50VGVzdC50ZXN0TmFtZSArICdcIiB3YXMgbm90IGEgcHJvbWlzZS4nLFxuXHRcdFx0XHRcdFx0YWN0dWFsOiBwcm9taXNlXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciBkb25lID0gdGhpcy5hc3luYygpO1xuXHRcdFx0XHRyZXR1cm4gdGhlbi5jYWxsKHByb21pc2UsIGZ1bmN0aW9uIGhhbmRsZUZ1bGZpbGxtZW50KCkge1xuXHRcdFx0XHRcdGN1cnJlbnRUZXN0LmFzc2VydC5wdXNoUmVzdWx0KHtcblx0XHRcdFx0XHRcdHJlc3VsdDogZmFsc2UsXG5cdFx0XHRcdFx0XHRtZXNzYWdlOiAnVGhlIHByb21pc2UgcmV0dXJuZWQgYnkgdGhlIGBhc3NlcnQucmVqZWN0c2AgY2FsbGJhY2sgaW4gJyArICdcIicgKyBjdXJyZW50VGVzdC50ZXN0TmFtZSArICdcIiBkaWQgbm90IHJlamVjdC4nLFxuXHRcdFx0XHRcdFx0YWN0dWFsOiBwcm9taXNlXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0ZG9uZSgpO1xuXHRcdFx0XHR9LCBmdW5jdGlvbiBoYW5kbGVSZWplY3Rpb24oYWN0dWFsKSB7XG5cdFx0XHRcdFx0dmFyIHJlc3VsdDtcblx0XHRcdFx0XHR2YXIgX3ZhbGlkYXRlRXhjZXB0aW9uMyA9IHZhbGlkYXRlRXhjZXB0aW9uKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpO1xuXHRcdFx0XHRcdHZhciBfdmFsaWRhdGVFeGNlcHRpb240ID0gX3NsaWNlZFRvQXJyYXkoX3ZhbGlkYXRlRXhjZXB0aW9uMywgMyk7XG5cdFx0XHRcdFx0cmVzdWx0ID0gX3ZhbGlkYXRlRXhjZXB0aW9uNFswXTtcblx0XHRcdFx0XHRleHBlY3RlZCA9IF92YWxpZGF0ZUV4Y2VwdGlvbjRbMV07XG5cdFx0XHRcdFx0bWVzc2FnZSA9IF92YWxpZGF0ZUV4Y2VwdGlvbjRbMl07XG5cdFx0XHRcdFx0Y3VycmVudFRlc3QuYXNzZXJ0LnB1c2hSZXN1bHQoe1xuXHRcdFx0XHRcdFx0cmVzdWx0OiByZXN1bHQsXG5cdFx0XHRcdFx0XHQvLyBsZWF2ZSByZWplY3Rpb24gdmFsdWUgb2YgdW5kZWZpbmVkIGFzLWlzXG5cdFx0XHRcdFx0XHRhY3R1YWw6IGFjdHVhbCAmJiBlcnJvclN0cmluZyhhY3R1YWwpLFxuXHRcdFx0XHRcdFx0ZXhwZWN0ZWQ6IGV4cGVjdGVkLFxuXHRcdFx0XHRcdFx0bWVzc2FnZTogbWVzc2FnZVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGRvbmUoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fV0pO1xuXHRcdHJldHVybiBBc3NlcnQ7XG5cdH0oKTtcblx0ZnVuY3Rpb24gdmFsaWRhdGVFeHBlY3RlZEV4Y2VwdGlvbkFyZ3MoZXhwZWN0ZWQsIG1lc3NhZ2UsIGFzc2VydGlvbk1ldGhvZCkge1xuXHRcdHZhciBleHBlY3RlZFR5cGUgPSBvYmplY3RUeXBlKGV4cGVjdGVkKTtcblxuXHRcdC8vICdleHBlY3RlZCcgaXMgb3B0aW9uYWwgdW5sZXNzIGRvaW5nIHN0cmluZyBjb21wYXJpc29uXG5cdFx0aWYgKGV4cGVjdGVkVHlwZSA9PT0gJ3N0cmluZycpIHtcblx0XHRcdGlmIChtZXNzYWdlID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0bWVzc2FnZSA9IGV4cGVjdGVkO1xuXHRcdFx0XHRleHBlY3RlZCA9IHVuZGVmaW5lZDtcblx0XHRcdFx0cmV0dXJuIFtleHBlY3RlZCwgbWVzc2FnZV07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ2Fzc2VydC4nICsgYXNzZXJ0aW9uTWV0aG9kICsgJyBkb2VzIG5vdCBhY2NlcHQgYSBzdHJpbmcgdmFsdWUgZm9yIHRoZSBleHBlY3RlZCBhcmd1bWVudC5cXG4nICsgJ1VzZSBhIG5vbi1zdHJpbmcgb2JqZWN0IHZhbHVlIChlLmcuIFJlZ0V4cCBvciB2YWxpZGF0b3IgZnVuY3Rpb24pICcgKyAnaW5zdGVhZCBpZiBuZWNlc3NhcnkuJyk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHZhciB2YWxpZCA9ICFleHBlY3RlZCB8fFxuXHRcdFx0XHRcdFx0XHRcdC8vIFRPRE86IGJlIG1vcmUgZXhwbGljaXQgaGVyZVxuXHRcdFx0XHRcdFx0XHRcdGV4cGVjdGVkVHlwZSA9PT0gJ3JlZ2V4cCcgfHwgZXhwZWN0ZWRUeXBlID09PSAnZnVuY3Rpb24nIHx8IGV4cGVjdGVkVHlwZSA9PT0gJ29iamVjdCc7XG5cdFx0aWYgKCF2YWxpZCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGV4cGVjdGVkIHZhbHVlIHR5cGUgKCcgKyBleHBlY3RlZFR5cGUgKyAnKSAnICsgJ3Byb3ZpZGVkIHRvIGFzc2VydC4nICsgYXNzZXJ0aW9uTWV0aG9kICsgJy4nKTtcblx0XHR9XG5cdFx0cmV0dXJuIFtleHBlY3RlZCwgbWVzc2FnZV07XG5cdH1cblx0ZnVuY3Rpb24gdmFsaWRhdGVFeGNlcHRpb24oYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuXHRcdHZhciByZXN1bHQgPSBmYWxzZTtcblx0XHR2YXIgZXhwZWN0ZWRUeXBlID0gb2JqZWN0VHlwZShleHBlY3RlZCk7XG5cblx0XHQvLyBUaGVzZSBicmFuY2hlcyBzaG91bGQgYmUgZXhoYXVzdGl2ZSwgYmFzZWQgb24gdmFsaWRhdGlvbiBkb25lIGluIHZhbGlkYXRlRXhwZWN0ZWRFeGNlcHRpb25cblxuXHRcdC8vIFdlIGRvbid0IHdhbnQgdG8gdmFsaWRhdGVcblx0XHRpZiAoIWV4cGVjdGVkKSB7XG5cdFx0XHRyZXN1bHQgPSB0cnVlO1xuXG5cdFx0XHQvLyBFeHBlY3RlZCBpcyBhIHJlZ2V4cFxuXHRcdH0gZWxzZSBpZiAoZXhwZWN0ZWRUeXBlID09PSAncmVnZXhwJykge1xuXHRcdFx0cmVzdWx0ID0gZXhwZWN0ZWQudGVzdChlcnJvclN0cmluZyhhY3R1YWwpKTtcblxuXHRcdFx0Ly8gTG9nIHRoZSBzdHJpbmcgZm9ybSBvZiB0aGUgcmVnZXhwXG5cdFx0XHRleHBlY3RlZCA9IFN0cmluZyhleHBlY3RlZCk7XG5cblx0XHRcdC8vIEV4cGVjdGVkIGlzIGEgY29uc3RydWN0b3IsIG1heWJlIGFuIEVycm9yIGNvbnN0cnVjdG9yLlxuXHRcdFx0Ly8gTm90ZSB0aGUgZXh0cmEgY2hlY2sgb24gaXRzIHByb3RvdHlwZSAtIHRoaXMgaXMgYW4gaW1wbGljaXRcblx0XHRcdC8vIHJlcXVpcmVtZW50IG9mIFwiaW5zdGFuY2VvZlwiLCBlbHNlIGl0IHdpbGwgdGhyb3cgYSBUeXBlRXJyb3IuXG5cdFx0fSBlbHNlIGlmIChleHBlY3RlZFR5cGUgPT09ICdmdW5jdGlvbicgJiYgZXhwZWN0ZWQucHJvdG90eXBlICE9PSB1bmRlZmluZWQgJiYgYWN0dWFsIGluc3RhbmNlb2YgZXhwZWN0ZWQpIHtcblx0XHRcdHJlc3VsdCA9IHRydWU7XG5cblx0XHRcdC8vIEV4cGVjdGVkIGlzIGFuIEVycm9yIG9iamVjdFxuXHRcdH0gZWxzZSBpZiAoZXhwZWN0ZWRUeXBlID09PSAnb2JqZWN0Jykge1xuXHRcdFx0cmVzdWx0ID0gYWN0dWFsIGluc3RhbmNlb2YgZXhwZWN0ZWQuY29uc3RydWN0b3IgJiYgYWN0dWFsLm5hbWUgPT09IGV4cGVjdGVkLm5hbWUgJiYgYWN0dWFsLm1lc3NhZ2UgPT09IGV4cGVjdGVkLm1lc3NhZ2U7XG5cblx0XHRcdC8vIExvZyB0aGUgc3RyaW5nIGZvcm0gb2YgdGhlIEVycm9yIG9iamVjdFxuXHRcdFx0ZXhwZWN0ZWQgPSBlcnJvclN0cmluZyhleHBlY3RlZCk7XG5cblx0XHRcdC8vIEV4cGVjdGVkIGlzIGEgdmFsaWRhdGlvbiBmdW5jdGlvbiB3aGljaCByZXR1cm5zIHRydWUgaWYgdmFsaWRhdGlvbiBwYXNzZWRcblx0XHR9IGVsc2UgaWYgKGV4cGVjdGVkVHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0Ly8gcHJvdGVjdCBhZ2FpbnN0IGFjY2lkZW50YWwgc2VtYW50aWNzIHdoaWNoIGNvdWxkIGhhcmQgZXJyb3IgaW4gdGhlIHRlc3Rcblx0XHRcdHRyeSB7XG5cdFx0XHRcdHJlc3VsdCA9IGV4cGVjdGVkLmNhbGwoe30sIGFjdHVhbCkgPT09IHRydWU7XG5cdFx0XHRcdGV4cGVjdGVkID0gbnVsbDtcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0Ly8gYXNzaWduIHRoZSBcImV4cGVjdGVkXCIgdG8gYSBuaWNlIGVycm9yIHN0cmluZyB0byBjb21tdW5pY2F0ZSB0aGUgbG9jYWwgZmFpbHVyZSB0byB0aGUgdXNlclxuXHRcdFx0XHRleHBlY3RlZCA9IGVycm9yU3RyaW5nKGUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gW3Jlc3VsdCwgZXhwZWN0ZWQsIG1lc3NhZ2VdO1xuXHR9XG5cblx0Ly8gUHJvdmlkZSBhbiBhbHRlcm5hdGl2ZSB0byBhc3NlcnQudGhyb3dzKCksIGZvciBlbnZpcm9ubWVudHMgdGhhdCBjb25zaWRlciB0aHJvd3MgYSByZXNlcnZlZCB3b3JkXG5cdC8vIEtub3duIHRvIHVzIGFyZTogQ2xvc3VyZSBDb21waWxlciwgTmFyd2hhbFxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZG90LW5vdGF0aW9uXG5cdEFzc2VydC5wcm90b3R5cGUucmFpc2VzID0gQXNzZXJ0LnByb3RvdHlwZVsndGhyb3dzJ107XG5cblx0dmFyIExJU1RFTkVSUyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cdHZhciBTVVBQT1JURURfRVZFTlRTID0gWydlcnJvcicsICdydW5TdGFydCcsICdzdWl0ZVN0YXJ0JywgJ3Rlc3RTdGFydCcsICdhc3NlcnRpb24nLCAndGVzdEVuZCcsICdzdWl0ZUVuZCcsICdydW5FbmQnXTtcblxuXHQvKipcblx0ICogRW1pdHMgYW4gZXZlbnQgd2l0aCB0aGUgc3BlY2lmaWVkIGRhdGEgdG8gYWxsIGN1cnJlbnRseSByZWdpc3RlcmVkIGxpc3RlbmVycy5cblx0ICogQ2FsbGJhY2tzIHdpbGwgZmlyZSBpbiB0aGUgb3JkZXIgaW4gd2hpY2ggdGhleSBhcmUgcmVnaXN0ZXJlZCAoRklGTykuIFRoaXNcblx0ICogZnVuY3Rpb24gaXMgbm90IGV4cG9zZWQgcHVibGljbHk7IGl0IGlzIHVzZWQgYnkgUVVuaXQgaW50ZXJuYWxzIHRvIGVtaXRcblx0ICogbG9nZ2luZyBldmVudHMuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBtZXRob2QgZW1pdFxuXHQgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhXG5cdCAqIEByZXR1cm4ge3ZvaWR9XG5cdCAqL1xuXHRmdW5jdGlvbiBlbWl0KGV2ZW50TmFtZSwgZGF0YSkge1xuXHRcdGlmICh0eXBlb2YgZXZlbnROYW1lICE9PSAnc3RyaW5nJykge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignZXZlbnROYW1lIG11c3QgYmUgYSBzdHJpbmcgd2hlbiBlbWl0dGluZyBhbiBldmVudCcpO1xuXHRcdH1cblxuXHRcdC8vIENsb25lIHRoZSBjYWxsYmFja3MgaW4gY2FzZSBvbmUgb2YgdGhlbSByZWdpc3RlcnMgYSBuZXcgY2FsbGJhY2tcblx0XHR2YXIgb3JpZ2luYWxDYWxsYmFja3MgPSBMSVNURU5FUlNbZXZlbnROYW1lXTtcblx0XHR2YXIgY2FsbGJhY2tzID0gb3JpZ2luYWxDYWxsYmFja3MgPyBfdG9Db25zdW1hYmxlQXJyYXkob3JpZ2luYWxDYWxsYmFja3MpIDogW107XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNhbGxiYWNrc1tpXShkYXRhKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGEgY2FsbGJhY2sgYXMgYSBsaXN0ZW5lciB0byB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqIEBtZXRob2Qgb25cblx0ICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZVxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuXHQgKiBAcmV0dXJuIHt2b2lkfVxuXHQgKi9cblx0ZnVuY3Rpb24gb24oZXZlbnROYW1lLCBjYWxsYmFjaykge1xuXHRcdGlmICh0eXBlb2YgZXZlbnROYW1lICE9PSAnc3RyaW5nJykge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignZXZlbnROYW1lIG11c3QgYmUgYSBzdHJpbmcgd2hlbiByZWdpc3RlcmluZyBhIGxpc3RlbmVyJyk7XG5cdFx0fSBlbHNlIGlmICghaW5BcnJheShldmVudE5hbWUsIFNVUFBPUlRFRF9FVkVOVFMpKSB7XG5cdFx0XHR2YXIgZXZlbnRzID0gU1VQUE9SVEVEX0VWRU5UUy5qb2luKCcsICcpO1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiXFxcIlwiLmNvbmNhdChldmVudE5hbWUsIFwiXFxcIiBpcyBub3QgYSB2YWxpZCBldmVudDsgbXVzdCBiZSBvbmUgb2Y6IFwiKS5jb25jYXQoZXZlbnRzLCBcIi5cIikpO1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdjYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb24gd2hlbiByZWdpc3RlcmluZyBhIGxpc3RlbmVyJyk7XG5cdFx0fVxuXHRcdGlmICghTElTVEVORVJTW2V2ZW50TmFtZV0pIHtcblx0XHRcdExJU1RFTkVSU1tldmVudE5hbWVdID0gW107XG5cdFx0fVxuXG5cdFx0Ly8gRG9uJ3QgcmVnaXN0ZXIgdGhlIHNhbWUgY2FsbGJhY2sgbW9yZSB0aGFuIG9uY2Vcblx0XHRpZiAoIWluQXJyYXkoY2FsbGJhY2ssIExJU1RFTkVSU1tldmVudE5hbWVdKSkge1xuXHRcdFx0TElTVEVORVJTW2V2ZW50TmFtZV0ucHVzaChjYWxsYmFjayk7XG5cdFx0fVxuXHR9XG5cblx0dmFyIGNvbW1vbmpzR2xvYmFsID0gdHlwZW9mIGdsb2JhbFRoaXMgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsVGhpcyA6IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDoge307XG5cblx0ZnVuY3Rpb24gY29tbW9uanNSZXF1aXJlIChwYXRoKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZHluYW1pY2FsbHkgcmVxdWlyZSBcIicgKyBwYXRoICsgJ1wiLiBQbGVhc2UgY29uZmlndXJlIHRoZSBkeW5hbWljUmVxdWlyZVRhcmdldHMgb3IvYW5kIGlnbm9yZUR5bmFtaWNSZXF1aXJlcyBvcHRpb24gb2YgQHJvbGx1cC9wbHVnaW4tY29tbW9uanMgYXBwcm9wcmlhdGVseSBmb3IgdGhpcyByZXF1aXJlIGNhbGwgdG8gd29yay4nKTtcblx0fVxuXG5cdHZhciBwcm9taXNlUG9seWZpbGwgPSB7ZXhwb3J0czoge319O1xuXG5cdChmdW5jdGlvbiAoKSB7XG5cblx0XHQvKiogQHN1cHByZXNzIHt1bmRlZmluZWRWYXJzfSAqL1xuXHRcdHZhciBnbG9iYWxOUyA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdC8vIHRoZSBvbmx5IHJlbGlhYmxlIG1lYW5zIHRvIGdldCB0aGUgZ2xvYmFsIG9iamVjdCBpc1xuXHRcdFx0Ly8gYEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKClgXG5cdFx0XHQvLyBIb3dldmVyLCB0aGlzIGNhdXNlcyBDU1AgdmlvbGF0aW9ucyBpbiBDaHJvbWUgYXBwcy5cblx0XHRcdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0cmV0dXJuIGdsb2JhbFRoaXM7XG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdHJldHVybiBzZWxmO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdHJldHVybiB3aW5kb3c7XG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZW9mIGNvbW1vbmpzR2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRyZXR1cm4gY29tbW9uanNHbG9iYWw7XG5cdFx0XHR9XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3VuYWJsZSB0byBsb2NhdGUgZ2xvYmFsIG9iamVjdCcpO1xuXHRcdH0oKTtcblxuXHRcdC8vIEV4cG9zZSB0aGUgcG9seWZpbGwgaWYgUHJvbWlzZSBpcyB1bmRlZmluZWQgb3Igc2V0IHRvIGFcblx0XHQvLyBub24tZnVuY3Rpb24gdmFsdWUuIFRoZSBsYXR0ZXIgY2FuIGJlIGR1ZSB0byBhIG5hbWVkIEhUTUxFbGVtZW50XG5cdFx0Ly8gYmVpbmcgZXhwb3NlZCBieSBicm93c2VycyBmb3IgbGVnYWN5IHJlYXNvbnMuXG5cdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL3RheWxvcmhha2VzL3Byb21pc2UtcG9seWZpbGwvaXNzdWVzLzExNFxuXHRcdGlmICh0eXBlb2YgZ2xvYmFsTlNbJ1Byb21pc2UnXSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0cHJvbWlzZVBvbHlmaWxsLmV4cG9ydHMgPSBnbG9iYWxOU1snUHJvbWlzZSddO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEB0aGlzIHtQcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGZpbmFsbHlDb25zdHJ1Y3RvcihjYWxsYmFjaykge1xuXHRcdFx0dmFyIGNvbnN0cnVjdG9yID0gdGhpcy5jb25zdHJ1Y3Rvcjtcblx0XHRcdHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0cmV0dXJuIGNvbnN0cnVjdG9yLnJlc29sdmUoY2FsbGJhY2soKSkudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRyZXR1cm4gY29uc3RydWN0b3IucmVzb2x2ZShjYWxsYmFjaygpKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0cmV0dXJuIGNvbnN0cnVjdG9yLnJlamVjdChyZWFzb24pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRmdW5jdGlvbiBhbGxTZXR0bGVkKGFycikge1xuXHRcdFx0dmFyIFAgPSB0aGlzO1xuXHRcdFx0cmV0dXJuIG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblx0XHRcdFx0aWYgKCEoYXJyICYmIHR5cGVvZiBhcnIubGVuZ3RoICE9PSAndW5kZWZpbmVkJykpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVqZWN0KG5ldyBUeXBlRXJyb3IoX3R5cGVvZihhcnIpICsgJyAnICsgYXJyICsgJyBpcyBub3QgaXRlcmFibGUoY2Fubm90IHJlYWQgcHJvcGVydHkgU3ltYm9sKFN5bWJvbC5pdGVyYXRvcikpJykpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJyKTtcblx0XHRcdFx0aWYgKGFyZ3MubGVuZ3RoID09PSAwKSByZXR1cm4gcmVzb2x2ZShbXSk7XG5cdFx0XHRcdHZhciByZW1haW5pbmcgPSBhcmdzLmxlbmd0aDtcblx0XHRcdFx0ZnVuY3Rpb24gcmVzKGksIHZhbCkge1xuXHRcdFx0XHRcdGlmICh2YWwgJiYgKF90eXBlb2YodmFsKSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykpIHtcblx0XHRcdFx0XHRcdHZhciB0aGVuID0gdmFsLnRoZW47XG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIHRoZW4gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0dGhlbi5jYWxsKHZhbCwgZnVuY3Rpb24gKHZhbCkge1xuXHRcdFx0XHRcdFx0XHRcdHJlcyhpLCB2YWwpO1xuXHRcdFx0XHRcdFx0XHR9LCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHRcdFx0XHRcdGFyZ3NbaV0gPSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRzdGF0dXM6ICdyZWplY3RlZCcsXG5cdFx0XHRcdFx0XHRcdFx0XHRyZWFzb246IGVcblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdGlmICgtLXJlbWFpbmluZyA9PT0gMCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0cmVzb2x2ZShhcmdzKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGFyZ3NbaV0gPSB7XG5cdFx0XHRcdFx0XHRzdGF0dXM6ICdmdWxmaWxsZWQnLFxuXHRcdFx0XHRcdFx0dmFsdWU6IHZhbFxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0aWYgKC0tcmVtYWluaW5nID09PSAwKSB7XG5cdFx0XHRcdFx0XHRyZXNvbHZlKGFyZ3MpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRyZXMoaSwgYXJnc1tpXSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8vIFN0b3JlIHNldFRpbWVvdXQgcmVmZXJlbmNlIHNvIHByb21pc2UtcG9seWZpbGwgd2lsbCBiZSB1bmFmZmVjdGVkIGJ5XG5cdFx0Ly8gb3RoZXIgY29kZSBtb2RpZnlpbmcgc2V0VGltZW91dCAobGlrZSBzaW5vbi51c2VGYWtlVGltZXJzKCkpXG5cdFx0dmFyIHNldFRpbWVvdXRGdW5jID0gc2V0VGltZW91dDtcblx0XHRmdW5jdGlvbiBpc0FycmF5KHgpIHtcblx0XHRcdHJldHVybiBCb29sZWFuKHggJiYgdHlwZW9mIHgubGVuZ3RoICE9PSAndW5kZWZpbmVkJyk7XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5cdFx0Ly8gUG9seWZpbGwgZm9yIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kXG5cdFx0ZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0Zm4uYXBwbHkodGhpc0FyZywgYXJndW1lbnRzKTtcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQGNvbnN0cnVjdG9yXG5cdFx0ICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBQcm9taXNlKGZuKSB7XG5cdFx0XHRpZiAoISh0aGlzIGluc3RhbmNlb2YgUHJvbWlzZSkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Byb21pc2VzIG11c3QgYmUgY29uc3RydWN0ZWQgdmlhIG5ldycpO1xuXHRcdFx0aWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IFR5cGVFcnJvcignbm90IGEgZnVuY3Rpb24nKTtcblx0XHRcdC8qKiBAdHlwZSB7IW51bWJlcn0gKi9cblx0XHRcdHRoaXMuX3N0YXRlID0gMDtcblx0XHRcdC8qKiBAdHlwZSB7IWJvb2xlYW59ICovXG5cdFx0XHR0aGlzLl9oYW5kbGVkID0gZmFsc2U7XG5cdFx0XHQvKiogQHR5cGUge1Byb21pc2V8dW5kZWZpbmVkfSAqL1xuXHRcdFx0dGhpcy5fdmFsdWUgPSB1bmRlZmluZWQ7XG5cdFx0XHQvKiogQHR5cGUgeyFBcnJheTwhRnVuY3Rpb24+fSAqL1xuXHRcdFx0dGhpcy5fZGVmZXJyZWRzID0gW107XG5cdFx0XHRkb1Jlc29sdmUoZm4sIHRoaXMpO1xuXHRcdH1cblx0XHRmdW5jdGlvbiBoYW5kbGUoc2VsZiwgZGVmZXJyZWQpIHtcblx0XHRcdHdoaWxlIChzZWxmLl9zdGF0ZSA9PT0gMykge1xuXHRcdFx0XHRzZWxmID0gc2VsZi5fdmFsdWU7XG5cdFx0XHR9XG5cdFx0XHRpZiAoc2VsZi5fc3RhdGUgPT09IDApIHtcblx0XHRcdFx0c2VsZi5fZGVmZXJyZWRzLnB1c2goZGVmZXJyZWQpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRzZWxmLl9oYW5kbGVkID0gdHJ1ZTtcblx0XHRcdFByb21pc2UuX2ltbWVkaWF0ZUZuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0dmFyIGNiID0gc2VsZi5fc3RhdGUgPT09IDEgPyBkZWZlcnJlZC5vbkZ1bGZpbGxlZCA6IGRlZmVycmVkLm9uUmVqZWN0ZWQ7XG5cdFx0XHRcdGlmIChjYiA9PT0gbnVsbCkge1xuXHRcdFx0XHRcdChzZWxmLl9zdGF0ZSA9PT0gMSA/IHJlc29sdmUgOiByZWplY3QpKGRlZmVycmVkLnByb21pc2UsIHNlbGYuX3ZhbHVlKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIHJldDtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRyZXQgPSBjYihzZWxmLl92YWx1ZSk7XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRyZWplY3QoZGVmZXJyZWQucHJvbWlzZSwgZSk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJlc29sdmUoZGVmZXJyZWQucHJvbWlzZSwgcmV0KTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRmdW5jdGlvbiByZXNvbHZlKHNlbGYsIG5ld1ZhbHVlKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHQvLyBQcm9taXNlIFJlc29sdXRpb24gUHJvY2VkdXJlOiBodHRwczovL2dpdGh1Yi5jb20vcHJvbWlzZXMtYXBsdXMvcHJvbWlzZXMtc3BlYyN0aGUtcHJvbWlzZS1yZXNvbHV0aW9uLXByb2NlZHVyZVxuXHRcdFx0XHRpZiAobmV3VmFsdWUgPT09IHNlbGYpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0EgcHJvbWlzZSBjYW5ub3QgYmUgcmVzb2x2ZWQgd2l0aCBpdHNlbGYuJyk7XG5cdFx0XHRcdGlmIChuZXdWYWx1ZSAmJiAoX3R5cGVvZihuZXdWYWx1ZSkgPT09ICdvYmplY3QnIHx8IHR5cGVvZiBuZXdWYWx1ZSA9PT0gJ2Z1bmN0aW9uJykpIHtcblx0XHRcdFx0XHR2YXIgdGhlbiA9IG5ld1ZhbHVlLnRoZW47XG5cdFx0XHRcdFx0aWYgKG5ld1ZhbHVlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuXHRcdFx0XHRcdFx0c2VsZi5fc3RhdGUgPSAzO1xuXHRcdFx0XHRcdFx0c2VsZi5fdmFsdWUgPSBuZXdWYWx1ZTtcblx0XHRcdFx0XHRcdGZpbmFsZShzZWxmKTtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiB0aGVuID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRkb1Jlc29sdmUoYmluZCh0aGVuLCBuZXdWYWx1ZSksIHNlbGYpO1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRzZWxmLl9zdGF0ZSA9IDE7XG5cdFx0XHRcdHNlbGYuX3ZhbHVlID0gbmV3VmFsdWU7XG5cdFx0XHRcdGZpbmFsZShzZWxmKTtcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0cmVqZWN0KHNlbGYsIGUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRmdW5jdGlvbiByZWplY3Qoc2VsZiwgbmV3VmFsdWUpIHtcblx0XHRcdHNlbGYuX3N0YXRlID0gMjtcblx0XHRcdHNlbGYuX3ZhbHVlID0gbmV3VmFsdWU7XG5cdFx0XHRmaW5hbGUoc2VsZik7XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIGZpbmFsZShzZWxmKSB7XG5cdFx0XHRpZiAoc2VsZi5fc3RhdGUgPT09IDIgJiYgc2VsZi5fZGVmZXJyZWRzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRQcm9taXNlLl9pbW1lZGlhdGVGbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0aWYgKCFzZWxmLl9oYW5kbGVkKSB7XG5cdFx0XHRcdFx0XHRQcm9taXNlLl91bmhhbmRsZWRSZWplY3Rpb25GbihzZWxmLl92YWx1ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSBzZWxmLl9kZWZlcnJlZHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdFx0aGFuZGxlKHNlbGYsIHNlbGYuX2RlZmVycmVkc1tpXSk7XG5cdFx0XHR9XG5cdFx0XHRzZWxmLl9kZWZlcnJlZHMgPSBudWxsO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEBjb25zdHJ1Y3RvclxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIEhhbmRsZXIob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIHByb21pc2UpIHtcblx0XHRcdHRoaXMub25GdWxmaWxsZWQgPSB0eXBlb2Ygb25GdWxmaWxsZWQgPT09ICdmdW5jdGlvbicgPyBvbkZ1bGZpbGxlZCA6IG51bGw7XG5cdFx0XHR0aGlzLm9uUmVqZWN0ZWQgPSB0eXBlb2Ygb25SZWplY3RlZCA9PT0gJ2Z1bmN0aW9uJyA/IG9uUmVqZWN0ZWQgOiBudWxsO1xuXHRcdFx0dGhpcy5wcm9taXNlID0gcHJvbWlzZTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBUYWtlIGEgcG90ZW50aWFsbHkgbWlzYmVoYXZpbmcgcmVzb2x2ZXIgZnVuY3Rpb24gYW5kIG1ha2Ugc3VyZVxuXHRcdCAqIG9uRnVsZmlsbGVkIGFuZCBvblJlamVjdGVkIGFyZSBvbmx5IGNhbGxlZCBvbmNlLlxuXHRcdCAqXG5cdFx0ICogTWFrZXMgbm8gZ3VhcmFudGVlcyBhYm91dCBhc3luY2hyb255LlxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGRvUmVzb2x2ZShmbiwgc2VsZikge1xuXHRcdFx0dmFyIGRvbmUgPSBmYWxzZTtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGZuKGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdFx0XHRcdGlmIChkb25lKSByZXR1cm47XG5cdFx0XHRcdFx0ZG9uZSA9IHRydWU7XG5cdFx0XHRcdFx0cmVzb2x2ZShzZWxmLCB2YWx1ZSk7XG5cdFx0XHRcdH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcblx0XHRcdFx0XHRpZiAoZG9uZSkgcmV0dXJuO1xuXHRcdFx0XHRcdGRvbmUgPSB0cnVlO1xuXHRcdFx0XHRcdHJlamVjdChzZWxmLCByZWFzb24pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0gY2F0Y2ggKGV4KSB7XG5cdFx0XHRcdGlmIChkb25lKSByZXR1cm47XG5cdFx0XHRcdGRvbmUgPSB0cnVlO1xuXHRcdFx0XHRyZWplY3Qoc2VsZiwgZXgpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRQcm9taXNlLnByb3RvdHlwZVsnY2F0Y2gnXSA9IGZ1bmN0aW9uIChvblJlamVjdGVkKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy50aGVuKG51bGwsIG9uUmVqZWN0ZWQpO1xuXHRcdH07XG5cdFx0UHJvbWlzZS5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uIChvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkge1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0dmFyIHByb20gPSBuZXcgdGhpcy5jb25zdHJ1Y3Rvcihub29wKTtcblx0XHRcdGhhbmRsZSh0aGlzLCBuZXcgSGFuZGxlcihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgcHJvbSkpO1xuXHRcdFx0cmV0dXJuIHByb207XG5cdFx0fTtcblx0XHRQcm9taXNlLnByb3RvdHlwZVsnZmluYWxseSddID0gZmluYWxseUNvbnN0cnVjdG9yO1xuXHRcdFByb21pc2UuYWxsID0gZnVuY3Rpb24gKGFycikge1xuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblx0XHRcdFx0aWYgKCFpc0FycmF5KGFycikpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ1Byb21pc2UuYWxsIGFjY2VwdHMgYW4gYXJyYXknKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnIpO1xuXHRcdFx0XHRpZiAoYXJncy5sZW5ndGggPT09IDApIHJldHVybiByZXNvbHZlKFtdKTtcblx0XHRcdFx0dmFyIHJlbWFpbmluZyA9IGFyZ3MubGVuZ3RoO1xuXHRcdFx0XHRmdW5jdGlvbiByZXMoaSwgdmFsKSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGlmICh2YWwgJiYgKF90eXBlb2YodmFsKSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykpIHtcblx0XHRcdFx0XHRcdFx0dmFyIHRoZW4gPSB2YWwudGhlbjtcblx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiB0aGVuID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhlbi5jYWxsKHZhbCwgZnVuY3Rpb24gKHZhbCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0cmVzKGksIHZhbCk7XG5cdFx0XHRcdFx0XHRcdFx0fSwgcmVqZWN0KTtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGFyZ3NbaV0gPSB2YWw7XG5cdFx0XHRcdFx0XHRpZiAoLS1yZW1haW5pbmcgPT09IDApIHtcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZShhcmdzKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGNhdGNoIChleCkge1xuXHRcdFx0XHRcdFx0cmVqZWN0KGV4KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0cmVzKGksIGFyZ3NbaV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9O1xuXHRcdFByb21pc2UuYWxsU2V0dGxlZCA9IGFsbFNldHRsZWQ7XG5cdFx0UHJvbWlzZS5yZXNvbHZlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRpZiAodmFsdWUgJiYgX3R5cGVvZih2YWx1ZSkgPT09ICdvYmplY3QnICYmIHZhbHVlLmNvbnN0cnVjdG9yID09PSBQcm9taXNlKSB7XG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuXHRcdFx0XHRyZXNvbHZlKHZhbHVlKTtcblx0XHRcdH0pO1xuXHRcdH07XG5cdFx0UHJvbWlzZS5yZWplY3QgPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0XHRcdHJlamVjdCh2YWx1ZSk7XG5cdFx0XHR9KTtcblx0XHR9O1xuXHRcdFByb21pc2UucmFjZSA9IGZ1bmN0aW9uIChhcnIpIHtcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0XHRcdGlmICghaXNBcnJheShhcnIpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlamVjdChuZXcgVHlwZUVycm9yKCdQcm9taXNlLnJhY2UgYWNjZXB0cyBhbiBhcnJheScpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0gYXJyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRcdFx0UHJvbWlzZS5yZXNvbHZlKGFycltpXSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0Ly8gVXNlIHBvbHlmaWxsIGZvciBzZXRJbW1lZGlhdGUgZm9yIHBlcmZvcm1hbmNlIGdhaW5zXG5cdFx0UHJvbWlzZS5faW1tZWRpYXRlRm4gPVxuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0dHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBmdW5jdGlvbiAoZm4pIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c2V0SW1tZWRpYXRlKGZuKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSB8fCBmdW5jdGlvbiAoZm4pIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzZXRUaW1lb3V0RnVuYyhmbiwgMCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0UHJvbWlzZS5fdW5oYW5kbGVkUmVqZWN0aW9uRm4gPSBmdW5jdGlvbiBfdW5oYW5kbGVkUmVqZWN0aW9uRm4oZXJyKSB7XG5cdFx0XHRpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGUpIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKCdQb3NzaWJsZSBVbmhhbmRsZWQgUHJvbWlzZSBSZWplY3Rpb246JywgZXJyKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHByb21pc2VQb2x5ZmlsbC5leHBvcnRzID0gUHJvbWlzZTtcblx0fSkoKTtcblx0dmFyIF9Qcm9taXNlID0gcHJvbWlzZVBvbHlmaWxsLmV4cG9ydHM7XG5cblx0Ly8gUmVnaXN0ZXIgbG9nZ2luZyBjYWxsYmFja3Ncblx0ZnVuY3Rpb24gcmVnaXN0ZXJMb2dnaW5nQ2FsbGJhY2tzKG9iaikge1xuXHRcdHZhciBjYWxsYmFja05hbWVzID0gWydiZWdpbicsICdkb25lJywgJ2xvZycsICd0ZXN0U3RhcnQnLCAndGVzdERvbmUnLCAnbW9kdWxlU3RhcnQnLCAnbW9kdWxlRG9uZSddO1xuXHRcdGZ1bmN0aW9uIHJlZ2lzdGVyTG9nZ2luZ0NhbGxiYWNrKGtleSkge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uIGxvZ2dpbmdDYWxsYmFjayhjYWxsYmFjaykge1xuXHRcdFx0XHRpZiAodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdDYWxsYmFjayBwYXJhbWV0ZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uZmlnLmNhbGxiYWNrc1trZXldLnB1c2goY2FsbGJhY2spO1xuXHRcdFx0fTtcblx0XHR9XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja05hbWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIga2V5ID0gY2FsbGJhY2tOYW1lc1tpXTtcblxuXHRcdFx0Ly8gSW5pdGlhbGl6ZSBrZXkgY29sbGVjdGlvbiBvZiBsb2dnaW5nIGNhbGxiYWNrXG5cdFx0XHRpZiAodHlwZW9mIGNvbmZpZy5jYWxsYmFja3Nba2V5XSA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0Y29uZmlnLmNhbGxiYWNrc1trZXldID0gW107XG5cdFx0XHR9XG5cdFx0XHRvYmpba2V5XSA9IHJlZ2lzdGVyTG9nZ2luZ0NhbGxiYWNrKGtleSk7XG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIHJ1bkxvZ2dpbmdDYWxsYmFja3Moa2V5LCBhcmdzKSB7XG5cdFx0dmFyIGNhbGxiYWNrcyA9IGNvbmZpZy5jYWxsYmFja3Nba2V5XTtcblxuXHRcdC8vIEhhbmRsaW5nICdsb2cnIGNhbGxiYWNrcyBzZXBhcmF0ZWx5LiBVbmxpa2UgdGhlIG90aGVyIGNhbGxiYWNrcyxcblx0XHQvLyB0aGUgbG9nIGNhbGxiYWNrIGlzIG5vdCBjb250cm9sbGVkIGJ5IHRoZSBwcm9jZXNzaW5nIHF1ZXVlLFxuXHRcdC8vIGJ1dCByYXRoZXIgdXNlZCBieSBhc3NlcnRzLiBIZW5jZSB0byBwcm9taXNmeSB0aGUgJ2xvZycgY2FsbGJhY2tcblx0XHQvLyB3b3VsZCBtZWFuIHByb21pc2Z5aW5nIGVhY2ggc3RlcCBvZiBhIHRlc3Rcblx0XHRpZiAoa2V5ID09PSAnbG9nJykge1xuXHRcdFx0Y2FsbGJhY2tzLm1hcChmdW5jdGlvbiAoY2FsbGJhY2spIHtcblx0XHRcdFx0cmV0dXJuIGNhbGxiYWNrKGFyZ3MpO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gZW5zdXJlIHRoYXQgZWFjaCBjYWxsYmFjayBpcyBleGVjdXRlZCBzZXJpYWxseVxuXHRcdHZhciBwcm9taXNlQ2hhaW4gPSBfUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0Y2FsbGJhY2tzLmZvckVhY2goZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG5cdFx0XHRwcm9taXNlQ2hhaW4gPSBwcm9taXNlQ2hhaW4udGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiBfUHJvbWlzZS5yZXNvbHZlKGNhbGxiYWNrKGFyZ3MpKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHRcdHJldHVybiBwcm9taXNlQ2hhaW47XG5cdH1cblxuXHR2YXIgcHJpb3JpdHlDb3VudCA9IDA7XG5cdHZhciB1bml0U2FtcGxlcjtcblxuXHQvLyBUaGlzIGlzIGEgcXVldWUgb2YgZnVuY3Rpb25zIHRoYXQgYXJlIHRhc2tzIHdpdGhpbiBhIHNpbmdsZSB0ZXN0LlxuXHQvLyBBZnRlciB0ZXN0cyBhcmUgZGVxdWV1ZWQgZnJvbSBjb25maWcucXVldWUgdGhleSBhcmUgZXhwYW5kZWQgaW50b1xuXHQvLyBhIHNldCBvZiB0YXNrcyBpbiB0aGlzIHF1ZXVlLlxuXHR2YXIgdGFza1F1ZXVlID0gW107XG5cblx0LyoqXG5cdCAqIEFkdmFuY2VzIHRoZSB0YXNrUXVldWUgdG8gdGhlIG5leHQgdGFzay4gSWYgdGhlIHRhc2tRdWV1ZSBpcyBlbXB0eSxcblx0ICogcHJvY2VzcyB0aGUgdGVzdFF1ZXVlXG5cdCAqL1xuXHRmdW5jdGlvbiBhZHZhbmNlKCkge1xuXHRcdGFkdmFuY2VUYXNrUXVldWUoKTtcblx0XHRpZiAoIXRhc2tRdWV1ZS5sZW5ndGggJiYgIWNvbmZpZy5ibG9ja2luZyAmJiAhY29uZmlnLmN1cnJlbnQpIHtcblx0XHRcdGFkdmFuY2VUZXN0UXVldWUoKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQWR2YW5jZXMgdGhlIHRhc2tRdWV1ZSB3aXRoIGFuIGluY3JlYXNlZCBkZXB0aFxuXHQgKi9cblx0ZnVuY3Rpb24gYWR2YW5jZVRhc2tRdWV1ZSgpIHtcblx0XHR2YXIgc3RhcnQgPSBwZXJmb3JtYW5jZS5ub3coKTtcblx0XHRjb25maWcuZGVwdGggPSAoY29uZmlnLmRlcHRoIHx8IDApICsgMTtcblx0XHRwcm9jZXNzVGFza1F1ZXVlKHN0YXJ0KTtcblx0XHRjb25maWcuZGVwdGgtLTtcblx0fVxuXG5cdC8qKlxuXHQgKiBQcm9jZXNzIHRoZSBmaXJzdCB0YXNrIG9uIHRoZSB0YXNrUXVldWUgYXMgYSBwcm9taXNlLlxuXHQgKiBFYWNoIHRhc2sgaXMgYSBmdW5jdGlvbiBhZGRlZCBieSBUZXN0I3F1ZXVlKCkgaW4gL3NyYy90ZXN0LmpzXG5cdCAqL1xuXHRmdW5jdGlvbiBwcm9jZXNzVGFza1F1ZXVlKHN0YXJ0KSB7XG5cdFx0aWYgKHRhc2tRdWV1ZS5sZW5ndGggJiYgIWNvbmZpZy5ibG9ja2luZykge1xuXHRcdFx0dmFyIGVsYXBzZWRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCkgLSBzdGFydDtcblxuXHRcdFx0Ly8gVGhlIHVwZGF0ZVJhdGUgZW5zdXJlcyB0aGF0IGEgdXNlciBpbnRlcmZhY2UgKEhUTUwgUmVwb3J0ZXIpIGNhbiBiZSB1cGRhdGVkXG5cdFx0XHQvLyBhdCBsZWFzdCBvbmNlIGV2ZXJ5IHNlY29uZC4gVGhpcyBjYW4gYWxzbyBwcmV2ZW50IGJyb3dzZXJzIGZyb20gcHJvbXB0aW5nXG5cdFx0XHQvLyBhIHdhcm5pbmcgYWJvdXQgbG9uZyBydW5uaW5nIHNjcmlwdHMuXG5cdFx0XHRpZiAoIXNldFRpbWVvdXQkMSB8fCBjb25maWcudXBkYXRlUmF0ZSA8PSAwIHx8IGVsYXBzZWRUaW1lIDwgY29uZmlnLnVwZGF0ZVJhdGUpIHtcblx0XHRcdFx0dmFyIHRhc2sgPSB0YXNrUXVldWUuc2hpZnQoKTtcblx0XHRcdFx0X1Byb21pc2UucmVzb2x2ZSh0YXNrKCkpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGlmICghdGFza1F1ZXVlLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0YWR2YW5jZSgpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRwcm9jZXNzVGFza1F1ZXVlKHN0YXJ0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2V0VGltZW91dCQxKGFkdmFuY2UpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBBZHZhbmNlIHRoZSB0ZXN0UXVldWUgdG8gdGhlIG5leHQgdGVzdCB0byBwcm9jZXNzLiBDYWxsIGRvbmUoKSBpZiB0ZXN0UXVldWUgY29tcGxldGVzLlxuXHQgKi9cblx0ZnVuY3Rpb24gYWR2YW5jZVRlc3RRdWV1ZSgpIHtcblx0XHRpZiAoIWNvbmZpZy5ibG9ja2luZyAmJiAhY29uZmlnLnF1ZXVlLmxlbmd0aCAmJiBjb25maWcuZGVwdGggPT09IDApIHtcblx0XHRcdGRvbmUoKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dmFyIHRlc3RUYXNrcyA9IGNvbmZpZy5xdWV1ZS5zaGlmdCgpO1xuXHRcdGFkZFRvVGFza1F1ZXVlKHRlc3RUYXNrcygpKTtcblx0XHRpZiAocHJpb3JpdHlDb3VudCA+IDApIHtcblx0XHRcdHByaW9yaXR5Q291bnQtLTtcblx0XHR9XG5cdFx0YWR2YW5jZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEVucXVldWUgdGhlIHRhc2tzIGZvciBhIHRlc3QgaW50byB0aGUgdGFzayBxdWV1ZS5cblx0ICogQHBhcmFtIHtBcnJheX0gdGFza3NBcnJheVxuXHQgKi9cblx0ZnVuY3Rpb24gYWRkVG9UYXNrUXVldWUodGFza3NBcnJheSkge1xuXHRcdHRhc2tRdWV1ZS5wdXNoLmFwcGx5KHRhc2tRdWV1ZSwgX3RvQ29uc3VtYWJsZUFycmF5KHRhc2tzQXJyYXkpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gdGhlIG51bWJlciBvZiB0YXNrcyByZW1haW5pbmcgaW4gdGhlIHRhc2sgcXVldWUgdG8gYmUgcHJvY2Vzc2VkLlxuXHQgKiBAcmV0dXJuIHtudW1iZXJ9XG5cdCAqL1xuXHRmdW5jdGlvbiB0YXNrUXVldWVMZW5ndGgoKSB7XG5cdFx0cmV0dXJuIHRhc2tRdWV1ZS5sZW5ndGg7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhIHRlc3QgdG8gdGhlIFRlc3RRdWV1ZSBmb3IgZXhlY3V0aW9uLlxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSB0ZXN0VGFza3NGdW5jXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gcHJpb3JpdGl6ZVxuXHQgKiBAcGFyYW0ge3N0cmluZ30gc2VlZFxuXHQgKi9cblx0ZnVuY3Rpb24gYWRkVG9UZXN0UXVldWUodGVzdFRhc2tzRnVuYywgcHJpb3JpdGl6ZSwgc2VlZCkge1xuXHRcdGlmIChwcmlvcml0aXplKSB7XG5cdFx0XHRjb25maWcucXVldWUuc3BsaWNlKHByaW9yaXR5Q291bnQrKywgMCwgdGVzdFRhc2tzRnVuYyk7XG5cdFx0fSBlbHNlIGlmIChzZWVkKSB7XG5cdFx0XHRpZiAoIXVuaXRTYW1wbGVyKSB7XG5cdFx0XHRcdHVuaXRTYW1wbGVyID0gdW5pdFNhbXBsZXJHZW5lcmF0b3Ioc2VlZCk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEluc2VydCBpbnRvIGEgcmFuZG9tIHBvc2l0aW9uIGFmdGVyIGFsbCBwcmlvcml0aXplZCBpdGVtc1xuXHRcdFx0dmFyIGluZGV4ID0gTWF0aC5mbG9vcih1bml0U2FtcGxlcigpICogKGNvbmZpZy5xdWV1ZS5sZW5ndGggLSBwcmlvcml0eUNvdW50ICsgMSkpO1xuXHRcdFx0Y29uZmlnLnF1ZXVlLnNwbGljZShwcmlvcml0eUNvdW50ICsgaW5kZXgsIDAsIHRlc3RUYXNrc0Z1bmMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25maWcucXVldWUucHVzaCh0ZXN0VGFza3NGdW5jKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHNlZWRlZCBcInNhbXBsZVwiIGdlbmVyYXRvciB3aGljaCBpcyB1c2VkIGZvciByYW5kb21pemluZyB0ZXN0cy5cblx0ICovXG5cdGZ1bmN0aW9uIHVuaXRTYW1wbGVyR2VuZXJhdG9yKHNlZWQpIHtcblx0XHQvLyAzMi1iaXQgeG9yc2hpZnQsIHJlcXVpcmVzIG9ubHkgYSBub256ZXJvIHNlZWRcblx0XHQvLyBodHRwczovL2V4Y2FtZXJhLmNvbS9zcGhpbngvYXJ0aWNsZS14b3JzaGlmdC5odG1sXG5cdFx0dmFyIHNhbXBsZSA9IHBhcnNlSW50KGdlbmVyYXRlSGFzaChzZWVkKSwgMTYpIHx8IC0xO1xuXHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRzYW1wbGUgXj0gc2FtcGxlIDw8IDEzO1xuXHRcdFx0c2FtcGxlIF49IHNhbXBsZSA+Pj4gMTc7XG5cdFx0XHRzYW1wbGUgXj0gc2FtcGxlIDw8IDU7XG5cblx0XHRcdC8vIEVDTUFTY3JpcHQgaGFzIG5vIHVuc2lnbmVkIG51bWJlciB0eXBlXG5cdFx0XHRpZiAoc2FtcGxlIDwgMCkge1xuXHRcdFx0XHRzYW1wbGUgKz0gMHgxMDAwMDAwMDA7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gc2FtcGxlIC8gMHgxMDAwMDAwMDA7XG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aGVuIHRoZSBQcm9jZXNzaW5nUXVldWUgaXMgZG9uZSBwcm9jZXNzaW5nIGFsbFxuXHQgKiBpdGVtcy4gSXQgaGFuZGxlcyBlbWl0dGluZyB0aGUgZmluYWwgcnVuIGV2ZW50cy5cblx0ICovXG5cdGZ1bmN0aW9uIGRvbmUoKSB7XG5cdFx0Ly8gV2UgaGF2ZSByZWFjaGVkIHRoZSBlbmQgb2YgdGhlIHByb2Nlc3NpbmcgcXVldWUgYW5kIGFyZSBhYm91dCB0byBlbWl0IHRoZVxuXHRcdC8vIFwicnVuRW5kXCIgZXZlbnQgYWZ0ZXIgd2hpY2ggcmVwb3J0ZXJzIHR5cGljYWxseSBzdG9wIGxpc3RlbmluZyBhbmQgZXhpdFxuXHRcdC8vIHRoZSBwcm9jZXNzLiBGaXJzdCwgY2hlY2sgaWYgd2UgbmVlZCB0byBlbWl0IG9uZSBmaW5hbCB0ZXN0LlxuXHRcdGlmIChjb25maWcuc3RhdHMudGVzdENvdW50ID09PSAwICYmIGNvbmZpZy5mYWlsT25aZXJvVGVzdHMgPT09IHRydWUpIHtcblx0XHRcdHZhciBlcnJvcjtcblx0XHRcdGlmIChjb25maWcuZmlsdGVyICYmIGNvbmZpZy5maWx0ZXIubGVuZ3RoKSB7XG5cdFx0XHRcdGVycm9yID0gbmV3IEVycm9yKFwiTm8gdGVzdHMgbWF0Y2hlZCB0aGUgZmlsdGVyIFxcXCJcIi5jb25jYXQoY29uZmlnLmZpbHRlciwgXCJcXFwiLlwiKSk7XG5cdFx0XHR9IGVsc2UgaWYgKGNvbmZpZy5tb2R1bGUgJiYgY29uZmlnLm1vZHVsZS5sZW5ndGgpIHtcblx0XHRcdFx0ZXJyb3IgPSBuZXcgRXJyb3IoXCJObyB0ZXN0cyBtYXRjaGVkIHRoZSBtb2R1bGUgXFxcIlwiLmNvbmNhdChjb25maWcubW9kdWxlLCBcIlxcXCIuXCIpKTtcblx0XHRcdH0gZWxzZSBpZiAoY29uZmlnLm1vZHVsZUlkICYmIGNvbmZpZy5tb2R1bGVJZC5sZW5ndGgpIHtcblx0XHRcdFx0ZXJyb3IgPSBuZXcgRXJyb3IoXCJObyB0ZXN0cyBtYXRjaGVkIHRoZSBtb2R1bGVJZCBcXFwiXCIuY29uY2F0KGNvbmZpZy5tb2R1bGVJZCwgXCJcXFwiLlwiKSk7XG5cdFx0XHR9IGVsc2UgaWYgKGNvbmZpZy50ZXN0SWQgJiYgY29uZmlnLnRlc3RJZC5sZW5ndGgpIHtcblx0XHRcdFx0ZXJyb3IgPSBuZXcgRXJyb3IoXCJObyB0ZXN0cyBtYXRjaGVkIHRoZSB0ZXN0SWQgXFxcIlwiLmNvbmNhdChjb25maWcudGVzdElkLCBcIlxcXCIuXCIpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGVycm9yID0gbmV3IEVycm9yKCdObyB0ZXN0cyB3ZXJlIHJ1bi4nKTtcblx0XHRcdH1cblx0XHRcdHRlc3QoJ2dsb2JhbCBmYWlsdXJlJywgZXh0ZW5kKGZ1bmN0aW9uIChhc3NlcnQpIHtcblx0XHRcdFx0YXNzZXJ0LnB1c2hSZXN1bHQoe1xuXHRcdFx0XHRcdHJlc3VsdDogZmFsc2UsXG5cdFx0XHRcdFx0bWVzc2FnZTogZXJyb3IubWVzc2FnZSxcblx0XHRcdFx0XHRzb3VyY2U6IGVycm9yLnN0YWNrXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSwge1xuXHRcdFx0XHR2YWxpZFRlc3Q6IHRydWVcblx0XHRcdH0pKTtcblxuXHRcdFx0Ly8gV2UgZG8gbmVlZCB0byBjYWxsIGBhZHZhbmNlKClgIGluIG9yZGVyIHRvIHJlc3VtZSB0aGUgcHJvY2Vzc2luZyBxdWV1ZS5cblx0XHRcdC8vIE9uY2UgdGhpcyBuZXcgdGVzdCBpcyBmaW5pc2hlZCBwcm9jZXNzaW5nLCB3ZSdsbCByZWFjaCBgZG9uZWAgYWdhaW4sIGFuZFxuXHRcdFx0Ly8gdGhhdCB0aW1lIHRoZSBhYm92ZSBjb25kaXRpb24gd2lsbCBldmFsdWF0ZSB0byBmYWxzZS5cblx0XHRcdGFkdmFuY2UoKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dmFyIHN0b3JhZ2UgPSBjb25maWcuc3RvcmFnZTtcblx0XHR2YXIgcnVudGltZSA9IE1hdGgucm91bmQocGVyZm9ybWFuY2Uubm93KCkgLSBjb25maWcuc3RhcnRlZCk7XG5cdFx0dmFyIHBhc3NlZCA9IGNvbmZpZy5zdGF0cy5hbGwgLSBjb25maWcuc3RhdHMuYmFkO1xuXHRcdFByb2Nlc3NpbmdRdWV1ZS5maW5pc2hlZCA9IHRydWU7XG5cdFx0ZW1pdCgncnVuRW5kJywgcnVuU3VpdGUuZW5kKHRydWUpKTtcblx0XHRydW5Mb2dnaW5nQ2FsbGJhY2tzKCdkb25lJywge1xuXHRcdFx0Ly8gQGRlcHJlY2F0ZWQgc2luY2UgMi4xOS4wIFVzZSBkb25lKCkgd2l0aG91dCBgZGV0YWlsc2AgcGFyYW1ldGVyLFxuXHRcdFx0Ly8gb3IgdXNlIGBRVW5pdC5vbigncnVuRW5kJylgIGluc3RlYWQuIFBhcmFtZXRlciB0byBiZSByZXBsYWNlZCBpblxuXHRcdFx0Ly8gUVVuaXQgMy4wIHdpdGggdGVzdCBjb3VudHMuXG5cdFx0XHRwYXNzZWQ6IHBhc3NlZCxcblx0XHRcdGZhaWxlZDogY29uZmlnLnN0YXRzLmJhZCxcblx0XHRcdHRvdGFsOiBjb25maWcuc3RhdHMuYWxsLFxuXHRcdFx0cnVudGltZTogcnVudGltZVxuXHRcdH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0Ly8gQ2xlYXIgb3duIHN0b3JhZ2UgaXRlbXMgaWYgYWxsIHRlc3RzIHBhc3NlZFxuXHRcdFx0aWYgKHN0b3JhZ2UgJiYgY29uZmlnLnN0YXRzLmJhZCA9PT0gMCkge1xuXHRcdFx0XHRmb3IgKHZhciBpID0gc3RvcmFnZS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHRcdFx0XHRcdHZhciBrZXkgPSBzdG9yYWdlLmtleShpKTtcblx0XHRcdFx0XHRpZiAoa2V5LmluZGV4T2YoJ3F1bml0LXRlc3QtJykgPT09IDApIHtcblx0XHRcdFx0XHRcdHN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHZhciBQcm9jZXNzaW5nUXVldWUgPSB7XG5cdFx0ZmluaXNoZWQ6IGZhbHNlLFxuXHRcdGFkZDogYWRkVG9UZXN0UXVldWUsXG5cdFx0YWR2YW5jZTogYWR2YW5jZSxcblx0XHR0YXNrQ291bnQ6IHRhc2tRdWV1ZUxlbmd0aFxuXHR9O1xuXG5cdHZhciBUZXN0UmVwb3J0ID0gLyojX19QVVJFX18qL2Z1bmN0aW9uICgpIHtcblx0XHRmdW5jdGlvbiBUZXN0UmVwb3J0KG5hbWUsIHN1aXRlLCBvcHRpb25zKSB7XG5cdFx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgVGVzdFJlcG9ydCk7XG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lO1xuXHRcdFx0dGhpcy5zdWl0ZU5hbWUgPSBzdWl0ZS5uYW1lO1xuXHRcdFx0dGhpcy5mdWxsTmFtZSA9IHN1aXRlLmZ1bGxOYW1lLmNvbmNhdChuYW1lKTtcblx0XHRcdHRoaXMucnVudGltZSA9IDA7XG5cdFx0XHR0aGlzLmFzc2VydGlvbnMgPSBbXTtcblx0XHRcdHRoaXMuc2tpcHBlZCA9ICEhb3B0aW9ucy5za2lwO1xuXHRcdFx0dGhpcy50b2RvID0gISFvcHRpb25zLnRvZG87XG5cdFx0XHR0aGlzLnZhbGlkID0gb3B0aW9ucy52YWxpZDtcblx0XHRcdHRoaXMuX3N0YXJ0VGltZSA9IDA7XG5cdFx0XHR0aGlzLl9lbmRUaW1lID0gMDtcblx0XHRcdHN1aXRlLnB1c2hUZXN0KHRoaXMpO1xuXHRcdH1cblx0XHRfY3JlYXRlQ2xhc3MoVGVzdFJlcG9ydCwgW3tcblx0XHRcdGtleTogXCJzdGFydFwiLFxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIHN0YXJ0KHJlY29yZFRpbWUpIHtcblx0XHRcdFx0aWYgKHJlY29yZFRpbWUpIHtcblx0XHRcdFx0XHR0aGlzLl9zdGFydFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdG5hbWU6IHRoaXMubmFtZSxcblx0XHRcdFx0XHRzdWl0ZU5hbWU6IHRoaXMuc3VpdGVOYW1lLFxuXHRcdFx0XHRcdGZ1bGxOYW1lOiB0aGlzLmZ1bGxOYW1lLnNsaWNlKClcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRrZXk6IFwiZW5kXCIsXG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24gZW5kKHJlY29yZFRpbWUpIHtcblx0XHRcdFx0aWYgKHJlY29yZFRpbWUpIHtcblx0XHRcdFx0XHR0aGlzLl9lbmRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGV4dGVuZCh0aGlzLnN0YXJ0KCksIHtcblx0XHRcdFx0XHRydW50aW1lOiB0aGlzLmdldFJ1bnRpbWUoKSxcblx0XHRcdFx0XHRzdGF0dXM6IHRoaXMuZ2V0U3RhdHVzKCksXG5cdFx0XHRcdFx0ZXJyb3JzOiB0aGlzLmdldEZhaWxlZEFzc2VydGlvbnMoKSxcblx0XHRcdFx0XHRhc3NlcnRpb25zOiB0aGlzLmdldEFzc2VydGlvbnMoKVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRrZXk6IFwicHVzaEFzc2VydGlvblwiLFxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIHB1c2hBc3NlcnRpb24oYXNzZXJ0aW9uKSB7XG5cdFx0XHRcdHRoaXMuYXNzZXJ0aW9ucy5wdXNoKGFzc2VydGlvbik7XG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0a2V5OiBcImdldFJ1bnRpbWVcIixcblx0XHRcdHZhbHVlOiBmdW5jdGlvbiBnZXRSdW50aW1lKCkge1xuXHRcdFx0XHRyZXR1cm4gTWF0aC5yb3VuZCh0aGlzLl9lbmRUaW1lIC0gdGhpcy5fc3RhcnRUaW1lKTtcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRrZXk6IFwiZ2V0U3RhdHVzXCIsXG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24gZ2V0U3RhdHVzKCkge1xuXHRcdFx0XHRpZiAodGhpcy5za2lwcGVkKSB7XG5cdFx0XHRcdFx0cmV0dXJuICdza2lwcGVkJztcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgdGVzdFBhc3NlZCA9IHRoaXMuZ2V0RmFpbGVkQXNzZXJ0aW9ucygpLmxlbmd0aCA+IDAgPyB0aGlzLnRvZG8gOiAhdGhpcy50b2RvO1xuXHRcdFx0XHRpZiAoIXRlc3RQYXNzZWQpIHtcblx0XHRcdFx0XHRyZXR1cm4gJ2ZhaWxlZCc7XG5cdFx0XHRcdH0gZWxzZSBpZiAodGhpcy50b2RvKSB7XG5cdFx0XHRcdFx0cmV0dXJuICd0b2RvJztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gJ3Bhc3NlZCc7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRrZXk6IFwiZ2V0RmFpbGVkQXNzZXJ0aW9uc1wiLFxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIGdldEZhaWxlZEFzc2VydGlvbnMoKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmFzc2VydGlvbnMuZmlsdGVyKGZ1bmN0aW9uIChhc3NlcnRpb24pIHtcblx0XHRcdFx0XHRyZXR1cm4gIWFzc2VydGlvbi5wYXNzZWQ7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdGtleTogXCJnZXRBc3NlcnRpb25zXCIsXG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24gZ2V0QXNzZXJ0aW9ucygpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuYXNzZXJ0aW9ucy5zbGljZSgpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBSZW1vdmUgYWN0dWFsIGFuZCBleHBlY3RlZCB2YWx1ZXMgZnJvbSBhc3NlcnRpb25zLiBUaGlzIGlzIHRvIHByZXZlbnRcblx0XHRcdC8vIGxlYWtpbmcgbWVtb3J5IHRocm91Z2hvdXQgYSB0ZXN0IHN1aXRlLlxuXHRcdH0sIHtcblx0XHRcdGtleTogXCJzbGltQXNzZXJ0aW9uc1wiLFxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIHNsaW1Bc3NlcnRpb25zKCkge1xuXHRcdFx0XHR0aGlzLmFzc2VydGlvbnMgPSB0aGlzLmFzc2VydGlvbnMubWFwKGZ1bmN0aW9uIChhc3NlcnRpb24pIHtcblx0XHRcdFx0XHRkZWxldGUgYXNzZXJ0aW9uLmFjdHVhbDtcblx0XHRcdFx0XHRkZWxldGUgYXNzZXJ0aW9uLmV4cGVjdGVkO1xuXHRcdFx0XHRcdHJldHVybiBhc3NlcnRpb247XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1dKTtcblx0XHRyZXR1cm4gVGVzdFJlcG9ydDtcblx0fSgpO1xuXG5cdGZ1bmN0aW9uIFRlc3Qoc2V0dGluZ3MpIHtcblx0XHR0aGlzLmV4cGVjdGVkID0gbnVsbDtcblx0XHR0aGlzLmFzc2VydGlvbnMgPSBbXTtcblx0XHR0aGlzLm1vZHVsZSA9IGNvbmZpZy5jdXJyZW50TW9kdWxlO1xuXHRcdHRoaXMuc3RlcHMgPSBbXTtcblx0XHR0aGlzLnRpbWVvdXQgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5kYXRhID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMud2l0aERhdGEgPSBmYWxzZTtcblx0XHR0aGlzLnBhdXNlcyA9IG5ldyBTdHJpbmdNYXAoKTtcblx0XHR0aGlzLm5leHRQYXVzZUlkID0gMTtcblxuXHRcdC8vIEZvciB0aGUgbW9zdCBjb21tb24gY2FzZSwgd2UgaGF2ZTpcblx0XHQvLyAtIDA6IG5ldyBUZXN0XG5cdFx0Ly8gLSAxOiBhZGRUZXN0XG5cdFx0Ly8gLSAyOiBRVW5pdC50ZXN0XG5cdFx0Ly8gLSAzOiB1c2VyIGZpbGVcblx0XHQvL1xuXHRcdC8vIFRoaXMgbmVlZHMgaXMgY3VzdG9taXNlZCBieSB0ZXN0LmVhY2goKVxuXHRcdHRoaXMuc3RhY2tPZmZzZXQgPSAzO1xuXHRcdGV4dGVuZCh0aGlzLCBzZXR0aW5ncyk7XG5cblx0XHQvLyBJZiBhIG1vZHVsZSBpcyBza2lwcGVkLCBhbGwgaXRzIHRlc3RzIGFuZCB0aGUgdGVzdHMgb2YgdGhlIGNoaWxkIHN1aXRlc1xuXHRcdC8vIHNob3VsZCBiZSB0cmVhdGVkIGFzIHNraXBwZWQgZXZlbiBpZiB0aGV5IGFyZSBkZWZpbmVkIGFzIGBvbmx5YCBvciBgdG9kb2AuXG5cdFx0Ly8gQXMgZm9yIGB0b2RvYCBtb2R1bGUsIGFsbCBpdHMgdGVzdHMgd2lsbCBiZSB0cmVhdGVkIGFzIGB0b2RvYCBleGNlcHQgZm9yXG5cdFx0Ly8gdGVzdHMgZGVmaW5lZCBhcyBgc2tpcGAgd2hpY2ggd2lsbCBiZSBsZWZ0IGludGFjdC5cblx0XHQvL1xuXHRcdC8vIFNvLCBpZiBhIHRlc3QgaXMgZGVmaW5lZCBhcyBgdG9kb2AgYW5kIGlzIGluc2lkZSBhIHNraXBwZWQgbW9kdWxlLCB3ZSBzaG91bGRcblx0XHQvLyB0aGVuIHRyZWF0IHRoYXQgdGVzdCBhcyBpZiB3YXMgZGVmaW5lZCBhcyBgc2tpcGAuXG5cdFx0aWYgKHRoaXMubW9kdWxlLnNraXApIHtcblx0XHRcdHRoaXMuc2tpcCA9IHRydWU7XG5cdFx0XHR0aGlzLnRvZG8gPSBmYWxzZTtcblxuXHRcdFx0Ly8gU2tpcHBlZCB0ZXN0cyBzaG91bGQgYmUgbGVmdCBpbnRhY3Rcblx0XHR9IGVsc2UgaWYgKHRoaXMubW9kdWxlLnRvZG8gJiYgIXRoaXMuc2tpcCkge1xuXHRcdFx0dGhpcy50b2RvID0gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBRdWV1aW5nIGEgbGF0ZSB0ZXN0IGFmdGVyIHRoZSBydW4gaGFzIGVuZGVkIGlzIG5vdCBhbGxvd2VkLlxuXHRcdC8vIFRoaXMgd2FzIG9uY2Ugc3VwcG9ydGVkIGZvciBpbnRlcm5hbCB1c2UgYnkgUVVuaXQub25FcnJvcigpLlxuXHRcdC8vIFJlZiBodHRwczovL2dpdGh1Yi5jb20vcXVuaXRqcy9xdW5pdC9pc3N1ZXMvMTM3N1xuXHRcdGlmIChQcm9jZXNzaW5nUXVldWUuZmluaXNoZWQpIHtcblx0XHRcdC8vIFVzaW5nIHRoaXMgZm9yIGFueXRoaW5nIG90aGVyIHRoYW4gb25FcnJvcigpLCBzdWNoIGFzIHRlc3RpbmcgaW4gUVVuaXQuZG9uZSgpLFxuXHRcdFx0Ly8gaXMgdW5zdGFibGUgYW5kIHdpbGwgbGlrZWx5IHJlc3VsdCBpbiB0aGUgYWRkZWQgdGVzdHMgYmVpbmcgaWdub3JlZCBieSBDSS5cblx0XHRcdC8vIChNZWFuaW5nIHRoZSBDSSBwYXNzZXMgaXJyZWdhcmRsZXNzIG9mIHRoZSBhZGRlZCB0ZXN0cykuXG5cdFx0XHQvL1xuXHRcdFx0Ly8gVE9ETzogTWFrZSB0aGlzIGFuIGVycm9yIGluIFFVbml0IDMuMFxuXHRcdFx0Ly8gdGhyb3cgbmV3IEVycm9yKCBcIlVuZXhwZWN0ZWQgdGVzdCBhZnRlciBydW5FbmRcIiApO1xuXHRcdFx0TG9nZ2VyLndhcm4oJ1VuZXhwZWN0ZWQgdGVzdCBhZnRlciBydW5FbmQuIFRoaXMgaXMgdW5zdGFibGUgYW5kIHdpbGwgZmFpbCBpbiBRVW5pdCAzLjAuJyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmICghdGhpcy5za2lwICYmIHR5cGVvZiB0aGlzLmNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHR2YXIgbWV0aG9kID0gdGhpcy50b2RvID8gJ1FVbml0LnRvZG8nIDogJ1FVbml0LnRlc3QnO1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihcIllvdSBtdXN0IHByb3ZpZGUgYSBjYWxsYmFjayB0byBcIi5jb25jYXQobWV0aG9kLCBcIihcXFwiXCIpLmNvbmNhdCh0aGlzLnRlc3ROYW1lLCBcIlxcXCIpXCIpKTtcblx0XHR9XG5cblx0XHQvLyBSZWdpc3RlciB1bmlxdWUgc3RyaW5nc1xuXHRcdGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5tb2R1bGUudGVzdHM7IGkgPCBsLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAodGhpcy5tb2R1bGUudGVzdHNbaV0ubmFtZSA9PT0gdGhpcy50ZXN0TmFtZSkge1xuXHRcdFx0XHR0aGlzLnRlc3ROYW1lICs9ICcgJztcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy50ZXN0SWQgPSBnZW5lcmF0ZUhhc2godGhpcy5tb2R1bGUubmFtZSwgdGhpcy50ZXN0TmFtZSk7XG5cblx0XHQvLyBObyB2YWxpZGF0aW9uIGFmdGVyIHRoaXMuIEJleW9uZCB0aGlzIHBvaW50LCBmYWlsdXJlcyBtdXN0IGJlIHJlY29yZGVkIGFzXG5cdFx0Ly8gYSBjb21wbGV0ZWQgdGVzdCB3aXRoIGVycm9ycywgaW5zdGVhZCBvZiBlYXJseSBiYWlsIG91dC5cblx0XHQvLyBPdGhlcndpc2UsIGludGVybmFscyBtYXkgYmUgbGVmdCBpbiBhbiBpbmNvbnNpc3RlbnQgc3RhdGUuXG5cdFx0Ly8gUmVmIGh0dHBzOi8vZ2l0aHViLmNvbS9xdW5pdGpzL3F1bml0L2lzc3Vlcy8xNTE0XG5cblx0XHQrK1Rlc3QuY291bnQ7XG5cdFx0dGhpcy5lcnJvckZvclN0YWNrID0gbmV3IEVycm9yKCk7XG5cdFx0aWYgKHRoaXMuY2FsbGJhY2sgJiYgdGhpcy5jYWxsYmFjay52YWxpZFRlc3QpIHtcblx0XHRcdC8vIE9taXQgdGhlIHRlc3QtbGV2ZWwgdHJhY2UgZm9yIHRoZSBpbnRlcm5hbCBcIk5vIHRlc3RzXCIgdGVzdCBmYWlsdXJlLFxuXHRcdFx0Ly8gVGhlcmUgaXMgYWxyZWFkeSBhbiBhc3NlcnRpb24tbGV2ZWwgdHJhY2UsIGFuZCB0aGF0J3Mgbm9pc3kgZW5vdWdoXG5cdFx0XHQvLyBhcyBpdCBpcy5cblx0XHRcdHRoaXMuZXJyb3JGb3JTdGFjay5zdGFjayA9IHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0dGhpcy50ZXN0UmVwb3J0ID0gbmV3IFRlc3RSZXBvcnQodGhpcy50ZXN0TmFtZSwgdGhpcy5tb2R1bGUuc3VpdGVSZXBvcnQsIHtcblx0XHRcdHRvZG86IHRoaXMudG9kbyxcblx0XHRcdHNraXA6IHRoaXMuc2tpcCxcblx0XHRcdHZhbGlkOiB0aGlzLnZhbGlkKClcblx0XHR9KTtcblx0XHR0aGlzLm1vZHVsZS50ZXN0cy5wdXNoKHtcblx0XHRcdG5hbWU6IHRoaXMudGVzdE5hbWUsXG5cdFx0XHR0ZXN0SWQ6IHRoaXMudGVzdElkLFxuXHRcdFx0c2tpcDogISF0aGlzLnNraXBcblx0XHR9KTtcblx0XHRpZiAodGhpcy5za2lwKSB7XG5cdFx0XHQvLyBTa2lwcGVkIHRlc3RzIHdpbGwgZnVsbHkgaWdub3JlIGFueSBzZW50IGNhbGxiYWNrXG5cdFx0XHR0aGlzLmNhbGxiYWNrID0gZnVuY3Rpb24gKCkge307XG5cdFx0XHR0aGlzLmFzeW5jID0gZmFsc2U7XG5cdFx0XHR0aGlzLmV4cGVjdGVkID0gMDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5hc3NlcnQgPSBuZXcgQXNzZXJ0KHRoaXMpO1xuXHRcdH1cblx0fVxuXHRUZXN0LmNvdW50ID0gMDtcblx0ZnVuY3Rpb24gZ2V0Tm90U3RhcnRlZE1vZHVsZXMoc3RhcnRNb2R1bGUpIHtcblx0XHR2YXIgbW9kdWxlID0gc3RhcnRNb2R1bGU7XG5cdFx0dmFyIG1vZHVsZXMgPSBbXTtcblx0XHR3aGlsZSAobW9kdWxlICYmIG1vZHVsZS50ZXN0c1J1biA9PT0gMCkge1xuXHRcdFx0bW9kdWxlcy5wdXNoKG1vZHVsZSk7XG5cdFx0XHRtb2R1bGUgPSBtb2R1bGUucGFyZW50TW9kdWxlO1xuXHRcdH1cblxuXHRcdC8vIFRoZSBhYm92ZSBwdXNoIG1vZHVsZXMgZnJvbSB0aGUgY2hpbGQgdG8gdGhlIHBhcmVudFxuXHRcdC8vIHJldHVybiBhIHJldmVyc2VkIG9yZGVyIHdpdGggdGhlIHRvcCBiZWluZyB0aGUgdG9wIG1vc3QgcGFyZW50IG1vZHVsZVxuXHRcdHJldHVybiBtb2R1bGVzLnJldmVyc2UoKTtcblx0fVxuXHRUZXN0LnByb3RvdHlwZSA9IHtcblx0XHQvLyBVc2UgYSBnZXR0ZXIgdG8gYXZvaWQgY29tcHV0aW5nIGEgc3RhY2sgdHJhY2UgKHdoaWNoIGNhbiBiZSBleHBlbnNpdmUpLFxuXHRcdC8vIFRoaXMgaXMgZGlzcGxheWVkIGJ5IHRoZSBIVE1MIFJlcG9ydGVyLCBidXQgbW9zdCBvdGhlciBpbnRlZ3JhdGlvbnMgZG9cblx0XHQvLyBub3QgYWNjZXNzIGl0LlxuXHRcdGdldCBzdGFjaygpIHtcblx0XHRcdHJldHVybiBleHRyYWN0U3RhY2t0cmFjZSh0aGlzLmVycm9yRm9yU3RhY2ssIHRoaXMuc3RhY2tPZmZzZXQpO1xuXHRcdH0sXG5cdFx0YmVmb3JlOiBmdW5jdGlvbiBiZWZvcmUoKSB7XG5cdFx0XHR2YXIgX3RoaXMgPSB0aGlzO1xuXHRcdFx0dmFyIG1vZHVsZSA9IHRoaXMubW9kdWxlO1xuXHRcdFx0dmFyIG5vdFN0YXJ0ZWRNb2R1bGVzID0gZ2V0Tm90U3RhcnRlZE1vZHVsZXMobW9kdWxlKTtcblxuXHRcdFx0Ly8gZW5zdXJlIHRoZSBjYWxsYmFja3MgYXJlIGV4ZWN1dGVkIHNlcmlhbGx5IGZvciBlYWNoIG1vZHVsZVxuXHRcdFx0dmFyIG1vZHVsZVN0YXJ0Q2hhaW4gPSBfUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0XHRub3RTdGFydGVkTW9kdWxlcy5mb3JFYWNoKGZ1bmN0aW9uIChzdGFydE1vZHVsZSkge1xuXHRcdFx0XHRtb2R1bGVTdGFydENoYWluID0gbW9kdWxlU3RhcnRDaGFpbi50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRzdGFydE1vZHVsZS5zdGF0cyA9IHtcblx0XHRcdFx0XHRcdGFsbDogMCxcblx0XHRcdFx0XHRcdGJhZDogMCxcblx0XHRcdFx0XHRcdHN0YXJ0ZWQ6IHBlcmZvcm1hbmNlLm5vdygpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRlbWl0KCdzdWl0ZVN0YXJ0Jywgc3RhcnRNb2R1bGUuc3VpdGVSZXBvcnQuc3RhcnQodHJ1ZSkpO1xuXHRcdFx0XHRcdHJldHVybiBydW5Mb2dnaW5nQ2FsbGJhY2tzKCdtb2R1bGVTdGFydCcsIHtcblx0XHRcdFx0XHRcdG5hbWU6IHN0YXJ0TW9kdWxlLm5hbWUsXG5cdFx0XHRcdFx0XHR0ZXN0czogc3RhcnRNb2R1bGUudGVzdHNcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBtb2R1bGVTdGFydENoYWluLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRjb25maWcuY3VycmVudCA9IF90aGlzO1xuXHRcdFx0XHRfdGhpcy50ZXN0RW52aXJvbm1lbnQgPSBleHRlbmQoe30sIG1vZHVsZS50ZXN0RW52aXJvbm1lbnQpO1xuXHRcdFx0XHRfdGhpcy5zdGFydGVkID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cdFx0XHRcdGVtaXQoJ3Rlc3RTdGFydCcsIF90aGlzLnRlc3RSZXBvcnQuc3RhcnQodHJ1ZSkpO1xuXHRcdFx0XHRyZXR1cm4gcnVuTG9nZ2luZ0NhbGxiYWNrcygndGVzdFN0YXJ0Jywge1xuXHRcdFx0XHRcdG5hbWU6IF90aGlzLnRlc3ROYW1lLFxuXHRcdFx0XHRcdG1vZHVsZTogbW9kdWxlLm5hbWUsXG5cdFx0XHRcdFx0dGVzdElkOiBfdGhpcy50ZXN0SWQsXG5cdFx0XHRcdFx0cHJldmlvdXNGYWlsdXJlOiBfdGhpcy5wcmV2aW91c0ZhaWx1cmVcblx0XHRcdFx0fSkudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0aWYgKCFjb25maWcucG9sbHV0aW9uKSB7XG5cdFx0XHRcdFx0XHRzYXZlR2xvYmFsKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0cnVuOiBmdW5jdGlvbiBydW4oKSB7XG5cdFx0XHRjb25maWcuY3VycmVudCA9IHRoaXM7XG5cdFx0XHRpZiAoY29uZmlnLm5vdHJ5Y2F0Y2gpIHtcblx0XHRcdFx0cnVuVGVzdCh0aGlzKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0cnVuVGVzdCh0aGlzKTtcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0dGhpcy5wdXNoRmFpbHVyZSgnRGllZCBvbiB0ZXN0ICMnICsgKHRoaXMuYXNzZXJ0aW9ucy5sZW5ndGggKyAxKSArICc6ICcgKyAoZS5tZXNzYWdlIHx8IGUpICsgJ1xcbicgKyB0aGlzLnN0YWNrLCBleHRyYWN0U3RhY2t0cmFjZShlLCAwKSk7XG5cblx0XHRcdFx0Ly8gRWxzZSBuZXh0IHRlc3Qgd2lsbCBjYXJyeSB0aGUgcmVzcG9uc2liaWxpdHlcblx0XHRcdFx0c2F2ZUdsb2JhbCgpO1xuXG5cdFx0XHRcdC8vIFJlc3RhcnQgdGhlIHRlc3RzIGlmIHRoZXkncmUgYmxvY2tpbmdcblx0XHRcdFx0aWYgKGNvbmZpZy5ibG9ja2luZykge1xuXHRcdFx0XHRcdGludGVybmFsUmVjb3Zlcih0aGlzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZnVuY3Rpb24gcnVuVGVzdCh0ZXN0KSB7XG5cdFx0XHRcdHZhciBwcm9taXNlO1xuXHRcdFx0XHRpZiAodGVzdC53aXRoRGF0YSkge1xuXHRcdFx0XHRcdHByb21pc2UgPSB0ZXN0LmNhbGxiYWNrLmNhbGwodGVzdC50ZXN0RW52aXJvbm1lbnQsIHRlc3QuYXNzZXJ0LCB0ZXN0LmRhdGEpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHByb21pc2UgPSB0ZXN0LmNhbGxiYWNrLmNhbGwodGVzdC50ZXN0RW52aXJvbm1lbnQsIHRlc3QuYXNzZXJ0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0ZXN0LnJlc29sdmVQcm9taXNlKHByb21pc2UpO1xuXG5cdFx0XHRcdC8vIElmIHRoZSB0ZXN0IGhhcyBhbiBhc3luYyBcInBhdXNlXCIgb24gaXQsIGJ1dCB0aGUgdGltZW91dCBpcyAwLCB0aGVuIHdlIHB1c2ggYVxuXHRcdFx0XHQvLyBmYWlsdXJlIGFzIHRoZSB0ZXN0IHNob3VsZCBiZSBzeW5jaHJvbm91cy5cblx0XHRcdFx0aWYgKHRlc3QudGltZW91dCA9PT0gMCAmJiB0ZXN0LnBhdXNlcy5zaXplID4gMCkge1xuXHRcdFx0XHRcdHB1c2hGYWlsdXJlKCdUZXN0IGRpZCBub3QgZmluaXNoIHN5bmNocm9ub3VzbHkgZXZlbiB0aG91Z2ggYXNzZXJ0LnRpbWVvdXQoIDAgKSB3YXMgdXNlZC4nLCBzb3VyY2VGcm9tU3RhY2t0cmFjZSgyKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdGFmdGVyOiBmdW5jdGlvbiBhZnRlcigpIHtcblx0XHRcdGNoZWNrUG9sbHV0aW9uKCk7XG5cdFx0fSxcblx0XHRxdWV1ZUdsb2JhbEhvb2s6IGZ1bmN0aW9uIHF1ZXVlR2xvYmFsSG9vayhob29rLCBob29rTmFtZSkge1xuXHRcdFx0dmFyIF90aGlzMiA9IHRoaXM7XG5cdFx0XHR2YXIgcnVuSG9vayA9IGZ1bmN0aW9uIHJ1bkhvb2soKSB7XG5cdFx0XHRcdGNvbmZpZy5jdXJyZW50ID0gX3RoaXMyO1xuXHRcdFx0XHR2YXIgcHJvbWlzZTtcblx0XHRcdFx0aWYgKGNvbmZpZy5ub3RyeWNhdGNoKSB7XG5cdFx0XHRcdFx0cHJvbWlzZSA9IGhvb2suY2FsbChfdGhpczIudGVzdEVudmlyb25tZW50LCBfdGhpczIuYXNzZXJ0KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0cHJvbWlzZSA9IGhvb2suY2FsbChfdGhpczIudGVzdEVudmlyb25tZW50LCBfdGhpczIuYXNzZXJ0KTtcblx0XHRcdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdFx0X3RoaXMyLnB1c2hGYWlsdXJlKCdHbG9iYWwgJyArIGhvb2tOYW1lICsgJyBmYWlsZWQgb24gJyArIF90aGlzMi50ZXN0TmFtZSArICc6ICcgKyBlcnJvclN0cmluZyhlcnJvciksIGV4dHJhY3RTdGFja3RyYWNlKGVycm9yLCAwKSk7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdF90aGlzMi5yZXNvbHZlUHJvbWlzZShwcm9taXNlLCBob29rTmFtZSk7XG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIHJ1bkhvb2s7XG5cdFx0fSxcblx0XHRxdWV1ZUhvb2s6IGZ1bmN0aW9uIHF1ZXVlSG9vayhob29rLCBob29rTmFtZSwgaG9va093bmVyKSB7XG5cdFx0XHR2YXIgX3RoaXMzID0gdGhpcztcblx0XHRcdHZhciBjYWxsSG9vayA9IGZ1bmN0aW9uIGNhbGxIb29rKCkge1xuXHRcdFx0XHR2YXIgcHJvbWlzZSA9IGhvb2suY2FsbChfdGhpczMudGVzdEVudmlyb25tZW50LCBfdGhpczMuYXNzZXJ0KTtcblx0XHRcdFx0X3RoaXMzLnJlc29sdmVQcm9taXNlKHByb21pc2UsIGhvb2tOYW1lKTtcblx0XHRcdH07XG5cdFx0XHR2YXIgcnVuSG9vayA9IGZ1bmN0aW9uIHJ1bkhvb2soKSB7XG5cdFx0XHRcdGlmIChob29rTmFtZSA9PT0gJ2JlZm9yZScpIHtcblx0XHRcdFx0XHRpZiAoaG9va093bmVyLnRlc3RzUnVuICE9PSAwKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdF90aGlzMy5wcmVzZXJ2ZUVudmlyb25tZW50ID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFRoZSAnYWZ0ZXInIGhvb2sgc2hvdWxkIG9ubHkgZXhlY3V0ZSB3aGVuIHRoZXJlIGFyZSBub3QgdGVzdHMgbGVmdCBhbmRcblx0XHRcdFx0Ly8gd2hlbiB0aGUgJ2FmdGVyJyBhbmQgJ2ZpbmlzaCcgdGFza3MgYXJlIHRoZSBvbmx5IHRhc2tzIGxlZnQgdG8gcHJvY2Vzc1xuXHRcdFx0XHRpZiAoaG9va05hbWUgPT09ICdhZnRlcicgJiYgIWxhc3RUZXN0V2l0aGluTW9kdWxlRXhlY3V0ZWQoaG9va093bmVyKSAmJiAoY29uZmlnLnF1ZXVlLmxlbmd0aCA+IDAgfHwgUHJvY2Vzc2luZ1F1ZXVlLnRhc2tDb3VudCgpID4gMikpIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uZmlnLmN1cnJlbnQgPSBfdGhpczM7XG5cdFx0XHRcdGlmIChjb25maWcubm90cnljYXRjaCkge1xuXHRcdFx0XHRcdGNhbGxIb29rKCk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0Ly8gVGhpcyB0cnktYmxvY2sgaW5jbHVkZXMgdGhlIGluZGlyZWN0IGNhbGwgdG8gcmVzb2x2ZVByb21pc2UsIHdoaWNoIHNob3VsZG4ndFxuXHRcdFx0XHRcdC8vIGhhdmUgdG8gYmUgaW5zaWRlIHRyeS1jYXRjaC4gQnV0LCBzaW5jZSB3ZSBzdXBwb3J0IGFueSB1c2VyLXByb3ZpZGVkIHRoZW5hYmxlXG5cdFx0XHRcdFx0Ly8gb2JqZWN0LCB0aGUgdGhlbmFibGUgbWlnaHQgdGhyb3cgaW4gc29tZSB1bmV4cGVjdGVkIHdheS5cblx0XHRcdFx0XHQvLyBUaGlzIHN1YnRsZSBiZWhhdmlvdXIgaXMgdW5kb2N1bWVudGVkLiBUbyBhdm9pZCBuZXcgZmFpbHVyZXMgaW4gbWlub3IgcmVsZWFzZXNcblx0XHRcdFx0XHQvLyB3ZSB3aWxsIG5vdCBjaGFuZ2UgdGhpcyB1bnRpbCBRVW5pdCAzLlxuXHRcdFx0XHRcdC8vIFRPRE86IEluIFFVbml0IDMsIHJlZHVjZSB0aGlzIHRyeS1ibG9jayB0byBqdXN0IGhvb2suY2FsbCgpLCBtYXRjaGluZ1xuXHRcdFx0XHRcdC8vIHRoZSBzaW1wbGljaXR5IG9mIHF1ZXVlR2xvYmFsSG9vay5cblx0XHRcdFx0XHRjYWxsSG9vaygpO1xuXHRcdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdF90aGlzMy5wdXNoRmFpbHVyZShob29rTmFtZSArICcgZmFpbGVkIG9uICcgKyBfdGhpczMudGVzdE5hbWUgKyAnOiAnICsgKGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IpLCBleHRyYWN0U3RhY2t0cmFjZShlcnJvciwgMCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIHJ1bkhvb2s7XG5cdFx0fSxcblx0XHQvLyBDdXJyZW50bHkgb25seSB1c2VkIGZvciBtb2R1bGUgbGV2ZWwgaG9va3MsIGNhbiBiZSB1c2VkIHRvIGFkZCBnbG9iYWwgbGV2ZWwgb25lc1xuXHRcdGhvb2tzOiBmdW5jdGlvbiBob29rcyhoYW5kbGVyKSB7XG5cdFx0XHR2YXIgaG9va3MgPSBbXTtcblx0XHRcdGZ1bmN0aW9uIHByb2Nlc3NHbG9iYWxob29rcyh0ZXN0KSB7XG5cdFx0XHRcdGlmICgoaGFuZGxlciA9PT0gJ2JlZm9yZUVhY2gnIHx8IGhhbmRsZXIgPT09ICdhZnRlckVhY2gnKSAmJiBjb25maWcuZ2xvYmFsSG9va3NbaGFuZGxlcl0pIHtcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGNvbmZpZy5nbG9iYWxIb29rc1toYW5kbGVyXS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0aG9va3MucHVzaCh0ZXN0LnF1ZXVlR2xvYmFsSG9vayhjb25maWcuZ2xvYmFsSG9va3NbaGFuZGxlcl1baV0sIGhhbmRsZXIpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGZ1bmN0aW9uIHByb2Nlc3NIb29rcyh0ZXN0LCBtb2R1bGUpIHtcblx0XHRcdFx0aWYgKG1vZHVsZS5wYXJlbnRNb2R1bGUpIHtcblx0XHRcdFx0XHRwcm9jZXNzSG9va3ModGVzdCwgbW9kdWxlLnBhcmVudE1vZHVsZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG1vZHVsZS5ob29rc1toYW5kbGVyXS5sZW5ndGgpIHtcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1vZHVsZS5ob29rc1toYW5kbGVyXS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0aG9va3MucHVzaCh0ZXN0LnF1ZXVlSG9vayhtb2R1bGUuaG9va3NbaGFuZGxlcl1baV0sIGhhbmRsZXIsIG1vZHVsZSkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBIb29rcyBhcmUgaWdub3JlZCBvbiBza2lwcGVkIHRlc3RzXG5cdFx0XHRpZiAoIXRoaXMuc2tpcCkge1xuXHRcdFx0XHRwcm9jZXNzR2xvYmFsaG9va3ModGhpcyk7XG5cdFx0XHRcdHByb2Nlc3NIb29rcyh0aGlzLCB0aGlzLm1vZHVsZSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gaG9va3M7XG5cdFx0fSxcblx0XHRmaW5pc2g6IGZ1bmN0aW9uIGZpbmlzaCgpIHtcblx0XHRcdGNvbmZpZy5jdXJyZW50ID0gdGhpcztcblxuXHRcdFx0Ly8gUmVsZWFzZSB0aGUgdGltZW91dCBhbmQgdGltZW91dCBjYWxsYmFjayByZWZlcmVuY2VzIHRvIGJlIGdhcmJhZ2UgY29sbGVjdGVkLlxuXHRcdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL3F1bml0anMvcXVuaXQvcHVsbC8xNzA4XG5cdFx0XHRpZiAoc2V0VGltZW91dCQxKSB7XG5cdFx0XHRcdGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xuXHRcdFx0XHRjb25maWcudGltZW91dEhhbmRsZXIgPSBudWxsO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBSZWxlYXNlIHRoZSB0ZXN0IGNhbGxiYWNrIHRvIGVuc3VyZSB0aGF0IGFueXRoaW5nIHJlZmVyZW5jZWQgaGFzIGJlZW5cblx0XHRcdC8vIHJlbGVhc2VkIHRvIGJlIGdhcmJhZ2UgY29sbGVjdGVkLlxuXHRcdFx0dGhpcy5jYWxsYmFjayA9IHVuZGVmaW5lZDtcblx0XHRcdGlmICh0aGlzLnN0ZXBzLmxlbmd0aCkge1xuXHRcdFx0XHR2YXIgc3RlcHNMaXN0ID0gdGhpcy5zdGVwcy5qb2luKCcsICcpO1xuXHRcdFx0XHR0aGlzLnB1c2hGYWlsdXJlKCdFeHBlY3RlZCBhc3NlcnQudmVyaWZ5U3RlcHMoKSB0byBiZSBjYWxsZWQgYmVmb3JlIGVuZCBvZiB0ZXN0ICcgKyBcImFmdGVyIHVzaW5nIGFzc2VydC5zdGVwKCkuIFVudmVyaWZpZWQgc3RlcHM6IFwiLmNvbmNhdChzdGVwc0xpc3QpLCB0aGlzLnN0YWNrKTtcblx0XHRcdH1cblx0XHRcdGlmIChjb25maWcucmVxdWlyZUV4cGVjdHMgJiYgdGhpcy5leHBlY3RlZCA9PT0gbnVsbCkge1xuXHRcdFx0XHR0aGlzLnB1c2hGYWlsdXJlKCdFeHBlY3RlZCBudW1iZXIgb2YgYXNzZXJ0aW9ucyB0byBiZSBkZWZpbmVkLCBidXQgZXhwZWN0KCkgd2FzICcgKyAnbm90IGNhbGxlZC4nLCB0aGlzLnN0YWNrKTtcblx0XHRcdH0gZWxzZSBpZiAodGhpcy5leHBlY3RlZCAhPT0gbnVsbCAmJiB0aGlzLmV4cGVjdGVkICE9PSB0aGlzLmFzc2VydGlvbnMubGVuZ3RoKSB7XG5cdFx0XHRcdHRoaXMucHVzaEZhaWx1cmUoJ0V4cGVjdGVkICcgKyB0aGlzLmV4cGVjdGVkICsgJyBhc3NlcnRpb25zLCBidXQgJyArIHRoaXMuYXNzZXJ0aW9ucy5sZW5ndGggKyAnIHdlcmUgcnVuJywgdGhpcy5zdGFjayk7XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMuZXhwZWN0ZWQgPT09IG51bGwgJiYgIXRoaXMuYXNzZXJ0aW9ucy5sZW5ndGgpIHtcblx0XHRcdFx0dGhpcy5wdXNoRmFpbHVyZSgnRXhwZWN0ZWQgYXQgbGVhc3Qgb25lIGFzc2VydGlvbiwgYnV0IG5vbmUgd2VyZSBydW4gLSBjYWxsICcgKyAnZXhwZWN0KDApIHRvIGFjY2VwdCB6ZXJvIGFzc2VydGlvbnMuJywgdGhpcy5zdGFjayk7XG5cdFx0XHR9XG5cdFx0XHR2YXIgbW9kdWxlID0gdGhpcy5tb2R1bGU7XG5cdFx0XHR2YXIgbW9kdWxlTmFtZSA9IG1vZHVsZS5uYW1lO1xuXHRcdFx0dmFyIHRlc3ROYW1lID0gdGhpcy50ZXN0TmFtZTtcblx0XHRcdHZhciBza2lwcGVkID0gISF0aGlzLnNraXA7XG5cdFx0XHR2YXIgdG9kbyA9ICEhdGhpcy50b2RvO1xuXHRcdFx0dmFyIGJhZCA9IDA7XG5cdFx0XHR2YXIgc3RvcmFnZSA9IGNvbmZpZy5zdG9yYWdlO1xuXHRcdFx0dGhpcy5ydW50aW1lID0gTWF0aC5yb3VuZChwZXJmb3JtYW5jZS5ub3coKSAtIHRoaXMuc3RhcnRlZCk7XG5cdFx0XHRjb25maWcuc3RhdHMuYWxsICs9IHRoaXMuYXNzZXJ0aW9ucy5sZW5ndGg7XG5cdFx0XHRjb25maWcuc3RhdHMudGVzdENvdW50ICs9IDE7XG5cdFx0XHRtb2R1bGUuc3RhdHMuYWxsICs9IHRoaXMuYXNzZXJ0aW9ucy5sZW5ndGg7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYXNzZXJ0aW9ucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHQvLyBBIGZhaWxpbmcgYXNzZXJ0aW9uIHdpbGwgY291bnRzIHRvd2FyZCB0aGUgSFRNTCBSZXBvcnRlcidzXG5cdFx0XHRcdC8vIFwiWCBhc3NlcnRpb25zLCBZIGZhaWxlZFwiIGxpbmUgZXZlbiBpZiBpdCB3YXMgaW5zaWRlIGEgdG9kby5cblx0XHRcdFx0Ly8gSW52ZXJ0aW5nIHRoaXMgd291bGQgYmUgc2ltaWxhcmx5IGNvbmZ1c2luZyBzaW5jZSBhbGwgYnV0IHRoZSBsYXN0XG5cdFx0XHRcdC8vIHBhc3NpbmcgYXNzZXJ0aW9uIGluc2lkZSBhIHRvZG8gdGVzdCBzaG91bGQgYmUgY29uc2lkZXJlZCBhcyBnb29kLlxuXHRcdFx0XHQvLyBUaGVzZSBzdGF0cyBkb24ndCBkZWNpZGUgdGhlIG91dGNvbWUgb2YgYW55dGhpbmcsIHNvIGNvdW50aW5nIHRoZW1cblx0XHRcdFx0Ly8gYXMgZmFpbGluZyBzZWVtcyB0aGUgbW9zdCBpbnR1aXRpdmUuXG5cdFx0XHRcdGlmICghdGhpcy5hc3NlcnRpb25zW2ldLnJlc3VsdCkge1xuXHRcdFx0XHRcdGJhZCsrO1xuXHRcdFx0XHRcdGNvbmZpZy5zdGF0cy5iYWQrKztcblx0XHRcdFx0XHRtb2R1bGUuc3RhdHMuYmFkKys7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChza2lwcGVkKSB7XG5cdFx0XHRcdGluY3JlbWVudFRlc3RzSWdub3JlZChtb2R1bGUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aW5jcmVtZW50VGVzdHNSdW4obW9kdWxlKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gU3RvcmUgcmVzdWx0IHdoZW4gcG9zc2libGUuXG5cdFx0XHQvLyBOb3RlIHRoYXQgdGhpcyBhbHNvIG1hcmtzIHRvZG8gdGVzdHMgYXMgYmFkLCB0aHVzIHRoZXkgZ2V0IGhvaXN0ZWQsXG5cdFx0XHQvLyBhbmQgYWx3YXlzIHJ1biBmaXJzdCBvbiByZWZyZXNoLlxuXHRcdFx0aWYgKHN0b3JhZ2UpIHtcblx0XHRcdFx0aWYgKGJhZCkge1xuXHRcdFx0XHRcdHN0b3JhZ2Uuc2V0SXRlbSgncXVuaXQtdGVzdC0nICsgbW9kdWxlTmFtZSArICctJyArIHRlc3ROYW1lLCBiYWQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHN0b3JhZ2UucmVtb3ZlSXRlbSgncXVuaXQtdGVzdC0nICsgbW9kdWxlTmFtZSArICctJyArIHRlc3ROYW1lKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBBZnRlciBlbWl0dGluZyB0aGUganMtcmVwb3J0ZXJzIGV2ZW50IHdlIGNsZWFudXAgdGhlIGFzc2VydGlvbiBkYXRhIHRvXG5cdFx0XHQvLyBhdm9pZCBsZWFraW5nIGl0LiBJdCBpcyBub3QgdXNlZCBieSB0aGUgbGVnYWN5IHRlc3REb25lIGNhbGxiYWNrcy5cblx0XHRcdGVtaXQoJ3Rlc3RFbmQnLCB0aGlzLnRlc3RSZXBvcnQuZW5kKHRydWUpKTtcblx0XHRcdHRoaXMudGVzdFJlcG9ydC5zbGltQXNzZXJ0aW9ucygpO1xuXHRcdFx0dmFyIHRlc3QgPSB0aGlzO1xuXHRcdFx0cmV0dXJuIHJ1bkxvZ2dpbmdDYWxsYmFja3MoJ3Rlc3REb25lJywge1xuXHRcdFx0XHRuYW1lOiB0ZXN0TmFtZSxcblx0XHRcdFx0bW9kdWxlOiBtb2R1bGVOYW1lLFxuXHRcdFx0XHRza2lwcGVkOiBza2lwcGVkLFxuXHRcdFx0XHR0b2RvOiB0b2RvLFxuXHRcdFx0XHRmYWlsZWQ6IGJhZCxcblx0XHRcdFx0cGFzc2VkOiB0aGlzLmFzc2VydGlvbnMubGVuZ3RoIC0gYmFkLFxuXHRcdFx0XHR0b3RhbDogdGhpcy5hc3NlcnRpb25zLmxlbmd0aCxcblx0XHRcdFx0cnVudGltZTogc2tpcHBlZCA/IDAgOiB0aGlzLnJ1bnRpbWUsXG5cdFx0XHRcdC8vIEhUTUwgUmVwb3J0ZXIgdXNlXG5cdFx0XHRcdGFzc2VydGlvbnM6IHRoaXMuYXNzZXJ0aW9ucyxcblx0XHRcdFx0dGVzdElkOiB0aGlzLnRlc3RJZCxcblx0XHRcdFx0Ly8gU291cmNlIG9mIFRlc3Rcblx0XHRcdFx0Ly8gZ2VuZXJhdGluZyBzdGFjayB0cmFjZSBpcyBleHBlbnNpdmUsIHNvIHVzaW5nIGEgZ2V0dGVyIHdpbGwgaGVscCBkZWZlciB0aGlzIHVudGlsIHdlIG5lZWQgaXRcblx0XHRcdFx0Z2V0IHNvdXJjZSgpIHtcblx0XHRcdFx0XHRyZXR1cm4gdGVzdC5zdGFjaztcblx0XHRcdFx0fVxuXHRcdFx0fSkudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGlmIChhbGxUZXN0c0V4ZWN1dGVkKG1vZHVsZSkpIHtcblx0XHRcdFx0XHR2YXIgY29tcGxldGVkTW9kdWxlcyA9IFttb2R1bGVdO1xuXG5cdFx0XHRcdFx0Ly8gQ2hlY2sgaWYgdGhlIHBhcmVudCBtb2R1bGVzLCBpdGVyYXRpdmVseSwgYXJlIGRvbmUuIElmIHRoYXQgdGhlIGNhc2UsXG5cdFx0XHRcdFx0Ly8gd2UgZW1pdCB0aGUgYHN1aXRlRW5kYCBldmVudCBhbmQgdHJpZ2dlciBgbW9kdWxlRG9uZWAgY2FsbGJhY2suXG5cdFx0XHRcdFx0dmFyIHBhcmVudCA9IG1vZHVsZS5wYXJlbnRNb2R1bGU7XG5cdFx0XHRcdFx0d2hpbGUgKHBhcmVudCAmJiBhbGxUZXN0c0V4ZWN1dGVkKHBhcmVudCkpIHtcblx0XHRcdFx0XHRcdGNvbXBsZXRlZE1vZHVsZXMucHVzaChwYXJlbnQpO1xuXHRcdFx0XHRcdFx0cGFyZW50ID0gcGFyZW50LnBhcmVudE1vZHVsZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dmFyIG1vZHVsZURvbmVDaGFpbiA9IF9Qcm9taXNlLnJlc29sdmUoKTtcblx0XHRcdFx0XHRjb21wbGV0ZWRNb2R1bGVzLmZvckVhY2goZnVuY3Rpb24gKGNvbXBsZXRlZE1vZHVsZSkge1xuXHRcdFx0XHRcdFx0bW9kdWxlRG9uZUNoYWluID0gbW9kdWxlRG9uZUNoYWluLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbG9nU3VpdGVFbmQoY29tcGxldGVkTW9kdWxlKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdHJldHVybiBtb2R1bGVEb25lQ2hhaW47XG5cdFx0XHRcdH1cblx0XHRcdH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRjb25maWcuY3VycmVudCA9IHVuZGVmaW5lZDtcblx0XHRcdH0pO1xuXHRcdFx0ZnVuY3Rpb24gbG9nU3VpdGVFbmQobW9kdWxlKSB7XG5cdFx0XHRcdC8vIFJlc2V0IGBtb2R1bGUuaG9va3NgIHRvIGVuc3VyZSB0aGF0IGFueXRoaW5nIHJlZmVyZW5jZWQgaW4gdGhlc2UgaG9va3Ncblx0XHRcdFx0Ly8gaGFzIGJlZW4gcmVsZWFzZWQgdG8gYmUgZ2FyYmFnZSBjb2xsZWN0ZWQuIERlc2NlbmRhbnQgbW9kdWxlcyB0aGF0IHdlcmVcblx0XHRcdFx0Ly8gZW50aXJlbHkgc2tpcHBlZCwgZS5nLiBkdWUgdG8gZmlsdGVyaW5nLCB3aWxsIG5ldmVyIGhhdmUgdGhpcyBtZXRob2Rcblx0XHRcdFx0Ly8gY2FsbGVkIGZvciB0aGVtLCBidXQgbWlnaHQgaGF2ZSBob29rcyB3aXRoIHJlZmVyZW5jZXMgcGlubmluZyBkYXRhIGluXG5cdFx0XHRcdC8vIG1lbW9yeSAoZXZlbiBpZiB0aGUgaG9va3Mgd2VyZW4ndCBhY3R1YWxseSBleGVjdXRlZCksIHNvIHdlIHJlc2V0IHRoZVxuXHRcdFx0XHQvLyBob29rcyBvbiBhbGwgZGVzY2VuZGFudCBtb2R1bGVzIGhlcmUgYXMgd2VsbC4gVGhpcyBpcyBzYWZlIGJlY2F1c2Ugd2Vcblx0XHRcdFx0Ly8gd2lsbCBuZXZlciBjYWxsIHRoaXMgYXMgbG9uZyBhcyBhbnkgZGVzY2VuZGFudCBtb2R1bGVzIHN0aWxsIGhhdmUgdGVzdHNcblx0XHRcdFx0Ly8gdG8gcnVuLiBUaGlzIGFsc28gbWVhbnMgdGhhdCBpbiBtdWx0aS10aWVyZWQgbmVzdGluZyBzY2VuYXJpb3Mgd2UgbWlnaHRcblx0XHRcdFx0Ly8gcmVzZXQgdGhlIGhvb2tzIG11bHRpcGxlIHRpbWVzIG9uIHNvbWUgbW9kdWxlcywgYnV0IHRoYXQncyBoYXJtbGVzcy5cblx0XHRcdFx0dmFyIG1vZHVsZXMgPSBbbW9kdWxlXTtcblx0XHRcdFx0d2hpbGUgKG1vZHVsZXMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0dmFyIG5leHRNb2R1bGUgPSBtb2R1bGVzLnNoaWZ0KCk7XG5cdFx0XHRcdFx0bmV4dE1vZHVsZS5ob29rcyA9IHt9O1xuXHRcdFx0XHRcdG1vZHVsZXMucHVzaC5hcHBseShtb2R1bGVzLCBfdG9Db25zdW1hYmxlQXJyYXkobmV4dE1vZHVsZS5jaGlsZE1vZHVsZXMpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbWl0KCdzdWl0ZUVuZCcsIG1vZHVsZS5zdWl0ZVJlcG9ydC5lbmQodHJ1ZSkpO1xuXHRcdFx0XHRyZXR1cm4gcnVuTG9nZ2luZ0NhbGxiYWNrcygnbW9kdWxlRG9uZScsIHtcblx0XHRcdFx0XHRuYW1lOiBtb2R1bGUubmFtZSxcblx0XHRcdFx0XHR0ZXN0czogbW9kdWxlLnRlc3RzLFxuXHRcdFx0XHRcdGZhaWxlZDogbW9kdWxlLnN0YXRzLmJhZCxcblx0XHRcdFx0XHRwYXNzZWQ6IG1vZHVsZS5zdGF0cy5hbGwgLSBtb2R1bGUuc3RhdHMuYmFkLFxuXHRcdFx0XHRcdHRvdGFsOiBtb2R1bGUuc3RhdHMuYWxsLFxuXHRcdFx0XHRcdHJ1bnRpbWU6IE1hdGgucm91bmQocGVyZm9ybWFuY2Uubm93KCkgLSBtb2R1bGUuc3RhdHMuc3RhcnRlZClcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRwcmVzZXJ2ZVRlc3RFbnZpcm9ubWVudDogZnVuY3Rpb24gcHJlc2VydmVUZXN0RW52aXJvbm1lbnQoKSB7XG5cdFx0XHRpZiAodGhpcy5wcmVzZXJ2ZUVudmlyb25tZW50KSB7XG5cdFx0XHRcdHRoaXMubW9kdWxlLnRlc3RFbnZpcm9ubWVudCA9IHRoaXMudGVzdEVudmlyb25tZW50O1xuXHRcdFx0XHR0aGlzLnRlc3RFbnZpcm9ubWVudCA9IGV4dGVuZCh7fSwgdGhpcy5tb2R1bGUudGVzdEVudmlyb25tZW50KTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdHF1ZXVlOiBmdW5jdGlvbiBxdWV1ZSgpIHtcblx0XHRcdHZhciB0ZXN0ID0gdGhpcztcblx0XHRcdGlmICghdGhpcy52YWxpZCgpKSB7XG5cdFx0XHRcdGluY3JlbWVudFRlc3RzSWdub3JlZCh0aGlzLm1vZHVsZSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGZ1bmN0aW9uIHJ1blRlc3QoKSB7XG5cdFx0XHRcdHJldHVybiBbZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHJldHVybiB0ZXN0LmJlZm9yZSgpO1xuXHRcdFx0XHR9XS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRlc3QuaG9va3MoJ2JlZm9yZScpKSwgW2Z1bmN0aW9uICgpIHtcblx0XHRcdFx0XHR0ZXN0LnByZXNlcnZlVGVzdEVudmlyb25tZW50KCk7XG5cdFx0XHRcdH1dLCBfdG9Db25zdW1hYmxlQXJyYXkodGVzdC5ob29rcygnYmVmb3JlRWFjaCcpKSwgW2Z1bmN0aW9uICgpIHtcblx0XHRcdFx0XHR0ZXN0LnJ1bigpO1xuXHRcdFx0XHR9XSwgX3RvQ29uc3VtYWJsZUFycmF5KHRlc3QuaG9va3MoJ2FmdGVyRWFjaCcpLnJldmVyc2UoKSksIF90b0NvbnN1bWFibGVBcnJheSh0ZXN0Lmhvb2tzKCdhZnRlcicpLnJldmVyc2UoKSksIFtmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0dGVzdC5hZnRlcigpO1xuXHRcdFx0XHR9LCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRlc3QuZmluaXNoKCk7XG5cdFx0XHRcdH1dKTtcblx0XHRcdH1cblx0XHRcdHZhciBwcmV2aW91c0ZhaWxDb3VudCA9IGNvbmZpZy5zdG9yYWdlICYmICtjb25maWcuc3RvcmFnZS5nZXRJdGVtKCdxdW5pdC10ZXN0LScgKyB0aGlzLm1vZHVsZS5uYW1lICsgJy0nICsgdGhpcy50ZXN0TmFtZSk7XG5cblx0XHRcdC8vIFByaW9yaXRpemUgcHJldmlvdXNseSBmYWlsZWQgdGVzdHMsIGRldGVjdGVkIGZyb20gc3RvcmFnZVxuXHRcdFx0dmFyIHByaW9yaXRpemUgPSBjb25maWcucmVvcmRlciAmJiAhIXByZXZpb3VzRmFpbENvdW50O1xuXHRcdFx0dGhpcy5wcmV2aW91c0ZhaWx1cmUgPSAhIXByZXZpb3VzRmFpbENvdW50O1xuXHRcdFx0UHJvY2Vzc2luZ1F1ZXVlLmFkZChydW5UZXN0LCBwcmlvcml0aXplLCBjb25maWcuc2VlZCk7XG5cdFx0fSxcblx0XHRwdXNoUmVzdWx0OiBmdW5jdGlvbiBwdXNoUmVzdWx0KHJlc3VsdEluZm8pIHtcblx0XHRcdGlmICh0aGlzICE9PSBjb25maWcuY3VycmVudCkge1xuXHRcdFx0XHR2YXIgbWVzc2FnZSA9IHJlc3VsdEluZm8gJiYgcmVzdWx0SW5mby5tZXNzYWdlIHx8ICcnO1xuXHRcdFx0XHR2YXIgdGVzdE5hbWUgPSB0aGlzICYmIHRoaXMudGVzdE5hbWUgfHwgJyc7XG5cdFx0XHRcdHZhciBlcnJvciA9ICdBc3NlcnRpb24gb2NjdXJyZWQgYWZ0ZXIgdGVzdCBmaW5pc2hlZC5cXG4nICsgJz4gVGVzdDogJyArIHRlc3ROYW1lICsgJ1xcbicgKyAnPiBNZXNzYWdlOiAnICsgbWVzc2FnZSArICdcXG4nO1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoZXJyb3IpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBEZXN0cnVjdHVyZSBvZiByZXN1bHRJbmZvID0geyByZXN1bHQsIGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsIG5lZ2F0aXZlIH1cblx0XHRcdHZhciBkZXRhaWxzID0ge1xuXHRcdFx0XHRtb2R1bGU6IHRoaXMubW9kdWxlLm5hbWUsXG5cdFx0XHRcdG5hbWU6IHRoaXMudGVzdE5hbWUsXG5cdFx0XHRcdHJlc3VsdDogcmVzdWx0SW5mby5yZXN1bHQsXG5cdFx0XHRcdG1lc3NhZ2U6IHJlc3VsdEluZm8ubWVzc2FnZSxcblx0XHRcdFx0YWN0dWFsOiByZXN1bHRJbmZvLmFjdHVhbCxcblx0XHRcdFx0dGVzdElkOiB0aGlzLnRlc3RJZCxcblx0XHRcdFx0bmVnYXRpdmU6IHJlc3VsdEluZm8ubmVnYXRpdmUgfHwgZmFsc2UsXG5cdFx0XHRcdHJ1bnRpbWU6IE1hdGgucm91bmQocGVyZm9ybWFuY2Uubm93KCkgLSB0aGlzLnN0YXJ0ZWQpLFxuXHRcdFx0XHR0b2RvOiAhIXRoaXMudG9kb1xuXHRcdFx0fTtcblx0XHRcdGlmIChoYXNPd24kMS5jYWxsKHJlc3VsdEluZm8sICdleHBlY3RlZCcpKSB7XG5cdFx0XHRcdGRldGFpbHMuZXhwZWN0ZWQgPSByZXN1bHRJbmZvLmV4cGVjdGVkO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCFyZXN1bHRJbmZvLnJlc3VsdCkge1xuXHRcdFx0XHR2YXIgc291cmNlID0gcmVzdWx0SW5mby5zb3VyY2UgfHwgc291cmNlRnJvbVN0YWNrdHJhY2UoKTtcblx0XHRcdFx0aWYgKHNvdXJjZSkge1xuXHRcdFx0XHRcdGRldGFpbHMuc291cmNlID0gc291cmNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmxvZ0Fzc2VydGlvbihkZXRhaWxzKTtcblx0XHRcdHRoaXMuYXNzZXJ0aW9ucy5wdXNoKHtcblx0XHRcdFx0cmVzdWx0OiAhIXJlc3VsdEluZm8ucmVzdWx0LFxuXHRcdFx0XHRtZXNzYWdlOiByZXN1bHRJbmZvLm1lc3NhZ2Vcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0cHVzaEZhaWx1cmU6IGZ1bmN0aW9uIHB1c2hGYWlsdXJlKG1lc3NhZ2UsIHNvdXJjZSwgYWN0dWFsKSB7XG5cdFx0XHRpZiAoISh0aGlzIGluc3RhbmNlb2YgVGVzdCkpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdwdXNoRmFpbHVyZSgpIGFzc2VydGlvbiBvdXRzaWRlIHRlc3QgY29udGV4dCwgd2FzICcgKyBzb3VyY2VGcm9tU3RhY2t0cmFjZSgyKSk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnB1c2hSZXN1bHQoe1xuXHRcdFx0XHRyZXN1bHQ6IGZhbHNlLFxuXHRcdFx0XHRtZXNzYWdlOiBtZXNzYWdlIHx8ICdlcnJvcicsXG5cdFx0XHRcdGFjdHVhbDogYWN0dWFsIHx8IG51bGwsXG5cdFx0XHRcdHNvdXJjZTogc291cmNlXG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqIExvZyBhc3NlcnRpb24gZGV0YWlscyB1c2luZyBib3RoIHRoZSBvbGQgUVVuaXQubG9nIGludGVyZmFjZSBhbmRcblx0XHQgKiBRVW5pdC5vbiggXCJhc3NlcnRpb25cIiApIGludGVyZmFjZS5cblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0bG9nQXNzZXJ0aW9uOiBmdW5jdGlvbiBsb2dBc3NlcnRpb24oZGV0YWlscykge1xuXHRcdFx0cnVuTG9nZ2luZ0NhbGxiYWNrcygnbG9nJywgZGV0YWlscyk7XG5cdFx0XHR2YXIgYXNzZXJ0aW9uID0ge1xuXHRcdFx0XHRwYXNzZWQ6IGRldGFpbHMucmVzdWx0LFxuXHRcdFx0XHRhY3R1YWw6IGRldGFpbHMuYWN0dWFsLFxuXHRcdFx0XHRleHBlY3RlZDogZGV0YWlscy5leHBlY3RlZCxcblx0XHRcdFx0bWVzc2FnZTogZGV0YWlscy5tZXNzYWdlLFxuXHRcdFx0XHRzdGFjazogZGV0YWlscy5zb3VyY2UsXG5cdFx0XHRcdHRvZG86IGRldGFpbHMudG9kb1xuXHRcdFx0fTtcblx0XHRcdHRoaXMudGVzdFJlcG9ydC5wdXNoQXNzZXJ0aW9uKGFzc2VydGlvbik7XG5cdFx0XHRlbWl0KCdhc3NlcnRpb24nLCBhc3NlcnRpb24pO1xuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogUmVzZXQgY29uZmlnLnRpbWVvdXQgd2l0aCBhIG5ldyB0aW1lb3V0IGR1cmF0aW9uLlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHtudW1iZXJ9IHRpbWVvdXREdXJhdGlvblxuXHRcdCAqL1xuXHRcdGludGVybmFsUmVzZXRUaW1lb3V0OiBmdW5jdGlvbiBpbnRlcm5hbFJlc2V0VGltZW91dCh0aW1lb3V0RHVyYXRpb24pIHtcblx0XHRcdGNsZWFyVGltZW91dChjb25maWcudGltZW91dCk7XG5cdFx0XHRjb25maWcudGltZW91dCA9IHNldFRpbWVvdXQkMShjb25maWcudGltZW91dEhhbmRsZXIodGltZW91dER1cmF0aW9uKSwgdGltZW91dER1cmF0aW9uKTtcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqIENyZWF0ZSBhIG5ldyBhc3luYyBwYXVzZSBhbmQgcmV0dXJuIGEgbmV3IGZ1bmN0aW9uIHRoYXQgY2FuIHJlbGVhc2UgdGhlIHBhdXNlLlxuXHRcdCAqXG5cdFx0ICogVGhpcyBtZWNoYW5pc20gaXMgaW50ZXJuYWxseSB1c2VkIGJ5OlxuXHRcdCAqXG5cdFx0ICogLSBleHBsaWNpdCBhc3luYyBwYXVzZXMsIGNyZWF0ZWQgYnkgY2FsbGluZyBgYXNzZXJ0LmFzeW5jKClgLFxuXHRcdCAqIC0gaW1wbGljaXQgYXN5bmMgcGF1c2VzLCBjcmVhdGVkIHdoZW4gYFFVbml0LnRlc3QoKWAgb3IgbW9kdWxlIGhvb2sgY2FsbGJhY2tzXG5cdFx0ICogICB1c2UgYXN5bmMtYXdhaXQgb3Igb3RoZXJ3aXNlIHJldHVybiBhIFByb21pc2UuXG5cdFx0ICpcblx0XHQgKiBIYXBweSBzY2VuYXJpbzpcblx0XHQgKlxuXHRcdCAqIC0gUGF1c2UgaXMgY3JlYXRlZCBieSBjYWxsaW5nIGludGVybmFsU3RvcCgpLlxuXHRcdCAqXG5cdFx0ICogICBQYXVzZSBpcyByZWxlYXNlZCBub3JtYWxseSBieSBpbnZva2luZyByZWxlYXNlKCkgZHVyaW5nIHRoZSBzYW1lIHRlc3QuXG5cdFx0ICpcblx0XHQgKiAgIFRoZSByZWxlYXNlKCkgY2FsbGJhY2sgbGV0cyBpbnRlcm5hbCBwcm9jZXNzaW5nIHJlc3VtZS5cblx0XHQgKlxuXHRcdCAqIEZhaWx1cmUgc2NlbmFyaW9zOlxuXHRcdCAqXG5cdFx0ICogLSBUaGUgdGVzdCBmYWlscyBkdWUgdG8gYW4gdW5jYXVnaHQgZXhjZXB0aW9uLlxuXHRcdCAqXG5cdFx0ICogICBJbiB0aGlzIGNhc2UsIFRlc3QucnVuKCkgd2lsbCBjYWxsIGludGVybmFsUmVjb3ZlcigpIHdoaWNoIGVtcHRpZXMgdGhlIGNsZWFycyBhbGxcblx0XHQgKiAgIGFzeW5jIHBhdXNlcyBhbmQgc2V0cyB0aGUgY2FuY2VsbGVkIGZsYWcsIHdoaWNoIG1lYW5zIHdlIHNpbGVudGx5IGlnbm9yZSBhbnlcblx0XHQgKiAgIGxhdGUgY2FsbHMgdG8gdGhlIHJlc3VtZSgpIGNhbGxiYWNrLCBhcyB3ZSB3aWxsIGhhdmUgbW92ZWQgb24gdG8gYSBkaWZmZXJlbnRcblx0XHQgKiAgIHRlc3QgYnkgdGhlbiwgYW5kIHdlIGRvbid0IHdhbnQgdG8gY2F1c2UgYW4gZXh0cmEgXCJyZWxlYXNlIGR1cmluZyBhIGRpZmZlcmVudCB0ZXN0XCJcblx0XHQgKiAgIGVycm9ycyB0aGF0IHRoZSBkZXZlbG9wZXIgaXNuJ3QgcmVhbGx5IHJlc3BvbnNpYmxlIGZvci4gVGhpcyBjYW4gaGFwcGVuIHdoZW4gYSB0ZXN0XG5cdFx0ICogICBjb3JyZWN0bHkgc2NoZWR1bGVzIGEgY2FsbCB0byByZWxlYXNlKCksIGJ1dCBhbHNvIGNhdXNlcyBhbiB1bmNhdWdodCBlcnJvci4gVGhlXG5cdFx0ICogICB1bmNhdWdodCBlcnJvciBtZWFucyB3ZSB3aWxsIG5vIGxvbmdlciB3YWl0IGZvciB0aGUgcmVsZWFzZSAoYXMgaXQgbWlnaHQgbm90IGFycml2ZSkuXG5cdFx0ICpcblx0XHQgKiAtIFBhdXNlIGlzIG5ldmVyIHJlbGVhc2VkLCBvciBjYWxsZWQgYW4gaW5zdWZmaWNpZW50IG51bWJlciBvZiB0aW1lcy5cblx0XHQgKlxuXHRcdCAqICAgT3VyIHRpbWVvdXQgaGFuZGxlciB3aWxsIGtpbGwgdGhlIHBhdXNlIGFuZCByZXN1bWUgdGVzdCBwcm9jZXNzaW5nLCBiYXNpY2FsbHlcblx0XHQgKiAgIGxpa2UgaW50ZXJuYWxSZWNvdmVyKCksIGJ1dCBmb3Igb25lIHBhdXNlIGluc3RlYWQgb2YgYW55L2FsbC5cblx0XHQgKlxuXHRcdCAqICAgSGVyZSwgdG9vLCBhbnkgbGF0ZSBjYWxscyB0byByZXN1bWUoKSB3aWxsIGJlIHNpbGVudGx5IGlnbm9yZWQgdG8gYXZvaWRcblx0XHQgKiAgIGV4dHJhIGVycm9ycy4gV2UgdG9sZXJhdGUgdGhpcyBzaW5jZSB0aGUgb3JpZ2luYWwgdGVzdCB3aWxsIGhhdmUgYWxyZWFkeSBiZWVuXG5cdFx0ICogICBtYXJrZWQgYXMgZmFpbHVyZS5cblx0XHQgKlxuXHRcdCAqICAgVE9ETzogUVVuaXQgMyB3aWxsIGVuYWJsZSB0aW1lb3V0cyBieSBkZWZhdWx0IDxodHRwczovL2dpdGh1Yi5jb20vcXVuaXRqcy9xdW5pdC9pc3N1ZXMvMTQ4Mz4sXG5cdFx0ICogICBidXQgcmlnaHQgbm93IGEgdGVzdCB3aWxsIGhhbmcgaW5kZWZpbml0ZWx5IGlmIGFzeW5jIHBhdXNlcyBhcmUgbm90IHJlbGVhc2VkLFxuXHRcdCAqICAgdW5sZXNzIFFVbml0LmNvbmZpZy50ZXN0VGltZW91dCBvciBhc3NlcnQudGltZW91dCgpIGlzIHVzZWQuXG5cdFx0ICpcblx0XHQgKiAtIFBhdXNlIGlzIHNwb250YW5lb3VzbHkgcmVsZWFzZWQgZHVyaW5nIGEgZGlmZmVyZW50IHRlc3QsXG5cdFx0ICogICBvciB3aGVuIG5vIHRlc3QgaXMgY3VycmVudGx5IHJ1bm5pbmcuXG5cdFx0ICpcblx0XHQgKiAgIFRoaXMgaXMgY2xvc2UgdG8gaW1wb3NzaWJsZSBiZWNhdXNlIHRoaXMgZXJyb3Igb25seSBoYXBwZW5zIGlmIHRoZSBvcmlnaW5hbCB0ZXN0XG5cdFx0ICogICBzdWNjZXNmdWxseSBmaW5pc2hlZCBmaXJzdCAoc2luY2Ugb3RoZXIgZmFpbHVyZSBzY2VuYXJpb3Mga2lsbCBwYXVzZXMgYW5kIGlnbm9yZVxuXHRcdCAqICAgbGF0ZSBjYWxscykuIEl0IGNhbiBoYXBwZW4gaWYgYSB0ZXN0IGVuZGVkIGV4YWN0bHkgYXMgZXhwZWN0ZWQsIGJ1dCBoYXMgc29tZVxuXHRcdCAqICAgZXh0ZXJuYWwgb3Igc2hhcmVkIHN0YXRlIGNvbnRpbnVpbmcgdG8gaG9sZCBhIHJlZmVyZW5jZSB0byB0aGUgcmVsZWFzZSBjYWxsYmFjayxcblx0XHQgKiAgIGFuZCBlaXRoZXIgdGhlIHNhbWUgdGVzdCBzY2hlZHVsZWQgYW5vdGhlciBjYWxsIHRvIGl0IGluIHRoZSBmdXR1cmUsIG9yIGEgbGF0ZXIgdGVzdFxuXHRcdCAqICAgY2F1c2VzIGl0IHRvIGJlIGNhbGxlZCB0aHJvdWdoIHNvbWUgc2hhcmVkIHN0YXRlLlxuXHRcdCAqXG5cdFx0ICogLSBQYXVzZSByZWxlYXNlKCkgaXMgY2FsbGVkIHRvbyBvZnRlbiwgZHVyaW5nIHRoZSBzYW1lIHRlc3QuXG5cdFx0ICpcblx0XHQgKiAgIFRoaXMgc2ltcGx5IHRocm93cyBhbiBlcnJvciwgYWZ0ZXIgd2hpY2ggdW5jYXVnaHQgZXJyb3IgaGFuZGxpbmcgcGlja3MgaXQgdXBcblx0XHQgKiAgIGFuZCBwcm9jZXNzaW5nIHJlc3VtZXMuXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0ge251bWJlcn0gW3JlcXVpcmVkQ2FsbHM9MV1cblx0XHQgKi9cblx0XHRpbnRlcm5hbFN0b3A6IGZ1bmN0aW9uIGludGVybmFsU3RvcCgpIHtcblx0XHRcdHZhciByZXF1aXJlZENhbGxzID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAxO1xuXHRcdFx0Y29uZmlnLmJsb2NraW5nID0gdHJ1ZTtcblx0XHRcdHZhciB0ZXN0ID0gdGhpcztcblx0XHRcdHZhciBwYXVzZUlkID0gdGhpcy5uZXh0UGF1c2VJZCsrO1xuXHRcdFx0dmFyIHBhdXNlID0ge1xuXHRcdFx0XHRjYW5jZWxsZWQ6IGZhbHNlLFxuXHRcdFx0XHRyZW1haW5pbmc6IHJlcXVpcmVkQ2FsbHNcblx0XHRcdH07XG5cdFx0XHR0ZXN0LnBhdXNlcy5zZXQocGF1c2VJZCwgcGF1c2UpO1xuXHRcdFx0ZnVuY3Rpb24gcmVsZWFzZSgpIHtcblx0XHRcdFx0aWYgKHBhdXNlLmNhbmNlbGxlZCkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoY29uZmlnLmN1cnJlbnQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCByZWxlYXNlIG9mIGFzeW5jIHBhdXNlIGFmdGVyIHRlc3RzIGZpbmlzaGVkLlxcbicgKyBcIj4gVGVzdDogXCIuY29uY2F0KHRlc3QudGVzdE5hbWUsIFwiIFthc3luYyAjXCIpLmNvbmNhdChwYXVzZUlkLCBcIl1cIikpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChjb25maWcuY3VycmVudCAhPT0gdGVzdCkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCByZWxlYXNlIG9mIGFzeW5jIHBhdXNlIGR1cmluZyBhIGRpZmZlcmVudCB0ZXN0LlxcbicgKyBcIj4gVGVzdDogXCIuY29uY2F0KHRlc3QudGVzdE5hbWUsIFwiIFthc3luYyAjXCIpLmNvbmNhdChwYXVzZUlkLCBcIl1cIikpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChwYXVzZS5yZW1haW5pbmcgPD0gMCkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcignVHJpZWQgdG8gcmVsZWFzZSBhc3luYyBwYXVzZSB0aGF0IHdhcyBhbHJlYWR5IHJlbGVhc2VkLlxcbicgKyBcIj4gVGVzdDogXCIuY29uY2F0KHRlc3QudGVzdE5hbWUsIFwiIFthc3luYyAjXCIpLmNvbmNhdChwYXVzZUlkLCBcIl1cIikpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gVGhlIGByZXF1aXJlZENhbGxzYCBwYXJhbWV0ZXIgZXhpc3RzIHRvIHN1cHBvcnQgYGFzc2VydC5hc3luYyhjb3VudClgXG5cdFx0XHRcdHBhdXNlLnJlbWFpbmluZy0tO1xuXHRcdFx0XHRpZiAocGF1c2UucmVtYWluaW5nID09PSAwKSB7XG5cdFx0XHRcdFx0dGVzdC5wYXVzZXMuZGVsZXRlKHBhdXNlSWQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGludGVybmFsU3RhcnQodGVzdCk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFNldCBhIHJlY292ZXJ5IHRpbWVvdXQsIGlmIHNvIGNvbmZpZ3VyZWQuXG5cdFx0XHRpZiAoc2V0VGltZW91dCQxKSB7XG5cdFx0XHRcdHZhciB0aW1lb3V0RHVyYXRpb247XG5cdFx0XHRcdGlmICh0eXBlb2YgdGVzdC50aW1lb3V0ID09PSAnbnVtYmVyJykge1xuXHRcdFx0XHRcdHRpbWVvdXREdXJhdGlvbiA9IHRlc3QudGltZW91dDtcblx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgY29uZmlnLnRlc3RUaW1lb3V0ID09PSAnbnVtYmVyJykge1xuXHRcdFx0XHRcdHRpbWVvdXREdXJhdGlvbiA9IGNvbmZpZy50ZXN0VGltZW91dDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodHlwZW9mIHRpbWVvdXREdXJhdGlvbiA9PT0gJ251bWJlcicgJiYgdGltZW91dER1cmF0aW9uID4gMCkge1xuXHRcdFx0XHRcdGNvbmZpZy50aW1lb3V0SGFuZGxlciA9IGZ1bmN0aW9uICh0aW1lb3V0KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRjb25maWcudGltZW91dCA9IG51bGw7XG5cdFx0XHRcdFx0XHRcdHBhdXNlLmNhbmNlbGxlZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdHRlc3QucGF1c2VzLmRlbGV0ZShwYXVzZUlkKTtcblx0XHRcdFx0XHRcdFx0dGVzdC5wdXNoRmFpbHVyZShcIlRlc3QgdG9vayBsb25nZXIgdGhhbiBcIi5jb25jYXQodGltZW91dCwgXCJtczsgdGVzdCB0aW1lZCBvdXQuXCIpLCBzb3VyY2VGcm9tU3RhY2t0cmFjZSgyKSk7XG5cdFx0XHRcdFx0XHRcdGludGVybmFsU3RhcnQodGVzdCk7XG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0Y2xlYXJUaW1lb3V0KGNvbmZpZy50aW1lb3V0KTtcblx0XHRcdFx0XHRjb25maWcudGltZW91dCA9IHNldFRpbWVvdXQkMShjb25maWcudGltZW91dEhhbmRsZXIodGltZW91dER1cmF0aW9uKSwgdGltZW91dER1cmF0aW9uKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHJlbGVhc2U7XG5cdFx0fSxcblx0XHRyZXNvbHZlUHJvbWlzZTogZnVuY3Rpb24gcmVzb2x2ZVByb21pc2UocHJvbWlzZSwgcGhhc2UpIHtcblx0XHRcdGlmIChwcm9taXNlICE9IG51bGwpIHtcblx0XHRcdFx0dmFyIF90ZXN0ID0gdGhpcztcblx0XHRcdFx0dmFyIHRoZW4gPSBwcm9taXNlLnRoZW47XG5cdFx0XHRcdGlmICh0eXBlb2YgdGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdHZhciByZXN1bWUgPSBfdGVzdC5pbnRlcm5hbFN0b3AoKTtcblx0XHRcdFx0XHR2YXIgcmVzb2x2ZSA9IGZ1bmN0aW9uIHJlc29sdmUoKSB7XG5cdFx0XHRcdFx0XHRyZXN1bWUoKTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGlmIChjb25maWcubm90cnljYXRjaCkge1xuXHRcdFx0XHRcdFx0dGhlbi5jYWxsKHByb21pc2UsIHJlc29sdmUpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR2YXIgcmVqZWN0ID0gZnVuY3Rpb24gcmVqZWN0KGVycm9yKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBtZXNzYWdlID0gJ1Byb21pc2UgcmVqZWN0ZWQgJyArICghcGhhc2UgPyAnZHVyaW5nJyA6IHBoYXNlLnJlcGxhY2UoL0VhY2gkLywgJycpKSArICcgXCInICsgX3Rlc3QudGVzdE5hbWUgKyAnXCI6ICcgKyAoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG5cdFx0XHRcdFx0XHRcdF90ZXN0LnB1c2hGYWlsdXJlKG1lc3NhZ2UsIGV4dHJhY3RTdGFja3RyYWNlKGVycm9yLCAwKSk7XG5cblx0XHRcdFx0XHRcdFx0Ly8gRWxzZSBuZXh0IHRlc3Qgd2lsbCBjYXJyeSB0aGUgcmVzcG9uc2liaWxpdHlcblx0XHRcdFx0XHRcdFx0c2F2ZUdsb2JhbCgpO1xuXG5cdFx0XHRcdFx0XHRcdC8vIFVuYmxvY2tcblx0XHRcdFx0XHRcdFx0aW50ZXJuYWxSZWNvdmVyKF90ZXN0KTtcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR0aGVuLmNhbGwocHJvbWlzZSwgcmVzb2x2ZSwgcmVqZWN0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdHZhbGlkOiBmdW5jdGlvbiB2YWxpZCgpIHtcblx0XHRcdC8vIEludGVybmFsbHktZ2VuZXJhdGVkIHRlc3RzIGFyZSBhbHdheXMgdmFsaWRcblx0XHRcdGlmICh0aGlzLmNhbGxiYWNrICYmIHRoaXMuY2FsbGJhY2sudmFsaWRUZXN0KSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0ZnVuY3Rpb24gbW9kdWxlQ2hhaW5JZE1hdGNoKHRlc3RNb2R1bGUsIHNlbGVjdGVkSWQpIHtcblx0XHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHQvLyB1bmRlZmluZWQgb3IgZW1wdHkgYXJyYXlcblx0XHRcdFx0XHQhc2VsZWN0ZWRJZCB8fCAhc2VsZWN0ZWRJZC5sZW5ndGggfHwgaW5BcnJheSh0ZXN0TW9kdWxlLm1vZHVsZUlkLCBzZWxlY3RlZElkKSB8fCB0ZXN0TW9kdWxlLnBhcmVudE1vZHVsZSAmJiBtb2R1bGVDaGFpbklkTWF0Y2godGVzdE1vZHVsZS5wYXJlbnRNb2R1bGUsIHNlbGVjdGVkSWQpXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIW1vZHVsZUNoYWluSWRNYXRjaCh0aGlzLm1vZHVsZSwgY29uZmlnLm1vZHVsZUlkKSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHRpZiAoY29uZmlnLnRlc3RJZCAmJiBjb25maWcudGVzdElkLmxlbmd0aCAmJiAhaW5BcnJheSh0aGlzLnRlc3RJZCwgY29uZmlnLnRlc3RJZCkpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0ZnVuY3Rpb24gbW9kdWxlQ2hhaW5OYW1lTWF0Y2godGVzdE1vZHVsZSwgc2VsZWN0ZWRNb2R1bGUpIHtcblx0XHRcdFx0aWYgKCFzZWxlY3RlZE1vZHVsZSkge1xuXHRcdFx0XHRcdC8vIHVuZGVmaW5lZCBvciBlbXB0eSBzdHJpbmdcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgdGVzdE1vZHVsZU5hbWUgPSB0ZXN0TW9kdWxlLm5hbWUgPyB0ZXN0TW9kdWxlLm5hbWUudG9Mb3dlckNhc2UoKSA6IG51bGw7XG5cdFx0XHRcdGlmICh0ZXN0TW9kdWxlTmFtZSA9PT0gc2VsZWN0ZWRNb2R1bGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fSBlbHNlIGlmICh0ZXN0TW9kdWxlLnBhcmVudE1vZHVsZSkge1xuXHRcdFx0XHRcdHJldHVybiBtb2R1bGVDaGFpbk5hbWVNYXRjaCh0ZXN0TW9kdWxlLnBhcmVudE1vZHVsZSwgc2VsZWN0ZWRNb2R1bGUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dmFyIHNlbGVjdGVkTW9kdWxlID0gY29uZmlnLm1vZHVsZSAmJiBjb25maWcubW9kdWxlLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRpZiAoIW1vZHVsZUNoYWluTmFtZU1hdGNoKHRoaXMubW9kdWxlLCBzZWxlY3RlZE1vZHVsZSkpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGZpbHRlciA9IGNvbmZpZy5maWx0ZXI7XG5cdFx0XHRpZiAoIWZpbHRlcikge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdHZhciByZWdleEZpbHRlciA9IC9eKCE/KVxcLyhbXFx3XFxXXSopXFwvKGk/JCkvLmV4ZWMoZmlsdGVyKTtcblx0XHRcdHZhciBmdWxsTmFtZSA9IHRoaXMubW9kdWxlLm5hbWUgKyAnOiAnICsgdGhpcy50ZXN0TmFtZTtcblx0XHRcdHJldHVybiByZWdleEZpbHRlciA/IHRoaXMucmVnZXhGaWx0ZXIoISFyZWdleEZpbHRlclsxXSwgcmVnZXhGaWx0ZXJbMl0sIHJlZ2V4RmlsdGVyWzNdLCBmdWxsTmFtZSkgOiB0aGlzLnN0cmluZ0ZpbHRlcihmaWx0ZXIsIGZ1bGxOYW1lKTtcblx0XHR9LFxuXHRcdHJlZ2V4RmlsdGVyOiBmdW5jdGlvbiByZWdleEZpbHRlcihleGNsdWRlLCBwYXR0ZXJuLCBmbGFncywgZnVsbE5hbWUpIHtcblx0XHRcdHZhciByZWdleCA9IG5ldyBSZWdFeHAocGF0dGVybiwgZmxhZ3MpO1xuXHRcdFx0dmFyIG1hdGNoID0gcmVnZXgudGVzdChmdWxsTmFtZSk7XG5cdFx0XHRyZXR1cm4gbWF0Y2ggIT09IGV4Y2x1ZGU7XG5cdFx0fSxcblx0XHRzdHJpbmdGaWx0ZXI6IGZ1bmN0aW9uIHN0cmluZ0ZpbHRlcihmaWx0ZXIsIGZ1bGxOYW1lKSB7XG5cdFx0XHRmaWx0ZXIgPSBmaWx0ZXIudG9Mb3dlckNhc2UoKTtcblx0XHRcdGZ1bGxOYW1lID0gZnVsbE5hbWUudG9Mb3dlckNhc2UoKTtcblx0XHRcdHZhciBpbmNsdWRlID0gZmlsdGVyLmNoYXJBdCgwKSAhPT0gJyEnO1xuXHRcdFx0aWYgKCFpbmNsdWRlKSB7XG5cdFx0XHRcdGZpbHRlciA9IGZpbHRlci5zbGljZSgxKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gSWYgdGhlIGZpbHRlciBtYXRjaGVzLCB3ZSBuZWVkIHRvIGhvbm91ciBpbmNsdWRlXG5cdFx0XHRpZiAoZnVsbE5hbWUuaW5kZXhPZihmaWx0ZXIpICE9PSAtMSkge1xuXHRcdFx0XHRyZXR1cm4gaW5jbHVkZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gT3RoZXJ3aXNlLCBkbyB0aGUgb3Bwb3NpdGVcblx0XHRcdHJldHVybiAhaW5jbHVkZTtcblx0XHR9XG5cdH07XG5cdGZ1bmN0aW9uIHB1c2hGYWlsdXJlKCkge1xuXHRcdGlmICghY29uZmlnLmN1cnJlbnQpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcigncHVzaEZhaWx1cmUoKSBhc3NlcnRpb24gb3V0c2lkZSB0ZXN0IGNvbnRleHQsIGluICcgKyBzb3VyY2VGcm9tU3RhY2t0cmFjZSgyKSk7XG5cdFx0fVxuXG5cdFx0Ly8gR2V0cyBjdXJyZW50IHRlc3Qgb2JqXG5cdFx0dmFyIGN1cnJlbnRUZXN0ID0gY29uZmlnLmN1cnJlbnQ7XG5cdFx0cmV0dXJuIGN1cnJlbnRUZXN0LnB1c2hGYWlsdXJlLmFwcGx5KGN1cnJlbnRUZXN0LCBhcmd1bWVudHMpO1xuXHR9XG5cdGZ1bmN0aW9uIHNhdmVHbG9iYWwoKSB7XG5cdFx0Y29uZmlnLnBvbGx1dGlvbiA9IFtdO1xuXHRcdGlmIChjb25maWcubm9nbG9iYWxzKSB7XG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gZykge1xuXHRcdFx0XHRpZiAoaGFzT3duJDEuY2FsbChnLCBrZXkpKSB7XG5cdFx0XHRcdFx0Ly8gSW4gT3BlcmEgc29tZXRpbWVzIERPTSBlbGVtZW50IGlkcyBzaG93IHVwIGhlcmUsIGlnbm9yZSB0aGVtXG5cdFx0XHRcdFx0aWYgKC9ecXVuaXQtdGVzdC1vdXRwdXQvLnRlc3Qoa2V5KSkge1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbmZpZy5wb2xsdXRpb24ucHVzaChrZXkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIGNoZWNrUG9sbHV0aW9uKCkge1xuXHRcdHZhciBvbGQgPSBjb25maWcucG9sbHV0aW9uO1xuXHRcdHNhdmVHbG9iYWwoKTtcblx0XHR2YXIgbmV3R2xvYmFscyA9IGRpZmYoY29uZmlnLnBvbGx1dGlvbiwgb2xkKTtcblx0XHRpZiAobmV3R2xvYmFscy5sZW5ndGggPiAwKSB7XG5cdFx0XHRwdXNoRmFpbHVyZSgnSW50cm9kdWNlZCBnbG9iYWwgdmFyaWFibGUocyk6ICcgKyBuZXdHbG9iYWxzLmpvaW4oJywgJykpO1xuXHRcdH1cblx0XHR2YXIgZGVsZXRlZEdsb2JhbHMgPSBkaWZmKG9sZCwgY29uZmlnLnBvbGx1dGlvbik7XG5cdFx0aWYgKGRlbGV0ZWRHbG9iYWxzLmxlbmd0aCA+IDApIHtcblx0XHRcdHB1c2hGYWlsdXJlKCdEZWxldGVkIGdsb2JhbCB2YXJpYWJsZShzKTogJyArIGRlbGV0ZWRHbG9iYWxzLmpvaW4oJywgJykpO1xuXHRcdH1cblx0fVxuXHR2YXIgZm9jdXNlZCA9IGZhbHNlOyAvLyBpbmRpY2F0ZXMgdGhhdCB0aGUgXCJvbmx5XCIgZmlsdGVyIHdhcyB1c2VkXG5cblx0ZnVuY3Rpb24gYWRkVGVzdChzZXR0aW5ncykge1xuXHRcdGlmIChmb2N1c2VkIHx8IGNvbmZpZy5jdXJyZW50TW9kdWxlLmlnbm9yZWQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dmFyIG5ld1Rlc3QgPSBuZXcgVGVzdChzZXR0aW5ncyk7XG5cdFx0bmV3VGVzdC5xdWV1ZSgpO1xuXHR9XG5cdGZ1bmN0aW9uIGFkZE9ubHlUZXN0KHNldHRpbmdzKSB7XG5cdFx0aWYgKGNvbmZpZy5jdXJyZW50TW9kdWxlLmlnbm9yZWQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKCFmb2N1c2VkKSB7XG5cdFx0XHRjb25maWcucXVldWUubGVuZ3RoID0gMDtcblx0XHRcdGZvY3VzZWQgPSB0cnVlO1xuXHRcdH1cblx0XHR2YXIgbmV3VGVzdCA9IG5ldyBUZXN0KHNldHRpbmdzKTtcblx0XHRuZXdUZXN0LnF1ZXVlKCk7XG5cdH1cblxuXHQvLyBXaWxsIGJlIGV4cG9zZWQgYXMgUVVuaXQudGVzdFxuXHRmdW5jdGlvbiB0ZXN0KHRlc3ROYW1lLCBjYWxsYmFjaykge1xuXHRcdGFkZFRlc3Qoe1xuXHRcdFx0dGVzdE5hbWU6IHRlc3ROYW1lLFxuXHRcdFx0Y2FsbGJhY2s6IGNhbGxiYWNrXG5cdFx0fSk7XG5cdH1cblx0ZnVuY3Rpb24gbWFrZUVhY2hUZXN0TmFtZSh0ZXN0TmFtZSwgYXJndW1lbnQpIHtcblx0XHRyZXR1cm4gXCJcIi5jb25jYXQodGVzdE5hbWUsIFwiIFtcIikuY29uY2F0KGFyZ3VtZW50LCBcIl1cIik7XG5cdH1cblx0ZnVuY3Rpb24gcnVuRWFjaChkYXRhLCBlYWNoRm4pIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGVhY2hGbihkYXRhW2ldLCBpKTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKF90eXBlb2YoZGF0YSkgPT09ICdvYmplY3QnICYmIGRhdGEgIT09IG51bGwpIHtcblx0XHRcdGZvciAodmFyIGtleSBpbiBkYXRhKSB7XG5cdFx0XHRcdGVhY2hGbihkYXRhW2tleV0sIGtleSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcInRlc3QuZWFjaCgpIGV4cGVjdHMgYW4gYXJyYXkgb3Igb2JqZWN0IGFzIGlucHV0LCBidXRcXG5mb3VuZCBcIi5jb25jYXQoX3R5cGVvZihkYXRhKSwgXCIgaW5zdGVhZC5cIikpO1xuXHRcdH1cblx0fVxuXHRleHRlbmQodGVzdCwge1xuXHRcdHRvZG86IGZ1bmN0aW9uIHRvZG8odGVzdE5hbWUsIGNhbGxiYWNrKSB7XG5cdFx0XHRhZGRUZXN0KHtcblx0XHRcdFx0dGVzdE5hbWU6IHRlc3ROYW1lLFxuXHRcdFx0XHRjYWxsYmFjazogY2FsbGJhY2ssXG5cdFx0XHRcdHRvZG86IHRydWVcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0c2tpcDogZnVuY3Rpb24gc2tpcCh0ZXN0TmFtZSkge1xuXHRcdFx0YWRkVGVzdCh7XG5cdFx0XHRcdHRlc3ROYW1lOiB0ZXN0TmFtZSxcblx0XHRcdFx0c2tpcDogdHJ1ZVxuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRvbmx5OiBmdW5jdGlvbiBvbmx5KHRlc3ROYW1lLCBjYWxsYmFjaykge1xuXHRcdFx0YWRkT25seVRlc3Qoe1xuXHRcdFx0XHR0ZXN0TmFtZTogdGVzdE5hbWUsXG5cdFx0XHRcdGNhbGxiYWNrOiBjYWxsYmFja1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRlYWNoOiBmdW5jdGlvbiBlYWNoKHRlc3ROYW1lLCBkYXRhc2V0LCBjYWxsYmFjaykge1xuXHRcdFx0cnVuRWFjaChkYXRhc2V0LCBmdW5jdGlvbiAoZGF0YSwgdGVzdEtleSkge1xuXHRcdFx0XHRhZGRUZXN0KHtcblx0XHRcdFx0XHR0ZXN0TmFtZTogbWFrZUVhY2hUZXN0TmFtZSh0ZXN0TmFtZSwgdGVzdEtleSksXG5cdFx0XHRcdFx0Y2FsbGJhY2s6IGNhbGxiYWNrLFxuXHRcdFx0XHRcdHdpdGhEYXRhOiB0cnVlLFxuXHRcdFx0XHRcdHN0YWNrT2Zmc2V0OiA1LFxuXHRcdFx0XHRcdGRhdGE6IGRhdGFcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0pO1xuXHR0ZXN0LnRvZG8uZWFjaCA9IGZ1bmN0aW9uICh0ZXN0TmFtZSwgZGF0YXNldCwgY2FsbGJhY2spIHtcblx0XHRydW5FYWNoKGRhdGFzZXQsIGZ1bmN0aW9uIChkYXRhLCB0ZXN0S2V5KSB7XG5cdFx0XHRhZGRUZXN0KHtcblx0XHRcdFx0dGVzdE5hbWU6IG1ha2VFYWNoVGVzdE5hbWUodGVzdE5hbWUsIHRlc3RLZXkpLFxuXHRcdFx0XHRjYWxsYmFjazogY2FsbGJhY2ssXG5cdFx0XHRcdHRvZG86IHRydWUsXG5cdFx0XHRcdHdpdGhEYXRhOiB0cnVlLFxuXHRcdFx0XHRzdGFja09mZnNldDogNSxcblx0XHRcdFx0ZGF0YTogZGF0YVxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH07XG5cdHRlc3Quc2tpcC5lYWNoID0gZnVuY3Rpb24gKHRlc3ROYW1lLCBkYXRhc2V0KSB7XG5cdFx0cnVuRWFjaChkYXRhc2V0LCBmdW5jdGlvbiAoXywgdGVzdEtleSkge1xuXHRcdFx0YWRkVGVzdCh7XG5cdFx0XHRcdHRlc3ROYW1lOiBtYWtlRWFjaFRlc3ROYW1lKHRlc3ROYW1lLCB0ZXN0S2V5KSxcblx0XHRcdFx0c3RhY2tPZmZzZXQ6IDUsXG5cdFx0XHRcdHNraXA6IHRydWVcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9O1xuXHR0ZXN0Lm9ubHkuZWFjaCA9IGZ1bmN0aW9uICh0ZXN0TmFtZSwgZGF0YXNldCwgY2FsbGJhY2spIHtcblx0XHRydW5FYWNoKGRhdGFzZXQsIGZ1bmN0aW9uIChkYXRhLCB0ZXN0S2V5KSB7XG5cdFx0XHRhZGRPbmx5VGVzdCh7XG5cdFx0XHRcdHRlc3ROYW1lOiBtYWtlRWFjaFRlc3ROYW1lKHRlc3ROYW1lLCB0ZXN0S2V5KSxcblx0XHRcdFx0Y2FsbGJhY2s6IGNhbGxiYWNrLFxuXHRcdFx0XHR3aXRoRGF0YTogdHJ1ZSxcblx0XHRcdFx0c3RhY2tPZmZzZXQ6IDUsXG5cdFx0XHRcdGRhdGE6IGRhdGFcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9O1xuXG5cdC8vIEZvcmNlZnVsbHkgcmVsZWFzZSBhbGwgcHJvY2Vzc2luZyBob2xkcy5cblx0ZnVuY3Rpb24gaW50ZXJuYWxSZWNvdmVyKHRlc3QpIHtcblx0XHR0ZXN0LnBhdXNlcy5mb3JFYWNoKGZ1bmN0aW9uIChwYXVzZSkge1xuXHRcdFx0cGF1c2UuY2FuY2VsbGVkID0gdHJ1ZTtcblx0XHR9KTtcblx0XHR0ZXN0LnBhdXNlcy5jbGVhcigpO1xuXHRcdGludGVybmFsU3RhcnQodGVzdCk7XG5cdH1cblxuXHQvLyBSZWxlYXNlIGEgcHJvY2Vzc2luZyBob2xkLCBzY2hlZHVsaW5nIGEgcmVzdW1wdGlvbiBhdHRlbXB0IGlmIG5vIGhvbGRzIHJlbWFpbi5cblx0ZnVuY3Rpb24gaW50ZXJuYWxTdGFydCh0ZXN0KSB7XG5cdFx0Ly8gSWdub3JlIGlmIG90aGVyIGFzeW5jIHBhdXNlcyBzdGlsbCBleGlzdC5cblx0XHRpZiAodGVzdC5wYXVzZXMuc2l6ZSA+IDApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBBZGQgYSBzbGlnaHQgZGVsYXkgdG8gYWxsb3cgbW9yZSBhc3NlcnRpb25zIGV0Yy5cblx0XHRpZiAoc2V0VGltZW91dCQxKSB7XG5cdFx0XHRjbGVhclRpbWVvdXQoY29uZmlnLnRpbWVvdXQpO1xuXHRcdFx0Y29uZmlnLnRpbWVvdXQgPSBzZXRUaW1lb3V0JDEoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRpZiAodGVzdC5wYXVzZXMuc2l6ZSA+IDApIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2xlYXJUaW1lb3V0KGNvbmZpZy50aW1lb3V0KTtcblx0XHRcdFx0Y29uZmlnLnRpbWVvdXQgPSBudWxsO1xuXHRcdFx0XHRjb25maWcuYmxvY2tpbmcgPSBmYWxzZTtcblx0XHRcdFx0UHJvY2Vzc2luZ1F1ZXVlLmFkdmFuY2UoKTtcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25maWcuYmxvY2tpbmcgPSBmYWxzZTtcblx0XHRcdFByb2Nlc3NpbmdRdWV1ZS5hZHZhbmNlKCk7XG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIGNvbGxlY3RUZXN0cyhtb2R1bGUpIHtcblx0XHR2YXIgdGVzdHMgPSBbXS5jb25jYXQobW9kdWxlLnRlc3RzKTtcblx0XHR2YXIgbW9kdWxlcyA9IF90b0NvbnN1bWFibGVBcnJheShtb2R1bGUuY2hpbGRNb2R1bGVzKTtcblxuXHRcdC8vIERvIGEgYnJlYWR0aC1maXJzdCB0cmF2ZXJzYWwgb2YgdGhlIGNoaWxkIG1vZHVsZXNcblx0XHR3aGlsZSAobW9kdWxlcy5sZW5ndGgpIHtcblx0XHRcdHZhciBuZXh0TW9kdWxlID0gbW9kdWxlcy5zaGlmdCgpO1xuXHRcdFx0dGVzdHMucHVzaC5hcHBseSh0ZXN0cywgbmV4dE1vZHVsZS50ZXN0cyk7XG5cdFx0XHRtb2R1bGVzLnB1c2guYXBwbHkobW9kdWxlcywgX3RvQ29uc3VtYWJsZUFycmF5KG5leHRNb2R1bGUuY2hpbGRNb2R1bGVzKSk7XG5cdFx0fVxuXHRcdHJldHVybiB0ZXN0cztcblx0fVxuXG5cdC8vIFRoaXMgcmV0dXJucyB0cnVlIGFmdGVyIGFsbCBleGVjdXRhYmxlIGFuZCBza2lwcGFibGUgdGVzdHNcblx0Ly8gaW4gYSBtb2R1bGUgaGF2ZSBiZWVuIHByb2NjZXNzZWQsIGFuZCBpbmZvcm1zICdzdWl0ZUVuZCdcblx0Ly8gYW5kIG1vZHVsZURvbmUoKS5cblx0ZnVuY3Rpb24gYWxsVGVzdHNFeGVjdXRlZChtb2R1bGUpIHtcblx0XHRyZXR1cm4gbW9kdWxlLnRlc3RzUnVuICsgbW9kdWxlLnRlc3RzSWdub3JlZCA9PT0gY29sbGVjdFRlc3RzKG1vZHVsZSkubGVuZ3RoO1xuXHR9XG5cblx0Ly8gVGhpcyByZXR1cm5zIHRydWUgZHVyaW5nIHRoZSBsYXN0IGV4ZWN1dGFibGUgbm9uLXNraXBwZWQgdGVzdFxuXHQvLyB3aXRoaW4gYSBtb2R1bGUsIGFuZCBpbmZvcm1zIHRoZSBydW5uaW5nIG9mIHRoZSAnYWZ0ZXInIGhvb2tcblx0Ly8gZm9yIGEgZ2l2ZW4gbW9kdWxlLiBUaGlzIHJ1bnMgb25seSBvbmNlIGZvciBhIGdpdmVuIG1vZHVsZSxcblx0Ly8gYnV0IG11c3QgcnVuIGR1cmluZyB0aGUgbGFzdCBub24tc2tpcHBlZCB0ZXN0LiBXaGVuIGl0IHJ1bnMsXG5cdC8vIHRoZXJlIG1heSBiZSBub24temVybyBza2lwcGVkIHRlc3RzIGxlZnQuXG5cdGZ1bmN0aW9uIGxhc3RUZXN0V2l0aGluTW9kdWxlRXhlY3V0ZWQobW9kdWxlKSB7XG5cdFx0cmV0dXJuIG1vZHVsZS50ZXN0c1J1biA9PT0gY29sbGVjdFRlc3RzKG1vZHVsZSkuZmlsdGVyKGZ1bmN0aW9uICh0ZXN0KSB7XG5cdFx0XHRyZXR1cm4gIXRlc3Quc2tpcDtcblx0XHR9KS5sZW5ndGggLSAxO1xuXHR9XG5cdGZ1bmN0aW9uIGluY3JlbWVudFRlc3RzUnVuKG1vZHVsZSkge1xuXHRcdG1vZHVsZS50ZXN0c1J1bisrO1xuXHRcdHdoaWxlIChtb2R1bGUgPSBtb2R1bGUucGFyZW50TW9kdWxlKSB7XG5cdFx0XHRtb2R1bGUudGVzdHNSdW4rKztcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gaW5jcmVtZW50VGVzdHNJZ25vcmVkKG1vZHVsZSkge1xuXHRcdG1vZHVsZS50ZXN0c0lnbm9yZWQrKztcblx0XHR3aGlsZSAobW9kdWxlID0gbW9kdWxlLnBhcmVudE1vZHVsZSkge1xuXHRcdFx0bW9kdWxlLnRlc3RzSWdub3JlZCsrO1xuXHRcdH1cblx0fVxuXG5cdC8qIGdsb2JhbCBtb2R1bGUsIGV4cG9ydHMsIGRlZmluZSAqL1xuXHRmdW5jdGlvbiBleHBvcnRRVW5pdChRVW5pdCkge1xuXHRcdHZhciBleHBvcnRlZE1vZHVsZSA9IGZhbHNlO1xuXHRcdGlmICh3aW5kb3ckMSAmJiBkb2N1bWVudCkge1xuXHRcdFx0Ly8gUVVuaXQgbWF5IGJlIGRlZmluZWQgd2hlbiBpdCBpcyBwcmVjb25maWd1cmVkIGJ1dCB0aGVuIG9ubHkgUVVuaXQgYW5kIFFVbml0LmNvbmZpZyBtYXkgYmUgZGVmaW5lZC5cblx0XHRcdGlmICh3aW5kb3ckMS5RVW5pdCAmJiB3aW5kb3ckMS5RVW5pdC52ZXJzaW9uKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignUVVuaXQgaGFzIGFscmVhZHkgYmVlbiBkZWZpbmVkLicpO1xuXHRcdFx0fVxuXHRcdFx0d2luZG93JDEuUVVuaXQgPSBRVW5pdDtcblx0XHRcdGV4cG9ydGVkTW9kdWxlID0gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBGb3IgTm9kZS5qc1xuXHRcdGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0XHRcdG1vZHVsZS5leHBvcnRzID0gUVVuaXQ7XG5cblx0XHRcdC8vIEZvciBjb25zaXN0ZW5jeSB3aXRoIENvbW1vbkpTIGVudmlyb25tZW50cycgZXhwb3J0c1xuXHRcdFx0bW9kdWxlLmV4cG9ydHMuUVVuaXQgPSBRVW5pdDtcblx0XHRcdGV4cG9ydGVkTW9kdWxlID0gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBGb3IgQ29tbW9uSlMgd2l0aCBleHBvcnRzLCBidXQgd2l0aG91dCBtb2R1bGUuZXhwb3J0cywgbGlrZSBSaGlub1xuXHRcdGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cykge1xuXHRcdFx0ZXhwb3J0cy5RVW5pdCA9IFFVbml0O1xuXHRcdFx0ZXhwb3J0ZWRNb2R1bGUgPSB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIEZvciBBTURcblx0XHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0XHRkZWZpbmUoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gUVVuaXQ7XG5cdFx0XHR9KTtcblx0XHRcdFFVbml0LmNvbmZpZy5hdXRvc3RhcnQgPSBmYWxzZTtcblx0XHRcdGV4cG9ydGVkTW9kdWxlID0gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBGb3Igb3RoZXIgZW52aXJvbm1lbnRzLCBpbmNsdWRpbmcgV2ViIFdvcmtlcnMgKGdsb2JhbFRoaXMgPT09IHNlbGYpLFxuXHRcdC8vIFNwaWRlck1vbmtleSAobW96anMpLCBhbmQgb3RoZXIgZW1iZWRkZWQgSmF2YVNjcmlwdCBlbmdpbmVzXG5cdFx0aWYgKCFleHBvcnRlZE1vZHVsZSkge1xuXHRcdFx0Zy5RVW5pdCA9IFFVbml0O1xuXHRcdH1cblx0fVxuXG5cdHZhciBDb25zb2xlUmVwb3J0ZXIgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKCkge1xuXHRcdGZ1bmN0aW9uIENvbnNvbGVSZXBvcnRlcihydW5uZXIpIHtcblx0XHRcdHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcblx0XHRcdF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDb25zb2xlUmVwb3J0ZXIpO1xuXHRcdFx0Ly8gQ2FjaGUgcmVmZXJlbmNlcyB0byBjb25zb2xlIG1ldGhvZHMgdG8gZW5zdXJlIHdlIGNhbiByZXBvcnQgZmFpbHVyZXNcblx0XHRcdC8vIGZyb20gdGVzdHMgdGVzdHMgdGhhdCBtb2NrIHRoZSBjb25zb2xlIG9iamVjdCBpdHNlbGYuXG5cdFx0XHQvLyBodHRwczovL2dpdGh1Yi5jb20vcXVuaXRqcy9xdW5pdC9pc3N1ZXMvMTM0MFxuXHRcdFx0Ly8gU3VwcG9ydCBJRSA5OiBGdW5jdGlvbiNiaW5kIGlzIHN1cHBvcnRlZCwgYnV0IG5vIGNvbnNvbGUubG9nLmJpbmQoKS5cblx0XHRcdHRoaXMubG9nID0gb3B0aW9ucy5sb2cgfHwgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQuY2FsbChjb25zb2xlJDEubG9nLCBjb25zb2xlJDEpO1xuXHRcdFx0cnVubmVyLm9uKCdlcnJvcicsIHRoaXMub25FcnJvci5iaW5kKHRoaXMpKTtcblx0XHRcdHJ1bm5lci5vbigncnVuU3RhcnQnLCB0aGlzLm9uUnVuU3RhcnQuYmluZCh0aGlzKSk7XG5cdFx0XHRydW5uZXIub24oJ3Rlc3RTdGFydCcsIHRoaXMub25UZXN0U3RhcnQuYmluZCh0aGlzKSk7XG5cdFx0XHRydW5uZXIub24oJ3Rlc3RFbmQnLCB0aGlzLm9uVGVzdEVuZC5iaW5kKHRoaXMpKTtcblx0XHRcdHJ1bm5lci5vbigncnVuRW5kJywgdGhpcy5vblJ1bkVuZC5iaW5kKHRoaXMpKTtcblx0XHR9XG5cdFx0X2NyZWF0ZUNsYXNzKENvbnNvbGVSZXBvcnRlciwgW3tcblx0XHRcdGtleTogXCJvbkVycm9yXCIsXG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24gb25FcnJvcihlcnJvcikge1xuXHRcdFx0XHR0aGlzLmxvZygnZXJyb3InLCBlcnJvcik7XG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0a2V5OiBcIm9uUnVuU3RhcnRcIixcblx0XHRcdHZhbHVlOiBmdW5jdGlvbiBvblJ1blN0YXJ0KHJ1blN0YXJ0KSB7XG5cdFx0XHRcdHRoaXMubG9nKCdydW5TdGFydCcsIHJ1blN0YXJ0KTtcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRrZXk6IFwib25UZXN0U3RhcnRcIixcblx0XHRcdHZhbHVlOiBmdW5jdGlvbiBvblRlc3RTdGFydCh0ZXN0KSB7XG5cdFx0XHRcdHRoaXMubG9nKCd0ZXN0U3RhcnQnLCB0ZXN0KTtcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRrZXk6IFwib25UZXN0RW5kXCIsXG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24gb25UZXN0RW5kKHRlc3QpIHtcblx0XHRcdFx0dGhpcy5sb2coJ3Rlc3RFbmQnLCB0ZXN0KTtcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRrZXk6IFwib25SdW5FbmRcIixcblx0XHRcdHZhbHVlOiBmdW5jdGlvbiBvblJ1bkVuZChydW5FbmQpIHtcblx0XHRcdFx0dGhpcy5sb2coJ3J1bkVuZCcsIHJ1bkVuZCk7XG5cdFx0XHR9XG5cdFx0fV0sIFt7XG5cdFx0XHRrZXk6IFwiaW5pdFwiLFxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIGluaXQocnVubmVyLCBvcHRpb25zKSB7XG5cdFx0XHRcdHJldHVybiBuZXcgQ29uc29sZVJlcG9ydGVyKHJ1bm5lciwgb3B0aW9ucyk7XG5cdFx0XHR9XG5cdFx0fV0pO1xuXHRcdHJldHVybiBDb25zb2xlUmVwb3J0ZXI7XG5cdH0oKTtcblxuXHQvLyBUT0RPOiBDb25zaWRlciB1c2luZyBnbG9iYWxUaGlzIGluc3RlYWQgb2Ygd2luZG93LCBzbyB0aGF0IHRoZSByZXBvcnRlclxuXHQvLyB3b3JrcyBmb3IgTm9kZS5qcyBhcyB3ZWxsLiBBcyB0aGlzIGNhbiBhZGQgb3ZlcmhlYWQsIHdlIHNob3VsZCBtYWtlXG5cdC8vIHRoaXMgb3B0LWluIGJlZm9yZSB3ZSBlbmFibGUgaXQgZm9yIENMSS5cblx0Ly9cblx0Ly8gUVVuaXQgMyB3aWxsIHN3aXRjaCBmcm9tIGB3aW5kb3dgIHRvIGBnbG9iYWxUaGlzYCBhbmQgdGhlbiBtYWtlIGl0XG5cdC8vIG5vIGxvbmdlciBhbiBpbXBsaWNpdCBmZWF0dXJlIG9mIHRoZSBIVE1MIFJlcG9ydGVyLCBidXQgcmF0aGVyIGxldFxuXHQvLyBpdCBiZSBvcHQtaW4gdmlhIGBRVW5pdC5jb25maWcucmVwb3J0ZXJzID0gWydwZXJmJ11gIG9yIHNvbWV0aGluZ1xuXHQvLyBsaWtlIHRoYXQuXG5cdHZhciBuYXRpdmVQZXJmID0gd2luZG93JDEgJiYgdHlwZW9mIHdpbmRvdyQxLnBlcmZvcm1hbmNlICE9PSAndW5kZWZpbmVkJyAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb21wYXQvY29tcGF0IC0tIENoZWNrZWRcblx0XHRcdFx0XHRcdFx0XHRcdCB0eXBlb2Ygd2luZG93JDEucGVyZm9ybWFuY2UubWFyayA9PT0gJ2Z1bmN0aW9uJyAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb21wYXQvY29tcGF0IC0tIENoZWNrZWRcblx0XHRcdFx0XHRcdFx0XHRcdCB0eXBlb2Ygd2luZG93JDEucGVyZm9ybWFuY2UubWVhc3VyZSA9PT0gJ2Z1bmN0aW9uJyA/IHdpbmRvdyQxLnBlcmZvcm1hbmNlIDogdW5kZWZpbmVkO1xuXHR2YXIgcGVyZiA9IHtcblx0XHRtZWFzdXJlOiBuYXRpdmVQZXJmID8gZnVuY3Rpb24gKGNvbW1lbnQsIHN0YXJ0TWFyaywgZW5kTWFyaykge1xuXHRcdFx0Ly8gYHBlcmZvcm1hbmNlLm1lYXN1cmVgIG1heSBmYWlsIGlmIHRoZSBtYXJrIGNvdWxkIG5vdCBiZSBmb3VuZC5cblx0XHRcdC8vIHJlYXNvbnMgYSBzcGVjaWZpYyBtYXJrIGNvdWxkIG5vdCBiZSBmb3VuZCBpbmNsdWRlOiBvdXRzaWRlIGNvZGUgaW52b2tpbmcgYHBlcmZvcm1hbmNlLmNsZWFyTWFya3MoKWBcblx0XHRcdHRyeSB7XG5cdFx0XHRcdG5hdGl2ZVBlcmYubWVhc3VyZShjb21tZW50LCBzdGFydE1hcmssIGVuZE1hcmspO1xuXHRcdFx0fSBjYXRjaCAoZXgpIHtcblx0XHRcdFx0TG9nZ2VyLndhcm4oJ3BlcmZvcm1hbmNlLm1lYXN1cmUgY291bGQgbm90IGJlIGV4ZWN1dGVkIGJlY2F1c2Ugb2YgJywgZXgubWVzc2FnZSk7XG5cdFx0XHR9XG5cdFx0fSA6IGZ1bmN0aW9uICgpIHt9LFxuXHRcdG1hcms6IG5hdGl2ZVBlcmYgPyBuYXRpdmVQZXJmLm1hcmsuYmluZChuYXRpdmVQZXJmKSA6IGZ1bmN0aW9uICgpIHt9XG5cdH07XG5cdHZhciBQZXJmUmVwb3J0ZXIgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKCkge1xuXHRcdGZ1bmN0aW9uIFBlcmZSZXBvcnRlcihydW5uZXIpIHtcblx0XHRcdHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcblx0XHRcdF9jbGFzc0NhbGxDaGVjayh0aGlzLCBQZXJmUmVwb3J0ZXIpO1xuXHRcdFx0dGhpcy5wZXJmID0gb3B0aW9ucy5wZXJmIHx8IHBlcmY7XG5cdFx0XHRydW5uZXIub24oJ3J1blN0YXJ0JywgdGhpcy5vblJ1blN0YXJ0LmJpbmQodGhpcykpO1xuXHRcdFx0cnVubmVyLm9uKCdydW5FbmQnLCB0aGlzLm9uUnVuRW5kLmJpbmQodGhpcykpO1xuXHRcdFx0cnVubmVyLm9uKCdzdWl0ZVN0YXJ0JywgdGhpcy5vblN1aXRlU3RhcnQuYmluZCh0aGlzKSk7XG5cdFx0XHRydW5uZXIub24oJ3N1aXRlRW5kJywgdGhpcy5vblN1aXRlRW5kLmJpbmQodGhpcykpO1xuXHRcdFx0cnVubmVyLm9uKCd0ZXN0U3RhcnQnLCB0aGlzLm9uVGVzdFN0YXJ0LmJpbmQodGhpcykpO1xuXHRcdFx0cnVubmVyLm9uKCd0ZXN0RW5kJywgdGhpcy5vblRlc3RFbmQuYmluZCh0aGlzKSk7XG5cdFx0fVxuXHRcdF9jcmVhdGVDbGFzcyhQZXJmUmVwb3J0ZXIsIFt7XG5cdFx0XHRrZXk6IFwib25SdW5TdGFydFwiLFxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIG9uUnVuU3RhcnQoKSB7XG5cdFx0XHRcdHRoaXMucGVyZi5tYXJrKCdxdW5pdF9zdWl0ZV8wX3N0YXJ0Jyk7XG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0a2V5OiBcIm9uU3VpdGVTdGFydFwiLFxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIG9uU3VpdGVTdGFydChzdWl0ZVN0YXJ0KSB7XG5cdFx0XHRcdHZhciBzdWl0ZUxldmVsID0gc3VpdGVTdGFydC5mdWxsTmFtZS5sZW5ndGg7XG5cdFx0XHRcdHRoaXMucGVyZi5tYXJrKFwicXVuaXRfc3VpdGVfXCIuY29uY2F0KHN1aXRlTGV2ZWwsIFwiX3N0YXJ0XCIpKTtcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRrZXk6IFwib25TdWl0ZUVuZFwiLFxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIG9uU3VpdGVFbmQoc3VpdGVFbmQpIHtcblx0XHRcdFx0dmFyIHN1aXRlTGV2ZWwgPSBzdWl0ZUVuZC5mdWxsTmFtZS5sZW5ndGg7XG5cdFx0XHRcdHZhciBzdWl0ZU5hbWUgPSBzdWl0ZUVuZC5mdWxsTmFtZS5qb2luKCcg4oCTICcpO1xuXHRcdFx0XHR0aGlzLnBlcmYubWFyayhcInF1bml0X3N1aXRlX1wiLmNvbmNhdChzdWl0ZUxldmVsLCBcIl9lbmRcIikpO1xuXHRcdFx0XHR0aGlzLnBlcmYubWVhc3VyZShcIlFVbml0IFRlc3QgU3VpdGU6IFwiLmNvbmNhdChzdWl0ZU5hbWUpLCBcInF1bml0X3N1aXRlX1wiLmNvbmNhdChzdWl0ZUxldmVsLCBcIl9zdGFydFwiKSwgXCJxdW5pdF9zdWl0ZV9cIi5jb25jYXQoc3VpdGVMZXZlbCwgXCJfZW5kXCIpKTtcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRrZXk6IFwib25UZXN0U3RhcnRcIixcblx0XHRcdHZhbHVlOiBmdW5jdGlvbiBvblRlc3RTdGFydCgpIHtcblx0XHRcdFx0dGhpcy5wZXJmLm1hcmsoJ3F1bml0X3Rlc3Rfc3RhcnQnKTtcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRrZXk6IFwib25UZXN0RW5kXCIsXG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24gb25UZXN0RW5kKHRlc3RFbmQpIHtcblx0XHRcdFx0dGhpcy5wZXJmLm1hcmsoJ3F1bml0X3Rlc3RfZW5kJyk7XG5cdFx0XHRcdHZhciB0ZXN0TmFtZSA9IHRlc3RFbmQuZnVsbE5hbWUuam9pbignIOKAkyAnKTtcblx0XHRcdFx0dGhpcy5wZXJmLm1lYXN1cmUoXCJRVW5pdCBUZXN0OiBcIi5jb25jYXQodGVzdE5hbWUpLCAncXVuaXRfdGVzdF9zdGFydCcsICdxdW5pdF90ZXN0X2VuZCcpO1xuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdGtleTogXCJvblJ1bkVuZFwiLFxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIG9uUnVuRW5kKCkge1xuXHRcdFx0XHR0aGlzLnBlcmYubWFyaygncXVuaXRfc3VpdGVfMF9lbmQnKTtcblx0XHRcdFx0dGhpcy5wZXJmLm1lYXN1cmUoJ1FVbml0IFRlc3QgUnVuJywgJ3F1bml0X3N1aXRlXzBfc3RhcnQnLCAncXVuaXRfc3VpdGVfMF9lbmQnKTtcblx0XHRcdH1cblx0XHR9XSwgW3tcblx0XHRcdGtleTogXCJpbml0XCIsXG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24gaW5pdChydW5uZXIsIG9wdGlvbnMpIHtcblx0XHRcdFx0cmV0dXJuIG5ldyBQZXJmUmVwb3J0ZXIocnVubmVyLCBvcHRpb25zKTtcblx0XHRcdH1cblx0XHR9XSk7XG5cdFx0cmV0dXJuIFBlcmZSZXBvcnRlcjtcblx0fSgpO1xuXG5cdHZhciBGT1JDRV9DT0xPUixcblx0XHROT0RFX0RJU0FCTEVfQ09MT1JTLFxuXHRcdE5PX0NPTE9SLFxuXHRcdFRFUk0sXG5cdFx0aXNUVFkgPSB0cnVlO1xuXHRpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0dmFyIF9yZWYgPSBwcm9jZXNzLmVudiB8fCB7fTtcblx0XHRGT1JDRV9DT0xPUiA9IF9yZWYuRk9SQ0VfQ09MT1I7XG5cdFx0Tk9ERV9ESVNBQkxFX0NPTE9SUyA9IF9yZWYuTk9ERV9ESVNBQkxFX0NPTE9SUztcblx0XHROT19DT0xPUiA9IF9yZWYuTk9fQ09MT1I7XG5cdFx0VEVSTSA9IF9yZWYuVEVSTTtcblx0XHRpc1RUWSA9IHByb2Nlc3Muc3Rkb3V0ICYmIHByb2Nlc3Muc3Rkb3V0LmlzVFRZO1xuXHR9XG5cdHZhciAkID0ge1xuXHRcdGVuYWJsZWQ6ICFOT0RFX0RJU0FCTEVfQ09MT1JTICYmIE5PX0NPTE9SID09IG51bGwgJiYgVEVSTSAhPT0gJ2R1bWInICYmIChGT1JDRV9DT0xPUiAhPSBudWxsICYmIEZPUkNFX0NPTE9SICE9PSAnMCcgfHwgaXNUVFkpLFxuXHRcdC8vIG1vZGlmaWVyc1xuXHRcdHJlc2V0OiBpbml0KDAsIDApLFxuXHRcdGJvbGQ6IGluaXQoMSwgMjIpLFxuXHRcdGRpbTogaW5pdCgyLCAyMiksXG5cdFx0aXRhbGljOiBpbml0KDMsIDIzKSxcblx0XHR1bmRlcmxpbmU6IGluaXQoNCwgMjQpLFxuXHRcdGludmVyc2U6IGluaXQoNywgMjcpLFxuXHRcdGhpZGRlbjogaW5pdCg4LCAyOCksXG5cdFx0c3RyaWtldGhyb3VnaDogaW5pdCg5LCAyOSksXG5cdFx0Ly8gY29sb3JzXG5cdFx0YmxhY2s6IGluaXQoMzAsIDM5KSxcblx0XHRyZWQ6IGluaXQoMzEsIDM5KSxcblx0XHRncmVlbjogaW5pdCgzMiwgMzkpLFxuXHRcdHllbGxvdzogaW5pdCgzMywgMzkpLFxuXHRcdGJsdWU6IGluaXQoMzQsIDM5KSxcblx0XHRtYWdlbnRhOiBpbml0KDM1LCAzOSksXG5cdFx0Y3lhbjogaW5pdCgzNiwgMzkpLFxuXHRcdHdoaXRlOiBpbml0KDM3LCAzOSksXG5cdFx0Z3JheTogaW5pdCg5MCwgMzkpLFxuXHRcdGdyZXk6IGluaXQoOTAsIDM5KSxcblx0XHQvLyBiYWNrZ3JvdW5kIGNvbG9yc1xuXHRcdGJnQmxhY2s6IGluaXQoNDAsIDQ5KSxcblx0XHRiZ1JlZDogaW5pdCg0MSwgNDkpLFxuXHRcdGJnR3JlZW46IGluaXQoNDIsIDQ5KSxcblx0XHRiZ1llbGxvdzogaW5pdCg0MywgNDkpLFxuXHRcdGJnQmx1ZTogaW5pdCg0NCwgNDkpLFxuXHRcdGJnTWFnZW50YTogaW5pdCg0NSwgNDkpLFxuXHRcdGJnQ3lhbjogaW5pdCg0NiwgNDkpLFxuXHRcdGJnV2hpdGU6IGluaXQoNDcsIDQ5KVxuXHR9O1xuXHRmdW5jdGlvbiBydW4oYXJyLCBzdHIpIHtcblx0XHR2YXIgaSA9IDAsXG5cdFx0XHR0bXAsXG5cdFx0XHRiZWcgPSAnJyxcblx0XHRcdGVuZCA9ICcnO1xuXHRcdGZvciAoOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0bXAgPSBhcnJbaV07XG5cdFx0XHRiZWcgKz0gdG1wLm9wZW47XG5cdFx0XHRlbmQgKz0gdG1wLmNsb3NlO1xuXHRcdFx0aWYgKCEhfnN0ci5pbmRleE9mKHRtcC5jbG9zZSkpIHtcblx0XHRcdFx0c3RyID0gc3RyLnJlcGxhY2UodG1wLnJneCwgdG1wLmNsb3NlICsgdG1wLm9wZW4pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gYmVnICsgc3RyICsgZW5kO1xuXHR9XG5cdGZ1bmN0aW9uIGNoYWluKGhhcywga2V5cykge1xuXHRcdHZhciBjdHggPSB7XG5cdFx0XHRoYXM6IGhhcyxcblx0XHRcdGtleXM6IGtleXNcblx0XHR9O1xuXHRcdGN0eC5yZXNldCA9ICQucmVzZXQuYmluZChjdHgpO1xuXHRcdGN0eC5ib2xkID0gJC5ib2xkLmJpbmQoY3R4KTtcblx0XHRjdHguZGltID0gJC5kaW0uYmluZChjdHgpO1xuXHRcdGN0eC5pdGFsaWMgPSAkLml0YWxpYy5iaW5kKGN0eCk7XG5cdFx0Y3R4LnVuZGVybGluZSA9ICQudW5kZXJsaW5lLmJpbmQoY3R4KTtcblx0XHRjdHguaW52ZXJzZSA9ICQuaW52ZXJzZS5iaW5kKGN0eCk7XG5cdFx0Y3R4LmhpZGRlbiA9ICQuaGlkZGVuLmJpbmQoY3R4KTtcblx0XHRjdHguc3RyaWtldGhyb3VnaCA9ICQuc3RyaWtldGhyb3VnaC5iaW5kKGN0eCk7XG5cdFx0Y3R4LmJsYWNrID0gJC5ibGFjay5iaW5kKGN0eCk7XG5cdFx0Y3R4LnJlZCA9ICQucmVkLmJpbmQoY3R4KTtcblx0XHRjdHguZ3JlZW4gPSAkLmdyZWVuLmJpbmQoY3R4KTtcblx0XHRjdHgueWVsbG93ID0gJC55ZWxsb3cuYmluZChjdHgpO1xuXHRcdGN0eC5ibHVlID0gJC5ibHVlLmJpbmQoY3R4KTtcblx0XHRjdHgubWFnZW50YSA9ICQubWFnZW50YS5iaW5kKGN0eCk7XG5cdFx0Y3R4LmN5YW4gPSAkLmN5YW4uYmluZChjdHgpO1xuXHRcdGN0eC53aGl0ZSA9ICQud2hpdGUuYmluZChjdHgpO1xuXHRcdGN0eC5ncmF5ID0gJC5ncmF5LmJpbmQoY3R4KTtcblx0XHRjdHguZ3JleSA9ICQuZ3JleS5iaW5kKGN0eCk7XG5cdFx0Y3R4LmJnQmxhY2sgPSAkLmJnQmxhY2suYmluZChjdHgpO1xuXHRcdGN0eC5iZ1JlZCA9ICQuYmdSZWQuYmluZChjdHgpO1xuXHRcdGN0eC5iZ0dyZWVuID0gJC5iZ0dyZWVuLmJpbmQoY3R4KTtcblx0XHRjdHguYmdZZWxsb3cgPSAkLmJnWWVsbG93LmJpbmQoY3R4KTtcblx0XHRjdHguYmdCbHVlID0gJC5iZ0JsdWUuYmluZChjdHgpO1xuXHRcdGN0eC5iZ01hZ2VudGEgPSAkLmJnTWFnZW50YS5iaW5kKGN0eCk7XG5cdFx0Y3R4LmJnQ3lhbiA9ICQuYmdDeWFuLmJpbmQoY3R4KTtcblx0XHRjdHguYmdXaGl0ZSA9ICQuYmdXaGl0ZS5iaW5kKGN0eCk7XG5cdFx0cmV0dXJuIGN0eDtcblx0fVxuXHRmdW5jdGlvbiBpbml0KG9wZW4sIGNsb3NlKSB7XG5cdFx0dmFyIGJsayA9IHtcblx0XHRcdG9wZW46IFwiXFx4MUJbXCIuY29uY2F0KG9wZW4sIFwibVwiKSxcblx0XHRcdGNsb3NlOiBcIlxceDFCW1wiLmNvbmNhdChjbG9zZSwgXCJtXCIpLFxuXHRcdFx0cmd4OiBuZXcgUmVnRXhwKFwiXFxcXHgxYlxcXFxbXCIuY29uY2F0KGNsb3NlLCBcIm1cIiksICdnJylcblx0XHR9O1xuXHRcdHJldHVybiBmdW5jdGlvbiAodHh0KSB7XG5cdFx0XHRpZiAodGhpcyAhPT0gdm9pZCAwICYmIHRoaXMuaGFzICE9PSB2b2lkIDApIHtcblx0XHRcdFx0ISF+dGhpcy5oYXMuaW5kZXhPZihvcGVuKSB8fCAodGhpcy5oYXMucHVzaChvcGVuKSwgdGhpcy5rZXlzLnB1c2goYmxrKSk7XG5cdFx0XHRcdHJldHVybiB0eHQgPT09IHZvaWQgMCA/IHRoaXMgOiAkLmVuYWJsZWQgPyBydW4odGhpcy5rZXlzLCB0eHQgKyAnJykgOiB0eHQgKyAnJztcblx0XHRcdH1cblx0XHRcdHJldHVybiB0eHQgPT09IHZvaWQgMCA/IGNoYWluKFtvcGVuXSwgW2Jsa10pIDogJC5lbmFibGVkID8gcnVuKFtibGtdLCB0eHQgKyAnJykgOiB0eHQgKyAnJztcblx0XHR9O1xuXHR9XG5cblx0dmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cblx0LyoqXG5cdCAqIEZvcm1hdCBhIGdpdmVuIHZhbHVlIGludG8gWUFNTC5cblx0ICpcblx0ICogWUFNTCBpcyBhIHN1cGVyc2V0IG9mIEpTT04gdGhhdCBzdXBwb3J0cyBhbGwgdGhlIHNhbWUgZGF0YVxuXHQgKiB0eXBlcyBhbmQgc3ludGF4LCBhbmQgbW9yZS4gQXMgc3VjaCwgaXQgaXMgYWx3YXlzIHBvc3NpYmxlXG5cdCAqIHRvIGZhbGxiYWNrIHRvIEpTT04uc3RyaW5nZmlmeSwgYnV0IHdlIGdlbmVyYWxseSBhdm9pZFxuXHQgKiB0aGF0IHRvIG1ha2Ugb3V0cHV0IGVhc2llciB0byByZWFkIGZvciBodW1hbnMuXG5cdCAqXG5cdCAqIFN1cHBvcnRlZCBkYXRhIHR5cGVzOlxuXHQgKlxuXHQgKiAtIG51bGxcblx0ICogLSBib29sZWFuXG5cdCAqIC0gbnVtYmVyXG5cdCAqIC0gc3RyaW5nXG5cdCAqIC0gYXJyYXlcblx0ICogLSBvYmplY3Rcblx0ICpcblx0ICogQW55dGhpbmcgZWxzZSAoaW5jbHVkaW5nIE5hTiwgSW5maW5pdHksIGFuZCB1bmRlZmluZWQpXG5cdCAqIG11c3QgYmUgZGVzY3JpYmVkIGluIHN0cmluZ3MsIGZvciBkaXNwbGF5IHB1cnBvc2VzLlxuXHQgKlxuXHQgKiBOb3RlIHRoYXQgcXVvdGVzIGFyZSBvcHRpb25hbCBpbiBZQU1MIHN0cmluZ3MgaWYgdGhlXG5cdCAqIHN0cmluZ3MgYXJlIFwic2ltcGxlXCIsIGFuZCBhcyBzdWNoIHdlIGdlbmVyYWxseSBwcmVmZXJcblx0ICogdGhhdCBmb3IgaW1wcm92ZWQgcmVhZGFiaWxpdHkuIFdlIG91dHB1dCBzdHJpbmdzIGluXG5cdCAqIG9uZSBvZiB0aHJlZSB3YXlzOlxuXHQgKlxuXHQgKiAtIGJhcmUgdW5xdW90ZWQgdGV4dCwgZm9yIHNpbXBsZSBvbmUtbGluZSBzdHJpbmdzLlxuXHQgKiAtIEpTT04gKHF1b3RlZCB0ZXh0KSwgZm9yIGNvbXBsZXggb25lLWxpbmUgc3RyaW5ncy5cblx0ICogLSBZQU1MIEJsb2NrLCBmb3IgY29tcGxleCBtdWx0aS1saW5lIHN0cmluZ3MuXG5cdCAqXG5cdCAqIE9iamVjdHMgd2l0aCBjeWNsaWNhbCByZWZlcmVuY2VzIHdpbGwgYmUgc3RyaW5naWZlZCBhc1xuXHQgKiBcIltDaXJjdWxhcl1cIiBhcyB0aGV5IGNhbm5vdCBvdGhlcndpc2UgYmUgcmVwcmVzZW50ZWQuXG5cdCAqL1xuXHRmdW5jdGlvbiBwcmV0dHlZYW1sVmFsdWUodmFsdWUpIHtcblx0XHR2YXIgaW5kZW50ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiA0O1xuXHRcdGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyBOb3Qgc3VwcG9ydGVkIGluIEpTT04vWUFNTCwgdHVybiBpbnRvIHN0cmluZ1xuXHRcdFx0Ly8gYW5kIGxldCB0aGUgYmVsb3cgb3V0cHV0IGl0IGFzIGJhcmUgc3RyaW5nLlxuXHRcdFx0dmFsdWUgPSBTdHJpbmcodmFsdWUpO1xuXHRcdH1cblxuXHRcdC8vIFN1cHBvcnQgSUUgOS0xMTogVXNlIGlzRmluaXRlIGluc3RlYWQgb2YgRVM2IE51bWJlci5pc0Zpbml0ZVxuXHRcdGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc0Zpbml0ZSh2YWx1ZSkpIHtcblx0XHRcdC8vIFR1cm4gTmFOIGFuZCBJbmZpbml0eSBpbnRvIHNpbXBsZSBzdHJpbmdzLlxuXHRcdFx0Ly8gUGFyYW5vaWE6IERvbid0IHJldHVybiBkaXJlY3RseSBqdXN0IGluIGNhc2UgdGhlcmUnc1xuXHRcdFx0Ly8gYSB3YXkgdG8gYWRkIHNwZWNpYWwgY2hhcmFjdGVycyBoZXJlLlxuXHRcdFx0dmFsdWUgPSBTdHJpbmcodmFsdWUpO1xuXHRcdH1cblx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuXHRcdFx0Ly8gU2ltcGxlIG51bWJlcnNcblx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHQvLyBJZiBhbnkgb2YgdGhlc2UgbWF0Y2gsIHRoZW4gd2UgY2FuJ3Qgb3V0cHV0IGl0XG5cdFx0XHQvLyBhcyBiYXJlIHVucXVvdGVkIHRleHQsIGJlY2F1c2UgdGhhdCB3b3VsZCBlaXRoZXJcblx0XHRcdC8vIGNhdXNlIGRhdGEgbG9zcyBvciBpbnZhbGlkIFlBTUwgc3ludGF4LlxuXHRcdFx0Ly9cblx0XHRcdC8vIC0gUXVvdGVzLCBlc2NhcGVzLCBsaW5lIGJyZWFrcywgb3IgSlNPTi1saWtlIHN0dWZmLlxuXHRcdFx0dmFyIHJTcGVjaWFsSnNvbiA9IC9bJ1wiXFxcXC9be31cXF1cXHJcXG5dLztcblxuXHRcdFx0Ly8gLSBDaGFyYWN0ZXJzIHRoYXQgYXJlIHNwZWNpYWwgYXQgdGhlIHN0YXJ0IG9mIGEgWUFNTCB2YWx1ZVxuXHRcdFx0dmFyIHJTcGVjaWFsWWFtbCA9IC9bLT86LFtcXF17fSMmKiF8PT4nXCIlQGBdLztcblxuXHRcdFx0Ly8gLSBMZWFkaW5nIG9yIHRyYWlsaW5nIHdoaXRlc3BhY2UuXG5cdFx0XHR2YXIgclVudHJpbW1lZCA9IC8oXlxcc3xcXHMkKS87XG5cblx0XHRcdC8vIC0gQW1iaWd1b3VzIGFzIFlBTUwgbnVtYmVyLCBlLmcuICcyJywgJy0xLjInLCAnLjInLCBvciAnMl8wMDAnXG5cdFx0XHR2YXIgck51bWVyaWNhbCA9IC9eW1xcZC5fLV0rJC87XG5cblx0XHRcdC8vIC0gQW1iaWd1b3VzIGFzIFlBTUwgYm9vbC5cblx0XHRcdC8vICAgVXNlIGNhc2UtaW5zZW5zaXRpdmUgbWF0Y2gsIGFsdGhvdWdoIHRlY2huaWNhbGx5IG9ubHlcblx0XHRcdC8vICAgZnVsbHktbG93ZXIsIGZ1bGx5LXVwcGVyLCBvciB1cHBlcmNhc2UtZmlyc3Qgd291bGQgYmUgYW1iaWd1b3VzLlxuXHRcdFx0Ly8gICBlLmcuIHRydWUvVHJ1ZS9UUlVFLCBidXQgbm90IHRSVWUuXG5cdFx0XHR2YXIgckJvb2wgPSAvXih0cnVlfGZhbHNlfHl8bnx5ZXN8bm98b258b2ZmKSQvaTtcblxuXHRcdFx0Ly8gSXMgdGhpcyBhIGNvbXBsZXggc3RyaW5nP1xuXHRcdFx0aWYgKHZhbHVlID09PSAnJyB8fCByU3BlY2lhbEpzb24udGVzdCh2YWx1ZSkgfHwgclNwZWNpYWxZYW1sLnRlc3QodmFsdWVbMF0pIHx8IHJVbnRyaW1tZWQudGVzdCh2YWx1ZSkgfHwgck51bWVyaWNhbC50ZXN0KHZhbHVlKSB8fCByQm9vbC50ZXN0KHZhbHVlKSkge1xuXHRcdFx0XHRpZiAoIS9cXG4vLnRlc3QodmFsdWUpKSB7XG5cdFx0XHRcdFx0Ly8gQ29tcGxleCBvbmUtbGluZSBzdHJpbmcsIHVzZSBKU09OIChxdW90ZWQgc3RyaW5nKVxuXHRcdFx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBTZWUgYWxzbyA8aHR0cHM6Ly95YW1sLW11bHRpbGluZS5pbmZvLz5cblx0XHRcdFx0Ly8gU3VwcG9ydCBJRSA5LTExOiBBdm9pZCBFUzYgU3RyaW5nI3JlcGVhdFxuXHRcdFx0XHR2YXIgcHJlZml4ID0gbmV3IEFycmF5KGluZGVudCArIDEpLmpvaW4oJyAnKTtcblx0XHRcdFx0dmFyIHRyYWlsaW5nTGluZWJyZWFrTWF0Y2ggPSB2YWx1ZS5tYXRjaCgvXFxuKyQvKTtcblx0XHRcdFx0dmFyIHRyYWlsaW5nTGluZWJyZWFrcyA9IHRyYWlsaW5nTGluZWJyZWFrTWF0Y2ggPyB0cmFpbGluZ0xpbmVicmVha01hdGNoWzBdLmxlbmd0aCA6IDA7XG5cdFx0XHRcdGlmICh0cmFpbGluZ0xpbmVicmVha3MgPT09IDEpIHtcblx0XHRcdFx0XHQvLyBVc2UgdGhlIG1vc3Qgc3RyYWlnaHQtZm9yd2FyZCBcIkJsb2NrXCIgc3RyaW5nIGluIFlBTUxcblx0XHRcdFx0XHQvLyB3aXRob3V0IGFueSBcIkNob21waW5nXCIgaW5kaWNhdG9ycy5cblx0XHRcdFx0XHR2YXIgbGluZXMgPSB2YWx1ZVxuXG5cdFx0XHRcdFx0XHQvLyBJZ25vcmUgdGhlIGxhc3QgbmV3IGxpbmUsIHNpbmNlIHdlJ2xsIGdldCB0aGF0IG9uZSBmb3IgZnJlZVxuXHRcdFx0XHRcdFx0Ly8gd2l0aCB0aGUgc3RyYWlnaHQtZm9yd2FyZCBCbG9jayBzeW50YXguXG5cdFx0XHRcdFx0XHQucmVwbGFjZSgvXFxuJC8sICcnKS5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uIChsaW5lKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwcmVmaXggKyBsaW5lO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0cmV0dXJuICd8XFxuJyArIGxpbmVzLmpvaW4oJ1xcbicpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIFRoaXMgaGFzIGVpdGhlciBubyB0cmFpbGluZyBuZXcgbGluZXMsIG9yIG1vcmUgdGhhbiAxLlxuXHRcdFx0XHRcdC8vIFVzZSB8KyBzbyB0aGF0IFlBTUwgcGFyc2VycyB3aWxsIHByZXNlcnZlIGl0IGV4YWN0bHkuXG5cdFx0XHRcdFx0dmFyIF9saW5lcyA9IHZhbHVlLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24gKGxpbmUpIHtcblx0XHRcdFx0XHRcdHJldHVybiBwcmVmaXggKyBsaW5lO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdHJldHVybiAnfCtcXG4nICsgX2xpbmVzLmpvaW4oJ1xcbicpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBTaW1wbGUgc3RyaW5nLCB1c2UgYmFyZSB1bnF1b3RlZCB0ZXh0XG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBIYW5kbGUgbnVsbCwgYm9vbGVhbiwgYXJyYXksIGFuZCBvYmplY3Rcblx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGVjeWNsZWRTaGFsbG93Q2xvbmUodmFsdWUpLCBudWxsLCAyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgc2hhbGxvdyBjbG9uZSBvZiBhbiBvYmplY3Qgd2hlcmUgY3ljbGVzIGhhdmVcblx0ICogYmVlbiByZXBsYWNlZCB3aXRoIFwiW0NpcmN1bGFyXVwiLlxuXHQgKi9cblx0ZnVuY3Rpb24gZGVjeWNsZWRTaGFsbG93Q2xvbmUob2JqZWN0KSB7XG5cdFx0dmFyIGFuY2VzdG9ycyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogW107XG5cdFx0aWYgKGFuY2VzdG9ycy5pbmRleE9mKG9iamVjdCkgIT09IC0xKSB7XG5cdFx0XHRyZXR1cm4gJ1tDaXJjdWxhcl0nO1xuXHRcdH1cblx0XHR2YXIgdHlwZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpLnJlcGxhY2UoL15cXFsuK1xccyguKz8pXSQvLCAnJDEnKS50b0xvd2VyQ2FzZSgpO1xuXHRcdHZhciBjbG9uZTtcblx0XHRzd2l0Y2ggKHR5cGUpIHtcblx0XHRcdGNhc2UgJ2FycmF5Jzpcblx0XHRcdFx0YW5jZXN0b3JzLnB1c2gob2JqZWN0KTtcblx0XHRcdFx0Y2xvbmUgPSBvYmplY3QubWFwKGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cdFx0XHRcdFx0cmV0dXJuIGRlY3ljbGVkU2hhbGxvd0Nsb25lKGVsZW1lbnQsIGFuY2VzdG9ycyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRhbmNlc3RvcnMucG9wKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnb2JqZWN0Jzpcblx0XHRcdFx0YW5jZXN0b3JzLnB1c2gob2JqZWN0KTtcblx0XHRcdFx0Y2xvbmUgPSB7fTtcblx0XHRcdFx0T2JqZWN0LmtleXMob2JqZWN0KS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0XHRjbG9uZVtrZXldID0gZGVjeWNsZWRTaGFsbG93Q2xvbmUob2JqZWN0W2tleV0sIGFuY2VzdG9ycyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRhbmNlc3RvcnMucG9wKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Y2xvbmUgPSBvYmplY3Q7XG5cdFx0fVxuXHRcdHJldHVybiBjbG9uZTtcblx0fVxuXHR2YXIgVGFwUmVwb3J0ZXIgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKCkge1xuXHRcdGZ1bmN0aW9uIFRhcFJlcG9ydGVyKHJ1bm5lcikge1xuXHRcdFx0dmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuXHRcdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIFRhcFJlcG9ydGVyKTtcblx0XHRcdC8vIENhY2hlIHJlZmVyZW5jZXMgdG8gY29uc29sZSBtZXRob2RzIHRvIGVuc3VyZSB3ZSBjYW4gcmVwb3J0IGZhaWx1cmVzXG5cdFx0XHQvLyBmcm9tIHRlc3RzIHRlc3RzIHRoYXQgbW9jayB0aGUgY29uc29sZSBvYmplY3QgaXRzZWxmLlxuXHRcdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL3F1bml0anMvcXVuaXQvaXNzdWVzLzEzNDBcblx0XHRcdC8vIFN1cHBvcnQgSUUgOTogRnVuY3Rpb24jYmluZCBpcyBzdXBwb3J0ZWQsIGJ1dCBubyBjb25zb2xlLmxvZy5iaW5kKCkuXG5cdFx0XHR0aGlzLmxvZyA9IG9wdGlvbnMubG9nIHx8IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kLmNhbGwoY29uc29sZSQxLmxvZywgY29uc29sZSQxKTtcblx0XHRcdHRoaXMudGVzdENvdW50ID0gMDtcblx0XHRcdHRoaXMuZW5kZWQgPSBmYWxzZTtcblx0XHRcdHRoaXMuYmFpbGVkID0gZmFsc2U7XG5cdFx0XHRydW5uZXIub24oJ2Vycm9yJywgdGhpcy5vbkVycm9yLmJpbmQodGhpcykpO1xuXHRcdFx0cnVubmVyLm9uKCdydW5TdGFydCcsIHRoaXMub25SdW5TdGFydC5iaW5kKHRoaXMpKTtcblx0XHRcdHJ1bm5lci5vbigndGVzdEVuZCcsIHRoaXMub25UZXN0RW5kLmJpbmQodGhpcykpO1xuXHRcdFx0cnVubmVyLm9uKCdydW5FbmQnLCB0aGlzLm9uUnVuRW5kLmJpbmQodGhpcykpO1xuXHRcdH1cblx0XHRfY3JlYXRlQ2xhc3MoVGFwUmVwb3J0ZXIsIFt7XG5cdFx0XHRrZXk6IFwib25SdW5TdGFydFwiLFxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIG9uUnVuU3RhcnQoX3J1blN1aXRlKSB7XG5cdFx0XHRcdHRoaXMubG9nKCdUQVAgdmVyc2lvbiAxMycpO1xuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdGtleTogXCJvbkVycm9yXCIsXG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24gb25FcnJvcihlcnJvcikge1xuXHRcdFx0XHRpZiAodGhpcy5iYWlsZWQpIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5iYWlsZWQgPSB0cnVlO1xuXG5cdFx0XHRcdC8vIEltaXRhdGUgb25UZXN0RW5kXG5cdFx0XHRcdC8vIFNraXAgdGhpcyBpZiB3ZSdyZSBwYXN0IFwicnVuRW5kXCIgYXMgaXQgd291bGQgbG9vayBvZGRcblx0XHRcdFx0aWYgKCF0aGlzLmVuZGVkKSB7XG5cdFx0XHRcdFx0dGhpcy50ZXN0Q291bnQgPSB0aGlzLnRlc3RDb3VudCArIDE7XG5cdFx0XHRcdFx0dGhpcy5sb2coJC5yZWQoXCJub3Qgb2sgXCIuY29uY2F0KHRoaXMudGVzdENvdW50LCBcIiBnbG9iYWwgZmFpbHVyZVwiKSkpO1xuXHRcdFx0XHRcdHRoaXMubG9nRXJyb3IoZXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMubG9nKCdCYWlsIG91dCEgJyArIGVycm9yU3RyaW5nKGVycm9yKS5zcGxpdCgnXFxuJylbMF0pO1xuXHRcdFx0XHRpZiAodGhpcy5lbmRlZCkge1xuXHRcdFx0XHRcdHRoaXMubG9nRXJyb3IoZXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0a2V5OiBcIm9uVGVzdEVuZFwiLFxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIG9uVGVzdEVuZCh0ZXN0KSB7XG5cdFx0XHRcdHZhciBfdGhpcyA9IHRoaXM7XG5cdFx0XHRcdHRoaXMudGVzdENvdW50ID0gdGhpcy50ZXN0Q291bnQgKyAxO1xuXHRcdFx0XHRpZiAodGVzdC5zdGF0dXMgPT09ICdwYXNzZWQnKSB7XG5cdFx0XHRcdFx0dGhpcy5sb2coXCJvayBcIi5jb25jYXQodGhpcy50ZXN0Q291bnQsIFwiIFwiKS5jb25jYXQodGVzdC5mdWxsTmFtZS5qb2luKCcgPiAnKSkpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHRlc3Quc3RhdHVzID09PSAnc2tpcHBlZCcpIHtcblx0XHRcdFx0XHR0aGlzLmxvZygkLnllbGxvdyhcIm9rIFwiLmNvbmNhdCh0aGlzLnRlc3RDb3VudCwgXCIgIyBTS0lQIFwiKS5jb25jYXQodGVzdC5mdWxsTmFtZS5qb2luKCcgPiAnKSkpKTtcblx0XHRcdFx0fSBlbHNlIGlmICh0ZXN0LnN0YXR1cyA9PT0gJ3RvZG8nKSB7XG5cdFx0XHRcdFx0dGhpcy5sb2coJC5jeWFuKFwibm90IG9rIFwiLmNvbmNhdCh0aGlzLnRlc3RDb3VudCwgXCIgIyBUT0RPIFwiKS5jb25jYXQodGVzdC5mdWxsTmFtZS5qb2luKCcgPiAnKSkpKTtcblx0XHRcdFx0XHR0ZXN0LmVycm9ycy5mb3JFYWNoKGZ1bmN0aW9uIChlcnJvcikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIF90aGlzLmxvZ0Fzc2VydGlvbihlcnJvciwgJ3RvZG8nKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLmxvZygkLnJlZChcIm5vdCBvayBcIi5jb25jYXQodGhpcy50ZXN0Q291bnQsIFwiIFwiKS5jb25jYXQodGVzdC5mdWxsTmFtZS5qb2luKCcgPiAnKSkpKTtcblx0XHRcdFx0XHR0ZXN0LmVycm9ycy5mb3JFYWNoKGZ1bmN0aW9uIChlcnJvcikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIF90aGlzLmxvZ0Fzc2VydGlvbihlcnJvcik7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRrZXk6IFwib25SdW5FbmRcIixcblx0XHRcdHZhbHVlOiBmdW5jdGlvbiBvblJ1bkVuZChydW5TdWl0ZSkge1xuXHRcdFx0XHR0aGlzLmVuZGVkID0gdHJ1ZTtcblx0XHRcdFx0dGhpcy5sb2coXCIxLi5cIi5jb25jYXQocnVuU3VpdGUudGVzdENvdW50cy50b3RhbCkpO1xuXHRcdFx0XHR0aGlzLmxvZyhcIiMgcGFzcyBcIi5jb25jYXQocnVuU3VpdGUudGVzdENvdW50cy5wYXNzZWQpKTtcblx0XHRcdFx0dGhpcy5sb2coJC55ZWxsb3coXCIjIHNraXAgXCIuY29uY2F0KHJ1blN1aXRlLnRlc3RDb3VudHMuc2tpcHBlZCkpKTtcblx0XHRcdFx0dGhpcy5sb2coJC5jeWFuKFwiIyB0b2RvIFwiLmNvbmNhdChydW5TdWl0ZS50ZXN0Q291bnRzLnRvZG8pKSk7XG5cdFx0XHRcdHRoaXMubG9nKCQucmVkKFwiIyBmYWlsIFwiLmNvbmNhdChydW5TdWl0ZS50ZXN0Q291bnRzLmZhaWxlZCkpKTtcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRrZXk6IFwibG9nQXNzZXJ0aW9uXCIsXG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24gbG9nQXNzZXJ0aW9uKGVycm9yLCBzZXZlcml0eSkge1xuXHRcdFx0XHR2YXIgb3V0ID0gJyAgLS0tJztcblx0XHRcdFx0b3V0ICs9IFwiXFxuICBtZXNzYWdlOiBcIi5jb25jYXQocHJldHR5WWFtbFZhbHVlKGVycm9yLm1lc3NhZ2UgfHwgJ2ZhaWxlZCcpKTtcblx0XHRcdFx0b3V0ICs9IFwiXFxuICBzZXZlcml0eTogXCIuY29uY2F0KHByZXR0eVlhbWxWYWx1ZShzZXZlcml0eSB8fCAnZmFpbGVkJykpO1xuXHRcdFx0XHRpZiAoaGFzT3duLmNhbGwoZXJyb3IsICdhY3R1YWwnKSkge1xuXHRcdFx0XHRcdG91dCArPSBcIlxcbiAgYWN0dWFsICA6IFwiLmNvbmNhdChwcmV0dHlZYW1sVmFsdWUoZXJyb3IuYWN0dWFsKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGhhc093bi5jYWxsKGVycm9yLCAnZXhwZWN0ZWQnKSkge1xuXHRcdFx0XHRcdG91dCArPSBcIlxcbiAgZXhwZWN0ZWQ6IFwiLmNvbmNhdChwcmV0dHlZYW1sVmFsdWUoZXJyb3IuZXhwZWN0ZWQpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoZXJyb3Iuc3RhY2spIHtcblx0XHRcdFx0XHQvLyBTaW5jZSBzdGFja3MgYXJlbid0IHVzZXIgZ2VuZXJhdGVkLCB0YWtlIGEgYml0IG9mIGxpYmVydHkgYnlcblx0XHRcdFx0XHQvLyBhZGRpbmcgYSB0cmFpbGluZyBuZXcgbGluZSB0byBhbGxvdyBhIHN0cmFpZ2h0LWZvcndhcmQgWUFNTCBCbG9ja3MuXG5cdFx0XHRcdFx0b3V0ICs9IFwiXFxuICBzdGFjazogXCIuY29uY2F0KHByZXR0eVlhbWxWYWx1ZShlcnJvci5zdGFjayArICdcXG4nKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0b3V0ICs9ICdcXG4gIC4uLic7XG5cdFx0XHRcdHRoaXMubG9nKG91dCk7XG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0a2V5OiBcImxvZ0Vycm9yXCIsXG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24gbG9nRXJyb3IoZXJyb3IpIHtcblx0XHRcdFx0dmFyIG91dCA9ICcgIC0tLSc7XG5cdFx0XHRcdG91dCArPSBcIlxcbiAgbWVzc2FnZTogXCIuY29uY2F0KHByZXR0eVlhbWxWYWx1ZShlcnJvclN0cmluZyhlcnJvcikpKTtcblx0XHRcdFx0b3V0ICs9IFwiXFxuICBzZXZlcml0eTogXCIuY29uY2F0KHByZXR0eVlhbWxWYWx1ZSgnZmFpbGVkJykpO1xuXHRcdFx0XHRpZiAoZXJyb3IgJiYgZXJyb3Iuc3RhY2spIHtcblx0XHRcdFx0XHRvdXQgKz0gXCJcXG4gIHN0YWNrOiBcIi5jb25jYXQocHJldHR5WWFtbFZhbHVlKGVycm9yLnN0YWNrICsgJ1xcbicpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRvdXQgKz0gJ1xcbiAgLi4uJztcblx0XHRcdFx0dGhpcy5sb2cob3V0KTtcblx0XHRcdH1cblx0XHR9XSwgW3tcblx0XHRcdGtleTogXCJpbml0XCIsXG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24gaW5pdChydW5uZXIsIG9wdGlvbnMpIHtcblx0XHRcdFx0cmV0dXJuIG5ldyBUYXBSZXBvcnRlcihydW5uZXIsIG9wdGlvbnMpO1xuXHRcdFx0fVxuXHRcdH1dKTtcblx0XHRyZXR1cm4gVGFwUmVwb3J0ZXI7XG5cdH0oKTtcblxuXHR2YXIgcmVwb3J0ZXJzID0ge1xuXHRcdGNvbnNvbGU6IENvbnNvbGVSZXBvcnRlcixcblx0XHRwZXJmOiBQZXJmUmVwb3J0ZXIsXG5cdFx0dGFwOiBUYXBSZXBvcnRlclxuXHR9O1xuXG5cdGZ1bmN0aW9uIG1ha2VBZGRHbG9iYWxIb29rKGhvb2tOYW1lKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uIGFkZEdsb2JhbEhvb2soY2FsbGJhY2spIHtcblx0XHRcdGlmICghY29uZmlnLmdsb2JhbEhvb2tzW2hvb2tOYW1lXSkge1xuXHRcdFx0XHRjb25maWcuZ2xvYmFsSG9va3NbaG9va05hbWVdID0gW107XG5cdFx0XHR9XG5cdFx0XHRjb25maWcuZ2xvYmFsSG9va3NbaG9va05hbWVdLnB1c2goY2FsbGJhY2spO1xuXHRcdH07XG5cdH1cblx0dmFyIGhvb2tzID0ge1xuXHRcdGJlZm9yZUVhY2g6IG1ha2VBZGRHbG9iYWxIb29rKCdiZWZvcmVFYWNoJyksXG5cdFx0YWZ0ZXJFYWNoOiBtYWtlQWRkR2xvYmFsSG9vaygnYWZ0ZXJFYWNoJylcblx0fTtcblxuXHQvKipcblx0ICogSGFuZGxlIGEgZ2xvYmFsIGVycm9yIHRoYXQgc2hvdWxkIHJlc3VsdCBpbiBhIGZhaWxlZCB0ZXN0IHJ1bi5cblx0ICpcblx0ICogU3VtbWFyeTpcblx0ICpcblx0ICogLSBJZiB3ZSdyZSBzdHJpY3RseSBpbnNpZGUgYSB0ZXN0IChvciBvbmUgaWYgaXRzIG1vZHVsZSBob29rcyksIHRoZSBleGNlcHRpb25cblx0ICogICBiZWNvbWVzIGEgZmFpbGVkIGFzc2VydGlvbi5cblx0ICpcblx0ICogICBUaGlzIGhhcyB0aGUgaW1wb3J0YW50IHNpZGUtZWZmZWN0IHRoYXQgdW5jYXVnaHQgZXhjZXB0aW9ucyAoc3VjaCBhc1xuXHQgKiAgIGNhbGxpbmcgYW4gdW5kZWZpbmVkIGZ1bmN0aW9uKSBkdXJpbmcgYSBcInRvZG9cIiB0ZXN0IGRvIE5PVCByZXN1bHQgaW5cblx0ICogICBhIGZhaWxlZCB0ZXN0IHJ1bi5cblx0ICpcblx0ICogLSBJZiB3ZSdyZSBhbnl3aGVyZSBvdXRzaWRlIGEgdGVzdCAoYmUgaXQgaW4gZWFybHkgZXZlbnQgY2FsbGJhY2tzLCBvclxuXHQgKiAgIGludGVybmFsbHkgYmV0d2VlbiB0ZXN0cywgb3Igc29tZXdoZXJlIGFmdGVyIFwicnVuRW5kXCIgaWYgdGhlIHByb2Nlc3MgaXNcblx0ICogICBzdGlsbCBhbGl2ZSBmb3Igc29tZSByZWFzb24pLCB0aGVuIHNlbmQgYW4gXCJlcnJvclwiIGV2ZW50IHRvIHRoZSByZXBvcnRlcnMuXG5cdCAqXG5cdCAqIEBzaW5jZSAyLjE3LjBcblx0ICogQHBhcmFtIHtFcnJvcnxhbnl9IGVycm9yXG5cdCAqL1xuXHRmdW5jdGlvbiBvblVuY2F1Z2h0RXhjZXB0aW9uKGVycm9yKSB7XG5cdFx0aWYgKGNvbmZpZy5jdXJyZW50KSB7XG5cdFx0XHRjb25maWcuY3VycmVudC5hc3NlcnQucHVzaFJlc3VsdCh7XG5cdFx0XHRcdHJlc3VsdDogZmFsc2UsXG5cdFx0XHRcdG1lc3NhZ2U6IFwiZ2xvYmFsIGZhaWx1cmU6IFwiLmNvbmNhdChlcnJvclN0cmluZyhlcnJvcikpLFxuXHRcdFx0XHQvLyBXZSBjb3VsZCBsZXQgY2FsbGVycyBzcGVjaWZ5IGFuIG9mZnNldCB0byBzdWJ0cmFjdCBhIG51bWJlciBvZiBmcmFtZXMgdmlhXG5cdFx0XHRcdC8vIHNvdXJjZUZyb21TdGFja3RyYWNlLCBpbiBjYXNlIHRoZXkgYXJlIGEgd3JhcHBlciBmdXJ0aGVyIGF3YXkgZnJvbSB0aGUgZXJyb3Jcblx0XHRcdFx0Ly8gaGFuZGxlciwgYW5kIHRodXMgcmVkdWNlIHNvbWUgbm9pc2UgaW4gdGhlIHN0YWNrIHRyYWNlLiBIb3dldmVyLCB3ZSdyZSBub3Rcblx0XHRcdFx0Ly8gZG9pbmcgdGhpcyByaWdodCBub3cgYmVjYXVzZSBpdCB3b3VsZCBhbG1vc3QgbmV2ZXIgYmUgdXNlZCBpbiBwcmFjdGljZSBnaXZlblxuXHRcdFx0XHQvLyB0aGUgdmFzdCBtYWpvcml0eSBvZiBlcnJvciB2YWx1ZXMgd2lsbCBiZSBFcnJvciBvYmplY3RzLCBhbmQgdGh1cyBoYXZlIHRoZWlyXG5cdFx0XHRcdC8vIG93biBzdGFjayB0cmFjZSBhbHJlYWR5LlxuXHRcdFx0XHRzb3VyY2U6IGVycm9yICYmIGVycm9yLnN0YWNrIHx8IHNvdXJjZUZyb21TdGFja3RyYWNlKDIpXG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gVGhlIFwiZXJyb3JcIiBldmVudCB3YXMgYWRkZWQgaW4gUVVuaXQgMi4xNy5cblx0XHRcdC8vIEluY3JlYXNlIFwiYmFkIGFzc2VydGlvblwiIHN0YXRzIGRlc3BpdGUgbm8gbG9uZ2VyIHB1c2hpbmcgYW4gYXNzZXJ0aW9uIGluIHRoaXMgY2FzZS5cblx0XHRcdC8vIFRoaXMgZW5zdXJlcyBcInJ1bkVuZFwiIGFuZCBcIlFVbml0LmRvbmUoKVwiIGhhbmRsZXJzIGJlaGF2ZSBhcyBleHBlY3RlZCwgc2luY2UgdGhlIFwiYmFkXCJcblx0XHRcdC8vIGNvdW50IGlzIHR5cGljYWxseSBob3cgcmVwb3J0ZXJzIGRlY2lkZSBvbiB0aGUgYm9vbGVhbiBvdXRjb21lIG9mIHRoZSB0ZXN0IHJ1bi5cblx0XHRcdHJ1blN1aXRlLmdsb2JhbEZhaWx1cmVDb3VudCsrO1xuXHRcdFx0Y29uZmlnLnN0YXRzLmJhZCsrO1xuXHRcdFx0Y29uZmlnLnN0YXRzLmFsbCsrO1xuXHRcdFx0ZW1pdCgnZXJyb3InLCBlcnJvcik7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZSBhIHdpbmRvdy5vbmVycm9yIGVycm9yLlxuXHQgKlxuXHQgKiBJZiB0aGVyZSBpcyBhIGN1cnJlbnQgdGVzdCB0aGF0IHNldHMgdGhlIGludGVybmFsIGBpZ25vcmVHbG9iYWxFcnJvcnNgIGZpZWxkXG5cdCAqIChzdWNoIGFzIGR1cmluZyBgYXNzZXJ0LnRocm93cygpYCksIHRoZW4gdGhlIGVycm9yIGlzIGlnbm9yZWQgYW5kIG5hdGl2ZVxuXHQgKiBlcnJvciByZXBvcnRpbmcgaXMgc3VwcHJlc3NlZCBhcyB3ZWxsLiBUaGlzIGlzIGJlY2F1c2UgaW4gYnJvd3NlcnMsIGFuIGVycm9yXG5cdCAqIGNhbiBzb21ldGltZXMgZW5kIHVwIGluIGB3aW5kb3cub25lcnJvcmAgaW5zdGVhZCBvZiBpbiB0aGUgbG9jYWwgdHJ5L2NhdGNoLlxuXHQgKiBUaGlzIGlnbm9yaW5nIG9mIGVycm9ycyBkb2VzIG5vdCBhcHBseSB0byBvdXIgZ2VuZXJhbCBvblVuY2F1Z2h0RXhjZXB0aW9uXG5cdCAqIG1ldGhvZCwgbm9yIHRvIG91ciBgdW5oYW5kbGVkUmVqZWN0aW9uYCBoYW5kbGVycywgYXMgdGhvc2UgYXJlIG5vdCBtZWFudFxuXHQgKiB0byByZWNlaXZlIGFuIFwiZXhwZWN0ZWRcIiBlcnJvciBkdXJpbmcgYGFzc2VydC50aHJvd3MoKWAuXG5cdCAqXG5cdCAqIEBzZWUgPGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9HbG9iYWxFdmVudEhhbmRsZXJzL29uZXJyb3I+XG5cdCAqIEBkZXByZWNhdGVkIHNpbmNlIDIuMTcuMCBVc2UgUVVuaXQub25VbmNhdWdodEV4Y2VwdGlvbiBpbnN0ZWFkLlxuXHQgKiBAcGFyYW0ge09iamVjdH0gZGV0YWlsc1xuXHQgKiBAcGFyYW0ge3N0cmluZ30gZGV0YWlscy5tZXNzYWdlXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBkZXRhaWxzLmZpbGVOYW1lXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBkZXRhaWxzLmxpbmVOdW1iZXJcblx0ICogQHBhcmFtIHtzdHJpbmd8dW5kZWZpbmVkfSBbZGV0YWlscy5zdGFja3RyYWNlXVxuXHQgKiBAcmV0dXJuIHtib29sfSBUcnVlIGlmIG5hdGl2ZSBlcnJvciByZXBvcnRpbmcgc2hvdWxkIGJlIHN1cHByZXNzZWQuXG5cdCAqL1xuXHRmdW5jdGlvbiBvbldpbmRvd0Vycm9yKGRldGFpbHMpIHtcblx0XHRMb2dnZXIud2FybignUVVuaXQub25FcnJvciBpcyBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gUVVuaXQgMy4wLicgKyAnIFBsZWFzZSB1c2UgUVVuaXQub25VbmNhdWdodEV4Y2VwdGlvbiBpbnN0ZWFkLicpO1xuXHRcdGlmIChjb25maWcuY3VycmVudCAmJiBjb25maWcuY3VycmVudC5pZ25vcmVHbG9iYWxFcnJvcnMpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHR2YXIgZXJyID0gbmV3IEVycm9yKGRldGFpbHMubWVzc2FnZSk7XG5cdFx0ZXJyLnN0YWNrID0gZGV0YWlscy5zdGFja3RyYWNlIHx8IGRldGFpbHMuZmlsZU5hbWUgKyAnOicgKyBkZXRhaWxzLmxpbmVOdW1iZXI7XG5cdFx0b25VbmNhdWdodEV4Y2VwdGlvbihlcnIpO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHZhciBRVW5pdCA9IHt9O1xuXG5cdC8vIFRoZSBcImN1cnJlbnRNb2R1bGVcIiBvYmplY3Qgd291bGQgaWRlYWxseSBiZSBkZWZpbmVkIHVzaW5nIHRoZSBjcmVhdGVNb2R1bGUoKVxuXHQvLyBmdW5jdGlvbi4gU2luY2UgaXQgaXNuJ3QsIGFkZCB0aGUgbWlzc2luZyBzdWl0ZVJlcG9ydCBwcm9wZXJ0eSB0byBpdCBub3cgdGhhdFxuXHQvLyB3ZSBoYXZlIGxvYWRlZCBhbGwgc291cmNlIGNvZGUgcmVxdWlyZWQgdG8gZG8gc28uXG5cdC8vXG5cdC8vIFRPRE86IENvbnNpZGVyIGRlZmluaW5nIGN1cnJlbnRNb2R1bGUgaW4gY29yZS5qcyBvciBtb2R1bGUuanMgaW4gaXRzIGVudGlyZWx5XG5cdC8vIHJhdGhlciB0aGFuIHBhcnRseSBpbiBjb25maWcuanMgYW5kIHBhcnRseSBoZXJlLlxuXHRjb25maWcuY3VycmVudE1vZHVsZS5zdWl0ZVJlcG9ydCA9IHJ1blN1aXRlO1xuXHR2YXIgZ2xvYmFsU3RhcnRDYWxsZWQgPSBmYWxzZTtcblx0dmFyIHJ1blN0YXJ0ZWQgPSBmYWxzZTtcblxuXHQvLyBGaWd1cmUgb3V0IGlmIHdlJ3JlIHJ1bm5pbmcgdGhlIHRlc3RzIGZyb20gYSBzZXJ2ZXIgb3Igbm90XG5cdFFVbml0LmlzTG9jYWwgPSB3aW5kb3ckMSAmJiB3aW5kb3ckMS5sb2NhdGlvbiAmJiB3aW5kb3ckMS5sb2NhdGlvbi5wcm90b2NvbCA9PT0gJ2ZpbGU6JztcblxuXHQvLyBFeHBvc2UgdGhlIGN1cnJlbnQgUVVuaXQgdmVyc2lvblxuXHRRVW5pdC52ZXJzaW9uID0gJzIuMjAuMCc7XG5cdGV4dGVuZChRVW5pdCwge1xuXHRcdGNvbmZpZzogY29uZmlnLFxuXHRcdGR1bXA6IGR1bXAsXG5cdFx0ZXF1aXY6IGVxdWl2LFxuXHRcdHJlcG9ydGVyczogcmVwb3J0ZXJzLFxuXHRcdGhvb2tzOiBob29rcyxcblx0XHRpczogaXMsXG5cdFx0b2JqZWN0VHlwZTogb2JqZWN0VHlwZSxcblx0XHRvbjogb24sXG5cdFx0b25FcnJvcjogb25XaW5kb3dFcnJvcixcblx0XHRvblVuY2F1Z2h0RXhjZXB0aW9uOiBvblVuY2F1Z2h0RXhjZXB0aW9uLFxuXHRcdHB1c2hGYWlsdXJlOiBwdXNoRmFpbHVyZSxcblx0XHRhc3NlcnQ6IEFzc2VydC5wcm90b3R5cGUsXG5cdFx0bW9kdWxlOiBtb2R1bGUkMSxcblx0XHR0ZXN0OiB0ZXN0LFxuXHRcdC8vIGFsaWFzIG90aGVyIHRlc3QgZmxhdm9ycyBmb3IgZWFzeSBhY2Nlc3Ncblx0XHR0b2RvOiB0ZXN0LnRvZG8sXG5cdFx0c2tpcDogdGVzdC5za2lwLFxuXHRcdG9ubHk6IHRlc3Qub25seSxcblx0XHRzdGFydDogZnVuY3Rpb24gc3RhcnQoY291bnQpIHtcblx0XHRcdGlmIChjb25maWcuY3VycmVudCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1FVbml0LnN0YXJ0IGNhbm5vdCBiZSBjYWxsZWQgaW5zaWRlIGEgdGVzdCBjb250ZXh0LicpO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGdsb2JhbFN0YXJ0QWxyZWFkeUNhbGxlZCA9IGdsb2JhbFN0YXJ0Q2FsbGVkO1xuXHRcdFx0Z2xvYmFsU3RhcnRDYWxsZWQgPSB0cnVlO1xuXHRcdFx0aWYgKHJ1blN0YXJ0ZWQpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdDYWxsZWQgc3RhcnQoKSB3aGlsZSB0ZXN0IGFscmVhZHkgc3RhcnRlZCBydW5uaW5nJyk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoZ2xvYmFsU3RhcnRBbHJlYWR5Q2FsbGVkIHx8IGNvdW50ID4gMSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0NhbGxlZCBzdGFydCgpIG91dHNpZGUgb2YgYSB0ZXN0IGNvbnRleHQgdG9vIG1hbnkgdGltZXMnKTtcblx0XHRcdH1cblx0XHRcdGlmIChjb25maWcuYXV0b3N0YXJ0KSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignQ2FsbGVkIHN0YXJ0KCkgb3V0c2lkZSBvZiBhIHRlc3QgY29udGV4dCB3aGVuICcgKyAnUVVuaXQuY29uZmlnLmF1dG9zdGFydCB3YXMgdHJ1ZScpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCFjb25maWcucGFnZUxvYWRlZCkge1xuXHRcdFx0XHQvLyBUaGUgcGFnZSBpc24ndCBjb21wbGV0ZWx5IGxvYWRlZCB5ZXQsIHNvIHdlIHNldCBhdXRvc3RhcnQgYW5kIHRoZW5cblx0XHRcdFx0Ly8gbG9hZCBpZiB3ZSdyZSBpbiBOb2RlIG9yIHdhaXQgZm9yIHRoZSBicm93c2VyJ3MgbG9hZCBldmVudC5cblx0XHRcdFx0Y29uZmlnLmF1dG9zdGFydCA9IHRydWU7XG5cblx0XHRcdFx0Ly8gU3RhcnRzIGZyb20gTm9kZSBldmVuIGlmIC5sb2FkIHdhcyBub3QgcHJldmlvdXNseSBjYWxsZWQuIFdlIHN0aWxsIHJldHVyblxuXHRcdFx0XHQvLyBlYXJseSBvdGhlcndpc2Ugd2UnbGwgd2luZCB1cCBcImJlZ2lubmluZ1wiIHR3aWNlLlxuXHRcdFx0XHRpZiAoIWRvY3VtZW50KSB7XG5cdFx0XHRcdFx0UVVuaXQubG9hZCgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHNjaGVkdWxlQmVnaW4oKTtcblx0XHR9LFxuXHRcdG9uVW5oYW5kbGVkUmVqZWN0aW9uOiBmdW5jdGlvbiBvblVuaGFuZGxlZFJlamVjdGlvbihyZWFzb24pIHtcblx0XHRcdExvZ2dlci53YXJuKCdRVW5pdC5vblVuaGFuZGxlZFJlamVjdGlvbiBpcyBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gUVVuaXQgMy4wLicgKyAnIFBsZWFzZSB1c2UgUVVuaXQub25VbmNhdWdodEV4Y2VwdGlvbiBpbnN0ZWFkLicpO1xuXHRcdFx0b25VbmNhdWdodEV4Y2VwdGlvbihyZWFzb24pO1xuXHRcdH0sXG5cdFx0ZXh0ZW5kOiBmdW5jdGlvbiBleHRlbmQkMSgpIHtcblx0XHRcdExvZ2dlci53YXJuKCdRVW5pdC5leHRlbmQgaXMgZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIFFVbml0IDMuMC4nICsgJyBQbGVhc2UgdXNlIE9iamVjdC5hc3NpZ24gaW5zdGVhZC4nKTtcblxuXHRcdFx0Ly8gZGVsZWdhdGUgdG8gdXRpbGl0eSBpbXBsZW1lbnRhdGlvbiwgd2hpY2ggZG9lcyBub3Qgd2FybiBhbmQgY2FuIGJlIHVzZWQgZWxzZXdoZXJlIGludGVybmFsbHlcblx0XHRcdGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gbmV3IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuXHRcdFx0XHRhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGV4dGVuZC5hcHBseSh0aGlzLCBhcmdzKTtcblx0XHR9LFxuXHRcdGxvYWQ6IGZ1bmN0aW9uIGxvYWQoKSB7XG5cdFx0XHRjb25maWcucGFnZUxvYWRlZCA9IHRydWU7XG5cblx0XHRcdC8vIEluaXRpYWxpemUgdGhlIGNvbmZpZ3VyYXRpb24gb3B0aW9uc1xuXHRcdFx0ZXh0ZW5kKGNvbmZpZywge1xuXHRcdFx0XHRzdGFydGVkOiAwLFxuXHRcdFx0XHR1cGRhdGVSYXRlOiAxMDAwLFxuXHRcdFx0XHRhdXRvc3RhcnQ6IHRydWUsXG5cdFx0XHRcdGZpbHRlcjogJydcblx0XHRcdH0sIHRydWUpO1xuXHRcdFx0aWYgKCFydW5TdGFydGVkKSB7XG5cdFx0XHRcdGNvbmZpZy5ibG9ja2luZyA9IGZhbHNlO1xuXHRcdFx0XHRpZiAoY29uZmlnLmF1dG9zdGFydCkge1xuXHRcdFx0XHRcdHNjaGVkdWxlQmVnaW4oKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0c3RhY2s6IGZ1bmN0aW9uIHN0YWNrKG9mZnNldCkge1xuXHRcdFx0b2Zmc2V0ID0gKG9mZnNldCB8fCAwKSArIDI7XG5cdFx0XHRyZXR1cm4gc291cmNlRnJvbVN0YWNrdHJhY2Uob2Zmc2V0KTtcblx0XHR9XG5cdH0pO1xuXHRyZWdpc3RlckxvZ2dpbmdDYWxsYmFja3MoUVVuaXQpO1xuXHRmdW5jdGlvbiBzY2hlZHVsZUJlZ2luKCkge1xuXHRcdHJ1blN0YXJ0ZWQgPSB0cnVlO1xuXG5cdFx0Ly8gQWRkIGEgc2xpZ2h0IGRlbGF5IHRvIGFsbG93IGRlZmluaXRpb24gb2YgbW9yZSBtb2R1bGVzIGFuZCB0ZXN0cy5cblx0XHRpZiAoc2V0VGltZW91dCQxKSB7XG5cdFx0XHRzZXRUaW1lb3V0JDEoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRiZWdpbigpO1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGJlZ2luKCk7XG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIHVuYmxvY2tBbmRBZHZhbmNlUXVldWUoKSB7XG5cdFx0Y29uZmlnLmJsb2NraW5nID0gZmFsc2U7XG5cdFx0UHJvY2Vzc2luZ1F1ZXVlLmFkdmFuY2UoKTtcblx0fVxuXHRmdW5jdGlvbiBiZWdpbigpIHtcblx0XHRpZiAoY29uZmlnLnN0YXJ0ZWQpIHtcblx0XHRcdHVuYmxvY2tBbmRBZHZhbmNlUXVldWUoKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBUaGUgdGVzdCBydW4gaGFzbid0IG9mZmljaWFsbHkgYmVndW4geWV0XG5cdFx0Ly8gUmVjb3JkIHRoZSB0aW1lIG9mIHRoZSB0ZXN0IHJ1bidzIGJlZ2lubmluZ1xuXHRcdGNvbmZpZy5zdGFydGVkID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cblx0XHQvLyBEZWxldGUgdGhlIGxvb3NlIHVubmFtZWQgbW9kdWxlIGlmIHVudXNlZC5cblx0XHRpZiAoY29uZmlnLm1vZHVsZXNbMF0ubmFtZSA9PT0gJycgJiYgY29uZmlnLm1vZHVsZXNbMF0udGVzdHMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRjb25maWcubW9kdWxlcy5zaGlmdCgpO1xuXHRcdH1cblx0XHR2YXIgbW9kdWxlc0xvZyA9IFtdO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY29uZmlnLm1vZHVsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdC8vIERvbid0IGV4cG9zZSB0aGUgdW5uYW1lZCBnbG9iYWwgdGVzdCBtb2R1bGUgdG8gcGx1Z2lucy5cblx0XHRcdGlmIChjb25maWcubW9kdWxlc1tpXS5uYW1lICE9PSAnJykge1xuXHRcdFx0XHRtb2R1bGVzTG9nLnB1c2goe1xuXHRcdFx0XHRcdG5hbWU6IGNvbmZpZy5tb2R1bGVzW2ldLm5hbWUsXG5cdFx0XHRcdFx0bW9kdWxlSWQ6IGNvbmZpZy5tb2R1bGVzW2ldLm1vZHVsZUlkLFxuXHRcdFx0XHRcdC8vIEFkZGVkIGluIFFVbml0IDEuMTYuMCBmb3IgaW50ZXJuYWwgdXNlIGJ5IGh0bWwtcmVwb3J0ZXIsXG5cdFx0XHRcdFx0Ly8gYnV0IG5vIGxvbmdlciB1c2VkIHNpbmNlIFFVbml0IDIuNy4wLlxuXHRcdFx0XHRcdC8vIEBkZXByZWNhdGVkIEtlcHQgdW5vZmZpY2lhbGx5IHRvIGJlIHJlbW92ZWQgaW4gUVVuaXQgMy4wLlxuXHRcdFx0XHRcdHRlc3RzOiBjb25maWcubW9kdWxlc1tpXS50ZXN0c1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBUaGUgdGVzdCBydW4gaXMgb2ZmaWNpYWxseSBiZWdpbm5pbmcgbm93XG5cdFx0ZW1pdCgncnVuU3RhcnQnLCBydW5TdWl0ZS5zdGFydCh0cnVlKSk7XG5cdFx0cnVuTG9nZ2luZ0NhbGxiYWNrcygnYmVnaW4nLCB7XG5cdFx0XHR0b3RhbFRlc3RzOiBUZXN0LmNvdW50LFxuXHRcdFx0bW9kdWxlczogbW9kdWxlc0xvZ1xuXHRcdH0pLnRoZW4odW5ibG9ja0FuZEFkdmFuY2VRdWV1ZSk7XG5cdH1cblx0ZXhwb3J0UVVuaXQoUVVuaXQpO1xuXG5cdChmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKCF3aW5kb3ckMSB8fCAhZG9jdW1lbnQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dmFyIGNvbmZpZyA9IFFVbml0LmNvbmZpZztcblx0XHR2YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuXHRcdC8vIFN0b3JlcyBmaXh0dXJlIEhUTUwgZm9yIHJlc2V0dGluZyBsYXRlclxuXHRcdGZ1bmN0aW9uIHN0b3JlRml4dHVyZSgpIHtcblx0XHRcdC8vIEF2b2lkIG92ZXJ3cml0aW5nIHVzZXItZGVmaW5lZCB2YWx1ZXNcblx0XHRcdGlmIChoYXNPd24uY2FsbChjb25maWcsICdmaXh0dXJlJykpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGZpeHR1cmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncXVuaXQtZml4dHVyZScpO1xuXHRcdFx0aWYgKGZpeHR1cmUpIHtcblx0XHRcdFx0Y29uZmlnLmZpeHR1cmUgPSBmaXh0dXJlLmNsb25lTm9kZSh0cnVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0UVVuaXQuYmVnaW4oc3RvcmVGaXh0dXJlKTtcblxuXHRcdC8vIFJlc2V0cyB0aGUgZml4dHVyZSBET00gZWxlbWVudCBpZiBhdmFpbGFibGUuXG5cdFx0ZnVuY3Rpb24gcmVzZXRGaXh0dXJlKCkge1xuXHRcdFx0aWYgKGNvbmZpZy5maXh0dXJlID09IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGZpeHR1cmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncXVuaXQtZml4dHVyZScpO1xuXHRcdFx0dmFyIHJlc2V0Rml4dHVyZVR5cGUgPSBfdHlwZW9mKGNvbmZpZy5maXh0dXJlKTtcblx0XHRcdGlmIChyZXNldEZpeHR1cmVUeXBlID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHQvLyBzdXBwb3J0IHVzZXIgZGVmaW5lZCB2YWx1ZXMgZm9yIGBjb25maWcuZml4dHVyZWBcblx0XHRcdFx0dmFyIG5ld0ZpeHR1cmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdFx0bmV3Rml4dHVyZS5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3F1bml0LWZpeHR1cmUnKTtcblx0XHRcdFx0bmV3Rml4dHVyZS5pbm5lckhUTUwgPSBjb25maWcuZml4dHVyZTtcblx0XHRcdFx0Zml4dHVyZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChuZXdGaXh0dXJlLCBmaXh0dXJlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBjbG9uZWRGaXh0dXJlID0gY29uZmlnLmZpeHR1cmUuY2xvbmVOb2RlKHRydWUpO1xuXHRcdFx0XHRmaXh0dXJlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGNsb25lZEZpeHR1cmUsIGZpeHR1cmUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRRVW5pdC50ZXN0U3RhcnQocmVzZXRGaXh0dXJlKTtcblx0fSkoKTtcblxuXHQoZnVuY3Rpb24gKCkge1xuXHRcdC8vIE9ubHkgaW50ZXJhY3Qgd2l0aCBVUkxzIHZpYSB3aW5kb3cubG9jYXRpb25cblx0XHR2YXIgbG9jYXRpb24gPSB0eXBlb2Ygd2luZG93JDEgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdyQxLmxvY2F0aW9uO1xuXHRcdGlmICghbG9jYXRpb24pIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dmFyIHVybFBhcmFtcyA9IGdldFVybFBhcmFtcygpO1xuXHRcdFFVbml0LnVybFBhcmFtcyA9IHVybFBhcmFtcztcblx0XHRRVW5pdC5jb25maWcuZmlsdGVyID0gdXJsUGFyYW1zLmZpbHRlcjtcblx0XHRRVW5pdC5jb25maWcubW9kdWxlID0gdXJsUGFyYW1zLm1vZHVsZTtcblx0XHRRVW5pdC5jb25maWcubW9kdWxlSWQgPSBbXS5jb25jYXQodXJsUGFyYW1zLm1vZHVsZUlkIHx8IFtdKTtcblx0XHRRVW5pdC5jb25maWcudGVzdElkID0gW10uY29uY2F0KHVybFBhcmFtcy50ZXN0SWQgfHwgW10pO1xuXG5cdFx0Ly8gVGVzdCBvcmRlciByYW5kb21pemF0aW9uXG5cdFx0aWYgKHVybFBhcmFtcy5zZWVkID09PSB0cnVlKSB7XG5cdFx0XHQvLyBHZW5lcmF0ZSBhIHJhbmRvbSBzZWVkIGlmIHRoZSBvcHRpb24gaXMgc3BlY2lmaWVkIHdpdGhvdXQgYSB2YWx1ZVxuXHRcdFx0UVVuaXQuY29uZmlnLnNlZWQgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKTtcblx0XHR9IGVsc2UgaWYgKHVybFBhcmFtcy5zZWVkKSB7XG5cdFx0XHRRVW5pdC5jb25maWcuc2VlZCA9IHVybFBhcmFtcy5zZWVkO1xuXHRcdH1cblxuXHRcdC8vIEFkZCBVUkwtcGFyYW1ldGVyLW1hcHBlZCBjb25maWcgdmFsdWVzIHdpdGggVUkgZm9ybSByZW5kZXJpbmcgZGF0YVxuXHRcdFFVbml0LmNvbmZpZy51cmxDb25maWcucHVzaCh7XG5cdFx0XHRpZDogJ2hpZGVwYXNzZWQnLFxuXHRcdFx0bGFiZWw6ICdIaWRlIHBhc3NlZCB0ZXN0cycsXG5cdFx0XHR0b29sdGlwOiAnT25seSBzaG93IHRlc3RzIGFuZCBhc3NlcnRpb25zIHRoYXQgZmFpbC4gU3RvcmVkIGFzIHF1ZXJ5LXN0cmluZ3MuJ1xuXHRcdH0sIHtcblx0XHRcdGlkOiAnbm9nbG9iYWxzJyxcblx0XHRcdGxhYmVsOiAnQ2hlY2sgZm9yIEdsb2JhbHMnLFxuXHRcdFx0dG9vbHRpcDogJ0VuYWJsaW5nIHRoaXMgd2lsbCB0ZXN0IGlmIGFueSB0ZXN0IGludHJvZHVjZXMgbmV3IHByb3BlcnRpZXMgb24gdGhlICcgKyAnZ2xvYmFsIG9iamVjdCAoYHdpbmRvd2AgaW4gQnJvd3NlcnMpLiBTdG9yZWQgYXMgcXVlcnktc3RyaW5ncy4nXG5cdFx0fSwge1xuXHRcdFx0aWQ6ICdub3RyeWNhdGNoJyxcblx0XHRcdGxhYmVsOiAnTm8gdHJ5LWNhdGNoJyxcblx0XHRcdHRvb2x0aXA6ICdFbmFibGluZyB0aGlzIHdpbGwgcnVuIHRlc3RzIG91dHNpZGUgb2YgYSB0cnktY2F0Y2ggYmxvY2suIE1ha2VzIGRlYnVnZ2luZyAnICsgJ2V4Y2VwdGlvbnMgaW4gSUUgcmVhc29uYWJsZS4gU3RvcmVkIGFzIHF1ZXJ5LXN0cmluZ3MuJ1xuXHRcdH0pO1xuXHRcdFFVbml0LmJlZ2luKGZ1bmN0aW9uICgpIHtcblx0XHRcdHZhciB1cmxDb25maWcgPSBRVW5pdC5jb25maWcudXJsQ29uZmlnO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB1cmxDb25maWcubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Ly8gT3B0aW9ucyBjYW4gYmUgZWl0aGVyIHN0cmluZ3Mgb3Igb2JqZWN0cyB3aXRoIG5vbmVtcHR5IFwiaWRcIiBwcm9wZXJ0aWVzXG5cdFx0XHRcdHZhciBvcHRpb24gPSBRVW5pdC5jb25maWcudXJsQ29uZmlnW2ldO1xuXHRcdFx0XHRpZiAodHlwZW9mIG9wdGlvbiAhPT0gJ3N0cmluZycpIHtcblx0XHRcdFx0XHRvcHRpb24gPSBvcHRpb24uaWQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKFFVbml0LmNvbmZpZ1tvcHRpb25dID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRRVW5pdC5jb25maWdbb3B0aW9uXSA9IHVybFBhcmFtc1tvcHRpb25dO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0ZnVuY3Rpb24gZ2V0VXJsUGFyYW1zKCkge1xuXHRcdFx0dmFyIHVybFBhcmFtcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cdFx0XHR2YXIgcGFyYW1zID0gbG9jYXRpb24uc2VhcmNoLnNsaWNlKDEpLnNwbGl0KCcmJyk7XG5cdFx0XHR2YXIgbGVuZ3RoID0gcGFyYW1zLmxlbmd0aDtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKHBhcmFtc1tpXSkge1xuXHRcdFx0XHRcdHZhciBwYXJhbSA9IHBhcmFtc1tpXS5zcGxpdCgnPScpO1xuXHRcdFx0XHRcdHZhciBuYW1lID0gZGVjb2RlUXVlcnlQYXJhbShwYXJhbVswXSk7XG5cblx0XHRcdFx0XHQvLyBBbGxvdyBqdXN0IGEga2V5IHRvIHR1cm4gb24gYSBmbGFnLCBlLmcuLCB0ZXN0Lmh0bWw/bm9nbG9iYWxzXG5cdFx0XHRcdFx0dmFyIHZhbHVlID0gcGFyYW0ubGVuZ3RoID09PSAxIHx8IGRlY29kZVF1ZXJ5UGFyYW0ocGFyYW0uc2xpY2UoMSkuam9pbignPScpKTtcblx0XHRcdFx0XHRpZiAobmFtZSBpbiB1cmxQYXJhbXMpIHtcblx0XHRcdFx0XHRcdHVybFBhcmFtc1tuYW1lXSA9IFtdLmNvbmNhdCh1cmxQYXJhbXNbbmFtZV0sIHZhbHVlKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dXJsUGFyYW1zW25hbWVdID0gdmFsdWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdXJsUGFyYW1zO1xuXHRcdH1cblx0XHRmdW5jdGlvbiBkZWNvZGVRdWVyeVBhcmFtKHBhcmFtKSB7XG5cdFx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHBhcmFtLnJlcGxhY2UoL1xcKy9nLCAnJTIwJykpO1xuXHRcdH1cblx0fSkoKTtcblxuXHR2YXIgZnV6enlzb3J0JDEgPSB7ZXhwb3J0czoge319O1xuXG5cdChmdW5jdGlvbiAobW9kdWxlKSB7XG5cdFx0KGZ1bmN0aW9uIChyb290LCBVTUQpIHtcblx0XHRcdGlmIChtb2R1bGUuZXhwb3J0cykgbW9kdWxlLmV4cG9ydHMgPSBVTUQoKTtlbHNlIHJvb3QuZnV6enlzb3J0ID0gVU1EKCk7XG5cdFx0fSkoY29tbW9uanNHbG9iYWwsIGZ1bmN0aW9uIFVNRCgpIHtcblx0XHRcdGZ1bmN0aW9uIGZ1enp5c29ydE5ldyhpbnN0YW5jZU9wdGlvbnMpIHtcblx0XHRcdFx0dmFyIGZ1enp5c29ydCA9IHtcblx0XHRcdFx0XHRzaW5nbGU6IGZ1bmN0aW9uIHNpbmdsZShzZWFyY2gsIHRhcmdldCwgb3B0aW9ucykge1xuXHRcdFx0XHRcdFx0aWYgKHNlYXJjaCA9PSAnZmFyemhlcicpIHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdHRhcmdldDogXCJmYXJ6aGVyIHdhcyBoZXJlICheLV4qKS9cIixcblx0XHRcdFx0XHRcdFx0c2NvcmU6IDAsXG5cdFx0XHRcdFx0XHRcdGluZGV4ZXM6IFswLCAxLCAyLCAzLCA0LCA1LCA2XVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdGlmICghc2VhcmNoKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0XHRcdGlmICghaXNPYmooc2VhcmNoKSkgc2VhcmNoID0gZnV6enlzb3J0LmdldFByZXBhcmVkU2VhcmNoKHNlYXJjaCk7XG5cdFx0XHRcdFx0XHRpZiAoIXRhcmdldCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdFx0XHRpZiAoIWlzT2JqKHRhcmdldCkpIHRhcmdldCA9IGZ1enp5c29ydC5nZXRQcmVwYXJlZCh0YXJnZXQpO1xuXHRcdFx0XHRcdFx0dmFyIGFsbG93VHlwbyA9IG9wdGlvbnMgJiYgb3B0aW9ucy5hbGxvd1R5cG8gIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMuYWxsb3dUeXBvIDogaW5zdGFuY2VPcHRpb25zICYmIGluc3RhbmNlT3B0aW9ucy5hbGxvd1R5cG8gIT09IHVuZGVmaW5lZCA/IGluc3RhbmNlT3B0aW9ucy5hbGxvd1R5cG8gOiB0cnVlO1xuXHRcdFx0XHRcdFx0dmFyIGFsZ29yaXRobSA9IGFsbG93VHlwbyA/IGZ1enp5c29ydC5hbGdvcml0aG0gOiBmdXp6eXNvcnQuYWxnb3JpdGhtTm9UeXBvO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGFsZ29yaXRobShzZWFyY2gsIHRhcmdldCwgc2VhcmNoWzBdKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGdvOiBmdW5jdGlvbiBnbyhzZWFyY2gsIHRhcmdldHMsIG9wdGlvbnMpIHtcblx0XHRcdFx0XHRcdGlmIChzZWFyY2ggPT0gJ2ZhcnpoZXInKSByZXR1cm4gW3tcblx0XHRcdFx0XHRcdFx0dGFyZ2V0OiBcImZhcnpoZXIgd2FzIGhlcmUgKF4tXiopL1wiLFxuXHRcdFx0XHRcdFx0XHRzY29yZTogMCxcblx0XHRcdFx0XHRcdFx0aW5kZXhlczogWzAsIDEsIDIsIDMsIDQsIDUsIDZdLFxuXHRcdFx0XHRcdFx0XHRvYmo6IHRhcmdldHMgPyB0YXJnZXRzWzBdIDogbnVsbFxuXHRcdFx0XHRcdFx0fV07XG5cdFx0XHRcdFx0XHRpZiAoIXNlYXJjaCkgcmV0dXJuIG5vUmVzdWx0cztcblx0XHRcdFx0XHRcdHNlYXJjaCA9IGZ1enp5c29ydC5wcmVwYXJlU2VhcmNoKHNlYXJjaCk7XG5cdFx0XHRcdFx0XHR2YXIgc2VhcmNoTG93ZXJDb2RlID0gc2VhcmNoWzBdO1xuXHRcdFx0XHRcdFx0dmFyIHRocmVzaG9sZCA9IG9wdGlvbnMgJiYgb3B0aW9ucy50aHJlc2hvbGQgfHwgaW5zdGFuY2VPcHRpb25zICYmIGluc3RhbmNlT3B0aW9ucy50aHJlc2hvbGQgfHwgLTkwMDcxOTkyNTQ3NDA5OTE7XG5cdFx0XHRcdFx0XHR2YXIgbGltaXQgPSBvcHRpb25zICYmIG9wdGlvbnMubGltaXQgfHwgaW5zdGFuY2VPcHRpb25zICYmIGluc3RhbmNlT3B0aW9ucy5saW1pdCB8fCA5MDA3MTk5MjU0NzQwOTkxO1xuXHRcdFx0XHRcdFx0dmFyIGFsbG93VHlwbyA9IG9wdGlvbnMgJiYgb3B0aW9ucy5hbGxvd1R5cG8gIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMuYWxsb3dUeXBvIDogaW5zdGFuY2VPcHRpb25zICYmIGluc3RhbmNlT3B0aW9ucy5hbGxvd1R5cG8gIT09IHVuZGVmaW5lZCA/IGluc3RhbmNlT3B0aW9ucy5hbGxvd1R5cG8gOiB0cnVlO1xuXHRcdFx0XHRcdFx0dmFyIGFsZ29yaXRobSA9IGFsbG93VHlwbyA/IGZ1enp5c29ydC5hbGdvcml0aG0gOiBmdXp6eXNvcnQuYWxnb3JpdGhtTm9UeXBvO1xuXHRcdFx0XHRcdFx0dmFyIHJlc3VsdHNMZW4gPSAwO1xuXHRcdFx0XHRcdFx0dmFyIGxpbWl0ZWRDb3VudCA9IDA7XG5cdFx0XHRcdFx0XHR2YXIgdGFyZ2V0c0xlbiA9IHRhcmdldHMubGVuZ3RoO1xuXG5cdFx0XHRcdFx0XHQvLyBUaGlzIGNvZGUgaXMgY29weS9wYXN0ZWQgMyB0aW1lcyBmb3IgcGVyZm9ybWFuY2UgcmVhc29ucyBbb3B0aW9ucy5rZXlzLCBvcHRpb25zLmtleSwgbm8ga2V5c11cblxuXHRcdFx0XHRcdFx0Ly8gb3B0aW9ucy5rZXlzXG5cdFx0XHRcdFx0XHRpZiAob3B0aW9ucyAmJiBvcHRpb25zLmtleXMpIHtcblx0XHRcdFx0XHRcdFx0dmFyIHNjb3JlRm4gPSBvcHRpb25zLnNjb3JlRm4gfHwgZGVmYXVsdFNjb3JlRm47XG5cdFx0XHRcdFx0XHRcdHZhciBrZXlzID0gb3B0aW9ucy5rZXlzO1xuXHRcdFx0XHRcdFx0XHR2YXIga2V5c0xlbiA9IGtleXMubGVuZ3RoO1xuXHRcdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gdGFyZ2V0c0xlbiAtIDE7IGkgPj0gMDsgLS1pKSB7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIG9iaiA9IHRhcmdldHNbaV07XG5cdFx0XHRcdFx0XHRcdFx0dmFyIG9ialJlc3VsdHMgPSBuZXcgQXJyYXkoa2V5c0xlbik7XG5cdFx0XHRcdFx0XHRcdFx0Zm9yICh2YXIga2V5SSA9IGtleXNMZW4gLSAxOyBrZXlJID49IDA7IC0ta2V5SSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0dmFyIGtleSA9IGtleXNba2V5SV07XG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgdGFyZ2V0ID0gZ2V0VmFsdWUob2JqLCBrZXkpO1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCF0YXJnZXQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0b2JqUmVzdWx0c1trZXlJXSA9IG51bGw7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCFpc09iaih0YXJnZXQpKSB0YXJnZXQgPSBmdXp6eXNvcnQuZ2V0UHJlcGFyZWQodGFyZ2V0KTtcblx0XHRcdFx0XHRcdFx0XHRcdG9ialJlc3VsdHNba2V5SV0gPSBhbGdvcml0aG0oc2VhcmNoLCB0YXJnZXQsIHNlYXJjaExvd2VyQ29kZSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdG9ialJlc3VsdHMub2JqID0gb2JqOyAvLyBiZWZvcmUgc2NvcmVGbiBzbyBzY29yZUZuIGNhbiB1c2UgaXRcblx0XHRcdFx0XHRcdFx0XHR2YXIgc2NvcmUgPSBzY29yZUZuKG9ialJlc3VsdHMpO1xuXHRcdFx0XHRcdFx0XHRcdGlmIChzY29yZSA9PT0gbnVsbCkgY29udGludWU7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHNjb3JlIDwgdGhyZXNob2xkKSBjb250aW51ZTtcblx0XHRcdFx0XHRcdFx0XHRvYmpSZXN1bHRzLnNjb3JlID0gc2NvcmU7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHJlc3VsdHNMZW4gPCBsaW1pdCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0cS5hZGQob2JqUmVzdWx0cyk7XG5cdFx0XHRcdFx0XHRcdFx0XHQrK3Jlc3VsdHNMZW47XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdCsrbGltaXRlZENvdW50O1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHNjb3JlID4gcS5wZWVrKCkuc2NvcmUpIHEucmVwbGFjZVRvcChvYmpSZXN1bHRzKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHQvLyBvcHRpb25zLmtleVxuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChvcHRpb25zICYmIG9wdGlvbnMua2V5KSB7XG5cdFx0XHRcdFx0XHRcdHZhciBrZXkgPSBvcHRpb25zLmtleTtcblx0XHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IHRhcmdldHNMZW4gLSAxOyBpID49IDA7IC0taSkge1xuXHRcdFx0XHRcdFx0XHRcdHZhciBvYmogPSB0YXJnZXRzW2ldO1xuXHRcdFx0XHRcdFx0XHRcdHZhciB0YXJnZXQgPSBnZXRWYWx1ZShvYmosIGtleSk7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKCF0YXJnZXQpIGNvbnRpbnVlO1xuXHRcdFx0XHRcdFx0XHRcdGlmICghaXNPYmoodGFyZ2V0KSkgdGFyZ2V0ID0gZnV6enlzb3J0LmdldFByZXBhcmVkKHRhcmdldCk7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIHJlc3VsdCA9IGFsZ29yaXRobShzZWFyY2gsIHRhcmdldCwgc2VhcmNoTG93ZXJDb2RlKTtcblx0XHRcdFx0XHRcdFx0XHRpZiAocmVzdWx0ID09PSBudWxsKSBjb250aW51ZTtcblx0XHRcdFx0XHRcdFx0XHRpZiAocmVzdWx0LnNjb3JlIDwgdGhyZXNob2xkKSBjb250aW51ZTtcblxuXHRcdFx0XHRcdFx0XHRcdC8vIGhhdmUgdG8gY2xvbmUgcmVzdWx0IHNvIGR1cGxpY2F0ZSB0YXJnZXRzIGZyb20gZGlmZmVyZW50IG9iaiBjYW4gZWFjaCByZWZlcmVuY2UgdGhlIGNvcnJlY3Qgb2JqXG5cdFx0XHRcdFx0XHRcdFx0cmVzdWx0ID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0dGFyZ2V0OiByZXN1bHQudGFyZ2V0LFxuXHRcdFx0XHRcdFx0XHRcdFx0X3RhcmdldExvd2VyQ29kZXM6IG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0XHRfbmV4dEJlZ2lubmluZ0luZGV4ZXM6IG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0XHRzY29yZTogcmVzdWx0LnNjb3JlLFxuXHRcdFx0XHRcdFx0XHRcdFx0aW5kZXhlczogcmVzdWx0LmluZGV4ZXMsXG5cdFx0XHRcdFx0XHRcdFx0XHRvYmo6IG9ialxuXHRcdFx0XHRcdFx0XHRcdH07IC8vIGhpZGRlblxuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHJlc3VsdHNMZW4gPCBsaW1pdCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0cS5hZGQocmVzdWx0KTtcblx0XHRcdFx0XHRcdFx0XHRcdCsrcmVzdWx0c0xlbjtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0KytsaW1pdGVkQ291bnQ7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAocmVzdWx0LnNjb3JlID4gcS5wZWVrKCkuc2NvcmUpIHEucmVwbGFjZVRvcChyZXN1bHQpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdC8vIG5vIGtleXNcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSB0YXJnZXRzTGVuIC0gMTsgaSA+PSAwOyAtLWkpIHtcblx0XHRcdFx0XHRcdFx0XHR2YXIgdGFyZ2V0ID0gdGFyZ2V0c1tpXTtcblx0XHRcdFx0XHRcdFx0XHRpZiAoIXRhcmdldCkgY29udGludWU7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKCFpc09iaih0YXJnZXQpKSB0YXJnZXQgPSBmdXp6eXNvcnQuZ2V0UHJlcGFyZWQodGFyZ2V0KTtcblx0XHRcdFx0XHRcdFx0XHR2YXIgcmVzdWx0ID0gYWxnb3JpdGhtKHNlYXJjaCwgdGFyZ2V0LCBzZWFyY2hMb3dlckNvZGUpO1xuXHRcdFx0XHRcdFx0XHRcdGlmIChyZXN1bHQgPT09IG51bGwpIGNvbnRpbnVlO1xuXHRcdFx0XHRcdFx0XHRcdGlmIChyZXN1bHQuc2NvcmUgPCB0aHJlc2hvbGQpIGNvbnRpbnVlO1xuXHRcdFx0XHRcdFx0XHRcdGlmIChyZXN1bHRzTGVuIDwgbGltaXQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHEuYWRkKHJlc3VsdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHQrK3Jlc3VsdHNMZW47XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdCsrbGltaXRlZENvdW50O1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHJlc3VsdC5zY29yZSA+IHEucGVlaygpLnNjb3JlKSBxLnJlcGxhY2VUb3AocmVzdWx0KTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmIChyZXN1bHRzTGVuID09PSAwKSByZXR1cm4gbm9SZXN1bHRzO1xuXHRcdFx0XHRcdFx0dmFyIHJlc3VsdHMgPSBuZXcgQXJyYXkocmVzdWx0c0xlbik7XG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gcmVzdWx0c0xlbiAtIDE7IGkgPj0gMDsgLS1pKSB7XG5cdFx0XHRcdFx0XHRcdHJlc3VsdHNbaV0gPSBxLnBvbGwoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJlc3VsdHMudG90YWwgPSByZXN1bHRzTGVuICsgbGltaXRlZENvdW50O1xuXHRcdFx0XHRcdFx0cmV0dXJuIHJlc3VsdHM7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRnb0FzeW5jOiBmdW5jdGlvbiBnb0FzeW5jKHNlYXJjaCwgdGFyZ2V0cywgb3B0aW9ucykge1xuXHRcdFx0XHRcdFx0dmFyIGNhbmNlbGVkID0gZmFsc2U7XG5cdFx0XHRcdFx0XHR2YXIgcCA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblx0XHRcdFx0XHRcdFx0aWYgKHNlYXJjaCA9PSAnZmFyemhlcicpIHJldHVybiByZXNvbHZlKFt7XG5cdFx0XHRcdFx0XHRcdFx0dGFyZ2V0OiBcImZhcnpoZXIgd2FzIGhlcmUgKF4tXiopL1wiLFxuXHRcdFx0XHRcdFx0XHRcdHNjb3JlOiAwLFxuXHRcdFx0XHRcdFx0XHRcdGluZGV4ZXM6IFswLCAxLCAyLCAzLCA0LCA1LCA2XSxcblx0XHRcdFx0XHRcdFx0XHRvYmo6IHRhcmdldHMgPyB0YXJnZXRzWzBdIDogbnVsbFxuXHRcdFx0XHRcdFx0XHR9XSk7XG5cdFx0XHRcdFx0XHRcdGlmICghc2VhcmNoKSByZXR1cm4gcmVzb2x2ZShub1Jlc3VsdHMpO1xuXHRcdFx0XHRcdFx0XHRzZWFyY2ggPSBmdXp6eXNvcnQucHJlcGFyZVNlYXJjaChzZWFyY2gpO1xuXHRcdFx0XHRcdFx0XHR2YXIgc2VhcmNoTG93ZXJDb2RlID0gc2VhcmNoWzBdO1xuXHRcdFx0XHRcdFx0XHR2YXIgcSA9IGZhc3Rwcmlvcml0eXF1ZXVlKCk7XG5cdFx0XHRcdFx0XHRcdHZhciBpQ3VycmVudCA9IHRhcmdldHMubGVuZ3RoIC0gMTtcblx0XHRcdFx0XHRcdFx0dmFyIHRocmVzaG9sZCA9IG9wdGlvbnMgJiYgb3B0aW9ucy50aHJlc2hvbGQgfHwgaW5zdGFuY2VPcHRpb25zICYmIGluc3RhbmNlT3B0aW9ucy50aHJlc2hvbGQgfHwgLTkwMDcxOTkyNTQ3NDA5OTE7XG5cdFx0XHRcdFx0XHRcdHZhciBsaW1pdCA9IG9wdGlvbnMgJiYgb3B0aW9ucy5saW1pdCB8fCBpbnN0YW5jZU9wdGlvbnMgJiYgaW5zdGFuY2VPcHRpb25zLmxpbWl0IHx8IDkwMDcxOTkyNTQ3NDA5OTE7XG5cdFx0XHRcdFx0XHRcdHZhciBhbGxvd1R5cG8gPSBvcHRpb25zICYmIG9wdGlvbnMuYWxsb3dUeXBvICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLmFsbG93VHlwbyA6IGluc3RhbmNlT3B0aW9ucyAmJiBpbnN0YW5jZU9wdGlvbnMuYWxsb3dUeXBvICE9PSB1bmRlZmluZWQgPyBpbnN0YW5jZU9wdGlvbnMuYWxsb3dUeXBvIDogdHJ1ZTtcblx0XHRcdFx0XHRcdFx0dmFyIGFsZ29yaXRobSA9IGFsbG93VHlwbyA/IGZ1enp5c29ydC5hbGdvcml0aG0gOiBmdXp6eXNvcnQuYWxnb3JpdGhtTm9UeXBvO1xuXHRcdFx0XHRcdFx0XHR2YXIgcmVzdWx0c0xlbiA9IDA7XG5cdFx0XHRcdFx0XHRcdHZhciBsaW1pdGVkQ291bnQgPSAwO1xuXHRcdFx0XHRcdFx0XHRmdW5jdGlvbiBzdGVwKCkge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChjYW5jZWxlZCkgcmV0dXJuIHJlamVjdCgnY2FuY2VsZWQnKTtcblx0XHRcdFx0XHRcdFx0XHR2YXIgc3RhcnRNcyA9IERhdGUubm93KCk7XG5cblx0XHRcdFx0XHRcdFx0XHQvLyBUaGlzIGNvZGUgaXMgY29weS9wYXN0ZWQgMyB0aW1lcyBmb3IgcGVyZm9ybWFuY2UgcmVhc29ucyBbb3B0aW9ucy5rZXlzLCBvcHRpb25zLmtleSwgbm8ga2V5c11cblxuXHRcdFx0XHRcdFx0XHRcdC8vIG9wdGlvbnMua2V5c1xuXHRcdFx0XHRcdFx0XHRcdGlmIChvcHRpb25zICYmIG9wdGlvbnMua2V5cykge1xuXHRcdFx0XHRcdFx0XHRcdFx0dmFyIHNjb3JlRm4gPSBvcHRpb25zLnNjb3JlRm4gfHwgZGVmYXVsdFNjb3JlRm47XG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIga2V5cyA9IG9wdGlvbnMua2V5cztcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBrZXlzTGVuID0ga2V5cy5sZW5ndGg7XG5cdFx0XHRcdFx0XHRcdFx0XHRmb3IgKDsgaUN1cnJlbnQgPj0gMDsgLS1pQ3VycmVudCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoaUN1cnJlbnQgJSAxMDAwIC8qaXRlbXNQZXJDaGVjayovID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKERhdGUubm93KCkgLSBzdGFydE1zID49IDEwIC8qYXN5bmNJbnRlcnZhbCovKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpc05vZGUgPyBzZXRJbW1lZGlhdGUoc3RlcCkgOiBzZXRUaW1lb3V0KHN0ZXApO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR2YXIgb2JqID0gdGFyZ2V0c1tpQ3VycmVudF07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHZhciBvYmpSZXN1bHRzID0gbmV3IEFycmF5KGtleXNMZW4pO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRmb3IgKHZhciBrZXlJID0ga2V5c0xlbiAtIDE7IGtleUkgPj0gMDsgLS1rZXlJKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dmFyIGtleSA9IGtleXNba2V5SV07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dmFyIHRhcmdldCA9IGdldFZhbHVlKG9iaiwga2V5KTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoIXRhcmdldCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0b2JqUmVzdWx0c1trZXlJXSA9IG51bGw7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKCFpc09iaih0YXJnZXQpKSB0YXJnZXQgPSBmdXp6eXNvcnQuZ2V0UHJlcGFyZWQodGFyZ2V0KTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvYmpSZXN1bHRzW2tleUldID0gYWxnb3JpdGhtKHNlYXJjaCwgdGFyZ2V0LCBzZWFyY2hMb3dlckNvZGUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9ialJlc3VsdHMub2JqID0gb2JqOyAvLyBiZWZvcmUgc2NvcmVGbiBzbyBzY29yZUZuIGNhbiB1c2UgaXRcblx0XHRcdFx0XHRcdFx0XHRcdFx0dmFyIHNjb3JlID0gc2NvcmVGbihvYmpSZXN1bHRzKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKHNjb3JlID09PSBudWxsKSBjb250aW51ZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKHNjb3JlIDwgdGhyZXNob2xkKSBjb250aW51ZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0b2JqUmVzdWx0cy5zY29yZSA9IHNjb3JlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAocmVzdWx0c0xlbiA8IGxpbWl0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cS5hZGQob2JqUmVzdWx0cyk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0KytyZXN1bHRzTGVuO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCsrbGltaXRlZENvdW50O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChzY29yZSA+IHEucGVlaygpLnNjb3JlKSBxLnJlcGxhY2VUb3Aob2JqUmVzdWx0cyk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gb3B0aW9ucy5rZXlcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5rZXkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBrZXkgPSBvcHRpb25zLmtleTtcblx0XHRcdFx0XHRcdFx0XHRcdGZvciAoOyBpQ3VycmVudCA+PSAwOyAtLWlDdXJyZW50KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChpQ3VycmVudCAlIDEwMDAgLyppdGVtc1BlckNoZWNrKi8gPT09IDApIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoRGF0ZS5ub3coKSAtIHN0YXJ0TXMgPj0gMTAgLyphc3luY0ludGVydmFsKi8pIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlzTm9kZSA/IHNldEltbWVkaWF0ZShzdGVwKSA6IHNldFRpbWVvdXQoc3RlcCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHZhciBvYmogPSB0YXJnZXRzW2lDdXJyZW50XTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dmFyIHRhcmdldCA9IGdldFZhbHVlKG9iaiwga2V5KTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKCF0YXJnZXQpIGNvbnRpbnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoIWlzT2JqKHRhcmdldCkpIHRhcmdldCA9IGZ1enp5c29ydC5nZXRQcmVwYXJlZCh0YXJnZXQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR2YXIgcmVzdWx0ID0gYWxnb3JpdGhtKHNlYXJjaCwgdGFyZ2V0LCBzZWFyY2hMb3dlckNvZGUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAocmVzdWx0ID09PSBudWxsKSBjb250aW51ZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKHJlc3VsdC5zY29yZSA8IHRocmVzaG9sZCkgY29udGludWU7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gaGF2ZSB0byBjbG9uZSByZXN1bHQgc28gZHVwbGljYXRlIHRhcmdldHMgZnJvbSBkaWZmZXJlbnQgb2JqIGNhbiBlYWNoIHJlZmVyZW5jZSB0aGUgY29ycmVjdCBvYmpcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmVzdWx0ID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRhcmdldDogcmVzdWx0LnRhcmdldCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRfdGFyZ2V0TG93ZXJDb2RlczogbnVsbCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRfbmV4dEJlZ2lubmluZ0luZGV4ZXM6IG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0c2NvcmU6IHJlc3VsdC5zY29yZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpbmRleGVzOiByZXN1bHQuaW5kZXhlcyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvYmo6IG9ialxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9OyAvLyBoaWRkZW5cblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAocmVzdWx0c0xlbiA8IGxpbWl0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cS5hZGQocmVzdWx0KTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQrK3Jlc3VsdHNMZW47XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0KytsaW1pdGVkQ291bnQ7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKHJlc3VsdC5zY29yZSA+IHEucGVlaygpLnNjb3JlKSBxLnJlcGxhY2VUb3AocmVzdWx0KTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBubyBrZXlzXG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdGZvciAoOyBpQ3VycmVudCA+PSAwOyAtLWlDdXJyZW50KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChpQ3VycmVudCAlIDEwMDAgLyppdGVtc1BlckNoZWNrKi8gPT09IDApIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoRGF0ZS5ub3coKSAtIHN0YXJ0TXMgPj0gMTAgLyphc3luY0ludGVydmFsKi8pIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlzTm9kZSA/IHNldEltbWVkaWF0ZShzdGVwKSA6IHNldFRpbWVvdXQoc3RlcCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHZhciB0YXJnZXQgPSB0YXJnZXRzW2lDdXJyZW50XTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKCF0YXJnZXQpIGNvbnRpbnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoIWlzT2JqKHRhcmdldCkpIHRhcmdldCA9IGZ1enp5c29ydC5nZXRQcmVwYXJlZCh0YXJnZXQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR2YXIgcmVzdWx0ID0gYWxnb3JpdGhtKHNlYXJjaCwgdGFyZ2V0LCBzZWFyY2hMb3dlckNvZGUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAocmVzdWx0ID09PSBudWxsKSBjb250aW51ZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKHJlc3VsdC5zY29yZSA8IHRocmVzaG9sZCkgY29udGludWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChyZXN1bHRzTGVuIDwgbGltaXQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRxLmFkZChyZXN1bHQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCsrcmVzdWx0c0xlbjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQrK2xpbWl0ZWRDb3VudDtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAocmVzdWx0LnNjb3JlID4gcS5wZWVrKCkuc2NvcmUpIHEucmVwbGFjZVRvcChyZXN1bHQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdGlmIChyZXN1bHRzTGVuID09PSAwKSByZXR1cm4gcmVzb2x2ZShub1Jlc3VsdHMpO1xuXHRcdFx0XHRcdFx0XHRcdHZhciByZXN1bHRzID0gbmV3IEFycmF5KHJlc3VsdHNMZW4pO1xuXHRcdFx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSByZXN1bHRzTGVuIC0gMTsgaSA+PSAwOyAtLWkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHJlc3VsdHNbaV0gPSBxLnBvbGwoKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0cmVzdWx0cy50b3RhbCA9IHJlc3VsdHNMZW4gKyBsaW1pdGVkQ291bnQ7XG5cdFx0XHRcdFx0XHRcdFx0cmVzb2x2ZShyZXN1bHRzKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRpc05vZGUgPyBzZXRJbW1lZGlhdGUoc3RlcCkgOiBzdGVwKCk7IC8vc2V0VGltZW91dCBoZXJlIGlzIHRvbyBzbG93XG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0cC5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdGNhbmNlbGVkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRyZXR1cm4gcDtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGhpZ2hsaWdodDogZnVuY3Rpb24gaGlnaGxpZ2h0KHJlc3VsdCwgaE9wZW4sIGhDbG9zZSkge1xuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBoT3BlbiA9PSAnZnVuY3Rpb24nKSByZXR1cm4gZnV6enlzb3J0LmhpZ2hsaWdodENhbGxiYWNrKHJlc3VsdCwgaE9wZW4pO1xuXHRcdFx0XHRcdFx0aWYgKHJlc3VsdCA9PT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdFx0XHRpZiAoaE9wZW4gPT09IHVuZGVmaW5lZCkgaE9wZW4gPSAnPGI+Jztcblx0XHRcdFx0XHRcdGlmIChoQ2xvc2UgPT09IHVuZGVmaW5lZCkgaENsb3NlID0gJzwvYj4nO1xuXHRcdFx0XHRcdFx0dmFyIGhpZ2hsaWdodGVkID0gJyc7XG5cdFx0XHRcdFx0XHR2YXIgbWF0Y2hlc0luZGV4ID0gMDtcblx0XHRcdFx0XHRcdHZhciBvcGVuZWQgPSBmYWxzZTtcblx0XHRcdFx0XHRcdHZhciB0YXJnZXQgPSByZXN1bHQudGFyZ2V0O1xuXHRcdFx0XHRcdFx0dmFyIHRhcmdldExlbiA9IHRhcmdldC5sZW5ndGg7XG5cdFx0XHRcdFx0XHR2YXIgbWF0Y2hlc0Jlc3QgPSByZXN1bHQuaW5kZXhlcztcblx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGFyZ2V0TGVuOyArK2kpIHtcblx0XHRcdFx0XHRcdFx0dmFyIGNoYXIgPSB0YXJnZXRbaV07XG5cdFx0XHRcdFx0XHRcdGlmIChtYXRjaGVzQmVzdFttYXRjaGVzSW5kZXhdID09PSBpKSB7XG5cdFx0XHRcdFx0XHRcdFx0KyttYXRjaGVzSW5kZXg7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKCFvcGVuZWQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdG9wZW5lZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRoaWdobGlnaHRlZCArPSBoT3Blbjtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0aWYgKG1hdGNoZXNJbmRleCA9PT0gbWF0Y2hlc0Jlc3QubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRoaWdobGlnaHRlZCArPSBjaGFyICsgaENsb3NlICsgdGFyZ2V0LnN1YnN0cihpICsgMSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKG9wZW5lZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0b3BlbmVkID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0XHRoaWdobGlnaHRlZCArPSBoQ2xvc2U7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGhpZ2hsaWdodGVkICs9IGNoYXI7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm4gaGlnaGxpZ2h0ZWQ7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRoaWdobGlnaHRDYWxsYmFjazogZnVuY3Rpb24gaGlnaGxpZ2h0Q2FsbGJhY2socmVzdWx0LCBjYikge1xuXHRcdFx0XHRcdFx0aWYgKHJlc3VsdCA9PT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdFx0XHR2YXIgdGFyZ2V0ID0gcmVzdWx0LnRhcmdldDtcblx0XHRcdFx0XHRcdHZhciB0YXJnZXRMZW4gPSB0YXJnZXQubGVuZ3RoO1xuXHRcdFx0XHRcdFx0dmFyIGluZGV4ZXMgPSByZXN1bHQuaW5kZXhlcztcblx0XHRcdFx0XHRcdHZhciBoaWdobGlnaHRlZCA9ICcnO1xuXHRcdFx0XHRcdFx0dmFyIG1hdGNoSSA9IDA7XG5cdFx0XHRcdFx0XHR2YXIgaW5kZXhlc0kgPSAwO1xuXHRcdFx0XHRcdFx0dmFyIG9wZW5lZCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0dmFyIHJlc3VsdCA9IFtdO1xuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0YXJnZXRMZW47ICsraSkge1xuXHRcdFx0XHRcdFx0XHR2YXIgY2hhciA9IHRhcmdldFtpXTtcblx0XHRcdFx0XHRcdFx0aWYgKGluZGV4ZXNbaW5kZXhlc0ldID09PSBpKSB7XG5cdFx0XHRcdFx0XHRcdFx0KytpbmRleGVzSTtcblx0XHRcdFx0XHRcdFx0XHRpZiAoIW9wZW5lZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0b3BlbmVkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdHJlc3VsdC5wdXNoKGhpZ2hsaWdodGVkKTtcblx0XHRcdFx0XHRcdFx0XHRcdGhpZ2hsaWdodGVkID0gJyc7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdGlmIChpbmRleGVzSSA9PT0gaW5kZXhlcy5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGhpZ2hsaWdodGVkICs9IGNoYXI7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXN1bHQucHVzaChjYihoaWdobGlnaHRlZCwgbWF0Y2hJKyspKTtcblx0XHRcdFx0XHRcdFx0XHRcdGhpZ2hsaWdodGVkID0gJyc7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXN1bHQucHVzaCh0YXJnZXQuc3Vic3RyKGkgKyAxKSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKG9wZW5lZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0b3BlbmVkID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXN1bHQucHVzaChjYihoaWdobGlnaHRlZCwgbWF0Y2hJKyspKTtcblx0XHRcdFx0XHRcdFx0XHRcdGhpZ2hsaWdodGVkID0gJyc7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGhpZ2hsaWdodGVkICs9IGNoYXI7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0cHJlcGFyZTogZnVuY3Rpb24gcHJlcGFyZSh0YXJnZXQpIHtcblx0XHRcdFx0XHRcdGlmICghdGFyZ2V0KSByZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHR0YXJnZXQ6ICcnLFxuXHRcdFx0XHRcdFx0XHRfdGFyZ2V0TG93ZXJDb2RlczogWzAgLyp0aGlzIDAgZG9lc24ndCBtYWtlIHNlbnNlLiBoZXJlIGJlY2F1c2UgYW4gZW1wdHkgYXJyYXkgY2F1c2VzIHRoZSBhbGdvcml0aG0gdG8gZGVvcHRpbWl6ZSBhbmQgcnVuIDUwJSBzbG93ZXIhKi9dLFxuXHRcdFx0XHRcdFx0XHRfbmV4dEJlZ2lubmluZ0luZGV4ZXM6IG51bGwsXG5cdFx0XHRcdFx0XHRcdHNjb3JlOiBudWxsLFxuXHRcdFx0XHRcdFx0XHRpbmRleGVzOiBudWxsLFxuXHRcdFx0XHRcdFx0XHRvYmo6IG51bGxcblx0XHRcdFx0XHRcdH07IC8vIGhpZGRlblxuXHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0dGFyZ2V0OiB0YXJnZXQsXG5cdFx0XHRcdFx0XHRcdF90YXJnZXRMb3dlckNvZGVzOiBmdXp6eXNvcnQucHJlcGFyZUxvd2VyQ29kZXModGFyZ2V0KSxcblx0XHRcdFx0XHRcdFx0X25leHRCZWdpbm5pbmdJbmRleGVzOiBudWxsLFxuXHRcdFx0XHRcdFx0XHRzY29yZTogbnVsbCxcblx0XHRcdFx0XHRcdFx0aW5kZXhlczogbnVsbCxcblx0XHRcdFx0XHRcdFx0b2JqOiBudWxsXG5cdFx0XHRcdFx0XHR9OyAvLyBoaWRkZW5cblx0XHRcdFx0XHR9LFxuXG5cdFx0XHRcdFx0cHJlcGFyZVNsb3c6IGZ1bmN0aW9uIHByZXBhcmVTbG93KHRhcmdldCkge1xuXHRcdFx0XHRcdFx0aWYgKCF0YXJnZXQpIHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdHRhcmdldDogJycsXG5cdFx0XHRcdFx0XHRcdF90YXJnZXRMb3dlckNvZGVzOiBbMCAvKnRoaXMgMCBkb2Vzbid0IG1ha2Ugc2Vuc2UuIGhlcmUgYmVjYXVzZSBhbiBlbXB0eSBhcnJheSBjYXVzZXMgdGhlIGFsZ29yaXRobSB0byBkZW9wdGltaXplIGFuZCBydW4gNTAlIHNsb3dlciEqL10sXG5cdFx0XHRcdFx0XHRcdF9uZXh0QmVnaW5uaW5nSW5kZXhlczogbnVsbCxcblx0XHRcdFx0XHRcdFx0c2NvcmU6IG51bGwsXG5cdFx0XHRcdFx0XHRcdGluZGV4ZXM6IG51bGwsXG5cdFx0XHRcdFx0XHRcdG9iajogbnVsbFxuXHRcdFx0XHRcdFx0fTsgLy8gaGlkZGVuXG5cdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHR0YXJnZXQ6IHRhcmdldCxcblx0XHRcdFx0XHRcdFx0X3RhcmdldExvd2VyQ29kZXM6IGZ1enp5c29ydC5wcmVwYXJlTG93ZXJDb2Rlcyh0YXJnZXQpLFxuXHRcdFx0XHRcdFx0XHRfbmV4dEJlZ2lubmluZ0luZGV4ZXM6IGZ1enp5c29ydC5wcmVwYXJlTmV4dEJlZ2lubmluZ0luZGV4ZXModGFyZ2V0KSxcblx0XHRcdFx0XHRcdFx0c2NvcmU6IG51bGwsXG5cdFx0XHRcdFx0XHRcdGluZGV4ZXM6IG51bGwsXG5cdFx0XHRcdFx0XHRcdG9iajogbnVsbFxuXHRcdFx0XHRcdFx0fTsgLy8gaGlkZGVuXG5cdFx0XHRcdFx0fSxcblxuXHRcdFx0XHRcdHByZXBhcmVTZWFyY2g6IGZ1bmN0aW9uIHByZXBhcmVTZWFyY2goc2VhcmNoKSB7XG5cdFx0XHRcdFx0XHRpZiAoIXNlYXJjaCkgc2VhcmNoID0gJyc7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZnV6enlzb3J0LnByZXBhcmVMb3dlckNvZGVzKHNlYXJjaCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQvLyBCZWxvdyB0aGlzIHBvaW50IGlzIG9ubHkgaW50ZXJuYWwgY29kZVxuXHRcdFx0XHRcdC8vIEJlbG93IHRoaXMgcG9pbnQgaXMgb25seSBpbnRlcm5hbCBjb2RlXG5cdFx0XHRcdFx0Ly8gQmVsb3cgdGhpcyBwb2ludCBpcyBvbmx5IGludGVybmFsIGNvZGVcblx0XHRcdFx0XHQvLyBCZWxvdyB0aGlzIHBvaW50IGlzIG9ubHkgaW50ZXJuYWwgY29kZVxuXG5cdFx0XHRcdFx0Z2V0UHJlcGFyZWQ6IGZ1bmN0aW9uIGdldFByZXBhcmVkKHRhcmdldCkge1xuXHRcdFx0XHRcdFx0aWYgKHRhcmdldC5sZW5ndGggPiA5OTkpIHJldHVybiBmdXp6eXNvcnQucHJlcGFyZSh0YXJnZXQpOyAvLyBkb24ndCBjYWNoZSBodWdlIHRhcmdldHNcblx0XHRcdFx0XHRcdHZhciB0YXJnZXRQcmVwYXJlZCA9IHByZXBhcmVkQ2FjaGUuZ2V0KHRhcmdldCk7XG5cdFx0XHRcdFx0XHRpZiAodGFyZ2V0UHJlcGFyZWQgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHRhcmdldFByZXBhcmVkO1xuXHRcdFx0XHRcdFx0dGFyZ2V0UHJlcGFyZWQgPSBmdXp6eXNvcnQucHJlcGFyZSh0YXJnZXQpO1xuXHRcdFx0XHRcdFx0cHJlcGFyZWRDYWNoZS5zZXQodGFyZ2V0LCB0YXJnZXRQcmVwYXJlZCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdGFyZ2V0UHJlcGFyZWQ7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRnZXRQcmVwYXJlZFNlYXJjaDogZnVuY3Rpb24gZ2V0UHJlcGFyZWRTZWFyY2goc2VhcmNoKSB7XG5cdFx0XHRcdFx0XHRpZiAoc2VhcmNoLmxlbmd0aCA+IDk5OSkgcmV0dXJuIGZ1enp5c29ydC5wcmVwYXJlU2VhcmNoKHNlYXJjaCk7IC8vIGRvbid0IGNhY2hlIGh1Z2Ugc2VhcmNoZXNcblx0XHRcdFx0XHRcdHZhciBzZWFyY2hQcmVwYXJlZCA9IHByZXBhcmVkU2VhcmNoQ2FjaGUuZ2V0KHNlYXJjaCk7XG5cdFx0XHRcdFx0XHRpZiAoc2VhcmNoUHJlcGFyZWQgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHNlYXJjaFByZXBhcmVkO1xuXHRcdFx0XHRcdFx0c2VhcmNoUHJlcGFyZWQgPSBmdXp6eXNvcnQucHJlcGFyZVNlYXJjaChzZWFyY2gpO1xuXHRcdFx0XHRcdFx0cHJlcGFyZWRTZWFyY2hDYWNoZS5zZXQoc2VhcmNoLCBzZWFyY2hQcmVwYXJlZCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gc2VhcmNoUHJlcGFyZWQ7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRhbGdvcml0aG06IGZ1bmN0aW9uIGFsZ29yaXRobShzZWFyY2hMb3dlckNvZGVzLCBwcmVwYXJlZCwgc2VhcmNoTG93ZXJDb2RlKSB7XG5cdFx0XHRcdFx0XHR2YXIgdGFyZ2V0TG93ZXJDb2RlcyA9IHByZXBhcmVkLl90YXJnZXRMb3dlckNvZGVzO1xuXHRcdFx0XHRcdFx0dmFyIHNlYXJjaExlbiA9IHNlYXJjaExvd2VyQ29kZXMubGVuZ3RoO1xuXHRcdFx0XHRcdFx0dmFyIHRhcmdldExlbiA9IHRhcmdldExvd2VyQ29kZXMubGVuZ3RoO1xuXHRcdFx0XHRcdFx0dmFyIHNlYXJjaEkgPSAwOyAvLyB3aGVyZSB3ZSBhdFxuXHRcdFx0XHRcdFx0dmFyIHRhcmdldEkgPSAwOyAvLyB3aGVyZSB5b3UgYXRcblx0XHRcdFx0XHRcdHZhciB0eXBvU2ltcGxlSSA9IDA7XG5cdFx0XHRcdFx0XHR2YXIgbWF0Y2hlc1NpbXBsZUxlbiA9IDA7XG5cblx0XHRcdFx0XHRcdC8vIHZlcnkgYmFzaWMgZnV6enkgbWF0Y2g7IHRvIHJlbW92ZSBub24tbWF0Y2hpbmcgdGFyZ2V0cyBBU0FQIVxuXHRcdFx0XHRcdFx0Ly8gd2FsayB0aHJvdWdoIHRhcmdldC4gZmluZCBzZXF1ZW50aWFsIG1hdGNoZXMuXG5cdFx0XHRcdFx0XHQvLyBpZiBhbGwgY2hhcnMgYXJlbid0IGZvdW5kIHRoZW4gZXhpdFxuXHRcdFx0XHRcdFx0Zm9yICg7Oykge1xuXHRcdFx0XHRcdFx0XHR2YXIgaXNNYXRjaCA9IHNlYXJjaExvd2VyQ29kZSA9PT0gdGFyZ2V0TG93ZXJDb2Rlc1t0YXJnZXRJXTtcblx0XHRcdFx0XHRcdFx0aWYgKGlzTWF0Y2gpIHtcblx0XHRcdFx0XHRcdFx0XHRtYXRjaGVzU2ltcGxlW21hdGNoZXNTaW1wbGVMZW4rK10gPSB0YXJnZXRJO1xuXHRcdFx0XHRcdFx0XHRcdCsrc2VhcmNoSTtcblx0XHRcdFx0XHRcdFx0XHRpZiAoc2VhcmNoSSA9PT0gc2VhcmNoTGVuKSBicmVhaztcblx0XHRcdFx0XHRcdFx0XHRzZWFyY2hMb3dlckNvZGUgPSBzZWFyY2hMb3dlckNvZGVzW3R5cG9TaW1wbGVJID09PSAwID8gc2VhcmNoSSA6IHR5cG9TaW1wbGVJID09PSBzZWFyY2hJID8gc2VhcmNoSSArIDEgOiB0eXBvU2ltcGxlSSA9PT0gc2VhcmNoSSAtIDEgPyBzZWFyY2hJIC0gMSA6IHNlYXJjaEldO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdCsrdGFyZ2V0STtcblx0XHRcdFx0XHRcdFx0aWYgKHRhcmdldEkgPj0gdGFyZ2V0TGVuKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gRmFpbGVkIHRvIGZpbmQgc2VhcmNoSVxuXHRcdFx0XHRcdFx0XHRcdC8vIENoZWNrIGZvciB0eXBvIG9yIGV4aXRcblx0XHRcdFx0XHRcdFx0XHQvLyB3ZSBnbyBhcyBmYXIgYXMgcG9zc2libGUgYmVmb3JlIHRyeWluZyB0byB0cmFuc3Bvc2Vcblx0XHRcdFx0XHRcdFx0XHQvLyB0aGVuIHdlIHRyYW5zcG9zZSBiYWNrd2FyZHMgdW50aWwgd2UgcmVhY2ggdGhlIGJlZ2lubmluZ1xuXHRcdFx0XHRcdFx0XHRcdGZvciAoOzspIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChzZWFyY2hJIDw9IDEpIHJldHVybiBudWxsOyAvLyBub3QgYWxsb3dlZCB0byB0cmFuc3Bvc2UgZmlyc3QgY2hhclxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHR5cG9TaW1wbGVJID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIHdlIGhhdmVuJ3QgdHJpZWQgdG8gdHJhbnNwb3NlIHlldFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQtLXNlYXJjaEk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHZhciBzZWFyY2hMb3dlckNvZGVOZXcgPSBzZWFyY2hMb3dlckNvZGVzW3NlYXJjaEldO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoc2VhcmNoTG93ZXJDb2RlID09PSBzZWFyY2hMb3dlckNvZGVOZXcpIGNvbnRpbnVlOyAvLyBkb2Vzbid0IG1ha2Ugc2Vuc2UgdG8gdHJhbnNwb3NlIGEgcmVwZWF0IGNoYXJcblx0XHRcdFx0XHRcdFx0XHRcdFx0dHlwb1NpbXBsZUkgPSBzZWFyY2hJO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKHR5cG9TaW1wbGVJID09PSAxKSByZXR1cm4gbnVsbDsgLy8gcmVhY2hlZCB0aGUgZW5kIG9mIHRoZSBsaW5lIGZvciB0cmFuc3Bvc2luZ1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQtLXR5cG9TaW1wbGVJO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRzZWFyY2hJID0gdHlwb1NpbXBsZUk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHNlYXJjaExvd2VyQ29kZSA9IHNlYXJjaExvd2VyQ29kZXNbc2VhcmNoSSArIDFdO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR2YXIgc2VhcmNoTG93ZXJDb2RlTmV3ID0gc2VhcmNoTG93ZXJDb2Rlc1tzZWFyY2hJXTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKHNlYXJjaExvd2VyQ29kZSA9PT0gc2VhcmNoTG93ZXJDb2RlTmV3KSBjb250aW51ZTsgLy8gZG9lc24ndCBtYWtlIHNlbnNlIHRvIHRyYW5zcG9zZSBhIHJlcGVhdCBjaGFyXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRcdG1hdGNoZXNTaW1wbGVMZW4gPSBzZWFyY2hJO1xuXHRcdFx0XHRcdFx0XHRcdFx0dGFyZ2V0SSA9IG1hdGNoZXNTaW1wbGVbbWF0Y2hlc1NpbXBsZUxlbiAtIDFdICsgMTtcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0dmFyIHNlYXJjaEkgPSAwO1xuXHRcdFx0XHRcdFx0dmFyIHR5cG9TdHJpY3RJID0gMDtcblx0XHRcdFx0XHRcdHZhciBzdWNjZXNzU3RyaWN0ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHR2YXIgbWF0Y2hlc1N0cmljdExlbiA9IDA7XG5cdFx0XHRcdFx0XHR2YXIgbmV4dEJlZ2lubmluZ0luZGV4ZXMgPSBwcmVwYXJlZC5fbmV4dEJlZ2lubmluZ0luZGV4ZXM7XG5cdFx0XHRcdFx0XHRpZiAobmV4dEJlZ2lubmluZ0luZGV4ZXMgPT09IG51bGwpIG5leHRCZWdpbm5pbmdJbmRleGVzID0gcHJlcGFyZWQuX25leHRCZWdpbm5pbmdJbmRleGVzID0gZnV6enlzb3J0LnByZXBhcmVOZXh0QmVnaW5uaW5nSW5kZXhlcyhwcmVwYXJlZC50YXJnZXQpO1xuXHRcdFx0XHRcdFx0dmFyIGZpcnN0UG9zc2libGVJID0gdGFyZ2V0SSA9IG1hdGNoZXNTaW1wbGVbMF0gPT09IDAgPyAwIDogbmV4dEJlZ2lubmluZ0luZGV4ZXNbbWF0Y2hlc1NpbXBsZVswXSAtIDFdO1xuXG5cdFx0XHRcdFx0XHQvLyBPdXIgdGFyZ2V0IHN0cmluZyBzdWNjZXNzZnVsbHkgbWF0Y2hlZCBhbGwgY2hhcmFjdGVycyBpbiBzZXF1ZW5jZSFcblx0XHRcdFx0XHRcdC8vIExldCdzIHRyeSBhIG1vcmUgYWR2YW5jZWQgYW5kIHN0cmljdCB0ZXN0IHRvIGltcHJvdmUgdGhlIHNjb3JlXG5cdFx0XHRcdFx0XHQvLyBvbmx5IGNvdW50IGl0IGFzIGEgbWF0Y2ggaWYgaXQncyBjb25zZWN1dGl2ZSBvciBhIGJlZ2lubmluZyBjaGFyYWN0ZXIhXG5cdFx0XHRcdFx0XHRpZiAodGFyZ2V0SSAhPT0gdGFyZ2V0TGVuKSBmb3IgKDs7KSB7XG5cdFx0XHRcdFx0XHRcdGlmICh0YXJnZXRJID49IHRhcmdldExlbikge1xuXHRcdFx0XHRcdFx0XHRcdC8vIFdlIGZhaWxlZCB0byBmaW5kIGEgZ29vZCBzcG90IGZvciB0aGlzIHNlYXJjaCBjaGFyLCBnbyBiYWNrIHRvIHRoZSBwcmV2aW91cyBzZWFyY2ggY2hhciBhbmQgZm9yY2UgaXQgZm9yd2FyZFxuXHRcdFx0XHRcdFx0XHRcdGlmIChzZWFyY2hJIDw9IDApIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIFdlIGZhaWxlZCB0byBwdXNoIGNoYXJzIGZvcndhcmQgZm9yIGEgYmV0dGVyIG1hdGNoXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyB0cmFuc3Bvc2UsIHN0YXJ0aW5nIGZyb20gdGhlIGJlZ2lubmluZ1xuXHRcdFx0XHRcdFx0XHRcdFx0Kyt0eXBvU3RyaWN0STtcblx0XHRcdFx0XHRcdFx0XHRcdGlmICh0eXBvU3RyaWN0SSA+IHNlYXJjaExlbiAtIDIpIGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHNlYXJjaExvd2VyQ29kZXNbdHlwb1N0cmljdEldID09PSBzZWFyY2hMb3dlckNvZGVzW3R5cG9TdHJpY3RJICsgMV0pIGNvbnRpbnVlOyAvLyBkb2Vzbid0IG1ha2Ugc2Vuc2UgdG8gdHJhbnNwb3NlIGEgcmVwZWF0IGNoYXJcblx0XHRcdFx0XHRcdFx0XHRcdHRhcmdldEkgPSBmaXJzdFBvc3NpYmxlSTtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHQtLXNlYXJjaEk7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIGxhc3RNYXRjaCA9IG1hdGNoZXNTdHJpY3RbLS1tYXRjaGVzU3RyaWN0TGVuXTtcblx0XHRcdFx0XHRcdFx0XHR0YXJnZXRJID0gbmV4dEJlZ2lubmluZ0luZGV4ZXNbbGFzdE1hdGNoXTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHR2YXIgaXNNYXRjaCA9IHNlYXJjaExvd2VyQ29kZXNbdHlwb1N0cmljdEkgPT09IDAgPyBzZWFyY2hJIDogdHlwb1N0cmljdEkgPT09IHNlYXJjaEkgPyBzZWFyY2hJICsgMSA6IHR5cG9TdHJpY3RJID09PSBzZWFyY2hJIC0gMSA/IHNlYXJjaEkgLSAxIDogc2VhcmNoSV0gPT09IHRhcmdldExvd2VyQ29kZXNbdGFyZ2V0SV07XG5cdFx0XHRcdFx0XHRcdFx0aWYgKGlzTWF0Y2gpIHtcblx0XHRcdFx0XHRcdFx0XHRcdG1hdGNoZXNTdHJpY3RbbWF0Y2hlc1N0cmljdExlbisrXSA9IHRhcmdldEk7XG5cdFx0XHRcdFx0XHRcdFx0XHQrK3NlYXJjaEk7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoc2VhcmNoSSA9PT0gc2VhcmNoTGVuKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHN1Y2Nlc3NTdHJpY3QgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdCsrdGFyZ2V0STtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0dGFyZ2V0SSA9IG5leHRCZWdpbm5pbmdJbmRleGVzW3RhcmdldEldO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvLyB0YWxseSB1cCB0aGUgc2NvcmUgJiBrZWVwIHRyYWNrIG9mIG1hdGNoZXMgZm9yIGhpZ2hsaWdodGluZyBsYXRlclxuXHRcdFx0XHRcdFx0XHRpZiAoc3VjY2Vzc1N0cmljdCkge1xuXHRcdFx0XHRcdFx0XHRcdHZhciBtYXRjaGVzQmVzdCA9IG1hdGNoZXNTdHJpY3Q7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIG1hdGNoZXNCZXN0TGVuID0gbWF0Y2hlc1N0cmljdExlbjtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHR2YXIgbWF0Y2hlc0Jlc3QgPSBtYXRjaGVzU2ltcGxlO1xuXHRcdFx0XHRcdFx0XHRcdHZhciBtYXRjaGVzQmVzdExlbiA9IG1hdGNoZXNTaW1wbGVMZW47XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0dmFyIHNjb3JlID0gMDtcblx0XHRcdFx0XHRcdFx0dmFyIGxhc3RUYXJnZXRJID0gLTE7XG5cdFx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2VhcmNoTGVuOyArK2kpIHtcblx0XHRcdFx0XHRcdFx0XHR2YXIgdGFyZ2V0SSA9IG1hdGNoZXNCZXN0W2ldO1xuXHRcdFx0XHRcdFx0XHRcdC8vIHNjb3JlIG9ubHkgZ29lcyBkb3duIGlmIHRoZXkncmUgbm90IGNvbnNlY3V0aXZlXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGxhc3RUYXJnZXRJICE9PSB0YXJnZXRJIC0gMSkgc2NvcmUgLT0gdGFyZ2V0STtcblx0XHRcdFx0XHRcdFx0XHRsYXN0VGFyZ2V0SSA9IHRhcmdldEk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0aWYgKCFzdWNjZXNzU3RyaWN0KSB7XG5cdFx0XHRcdFx0XHRcdFx0c2NvcmUgKj0gMTAwMDtcblx0XHRcdFx0XHRcdFx0XHRpZiAodHlwb1NpbXBsZUkgIT09IDApIHNjb3JlICs9IC0yMDsgLyp0eXBvUGVuYWx0eSovXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHR5cG9TdHJpY3RJICE9PSAwKSBzY29yZSArPSAtMjA7IC8qdHlwb1BlbmFsdHkqL1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0c2NvcmUgLT0gdGFyZ2V0TGVuIC0gc2VhcmNoTGVuO1xuXHRcdFx0XHRcdFx0XHRwcmVwYXJlZC5zY29yZSA9IHNjb3JlO1xuXHRcdFx0XHRcdFx0XHRwcmVwYXJlZC5pbmRleGVzID0gbmV3IEFycmF5KG1hdGNoZXNCZXN0TGVuKTtcblx0XHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IG1hdGNoZXNCZXN0TGVuIC0gMTsgaSA+PSAwOyAtLWkpIHtcblx0XHRcdFx0XHRcdFx0XHRwcmVwYXJlZC5pbmRleGVzW2ldID0gbWF0Y2hlc0Jlc3RbaV07XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHByZXBhcmVkO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0YWxnb3JpdGhtTm9UeXBvOiBmdW5jdGlvbiBhbGdvcml0aG1Ob1R5cG8oc2VhcmNoTG93ZXJDb2RlcywgcHJlcGFyZWQsIHNlYXJjaExvd2VyQ29kZSkge1xuXHRcdFx0XHRcdFx0dmFyIHRhcmdldExvd2VyQ29kZXMgPSBwcmVwYXJlZC5fdGFyZ2V0TG93ZXJDb2Rlcztcblx0XHRcdFx0XHRcdHZhciBzZWFyY2hMZW4gPSBzZWFyY2hMb3dlckNvZGVzLmxlbmd0aDtcblx0XHRcdFx0XHRcdHZhciB0YXJnZXRMZW4gPSB0YXJnZXRMb3dlckNvZGVzLmxlbmd0aDtcblx0XHRcdFx0XHRcdHZhciBzZWFyY2hJID0gMDsgLy8gd2hlcmUgd2UgYXRcblx0XHRcdFx0XHRcdHZhciB0YXJnZXRJID0gMDsgLy8gd2hlcmUgeW91IGF0XG5cdFx0XHRcdFx0XHR2YXIgbWF0Y2hlc1NpbXBsZUxlbiA9IDA7XG5cblx0XHRcdFx0XHRcdC8vIHZlcnkgYmFzaWMgZnV6enkgbWF0Y2g7IHRvIHJlbW92ZSBub24tbWF0Y2hpbmcgdGFyZ2V0cyBBU0FQIVxuXHRcdFx0XHRcdFx0Ly8gd2FsayB0aHJvdWdoIHRhcmdldC4gZmluZCBzZXF1ZW50aWFsIG1hdGNoZXMuXG5cdFx0XHRcdFx0XHQvLyBpZiBhbGwgY2hhcnMgYXJlbid0IGZvdW5kIHRoZW4gZXhpdFxuXHRcdFx0XHRcdFx0Zm9yICg7Oykge1xuXHRcdFx0XHRcdFx0XHR2YXIgaXNNYXRjaCA9IHNlYXJjaExvd2VyQ29kZSA9PT0gdGFyZ2V0TG93ZXJDb2Rlc1t0YXJnZXRJXTtcblx0XHRcdFx0XHRcdFx0aWYgKGlzTWF0Y2gpIHtcblx0XHRcdFx0XHRcdFx0XHRtYXRjaGVzU2ltcGxlW21hdGNoZXNTaW1wbGVMZW4rK10gPSB0YXJnZXRJO1xuXHRcdFx0XHRcdFx0XHRcdCsrc2VhcmNoSTtcblx0XHRcdFx0XHRcdFx0XHRpZiAoc2VhcmNoSSA9PT0gc2VhcmNoTGVuKSBicmVhaztcblx0XHRcdFx0XHRcdFx0XHRzZWFyY2hMb3dlckNvZGUgPSBzZWFyY2hMb3dlckNvZGVzW3NlYXJjaEldO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdCsrdGFyZ2V0STtcblx0XHRcdFx0XHRcdFx0aWYgKHRhcmdldEkgPj0gdGFyZ2V0TGVuKSByZXR1cm4gbnVsbDsgLy8gRmFpbGVkIHRvIGZpbmQgc2VhcmNoSVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR2YXIgc2VhcmNoSSA9IDA7XG5cdFx0XHRcdFx0XHR2YXIgc3VjY2Vzc1N0cmljdCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0dmFyIG1hdGNoZXNTdHJpY3RMZW4gPSAwO1xuXHRcdFx0XHRcdFx0dmFyIG5leHRCZWdpbm5pbmdJbmRleGVzID0gcHJlcGFyZWQuX25leHRCZWdpbm5pbmdJbmRleGVzO1xuXHRcdFx0XHRcdFx0aWYgKG5leHRCZWdpbm5pbmdJbmRleGVzID09PSBudWxsKSBuZXh0QmVnaW5uaW5nSW5kZXhlcyA9IHByZXBhcmVkLl9uZXh0QmVnaW5uaW5nSW5kZXhlcyA9IGZ1enp5c29ydC5wcmVwYXJlTmV4dEJlZ2lubmluZ0luZGV4ZXMocHJlcGFyZWQudGFyZ2V0KTtcblx0XHRcdFx0XHRcdHRhcmdldEkgPSBtYXRjaGVzU2ltcGxlWzBdID09PSAwID8gMCA6IG5leHRCZWdpbm5pbmdJbmRleGVzW21hdGNoZXNTaW1wbGVbMF0gLSAxXTtcblxuXHRcdFx0XHRcdFx0Ly8gT3VyIHRhcmdldCBzdHJpbmcgc3VjY2Vzc2Z1bGx5IG1hdGNoZWQgYWxsIGNoYXJhY3RlcnMgaW4gc2VxdWVuY2UhXG5cdFx0XHRcdFx0XHQvLyBMZXQncyB0cnkgYSBtb3JlIGFkdmFuY2VkIGFuZCBzdHJpY3QgdGVzdCB0byBpbXByb3ZlIHRoZSBzY29yZVxuXHRcdFx0XHRcdFx0Ly8gb25seSBjb3VudCBpdCBhcyBhIG1hdGNoIGlmIGl0J3MgY29uc2VjdXRpdmUgb3IgYSBiZWdpbm5pbmcgY2hhcmFjdGVyIVxuXHRcdFx0XHRcdFx0aWYgKHRhcmdldEkgIT09IHRhcmdldExlbikgZm9yICg7Oykge1xuXHRcdFx0XHRcdFx0XHRpZiAodGFyZ2V0SSA+PSB0YXJnZXRMZW4pIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBXZSBmYWlsZWQgdG8gZmluZCBhIGdvb2Qgc3BvdCBmb3IgdGhpcyBzZWFyY2ggY2hhciwgZ28gYmFjayB0byB0aGUgcHJldmlvdXMgc2VhcmNoIGNoYXIgYW5kIGZvcmNlIGl0IGZvcndhcmRcblx0XHRcdFx0XHRcdFx0XHRpZiAoc2VhcmNoSSA8PSAwKSBicmVhazsgLy8gV2UgZmFpbGVkIHRvIHB1c2ggY2hhcnMgZm9yd2FyZCBmb3IgYSBiZXR0ZXIgbWF0Y2hcblxuXHRcdFx0XHRcdFx0XHRcdC0tc2VhcmNoSTtcblx0XHRcdFx0XHRcdFx0XHR2YXIgbGFzdE1hdGNoID0gbWF0Y2hlc1N0cmljdFstLW1hdGNoZXNTdHJpY3RMZW5dO1xuXHRcdFx0XHRcdFx0XHRcdHRhcmdldEkgPSBuZXh0QmVnaW5uaW5nSW5kZXhlc1tsYXN0TWF0Y2hdO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdHZhciBpc01hdGNoID0gc2VhcmNoTG93ZXJDb2Rlc1tzZWFyY2hJXSA9PT0gdGFyZ2V0TG93ZXJDb2Rlc1t0YXJnZXRJXTtcblx0XHRcdFx0XHRcdFx0XHRpZiAoaXNNYXRjaCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0bWF0Y2hlc1N0cmljdFttYXRjaGVzU3RyaWN0TGVuKytdID0gdGFyZ2V0STtcblx0XHRcdFx0XHRcdFx0XHRcdCsrc2VhcmNoSTtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChzZWFyY2hJID09PSBzZWFyY2hMZW4pIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0c3VjY2Vzc1N0cmljdCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0Kyt0YXJnZXRJO1xuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0YXJnZXRJID0gbmV4dEJlZ2lubmluZ0luZGV4ZXNbdGFyZ2V0SV07XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8vIHRhbGx5IHVwIHRoZSBzY29yZSAmIGtlZXAgdHJhY2sgb2YgbWF0Y2hlcyBmb3IgaGlnaGxpZ2h0aW5nIGxhdGVyXG5cdFx0XHRcdFx0XHRcdGlmIChzdWNjZXNzU3RyaWN0KSB7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIG1hdGNoZXNCZXN0ID0gbWF0Y2hlc1N0cmljdDtcblx0XHRcdFx0XHRcdFx0XHR2YXIgbWF0Y2hlc0Jlc3RMZW4gPSBtYXRjaGVzU3RyaWN0TGVuO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdHZhciBtYXRjaGVzQmVzdCA9IG1hdGNoZXNTaW1wbGU7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIG1hdGNoZXNCZXN0TGVuID0gbWF0Y2hlc1NpbXBsZUxlbjtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR2YXIgc2NvcmUgPSAwO1xuXHRcdFx0XHRcdFx0XHR2YXIgbGFzdFRhcmdldEkgPSAtMTtcblx0XHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzZWFyY2hMZW47ICsraSkge1xuXHRcdFx0XHRcdFx0XHRcdHZhciB0YXJnZXRJID0gbWF0Y2hlc0Jlc3RbaV07XG5cdFx0XHRcdFx0XHRcdFx0Ly8gc2NvcmUgb25seSBnb2VzIGRvd24gaWYgdGhleSdyZSBub3QgY29uc2VjdXRpdmVcblx0XHRcdFx0XHRcdFx0XHRpZiAobGFzdFRhcmdldEkgIT09IHRhcmdldEkgLSAxKSBzY29yZSAtPSB0YXJnZXRJO1xuXHRcdFx0XHRcdFx0XHRcdGxhc3RUYXJnZXRJID0gdGFyZ2V0STtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRpZiAoIXN1Y2Nlc3NTdHJpY3QpIHNjb3JlICo9IDEwMDA7XG5cdFx0XHRcdFx0XHRcdHNjb3JlIC09IHRhcmdldExlbiAtIHNlYXJjaExlbjtcblx0XHRcdFx0XHRcdFx0cHJlcGFyZWQuc2NvcmUgPSBzY29yZTtcblx0XHRcdFx0XHRcdFx0cHJlcGFyZWQuaW5kZXhlcyA9IG5ldyBBcnJheShtYXRjaGVzQmVzdExlbik7XG5cdFx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSBtYXRjaGVzQmVzdExlbiAtIDE7IGkgPj0gMDsgLS1pKSB7XG5cdFx0XHRcdFx0XHRcdFx0cHJlcGFyZWQuaW5kZXhlc1tpXSA9IG1hdGNoZXNCZXN0W2ldO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwcmVwYXJlZDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHByZXBhcmVMb3dlckNvZGVzOiBmdW5jdGlvbiBwcmVwYXJlTG93ZXJDb2RlcyhzdHIpIHtcblx0XHRcdFx0XHRcdHZhciBzdHJMZW4gPSBzdHIubGVuZ3RoO1xuXHRcdFx0XHRcdFx0dmFyIGxvd2VyQ29kZXMgPSBbXTsgLy8gbmV3IEFycmF5KHN0ckxlbikgICAgc3BhcnNlIGFycmF5IGlzIHRvbyBzbG93XG5cdFx0XHRcdFx0XHR2YXIgbG93ZXIgPSBzdHIudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc3RyTGVuOyArK2kpIHtcblx0XHRcdFx0XHRcdFx0bG93ZXJDb2Rlc1tpXSA9IGxvd2VyLmNoYXJDb2RlQXQoaSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm4gbG93ZXJDb2Rlcztcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHByZXBhcmVCZWdpbm5pbmdJbmRleGVzOiBmdW5jdGlvbiBwcmVwYXJlQmVnaW5uaW5nSW5kZXhlcyh0YXJnZXQpIHtcblx0XHRcdFx0XHRcdHZhciB0YXJnZXRMZW4gPSB0YXJnZXQubGVuZ3RoO1xuXHRcdFx0XHRcdFx0dmFyIGJlZ2lubmluZ0luZGV4ZXMgPSBbXTtcblx0XHRcdFx0XHRcdHZhciBiZWdpbm5pbmdJbmRleGVzTGVuID0gMDtcblx0XHRcdFx0XHRcdHZhciB3YXNVcHBlciA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0dmFyIHdhc0FscGhhbnVtID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRhcmdldExlbjsgKytpKSB7XG5cdFx0XHRcdFx0XHRcdHZhciB0YXJnZXRDb2RlID0gdGFyZ2V0LmNoYXJDb2RlQXQoaSk7XG5cdFx0XHRcdFx0XHRcdHZhciBpc1VwcGVyID0gdGFyZ2V0Q29kZSA+PSA2NSAmJiB0YXJnZXRDb2RlIDw9IDkwO1xuXHRcdFx0XHRcdFx0XHR2YXIgaXNBbHBoYW51bSA9IGlzVXBwZXIgfHwgdGFyZ2V0Q29kZSA+PSA5NyAmJiB0YXJnZXRDb2RlIDw9IDEyMiB8fCB0YXJnZXRDb2RlID49IDQ4ICYmIHRhcmdldENvZGUgPD0gNTc7XG5cdFx0XHRcdFx0XHRcdHZhciBpc0JlZ2lubmluZyA9IGlzVXBwZXIgJiYgIXdhc1VwcGVyIHx8ICF3YXNBbHBoYW51bSB8fCAhaXNBbHBoYW51bTtcblx0XHRcdFx0XHRcdFx0d2FzVXBwZXIgPSBpc1VwcGVyO1xuXHRcdFx0XHRcdFx0XHR3YXNBbHBoYW51bSA9IGlzQWxwaGFudW07XG5cdFx0XHRcdFx0XHRcdGlmIChpc0JlZ2lubmluZykgYmVnaW5uaW5nSW5kZXhlc1tiZWdpbm5pbmdJbmRleGVzTGVuKytdID0gaTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJldHVybiBiZWdpbm5pbmdJbmRleGVzO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0cHJlcGFyZU5leHRCZWdpbm5pbmdJbmRleGVzOiBmdW5jdGlvbiBwcmVwYXJlTmV4dEJlZ2lubmluZ0luZGV4ZXModGFyZ2V0KSB7XG5cdFx0XHRcdFx0XHR2YXIgdGFyZ2V0TGVuID0gdGFyZ2V0Lmxlbmd0aDtcblx0XHRcdFx0XHRcdHZhciBiZWdpbm5pbmdJbmRleGVzID0gZnV6enlzb3J0LnByZXBhcmVCZWdpbm5pbmdJbmRleGVzKHRhcmdldCk7XG5cdFx0XHRcdFx0XHR2YXIgbmV4dEJlZ2lubmluZ0luZGV4ZXMgPSBbXTsgLy8gbmV3IEFycmF5KHRhcmdldExlbikgICAgIHNwYXJzZSBhcnJheSBpcyB0b28gc2xvd1xuXHRcdFx0XHRcdFx0dmFyIGxhc3RJc0JlZ2lubmluZyA9IGJlZ2lubmluZ0luZGV4ZXNbMF07XG5cdFx0XHRcdFx0XHR2YXIgbGFzdElzQmVnaW5uaW5nSSA9IDA7XG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRhcmdldExlbjsgKytpKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChsYXN0SXNCZWdpbm5pbmcgPiBpKSB7XG5cdFx0XHRcdFx0XHRcdFx0bmV4dEJlZ2lubmluZ0luZGV4ZXNbaV0gPSBsYXN0SXNCZWdpbm5pbmc7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0bGFzdElzQmVnaW5uaW5nID0gYmVnaW5uaW5nSW5kZXhlc1srK2xhc3RJc0JlZ2lubmluZ0ldO1xuXHRcdFx0XHRcdFx0XHRcdG5leHRCZWdpbm5pbmdJbmRleGVzW2ldID0gbGFzdElzQmVnaW5uaW5nID09PSB1bmRlZmluZWQgPyB0YXJnZXRMZW4gOiBsYXN0SXNCZWdpbm5pbmc7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJldHVybiBuZXh0QmVnaW5uaW5nSW5kZXhlcztcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGNsZWFudXA6IGNsZWFudXAsXG5cdFx0XHRcdFx0bmV3OiBmdXp6eXNvcnROZXdcblx0XHRcdFx0fTtcblx0XHRcdFx0cmV0dXJuIGZ1enp5c29ydDtcblx0XHRcdH0gLy8gZnV6enlzb3J0TmV3XG5cblx0XHRcdC8vIFRoaXMgc3R1ZmYgaXMgb3V0c2lkZSBmdXp6eXNvcnROZXcsIGJlY2F1c2UgaXQncyBzaGFyZWQgd2l0aCBpbnN0YW5jZXMgb2YgZnV6enlzb3J0Lm5ldygpXG5cdFx0XHR2YXIgaXNOb2RlID0gdHlwZW9mIGNvbW1vbmpzUmVxdWlyZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCc7XG5cdFx0XHR2YXIgTXlNYXAgPSB0eXBlb2YgTWFwID09PSAnZnVuY3Rpb24nID8gTWFwIDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR2YXIgcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cdFx0XHRcdHRoaXMuZ2V0ID0gZnVuY3Rpb24gKGspIHtcblx0XHRcdFx0XHRyZXR1cm4gc1trXTtcblx0XHRcdFx0fTtcblx0XHRcdFx0dGhpcy5zZXQgPSBmdW5jdGlvbiAoaywgdmFsKSB7XG5cdFx0XHRcdFx0c1trXSA9IHZhbDtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcztcblx0XHRcdFx0fTtcblx0XHRcdFx0dGhpcy5jbGVhciA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblx0XHRcdFx0fTtcblx0XHRcdH07XG5cdFx0XHR2YXIgcHJlcGFyZWRDYWNoZSA9IG5ldyBNeU1hcCgpO1xuXHRcdFx0dmFyIHByZXBhcmVkU2VhcmNoQ2FjaGUgPSBuZXcgTXlNYXAoKTtcblx0XHRcdHZhciBub1Jlc3VsdHMgPSBbXTtcblx0XHRcdG5vUmVzdWx0cy50b3RhbCA9IDA7XG5cdFx0XHR2YXIgbWF0Y2hlc1NpbXBsZSA9IFtdO1xuXHRcdFx0dmFyIG1hdGNoZXNTdHJpY3QgPSBbXTtcblx0XHRcdGZ1bmN0aW9uIGNsZWFudXAoKSB7XG5cdFx0XHRcdHByZXBhcmVkQ2FjaGUuY2xlYXIoKTtcblx0XHRcdFx0cHJlcGFyZWRTZWFyY2hDYWNoZS5jbGVhcigpO1xuXHRcdFx0XHRtYXRjaGVzU2ltcGxlID0gW107XG5cdFx0XHRcdG1hdGNoZXNTdHJpY3QgPSBbXTtcblx0XHRcdH1cblx0XHRcdGZ1bmN0aW9uIGRlZmF1bHRTY29yZUZuKGEpIHtcblx0XHRcdFx0dmFyIG1heCA9IC05MDA3MTk5MjU0NzQwOTkxO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gYS5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuXHRcdFx0XHRcdHZhciByZXN1bHQgPSBhW2ldO1xuXHRcdFx0XHRcdGlmIChyZXN1bHQgPT09IG51bGwpIGNvbnRpbnVlO1xuXHRcdFx0XHRcdHZhciBzY29yZSA9IHJlc3VsdC5zY29yZTtcblx0XHRcdFx0XHRpZiAoc2NvcmUgPiBtYXgpIG1heCA9IHNjb3JlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChtYXggPT09IC05MDA3MTk5MjU0NzQwOTkxKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIG1heDtcblx0XHRcdH1cblxuXHRcdFx0Ly8gcHJvcCA9ICdrZXknICAgICAgICAgICAgICAyLjVtcyBvcHRpbWl6ZWQgZm9yIHRoaXMgY2FzZSwgc2VlbXMgdG8gYmUgYWJvdXQgYXMgZmFzdCBhcyBkaXJlY3Qgb2JqW3Byb3BdXG5cdFx0XHQvLyBwcm9wID0gJ2tleTEua2V5MicgICAgICAgIDEwbXNcblx0XHRcdC8vIHByb3AgPSBbJ2tleTEnLCAna2V5MiddICAgMjdtc1xuXHRcdFx0ZnVuY3Rpb24gZ2V0VmFsdWUob2JqLCBwcm9wKSB7XG5cdFx0XHRcdHZhciB0bXAgPSBvYmpbcHJvcF07XG5cdFx0XHRcdGlmICh0bXAgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHRtcDtcblx0XHRcdFx0dmFyIHNlZ3MgPSBwcm9wO1xuXHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkocHJvcCkpIHNlZ3MgPSBwcm9wLnNwbGl0KCcuJyk7XG5cdFx0XHRcdHZhciBsZW4gPSBzZWdzLmxlbmd0aDtcblx0XHRcdFx0dmFyIGkgPSAtMTtcblx0XHRcdFx0d2hpbGUgKG9iaiAmJiArK2kgPCBsZW4pIHtcblx0XHRcdFx0XHRvYmogPSBvYmpbc2Vnc1tpXV07XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIG9iajtcblx0XHRcdH1cblx0XHRcdGZ1bmN0aW9uIGlzT2JqKHgpIHtcblx0XHRcdFx0cmV0dXJuIF90eXBlb2YoeCkgPT09ICdvYmplY3QnO1xuXHRcdFx0fSAvLyBmYXN0ZXIgYXMgYSBmdW5jdGlvblxuXG5cdFx0XHQvLyBIYWNrZWQgdmVyc2lvbiBvZiBodHRwczovL2dpdGh1Yi5jb20vbGVtaXJlL0Zhc3RQcmlvcml0eVF1ZXVlLmpzXG5cdFx0XHR2YXIgZmFzdHByaW9yaXR5cXVldWUgPSBmdW5jdGlvbiBmYXN0cHJpb3JpdHlxdWV1ZSgpIHtcblx0XHRcdFx0dmFyIHIgPSBbXSxcblx0XHRcdFx0XHRvID0gMCxcblx0XHRcdFx0XHRlID0ge307XG5cdFx0XHRcdGZ1bmN0aW9uIG4oKSB7XG5cdFx0XHRcdFx0Zm9yICh2YXIgZSA9IDAsIG4gPSByW2VdLCBjID0gMTsgYyA8IG87KSB7XG5cdFx0XHRcdFx0XHR2YXIgZiA9IGMgKyAxO1xuXHRcdFx0XHRcdFx0ZSA9IGMsIGYgPCBvICYmIHJbZl0uc2NvcmUgPCByW2NdLnNjb3JlICYmIChlID0gZiksIHJbZSAtIDEgPj4gMV0gPSByW2VdLCBjID0gMSArIChlIDw8IDEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRmb3IgKHZhciBhID0gZSAtIDEgPj4gMTsgZSA+IDAgJiYgbi5zY29yZSA8IHJbYV0uc2NvcmU7IGEgPSAoZSA9IGEpIC0gMSA+PiAxKSB7XG5cdFx0XHRcdFx0XHRyW2VdID0gclthXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cltlXSA9IG47XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGUuYWRkID0gZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0XHR2YXIgbiA9IG87XG5cdFx0XHRcdFx0cltvKytdID0gZTtcblx0XHRcdFx0XHRmb3IgKHZhciBjID0gbiAtIDEgPj4gMTsgbiA+IDAgJiYgZS5zY29yZSA8IHJbY10uc2NvcmU7IGMgPSAobiA9IGMpIC0gMSA+PiAxKSB7XG5cdFx0XHRcdFx0XHRyW25dID0gcltjXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cltuXSA9IGU7XG5cdFx0XHRcdH0sIGUucG9sbCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRpZiAoMCAhPT0gbykge1xuXHRcdFx0XHRcdFx0dmFyIGUgPSByWzBdO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHJbMF0gPSByWy0tb10sIG4oKSwgZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sIGUucGVlayA9IGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRcdFx0aWYgKDAgIT09IG8pIHJldHVybiByWzBdO1xuXHRcdFx0XHR9LCBlLnJlcGxhY2VUb3AgPSBmdW5jdGlvbiAobykge1xuXHRcdFx0XHRcdHJbMF0gPSBvLCBuKCk7XG5cdFx0XHRcdH0sIGU7XG5cdFx0XHR9O1xuXHRcdFx0dmFyIHEgPSBmYXN0cHJpb3JpdHlxdWV1ZSgpOyAvLyByZXVzZSB0aGlzLCBleGNlcHQgZm9yIGFzeW5jLCBpdCBuZWVkcyB0byBtYWtlIGl0cyBvd25cblxuXHRcdFx0cmV0dXJuIGZ1enp5c29ydE5ldygpO1xuXHRcdH0pOyAvLyBVTURcblxuXHRcdC8vIFRPRE86IChwZXJmb3JtYW5jZSkgd2FzbSB2ZXJzaW9uIT9cblx0XHQvLyBUT0RPOiAocGVyZm9ybWFuY2UpIHRocmVhZHM/XG5cdFx0Ly8gVE9ETzogKHBlcmZvcm1hbmNlKSBhdm9pZCBjYWNoZSBtaXNzZXNcblx0XHQvLyBUT0RPOiAocGVyZm9ybWFuY2UpIHByZXBhcmVkQ2FjaGUgaXMgYSBtZW1vcnkgbGVha1xuXHRcdC8vIFRPRE86IChsaWtlIHN1YmxpbWUpIGJhY2tzbGFzaCA9PT0gZm9yd2FyZHNsYXNoXG5cdFx0Ly8gVE9ETzogKGxpa2Ugc3VibGltZSkgc3BhY2VzOiBcImEgYlwiIHNob3VsZCBkbyAyIHNlYXJjaGVzIDEgZm9yIGEgYW5kIDEgZm9yIGJcblx0XHQvLyBUT0RPOiAoc2NvcmluZykgZ2FyYmFnZSBpbiB0YXJnZXRzIHRoYXQgYWxsb3dzIG1vc3Qgc2VhcmNoZXMgdG8gc3RyaWN0IG1hdGNoIG5lZWQgYSBwZW5hbGl0eVxuXHRcdC8vIFRPRE86IChwZXJmb3JtYW5jZSkgaWRrIGlmIGFsbG93VHlwbyBpcyBvcHRpbWl6ZWRcblx0fSkoZnV6enlzb3J0JDEpO1xuXHR2YXIgZnV6enlzb3J0ID0gZnV6enlzb3J0JDEuZXhwb3J0cztcblxuXHR2YXIgc3RhdHMgPSB7XG5cdFx0ZmFpbGVkVGVzdHM6IFtdLFxuXHRcdGRlZmluZWQ6IDAsXG5cdFx0Y29tcGxldGVkOiAwXG5cdH07XG5cblx0Ly8gRXNjYXBlIHRleHQgZm9yIGF0dHJpYnV0ZSBvciB0ZXh0IGNvbnRlbnQuXG5cdGZ1bmN0aW9uIGVzY2FwZVRleHQoc3RyKSB7XG5cdFx0aWYgKCFzdHIpIHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHQvLyBCb3RoIHNpbmdsZSBxdW90ZXMgYW5kIGRvdWJsZSBxdW90ZXMgKGZvciBhdHRyaWJ1dGVzKVxuXHRcdHJldHVybiAoJycgKyBzdHIpLnJlcGxhY2UoL1snXCI8PiZdL2csIGZ1bmN0aW9uIChzKSB7XG5cdFx0XHRzd2l0Y2ggKHMpIHtcblx0XHRcdFx0Y2FzZSBcIidcIjpcblx0XHRcdFx0XHRyZXR1cm4gJyYjMDM5Oyc7XG5cdFx0XHRcdGNhc2UgJ1wiJzpcblx0XHRcdFx0XHRyZXR1cm4gJyZxdW90Oyc7XG5cdFx0XHRcdGNhc2UgJzwnOlxuXHRcdFx0XHRcdHJldHVybiAnJmx0Oyc7XG5cdFx0XHRcdGNhc2UgJz4nOlxuXHRcdFx0XHRcdHJldHVybiAnJmd0Oyc7XG5cdFx0XHRcdGNhc2UgJyYnOlxuXHRcdFx0XHRcdHJldHVybiAnJmFtcDsnO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdChmdW5jdGlvbiAoKSB7XG5cdFx0Ly8gRG9uJ3QgbG9hZCB0aGUgSFRNTCBSZXBvcnRlciBvbiBub24tYnJvd3NlciBlbnZpcm9ubWVudHNcblx0XHRpZiAoIXdpbmRvdyQxIHx8ICFkb2N1bWVudCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRRVW5pdC5yZXBvcnRlcnMucGVyZi5pbml0KFFVbml0KTtcblx0XHR2YXIgY29uZmlnID0gUVVuaXQuY29uZmlnO1xuXHRcdHZhciBoaWRkZW5UZXN0cyA9IFtdO1xuXHRcdHZhciBjb2xsYXBzZU5leHQgPSBmYWxzZTtcblx0XHR2YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblx0XHR2YXIgdW5maWx0ZXJlZFVybCA9IHNldFVybCh7XG5cdFx0XHRmaWx0ZXI6IHVuZGVmaW5lZCxcblx0XHRcdG1vZHVsZTogdW5kZWZpbmVkLFxuXHRcdFx0bW9kdWxlSWQ6IHVuZGVmaW5lZCxcblx0XHRcdHRlc3RJZDogdW5kZWZpbmVkXG5cdFx0fSk7XG5cdFx0dmFyIGRyb3Bkb3duRGF0YSA9IG51bGw7XG5cdFx0ZnVuY3Rpb24gdHJpbShzdHJpbmcpIHtcblx0XHRcdGlmICh0eXBlb2Ygc3RyaW5nLnRyaW0gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0cmV0dXJuIHN0cmluZy50cmltKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gc3RyaW5nLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZnVuY3Rpb24gYWRkRXZlbnQoZWxlbSwgdHlwZSwgZm4pIHtcblx0XHRcdGVsZW0uYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBmbiwgZmFsc2UpO1xuXHRcdH1cblx0XHRmdW5jdGlvbiByZW1vdmVFdmVudChlbGVtLCB0eXBlLCBmbikge1xuXHRcdFx0ZWxlbS5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGZuLCBmYWxzZSk7XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIGFkZEV2ZW50cyhlbGVtcywgdHlwZSwgZm4pIHtcblx0XHRcdHZhciBpID0gZWxlbXMubGVuZ3RoO1xuXHRcdFx0d2hpbGUgKGktLSkge1xuXHRcdFx0XHRhZGRFdmVudChlbGVtc1tpXSwgdHlwZSwgZm4pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRmdW5jdGlvbiBoYXNDbGFzcyhlbGVtLCBuYW1lKSB7XG5cdFx0XHRyZXR1cm4gKCcgJyArIGVsZW0uY2xhc3NOYW1lICsgJyAnKS5pbmRleE9mKCcgJyArIG5hbWUgKyAnICcpID49IDA7XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIGFkZENsYXNzKGVsZW0sIG5hbWUpIHtcblx0XHRcdGlmICghaGFzQ2xhc3MoZWxlbSwgbmFtZSkpIHtcblx0XHRcdFx0ZWxlbS5jbGFzc05hbWUgKz0gKGVsZW0uY2xhc3NOYW1lID8gJyAnIDogJycpICsgbmFtZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZnVuY3Rpb24gdG9nZ2xlQ2xhc3MoZWxlbSwgbmFtZSwgZm9yY2UpIHtcblx0XHRcdGlmIChmb3JjZSB8fCB0eXBlb2YgZm9yY2UgPT09ICd1bmRlZmluZWQnICYmICFoYXNDbGFzcyhlbGVtLCBuYW1lKSkge1xuXHRcdFx0XHRhZGRDbGFzcyhlbGVtLCBuYW1lKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJlbW92ZUNsYXNzKGVsZW0sIG5hbWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRmdW5jdGlvbiByZW1vdmVDbGFzcyhlbGVtLCBuYW1lKSB7XG5cdFx0XHR2YXIgc2V0ID0gJyAnICsgZWxlbS5jbGFzc05hbWUgKyAnICc7XG5cblx0XHRcdC8vIENsYXNzIG5hbWUgbWF5IGFwcGVhciBtdWx0aXBsZSB0aW1lc1xuXHRcdFx0d2hpbGUgKHNldC5pbmRleE9mKCcgJyArIG5hbWUgKyAnICcpID49IDApIHtcblx0XHRcdFx0c2V0ID0gc2V0LnJlcGxhY2UoJyAnICsgbmFtZSArICcgJywgJyAnKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gVHJpbSBmb3IgcHJldHRpbmVzc1xuXHRcdFx0ZWxlbS5jbGFzc05hbWUgPSB0cmltKHNldCk7XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIGlkKG5hbWUpIHtcblx0XHRcdHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAmJiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChuYW1lKTtcblx0XHR9XG5cdFx0ZnVuY3Rpb24gYWJvcnRUZXN0cygpIHtcblx0XHRcdHZhciBhYm9ydEJ1dHRvbiA9IGlkKCdxdW5pdC1hYm9ydC10ZXN0cy1idXR0b24nKTtcblx0XHRcdGlmIChhYm9ydEJ1dHRvbikge1xuXHRcdFx0XHRhYm9ydEJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG5cdFx0XHRcdGFib3J0QnV0dG9uLmlubmVySFRNTCA9ICdBYm9ydGluZy4uLic7XG5cdFx0XHR9XG5cdFx0XHRRVW5pdC5jb25maWcucXVldWUubGVuZ3RoID0gMDtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0ZnVuY3Rpb24gaW50ZXJjZXB0TmF2aWdhdGlvbihldikge1xuXHRcdFx0Ly8gVHJpbSBwb3RlbnRpYWwgYWNjaWRlbnRhbCB3aGl0ZXNwYWNlIHNvIHRoYXQgUVVuaXQgZG9lc24ndCB0aHJvdyBhbiBlcnJvciBhYm91dCBubyB0ZXN0cyBtYXRjaGluZyB0aGUgZmlsdGVyLlxuXHRcdFx0dmFyIGZpbHRlcklucHV0RWxlbSA9IGlkKCdxdW5pdC1maWx0ZXItaW5wdXQnKTtcblx0XHRcdGZpbHRlcklucHV0RWxlbS52YWx1ZSA9IHRyaW0oZmlsdGVySW5wdXRFbGVtLnZhbHVlKTtcblx0XHRcdGFwcGx5VXJsUGFyYW1zKCk7XG5cdFx0XHRpZiAoZXYgJiYgZXYucHJldmVudERlZmF1bHQpIHtcblx0XHRcdFx0ZXYucHJldmVudERlZmF1bHQoKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0ZnVuY3Rpb24gZ2V0VXJsQ29uZmlnSHRtbCgpIHtcblx0XHRcdHZhciBzZWxlY3Rpb24gPSBmYWxzZTtcblx0XHRcdHZhciB1cmxDb25maWcgPSBjb25maWcudXJsQ29uZmlnO1xuXHRcdFx0dmFyIHVybENvbmZpZ0h0bWwgPSAnJztcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdXJsQ29uZmlnLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdC8vIE9wdGlvbnMgY2FuIGJlIGVpdGhlciBzdHJpbmdzIG9yIG9iamVjdHMgd2l0aCBub25lbXB0eSBcImlkXCIgcHJvcGVydGllc1xuXHRcdFx0XHR2YXIgdmFsID0gY29uZmlnLnVybENvbmZpZ1tpXTtcblx0XHRcdFx0aWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdFx0dmFsID0ge1xuXHRcdFx0XHRcdFx0aWQ6IHZhbCxcblx0XHRcdFx0XHRcdGxhYmVsOiB2YWxcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciBlc2NhcGVkID0gZXNjYXBlVGV4dCh2YWwuaWQpO1xuXHRcdFx0XHR2YXIgZXNjYXBlZFRvb2x0aXAgPSBlc2NhcGVUZXh0KHZhbC50b29sdGlwKTtcblx0XHRcdFx0aWYgKCF2YWwudmFsdWUgfHwgdHlwZW9mIHZhbC52YWx1ZSA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0XHR1cmxDb25maWdIdG1sICs9IFwiPGxhYmVsIGZvcj0ncXVuaXQtdXJsY29uZmlnLVwiICsgZXNjYXBlZCArIFwiJyB0aXRsZT0nXCIgKyBlc2NhcGVkVG9vbHRpcCArIFwiJz48aW5wdXQgaWQ9J3F1bml0LXVybGNvbmZpZy1cIiArIGVzY2FwZWQgKyBcIicgbmFtZT0nXCIgKyBlc2NhcGVkICsgXCInIHR5cGU9J2NoZWNrYm94J1wiICsgKHZhbC52YWx1ZSA/IFwiIHZhbHVlPSdcIiArIGVzY2FwZVRleHQodmFsLnZhbHVlKSArIFwiJ1wiIDogJycpICsgKGNvbmZpZ1t2YWwuaWRdID8gXCIgY2hlY2tlZD0nY2hlY2tlZCdcIiA6ICcnKSArIFwiIHRpdGxlPSdcIiArIGVzY2FwZWRUb29sdGlwICsgXCInIC8+XCIgKyBlc2NhcGVUZXh0KHZhbC5sYWJlbCkgKyAnPC9sYWJlbD4nO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHVybENvbmZpZ0h0bWwgKz0gXCI8bGFiZWwgZm9yPSdxdW5pdC11cmxjb25maWctXCIgKyBlc2NhcGVkICsgXCInIHRpdGxlPSdcIiArIGVzY2FwZWRUb29sdGlwICsgXCInPlwiICsgdmFsLmxhYmVsICsgXCI6IDwvbGFiZWw+PHNlbGVjdCBpZD0ncXVuaXQtdXJsY29uZmlnLVwiICsgZXNjYXBlZCArIFwiJyBuYW1lPSdcIiArIGVzY2FwZWQgKyBcIicgdGl0bGU9J1wiICsgZXNjYXBlZFRvb2x0aXAgKyBcIic+PG9wdGlvbj48L29wdGlvbj5cIjtcblx0XHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh2YWwudmFsdWUpKSB7XG5cdFx0XHRcdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHZhbC52YWx1ZS5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdFx0XHRlc2NhcGVkID0gZXNjYXBlVGV4dCh2YWwudmFsdWVbal0pO1xuXHRcdFx0XHRcdFx0XHR1cmxDb25maWdIdG1sICs9IFwiPG9wdGlvbiB2YWx1ZT0nXCIgKyBlc2NhcGVkICsgXCInXCIgKyAoY29uZmlnW3ZhbC5pZF0gPT09IHZhbC52YWx1ZVtqXSA/IChzZWxlY3Rpb24gPSB0cnVlKSAmJiBcIiBzZWxlY3RlZD0nc2VsZWN0ZWQnXCIgOiAnJykgKyAnPicgKyBlc2NhcGVkICsgJzwvb3B0aW9uPic7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGZvciAodmFyIF9qIGluIHZhbC52YWx1ZSkge1xuXHRcdFx0XHRcdFx0XHRpZiAoaGFzT3duLmNhbGwodmFsLnZhbHVlLCBfaikpIHtcblx0XHRcdFx0XHRcdFx0XHR1cmxDb25maWdIdG1sICs9IFwiPG9wdGlvbiB2YWx1ZT0nXCIgKyBlc2NhcGVUZXh0KF9qKSArIFwiJ1wiICsgKGNvbmZpZ1t2YWwuaWRdID09PSBfaiA/IChzZWxlY3Rpb24gPSB0cnVlKSAmJiBcIiBzZWxlY3RlZD0nc2VsZWN0ZWQnXCIgOiAnJykgKyAnPicgKyBlc2NhcGVUZXh0KHZhbC52YWx1ZVtfal0pICsgJzwvb3B0aW9uPic7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKGNvbmZpZ1t2YWwuaWRdICYmICFzZWxlY3Rpb24pIHtcblx0XHRcdFx0XHRcdGVzY2FwZWQgPSBlc2NhcGVUZXh0KGNvbmZpZ1t2YWwuaWRdKTtcblx0XHRcdFx0XHRcdHVybENvbmZpZ0h0bWwgKz0gXCI8b3B0aW9uIHZhbHVlPSdcIiArIGVzY2FwZWQgKyBcIicgc2VsZWN0ZWQ9J3NlbGVjdGVkJyBkaXNhYmxlZD0nZGlzYWJsZWQnPlwiICsgZXNjYXBlZCArICc8L29wdGlvbj4nO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR1cmxDb25maWdIdG1sICs9ICc8L3NlbGVjdD4nO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdXJsQ29uZmlnSHRtbDtcblx0XHR9XG5cblx0XHQvLyBIYW5kbGUgXCJjbGlja1wiIGV2ZW50cyBvbiB0b29sYmFyIGNoZWNrYm94ZXMgYW5kIFwiY2hhbmdlXCIgZm9yIHNlbGVjdCBtZW51cy5cblx0XHQvLyBVcGRhdGVzIHRoZSBVUkwgd2l0aCB0aGUgbmV3IHN0YXRlIG9mIGBjb25maWcudXJsQ29uZmlnYCB2YWx1ZXMuXG5cdFx0ZnVuY3Rpb24gdG9vbGJhckNoYW5nZWQoKSB7XG5cdFx0XHR2YXIgZmllbGQgPSB0aGlzO1xuXHRcdFx0dmFyIHBhcmFtcyA9IHt9O1xuXG5cdFx0XHQvLyBEZXRlY3QgaWYgZmllbGQgaXMgYSBzZWxlY3QgbWVudSBvciBhIGNoZWNrYm94XG5cdFx0XHR2YXIgdmFsdWU7XG5cdFx0XHRpZiAoJ3NlbGVjdGVkSW5kZXgnIGluIGZpZWxkKSB7XG5cdFx0XHRcdHZhbHVlID0gZmllbGQub3B0aW9uc1tmaWVsZC5zZWxlY3RlZEluZGV4XS52YWx1ZSB8fCB1bmRlZmluZWQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YWx1ZSA9IGZpZWxkLmNoZWNrZWQgPyBmaWVsZC5kZWZhdWx0VmFsdWUgfHwgdHJ1ZSA6IHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHRcdHBhcmFtc1tmaWVsZC5uYW1lXSA9IHZhbHVlO1xuXHRcdFx0dmFyIHVwZGF0ZWRVcmwgPSBzZXRVcmwocGFyYW1zKTtcblxuXHRcdFx0Ly8gQ2hlY2sgaWYgd2UgY2FuIGFwcGx5IHRoZSBjaGFuZ2Ugd2l0aG91dCBhIHBhZ2UgcmVmcmVzaFxuXHRcdFx0aWYgKGZpZWxkLm5hbWUgPT09ICdoaWRlcGFzc2VkJyAmJiAncmVwbGFjZVN0YXRlJyBpbiB3aW5kb3ckMS5oaXN0b3J5KSB7XG5cdFx0XHRcdFFVbml0LnVybFBhcmFtc1tmaWVsZC5uYW1lXSA9IHZhbHVlO1xuXHRcdFx0XHRjb25maWdbZmllbGQubmFtZV0gPSB2YWx1ZSB8fCBmYWxzZTtcblx0XHRcdFx0dmFyIHRlc3RzID0gaWQoJ3F1bml0LXRlc3RzJyk7XG5cdFx0XHRcdGlmICh0ZXN0cykge1xuXHRcdFx0XHRcdHZhciBsZW5ndGggPSB0ZXN0cy5jaGlsZHJlbi5sZW5ndGg7XG5cdFx0XHRcdFx0dmFyIGNoaWxkcmVuID0gdGVzdHMuY2hpbGRyZW47XG5cdFx0XHRcdFx0aWYgKGZpZWxkLmNoZWNrZWQpIHtcblx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0dmFyIHRlc3QgPSBjaGlsZHJlbltpXTtcblx0XHRcdFx0XHRcdFx0dmFyIGNsYXNzTmFtZSA9IHRlc3QgPyB0ZXN0LmNsYXNzTmFtZSA6ICcnO1xuXHRcdFx0XHRcdFx0XHR2YXIgY2xhc3NOYW1lSGFzUGFzcyA9IGNsYXNzTmFtZS5pbmRleE9mKCdwYXNzJykgPiAtMTtcblx0XHRcdFx0XHRcdFx0dmFyIGNsYXNzTmFtZUhhc1NraXBwZWQgPSBjbGFzc05hbWUuaW5kZXhPZignc2tpcHBlZCcpID4gLTE7XG5cdFx0XHRcdFx0XHRcdGlmIChjbGFzc05hbWVIYXNQYXNzIHx8IGNsYXNzTmFtZUhhc1NraXBwZWQpIHtcblx0XHRcdFx0XHRcdFx0XHRoaWRkZW5UZXN0cy5wdXNoKHRlc3QpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR2YXIgX2l0ZXJhdG9yID0gX2NyZWF0ZUZvck9mSXRlcmF0b3JIZWxwZXIoaGlkZGVuVGVzdHMpLFxuXHRcdFx0XHRcdFx0XHRfc3RlcDtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdGZvciAoX2l0ZXJhdG9yLnMoKTsgIShfc3RlcCA9IF9pdGVyYXRvci5uKCkpLmRvbmU7KSB7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIGhpZGRlblRlc3QgPSBfc3RlcC52YWx1ZTtcblx0XHRcdFx0XHRcdFx0XHR0ZXN0cy5yZW1vdmVDaGlsZChoaWRkZW5UZXN0KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0XHRcdF9pdGVyYXRvci5lKGVycik7XG5cdFx0XHRcdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRcdFx0XHRfaXRlcmF0b3IuZigpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR2YXIgX3Rlc3Q7XG5cdFx0XHRcdFx0XHR3aGlsZSAoKF90ZXN0ID0gaGlkZGVuVGVzdHMucG9wKCkpICE9IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0dGVzdHMuYXBwZW5kQ2hpbGQoX3Rlc3QpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHR3aW5kb3ckMS5oaXN0b3J5LnJlcGxhY2VTdGF0ZShudWxsLCAnJywgdXBkYXRlZFVybCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR3aW5kb3ckMS5sb2NhdGlvbiA9IHVwZGF0ZWRVcmw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIHNldFVybChwYXJhbXMpIHtcblx0XHRcdHZhciBxdWVyeXN0cmluZyA9ICc/Jztcblx0XHRcdHZhciBsb2NhdGlvbiA9IHdpbmRvdyQxLmxvY2F0aW9uO1xuXHRcdFx0cGFyYW1zID0gZXh0ZW5kKGV4dGVuZCh7fSwgUVVuaXQudXJsUGFyYW1zKSwgcGFyYW1zKTtcblx0XHRcdGZvciAodmFyIGtleSBpbiBwYXJhbXMpIHtcblx0XHRcdFx0Ly8gU2tpcCBpbmhlcml0ZWQgb3IgdW5kZWZpbmVkIHByb3BlcnRpZXNcblx0XHRcdFx0aWYgKGhhc093bi5jYWxsKHBhcmFtcywga2V5KSAmJiBwYXJhbXNba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Ly8gT3V0cHV0IGEgcGFyYW1ldGVyIGZvciBlYWNoIHZhbHVlIG9mIHRoaXMga2V5XG5cdFx0XHRcdFx0Ly8gKGJ1dCB1c3VhbGx5IGp1c3Qgb25lKVxuXHRcdFx0XHRcdHZhciBhcnJWYWx1ZSA9IFtdLmNvbmNhdChwYXJhbXNba2V5XSk7XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcnJWYWx1ZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0cXVlcnlzdHJpbmcgKz0gZW5jb2RlVVJJQ29tcG9uZW50KGtleSk7XG5cdFx0XHRcdFx0XHRpZiAoYXJyVmFsdWVbaV0gIT09IHRydWUpIHtcblx0XHRcdFx0XHRcdFx0cXVlcnlzdHJpbmcgKz0gJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGFyclZhbHVlW2ldKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHF1ZXJ5c3RyaW5nICs9ICcmJztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBsb2NhdGlvbi5wcm90b2NvbCArICcvLycgKyBsb2NhdGlvbi5ob3N0ICsgbG9jYXRpb24ucGF0aG5hbWUgKyBxdWVyeXN0cmluZy5zbGljZSgwLCAtMSk7XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIGFwcGx5VXJsUGFyYW1zKCkge1xuXHRcdFx0dmFyIGZpbHRlciA9IGlkKCdxdW5pdC1maWx0ZXItaW5wdXQnKS52YWx1ZTtcblx0XHRcdHdpbmRvdyQxLmxvY2F0aW9uID0gc2V0VXJsKHtcblx0XHRcdFx0ZmlsdGVyOiBmaWx0ZXIgPT09ICcnID8gdW5kZWZpbmVkIDogZmlsdGVyLFxuXHRcdFx0XHRtb2R1bGVJZDogX3RvQ29uc3VtYWJsZUFycmF5KGRyb3Bkb3duRGF0YS5zZWxlY3RlZE1hcC5rZXlzKCkpLFxuXHRcdFx0XHQvLyBSZW1vdmUgbW9kdWxlIGFuZCB0ZXN0SWQgZmlsdGVyXG5cdFx0XHRcdG1vZHVsZTogdW5kZWZpbmVkLFxuXHRcdFx0XHR0ZXN0SWQ6IHVuZGVmaW5lZFxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIHRvb2xiYXJVcmxDb25maWdDb250YWluZXIoKSB7XG5cdFx0XHR2YXIgdXJsQ29uZmlnQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuXHRcdFx0dXJsQ29uZmlnQ29udGFpbmVyLmlubmVySFRNTCA9IGdldFVybENvbmZpZ0h0bWwoKTtcblx0XHRcdGFkZENsYXNzKHVybENvbmZpZ0NvbnRhaW5lciwgJ3F1bml0LXVybC1jb25maWcnKTtcblx0XHRcdGFkZEV2ZW50cyh1cmxDb25maWdDb250YWluZXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lucHV0JyksICdjaGFuZ2UnLCB0b29sYmFyQ2hhbmdlZCk7XG5cdFx0XHRhZGRFdmVudHModXJsQ29uZmlnQ29udGFpbmVyLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzZWxlY3QnKSwgJ2NoYW5nZScsIHRvb2xiYXJDaGFuZ2VkKTtcblx0XHRcdHJldHVybiB1cmxDb25maWdDb250YWluZXI7XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIGFib3J0VGVzdHNCdXR0b24oKSB7XG5cdFx0XHR2YXIgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG5cdFx0XHRidXR0b24uaWQgPSAncXVuaXQtYWJvcnQtdGVzdHMtYnV0dG9uJztcblx0XHRcdGJ1dHRvbi5pbm5lckhUTUwgPSAnQWJvcnQnO1xuXHRcdFx0YWRkRXZlbnQoYnV0dG9uLCAnY2xpY2snLCBhYm9ydFRlc3RzKTtcblx0XHRcdHJldHVybiBidXR0b247XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIHRvb2xiYXJMb29zZUZpbHRlcigpIHtcblx0XHRcdHZhciBmaWx0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmb3JtJyk7XG5cdFx0XHR2YXIgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuXHRcdFx0dmFyIGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcblx0XHRcdHZhciBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcblx0XHRcdGFkZENsYXNzKGZpbHRlciwgJ3F1bml0LWZpbHRlcicpO1xuXHRcdFx0bGFiZWwuaW5uZXJIVE1MID0gJ0ZpbHRlcjogJztcblx0XHRcdGlucHV0LnR5cGUgPSAndGV4dCc7XG5cdFx0XHRpbnB1dC52YWx1ZSA9IGNvbmZpZy5maWx0ZXIgfHwgJyc7XG5cdFx0XHRpbnB1dC5uYW1lID0gJ2ZpbHRlcic7XG5cdFx0XHRpbnB1dC5pZCA9ICdxdW5pdC1maWx0ZXItaW5wdXQnO1xuXHRcdFx0YnV0dG9uLmlubmVySFRNTCA9ICdHbyc7XG5cdFx0XHRsYWJlbC5hcHBlbmRDaGlsZChpbnB1dCk7XG5cdFx0XHRmaWx0ZXIuYXBwZW5kQ2hpbGQobGFiZWwpO1xuXHRcdFx0ZmlsdGVyLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcgJykpO1xuXHRcdFx0ZmlsdGVyLmFwcGVuZENoaWxkKGJ1dHRvbik7XG5cdFx0XHRhZGRFdmVudChmaWx0ZXIsICdzdWJtaXQnLCBpbnRlcmNlcHROYXZpZ2F0aW9uKTtcblx0XHRcdHJldHVybiBmaWx0ZXI7XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIGNyZWF0ZU1vZHVsZUxpc3RJdGVtKG1vZHVsZUlkLCBuYW1lLCBjaGVja2VkKSB7XG5cdFx0XHRyZXR1cm4gJzxsaT48bGFiZWwgY2xhc3M9XCJjbGlja2FibGUnICsgKGNoZWNrZWQgPyAnIGNoZWNrZWQnIDogJycpICsgJ1wiPjxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiAnICsgJ3ZhbHVlPVwiJyArIGVzY2FwZVRleHQobW9kdWxlSWQpICsgJ1wiJyArIChjaGVja2VkID8gJyBjaGVja2VkPVwiY2hlY2tlZFwiJyA6ICcnKSArICcgLz4nICsgZXNjYXBlVGV4dChuYW1lKSArICc8L2xhYmVsPjwvbGk+Jztcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBAcGFyYW0ge0FycmF5fSBSZXN1bHRzIGZyb20gZnV6enlzb3J0XG5cdFx0ICogQHJldHVybiB7c3RyaW5nfSBIVE1MXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gbW9kdWxlTGlzdEh0bWwocmVzdWx0cykge1xuXHRcdFx0dmFyIGh0bWwgPSAnJztcblxuXHRcdFx0Ly8gSG9pc3QgdGhlIGFscmVhZHkgc2VsZWN0ZWQgaXRlbXMsIGFuZCBzaG93IHRoZW0gYWx3YXlzXG5cdFx0XHQvLyBldmVuIGlmIG5vdCBtYXRjaGVkIGJ5IHRoZSBjdXJyZW50IHNlYXJjaC5cblx0XHRcdGRyb3Bkb3duRGF0YS5zZWxlY3RlZE1hcC5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lLCBtb2R1bGVJZCkge1xuXHRcdFx0XHRodG1sICs9IGNyZWF0ZU1vZHVsZUxpc3RJdGVtKG1vZHVsZUlkLCBuYW1lLCB0cnVlKTtcblx0XHRcdH0pO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBtb2QgPSByZXN1bHRzW2ldLm9iajtcblx0XHRcdFx0aWYgKCFkcm9wZG93bkRhdGEuc2VsZWN0ZWRNYXAuaGFzKG1vZC5tb2R1bGVJZCkpIHtcblx0XHRcdFx0XHRodG1sICs9IGNyZWF0ZU1vZHVsZUxpc3RJdGVtKG1vZC5tb2R1bGVJZCwgbW9kLm5hbWUsIGZhbHNlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGh0bWw7XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIHRvb2xiYXJNb2R1bGVGaWx0ZXIoYmVnaW5EZXRhaWxzKSB7XG5cdFx0XHR2YXIgaW5pdGlhbFNlbGVjdGVkID0gbnVsbDtcblx0XHRcdGRyb3Bkb3duRGF0YSA9IHtcblx0XHRcdFx0b3B0aW9uczogYmVnaW5EZXRhaWxzLm1vZHVsZXMuc2xpY2UoKSxcblx0XHRcdFx0c2VsZWN0ZWRNYXA6IG5ldyBTdHJpbmdNYXAoKSxcblx0XHRcdFx0aXNEaXJ0eTogZnVuY3Rpb24gaXNEaXJ0eSgpIHtcblx0XHRcdFx0XHRyZXR1cm4gX3RvQ29uc3VtYWJsZUFycmF5KGRyb3Bkb3duRGF0YS5zZWxlY3RlZE1hcC5rZXlzKCkpLnNvcnQoKS5qb2luKCcsJykgIT09IF90b0NvbnN1bWFibGVBcnJheShpbml0aWFsU2VsZWN0ZWQua2V5cygpKS5zb3J0KCkuam9pbignLCcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0aWYgKGNvbmZpZy5tb2R1bGVJZC5sZW5ndGgpIHtcblx0XHRcdFx0Ly8gVGhlIG1vZHVsZSBkcm9wZG93biBpcyBzZWVkZWQgd2l0aCB0aGUgcnVudGltZSBjb25maWd1cmF0aW9uIG9mIHRoZSBsYXN0IHJ1bi5cblx0XHRcdFx0Ly9cblx0XHRcdFx0Ly8gV2UgZG9uJ3QgcmVmZXJlbmNlIGBjb25maWcubW9kdWxlSWRgIGRpcmVjdGx5IGFmdGVyIHRoaXMgYW5kIGtlZXAgb3VyIG93blxuXHRcdFx0XHQvLyBjb3B5IGJlY2F1c2U6XG5cdFx0XHRcdC8vIDEuIFRoaXMgbmF0dXJhbGx5IGZpbHRlcnMgb3V0IHVua25vd24gbW9kdWxlSWRzLlxuXHRcdFx0XHQvLyAyLiBHaXZlcyB1cyBhIHBsYWNlIHRvIG1hbmFnZSBhbmQgcmVtZW1iZXIgdW5zdWJtaXR0ZWQgY2hlY2tib3ggY2hhbmdlcy5cblx0XHRcdFx0Ly8gMy4gR2l2ZXMgdXMgYW4gZWZmaWNpZW50IHdheSB0byBtYXAgYSBzZWxlY3RlZCBtb2R1bGVJZCB0byBtb2R1bGUgbmFtZVxuXHRcdFx0XHQvLyAgICBkdXJpbmcgcmVuZGVyaW5nLlxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGJlZ2luRGV0YWlscy5tb2R1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0dmFyIG1vZCA9IGJlZ2luRGV0YWlscy5tb2R1bGVzW2ldO1xuXHRcdFx0XHRcdGlmIChjb25maWcubW9kdWxlSWQuaW5kZXhPZihtb2QubW9kdWxlSWQpICE9PSAtMSkge1xuXHRcdFx0XHRcdFx0ZHJvcGRvd25EYXRhLnNlbGVjdGVkTWFwLnNldChtb2QubW9kdWxlSWQsIG1vZC5uYW1lKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGluaXRpYWxTZWxlY3RlZCA9IG5ldyBTdHJpbmdNYXAoZHJvcGRvd25EYXRhLnNlbGVjdGVkTWFwKTtcblx0XHRcdHZhciBtb2R1bGVTZWFyY2ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuXHRcdFx0bW9kdWxlU2VhcmNoLmlkID0gJ3F1bml0LW1vZHVsZWZpbHRlci1zZWFyY2gnO1xuXHRcdFx0bW9kdWxlU2VhcmNoLmF1dG9jb21wbGV0ZSA9ICdvZmYnO1xuXHRcdFx0YWRkRXZlbnQobW9kdWxlU2VhcmNoLCAnaW5wdXQnLCBzZWFyY2hJbnB1dCk7XG5cdFx0XHRhZGRFdmVudChtb2R1bGVTZWFyY2gsICdpbnB1dCcsIHNlYXJjaEZvY3VzKTtcblx0XHRcdGFkZEV2ZW50KG1vZHVsZVNlYXJjaCwgJ2ZvY3VzJywgc2VhcmNoRm9jdXMpO1xuXHRcdFx0YWRkRXZlbnQobW9kdWxlU2VhcmNoLCAnY2xpY2snLCBzZWFyY2hGb2N1cyk7XG5cdFx0XHR2YXIgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuXHRcdFx0bGFiZWwuaHRtbEZvciA9ICdxdW5pdC1tb2R1bGVmaWx0ZXItc2VhcmNoJztcblx0XHRcdGxhYmVsLnRleHRDb250ZW50ID0gJ01vZHVsZTonO1xuXHRcdFx0dmFyIHNlYXJjaENvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcblx0XHRcdHNlYXJjaENvbnRhaW5lci5pZCA9ICdxdW5pdC1tb2R1bGVmaWx0ZXItc2VhcmNoLWNvbnRhaW5lcic7XG5cdFx0XHRzZWFyY2hDb250YWluZXIuYXBwZW5kQ2hpbGQobW9kdWxlU2VhcmNoKTtcblx0XHRcdHZhciBhcHBseUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuXHRcdFx0YXBwbHlCdXR0b24udGV4dENvbnRlbnQgPSAnQXBwbHknO1xuXHRcdFx0YXBwbHlCdXR0b24udGl0bGUgPSAnUmUtcnVuIHRoZSBzZWxlY3RlZCB0ZXN0IG1vZHVsZXMnO1xuXHRcdFx0YWRkRXZlbnQoYXBwbHlCdXR0b24sICdjbGljaycsIGFwcGx5VXJsUGFyYW1zKTtcblx0XHRcdHZhciByZXNldEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuXHRcdFx0cmVzZXRCdXR0b24udGV4dENvbnRlbnQgPSAnUmVzZXQnO1xuXHRcdFx0cmVzZXRCdXR0b24udHlwZSA9ICdyZXNldCc7XG5cdFx0XHRyZXNldEJ1dHRvbi50aXRsZSA9ICdSZXN0b3JlIHRoZSBwcmV2aW91cyBtb2R1bGUgc2VsZWN0aW9uJztcblx0XHRcdHZhciBjbGVhckJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuXHRcdFx0Y2xlYXJCdXR0b24udGV4dENvbnRlbnQgPSAnU2VsZWN0IG5vbmUnO1xuXHRcdFx0Y2xlYXJCdXR0b24udHlwZSA9ICdidXR0b24nO1xuXHRcdFx0Y2xlYXJCdXR0b24udGl0bGUgPSAnQ2xlYXIgdGhlIGN1cnJlbnQgbW9kdWxlIHNlbGVjdGlvbic7XG5cdFx0XHRhZGRFdmVudChjbGVhckJ1dHRvbiwgJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRkcm9wZG93bkRhdGEuc2VsZWN0ZWRNYXAuY2xlYXIoKTtcblx0XHRcdFx0c2VsZWN0aW9uQ2hhbmdlKCk7XG5cdFx0XHRcdHNlYXJjaElucHV0KCk7XG5cdFx0XHR9KTtcblx0XHRcdHZhciBhY3Rpb25zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuXHRcdFx0YWN0aW9ucy5pZCA9ICdxdW5pdC1tb2R1bGVmaWx0ZXItYWN0aW9ucyc7XG5cdFx0XHRhY3Rpb25zLmFwcGVuZENoaWxkKGFwcGx5QnV0dG9uKTtcblx0XHRcdGFjdGlvbnMuYXBwZW5kQ2hpbGQocmVzZXRCdXR0b24pO1xuXHRcdFx0aWYgKGluaXRpYWxTZWxlY3RlZC5zaXplKSB7XG5cdFx0XHRcdC8vIE9ubHkgc2hvdyBjbGVhciBidXR0b24gaWYgZnVuY3Rpb25hbGx5IGRpZmZlcmVudCBmcm9tIHJlc2V0XG5cdFx0XHRcdGFjdGlvbnMuYXBwZW5kQ2hpbGQoY2xlYXJCdXR0b24pO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGRyb3BEb3duTGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XG5cdFx0XHRkcm9wRG93bkxpc3QuaWQgPSAncXVuaXQtbW9kdWxlZmlsdGVyLWRyb3Bkb3duLWxpc3QnO1xuXHRcdFx0dmFyIGRyb3BEb3duID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRkcm9wRG93bi5pZCA9ICdxdW5pdC1tb2R1bGVmaWx0ZXItZHJvcGRvd24nO1xuXHRcdFx0ZHJvcERvd24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHRcdGRyb3BEb3duLmFwcGVuZENoaWxkKGFjdGlvbnMpO1xuXHRcdFx0ZHJvcERvd24uYXBwZW5kQ2hpbGQoZHJvcERvd25MaXN0KTtcblx0XHRcdGFkZEV2ZW50KGRyb3BEb3duLCAnY2hhbmdlJywgc2VsZWN0aW9uQ2hhbmdlKTtcblx0XHRcdHNlYXJjaENvbnRhaW5lci5hcHBlbmRDaGlsZChkcm9wRG93bik7XG5cdFx0XHQvLyBTZXQgaW5pdGlhbCBtb2R1bGVTZWFyY2gucGxhY2Vob2xkZXIgYW5kIGNsZWFyQnV0dG9uL3Jlc2V0QnV0dG9uLlxuXHRcdFx0c2VsZWN0aW9uQ2hhbmdlKCk7XG5cdFx0XHR2YXIgbW9kdWxlRmlsdGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZm9ybScpO1xuXHRcdFx0bW9kdWxlRmlsdGVyLmlkID0gJ3F1bml0LW1vZHVsZWZpbHRlcic7XG5cdFx0XHRtb2R1bGVGaWx0ZXIuYXBwZW5kQ2hpbGQobGFiZWwpO1xuXHRcdFx0bW9kdWxlRmlsdGVyLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcgJykpO1xuXHRcdFx0bW9kdWxlRmlsdGVyLmFwcGVuZENoaWxkKHNlYXJjaENvbnRhaW5lcik7XG5cdFx0XHRhZGRFdmVudChtb2R1bGVGaWx0ZXIsICdzdWJtaXQnLCBpbnRlcmNlcHROYXZpZ2F0aW9uKTtcblx0XHRcdGFkZEV2ZW50KG1vZHVsZUZpbHRlciwgJ3Jlc2V0JywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRkcm9wZG93bkRhdGEuc2VsZWN0ZWRNYXAgPSBuZXcgU3RyaW5nTWFwKGluaXRpYWxTZWxlY3RlZCk7XG5cdFx0XHRcdC8vIFNldCBtb2R1bGVTZWFyY2gucGxhY2Vob2xkZXIgYW5kIHJlZmxlY3Qgbm9uLWRpcnR5IHN0YXRlXG5cdFx0XHRcdHNlbGVjdGlvbkNoYW5nZSgpO1xuXHRcdFx0XHRzZWFyY2hJbnB1dCgpO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vIEVuYWJsZXMgc2hvdy9oaWRlIGZvciB0aGUgZHJvcGRvd25cblx0XHRcdGZ1bmN0aW9uIHNlYXJjaEZvY3VzKCkge1xuXHRcdFx0XHRpZiAoZHJvcERvd24uc3R5bGUuZGlzcGxheSAhPT0gJ25vbmUnKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gT3B0aW1pemF0aW9uOiBEZWZlciByZW5kZXJpbmcgb3B0aW9ucyB1bnRpbCBmb2N1c3NlZC5cblx0XHRcdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL3F1bml0anMvcXVuaXQvaXNzdWVzLzE2NjRcblx0XHRcdFx0c2VhcmNoSW5wdXQoKTtcblx0XHRcdFx0ZHJvcERvd24uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cblx0XHRcdFx0Ly8gSGlkZSBvbiBFc2NhcGUga2V5ZG93biBvciBvbiBjbGljayBvdXRzaWRlIHRoZSBjb250YWluZXJcblx0XHRcdFx0YWRkRXZlbnQoZG9jdW1lbnQsICdjbGljaycsIGhpZGVIYW5kbGVyKTtcblx0XHRcdFx0YWRkRXZlbnQoZG9jdW1lbnQsICdrZXlkb3duJywgaGlkZUhhbmRsZXIpO1xuXHRcdFx0XHRmdW5jdGlvbiBoaWRlSGFuZGxlcihlKSB7XG5cdFx0XHRcdFx0dmFyIGluQ29udGFpbmVyID0gbW9kdWxlRmlsdGVyLmNvbnRhaW5zKGUudGFyZ2V0KTtcblx0XHRcdFx0XHRpZiAoZS5rZXlDb2RlID09PSAyNyB8fCAhaW5Db250YWluZXIpIHtcblx0XHRcdFx0XHRcdGlmIChlLmtleUNvZGUgPT09IDI3ICYmIGluQ29udGFpbmVyKSB7XG5cdFx0XHRcdFx0XHRcdG1vZHVsZVNlYXJjaC5mb2N1cygpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZHJvcERvd24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHRcdFx0XHRcdHJlbW92ZUV2ZW50KGRvY3VtZW50LCAnY2xpY2snLCBoaWRlSGFuZGxlcik7XG5cdFx0XHRcdFx0XHRyZW1vdmVFdmVudChkb2N1bWVudCwgJ2tleWRvd24nLCBoaWRlSGFuZGxlcik7XG5cdFx0XHRcdFx0XHRtb2R1bGVTZWFyY2gudmFsdWUgPSAnJztcblx0XHRcdFx0XHRcdHNlYXJjaElucHV0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQHBhcmFtIHtzdHJpbmd9IHNlYXJjaFRleHRcblx0XHRcdCAqIEByZXR1cm4ge3N0cmluZ30gSFRNTFxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBmaWx0ZXJNb2R1bGVzKHNlYXJjaFRleHQpIHtcblx0XHRcdFx0dmFyIHJlc3VsdHM7XG5cdFx0XHRcdGlmIChzZWFyY2hUZXh0ID09PSAnJykge1xuXHRcdFx0XHRcdC8vIEltcHJvdmUgb24tYm9hcmRpbmcgZXhwZXJpZW5jZSBieSBoYXZpbmcgYW4gaW1tZWRpYXRlIGRpc3BsYXkgb2Zcblx0XHRcdFx0XHQvLyBtb2R1bGUgbmFtZXMsIGluZGljYXRpbmcgaG93IHRoZSBpbnRlcmZhY2Ugd29ya3MuIFRoaXMgYWxzbyBtYWtlc1xuXHRcdFx0XHRcdC8vIGZvciBhIHF1aWNrZXIgaW50ZXJhY3Rpb24gaW4gdGhlIGNvbW1vbiBjYXNlIG9mIHNtYWxsIHByb2plY3RzLlxuXHRcdFx0XHRcdC8vIERvbid0IG1hbmRhdGUgdHlwaW5nIGp1c3QgdG8gZ2V0IHRoZSBtZW51LlxuXHRcdFx0XHRcdHJlc3VsdHMgPSBkcm9wZG93bkRhdGEub3B0aW9ucy5zbGljZSgwLCAyMCkubWFwKGZ1bmN0aW9uIChvYmopIHtcblx0XHRcdFx0XHRcdC8vIEZha2UgZW1wdHkgcmVzdWx0cy4gaHR0cHM6Ly9naXRodWIuY29tL2ZhcnpoZXIvZnV6enlzb3J0L2lzc3Vlcy80MVxuXHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0b2JqOiBvYmpcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVzdWx0cyA9IGZ1enp5c29ydC5nbyhzZWFyY2hUZXh0LCBkcm9wZG93bkRhdGEub3B0aW9ucywge1xuXHRcdFx0XHRcdFx0bGltaXQ6IDIwLFxuXHRcdFx0XHRcdFx0a2V5OiAnbmFtZScsXG5cdFx0XHRcdFx0XHRhbGxvd1R5cG86IHRydWVcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gbW9kdWxlTGlzdEh0bWwocmVzdWx0cyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFByb2Nlc3NlcyBtb2R1bGUgc2VhcmNoIGJveCBpbnB1dFxuXHRcdFx0dmFyIHNlYXJjaElucHV0VGltZW91dDtcblx0XHRcdGZ1bmN0aW9uIHNlYXJjaElucHV0KCkge1xuXHRcdFx0XHQvLyBVc2UgYSBkZWJvdW5jZSB3aXRoIGEgfjBtcyB0aW1lb3V0LiBUaGlzIGlzIGVmZmVjdGl2ZWx5IGluc3RhbnRhbmVvdXMsXG5cdFx0XHRcdC8vIGJ1dCBpcyBiZXR0ZXIgdGhhbiB1bmRlYm91bmNlZCBiZWNhdXNlIGl0IGF2b2lkcyBhbiBldmVyLWdyb3dpbmdcblx0XHRcdFx0Ly8gYmFja2xvZyBvZiB1bnByb2Nlc3NlZCBub3ctb3V0ZGF0ZWQgaW5wdXQgZXZlbnRzIGlmIGZ1enp5c2VhcmNoIG9yXG5cdFx0XHRcdC8vIGRyb2Rvd24gRE9NIGlzIHNsb3cgKGUuZy4gdmVyeSBsYXJnZSB0ZXN0IHN1aXRlKS5cblx0XHRcdFx0d2luZG93JDEuY2xlYXJUaW1lb3V0KHNlYXJjaElucHV0VGltZW91dCk7XG5cdFx0XHRcdHNlYXJjaElucHV0VGltZW91dCA9IHdpbmRvdyQxLnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGRyb3BEb3duTGlzdC5pbm5lckhUTUwgPSBmaWx0ZXJNb2R1bGVzKG1vZHVsZVNlYXJjaC52YWx1ZSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBQcm9jZXNzZXMgY2hlY2tib3ggY2hhbmdlLCBvciBhIGdlbmVyaWMgcmVuZGVyIChpbml0aWFsIHJlbmRlciwgb3IgYWZ0ZXIgcmVzZXQgZXZlbnQpXG5cdFx0XHQvLyBBdm9pZCBhbnkgZHJvcGRvd24gcmVuZGVyaW5nIGhlcmUgYXMgdGhpcyBpcyB1c2VkIGJ5IHRvb2xiYXJNb2R1bGVGaWx0ZXIoKVxuXHRcdFx0Ly8gZHVyaW5nIHRoZSBpbml0aWFsIHJlbmRlciwgd2hpY2ggc2hvdWxkIG5vdCBkZWxheSB0ZXN0IGV4ZWN1dGlvbi5cblx0XHRcdGZ1bmN0aW9uIHNlbGVjdGlvbkNoYW5nZShldnQpIHtcblx0XHRcdFx0dmFyIGNoZWNrYm94ID0gZXZ0ICYmIGV2dC50YXJnZXQgfHwgbnVsbDtcblx0XHRcdFx0aWYgKGNoZWNrYm94KSB7XG5cdFx0XHRcdFx0Ly8gVXBkYXRlIGludGVybmFsIHN0YXRlXG5cdFx0XHRcdFx0aWYgKGNoZWNrYm94LmNoZWNrZWQpIHtcblx0XHRcdFx0XHRcdGRyb3Bkb3duRGF0YS5zZWxlY3RlZE1hcC5zZXQoY2hlY2tib3gudmFsdWUsIGNoZWNrYm94LnBhcmVudE5vZGUudGV4dENvbnRlbnQpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRkcm9wZG93bkRhdGEuc2VsZWN0ZWRNYXAuZGVsZXRlKGNoZWNrYm94LnZhbHVlKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBVcGRhdGUgVUkgc3RhdGVcblx0XHRcdFx0XHR0b2dnbGVDbGFzcyhjaGVja2JveC5wYXJlbnROb2RlLCAnY2hlY2tlZCcsIGNoZWNrYm94LmNoZWNrZWQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciB0ZXh0Rm9ybSA9IGRyb3Bkb3duRGF0YS5zZWxlY3RlZE1hcC5zaXplID8gZHJvcGRvd25EYXRhLnNlbGVjdGVkTWFwLnNpemUgKyAnICcgKyAoZHJvcGRvd25EYXRhLnNlbGVjdGVkTWFwLnNpemUgPT09IDEgPyAnbW9kdWxlJyA6ICdtb2R1bGVzJykgOiAnQWxsIG1vZHVsZXMnO1xuXHRcdFx0XHRtb2R1bGVTZWFyY2gucGxhY2Vob2xkZXIgPSB0ZXh0Rm9ybTtcblx0XHRcdFx0bW9kdWxlU2VhcmNoLnRpdGxlID0gJ1R5cGUgdG8gc2VhcmNoIHRocm91Z2ggYW5kIHJlZHVjZSB0aGUgbGlzdC4nO1xuXHRcdFx0XHRyZXNldEJ1dHRvbi5kaXNhYmxlZCA9ICFkcm9wZG93bkRhdGEuaXNEaXJ0eSgpO1xuXHRcdFx0XHRjbGVhckJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gZHJvcGRvd25EYXRhLnNlbGVjdGVkTWFwLnNpemUgPyAnJyA6ICdub25lJztcblx0XHRcdH1cblx0XHRcdHJldHVybiBtb2R1bGVGaWx0ZXI7XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIGFwcGVuZFRvb2xiYXIoYmVnaW5EZXRhaWxzKSB7XG5cdFx0XHR2YXIgdG9vbGJhciA9IGlkKCdxdW5pdC10ZXN0cnVubmVyLXRvb2xiYXInKTtcblx0XHRcdGlmICh0b29sYmFyKSB7XG5cdFx0XHRcdHRvb2xiYXIuYXBwZW5kQ2hpbGQodG9vbGJhclVybENvbmZpZ0NvbnRhaW5lcigpKTtcblx0XHRcdFx0dmFyIHRvb2xiYXJGaWx0ZXJzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuXHRcdFx0XHR0b29sYmFyRmlsdGVycy5pZCA9ICdxdW5pdC10b29sYmFyLWZpbHRlcnMnO1xuXHRcdFx0XHR0b29sYmFyRmlsdGVycy5hcHBlbmRDaGlsZCh0b29sYmFyTG9vc2VGaWx0ZXIoKSk7XG5cdFx0XHRcdHRvb2xiYXJGaWx0ZXJzLmFwcGVuZENoaWxkKHRvb2xiYXJNb2R1bGVGaWx0ZXIoYmVnaW5EZXRhaWxzKSk7XG5cdFx0XHRcdHZhciBjbGVhcmZpeCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0XHRjbGVhcmZpeC5jbGFzc05hbWUgPSAnY2xlYXJmaXgnO1xuXHRcdFx0XHR0b29sYmFyLmFwcGVuZENoaWxkKHRvb2xiYXJGaWx0ZXJzKTtcblx0XHRcdFx0dG9vbGJhci5hcHBlbmRDaGlsZChjbGVhcmZpeCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIGFwcGVuZEhlYWRlcigpIHtcblx0XHRcdHZhciBoZWFkZXIgPSBpZCgncXVuaXQtaGVhZGVyJyk7XG5cdFx0XHRpZiAoaGVhZGVyKSB7XG5cdFx0XHRcdGhlYWRlci5pbm5lckhUTUwgPSBcIjxhIGhyZWY9J1wiICsgZXNjYXBlVGV4dCh1bmZpbHRlcmVkVXJsKSArIFwiJz5cIiArIGhlYWRlci5pbm5lckhUTUwgKyAnPC9hPiAnO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRmdW5jdGlvbiBhcHBlbmRCYW5uZXIoKSB7XG5cdFx0XHR2YXIgYmFubmVyID0gaWQoJ3F1bml0LWJhbm5lcicpO1xuXHRcdFx0aWYgKGJhbm5lcikge1xuXHRcdFx0XHRiYW5uZXIuY2xhc3NOYW1lID0gJyc7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGZ1bmN0aW9uIGFwcGVuZFRlc3RSZXN1bHRzKCkge1xuXHRcdFx0dmFyIHRlc3RzID0gaWQoJ3F1bml0LXRlc3RzJyk7XG5cdFx0XHR2YXIgcmVzdWx0ID0gaWQoJ3F1bml0LXRlc3RyZXN1bHQnKTtcblx0XHRcdHZhciBjb250cm9scztcblx0XHRcdGlmIChyZXN1bHQpIHtcblx0XHRcdFx0cmVzdWx0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocmVzdWx0KTtcblx0XHRcdH1cblx0XHRcdGlmICh0ZXN0cykge1xuXHRcdFx0XHR0ZXN0cy5pbm5lckhUTUwgPSAnJztcblx0XHRcdFx0cmVzdWx0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuXHRcdFx0XHRyZXN1bHQuaWQgPSAncXVuaXQtdGVzdHJlc3VsdCc7XG5cdFx0XHRcdHJlc3VsdC5jbGFzc05hbWUgPSAncmVzdWx0Jztcblx0XHRcdFx0dGVzdHMucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUocmVzdWx0LCB0ZXN0cyk7XG5cdFx0XHRcdHJlc3VsdC5pbm5lckhUTUwgPSAnPGRpdiBpZD1cInF1bml0LXRlc3RyZXN1bHQtZGlzcGxheVwiPlJ1bm5pbmcuLi48YnIgLz4mIzE2MDs8L2Rpdj4nICsgJzxkaXYgaWQ9XCJxdW5pdC10ZXN0cmVzdWx0LWNvbnRyb2xzXCI+PC9kaXY+JyArICc8ZGl2IGNsYXNzPVwiY2xlYXJmaXhcIj48L2Rpdj4nO1xuXHRcdFx0XHRjb250cm9scyA9IGlkKCdxdW5pdC10ZXN0cmVzdWx0LWNvbnRyb2xzJyk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoY29udHJvbHMpIHtcblx0XHRcdFx0Y29udHJvbHMuYXBwZW5kQ2hpbGQoYWJvcnRUZXN0c0J1dHRvbigpKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZnVuY3Rpb24gYXBwZW5kRmlsdGVyZWRUZXN0KCkge1xuXHRcdFx0dmFyIHRlc3RJZCA9IFFVbml0LmNvbmZpZy50ZXN0SWQ7XG5cdFx0XHRpZiAoIXRlc3RJZCB8fCB0ZXN0SWQubGVuZ3RoIDw9IDApIHtcblx0XHRcdFx0cmV0dXJuICcnO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIFwiPGRpdiBpZD0ncXVuaXQtZmlsdGVyZWRUZXN0Jz5SZXJ1bm5pbmcgc2VsZWN0ZWQgdGVzdHM6IFwiICsgZXNjYXBlVGV4dCh0ZXN0SWQuam9pbignLCAnKSkgKyBcIiA8YSBpZD0ncXVuaXQtY2xlYXJGaWx0ZXInIGhyZWY9J1wiICsgZXNjYXBlVGV4dCh1bmZpbHRlcmVkVXJsKSArIFwiJz5SdW4gYWxsIHRlc3RzPC9hPjwvZGl2PlwiO1xuXHRcdH1cblx0XHRmdW5jdGlvbiBhcHBlbmRVc2VyQWdlbnQoKSB7XG5cdFx0XHR2YXIgdXNlckFnZW50ID0gaWQoJ3F1bml0LXVzZXJBZ2VudCcpO1xuXHRcdFx0aWYgKHVzZXJBZ2VudCkge1xuXHRcdFx0XHR1c2VyQWdlbnQuaW5uZXJIVE1MID0gJyc7XG5cdFx0XHRcdHVzZXJBZ2VudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnUVVuaXQgJyArIFFVbml0LnZlcnNpb24gKyAnOyAnICsgbmF2aWdhdG9yLnVzZXJBZ2VudCkpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRmdW5jdGlvbiBhcHBlbmRJbnRlcmZhY2UoYmVnaW5EZXRhaWxzKSB7XG5cdFx0XHR2YXIgcXVuaXQgPSBpZCgncXVuaXQnKTtcblxuXHRcdFx0Ly8gRm9yIGNvbXBhdCB3aXRoIFFVbml0IDEuMiwgYW5kIHRvIHN1cHBvcnQgZnVsbHkgY3VzdG9tIHRoZW1lIEhUTUwsXG5cdFx0XHQvLyB3ZSB3aWxsIHVzZSBhbnkgZXhpc3RpbmcgZWxlbWVudHMgaWYgbm8gaWQ9XCJxdW5pdFwiIGVsZW1lbnQgZXhpc3RzLlxuXHRcdFx0Ly9cblx0XHRcdC8vIE5vdGUgdGhhdCB3ZSBkb24ndCBmYWlsIG9yIGZhbGxiYWNrIHRvIGNyZWF0aW5nIGl0IG91cnNlbHZlcyxcblx0XHRcdC8vIGJlY2F1c2Ugbm90IGhhdmluZyBpZD1cInF1bml0XCIgKGFuZCBub3QgaGF2aW5nIHRoZSBiZWxvdyBlbGVtZW50cylcblx0XHRcdC8vIHNpbXBseSBtZWFucyBRVW5pdCBhY3RzIGhlYWRsZXNzLCBhbGxvd2luZyB1c2VycyB0byB1c2UgdGhlaXIgb3duXG5cdFx0XHQvLyByZXBvcnRlcnMsIG9yIGZvciBhIHRlc3QgcnVubmVyIHRvIGxpc3RlbiBmb3IgZXZlbnRzIGRpcmVjdGx5IHdpdGhvdXRcblx0XHRcdC8vIGhhdmluZyB0aGUgSFRNTCByZXBvcnRlciBhY3RpdmVseSByZW5kZXIgYW55dGhpbmcuXG5cdFx0XHRpZiAocXVuaXQpIHtcblx0XHRcdFx0cXVuaXQuc2V0QXR0cmlidXRlKCdyb2xlJywgJ21haW4nKTtcblxuXHRcdFx0XHQvLyBTaW5jZSBRVW5pdCAxLjMsIHRoZXNlIGFyZSBjcmVhdGVkIGF1dG9tYXRpY2FsbHkgaWYgdGhlIHBhZ2Vcblx0XHRcdFx0Ly8gY29udGFpbnMgaWQ9XCJxdW5pdFwiLlxuXHRcdFx0XHRxdW5pdC5pbm5lckhUTUwgPSBcIjxoMSBpZD0ncXVuaXQtaGVhZGVyJz5cIiArIGVzY2FwZVRleHQoZG9jdW1lbnQudGl0bGUpICsgJzwvaDE+JyArIFwiPGgyIGlkPSdxdW5pdC1iYW5uZXInPjwvaDI+XCIgKyBcIjxkaXYgaWQ9J3F1bml0LXRlc3RydW5uZXItdG9vbGJhcicgcm9sZT0nbmF2aWdhdGlvbic+PC9kaXY+XCIgKyBhcHBlbmRGaWx0ZXJlZFRlc3QoKSArIFwiPGgyIGlkPSdxdW5pdC11c2VyQWdlbnQnPjwvaDI+XCIgKyBcIjxvbCBpZD0ncXVuaXQtdGVzdHMnPjwvb2w+XCI7XG5cdFx0XHR9XG5cdFx0XHRhcHBlbmRIZWFkZXIoKTtcblx0XHRcdGFwcGVuZEJhbm5lcigpO1xuXHRcdFx0YXBwZW5kVGVzdFJlc3VsdHMoKTtcblx0XHRcdGFwcGVuZFVzZXJBZ2VudCgpO1xuXHRcdFx0YXBwZW5kVG9vbGJhcihiZWdpbkRldGFpbHMpO1xuXHRcdH1cblx0XHRmdW5jdGlvbiBhcHBlbmRUZXN0KG5hbWUsIHRlc3RJZCwgbW9kdWxlTmFtZSkge1xuXHRcdFx0dmFyIHRlc3RzID0gaWQoJ3F1bml0LXRlc3RzJyk7XG5cdFx0XHRpZiAoIXRlc3RzKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0cm9uZycpO1xuXHRcdFx0dGl0bGUuaW5uZXJIVE1MID0gZ2V0TmFtZUh0bWwobmFtZSwgbW9kdWxlTmFtZSk7XG5cdFx0XHR2YXIgdGVzdEJsb2NrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcblx0XHRcdHRlc3RCbG9jay5hcHBlbmRDaGlsZCh0aXRsZSk7XG5cblx0XHRcdC8vIE5vIElEIG9yIHJlcnVuIGxpbmsgZm9yIFwiZ2xvYmFsIGZhaWx1cmVcIiBibG9ja3Ncblx0XHRcdGlmICh0ZXN0SWQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHR2YXIgcmVydW5UcmlnZ2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuXHRcdFx0XHRyZXJ1blRyaWdnZXIuaW5uZXJIVE1MID0gJ1JlcnVuJztcblx0XHRcdFx0cmVydW5UcmlnZ2VyLmhyZWYgPSBzZXRVcmwoe1xuXHRcdFx0XHRcdHRlc3RJZDogdGVzdElkXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHR0ZXN0QmxvY2suaWQgPSAncXVuaXQtdGVzdC1vdXRwdXQtJyArIHRlc3RJZDtcblx0XHRcdFx0dGVzdEJsb2NrLmFwcGVuZENoaWxkKHJlcnVuVHJpZ2dlcik7XG5cdFx0XHR9XG5cdFx0XHR2YXIgYXNzZXJ0TGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29sJyk7XG5cdFx0XHRhc3NlcnRMaXN0LmNsYXNzTmFtZSA9ICdxdW5pdC1hc3NlcnQtbGlzdCc7XG5cdFx0XHR0ZXN0QmxvY2suYXBwZW5kQ2hpbGQoYXNzZXJ0TGlzdCk7XG5cdFx0XHR0ZXN0cy5hcHBlbmRDaGlsZCh0ZXN0QmxvY2spO1xuXHRcdFx0cmV0dXJuIHRlc3RCbG9jaztcblx0XHR9XG5cblx0XHQvLyBIVE1MIFJlcG9ydGVyIGluaXRpYWxpemF0aW9uIGFuZCBsb2FkXG5cdFx0UVVuaXQub24oJ3J1blN0YXJ0JywgZnVuY3Rpb24gKHJ1blN0YXJ0KSB7XG5cdFx0XHRzdGF0cy5kZWZpbmVkID0gcnVuU3RhcnQudGVzdENvdW50cy50b3RhbDtcblx0XHR9KTtcblx0XHRRVW5pdC5iZWdpbihmdW5jdGlvbiAoYmVnaW5EZXRhaWxzKSB7XG5cdFx0XHQvLyBJbml0aWFsaXplIFFVbml0IGVsZW1lbnRzXG5cdFx0XHQvLyBUaGlzIGlzIGRvbmUgZnJvbSBiZWdpbigpIGluc3RlYWQgb2YgcnVuU3RhcnQsIGJlY2F1c2Vcblx0XHRcdC8vIHVybHBhcmFtcy5qcyB1c2VzIGJlZ2luKCksIHdoaWNoIHdlIG5lZWQgdG8gd2FpdCBmb3IuXG5cdFx0XHQvLyB1cmxwYXJhbXMuanMgaW4gdHVybiB1c2VzIGJlZ2luKCkgdG8gYWxsb3cgcGx1Z2lucyB0b1xuXHRcdFx0Ly8gYWRkIGVudHJpZXMgdG8gUVVuaXQuY29uZmlnLnVybENvbmZpZywgd2hpY2ggbWF5IGJlIGRvbmVcblx0XHRcdC8vIGFzeW5jaHJvbm91c2x5LlxuXHRcdFx0Ly8gPGh0dHBzOi8vZ2l0aHViLmNvbS9xdW5pdGpzL3F1bml0L2lzc3Vlcy8xNjU3PlxuXHRcdFx0YXBwZW5kSW50ZXJmYWNlKGJlZ2luRGV0YWlscyk7XG5cdFx0fSk7XG5cdFx0ZnVuY3Rpb24gZ2V0UmVydW5GYWlsZWRIdG1sKGZhaWxlZFRlc3RzKSB7XG5cdFx0XHRpZiAoZmFpbGVkVGVzdHMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdHJldHVybiAnJztcblx0XHRcdH1cblx0XHRcdHZhciBocmVmID0gc2V0VXJsKHtcblx0XHRcdFx0dGVzdElkOiBmYWlsZWRUZXN0c1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gW1wiPGJyIC8+PGEgaHJlZj0nXCIgKyBlc2NhcGVUZXh0KGhyZWYpICsgXCInPlwiLCBmYWlsZWRUZXN0cy5sZW5ndGggPT09IDEgPyAnUmVydW4gMSBmYWlsZWQgdGVzdCcgOiAnUmVydW4gJyArIGZhaWxlZFRlc3RzLmxlbmd0aCArICcgZmFpbGVkIHRlc3RzJywgJzwvYT4nXS5qb2luKCcnKTtcblx0XHR9XG5cdFx0UVVuaXQub24oJ3J1bkVuZCcsIGZ1bmN0aW9uIChydW5FbmQpIHtcblx0XHRcdHZhciBiYW5uZXIgPSBpZCgncXVuaXQtYmFubmVyJyk7XG5cdFx0XHR2YXIgdGVzdHMgPSBpZCgncXVuaXQtdGVzdHMnKTtcblx0XHRcdHZhciBhYm9ydEJ1dHRvbiA9IGlkKCdxdW5pdC1hYm9ydC10ZXN0cy1idXR0b24nKTtcblx0XHRcdHZhciBhc3NlcnRQYXNzZWQgPSBjb25maWcuc3RhdHMuYWxsIC0gY29uZmlnLnN0YXRzLmJhZDtcblx0XHRcdHZhciBodG1sID0gW3J1bkVuZC50ZXN0Q291bnRzLnRvdGFsLCAnIHRlc3RzIGNvbXBsZXRlZCBpbiAnLCBydW5FbmQucnVudGltZSwgJyBtaWxsaXNlY29uZHMsIHdpdGggJywgcnVuRW5kLnRlc3RDb3VudHMuZmFpbGVkLCAnIGZhaWxlZCwgJywgcnVuRW5kLnRlc3RDb3VudHMuc2tpcHBlZCwgJyBza2lwcGVkLCBhbmQgJywgcnVuRW5kLnRlc3RDb3VudHMudG9kbywgJyB0b2RvLjxiciAvPicsIFwiPHNwYW4gY2xhc3M9J3Bhc3NlZCc+XCIsIGFzc2VydFBhc3NlZCwgXCI8L3NwYW4+IGFzc2VydGlvbnMgb2YgPHNwYW4gY2xhc3M9J3RvdGFsJz5cIiwgY29uZmlnLnN0YXRzLmFsbCwgXCI8L3NwYW4+IHBhc3NlZCwgPHNwYW4gY2xhc3M9J2ZhaWxlZCc+XCIsIGNvbmZpZy5zdGF0cy5iYWQsICc8L3NwYW4+IGZhaWxlZC4nLCBnZXRSZXJ1bkZhaWxlZEh0bWwoc3RhdHMuZmFpbGVkVGVzdHMpXS5qb2luKCcnKTtcblx0XHRcdHZhciB0ZXN0O1xuXHRcdFx0dmFyIGFzc2VydExpO1xuXHRcdFx0dmFyIGFzc2VydExpc3Q7XG5cblx0XHRcdC8vIFVwZGF0ZSByZW1haW5pbmcgdGVzdHMgdG8gYWJvcnRlZFxuXHRcdFx0aWYgKGFib3J0QnV0dG9uICYmIGFib3J0QnV0dG9uLmRpc2FibGVkKSB7XG5cdFx0XHRcdGh0bWwgPSAnVGVzdHMgYWJvcnRlZCBhZnRlciAnICsgcnVuRW5kLnJ1bnRpbWUgKyAnIG1pbGxpc2Vjb25kcy4nO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRlc3RzLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0dGVzdCA9IHRlc3RzLmNoaWxkcmVuW2ldO1xuXHRcdFx0XHRcdGlmICh0ZXN0LmNsYXNzTmFtZSA9PT0gJycgfHwgdGVzdC5jbGFzc05hbWUgPT09ICdydW5uaW5nJykge1xuXHRcdFx0XHRcdFx0dGVzdC5jbGFzc05hbWUgPSAnYWJvcnRlZCc7XG5cdFx0XHRcdFx0XHRhc3NlcnRMaXN0ID0gdGVzdC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnb2wnKVswXTtcblx0XHRcdFx0XHRcdGFzc2VydExpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcblx0XHRcdFx0XHRcdGFzc2VydExpLmNsYXNzTmFtZSA9ICdmYWlsJztcblx0XHRcdFx0XHRcdGFzc2VydExpLmlubmVySFRNTCA9ICdUZXN0IGFib3J0ZWQuJztcblx0XHRcdFx0XHRcdGFzc2VydExpc3QuYXBwZW5kQ2hpbGQoYXNzZXJ0TGkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGJhbm5lciAmJiAoIWFib3J0QnV0dG9uIHx8IGFib3J0QnV0dG9uLmRpc2FibGVkID09PSBmYWxzZSkpIHtcblx0XHRcdFx0YmFubmVyLmNsYXNzTmFtZSA9IHJ1bkVuZC5zdGF0dXMgPT09ICdmYWlsZWQnID8gJ3F1bml0LWZhaWwnIDogJ3F1bml0LXBhc3MnO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGFib3J0QnV0dG9uKSB7XG5cdFx0XHRcdGFib3J0QnV0dG9uLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoYWJvcnRCdXR0b24pO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRlc3RzKSB7XG5cdFx0XHRcdGlkKCdxdW5pdC10ZXN0cmVzdWx0LWRpc3BsYXknKS5pbm5lckhUTUwgPSBodG1sO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGNvbmZpZy5hbHRlcnRpdGxlICYmIGRvY3VtZW50LnRpdGxlKSB7XG5cdFx0XHRcdC8vIFNob3cg4pyWIGZvciBnb29kLCDinJQgZm9yIGJhZCBzdWl0ZSByZXN1bHQgaW4gdGl0bGVcblx0XHRcdFx0Ly8gdXNlIGVzY2FwZSBzZXF1ZW5jZXMgaW4gY2FzZSBmaWxlIGdldHMgbG9hZGVkIHdpdGggbm9uLXV0Zi04XG5cdFx0XHRcdC8vIGNoYXJzZXRcblx0XHRcdFx0ZG9jdW1lbnQudGl0bGUgPSBbcnVuRW5kLnN0YXR1cyA9PT0gJ2ZhaWxlZCcgPyBcIlxcdTI3MTZcIiA6IFwiXFx1MjcxNFwiLCBkb2N1bWVudC50aXRsZS5yZXBsYWNlKC9eW1xcdTI3MTRcXHUyNzE2XSAvaSwgJycpXS5qb2luKCcgJyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFNjcm9sbCBiYWNrIHRvIHRvcCB0byBzaG93IHJlc3VsdHNcblx0XHRcdGlmIChjb25maWcuc2Nyb2xsdG9wICYmIHdpbmRvdyQxLnNjcm9sbFRvKSB7XG5cdFx0XHRcdHdpbmRvdyQxLnNjcm9sbFRvKDAsIDApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdGZ1bmN0aW9uIGdldE5hbWVIdG1sKG5hbWUsIG1vZHVsZSkge1xuXHRcdFx0dmFyIG5hbWVIdG1sID0gJyc7XG5cdFx0XHRpZiAobW9kdWxlKSB7XG5cdFx0XHRcdG5hbWVIdG1sID0gXCI8c3BhbiBjbGFzcz0nbW9kdWxlLW5hbWUnPlwiICsgZXNjYXBlVGV4dChtb2R1bGUpICsgJzwvc3Bhbj46ICc7XG5cdFx0XHR9XG5cdFx0XHRuYW1lSHRtbCArPSBcIjxzcGFuIGNsYXNzPSd0ZXN0LW5hbWUnPlwiICsgZXNjYXBlVGV4dChuYW1lKSArICc8L3NwYW4+Jztcblx0XHRcdHJldHVybiBuYW1lSHRtbDtcblx0XHR9XG5cdFx0ZnVuY3Rpb24gZ2V0UHJvZ3Jlc3NIdG1sKHN0YXRzKSB7XG5cdFx0XHRyZXR1cm4gW3N0YXRzLmNvbXBsZXRlZCwgJyAvICcsIHN0YXRzLmRlZmluZWQsICcgdGVzdHMgY29tcGxldGVkLjxiciAvPiddLmpvaW4oJycpO1xuXHRcdH1cblx0XHRRVW5pdC50ZXN0U3RhcnQoZnVuY3Rpb24gKGRldGFpbHMpIHtcblx0XHRcdHZhciBydW5uaW5nLCBiYWQ7XG5cdFx0XHRhcHBlbmRUZXN0KGRldGFpbHMubmFtZSwgZGV0YWlscy50ZXN0SWQsIGRldGFpbHMubW9kdWxlKTtcblx0XHRcdHJ1bm5pbmcgPSBpZCgncXVuaXQtdGVzdHJlc3VsdC1kaXNwbGF5Jyk7XG5cdFx0XHRpZiAocnVubmluZykge1xuXHRcdFx0XHRhZGRDbGFzcyhydW5uaW5nLCAncnVubmluZycpO1xuXHRcdFx0XHRiYWQgPSBRVW5pdC5jb25maWcucmVvcmRlciAmJiBkZXRhaWxzLnByZXZpb3VzRmFpbHVyZTtcblx0XHRcdFx0cnVubmluZy5pbm5lckhUTUwgPSBbZ2V0UHJvZ3Jlc3NIdG1sKHN0YXRzKSwgYmFkID8gJ1JlcnVubmluZyBwcmV2aW91c2x5IGZhaWxlZCB0ZXN0OiA8YnIgLz4nIDogJ1J1bm5pbmc6ICcsIGdldE5hbWVIdG1sKGRldGFpbHMubmFtZSwgZGV0YWlscy5tb2R1bGUpLCBnZXRSZXJ1bkZhaWxlZEh0bWwoc3RhdHMuZmFpbGVkVGVzdHMpXS5qb2luKCcnKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRmdW5jdGlvbiBzdHJpcEh0bWwoc3RyaW5nKSB7XG5cdFx0XHQvLyBTdHJpcCB0YWdzLCBodG1sIGVudGl0eSBhbmQgd2hpdGVzcGFjZXNcblx0XHRcdHJldHVybiBzdHJpbmcucmVwbGFjZSgvPFxcLz9bXj5dKyg+fCQpL2csICcnKS5yZXBsYWNlKC8mcXVvdDsvZywgJycpLnJlcGxhY2UoL1xccysvZywgJycpO1xuXHRcdH1cblx0XHRRVW5pdC5sb2coZnVuY3Rpb24gKGRldGFpbHMpIHtcblx0XHRcdHZhciB0ZXN0SXRlbSA9IGlkKCdxdW5pdC10ZXN0LW91dHB1dC0nICsgZGV0YWlscy50ZXN0SWQpO1xuXHRcdFx0aWYgKCF0ZXN0SXRlbSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgbWVzc2FnZSA9IGVzY2FwZVRleHQoZGV0YWlscy5tZXNzYWdlKSB8fCAoZGV0YWlscy5yZXN1bHQgPyAnb2theScgOiAnZmFpbGVkJyk7XG5cdFx0XHRtZXNzYWdlID0gXCI8c3BhbiBjbGFzcz0ndGVzdC1tZXNzYWdlJz5cIiArIG1lc3NhZ2UgKyAnPC9zcGFuPic7XG5cdFx0XHRtZXNzYWdlICs9IFwiPHNwYW4gY2xhc3M9J3J1bnRpbWUnPkAgXCIgKyBkZXRhaWxzLnJ1bnRpbWUgKyAnIG1zPC9zcGFuPic7XG5cdFx0XHR2YXIgZXhwZWN0ZWQ7XG5cdFx0XHR2YXIgYWN0dWFsO1xuXHRcdFx0dmFyIGRpZmY7XG5cdFx0XHR2YXIgc2hvd0RpZmYgPSBmYWxzZTtcblxuXHRcdFx0Ly8gVGhlIHB1c2hGYWlsdXJlIGRvZXNuJ3QgcHJvdmlkZSBkZXRhaWxzLmV4cGVjdGVkXG5cdFx0XHQvLyB3aGVuIGl0IGNhbGxzLCBpdCdzIGltcGxpY2l0IHRvIGFsc28gbm90IHNob3cgZXhwZWN0ZWQgYW5kIGRpZmYgc3R1ZmZcblx0XHRcdC8vIEFsc28sIHdlIG5lZWQgdG8gY2hlY2sgZGV0YWlscy5leHBlY3RlZCBleGlzdGVuY2UsIGFzIGl0IGNhbiBleGlzdCBhbmQgYmUgdW5kZWZpbmVkXG5cdFx0XHRpZiAoIWRldGFpbHMucmVzdWx0ICYmIGhhc093bi5jYWxsKGRldGFpbHMsICdleHBlY3RlZCcpKSB7XG5cdFx0XHRcdGlmIChkZXRhaWxzLm5lZ2F0aXZlKSB7XG5cdFx0XHRcdFx0ZXhwZWN0ZWQgPSAnTk9UICcgKyBRVW5pdC5kdW1wLnBhcnNlKGRldGFpbHMuZXhwZWN0ZWQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGV4cGVjdGVkID0gUVVuaXQuZHVtcC5wYXJzZShkZXRhaWxzLmV4cGVjdGVkKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRhY3R1YWwgPSBRVW5pdC5kdW1wLnBhcnNlKGRldGFpbHMuYWN0dWFsKTtcblx0XHRcdFx0bWVzc2FnZSArPSBcIjx0YWJsZT48dHIgY2xhc3M9J3Rlc3QtZXhwZWN0ZWQnPjx0aD5FeHBlY3RlZDogPC90aD48dGQ+PHByZT5cIiArIGVzY2FwZVRleHQoZXhwZWN0ZWQpICsgJzwvcHJlPjwvdGQ+PC90cj4nO1xuXHRcdFx0XHRpZiAoYWN0dWFsICE9PSBleHBlY3RlZCkge1xuXHRcdFx0XHRcdG1lc3NhZ2UgKz0gXCI8dHIgY2xhc3M9J3Rlc3QtYWN0dWFsJz48dGg+UmVzdWx0OiA8L3RoPjx0ZD48cHJlPlwiICsgZXNjYXBlVGV4dChhY3R1YWwpICsgJzwvcHJlPjwvdGQ+PC90cj4nO1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgZGV0YWlscy5hY3R1YWwgPT09ICdudW1iZXInICYmIHR5cGVvZiBkZXRhaWxzLmV4cGVjdGVkID09PSAnbnVtYmVyJykge1xuXHRcdFx0XHRcdFx0aWYgKCFpc05hTihkZXRhaWxzLmFjdHVhbCkgJiYgIWlzTmFOKGRldGFpbHMuZXhwZWN0ZWQpKSB7XG5cdFx0XHRcdFx0XHRcdHNob3dEaWZmID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0ZGlmZiA9IGRldGFpbHMuYWN0dWFsIC0gZGV0YWlscy5leHBlY3RlZDtcblx0XHRcdFx0XHRcdFx0ZGlmZiA9IChkaWZmID4gMCA/ICcrJyA6ICcnKSArIGRpZmY7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgZGV0YWlscy5hY3R1YWwgIT09ICdib29sZWFuJyAmJiB0eXBlb2YgZGV0YWlscy5leHBlY3RlZCAhPT0gJ2Jvb2xlYW4nKSB7XG5cdFx0XHRcdFx0XHRkaWZmID0gUVVuaXQuZGlmZihleHBlY3RlZCwgYWN0dWFsKTtcblxuXHRcdFx0XHRcdFx0Ly8gZG9uJ3Qgc2hvdyBkaWZmIGlmIHRoZXJlIGlzIHplcm8gb3ZlcmxhcFxuXHRcdFx0XHRcdFx0c2hvd0RpZmYgPSBzdHJpcEh0bWwoZGlmZikubGVuZ3RoICE9PSBzdHJpcEh0bWwoZXhwZWN0ZWQpLmxlbmd0aCArIHN0cmlwSHRtbChhY3R1YWwpLmxlbmd0aDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHNob3dEaWZmKSB7XG5cdFx0XHRcdFx0XHRtZXNzYWdlICs9IFwiPHRyIGNsYXNzPSd0ZXN0LWRpZmYnPjx0aD5EaWZmOiA8L3RoPjx0ZD48cHJlPlwiICsgZGlmZiArICc8L3ByZT48L3RkPjwvdHI+Jztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAoZXhwZWN0ZWQuaW5kZXhPZignW29iamVjdCBBcnJheV0nKSAhPT0gLTEgfHwgZXhwZWN0ZWQuaW5kZXhPZignW29iamVjdCBPYmplY3RdJykgIT09IC0xKSB7XG5cdFx0XHRcdFx0bWVzc2FnZSArPSBcIjx0ciBjbGFzcz0ndGVzdC1tZXNzYWdlJz48dGg+TWVzc2FnZTogPC90aD48dGQ+XCIgKyAnRGlmZiBzdXBwcmVzc2VkIGFzIHRoZSBkZXB0aCBvZiBvYmplY3QgaXMgbW9yZSB0aGFuIGN1cnJlbnQgbWF4IGRlcHRoICgnICsgUVVuaXQuY29uZmlnLm1heERlcHRoICsgJykuPHA+SGludDogVXNlIDxjb2RlPlFVbml0LmR1bXAubWF4RGVwdGg8L2NvZGU+IHRvICcgKyBcIiBydW4gd2l0aCBhIGhpZ2hlciBtYXggZGVwdGggb3IgPGEgaHJlZj0nXCIgKyBlc2NhcGVUZXh0KHNldFVybCh7XG5cdFx0XHRcdFx0XHRtYXhEZXB0aDogLTFcblx0XHRcdFx0XHR9KSkgKyBcIic+XCIgKyAnUmVydW48L2E+IHdpdGhvdXQgbWF4IGRlcHRoLjwvcD48L3RkPjwvdHI+Jztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRtZXNzYWdlICs9IFwiPHRyIGNsYXNzPSd0ZXN0LW1lc3NhZ2UnPjx0aD5NZXNzYWdlOiA8L3RoPjx0ZD5cIiArICdEaWZmIHN1cHByZXNzZWQgYXMgdGhlIGV4cGVjdGVkIGFuZCBhY3R1YWwgcmVzdWx0cyBoYXZlIGFuIGVxdWl2YWxlbnQnICsgJyBzZXJpYWxpemF0aW9uPC90ZD48L3RyPic7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGRldGFpbHMuc291cmNlKSB7XG5cdFx0XHRcdFx0bWVzc2FnZSArPSBcIjx0ciBjbGFzcz0ndGVzdC1zb3VyY2UnPjx0aD5Tb3VyY2U6IDwvdGg+PHRkPjxwcmU+XCIgKyBlc2NhcGVUZXh0KGRldGFpbHMuc291cmNlKSArICc8L3ByZT48L3RkPjwvdHI+Jztcblx0XHRcdFx0fVxuXHRcdFx0XHRtZXNzYWdlICs9ICc8L3RhYmxlPic7XG5cblx0XHRcdFx0Ly8gVGhpcyBvY2N1cnMgd2hlbiBwdXNoRmFpbHVyZSBpcyBzZXQgYW5kIHdlIGhhdmUgYW4gZXh0cmFjdGVkIHN0YWNrIHRyYWNlXG5cdFx0XHR9IGVsc2UgaWYgKCFkZXRhaWxzLnJlc3VsdCAmJiBkZXRhaWxzLnNvdXJjZSkge1xuXHRcdFx0XHRtZXNzYWdlICs9ICc8dGFibGU+JyArIFwiPHRyIGNsYXNzPSd0ZXN0LXNvdXJjZSc+PHRoPlNvdXJjZTogPC90aD48dGQ+PHByZT5cIiArIGVzY2FwZVRleHQoZGV0YWlscy5zb3VyY2UpICsgJzwvcHJlPjwvdGQ+PC90cj4nICsgJzwvdGFibGU+Jztcblx0XHRcdH1cblx0XHRcdHZhciBhc3NlcnRMaXN0ID0gdGVzdEl0ZW0uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ29sJylbMF07XG5cdFx0XHR2YXIgYXNzZXJ0TGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuXHRcdFx0YXNzZXJ0TGkuY2xhc3NOYW1lID0gZGV0YWlscy5yZXN1bHQgPyAncGFzcycgOiAnZmFpbCc7XG5cdFx0XHRhc3NlcnRMaS5pbm5lckhUTUwgPSBtZXNzYWdlO1xuXHRcdFx0YXNzZXJ0TGlzdC5hcHBlbmRDaGlsZChhc3NlcnRMaSk7XG5cdFx0fSk7XG5cdFx0UVVuaXQudGVzdERvbmUoZnVuY3Rpb24gKGRldGFpbHMpIHtcblx0XHRcdHZhciB0ZXN0cyA9IGlkKCdxdW5pdC10ZXN0cycpO1xuXHRcdFx0dmFyIHRlc3RJdGVtID0gaWQoJ3F1bml0LXRlc3Qtb3V0cHV0LScgKyBkZXRhaWxzLnRlc3RJZCk7XG5cdFx0XHRpZiAoIXRlc3RzIHx8ICF0ZXN0SXRlbSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRyZW1vdmVDbGFzcyh0ZXN0SXRlbSwgJ3J1bm5pbmcnKTtcblx0XHRcdHZhciBzdGF0dXM7XG5cdFx0XHRpZiAoZGV0YWlscy5mYWlsZWQgPiAwKSB7XG5cdFx0XHRcdHN0YXR1cyA9ICdmYWlsZWQnO1xuXHRcdFx0fSBlbHNlIGlmIChkZXRhaWxzLnRvZG8pIHtcblx0XHRcdFx0c3RhdHVzID0gJ3RvZG8nO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c3RhdHVzID0gZGV0YWlscy5za2lwcGVkID8gJ3NraXBwZWQnIDogJ3Bhc3NlZCc7XG5cdFx0XHR9XG5cdFx0XHR2YXIgYXNzZXJ0TGlzdCA9IHRlc3RJdGVtLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdvbCcpWzBdO1xuXHRcdFx0dmFyIGdvb2QgPSBkZXRhaWxzLnBhc3NlZDtcblx0XHRcdHZhciBiYWQgPSBkZXRhaWxzLmZhaWxlZDtcblxuXHRcdFx0Ly8gVGhpcyB0ZXN0IHBhc3NlZCBpZiBpdCBoYXMgbm8gdW5leHBlY3RlZCBmYWlsZWQgYXNzZXJ0aW9uc1xuXHRcdFx0dmFyIHRlc3RQYXNzZWQgPSBkZXRhaWxzLmZhaWxlZCA+IDAgPyBkZXRhaWxzLnRvZG8gOiAhZGV0YWlscy50b2RvO1xuXHRcdFx0aWYgKHRlc3RQYXNzZWQpIHtcblx0XHRcdFx0Ly8gQ29sbGFwc2UgdGhlIHBhc3NpbmcgdGVzdHNcblx0XHRcdFx0YWRkQ2xhc3MoYXNzZXJ0TGlzdCwgJ3F1bml0LWNvbGxhcHNlZCcpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c3RhdHMuZmFpbGVkVGVzdHMucHVzaChkZXRhaWxzLnRlc3RJZCk7XG5cdFx0XHRcdGlmIChjb25maWcuY29sbGFwc2UpIHtcblx0XHRcdFx0XHRpZiAoIWNvbGxhcHNlTmV4dCkge1xuXHRcdFx0XHRcdFx0Ly8gU2tpcCBjb2xsYXBzaW5nIHRoZSBmaXJzdCBmYWlsaW5nIHRlc3Rcblx0XHRcdFx0XHRcdGNvbGxhcHNlTmV4dCA9IHRydWU7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIENvbGxhcHNlIHJlbWFpbmluZyB0ZXN0c1xuXHRcdFx0XHRcdFx0YWRkQ2xhc3MoYXNzZXJ0TGlzdCwgJ3F1bml0LWNvbGxhcHNlZCcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBUaGUgdGVzdEl0ZW0uZmlyc3RDaGlsZCBpcyB0aGUgdGVzdCBuYW1lXG5cdFx0XHR2YXIgdGVzdFRpdGxlID0gdGVzdEl0ZW0uZmlyc3RDaGlsZDtcblx0XHRcdHZhciB0ZXN0Q291bnRzID0gYmFkID8gXCI8YiBjbGFzcz0nZmFpbGVkJz5cIiArIGJhZCArICc8L2I+LCAnICsgXCI8YiBjbGFzcz0ncGFzc2VkJz5cIiArIGdvb2QgKyAnPC9iPiwgJyA6ICcnO1xuXHRcdFx0dGVzdFRpdGxlLmlubmVySFRNTCArPSBcIiA8YiBjbGFzcz0nY291bnRzJz4oXCIgKyB0ZXN0Q291bnRzICsgZGV0YWlscy5hc3NlcnRpb25zLmxlbmd0aCArICcpPC9iPic7XG5cdFx0XHRzdGF0cy5jb21wbGV0ZWQrKztcblx0XHRcdGlmIChkZXRhaWxzLnNraXBwZWQpIHtcblx0XHRcdFx0dGVzdEl0ZW0uY2xhc3NOYW1lID0gJ3NraXBwZWQnO1xuXHRcdFx0XHR2YXIgc2tpcHBlZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2VtJyk7XG5cdFx0XHRcdHNraXBwZWQuY2xhc3NOYW1lID0gJ3F1bml0LXNraXBwZWQtbGFiZWwnO1xuXHRcdFx0XHRza2lwcGVkLmlubmVySFRNTCA9ICdza2lwcGVkJztcblx0XHRcdFx0dGVzdEl0ZW0uaW5zZXJ0QmVmb3JlKHNraXBwZWQsIHRlc3RUaXRsZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhZGRFdmVudCh0ZXN0VGl0bGUsICdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHR0b2dnbGVDbGFzcyhhc3NlcnRMaXN0LCAncXVuaXQtY29sbGFwc2VkJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHR0ZXN0SXRlbS5jbGFzc05hbWUgPSB0ZXN0UGFzc2VkID8gJ3Bhc3MnIDogJ2ZhaWwnO1xuXHRcdFx0XHRpZiAoZGV0YWlscy50b2RvKSB7XG5cdFx0XHRcdFx0dmFyIHRvZG9MYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2VtJyk7XG5cdFx0XHRcdFx0dG9kb0xhYmVsLmNsYXNzTmFtZSA9ICdxdW5pdC10b2RvLWxhYmVsJztcblx0XHRcdFx0XHR0b2RvTGFiZWwuaW5uZXJIVE1MID0gJ3RvZG8nO1xuXHRcdFx0XHRcdHRlc3RJdGVtLmNsYXNzTmFtZSArPSAnIHRvZG8nO1xuXHRcdFx0XHRcdHRlc3RJdGVtLmluc2VydEJlZm9yZSh0b2RvTGFiZWwsIHRlc3RUaXRsZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIHRpbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG5cdFx0XHRcdHRpbWUuY2xhc3NOYW1lID0gJ3J1bnRpbWUnO1xuXHRcdFx0XHR0aW1lLmlubmVySFRNTCA9IGRldGFpbHMucnVudGltZSArICcgbXMnO1xuXHRcdFx0XHR0ZXN0SXRlbS5pbnNlcnRCZWZvcmUodGltZSwgYXNzZXJ0TGlzdCk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFNob3cgdGhlIHNvdXJjZSBvZiB0aGUgdGVzdCB3aGVuIHNob3dpbmcgYXNzZXJ0aW9uc1xuXHRcdFx0aWYgKGRldGFpbHMuc291cmNlKSB7XG5cdFx0XHRcdHZhciBzb3VyY2VOYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuXHRcdFx0XHRzb3VyY2VOYW1lLmlubmVySFRNTCA9ICc8c3Ryb25nPlNvdXJjZTogPC9zdHJvbmc+JyArIGVzY2FwZVRleHQoZGV0YWlscy5zb3VyY2UpO1xuXHRcdFx0XHRhZGRDbGFzcyhzb3VyY2VOYW1lLCAncXVuaXQtc291cmNlJyk7XG5cdFx0XHRcdGlmICh0ZXN0UGFzc2VkKSB7XG5cdFx0XHRcdFx0YWRkQ2xhc3Moc291cmNlTmFtZSwgJ3F1bml0LWNvbGxhcHNlZCcpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGFkZEV2ZW50KHRlc3RUaXRsZSwgJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHRvZ2dsZUNsYXNzKHNvdXJjZU5hbWUsICdxdW5pdC1jb2xsYXBzZWQnKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHRlc3RJdGVtLmFwcGVuZENoaWxkKHNvdXJjZU5hbWUpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGNvbmZpZy5oaWRlcGFzc2VkICYmIChzdGF0dXMgPT09ICdwYXNzZWQnIHx8IGRldGFpbHMuc2tpcHBlZCkpIHtcblx0XHRcdFx0Ly8gdXNlIHJlbW92ZUNoaWxkIGluc3RlYWQgb2YgcmVtb3ZlIGJlY2F1c2Ugb2Ygc3VwcG9ydFxuXHRcdFx0XHRoaWRkZW5UZXN0cy5wdXNoKHRlc3RJdGVtKTtcblx0XHRcdFx0dGVzdHMucmVtb3ZlQ2hpbGQodGVzdEl0ZW0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdFFVbml0Lm9uKCdlcnJvcicsIGZ1bmN0aW9uIChlcnJvcikge1xuXHRcdFx0dmFyIHRlc3RJdGVtID0gYXBwZW5kVGVzdCgnZ2xvYmFsIGZhaWx1cmUnKTtcblx0XHRcdGlmICghdGVzdEl0ZW0pIHtcblx0XHRcdFx0Ly8gSFRNTCBSZXBvcnRlciBpcyBwcm9iYWJseSBkaXNhYmxlZCBvciBub3QgeWV0IGluaXRpYWxpemVkLlxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIFJlbmRlciBzaW1pbGFyIHRvIGEgZmFpbGVkIGFzc2VydGlvbiAoc2VlIGFib3ZlIFFVbml0LmxvZyBjYWxsYmFjaylcblx0XHRcdHZhciBtZXNzYWdlID0gZXNjYXBlVGV4dChlcnJvclN0cmluZyhlcnJvcikpO1xuXHRcdFx0bWVzc2FnZSA9IFwiPHNwYW4gY2xhc3M9J3Rlc3QtbWVzc2FnZSc+XCIgKyBtZXNzYWdlICsgJzwvc3Bhbj4nO1xuXHRcdFx0aWYgKGVycm9yICYmIGVycm9yLnN0YWNrKSB7XG5cdFx0XHRcdG1lc3NhZ2UgKz0gJzx0YWJsZT4nICsgXCI8dHIgY2xhc3M9J3Rlc3Qtc291cmNlJz48dGg+U291cmNlOiA8L3RoPjx0ZD48cHJlPlwiICsgZXNjYXBlVGV4dChlcnJvci5zdGFjaykgKyAnPC9wcmU+PC90ZD48L3RyPicgKyAnPC90YWJsZT4nO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGFzc2VydExpc3QgPSB0ZXN0SXRlbS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnb2wnKVswXTtcblx0XHRcdHZhciBhc3NlcnRMaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG5cdFx0XHRhc3NlcnRMaS5jbGFzc05hbWUgPSAnZmFpbCc7XG5cdFx0XHRhc3NlcnRMaS5pbm5lckhUTUwgPSBtZXNzYWdlO1xuXHRcdFx0YXNzZXJ0TGlzdC5hcHBlbmRDaGlsZChhc3NlcnRMaSk7XG5cblx0XHRcdC8vIE1ha2UgaXQgdmlzaWJsZVxuXHRcdFx0dGVzdEl0ZW0uY2xhc3NOYW1lID0gJ2ZhaWwnO1xuXHRcdH0pO1xuXG5cdFx0Ly8gQXZvaWQgcmVhZHlTdGF0ZSBpc3N1ZSB3aXRoIHBoYW50b21qc1xuXHRcdC8vIFJlZjogIzgxOFxuXHRcdHZhciB1c2luZ1BoYW50b20gPSBmdW5jdGlvbiAocCkge1xuXHRcdFx0cmV0dXJuIHAgJiYgcC52ZXJzaW9uICYmIHAudmVyc2lvbi5tYWpvciA+IDA7XG5cdFx0fSh3aW5kb3ckMS5waGFudG9tKTtcblx0XHRpZiAodXNpbmdQaGFudG9tKSB7XG5cdFx0XHRjb25zb2xlJDEud2FybignU3VwcG9ydCBmb3IgUGhhbnRvbUpTIGlzIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiBRVW5pdCAzLjAuJyk7XG5cdFx0fVxuXHRcdGlmICghdXNpbmdQaGFudG9tICYmIGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcblx0XHRcdFFVbml0LmxvYWQoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YWRkRXZlbnQod2luZG93JDEsICdsb2FkJywgUVVuaXQubG9hZCk7XG5cdFx0fVxuXG5cdFx0Ly8gV3JhcCB3aW5kb3cub25lcnJvci4gV2Ugd2lsbCBjYWxsIHRoZSBvcmlnaW5hbCB3aW5kb3cub25lcnJvciB0byBzZWUgaWZcblx0XHQvLyB0aGUgZXhpc3RpbmcgaGFuZGxlciBmdWxseSBoYW5kbGVzIHRoZSBlcnJvcjsgaWYgbm90LCB3ZSB3aWxsIGNhbGwgdGhlXG5cdFx0Ly8gUVVuaXQub25FcnJvciBmdW5jdGlvbi5cblx0XHR2YXIgb3JpZ2luYWxXaW5kb3dPbkVycm9yID0gd2luZG93JDEub25lcnJvcjtcblxuXHRcdC8vIENvdmVyIHVuY2F1Z2h0IGV4Y2VwdGlvbnNcblx0XHQvLyBSZXR1cm5pbmcgdHJ1ZSB3aWxsIHN1cHByZXNzIHRoZSBkZWZhdWx0IGJyb3dzZXIgaGFuZGxlcixcblx0XHQvLyByZXR1cm5pbmcgZmFsc2Ugd2lsbCBsZXQgaXQgcnVuLlxuXHRcdHdpbmRvdyQxLm9uZXJyb3IgPSBmdW5jdGlvbiAobWVzc2FnZSwgZmlsZU5hbWUsIGxpbmVOdW1iZXIsIGNvbHVtbk51bWJlciwgZXJyb3JPYmopIHtcblx0XHRcdHZhciByZXQgPSBmYWxzZTtcblx0XHRcdGlmIChvcmlnaW5hbFdpbmRvd09uRXJyb3IpIHtcblx0XHRcdFx0Zm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbiA+IDUgPyBfbGVuIC0gNSA6IDApLCBfa2V5ID0gNTsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuXHRcdFx0XHRcdGFyZ3NbX2tleSAtIDVdID0gYXJndW1lbnRzW19rZXldO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldCA9IG9yaWdpbmFsV2luZG93T25FcnJvci5jYWxsLmFwcGx5KG9yaWdpbmFsV2luZG93T25FcnJvciwgW3RoaXMsIG1lc3NhZ2UsIGZpbGVOYW1lLCBsaW5lTnVtYmVyLCBjb2x1bW5OdW1iZXIsIGVycm9yT2JqXS5jb25jYXQoYXJncykpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBUcmVhdCByZXR1cm4gdmFsdWUgYXMgd2luZG93Lm9uZXJyb3IgaXRzZWxmIGRvZXMsXG5cdFx0XHQvLyBPbmx5IGRvIG91ciBoYW5kbGluZyBpZiBub3Qgc3VwcHJlc3NlZC5cblx0XHRcdGlmIChyZXQgIT09IHRydWUpIHtcblx0XHRcdFx0Ly8gSWYgdGhlcmUgaXMgYSBjdXJyZW50IHRlc3QgdGhhdCBzZXRzIHRoZSBpbnRlcm5hbCBgaWdub3JlR2xvYmFsRXJyb3JzYCBmaWVsZFxuXHRcdFx0XHQvLyAoc3VjaCBhcyBkdXJpbmcgYGFzc2VydC50aHJvd3MoKWApLCB0aGVuIHRoZSBlcnJvciBpcyBpZ25vcmVkIGFuZCBuYXRpdmVcblx0XHRcdFx0Ly8gZXJyb3IgcmVwb3J0aW5nIGlzIHN1cHByZXNzZWQgYXMgd2VsbC4gVGhpcyBpcyBiZWNhdXNlIGluIGJyb3dzZXJzLCBhbiBlcnJvclxuXHRcdFx0XHQvLyBjYW4gc29tZXRpbWVzIGVuZCB1cCBpbiBgd2luZG93Lm9uZXJyb3JgIGluc3RlYWQgb2YgaW4gdGhlIGxvY2FsIHRyeS9jYXRjaC5cblx0XHRcdFx0Ly8gVGhpcyBpZ25vcmluZyBvZiBlcnJvcnMgZG9lcyBub3QgYXBwbHkgdG8gb3VyIGdlbmVyYWwgb25VbmNhdWdodEV4Y2VwdGlvblxuXHRcdFx0XHQvLyBtZXRob2QsIG5vciB0byBvdXIgYHVuaGFuZGxlZFJlamVjdGlvbmAgaGFuZGxlcnMsIGFzIHRob3NlIGFyZSBub3QgbWVhbnRcblx0XHRcdFx0Ly8gdG8gcmVjZWl2ZSBhbiBcImV4cGVjdGVkXCIgZXJyb3IgZHVyaW5nIGBhc3NlcnQudGhyb3dzKClgLlxuXHRcdFx0XHRpZiAoY29uZmlnLmN1cnJlbnQgJiYgY29uZmlnLmN1cnJlbnQuaWdub3JlR2xvYmFsRXJyb3JzKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBBY2NvcmRpbmcgdG9cblx0XHRcdFx0Ly8gaHR0cHM6Ly9ibG9nLnNlbnRyeS5pby8yMDE2LzAxLzA0L2NsaWVudC1qYXZhc2NyaXB0LXJlcG9ydGluZy13aW5kb3ctb25lcnJvcixcblx0XHRcdFx0Ly8gbW9zdCBtb2Rlcm4gYnJvd3NlcnMgc3VwcG9ydCBhbiBlcnJvck9iaiBhcmd1bWVudDsgdXNlIHRoYXQgdG9cblx0XHRcdFx0Ly8gZ2V0IGEgZnVsbCBzdGFjayB0cmFjZSBpZiBpdCdzIGF2YWlsYWJsZS5cblx0XHRcdFx0dmFyIGVycm9yID0gZXJyb3JPYmogfHwgbmV3IEVycm9yKG1lc3NhZ2UpO1xuXHRcdFx0XHRpZiAoIWVycm9yLnN0YWNrICYmIGZpbGVOYW1lICYmIGxpbmVOdW1iZXIpIHtcblx0XHRcdFx0XHRlcnJvci5zdGFjayA9IFwiXCIuY29uY2F0KGZpbGVOYW1lLCBcIjpcIikuY29uY2F0KGxpbmVOdW1iZXIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFFVbml0Lm9uVW5jYXVnaHRFeGNlcHRpb24oZXJyb3IpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHJldDtcblx0XHR9O1xuXHRcdHdpbmRvdyQxLmFkZEV2ZW50TGlzdGVuZXIoJ3VuaGFuZGxlZHJlamVjdGlvbicsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0UVVuaXQub25VbmNhdWdodEV4Y2VwdGlvbihldmVudC5yZWFzb24pO1xuXHRcdH0pO1xuXHR9KSgpO1xuXG5cdC8qXG4gICAqIFRoaXMgZmlsZSBpcyBhIG1vZGlmaWVkIHZlcnNpb24gb2YgZ29vZ2xlLWRpZmYtbWF0Y2gtcGF0Y2gncyBKYXZhU2NyaXB0IGltcGxlbWVudGF0aW9uXG4gICAqIChodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2dvb2dsZS1kaWZmLW1hdGNoLXBhdGNoL3NvdXJjZS9icm93c2UvdHJ1bmsvamF2YXNjcmlwdC9kaWZmX21hdGNoX3BhdGNoX3VuY29tcHJlc3NlZC5qcyksXG4gICAqIG1vZGlmaWNhdGlvbnMgYXJlIGxpY2Vuc2VkIGFzIG1vcmUgZnVsbHkgc2V0IGZvcnRoIGluIExJQ0VOU0UudHh0LlxuICAgKlxuICAgKiBUaGUgb3JpZ2luYWwgc291cmNlIG9mIGdvb2dsZS1kaWZmLW1hdGNoLXBhdGNoIGlzIGF0dHJpYnV0YWJsZSBhbmQgbGljZW5zZWQgYXMgZm9sbG93czpcbiAgICpcbiAgICogQ29weXJpZ2h0IDIwMDYgR29vZ2xlIEluYy5cbiAgICogaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9nb29nbGUtZGlmZi1tYXRjaC1wYXRjaC9cbiAgICpcbiAgICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAgICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICAgKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAgICpcbiAgICogaHR0cHM6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICAgKlxuICAgKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gICAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAgICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gICAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gICAqXG4gICAqIE1vcmUgSW5mbzpcbiAgICogIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvZ29vZ2xlLWRpZmYtbWF0Y2gtcGF0Y2gvXG4gICAqXG4gICAqIFVzYWdlOiBRVW5pdC5kaWZmKGV4cGVjdGVkLCBhY3R1YWwpXG4gICAqXG4gICAqL1xuXHRRVW5pdC5kaWZmID0gZnVuY3Rpb24gKCkge1xuXHRcdGZ1bmN0aW9uIERpZmZNYXRjaFBhdGNoKCkge31cblxuXHRcdC8vICBESUZGIEZVTkNUSU9OU1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIGRhdGEgc3RydWN0dXJlIHJlcHJlc2VudGluZyBhIGRpZmYgaXMgYW4gYXJyYXkgb2YgdHVwbGVzOlxuXHRcdCAqIFtbRElGRl9ERUxFVEUsICdIZWxsbyddLCBbRElGRl9JTlNFUlQsICdHb29kYnllJ10sIFtESUZGX0VRVUFMLCAnIHdvcmxkLiddXVxuXHRcdCAqIHdoaWNoIG1lYW5zOiBkZWxldGUgJ0hlbGxvJywgYWRkICdHb29kYnllJyBhbmQga2VlcCAnIHdvcmxkLidcblx0XHQgKi9cblx0XHR2YXIgRElGRl9ERUxFVEUgPSAtMTtcblx0XHR2YXIgRElGRl9JTlNFUlQgPSAxO1xuXHRcdHZhciBESUZGX0VRVUFMID0gMDtcblx0XHR2YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuXHRcdC8qKlxuXHRcdCAqIEZpbmQgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gdHdvIHRleHRzLiAgU2ltcGxpZmllcyB0aGUgcHJvYmxlbSBieSBzdHJpcHBpbmdcblx0XHQgKiBhbnkgY29tbW9uIHByZWZpeCBvciBzdWZmaXggb2ZmIHRoZSB0ZXh0cyBiZWZvcmUgZGlmZmluZy5cblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dDEgT2xkIHN0cmluZyB0byBiZSBkaWZmZWQuXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQyIE5ldyBzdHJpbmcgdG8gYmUgZGlmZmVkLlxuXHRcdCAqIEBwYXJhbSB7Ym9vbGVhbj19IG9wdENoZWNrbGluZXMgT3B0aW9uYWwgc3BlZWR1cCBmbGFnLiBJZiBwcmVzZW50IGFuZCBmYWxzZSxcblx0XHQgKiAgICAgdGhlbiBkb24ndCBydW4gYSBsaW5lLWxldmVsIGRpZmYgZmlyc3QgdG8gaWRlbnRpZnkgdGhlIGNoYW5nZWQgYXJlYXMuXG5cdFx0ICogICAgIERlZmF1bHRzIHRvIHRydWUsIHdoaWNoIGRvZXMgYSBmYXN0ZXIsIHNsaWdodGx5IGxlc3Mgb3B0aW1hbCBkaWZmLlxuXHRcdCAqIEByZXR1cm4geyFBcnJheS48IURpZmZNYXRjaFBhdGNoLkRpZmY+fSBBcnJheSBvZiBkaWZmIHR1cGxlcy5cblx0XHQgKi9cblx0XHREaWZmTWF0Y2hQYXRjaC5wcm90b3R5cGUuRGlmZk1haW4gPSBmdW5jdGlvbiAodGV4dDEsIHRleHQyLCBvcHRDaGVja2xpbmVzKSB7XG5cdFx0XHQvLyBUaGUgZGlmZiBtdXN0IGJlIGNvbXBsZXRlIGluIHVwIHRvIDEgc2Vjb25kLlxuXHRcdFx0dmFyIGRlYWRsaW5lID0gRGF0ZS5ub3coKSArIDEwMDA7XG5cblx0XHRcdC8vIENoZWNrIGZvciBudWxsIGlucHV0cy5cblx0XHRcdGlmICh0ZXh0MSA9PT0gbnVsbCB8fCB0ZXh0MiA9PT0gbnVsbCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBkaWZmIG51bGwgaW5wdXQuJyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIENoZWNrIGZvciBlcXVhbGl0eSAoc3BlZWR1cCkuXG5cdFx0XHRpZiAodGV4dDEgPT09IHRleHQyKSB7XG5cdFx0XHRcdGlmICh0ZXh0MSkge1xuXHRcdFx0XHRcdHJldHVybiBbW0RJRkZfRVFVQUwsIHRleHQxXV07XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIFtdO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHR5cGVvZiBvcHRDaGVja2xpbmVzID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRvcHRDaGVja2xpbmVzID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gVHJpbSBvZmYgY29tbW9uIHByZWZpeCAoc3BlZWR1cCkuXG5cdFx0XHR2YXIgY29tbW9ubGVuZ3RoID0gdGhpcy5kaWZmQ29tbW9uUHJlZml4KHRleHQxLCB0ZXh0Mik7XG5cdFx0XHR2YXIgY29tbW9ucHJlZml4ID0gdGV4dDEuc3Vic3RyaW5nKDAsIGNvbW1vbmxlbmd0aCk7XG5cdFx0XHR0ZXh0MSA9IHRleHQxLnN1YnN0cmluZyhjb21tb25sZW5ndGgpO1xuXHRcdFx0dGV4dDIgPSB0ZXh0Mi5zdWJzdHJpbmcoY29tbW9ubGVuZ3RoKTtcblxuXHRcdFx0Ly8gVHJpbSBvZmYgY29tbW9uIHN1ZmZpeCAoc3BlZWR1cCkuXG5cdFx0XHRjb21tb25sZW5ndGggPSB0aGlzLmRpZmZDb21tb25TdWZmaXgodGV4dDEsIHRleHQyKTtcblx0XHRcdHZhciBjb21tb25zdWZmaXggPSB0ZXh0MS5zdWJzdHJpbmcodGV4dDEubGVuZ3RoIC0gY29tbW9ubGVuZ3RoKTtcblx0XHRcdHRleHQxID0gdGV4dDEuc3Vic3RyaW5nKDAsIHRleHQxLmxlbmd0aCAtIGNvbW1vbmxlbmd0aCk7XG5cdFx0XHR0ZXh0MiA9IHRleHQyLnN1YnN0cmluZygwLCB0ZXh0Mi5sZW5ndGggLSBjb21tb25sZW5ndGgpO1xuXG5cdFx0XHQvLyBDb21wdXRlIHRoZSBkaWZmIG9uIHRoZSBtaWRkbGUgYmxvY2suXG5cdFx0XHR2YXIgZGlmZnMgPSB0aGlzLmRpZmZDb21wdXRlKHRleHQxLCB0ZXh0Miwgb3B0Q2hlY2tsaW5lcywgZGVhZGxpbmUpO1xuXG5cdFx0XHQvLyBSZXN0b3JlIHRoZSBwcmVmaXggYW5kIHN1ZmZpeC5cblx0XHRcdGlmIChjb21tb25wcmVmaXgpIHtcblx0XHRcdFx0ZGlmZnMudW5zaGlmdChbRElGRl9FUVVBTCwgY29tbW9ucHJlZml4XSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoY29tbW9uc3VmZml4KSB7XG5cdFx0XHRcdGRpZmZzLnB1c2goW0RJRkZfRVFVQUwsIGNvbW1vbnN1ZmZpeF0pO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5kaWZmQ2xlYW51cE1lcmdlKGRpZmZzKTtcblx0XHRcdHJldHVybiBkaWZmcztcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogUmVkdWNlIHRoZSBudW1iZXIgb2YgZWRpdHMgYnkgZWxpbWluYXRpbmcgb3BlcmF0aW9uYWxseSB0cml2aWFsIGVxdWFsaXRpZXMuXG5cdFx0ICogQHBhcmFtIHshQXJyYXkuPCFEaWZmTWF0Y2hQYXRjaC5EaWZmPn0gZGlmZnMgQXJyYXkgb2YgZGlmZiB0dXBsZXMuXG5cdFx0ICovXG5cdFx0RGlmZk1hdGNoUGF0Y2gucHJvdG90eXBlLmRpZmZDbGVhbnVwRWZmaWNpZW5jeSA9IGZ1bmN0aW9uIChkaWZmcykge1xuXHRcdFx0dmFyIGNoYW5nZXMsIGVxdWFsaXRpZXMsIGVxdWFsaXRpZXNMZW5ndGgsIGxhc3RlcXVhbGl0eSwgcG9pbnRlciwgcHJlSW5zLCBwcmVEZWwsIHBvc3RJbnMsIHBvc3REZWw7XG5cdFx0XHRjaGFuZ2VzID0gZmFsc2U7XG5cdFx0XHRlcXVhbGl0aWVzID0gW107IC8vIFN0YWNrIG9mIGluZGljZXMgd2hlcmUgZXF1YWxpdGllcyBhcmUgZm91bmQuXG5cdFx0XHRlcXVhbGl0aWVzTGVuZ3RoID0gMDsgLy8gS2VlcGluZyBvdXIgb3duIGxlbmd0aCB2YXIgaXMgZmFzdGVyIGluIEpTLlxuXHRcdFx0LyoqIEB0eXBlIHs/c3RyaW5nfSAqL1xuXHRcdFx0bGFzdGVxdWFsaXR5ID0gbnVsbDtcblxuXHRcdFx0Ly8gQWx3YXlzIGVxdWFsIHRvIGRpZmZzW2VxdWFsaXRpZXNbZXF1YWxpdGllc0xlbmd0aCAtIDFdXVsxXVxuXHRcdFx0cG9pbnRlciA9IDA7IC8vIEluZGV4IG9mIGN1cnJlbnQgcG9zaXRpb24uXG5cblx0XHRcdC8vIElzIHRoZXJlIGFuIGluc2VydGlvbiBvcGVyYXRpb24gYmVmb3JlIHRoZSBsYXN0IGVxdWFsaXR5LlxuXHRcdFx0cHJlSW5zID0gZmFsc2U7XG5cblx0XHRcdC8vIElzIHRoZXJlIGEgZGVsZXRpb24gb3BlcmF0aW9uIGJlZm9yZSB0aGUgbGFzdCBlcXVhbGl0eS5cblx0XHRcdHByZURlbCA9IGZhbHNlO1xuXG5cdFx0XHQvLyBJcyB0aGVyZSBhbiBpbnNlcnRpb24gb3BlcmF0aW9uIGFmdGVyIHRoZSBsYXN0IGVxdWFsaXR5LlxuXHRcdFx0cG9zdElucyA9IGZhbHNlO1xuXG5cdFx0XHQvLyBJcyB0aGVyZSBhIGRlbGV0aW9uIG9wZXJhdGlvbiBhZnRlciB0aGUgbGFzdCBlcXVhbGl0eS5cblx0XHRcdHBvc3REZWwgPSBmYWxzZTtcblx0XHRcdHdoaWxlIChwb2ludGVyIDwgZGlmZnMubGVuZ3RoKSB7XG5cdFx0XHRcdC8vIEVxdWFsaXR5IGZvdW5kLlxuXHRcdFx0XHRpZiAoZGlmZnNbcG9pbnRlcl1bMF0gPT09IERJRkZfRVFVQUwpIHtcblx0XHRcdFx0XHRpZiAoZGlmZnNbcG9pbnRlcl1bMV0ubGVuZ3RoIDwgNCAmJiAocG9zdElucyB8fCBwb3N0RGVsKSkge1xuXHRcdFx0XHRcdFx0Ly8gQ2FuZGlkYXRlIGZvdW5kLlxuXHRcdFx0XHRcdFx0ZXF1YWxpdGllc1tlcXVhbGl0aWVzTGVuZ3RoKytdID0gcG9pbnRlcjtcblx0XHRcdFx0XHRcdHByZUlucyA9IHBvc3RJbnM7XG5cdFx0XHRcdFx0XHRwcmVEZWwgPSBwb3N0RGVsO1xuXHRcdFx0XHRcdFx0bGFzdGVxdWFsaXR5ID0gZGlmZnNbcG9pbnRlcl1bMV07XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIE5vdCBhIGNhbmRpZGF0ZSwgYW5kIGNhbiBuZXZlciBiZWNvbWUgb25lLlxuXHRcdFx0XHRcdFx0ZXF1YWxpdGllc0xlbmd0aCA9IDA7XG5cdFx0XHRcdFx0XHRsYXN0ZXF1YWxpdHkgPSBudWxsO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRwb3N0SW5zID0gcG9zdERlbCA9IGZhbHNlO1xuXG5cdFx0XHRcdFx0Ly8gQW4gaW5zZXJ0aW9uIG9yIGRlbGV0aW9uLlxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGlmIChkaWZmc1twb2ludGVyXVswXSA9PT0gRElGRl9ERUxFVEUpIHtcblx0XHRcdFx0XHRcdHBvc3REZWwgPSB0cnVlO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRwb3N0SW5zID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvKlxuICAgICAgICAgICAqIEZpdmUgdHlwZXMgdG8gYmUgc3BsaXQ6XG4gICAgICAgICAgICogPGlucz5BPC9pbnM+PGRlbD5CPC9kZWw+WFk8aW5zPkM8L2lucz48ZGVsPkQ8L2RlbD5cbiAgICAgICAgICAgKiA8aW5zPkE8L2lucz5YPGlucz5DPC9pbnM+PGRlbD5EPC9kZWw+XG4gICAgICAgICAgICogPGlucz5BPC9pbnM+PGRlbD5CPC9kZWw+WDxpbnM+QzwvaW5zPlxuICAgICAgICAgICAqIDxpbnM+QTwvZGVsPlg8aW5zPkM8L2lucz48ZGVsPkQ8L2RlbD5cbiAgICAgICAgICAgKiA8aW5zPkE8L2lucz48ZGVsPkI8L2RlbD5YPGRlbD5DPC9kZWw+XG4gICAgICAgICAgICovXG5cdFx0XHRcdFx0aWYgKGxhc3RlcXVhbGl0eSAmJiAocHJlSW5zICYmIHByZURlbCAmJiBwb3N0SW5zICYmIHBvc3REZWwgfHwgbGFzdGVxdWFsaXR5Lmxlbmd0aCA8IDIgJiYgcHJlSW5zICsgcHJlRGVsICsgcG9zdElucyArIHBvc3REZWwgPT09IDMpKSB7XG5cdFx0XHRcdFx0XHQvLyBEdXBsaWNhdGUgcmVjb3JkLlxuXHRcdFx0XHRcdFx0ZGlmZnMuc3BsaWNlKGVxdWFsaXRpZXNbZXF1YWxpdGllc0xlbmd0aCAtIDFdLCAwLCBbRElGRl9ERUxFVEUsIGxhc3RlcXVhbGl0eV0pO1xuXG5cdFx0XHRcdFx0XHQvLyBDaGFuZ2Ugc2Vjb25kIGNvcHkgdG8gaW5zZXJ0LlxuXHRcdFx0XHRcdFx0ZGlmZnNbZXF1YWxpdGllc1tlcXVhbGl0aWVzTGVuZ3RoIC0gMV0gKyAxXVswXSA9IERJRkZfSU5TRVJUO1xuXHRcdFx0XHRcdFx0ZXF1YWxpdGllc0xlbmd0aC0tOyAvLyBUaHJvdyBhd2F5IHRoZSBlcXVhbGl0eSB3ZSBqdXN0IGRlbGV0ZWQ7XG5cdFx0XHRcdFx0XHRsYXN0ZXF1YWxpdHkgPSBudWxsO1xuXHRcdFx0XHRcdFx0aWYgKHByZUlucyAmJiBwcmVEZWwpIHtcblx0XHRcdFx0XHRcdFx0Ly8gTm8gY2hhbmdlcyBtYWRlIHdoaWNoIGNvdWxkIGFmZmVjdCBwcmV2aW91cyBlbnRyeSwga2VlcCBnb2luZy5cblx0XHRcdFx0XHRcdFx0cG9zdElucyA9IHBvc3REZWwgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRlcXVhbGl0aWVzTGVuZ3RoID0gMDtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGVxdWFsaXRpZXNMZW5ndGgtLTsgLy8gVGhyb3cgYXdheSB0aGUgcHJldmlvdXMgZXF1YWxpdHkuXG5cdFx0XHRcdFx0XHRcdHBvaW50ZXIgPSBlcXVhbGl0aWVzTGVuZ3RoID4gMCA/IGVxdWFsaXRpZXNbZXF1YWxpdGllc0xlbmd0aCAtIDFdIDogLTE7XG5cdFx0XHRcdFx0XHRcdHBvc3RJbnMgPSBwb3N0RGVsID0gZmFsc2U7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjaGFuZ2VzID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cG9pbnRlcisrO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGNoYW5nZXMpIHtcblx0XHRcdFx0dGhpcy5kaWZmQ2xlYW51cE1lcmdlKGRpZmZzKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogQ29udmVydCBhIGRpZmYgYXJyYXkgaW50byBhIHByZXR0eSBIVE1MIHJlcG9ydC5cblx0XHQgKiBAcGFyYW0geyFBcnJheS48IURpZmZNYXRjaFBhdGNoLkRpZmY+fSBkaWZmcyBBcnJheSBvZiBkaWZmIHR1cGxlcy5cblx0XHQgKiBAcGFyYW0ge2ludGVnZXJ9IHN0cmluZyB0byBiZSBiZWF1dGlmaWVkLlxuXHRcdCAqIEByZXR1cm4ge3N0cmluZ30gSFRNTCByZXByZXNlbnRhdGlvbi5cblx0XHQgKi9cblx0XHREaWZmTWF0Y2hQYXRjaC5wcm90b3R5cGUuZGlmZlByZXR0eUh0bWwgPSBmdW5jdGlvbiAoZGlmZnMpIHtcblx0XHRcdHZhciBodG1sID0gW107XG5cdFx0XHRmb3IgKHZhciB4ID0gMDsgeCA8IGRpZmZzLmxlbmd0aDsgeCsrKSB7XG5cdFx0XHRcdHZhciBvcCA9IGRpZmZzW3hdWzBdOyAvLyBPcGVyYXRpb24gKGluc2VydCwgZGVsZXRlLCBlcXVhbClcblx0XHRcdFx0dmFyIGRhdGEgPSBkaWZmc1t4XVsxXTsgLy8gVGV4dCBvZiBjaGFuZ2UuXG5cdFx0XHRcdHN3aXRjaCAob3ApIHtcblx0XHRcdFx0XHRjYXNlIERJRkZfSU5TRVJUOlxuXHRcdFx0XHRcdFx0aHRtbFt4XSA9ICc8aW5zPicgKyBlc2NhcGVUZXh0KGRhdGEpICsgJzwvaW5zPic7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIERJRkZfREVMRVRFOlxuXHRcdFx0XHRcdFx0aHRtbFt4XSA9ICc8ZGVsPicgKyBlc2NhcGVUZXh0KGRhdGEpICsgJzwvZGVsPic7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIERJRkZfRVFVQUw6XG5cdFx0XHRcdFx0XHRodG1sW3hdID0gJzxzcGFuPicgKyBlc2NhcGVUZXh0KGRhdGEpICsgJzwvc3Bhbj4nO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBodG1sLmpvaW4oJycpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBEZXRlcm1pbmUgdGhlIGNvbW1vbiBwcmVmaXggb2YgdHdvIHN0cmluZ3MuXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQxIEZpcnN0IHN0cmluZy5cblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dDIgU2Vjb25kIHN0cmluZy5cblx0XHQgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBudW1iZXIgb2YgY2hhcmFjdGVycyBjb21tb24gdG8gdGhlIHN0YXJ0IG9mIGVhY2hcblx0XHQgKiAgICAgc3RyaW5nLlxuXHRcdCAqL1xuXHRcdERpZmZNYXRjaFBhdGNoLnByb3RvdHlwZS5kaWZmQ29tbW9uUHJlZml4ID0gZnVuY3Rpb24gKHRleHQxLCB0ZXh0Mikge1xuXHRcdFx0dmFyIHBvaW50ZXJtaWQsIHBvaW50ZXJtYXgsIHBvaW50ZXJtaW4sIHBvaW50ZXJzdGFydDtcblxuXHRcdFx0Ly8gUXVpY2sgY2hlY2sgZm9yIGNvbW1vbiBudWxsIGNhc2VzLlxuXHRcdFx0aWYgKCF0ZXh0MSB8fCAhdGV4dDIgfHwgdGV4dDEuY2hhckF0KDApICE9PSB0ZXh0Mi5jaGFyQXQoMCkpIHtcblx0XHRcdFx0cmV0dXJuIDA7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEJpbmFyeSBzZWFyY2guXG5cdFx0XHQvLyBQZXJmb3JtYW5jZSBhbmFseXNpczogaHR0cHM6Ly9uZWlsLmZyYXNlci5uYW1lL25ld3MvMjAwNy8xMC8wOS9cblx0XHRcdHBvaW50ZXJtaW4gPSAwO1xuXHRcdFx0cG9pbnRlcm1heCA9IE1hdGgubWluKHRleHQxLmxlbmd0aCwgdGV4dDIubGVuZ3RoKTtcblx0XHRcdHBvaW50ZXJtaWQgPSBwb2ludGVybWF4O1xuXHRcdFx0cG9pbnRlcnN0YXJ0ID0gMDtcblx0XHRcdHdoaWxlIChwb2ludGVybWluIDwgcG9pbnRlcm1pZCkge1xuXHRcdFx0XHRpZiAodGV4dDEuc3Vic3RyaW5nKHBvaW50ZXJzdGFydCwgcG9pbnRlcm1pZCkgPT09IHRleHQyLnN1YnN0cmluZyhwb2ludGVyc3RhcnQsIHBvaW50ZXJtaWQpKSB7XG5cdFx0XHRcdFx0cG9pbnRlcm1pbiA9IHBvaW50ZXJtaWQ7XG5cdFx0XHRcdFx0cG9pbnRlcnN0YXJ0ID0gcG9pbnRlcm1pbjtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRwb2ludGVybWF4ID0gcG9pbnRlcm1pZDtcblx0XHRcdFx0fVxuXHRcdFx0XHRwb2ludGVybWlkID0gTWF0aC5mbG9vcigocG9pbnRlcm1heCAtIHBvaW50ZXJtaW4pIC8gMiArIHBvaW50ZXJtaW4pO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHBvaW50ZXJtaWQ7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIERldGVybWluZSB0aGUgY29tbW9uIHN1ZmZpeCBvZiB0d28gc3RyaW5ncy5cblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dDEgRmlyc3Qgc3RyaW5nLlxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MiBTZWNvbmQgc3RyaW5nLlxuXHRcdCAqIEByZXR1cm4ge251bWJlcn0gVGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIGNvbW1vbiB0byB0aGUgZW5kIG9mIGVhY2ggc3RyaW5nLlxuXHRcdCAqL1xuXHRcdERpZmZNYXRjaFBhdGNoLnByb3RvdHlwZS5kaWZmQ29tbW9uU3VmZml4ID0gZnVuY3Rpb24gKHRleHQxLCB0ZXh0Mikge1xuXHRcdFx0dmFyIHBvaW50ZXJtaWQsIHBvaW50ZXJtYXgsIHBvaW50ZXJtaW4sIHBvaW50ZXJlbmQ7XG5cblx0XHRcdC8vIFF1aWNrIGNoZWNrIGZvciBjb21tb24gbnVsbCBjYXNlcy5cblx0XHRcdGlmICghdGV4dDEgfHwgIXRleHQyIHx8IHRleHQxLmNoYXJBdCh0ZXh0MS5sZW5ndGggLSAxKSAhPT0gdGV4dDIuY2hhckF0KHRleHQyLmxlbmd0aCAtIDEpKSB7XG5cdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBCaW5hcnkgc2VhcmNoLlxuXHRcdFx0Ly8gUGVyZm9ybWFuY2UgYW5hbHlzaXM6IGh0dHBzOi8vbmVpbC5mcmFzZXIubmFtZS9uZXdzLzIwMDcvMTAvMDkvXG5cdFx0XHRwb2ludGVybWluID0gMDtcblx0XHRcdHBvaW50ZXJtYXggPSBNYXRoLm1pbih0ZXh0MS5sZW5ndGgsIHRleHQyLmxlbmd0aCk7XG5cdFx0XHRwb2ludGVybWlkID0gcG9pbnRlcm1heDtcblx0XHRcdHBvaW50ZXJlbmQgPSAwO1xuXHRcdFx0d2hpbGUgKHBvaW50ZXJtaW4gPCBwb2ludGVybWlkKSB7XG5cdFx0XHRcdGlmICh0ZXh0MS5zdWJzdHJpbmcodGV4dDEubGVuZ3RoIC0gcG9pbnRlcm1pZCwgdGV4dDEubGVuZ3RoIC0gcG9pbnRlcmVuZCkgPT09IHRleHQyLnN1YnN0cmluZyh0ZXh0Mi5sZW5ndGggLSBwb2ludGVybWlkLCB0ZXh0Mi5sZW5ndGggLSBwb2ludGVyZW5kKSkge1xuXHRcdFx0XHRcdHBvaW50ZXJtaW4gPSBwb2ludGVybWlkO1xuXHRcdFx0XHRcdHBvaW50ZXJlbmQgPSBwb2ludGVybWluO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHBvaW50ZXJtYXggPSBwb2ludGVybWlkO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHBvaW50ZXJtaWQgPSBNYXRoLmZsb29yKChwb2ludGVybWF4IC0gcG9pbnRlcm1pbikgLyAyICsgcG9pbnRlcm1pbik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcG9pbnRlcm1pZDtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogRmluZCB0aGUgZGlmZmVyZW5jZXMgYmV0d2VlbiB0d28gdGV4dHMuICBBc3N1bWVzIHRoYXQgdGhlIHRleHRzIGRvIG5vdFxuXHRcdCAqIGhhdmUgYW55IGNvbW1vbiBwcmVmaXggb3Igc3VmZml4LlxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MSBPbGQgc3RyaW5nIHRvIGJlIGRpZmZlZC5cblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dDIgTmV3IHN0cmluZyB0byBiZSBkaWZmZWQuXG5cdFx0ICogQHBhcmFtIHtib29sZWFufSBjaGVja2xpbmVzIFNwZWVkdXAgZmxhZy4gIElmIGZhbHNlLCB0aGVuIGRvbid0IHJ1biBhXG5cdFx0ICogICAgIGxpbmUtbGV2ZWwgZGlmZiBmaXJzdCB0byBpZGVudGlmeSB0aGUgY2hhbmdlZCBhcmVhcy5cblx0XHQgKiAgICAgSWYgdHJ1ZSwgdGhlbiBydW4gYSBmYXN0ZXIsIHNsaWdodGx5IGxlc3Mgb3B0aW1hbCBkaWZmLlxuXHRcdCAqIEBwYXJhbSB7bnVtYmVyfSBkZWFkbGluZSBUaW1lIHdoZW4gdGhlIGRpZmYgc2hvdWxkIGJlIGNvbXBsZXRlIGJ5LlxuXHRcdCAqIEByZXR1cm4geyFBcnJheS48IURpZmZNYXRjaFBhdGNoLkRpZmY+fSBBcnJheSBvZiBkaWZmIHR1cGxlcy5cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdERpZmZNYXRjaFBhdGNoLnByb3RvdHlwZS5kaWZmQ29tcHV0ZSA9IGZ1bmN0aW9uICh0ZXh0MSwgdGV4dDIsIGNoZWNrbGluZXMsIGRlYWRsaW5lKSB7XG5cdFx0XHR2YXIgZGlmZnMsIGxvbmd0ZXh0LCBzaG9ydHRleHQsIGksIGhtLCB0ZXh0MUEsIHRleHQyQSwgdGV4dDFCLCB0ZXh0MkIsIG1pZENvbW1vbiwgZGlmZnNBLCBkaWZmc0I7XG5cdFx0XHRpZiAoIXRleHQxKSB7XG5cdFx0XHRcdC8vIEp1c3QgYWRkIHNvbWUgdGV4dCAoc3BlZWR1cCkuXG5cdFx0XHRcdHJldHVybiBbW0RJRkZfSU5TRVJULCB0ZXh0Ml1dO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCF0ZXh0Mikge1xuXHRcdFx0XHQvLyBKdXN0IGRlbGV0ZSBzb21lIHRleHQgKHNwZWVkdXApLlxuXHRcdFx0XHRyZXR1cm4gW1tESUZGX0RFTEVURSwgdGV4dDFdXTtcblx0XHRcdH1cblx0XHRcdGxvbmd0ZXh0ID0gdGV4dDEubGVuZ3RoID4gdGV4dDIubGVuZ3RoID8gdGV4dDEgOiB0ZXh0Mjtcblx0XHRcdHNob3J0dGV4dCA9IHRleHQxLmxlbmd0aCA+IHRleHQyLmxlbmd0aCA/IHRleHQyIDogdGV4dDE7XG5cdFx0XHRpID0gbG9uZ3RleHQuaW5kZXhPZihzaG9ydHRleHQpO1xuXHRcdFx0aWYgKGkgIT09IC0xKSB7XG5cdFx0XHRcdC8vIFNob3J0ZXIgdGV4dCBpcyBpbnNpZGUgdGhlIGxvbmdlciB0ZXh0IChzcGVlZHVwKS5cblx0XHRcdFx0ZGlmZnMgPSBbW0RJRkZfSU5TRVJULCBsb25ndGV4dC5zdWJzdHJpbmcoMCwgaSldLCBbRElGRl9FUVVBTCwgc2hvcnR0ZXh0XSwgW0RJRkZfSU5TRVJULCBsb25ndGV4dC5zdWJzdHJpbmcoaSArIHNob3J0dGV4dC5sZW5ndGgpXV07XG5cblx0XHRcdFx0Ly8gU3dhcCBpbnNlcnRpb25zIGZvciBkZWxldGlvbnMgaWYgZGlmZiBpcyByZXZlcnNlZC5cblx0XHRcdFx0aWYgKHRleHQxLmxlbmd0aCA+IHRleHQyLmxlbmd0aCkge1xuXHRcdFx0XHRcdGRpZmZzWzBdWzBdID0gZGlmZnNbMl1bMF0gPSBESUZGX0RFTEVURTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gZGlmZnM7XG5cdFx0XHR9XG5cdFx0XHRpZiAoc2hvcnR0ZXh0Lmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHQvLyBTaW5nbGUgY2hhcmFjdGVyIHN0cmluZy5cblx0XHRcdFx0Ly8gQWZ0ZXIgdGhlIHByZXZpb3VzIHNwZWVkdXAsIHRoZSBjaGFyYWN0ZXIgY2FuJ3QgYmUgYW4gZXF1YWxpdHkuXG5cdFx0XHRcdHJldHVybiBbW0RJRkZfREVMRVRFLCB0ZXh0MV0sIFtESUZGX0lOU0VSVCwgdGV4dDJdXTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQ2hlY2sgdG8gc2VlIGlmIHRoZSBwcm9ibGVtIGNhbiBiZSBzcGxpdCBpbiB0d28uXG5cdFx0XHRobSA9IHRoaXMuZGlmZkhhbGZNYXRjaCh0ZXh0MSwgdGV4dDIpO1xuXHRcdFx0aWYgKGhtKSB7XG5cdFx0XHRcdC8vIEEgaGFsZi1tYXRjaCB3YXMgZm91bmQsIHNvcnQgb3V0IHRoZSByZXR1cm4gZGF0YS5cblx0XHRcdFx0dGV4dDFBID0gaG1bMF07XG5cdFx0XHRcdHRleHQxQiA9IGhtWzFdO1xuXHRcdFx0XHR0ZXh0MkEgPSBobVsyXTtcblx0XHRcdFx0dGV4dDJCID0gaG1bM107XG5cdFx0XHRcdG1pZENvbW1vbiA9IGhtWzRdO1xuXG5cdFx0XHRcdC8vIFNlbmQgYm90aCBwYWlycyBvZmYgZm9yIHNlcGFyYXRlIHByb2Nlc3NpbmcuXG5cdFx0XHRcdGRpZmZzQSA9IHRoaXMuRGlmZk1haW4odGV4dDFBLCB0ZXh0MkEsIGNoZWNrbGluZXMsIGRlYWRsaW5lKTtcblx0XHRcdFx0ZGlmZnNCID0gdGhpcy5EaWZmTWFpbih0ZXh0MUIsIHRleHQyQiwgY2hlY2tsaW5lcywgZGVhZGxpbmUpO1xuXG5cdFx0XHRcdC8vIE1lcmdlIHRoZSByZXN1bHRzLlxuXHRcdFx0XHRyZXR1cm4gZGlmZnNBLmNvbmNhdChbW0RJRkZfRVFVQUwsIG1pZENvbW1vbl1dLCBkaWZmc0IpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGNoZWNrbGluZXMgJiYgdGV4dDEubGVuZ3RoID4gMTAwICYmIHRleHQyLmxlbmd0aCA+IDEwMCkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5kaWZmTGluZU1vZGUodGV4dDEsIHRleHQyLCBkZWFkbGluZSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGhpcy5kaWZmQmlzZWN0KHRleHQxLCB0ZXh0MiwgZGVhZGxpbmUpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBEbyB0aGUgdHdvIHRleHRzIHNoYXJlIGEgc3Vic3RyaW5nIHdoaWNoIGlzIGF0IGxlYXN0IGhhbGYgdGhlIGxlbmd0aCBvZiB0aGVcblx0XHQgKiBsb25nZXIgdGV4dD9cblx0XHQgKiBUaGlzIHNwZWVkdXAgY2FuIHByb2R1Y2Ugbm9uLW1pbmltYWwgZGlmZnMuXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQxIEZpcnN0IHN0cmluZy5cblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dDIgU2Vjb25kIHN0cmluZy5cblx0XHQgKiBAcmV0dXJuIHtBcnJheS48c3RyaW5nPn0gRml2ZSBlbGVtZW50IEFycmF5LCBjb250YWluaW5nIHRoZSBwcmVmaXggb2Zcblx0XHQgKiAgICAgdGV4dDEsIHRoZSBzdWZmaXggb2YgdGV4dDEsIHRoZSBwcmVmaXggb2YgdGV4dDIsIHRoZSBzdWZmaXggb2Zcblx0XHQgKiAgICAgdGV4dDIgYW5kIHRoZSBjb21tb24gbWlkZGxlLiAgT3IgbnVsbCBpZiB0aGVyZSB3YXMgbm8gbWF0Y2guXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHREaWZmTWF0Y2hQYXRjaC5wcm90b3R5cGUuZGlmZkhhbGZNYXRjaCA9IGZ1bmN0aW9uICh0ZXh0MSwgdGV4dDIpIHtcblx0XHRcdHZhciBsb25ndGV4dCwgc2hvcnR0ZXh0LCBkbXAsIHRleHQxQSwgdGV4dDJCLCB0ZXh0MkEsIHRleHQxQiwgbWlkQ29tbW9uLCBobTEsIGhtMiwgaG07XG5cdFx0XHRsb25ndGV4dCA9IHRleHQxLmxlbmd0aCA+IHRleHQyLmxlbmd0aCA/IHRleHQxIDogdGV4dDI7XG5cdFx0XHRzaG9ydHRleHQgPSB0ZXh0MS5sZW5ndGggPiB0ZXh0Mi5sZW5ndGggPyB0ZXh0MiA6IHRleHQxO1xuXHRcdFx0aWYgKGxvbmd0ZXh0Lmxlbmd0aCA8IDQgfHwgc2hvcnR0ZXh0Lmxlbmd0aCAqIDIgPCBsb25ndGV4dC5sZW5ndGgpIHtcblx0XHRcdFx0cmV0dXJuIG51bGw7IC8vIFBvaW50bGVzcy5cblx0XHRcdH1cblxuXHRcdFx0ZG1wID0gdGhpczsgLy8gJ3RoaXMnIGJlY29tZXMgJ3dpbmRvdycgaW4gYSBjbG9zdXJlLlxuXG5cdFx0XHQvKipcblx0XHRcdCAqIERvZXMgYSBzdWJzdHJpbmcgb2Ygc2hvcnR0ZXh0IGV4aXN0IHdpdGhpbiBsb25ndGV4dCBzdWNoIHRoYXQgdGhlIHN1YnN0cmluZ1xuXHRcdFx0ICogaXMgYXQgbGVhc3QgaGFsZiB0aGUgbGVuZ3RoIG9mIGxvbmd0ZXh0P1xuXHRcdFx0ICogQ2xvc3VyZSwgYnV0IGRvZXMgbm90IHJlZmVyZW5jZSBhbnkgZXh0ZXJuYWwgdmFyaWFibGVzLlxuXHRcdFx0ICogQHBhcmFtIHtzdHJpbmd9IGxvbmd0ZXh0IExvbmdlciBzdHJpbmcuXG5cdFx0XHQgKiBAcGFyYW0ge3N0cmluZ30gc2hvcnR0ZXh0IFNob3J0ZXIgc3RyaW5nLlxuXHRcdFx0ICogQHBhcmFtIHtudW1iZXJ9IGkgU3RhcnQgaW5kZXggb2YgcXVhcnRlciBsZW5ndGggc3Vic3RyaW5nIHdpdGhpbiBsb25ndGV4dC5cblx0XHRcdCAqIEByZXR1cm4ge0FycmF5LjxzdHJpbmc+fSBGaXZlIGVsZW1lbnQgQXJyYXksIGNvbnRhaW5pbmcgdGhlIHByZWZpeCBvZlxuXHRcdFx0ICogICAgIGxvbmd0ZXh0LCB0aGUgc3VmZml4IG9mIGxvbmd0ZXh0LCB0aGUgcHJlZml4IG9mIHNob3J0dGV4dCwgdGhlIHN1ZmZpeFxuXHRcdFx0ICogICAgIG9mIHNob3J0dGV4dCBhbmQgdGhlIGNvbW1vbiBtaWRkbGUuICBPciBudWxsIGlmIHRoZXJlIHdhcyBubyBtYXRjaC5cblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIGRpZmZIYWxmTWF0Y2hJKGxvbmd0ZXh0LCBzaG9ydHRleHQsIGkpIHtcblx0XHRcdFx0dmFyIHNlZWQsIGosIGJlc3RDb21tb24sIHByZWZpeExlbmd0aCwgc3VmZml4TGVuZ3RoLCBiZXN0TG9uZ3RleHRBLCBiZXN0TG9uZ3RleHRCLCBiZXN0U2hvcnR0ZXh0QSwgYmVzdFNob3J0dGV4dEI7XG5cblx0XHRcdFx0Ly8gU3RhcnQgd2l0aCBhIDEvNCBsZW5ndGggc3Vic3RyaW5nIGF0IHBvc2l0aW9uIGkgYXMgYSBzZWVkLlxuXHRcdFx0XHRzZWVkID0gbG9uZ3RleHQuc3Vic3RyaW5nKGksIGkgKyBNYXRoLmZsb29yKGxvbmd0ZXh0Lmxlbmd0aCAvIDQpKTtcblx0XHRcdFx0aiA9IC0xO1xuXHRcdFx0XHRiZXN0Q29tbW9uID0gJyc7XG5cdFx0XHRcdHdoaWxlICgoaiA9IHNob3J0dGV4dC5pbmRleE9mKHNlZWQsIGogKyAxKSkgIT09IC0xKSB7XG5cdFx0XHRcdFx0cHJlZml4TGVuZ3RoID0gZG1wLmRpZmZDb21tb25QcmVmaXgobG9uZ3RleHQuc3Vic3RyaW5nKGkpLCBzaG9ydHRleHQuc3Vic3RyaW5nKGopKTtcblx0XHRcdFx0XHRzdWZmaXhMZW5ndGggPSBkbXAuZGlmZkNvbW1vblN1ZmZpeChsb25ndGV4dC5zdWJzdHJpbmcoMCwgaSksIHNob3J0dGV4dC5zdWJzdHJpbmcoMCwgaikpO1xuXHRcdFx0XHRcdGlmIChiZXN0Q29tbW9uLmxlbmd0aCA8IHN1ZmZpeExlbmd0aCArIHByZWZpeExlbmd0aCkge1xuXHRcdFx0XHRcdFx0YmVzdENvbW1vbiA9IHNob3J0dGV4dC5zdWJzdHJpbmcoaiAtIHN1ZmZpeExlbmd0aCwgaikgKyBzaG9ydHRleHQuc3Vic3RyaW5nKGosIGogKyBwcmVmaXhMZW5ndGgpO1xuXHRcdFx0XHRcdFx0YmVzdExvbmd0ZXh0QSA9IGxvbmd0ZXh0LnN1YnN0cmluZygwLCBpIC0gc3VmZml4TGVuZ3RoKTtcblx0XHRcdFx0XHRcdGJlc3RMb25ndGV4dEIgPSBsb25ndGV4dC5zdWJzdHJpbmcoaSArIHByZWZpeExlbmd0aCk7XG5cdFx0XHRcdFx0XHRiZXN0U2hvcnR0ZXh0QSA9IHNob3J0dGV4dC5zdWJzdHJpbmcoMCwgaiAtIHN1ZmZpeExlbmd0aCk7XG5cdFx0XHRcdFx0XHRiZXN0U2hvcnR0ZXh0QiA9IHNob3J0dGV4dC5zdWJzdHJpbmcoaiArIHByZWZpeExlbmd0aCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChiZXN0Q29tbW9uLmxlbmd0aCAqIDIgPj0gbG9uZ3RleHQubGVuZ3RoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFtiZXN0TG9uZ3RleHRBLCBiZXN0TG9uZ3RleHRCLCBiZXN0U2hvcnR0ZXh0QSwgYmVzdFNob3J0dGV4dEIsIGJlc3RDb21tb25dO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIEZpcnN0IGNoZWNrIGlmIHRoZSBzZWNvbmQgcXVhcnRlciBpcyB0aGUgc2VlZCBmb3IgYSBoYWxmLW1hdGNoLlxuXHRcdFx0aG0xID0gZGlmZkhhbGZNYXRjaEkobG9uZ3RleHQsIHNob3J0dGV4dCwgTWF0aC5jZWlsKGxvbmd0ZXh0Lmxlbmd0aCAvIDQpKTtcblxuXHRcdFx0Ly8gQ2hlY2sgYWdhaW4gYmFzZWQgb24gdGhlIHRoaXJkIHF1YXJ0ZXIuXG5cdFx0XHRobTIgPSBkaWZmSGFsZk1hdGNoSShsb25ndGV4dCwgc2hvcnR0ZXh0LCBNYXRoLmNlaWwobG9uZ3RleHQubGVuZ3RoIC8gMikpO1xuXHRcdFx0aWYgKCFobTEgJiYgIWhtMikge1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH0gZWxzZSBpZiAoIWhtMikge1xuXHRcdFx0XHRobSA9IGhtMTtcblx0XHRcdH0gZWxzZSBpZiAoIWhtMSkge1xuXHRcdFx0XHRobSA9IGhtMjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIEJvdGggbWF0Y2hlZC4gIFNlbGVjdCB0aGUgbG9uZ2VzdC5cblx0XHRcdFx0aG0gPSBobTFbNF0ubGVuZ3RoID4gaG0yWzRdLmxlbmd0aCA/IGhtMSA6IGhtMjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQSBoYWxmLW1hdGNoIHdhcyBmb3VuZCwgc29ydCBvdXQgdGhlIHJldHVybiBkYXRhLlxuXHRcdFx0aWYgKHRleHQxLmxlbmd0aCA+IHRleHQyLmxlbmd0aCkge1xuXHRcdFx0XHR0ZXh0MUEgPSBobVswXTtcblx0XHRcdFx0dGV4dDFCID0gaG1bMV07XG5cdFx0XHRcdHRleHQyQSA9IGhtWzJdO1xuXHRcdFx0XHR0ZXh0MkIgPSBobVszXTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRleHQyQSA9IGhtWzBdO1xuXHRcdFx0XHR0ZXh0MkIgPSBobVsxXTtcblx0XHRcdFx0dGV4dDFBID0gaG1bMl07XG5cdFx0XHRcdHRleHQxQiA9IGhtWzNdO1xuXHRcdFx0fVxuXHRcdFx0bWlkQ29tbW9uID0gaG1bNF07XG5cdFx0XHRyZXR1cm4gW3RleHQxQSwgdGV4dDFCLCB0ZXh0MkEsIHRleHQyQiwgbWlkQ29tbW9uXTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogRG8gYSBxdWljayBsaW5lLWxldmVsIGRpZmYgb24gYm90aCBzdHJpbmdzLCB0aGVuIHJlZGlmZiB0aGUgcGFydHMgZm9yXG5cdFx0ICogZ3JlYXRlciBhY2N1cmFjeS5cblx0XHQgKiBUaGlzIHNwZWVkdXAgY2FuIHByb2R1Y2Ugbm9uLW1pbmltYWwgZGlmZnMuXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQxIE9sZCBzdHJpbmcgdG8gYmUgZGlmZmVkLlxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MiBOZXcgc3RyaW5nIHRvIGJlIGRpZmZlZC5cblx0XHQgKiBAcGFyYW0ge251bWJlcn0gZGVhZGxpbmUgVGltZSB3aGVuIHRoZSBkaWZmIHNob3VsZCBiZSBjb21wbGV0ZSBieS5cblx0XHQgKiBAcmV0dXJuIHshQXJyYXkuPCFEaWZmTWF0Y2hQYXRjaC5EaWZmPn0gQXJyYXkgb2YgZGlmZiB0dXBsZXMuXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHREaWZmTWF0Y2hQYXRjaC5wcm90b3R5cGUuZGlmZkxpbmVNb2RlID0gZnVuY3Rpb24gKHRleHQxLCB0ZXh0MiwgZGVhZGxpbmUpIHtcblx0XHRcdHZhciBhLCBkaWZmcywgbGluZWFycmF5LCBwb2ludGVyLCBjb3VudEluc2VydCwgY291bnREZWxldGUsIHRleHRJbnNlcnQsIHRleHREZWxldGUsIGo7XG5cblx0XHRcdC8vIFNjYW4gdGhlIHRleHQgb24gYSBsaW5lLWJ5LWxpbmUgYmFzaXMgZmlyc3QuXG5cdFx0XHRhID0gdGhpcy5kaWZmTGluZXNUb0NoYXJzKHRleHQxLCB0ZXh0Mik7XG5cdFx0XHR0ZXh0MSA9IGEuY2hhcnMxO1xuXHRcdFx0dGV4dDIgPSBhLmNoYXJzMjtcblx0XHRcdGxpbmVhcnJheSA9IGEubGluZUFycmF5O1xuXHRcdFx0ZGlmZnMgPSB0aGlzLkRpZmZNYWluKHRleHQxLCB0ZXh0MiwgZmFsc2UsIGRlYWRsaW5lKTtcblxuXHRcdFx0Ly8gQ29udmVydCB0aGUgZGlmZiBiYWNrIHRvIG9yaWdpbmFsIHRleHQuXG5cdFx0XHR0aGlzLmRpZmZDaGFyc1RvTGluZXMoZGlmZnMsIGxpbmVhcnJheSk7XG5cblx0XHRcdC8vIEVsaW1pbmF0ZSBmcmVhayBtYXRjaGVzIChlLmcuIGJsYW5rIGxpbmVzKVxuXHRcdFx0dGhpcy5kaWZmQ2xlYW51cFNlbWFudGljKGRpZmZzKTtcblxuXHRcdFx0Ly8gUmVkaWZmIGFueSByZXBsYWNlbWVudCBibG9ja3MsIHRoaXMgdGltZSBjaGFyYWN0ZXItYnktY2hhcmFjdGVyLlxuXHRcdFx0Ly8gQWRkIGEgZHVtbXkgZW50cnkgYXQgdGhlIGVuZC5cblx0XHRcdGRpZmZzLnB1c2goW0RJRkZfRVFVQUwsICcnXSk7XG5cdFx0XHRwb2ludGVyID0gMDtcblx0XHRcdGNvdW50RGVsZXRlID0gMDtcblx0XHRcdGNvdW50SW5zZXJ0ID0gMDtcblx0XHRcdHRleHREZWxldGUgPSAnJztcblx0XHRcdHRleHRJbnNlcnQgPSAnJztcblx0XHRcdHdoaWxlIChwb2ludGVyIDwgZGlmZnMubGVuZ3RoKSB7XG5cdFx0XHRcdHN3aXRjaCAoZGlmZnNbcG9pbnRlcl1bMF0pIHtcblx0XHRcdFx0XHRjYXNlIERJRkZfSU5TRVJUOlxuXHRcdFx0XHRcdFx0Y291bnRJbnNlcnQrKztcblx0XHRcdFx0XHRcdHRleHRJbnNlcnQgKz0gZGlmZnNbcG9pbnRlcl1bMV07XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIERJRkZfREVMRVRFOlxuXHRcdFx0XHRcdFx0Y291bnREZWxldGUrKztcblx0XHRcdFx0XHRcdHRleHREZWxldGUgKz0gZGlmZnNbcG9pbnRlcl1bMV07XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIERJRkZfRVFVQUw6XG5cdFx0XHRcdFx0XHQvLyBVcG9uIHJlYWNoaW5nIGFuIGVxdWFsaXR5LCBjaGVjayBmb3IgcHJpb3IgcmVkdW5kYW5jaWVzLlxuXHRcdFx0XHRcdFx0aWYgKGNvdW50RGVsZXRlID49IDEgJiYgY291bnRJbnNlcnQgPj0gMSkge1xuXHRcdFx0XHRcdFx0XHQvLyBEZWxldGUgdGhlIG9mZmVuZGluZyByZWNvcmRzIGFuZCBhZGQgdGhlIG1lcmdlZCBvbmVzLlxuXHRcdFx0XHRcdFx0XHRkaWZmcy5zcGxpY2UocG9pbnRlciAtIGNvdW50RGVsZXRlIC0gY291bnRJbnNlcnQsIGNvdW50RGVsZXRlICsgY291bnRJbnNlcnQpO1xuXHRcdFx0XHRcdFx0XHRwb2ludGVyID0gcG9pbnRlciAtIGNvdW50RGVsZXRlIC0gY291bnRJbnNlcnQ7XG5cdFx0XHRcdFx0XHRcdGEgPSB0aGlzLkRpZmZNYWluKHRleHREZWxldGUsIHRleHRJbnNlcnQsIGZhbHNlLCBkZWFkbGluZSk7XG5cdFx0XHRcdFx0XHRcdGZvciAoaiA9IGEubGVuZ3RoIC0gMTsgaiA+PSAwOyBqLS0pIHtcblx0XHRcdFx0XHRcdFx0XHRkaWZmcy5zcGxpY2UocG9pbnRlciwgMCwgYVtqXSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0cG9pbnRlciA9IHBvaW50ZXIgKyBhLmxlbmd0aDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNvdW50SW5zZXJ0ID0gMDtcblx0XHRcdFx0XHRcdGNvdW50RGVsZXRlID0gMDtcblx0XHRcdFx0XHRcdHRleHREZWxldGUgPSAnJztcblx0XHRcdFx0XHRcdHRleHRJbnNlcnQgPSAnJztcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHBvaW50ZXIrKztcblx0XHRcdH1cblx0XHRcdGRpZmZzLnBvcCgpOyAvLyBSZW1vdmUgdGhlIGR1bW15IGVudHJ5IGF0IHRoZSBlbmQuXG5cblx0XHRcdHJldHVybiBkaWZmcztcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogRmluZCB0aGUgJ21pZGRsZSBzbmFrZScgb2YgYSBkaWZmLCBzcGxpdCB0aGUgcHJvYmxlbSBpbiB0d29cblx0XHQgKiBhbmQgcmV0dXJuIHRoZSByZWN1cnNpdmVseSBjb25zdHJ1Y3RlZCBkaWZmLlxuXHRcdCAqIFNlZSBNeWVycyAxOTg2IHBhcGVyOiBBbiBPKE5EKSBEaWZmZXJlbmNlIEFsZ29yaXRobSBhbmQgSXRzIFZhcmlhdGlvbnMuXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQxIE9sZCBzdHJpbmcgdG8gYmUgZGlmZmVkLlxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MiBOZXcgc3RyaW5nIHRvIGJlIGRpZmZlZC5cblx0XHQgKiBAcGFyYW0ge251bWJlcn0gZGVhZGxpbmUgVGltZSBhdCB3aGljaCB0byBiYWlsIGlmIG5vdCB5ZXQgY29tcGxldGUuXG5cdFx0ICogQHJldHVybiB7IUFycmF5LjwhRGlmZk1hdGNoUGF0Y2guRGlmZj59IEFycmF5IG9mIGRpZmYgdHVwbGVzLlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0RGlmZk1hdGNoUGF0Y2gucHJvdG90eXBlLmRpZmZCaXNlY3QgPSBmdW5jdGlvbiAodGV4dDEsIHRleHQyLCBkZWFkbGluZSkge1xuXHRcdFx0dmFyIHRleHQxTGVuZ3RoLCB0ZXh0Mkxlbmd0aCwgbWF4RCwgdk9mZnNldCwgdkxlbmd0aCwgdjEsIHYyLCB4LCBkZWx0YSwgZnJvbnQsIGsxc3RhcnQsIGsxZW5kLCBrMnN0YXJ0LCBrMmVuZCwgazJPZmZzZXQsIGsxT2Zmc2V0LCB4MSwgeDIsIHkxLCB5MiwgZCwgazEsIGsyO1xuXG5cdFx0XHQvLyBDYWNoZSB0aGUgdGV4dCBsZW5ndGhzIHRvIHByZXZlbnQgbXVsdGlwbGUgY2FsbHMuXG5cdFx0XHR0ZXh0MUxlbmd0aCA9IHRleHQxLmxlbmd0aDtcblx0XHRcdHRleHQyTGVuZ3RoID0gdGV4dDIubGVuZ3RoO1xuXHRcdFx0bWF4RCA9IE1hdGguY2VpbCgodGV4dDFMZW5ndGggKyB0ZXh0Mkxlbmd0aCkgLyAyKTtcblx0XHRcdHZPZmZzZXQgPSBtYXhEO1xuXHRcdFx0dkxlbmd0aCA9IDIgKiBtYXhEO1xuXHRcdFx0djEgPSBuZXcgQXJyYXkodkxlbmd0aCk7XG5cdFx0XHR2MiA9IG5ldyBBcnJheSh2TGVuZ3RoKTtcblxuXHRcdFx0Ly8gU2V0dGluZyBhbGwgZWxlbWVudHMgdG8gLTEgaXMgZmFzdGVyIGluIENocm9tZSAmIEZpcmVmb3ggdGhhbiBtaXhpbmdcblx0XHRcdC8vIGludGVnZXJzIGFuZCB1bmRlZmluZWQuXG5cdFx0XHRmb3IgKHggPSAwOyB4IDwgdkxlbmd0aDsgeCsrKSB7XG5cdFx0XHRcdHYxW3hdID0gLTE7XG5cdFx0XHRcdHYyW3hdID0gLTE7XG5cdFx0XHR9XG5cdFx0XHR2MVt2T2Zmc2V0ICsgMV0gPSAwO1xuXHRcdFx0djJbdk9mZnNldCArIDFdID0gMDtcblx0XHRcdGRlbHRhID0gdGV4dDFMZW5ndGggLSB0ZXh0Mkxlbmd0aDtcblxuXHRcdFx0Ly8gSWYgdGhlIHRvdGFsIG51bWJlciBvZiBjaGFyYWN0ZXJzIGlzIG9kZCwgdGhlbiB0aGUgZnJvbnQgcGF0aCB3aWxsIGNvbGxpZGVcblx0XHRcdC8vIHdpdGggdGhlIHJldmVyc2UgcGF0aC5cblx0XHRcdGZyb250ID0gZGVsdGEgJSAyICE9PSAwO1xuXG5cdFx0XHQvLyBPZmZzZXRzIGZvciBzdGFydCBhbmQgZW5kIG9mIGsgbG9vcC5cblx0XHRcdC8vIFByZXZlbnRzIG1hcHBpbmcgb2Ygc3BhY2UgYmV5b25kIHRoZSBncmlkLlxuXHRcdFx0azFzdGFydCA9IDA7XG5cdFx0XHRrMWVuZCA9IDA7XG5cdFx0XHRrMnN0YXJ0ID0gMDtcblx0XHRcdGsyZW5kID0gMDtcblx0XHRcdGZvciAoZCA9IDA7IGQgPCBtYXhEOyBkKyspIHtcblx0XHRcdFx0Ly8gQmFpbCBvdXQgaWYgZGVhZGxpbmUgaXMgcmVhY2hlZC5cblx0XHRcdFx0aWYgKERhdGUubm93KCkgPiBkZWFkbGluZSkge1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gV2FsayB0aGUgZnJvbnQgcGF0aCBvbmUgc3RlcC5cblx0XHRcdFx0Zm9yIChrMSA9IC1kICsgazFzdGFydDsgazEgPD0gZCAtIGsxZW5kOyBrMSArPSAyKSB7XG5cdFx0XHRcdFx0azFPZmZzZXQgPSB2T2Zmc2V0ICsgazE7XG5cdFx0XHRcdFx0aWYgKGsxID09PSAtZCB8fCBrMSAhPT0gZCAmJiB2MVtrMU9mZnNldCAtIDFdIDwgdjFbazFPZmZzZXQgKyAxXSkge1xuXHRcdFx0XHRcdFx0eDEgPSB2MVtrMU9mZnNldCArIDFdO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR4MSA9IHYxW2sxT2Zmc2V0IC0gMV0gKyAxO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR5MSA9IHgxIC0gazE7XG5cdFx0XHRcdFx0d2hpbGUgKHgxIDwgdGV4dDFMZW5ndGggJiYgeTEgPCB0ZXh0Mkxlbmd0aCAmJiB0ZXh0MS5jaGFyQXQoeDEpID09PSB0ZXh0Mi5jaGFyQXQoeTEpKSB7XG5cdFx0XHRcdFx0XHR4MSsrO1xuXHRcdFx0XHRcdFx0eTErKztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0djFbazFPZmZzZXRdID0geDE7XG5cdFx0XHRcdFx0aWYgKHgxID4gdGV4dDFMZW5ndGgpIHtcblx0XHRcdFx0XHRcdC8vIFJhbiBvZmYgdGhlIHJpZ2h0IG9mIHRoZSBncmFwaC5cblx0XHRcdFx0XHRcdGsxZW5kICs9IDI7XG5cdFx0XHRcdFx0fSBlbHNlIGlmICh5MSA+IHRleHQyTGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHQvLyBSYW4gb2ZmIHRoZSBib3R0b20gb2YgdGhlIGdyYXBoLlxuXHRcdFx0XHRcdFx0azFzdGFydCArPSAyO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoZnJvbnQpIHtcblx0XHRcdFx0XHRcdGsyT2Zmc2V0ID0gdk9mZnNldCArIGRlbHRhIC0gazE7XG5cdFx0XHRcdFx0XHRpZiAoazJPZmZzZXQgPj0gMCAmJiBrMk9mZnNldCA8IHZMZW5ndGggJiYgdjJbazJPZmZzZXRdICE9PSAtMSkge1xuXHRcdFx0XHRcdFx0XHQvLyBNaXJyb3IgeDIgb250byB0b3AtbGVmdCBjb29yZGluYXRlIHN5c3RlbS5cblx0XHRcdFx0XHRcdFx0eDIgPSB0ZXh0MUxlbmd0aCAtIHYyW2syT2Zmc2V0XTtcblx0XHRcdFx0XHRcdFx0aWYgKHgxID49IHgyKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gT3ZlcmxhcCBkZXRlY3RlZC5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdGhpcy5kaWZmQmlzZWN0U3BsaXQodGV4dDEsIHRleHQyLCB4MSwgeTEsIGRlYWRsaW5lKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFdhbGsgdGhlIHJldmVyc2UgcGF0aCBvbmUgc3RlcC5cblx0XHRcdFx0Zm9yIChrMiA9IC1kICsgazJzdGFydDsgazIgPD0gZCAtIGsyZW5kOyBrMiArPSAyKSB7XG5cdFx0XHRcdFx0azJPZmZzZXQgPSB2T2Zmc2V0ICsgazI7XG5cdFx0XHRcdFx0aWYgKGsyID09PSAtZCB8fCBrMiAhPT0gZCAmJiB2MltrMk9mZnNldCAtIDFdIDwgdjJbazJPZmZzZXQgKyAxXSkge1xuXHRcdFx0XHRcdFx0eDIgPSB2MltrMk9mZnNldCArIDFdO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR4MiA9IHYyW2syT2Zmc2V0IC0gMV0gKyAxO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR5MiA9IHgyIC0gazI7XG5cdFx0XHRcdFx0d2hpbGUgKHgyIDwgdGV4dDFMZW5ndGggJiYgeTIgPCB0ZXh0Mkxlbmd0aCAmJiB0ZXh0MS5jaGFyQXQodGV4dDFMZW5ndGggLSB4MiAtIDEpID09PSB0ZXh0Mi5jaGFyQXQodGV4dDJMZW5ndGggLSB5MiAtIDEpKSB7XG5cdFx0XHRcdFx0XHR4MisrO1xuXHRcdFx0XHRcdFx0eTIrKztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0djJbazJPZmZzZXRdID0geDI7XG5cdFx0XHRcdFx0aWYgKHgyID4gdGV4dDFMZW5ndGgpIHtcblx0XHRcdFx0XHRcdC8vIFJhbiBvZmYgdGhlIGxlZnQgb2YgdGhlIGdyYXBoLlxuXHRcdFx0XHRcdFx0azJlbmQgKz0gMjtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHkyID4gdGV4dDJMZW5ndGgpIHtcblx0XHRcdFx0XHRcdC8vIFJhbiBvZmYgdGhlIHRvcCBvZiB0aGUgZ3JhcGguXG5cdFx0XHRcdFx0XHRrMnN0YXJ0ICs9IDI7XG5cdFx0XHRcdFx0fSBlbHNlIGlmICghZnJvbnQpIHtcblx0XHRcdFx0XHRcdGsxT2Zmc2V0ID0gdk9mZnNldCArIGRlbHRhIC0gazI7XG5cdFx0XHRcdFx0XHRpZiAoazFPZmZzZXQgPj0gMCAmJiBrMU9mZnNldCA8IHZMZW5ndGggJiYgdjFbazFPZmZzZXRdICE9PSAtMSkge1xuXHRcdFx0XHRcdFx0XHR4MSA9IHYxW2sxT2Zmc2V0XTtcblx0XHRcdFx0XHRcdFx0eTEgPSB2T2Zmc2V0ICsgeDEgLSBrMU9mZnNldDtcblxuXHRcdFx0XHRcdFx0XHQvLyBNaXJyb3IgeDIgb250byB0b3AtbGVmdCBjb29yZGluYXRlIHN5c3RlbS5cblx0XHRcdFx0XHRcdFx0eDIgPSB0ZXh0MUxlbmd0aCAtIHgyO1xuXHRcdFx0XHRcdFx0XHRpZiAoeDEgPj0geDIpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBPdmVybGFwIGRldGVjdGVkLlxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB0aGlzLmRpZmZCaXNlY3RTcGxpdCh0ZXh0MSwgdGV4dDIsIHgxLCB5MSwgZGVhZGxpbmUpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIERpZmYgdG9vayB0b28gbG9uZyBhbmQgaGl0IHRoZSBkZWFkbGluZSBvclxuXHRcdFx0Ly8gbnVtYmVyIG9mIGRpZmZzIGVxdWFscyBudW1iZXIgb2YgY2hhcmFjdGVycywgbm8gY29tbW9uYWxpdHkgYXQgYWxsLlxuXHRcdFx0cmV0dXJuIFtbRElGRl9ERUxFVEUsIHRleHQxXSwgW0RJRkZfSU5TRVJULCB0ZXh0Ml1dO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBHaXZlbiB0aGUgbG9jYXRpb24gb2YgdGhlICdtaWRkbGUgc25ha2UnLCBzcGxpdCB0aGUgZGlmZiBpbiB0d28gcGFydHNcblx0XHQgKiBhbmQgcmVjdXJzZS5cblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dDEgT2xkIHN0cmluZyB0byBiZSBkaWZmZWQuXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQyIE5ldyBzdHJpbmcgdG8gYmUgZGlmZmVkLlxuXHRcdCAqIEBwYXJhbSB7bnVtYmVyfSB4IEluZGV4IG9mIHNwbGl0IHBvaW50IGluIHRleHQxLlxuXHRcdCAqIEBwYXJhbSB7bnVtYmVyfSB5IEluZGV4IG9mIHNwbGl0IHBvaW50IGluIHRleHQyLlxuXHRcdCAqIEBwYXJhbSB7bnVtYmVyfSBkZWFkbGluZSBUaW1lIGF0IHdoaWNoIHRvIGJhaWwgaWYgbm90IHlldCBjb21wbGV0ZS5cblx0XHQgKiBAcmV0dXJuIHshQXJyYXkuPCFEaWZmTWF0Y2hQYXRjaC5EaWZmPn0gQXJyYXkgb2YgZGlmZiB0dXBsZXMuXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHREaWZmTWF0Y2hQYXRjaC5wcm90b3R5cGUuZGlmZkJpc2VjdFNwbGl0ID0gZnVuY3Rpb24gKHRleHQxLCB0ZXh0MiwgeCwgeSwgZGVhZGxpbmUpIHtcblx0XHRcdHZhciB0ZXh0MWEsIHRleHQxYiwgdGV4dDJhLCB0ZXh0MmIsIGRpZmZzLCBkaWZmc2I7XG5cdFx0XHR0ZXh0MWEgPSB0ZXh0MS5zdWJzdHJpbmcoMCwgeCk7XG5cdFx0XHR0ZXh0MmEgPSB0ZXh0Mi5zdWJzdHJpbmcoMCwgeSk7XG5cdFx0XHR0ZXh0MWIgPSB0ZXh0MS5zdWJzdHJpbmcoeCk7XG5cdFx0XHR0ZXh0MmIgPSB0ZXh0Mi5zdWJzdHJpbmcoeSk7XG5cblx0XHRcdC8vIENvbXB1dGUgYm90aCBkaWZmcyBzZXJpYWxseS5cblx0XHRcdGRpZmZzID0gdGhpcy5EaWZmTWFpbih0ZXh0MWEsIHRleHQyYSwgZmFsc2UsIGRlYWRsaW5lKTtcblx0XHRcdGRpZmZzYiA9IHRoaXMuRGlmZk1haW4odGV4dDFiLCB0ZXh0MmIsIGZhbHNlLCBkZWFkbGluZSk7XG5cdFx0XHRyZXR1cm4gZGlmZnMuY29uY2F0KGRpZmZzYik7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFJlZHVjZSB0aGUgbnVtYmVyIG9mIGVkaXRzIGJ5IGVsaW1pbmF0aW5nIHNlbWFudGljYWxseSB0cml2aWFsIGVxdWFsaXRpZXMuXG5cdFx0ICogQHBhcmFtIHshQXJyYXkuPCFEaWZmTWF0Y2hQYXRjaC5EaWZmPn0gZGlmZnMgQXJyYXkgb2YgZGlmZiB0dXBsZXMuXG5cdFx0ICovXG5cdFx0RGlmZk1hdGNoUGF0Y2gucHJvdG90eXBlLmRpZmZDbGVhbnVwU2VtYW50aWMgPSBmdW5jdGlvbiAoZGlmZnMpIHtcblx0XHRcdHZhciBjaGFuZ2VzID0gZmFsc2U7XG5cdFx0XHR2YXIgZXF1YWxpdGllcyA9IFtdOyAvLyBTdGFjayBvZiBpbmRpY2VzIHdoZXJlIGVxdWFsaXRpZXMgYXJlIGZvdW5kLlxuXHRcdFx0dmFyIGVxdWFsaXRpZXNMZW5ndGggPSAwOyAvLyBLZWVwaW5nIG91ciBvd24gbGVuZ3RoIHZhciBpcyBmYXN0ZXIgaW4gSlMuXG5cdFx0XHQvKiogQHR5cGUgez9zdHJpbmd9ICovXG5cdFx0XHR2YXIgbGFzdGVxdWFsaXR5ID0gbnVsbDtcblxuXHRcdFx0Ly8gQWx3YXlzIGVxdWFsIHRvIGRpZmZzW2VxdWFsaXRpZXNbZXF1YWxpdGllc0xlbmd0aCAtIDFdXVsxXVxuXHRcdFx0dmFyIHBvaW50ZXIgPSAwOyAvLyBJbmRleCBvZiBjdXJyZW50IHBvc2l0aW9uLlxuXG5cdFx0XHQvLyBOdW1iZXIgb2YgY2hhcmFjdGVycyB0aGF0IGNoYW5nZWQgcHJpb3IgdG8gdGhlIGVxdWFsaXR5LlxuXHRcdFx0dmFyIGxlbmd0aEluc2VydGlvbnMxID0gMDtcblx0XHRcdHZhciBsZW5ndGhEZWxldGlvbnMxID0gMDtcblxuXHRcdFx0Ly8gTnVtYmVyIG9mIGNoYXJhY3RlcnMgdGhhdCBjaGFuZ2VkIGFmdGVyIHRoZSBlcXVhbGl0eS5cblx0XHRcdHZhciBsZW5ndGhJbnNlcnRpb25zMiA9IDA7XG5cdFx0XHR2YXIgbGVuZ3RoRGVsZXRpb25zMiA9IDA7XG5cdFx0XHR3aGlsZSAocG9pbnRlciA8IGRpZmZzLmxlbmd0aCkge1xuXHRcdFx0XHRpZiAoZGlmZnNbcG9pbnRlcl1bMF0gPT09IERJRkZfRVFVQUwpIHtcblx0XHRcdFx0XHQvLyBFcXVhbGl0eSBmb3VuZC5cblx0XHRcdFx0XHRlcXVhbGl0aWVzW2VxdWFsaXRpZXNMZW5ndGgrK10gPSBwb2ludGVyO1xuXHRcdFx0XHRcdGxlbmd0aEluc2VydGlvbnMxID0gbGVuZ3RoSW5zZXJ0aW9uczI7XG5cdFx0XHRcdFx0bGVuZ3RoRGVsZXRpb25zMSA9IGxlbmd0aERlbGV0aW9uczI7XG5cdFx0XHRcdFx0bGVuZ3RoSW5zZXJ0aW9uczIgPSAwO1xuXHRcdFx0XHRcdGxlbmd0aERlbGV0aW9uczIgPSAwO1xuXHRcdFx0XHRcdGxhc3RlcXVhbGl0eSA9IGRpZmZzW3BvaW50ZXJdWzFdO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIEFuIGluc2VydGlvbiBvciBkZWxldGlvbi5cblx0XHRcdFx0XHRpZiAoZGlmZnNbcG9pbnRlcl1bMF0gPT09IERJRkZfSU5TRVJUKSB7XG5cdFx0XHRcdFx0XHRsZW5ndGhJbnNlcnRpb25zMiArPSBkaWZmc1twb2ludGVyXVsxXS5sZW5ndGg7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGxlbmd0aERlbGV0aW9uczIgKz0gZGlmZnNbcG9pbnRlcl1bMV0ubGVuZ3RoO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIEVsaW1pbmF0ZSBhbiBlcXVhbGl0eSB0aGF0IGlzIHNtYWxsZXIgb3IgZXF1YWwgdG8gdGhlIGVkaXRzIG9uIGJvdGhcblx0XHRcdFx0XHQvLyBzaWRlcyBvZiBpdC5cblx0XHRcdFx0XHRpZiAobGFzdGVxdWFsaXR5ICYmIGxhc3RlcXVhbGl0eS5sZW5ndGggPD0gTWF0aC5tYXgobGVuZ3RoSW5zZXJ0aW9uczEsIGxlbmd0aERlbGV0aW9uczEpICYmIGxhc3RlcXVhbGl0eS5sZW5ndGggPD0gTWF0aC5tYXgobGVuZ3RoSW5zZXJ0aW9uczIsIGxlbmd0aERlbGV0aW9uczIpKSB7XG5cdFx0XHRcdFx0XHQvLyBEdXBsaWNhdGUgcmVjb3JkLlxuXHRcdFx0XHRcdFx0ZGlmZnMuc3BsaWNlKGVxdWFsaXRpZXNbZXF1YWxpdGllc0xlbmd0aCAtIDFdLCAwLCBbRElGRl9ERUxFVEUsIGxhc3RlcXVhbGl0eV0pO1xuXG5cdFx0XHRcdFx0XHQvLyBDaGFuZ2Ugc2Vjb25kIGNvcHkgdG8gaW5zZXJ0LlxuXHRcdFx0XHRcdFx0ZGlmZnNbZXF1YWxpdGllc1tlcXVhbGl0aWVzTGVuZ3RoIC0gMV0gKyAxXVswXSA9IERJRkZfSU5TRVJUO1xuXG5cdFx0XHRcdFx0XHQvLyBUaHJvdyBhd2F5IHRoZSBlcXVhbGl0eSB3ZSBqdXN0IGRlbGV0ZWQuXG5cdFx0XHRcdFx0XHRlcXVhbGl0aWVzTGVuZ3RoLS07XG5cblx0XHRcdFx0XHRcdC8vIFRocm93IGF3YXkgdGhlIHByZXZpb3VzIGVxdWFsaXR5IChpdCBuZWVkcyB0byBiZSByZWV2YWx1YXRlZCkuXG5cdFx0XHRcdFx0XHRlcXVhbGl0aWVzTGVuZ3RoLS07XG5cdFx0XHRcdFx0XHRwb2ludGVyID0gZXF1YWxpdGllc0xlbmd0aCA+IDAgPyBlcXVhbGl0aWVzW2VxdWFsaXRpZXNMZW5ndGggLSAxXSA6IC0xO1xuXG5cdFx0XHRcdFx0XHQvLyBSZXNldCB0aGUgY291bnRlcnMuXG5cdFx0XHRcdFx0XHRsZW5ndGhJbnNlcnRpb25zMSA9IDA7XG5cdFx0XHRcdFx0XHRsZW5ndGhEZWxldGlvbnMxID0gMDtcblx0XHRcdFx0XHRcdGxlbmd0aEluc2VydGlvbnMyID0gMDtcblx0XHRcdFx0XHRcdGxlbmd0aERlbGV0aW9uczIgPSAwO1xuXHRcdFx0XHRcdFx0bGFzdGVxdWFsaXR5ID0gbnVsbDtcblx0XHRcdFx0XHRcdGNoYW5nZXMgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRwb2ludGVyKys7XG5cdFx0XHR9XG5cblx0XHRcdC8vIE5vcm1hbGl6ZSB0aGUgZGlmZi5cblx0XHRcdGlmIChjaGFuZ2VzKSB7XG5cdFx0XHRcdHRoaXMuZGlmZkNsZWFudXBNZXJnZShkaWZmcyk7XG5cdFx0XHR9XG5cdFx0XHR2YXIgZGVsZXRpb24sIGluc2VydGlvbiwgb3ZlcmxhcExlbmd0aDEsIG92ZXJsYXBMZW5ndGgyO1xuXG5cdFx0XHQvLyBGaW5kIGFueSBvdmVybGFwcyBiZXR3ZWVuIGRlbGV0aW9ucyBhbmQgaW5zZXJ0aW9ucy5cblx0XHRcdC8vIGUuZzogPGRlbD5hYmN4eHg8L2RlbD48aW5zPnh4eGRlZjwvaW5zPlxuXHRcdFx0Ly8gICAtPiA8ZGVsPmFiYzwvZGVsPnh4eDxpbnM+ZGVmPC9pbnM+XG5cdFx0XHQvLyBlLmc6IDxkZWw+eHh4YWJjPC9kZWw+PGlucz5kZWZ4eHg8L2lucz5cblx0XHRcdC8vICAgLT4gPGlucz5kZWY8L2lucz54eHg8ZGVsPmFiYzwvZGVsPlxuXHRcdFx0Ly8gT25seSBleHRyYWN0IGFuIG92ZXJsYXAgaWYgaXQgaXMgYXMgYmlnIGFzIHRoZSBlZGl0IGFoZWFkIG9yIGJlaGluZCBpdC5cblx0XHRcdHBvaW50ZXIgPSAxO1xuXHRcdFx0d2hpbGUgKHBvaW50ZXIgPCBkaWZmcy5sZW5ndGgpIHtcblx0XHRcdFx0aWYgKGRpZmZzW3BvaW50ZXIgLSAxXVswXSA9PT0gRElGRl9ERUxFVEUgJiYgZGlmZnNbcG9pbnRlcl1bMF0gPT09IERJRkZfSU5TRVJUKSB7XG5cdFx0XHRcdFx0ZGVsZXRpb24gPSBkaWZmc1twb2ludGVyIC0gMV1bMV07XG5cdFx0XHRcdFx0aW5zZXJ0aW9uID0gZGlmZnNbcG9pbnRlcl1bMV07XG5cdFx0XHRcdFx0b3ZlcmxhcExlbmd0aDEgPSB0aGlzLmRpZmZDb21tb25PdmVybGFwKGRlbGV0aW9uLCBpbnNlcnRpb24pO1xuXHRcdFx0XHRcdG92ZXJsYXBMZW5ndGgyID0gdGhpcy5kaWZmQ29tbW9uT3ZlcmxhcChpbnNlcnRpb24sIGRlbGV0aW9uKTtcblx0XHRcdFx0XHRpZiAob3ZlcmxhcExlbmd0aDEgPj0gb3ZlcmxhcExlbmd0aDIpIHtcblx0XHRcdFx0XHRcdGlmIChvdmVybGFwTGVuZ3RoMSA+PSBkZWxldGlvbi5sZW5ndGggLyAyIHx8IG92ZXJsYXBMZW5ndGgxID49IGluc2VydGlvbi5sZW5ndGggLyAyKSB7XG5cdFx0XHRcdFx0XHRcdC8vIE92ZXJsYXAgZm91bmQuICBJbnNlcnQgYW4gZXF1YWxpdHkgYW5kIHRyaW0gdGhlIHN1cnJvdW5kaW5nIGVkaXRzLlxuXHRcdFx0XHRcdFx0XHRkaWZmcy5zcGxpY2UocG9pbnRlciwgMCwgW0RJRkZfRVFVQUwsIGluc2VydGlvbi5zdWJzdHJpbmcoMCwgb3ZlcmxhcExlbmd0aDEpXSk7XG5cdFx0XHRcdFx0XHRcdGRpZmZzW3BvaW50ZXIgLSAxXVsxXSA9IGRlbGV0aW9uLnN1YnN0cmluZygwLCBkZWxldGlvbi5sZW5ndGggLSBvdmVybGFwTGVuZ3RoMSk7XG5cdFx0XHRcdFx0XHRcdGRpZmZzW3BvaW50ZXIgKyAxXVsxXSA9IGluc2VydGlvbi5zdWJzdHJpbmcob3ZlcmxhcExlbmd0aDEpO1xuXHRcdFx0XHRcdFx0XHRwb2ludGVyKys7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGlmIChvdmVybGFwTGVuZ3RoMiA+PSBkZWxldGlvbi5sZW5ndGggLyAyIHx8IG92ZXJsYXBMZW5ndGgyID49IGluc2VydGlvbi5sZW5ndGggLyAyKSB7XG5cdFx0XHRcdFx0XHRcdC8vIFJldmVyc2Ugb3ZlcmxhcCBmb3VuZC5cblx0XHRcdFx0XHRcdFx0Ly8gSW5zZXJ0IGFuIGVxdWFsaXR5IGFuZCBzd2FwIGFuZCB0cmltIHRoZSBzdXJyb3VuZGluZyBlZGl0cy5cblx0XHRcdFx0XHRcdFx0ZGlmZnMuc3BsaWNlKHBvaW50ZXIsIDAsIFtESUZGX0VRVUFMLCBkZWxldGlvbi5zdWJzdHJpbmcoMCwgb3ZlcmxhcExlbmd0aDIpXSk7XG5cdFx0XHRcdFx0XHRcdGRpZmZzW3BvaW50ZXIgLSAxXVswXSA9IERJRkZfSU5TRVJUO1xuXHRcdFx0XHRcdFx0XHRkaWZmc1twb2ludGVyIC0gMV1bMV0gPSBpbnNlcnRpb24uc3Vic3RyaW5nKDAsIGluc2VydGlvbi5sZW5ndGggLSBvdmVybGFwTGVuZ3RoMik7XG5cdFx0XHRcdFx0XHRcdGRpZmZzW3BvaW50ZXIgKyAxXVswXSA9IERJRkZfREVMRVRFO1xuXHRcdFx0XHRcdFx0XHRkaWZmc1twb2ludGVyICsgMV1bMV0gPSBkZWxldGlvbi5zdWJzdHJpbmcob3ZlcmxhcExlbmd0aDIpO1xuXHRcdFx0XHRcdFx0XHRwb2ludGVyKys7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHBvaW50ZXIrKztcblx0XHRcdFx0fVxuXHRcdFx0XHRwb2ludGVyKys7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIERldGVybWluZSBpZiB0aGUgc3VmZml4IG9mIG9uZSBzdHJpbmcgaXMgdGhlIHByZWZpeCBvZiBhbm90aGVyLlxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MSBGaXJzdCBzdHJpbmcuXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQyIFNlY29uZCBzdHJpbmcuXG5cdFx0ICogQHJldHVybiB7bnVtYmVyfSBUaGUgbnVtYmVyIG9mIGNoYXJhY3RlcnMgY29tbW9uIHRvIHRoZSBlbmQgb2YgdGhlIGZpcnN0XG5cdFx0ICogICAgIHN0cmluZyBhbmQgdGhlIHN0YXJ0IG9mIHRoZSBzZWNvbmQgc3RyaW5nLlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0RGlmZk1hdGNoUGF0Y2gucHJvdG90eXBlLmRpZmZDb21tb25PdmVybGFwID0gZnVuY3Rpb24gKHRleHQxLCB0ZXh0Mikge1xuXHRcdFx0Ly8gQ2FjaGUgdGhlIHRleHQgbGVuZ3RocyB0byBwcmV2ZW50IG11bHRpcGxlIGNhbGxzLlxuXHRcdFx0dmFyIHRleHQxTGVuZ3RoID0gdGV4dDEubGVuZ3RoO1xuXHRcdFx0dmFyIHRleHQyTGVuZ3RoID0gdGV4dDIubGVuZ3RoO1xuXG5cdFx0XHQvLyBFbGltaW5hdGUgdGhlIG51bGwgY2FzZS5cblx0XHRcdGlmICh0ZXh0MUxlbmd0aCA9PT0gMCB8fCB0ZXh0Mkxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdH1cblxuXHRcdFx0Ly8gVHJ1bmNhdGUgdGhlIGxvbmdlciBzdHJpbmcuXG5cdFx0XHRpZiAodGV4dDFMZW5ndGggPiB0ZXh0Mkxlbmd0aCkge1xuXHRcdFx0XHR0ZXh0MSA9IHRleHQxLnN1YnN0cmluZyh0ZXh0MUxlbmd0aCAtIHRleHQyTGVuZ3RoKTtcblx0XHRcdH0gZWxzZSBpZiAodGV4dDFMZW5ndGggPCB0ZXh0Mkxlbmd0aCkge1xuXHRcdFx0XHR0ZXh0MiA9IHRleHQyLnN1YnN0cmluZygwLCB0ZXh0MUxlbmd0aCk7XG5cdFx0XHR9XG5cdFx0XHR2YXIgdGV4dExlbmd0aCA9IE1hdGgubWluKHRleHQxTGVuZ3RoLCB0ZXh0Mkxlbmd0aCk7XG5cblx0XHRcdC8vIFF1aWNrIGNoZWNrIGZvciB0aGUgd29yc3QgY2FzZS5cblx0XHRcdGlmICh0ZXh0MSA9PT0gdGV4dDIpIHtcblx0XHRcdFx0cmV0dXJuIHRleHRMZW5ndGg7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFN0YXJ0IGJ5IGxvb2tpbmcgZm9yIGEgc2luZ2xlIGNoYXJhY3RlciBtYXRjaFxuXHRcdFx0Ly8gYW5kIGluY3JlYXNlIGxlbmd0aCB1bnRpbCBubyBtYXRjaCBpcyBmb3VuZC5cblx0XHRcdC8vIFBlcmZvcm1hbmNlIGFuYWx5c2lzOiBodHRwczovL25laWwuZnJhc2VyLm5hbWUvbmV3cy8yMDEwLzExLzA0L1xuXHRcdFx0dmFyIGJlc3QgPSAwO1xuXHRcdFx0dmFyIGxlbmd0aCA9IDE7XG5cdFx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0XHR2YXIgcGF0dGVybiA9IHRleHQxLnN1YnN0cmluZyh0ZXh0TGVuZ3RoIC0gbGVuZ3RoKTtcblx0XHRcdFx0dmFyIGZvdW5kID0gdGV4dDIuaW5kZXhPZihwYXR0ZXJuKTtcblx0XHRcdFx0aWYgKGZvdW5kID09PSAtMSkge1xuXHRcdFx0XHRcdHJldHVybiBiZXN0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxlbmd0aCArPSBmb3VuZDtcblx0XHRcdFx0aWYgKGZvdW5kID09PSAwIHx8IHRleHQxLnN1YnN0cmluZyh0ZXh0TGVuZ3RoIC0gbGVuZ3RoKSA9PT0gdGV4dDIuc3Vic3RyaW5nKDAsIGxlbmd0aCkpIHtcblx0XHRcdFx0XHRiZXN0ID0gbGVuZ3RoO1xuXHRcdFx0XHRcdGxlbmd0aCsrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFNwbGl0IHR3byB0ZXh0cyBpbnRvIGFuIGFycmF5IG9mIHN0cmluZ3MuICBSZWR1Y2UgdGhlIHRleHRzIHRvIGEgc3RyaW5nIG9mXG5cdFx0ICogaGFzaGVzIHdoZXJlIGVhY2ggVW5pY29kZSBjaGFyYWN0ZXIgcmVwcmVzZW50cyBvbmUgbGluZS5cblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dDEgRmlyc3Qgc3RyaW5nLlxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MiBTZWNvbmQgc3RyaW5nLlxuXHRcdCAqIEByZXR1cm4ge3tjaGFyczE6IHN0cmluZywgY2hhcnMyOiBzdHJpbmcsIGxpbmVBcnJheTogIUFycmF5LjxzdHJpbmc+fX1cblx0XHQgKiAgICAgQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGVuY29kZWQgdGV4dDEsIHRoZSBlbmNvZGVkIHRleHQyIGFuZFxuXHRcdCAqICAgICB0aGUgYXJyYXkgb2YgdW5pcXVlIHN0cmluZ3MuXG5cdFx0ICogICAgIFRoZSB6ZXJvdGggZWxlbWVudCBvZiB0aGUgYXJyYXkgb2YgdW5pcXVlIHN0cmluZ3MgaXMgaW50ZW50aW9uYWxseSBibGFuay5cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdERpZmZNYXRjaFBhdGNoLnByb3RvdHlwZS5kaWZmTGluZXNUb0NoYXJzID0gZnVuY3Rpb24gKHRleHQxLCB0ZXh0Mikge1xuXHRcdFx0dmFyIGxpbmVBcnJheSA9IFtdOyAvLyBFLmcuIGxpbmVBcnJheVs0XSA9PT0gJ0hlbGxvXFxuJ1xuXHRcdFx0dmFyIGxpbmVIYXNoID0ge307IC8vIEUuZy4gbGluZUhhc2hbJ0hlbGxvXFxuJ10gPT09IDRcblxuXHRcdFx0Ly8gJ1xceDAwJyBpcyBhIHZhbGlkIGNoYXJhY3RlciwgYnV0IHZhcmlvdXMgZGVidWdnZXJzIGRvbid0IGxpa2UgaXQuXG5cdFx0XHQvLyBTbyB3ZSdsbCBpbnNlcnQgYSBqdW5rIGVudHJ5IHRvIGF2b2lkIGdlbmVyYXRpbmcgYSBudWxsIGNoYXJhY3Rlci5cblx0XHRcdGxpbmVBcnJheVswXSA9ICcnO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFNwbGl0IGEgdGV4dCBpbnRvIGFuIGFycmF5IG9mIHN0cmluZ3MuICBSZWR1Y2UgdGhlIHRleHRzIHRvIGEgc3RyaW5nIG9mXG5cdFx0XHQgKiBoYXNoZXMgd2hlcmUgZWFjaCBVbmljb2RlIGNoYXJhY3RlciByZXByZXNlbnRzIG9uZSBsaW5lLlxuXHRcdFx0ICogTW9kaWZpZXMgbGluZWFycmF5IGFuZCBsaW5laGFzaCB0aHJvdWdoIGJlaW5nIGEgY2xvc3VyZS5cblx0XHRcdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFN0cmluZyB0byBlbmNvZGUuXG5cdFx0XHQgKiBAcmV0dXJuIHtzdHJpbmd9IEVuY29kZWQgc3RyaW5nLlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gZGlmZkxpbmVzVG9DaGFyc011bmdlKHRleHQpIHtcblx0XHRcdFx0dmFyIGNoYXJzID0gJyc7XG5cblx0XHRcdFx0Ly8gV2FsayB0aGUgdGV4dCwgcHVsbGluZyBvdXQgYSBzdWJzdHJpbmcgZm9yIGVhY2ggbGluZS5cblx0XHRcdFx0Ly8gdGV4dC5zcGxpdCgnXFxuJykgd291bGQgd291bGQgdGVtcG9yYXJpbHkgZG91YmxlIG91ciBtZW1vcnkgZm9vdHByaW50LlxuXHRcdFx0XHQvLyBNb2RpZnlpbmcgdGV4dCB3b3VsZCBjcmVhdGUgbWFueSBsYXJnZSBzdHJpbmdzIHRvIGdhcmJhZ2UgY29sbGVjdC5cblx0XHRcdFx0dmFyIGxpbmVTdGFydCA9IDA7XG5cdFx0XHRcdHZhciBsaW5lRW5kID0gLTE7XG5cblx0XHRcdFx0Ly8gS2VlcGluZyBvdXIgb3duIGxlbmd0aCB2YXJpYWJsZSBpcyBmYXN0ZXIgdGhhbiBsb29raW5nIGl0IHVwLlxuXHRcdFx0XHR2YXIgbGluZUFycmF5TGVuZ3RoID0gbGluZUFycmF5Lmxlbmd0aDtcblx0XHRcdFx0d2hpbGUgKGxpbmVFbmQgPCB0ZXh0Lmxlbmd0aCAtIDEpIHtcblx0XHRcdFx0XHRsaW5lRW5kID0gdGV4dC5pbmRleE9mKCdcXG4nLCBsaW5lU3RhcnQpO1xuXHRcdFx0XHRcdGlmIChsaW5lRW5kID09PSAtMSkge1xuXHRcdFx0XHRcdFx0bGluZUVuZCA9IHRleHQubGVuZ3RoIC0gMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dmFyIGxpbmUgPSB0ZXh0LnN1YnN0cmluZyhsaW5lU3RhcnQsIGxpbmVFbmQgKyAxKTtcblx0XHRcdFx0XHRsaW5lU3RhcnQgPSBsaW5lRW5kICsgMTtcblx0XHRcdFx0XHRpZiAoaGFzT3duLmNhbGwobGluZUhhc2gsIGxpbmUpKSB7XG5cdFx0XHRcdFx0XHRjaGFycyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGxpbmVIYXNoW2xpbmVdKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y2hhcnMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShsaW5lQXJyYXlMZW5ndGgpO1xuXHRcdFx0XHRcdFx0bGluZUhhc2hbbGluZV0gPSBsaW5lQXJyYXlMZW5ndGg7XG5cdFx0XHRcdFx0XHRsaW5lQXJyYXlbbGluZUFycmF5TGVuZ3RoKytdID0gbGluZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGNoYXJzO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGNoYXJzMSA9IGRpZmZMaW5lc1RvQ2hhcnNNdW5nZSh0ZXh0MSk7XG5cdFx0XHR2YXIgY2hhcnMyID0gZGlmZkxpbmVzVG9DaGFyc011bmdlKHRleHQyKTtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGNoYXJzMTogY2hhcnMxLFxuXHRcdFx0XHRjaGFyczI6IGNoYXJzMixcblx0XHRcdFx0bGluZUFycmF5OiBsaW5lQXJyYXlcblx0XHRcdH07XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFJlaHlkcmF0ZSB0aGUgdGV4dCBpbiBhIGRpZmYgZnJvbSBhIHN0cmluZyBvZiBsaW5lIGhhc2hlcyB0byByZWFsIGxpbmVzIG9mXG5cdFx0ICogdGV4dC5cblx0XHQgKiBAcGFyYW0geyFBcnJheS48IURpZmZNYXRjaFBhdGNoLkRpZmY+fSBkaWZmcyBBcnJheSBvZiBkaWZmIHR1cGxlcy5cblx0XHQgKiBAcGFyYW0geyFBcnJheS48c3RyaW5nPn0gbGluZUFycmF5IEFycmF5IG9mIHVuaXF1ZSBzdHJpbmdzLlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0RGlmZk1hdGNoUGF0Y2gucHJvdG90eXBlLmRpZmZDaGFyc1RvTGluZXMgPSBmdW5jdGlvbiAoZGlmZnMsIGxpbmVBcnJheSkge1xuXHRcdFx0Zm9yICh2YXIgeCA9IDA7IHggPCBkaWZmcy5sZW5ndGg7IHgrKykge1xuXHRcdFx0XHR2YXIgY2hhcnMgPSBkaWZmc1t4XVsxXTtcblx0XHRcdFx0dmFyIHRleHQgPSBbXTtcblx0XHRcdFx0Zm9yICh2YXIgeSA9IDA7IHkgPCBjaGFycy5sZW5ndGg7IHkrKykge1xuXHRcdFx0XHRcdHRleHRbeV0gPSBsaW5lQXJyYXlbY2hhcnMuY2hhckNvZGVBdCh5KV07XG5cdFx0XHRcdH1cblx0XHRcdFx0ZGlmZnNbeF1bMV0gPSB0ZXh0LmpvaW4oJycpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBSZW9yZGVyIGFuZCBtZXJnZSBsaWtlIGVkaXQgc2VjdGlvbnMuICBNZXJnZSBlcXVhbGl0aWVzLlxuXHRcdCAqIEFueSBlZGl0IHNlY3Rpb24gY2FuIG1vdmUgYXMgbG9uZyBhcyBpdCBkb2Vzbid0IGNyb3NzIGFuIGVxdWFsaXR5LlxuXHRcdCAqIEBwYXJhbSB7IUFycmF5LjwhRGlmZk1hdGNoUGF0Y2guRGlmZj59IGRpZmZzIEFycmF5IG9mIGRpZmYgdHVwbGVzLlxuXHRcdCAqL1xuXHRcdERpZmZNYXRjaFBhdGNoLnByb3RvdHlwZS5kaWZmQ2xlYW51cE1lcmdlID0gZnVuY3Rpb24gKGRpZmZzKSB7XG5cdFx0XHRkaWZmcy5wdXNoKFtESUZGX0VRVUFMLCAnJ10pOyAvLyBBZGQgYSBkdW1teSBlbnRyeSBhdCB0aGUgZW5kLlxuXHRcdFx0dmFyIHBvaW50ZXIgPSAwO1xuXHRcdFx0dmFyIGNvdW50RGVsZXRlID0gMDtcblx0XHRcdHZhciBjb3VudEluc2VydCA9IDA7XG5cdFx0XHR2YXIgdGV4dERlbGV0ZSA9ICcnO1xuXHRcdFx0dmFyIHRleHRJbnNlcnQgPSAnJztcblx0XHRcdHdoaWxlIChwb2ludGVyIDwgZGlmZnMubGVuZ3RoKSB7XG5cdFx0XHRcdHN3aXRjaCAoZGlmZnNbcG9pbnRlcl1bMF0pIHtcblx0XHRcdFx0XHRjYXNlIERJRkZfSU5TRVJUOlxuXHRcdFx0XHRcdFx0Y291bnRJbnNlcnQrKztcblx0XHRcdFx0XHRcdHRleHRJbnNlcnQgKz0gZGlmZnNbcG9pbnRlcl1bMV07XG5cdFx0XHRcdFx0XHRwb2ludGVyKys7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIERJRkZfREVMRVRFOlxuXHRcdFx0XHRcdFx0Y291bnREZWxldGUrKztcblx0XHRcdFx0XHRcdHRleHREZWxldGUgKz0gZGlmZnNbcG9pbnRlcl1bMV07XG5cdFx0XHRcdFx0XHRwb2ludGVyKys7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIERJRkZfRVFVQUw6XG5cdFx0XHRcdFx0XHQvLyBVcG9uIHJlYWNoaW5nIGFuIGVxdWFsaXR5LCBjaGVjayBmb3IgcHJpb3IgcmVkdW5kYW5jaWVzLlxuXHRcdFx0XHRcdFx0aWYgKGNvdW50RGVsZXRlICsgY291bnRJbnNlcnQgPiAxKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChjb3VudERlbGV0ZSAhPT0gMCAmJiBjb3VudEluc2VydCAhPT0gMCkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIEZhY3RvciBvdXQgYW55IGNvbW1vbiBwcmVmaXhlcy5cblx0XHRcdFx0XHRcdFx0XHR2YXIgY29tbW9ubGVuZ3RoID0gdGhpcy5kaWZmQ29tbW9uUHJlZml4KHRleHRJbnNlcnQsIHRleHREZWxldGUpO1xuXHRcdFx0XHRcdFx0XHRcdGlmIChjb21tb25sZW5ndGggIT09IDApIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChwb2ludGVyIC0gY291bnREZWxldGUgLSBjb3VudEluc2VydCA+IDAgJiYgZGlmZnNbcG9pbnRlciAtIGNvdW50RGVsZXRlIC0gY291bnRJbnNlcnQgLSAxXVswXSA9PT0gRElGRl9FUVVBTCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRkaWZmc1twb2ludGVyIC0gY291bnREZWxldGUgLSBjb3VudEluc2VydCAtIDFdWzFdICs9IHRleHRJbnNlcnQuc3Vic3RyaW5nKDAsIGNvbW1vbmxlbmd0aCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRkaWZmcy5zcGxpY2UoMCwgMCwgW0RJRkZfRVFVQUwsIHRleHRJbnNlcnQuc3Vic3RyaW5nKDAsIGNvbW1vbmxlbmd0aCldKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cG9pbnRlcisrO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0dGV4dEluc2VydCA9IHRleHRJbnNlcnQuc3Vic3RyaW5nKGNvbW1vbmxlbmd0aCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR0ZXh0RGVsZXRlID0gdGV4dERlbGV0ZS5zdWJzdHJpbmcoY29tbW9ubGVuZ3RoKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHQvLyBGYWN0b3Igb3V0IGFueSBjb21tb24gc3VmZml4aWVzLlxuXHRcdFx0XHRcdFx0XHRcdGNvbW1vbmxlbmd0aCA9IHRoaXMuZGlmZkNvbW1vblN1ZmZpeCh0ZXh0SW5zZXJ0LCB0ZXh0RGVsZXRlKTtcblx0XHRcdFx0XHRcdFx0XHRpZiAoY29tbW9ubGVuZ3RoICE9PSAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRkaWZmc1twb2ludGVyXVsxXSA9IHRleHRJbnNlcnQuc3Vic3RyaW5nKHRleHRJbnNlcnQubGVuZ3RoIC0gY29tbW9ubGVuZ3RoKSArIGRpZmZzW3BvaW50ZXJdWzFdO1xuXHRcdFx0XHRcdFx0XHRcdFx0dGV4dEluc2VydCA9IHRleHRJbnNlcnQuc3Vic3RyaW5nKDAsIHRleHRJbnNlcnQubGVuZ3RoIC0gY29tbW9ubGVuZ3RoKTtcblx0XHRcdFx0XHRcdFx0XHRcdHRleHREZWxldGUgPSB0ZXh0RGVsZXRlLnN1YnN0cmluZygwLCB0ZXh0RGVsZXRlLmxlbmd0aCAtIGNvbW1vbmxlbmd0aCk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Ly8gRGVsZXRlIHRoZSBvZmZlbmRpbmcgcmVjb3JkcyBhbmQgYWRkIHRoZSBtZXJnZWQgb25lcy5cblx0XHRcdFx0XHRcdFx0aWYgKGNvdW50RGVsZXRlID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0ZGlmZnMuc3BsaWNlKHBvaW50ZXIgLSBjb3VudEluc2VydCwgY291bnREZWxldGUgKyBjb3VudEluc2VydCwgW0RJRkZfSU5TRVJULCB0ZXh0SW5zZXJ0XSk7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoY291bnRJbnNlcnQgPT09IDApIHtcblx0XHRcdFx0XHRcdFx0XHRkaWZmcy5zcGxpY2UocG9pbnRlciAtIGNvdW50RGVsZXRlLCBjb3VudERlbGV0ZSArIGNvdW50SW5zZXJ0LCBbRElGRl9ERUxFVEUsIHRleHREZWxldGVdKTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRkaWZmcy5zcGxpY2UocG9pbnRlciAtIGNvdW50RGVsZXRlIC0gY291bnRJbnNlcnQsIGNvdW50RGVsZXRlICsgY291bnRJbnNlcnQsIFtESUZGX0RFTEVURSwgdGV4dERlbGV0ZV0sIFtESUZGX0lOU0VSVCwgdGV4dEluc2VydF0pO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHBvaW50ZXIgPSBwb2ludGVyIC0gY291bnREZWxldGUgLSBjb3VudEluc2VydCArIChjb3VudERlbGV0ZSA/IDEgOiAwKSArIChjb3VudEluc2VydCA/IDEgOiAwKSArIDE7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHBvaW50ZXIgIT09IDAgJiYgZGlmZnNbcG9pbnRlciAtIDFdWzBdID09PSBESUZGX0VRVUFMKSB7XG5cdFx0XHRcdFx0XHRcdC8vIE1lcmdlIHRoaXMgZXF1YWxpdHkgd2l0aCB0aGUgcHJldmlvdXMgb25lLlxuXHRcdFx0XHRcdFx0XHRkaWZmc1twb2ludGVyIC0gMV1bMV0gKz0gZGlmZnNbcG9pbnRlcl1bMV07XG5cdFx0XHRcdFx0XHRcdGRpZmZzLnNwbGljZShwb2ludGVyLCAxKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHBvaW50ZXIrKztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNvdW50SW5zZXJ0ID0gMDtcblx0XHRcdFx0XHRcdGNvdW50RGVsZXRlID0gMDtcblx0XHRcdFx0XHRcdHRleHREZWxldGUgPSAnJztcblx0XHRcdFx0XHRcdHRleHRJbnNlcnQgPSAnJztcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoZGlmZnNbZGlmZnMubGVuZ3RoIC0gMV1bMV0gPT09ICcnKSB7XG5cdFx0XHRcdGRpZmZzLnBvcCgpOyAvLyBSZW1vdmUgdGhlIGR1bW15IGVudHJ5IGF0IHRoZSBlbmQuXG5cdFx0XHR9XG5cblx0XHRcdC8vIFNlY29uZCBwYXNzOiBsb29rIGZvciBzaW5nbGUgZWRpdHMgc3Vycm91bmRlZCBvbiBib3RoIHNpZGVzIGJ5IGVxdWFsaXRpZXNcblx0XHRcdC8vIHdoaWNoIGNhbiBiZSBzaGlmdGVkIHNpZGV3YXlzIHRvIGVsaW1pbmF0ZSBhbiBlcXVhbGl0eS5cblx0XHRcdC8vIGUuZzogQTxpbnM+QkE8L2lucz5DIC0+IDxpbnM+QUI8L2lucz5BQ1xuXHRcdFx0dmFyIGNoYW5nZXMgPSBmYWxzZTtcblx0XHRcdHBvaW50ZXIgPSAxO1xuXG5cdFx0XHQvLyBJbnRlbnRpb25hbGx5IGlnbm9yZSB0aGUgZmlyc3QgYW5kIGxhc3QgZWxlbWVudCAoZG9uJ3QgbmVlZCBjaGVja2luZykuXG5cdFx0XHR3aGlsZSAocG9pbnRlciA8IGRpZmZzLmxlbmd0aCAtIDEpIHtcblx0XHRcdFx0aWYgKGRpZmZzW3BvaW50ZXIgLSAxXVswXSA9PT0gRElGRl9FUVVBTCAmJiBkaWZmc1twb2ludGVyICsgMV1bMF0gPT09IERJRkZfRVFVQUwpIHtcblx0XHRcdFx0XHR2YXIgZGlmZlBvaW50ZXIgPSBkaWZmc1twb2ludGVyXVsxXTtcblx0XHRcdFx0XHR2YXIgcG9zaXRpb24gPSBkaWZmUG9pbnRlci5zdWJzdHJpbmcoZGlmZlBvaW50ZXIubGVuZ3RoIC0gZGlmZnNbcG9pbnRlciAtIDFdWzFdLmxlbmd0aCk7XG5cblx0XHRcdFx0XHQvLyBUaGlzIGlzIGEgc2luZ2xlIGVkaXQgc3Vycm91bmRlZCBieSBlcXVhbGl0aWVzLlxuXHRcdFx0XHRcdGlmIChwb3NpdGlvbiA9PT0gZGlmZnNbcG9pbnRlciAtIDFdWzFdKSB7XG5cdFx0XHRcdFx0XHQvLyBTaGlmdCB0aGUgZWRpdCBvdmVyIHRoZSBwcmV2aW91cyBlcXVhbGl0eS5cblx0XHRcdFx0XHRcdGRpZmZzW3BvaW50ZXJdWzFdID0gZGlmZnNbcG9pbnRlciAtIDFdWzFdICsgZGlmZnNbcG9pbnRlcl1bMV0uc3Vic3RyaW5nKDAsIGRpZmZzW3BvaW50ZXJdWzFdLmxlbmd0aCAtIGRpZmZzW3BvaW50ZXIgLSAxXVsxXS5sZW5ndGgpO1xuXHRcdFx0XHRcdFx0ZGlmZnNbcG9pbnRlciArIDFdWzFdID0gZGlmZnNbcG9pbnRlciAtIDFdWzFdICsgZGlmZnNbcG9pbnRlciArIDFdWzFdO1xuXHRcdFx0XHRcdFx0ZGlmZnMuc3BsaWNlKHBvaW50ZXIgLSAxLCAxKTtcblx0XHRcdFx0XHRcdGNoYW5nZXMgPSB0cnVlO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoZGlmZlBvaW50ZXIuc3Vic3RyaW5nKDAsIGRpZmZzW3BvaW50ZXIgKyAxXVsxXS5sZW5ndGgpID09PSBkaWZmc1twb2ludGVyICsgMV1bMV0pIHtcblx0XHRcdFx0XHRcdC8vIFNoaWZ0IHRoZSBlZGl0IG92ZXIgdGhlIG5leHQgZXF1YWxpdHkuXG5cdFx0XHRcdFx0XHRkaWZmc1twb2ludGVyIC0gMV1bMV0gKz0gZGlmZnNbcG9pbnRlciArIDFdWzFdO1xuXHRcdFx0XHRcdFx0ZGlmZnNbcG9pbnRlcl1bMV0gPSBkaWZmc1twb2ludGVyXVsxXS5zdWJzdHJpbmcoZGlmZnNbcG9pbnRlciArIDFdWzFdLmxlbmd0aCkgKyBkaWZmc1twb2ludGVyICsgMV1bMV07XG5cdFx0XHRcdFx0XHRkaWZmcy5zcGxpY2UocG9pbnRlciArIDEsIDEpO1xuXHRcdFx0XHRcdFx0Y2hhbmdlcyA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHBvaW50ZXIrKztcblx0XHRcdH1cblxuXHRcdFx0Ly8gSWYgc2hpZnRzIHdlcmUgbWFkZSwgdGhlIGRpZmYgbmVlZHMgcmVvcmRlcmluZyBhbmQgYW5vdGhlciBzaGlmdCBzd2VlcC5cblx0XHRcdGlmIChjaGFuZ2VzKSB7XG5cdFx0XHRcdHRoaXMuZGlmZkNsZWFudXBNZXJnZShkaWZmcyk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRyZXR1cm4gZnVuY3Rpb24gKG8sIG4pIHtcblx0XHRcdHZhciBkaWZmLCBvdXRwdXQsIHRleHQ7XG5cdFx0XHRkaWZmID0gbmV3IERpZmZNYXRjaFBhdGNoKCk7XG5cdFx0XHRvdXRwdXQgPSBkaWZmLkRpZmZNYWluKG8sIG4pO1xuXHRcdFx0ZGlmZi5kaWZmQ2xlYW51cEVmZmljaWVuY3kob3V0cHV0KTtcblx0XHRcdHRleHQgPSBkaWZmLmRpZmZQcmV0dHlIdG1sKG91dHB1dCk7XG5cdFx0XHRyZXR1cm4gdGV4dDtcblx0XHR9O1xuXHR9KCk7XG5cbn0pKCk7Il0sIm5hbWVzIjpbIl90eXBlb2YiLCJvYmoiLCJTeW1ib2wiLCJpdGVyYXRvciIsImNvbnN0cnVjdG9yIiwicHJvdG90eXBlIiwiX2NsYXNzQ2FsbENoZWNrIiwiaW5zdGFuY2UiLCJDb25zdHJ1Y3RvciIsIlR5cGVFcnJvciIsIl9kZWZpbmVQcm9wZXJ0aWVzIiwidGFyZ2V0IiwicHJvcHMiLCJpIiwibGVuZ3RoIiwiZGVzY3JpcHRvciIsImVudW1lcmFibGUiLCJjb25maWd1cmFibGUiLCJ3cml0YWJsZSIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5Iiwia2V5IiwiX2NyZWF0ZUNsYXNzIiwicHJvdG9Qcm9wcyIsInN0YXRpY1Byb3BzIiwiX3NsaWNlZFRvQXJyYXkiLCJhcnIiLCJfYXJyYXlXaXRoSG9sZXMiLCJfaXRlcmFibGVUb0FycmF5TGltaXQiLCJfdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkiLCJfbm9uSXRlcmFibGVSZXN0IiwiX3RvQ29uc3VtYWJsZUFycmF5IiwiX2FycmF5V2l0aG91dEhvbGVzIiwiX2l0ZXJhYmxlVG9BcnJheSIsIl9ub25JdGVyYWJsZVNwcmVhZCIsIkFycmF5IiwiaXNBcnJheSIsIl9hcnJheUxpa2VUb0FycmF5IiwiaXRlciIsImZyb20iLCJfaSIsIl9hcnIiLCJfbiIsIl9kIiwiX3MiLCJfZSIsImNhbGwiLCJuZXh0IiwiZG9uZSIsInB1c2giLCJ2YWx1ZSIsImVyciIsIm8iLCJtaW5MZW4iLCJuIiwidG9TdHJpbmciLCJzbGljZSIsIm5hbWUiLCJ0ZXN0IiwibGVuIiwiYXJyMiIsIl9jcmVhdGVGb3JPZkl0ZXJhdG9ySGVscGVyIiwiYWxsb3dBcnJheUxpa2UiLCJpdCIsIkYiLCJzIiwiZSIsImYiLCJub3JtYWxDb21wbGV0aW9uIiwiZGlkRXJyIiwic3RlcCIsInJldHVybiIsImdldEdsb2JhbFRoaXMiLCJnbG9iYWxUaGlzIiwic2VsZiIsIndpbmRvdyQxIiwiZ2xvYmFsIiwiRXJyb3IiLCJnIiwid2luZG93IiwiY29uc29sZSQxIiwiY29uc29sZSIsInNldFRpbWVvdXQkMSIsInNldFRpbWVvdXQiLCJjbGVhclRpbWVvdXQiLCJkb2N1bWVudCIsIm5hdmlnYXRvciIsImxvY2FsU2Vzc2lvblN0b3JhZ2UiLCJ4Iiwic2Vzc2lvblN0b3JhZ2UiLCJzZXRJdGVtIiwicmVtb3ZlSXRlbSIsInVuZGVmaW5lZCIsIlN0cmluZ01hcCIsIk1hcCIsImtleXMiLCJpbnB1dCIsIl90aGlzIiwic3RvcmUiLCJjcmVhdGUiLCJoYXNPd24iLCJoYXNPd25Qcm9wZXJ0eSIsImhhcyIsInN0cktleSIsImdldCIsInNldCIsInZhbCIsInNpemUiLCJkZWxldGUiLCJmb3JFYWNoIiwiY2FsbGJhY2siLCJjbGVhciIsIlN0cmluZ1NldCIsIlNldCIsInZhbHVlcyIsIml0ZW0iLCJhZGQiLCJoYXNPd24kMSIsInBlcmZvcm1hbmNlIiwibm93IiwiYmluZCIsIkRhdGUiLCJkaWZmIiwiYSIsImIiLCJmaWx0ZXIiLCJpbmRleE9mIiwiaW5BcnJheSIsImluY2x1ZGVzIiwiZWxlbSIsImFycmF5Iiwib2JqZWN0VmFsdWVzIiwiYWxsb3dBcnJheSIsImFyZ3VtZW50cyIsInZhbHMiLCJpcyIsIm9iamVjdFZhbHVlc1N1YnNldCIsIm1vZGVsIiwic3Vic2V0IiwiZXh0ZW5kIiwidW5kZWZPbmx5IiwicHJvcCIsIm9iamVjdFR5cGUiLCJtYXRjaCIsInR5cGUiLCJpc05hTiIsInRvTG93ZXJDYXNlIiwiZ2VuZXJhdGVIYXNoIiwibW9kdWxlIiwidGVzdE5hbWUiLCJzdHIiLCJoYXNoIiwiY2hhckNvZGVBdCIsImhleCIsImVycm9yU3RyaW5nIiwiZXJyb3IiLCJyZXN1bHRFcnJvclN0cmluZyIsIlN0cmluZyIsIm1lc3NhZ2UiLCJjb25jYXQiLCJCT1hBQkxFX1RZUEVTIiwibWVtb3J5IiwidXNlU3RyaWN0RXF1YWxpdHkiLCJ1c2VPYmplY3RWYWx1ZUVxdWFsaXR5IiwidmFsdWVPZiIsImNvbXBhcmVDb25zdHJ1Y3RvcnMiLCJnZXRDb25zdHJ1Y3RvciIsInByb3RvIiwiZ2V0UHJvdG90eXBlT2YiLCJnZXRSZWdFeHBGbGFncyIsInJlZ2V4cCIsImZsYWdzIiwib2JqVHlwZUNhbGxiYWNrcyIsIm51bGwiLCJib29sZWFuIiwibnVtYmVyIiwic3RyaW5nIiwic3ltYm9sIiwiZGF0ZSIsIm5hbiIsInNvdXJjZSIsImZ1bmN0aW9uIiwidHlwZUVxdWl2Iiwib3V0ZXJFcSIsImFWYWwiLCJpbm5lckVxIiwiYlZhbCIsIm9yaWdpbmFsTWVtb3J5IiwibWFwIiwiYUtleSIsImJLZXkiLCJlbnRyeVR5cGVDYWxsYmFja3MiLCJvYmplY3QiLCJzb21lIiwicGFpciIsImFPYmpUeXBlIiwiYk9ialR5cGUiLCJhUHJvcGVydGllcyIsImJQcm9wZXJ0aWVzIiwic29ydCIsImFUeXBlIiwiYlR5cGUiLCJpbm5lckVxdWl2IiwicmVzIiwiZXF1aXYiLCJjb25maWciLCJhbHRlcnRpdGxlIiwiY29sbGFwc2UiLCJmYWlsT25aZXJvVGVzdHMiLCJtYXhEZXB0aCIsIm1vZHVsZUlkIiwicmVvcmRlciIsInJlcXVpcmVFeHBlY3RzIiwic2Nyb2xsdG9wIiwic3RvcmFnZSIsInRlc3RJZCIsInVybENvbmZpZyIsImN1cnJlbnRNb2R1bGUiLCJ0ZXN0cyIsImNoaWxkTW9kdWxlcyIsInRlc3RzUnVuIiwidGVzdHNJZ25vcmVkIiwiaG9va3MiLCJiZWZvcmUiLCJiZWZvcmVFYWNoIiwiYWZ0ZXJFYWNoIiwiYWZ0ZXIiLCJnbG9iYWxIb29rcyIsImJsb2NraW5nIiwiY2FsbGJhY2tzIiwibW9kdWxlcyIsInF1ZXVlIiwic3RhdHMiLCJhbGwiLCJiYWQiLCJ0ZXN0Q291bnQiLCJwcmVDb25maWciLCJRVW5pdCIsInZlcnNpb24iLCJkdW1wIiwicXVvdGUiLCJyZXBsYWNlIiwibGl0ZXJhbCIsImpvaW4iLCJwcmUiLCJwb3N0Iiwic2VwYXJhdG9yIiwiaW5uZXIiLCJpbmRlbnQiLCJiYXNlIiwic3RhY2siLCJkZXB0aCIsInVwIiwicmV0IiwicGFyc2UiLCJkb3duIiwicmVOYW1lIiwib2JqVHlwZSIsIm9iakluZGV4IiwidHlwZU9mIiwicGFyc2VyIiwicGFyc2VycyIsInBhcnNlclR5cGUiLCJwb3AiLCJzZXRJbnRlcnZhbCIsIm5vZGVUeXBlIiwibXVsdGlsaW5lIiwiSFRNTCIsImV4dHJhIiwiY2hyIiwiaW5kZW50Q2hhciIsInNldFBhcnNlciIsIl9lcnJvciIsInVua25vd24iLCJfZnVuY3Rpb24iLCJmbiIsImV4ZWMiLCJub2RlbGlzdCIsIm5vbkVudW1lcmFibGVQcm9wZXJ0aWVzIiwiX2tleSIsIl9rZXkyIiwibm9kZSIsIl9ub2RlIiwib3BlbiIsImNsb3NlIiwidGFnIiwibm9kZU5hbWUiLCJhdHRycyIsImF0dHJpYnV0ZXMiLCJub2RlVmFsdWUiLCJmdW5jdGlvbkFyZ3MiLCJsIiwiYXJncyIsImZyb21DaGFyQ29kZSIsImZ1bmN0aW9uQ29kZSIsImF0dHJpYnV0ZSIsInN5bSIsIkxvZ2dlciIsIndhcm4iLCJGdW5jdGlvbiIsImxvZyIsIlN1aXRlUmVwb3J0IiwicGFyZW50U3VpdGUiLCJmdWxsTmFtZSIsImdsb2JhbEZhaWx1cmVDb3VudCIsImNoaWxkU3VpdGVzIiwicHVzaENoaWxkU3VpdGUiLCJzdGFydCIsInJlY29yZFRpbWUiLCJfc3RhcnRUaW1lIiwic3VpdGUiLCJ0ZXN0Q291bnRzIiwidG90YWwiLCJnZXRUZXN0Q291bnRzIiwiZW5kIiwiX2VuZFRpbWUiLCJydW50aW1lIiwiZ2V0UnVudGltZSIsInN0YXR1cyIsImdldFN0YXR1cyIsInB1c2hUZXN0IiwiTWF0aCIsInJvdW5kIiwiY291bnRzIiwicGFzc2VkIiwiZmFpbGVkIiwic2tpcHBlZCIsInRvZG8iLCJyZWR1Y2UiLCJ2YWxpZCIsIl90aGlzJGdldFRlc3RDb3VudHMiLCJtb2R1bGVTdGFjayIsInJ1blN1aXRlIiwiaXNQYXJlbnRNb2R1bGVJblF1ZXVlIiwibW9kdWxlc0luUXVldWUiLCJpZ25vcmVkIiwiY3JlYXRlTW9kdWxlIiwidGVzdEVudmlyb25tZW50IiwibW9kaWZpZXJzIiwicGFyZW50TW9kdWxlIiwibW9kdWxlTmFtZSIsInN1aXRlUmVwb3J0Iiwic2tpcCIsImVudiIsInNldEhvb2tGcm9tRW52aXJvbm1lbnQiLCJlbnZpcm9ubWVudCIsInBvdGVudGlhbEhvb2siLCJtYWtlU2V0SG9vayIsImhvb2tOYW1lIiwic2V0SG9vayIsInByb2Nlc3NNb2R1bGUiLCJvcHRpb25zIiwiZXhlY3V0ZU5vdyIsIm1vZHVsZUZucyIsInByZXZNb2R1bGUiLCJjYlJldHVyblZhbHVlIiwidGhlbiIsImZvY3VzZWQkMSIsIm1vZHVsZSQxIiwib25seSIsImFwcGx5IiwiZmlsZU5hbWUiLCJzb3VyY2VGcm9tU3RhY2t0cmFjZSIsImV4dHJhY3RTdGFja3RyYWNlIiwib2Zmc2V0Iiwic3BsaXQiLCJzaGlmdCIsImluY2x1ZGUiLCJBc3NlcnQiLCJ0ZXN0Q29udGV4dCIsInRpbWVvdXQiLCJkdXJhdGlvbiIsInRpbWVvdXRIYW5kbGVyIiwiaW50ZXJuYWxSZXNldFRpbWVvdXQiLCJhc3NlcnRpb25NZXNzYWdlIiwicmVzdWx0Iiwic3RlcHMiLCJwdXNoUmVzdWx0IiwidmVyaWZ5U3RlcHMiLCJhY3R1YWxTdGVwc0Nsb25lIiwiZGVlcEVxdWFsIiwiZXhwZWN0IiwiYXNzZXJ0cyIsImV4cGVjdGVkIiwiYXN5bmMiLCJjb3VudCIsInJlcXVpcmVkQ2FsbHMiLCJpbnRlcm5hbFN0b3AiLCJhY3R1YWwiLCJuZWdhdGl2ZSIsImN1cnJlbnRBc3NlcnQiLCJjdXJyZW50IiwiYXNzZXJ0IiwicmVzdWx0SW5mbyIsImN1cnJlbnRUZXN0Iiwib2siLCJub3RPayIsIl90cnVlIiwiX2ZhbHNlIiwiZXF1YWwiLCJub3RFcXVhbCIsInByb3BFcXVhbCIsIm5vdFByb3BFcXVhbCIsInByb3BDb250YWlucyIsIm5vdFByb3BDb250YWlucyIsIm5vdERlZXBFcXVhbCIsInN0cmljdEVxdWFsIiwibm90U3RyaWN0RXF1YWwiLCJ0aHJvd3MiLCJibG9jayIsIl92YWxpZGF0ZUV4cGVjdGVkRXhjZSIsInZhbGlkYXRlRXhwZWN0ZWRFeGNlcHRpb25BcmdzIiwiX3ZhbGlkYXRlRXhwZWN0ZWRFeGNlMiIsImlnbm9yZUdsb2JhbEVycm9ycyIsIl92YWxpZGF0ZUV4Y2VwdGlvbiIsInZhbGlkYXRlRXhjZXB0aW9uIiwiX3ZhbGlkYXRlRXhjZXB0aW9uMiIsInJlamVjdHMiLCJwcm9taXNlIiwiX3ZhbGlkYXRlRXhwZWN0ZWRFeGNlMyIsIl92YWxpZGF0ZUV4cGVjdGVkRXhjZTQiLCJoYW5kbGVGdWxmaWxsbWVudCIsImhhbmRsZVJlamVjdGlvbiIsIl92YWxpZGF0ZUV4Y2VwdGlvbjMiLCJfdmFsaWRhdGVFeGNlcHRpb240IiwiYXNzZXJ0aW9uTWV0aG9kIiwiZXhwZWN0ZWRUeXBlIiwicmFpc2VzIiwiTElTVEVORVJTIiwiU1VQUE9SVEVEX0VWRU5UUyIsImVtaXQiLCJldmVudE5hbWUiLCJkYXRhIiwib3JpZ2luYWxDYWxsYmFja3MiLCJvbiIsImV2ZW50cyIsImNvbW1vbmpzR2xvYmFsIiwiY29tbW9uanNSZXF1aXJlIiwicGF0aCIsInByb21pc2VQb2x5ZmlsbCIsImV4cG9ydHMiLCJnbG9iYWxOUyIsImZpbmFsbHlDb25zdHJ1Y3RvciIsInJlc29sdmUiLCJyZWFzb24iLCJyZWplY3QiLCJhbGxTZXR0bGVkIiwiUCIsInJlbWFpbmluZyIsInNldFRpbWVvdXRGdW5jIiwiQm9vbGVhbiIsIm5vb3AiLCJ0aGlzQXJnIiwiUHJvbWlzZSIsIl9zdGF0ZSIsIl9oYW5kbGVkIiwiX3ZhbHVlIiwiX2RlZmVycmVkcyIsImRvUmVzb2x2ZSIsImhhbmRsZSIsImRlZmVycmVkIiwiX2ltbWVkaWF0ZUZuIiwiY2IiLCJvbkZ1bGZpbGxlZCIsIm9uUmVqZWN0ZWQiLCJuZXdWYWx1ZSIsImZpbmFsZSIsIl91bmhhbmRsZWRSZWplY3Rpb25GbiIsIkhhbmRsZXIiLCJleCIsInByb20iLCJyYWNlIiwic2V0SW1tZWRpYXRlIiwiX1Byb21pc2UiLCJyZWdpc3RlckxvZ2dpbmdDYWxsYmFja3MiLCJjYWxsYmFja05hbWVzIiwicmVnaXN0ZXJMb2dnaW5nQ2FsbGJhY2siLCJsb2dnaW5nQ2FsbGJhY2siLCJydW5Mb2dnaW5nQ2FsbGJhY2tzIiwicHJvbWlzZUNoYWluIiwicHJpb3JpdHlDb3VudCIsInVuaXRTYW1wbGVyIiwidGFza1F1ZXVlIiwiYWR2YW5jZSIsImFkdmFuY2VUYXNrUXVldWUiLCJhZHZhbmNlVGVzdFF1ZXVlIiwicHJvY2Vzc1Rhc2tRdWV1ZSIsImVsYXBzZWRUaW1lIiwidXBkYXRlUmF0ZSIsInRhc2siLCJ0ZXN0VGFza3MiLCJhZGRUb1Rhc2tRdWV1ZSIsInRhc2tzQXJyYXkiLCJ0YXNrUXVldWVMZW5ndGgiLCJhZGRUb1Rlc3RRdWV1ZSIsInRlc3RUYXNrc0Z1bmMiLCJwcmlvcml0aXplIiwic2VlZCIsInNwbGljZSIsInVuaXRTYW1wbGVyR2VuZXJhdG9yIiwiaW5kZXgiLCJmbG9vciIsInNhbXBsZSIsInBhcnNlSW50IiwidmFsaWRUZXN0Iiwic3RhcnRlZCIsIlByb2Nlc3NpbmdRdWV1ZSIsImZpbmlzaGVkIiwidGFza0NvdW50IiwiVGVzdFJlcG9ydCIsInN1aXRlTmFtZSIsImFzc2VydGlvbnMiLCJlcnJvcnMiLCJnZXRGYWlsZWRBc3NlcnRpb25zIiwiZ2V0QXNzZXJ0aW9ucyIsInB1c2hBc3NlcnRpb24iLCJhc3NlcnRpb24iLCJ0ZXN0UGFzc2VkIiwic2xpbUFzc2VydGlvbnMiLCJUZXN0Iiwic2V0dGluZ3MiLCJ3aXRoRGF0YSIsInBhdXNlcyIsIm5leHRQYXVzZUlkIiwic3RhY2tPZmZzZXQiLCJtZXRob2QiLCJlcnJvckZvclN0YWNrIiwidGVzdFJlcG9ydCIsImdldE5vdFN0YXJ0ZWRNb2R1bGVzIiwic3RhcnRNb2R1bGUiLCJyZXZlcnNlIiwibm90U3RhcnRlZE1vZHVsZXMiLCJtb2R1bGVTdGFydENoYWluIiwicHJldmlvdXNGYWlsdXJlIiwicG9sbHV0aW9uIiwic2F2ZUdsb2JhbCIsInJ1biIsIm5vdHJ5Y2F0Y2giLCJydW5UZXN0IiwicHVzaEZhaWx1cmUiLCJpbnRlcm5hbFJlY292ZXIiLCJyZXNvbHZlUHJvbWlzZSIsImNoZWNrUG9sbHV0aW9uIiwicXVldWVHbG9iYWxIb29rIiwiaG9vayIsIl90aGlzMiIsInJ1bkhvb2siLCJxdWV1ZUhvb2siLCJob29rT3duZXIiLCJfdGhpczMiLCJjYWxsSG9vayIsInByZXNlcnZlRW52aXJvbm1lbnQiLCJsYXN0VGVzdFdpdGhpbk1vZHVsZUV4ZWN1dGVkIiwiaGFuZGxlciIsInByb2Nlc3NHbG9iYWxob29rcyIsInByb2Nlc3NIb29rcyIsImZpbmlzaCIsInN0ZXBzTGlzdCIsImluY3JlbWVudFRlc3RzSWdub3JlZCIsImluY3JlbWVudFRlc3RzUnVuIiwiYWxsVGVzdHNFeGVjdXRlZCIsImNvbXBsZXRlZE1vZHVsZXMiLCJwYXJlbnQiLCJtb2R1bGVEb25lQ2hhaW4iLCJjb21wbGV0ZWRNb2R1bGUiLCJsb2dTdWl0ZUVuZCIsIm5leHRNb2R1bGUiLCJwcmVzZXJ2ZVRlc3RFbnZpcm9ubWVudCIsInByZXZpb3VzRmFpbENvdW50IiwiZ2V0SXRlbSIsImRldGFpbHMiLCJsb2dBc3NlcnRpb24iLCJ0aW1lb3V0RHVyYXRpb24iLCJwYXVzZUlkIiwicGF1c2UiLCJjYW5jZWxsZWQiLCJyZWxlYXNlIiwiaW50ZXJuYWxTdGFydCIsInRlc3RUaW1lb3V0IiwicGhhc2UiLCJfdGVzdCIsInJlc3VtZSIsIm1vZHVsZUNoYWluSWRNYXRjaCIsInRlc3RNb2R1bGUiLCJzZWxlY3RlZElkIiwibW9kdWxlQ2hhaW5OYW1lTWF0Y2giLCJzZWxlY3RlZE1vZHVsZSIsInRlc3RNb2R1bGVOYW1lIiwicmVnZXhGaWx0ZXIiLCJzdHJpbmdGaWx0ZXIiLCJleGNsdWRlIiwicGF0dGVybiIsInJlZ2V4IiwiUmVnRXhwIiwiY2hhckF0Iiwibm9nbG9iYWxzIiwib2xkIiwibmV3R2xvYmFscyIsImRlbGV0ZWRHbG9iYWxzIiwiZm9jdXNlZCIsImFkZFRlc3QiLCJuZXdUZXN0IiwiYWRkT25seVRlc3QiLCJtYWtlRWFjaFRlc3ROYW1lIiwiYXJndW1lbnQiLCJydW5FYWNoIiwiZWFjaEZuIiwiZWFjaCIsImRhdGFzZXQiLCJ0ZXN0S2V5IiwiXyIsImNvbGxlY3RUZXN0cyIsImV4cG9ydFFVbml0IiwiZXhwb3J0ZWRNb2R1bGUiLCJkZWZpbmUiLCJhbWQiLCJhdXRvc3RhcnQiLCJDb25zb2xlUmVwb3J0ZXIiLCJydW5uZXIiLCJvbkVycm9yIiwib25SdW5TdGFydCIsIm9uVGVzdFN0YXJ0Iiwib25UZXN0RW5kIiwib25SdW5FbmQiLCJydW5TdGFydCIsInJ1bkVuZCIsImluaXQiLCJuYXRpdmVQZXJmIiwibWFyayIsIm1lYXN1cmUiLCJwZXJmIiwiY29tbWVudCIsInN0YXJ0TWFyayIsImVuZE1hcmsiLCJQZXJmUmVwb3J0ZXIiLCJvblN1aXRlU3RhcnQiLCJvblN1aXRlRW5kIiwic3VpdGVTdGFydCIsInN1aXRlTGV2ZWwiLCJzdWl0ZUVuZCIsInRlc3RFbmQiLCJGT1JDRV9DT0xPUiIsIk5PREVfRElTQUJMRV9DT0xPUlMiLCJOT19DT0xPUiIsIlRFUk0iLCJpc1RUWSIsInByb2Nlc3MiLCJfcmVmIiwic3Rkb3V0IiwiJCIsImVuYWJsZWQiLCJyZXNldCIsImJvbGQiLCJkaW0iLCJpdGFsaWMiLCJ1bmRlcmxpbmUiLCJpbnZlcnNlIiwiaGlkZGVuIiwic3RyaWtldGhyb3VnaCIsImJsYWNrIiwicmVkIiwiZ3JlZW4iLCJ5ZWxsb3ciLCJibHVlIiwibWFnZW50YSIsImN5YW4iLCJ3aGl0ZSIsImdyYXkiLCJncmV5IiwiYmdCbGFjayIsImJnUmVkIiwiYmdHcmVlbiIsImJnWWVsbG93IiwiYmdCbHVlIiwiYmdNYWdlbnRhIiwiYmdDeWFuIiwiYmdXaGl0ZSIsInRtcCIsImJlZyIsInJneCIsImNoYWluIiwiY3R4IiwiYmxrIiwidHh0IiwicHJldHR5WWFtbFZhbHVlIiwiaXNGaW5pdGUiLCJKU09OIiwic3RyaW5naWZ5IiwiclNwZWNpYWxKc29uIiwiclNwZWNpYWxZYW1sIiwiclVudHJpbW1lZCIsInJOdW1lcmljYWwiLCJyQm9vbCIsInByZWZpeCIsInRyYWlsaW5nTGluZWJyZWFrTWF0Y2giLCJ0cmFpbGluZ0xpbmVicmVha3MiLCJsaW5lcyIsImxpbmUiLCJfbGluZXMiLCJkZWN5Y2xlZFNoYWxsb3dDbG9uZSIsImFuY2VzdG9ycyIsImNsb25lIiwiZWxlbWVudCIsIlRhcFJlcG9ydGVyIiwiZW5kZWQiLCJiYWlsZWQiLCJfcnVuU3VpdGUiLCJsb2dFcnJvciIsInNldmVyaXR5Iiwib3V0IiwicmVwb3J0ZXJzIiwidGFwIiwibWFrZUFkZEdsb2JhbEhvb2siLCJhZGRHbG9iYWxIb29rIiwib25VbmNhdWdodEV4Y2VwdGlvbiIsIm9uV2luZG93RXJyb3IiLCJzdGFja3RyYWNlIiwibGluZU51bWJlciIsImdsb2JhbFN0YXJ0Q2FsbGVkIiwicnVuU3RhcnRlZCIsImlzTG9jYWwiLCJsb2NhdGlvbiIsInByb3RvY29sIiwiZ2xvYmFsU3RhcnRBbHJlYWR5Q2FsbGVkIiwicGFnZUxvYWRlZCIsImxvYWQiLCJzY2hlZHVsZUJlZ2luIiwib25VbmhhbmRsZWRSZWplY3Rpb24iLCJleHRlbmQkMSIsIl9sZW4iLCJiZWdpbiIsInVuYmxvY2tBbmRBZHZhbmNlUXVldWUiLCJtb2R1bGVzTG9nIiwidG90YWxUZXN0cyIsInN0b3JlRml4dHVyZSIsImZpeHR1cmUiLCJnZXRFbGVtZW50QnlJZCIsImNsb25lTm9kZSIsInJlc2V0Rml4dHVyZSIsInJlc2V0Rml4dHVyZVR5cGUiLCJuZXdGaXh0dXJlIiwiY3JlYXRlRWxlbWVudCIsInNldEF0dHJpYnV0ZSIsImlubmVySFRNTCIsInBhcmVudE5vZGUiLCJyZXBsYWNlQ2hpbGQiLCJjbG9uZWRGaXh0dXJlIiwidGVzdFN0YXJ0IiwidXJsUGFyYW1zIiwiZ2V0VXJsUGFyYW1zIiwicmFuZG9tIiwiaWQiLCJsYWJlbCIsInRvb2x0aXAiLCJvcHRpb24iLCJwYXJhbXMiLCJzZWFyY2giLCJwYXJhbSIsImRlY29kZVF1ZXJ5UGFyYW0iLCJkZWNvZGVVUklDb21wb25lbnQiLCJmdXp6eXNvcnQkMSIsInJvb3QiLCJVTUQiLCJmdXp6eXNvcnQiLCJmdXp6eXNvcnROZXciLCJpbnN0YW5jZU9wdGlvbnMiLCJzaW5nbGUiLCJzY29yZSIsImluZGV4ZXMiLCJpc09iaiIsImdldFByZXBhcmVkU2VhcmNoIiwiZ2V0UHJlcGFyZWQiLCJhbGxvd1R5cG8iLCJhbGdvcml0aG0iLCJhbGdvcml0aG1Ob1R5cG8iLCJnbyIsInRhcmdldHMiLCJub1Jlc3VsdHMiLCJwcmVwYXJlU2VhcmNoIiwic2VhcmNoTG93ZXJDb2RlIiwidGhyZXNob2xkIiwibGltaXQiLCJyZXN1bHRzTGVuIiwibGltaXRlZENvdW50IiwidGFyZ2V0c0xlbiIsInNjb3JlRm4iLCJkZWZhdWx0U2NvcmVGbiIsImtleXNMZW4iLCJvYmpSZXN1bHRzIiwia2V5SSIsImdldFZhbHVlIiwicSIsInBlZWsiLCJyZXBsYWNlVG9wIiwiX3RhcmdldExvd2VyQ29kZXMiLCJfbmV4dEJlZ2lubmluZ0luZGV4ZXMiLCJyZXN1bHRzIiwicG9sbCIsImdvQXN5bmMiLCJjYW5jZWxlZCIsInAiLCJmYXN0cHJpb3JpdHlxdWV1ZSIsImlDdXJyZW50Iiwic3RhcnRNcyIsImlzTm9kZSIsImNhbmNlbCIsImhpZ2hsaWdodCIsImhPcGVuIiwiaENsb3NlIiwiaGlnaGxpZ2h0Q2FsbGJhY2siLCJoaWdobGlnaHRlZCIsIm1hdGNoZXNJbmRleCIsIm9wZW5lZCIsInRhcmdldExlbiIsIm1hdGNoZXNCZXN0IiwiY2hhciIsInN1YnN0ciIsIm1hdGNoSSIsImluZGV4ZXNJIiwicHJlcGFyZSIsInByZXBhcmVMb3dlckNvZGVzIiwicHJlcGFyZVNsb3ciLCJwcmVwYXJlTmV4dEJlZ2lubmluZ0luZGV4ZXMiLCJ0YXJnZXRQcmVwYXJlZCIsInByZXBhcmVkQ2FjaGUiLCJzZWFyY2hQcmVwYXJlZCIsInByZXBhcmVkU2VhcmNoQ2FjaGUiLCJzZWFyY2hMb3dlckNvZGVzIiwicHJlcGFyZWQiLCJ0YXJnZXRMb3dlckNvZGVzIiwic2VhcmNoTGVuIiwic2VhcmNoSSIsInRhcmdldEkiLCJ0eXBvU2ltcGxlSSIsIm1hdGNoZXNTaW1wbGVMZW4iLCJpc01hdGNoIiwibWF0Y2hlc1NpbXBsZSIsInNlYXJjaExvd2VyQ29kZU5ldyIsInR5cG9TdHJpY3RJIiwic3VjY2Vzc1N0cmljdCIsIm1hdGNoZXNTdHJpY3RMZW4iLCJuZXh0QmVnaW5uaW5nSW5kZXhlcyIsImZpcnN0UG9zc2libGVJIiwibGFzdE1hdGNoIiwibWF0Y2hlc1N0cmljdCIsIm1hdGNoZXNCZXN0TGVuIiwibGFzdFRhcmdldEkiLCJzdHJMZW4iLCJsb3dlckNvZGVzIiwibG93ZXIiLCJwcmVwYXJlQmVnaW5uaW5nSW5kZXhlcyIsImJlZ2lubmluZ0luZGV4ZXMiLCJiZWdpbm5pbmdJbmRleGVzTGVuIiwid2FzVXBwZXIiLCJ3YXNBbHBoYW51bSIsInRhcmdldENvZGUiLCJpc1VwcGVyIiwiaXNBbHBoYW51bSIsImlzQmVnaW5uaW5nIiwibGFzdElzQmVnaW5uaW5nIiwibGFzdElzQmVnaW5uaW5nSSIsImNsZWFudXAiLCJuZXciLCJNeU1hcCIsImsiLCJtYXgiLCJzZWdzIiwiciIsImMiLCJmYWlsZWRUZXN0cyIsImRlZmluZWQiLCJjb21wbGV0ZWQiLCJlc2NhcGVUZXh0IiwiaGlkZGVuVGVzdHMiLCJjb2xsYXBzZU5leHQiLCJ1bmZpbHRlcmVkVXJsIiwic2V0VXJsIiwiZHJvcGRvd25EYXRhIiwidHJpbSIsImFkZEV2ZW50IiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZUV2ZW50IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImFkZEV2ZW50cyIsImVsZW1zIiwiaGFzQ2xhc3MiLCJjbGFzc05hbWUiLCJhZGRDbGFzcyIsInRvZ2dsZUNsYXNzIiwiZm9yY2UiLCJyZW1vdmVDbGFzcyIsImFib3J0VGVzdHMiLCJhYm9ydEJ1dHRvbiIsImRpc2FibGVkIiwiaW50ZXJjZXB0TmF2aWdhdGlvbiIsImV2IiwiZmlsdGVySW5wdXRFbGVtIiwiYXBwbHlVcmxQYXJhbXMiLCJwcmV2ZW50RGVmYXVsdCIsImdldFVybENvbmZpZ0h0bWwiLCJzZWxlY3Rpb24iLCJ1cmxDb25maWdIdG1sIiwiZXNjYXBlZCIsImVzY2FwZWRUb29sdGlwIiwiaiIsIl9qIiwidG9vbGJhckNoYW5nZWQiLCJmaWVsZCIsInNlbGVjdGVkSW5kZXgiLCJjaGVja2VkIiwiZGVmYXVsdFZhbHVlIiwidXBkYXRlZFVybCIsImhpc3RvcnkiLCJjaGlsZHJlbiIsImNsYXNzTmFtZUhhc1Bhc3MiLCJjbGFzc05hbWVIYXNTa2lwcGVkIiwiX2l0ZXJhdG9yIiwiX3N0ZXAiLCJoaWRkZW5UZXN0IiwicmVtb3ZlQ2hpbGQiLCJhcHBlbmRDaGlsZCIsInJlcGxhY2VTdGF0ZSIsInF1ZXJ5c3RyaW5nIiwiYXJyVmFsdWUiLCJlbmNvZGVVUklDb21wb25lbnQiLCJob3N0IiwicGF0aG5hbWUiLCJzZWxlY3RlZE1hcCIsInRvb2xiYXJVcmxDb25maWdDb250YWluZXIiLCJ1cmxDb25maWdDb250YWluZXIiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsImFib3J0VGVzdHNCdXR0b24iLCJidXR0b24iLCJ0b29sYmFyTG9vc2VGaWx0ZXIiLCJjcmVhdGVUZXh0Tm9kZSIsImNyZWF0ZU1vZHVsZUxpc3RJdGVtIiwibW9kdWxlTGlzdEh0bWwiLCJodG1sIiwibW9kIiwidG9vbGJhck1vZHVsZUZpbHRlciIsImJlZ2luRGV0YWlscyIsImluaXRpYWxTZWxlY3RlZCIsImlzRGlydHkiLCJtb2R1bGVTZWFyY2giLCJhdXRvY29tcGxldGUiLCJzZWFyY2hJbnB1dCIsInNlYXJjaEZvY3VzIiwiaHRtbEZvciIsInRleHRDb250ZW50Iiwic2VhcmNoQ29udGFpbmVyIiwiYXBwbHlCdXR0b24iLCJ0aXRsZSIsInJlc2V0QnV0dG9uIiwiY2xlYXJCdXR0b24iLCJzZWxlY3Rpb25DaGFuZ2UiLCJhY3Rpb25zIiwiZHJvcERvd25MaXN0IiwiZHJvcERvd24iLCJzdHlsZSIsImRpc3BsYXkiLCJtb2R1bGVGaWx0ZXIiLCJoaWRlSGFuZGxlciIsImluQ29udGFpbmVyIiwiY29udGFpbnMiLCJrZXlDb2RlIiwiZm9jdXMiLCJmaWx0ZXJNb2R1bGVzIiwic2VhcmNoVGV4dCIsInNlYXJjaElucHV0VGltZW91dCIsImV2dCIsImNoZWNrYm94IiwidGV4dEZvcm0iLCJwbGFjZWhvbGRlciIsImFwcGVuZFRvb2xiYXIiLCJ0b29sYmFyIiwidG9vbGJhckZpbHRlcnMiLCJjbGVhcmZpeCIsImFwcGVuZEhlYWRlciIsImhlYWRlciIsImFwcGVuZEJhbm5lciIsImJhbm5lciIsImFwcGVuZFRlc3RSZXN1bHRzIiwiY29udHJvbHMiLCJpbnNlcnRCZWZvcmUiLCJhcHBlbmRGaWx0ZXJlZFRlc3QiLCJhcHBlbmRVc2VyQWdlbnQiLCJ1c2VyQWdlbnQiLCJhcHBlbmRJbnRlcmZhY2UiLCJxdW5pdCIsImFwcGVuZFRlc3QiLCJnZXROYW1lSHRtbCIsInRlc3RCbG9jayIsInJlcnVuVHJpZ2dlciIsImhyZWYiLCJhc3NlcnRMaXN0IiwiZ2V0UmVydW5GYWlsZWRIdG1sIiwiYXNzZXJ0UGFzc2VkIiwiYXNzZXJ0TGkiLCJzY3JvbGxUbyIsIm5hbWVIdG1sIiwiZ2V0UHJvZ3Jlc3NIdG1sIiwicnVubmluZyIsInN0cmlwSHRtbCIsInRlc3RJdGVtIiwic2hvd0RpZmYiLCJ0ZXN0RG9uZSIsImdvb2QiLCJ0ZXN0VGl0bGUiLCJmaXJzdENoaWxkIiwidG9kb0xhYmVsIiwidGltZSIsInNvdXJjZU5hbWUiLCJoaWRlcGFzc2VkIiwidXNpbmdQaGFudG9tIiwibWFqb3IiLCJwaGFudG9tIiwicmVhZHlTdGF0ZSIsIm9yaWdpbmFsV2luZG93T25FcnJvciIsIm9uZXJyb3IiLCJjb2x1bW5OdW1iZXIiLCJlcnJvck9iaiIsImV2ZW50IiwiRGlmZk1hdGNoUGF0Y2giLCJESUZGX0RFTEVURSIsIkRJRkZfSU5TRVJUIiwiRElGRl9FUVVBTCIsIkRpZmZNYWluIiwidGV4dDEiLCJ0ZXh0MiIsIm9wdENoZWNrbGluZXMiLCJkZWFkbGluZSIsImNvbW1vbmxlbmd0aCIsImRpZmZDb21tb25QcmVmaXgiLCJjb21tb25wcmVmaXgiLCJzdWJzdHJpbmciLCJkaWZmQ29tbW9uU3VmZml4IiwiY29tbW9uc3VmZml4IiwiZGlmZnMiLCJkaWZmQ29tcHV0ZSIsInVuc2hpZnQiLCJkaWZmQ2xlYW51cE1lcmdlIiwiZGlmZkNsZWFudXBFZmZpY2llbmN5IiwiY2hhbmdlcyIsImVxdWFsaXRpZXMiLCJlcXVhbGl0aWVzTGVuZ3RoIiwibGFzdGVxdWFsaXR5IiwicG9pbnRlciIsInByZUlucyIsInByZURlbCIsInBvc3RJbnMiLCJwb3N0RGVsIiwiZGlmZlByZXR0eUh0bWwiLCJvcCIsInBvaW50ZXJtaWQiLCJwb2ludGVybWF4IiwicG9pbnRlcm1pbiIsInBvaW50ZXJzdGFydCIsIm1pbiIsInBvaW50ZXJlbmQiLCJjaGVja2xpbmVzIiwibG9uZ3RleHQiLCJzaG9ydHRleHQiLCJobSIsInRleHQxQSIsInRleHQyQSIsInRleHQxQiIsInRleHQyQiIsIm1pZENvbW1vbiIsImRpZmZzQSIsImRpZmZzQiIsImRpZmZIYWxmTWF0Y2giLCJkaWZmTGluZU1vZGUiLCJkaWZmQmlzZWN0IiwiZG1wIiwiaG0xIiwiaG0yIiwiZGlmZkhhbGZNYXRjaEkiLCJiZXN0Q29tbW9uIiwicHJlZml4TGVuZ3RoIiwic3VmZml4TGVuZ3RoIiwiYmVzdExvbmd0ZXh0QSIsImJlc3RMb25ndGV4dEIiLCJiZXN0U2hvcnR0ZXh0QSIsImJlc3RTaG9ydHRleHRCIiwiY2VpbCIsImxpbmVhcnJheSIsImNvdW50SW5zZXJ0IiwiY291bnREZWxldGUiLCJ0ZXh0SW5zZXJ0IiwidGV4dERlbGV0ZSIsImRpZmZMaW5lc1RvQ2hhcnMiLCJjaGFyczEiLCJjaGFyczIiLCJsaW5lQXJyYXkiLCJkaWZmQ2hhcnNUb0xpbmVzIiwiZGlmZkNsZWFudXBTZW1hbnRpYyIsInRleHQxTGVuZ3RoIiwidGV4dDJMZW5ndGgiLCJtYXhEIiwidk9mZnNldCIsInZMZW5ndGgiLCJ2MSIsInYyIiwiZGVsdGEiLCJmcm9udCIsImsxc3RhcnQiLCJrMWVuZCIsImsyc3RhcnQiLCJrMmVuZCIsImsyT2Zmc2V0IiwiazFPZmZzZXQiLCJ4MSIsIngyIiwieTEiLCJ5MiIsImQiLCJrMSIsImsyIiwiZGlmZkJpc2VjdFNwbGl0IiwieSIsInRleHQxYSIsInRleHQxYiIsInRleHQyYSIsInRleHQyYiIsImRpZmZzYiIsImxlbmd0aEluc2VydGlvbnMxIiwibGVuZ3RoRGVsZXRpb25zMSIsImxlbmd0aEluc2VydGlvbnMyIiwibGVuZ3RoRGVsZXRpb25zMiIsImRlbGV0aW9uIiwiaW5zZXJ0aW9uIiwib3ZlcmxhcExlbmd0aDEiLCJvdmVybGFwTGVuZ3RoMiIsImRpZmZDb21tb25PdmVybGFwIiwidGV4dExlbmd0aCIsImJlc3QiLCJmb3VuZCIsImxpbmVIYXNoIiwiZGlmZkxpbmVzVG9DaGFyc011bmdlIiwidGV4dCIsImNoYXJzIiwibGluZVN0YXJ0IiwibGluZUVuZCIsImxpbmVBcnJheUxlbmd0aCIsImRpZmZQb2ludGVyIiwicG9zaXRpb24iLCJvdXRwdXQiXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0NBT0MsR0FDQSxDQUFBO0lBQ0E7SUFFQSxTQUFTQSxRQUFRQyxHQUFHO1FBQ25CO1FBRUEsT0FBT0QsVUFBVSxjQUFjLE9BQU9FLFVBQVUsWUFBWSxPQUFPQSxPQUFPQyxRQUFRLEdBQUcsU0FBVUYsR0FBRztZQUNqRyxPQUFPLE9BQU9BO1FBQ2YsSUFBSSxTQUFVQSxHQUFHO1lBQ2hCLE9BQU9BLE9BQU8sY0FBYyxPQUFPQyxVQUFVRCxJQUFJRyxXQUFXLEtBQUtGLFVBQVVELFFBQVFDLE9BQU9HLFNBQVMsR0FBRyxXQUFXLE9BQU9KO1FBQ3pILEdBQUdELFFBQVFDO0lBQ1o7SUFDQSxTQUFTSyxnQkFBZ0JDLFFBQVEsRUFBRUMsV0FBVztRQUM3QyxJQUFJLENBQUVELENBQUFBLG9CQUFvQkMsV0FBVSxHQUFJO1lBQ3ZDLE1BQU0sSUFBSUMsVUFBVTtRQUNyQjtJQUNEO0lBQ0EsU0FBU0Msa0JBQWtCQyxNQUFNLEVBQUVDLEtB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