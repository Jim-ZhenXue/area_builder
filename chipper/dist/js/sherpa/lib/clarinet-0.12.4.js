(function(clarinet1) {
    "use strict";
    // non node-js needs to set clarinet debug on root
    var env = typeof process === 'object' && process.env ? process.env : self;
    clarinet1.parser = function(opt) {
        return new CParser(opt);
    };
    clarinet1.CParser = CParser;
    clarinet1.CStream = CStream;
    clarinet1.createStream = createStream;
    clarinet1.MAX_BUFFER_LENGTH = 64 * 1024;
    clarinet1.DEBUG = env.CDEBUG === 'debug';
    clarinet1.INFO = env.CDEBUG === 'debug' || env.CDEBUG === 'info';
    clarinet1.EVENTS = [
        "value",
        "string",
        "key",
        "openobject",
        "closeobject",
        "openarray",
        "closearray",
        "error",
        "end",
        "ready"
    ];
    var buffers = {
        textNode: undefined,
        numberNode: ""
    }, streamWraps = clarinet1.EVENTS.filter(function(ev) {
        return ev !== "error" && ev !== "end";
    }), S = 0, Stream;
    clarinet1.STATE = {
        BEGIN: S++,
        VALUE: S++ // general stuff
        ,
        OPEN_OBJECT: S++ // {
        ,
        CLOSE_OBJECT: S++ // }
        ,
        OPEN_ARRAY: S++ // [
        ,
        CLOSE_ARRAY: S++ // ]
        ,
        TEXT_ESCAPE: S++ // \ stuff
        ,
        STRING: S++ // ""
        ,
        BACKSLASH: S++,
        END: S++ // No more stack
        ,
        OPEN_KEY: S++ // , "a"
        ,
        CLOSE_KEY: S++ // :
        ,
        TRUE: S++ // r
        ,
        TRUE2: S++ // u
        ,
        TRUE3: S++ // e
        ,
        FALSE: S++ // a
        ,
        FALSE2: S++ // l
        ,
        FALSE3: S++ // s
        ,
        FALSE4: S++ // e
        ,
        NULL: S++ // u
        ,
        NULL2: S++ // l
        ,
        NULL3: S++ // l
        ,
        NUMBER_DECIMAL_POINT: S++ // .
        ,
        NUMBER_DIGIT: S++ // [0-9]
    };
    for(var s_ in clarinet1.STATE)clarinet1.STATE[clarinet1.STATE[s_]] = s_;
    // switcharoo
    S = clarinet1.STATE;
    const Char = {
        tab: 0x09,
        lineFeed: 0x0A,
        carriageReturn: 0x0D,
        space: 0x20,
        doubleQuote: 0x22,
        plus: 0x2B,
        comma: 0x2C,
        minus: 0x2D,
        period: 0x2E,
        _0: 0x30,
        _9: 0x39,
        colon: 0x3A,
        E: 0x45,
        openBracket: 0x5B,
        backslash: 0x5C,
        closeBracket: 0x5D,
        a: 0x61,
        b: 0x62,
        e: 0x65,
        f: 0x66,
        l: 0x6C,
        n: 0x6E,
        r: 0x72,
        s: 0x73,
        t: 0x74,
        u: 0x75,
        openBrace: 0x7B,
        closeBrace: 0x7D
    };
    if (!Object.create) {
        Object.create = function(o) {
            function f() {
                this["__proto__"] = o;
            }
            f.prototype = o;
            return new f;
        };
    }
    if (!Object.getPrototypeOf) {
        Object.getPrototypeOf = function(o) {
            return o["__proto__"];
        };
    }
    if (!Object.keys) {
        Object.keys = function(o) {
            var a = [];
            for(var i in o)if (o.hasOwnProperty(i)) a.push(i);
            return a;
        };
    }
    function checkBufferLength(parser) {
        var maxAllowed = Math.max(clarinet1.MAX_BUFFER_LENGTH, 10), maxActual = 0;
        for(var buffer in buffers){
            var len = parser[buffer] === undefined ? 0 : parser[buffer].length;
            if (len > maxAllowed) {
                switch(buffer){
                    case "text":
                        closeText(parser);
                        break;
                    default:
                        error(parser, "Max buffer length exceeded: " + buffer);
                }
            }
            maxActual = Math.max(maxActual, len);
        }
        parser.bufferCheckPosition = clarinet1.MAX_BUFFER_LENGTH - maxActual + parser.position;
    }
    function clearBuffers(parser) {
        for(var buffer in buffers){
            parser[buffer] = buffers[buffer];
        }
    }
    var stringTokenPattern = /[\\"\n]/g;
    function CParser(opt) {
        if (!(this instanceof CParser)) return new CParser(opt);
        var parser = this;
        clearBuffers(parser);
        parser.bufferCheckPosition = clarinet1.MAX_BUFFER_LENGTH;
        parser.q = parser.c = parser.p = "";
        parser.opt = opt || {};
        parser.closed = parser.closedRoot = parser.sawRoot = false;
        parser.tag = parser.error = null;
        parser.state = S.BEGIN;
        parser.stack = new Array();
        // mostly just for error reporting
        parser.position = parser.column = 0;
        parser.line = 1;
        parser.slashed = false;
        parser.unicodeI = 0;
        parser.unicodeS = null;
        parser.depth = 0;
        emit(parser, "onready");
    }
    CParser.prototype = {
        end: function() {
            end(this);
        },
        write: write,
        resume: function() {
            this.error = null;
            return this;
        },
        close: function() {
            return this.write(null);
        }
    };
    try {
        Stream = require("stream").Stream;
    } catch (ex) {
        Stream = function() {};
    }
    function createStream(opt) {
        return new CStream(opt);
    }
    function CStream(opt) {
        if (!(this instanceof CStream)) return new CStream(opt);
        this._parser = new CParser(opt);
        this.writable = true;
        this.readable = true;
        //var Buffer = this.Buffer || function Buffer () {}; // if we don't have Buffers, fake it so we can do `var instanceof Buffer` and not throw an error
        this.bytes_remaining = 0; // number of bytes remaining in multi byte utf8 char to read after split boundary
        this.bytes_in_sequence = 0; // bytes in multi byte utf8 char to read
        this.temp_buffs = {
            "2": new Buffer(2),
            "3": new Buffer(3),
            "4": new Buffer(4)
        }; // for rebuilding chars split before boundary is reached
        this.string = '';
        var me = this;
        Stream.apply(me);
        this._parser.onend = function() {
            me.emit("end");
        };
        this._parser.onerror = function(er) {
            me.emit("error", er);
            me._parser.error = null;
        };
        streamWraps.forEach(function(ev) {
            Object.defineProperty(me, "on" + ev, {
                get: function() {
                    return me._parser["on" + ev];
                },
                set: function(h) {
                    if (!h) {
                        me.removeAllListeners(ev);
                        me._parser["on" + ev] = h;
                        return h;
                    }
                    me.on(ev, h);
                },
                enumerable: true,
                configurable: false
            });
        });
    }
    CStream.prototype = Object.create(Stream.prototype, {
        constructor: {
            value: CStream
        }
    });
    CStream.prototype.write = function(data) {
        data = new Buffer(data);
        for(var i = 0; i < data.length; i++){
            var n = data[i];
            // check for carry over of a multi byte char split between data chunks
            // & fill temp buffer it with start of this data chunk up to the boundary limit set in the last iteration
            if (this.bytes_remaining > 0) {
                for(var j = 0; j < this.bytes_remaining; j++){
                    this.temp_buffs[this.bytes_in_sequence][this.bytes_in_sequence - this.bytes_remaining + j] = data[j];
                }
                this.string = this.temp_buffs[this.bytes_in_sequence].toString();
                this.bytes_in_sequence = this.bytes_remaining = 0;
                // move iterator forward by number of byte read during sequencing
                i = i + j - 1;
                // pass data to parser and move forward to parse rest of data
                this._parser.write(this.string);
                this.emit("data", this.string);
                continue;
            }
            // if no remainder bytes carried over, parse multi byte (>=128) chars one at a time
            if (this.bytes_remaining === 0 && n >= 128) {
                if (n >= 194 && n <= 223) this.bytes_in_sequence = 2;
                if (n >= 224 && n <= 239) this.bytes_in_sequence = 3;
                if (n >= 240 && n <= 244) this.bytes_in_sequence = 4;
                if (this.bytes_in_sequence + i > data.length) {
                    for(var k = 0; k <= data.length - 1 - i; k++){
                        this.temp_buffs[this.bytes_in_sequence][k] = data[i + k]; // fill temp data of correct size with bytes available in this chunk
                    }
                    this.bytes_remaining = i + this.bytes_in_sequence - data.length;
                    // immediately return as we need another chunk to sequence the character
                    return true;
                } else {
                    this.string = data.slice(i, i + this.bytes_in_sequence).toString();
                    i = i + this.bytes_in_sequence - 1;
                    this._parser.write(this.string);
                    this.emit("data", this.string);
                    continue;
                }
            }
            // is there a range of characters that are immediately parsable?
            for(var p = i; p < data.length; p++){
                if (data[p] >= 128) break;
            }
            this.string = data.slice(i, p).toString();
            this._parser.write(this.string);
            this.emit("data", this.string);
            i = p - 1;
            continue;
        }
    };
    CStream.prototype.end = function(chunk) {
        if (chunk && chunk.length) this._parser.write(chunk.toString());
        this._parser.end();
        return true;
    };
    CStream.prototype.on = function(ev, handler) {
        var me = this;
        if (!me._parser["on" + ev] && streamWraps.indexOf(ev) !== -1) {
            me._parser["on" + ev] = function() {
                var args = arguments.length === 1 ? [
                    arguments[0]
                ] : Array.apply(null, arguments);
                args.splice(0, 0, ev);
                me.emit.apply(me, args);
            };
        }
        return Stream.prototype.on.call(me, ev, handler);
    };
    CStream.prototype.destroy = function() {
        clearBuffers(this._parser);
        this.emit("close");
    };
    function emit(parser, event, data) {
        if (clarinet1.INFO) console.log('-- emit', event, data);
        if (parser[event]) parser[event](data);
    }
    function emitNode(parser, event, data) {
        closeValue(parser);
        emit(parser, event, data);
    }
    function closeValue(parser, event) {
        parser.textNode = textopts(parser.opt, parser.textNode);
        if (parser.textNode !== undefined) {
            emit(parser, event ? event : "onvalue", parser.textNode);
        }
        parser.textNode = undefined;
    }
    function closeNumber(parser) {
        if (parser.numberNode) emit(parser, "onvalue", parseFloat(parser.numberNode));
        parser.numberNode = "";
    }
    function textopts(opt, text) {
        if (text === undefined) {
            return text;
        }
        if (opt.trim) text = text.trim();
        if (opt.normalize) text = text.replace(/\s+/g, " ");
        return text;
    }
    function error(parser, er) {
        closeValue(parser);
        er += "\nLine: " + parser.line + "\nColumn: " + parser.column + "\nChar: " + parser.c;
        er = new Error(er);
        parser.error = er;
        emit(parser, "onerror", er);
        return parser;
    }
    function end(parser) {
        if (parser.state !== S.VALUE || parser.depth !== 0) error(parser, "Unexpected end");
        closeValue(parser);
        parser.c = "";
        parser.closed = true;
        emit(parser, "onend");
        CParser.call(parser, parser.opt);
        return parser;
    }
    function isWhitespace(c) {
        return c === Char.carriageReturn || c === Char.lineFeed || c === Char.space || c === Char.tab;
    }
    function write(chunk) {
        var parser = this;
        if (this.error) throw this.error;
        if (parser.closed) return error(parser, "Cannot write after close. Assign an onready handler.");
        if (chunk === null) return end(parser);
        var i = 0, c = chunk.charCodeAt(0), p = parser.p;
        if (clarinet1.DEBUG) console.log('write -> [' + chunk + ']');
        while(c){
            p = c;
            parser.c = c = chunk.charCodeAt(i++);
            // if chunk doesnt have next, like streaming char by char
            // this way we need to check if previous is really previous
            // if not we need to reset to what the parser says is the previous
            // from buffer
            if (p !== c) parser.p = p;
            else p = parser.p;
            if (!c) break;
            if (clarinet1.DEBUG) console.log(i, c, clarinet1.STATE[parser.state]);
            parser.position++;
            if (c === Char.lineFeed) {
                parser.line++;
                parser.column = 0;
            } else parser.column++;
            switch(parser.state){
                case S.BEGIN:
                    if (c === Char.openBrace) parser.state = S.OPEN_OBJECT;
                    else if (c === Char.openBracket) parser.state = S.OPEN_ARRAY;
                    else if (!isWhitespace(c)) error(parser, "Non-whitespace before {[.");
                    continue;
                case S.OPEN_KEY:
                case S.OPEN_OBJECT:
                    if (isWhitespace(c)) continue;
                    if (parser.state === S.OPEN_KEY) parser.stack.push(S.CLOSE_KEY);
                    else {
                        if (c === Char.closeBrace) {
                            emit(parser, 'onopenobject');
                            this.depth++;
                            emit(parser, 'oncloseobject');
                            this.depth--;
                            parser.state = parser.stack.pop() || S.VALUE;
                            continue;
                        } else parser.stack.push(S.CLOSE_OBJECT);
                    }
                    if (c === Char.doubleQuote) parser.state = S.STRING;
                    else error(parser, "Malformed object key should start with \"");
                    continue;
                case S.CLOSE_KEY:
                case S.CLOSE_OBJECT:
                    if (isWhitespace(c)) continue;
                    var event = parser.state === S.CLOSE_KEY ? 'key' : 'object';
                    if (c === Char.colon) {
                        if (parser.state === S.CLOSE_OBJECT) {
                            parser.stack.push(S.CLOSE_OBJECT);
                            closeValue(parser, 'onopenobject');
                            this.depth++;
                        } else closeValue(parser, 'onkey');
                        parser.state = S.VALUE;
                    } else if (c === Char.closeBrace) {
                        emitNode(parser, 'oncloseobject');
                        this.depth--;
                        parser.state = parser.stack.pop() || S.VALUE;
                    } else if (c === Char.comma) {
                        if (parser.state === S.CLOSE_OBJECT) parser.stack.push(S.CLOSE_OBJECT);
                        closeValue(parser);
                        parser.state = S.OPEN_KEY;
                    } else error(parser, 'Bad object');
                    continue;
                case S.OPEN_ARRAY:
                case S.VALUE:
                    if (isWhitespace(c)) continue;
                    if (parser.state === S.OPEN_ARRAY) {
                        emit(parser, 'onopenarray');
                        this.depth++;
                        parser.state = S.VALUE;
                        if (c === Char.closeBracket) {
                            emit(parser, 'onclosearray');
                            this.depth--;
                            parser.state = parser.stack.pop() || S.VALUE;
                            continue;
                        } else {
                            parser.stack.push(S.CLOSE_ARRAY);
                        }
                    }
                    if (c === Char.doubleQuote) parser.state = S.STRING;
                    else if (c === Char.openBrace) parser.state = S.OPEN_OBJECT;
                    else if (c === Char.openBracket) parser.state = S.OPEN_ARRAY;
                    else if (c === Char.t) parser.state = S.TRUE;
                    else if (c === Char.f) parser.state = S.FALSE;
                    else if (c === Char.n) parser.state = S.NULL;
                    else if (c === Char.minus) {
                        parser.numberNode += "-";
                    } else if (Char._0 <= c && c <= Char._9) {
                        parser.numberNode += String.fromCharCode(c);
                        parser.state = S.NUMBER_DIGIT;
                    } else error(parser, "Bad value");
                    continue;
                case S.CLOSE_ARRAY:
                    if (c === Char.comma) {
                        parser.stack.push(S.CLOSE_ARRAY);
                        closeValue(parser, 'onvalue');
                        parser.state = S.VALUE;
                    } else if (c === Char.closeBracket) {
                        emitNode(parser, 'onclosearray');
                        this.depth--;
                        parser.state = parser.stack.pop() || S.VALUE;
                    } else if (isWhitespace(c)) continue;
                    else error(parser, 'Bad array');
                    continue;
                case S.STRING:
                    if (parser.textNode === undefined) {
                        parser.textNode = "";
                    }
                    // thanks thejh, this is an about 50% performance improvement.
                    var starti = i - 1, slashed = parser.slashed, unicodeI = parser.unicodeI;
                    STRING_BIGLOOP: while(true){
                        if (clarinet1.DEBUG) console.log(i, c, clarinet1.STATE[parser.state], slashed);
                        // zero means "no unicode active". 1-4 mean "parse some more". end after 4.
                        while(unicodeI > 0){
                            parser.unicodeS += String.fromCharCode(c);
                            c = chunk.charCodeAt(i++);
                            parser.position++;
                            if (unicodeI === 4) {
                                // TODO this might be slow? well, probably not used too often anyway
                                parser.textNode += String.fromCharCode(parseInt(parser.unicodeS, 16));
                                unicodeI = 0;
                                starti = i - 1;
                            } else {
                                unicodeI++;
                            }
                            // we can just break here: no stuff we skipped that still has to be sliced out or so
                            if (!c) break STRING_BIGLOOP;
                        }
                        if (c === Char.doubleQuote && !slashed) {
                            parser.state = parser.stack.pop() || S.VALUE;
                            parser.textNode += chunk.substring(starti, i - 1);
                            parser.position += i - 1 - starti;
                            break;
                        }
                        if (c === Char.backslash && !slashed) {
                            slashed = true;
                            parser.textNode += chunk.substring(starti, i - 1);
                            parser.position += i - 1 - starti;
                            c = chunk.charCodeAt(i++);
                            parser.position++;
                            if (!c) break;
                        }
                        if (slashed) {
                            slashed = false;
                            if (c === Char.n) {
                                parser.textNode += '\n';
                            } else if (c === Char.r) {
                                parser.textNode += '\r';
                            } else if (c === Char.t) {
                                parser.textNode += '\t';
                            } else if (c === Char.f) {
                                parser.textNode += '\f';
                            } else if (c === Char.b) {
                                parser.textNode += '\b';
                            } else if (c === Char.u) {
                                // \uxxxx. meh!
                                unicodeI = 1;
                                parser.unicodeS = '';
                            } else {
                                parser.textNode += String.fromCharCode(c);
                            }
                            c = chunk.charCodeAt(i++);
                            parser.position++;
                            starti = i - 1;
                            if (!c) break;
                            else continue;
                        }
                        stringTokenPattern.lastIndex = i;
                        var reResult = stringTokenPattern.exec(chunk);
                        if (reResult === null) {
                            i = chunk.length + 1;
                            parser.textNode += chunk.substring(starti, i - 1);
                            parser.position += i - 1 - starti;
                            break;
                        }
                        i = reResult.index + 1;
                        c = chunk.charCodeAt(reResult.index);
                        if (!c) {
                            parser.textNode += chunk.substring(starti, i - 1);
                            parser.position += i - 1 - starti;
                            break;
                        }
                    }
                    parser.slashed = slashed;
                    parser.unicodeI = unicodeI;
                    continue;
                case S.TRUE:
                    if (c === Char.r) parser.state = S.TRUE2;
                    else error(parser, 'Invalid true started with t' + c);
                    continue;
                case S.TRUE2:
                    if (c === Char.u) parser.state = S.TRUE3;
                    else error(parser, 'Invalid true started with tr' + c);
                    continue;
                case S.TRUE3:
                    if (c === Char.e) {
                        emit(parser, "onvalue", true);
                        parser.state = parser.stack.pop() || S.VALUE;
                    } else error(parser, 'Invalid true started with tru' + c);
                    continue;
                case S.FALSE:
                    if (c === Char.a) parser.state = S.FALSE2;
                    else error(parser, 'Invalid false started with f' + c);
                    continue;
                case S.FALSE2:
                    if (c === Char.l) parser.state = S.FALSE3;
                    else error(parser, 'Invalid false started with fa' + c);
                    continue;
                case S.FALSE3:
                    if (c === Char.s) parser.state = S.FALSE4;
                    else error(parser, 'Invalid false started with fal' + c);
                    continue;
                case S.FALSE4:
                    if (c === Char.e) {
                        emit(parser, "onvalue", false);
                        parser.state = parser.stack.pop() || S.VALUE;
                    } else error(parser, 'Invalid false started with fals' + c);
                    continue;
                case S.NULL:
                    if (c === Char.u) parser.state = S.NULL2;
                    else error(parser, 'Invalid null started with n' + c);
                    continue;
                case S.NULL2:
                    if (c === Char.l) parser.state = S.NULL3;
                    else error(parser, 'Invalid null started with nu' + c);
                    continue;
                case S.NULL3:
                    if (c === Char.l) {
                        emit(parser, "onvalue", null);
                        parser.state = parser.stack.pop() || S.VALUE;
                    } else error(parser, 'Invalid null started with nul' + c);
                    continue;
                case S.NUMBER_DECIMAL_POINT:
                    if (c === Char.period) {
                        parser.numberNode += ".";
                        parser.state = S.NUMBER_DIGIT;
                    } else error(parser, 'Leading zero not followed by .');
                    continue;
                case S.NUMBER_DIGIT:
                    if (Char._0 <= c && c <= Char._9) parser.numberNode += String.fromCharCode(c);
                    else if (c === Char.period) {
                        if (parser.numberNode.indexOf('.') !== -1) error(parser, 'Invalid number has two dots');
                        parser.numberNode += ".";
                    } else if (c === Char.e || c === Char.E) {
                        if (parser.numberNode.indexOf('e') !== -1 || parser.numberNode.indexOf('E') !== -1) error(parser, 'Invalid number has two exponential');
                        parser.numberNode += "e";
                    } else if (c === Char.plus || c === Char.minus) {
                        if (!(p === Char.e || p === Char.E)) error(parser, 'Invalid symbol in number');
                        parser.numberNode += String.fromCharCode(c);
                    } else {
                        closeNumber(parser);
                        i--; // go back one
                        parser.state = parser.stack.pop() || S.VALUE;
                    }
                    continue;
                default:
                    error(parser, "Unknown state: " + parser.state);
            }
        }
        if (parser.position >= parser.bufferCheckPosition) checkBufferLength(parser);
        return parser;
    }
})(typeof exports === "undefined" ? clarinet = {} : exports);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvY2xhcmluZXQtMC4xMi40LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIjsoZnVuY3Rpb24gKGNsYXJpbmV0KSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIG5vbiBub2RlLWpzIG5lZWRzIHRvIHNldCBjbGFyaW5ldCBkZWJ1ZyBvbiByb290XG4gIHZhciBlbnYgPSh0eXBlb2YgcHJvY2VzcyA9PT0gJ29iamVjdCcgJiYgcHJvY2Vzcy5lbnYpXG4gICAgICAgICAgID8gcHJvY2Vzcy5lbnZcbiAgICAgICAgICAgOiBzZWxmO1xuXG4gIGNsYXJpbmV0LnBhcnNlciAgICAgICAgICAgID0gZnVuY3Rpb24gKG9wdCkgeyByZXR1cm4gbmV3IENQYXJzZXIob3B0KTt9O1xuICBjbGFyaW5ldC5DUGFyc2VyICAgICAgICAgICA9IENQYXJzZXI7XG4gIGNsYXJpbmV0LkNTdHJlYW0gICAgICAgICAgID0gQ1N0cmVhbTtcbiAgY2xhcmluZXQuY3JlYXRlU3RyZWFtICAgICAgPSBjcmVhdGVTdHJlYW07XG4gIGNsYXJpbmV0Lk1BWF9CVUZGRVJfTEVOR1RIID0gNjQgKiAxMDI0O1xuICBjbGFyaW5ldC5ERUJVRyAgICAgICAgICAgICA9IChlbnYuQ0RFQlVHPT09J2RlYnVnJyk7XG4gIGNsYXJpbmV0LklORk8gICAgICAgICAgICAgID0gKGVudi5DREVCVUc9PT0nZGVidWcnIHx8IGVudi5DREVCVUc9PT0naW5mbycpO1xuICBjbGFyaW5ldC5FVkVOVFMgICAgICAgICAgICA9XG4gICAgWyBcInZhbHVlXCJcbiAgICAgICwgXCJzdHJpbmdcIlxuICAgICAgLCBcImtleVwiXG4gICAgICAsIFwib3Blbm9iamVjdFwiXG4gICAgICAsIFwiY2xvc2VvYmplY3RcIlxuICAgICAgLCBcIm9wZW5hcnJheVwiXG4gICAgICAsIFwiY2xvc2VhcnJheVwiXG4gICAgICAsIFwiZXJyb3JcIlxuICAgICAgLCBcImVuZFwiXG4gICAgICAsIFwicmVhZHlcIlxuICAgIF07XG5cbiAgdmFyIGJ1ZmZlcnMgICAgID0ge1xuICAgICAgdGV4dE5vZGU6IHVuZGVmaW5lZCxcbiAgICAgIG51bWJlck5vZGU6IFwiXCJcbiAgICB9XG4gICAgLCBzdHJlYW1XcmFwcyA9IGNsYXJpbmV0LkVWRU5UUy5maWx0ZXIoZnVuY3Rpb24gKGV2KSB7XG4gICAgICByZXR1cm4gZXYgIT09IFwiZXJyb3JcIiAmJiBldiAhPT0gXCJlbmRcIjtcbiAgICB9KVxuICAgICwgUyAgICAgICAgICAgPSAwXG4gICAgLCBTdHJlYW1cbiAgO1xuXG4gIGNsYXJpbmV0LlNUQVRFID1cbiAgICB7IEJFR0lOICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFMrK1xuICAgICAgLCBWQUxVRSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBTKysgLy8gZ2VuZXJhbCBzdHVmZlxuICAgICAgLCBPUEVOX09CSkVDVCAgICAgICAgICAgICAgICAgICAgICAgOiBTKysgLy8ge1xuICAgICAgLCBDTE9TRV9PQkpFQ1QgICAgICAgICAgICAgICAgICAgICAgOiBTKysgLy8gfVxuICAgICAgLCBPUEVOX0FSUkFZICAgICAgICAgICAgICAgICAgICAgICAgOiBTKysgLy8gW1xuICAgICAgLCBDTE9TRV9BUlJBWSAgICAgICAgICAgICAgICAgICAgICAgOiBTKysgLy8gXVxuICAgICAgLCBURVhUX0VTQ0FQRSAgICAgICAgICAgICAgICAgICAgICAgOiBTKysgLy8gXFwgc3R1ZmZcbiAgICAgICwgU1RSSU5HICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogUysrIC8vIFwiXCJcbiAgICAgICwgQkFDS1NMQVNIICAgICAgICAgICAgICAgICAgICAgICAgIDogUysrXG4gICAgICAsIEVORCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFMrKyAvLyBObyBtb3JlIHN0YWNrXG4gICAgICAsIE9QRU5fS0VZICAgICAgICAgICAgICAgICAgICAgICAgICA6IFMrKyAvLyAsIFwiYVwiXG4gICAgICAsIENMT1NFX0tFWSAgICAgICAgICAgICAgICAgICAgICAgICA6IFMrKyAvLyA6XG4gICAgICAsIFRSVUUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFMrKyAvLyByXG4gICAgICAsIFRSVUUyICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFMrKyAvLyB1XG4gICAgICAsIFRSVUUzICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFMrKyAvLyBlXG4gICAgICAsIEZBTFNFICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFMrKyAvLyBhXG4gICAgICAsIEZBTFNFMiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFMrKyAvLyBsXG4gICAgICAsIEZBTFNFMyAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFMrKyAvLyBzXG4gICAgICAsIEZBTFNFNCAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFMrKyAvLyBlXG4gICAgICAsIE5VTEwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFMrKyAvLyB1XG4gICAgICAsIE5VTEwyICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFMrKyAvLyBsXG4gICAgICAsIE5VTEwzICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFMrKyAvLyBsXG4gICAgICAsIE5VTUJFUl9ERUNJTUFMX1BPSU5UICAgICAgICAgICAgICA6IFMrKyAvLyAuXG4gICAgICAsIE5VTUJFUl9ESUdJVCAgICAgICAgICAgICAgICAgICAgICA6IFMrKyAvLyBbMC05XVxuICAgIH07XG5cbiAgZm9yICh2YXIgc18gaW4gY2xhcmluZXQuU1RBVEUpIGNsYXJpbmV0LlNUQVRFW2NsYXJpbmV0LlNUQVRFW3NfXV0gPSBzXztcblxuICAvLyBzd2l0Y2hhcm9vXG4gIFMgPSBjbGFyaW5ldC5TVEFURTtcblxuICBjb25zdCBDaGFyID0ge1xuICAgIHRhYiAgICAgICAgICAgICAgICAgOiAweDA5LCAgICAgLy8gXFx0XG4gICAgbGluZUZlZWQgICAgICAgICAgICA6IDB4MEEsICAgICAvLyBcXG5cbiAgICBjYXJyaWFnZVJldHVybiAgICAgIDogMHgwRCwgICAgIC8vIFxcclxuICAgIHNwYWNlICAgICAgICAgICAgICAgOiAweDIwLCAgICAgLy8gXCIgXCJcblxuICAgIGRvdWJsZVF1b3RlICAgICAgICAgOiAweDIyLCAgICAgLy8gXCJcbiAgICBwbHVzICAgICAgICAgICAgICAgIDogMHgyQiwgICAgIC8vICtcbiAgICBjb21tYSAgICAgICAgICAgICAgIDogMHgyQywgICAgIC8vICxcbiAgICBtaW51cyAgICAgICAgICAgICAgIDogMHgyRCwgICAgIC8vIC1cbiAgICBwZXJpb2QgICAgICAgICAgICAgIDogMHgyRSwgICAgIC8vIC5cblxuICAgIF8wICAgICAgICAgICAgICAgICAgOiAweDMwLCAgICAgLy8gMFxuICAgIF85ICAgICAgICAgICAgICAgICAgOiAweDM5LCAgICAgLy8gOVxuXG4gICAgY29sb24gICAgICAgICAgICAgICA6IDB4M0EsICAgICAvLyA6XG5cbiAgICBFICAgICAgICAgICAgICAgICAgIDogMHg0NSwgICAgIC8vIEVcblxuICAgIG9wZW5CcmFja2V0ICAgICAgICAgOiAweDVCLCAgICAgLy8gW1xuICAgIGJhY2tzbGFzaCAgICAgICAgICAgOiAweDVDLCAgICAgLy8gXFxcbiAgICBjbG9zZUJyYWNrZXQgICAgICAgIDogMHg1RCwgICAgIC8vIF1cblxuICAgIGEgICAgICAgICAgICAgICAgICAgOiAweDYxLCAgICAgLy8gYVxuICAgIGIgICAgICAgICAgICAgICAgICAgOiAweDYyLCAgICAgLy8gYlxuICAgIGUgICAgICAgICAgICAgICAgICAgOiAweDY1LCAgICAgLy8gZVxuICAgIGYgICAgICAgICAgICAgICAgICAgOiAweDY2LCAgICAgLy8gZlxuICAgIGwgICAgICAgICAgICAgICAgICAgOiAweDZDLCAgICAgLy8gbFxuICAgIG4gICAgICAgICAgICAgICAgICAgOiAweDZFLCAgICAgLy8gblxuICAgIHIgICAgICAgICAgICAgICAgICAgOiAweDcyLCAgICAgLy8gclxuICAgIHMgICAgICAgICAgICAgICAgICAgOiAweDczLCAgICAgLy8gc1xuICAgIHQgICAgICAgICAgICAgICAgICAgOiAweDc0LCAgICAgLy8gdFxuICAgIHUgICAgICAgICAgICAgICAgICAgOiAweDc1LCAgICAgLy8gdVxuXG4gICAgb3BlbkJyYWNlICAgICAgICAgICA6IDB4N0IsICAgICAvLyB7XG4gICAgY2xvc2VCcmFjZSAgICAgICAgICA6IDB4N0QsICAgICAvLyB9XG4gIH1cblxuICBpZiAoIU9iamVjdC5jcmVhdGUpIHtcbiAgICBPYmplY3QuY3JlYXRlID0gZnVuY3Rpb24gKG8pIHtcbiAgICAgIGZ1bmN0aW9uIGYgKCkgeyB0aGlzW1wiX19wcm90b19fXCJdID0gbzsgfVxuICAgICAgZi5wcm90b3R5cGUgPSBvO1xuICAgICAgcmV0dXJuIG5ldyBmO1xuICAgIH07XG4gIH1cblxuICBpZiAoIU9iamVjdC5nZXRQcm90b3R5cGVPZikge1xuICAgIE9iamVjdC5nZXRQcm90b3R5cGVPZiA9IGZ1bmN0aW9uIChvKSB7XG4gICAgICByZXR1cm4gb1tcIl9fcHJvdG9fX1wiXTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKCFPYmplY3Qua2V5cykge1xuICAgIE9iamVjdC5rZXlzID0gZnVuY3Rpb24gKG8pIHtcbiAgICAgIHZhciBhID0gW107XG4gICAgICBmb3IgKHZhciBpIGluIG8pIGlmIChvLmhhc093blByb3BlcnR5KGkpKSBhLnB1c2goaSk7XG4gICAgICByZXR1cm4gYTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tCdWZmZXJMZW5ndGggKHBhcnNlcikge1xuICAgIHZhciBtYXhBbGxvd2VkID0gTWF0aC5tYXgoY2xhcmluZXQuTUFYX0JVRkZFUl9MRU5HVEgsIDEwKVxuICAgICAgLCBtYXhBY3R1YWwgPSAwXG4gICAgO1xuICAgIGZvciAodmFyIGJ1ZmZlciBpbiBidWZmZXJzKSB7XG4gICAgICB2YXIgbGVuID0gcGFyc2VyW2J1ZmZlcl0gPT09IHVuZGVmaW5lZCA/IDAgOiBwYXJzZXJbYnVmZmVyXS5sZW5ndGg7XG4gICAgICBpZiAobGVuID4gbWF4QWxsb3dlZCkge1xuICAgICAgICBzd2l0Y2ggKGJ1ZmZlcikge1xuICAgICAgICAgIGNhc2UgXCJ0ZXh0XCI6XG4gICAgICAgICAgICBjbG9zZVRleHQocGFyc2VyKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGVycm9yKHBhcnNlciwgXCJNYXggYnVmZmVyIGxlbmd0aCBleGNlZWRlZDogXCIrIGJ1ZmZlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG1heEFjdHVhbCA9IE1hdGgubWF4KG1heEFjdHVhbCwgbGVuKTtcbiAgICB9XG4gICAgcGFyc2VyLmJ1ZmZlckNoZWNrUG9zaXRpb24gPSAoY2xhcmluZXQuTUFYX0JVRkZFUl9MRU5HVEggLSBtYXhBY3R1YWwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIHBhcnNlci5wb3NpdGlvbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFyQnVmZmVycyAocGFyc2VyKSB7XG4gICAgZm9yICh2YXIgYnVmZmVyIGluIGJ1ZmZlcnMpIHtcbiAgICAgIHBhcnNlcltidWZmZXJdID0gYnVmZmVyc1tidWZmZXJdO1xuICAgIH1cbiAgfVxuXG4gIHZhciBzdHJpbmdUb2tlblBhdHRlcm4gPSAvW1xcXFxcIlxcbl0vZztcblxuICBmdW5jdGlvbiBDUGFyc2VyIChvcHQpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQ1BhcnNlcikpIHJldHVybiBuZXcgQ1BhcnNlciAob3B0KTtcblxuICAgIHZhciBwYXJzZXIgPSB0aGlzO1xuICAgIGNsZWFyQnVmZmVycyhwYXJzZXIpO1xuICAgIHBhcnNlci5idWZmZXJDaGVja1Bvc2l0aW9uID0gY2xhcmluZXQuTUFYX0JVRkZFUl9MRU5HVEg7XG4gICAgcGFyc2VyLnEgICAgICAgID0gcGFyc2VyLmMgPSBwYXJzZXIucCA9IFwiXCI7XG4gICAgcGFyc2VyLm9wdCAgICAgID0gb3B0IHx8IHt9O1xuICAgIHBhcnNlci5jbG9zZWQgICA9IHBhcnNlci5jbG9zZWRSb290ID0gcGFyc2VyLnNhd1Jvb3QgPSBmYWxzZTtcbiAgICBwYXJzZXIudGFnICAgICAgPSBwYXJzZXIuZXJyb3IgPSBudWxsO1xuICAgIHBhcnNlci5zdGF0ZSAgICA9IFMuQkVHSU47XG4gICAgcGFyc2VyLnN0YWNrICAgID0gbmV3IEFycmF5KCk7XG4gICAgLy8gbW9zdGx5IGp1c3QgZm9yIGVycm9yIHJlcG9ydGluZ1xuICAgIHBhcnNlci5wb3NpdGlvbiA9IHBhcnNlci5jb2x1bW4gPSAwO1xuICAgIHBhcnNlci5saW5lICAgICA9IDE7XG4gICAgcGFyc2VyLnNsYXNoZWQgID0gZmFsc2U7XG4gICAgcGFyc2VyLnVuaWNvZGVJID0gMDtcbiAgICBwYXJzZXIudW5pY29kZVMgPSBudWxsO1xuICAgIHBhcnNlci5kZXB0aCAgICA9IDA7XG4gICAgZW1pdChwYXJzZXIsIFwib25yZWFkeVwiKTtcbiAgfVxuXG4gIENQYXJzZXIucHJvdG90eXBlID1cbiAgICB7IGVuZCAgICA6IGZ1bmN0aW9uICgpIHsgZW5kKHRoaXMpOyB9XG4gICAgICAsIHdyaXRlICA6IHdyaXRlXG4gICAgICAsIHJlc3VtZSA6IGZ1bmN0aW9uICgpIHsgdGhpcy5lcnJvciA9IG51bGw7IHJldHVybiB0aGlzOyB9XG4gICAgICAsIGNsb3NlICA6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMud3JpdGUobnVsbCk7IH1cbiAgICB9O1xuXG4gIHRyeSAgICAgICAgeyBTdHJlYW0gPSByZXF1aXJlKFwic3RyZWFtXCIpLlN0cmVhbTsgfVxuICBjYXRjaCAoZXgpIHsgU3RyZWFtID0gZnVuY3Rpb24gKCkge307IH1cblxuICBmdW5jdGlvbiBjcmVhdGVTdHJlYW0gKG9wdCkgeyByZXR1cm4gbmV3IENTdHJlYW0ob3B0KTsgfVxuXG4gIGZ1bmN0aW9uIENTdHJlYW0gKG9wdCkge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBDU3RyZWFtKSkgcmV0dXJuIG5ldyBDU3RyZWFtKG9wdCk7XG5cbiAgICB0aGlzLl9wYXJzZXIgPSBuZXcgQ1BhcnNlcihvcHQpO1xuICAgIHRoaXMud3JpdGFibGUgPSB0cnVlO1xuICAgIHRoaXMucmVhZGFibGUgPSB0cnVlO1xuXG4gICAgLy92YXIgQnVmZmVyID0gdGhpcy5CdWZmZXIgfHwgZnVuY3Rpb24gQnVmZmVyICgpIHt9OyAvLyBpZiB3ZSBkb24ndCBoYXZlIEJ1ZmZlcnMsIGZha2UgaXQgc28gd2UgY2FuIGRvIGB2YXIgaW5zdGFuY2VvZiBCdWZmZXJgIGFuZCBub3QgdGhyb3cgYW4gZXJyb3JcbiAgICB0aGlzLmJ5dGVzX3JlbWFpbmluZyA9IDA7IC8vIG51bWJlciBvZiBieXRlcyByZW1haW5pbmcgaW4gbXVsdGkgYnl0ZSB1dGY4IGNoYXIgdG8gcmVhZCBhZnRlciBzcGxpdCBib3VuZGFyeVxuICAgIHRoaXMuYnl0ZXNfaW5fc2VxdWVuY2UgPSAwOyAvLyBieXRlcyBpbiBtdWx0aSBieXRlIHV0ZjggY2hhciB0byByZWFkXG4gICAgdGhpcy50ZW1wX2J1ZmZzID0geyBcIjJcIjogbmV3IEJ1ZmZlcigyKSwgXCIzXCI6IG5ldyBCdWZmZXIoMyksIFwiNFwiOiBuZXcgQnVmZmVyKDQpIH07IC8vIGZvciByZWJ1aWxkaW5nIGNoYXJzIHNwbGl0IGJlZm9yZSBib3VuZGFyeSBpcyByZWFjaGVkXG4gICAgdGhpcy5zdHJpbmcgPSAnJztcblxuICAgIHZhciBtZSA9IHRoaXM7XG4gICAgU3RyZWFtLmFwcGx5KG1lKTtcblxuICAgIHRoaXMuX3BhcnNlci5vbmVuZCA9IGZ1bmN0aW9uICgpIHsgbWUuZW1pdChcImVuZFwiKTsgfTtcbiAgICB0aGlzLl9wYXJzZXIub25lcnJvciA9IGZ1bmN0aW9uIChlcikge1xuICAgICAgbWUuZW1pdChcImVycm9yXCIsIGVyKTtcbiAgICAgIG1lLl9wYXJzZXIuZXJyb3IgPSBudWxsO1xuICAgIH07XG5cbiAgICBzdHJlYW1XcmFwcy5mb3JFYWNoKGZ1bmN0aW9uIChldikge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG1lLCBcIm9uXCIgKyBldixcbiAgICAgICAgeyBnZXQgICAgICAgICAgOiBmdW5jdGlvbiAoKSB7IHJldHVybiBtZS5fcGFyc2VyW1wib25cIiArIGV2XTsgfVxuICAgICAgICAgICwgc2V0ICAgICAgICAgIDogZnVuY3Rpb24gKGgpIHtcbiAgICAgICAgICAgIGlmICghaCkge1xuICAgICAgICAgICAgICBtZS5yZW1vdmVBbGxMaXN0ZW5lcnMoZXYpO1xuICAgICAgICAgICAgICBtZS5fcGFyc2VyW1wib25cIitldl0gPSBoO1xuICAgICAgICAgICAgICByZXR1cm4gaDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1lLm9uKGV2LCBoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLCBlbnVtZXJhYmxlICAgOiB0cnVlXG4gICAgICAgICAgLCBjb25maWd1cmFibGUgOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIENTdHJlYW0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShTdHJlYW0ucHJvdG90eXBlLFxuICAgIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IENTdHJlYW0gfSB9KTtcblxuICBDU3RyZWFtLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgZGF0YSA9IG5ldyBCdWZmZXIoZGF0YSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbiA9IGRhdGFbaV07XG5cbiAgICAgIC8vIGNoZWNrIGZvciBjYXJyeSBvdmVyIG9mIGEgbXVsdGkgYnl0ZSBjaGFyIHNwbGl0IGJldHdlZW4gZGF0YSBjaHVua3NcbiAgICAgIC8vICYgZmlsbCB0ZW1wIGJ1ZmZlciBpdCB3aXRoIHN0YXJ0IG9mIHRoaXMgZGF0YSBjaHVuayB1cCB0byB0aGUgYm91bmRhcnkgbGltaXQgc2V0IGluIHRoZSBsYXN0IGl0ZXJhdGlvblxuICAgICAgaWYgKHRoaXMuYnl0ZXNfcmVtYWluaW5nID4gMCkge1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMuYnl0ZXNfcmVtYWluaW5nOyBqKyspIHtcbiAgICAgICAgICB0aGlzLnRlbXBfYnVmZnNbdGhpcy5ieXRlc19pbl9zZXF1ZW5jZV1bdGhpcy5ieXRlc19pbl9zZXF1ZW5jZSAtIHRoaXMuYnl0ZXNfcmVtYWluaW5nICsgal0gPSBkYXRhW2pdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3RyaW5nID0gdGhpcy50ZW1wX2J1ZmZzW3RoaXMuYnl0ZXNfaW5fc2VxdWVuY2VdLnRvU3RyaW5nKCk7XG4gICAgICAgIHRoaXMuYnl0ZXNfaW5fc2VxdWVuY2UgPSB0aGlzLmJ5dGVzX3JlbWFpbmluZyA9IDA7XG5cbiAgICAgICAgLy8gbW92ZSBpdGVyYXRvciBmb3J3YXJkIGJ5IG51bWJlciBvZiBieXRlIHJlYWQgZHVyaW5nIHNlcXVlbmNpbmdcbiAgICAgICAgaSA9IGkgKyBqIC0gMTtcblxuICAgICAgICAvLyBwYXNzIGRhdGEgdG8gcGFyc2VyIGFuZCBtb3ZlIGZvcndhcmQgdG8gcGFyc2UgcmVzdCBvZiBkYXRhXG4gICAgICAgIHRoaXMuX3BhcnNlci53cml0ZSh0aGlzLnN0cmluZyk7XG4gICAgICAgIHRoaXMuZW1pdChcImRhdGFcIiwgdGhpcy5zdHJpbmcpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gaWYgbm8gcmVtYWluZGVyIGJ5dGVzIGNhcnJpZWQgb3ZlciwgcGFyc2UgbXVsdGkgYnl0ZSAoPj0xMjgpIGNoYXJzIG9uZSBhdCBhIHRpbWVcbiAgICAgIGlmICh0aGlzLmJ5dGVzX3JlbWFpbmluZyA9PT0gMCAmJiBuID49IDEyOCkge1xuICAgICAgICBpZiAoKG4gPj0gMTk0KSAmJiAobiA8PSAyMjMpKSB0aGlzLmJ5dGVzX2luX3NlcXVlbmNlID0gMjtcbiAgICAgICAgaWYgKChuID49IDIyNCkgJiYgKG4gPD0gMjM5KSkgdGhpcy5ieXRlc19pbl9zZXF1ZW5jZSA9IDM7XG4gICAgICAgIGlmICgobiA+PSAyNDApICYmIChuIDw9IDI0NCkpIHRoaXMuYnl0ZXNfaW5fc2VxdWVuY2UgPSA0O1xuICAgICAgICBpZiAoKHRoaXMuYnl0ZXNfaW5fc2VxdWVuY2UgKyBpKSA+IGRhdGEubGVuZ3RoKSB7IC8vIGlmIGJ5dGVzIG5lZWRlZCB0byBjb21wbGV0ZSBjaGFyIGZhbGwgb3V0c2lkZSBkYXRhIGxlbmd0aCwgd2UgaGF2ZSBhIGJvdW5kYXJ5IHNwbGl0XG5cbiAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8PSAoZGF0YS5sZW5ndGggLSAxIC0gaSk7IGsrKykge1xuICAgICAgICAgICAgdGhpcy50ZW1wX2J1ZmZzW3RoaXMuYnl0ZXNfaW5fc2VxdWVuY2VdW2tdID0gZGF0YVtpICsga107IC8vIGZpbGwgdGVtcCBkYXRhIG9mIGNvcnJlY3Qgc2l6ZSB3aXRoIGJ5dGVzIGF2YWlsYWJsZSBpbiB0aGlzIGNodW5rXG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuYnl0ZXNfcmVtYWluaW5nID0gKGkgKyB0aGlzLmJ5dGVzX2luX3NlcXVlbmNlKSAtIGRhdGEubGVuZ3RoO1xuXG4gICAgICAgICAgLy8gaW1tZWRpYXRlbHkgcmV0dXJuIGFzIHdlIG5lZWQgYW5vdGhlciBjaHVuayB0byBzZXF1ZW5jZSB0aGUgY2hhcmFjdGVyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zdHJpbmcgPSBkYXRhLnNsaWNlKGksIChpICsgdGhpcy5ieXRlc19pbl9zZXF1ZW5jZSkpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgaSA9IGkgKyB0aGlzLmJ5dGVzX2luX3NlcXVlbmNlIC0gMTtcblxuICAgICAgICAgIHRoaXMuX3BhcnNlci53cml0ZSh0aGlzLnN0cmluZyk7XG4gICAgICAgICAgdGhpcy5lbWl0KFwiZGF0YVwiLCB0aGlzLnN0cmluZyk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gaXMgdGhlcmUgYSByYW5nZSBvZiBjaGFyYWN0ZXJzIHRoYXQgYXJlIGltbWVkaWF0ZWx5IHBhcnNhYmxlP1xuICAgICAgZm9yICh2YXIgcCA9IGk7IHAgPCBkYXRhLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgIGlmIChkYXRhW3BdID49IDEyOCkgYnJlYWs7XG4gICAgICB9XG4gICAgICB0aGlzLnN0cmluZyA9IGRhdGEuc2xpY2UoaSwgcCkudG9TdHJpbmcoKTtcbiAgICAgIHRoaXMuX3BhcnNlci53cml0ZSh0aGlzLnN0cmluZyk7XG4gICAgICB0aGlzLmVtaXQoXCJkYXRhXCIsIHRoaXMuc3RyaW5nKTtcbiAgICAgIGkgPSBwIC0gMTtcblxuICAgICAgLy8gaGFuZGxlIGFueSByZW1haW5pbmcgY2hhcmFjdGVycyB1c2luZyBtdWx0aWJ5dGUgbG9naWNcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgfTtcblxuICBDU3RyZWFtLnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbiAoY2h1bmspIHtcbiAgICBpZiAoY2h1bmsgJiYgY2h1bmsubGVuZ3RoKSB0aGlzLl9wYXJzZXIud3JpdGUoY2h1bmsudG9TdHJpbmcoKSk7XG4gICAgdGhpcy5fcGFyc2VyLmVuZCgpO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIENTdHJlYW0ucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2LCBoYW5kbGVyKSB7XG4gICAgdmFyIG1lID0gdGhpcztcbiAgICBpZiAoIW1lLl9wYXJzZXJbXCJvblwiK2V2XSAmJiBzdHJlYW1XcmFwcy5pbmRleE9mKGV2KSAhPT0gLTEpIHtcbiAgICAgIG1lLl9wYXJzZXJbXCJvblwiK2V2XSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMubGVuZ3RoID09PSAxID8gW2FyZ3VtZW50c1swXV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogQXJyYXkuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgYXJncy5zcGxpY2UoMCwgMCwgZXYpO1xuICAgICAgICBtZS5lbWl0LmFwcGx5KG1lLCBhcmdzKTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBTdHJlYW0ucHJvdG90eXBlLm9uLmNhbGwobWUsIGV2LCBoYW5kbGVyKTtcbiAgfTtcblxuICBDU3RyZWFtLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgIGNsZWFyQnVmZmVycyh0aGlzLl9wYXJzZXIpO1xuICAgIHRoaXMuZW1pdChcImNsb3NlXCIpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGVtaXQocGFyc2VyLCBldmVudCwgZGF0YSkge1xuICAgIGlmKGNsYXJpbmV0LklORk8pIGNvbnNvbGUubG9nKCctLSBlbWl0JywgZXZlbnQsIGRhdGEpO1xuICAgIGlmIChwYXJzZXJbZXZlbnRdKSBwYXJzZXJbZXZlbnRdKGRhdGEpO1xuICB9XG5cbiAgZnVuY3Rpb24gZW1pdE5vZGUocGFyc2VyLCBldmVudCwgZGF0YSkge1xuICAgIGNsb3NlVmFsdWUocGFyc2VyKTtcbiAgICBlbWl0KHBhcnNlciwgZXZlbnQsIGRhdGEpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2VWYWx1ZShwYXJzZXIsIGV2ZW50KSB7XG4gICAgcGFyc2VyLnRleHROb2RlID0gdGV4dG9wdHMocGFyc2VyLm9wdCwgcGFyc2VyLnRleHROb2RlKTtcbiAgICBpZiAocGFyc2VyLnRleHROb2RlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGVtaXQocGFyc2VyLCAoZXZlbnQgPyBldmVudCA6IFwib252YWx1ZVwiKSwgcGFyc2VyLnRleHROb2RlKTtcbiAgICB9XG4gICAgcGFyc2VyLnRleHROb2RlID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2VOdW1iZXIocGFyc2VyKSB7XG4gICAgaWYgKHBhcnNlci5udW1iZXJOb2RlKVxuICAgICAgZW1pdChwYXJzZXIsIFwib252YWx1ZVwiLCBwYXJzZUZsb2F0KHBhcnNlci5udW1iZXJOb2RlKSk7XG4gICAgcGFyc2VyLm51bWJlck5vZGUgPSBcIlwiO1xuICB9XG5cbiAgZnVuY3Rpb24gdGV4dG9wdHMgKG9wdCwgdGV4dCkge1xuICAgIGlmICh0ZXh0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgICBpZiAob3B0LnRyaW0pIHRleHQgPSB0ZXh0LnRyaW0oKTtcbiAgICBpZiAob3B0Lm5vcm1hbGl6ZSkgdGV4dCA9IHRleHQucmVwbGFjZSgvXFxzKy9nLCBcIiBcIik7XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cblxuICBmdW5jdGlvbiBlcnJvciAocGFyc2VyLCBlcikge1xuICAgIGNsb3NlVmFsdWUocGFyc2VyKTtcbiAgICBlciArPSBcIlxcbkxpbmU6IFwiK3BhcnNlci5saW5lK1xuICAgICAgICAgIFwiXFxuQ29sdW1uOiBcIitwYXJzZXIuY29sdW1uK1xuICAgICAgICAgIFwiXFxuQ2hhcjogXCIrcGFyc2VyLmM7XG4gICAgZXIgPSBuZXcgRXJyb3IoZXIpO1xuICAgIHBhcnNlci5lcnJvciA9IGVyO1xuICAgIGVtaXQocGFyc2VyLCBcIm9uZXJyb3JcIiwgZXIpO1xuICAgIHJldHVybiBwYXJzZXI7XG4gIH1cblxuICBmdW5jdGlvbiBlbmQocGFyc2VyKSB7XG4gICAgaWYgKHBhcnNlci5zdGF0ZSAhPT0gUy5WQUxVRSB8fCBwYXJzZXIuZGVwdGggIT09IDApXG4gICAgICBlcnJvcihwYXJzZXIsIFwiVW5leHBlY3RlZCBlbmRcIik7XG5cbiAgICBjbG9zZVZhbHVlKHBhcnNlcik7XG4gICAgcGFyc2VyLmMgICAgICA9IFwiXCI7XG4gICAgcGFyc2VyLmNsb3NlZCA9IHRydWU7XG4gICAgZW1pdChwYXJzZXIsIFwib25lbmRcIik7XG4gICAgQ1BhcnNlci5jYWxsKHBhcnNlciwgcGFyc2VyLm9wdCk7XG4gICAgcmV0dXJuIHBhcnNlcjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzV2hpdGVzcGFjZShjKSB7XG4gICAgcmV0dXJuIGMgPT09IENoYXIuY2FycmlhZ2VSZXR1cm4gfHwgYyA9PT0gQ2hhci5saW5lRmVlZCB8fCBjID09PSBDaGFyLnNwYWNlIHx8IGMgPT09IENoYXIudGFiO1xuICB9XG5cbiAgZnVuY3Rpb24gd3JpdGUgKGNodW5rKSB7XG4gICAgdmFyIHBhcnNlciA9IHRoaXM7XG4gICAgaWYgKHRoaXMuZXJyb3IpIHRocm93IHRoaXMuZXJyb3I7XG4gICAgaWYgKHBhcnNlci5jbG9zZWQpIHJldHVybiBlcnJvcihwYXJzZXIsXG4gICAgICBcIkNhbm5vdCB3cml0ZSBhZnRlciBjbG9zZS4gQXNzaWduIGFuIG9ucmVhZHkgaGFuZGxlci5cIik7XG4gICAgaWYgKGNodW5rID09PSBudWxsKSByZXR1cm4gZW5kKHBhcnNlcik7XG4gICAgdmFyIGkgPSAwLCBjID0gY2h1bmsuY2hhckNvZGVBdCgwKSwgcCA9IHBhcnNlci5wO1xuICAgIGlmIChjbGFyaW5ldC5ERUJVRykgY29uc29sZS5sb2coJ3dyaXRlIC0+IFsnICsgY2h1bmsgKyAnXScpO1xuICAgIHdoaWxlIChjKSB7XG4gICAgICBwID0gYztcbiAgICAgIHBhcnNlci5jID0gYyA9IGNodW5rLmNoYXJDb2RlQXQoaSsrKTtcbiAgICAgIC8vIGlmIGNodW5rIGRvZXNudCBoYXZlIG5leHQsIGxpa2Ugc3RyZWFtaW5nIGNoYXIgYnkgY2hhclxuICAgICAgLy8gdGhpcyB3YXkgd2UgbmVlZCB0byBjaGVjayBpZiBwcmV2aW91cyBpcyByZWFsbHkgcHJldmlvdXNcbiAgICAgIC8vIGlmIG5vdCB3ZSBuZWVkIHRvIHJlc2V0IHRvIHdoYXQgdGhlIHBhcnNlciBzYXlzIGlzIHRoZSBwcmV2aW91c1xuICAgICAgLy8gZnJvbSBidWZmZXJcbiAgICAgIGlmKHAgIT09IGMgKSBwYXJzZXIucCA9IHA7XG4gICAgICBlbHNlIHAgPSBwYXJzZXIucDtcblxuICAgICAgaWYoIWMpIGJyZWFrO1xuXG4gICAgICBpZiAoY2xhcmluZXQuREVCVUcpIGNvbnNvbGUubG9nKGksYyxjbGFyaW5ldC5TVEFURVtwYXJzZXIuc3RhdGVdKTtcbiAgICAgIHBhcnNlci5wb3NpdGlvbiArKztcbiAgICAgIGlmIChjID09PSBDaGFyLmxpbmVGZWVkKSB7XG4gICAgICAgIHBhcnNlci5saW5lICsrO1xuICAgICAgICBwYXJzZXIuY29sdW1uID0gMDtcbiAgICAgIH0gZWxzZSBwYXJzZXIuY29sdW1uICsrO1xuICAgICAgc3dpdGNoIChwYXJzZXIuc3RhdGUpIHtcblxuICAgICAgICBjYXNlIFMuQkVHSU46XG4gICAgICAgICAgaWYgKGMgPT09IENoYXIub3BlbkJyYWNlKSBwYXJzZXIuc3RhdGUgPSBTLk9QRU5fT0JKRUNUO1xuICAgICAgICAgIGVsc2UgaWYgKGMgPT09IENoYXIub3BlbkJyYWNrZXQpIHBhcnNlci5zdGF0ZSA9IFMuT1BFTl9BUlJBWTtcbiAgICAgICAgICBlbHNlIGlmICghaXNXaGl0ZXNwYWNlKGMpKVxuICAgICAgICAgICAgZXJyb3IocGFyc2VyLCBcIk5vbi13aGl0ZXNwYWNlIGJlZm9yZSB7Wy5cIik7XG4gICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgY2FzZSBTLk9QRU5fS0VZOlxuICAgICAgICBjYXNlIFMuT1BFTl9PQkpFQ1Q6XG4gICAgICAgICAgaWYgKGlzV2hpdGVzcGFjZShjKSkgY29udGludWU7XG4gICAgICAgICAgaWYocGFyc2VyLnN0YXRlID09PSBTLk9QRU5fS0VZKSBwYXJzZXIuc3RhY2sucHVzaChTLkNMT1NFX0tFWSk7XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZihjID09PSBDaGFyLmNsb3NlQnJhY2UpIHtcbiAgICAgICAgICAgICAgZW1pdChwYXJzZXIsICdvbm9wZW5vYmplY3QnKTtcbiAgICAgICAgICAgICAgdGhpcy5kZXB0aCsrO1xuICAgICAgICAgICAgICBlbWl0KHBhcnNlciwgJ29uY2xvc2VvYmplY3QnKTtcbiAgICAgICAgICAgICAgdGhpcy5kZXB0aC0tO1xuICAgICAgICAgICAgICBwYXJzZXIuc3RhdGUgPSBwYXJzZXIuc3RhY2sucG9wKCkgfHwgUy5WQUxVRTtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9IGVsc2UgIHBhcnNlci5zdGFjay5wdXNoKFMuQ0xPU0VfT0JKRUNUKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYoYyA9PT0gQ2hhci5kb3VibGVRdW90ZSkgcGFyc2VyLnN0YXRlID0gUy5TVFJJTkc7XG4gICAgICAgICAgZWxzZSBlcnJvcihwYXJzZXIsIFwiTWFsZm9ybWVkIG9iamVjdCBrZXkgc2hvdWxkIHN0YXJ0IHdpdGggXFxcIlwiKTtcbiAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICBjYXNlIFMuQ0xPU0VfS0VZOlxuICAgICAgICBjYXNlIFMuQ0xPU0VfT0JKRUNUOlxuICAgICAgICAgIGlmIChpc1doaXRlc3BhY2UoYykpIGNvbnRpbnVlO1xuICAgICAgICAgIHZhciBldmVudCA9IChwYXJzZXIuc3RhdGUgPT09IFMuQ0xPU0VfS0VZKSA/ICdrZXknIDogJ29iamVjdCc7XG4gICAgICAgICAgaWYoYyA9PT0gQ2hhci5jb2xvbikge1xuICAgICAgICAgICAgaWYocGFyc2VyLnN0YXRlID09PSBTLkNMT1NFX09CSkVDVCkge1xuICAgICAgICAgICAgICBwYXJzZXIuc3RhY2sucHVzaChTLkNMT1NFX09CSkVDVCk7XG4gICAgICAgICAgICAgIGNsb3NlVmFsdWUocGFyc2VyLCAnb25vcGVub2JqZWN0Jyk7XG4gICAgICAgICAgICAgIHRoaXMuZGVwdGgrKztcbiAgICAgICAgICAgIH0gZWxzZSBjbG9zZVZhbHVlKHBhcnNlciwgJ29ua2V5Jyk7XG4gICAgICAgICAgICBwYXJzZXIuc3RhdGUgID0gUy5WQUxVRTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGMgPT09IENoYXIuY2xvc2VCcmFjZSkge1xuICAgICAgICAgICAgZW1pdE5vZGUocGFyc2VyLCAnb25jbG9zZW9iamVjdCcpO1xuICAgICAgICAgICAgdGhpcy5kZXB0aC0tO1xuICAgICAgICAgICAgcGFyc2VyLnN0YXRlID0gcGFyc2VyLnN0YWNrLnBvcCgpIHx8IFMuVkFMVUU7XG4gICAgICAgICAgfSBlbHNlIGlmKGMgPT09IENoYXIuY29tbWEpIHtcbiAgICAgICAgICAgIGlmKHBhcnNlci5zdGF0ZSA9PT0gUy5DTE9TRV9PQkpFQ1QpXG4gICAgICAgICAgICAgIHBhcnNlci5zdGFjay5wdXNoKFMuQ0xPU0VfT0JKRUNUKTtcbiAgICAgICAgICAgIGNsb3NlVmFsdWUocGFyc2VyKTtcbiAgICAgICAgICAgIHBhcnNlci5zdGF0ZSAgPSBTLk9QRU5fS0VZO1xuICAgICAgICAgIH0gZWxzZSBlcnJvcihwYXJzZXIsICdCYWQgb2JqZWN0Jyk7XG4gICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgY2FzZSBTLk9QRU5fQVJSQVk6IC8vIGFmdGVyIGFuIGFycmF5IHRoZXJlIGFsd2F5cyBhIHZhbHVlXG4gICAgICAgIGNhc2UgUy5WQUxVRTpcbiAgICAgICAgICBpZiAoaXNXaGl0ZXNwYWNlKGMpKSBjb250aW51ZTtcbiAgICAgICAgICBpZihwYXJzZXIuc3RhdGU9PT1TLk9QRU5fQVJSQVkpIHtcbiAgICAgICAgICAgIGVtaXQocGFyc2VyLCAnb25vcGVuYXJyYXknKTtcbiAgICAgICAgICAgIHRoaXMuZGVwdGgrKztcbiAgICAgICAgICAgIHBhcnNlci5zdGF0ZSA9IFMuVkFMVUU7XG4gICAgICAgICAgICBpZihjID09PSBDaGFyLmNsb3NlQnJhY2tldCkge1xuICAgICAgICAgICAgICBlbWl0KHBhcnNlciwgJ29uY2xvc2VhcnJheScpO1xuICAgICAgICAgICAgICB0aGlzLmRlcHRoLS07XG4gICAgICAgICAgICAgIHBhcnNlci5zdGF0ZSA9IHBhcnNlci5zdGFjay5wb3AoKSB8fCBTLlZBTFVFO1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHBhcnNlci5zdGFjay5wdXNoKFMuQ0xPU0VfQVJSQVkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZihjID09PSBDaGFyLmRvdWJsZVF1b3RlKSBwYXJzZXIuc3RhdGUgPSBTLlNUUklORztcbiAgICAgICAgICBlbHNlIGlmKGMgPT09IENoYXIub3BlbkJyYWNlKSBwYXJzZXIuc3RhdGUgPSBTLk9QRU5fT0JKRUNUO1xuICAgICAgICAgIGVsc2UgaWYoYyA9PT0gQ2hhci5vcGVuQnJhY2tldCkgcGFyc2VyLnN0YXRlID0gUy5PUEVOX0FSUkFZO1xuICAgICAgICAgIGVsc2UgaWYoYyA9PT0gQ2hhci50KSBwYXJzZXIuc3RhdGUgPSBTLlRSVUU7XG4gICAgICAgICAgZWxzZSBpZihjID09PSBDaGFyLmYpIHBhcnNlci5zdGF0ZSA9IFMuRkFMU0U7XG4gICAgICAgICAgZWxzZSBpZihjID09PSBDaGFyLm4pIHBhcnNlci5zdGF0ZSA9IFMuTlVMTDtcbiAgICAgICAgICBlbHNlIGlmKGMgPT09IENoYXIubWludXMpIHsgLy8ga2VlcCBhbmQgY29udGludWVcbiAgICAgICAgICAgIHBhcnNlci5udW1iZXJOb2RlICs9IFwiLVwiO1xuICAgICAgICAgIH0gZWxzZSBpZihDaGFyLl8wIDw9IGMgJiYgYyA8PSBDaGFyLl85KSB7XG4gICAgICAgICAgICBwYXJzZXIubnVtYmVyTm9kZSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGMpO1xuICAgICAgICAgICAgcGFyc2VyLnN0YXRlID0gUy5OVU1CRVJfRElHSVQ7XG4gICAgICAgICAgfSBlbHNlICAgICAgICAgICAgICAgZXJyb3IocGFyc2VyLCBcIkJhZCB2YWx1ZVwiKTtcbiAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICBjYXNlIFMuQ0xPU0VfQVJSQVk6XG4gICAgICAgICAgaWYoYyA9PT0gQ2hhci5jb21tYSkge1xuICAgICAgICAgICAgcGFyc2VyLnN0YWNrLnB1c2goUy5DTE9TRV9BUlJBWSk7XG4gICAgICAgICAgICBjbG9zZVZhbHVlKHBhcnNlciwgJ29udmFsdWUnKTtcbiAgICAgICAgICAgIHBhcnNlci5zdGF0ZSAgPSBTLlZBTFVFO1xuICAgICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gQ2hhci5jbG9zZUJyYWNrZXQpIHtcbiAgICAgICAgICAgIGVtaXROb2RlKHBhcnNlciwgJ29uY2xvc2VhcnJheScpO1xuICAgICAgICAgICAgdGhpcy5kZXB0aC0tO1xuICAgICAgICAgICAgcGFyc2VyLnN0YXRlID0gcGFyc2VyLnN0YWNrLnBvcCgpIHx8IFMuVkFMVUU7XG4gICAgICAgICAgfSBlbHNlIGlmIChpc1doaXRlc3BhY2UoYykpXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICBlbHNlIGVycm9yKHBhcnNlciwgJ0JhZCBhcnJheScpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgIGNhc2UgUy5TVFJJTkc6XG4gICAgICAgICAgaWYgKHBhcnNlci50ZXh0Tm9kZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBwYXJzZXIudGV4dE5vZGUgPSBcIlwiO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIHRoYW5rcyB0aGVqaCwgdGhpcyBpcyBhbiBhYm91dCA1MCUgcGVyZm9ybWFuY2UgaW1wcm92ZW1lbnQuXG4gICAgICAgICAgdmFyIHN0YXJ0aSAgICAgICAgICAgICAgPSBpLTFcbiAgICAgICAgICAgICwgc2xhc2hlZCA9IHBhcnNlci5zbGFzaGVkXG4gICAgICAgICAgICAsIHVuaWNvZGVJID0gcGFyc2VyLnVuaWNvZGVJXG4gICAgICAgICAgO1xuICAgICAgICAgIFNUUklOR19CSUdMT09QOiB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgaWYgKGNsYXJpbmV0LkRFQlVHKVxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhpLGMsY2xhcmluZXQuU1RBVEVbcGFyc2VyLnN0YXRlXVxuICAgICAgICAgICAgICAgICxzbGFzaGVkKTtcbiAgICAgICAgICAgIC8vIHplcm8gbWVhbnMgXCJubyB1bmljb2RlIGFjdGl2ZVwiLiAxLTQgbWVhbiBcInBhcnNlIHNvbWUgbW9yZVwiLiBlbmQgYWZ0ZXIgNC5cbiAgICAgICAgICAgIHdoaWxlICh1bmljb2RlSSA+IDApIHtcbiAgICAgICAgICAgICAgcGFyc2VyLnVuaWNvZGVTICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYyk7XG4gICAgICAgICAgICAgIGMgPSBjaHVuay5jaGFyQ29kZUF0KGkrKyk7XG4gICAgICAgICAgICAgIHBhcnNlci5wb3NpdGlvbisrO1xuICAgICAgICAgICAgICBpZiAodW5pY29kZUkgPT09IDQpIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPIHRoaXMgbWlnaHQgYmUgc2xvdz8gd2VsbCwgcHJvYmFibHkgbm90IHVzZWQgdG9vIG9mdGVuIGFueXdheVxuICAgICAgICAgICAgICAgIHBhcnNlci50ZXh0Tm9kZSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHBhcnNlSW50KHBhcnNlci51bmljb2RlUywgMTYpKTtcbiAgICAgICAgICAgICAgICB1bmljb2RlSSA9IDA7XG4gICAgICAgICAgICAgICAgc3RhcnRpID0gaS0xO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHVuaWNvZGVJKys7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gd2UgY2FuIGp1c3QgYnJlYWsgaGVyZTogbm8gc3R1ZmYgd2Ugc2tpcHBlZCB0aGF0IHN0aWxsIGhhcyB0byBiZSBzbGljZWQgb3V0IG9yIHNvXG4gICAgICAgICAgICAgIGlmICghYykgYnJlYWsgU1RSSU5HX0JJR0xPT1A7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYyA9PT0gQ2hhci5kb3VibGVRdW90ZSAmJiAhc2xhc2hlZCkge1xuICAgICAgICAgICAgICBwYXJzZXIuc3RhdGUgPSBwYXJzZXIuc3RhY2sucG9wKCkgfHwgUy5WQUxVRTtcbiAgICAgICAgICAgICAgcGFyc2VyLnRleHROb2RlICs9IGNodW5rLnN1YnN0cmluZyhzdGFydGksIGktMSk7XG4gICAgICAgICAgICAgIHBhcnNlci5wb3NpdGlvbiArPSBpIC0gMSAtIHN0YXJ0aTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYyA9PT0gQ2hhci5iYWNrc2xhc2ggJiYgIXNsYXNoZWQpIHtcbiAgICAgICAgICAgICAgc2xhc2hlZCA9IHRydWU7XG4gICAgICAgICAgICAgIHBhcnNlci50ZXh0Tm9kZSArPSBjaHVuay5zdWJzdHJpbmcoc3RhcnRpLCBpLTEpO1xuICAgICAgICAgICAgICBwYXJzZXIucG9zaXRpb24gKz0gaSAtIDEgLSBzdGFydGk7XG4gICAgICAgICAgICAgIGMgPSBjaHVuay5jaGFyQ29kZUF0KGkrKyk7XG4gICAgICAgICAgICAgIHBhcnNlci5wb3NpdGlvbisrO1xuICAgICAgICAgICAgICBpZiAoIWMpIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNsYXNoZWQpIHtcbiAgICAgICAgICAgICAgc2xhc2hlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICBpZiAoYyA9PT0gQ2hhci5uKSB7IHBhcnNlci50ZXh0Tm9kZSArPSAnXFxuJzsgfVxuICAgICAgICAgICAgICBlbHNlIGlmIChjID09PSBDaGFyLnIpIHsgcGFyc2VyLnRleHROb2RlICs9ICdcXHInOyB9XG4gICAgICAgICAgICAgIGVsc2UgaWYgKGMgPT09IENoYXIudCkgeyBwYXJzZXIudGV4dE5vZGUgKz0gJ1xcdCc7IH1cbiAgICAgICAgICAgICAgZWxzZSBpZiAoYyA9PT0gQ2hhci5mKSB7IHBhcnNlci50ZXh0Tm9kZSArPSAnXFxmJzsgfVxuICAgICAgICAgICAgICBlbHNlIGlmIChjID09PSBDaGFyLmIpIHsgcGFyc2VyLnRleHROb2RlICs9ICdcXGInOyB9XG4gICAgICAgICAgICAgIGVsc2UgaWYgKGMgPT09IENoYXIudSkge1xuICAgICAgICAgICAgICAgIC8vIFxcdXh4eHguIG1laCFcbiAgICAgICAgICAgICAgICB1bmljb2RlSSA9IDE7XG4gICAgICAgICAgICAgICAgcGFyc2VyLnVuaWNvZGVTID0gJyc7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGFyc2VyLnRleHROb2RlICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYyA9IGNodW5rLmNoYXJDb2RlQXQoaSsrKTtcbiAgICAgICAgICAgICAgcGFyc2VyLnBvc2l0aW9uKys7XG4gICAgICAgICAgICAgIHN0YXJ0aSA9IGktMTtcbiAgICAgICAgICAgICAgaWYgKCFjKSBicmVhaztcbiAgICAgICAgICAgICAgZWxzZSBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3RyaW5nVG9rZW5QYXR0ZXJuLmxhc3RJbmRleCA9IGk7XG4gICAgICAgICAgICB2YXIgcmVSZXN1bHQgPSBzdHJpbmdUb2tlblBhdHRlcm4uZXhlYyhjaHVuayk7XG4gICAgICAgICAgICBpZiAocmVSZXN1bHQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgaSA9IGNodW5rLmxlbmd0aCsxO1xuICAgICAgICAgICAgICBwYXJzZXIudGV4dE5vZGUgKz0gY2h1bmsuc3Vic3RyaW5nKHN0YXJ0aSwgaS0xKTtcbiAgICAgICAgICAgICAgcGFyc2VyLnBvc2l0aW9uICs9IGkgLSAxIC0gc3RhcnRpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkgPSByZVJlc3VsdC5pbmRleCsxO1xuICAgICAgICAgICAgYyA9IGNodW5rLmNoYXJDb2RlQXQocmVSZXN1bHQuaW5kZXgpO1xuICAgICAgICAgICAgaWYgKCFjKSB7XG4gICAgICAgICAgICAgIHBhcnNlci50ZXh0Tm9kZSArPSBjaHVuay5zdWJzdHJpbmcoc3RhcnRpLCBpLTEpO1xuICAgICAgICAgICAgICBwYXJzZXIucG9zaXRpb24gKz0gaSAtIDEgLSBzdGFydGk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBwYXJzZXIuc2xhc2hlZCA9IHNsYXNoZWQ7XG4gICAgICAgICAgcGFyc2VyLnVuaWNvZGVJID0gdW5pY29kZUk7XG4gICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgY2FzZSBTLlRSVUU6XG4gICAgICAgICAgaWYgKGMgPT09IENoYXIucikgcGFyc2VyLnN0YXRlID0gUy5UUlVFMjtcbiAgICAgICAgICBlbHNlIGVycm9yKHBhcnNlciwgJ0ludmFsaWQgdHJ1ZSBzdGFydGVkIHdpdGggdCcrIGMpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgIGNhc2UgUy5UUlVFMjpcbiAgICAgICAgICBpZiAoYyA9PT0gQ2hhci51KSBwYXJzZXIuc3RhdGUgPSBTLlRSVUUzO1xuICAgICAgICAgIGVsc2UgZXJyb3IocGFyc2VyLCAnSW52YWxpZCB0cnVlIHN0YXJ0ZWQgd2l0aCB0cicrIGMpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgIGNhc2UgUy5UUlVFMzpcbiAgICAgICAgICBpZihjID09PSBDaGFyLmUpIHtcbiAgICAgICAgICAgIGVtaXQocGFyc2VyLCBcIm9udmFsdWVcIiwgdHJ1ZSk7XG4gICAgICAgICAgICBwYXJzZXIuc3RhdGUgPSBwYXJzZXIuc3RhY2sucG9wKCkgfHwgUy5WQUxVRTtcbiAgICAgICAgICB9IGVsc2UgZXJyb3IocGFyc2VyLCAnSW52YWxpZCB0cnVlIHN0YXJ0ZWQgd2l0aCB0cnUnKyBjKTtcbiAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICBjYXNlIFMuRkFMU0U6XG4gICAgICAgICAgaWYgKGMgPT09IENoYXIuYSkgcGFyc2VyLnN0YXRlID0gUy5GQUxTRTI7XG4gICAgICAgICAgZWxzZSBlcnJvcihwYXJzZXIsICdJbnZhbGlkIGZhbHNlIHN0YXJ0ZWQgd2l0aCBmJysgYyk7XG4gICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgY2FzZSBTLkZBTFNFMjpcbiAgICAgICAgICBpZiAoYyA9PT0gQ2hhci5sKSBwYXJzZXIuc3RhdGUgPSBTLkZBTFNFMztcbiAgICAgICAgICBlbHNlIGVycm9yKHBhcnNlciwgJ0ludmFsaWQgZmFsc2Ugc3RhcnRlZCB3aXRoIGZhJysgYyk7XG4gICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgY2FzZSBTLkZBTFNFMzpcbiAgICAgICAgICBpZiAoYyA9PT0gQ2hhci5zKSBwYXJzZXIuc3RhdGUgPSBTLkZBTFNFNDtcbiAgICAgICAgICBlbHNlIGVycm9yKHBhcnNlciwgJ0ludmFsaWQgZmFsc2Ugc3RhcnRlZCB3aXRoIGZhbCcrIGMpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgIGNhc2UgUy5GQUxTRTQ6XG4gICAgICAgICAgaWYgKGMgPT09IENoYXIuZSkge1xuICAgICAgICAgICAgZW1pdChwYXJzZXIsIFwib252YWx1ZVwiLCBmYWxzZSk7XG4gICAgICAgICAgICBwYXJzZXIuc3RhdGUgPSBwYXJzZXIuc3RhY2sucG9wKCkgfHwgUy5WQUxVRTtcbiAgICAgICAgICB9IGVsc2UgZXJyb3IocGFyc2VyLCAnSW52YWxpZCBmYWxzZSBzdGFydGVkIHdpdGggZmFscycrIGMpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgIGNhc2UgUy5OVUxMOlxuICAgICAgICAgIGlmIChjID09PSBDaGFyLnUpIHBhcnNlci5zdGF0ZSA9IFMuTlVMTDI7XG4gICAgICAgICAgZWxzZSBlcnJvcihwYXJzZXIsICdJbnZhbGlkIG51bGwgc3RhcnRlZCB3aXRoIG4nKyBjKTtcbiAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICBjYXNlIFMuTlVMTDI6XG4gICAgICAgICAgaWYgKGMgPT09IENoYXIubCkgcGFyc2VyLnN0YXRlID0gUy5OVUxMMztcbiAgICAgICAgICBlbHNlIGVycm9yKHBhcnNlciwgJ0ludmFsaWQgbnVsbCBzdGFydGVkIHdpdGggbnUnKyBjKTtcbiAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICBjYXNlIFMuTlVMTDM6XG4gICAgICAgICAgaWYoYyA9PT0gQ2hhci5sKSB7XG4gICAgICAgICAgICBlbWl0KHBhcnNlciwgXCJvbnZhbHVlXCIsIG51bGwpO1xuICAgICAgICAgICAgcGFyc2VyLnN0YXRlID0gcGFyc2VyLnN0YWNrLnBvcCgpIHx8IFMuVkFMVUU7XG4gICAgICAgICAgfSBlbHNlIGVycm9yKHBhcnNlciwgJ0ludmFsaWQgbnVsbCBzdGFydGVkIHdpdGggbnVsJysgYyk7XG4gICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgY2FzZSBTLk5VTUJFUl9ERUNJTUFMX1BPSU5UOlxuICAgICAgICAgIGlmKGMgPT09IENoYXIucGVyaW9kKSB7XG4gICAgICAgICAgICBwYXJzZXIubnVtYmVyTm9kZSArPSBcIi5cIjtcbiAgICAgICAgICAgIHBhcnNlci5zdGF0ZSAgICAgICA9IFMuTlVNQkVSX0RJR0lUO1xuICAgICAgICAgIH0gZWxzZSBlcnJvcihwYXJzZXIsICdMZWFkaW5nIHplcm8gbm90IGZvbGxvd2VkIGJ5IC4nKTtcbiAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICBjYXNlIFMuTlVNQkVSX0RJR0lUOlxuICAgICAgICAgIGlmKENoYXIuXzAgPD0gYyAmJiBjIDw9IENoYXIuXzkpIHBhcnNlci5udW1iZXJOb2RlICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYyk7XG4gICAgICAgICAgZWxzZSBpZiAoYyA9PT0gQ2hhci5wZXJpb2QpIHtcbiAgICAgICAgICAgIGlmKHBhcnNlci5udW1iZXJOb2RlLmluZGV4T2YoJy4nKSE9PS0xKVxuICAgICAgICAgICAgICBlcnJvcihwYXJzZXIsICdJbnZhbGlkIG51bWJlciBoYXMgdHdvIGRvdHMnKTtcbiAgICAgICAgICAgIHBhcnNlci5udW1iZXJOb2RlICs9IFwiLlwiO1xuICAgICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gQ2hhci5lIHx8IGMgPT09IENoYXIuRSkge1xuICAgICAgICAgICAgaWYocGFyc2VyLm51bWJlck5vZGUuaW5kZXhPZignZScpIT09LTEgfHxcbiAgICAgICAgICAgICAgIHBhcnNlci5udW1iZXJOb2RlLmluZGV4T2YoJ0UnKSE9PS0xIClcbiAgICAgICAgICAgICAgZXJyb3IocGFyc2VyLCAnSW52YWxpZCBudW1iZXIgaGFzIHR3byBleHBvbmVudGlhbCcpO1xuICAgICAgICAgICAgcGFyc2VyLm51bWJlck5vZGUgKz0gXCJlXCI7XG4gICAgICAgICAgfSBlbHNlIGlmIChjID09PSBDaGFyLnBsdXMgfHwgYyA9PT0gQ2hhci5taW51cykge1xuICAgICAgICAgICAgaWYoIShwID09PSBDaGFyLmUgfHwgcCA9PT0gQ2hhci5FKSlcbiAgICAgICAgICAgICAgZXJyb3IocGFyc2VyLCAnSW52YWxpZCBzeW1ib2wgaW4gbnVtYmVyJyk7XG4gICAgICAgICAgICBwYXJzZXIubnVtYmVyTm9kZSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbG9zZU51bWJlcihwYXJzZXIpO1xuICAgICAgICAgICAgaS0tOyAvLyBnbyBiYWNrIG9uZVxuICAgICAgICAgICAgcGFyc2VyLnN0YXRlID0gcGFyc2VyLnN0YWNrLnBvcCgpIHx8IFMuVkFMVUU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgZXJyb3IocGFyc2VyLCBcIlVua25vd24gc3RhdGU6IFwiICsgcGFyc2VyLnN0YXRlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHBhcnNlci5wb3NpdGlvbiA+PSBwYXJzZXIuYnVmZmVyQ2hlY2tQb3NpdGlvbilcbiAgICAgIGNoZWNrQnVmZmVyTGVuZ3RoKHBhcnNlcik7XG4gICAgcmV0dXJuIHBhcnNlcjtcbiAgfVxuXG59KSh0eXBlb2YgZXhwb3J0cyA9PT0gXCJ1bmRlZmluZWRcIiA/IGNsYXJpbmV0ID0ge30gOiBleHBvcnRzKTtcbiJdLCJuYW1lcyI6WyJjbGFyaW5ldCIsImVudiIsInByb2Nlc3MiLCJzZWxmIiwicGFyc2VyIiwib3B0IiwiQ1BhcnNlciIsIkNTdHJlYW0iLCJjcmVhdGVTdHJlYW0iLCJNQVhfQlVGRkVSX0xFTkdUSCIsIkRFQlVHIiwiQ0RFQlVHIiwiSU5GTyIsIkVWRU5UUyIsImJ1ZmZlcnMiLCJ0ZXh0Tm9kZSIsInVuZGVmaW5lZCIsIm51bWJlck5vZGUiLCJzdHJlYW1XcmFwcyIsImZpbHRlciIsImV2IiwiUyIsIlN0cmVhbSIsIlNUQVRFIiwiQkVHSU4iLCJWQUxVRSIsIk9QRU5fT0JKRUNUIiwiQ0xPU0VfT0JKRUNUIiwiT1BFTl9BUlJBWSIsIkNMT1NFX0FSUkFZIiwiVEVYVF9FU0NBUEUiLCJTVFJJTkciLCJCQUNLU0xBU0giLCJFTkQiLCJPUEVOX0tFWSIsIkNMT1NFX0tFWSIsIlRSVUUiLCJUUlVFMiIsIlRSVUUzIiwiRkFMU0UiLCJGQUxTRTIiLCJGQUxTRTMiLCJGQUxTRTQiLCJOVUxMIiwiTlVMTDIiLCJOVUxMMyIsIk5VTUJFUl9ERUNJTUFMX1BPSU5UIiwiTlVNQkVSX0RJR0lUIiwic18iLCJDaGFyIiwidGFiIiwibGluZUZlZWQiLCJjYXJyaWFnZVJldHVybiIsInNwYWNlIiwiZG91YmxlUXVvdGUiLCJwbHVzIiwiY29tbWEiLCJtaW51cyIsInBlcmlvZCIsIl8wIiwiXzkiLCJjb2xvbiIsIkUiLCJvcGVuQnJhY2tldCIsImJhY2tzbGFzaCIsImNsb3NlQnJhY2tldCIsImEiLCJiIiwiZSIsImYiLCJsIiwibiIsInIiLCJzIiwidCIsInUiLCJvcGVuQnJhY2UiLCJjbG9zZUJyYWNlIiwiT2JqZWN0IiwiY3JlYXRlIiwibyIsInByb3RvdHlwZSIsImdldFByb3RvdHlwZU9mIiwia2V5cyIsImkiLCJoYXNPd25Qcm9wZXJ0eSIsInB1c2giLCJjaGVja0J1ZmZlckxlbmd0aCIsIm1heEFsbG93ZWQiLCJNYXRoIiwibWF4IiwibWF4QWN0dWFsIiwiYnVmZmVyIiwibGVuIiwibGVuZ3RoIiwiY2xvc2VUZXh0IiwiZXJyb3IiLCJidWZmZXJDaGVja1Bvc2l0aW9uIiwicG9zaXRpb24iLCJjbGVhckJ1ZmZlcnMiLCJzdHJpbmdUb2tlblBhdHRlcm4iLCJxIiwiYyIsInAiLCJjbG9zZWQiLCJjbG9zZWRSb290Iiwic2F3Um9vdCIsInRhZyIsInN0YXRlIiwic3RhY2siLCJBcnJheSIsImNvbHVtbiIsImxpbmUiLCJzbGFzaGVkIiwidW5pY29kZUkiLCJ1bmljb2RlUyIsImRlcHRoIiwiZW1pdCIsImVuZCIsIndyaXRlIiwicmVzdW1lIiwiY2xvc2UiLCJyZXF1aXJlIiwiZXgiLCJfcGFyc2VyIiwid3JpdGFibGUiLCJyZWFkYWJsZSIsImJ5dGVzX3JlbWFpbmluZyIsImJ5dGVzX2luX3NlcXVlbmNlIiwidGVtcF9idWZmcyIsIkJ1ZmZlciIsInN0cmluZyIsIm1lIiwiYXBwbHkiLCJvbmVuZCIsIm9uZXJyb3IiLCJlciIsImZvckVhY2giLCJkZWZpbmVQcm9wZXJ0eSIsImdldCIsInNldCIsImgiLCJyZW1vdmVBbGxMaXN0ZW5lcnMiLCJvbiIsImVudW1lcmFibGUiLCJjb25maWd1cmFibGUiLCJjb25zdHJ1Y3RvciIsInZhbHVlIiwiZGF0YSIsImoiLCJ0b1N0cmluZyIsImsiLCJzbGljZSIsImNodW5rIiwiaGFuZGxlciIsImluZGV4T2YiLCJhcmdzIiwiYXJndW1lbnRzIiwic3BsaWNlIiwiY2FsbCIsImRlc3Ryb3kiLCJldmVudCIsImNvbnNvbGUiLCJsb2ciLCJlbWl0Tm9kZSIsImNsb3NlVmFsdWUiLCJ0ZXh0b3B0cyIsImNsb3NlTnVtYmVyIiwicGFyc2VGbG9hdCIsInRleHQiLCJ0cmltIiwibm9ybWFsaXplIiwicmVwbGFjZSIsIkVycm9yIiwiaXNXaGl0ZXNwYWNlIiwiY2hhckNvZGVBdCIsInBvcCIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsInN0YXJ0aSIsIlNUUklOR19CSUdMT09QIiwicGFyc2VJbnQiLCJzdWJzdHJpbmciLCJsYXN0SW5kZXgiLCJyZVJlc3Vs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