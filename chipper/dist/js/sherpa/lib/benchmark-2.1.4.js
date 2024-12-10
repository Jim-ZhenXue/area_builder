(function() {
    'use strict';
    /** Used as a safe reference for `undefined` in pre ES5 environments. */ var undefined;
    /** Used to determine if values are of the language type Object. */ var objectTypes = {
        'function': true,
        'object': true
    };
    /** Used as a reference to the global object. */ var root = objectTypes[typeof window] && window || this;
    /** Detect free variable `define`. */ var freeDefine = typeof define == 'function' && typeof define.amd == 'object' && define.amd && define;
    /** Detect free variable `exports`. */ var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
    /** Detect free variable `module`. */ var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;
    /** Detect free variable `global` from Node.js or Browserified code and use it as `root`. */ var freeGlobal = freeExports && freeModule && typeof global == 'object' && global;
    if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
        root = freeGlobal;
    }
    /** Detect free variable `require`. */ var freeRequire = typeof require == 'function' && require;
    /** Used to assign each benchmark an incremented id. */ var counter = 0;
    /** Detect the popular CommonJS extension `module.exports`. */ var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;
    /** Used to detect primitive types. */ var rePrimitive = /^(?:boolean|number|string|undefined)$/;
    /** Used to make every compiled test unique. */ var uidCounter = 0;
    /** Used to assign default `context` object properties. */ var contextProps = [
        'Array',
        'Date',
        'Function',
        'Math',
        'Object',
        'RegExp',
        'String',
        '_',
        'clearTimeout',
        'chrome',
        'chromium',
        'document',
        'navigator',
        'phantom',
        'platform',
        'process',
        'runtime',
        'setTimeout'
    ];
    /** Used to avoid hz of Infinity. */ var divisors = {
        '1': 4096,
        '2': 512,
        '3': 64,
        '4': 8,
        '5': 0
    };
    /**
   * T-Distribution two-tailed critical values for 95% confidence.
   * For more info see http://www.itl.nist.gov/div898/handbook/eda/section3/eda3672.htm.
   */ var tTable = {
        '1': 12.706,
        '2': 4.303,
        '3': 3.182,
        '4': 2.776,
        '5': 2.571,
        '6': 2.447,
        '7': 2.365,
        '8': 2.306,
        '9': 2.262,
        '10': 2.228,
        '11': 2.201,
        '12': 2.179,
        '13': 2.16,
        '14': 2.145,
        '15': 2.131,
        '16': 2.12,
        '17': 2.11,
        '18': 2.101,
        '19': 2.093,
        '20': 2.086,
        '21': 2.08,
        '22': 2.074,
        '23': 2.069,
        '24': 2.064,
        '25': 2.06,
        '26': 2.056,
        '27': 2.052,
        '28': 2.048,
        '29': 2.045,
        '30': 2.042,
        'infinity': 1.96
    };
    /**
   * Critical Mann-Whitney U-values for 95% confidence.
   * For more info see http://www.saburchill.com/IBbiology/stats/003.html.
   */ var uTable = {
        '5': [
            0,
            1,
            2
        ],
        '6': [
            1,
            2,
            3,
            5
        ],
        '7': [
            1,
            3,
            5,
            6,
            8
        ],
        '8': [
            2,
            4,
            6,
            8,
            10,
            13
        ],
        '9': [
            2,
            4,
            7,
            10,
            12,
            15,
            17
        ],
        '10': [
            3,
            5,
            8,
            11,
            14,
            17,
            20,
            23
        ],
        '11': [
            3,
            6,
            9,
            13,
            16,
            19,
            23,
            26,
            30
        ],
        '12': [
            4,
            7,
            11,
            14,
            18,
            22,
            26,
            29,
            33,
            37
        ],
        '13': [
            4,
            8,
            12,
            16,
            20,
            24,
            28,
            33,
            37,
            41,
            45
        ],
        '14': [
            5,
            9,
            13,
            17,
            22,
            26,
            31,
            36,
            40,
            45,
            50,
            55
        ],
        '15': [
            5,
            10,
            14,
            19,
            24,
            29,
            34,
            39,
            44,
            49,
            54,
            59,
            64
        ],
        '16': [
            6,
            11,
            15,
            21,
            26,
            31,
            37,
            42,
            47,
            53,
            59,
            64,
            70,
            75
        ],
        '17': [
            6,
            11,
            17,
            22,
            28,
            34,
            39,
            45,
            51,
            57,
            63,
            67,
            75,
            81,
            87
        ],
        '18': [
            7,
            12,
            18,
            24,
            30,
            36,
            42,
            48,
            55,
            61,
            67,
            74,
            80,
            86,
            93,
            99
        ],
        '19': [
            7,
            13,
            19,
            25,
            32,
            38,
            45,
            52,
            58,
            65,
            72,
            78,
            85,
            92,
            99,
            106,
            113
        ],
        '20': [
            8,
            14,
            20,
            27,
            34,
            41,
            48,
            55,
            62,
            69,
            76,
            83,
            90,
            98,
            105,
            112,
            119,
            127
        ],
        '21': [
            8,
            15,
            22,
            29,
            36,
            43,
            50,
            58,
            65,
            73,
            80,
            88,
            96,
            103,
            111,
            119,
            126,
            134,
            142
        ],
        '22': [
            9,
            16,
            23,
            30,
            38,
            45,
            53,
            61,
            69,
            77,
            85,
            93,
            101,
            109,
            117,
            125,
            133,
            141,
            150,
            158
        ],
        '23': [
            9,
            17,
            24,
            32,
            40,
            48,
            56,
            64,
            73,
            81,
            89,
            98,
            106,
            115,
            123,
            132,
            140,
            149,
            157,
            166,
            175
        ],
        '24': [
            10,
            17,
            25,
            33,
            42,
            50,
            59,
            67,
            76,
            85,
            94,
            102,
            111,
            120,
            129,
            138,
            147,
            156,
            165,
            174,
            183,
            192
        ],
        '25': [
            10,
            18,
            27,
            35,
            44,
            53,
            62,
            71,
            80,
            89,
            98,
            107,
            117,
            126,
            135,
            145,
            154,
            163,
            173,
            182,
            192,
            201,
            211
        ],
        '26': [
            11,
            19,
            28,
            37,
            46,
            55,
            64,
            74,
            83,
            93,
            102,
            112,
            122,
            132,
            141,
            151,
            161,
            171,
            181,
            191,
            200,
            210,
            220,
            230
        ],
        '27': [
            11,
            20,
            29,
            38,
            48,
            57,
            67,
            77,
            87,
            97,
            107,
            118,
            125,
            138,
            147,
            158,
            168,
            178,
            188,
            199,
            209,
            219,
            230,
            240,
            250
        ],
        '28': [
            12,
            21,
            30,
            40,
            50,
            60,
            70,
            80,
            90,
            101,
            111,
            122,
            132,
            143,
            154,
            164,
            175,
            186,
            196,
            207,
            218,
            228,
            239,
            250,
            261,
            272
        ],
        '29': [
            13,
            22,
            32,
            42,
            52,
            62,
            73,
            83,
            94,
            105,
            116,
            127,
            138,
            149,
            160,
            171,
            182,
            193,
            204,
            215,
            226,
            238,
            249,
            260,
            271,
            282,
            294
        ],
        '30': [
            13,
            23,
            33,
            43,
            54,
            65,
            76,
            87,
            98,
            109,
            120,
            131,
            143,
            154,
            166,
            177,
            189,
            200,
            212,
            223,
            235,
            247,
            258,
            270,
            282,
            293,
            305,
            317
        ]
    };
    /*--------------------------------------------------------------------------*/ /**
   * Create a new `Benchmark` function using the given `context` object.
   *
   * @static
   * @memberOf Benchmark
   * @param {Object} [context=root] The context object.
   * @returns {Function} Returns a new `Benchmark` function.
   */ function runInContext(context) {
        // Exit early if unable to acquire lodash.
        var _ = context && context._ || require1('lodash') || root._;
        if (!_) {
            Benchmark.runInContext = runInContext;
            return Benchmark;
        }
        // Avoid issues with some ES3 environments that attempt to use values, named
        // after built-in constructors like `Object`, for the creation of literals.
        // ES5 clears this up by stating that literals must use built-in constructors.
        // See http://es5.github.io/#x11.1.5.
        context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;
        /** Native constructor references. */ var Array = context.Array, Date = context.Date, Function = context.Function, Math = context.Math, Object = context.Object, RegExp = context.RegExp, String = context.String;
        /** Used for `Array` and `Object` method references. */ var arrayRef = [], objectProto = Object.prototype;
        /** Native method shortcuts. */ var abs = Math.abs, clearTimeout = context.clearTimeout, floor = Math.floor, log = Math.log, max = Math.max, min = Math.min, pow = Math.pow, push = arrayRef.push, setTimeout = context.setTimeout, shift = arrayRef.shift, slice = arrayRef.slice, sqrt = Math.sqrt, toString = objectProto.toString, unshift = arrayRef.unshift;
        /** Used to avoid inclusion in Browserified bundles. */ var req = require1;
        /** Detect DOM document object. */ var doc = isHostType(context, 'document') && context.document;
        /** Used to access Wade Simmons' Node.js `microtime` module. */ var microtimeObject = req('microtime');
        /** Used to access Node.js's high resolution timer. */ var processObject = isHostType(context, 'process') && context.process;
        /** Used to prevent a `removeChild` memory leak in IE < 9. */ var trash = doc && doc.createElement('div');
        /** Used to integrity check compiled tests. */ var uid = 'uid' + _.now();
        /** Used to avoid infinite recursion when methods call each other. */ var calledBy = {};
        /**
     * An object used to flag environments/features.
     *
     * @static
     * @memberOf Benchmark
     * @type Object
     */ var support = {};
        (function() {
            /**
       * Detect if running in a browser environment.
       *
       * @memberOf Benchmark.support
       * @type boolean
       */ support.browser = doc && isHostType(context, 'navigator') && !isHostType(context, 'phantom');
            /**
       * Detect if the Timers API exists.
       *
       * @memberOf Benchmark.support
       * @type boolean
       */ support.timeout = isHostType(context, 'setTimeout') && isHostType(context, 'clearTimeout');
            /**
       * Detect if function decompilation is support.
       *
       * @name decompilation
       * @memberOf Benchmark.support
       * @type boolean
       */ try {
                // Safari 2.x removes commas in object literals from `Function#toString` results.
                // See http://webk.it/11609 for more details.
                // Firefox 3.6 and Opera 9.25 strip grouping parentheses from `Function#toString` results.
                // See http://bugzil.la/559438 for more details.
                support.decompilation = Function(('return (' + function(x) {
                    return {
                        'x': '' + (1 + x) + '',
                        'y': 0
                    };
                } + ')')// Avoid issues with code added by Istanbul.
                .replace(/__cov__[^;]+;/g, ''))()(0).x === '1';
            } catch (e) {
                support.decompilation = false;
            }
        })();
        /**
     * Timer object used by `clock()` and `Deferred#resolve`.
     *
     * @private
     * @type Object
     */ var timer = {
            /**
       * The timer namespace object or constructor.
       *
       * @private
       * @memberOf timer
       * @type {Function|Object}
       */ 'ns': Date,
            /**
       * Starts the deferred timer.
       *
       * @private
       * @memberOf timer
       * @param {Object} deferred The deferred instance.
       */ 'start': null,
            /**
       * Stops the deferred timer.
       *
       * @private
       * @memberOf timer
       * @param {Object} deferred The deferred instance.
       */ 'stop': null // Lazy defined in `clock()`.
        };
        /*------------------------------------------------------------------------*/ /**
     * The Benchmark constructor.
     *
     * Note: The Benchmark constructor exposes a handful of lodash methods to
     * make working with arrays, collections, and objects easier. The lodash
     * methods are:
     * [`each/forEach`](https://lodash.com/docs#forEach), [`forOwn`](https://lodash.com/docs#forOwn),
     * [`has`](https://lodash.com/docs#has), [`indexOf`](https://lodash.com/docs#indexOf),
     * [`map`](https://lodash.com/docs#map), and [`reduce`](https://lodash.com/docs#reduce)
     *
     * @constructor
     * @param {string} name A name to identify the benchmark.
     * @param {Function|string} fn The test to benchmark.
     * @param {Object} [options={}] Options object.
     * @example
     *
     * // basic usage (the `new` operator is optional)
     * var bench = new Benchmark(fn);
     *
     * // or using a name first
     * var bench = new Benchmark('foo', fn);
     *
     * // or with options
     * var bench = new Benchmark('foo', fn, {
     *
     *   // displayed by `Benchmark#toString` if `name` is not available
     *   'id': 'xyz',
     *
     *   // called when the benchmark starts running
     *   'onStart': onStart,
     *
     *   // called after each run cycle
     *   'onCycle': onCycle,
     *
     *   // called when aborted
     *   'onAbort': onAbort,
     *
     *   // called when a test errors
     *   'onError': onError,
     *
     *   // called when reset
     *   'onReset': onReset,
     *
     *   // called when the benchmark completes running
     *   'onComplete': onComplete,
     *
     *   // compiled/called before the test loop
     *   'setup': setup,
     *
     *   // compiled/called after the test loop
     *   'teardown': teardown
     * });
     *
     * // or name and options
     * var bench = new Benchmark('foo', {
     *
     *   // a flag to indicate the benchmark is deferred
     *   'defer': true,
     *
     *   // benchmark test function
     *   'fn': function(deferred) {
     *     // call `Deferred#resolve` when the deferred test is finished
     *     deferred.resolve();
     *   }
     * });
     *
     * // or options only
     * var bench = new Benchmark({
     *
     *   // benchmark name
     *   'name': 'foo',
     *
     *   // benchmark test as a string
     *   'fn': '[1,2,3,4].sort()'
     * });
     *
     * // a test's `this` binding is set to the benchmark instance
     * var bench = new Benchmark('foo', function() {
     *   'My name is '.concat(this.name); // "My name is foo"
     * });
     */ function Benchmark(name, fn, options) {
            var bench = this;
            // Allow instance creation without the `new` operator.
            if (!(bench instanceof Benchmark)) {
                return new Benchmark(name, fn, options);
            }
            // Juggle arguments.
            if (_.isPlainObject(name)) {
                // 1 argument (options).
                options = name;
            } else if (_.isFunction(name)) {
                // 2 arguments (fn, options).
                options = fn;
                fn = name;
            } else if (_.isPlainObject(fn)) {
                // 2 arguments (name, options).
                options = fn;
                fn = null;
                bench.name = name;
            } else {
                // 3 arguments (name, fn [, options]).
                bench.name = name;
            }
            setOptions(bench, options);
            bench.id || (bench.id = ++counter);
            bench.fn == null && (bench.fn = fn);
            bench.stats = cloneDeep(bench.stats);
            bench.times = cloneDeep(bench.times);
        }
        /**
     * The Deferred constructor.
     *
     * @constructor
     * @memberOf Benchmark
     * @param {Object} clone The cloned benchmark instance.
     */ function Deferred(clone) {
            var deferred = this;
            if (!(deferred instanceof Deferred)) {
                return new Deferred(clone);
            }
            deferred.benchmark = clone;
            clock(deferred);
        }
        /**
     * The Event constructor.
     *
     * @constructor
     * @memberOf Benchmark
     * @param {Object|string} type The event type.
     */ function Event(type) {
            var event = this;
            if (type instanceof Event) {
                return type;
            }
            return event instanceof Event ? _.assign(event, {
                'timeStamp': _.now()
            }, typeof type == 'string' ? {
                'type': type
            } : type) : new Event(type);
        }
        /**
     * The Suite constructor.
     *
     * Note: Each Suite instance has a handful of wrapped lodash methods to
     * make working with Suites easier. The wrapped lodash methods are:
     * [`each/forEach`](https://lodash.com/docs#forEach), [`indexOf`](https://lodash.com/docs#indexOf),
     * [`map`](https://lodash.com/docs#map), and [`reduce`](https://lodash.com/docs#reduce)
     *
     * @constructor
     * @memberOf Benchmark
     * @param {string} name A name to identify the suite.
     * @param {Object} [options={}] Options object.
     * @example
     *
     * // basic usage (the `new` operator is optional)
     * var suite = new Benchmark.Suite;
     *
     * // or using a name first
     * var suite = new Benchmark.Suite('foo');
     *
     * // or with options
     * var suite = new Benchmark.Suite('foo', {
     *
     *   // called when the suite starts running
     *   'onStart': onStart,
     *
     *   // called between running benchmarks
     *   'onCycle': onCycle,
     *
     *   // called when aborted
     *   'onAbort': onAbort,
     *
     *   // called when a test errors
     *   'onError': onError,
     *
     *   // called when reset
     *   'onReset': onReset,
     *
     *   // called when the suite completes running
     *   'onComplete': onComplete
     * });
     */ function Suite(name, options) {
            var suite = this;
            // Allow instance creation without the `new` operator.
            if (!(suite instanceof Suite)) {
                return new Suite(name, options);
            }
            // Juggle arguments.
            if (_.isPlainObject(name)) {
                // 1 argument (options).
                options = name;
            } else {
                // 2 arguments (name [, options]).
                suite.name = name;
            }
            setOptions(suite, options);
        }
        /*------------------------------------------------------------------------*/ /**
     * A specialized version of `_.cloneDeep` which only clones arrays and plain
     * objects assigning all other values by reference.
     *
     * @private
     * @param {*} value The value to clone.
     * @returns {*} The cloned value.
     */ var cloneDeep = _.partial(_.cloneDeepWith, _, function(value) {
            // Only clone primitives, arrays, and plain objects.
            if (!_.isArray(value) && !_.isPlainObject(value)) {
                return value;
            }
        });
        /**
     * Creates a function from the given arguments string and body.
     *
     * @private
     * @param {string} args The comma separated function arguments.
     * @param {string} body The function body.
     * @returns {Function} The new function.
     */ function createFunction() {
            // Lazy define.
            createFunction = function(args, body) {
                var result, anchor = freeDefine ? freeDefine.amd : Benchmark, prop = uid + 'createFunction';
                runScript((freeDefine ? 'define.amd.' : 'Benchmark.') + prop + '=function(' + args + '){' + body + '}');
                result = anchor[prop];
                delete anchor[prop];
                return result;
            };
            // Fix JaegerMonkey bug.
            // For more information see http://bugzil.la/639720.
            createFunction = support.browser && (createFunction('', 'return"' + uid + '"') || _.noop)() == uid ? createFunction : Function;
            return createFunction.apply(null, arguments);
        }
        /**
     * Delay the execution of a function based on the benchmark's `delay` property.
     *
     * @private
     * @param {Object} bench The benchmark instance.
     * @param {Object} fn The function to execute.
     */ function delay(bench, fn) {
            bench._timerId = _.delay(fn, bench.delay * 1e3);
        }
        /**
     * Destroys the given element.
     *
     * @private
     * @param {Element} element The element to destroy.
     */ function destroyElement(element) {
            trash.appendChild(element);
            trash.innerHTML = '';
        }
        /**
     * Gets the name of the first argument from a function's source.
     *
     * @private
     * @param {Function} fn The function.
     * @returns {string} The argument name.
     */ function getFirstArgument(fn) {
            return !_.has(fn, 'toString') && (/^[\s(]*function[^(]*\(([^\s,)]+)/.exec(fn) || 0)[1] || '';
        }
        /**
     * Computes the arithmetic mean of a sample.
     *
     * @private
     * @param {Array} sample The sample.
     * @returns {number} The mean.
     */ function getMean(sample) {
            return _.reduce(sample, function(sum, x) {
                return sum + x;
            }) / sample.length || 0;
        }
        /**
     * Gets the source code of a function.
     *
     * @private
     * @param {Function} fn The function.
     * @returns {string} The function's source code.
     */ function getSource(fn) {
            var result = '';
            if (isStringable(fn)) {
                result = String(fn);
            } else if (support.decompilation) {
                // Escape the `{` for Firefox 1.
                result = _.result(/^[^{]+\{([\s\S]*)\}\s*$/.exec(fn), 1);
            }
            // Trim string.
            result = (result || '').replace(/^\s+|\s+$/g, '');
            // Detect strings containing only the "use strict" directive.
            return /^(?:\/\*+[\w\W]*?\*\/|\/\/.*?[\n\r\u2028\u2029]|\s)*(["'])use strict\1;?$/.test(result) ? '' : result;
        }
        /**
     * Checks if an object is of the specified class.
     *
     * @private
     * @param {*} value The value to check.
     * @param {string} name The name of the class.
     * @returns {boolean} Returns `true` if the value is of the specified class, else `false`.
     */ function isClassOf(value, name) {
            return value != null && toString.call(value) == '[object ' + name + ']';
        }
        /**
     * Host objects can return type values that are different from their actual
     * data type. The objects we are concerned with usually return non-primitive
     * types of "object", "function", or "unknown".
     *
     * @private
     * @param {*} object The owner of the property.
     * @param {string} property The property to check.
     * @returns {boolean} Returns `true` if the property value is a non-primitive, else `false`.
     */ function isHostType(object, property) {
            if (object == null) {
                return false;
            }
            var type = typeof object[property];
            return !rePrimitive.test(type) && (type != 'object' || !!object[property]);
        }
        /**
     * Checks if a value can be safely coerced to a string.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the value can be coerced, else `false`.
     */ function isStringable(value) {
            return _.isString(value) || _.has(value, 'toString') && _.isFunction(value.toString);
        }
        /**
     * A wrapper around `require` to suppress `module missing` errors.
     *
     * @private
     * @param {string} id The module id.
     * @returns {*} The exported module or `null`.
     */ function require1(id) {
            try {
                var result = freeExports && freeRequire(id);
            } catch (e) {}
            return result || null;
        }
        /**
     * Runs a snippet of JavaScript via script injection.
     *
     * @private
     * @param {string} code The code to run.
     */ function runScript(code) {
            var anchor = freeDefine ? define.amd : Benchmark, script = doc.createElement('script'), sibling = doc.getElementsByTagName('script')[0], parent = sibling.parentNode, prop = uid + 'runScript', prefix = '(' + (freeDefine ? 'define.amd.' : 'Benchmark.') + prop + '||function(){})();';
            // Firefox 2.0.0.2 cannot use script injection as intended because it executes
            // asynchronously, but that's OK because script injection is only used to avoid
            // the previously commented JaegerMonkey bug.
            try {
                // Remove the inserted script *before* running the code to avoid differences
                // in the expected script element count/order of the document.
                script.appendChild(doc.createTextNode(prefix + code));
                anchor[prop] = function() {
                    destroyElement(script);
                };
            } catch (e) {
                parent = parent.cloneNode(false);
                sibling = null;
                script.text = code;
            }
            parent.insertBefore(script, sibling);
            delete anchor[prop];
        }
        /**
     * A helper function for setting options/event handlers.
     *
     * @private
     * @param {Object} object The benchmark or suite instance.
     * @param {Object} [options={}] Options object.
     */ function setOptions(object, options) {
            options = object.options = _.assign({}, cloneDeep(object.constructor.options), cloneDeep(options));
            _.forOwn(options, function(value, key) {
                if (value != null) {
                    // Add event listeners.
                    if (/^on[A-Z]/.test(key)) {
                        _.each(key.split(' '), function(key) {
                            object.on(key.slice(2).toLowerCase(), value);
                        });
                    } else if (!_.has(object, key)) {
                        object[key] = cloneDeep(value);
                    }
                }
            });
        }
        /*------------------------------------------------------------------------*/ /**
     * Handles cycling/completing the deferred benchmark.
     *
     * @memberOf Benchmark.Deferred
     */ function resolve() {
            var deferred = this, clone = deferred.benchmark, bench = clone._original;
            if (bench.aborted) {
                // cycle() -> clone cycle/complete event -> compute()'s invoked bench.run() cycle/complete.
                deferred.teardown();
                clone.running = false;
                cycle(deferred);
            } else if (++deferred.cycles < clone.count) {
                clone.compiled.call(deferred, context, timer);
            } else {
                timer.stop(deferred);
                deferred.teardown();
                delay(clone, function() {
                    cycle(deferred);
                });
            }
        }
        /*------------------------------------------------------------------------*/ /**
     * A generic `Array#filter` like method.
     *
     * @static
     * @memberOf Benchmark
     * @param {Array} array The array to iterate over.
     * @param {Function|string} callback The function/alias called per iteration.
     * @returns {Array} A new array of values that passed callback filter.
     * @example
     *
     * // get odd numbers
     * Benchmark.filter([1, 2, 3, 4, 5], function(n) {
     *   return n % 2;
     * }); // -> [1, 3, 5];
     *
     * // get fastest benchmarks
     * Benchmark.filter(benches, 'fastest');
     *
     * // get slowest benchmarks
     * Benchmark.filter(benches, 'slowest');
     *
     * // get benchmarks that completed without erroring
     * Benchmark.filter(benches, 'successful');
     */ function filter(array, callback) {
            if (callback === 'successful') {
                // Callback to exclude those that are errored, unrun, or have hz of Infinity.
                callback = function(bench) {
                    return bench.cycles && _.isFinite(bench.hz) && !bench.error;
                };
            } else if (callback === 'fastest' || callback === 'slowest') {
                // Get successful, sort by period + margin of error, and filter fastest/slowest.
                var result = filter(array, 'successful').sort(function(a, b) {
                    a = a.stats;
                    b = b.stats;
                    return (a.mean + a.moe > b.mean + b.moe ? 1 : -1) * (callback === 'fastest' ? 1 : -1);
                });
                return _.filter(result, function(bench) {
                    return result[0].compare(bench) == 0;
                });
            }
            return _.filter(array, callback);
        }
        /**
     * Converts a number to a more readable comma-separated string representation.
     *
     * @static
     * @memberOf Benchmark
     * @param {number} number The number to convert.
     * @returns {string} The more readable string representation.
     */ function formatNumber(number) {
            number = String(number).split('.');
            return number[0].replace(/(?=(?:\d{3})+$)(?!\b)/g, ',') + (number[1] ? '.' + number[1] : '');
        }
        /**
     * Invokes a method on all items in an array.
     *
     * @static
     * @memberOf Benchmark
     * @param {Array} benches Array of benchmarks to iterate over.
     * @param {Object|string} name The name of the method to invoke OR options object.
     * @param {...*} [args] Arguments to invoke the method with.
     * @returns {Array} A new array of values returned from each method invoked.
     * @example
     *
     * // invoke `reset` on all benchmarks
     * Benchmark.invoke(benches, 'reset');
     *
     * // invoke `emit` with arguments
     * Benchmark.invoke(benches, 'emit', 'complete', listener);
     *
     * // invoke `run(true)`, treat benchmarks as a queue, and register invoke callbacks
     * Benchmark.invoke(benches, {
     *
     *   // invoke the `run` method
     *   'name': 'run',
     *
     *   // pass a single argument
     *   'args': true,
     *
     *   // treat as queue, removing benchmarks from front of `benches` until empty
     *   'queued': true,
     *
     *   // called before any benchmarks have been invoked.
     *   'onStart': onStart,
     *
     *   // called between invoking benchmarks
     *   'onCycle': onCycle,
     *
     *   // called after all benchmarks have been invoked.
     *   'onComplete': onComplete
     * });
     */ function invoke(benches, name) {
            var args, bench, queued, index = -1, eventProps = {
                'currentTarget': benches
            }, options = {
                'onStart': _.noop,
                'onCycle': _.noop,
                'onComplete': _.noop
            }, result = _.toArray(benches);
            /**
       * Invokes the method of the current object and if synchronous, fetches the next.
       */ function execute() {
                var listeners, async = isAsync(bench);
                if (async) {
                    // Use `getNext` as the first listener.
                    bench.on('complete', getNext);
                    listeners = bench.events.complete;
                    listeners.splice(0, 0, listeners.pop());
                }
                // Execute method.
                result[index] = _.isFunction(bench && bench[name]) ? bench[name].apply(bench, args) : undefined;
                // If synchronous return `true` until finished.
                return !async && getNext();
            }
            /**
       * Fetches the next bench or executes `onComplete` callback.
       */ function getNext(event) {
                var cycleEvent, last = bench, async = isAsync(last);
                if (async) {
                    last.off('complete', getNext);
                    last.emit('complete');
                }
                // Emit "cycle" event.
                eventProps.type = 'cycle';
                eventProps.target = last;
                cycleEvent = Event(eventProps);
                options.onCycle.call(benches, cycleEvent);
                // Choose next benchmark if not exiting early.
                if (!cycleEvent.aborted && raiseIndex() !== false) {
                    bench = queued ? benches[0] : result[index];
                    if (isAsync(bench)) {
                        delay(bench, execute);
                    } else if (async) {
                        // Resume execution if previously asynchronous but now synchronous.
                        while(execute()){}
                    } else {
                        // Continue synchronous execution.
                        return true;
                    }
                } else {
                    // Emit "complete" event.
                    eventProps.type = 'complete';
                    options.onComplete.call(benches, Event(eventProps));
                }
                // When used as a listener `event.aborted = true` will cancel the rest of
                // the "complete" listeners because they were already called above and when
                // used as part of `getNext` the `return false` will exit the execution while-loop.
                if (event) {
                    event.aborted = true;
                } else {
                    return false;
                }
            }
            /**
       * Checks if invoking `Benchmark#run` with asynchronous cycles.
       */ function isAsync(object) {
                // Avoid using `instanceof` here because of IE memory leak issues with host objects.
                var async = args[0] && args[0].async;
                return name == 'run' && object instanceof Benchmark && ((async == null ? object.options.async : async) && support.timeout || object.defer);
            }
            /**
       * Raises `index` to the next defined index or returns `false`.
       */ function raiseIndex() {
                index++;
                // If queued remove the previous bench.
                if (queued && index > 0) {
                    shift.call(benches);
                }
                // If we reached the last index then return `false`.
                return (queued ? benches.length : index < result.length) ? index : index = false;
            }
            // Juggle arguments.
            if (_.isString(name)) {
                // 2 arguments (array, name).
                args = slice.call(arguments, 2);
            } else {
                // 2 arguments (array, options).
                options = _.assign(options, name);
                name = options.name;
                args = _.isArray(args = 'args' in options ? options.args : []) ? args : [
                    args
                ];
                queued = options.queued;
            }
            // Start iterating over the array.
            if (raiseIndex() !== false) {
                // Emit "start" event.
                bench = result[index];
                eventProps.type = 'start';
                eventProps.target = bench;
                options.onStart.call(benches, Event(eventProps));
                // End early if the suite was aborted in an "onStart" listener.
                if (name == 'run' && benches instanceof Suite && benches.aborted) {
                    // Emit "cycle" event.
                    eventProps.type = 'cycle';
                    options.onCycle.call(benches, Event(eventProps));
                    // Emit "complete" event.
                    eventProps.type = 'complete';
                    options.onComplete.call(benches, Event(eventProps));
                } else {
                    if (isAsync(bench)) {
                        delay(bench, execute);
                    } else {
                        while(execute()){}
                    }
                }
            }
            return result;
        }
        /**
     * Creates a string of joined array values or object key-value pairs.
     *
     * @static
     * @memberOf Benchmark
     * @param {Array|Object} object The object to operate on.
     * @param {string} [separator1=','] The separator used between key-value pairs.
     * @param {string} [separator2=': '] The separator used between keys and values.
     * @returns {string} The joined result.
     */ function join(object, separator1, separator2) {
            var result = [], length = (object = Object(object)).length, arrayLike = length === length >>> 0;
            separator2 || (separator2 = ': ');
            _.each(object, function(value, key) {
                result.push(arrayLike ? value : key + separator2 + value);
            });
            return result.join(separator1 || ',');
        }
        /*------------------------------------------------------------------------*/ /**
     * Aborts all benchmarks in the suite.
     *
     * @name abort
     * @memberOf Benchmark.Suite
     * @returns {Object} The suite instance.
     */ function abortSuite() {
            var event, suite = this, resetting = calledBy.resetSuite;
            if (suite.running) {
                event = Event('abort');
                suite.emit(event);
                if (!event.cancelled || resetting) {
                    // Avoid infinite recursion.
                    calledBy.abortSuite = true;
                    suite.reset();
                    delete calledBy.abortSuite;
                    if (!resetting) {
                        suite.aborted = true;
                        invoke(suite, 'abort');
                    }
                }
            }
            return suite;
        }
        /**
     * Adds a test to the benchmark suite.
     *
     * @memberOf Benchmark.Suite
     * @param {string} name A name to identify the benchmark.
     * @param {Function|string} fn The test to benchmark.
     * @param {Object} [options={}] Options object.
     * @returns {Object} The suite instance.
     * @example
     *
     * // basic usage
     * suite.add(fn);
     *
     * // or using a name first
     * suite.add('foo', fn);
     *
     * // or with options
     * suite.add('foo', fn, {
     *   'onCycle': onCycle,
     *   'onComplete': onComplete
     * });
     *
     * // or name and options
     * suite.add('foo', {
     *   'fn': fn,
     *   'onCycle': onCycle,
     *   'onComplete': onComplete
     * });
     *
     * // or options only
     * suite.add({
     *   'name': 'foo',
     *   'fn': fn,
     *   'onCycle': onCycle,
     *   'onComplete': onComplete
     * });
     */ function add(name, fn, options) {
            var suite = this, bench = new Benchmark(name, fn, options), event = Event({
                'type': 'add',
                'target': bench
            });
            if (suite.emit(event), !event.cancelled) {
                suite.push(bench);
            }
            return suite;
        }
        /**
     * Creates a new suite with cloned benchmarks.
     *
     * @name clone
     * @memberOf Benchmark.Suite
     * @param {Object} options Options object to overwrite cloned options.
     * @returns {Object} The new suite instance.
     */ function cloneSuite(options) {
            var suite = this, result = new suite.constructor(_.assign({}, suite.options, options));
            // Copy own properties.
            _.forOwn(suite, function(value, key) {
                if (!_.has(result, key)) {
                    result[key] = _.isFunction(_.get(value, 'clone')) ? value.clone() : cloneDeep(value);
                }
            });
            return result;
        }
        /**
     * An `Array#filter` like method.
     *
     * @name filter
     * @memberOf Benchmark.Suite
     * @param {Function|string} callback The function/alias called per iteration.
     * @returns {Object} A new suite of benchmarks that passed callback filter.
     */ function filterSuite(callback) {
            var suite = this, result = new suite.constructor(suite.options);
            result.push.apply(result, filter(suite, callback));
            return result;
        }
        /**
     * Resets all benchmarks in the suite.
     *
     * @name reset
     * @memberOf Benchmark.Suite
     * @returns {Object} The suite instance.
     */ function resetSuite() {
            var event, suite = this, aborting = calledBy.abortSuite;
            if (suite.running && !aborting) {
                // No worries, `resetSuite()` is called within `abortSuite()`.
                calledBy.resetSuite = true;
                suite.abort();
                delete calledBy.resetSuite;
            } else if ((suite.aborted || suite.running) && (suite.emit(event = Event('reset')), !event.cancelled)) {
                suite.aborted = suite.running = false;
                if (!aborting) {
                    invoke(suite, 'reset');
                }
            }
            return suite;
        }
        /**
     * Runs the suite.
     *
     * @name run
     * @memberOf Benchmark.Suite
     * @param {Object} [options={}] Options object.
     * @returns {Object} The suite instance.
     * @example
     *
     * // basic usage
     * suite.run();
     *
     * // or with options
     * suite.run({ 'async': true, 'queued': true });
     */ function runSuite(options) {
            var suite = this;
            suite.reset();
            suite.running = true;
            options || (options = {});
            invoke(suite, {
                'name': 'run',
                'args': options,
                'queued': options.queued,
                'onStart': function(event) {
                    suite.emit(event);
                },
                'onCycle': function(event) {
                    var bench = event.target;
                    if (bench.error) {
                        suite.emit({
                            'type': 'error',
                            'target': bench
                        });
                    }
                    suite.emit(event);
                    event.aborted = suite.aborted;
                },
                'onComplete': function(event) {
                    suite.running = false;
                    suite.emit(event);
                }
            });
            return suite;
        }
        /*------------------------------------------------------------------------*/ /**
     * Executes all registered listeners of the specified event type.
     *
     * @memberOf Benchmark, Benchmark.Suite
     * @param {Object|string} type The event type or object.
     * @param {...*} [args] Arguments to invoke the listener with.
     * @returns {*} Returns the return value of the last listener executed.
     */ function emit(type) {
            var listeners, object = this, event = Event(type), events = object.events, args = (arguments[0] = event, arguments);
            event.currentTarget || (event.currentTarget = object);
            event.target || (event.target = object);
            delete event.result;
            if (events && (listeners = _.has(events, event.type) && events[event.type])) {
                _.each(listeners.slice(), function(listener) {
                    if ((event.result = listener.apply(object, args)) === false) {
                        event.cancelled = true;
                    }
                    return !event.aborted;
                });
            }
            return event.result;
        }
        /**
     * Returns an array of event listeners for a given type that can be manipulated
     * to add or remove listeners.
     *
     * @memberOf Benchmark, Benchmark.Suite
     * @param {string} type The event type.
     * @returns {Array} The listeners array.
     */ function listeners(type) {
            var object = this, events = object.events || (object.events = {});
            return _.has(events, type) ? events[type] : events[type] = [];
        }
        /**
     * Unregisters a listener for the specified event type(s),
     * or unregisters all listeners for the specified event type(s),
     * or unregisters all listeners for all event types.
     *
     * @memberOf Benchmark, Benchmark.Suite
     * @param {string} [type] The event type.
     * @param {Function} [listener] The function to unregister.
     * @returns {Object} The current instance.
     * @example
     *
     * // unregister a listener for an event type
     * bench.off('cycle', listener);
     *
     * // unregister a listener for multiple event types
     * bench.off('start cycle', listener);
     *
     * // unregister all listeners for an event type
     * bench.off('cycle');
     *
     * // unregister all listeners for multiple event types
     * bench.off('start cycle complete');
     *
     * // unregister all listeners for all event types
     * bench.off();
     */ function off(type, listener) {
            var object = this, events = object.events;
            if (!events) {
                return object;
            }
            _.each(type ? type.split(' ') : events, function(listeners, type) {
                var index;
                if (typeof listeners == 'string') {
                    type = listeners;
                    listeners = _.has(events, type) && events[type];
                }
                if (listeners) {
                    if (listener) {
                        index = _.indexOf(listeners, listener);
                        if (index > -1) {
                            listeners.splice(index, 1);
                        }
                    } else {
                        listeners.length = 0;
                    }
                }
            });
            return object;
        }
        /**
     * Registers a listener for the specified event type(s).
     *
     * @memberOf Benchmark, Benchmark.Suite
     * @param {string} type The event type.
     * @param {Function} listener The function to register.
     * @returns {Object} The current instance.
     * @example
     *
     * // register a listener for an event type
     * bench.on('cycle', listener);
     *
     * // register a listener for multiple event types
     * bench.on('start cycle', listener);
     */ function on(type, listener) {
            var object = this, events = object.events || (object.events = {});
            _.each(type.split(' '), function(type) {
                (_.has(events, type) ? events[type] : events[type] = []).push(listener);
            });
            return object;
        }
        /*------------------------------------------------------------------------*/ /**
     * Aborts the benchmark without recording times.
     *
     * @memberOf Benchmark
     * @returns {Object} The benchmark instance.
     */ function abort() {
            var event, bench = this, resetting = calledBy.reset;
            if (bench.running) {
                event = Event('abort');
                bench.emit(event);
                if (!event.cancelled || resetting) {
                    // Avoid infinite recursion.
                    calledBy.abort = true;
                    bench.reset();
                    delete calledBy.abort;
                    if (support.timeout) {
                        clearTimeout(bench._timerId);
                        delete bench._timerId;
                    }
                    if (!resetting) {
                        bench.aborted = true;
                        bench.running = false;
                    }
                }
            }
            return bench;
        }
        /**
     * Creates a new benchmark using the same test and options.
     *
     * @memberOf Benchmark
     * @param {Object} options Options object to overwrite cloned options.
     * @returns {Object} The new benchmark instance.
     * @example
     *
     * var bizarro = bench.clone({
     *   'name': 'doppelganger'
     * });
     */ function clone(options) {
            var bench = this, result = new bench.constructor(_.assign({}, bench, options));
            // Correct the `options` object.
            result.options = _.assign({}, cloneDeep(bench.options), cloneDeep(options));
            // Copy own custom properties.
            _.forOwn(bench, function(value, key) {
                if (!_.has(result, key)) {
                    result[key] = cloneDeep(value);
                }
            });
            return result;
        }
        /**
     * Determines if a benchmark is faster than another.
     *
     * @memberOf Benchmark
     * @param {Object} other The benchmark to compare.
     * @returns {number} Returns `-1` if slower, `1` if faster, and `0` if indeterminate.
     */ function compare(other) {
            var bench = this;
            // Exit early if comparing the same benchmark.
            if (bench == other) {
                return 0;
            }
            var critical, zStat, sample1 = bench.stats.sample, sample2 = other.stats.sample, size1 = sample1.length, size2 = sample2.length, maxSize = max(size1, size2), minSize = min(size1, size2), u1 = getU(sample1, sample2), u2 = getU(sample2, sample1), u = min(u1, u2);
            function getScore(xA, sampleB) {
                return _.reduce(sampleB, function(total, xB) {
                    return total + (xB > xA ? 0 : xB < xA ? 1 : 0.5);
                }, 0);
            }
            function getU(sampleA, sampleB) {
                return _.reduce(sampleA, function(total, xA) {
                    return total + getScore(xA, sampleB);
                }, 0);
            }
            function getZ(u) {
                return (u - size1 * size2 / 2) / sqrt(size1 * size2 * (size1 + size2 + 1) / 12);
            }
            // Reject the null hypothesis the two samples come from the
            // same population (i.e. have the same median) if...
            if (size1 + size2 > 30) {
                // ...the z-stat is greater than 1.96 or less than -1.96
                // http://www.statisticslectures.com/topics/mannwhitneyu/
                zStat = getZ(u);
                return abs(zStat) > 1.96 ? u == u1 ? 1 : -1 : 0;
            }
            // ...the U value is less than or equal the critical U value.
            critical = maxSize < 5 || minSize < 3 ? 0 : uTable[maxSize][minSize - 3];
            return u <= critical ? u == u1 ? 1 : -1 : 0;
        }
        /**
     * Reset properties and abort if running.
     *
     * @memberOf Benchmark
     * @returns {Object} The benchmark instance.
     */ function reset() {
            var bench = this;
            if (bench.running && !calledBy.abort) {
                // No worries, `reset()` is called within `abort()`.
                calledBy.reset = true;
                bench.abort();
                delete calledBy.reset;
                return bench;
            }
            var event, index = 0, changes = [], queue = [];
            // A non-recursive solution to check if properties have changed.
            // For more information see http://www.jslab.dk/articles/non.recursive.preorder.traversal.part4.
            var data = {
                'destination': bench,
                'source': _.assign({}, cloneDeep(bench.constructor.prototype), cloneDeep(bench.options))
            };
            do {
                _.forOwn(data.source, function(value, key) {
                    var changed, destination = data.destination, currValue = destination[key];
                    // Skip pseudo private properties and event listeners.
                    if (/^_|^events$|^on[A-Z]/.test(key)) {
                        return;
                    }
                    if (_.isObjectLike(value)) {
                        if (_.isArray(value)) {
                            // Check if an array value has changed to a non-array value.
                            if (!_.isArray(currValue)) {
                                changed = true;
                                currValue = [];
                            }
                            // Check if an array has changed its length.
                            if (currValue.length != value.length) {
                                changed = true;
                                currValue = currValue.slice(0, value.length);
                                currValue.length = value.length;
                            }
                        } else if (!_.isObjectLike(currValue)) {
                            changed = true;
                            currValue = {};
                        }
                        // Register a changed object.
                        if (changed) {
                            changes.push({
                                'destination': destination,
                                'key': key,
                                'value': currValue
                            });
                        }
                        queue.push({
                            'destination': currValue,
                            'source': value
                        });
                    } else if (!_.eq(currValue, value) && value !== undefined) {
                        changes.push({
                            'destination': destination,
                            'key': key,
                            'value': value
                        });
                    }
                });
            }while (data = queue[index++])
            // If changed emit the `reset` event and if it isn't cancelled reset the benchmark.
            if (changes.length && (bench.emit(event = Event('reset')), !event.cancelled)) {
                _.each(changes, function(data) {
                    data.destination[data.key] = data.value;
                });
            }
            return bench;
        }
        /**
     * Displays relevant benchmark information when coerced to a string.
     *
     * @name toString
     * @memberOf Benchmark
     * @returns {string} A string representation of the benchmark instance.
     */ function toStringBench() {
            var bench = this, error = bench.error, hz = bench.hz, id = bench.id, stats = bench.stats, size = stats.sample.length, pm = '\xb1', result = bench.name || (_.isNaN(id) ? id : '<Test #' + id + '>');
            if (error) {
                var errorStr;
                if (!_.isObject(error)) {
                    errorStr = String(error);
                } else if (!_.isError(Error)) {
                    errorStr = join(error);
                } else {
                    // Error#name and Error#message properties are non-enumerable.
                    errorStr = join(_.assign({
                        'name': error.name,
                        'message': error.message
                    }, error));
                }
                result += ': ' + errorStr;
            } else {
                result += ' x ' + formatNumber(hz.toFixed(hz < 100 ? 2 : 0)) + ' ops/sec ' + pm + stats.rme.toFixed(2) + '% (' + size + ' run' + (size == 1 ? '' : 's') + ' sampled)';
            }
            return result;
        }
        /*------------------------------------------------------------------------*/ /**
     * Clocks the time taken to execute a test per cycle (secs).
     *
     * @private
     * @param {Object} bench The benchmark instance.
     * @returns {number} The time taken.
     */ function clock() {
            var options = Benchmark.options, templateData = {}, timers = [
                {
                    'ns': timer.ns,
                    'res': max(0.0015, getRes('ms')),
                    'unit': 'ms'
                }
            ];
            // Lazy define for hi-res timers.
            clock = function(clone) {
                var deferred;
                if (clone instanceof Deferred) {
                    deferred = clone;
                    clone = deferred.benchmark;
                }
                var bench = clone._original, stringable = isStringable(bench.fn), count = bench.count = clone.count, decompilable = stringable || support.decompilation && (clone.setup !== _.noop || clone.teardown !== _.noop), id = bench.id, name = bench.name || (typeof id == 'number' ? '<Test #' + id + '>' : id), result = 0;
                // Init `minTime` if needed.
                clone.minTime = bench.minTime || (bench.minTime = bench.options.minTime = options.minTime);
                // Compile in setup/teardown functions and the test loop.
                // Create a new compiled test, instead of using the cached `bench.compiled`,
                // to avoid potential engine optimizations enabled over the life of the test.
                var funcBody = deferred ? 'var d#=this,${fnArg}=d#,m#=d#.benchmark._original,f#=m#.fn,su#=m#.setup,td#=m#.teardown;' + // When `deferred.cycles` is `0` then...
                'if(!d#.cycles){' + // set `deferred.fn`,
                'd#.fn=function(){var ${fnArg}=d#;if(typeof f#=="function"){try{${fn}\n}catch(e#){f#(d#)}}else{${fn}\n}};' + // set `deferred.teardown`,
                'd#.teardown=function(){d#.cycles=0;if(typeof td#=="function"){try{${teardown}\n}catch(e#){td#()}}else{${teardown}\n}};' + // execute the benchmark's `setup`,
                'if(typeof su#=="function"){try{${setup}\n}catch(e#){su#()}}else{${setup}\n};' + // start timer,
                't#.start(d#);' + // and then execute `deferred.fn` and return a dummy object.
                '}d#.fn();return{uid:"${uid}"}' : 'var r#,s#,m#=this,f#=m#.fn,i#=m#.count,n#=t#.ns;${setup}\n${begin};' + 'while(i#--){${fn}\n}${end};${teardown}\nreturn{elapsed:r#,uid:"${uid}"}';
                var compiled = bench.compiled = clone.compiled = createCompiled(bench, decompilable, deferred, funcBody), isEmpty = !(templateData.fn || stringable);
                try {
                    if (isEmpty) {
                        // Firefox may remove dead code from `Function#toString` results.
                        // For more information see http://bugzil.la/536085.
                        throw new Error('The test "' + name + '" is empty. This may be the result of dead code removal.');
                    } else if (!deferred) {
                        // Pretest to determine if compiled code exits early, usually by a
                        // rogue `return` statement, by checking for a return object with the uid.
                        bench.count = 1;
                        compiled = decompilable && (compiled.call(bench, context, timer) || {}).uid == templateData.uid && compiled;
                        bench.count = count;
                    }
                } catch (e) {
                    compiled = null;
                    clone.error = e || new Error(String(e));
                    bench.count = count;
                }
                // Fallback when a test exits early or errors during pretest.
                if (!compiled && !deferred && !isEmpty) {
                    funcBody = (stringable || decompilable && !clone.error ? 'function f#(){${fn}\n}var r#,s#,m#=this,i#=m#.count' : 'var r#,s#,m#=this,f#=m#.fn,i#=m#.count') + ',n#=t#.ns;${setup}\n${begin};m#.f#=f#;while(i#--){m#.f#()}${end};' + 'delete m#.f#;${teardown}\nreturn{elapsed:r#}';
                    compiled = createCompiled(bench, decompilable, deferred, funcBody);
                    try {
                        // Pretest one more time to check for errors.
                        bench.count = 1;
                        compiled.call(bench, context, timer);
                        bench.count = count;
                        delete clone.error;
                    } catch (e) {
                        bench.count = count;
                        if (!clone.error) {
                            clone.error = e || new Error(String(e));
                        }
                    }
                }
                // If no errors run the full test loop.
                if (!clone.error) {
                    compiled = bench.compiled = clone.compiled = createCompiled(bench, decompilable, deferred, funcBody);
                    result = compiled.call(deferred || bench, context, timer).elapsed;
                }
                return result;
            };
            /*----------------------------------------------------------------------*/ /**
       * Creates a compiled function from the given function `body`.
       */ function createCompiled(bench, decompilable, deferred, body) {
                var fn = bench.fn, fnArg = deferred ? getFirstArgument(fn) || 'deferred' : '';
                templateData.uid = uid + uidCounter++;
                _.assign(templateData, {
                    'setup': decompilable ? getSource(bench.setup) : interpolate('m#.setup()'),
                    'fn': decompilable ? getSource(fn) : interpolate('m#.fn(' + fnArg + ')'),
                    'fnArg': fnArg,
                    'teardown': decompilable ? getSource(bench.teardown) : interpolate('m#.teardown()')
                });
                // Use API of chosen timer.
                if (timer.unit == 'ns') {
                    _.assign(templateData, {
                        'begin': interpolate('s#=n#()'),
                        'end': interpolate('r#=n#(s#);r#=r#[0]+(r#[1]/1e9)')
                    });
                } else if (timer.unit == 'us') {
                    if (timer.ns.stop) {
                        _.assign(templateData, {
                            'begin': interpolate('s#=n#.start()'),
                            'end': interpolate('r#=n#.microseconds()/1e6')
                        });
                    } else {
                        _.assign(templateData, {
                            'begin': interpolate('s#=n#()'),
                            'end': interpolate('r#=(n#()-s#)/1e6')
                        });
                    }
                } else if (timer.ns.now) {
                    _.assign(templateData, {
                        'begin': interpolate('s#=n#.now()'),
                        'end': interpolate('r#=(n#.now()-s#)/1e3')
                    });
                } else {
                    _.assign(templateData, {
                        'begin': interpolate('s#=new n#().getTime()'),
                        'end': interpolate('r#=(new n#().getTime()-s#)/1e3')
                    });
                }
                // Define `timer` methods.
                timer.start = createFunction(interpolate('o#'), interpolate('var n#=this.ns,${begin};o#.elapsed=0;o#.timeStamp=s#'));
                timer.stop = createFunction(interpolate('o#'), interpolate('var n#=this.ns,s#=o#.timeStamp,${end};o#.elapsed=r#'));
                // Create compiled test.
                return createFunction(interpolate('window,t#'), 'var global = window, clearTimeout = global.clearTimeout, setTimeout = global.setTimeout;\n' + interpolate(body));
            }
            /**
       * Gets the current timer's minimum resolution (secs).
       */ function getRes(unit) {
                var measured, begin, count = 30, divisor = 1e3, ns = timer.ns, sample = [];
                // Get average smallest measurable time.
                while(count--){
                    if (unit == 'us') {
                        divisor = 1e6;
                        if (ns.stop) {
                            ns.start();
                            while(!(measured = ns.microseconds())){}
                        } else {
                            begin = ns();
                            while(!(measured = ns() - begin)){}
                        }
                    } else if (unit == 'ns') {
                        divisor = 1e9;
                        begin = (begin = ns())[0] + begin[1] / divisor;
                        while(!(measured = (measured = ns())[0] + measured[1] / divisor - begin)){}
                        divisor = 1;
                    } else if (ns.now) {
                        begin = ns.now();
                        while(!(measured = ns.now() - begin)){}
                    } else {
                        begin = new ns().getTime();
                        while(!(measured = new ns().getTime() - begin)){}
                    }
                    // Check for broken timers.
                    if (measured > 0) {
                        sample.push(measured);
                    } else {
                        sample.push(Infinity);
                        break;
                    }
                }
                // Convert to seconds.
                return getMean(sample) / divisor;
            }
            /**
       * Interpolates a given template string.
       */ function interpolate(string) {
                // Replaces all occurrences of `#` with a unique number and template tokens with content.
                return _.template(string.replace(/\#/g, /\d+/.exec(templateData.uid)))(templateData);
            }
            /*----------------------------------------------------------------------*/ // Detect Chrome's microsecond timer:
            // enable benchmarking via the --enable-benchmarking command
            // line switch in at least Chrome 7 to use chrome.Interval
            try {
                if (timer.ns = new (context.chrome || context.chromium).Interval) {
                    timers.push({
                        'ns': timer.ns,
                        'res': getRes('us'),
                        'unit': 'us'
                    });
                }
            } catch (e) {}
            // Detect Node.js's nanosecond resolution timer available in Node.js >= 0.8.
            if (processObject && typeof (timer.ns = processObject.hrtime) == 'function') {
                timers.push({
                    'ns': timer.ns,
                    'res': getRes('ns'),
                    'unit': 'ns'
                });
            }
            // Detect Wade Simmons' Node.js `microtime` module.
            if (microtimeObject && typeof (timer.ns = microtimeObject.now) == 'function') {
                timers.push({
                    'ns': timer.ns,
                    'res': getRes('us'),
                    'unit': 'us'
                });
            }
            // Pick timer with highest resolution.
            timer = _.minBy(timers, 'res');
            // Error if there are no working timers.
            if (timer.res == Infinity) {
                throw new Error('Benchmark.js was unable to find a working timer.');
            }
            // Resolve time span required to achieve a percent uncertainty of at most 1%.
            // For more information see http://spiff.rit.edu/classes/phys273/uncert/uncert.html.
            options.minTime || (options.minTime = max(timer.res / 2 / 0.01, 0.05));
            return clock.apply(null, arguments);
        }
        /*------------------------------------------------------------------------*/ /**
     * Computes stats on benchmark results.
     *
     * @private
     * @param {Object} bench The benchmark instance.
     * @param {Object} options The options object.
     */ function compute(bench, options) {
            options || (options = {});
            var async = options.async, elapsed = 0, initCount = bench.initCount, minSamples = bench.minSamples, queue = [], sample = bench.stats.sample;
            /**
       * Adds a clone to the queue.
       */ function enqueue() {
                queue.push(_.assign(bench.clone(), {
                    '_original': bench,
                    'events': {
                        'abort': [
                            update
                        ],
                        'cycle': [
                            update
                        ],
                        'error': [
                            update
                        ],
                        'start': [
                            update
                        ]
                    }
                }));
            }
            /**
       * Updates the clone/original benchmarks to keep their data in sync.
       */ function update(event) {
                var clone = this, type = event.type;
                if (bench.running) {
                    if (type == 'start') {
                        // Note: `clone.minTime` prop is inited in `clock()`.
                        clone.count = bench.initCount;
                    } else {
                        if (type == 'error') {
                            bench.error = clone.error;
                        }
                        if (type == 'abort') {
                            bench.abort();
                            bench.emit('cycle');
                        } else {
                            event.currentTarget = event.target = bench;
                            bench.emit(event);
                        }
                    }
                } else if (bench.aborted) {
                    // Clear abort listeners to avoid triggering bench's abort/cycle again.
                    clone.events.abort.length = 0;
                    clone.abort();
                }
            }
            /**
       * Determines if more clones should be queued or if cycling should stop.
       */ function evaluate(event) {
                var critical, df, mean, moe, rme, sd, sem, variance, clone = event.target, done = bench.aborted, now = _.now(), size = sample.push(clone.times.period), maxedOut = size >= minSamples && (elapsed += now - clone.times.timeStamp) / 1e3 > bench.maxTime, times = bench.times, varOf = function(sum, x) {
                    return sum + pow(x - mean, 2);
                };
                // Exit early for aborted or unclockable tests.
                if (done || clone.hz == Infinity) {
                    maxedOut = !(size = sample.length = queue.length = 0);
                }
                if (!done) {
                    // Compute the sample mean (estimate of the population mean).
                    mean = getMean(sample);
                    // Compute the sample variance (estimate of the population variance).
                    variance = _.reduce(sample, varOf, 0) / (size - 1) || 0;
                    // Compute the sample standard deviation (estimate of the population standard deviation).
                    sd = sqrt(variance);
                    // Compute the standard error of the mean (a.k.a. the standard deviation of the sampling distribution of the sample mean).
                    sem = sd / sqrt(size);
                    // Compute the degrees of freedom.
                    df = size - 1;
                    // Compute the critical value.
                    critical = tTable[Math.round(df) || 1] || tTable.infinity;
                    // Compute the margin of error.
                    moe = sem * critical;
                    // Compute the relative margin of error.
                    rme = moe / mean * 100 || 0;
                    _.assign(bench.stats, {
                        'deviation': sd,
                        'mean': mean,
                        'moe': moe,
                        'rme': rme,
                        'sem': sem,
                        'variance': variance
                    });
                    // Abort the cycle loop when the minimum sample size has been collected
                    // and the elapsed time exceeds the maximum time allowed per benchmark.
                    // We don't count cycle delays toward the max time because delays may be
                    // increased by browsers that clamp timeouts for inactive tabs. For more
                    // information see https://developer.mozilla.org/en/window.setTimeout#Inactive_tabs.
                    if (maxedOut) {
                        // Reset the `initCount` in case the benchmark is rerun.
                        bench.initCount = initCount;
                        bench.running = false;
                        done = true;
                        times.elapsed = (now - times.timeStamp) / 1e3;
                    }
                    if (bench.hz != Infinity) {
                        bench.hz = 1 / mean;
                        times.cycle = mean * bench.count;
                        times.period = mean;
                    }
                }
                // If time permits, increase sample size to reduce the margin of error.
                if (queue.length < 2 && !maxedOut) {
                    enqueue();
                }
                // Abort the `invoke` cycle when done.
                event.aborted = done;
            }
            // Init queue and begin.
            enqueue();
            invoke(queue, {
                'name': 'run',
                'args': {
                    'async': async
                },
                'queued': true,
                'onCycle': evaluate,
                'onComplete': function() {
                    bench.emit('complete');
                }
            });
        }
        /*------------------------------------------------------------------------*/ /**
     * Cycles a benchmark until a run `count` can be established.
     *
     * @private
     * @param {Object} clone The cloned benchmark instance.
     * @param {Object} options The options object.
     */ function cycle(clone, options) {
            options || (options = {});
            var deferred;
            if (clone instanceof Deferred) {
                deferred = clone;
                clone = clone.benchmark;
            }
            var clocked, cycles, divisor, event, minTime, period, async = options.async, bench = clone._original, count = clone.count, times = clone.times;
            // Continue, if not aborted between cycles.
            if (clone.running) {
                // `minTime` is set to `Benchmark.options.minTime` in `clock()`.
                cycles = ++clone.cycles;
                clocked = deferred ? deferred.elapsed : clock(clone);
                minTime = clone.minTime;
                if (cycles > bench.cycles) {
                    bench.cycles = cycles;
                }
                if (clone.error) {
                    event = Event('error');
                    event.message = clone.error;
                    clone.emit(event);
                    if (!event.cancelled) {
                        clone.abort();
                    }
                }
            }
            // Continue, if not errored.
            if (clone.running) {
                // Compute the time taken to complete last test cycle.
                bench.times.cycle = times.cycle = clocked;
                // Compute the seconds per operation.
                period = bench.times.period = times.period = clocked / count;
                // Compute the ops per second.
                bench.hz = clone.hz = 1 / period;
                // Avoid working our way up to this next time.
                bench.initCount = clone.initCount = count;
                // Do we need to do another cycle?
                clone.running = clocked < minTime;
                if (clone.running) {
                    // Tests may clock at `0` when `initCount` is a small number,
                    // to avoid that we set its count to something a bit higher.
                    if (!clocked && (divisor = divisors[clone.cycles]) != null) {
                        count = floor(4e6 / divisor);
                    }
                    // Calculate how many more iterations it will take to achieve the `minTime`.
                    if (count <= clone.count) {
                        count += Math.ceil((minTime - clocked) / period);
                    }
                    clone.running = count != Infinity;
                }
            }
            // Should we exit early?
            event = Event('cycle');
            clone.emit(event);
            if (event.aborted) {
                clone.abort();
            }
            // Figure out what to do next.
            if (clone.running) {
                // Start a new cycle.
                clone.count = count;
                if (deferred) {
                    clone.compiled.call(deferred, context, timer);
                } else if (async) {
                    delay(clone, function() {
                        cycle(clone, options);
                    });
                } else {
                    cycle(clone);
                }
            } else {
                // Fix TraceMonkey bug associated with clock fallbacks.
                // For more information see http://bugzil.la/509069.
                if (support.browser) {
                    runScript(uid + '=1;delete ' + uid);
                }
                // We're done.
                clone.emit('complete');
            }
        }
        /*------------------------------------------------------------------------*/ /**
     * Runs the benchmark.
     *
     * @memberOf Benchmark
     * @param {Object} [options={}] Options object.
     * @returns {Object} The benchmark instance.
     * @example
     *
     * // basic usage
     * bench.run();
     *
     * // or with options
     * bench.run({ 'async': true });
     */ function run(options) {
            var bench = this, event = Event('start');
            // Set `running` to `false` so `reset()` won't call `abort()`.
            bench.running = false;
            bench.reset();
            bench.running = true;
            bench.count = bench.initCount;
            bench.times.timeStamp = _.now();
            bench.emit(event);
            if (!event.cancelled) {
                options = {
                    'async': ((options = options && options.async) == null ? bench.async : options) && support.timeout
                };
                // For clones created within `compute()`.
                if (bench._original) {
                    if (bench.defer) {
                        Deferred(bench);
                    } else {
                        cycle(bench, options);
                    }
                } else {
                    compute(bench, options);
                }
            }
            return bench;
        }
        /*------------------------------------------------------------------------*/ // Firefox 1 erroneously defines variable and argument names of functions on
        // the function itself as non-configurable properties with `undefined` values.
        // The bugginess continues as the `Benchmark` constructor has an argument
        // named `options` and Firefox 1 will not assign a value to `Benchmark.options`,
        // making it non-writable in the process, unless it is the first property
        // assigned by for-in loop of `_.assign()`.
        _.assign(Benchmark, {
            /**
       * The default options copied by benchmark instances.
       *
       * @static
       * @memberOf Benchmark
       * @type Object
       */ 'options': {
                /**
         * A flag to indicate that benchmark cycles will execute asynchronously
         * by default.
         *
         * @memberOf Benchmark.options
         * @type boolean
         */ 'async': false,
                /**
         * A flag to indicate that the benchmark clock is deferred.
         *
         * @memberOf Benchmark.options
         * @type boolean
         */ 'defer': false,
                /**
         * The delay between test cycles (secs).
         * @memberOf Benchmark.options
         * @type number
         */ 'delay': 0.005,
                /**
         * Displayed by `Benchmark#toString` when a `name` is not available
         * (auto-generated if absent).
         *
         * @memberOf Benchmark.options
         * @type string
         */ 'id': undefined,
                /**
         * The default number of times to execute a test on a benchmark's first cycle.
         *
         * @memberOf Benchmark.options
         * @type number
         */ 'initCount': 1,
                /**
         * The maximum time a benchmark is allowed to run before finishing (secs).
         *
         * Note: Cycle delays aren't counted toward the maximum time.
         *
         * @memberOf Benchmark.options
         * @type number
         */ 'maxTime': 5,
                /**
         * The minimum sample size required to perform statistical analysis.
         *
         * @memberOf Benchmark.options
         * @type number
         */ 'minSamples': 5,
                /**
         * The time needed to reduce the percent uncertainty of measurement to 1% (secs).
         *
         * @memberOf Benchmark.options
         * @type number
         */ 'minTime': 0,
                /**
         * The name of the benchmark.
         *
         * @memberOf Benchmark.options
         * @type string
         */ 'name': undefined,
                /**
         * An event listener called when the benchmark is aborted.
         *
         * @memberOf Benchmark.options
         * @type Function
         */ 'onAbort': undefined,
                /**
         * An event listener called when the benchmark completes running.
         *
         * @memberOf Benchmark.options
         * @type Function
         */ 'onComplete': undefined,
                /**
         * An event listener called after each run cycle.
         *
         * @memberOf Benchmark.options
         * @type Function
         */ 'onCycle': undefined,
                /**
         * An event listener called when a test errors.
         *
         * @memberOf Benchmark.options
         * @type Function
         */ 'onError': undefined,
                /**
         * An event listener called when the benchmark is reset.
         *
         * @memberOf Benchmark.options
         * @type Function
         */ 'onReset': undefined,
                /**
         * An event listener called when the benchmark starts running.
         *
         * @memberOf Benchmark.options
         * @type Function
         */ 'onStart': undefined
            },
            /**
       * Platform object with properties describing things like browser name,
       * version, and operating system. See [`platform.js`](https://mths.be/platform).
       *
       * @static
       * @memberOf Benchmark
       * @type Object
       */ 'platform': context.platform || require1('platform') || {
                'description': context.navigator && context.navigator.userAgent || null,
                'layout': null,
                'product': null,
                'name': null,
                'manufacturer': null,
                'os': null,
                'prerelease': null,
                'version': null,
                'toString': function() {
                    return this.description || '';
                }
            },
            /**
       * The semantic version number.
       *
       * @static
       * @memberOf Benchmark
       * @type string
       */ 'version': '2.1.4'
        });
        _.assign(Benchmark, {
            'filter': filter,
            'formatNumber': formatNumber,
            'invoke': invoke,
            'join': join,
            'runInContext': runInContext,
            'support': support
        });
        // Add lodash methods to Benchmark.
        _.each([
            'each',
            'forEach',
            'forOwn',
            'has',
            'indexOf',
            'map',
            'reduce'
        ], function(methodName) {
            Benchmark[methodName] = _[methodName];
        });
        /*------------------------------------------------------------------------*/ _.assign(Benchmark.prototype, {
            /**
       * The number of times a test was executed.
       *
       * @memberOf Benchmark
       * @type number
       */ 'count': 0,
            /**
       * The number of cycles performed while benchmarking.
       *
       * @memberOf Benchmark
       * @type number
       */ 'cycles': 0,
            /**
       * The number of executions per second.
       *
       * @memberOf Benchmark
       * @type number
       */ 'hz': 0,
            /**
       * The compiled test function.
       *
       * @memberOf Benchmark
       * @type {Function|string}
       */ 'compiled': undefined,
            /**
       * The error object if the test failed.
       *
       * @memberOf Benchmark
       * @type Object
       */ 'error': undefined,
            /**
       * The test to benchmark.
       *
       * @memberOf Benchmark
       * @type {Function|string}
       */ 'fn': undefined,
            /**
       * A flag to indicate if the benchmark is aborted.
       *
       * @memberOf Benchmark
       * @type boolean
       */ 'aborted': false,
            /**
       * A flag to indicate if the benchmark is running.
       *
       * @memberOf Benchmark
       * @type boolean
       */ 'running': false,
            /**
       * Compiled into the test and executed immediately **before** the test loop.
       *
       * @memberOf Benchmark
       * @type {Function|string}
       * @example
       *
       * // basic usage
       * var bench = Benchmark({
       *   'setup': function() {
       *     var c = this.count,
       *         element = document.getElementById('container');
       *     while (c--) {
       *       element.appendChild(document.createElement('div'));
       *     }
       *   },
       *   'fn': function() {
       *     element.removeChild(element.lastChild);
       *   }
       * });
       *
       * // compiles to something like:
       * var c = this.count,
       *     element = document.getElementById('container');
       * while (c--) {
       *   element.appendChild(document.createElement('div'));
       * }
       * var start = new Date;
       * while (count--) {
       *   element.removeChild(element.lastChild);
       * }
       * var end = new Date - start;
       *
       * // or using strings
       * var bench = Benchmark({
       *   'setup': '\
       *     var a = 0;\n\
       *     (function() {\n\
       *       (function() {\n\
       *         (function() {',
       *   'fn': 'a += 1;',
       *   'teardown': '\
       *          }())\n\
       *        }())\n\
       *      }())'
       * });
       *
       * // compiles to something like:
       * var a = 0;
       * (function() {
       *   (function() {
       *     (function() {
       *       var start = new Date;
       *       while (count--) {
       *         a += 1;
       *       }
       *       var end = new Date - start;
       *     }())
       *   }())
       * }())
       */ 'setup': _.noop,
            /**
       * Compiled into the test and executed immediately **after** the test loop.
       *
       * @memberOf Benchmark
       * @type {Function|string}
       */ 'teardown': _.noop,
            /**
       * An object of stats including mean, margin or error, and standard deviation.
       *
       * @memberOf Benchmark
       * @type Object
       */ 'stats': {
                /**
         * The margin of error.
         *
         * @memberOf Benchmark#stats
         * @type number
         */ 'moe': 0,
                /**
         * The relative margin of error (expressed as a percentage of the mean).
         *
         * @memberOf Benchmark#stats
         * @type number
         */ 'rme': 0,
                /**
         * The standard error of the mean.
         *
         * @memberOf Benchmark#stats
         * @type number
         */ 'sem': 0,
                /**
         * The sample standard deviation.
         *
         * @memberOf Benchmark#stats
         * @type number
         */ 'deviation': 0,
                /**
         * The sample arithmetic mean (secs).
         *
         * @memberOf Benchmark#stats
         * @type number
         */ 'mean': 0,
                /**
         * The array of sampled periods.
         *
         * @memberOf Benchmark#stats
         * @type Array
         */ 'sample': [],
                /**
         * The sample variance.
         *
         * @memberOf Benchmark#stats
         * @type number
         */ 'variance': 0
            },
            /**
       * An object of timing data including cycle, elapsed, period, start, and stop.
       *
       * @memberOf Benchmark
       * @type Object
       */ 'times': {
                /**
         * The time taken to complete the last cycle (secs).
         *
         * @memberOf Benchmark#times
         * @type number
         */ 'cycle': 0,
                /**
         * The time taken to complete the benchmark (secs).
         *
         * @memberOf Benchmark#times
         * @type number
         */ 'elapsed': 0,
                /**
         * The time taken to execute the test once (secs).
         *
         * @memberOf Benchmark#times
         * @type number
         */ 'period': 0,
                /**
         * A timestamp of when the benchmark started (ms).
         *
         * @memberOf Benchmark#times
         * @type number
         */ 'timeStamp': 0
            }
        });
        _.assign(Benchmark.prototype, {
            'abort': abort,
            'clone': clone,
            'compare': compare,
            'emit': emit,
            'listeners': listeners,
            'off': off,
            'on': on,
            'reset': reset,
            'run': run,
            'toString': toStringBench
        });
        /*------------------------------------------------------------------------*/ _.assign(Deferred.prototype, {
            /**
       * The deferred benchmark instance.
       *
       * @memberOf Benchmark.Deferred
       * @type Object
       */ 'benchmark': null,
            /**
       * The number of deferred cycles performed while benchmarking.
       *
       * @memberOf Benchmark.Deferred
       * @type number
       */ 'cycles': 0,
            /**
       * The time taken to complete the deferred benchmark (secs).
       *
       * @memberOf Benchmark.Deferred
       * @type number
       */ 'elapsed': 0,
            /**
       * A timestamp of when the deferred benchmark started (ms).
       *
       * @memberOf Benchmark.Deferred
       * @type number
       */ 'timeStamp': 0
        });
        _.assign(Deferred.prototype, {
            'resolve': resolve
        });
        /*------------------------------------------------------------------------*/ _.assign(Event.prototype, {
            /**
       * A flag to indicate if the emitters listener iteration is aborted.
       *
       * @memberOf Benchmark.Event
       * @type boolean
       */ 'aborted': false,
            /**
       * A flag to indicate if the default action is cancelled.
       *
       * @memberOf Benchmark.Event
       * @type boolean
       */ 'cancelled': false,
            /**
       * The object whose listeners are currently being processed.
       *
       * @memberOf Benchmark.Event
       * @type Object
       */ 'currentTarget': undefined,
            /**
       * The return value of the last executed listener.
       *
       * @memberOf Benchmark.Event
       * @type Mixed
       */ 'result': undefined,
            /**
       * The object to which the event was originally emitted.
       *
       * @memberOf Benchmark.Event
       * @type Object
       */ 'target': undefined,
            /**
       * A timestamp of when the event was created (ms).
       *
       * @memberOf Benchmark.Event
       * @type number
       */ 'timeStamp': 0,
            /**
       * The event type.
       *
       * @memberOf Benchmark.Event
       * @type string
       */ 'type': ''
        });
        /*------------------------------------------------------------------------*/ /**
     * The default options copied by suite instances.
     *
     * @static
     * @memberOf Benchmark.Suite
     * @type Object
     */ Suite.options = {
            /**
       * The name of the suite.
       *
       * @memberOf Benchmark.Suite.options
       * @type string
       */ 'name': undefined
        };
        /*------------------------------------------------------------------------*/ _.assign(Suite.prototype, {
            /**
       * The number of benchmarks in the suite.
       *
       * @memberOf Benchmark.Suite
       * @type number
       */ 'length': 0,
            /**
       * A flag to indicate if the suite is aborted.
       *
       * @memberOf Benchmark.Suite
       * @type boolean
       */ 'aborted': false,
            /**
       * A flag to indicate if the suite is running.
       *
       * @memberOf Benchmark.Suite
       * @type boolean
       */ 'running': false
        });
        _.assign(Suite.prototype, {
            'abort': abortSuite,
            'add': add,
            'clone': cloneSuite,
            'emit': emit,
            'filter': filterSuite,
            'join': arrayRef.join,
            'listeners': listeners,
            'off': off,
            'on': on,
            'pop': arrayRef.pop,
            'push': push,
            'reset': resetSuite,
            'run': runSuite,
            'reverse': arrayRef.reverse,
            'shift': shift,
            'slice': slice,
            'sort': arrayRef.sort,
            'splice': arrayRef.splice,
            'unshift': unshift
        });
        /*------------------------------------------------------------------------*/ // Expose Deferred, Event, and Suite.
        _.assign(Benchmark, {
            'Deferred': Deferred,
            'Event': Event,
            'Suite': Suite
        });
        /*------------------------------------------------------------------------*/ // Add lodash methods as Suite methods.
        _.each([
            'each',
            'forEach',
            'indexOf',
            'map',
            'reduce'
        ], function(methodName) {
            var func = _[methodName];
            Suite.prototype[methodName] = function() {
                var args = [
                    this
                ];
                push.apply(args, arguments);
                return func.apply(_, args);
            };
        });
        // Avoid array-like object bugs with `Array#shift` and `Array#splice`
        // in Firefox < 10 and IE < 9.
        _.each([
            'pop',
            'shift',
            'splice'
        ], function(methodName) {
            var func = arrayRef[methodName];
            Suite.prototype[methodName] = function() {
                var value = this, result = func.apply(value, arguments);
                if (value.length === 0) {
                    delete value[0];
                }
                return result;
            };
        });
        // Avoid buggy `Array#unshift` in IE < 8 which doesn't return the new
        // length of the array.
        Suite.prototype.unshift = function() {
            var value = this;
            unshift.apply(value, arguments);
            return value.length;
        };
        return Benchmark;
    }
    /*--------------------------------------------------------------------------*/ // Export Benchmark.
    // Some AMD build optimizers, like r.js, check for condition patterns like the following:
    if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
        // Define as an anonymous module so, through path mapping, it can be aliased.
        define([
            'lodash',
            'platform'
        ], function(_, platform) {
            return runInContext({
                '_': _,
                'platform': platform
            });
        });
    } else {
        var Benchmark = runInContext();
        // Check for `exports` after `define` in case a build optimizer adds an `exports` object.
        if (freeExports && freeModule) {
            // Export for Node.js.
            if (moduleExports) {
                (freeModule.exports = Benchmark).Benchmark = Benchmark;
            }
            // Export for CommonJS support.
            freeExports.Benchmark = Benchmark;
        } else {
            // Export to the global object.
            root.Benchmark = Benchmark;
        }
    }
}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvYmVuY2htYXJrLTIuMS40LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICogQmVuY2htYXJrLmpzIDxodHRwczovL2JlbmNobWFya2pzLmNvbS8+XG4gKiBDb3B5cmlnaHQgMjAxMC0yMDE2IE1hdGhpYXMgQnluZW5zIDxodHRwczovL210aHMuYmUvPlxuICogQmFzZWQgb24gSlNMaXRtdXMuanMsIGNvcHlyaWdodCBSb2JlcnQgS2llZmZlciA8aHR0cDovL2Jyb29mYS5jb20vPlxuICogTW9kaWZpZWQgYnkgSm9obi1EYXZpZCBEYWx0b24gPGh0dHA6Ly9hbGx5b3VjYW5sZWV0LmNvbS8+XG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHBzOi8vbXRocy5iZS9taXQ+XG4gKi9cbjsoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKiogVXNlZCBhcyBhIHNhZmUgcmVmZXJlbmNlIGZvciBgdW5kZWZpbmVkYCBpbiBwcmUgRVM1IGVudmlyb25tZW50cy4gKi9cbiAgdmFyIHVuZGVmaW5lZDtcblxuICAvKiogVXNlZCB0byBkZXRlcm1pbmUgaWYgdmFsdWVzIGFyZSBvZiB0aGUgbGFuZ3VhZ2UgdHlwZSBPYmplY3QuICovXG4gIHZhciBvYmplY3RUeXBlcyA9IHtcbiAgICAnZnVuY3Rpb24nOiB0cnVlLFxuICAgICdvYmplY3QnOiB0cnVlXG4gIH07XG5cbiAgLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG4gIHZhciByb290ID0gKG9iamVjdFR5cGVzW3R5cGVvZiB3aW5kb3ddICYmIHdpbmRvdykgfHwgdGhpcztcblxuICAvKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGRlZmluZWAuICovXG4gIHZhciBmcmVlRGVmaW5lID0gdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmIGRlZmluZS5hbWQgJiYgZGVmaW5lO1xuXG4gIC8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZXhwb3J0c2AuICovXG4gIHZhciBmcmVlRXhwb3J0cyA9IG9iamVjdFR5cGVzW3R5cGVvZiBleHBvcnRzXSAmJiBleHBvcnRzICYmICFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cbiAgLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xuICB2YXIgZnJlZU1vZHVsZSA9IG9iamVjdFR5cGVzW3R5cGVvZiBtb2R1bGVdICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuICAvKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAgZnJvbSBOb2RlLmpzIG9yIEJyb3dzZXJpZmllZCBjb2RlIGFuZCB1c2UgaXQgYXMgYHJvb3RgLiAqL1xuICB2YXIgZnJlZUdsb2JhbCA9IGZyZWVFeHBvcnRzICYmIGZyZWVNb2R1bGUgJiYgdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWw7XG4gIGlmIChmcmVlR2xvYmFsICYmIChmcmVlR2xvYmFsLmdsb2JhbCA9PT0gZnJlZUdsb2JhbCB8fCBmcmVlR2xvYmFsLndpbmRvdyA9PT0gZnJlZUdsb2JhbCB8fCBmcmVlR2xvYmFsLnNlbGYgPT09IGZyZWVHbG9iYWwpKSB7XG4gICAgcm9vdCA9IGZyZWVHbG9iYWw7XG4gIH1cblxuICAvKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHJlcXVpcmVgLiAqL1xuICB2YXIgZnJlZVJlcXVpcmUgPSB0eXBlb2YgcmVxdWlyZSA9PSAnZnVuY3Rpb24nICYmIHJlcXVpcmU7XG5cbiAgLyoqIFVzZWQgdG8gYXNzaWduIGVhY2ggYmVuY2htYXJrIGFuIGluY3JlbWVudGVkIGlkLiAqL1xuICB2YXIgY291bnRlciA9IDA7XG5cbiAgLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbiAgdmFyIG1vZHVsZUV4cG9ydHMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUuZXhwb3J0cyA9PT0gZnJlZUV4cG9ydHMgJiYgZnJlZUV4cG9ydHM7XG5cbiAgLyoqIFVzZWQgdG8gZGV0ZWN0IHByaW1pdGl2ZSB0eXBlcy4gKi9cbiAgdmFyIHJlUHJpbWl0aXZlID0gL14oPzpib29sZWFufG51bWJlcnxzdHJpbmd8dW5kZWZpbmVkKSQvO1xuXG4gIC8qKiBVc2VkIHRvIG1ha2UgZXZlcnkgY29tcGlsZWQgdGVzdCB1bmlxdWUuICovXG4gIHZhciB1aWRDb3VudGVyID0gMDtcblxuICAvKiogVXNlZCB0byBhc3NpZ24gZGVmYXVsdCBgY29udGV4dGAgb2JqZWN0IHByb3BlcnRpZXMuICovXG4gIHZhciBjb250ZXh0UHJvcHMgPSBbXG4gICAgJ0FycmF5JywgJ0RhdGUnLCAnRnVuY3Rpb24nLCAnTWF0aCcsICdPYmplY3QnLCAnUmVnRXhwJywgJ1N0cmluZycsICdfJyxcbiAgICAnY2xlYXJUaW1lb3V0JywgJ2Nocm9tZScsICdjaHJvbWl1bScsICdkb2N1bWVudCcsICduYXZpZ2F0b3InLCAncGhhbnRvbScsXG4gICAgJ3BsYXRmb3JtJywgJ3Byb2Nlc3MnLCAncnVudGltZScsICdzZXRUaW1lb3V0J1xuICBdO1xuXG4gIC8qKiBVc2VkIHRvIGF2b2lkIGh6IG9mIEluZmluaXR5LiAqL1xuICB2YXIgZGl2aXNvcnMgPSB7XG4gICAgJzEnOiA0MDk2LFxuICAgICcyJzogNTEyLFxuICAgICczJzogNjQsXG4gICAgJzQnOiA4LFxuICAgICc1JzogMFxuICB9O1xuXG4gIC8qKlxuICAgKiBULURpc3RyaWJ1dGlvbiB0d28tdGFpbGVkIGNyaXRpY2FsIHZhbHVlcyBmb3IgOTUlIGNvbmZpZGVuY2UuXG4gICAqIEZvciBtb3JlIGluZm8gc2VlIGh0dHA6Ly93d3cuaXRsLm5pc3QuZ292L2Rpdjg5OC9oYW5kYm9vay9lZGEvc2VjdGlvbjMvZWRhMzY3Mi5odG0uXG4gICAqL1xuICB2YXIgdFRhYmxlID0ge1xuICAgICcxJzogIDEyLjcwNiwgJzInOiAgNC4zMDMsICczJzogIDMuMTgyLCAnNCc6ICAyLjc3NiwgJzUnOiAgMi41NzEsICc2JzogIDIuNDQ3LFxuICAgICc3JzogIDIuMzY1LCAgJzgnOiAgMi4zMDYsICc5JzogIDIuMjYyLCAnMTAnOiAyLjIyOCwgJzExJzogMi4yMDEsICcxMic6IDIuMTc5LFxuICAgICcxMyc6IDIuMTYsICAgJzE0JzogMi4xNDUsICcxNSc6IDIuMTMxLCAnMTYnOiAyLjEyLCAgJzE3JzogMi4xMSwgICcxOCc6IDIuMTAxLFxuICAgICcxOSc6IDIuMDkzLCAgJzIwJzogMi4wODYsICcyMSc6IDIuMDgsICAnMjInOiAyLjA3NCwgJzIzJzogMi4wNjksICcyNCc6IDIuMDY0LFxuICAgICcyNSc6IDIuMDYsICAgJzI2JzogMi4wNTYsICcyNyc6IDIuMDUyLCAnMjgnOiAyLjA0OCwgJzI5JzogMi4wNDUsICczMCc6IDIuMDQyLFxuICAgICdpbmZpbml0eSc6IDEuOTZcbiAgfTtcblxuICAvKipcbiAgICogQ3JpdGljYWwgTWFubi1XaGl0bmV5IFUtdmFsdWVzIGZvciA5NSUgY29uZmlkZW5jZS5cbiAgICogRm9yIG1vcmUgaW5mbyBzZWUgaHR0cDovL3d3dy5zYWJ1cmNoaWxsLmNvbS9JQmJpb2xvZ3kvc3RhdHMvMDAzLmh0bWwuXG4gICAqL1xuICB2YXIgdVRhYmxlID0ge1xuICAgICc1JzogIFswLCAxLCAyXSxcbiAgICAnNic6ICBbMSwgMiwgMywgNV0sXG4gICAgJzcnOiAgWzEsIDMsIDUsIDYsIDhdLFxuICAgICc4JzogIFsyLCA0LCA2LCA4LCAxMCwgMTNdLFxuICAgICc5JzogIFsyLCA0LCA3LCAxMCwgMTIsIDE1LCAxN10sXG4gICAgJzEwJzogWzMsIDUsIDgsIDExLCAxNCwgMTcsIDIwLCAyM10sXG4gICAgJzExJzogWzMsIDYsIDksIDEzLCAxNiwgMTksIDIzLCAyNiwgMzBdLFxuICAgICcxMic6IFs0LCA3LCAxMSwgMTQsIDE4LCAyMiwgMjYsIDI5LCAzMywgMzddLFxuICAgICcxMyc6IFs0LCA4LCAxMiwgMTYsIDIwLCAyNCwgMjgsIDMzLCAzNywgNDEsIDQ1XSxcbiAgICAnMTQnOiBbNSwgOSwgMTMsIDE3LCAyMiwgMjYsIDMxLCAzNiwgNDAsIDQ1LCA1MCwgNTVdLFxuICAgICcxNSc6IFs1LCAxMCwgMTQsIDE5LCAyNCwgMjksIDM0LCAzOSwgNDQsIDQ5LCA1NCwgNTksIDY0XSxcbiAgICAnMTYnOiBbNiwgMTEsIDE1LCAyMSwgMjYsIDMxLCAzNywgNDIsIDQ3LCA1MywgNTksIDY0LCA3MCwgNzVdLFxuICAgICcxNyc6IFs2LCAxMSwgMTcsIDIyLCAyOCwgMzQsIDM5LCA0NSwgNTEsIDU3LCA2MywgNjcsIDc1LCA4MSwgODddLFxuICAgICcxOCc6IFs3LCAxMiwgMTgsIDI0LCAzMCwgMzYsIDQyLCA0OCwgNTUsIDYxLCA2NywgNzQsIDgwLCA4NiwgOTMsIDk5XSxcbiAgICAnMTknOiBbNywgMTMsIDE5LCAyNSwgMzIsIDM4LCA0NSwgNTIsIDU4LCA2NSwgNzIsIDc4LCA4NSwgOTIsIDk5LCAxMDYsIDExM10sXG4gICAgJzIwJzogWzgsIDE0LCAyMCwgMjcsIDM0LCA0MSwgNDgsIDU1LCA2MiwgNjksIDc2LCA4MywgOTAsIDk4LCAxMDUsIDExMiwgMTE5LCAxMjddLFxuICAgICcyMSc6IFs4LCAxNSwgMjIsIDI5LCAzNiwgNDMsIDUwLCA1OCwgNjUsIDczLCA4MCwgODgsIDk2LCAxMDMsIDExMSwgMTE5LCAxMjYsIDEzNCwgMTQyXSxcbiAgICAnMjInOiBbOSwgMTYsIDIzLCAzMCwgMzgsIDQ1LCA1MywgNjEsIDY5LCA3NywgODUsIDkzLCAxMDEsIDEwOSwgMTE3LCAxMjUsIDEzMywgMTQxLCAxNTAsIDE1OF0sXG4gICAgJzIzJzogWzksIDE3LCAyNCwgMzIsIDQwLCA0OCwgNTYsIDY0LCA3MywgODEsIDg5LCA5OCwgMTA2LCAxMTUsIDEyMywgMTMyLCAxNDAsIDE0OSwgMTU3LCAxNjYsIDE3NV0sXG4gICAgJzI0JzogWzEwLCAxNywgMjUsIDMzLCA0MiwgNTAsIDU5LCA2NywgNzYsIDg1LCA5NCwgMTAyLCAxMTEsIDEyMCwgMTI5LCAxMzgsIDE0NywgMTU2LCAxNjUsIDE3NCwgMTgzLCAxOTJdLFxuICAgICcyNSc6IFsxMCwgMTgsIDI3LCAzNSwgNDQsIDUzLCA2MiwgNzEsIDgwLCA4OSwgOTgsIDEwNywgMTE3LCAxMjYsIDEzNSwgMTQ1LCAxNTQsIDE2MywgMTczLCAxODIsIDE5MiwgMjAxLCAyMTFdLFxuICAgICcyNic6IFsxMSwgMTksIDI4LCAzNywgNDYsIDU1LCA2NCwgNzQsIDgzLCA5MywgMTAyLCAxMTIsIDEyMiwgMTMyLCAxNDEsIDE1MSwgMTYxLCAxNzEsIDE4MSwgMTkxLCAyMDAsIDIxMCwgMjIwLCAyMzBdLFxuICAgICcyNyc6IFsxMSwgMjAsIDI5LCAzOCwgNDgsIDU3LCA2NywgNzcsIDg3LCA5NywgMTA3LCAxMTgsIDEyNSwgMTM4LCAxNDcsIDE1OCwgMTY4LCAxNzgsIDE4OCwgMTk5LCAyMDksIDIxOSwgMjMwLCAyNDAsIDI1MF0sXG4gICAgJzI4JzogWzEyLCAyMSwgMzAsIDQwLCA1MCwgNjAsIDcwLCA4MCwgOTAsIDEwMSwgMTExLCAxMjIsIDEzMiwgMTQzLCAxNTQsIDE2NCwgMTc1LCAxODYsIDE5NiwgMjA3LCAyMTgsIDIyOCwgMjM5LCAyNTAsIDI2MSwgMjcyXSxcbiAgICAnMjknOiBbMTMsIDIyLCAzMiwgNDIsIDUyLCA2MiwgNzMsIDgzLCA5NCwgMTA1LCAxMTYsIDEyNywgMTM4LCAxNDksIDE2MCwgMTcxLCAxODIsIDE5MywgMjA0LCAyMTUsIDIyNiwgMjM4LCAyNDksIDI2MCwgMjcxLCAyODIsIDI5NF0sXG4gICAgJzMwJzogWzEzLCAyMywgMzMsIDQzLCA1NCwgNjUsIDc2LCA4NywgOTgsIDEwOSwgMTIwLCAxMzEsIDE0MywgMTU0LCAxNjYsIDE3NywgMTg5LCAyMDAsIDIxMiwgMjIzLCAyMzUsIDI0NywgMjU4LCAyNzAsIDI4MiwgMjkzLCAzMDUsIDMxN11cbiAgfTtcblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBCZW5jaG1hcmtgIGZ1bmN0aW9uIHVzaW5nIHRoZSBnaXZlbiBgY29udGV4dGAgb2JqZWN0LlxuICAgKlxuICAgKiBAc3RhdGljXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICogQHBhcmFtIHtPYmplY3R9IFtjb250ZXh0PXJvb3RdIFRoZSBjb250ZXh0IG9iamVjdC5cbiAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGEgbmV3IGBCZW5jaG1hcmtgIGZ1bmN0aW9uLlxuICAgKi9cbiAgZnVuY3Rpb24gcnVuSW5Db250ZXh0KGNvbnRleHQpIHtcbiAgICAvLyBFeGl0IGVhcmx5IGlmIHVuYWJsZSB0byBhY3F1aXJlIGxvZGFzaC5cbiAgICB2YXIgXyA9IGNvbnRleHQgJiYgY29udGV4dC5fIHx8IHJlcXVpcmUoJ2xvZGFzaCcpIHx8IHJvb3QuXztcbiAgICBpZiAoIV8pIHtcbiAgICAgIEJlbmNobWFyay5ydW5JbkNvbnRleHQgPSBydW5JbkNvbnRleHQ7XG4gICAgICByZXR1cm4gQmVuY2htYXJrO1xuICAgIH1cbiAgICAvLyBBdm9pZCBpc3N1ZXMgd2l0aCBzb21lIEVTMyBlbnZpcm9ubWVudHMgdGhhdCBhdHRlbXB0IHRvIHVzZSB2YWx1ZXMsIG5hbWVkXG4gICAgLy8gYWZ0ZXIgYnVpbHQtaW4gY29uc3RydWN0b3JzIGxpa2UgYE9iamVjdGAsIGZvciB0aGUgY3JlYXRpb24gb2YgbGl0ZXJhbHMuXG4gICAgLy8gRVM1IGNsZWFycyB0aGlzIHVwIGJ5IHN0YXRpbmcgdGhhdCBsaXRlcmFscyBtdXN0IHVzZSBidWlsdC1pbiBjb25zdHJ1Y3RvcnMuXG4gICAgLy8gU2VlIGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4MTEuMS41LlxuICAgIGNvbnRleHQgPSBjb250ZXh0ID8gXy5kZWZhdWx0cyhyb290Lk9iamVjdCgpLCBjb250ZXh0LCBfLnBpY2socm9vdCwgY29udGV4dFByb3BzKSkgOiByb290O1xuXG4gICAgLyoqIE5hdGl2ZSBjb25zdHJ1Y3RvciByZWZlcmVuY2VzLiAqL1xuICAgIHZhciBBcnJheSA9IGNvbnRleHQuQXJyYXksXG4gICAgICAgIERhdGUgPSBjb250ZXh0LkRhdGUsXG4gICAgICAgIEZ1bmN0aW9uID0gY29udGV4dC5GdW5jdGlvbixcbiAgICAgICAgTWF0aCA9IGNvbnRleHQuTWF0aCxcbiAgICAgICAgT2JqZWN0ID0gY29udGV4dC5PYmplY3QsXG4gICAgICAgIFJlZ0V4cCA9IGNvbnRleHQuUmVnRXhwLFxuICAgICAgICBTdHJpbmcgPSBjb250ZXh0LlN0cmluZztcblxuICAgIC8qKiBVc2VkIGZvciBgQXJyYXlgIGFuZCBgT2JqZWN0YCBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbiAgICB2YXIgYXJyYXlSZWYgPSBbXSxcbiAgICAgICAgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4gICAgLyoqIE5hdGl2ZSBtZXRob2Qgc2hvcnRjdXRzLiAqL1xuICAgIHZhciBhYnMgPSBNYXRoLmFicyxcbiAgICAgICAgY2xlYXJUaW1lb3V0ID0gY29udGV4dC5jbGVhclRpbWVvdXQsXG4gICAgICAgIGZsb29yID0gTWF0aC5mbG9vcixcbiAgICAgICAgbG9nID0gTWF0aC5sb2csXG4gICAgICAgIG1heCA9IE1hdGgubWF4LFxuICAgICAgICBtaW4gPSBNYXRoLm1pbixcbiAgICAgICAgcG93ID0gTWF0aC5wb3csXG4gICAgICAgIHB1c2ggPSBhcnJheVJlZi5wdXNoLFxuICAgICAgICBzZXRUaW1lb3V0ID0gY29udGV4dC5zZXRUaW1lb3V0LFxuICAgICAgICBzaGlmdCA9IGFycmF5UmVmLnNoaWZ0LFxuICAgICAgICBzbGljZSA9IGFycmF5UmVmLnNsaWNlLFxuICAgICAgICBzcXJ0ID0gTWF0aC5zcXJ0LFxuICAgICAgICB0b1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nLFxuICAgICAgICB1bnNoaWZ0ID0gYXJyYXlSZWYudW5zaGlmdDtcblxuICAgIC8qKiBVc2VkIHRvIGF2b2lkIGluY2x1c2lvbiBpbiBCcm93c2VyaWZpZWQgYnVuZGxlcy4gKi9cbiAgICB2YXIgcmVxID0gcmVxdWlyZTtcblxuICAgIC8qKiBEZXRlY3QgRE9NIGRvY3VtZW50IG9iamVjdC4gKi9cbiAgICB2YXIgZG9jID0gaXNIb3N0VHlwZShjb250ZXh0LCAnZG9jdW1lbnQnKSAmJiBjb250ZXh0LmRvY3VtZW50O1xuXG4gICAgLyoqIFVzZWQgdG8gYWNjZXNzIFdhZGUgU2ltbW9ucycgTm9kZS5qcyBgbWljcm90aW1lYCBtb2R1bGUuICovXG4gICAgdmFyIG1pY3JvdGltZU9iamVjdCA9IHJlcSgnbWljcm90aW1lJyk7XG5cbiAgICAvKiogVXNlZCB0byBhY2Nlc3MgTm9kZS5qcydzIGhpZ2ggcmVzb2x1dGlvbiB0aW1lci4gKi9cbiAgICB2YXIgcHJvY2Vzc09iamVjdCA9IGlzSG9zdFR5cGUoY29udGV4dCwgJ3Byb2Nlc3MnKSAmJiBjb250ZXh0LnByb2Nlc3M7XG5cbiAgICAvKiogVXNlZCB0byBwcmV2ZW50IGEgYHJlbW92ZUNoaWxkYCBtZW1vcnkgbGVhayBpbiBJRSA8IDkuICovXG4gICAgdmFyIHRyYXNoID0gZG9jICYmIGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgIC8qKiBVc2VkIHRvIGludGVncml0eSBjaGVjayBjb21waWxlZCB0ZXN0cy4gKi9cbiAgICB2YXIgdWlkID0gJ3VpZCcgKyBfLm5vdygpO1xuXG4gICAgLyoqIFVzZWQgdG8gYXZvaWQgaW5maW5pdGUgcmVjdXJzaW9uIHdoZW4gbWV0aG9kcyBjYWxsIGVhY2ggb3RoZXIuICovXG4gICAgdmFyIGNhbGxlZEJ5ID0ge307XG5cbiAgICAvKipcbiAgICAgKiBBbiBvYmplY3QgdXNlZCB0byBmbGFnIGVudmlyb25tZW50cy9mZWF0dXJlcy5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAgICogQHR5cGUgT2JqZWN0XG4gICAgICovXG4gICAgdmFyIHN1cHBvcnQgPSB7fTtcblxuICAgIChmdW5jdGlvbigpIHtcblxuICAgICAgLyoqXG4gICAgICAgKiBEZXRlY3QgaWYgcnVubmluZyBpbiBhIGJyb3dzZXIgZW52aXJvbm1lbnQuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyay5zdXBwb3J0XG4gICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgKi9cbiAgICAgIHN1cHBvcnQuYnJvd3NlciA9IGRvYyAmJiBpc0hvc3RUeXBlKGNvbnRleHQsICduYXZpZ2F0b3InKSAmJiAhaXNIb3N0VHlwZShjb250ZXh0LCAncGhhbnRvbScpO1xuXG4gICAgICAvKipcbiAgICAgICAqIERldGVjdCBpZiB0aGUgVGltZXJzIEFQSSBleGlzdHMuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyay5zdXBwb3J0XG4gICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgKi9cbiAgICAgIHN1cHBvcnQudGltZW91dCA9IGlzSG9zdFR5cGUoY29udGV4dCwgJ3NldFRpbWVvdXQnKSAmJiBpc0hvc3RUeXBlKGNvbnRleHQsICdjbGVhclRpbWVvdXQnKTtcblxuICAgICAgLyoqXG4gICAgICAgKiBEZXRlY3QgaWYgZnVuY3Rpb24gZGVjb21waWxhdGlvbiBpcyBzdXBwb3J0LlxuICAgICAgICpcbiAgICAgICAqIEBuYW1lIGRlY29tcGlsYXRpb25cbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuc3VwcG9ydFxuICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICovXG4gICAgICB0cnkge1xuICAgICAgICAvLyBTYWZhcmkgMi54IHJlbW92ZXMgY29tbWFzIGluIG9iamVjdCBsaXRlcmFscyBmcm9tIGBGdW5jdGlvbiN0b1N0cmluZ2AgcmVzdWx0cy5cbiAgICAgICAgLy8gU2VlIGh0dHA6Ly93ZWJrLml0LzExNjA5IGZvciBtb3JlIGRldGFpbHMuXG4gICAgICAgIC8vIEZpcmVmb3ggMy42IGFuZCBPcGVyYSA5LjI1IHN0cmlwIGdyb3VwaW5nIHBhcmVudGhlc2VzIGZyb20gYEZ1bmN0aW9uI3RvU3RyaW5nYCByZXN1bHRzLlxuICAgICAgICAvLyBTZWUgaHR0cDovL2J1Z3ppbC5sYS81NTk0MzggZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgICAgc3VwcG9ydC5kZWNvbXBpbGF0aW9uID0gRnVuY3Rpb24oXG4gICAgICAgICAgKCdyZXR1cm4gKCcgKyAoZnVuY3Rpb24oeCkgeyByZXR1cm4geyAneCc6ICcnICsgKDEgKyB4KSArICcnLCAneSc6IDAgfTsgfSkgKyAnKScpXG4gICAgICAgICAgLy8gQXZvaWQgaXNzdWVzIHdpdGggY29kZSBhZGRlZCBieSBJc3RhbmJ1bC5cbiAgICAgICAgICAucmVwbGFjZSgvX19jb3ZfX1teO10rOy9nLCAnJylcbiAgICAgICAgKSgpKDApLnggPT09ICcxJztcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICBzdXBwb3J0LmRlY29tcGlsYXRpb24gPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9KCkpO1xuXG4gICAgLyoqXG4gICAgICogVGltZXIgb2JqZWN0IHVzZWQgYnkgYGNsb2NrKClgIGFuZCBgRGVmZXJyZWQjcmVzb2x2ZWAuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAqL1xuICAgIHZhciB0aW1lciA9IHtcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgdGltZXIgbmFtZXNwYWNlIG9iamVjdCBvciBjb25zdHJ1Y3Rvci5cbiAgICAgICAqXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICogQG1lbWJlck9mIHRpbWVyXG4gICAgICAgKiBAdHlwZSB7RnVuY3Rpb258T2JqZWN0fVxuICAgICAgICovXG4gICAgICAnbnMnOiBEYXRlLFxuXG4gICAgICAvKipcbiAgICAgICAqIFN0YXJ0cyB0aGUgZGVmZXJyZWQgdGltZXIuXG4gICAgICAgKlxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqIEBtZW1iZXJPZiB0aW1lclxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IGRlZmVycmVkIFRoZSBkZWZlcnJlZCBpbnN0YW5jZS5cbiAgICAgICAqL1xuICAgICAgJ3N0YXJ0JzogbnVsbCwgLy8gTGF6eSBkZWZpbmVkIGluIGBjbG9jaygpYC5cblxuICAgICAgLyoqXG4gICAgICAgKiBTdG9wcyB0aGUgZGVmZXJyZWQgdGltZXIuXG4gICAgICAgKlxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqIEBtZW1iZXJPZiB0aW1lclxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IGRlZmVycmVkIFRoZSBkZWZlcnJlZCBpbnN0YW5jZS5cbiAgICAgICAqL1xuICAgICAgJ3N0b3AnOiBudWxsIC8vIExhenkgZGVmaW5lZCBpbiBgY2xvY2soKWAuXG4gICAgfTtcblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIC8qKlxuICAgICAqIFRoZSBCZW5jaG1hcmsgY29uc3RydWN0b3IuXG4gICAgICpcbiAgICAgKiBOb3RlOiBUaGUgQmVuY2htYXJrIGNvbnN0cnVjdG9yIGV4cG9zZXMgYSBoYW5kZnVsIG9mIGxvZGFzaCBtZXRob2RzIHRvXG4gICAgICogbWFrZSB3b3JraW5nIHdpdGggYXJyYXlzLCBjb2xsZWN0aW9ucywgYW5kIG9iamVjdHMgZWFzaWVyLiBUaGUgbG9kYXNoXG4gICAgICogbWV0aG9kcyBhcmU6XG4gICAgICogW2BlYWNoL2ZvckVhY2hgXShodHRwczovL2xvZGFzaC5jb20vZG9jcyNmb3JFYWNoKSwgW2Bmb3JPd25gXShodHRwczovL2xvZGFzaC5jb20vZG9jcyNmb3JPd24pLFxuICAgICAqIFtgaGFzYF0oaHR0cHM6Ly9sb2Rhc2guY29tL2RvY3MjaGFzKSwgW2BpbmRleE9mYF0oaHR0cHM6Ly9sb2Rhc2guY29tL2RvY3MjaW5kZXhPZiksXG4gICAgICogW2BtYXBgXShodHRwczovL2xvZGFzaC5jb20vZG9jcyNtYXApLCBhbmQgW2ByZWR1Y2VgXShodHRwczovL2xvZGFzaC5jb20vZG9jcyNyZWR1Y2UpXG4gICAgICpcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBBIG5hbWUgdG8gaWRlbnRpZnkgdGhlIGJlbmNobWFyay5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufHN0cmluZ30gZm4gVGhlIHRlc3QgdG8gYmVuY2htYXJrLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gT3B0aW9ucyBvYmplY3QuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIC8vIGJhc2ljIHVzYWdlICh0aGUgYG5ld2Agb3BlcmF0b3IgaXMgb3B0aW9uYWwpXG4gICAgICogdmFyIGJlbmNoID0gbmV3IEJlbmNobWFyayhmbik7XG4gICAgICpcbiAgICAgKiAvLyBvciB1c2luZyBhIG5hbWUgZmlyc3RcbiAgICAgKiB2YXIgYmVuY2ggPSBuZXcgQmVuY2htYXJrKCdmb28nLCBmbik7XG4gICAgICpcbiAgICAgKiAvLyBvciB3aXRoIG9wdGlvbnNcbiAgICAgKiB2YXIgYmVuY2ggPSBuZXcgQmVuY2htYXJrKCdmb28nLCBmbiwge1xuICAgICAqXG4gICAgICogICAvLyBkaXNwbGF5ZWQgYnkgYEJlbmNobWFyayN0b1N0cmluZ2AgaWYgYG5hbWVgIGlzIG5vdCBhdmFpbGFibGVcbiAgICAgKiAgICdpZCc6ICd4eXonLFxuICAgICAqXG4gICAgICogICAvLyBjYWxsZWQgd2hlbiB0aGUgYmVuY2htYXJrIHN0YXJ0cyBydW5uaW5nXG4gICAgICogICAnb25TdGFydCc6IG9uU3RhcnQsXG4gICAgICpcbiAgICAgKiAgIC8vIGNhbGxlZCBhZnRlciBlYWNoIHJ1biBjeWNsZVxuICAgICAqICAgJ29uQ3ljbGUnOiBvbkN5Y2xlLFxuICAgICAqXG4gICAgICogICAvLyBjYWxsZWQgd2hlbiBhYm9ydGVkXG4gICAgICogICAnb25BYm9ydCc6IG9uQWJvcnQsXG4gICAgICpcbiAgICAgKiAgIC8vIGNhbGxlZCB3aGVuIGEgdGVzdCBlcnJvcnNcbiAgICAgKiAgICdvbkVycm9yJzogb25FcnJvcixcbiAgICAgKlxuICAgICAqICAgLy8gY2FsbGVkIHdoZW4gcmVzZXRcbiAgICAgKiAgICdvblJlc2V0Jzogb25SZXNldCxcbiAgICAgKlxuICAgICAqICAgLy8gY2FsbGVkIHdoZW4gdGhlIGJlbmNobWFyayBjb21wbGV0ZXMgcnVubmluZ1xuICAgICAqICAgJ29uQ29tcGxldGUnOiBvbkNvbXBsZXRlLFxuICAgICAqXG4gICAgICogICAvLyBjb21waWxlZC9jYWxsZWQgYmVmb3JlIHRoZSB0ZXN0IGxvb3BcbiAgICAgKiAgICdzZXR1cCc6IHNldHVwLFxuICAgICAqXG4gICAgICogICAvLyBjb21waWxlZC9jYWxsZWQgYWZ0ZXIgdGhlIHRlc3QgbG9vcFxuICAgICAqICAgJ3RlYXJkb3duJzogdGVhcmRvd25cbiAgICAgKiB9KTtcbiAgICAgKlxuICAgICAqIC8vIG9yIG5hbWUgYW5kIG9wdGlvbnNcbiAgICAgKiB2YXIgYmVuY2ggPSBuZXcgQmVuY2htYXJrKCdmb28nLCB7XG4gICAgICpcbiAgICAgKiAgIC8vIGEgZmxhZyB0byBpbmRpY2F0ZSB0aGUgYmVuY2htYXJrIGlzIGRlZmVycmVkXG4gICAgICogICAnZGVmZXInOiB0cnVlLFxuICAgICAqXG4gICAgICogICAvLyBiZW5jaG1hcmsgdGVzdCBmdW5jdGlvblxuICAgICAqICAgJ2ZuJzogZnVuY3Rpb24oZGVmZXJyZWQpIHtcbiAgICAgKiAgICAgLy8gY2FsbCBgRGVmZXJyZWQjcmVzb2x2ZWAgd2hlbiB0aGUgZGVmZXJyZWQgdGVzdCBpcyBmaW5pc2hlZFxuICAgICAqICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICogICB9XG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiAvLyBvciBvcHRpb25zIG9ubHlcbiAgICAgKiB2YXIgYmVuY2ggPSBuZXcgQmVuY2htYXJrKHtcbiAgICAgKlxuICAgICAqICAgLy8gYmVuY2htYXJrIG5hbWVcbiAgICAgKiAgICduYW1lJzogJ2ZvbycsXG4gICAgICpcbiAgICAgKiAgIC8vIGJlbmNobWFyayB0ZXN0IGFzIGEgc3RyaW5nXG4gICAgICogICAnZm4nOiAnWzEsMiwzLDRdLnNvcnQoKSdcbiAgICAgKiB9KTtcbiAgICAgKlxuICAgICAqIC8vIGEgdGVzdCdzIGB0aGlzYCBiaW5kaW5nIGlzIHNldCB0byB0aGUgYmVuY2htYXJrIGluc3RhbmNlXG4gICAgICogdmFyIGJlbmNoID0gbmV3IEJlbmNobWFyaygnZm9vJywgZnVuY3Rpb24oKSB7XG4gICAgICogICAnTXkgbmFtZSBpcyAnLmNvbmNhdCh0aGlzLm5hbWUpOyAvLyBcIk15IG5hbWUgaXMgZm9vXCJcbiAgICAgKiB9KTtcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBCZW5jaG1hcmsobmFtZSwgZm4sIG9wdGlvbnMpIHtcbiAgICAgIHZhciBiZW5jaCA9IHRoaXM7XG5cbiAgICAgIC8vIEFsbG93IGluc3RhbmNlIGNyZWF0aW9uIHdpdGhvdXQgdGhlIGBuZXdgIG9wZXJhdG9yLlxuICAgICAgaWYgKCEoYmVuY2ggaW5zdGFuY2VvZiBCZW5jaG1hcmspKSB7XG4gICAgICAgIHJldHVybiBuZXcgQmVuY2htYXJrKG5hbWUsIGZuLCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICAgIC8vIEp1Z2dsZSBhcmd1bWVudHMuXG4gICAgICBpZiAoXy5pc1BsYWluT2JqZWN0KG5hbWUpKSB7XG4gICAgICAgIC8vIDEgYXJndW1lbnQgKG9wdGlvbnMpLlxuICAgICAgICBvcHRpb25zID0gbmFtZTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKF8uaXNGdW5jdGlvbihuYW1lKSkge1xuICAgICAgICAvLyAyIGFyZ3VtZW50cyAoZm4sIG9wdGlvbnMpLlxuICAgICAgICBvcHRpb25zID0gZm47XG4gICAgICAgIGZuID0gbmFtZTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKF8uaXNQbGFpbk9iamVjdChmbikpIHtcbiAgICAgICAgLy8gMiBhcmd1bWVudHMgKG5hbWUsIG9wdGlvbnMpLlxuICAgICAgICBvcHRpb25zID0gZm47XG4gICAgICAgIGZuID0gbnVsbDtcbiAgICAgICAgYmVuY2gubmFtZSA9IG5hbWU7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gMyBhcmd1bWVudHMgKG5hbWUsIGZuIFssIG9wdGlvbnNdKS5cbiAgICAgICAgYmVuY2gubmFtZSA9IG5hbWU7XG4gICAgICB9XG4gICAgICBzZXRPcHRpb25zKGJlbmNoLCBvcHRpb25zKTtcblxuICAgICAgYmVuY2guaWQgfHwgKGJlbmNoLmlkID0gKytjb3VudGVyKTtcbiAgICAgIGJlbmNoLmZuID09IG51bGwgJiYgKGJlbmNoLmZuID0gZm4pO1xuXG4gICAgICBiZW5jaC5zdGF0cyA9IGNsb25lRGVlcChiZW5jaC5zdGF0cyk7XG4gICAgICBiZW5jaC50aW1lcyA9IGNsb25lRGVlcChiZW5jaC50aW1lcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIERlZmVycmVkIGNvbnN0cnVjdG9yLlxuICAgICAqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjbG9uZSBUaGUgY2xvbmVkIGJlbmNobWFyayBpbnN0YW5jZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBEZWZlcnJlZChjbG9uZSkge1xuICAgICAgdmFyIGRlZmVycmVkID0gdGhpcztcbiAgICAgIGlmICghKGRlZmVycmVkIGluc3RhbmNlb2YgRGVmZXJyZWQpKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGVmZXJyZWQoY2xvbmUpO1xuICAgICAgfVxuICAgICAgZGVmZXJyZWQuYmVuY2htYXJrID0gY2xvbmU7XG4gICAgICBjbG9jayhkZWZlcnJlZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIEV2ZW50IGNvbnN0cnVjdG9yLlxuICAgICAqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fHN0cmluZ30gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBFdmVudCh0eXBlKSB7XG4gICAgICB2YXIgZXZlbnQgPSB0aGlzO1xuICAgICAgaWYgKHR5cGUgaW5zdGFuY2VvZiBFdmVudCkge1xuICAgICAgICByZXR1cm4gdHlwZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAoZXZlbnQgaW5zdGFuY2VvZiBFdmVudClcbiAgICAgICAgPyBfLmFzc2lnbihldmVudCwgeyAndGltZVN0YW1wJzogXy5ub3coKSB9LCB0eXBlb2YgdHlwZSA9PSAnc3RyaW5nJyA/IHsgJ3R5cGUnOiB0eXBlIH0gOiB0eXBlKVxuICAgICAgICA6IG5ldyBFdmVudCh0eXBlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgU3VpdGUgY29uc3RydWN0b3IuXG4gICAgICpcbiAgICAgKiBOb3RlOiBFYWNoIFN1aXRlIGluc3RhbmNlIGhhcyBhIGhhbmRmdWwgb2Ygd3JhcHBlZCBsb2Rhc2ggbWV0aG9kcyB0b1xuICAgICAqIG1ha2Ugd29ya2luZyB3aXRoIFN1aXRlcyBlYXNpZXIuIFRoZSB3cmFwcGVkIGxvZGFzaCBtZXRob2RzIGFyZTpcbiAgICAgKiBbYGVhY2gvZm9yRWFjaGBdKGh0dHBzOi8vbG9kYXNoLmNvbS9kb2NzI2ZvckVhY2gpLCBbYGluZGV4T2ZgXShodHRwczovL2xvZGFzaC5jb20vZG9jcyNpbmRleE9mKSxcbiAgICAgKiBbYG1hcGBdKGh0dHBzOi8vbG9kYXNoLmNvbS9kb2NzI21hcCksIGFuZCBbYHJlZHVjZWBdKGh0dHBzOi8vbG9kYXNoLmNvbS9kb2NzI3JlZHVjZSlcbiAgICAgKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBBIG5hbWUgdG8gaWRlbnRpZnkgdGhlIHN1aXRlLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gT3B0aW9ucyBvYmplY3QuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIC8vIGJhc2ljIHVzYWdlICh0aGUgYG5ld2Agb3BlcmF0b3IgaXMgb3B0aW9uYWwpXG4gICAgICogdmFyIHN1aXRlID0gbmV3IEJlbmNobWFyay5TdWl0ZTtcbiAgICAgKlxuICAgICAqIC8vIG9yIHVzaW5nIGEgbmFtZSBmaXJzdFxuICAgICAqIHZhciBzdWl0ZSA9IG5ldyBCZW5jaG1hcmsuU3VpdGUoJ2ZvbycpO1xuICAgICAqXG4gICAgICogLy8gb3Igd2l0aCBvcHRpb25zXG4gICAgICogdmFyIHN1aXRlID0gbmV3IEJlbmNobWFyay5TdWl0ZSgnZm9vJywge1xuICAgICAqXG4gICAgICogICAvLyBjYWxsZWQgd2hlbiB0aGUgc3VpdGUgc3RhcnRzIHJ1bm5pbmdcbiAgICAgKiAgICdvblN0YXJ0Jzogb25TdGFydCxcbiAgICAgKlxuICAgICAqICAgLy8gY2FsbGVkIGJldHdlZW4gcnVubmluZyBiZW5jaG1hcmtzXG4gICAgICogICAnb25DeWNsZSc6IG9uQ3ljbGUsXG4gICAgICpcbiAgICAgKiAgIC8vIGNhbGxlZCB3aGVuIGFib3J0ZWRcbiAgICAgKiAgICdvbkFib3J0Jzogb25BYm9ydCxcbiAgICAgKlxuICAgICAqICAgLy8gY2FsbGVkIHdoZW4gYSB0ZXN0IGVycm9yc1xuICAgICAqICAgJ29uRXJyb3InOiBvbkVycm9yLFxuICAgICAqXG4gICAgICogICAvLyBjYWxsZWQgd2hlbiByZXNldFxuICAgICAqICAgJ29uUmVzZXQnOiBvblJlc2V0LFxuICAgICAqXG4gICAgICogICAvLyBjYWxsZWQgd2hlbiB0aGUgc3VpdGUgY29tcGxldGVzIHJ1bm5pbmdcbiAgICAgKiAgICdvbkNvbXBsZXRlJzogb25Db21wbGV0ZVxuICAgICAqIH0pO1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIFN1aXRlKG5hbWUsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBzdWl0ZSA9IHRoaXM7XG5cbiAgICAgIC8vIEFsbG93IGluc3RhbmNlIGNyZWF0aW9uIHdpdGhvdXQgdGhlIGBuZXdgIG9wZXJhdG9yLlxuICAgICAgaWYgKCEoc3VpdGUgaW5zdGFuY2VvZiBTdWl0ZSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTdWl0ZShuYW1lLCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICAgIC8vIEp1Z2dsZSBhcmd1bWVudHMuXG4gICAgICBpZiAoXy5pc1BsYWluT2JqZWN0KG5hbWUpKSB7XG4gICAgICAgIC8vIDEgYXJndW1lbnQgKG9wdGlvbnMpLlxuICAgICAgICBvcHRpb25zID0gbmFtZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIDIgYXJndW1lbnRzIChuYW1lIFssIG9wdGlvbnNdKS5cbiAgICAgICAgc3VpdGUubmFtZSA9IG5hbWU7XG4gICAgICB9XG4gICAgICBzZXRPcHRpb25zKHN1aXRlLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvKipcbiAgICAgKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8uY2xvbmVEZWVwYCB3aGljaCBvbmx5IGNsb25lcyBhcnJheXMgYW5kIHBsYWluXG4gICAgICogb2JqZWN0cyBhc3NpZ25pbmcgYWxsIG90aGVyIHZhbHVlcyBieSByZWZlcmVuY2UuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNsb25lLlxuICAgICAqIEByZXR1cm5zIHsqfSBUaGUgY2xvbmVkIHZhbHVlLlxuICAgICAqL1xuICAgIHZhciBjbG9uZURlZXAgPSBfLnBhcnRpYWwoXy5jbG9uZURlZXBXaXRoLCBfLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgLy8gT25seSBjbG9uZSBwcmltaXRpdmVzLCBhcnJheXMsIGFuZCBwbGFpbiBvYmplY3RzLlxuICAgICAgaWYgKCFfLmlzQXJyYXkodmFsdWUpICYmICFfLmlzUGxhaW5PYmplY3QodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBmdW5jdGlvbiBmcm9tIHRoZSBnaXZlbiBhcmd1bWVudHMgc3RyaW5nIGFuZCBib2R5LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYXJncyBUaGUgY29tbWEgc2VwYXJhdGVkIGZ1bmN0aW9uIGFyZ3VtZW50cy5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYm9keSBUaGUgZnVuY3Rpb24gYm9keS5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFRoZSBuZXcgZnVuY3Rpb24uXG4gICAgICovXG4gICAgZnVuY3Rpb24gY3JlYXRlRnVuY3Rpb24oKSB7XG4gICAgICAvLyBMYXp5IGRlZmluZS5cbiAgICAgIGNyZWF0ZUZ1bmN0aW9uID0gZnVuY3Rpb24oYXJncywgYm9keSkge1xuICAgICAgICB2YXIgcmVzdWx0LFxuICAgICAgICAgICAgYW5jaG9yID0gZnJlZURlZmluZSA/IGZyZWVEZWZpbmUuYW1kIDogQmVuY2htYXJrLFxuICAgICAgICAgICAgcHJvcCA9IHVpZCArICdjcmVhdGVGdW5jdGlvbic7XG5cbiAgICAgICAgcnVuU2NyaXB0KChmcmVlRGVmaW5lID8gJ2RlZmluZS5hbWQuJyA6ICdCZW5jaG1hcmsuJykgKyBwcm9wICsgJz1mdW5jdGlvbignICsgYXJncyArICcpeycgKyBib2R5ICsgJ30nKTtcbiAgICAgICAgcmVzdWx0ID0gYW5jaG9yW3Byb3BdO1xuICAgICAgICBkZWxldGUgYW5jaG9yW3Byb3BdO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfTtcbiAgICAgIC8vIEZpeCBKYWVnZXJNb25rZXkgYnVnLlxuICAgICAgLy8gRm9yIG1vcmUgaW5mb3JtYXRpb24gc2VlIGh0dHA6Ly9idWd6aWwubGEvNjM5NzIwLlxuICAgICAgY3JlYXRlRnVuY3Rpb24gPSBzdXBwb3J0LmJyb3dzZXIgJiYgKGNyZWF0ZUZ1bmN0aW9uKCcnLCAncmV0dXJuXCInICsgdWlkICsgJ1wiJykgfHwgXy5ub29wKSgpID09IHVpZCA/IGNyZWF0ZUZ1bmN0aW9uIDogRnVuY3Rpb247XG4gICAgICByZXR1cm4gY3JlYXRlRnVuY3Rpb24uYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZWxheSB0aGUgZXhlY3V0aW9uIG9mIGEgZnVuY3Rpb24gYmFzZWQgb24gdGhlIGJlbmNobWFyaydzIGBkZWxheWAgcHJvcGVydHkuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBiZW5jaCBUaGUgYmVuY2htYXJrIGluc3RhbmNlLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBmbiBUaGUgZnVuY3Rpb24gdG8gZXhlY3V0ZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBkZWxheShiZW5jaCwgZm4pIHtcbiAgICAgIGJlbmNoLl90aW1lcklkID0gXy5kZWxheShmbiwgYmVuY2guZGVsYXkgKiAxZTMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlc3Ryb3lzIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdG8gZGVzdHJveS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBkZXN0cm95RWxlbWVudChlbGVtZW50KSB7XG4gICAgICB0cmFzaC5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICAgIHRyYXNoLmlubmVySFRNTCA9ICcnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIG5hbWUgb2YgdGhlIGZpcnN0IGFyZ3VtZW50IGZyb20gYSBmdW5jdGlvbidzIHNvdXJjZS5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBhcmd1bWVudCBuYW1lLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldEZpcnN0QXJndW1lbnQoZm4pIHtcbiAgICAgIHJldHVybiAoIV8uaGFzKGZuLCAndG9TdHJpbmcnKSAmJlxuICAgICAgICAoL15bXFxzKF0qZnVuY3Rpb25bXihdKlxcKChbXlxccywpXSspLy5leGVjKGZuKSB8fCAwKVsxXSkgfHwgJyc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29tcHV0ZXMgdGhlIGFyaXRobWV0aWMgbWVhbiBvZiBhIHNhbXBsZS5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtBcnJheX0gc2FtcGxlIFRoZSBzYW1wbGUuXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIG1lYW4uXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0TWVhbihzYW1wbGUpIHtcbiAgICAgIHJldHVybiAoXy5yZWR1Y2Uoc2FtcGxlLCBmdW5jdGlvbihzdW0sIHgpIHtcbiAgICAgICAgcmV0dXJuIHN1bSArIHg7XG4gICAgICB9KSAvIHNhbXBsZS5sZW5ndGgpIHx8IDA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgc291cmNlIGNvZGUgb2YgYSBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBmdW5jdGlvbidzIHNvdXJjZSBjb2RlLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldFNvdXJjZShmbikge1xuICAgICAgdmFyIHJlc3VsdCA9ICcnO1xuICAgICAgaWYgKGlzU3RyaW5nYWJsZShmbikpIHtcbiAgICAgICAgcmVzdWx0ID0gU3RyaW5nKGZuKTtcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5kZWNvbXBpbGF0aW9uKSB7XG4gICAgICAgIC8vIEVzY2FwZSB0aGUgYHtgIGZvciBGaXJlZm94IDEuXG4gICAgICAgIHJlc3VsdCA9IF8ucmVzdWx0KC9eW157XStcXHsoW1xcc1xcU10qKVxcfVxccyokLy5leGVjKGZuKSwgMSk7XG4gICAgICB9XG4gICAgICAvLyBUcmltIHN0cmluZy5cbiAgICAgIHJlc3VsdCA9IChyZXN1bHQgfHwgJycpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcblxuICAgICAgLy8gRGV0ZWN0IHN0cmluZ3MgY29udGFpbmluZyBvbmx5IHRoZSBcInVzZSBzdHJpY3RcIiBkaXJlY3RpdmUuXG4gICAgICByZXR1cm4gL14oPzpcXC9cXCorW1xcd1xcV10qP1xcKlxcL3xcXC9cXC8uKj9bXFxuXFxyXFx1MjAyOFxcdTIwMjldfFxccykqKFtcIiddKXVzZSBzdHJpY3RcXDE7PyQvLnRlc3QocmVzdWx0KVxuICAgICAgICA/ICcnXG4gICAgICAgIDogcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBhbiBvYmplY3QgaXMgb2YgdGhlIHNwZWNpZmllZCBjbGFzcy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIGNsYXNzLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgdmFsdWUgaXMgb2YgdGhlIHNwZWNpZmllZCBjbGFzcywgZWxzZSBgZmFsc2VgLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlzQ2xhc3NPZih2YWx1ZSwgbmFtZSkge1xuICAgICAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gJ1tvYmplY3QgJyArIG5hbWUgKyAnXSc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSG9zdCBvYmplY3RzIGNhbiByZXR1cm4gdHlwZSB2YWx1ZXMgdGhhdCBhcmUgZGlmZmVyZW50IGZyb20gdGhlaXIgYWN0dWFsXG4gICAgICogZGF0YSB0eXBlLiBUaGUgb2JqZWN0cyB3ZSBhcmUgY29uY2VybmVkIHdpdGggdXN1YWxseSByZXR1cm4gbm9uLXByaW1pdGl2ZVxuICAgICAqIHR5cGVzIG9mIFwib2JqZWN0XCIsIFwiZnVuY3Rpb25cIiwgb3IgXCJ1bmtub3duXCIuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7Kn0gb2JqZWN0IFRoZSBvd25lciBvZiB0aGUgcHJvcGVydHkuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5IFRoZSBwcm9wZXJ0eSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHByb3BlcnR5IHZhbHVlIGlzIGEgbm9uLXByaW1pdGl2ZSwgZWxzZSBgZmFsc2VgLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlzSG9zdFR5cGUob2JqZWN0LCBwcm9wZXJ0eSkge1xuICAgICAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHZhciB0eXBlID0gdHlwZW9mIG9iamVjdFtwcm9wZXJ0eV07XG4gICAgICByZXR1cm4gIXJlUHJpbWl0aXZlLnRlc3QodHlwZSkgJiYgKHR5cGUgIT0gJ29iamVjdCcgfHwgISFvYmplY3RbcHJvcGVydHldKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYSB2YWx1ZSBjYW4gYmUgc2FmZWx5IGNvZXJjZWQgdG8gYSBzdHJpbmcuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgdmFsdWUgY2FuIGJlIGNvZXJjZWQsIGVsc2UgYGZhbHNlYC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc1N0cmluZ2FibGUodmFsdWUpIHtcbiAgICAgIHJldHVybiBfLmlzU3RyaW5nKHZhbHVlKSB8fCAoXy5oYXModmFsdWUsICd0b1N0cmluZycpICYmIF8uaXNGdW5jdGlvbih2YWx1ZS50b1N0cmluZykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEEgd3JhcHBlciBhcm91bmQgYHJlcXVpcmVgIHRvIHN1cHByZXNzIGBtb2R1bGUgbWlzc2luZ2AgZXJyb3JzLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgVGhlIG1vZHVsZSBpZC5cbiAgICAgKiBAcmV0dXJucyB7Kn0gVGhlIGV4cG9ydGVkIG1vZHVsZSBvciBgbnVsbGAuXG4gICAgICovXG4gICAgZnVuY3Rpb24gcmVxdWlyZShpZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGZyZWVFeHBvcnRzICYmIGZyZWVSZXF1aXJlKGlkKTtcbiAgICAgIH0gY2F0Y2goZSkge31cbiAgICAgIHJldHVybiByZXN1bHQgfHwgbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW5zIGEgc25pcHBldCBvZiBKYXZhU2NyaXB0IHZpYSBzY3JpcHQgaW5qZWN0aW9uLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29kZSBUaGUgY29kZSB0byBydW4uXG4gICAgICovXG4gICAgZnVuY3Rpb24gcnVuU2NyaXB0KGNvZGUpIHtcbiAgICAgIHZhciBhbmNob3IgPSBmcmVlRGVmaW5lID8gZGVmaW5lLmFtZCA6IEJlbmNobWFyayxcbiAgICAgICAgICBzY3JpcHQgPSBkb2MuY3JlYXRlRWxlbWVudCgnc2NyaXB0JyksXG4gICAgICAgICAgc2libGluZyA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF0sXG4gICAgICAgICAgcGFyZW50ID0gc2libGluZy5wYXJlbnROb2RlLFxuICAgICAgICAgIHByb3AgPSB1aWQgKyAncnVuU2NyaXB0JyxcbiAgICAgICAgICBwcmVmaXggPSAnKCcgKyAoZnJlZURlZmluZSA/ICdkZWZpbmUuYW1kLicgOiAnQmVuY2htYXJrLicpICsgcHJvcCArICd8fGZ1bmN0aW9uKCl7fSkoKTsnO1xuXG4gICAgICAvLyBGaXJlZm94IDIuMC4wLjIgY2Fubm90IHVzZSBzY3JpcHQgaW5qZWN0aW9uIGFzIGludGVuZGVkIGJlY2F1c2UgaXQgZXhlY3V0ZXNcbiAgICAgIC8vIGFzeW5jaHJvbm91c2x5LCBidXQgdGhhdCdzIE9LIGJlY2F1c2Ugc2NyaXB0IGluamVjdGlvbiBpcyBvbmx5IHVzZWQgdG8gYXZvaWRcbiAgICAgIC8vIHRoZSBwcmV2aW91c2x5IGNvbW1lbnRlZCBKYWVnZXJNb25rZXkgYnVnLlxuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBpbnNlcnRlZCBzY3JpcHQgKmJlZm9yZSogcnVubmluZyB0aGUgY29kZSB0byBhdm9pZCBkaWZmZXJlbmNlc1xuICAgICAgICAvLyBpbiB0aGUgZXhwZWN0ZWQgc2NyaXB0IGVsZW1lbnQgY291bnQvb3JkZXIgb2YgdGhlIGRvY3VtZW50LlxuICAgICAgICBzY3JpcHQuYXBwZW5kQ2hpbGQoZG9jLmNyZWF0ZVRleHROb2RlKHByZWZpeCArIGNvZGUpKTtcbiAgICAgICAgYW5jaG9yW3Byb3BdID0gZnVuY3Rpb24oKSB7IGRlc3Ryb3lFbGVtZW50KHNjcmlwdCk7IH07XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcGFyZW50ID0gcGFyZW50LmNsb25lTm9kZShmYWxzZSk7XG4gICAgICAgIHNpYmxpbmcgPSBudWxsO1xuICAgICAgICBzY3JpcHQudGV4dCA9IGNvZGU7XG4gICAgICB9XG4gICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKHNjcmlwdCwgc2libGluZyk7XG4gICAgICBkZWxldGUgYW5jaG9yW3Byb3BdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEEgaGVscGVyIGZ1bmN0aW9uIGZvciBzZXR0aW5nIG9wdGlvbnMvZXZlbnQgaGFuZGxlcnMuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIGJlbmNobWFyayBvciBzdWl0ZSBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIE9wdGlvbnMgb2JqZWN0LlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNldE9wdGlvbnMob2JqZWN0LCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb2JqZWN0Lm9wdGlvbnMgPSBfLmFzc2lnbih7fSwgY2xvbmVEZWVwKG9iamVjdC5jb25zdHJ1Y3Rvci5vcHRpb25zKSwgY2xvbmVEZWVwKG9wdGlvbnMpKTtcblxuICAgICAgXy5mb3JPd24ob3B0aW9ucywgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMuXG4gICAgICAgICAgaWYgKC9eb25bQS1aXS8udGVzdChrZXkpKSB7XG4gICAgICAgICAgICBfLmVhY2goa2V5LnNwbGl0KCcgJyksIGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgICBvYmplY3Qub24oa2V5LnNsaWNlKDIpLnRvTG93ZXJDYXNlKCksIHZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoIV8uaGFzKG9iamVjdCwga2V5KSkge1xuICAgICAgICAgICAgb2JqZWN0W2tleV0gPSBjbG9uZURlZXAodmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgLyoqXG4gICAgICogSGFuZGxlcyBjeWNsaW5nL2NvbXBsZXRpbmcgdGhlIGRlZmVycmVkIGJlbmNobWFyay5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuRGVmZXJyZWRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZXNvbHZlKCkge1xuICAgICAgdmFyIGRlZmVycmVkID0gdGhpcyxcbiAgICAgICAgICBjbG9uZSA9IGRlZmVycmVkLmJlbmNobWFyayxcbiAgICAgICAgICBiZW5jaCA9IGNsb25lLl9vcmlnaW5hbDtcblxuICAgICAgaWYgKGJlbmNoLmFib3J0ZWQpIHtcbiAgICAgICAgLy8gY3ljbGUoKSAtPiBjbG9uZSBjeWNsZS9jb21wbGV0ZSBldmVudCAtPiBjb21wdXRlKCkncyBpbnZva2VkIGJlbmNoLnJ1bigpIGN5Y2xlL2NvbXBsZXRlLlxuICAgICAgICBkZWZlcnJlZC50ZWFyZG93bigpO1xuICAgICAgICBjbG9uZS5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIGN5Y2xlKGRlZmVycmVkKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCsrZGVmZXJyZWQuY3ljbGVzIDwgY2xvbmUuY291bnQpIHtcbiAgICAgICAgY2xvbmUuY29tcGlsZWQuY2FsbChkZWZlcnJlZCwgY29udGV4dCwgdGltZXIpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRpbWVyLnN0b3AoZGVmZXJyZWQpO1xuICAgICAgICBkZWZlcnJlZC50ZWFyZG93bigpO1xuICAgICAgICBkZWxheShjbG9uZSwgZnVuY3Rpb24oKSB7IGN5Y2xlKGRlZmVycmVkKTsgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgLyoqXG4gICAgICogQSBnZW5lcmljIGBBcnJheSNmaWx0ZXJgIGxpa2UgbWV0aG9kLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258c3RyaW5nfSBjYWxsYmFjayBUaGUgZnVuY3Rpb24vYWxpYXMgY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHJldHVybnMge0FycmF5fSBBIG5ldyBhcnJheSBvZiB2YWx1ZXMgdGhhdCBwYXNzZWQgY2FsbGJhY2sgZmlsdGVyLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAvLyBnZXQgb2RkIG51bWJlcnNcbiAgICAgKiBCZW5jaG1hcmsuZmlsdGVyKFsxLCAyLCAzLCA0LCA1XSwgZnVuY3Rpb24obikge1xuICAgICAqICAgcmV0dXJuIG4gJSAyO1xuICAgICAqIH0pOyAvLyAtPiBbMSwgMywgNV07XG4gICAgICpcbiAgICAgKiAvLyBnZXQgZmFzdGVzdCBiZW5jaG1hcmtzXG4gICAgICogQmVuY2htYXJrLmZpbHRlcihiZW5jaGVzLCAnZmFzdGVzdCcpO1xuICAgICAqXG4gICAgICogLy8gZ2V0IHNsb3dlc3QgYmVuY2htYXJrc1xuICAgICAqIEJlbmNobWFyay5maWx0ZXIoYmVuY2hlcywgJ3Nsb3dlc3QnKTtcbiAgICAgKlxuICAgICAqIC8vIGdldCBiZW5jaG1hcmtzIHRoYXQgY29tcGxldGVkIHdpdGhvdXQgZXJyb3JpbmdcbiAgICAgKiBCZW5jaG1hcmsuZmlsdGVyKGJlbmNoZXMsICdzdWNjZXNzZnVsJyk7XG4gICAgICovXG4gICAgZnVuY3Rpb24gZmlsdGVyKGFycmF5LCBjYWxsYmFjaykge1xuICAgICAgaWYgKGNhbGxiYWNrID09PSAnc3VjY2Vzc2Z1bCcpIHtcbiAgICAgICAgLy8gQ2FsbGJhY2sgdG8gZXhjbHVkZSB0aG9zZSB0aGF0IGFyZSBlcnJvcmVkLCB1bnJ1biwgb3IgaGF2ZSBoeiBvZiBJbmZpbml0eS5cbiAgICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbihiZW5jaCkge1xuICAgICAgICAgIHJldHVybiBiZW5jaC5jeWNsZXMgJiYgXy5pc0Zpbml0ZShiZW5jaC5oeikgJiYgIWJlbmNoLmVycm9yO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoY2FsbGJhY2sgPT09ICdmYXN0ZXN0JyB8fCBjYWxsYmFjayA9PT0gJ3Nsb3dlc3QnKSB7XG4gICAgICAgIC8vIEdldCBzdWNjZXNzZnVsLCBzb3J0IGJ5IHBlcmlvZCArIG1hcmdpbiBvZiBlcnJvciwgYW5kIGZpbHRlciBmYXN0ZXN0L3Nsb3dlc3QuXG4gICAgICAgIHZhciByZXN1bHQgPSBmaWx0ZXIoYXJyYXksICdzdWNjZXNzZnVsJykuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgYSA9IGEuc3RhdHM7IGIgPSBiLnN0YXRzO1xuICAgICAgICAgIHJldHVybiAoYS5tZWFuICsgYS5tb2UgPiBiLm1lYW4gKyBiLm1vZSA/IDEgOiAtMSkgKiAoY2FsbGJhY2sgPT09ICdmYXN0ZXN0JyA/IDEgOiAtMSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBfLmZpbHRlcihyZXN1bHQsIGZ1bmN0aW9uKGJlbmNoKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdFswXS5jb21wYXJlKGJlbmNoKSA9PSAwO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfLmZpbHRlcihhcnJheSwgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGEgbnVtYmVyIHRvIGEgbW9yZSByZWFkYWJsZSBjb21tYS1zZXBhcmF0ZWQgc3RyaW5nIHJlcHJlc2VudGF0aW9uLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbnVtYmVyIFRoZSBudW1iZXIgdG8gY29udmVydC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgbW9yZSByZWFkYWJsZSBzdHJpbmcgcmVwcmVzZW50YXRpb24uXG4gICAgICovXG4gICAgZnVuY3Rpb24gZm9ybWF0TnVtYmVyKG51bWJlcikge1xuICAgICAgbnVtYmVyID0gU3RyaW5nKG51bWJlcikuc3BsaXQoJy4nKTtcbiAgICAgIHJldHVybiBudW1iZXJbMF0ucmVwbGFjZSgvKD89KD86XFxkezN9KSskKSg/IVxcYikvZywgJywnKSArXG4gICAgICAgIChudW1iZXJbMV0gPyAnLicgKyBudW1iZXJbMV0gOiAnJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW52b2tlcyBhIG1ldGhvZCBvbiBhbGwgaXRlbXMgaW4gYW4gYXJyYXkuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IGJlbmNoZXMgQXJyYXkgb2YgYmVuY2htYXJrcyB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtPYmplY3R8c3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBtZXRob2QgdG8gaW52b2tlIE9SIG9wdGlvbnMgb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7Li4uKn0gW2FyZ3NdIEFyZ3VtZW50cyB0byBpbnZva2UgdGhlIG1ldGhvZCB3aXRoLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgYXJyYXkgb2YgdmFsdWVzIHJldHVybmVkIGZyb20gZWFjaCBtZXRob2QgaW52b2tlZC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogLy8gaW52b2tlIGByZXNldGAgb24gYWxsIGJlbmNobWFya3NcbiAgICAgKiBCZW5jaG1hcmsuaW52b2tlKGJlbmNoZXMsICdyZXNldCcpO1xuICAgICAqXG4gICAgICogLy8gaW52b2tlIGBlbWl0YCB3aXRoIGFyZ3VtZW50c1xuICAgICAqIEJlbmNobWFyay5pbnZva2UoYmVuY2hlcywgJ2VtaXQnLCAnY29tcGxldGUnLCBsaXN0ZW5lcik7XG4gICAgICpcbiAgICAgKiAvLyBpbnZva2UgYHJ1bih0cnVlKWAsIHRyZWF0IGJlbmNobWFya3MgYXMgYSBxdWV1ZSwgYW5kIHJlZ2lzdGVyIGludm9rZSBjYWxsYmFja3NcbiAgICAgKiBCZW5jaG1hcmsuaW52b2tlKGJlbmNoZXMsIHtcbiAgICAgKlxuICAgICAqICAgLy8gaW52b2tlIHRoZSBgcnVuYCBtZXRob2RcbiAgICAgKiAgICduYW1lJzogJ3J1bicsXG4gICAgICpcbiAgICAgKiAgIC8vIHBhc3MgYSBzaW5nbGUgYXJndW1lbnRcbiAgICAgKiAgICdhcmdzJzogdHJ1ZSxcbiAgICAgKlxuICAgICAqICAgLy8gdHJlYXQgYXMgcXVldWUsIHJlbW92aW5nIGJlbmNobWFya3MgZnJvbSBmcm9udCBvZiBgYmVuY2hlc2AgdW50aWwgZW1wdHlcbiAgICAgKiAgICdxdWV1ZWQnOiB0cnVlLFxuICAgICAqXG4gICAgICogICAvLyBjYWxsZWQgYmVmb3JlIGFueSBiZW5jaG1hcmtzIGhhdmUgYmVlbiBpbnZva2VkLlxuICAgICAqICAgJ29uU3RhcnQnOiBvblN0YXJ0LFxuICAgICAqXG4gICAgICogICAvLyBjYWxsZWQgYmV0d2VlbiBpbnZva2luZyBiZW5jaG1hcmtzXG4gICAgICogICAnb25DeWNsZSc6IG9uQ3ljbGUsXG4gICAgICpcbiAgICAgKiAgIC8vIGNhbGxlZCBhZnRlciBhbGwgYmVuY2htYXJrcyBoYXZlIGJlZW4gaW52b2tlZC5cbiAgICAgKiAgICdvbkNvbXBsZXRlJzogb25Db21wbGV0ZVxuICAgICAqIH0pO1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGludm9rZShiZW5jaGVzLCBuYW1lKSB7XG4gICAgICB2YXIgYXJncyxcbiAgICAgICAgICBiZW5jaCxcbiAgICAgICAgICBxdWV1ZWQsXG4gICAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgICBldmVudFByb3BzID0geyAnY3VycmVudFRhcmdldCc6IGJlbmNoZXMgfSxcbiAgICAgICAgICBvcHRpb25zID0geyAnb25TdGFydCc6IF8ubm9vcCwgJ29uQ3ljbGUnOiBfLm5vb3AsICdvbkNvbXBsZXRlJzogXy5ub29wIH0sXG4gICAgICAgICAgcmVzdWx0ID0gXy50b0FycmF5KGJlbmNoZXMpO1xuXG4gICAgICAvKipcbiAgICAgICAqIEludm9rZXMgdGhlIG1ldGhvZCBvZiB0aGUgY3VycmVudCBvYmplY3QgYW5kIGlmIHN5bmNocm9ub3VzLCBmZXRjaGVzIHRoZSBuZXh0LlxuICAgICAgICovXG4gICAgICBmdW5jdGlvbiBleGVjdXRlKCkge1xuICAgICAgICB2YXIgbGlzdGVuZXJzLFxuICAgICAgICAgICAgYXN5bmMgPSBpc0FzeW5jKGJlbmNoKTtcblxuICAgICAgICBpZiAoYXN5bmMpIHtcbiAgICAgICAgICAvLyBVc2UgYGdldE5leHRgIGFzIHRoZSBmaXJzdCBsaXN0ZW5lci5cbiAgICAgICAgICBiZW5jaC5vbignY29tcGxldGUnLCBnZXROZXh0KTtcbiAgICAgICAgICBsaXN0ZW5lcnMgPSBiZW5jaC5ldmVudHMuY29tcGxldGU7XG4gICAgICAgICAgbGlzdGVuZXJzLnNwbGljZSgwLCAwLCBsaXN0ZW5lcnMucG9wKCkpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEV4ZWN1dGUgbWV0aG9kLlxuICAgICAgICByZXN1bHRbaW5kZXhdID0gXy5pc0Z1bmN0aW9uKGJlbmNoICYmIGJlbmNoW25hbWVdKSA/IGJlbmNoW25hbWVdLmFwcGx5KGJlbmNoLCBhcmdzKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgLy8gSWYgc3luY2hyb25vdXMgcmV0dXJuIGB0cnVlYCB1bnRpbCBmaW5pc2hlZC5cbiAgICAgICAgcmV0dXJuICFhc3luYyAmJiBnZXROZXh0KCk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogRmV0Y2hlcyB0aGUgbmV4dCBiZW5jaCBvciBleGVjdXRlcyBgb25Db21wbGV0ZWAgY2FsbGJhY2suXG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIGdldE5leHQoZXZlbnQpIHtcbiAgICAgICAgdmFyIGN5Y2xlRXZlbnQsXG4gICAgICAgICAgICBsYXN0ID0gYmVuY2gsXG4gICAgICAgICAgICBhc3luYyA9IGlzQXN5bmMobGFzdCk7XG5cbiAgICAgICAgaWYgKGFzeW5jKSB7XG4gICAgICAgICAgbGFzdC5vZmYoJ2NvbXBsZXRlJywgZ2V0TmV4dCk7XG4gICAgICAgICAgbGFzdC5lbWl0KCdjb21wbGV0ZScpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEVtaXQgXCJjeWNsZVwiIGV2ZW50LlxuICAgICAgICBldmVudFByb3BzLnR5cGUgPSAnY3ljbGUnO1xuICAgICAgICBldmVudFByb3BzLnRhcmdldCA9IGxhc3Q7XG4gICAgICAgIGN5Y2xlRXZlbnQgPSBFdmVudChldmVudFByb3BzKTtcbiAgICAgICAgb3B0aW9ucy5vbkN5Y2xlLmNhbGwoYmVuY2hlcywgY3ljbGVFdmVudCk7XG5cbiAgICAgICAgLy8gQ2hvb3NlIG5leHQgYmVuY2htYXJrIGlmIG5vdCBleGl0aW5nIGVhcmx5LlxuICAgICAgICBpZiAoIWN5Y2xlRXZlbnQuYWJvcnRlZCAmJiByYWlzZUluZGV4KCkgIT09IGZhbHNlKSB7XG4gICAgICAgICAgYmVuY2ggPSBxdWV1ZWQgPyBiZW5jaGVzWzBdIDogcmVzdWx0W2luZGV4XTtcbiAgICAgICAgICBpZiAoaXNBc3luYyhiZW5jaCkpIHtcbiAgICAgICAgICAgIGRlbGF5KGJlbmNoLCBleGVjdXRlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAoYXN5bmMpIHtcbiAgICAgICAgICAgIC8vIFJlc3VtZSBleGVjdXRpb24gaWYgcHJldmlvdXNseSBhc3luY2hyb25vdXMgYnV0IG5vdyBzeW5jaHJvbm91cy5cbiAgICAgICAgICAgIHdoaWxlIChleGVjdXRlKCkpIHt9XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gQ29udGludWUgc3luY2hyb25vdXMgZXhlY3V0aW9uLlxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEVtaXQgXCJjb21wbGV0ZVwiIGV2ZW50LlxuICAgICAgICAgIGV2ZW50UHJvcHMudHlwZSA9ICdjb21wbGV0ZSc7XG4gICAgICAgICAgb3B0aW9ucy5vbkNvbXBsZXRlLmNhbGwoYmVuY2hlcywgRXZlbnQoZXZlbnRQcm9wcykpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFdoZW4gdXNlZCBhcyBhIGxpc3RlbmVyIGBldmVudC5hYm9ydGVkID0gdHJ1ZWAgd2lsbCBjYW5jZWwgdGhlIHJlc3Qgb2ZcbiAgICAgICAgLy8gdGhlIFwiY29tcGxldGVcIiBsaXN0ZW5lcnMgYmVjYXVzZSB0aGV5IHdlcmUgYWxyZWFkeSBjYWxsZWQgYWJvdmUgYW5kIHdoZW5cbiAgICAgICAgLy8gdXNlZCBhcyBwYXJ0IG9mIGBnZXROZXh0YCB0aGUgYHJldHVybiBmYWxzZWAgd2lsbCBleGl0IHRoZSBleGVjdXRpb24gd2hpbGUtbG9vcC5cbiAgICAgICAgaWYgKGV2ZW50KSB7XG4gICAgICAgICAgZXZlbnQuYWJvcnRlZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ2hlY2tzIGlmIGludm9raW5nIGBCZW5jaG1hcmsjcnVuYCB3aXRoIGFzeW5jaHJvbm91cyBjeWNsZXMuXG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIGlzQXN5bmMob2JqZWN0KSB7XG4gICAgICAgIC8vIEF2b2lkIHVzaW5nIGBpbnN0YW5jZW9mYCBoZXJlIGJlY2F1c2Ugb2YgSUUgbWVtb3J5IGxlYWsgaXNzdWVzIHdpdGggaG9zdCBvYmplY3RzLlxuICAgICAgICB2YXIgYXN5bmMgPSBhcmdzWzBdICYmIGFyZ3NbMF0uYXN5bmM7XG4gICAgICAgIHJldHVybiBuYW1lID09ICdydW4nICYmIChvYmplY3QgaW5zdGFuY2VvZiBCZW5jaG1hcmspICYmXG4gICAgICAgICAgKChhc3luYyA9PSBudWxsID8gb2JqZWN0Lm9wdGlvbnMuYXN5bmMgOiBhc3luYykgJiYgc3VwcG9ydC50aW1lb3V0IHx8IG9iamVjdC5kZWZlcik7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogUmFpc2VzIGBpbmRleGAgdG8gdGhlIG5leHQgZGVmaW5lZCBpbmRleCBvciByZXR1cm5zIGBmYWxzZWAuXG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIHJhaXNlSW5kZXgoKSB7XG4gICAgICAgIGluZGV4Kys7XG5cbiAgICAgICAgLy8gSWYgcXVldWVkIHJlbW92ZSB0aGUgcHJldmlvdXMgYmVuY2guXG4gICAgICAgIGlmIChxdWV1ZWQgJiYgaW5kZXggPiAwKSB7XG4gICAgICAgICAgc2hpZnQuY2FsbChiZW5jaGVzKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIHRoZSBsYXN0IGluZGV4IHRoZW4gcmV0dXJuIGBmYWxzZWAuXG4gICAgICAgIHJldHVybiAocXVldWVkID8gYmVuY2hlcy5sZW5ndGggOiBpbmRleCA8IHJlc3VsdC5sZW5ndGgpXG4gICAgICAgICAgPyBpbmRleFxuICAgICAgICAgIDogKGluZGV4ID0gZmFsc2UpO1xuICAgICAgfVxuICAgICAgLy8gSnVnZ2xlIGFyZ3VtZW50cy5cbiAgICAgIGlmIChfLmlzU3RyaW5nKG5hbWUpKSB7XG4gICAgICAgIC8vIDIgYXJndW1lbnRzIChhcnJheSwgbmFtZSkuXG4gICAgICAgIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyAyIGFyZ3VtZW50cyAoYXJyYXksIG9wdGlvbnMpLlxuICAgICAgICBvcHRpb25zID0gXy5hc3NpZ24ob3B0aW9ucywgbmFtZSk7XG4gICAgICAgIG5hbWUgPSBvcHRpb25zLm5hbWU7XG4gICAgICAgIGFyZ3MgPSBfLmlzQXJyYXkoYXJncyA9ICdhcmdzJyBpbiBvcHRpb25zID8gb3B0aW9ucy5hcmdzIDogW10pID8gYXJncyA6IFthcmdzXTtcbiAgICAgICAgcXVldWVkID0gb3B0aW9ucy5xdWV1ZWQ7XG4gICAgICB9XG4gICAgICAvLyBTdGFydCBpdGVyYXRpbmcgb3ZlciB0aGUgYXJyYXkuXG4gICAgICBpZiAocmFpc2VJbmRleCgpICE9PSBmYWxzZSkge1xuICAgICAgICAvLyBFbWl0IFwic3RhcnRcIiBldmVudC5cbiAgICAgICAgYmVuY2ggPSByZXN1bHRbaW5kZXhdO1xuICAgICAgICBldmVudFByb3BzLnR5cGUgPSAnc3RhcnQnO1xuICAgICAgICBldmVudFByb3BzLnRhcmdldCA9IGJlbmNoO1xuICAgICAgICBvcHRpb25zLm9uU3RhcnQuY2FsbChiZW5jaGVzLCBFdmVudChldmVudFByb3BzKSk7XG5cbiAgICAgICAgLy8gRW5kIGVhcmx5IGlmIHRoZSBzdWl0ZSB3YXMgYWJvcnRlZCBpbiBhbiBcIm9uU3RhcnRcIiBsaXN0ZW5lci5cbiAgICAgICAgaWYgKG5hbWUgPT0gJ3J1bicgJiYgKGJlbmNoZXMgaW5zdGFuY2VvZiBTdWl0ZSkgJiYgYmVuY2hlcy5hYm9ydGVkKSB7XG4gICAgICAgICAgLy8gRW1pdCBcImN5Y2xlXCIgZXZlbnQuXG4gICAgICAgICAgZXZlbnRQcm9wcy50eXBlID0gJ2N5Y2xlJztcbiAgICAgICAgICBvcHRpb25zLm9uQ3ljbGUuY2FsbChiZW5jaGVzLCBFdmVudChldmVudFByb3BzKSk7XG4gICAgICAgICAgLy8gRW1pdCBcImNvbXBsZXRlXCIgZXZlbnQuXG4gICAgICAgICAgZXZlbnRQcm9wcy50eXBlID0gJ2NvbXBsZXRlJztcbiAgICAgICAgICBvcHRpb25zLm9uQ29tcGxldGUuY2FsbChiZW5jaGVzLCBFdmVudChldmVudFByb3BzKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU3RhcnQgbWV0aG9kIGV4ZWN1dGlvbi5cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaWYgKGlzQXN5bmMoYmVuY2gpKSB7XG4gICAgICAgICAgICBkZWxheShiZW5jaCwgZXhlY3V0ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdoaWxlIChleGVjdXRlKCkpIHt9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBzdHJpbmcgb2Ygam9pbmVkIGFycmF5IHZhbHVlcyBvciBvYmplY3Qga2V5LXZhbHVlIHBhaXJzLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gb3BlcmF0ZSBvbi5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NlcGFyYXRvcjE9JywnXSBUaGUgc2VwYXJhdG9yIHVzZWQgYmV0d2VlbiBrZXktdmFsdWUgcGFpcnMuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXBhcmF0b3IyPSc6ICddIFRoZSBzZXBhcmF0b3IgdXNlZCBiZXR3ZWVuIGtleXMgYW5kIHZhbHVlcy5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgam9pbmVkIHJlc3VsdC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBqb2luKG9iamVjdCwgc2VwYXJhdG9yMSwgc2VwYXJhdG9yMikge1xuICAgICAgdmFyIHJlc3VsdCA9IFtdLFxuICAgICAgICAgIGxlbmd0aCA9IChvYmplY3QgPSBPYmplY3Qob2JqZWN0KSkubGVuZ3RoLFxuICAgICAgICAgIGFycmF5TGlrZSA9IGxlbmd0aCA9PT0gbGVuZ3RoID4+PiAwO1xuXG4gICAgICBzZXBhcmF0b3IyIHx8IChzZXBhcmF0b3IyID0gJzogJyk7XG4gICAgICBfLmVhY2gob2JqZWN0LCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGFycmF5TGlrZSA/IHZhbHVlIDoga2V5ICsgc2VwYXJhdG9yMiArIHZhbHVlKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdC5qb2luKHNlcGFyYXRvcjEgfHwgJywnKTtcbiAgICB9XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvKipcbiAgICAgKiBBYm9ydHMgYWxsIGJlbmNobWFya3MgaW4gdGhlIHN1aXRlLlxuICAgICAqXG4gICAgICogQG5hbWUgYWJvcnRcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLlN1aXRlXG4gICAgICogQHJldHVybnMge09iamVjdH0gVGhlIHN1aXRlIGluc3RhbmNlLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGFib3J0U3VpdGUoKSB7XG4gICAgICB2YXIgZXZlbnQsXG4gICAgICAgICAgc3VpdGUgPSB0aGlzLFxuICAgICAgICAgIHJlc2V0dGluZyA9IGNhbGxlZEJ5LnJlc2V0U3VpdGU7XG5cbiAgICAgIGlmIChzdWl0ZS5ydW5uaW5nKSB7XG4gICAgICAgIGV2ZW50ID0gRXZlbnQoJ2Fib3J0Jyk7XG4gICAgICAgIHN1aXRlLmVtaXQoZXZlbnQpO1xuICAgICAgICBpZiAoIWV2ZW50LmNhbmNlbGxlZCB8fCByZXNldHRpbmcpIHtcbiAgICAgICAgICAvLyBBdm9pZCBpbmZpbml0ZSByZWN1cnNpb24uXG4gICAgICAgICAgY2FsbGVkQnkuYWJvcnRTdWl0ZSA9IHRydWU7XG4gICAgICAgICAgc3VpdGUucmVzZXQoKTtcbiAgICAgICAgICBkZWxldGUgY2FsbGVkQnkuYWJvcnRTdWl0ZTtcblxuICAgICAgICAgIGlmICghcmVzZXR0aW5nKSB7XG4gICAgICAgICAgICBzdWl0ZS5hYm9ydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGludm9rZShzdWl0ZSwgJ2Fib3J0Jyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gc3VpdGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIHRlc3QgdG8gdGhlIGJlbmNobWFyayBzdWl0ZS5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBBIG5hbWUgdG8gaWRlbnRpZnkgdGhlIGJlbmNobWFyay5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufHN0cmluZ30gZm4gVGhlIHRlc3QgdG8gYmVuY2htYXJrLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gT3B0aW9ucyBvYmplY3QuXG4gICAgICogQHJldHVybnMge09iamVjdH0gVGhlIHN1aXRlIGluc3RhbmNlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAvLyBiYXNpYyB1c2FnZVxuICAgICAqIHN1aXRlLmFkZChmbik7XG4gICAgICpcbiAgICAgKiAvLyBvciB1c2luZyBhIG5hbWUgZmlyc3RcbiAgICAgKiBzdWl0ZS5hZGQoJ2ZvbycsIGZuKTtcbiAgICAgKlxuICAgICAqIC8vIG9yIHdpdGggb3B0aW9uc1xuICAgICAqIHN1aXRlLmFkZCgnZm9vJywgZm4sIHtcbiAgICAgKiAgICdvbkN5Y2xlJzogb25DeWNsZSxcbiAgICAgKiAgICdvbkNvbXBsZXRlJzogb25Db21wbGV0ZVxuICAgICAqIH0pO1xuICAgICAqXG4gICAgICogLy8gb3IgbmFtZSBhbmQgb3B0aW9uc1xuICAgICAqIHN1aXRlLmFkZCgnZm9vJywge1xuICAgICAqICAgJ2ZuJzogZm4sXG4gICAgICogICAnb25DeWNsZSc6IG9uQ3ljbGUsXG4gICAgICogICAnb25Db21wbGV0ZSc6IG9uQ29tcGxldGVcbiAgICAgKiB9KTtcbiAgICAgKlxuICAgICAqIC8vIG9yIG9wdGlvbnMgb25seVxuICAgICAqIHN1aXRlLmFkZCh7XG4gICAgICogICAnbmFtZSc6ICdmb28nLFxuICAgICAqICAgJ2ZuJzogZm4sXG4gICAgICogICAnb25DeWNsZSc6IG9uQ3ljbGUsXG4gICAgICogICAnb25Db21wbGV0ZSc6IG9uQ29tcGxldGVcbiAgICAgKiB9KTtcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBhZGQobmFtZSwgZm4sIG9wdGlvbnMpIHtcbiAgICAgIHZhciBzdWl0ZSA9IHRoaXMsXG4gICAgICAgICAgYmVuY2ggPSBuZXcgQmVuY2htYXJrKG5hbWUsIGZuLCBvcHRpb25zKSxcbiAgICAgICAgICBldmVudCA9IEV2ZW50KHsgJ3R5cGUnOiAnYWRkJywgJ3RhcmdldCc6IGJlbmNoIH0pO1xuXG4gICAgICBpZiAoc3VpdGUuZW1pdChldmVudCksICFldmVudC5jYW5jZWxsZWQpIHtcbiAgICAgICAgc3VpdGUucHVzaChiZW5jaCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3VpdGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBzdWl0ZSB3aXRoIGNsb25lZCBiZW5jaG1hcmtzLlxuICAgICAqXG4gICAgICogQG5hbWUgY2xvbmVcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLlN1aXRlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgT3B0aW9ucyBvYmplY3QgdG8gb3ZlcndyaXRlIGNsb25lZCBvcHRpb25zLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBuZXcgc3VpdGUgaW5zdGFuY2UuXG4gICAgICovXG4gICAgZnVuY3Rpb24gY2xvbmVTdWl0ZShvcHRpb25zKSB7XG4gICAgICB2YXIgc3VpdGUgPSB0aGlzLFxuICAgICAgICAgIHJlc3VsdCA9IG5ldyBzdWl0ZS5jb25zdHJ1Y3RvcihfLmFzc2lnbih7fSwgc3VpdGUub3B0aW9ucywgb3B0aW9ucykpO1xuXG4gICAgICAvLyBDb3B5IG93biBwcm9wZXJ0aWVzLlxuICAgICAgXy5mb3JPd24oc3VpdGUsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgaWYgKCFfLmhhcyhyZXN1bHQsIGtleSkpIHtcbiAgICAgICAgICByZXN1bHRba2V5XSA9IF8uaXNGdW5jdGlvbihfLmdldCh2YWx1ZSwgJ2Nsb25lJykpXG4gICAgICAgICAgICA/IHZhbHVlLmNsb25lKClcbiAgICAgICAgICAgIDogY2xvbmVEZWVwKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFuIGBBcnJheSNmaWx0ZXJgIGxpa2UgbWV0aG9kLlxuICAgICAqXG4gICAgICogQG5hbWUgZmlsdGVyXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5TdWl0ZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258c3RyaW5nfSBjYWxsYmFjayBUaGUgZnVuY3Rpb24vYWxpYXMgY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHJldHVybnMge09iamVjdH0gQSBuZXcgc3VpdGUgb2YgYmVuY2htYXJrcyB0aGF0IHBhc3NlZCBjYWxsYmFjayBmaWx0ZXIuXG4gICAgICovXG4gICAgZnVuY3Rpb24gZmlsdGVyU3VpdGUoY2FsbGJhY2spIHtcbiAgICAgIHZhciBzdWl0ZSA9IHRoaXMsXG4gICAgICAgICAgcmVzdWx0ID0gbmV3IHN1aXRlLmNvbnN0cnVjdG9yKHN1aXRlLm9wdGlvbnMpO1xuXG4gICAgICByZXN1bHQucHVzaC5hcHBseShyZXN1bHQsIGZpbHRlcihzdWl0ZSwgY2FsbGJhY2spKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzZXRzIGFsbCBiZW5jaG1hcmtzIGluIHRoZSBzdWl0ZS5cbiAgICAgKlxuICAgICAqIEBuYW1lIHJlc2V0XG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5TdWl0ZVxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBzdWl0ZSBpbnN0YW5jZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZXNldFN1aXRlKCkge1xuICAgICAgdmFyIGV2ZW50LFxuICAgICAgICAgIHN1aXRlID0gdGhpcyxcbiAgICAgICAgICBhYm9ydGluZyA9IGNhbGxlZEJ5LmFib3J0U3VpdGU7XG5cbiAgICAgIGlmIChzdWl0ZS5ydW5uaW5nICYmICFhYm9ydGluZykge1xuICAgICAgICAvLyBObyB3b3JyaWVzLCBgcmVzZXRTdWl0ZSgpYCBpcyBjYWxsZWQgd2l0aGluIGBhYm9ydFN1aXRlKClgLlxuICAgICAgICBjYWxsZWRCeS5yZXNldFN1aXRlID0gdHJ1ZTtcbiAgICAgICAgc3VpdGUuYWJvcnQoKTtcbiAgICAgICAgZGVsZXRlIGNhbGxlZEJ5LnJlc2V0U3VpdGU7XG4gICAgICB9XG4gICAgICAvLyBSZXNldCBpZiB0aGUgc3RhdGUgaGFzIGNoYW5nZWQuXG4gICAgICBlbHNlIGlmICgoc3VpdGUuYWJvcnRlZCB8fCBzdWl0ZS5ydW5uaW5nKSAmJlxuICAgICAgICAgIChzdWl0ZS5lbWl0KGV2ZW50ID0gRXZlbnQoJ3Jlc2V0JykpLCAhZXZlbnQuY2FuY2VsbGVkKSkge1xuICAgICAgICBzdWl0ZS5hYm9ydGVkID0gc3VpdGUucnVubmluZyA9IGZhbHNlO1xuICAgICAgICBpZiAoIWFib3J0aW5nKSB7XG4gICAgICAgICAgaW52b2tlKHN1aXRlLCAncmVzZXQnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHN1aXRlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1bnMgdGhlIHN1aXRlLlxuICAgICAqXG4gICAgICogQG5hbWUgcnVuXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5TdWl0ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gT3B0aW9ucyBvYmplY3QuXG4gICAgICogQHJldHVybnMge09iamVjdH0gVGhlIHN1aXRlIGluc3RhbmNlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAvLyBiYXNpYyB1c2FnZVxuICAgICAqIHN1aXRlLnJ1bigpO1xuICAgICAqXG4gICAgICogLy8gb3Igd2l0aCBvcHRpb25zXG4gICAgICogc3VpdGUucnVuKHsgJ2FzeW5jJzogdHJ1ZSwgJ3F1ZXVlZCc6IHRydWUgfSk7XG4gICAgICovXG4gICAgZnVuY3Rpb24gcnVuU3VpdGUob3B0aW9ucykge1xuICAgICAgdmFyIHN1aXRlID0gdGhpcztcblxuICAgICAgc3VpdGUucmVzZXQoKTtcbiAgICAgIHN1aXRlLnJ1bm5pbmcgPSB0cnVlO1xuICAgICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcblxuICAgICAgaW52b2tlKHN1aXRlLCB7XG4gICAgICAgICduYW1lJzogJ3J1bicsXG4gICAgICAgICdhcmdzJzogb3B0aW9ucyxcbiAgICAgICAgJ3F1ZXVlZCc6IG9wdGlvbnMucXVldWVkLFxuICAgICAgICAnb25TdGFydCc6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgc3VpdGUuZW1pdChldmVudCk7XG4gICAgICAgIH0sXG4gICAgICAgICdvbkN5Y2xlJzogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICB2YXIgYmVuY2ggPSBldmVudC50YXJnZXQ7XG4gICAgICAgICAgaWYgKGJlbmNoLmVycm9yKSB7XG4gICAgICAgICAgICBzdWl0ZS5lbWl0KHsgJ3R5cGUnOiAnZXJyb3InLCAndGFyZ2V0JzogYmVuY2ggfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHN1aXRlLmVtaXQoZXZlbnQpO1xuICAgICAgICAgIGV2ZW50LmFib3J0ZWQgPSBzdWl0ZS5hYm9ydGVkO1xuICAgICAgICB9LFxuICAgICAgICAnb25Db21wbGV0ZSc6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgc3VpdGUucnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgIHN1aXRlLmVtaXQoZXZlbnQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBzdWl0ZTtcbiAgICB9XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlcyBhbGwgcmVnaXN0ZXJlZCBsaXN0ZW5lcnMgb2YgdGhlIHNwZWNpZmllZCBldmVudCB0eXBlLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyaywgQmVuY2htYXJrLlN1aXRlXG4gICAgICogQHBhcmFtIHtPYmplY3R8c3RyaW5nfSB0eXBlIFRoZSBldmVudCB0eXBlIG9yIG9iamVjdC5cbiAgICAgKiBAcGFyYW0gey4uLip9IFthcmdzXSBBcmd1bWVudHMgdG8gaW52b2tlIHRoZSBsaXN0ZW5lciB3aXRoLlxuICAgICAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGxhc3QgbGlzdGVuZXIgZXhlY3V0ZWQuXG4gICAgICovXG4gICAgZnVuY3Rpb24gZW1pdCh0eXBlKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzLFxuICAgICAgICAgIG9iamVjdCA9IHRoaXMsXG4gICAgICAgICAgZXZlbnQgPSBFdmVudCh0eXBlKSxcbiAgICAgICAgICBldmVudHMgPSBvYmplY3QuZXZlbnRzLFxuICAgICAgICAgIGFyZ3MgPSAoYXJndW1lbnRzWzBdID0gZXZlbnQsIGFyZ3VtZW50cyk7XG5cbiAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQgfHwgKGV2ZW50LmN1cnJlbnRUYXJnZXQgPSBvYmplY3QpO1xuICAgICAgZXZlbnQudGFyZ2V0IHx8IChldmVudC50YXJnZXQgPSBvYmplY3QpO1xuICAgICAgZGVsZXRlIGV2ZW50LnJlc3VsdDtcblxuICAgICAgaWYgKGV2ZW50cyAmJiAobGlzdGVuZXJzID0gXy5oYXMoZXZlbnRzLCBldmVudC50eXBlKSAmJiBldmVudHNbZXZlbnQudHlwZV0pKSB7XG4gICAgICAgIF8uZWFjaChsaXN0ZW5lcnMuc2xpY2UoKSwgZnVuY3Rpb24obGlzdGVuZXIpIHtcbiAgICAgICAgICBpZiAoKGV2ZW50LnJlc3VsdCA9IGxpc3RlbmVyLmFwcGx5KG9iamVjdCwgYXJncykpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgZXZlbnQuY2FuY2VsbGVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuICFldmVudC5hYm9ydGVkO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBldmVudC5yZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiBhcnJheSBvZiBldmVudCBsaXN0ZW5lcnMgZm9yIGEgZ2l2ZW4gdHlwZSB0aGF0IGNhbiBiZSBtYW5pcHVsYXRlZFxuICAgICAqIHRvIGFkZCBvciByZW1vdmUgbGlzdGVuZXJzLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyaywgQmVuY2htYXJrLlN1aXRlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHJldHVybnMge0FycmF5fSBUaGUgbGlzdGVuZXJzIGFycmF5LlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGxpc3RlbmVycyh0eXBlKSB7XG4gICAgICB2YXIgb2JqZWN0ID0gdGhpcyxcbiAgICAgICAgICBldmVudHMgPSBvYmplY3QuZXZlbnRzIHx8IChvYmplY3QuZXZlbnRzID0ge30pO1xuXG4gICAgICByZXR1cm4gXy5oYXMoZXZlbnRzLCB0eXBlKSA/IGV2ZW50c1t0eXBlXSA6IChldmVudHNbdHlwZV0gPSBbXSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVW5yZWdpc3RlcnMgYSBsaXN0ZW5lciBmb3IgdGhlIHNwZWNpZmllZCBldmVudCB0eXBlKHMpLFxuICAgICAqIG9yIHVucmVnaXN0ZXJzIGFsbCBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgdHlwZShzKSxcbiAgICAgKiBvciB1bnJlZ2lzdGVycyBhbGwgbGlzdGVuZXJzIGZvciBhbGwgZXZlbnQgdHlwZXMuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLCBCZW5jaG1hcmsuU3VpdGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtsaXN0ZW5lcl0gVGhlIGZ1bmN0aW9uIHRvIHVucmVnaXN0ZXIuXG4gICAgICogQHJldHVybnMge09iamVjdH0gVGhlIGN1cnJlbnQgaW5zdGFuY2UuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIC8vIHVucmVnaXN0ZXIgYSBsaXN0ZW5lciBmb3IgYW4gZXZlbnQgdHlwZVxuICAgICAqIGJlbmNoLm9mZignY3ljbGUnLCBsaXN0ZW5lcik7XG4gICAgICpcbiAgICAgKiAvLyB1bnJlZ2lzdGVyIGEgbGlzdGVuZXIgZm9yIG11bHRpcGxlIGV2ZW50IHR5cGVzXG4gICAgICogYmVuY2gub2ZmKCdzdGFydCBjeWNsZScsIGxpc3RlbmVyKTtcbiAgICAgKlxuICAgICAqIC8vIHVucmVnaXN0ZXIgYWxsIGxpc3RlbmVycyBmb3IgYW4gZXZlbnQgdHlwZVxuICAgICAqIGJlbmNoLm9mZignY3ljbGUnKTtcbiAgICAgKlxuICAgICAqIC8vIHVucmVnaXN0ZXIgYWxsIGxpc3RlbmVycyBmb3IgbXVsdGlwbGUgZXZlbnQgdHlwZXNcbiAgICAgKiBiZW5jaC5vZmYoJ3N0YXJ0IGN5Y2xlIGNvbXBsZXRlJyk7XG4gICAgICpcbiAgICAgKiAvLyB1bnJlZ2lzdGVyIGFsbCBsaXN0ZW5lcnMgZm9yIGFsbCBldmVudCB0eXBlc1xuICAgICAqIGJlbmNoLm9mZigpO1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIG9mZih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgdmFyIG9iamVjdCA9IHRoaXMsXG4gICAgICAgICAgZXZlbnRzID0gb2JqZWN0LmV2ZW50cztcblxuICAgICAgaWYgKCFldmVudHMpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICAgIH1cbiAgICAgIF8uZWFjaCh0eXBlID8gdHlwZS5zcGxpdCgnICcpIDogZXZlbnRzLCBmdW5jdGlvbihsaXN0ZW5lcnMsIHR5cGUpIHtcbiAgICAgICAgdmFyIGluZGV4O1xuICAgICAgICBpZiAodHlwZW9mIGxpc3RlbmVycyA9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHR5cGUgPSBsaXN0ZW5lcnM7XG4gICAgICAgICAgbGlzdGVuZXJzID0gXy5oYXMoZXZlbnRzLCB0eXBlKSAmJiBldmVudHNbdHlwZV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpc3RlbmVycykge1xuICAgICAgICAgIGlmIChsaXN0ZW5lcikge1xuICAgICAgICAgICAgaW5kZXggPSBfLmluZGV4T2YobGlzdGVuZXJzLCBsaXN0ZW5lcik7XG4gICAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICBsaXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGlzdGVuZXJzLmxlbmd0aCA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJzIGEgbGlzdGVuZXIgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgdHlwZShzKS5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmssIEJlbmNobWFyay5TdWl0ZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIFRoZSBmdW5jdGlvbiB0byByZWdpc3Rlci5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgY3VycmVudCBpbnN0YW5jZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogLy8gcmVnaXN0ZXIgYSBsaXN0ZW5lciBmb3IgYW4gZXZlbnQgdHlwZVxuICAgICAqIGJlbmNoLm9uKCdjeWNsZScsIGxpc3RlbmVyKTtcbiAgICAgKlxuICAgICAqIC8vIHJlZ2lzdGVyIGEgbGlzdGVuZXIgZm9yIG11bHRpcGxlIGV2ZW50IHR5cGVzXG4gICAgICogYmVuY2gub24oJ3N0YXJ0IGN5Y2xlJywgbGlzdGVuZXIpO1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIG9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgb2JqZWN0ID0gdGhpcyxcbiAgICAgICAgICBldmVudHMgPSBvYmplY3QuZXZlbnRzIHx8IChvYmplY3QuZXZlbnRzID0ge30pO1xuXG4gICAgICBfLmVhY2godHlwZS5zcGxpdCgnICcpLCBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIChfLmhhcyhldmVudHMsIHR5cGUpXG4gICAgICAgICAgPyBldmVudHNbdHlwZV1cbiAgICAgICAgICA6IChldmVudHNbdHlwZV0gPSBbXSlcbiAgICAgICAgKS5wdXNoKGxpc3RlbmVyKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICB9XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvKipcbiAgICAgKiBBYm9ydHMgdGhlIGJlbmNobWFyayB3aXRob3V0IHJlY29yZGluZyB0aW1lcy5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgYmVuY2htYXJrIGluc3RhbmNlLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGFib3J0KCkge1xuICAgICAgdmFyIGV2ZW50LFxuICAgICAgICAgIGJlbmNoID0gdGhpcyxcbiAgICAgICAgICByZXNldHRpbmcgPSBjYWxsZWRCeS5yZXNldDtcblxuICAgICAgaWYgKGJlbmNoLnJ1bm5pbmcpIHtcbiAgICAgICAgZXZlbnQgPSBFdmVudCgnYWJvcnQnKTtcbiAgICAgICAgYmVuY2guZW1pdChldmVudCk7XG4gICAgICAgIGlmICghZXZlbnQuY2FuY2VsbGVkIHx8IHJlc2V0dGluZykge1xuICAgICAgICAgIC8vIEF2b2lkIGluZmluaXRlIHJlY3Vyc2lvbi5cbiAgICAgICAgICBjYWxsZWRCeS5hYm9ydCA9IHRydWU7XG4gICAgICAgICAgYmVuY2gucmVzZXQoKTtcbiAgICAgICAgICBkZWxldGUgY2FsbGVkQnkuYWJvcnQ7XG5cbiAgICAgICAgICBpZiAoc3VwcG9ydC50aW1lb3V0KSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoYmVuY2guX3RpbWVySWQpO1xuICAgICAgICAgICAgZGVsZXRlIGJlbmNoLl90aW1lcklkO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIXJlc2V0dGluZykge1xuICAgICAgICAgICAgYmVuY2guYWJvcnRlZCA9IHRydWU7XG4gICAgICAgICAgICBiZW5jaC5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gYmVuY2g7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBiZW5jaG1hcmsgdXNpbmcgdGhlIHNhbWUgdGVzdCBhbmQgb3B0aW9ucy5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBPcHRpb25zIG9iamVjdCB0byBvdmVyd3JpdGUgY2xvbmVkIG9wdGlvbnMuXG4gICAgICogQHJldHVybnMge09iamVjdH0gVGhlIG5ldyBiZW5jaG1hcmsgaW5zdGFuY2UuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBiaXphcnJvID0gYmVuY2guY2xvbmUoe1xuICAgICAqICAgJ25hbWUnOiAnZG9wcGVsZ2FuZ2VyJ1xuICAgICAqIH0pO1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNsb25lKG9wdGlvbnMpIHtcbiAgICAgIHZhciBiZW5jaCA9IHRoaXMsXG4gICAgICAgICAgcmVzdWx0ID0gbmV3IGJlbmNoLmNvbnN0cnVjdG9yKF8uYXNzaWduKHt9LCBiZW5jaCwgb3B0aW9ucykpO1xuXG4gICAgICAvLyBDb3JyZWN0IHRoZSBgb3B0aW9uc2Agb2JqZWN0LlxuICAgICAgcmVzdWx0Lm9wdGlvbnMgPSBfLmFzc2lnbih7fSwgY2xvbmVEZWVwKGJlbmNoLm9wdGlvbnMpLCBjbG9uZURlZXAob3B0aW9ucykpO1xuXG4gICAgICAvLyBDb3B5IG93biBjdXN0b20gcHJvcGVydGllcy5cbiAgICAgIF8uZm9yT3duKGJlbmNoLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgIGlmICghXy5oYXMocmVzdWx0LCBrZXkpKSB7XG4gICAgICAgICAgcmVzdWx0W2tleV0gPSBjbG9uZURlZXAodmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGlmIGEgYmVuY2htYXJrIGlzIGZhc3RlciB0aGFuIGFub3RoZXIuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG90aGVyIFRoZSBiZW5jaG1hcmsgdG8gY29tcGFyZS5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIGAtMWAgaWYgc2xvd2VyLCBgMWAgaWYgZmFzdGVyLCBhbmQgYDBgIGlmIGluZGV0ZXJtaW5hdGUuXG4gICAgICovXG4gICAgZnVuY3Rpb24gY29tcGFyZShvdGhlcikge1xuICAgICAgdmFyIGJlbmNoID0gdGhpcztcblxuICAgICAgLy8gRXhpdCBlYXJseSBpZiBjb21wYXJpbmcgdGhlIHNhbWUgYmVuY2htYXJrLlxuICAgICAgaWYgKGJlbmNoID09IG90aGVyKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgICAgdmFyIGNyaXRpY2FsLFxuICAgICAgICAgIHpTdGF0LFxuICAgICAgICAgIHNhbXBsZTEgPSBiZW5jaC5zdGF0cy5zYW1wbGUsXG4gICAgICAgICAgc2FtcGxlMiA9IG90aGVyLnN0YXRzLnNhbXBsZSxcbiAgICAgICAgICBzaXplMSA9IHNhbXBsZTEubGVuZ3RoLFxuICAgICAgICAgIHNpemUyID0gc2FtcGxlMi5sZW5ndGgsXG4gICAgICAgICAgbWF4U2l6ZSA9IG1heChzaXplMSwgc2l6ZTIpLFxuICAgICAgICAgIG1pblNpemUgPSBtaW4oc2l6ZTEsIHNpemUyKSxcbiAgICAgICAgICB1MSA9IGdldFUoc2FtcGxlMSwgc2FtcGxlMiksXG4gICAgICAgICAgdTIgPSBnZXRVKHNhbXBsZTIsIHNhbXBsZTEpLFxuICAgICAgICAgIHUgPSBtaW4odTEsIHUyKTtcblxuICAgICAgZnVuY3Rpb24gZ2V0U2NvcmUoeEEsIHNhbXBsZUIpIHtcbiAgICAgICAgcmV0dXJuIF8ucmVkdWNlKHNhbXBsZUIsIGZ1bmN0aW9uKHRvdGFsLCB4Qikge1xuICAgICAgICAgIHJldHVybiB0b3RhbCArICh4QiA+IHhBID8gMCA6IHhCIDwgeEEgPyAxIDogMC41KTtcbiAgICAgICAgfSwgMCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGdldFUoc2FtcGxlQSwgc2FtcGxlQikge1xuICAgICAgICByZXR1cm4gXy5yZWR1Y2Uoc2FtcGxlQSwgZnVuY3Rpb24odG90YWwsIHhBKSB7XG4gICAgICAgICAgcmV0dXJuIHRvdGFsICsgZ2V0U2NvcmUoeEEsIHNhbXBsZUIpO1xuICAgICAgICB9LCAwKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZ2V0Wih1KSB7XG4gICAgICAgIHJldHVybiAodSAtICgoc2l6ZTEgKiBzaXplMikgLyAyKSkgLyBzcXJ0KChzaXplMSAqIHNpemUyICogKHNpemUxICsgc2l6ZTIgKyAxKSkgLyAxMik7XG4gICAgICB9XG4gICAgICAvLyBSZWplY3QgdGhlIG51bGwgaHlwb3RoZXNpcyB0aGUgdHdvIHNhbXBsZXMgY29tZSBmcm9tIHRoZVxuICAgICAgLy8gc2FtZSBwb3B1bGF0aW9uIChpLmUuIGhhdmUgdGhlIHNhbWUgbWVkaWFuKSBpZi4uLlxuICAgICAgaWYgKHNpemUxICsgc2l6ZTIgPiAzMCkge1xuICAgICAgICAvLyAuLi50aGUgei1zdGF0IGlzIGdyZWF0ZXIgdGhhbiAxLjk2IG9yIGxlc3MgdGhhbiAtMS45NlxuICAgICAgICAvLyBodHRwOi8vd3d3LnN0YXRpc3RpY3NsZWN0dXJlcy5jb20vdG9waWNzL21hbm53aGl0bmV5dS9cbiAgICAgICAgelN0YXQgPSBnZXRaKHUpO1xuICAgICAgICByZXR1cm4gYWJzKHpTdGF0KSA+IDEuOTYgPyAodSA9PSB1MSA/IDEgOiAtMSkgOiAwO1xuICAgICAgfVxuICAgICAgLy8gLi4udGhlIFUgdmFsdWUgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRoZSBjcml0aWNhbCBVIHZhbHVlLlxuICAgICAgY3JpdGljYWwgPSBtYXhTaXplIDwgNSB8fCBtaW5TaXplIDwgMyA/IDAgOiB1VGFibGVbbWF4U2l6ZV1bbWluU2l6ZSAtIDNdO1xuICAgICAgcmV0dXJuIHUgPD0gY3JpdGljYWwgPyAodSA9PSB1MSA/IDEgOiAtMSkgOiAwO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlc2V0IHByb3BlcnRpZXMgYW5kIGFib3J0IGlmIHJ1bm5pbmcuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAgICogQHJldHVybnMge09iamVjdH0gVGhlIGJlbmNobWFyayBpbnN0YW5jZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICAgIHZhciBiZW5jaCA9IHRoaXM7XG4gICAgICBpZiAoYmVuY2gucnVubmluZyAmJiAhY2FsbGVkQnkuYWJvcnQpIHtcbiAgICAgICAgLy8gTm8gd29ycmllcywgYHJlc2V0KClgIGlzIGNhbGxlZCB3aXRoaW4gYGFib3J0KClgLlxuICAgICAgICBjYWxsZWRCeS5yZXNldCA9IHRydWU7XG4gICAgICAgIGJlbmNoLmFib3J0KCk7XG4gICAgICAgIGRlbGV0ZSBjYWxsZWRCeS5yZXNldDtcbiAgICAgICAgcmV0dXJuIGJlbmNoO1xuICAgICAgfVxuICAgICAgdmFyIGV2ZW50LFxuICAgICAgICAgIGluZGV4ID0gMCxcbiAgICAgICAgICBjaGFuZ2VzID0gW10sXG4gICAgICAgICAgcXVldWUgPSBbXTtcblxuICAgICAgLy8gQSBub24tcmVjdXJzaXZlIHNvbHV0aW9uIHRvIGNoZWNrIGlmIHByb3BlcnRpZXMgaGF2ZSBjaGFuZ2VkLlxuICAgICAgLy8gRm9yIG1vcmUgaW5mb3JtYXRpb24gc2VlIGh0dHA6Ly93d3cuanNsYWIuZGsvYXJ0aWNsZXMvbm9uLnJlY3Vyc2l2ZS5wcmVvcmRlci50cmF2ZXJzYWwucGFydDQuXG4gICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgJ2Rlc3RpbmF0aW9uJzogYmVuY2gsXG4gICAgICAgICdzb3VyY2UnOiBfLmFzc2lnbih7fSwgY2xvbmVEZWVwKGJlbmNoLmNvbnN0cnVjdG9yLnByb3RvdHlwZSksIGNsb25lRGVlcChiZW5jaC5vcHRpb25zKSlcbiAgICAgIH07XG5cbiAgICAgIGRvIHtcbiAgICAgICAgXy5mb3JPd24oZGF0YS5zb3VyY2UsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICB2YXIgY2hhbmdlZCxcbiAgICAgICAgICAgICAgZGVzdGluYXRpb24gPSBkYXRhLmRlc3RpbmF0aW9uLFxuICAgICAgICAgICAgICBjdXJyVmFsdWUgPSBkZXN0aW5hdGlvbltrZXldO1xuXG4gICAgICAgICAgLy8gU2tpcCBwc2V1ZG8gcHJpdmF0ZSBwcm9wZXJ0aWVzIGFuZCBldmVudCBsaXN0ZW5lcnMuXG4gICAgICAgICAgaWYgKC9eX3xeZXZlbnRzJHxeb25bQS1aXS8udGVzdChrZXkpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChfLmlzT2JqZWN0TGlrZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIGlmIChfLmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgIC8vIENoZWNrIGlmIGFuIGFycmF5IHZhbHVlIGhhcyBjaGFuZ2VkIHRvIGEgbm9uLWFycmF5IHZhbHVlLlxuICAgICAgICAgICAgICBpZiAoIV8uaXNBcnJheShjdXJyVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY3VyclZhbHVlID0gW107XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgYW4gYXJyYXkgaGFzIGNoYW5nZWQgaXRzIGxlbmd0aC5cbiAgICAgICAgICAgICAgaWYgKGN1cnJWYWx1ZS5sZW5ndGggIT0gdmFsdWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY3VyclZhbHVlID0gY3VyclZhbHVlLnNsaWNlKDAsIHZhbHVlLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgY3VyclZhbHVlLmxlbmd0aCA9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgYW4gb2JqZWN0IGhhcyBjaGFuZ2VkIHRvIGEgbm9uLW9iamVjdCB2YWx1ZS5cbiAgICAgICAgICAgIGVsc2UgaWYgKCFfLmlzT2JqZWN0TGlrZShjdXJyVmFsdWUpKSB7XG4gICAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBjdXJyVmFsdWUgPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIGEgY2hhbmdlZCBvYmplY3QuXG4gICAgICAgICAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICAgICAgICBjaGFuZ2VzLnB1c2goeyAnZGVzdGluYXRpb24nOiBkZXN0aW5hdGlvbiwgJ2tleSc6IGtleSwgJ3ZhbHVlJzogY3VyclZhbHVlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcXVldWUucHVzaCh7ICdkZXN0aW5hdGlvbic6IGN1cnJWYWx1ZSwgJ3NvdXJjZSc6IHZhbHVlIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBSZWdpc3RlciBhIGNoYW5nZWQgcHJpbWl0aXZlLlxuICAgICAgICAgIGVsc2UgaWYgKCFfLmVxKGN1cnJWYWx1ZSwgdmFsdWUpICYmIHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNoYW5nZXMucHVzaCh7ICdkZXN0aW5hdGlvbic6IGRlc3RpbmF0aW9uLCAna2V5Jzoga2V5LCAndmFsdWUnOiB2YWx1ZSB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgd2hpbGUgKChkYXRhID0gcXVldWVbaW5kZXgrK10pKTtcblxuICAgICAgLy8gSWYgY2hhbmdlZCBlbWl0IHRoZSBgcmVzZXRgIGV2ZW50IGFuZCBpZiBpdCBpc24ndCBjYW5jZWxsZWQgcmVzZXQgdGhlIGJlbmNobWFyay5cbiAgICAgIGlmIChjaGFuZ2VzLmxlbmd0aCAmJlxuICAgICAgICAgIChiZW5jaC5lbWl0KGV2ZW50ID0gRXZlbnQoJ3Jlc2V0JykpLCAhZXZlbnQuY2FuY2VsbGVkKSkge1xuICAgICAgICBfLmVhY2goY2hhbmdlcywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIGRhdGEuZGVzdGluYXRpb25bZGF0YS5rZXldID0gZGF0YS52YWx1ZTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYmVuY2g7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGlzcGxheXMgcmVsZXZhbnQgYmVuY2htYXJrIGluZm9ybWF0aW9uIHdoZW4gY29lcmNlZCB0byBhIHN0cmluZy5cbiAgICAgKlxuICAgICAqIEBuYW1lIHRvU3RyaW5nXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBiZW5jaG1hcmsgaW5zdGFuY2UuXG4gICAgICovXG4gICAgZnVuY3Rpb24gdG9TdHJpbmdCZW5jaCgpIHtcbiAgICAgIHZhciBiZW5jaCA9IHRoaXMsXG4gICAgICAgICAgZXJyb3IgPSBiZW5jaC5lcnJvcixcbiAgICAgICAgICBoeiA9IGJlbmNoLmh6LFxuICAgICAgICAgIGlkID0gYmVuY2guaWQsXG4gICAgICAgICAgc3RhdHMgPSBiZW5jaC5zdGF0cyxcbiAgICAgICAgICBzaXplID0gc3RhdHMuc2FtcGxlLmxlbmd0aCxcbiAgICAgICAgICBwbSA9ICdcXHhiMScsXG4gICAgICAgICAgcmVzdWx0ID0gYmVuY2gubmFtZSB8fCAoXy5pc05hTihpZCkgPyBpZCA6ICc8VGVzdCAjJyArIGlkICsgJz4nKTtcblxuICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgIHZhciBlcnJvclN0cjtcbiAgICAgICAgaWYgKCFfLmlzT2JqZWN0KGVycm9yKSkge1xuICAgICAgICAgIGVycm9yU3RyID0gU3RyaW5nKGVycm9yKTtcbiAgICAgICAgfSBlbHNlIGlmICghXy5pc0Vycm9yKEVycm9yKSkge1xuICAgICAgICAgIGVycm9yU3RyID0gam9pbihlcnJvcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gRXJyb3IjbmFtZSBhbmQgRXJyb3IjbWVzc2FnZSBwcm9wZXJ0aWVzIGFyZSBub24tZW51bWVyYWJsZS5cbiAgICAgICAgICBlcnJvclN0ciA9IGpvaW4oXy5hc3NpZ24oeyAnbmFtZSc6IGVycm9yLm5hbWUsICdtZXNzYWdlJzogZXJyb3IubWVzc2FnZSB9LCBlcnJvcikpO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCArPSAnOiAnICsgZXJyb3JTdHI7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmVzdWx0ICs9ICcgeCAnICsgZm9ybWF0TnVtYmVyKGh6LnRvRml4ZWQoaHogPCAxMDAgPyAyIDogMCkpICsgJyBvcHMvc2VjICcgKyBwbSArXG4gICAgICAgICAgc3RhdHMucm1lLnRvRml4ZWQoMikgKyAnJSAoJyArIHNpemUgKyAnIHJ1bicgKyAoc2l6ZSA9PSAxID8gJycgOiAncycpICsgJyBzYW1wbGVkKSc7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIC8qKlxuICAgICAqIENsb2NrcyB0aGUgdGltZSB0YWtlbiB0byBleGVjdXRlIGEgdGVzdCBwZXIgY3ljbGUgKHNlY3MpLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYmVuY2ggVGhlIGJlbmNobWFyayBpbnN0YW5jZS5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgdGltZSB0YWtlbi5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjbG9jaygpIHtcbiAgICAgIHZhciBvcHRpb25zID0gQmVuY2htYXJrLm9wdGlvbnMsXG4gICAgICAgICAgdGVtcGxhdGVEYXRhID0ge30sXG4gICAgICAgICAgdGltZXJzID0gW3sgJ25zJzogdGltZXIubnMsICdyZXMnOiBtYXgoMC4wMDE1LCBnZXRSZXMoJ21zJykpLCAndW5pdCc6ICdtcycgfV07XG5cbiAgICAgIC8vIExhenkgZGVmaW5lIGZvciBoaS1yZXMgdGltZXJzLlxuICAgICAgY2xvY2sgPSBmdW5jdGlvbihjbG9uZSkge1xuICAgICAgICB2YXIgZGVmZXJyZWQ7XG5cbiAgICAgICAgaWYgKGNsb25lIGluc3RhbmNlb2YgRGVmZXJyZWQpIHtcbiAgICAgICAgICBkZWZlcnJlZCA9IGNsb25lO1xuICAgICAgICAgIGNsb25lID0gZGVmZXJyZWQuYmVuY2htYXJrO1xuICAgICAgICB9XG4gICAgICAgIHZhciBiZW5jaCA9IGNsb25lLl9vcmlnaW5hbCxcbiAgICAgICAgICAgIHN0cmluZ2FibGUgPSBpc1N0cmluZ2FibGUoYmVuY2guZm4pLFxuICAgICAgICAgICAgY291bnQgPSBiZW5jaC5jb3VudCA9IGNsb25lLmNvdW50LFxuICAgICAgICAgICAgZGVjb21waWxhYmxlID0gc3RyaW5nYWJsZSB8fCAoc3VwcG9ydC5kZWNvbXBpbGF0aW9uICYmIChjbG9uZS5zZXR1cCAhPT0gXy5ub29wIHx8IGNsb25lLnRlYXJkb3duICE9PSBfLm5vb3ApKSxcbiAgICAgICAgICAgIGlkID0gYmVuY2guaWQsXG4gICAgICAgICAgICBuYW1lID0gYmVuY2gubmFtZSB8fCAodHlwZW9mIGlkID09ICdudW1iZXInID8gJzxUZXN0ICMnICsgaWQgKyAnPicgOiBpZCksXG4gICAgICAgICAgICByZXN1bHQgPSAwO1xuXG4gICAgICAgIC8vIEluaXQgYG1pblRpbWVgIGlmIG5lZWRlZC5cbiAgICAgICAgY2xvbmUubWluVGltZSA9IGJlbmNoLm1pblRpbWUgfHwgKGJlbmNoLm1pblRpbWUgPSBiZW5jaC5vcHRpb25zLm1pblRpbWUgPSBvcHRpb25zLm1pblRpbWUpO1xuXG4gICAgICAgIC8vIENvbXBpbGUgaW4gc2V0dXAvdGVhcmRvd24gZnVuY3Rpb25zIGFuZCB0aGUgdGVzdCBsb29wLlxuICAgICAgICAvLyBDcmVhdGUgYSBuZXcgY29tcGlsZWQgdGVzdCwgaW5zdGVhZCBvZiB1c2luZyB0aGUgY2FjaGVkIGBiZW5jaC5jb21waWxlZGAsXG4gICAgICAgIC8vIHRvIGF2b2lkIHBvdGVudGlhbCBlbmdpbmUgb3B0aW1pemF0aW9ucyBlbmFibGVkIG92ZXIgdGhlIGxpZmUgb2YgdGhlIHRlc3QuXG4gICAgICAgIHZhciBmdW5jQm9keSA9IGRlZmVycmVkXG4gICAgICAgICAgPyAndmFyIGQjPXRoaXMsJHtmbkFyZ309ZCMsbSM9ZCMuYmVuY2htYXJrLl9vcmlnaW5hbCxmIz1tIy5mbixzdSM9bSMuc2V0dXAsdGQjPW0jLnRlYXJkb3duOycgK1xuICAgICAgICAgICAgLy8gV2hlbiBgZGVmZXJyZWQuY3ljbGVzYCBpcyBgMGAgdGhlbi4uLlxuICAgICAgICAgICAgJ2lmKCFkIy5jeWNsZXMpeycgK1xuICAgICAgICAgICAgLy8gc2V0IGBkZWZlcnJlZC5mbmAsXG4gICAgICAgICAgICAnZCMuZm49ZnVuY3Rpb24oKXt2YXIgJHtmbkFyZ309ZCM7aWYodHlwZW9mIGYjPT1cImZ1bmN0aW9uXCIpe3RyeXske2ZufVxcbn1jYXRjaChlIyl7ZiMoZCMpfX1lbHNleyR7Zm59XFxufX07JyArXG4gICAgICAgICAgICAvLyBzZXQgYGRlZmVycmVkLnRlYXJkb3duYCxcbiAgICAgICAgICAgICdkIy50ZWFyZG93bj1mdW5jdGlvbigpe2QjLmN5Y2xlcz0wO2lmKHR5cGVvZiB0ZCM9PVwiZnVuY3Rpb25cIil7dHJ5eyR7dGVhcmRvd259XFxufWNhdGNoKGUjKXt0ZCMoKX19ZWxzZXske3RlYXJkb3dufVxcbn19OycgK1xuICAgICAgICAgICAgLy8gZXhlY3V0ZSB0aGUgYmVuY2htYXJrJ3MgYHNldHVwYCxcbiAgICAgICAgICAgICdpZih0eXBlb2Ygc3UjPT1cImZ1bmN0aW9uXCIpe3RyeXske3NldHVwfVxcbn1jYXRjaChlIyl7c3UjKCl9fWVsc2V7JHtzZXR1cH1cXG59OycgK1xuICAgICAgICAgICAgLy8gc3RhcnQgdGltZXIsXG4gICAgICAgICAgICAndCMuc3RhcnQoZCMpOycgK1xuICAgICAgICAgICAgLy8gYW5kIHRoZW4gZXhlY3V0ZSBgZGVmZXJyZWQuZm5gIGFuZCByZXR1cm4gYSBkdW1teSBvYmplY3QuXG4gICAgICAgICAgICAnfWQjLmZuKCk7cmV0dXJue3VpZDpcIiR7dWlkfVwifSdcblxuICAgICAgICAgIDogJ3ZhciByIyxzIyxtIz10aGlzLGYjPW0jLmZuLGkjPW0jLmNvdW50LG4jPXQjLm5zOyR7c2V0dXB9XFxuJHtiZWdpbn07JyArXG4gICAgICAgICAgICAnd2hpbGUoaSMtLSl7JHtmbn1cXG59JHtlbmR9OyR7dGVhcmRvd259XFxucmV0dXJue2VsYXBzZWQ6ciMsdWlkOlwiJHt1aWR9XCJ9JztcblxuICAgICAgICB2YXIgY29tcGlsZWQgPSBiZW5jaC5jb21waWxlZCA9IGNsb25lLmNvbXBpbGVkID0gY3JlYXRlQ29tcGlsZWQoYmVuY2gsIGRlY29tcGlsYWJsZSwgZGVmZXJyZWQsIGZ1bmNCb2R5KSxcbiAgICAgICAgICAgIGlzRW1wdHkgPSAhKHRlbXBsYXRlRGF0YS5mbiB8fCBzdHJpbmdhYmxlKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChpc0VtcHR5KSB7XG4gICAgICAgICAgICAvLyBGaXJlZm94IG1heSByZW1vdmUgZGVhZCBjb2RlIGZyb20gYEZ1bmN0aW9uI3RvU3RyaW5nYCByZXN1bHRzLlxuICAgICAgICAgICAgLy8gRm9yIG1vcmUgaW5mb3JtYXRpb24gc2VlIGh0dHA6Ly9idWd6aWwubGEvNTM2MDg1LlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgdGVzdCBcIicgKyBuYW1lICsgJ1wiIGlzIGVtcHR5LiBUaGlzIG1heSBiZSB0aGUgcmVzdWx0IG9mIGRlYWQgY29kZSByZW1vdmFsLicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmICghZGVmZXJyZWQpIHtcbiAgICAgICAgICAgIC8vIFByZXRlc3QgdG8gZGV0ZXJtaW5lIGlmIGNvbXBpbGVkIGNvZGUgZXhpdHMgZWFybHksIHVzdWFsbHkgYnkgYVxuICAgICAgICAgICAgLy8gcm9ndWUgYHJldHVybmAgc3RhdGVtZW50LCBieSBjaGVja2luZyBmb3IgYSByZXR1cm4gb2JqZWN0IHdpdGggdGhlIHVpZC5cbiAgICAgICAgICAgIGJlbmNoLmNvdW50ID0gMTtcbiAgICAgICAgICAgIGNvbXBpbGVkID0gZGVjb21waWxhYmxlICYmIChjb21waWxlZC5jYWxsKGJlbmNoLCBjb250ZXh0LCB0aW1lcikgfHwge30pLnVpZCA9PSB0ZW1wbGF0ZURhdGEudWlkICYmIGNvbXBpbGVkO1xuICAgICAgICAgICAgYmVuY2guY291bnQgPSBjb3VudDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgIGNvbXBpbGVkID0gbnVsbDtcbiAgICAgICAgICBjbG9uZS5lcnJvciA9IGUgfHwgbmV3IEVycm9yKFN0cmluZyhlKSk7XG4gICAgICAgICAgYmVuY2guY291bnQgPSBjb3VudDtcbiAgICAgICAgfVxuICAgICAgICAvLyBGYWxsYmFjayB3aGVuIGEgdGVzdCBleGl0cyBlYXJseSBvciBlcnJvcnMgZHVyaW5nIHByZXRlc3QuXG4gICAgICAgIGlmICghY29tcGlsZWQgJiYgIWRlZmVycmVkICYmICFpc0VtcHR5KSB7XG4gICAgICAgICAgZnVuY0JvZHkgPSAoXG4gICAgICAgICAgICBzdHJpbmdhYmxlIHx8IChkZWNvbXBpbGFibGUgJiYgIWNsb25lLmVycm9yKVxuICAgICAgICAgICAgICA/ICdmdW5jdGlvbiBmIygpeyR7Zm59XFxufXZhciByIyxzIyxtIz10aGlzLGkjPW0jLmNvdW50J1xuICAgICAgICAgICAgICA6ICd2YXIgciMscyMsbSM9dGhpcyxmIz1tIy5mbixpIz1tIy5jb3VudCdcbiAgICAgICAgICAgICkgK1xuICAgICAgICAgICAgJyxuIz10Iy5uczske3NldHVwfVxcbiR7YmVnaW59O20jLmYjPWYjO3doaWxlKGkjLS0pe20jLmYjKCl9JHtlbmR9OycgK1xuICAgICAgICAgICAgJ2RlbGV0ZSBtIy5mIzske3RlYXJkb3dufVxcbnJldHVybntlbGFwc2VkOnIjfSc7XG5cbiAgICAgICAgICBjb21waWxlZCA9IGNyZWF0ZUNvbXBpbGVkKGJlbmNoLCBkZWNvbXBpbGFibGUsIGRlZmVycmVkLCBmdW5jQm9keSk7XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gUHJldGVzdCBvbmUgbW9yZSB0aW1lIHRvIGNoZWNrIGZvciBlcnJvcnMuXG4gICAgICAgICAgICBiZW5jaC5jb3VudCA9IDE7XG4gICAgICAgICAgICBjb21waWxlZC5jYWxsKGJlbmNoLCBjb250ZXh0LCB0aW1lcik7XG4gICAgICAgICAgICBiZW5jaC5jb3VudCA9IGNvdW50O1xuICAgICAgICAgICAgZGVsZXRlIGNsb25lLmVycm9yO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXRjaChlKSB7XG4gICAgICAgICAgICBiZW5jaC5jb3VudCA9IGNvdW50O1xuICAgICAgICAgICAgaWYgKCFjbG9uZS5lcnJvcikge1xuICAgICAgICAgICAgICBjbG9uZS5lcnJvciA9IGUgfHwgbmV3IEVycm9yKFN0cmluZyhlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIElmIG5vIGVycm9ycyBydW4gdGhlIGZ1bGwgdGVzdCBsb29wLlxuICAgICAgICBpZiAoIWNsb25lLmVycm9yKSB7XG4gICAgICAgICAgY29tcGlsZWQgPSBiZW5jaC5jb21waWxlZCA9IGNsb25lLmNvbXBpbGVkID0gY3JlYXRlQ29tcGlsZWQoYmVuY2gsIGRlY29tcGlsYWJsZSwgZGVmZXJyZWQsIGZ1bmNCb2R5KTtcbiAgICAgICAgICByZXN1bHQgPSBjb21waWxlZC5jYWxsKGRlZmVycmVkIHx8IGJlbmNoLCBjb250ZXh0LCB0aW1lcikuZWxhcHNlZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfTtcblxuICAgICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgICAgLyoqXG4gICAgICAgKiBDcmVhdGVzIGEgY29tcGlsZWQgZnVuY3Rpb24gZnJvbSB0aGUgZ2l2ZW4gZnVuY3Rpb24gYGJvZHlgLlxuICAgICAgICovXG4gICAgICBmdW5jdGlvbiBjcmVhdGVDb21waWxlZChiZW5jaCwgZGVjb21waWxhYmxlLCBkZWZlcnJlZCwgYm9keSkge1xuICAgICAgICB2YXIgZm4gPSBiZW5jaC5mbixcbiAgICAgICAgICAgIGZuQXJnID0gZGVmZXJyZWQgPyBnZXRGaXJzdEFyZ3VtZW50KGZuKSB8fCAnZGVmZXJyZWQnIDogJyc7XG5cbiAgICAgICAgdGVtcGxhdGVEYXRhLnVpZCA9IHVpZCArIHVpZENvdW50ZXIrKztcblxuICAgICAgICBfLmFzc2lnbih0ZW1wbGF0ZURhdGEsIHtcbiAgICAgICAgICAnc2V0dXAnOiBkZWNvbXBpbGFibGUgPyBnZXRTb3VyY2UoYmVuY2guc2V0dXApIDogaW50ZXJwb2xhdGUoJ20jLnNldHVwKCknKSxcbiAgICAgICAgICAnZm4nOiBkZWNvbXBpbGFibGUgPyBnZXRTb3VyY2UoZm4pIDogaW50ZXJwb2xhdGUoJ20jLmZuKCcgKyBmbkFyZyArICcpJyksXG4gICAgICAgICAgJ2ZuQXJnJzogZm5BcmcsXG4gICAgICAgICAgJ3RlYXJkb3duJzogZGVjb21waWxhYmxlID8gZ2V0U291cmNlKGJlbmNoLnRlYXJkb3duKSA6IGludGVycG9sYXRlKCdtIy50ZWFyZG93bigpJylcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gVXNlIEFQSSBvZiBjaG9zZW4gdGltZXIuXG4gICAgICAgIGlmICh0aW1lci51bml0ID09ICducycpIHtcbiAgICAgICAgICBfLmFzc2lnbih0ZW1wbGF0ZURhdGEsIHtcbiAgICAgICAgICAgICdiZWdpbic6IGludGVycG9sYXRlKCdzIz1uIygpJyksXG4gICAgICAgICAgICAnZW5kJzogaW50ZXJwb2xhdGUoJ3IjPW4jKHMjKTtyIz1yI1swXSsociNbMV0vMWU5KScpXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGltZXIudW5pdCA9PSAndXMnKSB7XG4gICAgICAgICAgaWYgKHRpbWVyLm5zLnN0b3ApIHtcbiAgICAgICAgICAgIF8uYXNzaWduKHRlbXBsYXRlRGF0YSwge1xuICAgICAgICAgICAgICAnYmVnaW4nOiBpbnRlcnBvbGF0ZSgncyM9biMuc3RhcnQoKScpLFxuICAgICAgICAgICAgICAnZW5kJzogaW50ZXJwb2xhdGUoJ3IjPW4jLm1pY3Jvc2Vjb25kcygpLzFlNicpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy5hc3NpZ24odGVtcGxhdGVEYXRhLCB7XG4gICAgICAgICAgICAgICdiZWdpbic6IGludGVycG9sYXRlKCdzIz1uIygpJyksXG4gICAgICAgICAgICAgICdlbmQnOiBpbnRlcnBvbGF0ZSgnciM9KG4jKCktcyMpLzFlNicpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGltZXIubnMubm93KSB7XG4gICAgICAgICAgXy5hc3NpZ24odGVtcGxhdGVEYXRhLCB7XG4gICAgICAgICAgICAnYmVnaW4nOiBpbnRlcnBvbGF0ZSgncyM9biMubm93KCknKSxcbiAgICAgICAgICAgICdlbmQnOiBpbnRlcnBvbGF0ZSgnciM9KG4jLm5vdygpLXMjKS8xZTMnKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIF8uYXNzaWduKHRlbXBsYXRlRGF0YSwge1xuICAgICAgICAgICAgJ2JlZ2luJzogaW50ZXJwb2xhdGUoJ3MjPW5ldyBuIygpLmdldFRpbWUoKScpLFxuICAgICAgICAgICAgJ2VuZCc6IGludGVycG9sYXRlKCdyIz0obmV3IG4jKCkuZ2V0VGltZSgpLXMjKS8xZTMnKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIERlZmluZSBgdGltZXJgIG1ldGhvZHMuXG4gICAgICAgIHRpbWVyLnN0YXJ0ID0gY3JlYXRlRnVuY3Rpb24oXG4gICAgICAgICAgaW50ZXJwb2xhdGUoJ28jJyksXG4gICAgICAgICAgaW50ZXJwb2xhdGUoJ3ZhciBuIz10aGlzLm5zLCR7YmVnaW59O28jLmVsYXBzZWQ9MDtvIy50aW1lU3RhbXA9cyMnKVxuICAgICAgICApO1xuXG4gICAgICAgIHRpbWVyLnN0b3AgPSBjcmVhdGVGdW5jdGlvbihcbiAgICAgICAgICBpbnRlcnBvbGF0ZSgnbyMnKSxcbiAgICAgICAgICBpbnRlcnBvbGF0ZSgndmFyIG4jPXRoaXMubnMscyM9byMudGltZVN0YW1wLCR7ZW5kfTtvIy5lbGFwc2VkPXIjJylcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBDcmVhdGUgY29tcGlsZWQgdGVzdC5cbiAgICAgICAgcmV0dXJuIGNyZWF0ZUZ1bmN0aW9uKFxuICAgICAgICAgIGludGVycG9sYXRlKCd3aW5kb3csdCMnKSxcbiAgICAgICAgICAndmFyIGdsb2JhbCA9IHdpbmRvdywgY2xlYXJUaW1lb3V0ID0gZ2xvYmFsLmNsZWFyVGltZW91dCwgc2V0VGltZW91dCA9IGdsb2JhbC5zZXRUaW1lb3V0O1xcbicgK1xuICAgICAgICAgIGludGVycG9sYXRlKGJvZHkpXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogR2V0cyB0aGUgY3VycmVudCB0aW1lcidzIG1pbmltdW0gcmVzb2x1dGlvbiAoc2VjcykuXG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIGdldFJlcyh1bml0KSB7XG4gICAgICAgIHZhciBtZWFzdXJlZCxcbiAgICAgICAgICAgIGJlZ2luLFxuICAgICAgICAgICAgY291bnQgPSAzMCxcbiAgICAgICAgICAgIGRpdmlzb3IgPSAxZTMsXG4gICAgICAgICAgICBucyA9IHRpbWVyLm5zLFxuICAgICAgICAgICAgc2FtcGxlID0gW107XG5cbiAgICAgICAgLy8gR2V0IGF2ZXJhZ2Ugc21hbGxlc3QgbWVhc3VyYWJsZSB0aW1lLlxuICAgICAgICB3aGlsZSAoY291bnQtLSkge1xuICAgICAgICAgIGlmICh1bml0ID09ICd1cycpIHtcbiAgICAgICAgICAgIGRpdmlzb3IgPSAxZTY7XG4gICAgICAgICAgICBpZiAobnMuc3RvcCkge1xuICAgICAgICAgICAgICBucy5zdGFydCgpO1xuICAgICAgICAgICAgICB3aGlsZSAoIShtZWFzdXJlZCA9IG5zLm1pY3Jvc2Vjb25kcygpKSkge31cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGJlZ2luID0gbnMoKTtcbiAgICAgICAgICAgICAgd2hpbGUgKCEobWVhc3VyZWQgPSBucygpIC0gYmVnaW4pKSB7fVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmICh1bml0ID09ICducycpIHtcbiAgICAgICAgICAgIGRpdmlzb3IgPSAxZTk7XG4gICAgICAgICAgICBiZWdpbiA9IChiZWdpbiA9IG5zKCkpWzBdICsgKGJlZ2luWzFdIC8gZGl2aXNvcik7XG4gICAgICAgICAgICB3aGlsZSAoIShtZWFzdXJlZCA9ICgobWVhc3VyZWQgPSBucygpKVswXSArIChtZWFzdXJlZFsxXSAvIGRpdmlzb3IpKSAtIGJlZ2luKSkge31cbiAgICAgICAgICAgIGRpdmlzb3IgPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmIChucy5ub3cpIHtcbiAgICAgICAgICAgIGJlZ2luID0gbnMubm93KCk7XG4gICAgICAgICAgICB3aGlsZSAoIShtZWFzdXJlZCA9IG5zLm5vdygpIC0gYmVnaW4pKSB7fVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGJlZ2luID0gbmV3IG5zKCkuZ2V0VGltZSgpO1xuICAgICAgICAgICAgd2hpbGUgKCEobWVhc3VyZWQgPSBuZXcgbnMoKS5nZXRUaW1lKCkgLSBiZWdpbikpIHt9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIENoZWNrIGZvciBicm9rZW4gdGltZXJzLlxuICAgICAgICAgIGlmIChtZWFzdXJlZCA+IDApIHtcbiAgICAgICAgICAgIHNhbXBsZS5wdXNoKG1lYXN1cmVkKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2FtcGxlLnB1c2goSW5maW5pdHkpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIENvbnZlcnQgdG8gc2Vjb25kcy5cbiAgICAgICAgcmV0dXJuIGdldE1lYW4oc2FtcGxlKSAvIGRpdmlzb3I7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogSW50ZXJwb2xhdGVzIGEgZ2l2ZW4gdGVtcGxhdGUgc3RyaW5nLlxuICAgICAgICovXG4gICAgICBmdW5jdGlvbiBpbnRlcnBvbGF0ZShzdHJpbmcpIHtcbiAgICAgICAgLy8gUmVwbGFjZXMgYWxsIG9jY3VycmVuY2VzIG9mIGAjYCB3aXRoIGEgdW5pcXVlIG51bWJlciBhbmQgdGVtcGxhdGUgdG9rZW5zIHdpdGggY29udGVudC5cbiAgICAgICAgcmV0dXJuIF8udGVtcGxhdGUoc3RyaW5nLnJlcGxhY2UoL1xcIy9nLCAvXFxkKy8uZXhlYyh0ZW1wbGF0ZURhdGEudWlkKSkpKHRlbXBsYXRlRGF0YSk7XG4gICAgICB9XG5cbiAgICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAgIC8vIERldGVjdCBDaHJvbWUncyBtaWNyb3NlY29uZCB0aW1lcjpcbiAgICAgIC8vIGVuYWJsZSBiZW5jaG1hcmtpbmcgdmlhIHRoZSAtLWVuYWJsZS1iZW5jaG1hcmtpbmcgY29tbWFuZFxuICAgICAgLy8gbGluZSBzd2l0Y2ggaW4gYXQgbGVhc3QgQ2hyb21lIDcgdG8gdXNlIGNocm9tZS5JbnRlcnZhbFxuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCh0aW1lci5ucyA9IG5ldyAoY29udGV4dC5jaHJvbWUgfHwgY29udGV4dC5jaHJvbWl1bSkuSW50ZXJ2YWwpKSB7XG4gICAgICAgICAgdGltZXJzLnB1c2goeyAnbnMnOiB0aW1lci5ucywgJ3Jlcyc6IGdldFJlcygndXMnKSwgJ3VuaXQnOiAndXMnIH0pO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoKGUpIHt9XG5cbiAgICAgIC8vIERldGVjdCBOb2RlLmpzJ3MgbmFub3NlY29uZCByZXNvbHV0aW9uIHRpbWVyIGF2YWlsYWJsZSBpbiBOb2RlLmpzID49IDAuOC5cbiAgICAgIGlmIChwcm9jZXNzT2JqZWN0ICYmIHR5cGVvZiAodGltZXIubnMgPSBwcm9jZXNzT2JqZWN0LmhydGltZSkgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aW1lcnMucHVzaCh7ICducyc6IHRpbWVyLm5zLCAncmVzJzogZ2V0UmVzKCducycpLCAndW5pdCc6ICducycgfSk7XG4gICAgICB9XG4gICAgICAvLyBEZXRlY3QgV2FkZSBTaW1tb25zJyBOb2RlLmpzIGBtaWNyb3RpbWVgIG1vZHVsZS5cbiAgICAgIGlmIChtaWNyb3RpbWVPYmplY3QgJiYgdHlwZW9mICh0aW1lci5ucyA9IG1pY3JvdGltZU9iamVjdC5ub3cpID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGltZXJzLnB1c2goeyAnbnMnOiB0aW1lci5ucywgICdyZXMnOiBnZXRSZXMoJ3VzJyksICd1bml0JzogJ3VzJyB9KTtcbiAgICAgIH1cbiAgICAgIC8vIFBpY2sgdGltZXIgd2l0aCBoaWdoZXN0IHJlc29sdXRpb24uXG4gICAgICB0aW1lciA9IF8ubWluQnkodGltZXJzLCAncmVzJyk7XG5cbiAgICAgIC8vIEVycm9yIGlmIHRoZXJlIGFyZSBubyB3b3JraW5nIHRpbWVycy5cbiAgICAgIGlmICh0aW1lci5yZXMgPT0gSW5maW5pdHkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCZW5jaG1hcmsuanMgd2FzIHVuYWJsZSB0byBmaW5kIGEgd29ya2luZyB0aW1lci4nKTtcbiAgICAgIH1cbiAgICAgIC8vIFJlc29sdmUgdGltZSBzcGFuIHJlcXVpcmVkIHRvIGFjaGlldmUgYSBwZXJjZW50IHVuY2VydGFpbnR5IG9mIGF0IG1vc3QgMSUuXG4gICAgICAvLyBGb3IgbW9yZSBpbmZvcm1hdGlvbiBzZWUgaHR0cDovL3NwaWZmLnJpdC5lZHUvY2xhc3Nlcy9waHlzMjczL3VuY2VydC91bmNlcnQuaHRtbC5cbiAgICAgIG9wdGlvbnMubWluVGltZSB8fCAob3B0aW9ucy5taW5UaW1lID0gbWF4KHRpbWVyLnJlcyAvIDIgLyAwLjAxLCAwLjA1KSk7XG4gICAgICByZXR1cm4gY2xvY2suYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvKipcbiAgICAgKiBDb21wdXRlcyBzdGF0cyBvbiBiZW5jaG1hcmsgcmVzdWx0cy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGJlbmNoIFRoZSBiZW5jaG1hcmsgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgVGhlIG9wdGlvbnMgb2JqZWN0LlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNvbXB1dGUoYmVuY2gsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgfHwgKG9wdGlvbnMgPSB7fSk7XG5cbiAgICAgIHZhciBhc3luYyA9IG9wdGlvbnMuYXN5bmMsXG4gICAgICAgICAgZWxhcHNlZCA9IDAsXG4gICAgICAgICAgaW5pdENvdW50ID0gYmVuY2guaW5pdENvdW50LFxuICAgICAgICAgIG1pblNhbXBsZXMgPSBiZW5jaC5taW5TYW1wbGVzLFxuICAgICAgICAgIHF1ZXVlID0gW10sXG4gICAgICAgICAgc2FtcGxlID0gYmVuY2guc3RhdHMuc2FtcGxlO1xuXG4gICAgICAvKipcbiAgICAgICAqIEFkZHMgYSBjbG9uZSB0byB0aGUgcXVldWUuXG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIGVucXVldWUoKSB7XG4gICAgICAgIHF1ZXVlLnB1c2goXy5hc3NpZ24oYmVuY2guY2xvbmUoKSwge1xuICAgICAgICAgICdfb3JpZ2luYWwnOiBiZW5jaCxcbiAgICAgICAgICAnZXZlbnRzJzoge1xuICAgICAgICAgICAgJ2Fib3J0JzogW3VwZGF0ZV0sXG4gICAgICAgICAgICAnY3ljbGUnOiBbdXBkYXRlXSxcbiAgICAgICAgICAgICdlcnJvcic6IFt1cGRhdGVdLFxuICAgICAgICAgICAgJ3N0YXJ0JzogW3VwZGF0ZV1cbiAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBVcGRhdGVzIHRoZSBjbG9uZS9vcmlnaW5hbCBiZW5jaG1hcmtzIHRvIGtlZXAgdGhlaXIgZGF0YSBpbiBzeW5jLlxuICAgICAgICovXG4gICAgICBmdW5jdGlvbiB1cGRhdGUoZXZlbnQpIHtcbiAgICAgICAgdmFyIGNsb25lID0gdGhpcyxcbiAgICAgICAgICAgIHR5cGUgPSBldmVudC50eXBlO1xuXG4gICAgICAgIGlmIChiZW5jaC5ydW5uaW5nKSB7XG4gICAgICAgICAgaWYgKHR5cGUgPT0gJ3N0YXJ0Jykge1xuICAgICAgICAgICAgLy8gTm90ZTogYGNsb25lLm1pblRpbWVgIHByb3AgaXMgaW5pdGVkIGluIGBjbG9jaygpYC5cbiAgICAgICAgICAgIGNsb25lLmNvdW50ID0gYmVuY2guaW5pdENvdW50O1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0eXBlID09ICdlcnJvcicpIHtcbiAgICAgICAgICAgICAgYmVuY2guZXJyb3IgPSBjbG9uZS5lcnJvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlID09ICdhYm9ydCcpIHtcbiAgICAgICAgICAgICAgYmVuY2guYWJvcnQoKTtcbiAgICAgICAgICAgICAgYmVuY2guZW1pdCgnY3ljbGUnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQgPSBldmVudC50YXJnZXQgPSBiZW5jaDtcbiAgICAgICAgICAgICAgYmVuY2guZW1pdChldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGJlbmNoLmFib3J0ZWQpIHtcbiAgICAgICAgICAvLyBDbGVhciBhYm9ydCBsaXN0ZW5lcnMgdG8gYXZvaWQgdHJpZ2dlcmluZyBiZW5jaCdzIGFib3J0L2N5Y2xlIGFnYWluLlxuICAgICAgICAgIGNsb25lLmV2ZW50cy5hYm9ydC5sZW5ndGggPSAwO1xuICAgICAgICAgIGNsb25lLmFib3J0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBEZXRlcm1pbmVzIGlmIG1vcmUgY2xvbmVzIHNob3VsZCBiZSBxdWV1ZWQgb3IgaWYgY3ljbGluZyBzaG91bGQgc3RvcC5cbiAgICAgICAqL1xuICAgICAgZnVuY3Rpb24gZXZhbHVhdGUoZXZlbnQpIHtcbiAgICAgICAgdmFyIGNyaXRpY2FsLFxuICAgICAgICAgICAgZGYsXG4gICAgICAgICAgICBtZWFuLFxuICAgICAgICAgICAgbW9lLFxuICAgICAgICAgICAgcm1lLFxuICAgICAgICAgICAgc2QsXG4gICAgICAgICAgICBzZW0sXG4gICAgICAgICAgICB2YXJpYW5jZSxcbiAgICAgICAgICAgIGNsb25lID0gZXZlbnQudGFyZ2V0LFxuICAgICAgICAgICAgZG9uZSA9IGJlbmNoLmFib3J0ZWQsXG4gICAgICAgICAgICBub3cgPSBfLm5vdygpLFxuICAgICAgICAgICAgc2l6ZSA9IHNhbXBsZS5wdXNoKGNsb25lLnRpbWVzLnBlcmlvZCksXG4gICAgICAgICAgICBtYXhlZE91dCA9IHNpemUgPj0gbWluU2FtcGxlcyAmJiAoZWxhcHNlZCArPSBub3cgLSBjbG9uZS50aW1lcy50aW1lU3RhbXApIC8gMWUzID4gYmVuY2gubWF4VGltZSxcbiAgICAgICAgICAgIHRpbWVzID0gYmVuY2gudGltZXMsXG4gICAgICAgICAgICB2YXJPZiA9IGZ1bmN0aW9uKHN1bSwgeCkgeyByZXR1cm4gc3VtICsgcG93KHggLSBtZWFuLCAyKTsgfTtcblxuICAgICAgICAvLyBFeGl0IGVhcmx5IGZvciBhYm9ydGVkIG9yIHVuY2xvY2thYmxlIHRlc3RzLlxuICAgICAgICBpZiAoZG9uZSB8fCBjbG9uZS5oeiA9PSBJbmZpbml0eSkge1xuICAgICAgICAgIG1heGVkT3V0ID0gIShzaXplID0gc2FtcGxlLmxlbmd0aCA9IHF1ZXVlLmxlbmd0aCA9IDApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFkb25lKSB7XG4gICAgICAgICAgLy8gQ29tcHV0ZSB0aGUgc2FtcGxlIG1lYW4gKGVzdGltYXRlIG9mIHRoZSBwb3B1bGF0aW9uIG1lYW4pLlxuICAgICAgICAgIG1lYW4gPSBnZXRNZWFuKHNhbXBsZSk7XG4gICAgICAgICAgLy8gQ29tcHV0ZSB0aGUgc2FtcGxlIHZhcmlhbmNlIChlc3RpbWF0ZSBvZiB0aGUgcG9wdWxhdGlvbiB2YXJpYW5jZSkuXG4gICAgICAgICAgdmFyaWFuY2UgPSBfLnJlZHVjZShzYW1wbGUsIHZhck9mLCAwKSAvIChzaXplIC0gMSkgfHwgMDtcbiAgICAgICAgICAvLyBDb21wdXRlIHRoZSBzYW1wbGUgc3RhbmRhcmQgZGV2aWF0aW9uIChlc3RpbWF0ZSBvZiB0aGUgcG9wdWxhdGlvbiBzdGFuZGFyZCBkZXZpYXRpb24pLlxuICAgICAgICAgIHNkID0gc3FydCh2YXJpYW5jZSk7XG4gICAgICAgICAgLy8gQ29tcHV0ZSB0aGUgc3RhbmRhcmQgZXJyb3Igb2YgdGhlIG1lYW4gKGEuay5hLiB0aGUgc3RhbmRhcmQgZGV2aWF0aW9uIG9mIHRoZSBzYW1wbGluZyBkaXN0cmlidXRpb24gb2YgdGhlIHNhbXBsZSBtZWFuKS5cbiAgICAgICAgICBzZW0gPSBzZCAvIHNxcnQoc2l6ZSk7XG4gICAgICAgICAgLy8gQ29tcHV0ZSB0aGUgZGVncmVlcyBvZiBmcmVlZG9tLlxuICAgICAgICAgIGRmID0gc2l6ZSAtIDE7XG4gICAgICAgICAgLy8gQ29tcHV0ZSB0aGUgY3JpdGljYWwgdmFsdWUuXG4gICAgICAgICAgY3JpdGljYWwgPSB0VGFibGVbTWF0aC5yb3VuZChkZikgfHwgMV0gfHwgdFRhYmxlLmluZmluaXR5O1xuICAgICAgICAgIC8vIENvbXB1dGUgdGhlIG1hcmdpbiBvZiBlcnJvci5cbiAgICAgICAgICBtb2UgPSBzZW0gKiBjcml0aWNhbDtcbiAgICAgICAgICAvLyBDb21wdXRlIHRoZSByZWxhdGl2ZSBtYXJnaW4gb2YgZXJyb3IuXG4gICAgICAgICAgcm1lID0gKG1vZSAvIG1lYW4pICogMTAwIHx8IDA7XG5cbiAgICAgICAgICBfLmFzc2lnbihiZW5jaC5zdGF0cywge1xuICAgICAgICAgICAgJ2RldmlhdGlvbic6IHNkLFxuICAgICAgICAgICAgJ21lYW4nOiBtZWFuLFxuICAgICAgICAgICAgJ21vZSc6IG1vZSxcbiAgICAgICAgICAgICdybWUnOiBybWUsXG4gICAgICAgICAgICAnc2VtJzogc2VtLFxuICAgICAgICAgICAgJ3ZhcmlhbmNlJzogdmFyaWFuY2VcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIEFib3J0IHRoZSBjeWNsZSBsb29wIHdoZW4gdGhlIG1pbmltdW0gc2FtcGxlIHNpemUgaGFzIGJlZW4gY29sbGVjdGVkXG4gICAgICAgICAgLy8gYW5kIHRoZSBlbGFwc2VkIHRpbWUgZXhjZWVkcyB0aGUgbWF4aW11bSB0aW1lIGFsbG93ZWQgcGVyIGJlbmNobWFyay5cbiAgICAgICAgICAvLyBXZSBkb24ndCBjb3VudCBjeWNsZSBkZWxheXMgdG93YXJkIHRoZSBtYXggdGltZSBiZWNhdXNlIGRlbGF5cyBtYXkgYmVcbiAgICAgICAgICAvLyBpbmNyZWFzZWQgYnkgYnJvd3NlcnMgdGhhdCBjbGFtcCB0aW1lb3V0cyBmb3IgaW5hY3RpdmUgdGFicy4gRm9yIG1vcmVcbiAgICAgICAgICAvLyBpbmZvcm1hdGlvbiBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vd2luZG93LnNldFRpbWVvdXQjSW5hY3RpdmVfdGFicy5cbiAgICAgICAgICBpZiAobWF4ZWRPdXQpIHtcbiAgICAgICAgICAgIC8vIFJlc2V0IHRoZSBgaW5pdENvdW50YCBpbiBjYXNlIHRoZSBiZW5jaG1hcmsgaXMgcmVydW4uXG4gICAgICAgICAgICBiZW5jaC5pbml0Q291bnQgPSBpbml0Q291bnQ7XG4gICAgICAgICAgICBiZW5jaC5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgICAgIHRpbWVzLmVsYXBzZWQgPSAobm93IC0gdGltZXMudGltZVN0YW1wKSAvIDFlMztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGJlbmNoLmh6ICE9IEluZmluaXR5KSB7XG4gICAgICAgICAgICBiZW5jaC5oeiA9IDEgLyBtZWFuO1xuICAgICAgICAgICAgdGltZXMuY3ljbGUgPSBtZWFuICogYmVuY2guY291bnQ7XG4gICAgICAgICAgICB0aW1lcy5wZXJpb2QgPSBtZWFuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBJZiB0aW1lIHBlcm1pdHMsIGluY3JlYXNlIHNhbXBsZSBzaXplIHRvIHJlZHVjZSB0aGUgbWFyZ2luIG9mIGVycm9yLlxuICAgICAgICBpZiAocXVldWUubGVuZ3RoIDwgMiAmJiAhbWF4ZWRPdXQpIHtcbiAgICAgICAgICBlbnF1ZXVlKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWJvcnQgdGhlIGBpbnZva2VgIGN5Y2xlIHdoZW4gZG9uZS5cbiAgICAgICAgZXZlbnQuYWJvcnRlZCA9IGRvbmU7XG4gICAgICB9XG5cbiAgICAgIC8vIEluaXQgcXVldWUgYW5kIGJlZ2luLlxuICAgICAgZW5xdWV1ZSgpO1xuICAgICAgaW52b2tlKHF1ZXVlLCB7XG4gICAgICAgICduYW1lJzogJ3J1bicsXG4gICAgICAgICdhcmdzJzogeyAnYXN5bmMnOiBhc3luYyB9LFxuICAgICAgICAncXVldWVkJzogdHJ1ZSxcbiAgICAgICAgJ29uQ3ljbGUnOiBldmFsdWF0ZSxcbiAgICAgICAgJ29uQ29tcGxldGUnOiBmdW5jdGlvbigpIHsgYmVuY2guZW1pdCgnY29tcGxldGUnKTsgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgLyoqXG4gICAgICogQ3ljbGVzIGEgYmVuY2htYXJrIHVudGlsIGEgcnVuIGBjb3VudGAgY2FuIGJlIGVzdGFibGlzaGVkLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY2xvbmUgVGhlIGNsb25lZCBiZW5jaG1hcmsgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgVGhlIG9wdGlvbnMgb2JqZWN0LlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGN5Y2xlKGNsb25lLCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuXG4gICAgICB2YXIgZGVmZXJyZWQ7XG4gICAgICBpZiAoY2xvbmUgaW5zdGFuY2VvZiBEZWZlcnJlZCkge1xuICAgICAgICBkZWZlcnJlZCA9IGNsb25lO1xuICAgICAgICBjbG9uZSA9IGNsb25lLmJlbmNobWFyaztcbiAgICAgIH1cbiAgICAgIHZhciBjbG9ja2VkLFxuICAgICAgICAgIGN5Y2xlcyxcbiAgICAgICAgICBkaXZpc29yLFxuICAgICAgICAgIGV2ZW50LFxuICAgICAgICAgIG1pblRpbWUsXG4gICAgICAgICAgcGVyaW9kLFxuICAgICAgICAgIGFzeW5jID0gb3B0aW9ucy5hc3luYyxcbiAgICAgICAgICBiZW5jaCA9IGNsb25lLl9vcmlnaW5hbCxcbiAgICAgICAgICBjb3VudCA9IGNsb25lLmNvdW50LFxuICAgICAgICAgIHRpbWVzID0gY2xvbmUudGltZXM7XG5cbiAgICAgIC8vIENvbnRpbnVlLCBpZiBub3QgYWJvcnRlZCBiZXR3ZWVuIGN5Y2xlcy5cbiAgICAgIGlmIChjbG9uZS5ydW5uaW5nKSB7XG4gICAgICAgIC8vIGBtaW5UaW1lYCBpcyBzZXQgdG8gYEJlbmNobWFyay5vcHRpb25zLm1pblRpbWVgIGluIGBjbG9jaygpYC5cbiAgICAgICAgY3ljbGVzID0gKytjbG9uZS5jeWNsZXM7XG4gICAgICAgIGNsb2NrZWQgPSBkZWZlcnJlZCA/IGRlZmVycmVkLmVsYXBzZWQgOiBjbG9jayhjbG9uZSk7XG4gICAgICAgIG1pblRpbWUgPSBjbG9uZS5taW5UaW1lO1xuXG4gICAgICAgIGlmIChjeWNsZXMgPiBiZW5jaC5jeWNsZXMpIHtcbiAgICAgICAgICBiZW5jaC5jeWNsZXMgPSBjeWNsZXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNsb25lLmVycm9yKSB7XG4gICAgICAgICAgZXZlbnQgPSBFdmVudCgnZXJyb3InKTtcbiAgICAgICAgICBldmVudC5tZXNzYWdlID0gY2xvbmUuZXJyb3I7XG4gICAgICAgICAgY2xvbmUuZW1pdChldmVudCk7XG4gICAgICAgICAgaWYgKCFldmVudC5jYW5jZWxsZWQpIHtcbiAgICAgICAgICAgIGNsb25lLmFib3J0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBDb250aW51ZSwgaWYgbm90IGVycm9yZWQuXG4gICAgICBpZiAoY2xvbmUucnVubmluZykge1xuICAgICAgICAvLyBDb21wdXRlIHRoZSB0aW1lIHRha2VuIHRvIGNvbXBsZXRlIGxhc3QgdGVzdCBjeWNsZS5cbiAgICAgICAgYmVuY2gudGltZXMuY3ljbGUgPSB0aW1lcy5jeWNsZSA9IGNsb2NrZWQ7XG4gICAgICAgIC8vIENvbXB1dGUgdGhlIHNlY29uZHMgcGVyIG9wZXJhdGlvbi5cbiAgICAgICAgcGVyaW9kID0gYmVuY2gudGltZXMucGVyaW9kID0gdGltZXMucGVyaW9kID0gY2xvY2tlZCAvIGNvdW50O1xuICAgICAgICAvLyBDb21wdXRlIHRoZSBvcHMgcGVyIHNlY29uZC5cbiAgICAgICAgYmVuY2guaHogPSBjbG9uZS5oeiA9IDEgLyBwZXJpb2Q7XG4gICAgICAgIC8vIEF2b2lkIHdvcmtpbmcgb3VyIHdheSB1cCB0byB0aGlzIG5leHQgdGltZS5cbiAgICAgICAgYmVuY2guaW5pdENvdW50ID0gY2xvbmUuaW5pdENvdW50ID0gY291bnQ7XG4gICAgICAgIC8vIERvIHdlIG5lZWQgdG8gZG8gYW5vdGhlciBjeWNsZT9cbiAgICAgICAgY2xvbmUucnVubmluZyA9IGNsb2NrZWQgPCBtaW5UaW1lO1xuXG4gICAgICAgIGlmIChjbG9uZS5ydW5uaW5nKSB7XG4gICAgICAgICAgLy8gVGVzdHMgbWF5IGNsb2NrIGF0IGAwYCB3aGVuIGBpbml0Q291bnRgIGlzIGEgc21hbGwgbnVtYmVyLFxuICAgICAgICAgIC8vIHRvIGF2b2lkIHRoYXQgd2Ugc2V0IGl0cyBjb3VudCB0byBzb21ldGhpbmcgYSBiaXQgaGlnaGVyLlxuICAgICAgICAgIGlmICghY2xvY2tlZCAmJiAoZGl2aXNvciA9IGRpdmlzb3JzW2Nsb25lLmN5Y2xlc10pICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNvdW50ID0gZmxvb3IoNGU2IC8gZGl2aXNvcik7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIENhbGN1bGF0ZSBob3cgbWFueSBtb3JlIGl0ZXJhdGlvbnMgaXQgd2lsbCB0YWtlIHRvIGFjaGlldmUgdGhlIGBtaW5UaW1lYC5cbiAgICAgICAgICBpZiAoY291bnQgPD0gY2xvbmUuY291bnQpIHtcbiAgICAgICAgICAgIGNvdW50ICs9IE1hdGguY2VpbCgobWluVGltZSAtIGNsb2NrZWQpIC8gcGVyaW9kKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2xvbmUucnVubmluZyA9IGNvdW50ICE9IEluZmluaXR5O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBTaG91bGQgd2UgZXhpdCBlYXJseT9cbiAgICAgIGV2ZW50ID0gRXZlbnQoJ2N5Y2xlJyk7XG4gICAgICBjbG9uZS5lbWl0KGV2ZW50KTtcbiAgICAgIGlmIChldmVudC5hYm9ydGVkKSB7XG4gICAgICAgIGNsb25lLmFib3J0KCk7XG4gICAgICB9XG4gICAgICAvLyBGaWd1cmUgb3V0IHdoYXQgdG8gZG8gbmV4dC5cbiAgICAgIGlmIChjbG9uZS5ydW5uaW5nKSB7XG4gICAgICAgIC8vIFN0YXJ0IGEgbmV3IGN5Y2xlLlxuICAgICAgICBjbG9uZS5jb3VudCA9IGNvdW50O1xuICAgICAgICBpZiAoZGVmZXJyZWQpIHtcbiAgICAgICAgICBjbG9uZS5jb21waWxlZC5jYWxsKGRlZmVycmVkLCBjb250ZXh0LCB0aW1lcik7XG4gICAgICAgIH0gZWxzZSBpZiAoYXN5bmMpIHtcbiAgICAgICAgICBkZWxheShjbG9uZSwgZnVuY3Rpb24oKSB7IGN5Y2xlKGNsb25lLCBvcHRpb25zKTsgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY3ljbGUoY2xvbmUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gRml4IFRyYWNlTW9ua2V5IGJ1ZyBhc3NvY2lhdGVkIHdpdGggY2xvY2sgZmFsbGJhY2tzLlxuICAgICAgICAvLyBGb3IgbW9yZSBpbmZvcm1hdGlvbiBzZWUgaHR0cDovL2J1Z3ppbC5sYS81MDkwNjkuXG4gICAgICAgIGlmIChzdXBwb3J0LmJyb3dzZXIpIHtcbiAgICAgICAgICBydW5TY3JpcHQodWlkICsgJz0xO2RlbGV0ZSAnICsgdWlkKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBXZSdyZSBkb25lLlxuICAgICAgICBjbG9uZS5lbWl0KCdjb21wbGV0ZScpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIC8qKlxuICAgICAqIFJ1bnMgdGhlIGJlbmNobWFyay5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIE9wdGlvbnMgb2JqZWN0LlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBiZW5jaG1hcmsgaW5zdGFuY2UuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIC8vIGJhc2ljIHVzYWdlXG4gICAgICogYmVuY2gucnVuKCk7XG4gICAgICpcbiAgICAgKiAvLyBvciB3aXRoIG9wdGlvbnNcbiAgICAgKiBiZW5jaC5ydW4oeyAnYXN5bmMnOiB0cnVlIH0pO1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJ1bihvcHRpb25zKSB7XG4gICAgICB2YXIgYmVuY2ggPSB0aGlzLFxuICAgICAgICAgIGV2ZW50ID0gRXZlbnQoJ3N0YXJ0Jyk7XG5cbiAgICAgIC8vIFNldCBgcnVubmluZ2AgdG8gYGZhbHNlYCBzbyBgcmVzZXQoKWAgd29uJ3QgY2FsbCBgYWJvcnQoKWAuXG4gICAgICBiZW5jaC5ydW5uaW5nID0gZmFsc2U7XG4gICAgICBiZW5jaC5yZXNldCgpO1xuICAgICAgYmVuY2gucnVubmluZyA9IHRydWU7XG5cbiAgICAgIGJlbmNoLmNvdW50ID0gYmVuY2guaW5pdENvdW50O1xuICAgICAgYmVuY2gudGltZXMudGltZVN0YW1wID0gXy5ub3coKTtcbiAgICAgIGJlbmNoLmVtaXQoZXZlbnQpO1xuXG4gICAgICBpZiAoIWV2ZW50LmNhbmNlbGxlZCkge1xuICAgICAgICBvcHRpb25zID0geyAnYXN5bmMnOiAoKG9wdGlvbnMgPSBvcHRpb25zICYmIG9wdGlvbnMuYXN5bmMpID09IG51bGwgPyBiZW5jaC5hc3luYyA6IG9wdGlvbnMpICYmIHN1cHBvcnQudGltZW91dCB9O1xuXG4gICAgICAgIC8vIEZvciBjbG9uZXMgY3JlYXRlZCB3aXRoaW4gYGNvbXB1dGUoKWAuXG4gICAgICAgIGlmIChiZW5jaC5fb3JpZ2luYWwpIHtcbiAgICAgICAgICBpZiAoYmVuY2guZGVmZXIpIHtcbiAgICAgICAgICAgIERlZmVycmVkKGJlbmNoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY3ljbGUoYmVuY2gsIG9wdGlvbnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBGb3Igb3JpZ2luYWwgYmVuY2htYXJrcy5cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgY29tcHV0ZShiZW5jaCwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBiZW5jaDtcbiAgICB9XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvLyBGaXJlZm94IDEgZXJyb25lb3VzbHkgZGVmaW5lcyB2YXJpYWJsZSBhbmQgYXJndW1lbnQgbmFtZXMgb2YgZnVuY3Rpb25zIG9uXG4gICAgLy8gdGhlIGZ1bmN0aW9uIGl0c2VsZiBhcyBub24tY29uZmlndXJhYmxlIHByb3BlcnRpZXMgd2l0aCBgdW5kZWZpbmVkYCB2YWx1ZXMuXG4gICAgLy8gVGhlIGJ1Z2dpbmVzcyBjb250aW51ZXMgYXMgdGhlIGBCZW5jaG1hcmtgIGNvbnN0cnVjdG9yIGhhcyBhbiBhcmd1bWVudFxuICAgIC8vIG5hbWVkIGBvcHRpb25zYCBhbmQgRmlyZWZveCAxIHdpbGwgbm90IGFzc2lnbiBhIHZhbHVlIHRvIGBCZW5jaG1hcmsub3B0aW9uc2AsXG4gICAgLy8gbWFraW5nIGl0IG5vbi13cml0YWJsZSBpbiB0aGUgcHJvY2VzcywgdW5sZXNzIGl0IGlzIHRoZSBmaXJzdCBwcm9wZXJ0eVxuICAgIC8vIGFzc2lnbmVkIGJ5IGZvci1pbiBsb29wIG9mIGBfLmFzc2lnbigpYC5cbiAgICBfLmFzc2lnbihCZW5jaG1hcmssIHtcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgZGVmYXVsdCBvcHRpb25zIGNvcGllZCBieSBiZW5jaG1hcmsgaW5zdGFuY2VzLlxuICAgICAgICpcbiAgICAgICAqIEBzdGF0aWNcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICovXG4gICAgICAnb3B0aW9ucyc6IHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQSBmbGFnIHRvIGluZGljYXRlIHRoYXQgYmVuY2htYXJrIGN5Y2xlcyB3aWxsIGV4ZWN1dGUgYXN5bmNocm9ub3VzbHlcbiAgICAgICAgICogYnkgZGVmYXVsdC5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyay5vcHRpb25zXG4gICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgICovXG4gICAgICAgICdhc3luYyc6IGZhbHNlLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBIGZsYWcgdG8gaW5kaWNhdGUgdGhhdCB0aGUgYmVuY2htYXJrIGNsb2NrIGlzIGRlZmVycmVkLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLm9wdGlvbnNcbiAgICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAgKi9cbiAgICAgICAgJ2RlZmVyJzogZmFsc2UsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBkZWxheSBiZXR3ZWVuIHRlc3QgY3ljbGVzIChzZWNzKS5cbiAgICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyay5vcHRpb25zXG4gICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAgKi9cbiAgICAgICAgJ2RlbGF5JzogMC4wMDUsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERpc3BsYXllZCBieSBgQmVuY2htYXJrI3RvU3RyaW5nYCB3aGVuIGEgYG5hbWVgIGlzIG5vdCBhdmFpbGFibGVcbiAgICAgICAgICogKGF1dG8tZ2VuZXJhdGVkIGlmIGFic2VudCkuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsub3B0aW9uc1xuICAgICAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgICAgICovXG4gICAgICAgICdpZCc6IHVuZGVmaW5lZCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGRlZmF1bHQgbnVtYmVyIG9mIHRpbWVzIHRvIGV4ZWN1dGUgYSB0ZXN0IG9uIGEgYmVuY2htYXJrJ3MgZmlyc3QgY3ljbGUuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsub3B0aW9uc1xuICAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgICovXG4gICAgICAgICdpbml0Q291bnQnOiAxLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgbWF4aW11bSB0aW1lIGEgYmVuY2htYXJrIGlzIGFsbG93ZWQgdG8gcnVuIGJlZm9yZSBmaW5pc2hpbmcgKHNlY3MpLlxuICAgICAgICAgKlxuICAgICAgICAgKiBOb3RlOiBDeWNsZSBkZWxheXMgYXJlbid0IGNvdW50ZWQgdG93YXJkIHRoZSBtYXhpbXVtIHRpbWUuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsub3B0aW9uc1xuICAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgICovXG4gICAgICAgICdtYXhUaW1lJzogNSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIG1pbmltdW0gc2FtcGxlIHNpemUgcmVxdWlyZWQgdG8gcGVyZm9ybSBzdGF0aXN0aWNhbCBhbmFseXNpcy5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyay5vcHRpb25zXG4gICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAgKi9cbiAgICAgICAgJ21pblNhbXBsZXMnOiA1LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgdGltZSBuZWVkZWQgdG8gcmVkdWNlIHRoZSBwZXJjZW50IHVuY2VydGFpbnR5IG9mIG1lYXN1cmVtZW50IHRvIDElIChzZWNzKS5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyay5vcHRpb25zXG4gICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAgKi9cbiAgICAgICAgJ21pblRpbWUnOiAwLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgbmFtZSBvZiB0aGUgYmVuY2htYXJrLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLm9wdGlvbnNcbiAgICAgICAgICogQHR5cGUgc3RyaW5nXG4gICAgICAgICAqL1xuICAgICAgICAnbmFtZSc6IHVuZGVmaW5lZCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQW4gZXZlbnQgbGlzdGVuZXIgY2FsbGVkIHdoZW4gdGhlIGJlbmNobWFyayBpcyBhYm9ydGVkLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLm9wdGlvbnNcbiAgICAgICAgICogQHR5cGUgRnVuY3Rpb25cbiAgICAgICAgICovXG4gICAgICAgICdvbkFib3J0JzogdW5kZWZpbmVkLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBbiBldmVudCBsaXN0ZW5lciBjYWxsZWQgd2hlbiB0aGUgYmVuY2htYXJrIGNvbXBsZXRlcyBydW5uaW5nLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLm9wdGlvbnNcbiAgICAgICAgICogQHR5cGUgRnVuY3Rpb25cbiAgICAgICAgICovXG4gICAgICAgICdvbkNvbXBsZXRlJzogdW5kZWZpbmVkLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBbiBldmVudCBsaXN0ZW5lciBjYWxsZWQgYWZ0ZXIgZWFjaCBydW4gY3ljbGUuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsub3B0aW9uc1xuICAgICAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAgICAgKi9cbiAgICAgICAgJ29uQ3ljbGUnOiB1bmRlZmluZWQsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFuIGV2ZW50IGxpc3RlbmVyIGNhbGxlZCB3aGVuIGEgdGVzdCBlcnJvcnMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsub3B0aW9uc1xuICAgICAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAgICAgKi9cbiAgICAgICAgJ29uRXJyb3InOiB1bmRlZmluZWQsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFuIGV2ZW50IGxpc3RlbmVyIGNhbGxlZCB3aGVuIHRoZSBiZW5jaG1hcmsgaXMgcmVzZXQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsub3B0aW9uc1xuICAgICAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAgICAgKi9cbiAgICAgICAgJ29uUmVzZXQnOiB1bmRlZmluZWQsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFuIGV2ZW50IGxpc3RlbmVyIGNhbGxlZCB3aGVuIHRoZSBiZW5jaG1hcmsgc3RhcnRzIHJ1bm5pbmcuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsub3B0aW9uc1xuICAgICAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAgICAgKi9cbiAgICAgICAgJ29uU3RhcnQnOiB1bmRlZmluZWRcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogUGxhdGZvcm0gb2JqZWN0IHdpdGggcHJvcGVydGllcyBkZXNjcmliaW5nIHRoaW5ncyBsaWtlIGJyb3dzZXIgbmFtZSxcbiAgICAgICAqIHZlcnNpb24sIGFuZCBvcGVyYXRpbmcgc3lzdGVtLiBTZWUgW2BwbGF0Zm9ybS5qc2BdKGh0dHBzOi8vbXRocy5iZS9wbGF0Zm9ybSkuXG4gICAgICAgKlxuICAgICAgICogQHN0YXRpY1xuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgKi9cbiAgICAgICdwbGF0Zm9ybSc6IGNvbnRleHQucGxhdGZvcm0gfHwgcmVxdWlyZSgncGxhdGZvcm0nKSB8fCAoe1xuICAgICAgICAnZGVzY3JpcHRpb24nOiBjb250ZXh0Lm5hdmlnYXRvciAmJiBjb250ZXh0Lm5hdmlnYXRvci51c2VyQWdlbnQgfHwgbnVsbCxcbiAgICAgICAgJ2xheW91dCc6IG51bGwsXG4gICAgICAgICdwcm9kdWN0JzogbnVsbCxcbiAgICAgICAgJ25hbWUnOiBudWxsLFxuICAgICAgICAnbWFudWZhY3R1cmVyJzogbnVsbCxcbiAgICAgICAgJ29zJzogbnVsbCxcbiAgICAgICAgJ3ByZXJlbGVhc2UnOiBudWxsLFxuICAgICAgICAndmVyc2lvbic6IG51bGwsXG4gICAgICAgICd0b1N0cmluZyc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmRlc2NyaXB0aW9uIHx8ICcnO1xuICAgICAgICB9XG4gICAgICB9KSxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgc2VtYW50aWMgdmVyc2lvbiBudW1iZXIuXG4gICAgICAgKlxuICAgICAgICogQHN0YXRpY1xuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgICAgICogQHR5cGUgc3RyaW5nXG4gICAgICAgKi9cbiAgICAgICd2ZXJzaW9uJzogJzIuMS40J1xuICAgIH0pO1xuXG4gICAgXy5hc3NpZ24oQmVuY2htYXJrLCB7XG4gICAgICAnZmlsdGVyJzogZmlsdGVyLFxuICAgICAgJ2Zvcm1hdE51bWJlcic6IGZvcm1hdE51bWJlcixcbiAgICAgICdpbnZva2UnOiBpbnZva2UsXG4gICAgICAnam9pbic6IGpvaW4sXG4gICAgICAncnVuSW5Db250ZXh0JzogcnVuSW5Db250ZXh0LFxuICAgICAgJ3N1cHBvcnQnOiBzdXBwb3J0XG4gICAgfSk7XG5cbiAgICAvLyBBZGQgbG9kYXNoIG1ldGhvZHMgdG8gQmVuY2htYXJrLlxuICAgIF8uZWFjaChbJ2VhY2gnLCAnZm9yRWFjaCcsICdmb3JPd24nLCAnaGFzJywgJ2luZGV4T2YnLCAnbWFwJywgJ3JlZHVjZSddLCBmdW5jdGlvbihtZXRob2ROYW1lKSB7XG4gICAgICBCZW5jaG1hcmtbbWV0aG9kTmFtZV0gPSBfW21ldGhvZE5hbWVdO1xuICAgIH0pO1xuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgXy5hc3NpZ24oQmVuY2htYXJrLnByb3RvdHlwZSwge1xuXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBudW1iZXIgb2YgdGltZXMgYSB0ZXN0IHdhcyBleGVjdXRlZC5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAqL1xuICAgICAgJ2NvdW50JzogMCxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgbnVtYmVyIG9mIGN5Y2xlcyBwZXJmb3JtZWQgd2hpbGUgYmVuY2htYXJraW5nLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICovXG4gICAgICAnY3ljbGVzJzogMCxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgbnVtYmVyIG9mIGV4ZWN1dGlvbnMgcGVyIHNlY29uZC5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAqL1xuICAgICAgJ2h6JzogMCxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgY29tcGlsZWQgdGVzdCBmdW5jdGlvbi5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAgICAgKiBAdHlwZSB7RnVuY3Rpb258c3RyaW5nfVxuICAgICAgICovXG4gICAgICAnY29tcGlsZWQnOiB1bmRlZmluZWQsXG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIGVycm9yIG9iamVjdCBpZiB0aGUgdGVzdCBmYWlsZWQuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgKi9cbiAgICAgICdlcnJvcic6IHVuZGVmaW5lZCxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgdGVzdCB0byBiZW5jaG1hcmsuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgICAgICogQHR5cGUge0Z1bmN0aW9ufHN0cmluZ31cbiAgICAgICAqL1xuICAgICAgJ2ZuJzogdW5kZWZpbmVkLFxuXG4gICAgICAvKipcbiAgICAgICAqIEEgZmxhZyB0byBpbmRpY2F0ZSBpZiB0aGUgYmVuY2htYXJrIGlzIGFib3J0ZWQuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICovXG4gICAgICAnYWJvcnRlZCc6IGZhbHNlLFxuXG4gICAgICAvKipcbiAgICAgICAqIEEgZmxhZyB0byBpbmRpY2F0ZSBpZiB0aGUgYmVuY2htYXJrIGlzIHJ1bm5pbmcuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICovXG4gICAgICAncnVubmluZyc6IGZhbHNlLFxuXG4gICAgICAvKipcbiAgICAgICAqIENvbXBpbGVkIGludG8gdGhlIHRlc3QgYW5kIGV4ZWN1dGVkIGltbWVkaWF0ZWx5ICoqYmVmb3JlKiogdGhlIHRlc3QgbG9vcC5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAgICAgKiBAdHlwZSB7RnVuY3Rpb258c3RyaW5nfVxuICAgICAgICogQGV4YW1wbGVcbiAgICAgICAqXG4gICAgICAgKiAvLyBiYXNpYyB1c2FnZVxuICAgICAgICogdmFyIGJlbmNoID0gQmVuY2htYXJrKHtcbiAgICAgICAqICAgJ3NldHVwJzogZnVuY3Rpb24oKSB7XG4gICAgICAgKiAgICAgdmFyIGMgPSB0aGlzLmNvdW50LFxuICAgICAgICogICAgICAgICBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lcicpO1xuICAgICAgICogICAgIHdoaWxlIChjLS0pIHtcbiAgICAgICAqICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpO1xuICAgICAgICogICAgIH1cbiAgICAgICAqICAgfSxcbiAgICAgICAqICAgJ2ZuJzogZnVuY3Rpb24oKSB7XG4gICAgICAgKiAgICAgZWxlbWVudC5yZW1vdmVDaGlsZChlbGVtZW50Lmxhc3RDaGlsZCk7XG4gICAgICAgKiAgIH1cbiAgICAgICAqIH0pO1xuICAgICAgICpcbiAgICAgICAqIC8vIGNvbXBpbGVzIHRvIHNvbWV0aGluZyBsaWtlOlxuICAgICAgICogdmFyIGMgPSB0aGlzLmNvdW50LFxuICAgICAgICogICAgIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XG4gICAgICAgKiB3aGlsZSAoYy0tKSB7XG4gICAgICAgKiAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpO1xuICAgICAgICogfVxuICAgICAgICogdmFyIHN0YXJ0ID0gbmV3IERhdGU7XG4gICAgICAgKiB3aGlsZSAoY291bnQtLSkge1xuICAgICAgICogICBlbGVtZW50LnJlbW92ZUNoaWxkKGVsZW1lbnQubGFzdENoaWxkKTtcbiAgICAgICAqIH1cbiAgICAgICAqIHZhciBlbmQgPSBuZXcgRGF0ZSAtIHN0YXJ0O1xuICAgICAgICpcbiAgICAgICAqIC8vIG9yIHVzaW5nIHN0cmluZ3NcbiAgICAgICAqIHZhciBiZW5jaCA9IEJlbmNobWFyayh7XG4gICAgICAgKiAgICdzZXR1cCc6ICdcXFxuICAgICAgICogICAgIHZhciBhID0gMDtcXG5cXFxuICAgICAgICogICAgIChmdW5jdGlvbigpIHtcXG5cXFxuICAgICAgICogICAgICAgKGZ1bmN0aW9uKCkge1xcblxcXG4gICAgICAgKiAgICAgICAgIChmdW5jdGlvbigpIHsnLFxuICAgICAgICogICAnZm4nOiAnYSArPSAxOycsXG4gICAgICAgKiAgICd0ZWFyZG93bic6ICdcXFxuICAgICAgICogICAgICAgICAgfSgpKVxcblxcXG4gICAgICAgKiAgICAgICAgfSgpKVxcblxcXG4gICAgICAgKiAgICAgIH0oKSknXG4gICAgICAgKiB9KTtcbiAgICAgICAqXG4gICAgICAgKiAvLyBjb21waWxlcyB0byBzb21ldGhpbmcgbGlrZTpcbiAgICAgICAqIHZhciBhID0gMDtcbiAgICAgICAqIChmdW5jdGlvbigpIHtcbiAgICAgICAqICAgKGZ1bmN0aW9uKCkge1xuICAgICAgICogICAgIChmdW5jdGlvbigpIHtcbiAgICAgICAqICAgICAgIHZhciBzdGFydCA9IG5ldyBEYXRlO1xuICAgICAgICogICAgICAgd2hpbGUgKGNvdW50LS0pIHtcbiAgICAgICAqICAgICAgICAgYSArPSAxO1xuICAgICAgICogICAgICAgfVxuICAgICAgICogICAgICAgdmFyIGVuZCA9IG5ldyBEYXRlIC0gc3RhcnQ7XG4gICAgICAgKiAgICAgfSgpKVxuICAgICAgICogICB9KCkpXG4gICAgICAgKiB9KCkpXG4gICAgICAgKi9cbiAgICAgICdzZXR1cCc6IF8ubm9vcCxcblxuICAgICAgLyoqXG4gICAgICAgKiBDb21waWxlZCBpbnRvIHRoZSB0ZXN0IGFuZCBleGVjdXRlZCBpbW1lZGlhdGVseSAqKmFmdGVyKiogdGhlIHRlc3QgbG9vcC5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAgICAgKiBAdHlwZSB7RnVuY3Rpb258c3RyaW5nfVxuICAgICAgICovXG4gICAgICAndGVhcmRvd24nOiBfLm5vb3AsXG5cbiAgICAgIC8qKlxuICAgICAgICogQW4gb2JqZWN0IG9mIHN0YXRzIGluY2x1ZGluZyBtZWFuLCBtYXJnaW4gb3IgZXJyb3IsIGFuZCBzdGFuZGFyZCBkZXZpYXRpb24uXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgKi9cbiAgICAgICdzdGF0cyc6IHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIG1hcmdpbiBvZiBlcnJvci5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyayNzdGF0c1xuICAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgICovXG4gICAgICAgICdtb2UnOiAwLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgcmVsYXRpdmUgbWFyZ2luIG9mIGVycm9yIChleHByZXNzZWQgYXMgYSBwZXJjZW50YWdlIG9mIHRoZSBtZWFuKS5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyayNzdGF0c1xuICAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgICovXG4gICAgICAgICdybWUnOiAwLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgc3RhbmRhcmQgZXJyb3Igb2YgdGhlIG1lYW4uXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsjc3RhdHNcbiAgICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICAqL1xuICAgICAgICAnc2VtJzogMCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIHNhbXBsZSBzdGFuZGFyZCBkZXZpYXRpb24uXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsjc3RhdHNcbiAgICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICAqL1xuICAgICAgICAnZGV2aWF0aW9uJzogMCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIHNhbXBsZSBhcml0aG1ldGljIG1lYW4gKHNlY3MpLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrI3N0YXRzXG4gICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAgKi9cbiAgICAgICAgJ21lYW4nOiAwLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgYXJyYXkgb2Ygc2FtcGxlZCBwZXJpb2RzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrI3N0YXRzXG4gICAgICAgICAqIEB0eXBlIEFycmF5XG4gICAgICAgICAqL1xuICAgICAgICAnc2FtcGxlJzogW10sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBzYW1wbGUgdmFyaWFuY2UuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsjc3RhdHNcbiAgICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICAqL1xuICAgICAgICAndmFyaWFuY2UnOiAwXG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIEFuIG9iamVjdCBvZiB0aW1pbmcgZGF0YSBpbmNsdWRpbmcgY3ljbGUsIGVsYXBzZWQsIHBlcmlvZCwgc3RhcnQsIGFuZCBzdG9wLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICovXG4gICAgICAndGltZXMnOiB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSB0aW1lIHRha2VuIHRvIGNvbXBsZXRlIHRoZSBsYXN0IGN5Y2xlIChzZWNzKS5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyayN0aW1lc1xuICAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgICovXG4gICAgICAgICdjeWNsZSc6IDAsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSB0aW1lIHRha2VuIHRvIGNvbXBsZXRlIHRoZSBiZW5jaG1hcmsgKHNlY3MpLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrI3RpbWVzXG4gICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAgKi9cbiAgICAgICAgJ2VsYXBzZWQnOiAwLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgdGltZSB0YWtlbiB0byBleGVjdXRlIHRoZSB0ZXN0IG9uY2UgKHNlY3MpLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrI3RpbWVzXG4gICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAgKi9cbiAgICAgICAgJ3BlcmlvZCc6IDAsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEEgdGltZXN0YW1wIG9mIHdoZW4gdGhlIGJlbmNobWFyayBzdGFydGVkIChtcykuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsjdGltZXNcbiAgICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICAqL1xuICAgICAgICAndGltZVN0YW1wJzogMFxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgXy5hc3NpZ24oQmVuY2htYXJrLnByb3RvdHlwZSwge1xuICAgICAgJ2Fib3J0JzogYWJvcnQsXG4gICAgICAnY2xvbmUnOiBjbG9uZSxcbiAgICAgICdjb21wYXJlJzogY29tcGFyZSxcbiAgICAgICdlbWl0JzogZW1pdCxcbiAgICAgICdsaXN0ZW5lcnMnOiBsaXN0ZW5lcnMsXG4gICAgICAnb2ZmJzogb2ZmLFxuICAgICAgJ29uJzogb24sXG4gICAgICAncmVzZXQnOiByZXNldCxcbiAgICAgICdydW4nOiBydW4sXG4gICAgICAndG9TdHJpbmcnOiB0b1N0cmluZ0JlbmNoXG4gICAgfSk7XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICBfLmFzc2lnbihEZWZlcnJlZC5wcm90b3R5cGUsIHtcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgZGVmZXJyZWQgYmVuY2htYXJrIGluc3RhbmNlLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuRGVmZXJyZWRcbiAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICovXG4gICAgICAnYmVuY2htYXJrJzogbnVsbCxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgbnVtYmVyIG9mIGRlZmVycmVkIGN5Y2xlcyBwZXJmb3JtZWQgd2hpbGUgYmVuY2htYXJraW5nLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuRGVmZXJyZWRcbiAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICovXG4gICAgICAnY3ljbGVzJzogMCxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgdGltZSB0YWtlbiB0byBjb21wbGV0ZSB0aGUgZGVmZXJyZWQgYmVuY2htYXJrIChzZWNzKS5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLkRlZmVycmVkXG4gICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAqL1xuICAgICAgJ2VsYXBzZWQnOiAwLFxuXG4gICAgICAvKipcbiAgICAgICAqIEEgdGltZXN0YW1wIG9mIHdoZW4gdGhlIGRlZmVycmVkIGJlbmNobWFyayBzdGFydGVkIChtcykuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyay5EZWZlcnJlZFxuICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgKi9cbiAgICAgICd0aW1lU3RhbXAnOiAwXG4gICAgfSk7XG5cbiAgICBfLmFzc2lnbihEZWZlcnJlZC5wcm90b3R5cGUsIHtcbiAgICAgICdyZXNvbHZlJzogcmVzb2x2ZVxuICAgIH0pO1xuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgXy5hc3NpZ24oRXZlbnQucHJvdG90eXBlLCB7XG5cbiAgICAgIC8qKlxuICAgICAgICogQSBmbGFnIHRvIGluZGljYXRlIGlmIHRoZSBlbWl0dGVycyBsaXN0ZW5lciBpdGVyYXRpb24gaXMgYWJvcnRlZC5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLkV2ZW50XG4gICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgKi9cbiAgICAgICdhYm9ydGVkJzogZmFsc2UsXG5cbiAgICAgIC8qKlxuICAgICAgICogQSBmbGFnIHRvIGluZGljYXRlIGlmIHRoZSBkZWZhdWx0IGFjdGlvbiBpcyBjYW5jZWxsZWQuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyay5FdmVudFxuICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICovXG4gICAgICAnY2FuY2VsbGVkJzogZmFsc2UsXG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIG9iamVjdCB3aG9zZSBsaXN0ZW5lcnMgYXJlIGN1cnJlbnRseSBiZWluZyBwcm9jZXNzZWQuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyay5FdmVudFxuICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgKi9cbiAgICAgICdjdXJyZW50VGFyZ2V0JzogdW5kZWZpbmVkLFxuXG4gICAgICAvKipcbiAgICAgICAqIFRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGxhc3QgZXhlY3V0ZWQgbGlzdGVuZXIuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyay5FdmVudFxuICAgICAgICogQHR5cGUgTWl4ZWRcbiAgICAgICAqL1xuICAgICAgJ3Jlc3VsdCc6IHVuZGVmaW5lZCxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgb2JqZWN0IHRvIHdoaWNoIHRoZSBldmVudCB3YXMgb3JpZ2luYWxseSBlbWl0dGVkLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuRXZlbnRcbiAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICovXG4gICAgICAndGFyZ2V0JzogdW5kZWZpbmVkLFxuXG4gICAgICAvKipcbiAgICAgICAqIEEgdGltZXN0YW1wIG9mIHdoZW4gdGhlIGV2ZW50IHdhcyBjcmVhdGVkIChtcykuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyay5FdmVudFxuICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgKi9cbiAgICAgICd0aW1lU3RhbXAnOiAwLFxuXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBldmVudCB0eXBlLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuRXZlbnRcbiAgICAgICAqIEB0eXBlIHN0cmluZ1xuICAgICAgICovXG4gICAgICAndHlwZSc6ICcnXG4gICAgfSk7XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvKipcbiAgICAgKiBUaGUgZGVmYXVsdCBvcHRpb25zIGNvcGllZCBieSBzdWl0ZSBpbnN0YW5jZXMuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5TdWl0ZVxuICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAqL1xuICAgIFN1aXRlLm9wdGlvbnMgPSB7XG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIG5hbWUgb2YgdGhlIHN1aXRlLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGUub3B0aW9uc1xuICAgICAgICogQHR5cGUgc3RyaW5nXG4gICAgICAgKi9cbiAgICAgICduYW1lJzogdW5kZWZpbmVkXG4gICAgfTtcblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIF8uYXNzaWduKFN1aXRlLnByb3RvdHlwZSwge1xuXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBudW1iZXIgb2YgYmVuY2htYXJrcyBpbiB0aGUgc3VpdGUuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyay5TdWl0ZVxuICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgKi9cbiAgICAgICdsZW5ndGgnOiAwLFxuXG4gICAgICAvKipcbiAgICAgICAqIEEgZmxhZyB0byBpbmRpY2F0ZSBpZiB0aGUgc3VpdGUgaXMgYWJvcnRlZC5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLlN1aXRlXG4gICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgKi9cbiAgICAgICdhYm9ydGVkJzogZmFsc2UsXG5cbiAgICAgIC8qKlxuICAgICAgICogQSBmbGFnIHRvIGluZGljYXRlIGlmIHRoZSBzdWl0ZSBpcyBydW5uaW5nLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGVcbiAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAqL1xuICAgICAgJ3J1bm5pbmcnOiBmYWxzZVxuICAgIH0pO1xuXG4gICAgXy5hc3NpZ24oU3VpdGUucHJvdG90eXBlLCB7XG4gICAgICAnYWJvcnQnOiBhYm9ydFN1aXRlLFxuICAgICAgJ2FkZCc6IGFkZCxcbiAgICAgICdjbG9uZSc6IGNsb25lU3VpdGUsXG4gICAgICAnZW1pdCc6IGVtaXQsXG4gICAgICAnZmlsdGVyJzogZmlsdGVyU3VpdGUsXG4gICAgICAnam9pbic6IGFycmF5UmVmLmpvaW4sXG4gICAgICAnbGlzdGVuZXJzJzogbGlzdGVuZXJzLFxuICAgICAgJ29mZic6IG9mZixcbiAgICAgICdvbic6IG9uLFxuICAgICAgJ3BvcCc6IGFycmF5UmVmLnBvcCxcbiAgICAgICdwdXNoJzogcHVzaCxcbiAgICAgICdyZXNldCc6IHJlc2V0U3VpdGUsXG4gICAgICAncnVuJzogcnVuU3VpdGUsXG4gICAgICAncmV2ZXJzZSc6IGFycmF5UmVmLnJldmVyc2UsXG4gICAgICAnc2hpZnQnOiBzaGlmdCxcbiAgICAgICdzbGljZSc6IHNsaWNlLFxuICAgICAgJ3NvcnQnOiBhcnJheVJlZi5zb3J0LFxuICAgICAgJ3NwbGljZSc6IGFycmF5UmVmLnNwbGljZSxcbiAgICAgICd1bnNoaWZ0JzogdW5zaGlmdFxuICAgIH0pO1xuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgLy8gRXhwb3NlIERlZmVycmVkLCBFdmVudCwgYW5kIFN1aXRlLlxuICAgIF8uYXNzaWduKEJlbmNobWFyaywge1xuICAgICAgJ0RlZmVycmVkJzogRGVmZXJyZWQsXG4gICAgICAnRXZlbnQnOiBFdmVudCxcbiAgICAgICdTdWl0ZSc6IFN1aXRlXG4gICAgfSk7XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvLyBBZGQgbG9kYXNoIG1ldGhvZHMgYXMgU3VpdGUgbWV0aG9kcy5cbiAgICBfLmVhY2goWydlYWNoJywgJ2ZvckVhY2gnLCAnaW5kZXhPZicsICdtYXAnLCAncmVkdWNlJ10sIGZ1bmN0aW9uKG1ldGhvZE5hbWUpIHtcbiAgICAgIHZhciBmdW5jID0gX1ttZXRob2ROYW1lXTtcbiAgICAgIFN1aXRlLnByb3RvdHlwZVttZXRob2ROYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXJncyA9IFt0aGlzXTtcbiAgICAgICAgcHVzaC5hcHBseShhcmdzLCBhcmd1bWVudHMpO1xuICAgICAgICByZXR1cm4gZnVuYy5hcHBseShfLCBhcmdzKTtcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICAvLyBBdm9pZCBhcnJheS1saWtlIG9iamVjdCBidWdzIHdpdGggYEFycmF5I3NoaWZ0YCBhbmQgYEFycmF5I3NwbGljZWBcbiAgICAvLyBpbiBGaXJlZm94IDwgMTAgYW5kIElFIDwgOS5cbiAgICBfLmVhY2goWydwb3AnLCAnc2hpZnQnLCAnc3BsaWNlJ10sIGZ1bmN0aW9uKG1ldGhvZE5hbWUpIHtcbiAgICAgIHZhciBmdW5jID0gYXJyYXlSZWZbbWV0aG9kTmFtZV07XG5cbiAgICAgIFN1aXRlLnByb3RvdHlwZVttZXRob2ROYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLFxuICAgICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseSh2YWx1ZSwgYXJndW1lbnRzKTtcblxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgZGVsZXRlIHZhbHVlWzBdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgLy8gQXZvaWQgYnVnZ3kgYEFycmF5I3Vuc2hpZnRgIGluIElFIDwgOCB3aGljaCBkb2Vzbid0IHJldHVybiB0aGUgbmV3XG4gICAgLy8gbGVuZ3RoIG9mIHRoZSBhcnJheS5cbiAgICBTdWl0ZS5wcm90b3R5cGUudW5zaGlmdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHZhbHVlID0gdGhpcztcbiAgICAgIHVuc2hpZnQuYXBwbHkodmFsdWUsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gdmFsdWUubGVuZ3RoO1xuICAgIH07XG5cbiAgICByZXR1cm4gQmVuY2htYXJrO1xuICB9XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLy8gRXhwb3J0IEJlbmNobWFyay5cbiAgLy8gU29tZSBBTUQgYnVpbGQgb3B0aW1pemVycywgbGlrZSByLmpzLCBjaGVjayBmb3IgY29uZGl0aW9uIHBhdHRlcm5zIGxpa2UgdGhlIGZvbGxvd2luZzpcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gRGVmaW5lIGFzIGFuIGFub255bW91cyBtb2R1bGUgc28sIHRocm91Z2ggcGF0aCBtYXBwaW5nLCBpdCBjYW4gYmUgYWxpYXNlZC5cbiAgICBkZWZpbmUoWydsb2Rhc2gnLCAncGxhdGZvcm0nXSwgZnVuY3Rpb24oXywgcGxhdGZvcm0pIHtcbiAgICAgIHJldHVybiBydW5JbkNvbnRleHQoe1xuICAgICAgICAnXyc6IF8sXG4gICAgICAgICdwbGF0Zm9ybSc6IHBsYXRmb3JtXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuICBlbHNlIHtcbiAgICB2YXIgQmVuY2htYXJrID0gcnVuSW5Db250ZXh0KCk7XG5cbiAgICAvLyBDaGVjayBmb3IgYGV4cG9ydHNgIGFmdGVyIGBkZWZpbmVgIGluIGNhc2UgYSBidWlsZCBvcHRpbWl6ZXIgYWRkcyBhbiBgZXhwb3J0c2Agb2JqZWN0LlxuICAgIGlmIChmcmVlRXhwb3J0cyAmJiBmcmVlTW9kdWxlKSB7XG4gICAgICAvLyBFeHBvcnQgZm9yIE5vZGUuanMuXG4gICAgICBpZiAobW9kdWxlRXhwb3J0cykge1xuICAgICAgICAoZnJlZU1vZHVsZS5leHBvcnRzID0gQmVuY2htYXJrKS5CZW5jaG1hcmsgPSBCZW5jaG1hcms7XG4gICAgICB9XG4gICAgICAvLyBFeHBvcnQgZm9yIENvbW1vbkpTIHN1cHBvcnQuXG4gICAgICBmcmVlRXhwb3J0cy5CZW5jaG1hcmsgPSBCZW5jaG1hcms7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gRXhwb3J0IHRvIHRoZSBnbG9iYWwgb2JqZWN0LlxuICAgICAgcm9vdC5CZW5jaG1hcmsgPSBCZW5jaG1hcms7XG4gICAgfVxuICB9XG59LmNhbGwodGhpcykpO1xuIl0sIm5hbWVzIjpbInVuZGVmaW5lZCIsIm9iamVjdFR5cGVzIiwicm9vdCIsIndpbmRvdyIsImZyZWVEZWZpbmUiLCJkZWZpbmUiLCJhbWQiLCJmcmVlRXhwb3J0cyIsImV4cG9ydHMiLCJub2RlVHlwZSIsImZyZWVNb2R1bGUiLCJtb2R1bGUiLCJmcmVlR2xvYmFsIiwiZ2xvYmFsIiwic2VsZiIsImZyZWVSZXF1aXJlIiwicmVxdWlyZSIsImNvdW50ZXIiLCJtb2R1bGVFeHBvcnRzIiwicmVQcmltaXRpdmUiLCJ1aWRDb3VudGVyIiwiY29udGV4dFByb3BzIiwiZGl2aXNvcnMiLCJ0VGFibGUiLCJ1VGFibGUiLCJydW5JbkNvbnRleHQiLCJjb250ZXh0IiwiXyIsIkJlbmNobWFyayIsImRlZmF1bHRzIiwiT2JqZWN0IiwicGljayIsIkFycmF5IiwiRGF0ZSIsIkZ1bmN0aW9uIiwiTWF0aCIsIlJlZ0V4cCIsIlN0cmluZyIsImFycmF5UmVmIiwib2JqZWN0UHJvdG8iLCJwcm90b3R5cGUiLCJhYnMiLCJjbGVhclRpbWVvdXQiLCJmbG9vciIsImxvZyIsIm1heCIsIm1pbiIsInBvdyIsInB1c2giLCJzZXRUaW1lb3V0Iiwic2hpZnQiLCJzbGljZSIsInNxcnQiLCJ0b1N0cmluZyIsInVuc2hpZnQiLCJyZXEiLCJkb2MiLCJpc0hvc3RUeXBlIiwiZG9jdW1lbnQiLCJtaWNyb3RpbWVPYmplY3QiLCJwcm9jZXNzT2JqZWN0IiwicHJvY2VzcyIsInRyYXNoIiwiY3JlYXRlRWxlbWVudCIsInVpZCIsIm5vdyIsImNhbGxlZEJ5Iiwic3VwcG9ydCIsImJyb3dzZXIiLCJ0aW1lb3V0IiwiZGVjb21waWxhdGlvbiIsIngiLCJyZXBsYWNlIiwiZSIsInRpbWVyIiwibmFtZSIsImZuIiwib3B0aW9ucyIsImJlbmNoIiwiaXNQbGFpbk9iamVjdCIsImlzRnVuY3Rpb24iLCJzZXRPcHRpb25zIiwiaWQiLCJzdGF0cyIsImNsb25lRGVlcCIsInRpbWVzIiwiRGVmZXJyZWQiLCJjbG9uZSIsImRlZmVycmVkIiwiYmVuY2htYXJrIiwiY2xvY2siLCJFdmVudCIsInR5cGUiLCJldmVudCIsImFzc2lnbiIsIlN1aXRlIiwic3VpdGUiLCJwYXJ0aWFsIiwiY2xvbmVEZWVwV2l0aCIsInZhbHVlIiwiaXNBcnJheSIsImNyZWF0ZUZ1bmN0aW9uIiwiYXJncyIsImJvZHkiLCJyZXN1bHQiLCJhbmNob3IiLCJwcm9wIiwicnVuU2NyaXB0Iiwibm9vcCIsImFwcGx5IiwiYXJndW1lbnRzIiwiZGVsYXkiLCJfdGltZXJJZCIsImRlc3Ryb3lFbGVtZW50IiwiZWxlbWVudCIsImFwcGVuZENoaWxkIiwiaW5uZXJIVE1MIiwiZ2V0Rmlyc3RBcmd1bWVudCIsImhhcyIsImV4ZWMiLCJnZXRNZWFuIiwic2FtcGxlIiwicmVkdWNlIiwic3VtIiwibGVuZ3RoIiwiZ2V0U291cmNlIiwiaXNTdHJpbmdhYmxlIiwidGVzdCIsImlzQ2xhc3NPZiIsImNhbGwiLCJvYmplY3QiLCJwcm9wZXJ0eSIsImlzU3RyaW5nIiwiY29kZSIsInNjcmlwdCIsInNpYmxpbmciLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsInBhcmVudCIsInBhcmVudE5vZGUiLCJwcmVmaXgiLCJjcmVhdGVUZXh0Tm9kZSIsImNsb25lTm9kZSIsInRleHQiLCJpbnNlcnRCZWZvcmUiLCJjb25zdHJ1Y3RvciIsImZvck93biIsImtleSIsImVhY2giLCJzcGxpdCIsIm9uIiwidG9Mb3dlckNhc2UiLCJyZXNvbHZlIiwiX29yaWdpbmFsIiwiYWJvcnRlZCIsInRlYXJkb3duIiwicnVubmluZyIsImN5Y2xlIiwiY3ljbGVzIiwiY291bnQiLCJjb21waWxlZCIsInN0b3AiLCJmaWx0ZXIiLCJhcnJheSIsImNhbGxiYWNrIiwiaXNGaW5pdGUiLCJoeiIsImVycm9yIiwic29ydCIsImEiLCJiIiwibWVhbiIsIm1vZSIsImNvbXBhcmUiLCJmb3JtYXROdW1iZXIiLCJudW1iZXIiLCJpbnZva2UiLCJiZW5jaGVzIiwicXVldWVkIiwiaW5kZXgiLCJldmVudFByb3BzIiwidG9BcnJheSIsImV4ZWN1dGUiLCJsaXN0ZW5lcnMiLCJhc3luYyIsImlzQXN5bmMiLCJnZXROZXh0IiwiZXZlbnRzIiwiY29tcGxldGUiLCJzcGxpY2UiLCJwb3AiLCJjeWNsZUV2ZW50IiwibGFzdCIsIm9mZiIsImVtaXQiLCJ0YXJnZXQiLCJvbkN5Y2xlIiwicmFpc2VJbmRleCIsIm9uQ29tcGxldGUiLCJkZWZlciIsIm9uU3RhcnQiLCJqb2luIiwic2VwYXJhdG9yMSIsInNlcGFyYXRvcjIiLCJhcnJheUxpa2UiLCJhYm9ydFN1aXRlIiwicmVzZXR0aW5nIiwicmVzZXRTdWl0ZSIsImNhbmNlbGxlZCIsInJlc2V0IiwiYWRkIiwiY2xvbmVTdWl0ZSIsImdldCIsImZpbHRlclN1aXRlIiwiYWJvcnRpbmciLCJhYm9ydCIsInJ1blN1aXRlIiwiY3VycmVudFRhcmdldCIsImxpc3RlbmVyIiwiaW5kZXhPZiIsIm90aGVyIiwiY3JpdGljYWwiLCJ6U3RhdCIsInNhbXBsZTEiLCJzYW1wbGUyIiwic2l6ZTEiLCJzaXplMiIsIm1heFNpemUiLCJtaW5TaXplIiwidTEiLCJnZXRVIiwidTIiLCJ1IiwiZ2V0U2NvcmUiLCJ4QSIsInNhbXBsZUIiLCJ0b3RhbCIsInhCIiwic2FtcGxlQSIsImdldFoiLCJjaGFuZ2VzIiwicXVldWUiLCJkYXRhIiwic291cmNlIiwiY2hhbmdlZCIsImRlc3RpbmF0aW9uIiwiY3VyclZhbHVlIiwiaXNPYmplY3RMaWtlIiwiZXEiLCJ0b1N0cmluZ0JlbmNoIiwic2l6ZSIsInBtIiwiaXNOYU4iLCJlcnJvclN0ciIsImlzT2JqZWN0IiwiaXNFcnJvciIsIkVycm9yIiwibWVzc2FnZSIsInRvRml4ZWQiLCJybWUiLCJ0ZW1wbGF0ZURhdGEiLCJ0aW1lcnMiLCJucyIsImdldFJlcyIsInN0cmluZ2FibGUiLCJkZWNvbXBpbGFibGUiLCJzZXR1cCIsIm1pblRpbWUiLCJmdW5jQm9keSIsImNyZWF0ZUNvbXBpbGVkIiwiaXNFbXB0eSIsImVsYXBzZWQiLCJmbkFyZyIsImludGVycG9sYXRlIiwidW5pdCIsInN0YXJ0IiwibWVhc3VyZWQiLCJiZWdpbiIsImRpdmlzb3IiLCJtaWNyb3NlY29uZHMiLCJnZXRUaW1lIiwiSW5maW5pdHkiLCJzdHJpbmciLCJ0ZW1wbGF0ZSIsImNocm9tZSIsImNocm9taXVtIiwiSW50ZXJ2YWwiLCJocnRpbWUiLCJtaW5CeSIsInJlcyIsImNvbXB1dGUiLCJpbml0Q291bnQiLCJtaW5TYW1wbGVzIiwiZW5xdWV1ZSIsInVwZGF0ZSIsImV2YWx1YXRlIiwiZGYiLCJzZCIsInNlbSIsInZhcmlhbmNlIiwiZG9uZSIsInBlcmlvZCIsIm1heGVkT3V0IiwidGltZVN0YW1wIiwibWF4VGltZSIsInZhck9mIiwicm91bmQiLCJpbmZpbml0eSIsImNsb2NrZWQiLCJjZWlsIiwicnVuIiwicGxhdGZvcm0iLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJkZXNjcmlwdGlvbiIsIm1ldGhvZE5hbWUiLCJyZXZlcnNlIiwiZnVuYyJdLCJtYXBwaW5ncyI6IkFBT0UsQ0FBQTtJQUNBO0lBRUEsc0VBQXNFLEdBQ3RFLElBQUlBO0lBRUosaUVBQWlFLEdBQ2pFLElBQUlDLGNBQWM7UUFDaEIsWUFBWTtRQUNaLFVBQVU7SUFDWjtJQUVBLDhDQUE4QyxHQUM5QyxJQUFJQyxPQUFPLEFBQUNELFdBQVcsQ0FB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QztZQUFHO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtTQUFHO1FBQ3pELE1BQU07WUFBQztZQUFHO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1NBQUc7UUFDN0QsTUFBTTtZQUFDO1lBQUc7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtTQUFHO1FBQ2pFLE1BQU07WUFBQztZQUFHO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtTQUFHO1FBQ3JFLE1BQU07WUFBQztZQUFHO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFLO1NBQUk7UUFDM0UsTUFBTTtZQUFDO1lBQUc7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFLO1lBQUs7WUFBSztTQUFJO1FBQ2pGLE1BQU07WUFBQztZQUFHO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztTQUFJO1FBQ3ZGLE1BQU07WUFBQztZQUFHO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1NBQUk7UUFDN0YsTUFBTTtZQUFDO1lBQUc7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztTQUFJO1FBQ2xHLE1BQU07WUFBQztZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztTQUFJO1FBQ3pHLE1BQU07WUFBQztZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1NBQUk7UUFDOUcsTUFBTTtZQUFDO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztTQUFJO1FBQ3BILE1BQU07WUFBQztZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztTQUFJO1FBQ3pILE1BQU07WUFBQztZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1NBQUk7UUFDL0gsTUFBTTtZQUFDO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztTQUFJO1FBQ3BJLE1BQU07WUFBQztZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztTQUFJO0lBQzNJO0lBRUEsNEVBQTRFLEdBRTVFOzs7Ozs7O0dBT0MsR0FDRCxTQUFTQyxhQUFhQyxPQUFPO1FBQzNCLDBDQUEwQztRQUMxQyxJQUFJQyxJQUFJRCxXQUFXQSxRQUFRQyxDQUFDLElBQUlYLFNBQVEsYUFBYWQsS0FBS3lCLENBQUM7UUFDM0QsSUFBSSxDQUFDQSxHQUFHO1lBQ05DLFVBQVVILFlBQVksR0FBR0E7WUFDekIsT0FBT0c7UUFDVDtRQUNBLDRFQUE0RTtRQUM1RSwyRUFBMkU7UUFDM0UsOEVBQThFO1FBQzlFLHFDQUFxQztRQUNyQ0YsVUFBVUEsVUFBVUMsRUFBRUUsUUFBUSxDQUFDM0IsS0FBSzRCLE1BQU0sSUFBSUosU0FBU0MsRUFBRUksSUFBSSxDQUFDN0IsTUFBTW1CLGlCQUFpQm5CO1FBRXJGLG1DQUFtQyxHQUNuQyxJQUFJOEIsUUFBUU4sUUFBUU0sS0FBSyxFQUNyQkMsT0FBT1AsUUFBUU8sSUFBSSxFQUNuQkMsV0FBV1IsUUFBUVEsUUFBUSxFQUMzQkMsT0FBT1QsUUFBUVMsSUFBSSxFQUNuQkwsU0FBU0osUUFBUUksTUFBTSxFQUN2Qk0sU0FBU1YsUUFBUVUsTUFBTSxFQUN2QkMsU0FBU1gsUUFBUVcsTUFBTTtRQUUzQixxREFBcUQsR0FDckQsSUFBSUMsV0FBVyxFQUFFLEVBQ2JDLGNBQWNULE9BQU9VLFNBQVM7UUFFbEMsNkJBQTZCLEdBQzdCLElBQUlDLE1BQU1OLEtBQUtNLEdBQUcsRUFDZEMsZUFBZWhCLFFBQVFnQixZQUFZLEVBQ25DQyxRQUFRUixLQUFLUSxLQUFLLEVBQ2xCQyxNQUFNVCxLQUFLUyxHQUFHLEVBQ2RDLE1BQU1WLEtBQUtVLEdBQUcsRUFDZEMsTUFBTVgsS0FBS1csR0FBRyxFQUNkQyxNQUFNWixLQUFLWSxHQUFHLEVBQ2RDLE9BQU9WLFNBQVNVLElBQUksRUFDcEJDLGFBQWF2QixRQUFRdUIsVUFBVSxFQUMvQkMsUUFBUVosU0FBU1ksS0FBSyxFQUN0QkMsUUFBUWIsU0FBU2EsS0FBSyxFQUN0QkMsT0FBT2pCLEtBQUtpQixJQUFJLEVBQ2hCQyxXQUFXZCxZQUFZYyxRQUFRLEVBQy9CQyxVQUFVaEIsU0FBU2dCLE9BQU87UUFFOUIscURBQXFELEdBQ3JELElBQUlDLE1BQU12QztRQUVWLGdDQUFnQyxHQUNoQyxJQUFJd0MsTUFBTUMsV0FBVy9CLFNBQVMsZUFBZUEsUUFBUWdDLFFBQVE7UUFFN0QsNkRBQTZELEdBQzdELElBQUlDLGtCQUFrQkosSUFBSTtRQUUxQixvREFBb0QsR0FDcEQsSUFBSUssZ0JBQWdCSCxXQUFXL0IsU0FBUyxjQUFjQSxRQUFRbUMsT0FBTztRQUVyRSwyREFBMkQsR0FDM0QsSUFBSUMsUUFBUU4sT0FBT0EsSUFBSU8sYUFBYSxDQUFDO1FBRXJDLDRDQUE0QyxHQUM1QyxJQUFJQyxNQUFNLFFBQVFyQyxFQUFFc0MsR0FBRztRQUV2QixtRUFBbUUsR0FDbkUsSUFBSUMsV0FBVyxDQUFDO1FBRWhCOzs7Ozs7S0FNQyxHQUNELElBQUlDLFVBQVUsQ0FBQztRQUVkLENBQUE7WUFFQzs7Ozs7T0FLQyxHQUNEQSxRQUFRQyxPQUFPLEdBQUdaLE9BQU9DLFdBQVcvQixTQUFTLGdCQUFnQixDQUFDK0IsV0FBVy9CLFNBQVM7WUFFbEY7Ozs7O09BS0MsR0FDRHlDLFFBQVFFLE9BQU8sR0FBR1osV0FBVy9CLFNBQVMsaUJBQWlCK0IsV0FBVy9CLFNBQVM7WUFFM0U7Ozs7OztPQU1DLEdBQ0QsSUFBSTtnQkFDRixpRkFBaUY7Z0JBQ2pGLDZDQUE2QztnQkFDN0MsMEZBQTBGO2dCQUMxRixnREFBZ0Q7Z0JBQ2hEeUMsUUFBUUcsYUFBYSxHQUFHcEMsU0FDdEIsQUFBQyxDQUFBLGFBQWMsU0FBU3FDLENBQUM7b0JBQUksT0FBTzt3QkFBRSxLQUFLLEtBQU0sQ0FBQSxJQUFJQSxDQUFBQSxJQUFLO3dCQUFJLEtBQUs7b0JBQUU7Z0JBQUcsSUFBSyxHQUFFLENBQy9FLDRDQUE0QztpQkFDM0NDLE9BQU8sQ0FBQyxrQkFBa0IsT0FDekIsR0FBR0QsQ0FBQyxLQUFLO1lBQ2YsRUFBRSxPQUFNRSxHQUFHO2dCQUNUTixRQUFRRyxhQUFhLEdBQUc7WUFDMUI7UUFDRixDQUFBO1FBRUE7Ozs7O0tBS0MsR0FDRCxJQUFJSSxRQUFRO1lBRVY7Ozs7OztPQU1DLEdBQ0QsTUFBTXpDO1lBRU47Ozs7OztPQU1DLEdBQ0QsU0FBUztZQUVUOzs7Ozs7T0FNQyxHQUNELFFBQVEsS0FBSyw2QkFBNkI7UUFDNUM7UUFFQSwwRUFBMEUsR0FFMUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBZ0ZDLEdBQ0QsU0FBU0wsVUFBVStDLElBQUksRUFBRUMsRUFBRSxFQUFFQyxPQUFPO1lBQ2xDLElBQUlDLFFBQVEsSUFBSTtZQUVoQixzREFBc0Q7WUFDdEQsSUFBSSxDQUFFQSxDQUFBQSxpQkFBaUJsRCxTQUFRLEdBQUk7Z0JBQ2pDLE9BQU8sSUFBSUEsVUFBVStDLE1BQU1DLElBQUlDO1lBQ2pDO1lBQ0Esb0JBQW9CO1lBQ3BCLElBQUlsRCxFQUFFb0QsYUFBYSxDQUFDSixPQUFPO2dCQUN6Qix3QkFBd0I7Z0JBQ3hCRSxVQUFVRjtZQUNaLE9BQ0ssSUFBSWhELEVBQUVxRCxVQUFVLENBQUNMLE9BQU87Z0JBQzNCLDZCQUE2QjtnQkFDN0JFLFVBQVVEO2dCQUNWQSxLQUFLRDtZQUNQLE9BQ0ssSUFBSWhELEVBQUVvRCxhQUFhLENBQUNILEtBQUs7Z0JBQzVCLCtCQUErQjtnQkFDL0JDLFVBQVVEO2dCQUNWQSxLQUFLO2dCQUNMRSxNQUFNSCxJQUFJLEdBQUdBO1lBQ2YsT0FDSztnQkFDSCxzQ0FBc0M7Z0JBQ3RDRyxNQUFNSCxJQUFJLEdBQUdBO1lBQ2Y7WUFDQU0sV0FBV0gsT0FBT0Q7WUFFbEJDLE1BQU1JLEVBQUUsSUFBS0osQ0FBQUEsTUFBTUksRUFBRSxHQUFHLEVBQUVqRSxPQUFNO1lBQ2hDNkQsTUFBTUYsRUFBRSxJQUFJLFFBQVNFLENBQUFBLE1BQU1GLEVBQUUsR0FBR0EsRUFBQztZQUVqQ0UsTUFBTUssS0FBSyxHQUFHQyxVQUFVTixNQUFNSyxLQUFLO1lBQ25DTCxNQUFNTyxLQUFLLEdBQUdELFVBQVVOLE1BQU1PLEtBQUs7UUFDckM7UUFFQTs7Ozs7O0tBTUMsR0FDRCxTQUFTQyxTQUFTQyxLQUFLO1lBQ3JCLElBQUlDLFdBQVcsSUFBSTtZQUNuQixJQUFJLENBQUVBLENBQUFBLG9CQUFvQkYsUUFBTyxHQUFJO2dCQUNuQyxPQUFPLElBQUlBLFNBQVNDO1lBQ3RCO1lBQ0FDLFNBQVNDLFNBQVMsR0FBR0Y7WUFDckJHLE1BQU1GO1FBQ1I7UUFFQTs7Ozs7O0tBTUMsR0FDRCxTQUFTRyxNQUFNQyxJQUFJO1lBQ2pCLElBQUlDLFFBQVEsSUFBSTtZQUNoQixJQUFJRCxnQkFBZ0JELE9BQU87Z0JBQ3pCLE9BQU9DO1lBQ1Q7WUFDQSxPQUFPLEFBQUNDLGlCQUFpQkYsUUFDckJoRSxFQUFFbUUsTUFBTSxDQUFDRCxPQUFPO2dCQUFFLGFBQWFsRSxFQUFFc0MsR0FBRztZQUFHLEdBQUcsT0FBTzJCLFFBQVEsV0FBVztnQkFBRSxRQUFRQTtZQUFLLElBQUlBLFFBQ3ZGLElBQUlELE1BQU1DO1FBQ2hCO1FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBeUNDLEdBQ0QsU0FBU0csTUFBTXBCLElBQUksRUFBRUUsT0FBTztZQUMxQixJQUFJbUIsUUFBUSxJQUFJO1lBRWhCLHNEQUFzRDtZQUN0RCxJQUFJLENBQUVBLENBQUFBLGlCQUFpQkQsS0FBSSxHQUFJO2dCQUM3QixPQUFPLElBQUlBLE1BQU1wQixNQUFNRTtZQUN6QjtZQUNBLG9CQUFvQjtZQUNwQixJQUFJbEQsRUFBRW9ELGFBQWEsQ0FBQ0osT0FBTztnQkFDekIsd0JBQXdCO2dCQUN4QkUsVUFBVUY7WUFDWixPQUFPO2dCQUNMLGtDQUFrQztnQkFDbENxQixNQUFNckIsSUFBSSxHQUFHQTtZQUNmO1lBQ0FNLFdBQVdlLE9BQU9uQjtRQUNwQjtRQUVBLDBFQUEwRSxHQUUxRTs7Ozs7OztLQU9DLEdBQ0QsSUFBSU8sWUFBWXpELEVBQUVzRSxPQUFPLENBQUN0RSxFQUFFdUUsYUFBYSxFQUFFdkUsR0FBRyxTQUFTd0UsS0FBSztZQUMxRCxvREFBb0Q7WUFDcEQsSUFBSSxDQUFDeEUsRUFBRXlFLE9BQU8sQ0FBQ0QsVUFBVSxDQUFDeEUsRUFBRW9ELGFBQWEsQ0FBQ29CLFFBQVE7Z0JBQ2hELE9BQU9BO1lBQ1Q7UUFDRjtRQUVBOzs7Ozs7O0tBT0MsR0FDRCxTQUFTRTtZQUNQLGVBQWU7WUFDZkEsaUJBQWlCLFNBQVNDLElBQUksRUFBRUMsSUFBSTtnQkFDbEMsSUFBSUMsUUFDQUMsU0FBU3JHLGFBQWFBLFdBQVdFLEdBQUcsR0FBR3NCLFdBQ3ZDOEUsT0FBTzFDLE1BQU07Z0JBRWpCMkMsVUFBVSxBQUFDdkcsQ0FBQUEsYUFBYSxnQkFBZ0IsWUFBVyxJQUFLc0csT0FBTyxlQUFlSixPQUFPLE9BQU9DLE9BQU87Z0JBQ25HQyxTQUFTQyxNQUFNLENBQUNDLEtBQUs7Z0JBQ3JCLE9BQU9ELE1BQU0sQ0FBQ0MsS0FBSztnQkFDbkIsT0FBT0Y7WUFDVDtZQUNBLHdCQUF3QjtZQUN4QixvREFBb0Q7WUFDcERILGlCQUFpQmxDLFFBQVFDLE9BQU8sSUFBSSxBQUFDaUMsQ0FBQUEsZUFBZSxJQUFJLFlBQVlyQyxNQUFNLFFBQVFyQyxFQUFFaUYsSUFBSSxBQUFELE9BQVE1QyxNQUFNcUMsaUJBQWlCbkU7WUFDdEgsT0FBT21FLGVBQWVRLEtBQUssQ0FBQyxNQUFNQztRQUNwQztRQUVBOzs7Ozs7S0FNQyxHQUNELFNBQVNDLE1BQU1qQyxLQUFLLEVBQUVGLEVBQUU7WUFDdEJFLE1BQU1rQyxRQUFRLEdBQUdyRixFQUFFb0YsS0FBSyxDQUFDbkMsSUFBSUUsTUFBTWlDLEtBQUssR0FBRztRQUM3QztRQUVBOzs7OztLQUtDLEdBQ0QsU0FBU0UsZUFBZUMsT0FBTztZQUM3QnBELE1BQU1xRCxXQUFXLENBQUNEO1lBQ2xCcEQsTUFBTXNELFNBQVMsR0FBRztRQUNwQjtRQUVBOzs7Ozs7S0FNQyxHQUNELFNBQVNDLGlCQUFpQnpDLEVBQUU7WUFDMUIsT0FBTyxBQUFDLENBQUNqRCxFQUFFMkYsR0FBRyxDQUFDMUMsSUFBSSxlQUNqQixBQUFDLENBQUEsbUNBQW1DMkMsSUFBSSxDQUFDM0MsT0FBTyxDQUFBLENBQUUsQ0FBQyxFQUFFLElBQUs7UUFDOUQ7UUFFQTs7Ozs7O0tBTUMsR0FDRCxTQUFTNEMsUUFBUUMsTUFBTTtZQUNyQixPQUFPLEFBQUM5RixFQUFFK0YsTUFBTSxDQUFDRCxRQUFRLFNBQVNFLEdBQUcsRUFBRXBELENBQUM7Z0JBQ3RDLE9BQU9vRCxNQUFNcEQ7WUFDZixLQUFLa0QsT0FBT0csTUFBTSxJQUFLO1FBQ3pCO1FBRUE7Ozs7OztLQU1DLEdBQ0QsU0FBU0MsVUFBVWpELEVBQUU7WUFDbkIsSUFBSTRCLFNBQVM7WUFDYixJQUFJc0IsYUFBYWxELEtBQUs7Z0JBQ3BCNEIsU0FBU25FLE9BQU91QztZQUNsQixPQUFPLElBQUlULFFBQVFHLGFBQWEsRUFBRTtnQkFDaEMsZ0NBQWdDO2dCQUNoQ2tDLFNBQVM3RSxFQUFFNkUsTUFBTSxDQUFDLDBCQUEwQmUsSUFBSSxDQUFDM0MsS0FBSztZQUN4RDtZQUNBLGVBQWU7WUFDZjRCLFNBQVMsQUFBQ0EsQ0FBQUEsVUFBVSxFQUFDLEVBQUdoQyxPQUFPLENBQUMsY0FBYztZQUU5Qyw2REFBNkQ7WUFDN0QsT0FBTyw0RUFBNEV1RCxJQUFJLENBQUN2QixVQUNwRixLQUNBQTtRQUNOO1FBRUE7Ozs7Ozs7S0FPQyxHQUNELFNBQVN3QixVQUFVN0IsS0FBSyxFQUFFeEIsSUFBSTtZQUM1QixPQUFPd0IsU0FBUyxRQUFROUMsU0FBUzRFLElBQUksQ0FBQzlCLFVBQVUsYUFBYXhCLE9BQU87UUFDdEU7UUFFQTs7Ozs7Ozs7O0tBU0MsR0FDRCxTQUFTbEIsV0FBV3lFLE1BQU0sRUFBRUMsUUFBUTtZQUNsQyxJQUFJRCxVQUFVLE1BQU07Z0JBQ2xCLE9BQU87WUFDVDtZQUNBLElBQUl0QyxPQUFPLE9BQU9zQyxNQUFNLENBQUNDLFNBQVM7WUFDbEMsT0FBTyxDQUFDaEgsWUFBWTRHLElBQUksQ0FBQ25DLFNBQVVBLENBQUFBLFFBQVEsWUFBWSxDQUFDLENBQUNzQyxNQUFNLENBQUNDLFNBQVMsQUFBRDtRQUMxRTtRQUVBOzs7Ozs7S0FNQyxHQUNELFNBQVNMLGFBQWEzQixLQUFLO1lBQ3pCLE9BQU94RSxFQUFFeUcsUUFBUSxDQUFDakMsVUFBV3hFLEVBQUUyRixHQUFHLENBQUNuQixPQUFPLGVBQWV4RSxFQUFFcUQsVUFBVSxDQUFDbUIsTUFBTTlDLFFBQVE7UUFDdEY7UUFFQTs7Ozs7O0tBTUMsR0FDRCxTQUFTckMsU0FBUWtFLEVBQUU7WUFDakIsSUFBSTtnQkFDRixJQUFJc0IsU0FBU2pHLGVBQWVRLFlBQVltRTtZQUMxQyxFQUFFLE9BQU1ULEdBQUcsQ0FBQztZQUNaLE9BQU8rQixVQUFVO1FBQ25CO1FBRUE7Ozs7O0tBS0MsR0FDRCxTQUFTRyxVQUFVMEIsSUFBSTtZQUNyQixJQUFJNUIsU0FBU3JHLGFBQWFDLE9BQU9DLEdBQUcsR0FBR3NCLFdBQ25DMEcsU0FBUzlFLElBQUlPLGFBQWEsQ0FBQyxXQUMzQndFLFVBQVUvRSxJQUFJZ0Ysb0JBQW9CLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFDL0NDLFNBQVNGLFFBQVFHLFVBQVUsRUFDM0JoQyxPQUFPMUMsTUFBTSxhQUNiMkUsU0FBUyxNQUFPdkksQ0FBQUEsYUFBYSxnQkFBZ0IsWUFBVyxJQUFLc0csT0FBTztZQUV4RSw4RUFBOEU7WUFDOUUsK0VBQStFO1lBQy9FLDZDQUE2QztZQUM3QyxJQUFJO2dCQUNGLDRFQUE0RTtnQkFDNUUsOERBQThEO2dCQUM5RDRCLE9BQU9uQixXQUFXLENBQUMzRCxJQUFJb0YsY0FBYyxDQUFDRCxTQUFTTjtnQkFDL0M1QixNQUFNLENBQUNDLEtBQUssR0FBRztvQkFBYU8sZUFBZXFCO2dCQUFTO1lBQ3RELEVBQUUsT0FBTTdELEdBQUc7Z0JBQ1RnRSxTQUFTQSxPQUFPSSxTQUFTLENBQUM7Z0JBQzFCTixVQUFVO2dCQUNWRCxPQUFPUSxJQUFJLEdBQUdUO1lBQ2hCO1lBQ0FJLE9BQU9NLFlBQVksQ0FBQ1QsUUFBUUM7WUFDNUIsT0FBTzlCLE1BQU0sQ0FBQ0MsS0FBSztRQUNyQjtRQUVBOzs7Ozs7S0FNQyxHQUNELFNBQVN6QixXQUFXaUQsTUFBTSxFQUFFckQsT0FBTztZQUNqQ0EsVUFBVXFELE9BQU9yRCxPQUFPLEdBQUdsRCxFQUFFbUUsTUFBTSxDQUFDLENBQUMsR0FBR1YsVUFBVThDLE9BQU9jLFdBQVcsQ0FBQ25FLE9BQU8sR0FBR08sVUFBVVA7WUFFekZsRCxFQUFFc0gsTUFBTSxDQUFDcEUsU0FBUyxTQUFTc0IsS0FBSyxFQUFFK0MsR0FBRztnQkFDbkMsSUFBSS9DLFNBQVMsTUFBTTtvQkFDakIsdUJBQXVCO29CQUN2QixJQUFJLFdBQVc0QixJQUFJLENBQUNtQixNQUFNO3dCQUN4QnZILEVBQUV3SCxJQUFJLENBQUNELElBQUlFLEtBQUssQ0FBQyxNQUFNLFNBQVNGLEdBQUc7NEJBQ2pDaEIsT0FBT21CLEVBQUUsQ0FBQ0gsSUFBSS9GLEtBQUssQ0FBQyxHQUFHbUcsV0FBVyxJQUFJbkQ7d0JBQ3hDO29CQUNGLE9BQU8sSUFBSSxDQUFDeEUsRUFBRTJGLEdBQUcsQ0FBQ1ksUUFBUWdCLE1BQU07d0JBQzlCaEIsTUFBTSxDQUFDZ0IsSUFBSSxHQUFHOUQsVUFBVWU7b0JBQzFCO2dCQUNGO1lBQ0Y7UUFDRjtRQUVBLDBFQUEwRSxHQUUxRTs7OztLQUlDLEdBQ0QsU0FBU29EO1lBQ1AsSUFBSS9ELFdBQVcsSUFBSSxFQUNmRCxRQUFRQyxTQUFTQyxTQUFTLEVBQzFCWCxRQUFRUyxNQUFNaUUsU0FBUztZQUUzQixJQUFJMUUsTUFBTTJFLE9BQU8sRUFBRTtnQkFDakIsMkZBQTJGO2dCQUMzRmpFLFNBQVNrRSxRQUFRO2dCQUNqQm5FLE1BQU1vRSxPQUFPLEdBQUc7Z0JBQ2hCQyxNQUFNcEU7WUFDUixPQUNLLElBQUksRUFBRUEsU0FBU3FFLE1BQU0sR0FBR3RFLE1BQU11RSxLQUFLLEVBQUU7Z0JBQ3hDdkUsTUFBTXdFLFFBQVEsQ0FBQzlCLElBQUksQ0FBQ3pDLFVBQVU5RCxTQUFTZ0Q7WUFDekMsT0FDSztnQkFDSEEsTUFBTXNGLElBQUksQ0FBQ3hFO2dCQUNYQSxTQUFTa0UsUUFBUTtnQkFDakIzQyxNQUFNeEIsT0FBTztvQkFBYXFFLE1BQU1wRTtnQkFBVztZQUM3QztRQUNGO1FBRUEsMEVBQTBFLEdBRTFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQXVCQyxHQUNELFNBQVN5RSxPQUFPQyxLQUFLLEVBQUVDLFFBQVE7WUFDN0IsSUFBSUEsYUFBYSxjQUFjO2dCQUM3Qiw2RUFBNkU7Z0JBQzdFQSxXQUFXLFNBQVNyRixLQUFLO29CQUN2QixPQUFPQSxNQUFNK0UsTUFBTSxJQUFJbEksRUFBRXlJLFFBQVEsQ0FBQ3RGLE1BQU11RixFQUFFLEtBQUssQ0FBQ3ZGLE1BQU13RixLQUFLO2dCQUM3RDtZQUNGLE9BQ0ssSUFBSUgsYUFBYSxhQUFhQSxhQUFhLFdBQVc7Z0JBQ3pELGdGQUFnRjtnQkFDaEYsSUFBSTNELFNBQVN5RCxPQUFPQyxPQUFPLGNBQWNLLElBQUksQ0FBQyxTQUFTQyxDQUFDLEVBQUVDLENBQUM7b0JBQ3pERCxJQUFJQSxFQUFFckYsS0FBSztvQkFBRXNGLElBQUlBLEVBQUV0RixLQUFLO29CQUN4QixPQUFPLEFBQUNxRixDQUFBQSxFQUFFRSxJQUFJLEdBQUdGLEVBQUVHLEdBQUcsR0FBR0YsRUFBRUMsSUFBSSxHQUFHRCxFQUFFRSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUEsSUFBTVIsQ0FBQUEsYUFBYSxZQUFZLElBQUksQ0FBQyxDQUFBO2dCQUNyRjtnQkFFQSxPQUFPeEksRUFBRXNJLE1BQU0sQ0FBQ3pELFFBQVEsU0FBUzFCLEtBQUs7b0JBQ3BDLE9BQU8wQixNQUFNLENBQUMsRUFBRSxDQUFDb0UsT0FBTyxDQUFDOUYsVUFBVTtnQkFDckM7WUFDRjtZQUNBLE9BQU9uRCxFQUFFc0ksTUFBTSxDQUFDQyxPQUFPQztRQUN6QjtRQUVBOzs7Ozs7O0tBT0MsR0FDRCxTQUFTVSxhQUFhQyxNQUFNO1lBQzFCQSxTQUFTekksT0FBT3lJLFFBQVExQixLQUFLLENBQUM7WUFDOUIsT0FBTzBCLE1BQU0sQ0FBQyxFQUFFLENBQUN0RyxPQUFPLENBQUMsMEJBQTBCLE9BQ2hEc0csQ0FBQUEsTUFBTSxDQUFDLEVBQUUsR0FBRyxNQUFNQSxNQUFNLENBQUMsRUFBRSxHQUFHLEVBQUM7UUFDcEM7UUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7S0FzQ0MsR0FDRCxTQUFTQyxPQUFPQyxPQUFPLEVBQUVyRyxJQUFJO1lBQzNCLElBQUkyQixNQUNBeEIsT0FDQW1HLFFBQ0FDLFFBQVEsQ0FBQyxHQUNUQyxhQUFhO2dCQUFFLGlCQUFpQkg7WUFBUSxHQUN4Q25HLFVBQVU7Z0JBQUUsV0FBV2xELEVBQUVpRixJQUFJO2dCQUFFLFdBQVdqRixFQUFFaUYsSUFBSTtnQkFBRSxjQUFjakYsRUFBRWlGLElBQUk7WUFBQyxHQUN2RUosU0FBUzdFLEVBQUV5SixPQUFPLENBQUNKO1lBRXZCOztPQUVDLEdBQ0QsU0FBU0s7Z0JBQ1AsSUFBSUMsV0FDQUMsUUFBUUMsUUFBUTFHO2dCQUVwQixJQUFJeUcsT0FBTztvQkFDVCx1Q0FBdUM7b0JBQ3ZDekcsTUFBTXVFLEVBQUUsQ0FBQyxZQUFZb0M7b0JBQ3JCSCxZQUFZeEcsTUFBTTRHLE1BQU0sQ0FBQ0MsUUFBUTtvQkFDakNMLFVBQVVNLE1BQU0sQ0FBQyxHQUFHLEdBQUdOLFVBQVVPLEdBQUc7Z0JBQ3RDO2dCQUNBLGtCQUFrQjtnQkFDbEJyRixNQUFNLENBQUMwRSxNQUFNLEdBQUd2SixFQUFFcUQsVUFBVSxDQUFDRixTQUFTQSxLQUFLLENBQUNILEtBQUssSUFBSUcsS0FBSyxDQUFDSCxLQUFLLENBQUNrQyxLQUFLLENBQUMvQixPQUFPd0IsUUFBUXRHO2dCQUN0RiwrQ0FBK0M7Z0JBQy9DLE9BQU8sQ0FBQ3VMLFNBQVNFO1lBQ25CO1lBRUE7O09BRUMsR0FDRCxTQUFTQSxRQUFRNUYsS0FBSztnQkFDcEIsSUFBSWlHLFlBQ0FDLE9BQU9qSCxPQUNQeUcsUUFBUUMsUUFBUU87Z0JBRXBCLElBQUlSLE9BQU87b0JBQ1RRLEtBQUtDLEdBQUcsQ0FBQyxZQUFZUDtvQkFDckJNLEtBQUtFLElBQUksQ0FBQztnQkFDWjtnQkFDQSxzQkFBc0I7Z0JBQ3RCZCxXQUFXdkYsSUFBSSxHQUFHO2dCQUNsQnVGLFdBQVdlLE1BQU0sR0FBR0g7Z0JBQ3BCRCxhQUFhbkcsTUFBTXdGO2dCQUNuQnRHLFFBQVFzSCxPQUFPLENBQUNsRSxJQUFJLENBQUMrQyxTQUFTYztnQkFFOUIsOENBQThDO2dCQUM5QyxJQUFJLENBQUNBLFdBQVdyQyxPQUFPLElBQUkyQyxpQkFBaUIsT0FBTztvQkFDakR0SCxRQUFRbUcsU0FBU0QsT0FBTyxDQUFDLEVBQUUsR0FBR3hFLE1BQU0sQ0FBQzBFLE1BQU07b0JBQzNDLElBQUlNLFFBQVExRyxRQUFRO3dCQUNsQmlDLE1BQU1qQyxPQUFPdUc7b0JBQ2YsT0FDSyxJQUFJRSxPQUFPO3dCQUNkLG1FQUFtRTt3QkFDbkUsTUFBT0YsVUFBVyxDQUFDO29CQUNyQixPQUNLO3dCQUNILGtDQUFrQzt3QkFDbEMsT0FBTztvQkFDVDtnQkFDRixPQUFPO29CQUNMLHlCQUF5QjtvQkFDekJGLFdBQVd2RixJQUFJLEdBQUc7b0JBQ2xCZixRQUFRd0gsVUFBVSxDQUFDcEUsSUFBSSxDQUFDK0MsU0FBU3JGLE1BQU13RjtnQkFDekM7Z0JBQ0EseUVBQXlFO2dCQUN6RSwyRUFBMkU7Z0JBQzNFLG1GQUFtRjtnQkFDbkYsSUFBSXRGLE9BQU87b0JBQ1RBLE1BQU00RCxPQUFPLEdBQUc7Z0JBQ2xCLE9BQU87b0JBQ0wsT0FBTztnQkFDVDtZQUNGO1lBRUE7O09BRUMsR0FDRCxTQUFTK0IsUUFBUXRELE1BQU07Z0JBQ3JCLG9GQUFvRjtnQkFDcEYsSUFBSXFELFFBQVFqRixJQUFJLENBQUMsRUFBRSxJQUFJQSxJQUFJLENBQUMsRUFBRSxDQUFDaUYsS0FBSztnQkFDcEMsT0FBTzVHLFFBQVEsU0FBVXVELGtCQUFrQnRHLGFBQ3hDLENBQUEsQUFBQzJKLENBQUFBLFNBQVMsT0FBT3JELE9BQU9yRCxPQUFPLENBQUMwRyxLQUFLLEdBQUdBLEtBQUksS0FBTXBILFFBQVFFLE9BQU8sSUFBSTZELE9BQU9vRSxLQUFLLEFBQUQ7WUFDckY7WUFFQTs7T0FFQyxHQUNELFNBQVNGO2dCQUNQbEI7Z0JBRUEsdUNBQXVDO2dCQUN2QyxJQUFJRCxVQUFVQyxRQUFRLEdBQUc7b0JBQ3ZCaEksTUFBTStFLElBQUksQ0FBQytDO2dCQUNiO2dCQUNBLG9EQUFvRDtnQkFDcEQsT0FBTyxBQUFDQyxDQUFBQSxTQUFTRCxRQUFRcEQsTUFBTSxHQUFHc0QsUUFBUTFFLE9BQU9vQixNQUFNLEFBQUQsSUFDbERzRCxRQUNDQSxRQUFRO1lBQ2Y7WUFDQSxvQkFBb0I7WUFDcEIsSUFBSXZKLEVBQUV5RyxRQUFRLENBQUN6RCxPQUFPO2dCQUNwQiw2QkFBNkI7Z0JBQzdCMkIsT0FBT25ELE1BQU04RSxJQUFJLENBQUNuQixXQUFXO1lBQy9CLE9BQU87Z0JBQ0wsZ0NBQWdDO2dCQUNoQ2pDLFVBQVVsRCxFQUFFbUUsTUFBTSxDQUFDakIsU0FBU0Y7Z0JBQzVCQSxPQUFPRSxRQUFRRixJQUFJO2dCQUNuQjJCLE9BQU8zRSxFQUFFeUUsT0FBTyxDQUFDRSxPQUFPLFVBQVV6QixVQUFVQSxRQUFReUIsSUFBSSxHQUFHLEVBQUUsSUFBSUEsT0FBTztvQkFBQ0E7aUJBQUs7Z0JBQzlFMkUsU0FBU3BHLFFBQVFvRyxNQUFNO1lBQ3pCO1lBQ0Esa0NBQWtDO1lBQ2xDLElBQUltQixpQkFBaUIsT0FBTztnQkFDMUIsc0JBQXNCO2dCQUN0QnRILFFBQVEwQixNQUFNLENBQUMwRSxNQUFNO2dCQUNyQkMsV0FBV3ZGLElBQUksR0FBRztnQkFDbEJ1RixXQUFXZSxNQUFNLEdBQUdwSDtnQkFDcEJELFFBQVEwSCxPQUFPLENBQUN0RSxJQUFJLENBQUMrQyxTQUFTckYsTUFBTXdGO2dCQUVwQywrREFBK0Q7Z0JBQy9ELElBQUl4RyxRQUFRLFNBQVVxRyxtQkFBbUJqRixTQUFVaUYsUUFBUXZCLE9BQU8sRUFBRTtvQkFDbEUsc0JBQXNCO29CQUN0QjBCLFdBQVd2RixJQUFJLEdBQUc7b0JBQ2xCZixRQUFRc0gsT0FBTyxDQUFDbEUsSUFBSSxDQUFDK0MsU0FBU3JGLE1BQU13RjtvQkFDcEMseUJBQXlCO29CQUN6QkEsV0FBV3ZGLElBQUksR0FBRztvQkFDbEJmLFFBQVF3SCxVQUFVLENBQUNwRSxJQUFJLENBQUMrQyxTQUFTckYsTUFBTXdGO2dCQUN6QyxPQUVLO29CQUNILElBQUlLLFFBQVExRyxRQUFRO3dCQUNsQmlDLE1BQU1qQyxPQUFPdUc7b0JBQ2YsT0FBTzt3QkFDTCxNQUFPQSxVQUFXLENBQUM7b0JBQ3JCO2dCQUNGO1lBQ0Y7WUFDQSxPQUFPN0U7UUFDVDtRQUVBOzs7Ozs7Ozs7S0FTQyxHQUNELFNBQVNnRyxLQUFLdEUsTUFBTSxFQUFFdUUsVUFBVSxFQUFFQyxVQUFVO1lBQzFDLElBQUlsRyxTQUFTLEVBQUUsRUFDWG9CLFNBQVMsQUFBQ00sQ0FBQUEsU0FBU3BHLE9BQU9vRyxPQUFNLEVBQUdOLE1BQU0sRUFDekMrRSxZQUFZL0UsV0FBV0EsV0FBVztZQUV0QzhFLGNBQWVBLENBQUFBLGFBQWEsSUFBRztZQUMvQi9LLEVBQUV3SCxJQUFJLENBQUNqQixRQUFRLFNBQVMvQixLQUFLLEVBQUUrQyxHQUFHO2dCQUNoQzFDLE9BQU94RCxJQUFJLENBQUMySixZQUFZeEcsUUFBUStDLE1BQU13RCxhQUFhdkc7WUFDckQ7WUFDQSxPQUFPSyxPQUFPZ0csSUFBSSxDQUFDQyxjQUFjO1FBQ25DO1FBRUEsMEVBQTBFLEdBRTFFOzs7Ozs7S0FNQyxHQUNELFNBQVNHO1lBQ1AsSUFBSS9HLE9BQ0FHLFFBQVEsSUFBSSxFQUNaNkcsWUFBWTNJLFNBQVM0SSxVQUFVO1lBRW5DLElBQUk5RyxNQUFNMkQsT0FBTyxFQUFFO2dCQUNqQjlELFFBQVFGLE1BQU07Z0JBQ2RLLE1BQU1pRyxJQUFJLENBQUNwRztnQkFDWCxJQUFJLENBQUNBLE1BQU1rSCxTQUFTLElBQUlGLFdBQVc7b0JBQ2pDLDRCQUE0QjtvQkFDNUIzSSxTQUFTMEksVUFBVSxHQUFHO29CQUN0QjVHLE1BQU1nSCxLQUFLO29CQUNYLE9BQU85SSxTQUFTMEksVUFBVTtvQkFFMUIsSUFBSSxDQUFDQyxXQUFXO3dCQUNkN0csTUFBTXlELE9BQU8sR0FBRzt3QkFDaEJzQixPQUFPL0UsT0FBTztvQkFDaEI7Z0JBQ0Y7WUFDRjtZQUNBLE9BQU9BO1FBQ1Q7UUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBb0NDLEdBQ0QsU0FBU2lILElBQUl0SSxJQUFJLEVBQUVDLEVBQUUsRUFBRUMsT0FBTztZQUM1QixJQUFJbUIsUUFBUSxJQUFJLEVBQ1psQixRQUFRLElBQUlsRCxVQUFVK0MsTUFBTUMsSUFBSUMsVUFDaENnQixRQUFRRixNQUFNO2dCQUFFLFFBQVE7Z0JBQU8sVUFBVWI7WUFBTTtZQUVuRCxJQUFJa0IsTUFBTWlHLElBQUksQ0FBQ3BHLFFBQVEsQ0FBQ0EsTUFBTWtILFNBQVMsRUFBRTtnQkFDdkMvRyxNQUFNaEQsSUFBSSxDQUFDOEI7WUFDYjtZQUNBLE9BQU9rQjtRQUNUO1FBRUE7Ozs7Ozs7S0FPQyxHQUNELFNBQVNrSCxXQUFXckksT0FBTztZQUN6QixJQUFJbUIsUUFBUSxJQUFJLEVBQ1pRLFNBQVMsSUFBSVIsTUFBTWdELFdBQVcsQ0FBQ3JILEVBQUVtRSxNQUFNLENBQUMsQ0FBQyxHQUFHRSxNQUFNbkIsT0FBTyxFQUFFQTtZQUUvRCx1QkFBdUI7WUFDdkJsRCxFQUFFc0gsTUFBTSxDQUFDakQsT0FBTyxTQUFTRyxLQUFLLEVBQUUrQyxHQUFHO2dCQUNqQyxJQUFJLENBQUN2SCxFQUFFMkYsR0FBRyxDQUFDZCxRQUFRMEMsTUFBTTtvQkFDdkIxQyxNQUFNLENBQUMwQyxJQUFJLEdBQUd2SCxFQUFFcUQsVUFBVSxDQUFDckQsRUFBRXdMLEdBQUcsQ0FBQ2hILE9BQU8sWUFDcENBLE1BQU1aLEtBQUssS0FDWEgsVUFBVWU7Z0JBQ2hCO1lBQ0Y7WUFDQSxPQUFPSztRQUNUO1FBRUE7Ozs7Ozs7S0FPQyxHQUNELFNBQVM0RyxZQUFZakQsUUFBUTtZQUMzQixJQUFJbkUsUUFBUSxJQUFJLEVBQ1pRLFNBQVMsSUFBSVIsTUFBTWdELFdBQVcsQ0FBQ2hELE1BQU1uQixPQUFPO1lBRWhEMkIsT0FBT3hELElBQUksQ0FBQzZELEtBQUssQ0FBQ0wsUUFBUXlELE9BQU9qRSxPQUFPbUU7WUFDeEMsT0FBTzNEO1FBQ1Q7UUFFQTs7Ozs7O0tBTUMsR0FDRCxTQUFTc0c7WUFDUCxJQUFJakgsT0FDQUcsUUFBUSxJQUFJLEVBQ1pxSCxXQUFXbkosU0FBUzBJLFVBQVU7WUFFbEMsSUFBSTVHLE1BQU0yRCxPQUFPLElBQUksQ0FBQzBELFVBQVU7Z0JBQzlCLDhEQUE4RDtnQkFDOURuSixTQUFTNEksVUFBVSxHQUFHO2dCQUN0QjlHLE1BQU1zSCxLQUFLO2dCQUNYLE9BQU9wSixTQUFTNEksVUFBVTtZQUM1QixPQUVLLElBQUksQUFBQzlHLENBQUFBLE1BQU15RCxPQUFPLElBQUl6RCxNQUFNMkQsT0FBTyxBQUFELEtBQ2xDM0QsQ0FBQUEsTUFBTWlHLElBQUksQ0FBQ3BHLFFBQVFGLE1BQU0sV0FBVyxDQUFDRSxNQUFNa0gsU0FBUyxBQUFELEdBQUk7Z0JBQzFEL0csTUFBTXlELE9BQU8sR0FBR3pELE1BQU0yRCxPQUFPLEdBQUc7Z0JBQ2hDLElBQUksQ0FBQzBELFVBQVU7b0JBQ2J0QyxPQUFPL0UsT0FBTztnQkFDaEI7WUFDRjtZQUNBLE9BQU9BO1FBQ1Q7UUFFQTs7Ozs7Ozs7Ozs7Ozs7S0FjQyxHQUNELFNBQVN1SCxTQUFTMUksT0FBTztZQUN2QixJQUFJbUIsUUFBUSxJQUFJO1lBRWhCQSxNQUFNZ0gsS0FBSztZQUNYaEgsTUFBTTJELE9BQU8sR0FBRztZQUNoQjlFLFdBQVlBLENBQUFBLFVBQVUsQ0FBQyxDQUFBO1lBRXZCa0csT0FBTy9FLE9BQU87Z0JBQ1osUUFBUTtnQkFDUixRQUFRbkI7Z0JBQ1IsVUFBVUEsUUFBUW9HLE1BQU07Z0JBQ3hCLFdBQVcsU0FBU3BGLEtBQUs7b0JBQ3ZCRyxNQUFNaUcsSUFBSSxDQUFDcEc7Z0JBQ2I7Z0JBQ0EsV0FBVyxTQUFTQSxLQUFLO29CQUN2QixJQUFJZixRQUFRZSxNQUFNcUcsTUFBTTtvQkFDeEIsSUFBSXBILE1BQU13RixLQUFLLEVBQUU7d0JBQ2Z0RSxNQUFNaUcsSUFBSSxDQUFDOzRCQUFFLFFBQVE7NEJBQVMsVUFBVW5IO3dCQUFNO29CQUNoRDtvQkFDQWtCLE1BQU1pRyxJQUFJLENBQUNwRztvQkFDWEEsTUFBTTRELE9BQU8sR0FBR3pELE1BQU15RCxPQUFPO2dCQUMvQjtnQkFDQSxjQUFjLFNBQVM1RCxLQUFLO29CQUMxQkcsTUFBTTJELE9BQU8sR0FBRztvQkFDaEIzRCxNQUFNaUcsSUFBSSxDQUFDcEc7Z0JBQ2I7WUFDRjtZQUNBLE9BQU9HO1FBQ1Q7UUFFQSwwRUFBMEUsR0FFMUU7Ozs7Ozs7S0FPQyxHQUNELFNBQVNpRyxLQUFLckcsSUFBSTtZQUNoQixJQUFJMEYsV0FDQXBELFNBQVMsSUFBSSxFQUNickMsUUFBUUYsTUFBTUMsT0FDZDhGLFNBQVN4RCxPQUFPd0QsTUFBTSxFQUN0QnBGLE9BQVFRLENBQUFBLFNBQVMsQ0FBQyxFQUFFLEdBQUdqQixPQUFPaUIsU0FBUTtZQUUxQ2pCLE1BQU0ySCxhQUFhLElBQUszSCxDQUFBQSxNQUFNMkgsYUFBYSxHQUFHdEYsTUFBSztZQUNuRHJDLE1BQU1xRyxNQUFNLElBQUtyRyxDQUFBQSxNQUFNcUcsTUFBTSxHQUFHaEUsTUFBSztZQUNyQyxPQUFPckMsTUFBTVcsTUFBTTtZQUVuQixJQUFJa0YsVUFBV0osQ0FBQUEsWUFBWTNKLEVBQUUyRixHQUFHLENBQUNvRSxRQUFRN0YsTUFBTUQsSUFBSSxLQUFLOEYsTUFBTSxDQUFDN0YsTUFBTUQsSUFBSSxDQUFDLEFBQUQsR0FBSTtnQkFDM0VqRSxFQUFFd0gsSUFBSSxDQUFDbUMsVUFBVW5JLEtBQUssSUFBSSxTQUFTc0ssUUFBUTtvQkFDekMsSUFBSSxBQUFDNUgsQ0FBQUEsTUFBTVcsTUFBTSxHQUFHaUgsU0FBUzVHLEtBQUssQ0FBQ3FCLFFBQVE1QixLQUFJLE1BQU8sT0FBTzt3QkFDM0RULE1BQU1rSCxTQUFTLEdBQUc7b0JBQ3BCO29CQUNBLE9BQU8sQ0FBQ2xILE1BQU00RCxPQUFPO2dCQUN2QjtZQUNGO1lBQ0EsT0FBTzVELE1BQU1XLE1BQU07UUFDckI7UUFFQTs7Ozs7OztLQU9DLEdBQ0QsU0FBUzhFLFVBQVUxRixJQUFJO1lBQ3JCLElBQUlzQyxTQUFTLElBQUksRUFDYndELFNBQVN4RCxPQUFPd0QsTUFBTSxJQUFLeEQsQ0FBQUEsT0FBT3dELE1BQU0sR0FBRyxDQUFDLENBQUE7WUFFaEQsT0FBTy9KLEVBQUUyRixHQUFHLENBQUNvRSxRQUFROUYsUUFBUThGLE1BQU0sQ0FBQzlGLEtBQUssR0FBSThGLE1BQU0sQ0FBQzlGLEtBQUssR0FBRyxFQUFFO1FBQ2hFO1FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7S0F5QkMsR0FDRCxTQUFTb0csSUFBSXBHLElBQUksRUFBRTZILFFBQVE7WUFDekIsSUFBSXZGLFNBQVMsSUFBSSxFQUNid0QsU0FBU3hELE9BQU93RCxNQUFNO1lBRTFCLElBQUksQ0FBQ0EsUUFBUTtnQkFDWCxPQUFPeEQ7WUFDVDtZQUNBdkcsRUFBRXdILElBQUksQ0FBQ3ZELE9BQU9BLEtBQUt3RCxLQUFLLENBQUMsT0FBT3NDLFFBQVEsU0FBU0osU0FBUyxFQUFFMUYsSUFBSTtnQkFDOUQsSUFBSXNGO2dCQUNKLElBQUksT0FBT0ksYUFBYSxVQUFVO29CQUNoQzFGLE9BQU8wRjtvQkFDUEEsWUFBWTNKLEVBQUUyRixHQUFHLENBQUNvRSxRQUFROUYsU0FBUzhGLE1BQU0sQ0FBQzlGLEtBQUs7Z0JBQ2pEO2dCQUNBLElBQUkwRixXQUFXO29CQUNiLElBQUltQyxVQUFVO3dCQUNadkMsUUFBUXZKLEVBQUUrTCxPQUFPLENBQUNwQyxXQUFXbUM7d0JBQzdCLElBQUl2QyxRQUFRLENBQUMsR0FBRzs0QkFDZEksVUFBVU0sTUFBTSxDQUFDVixPQUFPO3dCQUMxQjtvQkFDRixPQUFPO3dCQUNMSSxVQUFVMUQsTUFBTSxHQUFHO29CQUNyQjtnQkFDRjtZQUNGO1lBQ0EsT0FBT007UUFDVDtRQUVBOzs7Ozs7Ozs7Ozs7OztLQWNDLEdBQ0QsU0FBU21CLEdBQUd6RCxJQUFJLEVBQUU2SCxRQUFRO1lBQ3hCLElBQUl2RixTQUFTLElBQUksRUFDYndELFNBQVN4RCxPQUFPd0QsTUFBTSxJQUFLeEQsQ0FBQUEsT0FBT3dELE1BQU0sR0FBRyxDQUFDLENBQUE7WUFFaEQvSixFQUFFd0gsSUFBSSxDQUFDdkQsS0FBS3dELEtBQUssQ0FBQyxNQUFNLFNBQVN4RCxJQUFJO2dCQUNsQ2pFLENBQUFBLEVBQUUyRixHQUFHLENBQUNvRSxRQUFROUYsUUFDWDhGLE1BQU0sQ0FBQzlGLEtBQUssR0FDWDhGLE1BQU0sQ0FBQzlGLEtBQUssR0FBRyxFQUFFLEVBQ3BCNUMsSUFBSSxDQUFDeUs7WUFDVDtZQUNBLE9BQU92RjtRQUNUO1FBRUEsMEVBQTBFLEdBRTFFOzs7OztLQUtDLEdBQ0QsU0FBU29GO1lBQ1AsSUFBSXpILE9BQ0FmLFFBQVEsSUFBSSxFQUNaK0gsWUFBWTNJLFNBQVM4SSxLQUFLO1lBRTlCLElBQUlsSSxNQUFNNkUsT0FBTyxFQUFFO2dCQUNqQjlELFFBQVFGLE1BQU07Z0JBQ2RiLE1BQU1tSCxJQUFJLENBQUNwRztnQkFDWCxJQUFJLENBQUNBLE1BQU1rSCxTQUFTLElBQUlGLFdBQVc7b0JBQ2pDLDRCQUE0QjtvQkFDNUIzSSxTQUFTb0osS0FBSyxHQUFHO29CQUNqQnhJLE1BQU1rSSxLQUFLO29CQUNYLE9BQU85SSxTQUFTb0osS0FBSztvQkFFckIsSUFBSW5KLFFBQVFFLE9BQU8sRUFBRTt3QkFDbkIzQixhQUFhb0MsTUFBTWtDLFFBQVE7d0JBQzNCLE9BQU9sQyxNQUFNa0MsUUFBUTtvQkFDdkI7b0JBQ0EsSUFBSSxDQUFDNkYsV0FBVzt3QkFDZC9ILE1BQU0yRSxPQUFPLEdBQUc7d0JBQ2hCM0UsTUFBTTZFLE9BQU8sR0FBRztvQkFDbEI7Z0JBQ0Y7WUFDRjtZQUNBLE9BQU83RTtRQUNUO1FBRUE7Ozs7Ozs7Ozs7O0tBV0MsR0FDRCxTQUFTUyxNQUFNVixPQUFPO1lBQ3BCLElBQUlDLFFBQVEsSUFBSSxFQUNaMEIsU0FBUyxJQUFJMUIsTUFBTWtFLFdBQVcsQ0FBQ3JILEVBQUVtRSxNQUFNLENBQUMsQ0FBQyxHQUFHaEIsT0FBT0Q7WUFFdkQsZ0NBQWdDO1lBQ2hDMkIsT0FBTzNCLE9BQU8sR0FBR2xELEVBQUVtRSxNQUFNLENBQUMsQ0FBQyxHQUFHVixVQUFVTixNQUFNRCxPQUFPLEdBQUdPLFVBQVVQO1lBRWxFLDhCQUE4QjtZQUM5QmxELEVBQUVzSCxNQUFNLENBQUNuRSxPQUFPLFNBQVNxQixLQUFLLEVBQUUrQyxHQUFHO2dCQUNqQyxJQUFJLENBQUN2SCxFQUFFMkYsR0FBRyxDQUFDZCxRQUFRMEMsTUFBTTtvQkFDdkIxQyxNQUFNLENBQUMwQyxJQUFJLEdBQUc5RCxVQUFVZTtnQkFDMUI7WUFDRjtZQUVBLE9BQU9LO1FBQ1Q7UUFFQTs7Ozs7O0tBTUMsR0FDRCxTQUFTb0UsUUFBUStDLEtBQUs7WUFDcEIsSUFBSTdJLFFBQVEsSUFBSTtZQUVoQiw4Q0FBOEM7WUFDOUMsSUFBSUEsU0FBUzZJLE9BQU87Z0JBQ2xCLE9BQU87WUFDVDtZQUNBLElBQUlDLFVBQ0FDLE9BQ0FDLFVBQVVoSixNQUFNSyxLQUFLLENBQUNzQyxNQUFNLEVBQzVCc0csVUFBVUosTUFBTXhJLEtBQUssQ0FBQ3NDLE1BQU0sRUFDNUJ1RyxRQUFRRixRQUFRbEcsTUFBTSxFQUN0QnFHLFFBQVFGLFFBQVFuRyxNQUFNLEVBQ3RCc0csVUFBVXJMLElBQUltTCxPQUFPQyxRQUNyQkUsVUFBVXJMLElBQUlrTCxPQUFPQyxRQUNyQkcsS0FBS0MsS0FBS1AsU0FBU0MsVUFDbkJPLEtBQUtELEtBQUtOLFNBQVNELFVBQ25CUyxJQUFJekwsSUFBSXNMLElBQUlFO1lBRWhCLFNBQVNFLFNBQVNDLEVBQUUsRUFBRUMsT0FBTztnQkFDM0IsT0FBTy9NLEVBQUUrRixNQUFNLENBQUNnSCxTQUFTLFNBQVNDLEtBQUssRUFBRUMsRUFBRTtvQkFDekMsT0FBT0QsUUFBU0MsQ0FBQUEsS0FBS0gsS0FBSyxJQUFJRyxLQUFLSCxLQUFLLElBQUksR0FBRTtnQkFDaEQsR0FBRztZQUNMO1lBRUEsU0FBU0osS0FBS1EsT0FBTyxFQUFFSCxPQUFPO2dCQUM1QixPQUFPL00sRUFBRStGLE1BQU0sQ0FBQ21ILFNBQVMsU0FBU0YsS0FBSyxFQUFFRixFQUFFO29CQUN6QyxPQUFPRSxRQUFRSCxTQUFTQyxJQUFJQztnQkFDOUIsR0FBRztZQUNMO1lBRUEsU0FBU0ksS0FBS1AsQ0FBQztnQkFDYixPQUFPLEFBQUNBLENBQUFBLElBQUssQUFBQ1AsUUFBUUMsUUFBUyxDQUFDLElBQUs3SyxLQUFLLEFBQUM0SyxRQUFRQyxRQUFTRCxDQUFBQSxRQUFRQyxRQUFRLENBQUEsSUFBTTtZQUNwRjtZQUNBLDJEQUEyRDtZQUMzRCxvREFBb0Q7WUFDcEQsSUFBSUQsUUFBUUMsUUFBUSxJQUFJO2dCQUN0Qix3REFBd0Q7Z0JBQ3hELHlEQUF5RDtnQkFDekRKLFFBQVFpQixLQUFLUDtnQkFDYixPQUFPOUwsSUFBSW9MLFNBQVMsT0FBUVUsS0FBS0gsS0FBSyxJQUFJLENBQUMsSUFBSztZQUNsRDtZQUNBLDZEQUE2RDtZQUM3RFIsV0FBV00sVUFBVSxLQUFLQyxVQUFVLElBQUksSUFBSTNNLE1BQU0sQ0FBQzBNLFFBQVEsQ0FBQ0MsVUFBVSxFQUFFO1lBQ3hFLE9BQU9JLEtBQUtYLFdBQVlXLEtBQUtILEtBQUssSUFBSSxDQUFDLElBQUs7UUFDOUM7UUFFQTs7Ozs7S0FLQyxHQUNELFNBQVNwQjtZQUNQLElBQUlsSSxRQUFRLElBQUk7WUFDaEIsSUFBSUEsTUFBTTZFLE9BQU8sSUFBSSxDQUFDekYsU0FBU29KLEtBQUssRUFBRTtnQkFDcEMsb0RBQW9EO2dCQUNwRHBKLFNBQVM4SSxLQUFLLEdBQUc7Z0JBQ2pCbEksTUFBTXdJLEtBQUs7Z0JBQ1gsT0FBT3BKLFNBQVM4SSxLQUFLO2dCQUNyQixPQUFPbEk7WUFDVDtZQUNBLElBQUllLE9BQ0FxRixRQUFRLEdBQ1I2RCxVQUFVLEVBQUUsRUFDWkMsUUFBUSxFQUFFO1lBRWQsZ0VBQWdFO1lBQ2hFLGdHQUFnRztZQUNoRyxJQUFJQyxPQUFPO2dCQUNULGVBQWVuSztnQkFDZixVQUFVbkQsRUFBRW1FLE1BQU0sQ0FBQyxDQUFDLEdBQUdWLFVBQVVOLE1BQU1rRSxXQUFXLENBQUN4RyxTQUFTLEdBQUc0QyxVQUFVTixNQUFNRCxPQUFPO1lBQ3hGO1lBRUEsR0FBRztnQkFDRGxELEVBQUVzSCxNQUFNLENBQUNnRyxLQUFLQyxNQUFNLEVBQUUsU0FBUy9JLEtBQUssRUFBRStDLEdBQUc7b0JBQ3ZDLElBQUlpRyxTQUNBQyxjQUFjSCxLQUFLRyxXQUFXLEVBQzlCQyxZQUFZRCxXQUFXLENBQUNsRyxJQUFJO29CQUVoQyxzREFBc0Q7b0JBQ3RELElBQUksdUJBQXVCbkIsSUFBSSxDQUFDbUIsTUFBTTt3QkFDcEM7b0JBQ0Y7b0JBQ0EsSUFBSXZILEVBQUUyTixZQUFZLENBQUNuSixRQUFRO3dCQUN6QixJQUFJeEUsRUFBRXlFLE9BQU8sQ0FBQ0QsUUFBUTs0QkFDcEIsNERBQTREOzRCQUM1RCxJQUFJLENBQUN4RSxFQUFFeUUsT0FBTyxDQUFDaUosWUFBWTtnQ0FDekJGLFVBQVU7Z0NBQ1ZFLFlBQVksRUFBRTs0QkFDaEI7NEJBQ0EsNENBQTRDOzRCQUM1QyxJQUFJQSxVQUFVekgsTUFBTSxJQUFJekIsTUFBTXlCLE1BQU0sRUFBRTtnQ0FDcEN1SCxVQUFVO2dDQUNWRSxZQUFZQSxVQUFVbE0sS0FBSyxDQUFDLEdBQUdnRCxNQUFNeUIsTUFBTTtnQ0FDM0N5SCxVQUFVekgsTUFBTSxHQUFHekIsTUFBTXlCLE1BQU07NEJBQ2pDO3dCQUNGLE9BRUssSUFBSSxDQUFDakcsRUFBRTJOLFlBQVksQ0FBQ0QsWUFBWTs0QkFDbkNGLFVBQVU7NEJBQ1ZFLFlBQVksQ0FBQzt3QkFDZjt3QkFDQSw2QkFBNkI7d0JBQzdCLElBQUlGLFNBQVM7NEJBQ1hKLFFBQVEvTCxJQUFJLENBQUM7Z0NBQUUsZUFBZW9NO2dDQUFhLE9BQU9sRztnQ0FBSyxTQUFTbUc7NEJBQVU7d0JBQzVFO3dCQUNBTCxNQUFNaE0sSUFBSSxDQUFDOzRCQUFFLGVBQWVxTTs0QkFBVyxVQUFVbEo7d0JBQU07b0JBQ3pELE9BRUssSUFBSSxDQUFDeEUsRUFBRTROLEVBQUUsQ0FBQ0YsV0FBV2xKLFVBQVVBLFVBQVVuRyxXQUFXO3dCQUN2RCtPLFFBQVEvTCxJQUFJLENBQUM7NEJBQUUsZUFBZW9NOzRCQUFhLE9BQU9sRzs0QkFBSyxTQUFTL0M7d0JBQU07b0JBQ3hFO2dCQUNGO1lBQ0YsUUFDUThJLE9BQU9ELEtBQUssQ0FBQzlELFFBQVEsQ0FBRztZQUVoQyxtRkFBbUY7WUFDbkYsSUFBSTZELFFBQVFuSCxNQUFNLElBQ2I5QyxDQUFBQSxNQUFNbUgsSUFBSSxDQUFDcEcsUUFBUUYsTUFBTSxXQUFXLENBQUNFLE1BQU1rSCxTQUFTLEFBQUQsR0FBSTtnQkFDMURwTCxFQUFFd0gsSUFBSSxDQUFDNEYsU0FBUyxTQUFTRSxJQUFJO29CQUMzQkEsS0FBS0csV0FBVyxDQUFDSCxLQUFLL0YsR0FBRyxDQUFDLEdBQUcrRixLQUFLOUksS0FBSztnQkFDekM7WUFDRjtZQUNBLE9BQU9yQjtRQUNUO1FBRUE7Ozs7OztLQU1DLEdBQ0QsU0FBUzBLO1lBQ1AsSUFBSTFLLFFBQVEsSUFBSSxFQUNad0YsUUFBUXhGLE1BQU13RixLQUFLLEVBQ25CRCxLQUFLdkYsTUFBTXVGLEVBQUUsRUFDYm5GLEtBQUtKLE1BQU1JLEVBQUUsRUFDYkMsUUFBUUwsTUFBTUssS0FBSyxFQUNuQnNLLE9BQU90SyxNQUFNc0MsTUFBTSxDQUFDRyxNQUFNLEVBQzFCOEgsS0FBSyxRQUNMbEosU0FBUzFCLE1BQU1ILElBQUksSUFBS2hELENBQUFBLEVBQUVnTyxLQUFLLENBQUN6SyxNQUFNQSxLQUFLLFlBQVlBLEtBQUssR0FBRTtZQUVsRSxJQUFJb0YsT0FBTztnQkFDVCxJQUFJc0Y7Z0JBQ0osSUFBSSxDQUFDak8sRUFBRWtPLFFBQVEsQ0FBQ3ZGLFFBQVE7b0JBQ3RCc0YsV0FBV3ZOLE9BQU9pSTtnQkFDcEIsT0FBTyxJQUFJLENBQUMzSSxFQUFFbU8sT0FBTyxDQUFDQyxRQUFRO29CQUM1QkgsV0FBV3BELEtBQUtsQztnQkFDbEIsT0FBTztvQkFDTCw4REFBOEQ7b0JBQzlEc0YsV0FBV3BELEtBQUs3SyxFQUFFbUUsTUFBTSxDQUFDO3dCQUFFLFFBQVF3RSxNQUFNM0YsSUFBSTt3QkFBRSxXQUFXMkYsTUFBTTBGLE9BQU87b0JBQUMsR0FBRzFGO2dCQUM3RTtnQkFDQTlELFVBQVUsT0FBT29KO1lBQ25CLE9BQ0s7Z0JBQ0hwSixVQUFVLFFBQVFxRSxhQUFhUixHQUFHNEYsT0FBTyxDQUFDNUYsS0FBSyxNQUFNLElBQUksTUFBTSxjQUFjcUYsS0FDM0V2SyxNQUFNK0ssR0FBRyxDQUFDRCxPQUFPLENBQUMsS0FBSyxRQUFRUixPQUFPLFNBQVVBLENBQUFBLFFBQVEsSUFBSSxLQUFLLEdBQUUsSUFBSztZQUM1RTtZQUNBLE9BQU9qSjtRQUNUO1FBRUEsMEVBQTBFLEdBRTFFOzs7Ozs7S0FNQyxHQUNELFNBQVNkO1lBQ1AsSUFBSWIsVUFBVWpELFVBQVVpRCxPQUFPLEVBQzNCc0wsZUFBZSxDQUFDLEdBQ2hCQyxTQUFTO2dCQUFDO29CQUFFLE1BQU0xTCxNQUFNMkwsRUFBRTtvQkFBRSxPQUFPeE4sSUFBSSxRQUFReU4sT0FBTztvQkFBUSxRQUFRO2dCQUFLO2FBQUU7WUFFakYsaUNBQWlDO1lBQ2pDNUssUUFBUSxTQUFTSCxLQUFLO2dCQUNwQixJQUFJQztnQkFFSixJQUFJRCxpQkFBaUJELFVBQVU7b0JBQzdCRSxXQUFXRDtvQkFDWEEsUUFBUUMsU0FBU0MsU0FBUztnQkFDNUI7Z0JBQ0EsSUFBSVgsUUFBUVMsTUFBTWlFLFNBQVMsRUFDdkIrRyxhQUFhekksYUFBYWhELE1BQU1GLEVBQUUsR0FDbENrRixRQUFRaEYsTUFBTWdGLEtBQUssR0FBR3ZFLE1BQU11RSxLQUFLLEVBQ2pDMEcsZUFBZUQsY0FBZXBNLFFBQVFHLGFBQWEsSUFBS2lCLENBQUFBLE1BQU1rTCxLQUFLLEtBQUs5TyxFQUFFaUYsSUFBSSxJQUFJckIsTUFBTW1FLFFBQVEsS0FBSy9ILEVBQUVpRixJQUFJLEFBQUQsR0FDMUcxQixLQUFLSixNQUFNSSxFQUFFLEVBQ2JQLE9BQU9HLE1BQU1ILElBQUksSUFBSyxDQUFBLE9BQU9PLE1BQU0sV0FBVyxZQUFZQSxLQUFLLE1BQU1BLEVBQUMsR0FDdEVzQixTQUFTO2dCQUViLDRCQUE0QjtnQkFDNUJqQixNQUFNbUwsT0FBTyxHQUFHNUwsTUFBTTRMLE9BQU8sSUFBSzVMLENBQUFBLE1BQU00TCxPQUFPLEdBQUc1TCxNQUFNRCxPQUFPLENBQUM2TCxPQUFPLEdBQUc3TCxRQUFRNkwsT0FBTyxBQUFEO2dCQUV4Rix5REFBeUQ7Z0JBQ3pELDRFQUE0RTtnQkFDNUUsNkVBQTZFO2dCQUM3RSxJQUFJQyxXQUFXbkwsV0FDWCw2RkFDQSx3Q0FBd0M7Z0JBQ3hDLG9CQUNBLHFCQUFxQjtnQkFDckIsNkdBQ0EsMkJBQTJCO2dCQUMzQiwySEFDQSxtQ0FBbUM7Z0JBQ25DLGlGQUNBLGVBQWU7Z0JBQ2Ysa0JBQ0EsNERBQTREO2dCQUM1RCxrQ0FFQSx3RUFDQTtnQkFFSixJQUFJdUUsV0FBV2pGLE1BQU1pRixRQUFRLEdBQUd4RSxNQUFNd0UsUUFBUSxHQUFHNkcsZUFBZTlMLE9BQU8wTCxjQUFjaEwsVUFBVW1MLFdBQzNGRSxVQUFVLENBQUVWLENBQUFBLGFBQWF2TCxFQUFFLElBQUkyTCxVQUFTO2dCQUU1QyxJQUFJO29CQUNGLElBQUlNLFNBQVM7d0JBQ1gsaUVBQWlFO3dCQUNqRSxvREFBb0Q7d0JBQ3BELE1BQU0sSUFBSWQsTUFBTSxlQUFlcEwsT0FBTztvQkFDeEMsT0FDSyxJQUFJLENBQUNhLFVBQVU7d0JBQ2xCLGtFQUFrRTt3QkFDbEUsMEVBQTBFO3dCQUMxRVYsTUFBTWdGLEtBQUssR0FBRzt3QkFDZEMsV0FBV3lHLGdCQUFnQixBQUFDekcsQ0FBQUEsU0FBUzlCLElBQUksQ0FBQ25ELE9BQU9wRCxTQUFTZ0QsVUFBVSxDQUFDLENBQUEsRUFBR1YsR0FBRyxJQUFJbU0sYUFBYW5NLEdBQUcsSUFBSStGO3dCQUNuR2pGLE1BQU1nRixLQUFLLEdBQUdBO29CQUNoQjtnQkFDRixFQUFFLE9BQU1yRixHQUFHO29CQUNUc0YsV0FBVztvQkFDWHhFLE1BQU0rRSxLQUFLLEdBQUc3RixLQUFLLElBQUlzTCxNQUFNMU4sT0FBT29DO29CQUNwQ0ssTUFBTWdGLEtBQUssR0FBR0E7Z0JBQ2hCO2dCQUNBLDZEQUE2RDtnQkFDN0QsSUFBSSxDQUFDQyxZQUFZLENBQUN2RSxZQUFZLENBQUNxTCxTQUFTO29CQUN0Q0YsV0FBVyxBQUNUSixDQUFBQSxjQUFlQyxnQkFBZ0IsQ0FBQ2pMLE1BQU0rRSxLQUFLLEdBQ3ZDLHdEQUNBLHdDQUF1QyxJQUUzQyxzRUFDQTtvQkFFRlAsV0FBVzZHLGVBQWU5TCxPQUFPMEwsY0FBY2hMLFVBQVVtTDtvQkFFekQsSUFBSTt3QkFDRiw2Q0FBNkM7d0JBQzdDN0wsTUFBTWdGLEtBQUssR0FBRzt3QkFDZEMsU0FBUzlCLElBQUksQ0FBQ25ELE9BQU9wRCxTQUFTZ0Q7d0JBQzlCSSxNQUFNZ0YsS0FBSyxHQUFHQTt3QkFDZCxPQUFPdkUsTUFBTStFLEtBQUs7b0JBQ3BCLEVBQ0EsT0FBTTdGLEdBQUc7d0JBQ1BLLE1BQU1nRixLQUFLLEdBQUdBO3dCQUNkLElBQUksQ0FBQ3ZFLE1BQU0rRSxLQUFLLEVBQUU7NEJBQ2hCL0UsTUFBTStFLEtBQUssR0FBRzdGLEtBQUssSUFBSXNMLE1BQU0xTixPQUFPb0M7d0JBQ3RDO29CQUNGO2dCQUNGO2dCQUNBLHVDQUF1QztnQkFDdkMsSUFBSSxDQUFDYyxNQUFNK0UsS0FBSyxFQUFFO29CQUNoQlAsV0FBV2pGLE1BQU1pRixRQUFRLEdBQUd4RSxNQUFNd0UsUUFBUSxHQUFHNkcsZUFBZTlMLE9BQU8wTCxjQUFjaEwsVUFBVW1MO29CQUMzRm5LLFNBQVN1RCxTQUFTOUIsSUFBSSxDQUFDekMsWUFBWVYsT0FBT3BELFNBQVNnRCxPQUFPb00sT0FBTztnQkFDbkU7Z0JBQ0EsT0FBT3RLO1lBQ1Q7WUFFQSx3RUFBd0UsR0FFeEU7O09BRUMsR0FDRCxTQUFTb0ssZUFBZTlMLEtBQUssRUFBRTBMLFlBQVksRUFBRWhMLFFBQVEsRUFBRWUsSUFBSTtnQkFDekQsSUFBSTNCLEtBQUtFLE1BQU1GLEVBQUUsRUFDYm1NLFFBQVF2TCxXQUFXNkIsaUJBQWlCekMsT0FBTyxhQUFhO2dCQUU1RHVMLGFBQWFuTSxHQUFHLEdBQUdBLE1BQU01QztnQkFFekJPLEVBQUVtRSxNQUFNLENBQUNxSyxjQUFjO29CQUNyQixTQUFTSyxlQUFlM0ksVUFBVS9DLE1BQU0yTCxLQUFLLElBQUlPLFlBQVk7b0JBQzdELE1BQU1SLGVBQWUzSSxVQUFVakQsTUFBTW9NLFlBQVksV0FBV0QsUUFBUTtvQkFDcEUsU0FBU0E7b0JBQ1QsWUFBWVAsZUFBZTNJLFVBQVUvQyxNQUFNNEUsUUFBUSxJQUFJc0gsWUFBWTtnQkFDckU7Z0JBRUEsMkJBQTJCO2dCQUMzQixJQUFJdE0sTUFBTXVNLElBQUksSUFBSSxNQUFNO29CQUN0QnRQLEVBQUVtRSxNQUFNLENBQUNxSyxjQUFjO3dCQUNyQixTQUFTYSxZQUFZO3dCQUNyQixPQUFPQSxZQUFZO29CQUNyQjtnQkFDRixPQUNLLElBQUl0TSxNQUFNdU0sSUFBSSxJQUFJLE1BQU07b0JBQzNCLElBQUl2TSxNQUFNMkwsRUFBRSxDQUFDckcsSUFBSSxFQUFFO3dCQUNqQnJJLEVBQUVtRSxNQUFNLENBQUNxSyxjQUFjOzRCQUNyQixTQUFTYSxZQUFZOzRCQUNyQixPQUFPQSxZQUFZO3dCQUNyQjtvQkFDRixPQUFPO3dCQUNMclAsRUFBRW1FLE1BQU0sQ0FBQ3FLLGNBQWM7NEJBQ3JCLFNBQVNhLFlBQVk7NEJBQ3JCLE9BQU9BLFlBQVk7d0JBQ3JCO29CQUNGO2dCQUNGLE9BQ0ssSUFBSXRNLE1BQU0yTCxFQUFFLENBQUNwTSxHQUFHLEVBQUU7b0JBQ3JCdEMsRUFBRW1FLE1BQU0sQ0FBQ3FLLGNBQWM7d0JBQ3JCLFNBQVNhLFlBQVk7d0JBQ3JCLE9BQU9BLFlBQVk7b0JBQ3JCO2dCQUNGLE9BQ0s7b0JBQ0hyUCxFQUFFbUUsTUFBTSxDQUFDcUssY0FBYzt3QkFDckIsU0FBU2EsWUFBWTt3QkFDckIsT0FBT0EsWUFBWTtvQkFDckI7Z0JBQ0Y7Z0JBQ0EsMEJBQTBCO2dCQUMxQnRNLE1BQU13TSxLQUFLLEdBQUc3SyxlQUNaMkssWUFBWSxPQUNaQSxZQUFZO2dCQUdkdE0sTUFBTXNGLElBQUksR0FBRzNELGVBQ1gySyxZQUFZLE9BQ1pBLFlBQVk7Z0JBR2Qsd0JBQXdCO2dCQUN4QixPQUFPM0ssZUFDTDJLLFlBQVksY0FDWiwrRkFDQUEsWUFBWXpLO1lBRWhCO1lBRUE7O09BRUMsR0FDRCxTQUFTK0osT0FBT1csSUFBSTtnQkFDbEIsSUFBSUUsVUFDQUMsT0FDQXRILFFBQVEsSUFDUnVILFVBQVUsS0FDVmhCLEtBQUszTCxNQUFNMkwsRUFBRSxFQUNiNUksU0FBUyxFQUFFO2dCQUVmLHdDQUF3QztnQkFDeEMsTUFBT3FDLFFBQVM7b0JBQ2QsSUFBSW1ILFFBQVEsTUFBTTt3QkFDaEJJLFVBQVU7d0JBQ1YsSUFBSWhCLEdBQUdyRyxJQUFJLEVBQUU7NEJBQ1hxRyxHQUFHYSxLQUFLOzRCQUNSLE1BQU8sQ0FBRUMsQ0FBQUEsV0FBV2QsR0FBR2lCLFlBQVksRUFBQyxFQUFJLENBQUM7d0JBQzNDLE9BQU87NEJBQ0xGLFFBQVFmOzRCQUNSLE1BQU8sQ0FBRWMsQ0FBQUEsV0FBV2QsT0FBT2UsS0FBSSxFQUFJLENBQUM7d0JBQ3RDO29CQUNGLE9BQ0ssSUFBSUgsUUFBUSxNQUFNO3dCQUNyQkksVUFBVTt3QkFDVkQsUUFBUSxBQUFDQSxDQUFBQSxRQUFRZixJQUFHLENBQUUsQ0FBQyxFQUFFLEdBQUllLEtBQUssQ0FBQyxFQUFFLEdBQUdDO3dCQUN4QyxNQUFPLENBQUVGLENBQUFBLFdBQVcsQUFBQyxBQUFDQSxDQUFBQSxXQUFXZCxJQUFHLENBQUUsQ0FBQyxFQUFFLEdBQUljLFFBQVEsQ0FBQyxFQUFFLEdBQUdFLFVBQVlELEtBQUksRUFBSSxDQUFDO3dCQUNoRkMsVUFBVTtvQkFDWixPQUNLLElBQUloQixHQUFHcE0sR0FBRyxFQUFFO3dCQUNmbU4sUUFBUWYsR0FBR3BNLEdBQUc7d0JBQ2QsTUFBTyxDQUFFa04sQ0FBQUEsV0FBV2QsR0FBR3BNLEdBQUcsS0FBS21OLEtBQUksRUFBSSxDQUFDO29CQUMxQyxPQUNLO3dCQUNIQSxRQUFRLElBQUlmLEtBQUtrQixPQUFPO3dCQUN4QixNQUFPLENBQUVKLENBQUFBLFdBQVcsSUFBSWQsS0FBS2tCLE9BQU8sS0FBS0gsS0FBSSxFQUFJLENBQUM7b0JBQ3BEO29CQUNBLDJCQUEyQjtvQkFDM0IsSUFBSUQsV0FBVyxHQUFHO3dCQUNoQjFKLE9BQU96RSxJQUFJLENBQUNtTztvQkFDZCxPQUFPO3dCQUNMMUosT0FBT3pFLElBQUksQ0FBQ3dPO3dCQUNaO29CQUNGO2dCQUNGO2dCQUNBLHNCQUFzQjtnQkFDdEIsT0FBT2hLLFFBQVFDLFVBQVU0SjtZQUMzQjtZQUVBOztPQUVDLEdBQ0QsU0FBU0wsWUFBWVMsTUFBTTtnQkFDekIseUZBQXlGO2dCQUN6RixPQUFPOVAsRUFBRStQLFFBQVEsQ0FBQ0QsT0FBT2pOLE9BQU8sQ0FBQyxPQUFPLE1BQU0rQyxJQUFJLENBQUM0SSxhQUFhbk0sR0FBRyxJQUFJbU07WUFDekU7WUFFQSx3RUFBd0UsR0FFeEUscUNBQXFDO1lBQ3JDLDREQUE0RDtZQUM1RCwwREFBMEQ7WUFDMUQsSUFBSTtnQkFDRixJQUFLekwsTUFBTTJMLEVBQUUsR0FBRyxJQUFJLEFBQUMzTyxDQUFBQSxRQUFRaVEsTUFBTSxJQUFJalEsUUFBUWtRLFFBQVEsQUFBRCxFQUFHQyxRQUFRLEVBQUc7b0JBQ2xFekIsT0FBT3BOLElBQUksQ0FBQzt3QkFBRSxNQUFNMEIsTUFBTTJMLEVBQUU7d0JBQUUsT0FBT0MsT0FBTzt3QkFBTyxRQUFRO29CQUFLO2dCQUNsRTtZQUNGLEVBQUUsT0FBTTdMLEdBQUcsQ0FBQztZQUVaLDRFQUE0RTtZQUM1RSxJQUFJYixpQkFBaUIsT0FBUWMsQ0FBQUEsTUFBTTJMLEVBQUUsR0FBR3pNLGNBQWNrTyxNQUFNLEFBQUQsS0FBTSxZQUFZO2dCQUMzRTFCLE9BQU9wTixJQUFJLENBQUM7b0JBQUUsTUFBTTBCLE1BQU0yTCxFQUFFO29CQUFFLE9BQU9DLE9BQU87b0JBQU8sUUFBUTtnQkFBSztZQUNsRTtZQUNBLG1EQUFtRDtZQUNuRCxJQUFJM00sbUJBQW1CLE9BQVFlLENBQUFBLE1BQU0yTCxFQUFFLEdBQUcxTSxnQkFBZ0JNLEdBQUcsQUFBRCxLQUFNLFlBQVk7Z0JBQzVFbU0sT0FBT3BOLElBQUksQ0FBQztvQkFBRSxNQUFNMEIsTUFBTTJMLEVBQUU7b0JBQUcsT0FBT0MsT0FBTztvQkFBTyxRQUFRO2dCQUFLO1lBQ25FO1lBQ0Esc0NBQXNDO1lBQ3RDNUwsUUFBUS9DLEVBQUVvUSxLQUFLLENBQUMzQixRQUFRO1lBRXhCLHdDQUF3QztZQUN4QyxJQUFJMUwsTUFBTXNOLEdBQUcsSUFBSVIsVUFBVTtnQkFDekIsTUFBTSxJQUFJekIsTUFBTTtZQUNsQjtZQUNBLDZFQUE2RTtZQUM3RSxvRkFBb0Y7WUFDcEZsTCxRQUFRNkwsT0FBTyxJQUFLN0wsQ0FBQUEsUUFBUTZMLE9BQU8sR0FBRzdOLElBQUk2QixNQUFNc04sR0FBRyxHQUFHLElBQUksTUFBTSxLQUFJO1lBQ3BFLE9BQU90TSxNQUFNbUIsS0FBSyxDQUFDLE1BQU1DO1FBQzNCO1FBRUEsMEVBQTBFLEdBRTFFOzs7Ozs7S0FNQyxHQUNELFNBQVNtTCxRQUFRbk4sS0FBSyxFQUFFRCxPQUFPO1lBQzdCQSxXQUFZQSxDQUFBQSxVQUFVLENBQUMsQ0FBQTtZQUV2QixJQUFJMEcsUUFBUTFHLFFBQVEwRyxLQUFLLEVBQ3JCdUYsVUFBVSxHQUNWb0IsWUFBWXBOLE1BQU1vTixTQUFTLEVBQzNCQyxhQUFhck4sTUFBTXFOLFVBQVUsRUFDN0JuRCxRQUFRLEVBQUUsRUFDVnZILFNBQVMzQyxNQUFNSyxLQUFLLENBQUNzQyxNQUFNO1lBRS9COztPQUVDLEdBQ0QsU0FBUzJLO2dCQUNQcEQsTUFBTWhNLElBQUksQ0FBQ3JCLEVBQUVtRSxNQUFNLENBQUNoQixNQUFNUyxLQUFLLElBQUk7b0JBQ2pDLGFBQWFUO29CQUNiLFVBQVU7d0JBQ1IsU0FBUzs0QkFBQ3VOO3lCQUFPO3dCQUNqQixTQUFTOzRCQUFDQTt5QkFBTzt3QkFDakIsU0FBUzs0QkFBQ0E7eUJBQU87d0JBQ2pCLFNBQVM7NEJBQUNBO3lCQUFPO29CQUNuQjtnQkFDRjtZQUNGO1lBRUE7O09BRUMsR0FDRCxTQUFTQSxPQUFPeE0sS0FBSztnQkFDbkIsSUFBSU4sUUFBUSxJQUFJLEVBQ1pLLE9BQU9DLE1BQU1ELElBQUk7Z0JBRXJCLElBQUlkLE1BQU02RSxPQUFPLEVBQUU7b0JBQ2pCLElBQUkvRCxRQUFRLFNBQVM7d0JBQ25CLHFEQUFxRDt3QkFDckRMLE1BQU11RSxLQUFLLEdBQUdoRixNQUFNb04sU0FBUztvQkFDL0IsT0FDSzt3QkFDSCxJQUFJdE0sUUFBUSxTQUFTOzRCQUNuQmQsTUFBTXdGLEtBQUssR0FBRy9FLE1BQU0rRSxLQUFLO3dCQUMzQjt3QkFDQSxJQUFJMUUsUUFBUSxTQUFTOzRCQUNuQmQsTUFBTXdJLEtBQUs7NEJBQ1h4SSxNQUFNbUgsSUFBSSxDQUFDO3dCQUNiLE9BQU87NEJBQ0xwRyxNQUFNMkgsYUFBYSxHQUFHM0gsTUFBTXFHLE1BQU0sR0FBR3BIOzRCQUNyQ0EsTUFBTW1ILElBQUksQ0FBQ3BHO3dCQUNiO29CQUNGO2dCQUNGLE9BQU8sSUFBSWYsTUFBTTJFLE9BQU8sRUFBRTtvQkFDeEIsdUVBQXVFO29CQUN2RWxFLE1BQU1tRyxNQUFNLENBQUM0QixLQUFLLENBQUMxRixNQUFNLEdBQUc7b0JBQzVCckMsTUFBTStILEtBQUs7Z0JBQ2I7WUFDRjtZQUVBOztPQUVDLEdBQ0QsU0FBU2dGLFNBQVN6TSxLQUFLO2dCQUNyQixJQUFJK0gsVUFDQTJFLElBQ0E3SCxNQUNBQyxLQUNBdUYsS0FDQXNDLElBQ0FDLEtBQ0FDLFVBQ0FuTixRQUFRTSxNQUFNcUcsTUFBTSxFQUNwQnlHLE9BQU83TixNQUFNMkUsT0FBTyxFQUNwQnhGLE1BQU10QyxFQUFFc0MsR0FBRyxJQUNYd0wsT0FBT2hJLE9BQU96RSxJQUFJLENBQUN1QyxNQUFNRixLQUFLLENBQUN1TixNQUFNLEdBQ3JDQyxXQUFXcEQsUUFBUTBDLGNBQWMsQUFBQ3JCLENBQUFBLFdBQVc3TSxNQUFNc0IsTUFBTUYsS0FBSyxDQUFDeU4sU0FBUyxBQUFELElBQUssTUFBTWhPLE1BQU1pTyxPQUFPLEVBQy9GMU4sUUFBUVAsTUFBTU8sS0FBSyxFQUNuQjJOLFFBQVEsU0FBU3JMLEdBQUcsRUFBRXBELENBQUM7b0JBQUksT0FBT29ELE1BQU01RSxJQUFJd0IsSUFBSW1HLE1BQU07Z0JBQUk7Z0JBRTlELCtDQUErQztnQkFDL0MsSUFBSWlJLFFBQVFwTixNQUFNOEUsRUFBRSxJQUFJbUgsVUFBVTtvQkFDaENxQixXQUFXLENBQUVwRCxDQUFBQSxPQUFPaEksT0FBT0csTUFBTSxHQUFHb0gsTUFBTXBILE1BQU0sR0FBRyxDQUFBO2dCQUNyRDtnQkFFQSxJQUFJLENBQUMrSyxNQUFNO29CQUNULDZEQUE2RDtvQkFDN0RqSSxPQUFPbEQsUUFBUUM7b0JBQ2YscUVBQXFFO29CQUNyRWlMLFdBQVcvUSxFQUFFK0YsTUFBTSxDQUFDRCxRQUFRdUwsT0FBTyxLQUFNdkQsQ0FBQUEsT0FBTyxDQUFBLEtBQU07b0JBQ3RELHlGQUF5RjtvQkFDekYrQyxLQUFLcFAsS0FBS3NQO29CQUNWLDBIQUEwSDtvQkFDMUhELE1BQU1ELEtBQUtwUCxLQUFLcU07b0JBQ2hCLGtDQUFrQztvQkFDbEM4QyxLQUFLOUMsT0FBTztvQkFDWiw4QkFBOEI7b0JBQzlCN0IsV0FBV3JNLE1BQU0sQ0FBQ1ksS0FBSzhRLEtBQUssQ0FBQ1YsT0FBTyxFQUFFLElBQUloUixPQUFPMlIsUUFBUTtvQkFDekQsK0JBQStCO29CQUMvQnZJLE1BQU04SCxNQUFNN0U7b0JBQ1osd0NBQXdDO29CQUN4Q3NDLE1BQU0sQUFBQ3ZGLE1BQU1ELE9BQVEsT0FBTztvQkFFNUIvSSxFQUFFbUUsTUFBTSxDQUFDaEIsTUFBTUssS0FBSyxFQUFFO3dCQUNwQixhQUFhcU47d0JBQ2IsUUFBUTlIO3dCQUNSLE9BQU9DO3dCQUNQLE9BQU91Rjt3QkFDUCxPQUFPdUM7d0JBQ1AsWUFBWUM7b0JBQ2Q7b0JBRUEsdUVBQXVFO29CQUN2RSx1RUFBdUU7b0JBQ3ZFLHdFQUF3RTtvQkFDeEUsd0VBQXdFO29CQUN4RSxvRkFBb0Y7b0JBQ3BGLElBQUlHLFVBQVU7d0JBQ1osd0RBQXdEO3dCQUN4RC9OLE1BQU1vTixTQUFTLEdBQUdBO3dCQUNsQnBOLE1BQU02RSxPQUFPLEdBQUc7d0JBQ2hCZ0osT0FBTzt3QkFDUHROLE1BQU15TCxPQUFPLEdBQUcsQUFBQzdNLENBQUFBLE1BQU1vQixNQUFNeU4sU0FBUyxBQUFELElBQUs7b0JBQzVDO29CQUNBLElBQUloTyxNQUFNdUYsRUFBRSxJQUFJbUgsVUFBVTt3QkFDeEIxTSxNQUFNdUYsRUFBRSxHQUFHLElBQUlLO3dCQUNmckYsTUFBTXVFLEtBQUssR0FBR2MsT0FBTzVGLE1BQU1nRixLQUFLO3dCQUNoQ3pFLE1BQU11TixNQUFNLEdBQUdsSTtvQkFDakI7Z0JBQ0Y7Z0JBQ0EsdUVBQXVFO2dCQUN2RSxJQUFJc0UsTUFBTXBILE1BQU0sR0FBRyxLQUFLLENBQUNpTCxVQUFVO29CQUNqQ1Q7Z0JBQ0Y7Z0JBQ0Esc0NBQXNDO2dCQUN0Q3ZNLE1BQU00RCxPQUFPLEdBQUdrSjtZQUNsQjtZQUVBLHdCQUF3QjtZQUN4QlA7WUFDQXJILE9BQU9pRSxPQUFPO2dCQUNaLFFBQVE7Z0JBQ1IsUUFBUTtvQkFBRSxTQUFTekQ7Z0JBQU07Z0JBQ3pCLFVBQVU7Z0JBQ1YsV0FBVytHO2dCQUNYLGNBQWM7b0JBQWF4TixNQUFNbUgsSUFBSSxDQUFDO2dCQUFhO1lBQ3JEO1FBQ0Y7UUFFQSwwRUFBMEUsR0FFMUU7Ozs7OztLQU1DLEdBQ0QsU0FBU3JDLE1BQU1yRSxLQUFLLEVBQUVWLE9BQU87WUFDM0JBLFdBQVlBLENBQUFBLFVBQVUsQ0FBQyxDQUFBO1lBRXZCLElBQUlXO1lBQ0osSUFBSUQsaUJBQWlCRCxVQUFVO2dCQUM3QkUsV0FBV0Q7Z0JBQ1hBLFFBQVFBLE1BQU1FLFNBQVM7WUFDekI7WUFDQSxJQUFJME4sU0FDQXRKLFFBQ0F3SCxTQUNBeEwsT0FDQTZLLFNBQ0FrQyxRQUNBckgsUUFBUTFHLFFBQVEwRyxLQUFLLEVBQ3JCekcsUUFBUVMsTUFBTWlFLFNBQVMsRUFDdkJNLFFBQVF2RSxNQUFNdUUsS0FBSyxFQUNuQnpFLFFBQVFFLE1BQU1GLEtBQUs7WUFFdkIsMkNBQTJDO1lBQzNDLElBQUlFLE1BQU1vRSxPQUFPLEVBQUU7Z0JBQ2pCLGdFQUFnRTtnQkFDaEVFLFNBQVMsRUFBRXRFLE1BQU1zRSxNQUFNO2dCQUN2QnNKLFVBQVUzTixXQUFXQSxTQUFTc0wsT0FBTyxHQUFHcEwsTUFBTUg7Z0JBQzlDbUwsVUFBVW5MLE1BQU1tTCxPQUFPO2dCQUV2QixJQUFJN0csU0FBUy9FLE1BQU0rRSxNQUFNLEVBQUU7b0JBQ3pCL0UsTUFBTStFLE1BQU0sR0FBR0E7Z0JBQ2pCO2dCQUNBLElBQUl0RSxNQUFNK0UsS0FBSyxFQUFFO29CQUNmekUsUUFBUUYsTUFBTTtvQkFDZEUsTUFBTW1LLE9BQU8sR0FBR3pLLE1BQU0rRSxLQUFLO29CQUMzQi9FLE1BQU0wRyxJQUFJLENBQUNwRztvQkFDWCxJQUFJLENBQUNBLE1BQU1rSCxTQUFTLEVBQUU7d0JBQ3BCeEgsTUFBTStILEtBQUs7b0JBQ2I7Z0JBQ0Y7WUFDRjtZQUNBLDRCQUE0QjtZQUM1QixJQUFJL0gsTUFBTW9FLE9BQU8sRUFBRTtnQkFDakIsc0RBQXNEO2dCQUN0RDdFLE1BQU1PLEtBQUssQ0FBQ3VFLEtBQUssR0FBR3ZFLE1BQU11RSxLQUFLLEdBQUd1SjtnQkFDbEMscUNBQXFDO2dCQUNyQ1AsU0FBUzlOLE1BQU1PLEtBQUssQ0FBQ3VOLE1BQU0sR0FBR3ZOLE1BQU11TixNQUFNLEdBQUdPLFVBQVVySjtnQkFDdkQsOEJBQThCO2dCQUM5QmhGLE1BQU11RixFQUFFLEdBQUc5RSxNQUFNOEUsRUFBRSxHQUFHLElBQUl1STtnQkFDMUIsOENBQThDO2dCQUM5QzlOLE1BQU1vTixTQUFTLEdBQUczTSxNQUFNMk0sU0FBUyxHQUFHcEk7Z0JBQ3BDLGtDQUFrQztnQkFDbEN2RSxNQUFNb0UsT0FBTyxHQUFHd0osVUFBVXpDO2dCQUUxQixJQUFJbkwsTUFBTW9FLE9BQU8sRUFBRTtvQkFDakIsNkRBQTZEO29CQUM3RCw0REFBNEQ7b0JBQzVELElBQUksQ0FBQ3dKLFdBQVcsQUFBQzlCLENBQUFBLFVBQVUvUCxRQUFRLENBQUNpRSxNQUFNc0UsTUFBTSxDQUFDLEFBQUQsS0FBTSxNQUFNO3dCQUMxREMsUUFBUW5ILE1BQU0sTUFBTTBPO29CQUN0QjtvQkFDQSw0RUFBNEU7b0JBQzVFLElBQUl2SCxTQUFTdkUsTUFBTXVFLEtBQUssRUFBRTt3QkFDeEJBLFNBQVMzSCxLQUFLaVIsSUFBSSxDQUFDLEFBQUMxQyxDQUFBQSxVQUFVeUMsT0FBTSxJQUFLUDtvQkFDM0M7b0JBQ0FyTixNQUFNb0UsT0FBTyxHQUFHRyxTQUFTMEg7Z0JBQzNCO1lBQ0Y7WUFDQSx3QkFBd0I7WUFDeEIzTCxRQUFRRixNQUFNO1lBQ2RKLE1BQU0wRyxJQUFJLENBQUNwRztZQUNYLElBQUlBLE1BQU00RCxPQUFPLEVBQUU7Z0JBQ2pCbEUsTUFBTStILEtBQUs7WUFDYjtZQUNBLDhCQUE4QjtZQUM5QixJQUFJL0gsTUFBTW9FLE9BQU8sRUFBRTtnQkFDakIscUJBQXFCO2dCQUNyQnBFLE1BQU11RSxLQUFLLEdBQUdBO2dCQUNkLElBQUl0RSxVQUFVO29CQUNaRCxNQUFNd0UsUUFBUSxDQUFDOUIsSUFBSSxDQUFDekMsVUFBVTlELFNBQVNnRDtnQkFDekMsT0FBTyxJQUFJNkcsT0FBTztvQkFDaEJ4RSxNQUFNeEIsT0FBTzt3QkFBYXFFLE1BQU1yRSxPQUFPVjtvQkFBVTtnQkFDbkQsT0FBTztvQkFDTCtFLE1BQU1yRTtnQkFDUjtZQUNGLE9BQ0s7Z0JBQ0gsdURBQXVEO2dCQUN2RCxvREFBb0Q7Z0JBQ3BELElBQUlwQixRQUFRQyxPQUFPLEVBQUU7b0JBQ25CdUMsVUFBVTNDLE1BQU0sZUFBZUE7Z0JBQ2pDO2dCQUNBLGNBQWM7Z0JBQ2R1QixNQUFNMEcsSUFBSSxDQUFDO1lBQ2I7UUFDRjtRQUVBLDBFQUEwRSxHQUUxRTs7Ozs7Ozs7Ozs7OztLQWFDLEdBQ0QsU0FBU29ILElBQUl4TyxPQUFPO1lBQ2xCLElBQUlDLFFBQVEsSUFBSSxFQUNaZSxRQUFRRixNQUFNO1lBRWxCLDhEQUE4RDtZQUM5RGIsTUFBTTZFLE9BQU8sR0FBRztZQUNoQjdFLE1BQU1rSSxLQUFLO1lBQ1hsSSxNQUFNNkUsT0FBTyxHQUFHO1lBRWhCN0UsTUFBTWdGLEtBQUssR0FBR2hGLE1BQU1vTixTQUFTO1lBQzdCcE4sTUFBTU8sS0FBSyxDQUFDeU4sU0FBUyxHQUFHblIsRUFBRXNDLEdBQUc7WUFDN0JhLE1BQU1tSCxJQUFJLENBQUNwRztZQUVYLElBQUksQ0FBQ0EsTUFBTWtILFNBQVMsRUFBRTtnQkFDcEJsSSxVQUFVO29CQUFFLFNBQVMsQUFBQyxDQUFBLEFBQUNBLENBQUFBLFVBQVVBLFdBQVdBLFFBQVEwRyxLQUFLLEFBQUQsS0FBTSxPQUFPekcsTUFBTXlHLEtBQUssR0FBRzFHLE9BQU0sS0FBTVYsUUFBUUUsT0FBTztnQkFBQztnQkFFL0cseUNBQXlDO2dCQUN6QyxJQUFJUyxNQUFNMEUsU0FBUyxFQUFFO29CQUNuQixJQUFJMUUsTUFBTXdILEtBQUssRUFBRTt3QkFDZmhILFNBQVNSO29CQUNYLE9BQU87d0JBQ0w4RSxNQUFNOUUsT0FBT0Q7b0JBQ2Y7Z0JBQ0YsT0FFSztvQkFDSG9OLFFBQVFuTixPQUFPRDtnQkFDakI7WUFDRjtZQUNBLE9BQU9DO1FBQ1Q7UUFFQSwwRUFBMEUsR0FFMUUsNEVBQTRFO1FBQzVFLDhFQUE4RTtRQUM5RSx5RUFBeUU7UUFDekUsZ0ZBQWdGO1FBQ2hGLHlFQUF5RTtRQUN6RSwyQ0FBMkM7UUFDM0NuRCxFQUFFbUUsTUFBTSxDQUFDbEUsV0FBVztZQUVsQjs7Ozs7O09BTUMsR0FDRCxXQUFXO2dCQUVUOzs7Ozs7U0FNQyxHQUNELFNBQVM7Z0JBRVQ7Ozs7O1NBS0MsR0FDRCxTQUFTO2dCQUVUOzs7O1NBSUMsR0FDRCxTQUFTO2dCQUVUOzs7Ozs7U0FNQyxHQUNELE1BQU01QjtnQkFFTjs7Ozs7U0FLQyxHQUNELGFBQWE7Z0JBRWI7Ozs7Ozs7U0FPQyxHQUNELFdBQVc7Z0JBRVg7Ozs7O1NBS0MsR0FDRCxjQUFjO2dCQUVkOzs7OztTQUtDLEdBQ0QsV0FBVztnQkFFWDs7Ozs7U0FLQyxHQUNELFFBQVFBO2dCQUVSOzs7OztTQUtDLEdBQ0QsV0FBV0E7Z0JBRVg7Ozs7O1NBS0MsR0FDRCxjQUFjQTtnQkFFZDs7Ozs7U0FLQyxHQUNELFdBQVdBO2dCQUVYOzs7OztTQUtDLEdBQ0QsV0FBV0E7Z0JBRVg7Ozs7O1NBS0MsR0FDRCxXQUFXQTtnQkFFWDs7Ozs7U0FLQyxHQUNELFdBQVdBO1lBQ2I7WUFFQTs7Ozs7OztPQU9DLEdBQ0QsWUFBWTBCLFFBQVE0UixRQUFRLElBQUl0UyxTQUFRLGVBQWdCO2dCQUN0RCxlQUFlVSxRQUFRNlIsU0FBUyxJQUFJN1IsUUFBUTZSLFNBQVMsQ0FBQ0MsU0FBUyxJQUFJO2dCQUNuRSxVQUFVO2dCQUNWLFdBQVc7Z0JBQ1gsUUFBUTtnQkFDUixnQkFBZ0I7Z0JBQ2hCLE1BQU07Z0JBQ04sY0FBYztnQkFDZCxXQUFXO2dCQUNYLFlBQVk7b0JBQ1YsT0FBTyxJQUFJLENBQUNDLFdBQVcsSUFBSTtnQkFDN0I7WUFDRjtZQUVBOzs7Ozs7T0FNQyxHQUNELFdBQVc7UUFDYjtRQUVBOVIsRUFBRW1FLE1BQU0sQ0FBQ2xFLFdBQVc7WUFDbEIsVUFBVXFJO1lBQ1YsZ0JBQWdCWTtZQUNoQixVQUFVRTtZQUNWLFFBQVF5QjtZQUNSLGdCQUFnQi9LO1lBQ2hCLFdBQVcwQztRQUNiO1FBRUEsbUNBQW1DO1FBQ25DeEMsRUFBRXdILElBQUksQ0FBQztZQUFDO1lBQVE7WUFBVztZQUFVO1lBQU87WUFBVztZQUFPO1NBQVMsRUFBRSxTQUFTdUssVUFBVTtZQUMxRjlSLFNBQVMsQ0FBQzhSLFdBQVcsR0FBRy9SLENBQUMsQ0FBQytSLFdBQVc7UUFDdkM7UUFFQSwwRUFBMEUsR0FFMUUvUixFQUFFbUUsTUFBTSxDQUFDbEUsVUFBVVksU0FBUyxFQUFFO1lBRTVCOzs7OztPQUtDLEdBQ0QsU0FBUztZQUVUOzs7OztPQUtDLEdBQ0QsVUFBVTtZQUVWOzs7OztPQUtDLEdBQ0QsTUFBTTtZQUVOOzs7OztPQUtDLEdBQ0QsWUFBWXhDO1lBRVo7Ozs7O09BS0MsR0FDRCxTQUFTQTtZQUVUOzs7OztPQUtDLEdBQ0QsTUFBTUE7WUFFTjs7Ozs7T0FLQyxHQUNELFdBQVc7WUFFWDs7Ozs7T0FLQyxHQUNELFdBQVc7WUFFWDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BNERDLEdBQ0QsU0FBUzJCLEVBQUVpRixJQUFJO1lBRWY7Ozs7O09BS0MsR0FDRCxZQUFZakYsRUFBRWlGLElBQUk7WUFFbEI7Ozs7O09BS0MsR0FDRCxTQUFTO2dCQUVQOzs7OztTQUtDLEdBQ0QsT0FBTztnQkFFUDs7Ozs7U0FLQyxHQUNELE9BQU87Z0JBRVA7Ozs7O1NBS0MsR0FDRCxPQUFPO2dCQUVQOzs7OztTQUtDLEdBQ0QsYUFBYTtnQkFFYjs7Ozs7U0FLQyxHQUNELFFBQVE7Z0JBRVI7Ozs7O1NBS0MsR0FDRCxVQUFVLEVBQUU7Z0JBRVo7Ozs7O1NBS0MsR0FDRCxZQUFZO1lBQ2Q7WUFFQTs7Ozs7T0FLQyxHQUNELFNBQVM7Z0JBRVA7Ozs7O1NBS0MsR0FDRCxTQUFTO2dCQUVUOzs7OztTQUtDLEdBQ0QsV0FBVztnQkFFWDs7Ozs7U0FLQyxHQUNELFVBQVU7Z0JBRVY7Ozs7O1NBS0MsR0FDRCxhQUFhO1lBQ2Y7UUFDRjtRQUVBakYsRUFBRW1FLE1BQU0sQ0FBQ2xFLFVBQVVZLFNBQVMsRUFBRTtZQUM1QixTQUFTOEs7WUFDVCxTQUFTL0g7WUFDVCxXQUFXcUY7WUFDWCxRQUFRcUI7WUFDUixhQUFhWDtZQUNiLE9BQU9VO1lBQ1AsTUFBTTNDO1lBQ04sU0FBUzJEO1lBQ1QsT0FBT3FHO1lBQ1AsWUFBWTdEO1FBQ2Q7UUFFQSwwRUFBMEUsR0FFMUU3TixFQUFFbUUsTUFBTSxDQUFDUixTQUFTOUMsU0FBUyxFQUFFO1lBRTNCOzs7OztPQUtDLEdBQ0QsYUFBYTtZQUViOzs7OztPQUtDLEdBQ0QsVUFBVTtZQUVWOzs7OztPQUtDLEdBQ0QsV0FBVztZQUVYOzs7OztPQUtDLEdBQ0QsYUFBYTtRQUNmO1FBRUFiLEVBQUVtRSxNQUFNLENBQUNSLFNBQVM5QyxTQUFTLEVBQUU7WUFDM0IsV0FBVytHO1FBQ2I7UUFFQSwwRUFBMEUsR0FFMUU1SCxFQUFFbUUsTUFBTSxDQUFDSCxNQUFNbkQsU0FBUyxFQUFFO1lBRXhCOzs7OztPQUtDLEdBQ0QsV0FBVztZQUVYOzs7OztPQUtDLEdBQ0QsYUFBYTtZQUViOzs7OztPQUtDLEdBQ0QsaUJBQWlCeEM7WUFFakI7Ozs7O09BS0MsR0FDRCxVQUFVQTtZQUVWOzs7OztPQUtDLEdBQ0QsVUFBVUE7WUFFVjs7Ozs7T0FLQyxHQUNELGFBQWE7WUFFYjs7Ozs7T0FLQyxHQUNELFFBQVE7UUFDVjtRQUVBLDBFQUEwRSxHQUUxRTs7Ozs7O0tBTUMsR0FDRCtGLE1BQU1sQixPQUFPLEdBQUc7WUFFZDs7Ozs7T0FLQyxHQUNELFFBQVE3RTtRQUNWO1FBRUEsMEVBQTBFLEdBRTFFMkIsRUFBRW1FLE1BQU0sQ0FBQ0MsTUFBTXZELFNBQVMsRUFBRTtZQUV4Qjs7Ozs7T0FLQyxHQUNELFVBQVU7WUFFVjs7Ozs7T0FLQyxHQUNELFdBQVc7WUFFWDs7Ozs7T0FLQyxHQUNELFdBQVc7UUFDYjtRQUVBYixFQUFFbUUsTUFBTSxDQUFDQyxNQUFNdkQsU0FBUyxFQUFFO1lBQ3hCLFNBQVNvSztZQUNULE9BQU9LO1lBQ1AsU0FBU0M7WUFDVCxRQUFRakI7WUFDUixVQUFVbUI7WUFDVixRQUFROUssU0FBU2tLLElBQUk7WUFDckIsYUFBYWxCO1lBQ2IsT0FBT1U7WUFDUCxNQUFNM0M7WUFDTixPQUFPL0csU0FBU3VKLEdBQUc7WUFDbkIsUUFBUTdJO1lBQ1IsU0FBUzhKO1lBQ1QsT0FBT1M7WUFDUCxXQUFXakwsU0FBU3FSLE9BQU87WUFDM0IsU0FBU3pRO1lBQ1QsU0FBU0M7WUFDVCxRQUFRYixTQUFTaUksSUFBSTtZQUNyQixVQUFVakksU0FBU3NKLE1BQU07WUFDekIsV0FBV3RJO1FBQ2I7UUFFQSwwRUFBMEUsR0FFMUUscUNBQXFDO1FBQ3JDM0IsRUFBRW1FLE1BQU0sQ0FBQ2xFLFdBQVc7WUFDbEIsWUFBWTBEO1lBQ1osU0FBU0s7WUFDVCxTQUFTSTtRQUNYO1FBRUEsMEVBQTBFLEdBRTFFLHVDQUF1QztRQUN2Q3BFLEVBQUV3SCxJQUFJLENBQUM7WUFBQztZQUFRO1lBQVc7WUFBVztZQUFPO1NBQVMsRUFBRSxTQUFTdUssVUFBVTtZQUN6RSxJQUFJRSxPQUFPalMsQ0FBQyxDQUFDK1IsV0FBVztZQUN4QjNOLE1BQU12RCxTQUFTLENBQUNrUixXQUFXLEdBQUc7Z0JBQzVCLElBQUlwTixPQUFPO29CQUFDLElBQUk7aUJBQUM7Z0JBQ2pCdEQsS0FBSzZELEtBQUssQ0FBQ1AsTUFBTVE7Z0JBQ2pCLE9BQU84TSxLQUFLL00sS0FBSyxDQUFDbEYsR0FBRzJFO1lBQ3ZCO1FBQ0Y7UUFFQSxxRUFBcUU7UUFDckUsOEJBQThCO1FBQzlCM0UsRUFBRXdILElBQUksQ0FBQztZQUFDO1lBQU87WUFBUztTQUFTLEVBQUUsU0FBU3VLLFVBQVU7WUFDcEQsSUFBSUUsT0FBT3RSLFFBQVEsQ0FBQ29SLFdBQVc7WUFFL0IzTixNQUFNdkQsU0FBUyxDQUFDa1IsV0FBVyxHQUFHO2dCQUM1QixJQUFJdk4sUUFBUSxJQUFJLEVBQ1pLLFNBQVNvTixLQUFLL00sS0FBSyxDQUFDVixPQUFPVztnQkFFL0IsSUFBSVgsTUFBTXlCLE1BQU0sS0FBSyxHQUFHO29CQUN0QixPQUFPekIsS0FBSyxDQUFDLEVBQUU7Z0JBQ2pCO2dCQUNBLE9BQU9LO1lBQ1Q7UUFDRjtRQUVBLHFFQUFxRTtRQUNyRSx1QkFBdUI7UUFDdkJULE1BQU12RCxTQUFTLENBQUNjLE9BQU8sR0FBRztZQUN4QixJQUFJNkMsUUFBUSxJQUFJO1lBQ2hCN0MsUUFBUXVELEtBQUssQ0FBQ1YsT0FBT1c7WUFDckIsT0FBT1gsTUFBTXlCLE1BQU07UUFDckI7UUFFQSxPQUFPaEc7SUFDVDtJQUVBLDRFQUE0RSxHQUU1RSxvQkFBb0I7SUFDcEIseUZBQXlGO0lBQ3pGLElBQUksT0FBT3ZCLFVBQVUsY0FBYyxPQUFPQSxPQUFPQyxHQUFHLElBQUksWUFBWUQsT0FBT0MsR0FBRyxFQUFFO1FBQzlFLDZFQUE2RTtRQUM3RUQsT0FBTztZQUFDO1lBQVU7U0FBVyxFQUFFLFNBQVNzQixDQUFDLEVBQUUyUixRQUFRO1lBQ2pELE9BQU83UixhQUFhO2dCQUNsQixLQUFLRTtnQkFDTCxZQUFZMlI7WUFDZDtRQUNGO0lBQ0YsT0FDSztRQUNILElBQUkxUixZQUFZSDtRQUVoQix5RkFBeUY7UUFDekYsSUFBSWxCLGVBQWVHLFlBQVk7WUFDN0Isc0JBQXNCO1lBQ3RCLElBQUlRLGVBQWU7Z0JBQ2hCUixDQUFBQSxXQUFXRixPQUFPLEdBQUdvQixTQUFRLEVBQUdBLFNBQVMsR0FBR0E7WUFDL0M7WUFDQSwrQkFBK0I7WUFDL0JyQixZQUFZcUIsU0FBUyxHQUFHQTtRQUMxQixPQUNLO1lBQ0gsK0JBQStCO1lBQy9CMUIsS0FBSzBCLFNBQVMsR0FBR0E7UUFDbkI7SUFDRjtBQUNGLENBQUEsRUFBRXFHLElBQUksQ0FBQyxJQUFJIn0=