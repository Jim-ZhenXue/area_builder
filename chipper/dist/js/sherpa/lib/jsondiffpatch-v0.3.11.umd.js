(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('./empty')) : typeof define === 'function' && define.amd ? define([
        'exports',
        './empty'
    ], factory) : factory(global.jsondiffpatch = {}, global.chalk);
})(this, function(exports1, chalk) {
    'use strict';
    chalk = chalk && chalk.hasOwnProperty('default') ? chalk['default'] : chalk;
    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
        return typeof obj;
    } : function(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
    var classCallCheck = function(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    };
    var createClass = function() {
        function defineProperties(target, props) {
            for(var i = 0; i < props.length; i++){
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();
    var get = function get(object, property, receiver) {
        if (object === null) object = Function.prototype;
        var desc = Object.getOwnPropertyDescriptor(object, property);
        if (desc === undefined) {
            var parent = Object.getPrototypeOf(object);
            if (parent === null) {
                return undefined;
            } else {
                return get(parent, property, receiver);
            }
        } else if ("value" in desc) {
            return desc.value;
        } else {
            var getter = desc.get;
            if (getter === undefined) {
                return undefined;
            }
            return getter.call(receiver);
        }
    };
    var inherits = function(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }
        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    };
    var possibleConstructorReturn = function(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }
        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    };
    var slicedToArray = function() {
        function sliceIterator(arr, i) {
            var _arr = [];
            var _n = true;
            var _d = false;
            var _e = undefined;
            try {
                for(var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true){
                    _arr.push(_s.value);
                    if (i && _arr.length === i) break;
                }
            } catch (err) {
                _d = true;
                _e = err;
            } finally{
                try {
                    if (!_n && _i["return"]) _i["return"]();
                } finally{
                    if (_d) throw _e;
                }
            }
            return _arr;
        }
        return function(arr, i) {
            if (Array.isArray(arr)) {
                return arr;
            } else if (Symbol.iterator in Object(arr)) {
                return sliceIterator(arr, i);
            } else {
                throw new TypeError("Invalid attempt to destructure non-iterable instance");
            }
        };
    }();
    var toConsumableArray = function(arr) {
        if (Array.isArray(arr)) {
            for(var i = 0, arr2 = Array(arr.length); i < arr.length; i++)arr2[i] = arr[i];
            return arr2;
        } else {
            return Array.from(arr);
        }
    };
    var Processor = function() {
        function Processor(options) {
            classCallCheck(this, Processor);
            this.selfOptions = options || {};
            this.pipes = {};
        }
        createClass(Processor, [
            {
                key: 'options',
                value: function options(_options) {
                    if (_options) {
                        this.selfOptions = _options;
                    }
                    return this.selfOptions;
                }
            },
            {
                key: 'pipe',
                value: function pipe(name, pipeArg) {
                    var pipe = pipeArg;
                    if (typeof name === 'string') {
                        if (typeof pipe === 'undefined') {
                            return this.pipes[name];
                        } else {
                            this.pipes[name] = pipe;
                        }
                    }
                    if (name && name.name) {
                        pipe = name;
                        if (pipe.processor === this) {
                            return pipe;
                        }
                        this.pipes[pipe.name] = pipe;
                    }
                    pipe.processor = this;
                    return pipe;
                }
            },
            {
                key: 'process',
                value: function process(input, pipe) {
                    var context = input;
                    context.options = this.options();
                    var nextPipe = pipe || input.pipe || 'default';
                    var lastPipe = void 0;
                    var lastContext = void 0;
                    while(nextPipe){
                        if (typeof context.nextAfterChildren !== 'undefined') {
                            // children processed and coming back to parent
                            context.next = context.nextAfterChildren;
                            context.nextAfterChildren = null;
                        }
                        if (typeof nextPipe === 'string') {
                            nextPipe = this.pipe(nextPipe);
                        }
                        nextPipe.process(context);
                        lastContext = context;
                        lastPipe = nextPipe;
                        nextPipe = null;
                        if (context) {
                            if (context.next) {
                                context = context.next;
                                nextPipe = lastContext.nextPipe || context.pipe || lastPipe;
                            }
                        }
                    }
                    return context.hasResult ? context.result : undefined;
                }
            }
        ]);
        return Processor;
    }();
    var Pipe = function() {
        function Pipe(name) {
            classCallCheck(this, Pipe);
            this.name = name;
            this.filters = [];
        }
        createClass(Pipe, [
            {
                key: 'process',
                value: function process(input) {
                    if (!this.processor) {
                        throw new Error('add this pipe to a processor before using it');
                    }
                    var debug = this.debug;
                    var length = this.filters.length;
                    var context = input;
                    for(var index = 0; index < length; index++){
                        var filter = this.filters[index];
                        if (debug) {
                            this.log('filter: ' + filter.filterName);
                        }
                        filter(context);
                        if ((typeof context === 'undefined' ? 'undefined' : _typeof(context)) === 'object' && context.exiting) {
                            context.exiting = false;
                            break;
                        }
                    }
                    if (!context.next && this.resultCheck) {
                        this.resultCheck(context);
                    }
                }
            },
            {
                key: 'log',
                value: function log(msg) {
                    console.log('[jsondiffpatch] ' + this.name + ' pipe, ' + msg);
                }
            },
            {
                key: 'append',
                value: function append() {
                    var _filters;
                    (_filters = this.filters).push.apply(_filters, arguments);
                    return this;
                }
            },
            {
                key: 'prepend',
                value: function prepend() {
                    var _filters2;
                    (_filters2 = this.filters).unshift.apply(_filters2, arguments);
                    return this;
                }
            },
            {
                key: 'indexOf',
                value: function indexOf(filterName) {
                    if (!filterName) {
                        throw new Error('a filter name is required');
                    }
                    for(var index = 0; index < this.filters.length; index++){
                        var filter = this.filters[index];
                        if (filter.filterName === filterName) {
                            return index;
                        }
                    }
                    throw new Error('filter not found: ' + filterName);
                }
            },
            {
                key: 'list',
                value: function list() {
                    return this.filters.map(function(f) {
                        return f.filterName;
                    });
                }
            },
            {
                key: 'after',
                value: function after(filterName) {
                    var index = this.indexOf(filterName);
                    var params = Array.prototype.slice.call(arguments, 1);
                    if (!params.length) {
                        throw new Error('a filter is required');
                    }
                    params.unshift(index + 1, 0);
                    Array.prototype.splice.apply(this.filters, params);
                    return this;
                }
            },
            {
                key: 'before',
                value: function before(filterName) {
                    var index = this.indexOf(filterName);
                    var params = Array.prototype.slice.call(arguments, 1);
                    if (!params.length) {
                        throw new Error('a filter is required');
                    }
                    params.unshift(index, 0);
                    Array.prototype.splice.apply(this.filters, params);
                    return this;
                }
            },
            {
                key: 'replace',
                value: function replace(filterName) {
                    var index = this.indexOf(filterName);
                    var params = Array.prototype.slice.call(arguments, 1);
                    if (!params.length) {
                        throw new Error('a filter is required');
                    }
                    params.unshift(index, 1);
                    Array.prototype.splice.apply(this.filters, params);
                    return this;
                }
            },
            {
                key: 'remove',
                value: function remove(filterName) {
                    var index = this.indexOf(filterName);
                    this.filters.splice(index, 1);
                    return this;
                }
            },
            {
                key: 'clear',
                value: function clear() {
                    this.filters.length = 0;
                    return this;
                }
            },
            {
                key: 'shouldHaveResult',
                value: function shouldHaveResult(should) {
                    if (should === false) {
                        this.resultCheck = null;
                        return;
                    }
                    if (this.resultCheck) {
                        return;
                    }
                    var pipe = this;
                    this.resultCheck = function(context) {
                        if (!context.hasResult) {
                            console.log(context);
                            var error = new Error(pipe.name + ' failed');
                            error.noResult = true;
                            throw error;
                        }
                    };
                    return this;
                }
            }
        ]);
        return Pipe;
    }();
    var Context = function() {
        function Context() {
            classCallCheck(this, Context);
        }
        createClass(Context, [
            {
                key: 'setResult',
                value: function setResult(result) {
                    this.result = result;
                    this.hasResult = true;
                    return this;
                }
            },
            {
                key: 'exit',
                value: function exit() {
                    this.exiting = true;
                    return this;
                }
            },
            {
                key: 'switchTo',
                value: function switchTo(next, pipe) {
                    if (typeof next === 'string' || next instanceof Pipe) {
                        this.nextPipe = next;
                    } else {
                        this.next = next;
                        if (pipe) {
                            this.nextPipe = pipe;
                        }
                    }
                    return this;
                }
            },
            {
                key: 'push',
                value: function push(child, name) {
                    child.parent = this;
                    if (typeof name !== 'undefined') {
                        child.childName = name;
                    }
                    child.root = this.root || this;
                    child.options = child.options || this.options;
                    if (!this.children) {
                        this.children = [
                            child
                        ];
                        this.nextAfterChildren = this.next || null;
                        this.next = child;
                    } else {
                        this.children[this.children.length - 1].next = child;
                        this.children.push(child);
                    }
                    child.next = this;
                    return this;
                }
            }
        ]);
        return Context;
    }();
    var isArray = typeof Array.isArray === 'function' ? Array.isArray : function(a) {
        return a instanceof Array;
    };
    function cloneRegExp(re) {
        var regexMatch = /^\/(.*)\/([gimyu]*)$/.exec(re.toString());
        return new RegExp(regexMatch[1], regexMatch[2]);
    }
    function clone(arg) {
        if ((typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) !== 'object') {
            return arg;
        }
        if (arg === null) {
            return null;
        }
        if (isArray(arg)) {
            return arg.map(clone);
        }
        if (arg instanceof Date) {
            return new Date(arg.getTime());
        }
        if (arg instanceof RegExp) {
            return cloneRegExp(arg);
        }
        var cloned = {};
        for(var name in arg){
            if (Object.prototype.hasOwnProperty.call(arg, name)) {
                cloned[name] = clone(arg[name]);
            }
        }
        return cloned;
    }
    var DiffContext = function(_Context) {
        inherits(DiffContext, _Context);
        function DiffContext(left, right) {
            classCallCheck(this, DiffContext);
            var _this = possibleConstructorReturn(this, (DiffContext.__proto__ || Object.getPrototypeOf(DiffContext)).call(this));
            _this.left = left;
            _this.right = right;
            _this.pipe = 'diff';
            return _this;
        }
        createClass(DiffContext, [
            {
                key: 'setResult',
                value: function setResult(result) {
                    if (this.options.cloneDiffValues && (typeof result === 'undefined' ? 'undefined' : _typeof(result)) === 'object') {
                        var clone$$1 = typeof this.options.cloneDiffValues === 'function' ? this.options.cloneDiffValues : clone;
                        if (_typeof(result[0]) === 'object') {
                            result[0] = clone$$1(result[0]);
                        }
                        if (_typeof(result[1]) === 'object') {
                            result[1] = clone$$1(result[1]);
                        }
                    }
                    return Context.prototype.setResult.apply(this, arguments);
                }
            }
        ]);
        return DiffContext;
    }(Context);
    var PatchContext = function(_Context) {
        inherits(PatchContext, _Context);
        function PatchContext(left, delta) {
            classCallCheck(this, PatchContext);
            var _this = possibleConstructorReturn(this, (PatchContext.__proto__ || Object.getPrototypeOf(PatchContext)).call(this));
            _this.left = left;
            _this.delta = delta;
            _this.pipe = 'patch';
            return _this;
        }
        return PatchContext;
    }(Context);
    var ReverseContext = function(_Context) {
        inherits(ReverseContext, _Context);
        function ReverseContext(delta) {
            classCallCheck(this, ReverseContext);
            var _this = possibleConstructorReturn(this, (ReverseContext.__proto__ || Object.getPrototypeOf(ReverseContext)).call(this));
            _this.delta = delta;
            _this.pipe = 'reverse';
            return _this;
        }
        return ReverseContext;
    }(Context);
    var isArray$1 = typeof Array.isArray === 'function' ? Array.isArray : function(a) {
        return a instanceof Array;
    };
    var diffFilter = function trivialMatchesDiffFilter(context) {
        if (context.left === context.right) {
            context.setResult(undefined).exit();
            return;
        }
        if (typeof context.left === 'undefined') {
            if (typeof context.right === 'function') {
                throw new Error('functions are not supported');
            }
            context.setResult([
                context.right
            ]).exit();
            return;
        }
        if (typeof context.right === 'undefined') {
            context.setResult([
                context.left,
                0,
                0
            ]).exit();
            return;
        }
        if (typeof context.left === 'function' || typeof context.right === 'function') {
            throw new Error('functions are not supported');
        }
        context.leftType = context.left === null ? 'null' : _typeof(context.left);
        context.rightType = context.right === null ? 'null' : _typeof(context.right);
        if (context.leftType !== context.rightType) {
            context.setResult([
                context.left,
                context.right
            ]).exit();
            return;
        }
        if (context.leftType === 'boolean' || context.leftType === 'number') {
            context.setResult([
                context.left,
                context.right
            ]).exit();
            return;
        }
        if (context.leftType === 'object') {
            context.leftIsArray = isArray$1(context.left);
        }
        if (context.rightType === 'object') {
            context.rightIsArray = isArray$1(context.right);
        }
        if (context.leftIsArray !== context.rightIsArray) {
            context.setResult([
                context.left,
                context.right
            ]).exit();
            return;
        }
        if (context.left instanceof RegExp) {
            if (context.right instanceof RegExp) {
                context.setResult([
                    context.left.toString(),
                    context.right.toString()
                ]).exit();
            } else {
                context.setResult([
                    context.left,
                    context.right
                ]).exit();
            }
        }
    };
    diffFilter.filterName = 'trivial';
    var patchFilter = function trivialMatchesPatchFilter(context) {
        if (typeof context.delta === 'undefined') {
            context.setResult(context.left).exit();
            return;
        }
        context.nested = !isArray$1(context.delta);
        if (context.nested) {
            return;
        }
        if (context.delta.length === 1) {
            context.setResult(context.delta[0]).exit();
            return;
        }
        if (context.delta.length === 2) {
            if (context.left instanceof RegExp) {
                var regexArgs = /^\/(.*)\/([gimyu]+)$/.exec(context.delta[1]);
                if (regexArgs) {
                    context.setResult(new RegExp(regexArgs[1], regexArgs[2])).exit();
                    return;
                }
            }
            context.setResult(context.delta[1]).exit();
            return;
        }
        if (context.delta.length === 3 && context.delta[2] === 0) {
            context.setResult(undefined).exit();
        }
    };
    patchFilter.filterName = 'trivial';
    var reverseFilter = function trivialReferseFilter(context) {
        if (typeof context.delta === 'undefined') {
            context.setResult(context.delta).exit();
            return;
        }
        context.nested = !isArray$1(context.delta);
        if (context.nested) {
            return;
        }
        if (context.delta.length === 1) {
            context.setResult([
                context.delta[0],
                0,
                0
            ]).exit();
            return;
        }
        if (context.delta.length === 2) {
            context.setResult([
                context.delta[1],
                context.delta[0]
            ]).exit();
            return;
        }
        if (context.delta.length === 3 && context.delta[2] === 0) {
            context.setResult([
                context.delta[0]
            ]).exit();
        }
    };
    reverseFilter.filterName = 'trivial';
    function collectChildrenDiffFilter(context) {
        if (!context || !context.children) {
            return;
        }
        var length = context.children.length;
        var child = void 0;
        var result = context.result;
        for(var index = 0; index < length; index++){
            child = context.children[index];
            if (typeof child.result === 'undefined') {
                continue;
            }
            result = result || {};
            result[child.childName] = child.result;
        }
        if (result && context.leftIsArray) {
            result._t = 'a';
        }
        context.setResult(result).exit();
    }
    collectChildrenDiffFilter.filterName = 'collectChildren';
    function objectsDiffFilter(context) {
        if (context.leftIsArray || context.leftType !== 'object') {
            return;
        }
        var name = void 0;
        var child = void 0;
        var propertyFilter = context.options.propertyFilter;
        for(name in context.left){
            if (!Object.prototype.hasOwnProperty.call(context.left, name)) {
                continue;
            }
            if (propertyFilter && !propertyFilter(name, context)) {
                continue;
            }
            child = new DiffContext(context.left[name], context.right[name]);
            context.push(child, name);
        }
        for(name in context.right){
            if (!Object.prototype.hasOwnProperty.call(context.right, name)) {
                continue;
            }
            if (propertyFilter && !propertyFilter(name, context)) {
                continue;
            }
            if (typeof context.left[name] === 'undefined') {
                child = new DiffContext(undefined, context.right[name]);
                context.push(child, name);
            }
        }
        if (!context.children || context.children.length === 0) {
            context.setResult(undefined).exit();
            return;
        }
        context.exit();
    }
    objectsDiffFilter.filterName = 'objects';
    var patchFilter$1 = function nestedPatchFilter(context) {
        if (!context.nested) {
            return;
        }
        if (context.delta._t) {
            return;
        }
        var name = void 0;
        var child = void 0;
        for(name in context.delta){
            child = new PatchContext(context.left[name], context.delta[name]);
            context.push(child, name);
        }
        context.exit();
    };
    patchFilter$1.filterName = 'objects';
    var collectChildrenPatchFilter = function collectChildrenPatchFilter(context) {
        if (!context || !context.children) {
            return;
        }
        if (context.delta._t) {
            return;
        }
        var length = context.children.length;
        var child = void 0;
        for(var index = 0; index < length; index++){
            child = context.children[index];
            if (Object.prototype.hasOwnProperty.call(context.left, child.childName) && child.result === undefined) {
                delete context.left[child.childName];
            } else if (context.left[child.childName] !== child.result) {
                context.left[child.childName] = child.result;
            }
        }
        context.setResult(context.left).exit();
    };
    collectChildrenPatchFilter.filterName = 'collectChildren';
    var reverseFilter$1 = function nestedReverseFilter(context) {
        if (!context.nested) {
            return;
        }
        if (context.delta._t) {
            return;
        }
        var name = void 0;
        var child = void 0;
        for(name in context.delta){
            child = new ReverseContext(context.delta[name]);
            context.push(child, name);
        }
        context.exit();
    };
    reverseFilter$1.filterName = 'objects';
    function collectChildrenReverseFilter(context) {
        if (!context || !context.children) {
            return;
        }
        if (context.delta._t) {
            return;
        }
        var length = context.children.length;
        var child = void 0;
        var delta = {};
        for(var index = 0; index < length; index++){
            child = context.children[index];
            if (delta[child.childName] !== child.result) {
                delta[child.childName] = child.result;
            }
        }
        context.setResult(delta).exit();
    }
    collectChildrenReverseFilter.filterName = 'collectChildren';
    /*

LCS implementation that supports arrays or strings

reference: http://en.wikipedia.org/wiki/Longest_common_subsequence_problem

*/ var defaultMatch = function defaultMatch(array1, array2, index1, index2) {
        return array1[index1] === array2[index2];
    };
    var lengthMatrix = function lengthMatrix(array1, array2, match, context) {
        var len1 = array1.length;
        var len2 = array2.length;
        var x = void 0, y = void 0;
        // initialize empty matrix of len1+1 x len2+1
        var matrix = [
            len1 + 1
        ];
        for(x = 0; x < len1 + 1; x++){
            matrix[x] = [
                len2 + 1
            ];
            for(y = 0; y < len2 + 1; y++){
                matrix[x][y] = 0;
            }
        }
        matrix.match = match;
        // save sequence lengths for each coordinate
        for(x = 1; x < len1 + 1; x++){
            for(y = 1; y < len2 + 1; y++){
                if (match(array1, array2, x - 1, y - 1, context)) {
                    matrix[x][y] = matrix[x - 1][y - 1] + 1;
                } else {
                    matrix[x][y] = Math.max(matrix[x - 1][y], matrix[x][y - 1]);
                }
            }
        }
        return matrix;
    };
    var backtrack = function backtrack(matrix, array1, array2, index1, index2, context) {
        if (index1 === 0 || index2 === 0) {
            return {
                sequence: [],
                indices1: [],
                indices2: []
            };
        }
        if (matrix.match(array1, array2, index1 - 1, index2 - 1, context)) {
            var subsequence = backtrack(matrix, array1, array2, index1 - 1, index2 - 1, context);
            subsequence.sequence.push(array1[index1 - 1]);
            subsequence.indices1.push(index1 - 1);
            subsequence.indices2.push(index2 - 1);
            return subsequence;
        }
        if (matrix[index1][index2 - 1] > matrix[index1 - 1][index2]) {
            return backtrack(matrix, array1, array2, index1, index2 - 1, context);
        } else {
            return backtrack(matrix, array1, array2, index1 - 1, index2, context);
        }
    };
    var get$1 = function get(array1, array2, match, context) {
        var innerContext = context || {};
        var matrix = lengthMatrix(array1, array2, match || defaultMatch, innerContext);
        var result = backtrack(matrix, array1, array2, array1.length, array2.length, innerContext);
        if (typeof array1 === 'string' && typeof array2 === 'string') {
            result.sequence = result.sequence.join('');
        }
        return result;
    };
    var lcs = {
        get: get$1
    };
    var ARRAY_MOVE = 3;
    var isArray$2 = typeof Array.isArray === 'function' ? Array.isArray : function(a) {
        return a instanceof Array;
    };
    var arrayIndexOf = typeof Array.prototype.indexOf === 'function' ? function(array, item) {
        return array.indexOf(item);
    } : function(array, item) {
        var length = array.length;
        for(var i = 0; i < length; i++){
            if (array[i] === item) {
                return i;
            }
        }
        return -1;
    };
    function arraysHaveMatchByRef(array1, array2, len1, len2) {
        for(var index1 = 0; index1 < len1; index1++){
            var val1 = array1[index1];
            for(var index2 = 0; index2 < len2; index2++){
                var val2 = array2[index2];
                if (index1 !== index2 && val1 === val2) {
                    return true;
                }
            }
        }
    }
    function matchItems(array1, array2, index1, index2, context) {
        var value1 = array1[index1];
        var value2 = array2[index2];
        if (value1 === value2) {
            return true;
        }
        if ((typeof value1 === 'undefined' ? 'undefined' : _typeof(value1)) !== 'object' || (typeof value2 === 'undefined' ? 'undefined' : _typeof(value2)) !== 'object') {
            return false;
        }
        var objectHash = context.objectHash;
        if (!objectHash) {
            // no way to match objects was provided, try match by position
            return context.matchByPosition && index1 === index2;
        }
        var hash1 = void 0;
        var hash2 = void 0;
        if (typeof index1 === 'number') {
            context.hashCache1 = context.hashCache1 || [];
            hash1 = context.hashCache1[index1];
            if (typeof hash1 === 'undefined') {
                context.hashCache1[index1] = hash1 = objectHash(value1, index1);
            }
        } else {
            hash1 = objectHash(value1);
        }
        if (typeof hash1 === 'undefined') {
            return false;
        }
        if (typeof index2 === 'number') {
            context.hashCache2 = context.hashCache2 || [];
            hash2 = context.hashCache2[index2];
            if (typeof hash2 === 'undefined') {
                context.hashCache2[index2] = hash2 = objectHash(value2, index2);
            }
        } else {
            hash2 = objectHash(value2);
        }
        if (typeof hash2 === 'undefined') {
            return false;
        }
        return hash1 === hash2;
    }
    var diffFilter$1 = function arraysDiffFilter(context) {
        if (!context.leftIsArray) {
            return;
        }
        var matchContext = {
            objectHash: context.options && context.options.objectHash,
            matchByPosition: context.options && context.options.matchByPosition
        };
        var commonHead = 0;
        var commonTail = 0;
        var index = void 0;
        var index1 = void 0;
        var index2 = void 0;
        var array1 = context.left;
        var array2 = context.right;
        var len1 = array1.length;
        var len2 = array2.length;
        var child = void 0;
        if (len1 > 0 && len2 > 0 && !matchContext.objectHash && typeof matchContext.matchByPosition !== 'boolean') {
            matchContext.matchByPosition = !arraysHaveMatchByRef(array1, array2, len1, len2);
        }
        // separate common head
        while(commonHead < len1 && commonHead < len2 && matchItems(array1, array2, commonHead, commonHead, matchContext)){
            index = commonHead;
            child = new DiffContext(context.left[index], context.right[index]);
            context.push(child, index);
            commonHead++;
        }
        // separate common tail
        while(commonTail + commonHead < len1 && commonTail + commonHead < len2 && matchItems(array1, array2, len1 - 1 - commonTail, len2 - 1 - commonTail, matchContext)){
            index1 = len1 - 1 - commonTail;
            index2 = len2 - 1 - commonTail;
            child = new DiffContext(context.left[index1], context.right[index2]);
            context.push(child, index2);
            commonTail++;
        }
        var result = void 0;
        if (commonHead + commonTail === len1) {
            if (len1 === len2) {
                // arrays are identical
                context.setResult(undefined).exit();
                return;
            }
            // trivial case, a block (1 or more consecutive items) was added
            result = result || {
                _t: 'a'
            };
            for(index = commonHead; index < len2 - commonTail; index++){
                result[index] = [
                    array2[index]
                ];
            }
            context.setResult(result).exit();
            return;
        }
        if (commonHead + commonTail === len2) {
            // trivial case, a block (1 or more consecutive items) was removed
            result = result || {
                _t: 'a'
            };
            for(index = commonHead; index < len1 - commonTail; index++){
                result['_' + index] = [
                    array1[index],
                    0,
                    0
                ];
            }
            context.setResult(result).exit();
            return;
        }
        // reset hash cache
        delete matchContext.hashCache1;
        delete matchContext.hashCache2;
        // diff is not trivial, find the LCS (Longest Common Subsequence)
        var trimmed1 = array1.slice(commonHead, len1 - commonTail);
        var trimmed2 = array2.slice(commonHead, len2 - commonTail);
        var seq = lcs.get(trimmed1, trimmed2, matchItems, matchContext);
        var removedItems = [];
        result = result || {
            _t: 'a'
        };
        for(index = commonHead; index < len1 - commonTail; index++){
            if (arrayIndexOf(seq.indices1, index - commonHead) < 0) {
                // removed
                result['_' + index] = [
                    array1[index],
                    0,
                    0
                ];
                removedItems.push(index);
            }
        }
        var detectMove = true;
        if (context.options && context.options.arrays && context.options.arrays.detectMove === false) {
            detectMove = false;
        }
        var includeValueOnMove = false;
        if (context.options && context.options.arrays && context.options.arrays.includeValueOnMove) {
            includeValueOnMove = true;
        }
        var removedItemsLength = removedItems.length;
        for(index = commonHead; index < len2 - commonTail; index++){
            var indexOnArray2 = arrayIndexOf(seq.indices2, index - commonHead);
            if (indexOnArray2 < 0) {
                // added, try to match with a removed item and register as position move
                var isMove = false;
                if (detectMove && removedItemsLength > 0) {
                    for(var removeItemIndex1 = 0; removeItemIndex1 < removedItemsLength; removeItemIndex1++){
                        index1 = removedItems[removeItemIndex1];
                        if (matchItems(trimmed1, trimmed2, index1 - commonHead, index - commonHead, matchContext)) {
                            // store position move as: [originalValue, newPosition, ARRAY_MOVE]
                            result['_' + index1].splice(1, 2, index, ARRAY_MOVE);
                            if (!includeValueOnMove) {
                                // don't include moved value on diff, to save bytes
                                result['_' + index1][0] = '';
                            }
                            index2 = index;
                            child = new DiffContext(context.left[index1], context.right[index2]);
                            context.push(child, index2);
                            removedItems.splice(removeItemIndex1, 1);
                            isMove = true;
                            break;
                        }
                    }
                }
                if (!isMove) {
                    // added
                    result[index] = [
                        array2[index]
                    ];
                }
            } else {
                // match, do inner diff
                index1 = seq.indices1[indexOnArray2] + commonHead;
                index2 = seq.indices2[indexOnArray2] + commonHead;
                child = new DiffContext(context.left[index1], context.right[index2]);
                context.push(child, index2);
            }
        }
        context.setResult(result).exit();
    };
    diffFilter$1.filterName = 'arrays';
    var compare = {
        numerically: function numerically(a, b) {
            return a - b;
        },
        numericallyBy: function numericallyBy(name) {
            return function(a, b) {
                return a[name] - b[name];
            };
        }
    };
    var patchFilter$2 = function nestedPatchFilter(context) {
        if (!context.nested) {
            return;
        }
        if (context.delta._t !== 'a') {
            return;
        }
        var index = void 0;
        var index1 = void 0;
        var delta = context.delta;
        var array = context.left;
        // first, separate removals, insertions and modifications
        var toRemove = [];
        var toInsert = [];
        var toModify = [];
        for(index in delta){
            if (index !== '_t') {
                if (index[0] === '_') {
                    // removed item from original array
                    if (delta[index][2] === 0 || delta[index][2] === ARRAY_MOVE) {
                        toRemove.push(parseInt(index.slice(1), 10));
                    } else {
                        throw new Error('only removal or move can be applied at original array indices,' + (' invalid diff type: ' + delta[index][2]));
                    }
                } else {
                    if (delta[index].length === 1) {
                        // added item at new array
                        toInsert.push({
                            index: parseInt(index, 10),
                            value: delta[index][0]
                        });
                    } else {
                        // modified item at new array
                        toModify.push({
                            index: parseInt(index, 10),
                            delta: delta[index]
                        });
                    }
                }
            }
        }
        // remove items, in reverse order to avoid sawing our own floor
        toRemove = toRemove.sort(compare.numerically);
        for(index = toRemove.length - 1; index >= 0; index--){
            index1 = toRemove[index];
            var indexDiff = delta['_' + index1];
            var removedValue = array.splice(index1, 1)[0];
            if (indexDiff[2] === ARRAY_MOVE) {
                // reinsert later
                toInsert.push({
                    index: indexDiff[1],
                    value: removedValue
                });
            }
        }
        // insert items, in reverse order to avoid moving our own floor
        toInsert = toInsert.sort(compare.numericallyBy('index'));
        var toInsertLength = toInsert.length;
        for(index = 0; index < toInsertLength; index++){
            var insertion = toInsert[index];
            array.splice(insertion.index, 0, insertion.value);
        }
        // apply modifications
        var toModifyLength = toModify.length;
        var child = void 0;
        if (toModifyLength > 0) {
            for(index = 0; index < toModifyLength; index++){
                var modification = toModify[index];
                child = new PatchContext(context.left[modification.index], modification.delta);
                context.push(child, modification.index);
            }
        }
        if (!context.children) {
            context.setResult(context.left).exit();
            return;
        }
        context.exit();
    };
    patchFilter$2.filterName = 'arrays';
    var collectChildrenPatchFilter$1 = function collectChildrenPatchFilter(context) {
        if (!context || !context.children) {
            return;
        }
        if (context.delta._t !== 'a') {
            return;
        }
        var length = context.children.length;
        var child = void 0;
        for(var index = 0; index < length; index++){
            child = context.children[index];
            context.left[child.childName] = child.result;
        }
        context.setResult(context.left).exit();
    };
    collectChildrenPatchFilter$1.filterName = 'arraysCollectChildren';
    var reverseFilter$2 = function arraysReverseFilter(context) {
        if (!context.nested) {
            if (context.delta[2] === ARRAY_MOVE) {
                context.newName = '_' + context.delta[1];
                context.setResult([
                    context.delta[0],
                    parseInt(context.childName.substr(1), 10),
                    ARRAY_MOVE
                ]).exit();
            }
            return;
        }
        if (context.delta._t !== 'a') {
            return;
        }
        var name = void 0;
        var child = void 0;
        for(name in context.delta){
            if (name === '_t') {
                continue;
            }
            child = new ReverseContext(context.delta[name]);
            context.push(child, name);
        }
        context.exit();
    };
    reverseFilter$2.filterName = 'arrays';
    var reverseArrayDeltaIndex = function reverseArrayDeltaIndex(delta, index, itemDelta) {
        if (typeof index === 'string' && index[0] === '_') {
            return parseInt(index.substr(1), 10);
        } else if (isArray$2(itemDelta) && itemDelta[2] === 0) {
            return '_' + index;
        }
        var reverseIndex = +index;
        for(var deltaIndex in delta){
            var deltaItem = delta[deltaIndex];
            if (isArray$2(deltaItem)) {
                if (deltaItem[2] === ARRAY_MOVE) {
                    var moveFromIndex = parseInt(deltaIndex.substr(1), 10);
                    var moveToIndex = deltaItem[1];
                    if (moveToIndex === +index) {
                        return moveFromIndex;
                    }
                    if (moveFromIndex <= reverseIndex && moveToIndex > reverseIndex) {
                        reverseIndex++;
                    } else if (moveFromIndex >= reverseIndex && moveToIndex < reverseIndex) {
                        reverseIndex--;
                    }
                } else if (deltaItem[2] === 0) {
                    var deleteIndex = parseInt(deltaIndex.substr(1), 10);
                    if (deleteIndex <= reverseIndex) {
                        reverseIndex++;
                    }
                } else if (deltaItem.length === 1 && deltaIndex <= reverseIndex) {
                    reverseIndex--;
                }
            }
        }
        return reverseIndex;
    };
    function collectChildrenReverseFilter$1(context) {
        if (!context || !context.children) {
            return;
        }
        if (context.delta._t !== 'a') {
            return;
        }
        var length = context.children.length;
        var child = void 0;
        var delta = {
            _t: 'a'
        };
        for(var index = 0; index < length; index++){
            child = context.children[index];
            var name = child.newName;
            if (typeof name === 'undefined') {
                name = reverseArrayDeltaIndex(context.delta, child.childName, child.result);
            }
            if (delta[name] !== child.result) {
                delta[name] = child.result;
            }
        }
        context.setResult(delta).exit();
    }
    collectChildrenReverseFilter$1.filterName = 'arraysCollectChildren';
    var diffFilter$2 = function datesDiffFilter(context) {
        if (context.left instanceof Date) {
            if (context.right instanceof Date) {
                if (context.left.getTime() !== context.right.getTime()) {
                    context.setResult([
                        context.left,
                        context.right
                    ]);
                } else {
                    context.setResult(undefined);
                }
            } else {
                context.setResult([
                    context.left,
                    context.right
                ]);
            }
            context.exit();
        } else if (context.right instanceof Date) {
            context.setResult([
                context.left,
                context.right
            ]).exit();
        }
    };
    diffFilter$2.filterName = 'dates';
    function createCommonjsModule(fn, module1) {
        return module1 = {
            exports: {}
        }, fn(module1, module1.exports), module1.exports;
    }
    var diffMatchPatch = createCommonjsModule(function(module1) {
        function diff_match_patch1() {
            // Defaults.
            // Redefine these in your program to override the defaults.
            // Number of seconds to map a diff before giving up (0 for infinity).
            this.Diff_Timeout = 1.0;
            // Cost of an empty edit operation in terms of edit characters.
            this.Diff_EditCost = 4;
            // At what point is no match declared (0.0 = perfection, 1.0 = very loose).
            this.Match_Threshold = 0.5;
            // How far to search for a match (0 = exact location, 1000+ = broad match).
            // A match this many characters away from the expected location will add
            // 1.0 to the score (0.0 is a perfect match).
            this.Match_Distance = 1000;
            // When deleting a large block of text (over ~64 characters), how close do
            // the contents have to be to match the expected contents. (0.0 = perfection,
            // 1.0 = very loose).  Note that Match_Threshold controls how closely the
            // end points of a delete need to match.
            this.Patch_DeleteThreshold = 0.5;
            // Chunk size for context length.
            this.Patch_Margin = 4;
            // The number of bits in an int.
            this.Match_MaxBits = 32;
        }
        //  DIFF FUNCTIONS
        /**
 * The data structure representing a diff is an array of tuples:
 * [[DIFF_DELETE, 'Hello'], [DIFF_INSERT, 'Goodbye'], [DIFF_EQUAL, ' world.']]
 * which means: delete 'Hello', add 'Goodbye' and keep ' world.'
 */ var DIFF_DELETE = -1;
        var DIFF_INSERT = 1;
        var DIFF_EQUAL = 0;
        /** @typedef {{0: number, 1: string}} */ diff_match_patch1.prototype.diff_main = function(text1, text2, opt_checklines, opt_deadline) {
            // Set a deadline by which time the diff must be complete.
            if (typeof opt_deadline == 'undefined') {
                if (this.Diff_Timeout <= 0) {
                    opt_deadline = Number.MAX_VALUE;
                } else {
                    opt_deadline = (new Date).getTime() + this.Diff_Timeout * 1000;
                }
            }
            var deadline = opt_deadline;
            // Check for null inputs.
            if (text1 == null || text2 == null) {
                throw new Error('Null input. (diff_main)');
            }
            // Check for equality (speedup).
            if (text1 == text2) {
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
            if (typeof opt_checklines == 'undefined') {
                opt_checklines = true;
            }
            var checklines = opt_checklines;
            // Trim off common prefix (speedup).
            var commonlength = this.diff_commonPrefix(text1, text2);
            var commonprefix = text1.substring(0, commonlength);
            text1 = text1.substring(commonlength);
            text2 = text2.substring(commonlength);
            // Trim off common suffix (speedup).
            commonlength = this.diff_commonSuffix(text1, text2);
            var commonsuffix = text1.substring(text1.length - commonlength);
            text1 = text1.substring(0, text1.length - commonlength);
            text2 = text2.substring(0, text2.length - commonlength);
            // Compute the diff on the middle block.
            var diffs = this.diff_compute_(text1, text2, checklines, deadline);
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
            this.diff_cleanupMerge(diffs);
            return diffs;
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
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */ diff_match_patch1.prototype.diff_compute_ = function(text1, text2, checklines, deadline) {
            var diffs;
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
            var longtext = text1.length > text2.length ? text1 : text2;
            var shorttext = text1.length > text2.length ? text2 : text1;
            var i = longtext.indexOf(shorttext);
            if (i != -1) {
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
            if (shorttext.length == 1) {
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
            var hm = this.diff_halfMatch_(text1, text2);
            if (hm) {
                // A half-match was found, sort out the return data.
                var text1_a = hm[0];
                var text1_b = hm[1];
                var text2_a = hm[2];
                var text2_b = hm[3];
                var mid_common = hm[4];
                // Send both pairs off for separate processing.
                var diffs_a = this.diff_main(text1_a, text2_a, checklines, deadline);
                var diffs_b = this.diff_main(text1_b, text2_b, checklines, deadline);
                // Merge the results.
                return diffs_a.concat([
                    [
                        DIFF_EQUAL,
                        mid_common
                    ]
                ], diffs_b);
            }
            if (checklines && text1.length > 100 && text2.length > 100) {
                return this.diff_lineMode_(text1, text2, deadline);
            }
            return this.diff_bisect_(text1, text2, deadline);
        };
        /**
 * Do a quick line-level diff on both strings, then rediff the parts for
 * greater accuracy.
 * This speedup can produce non-minimal diffs.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {number} deadline Time when the diff should be complete by.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */ diff_match_patch1.prototype.diff_lineMode_ = function(text1, text2, deadline) {
            // Scan the text on a line-by-line basis first.
            var a = this.diff_linesToChars_(text1, text2);
            text1 = a.chars1;
            text2 = a.chars2;
            var linearray = a.lineArray;
            var diffs = this.diff_main(text1, text2, false, deadline);
            // Convert the diff back to original text.
            this.diff_charsToLines_(diffs, linearray);
            // Eliminate freak matches (e.g. blank lines)
            this.diff_cleanupSemantic(diffs);
            // Rediff any replacement blocks, this time character-by-character.
            // Add a dummy entry at the end.
            diffs.push([
                DIFF_EQUAL,
                ''
            ]);
            var pointer = 0;
            var count_delete = 0;
            var count_insert = 0;
            var text_delete = '';
            var text_insert = '';
            while(pointer < diffs.length){
                switch(diffs[pointer][0]){
                    case DIFF_INSERT:
                        count_insert++;
                        text_insert += diffs[pointer][1];
                        break;
                    case DIFF_DELETE:
                        count_delete++;
                        text_delete += diffs[pointer][1];
                        break;
                    case DIFF_EQUAL:
                        // Upon reaching an equality, check for prior redundancies.
                        if (count_delete >= 1 && count_insert >= 1) {
                            // Delete the offending records and add the merged ones.
                            diffs.splice(pointer - count_delete - count_insert, count_delete + count_insert);
                            pointer = pointer - count_delete - count_insert;
                            var a = this.diff_main(text_delete, text_insert, false, deadline);
                            for(var j = a.length - 1; j >= 0; j--){
                                diffs.splice(pointer, 0, a[j]);
                            }
                            pointer = pointer + a.length;
                        }
                        count_insert = 0;
                        count_delete = 0;
                        text_delete = '';
                        text_insert = '';
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
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */ diff_match_patch1.prototype.diff_bisect_ = function(text1, text2, deadline) {
            // Cache the text lengths to prevent multiple calls.
            var text1_length = text1.length;
            var text2_length = text2.length;
            var max_d = Math.ceil((text1_length + text2_length) / 2);
            var v_offset = max_d;
            var v_length = 2 * max_d;
            var v1 = new Array(v_length);
            var v2 = new Array(v_length);
            // Setting all elements to -1 is faster in Chrome & Firefox than mixing
            // integers and undefined.
            for(var x = 0; x < v_length; x++){
                v1[x] = -1;
                v2[x] = -1;
            }
            v1[v_offset + 1] = 0;
            v2[v_offset + 1] = 0;
            var delta = text1_length - text2_length;
            // If the total number of characters is odd, then the front path will collide
            // with the reverse path.
            var front = delta % 2 != 0;
            // Offsets for start and end of k loop.
            // Prevents mapping of space beyond the grid.
            var k1start = 0;
            var k1end = 0;
            var k2start = 0;
            var k2end = 0;
            for(var d = 0; d < max_d; d++){
                // Bail out if deadline is reached.
                if (new Date().getTime() > deadline) {
                    break;
                }
                // Walk the front path one step.
                for(var k1 = -d + k1start; k1 <= d - k1end; k1 += 2){
                    var k1_offset = v_offset + k1;
                    var x1;
                    if (k1 == -d || k1 != d && v1[k1_offset - 1] < v1[k1_offset + 1]) {
                        x1 = v1[k1_offset + 1];
                    } else {
                        x1 = v1[k1_offset - 1] + 1;
                    }
                    var y1 = x1 - k1;
                    while(x1 < text1_length && y1 < text2_length && text1.charAt(x1) == text2.charAt(y1)){
                        x1++;
                        y1++;
                    }
                    v1[k1_offset] = x1;
                    if (x1 > text1_length) {
                        // Ran off the right of the graph.
                        k1end += 2;
                    } else if (y1 > text2_length) {
                        // Ran off the bottom of the graph.
                        k1start += 2;
                    } else if (front) {
                        var k2_offset = v_offset + delta - k1;
                        if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] != -1) {
                            // Mirror x2 onto top-left coordinate system.
                            var x2 = text1_length - v2[k2_offset];
                            if (x1 >= x2) {
                                // Overlap detected.
                                return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
                            }
                        }
                    }
                }
                // Walk the reverse path one step.
                for(var k2 = -d + k2start; k2 <= d - k2end; k2 += 2){
                    var k2_offset = v_offset + k2;
                    var x2;
                    if (k2 == -d || k2 != d && v2[k2_offset - 1] < v2[k2_offset + 1]) {
                        x2 = v2[k2_offset + 1];
                    } else {
                        x2 = v2[k2_offset - 1] + 1;
                    }
                    var y2 = x2 - k2;
                    while(x2 < text1_length && y2 < text2_length && text1.charAt(text1_length - x2 - 1) == text2.charAt(text2_length - y2 - 1)){
                        x2++;
                        y2++;
                    }
                    v2[k2_offset] = x2;
                    if (x2 > text1_length) {
                        // Ran off the left of the graph.
                        k2end += 2;
                    } else if (y2 > text2_length) {
                        // Ran off the top of the graph.
                        k2start += 2;
                    } else if (!front) {
                        var k1_offset = v_offset + delta - k2;
                        if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] != -1) {
                            var x1 = v1[k1_offset];
                            var y1 = v_offset + x1 - k1_offset;
                            // Mirror x2 onto top-left coordinate system.
                            x2 = text1_length - x2;
                            if (x1 >= x2) {
                                // Overlap detected.
                                return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
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
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */ diff_match_patch1.prototype.diff_bisectSplit_ = function(text1, text2, x, y, deadline) {
            var text1a = text1.substring(0, x);
            var text2a = text2.substring(0, y);
            var text1b = text1.substring(x);
            var text2b = text2.substring(y);
            // Compute both diffs serially.
            var diffs = this.diff_main(text1a, text2a, false, deadline);
            var diffsb = this.diff_main(text1b, text2b, false, deadline);
            return diffs.concat(diffsb);
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
 */ diff_match_patch1.prototype.diff_linesToChars_ = function(text1, text2) {
            var lineArray = []; // e.g. lineArray[4] == 'Hello\n'
            var lineHash = {}; // e.g. lineHash['Hello\n'] == 4
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
   */ function diff_linesToCharsMunge_(text) {
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
                    if (lineEnd == -1) {
                        lineEnd = text.length - 1;
                    }
                    var line = text.substring(lineStart, lineEnd + 1);
                    lineStart = lineEnd + 1;
                    if (lineHash.hasOwnProperty ? lineHash.hasOwnProperty(line) : lineHash[line] !== undefined) {
                        chars += String.fromCharCode(lineHash[line]);
                    } else {
                        chars += String.fromCharCode(lineArrayLength);
                        lineHash[line] = lineArrayLength;
                        lineArray[lineArrayLength++] = line;
                    }
                }
                return chars;
            }
            var chars1 = diff_linesToCharsMunge_(text1);
            var chars2 = diff_linesToCharsMunge_(text2);
            return {
                chars1: chars1,
                chars2: chars2,
                lineArray: lineArray
            };
        };
        /**
 * Rehydrate the text in a diff from a string of line hashes to real lines of
 * text.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @param {!Array.<string>} lineArray Array of unique strings.
 * @private
 */ diff_match_patch1.prototype.diff_charsToLines_ = function(diffs, lineArray) {
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
 * Determine the common prefix of two strings.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the start of each
 *     string.
 */ diff_match_patch1.prototype.diff_commonPrefix = function(text1, text2) {
            // Quick check for common null cases.
            if (!text1 || !text2 || text1.charAt(0) != text2.charAt(0)) {
                return 0;
            }
            // Binary search.
            // Performance analysis: http://neil.fraser.name/news/2007/10/09/
            var pointermin = 0;
            var pointermax = Math.min(text1.length, text2.length);
            var pointermid = pointermax;
            var pointerstart = 0;
            while(pointermin < pointermid){
                if (text1.substring(pointerstart, pointermid) == text2.substring(pointerstart, pointermid)) {
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
 */ diff_match_patch1.prototype.diff_commonSuffix = function(text1, text2) {
            // Quick check for common null cases.
            if (!text1 || !text2 || text1.charAt(text1.length - 1) != text2.charAt(text2.length - 1)) {
                return 0;
            }
            // Binary search.
            // Performance analysis: http://neil.fraser.name/news/2007/10/09/
            var pointermin = 0;
            var pointermax = Math.min(text1.length, text2.length);
            var pointermid = pointermax;
            var pointerend = 0;
            while(pointermin < pointermid){
                if (text1.substring(text1.length - pointermid, text1.length - pointerend) == text2.substring(text2.length - pointermid, text2.length - pointerend)) {
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
 * Determine if the suffix of one string is the prefix of another.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the end of the first
 *     string and the start of the second string.
 * @private
 */ diff_match_patch1.prototype.diff_commonOverlap_ = function(text1, text2) {
            // Cache the text lengths to prevent multiple calls.
            var text1_length = text1.length;
            var text2_length = text2.length;
            // Eliminate the null case.
            if (text1_length == 0 || text2_length == 0) {
                return 0;
            }
            // Truncate the longer string.
            if (text1_length > text2_length) {
                text1 = text1.substring(text1_length - text2_length);
            } else if (text1_length < text2_length) {
                text2 = text2.substring(0, text1_length);
            }
            var text_length = Math.min(text1_length, text2_length);
            // Quick check for the worst case.
            if (text1 == text2) {
                return text_length;
            }
            // Start by looking for a single character match
            // and increase length until no match is found.
            // Performance analysis: http://neil.fraser.name/news/2010/11/04/
            var best = 0;
            var length = 1;
            while(true){
                var pattern = text1.substring(text_length - length);
                var found = text2.indexOf(pattern);
                if (found == -1) {
                    return best;
                }
                length += found;
                if (found == 0 || text1.substring(text_length - length) == text2.substring(0, length)) {
                    best = length;
                    length++;
                }
            }
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
 */ diff_match_patch1.prototype.diff_halfMatch_ = function(text1, text2) {
            if (this.Diff_Timeout <= 0) {
                // Don't risk returning a non-optimal diff if we have unlimited time.
                return null;
            }
            var longtext = text1.length > text2.length ? text1 : text2;
            var shorttext = text1.length > text2.length ? text2 : text1;
            if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
                return null; // Pointless.
            }
            var dmp = this; // 'this' becomes 'window' in a closure.
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
   */ function diff_halfMatchI_(longtext, shorttext, i) {
                // Start with a 1/4 length substring at position i as a seed.
                var seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
                var j = -1;
                var best_common = '';
                var best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;
                while((j = shorttext.indexOf(seed, j + 1)) != -1){
                    var prefixLength = dmp.diff_commonPrefix(longtext.substring(i), shorttext.substring(j));
                    var suffixLength = dmp.diff_commonSuffix(longtext.substring(0, i), shorttext.substring(0, j));
                    if (best_common.length < suffixLength + prefixLength) {
                        best_common = shorttext.substring(j - suffixLength, j) + shorttext.substring(j, j + prefixLength);
                        best_longtext_a = longtext.substring(0, i - suffixLength);
                        best_longtext_b = longtext.substring(i + prefixLength);
                        best_shorttext_a = shorttext.substring(0, j - suffixLength);
                        best_shorttext_b = shorttext.substring(j + prefixLength);
                    }
                }
                if (best_common.length * 2 >= longtext.length) {
                    return [
                        best_longtext_a,
                        best_longtext_b,
                        best_shorttext_a,
                        best_shorttext_b,
                        best_common
                    ];
                } else {
                    return null;
                }
            }
            // First check if the second quarter is the seed for a half-match.
            var hm1 = diff_halfMatchI_(longtext, shorttext, Math.ceil(longtext.length / 4));
            // Check again based on the third quarter.
            var hm2 = diff_halfMatchI_(longtext, shorttext, Math.ceil(longtext.length / 2));
            var hm;
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
            var text1_a, text1_b, text2_a, text2_b;
            if (text1.length > text2.length) {
                text1_a = hm[0];
                text1_b = hm[1];
                text2_a = hm[2];
                text2_b = hm[3];
            } else {
                text2_a = hm[0];
                text2_b = hm[1];
                text1_a = hm[2];
                text1_b = hm[3];
            }
            var mid_common = hm[4];
            return [
                text1_a,
                text1_b,
                text2_a,
                text2_b,
                mid_common
            ];
        };
        /**
 * Reduce the number of edits by eliminating semantically trivial equalities.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */ diff_match_patch1.prototype.diff_cleanupSemantic = function(diffs) {
            var changes = false;
            var equalities = []; // Stack of indices where equalities are found.
            var equalitiesLength = 0; // Keeping our own length var is faster in JS.
            /** @type {?string} */ var lastequality = null;
            // Always equal to diffs[equalities[equalitiesLength - 1]][1]
            var pointer = 0; // Index of current position.
            // Number of characters that changed prior to the equality.
            var length_insertions1 = 0;
            var length_deletions1 = 0;
            // Number of characters that changed after the equality.
            var length_insertions2 = 0;
            var length_deletions2 = 0;
            while(pointer < diffs.length){
                if (diffs[pointer][0] == DIFF_EQUAL) {
                    equalities[equalitiesLength++] = pointer;
                    length_insertions1 = length_insertions2;
                    length_deletions1 = length_deletions2;
                    length_insertions2 = 0;
                    length_deletions2 = 0;
                    lastequality = diffs[pointer][1];
                } else {
                    if (diffs[pointer][0] == DIFF_INSERT) {
                        length_insertions2 += diffs[pointer][1].length;
                    } else {
                        length_deletions2 += diffs[pointer][1].length;
                    }
                    // Eliminate an equality that is smaller or equal to the edits on both
                    // sides of it.
                    if (lastequality && lastequality.length <= Math.max(length_insertions1, length_deletions1) && lastequality.length <= Math.max(length_insertions2, length_deletions2)) {
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
                        length_insertions1 = 0; // Reset the counters.
                        length_deletions1 = 0;
                        length_insertions2 = 0;
                        length_deletions2 = 0;
                        lastequality = null;
                        changes = true;
                    }
                }
                pointer++;
            }
            // Normalize the diff.
            if (changes) {
                this.diff_cleanupMerge(diffs);
            }
            this.diff_cleanupSemanticLossless(diffs);
            // Find any overlaps between deletions and insertions.
            // e.g: <del>abcxxx</del><ins>xxxdef</ins>
            //   -> <del>abc</del>xxx<ins>def</ins>
            // e.g: <del>xxxabc</del><ins>defxxx</ins>
            //   -> <ins>def</ins>xxx<del>abc</del>
            // Only extract an overlap if it is as big as the edit ahead or behind it.
            pointer = 1;
            while(pointer < diffs.length){
                if (diffs[pointer - 1][0] == DIFF_DELETE && diffs[pointer][0] == DIFF_INSERT) {
                    var deletion = diffs[pointer - 1][1];
                    var insertion = diffs[pointer][1];
                    var overlap_length1 = this.diff_commonOverlap_(deletion, insertion);
                    var overlap_length2 = this.diff_commonOverlap_(insertion, deletion);
                    if (overlap_length1 >= overlap_length2) {
                        if (overlap_length1 >= deletion.length / 2 || overlap_length1 >= insertion.length / 2) {
                            // Overlap found.  Insert an equality and trim the surrounding edits.
                            diffs.splice(pointer, 0, [
                                DIFF_EQUAL,
                                insertion.substring(0, overlap_length1)
                            ]);
                            diffs[pointer - 1][1] = deletion.substring(0, deletion.length - overlap_length1);
                            diffs[pointer + 1][1] = insertion.substring(overlap_length1);
                            pointer++;
                        }
                    } else {
                        if (overlap_length2 >= deletion.length / 2 || overlap_length2 >= insertion.length / 2) {
                            // Reverse overlap found.
                            // Insert an equality and swap and trim the surrounding edits.
                            diffs.splice(pointer, 0, [
                                DIFF_EQUAL,
                                deletion.substring(0, overlap_length2)
                            ]);
                            diffs[pointer - 1][0] = DIFF_INSERT;
                            diffs[pointer - 1][1] = insertion.substring(0, insertion.length - overlap_length2);
                            diffs[pointer + 1][0] = DIFF_DELETE;
                            diffs[pointer + 1][1] = deletion.substring(overlap_length2);
                            pointer++;
                        }
                    }
                    pointer++;
                }
                pointer++;
            }
        };
        /**
 * Look for single edits surrounded on both sides by equalities
 * which can be shifted sideways to align the edit to a word boundary.
 * e.g: The c<ins>at c</ins>ame. -> The <ins>cat </ins>came.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */ diff_match_patch1.prototype.diff_cleanupSemanticLossless = function(diffs) {
            /**
   * Given two strings, compute a score representing whether the internal
   * boundary falls on logical boundaries.
   * Scores range from 6 (best) to 0 (worst).
   * Closure, but does not reference any external variables.
   * @param {string} one First string.
   * @param {string} two Second string.
   * @return {number} The score.
   * @private
   */ function diff_cleanupSemanticScore_(one, two) {
                if (!one || !two) {
                    // Edges are the best.
                    return 6;
                }
                // Each port of this function behaves slightly differently due to
                // subtle differences in each language's definition of things like
                // 'whitespace'.  Since this function's purpose is largely cosmetic,
                // the choice has been made to use each language's native features
                // rather than force total conformity.
                var char1 = one.charAt(one.length - 1);
                var char2 = two.charAt(0);
                var nonAlphaNumeric1 = char1.match(diff_match_patch1.nonAlphaNumericRegex_);
                var nonAlphaNumeric2 = char2.match(diff_match_patch1.nonAlphaNumericRegex_);
                var whitespace1 = nonAlphaNumeric1 && char1.match(diff_match_patch1.whitespaceRegex_);
                var whitespace2 = nonAlphaNumeric2 && char2.match(diff_match_patch1.whitespaceRegex_);
                var lineBreak1 = whitespace1 && char1.match(diff_match_patch1.linebreakRegex_);
                var lineBreak2 = whitespace2 && char2.match(diff_match_patch1.linebreakRegex_);
                var blankLine1 = lineBreak1 && one.match(diff_match_patch1.blanklineEndRegex_);
                var blankLine2 = lineBreak2 && two.match(diff_match_patch1.blanklineStartRegex_);
                if (blankLine1 || blankLine2) {
                    // Five points for blank lines.
                    return 5;
                } else if (lineBreak1 || lineBreak2) {
                    // Four points for line breaks.
                    return 4;
                } else if (nonAlphaNumeric1 && !whitespace1 && whitespace2) {
                    // Three points for end of sentences.
                    return 3;
                } else if (whitespace1 || whitespace2) {
                    // Two points for whitespace.
                    return 2;
                } else if (nonAlphaNumeric1 || nonAlphaNumeric2) {
                    // One point for non-alphanumeric.
                    return 1;
                }
                return 0;
            }
            var pointer = 1;
            // Intentionally ignore the first and last element (don't need checking).
            while(pointer < diffs.length - 1){
                if (diffs[pointer - 1][0] == DIFF_EQUAL && diffs[pointer + 1][0] == DIFF_EQUAL) {
                    // This is a single edit surrounded by equalities.
                    var equality1 = diffs[pointer - 1][1];
                    var edit = diffs[pointer][1];
                    var equality2 = diffs[pointer + 1][1];
                    // First, shift the edit as far left as possible.
                    var commonOffset = this.diff_commonSuffix(equality1, edit);
                    if (commonOffset) {
                        var commonString = edit.substring(edit.length - commonOffset);
                        equality1 = equality1.substring(0, equality1.length - commonOffset);
                        edit = commonString + edit.substring(0, edit.length - commonOffset);
                        equality2 = commonString + equality2;
                    }
                    // Second, step character by character right, looking for the best fit.
                    var bestEquality1 = equality1;
                    var bestEdit = edit;
                    var bestEquality2 = equality2;
                    var bestScore = diff_cleanupSemanticScore_(equality1, edit) + diff_cleanupSemanticScore_(edit, equality2);
                    while(edit.charAt(0) === equality2.charAt(0)){
                        equality1 += edit.charAt(0);
                        edit = edit.substring(1) + equality2.charAt(0);
                        equality2 = equality2.substring(1);
                        var score = diff_cleanupSemanticScore_(equality1, edit) + diff_cleanupSemanticScore_(edit, equality2);
                        // The >= encourages trailing rather than leading whitespace on edits.
                        if (score >= bestScore) {
                            bestScore = score;
                            bestEquality1 = equality1;
                            bestEdit = edit;
                            bestEquality2 = equality2;
                        }
                    }
                    if (diffs[pointer - 1][1] != bestEquality1) {
                        // We have an improvement, save it back to the diff.
                        if (bestEquality1) {
                            diffs[pointer - 1][1] = bestEquality1;
                        } else {
                            diffs.splice(pointer - 1, 1);
                            pointer--;
                        }
                        diffs[pointer][1] = bestEdit;
                        if (bestEquality2) {
                            diffs[pointer + 1][1] = bestEquality2;
                        } else {
                            diffs.splice(pointer + 1, 1);
                            pointer--;
                        }
                    }
                }
                pointer++;
            }
        };
        // Define some regex patterns for matching boundaries.
        diff_match_patch1.nonAlphaNumericRegex_ = /[^a-zA-Z0-9]/;
        diff_match_patch1.whitespaceRegex_ = /\s/;
        diff_match_patch1.linebreakRegex_ = /[\r\n]/;
        diff_match_patch1.blanklineEndRegex_ = /\n\r?\n$/;
        diff_match_patch1.blanklineStartRegex_ = /^\r?\n\r?\n/;
        /**
 * Reduce the number of edits by eliminating operationally trivial equalities.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */ diff_match_patch1.prototype.diff_cleanupEfficiency = function(diffs) {
            var changes = false;
            var equalities = []; // Stack of indices where equalities are found.
            var equalitiesLength = 0; // Keeping our own length var is faster in JS.
            /** @type {?string} */ var lastequality = null;
            // Always equal to diffs[equalities[equalitiesLength - 1]][1]
            var pointer = 0; // Index of current position.
            // Is there an insertion operation before the last equality.
            var pre_ins = false;
            // Is there a deletion operation before the last equality.
            var pre_del = false;
            // Is there an insertion operation after the last equality.
            var post_ins = false;
            // Is there a deletion operation after the last equality.
            var post_del = false;
            while(pointer < diffs.length){
                if (diffs[pointer][0] == DIFF_EQUAL) {
                    if (diffs[pointer][1].length < this.Diff_EditCost && (post_ins || post_del)) {
                        // Candidate found.
                        equalities[equalitiesLength++] = pointer;
                        pre_ins = post_ins;
                        pre_del = post_del;
                        lastequality = diffs[pointer][1];
                    } else {
                        // Not a candidate, and can never become one.
                        equalitiesLength = 0;
                        lastequality = null;
                    }
                    post_ins = post_del = false;
                } else {
                    if (diffs[pointer][0] == DIFF_DELETE) {
                        post_del = true;
                    } else {
                        post_ins = true;
                    }
                    /*
       * Five types to be split:
       * <ins>A</ins><del>B</del>XY<ins>C</ins><del>D</del>
       * <ins>A</ins>X<ins>C</ins><del>D</del>
       * <ins>A</ins><del>B</del>X<ins>C</ins>
       * <ins>A</del>X<ins>C</ins><del>D</del>
       * <ins>A</ins><del>B</del>X<del>C</del>
       */ if (lastequality && (pre_ins && pre_del && post_ins && post_del || lastequality.length < this.Diff_EditCost / 2 && pre_ins + pre_del + post_ins + post_del == 3)) {
                        // Duplicate record.
                        diffs.splice(equalities[equalitiesLength - 1], 0, [
                            DIFF_DELETE,
                            lastequality
                        ]);
                        // Change second copy to insert.
                        diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
                        equalitiesLength--; // Throw away the equality we just deleted;
                        lastequality = null;
                        if (pre_ins && pre_del) {
                            // No changes made which could affect previous entry, keep going.
                            post_ins = post_del = true;
                            equalitiesLength = 0;
                        } else {
                            equalitiesLength--; // Throw away the previous equality.
                            pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
                            post_ins = post_del = false;
                        }
                        changes = true;
                    }
                }
                pointer++;
            }
            if (changes) {
                this.diff_cleanupMerge(diffs);
            }
        };
        /**
 * Reorder and merge like edit sections.  Merge equalities.
 * Any edit section can move as long as it doesn't cross an equality.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */ diff_match_patch1.prototype.diff_cleanupMerge = function(diffs) {
            diffs.push([
                DIFF_EQUAL,
                ''
            ]); // Add a dummy entry at the end.
            var pointer = 0;
            var count_delete = 0;
            var count_insert = 0;
            var text_delete = '';
            var text_insert = '';
            var commonlength;
            while(pointer < diffs.length){
                switch(diffs[pointer][0]){
                    case DIFF_INSERT:
                        count_insert++;
                        text_insert += diffs[pointer][1];
                        pointer++;
                        break;
                    case DIFF_DELETE:
                        count_delete++;
                        text_delete += diffs[pointer][1];
                        pointer++;
                        break;
                    case DIFF_EQUAL:
                        // Upon reaching an equality, check for prior redundancies.
                        if (count_delete + count_insert > 1) {
                            if (count_delete !== 0 && count_insert !== 0) {
                                // Factor out any common prefixies.
                                commonlength = this.diff_commonPrefix(text_insert, text_delete);
                                if (commonlength !== 0) {
                                    if (pointer - count_delete - count_insert > 0 && diffs[pointer - count_delete - count_insert - 1][0] == DIFF_EQUAL) {
                                        diffs[pointer - count_delete - count_insert - 1][1] += text_insert.substring(0, commonlength);
                                    } else {
                                        diffs.splice(0, 0, [
                                            DIFF_EQUAL,
                                            text_insert.substring(0, commonlength)
                                        ]);
                                        pointer++;
                                    }
                                    text_insert = text_insert.substring(commonlength);
                                    text_delete = text_delete.substring(commonlength);
                                }
                                // Factor out any common suffixies.
                                commonlength = this.diff_commonSuffix(text_insert, text_delete);
                                if (commonlength !== 0) {
                                    diffs[pointer][1] = text_insert.substring(text_insert.length - commonlength) + diffs[pointer][1];
                                    text_insert = text_insert.substring(0, text_insert.length - commonlength);
                                    text_delete = text_delete.substring(0, text_delete.length - commonlength);
                                }
                            }
                            // Delete the offending records and add the merged ones.
                            if (count_delete === 0) {
                                diffs.splice(pointer - count_insert, count_delete + count_insert, [
                                    DIFF_INSERT,
                                    text_insert
                                ]);
                            } else if (count_insert === 0) {
                                diffs.splice(pointer - count_delete, count_delete + count_insert, [
                                    DIFF_DELETE,
                                    text_delete
                                ]);
                            } else {
                                diffs.splice(pointer - count_delete - count_insert, count_delete + count_insert, [
                                    DIFF_DELETE,
                                    text_delete
                                ], [
                                    DIFF_INSERT,
                                    text_insert
                                ]);
                            }
                            pointer = pointer - count_delete - count_insert + (count_delete ? 1 : 0) + (count_insert ? 1 : 0) + 1;
                        } else if (pointer !== 0 && diffs[pointer - 1][0] == DIFF_EQUAL) {
                            // Merge this equality with the previous one.
                            diffs[pointer - 1][1] += diffs[pointer][1];
                            diffs.splice(pointer, 1);
                        } else {
                            pointer++;
                        }
                        count_insert = 0;
                        count_delete = 0;
                        text_delete = '';
                        text_insert = '';
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
                if (diffs[pointer - 1][0] == DIFF_EQUAL && diffs[pointer + 1][0] == DIFF_EQUAL) {
                    // This is a single edit surrounded by equalities.
                    if (diffs[pointer][1].substring(diffs[pointer][1].length - diffs[pointer - 1][1].length) == diffs[pointer - 1][1]) {
                        // Shift the edit over the previous equality.
                        diffs[pointer][1] = diffs[pointer - 1][1] + diffs[pointer][1].substring(0, diffs[pointer][1].length - diffs[pointer - 1][1].length);
                        diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
                        diffs.splice(pointer - 1, 1);
                        changes = true;
                    } else if (diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) == diffs[pointer + 1][1]) {
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
                this.diff_cleanupMerge(diffs);
            }
        };
        /**
 * loc is a location in text1, compute and return the equivalent location in
 * text2.
 * e.g. 'The cat' vs 'The big cat', 1->1, 5->8
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @param {number} loc Location within text1.
 * @return {number} Location within text2.
 */ diff_match_patch1.prototype.diff_xIndex = function(diffs, loc) {
            var chars1 = 0;
            var chars2 = 0;
            var last_chars1 = 0;
            var last_chars2 = 0;
            var x;
            for(x = 0; x < diffs.length; x++){
                if (diffs[x][0] !== DIFF_INSERT) {
                    chars1 += diffs[x][1].length;
                }
                if (diffs[x][0] !== DIFF_DELETE) {
                    chars2 += diffs[x][1].length;
                }
                if (chars1 > loc) {
                    break;
                }
                last_chars1 = chars1;
                last_chars2 = chars2;
            }
            // Was the location was deleted?
            if (diffs.length != x && diffs[x][0] === DIFF_DELETE) {
                return last_chars2;
            }
            // Add the remaining character length.
            return last_chars2 + (loc - last_chars1);
        };
        /**
 * Convert a diff array into a pretty HTML report.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} HTML representation.
 */ diff_match_patch1.prototype.diff_prettyHtml = function(diffs) {
            var html = [];
            var pattern_amp = /&/g;
            var pattern_lt = /</g;
            var pattern_gt = />/g;
            var pattern_para = /\n/g;
            for(var x = 0; x < diffs.length; x++){
                var op = diffs[x][0]; // Operation (insert, delete, equal)
                var data = diffs[x][1]; // Text of change.
                var text = data.replace(pattern_amp, '&amp;').replace(pattern_lt, '&lt;').replace(pattern_gt, '&gt;').replace(pattern_para, '&para;<br>');
                switch(op){
                    case DIFF_INSERT:
                        html[x] = '<ins style="background:#e6ffe6;">' + text + '</ins>';
                        break;
                    case DIFF_DELETE:
                        html[x] = '<del style="background:#ffe6e6;">' + text + '</del>';
                        break;
                    case DIFF_EQUAL:
                        html[x] = '<span>' + text + '</span>';
                        break;
                }
            }
            return html.join('');
        };
        /**
 * Compute and return the source text (all equalities and deletions).
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} Source text.
 */ diff_match_patch1.prototype.diff_text1 = function(diffs) {
            var text = [];
            for(var x = 0; x < diffs.length; x++){
                if (diffs[x][0] !== DIFF_INSERT) {
                    text[x] = diffs[x][1];
                }
            }
            return text.join('');
        };
        /**
 * Compute and return the destination text (all equalities and insertions).
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} Destination text.
 */ diff_match_patch1.prototype.diff_text2 = function(diffs) {
            var text = [];
            for(var x = 0; x < diffs.length; x++){
                if (diffs[x][0] !== DIFF_DELETE) {
                    text[x] = diffs[x][1];
                }
            }
            return text.join('');
        };
        /**
 * Compute the Levenshtein distance; the number of inserted, deleted or
 * substituted characters.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {number} Number of changes.
 */ diff_match_patch1.prototype.diff_levenshtein = function(diffs) {
            var levenshtein = 0;
            var insertions = 0;
            var deletions = 0;
            for(var x = 0; x < diffs.length; x++){
                var op = diffs[x][0];
                var data = diffs[x][1];
                switch(op){
                    case DIFF_INSERT:
                        insertions += data.length;
                        break;
                    case DIFF_DELETE:
                        deletions += data.length;
                        break;
                    case DIFF_EQUAL:
                        // A deletion and an insertion is one substitution.
                        levenshtein += Math.max(insertions, deletions);
                        insertions = 0;
                        deletions = 0;
                        break;
                }
            }
            levenshtein += Math.max(insertions, deletions);
            return levenshtein;
        };
        /**
 * Crush the diff into an encoded string which describes the operations
 * required to transform text1 into text2.
 * E.g. =3\t-2\t+ing  -> Keep 3 chars, delete 2 chars, insert 'ing'.
 * Operations are tab-separated.  Inserted text is escaped using %xx notation.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} Delta text.
 */ diff_match_patch1.prototype.diff_toDelta = function(diffs) {
            var text = [];
            for(var x = 0; x < diffs.length; x++){
                switch(diffs[x][0]){
                    case DIFF_INSERT:
                        text[x] = '+' + encodeURI(diffs[x][1]);
                        break;
                    case DIFF_DELETE:
                        text[x] = '-' + diffs[x][1].length;
                        break;
                    case DIFF_EQUAL:
                        text[x] = '=' + diffs[x][1].length;
                        break;
                }
            }
            return text.join('\t').replace(/%20/g, ' ');
        };
        /**
 * Given the original text1, and an encoded string which describes the
 * operations required to transform text1 into text2, compute the full diff.
 * @param {string} text1 Source string for the diff.
 * @param {string} delta Delta text.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @throws {!Error} If invalid input.
 */ diff_match_patch1.prototype.diff_fromDelta = function(text1, delta) {
            var diffs = [];
            var diffsLength = 0; // Keeping our own length var is faster in JS.
            var pointer = 0; // Cursor in text1
            var tokens = delta.split(/\t/g);
            for(var x = 0; x < tokens.length; x++){
                // Each token begins with a one character parameter which specifies the
                // operation of this token (delete, insert, equality).
                var param = tokens[x].substring(1);
                switch(tokens[x].charAt(0)){
                    case '+':
                        try {
                            diffs[diffsLength++] = [
                                DIFF_INSERT,
                                decodeURI(param)
                            ];
                        } catch (ex) {
                            // Malformed URI sequence.
                            throw new Error('Illegal escape in diff_fromDelta: ' + param);
                        }
                        break;
                    case '-':
                    // Fall through.
                    case '=':
                        var n = parseInt(param, 10);
                        if (isNaN(n) || n < 0) {
                            throw new Error('Invalid number in diff_fromDelta: ' + param);
                        }
                        var text = text1.substring(pointer, pointer += n);
                        if (tokens[x].charAt(0) == '=') {
                            diffs[diffsLength++] = [
                                DIFF_EQUAL,
                                text
                            ];
                        } else {
                            diffs[diffsLength++] = [
                                DIFF_DELETE,
                                text
                            ];
                        }
                        break;
                    default:
                        // Blank tokens are ok (from a trailing \t).
                        // Anything else is an error.
                        if (tokens[x]) {
                            throw new Error('Invalid diff operation in diff_fromDelta: ' + tokens[x]);
                        }
                }
            }
            if (pointer != text1.length) {
                throw new Error('Delta length (' + pointer + ') does not equal source text length (' + text1.length + ').');
            }
            return diffs;
        };
        //  MATCH FUNCTIONS
        /**
 * Locate the best instance of 'pattern' in 'text' near 'loc'.
 * @param {string} text The text to search.
 * @param {string} pattern The pattern to search for.
 * @param {number} loc The location to search around.
 * @return {number} Best match index or -1.
 */ diff_match_patch1.prototype.match_main = function(text, pattern, loc) {
            // Check for null inputs.
            if (text == null || pattern == null || loc == null) {
                throw new Error('Null input. (match_main)');
            }
            loc = Math.max(0, Math.min(loc, text.length));
            if (text == pattern) {
                // Shortcut (potentially not guaranteed by the algorithm)
                return 0;
            } else if (!text.length) {
                // Nothing to match.
                return -1;
            } else if (text.substring(loc, loc + pattern.length) == pattern) {
                // Perfect match at the perfect spot!  (Includes case of null pattern)
                return loc;
            } else {
                // Do a fuzzy compare.
                return this.match_bitap_(text, pattern, loc);
            }
        };
        /**
 * Locate the best instance of 'pattern' in 'text' near 'loc' using the
 * Bitap algorithm.
 * @param {string} text The text to search.
 * @param {string} pattern The pattern to search for.
 * @param {number} loc The location to search around.
 * @return {number} Best match index or -1.
 * @private
 */ diff_match_patch1.prototype.match_bitap_ = function(text, pattern, loc) {
            if (pattern.length > this.Match_MaxBits) {
                throw new Error('Pattern too long for this browser.');
            }
            // Initialise the alphabet.
            var s = this.match_alphabet_(pattern);
            var dmp = this; // 'this' becomes 'window' in a closure.
            /**
   * Compute and return the score for a match with e errors and x location.
   * Accesses loc and pattern through being a closure.
   * @param {number} e Number of errors in match.
   * @param {number} x Location of match.
   * @return {number} Overall score for match (0.0 = good, 1.0 = bad).
   * @private
   */ function match_bitapScore_(e, x) {
                var accuracy = e / pattern.length;
                var proximity = Math.abs(loc - x);
                if (!dmp.Match_Distance) {
                    // Dodge divide by zero error.
                    return proximity ? 1.0 : accuracy;
                }
                return accuracy + proximity / dmp.Match_Distance;
            }
            // Highest score beyond which we give up.
            var score_threshold = this.Match_Threshold;
            // Is there a nearby exact match? (speedup)
            var best_loc = text.indexOf(pattern, loc);
            if (best_loc != -1) {
                score_threshold = Math.min(match_bitapScore_(0, best_loc), score_threshold);
                // What about in the other direction? (speedup)
                best_loc = text.lastIndexOf(pattern, loc + pattern.length);
                if (best_loc != -1) {
                    score_threshold = Math.min(match_bitapScore_(0, best_loc), score_threshold);
                }
            }
            // Initialise the bit arrays.
            var matchmask = 1 << pattern.length - 1;
            best_loc = -1;
            var bin_min, bin_mid;
            var bin_max = pattern.length + text.length;
            var last_rd;
            for(var d = 0; d < pattern.length; d++){
                // Scan for the best match; each iteration allows for one more error.
                // Run a binary search to determine how far from 'loc' we can stray at this
                // error level.
                bin_min = 0;
                bin_mid = bin_max;
                while(bin_min < bin_mid){
                    if (match_bitapScore_(d, loc + bin_mid) <= score_threshold) {
                        bin_min = bin_mid;
                    } else {
                        bin_max = bin_mid;
                    }
                    bin_mid = Math.floor((bin_max - bin_min) / 2 + bin_min);
                }
                // Use the result from this iteration as the maximum for the next.
                bin_max = bin_mid;
                var start = Math.max(1, loc - bin_mid + 1);
                var finish = Math.min(loc + bin_mid, text.length) + pattern.length;
                var rd = Array(finish + 2);
                rd[finish + 1] = (1 << d) - 1;
                for(var j = finish; j >= start; j--){
                    // The alphabet (s) is a sparse hash, so the following line generates
                    // warnings.
                    var charMatch = s[text.charAt(j - 1)];
                    if (d === 0) {
                        rd[j] = (rd[j + 1] << 1 | 1) & charMatch;
                    } else {
                        rd[j] = (rd[j + 1] << 1 | 1) & charMatch | ((last_rd[j + 1] | last_rd[j]) << 1 | 1) | last_rd[j + 1];
                    }
                    if (rd[j] & matchmask) {
                        var score = match_bitapScore_(d, j - 1);
                        // This match will almost certainly be better than any existing match.
                        // But check anyway.
                        if (score <= score_threshold) {
                            // Told you so.
                            score_threshold = score;
                            best_loc = j - 1;
                            if (best_loc > loc) {
                                // When passing loc, don't exceed our current distance from loc.
                                start = Math.max(1, 2 * loc - best_loc);
                            } else {
                                break;
                            }
                        }
                    }
                }
                // No hope for a (better) match at greater error levels.
                if (match_bitapScore_(d + 1, loc) > score_threshold) {
                    break;
                }
                last_rd = rd;
            }
            return best_loc;
        };
        /**
 * Initialise the alphabet for the Bitap algorithm.
 * @param {string} pattern The text to encode.
 * @return {!Object} Hash of character locations.
 * @private
 */ diff_match_patch1.prototype.match_alphabet_ = function(pattern) {
            var s = {};
            for(var i = 0; i < pattern.length; i++){
                s[pattern.charAt(i)] = 0;
            }
            for(var i = 0; i < pattern.length; i++){
                s[pattern.charAt(i)] |= 1 << pattern.length - i - 1;
            }
            return s;
        };
        //  PATCH FUNCTIONS
        /**
 * Increase the context until it is unique,
 * but don't let the pattern expand beyond Match_MaxBits.
 * @param {!diff_match_patch.patch_obj} patch The patch to grow.
 * @param {string} text Source text.
 * @private
 */ diff_match_patch1.prototype.patch_addContext_ = function(patch, text) {
            if (text.length == 0) {
                return;
            }
            var pattern = text.substring(patch.start2, patch.start2 + patch.length1);
            var padding = 0;
            // Look for the first and last matches of pattern in text.  If two different
            // matches are found, increase the pattern length.
            while(text.indexOf(pattern) != text.lastIndexOf(pattern) && pattern.length < this.Match_MaxBits - this.Patch_Margin - this.Patch_Margin){
                padding += this.Patch_Margin;
                pattern = text.substring(patch.start2 - padding, patch.start2 + patch.length1 + padding);
            }
            // Add one chunk for good luck.
            padding += this.Patch_Margin;
            // Add the prefix.
            var prefix = text.substring(patch.start2 - padding, patch.start2);
            if (prefix) {
                patch.diffs.unshift([
                    DIFF_EQUAL,
                    prefix
                ]);
            }
            // Add the suffix.
            var suffix = text.substring(patch.start2 + patch.length1, patch.start2 + patch.length1 + padding);
            if (suffix) {
                patch.diffs.push([
                    DIFF_EQUAL,
                    suffix
                ]);
            }
            // Roll back the start points.
            patch.start1 -= prefix.length;
            patch.start2 -= prefix.length;
            // Extend the lengths.
            patch.length1 += prefix.length + suffix.length;
            patch.length2 += prefix.length + suffix.length;
        };
        /**
 * Compute a list of patches to turn text1 into text2.
 * Use diffs if provided, otherwise compute it ourselves.
 * There are four ways to call this function, depending on what data is
 * available to the caller:
 * Method 1:
 * a = text1, b = text2
 * Method 2:
 * a = diffs
 * Method 3 (optimal):
 * a = text1, b = diffs
 * Method 4 (deprecated, use method 3):
 * a = text1, b = text2, c = diffs
 *
 * @param {string|!Array.<!diff_match_patch.Diff>} a text1 (methods 1,3,4) or
 * Array of diff tuples for text1 to text2 (method 2).
 * @param {string|!Array.<!diff_match_patch.Diff>} opt_b text2 (methods 1,4) or
 * Array of diff tuples for text1 to text2 (method 3) or undefined (method 2).
 * @param {string|!Array.<!diff_match_patch.Diff>} opt_c Array of diff tuples
 * for text1 to text2 (method 4) or undefined (methods 1,2,3).
 * @return {!Array.<!diff_match_patch.patch_obj>} Array of Patch objects.
 */ diff_match_patch1.prototype.patch_make = function(a, opt_b, opt_c) {
            var text1, diffs;
            if (typeof a == 'string' && typeof opt_b == 'string' && typeof opt_c == 'undefined') {
                // Method 1: text1, text2
                // Compute diffs from text1 and text2.
                text1 = /** @type {string} */ a;
                diffs = this.diff_main(text1, /** @type {string} */ opt_b, true);
                if (diffs.length > 2) {
                    this.diff_cleanupSemantic(diffs);
                    this.diff_cleanupEfficiency(diffs);
                }
            } else if (a && typeof a == 'object' && typeof opt_b == 'undefined' && typeof opt_c == 'undefined') {
                // Method 2: diffs
                // Compute text1 from diffs.
                diffs = /** @type {!Array.<!diff_match_patch.Diff>} */ a;
                text1 = this.diff_text1(diffs);
            } else if (typeof a == 'string' && opt_b && typeof opt_b == 'object' && typeof opt_c == 'undefined') {
                // Method 3: text1, diffs
                text1 = /** @type {string} */ a;
                diffs = /** @type {!Array.<!diff_match_patch.Diff>} */ opt_b;
            } else if (typeof a == 'string' && typeof opt_b == 'string' && opt_c && typeof opt_c == 'object') {
                // Method 4: text1, text2, diffs
                // text2 is not used.
                text1 = /** @type {string} */ a;
                diffs = /** @type {!Array.<!diff_match_patch.Diff>} */ opt_c;
            } else {
                throw new Error('Unknown call format to patch_make.');
            }
            if (diffs.length === 0) {
                return []; // Get rid of the null case.
            }
            var patches = [];
            var patch = new diff_match_patch1.patch_obj();
            var patchDiffLength = 0; // Keeping our own length var is faster in JS.
            var char_count1 = 0; // Number of characters into the text1 string.
            var char_count2 = 0; // Number of characters into the text2 string.
            // Start with text1 (prepatch_text) and apply the diffs until we arrive at
            // text2 (postpatch_text).  We recreate the patches one by one to determine
            // context info.
            var prepatch_text = text1;
            var postpatch_text = text1;
            for(var x = 0; x < diffs.length; x++){
                var diff_type = diffs[x][0];
                var diff_text = diffs[x][1];
                if (!patchDiffLength && diff_type !== DIFF_EQUAL) {
                    // A new patch starts here.
                    patch.start1 = char_count1;
                    patch.start2 = char_count2;
                }
                switch(diff_type){
                    case DIFF_INSERT:
                        patch.diffs[patchDiffLength++] = diffs[x];
                        patch.length2 += diff_text.length;
                        postpatch_text = postpatch_text.substring(0, char_count2) + diff_text + postpatch_text.substring(char_count2);
                        break;
                    case DIFF_DELETE:
                        patch.length1 += diff_text.length;
                        patch.diffs[patchDiffLength++] = diffs[x];
                        postpatch_text = postpatch_text.substring(0, char_count2) + postpatch_text.substring(char_count2 + diff_text.length);
                        break;
                    case DIFF_EQUAL:
                        if (diff_text.length <= 2 * this.Patch_Margin && patchDiffLength && diffs.length != x + 1) {
                            // Small equality inside a patch.
                            patch.diffs[patchDiffLength++] = diffs[x];
                            patch.length1 += diff_text.length;
                            patch.length2 += diff_text.length;
                        } else if (diff_text.length >= 2 * this.Patch_Margin) {
                            // Time for a new patch.
                            if (patchDiffLength) {
                                this.patch_addContext_(patch, prepatch_text);
                                patches.push(patch);
                                patch = new diff_match_patch1.patch_obj();
                                patchDiffLength = 0;
                                // Unlike Unidiff, our patch lists have a rolling context.
                                // http://code.google.com/p/google-diff-match-patch/wiki/Unidiff
                                // Update prepatch text & pos to reflect the application of the
                                // just completed patch.
                                prepatch_text = postpatch_text;
                                char_count1 = char_count2;
                            }
                        }
                        break;
                }
                // Update the current character count.
                if (diff_type !== DIFF_INSERT) {
                    char_count1 += diff_text.length;
                }
                if (diff_type !== DIFF_DELETE) {
                    char_count2 += diff_text.length;
                }
            }
            // Pick up the leftover patch if not empty.
            if (patchDiffLength) {
                this.patch_addContext_(patch, prepatch_text);
                patches.push(patch);
            }
            return patches;
        };
        /**
 * Given an array of patches, return another array that is identical.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 * @return {!Array.<!diff_match_patch.patch_obj>} Array of Patch objects.
 */ diff_match_patch1.prototype.patch_deepCopy = function(patches) {
            // Making deep copies is hard in JavaScript.
            var patchesCopy = [];
            for(var x = 0; x < patches.length; x++){
                var patch = patches[x];
                var patchCopy = new diff_match_patch1.patch_obj();
                patchCopy.diffs = [];
                for(var y = 0; y < patch.diffs.length; y++){
                    patchCopy.diffs[y] = patch.diffs[y].slice();
                }
                patchCopy.start1 = patch.start1;
                patchCopy.start2 = patch.start2;
                patchCopy.length1 = patch.length1;
                patchCopy.length2 = patch.length2;
                patchesCopy[x] = patchCopy;
            }
            return patchesCopy;
        };
        /**
 * Merge a set of patches onto the text.  Return a patched text, as well
 * as a list of true/false values indicating which patches were applied.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 * @param {string} text Old text.
 * @return {!Array.<string|!Array.<boolean>>} Two element Array, containing the
 *      new text and an array of boolean values.
 */ diff_match_patch1.prototype.patch_apply = function(patches, text) {
            if (patches.length == 0) {
                return [
                    text,
                    []
                ];
            }
            // Deep copy the patches so that no changes are made to originals.
            patches = this.patch_deepCopy(patches);
            var nullPadding = this.patch_addPadding(patches);
            text = nullPadding + text + nullPadding;
            this.patch_splitMax(patches);
            // delta keeps track of the offset between the expected and actual location
            // of the previous patch.  If there are patches expected at positions 10 and
            // 20, but the first patch was found at 12, delta is 2 and the second patch
            // has an effective expected position of 22.
            var delta = 0;
            var results = [];
            for(var x = 0; x < patches.length; x++){
                var expected_loc = patches[x].start2 + delta;
                var text1 = this.diff_text1(patches[x].diffs);
                var start_loc;
                var end_loc = -1;
                if (text1.length > this.Match_MaxBits) {
                    // patch_splitMax will only provide an oversized pattern in the case of
                    // a monster delete.
                    start_loc = this.match_main(text, text1.substring(0, this.Match_MaxBits), expected_loc);
                    if (start_loc != -1) {
                        end_loc = this.match_main(text, text1.substring(text1.length - this.Match_MaxBits), expected_loc + text1.length - this.Match_MaxBits);
                        if (end_loc == -1 || start_loc >= end_loc) {
                            // Can't find valid trailing context.  Drop this patch.
                            start_loc = -1;
                        }
                    }
                } else {
                    start_loc = this.match_main(text, text1, expected_loc);
                }
                if (start_loc == -1) {
                    // No match found.  :(
                    results[x] = false;
                    // Subtract the delta for this failed patch from subsequent patches.
                    delta -= patches[x].length2 - patches[x].length1;
                } else {
                    // Found a match.  :)
                    results[x] = true;
                    delta = start_loc - expected_loc;
                    var text2;
                    if (end_loc == -1) {
                        text2 = text.substring(start_loc, start_loc + text1.length);
                    } else {
                        text2 = text.substring(start_loc, end_loc + this.Match_MaxBits);
                    }
                    if (text1 == text2) {
                        // Perfect match, just shove the replacement text in.
                        text = text.substring(0, start_loc) + this.diff_text2(patches[x].diffs) + text.substring(start_loc + text1.length);
                    } else {
                        // Imperfect match.  Run a diff to get a framework of equivalent
                        // indices.
                        var diffs = this.diff_main(text1, text2, false);
                        if (text1.length > this.Match_MaxBits && this.diff_levenshtein(diffs) / text1.length > this.Patch_DeleteThreshold) {
                            // The end points match, but the content is unacceptably bad.
                            results[x] = false;
                        } else {
                            this.diff_cleanupSemanticLossless(diffs);
                            var index1 = 0;
                            var index2;
                            for(var y = 0; y < patches[x].diffs.length; y++){
                                var mod = patches[x].diffs[y];
                                if (mod[0] !== DIFF_EQUAL) {
                                    index2 = this.diff_xIndex(diffs, index1);
                                }
                                if (mod[0] === DIFF_INSERT) {
                                    text = text.substring(0, start_loc + index2) + mod[1] + text.substring(start_loc + index2);
                                } else if (mod[0] === DIFF_DELETE) {
                                    text = text.substring(0, start_loc + index2) + text.substring(start_loc + this.diff_xIndex(diffs, index1 + mod[1].length));
                                }
                                if (mod[0] !== DIFF_DELETE) {
                                    index1 += mod[1].length;
                                }
                            }
                        }
                    }
                }
            }
            // Strip the padding off.
            text = text.substring(nullPadding.length, text.length - nullPadding.length);
            return [
                text,
                results
            ];
        };
        /**
 * Add some padding on text start and end so that edges can match something.
 * Intended to be called only from within patch_apply.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 * @return {string} The padding string added to each side.
 */ diff_match_patch1.prototype.patch_addPadding = function(patches) {
            var paddingLength = this.Patch_Margin;
            var nullPadding = '';
            for(var x = 1; x <= paddingLength; x++){
                nullPadding += String.fromCharCode(x);
            }
            // Bump all the patches forward.
            for(var x = 0; x < patches.length; x++){
                patches[x].start1 += paddingLength;
                patches[x].start2 += paddingLength;
            }
            // Add some padding on start of first diff.
            var patch = patches[0];
            var diffs = patch.diffs;
            if (diffs.length == 0 || diffs[0][0] != DIFF_EQUAL) {
                // Add nullPadding equality.
                diffs.unshift([
                    DIFF_EQUAL,
                    nullPadding
                ]);
                patch.start1 -= paddingLength; // Should be 0.
                patch.start2 -= paddingLength; // Should be 0.
                patch.length1 += paddingLength;
                patch.length2 += paddingLength;
            } else if (paddingLength > diffs[0][1].length) {
                // Grow first equality.
                var extraLength = paddingLength - diffs[0][1].length;
                diffs[0][1] = nullPadding.substring(diffs[0][1].length) + diffs[0][1];
                patch.start1 -= extraLength;
                patch.start2 -= extraLength;
                patch.length1 += extraLength;
                patch.length2 += extraLength;
            }
            // Add some padding on end of last diff.
            patch = patches[patches.length - 1];
            diffs = patch.diffs;
            if (diffs.length == 0 || diffs[diffs.length - 1][0] != DIFF_EQUAL) {
                // Add nullPadding equality.
                diffs.push([
                    DIFF_EQUAL,
                    nullPadding
                ]);
                patch.length1 += paddingLength;
                patch.length2 += paddingLength;
            } else if (paddingLength > diffs[diffs.length - 1][1].length) {
                // Grow last equality.
                var extraLength = paddingLength - diffs[diffs.length - 1][1].length;
                diffs[diffs.length - 1][1] += nullPadding.substring(0, extraLength);
                patch.length1 += extraLength;
                patch.length2 += extraLength;
            }
            return nullPadding;
        };
        /**
 * Look through the patches and break up any which are longer than the maximum
 * limit of the match algorithm.
 * Intended to be called only from within patch_apply.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 */ diff_match_patch1.prototype.patch_splitMax = function(patches) {
            var patch_size = this.Match_MaxBits;
            for(var x = 0; x < patches.length; x++){
                if (patches[x].length1 <= patch_size) {
                    continue;
                }
                var bigpatch = patches[x];
                // Remove the big old patch.
                patches.splice(x--, 1);
                var start1 = bigpatch.start1;
                var start2 = bigpatch.start2;
                var precontext = '';
                while(bigpatch.diffs.length !== 0){
                    // Create one of several smaller patches.
                    var patch = new diff_match_patch1.patch_obj();
                    var empty = true;
                    patch.start1 = start1 - precontext.length;
                    patch.start2 = start2 - precontext.length;
                    if (precontext !== '') {
                        patch.length1 = patch.length2 = precontext.length;
                        patch.diffs.push([
                            DIFF_EQUAL,
                            precontext
                        ]);
                    }
                    while(bigpatch.diffs.length !== 0 && patch.length1 < patch_size - this.Patch_Margin){
                        var diff_type = bigpatch.diffs[0][0];
                        var diff_text = bigpatch.diffs[0][1];
                        if (diff_type === DIFF_INSERT) {
                            // Insertions are harmless.
                            patch.length2 += diff_text.length;
                            start2 += diff_text.length;
                            patch.diffs.push(bigpatch.diffs.shift());
                            empty = false;
                        } else if (diff_type === DIFF_DELETE && patch.diffs.length == 1 && patch.diffs[0][0] == DIFF_EQUAL && diff_text.length > 2 * patch_size) {
                            // This is a large deletion.  Let it pass in one chunk.
                            patch.length1 += diff_text.length;
                            start1 += diff_text.length;
                            empty = false;
                            patch.diffs.push([
                                diff_type,
                                diff_text
                            ]);
                            bigpatch.diffs.shift();
                        } else {
                            // Deletion or equality.  Only take as much as we can stomach.
                            diff_text = diff_text.substring(0, patch_size - patch.length1 - this.Patch_Margin);
                            patch.length1 += diff_text.length;
                            start1 += diff_text.length;
                            if (diff_type === DIFF_EQUAL) {
                                patch.length2 += diff_text.length;
                                start2 += diff_text.length;
                            } else {
                                empty = false;
                            }
                            patch.diffs.push([
                                diff_type,
                                diff_text
                            ]);
                            if (diff_text == bigpatch.diffs[0][1]) {
                                bigpatch.diffs.shift();
                            } else {
                                bigpatch.diffs[0][1] = bigpatch.diffs[0][1].substring(diff_text.length);
                            }
                        }
                    }
                    // Compute the head context for the next patch.
                    precontext = this.diff_text2(patch.diffs);
                    precontext = precontext.substring(precontext.length - this.Patch_Margin);
                    // Append the end context for this patch.
                    var postcontext = this.diff_text1(bigpatch.diffs).substring(0, this.Patch_Margin);
                    if (postcontext !== '') {
                        patch.length1 += postcontext.length;
                        patch.length2 += postcontext.length;
                        if (patch.diffs.length !== 0 && patch.diffs[patch.diffs.length - 1][0] === DIFF_EQUAL) {
                            patch.diffs[patch.diffs.length - 1][1] += postcontext;
                        } else {
                            patch.diffs.push([
                                DIFF_EQUAL,
                                postcontext
                            ]);
                        }
                    }
                    if (!empty) {
                        patches.splice(++x, 0, patch);
                    }
                }
            }
        };
        /**
 * Take a list of patches and return a textual representation.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 * @return {string} Text representation of patches.
 */ diff_match_patch1.prototype.patch_toText = function(patches) {
            var text = [];
            for(var x = 0; x < patches.length; x++){
                text[x] = patches[x];
            }
            return text.join('');
        };
        /**
 * Parse a textual representation of patches and return a list of Patch objects.
 * @param {string} textline Text representation of patches.
 * @return {!Array.<!diff_match_patch.patch_obj>} Array of Patch objects.
 * @throws {!Error} If invalid input.
 */ diff_match_patch1.prototype.patch_fromText = function(textline) {
            var patches = [];
            if (!textline) {
                return patches;
            }
            var text = textline.split('\n');
            var textPointer = 0;
            var patchHeader = /^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@$/;
            while(textPointer < text.length){
                var m = text[textPointer].match(patchHeader);
                if (!m) {
                    throw new Error('Invalid patch string: ' + text[textPointer]);
                }
                var patch = new diff_match_patch1.patch_obj();
                patches.push(patch);
                patch.start1 = parseInt(m[1], 10);
                if (m[2] === '') {
                    patch.start1--;
                    patch.length1 = 1;
                } else if (m[2] == '0') {
                    patch.length1 = 0;
                } else {
                    patch.start1--;
                    patch.length1 = parseInt(m[2], 10);
                }
                patch.start2 = parseInt(m[3], 10);
                if (m[4] === '') {
                    patch.start2--;
                    patch.length2 = 1;
                } else if (m[4] == '0') {
                    patch.length2 = 0;
                } else {
                    patch.start2--;
                    patch.length2 = parseInt(m[4], 10);
                }
                textPointer++;
                while(textPointer < text.length){
                    var sign = text[textPointer].charAt(0);
                    try {
                        var line = decodeURI(text[textPointer].substring(1));
                    } catch (ex) {
                        // Malformed URI sequence.
                        throw new Error('Illegal escape in patch_fromText: ' + line);
                    }
                    if (sign == '-') {
                        // Deletion.
                        patch.diffs.push([
                            DIFF_DELETE,
                            line
                        ]);
                    } else if (sign == '+') {
                        // Insertion.
                        patch.diffs.push([
                            DIFF_INSERT,
                            line
                        ]);
                    } else if (sign == ' ') {
                        // Minor equality.
                        patch.diffs.push([
                            DIFF_EQUAL,
                            line
                        ]);
                    } else if (sign == '@') {
                        break;
                    } else if (sign === '') {
                    // Blank line?  Whatever.
                    } else {
                        // WTF?
                        throw new Error('Invalid patch mode "' + sign + '" in: ' + line);
                    }
                    textPointer++;
                }
            }
            return patches;
        };
        /**
 * Class representing one patch operation.
 * @constructor
 */ diff_match_patch1.patch_obj = function() {
            /** @type {!Array.<!diff_match_patch.Diff>} */ this.diffs = [];
            /** @type {?number} */ this.start1 = null;
            /** @type {?number} */ this.start2 = null;
            /** @type {number} */ this.length1 = 0;
            /** @type {number} */ this.length2 = 0;
        };
        /**
 * Emmulate GNU diff's format.
 * Header: @@ -382,8 +481,9 @@
 * Indicies are printed as 1-based, not 0-based.
 * @return {string} The GNU diff string.
 */ diff_match_patch1.patch_obj.prototype.toString = function() {
            var coords1, coords2;
            if (this.length1 === 0) {
                coords1 = this.start1 + ',0';
            } else if (this.length1 == 1) {
                coords1 = this.start1 + 1;
            } else {
                coords1 = this.start1 + 1 + ',' + this.length1;
            }
            if (this.length2 === 0) {
                coords2 = this.start2 + ',0';
            } else if (this.length2 == 1) {
                coords2 = this.start2 + 1;
            } else {
                coords2 = this.start2 + 1 + ',' + this.length2;
            }
            var text = [
                '@@ -' + coords1 + ' +' + coords2 + ' @@\n'
            ];
            var op;
            // Escape the body of the patch with %xx notation.
            for(var x = 0; x < this.diffs.length; x++){
                switch(this.diffs[x][0]){
                    case DIFF_INSERT:
                        op = '+';
                        break;
                    case DIFF_DELETE:
                        op = '-';
                        break;
                    case DIFF_EQUAL:
                        op = ' ';
                        break;
                }
                text[x + 1] = op + encodeURI(this.diffs[x][1]) + '\n';
            }
            return text.join('').replace(/%20/g, ' ');
        };
        // The following export code was added by @ForbesLindesay
        module1.exports = diff_match_patch1;
        module1.exports['diff_match_patch'] = diff_match_patch1;
        module1.exports['DIFF_DELETE'] = DIFF_DELETE;
        module1.exports['DIFF_INSERT'] = DIFF_INSERT;
        module1.exports['DIFF_EQUAL'] = DIFF_EQUAL;
    });
    /* global diff_match_patch */ var TEXT_DIFF = 2;
    var DEFAULT_MIN_LENGTH = 60;
    var cachedDiffPatch = null;
    var getDiffMatchPatch = function getDiffMatchPatch(required) {
        /* jshint camelcase: false */ if (!cachedDiffPatch) {
            var instance = void 0;
            /* eslint-disable camelcase, new-cap */ if (typeof diff_match_patch !== 'undefined') {
                // already loaded, probably a browser
                instance = typeof diff_match_patch === 'function' ? new diff_match_patch() : new diff_match_patch.diff_match_patch();
            } else if (diffMatchPatch) {
                try {
                    instance = diffMatchPatch && new diffMatchPatch();
                } catch (err) {
                    instance = null;
                }
            }
            /* eslint-enable camelcase, new-cap */ if (!instance) {
                if (!required) {
                    return null;
                }
                var error = new Error('text diff_match_patch library not found');
                // eslint-disable-next-line camelcase
                error.diff_match_patch_not_found = true;
                throw error;
            }
            cachedDiffPatch = {
                diff: function diff(txt1, txt2) {
                    return instance.patch_toText(instance.patch_make(txt1, txt2));
                },
                patch: function patch(txt1, _patch) {
                    var results = instance.patch_apply(instance.patch_fromText(_patch), txt1);
                    for(var i = 0; i < results[1].length; i++){
                        if (!results[1][i]) {
                            var _error = new Error('text patch failed');
                            _error.textPatchFailed = true;
                        }
                    }
                    return results[0];
                }
            };
        }
        return cachedDiffPatch;
    };
    var diffFilter$3 = function textsDiffFilter(context) {
        if (context.leftType !== 'string') {
            return;
        }
        var minLength = context.options && context.options.textDiff && context.options.textDiff.minLength || DEFAULT_MIN_LENGTH;
        if (context.left.length < minLength || context.right.length < minLength) {
            context.setResult([
                context.left,
                context.right
            ]).exit();
            return;
        }
        // large text, try to use a text-diff algorithm
        var diffMatchPatch$$1 = getDiffMatchPatch();
        if (!diffMatchPatch$$1) {
            // diff-match-patch library not available,
            // fallback to regular string replace
            context.setResult([
                context.left,
                context.right
            ]).exit();
            return;
        }
        var diff = diffMatchPatch$$1.diff;
        context.setResult([
            diff(context.left, context.right),
            0,
            TEXT_DIFF
        ]).exit();
    };
    diffFilter$3.filterName = 'texts';
    var patchFilter$3 = function textsPatchFilter(context) {
        if (context.nested) {
            return;
        }
        if (context.delta[2] !== TEXT_DIFF) {
            return;
        }
        // text-diff, use a text-patch algorithm
        var patch = getDiffMatchPatch(true).patch;
        context.setResult(patch(context.left, context.delta[0])).exit();
    };
    patchFilter$3.filterName = 'texts';
    var textDeltaReverse = function textDeltaReverse(delta) {
        var i = void 0;
        var l = void 0;
        var lines = void 0;
        var line = void 0;
        var lineTmp = void 0;
        var header = null;
        var headerRegex = /^@@ +-(\d+),(\d+) +\+(\d+),(\d+) +@@$/;
        var lineHeader = void 0;
        lines = delta.split('\n');
        for(i = 0, l = lines.length; i < l; i++){
            line = lines[i];
            var lineStart = line.slice(0, 1);
            if (lineStart === '@') {
                header = headerRegex.exec(line);
                lineHeader = i;
                // fix header
                lines[lineHeader] = '@@ -' + header[3] + ',' + header[4] + ' +' + header[1] + ',' + header[2] + ' @@';
            } else if (lineStart === '+') {
                lines[i] = '-' + lines[i].slice(1);
                if (lines[i - 1].slice(0, 1) === '+') {
                    // swap lines to keep default order (-+)
                    lineTmp = lines[i];
                    lines[i] = lines[i - 1];
                    lines[i - 1] = lineTmp;
                }
            } else if (lineStart === '-') {
                lines[i] = '+' + lines[i].slice(1);
            }
        }
        return lines.join('\n');
    };
    var reverseFilter$3 = function textsReverseFilter(context) {
        if (context.nested) {
            return;
        }
        if (context.delta[2] !== TEXT_DIFF) {
            return;
        }
        // text-diff, use a text-diff algorithm
        context.setResult([
            textDeltaReverse(context.delta[0]),
            0,
            TEXT_DIFF
        ]).exit();
    };
    reverseFilter$3.filterName = 'texts';
    var DiffPatcher = function() {
        function DiffPatcher(options) {
            classCallCheck(this, DiffPatcher);
            this.processor = new Processor(options);
            this.processor.pipe(new Pipe('diff').append(collectChildrenDiffFilter, diffFilter, diffFilter$2, diffFilter$3, objectsDiffFilter, diffFilter$1).shouldHaveResult());
            this.processor.pipe(new Pipe('patch').append(collectChildrenPatchFilter, collectChildrenPatchFilter$1, patchFilter, patchFilter$3, patchFilter$1, patchFilter$2).shouldHaveResult());
            this.processor.pipe(new Pipe('reverse').append(collectChildrenReverseFilter, collectChildrenReverseFilter$1, reverseFilter, reverseFilter$3, reverseFilter$1, reverseFilter$2).shouldHaveResult());
        }
        createClass(DiffPatcher, [
            {
                key: 'options',
                value: function options() {
                    var _processor;
                    return (_processor = this.processor).options.apply(_processor, arguments);
                }
            },
            {
                key: 'diff',
                value: function diff(left, right) {
                    return this.processor.process(new DiffContext(left, right));
                }
            },
            {
                key: 'patch',
                value: function patch(left, delta) {
                    return this.processor.process(new PatchContext(left, delta));
                }
            },
            {
                key: 'reverse',
                value: function reverse(delta) {
                    return this.processor.process(new ReverseContext(delta));
                }
            },
            {
                key: 'unpatch',
                value: function unpatch(right, delta) {
                    return this.patch(right, this.reverse(delta));
                }
            },
            {
                key: 'clone',
                value: function clone$$1(value) {
                    return clone(value);
                }
            }
        ]);
        return DiffPatcher;
    }();
    var isArray$3 = typeof Array.isArray === 'function' ? Array.isArray : function(a) {
        return a instanceof Array;
    };
    var getObjectKeys = typeof Object.keys === 'function' ? function(obj) {
        return Object.keys(obj);
    } : function(obj) {
        var names = [];
        for(var property in obj){
            if (Object.prototype.hasOwnProperty.call(obj, property)) {
                names.push(property);
            }
        }
        return names;
    };
    var trimUnderscore = function trimUnderscore(str) {
        if (str.substr(0, 1) === '_') {
            return str.slice(1);
        }
        return str;
    };
    var arrayKeyToSortNumber = function arrayKeyToSortNumber(key) {
        if (key === '_t') {
            return -1;
        } else {
            if (key.substr(0, 1) === '_') {
                return parseInt(key.slice(1), 10);
            } else {
                return parseInt(key, 10) + 0.1;
            }
        }
    };
    var arrayKeyComparer = function arrayKeyComparer(key1, key2) {
        return arrayKeyToSortNumber(key1) - arrayKeyToSortNumber(key2);
    };
    var BaseFormatter = function() {
        function BaseFormatter() {
            classCallCheck(this, BaseFormatter);
        }
        createClass(BaseFormatter, [
            {
                key: 'format',
                value: function format(delta, left) {
                    var context = {};
                    this.prepareContext(context);
                    this.recurse(context, delta, left);
                    return this.finalize(context);
                }
            },
            {
                key: 'prepareContext',
                value: function prepareContext(context) {
                    context.buffer = [];
                    context.out = function() {
                        var _buffer;
                        (_buffer = this.buffer).push.apply(_buffer, arguments);
                    };
                }
            },
            {
                key: 'typeFormattterNotFound',
                value: function typeFormattterNotFound(context, deltaType) {
                    throw new Error('cannot format delta type: ' + deltaType);
                }
            },
            {
                key: 'typeFormattterErrorFormatter',
                value: function typeFormattterErrorFormatter(context, err) {
                    return err.toString();
                }
            },
            {
                key: 'finalize',
                value: function finalize(_ref) {
                    var buffer = _ref.buffer;
                    if (isArray$3(buffer)) {
                        return buffer.join('');
                    }
                }
            },
            {
                key: 'recurse',
                value: function recurse(context, delta, left, key, leftKey, movedFrom, isLast) {
                    var useMoveOriginHere = delta && movedFrom;
                    var leftValue = useMoveOriginHere ? movedFrom.value : left;
                    if (typeof delta === 'undefined' && typeof key === 'undefined') {
                        return undefined;
                    }
                    var type = this.getDeltaType(delta, movedFrom);
                    var nodeType = type === 'node' ? delta._t === 'a' ? 'array' : 'object' : '';
                    if (typeof key !== 'undefined') {
                        this.nodeBegin(context, key, leftKey, type, nodeType, isLast);
                    } else {
                        this.rootBegin(context, type, nodeType);
                    }
                    var typeFormattter = void 0;
                    try {
                        typeFormattter = this['format_' + type] || this.typeFormattterNotFound(context, type);
                        typeFormattter.call(this, context, delta, leftValue, key, leftKey, movedFrom);
                    } catch (err) {
                        this.typeFormattterErrorFormatter(context, err, delta, leftValue, key, leftKey, movedFrom);
                        if (typeof console !== 'undefined' && console.error) {
                            console.error(err.stack);
                        }
                    }
                    if (typeof key !== 'undefined') {
                        this.nodeEnd(context, key, leftKey, type, nodeType, isLast);
                    } else {
                        this.rootEnd(context, type, nodeType);
                    }
                }
            },
            {
                key: 'formatDeltaChildren',
                value: function formatDeltaChildren(context, delta, left) {
                    var self = this;
                    this.forEachDeltaKey(delta, left, function(key, leftKey, movedFrom, isLast) {
                        self.recurse(context, delta[key], left ? left[leftKey] : undefined, key, leftKey, movedFrom, isLast);
                    });
                }
            },
            {
                key: 'forEachDeltaKey',
                value: function forEachDeltaKey(delta, left, fn) {
                    var keys = getObjectKeys(delta);
                    var arrayKeys = delta._t === 'a';
                    var moveDestinations = {};
                    var name = void 0;
                    if (typeof left !== 'undefined') {
                        for(name in left){
                            if (Object.prototype.hasOwnProperty.call(left, name)) {
                                if (typeof delta[name] === 'undefined' && (!arrayKeys || typeof delta['_' + name] === 'undefined')) {
                                    keys.push(name);
                                }
                            }
                        }
                    }
                    // look for move destinations
                    for(name in delta){
                        if (Object.prototype.hasOwnProperty.call(delta, name)) {
                            var value = delta[name];
                            if (isArray$3(value) && value[2] === 3) {
                                moveDestinations[value[1].toString()] = {
                                    key: name,
                                    value: left && left[parseInt(name.substr(1))]
                                };
                                if (this.includeMoveDestinations !== false) {
                                    if (typeof left === 'undefined' && typeof delta[value[1]] === 'undefined') {
                                        keys.push(value[1].toString());
                                    }
                                }
                            }
                        }
                    }
                    if (arrayKeys) {
                        keys.sort(arrayKeyComparer);
                    } else {
                        keys.sort();
                    }
                    for(var index = 0, length = keys.length; index < length; index++){
                        var key = keys[index];
                        if (arrayKeys && key === '_t') {
                            continue;
                        }
                        var leftKey = arrayKeys ? typeof key === 'number' ? key : parseInt(trimUnderscore(key), 10) : key;
                        var isLast = index === length - 1;
                        fn(key, leftKey, moveDestinations[leftKey], isLast);
                    }
                }
            },
            {
                key: 'getDeltaType',
                value: function getDeltaType(delta, movedFrom) {
                    if (typeof delta === 'undefined') {
                        if (typeof movedFrom !== 'undefined') {
                            return 'movedestination';
                        }
                        return 'unchanged';
                    }
                    if (isArray$3(delta)) {
                        if (delta.length === 1) {
                            return 'added';
                        }
                        if (delta.length === 2) {
                            return 'modified';
                        }
                        if (delta.length === 3 && delta[2] === 0) {
                            return 'deleted';
                        }
                        if (delta.length === 3 && delta[2] === 2) {
                            return 'textdiff';
                        }
                        if (delta.length === 3 && delta[2] === 3) {
                            return 'moved';
                        }
                    } else if ((typeof delta === 'undefined' ? 'undefined' : _typeof(delta)) === 'object') {
                        return 'node';
                    }
                    return 'unknown';
                }
            },
            {
                key: 'parseTextDiff',
                value: function parseTextDiff(value) {
                    var output = [];
                    var lines = value.split('\n@@ ');
                    for(var i = 0, l = lines.length; i < l; i++){
                        var line = lines[i];
                        var lineOutput = {
                            pieces: []
                        };
                        var location = /^(?:@@ )?[-+]?(\d+),(\d+)/.exec(line).slice(1);
                        lineOutput.location = {
                            line: location[0],
                            chr: location[1]
                        };
                        var pieces = line.split('\n').slice(1);
                        for(var pieceIndex = 0, piecesLength = pieces.length; pieceIndex < piecesLength; pieceIndex++){
                            var piece = pieces[pieceIndex];
                            if (!piece.length) {
                                continue;
                            }
                            var pieceOutput = {
                                type: 'context'
                            };
                            if (piece.substr(0, 1) === '+') {
                                pieceOutput.type = 'added';
                            } else if (piece.substr(0, 1) === '-') {
                                pieceOutput.type = 'deleted';
                            }
                            pieceOutput.text = piece.slice(1);
                            lineOutput.pieces.push(pieceOutput);
                        }
                        output.push(lineOutput);
                    }
                    return output;
                }
            }
        ]);
        return BaseFormatter;
    }();
    var base = Object.freeze({
        default: BaseFormatter
    });
    var HtmlFormatter = function(_BaseFormatter) {
        inherits(HtmlFormatter, _BaseFormatter);
        function HtmlFormatter() {
            classCallCheck(this, HtmlFormatter);
            return possibleConstructorReturn(this, (HtmlFormatter.__proto__ || Object.getPrototypeOf(HtmlFormatter)).apply(this, arguments));
        }
        createClass(HtmlFormatter, [
            {
                key: 'typeFormattterErrorFormatter',
                value: function typeFormattterErrorFormatter(context, err) {
                    context.out('<pre class="jsondiffpatch-error">' + err + '</pre>');
                }
            },
            {
                key: 'formatValue',
                value: function formatValue(context, value) {
                    context.out('<pre>' + htmlEscape(JSON.stringify(value, null, 2)) + '</pre>');
                }
            },
            {
                key: 'formatTextDiffString',
                value: function formatTextDiffString(context, value) {
                    var lines = this.parseTextDiff(value);
                    context.out('<ul class="jsondiffpatch-textdiff">');
                    for(var i = 0, l = lines.length; i < l; i++){
                        var line = lines[i];
                        context.out('<li><div class="jsondiffpatch-textdiff-location">' + ('<span class="jsondiffpatch-textdiff-line-number">' + line.location.line + '</span><span class="jsondiffpatch-textdiff-char">' + line.location.chr + '</span></div><div class="jsondiffpatch-textdiff-line">'));
                        var pieces = line.pieces;
                        for(var pieceIndex = 0, piecesLength = pieces.length; pieceIndex < piecesLength; pieceIndex++){
                            /* global decodeURI */ var piece = pieces[pieceIndex];
                            context.out('<span class="jsondiffpatch-textdiff-' + piece.type + '">' + htmlEscape(decodeURI(piece.text)) + '</span>');
                        }
                        context.out('</div></li>');
                    }
                    context.out('</ul>');
                }
            },
            {
                key: 'rootBegin',
                value: function rootBegin(context, type, nodeType) {
                    var nodeClass = 'jsondiffpatch-' + type + (nodeType ? ' jsondiffpatch-child-node-type-' + nodeType : '');
                    context.out('<div class="jsondiffpatch-delta ' + nodeClass + '">');
                }
            },
            {
                key: 'rootEnd',
                value: function rootEnd(context) {
                    context.out('</div>' + (context.hasArrows ? '<script type="text/javascript">setTimeout(' + (adjustArrows.toString() + ',10);</script>') : ''));
                }
            },
            {
                key: 'nodeBegin',
                value: function nodeBegin(context, key, leftKey, type, nodeType) {
                    var nodeClass = 'jsondiffpatch-' + type + (nodeType ? ' jsondiffpatch-child-node-type-' + nodeType : '');
                    context.out('<li class="' + nodeClass + '" data-key="' + leftKey + '">' + ('<div class="jsondiffpatch-property-name">' + leftKey + '</div>'));
                }
            },
            {
                key: 'nodeEnd',
                value: function nodeEnd(context) {
                    context.out('</li>');
                }
            },
            {
                key: 'format_unchanged',
                value: function format_unchanged(context, delta, left) {
                    if (typeof left === 'undefined') {
                        return;
                    }
                    context.out('<div class="jsondiffpatch-value">');
                    this.formatValue(context, left);
                    context.out('</div>');
                }
            },
            {
                key: 'format_movedestination',
                value: function format_movedestination(context, delta, left) {
                    if (typeof left === 'undefined') {
                        return;
                    }
                    context.out('<div class="jsondiffpatch-value">');
                    this.formatValue(context, left);
                    context.out('</div>');
                }
            },
            {
                key: 'format_node',
                value: function format_node(context, delta, left) {
                    // recurse
                    var nodeType = delta._t === 'a' ? 'array' : 'object';
                    context.out('<ul class="jsondiffpatch-node jsondiffpatch-node-type-' + nodeType + '">');
                    this.formatDeltaChildren(context, delta, left);
                    context.out('</ul>');
                }
            },
            {
                key: 'format_added',
                value: function format_added(context, delta) {
                    context.out('<div class="jsondiffpatch-value">');
                    this.formatValue(context, delta[0]);
                    context.out('</div>');
                }
            },
            {
                key: 'format_modified',
                value: function format_modified(context, delta) {
                    context.out('<div class="jsondiffpatch-value jsondiffpatch-left-value">');
                    this.formatValue(context, delta[0]);
                    context.out('</div>' + '<div class="jsondiffpatch-value jsondiffpatch-right-value">');
                    this.formatValue(context, delta[1]);
                    context.out('</div>');
                }
            },
            {
                key: 'format_deleted',
                value: function format_deleted(context, delta) {
                    context.out('<div class="jsondiffpatch-value">');
                    this.formatValue(context, delta[0]);
                    context.out('</div>');
                }
            },
            {
                key: 'format_moved',
                value: function format_moved(context, delta) {
                    context.out('<div class="jsondiffpatch-value">');
                    this.formatValue(context, delta[0]);
                    context.out('</div><div class="jsondiffpatch-moved-destination">' + delta[1] + '</div>');
                    // draw an SVG arrow from here to move destination
                    context.out(/* jshint multistr: true */ '<div class="jsondiffpatch-arrow" ' + 'style="position: relative; left: -34px;">\n          <svg width="30" height="60" ' + 'style="position: absolute; display: none;">\n          <defs>\n              <marker id="markerArrow" markerWidth="8" markerHeight="8"\n                 refx="2" refy="4"\n                     orient="auto" markerUnits="userSpaceOnUse">\n                  <path d="M1,1 L1,7 L7,4 L1,1" style="fill: #339;" />\n              </marker>\n          </defs>\n          <path d="M30,0 Q-10,25 26,50"\n            style="stroke: #88f; stroke-width: 2px; fill: none; ' + 'stroke-opacity: 0.5; marker-end: url(#markerArrow);"\n          ></path>\n          </svg>\n      </div>');
                    context.hasArrows = true;
                }
            },
            {
                key: 'format_textdiff',
                value: function format_textdiff(context, delta) {
                    context.out('<div class="jsondiffpatch-value">');
                    this.formatTextDiffString(context, delta[0]);
                    context.out('</div>');
                }
            }
        ]);
        return HtmlFormatter;
    }(BaseFormatter);
    function htmlEscape(text) {
        var html = text;
        var replacements = [
            [
                /&/g,
                '&amp;'
            ],
            [
                /</g,
                '&lt;'
            ],
            [
                />/g,
                '&gt;'
            ],
            [
                /'/g,
                '&apos;'
            ],
            [
                /"/g,
                '&quot;'
            ]
        ];
        for(var i = 0; i < replacements.length; i++){
            html = html.replace(replacements[i][0], replacements[i][1]);
        }
        return html;
    }
    var adjustArrows = function jsondiffpatchHtmlFormatterAdjustArrows(nodeArg) {
        var node = nodeArg || document;
        var getElementText = function getElementText(_ref) {
            var textContent = _ref.textContent, innerText = _ref.innerText;
            return textContent || innerText;
        };
        var eachByQuery = function eachByQuery(el, query, fn) {
            var elems = el.querySelectorAll(query);
            for(var i = 0, l = elems.length; i < l; i++){
                fn(elems[i]);
            }
        };
        var eachChildren = function eachChildren(_ref2, fn) {
            var children = _ref2.children;
            for(var i = 0, l = children.length; i < l; i++){
                fn(children[i], i);
            }
        };
        eachByQuery(node, '.jsondiffpatch-arrow', function(_ref3) {
            var parentNode = _ref3.parentNode, children = _ref3.children, style = _ref3.style;
            var arrowParent = parentNode;
            var svg = children[0];
            var path = svg.children[1];
            svg.style.display = 'none';
            var destination = getElementText(arrowParent.querySelector('.jsondiffpatch-moved-destination'));
            var container = arrowParent.parentNode;
            var destinationElem = void 0;
            eachChildren(container, function(child) {
                if (child.getAttribute('data-key') === destination) {
                    destinationElem = child;
                }
            });
            if (!destinationElem) {
                return;
            }
            try {
                var distance = destinationElem.offsetTop - arrowParent.offsetTop;
                svg.setAttribute('height', Math.abs(distance) + 6);
                style.top = -8 + (distance > 0 ? 0 : distance) + 'px';
                var curve = distance > 0 ? 'M30,0 Q-10,' + Math.round(distance / 2) + ' 26,' + (distance - 4) : 'M30,' + -distance + ' Q-10,' + Math.round(-distance / 2) + ' 26,4';
                path.setAttribute('d', curve);
                svg.style.display = '';
            } catch (err) {}
        });
    };
    /* jshint camelcase: true */ /* eslint-enable camelcase */ var showUnchanged = function showUnchanged(show, node, delay) {
        var el = node || document.body;
        var prefix = 'jsondiffpatch-unchanged-';
        var classes = {
            showing: prefix + 'showing',
            hiding: prefix + 'hiding',
            visible: prefix + 'visible',
            hidden: prefix + 'hidden'
        };
        var list = el.classList;
        if (!list) {
            return;
        }
        if (!delay) {
            list.remove(classes.showing);
            list.remove(classes.hiding);
            list.remove(classes.visible);
            list.remove(classes.hidden);
            if (show === false) {
                list.add(classes.hidden);
            }
            return;
        }
        if (show === false) {
            list.remove(classes.showing);
            list.add(classes.visible);
            setTimeout(function() {
                list.add(classes.hiding);
            }, 10);
        } else {
            list.remove(classes.hiding);
            list.add(classes.showing);
            list.remove(classes.hidden);
        }
        var intervalId = setInterval(function() {
            adjustArrows(el);
        }, 100);
        setTimeout(function() {
            list.remove(classes.showing);
            list.remove(classes.hiding);
            if (show === false) {
                list.add(classes.hidden);
                list.remove(classes.visible);
            } else {
                list.add(classes.visible);
                list.remove(classes.hidden);
            }
            setTimeout(function() {
                list.remove(classes.visible);
                clearInterval(intervalId);
            }, delay + 400);
        }, delay);
    };
    var hideUnchanged = function hideUnchanged(node, delay) {
        return showUnchanged(false, node, delay);
    };
    var defaultInstance = void 0;
    function format(delta, left) {
        if (!defaultInstance) {
            defaultInstance = new HtmlFormatter();
        }
        return defaultInstance.format(delta, left);
    }
    var html = Object.freeze({
        showUnchanged: showUnchanged,
        hideUnchanged: hideUnchanged,
        default: HtmlFormatter,
        format: format
    });
    var AnnotatedFormatter = function(_BaseFormatter) {
        inherits(AnnotatedFormatter, _BaseFormatter);
        function AnnotatedFormatter() {
            classCallCheck(this, AnnotatedFormatter);
            var _this = possibleConstructorReturn(this, (AnnotatedFormatter.__proto__ || Object.getPrototypeOf(AnnotatedFormatter)).call(this));
            _this.includeMoveDestinations = false;
            return _this;
        }
        createClass(AnnotatedFormatter, [
            {
                key: 'prepareContext',
                value: function prepareContext(context) {
                    get(AnnotatedFormatter.prototype.__proto__ || Object.getPrototypeOf(AnnotatedFormatter.prototype), 'prepareContext', this).call(this, context);
                    context.indent = function(levels) {
                        this.indentLevel = (this.indentLevel || 0) + (typeof levels === 'undefined' ? 1 : levels);
                        this.indentPad = new Array(this.indentLevel + 1).join('&nbsp;&nbsp;');
                    };
                    context.row = function(json, htmlNote) {
                        context.out('<tr><td style="white-space: nowrap;">' + '<pre class="jsondiffpatch-annotated-indent"' + ' style="display: inline-block">');
                        context.out(context.indentPad);
                        context.out('</pre><pre style="display: inline-block">');
                        context.out(json);
                        context.out('</pre></td><td class="jsondiffpatch-delta-note"><div>');
                        context.out(htmlNote);
                        context.out('</div></td></tr>');
                    };
                }
            },
            {
                key: 'typeFormattterErrorFormatter',
                value: function typeFormattterErrorFormatter(context, err) {
                    context.row('', '<pre class="jsondiffpatch-error">' + err + '</pre>');
                }
            },
            {
                key: 'formatTextDiffString',
                value: function formatTextDiffString(context, value) {
                    var lines = this.parseTextDiff(value);
                    context.out('<ul class="jsondiffpatch-textdiff">');
                    for(var i = 0, l = lines.length; i < l; i++){
                        var line = lines[i];
                        context.out('<li><div class="jsondiffpatch-textdiff-location">' + ('<span class="jsondiffpatch-textdiff-line-number">' + line.location.line + '</span><span class="jsondiffpatch-textdiff-char">' + line.location.chr + '</span></div><div class="jsondiffpatch-textdiff-line">'));
                        var pieces = line.pieces;
                        for(var pieceIndex = 0, piecesLength = pieces.length; pieceIndex < piecesLength; pieceIndex++){
                            var piece = pieces[pieceIndex];
                            context.out('<span class="jsondiffpatch-textdiff-' + piece.type + '">' + piece.text + '</span>');
                        }
                        context.out('</div></li>');
                    }
                    context.out('</ul>');
                }
            },
            {
                key: 'rootBegin',
                value: function rootBegin(context, type, nodeType) {
                    context.out('<table class="jsondiffpatch-annotated-delta">');
                    if (type === 'node') {
                        context.row('{');
                        context.indent();
                    }
                    if (nodeType === 'array') {
                        context.row('"_t": "a",', 'Array delta (member names indicate array indices)');
                    }
                }
            },
            {
                key: 'rootEnd',
                value: function rootEnd(context, type) {
                    if (type === 'node') {
                        context.indent(-1);
                        context.row('}');
                    }
                    context.out('</table>');
                }
            },
            {
                key: 'nodeBegin',
                value: function nodeBegin(context, key, leftKey, type, nodeType) {
                    context.row('&quot;' + key + '&quot;: {');
                    if (type === 'node') {
                        context.indent();
                    }
                    if (nodeType === 'array') {
                        context.row('"_t": "a",', 'Array delta (member names indicate array indices)');
                    }
                }
            },
            {
                key: 'nodeEnd',
                value: function nodeEnd(context, key, leftKey, type, nodeType, isLast) {
                    if (type === 'node') {
                        context.indent(-1);
                    }
                    context.row('}' + (isLast ? '' : ','));
                }
            },
            {
                key: 'format_unchanged',
                value: function format_unchanged() {}
            },
            {
                key: 'format_movedestination',
                value: function format_movedestination() {}
            },
            {
                key: 'format_node',
                value: function format_node(context, delta, left) {
                    // recurse
                    this.formatDeltaChildren(context, delta, left);
                }
            }
        ]);
        return AnnotatedFormatter;
    }(BaseFormatter);
    /* eslint-enable camelcase */ var wrapPropertyName = function wrapPropertyName(name) {
        return '<pre style="display:inline-block">&quot;' + name + '&quot;</pre>';
    };
    var deltaAnnotations = {
        added: function added(delta, left, key, leftKey) {
            var formatLegend = ' <pre>([newValue])</pre>';
            if (typeof leftKey === 'undefined') {
                return 'new value' + formatLegend;
            }
            if (typeof leftKey === 'number') {
                return 'insert at index ' + leftKey + formatLegend;
            }
            return 'add property ' + wrapPropertyName(leftKey) + formatLegend;
        },
        modified: function modified(delta, left, key, leftKey) {
            var formatLegend = ' <pre>([previousValue, newValue])</pre>';
            if (typeof leftKey === 'undefined') {
                return 'modify value' + formatLegend;
            }
            if (typeof leftKey === 'number') {
                return 'modify at index ' + leftKey + formatLegend;
            }
            return 'modify property ' + wrapPropertyName(leftKey) + formatLegend;
        },
        deleted: function deleted(delta, left, key, leftKey) {
            var formatLegend = ' <pre>([previousValue, 0, 0])</pre>';
            if (typeof leftKey === 'undefined') {
                return 'delete value' + formatLegend;
            }
            if (typeof leftKey === 'number') {
                return 'remove index ' + leftKey + formatLegend;
            }
            return 'delete property ' + wrapPropertyName(leftKey) + formatLegend;
        },
        moved: function moved(delta, left, key, leftKey) {
            return 'move from <span title="(position to remove at original state)">' + ('index ' + leftKey + '</span> to <span title="(position to insert at final') + (' state)">index ' + delta[1] + '</span>');
        },
        textdiff: function textdiff(delta, left, key, leftKey) {
            var location = typeof leftKey === 'undefined' ? '' : typeof leftKey === 'number' ? ' at index ' + leftKey : ' at property ' + wrapPropertyName(leftKey);
            return 'text diff' + location + ', format is <a href="https://code.google.com/' + 'p/google-diff-match-patch/wiki/Unidiff">a variation of Unidiff</a>';
        }
    };
    var formatAnyChange = function formatAnyChange(context, delta) {
        var deltaType = this.getDeltaType(delta);
        var annotator = deltaAnnotations[deltaType];
        var htmlNote = annotator && annotator.apply(annotator, Array.prototype.slice.call(arguments, 1));
        var json = JSON.stringify(delta, null, 2);
        if (deltaType === 'textdiff') {
            // split text diffs lines
            json = json.split('\\n').join('\\n"+\n   "');
        }
        context.indent();
        context.row(json, htmlNote);
        context.indent(-1);
    };
    /* eslint-disable camelcase */ AnnotatedFormatter.prototype.format_added = formatAnyChange;
    AnnotatedFormatter.prototype.format_modified = formatAnyChange;
    AnnotatedFormatter.prototype.format_deleted = formatAnyChange;
    AnnotatedFormatter.prototype.format_moved = formatAnyChange;
    AnnotatedFormatter.prototype.format_textdiff = formatAnyChange;
    var defaultInstance$1 = void 0;
    function format$1(delta, left) {
        if (!defaultInstance$1) {
            defaultInstance$1 = new AnnotatedFormatter();
        }
        return defaultInstance$1.format(delta, left);
    }
    var annotated = Object.freeze({
        default: AnnotatedFormatter,
        format: format$1
    });
    var OPERATIONS = {
        add: 'add',
        remove: 'remove',
        replace: 'replace',
        move: 'move'
    };
    var JSONFormatter = function(_BaseFormatter) {
        inherits(JSONFormatter, _BaseFormatter);
        function JSONFormatter() {
            classCallCheck(this, JSONFormatter);
            var _this = possibleConstructorReturn(this, (JSONFormatter.__proto__ || Object.getPrototypeOf(JSONFormatter)).call(this));
            _this.includeMoveDestinations = true;
            return _this;
        }
        createClass(JSONFormatter, [
            {
                key: 'prepareContext',
                value: function prepareContext(context) {
                    get(JSONFormatter.prototype.__proto__ || Object.getPrototypeOf(JSONFormatter.prototype), 'prepareContext', this).call(this, context);
                    context.result = [];
                    context.path = [];
                    context.pushCurrentOp = function(obj) {
                        var op = obj.op, value = obj.value;
                        var val = {
                            op: op,
                            path: this.currentPath()
                        };
                        if (typeof value !== 'undefined') {
                            val.value = value;
                        }
                        this.result.push(val);
                    };
                    context.pushMoveOp = function(to) {
                        var from = this.currentPath();
                        this.result.push({
                            op: OPERATIONS.move,
                            from: from,
                            path: this.toPath(to)
                        });
                    };
                    context.currentPath = function() {
                        return '/' + this.path.join('/');
                    };
                    context.toPath = function(toPath) {
                        var to = this.path.slice();
                        to[to.length - 1] = toPath;
                        return '/' + to.join('/');
                    };
                }
            },
            {
                key: 'typeFormattterErrorFormatter',
                value: function typeFormattterErrorFormatter(context, err) {
                    context.out('[ERROR] ' + err);
                }
            },
            {
                key: 'rootBegin',
                value: function rootBegin() {}
            },
            {
                key: 'rootEnd',
                value: function rootEnd() {}
            },
            {
                key: 'nodeBegin',
                value: function nodeBegin(_ref, key, leftKey) {
                    var path = _ref.path;
                    path.push(leftKey);
                }
            },
            {
                key: 'nodeEnd',
                value: function nodeEnd(_ref2) {
                    var path = _ref2.path;
                    path.pop();
                }
            },
            {
                key: 'format_unchanged',
                value: function format_unchanged() {}
            },
            {
                key: 'format_movedestination',
                value: function format_movedestination() {}
            },
            {
                key: 'format_node',
                value: function format_node(context, delta, left) {
                    this.formatDeltaChildren(context, delta, left);
                }
            },
            {
                key: 'format_added',
                value: function format_added(context, delta) {
                    context.pushCurrentOp({
                        op: OPERATIONS.add,
                        value: delta[0]
                    });
                }
            },
            {
                key: 'format_modified',
                value: function format_modified(context, delta) {
                    context.pushCurrentOp({
                        op: OPERATIONS.replace,
                        value: delta[1]
                    });
                }
            },
            {
                key: 'format_deleted',
                value: function format_deleted(context) {
                    context.pushCurrentOp({
                        op: OPERATIONS.remove
                    });
                }
            },
            {
                key: 'format_moved',
                value: function format_moved(context, delta) {
                    var to = delta[1];
                    context.pushMoveOp(to);
                }
            },
            {
                key: 'format_textdiff',
                value: function format_textdiff() {
                    throw new Error('Not implemented');
                }
            },
            {
                key: 'format',
                value: function format(delta, left) {
                    var context = {};
                    this.prepareContext(context);
                    this.recurse(context, delta, left);
                    return context.result;
                }
            }
        ]);
        return JSONFormatter;
    }(BaseFormatter);
    var last = function last(arr) {
        return arr[arr.length - 1];
    };
    var sortBy = function sortBy(arr, pred) {
        arr.sort(pred);
        return arr;
    };
    var compareByIndexDesc = function compareByIndexDesc(indexA, indexB) {
        var lastA = parseInt(indexA, 10);
        var lastB = parseInt(indexB, 10);
        if (!(isNaN(lastA) || isNaN(lastB))) {
            return lastB - lastA;
        } else {
            return 0;
        }
    };
    var opsByDescendingOrder = function opsByDescendingOrder(removeOps) {
        return sortBy(removeOps, function(a, b) {
            var splitA = a.path.split('/');
            var splitB = b.path.split('/');
            if (splitA.length !== splitB.length) {
                return splitA.length - splitB.length;
            } else {
                return compareByIndexDesc(last(splitA), last(splitB));
            }
        });
    };
    var partitionOps = function partitionOps(arr, fns) {
        var initArr = Array(fns.length + 1).fill().map(function() {
            return [];
        });
        return arr.map(function(item) {
            var position = fns.map(function(fn) {
                return fn(item);
            }).indexOf(true);
            if (position < 0) {
                position = fns.length;
            }
            return {
                item: item,
                position: position
            };
        }).reduce(function(acc, item) {
            acc[item.position].push(item.item);
            return acc;
        }, initArr);
    };
    var isMoveOp = function isMoveOp(_ref3) {
        var op = _ref3.op;
        return op === 'move';
    };
    var isRemoveOp = function isRemoveOp(_ref4) {
        var op = _ref4.op;
        return op === 'remove';
    };
    var reorderOps = function reorderOps(diff) {
        var _partitionOps = partitionOps(diff, [
            isMoveOp,
            isRemoveOp
        ]), _partitionOps2 = slicedToArray(_partitionOps, 3), moveOps = _partitionOps2[0], removedOps = _partitionOps2[1], restOps = _partitionOps2[2];
        var removeOpsReverse = opsByDescendingOrder(removedOps);
        return [].concat(toConsumableArray(removeOpsReverse), toConsumableArray(moveOps), toConsumableArray(restOps));
    };
    var defaultInstance$2 = void 0;
    var format$2 = function format(delta, left) {
        if (!defaultInstance$2) {
            defaultInstance$2 = new JSONFormatter();
        }
        return reorderOps(defaultInstance$2.format(delta, left));
    };
    var log = function log(delta, left) {
        console.log(format$2(delta, left));
    };
    var jsonpatch = Object.freeze({
        default: JSONFormatter,
        partitionOps: partitionOps,
        format: format$2,
        log: log
    });
    function chalkColor(name) {
        return chalk && chalk[name] || function() {
            for(var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++){
                args[_key] = arguments[_key];
            }
            return args;
        };
    }
    var colors = {
        added: chalkColor('green'),
        deleted: chalkColor('red'),
        movedestination: chalkColor('gray'),
        moved: chalkColor('yellow'),
        unchanged: chalkColor('gray'),
        error: chalkColor('white.bgRed'),
        textDiffLine: chalkColor('gray')
    };
    var ConsoleFormatter = function(_BaseFormatter) {
        inherits(ConsoleFormatter, _BaseFormatter);
        function ConsoleFormatter() {
            classCallCheck(this, ConsoleFormatter);
            var _this = possibleConstructorReturn(this, (ConsoleFormatter.__proto__ || Object.getPrototypeOf(ConsoleFormatter)).call(this));
            _this.includeMoveDestinations = false;
            return _this;
        }
        createClass(ConsoleFormatter, [
            {
                key: 'prepareContext',
                value: function prepareContext(context) {
                    get(ConsoleFormatter.prototype.__proto__ || Object.getPrototypeOf(ConsoleFormatter.prototype), 'prepareContext', this).call(this, context);
                    context.indent = function(levels) {
                        this.indentLevel = (this.indentLevel || 0) + (typeof levels === 'undefined' ? 1 : levels);
                        this.indentPad = new Array(this.indentLevel + 1).join('  ');
                        this.outLine();
                    };
                    context.outLine = function() {
                        this.buffer.push('\n' + (this.indentPad || ''));
                    };
                    context.out = function() {
                        for(var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++){
                            args[_key2] = arguments[_key2];
                        }
                        for(var i = 0, l = args.length; i < l; i++){
                            var lines = args[i].split('\n');
                            var text = lines.join('\n' + (this.indentPad || ''));
                            if (this.color && this.color[0]) {
                                text = this.color[0](text);
                            }
                            this.buffer.push(text);
                        }
                    };
                    context.pushColor = function(color) {
                        this.color = this.color || [];
                        this.color.unshift(color);
                    };
                    context.popColor = function() {
                        this.color = this.color || [];
                        this.color.shift();
                    };
                }
            },
            {
                key: 'typeFormattterErrorFormatter',
                value: function typeFormattterErrorFormatter(context, err) {
                    context.pushColor(colors.error);
                    context.out('[ERROR]' + err);
                    context.popColor();
                }
            },
            {
                key: 'formatValue',
                value: function formatValue(context, value) {
                    context.out(JSON.stringify(value, null, 2));
                }
            },
            {
                key: 'formatTextDiffString',
                value: function formatTextDiffString(context, value) {
                    var lines = this.parseTextDiff(value);
                    context.indent();
                    for(var i = 0, l = lines.length; i < l; i++){
                        var line = lines[i];
                        context.pushColor(colors.textDiffLine);
                        context.out(line.location.line + ',' + line.location.chr + ' ');
                        context.popColor();
                        var pieces = line.pieces;
                        for(var pieceIndex = 0, piecesLength = pieces.length; pieceIndex < piecesLength; pieceIndex++){
                            var piece = pieces[pieceIndex];
                            context.pushColor(colors[piece.type]);
                            context.out(piece.text);
                            context.popColor();
                        }
                        if (i < l - 1) {
                            context.outLine();
                        }
                    }
                    context.indent(-1);
                }
            },
            {
                key: 'rootBegin',
                value: function rootBegin(context, type, nodeType) {
                    context.pushColor(colors[type]);
                    if (type === 'node') {
                        context.out(nodeType === 'array' ? '[' : '{');
                        context.indent();
                    }
                }
            },
            {
                key: 'rootEnd',
                value: function rootEnd(context, type, nodeType) {
                    if (type === 'node') {
                        context.indent(-1);
                        context.out(nodeType === 'array' ? ']' : '}');
                    }
                    context.popColor();
                }
            },
            {
                key: 'nodeBegin',
                value: function nodeBegin(context, key, leftKey, type, nodeType) {
                    context.pushColor(colors[type]);
                    context.out(leftKey + ': ');
                    if (type === 'node') {
                        context.out(nodeType === 'array' ? '[' : '{');
                        context.indent();
                    }
                }
            },
            {
                key: 'nodeEnd',
                value: function nodeEnd(context, key, leftKey, type, nodeType, isLast) {
                    if (type === 'node') {
                        context.indent(-1);
                        context.out(nodeType === 'array' ? ']' : '}' + (isLast ? '' : ','));
                    }
                    if (!isLast) {
                        context.outLine();
                    }
                    context.popColor();
                }
            },
            {
                key: 'format_unchanged',
                value: function format_unchanged(context, delta, left) {
                    if (typeof left === 'undefined') {
                        return;
                    }
                    this.formatValue(context, left);
                }
            },
            {
                key: 'format_movedestination',
                value: function format_movedestination(context, delta, left) {
                    if (typeof left === 'undefined') {
                        return;
                    }
                    this.formatValue(context, left);
                }
            },
            {
                key: 'format_node',
                value: function format_node(context, delta, left) {
                    // recurse
                    this.formatDeltaChildren(context, delta, left);
                }
            },
            {
                key: 'format_added',
                value: function format_added(context, delta) {
                    this.formatValue(context, delta[0]);
                }
            },
            {
                key: 'format_modified',
                value: function format_modified(context, delta) {
                    context.pushColor(colors.deleted);
                    this.formatValue(context, delta[0]);
                    context.popColor();
                    context.out(' => ');
                    context.pushColor(colors.added);
                    this.formatValue(context, delta[1]);
                    context.popColor();
                }
            },
            {
                key: 'format_deleted',
                value: function format_deleted(context, delta) {
                    this.formatValue(context, delta[0]);
                }
            },
            {
                key: 'format_moved',
                value: function format_moved(context, delta) {
                    context.out('==> ' + delta[1]);
                }
            },
            {
                key: 'format_textdiff',
                value: function format_textdiff(context, delta) {
                    this.formatTextDiffString(context, delta[0]);
                }
            }
        ]);
        return ConsoleFormatter;
    }(BaseFormatter);
    var defaultInstance$3 = void 0;
    var format$3 = function format(delta, left) {
        if (!defaultInstance$3) {
            defaultInstance$3 = new ConsoleFormatter();
        }
        return defaultInstance$3.format(delta, left);
    };
    function log$1(delta, left) {
        console.log(format$3(delta, left));
    }
    var console$1 = Object.freeze({
        default: ConsoleFormatter,
        format: format$3,
        log: log$1
    });
    var index = Object.freeze({
        base: base,
        html: html,
        annotated: annotated,
        jsonpatch: jsonpatch,
        console: console$1
    });
    // use as 2nd parameter for JSON.parse to revive Date instances
    function dateReviver(key, value) {
        var parts = void 0;
        if (typeof value === 'string') {
            // eslint-disable-next-line max-len
            parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d*))?(Z|([+-])(\d{2}):(\d{2}))$/.exec(value);
            if (parts) {
                return new Date(Date.UTC(+parts[1], +parts[2] - 1, +parts[3], +parts[4], +parts[5], +parts[6], +(parts[7] || 0)));
            }
        }
        return value;
    }
    function create(options) {
        return new DiffPatcher(options);
    }
    var defaultInstance$4 = void 0;
    function diff() {
        if (!defaultInstance$4) {
            defaultInstance$4 = new DiffPatcher();
        }
        return defaultInstance$4.diff.apply(defaultInstance$4, arguments);
    }
    function patch() {
        if (!defaultInstance$4) {
            defaultInstance$4 = new DiffPatcher();
        }
        return defaultInstance$4.patch.apply(defaultInstance$4, arguments);
    }
    function unpatch() {
        if (!defaultInstance$4) {
            defaultInstance$4 = new DiffPatcher();
        }
        return defaultInstance$4.unpatch.apply(defaultInstance$4, arguments);
    }
    function reverse() {
        if (!defaultInstance$4) {
            defaultInstance$4 = new DiffPatcher();
        }
        return defaultInstance$4.reverse.apply(defaultInstance$4, arguments);
    }
    function clone$1() {
        if (!defaultInstance$4) {
            defaultInstance$4 = new DiffPatcher();
        }
        return defaultInstance$4.clone.apply(defaultInstance$4, arguments);
    }
    exports1.DiffPatcher = DiffPatcher;
    exports1.formatters = index;
    exports1.console = console$1;
    exports1.create = create;
    exports1.dateReviver = dateReviver;
    exports1.diff = diff;
    exports1.patch = patch;
    exports1.unpatch = unpatch;
    exports1.reverse = reverse;
    exports1.clone = clone$1;
    Object.defineProperty(exports1, '__esModule', {
        value: true
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvanNvbmRpZmZwYXRjaC12MC4zLjExLnVtZC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuXHR0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBmYWN0b3J5KGV4cG9ydHMsIHJlcXVpcmUoJy4vZW1wdHknKSkgOlxuXHR0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJywgJy4vZW1wdHknXSwgZmFjdG9yeSkgOlxuXHQoZmFjdG9yeSgoZ2xvYmFsLmpzb25kaWZmcGF0Y2ggPSB7fSksZ2xvYmFsLmNoYWxrKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoZXhwb3J0cyxjaGFsaykgeyAndXNlIHN0cmljdCc7XG5cbmNoYWxrID0gY2hhbGsgJiYgY2hhbGsuaGFzT3duUHJvcGVydHkoJ2RlZmF1bHQnKSA/IGNoYWxrWydkZWZhdWx0J10gOiBjaGFsaztcblxudmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmo7XG59IDogZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajtcbn07XG5cblxuXG5cblxuXG5cblxuXG5cblxudmFyIGNsYXNzQ2FsbENoZWNrID0gZnVuY3Rpb24gKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn07XG5cbnZhciBjcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgICBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICAgIGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICAgIHJldHVybiBDb25zdHJ1Y3RvcjtcbiAgfTtcbn0oKTtcblxuXG5cblxuXG5cblxudmFyIGdldCA9IGZ1bmN0aW9uIGdldChvYmplY3QsIHByb3BlcnR5LCByZWNlaXZlcikge1xuICBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7XG4gIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTtcblxuICBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpO1xuXG4gICAgaWYgKHBhcmVudCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGdldChwYXJlbnQsIHByb3BlcnR5LCByZWNlaXZlcik7XG4gICAgfVxuICB9IGVsc2UgaWYgKFwidmFsdWVcIiBpbiBkZXNjKSB7XG4gICAgcmV0dXJuIGRlc2MudmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGdldHRlciA9IGRlc2MuZ2V0O1xuXG4gICAgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7XG4gIH1cbn07XG5cbnZhciBpbmhlcml0cyA9IGZ1bmN0aW9uIChzdWJDbGFzcywgc3VwZXJDbGFzcykge1xuICBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7XG4gIH1cblxuICBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHtcbiAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgdmFsdWU6IHN1YkNsYXNzLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG4gIGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzcztcbn07XG5cblxuXG5cblxuXG5cblxuXG5cblxudmFyIHBvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4gPSBmdW5jdGlvbiAoc2VsZiwgY2FsbCkge1xuICBpZiAoIXNlbGYpIHtcbiAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7XG4gIH1cblxuICByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjtcbn07XG5cblxuXG5cblxudmFyIHNsaWNlZFRvQXJyYXkgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIHNsaWNlSXRlcmF0b3IoYXJyLCBpKSB7XG4gICAgdmFyIF9hcnIgPSBbXTtcbiAgICB2YXIgX24gPSB0cnVlO1xuICAgIHZhciBfZCA9IGZhbHNlO1xuICAgIHZhciBfZSA9IHVuZGVmaW5lZDtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7XG4gICAgICAgIF9hcnIucHVzaChfcy52YWx1ZSk7XG5cbiAgICAgICAgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgX2QgPSB0cnVlO1xuICAgICAgX2UgPSBlcnI7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghX24gJiYgX2lbXCJyZXR1cm5cIl0pIF9pW1wicmV0dXJuXCJdKCk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoX2QpIHRocm93IF9lO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfYXJyO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChhcnIsIGkpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgICByZXR1cm4gYXJyO1xuICAgIH0gZWxzZSBpZiAoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChhcnIpKSB7XG4gICAgICByZXR1cm4gc2xpY2VJdGVyYXRvcihhcnIsIGkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKTtcbiAgICB9XG4gIH07XG59KCk7XG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cbnZhciB0b0NvbnN1bWFibGVBcnJheSA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgIGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIGFycjJbaV0gPSBhcnJbaV07XG5cbiAgICByZXR1cm4gYXJyMjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShhcnIpO1xuICB9XG59O1xuXG52YXIgUHJvY2Vzc29yID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBQcm9jZXNzb3Iob3B0aW9ucykge1xuICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIFByb2Nlc3Nvcik7XG5cbiAgICB0aGlzLnNlbGZPcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLnBpcGVzID0ge307XG4gIH1cblxuICBjcmVhdGVDbGFzcyhQcm9jZXNzb3IsIFt7XG4gICAga2V5OiAnb3B0aW9ucycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG9wdGlvbnMoX29wdGlvbnMpIHtcbiAgICAgIGlmIChfb3B0aW9ucykge1xuICAgICAgICB0aGlzLnNlbGZPcHRpb25zID0gX29wdGlvbnM7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5zZWxmT3B0aW9ucztcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdwaXBlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcGlwZShuYW1lLCBwaXBlQXJnKSB7XG4gICAgICB2YXIgcGlwZSA9IHBpcGVBcmc7XG4gICAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcGlwZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5waXBlc1tuYW1lXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnBpcGVzW25hbWVdID0gcGlwZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG5hbWUgJiYgbmFtZS5uYW1lKSB7XG4gICAgICAgIHBpcGUgPSBuYW1lO1xuICAgICAgICBpZiAocGlwZS5wcm9jZXNzb3IgPT09IHRoaXMpIHtcbiAgICAgICAgICByZXR1cm4gcGlwZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBpcGVzW3BpcGUubmFtZV0gPSBwaXBlO1xuICAgICAgfVxuICAgICAgcGlwZS5wcm9jZXNzb3IgPSB0aGlzO1xuICAgICAgcmV0dXJuIHBpcGU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncHJvY2VzcycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHByb2Nlc3MoaW5wdXQsIHBpcGUpIHtcbiAgICAgIHZhciBjb250ZXh0ID0gaW5wdXQ7XG4gICAgICBjb250ZXh0Lm9wdGlvbnMgPSB0aGlzLm9wdGlvbnMoKTtcbiAgICAgIHZhciBuZXh0UGlwZSA9IHBpcGUgfHwgaW5wdXQucGlwZSB8fCAnZGVmYXVsdCc7XG4gICAgICB2YXIgbGFzdFBpcGUgPSB2b2lkIDA7XG4gICAgICB2YXIgbGFzdENvbnRleHQgPSB2b2lkIDA7XG4gICAgICB3aGlsZSAobmV4dFBpcGUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjb250ZXh0Lm5leHRBZnRlckNoaWxkcmVuICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIC8vIGNoaWxkcmVuIHByb2Nlc3NlZCBhbmQgY29taW5nIGJhY2sgdG8gcGFyZW50XG4gICAgICAgICAgY29udGV4dC5uZXh0ID0gY29udGV4dC5uZXh0QWZ0ZXJDaGlsZHJlbjtcbiAgICAgICAgICBjb250ZXh0Lm5leHRBZnRlckNoaWxkcmVuID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgbmV4dFBpcGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgbmV4dFBpcGUgPSB0aGlzLnBpcGUobmV4dFBpcGUpO1xuICAgICAgICB9XG4gICAgICAgIG5leHRQaXBlLnByb2Nlc3MoY29udGV4dCk7XG4gICAgICAgIGxhc3RDb250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgbGFzdFBpcGUgPSBuZXh0UGlwZTtcbiAgICAgICAgbmV4dFBpcGUgPSBudWxsO1xuICAgICAgICBpZiAoY29udGV4dCkge1xuICAgICAgICAgIGlmIChjb250ZXh0Lm5leHQpIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSBjb250ZXh0Lm5leHQ7XG4gICAgICAgICAgICBuZXh0UGlwZSA9IGxhc3RDb250ZXh0Lm5leHRQaXBlIHx8IGNvbnRleHQucGlwZSB8fCBsYXN0UGlwZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBjb250ZXh0Lmhhc1Jlc3VsdCA/IGNvbnRleHQucmVzdWx0IDogdW5kZWZpbmVkO1xuICAgIH1cbiAgfV0pO1xuICByZXR1cm4gUHJvY2Vzc29yO1xufSgpO1xuXG52YXIgUGlwZSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gUGlwZShuYW1lKSB7XG4gICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUGlwZSk7XG5cbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuZmlsdGVycyA9IFtdO1xuICB9XG5cbiAgY3JlYXRlQ2xhc3MoUGlwZSwgW3tcbiAgICBrZXk6ICdwcm9jZXNzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcHJvY2VzcyhpbnB1dCkge1xuICAgICAgaWYgKCF0aGlzLnByb2Nlc3Nvcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FkZCB0aGlzIHBpcGUgdG8gYSBwcm9jZXNzb3IgYmVmb3JlIHVzaW5nIGl0Jyk7XG4gICAgICB9XG4gICAgICB2YXIgZGVidWcgPSB0aGlzLmRlYnVnO1xuICAgICAgdmFyIGxlbmd0aCA9IHRoaXMuZmlsdGVycy5sZW5ndGg7XG4gICAgICB2YXIgY29udGV4dCA9IGlucHV0O1xuICAgICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICB2YXIgZmlsdGVyID0gdGhpcy5maWx0ZXJzW2luZGV4XTtcbiAgICAgICAgaWYgKGRlYnVnKSB7XG4gICAgICAgICAgdGhpcy5sb2coJ2ZpbHRlcjogJyArIGZpbHRlci5maWx0ZXJOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBmaWx0ZXIoY29udGV4dCk7XG4gICAgICAgIGlmICgodHlwZW9mIGNvbnRleHQgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKGNvbnRleHQpKSA9PT0gJ29iamVjdCcgJiYgY29udGV4dC5leGl0aW5nKSB7XG4gICAgICAgICAgY29udGV4dC5leGl0aW5nID0gZmFsc2U7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghY29udGV4dC5uZXh0ICYmIHRoaXMucmVzdWx0Q2hlY2spIHtcbiAgICAgICAgdGhpcy5yZXN1bHRDaGVjayhjb250ZXh0KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdsb2cnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBsb2cobXNnKSB7XG4gICAgICBjb25zb2xlLmxvZygnW2pzb25kaWZmcGF0Y2hdICcgKyB0aGlzLm5hbWUgKyAnIHBpcGUsICcgKyBtc2cpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2FwcGVuZCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFwcGVuZCgpIHtcbiAgICAgIHZhciBfZmlsdGVycztcblxuICAgICAgKF9maWx0ZXJzID0gdGhpcy5maWx0ZXJzKS5wdXNoLmFwcGx5KF9maWx0ZXJzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncHJlcGVuZCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHByZXBlbmQoKSB7XG4gICAgICB2YXIgX2ZpbHRlcnMyO1xuXG4gICAgICAoX2ZpbHRlcnMyID0gdGhpcy5maWx0ZXJzKS51bnNoaWZ0LmFwcGx5KF9maWx0ZXJzMiwgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2luZGV4T2YnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpbmRleE9mKGZpbHRlck5hbWUpIHtcbiAgICAgIGlmICghZmlsdGVyTmFtZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2EgZmlsdGVyIG5hbWUgaXMgcmVxdWlyZWQnKTtcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmZpbHRlcnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSB0aGlzLmZpbHRlcnNbaW5kZXhdO1xuICAgICAgICBpZiAoZmlsdGVyLmZpbHRlck5hbWUgPT09IGZpbHRlck5hbWUpIHtcbiAgICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBFcnJvcignZmlsdGVyIG5vdCBmb3VuZDogJyArIGZpbHRlck5hbWUpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2xpc3QnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBsaXN0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuZmlsdGVycy5tYXAoZnVuY3Rpb24gKGYpIHtcbiAgICAgICAgcmV0dXJuIGYuZmlsdGVyTmFtZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2FmdGVyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWZ0ZXIoZmlsdGVyTmFtZSkge1xuICAgICAgdmFyIGluZGV4ID0gdGhpcy5pbmRleE9mKGZpbHRlck5hbWUpO1xuICAgICAgdmFyIHBhcmFtcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICBpZiAoIXBhcmFtcy5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdhIGZpbHRlciBpcyByZXF1aXJlZCcpO1xuICAgICAgfVxuICAgICAgcGFyYW1zLnVuc2hpZnQoaW5kZXggKyAxLCAwKTtcbiAgICAgIEFycmF5LnByb3RvdHlwZS5zcGxpY2UuYXBwbHkodGhpcy5maWx0ZXJzLCBwYXJhbXMpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnYmVmb3JlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYmVmb3JlKGZpbHRlck5hbWUpIHtcbiAgICAgIHZhciBpbmRleCA9IHRoaXMuaW5kZXhPZihmaWx0ZXJOYW1lKTtcbiAgICAgIHZhciBwYXJhbXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgaWYgKCFwYXJhbXMubGVuZ3RoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYSBmaWx0ZXIgaXMgcmVxdWlyZWQnKTtcbiAgICAgIH1cbiAgICAgIHBhcmFtcy51bnNoaWZ0KGluZGV4LCAwKTtcbiAgICAgIEFycmF5LnByb3RvdHlwZS5zcGxpY2UuYXBwbHkodGhpcy5maWx0ZXJzLCBwYXJhbXMpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVwbGFjZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlcGxhY2UoZmlsdGVyTmFtZSkge1xuICAgICAgdmFyIGluZGV4ID0gdGhpcy5pbmRleE9mKGZpbHRlck5hbWUpO1xuICAgICAgdmFyIHBhcmFtcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICBpZiAoIXBhcmFtcy5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdhIGZpbHRlciBpcyByZXF1aXJlZCcpO1xuICAgICAgfVxuICAgICAgcGFyYW1zLnVuc2hpZnQoaW5kZXgsIDEpO1xuICAgICAgQXJyYXkucHJvdG90eXBlLnNwbGljZS5hcHBseSh0aGlzLmZpbHRlcnMsIHBhcmFtcyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdyZW1vdmUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmUoZmlsdGVyTmFtZSkge1xuICAgICAgdmFyIGluZGV4ID0gdGhpcy5pbmRleE9mKGZpbHRlck5hbWUpO1xuICAgICAgdGhpcy5maWx0ZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjbGVhcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNsZWFyKCkge1xuICAgICAgdGhpcy5maWx0ZXJzLmxlbmd0aCA9IDA7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzaG91bGRIYXZlUmVzdWx0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2hvdWxkSGF2ZVJlc3VsdChzaG91bGQpIHtcbiAgICAgIGlmIChzaG91bGQgPT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMucmVzdWx0Q2hlY2sgPSBudWxsO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5yZXN1bHRDaGVjaykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgcGlwZSA9IHRoaXM7XG4gICAgICB0aGlzLnJlc3VsdENoZWNrID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICAgICAgaWYgKCFjb250ZXh0Lmhhc1Jlc3VsdCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGNvbnRleHQpO1xuICAgICAgICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcihwaXBlLm5hbWUgKyAnIGZhaWxlZCcpO1xuICAgICAgICAgIGVycm9yLm5vUmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfV0pO1xuICByZXR1cm4gUGlwZTtcbn0oKTtcblxudmFyIENvbnRleHQgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIENvbnRleHQoKSB7XG4gICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgQ29udGV4dCk7XG4gIH1cblxuICBjcmVhdGVDbGFzcyhDb250ZXh0LCBbe1xuICAgIGtleTogJ3NldFJlc3VsdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldFJlc3VsdChyZXN1bHQpIHtcbiAgICAgIHRoaXMucmVzdWx0ID0gcmVzdWx0O1xuICAgICAgdGhpcy5oYXNSZXN1bHQgPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZXhpdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGV4aXQoKSB7XG4gICAgICB0aGlzLmV4aXRpbmcgPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc3dpdGNoVG8nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzd2l0Y2hUbyhuZXh0LCBwaXBlKSB7XG4gICAgICBpZiAodHlwZW9mIG5leHQgPT09ICdzdHJpbmcnIHx8IG5leHQgaW5zdGFuY2VvZiBQaXBlKSB7XG4gICAgICAgIHRoaXMubmV4dFBpcGUgPSBuZXh0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gbmV4dDtcbiAgICAgICAgaWYgKHBpcGUpIHtcbiAgICAgICAgICB0aGlzLm5leHRQaXBlID0gcGlwZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncHVzaCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHB1c2goY2hpbGQsIG5hbWUpIHtcbiAgICAgIGNoaWxkLnBhcmVudCA9IHRoaXM7XG4gICAgICBpZiAodHlwZW9mIG5hbWUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGNoaWxkLmNoaWxkTmFtZSA9IG5hbWU7XG4gICAgICB9XG4gICAgICBjaGlsZC5yb290ID0gdGhpcy5yb290IHx8IHRoaXM7XG4gICAgICBjaGlsZC5vcHRpb25zID0gY2hpbGQub3B0aW9ucyB8fCB0aGlzLm9wdGlvbnM7XG4gICAgICBpZiAoIXRoaXMuY2hpbGRyZW4pIHtcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IFtjaGlsZF07XG4gICAgICAgIHRoaXMubmV4dEFmdGVyQ2hpbGRyZW4gPSB0aGlzLm5leHQgfHwgbnVsbDtcbiAgICAgICAgdGhpcy5uZXh0ID0gY2hpbGQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNoaWxkcmVuW3RoaXMuY2hpbGRyZW4ubGVuZ3RoIC0gMV0ubmV4dCA9IGNoaWxkO1xuICAgICAgICB0aGlzLmNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgICAgfVxuICAgICAgY2hpbGQubmV4dCA9IHRoaXM7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH1dKTtcbiAgcmV0dXJuIENvbnRleHQ7XG59KCk7XG5cbnZhciBpc0FycmF5ID0gdHlwZW9mIEFycmF5LmlzQXJyYXkgPT09ICdmdW5jdGlvbicgPyBBcnJheS5pc0FycmF5IDogZnVuY3Rpb24gKGEpIHtcbiAgcmV0dXJuIGEgaW5zdGFuY2VvZiBBcnJheTtcbn07XG5cbmZ1bmN0aW9uIGNsb25lUmVnRXhwKHJlKSB7XG4gIHZhciByZWdleE1hdGNoID0gL15cXC8oLiopXFwvKFtnaW15dV0qKSQvLmV4ZWMocmUudG9TdHJpbmcoKSk7XG4gIHJldHVybiBuZXcgUmVnRXhwKHJlZ2V4TWF0Y2hbMV0sIHJlZ2V4TWF0Y2hbMl0pO1xufVxuXG5mdW5jdGlvbiBjbG9uZShhcmcpIHtcbiAgaWYgKCh0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihhcmcpKSAhPT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gYXJnO1xuICB9XG4gIGlmIChhcmcgPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAoaXNBcnJheShhcmcpKSB7XG4gICAgcmV0dXJuIGFyZy5tYXAoY2xvbmUpO1xuICB9XG4gIGlmIChhcmcgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKGFyZy5nZXRUaW1lKCkpO1xuICB9XG4gIGlmIChhcmcgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICByZXR1cm4gY2xvbmVSZWdFeHAoYXJnKTtcbiAgfVxuICB2YXIgY2xvbmVkID0ge307XG4gIGZvciAodmFyIG5hbWUgaW4gYXJnKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChhcmcsIG5hbWUpKSB7XG4gICAgICBjbG9uZWRbbmFtZV0gPSBjbG9uZShhcmdbbmFtZV0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gY2xvbmVkO1xufVxuXG52YXIgRGlmZkNvbnRleHQgPSBmdW5jdGlvbiAoX0NvbnRleHQpIHtcbiAgaW5oZXJpdHMoRGlmZkNvbnRleHQsIF9Db250ZXh0KTtcblxuICBmdW5jdGlvbiBEaWZmQ29udGV4dChsZWZ0LCByaWdodCkge1xuICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIERpZmZDb250ZXh0KTtcblxuICAgIHZhciBfdGhpcyA9IHBvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKERpZmZDb250ZXh0Ll9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoRGlmZkNvbnRleHQpKS5jYWxsKHRoaXMpKTtcblxuICAgIF90aGlzLmxlZnQgPSBsZWZ0O1xuICAgIF90aGlzLnJpZ2h0ID0gcmlnaHQ7XG4gICAgX3RoaXMucGlwZSA9ICdkaWZmJztcbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cblxuICBjcmVhdGVDbGFzcyhEaWZmQ29udGV4dCwgW3tcbiAgICBrZXk6ICdzZXRSZXN1bHQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRSZXN1bHQocmVzdWx0KSB7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmNsb25lRGlmZlZhbHVlcyAmJiAodHlwZW9mIHJlc3VsdCA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YocmVzdWx0KSkgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHZhciBjbG9uZSQkMSA9IHR5cGVvZiB0aGlzLm9wdGlvbnMuY2xvbmVEaWZmVmFsdWVzID09PSAnZnVuY3Rpb24nID8gdGhpcy5vcHRpb25zLmNsb25lRGlmZlZhbHVlcyA6IGNsb25lO1xuICAgICAgICBpZiAoX3R5cGVvZihyZXN1bHRbMF0pID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHJlc3VsdFswXSA9IGNsb25lJCQxKHJlc3VsdFswXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF90eXBlb2YocmVzdWx0WzFdKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICByZXN1bHRbMV0gPSBjbG9uZSQkMShyZXN1bHRbMV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gQ29udGV4dC5wcm90b3R5cGUuc2V0UmVzdWx0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XSk7XG4gIHJldHVybiBEaWZmQ29udGV4dDtcbn0oQ29udGV4dCk7XG5cbnZhciBQYXRjaENvbnRleHQgPSBmdW5jdGlvbiAoX0NvbnRleHQpIHtcbiAgaW5oZXJpdHMoUGF0Y2hDb250ZXh0LCBfQ29udGV4dCk7XG5cbiAgZnVuY3Rpb24gUGF0Y2hDb250ZXh0KGxlZnQsIGRlbHRhKSB7XG4gICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUGF0Y2hDb250ZXh0KTtcblxuICAgIHZhciBfdGhpcyA9IHBvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKFBhdGNoQ29udGV4dC5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKFBhdGNoQ29udGV4dCkpLmNhbGwodGhpcykpO1xuXG4gICAgX3RoaXMubGVmdCA9IGxlZnQ7XG4gICAgX3RoaXMuZGVsdGEgPSBkZWx0YTtcbiAgICBfdGhpcy5waXBlID0gJ3BhdGNoJztcbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cblxuICByZXR1cm4gUGF0Y2hDb250ZXh0O1xufShDb250ZXh0KTtcblxudmFyIFJldmVyc2VDb250ZXh0ID0gZnVuY3Rpb24gKF9Db250ZXh0KSB7XG4gIGluaGVyaXRzKFJldmVyc2VDb250ZXh0LCBfQ29udGV4dCk7XG5cbiAgZnVuY3Rpb24gUmV2ZXJzZUNvbnRleHQoZGVsdGEpIHtcbiAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBSZXZlcnNlQ29udGV4dCk7XG5cbiAgICB2YXIgX3RoaXMgPSBwb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChSZXZlcnNlQ29udGV4dC5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKFJldmVyc2VDb250ZXh0KSkuY2FsbCh0aGlzKSk7XG5cbiAgICBfdGhpcy5kZWx0YSA9IGRlbHRhO1xuICAgIF90aGlzLnBpcGUgPSAncmV2ZXJzZSc7XG4gICAgcmV0dXJuIF90aGlzO1xuICB9XG5cbiAgcmV0dXJuIFJldmVyc2VDb250ZXh0O1xufShDb250ZXh0KTtcblxudmFyIGlzQXJyYXkkMSA9IHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSAnZnVuY3Rpb24nID8gQXJyYXkuaXNBcnJheSA6IGZ1bmN0aW9uIChhKSB7XG4gIHJldHVybiBhIGluc3RhbmNlb2YgQXJyYXk7XG59O1xuXG52YXIgZGlmZkZpbHRlciA9IGZ1bmN0aW9uIHRyaXZpYWxNYXRjaGVzRGlmZkZpbHRlcihjb250ZXh0KSB7XG4gIGlmIChjb250ZXh0LmxlZnQgPT09IGNvbnRleHQucmlnaHQpIHtcbiAgICBjb250ZXh0LnNldFJlc3VsdCh1bmRlZmluZWQpLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHR5cGVvZiBjb250ZXh0LmxlZnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBjb250ZXh0LnJpZ2h0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Z1bmN0aW9ucyBhcmUgbm90IHN1cHBvcnRlZCcpO1xuICAgIH1cbiAgICBjb250ZXh0LnNldFJlc3VsdChbY29udGV4dC5yaWdodF0pLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHR5cGVvZiBjb250ZXh0LnJpZ2h0ID09PSAndW5kZWZpbmVkJykge1xuICAgIGNvbnRleHQuc2V0UmVzdWx0KFtjb250ZXh0LmxlZnQsIDAsIDBdKS5leGl0KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICh0eXBlb2YgY29udGV4dC5sZWZ0ID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBjb250ZXh0LnJpZ2h0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdmdW5jdGlvbnMgYXJlIG5vdCBzdXBwb3J0ZWQnKTtcbiAgfVxuICBjb250ZXh0LmxlZnRUeXBlID0gY29udGV4dC5sZWZ0ID09PSBudWxsID8gJ251bGwnIDogX3R5cGVvZihjb250ZXh0LmxlZnQpO1xuICBjb250ZXh0LnJpZ2h0VHlwZSA9IGNvbnRleHQucmlnaHQgPT09IG51bGwgPyAnbnVsbCcgOiBfdHlwZW9mKGNvbnRleHQucmlnaHQpO1xuICBpZiAoY29udGV4dC5sZWZ0VHlwZSAhPT0gY29udGV4dC5yaWdodFR5cGUpIHtcbiAgICBjb250ZXh0LnNldFJlc3VsdChbY29udGV4dC5sZWZ0LCBjb250ZXh0LnJpZ2h0XSkuZXhpdCgpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoY29udGV4dC5sZWZ0VHlwZSA9PT0gJ2Jvb2xlYW4nIHx8IGNvbnRleHQubGVmdFR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgY29udGV4dC5zZXRSZXN1bHQoW2NvbnRleHQubGVmdCwgY29udGV4dC5yaWdodF0pLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGNvbnRleHQubGVmdFR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgY29udGV4dC5sZWZ0SXNBcnJheSA9IGlzQXJyYXkkMShjb250ZXh0LmxlZnQpO1xuICB9XG4gIGlmIChjb250ZXh0LnJpZ2h0VHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICBjb250ZXh0LnJpZ2h0SXNBcnJheSA9IGlzQXJyYXkkMShjb250ZXh0LnJpZ2h0KTtcbiAgfVxuICBpZiAoY29udGV4dC5sZWZ0SXNBcnJheSAhPT0gY29udGV4dC5yaWdodElzQXJyYXkpIHtcbiAgICBjb250ZXh0LnNldFJlc3VsdChbY29udGV4dC5sZWZ0LCBjb250ZXh0LnJpZ2h0XSkuZXhpdCgpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChjb250ZXh0LmxlZnQgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICBpZiAoY29udGV4dC5yaWdodCBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgY29udGV4dC5zZXRSZXN1bHQoW2NvbnRleHQubGVmdC50b1N0cmluZygpLCBjb250ZXh0LnJpZ2h0LnRvU3RyaW5nKCldKS5leGl0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRleHQuc2V0UmVzdWx0KFtjb250ZXh0LmxlZnQsIGNvbnRleHQucmlnaHRdKS5leGl0KCk7XG4gICAgfVxuICB9XG59O1xuZGlmZkZpbHRlci5maWx0ZXJOYW1lID0gJ3RyaXZpYWwnO1xuXG52YXIgcGF0Y2hGaWx0ZXIgPSBmdW5jdGlvbiB0cml2aWFsTWF0Y2hlc1BhdGNoRmlsdGVyKGNvbnRleHQpIHtcbiAgaWYgKHR5cGVvZiBjb250ZXh0LmRlbHRhID09PSAndW5kZWZpbmVkJykge1xuICAgIGNvbnRleHQuc2V0UmVzdWx0KGNvbnRleHQubGVmdCkuZXhpdCgpO1xuICAgIHJldHVybjtcbiAgfVxuICBjb250ZXh0Lm5lc3RlZCA9ICFpc0FycmF5JDEoY29udGV4dC5kZWx0YSk7XG4gIGlmIChjb250ZXh0Lm5lc3RlZCkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoY29udGV4dC5kZWx0YS5sZW5ndGggPT09IDEpIHtcbiAgICBjb250ZXh0LnNldFJlc3VsdChjb250ZXh0LmRlbHRhWzBdKS5leGl0KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChjb250ZXh0LmRlbHRhLmxlbmd0aCA9PT0gMikge1xuICAgIGlmIChjb250ZXh0LmxlZnQgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgIHZhciByZWdleEFyZ3MgPSAvXlxcLyguKilcXC8oW2dpbXl1XSspJC8uZXhlYyhjb250ZXh0LmRlbHRhWzFdKTtcbiAgICAgIGlmIChyZWdleEFyZ3MpIHtcbiAgICAgICAgY29udGV4dC5zZXRSZXN1bHQobmV3IFJlZ0V4cChyZWdleEFyZ3NbMV0sIHJlZ2V4QXJnc1syXSkpLmV4aXQoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICBjb250ZXh0LnNldFJlc3VsdChjb250ZXh0LmRlbHRhWzFdKS5leGl0KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChjb250ZXh0LmRlbHRhLmxlbmd0aCA9PT0gMyAmJiBjb250ZXh0LmRlbHRhWzJdID09PSAwKSB7XG4gICAgY29udGV4dC5zZXRSZXN1bHQodW5kZWZpbmVkKS5leGl0KCk7XG4gIH1cbn07XG5wYXRjaEZpbHRlci5maWx0ZXJOYW1lID0gJ3RyaXZpYWwnO1xuXG52YXIgcmV2ZXJzZUZpbHRlciA9IGZ1bmN0aW9uIHRyaXZpYWxSZWZlcnNlRmlsdGVyKGNvbnRleHQpIHtcbiAgaWYgKHR5cGVvZiBjb250ZXh0LmRlbHRhID09PSAndW5kZWZpbmVkJykge1xuICAgIGNvbnRleHQuc2V0UmVzdWx0KGNvbnRleHQuZGVsdGEpLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29udGV4dC5uZXN0ZWQgPSAhaXNBcnJheSQxKGNvbnRleHQuZGVsdGEpO1xuICBpZiAoY29udGV4dC5uZXN0ZWQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGNvbnRleHQuZGVsdGEubGVuZ3RoID09PSAxKSB7XG4gICAgY29udGV4dC5zZXRSZXN1bHQoW2NvbnRleHQuZGVsdGFbMF0sIDAsIDBdKS5leGl0KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChjb250ZXh0LmRlbHRhLmxlbmd0aCA9PT0gMikge1xuICAgIGNvbnRleHQuc2V0UmVzdWx0KFtjb250ZXh0LmRlbHRhWzFdLCBjb250ZXh0LmRlbHRhWzBdXSkuZXhpdCgpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoY29udGV4dC5kZWx0YS5sZW5ndGggPT09IDMgJiYgY29udGV4dC5kZWx0YVsyXSA9PT0gMCkge1xuICAgIGNvbnRleHQuc2V0UmVzdWx0KFtjb250ZXh0LmRlbHRhWzBdXSkuZXhpdCgpO1xuICB9XG59O1xucmV2ZXJzZUZpbHRlci5maWx0ZXJOYW1lID0gJ3RyaXZpYWwnO1xuXG5mdW5jdGlvbiBjb2xsZWN0Q2hpbGRyZW5EaWZmRmlsdGVyKGNvbnRleHQpIHtcbiAgaWYgKCFjb250ZXh0IHx8ICFjb250ZXh0LmNoaWxkcmVuKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBsZW5ndGggPSBjb250ZXh0LmNoaWxkcmVuLmxlbmd0aDtcbiAgdmFyIGNoaWxkID0gdm9pZCAwO1xuICB2YXIgcmVzdWx0ID0gY29udGV4dC5yZXN1bHQ7XG4gIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICBjaGlsZCA9IGNvbnRleHQuY2hpbGRyZW5baW5kZXhdO1xuICAgIGlmICh0eXBlb2YgY2hpbGQucmVzdWx0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIHJlc3VsdCA9IHJlc3VsdCB8fCB7fTtcbiAgICByZXN1bHRbY2hpbGQuY2hpbGROYW1lXSA9IGNoaWxkLnJlc3VsdDtcbiAgfVxuICBpZiAocmVzdWx0ICYmIGNvbnRleHQubGVmdElzQXJyYXkpIHtcbiAgICByZXN1bHQuX3QgPSAnYSc7XG4gIH1cbiAgY29udGV4dC5zZXRSZXN1bHQocmVzdWx0KS5leGl0KCk7XG59XG5jb2xsZWN0Q2hpbGRyZW5EaWZmRmlsdGVyLmZpbHRlck5hbWUgPSAnY29sbGVjdENoaWxkcmVuJztcblxuZnVuY3Rpb24gb2JqZWN0c0RpZmZGaWx0ZXIoY29udGV4dCkge1xuICBpZiAoY29udGV4dC5sZWZ0SXNBcnJheSB8fCBjb250ZXh0LmxlZnRUeXBlICE9PSAnb2JqZWN0Jykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBuYW1lID0gdm9pZCAwO1xuICB2YXIgY2hpbGQgPSB2b2lkIDA7XG4gIHZhciBwcm9wZXJ0eUZpbHRlciA9IGNvbnRleHQub3B0aW9ucy5wcm9wZXJ0eUZpbHRlcjtcbiAgZm9yIChuYW1lIGluIGNvbnRleHQubGVmdCkge1xuICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbnRleHQubGVmdCwgbmFtZSkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAocHJvcGVydHlGaWx0ZXIgJiYgIXByb3BlcnR5RmlsdGVyKG5hbWUsIGNvbnRleHQpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgY2hpbGQgPSBuZXcgRGlmZkNvbnRleHQoY29udGV4dC5sZWZ0W25hbWVdLCBjb250ZXh0LnJpZ2h0W25hbWVdKTtcbiAgICBjb250ZXh0LnB1c2goY2hpbGQsIG5hbWUpO1xuICB9XG4gIGZvciAobmFtZSBpbiBjb250ZXh0LnJpZ2h0KSB7XG4gICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoY29udGV4dC5yaWdodCwgbmFtZSkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAocHJvcGVydHlGaWx0ZXIgJiYgIXByb3BlcnR5RmlsdGVyKG5hbWUsIGNvbnRleHQpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjb250ZXh0LmxlZnRbbmFtZV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjaGlsZCA9IG5ldyBEaWZmQ29udGV4dCh1bmRlZmluZWQsIGNvbnRleHQucmlnaHRbbmFtZV0pO1xuICAgICAgY29udGV4dC5wdXNoKGNoaWxkLCBuYW1lKTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWNvbnRleHQuY2hpbGRyZW4gfHwgY29udGV4dC5jaGlsZHJlbi5sZW5ndGggPT09IDApIHtcbiAgICBjb250ZXh0LnNldFJlc3VsdCh1bmRlZmluZWQpLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29udGV4dC5leGl0KCk7XG59XG5vYmplY3RzRGlmZkZpbHRlci5maWx0ZXJOYW1lID0gJ29iamVjdHMnO1xuXG52YXIgcGF0Y2hGaWx0ZXIkMSA9IGZ1bmN0aW9uIG5lc3RlZFBhdGNoRmlsdGVyKGNvbnRleHQpIHtcbiAgaWYgKCFjb250ZXh0Lm5lc3RlZCkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoY29udGV4dC5kZWx0YS5fdCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbmFtZSA9IHZvaWQgMDtcbiAgdmFyIGNoaWxkID0gdm9pZCAwO1xuICBmb3IgKG5hbWUgaW4gY29udGV4dC5kZWx0YSkge1xuICAgIGNoaWxkID0gbmV3IFBhdGNoQ29udGV4dChjb250ZXh0LmxlZnRbbmFtZV0sIGNvbnRleHQuZGVsdGFbbmFtZV0pO1xuICAgIGNvbnRleHQucHVzaChjaGlsZCwgbmFtZSk7XG4gIH1cbiAgY29udGV4dC5leGl0KCk7XG59O1xucGF0Y2hGaWx0ZXIkMS5maWx0ZXJOYW1lID0gJ29iamVjdHMnO1xuXG52YXIgY29sbGVjdENoaWxkcmVuUGF0Y2hGaWx0ZXIgPSBmdW5jdGlvbiBjb2xsZWN0Q2hpbGRyZW5QYXRjaEZpbHRlcihjb250ZXh0KSB7XG4gIGlmICghY29udGV4dCB8fCAhY29udGV4dC5jaGlsZHJlbikge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoY29udGV4dC5kZWx0YS5fdCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbGVuZ3RoID0gY29udGV4dC5jaGlsZHJlbi5sZW5ndGg7XG4gIHZhciBjaGlsZCA9IHZvaWQgMDtcbiAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgIGNoaWxkID0gY29udGV4dC5jaGlsZHJlbltpbmRleF07XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChjb250ZXh0LmxlZnQsIGNoaWxkLmNoaWxkTmFtZSkgJiYgY2hpbGQucmVzdWx0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGRlbGV0ZSBjb250ZXh0LmxlZnRbY2hpbGQuY2hpbGROYW1lXTtcbiAgICB9IGVsc2UgaWYgKGNvbnRleHQubGVmdFtjaGlsZC5jaGlsZE5hbWVdICE9PSBjaGlsZC5yZXN1bHQpIHtcbiAgICAgIGNvbnRleHQubGVmdFtjaGlsZC5jaGlsZE5hbWVdID0gY2hpbGQucmVzdWx0O1xuICAgIH1cbiAgfVxuICBjb250ZXh0LnNldFJlc3VsdChjb250ZXh0LmxlZnQpLmV4aXQoKTtcbn07XG5jb2xsZWN0Q2hpbGRyZW5QYXRjaEZpbHRlci5maWx0ZXJOYW1lID0gJ2NvbGxlY3RDaGlsZHJlbic7XG5cbnZhciByZXZlcnNlRmlsdGVyJDEgPSBmdW5jdGlvbiBuZXN0ZWRSZXZlcnNlRmlsdGVyKGNvbnRleHQpIHtcbiAgaWYgKCFjb250ZXh0Lm5lc3RlZCkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoY29udGV4dC5kZWx0YS5fdCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbmFtZSA9IHZvaWQgMDtcbiAgdmFyIGNoaWxkID0gdm9pZCAwO1xuICBmb3IgKG5hbWUgaW4gY29udGV4dC5kZWx0YSkge1xuICAgIGNoaWxkID0gbmV3IFJldmVyc2VDb250ZXh0KGNvbnRleHQuZGVsdGFbbmFtZV0pO1xuICAgIGNvbnRleHQucHVzaChjaGlsZCwgbmFtZSk7XG4gIH1cbiAgY29udGV4dC5leGl0KCk7XG59O1xucmV2ZXJzZUZpbHRlciQxLmZpbHRlck5hbWUgPSAnb2JqZWN0cyc7XG5cbmZ1bmN0aW9uIGNvbGxlY3RDaGlsZHJlblJldmVyc2VGaWx0ZXIoY29udGV4dCkge1xuICBpZiAoIWNvbnRleHQgfHwgIWNvbnRleHQuY2hpbGRyZW4pIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGNvbnRleHQuZGVsdGEuX3QpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGxlbmd0aCA9IGNvbnRleHQuY2hpbGRyZW4ubGVuZ3RoO1xuICB2YXIgY2hpbGQgPSB2b2lkIDA7XG4gIHZhciBkZWx0YSA9IHt9O1xuICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgY2hpbGQgPSBjb250ZXh0LmNoaWxkcmVuW2luZGV4XTtcbiAgICBpZiAoZGVsdGFbY2hpbGQuY2hpbGROYW1lXSAhPT0gY2hpbGQucmVzdWx0KSB7XG4gICAgICBkZWx0YVtjaGlsZC5jaGlsZE5hbWVdID0gY2hpbGQucmVzdWx0O1xuICAgIH1cbiAgfVxuICBjb250ZXh0LnNldFJlc3VsdChkZWx0YSkuZXhpdCgpO1xufVxuY29sbGVjdENoaWxkcmVuUmV2ZXJzZUZpbHRlci5maWx0ZXJOYW1lID0gJ2NvbGxlY3RDaGlsZHJlbic7XG5cbi8qXG5cbkxDUyBpbXBsZW1lbnRhdGlvbiB0aGF0IHN1cHBvcnRzIGFycmF5cyBvciBzdHJpbmdzXG5cbnJlZmVyZW5jZTogaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Mb25nZXN0X2NvbW1vbl9zdWJzZXF1ZW5jZV9wcm9ibGVtXG5cbiovXG5cbnZhciBkZWZhdWx0TWF0Y2ggPSBmdW5jdGlvbiBkZWZhdWx0TWF0Y2goYXJyYXkxLCBhcnJheTIsIGluZGV4MSwgaW5kZXgyKSB7XG4gIHJldHVybiBhcnJheTFbaW5kZXgxXSA9PT0gYXJyYXkyW2luZGV4Ml07XG59O1xuXG52YXIgbGVuZ3RoTWF0cml4ID0gZnVuY3Rpb24gbGVuZ3RoTWF0cml4KGFycmF5MSwgYXJyYXkyLCBtYXRjaCwgY29udGV4dCkge1xuICB2YXIgbGVuMSA9IGFycmF5MS5sZW5ndGg7XG4gIHZhciBsZW4yID0gYXJyYXkyLmxlbmd0aDtcbiAgdmFyIHggPSB2b2lkIDAsXG4gICAgICB5ID0gdm9pZCAwO1xuXG4gIC8vIGluaXRpYWxpemUgZW1wdHkgbWF0cml4IG9mIGxlbjErMSB4IGxlbjIrMVxuICB2YXIgbWF0cml4ID0gW2xlbjEgKyAxXTtcbiAgZm9yICh4ID0gMDsgeCA8IGxlbjEgKyAxOyB4KyspIHtcbiAgICBtYXRyaXhbeF0gPSBbbGVuMiArIDFdO1xuICAgIGZvciAoeSA9IDA7IHkgPCBsZW4yICsgMTsgeSsrKSB7XG4gICAgICBtYXRyaXhbeF1beV0gPSAwO1xuICAgIH1cbiAgfVxuICBtYXRyaXgubWF0Y2ggPSBtYXRjaDtcbiAgLy8gc2F2ZSBzZXF1ZW5jZSBsZW5ndGhzIGZvciBlYWNoIGNvb3JkaW5hdGVcbiAgZm9yICh4ID0gMTsgeCA8IGxlbjEgKyAxOyB4KyspIHtcbiAgICBmb3IgKHkgPSAxOyB5IDwgbGVuMiArIDE7IHkrKykge1xuICAgICAgaWYgKG1hdGNoKGFycmF5MSwgYXJyYXkyLCB4IC0gMSwgeSAtIDEsIGNvbnRleHQpKSB7XG4gICAgICAgIG1hdHJpeFt4XVt5XSA9IG1hdHJpeFt4IC0gMV1beSAtIDFdICsgMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hdHJpeFt4XVt5XSA9IE1hdGgubWF4KG1hdHJpeFt4IC0gMV1beV0sIG1hdHJpeFt4XVt5IC0gMV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbWF0cml4O1xufTtcblxudmFyIGJhY2t0cmFjayA9IGZ1bmN0aW9uIGJhY2t0cmFjayhtYXRyaXgsIGFycmF5MSwgYXJyYXkyLCBpbmRleDEsIGluZGV4MiwgY29udGV4dCkge1xuICBpZiAoaW5kZXgxID09PSAwIHx8IGluZGV4MiA9PT0gMCkge1xuICAgIHJldHVybiB7XG4gICAgICBzZXF1ZW5jZTogW10sXG4gICAgICBpbmRpY2VzMTogW10sXG4gICAgICBpbmRpY2VzMjogW11cbiAgICB9O1xuICB9XG5cbiAgaWYgKG1hdHJpeC5tYXRjaChhcnJheTEsIGFycmF5MiwgaW5kZXgxIC0gMSwgaW5kZXgyIC0gMSwgY29udGV4dCkpIHtcbiAgICB2YXIgc3Vic2VxdWVuY2UgPSBiYWNrdHJhY2sobWF0cml4LCBhcnJheTEsIGFycmF5MiwgaW5kZXgxIC0gMSwgaW5kZXgyIC0gMSwgY29udGV4dCk7XG4gICAgc3Vic2VxdWVuY2Uuc2VxdWVuY2UucHVzaChhcnJheTFbaW5kZXgxIC0gMV0pO1xuICAgIHN1YnNlcXVlbmNlLmluZGljZXMxLnB1c2goaW5kZXgxIC0gMSk7XG4gICAgc3Vic2VxdWVuY2UuaW5kaWNlczIucHVzaChpbmRleDIgLSAxKTtcbiAgICByZXR1cm4gc3Vic2VxdWVuY2U7XG4gIH1cblxuICBpZiAobWF0cml4W2luZGV4MV1baW5kZXgyIC0gMV0gPiBtYXRyaXhbaW5kZXgxIC0gMV1baW5kZXgyXSkge1xuICAgIHJldHVybiBiYWNrdHJhY2sobWF0cml4LCBhcnJheTEsIGFycmF5MiwgaW5kZXgxLCBpbmRleDIgLSAxLCBjb250ZXh0KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFja3RyYWNrKG1hdHJpeCwgYXJyYXkxLCBhcnJheTIsIGluZGV4MSAtIDEsIGluZGV4MiwgY29udGV4dCk7XG4gIH1cbn07XG5cbnZhciBnZXQkMSA9IGZ1bmN0aW9uIGdldChhcnJheTEsIGFycmF5MiwgbWF0Y2gsIGNvbnRleHQpIHtcbiAgdmFyIGlubmVyQ29udGV4dCA9IGNvbnRleHQgfHwge307XG4gIHZhciBtYXRyaXggPSBsZW5ndGhNYXRyaXgoYXJyYXkxLCBhcnJheTIsIG1hdGNoIHx8IGRlZmF1bHRNYXRjaCwgaW5uZXJDb250ZXh0KTtcbiAgdmFyIHJlc3VsdCA9IGJhY2t0cmFjayhtYXRyaXgsIGFycmF5MSwgYXJyYXkyLCBhcnJheTEubGVuZ3RoLCBhcnJheTIubGVuZ3RoLCBpbm5lckNvbnRleHQpO1xuICBpZiAodHlwZW9mIGFycmF5MSA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIGFycmF5MiA9PT0gJ3N0cmluZycpIHtcbiAgICByZXN1bHQuc2VxdWVuY2UgPSByZXN1bHQuc2VxdWVuY2Uuam9pbignJyk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbnZhciBsY3MgPSB7XG4gIGdldDogZ2V0JDFcbn07XG5cbnZhciBBUlJBWV9NT1ZFID0gMztcblxudmFyIGlzQXJyYXkkMiA9IHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSAnZnVuY3Rpb24nID8gQXJyYXkuaXNBcnJheSA6IGZ1bmN0aW9uIChhKSB7XG4gIHJldHVybiBhIGluc3RhbmNlb2YgQXJyYXk7XG59O1xuXG52YXIgYXJyYXlJbmRleE9mID0gdHlwZW9mIEFycmF5LnByb3RvdHlwZS5pbmRleE9mID09PSAnZnVuY3Rpb24nID8gZnVuY3Rpb24gKGFycmF5LCBpdGVtKSB7XG4gIHJldHVybiBhcnJheS5pbmRleE9mKGl0ZW0pO1xufSA6IGZ1bmN0aW9uIChhcnJheSwgaXRlbSkge1xuICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGFycmF5W2ldID09PSBpdGVtKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufTtcblxuZnVuY3Rpb24gYXJyYXlzSGF2ZU1hdGNoQnlSZWYoYXJyYXkxLCBhcnJheTIsIGxlbjEsIGxlbjIpIHtcbiAgZm9yICh2YXIgaW5kZXgxID0gMDsgaW5kZXgxIDwgbGVuMTsgaW5kZXgxKyspIHtcbiAgICB2YXIgdmFsMSA9IGFycmF5MVtpbmRleDFdO1xuICAgIGZvciAodmFyIGluZGV4MiA9IDA7IGluZGV4MiA8IGxlbjI7IGluZGV4MisrKSB7XG4gICAgICB2YXIgdmFsMiA9IGFycmF5MltpbmRleDJdO1xuICAgICAgaWYgKGluZGV4MSAhPT0gaW5kZXgyICYmIHZhbDEgPT09IHZhbDIpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIG1hdGNoSXRlbXMoYXJyYXkxLCBhcnJheTIsIGluZGV4MSwgaW5kZXgyLCBjb250ZXh0KSB7XG4gIHZhciB2YWx1ZTEgPSBhcnJheTFbaW5kZXgxXTtcbiAgdmFyIHZhbHVlMiA9IGFycmF5MltpbmRleDJdO1xuICBpZiAodmFsdWUxID09PSB2YWx1ZTIpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoKHR5cGVvZiB2YWx1ZTEgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKHZhbHVlMSkpICE9PSAnb2JqZWN0JyB8fCAodHlwZW9mIHZhbHVlMiA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YodmFsdWUyKSkgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBvYmplY3RIYXNoID0gY29udGV4dC5vYmplY3RIYXNoO1xuICBpZiAoIW9iamVjdEhhc2gpIHtcbiAgICAvLyBubyB3YXkgdG8gbWF0Y2ggb2JqZWN0cyB3YXMgcHJvdmlkZWQsIHRyeSBtYXRjaCBieSBwb3NpdGlvblxuICAgIHJldHVybiBjb250ZXh0Lm1hdGNoQnlQb3NpdGlvbiAmJiBpbmRleDEgPT09IGluZGV4MjtcbiAgfVxuICB2YXIgaGFzaDEgPSB2b2lkIDA7XG4gIHZhciBoYXNoMiA9IHZvaWQgMDtcbiAgaWYgKHR5cGVvZiBpbmRleDEgPT09ICdudW1iZXInKSB7XG4gICAgY29udGV4dC5oYXNoQ2FjaGUxID0gY29udGV4dC5oYXNoQ2FjaGUxIHx8IFtdO1xuICAgIGhhc2gxID0gY29udGV4dC5oYXNoQ2FjaGUxW2luZGV4MV07XG4gICAgaWYgKHR5cGVvZiBoYXNoMSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnRleHQuaGFzaENhY2hlMVtpbmRleDFdID0gaGFzaDEgPSBvYmplY3RIYXNoKHZhbHVlMSwgaW5kZXgxKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaGFzaDEgPSBvYmplY3RIYXNoKHZhbHVlMSk7XG4gIH1cbiAgaWYgKHR5cGVvZiBoYXNoMSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHR5cGVvZiBpbmRleDIgPT09ICdudW1iZXInKSB7XG4gICAgY29udGV4dC5oYXNoQ2FjaGUyID0gY29udGV4dC5oYXNoQ2FjaGUyIHx8IFtdO1xuICAgIGhhc2gyID0gY29udGV4dC5oYXNoQ2FjaGUyW2luZGV4Ml07XG4gICAgaWYgKHR5cGVvZiBoYXNoMiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnRleHQuaGFzaENhY2hlMltpbmRleDJdID0gaGFzaDIgPSBvYmplY3RIYXNoKHZhbHVlMiwgaW5kZXgyKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaGFzaDIgPSBvYmplY3RIYXNoKHZhbHVlMik7XG4gIH1cbiAgaWYgKHR5cGVvZiBoYXNoMiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIGhhc2gxID09PSBoYXNoMjtcbn1cblxudmFyIGRpZmZGaWx0ZXIkMSA9IGZ1bmN0aW9uIGFycmF5c0RpZmZGaWx0ZXIoY29udGV4dCkge1xuICBpZiAoIWNvbnRleHQubGVmdElzQXJyYXkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgbWF0Y2hDb250ZXh0ID0ge1xuICAgIG9iamVjdEhhc2g6IGNvbnRleHQub3B0aW9ucyAmJiBjb250ZXh0Lm9wdGlvbnMub2JqZWN0SGFzaCxcbiAgICBtYXRjaEJ5UG9zaXRpb246IGNvbnRleHQub3B0aW9ucyAmJiBjb250ZXh0Lm9wdGlvbnMubWF0Y2hCeVBvc2l0aW9uXG4gIH07XG4gIHZhciBjb21tb25IZWFkID0gMDtcbiAgdmFyIGNvbW1vblRhaWwgPSAwO1xuICB2YXIgaW5kZXggPSB2b2lkIDA7XG4gIHZhciBpbmRleDEgPSB2b2lkIDA7XG4gIHZhciBpbmRleDIgPSB2b2lkIDA7XG4gIHZhciBhcnJheTEgPSBjb250ZXh0LmxlZnQ7XG4gIHZhciBhcnJheTIgPSBjb250ZXh0LnJpZ2h0O1xuICB2YXIgbGVuMSA9IGFycmF5MS5sZW5ndGg7XG4gIHZhciBsZW4yID0gYXJyYXkyLmxlbmd0aDtcblxuICB2YXIgY2hpbGQgPSB2b2lkIDA7XG5cbiAgaWYgKGxlbjEgPiAwICYmIGxlbjIgPiAwICYmICFtYXRjaENvbnRleHQub2JqZWN0SGFzaCAmJiB0eXBlb2YgbWF0Y2hDb250ZXh0Lm1hdGNoQnlQb3NpdGlvbiAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgbWF0Y2hDb250ZXh0Lm1hdGNoQnlQb3NpdGlvbiA9ICFhcnJheXNIYXZlTWF0Y2hCeVJlZihhcnJheTEsIGFycmF5MiwgbGVuMSwgbGVuMik7XG4gIH1cblxuICAvLyBzZXBhcmF0ZSBjb21tb24gaGVhZFxuICB3aGlsZSAoY29tbW9uSGVhZCA8IGxlbjEgJiYgY29tbW9uSGVhZCA8IGxlbjIgJiYgbWF0Y2hJdGVtcyhhcnJheTEsIGFycmF5MiwgY29tbW9uSGVhZCwgY29tbW9uSGVhZCwgbWF0Y2hDb250ZXh0KSkge1xuICAgIGluZGV4ID0gY29tbW9uSGVhZDtcbiAgICBjaGlsZCA9IG5ldyBEaWZmQ29udGV4dChjb250ZXh0LmxlZnRbaW5kZXhdLCBjb250ZXh0LnJpZ2h0W2luZGV4XSk7XG4gICAgY29udGV4dC5wdXNoKGNoaWxkLCBpbmRleCk7XG4gICAgY29tbW9uSGVhZCsrO1xuICB9XG4gIC8vIHNlcGFyYXRlIGNvbW1vbiB0YWlsXG4gIHdoaWxlIChjb21tb25UYWlsICsgY29tbW9uSGVhZCA8IGxlbjEgJiYgY29tbW9uVGFpbCArIGNvbW1vbkhlYWQgPCBsZW4yICYmIG1hdGNoSXRlbXMoYXJyYXkxLCBhcnJheTIsIGxlbjEgLSAxIC0gY29tbW9uVGFpbCwgbGVuMiAtIDEgLSBjb21tb25UYWlsLCBtYXRjaENvbnRleHQpKSB7XG4gICAgaW5kZXgxID0gbGVuMSAtIDEgLSBjb21tb25UYWlsO1xuICAgIGluZGV4MiA9IGxlbjIgLSAxIC0gY29tbW9uVGFpbDtcbiAgICBjaGlsZCA9IG5ldyBEaWZmQ29udGV4dChjb250ZXh0LmxlZnRbaW5kZXgxXSwgY29udGV4dC5yaWdodFtpbmRleDJdKTtcbiAgICBjb250ZXh0LnB1c2goY2hpbGQsIGluZGV4Mik7XG4gICAgY29tbW9uVGFpbCsrO1xuICB9XG4gIHZhciByZXN1bHQgPSB2b2lkIDA7XG4gIGlmIChjb21tb25IZWFkICsgY29tbW9uVGFpbCA9PT0gbGVuMSkge1xuICAgIGlmIChsZW4xID09PSBsZW4yKSB7XG4gICAgICAvLyBhcnJheXMgYXJlIGlkZW50aWNhbFxuICAgICAgY29udGV4dC5zZXRSZXN1bHQodW5kZWZpbmVkKS5leGl0KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIHRyaXZpYWwgY2FzZSwgYSBibG9jayAoMSBvciBtb3JlIGNvbnNlY3V0aXZlIGl0ZW1zKSB3YXMgYWRkZWRcbiAgICByZXN1bHQgPSByZXN1bHQgfHwge1xuICAgICAgX3Q6ICdhJ1xuICAgIH07XG4gICAgZm9yIChpbmRleCA9IGNvbW1vbkhlYWQ7IGluZGV4IDwgbGVuMiAtIGNvbW1vblRhaWw7IGluZGV4KyspIHtcbiAgICAgIHJlc3VsdFtpbmRleF0gPSBbYXJyYXkyW2luZGV4XV07XG4gICAgfVxuICAgIGNvbnRleHQuc2V0UmVzdWx0KHJlc3VsdCkuZXhpdCgpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoY29tbW9uSGVhZCArIGNvbW1vblRhaWwgPT09IGxlbjIpIHtcbiAgICAvLyB0cml2aWFsIGNhc2UsIGEgYmxvY2sgKDEgb3IgbW9yZSBjb25zZWN1dGl2ZSBpdGVtcykgd2FzIHJlbW92ZWRcbiAgICByZXN1bHQgPSByZXN1bHQgfHwge1xuICAgICAgX3Q6ICdhJ1xuICAgIH07XG4gICAgZm9yIChpbmRleCA9IGNvbW1vbkhlYWQ7IGluZGV4IDwgbGVuMSAtIGNvbW1vblRhaWw7IGluZGV4KyspIHtcbiAgICAgIHJlc3VsdFsnXycgKyBpbmRleF0gPSBbYXJyYXkxW2luZGV4XSwgMCwgMF07XG4gICAgfVxuICAgIGNvbnRleHQuc2V0UmVzdWx0KHJlc3VsdCkuZXhpdCgpO1xuICAgIHJldHVybjtcbiAgfVxuICAvLyByZXNldCBoYXNoIGNhY2hlXG4gIGRlbGV0ZSBtYXRjaENvbnRleHQuaGFzaENhY2hlMTtcbiAgZGVsZXRlIG1hdGNoQ29udGV4dC5oYXNoQ2FjaGUyO1xuXG4gIC8vIGRpZmYgaXMgbm90IHRyaXZpYWwsIGZpbmQgdGhlIExDUyAoTG9uZ2VzdCBDb21tb24gU3Vic2VxdWVuY2UpXG4gIHZhciB0cmltbWVkMSA9IGFycmF5MS5zbGljZShjb21tb25IZWFkLCBsZW4xIC0gY29tbW9uVGFpbCk7XG4gIHZhciB0cmltbWVkMiA9IGFycmF5Mi5zbGljZShjb21tb25IZWFkLCBsZW4yIC0gY29tbW9uVGFpbCk7XG4gIHZhciBzZXEgPSBsY3MuZ2V0KHRyaW1tZWQxLCB0cmltbWVkMiwgbWF0Y2hJdGVtcywgbWF0Y2hDb250ZXh0KTtcbiAgdmFyIHJlbW92ZWRJdGVtcyA9IFtdO1xuICByZXN1bHQgPSByZXN1bHQgfHwge1xuICAgIF90OiAnYSdcbiAgfTtcbiAgZm9yIChpbmRleCA9IGNvbW1vbkhlYWQ7IGluZGV4IDwgbGVuMSAtIGNvbW1vblRhaWw7IGluZGV4KyspIHtcbiAgICBpZiAoYXJyYXlJbmRleE9mKHNlcS5pbmRpY2VzMSwgaW5kZXggLSBjb21tb25IZWFkKSA8IDApIHtcbiAgICAgIC8vIHJlbW92ZWRcbiAgICAgIHJlc3VsdFsnXycgKyBpbmRleF0gPSBbYXJyYXkxW2luZGV4XSwgMCwgMF07XG4gICAgICByZW1vdmVkSXRlbXMucHVzaChpbmRleCk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGRldGVjdE1vdmUgPSB0cnVlO1xuICBpZiAoY29udGV4dC5vcHRpb25zICYmIGNvbnRleHQub3B0aW9ucy5hcnJheXMgJiYgY29udGV4dC5vcHRpb25zLmFycmF5cy5kZXRlY3RNb3ZlID09PSBmYWxzZSkge1xuICAgIGRldGVjdE1vdmUgPSBmYWxzZTtcbiAgfVxuICB2YXIgaW5jbHVkZVZhbHVlT25Nb3ZlID0gZmFsc2U7XG4gIGlmIChjb250ZXh0Lm9wdGlvbnMgJiYgY29udGV4dC5vcHRpb25zLmFycmF5cyAmJiBjb250ZXh0Lm9wdGlvbnMuYXJyYXlzLmluY2x1ZGVWYWx1ZU9uTW92ZSkge1xuICAgIGluY2x1ZGVWYWx1ZU9uTW92ZSA9IHRydWU7XG4gIH1cblxuICB2YXIgcmVtb3ZlZEl0ZW1zTGVuZ3RoID0gcmVtb3ZlZEl0ZW1zLmxlbmd0aDtcbiAgZm9yIChpbmRleCA9IGNvbW1vbkhlYWQ7IGluZGV4IDwgbGVuMiAtIGNvbW1vblRhaWw7IGluZGV4KyspIHtcbiAgICB2YXIgaW5kZXhPbkFycmF5MiA9IGFycmF5SW5kZXhPZihzZXEuaW5kaWNlczIsIGluZGV4IC0gY29tbW9uSGVhZCk7XG4gICAgaWYgKGluZGV4T25BcnJheTIgPCAwKSB7XG4gICAgICAvLyBhZGRlZCwgdHJ5IHRvIG1hdGNoIHdpdGggYSByZW1vdmVkIGl0ZW0gYW5kIHJlZ2lzdGVyIGFzIHBvc2l0aW9uIG1vdmVcbiAgICAgIHZhciBpc01vdmUgPSBmYWxzZTtcbiAgICAgIGlmIChkZXRlY3RNb3ZlICYmIHJlbW92ZWRJdGVtc0xlbmd0aCA+IDApIHtcbiAgICAgICAgZm9yICh2YXIgcmVtb3ZlSXRlbUluZGV4MSA9IDA7IHJlbW92ZUl0ZW1JbmRleDEgPCByZW1vdmVkSXRlbXNMZW5ndGg7IHJlbW92ZUl0ZW1JbmRleDErKykge1xuICAgICAgICAgIGluZGV4MSA9IHJlbW92ZWRJdGVtc1tyZW1vdmVJdGVtSW5kZXgxXTtcbiAgICAgICAgICBpZiAobWF0Y2hJdGVtcyh0cmltbWVkMSwgdHJpbW1lZDIsIGluZGV4MSAtIGNvbW1vbkhlYWQsIGluZGV4IC0gY29tbW9uSGVhZCwgbWF0Y2hDb250ZXh0KSkge1xuICAgICAgICAgICAgLy8gc3RvcmUgcG9zaXRpb24gbW92ZSBhczogW29yaWdpbmFsVmFsdWUsIG5ld1Bvc2l0aW9uLCBBUlJBWV9NT1ZFXVxuICAgICAgICAgICAgcmVzdWx0WydfJyArIGluZGV4MV0uc3BsaWNlKDEsIDIsIGluZGV4LCBBUlJBWV9NT1ZFKTtcbiAgICAgICAgICAgIGlmICghaW5jbHVkZVZhbHVlT25Nb3ZlKSB7XG4gICAgICAgICAgICAgIC8vIGRvbid0IGluY2x1ZGUgbW92ZWQgdmFsdWUgb24gZGlmZiwgdG8gc2F2ZSBieXRlc1xuICAgICAgICAgICAgICByZXN1bHRbJ18nICsgaW5kZXgxXVswXSA9ICcnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpbmRleDIgPSBpbmRleDtcbiAgICAgICAgICAgIGNoaWxkID0gbmV3IERpZmZDb250ZXh0KGNvbnRleHQubGVmdFtpbmRleDFdLCBjb250ZXh0LnJpZ2h0W2luZGV4Ml0pO1xuICAgICAgICAgICAgY29udGV4dC5wdXNoKGNoaWxkLCBpbmRleDIpO1xuICAgICAgICAgICAgcmVtb3ZlZEl0ZW1zLnNwbGljZShyZW1vdmVJdGVtSW5kZXgxLCAxKTtcbiAgICAgICAgICAgIGlzTW92ZSA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghaXNNb3ZlKSB7XG4gICAgICAgIC8vIGFkZGVkXG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBbYXJyYXkyW2luZGV4XV07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG1hdGNoLCBkbyBpbm5lciBkaWZmXG4gICAgICBpbmRleDEgPSBzZXEuaW5kaWNlczFbaW5kZXhPbkFycmF5Ml0gKyBjb21tb25IZWFkO1xuICAgICAgaW5kZXgyID0gc2VxLmluZGljZXMyW2luZGV4T25BcnJheTJdICsgY29tbW9uSGVhZDtcbiAgICAgIGNoaWxkID0gbmV3IERpZmZDb250ZXh0KGNvbnRleHQubGVmdFtpbmRleDFdLCBjb250ZXh0LnJpZ2h0W2luZGV4Ml0pO1xuICAgICAgY29udGV4dC5wdXNoKGNoaWxkLCBpbmRleDIpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnRleHQuc2V0UmVzdWx0KHJlc3VsdCkuZXhpdCgpO1xufTtcbmRpZmZGaWx0ZXIkMS5maWx0ZXJOYW1lID0gJ2FycmF5cyc7XG5cbnZhciBjb21wYXJlID0ge1xuICBudW1lcmljYWxseTogZnVuY3Rpb24gbnVtZXJpY2FsbHkoYSwgYikge1xuICAgIHJldHVybiBhIC0gYjtcbiAgfSxcbiAgbnVtZXJpY2FsbHlCeTogZnVuY3Rpb24gbnVtZXJpY2FsbHlCeShuYW1lKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gYVtuYW1lXSAtIGJbbmFtZV07XG4gICAgfTtcbiAgfVxufTtcblxudmFyIHBhdGNoRmlsdGVyJDIgPSBmdW5jdGlvbiBuZXN0ZWRQYXRjaEZpbHRlcihjb250ZXh0KSB7XG4gIGlmICghY29udGV4dC5uZXN0ZWQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGNvbnRleHQuZGVsdGEuX3QgIT09ICdhJykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgaW5kZXggPSB2b2lkIDA7XG4gIHZhciBpbmRleDEgPSB2b2lkIDA7XG5cbiAgdmFyIGRlbHRhID0gY29udGV4dC5kZWx0YTtcbiAgdmFyIGFycmF5ID0gY29udGV4dC5sZWZ0O1xuXG4gIC8vIGZpcnN0LCBzZXBhcmF0ZSByZW1vdmFscywgaW5zZXJ0aW9ucyBhbmQgbW9kaWZpY2F0aW9uc1xuICB2YXIgdG9SZW1vdmUgPSBbXTtcbiAgdmFyIHRvSW5zZXJ0ID0gW107XG4gIHZhciB0b01vZGlmeSA9IFtdO1xuICBmb3IgKGluZGV4IGluIGRlbHRhKSB7XG4gICAgaWYgKGluZGV4ICE9PSAnX3QnKSB7XG4gICAgICBpZiAoaW5kZXhbMF0gPT09ICdfJykge1xuICAgICAgICAvLyByZW1vdmVkIGl0ZW0gZnJvbSBvcmlnaW5hbCBhcnJheVxuICAgICAgICBpZiAoZGVsdGFbaW5kZXhdWzJdID09PSAwIHx8IGRlbHRhW2luZGV4XVsyXSA9PT0gQVJSQVlfTU9WRSkge1xuICAgICAgICAgIHRvUmVtb3ZlLnB1c2gocGFyc2VJbnQoaW5kZXguc2xpY2UoMSksIDEwKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdvbmx5IHJlbW92YWwgb3IgbW92ZSBjYW4gYmUgYXBwbGllZCBhdCBvcmlnaW5hbCBhcnJheSBpbmRpY2VzLCcgKyAoJyBpbnZhbGlkIGRpZmYgdHlwZTogJyArIGRlbHRhW2luZGV4XVsyXSkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZGVsdGFbaW5kZXhdLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIC8vIGFkZGVkIGl0ZW0gYXQgbmV3IGFycmF5XG4gICAgICAgICAgdG9JbnNlcnQucHVzaCh7XG4gICAgICAgICAgICBpbmRleDogcGFyc2VJbnQoaW5kZXgsIDEwKSxcbiAgICAgICAgICAgIHZhbHVlOiBkZWx0YVtpbmRleF1bMF1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBtb2RpZmllZCBpdGVtIGF0IG5ldyBhcnJheVxuICAgICAgICAgIHRvTW9kaWZ5LnB1c2goe1xuICAgICAgICAgICAgaW5kZXg6IHBhcnNlSW50KGluZGV4LCAxMCksXG4gICAgICAgICAgICBkZWx0YTogZGVsdGFbaW5kZXhdXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyByZW1vdmUgaXRlbXMsIGluIHJldmVyc2Ugb3JkZXIgdG8gYXZvaWQgc2F3aW5nIG91ciBvd24gZmxvb3JcbiAgdG9SZW1vdmUgPSB0b1JlbW92ZS5zb3J0KGNvbXBhcmUubnVtZXJpY2FsbHkpO1xuICBmb3IgKGluZGV4ID0gdG9SZW1vdmUubGVuZ3RoIC0gMTsgaW5kZXggPj0gMDsgaW5kZXgtLSkge1xuICAgIGluZGV4MSA9IHRvUmVtb3ZlW2luZGV4XTtcbiAgICB2YXIgaW5kZXhEaWZmID0gZGVsdGFbJ18nICsgaW5kZXgxXTtcbiAgICB2YXIgcmVtb3ZlZFZhbHVlID0gYXJyYXkuc3BsaWNlKGluZGV4MSwgMSlbMF07XG4gICAgaWYgKGluZGV4RGlmZlsyXSA9PT0gQVJSQVlfTU9WRSkge1xuICAgICAgLy8gcmVpbnNlcnQgbGF0ZXJcbiAgICAgIHRvSW5zZXJ0LnB1c2goe1xuICAgICAgICBpbmRleDogaW5kZXhEaWZmWzFdLFxuICAgICAgICB2YWx1ZTogcmVtb3ZlZFZhbHVlXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBpbnNlcnQgaXRlbXMsIGluIHJldmVyc2Ugb3JkZXIgdG8gYXZvaWQgbW92aW5nIG91ciBvd24gZmxvb3JcbiAgdG9JbnNlcnQgPSB0b0luc2VydC5zb3J0KGNvbXBhcmUubnVtZXJpY2FsbHlCeSgnaW5kZXgnKSk7XG4gIHZhciB0b0luc2VydExlbmd0aCA9IHRvSW5zZXJ0Lmxlbmd0aDtcbiAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgdG9JbnNlcnRMZW5ndGg7IGluZGV4KyspIHtcbiAgICB2YXIgaW5zZXJ0aW9uID0gdG9JbnNlcnRbaW5kZXhdO1xuICAgIGFycmF5LnNwbGljZShpbnNlcnRpb24uaW5kZXgsIDAsIGluc2VydGlvbi52YWx1ZSk7XG4gIH1cblxuICAvLyBhcHBseSBtb2RpZmljYXRpb25zXG4gIHZhciB0b01vZGlmeUxlbmd0aCA9IHRvTW9kaWZ5Lmxlbmd0aDtcbiAgdmFyIGNoaWxkID0gdm9pZCAwO1xuICBpZiAodG9Nb2RpZnlMZW5ndGggPiAwKSB7XG4gICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgdG9Nb2RpZnlMZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHZhciBtb2RpZmljYXRpb24gPSB0b01vZGlmeVtpbmRleF07XG4gICAgICBjaGlsZCA9IG5ldyBQYXRjaENvbnRleHQoY29udGV4dC5sZWZ0W21vZGlmaWNhdGlvbi5pbmRleF0sIG1vZGlmaWNhdGlvbi5kZWx0YSk7XG4gICAgICBjb250ZXh0LnB1c2goY2hpbGQsIG1vZGlmaWNhdGlvbi5pbmRleCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFjb250ZXh0LmNoaWxkcmVuKSB7XG4gICAgY29udGV4dC5zZXRSZXN1bHQoY29udGV4dC5sZWZ0KS5leGl0KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnRleHQuZXhpdCgpO1xufTtcbnBhdGNoRmlsdGVyJDIuZmlsdGVyTmFtZSA9ICdhcnJheXMnO1xuXG52YXIgY29sbGVjdENoaWxkcmVuUGF0Y2hGaWx0ZXIkMSA9IGZ1bmN0aW9uIGNvbGxlY3RDaGlsZHJlblBhdGNoRmlsdGVyKGNvbnRleHQpIHtcbiAgaWYgKCFjb250ZXh0IHx8ICFjb250ZXh0LmNoaWxkcmVuKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChjb250ZXh0LmRlbHRhLl90ICE9PSAnYScpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGxlbmd0aCA9IGNvbnRleHQuY2hpbGRyZW4ubGVuZ3RoO1xuICB2YXIgY2hpbGQgPSB2b2lkIDA7XG4gIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICBjaGlsZCA9IGNvbnRleHQuY2hpbGRyZW5baW5kZXhdO1xuICAgIGNvbnRleHQubGVmdFtjaGlsZC5jaGlsZE5hbWVdID0gY2hpbGQucmVzdWx0O1xuICB9XG4gIGNvbnRleHQuc2V0UmVzdWx0KGNvbnRleHQubGVmdCkuZXhpdCgpO1xufTtcbmNvbGxlY3RDaGlsZHJlblBhdGNoRmlsdGVyJDEuZmlsdGVyTmFtZSA9ICdhcnJheXNDb2xsZWN0Q2hpbGRyZW4nO1xuXG52YXIgcmV2ZXJzZUZpbHRlciQyID0gZnVuY3Rpb24gYXJyYXlzUmV2ZXJzZUZpbHRlcihjb250ZXh0KSB7XG4gIGlmICghY29udGV4dC5uZXN0ZWQpIHtcbiAgICBpZiAoY29udGV4dC5kZWx0YVsyXSA9PT0gQVJSQVlfTU9WRSkge1xuICAgICAgY29udGV4dC5uZXdOYW1lID0gJ18nICsgY29udGV4dC5kZWx0YVsxXTtcbiAgICAgIGNvbnRleHQuc2V0UmVzdWx0KFtjb250ZXh0LmRlbHRhWzBdLCBwYXJzZUludChjb250ZXh0LmNoaWxkTmFtZS5zdWJzdHIoMSksIDEwKSwgQVJSQVlfTU9WRV0pLmV4aXQoKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChjb250ZXh0LmRlbHRhLl90ICE9PSAnYScpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG5hbWUgPSB2b2lkIDA7XG4gIHZhciBjaGlsZCA9IHZvaWQgMDtcbiAgZm9yIChuYW1lIGluIGNvbnRleHQuZGVsdGEpIHtcbiAgICBpZiAobmFtZSA9PT0gJ190Jykge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGNoaWxkID0gbmV3IFJldmVyc2VDb250ZXh0KGNvbnRleHQuZGVsdGFbbmFtZV0pO1xuICAgIGNvbnRleHQucHVzaChjaGlsZCwgbmFtZSk7XG4gIH1cbiAgY29udGV4dC5leGl0KCk7XG59O1xucmV2ZXJzZUZpbHRlciQyLmZpbHRlck5hbWUgPSAnYXJyYXlzJztcblxudmFyIHJldmVyc2VBcnJheURlbHRhSW5kZXggPSBmdW5jdGlvbiByZXZlcnNlQXJyYXlEZWx0YUluZGV4KGRlbHRhLCBpbmRleCwgaXRlbURlbHRhKSB7XG4gIGlmICh0eXBlb2YgaW5kZXggPT09ICdzdHJpbmcnICYmIGluZGV4WzBdID09PSAnXycpIHtcbiAgICByZXR1cm4gcGFyc2VJbnQoaW5kZXguc3Vic3RyKDEpLCAxMCk7XG4gIH0gZWxzZSBpZiAoaXNBcnJheSQyKGl0ZW1EZWx0YSkgJiYgaXRlbURlbHRhWzJdID09PSAwKSB7XG4gICAgcmV0dXJuICdfJyArIGluZGV4O1xuICB9XG5cbiAgdmFyIHJldmVyc2VJbmRleCA9ICtpbmRleDtcbiAgZm9yICh2YXIgZGVsdGFJbmRleCBpbiBkZWx0YSkge1xuICAgIHZhciBkZWx0YUl0ZW0gPSBkZWx0YVtkZWx0YUluZGV4XTtcbiAgICBpZiAoaXNBcnJheSQyKGRlbHRhSXRlbSkpIHtcbiAgICAgIGlmIChkZWx0YUl0ZW1bMl0gPT09IEFSUkFZX01PVkUpIHtcbiAgICAgICAgdmFyIG1vdmVGcm9tSW5kZXggPSBwYXJzZUludChkZWx0YUluZGV4LnN1YnN0cigxKSwgMTApO1xuICAgICAgICB2YXIgbW92ZVRvSW5kZXggPSBkZWx0YUl0ZW1bMV07XG4gICAgICAgIGlmIChtb3ZlVG9JbmRleCA9PT0gK2luZGV4KSB7XG4gICAgICAgICAgcmV0dXJuIG1vdmVGcm9tSW5kZXg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1vdmVGcm9tSW5kZXggPD0gcmV2ZXJzZUluZGV4ICYmIG1vdmVUb0luZGV4ID4gcmV2ZXJzZUluZGV4KSB7XG4gICAgICAgICAgcmV2ZXJzZUluZGV4Kys7XG4gICAgICAgIH0gZWxzZSBpZiAobW92ZUZyb21JbmRleCA+PSByZXZlcnNlSW5kZXggJiYgbW92ZVRvSW5kZXggPCByZXZlcnNlSW5kZXgpIHtcbiAgICAgICAgICByZXZlcnNlSW5kZXgtLTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChkZWx0YUl0ZW1bMl0gPT09IDApIHtcbiAgICAgICAgdmFyIGRlbGV0ZUluZGV4ID0gcGFyc2VJbnQoZGVsdGFJbmRleC5zdWJzdHIoMSksIDEwKTtcbiAgICAgICAgaWYgKGRlbGV0ZUluZGV4IDw9IHJldmVyc2VJbmRleCkge1xuICAgICAgICAgIHJldmVyc2VJbmRleCsrO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGRlbHRhSXRlbS5sZW5ndGggPT09IDEgJiYgZGVsdGFJbmRleCA8PSByZXZlcnNlSW5kZXgpIHtcbiAgICAgICAgcmV2ZXJzZUluZGV4LS07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJldmVyc2VJbmRleDtcbn07XG5cbmZ1bmN0aW9uIGNvbGxlY3RDaGlsZHJlblJldmVyc2VGaWx0ZXIkMShjb250ZXh0KSB7XG4gIGlmICghY29udGV4dCB8fCAhY29udGV4dC5jaGlsZHJlbikge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoY29udGV4dC5kZWx0YS5fdCAhPT0gJ2EnKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBsZW5ndGggPSBjb250ZXh0LmNoaWxkcmVuLmxlbmd0aDtcbiAgdmFyIGNoaWxkID0gdm9pZCAwO1xuICB2YXIgZGVsdGEgPSB7XG4gICAgX3Q6ICdhJ1xuICB9O1xuXG4gIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICBjaGlsZCA9IGNvbnRleHQuY2hpbGRyZW5baW5kZXhdO1xuICAgIHZhciBuYW1lID0gY2hpbGQubmV3TmFtZTtcbiAgICBpZiAodHlwZW9mIG5hbWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBuYW1lID0gcmV2ZXJzZUFycmF5RGVsdGFJbmRleChjb250ZXh0LmRlbHRhLCBjaGlsZC5jaGlsZE5hbWUsIGNoaWxkLnJlc3VsdCk7XG4gICAgfVxuICAgIGlmIChkZWx0YVtuYW1lXSAhPT0gY2hpbGQucmVzdWx0KSB7XG4gICAgICBkZWx0YVtuYW1lXSA9IGNoaWxkLnJlc3VsdDtcbiAgICB9XG4gIH1cbiAgY29udGV4dC5zZXRSZXN1bHQoZGVsdGEpLmV4aXQoKTtcbn1cbmNvbGxlY3RDaGlsZHJlblJldmVyc2VGaWx0ZXIkMS5maWx0ZXJOYW1lID0gJ2FycmF5c0NvbGxlY3RDaGlsZHJlbic7XG5cbnZhciBkaWZmRmlsdGVyJDIgPSBmdW5jdGlvbiBkYXRlc0RpZmZGaWx0ZXIoY29udGV4dCkge1xuICBpZiAoY29udGV4dC5sZWZ0IGluc3RhbmNlb2YgRGF0ZSkge1xuICAgIGlmIChjb250ZXh0LnJpZ2h0IGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgaWYgKGNvbnRleHQubGVmdC5nZXRUaW1lKCkgIT09IGNvbnRleHQucmlnaHQuZ2V0VGltZSgpKSB7XG4gICAgICAgIGNvbnRleHQuc2V0UmVzdWx0KFtjb250ZXh0LmxlZnQsIGNvbnRleHQucmlnaHRdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnRleHQuc2V0UmVzdWx0KHVuZGVmaW5lZCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRleHQuc2V0UmVzdWx0KFtjb250ZXh0LmxlZnQsIGNvbnRleHQucmlnaHRdKTtcbiAgICB9XG4gICAgY29udGV4dC5leGl0KCk7XG4gIH0gZWxzZSBpZiAoY29udGV4dC5yaWdodCBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICBjb250ZXh0LnNldFJlc3VsdChbY29udGV4dC5sZWZ0LCBjb250ZXh0LnJpZ2h0XSkuZXhpdCgpO1xuICB9XG59O1xuZGlmZkZpbHRlciQyLmZpbHRlck5hbWUgPSAnZGF0ZXMnO1xuXG5mdW5jdGlvbiBjcmVhdGVDb21tb25qc01vZHVsZShmbiwgbW9kdWxlKSB7XG5cdHJldHVybiBtb2R1bGUgPSB7IGV4cG9ydHM6IHt9IH0sIGZuKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMpLCBtb2R1bGUuZXhwb3J0cztcbn1cblxudmFyIGRpZmZNYXRjaFBhdGNoID0gY3JlYXRlQ29tbW9uanNNb2R1bGUoZnVuY3Rpb24gKG1vZHVsZSkge1xuZnVuY3Rpb24gZGlmZl9tYXRjaF9wYXRjaCgpIHtcblxuICAvLyBEZWZhdWx0cy5cbiAgLy8gUmVkZWZpbmUgdGhlc2UgaW4geW91ciBwcm9ncmFtIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0cy5cblxuICAvLyBOdW1iZXIgb2Ygc2Vjb25kcyB0byBtYXAgYSBkaWZmIGJlZm9yZSBnaXZpbmcgdXAgKDAgZm9yIGluZmluaXR5KS5cbiAgdGhpcy5EaWZmX1RpbWVvdXQgPSAxLjA7XG4gIC8vIENvc3Qgb2YgYW4gZW1wdHkgZWRpdCBvcGVyYXRpb24gaW4gdGVybXMgb2YgZWRpdCBjaGFyYWN0ZXJzLlxuICB0aGlzLkRpZmZfRWRpdENvc3QgPSA0O1xuICAvLyBBdCB3aGF0IHBvaW50IGlzIG5vIG1hdGNoIGRlY2xhcmVkICgwLjAgPSBwZXJmZWN0aW9uLCAxLjAgPSB2ZXJ5IGxvb3NlKS5cbiAgdGhpcy5NYXRjaF9UaHJlc2hvbGQgPSAwLjU7XG4gIC8vIEhvdyBmYXIgdG8gc2VhcmNoIGZvciBhIG1hdGNoICgwID0gZXhhY3QgbG9jYXRpb24sIDEwMDArID0gYnJvYWQgbWF0Y2gpLlxuICAvLyBBIG1hdGNoIHRoaXMgbWFueSBjaGFyYWN0ZXJzIGF3YXkgZnJvbSB0aGUgZXhwZWN0ZWQgbG9jYXRpb24gd2lsbCBhZGRcbiAgLy8gMS4wIHRvIHRoZSBzY29yZSAoMC4wIGlzIGEgcGVyZmVjdCBtYXRjaCkuXG4gIHRoaXMuTWF0Y2hfRGlzdGFuY2UgPSAxMDAwO1xuICAvLyBXaGVuIGRlbGV0aW5nIGEgbGFyZ2UgYmxvY2sgb2YgdGV4dCAob3ZlciB+NjQgY2hhcmFjdGVycyksIGhvdyBjbG9zZSBkb1xuICAvLyB0aGUgY29udGVudHMgaGF2ZSB0byBiZSB0byBtYXRjaCB0aGUgZXhwZWN0ZWQgY29udGVudHMuICgwLjAgPSBwZXJmZWN0aW9uLFxuICAvLyAxLjAgPSB2ZXJ5IGxvb3NlKS4gIE5vdGUgdGhhdCBNYXRjaF9UaHJlc2hvbGQgY29udHJvbHMgaG93IGNsb3NlbHkgdGhlXG4gIC8vIGVuZCBwb2ludHMgb2YgYSBkZWxldGUgbmVlZCB0byBtYXRjaC5cbiAgdGhpcy5QYXRjaF9EZWxldGVUaHJlc2hvbGQgPSAwLjU7XG4gIC8vIENodW5rIHNpemUgZm9yIGNvbnRleHQgbGVuZ3RoLlxuICB0aGlzLlBhdGNoX01hcmdpbiA9IDQ7XG5cbiAgLy8gVGhlIG51bWJlciBvZiBiaXRzIGluIGFuIGludC5cbiAgdGhpcy5NYXRjaF9NYXhCaXRzID0gMzI7XG59XG5cblxuLy8gIERJRkYgRlVOQ1RJT05TXG5cblxuLyoqXG4gKiBUaGUgZGF0YSBzdHJ1Y3R1cmUgcmVwcmVzZW50aW5nIGEgZGlmZiBpcyBhbiBhcnJheSBvZiB0dXBsZXM6XG4gKiBbW0RJRkZfREVMRVRFLCAnSGVsbG8nXSwgW0RJRkZfSU5TRVJULCAnR29vZGJ5ZSddLCBbRElGRl9FUVVBTCwgJyB3b3JsZC4nXV1cbiAqIHdoaWNoIG1lYW5zOiBkZWxldGUgJ0hlbGxvJywgYWRkICdHb29kYnllJyBhbmQga2VlcCAnIHdvcmxkLidcbiAqL1xudmFyIERJRkZfREVMRVRFID0gLTE7XG52YXIgRElGRl9JTlNFUlQgPSAxO1xudmFyIERJRkZfRVFVQUwgPSAwO1xuXG4vKiogQHR5cGVkZWYge3swOiBudW1iZXIsIDE6IHN0cmluZ319ICovXG5kaWZmX21hdGNoX3BhdGNoLnByb3RvdHlwZS5kaWZmX21haW4gPSBmdW5jdGlvbih0ZXh0MSwgdGV4dDIsIG9wdF9jaGVja2xpbmVzLFxuICAgIG9wdF9kZWFkbGluZSkge1xuICAvLyBTZXQgYSBkZWFkbGluZSBieSB3aGljaCB0aW1lIHRoZSBkaWZmIG11c3QgYmUgY29tcGxldGUuXG4gIGlmICh0eXBlb2Ygb3B0X2RlYWRsaW5lID09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHRoaXMuRGlmZl9UaW1lb3V0IDw9IDApIHtcbiAgICAgIG9wdF9kZWFkbGluZSA9IE51bWJlci5NQVhfVkFMVUU7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdF9kZWFkbGluZSA9IChuZXcgRGF0ZSkuZ2V0VGltZSgpICsgdGhpcy5EaWZmX1RpbWVvdXQgKiAxMDAwO1xuICAgIH1cbiAgfVxuICB2YXIgZGVhZGxpbmUgPSBvcHRfZGVhZGxpbmU7XG5cbiAgLy8gQ2hlY2sgZm9yIG51bGwgaW5wdXRzLlxuICBpZiAodGV4dDEgPT0gbnVsbCB8fCB0ZXh0MiA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOdWxsIGlucHV0LiAoZGlmZl9tYWluKScpO1xuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIGVxdWFsaXR5IChzcGVlZHVwKS5cbiAgaWYgKHRleHQxID09IHRleHQyKSB7XG4gICAgaWYgKHRleHQxKSB7XG4gICAgICByZXR1cm4gW1tESUZGX0VRVUFMLCB0ZXh0MV1dO1xuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICBpZiAodHlwZW9mIG9wdF9jaGVja2xpbmVzID09ICd1bmRlZmluZWQnKSB7XG4gICAgb3B0X2NoZWNrbGluZXMgPSB0cnVlO1xuICB9XG4gIHZhciBjaGVja2xpbmVzID0gb3B0X2NoZWNrbGluZXM7XG5cbiAgLy8gVHJpbSBvZmYgY29tbW9uIHByZWZpeCAoc3BlZWR1cCkuXG4gIHZhciBjb21tb25sZW5ndGggPSB0aGlzLmRpZmZfY29tbW9uUHJlZml4KHRleHQxLCB0ZXh0Mik7XG4gIHZhciBjb21tb25wcmVmaXggPSB0ZXh0MS5zdWJzdHJpbmcoMCwgY29tbW9ubGVuZ3RoKTtcbiAgdGV4dDEgPSB0ZXh0MS5zdWJzdHJpbmcoY29tbW9ubGVuZ3RoKTtcbiAgdGV4dDIgPSB0ZXh0Mi5zdWJzdHJpbmcoY29tbW9ubGVuZ3RoKTtcblxuICAvLyBUcmltIG9mZiBjb21tb24gc3VmZml4IChzcGVlZHVwKS5cbiAgY29tbW9ubGVuZ3RoID0gdGhpcy5kaWZmX2NvbW1vblN1ZmZpeCh0ZXh0MSwgdGV4dDIpO1xuICB2YXIgY29tbW9uc3VmZml4ID0gdGV4dDEuc3Vic3RyaW5nKHRleHQxLmxlbmd0aCAtIGNvbW1vbmxlbmd0aCk7XG4gIHRleHQxID0gdGV4dDEuc3Vic3RyaW5nKDAsIHRleHQxLmxlbmd0aCAtIGNvbW1vbmxlbmd0aCk7XG4gIHRleHQyID0gdGV4dDIuc3Vic3RyaW5nKDAsIHRleHQyLmxlbmd0aCAtIGNvbW1vbmxlbmd0aCk7XG5cbiAgLy8gQ29tcHV0ZSB0aGUgZGlmZiBvbiB0aGUgbWlkZGxlIGJsb2NrLlxuICB2YXIgZGlmZnMgPSB0aGlzLmRpZmZfY29tcHV0ZV8odGV4dDEsIHRleHQyLCBjaGVja2xpbmVzLCBkZWFkbGluZSk7XG5cbiAgLy8gUmVzdG9yZSB0aGUgcHJlZml4IGFuZCBzdWZmaXguXG4gIGlmIChjb21tb25wcmVmaXgpIHtcbiAgICBkaWZmcy51bnNoaWZ0KFtESUZGX0VRVUFMLCBjb21tb25wcmVmaXhdKTtcbiAgfVxuICBpZiAoY29tbW9uc3VmZml4KSB7XG4gICAgZGlmZnMucHVzaChbRElGRl9FUVVBTCwgY29tbW9uc3VmZml4XSk7XG4gIH1cbiAgdGhpcy5kaWZmX2NsZWFudXBNZXJnZShkaWZmcyk7XG4gIHJldHVybiBkaWZmcztcbn07XG5cblxuLyoqXG4gKiBGaW5kIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIHR3byB0ZXh0cy4gIEFzc3VtZXMgdGhhdCB0aGUgdGV4dHMgZG8gbm90XG4gKiBoYXZlIGFueSBjb21tb24gcHJlZml4IG9yIHN1ZmZpeC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MSBPbGQgc3RyaW5nIHRvIGJlIGRpZmZlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MiBOZXcgc3RyaW5nIHRvIGJlIGRpZmZlZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gY2hlY2tsaW5lcyBTcGVlZHVwIGZsYWcuICBJZiBmYWxzZSwgdGhlbiBkb24ndCBydW4gYVxuICogICAgIGxpbmUtbGV2ZWwgZGlmZiBmaXJzdCB0byBpZGVudGlmeSB0aGUgY2hhbmdlZCBhcmVhcy5cbiAqICAgICBJZiB0cnVlLCB0aGVuIHJ1biBhIGZhc3Rlciwgc2xpZ2h0bHkgbGVzcyBvcHRpbWFsIGRpZmYuXG4gKiBAcGFyYW0ge251bWJlcn0gZGVhZGxpbmUgVGltZSB3aGVuIHRoZSBkaWZmIHNob3VsZCBiZSBjb21wbGV0ZSBieS5cbiAqIEByZXR1cm4geyFBcnJheS48IWRpZmZfbWF0Y2hfcGF0Y2guRGlmZj59IEFycmF5IG9mIGRpZmYgdHVwbGVzLlxuICogQHByaXZhdGVcbiAqL1xuZGlmZl9tYXRjaF9wYXRjaC5wcm90b3R5cGUuZGlmZl9jb21wdXRlXyA9IGZ1bmN0aW9uKHRleHQxLCB0ZXh0MiwgY2hlY2tsaW5lcyxcbiAgICBkZWFkbGluZSkge1xuICB2YXIgZGlmZnM7XG5cbiAgaWYgKCF0ZXh0MSkge1xuICAgIC8vIEp1c3QgYWRkIHNvbWUgdGV4dCAoc3BlZWR1cCkuXG4gICAgcmV0dXJuIFtbRElGRl9JTlNFUlQsIHRleHQyXV07XG4gIH1cblxuICBpZiAoIXRleHQyKSB7XG4gICAgLy8gSnVzdCBkZWxldGUgc29tZSB0ZXh0IChzcGVlZHVwKS5cbiAgICByZXR1cm4gW1tESUZGX0RFTEVURSwgdGV4dDFdXTtcbiAgfVxuXG4gIHZhciBsb25ndGV4dCA9IHRleHQxLmxlbmd0aCA+IHRleHQyLmxlbmd0aCA/IHRleHQxIDogdGV4dDI7XG4gIHZhciBzaG9ydHRleHQgPSB0ZXh0MS5sZW5ndGggPiB0ZXh0Mi5sZW5ndGggPyB0ZXh0MiA6IHRleHQxO1xuICB2YXIgaSA9IGxvbmd0ZXh0LmluZGV4T2Yoc2hvcnR0ZXh0KTtcbiAgaWYgKGkgIT0gLTEpIHtcbiAgICAvLyBTaG9ydGVyIHRleHQgaXMgaW5zaWRlIHRoZSBsb25nZXIgdGV4dCAoc3BlZWR1cCkuXG4gICAgZGlmZnMgPSBbW0RJRkZfSU5TRVJULCBsb25ndGV4dC5zdWJzdHJpbmcoMCwgaSldLFxuICAgICAgICAgICAgIFtESUZGX0VRVUFMLCBzaG9ydHRleHRdLFxuICAgICAgICAgICAgIFtESUZGX0lOU0VSVCwgbG9uZ3RleHQuc3Vic3RyaW5nKGkgKyBzaG9ydHRleHQubGVuZ3RoKV1dO1xuICAgIC8vIFN3YXAgaW5zZXJ0aW9ucyBmb3IgZGVsZXRpb25zIGlmIGRpZmYgaXMgcmV2ZXJzZWQuXG4gICAgaWYgKHRleHQxLmxlbmd0aCA+IHRleHQyLmxlbmd0aCkge1xuICAgICAgZGlmZnNbMF1bMF0gPSBkaWZmc1syXVswXSA9IERJRkZfREVMRVRFO1xuICAgIH1cbiAgICByZXR1cm4gZGlmZnM7XG4gIH1cblxuICBpZiAoc2hvcnR0ZXh0Lmxlbmd0aCA9PSAxKSB7XG4gICAgLy8gU2luZ2xlIGNoYXJhY3RlciBzdHJpbmcuXG4gICAgLy8gQWZ0ZXIgdGhlIHByZXZpb3VzIHNwZWVkdXAsIHRoZSBjaGFyYWN0ZXIgY2FuJ3QgYmUgYW4gZXF1YWxpdHkuXG4gICAgcmV0dXJuIFtbRElGRl9ERUxFVEUsIHRleHQxXSwgW0RJRkZfSU5TRVJULCB0ZXh0Ml1dO1xuICB9XG5cbiAgLy8gQ2hlY2sgdG8gc2VlIGlmIHRoZSBwcm9ibGVtIGNhbiBiZSBzcGxpdCBpbiB0d28uXG4gIHZhciBobSA9IHRoaXMuZGlmZl9oYWxmTWF0Y2hfKHRleHQxLCB0ZXh0Mik7XG4gIGlmIChobSkge1xuICAgIC8vIEEgaGFsZi1tYXRjaCB3YXMgZm91bmQsIHNvcnQgb3V0IHRoZSByZXR1cm4gZGF0YS5cbiAgICB2YXIgdGV4dDFfYSA9IGhtWzBdO1xuICAgIHZhciB0ZXh0MV9iID0gaG1bMV07XG4gICAgdmFyIHRleHQyX2EgPSBobVsyXTtcbiAgICB2YXIgdGV4dDJfYiA9IGhtWzNdO1xuICAgIHZhciBtaWRfY29tbW9uID0gaG1bNF07XG4gICAgLy8gU2VuZCBib3RoIHBhaXJzIG9mZiBmb3Igc2VwYXJhdGUgcHJvY2Vzc2luZy5cbiAgICB2YXIgZGlmZnNfYSA9IHRoaXMuZGlmZl9tYWluKHRleHQxX2EsIHRleHQyX2EsIGNoZWNrbGluZXMsIGRlYWRsaW5lKTtcbiAgICB2YXIgZGlmZnNfYiA9IHRoaXMuZGlmZl9tYWluKHRleHQxX2IsIHRleHQyX2IsIGNoZWNrbGluZXMsIGRlYWRsaW5lKTtcbiAgICAvLyBNZXJnZSB0aGUgcmVzdWx0cy5cbiAgICByZXR1cm4gZGlmZnNfYS5jb25jYXQoW1tESUZGX0VRVUFMLCBtaWRfY29tbW9uXV0sIGRpZmZzX2IpO1xuICB9XG5cbiAgaWYgKGNoZWNrbGluZXMgJiYgdGV4dDEubGVuZ3RoID4gMTAwICYmIHRleHQyLmxlbmd0aCA+IDEwMCkge1xuICAgIHJldHVybiB0aGlzLmRpZmZfbGluZU1vZGVfKHRleHQxLCB0ZXh0MiwgZGVhZGxpbmUpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZGlmZl9iaXNlY3RfKHRleHQxLCB0ZXh0MiwgZGVhZGxpbmUpO1xufTtcblxuXG4vKipcbiAqIERvIGEgcXVpY2sgbGluZS1sZXZlbCBkaWZmIG9uIGJvdGggc3RyaW5ncywgdGhlbiByZWRpZmYgdGhlIHBhcnRzIGZvclxuICogZ3JlYXRlciBhY2N1cmFjeS5cbiAqIFRoaXMgc3BlZWR1cCBjYW4gcHJvZHVjZSBub24tbWluaW1hbCBkaWZmcy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MSBPbGQgc3RyaW5nIHRvIGJlIGRpZmZlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MiBOZXcgc3RyaW5nIHRvIGJlIGRpZmZlZC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBkZWFkbGluZSBUaW1lIHdoZW4gdGhlIGRpZmYgc2hvdWxkIGJlIGNvbXBsZXRlIGJ5LlxuICogQHJldHVybiB7IUFycmF5LjwhZGlmZl9tYXRjaF9wYXRjaC5EaWZmPn0gQXJyYXkgb2YgZGlmZiB0dXBsZXMuXG4gKiBAcHJpdmF0ZVxuICovXG5kaWZmX21hdGNoX3BhdGNoLnByb3RvdHlwZS5kaWZmX2xpbmVNb2RlXyA9IGZ1bmN0aW9uKHRleHQxLCB0ZXh0MiwgZGVhZGxpbmUpIHtcbiAgLy8gU2NhbiB0aGUgdGV4dCBvbiBhIGxpbmUtYnktbGluZSBiYXNpcyBmaXJzdC5cbiAgdmFyIGEgPSB0aGlzLmRpZmZfbGluZXNUb0NoYXJzXyh0ZXh0MSwgdGV4dDIpO1xuICB0ZXh0MSA9IGEuY2hhcnMxO1xuICB0ZXh0MiA9IGEuY2hhcnMyO1xuICB2YXIgbGluZWFycmF5ID0gYS5saW5lQXJyYXk7XG5cbiAgdmFyIGRpZmZzID0gdGhpcy5kaWZmX21haW4odGV4dDEsIHRleHQyLCBmYWxzZSwgZGVhZGxpbmUpO1xuXG4gIC8vIENvbnZlcnQgdGhlIGRpZmYgYmFjayB0byBvcmlnaW5hbCB0ZXh0LlxuICB0aGlzLmRpZmZfY2hhcnNUb0xpbmVzXyhkaWZmcywgbGluZWFycmF5KTtcbiAgLy8gRWxpbWluYXRlIGZyZWFrIG1hdGNoZXMgKGUuZy4gYmxhbmsgbGluZXMpXG4gIHRoaXMuZGlmZl9jbGVhbnVwU2VtYW50aWMoZGlmZnMpO1xuXG4gIC8vIFJlZGlmZiBhbnkgcmVwbGFjZW1lbnQgYmxvY2tzLCB0aGlzIHRpbWUgY2hhcmFjdGVyLWJ5LWNoYXJhY3Rlci5cbiAgLy8gQWRkIGEgZHVtbXkgZW50cnkgYXQgdGhlIGVuZC5cbiAgZGlmZnMucHVzaChbRElGRl9FUVVBTCwgJyddKTtcbiAgdmFyIHBvaW50ZXIgPSAwO1xuICB2YXIgY291bnRfZGVsZXRlID0gMDtcbiAgdmFyIGNvdW50X2luc2VydCA9IDA7XG4gIHZhciB0ZXh0X2RlbGV0ZSA9ICcnO1xuICB2YXIgdGV4dF9pbnNlcnQgPSAnJztcbiAgd2hpbGUgKHBvaW50ZXIgPCBkaWZmcy5sZW5ndGgpIHtcbiAgICBzd2l0Y2ggKGRpZmZzW3BvaW50ZXJdWzBdKSB7XG4gICAgICBjYXNlIERJRkZfSU5TRVJUOlxuICAgICAgICBjb3VudF9pbnNlcnQrKztcbiAgICAgICAgdGV4dF9pbnNlcnQgKz0gZGlmZnNbcG9pbnRlcl1bMV07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBESUZGX0RFTEVURTpcbiAgICAgICAgY291bnRfZGVsZXRlKys7XG4gICAgICAgIHRleHRfZGVsZXRlICs9IGRpZmZzW3BvaW50ZXJdWzFdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRElGRl9FUVVBTDpcbiAgICAgICAgLy8gVXBvbiByZWFjaGluZyBhbiBlcXVhbGl0eSwgY2hlY2sgZm9yIHByaW9yIHJlZHVuZGFuY2llcy5cbiAgICAgICAgaWYgKGNvdW50X2RlbGV0ZSA+PSAxICYmIGNvdW50X2luc2VydCA+PSAxKSB7XG4gICAgICAgICAgLy8gRGVsZXRlIHRoZSBvZmZlbmRpbmcgcmVjb3JkcyBhbmQgYWRkIHRoZSBtZXJnZWQgb25lcy5cbiAgICAgICAgICBkaWZmcy5zcGxpY2UocG9pbnRlciAtIGNvdW50X2RlbGV0ZSAtIGNvdW50X2luc2VydCxcbiAgICAgICAgICAgICAgICAgICAgICAgY291bnRfZGVsZXRlICsgY291bnRfaW5zZXJ0KTtcbiAgICAgICAgICBwb2ludGVyID0gcG9pbnRlciAtIGNvdW50X2RlbGV0ZSAtIGNvdW50X2luc2VydDtcbiAgICAgICAgICB2YXIgYSA9IHRoaXMuZGlmZl9tYWluKHRleHRfZGVsZXRlLCB0ZXh0X2luc2VydCwgZmFsc2UsIGRlYWRsaW5lKTtcbiAgICAgICAgICBmb3IgKHZhciBqID0gYS5sZW5ndGggLSAxOyBqID49IDA7IGotLSkge1xuICAgICAgICAgICAgZGlmZnMuc3BsaWNlKHBvaW50ZXIsIDAsIGFbal0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwb2ludGVyID0gcG9pbnRlciArIGEubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGNvdW50X2luc2VydCA9IDA7XG4gICAgICAgIGNvdW50X2RlbGV0ZSA9IDA7XG4gICAgICAgIHRleHRfZGVsZXRlID0gJyc7XG4gICAgICAgIHRleHRfaW5zZXJ0ID0gJyc7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBwb2ludGVyKys7XG4gIH1cbiAgZGlmZnMucG9wKCk7ICAvLyBSZW1vdmUgdGhlIGR1bW15IGVudHJ5IGF0IHRoZSBlbmQuXG5cbiAgcmV0dXJuIGRpZmZzO1xufTtcblxuXG4vKipcbiAqIEZpbmQgdGhlICdtaWRkbGUgc25ha2UnIG9mIGEgZGlmZiwgc3BsaXQgdGhlIHByb2JsZW0gaW4gdHdvXG4gKiBhbmQgcmV0dXJuIHRoZSByZWN1cnNpdmVseSBjb25zdHJ1Y3RlZCBkaWZmLlxuICogU2VlIE15ZXJzIDE5ODYgcGFwZXI6IEFuIE8oTkQpIERpZmZlcmVuY2UgQWxnb3JpdGhtIGFuZCBJdHMgVmFyaWF0aW9ucy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MSBPbGQgc3RyaW5nIHRvIGJlIGRpZmZlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MiBOZXcgc3RyaW5nIHRvIGJlIGRpZmZlZC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBkZWFkbGluZSBUaW1lIGF0IHdoaWNoIHRvIGJhaWwgaWYgbm90IHlldCBjb21wbGV0ZS5cbiAqIEByZXR1cm4geyFBcnJheS48IWRpZmZfbWF0Y2hfcGF0Y2guRGlmZj59IEFycmF5IG9mIGRpZmYgdHVwbGVzLlxuICogQHByaXZhdGVcbiAqL1xuZGlmZl9tYXRjaF9wYXRjaC5wcm90b3R5cGUuZGlmZl9iaXNlY3RfID0gZnVuY3Rpb24odGV4dDEsIHRleHQyLCBkZWFkbGluZSkge1xuICAvLyBDYWNoZSB0aGUgdGV4dCBsZW5ndGhzIHRvIHByZXZlbnQgbXVsdGlwbGUgY2FsbHMuXG4gIHZhciB0ZXh0MV9sZW5ndGggPSB0ZXh0MS5sZW5ndGg7XG4gIHZhciB0ZXh0Ml9sZW5ndGggPSB0ZXh0Mi5sZW5ndGg7XG4gIHZhciBtYXhfZCA9IE1hdGguY2VpbCgodGV4dDFfbGVuZ3RoICsgdGV4dDJfbGVuZ3RoKSAvIDIpO1xuICB2YXIgdl9vZmZzZXQgPSBtYXhfZDtcbiAgdmFyIHZfbGVuZ3RoID0gMiAqIG1heF9kO1xuICB2YXIgdjEgPSBuZXcgQXJyYXkodl9sZW5ndGgpO1xuICB2YXIgdjIgPSBuZXcgQXJyYXkodl9sZW5ndGgpO1xuICAvLyBTZXR0aW5nIGFsbCBlbGVtZW50cyB0byAtMSBpcyBmYXN0ZXIgaW4gQ2hyb21lICYgRmlyZWZveCB0aGFuIG1peGluZ1xuICAvLyBpbnRlZ2VycyBhbmQgdW5kZWZpbmVkLlxuICBmb3IgKHZhciB4ID0gMDsgeCA8IHZfbGVuZ3RoOyB4KyspIHtcbiAgICB2MVt4XSA9IC0xO1xuICAgIHYyW3hdID0gLTE7XG4gIH1cbiAgdjFbdl9vZmZzZXQgKyAxXSA9IDA7XG4gIHYyW3Zfb2Zmc2V0ICsgMV0gPSAwO1xuICB2YXIgZGVsdGEgPSB0ZXh0MV9sZW5ndGggLSB0ZXh0Ml9sZW5ndGg7XG4gIC8vIElmIHRoZSB0b3RhbCBudW1iZXIgb2YgY2hhcmFjdGVycyBpcyBvZGQsIHRoZW4gdGhlIGZyb250IHBhdGggd2lsbCBjb2xsaWRlXG4gIC8vIHdpdGggdGhlIHJldmVyc2UgcGF0aC5cbiAgdmFyIGZyb250ID0gKGRlbHRhICUgMiAhPSAwKTtcbiAgLy8gT2Zmc2V0cyBmb3Igc3RhcnQgYW5kIGVuZCBvZiBrIGxvb3AuXG4gIC8vIFByZXZlbnRzIG1hcHBpbmcgb2Ygc3BhY2UgYmV5b25kIHRoZSBncmlkLlxuICB2YXIgazFzdGFydCA9IDA7XG4gIHZhciBrMWVuZCA9IDA7XG4gIHZhciBrMnN0YXJ0ID0gMDtcbiAgdmFyIGsyZW5kID0gMDtcbiAgZm9yICh2YXIgZCA9IDA7IGQgPCBtYXhfZDsgZCsrKSB7XG4gICAgLy8gQmFpbCBvdXQgaWYgZGVhZGxpbmUgaXMgcmVhY2hlZC5cbiAgICBpZiAoKG5ldyBEYXRlKCkpLmdldFRpbWUoKSA+IGRlYWRsaW5lKSB7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBXYWxrIHRoZSBmcm9udCBwYXRoIG9uZSBzdGVwLlxuICAgIGZvciAodmFyIGsxID0gLWQgKyBrMXN0YXJ0OyBrMSA8PSBkIC0gazFlbmQ7IGsxICs9IDIpIHtcbiAgICAgIHZhciBrMV9vZmZzZXQgPSB2X29mZnNldCArIGsxO1xuICAgICAgdmFyIHgxO1xuICAgICAgaWYgKGsxID09IC1kIHx8IChrMSAhPSBkICYmIHYxW2sxX29mZnNldCAtIDFdIDwgdjFbazFfb2Zmc2V0ICsgMV0pKSB7XG4gICAgICAgIHgxID0gdjFbazFfb2Zmc2V0ICsgMV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB4MSA9IHYxW2sxX29mZnNldCAtIDFdICsgMTtcbiAgICAgIH1cbiAgICAgIHZhciB5MSA9IHgxIC0gazE7XG4gICAgICB3aGlsZSAoeDEgPCB0ZXh0MV9sZW5ndGggJiYgeTEgPCB0ZXh0Ml9sZW5ndGggJiZcbiAgICAgICAgICAgICB0ZXh0MS5jaGFyQXQoeDEpID09IHRleHQyLmNoYXJBdCh5MSkpIHtcbiAgICAgICAgeDErKztcbiAgICAgICAgeTErKztcbiAgICAgIH1cbiAgICAgIHYxW2sxX29mZnNldF0gPSB4MTtcbiAgICAgIGlmICh4MSA+IHRleHQxX2xlbmd0aCkge1xuICAgICAgICAvLyBSYW4gb2ZmIHRoZSByaWdodCBvZiB0aGUgZ3JhcGguXG4gICAgICAgIGsxZW5kICs9IDI7XG4gICAgICB9IGVsc2UgaWYgKHkxID4gdGV4dDJfbGVuZ3RoKSB7XG4gICAgICAgIC8vIFJhbiBvZmYgdGhlIGJvdHRvbSBvZiB0aGUgZ3JhcGguXG4gICAgICAgIGsxc3RhcnQgKz0gMjtcbiAgICAgIH0gZWxzZSBpZiAoZnJvbnQpIHtcbiAgICAgICAgdmFyIGsyX29mZnNldCA9IHZfb2Zmc2V0ICsgZGVsdGEgLSBrMTtcbiAgICAgICAgaWYgKGsyX29mZnNldCA+PSAwICYmIGsyX29mZnNldCA8IHZfbGVuZ3RoICYmIHYyW2syX29mZnNldF0gIT0gLTEpIHtcbiAgICAgICAgICAvLyBNaXJyb3IgeDIgb250byB0b3AtbGVmdCBjb29yZGluYXRlIHN5c3RlbS5cbiAgICAgICAgICB2YXIgeDIgPSB0ZXh0MV9sZW5ndGggLSB2MltrMl9vZmZzZXRdO1xuICAgICAgICAgIGlmICh4MSA+PSB4Mikge1xuICAgICAgICAgICAgLy8gT3ZlcmxhcCBkZXRlY3RlZC5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpZmZfYmlzZWN0U3BsaXRfKHRleHQxLCB0ZXh0MiwgeDEsIHkxLCBkZWFkbGluZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gV2FsayB0aGUgcmV2ZXJzZSBwYXRoIG9uZSBzdGVwLlxuICAgIGZvciAodmFyIGsyID0gLWQgKyBrMnN0YXJ0OyBrMiA8PSBkIC0gazJlbmQ7IGsyICs9IDIpIHtcbiAgICAgIHZhciBrMl9vZmZzZXQgPSB2X29mZnNldCArIGsyO1xuICAgICAgdmFyIHgyO1xuICAgICAgaWYgKGsyID09IC1kIHx8IChrMiAhPSBkICYmIHYyW2syX29mZnNldCAtIDFdIDwgdjJbazJfb2Zmc2V0ICsgMV0pKSB7XG4gICAgICAgIHgyID0gdjJbazJfb2Zmc2V0ICsgMV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB4MiA9IHYyW2syX29mZnNldCAtIDFdICsgMTtcbiAgICAgIH1cbiAgICAgIHZhciB5MiA9IHgyIC0gazI7XG4gICAgICB3aGlsZSAoeDIgPCB0ZXh0MV9sZW5ndGggJiYgeTIgPCB0ZXh0Ml9sZW5ndGggJiZcbiAgICAgICAgICAgICB0ZXh0MS5jaGFyQXQodGV4dDFfbGVuZ3RoIC0geDIgLSAxKSA9PVxuICAgICAgICAgICAgIHRleHQyLmNoYXJBdCh0ZXh0Ml9sZW5ndGggLSB5MiAtIDEpKSB7XG4gICAgICAgIHgyKys7XG4gICAgICAgIHkyKys7XG4gICAgICB9XG4gICAgICB2MltrMl9vZmZzZXRdID0geDI7XG4gICAgICBpZiAoeDIgPiB0ZXh0MV9sZW5ndGgpIHtcbiAgICAgICAgLy8gUmFuIG9mZiB0aGUgbGVmdCBvZiB0aGUgZ3JhcGguXG4gICAgICAgIGsyZW5kICs9IDI7XG4gICAgICB9IGVsc2UgaWYgKHkyID4gdGV4dDJfbGVuZ3RoKSB7XG4gICAgICAgIC8vIFJhbiBvZmYgdGhlIHRvcCBvZiB0aGUgZ3JhcGguXG4gICAgICAgIGsyc3RhcnQgKz0gMjtcbiAgICAgIH0gZWxzZSBpZiAoIWZyb250KSB7XG4gICAgICAgIHZhciBrMV9vZmZzZXQgPSB2X29mZnNldCArIGRlbHRhIC0gazI7XG4gICAgICAgIGlmIChrMV9vZmZzZXQgPj0gMCAmJiBrMV9vZmZzZXQgPCB2X2xlbmd0aCAmJiB2MVtrMV9vZmZzZXRdICE9IC0xKSB7XG4gICAgICAgICAgdmFyIHgxID0gdjFbazFfb2Zmc2V0XTtcbiAgICAgICAgICB2YXIgeTEgPSB2X29mZnNldCArIHgxIC0gazFfb2Zmc2V0O1xuICAgICAgICAgIC8vIE1pcnJvciB4MiBvbnRvIHRvcC1sZWZ0IGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgICAgICAgIHgyID0gdGV4dDFfbGVuZ3RoIC0geDI7XG4gICAgICAgICAgaWYgKHgxID49IHgyKSB7XG4gICAgICAgICAgICAvLyBPdmVybGFwIGRldGVjdGVkLlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGlmZl9iaXNlY3RTcGxpdF8odGV4dDEsIHRleHQyLCB4MSwgeTEsIGRlYWRsaW5lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy8gRGlmZiB0b29rIHRvbyBsb25nIGFuZCBoaXQgdGhlIGRlYWRsaW5lIG9yXG4gIC8vIG51bWJlciBvZiBkaWZmcyBlcXVhbHMgbnVtYmVyIG9mIGNoYXJhY3RlcnMsIG5vIGNvbW1vbmFsaXR5IGF0IGFsbC5cbiAgcmV0dXJuIFtbRElGRl9ERUxFVEUsIHRleHQxXSwgW0RJRkZfSU5TRVJULCB0ZXh0Ml1dO1xufTtcblxuXG4vKipcbiAqIEdpdmVuIHRoZSBsb2NhdGlvbiBvZiB0aGUgJ21pZGRsZSBzbmFrZScsIHNwbGl0IHRoZSBkaWZmIGluIHR3byBwYXJ0c1xuICogYW5kIHJlY3Vyc2UuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dDEgT2xkIHN0cmluZyB0byBiZSBkaWZmZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dDIgTmV3IHN0cmluZyB0byBiZSBkaWZmZWQuXG4gKiBAcGFyYW0ge251bWJlcn0geCBJbmRleCBvZiBzcGxpdCBwb2ludCBpbiB0ZXh0MS5cbiAqIEBwYXJhbSB7bnVtYmVyfSB5IEluZGV4IG9mIHNwbGl0IHBvaW50IGluIHRleHQyLlxuICogQHBhcmFtIHtudW1iZXJ9IGRlYWRsaW5lIFRpbWUgYXQgd2hpY2ggdG8gYmFpbCBpZiBub3QgeWV0IGNvbXBsZXRlLlxuICogQHJldHVybiB7IUFycmF5LjwhZGlmZl9tYXRjaF9wYXRjaC5EaWZmPn0gQXJyYXkgb2YgZGlmZiB0dXBsZXMuXG4gKiBAcHJpdmF0ZVxuICovXG5kaWZmX21hdGNoX3BhdGNoLnByb3RvdHlwZS5kaWZmX2Jpc2VjdFNwbGl0XyA9IGZ1bmN0aW9uKHRleHQxLCB0ZXh0MiwgeCwgeSxcbiAgICBkZWFkbGluZSkge1xuICB2YXIgdGV4dDFhID0gdGV4dDEuc3Vic3RyaW5nKDAsIHgpO1xuICB2YXIgdGV4dDJhID0gdGV4dDIuc3Vic3RyaW5nKDAsIHkpO1xuICB2YXIgdGV4dDFiID0gdGV4dDEuc3Vic3RyaW5nKHgpO1xuICB2YXIgdGV4dDJiID0gdGV4dDIuc3Vic3RyaW5nKHkpO1xuXG4gIC8vIENvbXB1dGUgYm90aCBkaWZmcyBzZXJpYWxseS5cbiAgdmFyIGRpZmZzID0gdGhpcy5kaWZmX21haW4odGV4dDFhLCB0ZXh0MmEsIGZhbHNlLCBkZWFkbGluZSk7XG4gIHZhciBkaWZmc2IgPSB0aGlzLmRpZmZfbWFpbih0ZXh0MWIsIHRleHQyYiwgZmFsc2UsIGRlYWRsaW5lKTtcblxuICByZXR1cm4gZGlmZnMuY29uY2F0KGRpZmZzYik7XG59O1xuXG5cbi8qKlxuICogU3BsaXQgdHdvIHRleHRzIGludG8gYW4gYXJyYXkgb2Ygc3RyaW5ncy4gIFJlZHVjZSB0aGUgdGV4dHMgdG8gYSBzdHJpbmcgb2ZcbiAqIGhhc2hlcyB3aGVyZSBlYWNoIFVuaWNvZGUgY2hhcmFjdGVyIHJlcHJlc2VudHMgb25lIGxpbmUuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dDEgRmlyc3Qgc3RyaW5nLlxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQyIFNlY29uZCBzdHJpbmcuXG4gKiBAcmV0dXJuIHt7Y2hhcnMxOiBzdHJpbmcsIGNoYXJzMjogc3RyaW5nLCBsaW5lQXJyYXk6ICFBcnJheS48c3RyaW5nPn19XG4gKiAgICAgQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGVuY29kZWQgdGV4dDEsIHRoZSBlbmNvZGVkIHRleHQyIGFuZFxuICogICAgIHRoZSBhcnJheSBvZiB1bmlxdWUgc3RyaW5ncy5cbiAqICAgICBUaGUgemVyb3RoIGVsZW1lbnQgb2YgdGhlIGFycmF5IG9mIHVuaXF1ZSBzdHJpbmdzIGlzIGludGVudGlvbmFsbHkgYmxhbmsuXG4gKiBAcHJpdmF0ZVxuICovXG5kaWZmX21hdGNoX3BhdGNoLnByb3RvdHlwZS5kaWZmX2xpbmVzVG9DaGFyc18gPSBmdW5jdGlvbih0ZXh0MSwgdGV4dDIpIHtcbiAgdmFyIGxpbmVBcnJheSA9IFtdOyAgLy8gZS5nLiBsaW5lQXJyYXlbNF0gPT0gJ0hlbGxvXFxuJ1xuICB2YXIgbGluZUhhc2ggPSB7fTsgICAvLyBlLmcuIGxpbmVIYXNoWydIZWxsb1xcbiddID09IDRcblxuICAvLyAnXFx4MDAnIGlzIGEgdmFsaWQgY2hhcmFjdGVyLCBidXQgdmFyaW91cyBkZWJ1Z2dlcnMgZG9uJ3QgbGlrZSBpdC5cbiAgLy8gU28gd2UnbGwgaW5zZXJ0IGEganVuayBlbnRyeSB0byBhdm9pZCBnZW5lcmF0aW5nIGEgbnVsbCBjaGFyYWN0ZXIuXG4gIGxpbmVBcnJheVswXSA9ICcnO1xuXG4gIC8qKlxuICAgKiBTcGxpdCBhIHRleHQgaW50byBhbiBhcnJheSBvZiBzdHJpbmdzLiAgUmVkdWNlIHRoZSB0ZXh0cyB0byBhIHN0cmluZyBvZlxuICAgKiBoYXNoZXMgd2hlcmUgZWFjaCBVbmljb2RlIGNoYXJhY3RlciByZXByZXNlbnRzIG9uZSBsaW5lLlxuICAgKiBNb2RpZmllcyBsaW5lYXJyYXkgYW5kIGxpbmVoYXNoIHRocm91Z2ggYmVpbmcgYSBjbG9zdXJlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCBTdHJpbmcgdG8gZW5jb2RlLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IEVuY29kZWQgc3RyaW5nLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gZGlmZl9saW5lc1RvQ2hhcnNNdW5nZV8odGV4dCkge1xuICAgIHZhciBjaGFycyA9ICcnO1xuICAgIC8vIFdhbGsgdGhlIHRleHQsIHB1bGxpbmcgb3V0IGEgc3Vic3RyaW5nIGZvciBlYWNoIGxpbmUuXG4gICAgLy8gdGV4dC5zcGxpdCgnXFxuJykgd291bGQgd291bGQgdGVtcG9yYXJpbHkgZG91YmxlIG91ciBtZW1vcnkgZm9vdHByaW50LlxuICAgIC8vIE1vZGlmeWluZyB0ZXh0IHdvdWxkIGNyZWF0ZSBtYW55IGxhcmdlIHN0cmluZ3MgdG8gZ2FyYmFnZSBjb2xsZWN0LlxuICAgIHZhciBsaW5lU3RhcnQgPSAwO1xuICAgIHZhciBsaW5lRW5kID0gLTE7XG4gICAgLy8gS2VlcGluZyBvdXIgb3duIGxlbmd0aCB2YXJpYWJsZSBpcyBmYXN0ZXIgdGhhbiBsb29raW5nIGl0IHVwLlxuICAgIHZhciBsaW5lQXJyYXlMZW5ndGggPSBsaW5lQXJyYXkubGVuZ3RoO1xuICAgIHdoaWxlIChsaW5lRW5kIDwgdGV4dC5sZW5ndGggLSAxKSB7XG4gICAgICBsaW5lRW5kID0gdGV4dC5pbmRleE9mKCdcXG4nLCBsaW5lU3RhcnQpO1xuICAgICAgaWYgKGxpbmVFbmQgPT0gLTEpIHtcbiAgICAgICAgbGluZUVuZCA9IHRleHQubGVuZ3RoIC0gMTtcbiAgICAgIH1cbiAgICAgIHZhciBsaW5lID0gdGV4dC5zdWJzdHJpbmcobGluZVN0YXJ0LCBsaW5lRW5kICsgMSk7XG4gICAgICBsaW5lU3RhcnQgPSBsaW5lRW5kICsgMTtcblxuICAgICAgaWYgKGxpbmVIYXNoLmhhc093blByb3BlcnR5ID8gbGluZUhhc2guaGFzT3duUHJvcGVydHkobGluZSkgOlxuICAgICAgICAgIChsaW5lSGFzaFtsaW5lXSAhPT0gdW5kZWZpbmVkKSkge1xuICAgICAgICBjaGFycyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGxpbmVIYXNoW2xpbmVdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNoYXJzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUobGluZUFycmF5TGVuZ3RoKTtcbiAgICAgICAgbGluZUhhc2hbbGluZV0gPSBsaW5lQXJyYXlMZW5ndGg7XG4gICAgICAgIGxpbmVBcnJheVtsaW5lQXJyYXlMZW5ndGgrK10gPSBsaW5lO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2hhcnM7XG4gIH1cblxuICB2YXIgY2hhcnMxID0gZGlmZl9saW5lc1RvQ2hhcnNNdW5nZV8odGV4dDEpO1xuICB2YXIgY2hhcnMyID0gZGlmZl9saW5lc1RvQ2hhcnNNdW5nZV8odGV4dDIpO1xuICByZXR1cm4ge2NoYXJzMTogY2hhcnMxLCBjaGFyczI6IGNoYXJzMiwgbGluZUFycmF5OiBsaW5lQXJyYXl9O1xufTtcblxuXG4vKipcbiAqIFJlaHlkcmF0ZSB0aGUgdGV4dCBpbiBhIGRpZmYgZnJvbSBhIHN0cmluZyBvZiBsaW5lIGhhc2hlcyB0byByZWFsIGxpbmVzIG9mXG4gKiB0ZXh0LlxuICogQHBhcmFtIHshQXJyYXkuPCFkaWZmX21hdGNoX3BhdGNoLkRpZmY+fSBkaWZmcyBBcnJheSBvZiBkaWZmIHR1cGxlcy5cbiAqIEBwYXJhbSB7IUFycmF5LjxzdHJpbmc+fSBsaW5lQXJyYXkgQXJyYXkgb2YgdW5pcXVlIHN0cmluZ3MuXG4gKiBAcHJpdmF0ZVxuICovXG5kaWZmX21hdGNoX3BhdGNoLnByb3RvdHlwZS5kaWZmX2NoYXJzVG9MaW5lc18gPSBmdW5jdGlvbihkaWZmcywgbGluZUFycmF5KSB7XG4gIGZvciAodmFyIHggPSAwOyB4IDwgZGlmZnMubGVuZ3RoOyB4KyspIHtcbiAgICB2YXIgY2hhcnMgPSBkaWZmc1t4XVsxXTtcbiAgICB2YXIgdGV4dCA9IFtdO1xuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgY2hhcnMubGVuZ3RoOyB5KyspIHtcbiAgICAgIHRleHRbeV0gPSBsaW5lQXJyYXlbY2hhcnMuY2hhckNvZGVBdCh5KV07XG4gICAgfVxuICAgIGRpZmZzW3hdWzFdID0gdGV4dC5qb2luKCcnKTtcbiAgfVxufTtcblxuXG4vKipcbiAqIERldGVybWluZSB0aGUgY29tbW9uIHByZWZpeCBvZiB0d28gc3RyaW5ncy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MSBGaXJzdCBzdHJpbmcuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dDIgU2Vjb25kIHN0cmluZy5cbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIGNvbW1vbiB0byB0aGUgc3RhcnQgb2YgZWFjaFxuICogICAgIHN0cmluZy5cbiAqL1xuZGlmZl9tYXRjaF9wYXRjaC5wcm90b3R5cGUuZGlmZl9jb21tb25QcmVmaXggPSBmdW5jdGlvbih0ZXh0MSwgdGV4dDIpIHtcbiAgLy8gUXVpY2sgY2hlY2sgZm9yIGNvbW1vbiBudWxsIGNhc2VzLlxuICBpZiAoIXRleHQxIHx8ICF0ZXh0MiB8fCB0ZXh0MS5jaGFyQXQoMCkgIT0gdGV4dDIuY2hhckF0KDApKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbiAgLy8gQmluYXJ5IHNlYXJjaC5cbiAgLy8gUGVyZm9ybWFuY2UgYW5hbHlzaXM6IGh0dHA6Ly9uZWlsLmZyYXNlci5uYW1lL25ld3MvMjAwNy8xMC8wOS9cbiAgdmFyIHBvaW50ZXJtaW4gPSAwO1xuICB2YXIgcG9pbnRlcm1heCA9IE1hdGgubWluKHRleHQxLmxlbmd0aCwgdGV4dDIubGVuZ3RoKTtcbiAgdmFyIHBvaW50ZXJtaWQgPSBwb2ludGVybWF4O1xuICB2YXIgcG9pbnRlcnN0YXJ0ID0gMDtcbiAgd2hpbGUgKHBvaW50ZXJtaW4gPCBwb2ludGVybWlkKSB7XG4gICAgaWYgKHRleHQxLnN1YnN0cmluZyhwb2ludGVyc3RhcnQsIHBvaW50ZXJtaWQpID09XG4gICAgICAgIHRleHQyLnN1YnN0cmluZyhwb2ludGVyc3RhcnQsIHBvaW50ZXJtaWQpKSB7XG4gICAgICBwb2ludGVybWluID0gcG9pbnRlcm1pZDtcbiAgICAgIHBvaW50ZXJzdGFydCA9IHBvaW50ZXJtaW47XG4gICAgfSBlbHNlIHtcbiAgICAgIHBvaW50ZXJtYXggPSBwb2ludGVybWlkO1xuICAgIH1cbiAgICBwb2ludGVybWlkID0gTWF0aC5mbG9vcigocG9pbnRlcm1heCAtIHBvaW50ZXJtaW4pIC8gMiArIHBvaW50ZXJtaW4pO1xuICB9XG4gIHJldHVybiBwb2ludGVybWlkO1xufTtcblxuXG4vKipcbiAqIERldGVybWluZSB0aGUgY29tbW9uIHN1ZmZpeCBvZiB0d28gc3RyaW5ncy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MSBGaXJzdCBzdHJpbmcuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dDIgU2Vjb25kIHN0cmluZy5cbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIGNvbW1vbiB0byB0aGUgZW5kIG9mIGVhY2ggc3RyaW5nLlxuICovXG5kaWZmX21hdGNoX3BhdGNoLnByb3RvdHlwZS5kaWZmX2NvbW1vblN1ZmZpeCA9IGZ1bmN0aW9uKHRleHQxLCB0ZXh0Mikge1xuICAvLyBRdWljayBjaGVjayBmb3IgY29tbW9uIG51bGwgY2FzZXMuXG4gIGlmICghdGV4dDEgfHwgIXRleHQyIHx8XG4gICAgICB0ZXh0MS5jaGFyQXQodGV4dDEubGVuZ3RoIC0gMSkgIT0gdGV4dDIuY2hhckF0KHRleHQyLmxlbmd0aCAtIDEpKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbiAgLy8gQmluYXJ5IHNlYXJjaC5cbiAgLy8gUGVyZm9ybWFuY2UgYW5hbHlzaXM6IGh0dHA6Ly9uZWlsLmZyYXNlci5uYW1lL25ld3MvMjAwNy8xMC8wOS9cbiAgdmFyIHBvaW50ZXJtaW4gPSAwO1xuICB2YXIgcG9pbnRlcm1heCA9IE1hdGgubWluKHRleHQxLmxlbmd0aCwgdGV4dDIubGVuZ3RoKTtcbiAgdmFyIHBvaW50ZXJtaWQgPSBwb2ludGVybWF4O1xuICB2YXIgcG9pbnRlcmVuZCA9IDA7XG4gIHdoaWxlIChwb2ludGVybWluIDwgcG9pbnRlcm1pZCkge1xuICAgIGlmICh0ZXh0MS5zdWJzdHJpbmcodGV4dDEubGVuZ3RoIC0gcG9pbnRlcm1pZCwgdGV4dDEubGVuZ3RoIC0gcG9pbnRlcmVuZCkgPT1cbiAgICAgICAgdGV4dDIuc3Vic3RyaW5nKHRleHQyLmxlbmd0aCAtIHBvaW50ZXJtaWQsIHRleHQyLmxlbmd0aCAtIHBvaW50ZXJlbmQpKSB7XG4gICAgICBwb2ludGVybWluID0gcG9pbnRlcm1pZDtcbiAgICAgIHBvaW50ZXJlbmQgPSBwb2ludGVybWluO1xuICAgIH0gZWxzZSB7XG4gICAgICBwb2ludGVybWF4ID0gcG9pbnRlcm1pZDtcbiAgICB9XG4gICAgcG9pbnRlcm1pZCA9IE1hdGguZmxvb3IoKHBvaW50ZXJtYXggLSBwb2ludGVybWluKSAvIDIgKyBwb2ludGVybWluKTtcbiAgfVxuICByZXR1cm4gcG9pbnRlcm1pZDtcbn07XG5cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgdGhlIHN1ZmZpeCBvZiBvbmUgc3RyaW5nIGlzIHRoZSBwcmVmaXggb2YgYW5vdGhlci5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MSBGaXJzdCBzdHJpbmcuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dDIgU2Vjb25kIHN0cmluZy5cbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIGNvbW1vbiB0byB0aGUgZW5kIG9mIHRoZSBmaXJzdFxuICogICAgIHN0cmluZyBhbmQgdGhlIHN0YXJ0IG9mIHRoZSBzZWNvbmQgc3RyaW5nLlxuICogQHByaXZhdGVcbiAqL1xuZGlmZl9tYXRjaF9wYXRjaC5wcm90b3R5cGUuZGlmZl9jb21tb25PdmVybGFwXyA9IGZ1bmN0aW9uKHRleHQxLCB0ZXh0Mikge1xuICAvLyBDYWNoZSB0aGUgdGV4dCBsZW5ndGhzIHRvIHByZXZlbnQgbXVsdGlwbGUgY2FsbHMuXG4gIHZhciB0ZXh0MV9sZW5ndGggPSB0ZXh0MS5sZW5ndGg7XG4gIHZhciB0ZXh0Ml9sZW5ndGggPSB0ZXh0Mi5sZW5ndGg7XG4gIC8vIEVsaW1pbmF0ZSB0aGUgbnVsbCBjYXNlLlxuICBpZiAodGV4dDFfbGVuZ3RoID09IDAgfHwgdGV4dDJfbGVuZ3RoID09IDApIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuICAvLyBUcnVuY2F0ZSB0aGUgbG9uZ2VyIHN0cmluZy5cbiAgaWYgKHRleHQxX2xlbmd0aCA+IHRleHQyX2xlbmd0aCkge1xuICAgIHRleHQxID0gdGV4dDEuc3Vic3RyaW5nKHRleHQxX2xlbmd0aCAtIHRleHQyX2xlbmd0aCk7XG4gIH0gZWxzZSBpZiAodGV4dDFfbGVuZ3RoIDwgdGV4dDJfbGVuZ3RoKSB7XG4gICAgdGV4dDIgPSB0ZXh0Mi5zdWJzdHJpbmcoMCwgdGV4dDFfbGVuZ3RoKTtcbiAgfVxuICB2YXIgdGV4dF9sZW5ndGggPSBNYXRoLm1pbih0ZXh0MV9sZW5ndGgsIHRleHQyX2xlbmd0aCk7XG4gIC8vIFF1aWNrIGNoZWNrIGZvciB0aGUgd29yc3QgY2FzZS5cbiAgaWYgKHRleHQxID09IHRleHQyKSB7XG4gICAgcmV0dXJuIHRleHRfbGVuZ3RoO1xuICB9XG5cbiAgLy8gU3RhcnQgYnkgbG9va2luZyBmb3IgYSBzaW5nbGUgY2hhcmFjdGVyIG1hdGNoXG4gIC8vIGFuZCBpbmNyZWFzZSBsZW5ndGggdW50aWwgbm8gbWF0Y2ggaXMgZm91bmQuXG4gIC8vIFBlcmZvcm1hbmNlIGFuYWx5c2lzOiBodHRwOi8vbmVpbC5mcmFzZXIubmFtZS9uZXdzLzIwMTAvMTEvMDQvXG4gIHZhciBiZXN0ID0gMDtcbiAgdmFyIGxlbmd0aCA9IDE7XG4gIHdoaWxlICh0cnVlKSB7XG4gICAgdmFyIHBhdHRlcm4gPSB0ZXh0MS5zdWJzdHJpbmcodGV4dF9sZW5ndGggLSBsZW5ndGgpO1xuICAgIHZhciBmb3VuZCA9IHRleHQyLmluZGV4T2YocGF0dGVybik7XG4gICAgaWYgKGZvdW5kID09IC0xKSB7XG4gICAgICByZXR1cm4gYmVzdDtcbiAgICB9XG4gICAgbGVuZ3RoICs9IGZvdW5kO1xuICAgIGlmIChmb3VuZCA9PSAwIHx8IHRleHQxLnN1YnN0cmluZyh0ZXh0X2xlbmd0aCAtIGxlbmd0aCkgPT1cbiAgICAgICAgdGV4dDIuc3Vic3RyaW5nKDAsIGxlbmd0aCkpIHtcbiAgICAgIGJlc3QgPSBsZW5ndGg7XG4gICAgICBsZW5ndGgrKztcbiAgICB9XG4gIH1cbn07XG5cblxuLyoqXG4gKiBEbyB0aGUgdHdvIHRleHRzIHNoYXJlIGEgc3Vic3RyaW5nIHdoaWNoIGlzIGF0IGxlYXN0IGhhbGYgdGhlIGxlbmd0aCBvZiB0aGVcbiAqIGxvbmdlciB0ZXh0P1xuICogVGhpcyBzcGVlZHVwIGNhbiBwcm9kdWNlIG5vbi1taW5pbWFsIGRpZmZzLlxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQxIEZpcnN0IHN0cmluZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MiBTZWNvbmQgc3RyaW5nLlxuICogQHJldHVybiB7QXJyYXkuPHN0cmluZz59IEZpdmUgZWxlbWVudCBBcnJheSwgY29udGFpbmluZyB0aGUgcHJlZml4IG9mXG4gKiAgICAgdGV4dDEsIHRoZSBzdWZmaXggb2YgdGV4dDEsIHRoZSBwcmVmaXggb2YgdGV4dDIsIHRoZSBzdWZmaXggb2ZcbiAqICAgICB0ZXh0MiBhbmQgdGhlIGNvbW1vbiBtaWRkbGUuICBPciBudWxsIGlmIHRoZXJlIHdhcyBubyBtYXRjaC5cbiAqIEBwcml2YXRlXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLmRpZmZfaGFsZk1hdGNoXyA9IGZ1bmN0aW9uKHRleHQxLCB0ZXh0Mikge1xuICBpZiAodGhpcy5EaWZmX1RpbWVvdXQgPD0gMCkge1xuICAgIC8vIERvbid0IHJpc2sgcmV0dXJuaW5nIGEgbm9uLW9wdGltYWwgZGlmZiBpZiB3ZSBoYXZlIHVubGltaXRlZCB0aW1lLlxuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZhciBsb25ndGV4dCA9IHRleHQxLmxlbmd0aCA+IHRleHQyLmxlbmd0aCA/IHRleHQxIDogdGV4dDI7XG4gIHZhciBzaG9ydHRleHQgPSB0ZXh0MS5sZW5ndGggPiB0ZXh0Mi5sZW5ndGggPyB0ZXh0MiA6IHRleHQxO1xuICBpZiAobG9uZ3RleHQubGVuZ3RoIDwgNCB8fCBzaG9ydHRleHQubGVuZ3RoICogMiA8IGxvbmd0ZXh0Lmxlbmd0aCkge1xuICAgIHJldHVybiBudWxsOyAgLy8gUG9pbnRsZXNzLlxuICB9XG4gIHZhciBkbXAgPSB0aGlzOyAgLy8gJ3RoaXMnIGJlY29tZXMgJ3dpbmRvdycgaW4gYSBjbG9zdXJlLlxuXG4gIC8qKlxuICAgKiBEb2VzIGEgc3Vic3RyaW5nIG9mIHNob3J0dGV4dCBleGlzdCB3aXRoaW4gbG9uZ3RleHQgc3VjaCB0aGF0IHRoZSBzdWJzdHJpbmdcbiAgICogaXMgYXQgbGVhc3QgaGFsZiB0aGUgbGVuZ3RoIG9mIGxvbmd0ZXh0P1xuICAgKiBDbG9zdXJlLCBidXQgZG9lcyBub3QgcmVmZXJlbmNlIGFueSBleHRlcm5hbCB2YXJpYWJsZXMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBsb25ndGV4dCBMb25nZXIgc3RyaW5nLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc2hvcnR0ZXh0IFNob3J0ZXIgc3RyaW5nLlxuICAgKiBAcGFyYW0ge251bWJlcn0gaSBTdGFydCBpbmRleCBvZiBxdWFydGVyIGxlbmd0aCBzdWJzdHJpbmcgd2l0aGluIGxvbmd0ZXh0LlxuICAgKiBAcmV0dXJuIHtBcnJheS48c3RyaW5nPn0gRml2ZSBlbGVtZW50IEFycmF5LCBjb250YWluaW5nIHRoZSBwcmVmaXggb2ZcbiAgICogICAgIGxvbmd0ZXh0LCB0aGUgc3VmZml4IG9mIGxvbmd0ZXh0LCB0aGUgcHJlZml4IG9mIHNob3J0dGV4dCwgdGhlIHN1ZmZpeFxuICAgKiAgICAgb2Ygc2hvcnR0ZXh0IGFuZCB0aGUgY29tbW9uIG1pZGRsZS4gIE9yIG51bGwgaWYgdGhlcmUgd2FzIG5vIG1hdGNoLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gZGlmZl9oYWxmTWF0Y2hJXyhsb25ndGV4dCwgc2hvcnR0ZXh0LCBpKSB7XG4gICAgLy8gU3RhcnQgd2l0aCBhIDEvNCBsZW5ndGggc3Vic3RyaW5nIGF0IHBvc2l0aW9uIGkgYXMgYSBzZWVkLlxuICAgIHZhciBzZWVkID0gbG9uZ3RleHQuc3Vic3RyaW5nKGksIGkgKyBNYXRoLmZsb29yKGxvbmd0ZXh0Lmxlbmd0aCAvIDQpKTtcbiAgICB2YXIgaiA9IC0xO1xuICAgIHZhciBiZXN0X2NvbW1vbiA9ICcnO1xuICAgIHZhciBiZXN0X2xvbmd0ZXh0X2EsIGJlc3RfbG9uZ3RleHRfYiwgYmVzdF9zaG9ydHRleHRfYSwgYmVzdF9zaG9ydHRleHRfYjtcbiAgICB3aGlsZSAoKGogPSBzaG9ydHRleHQuaW5kZXhPZihzZWVkLCBqICsgMSkpICE9IC0xKSB7XG4gICAgICB2YXIgcHJlZml4TGVuZ3RoID0gZG1wLmRpZmZfY29tbW9uUHJlZml4KGxvbmd0ZXh0LnN1YnN0cmluZyhpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvcnR0ZXh0LnN1YnN0cmluZyhqKSk7XG4gICAgICB2YXIgc3VmZml4TGVuZ3RoID0gZG1wLmRpZmZfY29tbW9uU3VmZml4KGxvbmd0ZXh0LnN1YnN0cmluZygwLCBpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvcnR0ZXh0LnN1YnN0cmluZygwLCBqKSk7XG4gICAgICBpZiAoYmVzdF9jb21tb24ubGVuZ3RoIDwgc3VmZml4TGVuZ3RoICsgcHJlZml4TGVuZ3RoKSB7XG4gICAgICAgIGJlc3RfY29tbW9uID0gc2hvcnR0ZXh0LnN1YnN0cmluZyhqIC0gc3VmZml4TGVuZ3RoLCBqKSArXG4gICAgICAgICAgICBzaG9ydHRleHQuc3Vic3RyaW5nKGosIGogKyBwcmVmaXhMZW5ndGgpO1xuICAgICAgICBiZXN0X2xvbmd0ZXh0X2EgPSBsb25ndGV4dC5zdWJzdHJpbmcoMCwgaSAtIHN1ZmZpeExlbmd0aCk7XG4gICAgICAgIGJlc3RfbG9uZ3RleHRfYiA9IGxvbmd0ZXh0LnN1YnN0cmluZyhpICsgcHJlZml4TGVuZ3RoKTtcbiAgICAgICAgYmVzdF9zaG9ydHRleHRfYSA9IHNob3J0dGV4dC5zdWJzdHJpbmcoMCwgaiAtIHN1ZmZpeExlbmd0aCk7XG4gICAgICAgIGJlc3Rfc2hvcnR0ZXh0X2IgPSBzaG9ydHRleHQuc3Vic3RyaW5nKGogKyBwcmVmaXhMZW5ndGgpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoYmVzdF9jb21tb24ubGVuZ3RoICogMiA+PSBsb25ndGV4dC5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBbYmVzdF9sb25ndGV4dF9hLCBiZXN0X2xvbmd0ZXh0X2IsXG4gICAgICAgICAgICAgIGJlc3Rfc2hvcnR0ZXh0X2EsIGJlc3Rfc2hvcnR0ZXh0X2IsIGJlc3RfY29tbW9uXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgLy8gRmlyc3QgY2hlY2sgaWYgdGhlIHNlY29uZCBxdWFydGVyIGlzIHRoZSBzZWVkIGZvciBhIGhhbGYtbWF0Y2guXG4gIHZhciBobTEgPSBkaWZmX2hhbGZNYXRjaElfKGxvbmd0ZXh0LCBzaG9ydHRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGguY2VpbChsb25ndGV4dC5sZW5ndGggLyA0KSk7XG4gIC8vIENoZWNrIGFnYWluIGJhc2VkIG9uIHRoZSB0aGlyZCBxdWFydGVyLlxuICB2YXIgaG0yID0gZGlmZl9oYWxmTWF0Y2hJXyhsb25ndGV4dCwgc2hvcnR0ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmNlaWwobG9uZ3RleHQubGVuZ3RoIC8gMikpO1xuICB2YXIgaG07XG4gIGlmICghaG0xICYmICFobTIpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfSBlbHNlIGlmICghaG0yKSB7XG4gICAgaG0gPSBobTE7XG4gIH0gZWxzZSBpZiAoIWhtMSkge1xuICAgIGhtID0gaG0yO1xuICB9IGVsc2Uge1xuICAgIC8vIEJvdGggbWF0Y2hlZC4gIFNlbGVjdCB0aGUgbG9uZ2VzdC5cbiAgICBobSA9IGhtMVs0XS5sZW5ndGggPiBobTJbNF0ubGVuZ3RoID8gaG0xIDogaG0yO1xuICB9XG5cbiAgLy8gQSBoYWxmLW1hdGNoIHdhcyBmb3VuZCwgc29ydCBvdXQgdGhlIHJldHVybiBkYXRhLlxuICB2YXIgdGV4dDFfYSwgdGV4dDFfYiwgdGV4dDJfYSwgdGV4dDJfYjtcbiAgaWYgKHRleHQxLmxlbmd0aCA+IHRleHQyLmxlbmd0aCkge1xuICAgIHRleHQxX2EgPSBobVswXTtcbiAgICB0ZXh0MV9iID0gaG1bMV07XG4gICAgdGV4dDJfYSA9IGhtWzJdO1xuICAgIHRleHQyX2IgPSBobVszXTtcbiAgfSBlbHNlIHtcbiAgICB0ZXh0Ml9hID0gaG1bMF07XG4gICAgdGV4dDJfYiA9IGhtWzFdO1xuICAgIHRleHQxX2EgPSBobVsyXTtcbiAgICB0ZXh0MV9iID0gaG1bM107XG4gIH1cbiAgdmFyIG1pZF9jb21tb24gPSBobVs0XTtcbiAgcmV0dXJuIFt0ZXh0MV9hLCB0ZXh0MV9iLCB0ZXh0Ml9hLCB0ZXh0Ml9iLCBtaWRfY29tbW9uXTtcbn07XG5cblxuLyoqXG4gKiBSZWR1Y2UgdGhlIG51bWJlciBvZiBlZGl0cyBieSBlbGltaW5hdGluZyBzZW1hbnRpY2FsbHkgdHJpdmlhbCBlcXVhbGl0aWVzLlxuICogQHBhcmFtIHshQXJyYXkuPCFkaWZmX21hdGNoX3BhdGNoLkRpZmY+fSBkaWZmcyBBcnJheSBvZiBkaWZmIHR1cGxlcy5cbiAqL1xuZGlmZl9tYXRjaF9wYXRjaC5wcm90b3R5cGUuZGlmZl9jbGVhbnVwU2VtYW50aWMgPSBmdW5jdGlvbihkaWZmcykge1xuICB2YXIgY2hhbmdlcyA9IGZhbHNlO1xuICB2YXIgZXF1YWxpdGllcyA9IFtdOyAgLy8gU3RhY2sgb2YgaW5kaWNlcyB3aGVyZSBlcXVhbGl0aWVzIGFyZSBmb3VuZC5cbiAgdmFyIGVxdWFsaXRpZXNMZW5ndGggPSAwOyAgLy8gS2VlcGluZyBvdXIgb3duIGxlbmd0aCB2YXIgaXMgZmFzdGVyIGluIEpTLlxuICAvKiogQHR5cGUgez9zdHJpbmd9ICovXG4gIHZhciBsYXN0ZXF1YWxpdHkgPSBudWxsO1xuICAvLyBBbHdheXMgZXF1YWwgdG8gZGlmZnNbZXF1YWxpdGllc1tlcXVhbGl0aWVzTGVuZ3RoIC0gMV1dWzFdXG4gIHZhciBwb2ludGVyID0gMDsgIC8vIEluZGV4IG9mIGN1cnJlbnQgcG9zaXRpb24uXG4gIC8vIE51bWJlciBvZiBjaGFyYWN0ZXJzIHRoYXQgY2hhbmdlZCBwcmlvciB0byB0aGUgZXF1YWxpdHkuXG4gIHZhciBsZW5ndGhfaW5zZXJ0aW9uczEgPSAwO1xuICB2YXIgbGVuZ3RoX2RlbGV0aW9uczEgPSAwO1xuICAvLyBOdW1iZXIgb2YgY2hhcmFjdGVycyB0aGF0IGNoYW5nZWQgYWZ0ZXIgdGhlIGVxdWFsaXR5LlxuICB2YXIgbGVuZ3RoX2luc2VydGlvbnMyID0gMDtcbiAgdmFyIGxlbmd0aF9kZWxldGlvbnMyID0gMDtcbiAgd2hpbGUgKHBvaW50ZXIgPCBkaWZmcy5sZW5ndGgpIHtcbiAgICBpZiAoZGlmZnNbcG9pbnRlcl1bMF0gPT0gRElGRl9FUVVBTCkgeyAgLy8gRXF1YWxpdHkgZm91bmQuXG4gICAgICBlcXVhbGl0aWVzW2VxdWFsaXRpZXNMZW5ndGgrK10gPSBwb2ludGVyO1xuICAgICAgbGVuZ3RoX2luc2VydGlvbnMxID0gbGVuZ3RoX2luc2VydGlvbnMyO1xuICAgICAgbGVuZ3RoX2RlbGV0aW9uczEgPSBsZW5ndGhfZGVsZXRpb25zMjtcbiAgICAgIGxlbmd0aF9pbnNlcnRpb25zMiA9IDA7XG4gICAgICBsZW5ndGhfZGVsZXRpb25zMiA9IDA7XG4gICAgICBsYXN0ZXF1YWxpdHkgPSBkaWZmc1twb2ludGVyXVsxXTtcbiAgICB9IGVsc2UgeyAgLy8gQW4gaW5zZXJ0aW9uIG9yIGRlbGV0aW9uLlxuICAgICAgaWYgKGRpZmZzW3BvaW50ZXJdWzBdID09IERJRkZfSU5TRVJUKSB7XG4gICAgICAgIGxlbmd0aF9pbnNlcnRpb25zMiArPSBkaWZmc1twb2ludGVyXVsxXS5sZW5ndGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZW5ndGhfZGVsZXRpb25zMiArPSBkaWZmc1twb2ludGVyXVsxXS5sZW5ndGg7XG4gICAgICB9XG4gICAgICAvLyBFbGltaW5hdGUgYW4gZXF1YWxpdHkgdGhhdCBpcyBzbWFsbGVyIG9yIGVxdWFsIHRvIHRoZSBlZGl0cyBvbiBib3RoXG4gICAgICAvLyBzaWRlcyBvZiBpdC5cbiAgICAgIGlmIChsYXN0ZXF1YWxpdHkgJiYgKGxhc3RlcXVhbGl0eS5sZW5ndGggPD1cbiAgICAgICAgICBNYXRoLm1heChsZW5ndGhfaW5zZXJ0aW9uczEsIGxlbmd0aF9kZWxldGlvbnMxKSkgJiZcbiAgICAgICAgICAobGFzdGVxdWFsaXR5Lmxlbmd0aCA8PSBNYXRoLm1heChsZW5ndGhfaW5zZXJ0aW9uczIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoX2RlbGV0aW9uczIpKSkge1xuICAgICAgICAvLyBEdXBsaWNhdGUgcmVjb3JkLlxuICAgICAgICBkaWZmcy5zcGxpY2UoZXF1YWxpdGllc1tlcXVhbGl0aWVzTGVuZ3RoIC0gMV0sIDAsXG4gICAgICAgICAgICAgICAgICAgICBbRElGRl9ERUxFVEUsIGxhc3RlcXVhbGl0eV0pO1xuICAgICAgICAvLyBDaGFuZ2Ugc2Vjb25kIGNvcHkgdG8gaW5zZXJ0LlxuICAgICAgICBkaWZmc1tlcXVhbGl0aWVzW2VxdWFsaXRpZXNMZW5ndGggLSAxXSArIDFdWzBdID0gRElGRl9JTlNFUlQ7XG4gICAgICAgIC8vIFRocm93IGF3YXkgdGhlIGVxdWFsaXR5IHdlIGp1c3QgZGVsZXRlZC5cbiAgICAgICAgZXF1YWxpdGllc0xlbmd0aC0tO1xuICAgICAgICAvLyBUaHJvdyBhd2F5IHRoZSBwcmV2aW91cyBlcXVhbGl0eSAoaXQgbmVlZHMgdG8gYmUgcmVldmFsdWF0ZWQpLlxuICAgICAgICBlcXVhbGl0aWVzTGVuZ3RoLS07XG4gICAgICAgIHBvaW50ZXIgPSBlcXVhbGl0aWVzTGVuZ3RoID4gMCA/IGVxdWFsaXRpZXNbZXF1YWxpdGllc0xlbmd0aCAtIDFdIDogLTE7XG4gICAgICAgIGxlbmd0aF9pbnNlcnRpb25zMSA9IDA7ICAvLyBSZXNldCB0aGUgY291bnRlcnMuXG4gICAgICAgIGxlbmd0aF9kZWxldGlvbnMxID0gMDtcbiAgICAgICAgbGVuZ3RoX2luc2VydGlvbnMyID0gMDtcbiAgICAgICAgbGVuZ3RoX2RlbGV0aW9uczIgPSAwO1xuICAgICAgICBsYXN0ZXF1YWxpdHkgPSBudWxsO1xuICAgICAgICBjaGFuZ2VzID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcG9pbnRlcisrO1xuICB9XG5cbiAgLy8gTm9ybWFsaXplIHRoZSBkaWZmLlxuICBpZiAoY2hhbmdlcykge1xuICAgIHRoaXMuZGlmZl9jbGVhbnVwTWVyZ2UoZGlmZnMpO1xuICB9XG4gIHRoaXMuZGlmZl9jbGVhbnVwU2VtYW50aWNMb3NzbGVzcyhkaWZmcyk7XG5cbiAgLy8gRmluZCBhbnkgb3ZlcmxhcHMgYmV0d2VlbiBkZWxldGlvbnMgYW5kIGluc2VydGlvbnMuXG4gIC8vIGUuZzogPGRlbD5hYmN4eHg8L2RlbD48aW5zPnh4eGRlZjwvaW5zPlxuICAvLyAgIC0+IDxkZWw+YWJjPC9kZWw+eHh4PGlucz5kZWY8L2lucz5cbiAgLy8gZS5nOiA8ZGVsPnh4eGFiYzwvZGVsPjxpbnM+ZGVmeHh4PC9pbnM+XG4gIC8vICAgLT4gPGlucz5kZWY8L2lucz54eHg8ZGVsPmFiYzwvZGVsPlxuICAvLyBPbmx5IGV4dHJhY3QgYW4gb3ZlcmxhcCBpZiBpdCBpcyBhcyBiaWcgYXMgdGhlIGVkaXQgYWhlYWQgb3IgYmVoaW5kIGl0LlxuICBwb2ludGVyID0gMTtcbiAgd2hpbGUgKHBvaW50ZXIgPCBkaWZmcy5sZW5ndGgpIHtcbiAgICBpZiAoZGlmZnNbcG9pbnRlciAtIDFdWzBdID09IERJRkZfREVMRVRFICYmXG4gICAgICAgIGRpZmZzW3BvaW50ZXJdWzBdID09IERJRkZfSU5TRVJUKSB7XG4gICAgICB2YXIgZGVsZXRpb24gPSBkaWZmc1twb2ludGVyIC0gMV1bMV07XG4gICAgICB2YXIgaW5zZXJ0aW9uID0gZGlmZnNbcG9pbnRlcl1bMV07XG4gICAgICB2YXIgb3ZlcmxhcF9sZW5ndGgxID0gdGhpcy5kaWZmX2NvbW1vbk92ZXJsYXBfKGRlbGV0aW9uLCBpbnNlcnRpb24pO1xuICAgICAgdmFyIG92ZXJsYXBfbGVuZ3RoMiA9IHRoaXMuZGlmZl9jb21tb25PdmVybGFwXyhpbnNlcnRpb24sIGRlbGV0aW9uKTtcbiAgICAgIGlmIChvdmVybGFwX2xlbmd0aDEgPj0gb3ZlcmxhcF9sZW5ndGgyKSB7XG4gICAgICAgIGlmIChvdmVybGFwX2xlbmd0aDEgPj0gZGVsZXRpb24ubGVuZ3RoIC8gMiB8fFxuICAgICAgICAgICAgb3ZlcmxhcF9sZW5ndGgxID49IGluc2VydGlvbi5sZW5ndGggLyAyKSB7XG4gICAgICAgICAgLy8gT3ZlcmxhcCBmb3VuZC4gIEluc2VydCBhbiBlcXVhbGl0eSBhbmQgdHJpbSB0aGUgc3Vycm91bmRpbmcgZWRpdHMuXG4gICAgICAgICAgZGlmZnMuc3BsaWNlKHBvaW50ZXIsIDAsXG4gICAgICAgICAgICAgIFtESUZGX0VRVUFMLCBpbnNlcnRpb24uc3Vic3RyaW5nKDAsIG92ZXJsYXBfbGVuZ3RoMSldKTtcbiAgICAgICAgICBkaWZmc1twb2ludGVyIC0gMV1bMV0gPVxuICAgICAgICAgICAgICBkZWxldGlvbi5zdWJzdHJpbmcoMCwgZGVsZXRpb24ubGVuZ3RoIC0gb3ZlcmxhcF9sZW5ndGgxKTtcbiAgICAgICAgICBkaWZmc1twb2ludGVyICsgMV1bMV0gPSBpbnNlcnRpb24uc3Vic3RyaW5nKG92ZXJsYXBfbGVuZ3RoMSk7XG4gICAgICAgICAgcG9pbnRlcisrO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAob3ZlcmxhcF9sZW5ndGgyID49IGRlbGV0aW9uLmxlbmd0aCAvIDIgfHxcbiAgICAgICAgICAgIG92ZXJsYXBfbGVuZ3RoMiA+PSBpbnNlcnRpb24ubGVuZ3RoIC8gMikge1xuICAgICAgICAgIC8vIFJldmVyc2Ugb3ZlcmxhcCBmb3VuZC5cbiAgICAgICAgICAvLyBJbnNlcnQgYW4gZXF1YWxpdHkgYW5kIHN3YXAgYW5kIHRyaW0gdGhlIHN1cnJvdW5kaW5nIGVkaXRzLlxuICAgICAgICAgIGRpZmZzLnNwbGljZShwb2ludGVyLCAwLFxuICAgICAgICAgICAgICBbRElGRl9FUVVBTCwgZGVsZXRpb24uc3Vic3RyaW5nKDAsIG92ZXJsYXBfbGVuZ3RoMildKTtcbiAgICAgICAgICBkaWZmc1twb2ludGVyIC0gMV1bMF0gPSBESUZGX0lOU0VSVDtcbiAgICAgICAgICBkaWZmc1twb2ludGVyIC0gMV1bMV0gPVxuICAgICAgICAgICAgICBpbnNlcnRpb24uc3Vic3RyaW5nKDAsIGluc2VydGlvbi5sZW5ndGggLSBvdmVybGFwX2xlbmd0aDIpO1xuICAgICAgICAgIGRpZmZzW3BvaW50ZXIgKyAxXVswXSA9IERJRkZfREVMRVRFO1xuICAgICAgICAgIGRpZmZzW3BvaW50ZXIgKyAxXVsxXSA9XG4gICAgICAgICAgICAgIGRlbGV0aW9uLnN1YnN0cmluZyhvdmVybGFwX2xlbmd0aDIpO1xuICAgICAgICAgIHBvaW50ZXIrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcG9pbnRlcisrO1xuICAgIH1cbiAgICBwb2ludGVyKys7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBMb29rIGZvciBzaW5nbGUgZWRpdHMgc3Vycm91bmRlZCBvbiBib3RoIHNpZGVzIGJ5IGVxdWFsaXRpZXNcbiAqIHdoaWNoIGNhbiBiZSBzaGlmdGVkIHNpZGV3YXlzIHRvIGFsaWduIHRoZSBlZGl0IHRvIGEgd29yZCBib3VuZGFyeS5cbiAqIGUuZzogVGhlIGM8aW5zPmF0IGM8L2lucz5hbWUuIC0+IFRoZSA8aW5zPmNhdCA8L2lucz5jYW1lLlxuICogQHBhcmFtIHshQXJyYXkuPCFkaWZmX21hdGNoX3BhdGNoLkRpZmY+fSBkaWZmcyBBcnJheSBvZiBkaWZmIHR1cGxlcy5cbiAqL1xuZGlmZl9tYXRjaF9wYXRjaC5wcm90b3R5cGUuZGlmZl9jbGVhbnVwU2VtYW50aWNMb3NzbGVzcyA9IGZ1bmN0aW9uKGRpZmZzKSB7XG4gIC8qKlxuICAgKiBHaXZlbiB0d28gc3RyaW5ncywgY29tcHV0ZSBhIHNjb3JlIHJlcHJlc2VudGluZyB3aGV0aGVyIHRoZSBpbnRlcm5hbFxuICAgKiBib3VuZGFyeSBmYWxscyBvbiBsb2dpY2FsIGJvdW5kYXJpZXMuXG4gICAqIFNjb3JlcyByYW5nZSBmcm9tIDYgKGJlc3QpIHRvIDAgKHdvcnN0KS5cbiAgICogQ2xvc3VyZSwgYnV0IGRvZXMgbm90IHJlZmVyZW5jZSBhbnkgZXh0ZXJuYWwgdmFyaWFibGVzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gb25lIEZpcnN0IHN0cmluZy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHR3byBTZWNvbmQgc3RyaW5nLlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBzY29yZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGZ1bmN0aW9uIGRpZmZfY2xlYW51cFNlbWFudGljU2NvcmVfKG9uZSwgdHdvKSB7XG4gICAgaWYgKCFvbmUgfHwgIXR3bykge1xuICAgICAgLy8gRWRnZXMgYXJlIHRoZSBiZXN0LlxuICAgICAgcmV0dXJuIDY7XG4gICAgfVxuXG4gICAgLy8gRWFjaCBwb3J0IG9mIHRoaXMgZnVuY3Rpb24gYmVoYXZlcyBzbGlnaHRseSBkaWZmZXJlbnRseSBkdWUgdG9cbiAgICAvLyBzdWJ0bGUgZGlmZmVyZW5jZXMgaW4gZWFjaCBsYW5ndWFnZSdzIGRlZmluaXRpb24gb2YgdGhpbmdzIGxpa2VcbiAgICAvLyAnd2hpdGVzcGFjZScuICBTaW5jZSB0aGlzIGZ1bmN0aW9uJ3MgcHVycG9zZSBpcyBsYXJnZWx5IGNvc21ldGljLFxuICAgIC8vIHRoZSBjaG9pY2UgaGFzIGJlZW4gbWFkZSB0byB1c2UgZWFjaCBsYW5ndWFnZSdzIG5hdGl2ZSBmZWF0dXJlc1xuICAgIC8vIHJhdGhlciB0aGFuIGZvcmNlIHRvdGFsIGNvbmZvcm1pdHkuXG4gICAgdmFyIGNoYXIxID0gb25lLmNoYXJBdChvbmUubGVuZ3RoIC0gMSk7XG4gICAgdmFyIGNoYXIyID0gdHdvLmNoYXJBdCgwKTtcbiAgICB2YXIgbm9uQWxwaGFOdW1lcmljMSA9IGNoYXIxLm1hdGNoKGRpZmZfbWF0Y2hfcGF0Y2gubm9uQWxwaGFOdW1lcmljUmVnZXhfKTtcbiAgICB2YXIgbm9uQWxwaGFOdW1lcmljMiA9IGNoYXIyLm1hdGNoKGRpZmZfbWF0Y2hfcGF0Y2gubm9uQWxwaGFOdW1lcmljUmVnZXhfKTtcbiAgICB2YXIgd2hpdGVzcGFjZTEgPSBub25BbHBoYU51bWVyaWMxICYmXG4gICAgICAgIGNoYXIxLm1hdGNoKGRpZmZfbWF0Y2hfcGF0Y2gud2hpdGVzcGFjZVJlZ2V4Xyk7XG4gICAgdmFyIHdoaXRlc3BhY2UyID0gbm9uQWxwaGFOdW1lcmljMiAmJlxuICAgICAgICBjaGFyMi5tYXRjaChkaWZmX21hdGNoX3BhdGNoLndoaXRlc3BhY2VSZWdleF8pO1xuICAgIHZhciBsaW5lQnJlYWsxID0gd2hpdGVzcGFjZTEgJiZcbiAgICAgICAgY2hhcjEubWF0Y2goZGlmZl9tYXRjaF9wYXRjaC5saW5lYnJlYWtSZWdleF8pO1xuICAgIHZhciBsaW5lQnJlYWsyID0gd2hpdGVzcGFjZTIgJiZcbiAgICAgICAgY2hhcjIubWF0Y2goZGlmZl9tYXRjaF9wYXRjaC5saW5lYnJlYWtSZWdleF8pO1xuICAgIHZhciBibGFua0xpbmUxID0gbGluZUJyZWFrMSAmJlxuICAgICAgICBvbmUubWF0Y2goZGlmZl9tYXRjaF9wYXRjaC5ibGFua2xpbmVFbmRSZWdleF8pO1xuICAgIHZhciBibGFua0xpbmUyID0gbGluZUJyZWFrMiAmJlxuICAgICAgICB0d28ubWF0Y2goZGlmZl9tYXRjaF9wYXRjaC5ibGFua2xpbmVTdGFydFJlZ2V4Xyk7XG5cbiAgICBpZiAoYmxhbmtMaW5lMSB8fCBibGFua0xpbmUyKSB7XG4gICAgICAvLyBGaXZlIHBvaW50cyBmb3IgYmxhbmsgbGluZXMuXG4gICAgICByZXR1cm4gNTtcbiAgICB9IGVsc2UgaWYgKGxpbmVCcmVhazEgfHwgbGluZUJyZWFrMikge1xuICAgICAgLy8gRm91ciBwb2ludHMgZm9yIGxpbmUgYnJlYWtzLlxuICAgICAgcmV0dXJuIDQ7XG4gICAgfSBlbHNlIGlmIChub25BbHBoYU51bWVyaWMxICYmICF3aGl0ZXNwYWNlMSAmJiB3aGl0ZXNwYWNlMikge1xuICAgICAgLy8gVGhyZWUgcG9pbnRzIGZvciBlbmQgb2Ygc2VudGVuY2VzLlxuICAgICAgcmV0dXJuIDM7XG4gICAgfSBlbHNlIGlmICh3aGl0ZXNwYWNlMSB8fCB3aGl0ZXNwYWNlMikge1xuICAgICAgLy8gVHdvIHBvaW50cyBmb3Igd2hpdGVzcGFjZS5cbiAgICAgIHJldHVybiAyO1xuICAgIH0gZWxzZSBpZiAobm9uQWxwaGFOdW1lcmljMSB8fCBub25BbHBoYU51bWVyaWMyKSB7XG4gICAgICAvLyBPbmUgcG9pbnQgZm9yIG5vbi1hbHBoYW51bWVyaWMuXG4gICAgICByZXR1cm4gMTtcbiAgICB9XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICB2YXIgcG9pbnRlciA9IDE7XG4gIC8vIEludGVudGlvbmFsbHkgaWdub3JlIHRoZSBmaXJzdCBhbmQgbGFzdCBlbGVtZW50IChkb24ndCBuZWVkIGNoZWNraW5nKS5cbiAgd2hpbGUgKHBvaW50ZXIgPCBkaWZmcy5sZW5ndGggLSAxKSB7XG4gICAgaWYgKGRpZmZzW3BvaW50ZXIgLSAxXVswXSA9PSBESUZGX0VRVUFMICYmXG4gICAgICAgIGRpZmZzW3BvaW50ZXIgKyAxXVswXSA9PSBESUZGX0VRVUFMKSB7XG4gICAgICAvLyBUaGlzIGlzIGEgc2luZ2xlIGVkaXQgc3Vycm91bmRlZCBieSBlcXVhbGl0aWVzLlxuICAgICAgdmFyIGVxdWFsaXR5MSA9IGRpZmZzW3BvaW50ZXIgLSAxXVsxXTtcbiAgICAgIHZhciBlZGl0ID0gZGlmZnNbcG9pbnRlcl1bMV07XG4gICAgICB2YXIgZXF1YWxpdHkyID0gZGlmZnNbcG9pbnRlciArIDFdWzFdO1xuXG4gICAgICAvLyBGaXJzdCwgc2hpZnQgdGhlIGVkaXQgYXMgZmFyIGxlZnQgYXMgcG9zc2libGUuXG4gICAgICB2YXIgY29tbW9uT2Zmc2V0ID0gdGhpcy5kaWZmX2NvbW1vblN1ZmZpeChlcXVhbGl0eTEsIGVkaXQpO1xuICAgICAgaWYgKGNvbW1vbk9mZnNldCkge1xuICAgICAgICB2YXIgY29tbW9uU3RyaW5nID0gZWRpdC5zdWJzdHJpbmcoZWRpdC5sZW5ndGggLSBjb21tb25PZmZzZXQpO1xuICAgICAgICBlcXVhbGl0eTEgPSBlcXVhbGl0eTEuc3Vic3RyaW5nKDAsIGVxdWFsaXR5MS5sZW5ndGggLSBjb21tb25PZmZzZXQpO1xuICAgICAgICBlZGl0ID0gY29tbW9uU3RyaW5nICsgZWRpdC5zdWJzdHJpbmcoMCwgZWRpdC5sZW5ndGggLSBjb21tb25PZmZzZXQpO1xuICAgICAgICBlcXVhbGl0eTIgPSBjb21tb25TdHJpbmcgKyBlcXVhbGl0eTI7XG4gICAgICB9XG5cbiAgICAgIC8vIFNlY29uZCwgc3RlcCBjaGFyYWN0ZXIgYnkgY2hhcmFjdGVyIHJpZ2h0LCBsb29raW5nIGZvciB0aGUgYmVzdCBmaXQuXG4gICAgICB2YXIgYmVzdEVxdWFsaXR5MSA9IGVxdWFsaXR5MTtcbiAgICAgIHZhciBiZXN0RWRpdCA9IGVkaXQ7XG4gICAgICB2YXIgYmVzdEVxdWFsaXR5MiA9IGVxdWFsaXR5MjtcbiAgICAgIHZhciBiZXN0U2NvcmUgPSBkaWZmX2NsZWFudXBTZW1hbnRpY1Njb3JlXyhlcXVhbGl0eTEsIGVkaXQpICtcbiAgICAgICAgICBkaWZmX2NsZWFudXBTZW1hbnRpY1Njb3JlXyhlZGl0LCBlcXVhbGl0eTIpO1xuICAgICAgd2hpbGUgKGVkaXQuY2hhckF0KDApID09PSBlcXVhbGl0eTIuY2hhckF0KDApKSB7XG4gICAgICAgIGVxdWFsaXR5MSArPSBlZGl0LmNoYXJBdCgwKTtcbiAgICAgICAgZWRpdCA9IGVkaXQuc3Vic3RyaW5nKDEpICsgZXF1YWxpdHkyLmNoYXJBdCgwKTtcbiAgICAgICAgZXF1YWxpdHkyID0gZXF1YWxpdHkyLnN1YnN0cmluZygxKTtcbiAgICAgICAgdmFyIHNjb3JlID0gZGlmZl9jbGVhbnVwU2VtYW50aWNTY29yZV8oZXF1YWxpdHkxLCBlZGl0KSArXG4gICAgICAgICAgICBkaWZmX2NsZWFudXBTZW1hbnRpY1Njb3JlXyhlZGl0LCBlcXVhbGl0eTIpO1xuICAgICAgICAvLyBUaGUgPj0gZW5jb3VyYWdlcyB0cmFpbGluZyByYXRoZXIgdGhhbiBsZWFkaW5nIHdoaXRlc3BhY2Ugb24gZWRpdHMuXG4gICAgICAgIGlmIChzY29yZSA+PSBiZXN0U2NvcmUpIHtcbiAgICAgICAgICBiZXN0U2NvcmUgPSBzY29yZTtcbiAgICAgICAgICBiZXN0RXF1YWxpdHkxID0gZXF1YWxpdHkxO1xuICAgICAgICAgIGJlc3RFZGl0ID0gZWRpdDtcbiAgICAgICAgICBiZXN0RXF1YWxpdHkyID0gZXF1YWxpdHkyO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChkaWZmc1twb2ludGVyIC0gMV1bMV0gIT0gYmVzdEVxdWFsaXR5MSkge1xuICAgICAgICAvLyBXZSBoYXZlIGFuIGltcHJvdmVtZW50LCBzYXZlIGl0IGJhY2sgdG8gdGhlIGRpZmYuXG4gICAgICAgIGlmIChiZXN0RXF1YWxpdHkxKSB7XG4gICAgICAgICAgZGlmZnNbcG9pbnRlciAtIDFdWzFdID0gYmVzdEVxdWFsaXR5MTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkaWZmcy5zcGxpY2UocG9pbnRlciAtIDEsIDEpO1xuICAgICAgICAgIHBvaW50ZXItLTtcbiAgICAgICAgfVxuICAgICAgICBkaWZmc1twb2ludGVyXVsxXSA9IGJlc3RFZGl0O1xuICAgICAgICBpZiAoYmVzdEVxdWFsaXR5Mikge1xuICAgICAgICAgIGRpZmZzW3BvaW50ZXIgKyAxXVsxXSA9IGJlc3RFcXVhbGl0eTI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGlmZnMuc3BsaWNlKHBvaW50ZXIgKyAxLCAxKTtcbiAgICAgICAgICBwb2ludGVyLS07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcG9pbnRlcisrO1xuICB9XG59O1xuXG4vLyBEZWZpbmUgc29tZSByZWdleCBwYXR0ZXJucyBmb3IgbWF0Y2hpbmcgYm91bmRhcmllcy5cbmRpZmZfbWF0Y2hfcGF0Y2gubm9uQWxwaGFOdW1lcmljUmVnZXhfID0gL1teYS16QS1aMC05XS87XG5kaWZmX21hdGNoX3BhdGNoLndoaXRlc3BhY2VSZWdleF8gPSAvXFxzLztcbmRpZmZfbWF0Y2hfcGF0Y2gubGluZWJyZWFrUmVnZXhfID0gL1tcXHJcXG5dLztcbmRpZmZfbWF0Y2hfcGF0Y2guYmxhbmtsaW5lRW5kUmVnZXhfID0gL1xcblxccj9cXG4kLztcbmRpZmZfbWF0Y2hfcGF0Y2guYmxhbmtsaW5lU3RhcnRSZWdleF8gPSAvXlxccj9cXG5cXHI/XFxuLztcblxuLyoqXG4gKiBSZWR1Y2UgdGhlIG51bWJlciBvZiBlZGl0cyBieSBlbGltaW5hdGluZyBvcGVyYXRpb25hbGx5IHRyaXZpYWwgZXF1YWxpdGllcy5cbiAqIEBwYXJhbSB7IUFycmF5LjwhZGlmZl9tYXRjaF9wYXRjaC5EaWZmPn0gZGlmZnMgQXJyYXkgb2YgZGlmZiB0dXBsZXMuXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLmRpZmZfY2xlYW51cEVmZmljaWVuY3kgPSBmdW5jdGlvbihkaWZmcykge1xuICB2YXIgY2hhbmdlcyA9IGZhbHNlO1xuICB2YXIgZXF1YWxpdGllcyA9IFtdOyAgLy8gU3RhY2sgb2YgaW5kaWNlcyB3aGVyZSBlcXVhbGl0aWVzIGFyZSBmb3VuZC5cbiAgdmFyIGVxdWFsaXRpZXNMZW5ndGggPSAwOyAgLy8gS2VlcGluZyBvdXIgb3duIGxlbmd0aCB2YXIgaXMgZmFzdGVyIGluIEpTLlxuICAvKiogQHR5cGUgez9zdHJpbmd9ICovXG4gIHZhciBsYXN0ZXF1YWxpdHkgPSBudWxsO1xuICAvLyBBbHdheXMgZXF1YWwgdG8gZGlmZnNbZXF1YWxpdGllc1tlcXVhbGl0aWVzTGVuZ3RoIC0gMV1dWzFdXG4gIHZhciBwb2ludGVyID0gMDsgIC8vIEluZGV4IG9mIGN1cnJlbnQgcG9zaXRpb24uXG4gIC8vIElzIHRoZXJlIGFuIGluc2VydGlvbiBvcGVyYXRpb24gYmVmb3JlIHRoZSBsYXN0IGVxdWFsaXR5LlxuICB2YXIgcHJlX2lucyA9IGZhbHNlO1xuICAvLyBJcyB0aGVyZSBhIGRlbGV0aW9uIG9wZXJhdGlvbiBiZWZvcmUgdGhlIGxhc3QgZXF1YWxpdHkuXG4gIHZhciBwcmVfZGVsID0gZmFsc2U7XG4gIC8vIElzIHRoZXJlIGFuIGluc2VydGlvbiBvcGVyYXRpb24gYWZ0ZXIgdGhlIGxhc3QgZXF1YWxpdHkuXG4gIHZhciBwb3N0X2lucyA9IGZhbHNlO1xuICAvLyBJcyB0aGVyZSBhIGRlbGV0aW9uIG9wZXJhdGlvbiBhZnRlciB0aGUgbGFzdCBlcXVhbGl0eS5cbiAgdmFyIHBvc3RfZGVsID0gZmFsc2U7XG4gIHdoaWxlIChwb2ludGVyIDwgZGlmZnMubGVuZ3RoKSB7XG4gICAgaWYgKGRpZmZzW3BvaW50ZXJdWzBdID09IERJRkZfRVFVQUwpIHsgIC8vIEVxdWFsaXR5IGZvdW5kLlxuICAgICAgaWYgKGRpZmZzW3BvaW50ZXJdWzFdLmxlbmd0aCA8IHRoaXMuRGlmZl9FZGl0Q29zdCAmJlxuICAgICAgICAgIChwb3N0X2lucyB8fCBwb3N0X2RlbCkpIHtcbiAgICAgICAgLy8gQ2FuZGlkYXRlIGZvdW5kLlxuICAgICAgICBlcXVhbGl0aWVzW2VxdWFsaXRpZXNMZW5ndGgrK10gPSBwb2ludGVyO1xuICAgICAgICBwcmVfaW5zID0gcG9zdF9pbnM7XG4gICAgICAgIHByZV9kZWwgPSBwb3N0X2RlbDtcbiAgICAgICAgbGFzdGVxdWFsaXR5ID0gZGlmZnNbcG9pbnRlcl1bMV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBOb3QgYSBjYW5kaWRhdGUsIGFuZCBjYW4gbmV2ZXIgYmVjb21lIG9uZS5cbiAgICAgICAgZXF1YWxpdGllc0xlbmd0aCA9IDA7XG4gICAgICAgIGxhc3RlcXVhbGl0eSA9IG51bGw7XG4gICAgICB9XG4gICAgICBwb3N0X2lucyA9IHBvc3RfZGVsID0gZmFsc2U7XG4gICAgfSBlbHNlIHsgIC8vIEFuIGluc2VydGlvbiBvciBkZWxldGlvbi5cbiAgICAgIGlmIChkaWZmc1twb2ludGVyXVswXSA9PSBESUZGX0RFTEVURSkge1xuICAgICAgICBwb3N0X2RlbCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwb3N0X2lucyA9IHRydWU7XG4gICAgICB9XG4gICAgICAvKlxuICAgICAgICogRml2ZSB0eXBlcyB0byBiZSBzcGxpdDpcbiAgICAgICAqIDxpbnM+QTwvaW5zPjxkZWw+QjwvZGVsPlhZPGlucz5DPC9pbnM+PGRlbD5EPC9kZWw+XG4gICAgICAgKiA8aW5zPkE8L2lucz5YPGlucz5DPC9pbnM+PGRlbD5EPC9kZWw+XG4gICAgICAgKiA8aW5zPkE8L2lucz48ZGVsPkI8L2RlbD5YPGlucz5DPC9pbnM+XG4gICAgICAgKiA8aW5zPkE8L2RlbD5YPGlucz5DPC9pbnM+PGRlbD5EPC9kZWw+XG4gICAgICAgKiA8aW5zPkE8L2lucz48ZGVsPkI8L2RlbD5YPGRlbD5DPC9kZWw+XG4gICAgICAgKi9cbiAgICAgIGlmIChsYXN0ZXF1YWxpdHkgJiYgKChwcmVfaW5zICYmIHByZV9kZWwgJiYgcG9zdF9pbnMgJiYgcG9zdF9kZWwpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAoKGxhc3RlcXVhbGl0eS5sZW5ndGggPCB0aGlzLkRpZmZfRWRpdENvc3QgLyAyKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwcmVfaW5zICsgcHJlX2RlbCArIHBvc3RfaW5zICsgcG9zdF9kZWwpID09IDMpKSkge1xuICAgICAgICAvLyBEdXBsaWNhdGUgcmVjb3JkLlxuICAgICAgICBkaWZmcy5zcGxpY2UoZXF1YWxpdGllc1tlcXVhbGl0aWVzTGVuZ3RoIC0gMV0sIDAsXG4gICAgICAgICAgICAgICAgICAgICBbRElGRl9ERUxFVEUsIGxhc3RlcXVhbGl0eV0pO1xuICAgICAgICAvLyBDaGFuZ2Ugc2Vjb25kIGNvcHkgdG8gaW5zZXJ0LlxuICAgICAgICBkaWZmc1tlcXVhbGl0aWVzW2VxdWFsaXRpZXNMZW5ndGggLSAxXSArIDFdWzBdID0gRElGRl9JTlNFUlQ7XG4gICAgICAgIGVxdWFsaXRpZXNMZW5ndGgtLTsgIC8vIFRocm93IGF3YXkgdGhlIGVxdWFsaXR5IHdlIGp1c3QgZGVsZXRlZDtcbiAgICAgICAgbGFzdGVxdWFsaXR5ID0gbnVsbDtcbiAgICAgICAgaWYgKHByZV9pbnMgJiYgcHJlX2RlbCkge1xuICAgICAgICAgIC8vIE5vIGNoYW5nZXMgbWFkZSB3aGljaCBjb3VsZCBhZmZlY3QgcHJldmlvdXMgZW50cnksIGtlZXAgZ29pbmcuXG4gICAgICAgICAgcG9zdF9pbnMgPSBwb3N0X2RlbCA9IHRydWU7XG4gICAgICAgICAgZXF1YWxpdGllc0xlbmd0aCA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZXF1YWxpdGllc0xlbmd0aC0tOyAgLy8gVGhyb3cgYXdheSB0aGUgcHJldmlvdXMgZXF1YWxpdHkuXG4gICAgICAgICAgcG9pbnRlciA9IGVxdWFsaXRpZXNMZW5ndGggPiAwID9cbiAgICAgICAgICAgICAgZXF1YWxpdGllc1tlcXVhbGl0aWVzTGVuZ3RoIC0gMV0gOiAtMTtcbiAgICAgICAgICBwb3N0X2lucyA9IHBvc3RfZGVsID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY2hhbmdlcyA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHBvaW50ZXIrKztcbiAgfVxuXG4gIGlmIChjaGFuZ2VzKSB7XG4gICAgdGhpcy5kaWZmX2NsZWFudXBNZXJnZShkaWZmcyk7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBSZW9yZGVyIGFuZCBtZXJnZSBsaWtlIGVkaXQgc2VjdGlvbnMuICBNZXJnZSBlcXVhbGl0aWVzLlxuICogQW55IGVkaXQgc2VjdGlvbiBjYW4gbW92ZSBhcyBsb25nIGFzIGl0IGRvZXNuJ3QgY3Jvc3MgYW4gZXF1YWxpdHkuXG4gKiBAcGFyYW0geyFBcnJheS48IWRpZmZfbWF0Y2hfcGF0Y2guRGlmZj59IGRpZmZzIEFycmF5IG9mIGRpZmYgdHVwbGVzLlxuICovXG5kaWZmX21hdGNoX3BhdGNoLnByb3RvdHlwZS5kaWZmX2NsZWFudXBNZXJnZSA9IGZ1bmN0aW9uKGRpZmZzKSB7XG4gIGRpZmZzLnB1c2goW0RJRkZfRVFVQUwsICcnXSk7ICAvLyBBZGQgYSBkdW1teSBlbnRyeSBhdCB0aGUgZW5kLlxuICB2YXIgcG9pbnRlciA9IDA7XG4gIHZhciBjb3VudF9kZWxldGUgPSAwO1xuICB2YXIgY291bnRfaW5zZXJ0ID0gMDtcbiAgdmFyIHRleHRfZGVsZXRlID0gJyc7XG4gIHZhciB0ZXh0X2luc2VydCA9ICcnO1xuICB2YXIgY29tbW9ubGVuZ3RoO1xuICB3aGlsZSAocG9pbnRlciA8IGRpZmZzLmxlbmd0aCkge1xuICAgIHN3aXRjaCAoZGlmZnNbcG9pbnRlcl1bMF0pIHtcbiAgICAgIGNhc2UgRElGRl9JTlNFUlQ6XG4gICAgICAgIGNvdW50X2luc2VydCsrO1xuICAgICAgICB0ZXh0X2luc2VydCArPSBkaWZmc1twb2ludGVyXVsxXTtcbiAgICAgICAgcG9pbnRlcisrO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRElGRl9ERUxFVEU6XG4gICAgICAgIGNvdW50X2RlbGV0ZSsrO1xuICAgICAgICB0ZXh0X2RlbGV0ZSArPSBkaWZmc1twb2ludGVyXVsxXTtcbiAgICAgICAgcG9pbnRlcisrO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRElGRl9FUVVBTDpcbiAgICAgICAgLy8gVXBvbiByZWFjaGluZyBhbiBlcXVhbGl0eSwgY2hlY2sgZm9yIHByaW9yIHJlZHVuZGFuY2llcy5cbiAgICAgICAgaWYgKGNvdW50X2RlbGV0ZSArIGNvdW50X2luc2VydCA+IDEpIHtcbiAgICAgICAgICBpZiAoY291bnRfZGVsZXRlICE9PSAwICYmIGNvdW50X2luc2VydCAhPT0gMCkge1xuICAgICAgICAgICAgLy8gRmFjdG9yIG91dCBhbnkgY29tbW9uIHByZWZpeGllcy5cbiAgICAgICAgICAgIGNvbW1vbmxlbmd0aCA9IHRoaXMuZGlmZl9jb21tb25QcmVmaXgodGV4dF9pbnNlcnQsIHRleHRfZGVsZXRlKTtcbiAgICAgICAgICAgIGlmIChjb21tb25sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgaWYgKChwb2ludGVyIC0gY291bnRfZGVsZXRlIC0gY291bnRfaW5zZXJ0KSA+IDAgJiZcbiAgICAgICAgICAgICAgICAgIGRpZmZzW3BvaW50ZXIgLSBjb3VudF9kZWxldGUgLSBjb3VudF9pbnNlcnQgLSAxXVswXSA9PVxuICAgICAgICAgICAgICAgICAgRElGRl9FUVVBTCkge1xuICAgICAgICAgICAgICAgIGRpZmZzW3BvaW50ZXIgLSBjb3VudF9kZWxldGUgLSBjb3VudF9pbnNlcnQgLSAxXVsxXSArPVxuICAgICAgICAgICAgICAgICAgICB0ZXh0X2luc2VydC5zdWJzdHJpbmcoMCwgY29tbW9ubGVuZ3RoKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkaWZmcy5zcGxpY2UoMCwgMCwgW0RJRkZfRVFVQUwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0X2luc2VydC5zdWJzdHJpbmcoMCwgY29tbW9ubGVuZ3RoKV0pO1xuICAgICAgICAgICAgICAgIHBvaW50ZXIrKztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB0ZXh0X2luc2VydCA9IHRleHRfaW5zZXJ0LnN1YnN0cmluZyhjb21tb25sZW5ndGgpO1xuICAgICAgICAgICAgICB0ZXh0X2RlbGV0ZSA9IHRleHRfZGVsZXRlLnN1YnN0cmluZyhjb21tb25sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gRmFjdG9yIG91dCBhbnkgY29tbW9uIHN1ZmZpeGllcy5cbiAgICAgICAgICAgIGNvbW1vbmxlbmd0aCA9IHRoaXMuZGlmZl9jb21tb25TdWZmaXgodGV4dF9pbnNlcnQsIHRleHRfZGVsZXRlKTtcbiAgICAgICAgICAgIGlmIChjb21tb25sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgZGlmZnNbcG9pbnRlcl1bMV0gPSB0ZXh0X2luc2VydC5zdWJzdHJpbmcodGV4dF9pbnNlcnQubGVuZ3RoIC1cbiAgICAgICAgICAgICAgICAgIGNvbW1vbmxlbmd0aCkgKyBkaWZmc1twb2ludGVyXVsxXTtcbiAgICAgICAgICAgICAgdGV4dF9pbnNlcnQgPSB0ZXh0X2luc2VydC5zdWJzdHJpbmcoMCwgdGV4dF9pbnNlcnQubGVuZ3RoIC1cbiAgICAgICAgICAgICAgICAgIGNvbW1vbmxlbmd0aCk7XG4gICAgICAgICAgICAgIHRleHRfZGVsZXRlID0gdGV4dF9kZWxldGUuc3Vic3RyaW5nKDAsIHRleHRfZGVsZXRlLmxlbmd0aCAtXG4gICAgICAgICAgICAgICAgICBjb21tb25sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBEZWxldGUgdGhlIG9mZmVuZGluZyByZWNvcmRzIGFuZCBhZGQgdGhlIG1lcmdlZCBvbmVzLlxuICAgICAgICAgIGlmIChjb3VudF9kZWxldGUgPT09IDApIHtcbiAgICAgICAgICAgIGRpZmZzLnNwbGljZShwb2ludGVyIC0gY291bnRfaW5zZXJ0LFxuICAgICAgICAgICAgICAgIGNvdW50X2RlbGV0ZSArIGNvdW50X2luc2VydCwgW0RJRkZfSU5TRVJULCB0ZXh0X2luc2VydF0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY291bnRfaW5zZXJ0ID09PSAwKSB7XG4gICAgICAgICAgICBkaWZmcy5zcGxpY2UocG9pbnRlciAtIGNvdW50X2RlbGV0ZSxcbiAgICAgICAgICAgICAgICBjb3VudF9kZWxldGUgKyBjb3VudF9pbnNlcnQsIFtESUZGX0RFTEVURSwgdGV4dF9kZWxldGVdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGlmZnMuc3BsaWNlKHBvaW50ZXIgLSBjb3VudF9kZWxldGUgLSBjb3VudF9pbnNlcnQsXG4gICAgICAgICAgICAgICAgY291bnRfZGVsZXRlICsgY291bnRfaW5zZXJ0LCBbRElGRl9ERUxFVEUsIHRleHRfZGVsZXRlXSxcbiAgICAgICAgICAgICAgICBbRElGRl9JTlNFUlQsIHRleHRfaW5zZXJ0XSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBvaW50ZXIgPSBwb2ludGVyIC0gY291bnRfZGVsZXRlIC0gY291bnRfaW5zZXJ0ICtcbiAgICAgICAgICAgICAgICAgICAgKGNvdW50X2RlbGV0ZSA/IDEgOiAwKSArIChjb3VudF9pbnNlcnQgPyAxIDogMCkgKyAxO1xuICAgICAgICB9IGVsc2UgaWYgKHBvaW50ZXIgIT09IDAgJiYgZGlmZnNbcG9pbnRlciAtIDFdWzBdID09IERJRkZfRVFVQUwpIHtcbiAgICAgICAgICAvLyBNZXJnZSB0aGlzIGVxdWFsaXR5IHdpdGggdGhlIHByZXZpb3VzIG9uZS5cbiAgICAgICAgICBkaWZmc1twb2ludGVyIC0gMV1bMV0gKz0gZGlmZnNbcG9pbnRlcl1bMV07XG4gICAgICAgICAgZGlmZnMuc3BsaWNlKHBvaW50ZXIsIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBvaW50ZXIrKztcbiAgICAgICAgfVxuICAgICAgICBjb3VudF9pbnNlcnQgPSAwO1xuICAgICAgICBjb3VudF9kZWxldGUgPSAwO1xuICAgICAgICB0ZXh0X2RlbGV0ZSA9ICcnO1xuICAgICAgICB0ZXh0X2luc2VydCA9ICcnO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgaWYgKGRpZmZzW2RpZmZzLmxlbmd0aCAtIDFdWzFdID09PSAnJykge1xuICAgIGRpZmZzLnBvcCgpOyAgLy8gUmVtb3ZlIHRoZSBkdW1teSBlbnRyeSBhdCB0aGUgZW5kLlxuICB9XG5cbiAgLy8gU2Vjb25kIHBhc3M6IGxvb2sgZm9yIHNpbmdsZSBlZGl0cyBzdXJyb3VuZGVkIG9uIGJvdGggc2lkZXMgYnkgZXF1YWxpdGllc1xuICAvLyB3aGljaCBjYW4gYmUgc2hpZnRlZCBzaWRld2F5cyB0byBlbGltaW5hdGUgYW4gZXF1YWxpdHkuXG4gIC8vIGUuZzogQTxpbnM+QkE8L2lucz5DIC0+IDxpbnM+QUI8L2lucz5BQ1xuICB2YXIgY2hhbmdlcyA9IGZhbHNlO1xuICBwb2ludGVyID0gMTtcbiAgLy8gSW50ZW50aW9uYWxseSBpZ25vcmUgdGhlIGZpcnN0IGFuZCBsYXN0IGVsZW1lbnQgKGRvbid0IG5lZWQgY2hlY2tpbmcpLlxuICB3aGlsZSAocG9pbnRlciA8IGRpZmZzLmxlbmd0aCAtIDEpIHtcbiAgICBpZiAoZGlmZnNbcG9pbnRlciAtIDFdWzBdID09IERJRkZfRVFVQUwgJiZcbiAgICAgICAgZGlmZnNbcG9pbnRlciArIDFdWzBdID09IERJRkZfRVFVQUwpIHtcbiAgICAgIC8vIFRoaXMgaXMgYSBzaW5nbGUgZWRpdCBzdXJyb3VuZGVkIGJ5IGVxdWFsaXRpZXMuXG4gICAgICBpZiAoZGlmZnNbcG9pbnRlcl1bMV0uc3Vic3RyaW5nKGRpZmZzW3BvaW50ZXJdWzFdLmxlbmd0aCAtXG4gICAgICAgICAgZGlmZnNbcG9pbnRlciAtIDFdWzFdLmxlbmd0aCkgPT0gZGlmZnNbcG9pbnRlciAtIDFdWzFdKSB7XG4gICAgICAgIC8vIFNoaWZ0IHRoZSBlZGl0IG92ZXIgdGhlIHByZXZpb3VzIGVxdWFsaXR5LlxuICAgICAgICBkaWZmc1twb2ludGVyXVsxXSA9IGRpZmZzW3BvaW50ZXIgLSAxXVsxXSArXG4gICAgICAgICAgICBkaWZmc1twb2ludGVyXVsxXS5zdWJzdHJpbmcoMCwgZGlmZnNbcG9pbnRlcl1bMV0ubGVuZ3RoIC1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWZmc1twb2ludGVyIC0gMV1bMV0ubGVuZ3RoKTtcbiAgICAgICAgZGlmZnNbcG9pbnRlciArIDFdWzFdID0gZGlmZnNbcG9pbnRlciAtIDFdWzFdICsgZGlmZnNbcG9pbnRlciArIDFdWzFdO1xuICAgICAgICBkaWZmcy5zcGxpY2UocG9pbnRlciAtIDEsIDEpO1xuICAgICAgICBjaGFuZ2VzID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoZGlmZnNbcG9pbnRlcl1bMV0uc3Vic3RyaW5nKDAsIGRpZmZzW3BvaW50ZXIgKyAxXVsxXS5sZW5ndGgpID09XG4gICAgICAgICAgZGlmZnNbcG9pbnRlciArIDFdWzFdKSB7XG4gICAgICAgIC8vIFNoaWZ0IHRoZSBlZGl0IG92ZXIgdGhlIG5leHQgZXF1YWxpdHkuXG4gICAgICAgIGRpZmZzW3BvaW50ZXIgLSAxXVsxXSArPSBkaWZmc1twb2ludGVyICsgMV1bMV07XG4gICAgICAgIGRpZmZzW3BvaW50ZXJdWzFdID1cbiAgICAgICAgICAgIGRpZmZzW3BvaW50ZXJdWzFdLnN1YnN0cmluZyhkaWZmc1twb2ludGVyICsgMV1bMV0ubGVuZ3RoKSArXG4gICAgICAgICAgICBkaWZmc1twb2ludGVyICsgMV1bMV07XG4gICAgICAgIGRpZmZzLnNwbGljZShwb2ludGVyICsgMSwgMSk7XG4gICAgICAgIGNoYW5nZXMgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBwb2ludGVyKys7XG4gIH1cbiAgLy8gSWYgc2hpZnRzIHdlcmUgbWFkZSwgdGhlIGRpZmYgbmVlZHMgcmVvcmRlcmluZyBhbmQgYW5vdGhlciBzaGlmdCBzd2VlcC5cbiAgaWYgKGNoYW5nZXMpIHtcbiAgICB0aGlzLmRpZmZfY2xlYW51cE1lcmdlKGRpZmZzKTtcbiAgfVxufTtcblxuXG4vKipcbiAqIGxvYyBpcyBhIGxvY2F0aW9uIGluIHRleHQxLCBjb21wdXRlIGFuZCByZXR1cm4gdGhlIGVxdWl2YWxlbnQgbG9jYXRpb24gaW5cbiAqIHRleHQyLlxuICogZS5nLiAnVGhlIGNhdCcgdnMgJ1RoZSBiaWcgY2F0JywgMS0+MSwgNS0+OFxuICogQHBhcmFtIHshQXJyYXkuPCFkaWZmX21hdGNoX3BhdGNoLkRpZmY+fSBkaWZmcyBBcnJheSBvZiBkaWZmIHR1cGxlcy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBsb2MgTG9jYXRpb24gd2l0aGluIHRleHQxLlxuICogQHJldHVybiB7bnVtYmVyfSBMb2NhdGlvbiB3aXRoaW4gdGV4dDIuXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLmRpZmZfeEluZGV4ID0gZnVuY3Rpb24oZGlmZnMsIGxvYykge1xuICB2YXIgY2hhcnMxID0gMDtcbiAgdmFyIGNoYXJzMiA9IDA7XG4gIHZhciBsYXN0X2NoYXJzMSA9IDA7XG4gIHZhciBsYXN0X2NoYXJzMiA9IDA7XG4gIHZhciB4O1xuICBmb3IgKHggPSAwOyB4IDwgZGlmZnMubGVuZ3RoOyB4KyspIHtcbiAgICBpZiAoZGlmZnNbeF1bMF0gIT09IERJRkZfSU5TRVJUKSB7ICAvLyBFcXVhbGl0eSBvciBkZWxldGlvbi5cbiAgICAgIGNoYXJzMSArPSBkaWZmc1t4XVsxXS5sZW5ndGg7XG4gICAgfVxuICAgIGlmIChkaWZmc1t4XVswXSAhPT0gRElGRl9ERUxFVEUpIHsgIC8vIEVxdWFsaXR5IG9yIGluc2VydGlvbi5cbiAgICAgIGNoYXJzMiArPSBkaWZmc1t4XVsxXS5sZW5ndGg7XG4gICAgfVxuICAgIGlmIChjaGFyczEgPiBsb2MpIHsgIC8vIE92ZXJzaG90IHRoZSBsb2NhdGlvbi5cbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBsYXN0X2NoYXJzMSA9IGNoYXJzMTtcbiAgICBsYXN0X2NoYXJzMiA9IGNoYXJzMjtcbiAgfVxuICAvLyBXYXMgdGhlIGxvY2F0aW9uIHdhcyBkZWxldGVkP1xuICBpZiAoZGlmZnMubGVuZ3RoICE9IHggJiYgZGlmZnNbeF1bMF0gPT09IERJRkZfREVMRVRFKSB7XG4gICAgcmV0dXJuIGxhc3RfY2hhcnMyO1xuICB9XG4gIC8vIEFkZCB0aGUgcmVtYWluaW5nIGNoYXJhY3RlciBsZW5ndGguXG4gIHJldHVybiBsYXN0X2NoYXJzMiArIChsb2MgLSBsYXN0X2NoYXJzMSk7XG59O1xuXG5cbi8qKlxuICogQ29udmVydCBhIGRpZmYgYXJyYXkgaW50byBhIHByZXR0eSBIVE1MIHJlcG9ydC5cbiAqIEBwYXJhbSB7IUFycmF5LjwhZGlmZl9tYXRjaF9wYXRjaC5EaWZmPn0gZGlmZnMgQXJyYXkgb2YgZGlmZiB0dXBsZXMuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IEhUTUwgcmVwcmVzZW50YXRpb24uXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLmRpZmZfcHJldHR5SHRtbCA9IGZ1bmN0aW9uKGRpZmZzKSB7XG4gIHZhciBodG1sID0gW107XG4gIHZhciBwYXR0ZXJuX2FtcCA9IC8mL2c7XG4gIHZhciBwYXR0ZXJuX2x0ID0gLzwvZztcbiAgdmFyIHBhdHRlcm5fZ3QgPSAvPi9nO1xuICB2YXIgcGF0dGVybl9wYXJhID0gL1xcbi9nO1xuICBmb3IgKHZhciB4ID0gMDsgeCA8IGRpZmZzLmxlbmd0aDsgeCsrKSB7XG4gICAgdmFyIG9wID0gZGlmZnNbeF1bMF07ICAgIC8vIE9wZXJhdGlvbiAoaW5zZXJ0LCBkZWxldGUsIGVxdWFsKVxuICAgIHZhciBkYXRhID0gZGlmZnNbeF1bMV07ICAvLyBUZXh0IG9mIGNoYW5nZS5cbiAgICB2YXIgdGV4dCA9IGRhdGEucmVwbGFjZShwYXR0ZXJuX2FtcCwgJyZhbXA7JykucmVwbGFjZShwYXR0ZXJuX2x0LCAnJmx0OycpXG4gICAgICAgIC5yZXBsYWNlKHBhdHRlcm5fZ3QsICcmZ3Q7JykucmVwbGFjZShwYXR0ZXJuX3BhcmEsICcmcGFyYTs8YnI+Jyk7XG4gICAgc3dpdGNoIChvcCkge1xuICAgICAgY2FzZSBESUZGX0lOU0VSVDpcbiAgICAgICAgaHRtbFt4XSA9ICc8aW5zIHN0eWxlPVwiYmFja2dyb3VuZDojZTZmZmU2O1wiPicgKyB0ZXh0ICsgJzwvaW5zPic7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBESUZGX0RFTEVURTpcbiAgICAgICAgaHRtbFt4XSA9ICc8ZGVsIHN0eWxlPVwiYmFja2dyb3VuZDojZmZlNmU2O1wiPicgKyB0ZXh0ICsgJzwvZGVsPic7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBESUZGX0VRVUFMOlxuICAgICAgICBodG1sW3hdID0gJzxzcGFuPicgKyB0ZXh0ICsgJzwvc3Bhbj4nO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGh0bWwuam9pbignJyk7XG59O1xuXG5cbi8qKlxuICogQ29tcHV0ZSBhbmQgcmV0dXJuIHRoZSBzb3VyY2UgdGV4dCAoYWxsIGVxdWFsaXRpZXMgYW5kIGRlbGV0aW9ucykuXG4gKiBAcGFyYW0geyFBcnJheS48IWRpZmZfbWF0Y2hfcGF0Y2guRGlmZj59IGRpZmZzIEFycmF5IG9mIGRpZmYgdHVwbGVzLlxuICogQHJldHVybiB7c3RyaW5nfSBTb3VyY2UgdGV4dC5cbiAqL1xuZGlmZl9tYXRjaF9wYXRjaC5wcm90b3R5cGUuZGlmZl90ZXh0MSA9IGZ1bmN0aW9uKGRpZmZzKSB7XG4gIHZhciB0ZXh0ID0gW107XG4gIGZvciAodmFyIHggPSAwOyB4IDwgZGlmZnMubGVuZ3RoOyB4KyspIHtcbiAgICBpZiAoZGlmZnNbeF1bMF0gIT09IERJRkZfSU5TRVJUKSB7XG4gICAgICB0ZXh0W3hdID0gZGlmZnNbeF1bMV07XG4gICAgfVxuICB9XG4gIHJldHVybiB0ZXh0LmpvaW4oJycpO1xufTtcblxuXG4vKipcbiAqIENvbXB1dGUgYW5kIHJldHVybiB0aGUgZGVzdGluYXRpb24gdGV4dCAoYWxsIGVxdWFsaXRpZXMgYW5kIGluc2VydGlvbnMpLlxuICogQHBhcmFtIHshQXJyYXkuPCFkaWZmX21hdGNoX3BhdGNoLkRpZmY+fSBkaWZmcyBBcnJheSBvZiBkaWZmIHR1cGxlcy5cbiAqIEByZXR1cm4ge3N0cmluZ30gRGVzdGluYXRpb24gdGV4dC5cbiAqL1xuZGlmZl9tYXRjaF9wYXRjaC5wcm90b3R5cGUuZGlmZl90ZXh0MiA9IGZ1bmN0aW9uKGRpZmZzKSB7XG4gIHZhciB0ZXh0ID0gW107XG4gIGZvciAodmFyIHggPSAwOyB4IDwgZGlmZnMubGVuZ3RoOyB4KyspIHtcbiAgICBpZiAoZGlmZnNbeF1bMF0gIT09IERJRkZfREVMRVRFKSB7XG4gICAgICB0ZXh0W3hdID0gZGlmZnNbeF1bMV07XG4gICAgfVxuICB9XG4gIHJldHVybiB0ZXh0LmpvaW4oJycpO1xufTtcblxuXG4vKipcbiAqIENvbXB1dGUgdGhlIExldmVuc2h0ZWluIGRpc3RhbmNlOyB0aGUgbnVtYmVyIG9mIGluc2VydGVkLCBkZWxldGVkIG9yXG4gKiBzdWJzdGl0dXRlZCBjaGFyYWN0ZXJzLlxuICogQHBhcmFtIHshQXJyYXkuPCFkaWZmX21hdGNoX3BhdGNoLkRpZmY+fSBkaWZmcyBBcnJheSBvZiBkaWZmIHR1cGxlcy5cbiAqIEByZXR1cm4ge251bWJlcn0gTnVtYmVyIG9mIGNoYW5nZXMuXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLmRpZmZfbGV2ZW5zaHRlaW4gPSBmdW5jdGlvbihkaWZmcykge1xuICB2YXIgbGV2ZW5zaHRlaW4gPSAwO1xuICB2YXIgaW5zZXJ0aW9ucyA9IDA7XG4gIHZhciBkZWxldGlvbnMgPSAwO1xuICBmb3IgKHZhciB4ID0gMDsgeCA8IGRpZmZzLmxlbmd0aDsgeCsrKSB7XG4gICAgdmFyIG9wID0gZGlmZnNbeF1bMF07XG4gICAgdmFyIGRhdGEgPSBkaWZmc1t4XVsxXTtcbiAgICBzd2l0Y2ggKG9wKSB7XG4gICAgICBjYXNlIERJRkZfSU5TRVJUOlxuICAgICAgICBpbnNlcnRpb25zICs9IGRhdGEubGVuZ3RoO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRElGRl9ERUxFVEU6XG4gICAgICAgIGRlbGV0aW9ucyArPSBkYXRhLmxlbmd0aDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERJRkZfRVFVQUw6XG4gICAgICAgIC8vIEEgZGVsZXRpb24gYW5kIGFuIGluc2VydGlvbiBpcyBvbmUgc3Vic3RpdHV0aW9uLlxuICAgICAgICBsZXZlbnNodGVpbiArPSBNYXRoLm1heChpbnNlcnRpb25zLCBkZWxldGlvbnMpO1xuICAgICAgICBpbnNlcnRpb25zID0gMDtcbiAgICAgICAgZGVsZXRpb25zID0gMDtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGxldmVuc2h0ZWluICs9IE1hdGgubWF4KGluc2VydGlvbnMsIGRlbGV0aW9ucyk7XG4gIHJldHVybiBsZXZlbnNodGVpbjtcbn07XG5cblxuLyoqXG4gKiBDcnVzaCB0aGUgZGlmZiBpbnRvIGFuIGVuY29kZWQgc3RyaW5nIHdoaWNoIGRlc2NyaWJlcyB0aGUgb3BlcmF0aW9uc1xuICogcmVxdWlyZWQgdG8gdHJhbnNmb3JtIHRleHQxIGludG8gdGV4dDIuXG4gKiBFLmcuID0zXFx0LTJcXHQraW5nICAtPiBLZWVwIDMgY2hhcnMsIGRlbGV0ZSAyIGNoYXJzLCBpbnNlcnQgJ2luZycuXG4gKiBPcGVyYXRpb25zIGFyZSB0YWItc2VwYXJhdGVkLiAgSW5zZXJ0ZWQgdGV4dCBpcyBlc2NhcGVkIHVzaW5nICV4eCBub3RhdGlvbi5cbiAqIEBwYXJhbSB7IUFycmF5LjwhZGlmZl9tYXRjaF9wYXRjaC5EaWZmPn0gZGlmZnMgQXJyYXkgb2YgZGlmZiB0dXBsZXMuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IERlbHRhIHRleHQuXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLmRpZmZfdG9EZWx0YSA9IGZ1bmN0aW9uKGRpZmZzKSB7XG4gIHZhciB0ZXh0ID0gW107XG4gIGZvciAodmFyIHggPSAwOyB4IDwgZGlmZnMubGVuZ3RoOyB4KyspIHtcbiAgICBzd2l0Y2ggKGRpZmZzW3hdWzBdKSB7XG4gICAgICBjYXNlIERJRkZfSU5TRVJUOlxuICAgICAgICB0ZXh0W3hdID0gJysnICsgZW5jb2RlVVJJKGRpZmZzW3hdWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERJRkZfREVMRVRFOlxuICAgICAgICB0ZXh0W3hdID0gJy0nICsgZGlmZnNbeF1bMV0ubGVuZ3RoO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRElGRl9FUVVBTDpcbiAgICAgICAgdGV4dFt4XSA9ICc9JyArIGRpZmZzW3hdWzFdLmxlbmd0aDtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiB0ZXh0LmpvaW4oJ1xcdCcpLnJlcGxhY2UoLyUyMC9nLCAnICcpO1xufTtcblxuXG4vKipcbiAqIEdpdmVuIHRoZSBvcmlnaW5hbCB0ZXh0MSwgYW5kIGFuIGVuY29kZWQgc3RyaW5nIHdoaWNoIGRlc2NyaWJlcyB0aGVcbiAqIG9wZXJhdGlvbnMgcmVxdWlyZWQgdG8gdHJhbnNmb3JtIHRleHQxIGludG8gdGV4dDIsIGNvbXB1dGUgdGhlIGZ1bGwgZGlmZi5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MSBTb3VyY2Ugc3RyaW5nIGZvciB0aGUgZGlmZi5cbiAqIEBwYXJhbSB7c3RyaW5nfSBkZWx0YSBEZWx0YSB0ZXh0LlxuICogQHJldHVybiB7IUFycmF5LjwhZGlmZl9tYXRjaF9wYXRjaC5EaWZmPn0gQXJyYXkgb2YgZGlmZiB0dXBsZXMuXG4gKiBAdGhyb3dzIHshRXJyb3J9IElmIGludmFsaWQgaW5wdXQuXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLmRpZmZfZnJvbURlbHRhID0gZnVuY3Rpb24odGV4dDEsIGRlbHRhKSB7XG4gIHZhciBkaWZmcyA9IFtdO1xuICB2YXIgZGlmZnNMZW5ndGggPSAwOyAgLy8gS2VlcGluZyBvdXIgb3duIGxlbmd0aCB2YXIgaXMgZmFzdGVyIGluIEpTLlxuICB2YXIgcG9pbnRlciA9IDA7ICAvLyBDdXJzb3IgaW4gdGV4dDFcbiAgdmFyIHRva2VucyA9IGRlbHRhLnNwbGl0KC9cXHQvZyk7XG4gIGZvciAodmFyIHggPSAwOyB4IDwgdG9rZW5zLmxlbmd0aDsgeCsrKSB7XG4gICAgLy8gRWFjaCB0b2tlbiBiZWdpbnMgd2l0aCBhIG9uZSBjaGFyYWN0ZXIgcGFyYW1ldGVyIHdoaWNoIHNwZWNpZmllcyB0aGVcbiAgICAvLyBvcGVyYXRpb24gb2YgdGhpcyB0b2tlbiAoZGVsZXRlLCBpbnNlcnQsIGVxdWFsaXR5KS5cbiAgICB2YXIgcGFyYW0gPSB0b2tlbnNbeF0uc3Vic3RyaW5nKDEpO1xuICAgIHN3aXRjaCAodG9rZW5zW3hdLmNoYXJBdCgwKSkge1xuICAgICAgY2FzZSAnKyc6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZGlmZnNbZGlmZnNMZW5ndGgrK10gPSBbRElGRl9JTlNFUlQsIGRlY29kZVVSSShwYXJhbSldO1xuICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgIC8vIE1hbGZvcm1lZCBVUkkgc2VxdWVuY2UuXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbGxlZ2FsIGVzY2FwZSBpbiBkaWZmX2Zyb21EZWx0YTogJyArIHBhcmFtKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJy0nOlxuICAgICAgICAvLyBGYWxsIHRocm91Z2guXG4gICAgICBjYXNlICc9JzpcbiAgICAgICAgdmFyIG4gPSBwYXJzZUludChwYXJhbSwgMTApO1xuICAgICAgICBpZiAoaXNOYU4obikgfHwgbiA8IDApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgbnVtYmVyIGluIGRpZmZfZnJvbURlbHRhOiAnICsgcGFyYW0pO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0ZXh0ID0gdGV4dDEuc3Vic3RyaW5nKHBvaW50ZXIsIHBvaW50ZXIgKz0gbik7XG4gICAgICAgIGlmICh0b2tlbnNbeF0uY2hhckF0KDApID09ICc9Jykge1xuICAgICAgICAgIGRpZmZzW2RpZmZzTGVuZ3RoKytdID0gW0RJRkZfRVFVQUwsIHRleHRdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRpZmZzW2RpZmZzTGVuZ3RoKytdID0gW0RJRkZfREVMRVRFLCB0ZXh0XTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIEJsYW5rIHRva2VucyBhcmUgb2sgKGZyb20gYSB0cmFpbGluZyBcXHQpLlxuICAgICAgICAvLyBBbnl0aGluZyBlbHNlIGlzIGFuIGVycm9yLlxuICAgICAgICBpZiAodG9rZW5zW3hdKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGRpZmYgb3BlcmF0aW9uIGluIGRpZmZfZnJvbURlbHRhOiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zW3hdKTtcbiAgICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAocG9pbnRlciAhPSB0ZXh0MS5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0RlbHRhIGxlbmd0aCAoJyArIHBvaW50ZXIgK1xuICAgICAgICAnKSBkb2VzIG5vdCBlcXVhbCBzb3VyY2UgdGV4dCBsZW5ndGggKCcgKyB0ZXh0MS5sZW5ndGggKyAnKS4nKTtcbiAgfVxuICByZXR1cm4gZGlmZnM7XG59O1xuXG5cbi8vICBNQVRDSCBGVU5DVElPTlNcblxuXG4vKipcbiAqIExvY2F0ZSB0aGUgYmVzdCBpbnN0YW5jZSBvZiAncGF0dGVybicgaW4gJ3RleHQnIG5lYXIgJ2xvYycuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dCBUaGUgdGV4dCB0byBzZWFyY2guXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0dGVybiBUaGUgcGF0dGVybiB0byBzZWFyY2ggZm9yLlxuICogQHBhcmFtIHtudW1iZXJ9IGxvYyBUaGUgbG9jYXRpb24gdG8gc2VhcmNoIGFyb3VuZC5cbiAqIEByZXR1cm4ge251bWJlcn0gQmVzdCBtYXRjaCBpbmRleCBvciAtMS5cbiAqL1xuZGlmZl9tYXRjaF9wYXRjaC5wcm90b3R5cGUubWF0Y2hfbWFpbiA9IGZ1bmN0aW9uKHRleHQsIHBhdHRlcm4sIGxvYykge1xuICAvLyBDaGVjayBmb3IgbnVsbCBpbnB1dHMuXG4gIGlmICh0ZXh0ID09IG51bGwgfHwgcGF0dGVybiA9PSBudWxsIHx8IGxvYyA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOdWxsIGlucHV0LiAobWF0Y2hfbWFpbiknKTtcbiAgfVxuXG4gIGxvYyA9IE1hdGgubWF4KDAsIE1hdGgubWluKGxvYywgdGV4dC5sZW5ndGgpKTtcbiAgaWYgKHRleHQgPT0gcGF0dGVybikge1xuICAgIC8vIFNob3J0Y3V0IChwb3RlbnRpYWxseSBub3QgZ3VhcmFudGVlZCBieSB0aGUgYWxnb3JpdGhtKVxuICAgIHJldHVybiAwO1xuICB9IGVsc2UgaWYgKCF0ZXh0Lmxlbmd0aCkge1xuICAgIC8vIE5vdGhpbmcgdG8gbWF0Y2guXG4gICAgcmV0dXJuIC0xO1xuICB9IGVsc2UgaWYgKHRleHQuc3Vic3RyaW5nKGxvYywgbG9jICsgcGF0dGVybi5sZW5ndGgpID09IHBhdHRlcm4pIHtcbiAgICAvLyBQZXJmZWN0IG1hdGNoIGF0IHRoZSBwZXJmZWN0IHNwb3QhICAoSW5jbHVkZXMgY2FzZSBvZiBudWxsIHBhdHRlcm4pXG4gICAgcmV0dXJuIGxvYztcbiAgfSBlbHNlIHtcbiAgICAvLyBEbyBhIGZ1enp5IGNvbXBhcmUuXG4gICAgcmV0dXJuIHRoaXMubWF0Y2hfYml0YXBfKHRleHQsIHBhdHRlcm4sIGxvYyk7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBMb2NhdGUgdGhlIGJlc3QgaW5zdGFuY2Ugb2YgJ3BhdHRlcm4nIGluICd0ZXh0JyBuZWFyICdsb2MnIHVzaW5nIHRoZVxuICogQml0YXAgYWxnb3JpdGhtLlxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgVGhlIHRleHQgdG8gc2VhcmNoLlxuICogQHBhcmFtIHtzdHJpbmd9IHBhdHRlcm4gVGhlIHBhdHRlcm4gdG8gc2VhcmNoIGZvci5cbiAqIEBwYXJhbSB7bnVtYmVyfSBsb2MgVGhlIGxvY2F0aW9uIHRvIHNlYXJjaCBhcm91bmQuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IEJlc3QgbWF0Y2ggaW5kZXggb3IgLTEuXG4gKiBAcHJpdmF0ZVxuICovXG5kaWZmX21hdGNoX3BhdGNoLnByb3RvdHlwZS5tYXRjaF9iaXRhcF8gPSBmdW5jdGlvbih0ZXh0LCBwYXR0ZXJuLCBsb2MpIHtcbiAgaWYgKHBhdHRlcm4ubGVuZ3RoID4gdGhpcy5NYXRjaF9NYXhCaXRzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdQYXR0ZXJuIHRvbyBsb25nIGZvciB0aGlzIGJyb3dzZXIuJyk7XG4gIH1cblxuICAvLyBJbml0aWFsaXNlIHRoZSBhbHBoYWJldC5cbiAgdmFyIHMgPSB0aGlzLm1hdGNoX2FscGhhYmV0XyhwYXR0ZXJuKTtcblxuICB2YXIgZG1wID0gdGhpczsgIC8vICd0aGlzJyBiZWNvbWVzICd3aW5kb3cnIGluIGEgY2xvc3VyZS5cblxuICAvKipcbiAgICogQ29tcHV0ZSBhbmQgcmV0dXJuIHRoZSBzY29yZSBmb3IgYSBtYXRjaCB3aXRoIGUgZXJyb3JzIGFuZCB4IGxvY2F0aW9uLlxuICAgKiBBY2Nlc3NlcyBsb2MgYW5kIHBhdHRlcm4gdGhyb3VnaCBiZWluZyBhIGNsb3N1cmUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBlIE51bWJlciBvZiBlcnJvcnMgaW4gbWF0Y2guXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4IExvY2F0aW9uIG9mIG1hdGNoLlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IE92ZXJhbGwgc2NvcmUgZm9yIG1hdGNoICgwLjAgPSBnb29kLCAxLjAgPSBiYWQpLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gbWF0Y2hfYml0YXBTY29yZV8oZSwgeCkge1xuICAgIHZhciBhY2N1cmFjeSA9IGUgLyBwYXR0ZXJuLmxlbmd0aDtcbiAgICB2YXIgcHJveGltaXR5ID0gTWF0aC5hYnMobG9jIC0geCk7XG4gICAgaWYgKCFkbXAuTWF0Y2hfRGlzdGFuY2UpIHtcbiAgICAgIC8vIERvZGdlIGRpdmlkZSBieSB6ZXJvIGVycm9yLlxuICAgICAgcmV0dXJuIHByb3hpbWl0eSA/IDEuMCA6IGFjY3VyYWN5O1xuICAgIH1cbiAgICByZXR1cm4gYWNjdXJhY3kgKyAocHJveGltaXR5IC8gZG1wLk1hdGNoX0Rpc3RhbmNlKTtcbiAgfVxuXG4gIC8vIEhpZ2hlc3Qgc2NvcmUgYmV5b25kIHdoaWNoIHdlIGdpdmUgdXAuXG4gIHZhciBzY29yZV90aHJlc2hvbGQgPSB0aGlzLk1hdGNoX1RocmVzaG9sZDtcbiAgLy8gSXMgdGhlcmUgYSBuZWFyYnkgZXhhY3QgbWF0Y2g/IChzcGVlZHVwKVxuICB2YXIgYmVzdF9sb2MgPSB0ZXh0LmluZGV4T2YocGF0dGVybiwgbG9jKTtcbiAgaWYgKGJlc3RfbG9jICE9IC0xKSB7XG4gICAgc2NvcmVfdGhyZXNob2xkID0gTWF0aC5taW4obWF0Y2hfYml0YXBTY29yZV8oMCwgYmVzdF9sb2MpLCBzY29yZV90aHJlc2hvbGQpO1xuICAgIC8vIFdoYXQgYWJvdXQgaW4gdGhlIG90aGVyIGRpcmVjdGlvbj8gKHNwZWVkdXApXG4gICAgYmVzdF9sb2MgPSB0ZXh0Lmxhc3RJbmRleE9mKHBhdHRlcm4sIGxvYyArIHBhdHRlcm4ubGVuZ3RoKTtcbiAgICBpZiAoYmVzdF9sb2MgIT0gLTEpIHtcbiAgICAgIHNjb3JlX3RocmVzaG9sZCA9XG4gICAgICAgICAgTWF0aC5taW4obWF0Y2hfYml0YXBTY29yZV8oMCwgYmVzdF9sb2MpLCBzY29yZV90aHJlc2hvbGQpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEluaXRpYWxpc2UgdGhlIGJpdCBhcnJheXMuXG4gIHZhciBtYXRjaG1hc2sgPSAxIDw8IChwYXR0ZXJuLmxlbmd0aCAtIDEpO1xuICBiZXN0X2xvYyA9IC0xO1xuXG4gIHZhciBiaW5fbWluLCBiaW5fbWlkO1xuICB2YXIgYmluX21heCA9IHBhdHRlcm4ubGVuZ3RoICsgdGV4dC5sZW5ndGg7XG4gIHZhciBsYXN0X3JkO1xuICBmb3IgKHZhciBkID0gMDsgZCA8IHBhdHRlcm4ubGVuZ3RoOyBkKyspIHtcbiAgICAvLyBTY2FuIGZvciB0aGUgYmVzdCBtYXRjaDsgZWFjaCBpdGVyYXRpb24gYWxsb3dzIGZvciBvbmUgbW9yZSBlcnJvci5cbiAgICAvLyBSdW4gYSBiaW5hcnkgc2VhcmNoIHRvIGRldGVybWluZSBob3cgZmFyIGZyb20gJ2xvYycgd2UgY2FuIHN0cmF5IGF0IHRoaXNcbiAgICAvLyBlcnJvciBsZXZlbC5cbiAgICBiaW5fbWluID0gMDtcbiAgICBiaW5fbWlkID0gYmluX21heDtcbiAgICB3aGlsZSAoYmluX21pbiA8IGJpbl9taWQpIHtcbiAgICAgIGlmIChtYXRjaF9iaXRhcFNjb3JlXyhkLCBsb2MgKyBiaW5fbWlkKSA8PSBzY29yZV90aHJlc2hvbGQpIHtcbiAgICAgICAgYmluX21pbiA9IGJpbl9taWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBiaW5fbWF4ID0gYmluX21pZDtcbiAgICAgIH1cbiAgICAgIGJpbl9taWQgPSBNYXRoLmZsb29yKChiaW5fbWF4IC0gYmluX21pbikgLyAyICsgYmluX21pbik7XG4gICAgfVxuICAgIC8vIFVzZSB0aGUgcmVzdWx0IGZyb20gdGhpcyBpdGVyYXRpb24gYXMgdGhlIG1heGltdW0gZm9yIHRoZSBuZXh0LlxuICAgIGJpbl9tYXggPSBiaW5fbWlkO1xuICAgIHZhciBzdGFydCA9IE1hdGgubWF4KDEsIGxvYyAtIGJpbl9taWQgKyAxKTtcbiAgICB2YXIgZmluaXNoID0gTWF0aC5taW4obG9jICsgYmluX21pZCwgdGV4dC5sZW5ndGgpICsgcGF0dGVybi5sZW5ndGg7XG5cbiAgICB2YXIgcmQgPSBBcnJheShmaW5pc2ggKyAyKTtcbiAgICByZFtmaW5pc2ggKyAxXSA9ICgxIDw8IGQpIC0gMTtcbiAgICBmb3IgKHZhciBqID0gZmluaXNoOyBqID49IHN0YXJ0OyBqLS0pIHtcbiAgICAgIC8vIFRoZSBhbHBoYWJldCAocykgaXMgYSBzcGFyc2UgaGFzaCwgc28gdGhlIGZvbGxvd2luZyBsaW5lIGdlbmVyYXRlc1xuICAgICAgLy8gd2FybmluZ3MuXG4gICAgICB2YXIgY2hhck1hdGNoID0gc1t0ZXh0LmNoYXJBdChqIC0gMSldO1xuICAgICAgaWYgKGQgPT09IDApIHsgIC8vIEZpcnN0IHBhc3M6IGV4YWN0IG1hdGNoLlxuICAgICAgICByZFtqXSA9ICgocmRbaiArIDFdIDw8IDEpIHwgMSkgJiBjaGFyTWF0Y2g7XG4gICAgICB9IGVsc2UgeyAgLy8gU3Vic2VxdWVudCBwYXNzZXM6IGZ1enp5IG1hdGNoLlxuICAgICAgICByZFtqXSA9ICgoKHJkW2ogKyAxXSA8PCAxKSB8IDEpICYgY2hhck1hdGNoKSB8XG4gICAgICAgICAgICAgICAgKCgobGFzdF9yZFtqICsgMV0gfCBsYXN0X3JkW2pdKSA8PCAxKSB8IDEpIHxcbiAgICAgICAgICAgICAgICBsYXN0X3JkW2ogKyAxXTtcbiAgICAgIH1cbiAgICAgIGlmIChyZFtqXSAmIG1hdGNobWFzaykge1xuICAgICAgICB2YXIgc2NvcmUgPSBtYXRjaF9iaXRhcFNjb3JlXyhkLCBqIC0gMSk7XG4gICAgICAgIC8vIFRoaXMgbWF0Y2ggd2lsbCBhbG1vc3QgY2VydGFpbmx5IGJlIGJldHRlciB0aGFuIGFueSBleGlzdGluZyBtYXRjaC5cbiAgICAgICAgLy8gQnV0IGNoZWNrIGFueXdheS5cbiAgICAgICAgaWYgKHNjb3JlIDw9IHNjb3JlX3RocmVzaG9sZCkge1xuICAgICAgICAgIC8vIFRvbGQgeW91IHNvLlxuICAgICAgICAgIHNjb3JlX3RocmVzaG9sZCA9IHNjb3JlO1xuICAgICAgICAgIGJlc3RfbG9jID0gaiAtIDE7XG4gICAgICAgICAgaWYgKGJlc3RfbG9jID4gbG9jKSB7XG4gICAgICAgICAgICAvLyBXaGVuIHBhc3NpbmcgbG9jLCBkb24ndCBleGNlZWQgb3VyIGN1cnJlbnQgZGlzdGFuY2UgZnJvbSBsb2MuXG4gICAgICAgICAgICBzdGFydCA9IE1hdGgubWF4KDEsIDIgKiBsb2MgLSBiZXN0X2xvYyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEFscmVhZHkgcGFzc2VkIGxvYywgZG93bmhpbGwgZnJvbSBoZXJlIG9uIGluLlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8vIE5vIGhvcGUgZm9yIGEgKGJldHRlcikgbWF0Y2ggYXQgZ3JlYXRlciBlcnJvciBsZXZlbHMuXG4gICAgaWYgKG1hdGNoX2JpdGFwU2NvcmVfKGQgKyAxLCBsb2MpID4gc2NvcmVfdGhyZXNob2xkKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgbGFzdF9yZCA9IHJkO1xuICB9XG4gIHJldHVybiBiZXN0X2xvYztcbn07XG5cblxuLyoqXG4gKiBJbml0aWFsaXNlIHRoZSBhbHBoYWJldCBmb3IgdGhlIEJpdGFwIGFsZ29yaXRobS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXR0ZXJuIFRoZSB0ZXh0IHRvIGVuY29kZS5cbiAqIEByZXR1cm4geyFPYmplY3R9IEhhc2ggb2YgY2hhcmFjdGVyIGxvY2F0aW9ucy5cbiAqIEBwcml2YXRlXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLm1hdGNoX2FscGhhYmV0XyA9IGZ1bmN0aW9uKHBhdHRlcm4pIHtcbiAgdmFyIHMgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXR0ZXJuLmxlbmd0aDsgaSsrKSB7XG4gICAgc1twYXR0ZXJuLmNoYXJBdChpKV0gPSAwO1xuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0dGVybi5sZW5ndGg7IGkrKykge1xuICAgIHNbcGF0dGVybi5jaGFyQXQoaSldIHw9IDEgPDwgKHBhdHRlcm4ubGVuZ3RoIC0gaSAtIDEpO1xuICB9XG4gIHJldHVybiBzO1xufTtcblxuXG4vLyAgUEFUQ0ggRlVOQ1RJT05TXG5cblxuLyoqXG4gKiBJbmNyZWFzZSB0aGUgY29udGV4dCB1bnRpbCBpdCBpcyB1bmlxdWUsXG4gKiBidXQgZG9uJ3QgbGV0IHRoZSBwYXR0ZXJuIGV4cGFuZCBiZXlvbmQgTWF0Y2hfTWF4Qml0cy5cbiAqIEBwYXJhbSB7IWRpZmZfbWF0Y2hfcGF0Y2gucGF0Y2hfb2JqfSBwYXRjaCBUaGUgcGF0Y2ggdG8gZ3Jvdy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFNvdXJjZSB0ZXh0LlxuICogQHByaXZhdGVcbiAqL1xuZGlmZl9tYXRjaF9wYXRjaC5wcm90b3R5cGUucGF0Y2hfYWRkQ29udGV4dF8gPSBmdW5jdGlvbihwYXRjaCwgdGV4dCkge1xuICBpZiAodGV4dC5sZW5ndGggPT0gMCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgcGF0dGVybiA9IHRleHQuc3Vic3RyaW5nKHBhdGNoLnN0YXJ0MiwgcGF0Y2guc3RhcnQyICsgcGF0Y2gubGVuZ3RoMSk7XG4gIHZhciBwYWRkaW5nID0gMDtcblxuICAvLyBMb29rIGZvciB0aGUgZmlyc3QgYW5kIGxhc3QgbWF0Y2hlcyBvZiBwYXR0ZXJuIGluIHRleHQuICBJZiB0d28gZGlmZmVyZW50XG4gIC8vIG1hdGNoZXMgYXJlIGZvdW5kLCBpbmNyZWFzZSB0aGUgcGF0dGVybiBsZW5ndGguXG4gIHdoaWxlICh0ZXh0LmluZGV4T2YocGF0dGVybikgIT0gdGV4dC5sYXN0SW5kZXhPZihwYXR0ZXJuKSAmJlxuICAgICAgICAgcGF0dGVybi5sZW5ndGggPCB0aGlzLk1hdGNoX01heEJpdHMgLSB0aGlzLlBhdGNoX01hcmdpbiAtXG4gICAgICAgICB0aGlzLlBhdGNoX01hcmdpbikge1xuICAgIHBhZGRpbmcgKz0gdGhpcy5QYXRjaF9NYXJnaW47XG4gICAgcGF0dGVybiA9IHRleHQuc3Vic3RyaW5nKHBhdGNoLnN0YXJ0MiAtIHBhZGRpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGNoLnN0YXJ0MiArIHBhdGNoLmxlbmd0aDEgKyBwYWRkaW5nKTtcbiAgfVxuICAvLyBBZGQgb25lIGNodW5rIGZvciBnb29kIGx1Y2suXG4gIHBhZGRpbmcgKz0gdGhpcy5QYXRjaF9NYXJnaW47XG5cbiAgLy8gQWRkIHRoZSBwcmVmaXguXG4gIHZhciBwcmVmaXggPSB0ZXh0LnN1YnN0cmluZyhwYXRjaC5zdGFydDIgLSBwYWRkaW5nLCBwYXRjaC5zdGFydDIpO1xuICBpZiAocHJlZml4KSB7XG4gICAgcGF0Y2guZGlmZnMudW5zaGlmdChbRElGRl9FUVVBTCwgcHJlZml4XSk7XG4gIH1cbiAgLy8gQWRkIHRoZSBzdWZmaXguXG4gIHZhciBzdWZmaXggPSB0ZXh0LnN1YnN0cmluZyhwYXRjaC5zdGFydDIgKyBwYXRjaC5sZW5ndGgxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0Y2guc3RhcnQyICsgcGF0Y2gubGVuZ3RoMSArIHBhZGRpbmcpO1xuICBpZiAoc3VmZml4KSB7XG4gICAgcGF0Y2guZGlmZnMucHVzaChbRElGRl9FUVVBTCwgc3VmZml4XSk7XG4gIH1cblxuICAvLyBSb2xsIGJhY2sgdGhlIHN0YXJ0IHBvaW50cy5cbiAgcGF0Y2guc3RhcnQxIC09IHByZWZpeC5sZW5ndGg7XG4gIHBhdGNoLnN0YXJ0MiAtPSBwcmVmaXgubGVuZ3RoO1xuICAvLyBFeHRlbmQgdGhlIGxlbmd0aHMuXG4gIHBhdGNoLmxlbmd0aDEgKz0gcHJlZml4Lmxlbmd0aCArIHN1ZmZpeC5sZW5ndGg7XG4gIHBhdGNoLmxlbmd0aDIgKz0gcHJlZml4Lmxlbmd0aCArIHN1ZmZpeC5sZW5ndGg7XG59O1xuXG5cbi8qKlxuICogQ29tcHV0ZSBhIGxpc3Qgb2YgcGF0Y2hlcyB0byB0dXJuIHRleHQxIGludG8gdGV4dDIuXG4gKiBVc2UgZGlmZnMgaWYgcHJvdmlkZWQsIG90aGVyd2lzZSBjb21wdXRlIGl0IG91cnNlbHZlcy5cbiAqIFRoZXJlIGFyZSBmb3VyIHdheXMgdG8gY2FsbCB0aGlzIGZ1bmN0aW9uLCBkZXBlbmRpbmcgb24gd2hhdCBkYXRhIGlzXG4gKiBhdmFpbGFibGUgdG8gdGhlIGNhbGxlcjpcbiAqIE1ldGhvZCAxOlxuICogYSA9IHRleHQxLCBiID0gdGV4dDJcbiAqIE1ldGhvZCAyOlxuICogYSA9IGRpZmZzXG4gKiBNZXRob2QgMyAob3B0aW1hbCk6XG4gKiBhID0gdGV4dDEsIGIgPSBkaWZmc1xuICogTWV0aG9kIDQgKGRlcHJlY2F0ZWQsIHVzZSBtZXRob2QgMyk6XG4gKiBhID0gdGV4dDEsIGIgPSB0ZXh0MiwgYyA9IGRpZmZzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd8IUFycmF5LjwhZGlmZl9tYXRjaF9wYXRjaC5EaWZmPn0gYSB0ZXh0MSAobWV0aG9kcyAxLDMsNCkgb3JcbiAqIEFycmF5IG9mIGRpZmYgdHVwbGVzIGZvciB0ZXh0MSB0byB0ZXh0MiAobWV0aG9kIDIpLlxuICogQHBhcmFtIHtzdHJpbmd8IUFycmF5LjwhZGlmZl9tYXRjaF9wYXRjaC5EaWZmPn0gb3B0X2IgdGV4dDIgKG1ldGhvZHMgMSw0KSBvclxuICogQXJyYXkgb2YgZGlmZiB0dXBsZXMgZm9yIHRleHQxIHRvIHRleHQyIChtZXRob2QgMykgb3IgdW5kZWZpbmVkIChtZXRob2QgMikuXG4gKiBAcGFyYW0ge3N0cmluZ3whQXJyYXkuPCFkaWZmX21hdGNoX3BhdGNoLkRpZmY+fSBvcHRfYyBBcnJheSBvZiBkaWZmIHR1cGxlc1xuICogZm9yIHRleHQxIHRvIHRleHQyIChtZXRob2QgNCkgb3IgdW5kZWZpbmVkIChtZXRob2RzIDEsMiwzKS5cbiAqIEByZXR1cm4geyFBcnJheS48IWRpZmZfbWF0Y2hfcGF0Y2gucGF0Y2hfb2JqPn0gQXJyYXkgb2YgUGF0Y2ggb2JqZWN0cy5cbiAqL1xuZGlmZl9tYXRjaF9wYXRjaC5wcm90b3R5cGUucGF0Y2hfbWFrZSA9IGZ1bmN0aW9uKGEsIG9wdF9iLCBvcHRfYykge1xuICB2YXIgdGV4dDEsIGRpZmZzO1xuICBpZiAodHlwZW9mIGEgPT0gJ3N0cmluZycgJiYgdHlwZW9mIG9wdF9iID09ICdzdHJpbmcnICYmXG4gICAgICB0eXBlb2Ygb3B0X2MgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBNZXRob2QgMTogdGV4dDEsIHRleHQyXG4gICAgLy8gQ29tcHV0ZSBkaWZmcyBmcm9tIHRleHQxIGFuZCB0ZXh0Mi5cbiAgICB0ZXh0MSA9IC8qKiBAdHlwZSB7c3RyaW5nfSAqLyhhKTtcbiAgICBkaWZmcyA9IHRoaXMuZGlmZl9tYWluKHRleHQxLCAvKiogQHR5cGUge3N0cmluZ30gKi8ob3B0X2IpLCB0cnVlKTtcbiAgICBpZiAoZGlmZnMubGVuZ3RoID4gMikge1xuICAgICAgdGhpcy5kaWZmX2NsZWFudXBTZW1hbnRpYyhkaWZmcyk7XG4gICAgICB0aGlzLmRpZmZfY2xlYW51cEVmZmljaWVuY3koZGlmZnMpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChhICYmIHR5cGVvZiBhID09ICdvYmplY3QnICYmIHR5cGVvZiBvcHRfYiA9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgdHlwZW9mIG9wdF9jID09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gTWV0aG9kIDI6IGRpZmZzXG4gICAgLy8gQ29tcHV0ZSB0ZXh0MSBmcm9tIGRpZmZzLlxuICAgIGRpZmZzID0gLyoqIEB0eXBlIHshQXJyYXkuPCFkaWZmX21hdGNoX3BhdGNoLkRpZmY+fSAqLyhhKTtcbiAgICB0ZXh0MSA9IHRoaXMuZGlmZl90ZXh0MShkaWZmcyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGEgPT0gJ3N0cmluZycgJiYgb3B0X2IgJiYgdHlwZW9mIG9wdF9iID09ICdvYmplY3QnICYmXG4gICAgICB0eXBlb2Ygb3B0X2MgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBNZXRob2QgMzogdGV4dDEsIGRpZmZzXG4gICAgdGV4dDEgPSAvKiogQHR5cGUge3N0cmluZ30gKi8oYSk7XG4gICAgZGlmZnMgPSAvKiogQHR5cGUgeyFBcnJheS48IWRpZmZfbWF0Y2hfcGF0Y2guRGlmZj59ICovKG9wdF9iKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgYSA9PSAnc3RyaW5nJyAmJiB0eXBlb2Ygb3B0X2IgPT0gJ3N0cmluZycgJiZcbiAgICAgIG9wdF9jICYmIHR5cGVvZiBvcHRfYyA9PSAnb2JqZWN0Jykge1xuICAgIC8vIE1ldGhvZCA0OiB0ZXh0MSwgdGV4dDIsIGRpZmZzXG4gICAgLy8gdGV4dDIgaXMgbm90IHVzZWQuXG4gICAgdGV4dDEgPSAvKiogQHR5cGUge3N0cmluZ30gKi8oYSk7XG4gICAgZGlmZnMgPSAvKiogQHR5cGUgeyFBcnJheS48IWRpZmZfbWF0Y2hfcGF0Y2guRGlmZj59ICovKG9wdF9jKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gY2FsbCBmb3JtYXQgdG8gcGF0Y2hfbWFrZS4nKTtcbiAgfVxuXG4gIGlmIChkaWZmcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gW107ICAvLyBHZXQgcmlkIG9mIHRoZSBudWxsIGNhc2UuXG4gIH1cbiAgdmFyIHBhdGNoZXMgPSBbXTtcbiAgdmFyIHBhdGNoID0gbmV3IGRpZmZfbWF0Y2hfcGF0Y2gucGF0Y2hfb2JqKCk7XG4gIHZhciBwYXRjaERpZmZMZW5ndGggPSAwOyAgLy8gS2VlcGluZyBvdXIgb3duIGxlbmd0aCB2YXIgaXMgZmFzdGVyIGluIEpTLlxuICB2YXIgY2hhcl9jb3VudDEgPSAwOyAgLy8gTnVtYmVyIG9mIGNoYXJhY3RlcnMgaW50byB0aGUgdGV4dDEgc3RyaW5nLlxuICB2YXIgY2hhcl9jb3VudDIgPSAwOyAgLy8gTnVtYmVyIG9mIGNoYXJhY3RlcnMgaW50byB0aGUgdGV4dDIgc3RyaW5nLlxuICAvLyBTdGFydCB3aXRoIHRleHQxIChwcmVwYXRjaF90ZXh0KSBhbmQgYXBwbHkgdGhlIGRpZmZzIHVudGlsIHdlIGFycml2ZSBhdFxuICAvLyB0ZXh0MiAocG9zdHBhdGNoX3RleHQpLiAgV2UgcmVjcmVhdGUgdGhlIHBhdGNoZXMgb25lIGJ5IG9uZSB0byBkZXRlcm1pbmVcbiAgLy8gY29udGV4dCBpbmZvLlxuICB2YXIgcHJlcGF0Y2hfdGV4dCA9IHRleHQxO1xuICB2YXIgcG9zdHBhdGNoX3RleHQgPSB0ZXh0MTtcbiAgZm9yICh2YXIgeCA9IDA7IHggPCBkaWZmcy5sZW5ndGg7IHgrKykge1xuICAgIHZhciBkaWZmX3R5cGUgPSBkaWZmc1t4XVswXTtcbiAgICB2YXIgZGlmZl90ZXh0ID0gZGlmZnNbeF1bMV07XG5cbiAgICBpZiAoIXBhdGNoRGlmZkxlbmd0aCAmJiBkaWZmX3R5cGUgIT09IERJRkZfRVFVQUwpIHtcbiAgICAgIC8vIEEgbmV3IHBhdGNoIHN0YXJ0cyBoZXJlLlxuICAgICAgcGF0Y2guc3RhcnQxID0gY2hhcl9jb3VudDE7XG4gICAgICBwYXRjaC5zdGFydDIgPSBjaGFyX2NvdW50MjtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKGRpZmZfdHlwZSkge1xuICAgICAgY2FzZSBESUZGX0lOU0VSVDpcbiAgICAgICAgcGF0Y2guZGlmZnNbcGF0Y2hEaWZmTGVuZ3RoKytdID0gZGlmZnNbeF07XG4gICAgICAgIHBhdGNoLmxlbmd0aDIgKz0gZGlmZl90ZXh0Lmxlbmd0aDtcbiAgICAgICAgcG9zdHBhdGNoX3RleHQgPSBwb3N0cGF0Y2hfdGV4dC5zdWJzdHJpbmcoMCwgY2hhcl9jb3VudDIpICsgZGlmZl90ZXh0ICtcbiAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0cGF0Y2hfdGV4dC5zdWJzdHJpbmcoY2hhcl9jb3VudDIpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRElGRl9ERUxFVEU6XG4gICAgICAgIHBhdGNoLmxlbmd0aDEgKz0gZGlmZl90ZXh0Lmxlbmd0aDtcbiAgICAgICAgcGF0Y2guZGlmZnNbcGF0Y2hEaWZmTGVuZ3RoKytdID0gZGlmZnNbeF07XG4gICAgICAgIHBvc3RwYXRjaF90ZXh0ID0gcG9zdHBhdGNoX3RleHQuc3Vic3RyaW5nKDAsIGNoYXJfY291bnQyKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgcG9zdHBhdGNoX3RleHQuc3Vic3RyaW5nKGNoYXJfY291bnQyICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlmZl90ZXh0Lmxlbmd0aCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBESUZGX0VRVUFMOlxuICAgICAgICBpZiAoZGlmZl90ZXh0Lmxlbmd0aCA8PSAyICogdGhpcy5QYXRjaF9NYXJnaW4gJiZcbiAgICAgICAgICAgIHBhdGNoRGlmZkxlbmd0aCAmJiBkaWZmcy5sZW5ndGggIT0geCArIDEpIHtcbiAgICAgICAgICAvLyBTbWFsbCBlcXVhbGl0eSBpbnNpZGUgYSBwYXRjaC5cbiAgICAgICAgICBwYXRjaC5kaWZmc1twYXRjaERpZmZMZW5ndGgrK10gPSBkaWZmc1t4XTtcbiAgICAgICAgICBwYXRjaC5sZW5ndGgxICs9IGRpZmZfdGV4dC5sZW5ndGg7XG4gICAgICAgICAgcGF0Y2gubGVuZ3RoMiArPSBkaWZmX3RleHQubGVuZ3RoO1xuICAgICAgICB9IGVsc2UgaWYgKGRpZmZfdGV4dC5sZW5ndGggPj0gMiAqIHRoaXMuUGF0Y2hfTWFyZ2luKSB7XG4gICAgICAgICAgLy8gVGltZSBmb3IgYSBuZXcgcGF0Y2guXG4gICAgICAgICAgaWYgKHBhdGNoRGlmZkxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5wYXRjaF9hZGRDb250ZXh0XyhwYXRjaCwgcHJlcGF0Y2hfdGV4dCk7XG4gICAgICAgICAgICBwYXRjaGVzLnB1c2gocGF0Y2gpO1xuICAgICAgICAgICAgcGF0Y2ggPSBuZXcgZGlmZl9tYXRjaF9wYXRjaC5wYXRjaF9vYmooKTtcbiAgICAgICAgICAgIHBhdGNoRGlmZkxlbmd0aCA9IDA7XG4gICAgICAgICAgICAvLyBVbmxpa2UgVW5pZGlmZiwgb3VyIHBhdGNoIGxpc3RzIGhhdmUgYSByb2xsaW5nIGNvbnRleHQuXG4gICAgICAgICAgICAvLyBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvZ29vZ2xlLWRpZmYtbWF0Y2gtcGF0Y2gvd2lraS9VbmlkaWZmXG4gICAgICAgICAgICAvLyBVcGRhdGUgcHJlcGF0Y2ggdGV4dCAmIHBvcyB0byByZWZsZWN0IHRoZSBhcHBsaWNhdGlvbiBvZiB0aGVcbiAgICAgICAgICAgIC8vIGp1c3QgY29tcGxldGVkIHBhdGNoLlxuICAgICAgICAgICAgcHJlcGF0Y2hfdGV4dCA9IHBvc3RwYXRjaF90ZXh0O1xuICAgICAgICAgICAgY2hhcl9jb3VudDEgPSBjaGFyX2NvdW50MjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIHRoZSBjdXJyZW50IGNoYXJhY3RlciBjb3VudC5cbiAgICBpZiAoZGlmZl90eXBlICE9PSBESUZGX0lOU0VSVCkge1xuICAgICAgY2hhcl9jb3VudDEgKz0gZGlmZl90ZXh0Lmxlbmd0aDtcbiAgICB9XG4gICAgaWYgKGRpZmZfdHlwZSAhPT0gRElGRl9ERUxFVEUpIHtcbiAgICAgIGNoYXJfY291bnQyICs9IGRpZmZfdGV4dC5sZW5ndGg7XG4gICAgfVxuICB9XG4gIC8vIFBpY2sgdXAgdGhlIGxlZnRvdmVyIHBhdGNoIGlmIG5vdCBlbXB0eS5cbiAgaWYgKHBhdGNoRGlmZkxlbmd0aCkge1xuICAgIHRoaXMucGF0Y2hfYWRkQ29udGV4dF8ocGF0Y2gsIHByZXBhdGNoX3RleHQpO1xuICAgIHBhdGNoZXMucHVzaChwYXRjaCk7XG4gIH1cblxuICByZXR1cm4gcGF0Y2hlcztcbn07XG5cblxuLyoqXG4gKiBHaXZlbiBhbiBhcnJheSBvZiBwYXRjaGVzLCByZXR1cm4gYW5vdGhlciBhcnJheSB0aGF0IGlzIGlkZW50aWNhbC5cbiAqIEBwYXJhbSB7IUFycmF5LjwhZGlmZl9tYXRjaF9wYXRjaC5wYXRjaF9vYmo+fSBwYXRjaGVzIEFycmF5IG9mIFBhdGNoIG9iamVjdHMuXG4gKiBAcmV0dXJuIHshQXJyYXkuPCFkaWZmX21hdGNoX3BhdGNoLnBhdGNoX29iaj59IEFycmF5IG9mIFBhdGNoIG9iamVjdHMuXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLnBhdGNoX2RlZXBDb3B5ID0gZnVuY3Rpb24ocGF0Y2hlcykge1xuICAvLyBNYWtpbmcgZGVlcCBjb3BpZXMgaXMgaGFyZCBpbiBKYXZhU2NyaXB0LlxuICB2YXIgcGF0Y2hlc0NvcHkgPSBbXTtcbiAgZm9yICh2YXIgeCA9IDA7IHggPCBwYXRjaGVzLmxlbmd0aDsgeCsrKSB7XG4gICAgdmFyIHBhdGNoID0gcGF0Y2hlc1t4XTtcbiAgICB2YXIgcGF0Y2hDb3B5ID0gbmV3IGRpZmZfbWF0Y2hfcGF0Y2gucGF0Y2hfb2JqKCk7XG4gICAgcGF0Y2hDb3B5LmRpZmZzID0gW107XG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBwYXRjaC5kaWZmcy5sZW5ndGg7IHkrKykge1xuICAgICAgcGF0Y2hDb3B5LmRpZmZzW3ldID0gcGF0Y2guZGlmZnNbeV0uc2xpY2UoKTtcbiAgICB9XG4gICAgcGF0Y2hDb3B5LnN0YXJ0MSA9IHBhdGNoLnN0YXJ0MTtcbiAgICBwYXRjaENvcHkuc3RhcnQyID0gcGF0Y2guc3RhcnQyO1xuICAgIHBhdGNoQ29weS5sZW5ndGgxID0gcGF0Y2gubGVuZ3RoMTtcbiAgICBwYXRjaENvcHkubGVuZ3RoMiA9IHBhdGNoLmxlbmd0aDI7XG4gICAgcGF0Y2hlc0NvcHlbeF0gPSBwYXRjaENvcHk7XG4gIH1cbiAgcmV0dXJuIHBhdGNoZXNDb3B5O1xufTtcblxuXG4vKipcbiAqIE1lcmdlIGEgc2V0IG9mIHBhdGNoZXMgb250byB0aGUgdGV4dC4gIFJldHVybiBhIHBhdGNoZWQgdGV4dCwgYXMgd2VsbFxuICogYXMgYSBsaXN0IG9mIHRydWUvZmFsc2UgdmFsdWVzIGluZGljYXRpbmcgd2hpY2ggcGF0Y2hlcyB3ZXJlIGFwcGxpZWQuXG4gKiBAcGFyYW0geyFBcnJheS48IWRpZmZfbWF0Y2hfcGF0Y2gucGF0Y2hfb2JqPn0gcGF0Y2hlcyBBcnJheSBvZiBQYXRjaCBvYmplY3RzLlxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgT2xkIHRleHQuXG4gKiBAcmV0dXJuIHshQXJyYXkuPHN0cmluZ3whQXJyYXkuPGJvb2xlYW4+Pn0gVHdvIGVsZW1lbnQgQXJyYXksIGNvbnRhaW5pbmcgdGhlXG4gKiAgICAgIG5ldyB0ZXh0IGFuZCBhbiBhcnJheSBvZiBib29sZWFuIHZhbHVlcy5cbiAqL1xuZGlmZl9tYXRjaF9wYXRjaC5wcm90b3R5cGUucGF0Y2hfYXBwbHkgPSBmdW5jdGlvbihwYXRjaGVzLCB0ZXh0KSB7XG4gIGlmIChwYXRjaGVzLmxlbmd0aCA9PSAwKSB7XG4gICAgcmV0dXJuIFt0ZXh0LCBbXV07XG4gIH1cblxuICAvLyBEZWVwIGNvcHkgdGhlIHBhdGNoZXMgc28gdGhhdCBubyBjaGFuZ2VzIGFyZSBtYWRlIHRvIG9yaWdpbmFscy5cbiAgcGF0Y2hlcyA9IHRoaXMucGF0Y2hfZGVlcENvcHkocGF0Y2hlcyk7XG5cbiAgdmFyIG51bGxQYWRkaW5nID0gdGhpcy5wYXRjaF9hZGRQYWRkaW5nKHBhdGNoZXMpO1xuICB0ZXh0ID0gbnVsbFBhZGRpbmcgKyB0ZXh0ICsgbnVsbFBhZGRpbmc7XG5cbiAgdGhpcy5wYXRjaF9zcGxpdE1heChwYXRjaGVzKTtcbiAgLy8gZGVsdGEga2VlcHMgdHJhY2sgb2YgdGhlIG9mZnNldCBiZXR3ZWVuIHRoZSBleHBlY3RlZCBhbmQgYWN0dWFsIGxvY2F0aW9uXG4gIC8vIG9mIHRoZSBwcmV2aW91cyBwYXRjaC4gIElmIHRoZXJlIGFyZSBwYXRjaGVzIGV4cGVjdGVkIGF0IHBvc2l0aW9ucyAxMCBhbmRcbiAgLy8gMjAsIGJ1dCB0aGUgZmlyc3QgcGF0Y2ggd2FzIGZvdW5kIGF0IDEyLCBkZWx0YSBpcyAyIGFuZCB0aGUgc2Vjb25kIHBhdGNoXG4gIC8vIGhhcyBhbiBlZmZlY3RpdmUgZXhwZWN0ZWQgcG9zaXRpb24gb2YgMjIuXG4gIHZhciBkZWx0YSA9IDA7XG4gIHZhciByZXN1bHRzID0gW107XG4gIGZvciAodmFyIHggPSAwOyB4IDwgcGF0Y2hlcy5sZW5ndGg7IHgrKykge1xuICAgIHZhciBleHBlY3RlZF9sb2MgPSBwYXRjaGVzW3hdLnN0YXJ0MiArIGRlbHRhO1xuICAgIHZhciB0ZXh0MSA9IHRoaXMuZGlmZl90ZXh0MShwYXRjaGVzW3hdLmRpZmZzKTtcbiAgICB2YXIgc3RhcnRfbG9jO1xuICAgIHZhciBlbmRfbG9jID0gLTE7XG4gICAgaWYgKHRleHQxLmxlbmd0aCA+IHRoaXMuTWF0Y2hfTWF4Qml0cykge1xuICAgICAgLy8gcGF0Y2hfc3BsaXRNYXggd2lsbCBvbmx5IHByb3ZpZGUgYW4gb3ZlcnNpemVkIHBhdHRlcm4gaW4gdGhlIGNhc2Ugb2ZcbiAgICAgIC8vIGEgbW9uc3RlciBkZWxldGUuXG4gICAgICBzdGFydF9sb2MgPSB0aGlzLm1hdGNoX21haW4odGV4dCwgdGV4dDEuc3Vic3RyaW5nKDAsIHRoaXMuTWF0Y2hfTWF4Qml0cyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWRfbG9jKTtcbiAgICAgIGlmIChzdGFydF9sb2MgIT0gLTEpIHtcbiAgICAgICAgZW5kX2xvYyA9IHRoaXMubWF0Y2hfbWFpbih0ZXh0LFxuICAgICAgICAgICAgdGV4dDEuc3Vic3RyaW5nKHRleHQxLmxlbmd0aCAtIHRoaXMuTWF0Y2hfTWF4Qml0cyksXG4gICAgICAgICAgICBleHBlY3RlZF9sb2MgKyB0ZXh0MS5sZW5ndGggLSB0aGlzLk1hdGNoX01heEJpdHMpO1xuICAgICAgICBpZiAoZW5kX2xvYyA9PSAtMSB8fCBzdGFydF9sb2MgPj0gZW5kX2xvYykge1xuICAgICAgICAgIC8vIENhbid0IGZpbmQgdmFsaWQgdHJhaWxpbmcgY29udGV4dC4gIERyb3AgdGhpcyBwYXRjaC5cbiAgICAgICAgICBzdGFydF9sb2MgPSAtMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdGFydF9sb2MgPSB0aGlzLm1hdGNoX21haW4odGV4dCwgdGV4dDEsIGV4cGVjdGVkX2xvYyk7XG4gICAgfVxuICAgIGlmIChzdGFydF9sb2MgPT0gLTEpIHtcbiAgICAgIC8vIE5vIG1hdGNoIGZvdW5kLiAgOihcbiAgICAgIHJlc3VsdHNbeF0gPSBmYWxzZTtcbiAgICAgIC8vIFN1YnRyYWN0IHRoZSBkZWx0YSBmb3IgdGhpcyBmYWlsZWQgcGF0Y2ggZnJvbSBzdWJzZXF1ZW50IHBhdGNoZXMuXG4gICAgICBkZWx0YSAtPSBwYXRjaGVzW3hdLmxlbmd0aDIgLSBwYXRjaGVzW3hdLmxlbmd0aDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEZvdW5kIGEgbWF0Y2guICA6KVxuICAgICAgcmVzdWx0c1t4XSA9IHRydWU7XG4gICAgICBkZWx0YSA9IHN0YXJ0X2xvYyAtIGV4cGVjdGVkX2xvYztcbiAgICAgIHZhciB0ZXh0MjtcbiAgICAgIGlmIChlbmRfbG9jID09IC0xKSB7XG4gICAgICAgIHRleHQyID0gdGV4dC5zdWJzdHJpbmcoc3RhcnRfbG9jLCBzdGFydF9sb2MgKyB0ZXh0MS5sZW5ndGgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGV4dDIgPSB0ZXh0LnN1YnN0cmluZyhzdGFydF9sb2MsIGVuZF9sb2MgKyB0aGlzLk1hdGNoX01heEJpdHMpO1xuICAgICAgfVxuICAgICAgaWYgKHRleHQxID09IHRleHQyKSB7XG4gICAgICAgIC8vIFBlcmZlY3QgbWF0Y2gsIGp1c3Qgc2hvdmUgdGhlIHJlcGxhY2VtZW50IHRleHQgaW4uXG4gICAgICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygwLCBzdGFydF9sb2MpICtcbiAgICAgICAgICAgICAgIHRoaXMuZGlmZl90ZXh0MihwYXRjaGVzW3hdLmRpZmZzKSArXG4gICAgICAgICAgICAgICB0ZXh0LnN1YnN0cmluZyhzdGFydF9sb2MgKyB0ZXh0MS5sZW5ndGgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSW1wZXJmZWN0IG1hdGNoLiAgUnVuIGEgZGlmZiB0byBnZXQgYSBmcmFtZXdvcmsgb2YgZXF1aXZhbGVudFxuICAgICAgICAvLyBpbmRpY2VzLlxuICAgICAgICB2YXIgZGlmZnMgPSB0aGlzLmRpZmZfbWFpbih0ZXh0MSwgdGV4dDIsIGZhbHNlKTtcbiAgICAgICAgaWYgKHRleHQxLmxlbmd0aCA+IHRoaXMuTWF0Y2hfTWF4Qml0cyAmJlxuICAgICAgICAgICAgdGhpcy5kaWZmX2xldmVuc2h0ZWluKGRpZmZzKSAvIHRleHQxLmxlbmd0aCA+XG4gICAgICAgICAgICB0aGlzLlBhdGNoX0RlbGV0ZVRocmVzaG9sZCkge1xuICAgICAgICAgIC8vIFRoZSBlbmQgcG9pbnRzIG1hdGNoLCBidXQgdGhlIGNvbnRlbnQgaXMgdW5hY2NlcHRhYmx5IGJhZC5cbiAgICAgICAgICByZXN1bHRzW3hdID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5kaWZmX2NsZWFudXBTZW1hbnRpY0xvc3NsZXNzKGRpZmZzKTtcbiAgICAgICAgICB2YXIgaW5kZXgxID0gMDtcbiAgICAgICAgICB2YXIgaW5kZXgyO1xuICAgICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgcGF0Y2hlc1t4XS5kaWZmcy5sZW5ndGg7IHkrKykge1xuICAgICAgICAgICAgdmFyIG1vZCA9IHBhdGNoZXNbeF0uZGlmZnNbeV07XG4gICAgICAgICAgICBpZiAobW9kWzBdICE9PSBESUZGX0VRVUFMKSB7XG4gICAgICAgICAgICAgIGluZGV4MiA9IHRoaXMuZGlmZl94SW5kZXgoZGlmZnMsIGluZGV4MSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobW9kWzBdID09PSBESUZGX0lOU0VSVCkgeyAgLy8gSW5zZXJ0aW9uXG4gICAgICAgICAgICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygwLCBzdGFydF9sb2MgKyBpbmRleDIpICsgbW9kWzFdICtcbiAgICAgICAgICAgICAgICAgICAgIHRleHQuc3Vic3RyaW5nKHN0YXJ0X2xvYyArIGluZGV4Mik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1vZFswXSA9PT0gRElGRl9ERUxFVEUpIHsgIC8vIERlbGV0aW9uXG4gICAgICAgICAgICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygwLCBzdGFydF9sb2MgKyBpbmRleDIpICtcbiAgICAgICAgICAgICAgICAgICAgIHRleHQuc3Vic3RyaW5nKHN0YXJ0X2xvYyArIHRoaXMuZGlmZl94SW5kZXgoZGlmZnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXgxICsgbW9kWzFdLmxlbmd0aCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG1vZFswXSAhPT0gRElGRl9ERUxFVEUpIHtcbiAgICAgICAgICAgICAgaW5kZXgxICs9IG1vZFsxXS5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8vIFN0cmlwIHRoZSBwYWRkaW5nIG9mZi5cbiAgdGV4dCA9IHRleHQuc3Vic3RyaW5nKG51bGxQYWRkaW5nLmxlbmd0aCwgdGV4dC5sZW5ndGggLSBudWxsUGFkZGluZy5sZW5ndGgpO1xuICByZXR1cm4gW3RleHQsIHJlc3VsdHNdO1xufTtcblxuXG4vKipcbiAqIEFkZCBzb21lIHBhZGRpbmcgb24gdGV4dCBzdGFydCBhbmQgZW5kIHNvIHRoYXQgZWRnZXMgY2FuIG1hdGNoIHNvbWV0aGluZy5cbiAqIEludGVuZGVkIHRvIGJlIGNhbGxlZCBvbmx5IGZyb20gd2l0aGluIHBhdGNoX2FwcGx5LlxuICogQHBhcmFtIHshQXJyYXkuPCFkaWZmX21hdGNoX3BhdGNoLnBhdGNoX29iaj59IHBhdGNoZXMgQXJyYXkgb2YgUGF0Y2ggb2JqZWN0cy5cbiAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHBhZGRpbmcgc3RyaW5nIGFkZGVkIHRvIGVhY2ggc2lkZS5cbiAqL1xuZGlmZl9tYXRjaF9wYXRjaC5wcm90b3R5cGUucGF0Y2hfYWRkUGFkZGluZyA9IGZ1bmN0aW9uKHBhdGNoZXMpIHtcbiAgdmFyIHBhZGRpbmdMZW5ndGggPSB0aGlzLlBhdGNoX01hcmdpbjtcbiAgdmFyIG51bGxQYWRkaW5nID0gJyc7XG4gIGZvciAodmFyIHggPSAxOyB4IDw9IHBhZGRpbmdMZW5ndGg7IHgrKykge1xuICAgIG51bGxQYWRkaW5nICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoeCk7XG4gIH1cblxuICAvLyBCdW1wIGFsbCB0aGUgcGF0Y2hlcyBmb3J3YXJkLlxuICBmb3IgKHZhciB4ID0gMDsgeCA8IHBhdGNoZXMubGVuZ3RoOyB4KyspIHtcbiAgICBwYXRjaGVzW3hdLnN0YXJ0MSArPSBwYWRkaW5nTGVuZ3RoO1xuICAgIHBhdGNoZXNbeF0uc3RhcnQyICs9IHBhZGRpbmdMZW5ndGg7XG4gIH1cblxuICAvLyBBZGQgc29tZSBwYWRkaW5nIG9uIHN0YXJ0IG9mIGZpcnN0IGRpZmYuXG4gIHZhciBwYXRjaCA9IHBhdGNoZXNbMF07XG4gIHZhciBkaWZmcyA9IHBhdGNoLmRpZmZzO1xuICBpZiAoZGlmZnMubGVuZ3RoID09IDAgfHwgZGlmZnNbMF1bMF0gIT0gRElGRl9FUVVBTCkge1xuICAgIC8vIEFkZCBudWxsUGFkZGluZyBlcXVhbGl0eS5cbiAgICBkaWZmcy51bnNoaWZ0KFtESUZGX0VRVUFMLCBudWxsUGFkZGluZ10pO1xuICAgIHBhdGNoLnN0YXJ0MSAtPSBwYWRkaW5nTGVuZ3RoOyAgLy8gU2hvdWxkIGJlIDAuXG4gICAgcGF0Y2guc3RhcnQyIC09IHBhZGRpbmdMZW5ndGg7ICAvLyBTaG91bGQgYmUgMC5cbiAgICBwYXRjaC5sZW5ndGgxICs9IHBhZGRpbmdMZW5ndGg7XG4gICAgcGF0Y2gubGVuZ3RoMiArPSBwYWRkaW5nTGVuZ3RoO1xuICB9IGVsc2UgaWYgKHBhZGRpbmdMZW5ndGggPiBkaWZmc1swXVsxXS5sZW5ndGgpIHtcbiAgICAvLyBHcm93IGZpcnN0IGVxdWFsaXR5LlxuICAgIHZhciBleHRyYUxlbmd0aCA9IHBhZGRpbmdMZW5ndGggLSBkaWZmc1swXVsxXS5sZW5ndGg7XG4gICAgZGlmZnNbMF1bMV0gPSBudWxsUGFkZGluZy5zdWJzdHJpbmcoZGlmZnNbMF1bMV0ubGVuZ3RoKSArIGRpZmZzWzBdWzFdO1xuICAgIHBhdGNoLnN0YXJ0MSAtPSBleHRyYUxlbmd0aDtcbiAgICBwYXRjaC5zdGFydDIgLT0gZXh0cmFMZW5ndGg7XG4gICAgcGF0Y2gubGVuZ3RoMSArPSBleHRyYUxlbmd0aDtcbiAgICBwYXRjaC5sZW5ndGgyICs9IGV4dHJhTGVuZ3RoO1xuICB9XG5cbiAgLy8gQWRkIHNvbWUgcGFkZGluZyBvbiBlbmQgb2YgbGFzdCBkaWZmLlxuICBwYXRjaCA9IHBhdGNoZXNbcGF0Y2hlcy5sZW5ndGggLSAxXTtcbiAgZGlmZnMgPSBwYXRjaC5kaWZmcztcbiAgaWYgKGRpZmZzLmxlbmd0aCA9PSAwIHx8IGRpZmZzW2RpZmZzLmxlbmd0aCAtIDFdWzBdICE9IERJRkZfRVFVQUwpIHtcbiAgICAvLyBBZGQgbnVsbFBhZGRpbmcgZXF1YWxpdHkuXG4gICAgZGlmZnMucHVzaChbRElGRl9FUVVBTCwgbnVsbFBhZGRpbmddKTtcbiAgICBwYXRjaC5sZW5ndGgxICs9IHBhZGRpbmdMZW5ndGg7XG4gICAgcGF0Y2gubGVuZ3RoMiArPSBwYWRkaW5nTGVuZ3RoO1xuICB9IGVsc2UgaWYgKHBhZGRpbmdMZW5ndGggPiBkaWZmc1tkaWZmcy5sZW5ndGggLSAxXVsxXS5sZW5ndGgpIHtcbiAgICAvLyBHcm93IGxhc3QgZXF1YWxpdHkuXG4gICAgdmFyIGV4dHJhTGVuZ3RoID0gcGFkZGluZ0xlbmd0aCAtIGRpZmZzW2RpZmZzLmxlbmd0aCAtIDFdWzFdLmxlbmd0aDtcbiAgICBkaWZmc1tkaWZmcy5sZW5ndGggLSAxXVsxXSArPSBudWxsUGFkZGluZy5zdWJzdHJpbmcoMCwgZXh0cmFMZW5ndGgpO1xuICAgIHBhdGNoLmxlbmd0aDEgKz0gZXh0cmFMZW5ndGg7XG4gICAgcGF0Y2gubGVuZ3RoMiArPSBleHRyYUxlbmd0aDtcbiAgfVxuXG4gIHJldHVybiBudWxsUGFkZGluZztcbn07XG5cblxuLyoqXG4gKiBMb29rIHRocm91Z2ggdGhlIHBhdGNoZXMgYW5kIGJyZWFrIHVwIGFueSB3aGljaCBhcmUgbG9uZ2VyIHRoYW4gdGhlIG1heGltdW1cbiAqIGxpbWl0IG9mIHRoZSBtYXRjaCBhbGdvcml0aG0uXG4gKiBJbnRlbmRlZCB0byBiZSBjYWxsZWQgb25seSBmcm9tIHdpdGhpbiBwYXRjaF9hcHBseS5cbiAqIEBwYXJhbSB7IUFycmF5LjwhZGlmZl9tYXRjaF9wYXRjaC5wYXRjaF9vYmo+fSBwYXRjaGVzIEFycmF5IG9mIFBhdGNoIG9iamVjdHMuXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLnBhdGNoX3NwbGl0TWF4ID0gZnVuY3Rpb24ocGF0Y2hlcykge1xuICB2YXIgcGF0Y2hfc2l6ZSA9IHRoaXMuTWF0Y2hfTWF4Qml0cztcbiAgZm9yICh2YXIgeCA9IDA7IHggPCBwYXRjaGVzLmxlbmd0aDsgeCsrKSB7XG4gICAgaWYgKHBhdGNoZXNbeF0ubGVuZ3RoMSA8PSBwYXRjaF9zaXplKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgdmFyIGJpZ3BhdGNoID0gcGF0Y2hlc1t4XTtcbiAgICAvLyBSZW1vdmUgdGhlIGJpZyBvbGQgcGF0Y2guXG4gICAgcGF0Y2hlcy5zcGxpY2UoeC0tLCAxKTtcbiAgICB2YXIgc3RhcnQxID0gYmlncGF0Y2guc3RhcnQxO1xuICAgIHZhciBzdGFydDIgPSBiaWdwYXRjaC5zdGFydDI7XG4gICAgdmFyIHByZWNvbnRleHQgPSAnJztcbiAgICB3aGlsZSAoYmlncGF0Y2guZGlmZnMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAvLyBDcmVhdGUgb25lIG9mIHNldmVyYWwgc21hbGxlciBwYXRjaGVzLlxuICAgICAgdmFyIHBhdGNoID0gbmV3IGRpZmZfbWF0Y2hfcGF0Y2gucGF0Y2hfb2JqKCk7XG4gICAgICB2YXIgZW1wdHkgPSB0cnVlO1xuICAgICAgcGF0Y2guc3RhcnQxID0gc3RhcnQxIC0gcHJlY29udGV4dC5sZW5ndGg7XG4gICAgICBwYXRjaC5zdGFydDIgPSBzdGFydDIgLSBwcmVjb250ZXh0Lmxlbmd0aDtcbiAgICAgIGlmIChwcmVjb250ZXh0ICE9PSAnJykge1xuICAgICAgICBwYXRjaC5sZW5ndGgxID0gcGF0Y2gubGVuZ3RoMiA9IHByZWNvbnRleHQubGVuZ3RoO1xuICAgICAgICBwYXRjaC5kaWZmcy5wdXNoKFtESUZGX0VRVUFMLCBwcmVjb250ZXh0XSk7XG4gICAgICB9XG4gICAgICB3aGlsZSAoYmlncGF0Y2guZGlmZnMubGVuZ3RoICE9PSAwICYmXG4gICAgICAgICAgICAgcGF0Y2gubGVuZ3RoMSA8IHBhdGNoX3NpemUgLSB0aGlzLlBhdGNoX01hcmdpbikge1xuICAgICAgICB2YXIgZGlmZl90eXBlID0gYmlncGF0Y2guZGlmZnNbMF1bMF07XG4gICAgICAgIHZhciBkaWZmX3RleHQgPSBiaWdwYXRjaC5kaWZmc1swXVsxXTtcbiAgICAgICAgaWYgKGRpZmZfdHlwZSA9PT0gRElGRl9JTlNFUlQpIHtcbiAgICAgICAgICAvLyBJbnNlcnRpb25zIGFyZSBoYXJtbGVzcy5cbiAgICAgICAgICBwYXRjaC5sZW5ndGgyICs9IGRpZmZfdGV4dC5sZW5ndGg7XG4gICAgICAgICAgc3RhcnQyICs9IGRpZmZfdGV4dC5sZW5ndGg7XG4gICAgICAgICAgcGF0Y2guZGlmZnMucHVzaChiaWdwYXRjaC5kaWZmcy5zaGlmdCgpKTtcbiAgICAgICAgICBlbXB0eSA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGRpZmZfdHlwZSA9PT0gRElGRl9ERUxFVEUgJiYgcGF0Y2guZGlmZnMubGVuZ3RoID09IDEgJiZcbiAgICAgICAgICAgICAgICAgICBwYXRjaC5kaWZmc1swXVswXSA9PSBESUZGX0VRVUFMICYmXG4gICAgICAgICAgICAgICAgICAgZGlmZl90ZXh0Lmxlbmd0aCA+IDIgKiBwYXRjaF9zaXplKSB7XG4gICAgICAgICAgLy8gVGhpcyBpcyBhIGxhcmdlIGRlbGV0aW9uLiAgTGV0IGl0IHBhc3MgaW4gb25lIGNodW5rLlxuICAgICAgICAgIHBhdGNoLmxlbmd0aDEgKz0gZGlmZl90ZXh0Lmxlbmd0aDtcbiAgICAgICAgICBzdGFydDEgKz0gZGlmZl90ZXh0Lmxlbmd0aDtcbiAgICAgICAgICBlbXB0eSA9IGZhbHNlO1xuICAgICAgICAgIHBhdGNoLmRpZmZzLnB1c2goW2RpZmZfdHlwZSwgZGlmZl90ZXh0XSk7XG4gICAgICAgICAgYmlncGF0Y2guZGlmZnMuc2hpZnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBEZWxldGlvbiBvciBlcXVhbGl0eS4gIE9ubHkgdGFrZSBhcyBtdWNoIGFzIHdlIGNhbiBzdG9tYWNoLlxuICAgICAgICAgIGRpZmZfdGV4dCA9IGRpZmZfdGV4dC5zdWJzdHJpbmcoMCxcbiAgICAgICAgICAgICAgcGF0Y2hfc2l6ZSAtIHBhdGNoLmxlbmd0aDEgLSB0aGlzLlBhdGNoX01hcmdpbik7XG4gICAgICAgICAgcGF0Y2gubGVuZ3RoMSArPSBkaWZmX3RleHQubGVuZ3RoO1xuICAgICAgICAgIHN0YXJ0MSArPSBkaWZmX3RleHQubGVuZ3RoO1xuICAgICAgICAgIGlmIChkaWZmX3R5cGUgPT09IERJRkZfRVFVQUwpIHtcbiAgICAgICAgICAgIHBhdGNoLmxlbmd0aDIgKz0gZGlmZl90ZXh0Lmxlbmd0aDtcbiAgICAgICAgICAgIHN0YXJ0MiArPSBkaWZmX3RleHQubGVuZ3RoO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbXB0eSA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwYXRjaC5kaWZmcy5wdXNoKFtkaWZmX3R5cGUsIGRpZmZfdGV4dF0pO1xuICAgICAgICAgIGlmIChkaWZmX3RleHQgPT0gYmlncGF0Y2guZGlmZnNbMF1bMV0pIHtcbiAgICAgICAgICAgIGJpZ3BhdGNoLmRpZmZzLnNoaWZ0KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJpZ3BhdGNoLmRpZmZzWzBdWzFdID1cbiAgICAgICAgICAgICAgICBiaWdwYXRjaC5kaWZmc1swXVsxXS5zdWJzdHJpbmcoZGlmZl90ZXh0Lmxlbmd0aCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBDb21wdXRlIHRoZSBoZWFkIGNvbnRleHQgZm9yIHRoZSBuZXh0IHBhdGNoLlxuICAgICAgcHJlY29udGV4dCA9IHRoaXMuZGlmZl90ZXh0MihwYXRjaC5kaWZmcyk7XG4gICAgICBwcmVjb250ZXh0ID1cbiAgICAgICAgICBwcmVjb250ZXh0LnN1YnN0cmluZyhwcmVjb250ZXh0Lmxlbmd0aCAtIHRoaXMuUGF0Y2hfTWFyZ2luKTtcbiAgICAgIC8vIEFwcGVuZCB0aGUgZW5kIGNvbnRleHQgZm9yIHRoaXMgcGF0Y2guXG4gICAgICB2YXIgcG9zdGNvbnRleHQgPSB0aGlzLmRpZmZfdGV4dDEoYmlncGF0Y2guZGlmZnMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN1YnN0cmluZygwLCB0aGlzLlBhdGNoX01hcmdpbik7XG4gICAgICBpZiAocG9zdGNvbnRleHQgIT09ICcnKSB7XG4gICAgICAgIHBhdGNoLmxlbmd0aDEgKz0gcG9zdGNvbnRleHQubGVuZ3RoO1xuICAgICAgICBwYXRjaC5sZW5ndGgyICs9IHBvc3Rjb250ZXh0Lmxlbmd0aDtcbiAgICAgICAgaWYgKHBhdGNoLmRpZmZzLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICAgICAgcGF0Y2guZGlmZnNbcGF0Y2guZGlmZnMubGVuZ3RoIC0gMV1bMF0gPT09IERJRkZfRVFVQUwpIHtcbiAgICAgICAgICBwYXRjaC5kaWZmc1twYXRjaC5kaWZmcy5sZW5ndGggLSAxXVsxXSArPSBwb3N0Y29udGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYXRjaC5kaWZmcy5wdXNoKFtESUZGX0VRVUFMLCBwb3N0Y29udGV4dF0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIWVtcHR5KSB7XG4gICAgICAgIHBhdGNoZXMuc3BsaWNlKCsreCwgMCwgcGF0Y2gpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuXG4vKipcbiAqIFRha2UgYSBsaXN0IG9mIHBhdGNoZXMgYW5kIHJldHVybiBhIHRleHR1YWwgcmVwcmVzZW50YXRpb24uXG4gKiBAcGFyYW0geyFBcnJheS48IWRpZmZfbWF0Y2hfcGF0Y2gucGF0Y2hfb2JqPn0gcGF0Y2hlcyBBcnJheSBvZiBQYXRjaCBvYmplY3RzLlxuICogQHJldHVybiB7c3RyaW5nfSBUZXh0IHJlcHJlc2VudGF0aW9uIG9mIHBhdGNoZXMuXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLnBhdGNoX3RvVGV4dCA9IGZ1bmN0aW9uKHBhdGNoZXMpIHtcbiAgdmFyIHRleHQgPSBbXTtcbiAgZm9yICh2YXIgeCA9IDA7IHggPCBwYXRjaGVzLmxlbmd0aDsgeCsrKSB7XG4gICAgdGV4dFt4XSA9IHBhdGNoZXNbeF07XG4gIH1cbiAgcmV0dXJuIHRleHQuam9pbignJyk7XG59O1xuXG5cbi8qKlxuICogUGFyc2UgYSB0ZXh0dWFsIHJlcHJlc2VudGF0aW9uIG9mIHBhdGNoZXMgYW5kIHJldHVybiBhIGxpc3Qgb2YgUGF0Y2ggb2JqZWN0cy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0bGluZSBUZXh0IHJlcHJlc2VudGF0aW9uIG9mIHBhdGNoZXMuXG4gKiBAcmV0dXJuIHshQXJyYXkuPCFkaWZmX21hdGNoX3BhdGNoLnBhdGNoX29iaj59IEFycmF5IG9mIFBhdGNoIG9iamVjdHMuXG4gKiBAdGhyb3dzIHshRXJyb3J9IElmIGludmFsaWQgaW5wdXQuXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLnBhdGNoX2Zyb21UZXh0ID0gZnVuY3Rpb24odGV4dGxpbmUpIHtcbiAgdmFyIHBhdGNoZXMgPSBbXTtcbiAgaWYgKCF0ZXh0bGluZSkge1xuICAgIHJldHVybiBwYXRjaGVzO1xuICB9XG4gIHZhciB0ZXh0ID0gdGV4dGxpbmUuc3BsaXQoJ1xcbicpO1xuICB2YXIgdGV4dFBvaW50ZXIgPSAwO1xuICB2YXIgcGF0Y2hIZWFkZXIgPSAvXkBAIC0oXFxkKyksPyhcXGQqKSBcXCsoXFxkKyksPyhcXGQqKSBAQCQvO1xuICB3aGlsZSAodGV4dFBvaW50ZXIgPCB0ZXh0Lmxlbmd0aCkge1xuICAgIHZhciBtID0gdGV4dFt0ZXh0UG9pbnRlcl0ubWF0Y2gocGF0Y2hIZWFkZXIpO1xuICAgIGlmICghbSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHBhdGNoIHN0cmluZzogJyArIHRleHRbdGV4dFBvaW50ZXJdKTtcbiAgICB9XG4gICAgdmFyIHBhdGNoID0gbmV3IGRpZmZfbWF0Y2hfcGF0Y2gucGF0Y2hfb2JqKCk7XG4gICAgcGF0Y2hlcy5wdXNoKHBhdGNoKTtcbiAgICBwYXRjaC5zdGFydDEgPSBwYXJzZUludChtWzFdLCAxMCk7XG4gICAgaWYgKG1bMl0gPT09ICcnKSB7XG4gICAgICBwYXRjaC5zdGFydDEtLTtcbiAgICAgIHBhdGNoLmxlbmd0aDEgPSAxO1xuICAgIH0gZWxzZSBpZiAobVsyXSA9PSAnMCcpIHtcbiAgICAgIHBhdGNoLmxlbmd0aDEgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXRjaC5zdGFydDEtLTtcbiAgICAgIHBhdGNoLmxlbmd0aDEgPSBwYXJzZUludChtWzJdLCAxMCk7XG4gICAgfVxuXG4gICAgcGF0Y2guc3RhcnQyID0gcGFyc2VJbnQobVszXSwgMTApO1xuICAgIGlmIChtWzRdID09PSAnJykge1xuICAgICAgcGF0Y2guc3RhcnQyLS07XG4gICAgICBwYXRjaC5sZW5ndGgyID0gMTtcbiAgICB9IGVsc2UgaWYgKG1bNF0gPT0gJzAnKSB7XG4gICAgICBwYXRjaC5sZW5ndGgyID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgcGF0Y2guc3RhcnQyLS07XG4gICAgICBwYXRjaC5sZW5ndGgyID0gcGFyc2VJbnQobVs0XSwgMTApO1xuICAgIH1cbiAgICB0ZXh0UG9pbnRlcisrO1xuXG4gICAgd2hpbGUgKHRleHRQb2ludGVyIDwgdGV4dC5sZW5ndGgpIHtcbiAgICAgIHZhciBzaWduID0gdGV4dFt0ZXh0UG9pbnRlcl0uY2hhckF0KDApO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIGxpbmUgPSBkZWNvZGVVUkkodGV4dFt0ZXh0UG9pbnRlcl0uc3Vic3RyaW5nKDEpKTtcbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIC8vIE1hbGZvcm1lZCBVUkkgc2VxdWVuY2UuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSWxsZWdhbCBlc2NhcGUgaW4gcGF0Y2hfZnJvbVRleHQ6ICcgKyBsaW5lKTtcbiAgICAgIH1cbiAgICAgIGlmIChzaWduID09ICctJykge1xuICAgICAgICAvLyBEZWxldGlvbi5cbiAgICAgICAgcGF0Y2guZGlmZnMucHVzaChbRElGRl9ERUxFVEUsIGxpbmVdKTtcbiAgICAgIH0gZWxzZSBpZiAoc2lnbiA9PSAnKycpIHtcbiAgICAgICAgLy8gSW5zZXJ0aW9uLlxuICAgICAgICBwYXRjaC5kaWZmcy5wdXNoKFtESUZGX0lOU0VSVCwgbGluZV0pO1xuICAgICAgfSBlbHNlIGlmIChzaWduID09ICcgJykge1xuICAgICAgICAvLyBNaW5vciBlcXVhbGl0eS5cbiAgICAgICAgcGF0Y2guZGlmZnMucHVzaChbRElGRl9FUVVBTCwgbGluZV0pO1xuICAgICAgfSBlbHNlIGlmIChzaWduID09ICdAJykge1xuICAgICAgICAvLyBTdGFydCBvZiBuZXh0IHBhdGNoLlxuICAgICAgICBicmVhaztcbiAgICAgIH0gZWxzZSBpZiAoc2lnbiA9PT0gJycpIHtcbiAgICAgICAgLy8gQmxhbmsgbGluZT8gIFdoYXRldmVyLlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gV1RGP1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcGF0Y2ggbW9kZSBcIicgKyBzaWduICsgJ1wiIGluOiAnICsgbGluZSk7XG4gICAgICB9XG4gICAgICB0ZXh0UG9pbnRlcisrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGF0Y2hlcztcbn07XG5cblxuLyoqXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgb25lIHBhdGNoIG9wZXJhdGlvbi5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5kaWZmX21hdGNoX3BhdGNoLnBhdGNoX29iaiA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUgeyFBcnJheS48IWRpZmZfbWF0Y2hfcGF0Y2guRGlmZj59ICovXG4gIHRoaXMuZGlmZnMgPSBbXTtcbiAgLyoqIEB0eXBlIHs/bnVtYmVyfSAqL1xuICB0aGlzLnN0YXJ0MSA9IG51bGw7XG4gIC8qKiBAdHlwZSB7P251bWJlcn0gKi9cbiAgdGhpcy5zdGFydDIgPSBudWxsO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdGhpcy5sZW5ndGgxID0gMDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHRoaXMubGVuZ3RoMiA9IDA7XG59O1xuXG5cbi8qKlxuICogRW1tdWxhdGUgR05VIGRpZmYncyBmb3JtYXQuXG4gKiBIZWFkZXI6IEBAIC0zODIsOCArNDgxLDkgQEBcbiAqIEluZGljaWVzIGFyZSBwcmludGVkIGFzIDEtYmFzZWQsIG5vdCAwLWJhc2VkLlxuICogQHJldHVybiB7c3RyaW5nfSBUaGUgR05VIGRpZmYgc3RyaW5nLlxuICovXG5kaWZmX21hdGNoX3BhdGNoLnBhdGNoX29iai5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGNvb3JkczEsIGNvb3JkczI7XG4gIGlmICh0aGlzLmxlbmd0aDEgPT09IDApIHtcbiAgICBjb29yZHMxID0gdGhpcy5zdGFydDEgKyAnLDAnO1xuICB9IGVsc2UgaWYgKHRoaXMubGVuZ3RoMSA9PSAxKSB7XG4gICAgY29vcmRzMSA9IHRoaXMuc3RhcnQxICsgMTtcbiAgfSBlbHNlIHtcbiAgICBjb29yZHMxID0gKHRoaXMuc3RhcnQxICsgMSkgKyAnLCcgKyB0aGlzLmxlbmd0aDE7XG4gIH1cbiAgaWYgKHRoaXMubGVuZ3RoMiA9PT0gMCkge1xuICAgIGNvb3JkczIgPSB0aGlzLnN0YXJ0MiArICcsMCc7XG4gIH0gZWxzZSBpZiAodGhpcy5sZW5ndGgyID09IDEpIHtcbiAgICBjb29yZHMyID0gdGhpcy5zdGFydDIgKyAxO1xuICB9IGVsc2Uge1xuICAgIGNvb3JkczIgPSAodGhpcy5zdGFydDIgKyAxKSArICcsJyArIHRoaXMubGVuZ3RoMjtcbiAgfVxuICB2YXIgdGV4dCA9IFsnQEAgLScgKyBjb29yZHMxICsgJyArJyArIGNvb3JkczIgKyAnIEBAXFxuJ107XG4gIHZhciBvcDtcbiAgLy8gRXNjYXBlIHRoZSBib2R5IG9mIHRoZSBwYXRjaCB3aXRoICV4eCBub3RhdGlvbi5cbiAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLmRpZmZzLmxlbmd0aDsgeCsrKSB7XG4gICAgc3dpdGNoICh0aGlzLmRpZmZzW3hdWzBdKSB7XG4gICAgICBjYXNlIERJRkZfSU5TRVJUOlxuICAgICAgICBvcCA9ICcrJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERJRkZfREVMRVRFOlxuICAgICAgICBvcCA9ICctJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERJRkZfRVFVQUw6XG4gICAgICAgIG9wID0gJyAnO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgdGV4dFt4ICsgMV0gPSBvcCArIGVuY29kZVVSSSh0aGlzLmRpZmZzW3hdWzFdKSArICdcXG4nO1xuICB9XG4gIHJldHVybiB0ZXh0LmpvaW4oJycpLnJlcGxhY2UoLyUyMC9nLCAnICcpO1xufTtcblxuXG4vLyBUaGUgZm9sbG93aW5nIGV4cG9ydCBjb2RlIHdhcyBhZGRlZCBieSBARm9yYmVzTGluZGVzYXlcbm1vZHVsZS5leHBvcnRzID0gZGlmZl9tYXRjaF9wYXRjaDtcbm1vZHVsZS5leHBvcnRzWydkaWZmX21hdGNoX3BhdGNoJ10gPSBkaWZmX21hdGNoX3BhdGNoO1xubW9kdWxlLmV4cG9ydHNbJ0RJRkZfREVMRVRFJ10gPSBESUZGX0RFTEVURTtcbm1vZHVsZS5leHBvcnRzWydESUZGX0lOU0VSVCddID0gRElGRl9JTlNFUlQ7XG5tb2R1bGUuZXhwb3J0c1snRElGRl9FUVVBTCddID0gRElGRl9FUVVBTDtcbn0pO1xuXG4vKiBnbG9iYWwgZGlmZl9tYXRjaF9wYXRjaCAqL1xudmFyIFRFWFRfRElGRiA9IDI7XG52YXIgREVGQVVMVF9NSU5fTEVOR1RIID0gNjA7XG52YXIgY2FjaGVkRGlmZlBhdGNoID0gbnVsbDtcblxudmFyIGdldERpZmZNYXRjaFBhdGNoID0gZnVuY3Rpb24gZ2V0RGlmZk1hdGNoUGF0Y2gocmVxdWlyZWQpIHtcbiAgLyoganNoaW50IGNhbWVsY2FzZTogZmFsc2UgKi9cblxuICBpZiAoIWNhY2hlZERpZmZQYXRjaCkge1xuICAgIHZhciBpbnN0YW5jZSA9IHZvaWQgMDtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBjYW1lbGNhc2UsIG5ldy1jYXAgKi9cbiAgICBpZiAodHlwZW9mIGRpZmZfbWF0Y2hfcGF0Y2ggIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyBhbHJlYWR5IGxvYWRlZCwgcHJvYmFibHkgYSBicm93c2VyXG4gICAgICBpbnN0YW5jZSA9IHR5cGVvZiBkaWZmX21hdGNoX3BhdGNoID09PSAnZnVuY3Rpb24nID8gbmV3IGRpZmZfbWF0Y2hfcGF0Y2goKSA6IG5ldyBkaWZmX21hdGNoX3BhdGNoLmRpZmZfbWF0Y2hfcGF0Y2goKTtcbiAgICB9IGVsc2UgaWYgKGRpZmZNYXRjaFBhdGNoKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpbnN0YW5jZSA9IGRpZmZNYXRjaFBhdGNoICYmIG5ldyBkaWZmTWF0Y2hQYXRjaCgpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGluc3RhbmNlID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgLyogZXNsaW50LWVuYWJsZSBjYW1lbGNhc2UsIG5ldy1jYXAgKi9cbiAgICBpZiAoIWluc3RhbmNlKSB7XG4gICAgICBpZiAoIXJlcXVpcmVkKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKCd0ZXh0IGRpZmZfbWF0Y2hfcGF0Y2ggbGlicmFyeSBub3QgZm91bmQnKTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICAgIGVycm9yLmRpZmZfbWF0Y2hfcGF0Y2hfbm90X2ZvdW5kID0gdHJ1ZTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgICBjYWNoZWREaWZmUGF0Y2ggPSB7XG4gICAgICBkaWZmOiBmdW5jdGlvbiBkaWZmKHR4dDEsIHR4dDIpIHtcbiAgICAgICAgcmV0dXJuIGluc3RhbmNlLnBhdGNoX3RvVGV4dChpbnN0YW5jZS5wYXRjaF9tYWtlKHR4dDEsIHR4dDIpKTtcbiAgICAgIH0sXG4gICAgICBwYXRjaDogZnVuY3Rpb24gcGF0Y2godHh0MSwgX3BhdGNoKSB7XG4gICAgICAgIHZhciByZXN1bHRzID0gaW5zdGFuY2UucGF0Y2hfYXBwbHkoaW5zdGFuY2UucGF0Y2hfZnJvbVRleHQoX3BhdGNoKSwgdHh0MSk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVzdWx0c1sxXS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmICghcmVzdWx0c1sxXVtpXSkge1xuICAgICAgICAgICAgdmFyIF9lcnJvciA9IG5ldyBFcnJvcigndGV4dCBwYXRjaCBmYWlsZWQnKTtcbiAgICAgICAgICAgIF9lcnJvci50ZXh0UGF0Y2hGYWlsZWQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0c1swXTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHJldHVybiBjYWNoZWREaWZmUGF0Y2g7XG59O1xuXG52YXIgZGlmZkZpbHRlciQzID0gZnVuY3Rpb24gdGV4dHNEaWZmRmlsdGVyKGNvbnRleHQpIHtcbiAgaWYgKGNvbnRleHQubGVmdFR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBtaW5MZW5ndGggPSBjb250ZXh0Lm9wdGlvbnMgJiYgY29udGV4dC5vcHRpb25zLnRleHREaWZmICYmIGNvbnRleHQub3B0aW9ucy50ZXh0RGlmZi5taW5MZW5ndGggfHwgREVGQVVMVF9NSU5fTEVOR1RIO1xuICBpZiAoY29udGV4dC5sZWZ0Lmxlbmd0aCA8IG1pbkxlbmd0aCB8fCBjb250ZXh0LnJpZ2h0Lmxlbmd0aCA8IG1pbkxlbmd0aCkge1xuICAgIGNvbnRleHQuc2V0UmVzdWx0KFtjb250ZXh0LmxlZnQsIGNvbnRleHQucmlnaHRdKS5leGl0KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGxhcmdlIHRleHQsIHRyeSB0byB1c2UgYSB0ZXh0LWRpZmYgYWxnb3JpdGhtXG4gIHZhciBkaWZmTWF0Y2hQYXRjaCQkMSA9IGdldERpZmZNYXRjaFBhdGNoKCk7XG4gIGlmICghZGlmZk1hdGNoUGF0Y2gkJDEpIHtcbiAgICAvLyBkaWZmLW1hdGNoLXBhdGNoIGxpYnJhcnkgbm90IGF2YWlsYWJsZSxcbiAgICAvLyBmYWxsYmFjayB0byByZWd1bGFyIHN0cmluZyByZXBsYWNlXG4gICAgY29udGV4dC5zZXRSZXN1bHQoW2NvbnRleHQubGVmdCwgY29udGV4dC5yaWdodF0pLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGRpZmYgPSBkaWZmTWF0Y2hQYXRjaCQkMS5kaWZmO1xuICBjb250ZXh0LnNldFJlc3VsdChbZGlmZihjb250ZXh0LmxlZnQsIGNvbnRleHQucmlnaHQpLCAwLCBURVhUX0RJRkZdKS5leGl0KCk7XG59O1xuZGlmZkZpbHRlciQzLmZpbHRlck5hbWUgPSAndGV4dHMnO1xuXG52YXIgcGF0Y2hGaWx0ZXIkMyA9IGZ1bmN0aW9uIHRleHRzUGF0Y2hGaWx0ZXIoY29udGV4dCkge1xuICBpZiAoY29udGV4dC5uZXN0ZWQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGNvbnRleHQuZGVsdGFbMl0gIT09IFRFWFRfRElGRikge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIHRleHQtZGlmZiwgdXNlIGEgdGV4dC1wYXRjaCBhbGdvcml0aG1cbiAgdmFyIHBhdGNoID0gZ2V0RGlmZk1hdGNoUGF0Y2godHJ1ZSkucGF0Y2g7XG4gIGNvbnRleHQuc2V0UmVzdWx0KHBhdGNoKGNvbnRleHQubGVmdCwgY29udGV4dC5kZWx0YVswXSkpLmV4aXQoKTtcbn07XG5wYXRjaEZpbHRlciQzLmZpbHRlck5hbWUgPSAndGV4dHMnO1xuXG52YXIgdGV4dERlbHRhUmV2ZXJzZSA9IGZ1bmN0aW9uIHRleHREZWx0YVJldmVyc2UoZGVsdGEpIHtcbiAgdmFyIGkgPSB2b2lkIDA7XG4gIHZhciBsID0gdm9pZCAwO1xuICB2YXIgbGluZXMgPSB2b2lkIDA7XG4gIHZhciBsaW5lID0gdm9pZCAwO1xuICB2YXIgbGluZVRtcCA9IHZvaWQgMDtcbiAgdmFyIGhlYWRlciA9IG51bGw7XG4gIHZhciBoZWFkZXJSZWdleCA9IC9eQEAgKy0oXFxkKyksKFxcZCspICtcXCsoXFxkKyksKFxcZCspICtAQCQvO1xuICB2YXIgbGluZUhlYWRlciA9IHZvaWQgMDtcbiAgbGluZXMgPSBkZWx0YS5zcGxpdCgnXFxuJyk7XG4gIGZvciAoaSA9IDAsIGwgPSBsaW5lcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBsaW5lID0gbGluZXNbaV07XG4gICAgdmFyIGxpbmVTdGFydCA9IGxpbmUuc2xpY2UoMCwgMSk7XG4gICAgaWYgKGxpbmVTdGFydCA9PT0gJ0AnKSB7XG4gICAgICBoZWFkZXIgPSBoZWFkZXJSZWdleC5leGVjKGxpbmUpO1xuICAgICAgbGluZUhlYWRlciA9IGk7XG5cbiAgICAgIC8vIGZpeCBoZWFkZXJcbiAgICAgIGxpbmVzW2xpbmVIZWFkZXJdID0gJ0BAIC0nICsgaGVhZGVyWzNdICsgJywnICsgaGVhZGVyWzRdICsgJyArJyArIGhlYWRlclsxXSArICcsJyArIGhlYWRlclsyXSArICcgQEAnO1xuICAgIH0gZWxzZSBpZiAobGluZVN0YXJ0ID09PSAnKycpIHtcbiAgICAgIGxpbmVzW2ldID0gJy0nICsgbGluZXNbaV0uc2xpY2UoMSk7XG4gICAgICBpZiAobGluZXNbaSAtIDFdLnNsaWNlKDAsIDEpID09PSAnKycpIHtcbiAgICAgICAgLy8gc3dhcCBsaW5lcyB0byBrZWVwIGRlZmF1bHQgb3JkZXIgKC0rKVxuICAgICAgICBsaW5lVG1wID0gbGluZXNbaV07XG4gICAgICAgIGxpbmVzW2ldID0gbGluZXNbaSAtIDFdO1xuICAgICAgICBsaW5lc1tpIC0gMV0gPSBsaW5lVG1wO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobGluZVN0YXJ0ID09PSAnLScpIHtcbiAgICAgIGxpbmVzW2ldID0gJysnICsgbGluZXNbaV0uc2xpY2UoMSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbn07XG5cbnZhciByZXZlcnNlRmlsdGVyJDMgPSBmdW5jdGlvbiB0ZXh0c1JldmVyc2VGaWx0ZXIoY29udGV4dCkge1xuICBpZiAoY29udGV4dC5uZXN0ZWQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGNvbnRleHQuZGVsdGFbMl0gIT09IFRFWFRfRElGRikge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIHRleHQtZGlmZiwgdXNlIGEgdGV4dC1kaWZmIGFsZ29yaXRobVxuICBjb250ZXh0LnNldFJlc3VsdChbdGV4dERlbHRhUmV2ZXJzZShjb250ZXh0LmRlbHRhWzBdKSwgMCwgVEVYVF9ESUZGXSkuZXhpdCgpO1xufTtcbnJldmVyc2VGaWx0ZXIkMy5maWx0ZXJOYW1lID0gJ3RleHRzJztcblxudmFyIERpZmZQYXRjaGVyID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBEaWZmUGF0Y2hlcihvcHRpb25zKSB7XG4gICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgRGlmZlBhdGNoZXIpO1xuXG4gICAgdGhpcy5wcm9jZXNzb3IgPSBuZXcgUHJvY2Vzc29yKG9wdGlvbnMpO1xuICAgIHRoaXMucHJvY2Vzc29yLnBpcGUobmV3IFBpcGUoJ2RpZmYnKS5hcHBlbmQoY29sbGVjdENoaWxkcmVuRGlmZkZpbHRlciwgZGlmZkZpbHRlciwgZGlmZkZpbHRlciQyLCBkaWZmRmlsdGVyJDMsIG9iamVjdHNEaWZmRmlsdGVyLCBkaWZmRmlsdGVyJDEpLnNob3VsZEhhdmVSZXN1bHQoKSk7XG4gICAgdGhpcy5wcm9jZXNzb3IucGlwZShuZXcgUGlwZSgncGF0Y2gnKS5hcHBlbmQoY29sbGVjdENoaWxkcmVuUGF0Y2hGaWx0ZXIsIGNvbGxlY3RDaGlsZHJlblBhdGNoRmlsdGVyJDEsIHBhdGNoRmlsdGVyLCBwYXRjaEZpbHRlciQzLCBwYXRjaEZpbHRlciQxLCBwYXRjaEZpbHRlciQyKS5zaG91bGRIYXZlUmVzdWx0KCkpO1xuICAgIHRoaXMucHJvY2Vzc29yLnBpcGUobmV3IFBpcGUoJ3JldmVyc2UnKS5hcHBlbmQoY29sbGVjdENoaWxkcmVuUmV2ZXJzZUZpbHRlciwgY29sbGVjdENoaWxkcmVuUmV2ZXJzZUZpbHRlciQxLCByZXZlcnNlRmlsdGVyLCByZXZlcnNlRmlsdGVyJDMsIHJldmVyc2VGaWx0ZXIkMSwgcmV2ZXJzZUZpbHRlciQyKS5zaG91bGRIYXZlUmVzdWx0KCkpO1xuICB9XG5cbiAgY3JlYXRlQ2xhc3MoRGlmZlBhdGNoZXIsIFt7XG4gICAga2V5OiAnb3B0aW9ucycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG9wdGlvbnMoKSB7XG4gICAgICB2YXIgX3Byb2Nlc3NvcjtcblxuICAgICAgcmV0dXJuIChfcHJvY2Vzc29yID0gdGhpcy5wcm9jZXNzb3IpLm9wdGlvbnMuYXBwbHkoX3Byb2Nlc3NvciwgYXJndW1lbnRzKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdkaWZmJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGlmZihsZWZ0LCByaWdodCkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc29yLnByb2Nlc3MobmV3IERpZmZDb250ZXh0KGxlZnQsIHJpZ2h0KSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncGF0Y2gnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwYXRjaChsZWZ0LCBkZWx0YSkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc29yLnByb2Nlc3MobmV3IFBhdGNoQ29udGV4dChsZWZ0LCBkZWx0YSkpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3JldmVyc2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZXZlcnNlKGRlbHRhKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9jZXNzb3IucHJvY2VzcyhuZXcgUmV2ZXJzZUNvbnRleHQoZGVsdGEpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd1bnBhdGNoJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdW5wYXRjaChyaWdodCwgZGVsdGEpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhdGNoKHJpZ2h0LCB0aGlzLnJldmVyc2UoZGVsdGEpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjbG9uZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNsb25lJCQxKHZhbHVlKSB7XG4gICAgICByZXR1cm4gY2xvbmUodmFsdWUpO1xuICAgIH1cbiAgfV0pO1xuICByZXR1cm4gRGlmZlBhdGNoZXI7XG59KCk7XG5cbnZhciBpc0FycmF5JDMgPSB0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gJ2Z1bmN0aW9uJyA/IEFycmF5LmlzQXJyYXkgOiBmdW5jdGlvbiAoYSkge1xuICByZXR1cm4gYSBpbnN0YW5jZW9mIEFycmF5O1xufTtcblxudmFyIGdldE9iamVjdEtleXMgPSB0eXBlb2YgT2JqZWN0LmtleXMgPT09ICdmdW5jdGlvbicgPyBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhvYmopO1xufSA6IGZ1bmN0aW9uIChvYmopIHtcbiAgdmFyIG5hbWVzID0gW107XG4gIGZvciAodmFyIHByb3BlcnR5IGluIG9iaikge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wZXJ0eSkpIHtcbiAgICAgIG5hbWVzLnB1c2gocHJvcGVydHkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbmFtZXM7XG59O1xuXG52YXIgdHJpbVVuZGVyc2NvcmUgPSBmdW5jdGlvbiB0cmltVW5kZXJzY29yZShzdHIpIHtcbiAgaWYgKHN0ci5zdWJzdHIoMCwgMSkgPT09ICdfJykge1xuICAgIHJldHVybiBzdHIuc2xpY2UoMSk7XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn07XG5cbnZhciBhcnJheUtleVRvU29ydE51bWJlciA9IGZ1bmN0aW9uIGFycmF5S2V5VG9Tb3J0TnVtYmVyKGtleSkge1xuICBpZiAoa2V5ID09PSAnX3QnKSB7XG4gICAgcmV0dXJuIC0xO1xuICB9IGVsc2Uge1xuICAgIGlmIChrZXkuc3Vic3RyKDAsIDEpID09PSAnXycpIHtcbiAgICAgIHJldHVybiBwYXJzZUludChrZXkuc2xpY2UoMSksIDEwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHBhcnNlSW50KGtleSwgMTApICsgMC4xO1xuICAgIH1cbiAgfVxufTtcblxudmFyIGFycmF5S2V5Q29tcGFyZXIgPSBmdW5jdGlvbiBhcnJheUtleUNvbXBhcmVyKGtleTEsIGtleTIpIHtcbiAgcmV0dXJuIGFycmF5S2V5VG9Tb3J0TnVtYmVyKGtleTEpIC0gYXJyYXlLZXlUb1NvcnROdW1iZXIoa2V5Mik7XG59O1xuXG52YXIgQmFzZUZvcm1hdHRlciA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gQmFzZUZvcm1hdHRlcigpIHtcbiAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBCYXNlRm9ybWF0dGVyKTtcbiAgfVxuXG4gIGNyZWF0ZUNsYXNzKEJhc2VGb3JtYXR0ZXIsIFt7XG4gICAga2V5OiAnZm9ybWF0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZm9ybWF0KGRlbHRhLCBsZWZ0KSB7XG4gICAgICB2YXIgY29udGV4dCA9IHt9O1xuICAgICAgdGhpcy5wcmVwYXJlQ29udGV4dChjb250ZXh0KTtcbiAgICAgIHRoaXMucmVjdXJzZShjb250ZXh0LCBkZWx0YSwgbGVmdCk7XG4gICAgICByZXR1cm4gdGhpcy5maW5hbGl6ZShjb250ZXh0KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdwcmVwYXJlQ29udGV4dCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHByZXBhcmVDb250ZXh0KGNvbnRleHQpIHtcbiAgICAgIGNvbnRleHQuYnVmZmVyID0gW107XG4gICAgICBjb250ZXh0Lm91dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF9idWZmZXI7XG5cbiAgICAgICAgKF9idWZmZXIgPSB0aGlzLmJ1ZmZlcikucHVzaC5hcHBseShfYnVmZmVyLCBhcmd1bWVudHMpO1xuICAgICAgfTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd0eXBlRm9ybWF0dHRlck5vdEZvdW5kJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdHlwZUZvcm1hdHR0ZXJOb3RGb3VuZChjb250ZXh0LCBkZWx0YVR5cGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignY2Fubm90IGZvcm1hdCBkZWx0YSB0eXBlOiAnICsgZGVsdGFUeXBlKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd0eXBlRm9ybWF0dHRlckVycm9yRm9ybWF0dGVyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdHlwZUZvcm1hdHR0ZXJFcnJvckZvcm1hdHRlcihjb250ZXh0LCBlcnIpIHtcbiAgICAgIHJldHVybiBlcnIudG9TdHJpbmcoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdmaW5hbGl6ZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGZpbmFsaXplKF9yZWYpIHtcbiAgICAgIHZhciBidWZmZXIgPSBfcmVmLmJ1ZmZlcjtcblxuICAgICAgaWYgKGlzQXJyYXkkMyhidWZmZXIpKSB7XG4gICAgICAgIHJldHVybiBidWZmZXIuam9pbignJyk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVjdXJzZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlY3Vyc2UoY29udGV4dCwgZGVsdGEsIGxlZnQsIGtleSwgbGVmdEtleSwgbW92ZWRGcm9tLCBpc0xhc3QpIHtcbiAgICAgIHZhciB1c2VNb3ZlT3JpZ2luSGVyZSA9IGRlbHRhICYmIG1vdmVkRnJvbTtcbiAgICAgIHZhciBsZWZ0VmFsdWUgPSB1c2VNb3ZlT3JpZ2luSGVyZSA/IG1vdmVkRnJvbS52YWx1ZSA6IGxlZnQ7XG5cbiAgICAgIGlmICh0eXBlb2YgZGVsdGEgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBrZXkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHZhciB0eXBlID0gdGhpcy5nZXREZWx0YVR5cGUoZGVsdGEsIG1vdmVkRnJvbSk7XG4gICAgICB2YXIgbm9kZVR5cGUgPSB0eXBlID09PSAnbm9kZScgPyBkZWx0YS5fdCA9PT0gJ2EnID8gJ2FycmF5JyA6ICdvYmplY3QnIDogJyc7XG5cbiAgICAgIGlmICh0eXBlb2Yga2V5ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aGlzLm5vZGVCZWdpbihjb250ZXh0LCBrZXksIGxlZnRLZXksIHR5cGUsIG5vZGVUeXBlLCBpc0xhc3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yb290QmVnaW4oY29udGV4dCwgdHlwZSwgbm9kZVR5cGUpO1xuICAgICAgfVxuXG4gICAgICB2YXIgdHlwZUZvcm1hdHR0ZXIgPSB2b2lkIDA7XG4gICAgICB0cnkge1xuICAgICAgICB0eXBlRm9ybWF0dHRlciA9IHRoaXNbJ2Zvcm1hdF8nICsgdHlwZV0gfHwgdGhpcy50eXBlRm9ybWF0dHRlck5vdEZvdW5kKGNvbnRleHQsIHR5cGUpO1xuICAgICAgICB0eXBlRm9ybWF0dHRlci5jYWxsKHRoaXMsIGNvbnRleHQsIGRlbHRhLCBsZWZ0VmFsdWUsIGtleSwgbGVmdEtleSwgbW92ZWRGcm9tKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0aGlzLnR5cGVGb3JtYXR0dGVyRXJyb3JGb3JtYXR0ZXIoY29udGV4dCwgZXJyLCBkZWx0YSwgbGVmdFZhbHVlLCBrZXksIGxlZnRLZXksIG1vdmVkRnJvbSk7XG4gICAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZS5lcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyLnN0YWNrKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGtleSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhpcy5ub2RlRW5kKGNvbnRleHQsIGtleSwgbGVmdEtleSwgdHlwZSwgbm9kZVR5cGUsIGlzTGFzdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJvb3RFbmQoY29udGV4dCwgdHlwZSwgbm9kZVR5cGUpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2Zvcm1hdERlbHRhQ2hpbGRyZW4nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JtYXREZWx0YUNoaWxkcmVuKGNvbnRleHQsIGRlbHRhLCBsZWZ0KSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB0aGlzLmZvckVhY2hEZWx0YUtleShkZWx0YSwgbGVmdCwgZnVuY3Rpb24gKGtleSwgbGVmdEtleSwgbW92ZWRGcm9tLCBpc0xhc3QpIHtcbiAgICAgICAgc2VsZi5yZWN1cnNlKGNvbnRleHQsIGRlbHRhW2tleV0sIGxlZnQgPyBsZWZ0W2xlZnRLZXldIDogdW5kZWZpbmVkLCBrZXksIGxlZnRLZXksIG1vdmVkRnJvbSwgaXNMYXN0KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2ZvckVhY2hEZWx0YUtleScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGZvckVhY2hEZWx0YUtleShkZWx0YSwgbGVmdCwgZm4pIHtcbiAgICAgIHZhciBrZXlzID0gZ2V0T2JqZWN0S2V5cyhkZWx0YSk7XG4gICAgICB2YXIgYXJyYXlLZXlzID0gZGVsdGEuX3QgPT09ICdhJztcbiAgICAgIHZhciBtb3ZlRGVzdGluYXRpb25zID0ge307XG4gICAgICB2YXIgbmFtZSA9IHZvaWQgMDtcbiAgICAgIGlmICh0eXBlb2YgbGVmdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgZm9yIChuYW1lIGluIGxlZnQpIHtcbiAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGxlZnQsIG5hbWUpKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGRlbHRhW25hbWVdID09PSAndW5kZWZpbmVkJyAmJiAoIWFycmF5S2V5cyB8fCB0eXBlb2YgZGVsdGFbJ18nICsgbmFtZV0gPT09ICd1bmRlZmluZWQnKSkge1xuICAgICAgICAgICAgICBrZXlzLnB1c2gobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBsb29rIGZvciBtb3ZlIGRlc3RpbmF0aW9uc1xuICAgICAgZm9yIChuYW1lIGluIGRlbHRhKSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZGVsdGEsIG5hbWUpKSB7XG4gICAgICAgICAgdmFyIHZhbHVlID0gZGVsdGFbbmFtZV07XG4gICAgICAgICAgaWYgKGlzQXJyYXkkMyh2YWx1ZSkgJiYgdmFsdWVbMl0gPT09IDMpIHtcbiAgICAgICAgICAgIG1vdmVEZXN0aW5hdGlvbnNbdmFsdWVbMV0udG9TdHJpbmcoKV0gPSB7XG4gICAgICAgICAgICAgIGtleTogbmFtZSxcbiAgICAgICAgICAgICAgdmFsdWU6IGxlZnQgJiYgbGVmdFtwYXJzZUludChuYW1lLnN1YnN0cigxKSldXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHRoaXMuaW5jbHVkZU1vdmVEZXN0aW5hdGlvbnMgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgbGVmdCA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGRlbHRhW3ZhbHVlWzFdXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBrZXlzLnB1c2godmFsdWVbMV0udG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChhcnJheUtleXMpIHtcbiAgICAgICAga2V5cy5zb3J0KGFycmF5S2V5Q29tcGFyZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAga2V5cy5zb3J0KCk7XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBpbmRleCA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICB2YXIga2V5ID0ga2V5c1tpbmRleF07XG4gICAgICAgIGlmIChhcnJheUtleXMgJiYga2V5ID09PSAnX3QnKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGxlZnRLZXkgPSBhcnJheUtleXMgPyB0eXBlb2Yga2V5ID09PSAnbnVtYmVyJyA/IGtleSA6IHBhcnNlSW50KHRyaW1VbmRlcnNjb3JlKGtleSksIDEwKSA6IGtleTtcbiAgICAgICAgdmFyIGlzTGFzdCA9IGluZGV4ID09PSBsZW5ndGggLSAxO1xuICAgICAgICBmbihrZXksIGxlZnRLZXksIG1vdmVEZXN0aW5hdGlvbnNbbGVmdEtleV0sIGlzTGFzdCk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZ2V0RGVsdGFUeXBlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0RGVsdGFUeXBlKGRlbHRhLCBtb3ZlZEZyb20pIHtcbiAgICAgIGlmICh0eXBlb2YgZGVsdGEgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbW92ZWRGcm9tICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHJldHVybiAnbW92ZWRlc3RpbmF0aW9uJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJ3VuY2hhbmdlZCc7XG4gICAgICB9XG4gICAgICBpZiAoaXNBcnJheSQzKGRlbHRhKSkge1xuICAgICAgICBpZiAoZGVsdGEubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgcmV0dXJuICdhZGRlZCc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlbHRhLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgIHJldHVybiAnbW9kaWZpZWQnO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkZWx0YS5sZW5ndGggPT09IDMgJiYgZGVsdGFbMl0gPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gJ2RlbGV0ZWQnO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkZWx0YS5sZW5ndGggPT09IDMgJiYgZGVsdGFbMl0gPT09IDIpIHtcbiAgICAgICAgICByZXR1cm4gJ3RleHRkaWZmJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVsdGEubGVuZ3RoID09PSAzICYmIGRlbHRhWzJdID09PSAzKSB7XG4gICAgICAgICAgcmV0dXJuICdtb3ZlZCc7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoKHR5cGVvZiBkZWx0YSA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YoZGVsdGEpKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgcmV0dXJuICdub2RlJztcbiAgICAgIH1cbiAgICAgIHJldHVybiAndW5rbm93bic7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncGFyc2VUZXh0RGlmZicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHBhcnNlVGV4dERpZmYodmFsdWUpIHtcbiAgICAgIHZhciBvdXRwdXQgPSBbXTtcbiAgICAgIHZhciBsaW5lcyA9IHZhbHVlLnNwbGl0KCdcXG5AQCAnKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGluZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBsaW5lID0gbGluZXNbaV07XG4gICAgICAgIHZhciBsaW5lT3V0cHV0ID0ge1xuICAgICAgICAgIHBpZWNlczogW11cbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGxvY2F0aW9uID0gL14oPzpAQCApP1stK10/KFxcZCspLChcXGQrKS8uZXhlYyhsaW5lKS5zbGljZSgxKTtcbiAgICAgICAgbGluZU91dHB1dC5sb2NhdGlvbiA9IHtcbiAgICAgICAgICBsaW5lOiBsb2NhdGlvblswXSxcbiAgICAgICAgICBjaHI6IGxvY2F0aW9uWzFdXG4gICAgICAgIH07XG4gICAgICAgIHZhciBwaWVjZXMgPSBsaW5lLnNwbGl0KCdcXG4nKS5zbGljZSgxKTtcbiAgICAgICAgZm9yICh2YXIgcGllY2VJbmRleCA9IDAsIHBpZWNlc0xlbmd0aCA9IHBpZWNlcy5sZW5ndGg7IHBpZWNlSW5kZXggPCBwaWVjZXNMZW5ndGg7IHBpZWNlSW5kZXgrKykge1xuICAgICAgICAgIHZhciBwaWVjZSA9IHBpZWNlc1twaWVjZUluZGV4XTtcbiAgICAgICAgICBpZiAoIXBpZWNlLmxlbmd0aCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBwaWVjZU91dHB1dCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdjb250ZXh0J1xuICAgICAgICAgIH07XG4gICAgICAgICAgaWYgKHBpZWNlLnN1YnN0cigwLCAxKSA9PT0gJysnKSB7XG4gICAgICAgICAgICBwaWVjZU91dHB1dC50eXBlID0gJ2FkZGVkJztcbiAgICAgICAgICB9IGVsc2UgaWYgKHBpZWNlLnN1YnN0cigwLCAxKSA9PT0gJy0nKSB7XG4gICAgICAgICAgICBwaWVjZU91dHB1dC50eXBlID0gJ2RlbGV0ZWQnO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwaWVjZU91dHB1dC50ZXh0ID0gcGllY2Uuc2xpY2UoMSk7XG4gICAgICAgICAgbGluZU91dHB1dC5waWVjZXMucHVzaChwaWVjZU91dHB1dCk7XG4gICAgICAgIH1cbiAgICAgICAgb3V0cHV0LnB1c2gobGluZU91dHB1dCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH1cbiAgfV0pO1xuICByZXR1cm4gQmFzZUZvcm1hdHRlcjtcbn0oKTtcblxuXG5cbnZhciBiYXNlID0gT2JqZWN0LmZyZWV6ZSh7XG5cdGRlZmF1bHQ6IEJhc2VGb3JtYXR0ZXJcbn0pO1xuXG52YXIgSHRtbEZvcm1hdHRlciA9IGZ1bmN0aW9uIChfQmFzZUZvcm1hdHRlcikge1xuICBpbmhlcml0cyhIdG1sRm9ybWF0dGVyLCBfQmFzZUZvcm1hdHRlcik7XG5cbiAgZnVuY3Rpb24gSHRtbEZvcm1hdHRlcigpIHtcbiAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBIdG1sRm9ybWF0dGVyKTtcbiAgICByZXR1cm4gcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoSHRtbEZvcm1hdHRlci5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKEh0bWxGb3JtYXR0ZXIpKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgfVxuXG4gIGNyZWF0ZUNsYXNzKEh0bWxGb3JtYXR0ZXIsIFt7XG4gICAga2V5OiAndHlwZUZvcm1hdHR0ZXJFcnJvckZvcm1hdHRlcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHR5cGVGb3JtYXR0dGVyRXJyb3JGb3JtYXR0ZXIoY29udGV4dCwgZXJyKSB7XG4gICAgICBjb250ZXh0Lm91dCgnPHByZSBjbGFzcz1cImpzb25kaWZmcGF0Y2gtZXJyb3JcIj4nICsgZXJyICsgJzwvcHJlPicpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2Zvcm1hdFZhbHVlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZm9ybWF0VmFsdWUoY29udGV4dCwgdmFsdWUpIHtcbiAgICAgIGNvbnRleHQub3V0KCc8cHJlPicgKyBodG1sRXNjYXBlKEpTT04uc3RyaW5naWZ5KHZhbHVlLCBudWxsLCAyKSkgKyAnPC9wcmU+Jyk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZm9ybWF0VGV4dERpZmZTdHJpbmcnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JtYXRUZXh0RGlmZlN0cmluZyhjb250ZXh0LCB2YWx1ZSkge1xuICAgICAgdmFyIGxpbmVzID0gdGhpcy5wYXJzZVRleHREaWZmKHZhbHVlKTtcbiAgICAgIGNvbnRleHQub3V0KCc8dWwgY2xhc3M9XCJqc29uZGlmZnBhdGNoLXRleHRkaWZmXCI+Jyk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxpbmVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgbGluZSA9IGxpbmVzW2ldO1xuICAgICAgICBjb250ZXh0Lm91dCgnPGxpPjxkaXYgY2xhc3M9XCJqc29uZGlmZnBhdGNoLXRleHRkaWZmLWxvY2F0aW9uXCI+JyArICgnPHNwYW4gY2xhc3M9XCJqc29uZGlmZnBhdGNoLXRleHRkaWZmLWxpbmUtbnVtYmVyXCI+JyArIGxpbmUubG9jYXRpb24ubGluZSArICc8L3NwYW4+PHNwYW4gY2xhc3M9XCJqc29uZGlmZnBhdGNoLXRleHRkaWZmLWNoYXJcIj4nICsgbGluZS5sb2NhdGlvbi5jaHIgKyAnPC9zcGFuPjwvZGl2PjxkaXYgY2xhc3M9XCJqc29uZGlmZnBhdGNoLXRleHRkaWZmLWxpbmVcIj4nKSk7XG4gICAgICAgIHZhciBwaWVjZXMgPSBsaW5lLnBpZWNlcztcbiAgICAgICAgZm9yICh2YXIgcGllY2VJbmRleCA9IDAsIHBpZWNlc0xlbmd0aCA9IHBpZWNlcy5sZW5ndGg7IHBpZWNlSW5kZXggPCBwaWVjZXNMZW5ndGg7IHBpZWNlSW5kZXgrKykge1xuICAgICAgICAgIC8qIGdsb2JhbCBkZWNvZGVVUkkgKi9cbiAgICAgICAgICB2YXIgcGllY2UgPSBwaWVjZXNbcGllY2VJbmRleF07XG4gICAgICAgICAgY29udGV4dC5vdXQoJzxzcGFuIGNsYXNzPVwianNvbmRpZmZwYXRjaC10ZXh0ZGlmZi0nICsgcGllY2UudHlwZSArICdcIj4nICsgaHRtbEVzY2FwZShkZWNvZGVVUkkocGllY2UudGV4dCkpICsgJzwvc3Bhbj4nKTtcbiAgICAgICAgfVxuICAgICAgICBjb250ZXh0Lm91dCgnPC9kaXY+PC9saT4nKTtcbiAgICAgIH1cbiAgICAgIGNvbnRleHQub3V0KCc8L3VsPicpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3Jvb3RCZWdpbicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJvb3RCZWdpbihjb250ZXh0LCB0eXBlLCBub2RlVHlwZSkge1xuICAgICAgdmFyIG5vZGVDbGFzcyA9ICdqc29uZGlmZnBhdGNoLScgKyB0eXBlICsgKG5vZGVUeXBlID8gJyBqc29uZGlmZnBhdGNoLWNoaWxkLW5vZGUtdHlwZS0nICsgbm9kZVR5cGUgOiAnJyk7XG4gICAgICBjb250ZXh0Lm91dCgnPGRpdiBjbGFzcz1cImpzb25kaWZmcGF0Y2gtZGVsdGEgJyArIG5vZGVDbGFzcyArICdcIj4nKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdyb290RW5kJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcm9vdEVuZChjb250ZXh0KSB7XG4gICAgICBjb250ZXh0Lm91dCgnPC9kaXY+JyArIChjb250ZXh0Lmhhc0Fycm93cyA/ICc8c2NyaXB0IHR5cGU9XCJ0ZXh0L2phdmFzY3JpcHRcIj5zZXRUaW1lb3V0KCcgKyAoYWRqdXN0QXJyb3dzLnRvU3RyaW5nKCkgKyAnLDEwKTs8L3NjcmlwdD4nKSA6ICcnKSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnbm9kZUJlZ2luJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbm9kZUJlZ2luKGNvbnRleHQsIGtleSwgbGVmdEtleSwgdHlwZSwgbm9kZVR5cGUpIHtcbiAgICAgIHZhciBub2RlQ2xhc3MgPSAnanNvbmRpZmZwYXRjaC0nICsgdHlwZSArIChub2RlVHlwZSA/ICcganNvbmRpZmZwYXRjaC1jaGlsZC1ub2RlLXR5cGUtJyArIG5vZGVUeXBlIDogJycpO1xuICAgICAgY29udGV4dC5vdXQoJzxsaSBjbGFzcz1cIicgKyBub2RlQ2xhc3MgKyAnXCIgZGF0YS1rZXk9XCInICsgbGVmdEtleSArICdcIj4nICsgKCc8ZGl2IGNsYXNzPVwianNvbmRpZmZwYXRjaC1wcm9wZXJ0eS1uYW1lXCI+JyArIGxlZnRLZXkgKyAnPC9kaXY+JykpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ25vZGVFbmQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBub2RlRW5kKGNvbnRleHQpIHtcbiAgICAgIGNvbnRleHQub3V0KCc8L2xpPicpO1xuICAgIH1cblxuICAgIC8qIGpzaGludCBjYW1lbGNhc2U6IGZhbHNlICovXG4gICAgLyogZXNsaW50LWRpc2FibGUgY2FtZWxjYXNlICovXG5cbiAgfSwge1xuICAgIGtleTogJ2Zvcm1hdF91bmNoYW5nZWQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JtYXRfdW5jaGFuZ2VkKGNvbnRleHQsIGRlbHRhLCBsZWZ0KSB7XG4gICAgICBpZiAodHlwZW9mIGxlZnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnRleHQub3V0KCc8ZGl2IGNsYXNzPVwianNvbmRpZmZwYXRjaC12YWx1ZVwiPicpO1xuICAgICAgdGhpcy5mb3JtYXRWYWx1ZShjb250ZXh0LCBsZWZ0KTtcbiAgICAgIGNvbnRleHQub3V0KCc8L2Rpdj4nKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdmb3JtYXRfbW92ZWRlc3RpbmF0aW9uJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZm9ybWF0X21vdmVkZXN0aW5hdGlvbihjb250ZXh0LCBkZWx0YSwgbGVmdCkge1xuICAgICAgaWYgKHR5cGVvZiBsZWZ0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb250ZXh0Lm91dCgnPGRpdiBjbGFzcz1cImpzb25kaWZmcGF0Y2gtdmFsdWVcIj4nKTtcbiAgICAgIHRoaXMuZm9ybWF0VmFsdWUoY29udGV4dCwgbGVmdCk7XG4gICAgICBjb250ZXh0Lm91dCgnPC9kaXY+Jyk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZm9ybWF0X25vZGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JtYXRfbm9kZShjb250ZXh0LCBkZWx0YSwgbGVmdCkge1xuICAgICAgLy8gcmVjdXJzZVxuICAgICAgdmFyIG5vZGVUeXBlID0gZGVsdGEuX3QgPT09ICdhJyA/ICdhcnJheScgOiAnb2JqZWN0JztcbiAgICAgIGNvbnRleHQub3V0KCc8dWwgY2xhc3M9XCJqc29uZGlmZnBhdGNoLW5vZGUganNvbmRpZmZwYXRjaC1ub2RlLXR5cGUtJyArIG5vZGVUeXBlICsgJ1wiPicpO1xuICAgICAgdGhpcy5mb3JtYXREZWx0YUNoaWxkcmVuKGNvbnRleHQsIGRlbHRhLCBsZWZ0KTtcbiAgICAgIGNvbnRleHQub3V0KCc8L3VsPicpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2Zvcm1hdF9hZGRlZCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGZvcm1hdF9hZGRlZChjb250ZXh0LCBkZWx0YSkge1xuICAgICAgY29udGV4dC5vdXQoJzxkaXYgY2xhc3M9XCJqc29uZGlmZnBhdGNoLXZhbHVlXCI+Jyk7XG4gICAgICB0aGlzLmZvcm1hdFZhbHVlKGNvbnRleHQsIGRlbHRhWzBdKTtcbiAgICAgIGNvbnRleHQub3V0KCc8L2Rpdj4nKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdmb3JtYXRfbW9kaWZpZWQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JtYXRfbW9kaWZpZWQoY29udGV4dCwgZGVsdGEpIHtcbiAgICAgIGNvbnRleHQub3V0KCc8ZGl2IGNsYXNzPVwianNvbmRpZmZwYXRjaC12YWx1ZSBqc29uZGlmZnBhdGNoLWxlZnQtdmFsdWVcIj4nKTtcbiAgICAgIHRoaXMuZm9ybWF0VmFsdWUoY29udGV4dCwgZGVsdGFbMF0pO1xuICAgICAgY29udGV4dC5vdXQoJzwvZGl2PicgKyAnPGRpdiBjbGFzcz1cImpzb25kaWZmcGF0Y2gtdmFsdWUganNvbmRpZmZwYXRjaC1yaWdodC12YWx1ZVwiPicpO1xuICAgICAgdGhpcy5mb3JtYXRWYWx1ZShjb250ZXh0LCBkZWx0YVsxXSk7XG4gICAgICBjb250ZXh0Lm91dCgnPC9kaXY+Jyk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZm9ybWF0X2RlbGV0ZWQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JtYXRfZGVsZXRlZChjb250ZXh0LCBkZWx0YSkge1xuICAgICAgY29udGV4dC5vdXQoJzxkaXYgY2xhc3M9XCJqc29uZGlmZnBhdGNoLXZhbHVlXCI+Jyk7XG4gICAgICB0aGlzLmZvcm1hdFZhbHVlKGNvbnRleHQsIGRlbHRhWzBdKTtcbiAgICAgIGNvbnRleHQub3V0KCc8L2Rpdj4nKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdmb3JtYXRfbW92ZWQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JtYXRfbW92ZWQoY29udGV4dCwgZGVsdGEpIHtcbiAgICAgIGNvbnRleHQub3V0KCc8ZGl2IGNsYXNzPVwianNvbmRpZmZwYXRjaC12YWx1ZVwiPicpO1xuICAgICAgdGhpcy5mb3JtYXRWYWx1ZShjb250ZXh0LCBkZWx0YVswXSk7XG4gICAgICBjb250ZXh0Lm91dCgnPC9kaXY+PGRpdiBjbGFzcz1cImpzb25kaWZmcGF0Y2gtbW92ZWQtZGVzdGluYXRpb25cIj4nICsgZGVsdGFbMV0gKyAnPC9kaXY+Jyk7XG5cbiAgICAgIC8vIGRyYXcgYW4gU1ZHIGFycm93IGZyb20gaGVyZSB0byBtb3ZlIGRlc3RpbmF0aW9uXG4gICAgICBjb250ZXh0Lm91dChcbiAgICAgIC8qIGpzaGludCBtdWx0aXN0cjogdHJ1ZSAqL1xuICAgICAgJzxkaXYgY2xhc3M9XCJqc29uZGlmZnBhdGNoLWFycm93XCIgJyArICdzdHlsZT1cInBvc2l0aW9uOiByZWxhdGl2ZTsgbGVmdDogLTM0cHg7XCI+XFxuICAgICAgICAgIDxzdmcgd2lkdGg9XCIzMFwiIGhlaWdodD1cIjYwXCIgJyArICdzdHlsZT1cInBvc2l0aW9uOiBhYnNvbHV0ZTsgZGlzcGxheTogbm9uZTtcIj5cXG4gICAgICAgICAgPGRlZnM+XFxuICAgICAgICAgICAgICA8bWFya2VyIGlkPVwibWFya2VyQXJyb3dcIiBtYXJrZXJXaWR0aD1cIjhcIiBtYXJrZXJIZWlnaHQ9XCI4XCJcXG4gICAgICAgICAgICAgICAgIHJlZng9XCIyXCIgcmVmeT1cIjRcIlxcbiAgICAgICAgICAgICAgICAgICAgIG9yaWVudD1cImF1dG9cIiBtYXJrZXJVbml0cz1cInVzZXJTcGFjZU9uVXNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIk0xLDEgTDEsNyBMNyw0IEwxLDFcIiBzdHlsZT1cImZpbGw6ICMzMzk7XCIgLz5cXG4gICAgICAgICAgICAgIDwvbWFya2VyPlxcbiAgICAgICAgICA8L2RlZnM+XFxuICAgICAgICAgIDxwYXRoIGQ9XCJNMzAsMCBRLTEwLDI1IDI2LDUwXCJcXG4gICAgICAgICAgICBzdHlsZT1cInN0cm9rZTogIzg4Zjsgc3Ryb2tlLXdpZHRoOiAycHg7IGZpbGw6IG5vbmU7ICcgKyAnc3Ryb2tlLW9wYWNpdHk6IDAuNTsgbWFya2VyLWVuZDogdXJsKCNtYXJrZXJBcnJvdyk7XCJcXG4gICAgICAgICAgPjwvcGF0aD5cXG4gICAgICAgICAgPC9zdmc+XFxuICAgICAgPC9kaXY+Jyk7XG4gICAgICBjb250ZXh0Lmhhc0Fycm93cyA9IHRydWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZm9ybWF0X3RleHRkaWZmJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZm9ybWF0X3RleHRkaWZmKGNvbnRleHQsIGRlbHRhKSB7XG4gICAgICBjb250ZXh0Lm91dCgnPGRpdiBjbGFzcz1cImpzb25kaWZmcGF0Y2gtdmFsdWVcIj4nKTtcbiAgICAgIHRoaXMuZm9ybWF0VGV4dERpZmZTdHJpbmcoY29udGV4dCwgZGVsdGFbMF0pO1xuICAgICAgY29udGV4dC5vdXQoJzwvZGl2PicpO1xuICAgIH1cbiAgfV0pO1xuICByZXR1cm4gSHRtbEZvcm1hdHRlcjtcbn0oQmFzZUZvcm1hdHRlcik7XG5cbmZ1bmN0aW9uIGh0bWxFc2NhcGUodGV4dCkge1xuICB2YXIgaHRtbCA9IHRleHQ7XG4gIHZhciByZXBsYWNlbWVudHMgPSBbWy8mL2csICcmYW1wOyddLCBbLzwvZywgJyZsdDsnXSwgWy8+L2csICcmZ3Q7J10sIFsvJy9nLCAnJmFwb3M7J10sIFsvXCIvZywgJyZxdW90OyddXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXBsYWNlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICBodG1sID0gaHRtbC5yZXBsYWNlKHJlcGxhY2VtZW50c1tpXVswXSwgcmVwbGFjZW1lbnRzW2ldWzFdKTtcbiAgfVxuICByZXR1cm4gaHRtbDtcbn1cblxudmFyIGFkanVzdEFycm93cyA9IGZ1bmN0aW9uIGpzb25kaWZmcGF0Y2hIdG1sRm9ybWF0dGVyQWRqdXN0QXJyb3dzKG5vZGVBcmcpIHtcbiAgdmFyIG5vZGUgPSBub2RlQXJnIHx8IGRvY3VtZW50O1xuICB2YXIgZ2V0RWxlbWVudFRleHQgPSBmdW5jdGlvbiBnZXRFbGVtZW50VGV4dChfcmVmKSB7XG4gICAgdmFyIHRleHRDb250ZW50ID0gX3JlZi50ZXh0Q29udGVudCxcbiAgICAgICAgaW5uZXJUZXh0ID0gX3JlZi5pbm5lclRleHQ7XG4gICAgcmV0dXJuIHRleHRDb250ZW50IHx8IGlubmVyVGV4dDtcbiAgfTtcbiAgdmFyIGVhY2hCeVF1ZXJ5ID0gZnVuY3Rpb24gZWFjaEJ5UXVlcnkoZWwsIHF1ZXJ5LCBmbikge1xuICAgIHZhciBlbGVtcyA9IGVsLnF1ZXJ5U2VsZWN0b3JBbGwocXVlcnkpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gZWxlbXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmbihlbGVtc1tpXSk7XG4gICAgfVxuICB9O1xuICB2YXIgZWFjaENoaWxkcmVuID0gZnVuY3Rpb24gZWFjaENoaWxkcmVuKF9yZWYyLCBmbikge1xuICAgIHZhciBjaGlsZHJlbiA9IF9yZWYyLmNoaWxkcmVuO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZuKGNoaWxkcmVuW2ldLCBpKTtcbiAgICB9XG4gIH07XG4gIGVhY2hCeVF1ZXJ5KG5vZGUsICcuanNvbmRpZmZwYXRjaC1hcnJvdycsIGZ1bmN0aW9uIChfcmVmMykge1xuICAgIHZhciBwYXJlbnROb2RlID0gX3JlZjMucGFyZW50Tm9kZSxcbiAgICAgICAgY2hpbGRyZW4gPSBfcmVmMy5jaGlsZHJlbixcbiAgICAgICAgc3R5bGUgPSBfcmVmMy5zdHlsZTtcblxuICAgIHZhciBhcnJvd1BhcmVudCA9IHBhcmVudE5vZGU7XG4gICAgdmFyIHN2ZyA9IGNoaWxkcmVuWzBdO1xuICAgIHZhciBwYXRoID0gc3ZnLmNoaWxkcmVuWzFdO1xuICAgIHN2Zy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIHZhciBkZXN0aW5hdGlvbiA9IGdldEVsZW1lbnRUZXh0KGFycm93UGFyZW50LnF1ZXJ5U2VsZWN0b3IoJy5qc29uZGlmZnBhdGNoLW1vdmVkLWRlc3RpbmF0aW9uJykpO1xuICAgIHZhciBjb250YWluZXIgPSBhcnJvd1BhcmVudC5wYXJlbnROb2RlO1xuICAgIHZhciBkZXN0aW5hdGlvbkVsZW0gPSB2b2lkIDA7XG4gICAgZWFjaENoaWxkcmVuKGNvbnRhaW5lciwgZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICBpZiAoY2hpbGQuZ2V0QXR0cmlidXRlKCdkYXRhLWtleScpID09PSBkZXN0aW5hdGlvbikge1xuICAgICAgICBkZXN0aW5hdGlvbkVsZW0gPSBjaGlsZDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoIWRlc3RpbmF0aW9uRWxlbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgdmFyIGRpc3RhbmNlID0gZGVzdGluYXRpb25FbGVtLm9mZnNldFRvcCAtIGFycm93UGFyZW50Lm9mZnNldFRvcDtcbiAgICAgIHN2Zy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIE1hdGguYWJzKGRpc3RhbmNlKSArIDYpO1xuICAgICAgc3R5bGUudG9wID0gLTggKyAoZGlzdGFuY2UgPiAwID8gMCA6IGRpc3RhbmNlKSArICdweCc7XG4gICAgICB2YXIgY3VydmUgPSBkaXN0YW5jZSA+IDAgPyAnTTMwLDAgUS0xMCwnICsgTWF0aC5yb3VuZChkaXN0YW5jZSAvIDIpICsgJyAyNiwnICsgKGRpc3RhbmNlIC0gNCkgOiAnTTMwLCcgKyAtZGlzdGFuY2UgKyAnIFEtMTAsJyArIE1hdGgucm91bmQoLWRpc3RhbmNlIC8gMikgKyAnIDI2LDQnO1xuICAgICAgcGF0aC5zZXRBdHRyaWJ1dGUoJ2QnLCBjdXJ2ZSk7XG4gICAgICBzdmcuc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgIH0gY2F0Y2ggKGVycikge31cbiAgfSk7XG59O1xuXG4vKiBqc2hpbnQgY2FtZWxjYXNlOiB0cnVlICovXG4vKiBlc2xpbnQtZW5hYmxlIGNhbWVsY2FzZSAqL1xuXG52YXIgc2hvd1VuY2hhbmdlZCA9IGZ1bmN0aW9uIHNob3dVbmNoYW5nZWQoc2hvdywgbm9kZSwgZGVsYXkpIHtcbiAgdmFyIGVsID0gbm9kZSB8fCBkb2N1bWVudC5ib2R5O1xuICB2YXIgcHJlZml4ID0gJ2pzb25kaWZmcGF0Y2gtdW5jaGFuZ2VkLSc7XG4gIHZhciBjbGFzc2VzID0ge1xuICAgIHNob3dpbmc6IHByZWZpeCArICdzaG93aW5nJyxcbiAgICBoaWRpbmc6IHByZWZpeCArICdoaWRpbmcnLFxuICAgIHZpc2libGU6IHByZWZpeCArICd2aXNpYmxlJyxcbiAgICBoaWRkZW46IHByZWZpeCArICdoaWRkZW4nXG4gIH07XG4gIHZhciBsaXN0ID0gZWwuY2xhc3NMaXN0O1xuICBpZiAoIWxpc3QpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKCFkZWxheSkge1xuICAgIGxpc3QucmVtb3ZlKGNsYXNzZXMuc2hvd2luZyk7XG4gICAgbGlzdC5yZW1vdmUoY2xhc3Nlcy5oaWRpbmcpO1xuICAgIGxpc3QucmVtb3ZlKGNsYXNzZXMudmlzaWJsZSk7XG4gICAgbGlzdC5yZW1vdmUoY2xhc3Nlcy5oaWRkZW4pO1xuICAgIGlmIChzaG93ID09PSBmYWxzZSkge1xuICAgICAgbGlzdC5hZGQoY2xhc3Nlcy5oaWRkZW4pO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHNob3cgPT09IGZhbHNlKSB7XG4gICAgbGlzdC5yZW1vdmUoY2xhc3Nlcy5zaG93aW5nKTtcbiAgICBsaXN0LmFkZChjbGFzc2VzLnZpc2libGUpO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgbGlzdC5hZGQoY2xhc3Nlcy5oaWRpbmcpO1xuICAgIH0sIDEwKTtcbiAgfSBlbHNlIHtcbiAgICBsaXN0LnJlbW92ZShjbGFzc2VzLmhpZGluZyk7XG4gICAgbGlzdC5hZGQoY2xhc3Nlcy5zaG93aW5nKTtcbiAgICBsaXN0LnJlbW92ZShjbGFzc2VzLmhpZGRlbik7XG4gIH1cbiAgdmFyIGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgYWRqdXN0QXJyb3dzKGVsKTtcbiAgfSwgMTAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgbGlzdC5yZW1vdmUoY2xhc3Nlcy5zaG93aW5nKTtcbiAgICBsaXN0LnJlbW92ZShjbGFzc2VzLmhpZGluZyk7XG4gICAgaWYgKHNob3cgPT09IGZhbHNlKSB7XG4gICAgICBsaXN0LmFkZChjbGFzc2VzLmhpZGRlbik7XG4gICAgICBsaXN0LnJlbW92ZShjbGFzc2VzLnZpc2libGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LmFkZChjbGFzc2VzLnZpc2libGUpO1xuICAgICAgbGlzdC5yZW1vdmUoY2xhc3Nlcy5oaWRkZW4pO1xuICAgIH1cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGxpc3QucmVtb3ZlKGNsYXNzZXMudmlzaWJsZSk7XG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpO1xuICAgIH0sIGRlbGF5ICsgNDAwKTtcbiAgfSwgZGVsYXkpO1xufTtcblxudmFyIGhpZGVVbmNoYW5nZWQgPSBmdW5jdGlvbiBoaWRlVW5jaGFuZ2VkKG5vZGUsIGRlbGF5KSB7XG4gIHJldHVybiBzaG93VW5jaGFuZ2VkKGZhbHNlLCBub2RlLCBkZWxheSk7XG59O1xuXG52YXIgZGVmYXVsdEluc3RhbmNlID0gdm9pZCAwO1xuXG5mdW5jdGlvbiBmb3JtYXQoZGVsdGEsIGxlZnQpIHtcbiAgaWYgKCFkZWZhdWx0SW5zdGFuY2UpIHtcbiAgICBkZWZhdWx0SW5zdGFuY2UgPSBuZXcgSHRtbEZvcm1hdHRlcigpO1xuICB9XG4gIHJldHVybiBkZWZhdWx0SW5zdGFuY2UuZm9ybWF0KGRlbHRhLCBsZWZ0KTtcbn1cblxuXG5cbnZhciBodG1sID0gT2JqZWN0LmZyZWV6ZSh7XG5cdHNob3dVbmNoYW5nZWQ6IHNob3dVbmNoYW5nZWQsXG5cdGhpZGVVbmNoYW5nZWQ6IGhpZGVVbmNoYW5nZWQsXG5cdGRlZmF1bHQ6IEh0bWxGb3JtYXR0ZXIsXG5cdGZvcm1hdDogZm9ybWF0XG59KTtcblxudmFyIEFubm90YXRlZEZvcm1hdHRlciA9IGZ1bmN0aW9uIChfQmFzZUZvcm1hdHRlcikge1xuICBpbmhlcml0cyhBbm5vdGF0ZWRGb3JtYXR0ZXIsIF9CYXNlRm9ybWF0dGVyKTtcblxuICBmdW5jdGlvbiBBbm5vdGF0ZWRGb3JtYXR0ZXIoKSB7XG4gICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgQW5ub3RhdGVkRm9ybWF0dGVyKTtcblxuICAgIHZhciBfdGhpcyA9IHBvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKEFubm90YXRlZEZvcm1hdHRlci5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKEFubm90YXRlZEZvcm1hdHRlcikpLmNhbGwodGhpcykpO1xuXG4gICAgX3RoaXMuaW5jbHVkZU1vdmVEZXN0aW5hdGlvbnMgPSBmYWxzZTtcbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cblxuICBjcmVhdGVDbGFzcyhBbm5vdGF0ZWRGb3JtYXR0ZXIsIFt7XG4gICAga2V5OiAncHJlcGFyZUNvbnRleHQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwcmVwYXJlQ29udGV4dChjb250ZXh0KSB7XG4gICAgICBnZXQoQW5ub3RhdGVkRm9ybWF0dGVyLnByb3RvdHlwZS5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKEFubm90YXRlZEZvcm1hdHRlci5wcm90b3R5cGUpLCAncHJlcGFyZUNvbnRleHQnLCB0aGlzKS5jYWxsKHRoaXMsIGNvbnRleHQpO1xuICAgICAgY29udGV4dC5pbmRlbnQgPSBmdW5jdGlvbiAobGV2ZWxzKSB7XG4gICAgICAgIHRoaXMuaW5kZW50TGV2ZWwgPSAodGhpcy5pbmRlbnRMZXZlbCB8fCAwKSArICh0eXBlb2YgbGV2ZWxzID09PSAndW5kZWZpbmVkJyA/IDEgOiBsZXZlbHMpO1xuICAgICAgICB0aGlzLmluZGVudFBhZCA9IG5ldyBBcnJheSh0aGlzLmluZGVudExldmVsICsgMSkuam9pbignJm5ic3A7Jm5ic3A7Jyk7XG4gICAgICB9O1xuICAgICAgY29udGV4dC5yb3cgPSBmdW5jdGlvbiAoanNvbiwgaHRtbE5vdGUpIHtcbiAgICAgICAgY29udGV4dC5vdXQoJzx0cj48dGQgc3R5bGU9XCJ3aGl0ZS1zcGFjZTogbm93cmFwO1wiPicgKyAnPHByZSBjbGFzcz1cImpzb25kaWZmcGF0Y2gtYW5ub3RhdGVkLWluZGVudFwiJyArICcgc3R5bGU9XCJkaXNwbGF5OiBpbmxpbmUtYmxvY2tcIj4nKTtcbiAgICAgICAgY29udGV4dC5vdXQoY29udGV4dC5pbmRlbnRQYWQpO1xuICAgICAgICBjb250ZXh0Lm91dCgnPC9wcmU+PHByZSBzdHlsZT1cImRpc3BsYXk6IGlubGluZS1ibG9ja1wiPicpO1xuICAgICAgICBjb250ZXh0Lm91dChqc29uKTtcbiAgICAgICAgY29udGV4dC5vdXQoJzwvcHJlPjwvdGQ+PHRkIGNsYXNzPVwianNvbmRpZmZwYXRjaC1kZWx0YS1ub3RlXCI+PGRpdj4nKTtcbiAgICAgICAgY29udGV4dC5vdXQoaHRtbE5vdGUpO1xuICAgICAgICBjb250ZXh0Lm91dCgnPC9kaXY+PC90ZD48L3RyPicpO1xuICAgICAgfTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd0eXBlRm9ybWF0dHRlckVycm9yRm9ybWF0dGVyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdHlwZUZvcm1hdHR0ZXJFcnJvckZvcm1hdHRlcihjb250ZXh0LCBlcnIpIHtcbiAgICAgIGNvbnRleHQucm93KCcnLCAnPHByZSBjbGFzcz1cImpzb25kaWZmcGF0Y2gtZXJyb3JcIj4nICsgZXJyICsgJzwvcHJlPicpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2Zvcm1hdFRleHREaWZmU3RyaW5nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZm9ybWF0VGV4dERpZmZTdHJpbmcoY29udGV4dCwgdmFsdWUpIHtcbiAgICAgIHZhciBsaW5lcyA9IHRoaXMucGFyc2VUZXh0RGlmZih2YWx1ZSk7XG4gICAgICBjb250ZXh0Lm91dCgnPHVsIGNsYXNzPVwianNvbmRpZmZwYXRjaC10ZXh0ZGlmZlwiPicpO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsaW5lcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIGxpbmUgPSBsaW5lc1tpXTtcbiAgICAgICAgY29udGV4dC5vdXQoJzxsaT48ZGl2IGNsYXNzPVwianNvbmRpZmZwYXRjaC10ZXh0ZGlmZi1sb2NhdGlvblwiPicgKyAoJzxzcGFuIGNsYXNzPVwianNvbmRpZmZwYXRjaC10ZXh0ZGlmZi1saW5lLW51bWJlclwiPicgKyBsaW5lLmxvY2F0aW9uLmxpbmUgKyAnPC9zcGFuPjxzcGFuIGNsYXNzPVwianNvbmRpZmZwYXRjaC10ZXh0ZGlmZi1jaGFyXCI+JyArIGxpbmUubG9jYXRpb24uY2hyICsgJzwvc3Bhbj48L2Rpdj48ZGl2IGNsYXNzPVwianNvbmRpZmZwYXRjaC10ZXh0ZGlmZi1saW5lXCI+JykpO1xuICAgICAgICB2YXIgcGllY2VzID0gbGluZS5waWVjZXM7XG4gICAgICAgIGZvciAodmFyIHBpZWNlSW5kZXggPSAwLCBwaWVjZXNMZW5ndGggPSBwaWVjZXMubGVuZ3RoOyBwaWVjZUluZGV4IDwgcGllY2VzTGVuZ3RoOyBwaWVjZUluZGV4KyspIHtcbiAgICAgICAgICB2YXIgcGllY2UgPSBwaWVjZXNbcGllY2VJbmRleF07XG4gICAgICAgICAgY29udGV4dC5vdXQoJzxzcGFuIGNsYXNzPVwianNvbmRpZmZwYXRjaC10ZXh0ZGlmZi0nICsgcGllY2UudHlwZSArICdcIj4nICsgcGllY2UudGV4dCArICc8L3NwYW4+Jyk7XG4gICAgICAgIH1cbiAgICAgICAgY29udGV4dC5vdXQoJzwvZGl2PjwvbGk+Jyk7XG4gICAgICB9XG4gICAgICBjb250ZXh0Lm91dCgnPC91bD4nKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdyb290QmVnaW4nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByb290QmVnaW4oY29udGV4dCwgdHlwZSwgbm9kZVR5cGUpIHtcbiAgICAgIGNvbnRleHQub3V0KCc8dGFibGUgY2xhc3M9XCJqc29uZGlmZnBhdGNoLWFubm90YXRlZC1kZWx0YVwiPicpO1xuICAgICAgaWYgKHR5cGUgPT09ICdub2RlJykge1xuICAgICAgICBjb250ZXh0LnJvdygneycpO1xuICAgICAgICBjb250ZXh0LmluZGVudCgpO1xuICAgICAgfVxuICAgICAgaWYgKG5vZGVUeXBlID09PSAnYXJyYXknKSB7XG4gICAgICAgIGNvbnRleHQucm93KCdcIl90XCI6IFwiYVwiLCcsICdBcnJheSBkZWx0YSAobWVtYmVyIG5hbWVzIGluZGljYXRlIGFycmF5IGluZGljZXMpJyk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncm9vdEVuZCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJvb3RFbmQoY29udGV4dCwgdHlwZSkge1xuICAgICAgaWYgKHR5cGUgPT09ICdub2RlJykge1xuICAgICAgICBjb250ZXh0LmluZGVudCgtMSk7XG4gICAgICAgIGNvbnRleHQucm93KCd9Jyk7XG4gICAgICB9XG4gICAgICBjb250ZXh0Lm91dCgnPC90YWJsZT4nKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdub2RlQmVnaW4nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBub2RlQmVnaW4oY29udGV4dCwga2V5LCBsZWZ0S2V5LCB0eXBlLCBub2RlVHlwZSkge1xuICAgICAgY29udGV4dC5yb3coJyZxdW90OycgKyBrZXkgKyAnJnF1b3Q7OiB7Jyk7XG4gICAgICBpZiAodHlwZSA9PT0gJ25vZGUnKSB7XG4gICAgICAgIGNvbnRleHQuaW5kZW50KCk7XG4gICAgICB9XG4gICAgICBpZiAobm9kZVR5cGUgPT09ICdhcnJheScpIHtcbiAgICAgICAgY29udGV4dC5yb3coJ1wiX3RcIjogXCJhXCIsJywgJ0FycmF5IGRlbHRhIChtZW1iZXIgbmFtZXMgaW5kaWNhdGUgYXJyYXkgaW5kaWNlcyknKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdub2RlRW5kJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbm9kZUVuZChjb250ZXh0LCBrZXksIGxlZnRLZXksIHR5cGUsIG5vZGVUeXBlLCBpc0xhc3QpIHtcbiAgICAgIGlmICh0eXBlID09PSAnbm9kZScpIHtcbiAgICAgICAgY29udGV4dC5pbmRlbnQoLTEpO1xuICAgICAgfVxuICAgICAgY29udGV4dC5yb3coJ30nICsgKGlzTGFzdCA/ICcnIDogJywnKSk7XG4gICAgfVxuXG4gICAgLyoganNoaW50IGNhbWVsY2FzZTogZmFsc2UgKi9cblxuICAgIC8qIGVzbGludC1kaXNhYmxlIGNhbWVsY2FzZSAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdmb3JtYXRfdW5jaGFuZ2VkJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZm9ybWF0X3VuY2hhbmdlZCgpIHt9XG4gIH0sIHtcbiAgICBrZXk6ICdmb3JtYXRfbW92ZWRlc3RpbmF0aW9uJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZm9ybWF0X21vdmVkZXN0aW5hdGlvbigpIHt9XG4gIH0sIHtcbiAgICBrZXk6ICdmb3JtYXRfbm9kZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGZvcm1hdF9ub2RlKGNvbnRleHQsIGRlbHRhLCBsZWZ0KSB7XG4gICAgICAvLyByZWN1cnNlXG4gICAgICB0aGlzLmZvcm1hdERlbHRhQ2hpbGRyZW4oY29udGV4dCwgZGVsdGEsIGxlZnQpO1xuICAgIH1cbiAgfV0pO1xuICByZXR1cm4gQW5ub3RhdGVkRm9ybWF0dGVyO1xufShCYXNlRm9ybWF0dGVyKTtcblxuLyogZXNsaW50LWVuYWJsZSBjYW1lbGNhc2UgKi9cblxudmFyIHdyYXBQcm9wZXJ0eU5hbWUgPSBmdW5jdGlvbiB3cmFwUHJvcGVydHlOYW1lKG5hbWUpIHtcbiAgcmV0dXJuICc8cHJlIHN0eWxlPVwiZGlzcGxheTppbmxpbmUtYmxvY2tcIj4mcXVvdDsnICsgbmFtZSArICcmcXVvdDs8L3ByZT4nO1xufTtcblxudmFyIGRlbHRhQW5ub3RhdGlvbnMgPSB7XG4gIGFkZGVkOiBmdW5jdGlvbiBhZGRlZChkZWx0YSwgbGVmdCwga2V5LCBsZWZ0S2V5KSB7XG4gICAgdmFyIGZvcm1hdExlZ2VuZCA9ICcgPHByZT4oW25ld1ZhbHVlXSk8L3ByZT4nO1xuICAgIGlmICh0eXBlb2YgbGVmdEtleSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiAnbmV3IHZhbHVlJyArIGZvcm1hdExlZ2VuZDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBsZWZ0S2V5ID09PSAnbnVtYmVyJykge1xuICAgICAgcmV0dXJuICdpbnNlcnQgYXQgaW5kZXggJyArIGxlZnRLZXkgKyBmb3JtYXRMZWdlbmQ7XG4gICAgfVxuICAgIHJldHVybiAnYWRkIHByb3BlcnR5ICcgKyB3cmFwUHJvcGVydHlOYW1lKGxlZnRLZXkpICsgZm9ybWF0TGVnZW5kO1xuICB9LFxuICBtb2RpZmllZDogZnVuY3Rpb24gbW9kaWZpZWQoZGVsdGEsIGxlZnQsIGtleSwgbGVmdEtleSkge1xuICAgIHZhciBmb3JtYXRMZWdlbmQgPSAnIDxwcmU+KFtwcmV2aW91c1ZhbHVlLCBuZXdWYWx1ZV0pPC9wcmU+JztcbiAgICBpZiAodHlwZW9mIGxlZnRLZXkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gJ21vZGlmeSB2YWx1ZScgKyBmb3JtYXRMZWdlbmQ7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgbGVmdEtleSA9PT0gJ251bWJlcicpIHtcbiAgICAgIHJldHVybiAnbW9kaWZ5IGF0IGluZGV4ICcgKyBsZWZ0S2V5ICsgZm9ybWF0TGVnZW5kO1xuICAgIH1cbiAgICByZXR1cm4gJ21vZGlmeSBwcm9wZXJ0eSAnICsgd3JhcFByb3BlcnR5TmFtZShsZWZ0S2V5KSArIGZvcm1hdExlZ2VuZDtcbiAgfSxcbiAgZGVsZXRlZDogZnVuY3Rpb24gZGVsZXRlZChkZWx0YSwgbGVmdCwga2V5LCBsZWZ0S2V5KSB7XG4gICAgdmFyIGZvcm1hdExlZ2VuZCA9ICcgPHByZT4oW3ByZXZpb3VzVmFsdWUsIDAsIDBdKTwvcHJlPic7XG4gICAgaWYgKHR5cGVvZiBsZWZ0S2V5ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuICdkZWxldGUgdmFsdWUnICsgZm9ybWF0TGVnZW5kO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGxlZnRLZXkgPT09ICdudW1iZXInKSB7XG4gICAgICByZXR1cm4gJ3JlbW92ZSBpbmRleCAnICsgbGVmdEtleSArIGZvcm1hdExlZ2VuZDtcbiAgICB9XG4gICAgcmV0dXJuICdkZWxldGUgcHJvcGVydHkgJyArIHdyYXBQcm9wZXJ0eU5hbWUobGVmdEtleSkgKyBmb3JtYXRMZWdlbmQ7XG4gIH0sXG4gIG1vdmVkOiBmdW5jdGlvbiBtb3ZlZChkZWx0YSwgbGVmdCwga2V5LCBsZWZ0S2V5KSB7XG4gICAgcmV0dXJuICdtb3ZlIGZyb20gPHNwYW4gdGl0bGU9XCIocG9zaXRpb24gdG8gcmVtb3ZlIGF0IG9yaWdpbmFsIHN0YXRlKVwiPicgKyAoJ2luZGV4ICcgKyBsZWZ0S2V5ICsgJzwvc3Bhbj4gdG8gPHNwYW4gdGl0bGU9XCIocG9zaXRpb24gdG8gaW5zZXJ0IGF0IGZpbmFsJykgKyAoJyBzdGF0ZSlcIj5pbmRleCAnICsgZGVsdGFbMV0gKyAnPC9zcGFuPicpO1xuICB9LFxuICB0ZXh0ZGlmZjogZnVuY3Rpb24gdGV4dGRpZmYoZGVsdGEsIGxlZnQsIGtleSwgbGVmdEtleSkge1xuICAgIHZhciBsb2NhdGlvbiA9IHR5cGVvZiBsZWZ0S2V5ID09PSAndW5kZWZpbmVkJyA/ICcnIDogdHlwZW9mIGxlZnRLZXkgPT09ICdudW1iZXInID8gJyBhdCBpbmRleCAnICsgbGVmdEtleSA6ICcgYXQgcHJvcGVydHkgJyArIHdyYXBQcm9wZXJ0eU5hbWUobGVmdEtleSk7XG4gICAgcmV0dXJuICd0ZXh0IGRpZmYnICsgbG9jYXRpb24gKyAnLCBmb3JtYXQgaXMgPGEgaHJlZj1cImh0dHBzOi8vY29kZS5nb29nbGUuY29tLycgKyAncC9nb29nbGUtZGlmZi1tYXRjaC1wYXRjaC93aWtpL1VuaWRpZmZcIj5hIHZhcmlhdGlvbiBvZiBVbmlkaWZmPC9hPic7XG4gIH1cbn07XG5cbnZhciBmb3JtYXRBbnlDaGFuZ2UgPSBmdW5jdGlvbiBmb3JtYXRBbnlDaGFuZ2UoY29udGV4dCwgZGVsdGEpIHtcbiAgdmFyIGRlbHRhVHlwZSA9IHRoaXMuZ2V0RGVsdGFUeXBlKGRlbHRhKTtcbiAgdmFyIGFubm90YXRvciA9IGRlbHRhQW5ub3RhdGlvbnNbZGVsdGFUeXBlXTtcbiAgdmFyIGh0bWxOb3RlID0gYW5ub3RhdG9yICYmIGFubm90YXRvci5hcHBseShhbm5vdGF0b3IsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICB2YXIganNvbiA9IEpTT04uc3RyaW5naWZ5KGRlbHRhLCBudWxsLCAyKTtcbiAgaWYgKGRlbHRhVHlwZSA9PT0gJ3RleHRkaWZmJykge1xuICAgIC8vIHNwbGl0IHRleHQgZGlmZnMgbGluZXNcbiAgICBqc29uID0ganNvbi5zcGxpdCgnXFxcXG4nKS5qb2luKCdcXFxcblwiK1xcbiAgIFwiJyk7XG4gIH1cbiAgY29udGV4dC5pbmRlbnQoKTtcbiAgY29udGV4dC5yb3coanNvbiwgaHRtbE5vdGUpO1xuICBjb250ZXh0LmluZGVudCgtMSk7XG59O1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBjYW1lbGNhc2UgKi9cbkFubm90YXRlZEZvcm1hdHRlci5wcm90b3R5cGUuZm9ybWF0X2FkZGVkID0gZm9ybWF0QW55Q2hhbmdlO1xuQW5ub3RhdGVkRm9ybWF0dGVyLnByb3RvdHlwZS5mb3JtYXRfbW9kaWZpZWQgPSBmb3JtYXRBbnlDaGFuZ2U7XG5Bbm5vdGF0ZWRGb3JtYXR0ZXIucHJvdG90eXBlLmZvcm1hdF9kZWxldGVkID0gZm9ybWF0QW55Q2hhbmdlO1xuQW5ub3RhdGVkRm9ybWF0dGVyLnByb3RvdHlwZS5mb3JtYXRfbW92ZWQgPSBmb3JtYXRBbnlDaGFuZ2U7XG5Bbm5vdGF0ZWRGb3JtYXR0ZXIucHJvdG90eXBlLmZvcm1hdF90ZXh0ZGlmZiA9IGZvcm1hdEFueUNoYW5nZTtcbnZhciBkZWZhdWx0SW5zdGFuY2UkMSA9IHZvaWQgMDtcblxuZnVuY3Rpb24gZm9ybWF0JDEoZGVsdGEsIGxlZnQpIHtcbiAgaWYgKCFkZWZhdWx0SW5zdGFuY2UkMSkge1xuICAgIGRlZmF1bHRJbnN0YW5jZSQxID0gbmV3IEFubm90YXRlZEZvcm1hdHRlcigpO1xuICB9XG4gIHJldHVybiBkZWZhdWx0SW5zdGFuY2UkMS5mb3JtYXQoZGVsdGEsIGxlZnQpO1xufVxuXG5cblxudmFyIGFubm90YXRlZCA9IE9iamVjdC5mcmVlemUoe1xuXHRkZWZhdWx0OiBBbm5vdGF0ZWRGb3JtYXR0ZXIsXG5cdGZvcm1hdDogZm9ybWF0JDFcbn0pO1xuXG52YXIgT1BFUkFUSU9OUyA9IHtcbiAgYWRkOiAnYWRkJyxcbiAgcmVtb3ZlOiAncmVtb3ZlJyxcbiAgcmVwbGFjZTogJ3JlcGxhY2UnLFxuICBtb3ZlOiAnbW92ZSdcbn07XG5cbnZhciBKU09ORm9ybWF0dGVyID0gZnVuY3Rpb24gKF9CYXNlRm9ybWF0dGVyKSB7XG4gIGluaGVyaXRzKEpTT05Gb3JtYXR0ZXIsIF9CYXNlRm9ybWF0dGVyKTtcblxuICBmdW5jdGlvbiBKU09ORm9ybWF0dGVyKCkge1xuICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIEpTT05Gb3JtYXR0ZXIpO1xuXG4gICAgdmFyIF90aGlzID0gcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoSlNPTkZvcm1hdHRlci5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKEpTT05Gb3JtYXR0ZXIpKS5jYWxsKHRoaXMpKTtcblxuICAgIF90aGlzLmluY2x1ZGVNb3ZlRGVzdGluYXRpb25zID0gdHJ1ZTtcbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cblxuICBjcmVhdGVDbGFzcyhKU09ORm9ybWF0dGVyLCBbe1xuICAgIGtleTogJ3ByZXBhcmVDb250ZXh0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcHJlcGFyZUNvbnRleHQoY29udGV4dCkge1xuICAgICAgZ2V0KEpTT05Gb3JtYXR0ZXIucHJvdG90eXBlLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoSlNPTkZvcm1hdHRlci5wcm90b3R5cGUpLCAncHJlcGFyZUNvbnRleHQnLCB0aGlzKS5jYWxsKHRoaXMsIGNvbnRleHQpO1xuICAgICAgY29udGV4dC5yZXN1bHQgPSBbXTtcbiAgICAgIGNvbnRleHQucGF0aCA9IFtdO1xuICAgICAgY29udGV4dC5wdXNoQ3VycmVudE9wID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICB2YXIgb3AgPSBvYmoub3AsXG4gICAgICAgICAgICB2YWx1ZSA9IG9iai52YWx1ZTtcblxuICAgICAgICB2YXIgdmFsID0ge1xuICAgICAgICAgIG9wOiBvcCxcbiAgICAgICAgICBwYXRoOiB0aGlzLmN1cnJlbnRQYXRoKClcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICB2YWwudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlc3VsdC5wdXNoKHZhbCk7XG4gICAgICB9O1xuXG4gICAgICBjb250ZXh0LnB1c2hNb3ZlT3AgPSBmdW5jdGlvbiAodG8pIHtcbiAgICAgICAgdmFyIGZyb20gPSB0aGlzLmN1cnJlbnRQYXRoKCk7XG4gICAgICAgIHRoaXMucmVzdWx0LnB1c2goe1xuICAgICAgICAgIG9wOiBPUEVSQVRJT05TLm1vdmUsXG4gICAgICAgICAgZnJvbTogZnJvbSxcbiAgICAgICAgICBwYXRoOiB0aGlzLnRvUGF0aCh0bylcbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICBjb250ZXh0LmN1cnJlbnRQYXRoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJy8nICsgdGhpcy5wYXRoLmpvaW4oJy8nKTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnRleHQudG9QYXRoID0gZnVuY3Rpb24gKHRvUGF0aCkge1xuICAgICAgICB2YXIgdG8gPSB0aGlzLnBhdGguc2xpY2UoKTtcbiAgICAgICAgdG9bdG8ubGVuZ3RoIC0gMV0gPSB0b1BhdGg7XG4gICAgICAgIHJldHVybiAnLycgKyB0by5qb2luKCcvJyk7XG4gICAgICB9O1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3R5cGVGb3JtYXR0dGVyRXJyb3JGb3JtYXR0ZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB0eXBlRm9ybWF0dHRlckVycm9yRm9ybWF0dGVyKGNvbnRleHQsIGVycikge1xuICAgICAgY29udGV4dC5vdXQoJ1tFUlJPUl0gJyArIGVycik7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncm9vdEJlZ2luJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcm9vdEJlZ2luKCkge31cbiAgfSwge1xuICAgIGtleTogJ3Jvb3RFbmQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByb290RW5kKCkge31cbiAgfSwge1xuICAgIGtleTogJ25vZGVCZWdpbicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG5vZGVCZWdpbihfcmVmLCBrZXksIGxlZnRLZXkpIHtcbiAgICAgIHZhciBwYXRoID0gX3JlZi5wYXRoO1xuXG4gICAgICBwYXRoLnB1c2gobGVmdEtleSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnbm9kZUVuZCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG5vZGVFbmQoX3JlZjIpIHtcbiAgICAgIHZhciBwYXRoID0gX3JlZjIucGF0aDtcblxuICAgICAgcGF0aC5wb3AoKTtcbiAgICB9XG5cbiAgICAvKiBqc2hpbnQgY2FtZWxjYXNlOiBmYWxzZSAqL1xuICAgIC8qIGVzbGludC1kaXNhYmxlIGNhbWVsY2FzZSAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdmb3JtYXRfdW5jaGFuZ2VkJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZm9ybWF0X3VuY2hhbmdlZCgpIHt9XG4gIH0sIHtcbiAgICBrZXk6ICdmb3JtYXRfbW92ZWRlc3RpbmF0aW9uJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZm9ybWF0X21vdmVkZXN0aW5hdGlvbigpIHt9XG4gIH0sIHtcbiAgICBrZXk6ICdmb3JtYXRfbm9kZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGZvcm1hdF9ub2RlKGNvbnRleHQsIGRlbHRhLCBsZWZ0KSB7XG4gICAgICB0aGlzLmZvcm1hdERlbHRhQ2hpbGRyZW4oY29udGV4dCwgZGVsdGEsIGxlZnQpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2Zvcm1hdF9hZGRlZCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGZvcm1hdF9hZGRlZChjb250ZXh0LCBkZWx0YSkge1xuICAgICAgY29udGV4dC5wdXNoQ3VycmVudE9wKHsgb3A6IE9QRVJBVElPTlMuYWRkLCB2YWx1ZTogZGVsdGFbMF0gfSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZm9ybWF0X21vZGlmaWVkJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZm9ybWF0X21vZGlmaWVkKGNvbnRleHQsIGRlbHRhKSB7XG4gICAgICBjb250ZXh0LnB1c2hDdXJyZW50T3AoeyBvcDogT1BFUkFUSU9OUy5yZXBsYWNlLCB2YWx1ZTogZGVsdGFbMV0gfSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZm9ybWF0X2RlbGV0ZWQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JtYXRfZGVsZXRlZChjb250ZXh0KSB7XG4gICAgICBjb250ZXh0LnB1c2hDdXJyZW50T3AoeyBvcDogT1BFUkFUSU9OUy5yZW1vdmUgfSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZm9ybWF0X21vdmVkJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZm9ybWF0X21vdmVkKGNvbnRleHQsIGRlbHRhKSB7XG4gICAgICB2YXIgdG8gPSBkZWx0YVsxXTtcbiAgICAgIGNvbnRleHQucHVzaE1vdmVPcCh0byk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZm9ybWF0X3RleHRkaWZmJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZm9ybWF0X3RleHRkaWZmKCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdmb3JtYXQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JtYXQoZGVsdGEsIGxlZnQpIHtcbiAgICAgIHZhciBjb250ZXh0ID0ge307XG4gICAgICB0aGlzLnByZXBhcmVDb250ZXh0KGNvbnRleHQpO1xuICAgICAgdGhpcy5yZWN1cnNlKGNvbnRleHQsIGRlbHRhLCBsZWZ0KTtcbiAgICAgIHJldHVybiBjb250ZXh0LnJlc3VsdDtcbiAgICB9XG4gIH1dKTtcbiAgcmV0dXJuIEpTT05Gb3JtYXR0ZXI7XG59KEJhc2VGb3JtYXR0ZXIpO1xuXG52YXIgbGFzdCA9IGZ1bmN0aW9uIGxhc3QoYXJyKSB7XG4gIHJldHVybiBhcnJbYXJyLmxlbmd0aCAtIDFdO1xufTtcblxudmFyIHNvcnRCeSA9IGZ1bmN0aW9uIHNvcnRCeShhcnIsIHByZWQpIHtcbiAgYXJyLnNvcnQocHJlZCk7XG4gIHJldHVybiBhcnI7XG59O1xuXG52YXIgY29tcGFyZUJ5SW5kZXhEZXNjID0gZnVuY3Rpb24gY29tcGFyZUJ5SW5kZXhEZXNjKGluZGV4QSwgaW5kZXhCKSB7XG4gIHZhciBsYXN0QSA9IHBhcnNlSW50KGluZGV4QSwgMTApO1xuICB2YXIgbGFzdEIgPSBwYXJzZUludChpbmRleEIsIDEwKTtcbiAgaWYgKCEoaXNOYU4obGFzdEEpIHx8IGlzTmFOKGxhc3RCKSkpIHtcbiAgICByZXR1cm4gbGFzdEIgLSBsYXN0QTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gMDtcbiAgfVxufTtcblxudmFyIG9wc0J5RGVzY2VuZGluZ09yZGVyID0gZnVuY3Rpb24gb3BzQnlEZXNjZW5kaW5nT3JkZXIocmVtb3ZlT3BzKSB7XG4gIHJldHVybiBzb3J0QnkocmVtb3ZlT3BzLCBmdW5jdGlvbiAoYSwgYikge1xuICAgIHZhciBzcGxpdEEgPSBhLnBhdGguc3BsaXQoJy8nKTtcbiAgICB2YXIgc3BsaXRCID0gYi5wYXRoLnNwbGl0KCcvJyk7XG4gICAgaWYgKHNwbGl0QS5sZW5ndGggIT09IHNwbGl0Qi5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBzcGxpdEEubGVuZ3RoIC0gc3BsaXRCLmxlbmd0aDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbXBhcmVCeUluZGV4RGVzYyhsYXN0KHNwbGl0QSksIGxhc3Qoc3BsaXRCKSk7XG4gICAgfVxuICB9KTtcbn07XG5cbnZhciBwYXJ0aXRpb25PcHMgPSBmdW5jdGlvbiBwYXJ0aXRpb25PcHMoYXJyLCBmbnMpIHtcbiAgdmFyIGluaXRBcnIgPSBBcnJheShmbnMubGVuZ3RoICsgMSkuZmlsbCgpLm1hcChmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9KTtcbiAgcmV0dXJuIGFyci5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICB2YXIgcG9zaXRpb24gPSBmbnMubWFwKGZ1bmN0aW9uIChmbikge1xuICAgICAgcmV0dXJuIGZuKGl0ZW0pO1xuICAgIH0pLmluZGV4T2YodHJ1ZSk7XG4gICAgaWYgKHBvc2l0aW9uIDwgMCkge1xuICAgICAgcG9zaXRpb24gPSBmbnMubGVuZ3RoO1xuICAgIH1cbiAgICByZXR1cm4geyBpdGVtOiBpdGVtLCBwb3NpdGlvbjogcG9zaXRpb24gfTtcbiAgfSkucmVkdWNlKGZ1bmN0aW9uIChhY2MsIGl0ZW0pIHtcbiAgICBhY2NbaXRlbS5wb3NpdGlvbl0ucHVzaChpdGVtLml0ZW0pO1xuICAgIHJldHVybiBhY2M7XG4gIH0sIGluaXRBcnIpO1xufTtcbnZhciBpc01vdmVPcCA9IGZ1bmN0aW9uIGlzTW92ZU9wKF9yZWYzKSB7XG4gIHZhciBvcCA9IF9yZWYzLm9wO1xuICByZXR1cm4gb3AgPT09ICdtb3ZlJztcbn07XG52YXIgaXNSZW1vdmVPcCA9IGZ1bmN0aW9uIGlzUmVtb3ZlT3AoX3JlZjQpIHtcbiAgdmFyIG9wID0gX3JlZjQub3A7XG4gIHJldHVybiBvcCA9PT0gJ3JlbW92ZSc7XG59O1xuXG52YXIgcmVvcmRlck9wcyA9IGZ1bmN0aW9uIHJlb3JkZXJPcHMoZGlmZikge1xuICB2YXIgX3BhcnRpdGlvbk9wcyA9IHBhcnRpdGlvbk9wcyhkaWZmLCBbaXNNb3ZlT3AsIGlzUmVtb3ZlT3BdKSxcbiAgICAgIF9wYXJ0aXRpb25PcHMyID0gc2xpY2VkVG9BcnJheShfcGFydGl0aW9uT3BzLCAzKSxcbiAgICAgIG1vdmVPcHMgPSBfcGFydGl0aW9uT3BzMlswXSxcbiAgICAgIHJlbW92ZWRPcHMgPSBfcGFydGl0aW9uT3BzMlsxXSxcbiAgICAgIHJlc3RPcHMgPSBfcGFydGl0aW9uT3BzMlsyXTtcblxuICB2YXIgcmVtb3ZlT3BzUmV2ZXJzZSA9IG9wc0J5RGVzY2VuZGluZ09yZGVyKHJlbW92ZWRPcHMpO1xuICByZXR1cm4gW10uY29uY2F0KHRvQ29uc3VtYWJsZUFycmF5KHJlbW92ZU9wc1JldmVyc2UpLCB0b0NvbnN1bWFibGVBcnJheShtb3ZlT3BzKSwgdG9Db25zdW1hYmxlQXJyYXkocmVzdE9wcykpO1xufTtcblxudmFyIGRlZmF1bHRJbnN0YW5jZSQyID0gdm9pZCAwO1xuXG52YXIgZm9ybWF0JDIgPSBmdW5jdGlvbiBmb3JtYXQoZGVsdGEsIGxlZnQpIHtcbiAgaWYgKCFkZWZhdWx0SW5zdGFuY2UkMikge1xuICAgIGRlZmF1bHRJbnN0YW5jZSQyID0gbmV3IEpTT05Gb3JtYXR0ZXIoKTtcbiAgfVxuICByZXR1cm4gcmVvcmRlck9wcyhkZWZhdWx0SW5zdGFuY2UkMi5mb3JtYXQoZGVsdGEsIGxlZnQpKTtcbn07XG5cbnZhciBsb2cgPSBmdW5jdGlvbiBsb2coZGVsdGEsIGxlZnQpIHtcbiAgY29uc29sZS5sb2coZm9ybWF0JDIoZGVsdGEsIGxlZnQpKTtcbn07XG5cblxuXG52YXIganNvbnBhdGNoID0gT2JqZWN0LmZyZWV6ZSh7XG5cdGRlZmF1bHQ6IEpTT05Gb3JtYXR0ZXIsXG5cdHBhcnRpdGlvbk9wczogcGFydGl0aW9uT3BzLFxuXHRmb3JtYXQ6IGZvcm1hdCQyLFxuXHRsb2c6IGxvZ1xufSk7XG5cbmZ1bmN0aW9uIGNoYWxrQ29sb3IobmFtZSkge1xuICByZXR1cm4gY2hhbGsgJiYgY2hhbGtbbmFtZV0gfHwgZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgIH1cblxuICAgIHJldHVybiBhcmdzO1xuICB9O1xufVxuXG52YXIgY29sb3JzID0ge1xuICBhZGRlZDogY2hhbGtDb2xvcignZ3JlZW4nKSxcbiAgZGVsZXRlZDogY2hhbGtDb2xvcigncmVkJyksXG4gIG1vdmVkZXN0aW5hdGlvbjogY2hhbGtDb2xvcignZ3JheScpLFxuICBtb3ZlZDogY2hhbGtDb2xvcigneWVsbG93JyksXG4gIHVuY2hhbmdlZDogY2hhbGtDb2xvcignZ3JheScpLFxuICBlcnJvcjogY2hhbGtDb2xvcignd2hpdGUuYmdSZWQnKSxcbiAgdGV4dERpZmZMaW5lOiBjaGFsa0NvbG9yKCdncmF5Jylcbn07XG5cbnZhciBDb25zb2xlRm9ybWF0dGVyID0gZnVuY3Rpb24gKF9CYXNlRm9ybWF0dGVyKSB7XG4gIGluaGVyaXRzKENvbnNvbGVGb3JtYXR0ZXIsIF9CYXNlRm9ybWF0dGVyKTtcblxuICBmdW5jdGlvbiBDb25zb2xlRm9ybWF0dGVyKCkge1xuICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIENvbnNvbGVGb3JtYXR0ZXIpO1xuXG4gICAgdmFyIF90aGlzID0gcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoQ29uc29sZUZvcm1hdHRlci5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKENvbnNvbGVGb3JtYXR0ZXIpKS5jYWxsKHRoaXMpKTtcblxuICAgIF90aGlzLmluY2x1ZGVNb3ZlRGVzdGluYXRpb25zID0gZmFsc2U7XG4gICAgcmV0dXJuIF90aGlzO1xuICB9XG5cbiAgY3JlYXRlQ2xhc3MoQ29uc29sZUZvcm1hdHRlciwgW3tcbiAgICBrZXk6ICdwcmVwYXJlQ29udGV4dCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHByZXBhcmVDb250ZXh0KGNvbnRleHQpIHtcbiAgICAgIGdldChDb25zb2xlRm9ybWF0dGVyLnByb3RvdHlwZS5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKENvbnNvbGVGb3JtYXR0ZXIucHJvdG90eXBlKSwgJ3ByZXBhcmVDb250ZXh0JywgdGhpcykuY2FsbCh0aGlzLCBjb250ZXh0KTtcbiAgICAgIGNvbnRleHQuaW5kZW50ID0gZnVuY3Rpb24gKGxldmVscykge1xuICAgICAgICB0aGlzLmluZGVudExldmVsID0gKHRoaXMuaW5kZW50TGV2ZWwgfHwgMCkgKyAodHlwZW9mIGxldmVscyA9PT0gJ3VuZGVmaW5lZCcgPyAxIDogbGV2ZWxzKTtcbiAgICAgICAgdGhpcy5pbmRlbnRQYWQgPSBuZXcgQXJyYXkodGhpcy5pbmRlbnRMZXZlbCArIDEpLmpvaW4oJyAgJyk7XG4gICAgICAgIHRoaXMub3V0TGluZSgpO1xuICAgICAgfTtcbiAgICAgIGNvbnRleHQub3V0TGluZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5idWZmZXIucHVzaCgnXFxuJyArICh0aGlzLmluZGVudFBhZCB8fCAnJykpO1xuICAgICAgfTtcbiAgICAgIGNvbnRleHQub3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKHZhciBfbGVuMiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuMiksIF9rZXkyID0gMDsgX2tleTIgPCBfbGVuMjsgX2tleTIrKykge1xuICAgICAgICAgIGFyZ3NbX2tleTJdID0gYXJndW1lbnRzW19rZXkyXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gYXJncy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICB2YXIgbGluZXMgPSBhcmdzW2ldLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgICB2YXIgdGV4dCA9IGxpbmVzLmpvaW4oJ1xcbicgKyAodGhpcy5pbmRlbnRQYWQgfHwgJycpKTtcbiAgICAgICAgICBpZiAodGhpcy5jb2xvciAmJiB0aGlzLmNvbG9yWzBdKSB7XG4gICAgICAgICAgICB0ZXh0ID0gdGhpcy5jb2xvclswXSh0ZXh0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5idWZmZXIucHVzaCh0ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGNvbnRleHQucHVzaENvbG9yID0gZnVuY3Rpb24gKGNvbG9yKSB7XG4gICAgICAgIHRoaXMuY29sb3IgPSB0aGlzLmNvbG9yIHx8IFtdO1xuICAgICAgICB0aGlzLmNvbG9yLnVuc2hpZnQoY29sb3IpO1xuICAgICAgfTtcbiAgICAgIGNvbnRleHQucG9wQ29sb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY29sb3IgPSB0aGlzLmNvbG9yIHx8IFtdO1xuICAgICAgICB0aGlzLmNvbG9yLnNoaWZ0KCk7XG4gICAgICB9O1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3R5cGVGb3JtYXR0dGVyRXJyb3JGb3JtYXR0ZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB0eXBlRm9ybWF0dHRlckVycm9yRm9ybWF0dGVyKGNvbnRleHQsIGVycikge1xuICAgICAgY29udGV4dC5wdXNoQ29sb3IoY29sb3JzLmVycm9yKTtcbiAgICAgIGNvbnRleHQub3V0KCdbRVJST1JdJyArIGVycik7XG4gICAgICBjb250ZXh0LnBvcENvbG9yKCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZm9ybWF0VmFsdWUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JtYXRWYWx1ZShjb250ZXh0LCB2YWx1ZSkge1xuICAgICAgY29udGV4dC5vdXQoSlNPTi5zdHJpbmdpZnkodmFsdWUsIG51bGwsIDIpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdmb3JtYXRUZXh0RGlmZlN0cmluZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGZvcm1hdFRleHREaWZmU3RyaW5nKGNvbnRleHQsIHZhbHVlKSB7XG4gICAgICB2YXIgbGluZXMgPSB0aGlzLnBhcnNlVGV4dERpZmYodmFsdWUpO1xuICAgICAgY29udGV4dC5pbmRlbnQoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGluZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBsaW5lID0gbGluZXNbaV07XG4gICAgICAgIGNvbnRleHQucHVzaENvbG9yKGNvbG9ycy50ZXh0RGlmZkxpbmUpO1xuICAgICAgICBjb250ZXh0Lm91dChsaW5lLmxvY2F0aW9uLmxpbmUgKyAnLCcgKyBsaW5lLmxvY2F0aW9uLmNociArICcgJyk7XG4gICAgICAgIGNvbnRleHQucG9wQ29sb3IoKTtcbiAgICAgICAgdmFyIHBpZWNlcyA9IGxpbmUucGllY2VzO1xuICAgICAgICBmb3IgKHZhciBwaWVjZUluZGV4ID0gMCwgcGllY2VzTGVuZ3RoID0gcGllY2VzLmxlbmd0aDsgcGllY2VJbmRleCA8IHBpZWNlc0xlbmd0aDsgcGllY2VJbmRleCsrKSB7XG4gICAgICAgICAgdmFyIHBpZWNlID0gcGllY2VzW3BpZWNlSW5kZXhdO1xuICAgICAgICAgIGNvbnRleHQucHVzaENvbG9yKGNvbG9yc1twaWVjZS50eXBlXSk7XG4gICAgICAgICAgY29udGV4dC5vdXQocGllY2UudGV4dCk7XG4gICAgICAgICAgY29udGV4dC5wb3BDb2xvcigpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpIDwgbCAtIDEpIHtcbiAgICAgICAgICBjb250ZXh0Lm91dExpbmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29udGV4dC5pbmRlbnQoLTEpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3Jvb3RCZWdpbicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJvb3RCZWdpbihjb250ZXh0LCB0eXBlLCBub2RlVHlwZSkge1xuICAgICAgY29udGV4dC5wdXNoQ29sb3IoY29sb3JzW3R5cGVdKTtcbiAgICAgIGlmICh0eXBlID09PSAnbm9kZScpIHtcbiAgICAgICAgY29udGV4dC5vdXQobm9kZVR5cGUgPT09ICdhcnJheScgPyAnWycgOiAneycpO1xuICAgICAgICBjb250ZXh0LmluZGVudCgpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3Jvb3RFbmQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByb290RW5kKGNvbnRleHQsIHR5cGUsIG5vZGVUeXBlKSB7XG4gICAgICBpZiAodHlwZSA9PT0gJ25vZGUnKSB7XG4gICAgICAgIGNvbnRleHQuaW5kZW50KC0xKTtcbiAgICAgICAgY29udGV4dC5vdXQobm9kZVR5cGUgPT09ICdhcnJheScgPyAnXScgOiAnfScpO1xuICAgICAgfVxuICAgICAgY29udGV4dC5wb3BDb2xvcigpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ25vZGVCZWdpbicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG5vZGVCZWdpbihjb250ZXh0LCBrZXksIGxlZnRLZXksIHR5cGUsIG5vZGVUeXBlKSB7XG4gICAgICBjb250ZXh0LnB1c2hDb2xvcihjb2xvcnNbdHlwZV0pO1xuICAgICAgY29udGV4dC5vdXQobGVmdEtleSArICc6ICcpO1xuICAgICAgaWYgKHR5cGUgPT09ICdub2RlJykge1xuICAgICAgICBjb250ZXh0Lm91dChub2RlVHlwZSA9PT0gJ2FycmF5JyA/ICdbJyA6ICd7Jyk7XG4gICAgICAgIGNvbnRleHQuaW5kZW50KCk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnbm9kZUVuZCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG5vZGVFbmQoY29udGV4dCwga2V5LCBsZWZ0S2V5LCB0eXBlLCBub2RlVHlwZSwgaXNMYXN0KSB7XG4gICAgICBpZiAodHlwZSA9PT0gJ25vZGUnKSB7XG4gICAgICAgIGNvbnRleHQuaW5kZW50KC0xKTtcbiAgICAgICAgY29udGV4dC5vdXQobm9kZVR5cGUgPT09ICdhcnJheScgPyAnXScgOiAnfScgKyAoaXNMYXN0ID8gJycgOiAnLCcpKTtcbiAgICAgIH1cbiAgICAgIGlmICghaXNMYXN0KSB7XG4gICAgICAgIGNvbnRleHQub3V0TGluZSgpO1xuICAgICAgfVxuICAgICAgY29udGV4dC5wb3BDb2xvcigpO1xuICAgIH1cblxuICAgIC8qIGpzaGludCBjYW1lbGNhc2U6IGZhbHNlICovXG4gICAgLyogZXNsaW50LWRpc2FibGUgY2FtZWxjYXNlICovXG5cbiAgfSwge1xuICAgIGtleTogJ2Zvcm1hdF91bmNoYW5nZWQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JtYXRfdW5jaGFuZ2VkKGNvbnRleHQsIGRlbHRhLCBsZWZ0KSB7XG4gICAgICBpZiAodHlwZW9mIGxlZnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuZm9ybWF0VmFsdWUoY29udGV4dCwgbGVmdCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZm9ybWF0X21vdmVkZXN0aW5hdGlvbicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGZvcm1hdF9tb3ZlZGVzdGluYXRpb24oY29udGV4dCwgZGVsdGEsIGxlZnQpIHtcbiAgICAgIGlmICh0eXBlb2YgbGVmdCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5mb3JtYXRWYWx1ZShjb250ZXh0LCBsZWZ0KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdmb3JtYXRfbm9kZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGZvcm1hdF9ub2RlKGNvbnRleHQsIGRlbHRhLCBsZWZ0KSB7XG4gICAgICAvLyByZWN1cnNlXG4gICAgICB0aGlzLmZvcm1hdERlbHRhQ2hpbGRyZW4oY29udGV4dCwgZGVsdGEsIGxlZnQpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2Zvcm1hdF9hZGRlZCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGZvcm1hdF9hZGRlZChjb250ZXh0LCBkZWx0YSkge1xuICAgICAgdGhpcy5mb3JtYXRWYWx1ZShjb250ZXh0LCBkZWx0YVswXSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZm9ybWF0X21vZGlmaWVkJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZm9ybWF0X21vZGlmaWVkKGNvbnRleHQsIGRlbHRhKSB7XG4gICAgICBjb250ZXh0LnB1c2hDb2xvcihjb2xvcnMuZGVsZXRlZCk7XG4gICAgICB0aGlzLmZvcm1hdFZhbHVlKGNvbnRleHQsIGRlbHRhWzBdKTtcbiAgICAgIGNvbnRleHQucG9wQ29sb3IoKTtcbiAgICAgIGNvbnRleHQub3V0KCcgPT4gJyk7XG4gICAgICBjb250ZXh0LnB1c2hDb2xvcihjb2xvcnMuYWRkZWQpO1xuICAgICAgdGhpcy5mb3JtYXRWYWx1ZShjb250ZXh0LCBkZWx0YVsxXSk7XG4gICAgICBjb250ZXh0LnBvcENvbG9yKCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZm9ybWF0X2RlbGV0ZWQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JtYXRfZGVsZXRlZChjb250ZXh0LCBkZWx0YSkge1xuICAgICAgdGhpcy5mb3JtYXRWYWx1ZShjb250ZXh0LCBkZWx0YVswXSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZm9ybWF0X21vdmVkJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZm9ybWF0X21vdmVkKGNvbnRleHQsIGRlbHRhKSB7XG4gICAgICBjb250ZXh0Lm91dCgnPT0+ICcgKyBkZWx0YVsxXSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZm9ybWF0X3RleHRkaWZmJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZm9ybWF0X3RleHRkaWZmKGNvbnRleHQsIGRlbHRhKSB7XG4gICAgICB0aGlzLmZvcm1hdFRleHREaWZmU3RyaW5nKGNvbnRleHQsIGRlbHRhWzBdKTtcbiAgICB9XG4gIH1dKTtcbiAgcmV0dXJuIENvbnNvbGVGb3JtYXR0ZXI7XG59KEJhc2VGb3JtYXR0ZXIpO1xuXG52YXIgZGVmYXVsdEluc3RhbmNlJDMgPSB2b2lkIDA7XG5cbnZhciBmb3JtYXQkMyA9IGZ1bmN0aW9uIGZvcm1hdChkZWx0YSwgbGVmdCkge1xuICBpZiAoIWRlZmF1bHRJbnN0YW5jZSQzKSB7XG4gICAgZGVmYXVsdEluc3RhbmNlJDMgPSBuZXcgQ29uc29sZUZvcm1hdHRlcigpO1xuICB9XG4gIHJldHVybiBkZWZhdWx0SW5zdGFuY2UkMy5mb3JtYXQoZGVsdGEsIGxlZnQpO1xufTtcblxuZnVuY3Rpb24gbG9nJDEoZGVsdGEsIGxlZnQpIHtcbiAgY29uc29sZS5sb2coZm9ybWF0JDMoZGVsdGEsIGxlZnQpKTtcbn1cblxuXG5cbnZhciBjb25zb2xlJDEgPSBPYmplY3QuZnJlZXplKHtcblx0ZGVmYXVsdDogQ29uc29sZUZvcm1hdHRlcixcblx0Zm9ybWF0OiBmb3JtYXQkMyxcblx0bG9nOiBsb2ckMVxufSk7XG5cblxuXG52YXIgaW5kZXggPSBPYmplY3QuZnJlZXplKHtcblx0YmFzZTogYmFzZSxcblx0aHRtbDogaHRtbCxcblx0YW5ub3RhdGVkOiBhbm5vdGF0ZWQsXG5cdGpzb25wYXRjaDoganNvbnBhdGNoLFxuXHRjb25zb2xlOiBjb25zb2xlJDFcbn0pO1xuXG4vLyB1c2UgYXMgMm5kIHBhcmFtZXRlciBmb3IgSlNPTi5wYXJzZSB0byByZXZpdmUgRGF0ZSBpbnN0YW5jZXNcbmZ1bmN0aW9uIGRhdGVSZXZpdmVyKGtleSwgdmFsdWUpIHtcbiAgdmFyIHBhcnRzID0gdm9pZCAwO1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBtYXgtbGVuXG4gICAgcGFydHMgPSAvXihcXGR7NH0pLShcXGR7Mn0pLShcXGR7Mn0pVChcXGR7Mn0pOihcXGR7Mn0pOihcXGR7Mn0pKD86XFwuKFxcZCopKT8oWnwoWystXSkoXFxkezJ9KTooXFxkezJ9KSkkLy5leGVjKHZhbHVlKTtcbiAgICBpZiAocGFydHMpIHtcbiAgICAgIHJldHVybiBuZXcgRGF0ZShEYXRlLlVUQygrcGFydHNbMV0sICtwYXJ0c1syXSAtIDEsICtwYXJ0c1szXSwgK3BhcnRzWzRdLCArcGFydHNbNV0sICtwYXJ0c1s2XSwgKyhwYXJ0c1s3XSB8fCAwKSkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZShvcHRpb25zKSB7XG4gIHJldHVybiBuZXcgRGlmZlBhdGNoZXIob3B0aW9ucyk7XG59XG5cbnZhciBkZWZhdWx0SW5zdGFuY2UkNCA9IHZvaWQgMDtcblxuZnVuY3Rpb24gZGlmZigpIHtcbiAgaWYgKCFkZWZhdWx0SW5zdGFuY2UkNCkge1xuICAgIGRlZmF1bHRJbnN0YW5jZSQ0ID0gbmV3IERpZmZQYXRjaGVyKCk7XG4gIH1cbiAgcmV0dXJuIGRlZmF1bHRJbnN0YW5jZSQ0LmRpZmYuYXBwbHkoZGVmYXVsdEluc3RhbmNlJDQsIGFyZ3VtZW50cyk7XG59XG5cbmZ1bmN0aW9uIHBhdGNoKCkge1xuICBpZiAoIWRlZmF1bHRJbnN0YW5jZSQ0KSB7XG4gICAgZGVmYXVsdEluc3RhbmNlJDQgPSBuZXcgRGlmZlBhdGNoZXIoKTtcbiAgfVxuICByZXR1cm4gZGVmYXVsdEluc3RhbmNlJDQucGF0Y2guYXBwbHkoZGVmYXVsdEluc3RhbmNlJDQsIGFyZ3VtZW50cyk7XG59XG5cbmZ1bmN0aW9uIHVucGF0Y2goKSB7XG4gIGlmICghZGVmYXVsdEluc3RhbmNlJDQpIHtcbiAgICBkZWZhdWx0SW5zdGFuY2UkNCA9IG5ldyBEaWZmUGF0Y2hlcigpO1xuICB9XG4gIHJldHVybiBkZWZhdWx0SW5zdGFuY2UkNC51bnBhdGNoLmFwcGx5KGRlZmF1bHRJbnN0YW5jZSQ0LCBhcmd1bWVudHMpO1xufVxuXG5mdW5jdGlvbiByZXZlcnNlKCkge1xuICBpZiAoIWRlZmF1bHRJbnN0YW5jZSQ0KSB7XG4gICAgZGVmYXVsdEluc3RhbmNlJDQgPSBuZXcgRGlmZlBhdGNoZXIoKTtcbiAgfVxuICByZXR1cm4gZGVmYXVsdEluc3RhbmNlJDQucmV2ZXJzZS5hcHBseShkZWZhdWx0SW5zdGFuY2UkNCwgYXJndW1lbnRzKTtcbn1cblxuZnVuY3Rpb24gY2xvbmUkMSgpIHtcbiAgaWYgKCFkZWZhdWx0SW5zdGFuY2UkNCkge1xuICAgIGRlZmF1bHRJbnN0YW5jZSQ0ID0gbmV3IERpZmZQYXRjaGVyKCk7XG4gIH1cbiAgcmV0dXJuIGRlZmF1bHRJbnN0YW5jZSQ0LmNsb25lLmFwcGx5KGRlZmF1bHRJbnN0YW5jZSQ0LCBhcmd1bWVudHMpO1xufVxuXG5leHBvcnRzLkRpZmZQYXRjaGVyID0gRGlmZlBhdGNoZXI7XG5leHBvcnRzLmZvcm1hdHRlcnMgPSBpbmRleDtcbmV4cG9ydHMuY29uc29sZSA9IGNvbnNvbGUkMTtcbmV4cG9ydHMuY3JlYXRlID0gY3JlYXRlO1xuZXhwb3J0cy5kYXRlUmV2aXZlciA9IGRhdGVSZXZpdmVyO1xuZXhwb3J0cy5kaWZmID0gZGlmZjtcbmV4cG9ydHMucGF0Y2ggPSBwYXRjaDtcbmV4cG9ydHMudW5wYXRjaCA9IHVucGF0Y2g7XG5leHBvcnRzLnJldmVyc2UgPSByZXZlcnNlO1xuZXhwb3J0cy5jbG9uZSA9IGNsb25lJDE7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG5cbn0pKSk7XG4iXSwibmFtZXMiOlsiZ2xvYmFsIiwiZmFjdG9yeSIsImV4cG9ydHMiLCJtb2R1bGUiLCJyZXF1aXJlIiwiZGVmaW5lIiwiYW1kIiwianNvbmRpZmZwYXRjaCIsImNoYWxrIiwiaGFzT3duUHJvcGVydHkiLCJfdHlwZW9mIiwiU3ltYm9sIiwiaXRlcmF0b3IiLCJvYmoiLCJjb25zdHJ1Y3RvciIsInByb3RvdHlwZSIsImNsYXNzQ2FsbENoZWNrIiwiaW5zdGFuY2UiLCJDb25zdHJ1Y3RvciIsIlR5cGVFcnJvciIsImNyZWF0ZUNsYXNzIiwiZGVmaW5lUHJvcGVydGllcyIsInRhcmdldCIsInByb3BzIiwiaSIsImxlbmd0aCIsImRlc2NyaXB0b3IiLCJlbnVtZXJhYmxlIiwiY29uZmlndXJhYmxlIiwid3JpdGFibGUiLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImtleSIsInByb3RvUHJvcHMiLCJzdGF0aWNQcm9wcyIsImdldCIsIm9iamVjdCIsInByb3BlcnR5IiwicmVjZWl2ZXIiLCJGdW5jdGlvbiIsImRlc2MiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJ1bmRlZmluZWQiLCJwYXJlbnQiLCJnZXRQcm90b3R5cGVPZiIsInZhbHVlIiwiZ2V0dGVyIiwiY2FsbCIsImluaGVyaXRzIiwic3ViQ2xhc3MiLCJzdXBlckNsYXNzIiwiY3JlYXRlIiwic2V0UHJvdG90eXBlT2YiLCJfX3Byb3RvX18iLCJwb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuIiwic2VsZiIsIlJlZmVyZW5jZUVycm9yIiwic2xpY2VkVG9BcnJheSIsInNsaWNlSXRlcmF0b3IiLCJhcnIiLCJfYXJyIiwiX24iLCJfZCIsIl9lIiwiX2kiLCJfcyIsIm5leHQiLCJkb25lIiwicHVzaCIsImVyciIsIkFycmF5IiwiaXNBcnJheSIsInRvQ29uc3VtYWJsZUFycmF5IiwiYXJyMiIsImZyb20iLCJQcm9jZXNzb3IiLCJvcHRpb25zIiwic2VsZk9wdGlvbnMiLCJwaXBlcyIsIl9vcHRpb25zIiwicGlwZSIsIm5hbWUiLCJwaXBlQXJnIiwicHJvY2Vzc29yIiwicHJvY2VzcyIsImlucHV0IiwiY29udGV4dCIsIm5leHRQaXBlIiwibGFzdFBpcGUiLCJsYXN0Q29udGV4dCIsIm5leHRBZnRlckNoaWxkcmVuIiwiaGFzUmVzdWx0IiwicmVzdWx0IiwiUGlwZSIsImZpbHRlcnMiLCJFcnJvciIsImRlYnVnIiwiaW5kZXgiLCJmaWx0ZXIiLCJsb2ciLCJmaWx0ZXJOYW1lIiwiZXhpdGluZyIsInJlc3VsdENoZWNrIiwibXNnIiwiY29uc29sZSIsImFwcGVuZCIsIl9maWx0ZXJzIiwiYXBwbHkiLCJhcmd1bWVudHMiLCJwcmVwZW5kIiwiX2ZpbHRlcnMyIiwidW5zaGlmdCIsImluZGV4T2YiLCJsaXN0IiwibWFwIiwiZiIsImFmdGVyIiwicGFyYW1zIiwic2xpY2UiLCJzcGxpY2UiLCJiZWZvcmUiLCJyZXBsYWNlIiwicmVtb3ZlIiwiY2xlYXIiLCJzaG91bGRIYXZlUmVzdWx0Iiwic2hvdWxkIiwiZXJyb3IiLCJub1Jlc3VsdCIsIkNvbnRleHQiLCJzZXRSZXN1bHQiLCJleGl0Iiwic3dpdGNoVG8iLCJjaGlsZCIsImNoaWxkTmFtZSIsInJvb3QiLCJjaGlsZHJlbiIsImEiLCJjbG9uZVJlZ0V4cCIsInJlIiwicmVnZXhNYXRjaCIsImV4ZWMiLCJ0b1N0cmluZyIsIlJlZ0V4cCIsImNsb25lIiwiYXJnIiwiRGF0ZSIsImdldFRpbWUiLCJjbG9uZWQiLCJEaWZmQ29udGV4dCIsIl9Db250ZXh0IiwibGVmdCIsInJpZ2h0IiwiX3RoaXMiLCJjbG9uZURpZmZWYWx1ZXMiLCJjbG9uZSQkMSIsIlBhdGNoQ29udGV4dCIsImRlbHRhIiwiUmV2ZXJzZUNvbnRleHQiLCJpc0FycmF5JDEiLCJkaWZmRmlsdGVyIiwidHJpdmlhbE1hdGNoZXNEaWZmRmlsdGVyIiwibGVmdFR5cGUiLCJyaWdodFR5cGUiLCJsZWZ0SXNBcnJheSIsInJpZ2h0SXNBcnJheSIsInBhdGNoRmlsdGVyIiwidHJpdmlhbE1hdGNoZXNQYXRjaEZpbHRlciIsIm5lc3RlZCIsInJlZ2V4QXJncyIsInJldmVyc2VGaWx0ZXIiLCJ0cml2aWFsUmVmZXJzZUZpbHRlciIsImNvbGxlY3RDaGlsZHJlbkRpZmZGaWx0ZXIiLCJfdCIsIm9iamVjdHNEaWZmRmlsdGVyIiwicHJvcGVydHlGaWx0ZXIiLCJwYXRjaEZpbHRlciQxIiwibmVzdGVkUGF0Y2hGaWx0ZXIiLCJjb2xsZWN0Q2hpbGRyZW5QYXRjaEZpbHRlciIsInJldmVyc2VGaWx0ZXIkMSIsIm5lc3RlZFJldmVyc2VGaWx0ZXIiLCJjb2xsZWN0Q2hpbGRyZW5SZXZlcnNlRmlsdGVyIiwiZGVmYXVsdE1hdGNoIiwiYXJyYXkxIiwiYXJyYXkyIiwiaW5kZXgxIiwiaW5kZXgyIiwibGVuZ3RoTWF0cml4IiwibWF0Y2giLCJsZW4xIiwibGVuMiIsIngiLCJ5IiwibWF0cml4IiwiTWF0aCIsIm1heCIsImJhY2t0cmFjayIsInNlcXVlbmNlIiwiaW5kaWNlczEiLCJpbmRpY2VzMiIsInN1YnNlcXVlbmNlIiwiZ2V0JDEiLCJpbm5lckNvbnRleHQiLCJqb2luIiwibGNzIiwiQVJSQVlfTU9WRSIsImlzQXJyYXkkMiIsImFycmF5SW5kZXhPZiIsImFycmF5IiwiaXRlbSIsImFycmF5c0hhdmVNYXRjaEJ5UmVmIiwidmFsMSIsInZhbDIiLCJtYXRjaEl0ZW1zIiwidmFsdWUxIiwidmFsdWUyIiwib2JqZWN0SGFzaCIsIm1hdGNoQnlQb3NpdGlvbiIsImhhc2gxIiwiaGFzaDIiLCJoYXNoQ2FjaGUxIiwiaGFzaENhY2hlMiIsImRpZmZGaWx0ZXIkMSIsImFycmF5c0RpZmZGaWx0ZXIiLCJtYXRjaENvbnRleHQiLCJjb21tb25IZWFkIiwiY29tbW9uVGFpbCIsInRyaW1tZWQxIiwidHJpbW1lZDIiLCJzZXEiLCJyZW1vdmVkSXRlbXMiLCJkZXRlY3RNb3ZlIiwiYXJyYXlzIiwiaW5jbHVkZVZhbHVlT25Nb3ZlIiwicmVtb3ZlZEl0ZW1zTGVuZ3RoIiwiaW5kZXhPbkFycmF5MiIsImlzTW92ZSIsInJlbW92ZUl0ZW1JbmRleDEiLCJjb21wYXJlIiwibnVtZXJpY2FsbHkiLCJiIiwibnVtZXJpY2FsbHlCeSIsInBhdGNoRmlsdGVyJDIiLCJ0b1JlbW92ZSIsInRvSW5zZXJ0IiwidG9Nb2RpZnkiLCJwYXJzZUludCIsInNvcnQiLCJpbmRleERpZmYiLCJyZW1vdmVkVmFsdWUiLCJ0b0luc2VydExlbmd0aCIsImluc2VydGlvbiIsInRvTW9kaWZ5TGVuZ3RoIiwibW9kaWZpY2F0aW9uIiwiY29sbGVjdENoaWxkcmVuUGF0Y2hGaWx0ZXIkMSIsInJldmVyc2VGaWx0ZXIkMiIsImFycmF5c1JldmVyc2VGaWx0ZXIiLCJuZXdOYW1lIiwic3Vic3RyIiwicmV2ZXJzZUFycmF5RGVsdGFJbmRleCIsIml0ZW1EZWx0YSIsInJldmVyc2VJbmRleCIsImRlbHRhSW5kZXgiLCJkZWx0YUl0ZW0iLCJtb3ZlRnJvbUluZGV4IiwibW92ZVRvSW5kZXgiLCJkZWxldGVJbmRleCIsImNvbGxlY3RDaGlsZHJlblJldmVyc2VGaWx0ZXIkMSIsImRpZmZGaWx0ZXIkMiIsImRhdGVzRGlmZkZpbHRlciIsImNyZWF0ZUNvbW1vbmpzTW9kdWxlIiwiZm4iLCJkaWZmTWF0Y2hQYXRjaCIsImRpZmZfbWF0Y2hfcGF0Y2giLCJEaWZmX1RpbWVvdXQiLCJEaWZmX0VkaXRDb3N0IiwiTWF0Y2hfVGhyZXNob2xkIiwiTWF0Y2hfRGlzdGFuY2UiLCJQYXRjaF9EZWxldGVUaHJlc2hvbGQiLCJQYXRjaF9NYXJnaW4iLCJNYXRjaF9NYXhCaXRzIiwiRElGRl9ERUxFVEUiLCJESUZGX0lOU0VSVCIsIkRJRkZfRVFVQUwiLCJkaWZmX21haW4iLCJ0ZXh0MSIsInRleHQyIiwib3B0X2NoZWNrbGluZXMiLCJvcHRfZGVhZGxpbmUiLCJOdW1iZXIiLCJNQVhfVkFMVUUiLCJkZWFkbGluZSIsImNoZWNrbGluZXMiLCJjb21tb25sZW5ndGgiLCJkaWZmX2NvbW1vblByZWZpeCIsImNvbW1vbnByZWZpeCIsInN1YnN0cmluZyIsImRpZmZfY29tbW9uU3VmZml4IiwiY29tbW9uc3VmZml4IiwiZGlmZnMiLCJkaWZmX2NvbXB1dGVfIiwiZGlmZl9jbGVhbnVwTWVyZ2UiLCJsb25ndGV4dCIsInNob3J0dGV4dCIsImhtIiwiZGlmZl9oYWxmTWF0Y2hfIiwidGV4dDFfYSIsInRleHQxX2IiLCJ0ZXh0Ml9hIiwidGV4dDJfYiIsIm1pZF9jb21tb24iLCJkaWZmc19hIiwiZGlmZnNfYiIsImNvbmNhdCIsImRpZmZfbGluZU1vZGVfIiwiZGlmZl9iaXNlY3RfIiwiZGlmZl9saW5lc1RvQ2hhcnNfIiwiY2hhcnMxIiwiY2hhcnMyIiwibGluZWFycmF5IiwibGluZUFycmF5IiwiZGlmZl9jaGFyc1RvTGluZXNfIiwiZGlmZl9jbGVhbnVwU2VtYW50aWMiLCJwb2ludGVyIiwiY291bnRfZGVsZXRlIiwiY291bnRfaW5zZXJ0IiwidGV4dF9kZWxldGUiLCJ0ZXh0X2luc2VydCIsImoiLCJwb3AiLCJ0ZXh0MV9sZW5ndGgiLCJ0ZXh0Ml9sZW5ndGgiLCJtYXhfZCIsImNlaWwiLCJ2X29mZnNldCIsInZfbGVuZ3RoIiwidjEiLCJ2MiIsImZyb250IiwiazFzdGFydCIsImsxZW5kIiwiazJzdGFydCIsImsyZW5kIiwiZCIsImsxIiwiazFfb2Zmc2V0IiwieDEiLCJ5MSIsImNoYXJBdCIsImsyX29mZnNldCIsIngyIiwiZGlmZl9iaXNlY3RTcGxpdF8iLCJrMiIsInkyIiwidGV4dDFhIiwidGV4dDJhIiwidGV4dDFiIiwidGV4dDJiIiwiZGlmZnNiIiwibGluZUhhc2giLCJkaWZmX2xpbmVzVG9DaGFyc011bmdlXyIsInRleHQiLCJjaGFycyIsImxpbmVTdGFydCIsImxpbmVFbmQiLCJsaW5lQXJyYXlMZW5ndGgiLCJsaW5lIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwiY2hhckNvZGVBdCIsInBvaW50ZXJtaW4iLCJwb2ludGVybWF4IiwibWluIiwicG9pbnRlcm1pZCIsInBvaW50ZXJzdGFydCIsImZsb29yIiwicG9pbnRlcmVuZCIsImRpZmZfY29tbW9uT3ZlcmxhcF8iLCJ0ZXh0X2xlbmd0aCIsImJlc3QiLCJwYXR0ZXJuIiwiZm91bmQiLCJkbXAiLCJkaWZmX2hhbGZNYXRjaElfIiwic2VlZCIsImJlc3RfY29tbW9uIiwiYmVzdF9sb25ndGV4dF9hIiwiYmVzdF9sb25ndGV4dF9iIiwiYmVzdF9zaG9ydHRleHRfYSIsImJlc3Rfc2hvcnR0ZXh0X2IiLCJwcmVmaXhMZW5ndGgiLCJzdWZmaXhMZW5ndGgiLCJobTEiLCJobTIiLCJjaGFuZ2VzIiwiZXF1YWxpdGllcyIsImVxdWFsaXRpZXNMZW5ndGgiLCJsYXN0ZXF1YWxpdHkiLCJsZW5ndGhfaW5zZXJ0aW9uczEiLCJsZW5ndGhfZGVsZXRpb25zMSIsImxlbmd0aF9pbnNlcnRpb25zMiIsImxlbmd0aF9kZWxldGlvbnMyIiwiZGlmZl9jbGVhbnVwU2VtYW50aWNMb3NzbGVzcyIsImRlbGV0aW9uIiwib3ZlcmxhcF9sZW5ndGgxIiwib3ZlcmxhcF9sZW5ndGgyIiwiZGlmZl9jbGVhbnVwU2VtYW50aWNTY29yZV8iLCJvbmUiLCJ0d28iLCJjaGFyMSIsImNoYXIyIiwibm9uQWxwaGFOdW1lcmljMSIsIm5vbkFscGhhTnVtZXJpY1JlZ2V4XyIsIm5vbkFscGhhTnVtZXJpYzIiLCJ3aGl0ZXNwYWNlMSIsIndoaXRlc3BhY2VSZWdleF8iLCJ3aGl0ZXNwYWNlMiIsImxpbmVCcmVhazEiLCJsaW5lYnJlYWtSZWdleF8iLCJsaW5lQnJlYWsyIiwiYmxhbmtMaW5lMSIsImJsYW5rbGluZUVuZFJlZ2V4XyIsImJsYW5rTGluZTIiLCJibGFua2xpbmVTdGFydFJlZ2V4XyIsImVxdWFsaXR5MSIsImVkaXQiLCJlcXVhbGl0eTIiLCJjb21tb25PZmZzZXQiLCJjb21tb25TdHJpbmciLCJiZXN0RXF1YWxpdHkxIiwiYmVzdEVkaXQiLCJiZXN0RXF1YWxpdHkyIiwiYmVzdFNjb3JlIiwic2NvcmUiLCJkaWZmX2NsZWFudXBFZmZpY2llbmN5IiwicHJlX2lucyIsInByZV9kZWwiLCJwb3N0X2lucyIsInBvc3RfZGVsIiwiZGlmZl94SW5kZXgiLCJsb2MiLCJsYXN0X2NoYXJzMSIsImxhc3RfY2hhcnMyIiwiZGlmZl9wcmV0dHlIdG1sIiwiaHRtbCIsInBhdHRlcm5fYW1wIiwicGF0dGVybl9sdCIsInBhdHRlcm5fZ3QiLCJwYXR0ZXJuX3BhcmEiLCJvcCIsImRhdGEiLCJkaWZmX3RleHQxIiwiZGlmZl90ZXh0MiIsImRpZmZfbGV2ZW5zaHRlaW4iLCJsZXZlbnNodGVpbiIsImluc2VydGlvbnMiLCJkZWxldGlvbnMiLCJkaWZmX3RvRGVsdGEiLCJlbmNvZGVVUkkiLCJkaWZmX2Zyb21EZWx0YSIsImRpZmZzTGVuZ3RoIiwidG9rZW5zIiwic3BsaXQiLCJwYXJhbSIsImRlY29kZVVSSSIsImV4IiwibiIsImlzTmFOIiwibWF0Y2hfbWFpbiIsIm1hdGNoX2JpdGFwXyIsInMiLCJtYXRjaF9hbHBoYWJldF8iLCJtYXRjaF9iaXRhcFNjb3JlXyIsImUiLCJhY2N1cmFjeSIsInByb3hpbWl0eSIsImFicyIsInNjb3JlX3RocmVzaG9sZCIsImJlc3RfbG9jIiwibGFzdEluZGV4T2YiLCJtYXRjaG1hc2siLCJiaW5fbWluIiwiYmluX21pZCIsImJpbl9tYXgiLCJsYXN0X3JkIiwic3RhcnQiLCJmaW5pc2giLCJyZCIsImNoYXJNYXRjaCIsInBhdGNoX2FkZENvbnRleHRfIiwicGF0Y2giLCJzdGFydDIiLCJsZW5ndGgxIiwicGFkZGluZyIsInByZWZpeCIsInN1ZmZpeCIsInN0YXJ0MSIsImxlbmd0aDIiLCJwYXRjaF9tYWtlIiwib3B0X2IiLCJvcHRfYyIsInBhdGNoZXMiLCJwYXRjaF9vYmoiLCJwYXRjaERpZmZMZW5ndGgiLCJjaGFyX2NvdW50MSIsImNoYXJfY291bnQyIiwicHJlcGF0Y2hfdGV4dCIsInBvc3RwYXRjaF90ZXh0IiwiZGlmZl90eXBlIiwiZGlmZl90ZXh0IiwicGF0Y2hfZGVlcENvcHkiLCJwYXRjaGVzQ29weSIsInBhdGNoQ29weSIsInBhdGNoX2FwcGx5IiwibnVsbFBhZGRpbmciLCJwYXRjaF9hZGRQYWRkaW5nIiwicGF0Y2hfc3BsaXRNYXgiLCJyZXN1bHRzIiwiZXhwZWN0ZWRfbG9jIiwic3RhcnRfbG9jIiwiZW5kX2xvYyIsIm1vZCIsInBhZGRpbmdMZW5ndGgiLCJleHRyYUxlbmd0aCIsInBhdGNoX3NpemUiLCJiaWdwYXRjaCIsInByZWNvbnRleHQiLCJlbXB0eSIsInNoaWZ0IiwicG9zdGNvbnRleHQiLCJwYXRjaF90b1RleHQiLCJwYXRjaF9mcm9tVGV4dCIsInRleHRsaW5lIiwidGV4dFBvaW50ZXIiLCJwYXRjaEhlYWRlciIsIm0iLCJzaWduIiwiY29vcmRzMSIsImNvb3JkczIiLCJURVhUX0RJRkYiLCJERUZBVUxUX01JTl9MRU5HVEgiLCJjYWNoZWREaWZmUGF0Y2giLCJnZXREaWZmTWF0Y2hQYXRjaCIsInJlcXVpcmVkIiwiZGlmZl9tYXRjaF9wYXRjaF9ub3RfZm91bmQiLCJkaWZmIiwidHh0MSIsInR4dDIiLCJfcGF0Y2giLCJfZXJyb3IiLCJ0ZXh0UGF0Y2hGYWlsZWQiLCJkaWZmRmlsdGVyJDMiLCJ0ZXh0c0RpZmZGaWx0ZXIiLCJtaW5MZW5ndGgiLCJ0ZXh0RGlmZiIsImRpZmZNYXRjaFBhdGNoJCQxIiwicGF0Y2hGaWx0ZXIkMyIsInRleHRzUGF0Y2hGaWx0ZXIiLCJ0ZXh0RGVsdGFSZXZlcnNlIiwibCIsImxpbmVzIiwibGluZVRtcCIsImhlYWRlciIsImhlYWRlclJlZ2V4IiwibGluZUhlYWRlciIsInJldmVyc2VGaWx0ZXIkMyIsInRleHRzUmV2ZXJzZUZpbHRlciIsIkRpZmZQYXRjaGVyIiwiX3Byb2Nlc3NvciIsInJldmVyc2UiLCJ1bnBhdGNoIiwiaXNBcnJheSQzIiwiZ2V0T2JqZWN0S2V5cyIsImtleXMiLCJuYW1lcyIsInRyaW1VbmRlcnNjb3JlIiwic3RyIiwiYXJyYXlLZXlUb1NvcnROdW1iZXIiLCJhcnJheUtleUNvbXBhcmVyIiwia2V5MSIsImtleTIiLCJCYXNlRm9ybWF0dGVyIiwiZm9ybWF0IiwicHJlcGFyZUNvbnRleHQiLCJyZWN1cnNlIiwiZmluYWxpemUiLCJidWZmZXIiLCJvdXQiLCJfYnVmZmVyIiwidHlwZUZvcm1hdHR0ZXJOb3RGb3VuZCIsImRlbHRhVHlwZSIsInR5cGVGb3JtYXR0dGVyRXJyb3JGb3JtYXR0ZXIiLCJfcmVmIiwibGVmdEtleSIsIm1vdmVkRnJvbSIsImlzTGFzdCIsInVzZU1vdmVPcmlnaW5IZXJlIiwibGVmdFZhbHVlIiwidHlwZSIsImdldERlbHRhVHlwZSIsIm5vZGVUeXBlIiwibm9kZUJlZ2luIiwicm9vdEJlZ2luIiwidHlwZUZvcm1hdHR0ZXIiLCJzdGFjayIsIm5vZGVFbmQiLCJyb290RW5kIiwiZm9ybWF0RGVsdGFDaGlsZHJlbiIsImZvckVhY2hEZWx0YUtleSIsImFycmF5S2V5cyIsIm1vdmVEZXN0aW5hdGlvbnMiLCJpbmNsdWRlTW92ZURlc3RpbmF0aW9ucyIsInBhcnNlVGV4dERpZmYiLCJvdXRwdXQiLCJsaW5lT3V0cHV0IiwicGllY2VzIiwibG9jYXRpb24iLCJjaHIiLCJwaWVjZUluZGV4IiwicGllY2VzTGVuZ3RoIiwicGllY2UiLCJwaWVjZU91dHB1dCIsImJhc2UiLCJmcmVlemUiLCJkZWZhdWx0IiwiSHRtbEZvcm1hdHRlciIsIl9CYXNlRm9ybWF0dGVyIiwiZm9ybWF0VmFsdWUiLCJodG1sRXNjYXBlIiwiSlNPTiIsInN0cmluZ2lmeSIsImZvcm1hdFRleHREaWZmU3RyaW5nIiwibm9kZUNsYXNzIiwiaGFzQXJyb3dzIiwiYWRqdXN0QXJyb3dzIiwiZm9ybWF0X3VuY2hhbmdlZCIsImZvcm1hdF9tb3ZlZGVzdGluYXRpb24iLCJmb3JtYXRfbm9kZSIsImZvcm1hdF9hZGRlZCIsImZvcm1hdF9tb2RpZmllZCIsImZvcm1hdF9kZWxldGVkIiwiZm9ybWF0X21vdmVkIiwiZm9ybWF0X3RleHRkaWZmIiwicmVwbGFjZW1lbnRzIiwianNvbmRpZmZwYXRjaEh0bWxGb3JtYXR0ZXJBZGp1c3RBcnJvd3MiLCJub2RlQXJnIiwibm9kZSIsImRvY3VtZW50IiwiZ2V0RWxlbWVudFRleHQiLCJ0ZXh0Q29udGVudCIsImlubmVyVGV4dCIsImVhY2hCeVF1ZXJ5IiwiZWwiLCJxdWVyeSIsImVsZW1zIiwicXVlcnlTZWxlY3RvckFsbCIsImVhY2hDaGlsZHJlbiIsIl9yZWYyIiwiX3JlZjMiLCJwYXJlbnROb2RlIiwic3R5bGUiLCJhcnJvd1BhcmVudCIsInN2ZyIsInBhdGgiLCJkaXNwbGF5IiwiZGVzdGluYXRpb24iLCJxdWVyeVNlbGVjdG9yIiwiY29udGFpbmVyIiwiZGVzdGluYXRpb25FbGVtIiwiZ2V0QXR0cmlidXRlIiwiZGlzdGFuY2UiLCJvZmZzZXRUb3AiLCJzZXRBdHRyaWJ1dGUiLCJ0b3AiLCJjdXJ2ZSIsInJvdW5kIiwic2hvd1VuY2hhbmdlZCIsInNob3ciLCJkZWxheSIsImJvZHkiLCJjbGFzc2VzIiwic2hvd2luZyIsImhpZGluZyIsInZpc2libGUiLCJoaWRkZW4iLCJjbGFzc0xpc3QiLCJhZGQiLCJzZXRUaW1lb3V0IiwiaW50ZXJ2YWxJZCIsInNldEludGVydmFsIiwiY2xlYXJJbnRlcnZhbCIsImhpZGVVbmNoYW5nZWQiLCJkZWZhdWx0SW5zdGFuY2UiLCJBbm5vdGF0ZWRGb3JtYXR0ZXIiLCJpbmRlbnQiLCJsZXZlbHMiLCJpbmRlbnRMZXZlbCIsImluZGVudFBhZCIsInJvdyIsImpzb24iLCJodG1sTm90ZSIsIndyYXBQcm9wZXJ0eU5hbWUiLCJkZWx0YUFubm90YXRpb25zIiwiYWRkZWQiLCJmb3JtYXRMZWdlbmQiLCJtb2RpZmllZCIsImRlbGV0ZWQiLCJtb3ZlZCIsInRleHRkaWZmIiwiZm9ybWF0QW55Q2hhbmdlIiwiYW5ub3RhdG9yIiwiZGVmYXVsdEluc3RhbmNlJDEiLCJmb3JtYXQkMSIsImFubm90YXRlZCIsIk9QRVJBVElPTlMiLCJtb3ZlIiwiSlNPTkZvcm1hdHRlciIsInB1c2hDdXJyZW50T3AiLCJ2YWwiLCJjdXJyZW50UGF0aCIsInB1c2hNb3ZlT3AiLCJ0byIsInRvUGF0aCIsImxhc3QiLCJzb3J0QnkiLCJwcmVkIiwiY29tcGFyZUJ5SW5kZXhEZXNjIiwiaW5kZXhBIiwiaW5kZXhCIiwibGFzdEEiLCJsYXN0QiIsIm9wc0J5RGVzY2VuZGluZ09yZGVyIiwicmVtb3ZlT3BzIiwic3BsaXRBIiwic3BsaXRCIiwicGFydGl0aW9uT3BzIiwiZm5zIiwiaW5pdEFyciIsImZpbGwiLCJwb3NpdGlvbiIsInJlZHVjZSIsImFjYyIsImlzTW92ZU9wIiwiaXNSZW1vdmVPcCIsIl9yZWY0IiwicmVvcmRlck9wcyIsIl9wYXJ0aXRpb25PcHMiLCJfcGFydGl0aW9uT3BzMiIsIm1vdmVPcHMiLCJyZW1vdmVkT3BzIiwicmVzdE9wcyIsInJlbW92ZU9wc1JldmVyc2UiLCJkZWZhdWx0SW5zdGFuY2UkMiIsImZvcm1hdCQyIiwianNvbnBhdGNoIiwiY2hhbGtDb2xvciIsIl9sZW4iLCJhcmdzIiwiX2tleSIsImNvbG9ycyIsIm1vdmVkZXN0aW5hdGlvbiIsInVuY2hhbmdlZCIsInRleHREaWZmTGluZSIsIkNvbnNvbGVGb3JtYXR0ZXIiLCJvdXRMaW5lIiwiX2xlbjIiLCJfa2V5MiIsImNvbG9yIiwicHVzaENvbG9yIiwicG9wQ29sb3IiLCJkZWZhdWx0SW5zdGFuY2UkMyIsImZvcm1hdCQzIiwibG9nJDEiLCJjb25zb2xlJDEiLCJkYXRlUmV2aXZlciIsInBhcnRzIiwiVVRDIiwiZGVmYXVsdEluc3RhbmNlJDQiLCJjbG9uZSQxIiwiZm9ybWF0dGVycyJdLCJtYXBwaW5ncyI6IkFBQUMsQ0FBQSxTQUFVQSxNQUFNLEVBQUVDLE9BQU87SUFDekIsT0FBT0MsWUFBWSxZQUFZLE9BQU9DLFdBQVcsY0FBY0YsUUFBUUMsU0FBU0UsUUFBUSxjQUN4RixPQUFPQyxXQUFXLGNBQWNBLE9BQU9DLEdBQUcsR0FBR0QsT0FBTztRQUFDO1FBQVc7S0FBVSxFQUFFSixXQUMzRUEsUUFBU0QsT0FBT08sYUFBYSxHQUFHLENBQUMsR0FBR1AsT0FBT1EsS0FBSztBQUNsRCxDQUFBLEVBQUUsSUFBSSxFQUFHLFNBQVVOLFFBQU8sRUFBQ00sS0FBSztJQUFJO0lBRXBDQSxRQUFRQSxTQUFTQSxNQUFNQyxjQUFjLENBQUMsYUFBYUQsS0FBSyxDQUFDLFVBQVUsR0FBR0E7SUFFdEUsSUFBSUUs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