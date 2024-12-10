(function(window, undefined) {
    'use strict';
    /** Used to assign each benchmark an incrimented id */ var counter = 0;
    /** Detect DOM document object */ var doc = isHostType(window, 'document') && document;
    /** Detect free variable `define` */ var freeDefine = typeof define == 'function' && typeof define.amd == 'object' && define.amd && define;
    /** Detect free variable `exports` */ var freeExports = typeof exports == 'object' && exports && (typeof global == 'object' && global && global == global.global && (window = global), exports);
    /** Detect free variable `require` */ var freeRequire = typeof require == 'function' && require;
    /** Used to crawl all properties regardless of enumerability */ var getAllKeys = Object.getOwnPropertyNames;
    /** Used to get property descriptors */ var getDescriptor = Object.getOwnPropertyDescriptor;
    /** Used in case an object doesn't have its own method */ var hasOwnProperty = {}.hasOwnProperty;
    /** Used to check if an object is extensible */ var isExtensible = Object.isExtensible || function() {
        return true;
    };
    /** Used to access Wade Simmons' Node microtime module */ var microtimeObject = req('microtime');
    /** Used to access the browser's high resolution timer */ var perfObject = isHostType(window, 'performance') && performance;
    /** Used to call the browser's high resolution timer */ var perfName = perfObject && (perfObject.now && 'now' || perfObject.webkitNow && 'webkitNow');
    /** Used to access Node's high resolution timer */ var processObject = isHostType(window, 'process') && process;
    /** Used to check if an own property is enumerable */ var propertyIsEnumerable = {}.propertyIsEnumerable;
    /** Used to set property descriptors */ var setDescriptor = Object.defineProperty;
    /** Used to resolve a value's internal [[Class]] */ var toString = {}.toString;
    /** Used to prevent a `removeChild` memory leak in IE < 9 */ var trash = doc && doc.createElement('div');
    /** Used to integrity check compiled tests */ var uid = 'uid' + +new Date;
    /** Used to avoid infinite recursion when methods call each other */ var calledBy = {};
    /** Used to avoid hz of Infinity */ var divisors = {
        '1': 4096,
        '2': 512,
        '3': 64,
        '4': 8,
        '5': 0
    };
    /**
   * T-Distribution two-tailed critical values for 95% confidence
   * http://www.itl.nist.gov/div898/handbook/eda/section3/eda3672.htm
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
   * Critical Mann-Whitney U-values for 95% confidence
   * http://www.saburchill.com/IBbiology/stats/003.html
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
    /**
   * An object used to flag environments/features.
   *
   * @static
   * @memberOf Benchmark
   * @type Object
   */ var support = {};
    (function() {
        /**
     * Detect Adobe AIR.
     *
     * @memberOf Benchmark.support
     * @type Boolean
     */ support.air = isClassOf(window.runtime, 'ScriptBridgingProxyObject');
        /**
     * Detect if `arguments` objects have the correct internal [[Class]] value.
     *
     * @memberOf Benchmark.support
     * @type Boolean
     */ support.argumentsClass = isClassOf(arguments, 'Arguments');
        /**
     * Detect if in a browser environment.
     *
     * @memberOf Benchmark.support
     * @type Boolean
     */ support.browser = doc && isHostType(window, 'navigator');
        /**
     * Detect if strings support accessing characters by index.
     *
     * @memberOf Benchmark.support
     * @type Boolean
     */ support.charByIndex = // IE 8 supports indexes on string literals but not string objects
        'x'[0] + Object('x')[0] == 'xx';
        /**
     * Detect if strings have indexes as own properties.
     *
     * @memberOf Benchmark.support
     * @type Boolean
     */ support.charByOwnIndex = // Narwhal, Rhino, RingoJS, IE 8, and Opera < 10.52 support indexes on
        // strings but don't detect them as own properties
        support.charByIndex && hasKey('x', '0');
        /**
     * Detect if Java is enabled/exposed.
     *
     * @memberOf Benchmark.support
     * @type Boolean
     */ support.java = isClassOf(window.java, 'JavaPackage');
        /**
     * Detect if the Timers API exists.
     *
     * @memberOf Benchmark.support
     * @type Boolean
     */ support.timeout = isHostType(window, 'setTimeout') && isHostType(window, 'clearTimeout');
        /**
     * Detect if functions support decompilation.
     *
     * @name decompilation
     * @memberOf Benchmark.support
     * @type Boolean
     */ try {
            // Safari 2.x removes commas in object literals
            // from Function#toString results
            // http://webk.it/11609
            // Firefox 3.6 and Opera 9.25 strip grouping
            // parentheses from Function#toString results
            // http://bugzil.la/559438
            support.decompilation = Function('return (' + function(x) {
                return {
                    'x': '' + (1 + x) + '',
                    'y': 0
                };
            } + ')')()(0).x === '1';
        } catch (e) {
            support.decompilation = false;
        }
        /**
     * Detect ES5+ property descriptor API.
     *
     * @name descriptors
     * @memberOf Benchmark.support
     * @type Boolean
     */ try {
            var o = {};
            support.descriptors = (setDescriptor(o, o, o), 'value' in getDescriptor(o, o));
        } catch (e) {
            support.descriptors = false;
        }
        /**
     * Detect ES5+ Object.getOwnPropertyNames().
     *
     * @name getAllKeys
     * @memberOf Benchmark.support
     * @type Boolean
     */ try {
            support.getAllKeys = /\bvalueOf\b/.test(getAllKeys(Object.prototype));
        } catch (e) {
            support.getAllKeys = false;
        }
        /**
     * Detect if own properties are iterated before inherited properties (all but IE < 9).
     *
     * @name iteratesOwnLast
     * @memberOf Benchmark.support
     * @type Boolean
     */ support.iteratesOwnFirst = function() {
            var props = [];
            function ctor() {
                this.x = 1;
            }
            ctor.prototype = {
                'y': 1
            };
            for(var prop in new ctor){
                props.push(prop);
            }
            return props[0] == 'x';
        }();
        /**
     * Detect if a node's [[Class]] is resolvable (all but IE < 9)
     * and that the JS engine errors when attempting to coerce an object to a
     * string without a `toString` property value of `typeof` "function".
     *
     * @name nodeClass
     * @memberOf Benchmark.support
     * @type Boolean
     */ try {
            support.nodeClass = ({
                'toString': 0
            } + '', toString.call(doc || 0) != '[object Object]');
        } catch (e) {
            support.nodeClass = true;
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
    * @type Function|Object
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
    */ 'stop': null // lazy defined in `clock()`
    };
    /** Shortcut for inverse results */ var noArgumentsClass = !support.argumentsClass, noCharByIndex = !support.charByIndex, noCharByOwnIndex = !support.charByOwnIndex;
    /** Math shortcuts */ var abs = Math.abs, floor = Math.floor, max = Math.max, min = Math.min, pow = Math.pow, sqrt = Math.sqrt;
    /*--------------------------------------------------------------------------*/ /**
   * The Benchmark constructor.
   *
   * @constructor
   * @param {String} name A name to identify the benchmark.
   * @param {Function|String} fn The test to benchmark.
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
   *   // displayed by Benchmark#toString if `name` is not available
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
   *     // call resolve() when the deferred test is finished
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
   *   'My name is '.concat(this.name); // My name is foo
   * });
   */ function Benchmark(name, fn, options) {
        var me = this;
        // allow instance creation without the `new` operator
        if (me == null || me.constructor != Benchmark) {
            return new Benchmark(name, fn, options);
        }
        // juggle arguments
        if (isClassOf(name, 'Object')) {
            // 1 argument (options)
            options = name;
        } else if (isClassOf(name, 'Function')) {
            // 2 arguments (fn, options)
            options = fn;
            fn = name;
        } else if (isClassOf(fn, 'Object')) {
            // 2 arguments (name, options)
            options = fn;
            fn = null;
            me.name = name;
        } else {
            // 3 arguments (name, fn [, options])
            me.name = name;
        }
        setOptions(me, options);
        me.id || (me.id = ++counter);
        me.fn == null && (me.fn = fn);
        me.stats = deepClone(me.stats);
        me.times = deepClone(me.times);
    }
    /**
   * The Deferred constructor.
   *
   * @constructor
   * @memberOf Benchmark
   * @param {Object} clone The cloned benchmark instance.
   */ function Deferred(clone) {
        var me = this;
        if (me == null || me.constructor != Deferred) {
            return new Deferred(clone);
        }
        me.benchmark = clone;
        clock(me);
    }
    /**
   * The Event constructor.
   *
   * @constructor
   * @memberOf Benchmark
   * @param {String|Object} type The event type.
   */ function Event(type) {
        var me = this;
        return me == null || me.constructor != Event ? new Event(type) : type instanceof Event ? type : extend(me, {
            'timeStamp': +new Date
        }, typeof type == 'string' ? {
            'type': type
        } : type);
    }
    /**
   * The Suite constructor.
   *
   * @constructor
   * @memberOf Benchmark
   * @param {String} name A name to identify the suite.
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
        var me = this;
        // allow instance creation without the `new` operator
        if (me == null || me.constructor != Suite) {
            return new Suite(name, options);
        }
        // juggle arguments
        if (isClassOf(name, 'Object')) {
            // 1 argument (options)
            options = name;
        } else {
            // 2 arguments (name [, options])
            me.name = name;
        }
        setOptions(me, options);
    }
    /*--------------------------------------------------------------------------*/ /**
   * Note: Some array methods have been implemented in plain JavaScript to avoid
   * bugs in IE, Opera, Rhino, and Mobile Safari.
   *
   * IE compatibility mode and IE < 9 have buggy Array `shift()` and `splice()`
   * functions that fail to remove the last element, `object[0]`, of
   * array-like-objects even though the `length` property is set to `0`.
   * The `shift()` method is buggy in IE 8 compatibility mode, while `splice()`
   * is buggy regardless of mode in IE < 9 and buggy in compatibility mode in IE 9.
   *
   * In Opera < 9.50 and some older/beta Mobile Safari versions using `unshift()`
   * generically to augment the `arguments` object will pave the value at index 0
   * without incrimenting the other values's indexes.
   * https://github.com/documentcloud/underscore/issues/9
   *
   * Rhino and environments it powers, like Narwhal and RingoJS, may have
   * buggy Array `concat()`, `reverse()`, `shift()`, `slice()`, `splice()` and
   * `unshift()` functions that make sparse arrays non-sparse by assigning the
   * undefined indexes a value of undefined.
   * https://github.com/mozilla/rhino/commit/702abfed3f8ca043b2636efd31c14ba7552603dd
   */ /**
   * Creates an array containing the elements of the host array followed by the
   * elements of each argument in order.
   *
   * @memberOf Benchmark.Suite
   * @returns {Array} The new array.
   */ function concat() {
        var value, j = -1, length = arguments.length, result = slice.call(this), index = result.length;
        while(++j < length){
            value = arguments[j];
            if (isClassOf(value, 'Array')) {
                for(var k = 0, l = value.length; k < l; k++, index++){
                    if (k in value) {
                        result[index] = value[k];
                    }
                }
            } else {
                result[index++] = value;
            }
        }
        return result;
    }
    /**
   * Utility function used by `shift()`, `splice()`, and `unshift()`.
   *
   * @private
   * @param {Number} start The index to start inserting elements.
   * @param {Number} deleteCount The number of elements to delete from the insert point.
   * @param {Array} elements The elements to insert.
   * @returns {Array} An array of deleted elements.
   */ function insert(start, deleteCount, elements) {
        // `result` should have its length set to the `deleteCount`
        // see https://bugs.ecmascript.org/show_bug.cgi?id=332
        var deleteEnd = start + deleteCount, elementCount = elements ? elements.length : 0, index = start - 1, length = start + elementCount, object = this, result = Array(deleteCount), tail = slice.call(object, deleteEnd);
        // delete elements from the array
        while(++index < deleteEnd){
            if (index in object) {
                result[index - start] = object[index];
                delete object[index];
            }
        }
        // insert elements
        index = start - 1;
        while(++index < length){
            object[index] = elements[index - start];
        }
        // append tail elements
        start = index--;
        length = max(0, (object.length >>> 0) - deleteCount + elementCount);
        while(++index < length){
            if (index - start in tail) {
                object[index] = tail[index - start];
            } else if (index in object) {
                delete object[index];
            }
        }
        // delete excess elements
        deleteCount = deleteCount > elementCount ? deleteCount - elementCount : 0;
        while(deleteCount--){
            index = length + deleteCount;
            if (index in object) {
                delete object[index];
            }
        }
        object.length = length;
        return result;
    }
    /**
   * Rearrange the host array's elements in reverse order.
   *
   * @memberOf Benchmark.Suite
   * @returns {Array} The reversed array.
   */ function reverse() {
        var upperIndex, value, index = -1, object = Object(this), length = object.length >>> 0, middle = floor(length / 2);
        if (length > 1) {
            while(++index < middle){
                upperIndex = length - index - 1;
                value = upperIndex in object ? object[upperIndex] : uid;
                if (index in object) {
                    object[upperIndex] = object[index];
                } else {
                    delete object[upperIndex];
                }
                if (value != uid) {
                    object[index] = value;
                } else {
                    delete object[index];
                }
            }
        }
        return object;
    }
    /**
   * Removes the first element of the host array and returns it.
   *
   * @memberOf Benchmark.Suite
   * @returns {Mixed} The first element of the array.
   */ function shift() {
        return insert.call(this, 0, 1)[0];
    }
    /**
   * Creates an array of the host array's elements from the start index up to,
   * but not including, the end index.
   *
   * @memberOf Benchmark.Suite
   * @param {Number} start The starting index.
   * @param {Number} end The end index.
   * @returns {Array} The new array.
   */ function slice(start, end) {
        var index = -1, object = Object(this), length = object.length >>> 0, result = [];
        start = toInteger(start);
        start = start < 0 ? max(length + start, 0) : min(start, length);
        start--;
        end = end == null ? length : toInteger(end);
        end = end < 0 ? max(length + end, 0) : min(end, length);
        while((++index, ++start) < end){
            if (start in object) {
                result[index] = object[start];
            }
        }
        return result;
    }
    /**
   * Allows removing a range of elements and/or inserting elements into the
   * host array.
   *
   * @memberOf Benchmark.Suite
   * @param {Number} start The start index.
   * @param {Number} deleteCount The number of elements to delete.
   * @param {Mixed} [val1, val2, ...] values to insert at the `start` index.
   * @returns {Array} An array of removed elements.
   */ function splice(start, deleteCount) {
        var object = Object(this), length = object.length >>> 0;
        start = toInteger(start);
        start = start < 0 ? max(length + start, 0) : min(start, length);
        // support the de-facto SpiderMonkey extension
        // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/splice#Parameters
        // https://bugs.ecmascript.org/show_bug.cgi?id=429
        deleteCount = arguments.length == 1 ? length - start : min(max(toInteger(deleteCount), 0), length - start);
        return insert.call(object, start, deleteCount, slice.call(arguments, 2));
    }
    /**
   * Converts the specified `value` to an integer.
   *
   * @private
   * @param {Mixed} value The value to convert.
   * @returns {Number} The resulting integer.
   */ function toInteger(value) {
        value = +value;
        return value === 0 || !isFinite(value) ? value || 0 : value - value % 1;
    }
    /**
   * Appends arguments to the host array.
   *
   * @memberOf Benchmark.Suite
   * @returns {Number} The new length.
   */ function unshift() {
        var object = Object(this);
        insert.call(object, 0, 0, arguments);
        return object.length;
    }
    /*--------------------------------------------------------------------------*/ /**
   * A generic `Function#bind` like method.
   *
   * @private
   * @param {Function} fn The function to be bound to `thisArg`.
   * @param {Mixed} thisArg The `this` binding for the given function.
   * @returns {Function} The bound function.
   */ function bind(fn, thisArg) {
        return function() {
            fn.apply(thisArg, arguments);
        };
    }
    /**
   * Creates a function from the given arguments string and body.
   *
   * @private
   * @param {String} args The comma separated function arguments.
   * @param {String} body The function body.
   * @returns {Function} The new function.
   */ function createFunction() {
        // lazy define
        createFunction = function(args, body) {
            var result, anchor = freeDefine ? define.amd : Benchmark, prop = uid + 'createFunction';
            runScript((freeDefine ? 'define.amd.' : 'Benchmark.') + prop + '=function(' + args + '){' + body + '}');
            result = anchor[prop];
            delete anchor[prop];
            return result;
        };
        // fix JaegerMonkey bug
        // http://bugzil.la/639720
        createFunction = support.browser && (createFunction('', 'return"' + uid + '"') || noop)() == uid ? createFunction : Function;
        return createFunction.apply(null, arguments);
    }
    /**
   * Delay the execution of a function based on the benchmark's `delay` property.
   *
   * @private
   * @param {Object} bench The benchmark instance.
   * @param {Object} fn The function to execute.
   */ function delay(bench, fn) {
        bench._timerId = setTimeout(fn, bench.delay * 1e3);
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
   * Iterates over an object's properties, executing the `callback` for each.
   * Callbacks may terminate the loop by explicitly returning `false`.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function executed per own property.
   * @param {Object} [options] The options object.
   * @returns {Object} Returns the object iterated over.
   */ function forProps() {
        var forShadowed, skipSeen, forArgs = true, shadowed = [
            'constructor',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'toLocaleString',
            'toString',
            'valueOf'
        ];
        (function(enumFlag, key) {
            // must use a non-native constructor to catch the Safari 2 issue
            function Klass() {
                this.valueOf = 0;
            }
            ;
            Klass.prototype.valueOf = 0;
            // check various for-in bugs
            for(key in new Klass){
                enumFlag += key == 'valueOf' ? 1 : 0;
            }
            // check if `arguments` objects have non-enumerable indexes
            for(key in arguments){
                key == '0' && (forArgs = false);
            }
            // Safari 2 iterates over shadowed properties twice
            // http://replay.waybackmachine.org/20090428222941/http://tobielangel.com/2007/1/29/for-in-loop-broken-in-safari/
            skipSeen = enumFlag == 2;
            // IE < 9 incorrectly makes an object's properties non-enumerable if they have
            // the same name as other non-enumerable properties in its prototype chain.
            forShadowed = !enumFlag;
        })(0);
        // lazy define
        forProps = function(object, callback, options) {
            options || (options = {});
            var result = object;
            object = Object(object);
            var ctor, key, keys, skipCtor, done = !result, which = options.which, allFlag = which == 'all', index = -1, iteratee = object, length = object.length, ownFlag = allFlag || which == 'own', seen = {}, skipProto = isClassOf(object, 'Function'), thisArg = options.bind;
            if (thisArg !== undefined) {
                callback = bind(callback, thisArg);
            }
            // iterate all properties
            if (allFlag && support.getAllKeys) {
                for(index = 0, keys = getAllKeys(object), length = keys.length; index < length; index++){
                    key = keys[index];
                    if (callback(object[key], key, object) === false) {
                        break;
                    }
                }
            } else {
                for(key in object){
                    // Firefox < 3.6, Opera > 9.50 - Opera < 11.60, and Safari < 5.1
                    // (if the prototype or a property on the prototype has been set)
                    // incorrectly set a function's `prototype` property [[Enumerable]] value
                    // to `true`. Because of this we standardize on skipping the `prototype`
                    // property of functions regardless of their [[Enumerable]] value.
                    if (done = !(skipProto && key == 'prototype') && !(skipSeen && (hasKey(seen, key) || !(seen[key] = true))) && (!ownFlag || ownFlag && hasKey(object, key)) && callback(object[key], key, object) === false) {
                        break;
                    }
                }
                // in IE < 9 strings don't support accessing characters by index
                if (!done && (forArgs && isArguments(object) || (noCharByIndex || noCharByOwnIndex) && isClassOf(object, 'String') && (iteratee = noCharByIndex ? object.split('') : object))) {
                    while(++index < length){
                        if (done = callback(iteratee[index], String(index), object) === false) {
                            break;
                        }
                    }
                }
                if (!done && forShadowed) {
                    // Because IE < 9 can't set the `[[Enumerable]]` attribute of an existing
                    // property and the `constructor` property of a prototype defaults to
                    // non-enumerable, we manually skip the `constructor` property when we
                    // think we are iterating over a `prototype` object.
                    ctor = object.constructor;
                    skipCtor = ctor && ctor.prototype && ctor.prototype.constructor === ctor;
                    for(index = 0; index < 7; index++){
                        key = shadowed[index];
                        if (!(skipCtor && key == 'constructor') && hasKey(object, key) && callback(object[key], key, object) === false) {
                            break;
                        }
                    }
                }
            }
            return result;
        };
        return forProps.apply(null, arguments);
    }
    /**
   * Gets the name of the first argument from a function's source.
   *
   * @private
   * @param {Function} fn The function.
   * @returns {String} The argument name.
   */ function getFirstArgument(fn) {
        return !hasKey(fn, 'toString') && (/^[\s(]*function[^(]*\(([^\s,)]+)/.exec(fn) || 0)[1] || '';
    }
    /**
   * Computes the arithmetic mean of a sample.
   *
   * @private
   * @param {Array} sample The sample.
   * @returns {Number} The mean.
   */ function getMean(sample) {
        return reduce(sample, function(sum, x) {
            return sum + x;
        }) / sample.length || 0;
    }
    /**
   * Gets the source code of a function.
   *
   * @private
   * @param {Function} fn The function.
   * @param {String} altSource A string used when a function's source code is unretrievable.
   * @returns {String} The function's source code.
   */ function getSource(fn, altSource) {
        var result = altSource;
        if (isStringable(fn)) {
            result = String(fn);
        } else if (support.decompilation) {
            // escape the `{` for Firefox 1
            result = (/^[^{]+\{([\s\S]*)}\s*$/.exec(fn) || 0)[1];
        }
        // trim string
        result = (result || '').replace(/^\s+|\s+$/g, '');
        // detect strings containing only the "use strict" directive
        return /^(?:\/\*+[\w|\W]*?\*\/|\/\/.*?[\n\r\u2028\u2029]|\s)*(["'])use strict\1;?$/.test(result) ? '' : result;
    }
    /**
   * Checks if a value is an `arguments` object.
   *
   * @private
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the value is an `arguments` object, else `false`.
   */ function isArguments() {
        // lazy define
        isArguments = function(value) {
            return toString.call(value) == '[object Arguments]';
        };
        if (noArgumentsClass) {
            isArguments = function(value) {
                return hasKey(value, 'callee') && !(propertyIsEnumerable && propertyIsEnumerable.call(value, 'callee'));
            };
        }
        return isArguments(arguments[0]);
    }
    /**
   * Checks if an object is of the specified class.
   *
   * @private
   * @param {Mixed} value The value to check.
   * @param {String} name The name of the class.
   * @returns {Boolean} Returns `true` if the value is of the specified class, else `false`.
   */ function isClassOf(value, name) {
        return value != null && toString.call(value) == '[object ' + name + ']';
    }
    /**
   * Host objects can return type values that are different from their actual
   * data type. The objects we are concerned with usually return non-primitive
   * types of object, function, or unknown.
   *
   * @private
   * @param {Mixed} object The owner of the property.
   * @param {String} property The property to check.
   * @returns {Boolean} Returns `true` if the property value is a non-primitive, else `false`.
   */ function isHostType(object, property) {
        var type = object != null ? typeof object[property] : 'number';
        return !/^(?:boolean|number|string|undefined)$/.test(type) && (type == 'object' ? !!object[property] : true);
    }
    /**
   * Checks if a given `value` is an object created by the `Object` constructor
   * assuming objects created by the `Object` constructor have no inherited
   * enumerable properties and that there are no `Object.prototype` extensions.
   *
   * @private
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the `value` is a plain `Object` object, else `false`.
   */ function isPlainObject(value) {
        // avoid non-objects and false positives for `arguments` objects in IE < 9
        var result = false;
        if (!(value && typeof value == 'object') || isArguments(value)) {
            return result;
        }
        // IE < 9 presents DOM nodes as `Object` objects except they have `toString`
        // methods that are `typeof` "string" and still can coerce nodes to strings.
        // Also check that the constructor is `Object` (i.e. `Object instanceof Object`)
        var ctor = value.constructor;
        if ((support.nodeClass || !(typeof value.toString != 'function' && typeof (value + '') == 'string')) && (!isClassOf(ctor, 'Function') || ctor instanceof ctor)) {
            // In most environments an object's own properties are iterated before
            // its inherited properties. If the last iterated property is an object's
            // own property then there are no inherited enumerable properties.
            if (support.iteratesOwnFirst) {
                forProps(value, function(subValue, subKey) {
                    result = subKey;
                });
                return result === false || hasKey(value, result);
            }
            // IE < 9 iterates inherited properties before own properties. If the first
            // iterated property is an object's own property then there are no inherited
            // enumerable properties.
            forProps(value, function(subValue, subKey) {
                result = !hasKey(value, subKey);
                return false;
            });
            return result === false;
        }
        return result;
    }
    /**
   * Checks if a value can be safely coerced to a string.
   *
   * @private
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the value can be coerced, else `false`.
   */ function isStringable(value) {
        return hasKey(value, 'toString') || isClassOf(value, 'String');
    }
    /**
   * Wraps a function and passes `this` to the original function as the
   * first argument.
   *
   * @private
   * @param {Function} fn The function to be wrapped.
   * @returns {Function} The new function.
   */ function methodize(fn) {
        return function() {
            var args = [
                this
            ];
            args.push.apply(args, arguments);
            return fn.apply(null, args);
        };
    }
    /**
   * A no-operation function.
   *
   * @private
   */ function noop() {
    // no operation performed
    }
    /**
   * A wrapper around require() to suppress `module missing` errors.
   *
   * @private
   * @param {String} id The module id.
   * @returns {Mixed} The exported module or `null`.
   */ function req(id) {
        try {
            var result = freeExports && freeRequire(id);
        } catch (e) {}
        return result || null;
    }
    /**
   * Runs a snippet of JavaScript via script injection.
   *
   * @private
   * @param {String} code The code to run.
   */ function runScript(code) {
        var anchor = freeDefine ? define.amd : Benchmark, script = doc.createElement('script'), sibling = doc.getElementsByTagName('script')[0], parent = sibling.parentNode, prop = uid + 'runScript', prefix = '(' + (freeDefine ? 'define.amd.' : 'Benchmark.') + prop + '||function(){})();';
        // Firefox 2.0.0.2 cannot use script injection as intended because it executes
        // asynchronously, but that's OK because script injection is only used to avoid
        // the previously commented JaegerMonkey bug.
        try {
            // remove the inserted script *before* running the code to avoid differences
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
   * @param {Object} bench The benchmark instance.
   * @param {Object} [options={}] Options object.
   */ function setOptions(bench, options) {
        options = extend({}, bench.constructor.options, options);
        bench.options = forOwn(options, function(value, key) {
            if (value != null) {
                // add event listeners
                if (/^on[A-Z]/.test(key)) {
                    forEach(key.split(' '), function(key) {
                        bench.on(key.slice(2).toLowerCase(), value);
                    });
                } else if (!hasKey(bench, key)) {
                    bench[key] = deepClone(value);
                }
            }
        });
    }
    /*--------------------------------------------------------------------------*/ /**
   * Handles cycling/completing the deferred benchmark.
   *
   * @memberOf Benchmark.Deferred
   */ function resolve() {
        var me = this, clone = me.benchmark, bench = clone._original;
        if (bench.aborted) {
            // cycle() -> clone cycle/complete event -> compute()'s invoked bench.run() cycle/complete
            me.teardown();
            clone.running = false;
            cycle(me);
        } else if (++me.cycles < clone.count) {
            // continue the test loop
            if (support.timeout) {
                // use setTimeout to avoid a call stack overflow if called recursively
                setTimeout(function() {
                    clone.compiled.call(me, timer);
                }, 0);
            } else {
                clone.compiled.call(me, timer);
            }
        } else {
            timer.stop(me);
            me.teardown();
            delay(clone, function() {
                cycle(me);
            });
        }
    }
    /*--------------------------------------------------------------------------*/ /**
   * A deep clone utility.
   *
   * @static
   * @memberOf Benchmark
   * @param {Mixed} value The value to clone.
   * @returns {Mixed} The cloned value.
   */ function deepClone(value) {
        var accessor, circular, clone, ctor, descriptor, extensible, key, length, markerKey, parent, result, source, subIndex, data = {
            'value': value
        }, index = 0, marked = [], queue = {
            'length': 0
        }, unmarked = [];
        /**
     * An easily detectable decorator for cloned values.
     */ function Marker(object) {
            this.raw = object;
        }
        /**
     * The callback used by `forProps()`.
     */ function forPropsCallback(subValue, subKey) {
            // exit early to avoid cloning the marker
            if (subValue && subValue.constructor == Marker) {
                return;
            }
            // add objects to the queue
            if (subValue === Object(subValue)) {
                queue[queue.length++] = {
                    'key': subKey,
                    'parent': clone,
                    'source': value
                };
            } else {
                try {
                    // will throw an error in strict mode if the property is read-only
                    clone[subKey] = subValue;
                } catch (e) {}
            }
        }
        /**
     * Gets an available marker key for the given object.
     */ function getMarkerKey(object) {
            // avoid collisions with existing keys
            var result = uid;
            while(object[result] && object[result].constructor != Marker){
                result += 1;
            }
            return result;
        }
        do {
            key = data.key;
            parent = data.parent;
            source = data.source;
            clone = value = source ? source[key] : data.value;
            accessor = circular = descriptor = false;
            // create a basic clone to filter out functions, DOM elements, and
            // other non `Object` objects
            if (value === Object(value)) {
                // use custom deep clone function if available
                if (isClassOf(value.deepClone, 'Function')) {
                    clone = value.deepClone();
                } else {
                    ctor = value.constructor;
                    switch(toString.call(value)){
                        case '[object Array]':
                            clone = new ctor(value.length);
                            break;
                        case '[object Boolean]':
                            clone = new ctor(value == true);
                            break;
                        case '[object Date]':
                            clone = new ctor(+value);
                            break;
                        case '[object Object]':
                            isPlainObject(value) && (clone = {});
                            break;
                        case '[object Number]':
                        case '[object String]':
                            clone = new ctor(value);
                            break;
                        case '[object RegExp]':
                            clone = ctor(value.source, (value.global ? 'g' : '') + (value.ignoreCase ? 'i' : '') + (value.multiline ? 'm' : ''));
                    }
                }
                // continue clone if `value` doesn't have an accessor descriptor
                // http://es5.github.com/#x8.10.1
                if (clone && clone != value && !(descriptor = source && support.descriptors && getDescriptor(source, key), accessor = descriptor && (descriptor.get || descriptor.set))) {
                    // use an existing clone (circular reference)
                    if (extensible = isExtensible(value)) {
                        markerKey = getMarkerKey(value);
                        if (value[markerKey]) {
                            circular = clone = value[markerKey].raw;
                        }
                    } else {
                        // for frozen/sealed objects
                        for(subIndex = 0, length = unmarked.length; subIndex < length; subIndex++){
                            data = unmarked[subIndex];
                            if (data.object === value) {
                                circular = clone = data.clone;
                                break;
                            }
                        }
                    }
                    if (!circular) {
                        // mark object to allow quickly detecting circular references and tie it to its clone
                        if (extensible) {
                            value[markerKey] = new Marker(clone);
                            marked.push({
                                'key': markerKey,
                                'object': value
                            });
                        } else {
                            // for frozen/sealed objects
                            unmarked.push({
                                'clone': clone,
                                'object': value
                            });
                        }
                        // iterate over object properties
                        forProps(value, forPropsCallback, {
                            'which': 'all'
                        });
                    }
                }
            }
            if (parent) {
                // for custom property descriptors
                if (accessor || descriptor && !(descriptor.configurable && descriptor.enumerable && descriptor.writable)) {
                    if ('value' in descriptor) {
                        descriptor.value = clone;
                    }
                    setDescriptor(parent, key, descriptor);
                } else {
                    parent[key] = clone;
                }
            } else {
                result = clone;
            }
        }while (data = queue[index++])
        // remove markers
        for(index = 0, length = marked.length; index < length; index++){
            data = marked[index];
            delete data.object[data.key];
        }
        return result;
    }
    /**
   * An iteration utility for arrays and objects.
   * Callbacks may terminate the loop by explicitly returning `false`.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array|Object} object The object to iterate over.
   * @param {Function} callback The function called per iteration.
   * @param {Mixed} thisArg The `this` binding for the callback.
   * @returns {Array|Object} Returns the object iterated over.
   */ function each(object, callback, thisArg) {
        var result = object;
        object = Object(object);
        var fn = callback, index = -1, length = object.length, isSnapshot = !!(object.snapshotItem && (length = object.snapshotLength)), isSplittable = (noCharByIndex || noCharByOwnIndex) && isClassOf(object, 'String'), isConvertable = isSnapshot || isSplittable || 'item' in object, origObject = object;
        // in Opera < 10.5 `hasKey(object, 'length')` returns `false` for NodeLists
        if (length === length >>> 0) {
            if (isConvertable) {
                // the third argument of the callback is the original non-array object
                callback = function(value, index) {
                    return fn.call(this, value, index, origObject);
                };
                // in IE < 9 strings don't support accessing characters by index
                if (isSplittable) {
                    object = object.split('');
                } else {
                    object = [];
                    while(++index < length){
                        // in Safari 2 `index in object` is always `false` for NodeLists
                        object[index] = isSnapshot ? result.snapshotItem(index) : result[index];
                    }
                }
            }
            forEach(object, callback, thisArg);
        } else {
            forOwn(object, callback, thisArg);
        }
        return result;
    }
    /**
   * Copies enumerable properties from the source(s) object to the destination object.
   *
   * @static
   * @memberOf Benchmark
   * @param {Object} destination The destination object.
   * @param {Object} [source={}] The source object.
   * @returns {Object} The destination object.
   */ function extend(destination, source) {
        // Chrome < 14 incorrectly sets `destination` to `undefined` when we `delete arguments[0]`
        // http://code.google.com/p/v8/issues/detail?id=839
        var result = destination;
        delete arguments[0];
        forEach(arguments, function(source) {
            forProps(source, function(value, key) {
                result[key] = value;
            });
        });
        return result;
    }
    /**
   * A generic `Array#filter` like method.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array} array The array to iterate over.
   * @param {Function|String} callback The function/alias called per iteration.
   * @param {Mixed} thisArg The `this` binding for the callback.
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
   */ function filter(array, callback, thisArg) {
        var result;
        if (callback == 'successful') {
            // callback to exclude those that are errored, unrun, or have hz of Infinity
            callback = function(bench) {
                return bench.cycles && isFinite(bench.hz);
            };
        } else if (callback == 'fastest' || callback == 'slowest') {
            // get successful, sort by period + margin of error, and filter fastest/slowest
            result = filter(array, 'successful').sort(function(a, b) {
                a = a.stats;
                b = b.stats;
                return (a.mean + a.moe > b.mean + b.moe ? 1 : -1) * (callback == 'fastest' ? 1 : -1);
            });
            result = filter(result, function(bench) {
                return result[0].compare(bench) == 0;
            });
        }
        return result || reduce(array, function(result, value, index) {
            return callback.call(thisArg, value, index, array) ? (result.push(value), result) : result;
        }, []);
    }
    /**
   * A generic `Array#forEach` like method.
   * Callbacks may terminate the loop by explicitly returning `false`.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @param {Mixed} thisArg The `this` binding for the callback.
   * @returns {Array} Returns the array iterated over.
   */ function forEach(array, callback, thisArg) {
        var index = -1, length = (array = Object(array)).length >>> 0;
        if (thisArg !== undefined) {
            callback = bind(callback, thisArg);
        }
        while(++index < length){
            if (index in array && callback(array[index], index, array) === false) {
                break;
            }
        }
        return array;
    }
    /**
   * Iterates over an object's own properties, executing the `callback` for each.
   * Callbacks may terminate the loop by explicitly returning `false`.
   *
   * @static
   * @memberOf Benchmark
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function executed per own property.
   * @param {Mixed} thisArg The `this` binding for the callback.
   * @returns {Object} Returns the object iterated over.
   */ function forOwn(object, callback, thisArg) {
        return forProps(object, callback, {
            'bind': thisArg,
            'which': 'own'
        });
    }
    /**
   * Converts a number to a more readable comma-separated string representation.
   *
   * @static
   * @memberOf Benchmark
   * @param {Number} number The number to convert.
   * @returns {String} The more readable string representation.
   */ function formatNumber(number) {
        number = String(number).split('.');
        return number[0].replace(/(?=(?:\d{3})+$)(?!\b)/g, ',') + (number[1] ? '.' + number[1] : '');
    }
    /**
   * Checks if an object has the specified key as a direct property.
   *
   * @static
   * @memberOf Benchmark
   * @param {Object} object The object to check.
   * @param {String} key The key to check for.
   * @returns {Boolean} Returns `true` if key is a direct property, else `false`.
   */ function hasKey() {
        // lazy define for worst case fallback (not as accurate)
        hasKey = function(object, key) {
            var parent = object != null && (object.constructor || Object).prototype;
            return !!parent && key in Object(object) && !(key in parent && object[key] === parent[key]);
        };
        // for modern browsers
        if (isClassOf(hasOwnProperty, 'Function')) {
            hasKey = function(object, key) {
                return object != null && hasOwnProperty.call(object, key);
            };
        } else if (({}).__proto__ == Object.prototype) {
            hasKey = function(object, key) {
                var result = false;
                if (object != null) {
                    object = Object(object);
                    object.__proto__ = [
                        object.__proto__,
                        object.__proto__ = null,
                        result = key in object
                    ][0];
                }
                return result;
            };
        }
        return hasKey.apply(this, arguments);
    }
    /**
   * A generic `Array#indexOf` like method.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array} array The array to iterate over.
   * @param {Mixed} value The value to search for.
   * @param {Number} [fromIndex=0] The index to start searching from.
   * @returns {Number} The index of the matched value or `-1`.
   */ function indexOf(array, value, fromIndex) {
        var index = toInteger(fromIndex), length = (array = Object(array)).length >>> 0;
        index = (index < 0 ? max(0, length + index) : index) - 1;
        while(++index < length){
            if (index in array && value === array[index]) {
                return index;
            }
        }
        return -1;
    }
    /**
   * Modify a string by replacing named tokens with matching object property values.
   *
   * @static
   * @memberOf Benchmark
   * @param {String} string The string to modify.
   * @param {Object} object The template object.
   * @returns {String} The modified string.
   */ function interpolate(string, object) {
        forOwn(object, function(value, key) {
            // escape regexp special characters in `key`
            string = string.replace(RegExp('#\\{' + key.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1') + '\\}', 'g'), value);
        });
        return string;
    }
    /**
   * Invokes a method on all items in an array.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array} benches Array of benchmarks to iterate over.
   * @param {String|Object} name The name of the method to invoke OR options object.
   * @param {Mixed} [arg1, arg2, ...] Arguments to invoke the method with.
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
            'onStart': noop,
            'onCycle': noop,
            'onComplete': noop
        }, result = map(benches, function(bench) {
            return bench;
        });
        /**
     * Invokes the method of the current object and if synchronous, fetches the next.
     */ function execute() {
            var listeners, async = isAsync(bench);
            if (async) {
                // use `getNext` as the first listener
                bench.on('complete', getNext);
                listeners = bench.events.complete;
                listeners.splice(0, 0, listeners.pop());
            }
            // execute method
            result[index] = isClassOf(bench && bench[name], 'Function') ? bench[name].apply(bench, args) : undefined;
            // if synchronous return true until finished
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
            // emit "cycle" event
            eventProps.type = 'cycle';
            eventProps.target = last;
            cycleEvent = Event(eventProps);
            options.onCycle.call(benches, cycleEvent);
            // choose next benchmark if not exiting early
            if (!cycleEvent.aborted && raiseIndex() !== false) {
                bench = queued ? benches[0] : result[index];
                if (isAsync(bench)) {
                    delay(bench, execute);
                } else if (async) {
                    // resume execution if previously asynchronous but now synchronous
                    while(execute()){}
                } else {
                    // continue synchronous execution
                    return true;
                }
            } else {
                // emit "complete" event
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
            // avoid using `instanceof` here because of IE memory leak issues with host objects
            var async = args[0] && args[0].async;
            return Object(object).constructor == Benchmark && name == 'run' && ((async == null ? object.options.async : async) && support.timeout || object.defer);
        }
        /**
     * Raises `index` to the next defined index or returns `false`.
     */ function raiseIndex() {
            var length = result.length;
            if (queued) {
                // if queued remove the previous bench and subsequent skipped non-entries
                do {
                    ++index > 0 && shift.call(benches);
                }while ((length = benches.length) && !('0' in benches))
            } else {
                while(++index < length && !(index in result)){}
            }
            // if we reached the last index then return `false`
            return (queued ? length : index < length) ? index : index = false;
        }
        // juggle arguments
        if (isClassOf(name, 'String')) {
            // 2 arguments (array, name)
            args = slice.call(arguments, 2);
        } else {
            // 2 arguments (array, options)
            options = extend(options, name);
            name = options.name;
            args = isClassOf(args = 'args' in options ? options.args : [], 'Array') ? args : [
                args
            ];
            queued = options.queued;
        }
        // start iterating over the array
        if (raiseIndex() !== false) {
            // emit "start" event
            bench = result[index];
            eventProps.type = 'start';
            eventProps.target = bench;
            options.onStart.call(benches, Event(eventProps));
            // end early if the suite was aborted in an "onStart" listener
            if (benches.aborted && benches.constructor == Suite && name == 'run') {
                // emit "cycle" event
                eventProps.type = 'cycle';
                options.onCycle.call(benches, Event(eventProps));
                // emit "complete" event
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
   * @param {String} [separator1=','] The separator used between key-value pairs.
   * @param {String} [separator2=': '] The separator used between keys and values.
   * @returns {String} The joined result.
   */ function join(object, separator1, separator2) {
        var result = [], length = (object = Object(object)).length, arrayLike = length === length >>> 0;
        separator2 || (separator2 = ': ');
        each(object, function(value, key) {
            result.push(arrayLike ? value : key + separator2 + value);
        });
        return result.join(separator1 || ',');
    }
    /**
   * A generic `Array#map` like method.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @param {Mixed} thisArg The `this` binding for the callback.
   * @returns {Array} A new array of values returned by the callback.
   */ function map(array, callback, thisArg) {
        return reduce(array, function(result, value, index) {
            result[index] = callback.call(thisArg, value, index, array);
            return result;
        }, Array(Object(array).length >>> 0));
    }
    /**
   * Retrieves the value of a specified property from all items in an array.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array} array The array to iterate over.
   * @param {String} property The property to pluck.
   * @returns {Array} A new array of property values.
   */ function pluck(array, property) {
        return map(array, function(object) {
            return object == null ? undefined : object[property];
        });
    }
    /**
   * A generic `Array#reduce` like method.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @param {Mixed} accumulator Initial value of the accumulator.
   * @returns {Mixed} The accumulator.
   */ function reduce(array, callback, accumulator) {
        var noaccum = arguments.length < 3;
        forEach(array, function(value, index) {
            accumulator = noaccum ? (noaccum = false, value) : callback(accumulator, value, index, array);
        });
        return accumulator;
    }
    /*--------------------------------------------------------------------------*/ /**
   * Aborts all benchmarks in the suite.
   *
   * @name abort
   * @memberOf Benchmark.Suite
   * @returns {Object} The suite instance.
   */ function abortSuite() {
        var event, me = this, resetting = calledBy.resetSuite;
        if (me.running) {
            event = Event('abort');
            me.emit(event);
            if (!event.cancelled || resetting) {
                // avoid infinite recursion
                calledBy.abortSuite = true;
                me.reset();
                delete calledBy.abortSuite;
                if (!resetting) {
                    me.aborted = true;
                    invoke(me, 'abort');
                }
            }
        }
        return me;
    }
    /**
   * Adds a test to the benchmark suite.
   *
   * @memberOf Benchmark.Suite
   * @param {String} name A name to identify the benchmark.
   * @param {Function|String} fn The test to benchmark.
   * @param {Object} [options={}] Options object.
   * @returns {Object} The benchmark instance.
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
        var me = this, bench = Benchmark(name, fn, options), event = Event({
            'type': 'add',
            'target': bench
        });
        if (me.emit(event), !event.cancelled) {
            me.push(bench);
        }
        return me;
    }
    /**
   * Creates a new suite with cloned benchmarks.
   *
   * @name clone
   * @memberOf Benchmark.Suite
   * @param {Object} [options] Options object to overwrite cloned options.
   * @returns {Object} The new suite instance.
   */ function cloneSuite(options) {
        var me = this, result = new me.constructor(extend({}, me.options, options));
        // copy own properties
        forOwn(me, function(value, key) {
            if (!hasKey(result, key)) {
                result[key] = value && isClassOf(value.clone, 'Function') ? value.clone() : deepClone(value);
            }
        });
        return result;
    }
    /**
   * An `Array#filter` like method.
   *
   * @name filter
   * @memberOf Benchmark.Suite
   * @param {Function|String} callback The function/alias called per iteration.
   * @returns {Object} A new suite of benchmarks that passed callback filter.
   */ function filterSuite(callback) {
        var me = this, result = new me.constructor;
        result.push.apply(result, filter(me, callback));
        return result;
    }
    /**
   * Resets all benchmarks in the suite.
   *
   * @name reset
   * @memberOf Benchmark.Suite
   * @returns {Object} The suite instance.
   */ function resetSuite() {
        var event, me = this, aborting = calledBy.abortSuite;
        if (me.running && !aborting) {
            // no worries, `resetSuite()` is called within `abortSuite()`
            calledBy.resetSuite = true;
            me.abort();
            delete calledBy.resetSuite;
        } else if ((me.aborted || me.running) && (me.emit(event = Event('reset')), !event.cancelled)) {
            me.running = false;
            if (!aborting) {
                invoke(me, 'reset');
            }
        }
        return me;
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
        var me = this;
        me.reset();
        me.running = true;
        options || (options = {});
        invoke(me, {
            'name': 'run',
            'args': options,
            'queued': options.queued,
            'onStart': function(event) {
                me.emit(event);
            },
            'onCycle': function(event) {
                var bench = event.target;
                if (bench.error) {
                    me.emit({
                        'type': 'error',
                        'target': bench
                    });
                }
                me.emit(event);
                event.aborted = me.aborted;
            },
            'onComplete': function(event) {
                me.running = false;
                me.emit(event);
            }
        });
        return me;
    }
    /*--------------------------------------------------------------------------*/ /**
   * Executes all registered listeners of the specified event type.
   *
   * @memberOf Benchmark, Benchmark.Suite
   * @param {String|Object} type The event type or object.
   * @returns {Mixed} Returns the return value of the last listener executed.
   */ function emit(type) {
        var listeners, me = this, event = Event(type), events = me.events, args = (arguments[0] = event, arguments);
        event.currentTarget || (event.currentTarget = me);
        event.target || (event.target = me);
        delete event.result;
        if (events && (listeners = hasKey(events, event.type) && events[event.type])) {
            forEach(listeners.slice(), function(listener) {
                if ((event.result = listener.apply(me, args)) === false) {
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
   * @param {String} type The event type.
   * @returns {Array} The listeners array.
   */ function listeners(type) {
        var me = this, events = me.events || (me.events = {});
        return hasKey(events, type) ? events[type] : events[type] = [];
    }
    /**
   * Unregisters a listener for the specified event type(s),
   * or unregisters all listeners for the specified event type(s),
   * or unregisters all listeners for all event types.
   *
   * @memberOf Benchmark, Benchmark.Suite
   * @param {String} [type] The event type.
   * @param {Function} [listener] The function to unregister.
   * @returns {Object} The benchmark instance.
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
        var me = this, events = me.events;
        events && each(type ? type.split(' ') : events, function(listeners, type) {
            var index;
            if (typeof listeners == 'string') {
                type = listeners;
                listeners = hasKey(events, type) && events[type];
            }
            if (listeners) {
                if (listener) {
                    index = indexOf(listeners, listener);
                    if (index > -1) {
                        listeners.splice(index, 1);
                    }
                } else {
                    listeners.length = 0;
                }
            }
        });
        return me;
    }
    /**
   * Registers a listener for the specified event type(s).
   *
   * @memberOf Benchmark, Benchmark.Suite
   * @param {String} type The event type.
   * @param {Function} listener The function to register.
   * @returns {Object} The benchmark instance.
   * @example
   *
   * // register a listener for an event type
   * bench.on('cycle', listener);
   *
   * // register a listener for multiple event types
   * bench.on('start cycle', listener);
   */ function on(type, listener) {
        var me = this, events = me.events || (me.events = {});
        forEach(type.split(' '), function(type) {
            (hasKey(events, type) ? events[type] : events[type] = []).push(listener);
        });
        return me;
    }
    /*--------------------------------------------------------------------------*/ /**
   * Aborts the benchmark without recording times.
   *
   * @memberOf Benchmark
   * @returns {Object} The benchmark instance.
   */ function abort() {
        var event, me = this, resetting = calledBy.reset;
        if (me.running) {
            event = Event('abort');
            me.emit(event);
            if (!event.cancelled || resetting) {
                // avoid infinite recursion
                calledBy.abort = true;
                me.reset();
                delete calledBy.abort;
                if (support.timeout) {
                    clearTimeout(me._timerId);
                    delete me._timerId;
                }
                if (!resetting) {
                    me.aborted = true;
                    me.running = false;
                }
            }
        }
        return me;
    }
    /**
   * Creates a new benchmark using the same test and options.
   *
   * @memberOf Benchmark
   * @param {Object} [options] Options object to overwrite cloned options.
   * @returns {Object} The new benchmark instance.
   * @example
   *
   * var bizarro = bench.clone({
   *   'name': 'doppelganger'
   * });
   */ function clone(options) {
        var me = this, result = new me.constructor(extend({}, me, options));
        // correct the `options` object
        result.options = extend({}, me.options, options);
        // copy own custom properties
        forOwn(me, function(value, key) {
            if (!hasKey(result, key)) {
                result[key] = deepClone(value);
            }
        });
        return result;
    }
    /**
   * Determines if a benchmark is faster than another.
   *
   * @memberOf Benchmark
   * @param {Object} other The benchmark to compare.
   * @returns {Number} Returns `-1` if slower, `1` if faster, and `0` if indeterminate.
   */ function compare(other) {
        var critical, zStat, me = this, sample1 = me.stats.sample, sample2 = other.stats.sample, size1 = sample1.length, size2 = sample2.length, maxSize = max(size1, size2), minSize = min(size1, size2), u1 = getU(sample1, sample2), u2 = getU(sample2, sample1), u = min(u1, u2);
        function getScore(xA, sampleB) {
            return reduce(sampleB, function(total, xB) {
                return total + (xB > xA ? 0 : xB < xA ? 1 : 0.5);
            }, 0);
        }
        function getU(sampleA, sampleB) {
            return reduce(sampleA, function(total, xA) {
                return total + getScore(xA, sampleB);
            }, 0);
        }
        function getZ(u) {
            return (u - size1 * size2 / 2) / sqrt(size1 * size2 * (size1 + size2 + 1) / 12);
        }
        // exit early if comparing the same benchmark
        if (me == other) {
            return 0;
        }
        // reject the null hyphothesis the two samples come from the
        // same population (i.e. have the same median) if...
        if (size1 + size2 > 30) {
            // ...the z-stat is greater than 1.96 or less than -1.96
            // http://www.statisticslectures.com/topics/mannwhitneyu/
            zStat = getZ(u);
            return abs(zStat) > 1.96 ? zStat > 0 ? -1 : 1 : 0;
        }
        // ...the U value is less than or equal the critical U value
        // http://www.geoib.com/mann-whitney-u-test.html
        critical = maxSize < 5 || minSize < 3 ? 0 : uTable[maxSize][minSize - 3];
        return u <= critical ? u == u1 ? 1 : -1 : 0;
    }
    /**
   * Reset properties and abort if running.
   *
   * @memberOf Benchmark
   * @returns {Object} The benchmark instance.
   */ function reset() {
        var data, event, me = this, index = 0, changes = {
            'length': 0
        }, queue = {
            'length': 0
        };
        if (me.running && !calledBy.abort) {
            // no worries, `reset()` is called within `abort()`
            calledBy.reset = true;
            me.abort();
            delete calledBy.reset;
        } else {
            // a non-recursive solution to check if properties have changed
            // http://www.jslab.dk/articles/non.recursive.preorder.traversal.part4
            data = {
                'destination': me,
                'source': extend({}, me.constructor.prototype, me.options)
            };
            do {
                forOwn(data.source, function(value, key) {
                    var changed, destination = data.destination, currValue = destination[key];
                    if (value && typeof value == 'object') {
                        if (isClassOf(value, 'Array')) {
                            // check if an array value has changed to a non-array value
                            if (!isClassOf(currValue, 'Array')) {
                                changed = currValue = [];
                            }
                            // or has changed its length
                            if (currValue.length != value.length) {
                                changed = currValue = currValue.slice(0, value.length);
                                currValue.length = value.length;
                            }
                        } else if (!currValue || typeof currValue != 'object') {
                            changed = currValue = {};
                        }
                        // register a changed object
                        if (changed) {
                            changes[changes.length++] = {
                                'destination': destination,
                                'key': key,
                                'value': currValue
                            };
                        }
                        queue[queue.length++] = {
                            'destination': currValue,
                            'source': value
                        };
                    } else if (value !== currValue && !(value == null || isClassOf(value, 'Function'))) {
                        changes[changes.length++] = {
                            'destination': destination,
                            'key': key,
                            'value': value
                        };
                    }
                });
            }while (data = queue[index++])
            // if changed emit the `reset` event and if it isn't cancelled reset the benchmark
            if (changes.length && (me.emit(event = Event('reset')), !event.cancelled)) {
                forEach(changes, function(data) {
                    data.destination[data.key] = data.value;
                });
            }
        }
        return me;
    }
    /**
   * Displays relevant benchmark information when coerced to a string.
   *
   * @name toString
   * @memberOf Benchmark
   * @returns {String} A string representation of the benchmark instance.
   */ function toStringBench() {
        var me = this, error = me.error, hz = me.hz, id = me.id, stats = me.stats, size = stats.sample.length, pm = support.java ? '+/-' : '\xb1', result = me.name || (isNaN(id) ? id : '<Test #' + id + '>');
        if (error) {
            result += ': ' + join(error);
        } else {
            result += ' x ' + formatNumber(hz.toFixed(hz < 100 ? 2 : 0)) + ' ops/sec ' + pm + stats.rme.toFixed(2) + '% (' + size + ' run' + (size == 1 ? '' : 's') + ' sampled)';
        }
        return result;
    }
    /*--------------------------------------------------------------------------*/ /**
   * Clocks the time taken to execute a test per cycle (secs).
   *
   * @private
   * @param {Object} bench The benchmark instance.
   * @returns {Number} The time taken.
   */ function clock() {
        var applet, options = Benchmark.options, template = {
            'begin': 's$=new n$',
            'end': 'r$=(new n$-s$)/1e3',
            'uid': uid
        }, timers = [
            {
                'ns': timer.ns,
                'res': max(0.0015, getRes('ms')),
                'unit': 'ms'
            }
        ];
        // lazy define for hi-res timers
        clock = function(clone) {
            var deferred;
            if (clone instanceof Deferred) {
                deferred = clone;
                clone = deferred.benchmark;
            }
            var bench = clone._original, fn = bench.fn, fnArg = deferred ? getFirstArgument(fn) || 'deferred' : '', stringable = isStringable(fn);
            var source = {
                'setup': getSource(bench.setup, preprocess('m$.setup()')),
                'fn': getSource(fn, preprocess('m$.fn(' + fnArg + ')')),
                'fnArg': fnArg,
                'teardown': getSource(bench.teardown, preprocess('m$.teardown()'))
            };
            var count = bench.count = clone.count, decompilable = support.decompilation || stringable, id = bench.id, isEmpty = !(source.fn || stringable), name = bench.name || (typeof id == 'number' ? '<Test #' + id + '>' : id), ns = timer.ns, result = 0;
            // init `minTime` if needed
            clone.minTime = bench.minTime || (bench.minTime = bench.options.minTime = options.minTime);
            // repair nanosecond timer
            // (some Chrome builds erase the `ns` variable after millions of executions)
            if (applet) {
                try {
                    ns.nanoTime();
                } catch (e) {
                    // use non-element to avoid issues with libs that augment them
                    ns = timer.ns = new applet.Packages.nano;
                }
            }
            // Compile in setup/teardown functions and the test loop.
            // Create a new compiled test, instead of using the cached `bench.compiled`,
            // to avoid potential engine optimizations enabled over the life of the test.
            var compiled = bench.compiled = createFunction(preprocess('t$'), interpolate(preprocess(deferred ? 'var d$=this,#{fnArg}=d$,m$=d$.benchmark._original,f$=m$.fn,su$=m$.setup,td$=m$.teardown;' + // when `deferred.cycles` is `0` then...
            'if(!d$.cycles){' + // set `deferred.fn`
            'd$.fn=function(){var #{fnArg}=d$;if(typeof f$=="function"){try{#{fn}\n}catch(e$){f$(d$)}}else{#{fn}\n}};' + // set `deferred.teardown`
            'd$.teardown=function(){d$.cycles=0;if(typeof td$=="function"){try{#{teardown}\n}catch(e$){td$()}}else{#{teardown}\n}};' + // execute the benchmark's `setup`
            'if(typeof su$=="function"){try{#{setup}\n}catch(e$){su$()}}else{#{setup}\n};' + // start timer
            't$.start(d$);' + // execute `deferred.fn` and return a dummy object
            '}d$.fn();return{}' : 'var r$,s$,m$=this,f$=m$.fn,i$=m$.count,n$=t$.ns;#{setup}\n#{begin};' + 'while(i$--){#{fn}\n}#{end};#{teardown}\nreturn{elapsed:r$,uid:"#{uid}"}'), source));
            try {
                if (isEmpty) {
                    // Firefox may remove dead code from Function#toString results
                    // http://bugzil.la/536085
                    throw new Error('The test "' + name + '" is empty. This may be the result of dead code removal.');
                } else if (!deferred) {
                    // pretest to determine if compiled code is exits early, usually by a
                    // rogue `return` statement, by checking for a return object with the uid
                    bench.count = 1;
                    compiled = (compiled.call(bench, timer) || {}).uid == uid && compiled;
                    bench.count = count;
                }
            } catch (e) {
                compiled = null;
                clone.error = e || new Error(String(e));
                bench.count = count;
            }
            // fallback when a test exits early or errors during pretest
            if (decompilable && !compiled && !deferred && !isEmpty) {
                compiled = createFunction(preprocess('t$'), interpolate(preprocess((clone.error && !stringable ? 'var r$,s$,m$=this,f$=m$.fn,i$=m$.count' : 'function f$(){#{fn}\n}var r$,s$,m$=this,i$=m$.count') + ',n$=t$.ns;#{setup}\n#{begin};m$.f$=f$;while(i$--){m$.f$()}#{end};' + 'delete m$.f$;#{teardown}\nreturn{elapsed:r$}'), source));
                try {
                    // pretest one more time to check for errors
                    bench.count = 1;
                    compiled.call(bench, timer);
                    bench.compiled = compiled;
                    bench.count = count;
                    delete clone.error;
                } catch (e) {
                    bench.count = count;
                    if (clone.error) {
                        compiled = null;
                    } else {
                        bench.compiled = compiled;
                        clone.error = e || new Error(String(e));
                    }
                }
            }
            // assign `compiled` to `clone` before calling in case a deferred benchmark
            // immediately calls `deferred.resolve()`
            clone.compiled = compiled;
            // if no errors run the full test loop
            if (!clone.error) {
                result = compiled.call(deferred || bench, timer).elapsed;
            }
            return result;
        };
        /*------------------------------------------------------------------------*/ /**
     * Gets the current timer's minimum resolution (secs).
     */ function getRes(unit) {
            var measured, begin, count = 30, divisor = 1e3, ns = timer.ns, sample = [];
            // get average smallest measurable time
            while(count--){
                if (unit == 'us') {
                    divisor = 1e6;
                    if (ns.stop) {
                        ns.start();
                        while(!(measured = ns.microseconds())){}
                    } else if (ns[perfName]) {
                        divisor = 1e3;
                        measured = Function('n', 'var r,s=n.' + perfName + '();while(!(r=n.' + perfName + '()-s)){};return r')(ns);
                    } else {
                        begin = ns();
                        while(!(measured = ns() - begin)){}
                    }
                } else if (unit == 'ns') {
                    divisor = 1e9;
                    if (ns.nanoTime) {
                        begin = ns.nanoTime();
                        while(!(measured = ns.nanoTime() - begin)){}
                    } else {
                        begin = (begin = ns())[0] + begin[1] / divisor;
                        while(!(measured = (measured = ns())[0] + measured[1] / divisor - begin)){}
                        divisor = 1;
                    }
                } else {
                    begin = new ns;
                    while(!(measured = new ns - begin)){}
                }
                // check for broken timers (nanoTime may have issues)
                // http://alivebutsleepy.srnet.cz/unreliable-system-nanotime/
                if (measured > 0) {
                    sample.push(measured);
                } else {
                    sample.push(Infinity);
                    break;
                }
            }
            // convert to seconds
            return getMean(sample) / divisor;
        }
        /**
     * Replaces all occurrences of `$` with a unique number and
     * template tokens with content.
     */ function preprocess(code) {
            return interpolate(code, template).replace(/\$/g, /\d+/.exec(uid));
        }
        /*------------------------------------------------------------------------*/ // detect nanosecond support from a Java applet
        each(doc && doc.applets || [], function(element) {
            return !(timer.ns = applet = 'nanoTime' in element && element);
        });
        // check type in case Safari returns an object instead of a number
        try {
            if (typeof timer.ns.nanoTime() == 'number') {
                timers.push({
                    'ns': timer.ns,
                    'res': getRes('ns'),
                    'unit': 'ns'
                });
            }
        } catch (e) {}
        // detect Chrome's microsecond timer:
        // enable benchmarking via the --enable-benchmarking command
        // line switch in at least Chrome 7 to use chrome.Interval
        try {
            if (timer.ns = new (window.chrome || window.chromium).Interval) {
                timers.push({
                    'ns': timer.ns,
                    'res': getRes('us'),
                    'unit': 'us'
                });
            }
        } catch (e) {}
        // detect `performance.now` microsecond resolution timer
        if (timer.ns = perfName && perfObject) {
            timers.push({
                'ns': timer.ns,
                'res': getRes('us'),
                'unit': 'us'
            });
        }
        // detect Node's nanosecond resolution timer available in Node >= 0.8
        if (processObject && typeof (timer.ns = processObject.hrtime) == 'function') {
            timers.push({
                'ns': timer.ns,
                'res': getRes('ns'),
                'unit': 'ns'
            });
        }
        // detect Wade Simmons' Node microtime module
        if (microtimeObject && typeof (timer.ns = microtimeObject.now) == 'function') {
            timers.push({
                'ns': timer.ns,
                'res': getRes('us'),
                'unit': 'us'
            });
        }
        // pick timer with highest resolution
        timer = reduce(timers, function(timer, other) {
            return other.res < timer.res ? other : timer;
        });
        // remove unused applet
        if (timer.unit != 'ns' && applet) {
            applet = destroyElement(applet);
        }
        // error if there are no working timers
        if (timer.res == Infinity) {
            throw new Error('Benchmark.js was unable to find a working timer.');
        }
        // use API of chosen timer
        if (timer.unit == 'ns') {
            if (timer.ns.nanoTime) {
                extend(template, {
                    'begin': 's$=n$.nanoTime()',
                    'end': 'r$=(n$.nanoTime()-s$)/1e9'
                });
            } else {
                extend(template, {
                    'begin': 's$=n$()',
                    'end': 'r$=n$(s$);r$=r$[0]+(r$[1]/1e9)'
                });
            }
        } else if (timer.unit == 'us') {
            if (timer.ns.stop) {
                extend(template, {
                    'begin': 's$=n$.start()',
                    'end': 'r$=n$.microseconds()/1e6'
                });
            } else if (perfName) {
                extend(template, {
                    'begin': 's$=n$.' + perfName + '()',
                    'end': 'r$=(n$.' + perfName + '()-s$)/1e3'
                });
            } else {
                extend(template, {
                    'begin': 's$=n$()',
                    'end': 'r$=(n$()-s$)/1e6'
                });
            }
        }
        // define `timer` methods
        timer.start = createFunction(preprocess('o$'), preprocess('var n$=this.ns,#{begin};o$.elapsed=0;o$.timeStamp=s$'));
        timer.stop = createFunction(preprocess('o$'), preprocess('var n$=this.ns,s$=o$.timeStamp,#{end};o$.elapsed=r$'));
        // resolve time span required to achieve a percent uncertainty of at most 1%
        // http://spiff.rit.edu/classes/phys273/uncert/uncert.html
        options.minTime || (options.minTime = max(timer.res / 2 / 0.01, 0.05));
        return clock.apply(null, arguments);
    }
    /*--------------------------------------------------------------------------*/ /**
   * Computes stats on benchmark results.
   *
   * @private
   * @param {Object} bench The benchmark instance.
   * @param {Object} [options] The options object.
   */ function compute(bench, options) {
        options || (options = {});
        var async = options.async, elapsed = 0, initCount = bench.initCount, minSamples = bench.minSamples, queue = [], sample = bench.stats.sample;
        /**
     * Adds a clone to the queue.
     */ function enqueue() {
            queue.push(bench.clone({
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
                    // Note: `clone.minTime` prop is inited in `clock()`
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
                // clear abort listeners to avoid triggering bench's abort/cycle again
                clone.events.abort.length = 0;
                clone.abort();
            }
        }
        /**
     * Determines if more clones should be queued or if cycling should stop.
     */ function evaluate(event) {
            var critical, df, mean, moe, rme, sd, sem, variance, clone = event.target, done = bench.aborted, now = +new Date, size = sample.push(clone.times.period), maxedOut = size >= minSamples && (elapsed += now - clone.times.timeStamp) / 1e3 > bench.maxTime, times = bench.times, varOf = function(sum, x) {
                return sum + pow(x - mean, 2);
            };
            // exit early for aborted or unclockable tests
            if (done || clone.hz == Infinity) {
                maxedOut = !(size = sample.length = queue.length = 0);
            }
            if (!done) {
                // sample mean (estimate of the population mean)
                mean = getMean(sample);
                // sample variance (estimate of the population variance)
                variance = reduce(sample, varOf, 0) / (size - 1) || 0;
                // sample standard deviation (estimate of the population standard deviation)
                sd = sqrt(variance);
                // standard error of the mean (a.k.a. the standard deviation of the sampling distribution of the sample mean)
                sem = sd / sqrt(size);
                // degrees of freedom
                df = size - 1;
                // critical value
                critical = tTable[Math.round(df) || 1] || tTable.infinity;
                // margin of error
                moe = sem * critical;
                // relative margin of error
                rme = moe / mean * 100 || 0;
                extend(bench.stats, {
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
                // increased by browsers that clamp timeouts for inactive tabs.
                // https://developer.mozilla.org/en/window.setTimeout#Inactive_tabs
                if (maxedOut) {
                    // reset the `initCount` in case the benchmark is rerun
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
            // if time permits, increase sample size to reduce the margin of error
            if (queue.length < 2 && !maxedOut) {
                enqueue();
            }
            // abort the invoke cycle when done
            event.aborted = done;
        }
        // init queue and begin
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
    /*--------------------------------------------------------------------------*/ /**
   * Cycles a benchmark until a run `count` can be established.
   *
   * @private
   * @param {Object} clone The cloned benchmark instance.
   * @param {Object} [options] The options object.
   */ function cycle(clone, options) {
        options || (options = {});
        var deferred;
        if (clone instanceof Deferred) {
            deferred = clone;
            clone = clone.benchmark;
        }
        var clocked, cycles, divisor, event, minTime, period, async = options.async, bench = clone._original, count = clone.count, times = clone.times;
        // continue, if not aborted between cycles
        if (clone.running) {
            // `minTime` is set to `Benchmark.options.minTime` in `clock()`
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
        // continue, if not errored
        if (clone.running) {
            // time taken to complete last test cycle
            bench.times.cycle = times.cycle = clocked;
            // seconds per operation
            period = bench.times.period = times.period = clocked / count;
            // ops per second
            bench.hz = clone.hz = 1 / period;
            // avoid working our way up to this next time
            bench.initCount = clone.initCount = count;
            // do we need to do another cycle?
            clone.running = clocked < minTime;
            if (clone.running) {
                // tests may clock at `0` when `initCount` is a small number,
                // to avoid that we set its count to something a bit higher
                if (!clocked && (divisor = divisors[clone.cycles]) != null) {
                    count = floor(4e6 / divisor);
                }
                // calculate how many more iterations it will take to achive the `minTime`
                if (count <= clone.count) {
                    count += Math.ceil((minTime - clocked) / period);
                }
                clone.running = count != Infinity;
            }
        }
        // should we exit early?
        event = Event('cycle');
        clone.emit(event);
        if (event.aborted) {
            clone.abort();
        }
        // figure out what to do next
        if (clone.running) {
            // start a new cycle
            clone.count = count;
            if (deferred) {
                clone.compiled.call(deferred, timer);
            } else if (async) {
                delay(clone, function() {
                    cycle(clone, options);
                });
            } else {
                cycle(clone);
            }
        } else {
            // fix TraceMonkey bug associated with clock fallbacks
            // http://bugzil.la/509069
            if (support.browser) {
                runScript(uid + '=1;delete ' + uid);
            }
            // done
            clone.emit('complete');
        }
    }
    /*--------------------------------------------------------------------------*/ /**
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
        var me = this, event = Event('start');
        // set `running` to `false` so `reset()` won't call `abort()`
        me.running = false;
        me.reset();
        me.running = true;
        me.count = me.initCount;
        me.times.timeStamp = +new Date;
        me.emit(event);
        if (!event.cancelled) {
            options = {
                'async': ((options = options && options.async) == null ? me.async : options) && support.timeout
            };
            // for clones created within `compute()`
            if (me._original) {
                if (me.defer) {
                    Deferred(me);
                } else {
                    cycle(me, options);
                }
            } else {
                compute(me, options);
            }
        }
        return me;
    }
    /*--------------------------------------------------------------------------*/ // Firefox 1 erroneously defines variable and argument names of functions on
    // the function itself as non-configurable properties with `undefined` values.
    // The bugginess continues as the `Benchmark` constructor has an argument
    // named `options` and Firefox 1 will not assign a value to `Benchmark.options`,
    // making it non-writable in the process, unless it is the first property
    // assigned by for-in loop of `extend()`.
    extend(Benchmark, {
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
       * @type Boolean
       */ 'async': false,
            /**
       * A flag to indicate that the benchmark clock is deferred.
       *
       * @memberOf Benchmark.options
       * @type Boolean
       */ 'defer': false,
            /**
       * The delay between test cycles (secs).
       * @memberOf Benchmark.options
       * @type Number
       */ 'delay': 0.005,
            /**
       * Displayed by Benchmark#toString when a `name` is not available
       * (auto-generated if absent).
       *
       * @memberOf Benchmark.options
       * @type String
       */ 'id': undefined,
            /**
       * The default number of times to execute a test on a benchmark's first cycle.
       *
       * @memberOf Benchmark.options
       * @type Number
       */ 'initCount': 1,
            /**
       * The maximum time a benchmark is allowed to run before finishing (secs).
       *
       * Note: Cycle delays aren't counted toward the maximum time.
       *
       * @memberOf Benchmark.options
       * @type Number
       */ 'maxTime': 5,
            /**
       * The minimum sample size required to perform statistical analysis.
       *
       * @memberOf Benchmark.options
       * @type Number
       */ 'minSamples': 5,
            /**
       * The time needed to reduce the percent uncertainty of measurement to 1% (secs).
       *
       * @memberOf Benchmark.options
       * @type Number
       */ 'minTime': 0,
            /**
       * The name of the benchmark.
       *
       * @memberOf Benchmark.options
       * @type String
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
     * version, and operating system.
     *
     * @static
     * @memberOf Benchmark
     * @type Object
     */ 'platform': req('platform') || window.platform || {
            /**
       * The platform description.
       *
       * @memberOf Benchmark.platform
       * @type String
       */ 'description': window.navigator && navigator.userAgent || null,
            /**
       * The name of the browser layout engine.
       *
       * @memberOf Benchmark.platform
       * @type String|Null
       */ 'layout': null,
            /**
       * The name of the product hosting the browser.
       *
       * @memberOf Benchmark.platform
       * @type String|Null
       */ 'product': null,
            /**
       * The name of the browser/environment.
       *
       * @memberOf Benchmark.platform
       * @type String|Null
       */ 'name': null,
            /**
       * The name of the product's manufacturer.
       *
       * @memberOf Benchmark.platform
       * @type String|Null
       */ 'manufacturer': null,
            /**
       * The name of the operating system.
       *
       * @memberOf Benchmark.platform
       * @type String|Null
       */ 'os': null,
            /**
       * The alpha/beta release indicator.
       *
       * @memberOf Benchmark.platform
       * @type String|Null
       */ 'prerelease': null,
            /**
       * The browser/environment version.
       *
       * @memberOf Benchmark.platform
       * @type String|Null
       */ 'version': null,
            /**
       * Return platform description when the platform object is coerced to a string.
       *
       * @memberOf Benchmark.platform
       * @type Function
       * @returns {String} The platform description.
       */ 'toString': function() {
                return this.description || '';
            }
        },
        /**
     * The semantic version number.
     *
     * @static
     * @memberOf Benchmark
     * @type String
     */ 'version': '1.0.0',
        // an object of environment/feature detection flags
        'support': support,
        // clone objects
        'deepClone': deepClone,
        // iteration utility
        'each': each,
        // augment objects
        'extend': extend,
        // generic Array#filter
        'filter': filter,
        // generic Array#forEach
        'forEach': forEach,
        // generic own property iteration utility
        'forOwn': forOwn,
        // converts a number to a comma-separated string
        'formatNumber': formatNumber,
        // generic Object#hasOwnProperty
        // (trigger hasKey's lazy define before assigning it to Benchmark)
        'hasKey': (hasKey(Benchmark, ''), hasKey),
        // generic Array#indexOf
        'indexOf': indexOf,
        // template utility
        'interpolate': interpolate,
        // invokes a method on each item in an array
        'invoke': invoke,
        // generic Array#join for arrays and objects
        'join': join,
        // generic Array#map
        'map': map,
        // retrieves a property value from each item in an array
        'pluck': pluck,
        // generic Array#reduce
        'reduce': reduce
    });
    /*--------------------------------------------------------------------------*/ extend(Benchmark.prototype, {
        /**
     * The number of times a test was executed.
     *
     * @memberOf Benchmark
     * @type Number
     */ 'count': 0,
        /**
     * The number of cycles performed while benchmarking.
     *
     * @memberOf Benchmark
     * @type Number
     */ 'cycles': 0,
        /**
     * The number of executions per second.
     *
     * @memberOf Benchmark
     * @type Number
     */ 'hz': 0,
        /**
     * The compiled test function.
     *
     * @memberOf Benchmark
     * @type Function|String
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
     * @type Function|String
     */ 'fn': undefined,
        /**
     * A flag to indicate if the benchmark is aborted.
     *
     * @memberOf Benchmark
     * @type Boolean
     */ 'aborted': false,
        /**
     * A flag to indicate if the benchmark is running.
     *
     * @memberOf Benchmark
     * @type Boolean
     */ 'running': false,
        /**
     * Compiled into the test and executed immediately **before** the test loop.
     *
     * @memberOf Benchmark
     * @type Function|String
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
     */ 'setup': noop,
        /**
     * Compiled into the test and executed immediately **after** the test loop.
     *
     * @memberOf Benchmark
     * @type Function|String
     */ 'teardown': noop,
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
       * @type Number
       */ 'moe': 0,
            /**
       * The relative margin of error (expressed as a percentage of the mean).
       *
       * @memberOf Benchmark#stats
       * @type Number
       */ 'rme': 0,
            /**
       * The standard error of the mean.
       *
       * @memberOf Benchmark#stats
       * @type Number
       */ 'sem': 0,
            /**
       * The sample standard deviation.
       *
       * @memberOf Benchmark#stats
       * @type Number
       */ 'deviation': 0,
            /**
       * The sample arithmetic mean.
       *
       * @memberOf Benchmark#stats
       * @type Number
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
       * @type Number
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
       * @type Number
       */ 'cycle': 0,
            /**
       * The time taken to complete the benchmark (secs).
       *
       * @memberOf Benchmark#times
       * @type Number
       */ 'elapsed': 0,
            /**
       * The time taken to execute the test once (secs).
       *
       * @memberOf Benchmark#times
       * @type Number
       */ 'period': 0,
            /**
       * A timestamp of when the benchmark started (ms).
       *
       * @memberOf Benchmark#times
       * @type Number
       */ 'timeStamp': 0
        },
        // aborts benchmark (does not record times)
        'abort': abort,
        // creates a new benchmark using the same test and options
        'clone': clone,
        // compares benchmark's hertz with another
        'compare': compare,
        // executes listeners
        'emit': emit,
        // get listeners
        'listeners': listeners,
        // unregister listeners
        'off': off,
        // register listeners
        'on': on,
        // reset benchmark properties
        'reset': reset,
        // runs the benchmark
        'run': run,
        // pretty print benchmark info
        'toString': toStringBench
    });
    /*--------------------------------------------------------------------------*/ extend(Deferred.prototype, {
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
     * @type Number
     */ 'cycles': 0,
        /**
     * The time taken to complete the deferred benchmark (secs).
     *
     * @memberOf Benchmark.Deferred
     * @type Number
     */ 'elapsed': 0,
        /**
     * A timestamp of when the deferred benchmark started (ms).
     *
     * @memberOf Benchmark.Deferred
     * @type Number
     */ 'timeStamp': 0,
        // cycles/completes the deferred benchmark
        'resolve': resolve
    });
    /*--------------------------------------------------------------------------*/ extend(Event.prototype, {
        /**
     * A flag to indicate if the emitters listener iteration is aborted.
     *
     * @memberOf Benchmark.Event
     * @type Boolean
     */ 'aborted': false,
        /**
     * A flag to indicate if the default action is cancelled.
     *
     * @memberOf Benchmark.Event
     * @type Boolean
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
     * @type Number
     */ 'timeStamp': 0,
        /**
     * The event type.
     *
     * @memberOf Benchmark.Event
     * @type String
     */ 'type': ''
    });
    /*--------------------------------------------------------------------------*/ /**
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
     * @type String
     */ 'name': undefined
    };
    /*--------------------------------------------------------------------------*/ extend(Suite.prototype, {
        /**
     * The number of benchmarks in the suite.
     *
     * @memberOf Benchmark.Suite
     * @type Number
     */ 'length': 0,
        /**
     * A flag to indicate if the suite is aborted.
     *
     * @memberOf Benchmark.Suite
     * @type Boolean
     */ 'aborted': false,
        /**
     * A flag to indicate if the suite is running.
     *
     * @memberOf Benchmark.Suite
     * @type Boolean
     */ 'running': false,
        /**
     * An `Array#forEach` like method.
     * Callbacks may terminate the loop by explicitly returning `false`.
     *
     * @memberOf Benchmark.Suite
     * @param {Function} callback The function called per iteration.
     * @returns {Object} The suite iterated over.
     */ 'forEach': methodize(forEach),
        /**
     * An `Array#indexOf` like method.
     *
     * @memberOf Benchmark.Suite
     * @param {Mixed} value The value to search for.
     * @returns {Number} The index of the matched value or `-1`.
     */ 'indexOf': methodize(indexOf),
        /**
     * Invokes a method on all benchmarks in the suite.
     *
     * @memberOf Benchmark.Suite
     * @param {String|Object} name The name of the method to invoke OR options object.
     * @param {Mixed} [arg1, arg2, ...] Arguments to invoke the method with.
     * @returns {Array} A new array of values returned from each method invoked.
     */ 'invoke': methodize(invoke),
        /**
     * Converts the suite of benchmarks to a string.
     *
     * @memberOf Benchmark.Suite
     * @param {String} [separator=','] A string to separate each element of the array.
     * @returns {String} The string.
     */ 'join': [].join,
        /**
     * An `Array#map` like method.
     *
     * @memberOf Benchmark.Suite
     * @param {Function} callback The function called per iteration.
     * @returns {Array} A new array of values returned by the callback.
     */ 'map': methodize(map),
        /**
     * Retrieves the value of a specified property from all benchmarks in the suite.
     *
     * @memberOf Benchmark.Suite
     * @param {String} property The property to pluck.
     * @returns {Array} A new array of property values.
     */ 'pluck': methodize(pluck),
        /**
     * Removes the last benchmark from the suite and returns it.
     *
     * @memberOf Benchmark.Suite
     * @returns {Mixed} The removed benchmark.
     */ 'pop': [].pop,
        /**
     * Appends benchmarks to the suite.
     *
     * @memberOf Benchmark.Suite
     * @returns {Number} The suite's new length.
     */ 'push': [].push,
        /**
     * Sorts the benchmarks of the suite.
     *
     * @memberOf Benchmark.Suite
     * @param {Function} [compareFn=null] A function that defines the sort order.
     * @returns {Object} The sorted suite.
     */ 'sort': [].sort,
        /**
     * An `Array#reduce` like method.
     *
     * @memberOf Benchmark.Suite
     * @param {Function} callback The function called per iteration.
     * @param {Mixed} accumulator Initial value of the accumulator.
     * @returns {Mixed} The accumulator.
     */ 'reduce': methodize(reduce),
        // aborts all benchmarks in the suite
        'abort': abortSuite,
        // adds a benchmark to the suite
        'add': add,
        // creates a new suite with cloned benchmarks
        'clone': cloneSuite,
        // executes listeners of a specified type
        'emit': emit,
        // creates a new suite of filtered benchmarks
        'filter': filterSuite,
        // get listeners
        'listeners': listeners,
        // unregister listeners
        'off': off,
        // register listeners
        'on': on,
        // resets all benchmarks in the suite
        'reset': resetSuite,
        // runs all benchmarks in the suite
        'run': runSuite,
        // array methods
        'concat': concat,
        'reverse': reverse,
        'shift': shift,
        'slice': slice,
        'splice': splice,
        'unshift': unshift
    });
    /*--------------------------------------------------------------------------*/ // expose Deferred, Event and Suite
    extend(Benchmark, {
        'Deferred': Deferred,
        'Event': Event,
        'Suite': Suite
    });
    // expose Benchmark
    // some AMD build optimizers, like r.js, check for specific condition patterns like the following:
    if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
        // define as an anonymous module so, through path mapping, it can be aliased
        define(function() {
            return Benchmark;
        });
    } else if (freeExports) {
        // in Node.js or RingoJS v0.8.0+
        if (typeof module == 'object' && module && module.exports == freeExports) {
            (module.exports = Benchmark).Benchmark = Benchmark;
        } else {
            freeExports.Benchmark = Benchmark;
        }
    } else {
        // use square bracket notation so Closure Compiler won't munge `Benchmark`
        // http://code.google.com/closure/compiler/docs/api-tutorial3.html#export
        window['Benchmark'] = Benchmark;
    }
    // trigger clock's lazy define early to avoid a security error
    if (support.air) {
        clock({
            '_original': {
                'fn': noop,
                'count': 1,
                'options': {}
            }
        });
    }
})(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvYmVuY2htYXJrLTEuMC4wLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICogQmVuY2htYXJrLmpzIHYxLjAuMCA8aHR0cDovL2JlbmNobWFya2pzLmNvbS8+XG4gKiBDb3B5cmlnaHQgMjAxMC0yMDEyIE1hdGhpYXMgQnluZW5zIDxodHRwOi8vbXRocy5iZS8+XG4gKiBCYXNlZCBvbiBKU0xpdG11cy5qcywgY29weXJpZ2h0IFJvYmVydCBLaWVmZmVyIDxodHRwOi8vYnJvb2ZhLmNvbS8+XG4gKiBNb2RpZmllZCBieSBKb2huLURhdmlkIERhbHRvbiA8aHR0cDovL2FsbHlvdWNhbmxlZXQuY29tLz5cbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL210aHMuYmUvbWl0PlxuICovXG47KGZ1bmN0aW9uKHdpbmRvdywgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKiogVXNlZCB0byBhc3NpZ24gZWFjaCBiZW5jaG1hcmsgYW4gaW5jcmltZW50ZWQgaWQgKi9cbiAgdmFyIGNvdW50ZXIgPSAwO1xuXG4gIC8qKiBEZXRlY3QgRE9NIGRvY3VtZW50IG9iamVjdCAqL1xuICB2YXIgZG9jID0gaXNIb3N0VHlwZSh3aW5kb3csICdkb2N1bWVudCcpICYmIGRvY3VtZW50O1xuXG4gIC8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZGVmaW5lYCAqL1xuICB2YXIgZnJlZURlZmluZSA9IHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJlxuICAgIHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmIGRlZmluZS5hbWQgJiYgZGVmaW5lO1xuXG4gIC8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZXhwb3J0c2AgKi9cbiAgdmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJlxuICAgICh0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbCAmJiBnbG9iYWwgPT0gZ2xvYmFsLmdsb2JhbCAmJiAod2luZG93ID0gZ2xvYmFsKSwgZXhwb3J0cyk7XG5cbiAgLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGByZXF1aXJlYCAqL1xuICB2YXIgZnJlZVJlcXVpcmUgPSB0eXBlb2YgcmVxdWlyZSA9PSAnZnVuY3Rpb24nICYmIHJlcXVpcmU7XG5cbiAgLyoqIFVzZWQgdG8gY3Jhd2wgYWxsIHByb3BlcnRpZXMgcmVnYXJkbGVzcyBvZiBlbnVtZXJhYmlsaXR5ICovXG4gIHZhciBnZXRBbGxLZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXM7XG5cbiAgLyoqIFVzZWQgdG8gZ2V0IHByb3BlcnR5IGRlc2NyaXB0b3JzICovXG4gIHZhciBnZXREZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcblxuICAvKiogVXNlZCBpbiBjYXNlIGFuIG9iamVjdCBkb2Vzbid0IGhhdmUgaXRzIG93biBtZXRob2QgKi9cbiAgdmFyIGhhc093blByb3BlcnR5ID0ge30uaGFzT3duUHJvcGVydHk7XG5cbiAgLyoqIFVzZWQgdG8gY2hlY2sgaWYgYW4gb2JqZWN0IGlzIGV4dGVuc2libGUgKi9cbiAgdmFyIGlzRXh0ZW5zaWJsZSA9IE9iamVjdC5pc0V4dGVuc2libGUgfHwgZnVuY3Rpb24oKSB7IHJldHVybiB0cnVlOyB9O1xuXG4gIC8qKiBVc2VkIHRvIGFjY2VzcyBXYWRlIFNpbW1vbnMnIE5vZGUgbWljcm90aW1lIG1vZHVsZSAqL1xuICB2YXIgbWljcm90aW1lT2JqZWN0ID0gcmVxKCdtaWNyb3RpbWUnKTtcblxuICAvKiogVXNlZCB0byBhY2Nlc3MgdGhlIGJyb3dzZXIncyBoaWdoIHJlc29sdXRpb24gdGltZXIgKi9cbiAgdmFyIHBlcmZPYmplY3QgPSBpc0hvc3RUeXBlKHdpbmRvdywgJ3BlcmZvcm1hbmNlJykgJiYgcGVyZm9ybWFuY2U7XG5cbiAgLyoqIFVzZWQgdG8gY2FsbCB0aGUgYnJvd3NlcidzIGhpZ2ggcmVzb2x1dGlvbiB0aW1lciAqL1xuICB2YXIgcGVyZk5hbWUgPSBwZXJmT2JqZWN0ICYmIChcbiAgICBwZXJmT2JqZWN0Lm5vdyAmJiAnbm93JyB8fFxuICAgIHBlcmZPYmplY3Qud2Via2l0Tm93ICYmICd3ZWJraXROb3cnXG4gICk7XG5cbiAgLyoqIFVzZWQgdG8gYWNjZXNzIE5vZGUncyBoaWdoIHJlc29sdXRpb24gdGltZXIgKi9cbiAgdmFyIHByb2Nlc3NPYmplY3QgPSBpc0hvc3RUeXBlKHdpbmRvdywgJ3Byb2Nlc3MnKSAmJiBwcm9jZXNzO1xuXG4gIC8qKiBVc2VkIHRvIGNoZWNrIGlmIGFuIG93biBwcm9wZXJ0eSBpcyBlbnVtZXJhYmxlICovXG4gIHZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG4gIC8qKiBVc2VkIHRvIHNldCBwcm9wZXJ0eSBkZXNjcmlwdG9ycyAqL1xuICB2YXIgc2V0RGVzY3JpcHRvciA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcblxuICAvKiogVXNlZCB0byByZXNvbHZlIGEgdmFsdWUncyBpbnRlcm5hbCBbW0NsYXNzXV0gKi9cbiAgdmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbiAgLyoqIFVzZWQgdG8gcHJldmVudCBhIGByZW1vdmVDaGlsZGAgbWVtb3J5IGxlYWsgaW4gSUUgPCA5ICovXG4gIHZhciB0cmFzaCA9IGRvYyAmJiBkb2MuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgLyoqIFVzZWQgdG8gaW50ZWdyaXR5IGNoZWNrIGNvbXBpbGVkIHRlc3RzICovXG4gIHZhciB1aWQgPSAndWlkJyArICgrbmV3IERhdGUpO1xuXG4gIC8qKiBVc2VkIHRvIGF2b2lkIGluZmluaXRlIHJlY3Vyc2lvbiB3aGVuIG1ldGhvZHMgY2FsbCBlYWNoIG90aGVyICovXG4gIHZhciBjYWxsZWRCeSA9IHt9O1xuXG4gIC8qKiBVc2VkIHRvIGF2b2lkIGh6IG9mIEluZmluaXR5ICovXG4gIHZhciBkaXZpc29ycyA9IHtcbiAgICAnMSc6IDQwOTYsXG4gICAgJzInOiA1MTIsXG4gICAgJzMnOiA2NCxcbiAgICAnNCc6IDgsXG4gICAgJzUnOiAwXG4gIH07XG5cbiAgLyoqXG4gICAqIFQtRGlzdHJpYnV0aW9uIHR3by10YWlsZWQgY3JpdGljYWwgdmFsdWVzIGZvciA5NSUgY29uZmlkZW5jZVxuICAgKiBodHRwOi8vd3d3Lml0bC5uaXN0Lmdvdi9kaXY4OTgvaGFuZGJvb2svZWRhL3NlY3Rpb24zL2VkYTM2NzIuaHRtXG4gICAqL1xuICB2YXIgdFRhYmxlID0ge1xuICAgICcxJzogIDEyLjcwNiwnMic6ICA0LjMwMywgJzMnOiAgMy4xODIsICc0JzogIDIuNzc2LCAnNSc6ICAyLjU3MSwgJzYnOiAgMi40NDcsXG4gICAgJzcnOiAgMi4zNjUsICc4JzogIDIuMzA2LCAnOSc6ICAyLjI2MiwgJzEwJzogMi4yMjgsICcxMSc6IDIuMjAxLCAnMTInOiAyLjE3OSxcbiAgICAnMTMnOiAyLjE2LCAgJzE0JzogMi4xNDUsICcxNSc6IDIuMTMxLCAnMTYnOiAyLjEyLCAgJzE3JzogMi4xMSwgICcxOCc6IDIuMTAxLFxuICAgICcxOSc6IDIuMDkzLCAnMjAnOiAyLjA4NiwgJzIxJzogMi4wOCwgICcyMic6IDIuMDc0LCAnMjMnOiAyLjA2OSwgJzI0JzogMi4wNjQsXG4gICAgJzI1JzogMi4wNiwgICcyNic6IDIuMDU2LCAnMjcnOiAyLjA1MiwgJzI4JzogMi4wNDgsICcyOSc6IDIuMDQ1LCAnMzAnOiAyLjA0MixcbiAgICAnaW5maW5pdHknOiAxLjk2XG4gIH07XG5cbiAgLyoqXG4gICAqIENyaXRpY2FsIE1hbm4tV2hpdG5leSBVLXZhbHVlcyBmb3IgOTUlIGNvbmZpZGVuY2VcbiAgICogaHR0cDovL3d3dy5zYWJ1cmNoaWxsLmNvbS9JQmJpb2xvZ3kvc3RhdHMvMDAzLmh0bWxcbiAgICovXG4gIHZhciB1VGFibGUgPSB7XG4gICAgJzUnOiAgWzAsIDEsIDJdLFxuICAgICc2JzogIFsxLCAyLCAzLCA1XSxcbiAgICAnNyc6ICBbMSwgMywgNSwgNiwgOF0sXG4gICAgJzgnOiAgWzIsIDQsIDYsIDgsIDEwLCAxM10sXG4gICAgJzknOiAgWzIsIDQsIDcsIDEwLCAxMiwgMTUsIDE3XSxcbiAgICAnMTAnOiBbMywgNSwgOCwgMTEsIDE0LCAxNywgMjAsIDIzXSxcbiAgICAnMTEnOiBbMywgNiwgOSwgMTMsIDE2LCAxOSwgMjMsIDI2LCAzMF0sXG4gICAgJzEyJzogWzQsIDcsIDExLCAxNCwgMTgsIDIyLCAyNiwgMjksIDMzLCAzN10sXG4gICAgJzEzJzogWzQsIDgsIDEyLCAxNiwgMjAsIDI0LCAyOCwgMzMsIDM3LCA0MSwgNDVdLFxuICAgICcxNCc6IFs1LCA5LCAxMywgMTcsIDIyLCAyNiwgMzEsIDM2LCA0MCwgNDUsIDUwLCA1NV0sXG4gICAgJzE1JzogWzUsIDEwLCAxNCwgMTksIDI0LCAyOSwgMzQsIDM5LCA0NCwgNDksIDU0LCA1OSwgNjRdLFxuICAgICcxNic6IFs2LCAxMSwgMTUsIDIxLCAyNiwgMzEsIDM3LCA0MiwgNDcsIDUzLCA1OSwgNjQsIDcwLCA3NV0sXG4gICAgJzE3JzogWzYsIDExLCAxNywgMjIsIDI4LCAzNCwgMzksIDQ1LCA1MSwgNTcsIDYzLCA2NywgNzUsIDgxLCA4N10sXG4gICAgJzE4JzogWzcsIDEyLCAxOCwgMjQsIDMwLCAzNiwgNDIsIDQ4LCA1NSwgNjEsIDY3LCA3NCwgODAsIDg2LCA5MywgOTldLFxuICAgICcxOSc6IFs3LCAxMywgMTksIDI1LCAzMiwgMzgsIDQ1LCA1MiwgNTgsIDY1LCA3MiwgNzgsIDg1LCA5MiwgOTksIDEwNiwgMTEzXSxcbiAgICAnMjAnOiBbOCwgMTQsIDIwLCAyNywgMzQsIDQxLCA0OCwgNTUsIDYyLCA2OSwgNzYsIDgzLCA5MCwgOTgsIDEwNSwgMTEyLCAxMTksIDEyN10sXG4gICAgJzIxJzogWzgsIDE1LCAyMiwgMjksIDM2LCA0MywgNTAsIDU4LCA2NSwgNzMsIDgwLCA4OCwgOTYsIDEwMywgMTExLCAxMTksIDEyNiwgMTM0LCAxNDJdLFxuICAgICcyMic6IFs5LCAxNiwgMjMsIDMwLCAzOCwgNDUsIDUzLCA2MSwgNjksIDc3LCA4NSwgOTMsIDEwMSwgMTA5LCAxMTcsIDEyNSwgMTMzLCAxNDEsIDE1MCwgMTU4XSxcbiAgICAnMjMnOiBbOSwgMTcsIDI0LCAzMiwgNDAsIDQ4LCA1NiwgNjQsIDczLCA4MSwgODksIDk4LCAxMDYsIDExNSwgMTIzLCAxMzIsIDE0MCwgMTQ5LCAxNTcsIDE2NiwgMTc1XSxcbiAgICAnMjQnOiBbMTAsIDE3LCAyNSwgMzMsIDQyLCA1MCwgNTksIDY3LCA3NiwgODUsIDk0LCAxMDIsIDExMSwgMTIwLCAxMjksIDEzOCwgMTQ3LCAxNTYsIDE2NSwgMTc0LCAxODMsIDE5Ml0sXG4gICAgJzI1JzogWzEwLCAxOCwgMjcsIDM1LCA0NCwgNTMsIDYyLCA3MSwgODAsIDg5LCA5OCwgMTA3LCAxMTcsIDEyNiwgMTM1LCAxNDUsIDE1NCwgMTYzLCAxNzMsIDE4MiwgMTkyLCAyMDEsIDIxMV0sXG4gICAgJzI2JzogWzExLCAxOSwgMjgsIDM3LCA0NiwgNTUsIDY0LCA3NCwgODMsIDkzLCAxMDIsIDExMiwgMTIyLCAxMzIsIDE0MSwgMTUxLCAxNjEsIDE3MSwgMTgxLCAxOTEsIDIwMCwgMjEwLCAyMjAsIDIzMF0sXG4gICAgJzI3JzogWzExLCAyMCwgMjksIDM4LCA0OCwgNTcsIDY3LCA3NywgODcsIDk3LCAxMDcsIDExOCwgMTI1LCAxMzgsIDE0NywgMTU4LCAxNjgsIDE3OCwgMTg4LCAxOTksIDIwOSwgMjE5LCAyMzAsIDI0MCwgMjUwXSxcbiAgICAnMjgnOiBbMTIsIDIxLCAzMCwgNDAsIDUwLCA2MCwgNzAsIDgwLCA5MCwgMTAxLCAxMTEsIDEyMiwgMTMyLCAxNDMsIDE1NCwgMTY0LCAxNzUsIDE4NiwgMTk2LCAyMDcsIDIxOCwgMjI4LCAyMzksIDI1MCwgMjYxLCAyNzJdLFxuICAgICcyOSc6IFsxMywgMjIsIDMyLCA0MiwgNTIsIDYyLCA3MywgODMsIDk0LCAxMDUsIDExNiwgMTI3LCAxMzgsIDE0OSwgMTYwLCAxNzEsIDE4MiwgMTkzLCAyMDQsIDIxNSwgMjI2LCAyMzgsIDI0OSwgMjYwLCAyNzEsIDI4MiwgMjk0XSxcbiAgICAnMzAnOiBbMTMsIDIzLCAzMywgNDMsIDU0LCA2NSwgNzYsIDg3LCA5OCwgMTA5LCAxMjAsIDEzMSwgMTQzLCAxNTQsIDE2NiwgMTc3LCAxODksIDIwMCwgMjEyLCAyMjMsIDIzNSwgMjQ3LCAyNTgsIDI3MCwgMjgyLCAyOTMsIDMwNSwgMzE3XVxuICB9O1xuXG4gIC8qKlxuICAgKiBBbiBvYmplY3QgdXNlZCB0byBmbGFnIGVudmlyb25tZW50cy9mZWF0dXJlcy5cbiAgICpcbiAgICogQHN0YXRpY1xuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAqIEB0eXBlIE9iamVjdFxuICAgKi9cbiAgdmFyIHN1cHBvcnQgPSB7fTtcblxuICAoZnVuY3Rpb24oKSB7XG5cbiAgICAvKipcbiAgICAgKiBEZXRlY3QgQWRvYmUgQUlSLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5zdXBwb3J0XG4gICAgICogQHR5cGUgQm9vbGVhblxuICAgICAqL1xuICAgIHN1cHBvcnQuYWlyID0gaXNDbGFzc09mKHdpbmRvdy5ydW50aW1lLCAnU2NyaXB0QnJpZGdpbmdQcm94eU9iamVjdCcpO1xuXG4gICAgLyoqXG4gICAgICogRGV0ZWN0IGlmIGBhcmd1bWVudHNgIG9iamVjdHMgaGF2ZSB0aGUgY29ycmVjdCBpbnRlcm5hbCBbW0NsYXNzXV0gdmFsdWUuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLnN1cHBvcnRcbiAgICAgKiBAdHlwZSBCb29sZWFuXG4gICAgICovXG4gICAgc3VwcG9ydC5hcmd1bWVudHNDbGFzcyA9IGlzQ2xhc3NPZihhcmd1bWVudHMsICdBcmd1bWVudHMnKTtcblxuICAgIC8qKlxuICAgICAqIERldGVjdCBpZiBpbiBhIGJyb3dzZXIgZW52aXJvbm1lbnQuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLnN1cHBvcnRcbiAgICAgKiBAdHlwZSBCb29sZWFuXG4gICAgICovXG4gICAgc3VwcG9ydC5icm93c2VyID0gZG9jICYmIGlzSG9zdFR5cGUod2luZG93LCAnbmF2aWdhdG9yJyk7XG5cbiAgICAvKipcbiAgICAgKiBEZXRlY3QgaWYgc3RyaW5ncyBzdXBwb3J0IGFjY2Vzc2luZyBjaGFyYWN0ZXJzIGJ5IGluZGV4LlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5zdXBwb3J0XG4gICAgICogQHR5cGUgQm9vbGVhblxuICAgICAqL1xuICAgIHN1cHBvcnQuY2hhckJ5SW5kZXggPVxuICAgICAgLy8gSUUgOCBzdXBwb3J0cyBpbmRleGVzIG9uIHN0cmluZyBsaXRlcmFscyBidXQgbm90IHN0cmluZyBvYmplY3RzXG4gICAgICAoJ3gnWzBdICsgT2JqZWN0KCd4JylbMF0pID09ICd4eCc7XG5cbiAgICAvKipcbiAgICAgKiBEZXRlY3QgaWYgc3RyaW5ncyBoYXZlIGluZGV4ZXMgYXMgb3duIHByb3BlcnRpZXMuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLnN1cHBvcnRcbiAgICAgKiBAdHlwZSBCb29sZWFuXG4gICAgICovXG4gICAgc3VwcG9ydC5jaGFyQnlPd25JbmRleCA9XG4gICAgICAvLyBOYXJ3aGFsLCBSaGlubywgUmluZ29KUywgSUUgOCwgYW5kIE9wZXJhIDwgMTAuNTIgc3VwcG9ydCBpbmRleGVzIG9uXG4gICAgICAvLyBzdHJpbmdzIGJ1dCBkb24ndCBkZXRlY3QgdGhlbSBhcyBvd24gcHJvcGVydGllc1xuICAgICAgc3VwcG9ydC5jaGFyQnlJbmRleCAmJiBoYXNLZXkoJ3gnLCAnMCcpO1xuXG4gICAgLyoqXG4gICAgICogRGV0ZWN0IGlmIEphdmEgaXMgZW5hYmxlZC9leHBvc2VkLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5zdXBwb3J0XG4gICAgICogQHR5cGUgQm9vbGVhblxuICAgICAqL1xuICAgIHN1cHBvcnQuamF2YSA9IGlzQ2xhc3NPZih3aW5kb3cuamF2YSwgJ0phdmFQYWNrYWdlJyk7XG5cbiAgICAvKipcbiAgICAgKiBEZXRlY3QgaWYgdGhlIFRpbWVycyBBUEkgZXhpc3RzLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5zdXBwb3J0XG4gICAgICogQHR5cGUgQm9vbGVhblxuICAgICAqL1xuICAgIHN1cHBvcnQudGltZW91dCA9IGlzSG9zdFR5cGUod2luZG93LCAnc2V0VGltZW91dCcpICYmIGlzSG9zdFR5cGUod2luZG93LCAnY2xlYXJUaW1lb3V0Jyk7XG5cbiAgICAvKipcbiAgICAgKiBEZXRlY3QgaWYgZnVuY3Rpb25zIHN1cHBvcnQgZGVjb21waWxhdGlvbi5cbiAgICAgKlxuICAgICAqIEBuYW1lIGRlY29tcGlsYXRpb25cbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLnN1cHBvcnRcbiAgICAgKiBAdHlwZSBCb29sZWFuXG4gICAgICovXG4gICAgdHJ5IHtcbiAgICAgIC8vIFNhZmFyaSAyLnggcmVtb3ZlcyBjb21tYXMgaW4gb2JqZWN0IGxpdGVyYWxzXG4gICAgICAvLyBmcm9tIEZ1bmN0aW9uI3RvU3RyaW5nIHJlc3VsdHNcbiAgICAgIC8vIGh0dHA6Ly93ZWJrLml0LzExNjA5XG4gICAgICAvLyBGaXJlZm94IDMuNiBhbmQgT3BlcmEgOS4yNSBzdHJpcCBncm91cGluZ1xuICAgICAgLy8gcGFyZW50aGVzZXMgZnJvbSBGdW5jdGlvbiN0b1N0cmluZyByZXN1bHRzXG4gICAgICAvLyBodHRwOi8vYnVnemlsLmxhLzU1OTQzOFxuICAgICAgc3VwcG9ydC5kZWNvbXBpbGF0aW9uID0gRnVuY3Rpb24oXG4gICAgICAgICdyZXR1cm4gKCcgKyAoZnVuY3Rpb24oeCkgeyByZXR1cm4geyAneCc6ICcnICsgKDEgKyB4KSArICcnLCAneSc6IDAgfTsgfSkgKyAnKSdcbiAgICAgICkoKSgwKS54ID09PSAnMSc7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBzdXBwb3J0LmRlY29tcGlsYXRpb24gPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXRlY3QgRVM1KyBwcm9wZXJ0eSBkZXNjcmlwdG9yIEFQSS5cbiAgICAgKlxuICAgICAqIEBuYW1lIGRlc2NyaXB0b3JzXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5zdXBwb3J0XG4gICAgICogQHR5cGUgQm9vbGVhblxuICAgICAqL1xuICAgIHRyeSB7XG4gICAgICB2YXIgbyA9IHt9O1xuICAgICAgc3VwcG9ydC5kZXNjcmlwdG9ycyA9IChzZXREZXNjcmlwdG9yKG8sIG8sIG8pLCAndmFsdWUnIGluIGdldERlc2NyaXB0b3IobywgbykpO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgc3VwcG9ydC5kZXNjcmlwdG9ycyA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERldGVjdCBFUzUrIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKCkuXG4gICAgICpcbiAgICAgKiBAbmFtZSBnZXRBbGxLZXlzXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5zdXBwb3J0XG4gICAgICogQHR5cGUgQm9vbGVhblxuICAgICAqL1xuICAgIHRyeSB7XG4gICAgICBzdXBwb3J0LmdldEFsbEtleXMgPSAvXFxidmFsdWVPZlxcYi8udGVzdChnZXRBbGxLZXlzKE9iamVjdC5wcm90b3R5cGUpKTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHN1cHBvcnQuZ2V0QWxsS2V5cyA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERldGVjdCBpZiBvd24gcHJvcGVydGllcyBhcmUgaXRlcmF0ZWQgYmVmb3JlIGluaGVyaXRlZCBwcm9wZXJ0aWVzIChhbGwgYnV0IElFIDwgOSkuXG4gICAgICpcbiAgICAgKiBAbmFtZSBpdGVyYXRlc093bkxhc3RcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLnN1cHBvcnRcbiAgICAgKiBAdHlwZSBCb29sZWFuXG4gICAgICovXG4gICAgc3VwcG9ydC5pdGVyYXRlc093bkZpcnN0ID0gKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHByb3BzID0gW107XG4gICAgICBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLnggPSAxOyB9XG4gICAgICBjdG9yLnByb3RvdHlwZSA9IHsgJ3knOiAxIH07XG4gICAgICBmb3IgKHZhciBwcm9wIGluIG5ldyBjdG9yKSB7IHByb3BzLnB1c2gocHJvcCk7IH1cbiAgICAgIHJldHVybiBwcm9wc1swXSA9PSAneCc7XG4gICAgfSgpKTtcblxuICAgIC8qKlxuICAgICAqIERldGVjdCBpZiBhIG5vZGUncyBbW0NsYXNzXV0gaXMgcmVzb2x2YWJsZSAoYWxsIGJ1dCBJRSA8IDkpXG4gICAgICogYW5kIHRoYXQgdGhlIEpTIGVuZ2luZSBlcnJvcnMgd2hlbiBhdHRlbXB0aW5nIHRvIGNvZXJjZSBhbiBvYmplY3QgdG8gYVxuICAgICAqIHN0cmluZyB3aXRob3V0IGEgYHRvU3RyaW5nYCBwcm9wZXJ0eSB2YWx1ZSBvZiBgdHlwZW9mYCBcImZ1bmN0aW9uXCIuXG4gICAgICpcbiAgICAgKiBAbmFtZSBub2RlQ2xhc3NcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLnN1cHBvcnRcbiAgICAgKiBAdHlwZSBCb29sZWFuXG4gICAgICovXG4gICAgdHJ5IHtcbiAgICAgIHN1cHBvcnQubm9kZUNsYXNzID0gKHsgJ3RvU3RyaW5nJzogMCB9ICsgJycsIHRvU3RyaW5nLmNhbGwoZG9jIHx8IDApICE9ICdbb2JqZWN0IE9iamVjdF0nKTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHN1cHBvcnQubm9kZUNsYXNzID0gdHJ1ZTtcbiAgICB9XG4gIH0oKSk7XG5cbiAgLyoqXG4gICAqIFRpbWVyIG9iamVjdCB1c2VkIGJ5IGBjbG9jaygpYCBhbmQgYERlZmVycmVkI3Jlc29sdmVgLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAdHlwZSBPYmplY3RcbiAgICovXG4gIHZhciB0aW1lciA9IHtcblxuICAgLyoqXG4gICAgKiBUaGUgdGltZXIgbmFtZXNwYWNlIG9iamVjdCBvciBjb25zdHJ1Y3Rvci5cbiAgICAqXG4gICAgKiBAcHJpdmF0ZVxuICAgICogQG1lbWJlck9mIHRpbWVyXG4gICAgKiBAdHlwZSBGdW5jdGlvbnxPYmplY3RcbiAgICAqL1xuICAgICducyc6IERhdGUsXG5cbiAgIC8qKlxuICAgICogU3RhcnRzIHRoZSBkZWZlcnJlZCB0aW1lci5cbiAgICAqXG4gICAgKiBAcHJpdmF0ZVxuICAgICogQG1lbWJlck9mIHRpbWVyXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZGVmZXJyZWQgVGhlIGRlZmVycmVkIGluc3RhbmNlLlxuICAgICovXG4gICAgJ3N0YXJ0JzogbnVsbCwgLy8gbGF6eSBkZWZpbmVkIGluIGBjbG9jaygpYFxuXG4gICAvKipcbiAgICAqIFN0b3BzIHRoZSBkZWZlcnJlZCB0aW1lci5cbiAgICAqXG4gICAgKiBAcHJpdmF0ZVxuICAgICogQG1lbWJlck9mIHRpbWVyXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZGVmZXJyZWQgVGhlIGRlZmVycmVkIGluc3RhbmNlLlxuICAgICovXG4gICAgJ3N0b3AnOiBudWxsIC8vIGxhenkgZGVmaW5lZCBpbiBgY2xvY2soKWBcbiAgfTtcblxuICAvKiogU2hvcnRjdXQgZm9yIGludmVyc2UgcmVzdWx0cyAqL1xuICB2YXIgbm9Bcmd1bWVudHNDbGFzcyA9ICFzdXBwb3J0LmFyZ3VtZW50c0NsYXNzLFxuICAgICAgbm9DaGFyQnlJbmRleCA9ICFzdXBwb3J0LmNoYXJCeUluZGV4LFxuICAgICAgbm9DaGFyQnlPd25JbmRleCA9ICFzdXBwb3J0LmNoYXJCeU93bkluZGV4O1xuXG4gIC8qKiBNYXRoIHNob3J0Y3V0cyAqL1xuICB2YXIgYWJzICAgPSBNYXRoLmFicyxcbiAgICAgIGZsb29yID0gTWF0aC5mbG9vcixcbiAgICAgIG1heCAgID0gTWF0aC5tYXgsXG4gICAgICBtaW4gICA9IE1hdGgubWluLFxuICAgICAgcG93ICAgPSBNYXRoLnBvdyxcbiAgICAgIHNxcnQgID0gTWF0aC5zcXJ0O1xuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBUaGUgQmVuY2htYXJrIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgQSBuYW1lIHRvIGlkZW50aWZ5IHRoZSBiZW5jaG1hcmsuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBmbiBUaGUgdGVzdCB0byBiZW5jaG1hcmsuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gT3B0aW9ucyBvYmplY3QuXG4gICAqIEBleGFtcGxlXG4gICAqXG4gICAqIC8vIGJhc2ljIHVzYWdlICh0aGUgYG5ld2Agb3BlcmF0b3IgaXMgb3B0aW9uYWwpXG4gICAqIHZhciBiZW5jaCA9IG5ldyBCZW5jaG1hcmsoZm4pO1xuICAgKlxuICAgKiAvLyBvciB1c2luZyBhIG5hbWUgZmlyc3RcbiAgICogdmFyIGJlbmNoID0gbmV3IEJlbmNobWFyaygnZm9vJywgZm4pO1xuICAgKlxuICAgKiAvLyBvciB3aXRoIG9wdGlvbnNcbiAgICogdmFyIGJlbmNoID0gbmV3IEJlbmNobWFyaygnZm9vJywgZm4sIHtcbiAgICpcbiAgICogICAvLyBkaXNwbGF5ZWQgYnkgQmVuY2htYXJrI3RvU3RyaW5nIGlmIGBuYW1lYCBpcyBub3QgYXZhaWxhYmxlXG4gICAqICAgJ2lkJzogJ3h5eicsXG4gICAqXG4gICAqICAgLy8gY2FsbGVkIHdoZW4gdGhlIGJlbmNobWFyayBzdGFydHMgcnVubmluZ1xuICAgKiAgICdvblN0YXJ0Jzogb25TdGFydCxcbiAgICpcbiAgICogICAvLyBjYWxsZWQgYWZ0ZXIgZWFjaCBydW4gY3ljbGVcbiAgICogICAnb25DeWNsZSc6IG9uQ3ljbGUsXG4gICAqXG4gICAqICAgLy8gY2FsbGVkIHdoZW4gYWJvcnRlZFxuICAgKiAgICdvbkFib3J0Jzogb25BYm9ydCxcbiAgICpcbiAgICogICAvLyBjYWxsZWQgd2hlbiBhIHRlc3QgZXJyb3JzXG4gICAqICAgJ29uRXJyb3InOiBvbkVycm9yLFxuICAgKlxuICAgKiAgIC8vIGNhbGxlZCB3aGVuIHJlc2V0XG4gICAqICAgJ29uUmVzZXQnOiBvblJlc2V0LFxuICAgKlxuICAgKiAgIC8vIGNhbGxlZCB3aGVuIHRoZSBiZW5jaG1hcmsgY29tcGxldGVzIHJ1bm5pbmdcbiAgICogICAnb25Db21wbGV0ZSc6IG9uQ29tcGxldGUsXG4gICAqXG4gICAqICAgLy8gY29tcGlsZWQvY2FsbGVkIGJlZm9yZSB0aGUgdGVzdCBsb29wXG4gICAqICAgJ3NldHVwJzogc2V0dXAsXG4gICAqXG4gICAqICAgLy8gY29tcGlsZWQvY2FsbGVkIGFmdGVyIHRoZSB0ZXN0IGxvb3BcbiAgICogICAndGVhcmRvd24nOiB0ZWFyZG93blxuICAgKiB9KTtcbiAgICpcbiAgICogLy8gb3IgbmFtZSBhbmQgb3B0aW9uc1xuICAgKiB2YXIgYmVuY2ggPSBuZXcgQmVuY2htYXJrKCdmb28nLCB7XG4gICAqXG4gICAqICAgLy8gYSBmbGFnIHRvIGluZGljYXRlIHRoZSBiZW5jaG1hcmsgaXMgZGVmZXJyZWRcbiAgICogICAnZGVmZXInOiB0cnVlLFxuICAgKlxuICAgKiAgIC8vIGJlbmNobWFyayB0ZXN0IGZ1bmN0aW9uXG4gICAqICAgJ2ZuJzogZnVuY3Rpb24oZGVmZXJyZWQpIHtcbiAgICogICAgIC8vIGNhbGwgcmVzb2x2ZSgpIHdoZW4gdGhlIGRlZmVycmVkIHRlc3QgaXMgZmluaXNoZWRcbiAgICogICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICogICB9XG4gICAqIH0pO1xuICAgKlxuICAgKiAvLyBvciBvcHRpb25zIG9ubHlcbiAgICogdmFyIGJlbmNoID0gbmV3IEJlbmNobWFyayh7XG4gICAqXG4gICAqICAgLy8gYmVuY2htYXJrIG5hbWVcbiAgICogICAnbmFtZSc6ICdmb28nLFxuICAgKlxuICAgKiAgIC8vIGJlbmNobWFyayB0ZXN0IGFzIGEgc3RyaW5nXG4gICAqICAgJ2ZuJzogJ1sxLDIsMyw0XS5zb3J0KCknXG4gICAqIH0pO1xuICAgKlxuICAgKiAvLyBhIHRlc3QncyBgdGhpc2AgYmluZGluZyBpcyBzZXQgdG8gdGhlIGJlbmNobWFyayBpbnN0YW5jZVxuICAgKiB2YXIgYmVuY2ggPSBuZXcgQmVuY2htYXJrKCdmb28nLCBmdW5jdGlvbigpIHtcbiAgICogICAnTXkgbmFtZSBpcyAnLmNvbmNhdCh0aGlzLm5hbWUpOyAvLyBNeSBuYW1lIGlzIGZvb1xuICAgKiB9KTtcbiAgICovXG4gIGZ1bmN0aW9uIEJlbmNobWFyayhuYW1lLCBmbiwgb3B0aW9ucykge1xuICAgIHZhciBtZSA9IHRoaXM7XG5cbiAgICAvLyBhbGxvdyBpbnN0YW5jZSBjcmVhdGlvbiB3aXRob3V0IHRoZSBgbmV3YCBvcGVyYXRvclxuICAgIGlmIChtZSA9PSBudWxsIHx8IG1lLmNvbnN0cnVjdG9yICE9IEJlbmNobWFyaykge1xuICAgICAgcmV0dXJuIG5ldyBCZW5jaG1hcmsobmFtZSwgZm4sIG9wdGlvbnMpO1xuICAgIH1cbiAgICAvLyBqdWdnbGUgYXJndW1lbnRzXG4gICAgaWYgKGlzQ2xhc3NPZihuYW1lLCAnT2JqZWN0JykpIHtcbiAgICAgIC8vIDEgYXJndW1lbnQgKG9wdGlvbnMpXG4gICAgICBvcHRpb25zID0gbmFtZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXNDbGFzc09mKG5hbWUsICdGdW5jdGlvbicpKSB7XG4gICAgICAvLyAyIGFyZ3VtZW50cyAoZm4sIG9wdGlvbnMpXG4gICAgICBvcHRpb25zID0gZm47XG4gICAgICBmbiA9IG5hbWU7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzQ2xhc3NPZihmbiwgJ09iamVjdCcpKSB7XG4gICAgICAvLyAyIGFyZ3VtZW50cyAobmFtZSwgb3B0aW9ucylcbiAgICAgIG9wdGlvbnMgPSBmbjtcbiAgICAgIGZuID0gbnVsbDtcbiAgICAgIG1lLm5hbWUgPSBuYW1lO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIDMgYXJndW1lbnRzIChuYW1lLCBmbiBbLCBvcHRpb25zXSlcbiAgICAgIG1lLm5hbWUgPSBuYW1lO1xuICAgIH1cbiAgICBzZXRPcHRpb25zKG1lLCBvcHRpb25zKTtcbiAgICBtZS5pZCB8fCAobWUuaWQgPSArK2NvdW50ZXIpO1xuICAgIG1lLmZuID09IG51bGwgJiYgKG1lLmZuID0gZm4pO1xuICAgIG1lLnN0YXRzID0gZGVlcENsb25lKG1lLnN0YXRzKTtcbiAgICBtZS50aW1lcyA9IGRlZXBDbG9uZShtZS50aW1lcyk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIERlZmVycmVkIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgKiBAcGFyYW0ge09iamVjdH0gY2xvbmUgVGhlIGNsb25lZCBiZW5jaG1hcmsgaW5zdGFuY2UuXG4gICAqL1xuICBmdW5jdGlvbiBEZWZlcnJlZChjbG9uZSkge1xuICAgIHZhciBtZSA9IHRoaXM7XG4gICAgaWYgKG1lID09IG51bGwgfHwgbWUuY29uc3RydWN0b3IgIT0gRGVmZXJyZWQpIHtcbiAgICAgIHJldHVybiBuZXcgRGVmZXJyZWQoY2xvbmUpO1xuICAgIH1cbiAgICBtZS5iZW5jaG1hcmsgPSBjbG9uZTtcbiAgICBjbG9jayhtZSk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIEV2ZW50IGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAqL1xuICBmdW5jdGlvbiBFdmVudCh0eXBlKSB7XG4gICAgdmFyIG1lID0gdGhpcztcbiAgICByZXR1cm4gKG1lID09IG51bGwgfHwgbWUuY29uc3RydWN0b3IgIT0gRXZlbnQpXG4gICAgICA/IG5ldyBFdmVudCh0eXBlKVxuICAgICAgOiAodHlwZSBpbnN0YW5jZW9mIEV2ZW50KVxuICAgICAgICAgID8gdHlwZVxuICAgICAgICAgIDogZXh0ZW5kKG1lLCB7ICd0aW1lU3RhbXAnOiArbmV3IERhdGUgfSwgdHlwZW9mIHR5cGUgPT0gJ3N0cmluZycgPyB7ICd0eXBlJzogdHlwZSB9IDogdHlwZSk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIFN1aXRlIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBBIG5hbWUgdG8gaWRlbnRpZnkgdGhlIHN1aXRlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIE9wdGlvbnMgb2JqZWN0LlxuICAgKiBAZXhhbXBsZVxuICAgKlxuICAgKiAvLyBiYXNpYyB1c2FnZSAodGhlIGBuZXdgIG9wZXJhdG9yIGlzIG9wdGlvbmFsKVxuICAgKiB2YXIgc3VpdGUgPSBuZXcgQmVuY2htYXJrLlN1aXRlO1xuICAgKlxuICAgKiAvLyBvciB1c2luZyBhIG5hbWUgZmlyc3RcbiAgICogdmFyIHN1aXRlID0gbmV3IEJlbmNobWFyay5TdWl0ZSgnZm9vJyk7XG4gICAqXG4gICAqIC8vIG9yIHdpdGggb3B0aW9uc1xuICAgKiB2YXIgc3VpdGUgPSBuZXcgQmVuY2htYXJrLlN1aXRlKCdmb28nLCB7XG4gICAqXG4gICAqICAgLy8gY2FsbGVkIHdoZW4gdGhlIHN1aXRlIHN0YXJ0cyBydW5uaW5nXG4gICAqICAgJ29uU3RhcnQnOiBvblN0YXJ0LFxuICAgKlxuICAgKiAgIC8vIGNhbGxlZCBiZXR3ZWVuIHJ1bm5pbmcgYmVuY2htYXJrc1xuICAgKiAgICdvbkN5Y2xlJzogb25DeWNsZSxcbiAgICpcbiAgICogICAvLyBjYWxsZWQgd2hlbiBhYm9ydGVkXG4gICAqICAgJ29uQWJvcnQnOiBvbkFib3J0LFxuICAgKlxuICAgKiAgIC8vIGNhbGxlZCB3aGVuIGEgdGVzdCBlcnJvcnNcbiAgICogICAnb25FcnJvcic6IG9uRXJyb3IsXG4gICAqXG4gICAqICAgLy8gY2FsbGVkIHdoZW4gcmVzZXRcbiAgICogICAnb25SZXNldCc6IG9uUmVzZXQsXG4gICAqXG4gICAqICAgLy8gY2FsbGVkIHdoZW4gdGhlIHN1aXRlIGNvbXBsZXRlcyBydW5uaW5nXG4gICAqICAgJ29uQ29tcGxldGUnOiBvbkNvbXBsZXRlXG4gICAqIH0pO1xuICAgKi9cbiAgZnVuY3Rpb24gU3VpdGUobmFtZSwgb3B0aW9ucykge1xuICAgIHZhciBtZSA9IHRoaXM7XG5cbiAgICAvLyBhbGxvdyBpbnN0YW5jZSBjcmVhdGlvbiB3aXRob3V0IHRoZSBgbmV3YCBvcGVyYXRvclxuICAgIGlmIChtZSA9PSBudWxsIHx8IG1lLmNvbnN0cnVjdG9yICE9IFN1aXRlKSB7XG4gICAgICByZXR1cm4gbmV3IFN1aXRlKG5hbWUsIG9wdGlvbnMpO1xuICAgIH1cbiAgICAvLyBqdWdnbGUgYXJndW1lbnRzXG4gICAgaWYgKGlzQ2xhc3NPZihuYW1lLCAnT2JqZWN0JykpIHtcbiAgICAgIC8vIDEgYXJndW1lbnQgKG9wdGlvbnMpXG4gICAgICBvcHRpb25zID0gbmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gMiBhcmd1bWVudHMgKG5hbWUgWywgb3B0aW9uc10pXG4gICAgICBtZS5uYW1lID0gbmFtZTtcbiAgICB9XG4gICAgc2V0T3B0aW9ucyhtZSwgb3B0aW9ucyk7XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogTm90ZTogU29tZSBhcnJheSBtZXRob2RzIGhhdmUgYmVlbiBpbXBsZW1lbnRlZCBpbiBwbGFpbiBKYXZhU2NyaXB0IHRvIGF2b2lkXG4gICAqIGJ1Z3MgaW4gSUUsIE9wZXJhLCBSaGlubywgYW5kIE1vYmlsZSBTYWZhcmkuXG4gICAqXG4gICAqIElFIGNvbXBhdGliaWxpdHkgbW9kZSBhbmQgSUUgPCA5IGhhdmUgYnVnZ3kgQXJyYXkgYHNoaWZ0KClgIGFuZCBgc3BsaWNlKClgXG4gICAqIGZ1bmN0aW9ucyB0aGF0IGZhaWwgdG8gcmVtb3ZlIHRoZSBsYXN0IGVsZW1lbnQsIGBvYmplY3RbMF1gLCBvZlxuICAgKiBhcnJheS1saWtlLW9iamVjdHMgZXZlbiB0aG91Z2ggdGhlIGBsZW5ndGhgIHByb3BlcnR5IGlzIHNldCB0byBgMGAuXG4gICAqIFRoZSBgc2hpZnQoKWAgbWV0aG9kIGlzIGJ1Z2d5IGluIElFIDggY29tcGF0aWJpbGl0eSBtb2RlLCB3aGlsZSBgc3BsaWNlKClgXG4gICAqIGlzIGJ1Z2d5IHJlZ2FyZGxlc3Mgb2YgbW9kZSBpbiBJRSA8IDkgYW5kIGJ1Z2d5IGluIGNvbXBhdGliaWxpdHkgbW9kZSBpbiBJRSA5LlxuICAgKlxuICAgKiBJbiBPcGVyYSA8IDkuNTAgYW5kIHNvbWUgb2xkZXIvYmV0YSBNb2JpbGUgU2FmYXJpIHZlcnNpb25zIHVzaW5nIGB1bnNoaWZ0KClgXG4gICAqIGdlbmVyaWNhbGx5IHRvIGF1Z21lbnQgdGhlIGBhcmd1bWVudHNgIG9iamVjdCB3aWxsIHBhdmUgdGhlIHZhbHVlIGF0IGluZGV4IDBcbiAgICogd2l0aG91dCBpbmNyaW1lbnRpbmcgdGhlIG90aGVyIHZhbHVlcydzIGluZGV4ZXMuXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9kb2N1bWVudGNsb3VkL3VuZGVyc2NvcmUvaXNzdWVzLzlcbiAgICpcbiAgICogUmhpbm8gYW5kIGVudmlyb25tZW50cyBpdCBwb3dlcnMsIGxpa2UgTmFyd2hhbCBhbmQgUmluZ29KUywgbWF5IGhhdmVcbiAgICogYnVnZ3kgQXJyYXkgYGNvbmNhdCgpYCwgYHJldmVyc2UoKWAsIGBzaGlmdCgpYCwgYHNsaWNlKClgLCBgc3BsaWNlKClgIGFuZFxuICAgKiBgdW5zaGlmdCgpYCBmdW5jdGlvbnMgdGhhdCBtYWtlIHNwYXJzZSBhcnJheXMgbm9uLXNwYXJzZSBieSBhc3NpZ25pbmcgdGhlXG4gICAqIHVuZGVmaW5lZCBpbmRleGVzIGEgdmFsdWUgb2YgdW5kZWZpbmVkLlxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9yaGluby9jb21taXQvNzAyYWJmZWQzZjhjYTA0M2IyNjM2ZWZkMzFjMTRiYTc1NTI2MDNkZFxuICAgKi9cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBlbGVtZW50cyBvZiB0aGUgaG9zdCBhcnJheSBmb2xsb3dlZCBieSB0aGVcbiAgICogZWxlbWVudHMgb2YgZWFjaCBhcmd1bWVudCBpbiBvcmRlci5cbiAgICpcbiAgICogQG1lbWJlck9mIEJlbmNobWFyay5TdWl0ZVxuICAgKiBAcmV0dXJucyB7QXJyYXl9IFRoZSBuZXcgYXJyYXkuXG4gICAqL1xuICBmdW5jdGlvbiBjb25jYXQoKSB7XG4gICAgdmFyIHZhbHVlLFxuICAgICAgICBqID0gLTEsXG4gICAgICAgIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGgsXG4gICAgICAgIHJlc3VsdCA9IHNsaWNlLmNhbGwodGhpcyksXG4gICAgICAgIGluZGV4ID0gcmVzdWx0Lmxlbmd0aDtcblxuICAgIHdoaWxlICgrK2ogPCBsZW5ndGgpIHtcbiAgICAgIHZhbHVlID0gYXJndW1lbnRzW2pdO1xuICAgICAgaWYgKGlzQ2xhc3NPZih2YWx1ZSwgJ0FycmF5JykpIHtcbiAgICAgICAgZm9yICh2YXIgayA9IDAsIGwgPSB2YWx1ZS5sZW5ndGg7IGsgPCBsOyBrKyssIGluZGV4KyspIHtcbiAgICAgICAgICBpZiAoayBpbiB2YWx1ZSkge1xuICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IHZhbHVlW2tdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0W2luZGV4KytdID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogVXRpbGl0eSBmdW5jdGlvbiB1c2VkIGJ5IGBzaGlmdCgpYCwgYHNwbGljZSgpYCwgYW5kIGB1bnNoaWZ0KClgLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge051bWJlcn0gc3RhcnQgVGhlIGluZGV4IHRvIHN0YXJ0IGluc2VydGluZyBlbGVtZW50cy5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGRlbGV0ZUNvdW50IFRoZSBudW1iZXIgb2YgZWxlbWVudHMgdG8gZGVsZXRlIGZyb20gdGhlIGluc2VydCBwb2ludC5cbiAgICogQHBhcmFtIHtBcnJheX0gZWxlbWVudHMgVGhlIGVsZW1lbnRzIHRvIGluc2VydC5cbiAgICogQHJldHVybnMge0FycmF5fSBBbiBhcnJheSBvZiBkZWxldGVkIGVsZW1lbnRzLlxuICAgKi9cbiAgZnVuY3Rpb24gaW5zZXJ0KHN0YXJ0LCBkZWxldGVDb3VudCwgZWxlbWVudHMpIHtcbiAgICAvLyBgcmVzdWx0YCBzaG91bGQgaGF2ZSBpdHMgbGVuZ3RoIHNldCB0byB0aGUgYGRlbGV0ZUNvdW50YFxuICAgIC8vIHNlZSBodHRwczovL2J1Z3MuZWNtYXNjcmlwdC5vcmcvc2hvd19idWcuY2dpP2lkPTMzMlxuICAgIHZhciBkZWxldGVFbmQgPSBzdGFydCArIGRlbGV0ZUNvdW50LFxuICAgICAgICBlbGVtZW50Q291bnQgPSBlbGVtZW50cyA/IGVsZW1lbnRzLmxlbmd0aCA6IDAsXG4gICAgICAgIGluZGV4ID0gc3RhcnQgLSAxLFxuICAgICAgICBsZW5ndGggPSBzdGFydCArIGVsZW1lbnRDb3VudCxcbiAgICAgICAgb2JqZWN0ID0gdGhpcyxcbiAgICAgICAgcmVzdWx0ID0gQXJyYXkoZGVsZXRlQ291bnQpLFxuICAgICAgICB0YWlsID0gc2xpY2UuY2FsbChvYmplY3QsIGRlbGV0ZUVuZCk7XG5cbiAgICAvLyBkZWxldGUgZWxlbWVudHMgZnJvbSB0aGUgYXJyYXlcbiAgICB3aGlsZSAoKytpbmRleCA8IGRlbGV0ZUVuZCkge1xuICAgICAgaWYgKGluZGV4IGluIG9iamVjdCkge1xuICAgICAgICByZXN1bHRbaW5kZXggLSBzdGFydF0gPSBvYmplY3RbaW5kZXhdO1xuICAgICAgICBkZWxldGUgb2JqZWN0W2luZGV4XTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gaW5zZXJ0IGVsZW1lbnRzXG4gICAgaW5kZXggPSBzdGFydCAtIDE7XG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIG9iamVjdFtpbmRleF0gPSBlbGVtZW50c1tpbmRleCAtIHN0YXJ0XTtcbiAgICB9XG4gICAgLy8gYXBwZW5kIHRhaWwgZWxlbWVudHNcbiAgICBzdGFydCA9IGluZGV4LS07XG4gICAgbGVuZ3RoID0gbWF4KDAsIChvYmplY3QubGVuZ3RoID4+PiAwKSAtIGRlbGV0ZUNvdW50ICsgZWxlbWVudENvdW50KTtcbiAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgaWYgKChpbmRleCAtIHN0YXJ0KSBpbiB0YWlsKSB7XG4gICAgICAgIG9iamVjdFtpbmRleF0gPSB0YWlsW2luZGV4IC0gc3RhcnRdO1xuICAgICAgfSBlbHNlIGlmIChpbmRleCBpbiBvYmplY3QpIHtcbiAgICAgICAgZGVsZXRlIG9iamVjdFtpbmRleF07XG4gICAgICB9XG4gICAgfVxuICAgIC8vIGRlbGV0ZSBleGNlc3MgZWxlbWVudHNcbiAgICBkZWxldGVDb3VudCA9IGRlbGV0ZUNvdW50ID4gZWxlbWVudENvdW50ID8gZGVsZXRlQ291bnQgLSBlbGVtZW50Q291bnQgOiAwO1xuICAgIHdoaWxlIChkZWxldGVDb3VudC0tKSB7XG4gICAgICBpbmRleCA9IGxlbmd0aCArIGRlbGV0ZUNvdW50O1xuICAgICAgaWYgKGluZGV4IGluIG9iamVjdCkge1xuICAgICAgICBkZWxldGUgb2JqZWN0W2luZGV4XTtcbiAgICAgIH1cbiAgICB9XG4gICAgb2JqZWN0Lmxlbmd0aCA9IGxlbmd0aDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYXJyYW5nZSB0aGUgaG9zdCBhcnJheSdzIGVsZW1lbnRzIGluIHJldmVyc2Ugb3JkZXIuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGVcbiAgICogQHJldHVybnMge0FycmF5fSBUaGUgcmV2ZXJzZWQgYXJyYXkuXG4gICAqL1xuICBmdW5jdGlvbiByZXZlcnNlKCkge1xuICAgIHZhciB1cHBlckluZGV4LFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgb2JqZWN0ID0gT2JqZWN0KHRoaXMpLFxuICAgICAgICBsZW5ndGggPSBvYmplY3QubGVuZ3RoID4+PiAwLFxuICAgICAgICBtaWRkbGUgPSBmbG9vcihsZW5ndGggLyAyKTtcblxuICAgIGlmIChsZW5ndGggPiAxKSB7XG4gICAgICB3aGlsZSAoKytpbmRleCA8IG1pZGRsZSkge1xuICAgICAgICB1cHBlckluZGV4ID0gbGVuZ3RoIC0gaW5kZXggLSAxO1xuICAgICAgICB2YWx1ZSA9IHVwcGVySW5kZXggaW4gb2JqZWN0ID8gb2JqZWN0W3VwcGVySW5kZXhdIDogdWlkO1xuICAgICAgICBpZiAoaW5kZXggaW4gb2JqZWN0KSB7XG4gICAgICAgICAgb2JqZWN0W3VwcGVySW5kZXhdID0gb2JqZWN0W2luZGV4XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgb2JqZWN0W3VwcGVySW5kZXhdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2YWx1ZSAhPSB1aWQpIHtcbiAgICAgICAgICBvYmplY3RbaW5kZXhdID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIG9iamVjdFtpbmRleF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSBmaXJzdCBlbGVtZW50IG9mIHRoZSBob3N0IGFycmF5IGFuZCByZXR1cm5zIGl0LlxuICAgKlxuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLlN1aXRlXG4gICAqIEByZXR1cm5zIHtNaXhlZH0gVGhlIGZpcnN0IGVsZW1lbnQgb2YgdGhlIGFycmF5LlxuICAgKi9cbiAgZnVuY3Rpb24gc2hpZnQoKSB7XG4gICAgcmV0dXJuIGluc2VydC5jYWxsKHRoaXMsIDAsIDEpWzBdO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIGhvc3QgYXJyYXkncyBlbGVtZW50cyBmcm9tIHRoZSBzdGFydCBpbmRleCB1cCB0byxcbiAgICogYnV0IG5vdCBpbmNsdWRpbmcsIHRoZSBlbmQgaW5kZXguXG4gICAqXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHN0YXJ0IFRoZSBzdGFydGluZyBpbmRleC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGVuZCBUaGUgZW5kIGluZGV4LlxuICAgKiBAcmV0dXJucyB7QXJyYXl9IFRoZSBuZXcgYXJyYXkuXG4gICAqL1xuICBmdW5jdGlvbiBzbGljZShzdGFydCwgZW5kKSB7XG4gICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgIG9iamVjdCA9IE9iamVjdCh0aGlzKSxcbiAgICAgICAgbGVuZ3RoID0gb2JqZWN0Lmxlbmd0aCA+Pj4gMCxcbiAgICAgICAgcmVzdWx0ID0gW107XG5cbiAgICBzdGFydCA9IHRvSW50ZWdlcihzdGFydCk7XG4gICAgc3RhcnQgPSBzdGFydCA8IDAgPyBtYXgobGVuZ3RoICsgc3RhcnQsIDApIDogbWluKHN0YXJ0LCBsZW5ndGgpO1xuICAgIHN0YXJ0LS07XG4gICAgZW5kID0gZW5kID09IG51bGwgPyBsZW5ndGggOiB0b0ludGVnZXIoZW5kKTtcbiAgICBlbmQgPSBlbmQgPCAwID8gbWF4KGxlbmd0aCArIGVuZCwgMCkgOiBtaW4oZW5kLCBsZW5ndGgpO1xuXG4gICAgd2hpbGUgKCgrK2luZGV4LCArK3N0YXJ0KSA8IGVuZCkge1xuICAgICAgaWYgKHN0YXJ0IGluIG9iamVjdCkge1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gb2JqZWN0W3N0YXJ0XTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvd3MgcmVtb3ZpbmcgYSByYW5nZSBvZiBlbGVtZW50cyBhbmQvb3IgaW5zZXJ0aW5nIGVsZW1lbnRzIGludG8gdGhlXG4gICAqIGhvc3QgYXJyYXkuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHN0YXJ0IFRoZSBzdGFydCBpbmRleC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGRlbGV0ZUNvdW50IFRoZSBudW1iZXIgb2YgZWxlbWVudHMgdG8gZGVsZXRlLlxuICAgKiBAcGFyYW0ge01peGVkfSBbdmFsMSwgdmFsMiwgLi4uXSB2YWx1ZXMgdG8gaW5zZXJ0IGF0IHRoZSBgc3RhcnRgIGluZGV4LlxuICAgKiBAcmV0dXJucyB7QXJyYXl9IEFuIGFycmF5IG9mIHJlbW92ZWQgZWxlbWVudHMuXG4gICAqL1xuICBmdW5jdGlvbiBzcGxpY2Uoc3RhcnQsIGRlbGV0ZUNvdW50KSB7XG4gICAgdmFyIG9iamVjdCA9IE9iamVjdCh0aGlzKSxcbiAgICAgICAgbGVuZ3RoID0gb2JqZWN0Lmxlbmd0aCA+Pj4gMDtcblxuICAgIHN0YXJ0ID0gdG9JbnRlZ2VyKHN0YXJ0KTtcbiAgICBzdGFydCA9IHN0YXJ0IDwgMCA/IG1heChsZW5ndGggKyBzdGFydCwgMCkgOiBtaW4oc3RhcnQsIGxlbmd0aCk7XG5cbiAgICAvLyBzdXBwb3J0IHRoZSBkZS1mYWN0byBTcGlkZXJNb25rZXkgZXh0ZW5zaW9uXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvc3BsaWNlI1BhcmFtZXRlcnNcbiAgICAvLyBodHRwczovL2J1Z3MuZWNtYXNjcmlwdC5vcmcvc2hvd19idWcuY2dpP2lkPTQyOVxuICAgIGRlbGV0ZUNvdW50ID0gYXJndW1lbnRzLmxlbmd0aCA9PSAxXG4gICAgICA/IGxlbmd0aCAtIHN0YXJ0XG4gICAgICA6IG1pbihtYXgodG9JbnRlZ2VyKGRlbGV0ZUNvdW50KSwgMCksIGxlbmd0aCAtIHN0YXJ0KTtcblxuICAgIHJldHVybiBpbnNlcnQuY2FsbChvYmplY3QsIHN0YXJ0LCBkZWxldGVDb3VudCwgc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGUgc3BlY2lmaWVkIGB2YWx1ZWAgdG8gYW4gaW50ZWdlci5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtNaXhlZH0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSByZXN1bHRpbmcgaW50ZWdlci5cbiAgICovXG4gIGZ1bmN0aW9uIHRvSW50ZWdlcih2YWx1ZSkge1xuICAgIHZhbHVlID0gK3ZhbHVlO1xuICAgIHJldHVybiB2YWx1ZSA9PT0gMCB8fCAhaXNGaW5pdGUodmFsdWUpID8gdmFsdWUgfHwgMCA6IHZhbHVlIC0gKHZhbHVlICUgMSk7XG4gIH1cblxuICAvKipcbiAgICogQXBwZW5kcyBhcmd1bWVudHMgdG8gdGhlIGhvc3QgYXJyYXkuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGVcbiAgICogQHJldHVybnMge051bWJlcn0gVGhlIG5ldyBsZW5ndGguXG4gICAqL1xuICBmdW5jdGlvbiB1bnNoaWZ0KCkge1xuICAgIHZhciBvYmplY3QgPSBPYmplY3QodGhpcyk7XG4gICAgaW5zZXJ0LmNhbGwob2JqZWN0LCAwLCAwLCBhcmd1bWVudHMpO1xuICAgIHJldHVybiBvYmplY3QubGVuZ3RoO1xuICB9XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLyoqXG4gICAqIEEgZ2VuZXJpYyBgRnVuY3Rpb24jYmluZGAgbGlrZSBtZXRob2QuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBiZSBib3VuZCB0byBgdGhpc0FyZ2AuXG4gICAqIEBwYXJhbSB7TWl4ZWR9IHRoaXNBcmcgVGhlIGB0aGlzYCBiaW5kaW5nIGZvciB0aGUgZ2l2ZW4gZnVuY3Rpb24uXG4gICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gVGhlIGJvdW5kIGZ1bmN0aW9uLlxuICAgKi9cbiAgZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHsgZm4uYXBwbHkodGhpc0FyZywgYXJndW1lbnRzKTsgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgZnVuY3Rpb24gZnJvbSB0aGUgZ2l2ZW4gYXJndW1lbnRzIHN0cmluZyBhbmQgYm9keS5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtTdHJpbmd9IGFyZ3MgVGhlIGNvbW1hIHNlcGFyYXRlZCBmdW5jdGlvbiBhcmd1bWVudHMuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBib2R5IFRoZSBmdW5jdGlvbiBib2R5LlxuICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFRoZSBuZXcgZnVuY3Rpb24uXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVGdW5jdGlvbigpIHtcbiAgICAvLyBsYXp5IGRlZmluZVxuICAgIGNyZWF0ZUZ1bmN0aW9uID0gZnVuY3Rpb24oYXJncywgYm9keSkge1xuICAgICAgdmFyIHJlc3VsdCxcbiAgICAgICAgICBhbmNob3IgPSBmcmVlRGVmaW5lID8gZGVmaW5lLmFtZCA6IEJlbmNobWFyayxcbiAgICAgICAgICBwcm9wID0gdWlkICsgJ2NyZWF0ZUZ1bmN0aW9uJztcblxuICAgICAgcnVuU2NyaXB0KChmcmVlRGVmaW5lID8gJ2RlZmluZS5hbWQuJyA6ICdCZW5jaG1hcmsuJykgKyBwcm9wICsgJz1mdW5jdGlvbignICsgYXJncyArICcpeycgKyBib2R5ICsgJ30nKTtcbiAgICAgIHJlc3VsdCA9IGFuY2hvcltwcm9wXTtcbiAgICAgIGRlbGV0ZSBhbmNob3JbcHJvcF07XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgLy8gZml4IEphZWdlck1vbmtleSBidWdcbiAgICAvLyBodHRwOi8vYnVnemlsLmxhLzYzOTcyMFxuICAgIGNyZWF0ZUZ1bmN0aW9uID0gc3VwcG9ydC5icm93c2VyICYmIChjcmVhdGVGdW5jdGlvbignJywgJ3JldHVyblwiJyArIHVpZCArICdcIicpIHx8IG5vb3ApKCkgPT0gdWlkID8gY3JlYXRlRnVuY3Rpb24gOiBGdW5jdGlvbjtcbiAgICByZXR1cm4gY3JlYXRlRnVuY3Rpb24uYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxheSB0aGUgZXhlY3V0aW9uIG9mIGEgZnVuY3Rpb24gYmFzZWQgb24gdGhlIGJlbmNobWFyaydzIGBkZWxheWAgcHJvcGVydHkuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBiZW5jaCBUaGUgYmVuY2htYXJrIGluc3RhbmNlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gZm4gVGhlIGZ1bmN0aW9uIHRvIGV4ZWN1dGUuXG4gICAqL1xuICBmdW5jdGlvbiBkZWxheShiZW5jaCwgZm4pIHtcbiAgICBiZW5jaC5fdGltZXJJZCA9IHNldFRpbWVvdXQoZm4sIGJlbmNoLmRlbGF5ICogMWUzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRvIGRlc3Ryb3kuXG4gICAqL1xuICBmdW5jdGlvbiBkZXN0cm95RWxlbWVudChlbGVtZW50KSB7XG4gICAgdHJhc2guYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gICAgdHJhc2guaW5uZXJIVE1MID0gJyc7XG4gIH1cblxuICAvKipcbiAgICogSXRlcmF0ZXMgb3ZlciBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLCBleGVjdXRpbmcgdGhlIGBjYWxsYmFja2AgZm9yIGVhY2guXG4gICAqIENhbGxiYWNrcyBtYXkgdGVybWluYXRlIHRoZSBsb29wIGJ5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiBleGVjdXRlZCBwZXIgb3duIHByb3BlcnR5LlxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFRoZSBvcHRpb25zIG9iamVjdC5cbiAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgb2JqZWN0IGl0ZXJhdGVkIG92ZXIuXG4gICAqL1xuICBmdW5jdGlvbiBmb3JQcm9wcygpIHtcbiAgICB2YXIgZm9yU2hhZG93ZWQsXG4gICAgICAgIHNraXBTZWVuLFxuICAgICAgICBmb3JBcmdzID0gdHJ1ZSxcbiAgICAgICAgc2hhZG93ZWQgPSBbJ2NvbnN0cnVjdG9yJywgJ2hhc093blByb3BlcnR5JywgJ2lzUHJvdG90eXBlT2YnLCAncHJvcGVydHlJc0VudW1lcmFibGUnLCAndG9Mb2NhbGVTdHJpbmcnLCAndG9TdHJpbmcnLCAndmFsdWVPZiddO1xuXG4gICAgKGZ1bmN0aW9uKGVudW1GbGFnLCBrZXkpIHtcbiAgICAgIC8vIG11c3QgdXNlIGEgbm9uLW5hdGl2ZSBjb25zdHJ1Y3RvciB0byBjYXRjaCB0aGUgU2FmYXJpIDIgaXNzdWVcbiAgICAgIGZ1bmN0aW9uIEtsYXNzKCkgeyB0aGlzLnZhbHVlT2YgPSAwOyB9O1xuICAgICAgS2xhc3MucHJvdG90eXBlLnZhbHVlT2YgPSAwO1xuICAgICAgLy8gY2hlY2sgdmFyaW91cyBmb3ItaW4gYnVnc1xuICAgICAgZm9yIChrZXkgaW4gbmV3IEtsYXNzKSB7XG4gICAgICAgIGVudW1GbGFnICs9IGtleSA9PSAndmFsdWVPZicgPyAxIDogMDtcbiAgICAgIH1cbiAgICAgIC8vIGNoZWNrIGlmIGBhcmd1bWVudHNgIG9iamVjdHMgaGF2ZSBub24tZW51bWVyYWJsZSBpbmRleGVzXG4gICAgICBmb3IgKGtleSBpbiBhcmd1bWVudHMpIHtcbiAgICAgICAga2V5ID09ICcwJyAmJiAoZm9yQXJncyA9IGZhbHNlKTtcbiAgICAgIH1cbiAgICAgIC8vIFNhZmFyaSAyIGl0ZXJhdGVzIG92ZXIgc2hhZG93ZWQgcHJvcGVydGllcyB0d2ljZVxuICAgICAgLy8gaHR0cDovL3JlcGxheS53YXliYWNrbWFjaGluZS5vcmcvMjAwOTA0MjgyMjI5NDEvaHR0cDovL3RvYmllbGFuZ2VsLmNvbS8yMDA3LzEvMjkvZm9yLWluLWxvb3AtYnJva2VuLWluLXNhZmFyaS9cbiAgICAgIHNraXBTZWVuID0gZW51bUZsYWcgPT0gMjtcbiAgICAgIC8vIElFIDwgOSBpbmNvcnJlY3RseSBtYWtlcyBhbiBvYmplY3QncyBwcm9wZXJ0aWVzIG5vbi1lbnVtZXJhYmxlIGlmIHRoZXkgaGF2ZVxuICAgICAgLy8gdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBub24tZW51bWVyYWJsZSBwcm9wZXJ0aWVzIGluIGl0cyBwcm90b3R5cGUgY2hhaW4uXG4gICAgICBmb3JTaGFkb3dlZCA9ICFlbnVtRmxhZztcbiAgICB9KDApKTtcblxuICAgIC8vIGxhenkgZGVmaW5lXG4gICAgZm9yUHJvcHMgPSBmdW5jdGlvbihvYmplY3QsIGNhbGxiYWNrLCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuXG4gICAgICB2YXIgcmVzdWx0ID0gb2JqZWN0O1xuICAgICAgb2JqZWN0ID0gT2JqZWN0KG9iamVjdCk7XG5cbiAgICAgIHZhciBjdG9yLFxuICAgICAgICAgIGtleSxcbiAgICAgICAgICBrZXlzLFxuICAgICAgICAgIHNraXBDdG9yLFxuICAgICAgICAgIGRvbmUgPSAhcmVzdWx0LFxuICAgICAgICAgIHdoaWNoID0gb3B0aW9ucy53aGljaCxcbiAgICAgICAgICBhbGxGbGFnID0gd2hpY2ggPT0gJ2FsbCcsXG4gICAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgICBpdGVyYXRlZSA9IG9iamVjdCxcbiAgICAgICAgICBsZW5ndGggPSBvYmplY3QubGVuZ3RoLFxuICAgICAgICAgIG93bkZsYWcgPSBhbGxGbGFnIHx8IHdoaWNoID09ICdvd24nLFxuICAgICAgICAgIHNlZW4gPSB7fSxcbiAgICAgICAgICBza2lwUHJvdG8gPSBpc0NsYXNzT2Yob2JqZWN0LCAnRnVuY3Rpb24nKSxcbiAgICAgICAgICB0aGlzQXJnID0gb3B0aW9ucy5iaW5kO1xuXG4gICAgICBpZiAodGhpc0FyZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNhbGxiYWNrID0gYmluZChjYWxsYmFjaywgdGhpc0FyZyk7XG4gICAgICB9XG4gICAgICAvLyBpdGVyYXRlIGFsbCBwcm9wZXJ0aWVzXG4gICAgICBpZiAoYWxsRmxhZyAmJiBzdXBwb3J0LmdldEFsbEtleXMpIHtcbiAgICAgICAgZm9yIChpbmRleCA9IDAsIGtleXMgPSBnZXRBbGxLZXlzKG9iamVjdCksIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGtleSA9IGtleXNbaW5kZXhdO1xuICAgICAgICAgIGlmIChjYWxsYmFjayhvYmplY3Rba2V5XSwga2V5LCBvYmplY3QpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBlbHNlIGl0ZXJhdGUgb25seSBlbnVtZXJhYmxlIHByb3BlcnRpZXNcbiAgICAgIGVsc2Uge1xuICAgICAgICBmb3IgKGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICAvLyBGaXJlZm94IDwgMy42LCBPcGVyYSA+IDkuNTAgLSBPcGVyYSA8IDExLjYwLCBhbmQgU2FmYXJpIDwgNS4xXG4gICAgICAgICAgLy8gKGlmIHRoZSBwcm90b3R5cGUgb3IgYSBwcm9wZXJ0eSBvbiB0aGUgcHJvdG90eXBlIGhhcyBiZWVuIHNldClcbiAgICAgICAgICAvLyBpbmNvcnJlY3RseSBzZXQgYSBmdW5jdGlvbidzIGBwcm90b3R5cGVgIHByb3BlcnR5IFtbRW51bWVyYWJsZV1dIHZhbHVlXG4gICAgICAgICAgLy8gdG8gYHRydWVgLiBCZWNhdXNlIG9mIHRoaXMgd2Ugc3RhbmRhcmRpemUgb24gc2tpcHBpbmcgdGhlIGBwcm90b3R5cGVgXG4gICAgICAgICAgLy8gcHJvcGVydHkgb2YgZnVuY3Rpb25zIHJlZ2FyZGxlc3Mgb2YgdGhlaXIgW1tFbnVtZXJhYmxlXV0gdmFsdWUuXG4gICAgICAgICAgaWYgKChkb25lID1cbiAgICAgICAgICAgICAgIShza2lwUHJvdG8gJiYga2V5ID09ICdwcm90b3R5cGUnKSAmJlxuICAgICAgICAgICAgICAhKHNraXBTZWVuICYmIChoYXNLZXkoc2Vlbiwga2V5KSB8fCAhKHNlZW5ba2V5XSA9IHRydWUpKSkgJiZcbiAgICAgICAgICAgICAgKCFvd25GbGFnIHx8IG93bkZsYWcgJiYgaGFzS2V5KG9iamVjdCwga2V5KSkgJiZcbiAgICAgICAgICAgICAgY2FsbGJhY2sob2JqZWN0W2tleV0sIGtleSwgb2JqZWN0KSA9PT0gZmFsc2UpKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gaW4gSUUgPCA5IHN0cmluZ3MgZG9uJ3Qgc3VwcG9ydCBhY2Nlc3NpbmcgY2hhcmFjdGVycyBieSBpbmRleFxuICAgICAgICBpZiAoIWRvbmUgJiYgKGZvckFyZ3MgJiYgaXNBcmd1bWVudHMob2JqZWN0KSB8fFxuICAgICAgICAgICAgKChub0NoYXJCeUluZGV4IHx8IG5vQ2hhckJ5T3duSW5kZXgpICYmIGlzQ2xhc3NPZihvYmplY3QsICdTdHJpbmcnKSAmJlxuICAgICAgICAgICAgICAoaXRlcmF0ZWUgPSBub0NoYXJCeUluZGV4ID8gb2JqZWN0LnNwbGl0KCcnKSA6IG9iamVjdCkpKSkge1xuICAgICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoKGRvbmUgPVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGl0ZXJhdGVlW2luZGV4XSwgU3RyaW5nKGluZGV4KSwgb2JqZWN0KSA9PT0gZmFsc2UpKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWRvbmUgJiYgZm9yU2hhZG93ZWQpIHtcbiAgICAgICAgICAvLyBCZWNhdXNlIElFIDwgOSBjYW4ndCBzZXQgdGhlIGBbW0VudW1lcmFibGVdXWAgYXR0cmlidXRlIG9mIGFuIGV4aXN0aW5nXG4gICAgICAgICAgLy8gcHJvcGVydHkgYW5kIHRoZSBgY29uc3RydWN0b3JgIHByb3BlcnR5IG9mIGEgcHJvdG90eXBlIGRlZmF1bHRzIHRvXG4gICAgICAgICAgLy8gbm9uLWVudW1lcmFibGUsIHdlIG1hbnVhbGx5IHNraXAgdGhlIGBjb25zdHJ1Y3RvcmAgcHJvcGVydHkgd2hlbiB3ZVxuICAgICAgICAgIC8vIHRoaW5rIHdlIGFyZSBpdGVyYXRpbmcgb3ZlciBhIGBwcm90b3R5cGVgIG9iamVjdC5cbiAgICAgICAgICBjdG9yID0gb2JqZWN0LmNvbnN0cnVjdG9yO1xuICAgICAgICAgIHNraXBDdG9yID0gY3RvciAmJiBjdG9yLnByb3RvdHlwZSAmJiBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9PT0gY3RvcjtcbiAgICAgICAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCA3OyBpbmRleCsrKSB7XG4gICAgICAgICAgICBrZXkgPSBzaGFkb3dlZFtpbmRleF07XG4gICAgICAgICAgICBpZiAoIShza2lwQ3RvciAmJiBrZXkgPT0gJ2NvbnN0cnVjdG9yJykgJiZcbiAgICAgICAgICAgICAgICBoYXNLZXkob2JqZWN0LCBrZXkpICYmXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sob2JqZWN0W2tleV0sIGtleSwgb2JqZWN0KSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgcmV0dXJuIGZvclByb3BzLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgbmFtZSBvZiB0aGUgZmlyc3QgYXJndW1lbnQgZnJvbSBhIGZ1bmN0aW9uJ3Mgc291cmNlLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24uXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBhcmd1bWVudCBuYW1lLlxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0Rmlyc3RBcmd1bWVudChmbikge1xuICAgIHJldHVybiAoIWhhc0tleShmbiwgJ3RvU3RyaW5nJykgJiZcbiAgICAgICgvXltcXHMoXSpmdW5jdGlvblteKF0qXFwoKFteXFxzLCldKykvLmV4ZWMoZm4pIHx8IDApWzFdKSB8fCAnJztcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyB0aGUgYXJpdGhtZXRpYyBtZWFuIG9mIGEgc2FtcGxlLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge0FycmF5fSBzYW1wbGUgVGhlIHNhbXBsZS5cbiAgICogQHJldHVybnMge051bWJlcn0gVGhlIG1lYW4uXG4gICAqL1xuICBmdW5jdGlvbiBnZXRNZWFuKHNhbXBsZSkge1xuICAgIHJldHVybiByZWR1Y2Uoc2FtcGxlLCBmdW5jdGlvbihzdW0sIHgpIHtcbiAgICAgIHJldHVybiBzdW0gKyB4O1xuICAgIH0pIC8gc2FtcGxlLmxlbmd0aCB8fCAwO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHNvdXJjZSBjb2RlIG9mIGEgZnVuY3Rpb24uXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbi5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGFsdFNvdXJjZSBBIHN0cmluZyB1c2VkIHdoZW4gYSBmdW5jdGlvbidzIHNvdXJjZSBjb2RlIGlzIHVucmV0cmlldmFibGUuXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBmdW5jdGlvbidzIHNvdXJjZSBjb2RlLlxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0U291cmNlKGZuLCBhbHRTb3VyY2UpIHtcbiAgICB2YXIgcmVzdWx0ID0gYWx0U291cmNlO1xuICAgIGlmIChpc1N0cmluZ2FibGUoZm4pKSB7XG4gICAgICByZXN1bHQgPSBTdHJpbmcoZm4pO1xuICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5kZWNvbXBpbGF0aW9uKSB7XG4gICAgICAvLyBlc2NhcGUgdGhlIGB7YCBmb3IgRmlyZWZveCAxXG4gICAgICByZXN1bHQgPSAoL15bXntdK1xceyhbXFxzXFxTXSopfVxccyokLy5leGVjKGZuKSB8fCAwKVsxXTtcbiAgICB9XG4gICAgLy8gdHJpbSBzdHJpbmdcbiAgICByZXN1bHQgPSAocmVzdWx0IHx8ICcnKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG5cbiAgICAvLyBkZXRlY3Qgc3RyaW5ncyBjb250YWluaW5nIG9ubHkgdGhlIFwidXNlIHN0cmljdFwiIGRpcmVjdGl2ZVxuICAgIHJldHVybiAvXig/OlxcL1xcKitbXFx3fFxcV10qP1xcKlxcL3xcXC9cXC8uKj9bXFxuXFxyXFx1MjAyOFxcdTIwMjldfFxccykqKFtcIiddKXVzZSBzdHJpY3RcXDE7PyQvLnRlc3QocmVzdWx0KVxuICAgICAgPyAnJ1xuICAgICAgOiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIGEgdmFsdWUgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge01peGVkfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgdmFsdWUgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gICAqL1xuICBmdW5jdGlvbiBpc0FyZ3VtZW50cygpIHtcbiAgICAvLyBsYXp5IGRlZmluZVxuICAgIGlzQXJndW1lbnRzID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PSAnW29iamVjdCBBcmd1bWVudHNdJztcbiAgICB9O1xuICAgIGlmIChub0FyZ3VtZW50c0NsYXNzKSB7XG4gICAgICBpc0FyZ3VtZW50cyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBoYXNLZXkodmFsdWUsICdjYWxsZWUnKSAmJlxuICAgICAgICAgICEocHJvcGVydHlJc0VudW1lcmFibGUgJiYgcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpKTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBpc0FyZ3VtZW50cyhhcmd1bWVudHNbMF0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBhbiBvYmplY3QgaXMgb2YgdGhlIHNwZWNpZmllZCBjbGFzcy5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtNaXhlZH0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgY2xhc3MuXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgdmFsdWUgaXMgb2YgdGhlIHNwZWNpZmllZCBjbGFzcywgZWxzZSBgZmFsc2VgLlxuICAgKi9cbiAgZnVuY3Rpb24gaXNDbGFzc09mKHZhbHVlLCBuYW1lKSB7XG4gICAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gJ1tvYmplY3QgJyArIG5hbWUgKyAnXSc7XG4gIH1cblxuICAvKipcbiAgICogSG9zdCBvYmplY3RzIGNhbiByZXR1cm4gdHlwZSB2YWx1ZXMgdGhhdCBhcmUgZGlmZmVyZW50IGZyb20gdGhlaXIgYWN0dWFsXG4gICAqIGRhdGEgdHlwZS4gVGhlIG9iamVjdHMgd2UgYXJlIGNvbmNlcm5lZCB3aXRoIHVzdWFsbHkgcmV0dXJuIG5vbi1wcmltaXRpdmVcbiAgICogdHlwZXMgb2Ygb2JqZWN0LCBmdW5jdGlvbiwgb3IgdW5rbm93bi5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtNaXhlZH0gb2JqZWN0IFRoZSBvd25lciBvZiB0aGUgcHJvcGVydHkuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eSBUaGUgcHJvcGVydHkgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgcHJvcGVydHkgdmFsdWUgaXMgYSBub24tcHJpbWl0aXZlLCBlbHNlIGBmYWxzZWAuXG4gICAqL1xuICBmdW5jdGlvbiBpc0hvc3RUeXBlKG9iamVjdCwgcHJvcGVydHkpIHtcbiAgICB2YXIgdHlwZSA9IG9iamVjdCAhPSBudWxsID8gdHlwZW9mIG9iamVjdFtwcm9wZXJ0eV0gOiAnbnVtYmVyJztcbiAgICByZXR1cm4gIS9eKD86Ym9vbGVhbnxudW1iZXJ8c3RyaW5nfHVuZGVmaW5lZCkkLy50ZXN0KHR5cGUpICYmXG4gICAgICAodHlwZSA9PSAnb2JqZWN0JyA/ICEhb2JqZWN0W3Byb3BlcnR5XSA6IHRydWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBhIGdpdmVuIGB2YWx1ZWAgaXMgYW4gb2JqZWN0IGNyZWF0ZWQgYnkgdGhlIGBPYmplY3RgIGNvbnN0cnVjdG9yXG4gICAqIGFzc3VtaW5nIG9iamVjdHMgY3JlYXRlZCBieSB0aGUgYE9iamVjdGAgY29uc3RydWN0b3IgaGF2ZSBubyBpbmhlcml0ZWRcbiAgICogZW51bWVyYWJsZSBwcm9wZXJ0aWVzIGFuZCB0aGF0IHRoZXJlIGFyZSBubyBgT2JqZWN0LnByb3RvdHlwZWAgZXh0ZW5zaW9ucy5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtNaXhlZH0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYSBwbGFpbiBgT2JqZWN0YCBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAgICovXG4gIGZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsdWUpIHtcbiAgICAvLyBhdm9pZCBub24tb2JqZWN0cyBhbmQgZmFsc2UgcG9zaXRpdmVzIGZvciBgYXJndW1lbnRzYCBvYmplY3RzIGluIElFIDwgOVxuICAgIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgICBpZiAoISh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcpIHx8IGlzQXJndW1lbnRzKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgLy8gSUUgPCA5IHByZXNlbnRzIERPTSBub2RlcyBhcyBgT2JqZWN0YCBvYmplY3RzIGV4Y2VwdCB0aGV5IGhhdmUgYHRvU3RyaW5nYFxuICAgIC8vIG1ldGhvZHMgdGhhdCBhcmUgYHR5cGVvZmAgXCJzdHJpbmdcIiBhbmQgc3RpbGwgY2FuIGNvZXJjZSBub2RlcyB0byBzdHJpbmdzLlxuICAgIC8vIEFsc28gY2hlY2sgdGhhdCB0aGUgY29uc3RydWN0b3IgaXMgYE9iamVjdGAgKGkuZS4gYE9iamVjdCBpbnN0YW5jZW9mIE9iamVjdGApXG4gICAgdmFyIGN0b3IgPSB2YWx1ZS5jb25zdHJ1Y3RvcjtcbiAgICBpZiAoKHN1cHBvcnQubm9kZUNsYXNzIHx8ICEodHlwZW9mIHZhbHVlLnRvU3RyaW5nICE9ICdmdW5jdGlvbicgJiYgdHlwZW9mICh2YWx1ZSArICcnKSA9PSAnc3RyaW5nJykpICYmXG4gICAgICAgICghaXNDbGFzc09mKGN0b3IsICdGdW5jdGlvbicpIHx8IGN0b3IgaW5zdGFuY2VvZiBjdG9yKSkge1xuICAgICAgLy8gSW4gbW9zdCBlbnZpcm9ubWVudHMgYW4gb2JqZWN0J3Mgb3duIHByb3BlcnRpZXMgYXJlIGl0ZXJhdGVkIGJlZm9yZVxuICAgICAgLy8gaXRzIGluaGVyaXRlZCBwcm9wZXJ0aWVzLiBJZiB0aGUgbGFzdCBpdGVyYXRlZCBwcm9wZXJ0eSBpcyBhbiBvYmplY3Qnc1xuICAgICAgLy8gb3duIHByb3BlcnR5IHRoZW4gdGhlcmUgYXJlIG5vIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnRpZXMuXG4gICAgICBpZiAoc3VwcG9ydC5pdGVyYXRlc093bkZpcnN0KSB7XG4gICAgICAgIGZvclByb3BzKHZhbHVlLCBmdW5jdGlvbihzdWJWYWx1ZSwgc3ViS2V5KSB7XG4gICAgICAgICAgcmVzdWx0ID0gc3ViS2V5O1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCA9PT0gZmFsc2UgfHwgaGFzS2V5KHZhbHVlLCByZXN1bHQpO1xuICAgICAgfVxuICAgICAgLy8gSUUgPCA5IGl0ZXJhdGVzIGluaGVyaXRlZCBwcm9wZXJ0aWVzIGJlZm9yZSBvd24gcHJvcGVydGllcy4gSWYgdGhlIGZpcnN0XG4gICAgICAvLyBpdGVyYXRlZCBwcm9wZXJ0eSBpcyBhbiBvYmplY3QncyBvd24gcHJvcGVydHkgdGhlbiB0aGVyZSBhcmUgbm8gaW5oZXJpdGVkXG4gICAgICAvLyBlbnVtZXJhYmxlIHByb3BlcnRpZXMuXG4gICAgICBmb3JQcm9wcyh2YWx1ZSwgZnVuY3Rpb24oc3ViVmFsdWUsIHN1YktleSkge1xuICAgICAgICByZXN1bHQgPSAhaGFzS2V5KHZhbHVlLCBzdWJLZXkpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHQgPT09IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBhIHZhbHVlIGNhbiBiZSBzYWZlbHkgY29lcmNlZCB0byBhIHN0cmluZy5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtNaXhlZH0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlIGNhbiBiZSBjb2VyY2VkLCBlbHNlIGBmYWxzZWAuXG4gICAqL1xuICBmdW5jdGlvbiBpc1N0cmluZ2FibGUodmFsdWUpIHtcbiAgICByZXR1cm4gaGFzS2V5KHZhbHVlLCAndG9TdHJpbmcnKSB8fCBpc0NsYXNzT2YodmFsdWUsICdTdHJpbmcnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXcmFwcyBhIGZ1bmN0aW9uIGFuZCBwYXNzZXMgYHRoaXNgIHRvIHRoZSBvcmlnaW5hbCBmdW5jdGlvbiBhcyB0aGVcbiAgICogZmlyc3QgYXJndW1lbnQuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBiZSB3cmFwcGVkLlxuICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFRoZSBuZXcgZnVuY3Rpb24uXG4gICAqL1xuICBmdW5jdGlvbiBtZXRob2RpemUoZm4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJncyA9IFt0aGlzXTtcbiAgICAgIGFyZ3MucHVzaC5hcHBseShhcmdzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIGZuLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQSBuby1vcGVyYXRpb24gZnVuY3Rpb24uXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBmdW5jdGlvbiBub29wKCkge1xuICAgIC8vIG5vIG9wZXJhdGlvbiBwZXJmb3JtZWRcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHdyYXBwZXIgYXJvdW5kIHJlcXVpcmUoKSB0byBzdXBwcmVzcyBgbW9kdWxlIG1pc3NpbmdgIGVycm9ycy5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtTdHJpbmd9IGlkIFRoZSBtb2R1bGUgaWQuXG4gICAqIEByZXR1cm5zIHtNaXhlZH0gVGhlIGV4cG9ydGVkIG1vZHVsZSBvciBgbnVsbGAuXG4gICAqL1xuICBmdW5jdGlvbiByZXEoaWQpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHJlc3VsdCA9IGZyZWVFeHBvcnRzICYmIGZyZWVSZXF1aXJlKGlkKTtcbiAgICB9IGNhdGNoKGUpIHsgfVxuICAgIHJldHVybiByZXN1bHQgfHwgbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIGEgc25pcHBldCBvZiBKYXZhU2NyaXB0IHZpYSBzY3JpcHQgaW5qZWN0aW9uLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gY29kZSBUaGUgY29kZSB0byBydW4uXG4gICAqL1xuICBmdW5jdGlvbiBydW5TY3JpcHQoY29kZSkge1xuICAgIHZhciBhbmNob3IgPSBmcmVlRGVmaW5lID8gZGVmaW5lLmFtZCA6IEJlbmNobWFyayxcbiAgICAgICAgc2NyaXB0ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpLFxuICAgICAgICBzaWJsaW5nID0gZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXSxcbiAgICAgICAgcGFyZW50ID0gc2libGluZy5wYXJlbnROb2RlLFxuICAgICAgICBwcm9wID0gdWlkICsgJ3J1blNjcmlwdCcsXG4gICAgICAgIHByZWZpeCA9ICcoJyArIChmcmVlRGVmaW5lID8gJ2RlZmluZS5hbWQuJyA6ICdCZW5jaG1hcmsuJykgKyBwcm9wICsgJ3x8ZnVuY3Rpb24oKXt9KSgpOyc7XG5cbiAgICAvLyBGaXJlZm94IDIuMC4wLjIgY2Fubm90IHVzZSBzY3JpcHQgaW5qZWN0aW9uIGFzIGludGVuZGVkIGJlY2F1c2UgaXQgZXhlY3V0ZXNcbiAgICAvLyBhc3luY2hyb25vdXNseSwgYnV0IHRoYXQncyBPSyBiZWNhdXNlIHNjcmlwdCBpbmplY3Rpb24gaXMgb25seSB1c2VkIHRvIGF2b2lkXG4gICAgLy8gdGhlIHByZXZpb3VzbHkgY29tbWVudGVkIEphZWdlck1vbmtleSBidWcuXG4gICAgdHJ5IHtcbiAgICAgIC8vIHJlbW92ZSB0aGUgaW5zZXJ0ZWQgc2NyaXB0ICpiZWZvcmUqIHJ1bm5pbmcgdGhlIGNvZGUgdG8gYXZvaWQgZGlmZmVyZW5jZXNcbiAgICAgIC8vIGluIHRoZSBleHBlY3RlZCBzY3JpcHQgZWxlbWVudCBjb3VudC9vcmRlciBvZiB0aGUgZG9jdW1lbnQuXG4gICAgICBzY3JpcHQuYXBwZW5kQ2hpbGQoZG9jLmNyZWF0ZVRleHROb2RlKHByZWZpeCArIGNvZGUpKTtcbiAgICAgIGFuY2hvcltwcm9wXSA9IGZ1bmN0aW9uKCkgeyBkZXN0cm95RWxlbWVudChzY3JpcHQpOyB9O1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgcGFyZW50ID0gcGFyZW50LmNsb25lTm9kZShmYWxzZSk7XG4gICAgICBzaWJsaW5nID0gbnVsbDtcbiAgICAgIHNjcmlwdC50ZXh0ID0gY29kZTtcbiAgICB9XG4gICAgcGFyZW50Lmluc2VydEJlZm9yZShzY3JpcHQsIHNpYmxpbmcpO1xuICAgIGRlbGV0ZSBhbmNob3JbcHJvcF07XG4gIH1cblxuICAvKipcbiAgICogQSBoZWxwZXIgZnVuY3Rpb24gZm9yIHNldHRpbmcgb3B0aW9ucy9ldmVudCBoYW5kbGVycy5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtPYmplY3R9IGJlbmNoIFRoZSBiZW5jaG1hcmsgaW5zdGFuY2UuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gT3B0aW9ucyBvYmplY3QuXG4gICAqL1xuICBmdW5jdGlvbiBzZXRPcHRpb25zKGJlbmNoLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IGV4dGVuZCh7fSwgYmVuY2guY29uc3RydWN0b3Iub3B0aW9ucywgb3B0aW9ucyk7XG4gICAgYmVuY2gub3B0aW9ucyA9IGZvck93bihvcHRpb25zLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAvLyBhZGQgZXZlbnQgbGlzdGVuZXJzXG4gICAgICAgIGlmICgvXm9uW0EtWl0vLnRlc3Qoa2V5KSkge1xuICAgICAgICAgIGZvckVhY2goa2V5LnNwbGl0KCcgJyksIGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgYmVuY2gub24oa2V5LnNsaWNlKDIpLnRvTG93ZXJDYXNlKCksIHZhbHVlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmICghaGFzS2V5KGJlbmNoLCBrZXkpKSB7XG4gICAgICAgICAgYmVuY2hba2V5XSA9IGRlZXBDbG9uZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGN5Y2xpbmcvY29tcGxldGluZyB0aGUgZGVmZXJyZWQgYmVuY2htYXJrLlxuICAgKlxuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLkRlZmVycmVkXG4gICAqL1xuICBmdW5jdGlvbiByZXNvbHZlKCkge1xuICAgIHZhciBtZSA9IHRoaXMsXG4gICAgICAgIGNsb25lID0gbWUuYmVuY2htYXJrLFxuICAgICAgICBiZW5jaCA9IGNsb25lLl9vcmlnaW5hbDtcblxuICAgIGlmIChiZW5jaC5hYm9ydGVkKSB7XG4gICAgICAvLyBjeWNsZSgpIC0+IGNsb25lIGN5Y2xlL2NvbXBsZXRlIGV2ZW50IC0+IGNvbXB1dGUoKSdzIGludm9rZWQgYmVuY2gucnVuKCkgY3ljbGUvY29tcGxldGVcbiAgICAgIG1lLnRlYXJkb3duKCk7XG4gICAgICBjbG9uZS5ydW5uaW5nID0gZmFsc2U7XG4gICAgICBjeWNsZShtZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCsrbWUuY3ljbGVzIDwgY2xvbmUuY291bnQpIHtcbiAgICAgIC8vIGNvbnRpbnVlIHRoZSB0ZXN0IGxvb3BcbiAgICAgIGlmIChzdXBwb3J0LnRpbWVvdXQpIHtcbiAgICAgICAgLy8gdXNlIHNldFRpbWVvdXQgdG8gYXZvaWQgYSBjYWxsIHN0YWNrIG92ZXJmbG93IGlmIGNhbGxlZCByZWN1cnNpdmVseVxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBjbG9uZS5jb21waWxlZC5jYWxsKG1lLCB0aW1lcik7IH0sIDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2xvbmUuY29tcGlsZWQuY2FsbChtZSwgdGltZXIpO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRpbWVyLnN0b3AobWUpO1xuICAgICAgbWUudGVhcmRvd24oKTtcbiAgICAgIGRlbGF5KGNsb25lLCBmdW5jdGlvbigpIHsgY3ljbGUobWUpOyB9KTtcbiAgICB9XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogQSBkZWVwIGNsb25lIHV0aWxpdHkuXG4gICAqXG4gICAqIEBzdGF0aWNcbiAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgKiBAcGFyYW0ge01peGVkfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2xvbmUuXG4gICAqIEByZXR1cm5zIHtNaXhlZH0gVGhlIGNsb25lZCB2YWx1ZS5cbiAgICovXG4gIGZ1bmN0aW9uIGRlZXBDbG9uZSh2YWx1ZSkge1xuICAgIHZhciBhY2Nlc3NvcixcbiAgICAgICAgY2lyY3VsYXIsXG4gICAgICAgIGNsb25lLFxuICAgICAgICBjdG9yLFxuICAgICAgICBkZXNjcmlwdG9yLFxuICAgICAgICBleHRlbnNpYmxlLFxuICAgICAgICBrZXksXG4gICAgICAgIGxlbmd0aCxcbiAgICAgICAgbWFya2VyS2V5LFxuICAgICAgICBwYXJlbnQsXG4gICAgICAgIHJlc3VsdCxcbiAgICAgICAgc291cmNlLFxuICAgICAgICBzdWJJbmRleCxcbiAgICAgICAgZGF0YSA9IHsgJ3ZhbHVlJzogdmFsdWUgfSxcbiAgICAgICAgaW5kZXggPSAwLFxuICAgICAgICBtYXJrZWQgPSBbXSxcbiAgICAgICAgcXVldWUgPSB7ICdsZW5ndGgnOiAwIH0sXG4gICAgICAgIHVubWFya2VkID0gW107XG5cbiAgICAvKipcbiAgICAgKiBBbiBlYXNpbHkgZGV0ZWN0YWJsZSBkZWNvcmF0b3IgZm9yIGNsb25lZCB2YWx1ZXMuXG4gICAgICovXG4gICAgZnVuY3Rpb24gTWFya2VyKG9iamVjdCkge1xuICAgICAgdGhpcy5yYXcgPSBvYmplY3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGNhbGxiYWNrIHVzZWQgYnkgYGZvclByb3BzKClgLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZvclByb3BzQ2FsbGJhY2soc3ViVmFsdWUsIHN1YktleSkge1xuICAgICAgLy8gZXhpdCBlYXJseSB0byBhdm9pZCBjbG9uaW5nIHRoZSBtYXJrZXJcbiAgICAgIGlmIChzdWJWYWx1ZSAmJiBzdWJWYWx1ZS5jb25zdHJ1Y3RvciA9PSBNYXJrZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gYWRkIG9iamVjdHMgdG8gdGhlIHF1ZXVlXG4gICAgICBpZiAoc3ViVmFsdWUgPT09IE9iamVjdChzdWJWYWx1ZSkpIHtcbiAgICAgICAgcXVldWVbcXVldWUubGVuZ3RoKytdID0geyAna2V5Jzogc3ViS2V5LCAncGFyZW50JzogY2xvbmUsICdzb3VyY2UnOiB2YWx1ZSB9O1xuICAgICAgfVxuICAgICAgLy8gYXNzaWduIG5vbi1vYmplY3RzXG4gICAgICBlbHNlIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyB3aWxsIHRocm93IGFuIGVycm9yIGluIHN0cmljdCBtb2RlIGlmIHRoZSBwcm9wZXJ0eSBpcyByZWFkLW9ubHlcbiAgICAgICAgICBjbG9uZVtzdWJLZXldID0gc3ViVmFsdWU7XG4gICAgICAgIH0gY2F0Y2goZSkgeyB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyBhbiBhdmFpbGFibGUgbWFya2VyIGtleSBmb3IgdGhlIGdpdmVuIG9iamVjdC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZXRNYXJrZXJLZXkob2JqZWN0KSB7XG4gICAgICAvLyBhdm9pZCBjb2xsaXNpb25zIHdpdGggZXhpc3Rpbmcga2V5c1xuICAgICAgdmFyIHJlc3VsdCA9IHVpZDtcbiAgICAgIHdoaWxlIChvYmplY3RbcmVzdWx0XSAmJiBvYmplY3RbcmVzdWx0XS5jb25zdHJ1Y3RvciAhPSBNYXJrZXIpIHtcbiAgICAgICAgcmVzdWx0ICs9IDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGRvIHtcbiAgICAgIGtleSA9IGRhdGEua2V5O1xuICAgICAgcGFyZW50ID0gZGF0YS5wYXJlbnQ7XG4gICAgICBzb3VyY2UgPSBkYXRhLnNvdXJjZTtcbiAgICAgIGNsb25lID0gdmFsdWUgPSBzb3VyY2UgPyBzb3VyY2Vba2V5XSA6IGRhdGEudmFsdWU7XG4gICAgICBhY2Nlc3NvciA9IGNpcmN1bGFyID0gZGVzY3JpcHRvciA9IGZhbHNlO1xuXG4gICAgICAvLyBjcmVhdGUgYSBiYXNpYyBjbG9uZSB0byBmaWx0ZXIgb3V0IGZ1bmN0aW9ucywgRE9NIGVsZW1lbnRzLCBhbmRcbiAgICAgIC8vIG90aGVyIG5vbiBgT2JqZWN0YCBvYmplY3RzXG4gICAgICBpZiAodmFsdWUgPT09IE9iamVjdCh2YWx1ZSkpIHtcbiAgICAgICAgLy8gdXNlIGN1c3RvbSBkZWVwIGNsb25lIGZ1bmN0aW9uIGlmIGF2YWlsYWJsZVxuICAgICAgICBpZiAoaXNDbGFzc09mKHZhbHVlLmRlZXBDbG9uZSwgJ0Z1bmN0aW9uJykpIHtcbiAgICAgICAgICBjbG9uZSA9IHZhbHVlLmRlZXBDbG9uZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGN0b3IgPSB2YWx1ZS5jb25zdHJ1Y3RvcjtcbiAgICAgICAgICBzd2l0Y2ggKHRvU3RyaW5nLmNhbGwodmFsdWUpKSB7XG4gICAgICAgICAgICBjYXNlICdbb2JqZWN0IEFycmF5XSc6XG4gICAgICAgICAgICAgIGNsb25lID0gbmV3IGN0b3IodmFsdWUubGVuZ3RoKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ1tvYmplY3QgQm9vbGVhbl0nOlxuICAgICAgICAgICAgICBjbG9uZSA9IG5ldyBjdG9yKHZhbHVlID09IHRydWUpO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnW29iamVjdCBEYXRlXSc6XG4gICAgICAgICAgICAgIGNsb25lID0gbmV3IGN0b3IoK3ZhbHVlKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ1tvYmplY3QgT2JqZWN0XSc6XG4gICAgICAgICAgICAgIGlzUGxhaW5PYmplY3QodmFsdWUpICYmIChjbG9uZSA9IHt9KTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ1tvYmplY3QgTnVtYmVyXSc6XG4gICAgICAgICAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOlxuICAgICAgICAgICAgICBjbG9uZSA9IG5ldyBjdG9yKHZhbHVlKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6XG4gICAgICAgICAgICAgIGNsb25lID0gY3Rvcih2YWx1ZS5zb3VyY2UsXG4gICAgICAgICAgICAgICAgKHZhbHVlLmdsb2JhbCAgICAgPyAnZycgOiAnJykgK1xuICAgICAgICAgICAgICAgICh2YWx1ZS5pZ25vcmVDYXNlID8gJ2knIDogJycpICtcbiAgICAgICAgICAgICAgICAodmFsdWUubXVsdGlsaW5lICA/ICdtJyA6ICcnKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGNvbnRpbnVlIGNsb25lIGlmIGB2YWx1ZWAgZG9lc24ndCBoYXZlIGFuIGFjY2Vzc29yIGRlc2NyaXB0b3JcbiAgICAgICAgLy8gaHR0cDovL2VzNS5naXRodWIuY29tLyN4OC4xMC4xXG4gICAgICAgIGlmIChjbG9uZSAmJiBjbG9uZSAhPSB2YWx1ZSAmJlxuICAgICAgICAgICAgIShkZXNjcmlwdG9yID0gc291cmNlICYmIHN1cHBvcnQuZGVzY3JpcHRvcnMgJiYgZ2V0RGVzY3JpcHRvcihzb3VyY2UsIGtleSksXG4gICAgICAgICAgICAgIGFjY2Vzc29yID0gZGVzY3JpcHRvciAmJiAoZGVzY3JpcHRvci5nZXQgfHwgZGVzY3JpcHRvci5zZXQpKSkge1xuICAgICAgICAgIC8vIHVzZSBhbiBleGlzdGluZyBjbG9uZSAoY2lyY3VsYXIgcmVmZXJlbmNlKVxuICAgICAgICAgIGlmICgoZXh0ZW5zaWJsZSA9IGlzRXh0ZW5zaWJsZSh2YWx1ZSkpKSB7XG4gICAgICAgICAgICBtYXJrZXJLZXkgPSBnZXRNYXJrZXJLZXkodmFsdWUpO1xuICAgICAgICAgICAgaWYgKHZhbHVlW21hcmtlcktleV0pIHtcbiAgICAgICAgICAgICAgY2lyY3VsYXIgPSBjbG9uZSA9IHZhbHVlW21hcmtlcktleV0ucmF3O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBmb3IgZnJvemVuL3NlYWxlZCBvYmplY3RzXG4gICAgICAgICAgICBmb3IgKHN1YkluZGV4ID0gMCwgbGVuZ3RoID0gdW5tYXJrZWQubGVuZ3RoOyBzdWJJbmRleCA8IGxlbmd0aDsgc3ViSW5kZXgrKykge1xuICAgICAgICAgICAgICBkYXRhID0gdW5tYXJrZWRbc3ViSW5kZXhdO1xuICAgICAgICAgICAgICBpZiAoZGF0YS5vYmplY3QgPT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgY2lyY3VsYXIgPSBjbG9uZSA9IGRhdGEuY2xvbmU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFjaXJjdWxhcikge1xuICAgICAgICAgICAgLy8gbWFyayBvYmplY3QgdG8gYWxsb3cgcXVpY2tseSBkZXRlY3RpbmcgY2lyY3VsYXIgcmVmZXJlbmNlcyBhbmQgdGllIGl0IHRvIGl0cyBjbG9uZVxuICAgICAgICAgICAgaWYgKGV4dGVuc2libGUpIHtcbiAgICAgICAgICAgICAgdmFsdWVbbWFya2VyS2V5XSA9IG5ldyBNYXJrZXIoY2xvbmUpO1xuICAgICAgICAgICAgICBtYXJrZWQucHVzaCh7ICdrZXknOiBtYXJrZXJLZXksICdvYmplY3QnOiB2YWx1ZSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIGZvciBmcm96ZW4vc2VhbGVkIG9iamVjdHNcbiAgICAgICAgICAgICAgdW5tYXJrZWQucHVzaCh7ICdjbG9uZSc6IGNsb25lLCAnb2JqZWN0JzogdmFsdWUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpdGVyYXRlIG92ZXIgb2JqZWN0IHByb3BlcnRpZXNcbiAgICAgICAgICAgIGZvclByb3BzKHZhbHVlLCBmb3JQcm9wc0NhbGxiYWNrLCB7ICd3aGljaCc6ICdhbGwnIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICAvLyBmb3IgY3VzdG9tIHByb3BlcnR5IGRlc2NyaXB0b3JzXG4gICAgICAgIGlmIChhY2Nlc3NvciB8fCAoZGVzY3JpcHRvciAmJiAhKGRlc2NyaXB0b3IuY29uZmlndXJhYmxlICYmIGRlc2NyaXB0b3IuZW51bWVyYWJsZSAmJiBkZXNjcmlwdG9yLndyaXRhYmxlKSkpIHtcbiAgICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSB7XG4gICAgICAgICAgICBkZXNjcmlwdG9yLnZhbHVlID0gY2xvbmU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNldERlc2NyaXB0b3IocGFyZW50LCBrZXksIGRlc2NyaXB0b3IpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGZvciBkZWZhdWx0IHByb3BlcnR5IGRlc2NyaXB0b3JzXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHBhcmVudFtrZXldID0gY2xvbmU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IGNsb25lO1xuICAgICAgfVxuICAgIH0gd2hpbGUgKChkYXRhID0gcXVldWVbaW5kZXgrK10pKTtcblxuICAgIC8vIHJlbW92ZSBtYXJrZXJzXG4gICAgZm9yIChpbmRleCA9IDAsIGxlbmd0aCA9IG1hcmtlZC5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBkYXRhID0gbWFya2VkW2luZGV4XTtcbiAgICAgIGRlbGV0ZSBkYXRhLm9iamVjdFtkYXRhLmtleV07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogQW4gaXRlcmF0aW9uIHV0aWxpdHkgZm9yIGFycmF5cyBhbmQgb2JqZWN0cy5cbiAgICogQ2FsbGJhY2tzIG1heSB0ZXJtaW5hdGUgdGhlIGxvb3AgYnkgZXhwbGljaXRseSByZXR1cm5pbmcgYGZhbHNlYC5cbiAgICpcbiAgICogQHN0YXRpY1xuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICogQHBhcmFtIHtNaXhlZH0gdGhpc0FyZyBUaGUgYHRoaXNgIGJpbmRpbmcgZm9yIHRoZSBjYWxsYmFjay5cbiAgICogQHJldHVybnMge0FycmF5fE9iamVjdH0gUmV0dXJucyB0aGUgb2JqZWN0IGl0ZXJhdGVkIG92ZXIuXG4gICAqL1xuICBmdW5jdGlvbiBlYWNoKG9iamVjdCwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICB2YXIgcmVzdWx0ID0gb2JqZWN0O1xuICAgIG9iamVjdCA9IE9iamVjdChvYmplY3QpO1xuXG4gICAgdmFyIGZuID0gY2FsbGJhY2ssXG4gICAgICAgIGluZGV4ID0gLTEsXG4gICAgICAgIGxlbmd0aCA9IG9iamVjdC5sZW5ndGgsXG4gICAgICAgIGlzU25hcHNob3QgPSAhIShvYmplY3Quc25hcHNob3RJdGVtICYmIChsZW5ndGggPSBvYmplY3Quc25hcHNob3RMZW5ndGgpKSxcbiAgICAgICAgaXNTcGxpdHRhYmxlID0gKG5vQ2hhckJ5SW5kZXggfHwgbm9DaGFyQnlPd25JbmRleCkgJiYgaXNDbGFzc09mKG9iamVjdCwgJ1N0cmluZycpLFxuICAgICAgICBpc0NvbnZlcnRhYmxlID0gaXNTbmFwc2hvdCB8fCBpc1NwbGl0dGFibGUgfHwgJ2l0ZW0nIGluIG9iamVjdCxcbiAgICAgICAgb3JpZ09iamVjdCA9IG9iamVjdDtcblxuICAgIC8vIGluIE9wZXJhIDwgMTAuNSBgaGFzS2V5KG9iamVjdCwgJ2xlbmd0aCcpYCByZXR1cm5zIGBmYWxzZWAgZm9yIE5vZGVMaXN0c1xuICAgIGlmIChsZW5ndGggPT09IGxlbmd0aCA+Pj4gMCkge1xuICAgICAgaWYgKGlzQ29udmVydGFibGUpIHtcbiAgICAgICAgLy8gdGhlIHRoaXJkIGFyZ3VtZW50IG9mIHRoZSBjYWxsYmFjayBpcyB0aGUgb3JpZ2luYWwgbm9uLWFycmF5IG9iamVjdFxuICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMsIHZhbHVlLCBpbmRleCwgb3JpZ09iamVjdCk7XG4gICAgICAgIH07XG4gICAgICAgIC8vIGluIElFIDwgOSBzdHJpbmdzIGRvbid0IHN1cHBvcnQgYWNjZXNzaW5nIGNoYXJhY3RlcnMgYnkgaW5kZXhcbiAgICAgICAgaWYgKGlzU3BsaXR0YWJsZSkge1xuICAgICAgICAgIG9iamVjdCA9IG9iamVjdC5zcGxpdCgnJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2JqZWN0ID0gW107XG4gICAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIGluIFNhZmFyaSAyIGBpbmRleCBpbiBvYmplY3RgIGlzIGFsd2F5cyBgZmFsc2VgIGZvciBOb2RlTGlzdHNcbiAgICAgICAgICAgIG9iamVjdFtpbmRleF0gPSBpc1NuYXBzaG90ID8gcmVzdWx0LnNuYXBzaG90SXRlbShpbmRleCkgOiByZXN1bHRbaW5kZXhdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZm9yRWFjaChvYmplY3QsIGNhbGxiYWNrLCB0aGlzQXJnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yT3duKG9iamVjdCwgY2FsbGJhY2ssIHRoaXNBcmcpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIENvcGllcyBlbnVtZXJhYmxlIHByb3BlcnRpZXMgZnJvbSB0aGUgc291cmNlKHMpIG9iamVjdCB0byB0aGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICAgKlxuICAgKiBAc3RhdGljXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICogQHBhcmFtIHtPYmplY3R9IGRlc3RpbmF0aW9uIFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbc291cmNlPXt9XSBUaGUgc291cmNlIG9iamVjdC5cbiAgICogQHJldHVybnMge09iamVjdH0gVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAgICovXG4gIGZ1bmN0aW9uIGV4dGVuZChkZXN0aW5hdGlvbiwgc291cmNlKSB7XG4gICAgLy8gQ2hyb21lIDwgMTQgaW5jb3JyZWN0bHkgc2V0cyBgZGVzdGluYXRpb25gIHRvIGB1bmRlZmluZWRgIHdoZW4gd2UgYGRlbGV0ZSBhcmd1bWVudHNbMF1gXG4gICAgLy8gaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9ODM5XG4gICAgdmFyIHJlc3VsdCA9IGRlc3RpbmF0aW9uO1xuICAgIGRlbGV0ZSBhcmd1bWVudHNbMF07XG5cbiAgICBmb3JFYWNoKGFyZ3VtZW50cywgZnVuY3Rpb24oc291cmNlKSB7XG4gICAgICBmb3JQcm9wcyhzb3VyY2UsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogQSBnZW5lcmljIGBBcnJheSNmaWx0ZXJgIGxpa2UgbWV0aG9kLlxuICAgKlxuICAgKiBAc3RhdGljXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAgICogQHBhcmFtIHtGdW5jdGlvbnxTdHJpbmd9IGNhbGxiYWNrIFRoZSBmdW5jdGlvbi9hbGlhcyBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICogQHBhcmFtIHtNaXhlZH0gdGhpc0FyZyBUaGUgYHRoaXNgIGJpbmRpbmcgZm9yIHRoZSBjYWxsYmFjay5cbiAgICogQHJldHVybnMge0FycmF5fSBBIG5ldyBhcnJheSBvZiB2YWx1ZXMgdGhhdCBwYXNzZWQgY2FsbGJhY2sgZmlsdGVyLlxuICAgKiBAZXhhbXBsZVxuICAgKlxuICAgKiAvLyBnZXQgb2RkIG51bWJlcnNcbiAgICogQmVuY2htYXJrLmZpbHRlcihbMSwgMiwgMywgNCwgNV0sIGZ1bmN0aW9uKG4pIHtcbiAgICogICByZXR1cm4gbiAlIDI7XG4gICAqIH0pOyAvLyAtPiBbMSwgMywgNV07XG4gICAqXG4gICAqIC8vIGdldCBmYXN0ZXN0IGJlbmNobWFya3NcbiAgICogQmVuY2htYXJrLmZpbHRlcihiZW5jaGVzLCAnZmFzdGVzdCcpO1xuICAgKlxuICAgKiAvLyBnZXQgc2xvd2VzdCBiZW5jaG1hcmtzXG4gICAqIEJlbmNobWFyay5maWx0ZXIoYmVuY2hlcywgJ3Nsb3dlc3QnKTtcbiAgICpcbiAgICogLy8gZ2V0IGJlbmNobWFya3MgdGhhdCBjb21wbGV0ZWQgd2l0aG91dCBlcnJvcmluZ1xuICAgKiBCZW5jaG1hcmsuZmlsdGVyKGJlbmNoZXMsICdzdWNjZXNzZnVsJyk7XG4gICAqL1xuICBmdW5jdGlvbiBmaWx0ZXIoYXJyYXksIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgdmFyIHJlc3VsdDtcblxuICAgIGlmIChjYWxsYmFjayA9PSAnc3VjY2Vzc2Z1bCcpIHtcbiAgICAgIC8vIGNhbGxiYWNrIHRvIGV4Y2x1ZGUgdGhvc2UgdGhhdCBhcmUgZXJyb3JlZCwgdW5ydW4sIG9yIGhhdmUgaHogb2YgSW5maW5pdHlcbiAgICAgIGNhbGxiYWNrID0gZnVuY3Rpb24oYmVuY2gpIHsgcmV0dXJuIGJlbmNoLmN5Y2xlcyAmJiBpc0Zpbml0ZShiZW5jaC5oeik7IH07XG4gICAgfVxuICAgIGVsc2UgaWYgKGNhbGxiYWNrID09ICdmYXN0ZXN0JyB8fCBjYWxsYmFjayA9PSAnc2xvd2VzdCcpIHtcbiAgICAgIC8vIGdldCBzdWNjZXNzZnVsLCBzb3J0IGJ5IHBlcmlvZCArIG1hcmdpbiBvZiBlcnJvciwgYW5kIGZpbHRlciBmYXN0ZXN0L3Nsb3dlc3RcbiAgICAgIHJlc3VsdCA9IGZpbHRlcihhcnJheSwgJ3N1Y2Nlc3NmdWwnKS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgYSA9IGEuc3RhdHM7IGIgPSBiLnN0YXRzO1xuICAgICAgICByZXR1cm4gKGEubWVhbiArIGEubW9lID4gYi5tZWFuICsgYi5tb2UgPyAxIDogLTEpICogKGNhbGxiYWNrID09ICdmYXN0ZXN0JyA/IDEgOiAtMSk7XG4gICAgICB9KTtcbiAgICAgIHJlc3VsdCA9IGZpbHRlcihyZXN1bHQsIGZ1bmN0aW9uKGJlbmNoKSB7XG4gICAgICAgIHJldHVybiByZXN1bHRbMF0uY29tcGFyZShiZW5jaCkgPT0gMDtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0IHx8IHJlZHVjZShhcnJheSwgZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwgaW5kZXgpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpbmRleCwgYXJyYXkpID8gKHJlc3VsdC5wdXNoKHZhbHVlKSwgcmVzdWx0KSA6IHJlc3VsdDtcbiAgICB9LCBbXSk7XG4gIH1cblxuICAvKipcbiAgICogQSBnZW5lcmljIGBBcnJheSNmb3JFYWNoYCBsaWtlIG1ldGhvZC5cbiAgICogQ2FsbGJhY2tzIG1heSB0ZXJtaW5hdGUgdGhlIGxvb3AgYnkgZXhwbGljaXRseSByZXR1cm5pbmcgYGZhbHNlYC5cbiAgICpcbiAgICogQHN0YXRpY1xuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICogQHBhcmFtIHtNaXhlZH0gdGhpc0FyZyBUaGUgYHRoaXNgIGJpbmRpbmcgZm9yIHRoZSBjYWxsYmFjay5cbiAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBpdGVyYXRlZCBvdmVyLlxuICAgKi9cbiAgZnVuY3Rpb24gZm9yRWFjaChhcnJheSwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gKGFycmF5ID0gT2JqZWN0KGFycmF5KSkubGVuZ3RoID4+PiAwO1xuXG4gICAgaWYgKHRoaXNBcmcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY2FsbGJhY2sgPSBiaW5kKGNhbGxiYWNrLCB0aGlzQXJnKTtcbiAgICB9XG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIGlmIChpbmRleCBpbiBhcnJheSAmJlxuICAgICAgICAgIGNhbGxiYWNrKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KSA9PT0gZmFsc2UpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnJheTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdGVyYXRlcyBvdmVyIGFuIG9iamVjdCdzIG93biBwcm9wZXJ0aWVzLCBleGVjdXRpbmcgdGhlIGBjYWxsYmFja2AgZm9yIGVhY2guXG4gICAqIENhbGxiYWNrcyBtYXkgdGVybWluYXRlIHRoZSBsb29wIGJ5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gICAqXG4gICAqIEBzdGF0aWNcbiAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gZXhlY3V0ZWQgcGVyIG93biBwcm9wZXJ0eS5cbiAgICogQHBhcmFtIHtNaXhlZH0gdGhpc0FyZyBUaGUgYHRoaXNgIGJpbmRpbmcgZm9yIHRoZSBjYWxsYmFjay5cbiAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgb2JqZWN0IGl0ZXJhdGVkIG92ZXIuXG4gICAqL1xuICBmdW5jdGlvbiBmb3JPd24ob2JqZWN0LCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIHJldHVybiBmb3JQcm9wcyhvYmplY3QsIGNhbGxiYWNrLCB7ICdiaW5kJzogdGhpc0FyZywgJ3doaWNoJzogJ293bicgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYSBudW1iZXIgdG8gYSBtb3JlIHJlYWRhYmxlIGNvbW1hLXNlcGFyYXRlZCBzdHJpbmcgcmVwcmVzZW50YXRpb24uXG4gICAqXG4gICAqIEBzdGF0aWNcbiAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgKiBAcGFyYW0ge051bWJlcn0gbnVtYmVyIFRoZSBudW1iZXIgdG8gY29udmVydC5cbiAgICogQHJldHVybnMge1N0cmluZ30gVGhlIG1vcmUgcmVhZGFibGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uLlxuICAgKi9cbiAgZnVuY3Rpb24gZm9ybWF0TnVtYmVyKG51bWJlcikge1xuICAgIG51bWJlciA9IFN0cmluZyhudW1iZXIpLnNwbGl0KCcuJyk7XG4gICAgcmV0dXJuIG51bWJlclswXS5yZXBsYWNlKC8oPz0oPzpcXGR7M30pKyQpKD8hXFxiKS9nLCAnLCcpICtcbiAgICAgIChudW1iZXJbMV0gPyAnLicgKyBudW1iZXJbMV0gOiAnJyk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIGFuIG9iamVjdCBoYXMgdGhlIHNwZWNpZmllZCBrZXkgYXMgYSBkaXJlY3QgcHJvcGVydHkuXG4gICAqXG4gICAqIEBzdGF0aWNcbiAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gY2hlY2suXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXkgVGhlIGtleSB0byBjaGVjayBmb3IuXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBrZXkgaXMgYSBkaXJlY3QgcHJvcGVydHksIGVsc2UgYGZhbHNlYC5cbiAgICovXG4gIGZ1bmN0aW9uIGhhc0tleSgpIHtcbiAgICAvLyBsYXp5IGRlZmluZSBmb3Igd29yc3QgY2FzZSBmYWxsYmFjayAobm90IGFzIGFjY3VyYXRlKVxuICAgIGhhc0tleSA9IGZ1bmN0aW9uKG9iamVjdCwga2V5KSB7XG4gICAgICB2YXIgcGFyZW50ID0gb2JqZWN0ICE9IG51bGwgJiYgKG9iamVjdC5jb25zdHJ1Y3RvciB8fCBPYmplY3QpLnByb3RvdHlwZTtcbiAgICAgIHJldHVybiAhIXBhcmVudCAmJiBrZXkgaW4gT2JqZWN0KG9iamVjdCkgJiYgIShrZXkgaW4gcGFyZW50ICYmIG9iamVjdFtrZXldID09PSBwYXJlbnRba2V5XSk7XG4gICAgfTtcbiAgICAvLyBmb3IgbW9kZXJuIGJyb3dzZXJzXG4gICAgaWYgKGlzQ2xhc3NPZihoYXNPd25Qcm9wZXJ0eSwgJ0Z1bmN0aW9uJykpIHtcbiAgICAgIGhhc0tleSA9IGZ1bmN0aW9uKG9iamVjdCwga2V5KSB7XG4gICAgICAgIHJldHVybiBvYmplY3QgIT0gbnVsbCAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KTtcbiAgICAgIH07XG4gICAgfVxuICAgIC8vIGZvciBTYWZhcmkgMlxuICAgIGVsc2UgaWYgKHt9Ll9fcHJvdG9fXyA9PSBPYmplY3QucHJvdG90eXBlKSB7XG4gICAgICBoYXNLZXkgPSBmdW5jdGlvbihvYmplY3QsIGtleSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgIGlmIChvYmplY3QgIT0gbnVsbCkge1xuICAgICAgICAgIG9iamVjdCA9IE9iamVjdChvYmplY3QpO1xuICAgICAgICAgIG9iamVjdC5fX3Byb3RvX18gPSBbb2JqZWN0Ll9fcHJvdG9fXywgb2JqZWN0Ll9fcHJvdG9fXyA9IG51bGwsIHJlc3VsdCA9IGtleSBpbiBvYmplY3RdWzBdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gaGFzS2V5LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICAvKipcbiAgICogQSBnZW5lcmljIGBBcnJheSNpbmRleE9mYCBsaWtlIG1ldGhvZC5cbiAgICpcbiAgICogQHN0YXRpY1xuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gICAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZWFyY2ggZm9yLlxuICAgKiBAcGFyYW0ge051bWJlcn0gW2Zyb21JbmRleD0wXSBUaGUgaW5kZXggdG8gc3RhcnQgc2VhcmNoaW5nIGZyb20uXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBpbmRleCBvZiB0aGUgbWF0Y2hlZCB2YWx1ZSBvciBgLTFgLlxuICAgKi9cbiAgZnVuY3Rpb24gaW5kZXhPZihhcnJheSwgdmFsdWUsIGZyb21JbmRleCkge1xuICAgIHZhciBpbmRleCA9IHRvSW50ZWdlcihmcm9tSW5kZXgpLFxuICAgICAgICBsZW5ndGggPSAoYXJyYXkgPSBPYmplY3QoYXJyYXkpKS5sZW5ndGggPj4+IDA7XG5cbiAgICBpbmRleCA9IChpbmRleCA8IDAgPyBtYXgoMCwgbGVuZ3RoICsgaW5kZXgpIDogaW5kZXgpIC0gMTtcbiAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgaWYgKGluZGV4IGluIGFycmF5ICYmIHZhbHVlID09PSBhcnJheVtpbmRleF0pIHtcbiAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICAvKipcbiAgICogTW9kaWZ5IGEgc3RyaW5nIGJ5IHJlcGxhY2luZyBuYW1lZCB0b2tlbnMgd2l0aCBtYXRjaGluZyBvYmplY3QgcHJvcGVydHkgdmFsdWVzLlxuICAgKlxuICAgKiBAc3RhdGljXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZyBUaGUgc3RyaW5nIHRvIG1vZGlmeS5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgdGVtcGxhdGUgb2JqZWN0LlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgbW9kaWZpZWQgc3RyaW5nLlxuICAgKi9cbiAgZnVuY3Rpb24gaW50ZXJwb2xhdGUoc3RyaW5nLCBvYmplY3QpIHtcbiAgICBmb3JPd24ob2JqZWN0LCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAvLyBlc2NhcGUgcmVnZXhwIHNwZWNpYWwgY2hhcmFjdGVycyBpbiBga2V5YFxuICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoUmVnRXhwKCcjXFxcXHsnICsga2V5LnJlcGxhY2UoLyhbLiorP149IToke30oKXxbXFxdXFwvXFxcXF0pL2csICdcXFxcJDEnKSArICdcXFxcfScsICdnJyksIHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gc3RyaW5nO1xuICB9XG5cbiAgLyoqXG4gICAqIEludm9rZXMgYSBtZXRob2Qgb24gYWxsIGl0ZW1zIGluIGFuIGFycmF5LlxuICAgKlxuICAgKiBAc3RhdGljXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICogQHBhcmFtIHtBcnJheX0gYmVuY2hlcyBBcnJheSBvZiBiZW5jaG1hcmtzIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBtZXRob2QgdG8gaW52b2tlIE9SIG9wdGlvbnMgb2JqZWN0LlxuICAgKiBAcGFyYW0ge01peGVkfSBbYXJnMSwgYXJnMiwgLi4uXSBBcmd1bWVudHMgdG8gaW52b2tlIHRoZSBtZXRob2Qgd2l0aC5cbiAgICogQHJldHVybnMge0FycmF5fSBBIG5ldyBhcnJheSBvZiB2YWx1ZXMgcmV0dXJuZWQgZnJvbSBlYWNoIG1ldGhvZCBpbnZva2VkLlxuICAgKiBAZXhhbXBsZVxuICAgKlxuICAgKiAvLyBpbnZva2UgYHJlc2V0YCBvbiBhbGwgYmVuY2htYXJrc1xuICAgKiBCZW5jaG1hcmsuaW52b2tlKGJlbmNoZXMsICdyZXNldCcpO1xuICAgKlxuICAgKiAvLyBpbnZva2UgYGVtaXRgIHdpdGggYXJndW1lbnRzXG4gICAqIEJlbmNobWFyay5pbnZva2UoYmVuY2hlcywgJ2VtaXQnLCAnY29tcGxldGUnLCBsaXN0ZW5lcik7XG4gICAqXG4gICAqIC8vIGludm9rZSBgcnVuKHRydWUpYCwgdHJlYXQgYmVuY2htYXJrcyBhcyBhIHF1ZXVlLCBhbmQgcmVnaXN0ZXIgaW52b2tlIGNhbGxiYWNrc1xuICAgKiBCZW5jaG1hcmsuaW52b2tlKGJlbmNoZXMsIHtcbiAgICpcbiAgICogICAvLyBpbnZva2UgdGhlIGBydW5gIG1ldGhvZFxuICAgKiAgICduYW1lJzogJ3J1bicsXG4gICAqXG4gICAqICAgLy8gcGFzcyBhIHNpbmdsZSBhcmd1bWVudFxuICAgKiAgICdhcmdzJzogdHJ1ZSxcbiAgICpcbiAgICogICAvLyB0cmVhdCBhcyBxdWV1ZSwgcmVtb3ZpbmcgYmVuY2htYXJrcyBmcm9tIGZyb250IG9mIGBiZW5jaGVzYCB1bnRpbCBlbXB0eVxuICAgKiAgICdxdWV1ZWQnOiB0cnVlLFxuICAgKlxuICAgKiAgIC8vIGNhbGxlZCBiZWZvcmUgYW55IGJlbmNobWFya3MgaGF2ZSBiZWVuIGludm9rZWQuXG4gICAqICAgJ29uU3RhcnQnOiBvblN0YXJ0LFxuICAgKlxuICAgKiAgIC8vIGNhbGxlZCBiZXR3ZWVuIGludm9raW5nIGJlbmNobWFya3NcbiAgICogICAnb25DeWNsZSc6IG9uQ3ljbGUsXG4gICAqXG4gICAqICAgLy8gY2FsbGVkIGFmdGVyIGFsbCBiZW5jaG1hcmtzIGhhdmUgYmVlbiBpbnZva2VkLlxuICAgKiAgICdvbkNvbXBsZXRlJzogb25Db21wbGV0ZVxuICAgKiB9KTtcbiAgICovXG4gIGZ1bmN0aW9uIGludm9rZShiZW5jaGVzLCBuYW1lKSB7XG4gICAgdmFyIGFyZ3MsXG4gICAgICAgIGJlbmNoLFxuICAgICAgICBxdWV1ZWQsXG4gICAgICAgIGluZGV4ID0gLTEsXG4gICAgICAgIGV2ZW50UHJvcHMgPSB7ICdjdXJyZW50VGFyZ2V0JzogYmVuY2hlcyB9LFxuICAgICAgICBvcHRpb25zID0geyAnb25TdGFydCc6IG5vb3AsICdvbkN5Y2xlJzogbm9vcCwgJ29uQ29tcGxldGUnOiBub29wIH0sXG4gICAgICAgIHJlc3VsdCA9IG1hcChiZW5jaGVzLCBmdW5jdGlvbihiZW5jaCkgeyByZXR1cm4gYmVuY2g7IH0pO1xuXG4gICAgLyoqXG4gICAgICogSW52b2tlcyB0aGUgbWV0aG9kIG9mIHRoZSBjdXJyZW50IG9iamVjdCBhbmQgaWYgc3luY2hyb25vdXMsIGZldGNoZXMgdGhlIG5leHQuXG4gICAgICovXG4gICAgZnVuY3Rpb24gZXhlY3V0ZSgpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnMsXG4gICAgICAgICAgYXN5bmMgPSBpc0FzeW5jKGJlbmNoKTtcblxuICAgICAgaWYgKGFzeW5jKSB7XG4gICAgICAgIC8vIHVzZSBgZ2V0TmV4dGAgYXMgdGhlIGZpcnN0IGxpc3RlbmVyXG4gICAgICAgIGJlbmNoLm9uKCdjb21wbGV0ZScsIGdldE5leHQpO1xuICAgICAgICBsaXN0ZW5lcnMgPSBiZW5jaC5ldmVudHMuY29tcGxldGU7XG4gICAgICAgIGxpc3RlbmVycy5zcGxpY2UoMCwgMCwgbGlzdGVuZXJzLnBvcCgpKTtcbiAgICAgIH1cbiAgICAgIC8vIGV4ZWN1dGUgbWV0aG9kXG4gICAgICByZXN1bHRbaW5kZXhdID0gaXNDbGFzc09mKGJlbmNoICYmIGJlbmNoW25hbWVdLCAnRnVuY3Rpb24nKSA/IGJlbmNoW25hbWVdLmFwcGx5KGJlbmNoLCBhcmdzKSA6IHVuZGVmaW5lZDtcbiAgICAgIC8vIGlmIHN5bmNocm9ub3VzIHJldHVybiB0cnVlIHVudGlsIGZpbmlzaGVkXG4gICAgICByZXR1cm4gIWFzeW5jICYmIGdldE5leHQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGZXRjaGVzIHRoZSBuZXh0IGJlbmNoIG9yIGV4ZWN1dGVzIGBvbkNvbXBsZXRlYCBjYWxsYmFjay5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZXROZXh0KGV2ZW50KSB7XG4gICAgICB2YXIgY3ljbGVFdmVudCxcbiAgICAgICAgICBsYXN0ID0gYmVuY2gsXG4gICAgICAgICAgYXN5bmMgPSBpc0FzeW5jKGxhc3QpO1xuXG4gICAgICBpZiAoYXN5bmMpIHtcbiAgICAgICAgbGFzdC5vZmYoJ2NvbXBsZXRlJywgZ2V0TmV4dCk7XG4gICAgICAgIGxhc3QuZW1pdCgnY29tcGxldGUnKTtcbiAgICAgIH1cbiAgICAgIC8vIGVtaXQgXCJjeWNsZVwiIGV2ZW50XG4gICAgICBldmVudFByb3BzLnR5cGUgPSAnY3ljbGUnO1xuICAgICAgZXZlbnRQcm9wcy50YXJnZXQgPSBsYXN0O1xuICAgICAgY3ljbGVFdmVudCA9IEV2ZW50KGV2ZW50UHJvcHMpO1xuICAgICAgb3B0aW9ucy5vbkN5Y2xlLmNhbGwoYmVuY2hlcywgY3ljbGVFdmVudCk7XG5cbiAgICAgIC8vIGNob29zZSBuZXh0IGJlbmNobWFyayBpZiBub3QgZXhpdGluZyBlYXJseVxuICAgICAgaWYgKCFjeWNsZUV2ZW50LmFib3J0ZWQgJiYgcmFpc2VJbmRleCgpICE9PSBmYWxzZSkge1xuICAgICAgICBiZW5jaCA9IHF1ZXVlZCA/IGJlbmNoZXNbMF0gOiByZXN1bHRbaW5kZXhdO1xuICAgICAgICBpZiAoaXNBc3luYyhiZW5jaCkpIHtcbiAgICAgICAgICBkZWxheShiZW5jaCwgZXhlY3V0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXN5bmMpIHtcbiAgICAgICAgICAvLyByZXN1bWUgZXhlY3V0aW9uIGlmIHByZXZpb3VzbHkgYXN5bmNocm9ub3VzIGJ1dCBub3cgc3luY2hyb25vdXNcbiAgICAgICAgICB3aGlsZSAoZXhlY3V0ZSgpKSB7IH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBjb250aW51ZSBzeW5jaHJvbm91cyBleGVjdXRpb25cbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZW1pdCBcImNvbXBsZXRlXCIgZXZlbnRcbiAgICAgICAgZXZlbnRQcm9wcy50eXBlID0gJ2NvbXBsZXRlJztcbiAgICAgICAgb3B0aW9ucy5vbkNvbXBsZXRlLmNhbGwoYmVuY2hlcywgRXZlbnQoZXZlbnRQcm9wcykpO1xuICAgICAgfVxuICAgICAgLy8gV2hlbiB1c2VkIGFzIGEgbGlzdGVuZXIgYGV2ZW50LmFib3J0ZWQgPSB0cnVlYCB3aWxsIGNhbmNlbCB0aGUgcmVzdCBvZlxuICAgICAgLy8gdGhlIFwiY29tcGxldGVcIiBsaXN0ZW5lcnMgYmVjYXVzZSB0aGV5IHdlcmUgYWxyZWFkeSBjYWxsZWQgYWJvdmUgYW5kIHdoZW5cbiAgICAgIC8vIHVzZWQgYXMgcGFydCBvZiBgZ2V0TmV4dGAgdGhlIGByZXR1cm4gZmFsc2VgIHdpbGwgZXhpdCB0aGUgZXhlY3V0aW9uIHdoaWxlLWxvb3AuXG4gICAgICBpZiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQuYWJvcnRlZCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGludm9raW5nIGBCZW5jaG1hcmsjcnVuYCB3aXRoIGFzeW5jaHJvbm91cyBjeWNsZXMuXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNBc3luYyhvYmplY3QpIHtcbiAgICAgIC8vIGF2b2lkIHVzaW5nIGBpbnN0YW5jZW9mYCBoZXJlIGJlY2F1c2Ugb2YgSUUgbWVtb3J5IGxlYWsgaXNzdWVzIHdpdGggaG9zdCBvYmplY3RzXG4gICAgICB2YXIgYXN5bmMgPSBhcmdzWzBdICYmIGFyZ3NbMF0uYXN5bmM7XG4gICAgICByZXR1cm4gT2JqZWN0KG9iamVjdCkuY29uc3RydWN0b3IgPT0gQmVuY2htYXJrICYmIG5hbWUgPT0gJ3J1bicgJiZcbiAgICAgICAgKChhc3luYyA9PSBudWxsID8gb2JqZWN0Lm9wdGlvbnMuYXN5bmMgOiBhc3luYykgJiYgc3VwcG9ydC50aW1lb3V0IHx8IG9iamVjdC5kZWZlcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmFpc2VzIGBpbmRleGAgdG8gdGhlIG5leHQgZGVmaW5lZCBpbmRleCBvciByZXR1cm5zIGBmYWxzZWAuXG4gICAgICovXG4gICAgZnVuY3Rpb24gcmFpc2VJbmRleCgpIHtcbiAgICAgIHZhciBsZW5ndGggPSByZXN1bHQubGVuZ3RoO1xuICAgICAgaWYgKHF1ZXVlZCkge1xuICAgICAgICAvLyBpZiBxdWV1ZWQgcmVtb3ZlIHRoZSBwcmV2aW91cyBiZW5jaCBhbmQgc3Vic2VxdWVudCBza2lwcGVkIG5vbi1lbnRyaWVzXG4gICAgICAgIGRvIHtcbiAgICAgICAgICArK2luZGV4ID4gMCAmJiBzaGlmdC5jYWxsKGJlbmNoZXMpO1xuICAgICAgICB9IHdoaWxlICgobGVuZ3RoID0gYmVuY2hlcy5sZW5ndGgpICYmICEoJzAnIGluIGJlbmNoZXMpKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCAmJiAhKGluZGV4IGluIHJlc3VsdCkpIHsgfVxuICAgICAgfVxuICAgICAgLy8gaWYgd2UgcmVhY2hlZCB0aGUgbGFzdCBpbmRleCB0aGVuIHJldHVybiBgZmFsc2VgXG4gICAgICByZXR1cm4gKHF1ZXVlZCA/IGxlbmd0aCA6IGluZGV4IDwgbGVuZ3RoKSA/IGluZGV4IDogKGluZGV4ID0gZmFsc2UpO1xuICAgIH1cblxuICAgIC8vIGp1Z2dsZSBhcmd1bWVudHNcbiAgICBpZiAoaXNDbGFzc09mKG5hbWUsICdTdHJpbmcnKSkge1xuICAgICAgLy8gMiBhcmd1bWVudHMgKGFycmF5LCBuYW1lKVxuICAgICAgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gMiBhcmd1bWVudHMgKGFycmF5LCBvcHRpb25zKVxuICAgICAgb3B0aW9ucyA9IGV4dGVuZChvcHRpb25zLCBuYW1lKTtcbiAgICAgIG5hbWUgPSBvcHRpb25zLm5hbWU7XG4gICAgICBhcmdzID0gaXNDbGFzc09mKGFyZ3MgPSAnYXJncycgaW4gb3B0aW9ucyA/IG9wdGlvbnMuYXJncyA6IFtdLCAnQXJyYXknKSA/IGFyZ3MgOiBbYXJnc107XG4gICAgICBxdWV1ZWQgPSBvcHRpb25zLnF1ZXVlZDtcbiAgICB9XG5cbiAgICAvLyBzdGFydCBpdGVyYXRpbmcgb3ZlciB0aGUgYXJyYXlcbiAgICBpZiAocmFpc2VJbmRleCgpICE9PSBmYWxzZSkge1xuICAgICAgLy8gZW1pdCBcInN0YXJ0XCIgZXZlbnRcbiAgICAgIGJlbmNoID0gcmVzdWx0W2luZGV4XTtcbiAgICAgIGV2ZW50UHJvcHMudHlwZSA9ICdzdGFydCc7XG4gICAgICBldmVudFByb3BzLnRhcmdldCA9IGJlbmNoO1xuICAgICAgb3B0aW9ucy5vblN0YXJ0LmNhbGwoYmVuY2hlcywgRXZlbnQoZXZlbnRQcm9wcykpO1xuXG4gICAgICAvLyBlbmQgZWFybHkgaWYgdGhlIHN1aXRlIHdhcyBhYm9ydGVkIGluIGFuIFwib25TdGFydFwiIGxpc3RlbmVyXG4gICAgICBpZiAoYmVuY2hlcy5hYm9ydGVkICYmIGJlbmNoZXMuY29uc3RydWN0b3IgPT0gU3VpdGUgJiYgbmFtZSA9PSAncnVuJykge1xuICAgICAgICAvLyBlbWl0IFwiY3ljbGVcIiBldmVudFxuICAgICAgICBldmVudFByb3BzLnR5cGUgPSAnY3ljbGUnO1xuICAgICAgICBvcHRpb25zLm9uQ3ljbGUuY2FsbChiZW5jaGVzLCBFdmVudChldmVudFByb3BzKSk7XG4gICAgICAgIC8vIGVtaXQgXCJjb21wbGV0ZVwiIGV2ZW50XG4gICAgICAgIGV2ZW50UHJvcHMudHlwZSA9ICdjb21wbGV0ZSc7XG4gICAgICAgIG9wdGlvbnMub25Db21wbGV0ZS5jYWxsKGJlbmNoZXMsIEV2ZW50KGV2ZW50UHJvcHMpKTtcbiAgICAgIH1cbiAgICAgIC8vIGVsc2Ugc3RhcnRcbiAgICAgIGVsc2Uge1xuICAgICAgICBpZiAoaXNBc3luYyhiZW5jaCkpIHtcbiAgICAgICAgICBkZWxheShiZW5jaCwgZXhlY3V0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd2hpbGUgKGV4ZWN1dGUoKSkgeyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgc3RyaW5nIG9mIGpvaW5lZCBhcnJheSB2YWx1ZXMgb3Igb2JqZWN0IGtleS12YWx1ZSBwYWlycy5cbiAgICpcbiAgICogQHN0YXRpY1xuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBvcGVyYXRlIG9uLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gW3NlcGFyYXRvcjE9JywnXSBUaGUgc2VwYXJhdG9yIHVzZWQgYmV0d2VlbiBrZXktdmFsdWUgcGFpcnMuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbc2VwYXJhdG9yMj0nOiAnXSBUaGUgc2VwYXJhdG9yIHVzZWQgYmV0d2VlbiBrZXlzIGFuZCB2YWx1ZXMuXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBqb2luZWQgcmVzdWx0LlxuICAgKi9cbiAgZnVuY3Rpb24gam9pbihvYmplY3QsIHNlcGFyYXRvcjEsIHNlcGFyYXRvcjIpIHtcbiAgICB2YXIgcmVzdWx0ID0gW10sXG4gICAgICAgIGxlbmd0aCA9IChvYmplY3QgPSBPYmplY3Qob2JqZWN0KSkubGVuZ3RoLFxuICAgICAgICBhcnJheUxpa2UgPSBsZW5ndGggPT09IGxlbmd0aCA+Pj4gMDtcblxuICAgIHNlcGFyYXRvcjIgfHwgKHNlcGFyYXRvcjIgPSAnOiAnKTtcbiAgICBlYWNoKG9iamVjdCwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgcmVzdWx0LnB1c2goYXJyYXlMaWtlID8gdmFsdWUgOiBrZXkgKyBzZXBhcmF0b3IyICsgdmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQuam9pbihzZXBhcmF0b3IxIHx8ICcsJyk7XG4gIH1cblxuICAvKipcbiAgICogQSBnZW5lcmljIGBBcnJheSNtYXBgIGxpa2UgbWV0aG9kLlxuICAgKlxuICAgKiBAc3RhdGljXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICAgKiBAcGFyYW0ge01peGVkfSB0aGlzQXJnIFRoZSBgdGhpc2AgYmluZGluZyBmb3IgdGhlIGNhbGxiYWNrLlxuICAgKiBAcmV0dXJucyB7QXJyYXl9IEEgbmV3IGFycmF5IG9mIHZhbHVlcyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2suXG4gICAqL1xuICBmdW5jdGlvbiBtYXAoYXJyYXksIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgcmV0dXJuIHJlZHVjZShhcnJheSwgZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwgaW5kZXgpIHtcbiAgICAgIHJlc3VsdFtpbmRleF0gPSBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpbmRleCwgYXJyYXkpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBBcnJheShPYmplY3QoYXJyYXkpLmxlbmd0aCA+Pj4gMCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgdmFsdWUgb2YgYSBzcGVjaWZpZWQgcHJvcGVydHkgZnJvbSBhbGwgaXRlbXMgaW4gYW4gYXJyYXkuXG4gICAqXG4gICAqIEBzdGF0aWNcbiAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcGVydHkgVGhlIHByb3BlcnR5IHRvIHBsdWNrLlxuICAgKiBAcmV0dXJucyB7QXJyYXl9IEEgbmV3IGFycmF5IG9mIHByb3BlcnR5IHZhbHVlcy5cbiAgICovXG4gIGZ1bmN0aW9uIHBsdWNrKGFycmF5LCBwcm9wZXJ0eSkge1xuICAgIHJldHVybiBtYXAoYXJyYXksIGZ1bmN0aW9uKG9iamVjdCkge1xuICAgICAgcmV0dXJuIG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0W3Byb3BlcnR5XTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGdlbmVyaWMgYEFycmF5I3JlZHVjZWAgbGlrZSBtZXRob2QuXG4gICAqXG4gICAqIEBzdGF0aWNcbiAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gICAqIEBwYXJhbSB7TWl4ZWR9IGFjY3VtdWxhdG9yIEluaXRpYWwgdmFsdWUgb2YgdGhlIGFjY3VtdWxhdG9yLlxuICAgKiBAcmV0dXJucyB7TWl4ZWR9IFRoZSBhY2N1bXVsYXRvci5cbiAgICovXG4gIGZ1bmN0aW9uIHJlZHVjZShhcnJheSwgY2FsbGJhY2ssIGFjY3VtdWxhdG9yKSB7XG4gICAgdmFyIG5vYWNjdW0gPSBhcmd1bWVudHMubGVuZ3RoIDwgMztcbiAgICBmb3JFYWNoKGFycmF5LCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgIGFjY3VtdWxhdG9yID0gbm9hY2N1bSA/IChub2FjY3VtID0gZmFsc2UsIHZhbHVlKSA6IGNhbGxiYWNrKGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGFycmF5KTtcbiAgICB9KTtcbiAgICByZXR1cm4gYWNjdW11bGF0b3I7XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogQWJvcnRzIGFsbCBiZW5jaG1hcmtzIGluIHRoZSBzdWl0ZS5cbiAgICpcbiAgICogQG5hbWUgYWJvcnRcbiAgICogQG1lbWJlck9mIEJlbmNobWFyay5TdWl0ZVxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgc3VpdGUgaW5zdGFuY2UuXG4gICAqL1xuICBmdW5jdGlvbiBhYm9ydFN1aXRlKCkge1xuICAgIHZhciBldmVudCxcbiAgICAgICAgbWUgPSB0aGlzLFxuICAgICAgICByZXNldHRpbmcgPSBjYWxsZWRCeS5yZXNldFN1aXRlO1xuXG4gICAgaWYgKG1lLnJ1bm5pbmcpIHtcbiAgICAgIGV2ZW50ID0gRXZlbnQoJ2Fib3J0Jyk7XG4gICAgICBtZS5lbWl0KGV2ZW50KTtcbiAgICAgIGlmICghZXZlbnQuY2FuY2VsbGVkIHx8IHJlc2V0dGluZykge1xuICAgICAgICAvLyBhdm9pZCBpbmZpbml0ZSByZWN1cnNpb25cbiAgICAgICAgY2FsbGVkQnkuYWJvcnRTdWl0ZSA9IHRydWU7XG4gICAgICAgIG1lLnJlc2V0KCk7XG4gICAgICAgIGRlbGV0ZSBjYWxsZWRCeS5hYm9ydFN1aXRlO1xuXG4gICAgICAgIGlmICghcmVzZXR0aW5nKSB7XG4gICAgICAgICAgbWUuYWJvcnRlZCA9IHRydWU7XG4gICAgICAgICAgaW52b2tlKG1lLCAnYWJvcnQnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWU7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIHRlc3QgdG8gdGhlIGJlbmNobWFyayBzdWl0ZS5cbiAgICpcbiAgICogQG1lbWJlck9mIEJlbmNobWFyay5TdWl0ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBBIG5hbWUgdG8gaWRlbnRpZnkgdGhlIGJlbmNobWFyay5cbiAgICogQHBhcmFtIHtGdW5jdGlvbnxTdHJpbmd9IGZuIFRoZSB0ZXN0IHRvIGJlbmNobWFyay5cbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBPcHRpb25zIG9iamVjdC5cbiAgICogQHJldHVybnMge09iamVjdH0gVGhlIGJlbmNobWFyayBpbnN0YW5jZS5cbiAgICogQGV4YW1wbGVcbiAgICpcbiAgICogLy8gYmFzaWMgdXNhZ2VcbiAgICogc3VpdGUuYWRkKGZuKTtcbiAgICpcbiAgICogLy8gb3IgdXNpbmcgYSBuYW1lIGZpcnN0XG4gICAqIHN1aXRlLmFkZCgnZm9vJywgZm4pO1xuICAgKlxuICAgKiAvLyBvciB3aXRoIG9wdGlvbnNcbiAgICogc3VpdGUuYWRkKCdmb28nLCBmbiwge1xuICAgKiAgICdvbkN5Y2xlJzogb25DeWNsZSxcbiAgICogICAnb25Db21wbGV0ZSc6IG9uQ29tcGxldGVcbiAgICogfSk7XG4gICAqXG4gICAqIC8vIG9yIG5hbWUgYW5kIG9wdGlvbnNcbiAgICogc3VpdGUuYWRkKCdmb28nLCB7XG4gICAqICAgJ2ZuJzogZm4sXG4gICAqICAgJ29uQ3ljbGUnOiBvbkN5Y2xlLFxuICAgKiAgICdvbkNvbXBsZXRlJzogb25Db21wbGV0ZVxuICAgKiB9KTtcbiAgICpcbiAgICogLy8gb3Igb3B0aW9ucyBvbmx5XG4gICAqIHN1aXRlLmFkZCh7XG4gICAqICAgJ25hbWUnOiAnZm9vJyxcbiAgICogICAnZm4nOiBmbixcbiAgICogICAnb25DeWNsZSc6IG9uQ3ljbGUsXG4gICAqICAgJ29uQ29tcGxldGUnOiBvbkNvbXBsZXRlXG4gICAqIH0pO1xuICAgKi9cbiAgZnVuY3Rpb24gYWRkKG5hbWUsIGZuLCBvcHRpb25zKSB7XG4gICAgdmFyIG1lID0gdGhpcyxcbiAgICAgICAgYmVuY2ggPSBCZW5jaG1hcmsobmFtZSwgZm4sIG9wdGlvbnMpLFxuICAgICAgICBldmVudCA9IEV2ZW50KHsgJ3R5cGUnOiAnYWRkJywgJ3RhcmdldCc6IGJlbmNoIH0pO1xuXG4gICAgaWYgKG1lLmVtaXQoZXZlbnQpLCAhZXZlbnQuY2FuY2VsbGVkKSB7XG4gICAgICBtZS5wdXNoKGJlbmNoKTtcbiAgICB9XG4gICAgcmV0dXJuIG1lO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgc3VpdGUgd2l0aCBjbG9uZWQgYmVuY2htYXJrcy5cbiAgICpcbiAgICogQG5hbWUgY2xvbmVcbiAgICogQG1lbWJlck9mIEJlbmNobWFyay5TdWl0ZVxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIE9wdGlvbnMgb2JqZWN0IHRvIG92ZXJ3cml0ZSBjbG9uZWQgb3B0aW9ucy5cbiAgICogQHJldHVybnMge09iamVjdH0gVGhlIG5ldyBzdWl0ZSBpbnN0YW5jZS5cbiAgICovXG4gIGZ1bmN0aW9uIGNsb25lU3VpdGUob3B0aW9ucykge1xuICAgIHZhciBtZSA9IHRoaXMsXG4gICAgICAgIHJlc3VsdCA9IG5ldyBtZS5jb25zdHJ1Y3RvcihleHRlbmQoe30sIG1lLm9wdGlvbnMsIG9wdGlvbnMpKTtcblxuICAgIC8vIGNvcHkgb3duIHByb3BlcnRpZXNcbiAgICBmb3JPd24obWUsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgIGlmICghaGFzS2V5KHJlc3VsdCwga2V5KSkge1xuICAgICAgICByZXN1bHRba2V5XSA9IHZhbHVlICYmIGlzQ2xhc3NPZih2YWx1ZS5jbG9uZSwgJ0Z1bmN0aW9uJylcbiAgICAgICAgICA/IHZhbHVlLmNsb25lKClcbiAgICAgICAgICA6IGRlZXBDbG9uZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBgQXJyYXkjZmlsdGVyYCBsaWtlIG1ldGhvZC5cbiAgICpcbiAgICogQG5hbWUgZmlsdGVyXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGVcbiAgICogQHBhcmFtIHtGdW5jdGlvbnxTdHJpbmd9IGNhbGxiYWNrIFRoZSBmdW5jdGlvbi9hbGlhcyBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICogQHJldHVybnMge09iamVjdH0gQSBuZXcgc3VpdGUgb2YgYmVuY2htYXJrcyB0aGF0IHBhc3NlZCBjYWxsYmFjayBmaWx0ZXIuXG4gICAqL1xuICBmdW5jdGlvbiBmaWx0ZXJTdWl0ZShjYWxsYmFjaykge1xuICAgIHZhciBtZSA9IHRoaXMsXG4gICAgICAgIHJlc3VsdCA9IG5ldyBtZS5jb25zdHJ1Y3RvcjtcblxuICAgIHJlc3VsdC5wdXNoLmFwcGx5KHJlc3VsdCwgZmlsdGVyKG1lLCBjYWxsYmFjaykpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXRzIGFsbCBiZW5jaG1hcmtzIGluIHRoZSBzdWl0ZS5cbiAgICpcbiAgICogQG5hbWUgcmVzZXRcbiAgICogQG1lbWJlck9mIEJlbmNobWFyay5TdWl0ZVxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgc3VpdGUgaW5zdGFuY2UuXG4gICAqL1xuICBmdW5jdGlvbiByZXNldFN1aXRlKCkge1xuICAgIHZhciBldmVudCxcbiAgICAgICAgbWUgPSB0aGlzLFxuICAgICAgICBhYm9ydGluZyA9IGNhbGxlZEJ5LmFib3J0U3VpdGU7XG5cbiAgICBpZiAobWUucnVubmluZyAmJiAhYWJvcnRpbmcpIHtcbiAgICAgIC8vIG5vIHdvcnJpZXMsIGByZXNldFN1aXRlKClgIGlzIGNhbGxlZCB3aXRoaW4gYGFib3J0U3VpdGUoKWBcbiAgICAgIGNhbGxlZEJ5LnJlc2V0U3VpdGUgPSB0cnVlO1xuICAgICAgbWUuYWJvcnQoKTtcbiAgICAgIGRlbGV0ZSBjYWxsZWRCeS5yZXNldFN1aXRlO1xuICAgIH1cbiAgICAvLyByZXNldCBpZiB0aGUgc3RhdGUgaGFzIGNoYW5nZWRcbiAgICBlbHNlIGlmICgobWUuYWJvcnRlZCB8fCBtZS5ydW5uaW5nKSAmJlxuICAgICAgICAobWUuZW1pdChldmVudCA9IEV2ZW50KCdyZXNldCcpKSwgIWV2ZW50LmNhbmNlbGxlZCkpIHtcbiAgICAgIG1lLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgIGlmICghYWJvcnRpbmcpIHtcbiAgICAgICAgaW52b2tlKG1lLCAncmVzZXQnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1lO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgdGhlIHN1aXRlLlxuICAgKlxuICAgKiBAbmFtZSBydW5cbiAgICogQG1lbWJlck9mIEJlbmNobWFyay5TdWl0ZVxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIE9wdGlvbnMgb2JqZWN0LlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgc3VpdGUgaW5zdGFuY2UuXG4gICAqIEBleGFtcGxlXG4gICAqXG4gICAqIC8vIGJhc2ljIHVzYWdlXG4gICAqIHN1aXRlLnJ1bigpO1xuICAgKlxuICAgKiAvLyBvciB3aXRoIG9wdGlvbnNcbiAgICogc3VpdGUucnVuKHsgJ2FzeW5jJzogdHJ1ZSwgJ3F1ZXVlZCc6IHRydWUgfSk7XG4gICAqL1xuICBmdW5jdGlvbiBydW5TdWl0ZShvcHRpb25zKSB7XG4gICAgdmFyIG1lID0gdGhpcztcblxuICAgIG1lLnJlc2V0KCk7XG4gICAgbWUucnVubmluZyA9IHRydWU7XG4gICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcblxuICAgIGludm9rZShtZSwge1xuICAgICAgJ25hbWUnOiAncnVuJyxcbiAgICAgICdhcmdzJzogb3B0aW9ucyxcbiAgICAgICdxdWV1ZWQnOiBvcHRpb25zLnF1ZXVlZCxcbiAgICAgICdvblN0YXJ0JzogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgbWUuZW1pdChldmVudCk7XG4gICAgICB9LFxuICAgICAgJ29uQ3ljbGUnOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgYmVuY2ggPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGlmIChiZW5jaC5lcnJvcikge1xuICAgICAgICAgIG1lLmVtaXQoeyAndHlwZSc6ICdlcnJvcicsICd0YXJnZXQnOiBiZW5jaCB9KTtcbiAgICAgICAgfVxuICAgICAgICBtZS5lbWl0KGV2ZW50KTtcbiAgICAgICAgZXZlbnQuYWJvcnRlZCA9IG1lLmFib3J0ZWQ7XG4gICAgICB9LFxuICAgICAgJ29uQ29tcGxldGUnOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBtZS5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIG1lLmVtaXQoZXZlbnQpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBtZTtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBFeGVjdXRlcyBhbGwgcmVnaXN0ZXJlZCBsaXN0ZW5lcnMgb2YgdGhlIHNwZWNpZmllZCBldmVudCB0eXBlLlxuICAgKlxuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLCBCZW5jaG1hcmsuU3VpdGVcbiAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSB0eXBlIFRoZSBldmVudCB0eXBlIG9yIG9iamVjdC5cbiAgICogQHJldHVybnMge01peGVkfSBSZXR1cm5zIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGxhc3QgbGlzdGVuZXIgZXhlY3V0ZWQuXG4gICAqL1xuICBmdW5jdGlvbiBlbWl0KHR5cGUpIHtcbiAgICB2YXIgbGlzdGVuZXJzLFxuICAgICAgICBtZSA9IHRoaXMsXG4gICAgICAgIGV2ZW50ID0gRXZlbnQodHlwZSksXG4gICAgICAgIGV2ZW50cyA9IG1lLmV2ZW50cyxcbiAgICAgICAgYXJncyA9IChhcmd1bWVudHNbMF0gPSBldmVudCwgYXJndW1lbnRzKTtcblxuICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQgfHwgKGV2ZW50LmN1cnJlbnRUYXJnZXQgPSBtZSk7XG4gICAgZXZlbnQudGFyZ2V0IHx8IChldmVudC50YXJnZXQgPSBtZSk7XG4gICAgZGVsZXRlIGV2ZW50LnJlc3VsdDtcblxuICAgIGlmIChldmVudHMgJiYgKGxpc3RlbmVycyA9IGhhc0tleShldmVudHMsIGV2ZW50LnR5cGUpICYmIGV2ZW50c1tldmVudC50eXBlXSkpIHtcbiAgICAgIGZvckVhY2gobGlzdGVuZXJzLnNsaWNlKCksIGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gICAgICAgIGlmICgoZXZlbnQucmVzdWx0ID0gbGlzdGVuZXIuYXBwbHkobWUsIGFyZ3MpKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICBldmVudC5jYW5jZWxsZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAhZXZlbnQuYWJvcnRlZDtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZXZlbnQucmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgZXZlbnQgbGlzdGVuZXJzIGZvciBhIGdpdmVuIHR5cGUgdGhhdCBjYW4gYmUgbWFuaXB1bGF0ZWRcbiAgICogdG8gYWRkIG9yIHJlbW92ZSBsaXN0ZW5lcnMuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmssIEJlbmNobWFyay5TdWl0ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICogQHJldHVybnMge0FycmF5fSBUaGUgbGlzdGVuZXJzIGFycmF5LlxuICAgKi9cbiAgZnVuY3Rpb24gbGlzdGVuZXJzKHR5cGUpIHtcbiAgICB2YXIgbWUgPSB0aGlzLFxuICAgICAgICBldmVudHMgPSBtZS5ldmVudHMgfHwgKG1lLmV2ZW50cyA9IHt9KTtcblxuICAgIHJldHVybiBoYXNLZXkoZXZlbnRzLCB0eXBlKSA/IGV2ZW50c1t0eXBlXSA6IChldmVudHNbdHlwZV0gPSBbXSk7XG4gIH1cblxuICAvKipcbiAgICogVW5yZWdpc3RlcnMgYSBsaXN0ZW5lciBmb3IgdGhlIHNwZWNpZmllZCBldmVudCB0eXBlKHMpLFxuICAgKiBvciB1bnJlZ2lzdGVycyBhbGwgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IHR5cGUocyksXG4gICAqIG9yIHVucmVnaXN0ZXJzIGFsbCBsaXN0ZW5lcnMgZm9yIGFsbCBldmVudCB0eXBlcy5cbiAgICpcbiAgICogQG1lbWJlck9mIEJlbmNobWFyaywgQmVuY2htYXJrLlN1aXRlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtsaXN0ZW5lcl0gVGhlIGZ1bmN0aW9uIHRvIHVucmVnaXN0ZXIuXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBiZW5jaG1hcmsgaW5zdGFuY2UuXG4gICAqIEBleGFtcGxlXG4gICAqXG4gICAqIC8vIHVucmVnaXN0ZXIgYSBsaXN0ZW5lciBmb3IgYW4gZXZlbnQgdHlwZVxuICAgKiBiZW5jaC5vZmYoJ2N5Y2xlJywgbGlzdGVuZXIpO1xuICAgKlxuICAgKiAvLyB1bnJlZ2lzdGVyIGEgbGlzdGVuZXIgZm9yIG11bHRpcGxlIGV2ZW50IHR5cGVzXG4gICAqIGJlbmNoLm9mZignc3RhcnQgY3ljbGUnLCBsaXN0ZW5lcik7XG4gICAqXG4gICAqIC8vIHVucmVnaXN0ZXIgYWxsIGxpc3RlbmVycyBmb3IgYW4gZXZlbnQgdHlwZVxuICAgKiBiZW5jaC5vZmYoJ2N5Y2xlJyk7XG4gICAqXG4gICAqIC8vIHVucmVnaXN0ZXIgYWxsIGxpc3RlbmVycyBmb3IgbXVsdGlwbGUgZXZlbnQgdHlwZXNcbiAgICogYmVuY2gub2ZmKCdzdGFydCBjeWNsZSBjb21wbGV0ZScpO1xuICAgKlxuICAgKiAvLyB1bnJlZ2lzdGVyIGFsbCBsaXN0ZW5lcnMgZm9yIGFsbCBldmVudCB0eXBlc1xuICAgKiBiZW5jaC5vZmYoKTtcbiAgICovXG4gIGZ1bmN0aW9uIG9mZih0eXBlLCBsaXN0ZW5lcikge1xuICAgIHZhciBtZSA9IHRoaXMsXG4gICAgICAgIGV2ZW50cyA9IG1lLmV2ZW50cztcblxuICAgIGV2ZW50cyAmJiBlYWNoKHR5cGUgPyB0eXBlLnNwbGl0KCcgJykgOiBldmVudHMsIGZ1bmN0aW9uKGxpc3RlbmVycywgdHlwZSkge1xuICAgICAgdmFyIGluZGV4O1xuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lcnMgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdHlwZSA9IGxpc3RlbmVycztcbiAgICAgICAgbGlzdGVuZXJzID0gaGFzS2V5KGV2ZW50cywgdHlwZSkgJiYgZXZlbnRzW3R5cGVdO1xuICAgICAgfVxuICAgICAgaWYgKGxpc3RlbmVycykge1xuICAgICAgICBpZiAobGlzdGVuZXIpIHtcbiAgICAgICAgICBpbmRleCA9IGluZGV4T2YobGlzdGVuZXJzLCBsaXN0ZW5lcik7XG4gICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIGxpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaXN0ZW5lcnMubGVuZ3RoID0gMDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBsaXN0ZW5lciBmb3IgdGhlIHNwZWNpZmllZCBldmVudCB0eXBlKHMpLlxuICAgKlxuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLCBCZW5jaG1hcmsuU3VpdGVcbiAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIFRoZSBmdW5jdGlvbiB0byByZWdpc3Rlci5cbiAgICogQHJldHVybnMge09iamVjdH0gVGhlIGJlbmNobWFyayBpbnN0YW5jZS5cbiAgICogQGV4YW1wbGVcbiAgICpcbiAgICogLy8gcmVnaXN0ZXIgYSBsaXN0ZW5lciBmb3IgYW4gZXZlbnQgdHlwZVxuICAgKiBiZW5jaC5vbignY3ljbGUnLCBsaXN0ZW5lcik7XG4gICAqXG4gICAqIC8vIHJlZ2lzdGVyIGEgbGlzdGVuZXIgZm9yIG11bHRpcGxlIGV2ZW50IHR5cGVzXG4gICAqIGJlbmNoLm9uKCdzdGFydCBjeWNsZScsIGxpc3RlbmVyKTtcbiAgICovXG4gIGZ1bmN0aW9uIG9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgdmFyIG1lID0gdGhpcyxcbiAgICAgICAgZXZlbnRzID0gbWUuZXZlbnRzIHx8IChtZS5ldmVudHMgPSB7fSk7XG5cbiAgICBmb3JFYWNoKHR5cGUuc3BsaXQoJyAnKSwgZnVuY3Rpb24odHlwZSkge1xuICAgICAgKGhhc0tleShldmVudHMsIHR5cGUpXG4gICAgICAgID8gZXZlbnRzW3R5cGVdXG4gICAgICAgIDogKGV2ZW50c1t0eXBlXSA9IFtdKVxuICAgICAgKS5wdXNoKGxpc3RlbmVyKTtcbiAgICB9KTtcbiAgICByZXR1cm4gbWU7XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogQWJvcnRzIHRoZSBiZW5jaG1hcmsgd2l0aG91dCByZWNvcmRpbmcgdGltZXMuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICogQHJldHVybnMge09iamVjdH0gVGhlIGJlbmNobWFyayBpbnN0YW5jZS5cbiAgICovXG4gIGZ1bmN0aW9uIGFib3J0KCkge1xuICAgIHZhciBldmVudCxcbiAgICAgICAgbWUgPSB0aGlzLFxuICAgICAgICByZXNldHRpbmcgPSBjYWxsZWRCeS5yZXNldDtcblxuICAgIGlmIChtZS5ydW5uaW5nKSB7XG4gICAgICBldmVudCA9IEV2ZW50KCdhYm9ydCcpO1xuICAgICAgbWUuZW1pdChldmVudCk7XG4gICAgICBpZiAoIWV2ZW50LmNhbmNlbGxlZCB8fCByZXNldHRpbmcpIHtcbiAgICAgICAgLy8gYXZvaWQgaW5maW5pdGUgcmVjdXJzaW9uXG4gICAgICAgIGNhbGxlZEJ5LmFib3J0ID0gdHJ1ZTtcbiAgICAgICAgbWUucmVzZXQoKTtcbiAgICAgICAgZGVsZXRlIGNhbGxlZEJ5LmFib3J0O1xuXG4gICAgICAgIGlmIChzdXBwb3J0LnRpbWVvdXQpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQobWUuX3RpbWVySWQpO1xuICAgICAgICAgIGRlbGV0ZSBtZS5fdGltZXJJZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXJlc2V0dGluZykge1xuICAgICAgICAgIG1lLmFib3J0ZWQgPSB0cnVlO1xuICAgICAgICAgIG1lLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWU7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBiZW5jaG1hcmsgdXNpbmcgdGhlIHNhbWUgdGVzdCBhbmQgb3B0aW9ucy5cbiAgICpcbiAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIE9wdGlvbnMgb2JqZWN0IHRvIG92ZXJ3cml0ZSBjbG9uZWQgb3B0aW9ucy5cbiAgICogQHJldHVybnMge09iamVjdH0gVGhlIG5ldyBiZW5jaG1hcmsgaW5zdGFuY2UuXG4gICAqIEBleGFtcGxlXG4gICAqXG4gICAqIHZhciBiaXphcnJvID0gYmVuY2guY2xvbmUoe1xuICAgKiAgICduYW1lJzogJ2RvcHBlbGdhbmdlcidcbiAgICogfSk7XG4gICAqL1xuICBmdW5jdGlvbiBjbG9uZShvcHRpb25zKSB7XG4gICAgdmFyIG1lID0gdGhpcyxcbiAgICAgICAgcmVzdWx0ID0gbmV3IG1lLmNvbnN0cnVjdG9yKGV4dGVuZCh7fSwgbWUsIG9wdGlvbnMpKTtcblxuICAgIC8vIGNvcnJlY3QgdGhlIGBvcHRpb25zYCBvYmplY3RcbiAgICByZXN1bHQub3B0aW9ucyA9IGV4dGVuZCh7fSwgbWUub3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgICAvLyBjb3B5IG93biBjdXN0b20gcHJvcGVydGllc1xuICAgIGZvck93bihtZSwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgaWYgKCFoYXNLZXkocmVzdWx0LCBrZXkpKSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gZGVlcENsb25lKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgaWYgYSBiZW5jaG1hcmsgaXMgZmFzdGVyIHRoYW4gYW5vdGhlci5cbiAgICpcbiAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgKiBAcGFyYW0ge09iamVjdH0gb3RoZXIgVGhlIGJlbmNobWFyayB0byBjb21wYXJlLlxuICAgKiBAcmV0dXJucyB7TnVtYmVyfSBSZXR1cm5zIGAtMWAgaWYgc2xvd2VyLCBgMWAgaWYgZmFzdGVyLCBhbmQgYDBgIGlmIGluZGV0ZXJtaW5hdGUuXG4gICAqL1xuICBmdW5jdGlvbiBjb21wYXJlKG90aGVyKSB7XG4gICAgdmFyIGNyaXRpY2FsLFxuICAgICAgICB6U3RhdCxcbiAgICAgICAgbWUgPSB0aGlzLFxuICAgICAgICBzYW1wbGUxID0gbWUuc3RhdHMuc2FtcGxlLFxuICAgICAgICBzYW1wbGUyID0gb3RoZXIuc3RhdHMuc2FtcGxlLFxuICAgICAgICBzaXplMSA9IHNhbXBsZTEubGVuZ3RoLFxuICAgICAgICBzaXplMiA9IHNhbXBsZTIubGVuZ3RoLFxuICAgICAgICBtYXhTaXplID0gbWF4KHNpemUxLCBzaXplMiksXG4gICAgICAgIG1pblNpemUgPSBtaW4oc2l6ZTEsIHNpemUyKSxcbiAgICAgICAgdTEgPSBnZXRVKHNhbXBsZTEsIHNhbXBsZTIpLFxuICAgICAgICB1MiA9IGdldFUoc2FtcGxlMiwgc2FtcGxlMSksXG4gICAgICAgIHUgPSBtaW4odTEsIHUyKTtcblxuICAgIGZ1bmN0aW9uIGdldFNjb3JlKHhBLCBzYW1wbGVCKSB7XG4gICAgICByZXR1cm4gcmVkdWNlKHNhbXBsZUIsIGZ1bmN0aW9uKHRvdGFsLCB4Qikge1xuICAgICAgICByZXR1cm4gdG90YWwgKyAoeEIgPiB4QSA/IDAgOiB4QiA8IHhBID8gMSA6IDAuNSk7XG4gICAgICB9LCAwKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRVKHNhbXBsZUEsIHNhbXBsZUIpIHtcbiAgICAgIHJldHVybiByZWR1Y2Uoc2FtcGxlQSwgZnVuY3Rpb24odG90YWwsIHhBKSB7XG4gICAgICAgIHJldHVybiB0b3RhbCArIGdldFNjb3JlKHhBLCBzYW1wbGVCKTtcbiAgICAgIH0sIDApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFoodSkge1xuICAgICAgcmV0dXJuICh1IC0gKChzaXplMSAqIHNpemUyKSAvIDIpKSAvIHNxcnQoKHNpemUxICogc2l6ZTIgKiAoc2l6ZTEgKyBzaXplMiArIDEpKSAvIDEyKTtcbiAgICB9XG5cbiAgICAvLyBleGl0IGVhcmx5IGlmIGNvbXBhcmluZyB0aGUgc2FtZSBiZW5jaG1hcmtcbiAgICBpZiAobWUgPT0gb3RoZXIpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICAvLyByZWplY3QgdGhlIG51bGwgaHlwaG90aGVzaXMgdGhlIHR3byBzYW1wbGVzIGNvbWUgZnJvbSB0aGVcbiAgICAvLyBzYW1lIHBvcHVsYXRpb24gKGkuZS4gaGF2ZSB0aGUgc2FtZSBtZWRpYW4pIGlmLi4uXG4gICAgaWYgKHNpemUxICsgc2l6ZTIgPiAzMCkge1xuICAgICAgLy8gLi4udGhlIHotc3RhdCBpcyBncmVhdGVyIHRoYW4gMS45NiBvciBsZXNzIHRoYW4gLTEuOTZcbiAgICAgIC8vIGh0dHA6Ly93d3cuc3RhdGlzdGljc2xlY3R1cmVzLmNvbS90b3BpY3MvbWFubndoaXRuZXl1L1xuICAgICAgelN0YXQgPSBnZXRaKHUpO1xuICAgICAgcmV0dXJuIGFicyh6U3RhdCkgPiAxLjk2ID8gKHpTdGF0ID4gMCA/IC0xIDogMSkgOiAwO1xuICAgIH1cbiAgICAvLyAuLi50aGUgVSB2YWx1ZSBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdGhlIGNyaXRpY2FsIFUgdmFsdWVcbiAgICAvLyBodHRwOi8vd3d3Lmdlb2liLmNvbS9tYW5uLXdoaXRuZXktdS10ZXN0Lmh0bWxcbiAgICBjcml0aWNhbCA9IG1heFNpemUgPCA1IHx8IG1pblNpemUgPCAzID8gMCA6IHVUYWJsZVttYXhTaXplXVttaW5TaXplIC0gM107XG4gICAgcmV0dXJuIHUgPD0gY3JpdGljYWwgPyAodSA9PSB1MSA/IDEgOiAtMSkgOiAwO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0IHByb3BlcnRpZXMgYW5kIGFib3J0IGlmIHJ1bm5pbmcuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICogQHJldHVybnMge09iamVjdH0gVGhlIGJlbmNobWFyayBpbnN0YW5jZS5cbiAgICovXG4gIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIHZhciBkYXRhLFxuICAgICAgICBldmVudCxcbiAgICAgICAgbWUgPSB0aGlzLFxuICAgICAgICBpbmRleCA9IDAsXG4gICAgICAgIGNoYW5nZXMgPSB7ICdsZW5ndGgnOiAwIH0sXG4gICAgICAgIHF1ZXVlID0geyAnbGVuZ3RoJzogMCB9O1xuXG4gICAgaWYgKG1lLnJ1bm5pbmcgJiYgIWNhbGxlZEJ5LmFib3J0KSB7XG4gICAgICAvLyBubyB3b3JyaWVzLCBgcmVzZXQoKWAgaXMgY2FsbGVkIHdpdGhpbiBgYWJvcnQoKWBcbiAgICAgIGNhbGxlZEJ5LnJlc2V0ID0gdHJ1ZTtcbiAgICAgIG1lLmFib3J0KCk7XG4gICAgICBkZWxldGUgY2FsbGVkQnkucmVzZXQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gYSBub24tcmVjdXJzaXZlIHNvbHV0aW9uIHRvIGNoZWNrIGlmIHByb3BlcnRpZXMgaGF2ZSBjaGFuZ2VkXG4gICAgICAvLyBodHRwOi8vd3d3LmpzbGFiLmRrL2FydGljbGVzL25vbi5yZWN1cnNpdmUucHJlb3JkZXIudHJhdmVyc2FsLnBhcnQ0XG4gICAgICBkYXRhID0geyAnZGVzdGluYXRpb24nOiBtZSwgJ3NvdXJjZSc6IGV4dGVuZCh7fSwgbWUuY29uc3RydWN0b3IucHJvdG90eXBlLCBtZS5vcHRpb25zKSB9O1xuICAgICAgZG8ge1xuICAgICAgICBmb3JPd24oZGF0YS5zb3VyY2UsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICB2YXIgY2hhbmdlZCxcbiAgICAgICAgICAgICAgZGVzdGluYXRpb24gPSBkYXRhLmRlc3RpbmF0aW9uLFxuICAgICAgICAgICAgICBjdXJyVmFsdWUgPSBkZXN0aW5hdGlvbltrZXldO1xuXG4gICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgaWYgKGlzQ2xhc3NPZih2YWx1ZSwgJ0FycmF5JykpIHtcbiAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgYW4gYXJyYXkgdmFsdWUgaGFzIGNoYW5nZWQgdG8gYSBub24tYXJyYXkgdmFsdWVcbiAgICAgICAgICAgICAgaWYgKCFpc0NsYXNzT2YoY3VyclZhbHVlLCAnQXJyYXknKSkge1xuICAgICAgICAgICAgICAgIGNoYW5nZWQgPSBjdXJyVmFsdWUgPSBbXTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyBvciBoYXMgY2hhbmdlZCBpdHMgbGVuZ3RoXG4gICAgICAgICAgICAgIGlmIChjdXJyVmFsdWUubGVuZ3RoICE9IHZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNoYW5nZWQgPSBjdXJyVmFsdWUgPSBjdXJyVmFsdWUuc2xpY2UoMCwgdmFsdWUubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBjdXJyVmFsdWUubGVuZ3RoID0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBjaGVjayBpZiBhbiBvYmplY3QgaGFzIGNoYW5nZWQgdG8gYSBub24tb2JqZWN0IHZhbHVlXG4gICAgICAgICAgICBlbHNlIGlmICghY3VyclZhbHVlIHx8IHR5cGVvZiBjdXJyVmFsdWUgIT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgY2hhbmdlZCA9IGN1cnJWYWx1ZSA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcmVnaXN0ZXIgYSBjaGFuZ2VkIG9iamVjdFxuICAgICAgICAgICAgaWYgKGNoYW5nZWQpIHtcbiAgICAgICAgICAgICAgY2hhbmdlc1tjaGFuZ2VzLmxlbmd0aCsrXSA9IHsgJ2Rlc3RpbmF0aW9uJzogZGVzdGluYXRpb24sICdrZXknOiBrZXksICd2YWx1ZSc6IGN1cnJWYWx1ZSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcXVldWVbcXVldWUubGVuZ3RoKytdID0geyAnZGVzdGluYXRpb24nOiBjdXJyVmFsdWUsICdzb3VyY2UnOiB2YWx1ZSB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyByZWdpc3RlciBhIGNoYW5nZWQgcHJpbWl0aXZlXG4gICAgICAgICAgZWxzZSBpZiAodmFsdWUgIT09IGN1cnJWYWx1ZSAmJiAhKHZhbHVlID09IG51bGwgfHwgaXNDbGFzc09mKHZhbHVlLCAnRnVuY3Rpb24nKSkpIHtcbiAgICAgICAgICAgIGNoYW5nZXNbY2hhbmdlcy5sZW5ndGgrK10gPSB7ICdkZXN0aW5hdGlvbic6IGRlc3RpbmF0aW9uLCAna2V5Jzoga2V5LCAndmFsdWUnOiB2YWx1ZSB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICB3aGlsZSAoKGRhdGEgPSBxdWV1ZVtpbmRleCsrXSkpO1xuXG4gICAgICAvLyBpZiBjaGFuZ2VkIGVtaXQgdGhlIGByZXNldGAgZXZlbnQgYW5kIGlmIGl0IGlzbid0IGNhbmNlbGxlZCByZXNldCB0aGUgYmVuY2htYXJrXG4gICAgICBpZiAoY2hhbmdlcy5sZW5ndGggJiYgKG1lLmVtaXQoZXZlbnQgPSBFdmVudCgncmVzZXQnKSksICFldmVudC5jYW5jZWxsZWQpKSB7XG4gICAgICAgIGZvckVhY2goY2hhbmdlcywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIGRhdGEuZGVzdGluYXRpb25bZGF0YS5rZXldID0gZGF0YS52YWx1ZTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwbGF5cyByZWxldmFudCBiZW5jaG1hcmsgaW5mb3JtYXRpb24gd2hlbiBjb2VyY2VkIHRvIGEgc3RyaW5nLlxuICAgKlxuICAgKiBAbmFtZSB0b1N0cmluZ1xuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBiZW5jaG1hcmsgaW5zdGFuY2UuXG4gICAqL1xuICBmdW5jdGlvbiB0b1N0cmluZ0JlbmNoKCkge1xuICAgIHZhciBtZSA9IHRoaXMsXG4gICAgICAgIGVycm9yID0gbWUuZXJyb3IsXG4gICAgICAgIGh6ID0gbWUuaHosXG4gICAgICAgIGlkID0gbWUuaWQsXG4gICAgICAgIHN0YXRzID0gbWUuc3RhdHMsXG4gICAgICAgIHNpemUgPSBzdGF0cy5zYW1wbGUubGVuZ3RoLFxuICAgICAgICBwbSA9IHN1cHBvcnQuamF2YSA/ICcrLy0nIDogJ1xceGIxJyxcbiAgICAgICAgcmVzdWx0ID0gbWUubmFtZSB8fCAoaXNOYU4oaWQpID8gaWQgOiAnPFRlc3QgIycgKyBpZCArICc+Jyk7XG5cbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIHJlc3VsdCArPSAnOiAnICsgam9pbihlcnJvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCArPSAnIHggJyArIGZvcm1hdE51bWJlcihoei50b0ZpeGVkKGh6IDwgMTAwID8gMiA6IDApKSArICcgb3BzL3NlYyAnICsgcG0gK1xuICAgICAgICBzdGF0cy5ybWUudG9GaXhlZCgyKSArICclICgnICsgc2l6ZSArICcgcnVuJyArIChzaXplID09IDEgPyAnJyA6ICdzJykgKyAnIHNhbXBsZWQpJztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBDbG9ja3MgdGhlIHRpbWUgdGFrZW4gdG8gZXhlY3V0ZSBhIHRlc3QgcGVyIGN5Y2xlIChzZWNzKS5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtPYmplY3R9IGJlbmNoIFRoZSBiZW5jaG1hcmsgaW5zdGFuY2UuXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSB0aW1lIHRha2VuLlxuICAgKi9cbiAgZnVuY3Rpb24gY2xvY2soKSB7XG4gICAgdmFyIGFwcGxldCxcbiAgICAgICAgb3B0aW9ucyA9IEJlbmNobWFyay5vcHRpb25zLFxuICAgICAgICB0ZW1wbGF0ZSA9IHsgJ2JlZ2luJzogJ3MkPW5ldyBuJCcsICdlbmQnOiAnciQ9KG5ldyBuJC1zJCkvMWUzJywgJ3VpZCc6IHVpZCB9LFxuICAgICAgICB0aW1lcnMgPSBbeyAnbnMnOiB0aW1lci5ucywgJ3Jlcyc6IG1heCgwLjAwMTUsIGdldFJlcygnbXMnKSksICd1bml0JzogJ21zJyB9XTtcblxuICAgIC8vIGxhenkgZGVmaW5lIGZvciBoaS1yZXMgdGltZXJzXG4gICAgY2xvY2sgPSBmdW5jdGlvbihjbG9uZSkge1xuICAgICAgdmFyIGRlZmVycmVkO1xuICAgICAgaWYgKGNsb25lIGluc3RhbmNlb2YgRGVmZXJyZWQpIHtcbiAgICAgICAgZGVmZXJyZWQgPSBjbG9uZTtcbiAgICAgICAgY2xvbmUgPSBkZWZlcnJlZC5iZW5jaG1hcms7XG4gICAgICB9XG5cbiAgICAgIHZhciBiZW5jaCA9IGNsb25lLl9vcmlnaW5hbCxcbiAgICAgICAgICBmbiA9IGJlbmNoLmZuLFxuICAgICAgICAgIGZuQXJnID0gZGVmZXJyZWQgPyBnZXRGaXJzdEFyZ3VtZW50KGZuKSB8fCAnZGVmZXJyZWQnIDogJycsXG4gICAgICAgICAgc3RyaW5nYWJsZSA9IGlzU3RyaW5nYWJsZShmbik7XG5cbiAgICAgIHZhciBzb3VyY2UgPSB7XG4gICAgICAgICdzZXR1cCc6IGdldFNvdXJjZShiZW5jaC5zZXR1cCwgcHJlcHJvY2VzcygnbSQuc2V0dXAoKScpKSxcbiAgICAgICAgJ2ZuJzogZ2V0U291cmNlKGZuLCBwcmVwcm9jZXNzKCdtJC5mbignICsgZm5BcmcgKyAnKScpKSxcbiAgICAgICAgJ2ZuQXJnJzogZm5BcmcsXG4gICAgICAgICd0ZWFyZG93bic6IGdldFNvdXJjZShiZW5jaC50ZWFyZG93biwgcHJlcHJvY2VzcygnbSQudGVhcmRvd24oKScpKVxuICAgICAgfTtcblxuICAgICAgdmFyIGNvdW50ID0gYmVuY2guY291bnQgPSBjbG9uZS5jb3VudCxcbiAgICAgICAgICBkZWNvbXBpbGFibGUgPSBzdXBwb3J0LmRlY29tcGlsYXRpb24gfHwgc3RyaW5nYWJsZSxcbiAgICAgICAgICBpZCA9IGJlbmNoLmlkLFxuICAgICAgICAgIGlzRW1wdHkgPSAhKHNvdXJjZS5mbiB8fCBzdHJpbmdhYmxlKSxcbiAgICAgICAgICBuYW1lID0gYmVuY2gubmFtZSB8fCAodHlwZW9mIGlkID09ICdudW1iZXInID8gJzxUZXN0ICMnICsgaWQgKyAnPicgOiBpZCksXG4gICAgICAgICAgbnMgPSB0aW1lci5ucyxcbiAgICAgICAgICByZXN1bHQgPSAwO1xuXG4gICAgICAvLyBpbml0IGBtaW5UaW1lYCBpZiBuZWVkZWRcbiAgICAgIGNsb25lLm1pblRpbWUgPSBiZW5jaC5taW5UaW1lIHx8IChiZW5jaC5taW5UaW1lID0gYmVuY2gub3B0aW9ucy5taW5UaW1lID0gb3B0aW9ucy5taW5UaW1lKTtcblxuICAgICAgLy8gcmVwYWlyIG5hbm9zZWNvbmQgdGltZXJcbiAgICAgIC8vIChzb21lIENocm9tZSBidWlsZHMgZXJhc2UgdGhlIGBuc2AgdmFyaWFibGUgYWZ0ZXIgbWlsbGlvbnMgb2YgZXhlY3V0aW9ucylcbiAgICAgIGlmIChhcHBsZXQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBucy5uYW5vVGltZSgpO1xuICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAvLyB1c2Ugbm9uLWVsZW1lbnQgdG8gYXZvaWQgaXNzdWVzIHdpdGggbGlicyB0aGF0IGF1Z21lbnQgdGhlbVxuICAgICAgICAgIG5zID0gdGltZXIubnMgPSBuZXcgYXBwbGV0LlBhY2thZ2VzLm5hbm87XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQ29tcGlsZSBpbiBzZXR1cC90ZWFyZG93biBmdW5jdGlvbnMgYW5kIHRoZSB0ZXN0IGxvb3AuXG4gICAgICAvLyBDcmVhdGUgYSBuZXcgY29tcGlsZWQgdGVzdCwgaW5zdGVhZCBvZiB1c2luZyB0aGUgY2FjaGVkIGBiZW5jaC5jb21waWxlZGAsXG4gICAgICAvLyB0byBhdm9pZCBwb3RlbnRpYWwgZW5naW5lIG9wdGltaXphdGlvbnMgZW5hYmxlZCBvdmVyIHRoZSBsaWZlIG9mIHRoZSB0ZXN0LlxuICAgICAgdmFyIGNvbXBpbGVkID0gYmVuY2guY29tcGlsZWQgPSBjcmVhdGVGdW5jdGlvbihwcmVwcm9jZXNzKCd0JCcpLCBpbnRlcnBvbGF0ZShcbiAgICAgICAgcHJlcHJvY2VzcyhkZWZlcnJlZFxuICAgICAgICAgID8gJ3ZhciBkJD10aGlzLCN7Zm5Bcmd9PWQkLG0kPWQkLmJlbmNobWFyay5fb3JpZ2luYWwsZiQ9bSQuZm4sc3UkPW0kLnNldHVwLHRkJD1tJC50ZWFyZG93bjsnICtcbiAgICAgICAgICAgIC8vIHdoZW4gYGRlZmVycmVkLmN5Y2xlc2AgaXMgYDBgIHRoZW4uLi5cbiAgICAgICAgICAgICdpZighZCQuY3ljbGVzKXsnICtcbiAgICAgICAgICAgIC8vIHNldCBgZGVmZXJyZWQuZm5gXG4gICAgICAgICAgICAnZCQuZm49ZnVuY3Rpb24oKXt2YXIgI3tmbkFyZ309ZCQ7aWYodHlwZW9mIGYkPT1cImZ1bmN0aW9uXCIpe3RyeXsje2ZufVxcbn1jYXRjaChlJCl7ZiQoZCQpfX1lbHNleyN7Zm59XFxufX07JyArXG4gICAgICAgICAgICAvLyBzZXQgYGRlZmVycmVkLnRlYXJkb3duYFxuICAgICAgICAgICAgJ2QkLnRlYXJkb3duPWZ1bmN0aW9uKCl7ZCQuY3ljbGVzPTA7aWYodHlwZW9mIHRkJD09XCJmdW5jdGlvblwiKXt0cnl7I3t0ZWFyZG93bn1cXG59Y2F0Y2goZSQpe3RkJCgpfX1lbHNleyN7dGVhcmRvd259XFxufX07JyArXG4gICAgICAgICAgICAvLyBleGVjdXRlIHRoZSBiZW5jaG1hcmsncyBgc2V0dXBgXG4gICAgICAgICAgICAnaWYodHlwZW9mIHN1JD09XCJmdW5jdGlvblwiKXt0cnl7I3tzZXR1cH1cXG59Y2F0Y2goZSQpe3N1JCgpfX1lbHNleyN7c2V0dXB9XFxufTsnICtcbiAgICAgICAgICAgIC8vIHN0YXJ0IHRpbWVyXG4gICAgICAgICAgICAndCQuc3RhcnQoZCQpOycgK1xuICAgICAgICAgICAgLy8gZXhlY3V0ZSBgZGVmZXJyZWQuZm5gIGFuZCByZXR1cm4gYSBkdW1teSBvYmplY3RcbiAgICAgICAgICAgICd9ZCQuZm4oKTtyZXR1cm57fSdcblxuICAgICAgICAgIDogJ3ZhciByJCxzJCxtJD10aGlzLGYkPW0kLmZuLGkkPW0kLmNvdW50LG4kPXQkLm5zOyN7c2V0dXB9XFxuI3tiZWdpbn07JyArXG4gICAgICAgICAgICAnd2hpbGUoaSQtLSl7I3tmbn1cXG59I3tlbmR9OyN7dGVhcmRvd259XFxucmV0dXJue2VsYXBzZWQ6ciQsdWlkOlwiI3t1aWR9XCJ9JyksXG4gICAgICAgIHNvdXJjZVxuICAgICAgKSk7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChpc0VtcHR5KSB7XG4gICAgICAgICAgLy8gRmlyZWZveCBtYXkgcmVtb3ZlIGRlYWQgY29kZSBmcm9tIEZ1bmN0aW9uI3RvU3RyaW5nIHJlc3VsdHNcbiAgICAgICAgICAvLyBodHRwOi8vYnVnemlsLmxhLzUzNjA4NVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIHRlc3QgXCInICsgbmFtZSArICdcIiBpcyBlbXB0eS4gVGhpcyBtYXkgYmUgdGhlIHJlc3VsdCBvZiBkZWFkIGNvZGUgcmVtb3ZhbC4nKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghZGVmZXJyZWQpIHtcbiAgICAgICAgICAvLyBwcmV0ZXN0IHRvIGRldGVybWluZSBpZiBjb21waWxlZCBjb2RlIGlzIGV4aXRzIGVhcmx5LCB1c3VhbGx5IGJ5IGFcbiAgICAgICAgICAvLyByb2d1ZSBgcmV0dXJuYCBzdGF0ZW1lbnQsIGJ5IGNoZWNraW5nIGZvciBhIHJldHVybiBvYmplY3Qgd2l0aCB0aGUgdWlkXG4gICAgICAgICAgYmVuY2guY291bnQgPSAxO1xuICAgICAgICAgIGNvbXBpbGVkID0gKGNvbXBpbGVkLmNhbGwoYmVuY2gsIHRpbWVyKSB8fCB7fSkudWlkID09IHVpZCAmJiBjb21waWxlZDtcbiAgICAgICAgICBiZW5jaC5jb3VudCA9IGNvdW50O1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgY29tcGlsZWQgPSBudWxsO1xuICAgICAgICBjbG9uZS5lcnJvciA9IGUgfHwgbmV3IEVycm9yKFN0cmluZyhlKSk7XG4gICAgICAgIGJlbmNoLmNvdW50ID0gY291bnQ7XG4gICAgICB9XG4gICAgICAvLyBmYWxsYmFjayB3aGVuIGEgdGVzdCBleGl0cyBlYXJseSBvciBlcnJvcnMgZHVyaW5nIHByZXRlc3RcbiAgICAgIGlmIChkZWNvbXBpbGFibGUgJiYgIWNvbXBpbGVkICYmICFkZWZlcnJlZCAmJiAhaXNFbXB0eSkge1xuICAgICAgICBjb21waWxlZCA9IGNyZWF0ZUZ1bmN0aW9uKHByZXByb2Nlc3MoJ3QkJyksIGludGVycG9sYXRlKFxuICAgICAgICAgIHByZXByb2Nlc3MoXG4gICAgICAgICAgICAoY2xvbmUuZXJyb3IgJiYgIXN0cmluZ2FibGVcbiAgICAgICAgICAgICAgPyAndmFyIHIkLHMkLG0kPXRoaXMsZiQ9bSQuZm4saSQ9bSQuY291bnQnXG4gICAgICAgICAgICAgIDogJ2Z1bmN0aW9uIGYkKCl7I3tmbn1cXG59dmFyIHIkLHMkLG0kPXRoaXMsaSQ9bSQuY291bnQnXG4gICAgICAgICAgICApICtcbiAgICAgICAgICAgICcsbiQ9dCQubnM7I3tzZXR1cH1cXG4je2JlZ2lufTttJC5mJD1mJDt3aGlsZShpJC0tKXttJC5mJCgpfSN7ZW5kfTsnICtcbiAgICAgICAgICAgICdkZWxldGUgbSQuZiQ7I3t0ZWFyZG93bn1cXG5yZXR1cm57ZWxhcHNlZDpyJH0nXG4gICAgICAgICAgKSxcbiAgICAgICAgICBzb3VyY2VcbiAgICAgICAgKSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBwcmV0ZXN0IG9uZSBtb3JlIHRpbWUgdG8gY2hlY2sgZm9yIGVycm9yc1xuICAgICAgICAgIGJlbmNoLmNvdW50ID0gMTtcbiAgICAgICAgICBjb21waWxlZC5jYWxsKGJlbmNoLCB0aW1lcik7XG4gICAgICAgICAgYmVuY2guY29tcGlsZWQgPSBjb21waWxlZDtcbiAgICAgICAgICBiZW5jaC5jb3VudCA9IGNvdW50O1xuICAgICAgICAgIGRlbGV0ZSBjbG9uZS5lcnJvcjtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaChlKSB7XG4gICAgICAgICAgYmVuY2guY291bnQgPSBjb3VudDtcbiAgICAgICAgICBpZiAoY2xvbmUuZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbXBpbGVkID0gbnVsbDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmVuY2guY29tcGlsZWQgPSBjb21waWxlZDtcbiAgICAgICAgICAgIGNsb25lLmVycm9yID0gZSB8fCBuZXcgRXJyb3IoU3RyaW5nKGUpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGFzc2lnbiBgY29tcGlsZWRgIHRvIGBjbG9uZWAgYmVmb3JlIGNhbGxpbmcgaW4gY2FzZSBhIGRlZmVycmVkIGJlbmNobWFya1xuICAgICAgLy8gaW1tZWRpYXRlbHkgY2FsbHMgYGRlZmVycmVkLnJlc29sdmUoKWBcbiAgICAgIGNsb25lLmNvbXBpbGVkID0gY29tcGlsZWQ7XG4gICAgICAvLyBpZiBubyBlcnJvcnMgcnVuIHRoZSBmdWxsIHRlc3QgbG9vcFxuICAgICAgaWYgKCFjbG9uZS5lcnJvcikge1xuICAgICAgICByZXN1bHQgPSBjb21waWxlZC5jYWxsKGRlZmVycmVkIHx8IGJlbmNoLCB0aW1lcikuZWxhcHNlZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGN1cnJlbnQgdGltZXIncyBtaW5pbXVtIHJlc29sdXRpb24gKHNlY3MpLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldFJlcyh1bml0KSB7XG4gICAgICB2YXIgbWVhc3VyZWQsXG4gICAgICAgICAgYmVnaW4sXG4gICAgICAgICAgY291bnQgPSAzMCxcbiAgICAgICAgICBkaXZpc29yID0gMWUzLFxuICAgICAgICAgIG5zID0gdGltZXIubnMsXG4gICAgICAgICAgc2FtcGxlID0gW107XG5cbiAgICAgIC8vIGdldCBhdmVyYWdlIHNtYWxsZXN0IG1lYXN1cmFibGUgdGltZVxuICAgICAgd2hpbGUgKGNvdW50LS0pIHtcbiAgICAgICAgaWYgKHVuaXQgPT0gJ3VzJykge1xuICAgICAgICAgIGRpdmlzb3IgPSAxZTY7XG4gICAgICAgICAgaWYgKG5zLnN0b3ApIHtcbiAgICAgICAgICAgIG5zLnN0YXJ0KCk7XG4gICAgICAgICAgICB3aGlsZSAoIShtZWFzdXJlZCA9IG5zLm1pY3Jvc2Vjb25kcygpKSkgeyB9XG4gICAgICAgICAgfSBlbHNlIGlmIChuc1twZXJmTmFtZV0pIHtcbiAgICAgICAgICAgIGRpdmlzb3IgPSAxZTM7XG4gICAgICAgICAgICBtZWFzdXJlZCA9IEZ1bmN0aW9uKCduJywgJ3ZhciByLHM9bi4nICsgcGVyZk5hbWUgKyAnKCk7d2hpbGUoIShyPW4uJyArIHBlcmZOYW1lICsgJygpLXMpKXt9O3JldHVybiByJykobnMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBiZWdpbiA9IG5zKCk7XG4gICAgICAgICAgICB3aGlsZSAoIShtZWFzdXJlZCA9IG5zKCkgLSBiZWdpbikpIHsgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh1bml0ID09ICducycpIHtcbiAgICAgICAgICBkaXZpc29yID0gMWU5O1xuICAgICAgICAgIGlmIChucy5uYW5vVGltZSkge1xuICAgICAgICAgICAgYmVnaW4gPSBucy5uYW5vVGltZSgpO1xuICAgICAgICAgICAgd2hpbGUgKCEobWVhc3VyZWQgPSBucy5uYW5vVGltZSgpIC0gYmVnaW4pKSB7IH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmVnaW4gPSAoYmVnaW4gPSBucygpKVswXSArIChiZWdpblsxXSAvIGRpdmlzb3IpO1xuICAgICAgICAgICAgd2hpbGUgKCEobWVhc3VyZWQgPSAoKG1lYXN1cmVkID0gbnMoKSlbMF0gKyAobWVhc3VyZWRbMV0gLyBkaXZpc29yKSkgLSBiZWdpbikpIHsgfVxuICAgICAgICAgICAgZGl2aXNvciA9IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGJlZ2luID0gbmV3IG5zO1xuICAgICAgICAgIHdoaWxlICghKG1lYXN1cmVkID0gbmV3IG5zIC0gYmVnaW4pKSB7IH1cbiAgICAgICAgfVxuICAgICAgICAvLyBjaGVjayBmb3IgYnJva2VuIHRpbWVycyAobmFub1RpbWUgbWF5IGhhdmUgaXNzdWVzKVxuICAgICAgICAvLyBodHRwOi8vYWxpdmVidXRzbGVlcHkuc3JuZXQuY3ovdW5yZWxpYWJsZS1zeXN0ZW0tbmFub3RpbWUvXG4gICAgICAgIGlmIChtZWFzdXJlZCA+IDApIHtcbiAgICAgICAgICBzYW1wbGUucHVzaChtZWFzdXJlZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2FtcGxlLnB1c2goSW5maW5pdHkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBjb252ZXJ0IHRvIHNlY29uZHNcbiAgICAgIHJldHVybiBnZXRNZWFuKHNhbXBsZSkgLyBkaXZpc29yO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlcGxhY2VzIGFsbCBvY2N1cnJlbmNlcyBvZiBgJGAgd2l0aCBhIHVuaXF1ZSBudW1iZXIgYW5kXG4gICAgICogdGVtcGxhdGUgdG9rZW5zIHdpdGggY29udGVudC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBwcmVwcm9jZXNzKGNvZGUpIHtcbiAgICAgIHJldHVybiBpbnRlcnBvbGF0ZShjb2RlLCB0ZW1wbGF0ZSkucmVwbGFjZSgvXFwkL2csIC9cXGQrLy5leGVjKHVpZCkpO1xuICAgIH1cblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIC8vIGRldGVjdCBuYW5vc2Vjb25kIHN1cHBvcnQgZnJvbSBhIEphdmEgYXBwbGV0XG4gICAgZWFjaChkb2MgJiYgZG9jLmFwcGxldHMgfHwgW10sIGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHJldHVybiAhKHRpbWVyLm5zID0gYXBwbGV0ID0gJ25hbm9UaW1lJyBpbiBlbGVtZW50ICYmIGVsZW1lbnQpO1xuICAgIH0pO1xuXG4gICAgLy8gY2hlY2sgdHlwZSBpbiBjYXNlIFNhZmFyaSByZXR1cm5zIGFuIG9iamVjdCBpbnN0ZWFkIG9mIGEgbnVtYmVyXG4gICAgdHJ5IHtcbiAgICAgIGlmICh0eXBlb2YgdGltZXIubnMubmFub1RpbWUoKSA9PSAnbnVtYmVyJykge1xuICAgICAgICB0aW1lcnMucHVzaCh7ICducyc6IHRpbWVyLm5zLCAncmVzJzogZ2V0UmVzKCducycpLCAndW5pdCc6ICducycgfSk7XG4gICAgICB9XG4gICAgfSBjYXRjaChlKSB7IH1cblxuICAgIC8vIGRldGVjdCBDaHJvbWUncyBtaWNyb3NlY29uZCB0aW1lcjpcbiAgICAvLyBlbmFibGUgYmVuY2htYXJraW5nIHZpYSB0aGUgLS1lbmFibGUtYmVuY2htYXJraW5nIGNvbW1hbmRcbiAgICAvLyBsaW5lIHN3aXRjaCBpbiBhdCBsZWFzdCBDaHJvbWUgNyB0byB1c2UgY2hyb21lLkludGVydmFsXG4gICAgdHJ5IHtcbiAgICAgIGlmICgodGltZXIubnMgPSBuZXcgKHdpbmRvdy5jaHJvbWUgfHwgd2luZG93LmNocm9taXVtKS5JbnRlcnZhbCkpIHtcbiAgICAgICAgdGltZXJzLnB1c2goeyAnbnMnOiB0aW1lci5ucywgJ3Jlcyc6IGdldFJlcygndXMnKSwgJ3VuaXQnOiAndXMnIH0pO1xuICAgICAgfVxuICAgIH0gY2F0Y2goZSkgeyB9XG5cbiAgICAvLyBkZXRlY3QgYHBlcmZvcm1hbmNlLm5vd2AgbWljcm9zZWNvbmQgcmVzb2x1dGlvbiB0aW1lclxuICAgIGlmICgodGltZXIubnMgPSBwZXJmTmFtZSAmJiBwZXJmT2JqZWN0KSkge1xuICAgICAgdGltZXJzLnB1c2goeyAnbnMnOiB0aW1lci5ucywgJ3Jlcyc6IGdldFJlcygndXMnKSwgJ3VuaXQnOiAndXMnIH0pO1xuICAgIH1cblxuICAgIC8vIGRldGVjdCBOb2RlJ3MgbmFub3NlY29uZCByZXNvbHV0aW9uIHRpbWVyIGF2YWlsYWJsZSBpbiBOb2RlID49IDAuOFxuICAgIGlmIChwcm9jZXNzT2JqZWN0ICYmIHR5cGVvZiAodGltZXIubnMgPSBwcm9jZXNzT2JqZWN0LmhydGltZSkgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGltZXJzLnB1c2goeyAnbnMnOiB0aW1lci5ucywgJ3Jlcyc6IGdldFJlcygnbnMnKSwgJ3VuaXQnOiAnbnMnIH0pO1xuICAgIH1cblxuICAgIC8vIGRldGVjdCBXYWRlIFNpbW1vbnMnIE5vZGUgbWljcm90aW1lIG1vZHVsZVxuICAgIGlmIChtaWNyb3RpbWVPYmplY3QgJiYgdHlwZW9mICh0aW1lci5ucyA9IG1pY3JvdGltZU9iamVjdC5ub3cpID09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRpbWVycy5wdXNoKHsgJ25zJzogdGltZXIubnMsICAncmVzJzogZ2V0UmVzKCd1cycpLCAndW5pdCc6ICd1cycgfSk7XG4gICAgfVxuXG4gICAgLy8gcGljayB0aW1lciB3aXRoIGhpZ2hlc3QgcmVzb2x1dGlvblxuICAgIHRpbWVyID0gcmVkdWNlKHRpbWVycywgZnVuY3Rpb24odGltZXIsIG90aGVyKSB7XG4gICAgICByZXR1cm4gb3RoZXIucmVzIDwgdGltZXIucmVzID8gb3RoZXIgOiB0aW1lcjtcbiAgICB9KTtcblxuICAgIC8vIHJlbW92ZSB1bnVzZWQgYXBwbGV0XG4gICAgaWYgKHRpbWVyLnVuaXQgIT0gJ25zJyAmJiBhcHBsZXQpIHtcbiAgICAgIGFwcGxldCA9IGRlc3Ryb3lFbGVtZW50KGFwcGxldCk7XG4gICAgfVxuICAgIC8vIGVycm9yIGlmIHRoZXJlIGFyZSBubyB3b3JraW5nIHRpbWVyc1xuICAgIGlmICh0aW1lci5yZXMgPT0gSW5maW5pdHkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQmVuY2htYXJrLmpzIHdhcyB1bmFibGUgdG8gZmluZCBhIHdvcmtpbmcgdGltZXIuJyk7XG4gICAgfVxuICAgIC8vIHVzZSBBUEkgb2YgY2hvc2VuIHRpbWVyXG4gICAgaWYgKHRpbWVyLnVuaXQgPT0gJ25zJykge1xuICAgICAgaWYgKHRpbWVyLm5zLm5hbm9UaW1lKSB7XG4gICAgICAgIGV4dGVuZCh0ZW1wbGF0ZSwge1xuICAgICAgICAgICdiZWdpbic6ICdzJD1uJC5uYW5vVGltZSgpJyxcbiAgICAgICAgICAnZW5kJzogJ3IkPShuJC5uYW5vVGltZSgpLXMkKS8xZTknXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXh0ZW5kKHRlbXBsYXRlLCB7XG4gICAgICAgICAgJ2JlZ2luJzogJ3MkPW4kKCknLFxuICAgICAgICAgICdlbmQnOiAnciQ9biQocyQpO3IkPXIkWzBdKyhyJFsxXS8xZTkpJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAodGltZXIudW5pdCA9PSAndXMnKSB7XG4gICAgICBpZiAodGltZXIubnMuc3RvcCkge1xuICAgICAgICBleHRlbmQodGVtcGxhdGUsIHtcbiAgICAgICAgICAnYmVnaW4nOiAncyQ9biQuc3RhcnQoKScsXG4gICAgICAgICAgJ2VuZCc6ICdyJD1uJC5taWNyb3NlY29uZHMoKS8xZTYnXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChwZXJmTmFtZSkge1xuICAgICAgICBleHRlbmQodGVtcGxhdGUsIHtcbiAgICAgICAgICAnYmVnaW4nOiAncyQ9biQuJyArIHBlcmZOYW1lICsgJygpJyxcbiAgICAgICAgICAnZW5kJzogJ3IkPShuJC4nICsgcGVyZk5hbWUgKyAnKCktcyQpLzFlMydcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBleHRlbmQodGVtcGxhdGUsIHtcbiAgICAgICAgICAnYmVnaW4nOiAncyQ9biQoKScsXG4gICAgICAgICAgJ2VuZCc6ICdyJD0obiQoKS1zJCkvMWU2J1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBkZWZpbmUgYHRpbWVyYCBtZXRob2RzXG4gICAgdGltZXIuc3RhcnQgPSBjcmVhdGVGdW5jdGlvbihwcmVwcm9jZXNzKCdvJCcpLFxuICAgICAgcHJlcHJvY2VzcygndmFyIG4kPXRoaXMubnMsI3tiZWdpbn07byQuZWxhcHNlZD0wO28kLnRpbWVTdGFtcD1zJCcpKTtcblxuICAgIHRpbWVyLnN0b3AgPSBjcmVhdGVGdW5jdGlvbihwcmVwcm9jZXNzKCdvJCcpLFxuICAgICAgcHJlcHJvY2VzcygndmFyIG4kPXRoaXMubnMscyQ9byQudGltZVN0YW1wLCN7ZW5kfTtvJC5lbGFwc2VkPXIkJykpO1xuXG4gICAgLy8gcmVzb2x2ZSB0aW1lIHNwYW4gcmVxdWlyZWQgdG8gYWNoaWV2ZSBhIHBlcmNlbnQgdW5jZXJ0YWludHkgb2YgYXQgbW9zdCAxJVxuICAgIC8vIGh0dHA6Ly9zcGlmZi5yaXQuZWR1L2NsYXNzZXMvcGh5czI3My91bmNlcnQvdW5jZXJ0Lmh0bWxcbiAgICBvcHRpb25zLm1pblRpbWUgfHwgKG9wdGlvbnMubWluVGltZSA9IG1heCh0aW1lci5yZXMgLyAyIC8gMC4wMSwgMC4wNSkpO1xuICAgIHJldHVybiBjbG9jay5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIHN0YXRzIG9uIGJlbmNobWFyayByZXN1bHRzLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge09iamVjdH0gYmVuY2ggVGhlIGJlbmNobWFyayBpbnN0YW5jZS5cbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gICAqL1xuICBmdW5jdGlvbiBjb21wdXRlKGJlbmNoLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcblxuICAgIHZhciBhc3luYyA9IG9wdGlvbnMuYXN5bmMsXG4gICAgICAgIGVsYXBzZWQgPSAwLFxuICAgICAgICBpbml0Q291bnQgPSBiZW5jaC5pbml0Q291bnQsXG4gICAgICAgIG1pblNhbXBsZXMgPSBiZW5jaC5taW5TYW1wbGVzLFxuICAgICAgICBxdWV1ZSA9IFtdLFxuICAgICAgICBzYW1wbGUgPSBiZW5jaC5zdGF0cy5zYW1wbGU7XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgY2xvbmUgdG8gdGhlIHF1ZXVlLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGVucXVldWUoKSB7XG4gICAgICBxdWV1ZS5wdXNoKGJlbmNoLmNsb25lKHtcbiAgICAgICAgJ19vcmlnaW5hbCc6IGJlbmNoLFxuICAgICAgICAnZXZlbnRzJzoge1xuICAgICAgICAgICdhYm9ydCc6IFt1cGRhdGVdLFxuICAgICAgICAgICdjeWNsZSc6IFt1cGRhdGVdLFxuICAgICAgICAgICdlcnJvcic6IFt1cGRhdGVdLFxuICAgICAgICAgICdzdGFydCc6IFt1cGRhdGVdXG4gICAgICAgIH1cbiAgICAgIH0pKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGVzIHRoZSBjbG9uZS9vcmlnaW5hbCBiZW5jaG1hcmtzIHRvIGtlZXAgdGhlaXIgZGF0YSBpbiBzeW5jLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHVwZGF0ZShldmVudCkge1xuICAgICAgdmFyIGNsb25lID0gdGhpcyxcbiAgICAgICAgICB0eXBlID0gZXZlbnQudHlwZTtcblxuICAgICAgaWYgKGJlbmNoLnJ1bm5pbmcpIHtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3N0YXJ0Jykge1xuICAgICAgICAgIC8vIE5vdGU6IGBjbG9uZS5taW5UaW1lYCBwcm9wIGlzIGluaXRlZCBpbiBgY2xvY2soKWBcbiAgICAgICAgICBjbG9uZS5jb3VudCA9IGJlbmNoLmluaXRDb3VudDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpZiAodHlwZSA9PSAnZXJyb3InKSB7XG4gICAgICAgICAgICBiZW5jaC5lcnJvciA9IGNsb25lLmVycm9yO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHlwZSA9PSAnYWJvcnQnKSB7XG4gICAgICAgICAgICBiZW5jaC5hYm9ydCgpO1xuICAgICAgICAgICAgYmVuY2guZW1pdCgnY3ljbGUnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXZlbnQuY3VycmVudFRhcmdldCA9IGV2ZW50LnRhcmdldCA9IGJlbmNoO1xuICAgICAgICAgICAgYmVuY2guZW1pdChldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGJlbmNoLmFib3J0ZWQpIHtcbiAgICAgICAgLy8gY2xlYXIgYWJvcnQgbGlzdGVuZXJzIHRvIGF2b2lkIHRyaWdnZXJpbmcgYmVuY2gncyBhYm9ydC9jeWNsZSBhZ2FpblxuICAgICAgICBjbG9uZS5ldmVudHMuYWJvcnQubGVuZ3RoID0gMDtcbiAgICAgICAgY2xvbmUuYWJvcnQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGlmIG1vcmUgY2xvbmVzIHNob3VsZCBiZSBxdWV1ZWQgb3IgaWYgY3ljbGluZyBzaG91bGQgc3RvcC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBldmFsdWF0ZShldmVudCkge1xuICAgICAgdmFyIGNyaXRpY2FsLFxuICAgICAgICAgIGRmLFxuICAgICAgICAgIG1lYW4sXG4gICAgICAgICAgbW9lLFxuICAgICAgICAgIHJtZSxcbiAgICAgICAgICBzZCxcbiAgICAgICAgICBzZW0sXG4gICAgICAgICAgdmFyaWFuY2UsXG4gICAgICAgICAgY2xvbmUgPSBldmVudC50YXJnZXQsXG4gICAgICAgICAgZG9uZSA9IGJlbmNoLmFib3J0ZWQsXG4gICAgICAgICAgbm93ID0gK25ldyBEYXRlLFxuICAgICAgICAgIHNpemUgPSBzYW1wbGUucHVzaChjbG9uZS50aW1lcy5wZXJpb2QpLFxuICAgICAgICAgIG1heGVkT3V0ID0gc2l6ZSA+PSBtaW5TYW1wbGVzICYmIChlbGFwc2VkICs9IG5vdyAtIGNsb25lLnRpbWVzLnRpbWVTdGFtcCkgLyAxZTMgPiBiZW5jaC5tYXhUaW1lLFxuICAgICAgICAgIHRpbWVzID0gYmVuY2gudGltZXMsXG4gICAgICAgICAgdmFyT2YgPSBmdW5jdGlvbihzdW0sIHgpIHsgcmV0dXJuIHN1bSArIHBvdyh4IC0gbWVhbiwgMik7IH07XG5cbiAgICAgIC8vIGV4aXQgZWFybHkgZm9yIGFib3J0ZWQgb3IgdW5jbG9ja2FibGUgdGVzdHNcbiAgICAgIGlmIChkb25lIHx8IGNsb25lLmh6ID09IEluZmluaXR5KSB7XG4gICAgICAgIG1heGVkT3V0ID0gIShzaXplID0gc2FtcGxlLmxlbmd0aCA9IHF1ZXVlLmxlbmd0aCA9IDApO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWRvbmUpIHtcbiAgICAgICAgLy8gc2FtcGxlIG1lYW4gKGVzdGltYXRlIG9mIHRoZSBwb3B1bGF0aW9uIG1lYW4pXG4gICAgICAgIG1lYW4gPSBnZXRNZWFuKHNhbXBsZSk7XG4gICAgICAgIC8vIHNhbXBsZSB2YXJpYW5jZSAoZXN0aW1hdGUgb2YgdGhlIHBvcHVsYXRpb24gdmFyaWFuY2UpXG4gICAgICAgIHZhcmlhbmNlID0gcmVkdWNlKHNhbXBsZSwgdmFyT2YsIDApIC8gKHNpemUgLSAxKSB8fCAwO1xuICAgICAgICAvLyBzYW1wbGUgc3RhbmRhcmQgZGV2aWF0aW9uIChlc3RpbWF0ZSBvZiB0aGUgcG9wdWxhdGlvbiBzdGFuZGFyZCBkZXZpYXRpb24pXG4gICAgICAgIHNkID0gc3FydCh2YXJpYW5jZSk7XG4gICAgICAgIC8vIHN0YW5kYXJkIGVycm9yIG9mIHRoZSBtZWFuIChhLmsuYS4gdGhlIHN0YW5kYXJkIGRldmlhdGlvbiBvZiB0aGUgc2FtcGxpbmcgZGlzdHJpYnV0aW9uIG9mIHRoZSBzYW1wbGUgbWVhbilcbiAgICAgICAgc2VtID0gc2QgLyBzcXJ0KHNpemUpO1xuICAgICAgICAvLyBkZWdyZWVzIG9mIGZyZWVkb21cbiAgICAgICAgZGYgPSBzaXplIC0gMTtcbiAgICAgICAgLy8gY3JpdGljYWwgdmFsdWVcbiAgICAgICAgY3JpdGljYWwgPSB0VGFibGVbTWF0aC5yb3VuZChkZikgfHwgMV0gfHwgdFRhYmxlLmluZmluaXR5O1xuICAgICAgICAvLyBtYXJnaW4gb2YgZXJyb3JcbiAgICAgICAgbW9lID0gc2VtICogY3JpdGljYWw7XG4gICAgICAgIC8vIHJlbGF0aXZlIG1hcmdpbiBvZiBlcnJvclxuICAgICAgICBybWUgPSAobW9lIC8gbWVhbikgKiAxMDAgfHwgMDtcblxuICAgICAgICBleHRlbmQoYmVuY2guc3RhdHMsIHtcbiAgICAgICAgICAnZGV2aWF0aW9uJzogc2QsXG4gICAgICAgICAgJ21lYW4nOiBtZWFuLFxuICAgICAgICAgICdtb2UnOiBtb2UsXG4gICAgICAgICAgJ3JtZSc6IHJtZSxcbiAgICAgICAgICAnc2VtJzogc2VtLFxuICAgICAgICAgICd2YXJpYW5jZSc6IHZhcmlhbmNlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFib3J0IHRoZSBjeWNsZSBsb29wIHdoZW4gdGhlIG1pbmltdW0gc2FtcGxlIHNpemUgaGFzIGJlZW4gY29sbGVjdGVkXG4gICAgICAgIC8vIGFuZCB0aGUgZWxhcHNlZCB0aW1lIGV4Y2VlZHMgdGhlIG1heGltdW0gdGltZSBhbGxvd2VkIHBlciBiZW5jaG1hcmsuXG4gICAgICAgIC8vIFdlIGRvbid0IGNvdW50IGN5Y2xlIGRlbGF5cyB0b3dhcmQgdGhlIG1heCB0aW1lIGJlY2F1c2UgZGVsYXlzIG1heSBiZVxuICAgICAgICAvLyBpbmNyZWFzZWQgYnkgYnJvd3NlcnMgdGhhdCBjbGFtcCB0aW1lb3V0cyBmb3IgaW5hY3RpdmUgdGFicy5cbiAgICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vd2luZG93LnNldFRpbWVvdXQjSW5hY3RpdmVfdGFic1xuICAgICAgICBpZiAobWF4ZWRPdXQpIHtcbiAgICAgICAgICAvLyByZXNldCB0aGUgYGluaXRDb3VudGAgaW4gY2FzZSB0aGUgYmVuY2htYXJrIGlzIHJlcnVuXG4gICAgICAgICAgYmVuY2guaW5pdENvdW50ID0gaW5pdENvdW50O1xuICAgICAgICAgIGJlbmNoLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgICB0aW1lcy5lbGFwc2VkID0gKG5vdyAtIHRpbWVzLnRpbWVTdGFtcCkgLyAxZTM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJlbmNoLmh6ICE9IEluZmluaXR5KSB7XG4gICAgICAgICAgYmVuY2guaHogPSAxIC8gbWVhbjtcbiAgICAgICAgICB0aW1lcy5jeWNsZSA9IG1lYW4gKiBiZW5jaC5jb3VudDtcbiAgICAgICAgICB0aW1lcy5wZXJpb2QgPSBtZWFuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBpZiB0aW1lIHBlcm1pdHMsIGluY3JlYXNlIHNhbXBsZSBzaXplIHRvIHJlZHVjZSB0aGUgbWFyZ2luIG9mIGVycm9yXG4gICAgICBpZiAocXVldWUubGVuZ3RoIDwgMiAmJiAhbWF4ZWRPdXQpIHtcbiAgICAgICAgZW5xdWV1ZSgpO1xuICAgICAgfVxuICAgICAgLy8gYWJvcnQgdGhlIGludm9rZSBjeWNsZSB3aGVuIGRvbmVcbiAgICAgIGV2ZW50LmFib3J0ZWQgPSBkb25lO1xuICAgIH1cblxuICAgIC8vIGluaXQgcXVldWUgYW5kIGJlZ2luXG4gICAgZW5xdWV1ZSgpO1xuICAgIGludm9rZShxdWV1ZSwge1xuICAgICAgJ25hbWUnOiAncnVuJyxcbiAgICAgICdhcmdzJzogeyAnYXN5bmMnOiBhc3luYyB9LFxuICAgICAgJ3F1ZXVlZCc6IHRydWUsXG4gICAgICAnb25DeWNsZSc6IGV2YWx1YXRlLFxuICAgICAgJ29uQ29tcGxldGUnOiBmdW5jdGlvbigpIHsgYmVuY2guZW1pdCgnY29tcGxldGUnKTsgfVxuICAgIH0pO1xuICB9XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLyoqXG4gICAqIEN5Y2xlcyBhIGJlbmNobWFyayB1bnRpbCBhIHJ1biBgY291bnRgIGNhbiBiZSBlc3RhYmxpc2hlZC5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtPYmplY3R9IGNsb25lIFRoZSBjbG9uZWQgYmVuY2htYXJrIGluc3RhbmNlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFRoZSBvcHRpb25zIG9iamVjdC5cbiAgICovXG4gIGZ1bmN0aW9uIGN5Y2xlKGNsb25lLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcblxuICAgIHZhciBkZWZlcnJlZDtcbiAgICBpZiAoY2xvbmUgaW5zdGFuY2VvZiBEZWZlcnJlZCkge1xuICAgICAgZGVmZXJyZWQgPSBjbG9uZTtcbiAgICAgIGNsb25lID0gY2xvbmUuYmVuY2htYXJrO1xuICAgIH1cblxuICAgIHZhciBjbG9ja2VkLFxuICAgICAgICBjeWNsZXMsXG4gICAgICAgIGRpdmlzb3IsXG4gICAgICAgIGV2ZW50LFxuICAgICAgICBtaW5UaW1lLFxuICAgICAgICBwZXJpb2QsXG4gICAgICAgIGFzeW5jID0gb3B0aW9ucy5hc3luYyxcbiAgICAgICAgYmVuY2ggPSBjbG9uZS5fb3JpZ2luYWwsXG4gICAgICAgIGNvdW50ID0gY2xvbmUuY291bnQsXG4gICAgICAgIHRpbWVzID0gY2xvbmUudGltZXM7XG5cbiAgICAvLyBjb250aW51ZSwgaWYgbm90IGFib3J0ZWQgYmV0d2VlbiBjeWNsZXNcbiAgICBpZiAoY2xvbmUucnVubmluZykge1xuICAgICAgLy8gYG1pblRpbWVgIGlzIHNldCB0byBgQmVuY2htYXJrLm9wdGlvbnMubWluVGltZWAgaW4gYGNsb2NrKClgXG4gICAgICBjeWNsZXMgPSArK2Nsb25lLmN5Y2xlcztcbiAgICAgIGNsb2NrZWQgPSBkZWZlcnJlZCA/IGRlZmVycmVkLmVsYXBzZWQgOiBjbG9jayhjbG9uZSk7XG4gICAgICBtaW5UaW1lID0gY2xvbmUubWluVGltZTtcblxuICAgICAgaWYgKGN5Y2xlcyA+IGJlbmNoLmN5Y2xlcykge1xuICAgICAgICBiZW5jaC5jeWNsZXMgPSBjeWNsZXM7XG4gICAgICB9XG4gICAgICBpZiAoY2xvbmUuZXJyb3IpIHtcbiAgICAgICAgZXZlbnQgPSBFdmVudCgnZXJyb3InKTtcbiAgICAgICAgZXZlbnQubWVzc2FnZSA9IGNsb25lLmVycm9yO1xuICAgICAgICBjbG9uZS5lbWl0KGV2ZW50KTtcbiAgICAgICAgaWYgKCFldmVudC5jYW5jZWxsZWQpIHtcbiAgICAgICAgICBjbG9uZS5hYm9ydCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gY29udGludWUsIGlmIG5vdCBlcnJvcmVkXG4gICAgaWYgKGNsb25lLnJ1bm5pbmcpIHtcbiAgICAgIC8vIHRpbWUgdGFrZW4gdG8gY29tcGxldGUgbGFzdCB0ZXN0IGN5Y2xlXG4gICAgICBiZW5jaC50aW1lcy5jeWNsZSA9IHRpbWVzLmN5Y2xlID0gY2xvY2tlZDtcbiAgICAgIC8vIHNlY29uZHMgcGVyIG9wZXJhdGlvblxuICAgICAgcGVyaW9kID0gYmVuY2gudGltZXMucGVyaW9kID0gdGltZXMucGVyaW9kID0gY2xvY2tlZCAvIGNvdW50O1xuICAgICAgLy8gb3BzIHBlciBzZWNvbmRcbiAgICAgIGJlbmNoLmh6ID0gY2xvbmUuaHogPSAxIC8gcGVyaW9kO1xuICAgICAgLy8gYXZvaWQgd29ya2luZyBvdXIgd2F5IHVwIHRvIHRoaXMgbmV4dCB0aW1lXG4gICAgICBiZW5jaC5pbml0Q291bnQgPSBjbG9uZS5pbml0Q291bnQgPSBjb3VudDtcbiAgICAgIC8vIGRvIHdlIG5lZWQgdG8gZG8gYW5vdGhlciBjeWNsZT9cbiAgICAgIGNsb25lLnJ1bm5pbmcgPSBjbG9ja2VkIDwgbWluVGltZTtcblxuICAgICAgaWYgKGNsb25lLnJ1bm5pbmcpIHtcbiAgICAgICAgLy8gdGVzdHMgbWF5IGNsb2NrIGF0IGAwYCB3aGVuIGBpbml0Q291bnRgIGlzIGEgc21hbGwgbnVtYmVyLFxuICAgICAgICAvLyB0byBhdm9pZCB0aGF0IHdlIHNldCBpdHMgY291bnQgdG8gc29tZXRoaW5nIGEgYml0IGhpZ2hlclxuICAgICAgICBpZiAoIWNsb2NrZWQgJiYgKGRpdmlzb3IgPSBkaXZpc29yc1tjbG9uZS5jeWNsZXNdKSAhPSBudWxsKSB7XG4gICAgICAgICAgY291bnQgPSBmbG9vcig0ZTYgLyBkaXZpc29yKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBjYWxjdWxhdGUgaG93IG1hbnkgbW9yZSBpdGVyYXRpb25zIGl0IHdpbGwgdGFrZSB0byBhY2hpdmUgdGhlIGBtaW5UaW1lYFxuICAgICAgICBpZiAoY291bnQgPD0gY2xvbmUuY291bnQpIHtcbiAgICAgICAgICBjb3VudCArPSBNYXRoLmNlaWwoKG1pblRpbWUgLSBjbG9ja2VkKSAvIHBlcmlvZCk7XG4gICAgICAgIH1cbiAgICAgICAgY2xvbmUucnVubmluZyA9IGNvdW50ICE9IEluZmluaXR5O1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBzaG91bGQgd2UgZXhpdCBlYXJseT9cbiAgICBldmVudCA9IEV2ZW50KCdjeWNsZScpO1xuICAgIGNsb25lLmVtaXQoZXZlbnQpO1xuICAgIGlmIChldmVudC5hYm9ydGVkKSB7XG4gICAgICBjbG9uZS5hYm9ydCgpO1xuICAgIH1cbiAgICAvLyBmaWd1cmUgb3V0IHdoYXQgdG8gZG8gbmV4dFxuICAgIGlmIChjbG9uZS5ydW5uaW5nKSB7XG4gICAgICAvLyBzdGFydCBhIG5ldyBjeWNsZVxuICAgICAgY2xvbmUuY291bnQgPSBjb3VudDtcbiAgICAgIGlmIChkZWZlcnJlZCkge1xuICAgICAgICBjbG9uZS5jb21waWxlZC5jYWxsKGRlZmVycmVkLCB0aW1lcik7XG4gICAgICB9IGVsc2UgaWYgKGFzeW5jKSB7XG4gICAgICAgIGRlbGF5KGNsb25lLCBmdW5jdGlvbigpIHsgY3ljbGUoY2xvbmUsIG9wdGlvbnMpOyB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN5Y2xlKGNsb25lKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBmaXggVHJhY2VNb25rZXkgYnVnIGFzc29jaWF0ZWQgd2l0aCBjbG9jayBmYWxsYmFja3NcbiAgICAgIC8vIGh0dHA6Ly9idWd6aWwubGEvNTA5MDY5XG4gICAgICBpZiAoc3VwcG9ydC5icm93c2VyKSB7XG4gICAgICAgIHJ1blNjcmlwdCh1aWQgKyAnPTE7ZGVsZXRlICcgKyB1aWQpO1xuICAgICAgfVxuICAgICAgLy8gZG9uZVxuICAgICAgY2xvbmUuZW1pdCgnY29tcGxldGUnKTtcbiAgICB9XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogUnVucyB0aGUgYmVuY2htYXJrLlxuICAgKlxuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gT3B0aW9ucyBvYmplY3QuXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBiZW5jaG1hcmsgaW5zdGFuY2UuXG4gICAqIEBleGFtcGxlXG4gICAqXG4gICAqIC8vIGJhc2ljIHVzYWdlXG4gICAqIGJlbmNoLnJ1bigpO1xuICAgKlxuICAgKiAvLyBvciB3aXRoIG9wdGlvbnNcbiAgICogYmVuY2gucnVuKHsgJ2FzeW5jJzogdHJ1ZSB9KTtcbiAgICovXG4gIGZ1bmN0aW9uIHJ1bihvcHRpb25zKSB7XG4gICAgdmFyIG1lID0gdGhpcyxcbiAgICAgICAgZXZlbnQgPSBFdmVudCgnc3RhcnQnKTtcblxuICAgIC8vIHNldCBgcnVubmluZ2AgdG8gYGZhbHNlYCBzbyBgcmVzZXQoKWAgd29uJ3QgY2FsbCBgYWJvcnQoKWBcbiAgICBtZS5ydW5uaW5nID0gZmFsc2U7XG4gICAgbWUucmVzZXQoKTtcbiAgICBtZS5ydW5uaW5nID0gdHJ1ZTtcblxuICAgIG1lLmNvdW50ID0gbWUuaW5pdENvdW50O1xuICAgIG1lLnRpbWVzLnRpbWVTdGFtcCA9ICtuZXcgRGF0ZTtcbiAgICBtZS5lbWl0KGV2ZW50KTtcblxuICAgIGlmICghZXZlbnQuY2FuY2VsbGVkKSB7XG4gICAgICBvcHRpb25zID0geyAnYXN5bmMnOiAoKG9wdGlvbnMgPSBvcHRpb25zICYmIG9wdGlvbnMuYXN5bmMpID09IG51bGwgPyBtZS5hc3luYyA6IG9wdGlvbnMpICYmIHN1cHBvcnQudGltZW91dCB9O1xuXG4gICAgICAvLyBmb3IgY2xvbmVzIGNyZWF0ZWQgd2l0aGluIGBjb21wdXRlKClgXG4gICAgICBpZiAobWUuX29yaWdpbmFsKSB7XG4gICAgICAgIGlmIChtZS5kZWZlcikge1xuICAgICAgICAgIERlZmVycmVkKG1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjeWNsZShtZSwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGZvciBvcmlnaW5hbCBiZW5jaG1hcmtzXG4gICAgICBlbHNlIHtcbiAgICAgICAgY29tcHV0ZShtZSwgb3B0aW9ucyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtZTtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8vIEZpcmVmb3ggMSBlcnJvbmVvdXNseSBkZWZpbmVzIHZhcmlhYmxlIGFuZCBhcmd1bWVudCBuYW1lcyBvZiBmdW5jdGlvbnMgb25cbiAgLy8gdGhlIGZ1bmN0aW9uIGl0c2VsZiBhcyBub24tY29uZmlndXJhYmxlIHByb3BlcnRpZXMgd2l0aCBgdW5kZWZpbmVkYCB2YWx1ZXMuXG4gIC8vIFRoZSBidWdnaW5lc3MgY29udGludWVzIGFzIHRoZSBgQmVuY2htYXJrYCBjb25zdHJ1Y3RvciBoYXMgYW4gYXJndW1lbnRcbiAgLy8gbmFtZWQgYG9wdGlvbnNgIGFuZCBGaXJlZm94IDEgd2lsbCBub3QgYXNzaWduIGEgdmFsdWUgdG8gYEJlbmNobWFyay5vcHRpb25zYCxcbiAgLy8gbWFraW5nIGl0IG5vbi13cml0YWJsZSBpbiB0aGUgcHJvY2VzcywgdW5sZXNzIGl0IGlzIHRoZSBmaXJzdCBwcm9wZXJ0eVxuICAvLyBhc3NpZ25lZCBieSBmb3ItaW4gbG9vcCBvZiBgZXh0ZW5kKClgLlxuICBleHRlbmQoQmVuY2htYXJrLCB7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZGVmYXVsdCBvcHRpb25zIGNvcGllZCBieSBiZW5jaG1hcmsgaW5zdGFuY2VzLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgKi9cbiAgICAnb3B0aW9ucyc6IHtcblxuICAgICAgLyoqXG4gICAgICAgKiBBIGZsYWcgdG8gaW5kaWNhdGUgdGhhdCBiZW5jaG1hcmsgY3ljbGVzIHdpbGwgZXhlY3V0ZSBhc3luY2hyb25vdXNseVxuICAgICAgICogYnkgZGVmYXVsdC5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLm9wdGlvbnNcbiAgICAgICAqIEB0eXBlIEJvb2xlYW5cbiAgICAgICAqL1xuICAgICAgJ2FzeW5jJzogZmFsc2UsXG5cbiAgICAgIC8qKlxuICAgICAgICogQSBmbGFnIHRvIGluZGljYXRlIHRoYXQgdGhlIGJlbmNobWFyayBjbG9jayBpcyBkZWZlcnJlZC5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLm9wdGlvbnNcbiAgICAgICAqIEB0eXBlIEJvb2xlYW5cbiAgICAgICAqL1xuICAgICAgJ2RlZmVyJzogZmFsc2UsXG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIGRlbGF5IGJldHdlZW4gdGVzdCBjeWNsZXMgKHNlY3MpLlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyay5vcHRpb25zXG4gICAgICAgKiBAdHlwZSBOdW1iZXJcbiAgICAgICAqL1xuICAgICAgJ2RlbGF5JzogMC4wMDUsXG5cbiAgICAgIC8qKlxuICAgICAgICogRGlzcGxheWVkIGJ5IEJlbmNobWFyayN0b1N0cmluZyB3aGVuIGEgYG5hbWVgIGlzIG5vdCBhdmFpbGFibGVcbiAgICAgICAqIChhdXRvLWdlbmVyYXRlZCBpZiBhYnNlbnQpLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsub3B0aW9uc1xuICAgICAgICogQHR5cGUgU3RyaW5nXG4gICAgICAgKi9cbiAgICAgICdpZCc6IHVuZGVmaW5lZCxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgZGVmYXVsdCBudW1iZXIgb2YgdGltZXMgdG8gZXhlY3V0ZSBhIHRlc3Qgb24gYSBiZW5jaG1hcmsncyBmaXJzdCBjeWNsZS5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLm9wdGlvbnNcbiAgICAgICAqIEB0eXBlIE51bWJlclxuICAgICAgICovXG4gICAgICAnaW5pdENvdW50JzogMSxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgbWF4aW11bSB0aW1lIGEgYmVuY2htYXJrIGlzIGFsbG93ZWQgdG8gcnVuIGJlZm9yZSBmaW5pc2hpbmcgKHNlY3MpLlxuICAgICAgICpcbiAgICAgICAqIE5vdGU6IEN5Y2xlIGRlbGF5cyBhcmVuJ3QgY291bnRlZCB0b3dhcmQgdGhlIG1heGltdW0gdGltZS5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLm9wdGlvbnNcbiAgICAgICAqIEB0eXBlIE51bWJlclxuICAgICAgICovXG4gICAgICAnbWF4VGltZSc6IDUsXG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIG1pbmltdW0gc2FtcGxlIHNpemUgcmVxdWlyZWQgdG8gcGVyZm9ybSBzdGF0aXN0aWNhbCBhbmFseXNpcy5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLm9wdGlvbnNcbiAgICAgICAqIEB0eXBlIE51bWJlclxuICAgICAgICovXG4gICAgICAnbWluU2FtcGxlcyc6IDUsXG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIHRpbWUgbmVlZGVkIHRvIHJlZHVjZSB0aGUgcGVyY2VudCB1bmNlcnRhaW50eSBvZiBtZWFzdXJlbWVudCB0byAxJSAoc2VjcykuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyay5vcHRpb25zXG4gICAgICAgKiBAdHlwZSBOdW1iZXJcbiAgICAgICAqL1xuICAgICAgJ21pblRpbWUnOiAwLFxuXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBuYW1lIG9mIHRoZSBiZW5jaG1hcmsuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyay5vcHRpb25zXG4gICAgICAgKiBAdHlwZSBTdHJpbmdcbiAgICAgICAqL1xuICAgICAgJ25hbWUnOiB1bmRlZmluZWQsXG5cbiAgICAgIC8qKlxuICAgICAgICogQW4gZXZlbnQgbGlzdGVuZXIgY2FsbGVkIHdoZW4gdGhlIGJlbmNobWFyayBpcyBhYm9ydGVkLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsub3B0aW9uc1xuICAgICAgICogQHR5cGUgRnVuY3Rpb25cbiAgICAgICAqL1xuICAgICAgJ29uQWJvcnQnOiB1bmRlZmluZWQsXG5cbiAgICAgIC8qKlxuICAgICAgICogQW4gZXZlbnQgbGlzdGVuZXIgY2FsbGVkIHdoZW4gdGhlIGJlbmNobWFyayBjb21wbGV0ZXMgcnVubmluZy5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLm9wdGlvbnNcbiAgICAgICAqIEB0eXBlIEZ1bmN0aW9uXG4gICAgICAgKi9cbiAgICAgICdvbkNvbXBsZXRlJzogdW5kZWZpbmVkLFxuXG4gICAgICAvKipcbiAgICAgICAqIEFuIGV2ZW50IGxpc3RlbmVyIGNhbGxlZCBhZnRlciBlYWNoIHJ1biBjeWNsZS5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLm9wdGlvbnNcbiAgICAgICAqIEB0eXBlIEZ1bmN0aW9uXG4gICAgICAgKi9cbiAgICAgICdvbkN5Y2xlJzogdW5kZWZpbmVkLFxuXG4gICAgICAvKipcbiAgICAgICAqIEFuIGV2ZW50IGxpc3RlbmVyIGNhbGxlZCB3aGVuIGEgdGVzdCBlcnJvcnMuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyay5vcHRpb25zXG4gICAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAgICovXG4gICAgICAnb25FcnJvcic6IHVuZGVmaW5lZCxcblxuICAgICAgLyoqXG4gICAgICAgKiBBbiBldmVudCBsaXN0ZW5lciBjYWxsZWQgd2hlbiB0aGUgYmVuY2htYXJrIGlzIHJlc2V0LlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsub3B0aW9uc1xuICAgICAgICogQHR5cGUgRnVuY3Rpb25cbiAgICAgICAqL1xuICAgICAgJ29uUmVzZXQnOiB1bmRlZmluZWQsXG5cbiAgICAgIC8qKlxuICAgICAgICogQW4gZXZlbnQgbGlzdGVuZXIgY2FsbGVkIHdoZW4gdGhlIGJlbmNobWFyayBzdGFydHMgcnVubmluZy5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLm9wdGlvbnNcbiAgICAgICAqIEB0eXBlIEZ1bmN0aW9uXG4gICAgICAgKi9cbiAgICAgICdvblN0YXJ0JzogdW5kZWZpbmVkXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBsYXRmb3JtIG9iamVjdCB3aXRoIHByb3BlcnRpZXMgZGVzY3JpYmluZyB0aGluZ3MgbGlrZSBicm93c2VyIG5hbWUsXG4gICAgICogdmVyc2lvbiwgYW5kIG9wZXJhdGluZyBzeXN0ZW0uXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAqL1xuICAgICdwbGF0Zm9ybSc6IHJlcSgncGxhdGZvcm0nKSB8fCB3aW5kb3cucGxhdGZvcm0gfHwge1xuXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBwbGF0Zm9ybSBkZXNjcmlwdGlvbi5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLnBsYXRmb3JtXG4gICAgICAgKiBAdHlwZSBTdHJpbmdcbiAgICAgICAqL1xuICAgICAgJ2Rlc2NyaXB0aW9uJzogd2luZG93Lm5hdmlnYXRvciAmJiBuYXZpZ2F0b3IudXNlckFnZW50IHx8IG51bGwsXG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIG5hbWUgb2YgdGhlIGJyb3dzZXIgbGF5b3V0IGVuZ2luZS5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLnBsYXRmb3JtXG4gICAgICAgKiBAdHlwZSBTdHJpbmd8TnVsbFxuICAgICAgICovXG4gICAgICAnbGF5b3V0JzogbnVsbCxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgbmFtZSBvZiB0aGUgcHJvZHVjdCBob3N0aW5nIHRoZSBicm93c2VyLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsucGxhdGZvcm1cbiAgICAgICAqIEB0eXBlIFN0cmluZ3xOdWxsXG4gICAgICAgKi9cbiAgICAgICdwcm9kdWN0JzogbnVsbCxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgbmFtZSBvZiB0aGUgYnJvd3Nlci9lbnZpcm9ubWVudC5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLnBsYXRmb3JtXG4gICAgICAgKiBAdHlwZSBTdHJpbmd8TnVsbFxuICAgICAgICovXG4gICAgICAnbmFtZSc6IG51bGwsXG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIG5hbWUgb2YgdGhlIHByb2R1Y3QncyBtYW51ZmFjdHVyZXIuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyay5wbGF0Zm9ybVxuICAgICAgICogQHR5cGUgU3RyaW5nfE51bGxcbiAgICAgICAqL1xuICAgICAgJ21hbnVmYWN0dXJlcic6IG51bGwsXG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIG5hbWUgb2YgdGhlIG9wZXJhdGluZyBzeXN0ZW0uXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyay5wbGF0Zm9ybVxuICAgICAgICogQHR5cGUgU3RyaW5nfE51bGxcbiAgICAgICAqL1xuICAgICAgJ29zJzogbnVsbCxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgYWxwaGEvYmV0YSByZWxlYXNlIGluZGljYXRvci5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLnBsYXRmb3JtXG4gICAgICAgKiBAdHlwZSBTdHJpbmd8TnVsbFxuICAgICAgICovXG4gICAgICAncHJlcmVsZWFzZSc6IG51bGwsXG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIGJyb3dzZXIvZW52aXJvbm1lbnQgdmVyc2lvbi5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLnBsYXRmb3JtXG4gICAgICAgKiBAdHlwZSBTdHJpbmd8TnVsbFxuICAgICAgICovXG4gICAgICAndmVyc2lvbic6IG51bGwsXG5cbiAgICAgIC8qKlxuICAgICAgICogUmV0dXJuIHBsYXRmb3JtIGRlc2NyaXB0aW9uIHdoZW4gdGhlIHBsYXRmb3JtIG9iamVjdCBpcyBjb2VyY2VkIHRvIGEgc3RyaW5nLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsucGxhdGZvcm1cbiAgICAgICAqIEB0eXBlIEZ1bmN0aW9uXG4gICAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgcGxhdGZvcm0gZGVzY3JpcHRpb24uXG4gICAgICAgKi9cbiAgICAgICd0b1N0cmluZyc6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kZXNjcmlwdGlvbiB8fCAnJztcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVGhlIHNlbWFudGljIHZlcnNpb24gbnVtYmVyLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICAgKiBAdHlwZSBTdHJpbmdcbiAgICAgKi9cbiAgICAndmVyc2lvbic6ICcxLjAuMCcsXG5cbiAgICAvLyBhbiBvYmplY3Qgb2YgZW52aXJvbm1lbnQvZmVhdHVyZSBkZXRlY3Rpb24gZmxhZ3NcbiAgICAnc3VwcG9ydCc6IHN1cHBvcnQsXG5cbiAgICAvLyBjbG9uZSBvYmplY3RzXG4gICAgJ2RlZXBDbG9uZSc6IGRlZXBDbG9uZSxcblxuICAgIC8vIGl0ZXJhdGlvbiB1dGlsaXR5XG4gICAgJ2VhY2gnOiBlYWNoLFxuXG4gICAgLy8gYXVnbWVudCBvYmplY3RzXG4gICAgJ2V4dGVuZCc6IGV4dGVuZCxcblxuICAgIC8vIGdlbmVyaWMgQXJyYXkjZmlsdGVyXG4gICAgJ2ZpbHRlcic6IGZpbHRlcixcblxuICAgIC8vIGdlbmVyaWMgQXJyYXkjZm9yRWFjaFxuICAgICdmb3JFYWNoJzogZm9yRWFjaCxcblxuICAgIC8vIGdlbmVyaWMgb3duIHByb3BlcnR5IGl0ZXJhdGlvbiB1dGlsaXR5XG4gICAgJ2Zvck93bic6IGZvck93bixcblxuICAgIC8vIGNvbnZlcnRzIGEgbnVtYmVyIHRvIGEgY29tbWEtc2VwYXJhdGVkIHN0cmluZ1xuICAgICdmb3JtYXROdW1iZXInOiBmb3JtYXROdW1iZXIsXG5cbiAgICAvLyBnZW5lcmljIE9iamVjdCNoYXNPd25Qcm9wZXJ0eVxuICAgIC8vICh0cmlnZ2VyIGhhc0tleSdzIGxhenkgZGVmaW5lIGJlZm9yZSBhc3NpZ25pbmcgaXQgdG8gQmVuY2htYXJrKVxuICAgICdoYXNLZXknOiAoaGFzS2V5KEJlbmNobWFyaywgJycpLCBoYXNLZXkpLFxuXG4gICAgLy8gZ2VuZXJpYyBBcnJheSNpbmRleE9mXG4gICAgJ2luZGV4T2YnOiBpbmRleE9mLFxuXG4gICAgLy8gdGVtcGxhdGUgdXRpbGl0eVxuICAgICdpbnRlcnBvbGF0ZSc6IGludGVycG9sYXRlLFxuXG4gICAgLy8gaW52b2tlcyBhIG1ldGhvZCBvbiBlYWNoIGl0ZW0gaW4gYW4gYXJyYXlcbiAgICAnaW52b2tlJzogaW52b2tlLFxuXG4gICAgLy8gZ2VuZXJpYyBBcnJheSNqb2luIGZvciBhcnJheXMgYW5kIG9iamVjdHNcbiAgICAnam9pbic6IGpvaW4sXG5cbiAgICAvLyBnZW5lcmljIEFycmF5I21hcFxuICAgICdtYXAnOiBtYXAsXG5cbiAgICAvLyByZXRyaWV2ZXMgYSBwcm9wZXJ0eSB2YWx1ZSBmcm9tIGVhY2ggaXRlbSBpbiBhbiBhcnJheVxuICAgICdwbHVjayc6IHBsdWNrLFxuXG4gICAgLy8gZ2VuZXJpYyBBcnJheSNyZWR1Y2VcbiAgICAncmVkdWNlJzogcmVkdWNlXG4gIH0pO1xuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIGV4dGVuZChCZW5jaG1hcmsucHJvdG90eXBlLCB7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbnVtYmVyIG9mIHRpbWVzIGEgdGVzdCB3YXMgZXhlY3V0ZWQuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAgICogQHR5cGUgTnVtYmVyXG4gICAgICovXG4gICAgJ2NvdW50JzogMCxcblxuICAgIC8qKlxuICAgICAqIFRoZSBudW1iZXIgb2YgY3ljbGVzIHBlcmZvcm1lZCB3aGlsZSBiZW5jaG1hcmtpbmcuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAgICogQHR5cGUgTnVtYmVyXG4gICAgICovXG4gICAgJ2N5Y2xlcyc6IDAsXG5cbiAgICAvKipcbiAgICAgKiBUaGUgbnVtYmVyIG9mIGV4ZWN1dGlvbnMgcGVyIHNlY29uZC5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICAgKiBAdHlwZSBOdW1iZXJcbiAgICAgKi9cbiAgICAnaHonOiAwLFxuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBpbGVkIHRlc3QgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAgICogQHR5cGUgRnVuY3Rpb258U3RyaW5nXG4gICAgICovXG4gICAgJ2NvbXBpbGVkJzogdW5kZWZpbmVkLFxuXG4gICAgLyoqXG4gICAgICogVGhlIGVycm9yIG9iamVjdCBpZiB0aGUgdGVzdCBmYWlsZWQuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAgICogQHR5cGUgT2JqZWN0XG4gICAgICovXG4gICAgJ2Vycm9yJzogdW5kZWZpbmVkLFxuXG4gICAgLyoqXG4gICAgICogVGhlIHRlc3QgdG8gYmVuY2htYXJrLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgICAqIEB0eXBlIEZ1bmN0aW9ufFN0cmluZ1xuICAgICAqL1xuICAgICdmbic6IHVuZGVmaW5lZCxcblxuICAgIC8qKlxuICAgICAqIEEgZmxhZyB0byBpbmRpY2F0ZSBpZiB0aGUgYmVuY2htYXJrIGlzIGFib3J0ZWQuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAgICogQHR5cGUgQm9vbGVhblxuICAgICAqL1xuICAgICdhYm9ydGVkJzogZmFsc2UsXG5cbiAgICAvKipcbiAgICAgKiBBIGZsYWcgdG8gaW5kaWNhdGUgaWYgdGhlIGJlbmNobWFyayBpcyBydW5uaW5nLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgICAqIEB0eXBlIEJvb2xlYW5cbiAgICAgKi9cbiAgICAncnVubmluZyc6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogQ29tcGlsZWQgaW50byB0aGUgdGVzdCBhbmQgZXhlY3V0ZWQgaW1tZWRpYXRlbHkgKipiZWZvcmUqKiB0aGUgdGVzdCBsb29wLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgICAqIEB0eXBlIEZ1bmN0aW9ufFN0cmluZ1xuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAvLyBiYXNpYyB1c2FnZVxuICAgICAqIHZhciBiZW5jaCA9IEJlbmNobWFyayh7XG4gICAgICogICAnc2V0dXAnOiBmdW5jdGlvbigpIHtcbiAgICAgKiAgICAgdmFyIGMgPSB0aGlzLmNvdW50LFxuICAgICAqICAgICAgICAgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXInKTtcbiAgICAgKiAgICAgd2hpbGUgKGMtLSkge1xuICAgICAqICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpO1xuICAgICAqICAgICB9XG4gICAgICogICB9LFxuICAgICAqICAgJ2ZuJzogZnVuY3Rpb24oKSB7XG4gICAgICogICAgIGVsZW1lbnQucmVtb3ZlQ2hpbGQoZWxlbWVudC5sYXN0Q2hpbGQpO1xuICAgICAqICAgfVxuICAgICAqIH0pO1xuICAgICAqXG4gICAgICogLy8gY29tcGlsZXMgdG8gc29tZXRoaW5nIGxpa2U6XG4gICAgICogdmFyIGMgPSB0aGlzLmNvdW50LFxuICAgICAqICAgICBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lcicpO1xuICAgICAqIHdoaWxlIChjLS0pIHtcbiAgICAgKiAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpO1xuICAgICAqIH1cbiAgICAgKiB2YXIgc3RhcnQgPSBuZXcgRGF0ZTtcbiAgICAgKiB3aGlsZSAoY291bnQtLSkge1xuICAgICAqICAgZWxlbWVudC5yZW1vdmVDaGlsZChlbGVtZW50Lmxhc3RDaGlsZCk7XG4gICAgICogfVxuICAgICAqIHZhciBlbmQgPSBuZXcgRGF0ZSAtIHN0YXJ0O1xuICAgICAqXG4gICAgICogLy8gb3IgdXNpbmcgc3RyaW5nc1xuICAgICAqIHZhciBiZW5jaCA9IEJlbmNobWFyayh7XG4gICAgICogICAnc2V0dXAnOiAnXFxcbiAgICAgKiAgICAgdmFyIGEgPSAwO1xcblxcXG4gICAgICogICAgIChmdW5jdGlvbigpIHtcXG5cXFxuICAgICAqICAgICAgIChmdW5jdGlvbigpIHtcXG5cXFxuICAgICAqICAgICAgICAgKGZ1bmN0aW9uKCkgeycsXG4gICAgICogICAnZm4nOiAnYSArPSAxOycsXG4gICAgICogICAndGVhcmRvd24nOiAnXFxcbiAgICAgKiAgICAgICAgICB9KCkpXFxuXFxcbiAgICAgKiAgICAgICAgfSgpKVxcblxcXG4gICAgICogICAgICB9KCkpJ1xuICAgICAqIH0pO1xuICAgICAqXG4gICAgICogLy8gY29tcGlsZXMgdG8gc29tZXRoaW5nIGxpa2U6XG4gICAgICogdmFyIGEgPSAwO1xuICAgICAqIChmdW5jdGlvbigpIHtcbiAgICAgKiAgIChmdW5jdGlvbigpIHtcbiAgICAgKiAgICAgKGZ1bmN0aW9uKCkge1xuICAgICAqICAgICAgIHZhciBzdGFydCA9IG5ldyBEYXRlO1xuICAgICAqICAgICAgIHdoaWxlIChjb3VudC0tKSB7XG4gICAgICogICAgICAgICBhICs9IDE7XG4gICAgICogICAgICAgfVxuICAgICAqICAgICAgIHZhciBlbmQgPSBuZXcgRGF0ZSAtIHN0YXJ0O1xuICAgICAqICAgICB9KCkpXG4gICAgICogICB9KCkpXG4gICAgICogfSgpKVxuICAgICAqL1xuICAgICdzZXR1cCc6IG5vb3AsXG5cbiAgICAvKipcbiAgICAgKiBDb21waWxlZCBpbnRvIHRoZSB0ZXN0IGFuZCBleGVjdXRlZCBpbW1lZGlhdGVseSAqKmFmdGVyKiogdGhlIHRlc3QgbG9vcC5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICAgKiBAdHlwZSBGdW5jdGlvbnxTdHJpbmdcbiAgICAgKi9cbiAgICAndGVhcmRvd24nOiBub29wLFxuXG4gICAgLyoqXG4gICAgICogQW4gb2JqZWN0IG9mIHN0YXRzIGluY2x1ZGluZyBtZWFuLCBtYXJnaW4gb3IgZXJyb3IsIGFuZCBzdGFuZGFyZCBkZXZpYXRpb24uXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAgICogQHR5cGUgT2JqZWN0XG4gICAgICovXG4gICAgJ3N0YXRzJzoge1xuXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBtYXJnaW4gb2YgZXJyb3IuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyayNzdGF0c1xuICAgICAgICogQHR5cGUgTnVtYmVyXG4gICAgICAgKi9cbiAgICAgICdtb2UnOiAwLFxuXG4gICAgICAvKipcbiAgICAgICAqIFRoZSByZWxhdGl2ZSBtYXJnaW4gb2YgZXJyb3IgKGV4cHJlc3NlZCBhcyBhIHBlcmNlbnRhZ2Ugb2YgdGhlIG1lYW4pLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsjc3RhdHNcbiAgICAgICAqIEB0eXBlIE51bWJlclxuICAgICAgICovXG4gICAgICAncm1lJzogMCxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgc3RhbmRhcmQgZXJyb3Igb2YgdGhlIG1lYW4uXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyayNzdGF0c1xuICAgICAgICogQHR5cGUgTnVtYmVyXG4gICAgICAgKi9cbiAgICAgICdzZW0nOiAwLFxuXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBzYW1wbGUgc3RhbmRhcmQgZGV2aWF0aW9uLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsjc3RhdHNcbiAgICAgICAqIEB0eXBlIE51bWJlclxuICAgICAgICovXG4gICAgICAnZGV2aWF0aW9uJzogMCxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgc2FtcGxlIGFyaXRobWV0aWMgbWVhbi5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrI3N0YXRzXG4gICAgICAgKiBAdHlwZSBOdW1iZXJcbiAgICAgICAqL1xuICAgICAgJ21lYW4nOiAwLFxuXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBhcnJheSBvZiBzYW1wbGVkIHBlcmlvZHMuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyayNzdGF0c1xuICAgICAgICogQHR5cGUgQXJyYXlcbiAgICAgICAqL1xuICAgICAgJ3NhbXBsZSc6IFtdLFxuXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBzYW1wbGUgdmFyaWFuY2UuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyayNzdGF0c1xuICAgICAgICogQHR5cGUgTnVtYmVyXG4gICAgICAgKi9cbiAgICAgICd2YXJpYW5jZSc6IDBcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQW4gb2JqZWN0IG9mIHRpbWluZyBkYXRhIGluY2x1ZGluZyBjeWNsZSwgZWxhcHNlZCwgcGVyaW9kLCBzdGFydCwgYW5kIHN0b3AuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAgICogQHR5cGUgT2JqZWN0XG4gICAgICovXG4gICAgJ3RpbWVzJzoge1xuXG4gICAgICAvKipcbiAgICAgICAqIFRoZSB0aW1lIHRha2VuIHRvIGNvbXBsZXRlIHRoZSBsYXN0IGN5Y2xlIChzZWNzKS5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrI3RpbWVzXG4gICAgICAgKiBAdHlwZSBOdW1iZXJcbiAgICAgICAqL1xuICAgICAgJ2N5Y2xlJzogMCxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgdGltZSB0YWtlbiB0byBjb21wbGV0ZSB0aGUgYmVuY2htYXJrIChzZWNzKS5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrI3RpbWVzXG4gICAgICAgKiBAdHlwZSBOdW1iZXJcbiAgICAgICAqL1xuICAgICAgJ2VsYXBzZWQnOiAwLFxuXG4gICAgICAvKipcbiAgICAgICAqIFRoZSB0aW1lIHRha2VuIHRvIGV4ZWN1dGUgdGhlIHRlc3Qgb25jZSAoc2VjcykuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyayN0aW1lc1xuICAgICAgICogQHR5cGUgTnVtYmVyXG4gICAgICAgKi9cbiAgICAgICdwZXJpb2QnOiAwLFxuXG4gICAgICAvKipcbiAgICAgICAqIEEgdGltZXN0YW1wIG9mIHdoZW4gdGhlIGJlbmNobWFyayBzdGFydGVkIChtcykuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyayN0aW1lc1xuICAgICAgICogQHR5cGUgTnVtYmVyXG4gICAgICAgKi9cbiAgICAgICd0aW1lU3RhbXAnOiAwXG4gICAgfSxcblxuICAgIC8vIGFib3J0cyBiZW5jaG1hcmsgKGRvZXMgbm90IHJlY29yZCB0aW1lcylcbiAgICAnYWJvcnQnOiBhYm9ydCxcblxuICAgIC8vIGNyZWF0ZXMgYSBuZXcgYmVuY2htYXJrIHVzaW5nIHRoZSBzYW1lIHRlc3QgYW5kIG9wdGlvbnNcbiAgICAnY2xvbmUnOiBjbG9uZSxcblxuICAgIC8vIGNvbXBhcmVzIGJlbmNobWFyaydzIGhlcnR6IHdpdGggYW5vdGhlclxuICAgICdjb21wYXJlJzogY29tcGFyZSxcblxuICAgIC8vIGV4ZWN1dGVzIGxpc3RlbmVyc1xuICAgICdlbWl0JzogZW1pdCxcblxuICAgIC8vIGdldCBsaXN0ZW5lcnNcbiAgICAnbGlzdGVuZXJzJzogbGlzdGVuZXJzLFxuXG4gICAgLy8gdW5yZWdpc3RlciBsaXN0ZW5lcnNcbiAgICAnb2ZmJzogb2ZmLFxuXG4gICAgLy8gcmVnaXN0ZXIgbGlzdGVuZXJzXG4gICAgJ29uJzogb24sXG5cbiAgICAvLyByZXNldCBiZW5jaG1hcmsgcHJvcGVydGllc1xuICAgICdyZXNldCc6IHJlc2V0LFxuXG4gICAgLy8gcnVucyB0aGUgYmVuY2htYXJrXG4gICAgJ3J1bic6IHJ1bixcblxuICAgIC8vIHByZXR0eSBwcmludCBiZW5jaG1hcmsgaW5mb1xuICAgICd0b1N0cmluZyc6IHRvU3RyaW5nQmVuY2hcbiAgfSk7XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgZXh0ZW5kKERlZmVycmVkLnByb3RvdHlwZSwge1xuXG4gICAgLyoqXG4gICAgICogVGhlIGRlZmVycmVkIGJlbmNobWFyayBpbnN0YW5jZS5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuRGVmZXJyZWRcbiAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgKi9cbiAgICAnYmVuY2htYXJrJzogbnVsbCxcblxuICAgIC8qKlxuICAgICAqIFRoZSBudW1iZXIgb2YgZGVmZXJyZWQgY3ljbGVzIHBlcmZvcm1lZCB3aGlsZSBiZW5jaG1hcmtpbmcuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLkRlZmVycmVkXG4gICAgICogQHR5cGUgTnVtYmVyXG4gICAgICovXG4gICAgJ2N5Y2xlcyc6IDAsXG5cbiAgICAvKipcbiAgICAgKiBUaGUgdGltZSB0YWtlbiB0byBjb21wbGV0ZSB0aGUgZGVmZXJyZWQgYmVuY2htYXJrIChzZWNzKS5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuRGVmZXJyZWRcbiAgICAgKiBAdHlwZSBOdW1iZXJcbiAgICAgKi9cbiAgICAnZWxhcHNlZCc6IDAsXG5cbiAgICAvKipcbiAgICAgKiBBIHRpbWVzdGFtcCBvZiB3aGVuIHRoZSBkZWZlcnJlZCBiZW5jaG1hcmsgc3RhcnRlZCAobXMpLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5EZWZlcnJlZFxuICAgICAqIEB0eXBlIE51bWJlclxuICAgICAqL1xuICAgICd0aW1lU3RhbXAnOiAwLFxuXG4gICAgLy8gY3ljbGVzL2NvbXBsZXRlcyB0aGUgZGVmZXJyZWQgYmVuY2htYXJrXG4gICAgJ3Jlc29sdmUnOiByZXNvbHZlXG4gIH0pO1xuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIGV4dGVuZChFdmVudC5wcm90b3R5cGUsIHtcblxuICAgIC8qKlxuICAgICAqIEEgZmxhZyB0byBpbmRpY2F0ZSBpZiB0aGUgZW1pdHRlcnMgbGlzdGVuZXIgaXRlcmF0aW9uIGlzIGFib3J0ZWQuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLkV2ZW50XG4gICAgICogQHR5cGUgQm9vbGVhblxuICAgICAqL1xuICAgICdhYm9ydGVkJzogZmFsc2UsXG5cbiAgICAvKipcbiAgICAgKiBBIGZsYWcgdG8gaW5kaWNhdGUgaWYgdGhlIGRlZmF1bHQgYWN0aW9uIGlzIGNhbmNlbGxlZC5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuRXZlbnRcbiAgICAgKiBAdHlwZSBCb29sZWFuXG4gICAgICovXG4gICAgJ2NhbmNlbGxlZCc6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogVGhlIG9iamVjdCB3aG9zZSBsaXN0ZW5lcnMgYXJlIGN1cnJlbnRseSBiZWluZyBwcm9jZXNzZWQuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLkV2ZW50XG4gICAgICogQHR5cGUgT2JqZWN0XG4gICAgICovXG4gICAgJ2N1cnJlbnRUYXJnZXQnOiB1bmRlZmluZWQsXG5cbiAgICAvKipcbiAgICAgKiBUaGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBsYXN0IGV4ZWN1dGVkIGxpc3RlbmVyLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5FdmVudFxuICAgICAqIEB0eXBlIE1peGVkXG4gICAgICovXG4gICAgJ3Jlc3VsdCc6IHVuZGVmaW5lZCxcblxuICAgIC8qKlxuICAgICAqIFRoZSBvYmplY3QgdG8gd2hpY2ggdGhlIGV2ZW50IHdhcyBvcmlnaW5hbGx5IGVtaXR0ZWQuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLkV2ZW50XG4gICAgICogQHR5cGUgT2JqZWN0XG4gICAgICovXG4gICAgJ3RhcmdldCc6IHVuZGVmaW5lZCxcblxuICAgIC8qKlxuICAgICAqIEEgdGltZXN0YW1wIG9mIHdoZW4gdGhlIGV2ZW50IHdhcyBjcmVhdGVkIChtcykuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLkV2ZW50XG4gICAgICogQHR5cGUgTnVtYmVyXG4gICAgICovXG4gICAgJ3RpbWVTdGFtcCc6IDAsXG5cbiAgICAvKipcbiAgICAgKiBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuRXZlbnRcbiAgICAgKiBAdHlwZSBTdHJpbmdcbiAgICAgKi9cbiAgICAndHlwZSc6ICcnXG4gIH0pO1xuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBUaGUgZGVmYXVsdCBvcHRpb25zIGNvcGllZCBieSBzdWl0ZSBpbnN0YW5jZXMuXG4gICAqXG4gICAqIEBzdGF0aWNcbiAgICogQG1lbWJlck9mIEJlbmNobWFyay5TdWl0ZVxuICAgKiBAdHlwZSBPYmplY3RcbiAgICovXG4gIFN1aXRlLm9wdGlvbnMgPSB7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbmFtZSBvZiB0aGUgc3VpdGUuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLlN1aXRlLm9wdGlvbnNcbiAgICAgKiBAdHlwZSBTdHJpbmdcbiAgICAgKi9cbiAgICAnbmFtZSc6IHVuZGVmaW5lZFxuICB9O1xuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIGV4dGVuZChTdWl0ZS5wcm90b3R5cGUsIHtcblxuICAgIC8qKlxuICAgICAqIFRoZSBudW1iZXIgb2YgYmVuY2htYXJrcyBpbiB0aGUgc3VpdGUuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLlN1aXRlXG4gICAgICogQHR5cGUgTnVtYmVyXG4gICAgICovXG4gICAgJ2xlbmd0aCc6IDAsXG5cbiAgICAvKipcbiAgICAgKiBBIGZsYWcgdG8gaW5kaWNhdGUgaWYgdGhlIHN1aXRlIGlzIGFib3J0ZWQuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLlN1aXRlXG4gICAgICogQHR5cGUgQm9vbGVhblxuICAgICAqL1xuICAgICdhYm9ydGVkJzogZmFsc2UsXG5cbiAgICAvKipcbiAgICAgKiBBIGZsYWcgdG8gaW5kaWNhdGUgaWYgdGhlIHN1aXRlIGlzIHJ1bm5pbmcuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLlN1aXRlXG4gICAgICogQHR5cGUgQm9vbGVhblxuICAgICAqL1xuICAgICdydW5uaW5nJzogZmFsc2UsXG5cbiAgICAvKipcbiAgICAgKiBBbiBgQXJyYXkjZm9yRWFjaGAgbGlrZSBtZXRob2QuXG4gICAgICogQ2FsbGJhY2tzIG1heSB0ZXJtaW5hdGUgdGhlIGxvb3AgYnkgZXhwbGljaXRseSByZXR1cm5pbmcgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHJldHVybnMge09iamVjdH0gVGhlIHN1aXRlIGl0ZXJhdGVkIG92ZXIuXG4gICAgICovXG4gICAgJ2ZvckVhY2gnOiBtZXRob2RpemUoZm9yRWFjaCksXG5cbiAgICAvKipcbiAgICAgKiBBbiBgQXJyYXkjaW5kZXhPZmAgbGlrZSBtZXRob2QuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLlN1aXRlXG4gICAgICogQHBhcmFtIHtNaXhlZH0gdmFsdWUgVGhlIHZhbHVlIHRvIHNlYXJjaCBmb3IuXG4gICAgICogQHJldHVybnMge051bWJlcn0gVGhlIGluZGV4IG9mIHRoZSBtYXRjaGVkIHZhbHVlIG9yIGAtMWAuXG4gICAgICovXG4gICAgJ2luZGV4T2YnOiBtZXRob2RpemUoaW5kZXhPZiksXG5cbiAgICAvKipcbiAgICAgKiBJbnZva2VzIGEgbWV0aG9kIG9uIGFsbCBiZW5jaG1hcmtzIGluIHRoZSBzdWl0ZS5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIG1ldGhvZCB0byBpbnZva2UgT1Igb3B0aW9ucyBvYmplY3QuXG4gICAgICogQHBhcmFtIHtNaXhlZH0gW2FyZzEsIGFyZzIsIC4uLl0gQXJndW1lbnRzIHRvIGludm9rZSB0aGUgbWV0aG9kIHdpdGguXG4gICAgICogQHJldHVybnMge0FycmF5fSBBIG5ldyBhcnJheSBvZiB2YWx1ZXMgcmV0dXJuZWQgZnJvbSBlYWNoIG1ldGhvZCBpbnZva2VkLlxuICAgICAqL1xuICAgICdpbnZva2UnOiBtZXRob2RpemUoaW52b2tlKSxcblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIHRoZSBzdWl0ZSBvZiBiZW5jaG1hcmtzIHRvIGEgc3RyaW5nLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5TdWl0ZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbc2VwYXJhdG9yPScsJ10gQSBzdHJpbmcgdG8gc2VwYXJhdGUgZWFjaCBlbGVtZW50IG9mIHRoZSBhcnJheS5cbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgc3RyaW5nLlxuICAgICAqL1xuICAgICdqb2luJzogW10uam9pbixcblxuICAgIC8qKlxuICAgICAqIEFuIGBBcnJheSNtYXBgIGxpa2UgbWV0aG9kLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5TdWl0ZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IEEgbmV3IGFycmF5IG9mIHZhbHVlcyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2suXG4gICAgICovXG4gICAgJ21hcCc6IG1ldGhvZGl6ZShtYXApLFxuXG4gICAgLyoqXG4gICAgICogUmV0cmlldmVzIHRoZSB2YWx1ZSBvZiBhIHNwZWNpZmllZCBwcm9wZXJ0eSBmcm9tIGFsbCBiZW5jaG1hcmtzIGluIHRoZSBzdWl0ZS5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcGVydHkgVGhlIHByb3BlcnR5IHRvIHBsdWNrLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgYXJyYXkgb2YgcHJvcGVydHkgdmFsdWVzLlxuICAgICAqL1xuICAgICdwbHVjayc6IG1ldGhvZGl6ZShwbHVjayksXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHRoZSBsYXN0IGJlbmNobWFyayBmcm9tIHRoZSBzdWl0ZSBhbmQgcmV0dXJucyBpdC5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGVcbiAgICAgKiBAcmV0dXJucyB7TWl4ZWR9IFRoZSByZW1vdmVkIGJlbmNobWFyay5cbiAgICAgKi9cbiAgICAncG9wJzogW10ucG9wLFxuXG4gICAgLyoqXG4gICAgICogQXBwZW5kcyBiZW5jaG1hcmtzIHRvIHRoZSBzdWl0ZS5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGVcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgc3VpdGUncyBuZXcgbGVuZ3RoLlxuICAgICAqL1xuICAgICdwdXNoJzogW10ucHVzaCxcblxuICAgIC8qKlxuICAgICAqIFNvcnRzIHRoZSBiZW5jaG1hcmtzIG9mIHRoZSBzdWl0ZS5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY29tcGFyZUZuPW51bGxdIEEgZnVuY3Rpb24gdGhhdCBkZWZpbmVzIHRoZSBzb3J0IG9yZGVyLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBzb3J0ZWQgc3VpdGUuXG4gICAgICovXG4gICAgJ3NvcnQnOiBbXS5zb3J0LFxuXG4gICAgLyoqXG4gICAgICogQW4gYEFycmF5I3JlZHVjZWAgbGlrZSBtZXRob2QuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLlN1aXRlXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICAgICAqIEBwYXJhbSB7TWl4ZWR9IGFjY3VtdWxhdG9yIEluaXRpYWwgdmFsdWUgb2YgdGhlIGFjY3VtdWxhdG9yLlxuICAgICAqIEByZXR1cm5zIHtNaXhlZH0gVGhlIGFjY3VtdWxhdG9yLlxuICAgICAqL1xuICAgICdyZWR1Y2UnOiBtZXRob2RpemUocmVkdWNlKSxcblxuICAgIC8vIGFib3J0cyBhbGwgYmVuY2htYXJrcyBpbiB0aGUgc3VpdGVcbiAgICAnYWJvcnQnOiBhYm9ydFN1aXRlLFxuXG4gICAgLy8gYWRkcyBhIGJlbmNobWFyayB0byB0aGUgc3VpdGVcbiAgICAnYWRkJzogYWRkLFxuXG4gICAgLy8gY3JlYXRlcyBhIG5ldyBzdWl0ZSB3aXRoIGNsb25lZCBiZW5jaG1hcmtzXG4gICAgJ2Nsb25lJzogY2xvbmVTdWl0ZSxcblxuICAgIC8vIGV4ZWN1dGVzIGxpc3RlbmVycyBvZiBhIHNwZWNpZmllZCB0eXBlXG4gICAgJ2VtaXQnOiBlbWl0LFxuXG4gICAgLy8gY3JlYXRlcyBhIG5ldyBzdWl0ZSBvZiBmaWx0ZXJlZCBiZW5jaG1hcmtzXG4gICAgJ2ZpbHRlcic6IGZpbHRlclN1aXRlLFxuXG4gICAgLy8gZ2V0IGxpc3RlbmVyc1xuICAgICdsaXN0ZW5lcnMnOiBsaXN0ZW5lcnMsXG5cbiAgICAvLyB1bnJlZ2lzdGVyIGxpc3RlbmVyc1xuICAgICdvZmYnOiBvZmYsXG5cbiAgIC8vIHJlZ2lzdGVyIGxpc3RlbmVyc1xuICAgICdvbic6IG9uLFxuXG4gICAgLy8gcmVzZXRzIGFsbCBiZW5jaG1hcmtzIGluIHRoZSBzdWl0ZVxuICAgICdyZXNldCc6IHJlc2V0U3VpdGUsXG5cbiAgICAvLyBydW5zIGFsbCBiZW5jaG1hcmtzIGluIHRoZSBzdWl0ZVxuICAgICdydW4nOiBydW5TdWl0ZSxcblxuICAgIC8vIGFycmF5IG1ldGhvZHNcbiAgICAnY29uY2F0JzogY29uY2F0LFxuXG4gICAgJ3JldmVyc2UnOiByZXZlcnNlLFxuXG4gICAgJ3NoaWZ0Jzogc2hpZnQsXG5cbiAgICAnc2xpY2UnOiBzbGljZSxcblxuICAgICdzcGxpY2UnOiBzcGxpY2UsXG5cbiAgICAndW5zaGlmdCc6IHVuc2hpZnRcbiAgfSk7XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLy8gZXhwb3NlIERlZmVycmVkLCBFdmVudCBhbmQgU3VpdGVcbiAgZXh0ZW5kKEJlbmNobWFyaywge1xuICAgICdEZWZlcnJlZCc6IERlZmVycmVkLFxuICAgICdFdmVudCc6IEV2ZW50LFxuICAgICdTdWl0ZSc6IFN1aXRlXG4gIH0pO1xuXG4gIC8vIGV4cG9zZSBCZW5jaG1hcmtcbiAgLy8gc29tZSBBTUQgYnVpbGQgb3B0aW1pemVycywgbGlrZSByLmpzLCBjaGVjayBmb3Igc3BlY2lmaWMgY29uZGl0aW9uIHBhdHRlcm5zIGxpa2UgdGhlIGZvbGxvd2luZzpcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gZGVmaW5lIGFzIGFuIGFub255bW91cyBtb2R1bGUgc28sIHRocm91Z2ggcGF0aCBtYXBwaW5nLCBpdCBjYW4gYmUgYWxpYXNlZFxuICAgIGRlZmluZShmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBCZW5jaG1hcms7XG4gICAgfSk7XG4gIH1cbiAgLy8gY2hlY2sgZm9yIGBleHBvcnRzYCBhZnRlciBgZGVmaW5lYCBpbiBjYXNlIGEgYnVpbGQgb3B0aW1pemVyIGFkZHMgYW4gYGV4cG9ydHNgIG9iamVjdFxuICBlbHNlIGlmIChmcmVlRXhwb3J0cykge1xuICAgIC8vIGluIE5vZGUuanMgb3IgUmluZ29KUyB2MC44LjArXG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmIG1vZHVsZS5leHBvcnRzID09IGZyZWVFeHBvcnRzKSB7XG4gICAgICAobW9kdWxlLmV4cG9ydHMgPSBCZW5jaG1hcmspLkJlbmNobWFyayA9IEJlbmNobWFyaztcbiAgICB9XG4gICAgLy8gaW4gTmFyd2hhbCBvciBSaW5nb0pTIHYwLjcuMC1cbiAgICBlbHNlIHtcbiAgICAgIGZyZWVFeHBvcnRzLkJlbmNobWFyayA9IEJlbmNobWFyaztcbiAgICB9XG4gIH1cbiAgLy8gaW4gYSBicm93c2VyIG9yIFJoaW5vXG4gIGVsc2Uge1xuICAgIC8vIHVzZSBzcXVhcmUgYnJhY2tldCBub3RhdGlvbiBzbyBDbG9zdXJlIENvbXBpbGVyIHdvbid0IG11bmdlIGBCZW5jaG1hcmtgXG4gICAgLy8gaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9jbG9zdXJlL2NvbXBpbGVyL2RvY3MvYXBpLXR1dG9yaWFsMy5odG1sI2V4cG9ydFxuICAgIHdpbmRvd1snQmVuY2htYXJrJ10gPSBCZW5jaG1hcms7XG4gIH1cblxuICAvLyB0cmlnZ2VyIGNsb2NrJ3MgbGF6eSBkZWZpbmUgZWFybHkgdG8gYXZvaWQgYSBzZWN1cml0eSBlcnJvclxuICBpZiAoc3VwcG9ydC5haXIpIHtcbiAgICBjbG9jayh7ICdfb3JpZ2luYWwnOiB7ICdmbic6IG5vb3AsICdjb3VudCc6IDEsICdvcHRpb25zJzoge30gfSB9KTtcbiAgfVxufSh0aGlzKSk7XG4iXSwibmFtZXMiOlsid2luZG93IiwidW5kZWZpbmVkIiwiY291bnRlciIsImRvYyIsImlzSG9zdFR5cGUiLCJkb2N1bWVudCIsImZyZWVEZWZpbmUiLCJkZWZpbmUiLCJhbWQiLCJmcmVlRXhwb3J0cyIsImV4cG9ydHMiLCJnbG9iYWwiLCJmcmVlUmVxdWlyZSIsInJlcXVpcmUiLCJnZXRBbGxLZXlzIiwiT2JqZWN0IiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsImdldERlc2NyaXB0b3IiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJoYXNPd25Qcm9wZXJ0eSIsImlzRXh0ZW5zaWJsZSIsIm1pY3JvdGltZU9iamVjdCIsInJlcSIsInBlcmZPYmplY3QiLCJwZXJmb3JtYW5jZSIsInBlcmZOYW1lIiwibm93Iiwid2Via2l0Tm93IiwicHJvY2Vzc09iamVjdCIsInByb2Nlc3MiLCJwcm9wZXJ0eUlzRW51bWVyYWJsZSIsInNldERlc2NyaXB0b3IiLCJkZWZpbmVQcm9wZXJ0eSIsInRvU3RyaW5nIiwidHJhc2giLCJjcmVhdGVFbGVtZW50IiwidWlkIiwiRGF0ZSIsImNhbGxlZEJ5IiwiZGl2aXNvcnMiLCJ0VGFibGUiLCJ1VGFibGUiLCJzdXBwb3J0IiwiYWlyIiwiaXNDbGFzc09mIiwicnVudGltZSIsImFyZ3VtZW50c0NsYXNzIiwiYXJndW1lbnRzIiwiYnJvd3NlciIsImNoYXJCeUluZGV4IiwiY2hhckJ5T3duSW5kZXgiLCJoYXNLZXkiLCJqYXZhIiwidGltZW91dCIsImRlY29tcGlsYXRpb24iLCJGdW5jdGlvbiIsIngiLCJlIiwibyIsImRlc2NyaXB0b3JzIiwidGVzdCIsInByb3RvdHlwZSIsIml0ZXJhdGVzT3duRmlyc3QiLCJwcm9wcyIsImN0b3IiLCJwcm9wIiwicHVzaCIsIm5vZGVDbGFzcyIsImNhbGwiLCJ0aW1lciIsIm5vQXJndW1lbnRzQ2xhc3MiLCJub0NoYXJCeUluZGV4Iiwibm9DaGFyQnlPd25JbmRleCIsImFicyIsIk1hdGgiLCJmbG9vciIsIm1heCIsIm1pbiIsInBvdyIsInNxcnQiLCJCZW5jaG1hcmsiLCJuYW1lIiwiZm4iLCJvcHRpb25zIiwibWUiLCJjb25zdHJ1Y3RvciIsInNldE9wdGlvbnMiLCJpZCIsInN0YXRzIiwiZGVlcENsb25lIiwidGltZXMiLCJEZWZlcnJlZCIsImNsb25lIiwiYmVuY2htYXJrIiwiY2xvY2siLCJFdmVudCIsInR5cGUiLCJleHRlbmQiLCJTdWl0ZSIsImNvbmNhdCIsInZhbHVlIiwiaiIsImxlbmd0aCIsInJlc3VsdCIsInNsaWNlIiwiaW5kZXgiLCJrIiwibCIsImluc2VydCIsInN0YXJ0IiwiZGVsZXRlQ291bnQiLCJlbGVtZW50cyIsImRlbGV0ZUVuZCIsImVsZW1lbnRDb3VudCIsIm9iamVjdCIsIkFycmF5IiwidGFpbCIsInJldmVyc2UiLCJ1cHBlckluZGV4IiwibWlkZGxlIiwic2hpZnQiLCJlbmQiLCJ0b0ludGVnZXIiLCJzcGxpY2UiLCJpc0Zpbml0ZSIsInVuc2hpZnQiLCJiaW5kIiwidGhpc0FyZyIsImFwcGx5IiwiY3JlYXRlRnVuY3Rpb24iLCJhcmdzIiwiYm9keSIsImFuY2hvciIsInJ1blNjcmlwdCIsIm5vb3AiLCJkZWxheSIsImJlbmNoIiwiX3RpbWVySWQiLCJzZXRUaW1lb3V0IiwiZGVzdHJveUVsZW1lbnQiLCJlbGVtZW50IiwiYXBwZW5kQ2hpbGQiLCJpbm5lckhUTUwiLCJmb3JQcm9wcyIsImZvclNoYWRvd2VkIiwic2tpcFNlZW4iLCJmb3JBcmdzIiwic2hhZG93ZWQiLCJlbnVtRmxhZyIsImtleSIsIktsYXNzIiwidmFsdWVPZiIsImNhbGxiYWNrIiwia2V5cyIsInNraXBDdG9yIiwiZG9uZSIsIndoaWNoIiwiYWxsRmxhZyIsIml0ZXJhdGVlIiwib3duRmxhZyIsInNlZW4iLCJza2lwUHJvdG8iLCJpc0FyZ3VtZW50cyIsInNwbGl0IiwiU3RyaW5nIiwiZ2V0Rmlyc3RBcmd1bWVudCIsImV4ZWMiLCJnZXRNZWFuIiwic2FtcGxlIiwicmVkdWNlIiwic3VtIiwiZ2V0U291cmNlIiwiYWx0U291cmNlIiwiaXNTdHJpbmdhYmxlIiwicmVwbGFjZSIsInByb3BlcnR5IiwiaXNQbGFpbk9iamVjdCIsInN1YlZhbHVlIiwic3ViS2V5IiwibWV0aG9kaXplIiwiY29kZSIsInNjcmlwdCIsInNpYmxpbmciLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsInBhcmVudCIsInBhcmVudE5vZGUiLCJwcmVmaXgiLCJjcmVhdGVUZXh0Tm9kZSIsImNsb25lTm9kZSIsInRleHQiLCJpbnNlcnRCZWZvcmUiLCJmb3JPd24iLCJmb3JFYWNoIiwib24iLCJ0b0xvd2VyQ2FzZSIsInJlc29sdmUiLCJfb3JpZ2luYWwiLCJhYm9ydGVkIiwidGVhcmRvd24iLCJydW5uaW5nIiwiY3ljbGUiLCJjeWNsZXMiLCJjb3VudCIsImNvbXBpbGVkIiwic3RvcCIsImFjY2Vzc29yIiwiY2lyY3VsYXIiLCJkZXNjcmlwdG9yIiwiZXh0ZW5zaWJsZSIsIm1hcmtlcktleSIsInNvdXJjZSIsInN1YkluZGV4IiwiZGF0YSIsIm1hcmtlZCIsInF1ZXVlIiwidW5tYXJrZWQiLCJNYXJrZXIiLCJyYXciLCJmb3JQcm9wc0NhbGxiYWNrIiwiZ2V0TWFya2VyS2V5IiwiaWdub3JlQ2FzZSIsIm11bHRpbGluZSIsImdldCIsInNldCIsImNvbmZpZ3VyYWJsZSIsImVudW1lcmFibGUiLCJ3cml0YWJsZSIsImVhY2giLCJpc1NuYXBzaG90Iiwic25hcHNob3RJdGVtIiwic25hcHNob3RMZW5ndGgiLCJpc1NwbGl0dGFibGUiLCJpc0NvbnZlcnRhYmxlIiwib3JpZ09iamVjdCIsImRlc3RpbmF0aW9uIiwiZmlsdGVyIiwiYXJyYXkiLCJoeiIsInNvcnQiLCJhIiwiYiIsIm1lYW4iLCJtb2UiLCJjb21wYXJlIiwiZm9ybWF0TnVtYmVyIiwibnVtYmVyIiwiX19wcm90b19fIiwiaW5kZXhPZiIsImZyb21JbmRleCIsImludGVycG9sYXRlIiwic3RyaW5nIiwiUmVnRXhwIiwiaW52b2tlIiwiYmVuY2hlcyIsInF1ZXVlZCIsImV2ZW50UHJvcHMiLCJtYXAiLCJleGVjdXRlIiwibGlzdGVuZXJzIiwiYXN5bmMiLCJpc0FzeW5jIiwiZ2V0TmV4dCIsImV2ZW50cyIsImNvbXBsZXRlIiwicG9wIiwiZXZlbnQiLCJjeWNsZUV2ZW50IiwibGFzdCIsIm9mZiIsImVtaXQiLCJ0YXJnZXQiLCJvbkN5Y2xlIiwicmFpc2VJbmRleCIsIm9uQ29tcGxldGUiLCJkZWZlciIsIm9uU3RhcnQiLCJqb2luIiwic2VwYXJhdG9yMSIsInNlcGFyYXRvcjIiLCJhcnJheUxpa2UiLCJwbHVjayIsImFjY3VtdWxhdG9yIiwibm9hY2N1bSIsImFib3J0U3VpdGUiLCJyZXNldHRpbmciLCJyZXNldFN1aXRlIiwiY2FuY2VsbGVkIiwicmVzZXQiLCJhZGQiLCJjbG9uZVN1aXRlIiwiZmlsdGVyU3VpdGUiLCJhYm9ydGluZyIsImFib3J0IiwicnVuU3VpdGUiLCJlcnJvciIsImN1cnJlbnRUYXJnZXQiLCJsaXN0ZW5lciIsImNsZWFyVGltZW91dCIsIm90aGVyIiwiY3JpdGljYWwiLCJ6U3RhdCIsInNhbXBsZTEiLCJzYW1wbGUyIiwic2l6ZTEiLCJzaXplMiIsIm1heFNpemUiLCJtaW5TaXplIiwidTEiLCJnZXRVIiwidTIiLCJ1IiwiZ2V0U2NvcmUiLCJ4QSIsInNhbXBsZUIiLCJ0b3RhbCIsInhCIiwic2FtcGxlQSIsImdldFoiLCJjaGFuZ2VzIiwiY2hhbmdlZCIsImN1cnJWYWx1ZSIsInRvU3RyaW5nQmVuY2giLCJzaXplIiwicG0iLCJpc05hTiIsInRvRml4ZWQiLCJybWUiLCJhcHBsZXQiLCJ0ZW1wbGF0ZSIsInRpbWVycyIsIm5zIiwiZ2V0UmVzIiwiZGVmZXJyZWQiLCJmbkFyZyIsInN0cmluZ2FibGUiLCJzZXR1cCIsInByZXByb2Nlc3MiLCJkZWNvbXBpbGFibGUiLCJpc0VtcHR5IiwibWluVGltZSIsIm5hbm9UaW1lIiwiUGFja2FnZXMiLCJuYW5vIiwiRXJyb3IiLCJlbGFwc2VkIiwidW5pdCIsIm1lYXN1cmVkIiwiYmVnaW4iLCJkaXZpc29yIiwibWljcm9zZWNvbmRzIiwiSW5maW5pdHkiLCJhcHBsZXRzIiwiY2hyb21lIiwiY2hyb21pdW0iLCJJbnRlcnZhbCIsImhydGltZSIsInJlcyIsImNvbXB1dGUiLCJpbml0Q291bnQiLCJtaW5TYW1wbGVzIiwiZW5xdWV1ZSIsInVwZGF0ZSIsImV2YWx1YXRlIiwiZGYiLCJzZCIsInNlbSIsInZhcmlhbmNlIiwicGVyaW9kIiwibWF4ZWRPdXQiLCJ0aW1lU3RhbXAiLCJtYXhUaW1lIiwidmFyT2YiLCJyb3VuZCIsImluZmluaXR5IiwiY2xvY2tlZCIsIm1lc3NhZ2UiLCJjZWlsIiwicnVuIiwicGxhdGZvcm0iLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJkZXNjcmlwdGlvbiIsIm1vZHVsZSJdLCJtYXBwaW5ncyI6IkFBT0UsQ0FBQSxTQUFTQSxNQUFNLEVBQUVDLFNBQVM7SUFDMUI7SUFFQSxvREFBb0QsR0FDcEQsSUFBSUMsVUFBVTtJQUVkLCtCQUErQixHQUMvQixJQUFJQyxNQUFNQyxXQUFXSixRQUFRLGVBQWVLO0lBRTVDLGtDQUFrQyxHQUNsQyxJQUFJQyxhQUFhLE9BQU9DLFVBQVUsY0FDaEMsT0FBT0EsT0FBT0MsR0FBRyxJQUFJLFlBQVlELE9BQU9DLEdBQUcsSUFBSUQ7SUFFakQsbUNBQW1DLEdBQ25DLElBQUlFLGNBQWMsT0FBT0MsV0FBVyxZQUFZQSxXQUM3QyxDQUFBLE9BQU9DLFVBQVUsWUFBWUEsVUFBVUEsVUFBVUEsT0FBT0EsTUFBTSxJQUFLWCxDQUFBQSxTQUFTVyxNQUFLLEdBQUlELE9BQU07SUFFOUYsbUNBQW1DLEdBQ25DLElBQUlFLGNBQWMsT0FBT0MsV0FBVyxjQUFjQTtJQUVsRCw2REFBNkQsR0FDN0QsSUFBSUMsYUFBYUMsT0FBT0MsbUJBQW1CO0lBRTNDLHFDQUFxQyxHQUNyQyxJQUFJQyxnQkFBZ0JGLE9BQU9HLHdCQUF3QjtJQUVuRCx1REFBdUQsR0FDdkQsSUFBSUMsaUJBQWlCLENBQUMs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STtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7U0FBRztRQUNqRSxNQUFNO1lBQUM7WUFBRztZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7U0FBRztRQUNyRSxNQUFNO1lBQUM7WUFBRztZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSztTQUFJO1FBQzNFLE1BQU07WUFBQztZQUFHO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSztZQUFLO1lBQUs7U0FBSTtRQUNqRixNQUFNO1lBQUM7WUFBRztZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7U0FBSTtRQUN2RixNQUFNO1lBQUM7WUFBRztZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztTQUFJO1FBQzdGLE1BQU07WUFBQztZQUFHO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7U0FBSTtRQUNsRyxNQUFNO1lBQUM7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7U0FBSTtRQUN6RyxNQUFNO1lBQUM7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztTQUFJO1FBQzlHLE1BQU07WUFBQztZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7U0FBSTtRQUNwSCxNQUFNO1lBQUM7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7U0FBSTtRQUN6SCxNQUFNO1lBQUM7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztTQUFJO1FBQy9ILE1BQU07WUFBQztZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7U0FBSTtRQUNwSSxNQUFNO1lBQUM7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSTtZQUFJO1lBQUk7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7WUFBSztZQUFLO1lBQUs7U0FBSTtJQUMzSTtJQUVBOzs7Ozs7R0FNQyxHQUNELElBQUlDLFVBQVUsQ0FBQztJQUVkLENBQUE7UUFFQzs7Ozs7S0FLQyxHQUNEQSxRQUFRQyxHQUFHLEdBQUdDLFVBQVU1QyxPQUFPNkMsT0FBTyxFQUFFO1FBRXhDOzs7OztLQUtDLEdB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