function TextEncoderLite() {}
function TextDecoderLite() {}
(function() {
    'use strict';
    // Taken from https://github.com/feross/buffer/blob/master/index.js
    // Thanks Feross et al! :-)
    function utf8ToBytes(string, units) {
        units = units || Infinity;
        var codePoint;
        var length = string.length;
        var leadSurrogate = null;
        var bytes = [];
        var i = 0;
        for(; i < length; i++){
            codePoint = string.charCodeAt(i);
            // is surrogate component
            if (codePoint > 0xD7FF && codePoint < 0xE000) {
                // last char was a lead
                if (leadSurrogate) {
                    // 2 leads in a row
                    if (codePoint < 0xDC00) {
                        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                        leadSurrogate = codePoint;
                        continue;
                    } else {
                        // valid surrogate pair
                        codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000;
                        leadSurrogate = null;
                    }
                } else {
                    // no lead yet
                    if (codePoint > 0xDBFF) {
                        // unexpected trail
                        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                        continue;
                    } else if (i + 1 === length) {
                        // unpaired lead
                        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                        continue;
                    } else {
                        // valid lead
                        leadSurrogate = codePoint;
                        continue;
                    }
                }
            } else if (leadSurrogate) {
                // valid bmp char, but last char was a lead
                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                leadSurrogate = null;
            }
            // encode utf8
            if (codePoint < 0x80) {
                if ((units -= 1) < 0) break;
                bytes.push(codePoint);
            } else if (codePoint < 0x800) {
                if ((units -= 2) < 0) break;
                bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
            } else if (codePoint < 0x10000) {
                if ((units -= 3) < 0) break;
                bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
            } else if (codePoint < 0x200000) {
                if ((units -= 4) < 0) break;
                bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
            } else {
                throw new Error('Invalid code point');
            }
        }
        return bytes;
    }
    function utf8Slice(buf, start, end) {
        var res = '';
        var tmp = '';
        end = Math.min(buf.length, end || Infinity);
        start = start || 0;
        for(var i = start; i < end; i++){
            if (buf[i] <= 0x7F) {
                res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i]);
                tmp = '';
            } else {
                tmp += '%' + buf[i].toString(16);
            }
        }
        return res + decodeUtf8Char(tmp);
    }
    function decodeUtf8Char(str) {
        try {
            return decodeURIComponent(str);
        } catch (err) {
            return String.fromCharCode(0xFFFD) // UTF 8 invalid char
            ;
        }
    }
    TextEncoderLite.prototype.encode = function(str) {
        var result;
        if ('undefined' === typeof Uint8Array) {
            result = utf8ToBytes(str);
        } else {
            result = new Uint8Array(utf8ToBytes(str));
        }
        return result;
    };
    TextDecoderLite.prototype.decode = function(bytes) {
        return utf8Slice(bytes, 0, bytes.length);
    };
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvVGV4dEVuY29kZXJMaXRlLTNjOWY2ZjAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gVGV4dEVuY29kZXJMaXRlKCkge1xufVxuZnVuY3Rpb24gVGV4dERlY29kZXJMaXRlKCkge1xufVxuXG4oZnVuY3Rpb24gKCkge1xuJ3VzZSBzdHJpY3QnO1xuXG4vLyBUYWtlbiBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL2Jsb2IvbWFzdGVyL2luZGV4LmpzXG4vLyBUaGFua3MgRmVyb3NzIGV0IGFsISA6LSlcblxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMgKHN0cmluZywgdW5pdHMpIHtcbiAgdW5pdHMgPSB1bml0cyB8fCBJbmZpbml0eVxuICB2YXIgY29kZVBvaW50XG4gIHZhciBsZW5ndGggPSBzdHJpbmcubGVuZ3RoXG4gIHZhciBsZWFkU3Vycm9nYXRlID0gbnVsbFxuICB2YXIgYnl0ZXMgPSBbXVxuICB2YXIgaSA9IDBcblxuICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgY29kZVBvaW50ID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcblxuICAgIC8vIGlzIHN1cnJvZ2F0ZSBjb21wb25lbnRcbiAgICBpZiAoY29kZVBvaW50ID4gMHhEN0ZGICYmIGNvZGVQb2ludCA8IDB4RTAwMCkge1xuICAgICAgLy8gbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmIChsZWFkU3Vycm9nYXRlKSB7XG4gICAgICAgIC8vIDIgbGVhZHMgaW4gYSByb3dcbiAgICAgICAgaWYgKGNvZGVQb2ludCA8IDB4REMwMCkge1xuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHZhbGlkIHN1cnJvZ2F0ZSBwYWlyXG4gICAgICAgICAgY29kZVBvaW50ID0gbGVhZFN1cnJvZ2F0ZSAtIDB4RDgwMCA8PCAxMCB8IGNvZGVQb2ludCAtIDB4REMwMCB8IDB4MTAwMDBcbiAgICAgICAgICBsZWFkU3Vycm9nYXRlID0gbnVsbFxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBubyBsZWFkIHlldFxuXG4gICAgICAgIGlmIChjb2RlUG9pbnQgPiAweERCRkYpIHtcbiAgICAgICAgICAvLyB1bmV4cGVjdGVkIHRyYWlsXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfSBlbHNlIGlmIChpICsgMSA9PT0gbGVuZ3RoKSB7XG4gICAgICAgICAgLy8gdW5wYWlyZWQgbGVhZFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gdmFsaWQgbGVhZFxuICAgICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChsZWFkU3Vycm9nYXRlKSB7XG4gICAgICAvLyB2YWxpZCBibXAgY2hhciwgYnV0IGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgIGxlYWRTdXJyb2dhdGUgPSBudWxsXG4gICAgfVxuXG4gICAgLy8gZW5jb2RlIHV0ZjhcbiAgICBpZiAoY29kZVBvaW50IDwgMHg4MCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAxKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKGNvZGVQb2ludClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4ODAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDIpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgfCAweEMwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHgxMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAzKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHhDIHwgMHhFMCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHgyMDAwMDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gNCkgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4MTIgfCAweEYwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHhDICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNvZGUgcG9pbnQnKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBieXRlc1xufVxuXG5mdW5jdGlvbiB1dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmVzID0gJydcbiAgdmFyIHRtcCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZCB8fCBJbmZpbml0eSlcbiAgc3RhcnQgPSBzdGFydCB8fCAwO1xuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgaWYgKGJ1ZltpXSA8PSAweDdGKSB7XG4gICAgICByZXMgKz0gZGVjb2RlVXRmOENoYXIodG1wKSArIFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICAgICAgdG1wID0gJydcbiAgICB9IGVsc2Uge1xuICAgICAgdG1wICs9ICclJyArIGJ1ZltpXS50b1N0cmluZygxNilcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzICsgZGVjb2RlVXRmOENoYXIodG1wKVxufVxuXG5mdW5jdGlvbiBkZWNvZGVVdGY4Q2hhciAoc3RyKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHIpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RkZGRCkgLy8gVVRGIDggaW52YWxpZCBjaGFyXG4gIH1cbn1cblxuVGV4dEVuY29kZXJMaXRlLnByb3RvdHlwZS5lbmNvZGUgPSBmdW5jdGlvbiAoc3RyKSB7XG4gIHZhciByZXN1bHQ7XG5cbiAgaWYgKCd1bmRlZmluZWQnID09PSB0eXBlb2YgVWludDhBcnJheSkge1xuICAgIHJlc3VsdCA9IHV0ZjhUb0J5dGVzKHN0cik7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gbmV3IFVpbnQ4QXJyYXkodXRmOFRvQnl0ZXMoc3RyKSk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuVGV4dERlY29kZXJMaXRlLnByb3RvdHlwZS5kZWNvZGUgPSBmdW5jdGlvbiAoYnl0ZXMpIHtcbiAgcmV0dXJuIHV0ZjhTbGljZShieXRlcywgMCwgYnl0ZXMubGVuZ3RoKTtcbn1cblxufSgpKTsiXSwibmFtZXMiOlsiVGV4dEVuY29kZXJMaXRlIiwiVGV4dERlY29kZXJMaXRlIiwidXRmOFRvQnl0ZXMiLCJzdHJpbmciLCJ1bml0cyIsIkluZmluaXR5IiwiY29kZVBvaW50IiwibGVuZ3RoIiwibGVhZFN1cnJvZ2F0ZSIsImJ5dGVzIiwiaSIsImNoYXJDb2RlQXQiLCJwdXNoIiwiRXJyb3IiLCJ1dGY4U2xpY2UiLCJidWYiLCJzdGFydCIsImVuZCIsInJlcyIsInRtcCIsIk1hdGgiLCJtaW4iLCJkZWNvZGVVdGY4Q2hhciIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsInRvU3RyaW5nIiwic3RyIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwiZXJyIiwicHJvdG90eXBlIiwiZW5jb2RlIiwicmVzdWx0IiwiVWludDhBcnJheSIsImRlY29kZSJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsbUJBQ1Q7QUFDQSxTQUFTQyxtQkFDVDtBQUVDLENBQUE7SUFDRDtJQUVBLG1FQUFtRTtJQUNuRSwyQkFBMkI7SUFFM0IsU0FBU0MsWUFBYUMsTUFBTSxFQUFFQyxLQUFLO1FBQ2pDQSxRQUFRQSxTQUFTQztRQUNqQixJQUFJQztRQUNKLElBQUlDLFNBQVNKLE9BQU9JLE1BQU07UUFDMUIsSUFBSUMsZ0JBQWdCO1FBQ3BCLElBQUlDLFFBQVEsRUFBRTtRQUNkLElBQUlDLElBQUk7UUFFUixNQUFPQSxJQUFJSCxRQUFRRyxJQUFLO1lBQ3RCSixZQUFZSCxPQUFPUSxVQUFVLENBQUNEO1lBRTlCLHlCQUF5QjtZQUN6QixJQUFJSixZQUFZLFVBQVVBLFlBQVksUUFBUTtnQkFDNUMsdUJBQXVCO2dCQUN2QixJQUFJRSxlQUFlO29CQUNqQixtQkFBbUI7b0JBQ25CLElBQUlGLFlBQVksUUFBUTt3QkFDdEIsSUFBSSxBQUFDRixDQUFBQSxTQUFTLENBQUEsSUFBSyxDQUFDLEdBQUdLLE1BQU1HLElBQUksQ0FBQyxNQUFNLE1BQU07d0JBQzlDSixnQkFBZ0JGO3dCQUNoQjtvQkFDRixPQUFPO3dCQUNMLHVCQUF1Qjt3QkFDdkJBLFlBQVlFLGdCQUFnQixVQUFVLEtBQUtGLFlBQVksU0FBUzt3QkFDaEVFLGdCQUFnQjtvQkFDbEI7Z0JBQ0YsT0FBTztvQkFDTCxjQUFjO29CQUVkLElBQUlGLFlBQVksUUFBUTt3QkFDdEIsbUJBQW1CO3dCQUNuQixJQUFJLEFBQUNGLENBQUFBLFNBQVMsQ0FBQSxJQUFLLENBQUMsR0FBR0ssTUFBTUcsSUFBSSxDQUFDLE1BQU0sTUFBTTt3QkFDOUM7b0JBQ0YsT0FBTyxJQUFJRixJQUFJLE1BQU1ILFFBQVE7d0JBQzNCLGdCQUFnQjt3QkFDaEIsSUFBSSxBQUFDSCxDQUFBQSxTQUFTLENBQUEsSUFBSyxDQUFDLEdBQUdLLE1BQU1HLElBQUksQ0FBQyxNQUFNLE1BQU07d0JBQzlDO29CQUNGLE9BQU87d0JBQ0wsYUFBYTt3QkFDYkosZ0JBQWdCRjt3QkFDaEI7b0JBQ0Y7Z0JBQ0Y7WUFDRixPQUFPLElBQUlFLGVBQWU7Z0JBQ3hCLDJDQUEyQztnQkFDM0MsSUFBSSxBQUFDSixDQUFBQSxTQUFTLENBQUEsSUFBSyxDQUFDLEdBQUdLLE1BQU1HLElBQUksQ0FBQyxNQUFNLE1BQU07Z0JBQzlDSixnQkFBZ0I7WUFDbEI7WUFFQSxjQUFjO1lBQ2QsSUFBSUYsWUFBWSxNQUFNO2dCQUNwQixJQUFJLEFBQUNGLENBQUFBLFNBQVMsQ0FBQSxJQUFLLEdBQUc7Z0JBQ3RCSyxNQUFNRyxJQUFJLENBQUNOO1lBQ2IsT0FBTyxJQUFJQSxZQUFZLE9BQU87Z0JBQzVCLElBQUksQUFBQ0YsQ0FBQUEsU0FBUyxDQUFBLElBQUssR0FBRztnQkFDdEJLLE1BQU1HLElBQUksQ0FDUk4sYUFBYSxNQUFNLE1BQ25CQSxZQUFZLE9BQU87WUFFdkIsT0FBTyxJQUFJQSxZQUFZLFNBQVM7Z0JBQzlCLElBQUksQUFBQ0YsQ0FBQUEsU0FBUyxDQUFBLElBQUssR0FBRztnQkFDdEJLLE1BQU1HLElBQUksQ0FDUk4sYUFBYSxNQUFNLE1BQ25CQSxhQUFhLE1BQU0sT0FBTyxNQUMxQkEsWUFBWSxPQUFPO1lBRXZCLE9BQU8sSUFBSUEsWUFBWSxVQUFVO2dCQUMvQixJQUFJLEFBQUNGLENBQUFBLFNBQVMsQ0FBQSxJQUFLLEdBQUc7Z0JBQ3RCSyxNQUFNRyxJQUFJLENBQ1JOLGFBQWEsT0FBTyxNQUNwQkEsYUFBYSxNQUFNLE9BQU8sTUFDMUJBLGFBQWEsTUFBTSxPQUFPLE1BQzFCQSxZQUFZLE9BQU87WUFFdkIsT0FBTztnQkFDTCxNQUFNLElBQUlPLE1BQU07WUFDbEI7UUFDRjtRQUVBLE9BQU9KO0lBQ1Q7SUFFQSxTQUFTSyxVQUFXQyxHQUFHLEVBQUVDLEtBQUssRUFBRUMsR0FBRztRQUNqQyxJQUFJQyxNQUFNO1FBQ1YsSUFBSUMsTUFBTTtRQUNWRixNQUFNRyxLQUFLQyxHQUFHLENBQUNOLElBQUlSLE1BQU0sRUFBRVUsT0FBT1o7UUFDbENXLFFBQVFBLFNBQVM7UUFFakIsSUFBSyxJQUFJTixJQUFJTSxPQUFPTixJQUFJTyxLQUFLUCxJQUFLO1lBQ2hDLElBQUlLLEdBQUcsQ0FBQ0wsRUFBRSxJQUFJLE1BQU07Z0JBQ2xCUSxPQUFPSSxlQUFlSCxPQUFPSSxPQUFPQyxZQUFZLENBQUNULEdBQUcsQ0FBQ0wsRUFBRTtnQkFDdkRTLE1BQU07WUFDUixPQUFPO2dCQUNMQSxPQUFPLE1BQU1KLEdBQUcsQ0FBQ0wsRUFBRSxDQUFDZSxRQUFRLENBQUM7WUFDL0I7UUFDRjtRQUVBLE9BQU9QLE1BQU1JLGVBQWVIO0lBQzlCO0lBRUEsU0FBU0csZUFBZ0JJLEdBQUc7UUFDMUIsSUFBSTtZQUNGLE9BQU9DLG1CQUFtQkQ7UUFDNUIsRUFBRSxPQUFPRSxLQUFLO1lBQ1osT0FBT0wsT0FBT0MsWUFBWSxDQUFDLFFBQVEscUJBQXFCOztRQUMxRDtJQUNGO0lBRUF4QixnQkFBZ0I2QixTQUFTLENBQUNDLE1BQU0sR0FBRyxTQUFVSixHQUFHO1FBQzlDLElBQUlLO1FBRUosSUFBSSxnQkFBZ0IsT0FBT0MsWUFBWTtZQUNyQ0QsU0FBUzdCLFlBQVl3QjtRQUN2QixPQUFPO1lBQ0xLLFNBQVMsSUFBSUMsV0FBVzlCLFlBQVl3QjtRQUN0QztRQUVBLE9BQU9LO0lBQ1Q7SUFFQTlCLGdCQUFnQjRCLFNBQVMsQ0FBQ0ksTUFBTSxHQUFHLFNBQVV4QixLQUFLO1FBQ2hELE9BQU9LLFVBQVVMLE9BQU8sR0FBR0EsTUFBTUYsTUFBTTtJQUN6QztBQUVBLENBQUEifQ==