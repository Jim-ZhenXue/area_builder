/**
 * @author sole / http://soledadpenades.com
 * @author mrdoob / http://mrdoob.com
 * @author Robert Eisele / http://www.xarg.org
 * @author Philippe / http://philippe.elsass.me
 * @author Robert Penner / http://www.robertpenner.com/easing_terms_of_use.html
 * @author Paul Lewis / http://www.aerotwist.com/
 * @author lechecacharro
 * @author Josh Faul / http://jocafa.com/
 * @author egraether / http://egraether.com/
 * @author endel / http://endel.me
 * @author Ben Delarre / http://delarre.net
 */ // Date.now shim for (ahem) Internet Explo(d|r)er
if (Date.now === undefined) {
    Date.now = function() {
        return new Date().valueOf();
    };
}
var TWEEN = TWEEN || function() {
    var _tweens = [];
    return {
        REVISION: '12',
        getAll: function() {
            return _tweens;
        },
        removeAll: function() {
            _tweens = [];
        },
        add: function(tween) {
            _tweens.push(tween);
        },
        remove: function(tween) {
            var i = _tweens.indexOf(tween);
            if (i !== -1) {
                _tweens.splice(i, 1);
            }
        },
        update: function(time) {
            if (_tweens.length === 0) return false;
            var i = 0;
            time = time !== undefined ? time : typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now();
            while(i < _tweens.length){
                if (_tweens[i].update(time)) {
                    i++;
                } else {
                    _tweens.splice(i, 1);
                }
            }
            return true;
        }
    };
}();
TWEEN.Tween = function(object) {
    var _object = object;
    var _valuesStart = {};
    var _valuesEnd = {};
    var _valuesStartRepeat = {};
    var _duration = 1000;
    var _repeat = 0;
    var _yoyo = false;
    var _isPlaying = false;
    var _reversed = false;
    var _delayTime = 0;
    var _startTime = null;
    var _easingFunction = TWEEN.Easing.Linear.None;
    var _interpolationFunction = TWEEN.Interpolation.Linear;
    var _chainedTweens = [];
    var _onStartCallback = null;
    var _onStartCallbackFired = false;
    var _onUpdateCallback = null;
    var _onCompleteCallback = null;
    // Set all starting values present on the target object
    for(var field in object){
        _valuesStart[field] = parseFloat(object[field], 10);
    }
    this.to = function(properties, duration) {
        if (duration !== undefined) {
            _duration = duration;
        }
        _valuesEnd = properties;
        return this;
    };
    this.start = function(time) {
        TWEEN.add(this);
        _isPlaying = true;
        _onStartCallbackFired = false;
        _startTime = time !== undefined ? time : typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now();
        _startTime += _delayTime;
        for(var property in _valuesEnd){
            // check if an Array was provided as property value
            if (_valuesEnd[property] instanceof Array) {
                if (_valuesEnd[property].length === 0) {
                    continue;
                }
                // create a local copy of the Array with the start value at the front
                _valuesEnd[property] = [
                    _object[property]
                ].concat(_valuesEnd[property]);
            }
            _valuesStart[property] = _object[property];
            if (_valuesStart[property] instanceof Array === false) {
                _valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
            }
            _valuesStartRepeat[property] = _valuesStart[property] || 0;
        }
        return this;
    };
    this.stop = function() {
        if (!_isPlaying) {
            return this;
        }
        TWEEN.remove(this);
        _isPlaying = false;
        this.stopChainedTweens();
        return this;
    };
    this.stopChainedTweens = function() {
        for(var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++){
            _chainedTweens[i].stop();
        }
    };
    this.delay = function(amount) {
        _delayTime = amount;
        return this;
    };
    this.repeat = function(times) {
        _repeat = times;
        return this;
    };
    this.yoyo = function(yoyo) {
        _yoyo = yoyo;
        return this;
    };
    this.easing = function(easing) {
        _easingFunction = easing;
        return this;
    };
    this.interpolation = function(interpolation) {
        _interpolationFunction = interpolation;
        return this;
    };
    this.chain = function() {
        _chainedTweens = arguments;
        return this;
    };
    this.onStart = function(callback) {
        _onStartCallback = callback;
        return this;
    };
    this.onUpdate = function(callback) {
        _onUpdateCallback = callback;
        return this;
    };
    this.onComplete = function(callback) {
        _onCompleteCallback = callback;
        return this;
    };
    this.update = function(time) {
        var property;
        if (time < _startTime) {
            return true;
        }
        if (_onStartCallbackFired === false) {
            if (_onStartCallback !== null) {
                _onStartCallback.call(_object);
            }
            _onStartCallbackFired = true;
        }
        var elapsed = (time - _startTime) / _duration;
        elapsed = elapsed > 1 ? 1 : elapsed;
        var value = _easingFunction(elapsed);
        for(property in _valuesEnd){
            var start = _valuesStart[property] || 0;
            var end = _valuesEnd[property];
            if (end instanceof Array) {
                _object[property] = _interpolationFunction(end, value);
            } else {
                // Parses relative end values with start as base (e.g.: +10, -3)
                if (typeof end === "string") {
                    end = start + parseFloat(end, 10);
                }
                // protect against non numeric properties.
                if (typeof end === "number") {
                    _object[property] = start + (end - start) * value;
                }
            }
        }
        if (_onUpdateCallback !== null) {
            _onUpdateCallback.call(_object, value);
        }
        if (elapsed == 1) {
            if (_repeat > 0) {
                if (isFinite(_repeat)) {
                    _repeat--;
                }
                // reassign starting values, restart by making startTime = now
                for(property in _valuesStartRepeat){
                    if (typeof _valuesEnd[property] === "string") {
                        _valuesStartRepeat[property] = _valuesStartRepeat[property] + parseFloat(_valuesEnd[property], 10);
                    }
                    if (_yoyo) {
                        var tmp = _valuesStartRepeat[property];
                        _valuesStartRepeat[property] = _valuesEnd[property];
                        _valuesEnd[property] = tmp;
                        _reversed = !_reversed;
                    }
                    _valuesStart[property] = _valuesStartRepeat[property];
                }
                _startTime = time + _delayTime;
                return true;
            } else {
                if (_onCompleteCallback !== null) {
                    _onCompleteCallback.call(_object);
                }
                for(var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++){
                    _chainedTweens[i].start(time);
                }
                return false;
            }
        }
        return true;
    };
};
TWEEN.Easing = {
    Linear: {
        None: function(k) {
            return k;
        }
    },
    Quadratic: {
        In: function(k) {
            return k * k;
        },
        Out: function(k) {
            return k * (2 - k);
        },
        InOut: function(k) {
            if ((k *= 2) < 1) return 0.5 * k * k;
            return -0.5 * (--k * (k - 2) - 1);
        }
    },
    Cubic: {
        In: function(k) {
            return k * k * k;
        },
        Out: function(k) {
            return --k * k * k + 1;
        },
        InOut: function(k) {
            if ((k *= 2) < 1) return 0.5 * k * k * k;
            return 0.5 * ((k -= 2) * k * k + 2);
        }
    },
    Quartic: {
        In: function(k) {
            return k * k * k * k;
        },
        Out: function(k) {
            return 1 - --k * k * k * k;
        },
        InOut: function(k) {
            if ((k *= 2) < 1) return 0.5 * k * k * k * k;
            return -0.5 * ((k -= 2) * k * k * k - 2);
        }
    },
    Quintic: {
        In: function(k) {
            return k * k * k * k * k;
        },
        Out: function(k) {
            return --k * k * k * k * k + 1;
        },
        InOut: function(k) {
            if ((k *= 2) < 1) return 0.5 * k * k * k * k * k;
            return 0.5 * ((k -= 2) * k * k * k * k + 2);
        }
    },
    Sinusoidal: {
        In: function(k) {
            return 1 - Math.cos(k * Math.PI / 2);
        },
        Out: function(k) {
            return Math.sin(k * Math.PI / 2);
        },
        InOut: function(k) {
            return 0.5 * (1 - Math.cos(Math.PI * k));
        }
    },
    Exponential: {
        In: function(k) {
            return k === 0 ? 0 : Math.pow(1024, k - 1);
        },
        Out: function(k) {
            return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
        },
        InOut: function(k) {
            if (k === 0) return 0;
            if (k === 1) return 1;
            if ((k *= 2) < 1) return 0.5 * Math.pow(1024, k - 1);
            return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
        }
    },
    Circular: {
        In: function(k) {
            return 1 - Math.sqrt(1 - k * k);
        },
        Out: function(k) {
            return Math.sqrt(1 - --k * k);
        },
        InOut: function(k) {
            if ((k *= 2) < 1) return -0.5 * (Math.sqrt(1 - k * k) - 1);
            return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
        }
    },
    Elastic: {
        In: function(k) {
            var s, a = 0.1, p = 0.4;
            if (k === 0) return 0;
            if (k === 1) return 1;
            if (!a || a < 1) {
                a = 1;
                s = p / 4;
            } else s = p * Math.asin(1 / a) / (2 * Math.PI);
            return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
        },
        Out: function(k) {
            var s, a = 0.1, p = 0.4;
            if (k === 0) return 0;
            if (k === 1) return 1;
            if (!a || a < 1) {
                a = 1;
                s = p / 4;
            } else s = p * Math.asin(1 / a) / (2 * Math.PI);
            return a * Math.pow(2, -10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1;
        },
        InOut: function(k) {
            var s, a = 0.1, p = 0.4;
            if (k === 0) return 0;
            if (k === 1) return 1;
            if (!a || a < 1) {
                a = 1;
                s = p / 4;
            } else s = p * Math.asin(1 / a) / (2 * Math.PI);
            if ((k *= 2) < 1) return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
            return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;
        }
    },
    Back: {
        In: function(k) {
            var s = 1.70158;
            return k * k * ((s + 1) * k - s);
        },
        Out: function(k) {
            var s = 1.70158;
            return --k * k * ((s + 1) * k + s) + 1;
        },
        InOut: function(k) {
            var s = 1.70158 * 1.525;
            if ((k *= 2) < 1) return 0.5 * (k * k * ((s + 1) * k - s));
            return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
        }
    },
    Bounce: {
        In: function(k) {
            return 1 - TWEEN.Easing.Bounce.Out(1 - k);
        },
        Out: function(k) {
            if (k < 1 / 2.75) {
                return 7.5625 * k * k;
            } else if (k < 2 / 2.75) {
                return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75;
            } else if (k < 2.5 / 2.75) {
                return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375;
            } else {
                return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375;
            }
        },
        InOut: function(k) {
            if (k < 0.5) return TWEEN.Easing.Bounce.In(k * 2) * 0.5;
            return TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;
        }
    }
};
TWEEN.Interpolation = {
    Linear: function(v, k) {
        var m = v.length - 1, f = m * k, i = Math.floor(f), fn = TWEEN.Interpolation.Utils.Linear;
        if (k < 0) return fn(v[0], v[1], f);
        if (k > 1) return fn(v[m], v[m - 1], m - f);
        return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);
    },
    Bezier: function(v, k) {
        var b = 0, n = v.length - 1, pw = Math.pow, bn = TWEEN.Interpolation.Utils.Bernstein, i;
        for(i = 0; i <= n; i++){
            b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
        }
        return b;
    },
    CatmullRom: function(v, k) {
        var m = v.length - 1, f = m * k, i = Math.floor(f), fn = TWEEN.Interpolation.Utils.CatmullRom;
        if (v[0] === v[m]) {
            if (k < 0) i = Math.floor(f = m * (1 + k));
            return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
        } else {
            if (k < 0) return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
            if (k > 1) return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
            return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
        }
    },
    Utils: {
        Linear: function(p0, p1, t) {
            return (p1 - p0) * t + p0;
        },
        Bernstein: function(n, i) {
            var fc = TWEEN.Interpolation.Utils.Factorial;
            return fc(n) / fc(i) / fc(n - i);
        },
        Factorial: function() {
            var a = [
                1
            ];
            return function(n) {
                var s = 1, i;
                if (a[n]) return a[n];
                for(i = n; i > 1; i--)s *= i;
                return a[n] = s;
            };
        }(),
        CatmullRom: function(p0, p1, p2, p3, t) {
            var v0 = (p2 - p0) * 0.5, v1 = (p3 - p1) * 0.5, t2 = t * t, t3 = t * t2;
            return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
        }
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvVHdlZW4tcjEyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGF1dGhvciBzb2xlIC8gaHR0cDovL3NvbGVkYWRwZW5hZGVzLmNvbVxuICogQGF1dGhvciBtcmRvb2IgLyBodHRwOi8vbXJkb29iLmNvbVxuICogQGF1dGhvciBSb2JlcnQgRWlzZWxlIC8gaHR0cDovL3d3dy54YXJnLm9yZ1xuICogQGF1dGhvciBQaGlsaXBwZSAvIGh0dHA6Ly9waGlsaXBwZS5lbHNhc3MubWVcbiAqIEBhdXRob3IgUm9iZXJ0IFBlbm5lciAvIGh0dHA6Ly93d3cucm9iZXJ0cGVubmVyLmNvbS9lYXNpbmdfdGVybXNfb2ZfdXNlLmh0bWxcbiAqIEBhdXRob3IgUGF1bCBMZXdpcyAvIGh0dHA6Ly93d3cuYWVyb3R3aXN0LmNvbS9cbiAqIEBhdXRob3IgbGVjaGVjYWNoYXJyb1xuICogQGF1dGhvciBKb3NoIEZhdWwgLyBodHRwOi8vam9jYWZhLmNvbS9cbiAqIEBhdXRob3IgZWdyYWV0aGVyIC8gaHR0cDovL2VncmFldGhlci5jb20vXG4gKiBAYXV0aG9yIGVuZGVsIC8gaHR0cDovL2VuZGVsLm1lXG4gKiBAYXV0aG9yIEJlbiBEZWxhcnJlIC8gaHR0cDovL2RlbGFycmUubmV0XG4gKi9cblxuLy8gRGF0ZS5ub3cgc2hpbSBmb3IgKGFoZW0pIEludGVybmV0IEV4cGxvKGR8cillclxuaWYgKCBEYXRlLm5vdyA9PT0gdW5kZWZpbmVkICkge1xuXG4gIERhdGUubm93ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgcmV0dXJuIG5ldyBEYXRlKCkudmFsdWVPZigpO1xuXG4gIH07XG5cbn1cblxudmFyIFRXRUVOID0gVFdFRU4gfHwgKCBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIF90d2VlbnMgPSBbXTtcblxuICByZXR1cm4ge1xuXG4gICAgUkVWSVNJT046ICcxMicsXG5cbiAgICBnZXRBbGw6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcmV0dXJuIF90d2VlbnM7XG5cbiAgICB9LFxuXG4gICAgcmVtb3ZlQWxsOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIF90d2VlbnMgPSBbXTtcblxuICAgIH0sXG5cbiAgICBhZGQ6IGZ1bmN0aW9uICggdHdlZW4gKSB7XG5cbiAgICAgIF90d2VlbnMucHVzaCggdHdlZW4gKTtcblxuICAgIH0sXG5cbiAgICByZW1vdmU6IGZ1bmN0aW9uICggdHdlZW4gKSB7XG5cbiAgICAgIHZhciBpID0gX3R3ZWVucy5pbmRleE9mKCB0d2VlbiApO1xuXG4gICAgICBpZiAoIGkgIT09IC0xICkge1xuXG4gICAgICAgIF90d2VlbnMuc3BsaWNlKCBpLCAxICk7XG5cbiAgICAgIH1cblxuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uICggdGltZSApIHtcblxuICAgICAgaWYgKCBfdHdlZW5zLmxlbmd0aCA9PT0gMCApIHJldHVybiBmYWxzZTtcblxuICAgICAgdmFyIGkgPSAwO1xuXG4gICAgICB0aW1lID0gdGltZSAhPT0gdW5kZWZpbmVkID8gdGltZSA6ICggdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LnBlcmZvcm1hbmNlICE9PSB1bmRlZmluZWQgJiYgd2luZG93LnBlcmZvcm1hbmNlLm5vdyAhPT0gdW5kZWZpbmVkID8gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpIDogRGF0ZS5ub3coKSApO1xuXG4gICAgICB3aGlsZSAoIGkgPCBfdHdlZW5zLmxlbmd0aCApIHtcblxuICAgICAgICBpZiAoIF90d2VlbnNbIGkgXS51cGRhdGUoIHRpbWUgKSApIHtcblxuICAgICAgICAgIGkrKztcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgX3R3ZWVucy5zcGxpY2UoIGksIDEgKTtcblxuICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICB9XG4gIH07XG5cbn0gKSgpO1xuXG5UV0VFTi5Ud2VlbiA9IGZ1bmN0aW9uICggb2JqZWN0ICkge1xuXG4gIHZhciBfb2JqZWN0ID0gb2JqZWN0O1xuICB2YXIgX3ZhbHVlc1N0YXJ0ID0ge307XG4gIHZhciBfdmFsdWVzRW5kID0ge307XG4gIHZhciBfdmFsdWVzU3RhcnRSZXBlYXQgPSB7fTtcbiAgdmFyIF9kdXJhdGlvbiA9IDEwMDA7XG4gIHZhciBfcmVwZWF0ID0gMDtcbiAgdmFyIF95b3lvID0gZmFsc2U7XG4gIHZhciBfaXNQbGF5aW5nID0gZmFsc2U7XG4gIHZhciBfcmV2ZXJzZWQgPSBmYWxzZTtcbiAgdmFyIF9kZWxheVRpbWUgPSAwO1xuICB2YXIgX3N0YXJ0VGltZSA9IG51bGw7XG4gIHZhciBfZWFzaW5nRnVuY3Rpb24gPSBUV0VFTi5FYXNpbmcuTGluZWFyLk5vbmU7XG4gIHZhciBfaW50ZXJwb2xhdGlvbkZ1bmN0aW9uID0gVFdFRU4uSW50ZXJwb2xhdGlvbi5MaW5lYXI7XG4gIHZhciBfY2hhaW5lZFR3ZWVucyA9IFtdO1xuICB2YXIgX29uU3RhcnRDYWxsYmFjayA9IG51bGw7XG4gIHZhciBfb25TdGFydENhbGxiYWNrRmlyZWQgPSBmYWxzZTtcbiAgdmFyIF9vblVwZGF0ZUNhbGxiYWNrID0gbnVsbDtcbiAgdmFyIF9vbkNvbXBsZXRlQ2FsbGJhY2sgPSBudWxsO1xuXG4gIC8vIFNldCBhbGwgc3RhcnRpbmcgdmFsdWVzIHByZXNlbnQgb24gdGhlIHRhcmdldCBvYmplY3RcbiAgZm9yICggdmFyIGZpZWxkIGluIG9iamVjdCApIHtcblxuICAgIF92YWx1ZXNTdGFydFsgZmllbGQgXSA9IHBhcnNlRmxvYXQob2JqZWN0W2ZpZWxkXSwgMTApO1xuXG4gIH1cblxuICB0aGlzLnRvID0gZnVuY3Rpb24gKCBwcm9wZXJ0aWVzLCBkdXJhdGlvbiApIHtcblxuICAgIGlmICggZHVyYXRpb24gIT09IHVuZGVmaW5lZCApIHtcblxuICAgICAgX2R1cmF0aW9uID0gZHVyYXRpb247XG5cbiAgICB9XG5cbiAgICBfdmFsdWVzRW5kID0gcHJvcGVydGllcztcblxuICAgIHJldHVybiB0aGlzO1xuXG4gIH07XG5cbiAgdGhpcy5zdGFydCA9IGZ1bmN0aW9uICggdGltZSApIHtcblxuICAgIFRXRUVOLmFkZCggdGhpcyApO1xuXG4gICAgX2lzUGxheWluZyA9IHRydWU7XG5cbiAgICBfb25TdGFydENhbGxiYWNrRmlyZWQgPSBmYWxzZTtcblxuICAgIF9zdGFydFRpbWUgPSB0aW1lICE9PSB1bmRlZmluZWQgPyB0aW1lIDogKCB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cucGVyZm9ybWFuY2UgIT09IHVuZGVmaW5lZCAmJiB3aW5kb3cucGVyZm9ybWFuY2Uubm93ICE9PSB1bmRlZmluZWQgPyB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCkgOiBEYXRlLm5vdygpICk7XG4gICAgX3N0YXJ0VGltZSArPSBfZGVsYXlUaW1lO1xuXG4gICAgZm9yICggdmFyIHByb3BlcnR5IGluIF92YWx1ZXNFbmQgKSB7XG5cbiAgICAgIC8vIGNoZWNrIGlmIGFuIEFycmF5IHdhcyBwcm92aWRlZCBhcyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAgaWYgKCBfdmFsdWVzRW5kWyBwcm9wZXJ0eSBdIGluc3RhbmNlb2YgQXJyYXkgKSB7XG5cbiAgICAgICAgaWYgKCBfdmFsdWVzRW5kWyBwcm9wZXJ0eSBdLmxlbmd0aCA9PT0gMCApIHtcblxuICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvLyBjcmVhdGUgYSBsb2NhbCBjb3B5IG9mIHRoZSBBcnJheSB3aXRoIHRoZSBzdGFydCB2YWx1ZSBhdCB0aGUgZnJvbnRcbiAgICAgICAgX3ZhbHVlc0VuZFsgcHJvcGVydHkgXSA9IFsgX29iamVjdFsgcHJvcGVydHkgXSBdLmNvbmNhdCggX3ZhbHVlc0VuZFsgcHJvcGVydHkgXSApO1xuXG4gICAgICB9XG5cbiAgICAgIF92YWx1ZXNTdGFydFsgcHJvcGVydHkgXSA9IF9vYmplY3RbIHByb3BlcnR5IF07XG5cbiAgICAgIGlmKCAoIF92YWx1ZXNTdGFydFsgcHJvcGVydHkgXSBpbnN0YW5jZW9mIEFycmF5ICkgPT09IGZhbHNlICkge1xuICAgICAgICBfdmFsdWVzU3RhcnRbIHByb3BlcnR5IF0gKj0gMS4wOyAvLyBFbnN1cmVzIHdlJ3JlIHVzaW5nIG51bWJlcnMsIG5vdCBzdHJpbmdzXG4gICAgICB9XG5cbiAgICAgIF92YWx1ZXNTdGFydFJlcGVhdFsgcHJvcGVydHkgXSA9IF92YWx1ZXNTdGFydFsgcHJvcGVydHkgXSB8fCAwO1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgfTtcblxuICB0aGlzLnN0b3AgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICBpZiAoICFfaXNQbGF5aW5nICkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgVFdFRU4ucmVtb3ZlKCB0aGlzICk7XG4gICAgX2lzUGxheWluZyA9IGZhbHNlO1xuICAgIHRoaXMuc3RvcENoYWluZWRUd2VlbnMoKTtcbiAgICByZXR1cm4gdGhpcztcblxuICB9O1xuXG4gIHRoaXMuc3RvcENoYWluZWRUd2VlbnMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICBmb3IgKCB2YXIgaSA9IDAsIG51bUNoYWluZWRUd2VlbnMgPSBfY2hhaW5lZFR3ZWVucy5sZW5ndGg7IGkgPCBudW1DaGFpbmVkVHdlZW5zOyBpKysgKSB7XG5cbiAgICAgIF9jaGFpbmVkVHdlZW5zWyBpIF0uc3RvcCgpO1xuXG4gICAgfVxuXG4gIH07XG5cbiAgdGhpcy5kZWxheSA9IGZ1bmN0aW9uICggYW1vdW50ICkge1xuXG4gICAgX2RlbGF5VGltZSA9IGFtb3VudDtcbiAgICByZXR1cm4gdGhpcztcblxuICB9O1xuXG4gIHRoaXMucmVwZWF0ID0gZnVuY3Rpb24gKCB0aW1lcyApIHtcblxuICAgIF9yZXBlYXQgPSB0aW1lcztcbiAgICByZXR1cm4gdGhpcztcblxuICB9O1xuXG4gIHRoaXMueW95byA9IGZ1bmN0aW9uKCB5b3lvICkge1xuXG4gICAgX3lveW8gPSB5b3lvO1xuICAgIHJldHVybiB0aGlzO1xuXG4gIH07XG5cblxuICB0aGlzLmVhc2luZyA9IGZ1bmN0aW9uICggZWFzaW5nICkge1xuXG4gICAgX2Vhc2luZ0Z1bmN0aW9uID0gZWFzaW5nO1xuICAgIHJldHVybiB0aGlzO1xuXG4gIH07XG5cbiAgdGhpcy5pbnRlcnBvbGF0aW9uID0gZnVuY3Rpb24gKCBpbnRlcnBvbGF0aW9uICkge1xuXG4gICAgX2ludGVycG9sYXRpb25GdW5jdGlvbiA9IGludGVycG9sYXRpb247XG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgfTtcblxuICB0aGlzLmNoYWluID0gZnVuY3Rpb24gKCkge1xuXG4gICAgX2NoYWluZWRUd2VlbnMgPSBhcmd1bWVudHM7XG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgfTtcblxuICB0aGlzLm9uU3RhcnQgPSBmdW5jdGlvbiAoIGNhbGxiYWNrICkge1xuXG4gICAgX29uU3RhcnRDYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIHJldHVybiB0aGlzO1xuXG4gIH07XG5cbiAgdGhpcy5vblVwZGF0ZSA9IGZ1bmN0aW9uICggY2FsbGJhY2sgKSB7XG5cbiAgICBfb25VcGRhdGVDYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIHJldHVybiB0aGlzO1xuXG4gIH07XG5cbiAgdGhpcy5vbkNvbXBsZXRlID0gZnVuY3Rpb24gKCBjYWxsYmFjayApIHtcblxuICAgIF9vbkNvbXBsZXRlQ2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICByZXR1cm4gdGhpcztcblxuICB9O1xuXG4gIHRoaXMudXBkYXRlID0gZnVuY3Rpb24gKCB0aW1lICkge1xuXG4gICAgdmFyIHByb3BlcnR5O1xuXG4gICAgaWYgKCB0aW1lIDwgX3N0YXJ0VGltZSApIHtcblxuICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICB9XG5cbiAgICBpZiAoIF9vblN0YXJ0Q2FsbGJhY2tGaXJlZCA9PT0gZmFsc2UgKSB7XG5cbiAgICAgIGlmICggX29uU3RhcnRDYWxsYmFjayAhPT0gbnVsbCApIHtcblxuICAgICAgICBfb25TdGFydENhbGxiYWNrLmNhbGwoIF9vYmplY3QgKTtcblxuICAgICAgfVxuXG4gICAgICBfb25TdGFydENhbGxiYWNrRmlyZWQgPSB0cnVlO1xuXG4gICAgfVxuXG4gICAgdmFyIGVsYXBzZWQgPSAoIHRpbWUgLSBfc3RhcnRUaW1lICkgLyBfZHVyYXRpb247XG4gICAgZWxhcHNlZCA9IGVsYXBzZWQgPiAxID8gMSA6IGVsYXBzZWQ7XG5cbiAgICB2YXIgdmFsdWUgPSBfZWFzaW5nRnVuY3Rpb24oIGVsYXBzZWQgKTtcblxuICAgIGZvciAoIHByb3BlcnR5IGluIF92YWx1ZXNFbmQgKSB7XG5cbiAgICAgIHZhciBzdGFydCA9IF92YWx1ZXNTdGFydFsgcHJvcGVydHkgXSB8fCAwO1xuICAgICAgdmFyIGVuZCA9IF92YWx1ZXNFbmRbIHByb3BlcnR5IF07XG5cbiAgICAgIGlmICggZW5kIGluc3RhbmNlb2YgQXJyYXkgKSB7XG5cbiAgICAgICAgX29iamVjdFsgcHJvcGVydHkgXSA9IF9pbnRlcnBvbGF0aW9uRnVuY3Rpb24oIGVuZCwgdmFsdWUgKTtcblxuICAgICAgfSBlbHNlIHtcblxuICAgICAgICAvLyBQYXJzZXMgcmVsYXRpdmUgZW5kIHZhbHVlcyB3aXRoIHN0YXJ0IGFzIGJhc2UgKGUuZy46ICsxMCwgLTMpXG4gICAgICAgIGlmICggdHlwZW9mKGVuZCkgPT09IFwic3RyaW5nXCIgKSB7XG4gICAgICAgICAgZW5kID0gc3RhcnQgKyBwYXJzZUZsb2F0KGVuZCwgMTApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcHJvdGVjdCBhZ2FpbnN0IG5vbiBudW1lcmljIHByb3BlcnRpZXMuXG4gICAgICAgIGlmICggdHlwZW9mKGVuZCkgPT09IFwibnVtYmVyXCIgKSB7XG4gICAgICAgICAgX29iamVjdFsgcHJvcGVydHkgXSA9IHN0YXJ0ICsgKCBlbmQgLSBzdGFydCApICogdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICAgfVxuXG4gICAgaWYgKCBfb25VcGRhdGVDYWxsYmFjayAhPT0gbnVsbCApIHtcblxuICAgICAgX29uVXBkYXRlQ2FsbGJhY2suY2FsbCggX29iamVjdCwgdmFsdWUgKTtcblxuICAgIH1cblxuICAgIGlmICggZWxhcHNlZCA9PSAxICkge1xuXG4gICAgICBpZiAoIF9yZXBlYXQgPiAwICkge1xuXG4gICAgICAgIGlmKCBpc0Zpbml0ZSggX3JlcGVhdCApICkge1xuICAgICAgICAgIF9yZXBlYXQtLTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJlYXNzaWduIHN0YXJ0aW5nIHZhbHVlcywgcmVzdGFydCBieSBtYWtpbmcgc3RhcnRUaW1lID0gbm93XG4gICAgICAgIGZvciggcHJvcGVydHkgaW4gX3ZhbHVlc1N0YXJ0UmVwZWF0ICkge1xuXG4gICAgICAgICAgaWYgKCB0eXBlb2YoIF92YWx1ZXNFbmRbIHByb3BlcnR5IF0gKSA9PT0gXCJzdHJpbmdcIiApIHtcbiAgICAgICAgICAgIF92YWx1ZXNTdGFydFJlcGVhdFsgcHJvcGVydHkgXSA9IF92YWx1ZXNTdGFydFJlcGVhdFsgcHJvcGVydHkgXSArIHBhcnNlRmxvYXQoX3ZhbHVlc0VuZFsgcHJvcGVydHkgXSwgMTApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChfeW95bykge1xuICAgICAgICAgICAgdmFyIHRtcCA9IF92YWx1ZXNTdGFydFJlcGVhdFsgcHJvcGVydHkgXTtcbiAgICAgICAgICAgIF92YWx1ZXNTdGFydFJlcGVhdFsgcHJvcGVydHkgXSA9IF92YWx1ZXNFbmRbIHByb3BlcnR5IF07XG4gICAgICAgICAgICBfdmFsdWVzRW5kWyBwcm9wZXJ0eSBdID0gdG1wO1xuICAgICAgICAgICAgX3JldmVyc2VkID0gIV9yZXZlcnNlZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgX3ZhbHVlc1N0YXJ0WyBwcm9wZXJ0eSBdID0gX3ZhbHVlc1N0YXJ0UmVwZWF0WyBwcm9wZXJ0eSBdO1xuXG4gICAgICAgIH1cblxuICAgICAgICBfc3RhcnRUaW1lID0gdGltZSArIF9kZWxheVRpbWU7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgaWYgKCBfb25Db21wbGV0ZUNhbGxiYWNrICE9PSBudWxsICkge1xuXG4gICAgICAgICAgX29uQ29tcGxldGVDYWxsYmFjay5jYWxsKCBfb2JqZWN0ICk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoIHZhciBpID0gMCwgbnVtQ2hhaW5lZFR3ZWVucyA9IF9jaGFpbmVkVHdlZW5zLmxlbmd0aDsgaSA8IG51bUNoYWluZWRUd2VlbnM7IGkrKyApIHtcblxuICAgICAgICAgIF9jaGFpbmVkVHdlZW5zWyBpIF0uc3RhcnQoIHRpbWUgKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICB9XG5cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcblxuICB9O1xuXG59O1xuXG5cblRXRUVOLkVhc2luZyA9IHtcblxuICBMaW5lYXI6IHtcblxuICAgIE5vbmU6IGZ1bmN0aW9uICggayApIHtcblxuICAgICAgcmV0dXJuIGs7XG5cbiAgICB9XG5cbiAgfSxcblxuICBRdWFkcmF0aWM6IHtcblxuICAgIEluOiBmdW5jdGlvbiAoIGsgKSB7XG5cbiAgICAgIHJldHVybiBrICogaztcblxuICAgIH0sXG5cbiAgICBPdXQ6IGZ1bmN0aW9uICggayApIHtcblxuICAgICAgcmV0dXJuIGsgKiAoIDIgLSBrICk7XG5cbiAgICB9LFxuXG4gICAgSW5PdXQ6IGZ1bmN0aW9uICggayApIHtcblxuICAgICAgaWYgKCAoIGsgKj0gMiApIDwgMSApIHJldHVybiAwLjUgKiBrICogaztcbiAgICAgIHJldHVybiAtIDAuNSAqICggLS1rICogKCBrIC0gMiApIC0gMSApO1xuXG4gICAgfVxuXG4gIH0sXG5cbiAgQ3ViaWM6IHtcblxuICAgIEluOiBmdW5jdGlvbiAoIGsgKSB7XG5cbiAgICAgIHJldHVybiBrICogayAqIGs7XG5cbiAgICB9LFxuXG4gICAgT3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cbiAgICAgIHJldHVybiAtLWsgKiBrICogayArIDE7XG5cbiAgICB9LFxuXG4gICAgSW5PdXQ6IGZ1bmN0aW9uICggayApIHtcblxuICAgICAgaWYgKCAoIGsgKj0gMiApIDwgMSApIHJldHVybiAwLjUgKiBrICogayAqIGs7XG4gICAgICByZXR1cm4gMC41ICogKCAoIGsgLT0gMiApICogayAqIGsgKyAyICk7XG5cbiAgICB9XG5cbiAgfSxcblxuICBRdWFydGljOiB7XG5cbiAgICBJbjogZnVuY3Rpb24gKCBrICkge1xuXG4gICAgICByZXR1cm4gayAqIGsgKiBrICogaztcblxuICAgIH0sXG5cbiAgICBPdXQ6IGZ1bmN0aW9uICggayApIHtcblxuICAgICAgcmV0dXJuIDEgLSAoIC0tayAqIGsgKiBrICogayApO1xuXG4gICAgfSxcblxuICAgIEluT3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cbiAgICAgIGlmICggKCBrICo9IDIgKSA8IDEpIHJldHVybiAwLjUgKiBrICogayAqIGsgKiBrO1xuICAgICAgcmV0dXJuIC0gMC41ICogKCAoIGsgLT0gMiApICogayAqIGsgKiBrIC0gMiApO1xuXG4gICAgfVxuXG4gIH0sXG5cbiAgUXVpbnRpYzoge1xuXG4gICAgSW46IGZ1bmN0aW9uICggayApIHtcblxuICAgICAgcmV0dXJuIGsgKiBrICogayAqIGsgKiBrO1xuXG4gICAgfSxcblxuICAgIE91dDogZnVuY3Rpb24gKCBrICkge1xuXG4gICAgICByZXR1cm4gLS1rICogayAqIGsgKiBrICogayArIDE7XG5cbiAgICB9LFxuXG4gICAgSW5PdXQ6IGZ1bmN0aW9uICggayApIHtcblxuICAgICAgaWYgKCAoIGsgKj0gMiApIDwgMSApIHJldHVybiAwLjUgKiBrICogayAqIGsgKiBrICogaztcbiAgICAgIHJldHVybiAwLjUgKiAoICggayAtPSAyICkgKiBrICogayAqIGsgKiBrICsgMiApO1xuXG4gICAgfVxuXG4gIH0sXG5cbiAgU2ludXNvaWRhbDoge1xuXG4gICAgSW46IGZ1bmN0aW9uICggayApIHtcblxuICAgICAgcmV0dXJuIDEgLSBNYXRoLmNvcyggayAqIE1hdGguUEkgLyAyICk7XG5cbiAgICB9LFxuXG4gICAgT3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cbiAgICAgIHJldHVybiBNYXRoLnNpbiggayAqIE1hdGguUEkgLyAyICk7XG5cbiAgICB9LFxuXG4gICAgSW5PdXQ6IGZ1bmN0aW9uICggayApIHtcblxuICAgICAgcmV0dXJuIDAuNSAqICggMSAtIE1hdGguY29zKCBNYXRoLlBJICogayApICk7XG5cbiAgICB9XG5cbiAgfSxcblxuICBFeHBvbmVudGlhbDoge1xuXG4gICAgSW46IGZ1bmN0aW9uICggayApIHtcblxuICAgICAgcmV0dXJuIGsgPT09IDAgPyAwIDogTWF0aC5wb3coIDEwMjQsIGsgLSAxICk7XG5cbiAgICB9LFxuXG4gICAgT3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cbiAgICAgIHJldHVybiBrID09PSAxID8gMSA6IDEgLSBNYXRoLnBvdyggMiwgLSAxMCAqIGsgKTtcblxuICAgIH0sXG5cbiAgICBJbk91dDogZnVuY3Rpb24gKCBrICkge1xuXG4gICAgICBpZiAoIGsgPT09IDAgKSByZXR1cm4gMDtcbiAgICAgIGlmICggayA9PT0gMSApIHJldHVybiAxO1xuICAgICAgaWYgKCAoIGsgKj0gMiApIDwgMSApIHJldHVybiAwLjUgKiBNYXRoLnBvdyggMTAyNCwgayAtIDEgKTtcbiAgICAgIHJldHVybiAwLjUgKiAoIC0gTWF0aC5wb3coIDIsIC0gMTAgKiAoIGsgLSAxICkgKSArIDIgKTtcblxuICAgIH1cblxuICB9LFxuXG4gIENpcmN1bGFyOiB7XG5cbiAgICBJbjogZnVuY3Rpb24gKCBrICkge1xuXG4gICAgICByZXR1cm4gMSAtIE1hdGguc3FydCggMSAtIGsgKiBrICk7XG5cbiAgICB9LFxuXG4gICAgT3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cbiAgICAgIHJldHVybiBNYXRoLnNxcnQoIDEgLSAoIC0tayAqIGsgKSApO1xuXG4gICAgfSxcblxuICAgIEluT3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cbiAgICAgIGlmICggKCBrICo9IDIgKSA8IDEpIHJldHVybiAtIDAuNSAqICggTWF0aC5zcXJ0KCAxIC0gayAqIGspIC0gMSk7XG4gICAgICByZXR1cm4gMC41ICogKCBNYXRoLnNxcnQoIDEgLSAoIGsgLT0gMikgKiBrKSArIDEpO1xuXG4gICAgfVxuXG4gIH0sXG5cbiAgRWxhc3RpYzoge1xuXG4gICAgSW46IGZ1bmN0aW9uICggayApIHtcblxuICAgICAgdmFyIHMsIGEgPSAwLjEsIHAgPSAwLjQ7XG4gICAgICBpZiAoIGsgPT09IDAgKSByZXR1cm4gMDtcbiAgICAgIGlmICggayA9PT0gMSApIHJldHVybiAxO1xuICAgICAgaWYgKCAhYSB8fCBhIDwgMSApIHsgYSA9IDE7IHMgPSBwIC8gNDsgfVxuICAgICAgZWxzZSBzID0gcCAqIE1hdGguYXNpbiggMSAvIGEgKSAvICggMiAqIE1hdGguUEkgKTtcbiAgICAgIHJldHVybiAtICggYSAqIE1hdGgucG93KCAyLCAxMCAqICggayAtPSAxICkgKSAqIE1hdGguc2luKCAoIGsgLSBzICkgKiAoIDIgKiBNYXRoLlBJICkgLyBwICkgKTtcblxuICAgIH0sXG5cbiAgICBPdXQ6IGZ1bmN0aW9uICggayApIHtcblxuICAgICAgdmFyIHMsIGEgPSAwLjEsIHAgPSAwLjQ7XG4gICAgICBpZiAoIGsgPT09IDAgKSByZXR1cm4gMDtcbiAgICAgIGlmICggayA9PT0gMSApIHJldHVybiAxO1xuICAgICAgaWYgKCAhYSB8fCBhIDwgMSApIHsgYSA9IDE7IHMgPSBwIC8gNDsgfVxuICAgICAgZWxzZSBzID0gcCAqIE1hdGguYXNpbiggMSAvIGEgKSAvICggMiAqIE1hdGguUEkgKTtcbiAgICAgIHJldHVybiAoIGEgKiBNYXRoLnBvdyggMiwgLSAxMCAqIGspICogTWF0aC5zaW4oICggayAtIHMgKSAqICggMiAqIE1hdGguUEkgKSAvIHAgKSArIDEgKTtcblxuICAgIH0sXG5cbiAgICBJbk91dDogZnVuY3Rpb24gKCBrICkge1xuXG4gICAgICB2YXIgcywgYSA9IDAuMSwgcCA9IDAuNDtcbiAgICAgIGlmICggayA9PT0gMCApIHJldHVybiAwO1xuICAgICAgaWYgKCBrID09PSAxICkgcmV0dXJuIDE7XG4gICAgICBpZiAoICFhIHx8IGEgPCAxICkgeyBhID0gMTsgcyA9IHAgLyA0OyB9XG4gICAgICBlbHNlIHMgPSBwICogTWF0aC5hc2luKCAxIC8gYSApIC8gKCAyICogTWF0aC5QSSApO1xuICAgICAgaWYgKCAoIGsgKj0gMiApIDwgMSApIHJldHVybiAtIDAuNSAqICggYSAqIE1hdGgucG93KCAyLCAxMCAqICggayAtPSAxICkgKSAqIE1hdGguc2luKCAoIGsgLSBzICkgKiAoIDIgKiBNYXRoLlBJICkgLyBwICkgKTtcbiAgICAgIHJldHVybiBhICogTWF0aC5wb3coIDIsIC0xMCAqICggayAtPSAxICkgKSAqIE1hdGguc2luKCAoIGsgLSBzICkgKiAoIDIgKiBNYXRoLlBJICkgLyBwICkgKiAwLjUgKyAxO1xuXG4gICAgfVxuXG4gIH0sXG5cbiAgQmFjazoge1xuXG4gICAgSW46IGZ1bmN0aW9uICggayApIHtcblxuICAgICAgdmFyIHMgPSAxLjcwMTU4O1xuICAgICAgcmV0dXJuIGsgKiBrICogKCAoIHMgKyAxICkgKiBrIC0gcyApO1xuXG4gICAgfSxcblxuICAgIE91dDogZnVuY3Rpb24gKCBrICkge1xuXG4gICAgICB2YXIgcyA9IDEuNzAxNTg7XG4gICAgICByZXR1cm4gLS1rICogayAqICggKCBzICsgMSApICogayArIHMgKSArIDE7XG5cbiAgICB9LFxuXG4gICAgSW5PdXQ6IGZ1bmN0aW9uICggayApIHtcblxuICAgICAgdmFyIHMgPSAxLjcwMTU4ICogMS41MjU7XG4gICAgICBpZiAoICggayAqPSAyICkgPCAxICkgcmV0dXJuIDAuNSAqICggayAqIGsgKiAoICggcyArIDEgKSAqIGsgLSBzICkgKTtcbiAgICAgIHJldHVybiAwLjUgKiAoICggayAtPSAyICkgKiBrICogKCAoIHMgKyAxICkgKiBrICsgcyApICsgMiApO1xuXG4gICAgfVxuXG4gIH0sXG5cbiAgQm91bmNlOiB7XG5cbiAgICBJbjogZnVuY3Rpb24gKCBrICkge1xuXG4gICAgICByZXR1cm4gMSAtIFRXRUVOLkVhc2luZy5Cb3VuY2UuT3V0KCAxIC0gayApO1xuXG4gICAgfSxcblxuICAgIE91dDogZnVuY3Rpb24gKCBrICkge1xuXG4gICAgICBpZiAoIGsgPCAoIDEgLyAyLjc1ICkgKSB7XG5cbiAgICAgICAgcmV0dXJuIDcuNTYyNSAqIGsgKiBrO1xuXG4gICAgICB9IGVsc2UgaWYgKCBrIDwgKCAyIC8gMi43NSApICkge1xuXG4gICAgICAgIHJldHVybiA3LjU2MjUgKiAoIGsgLT0gKCAxLjUgLyAyLjc1ICkgKSAqIGsgKyAwLjc1O1xuXG4gICAgICB9IGVsc2UgaWYgKCBrIDwgKCAyLjUgLyAyLjc1ICkgKSB7XG5cbiAgICAgICAgcmV0dXJuIDcuNTYyNSAqICggayAtPSAoIDIuMjUgLyAyLjc1ICkgKSAqIGsgKyAwLjkzNzU7XG5cbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgcmV0dXJuIDcuNTYyNSAqICggayAtPSAoIDIuNjI1IC8gMi43NSApICkgKiBrICsgMC45ODQzNzU7XG5cbiAgICAgIH1cblxuICAgIH0sXG5cbiAgICBJbk91dDogZnVuY3Rpb24gKCBrICkge1xuXG4gICAgICBpZiAoIGsgPCAwLjUgKSByZXR1cm4gVFdFRU4uRWFzaW5nLkJvdW5jZS5JbiggayAqIDIgKSAqIDAuNTtcbiAgICAgIHJldHVybiBUV0VFTi5FYXNpbmcuQm91bmNlLk91dCggayAqIDIgLSAxICkgKiAwLjUgKyAwLjU7XG5cbiAgICB9XG5cbiAgfVxuXG59O1xuXG5UV0VFTi5JbnRlcnBvbGF0aW9uID0ge1xuXG4gIExpbmVhcjogZnVuY3Rpb24gKCB2LCBrICkge1xuXG4gICAgdmFyIG0gPSB2Lmxlbmd0aCAtIDEsIGYgPSBtICogaywgaSA9IE1hdGguZmxvb3IoIGYgKSwgZm4gPSBUV0VFTi5JbnRlcnBvbGF0aW9uLlV0aWxzLkxpbmVhcjtcblxuICAgIGlmICggayA8IDAgKSByZXR1cm4gZm4oIHZbIDAgXSwgdlsgMSBdLCBmICk7XG4gICAgaWYgKCBrID4gMSApIHJldHVybiBmbiggdlsgbSBdLCB2WyBtIC0gMSBdLCBtIC0gZiApO1xuXG4gICAgcmV0dXJuIGZuKCB2WyBpIF0sIHZbIGkgKyAxID4gbSA/IG0gOiBpICsgMSBdLCBmIC0gaSApO1xuXG4gIH0sXG5cbiAgQmV6aWVyOiBmdW5jdGlvbiAoIHYsIGsgKSB7XG5cbiAgICB2YXIgYiA9IDAsIG4gPSB2Lmxlbmd0aCAtIDEsIHB3ID0gTWF0aC5wb3csIGJuID0gVFdFRU4uSW50ZXJwb2xhdGlvbi5VdGlscy5CZXJuc3RlaW4sIGk7XG5cbiAgICBmb3IgKCBpID0gMDsgaSA8PSBuOyBpKysgKSB7XG4gICAgICBiICs9IHB3KCAxIC0gaywgbiAtIGkgKSAqIHB3KCBrLCBpICkgKiB2WyBpIF0gKiBibiggbiwgaSApO1xuICAgIH1cblxuICAgIHJldHVybiBiO1xuXG4gIH0sXG5cbiAgQ2F0bXVsbFJvbTogZnVuY3Rpb24gKCB2LCBrICkge1xuXG4gICAgdmFyIG0gPSB2Lmxlbmd0aCAtIDEsIGYgPSBtICogaywgaSA9IE1hdGguZmxvb3IoIGYgKSwgZm4gPSBUV0VFTi5JbnRlcnBvbGF0aW9uLlV0aWxzLkNhdG11bGxSb207XG5cbiAgICBpZiAoIHZbIDAgXSA9PT0gdlsgbSBdICkge1xuXG4gICAgICBpZiAoIGsgPCAwICkgaSA9IE1hdGguZmxvb3IoIGYgPSBtICogKCAxICsgayApICk7XG5cbiAgICAgIHJldHVybiBmbiggdlsgKCBpIC0gMSArIG0gKSAlIG0gXSwgdlsgaSBdLCB2WyAoIGkgKyAxICkgJSBtIF0sIHZbICggaSArIDIgKSAlIG0gXSwgZiAtIGkgKTtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgIGlmICggayA8IDAgKSByZXR1cm4gdlsgMCBdIC0gKCBmbiggdlsgMCBdLCB2WyAwIF0sIHZbIDEgXSwgdlsgMSBdLCAtZiApIC0gdlsgMCBdICk7XG4gICAgICBpZiAoIGsgPiAxICkgcmV0dXJuIHZbIG0gXSAtICggZm4oIHZbIG0gXSwgdlsgbSBdLCB2WyBtIC0gMSBdLCB2WyBtIC0gMSBdLCBmIC0gbSApIC0gdlsgbSBdICk7XG5cbiAgICAgIHJldHVybiBmbiggdlsgaSA/IGkgLSAxIDogMCBdLCB2WyBpIF0sIHZbIG0gPCBpICsgMSA/IG0gOiBpICsgMSBdLCB2WyBtIDwgaSArIDIgPyBtIDogaSArIDIgXSwgZiAtIGkgKTtcblxuICAgIH1cblxuICB9LFxuXG4gIFV0aWxzOiB7XG5cbiAgICBMaW5lYXI6IGZ1bmN0aW9uICggcDAsIHAxLCB0ICkge1xuXG4gICAgICByZXR1cm4gKCBwMSAtIHAwICkgKiB0ICsgcDA7XG5cbiAgICB9LFxuXG4gICAgQmVybnN0ZWluOiBmdW5jdGlvbiAoIG4gLCBpICkge1xuXG4gICAgICB2YXIgZmMgPSBUV0VFTi5JbnRlcnBvbGF0aW9uLlV0aWxzLkZhY3RvcmlhbDtcbiAgICAgIHJldHVybiBmYyggbiApIC8gZmMoIGkgKSAvIGZjKCBuIC0gaSApO1xuXG4gICAgfSxcblxuICAgIEZhY3RvcmlhbDogKCBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBhID0gWyAxIF07XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbiAoIG4gKSB7XG5cbiAgICAgICAgdmFyIHMgPSAxLCBpO1xuICAgICAgICBpZiAoIGFbIG4gXSApIHJldHVybiBhWyBuIF07XG4gICAgICAgIGZvciAoIGkgPSBuOyBpID4gMTsgaS0tICkgcyAqPSBpO1xuICAgICAgICByZXR1cm4gYVsgbiBdID0gcztcblxuICAgICAgfTtcblxuICAgIH0gKSgpLFxuXG4gICAgQ2F0bXVsbFJvbTogZnVuY3Rpb24gKCBwMCwgcDEsIHAyLCBwMywgdCApIHtcblxuICAgICAgdmFyIHYwID0gKCBwMiAtIHAwICkgKiAwLjUsIHYxID0gKCBwMyAtIHAxICkgKiAwLjUsIHQyID0gdCAqIHQsIHQzID0gdCAqIHQyO1xuICAgICAgcmV0dXJuICggMiAqIHAxIC0gMiAqIHAyICsgdjAgKyB2MSApICogdDMgKyAoIC0gMyAqIHAxICsgMyAqIHAyIC0gMiAqIHYwIC0gdjEgKSAqIHQyICsgdjAgKiB0ICsgcDE7XG5cbiAgICB9XG5cbiAgfVxuXG59OyJdLCJuYW1lcyI6WyJEYXRlIiwibm93IiwidW5kZWZpbmVkIiwidmFsdWVPZiIsIlRXRUVOIiwiX3R3ZWVucyIsIlJFVklTSU9OIiwiZ2V0QWxsIiwicmVtb3ZlQWxsIiwiYWRkIiwidHdlZW4iLCJwdXNoIiwicmVtb3ZlIiwiaSIsImluZGV4T2YiLCJzcGxpY2UiLCJ1cGRhdGUiLCJ0aW1lIiwibGVuZ3RoIiwid2luZG93IiwicGVyZm9ybWFuY2UiLCJUd2VlbiIsIm9iamVjdCIsIl9vYmplY3QiLCJfdmFsdWVzU3RhcnQiLCJfdmFsdWVzRW5kIiwiX3ZhbHVlc1N0YXJ0UmVwZWF0IiwiX2R1cmF0aW9uIiwiX3JlcGVhdCIsIl95b3lvIiwiX2lzUGxheWluZyIsIl9yZXZlcnNlZCIsIl9kZWxheVRpbWUiLCJfc3RhcnRUaW1lIiwiX2Vhc2luZ0Z1bmN0aW9uIiwiRWFzaW5nIiwiTGluZWFyIiwiTm9uZSIsIl9pbnRlcnBvbGF0aW9uRnVuY3Rpb24iLCJJbnRlcnBvbGF0aW9uIiwiX2NoYWluZWRUd2VlbnMiLCJfb25TdGFydENhbGxiYWNrIiwiX29uU3RhcnRDYWxsYmFja0ZpcmVkIiwiX29uVXBkYXRlQ2FsbGJhY2siLCJfb25Db21wbGV0ZUNhbGxiYWNrIiwiZmllbGQiLCJwYXJzZUZsb2F0IiwidG8iLCJwcm9wZXJ0aWVzIiwiZHVyYXRpb24iLCJzdGFydCIsInByb3BlcnR5IiwiQXJyYXkiLCJjb25jYXQiLCJzdG9wIiwic3RvcENoYWluZWRUd2VlbnMiLCJudW1DaGFpbmVkVHdlZW5zIiwiZGVsYXkiLCJhbW91bnQiLCJyZXBlYXQiLCJ0aW1lcyIsInlveW8iLCJlYXNpbmciLCJpbnRlcnBvbGF0aW9uIiwiY2hhaW4iLCJhcmd1bWVudHMiLCJvblN0YXJ0IiwiY2FsbGJhY2siLCJvblVwZGF0ZSIsIm9uQ29tcGxldGUiLCJjYWxsIiwiZWxhcHNlZCIsInZhbHVlIiwiZW5kIiwiaXNGaW5pdGUiLCJ0bXAiLCJrIiwiUXVhZHJhdGljIiwiSW4iLCJPdXQiLCJJbk91dCIsIkN1YmljIiwiUXVhcnRpYyIsIlF1aW50aWMiLCJTaW51c29pZGFsIiwiTWF0aCIsImNvcyIsIlBJIiwic2luIiwiRXhwb25lbnRpYWwiLCJwb3ciLCJDaXJjdWxhciIsInNxcnQiLCJFbGFzdGljIiwicyIsImEiLCJwIiwiYXNpbiIsIkJhY2siLCJCb3VuY2UiLCJ2IiwibSIsImYiLCJmbG9vciIsImZuIiwiVXRpbHMiLCJCZXppZXIiLCJiIiwibiIsInB3IiwiYm4iLCJCZXJuc3RlaW4iLCJDYXRtdWxsUm9tIiwicDAiLCJwMSIsInQiLCJmYyIsIkZhY3RvcmlhbCIsInAyIiwicDMiLCJ2MCIsInYxIiwidDIiLCJ0MyJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7OztDQVlDLEdBRUQsaURBQWlEO0FBQ2pELElBQUtBLEtBQUtDLEdBQUcsS0FBS0MsV0FBWTtJQUU1QkYsS0FBS0MsR0FBRyxHQUFHO1FBRVQsT0FBTyxJQUFJRCxPQUFPRyxPQUFPO0lBRTNCO0FBRUY7QUFFQSxJQUFJQyxRQUFRQSxTQUFTLEFBQUU7SUFFckIsSUFBSUMsVUFBVSxFQUFFO0lBRWhCLE9BQU87UUFFTEMsVUFBVTtRQUVWQyxRQUFRO1lBRU4sT0FBT0Y7UUFFVDtRQUVBRyxXQUFXO1lBRVRILFVBQVUsRUFBRTtRQUVkO1FBRUFJLEtBQUssU0FBV0MsS0FBSztZQUVuQkwsUUFBUU0sSUFBSSxDQUFFRDtRQUVoQjtRQUVBRSxRQUFRLFNBQVdGLEtBQUs7WUFFdEIsSUFBSUcsSUFBSVIsUUFBUVMsT0FBTyxDQUFFSjtZQUV6QixJQUFLRyxNQUFNLENBQUMsR0FBSTtnQkFFZFIsUUFBUVUsTUFBTSxDQUFFRixHQUFHO1lBRXJCO1FBRUY7UUFFQUcsUUFBUSxTQUFXQyxJQUFJO1lBRXJCLElBQUtaLFFBQVFhLE1BQU0sS0FBSyxHQUFJLE9BQU87WUFFbkMsSUFBSUwsSUFBSTtZQUVSSSxPQUFPQSxTQUFTZixZQUFZZSxP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