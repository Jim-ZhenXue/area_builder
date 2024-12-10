/*! qHint 1.1 | http://gyoshev.mit-license.org */ (function() {
    var qHint = window.jsHintTest = window.qHint = function qHint(name, sourceFile, options, globals) {
        if (sourceFile === undefined || typeof sourceFile == "object") {
            // jsHintTest('file.js', [options])
            globals = options;
            options = sourceFile;
            sourceFile = name;
        }
        return asyncTest(name, function() {
            qHint.sendRequest(sourceFile, function(req) {
                start();
                if (req.status == 200) {
                    qHint.validateFile(req.responseText, options, globals);
                } else {
                    ok(false, "HTTP error " + req.status + " while fetching " + sourceFile);
                }
            });
        });
    };
    qHint.validateFile = function(source, options, globals) {
        var i, len, err;
        if (JSHINT(source, options, globals)) {
            ok(true);
            return;
        }
        for(i = 0, len = JSHINT.errors.length; i < len; i++){
            err = JSHINT.errors[i];
            if (!err) {
                continue;
            }
            ok(false, err.reason + " on line " + err.line + ", character " + err.character);
        }
    };
    var XMLHttpFactories = [
        function() {
            return new XMLHttpRequest();
        },
        function() {
            return new ActiveXObject("Msxml2.XMLHTTP");
        },
        function() {
            return new ActiveXObject("Msxml3.XMLHTTP");
        },
        function() {
            return new ActiveXObject("Microsoft.XMLHTTP");
        }
    ];
    function createXMLHTTPObject() {
        for(var i = 0; i < XMLHttpFactories.length; i++){
            try {
                return XMLHttpFactories[i]();
            } catch (e) {}
        }
        return false;
    }
    // modified version of XHR script by PPK
    // http://www.quirksmode.org/js/xmlhttp.html
    // attached to qHint to allow substitution / mocking
    qHint.sendRequest = function(url, callback) {
        var req = createXMLHTTPObject();
        if (!req) {
            return;
        }
        var method = "GET";
        req.open(method, url, true);
        req.onreadystatechange = function() {
            if (req.readyState != 4) {
                return;
            }
            callback(req);
        };
        if (req.readyState == 4) {
            return;
        }
        req.send();
    };
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvcWhpbnQtMS4xLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qISBxSGludCAxLjEgfCBodHRwOi8vZ3lvc2hldi5taXQtbGljZW5zZS5vcmcgKi9cbihmdW5jdGlvbigpIHtcbiAgICB2YXIgcUhpbnQgPVxuICAgICAgICB3aW5kb3cuanNIaW50VGVzdCA9XG4gICAgICAgIHdpbmRvdy5xSGludCA9XG4gICAgICAgICAgICBmdW5jdGlvbiBxSGludChuYW1lLCBzb3VyY2VGaWxlLCBvcHRpb25zLCBnbG9iYWxzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNvdXJjZUZpbGUgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2Yoc291cmNlRmlsZSkgPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgICAgICAvLyBqc0hpbnRUZXN0KCdmaWxlLmpzJywgW29wdGlvbnNdKVxuICAgICAgICAgICAgICAgICAgICBnbG9iYWxzID0gb3B0aW9ucztcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucyA9IHNvdXJjZUZpbGU7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZUZpbGUgPSBuYW1lO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBhc3luY1Rlc3QobmFtZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHFIaW50LnNlbmRSZXF1ZXN0KHNvdXJjZUZpbGUsIGZ1bmN0aW9uKHJlcSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlcS5zdGF0dXMgPT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcUhpbnQudmFsaWRhdGVGaWxlKHJlcS5yZXNwb25zZVRleHQsIG9wdGlvbnMsIGdsb2JhbHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvayhmYWxzZSwgXCJIVFRQIGVycm9yIFwiICsgcmVxLnN0YXR1cyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiIHdoaWxlIGZldGNoaW5nIFwiICsgc291cmNlRmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgIHFIaW50LnZhbGlkYXRlRmlsZSA9IGZ1bmN0aW9uIChzb3VyY2UsIG9wdGlvbnMsIGdsb2JhbHMpIHtcbiAgICAgICAgdmFyIGksIGxlbiwgZXJyO1xuXG4gICAgICAgIGlmIChKU0hJTlQoc291cmNlLCBvcHRpb25zLCBnbG9iYWxzKSkge1xuICAgICAgICAgICAgb2sodHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGkgPSAwLCBsZW4gPSBKU0hJTlQuZXJyb3JzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBlcnIgPSBKU0hJTlQuZXJyb3JzW2ldO1xuICAgICAgICAgICAgaWYgKCFlcnIpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb2soZmFsc2UsIGVyci5yZWFzb24gK1xuICAgICAgICAgICAgICAgIFwiIG9uIGxpbmUgXCIgKyBlcnIubGluZSArXG4gICAgICAgICAgICAgICAgXCIsIGNoYXJhY3RlciBcIiArIGVyci5jaGFyYWN0ZXIpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBYTUxIdHRwRmFjdG9yaWVzID0gW1xuICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBuZXcgWE1MSHR0cFJlcXVlc3QoKTsgfSxcbiAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoXCJNc3htbDIuWE1MSFRUUFwiKTsgfSxcbiAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoXCJNc3htbDMuWE1MSFRUUFwiKTsgfSxcbiAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoXCJNaWNyb3NvZnQuWE1MSFRUUFwiKTsgfVxuICAgIF07XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVYTUxIVFRQT2JqZWN0KCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IFhNTEh0dHBGYWN0b3JpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFhNTEh0dHBGYWN0b3JpZXNbaV0oKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIG1vZGlmaWVkIHZlcnNpb24gb2YgWEhSIHNjcmlwdCBieSBQUEtcbiAgICAvLyBodHRwOi8vd3d3LnF1aXJrc21vZGUub3JnL2pzL3htbGh0dHAuaHRtbFxuICAgIC8vIGF0dGFjaGVkIHRvIHFIaW50IHRvIGFsbG93IHN1YnN0aXR1dGlvbiAvIG1vY2tpbmdcbiAgICBxSGludC5zZW5kUmVxdWVzdCA9IGZ1bmN0aW9uICh1cmwsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByZXEgPSBjcmVhdGVYTUxIVFRQT2JqZWN0KCk7XG4gICAgICAgIGlmICghcmVxKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbWV0aG9kID0gXCJHRVRcIjtcbiAgICAgICAgcmVxLm9wZW4obWV0aG9kLHVybCx0cnVlKTtcbiAgICAgICAgcmVxLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChyZXEucmVhZHlTdGF0ZSAhPSA0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYWxsYmFjayhyZXEpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChyZXEucmVhZHlTdGF0ZSA9PSA0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmVxLnNlbmQoKTtcbiAgICB9O1xufSkoKTtcbiJdLCJuYW1lcyI6WyJxSGludCIsIndpbmRvdyIsImpzSGludFRlc3QiLCJuYW1lIiwic291cmNlRmlsZSIsIm9wdGlvbnMiLCJnbG9iYWxzIiwidW5kZWZpbmVkIiwiYXN5bmNUZXN0Iiwic2VuZFJlcXVlc3QiLCJyZXEiLCJzdGFydCIsInN0YXR1cyIsInZhbGlkYXRlRmlsZSIsInJlc3BvbnNlVGV4dCIsIm9rIiwic291cmNlIiwiaSIsImxlbiIsImVyciIsIkpTSElOVCIsImVycm9ycyIsImxlbmd0aCIsInJlYXNvbiIsImxpbmUiLCJjaGFyYWN0ZXIiLCJYTUxIdHRwRmFjdG9yaWVzIiwiWE1MSHR0cFJlcXVlc3QiLCJBY3RpdmVYT2JqZWN0IiwiY3JlYXRlWE1MSFRUUE9iamVjdCIsImUiLCJ1cmwiLCJjYWxsYmFjayIsIm1ldGhvZCIsIm9wZW4iLCJvbnJlYWR5c3RhdGVjaGFuZ2UiLCJyZWFkeVN0YXRlIiwic2VuZCJdLCJtYXBwaW5ncyI6IkFBQUEsK0NBQStDLEdBQzlDLENBQUE7SUFDRyxJQUFJQSxRQUNBQyxPQUFPQyxVQUFVLEdBQ2pCRCxPQUFPRCxLQUFLLEdBQ1IsU0FBU0EsTUFBTUcsSUFBSSxFQUFFQyxVQUFVLEVBQUVDLE9BQU8sRUFBRUMsT0FBTztRQUM3QyxJQUFJRixlQUFlRyxhQUFhLE9BQU9ILGNBQWUsVUFBVTtZQUM1RCxtQ0FBbUM7WUFDbkNFLFVBQVVEO1lBQ1ZBLFVBQVVEO1lBQ1ZBLGFBQWFEO1FBQ2pCO1FBRUEsT0FBT0ssVUFBVUwsTUFBTTtZQUNuQkgsTUFBTVMsV0FBVyxDQUFDTCxZQUFZLFNBQVNNLEdBQUc7Z0JBQ3RDQztnQkFFQSxJQUFJRCxJQUFJRSxNQUFNLElBQUksS0FBSztvQkFDbkJaLE1BQU1hLFlBQVksQ0FBQ0gsSUFBSUksWUFBWSxFQUFFVCxTQUFTQztnQkFDbEQsT0FBTztvQkFDSFMsR0FBRyxPQUFPLGdCQUFnQkwsSUFBSUUsTUFBTSxHQUMxQixxQkFBcUJSO2dCQUNuQztZQUNKO1FBQ0o7SUFDSjtJQUVSSixNQUFNYSxZQUFZLEdBQUcsU0FBVUcsTUFBTSxFQUFFWCxPQUFPLEVBQUVDLE9BQU87UUFDbkQsSUFBSVcsR0FBR0MsS0FBS0M7UUFFWixJQUFJQyxPQUFPSixRQUFRWCxTQUFTQyxVQUFVO1lBQ2xDUyxHQUFHO1lBQ0g7UUFDSjtRQUVBLElBQUtFLElBQUksR0FBR0MsTUFBTUUsT0FBT0MsTUFBTSxDQUFDQyxNQUFNLEVBQUVMLElBQUlDLEtBQUtELElBQUs7WUFDbERFLE1BQU1DLE9BQU9DLE1BQU0sQ0FBQ0osRUFBRTtZQUN0QixJQUFJLENBQUNFLEtBQUs7Z0JBQ047WUFDSjtZQUVBSixHQUFHLE9BQU9JLElBQUlJLE1BQU0sR0FDaEIsY0FBY0osSUFBSUssSUFBSSxHQUN0QixpQkFBaUJMLElBQUlNLFNBQVM7UUFDdEM7SUFDSjtJQUVBLElBQUlDLG1CQUFtQjtRQUNuQjtZQUFjLE9BQU8sSUFBSUM7UUFBa0I7UUFDM0M7WUFBYyxPQUFPLElBQUlDLGNBQWM7UUFBbUI7UUFDMUQ7WUFBYyxPQUFPLElBQUlBLGNBQWM7UUFBbUI7UUFDMUQ7WUFBYyxPQUFPLElBQUlBLGNBQWM7UUFBc0I7S0FDaEU7SUFFRCxTQUFTQztRQUNMLElBQUssSUFBSVosSUFBSSxHQUFHQSxJQUFJUyxpQkFBaUJKLE1BQU0sRUFBRUwsSUFBSztZQUM5QyxJQUFJO2dCQUNBLE9BQU9TLGdCQUFnQixDQUFDVCxFQUFFO1lBQzlCLEVBQUUsT0FBT2EsR0FBRyxDQUFDO1FBQ2pCO1FBQ0EsT0FBTztJQUNYO0lBRUEsd0NBQXdDO0lBQ3hDLDRDQUE0QztJQUM1QyxvREFBb0Q7SUFDcEQ5QixNQUFNUyxXQUFXLEdBQUcsU0FBVXNCLEdBQUcsRUFBRUMsUUFBUTtRQUN2QyxJQUFJdEIsTUFBTW1CO1FBQ1YsSUFBSSxDQUFDbkIsS0FBSztZQUNOO1FBQ0o7UUFFQSxJQUFJdUIsU0FBUztRQUNidkIsSUFBSXdCLElBQUksQ0FBQ0QsUUFBT0YsS0FBSTtRQUNwQnJCLElBQUl5QixrQkFBa0IsR0FBRztZQUNyQixJQUFJekIsSUFBSTBCLFVBQVUsSUFBSSxHQUFHO2dCQUNyQjtZQUNKO1lBRUFKLFNBQVN0QjtRQUNiO1FBRUEsSUFBSUEsSUFBSTBCLFVBQVUsSUFBSSxHQUFHO1lBQ3JCO1FBQ0o7UUFDQTFCLElBQUkyQixJQUFJO0lBQ1o7QUFDSixDQUFBIn0=