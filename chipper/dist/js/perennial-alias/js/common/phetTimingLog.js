// Copyright 2022, University of Colorado Boulder
/**
 * Outputs timing information for nested structured tasks, so they can be inspected to understand what is
 * taking so long. This is optimized for human-readability. Use an XML-like syntax for structuring, though the overall
 * format is not xml since there are multiple root elements.  Output timing information in a comment after a closing tag.
 * Sessions are delimited by a blank line. Un-truncated sessions are XML parseable, but the timing data is in the comments
 * so naive XML parsing won't help in analysis.
 *
 * - Data is streamed as it is generated, and hence may be incomplete if a process is interrupted.
 * - This is coded in perennial so it can be used in chipper tasks (via perennial-alias) and also for perennial tasks as needed.
 * - Assumes single-threaded access to the interface
 *
 * You can watch the results stream out live, and get a good sense of where the time is being spent by running
 * tail -f /path/to/perennial-alias/logs/phet-timing-log.txt
 *
 * This task is to help identify bottlenecks and cross-platform differences. It is not intended to account for
 * every millisecond in self-time.
 *
 * The log file is dedicated to timing information and structuring of tasks, and we should not add supplemental metadata
 * such as messages or results from tasks.
 *
 * Assumes that task structuring is all done in one frame--not possible to start an event in one animation frame
 * and end it in another.
 *
 * @author Sam Reid (PhET Interactive Simulations)
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
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const logDir = path.resolve(__dirname, '../../logs');
try {
    fs.mkdirSync(logDir);
} catch (e) {
// already exists
}
// Log to perennial-alias if running a perennial-alias task, or perennial if running a perennial task.
const logPath = path.resolve(logDir, 'phet-timing-log.txt');
// WriteStream for appending data.  Created lazily.  Closed on each top-level pop so we can guarantee flush.
let stream = null;
// Depth of nesting.  -1 means not yet started.  0 means top-level.
let depth = -1;
const indent = (depth)=>'  '.repeat(depth);
const getDate = ()=>new Date().toLocaleString('en-US', {
        timeZone: 'America/Denver'
    });
/**
 * @param {string} taskName
 * @param {{depth:number}} [options]
 * @returns {number} - time of the start
 */ const push = (taskName, options = null)=>{
    assert(!taskName.includes(':'), 'task name cannot include :, it was ' + taskName);
    depth++;
    if (stream === null) {
        stream = fs.createWriteStream(logPath, {
            flags: 'a'
        });
    }
    // only write a start tag for depth of 0, nested content is just printed upon completion
    if (depth === 0) {
        const indentSpace = indent(options && options.hasOwnProperty('depth') ? options.depth : depth);
        // Add date attribute to all that are in depth 0
        stream.write(`${indentSpace}<${taskName} date="${getDate()}">\n`);
    }
    return Date.now();
};
/**
 * @param {string} taskName
 * @param {string} startTime
 * @param {{depth:number}} [options]
 */ const pop = (taskName, startTime, options = null)=>{
    const endTime = Date.now();
    const isTopLevel = depth === 0;
    const indentSpacing = indent(options && options.hasOwnProperty('depth') ? options.depth : depth);
    const startSlash = isTopLevel ? '/' : ''; // end tag for depth 0
    const endSlash = isTopLevel ? '' : '/'; // tag is a solo tag when depth is not 0
    stream.write(`${indentSpacing}<${startSlash}${taskName} time="${endTime - startTime}ms"${endSlash}>\n`);
    if (isTopLevel) {
        stream.write('\n', ()=>{
            // Guaranteed flushing the buffer.  Without this, we end up with partial/truncated output.
            stream.close(()=>{
                // Flag the stream as needing to be recreated next time we want to write to the buffer
                stream = null;
            });
        });
    }
    depth--;
};
const phetTimingLog = {
    /**
   * Invoke the task and return the return value of the task.
   * @param {string} taskName
   * @param {()=>T} task
   * @returns {T}
   */ start (taskName, task) {
        const startTime = push(taskName);
        const result = task();
        pop(taskName, startTime);
        return result;
    },
    /**
   * Invoke the task and return the return value of the task.
   * @param {string} taskName
   * @param {()=>Promise<T>} task
   * @param [options]
   * @returns {Promise<T>}
   */ startAsync (taskName, task, options) {
        return _async_to_generator(function*() {
            const startTime = push(taskName, options);
            const result = yield task();
            pop(taskName, startTime, options);
            return result;
        })();
    },
    /**
   * Flush the write stream before exiting node.
   * @param {()=>void} [callback]
   */ close (callback = ()=>{}) {
        stream.close(callback);
    }
};
module.exports = phetTimingLog;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vcGhldFRpbWluZ0xvZy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogT3V0cHV0cyB0aW1pbmcgaW5mb3JtYXRpb24gZm9yIG5lc3RlZCBzdHJ1Y3R1cmVkIHRhc2tzLCBzbyB0aGV5IGNhbiBiZSBpbnNwZWN0ZWQgdG8gdW5kZXJzdGFuZCB3aGF0IGlzXG4gKiB0YWtpbmcgc28gbG9uZy4gVGhpcyBpcyBvcHRpbWl6ZWQgZm9yIGh1bWFuLXJlYWRhYmlsaXR5LiBVc2UgYW4gWE1MLWxpa2Ugc3ludGF4IGZvciBzdHJ1Y3R1cmluZywgdGhvdWdoIHRoZSBvdmVyYWxsXG4gKiBmb3JtYXQgaXMgbm90IHhtbCBzaW5jZSB0aGVyZSBhcmUgbXVsdGlwbGUgcm9vdCBlbGVtZW50cy4gIE91dHB1dCB0aW1pbmcgaW5mb3JtYXRpb24gaW4gYSBjb21tZW50IGFmdGVyIGEgY2xvc2luZyB0YWcuXG4gKiBTZXNzaW9ucyBhcmUgZGVsaW1pdGVkIGJ5IGEgYmxhbmsgbGluZS4gVW4tdHJ1bmNhdGVkIHNlc3Npb25zIGFyZSBYTUwgcGFyc2VhYmxlLCBidXQgdGhlIHRpbWluZyBkYXRhIGlzIGluIHRoZSBjb21tZW50c1xuICogc28gbmFpdmUgWE1MIHBhcnNpbmcgd29uJ3QgaGVscCBpbiBhbmFseXNpcy5cbiAqXG4gKiAtIERhdGEgaXMgc3RyZWFtZWQgYXMgaXQgaXMgZ2VuZXJhdGVkLCBhbmQgaGVuY2UgbWF5IGJlIGluY29tcGxldGUgaWYgYSBwcm9jZXNzIGlzIGludGVycnVwdGVkLlxuICogLSBUaGlzIGlzIGNvZGVkIGluIHBlcmVubmlhbCBzbyBpdCBjYW4gYmUgdXNlZCBpbiBjaGlwcGVyIHRhc2tzICh2aWEgcGVyZW5uaWFsLWFsaWFzKSBhbmQgYWxzbyBmb3IgcGVyZW5uaWFsIHRhc2tzIGFzIG5lZWRlZC5cbiAqIC0gQXNzdW1lcyBzaW5nbGUtdGhyZWFkZWQgYWNjZXNzIHRvIHRoZSBpbnRlcmZhY2VcbiAqXG4gKiBZb3UgY2FuIHdhdGNoIHRoZSByZXN1bHRzIHN0cmVhbSBvdXQgbGl2ZSwgYW5kIGdldCBhIGdvb2Qgc2Vuc2Ugb2Ygd2hlcmUgdGhlIHRpbWUgaXMgYmVpbmcgc3BlbnQgYnkgcnVubmluZ1xuICogdGFpbCAtZiAvcGF0aC90by9wZXJlbm5pYWwtYWxpYXMvbG9ncy9waGV0LXRpbWluZy1sb2cudHh0XG4gKlxuICogVGhpcyB0YXNrIGlzIHRvIGhlbHAgaWRlbnRpZnkgYm90dGxlbmVja3MgYW5kIGNyb3NzLXBsYXRmb3JtIGRpZmZlcmVuY2VzLiBJdCBpcyBub3QgaW50ZW5kZWQgdG8gYWNjb3VudCBmb3JcbiAqIGV2ZXJ5IG1pbGxpc2Vjb25kIGluIHNlbGYtdGltZS5cbiAqXG4gKiBUaGUgbG9nIGZpbGUgaXMgZGVkaWNhdGVkIHRvIHRpbWluZyBpbmZvcm1hdGlvbiBhbmQgc3RydWN0dXJpbmcgb2YgdGFza3MsIGFuZCB3ZSBzaG91bGQgbm90IGFkZCBzdXBwbGVtZW50YWwgbWV0YWRhdGFcbiAqIHN1Y2ggYXMgbWVzc2FnZXMgb3IgcmVzdWx0cyBmcm9tIHRhc2tzLlxuICpcbiAqIEFzc3VtZXMgdGhhdCB0YXNrIHN0cnVjdHVyaW5nIGlzIGFsbCBkb25lIGluIG9uZSBmcmFtZS0tbm90IHBvc3NpYmxlIHRvIHN0YXJ0IGFuIGV2ZW50IGluIG9uZSBhbmltYXRpb24gZnJhbWVcbiAqIGFuZCBlbmQgaXQgaW4gYW5vdGhlci5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmNvbnN0IHBhdGggPSByZXF1aXJlKCAncGF0aCcgKTtcbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xuY29uc3QgYXNzZXJ0ID0gcmVxdWlyZSggJ2Fzc2VydCcgKTtcblxuY29uc3QgbG9nRGlyID0gcGF0aC5yZXNvbHZlKCBfX2Rpcm5hbWUsICcuLi8uLi9sb2dzJyApO1xudHJ5IHtcbiAgZnMubWtkaXJTeW5jKCBsb2dEaXIgKTtcbn1cbmNhdGNoKCBlICkge1xuICAvLyBhbHJlYWR5IGV4aXN0c1xufVxuXG4vLyBMb2cgdG8gcGVyZW5uaWFsLWFsaWFzIGlmIHJ1bm5pbmcgYSBwZXJlbm5pYWwtYWxpYXMgdGFzaywgb3IgcGVyZW5uaWFsIGlmIHJ1bm5pbmcgYSBwZXJlbm5pYWwgdGFzay5cbmNvbnN0IGxvZ1BhdGggPSBwYXRoLnJlc29sdmUoIGxvZ0RpciwgJ3BoZXQtdGltaW5nLWxvZy50eHQnICk7XG5cbi8vIFdyaXRlU3RyZWFtIGZvciBhcHBlbmRpbmcgZGF0YS4gIENyZWF0ZWQgbGF6aWx5LiAgQ2xvc2VkIG9uIGVhY2ggdG9wLWxldmVsIHBvcCBzbyB3ZSBjYW4gZ3VhcmFudGVlIGZsdXNoLlxubGV0IHN0cmVhbSA9IG51bGw7XG5cbi8vIERlcHRoIG9mIG5lc3RpbmcuICAtMSBtZWFucyBub3QgeWV0IHN0YXJ0ZWQuICAwIG1lYW5zIHRvcC1sZXZlbC5cbmxldCBkZXB0aCA9IC0xO1xuXG5jb25zdCBpbmRlbnQgPSBkZXB0aCA9PiAnICAnLnJlcGVhdCggZGVwdGggKTtcblxuY29uc3QgZ2V0RGF0ZSA9ICgpID0+IG5ldyBEYXRlKCkudG9Mb2NhbGVTdHJpbmcoICdlbi1VUycsIHsgdGltZVpvbmU6ICdBbWVyaWNhL0RlbnZlcicgfSApO1xuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSB0YXNrTmFtZVxuICogQHBhcmFtIHt7ZGVwdGg6bnVtYmVyfX0gW29wdGlvbnNdXG4gKiBAcmV0dXJucyB7bnVtYmVyfSAtIHRpbWUgb2YgdGhlIHN0YXJ0XG4gKi9cbmNvbnN0IHB1c2ggPSAoIHRhc2tOYW1lLCBvcHRpb25zID0gbnVsbCApID0+IHtcbiAgYXNzZXJ0KCAhdGFza05hbWUuaW5jbHVkZXMoICc6JyApLCAndGFzayBuYW1lIGNhbm5vdCBpbmNsdWRlIDosIGl0IHdhcyAnICsgdGFza05hbWUgKTtcblxuICBkZXB0aCsrO1xuXG4gIGlmICggc3RyZWFtID09PSBudWxsICkge1xuICAgIHN0cmVhbSA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKCBsb2dQYXRoLCB7IGZsYWdzOiAnYScgfSApO1xuICB9XG5cbiAgLy8gb25seSB3cml0ZSBhIHN0YXJ0IHRhZyBmb3IgZGVwdGggb2YgMCwgbmVzdGVkIGNvbnRlbnQgaXMganVzdCBwcmludGVkIHVwb24gY29tcGxldGlvblxuICBpZiAoIGRlcHRoID09PSAwICkge1xuXG4gICAgY29uc3QgaW5kZW50U3BhY2UgPSBpbmRlbnQoIG9wdGlvbnMgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggJ2RlcHRoJyApID8gb3B0aW9ucy5kZXB0aCA6IGRlcHRoICk7XG5cbiAgICAvLyBBZGQgZGF0ZSBhdHRyaWJ1dGUgdG8gYWxsIHRoYXQgYXJlIGluIGRlcHRoIDBcbiAgICBzdHJlYW0ud3JpdGUoIGAke2luZGVudFNwYWNlfTwke3Rhc2tOYW1lfSBkYXRlPVwiJHtnZXREYXRlKCl9XCI+XFxuYCApO1xuICB9XG5cbiAgcmV0dXJuIERhdGUubm93KCk7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSB0YXNrTmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IHN0YXJ0VGltZVxuICogQHBhcmFtIHt7ZGVwdGg6bnVtYmVyfX0gW29wdGlvbnNdXG4gKi9cbmNvbnN0IHBvcCA9ICggdGFza05hbWUsIHN0YXJ0VGltZSwgb3B0aW9ucyA9IG51bGwgKSA9PiB7XG4gIGNvbnN0IGVuZFRpbWUgPSBEYXRlLm5vdygpO1xuXG4gIGNvbnN0IGlzVG9wTGV2ZWwgPSBkZXB0aCA9PT0gMDtcblxuICBjb25zdCBpbmRlbnRTcGFjaW5nID0gaW5kZW50KCBvcHRpb25zICYmIG9wdGlvbnMuaGFzT3duUHJvcGVydHkoICdkZXB0aCcgKSA/IG9wdGlvbnMuZGVwdGggOiBkZXB0aCApO1xuICBjb25zdCBzdGFydFNsYXNoID0gaXNUb3BMZXZlbCA/ICcvJyA6ICcnOyAvLyBlbmQgdGFnIGZvciBkZXB0aCAwXG4gIGNvbnN0IGVuZFNsYXNoID0gaXNUb3BMZXZlbCA/ICcnIDogJy8nOyAvLyB0YWcgaXMgYSBzb2xvIHRhZyB3aGVuIGRlcHRoIGlzIG5vdCAwXG4gIHN0cmVhbS53cml0ZSggYCR7aW5kZW50U3BhY2luZ308JHtzdGFydFNsYXNofSR7dGFza05hbWV9IHRpbWU9XCIke2VuZFRpbWUgLSBzdGFydFRpbWV9bXNcIiR7ZW5kU2xhc2h9PlxcbmAgKTtcblxuICBpZiAoIGlzVG9wTGV2ZWwgKSB7XG4gICAgc3RyZWFtLndyaXRlKCAnXFxuJywgKCkgPT4ge1xuXG4gICAgICAvLyBHdWFyYW50ZWVkIGZsdXNoaW5nIHRoZSBidWZmZXIuICBXaXRob3V0IHRoaXMsIHdlIGVuZCB1cCB3aXRoIHBhcnRpYWwvdHJ1bmNhdGVkIG91dHB1dC5cbiAgICAgIHN0cmVhbS5jbG9zZSggKCkgPT4ge1xuXG4gICAgICAgIC8vIEZsYWcgdGhlIHN0cmVhbSBhcyBuZWVkaW5nIHRvIGJlIHJlY3JlYXRlZCBuZXh0IHRpbWUgd2Ugd2FudCB0byB3cml0ZSB0byB0aGUgYnVmZmVyXG4gICAgICAgIHN0cmVhbSA9IG51bGw7XG4gICAgICB9ICk7XG4gICAgfSApO1xuICB9XG5cbiAgZGVwdGgtLTtcbn07XG5cbmNvbnN0IHBoZXRUaW1pbmdMb2cgPSB7XG5cbiAgLyoqXG4gICAqIEludm9rZSB0aGUgdGFzayBhbmQgcmV0dXJuIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIHRhc2suXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YXNrTmFtZVxuICAgKiBAcGFyYW0geygpPT5UfSB0YXNrXG4gICAqIEByZXR1cm5zIHtUfVxuICAgKi9cbiAgc3RhcnQoIHRhc2tOYW1lLCB0YXNrICkge1xuICAgIGNvbnN0IHN0YXJ0VGltZSA9IHB1c2goIHRhc2tOYW1lICk7XG4gICAgY29uc3QgcmVzdWx0ID0gdGFzaygpO1xuICAgIHBvcCggdGFza05hbWUsIHN0YXJ0VGltZSApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEludm9rZSB0aGUgdGFzayBhbmQgcmV0dXJuIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIHRhc2suXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YXNrTmFtZVxuICAgKiBAcGFyYW0geygpPT5Qcm9taXNlPFQ+fSB0YXNrXG4gICAqIEBwYXJhbSBbb3B0aW9uc11cbiAgICogQHJldHVybnMge1Byb21pc2U8VD59XG4gICAqL1xuICBhc3luYyBzdGFydEFzeW5jKCB0YXNrTmFtZSwgdGFzaywgb3B0aW9ucyApIHtcbiAgICBjb25zdCBzdGFydFRpbWUgPSBwdXNoKCB0YXNrTmFtZSwgb3B0aW9ucyApO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRhc2soKTtcbiAgICBwb3AoIHRhc2tOYW1lLCBzdGFydFRpbWUsIG9wdGlvbnMgKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuXG4gIC8qKlxuICAgKiBGbHVzaCB0aGUgd3JpdGUgc3RyZWFtIGJlZm9yZSBleGl0aW5nIG5vZGUuXG4gICAqIEBwYXJhbSB7KCk9PnZvaWR9IFtjYWxsYmFja11cbiAgICovXG4gIGNsb3NlKCBjYWxsYmFjayA9ICgpID0+IHt9ICkge1xuICAgIHN0cmVhbS5jbG9zZSggY2FsbGJhY2sgKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBwaGV0VGltaW5nTG9nOyJdLCJuYW1lcyI6WyJwYXRoIiwicmVxdWlyZSIsImZzIiwiYXNzZXJ0IiwibG9nRGlyIiwicmVzb2x2ZSIsIl9fZGlybmFtZSIsIm1rZGlyU3luYyIsImUiLCJsb2dQYXRoIiwic3RyZWFtIiwiZGVwdGgiLCJpbmRlbnQiLCJyZXBlYXQiLCJnZXREYXRlIiwiRGF0ZSIsInRvTG9jYWxlU3RyaW5nIiwidGltZVpvbmUiLCJwdXNoIiwidGFza05hbWUiLCJvcHRpb25zIiwiaW5jbHVkZXMiLCJjcmVhdGVXcml0ZVN0cmVhbSIsImZsYWdzIiwiaW5kZW50U3BhY2UiLCJoYXNPd25Qcm9wZXJ0eSIsIndyaXRlIiwibm93IiwicG9wIiwic3RhcnRUaW1lIiwiZW5kVGltZSIsImlzVG9wTGV2ZWwiLCJpbmRlbnRTcGFjaW5nIiwic3RhcnRTbGFzaCIsImVuZFNsYXNoIiwiY2xvc2UiLCJwaGV0VGltaW5nTG9nIiwic3RhcnQiLCJ0YXNrIiwicmVzdWx0Iiwic3RhcnRBc3luYyIsImNhbGxiYWNrIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F3QkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsT0FBT0MsUUFBUztBQUN0QixNQUFNQyxLQUFLRCxRQUFTO0FBQ3BCLE1BQU1FLFNBQVNGLFFBQVM7QUFFeEIsTUFBTUcsU0FBU0osS0FBS0ssT0FBTyxDQUFFQyxXQUFXO0FBQ3hDLElBQUk7SUFDRkosR0FBR0ssU0FBUyxDQUFFSDtBQUNoQixFQUNBLE9BQU9JLEdBQUk7QUFDVCxpQkFBaUI7QUFDbkI7QUFFQSxzR0FBc0c7QUFDdEcsTUFBTUMsVUFBVVQsS0FBS0ssT0FBTyxDQUFFRCxRQUFRO0FBRXRDLDRHQUE0RztBQUM1RyxJQUFJTSxTQUFTO0FBRWIsbUVBQW1FO0FBQ25FLElBQUlDLFFBQVEsQ0FBQztBQUViLE1BQU1DLFNBQVNELENBQUFBLFFBQVMsS0FBS0UsTUFBTSxDQUFFRjtBQUVyQyxNQUFNRyxVQUFVLElBQU0sSUFBSUMsT0FBT0MsY0FBYyxDQUFFLFNBQVM7UUFBRUMsVUFBVTtJQUFpQjtBQUV2Rjs7OztDQUlDLEdBQ0QsTUFBTUMsT0FBTyxDQUFFQyxVQUFVQyxVQUFVLElBQUk7SUFDckNqQixPQUFRLENBQUNnQixTQUFTRSxRQUFRLENBQUUsTUFBTyx3Q0FBd0NGO0lBRTNFUjtJQUVBLElBQUtELFdBQVcsTUFBTztRQUNyQkEsU0FBU1IsR0FBR29CLGlCQUFpQixDQUFFYixTQUFTO1lBQUVjLE9BQU87UUFBSTtJQUN2RDtJQUVBLHdGQUF3RjtJQUN4RixJQUFLWixVQUFVLEdBQUk7UUFFakIsTUFBTWEsY0FBY1osT0FBUVEsV0FBV0EsUUFBUUssY0FBYyxDQUFFLFdBQVlMLFFBQVFULEtBQUssR0FBR0E7UUFFM0YsZ0RBQWdEO1FBQ2hERCxPQUFPZ0IsS0FBSyxDQUFFLEdBQUdGLFlBQVksQ0FBQyxFQUFFTCxTQUFTLE9BQU8sRUFBRUwsVUFBVSxJQUFJLENBQUM7SUFDbkU7SUFFQSxPQUFPQyxLQUFLWSxHQUFHO0FBQ2pCO0FBRUE7Ozs7Q0FJQyxHQUNELE1BQU1DLE1BQU0sQ0FBRVQsVUFBVVUsV0FBV1QsVUFBVSxJQUFJO0lBQy9DLE1BQU1VLFVBQVVmLEtBQUtZLEdBQUc7SUFFeEIsTUFBTUksYUFBYXBCLFVBQVU7SUFFN0IsTUFBTXFCLGdCQUFnQnBCLE9BQVFRLFdBQVdBLFFBQVFLLGNBQWMsQ0FBRSxXQUFZTCxRQUFRVCxLQUFLLEdBQUdBO0lBQzdGLE1BQU1zQixhQUFhRixhQUFhLE1BQU0sSUFBSSxzQkFBc0I7SUFDaEUsTUFBTUcsV0FBV0gsYUFBYSxLQUFLLEtBQUssd0NBQXdDO0lBQ2hGckIsT0FBT2dCLEtBQUssQ0FBRSxHQUFHTSxjQUFjLENBQUMsRUFBRUMsYUFBYWQsU0FBUyxPQUFPLEVBQUVXLFVBQVVELFVBQVUsR0FBRyxFQUFFSyxTQUFTLEdBQUcsQ0FBQztJQUV2RyxJQUFLSCxZQUFhO1FBQ2hCckIsT0FBT2dCLEtBQUssQ0FBRSxNQUFNO1lBRWxCLDBGQUEwRjtZQUMxRmhCLE9BQU95QixLQUFLLENBQUU7Z0JBRVosc0ZBQXNGO2dCQUN0RnpCLFNBQVM7WUFDWDtRQUNGO0lBQ0Y7SUFFQUM7QUFDRjtBQUVBLE1BQU15QixnQkFBZ0I7SUFFcEI7Ozs7O0dBS0MsR0FDREMsT0FBT2xCLFFBQVEsRUFBRW1CLElBQUk7UUFDbkIsTUFBTVQsWUFBWVgsS0FBTUM7UUFDeEIsTUFBTW9CLFNBQVNEO1FBQ2ZWLElBQUtULFVBQVVVO1FBQ2YsT0FBT1U7SUFDVDtJQUVBOzs7Ozs7R0FNQyxHQUNELEFBQU1DLFlBQVlyQixRQUFRLEVBQUVtQixJQUFJLEVBQUVsQixPQUFPO2VBQUcsb0JBQUE7WUFDMUMsTUFBTVMsWUFBWVgsS0FBTUMsVUFBVUM7WUFDbEMsTUFBTW1CLFNBQVMsTUFBTUQ7WUFDckJWLElBQUtULFVBQVVVLFdBQVdUO1lBQzFCLE9BQU9tQjtRQUNUOztJQUVBOzs7R0FHQyxHQUNESixPQUFPTSxXQUFXLEtBQU8sQ0FBQztRQUN4Qi9CLE9BQU95QixLQUFLLENBQUVNO0lBQ2hCO0FBQ0Y7QUFFQUMsT0FBT0MsT0FBTyxHQUFHUCJ9