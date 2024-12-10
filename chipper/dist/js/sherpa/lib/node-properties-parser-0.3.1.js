var fs = require("fs");
function Iterator(text) {
    var pos = 0, length = text.length;
    this.peek = function(num) {
        num = num || 0;
        if (pos + num >= length) {
            return null;
        }
        return text.charAt(pos + num);
    };
    this.next = function(inc) {
        inc = inc || 1;
        if (pos >= length) {
            return null;
        }
        return text.charAt((pos += inc) - inc);
    };
    this.pos = function() {
        return pos;
    };
}
var rWhitespace = /\s/;
function isWhitespace(chr) {
    return rWhitespace.test(chr);
}
function consumeWhiteSpace(iter) {
    var start = iter.pos();
    while(isWhitespace(iter.peek())){
        iter.next();
    }
    return {
        type: "whitespace",
        start: start,
        end: iter.pos()
    };
}
function startsComment(chr) {
    return chr === "!" || chr === "#";
}
function isEOL(chr) {
    return chr == null || chr === "\n" || chr === "\r";
}
function consumeComment(iter) {
    var start = iter.pos();
    while(!isEOL(iter.peek())){
        iter.next();
    }
    return {
        type: "comment",
        start: start,
        end: iter.pos()
    };
}
function startsKeyVal(chr) {
    return !isWhitespace(chr) && !startsComment(chr);
}
function startsSeparator(chr) {
    return chr === "=" || chr === ":" || isWhitespace(chr);
}
function startsEscapedVal(chr) {
    return chr === "\\";
}
function consumeEscapedVal(iter) {
    var start = iter.pos();
    iter.next(); // move past "\"
    var curChar = iter.next();
    if (curChar === "u") {
        iter.next(4); // Read in the 4 hex values
    }
    return {
        type: "escaped-value",
        start: start,
        end: iter.pos()
    };
}
function consumeKey(iter) {
    var start = iter.pos(), children = [];
    var curChar;
    while((curChar = iter.peek()) !== null){
        if (startsSeparator(curChar)) {
            break;
        }
        if (startsEscapedVal(curChar)) {
            children.push(consumeEscapedVal(iter));
            continue;
        }
        iter.next();
    }
    return {
        type: "key",
        start: start,
        end: iter.pos(),
        children: children
    };
}
function consumeKeyValSeparator(iter) {
    var start = iter.pos();
    var seenHardSep = false, curChar;
    while((curChar = iter.peek()) !== null){
        if (isEOL(curChar)) {
            break;
        }
        if (isWhitespace(curChar)) {
            iter.next();
            continue;
        }
        if (seenHardSep) {
            break;
        }
        seenHardSep = curChar === ":" || curChar === "=";
        if (seenHardSep) {
            iter.next();
            continue;
        }
        break; // curChar is a non-separtor char
    }
    return {
        type: "key-value-separator",
        start: start,
        end: iter.pos()
    };
}
function startsLineBreak(iter) {
    return iter.peek() === "\\" && isEOL(iter.peek(1));
}
function consumeLineBreak(iter) {
    var start = iter.pos();
    iter.next(); // consume \
    if (iter.peek() === "\r") {
        iter.next();
    }
    iter.next(); // consume \n
    var curChar;
    while((curChar = iter.peek()) !== null){
        if (isEOL(curChar)) {
            break;
        }
        if (!isWhitespace(curChar)) {
            break;
        }
        iter.next();
    }
    return {
        type: "line-break",
        start: start,
        end: iter.pos()
    };
}
function consumeVal(iter) {
    var start = iter.pos(), children = [];
    var curChar;
    while((curChar = iter.peek()) !== null){
        if (startsLineBreak(iter)) {
            children.push(consumeLineBreak(iter));
            continue;
        }
        if (startsEscapedVal(curChar)) {
            children.push(consumeEscapedVal(iter));
            continue;
        }
        if (isEOL(curChar)) {
            break;
        }
        iter.next();
    }
    return {
        type: "value",
        start: start,
        end: iter.pos(),
        children: children
    };
}
function consumeKeyVal(iter) {
    return {
        type: "key-value",
        start: iter.pos(),
        children: [
            consumeKey(iter),
            consumeKeyValSeparator(iter),
            consumeVal(iter)
        ],
        end: iter.pos()
    };
}
var renderChild = {
    "escaped-value": function(child, text) {
        var type = text.charAt(child.start + 1);
        if (type === "t") {
            return "\t";
        }
        if (type === "r") {
            return "\r";
        }
        if (type === "n") {
            return "\n";
        }
        if (type === "f") {
            return "\f";
        }
        if (type !== "u") {
            return type;
        }
        return String.fromCharCode(parseInt(text.substr(child.start + 2, 4), 16));
    },
    "line-break": function(child, text) {
        return "";
    }
};
function rangeToBuffer(range, text) {
    var start = range.start, buffer = [];
    for(var i = 0; i < range.children.length; i++){
        var child = range.children[i];
        buffer.push(text.substring(start, child.start));
        buffer.push(renderChild[child.type](child, text));
        start = child.end;
    }
    buffer.push(text.substring(start, range.end));
    return buffer;
}
function rangesToObject(ranges, text) {
    var obj = Object.create(null); // Creates to a true hash map
    for(var i = 0; i < ranges.length; i++){
        var range = ranges[i];
        if (range.type !== "key-value") {
            continue;
        }
        var key = rangeToBuffer(range.children[0], text).join("");
        var val = rangeToBuffer(range.children[2], text).join("");
        obj[key] = val;
    }
    return obj;
}
function stringToRanges(text) {
    var iter = new Iterator(text), ranges = [];
    var curChar;
    while((curChar = iter.peek()) !== null){
        if (isWhitespace(curChar)) {
            ranges.push(consumeWhiteSpace(iter));
            continue;
        }
        if (startsComment(curChar)) {
            ranges.push(consumeComment(iter));
            continue;
        }
        if (startsKeyVal(curChar)) {
            ranges.push(consumeKeyVal(iter));
            continue;
        }
        throw Error("Something crazy happened. text: '" + text + "'; curChar: '" + curChar + "'");
    }
    return ranges;
}
function isNewLineRange(range) {
    if (!range) {
        return false;
    }
    if (range.type === "whitespace") {
        return true;
    }
    if (range.type === "literal") {
        return isWhitespace(range.text) && range.text.indexOf("\n") > -1;
    }
    return false;
}
function escapeMaker(escapes) {
    return function escapeKey(key) {
        var zeros = [
            "",
            "0",
            "00",
            "000"
        ];
        var buf = [];
        for(var i = 0; i < key.length; i++){
            var chr = key.charAt(i);
            if (escapes[chr]) {
                buf.push(escapes[chr]);
                continue;
            }
            var code = chr.codePointAt(0);
            if (code <= 0x7F) {
                buf.push(chr);
                continue;
            }
            var hex = code.toString(16);
            buf.push("\\u");
            buf.push(zeros[4 - hex.length]);
            buf.push(hex);
        }
        return buf.join("");
    };
}
var escapeKey = escapeMaker({
    " ": "\\ ",
    "\n": "\\n",
    ":": "\\:",
    "=": "\\="
});
var escapeVal = escapeMaker({
    "\n": "\\n"
});
function Editor(text, options) {
    if (typeof text === 'object') {
        options = text;
        text = null;
    }
    text = text || "";
    var path = options.path;
    var separator = options.separator || '=';
    var ranges = stringToRanges(text);
    var obj = rangesToObject(ranges, text);
    var keyRange = Object.create(null); // Creates to a true hash map
    for(var i = 0; i < ranges.length; i++){
        var range = ranges[i];
        if (range.type !== "key-value") {
            continue;
        }
        var key = rangeToBuffer(range.children[0], text).join("");
        keyRange[key] = range;
    }
    this.addHeadComment = function(comment) {
        if (comment == null) {
            return;
        }
        ranges.unshift({
            type: "literal",
            text: "# " + comment.replace(/\n/g, "\n# ") + "\n"
        });
    };
    this.get = function(key) {
        return obj[key];
    };
    this.set = function(key, val, comment) {
        if (val == null) {
            this.unset(key);
            return;
        }
        obj[key] = val;
        var escapedKey = escapeKey(key);
        var escapedVal = escapeVal(val);
        var range = keyRange[key];
        if (!range) {
            keyRange[key] = range = {
                type: "literal",
                text: escapedKey + separator + escapedVal
            };
            var prevRange = ranges[ranges.length - 1];
            if (prevRange != null && !isNewLineRange(prevRange)) {
                ranges.push({
                    type: "literal",
                    text: "\n"
                });
            }
            ranges.push(range);
        }
        // comment === null deletes comment. if comment === undefined, it's left alone
        if (comment !== undefined) {
            range.comment = comment && "# " + comment.replace(/\n/g, "\n# ") + "\n";
        }
        if (range.type === "literal") {
            range.text = escapedKey + separator + escapedVal;
            if (range.comment != null) {
                range.text = range.comment + range.text;
            }
        } else if (range.type === "key-value") {
            range.children[2] = {
                type: "literal",
                text: escapedVal
            };
        } else {
            throw "Unknown node type: " + range.type;
        }
    };
    this.unset = function(key) {
        if (!(key in obj)) {
            return;
        }
        var range = keyRange[key];
        var idx = ranges.indexOf(range);
        ranges.splice(idx, isNewLineRange(ranges[idx + 1]) ? 2 : 1);
        delete keyRange[key];
        delete obj[key];
    };
    this.valueOf = this.toString = function() {
        var buffer = [], stack = [].concat(ranges);
        var node;
        while((node = stack.shift()) != null){
            switch(node.type){
                case "literal":
                    buffer.push(node.text);
                    break;
                case "key":
                case "value":
                case "comment":
                case "whitespace":
                case "key-value-separator":
                case "escaped-value":
                case "line-break":
                    buffer.push(text.substring(node.start, node.end));
                    break;
                case "key-value":
                    Array.prototype.unshift.apply(stack, node.children);
                    if (node.comment) {
                        stack.unshift({
                            type: "literal",
                            text: node.comment
                        });
                    }
                    break;
            }
        }
        return buffer.join("");
    };
    this.save = function(newPath, callback) {
        if (typeof newPath === 'function') {
            callback = newPath;
            newPath = path;
        }
        newPath = newPath || path;
        if (!newPath) {
            if (callback) {
                return callback("Unknown path");
            }
            throw new Error("Unknown path");
        }
        if (callback) {
            fs.writeFile(newPath, this.toString(), callback);
        } else {
            fs.writeFileSync(newPath, this.toString());
        }
    };
}
function createEditor() {
    var path, options, callback;
    var args = Array.prototype.slice.call(arguments);
    for(var i = 0; i < args.length; i++){
        var arg = args[i];
        if (!path && typeof arg === 'string') {
            path = arg;
        } else if (!options && typeof arg === 'object') {
            options = arg;
        } else if (!callback && typeof arg === 'function') {
            callback = arg;
        }
    }
    options = options || {};
    path = path || options.path;
    callback = callback || options.callback;
    options.path = path;
    if (!path) {
        return new Editor(options);
    }
    if (!callback) {
        return new Editor(fs.readFileSync(path).toString(), options);
    }
    return fs.readFile(path, function(err, text) {
        if (err) {
            return callback(err, null);
        }
        text = text.toString();
        return callback(null, new Editor(text, options));
    });
}
function parse(text) {
    text = text.toString();
    var ranges = stringToRanges(text);
    return rangesToObject(ranges, text);
}
function read(path, callback) {
    if (!callback) {
        return parse(fs.readFileSync(path));
    }
    return fs.readFile(path, function(err, data) {
        if (err) {
            return callback(err, null);
        }
        return callback(null, parse(data));
    });
}
module.exports = {
    parse: parse,
    read: read,
    createEditor: createEditor
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvbm9kZS1wcm9wZXJ0aWVzLXBhcnNlci0wLjMuMS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgZnMgPSByZXF1aXJlKFwiZnNcIik7XG5cbmZ1bmN0aW9uIEl0ZXJhdG9yKHRleHQpIHtcbiAgdmFyIHBvcyA9IDAsIGxlbmd0aCA9IHRleHQubGVuZ3RoO1xuXG4gIHRoaXMucGVlayA9IGZ1bmN0aW9uKG51bSkge1xuICAgIG51bSA9IG51bSB8fCAwO1xuICAgIGlmKHBvcyArIG51bSA+PSBsZW5ndGgpIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIHJldHVybiB0ZXh0LmNoYXJBdChwb3MgKyBudW0pO1xuICB9O1xuICB0aGlzLm5leHQgPSBmdW5jdGlvbihpbmMpIHtcbiAgICBpbmMgPSBpbmMgfHwgMTtcblxuICAgIGlmKHBvcyA+PSBsZW5ndGgpIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIHJldHVybiB0ZXh0LmNoYXJBdCgocG9zICs9IGluYykgLSBpbmMpO1xuICB9O1xuICB0aGlzLnBvcyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBwb3M7XG4gIH07XG59XG5cbnZhciByV2hpdGVzcGFjZSA9IC9cXHMvO1xuZnVuY3Rpb24gaXNXaGl0ZXNwYWNlKGNocikge1xuICByZXR1cm4gcldoaXRlc3BhY2UudGVzdChjaHIpO1xufVxuZnVuY3Rpb24gY29uc3VtZVdoaXRlU3BhY2UoaXRlcikge1xuICB2YXIgc3RhcnQgPSBpdGVyLnBvcygpO1xuXG4gIHdoaWxlKGlzV2hpdGVzcGFjZShpdGVyLnBlZWsoKSkpIHsgaXRlci5uZXh0KCk7IH1cblxuICByZXR1cm4geyB0eXBlOiBcIndoaXRlc3BhY2VcIiwgc3RhcnQ6IHN0YXJ0LCBlbmQ6IGl0ZXIucG9zKCkgfTtcbn1cblxuZnVuY3Rpb24gc3RhcnRzQ29tbWVudChjaHIpIHtcbiAgcmV0dXJuIGNociA9PT0gXCIhXCIgfHwgY2hyID09PSBcIiNcIjtcbn1cbmZ1bmN0aW9uIGlzRU9MKGNocikge1xuICByZXR1cm4gY2hyID09IG51bGwgfHwgY2hyID09PSBcIlxcblwiIHx8IGNociA9PT0gXCJcXHJcIjtcbn1cbmZ1bmN0aW9uIGNvbnN1bWVDb21tZW50KGl0ZXIpIHtcbiAgdmFyIHN0YXJ0ID0gaXRlci5wb3MoKTtcblxuICB3aGlsZSghaXNFT0woaXRlci5wZWVrKCkpKSB7IGl0ZXIubmV4dCgpOyB9XG5cbiAgcmV0dXJuIHsgdHlwZTogXCJjb21tZW50XCIsIHN0YXJ0OiBzdGFydCwgZW5kOiBpdGVyLnBvcygpIH07XG59XG5cbmZ1bmN0aW9uIHN0YXJ0c0tleVZhbChjaHIpIHtcbiAgcmV0dXJuICFpc1doaXRlc3BhY2UoY2hyKSAmJiAhc3RhcnRzQ29tbWVudChjaHIpO1xufVxuZnVuY3Rpb24gc3RhcnRzU2VwYXJhdG9yKGNocikge1xuICByZXR1cm4gY2hyID09PSBcIj1cIiB8fCBjaHIgPT09IFwiOlwiIHx8IGlzV2hpdGVzcGFjZShjaHIpO1xufVxuZnVuY3Rpb24gc3RhcnRzRXNjYXBlZFZhbChjaHIpIHtcbiAgcmV0dXJuIGNociA9PT0gXCJcXFxcXCI7XG59XG5mdW5jdGlvbiBjb25zdW1lRXNjYXBlZFZhbChpdGVyKSB7XG4gIHZhciBzdGFydCA9IGl0ZXIucG9zKCk7XG5cbiAgaXRlci5uZXh0KCk7IC8vIG1vdmUgcGFzdCBcIlxcXCJcbiAgdmFyIGN1ckNoYXIgPSBpdGVyLm5leHQoKTtcbiAgaWYoY3VyQ2hhciA9PT0gXCJ1XCIpIHsgLy8gZW5jb2RlZCB1bmljb2RlIGNoYXJcbiAgICBpdGVyLm5leHQoNCk7IC8vIFJlYWQgaW4gdGhlIDQgaGV4IHZhbHVlc1xuICB9XG5cbiAgcmV0dXJuIHsgdHlwZTogXCJlc2NhcGVkLXZhbHVlXCIsIHN0YXJ0OiBzdGFydCwgZW5kOiBpdGVyLnBvcygpIH07XG59XG5mdW5jdGlvbiBjb25zdW1lS2V5KGl0ZXIpIHtcbiAgdmFyIHN0YXJ0ID0gaXRlci5wb3MoKSwgY2hpbGRyZW4gPSBbXTtcblxuICB2YXIgY3VyQ2hhcjtcbiAgd2hpbGUoKGN1ckNoYXIgPSBpdGVyLnBlZWsoKSkgIT09IG51bGwpIHtcbiAgICBpZihzdGFydHNTZXBhcmF0b3IoY3VyQ2hhcikpIHsgYnJlYWs7IH1cbiAgICBpZihzdGFydHNFc2NhcGVkVmFsKGN1ckNoYXIpKSB7IGNoaWxkcmVuLnB1c2goY29uc3VtZUVzY2FwZWRWYWwoaXRlcikpOyBjb250aW51ZTsgfVxuXG4gICAgaXRlci5uZXh0KCk7XG4gIH1cblxuICByZXR1cm4geyB0eXBlOiBcImtleVwiLCBzdGFydDogc3RhcnQsIGVuZDogaXRlci5wb3MoKSwgY2hpbGRyZW46IGNoaWxkcmVuIH07XG59XG5mdW5jdGlvbiBjb25zdW1lS2V5VmFsU2VwYXJhdG9yKGl0ZXIpIHtcbiAgdmFyIHN0YXJ0ID0gaXRlci5wb3MoKTtcblxuICB2YXIgc2VlbkhhcmRTZXAgPSBmYWxzZSwgY3VyQ2hhcjtcbiAgd2hpbGUoKGN1ckNoYXIgPSBpdGVyLnBlZWsoKSkgIT09IG51bGwpIHtcbiAgICBpZihpc0VPTChjdXJDaGFyKSkgeyBicmVhazsgfVxuXG4gICAgaWYoaXNXaGl0ZXNwYWNlKGN1ckNoYXIpKSB7IGl0ZXIubmV4dCgpOyBjb250aW51ZTsgfVxuXG4gICAgaWYoc2VlbkhhcmRTZXApIHsgYnJlYWs7IH1cblxuICAgIHNlZW5IYXJkU2VwID0gKGN1ckNoYXIgPT09IFwiOlwiIHx8IGN1ckNoYXIgPT09IFwiPVwiKTtcbiAgICBpZihzZWVuSGFyZFNlcCkgeyBpdGVyLm5leHQoKTsgY29udGludWU7IH1cblxuICAgIGJyZWFrOyAvLyBjdXJDaGFyIGlzIGEgbm9uLXNlcGFydG9yIGNoYXJcbiAgfVxuXG4gIHJldHVybiB7IHR5cGU6IFwia2V5LXZhbHVlLXNlcGFyYXRvclwiLCBzdGFydDogc3RhcnQsIGVuZDogaXRlci5wb3MoKSB9O1xufVxuZnVuY3Rpb24gc3RhcnRzTGluZUJyZWFrKGl0ZXIpIHtcbiAgcmV0dXJuIGl0ZXIucGVlaygpID09PSBcIlxcXFxcIiAmJiBpc0VPTChpdGVyLnBlZWsoMSkpO1xufVxuZnVuY3Rpb24gY29uc3VtZUxpbmVCcmVhayhpdGVyKSB7XG4gIHZhciBzdGFydCA9IGl0ZXIucG9zKCk7XG5cbiAgaXRlci5uZXh0KCk7IC8vIGNvbnN1bWUgXFxcbiAgaWYoaXRlci5wZWVrKCkgPT09IFwiXFxyXCIpIHsgaXRlci5uZXh0KCk7IH1cbiAgaXRlci5uZXh0KCk7IC8vIGNvbnN1bWUgXFxuXG5cbiAgdmFyIGN1ckNoYXI7XG4gIHdoaWxlKChjdXJDaGFyID0gaXRlci5wZWVrKCkpICE9PSBudWxsKSB7XG4gICAgaWYoaXNFT0woY3VyQ2hhcikpIHsgYnJlYWs7IH1cbiAgICBpZighaXNXaGl0ZXNwYWNlKGN1ckNoYXIpKSB7IGJyZWFrOyB9XG5cbiAgICBpdGVyLm5leHQoKTtcbiAgfVxuXG4gIHJldHVybiB7IHR5cGU6IFwibGluZS1icmVha1wiLCBzdGFydDogc3RhcnQsIGVuZDogaXRlci5wb3MoKSB9O1xufVxuZnVuY3Rpb24gY29uc3VtZVZhbChpdGVyKSB7XG4gIHZhciBzdGFydCA9IGl0ZXIucG9zKCksIGNoaWxkcmVuID0gW107XG5cbiAgdmFyIGN1ckNoYXI7XG4gIHdoaWxlKChjdXJDaGFyID0gaXRlci5wZWVrKCkpICE9PSBudWxsKSB7XG4gICAgaWYoc3RhcnRzTGluZUJyZWFrKGl0ZXIpKSB7IGNoaWxkcmVuLnB1c2goY29uc3VtZUxpbmVCcmVhayhpdGVyKSk7IGNvbnRpbnVlOyB9XG4gICAgaWYoc3RhcnRzRXNjYXBlZFZhbChjdXJDaGFyKSkgeyBjaGlsZHJlbi5wdXNoKGNvbnN1bWVFc2NhcGVkVmFsKGl0ZXIpKTsgY29udGludWU7IH1cbiAgICBpZihpc0VPTChjdXJDaGFyKSkgeyBicmVhazsgfVxuXG4gICAgaXRlci5uZXh0KCk7XG4gIH1cblxuICByZXR1cm4geyB0eXBlOiBcInZhbHVlXCIsIHN0YXJ0OiBzdGFydCwgZW5kOiBpdGVyLnBvcygpLCBjaGlsZHJlbjogY2hpbGRyZW4gfTtcbn1cbmZ1bmN0aW9uIGNvbnN1bWVLZXlWYWwoaXRlcikge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IFwia2V5LXZhbHVlXCIsXG4gICAgc3RhcnQ6IGl0ZXIucG9zKCksXG4gICAgY2hpbGRyZW46IFtcbiAgICAgIGNvbnN1bWVLZXkoaXRlciksXG4gICAgICBjb25zdW1lS2V5VmFsU2VwYXJhdG9yKGl0ZXIpLFxuICAgICAgY29uc3VtZVZhbChpdGVyKVxuICAgIF0sXG4gICAgZW5kOiBpdGVyLnBvcygpXG4gIH07XG59XG5cbnZhciByZW5kZXJDaGlsZCA9IHtcbiAgXCJlc2NhcGVkLXZhbHVlXCI6IGZ1bmN0aW9uKGNoaWxkLCB0ZXh0KSB7XG4gICAgdmFyIHR5cGUgPSB0ZXh0LmNoYXJBdChjaGlsZC5zdGFydCArIDEpO1xuXG4gICAgaWYodHlwZSA9PT0gXCJ0XCIpIHsgcmV0dXJuIFwiXFx0XCI7IH1cbiAgICBpZih0eXBlID09PSBcInJcIikgeyByZXR1cm4gXCJcXHJcIjsgfVxuICAgIGlmKHR5cGUgPT09IFwiblwiKSB7IHJldHVybiBcIlxcblwiOyB9XG4gICAgaWYodHlwZSA9PT0gXCJmXCIpIHsgcmV0dXJuIFwiXFxmXCI7IH1cbiAgICBpZih0eXBlICE9PSBcInVcIikgeyByZXR1cm4gdHlwZTsgfVxuXG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUocGFyc2VJbnQodGV4dC5zdWJzdHIoY2hpbGQuc3RhcnQgKyAyLCA0KSwgMTYpKTtcbiAgfSxcbiAgXCJsaW5lLWJyZWFrXCI6IGZ1bmN0aW9uIChjaGlsZCwgdGV4dCkge1xuICAgIHJldHVybiBcIlwiO1xuICB9XG59O1xuZnVuY3Rpb24gcmFuZ2VUb0J1ZmZlcihyYW5nZSwgdGV4dCkge1xuICB2YXIgc3RhcnQgPSByYW5nZS5zdGFydCwgYnVmZmVyID0gW107XG5cbiAgZm9yKHZhciBpID0gMDsgaSA8IHJhbmdlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGNoaWxkID0gcmFuZ2UuY2hpbGRyZW5baV07XG5cbiAgICBidWZmZXIucHVzaCh0ZXh0LnN1YnN0cmluZyhzdGFydCwgY2hpbGQuc3RhcnQpKTtcbiAgICBidWZmZXIucHVzaChyZW5kZXJDaGlsZFtjaGlsZC50eXBlXShjaGlsZCwgdGV4dCkpO1xuICAgIHN0YXJ0ID0gY2hpbGQuZW5kO1xuICB9XG4gIGJ1ZmZlci5wdXNoKHRleHQuc3Vic3RyaW5nKHN0YXJ0LCByYW5nZS5lbmQpKTtcblxuICByZXR1cm4gYnVmZmVyO1xufVxuZnVuY3Rpb24gcmFuZ2VzVG9PYmplY3QocmFuZ2VzLCB0ZXh0KSB7XG4gIHZhciBvYmogPSBPYmplY3QuY3JlYXRlKG51bGwpOyAvLyBDcmVhdGVzIHRvIGEgdHJ1ZSBoYXNoIG1hcFxuXG4gIGZvcih2YXIgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcmFuZ2UgPSByYW5nZXNbaV07XG5cbiAgICBpZihyYW5nZS50eXBlICE9PSBcImtleS12YWx1ZVwiKSB7IGNvbnRpbnVlOyB9XG5cbiAgICB2YXIga2V5ID0gcmFuZ2VUb0J1ZmZlcihyYW5nZS5jaGlsZHJlblswXSwgdGV4dCkuam9pbihcIlwiKTtcbiAgICB2YXIgdmFsID0gcmFuZ2VUb0J1ZmZlcihyYW5nZS5jaGlsZHJlblsyXSwgdGV4dCkuam9pbihcIlwiKTtcbiAgICBvYmpba2V5XSA9IHZhbDtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbmZ1bmN0aW9uIHN0cmluZ1RvUmFuZ2VzKHRleHQpIHtcbiAgdmFyIGl0ZXIgPSBuZXcgSXRlcmF0b3IodGV4dCksIHJhbmdlcyA9IFtdO1xuXG4gIHZhciBjdXJDaGFyO1xuICB3aGlsZSgoY3VyQ2hhciA9IGl0ZXIucGVlaygpKSAhPT0gbnVsbCkge1xuICAgIGlmKGlzV2hpdGVzcGFjZShjdXJDaGFyKSkgeyByYW5nZXMucHVzaChjb25zdW1lV2hpdGVTcGFjZShpdGVyKSk7IGNvbnRpbnVlOyB9XG4gICAgaWYoc3RhcnRzQ29tbWVudChjdXJDaGFyKSkgeyByYW5nZXMucHVzaChjb25zdW1lQ29tbWVudChpdGVyKSk7IGNvbnRpbnVlOyB9XG4gICAgaWYoc3RhcnRzS2V5VmFsKGN1ckNoYXIpKSB7IHJhbmdlcy5wdXNoKGNvbnN1bWVLZXlWYWwoaXRlcikpOyBjb250aW51ZTsgfVxuXG4gICAgdGhyb3cgRXJyb3IoXCJTb21ldGhpbmcgY3JhenkgaGFwcGVuZWQuIHRleHQ6ICdcIiArIHRleHQgKyBcIic7IGN1ckNoYXI6ICdcIiArIGN1ckNoYXIgKyBcIidcIik7XG4gIH1cblxuICByZXR1cm4gcmFuZ2VzO1xufVxuXG5mdW5jdGlvbiBpc05ld0xpbmVSYW5nZShyYW5nZSkge1xuICBpZighcmFuZ2UpIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgaWYocmFuZ2UudHlwZSA9PT0gXCJ3aGl0ZXNwYWNlXCIpIHsgcmV0dXJuIHRydWU7IH1cblxuICBpZihyYW5nZS50eXBlID09PSBcImxpdGVyYWxcIikge1xuICAgIHJldHVybiBpc1doaXRlc3BhY2UocmFuZ2UudGV4dCkgJiYgcmFuZ2UudGV4dC5pbmRleE9mKFwiXFxuXCIpID4gLTE7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGVzY2FwZU1ha2VyKGVzY2FwZXMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGVzY2FwZUtleShrZXkpIHtcbiAgICB2YXIgemVyb3MgPSBbIFwiXCIsIFwiMFwiLCBcIjAwXCIsIFwiMDAwXCIgXTtcbiAgICB2YXIgYnVmID0gW107XG5cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwga2V5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgY2hyID0ga2V5LmNoYXJBdChpKTtcblxuICAgICAgaWYoZXNjYXBlc1tjaHJdKSB7IGJ1Zi5wdXNoKGVzY2FwZXNbY2hyXSk7IGNvbnRpbnVlOyB9XG5cbiAgICAgIHZhciBjb2RlID0gY2hyLmNvZGVQb2ludEF0KDApO1xuXG4gICAgICBpZihjb2RlIDw9IDB4N0YpIHsgYnVmLnB1c2goY2hyKTsgY29udGludWU7IH1cblxuICAgICAgdmFyIGhleCA9IGNvZGUudG9TdHJpbmcoMTYpO1xuXG4gICAgICBidWYucHVzaChcIlxcXFx1XCIpO1xuICAgICAgYnVmLnB1c2goemVyb3NbNCAtIGhleC5sZW5ndGhdKTtcbiAgICAgIGJ1Zi5wdXNoKGhleCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xuICB9O1xufVxuXG52YXIgZXNjYXBlS2V5ID0gZXNjYXBlTWFrZXIoeyBcIiBcIjogXCJcXFxcIFwiLCBcIlxcblwiOiBcIlxcXFxuXCIsIFwiOlwiOiBcIlxcXFw6XCIsIFwiPVwiOiBcIlxcXFw9XCIgfSk7XG52YXIgZXNjYXBlVmFsID0gZXNjYXBlTWFrZXIoeyBcIlxcblwiOiBcIlxcXFxuXCIgfSk7XG5cbmZ1bmN0aW9uIEVkaXRvcih0ZXh0LCBvcHRpb25zKSB7XG4gIGlmICh0eXBlb2YgdGV4dCA9PT0gJ29iamVjdCcpIHtcbiAgICBvcHRpb25zID0gdGV4dDtcbiAgICB0ZXh0ID0gbnVsbDtcbiAgfVxuICB0ZXh0ID0gdGV4dCB8fCBcIlwiO1xuICB2YXIgcGF0aCA9IG9wdGlvbnMucGF0aDtcbiAgdmFyIHNlcGFyYXRvciA9IG9wdGlvbnMuc2VwYXJhdG9yIHx8ICc9JztcblxuICB2YXIgcmFuZ2VzID0gc3RyaW5nVG9SYW5nZXModGV4dCk7XG4gIHZhciBvYmogPSByYW5nZXNUb09iamVjdChyYW5nZXMsIHRleHQpO1xuICB2YXIga2V5UmFuZ2UgPSBPYmplY3QuY3JlYXRlKG51bGwpOyAvLyBDcmVhdGVzIHRvIGEgdHJ1ZSBoYXNoIG1hcFxuXG4gIGZvcih2YXIgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcmFuZ2UgPSByYW5nZXNbaV07XG5cbiAgICBpZihyYW5nZS50eXBlICE9PSBcImtleS12YWx1ZVwiKSB7IGNvbnRpbnVlOyB9XG5cbiAgICB2YXIga2V5ID0gcmFuZ2VUb0J1ZmZlcihyYW5nZS5jaGlsZHJlblswXSwgdGV4dCkuam9pbihcIlwiKTtcbiAgICBrZXlSYW5nZVtrZXldID0gcmFuZ2U7XG4gIH1cblxuICB0aGlzLmFkZEhlYWRDb21tZW50ID0gZnVuY3Rpb24oY29tbWVudCkge1xuICAgIGlmKGNvbW1lbnQgPT0gbnVsbCkgeyByZXR1cm47IH1cblxuICAgIHJhbmdlcy51bnNoaWZ0KHsgdHlwZTogXCJsaXRlcmFsXCIsIHRleHQ6IFwiIyBcIiArIGNvbW1lbnQucmVwbGFjZSgvXFxuL2csIFwiXFxuIyBcIikgKyBcIlxcblwiIH0pO1xuICB9O1xuXG4gIHRoaXMuZ2V0ID0gZnVuY3Rpb24oa2V5KSB7IHJldHVybiBvYmpba2V5XTsgfTtcbiAgdGhpcy5zZXQgPSBmdW5jdGlvbihrZXksIHZhbCwgY29tbWVudCkge1xuICAgIGlmKHZhbCA9PSBudWxsKSB7IHRoaXMudW5zZXQoa2V5KTsgcmV0dXJuOyB9XG5cbiAgICBvYmpba2V5XSA9IHZhbDtcbiAgICB2YXIgZXNjYXBlZEtleSA9IGVzY2FwZUtleShrZXkpO1xuICAgIHZhciBlc2NhcGVkVmFsID0gZXNjYXBlVmFsKHZhbCk7XG5cbiAgICB2YXIgcmFuZ2UgPSBrZXlSYW5nZVtrZXldO1xuICAgIGlmKCFyYW5nZSkge1xuICAgICAga2V5UmFuZ2Vba2V5XSA9IHJhbmdlID0ge1xuICAgICAgICB0eXBlOiBcImxpdGVyYWxcIixcbiAgICAgICAgdGV4dDogZXNjYXBlZEtleSArIHNlcGFyYXRvciArIGVzY2FwZWRWYWxcbiAgICAgIH07XG5cbiAgICAgIHZhciBwcmV2UmFuZ2UgPSByYW5nZXNbcmFuZ2VzLmxlbmd0aCAtIDFdO1xuICAgICAgaWYocHJldlJhbmdlICE9IG51bGwgJiYgIWlzTmV3TGluZVJhbmdlKHByZXZSYW5nZSkpIHtcbiAgICAgICAgcmFuZ2VzLnB1c2goeyB0eXBlOiBcImxpdGVyYWxcIiwgdGV4dDogXCJcXG5cIiB9KTtcbiAgICAgIH1cbiAgICAgIHJhbmdlcy5wdXNoKHJhbmdlKTtcbiAgICB9XG5cbiAgICAvLyBjb21tZW50ID09PSBudWxsIGRlbGV0ZXMgY29tbWVudC4gaWYgY29tbWVudCA9PT0gdW5kZWZpbmVkLCBpdCdzIGxlZnQgYWxvbmVcbiAgICBpZihjb21tZW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJhbmdlLmNvbW1lbnQgPSBjb21tZW50ICYmIFwiIyBcIiArIGNvbW1lbnQucmVwbGFjZSgvXFxuL2csIFwiXFxuIyBcIikgKyBcIlxcblwiO1xuICAgIH1cblxuICAgIGlmKHJhbmdlLnR5cGUgPT09IFwibGl0ZXJhbFwiKSB7XG4gICAgICByYW5nZS50ZXh0ID0gZXNjYXBlZEtleSArIHNlcGFyYXRvciArIGVzY2FwZWRWYWw7XG4gICAgICBpZihyYW5nZS5jb21tZW50ICE9IG51bGwpIHsgcmFuZ2UudGV4dCA9IHJhbmdlLmNvbW1lbnQgKyByYW5nZS50ZXh0OyB9XG4gICAgfSBlbHNlIGlmKHJhbmdlLnR5cGUgPT09IFwia2V5LXZhbHVlXCIpIHtcbiAgICAgIHJhbmdlLmNoaWxkcmVuWzJdID0geyB0eXBlOiBcImxpdGVyYWxcIiwgdGV4dDogZXNjYXBlZFZhbCB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBcIlVua25vd24gbm9kZSB0eXBlOiBcIiArIHJhbmdlLnR5cGU7XG4gICAgfVxuICB9O1xuICB0aGlzLnVuc2V0ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYoIShrZXkgaW4gb2JqKSkgeyByZXR1cm47IH1cblxuICAgIHZhciByYW5nZSA9IGtleVJhbmdlW2tleV07XG4gICAgdmFyIGlkeCA9IHJhbmdlcy5pbmRleE9mKHJhbmdlKTtcblxuICAgIHJhbmdlcy5zcGxpY2UoaWR4LCAoaXNOZXdMaW5lUmFuZ2UocmFuZ2VzW2lkeCArIDFdKSA/IDIgOiAxKSk7XG5cbiAgICBkZWxldGUga2V5UmFuZ2Vba2V5XTtcbiAgICBkZWxldGUgb2JqW2tleV07XG4gIH07XG4gIHRoaXMudmFsdWVPZiA9IHRoaXMudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYnVmZmVyID0gW10sIHN0YWNrID0gW10uY29uY2F0KHJhbmdlcyk7XG5cbiAgICB2YXIgbm9kZTtcbiAgICB3aGlsZSgobm9kZSA9IHN0YWNrLnNoaWZ0KCkpICE9IG51bGwpIHtcbiAgICAgIHN3aXRjaChub2RlLnR5cGUpIHtcbiAgICAgICAgY2FzZSBcImxpdGVyYWxcIjpcbiAgICAgICAgICBidWZmZXIucHVzaChub2RlLnRleHQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwia2V5XCI6XG4gICAgICAgIGNhc2UgXCJ2YWx1ZVwiOlxuICAgICAgICBjYXNlIFwiY29tbWVudFwiOlxuICAgICAgICBjYXNlIFwid2hpdGVzcGFjZVwiOlxuICAgICAgICBjYXNlIFwia2V5LXZhbHVlLXNlcGFyYXRvclwiOlxuICAgICAgICBjYXNlIFwiZXNjYXBlZC12YWx1ZVwiOlxuICAgICAgICBjYXNlIFwibGluZS1icmVha1wiOlxuICAgICAgICAgIGJ1ZmZlci5wdXNoKHRleHQuc3Vic3RyaW5nKG5vZGUuc3RhcnQsIG5vZGUuZW5kKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJrZXktdmFsdWVcIjpcbiAgICAgICAgICBBcnJheS5wcm90b3R5cGUudW5zaGlmdC5hcHBseShzdGFjaywgbm9kZS5jaGlsZHJlbik7XG4gICAgICAgICAgaWYobm9kZS5jb21tZW50KSB7IHN0YWNrLnVuc2hpZnQoeyB0eXBlOiBcImxpdGVyYWxcIiwgdGV4dDogbm9kZS5jb21tZW50IH0pOyB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZmZlci5qb2luKFwiXCIpO1xuICB9O1xuICB0aGlzLnNhdmUgPSBmdW5jdGlvbihuZXdQYXRoLCBjYWxsYmFjaykge1xuICAgIGlmKHR5cGVvZiBuZXdQYXRoID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjYWxsYmFjayA9IG5ld1BhdGg7XG4gICAgICBuZXdQYXRoID0gcGF0aDtcbiAgICB9XG4gICAgbmV3UGF0aCA9IG5ld1BhdGggfHwgcGF0aDtcblxuICAgIGlmKCFuZXdQYXRoKSB7XG4gICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKFwiVW5rbm93biBwYXRoXCIpO1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBwYXRoXCIpO1xuICAgIH1cblxuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgZnMud3JpdGVGaWxlKG5ld1BhdGgsIHRoaXMudG9TdHJpbmcoKSwgY2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKG5ld1BhdGgsIHRoaXMudG9TdHJpbmcoKSk7XG4gICAgfVxuXG4gIH07XG59XG5mdW5jdGlvbiBjcmVhdGVFZGl0b3IoLypwYXRoLCBvcHRpb25zLCBjYWxsYmFjayovKSB7XG4gIHZhciBwYXRoLCBvcHRpb25zLCBjYWxsYmFjaztcbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpICsrKSB7XG4gICAgdmFyIGFyZyA9IGFyZ3NbaV07XG4gICAgaWYgKCFwYXRoICYmIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnKSB7XG4gICAgICBwYXRoID0gYXJnO1xuICAgIH0gZWxzZSBpZiAoIW9wdGlvbnMgJiYgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIG9wdGlvbnMgPSBhcmc7XG4gICAgfSBlbHNlIGlmICghY2FsbGJhY2sgJiYgdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2FsbGJhY2sgPSBhcmc7XG4gICAgfVxuICB9XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBwYXRoID0gcGF0aCB8fCBvcHRpb25zLnBhdGg7XG4gIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgb3B0aW9ucy5jYWxsYmFjaztcbiAgb3B0aW9ucy5wYXRoID0gcGF0aDtcblxuICBpZighcGF0aCkgeyByZXR1cm4gbmV3IEVkaXRvcihvcHRpb25zKTsgfVxuXG4gIGlmKCFjYWxsYmFjaykgeyByZXR1cm4gbmV3IEVkaXRvcihmcy5yZWFkRmlsZVN5bmMocGF0aCkudG9TdHJpbmcoKSwgb3B0aW9ucyk7IH1cblxuICByZXR1cm4gZnMucmVhZEZpbGUocGF0aCwgZnVuY3Rpb24oZXJyLCB0ZXh0KSB7XG4gICAgaWYoZXJyKSB7IHJldHVybiBjYWxsYmFjayhlcnIsIG51bGwpOyB9XG5cbiAgICB0ZXh0ID0gdGV4dC50b1N0cmluZygpO1xuICAgIHJldHVybiBjYWxsYmFjayhudWxsLCBuZXcgRWRpdG9yKHRleHQsIG9wdGlvbnMpKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlKHRleHQpIHtcbiAgdGV4dCA9IHRleHQudG9TdHJpbmcoKTtcbiAgdmFyIHJhbmdlcyA9IHN0cmluZ1RvUmFuZ2VzKHRleHQpO1xuICByZXR1cm4gcmFuZ2VzVG9PYmplY3QocmFuZ2VzLCB0ZXh0KTtcbn1cblxuZnVuY3Rpb24gcmVhZChwYXRoLCBjYWxsYmFjaykge1xuICBpZighY2FsbGJhY2spIHsgcmV0dXJuIHBhcnNlKGZzLnJlYWRGaWxlU3luYyhwYXRoKSk7IH1cblxuICByZXR1cm4gZnMucmVhZEZpbGUocGF0aCwgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgaWYoZXJyKSB7IHJldHVybiBjYWxsYmFjayhlcnIsIG51bGwpOyB9XG5cbiAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgcGFyc2UoZGF0YSkpO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7IHBhcnNlOiBwYXJzZSwgcmVhZDogcmVhZCwgY3JlYXRlRWRpdG9yOiBjcmVhdGVFZGl0b3IgfTsiXSwibmFtZXMiOlsiZnMiLCJyZXF1aXJlIiwiSXRlcmF0b3IiLCJ0ZXh0IiwicG9zIiwibGVuZ3RoIiwicGVlayIsIm51bSIsImNoYXJBdCIsIm5leHQiLCJpbmMiLCJyV2hpdGVzcGFjZSIsImlzV2hpdGVzcGFjZSIsImNociIsInRlc3QiLCJjb25zdW1lV2hpdGVTcGFjZSIsIml0ZXIiLCJzdGFydCIsInR5cGUiLCJlbmQiLCJzdGFydHNDb21tZW50IiwiaXNFT0wiLCJjb25zdW1lQ29tbWVudCIsInN0YXJ0c0tleVZhbCIsInN0YXJ0c1NlcGFyYXRvciIsInN0YXJ0c0VzY2FwZWRWYWwiLCJjb25zdW1lRXNjYXBlZFZhbCIsImN1ckNoYXIiLCJjb25zdW1lS2V5IiwiY2hpbGRyZW4iLCJwdXNoIiwiY29uc3VtZUtleVZhbFNlcGFyYXRvciIsInNlZW5IYXJkU2VwIiwic3RhcnRzTGluZUJyZWFrIiwiY29uc3VtZUxpbmVCcmVhayIsImNvbnN1bWVWYWwiLCJjb25zdW1lS2V5VmFsIiwicmVuZGVyQ2hpbGQiLCJjaGlsZCIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsInBhcnNlSW50Iiwic3Vic3RyIiwicmFuZ2VUb0J1ZmZlciIsInJhbmdlIiwiYnVmZmVyIiwiaSIsInN1YnN0cmluZyIsInJhbmdlc1RvT2JqZWN0IiwicmFuZ2VzIiwib2JqIiwiT2JqZWN0IiwiY3JlYXRlIiwia2V5Iiwiam9pbiIsInZhbCIsInN0cmluZ1RvUmFuZ2VzIiwiRXJyb3IiLCJpc05ld0xpbmVSYW5nZSIsImluZGV4T2YiLCJlc2NhcGVNYWtlciIsImVzY2FwZXMiLCJlc2NhcGVLZXkiLCJ6ZXJvcyIsImJ1ZiIsImNvZGUiLCJjb2RlUG9pbnRBdCIsImhleCIsInRvU3RyaW5nIiwiZXNjYXBlVmFsIiwiRWRpdG9yIiwib3B0aW9ucyIsInBhdGgiLCJzZXBhcmF0b3IiLCJrZXlSYW5nZSIsImFkZEhlYWRDb21tZW50IiwiY29tbWVudCIsInVuc2hpZnQiLCJyZXBsYWNlIiwiZ2V0Iiwic2V0IiwidW5zZXQiLCJlc2NhcGVkS2V5IiwiZXNjYXBlZFZhbCIsInByZXZSYW5nZSIsInVuZGVmaW5lZCIsImlkeCIsInNwbGljZSIsInZhbHVlT2YiLCJzdGFjayIsImNvbmNhdCIsIm5vZGUiLCJzaGlmdCIsIkFycmF5IiwicHJvdG90eXBlIiwiYXBwbHkiLCJzYXZlIiwibmV3UGF0aCIsImNhbGxiYWNrIiwid3JpdGVGaWxlIiwid3JpdGVGaWxlU3luYyIsImNyZWF0ZUVkaXRvciIsImFyZ3MiLCJzbGljZSIsImNhbGwiLCJhcmd1bWVudHMiLCJhcmciLCJyZWFkRmlsZVN5bmMiLCJyZWFkRmlsZSIsImVyciIsInBhcnNlIiwicmVhZCIsImRhdGEiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFJQSxLQUFLQyxRQUFRO0FBRWpCLFNBQVNDLFNBQVNDLElBQUk7SUFDcEIsSUFBSUMsTUFBTSxHQUFHQyxTQUFTRixLQUFLRSxNQUFNO0lBRWpDLElBQUksQ0FBQ0MsSUFBSSxHQUFHLFNBQVNDLEdBQUc7UUFDdEJBLE1BQU1BLE9BQU87UUFDYixJQUFHSCxNQUFNRyxPQUFPRixRQUFRO1lBQUUsT0FBTztRQUFNO1FBRXZDLE9BQU9GLEtBQUtLLE1BQU0sQ0FBQ0osTUFBTUc7SUFDM0I7SUFDQSxJQUFJLENBQUNFLElBQUksR0FBRyxTQUFTQyxHQUFHO1FBQ3RCQSxNQUFNQSxPQUFPO1FBRWIsSUFBR04sT0FBT0MsUUFBUTtZQUFFLE9BQU87UUFBTTtRQUVqQyxPQUFPRixLQUFLSyxNQUFNLENBQUMsQUFBQ0osQ0FBQUEsT0FBT00sR0FBRSxJQUFLQTtJQUNwQztJQUNBLElBQUksQ0FBQ04sR0FBRyxHQUFHO1FBQ1QsT0FBT0E7SUFDVDtBQUNGO0FBRUEsSUFBSU8sY0FBYztBQUNsQixTQUFTQyxhQUFhQyxHQUFHO0lBQ3ZCLE9BQU9GLFlBQVlHLElBQUksQ0FBQ0Q7QUFDMUI7QUFDQSxTQUFTRSxrQkFBa0JDLElBQUk7SUFDN0IsSUFBSUMsUUFBUUQsS0FBS1osR0FBRztJQUVwQixNQUFNUSxhQUFhSSxLQUFLVixJQUFJLElBQUs7UUFBRVUsS0FBS1AsSUFBSTtJQUFJO0lBRWhELE9BQU87UUFBRVMsTUFBTTtRQUFjRCxPQUFPQTtRQUFPRSxLQUFLSCxLQUFLWixHQUFHO0lBQUc7QUFDN0Q7QUFFQSxTQUFTZ0IsY0FBY1AsR0FBRztJQUN4QixPQUFPQSxRQUFRLE9BQU9BLFFBQVE7QUFDaEM7QUFD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