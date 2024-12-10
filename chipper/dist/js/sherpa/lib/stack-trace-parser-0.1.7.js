const UNKNOWN_FUNCTION = '<unknown>';
/**
 * This parses the different stack traces and puts them into one format
 * This borrows heavily from TraceKit (https://github.com/csnover/TraceKit)
 */ function parse(stackString) {
    const lines = stackString.split('\n');
    return lines.reduce((stack, line)=>{
        const parseResult = parseChrome(line) || parseWinjs(line) || parseGecko(line) || parseNode(line) || parseJSC(line);
        if (parseResult) {
            stack.push(parseResult);
        }
        return stack;
    }, []);
}
const chromeRe = /^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
const chromeEvalRe = /\((\S*)(?::(\d+))(?::(\d+))\)/;
function parseChrome(line) {
    const parts = chromeRe.exec(line);
    if (!parts) {
        return null;
    }
    const isNative = parts[2] && parts[2].indexOf('native') === 0; // start of line
    const isEval = parts[2] && parts[2].indexOf('eval') === 0; // start of line
    const submatch = chromeEvalRe.exec(parts[2]);
    if (isEval && submatch != null) {
        // throw out eval line/column and use top-most line/column number
        parts[2] = submatch[1]; // url
        parts[3] = submatch[2]; // line
        parts[4] = submatch[3]; // column
    }
    return {
        file: !isNative ? parts[2] : null,
        methodName: parts[1] || UNKNOWN_FUNCTION,
        arguments: isNative ? [
            parts[2]
        ] : [],
        lineNumber: parts[3] ? +parts[3] : null,
        column: parts[4] ? +parts[4] : null
    };
}
const winjsRe = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
function parseWinjs(line) {
    const parts = winjsRe.exec(line);
    if (!parts) {
        return null;
    }
    return {
        file: parts[2],
        methodName: parts[1] || UNKNOWN_FUNCTION,
        arguments: [],
        lineNumber: +parts[3],
        column: parts[4] ? +parts[4] : null
    };
}
const geckoRe = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|resource|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i;
const geckoEvalRe = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
function parseGecko(line) {
    const parts = geckoRe.exec(line);
    if (!parts) {
        return null;
    }
    const isEval = parts[3] && parts[3].indexOf(' > eval') > -1;
    const submatch = geckoEvalRe.exec(parts[3]);
    if (isEval && submatch != null) {
        // throw out eval line/column and use top-most line number
        parts[3] = submatch[1];
        parts[4] = submatch[2];
        parts[5] = null; // no column when eval
    }
    return {
        file: parts[3],
        methodName: parts[1] || UNKNOWN_FUNCTION,
        arguments: parts[2] ? parts[2].split(',') : [],
        lineNumber: parts[4] ? +parts[4] : null,
        column: parts[5] ? +parts[5] : null
    };
}
const javaScriptCoreRe = /^\s*(?:([^@]*)(?:\((.*?)\))?@)?(\S.*?):(\d+)(?::(\d+))?\s*$/i;
function parseJSC(line) {
    const parts = javaScriptCoreRe.exec(line);
    if (!parts) {
        return null;
    }
    return {
        file: parts[3],
        methodName: parts[1] || UNKNOWN_FUNCTION,
        arguments: [],
        lineNumber: +parts[4],
        column: parts[5] ? +parts[5] : null
    };
}
const nodeRe = /^\s*at (?:((?:\[object object\])?.+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i;
function parseNode(line) {
    const parts = nodeRe.exec(line);
    if (!parts) {
        return null;
    }
    return {
        file: parts[2],
        methodName: parts[1] || UNKNOWN_FUNCTION,
        arguments: [],
        lineNumber: +parts[3],
        column: parts[4] ? +parts[4] : null
    };
}
window.stackTraceParser = {
    parse: parse
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvc3RhY2stdHJhY2UtcGFyc2VyLTAuMS43LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFVOS05PV05fRlVOQ1RJT04gPSAnPHVua25vd24+JztcblxuLyoqXG4gKiBUaGlzIHBhcnNlcyB0aGUgZGlmZmVyZW50IHN0YWNrIHRyYWNlcyBhbmQgcHV0cyB0aGVtIGludG8gb25lIGZvcm1hdFxuICogVGhpcyBib3Jyb3dzIGhlYXZpbHkgZnJvbSBUcmFjZUtpdCAoaHR0cHM6Ly9naXRodWIuY29tL2Nzbm92ZXIvVHJhY2VLaXQpXG4gKi9cbmZ1bmN0aW9uIHBhcnNlKCBzdGFja1N0cmluZyApIHtcbiAgY29uc3QgbGluZXMgPSBzdGFja1N0cmluZy5zcGxpdCggJ1xcbicgKTtcblxuICByZXR1cm4gbGluZXMucmVkdWNlKCAoIHN0YWNrLCBsaW5lICkgPT4ge1xuICAgIGNvbnN0IHBhcnNlUmVzdWx0ID1cbiAgICAgIHBhcnNlQ2hyb21lKCBsaW5lICkgfHxcbiAgICAgIHBhcnNlV2luanMoIGxpbmUgKSB8fFxuICAgICAgcGFyc2VHZWNrbyggbGluZSApIHx8XG4gICAgICBwYXJzZU5vZGUoIGxpbmUgKSB8fFxuICAgICAgcGFyc2VKU0MoIGxpbmUgKTtcblxuICAgIGlmICggcGFyc2VSZXN1bHQgKSB7XG4gICAgICBzdGFjay5wdXNoKCBwYXJzZVJlc3VsdCApO1xuICAgIH1cblxuICAgIHJldHVybiBzdGFjaztcbiAgfSwgW10gKTtcbn1cblxuY29uc3QgY2hyb21lUmUgPSAvXlxccyphdCAoLio/KSA/XFwoKCg/OmZpbGV8aHR0cHM/fGJsb2J8Y2hyb21lLWV4dGVuc2lvbnxuYXRpdmV8ZXZhbHx3ZWJwYWNrfDxhbm9ueW1vdXM+fFxcLykuKj8pKD86OihcXGQrKSk/KD86OihcXGQrKSk/XFwpP1xccyokL2k7XG5jb25zdCBjaHJvbWVFdmFsUmUgPSAvXFwoKFxcUyopKD86OihcXGQrKSkoPzo6KFxcZCspKVxcKS87XG5cbmZ1bmN0aW9uIHBhcnNlQ2hyb21lKCBsaW5lICkge1xuICBjb25zdCBwYXJ0cyA9IGNocm9tZVJlLmV4ZWMoIGxpbmUgKTtcblxuICBpZiAoICFwYXJ0cyApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IGlzTmF0aXZlID0gcGFydHNbIDIgXSAmJiBwYXJ0c1sgMiBdLmluZGV4T2YoICduYXRpdmUnICkgPT09IDA7IC8vIHN0YXJ0IG9mIGxpbmVcbiAgY29uc3QgaXNFdmFsID0gcGFydHNbIDIgXSAmJiBwYXJ0c1sgMiBdLmluZGV4T2YoICdldmFsJyApID09PSAwOyAvLyBzdGFydCBvZiBsaW5lXG5cbiAgY29uc3Qgc3VibWF0Y2ggPSBjaHJvbWVFdmFsUmUuZXhlYyggcGFydHNbIDIgXSApO1xuICBpZiAoIGlzRXZhbCAmJiBzdWJtYXRjaCAhPSBudWxsICkge1xuICAgIC8vIHRocm93IG91dCBldmFsIGxpbmUvY29sdW1uIGFuZCB1c2UgdG9wLW1vc3QgbGluZS9jb2x1bW4gbnVtYmVyXG4gICAgcGFydHNbIDIgXSA9IHN1Ym1hdGNoWyAxIF07IC8vIHVybFxuICAgIHBhcnRzWyAzIF0gPSBzdWJtYXRjaFsgMiBdOyAvLyBsaW5lXG4gICAgcGFydHNbIDQgXSA9IHN1Ym1hdGNoWyAzIF07IC8vIGNvbHVtblxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBmaWxlOiAhaXNOYXRpdmUgPyBwYXJ0c1sgMiBdIDogbnVsbCxcbiAgICBtZXRob2ROYW1lOiBwYXJ0c1sgMSBdIHx8IFVOS05PV05fRlVOQ1RJT04sXG4gICAgYXJndW1lbnRzOiBpc05hdGl2ZSA/IFsgcGFydHNbIDIgXSBdIDogW10sXG4gICAgbGluZU51bWJlcjogcGFydHNbIDMgXSA/ICtwYXJ0c1sgMyBdIDogbnVsbCxcbiAgICBjb2x1bW46IHBhcnRzWyA0IF0gPyArcGFydHNbIDQgXSA6IG51bGwsXG4gIH07XG59XG5cbmNvbnN0IHdpbmpzUmUgPSAvXlxccyphdCAoPzooKD86XFxbb2JqZWN0IG9iamVjdFxcXSk/LispICk/XFwoPygoPzpmaWxlfG1zLWFwcHh8aHR0cHM/fHdlYnBhY2t8YmxvYik6Lio/KTooXFxkKykoPzo6KFxcZCspKT9cXCk/XFxzKiQvaTtcblxuZnVuY3Rpb24gcGFyc2VXaW5qcyggbGluZSApIHtcbiAgY29uc3QgcGFydHMgPSB3aW5qc1JlLmV4ZWMoIGxpbmUgKTtcblxuICBpZiAoICFwYXJ0cyApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZmlsZTogcGFydHNbIDIgXSxcbiAgICBtZXRob2ROYW1lOiBwYXJ0c1sgMSBdIHx8IFVOS05PV05fRlVOQ1RJT04sXG4gICAgYXJndW1lbnRzOiBbXSxcbiAgICBsaW5lTnVtYmVyOiArcGFydHNbIDMgXSxcbiAgICBjb2x1bW46IHBhcnRzWyA0IF0gPyArcGFydHNbIDQgXSA6IG51bGwsXG4gIH07XG59XG5cbmNvbnN0IGdlY2tvUmUgPSAvXlxccyooLio/KSg/OlxcKCguKj8pXFwpKT8oPzpefEApKCg/OmZpbGV8aHR0cHM/fGJsb2J8Y2hyb21lfHdlYnBhY2t8cmVzb3VyY2V8XFxbbmF0aXZlKS4qP3xbXkBdKmJ1bmRsZSkoPzo6KFxcZCspKT8oPzo6KFxcZCspKT9cXHMqJC9pO1xuY29uc3QgZ2Vja29FdmFsUmUgPSAvKFxcUyspIGxpbmUgKFxcZCspKD86ID4gZXZhbCBsaW5lIFxcZCspKiA+IGV2YWwvaTtcblxuZnVuY3Rpb24gcGFyc2VHZWNrbyggbGluZSApIHtcbiAgY29uc3QgcGFydHMgPSBnZWNrb1JlLmV4ZWMoIGxpbmUgKTtcblxuICBpZiAoICFwYXJ0cyApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IGlzRXZhbCA9IHBhcnRzWyAzIF0gJiYgcGFydHNbIDMgXS5pbmRleE9mKCAnID4gZXZhbCcgKSA+IC0xO1xuXG4gIGNvbnN0IHN1Ym1hdGNoID0gZ2Vja29FdmFsUmUuZXhlYyggcGFydHNbIDMgXSApO1xuICBpZiAoIGlzRXZhbCAmJiBzdWJtYXRjaCAhPSBudWxsICkge1xuICAgIC8vIHRocm93IG91dCBldmFsIGxpbmUvY29sdW1uIGFuZCB1c2UgdG9wLW1vc3QgbGluZSBudW1iZXJcbiAgICBwYXJ0c1sgMyBdID0gc3VibWF0Y2hbIDEgXTtcbiAgICBwYXJ0c1sgNCBdID0gc3VibWF0Y2hbIDIgXTtcbiAgICBwYXJ0c1sgNSBdID0gbnVsbDsgLy8gbm8gY29sdW1uIHdoZW4gZXZhbFxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBmaWxlOiBwYXJ0c1sgMyBdLFxuICAgIG1ldGhvZE5hbWU6IHBhcnRzWyAxIF0gfHwgVU5LTk9XTl9GVU5DVElPTixcbiAgICBhcmd1bWVudHM6IHBhcnRzWyAyIF0gPyBwYXJ0c1sgMiBdLnNwbGl0KCAnLCcgKSA6IFtdLFxuICAgIGxpbmVOdW1iZXI6IHBhcnRzWyA0IF0gPyArcGFydHNbIDQgXSA6IG51bGwsXG4gICAgY29sdW1uOiBwYXJ0c1sgNSBdID8gK3BhcnRzWyA1IF0gOiBudWxsLFxuICB9O1xufVxuXG5jb25zdCBqYXZhU2NyaXB0Q29yZVJlID0gL15cXHMqKD86KFteQF0qKSg/OlxcKCguKj8pXFwpKT9AKT8oXFxTLio/KTooXFxkKykoPzo6KFxcZCspKT9cXHMqJC9pO1xuXG5mdW5jdGlvbiBwYXJzZUpTQyggbGluZSApIHtcbiAgY29uc3QgcGFydHMgPSBqYXZhU2NyaXB0Q29yZVJlLmV4ZWMoIGxpbmUgKTtcblxuICBpZiAoICFwYXJ0cyApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZmlsZTogcGFydHNbIDMgXSxcbiAgICBtZXRob2ROYW1lOiBwYXJ0c1sgMSBdIHx8IFVOS05PV05fRlVOQ1RJT04sXG4gICAgYXJndW1lbnRzOiBbXSxcbiAgICBsaW5lTnVtYmVyOiArcGFydHNbIDQgXSxcbiAgICBjb2x1bW46IHBhcnRzWyA1IF0gPyArcGFydHNbIDUgXSA6IG51bGwsXG4gIH07XG59XG5cbmNvbnN0IG5vZGVSZSA9IC9eXFxzKmF0ICg/OigoPzpcXFtvYmplY3Qgb2JqZWN0XFxdKT8uKyg/OiBcXFthcyBcXFMrXFxdKT8pICk/XFwoPyguKj8pOihcXGQrKSg/OjooXFxkKykpP1xcKT9cXHMqJC9pO1xuXG5mdW5jdGlvbiBwYXJzZU5vZGUoIGxpbmUgKSB7XG4gIGNvbnN0IHBhcnRzID0gbm9kZVJlLmV4ZWMoIGxpbmUgKTtcblxuICBpZiAoICFwYXJ0cyApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZmlsZTogcGFydHNbIDIgXSxcbiAgICBtZXRob2ROYW1lOiBwYXJ0c1sgMSBdIHx8IFVOS05PV05fRlVOQ1RJT04sXG4gICAgYXJndW1lbnRzOiBbXSxcbiAgICBsaW5lTnVtYmVyOiArcGFydHNbIDMgXSxcbiAgICBjb2x1bW46IHBhcnRzWyA0IF0gPyArcGFydHNbIDQgXSA6IG51bGwsXG4gIH07XG59XG5cbndpbmRvdy5zdGFja1RyYWNlUGFyc2VyID0ge1xuICBwYXJzZTogcGFyc2Vcbn07Il0sIm5hbWVzIjpbIlVOS05PV05fRlVOQ1RJT04iLCJwYXJzZSIsInN0YWNrU3RyaW5nIiwibGluZXMiLCJzcGxpdCIsInJlZHVjZSIsInN0YWNrIiwibGluZSIsInBhcnNlUmVzdWx0IiwicGFyc2VDaHJvbWUiLCJwYXJzZVdpbmpzIiwicGFyc2VHZWNrbyIsInBhcnNlTm9kZSIsInBhcnNlSlNDIiwicHVzaCIsImNocm9tZVJlIiwiY2hyb21lRXZhbFJlIiwicGFydHMiLCJleGVjIiwiaXNOYXRpdmUiLCJpbmRleE9mIiwiaXNFdmFsIiwic3VibWF0Y2giLCJmaWxlIiwibWV0aG9kTmFtZSIsImFyZ3VtZW50cyIsImxpbmVOdW1iZXIiLCJjb2x1bW4iLCJ3aW5qc1JlIiwiZ2Vja29SZSIsImdlY2tvRXZhbFJlIiwiamF2YVNjcmlwdENvcmVSZSIsIm5vZGVSZSIsIndpbmRvdyIsInN0YWNrVHJhY2VQYXJzZXIiXSwibWFwcGluZ3MiOiJBQUFBLE1BQU1BLG1CQUFtQjtBQUV6Qjs7O0NBR0MsR0FDRCxTQUFTQyxNQUFPQyxX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