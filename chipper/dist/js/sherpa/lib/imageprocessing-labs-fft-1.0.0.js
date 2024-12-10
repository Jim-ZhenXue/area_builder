/**
 * Fast Fourier Transform module
 * 1D-FFT/IFFT, 2D-FFT/IFFT (radix-2)
 */ (function() {
    var FFT; // top-level namespace
    var _root = this; // reference to 'window' or 'global'
    if (typeof exports !== 'undefined') {
        FFT = exports; // for CommonJS
    } else {
        FFT = _root.FFT = {};
    }
    var version = {
        release: '0.3.0',
        date: '2013-03'
    };
    FFT.toString = function() {
        return "version " + version.release + ", released " + version.date;
    };
    // core operations
    var _n = 0, _bitrev = null, _cstb = null; // sin/cos table
    var core = {
        init: function(n) {
            if (n !== 0 && (n & n - 1) === 0) {
                _n = n;
                core._initArray();
                core._makeBitReversalTable();
                core._makeCosSinTable();
            } else {
                throw new Error("init: radix-2 required");
            }
        },
        // 1D-FFT
        fft1d: function(re, im) {
            core.fft(re, im, 1);
        },
        // 1D-IFFT
        ifft1d: function(re, im) {
            var n = 1 / _n;
            core.fft(re, im, -1);
            for(var i = 0; i < _n; i++){
                re[i] *= n;
                im[i] *= n;
            }
        },
        // 2D-FFT
        fft2d: function(re, im) {
            var tre = [], tim = [], i = 0;
            // x-axis
            for(var y = 0; y < _n; y++){
                i = y * _n;
                for(var x1 = 0; x1 < _n; x1++){
                    tre[x1] = re[x1 + i];
                    tim[x1] = im[x1 + i];
                }
                core.fft1d(tre, tim);
                for(var x2 = 0; x2 < _n; x2++){
                    re[x2 + i] = tre[x2];
                    im[x2 + i] = tim[x2];
                }
            }
            // y-axis
            for(var x = 0; x < _n; x++){
                for(var y1 = 0; y1 < _n; y1++){
                    i = x + y1 * _n;
                    tre[y1] = re[i];
                    tim[y1] = im[i];
                }
                core.fft1d(tre, tim);
                for(var y2 = 0; y2 < _n; y2++){
                    i = x + y2 * _n;
                    re[i] = tre[y2];
                    im[i] = tim[y2];
                }
            }
        },
        // 2D-IFFT
        ifft2d: function(re, im) {
            var tre = [], tim = [], i = 0;
            // x-axis
            for(var y = 0; y < _n; y++){
                i = y * _n;
                for(var x1 = 0; x1 < _n; x1++){
                    tre[x1] = re[x1 + i];
                    tim[x1] = im[x1 + i];
                }
                core.ifft1d(tre, tim);
                for(var x2 = 0; x2 < _n; x2++){
                    re[x2 + i] = tre[x2];
                    im[x2 + i] = tim[x2];
                }
            }
            // y-axis
            for(var x = 0; x < _n; x++){
                for(var y1 = 0; y1 < _n; y1++){
                    i = x + y1 * _n;
                    tre[y1] = re[i];
                    tim[y1] = im[i];
                }
                core.ifft1d(tre, tim);
                for(var y2 = 0; y2 < _n; y2++){
                    i = x + y2 * _n;
                    re[i] = tre[y2];
                    im[i] = tim[y2];
                }
            }
        },
        // core operation of FFT
        fft: function(re, im, inv) {
            var d, h, ik, m, tmp, wr, wi, xr, xi, n4 = _n >> 2;
            // bit reversal
            for(var l = 0; l < _n; l++){
                m = _bitrev[l];
                if (l < m) {
                    tmp = re[l];
                    re[l] = re[m];
                    re[m] = tmp;
                    tmp = im[l];
                    im[l] = im[m];
                    im[m] = tmp;
                }
            }
            // butterfly operation
            for(var k = 1; k < _n; k <<= 1){
                h = 0;
                d = _n / (k << 1);
                for(var j = 0; j < k; j++){
                    wr = _cstb[h + n4];
                    wi = inv * _cstb[h];
                    for(var i = j; i < _n; i += k << 1){
                        ik = i + k;
                        xr = wr * re[ik] + wi * im[ik];
                        xi = wr * im[ik] - wi * re[ik];
                        re[ik] = re[i] - xr;
                        re[i] += xr;
                        im[ik] = im[i] - xi;
                        im[i] += xi;
                    }
                    h += d;
                }
            }
        },
        // initialize the array (supports TypedArray)
        _initArray: function() {
            if (typeof Uint8Array !== 'undefined') {
                if (_n <= 256) _bitrev = new Uint8Array(_n);
                else if (_n <= 65536) _bitrev = new Uint16Array(_n);
                else _bitrev = new Uint32Array(_n);
            } else {
                _bitrev = [];
            }
            if (typeof Float64Array !== 'undefined') {
                _cstb = new Float64Array(_n * 1.25);
            } else {
                _cstb = [];
            }
        },
        // zero padding
        _paddingZero: function() {
        // TODO
        },
        // makes bit reversal table
        _makeBitReversalTable: function() {
            var i = 0, j = 0, k = 0;
            _bitrev[0] = 0;
            while(++i < _n){
                k = _n >> 1;
                while(k <= j){
                    j -= k;
                    k >>= 1;
                }
                j += k;
                _bitrev[i] = j;
            }
        },
        // makes trigonometiric function table
        _makeCosSinTable: function() {
            var n2 = _n >> 1, n4 = _n >> 2, n8 = _n >> 3, n2p4 = n2 + n4, t = Math.sin(Math.PI / _n), dc = 2 * t * t, ds = Math.sqrt(dc * (2 - dc)), c = _cstb[n4] = 1, s = _cstb[0] = 0;
            t = 2 * dc;
            for(var i = 1; i < n8; i++){
                c -= dc;
                dc += t * c;
                s += ds;
                ds -= t * s;
                _cstb[i] = s;
                _cstb[n4 - i] = c;
            }
            if (n8 !== 0) {
                _cstb[n8] = Math.sqrt(0.5);
            }
            for(var j = 0; j < n4; j++){
                _cstb[n2 - j] = _cstb[j];
            }
            for(var k = 0; k < n2p4; k++){
                _cstb[k + n2] = -_cstb[k];
            }
        }
    };
    // aliases (public APIs)
    var apis = [
        'init',
        'fft1d',
        'ifft1d',
        'fft2d',
        'ifft2d'
    ];
    for(var i = 0; i < apis.length; i++){
        FFT[apis[i]] = core[apis[i]];
    }
    FFT.fft = core.fft1d;
    FFT.ifft = core.ifft1d;
}).call(this);
/**
 * Spatial Frequency Filtering
 * High-pass/Low-pass/Band-pass Filter
 * Windowing using hamming window
 */ (function() {
    var FrequencyFilter; // top-level namespace
    var _root = this; // reference to 'window' or 'global'
    if (typeof exports !== 'undefined') {
        FrequencyFilter = exports; // for CommonJS
    } else {
        FrequencyFilter = _root.FrequencyFilter = {};
    }
    // core operations
    var _n = 0;
    var core = {
        init: function(n) {
            if (n !== 0 && (n & n - 1) === 0) {
                _n = n;
            } else {
                throw new Error("init: radix-2 required");
            }
        },
        // swaps quadrant
        swap: function(re, im) {
            var xn, yn, i, j, k, l, tmp, len = _n >> 1;
            for(var y = 0; y < len; y++){
                yn = y + len;
                for(var x = 0; x < len; x++){
                    xn = x + len;
                    i = x + y * _n;
                    j = xn + yn * _n;
                    k = x + yn * _n;
                    l = xn + y * _n;
                    tmp = re[i];
                    re[i] = re[j];
                    re[j] = tmp;
                    tmp = re[k];
                    re[k] = re[l];
                    re[l] = tmp;
                    tmp = im[i];
                    im[i] = im[j];
                    im[j] = tmp;
                    tmp = im[k];
                    im[k] = im[l];
                    im[l] = tmp;
                }
            }
        },
        // applies High-Pass Filter
        HPF: function(re, im, radius) {
            var i = 0, p = 0, r = 0.0, n2 = _n >> 1, sqrt = Math.sqrt;
            for(var y = -n2; y < n2; y++){
                i = n2 + (y + n2) * _n;
                for(var x = -n2; x < n2; x++){
                    r = sqrt(x * x + y * y);
                    p = x + i;
                    if (r < radius) {
                        re[p] = im[p] = 0;
                    }
                }
            }
        },
        // applies Low-Pass Filter
        LPF: function(re, im, radius) {
            var i = 0, p = 0, r = 0.0, n2 = _n >> 1, sqrt = Math.sqrt;
            for(var y = -n2; y < n2; y++){
                i = n2 + (y + n2) * _n;
                for(var x = -n2; x < n2; x++){
                    r = sqrt(x * x + y * y);
                    p = x + i;
                    if (r > radius) {
                        re[p] = im[p] = 0;
                    }
                }
            }
        },
        // applies Band-Pass Filter
        BPF: function(re, im, radius, bandwidth) {
            var i = 0, p = 0, r = 0.0, n2 = _n >> 1, sqrt = Math.sqrt;
            for(var y = -n2; y < n2; y++){
                i = n2 + (y + n2) * _n;
                for(var x = -n2; x < n2; x++){
                    r = sqrt(x * x + y * y);
                    p = x + i;
                    if (r < radius || r > radius + bandwidth) {
                        re[p] = im[p] = 0;
                    }
                }
            }
        },
        // windowing using hamming window
        windowing: function(data, inv) {
            var len = data.length, pi = Math.PI, cos = Math.cos;
            for(var i = 0; i < len; i++){
                if (inv === 1) {
                    data[i] *= 0.54 - 0.46 * cos(2 * pi * i / (len - 1));
                } else {
                    data[i] /= 0.54 - 0.46 * cos(2 * pi * i / (len - 1));
                }
            }
        }
    };
    // aliases (public APIs)
    var apis = [
        'init',
        'swap',
        'HPF',
        'LPF',
        'BPF',
        'windowing'
    ];
    for(var i = 0; i < apis.length; i++){
        FrequencyFilter[apis[i]] = core[apis[i]];
    }
}).call(this);
/**
 * FFT Power Spectrum Viewer
 */ (function() {
    var SpectrumViewer; // top-level namespace
    var _root = this; // reference to 'window' or 'global'
    if (typeof exports !== 'undefined') {
        SpectrumViewer = exports; // for CommonJS
    } else {
        SpectrumViewer = _root.SpectrumViewer = {};
    }
    // core operations
    var _context = null, _n = 0, _img = null, _data = null;
    var core = {
        init: function(context) {
            _context = context;
            _n = context.canvas.width, _img = context.getImageData(0, 0, _n, _n);
            _data = _img.data;
        },
        // renders FFT power spectrum on the canvas
        render: function(re, im, islog) {
            var val = 0, i = 0, p = 0, spectrum = [], max = 1.0, imax = 0.0, n2 = _n * _n, log = Math.log, sqrt = Math.sqrt;
            for(var i = 0; i < n2; i++){
                if (islog) {
                    spectrum[i] = log(Math.sqrt(re[i] * re[i] + im[i] * im[i]));
                } else {
                    spectrum[i] = sqrt(re[i] * re[i] + im[i] * im[i]);
                }
                if (spectrum[i] > max) {
                    max = spectrum[i];
                }
            }
            imax = 1 / max;
            for(var j = 0; j < n2; j++){
                spectrum[j] = spectrum[j] * 255 * imax;
            }
            for(var y = 0; y < _n; y++){
                i = y * _n;
                for(var x = 0; x < _n; x++){
                    val = spectrum[i + x];
                    p = (i << 2) + (x << 2);
                    _data[p] = 0;
                    _data[p + 1] = val;
                    _data[p + 2] = val >> 1;
                }
            }
            _context.putImageData(_img, 0, 0);
        }
    };
    // aliases (public APIs)
    SpectrumViewer.init = core.init;
    SpectrumViewer.render = core.render;
}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvaW1hZ2Vwcm9jZXNzaW5nLWxhYnMtZmZ0LTEuMC4wLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRmFzdCBGb3VyaWVyIFRyYW5zZm9ybSBtb2R1bGVcbiAqIDFELUZGVC9JRkZULCAyRC1GRlQvSUZGVCAocmFkaXgtMilcbiAqL1xuKGZ1bmN0aW9uKCkge1xuICB2YXIgRkZUOyAgICAgICAgICAgLy8gdG9wLWxldmVsIG5hbWVzcGFjZVxuICB2YXIgX3Jvb3QgPSB0aGlzOyAgLy8gcmVmZXJlbmNlIHRvICd3aW5kb3cnIG9yICdnbG9iYWwnXG5cbiAgaWYodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgRkZUID0gZXhwb3J0czsgICAvLyBmb3IgQ29tbW9uSlNcbiAgfSBlbHNlIHtcbiAgICBGRlQgPSBfcm9vdC5GRlQgPSB7fTtcbiAgfVxuXG4gIHZhciB2ZXJzaW9uID0ge1xuICAgIHJlbGVhc2U6ICcwLjMuMCcsXG4gICAgZGF0ZTogJzIwMTMtMDMnXG4gIH07XG4gIEZGVC50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcInZlcnNpb24gXCIgKyB2ZXJzaW9uLnJlbGVhc2UgKyBcIiwgcmVsZWFzZWQgXCIgKyB2ZXJzaW9uLmRhdGU7XG4gIH07XG5cbiAgLy8gY29yZSBvcGVyYXRpb25zXG4gIHZhciBfbiA9IDAsICAgICAgICAgIC8vIG9yZGVyXG4gICAgX2JpdHJldiA9IG51bGwsICAvLyBiaXQgcmV2ZXJzYWwgdGFibGVcbiAgICBfY3N0YiA9IG51bGw7ICAgIC8vIHNpbi9jb3MgdGFibGVcbiAgdmFyIGNvcmUgPSB7XG4gICAgaW5pdCA6IGZ1bmN0aW9uKG4pIHtcbiAgICAgIGlmKG4gIT09IDAgJiYgKG4gJiAobiAtIDEpKSA9PT0gMCkge1xuICAgICAgICBfbiA9IG47XG4gICAgICAgIGNvcmUuX2luaXRBcnJheSgpO1xuICAgICAgICBjb3JlLl9tYWtlQml0UmV2ZXJzYWxUYWJsZSgpO1xuICAgICAgICBjb3JlLl9tYWtlQ29zU2luVGFibGUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImluaXQ6IHJhZGl4LTIgcmVxdWlyZWRcIik7XG4gICAgICB9XG4gICAgfSxcbiAgICAvLyAxRC1GRlRcbiAgICBmZnQxZCA6IGZ1bmN0aW9uKHJlLCBpbSkge1xuICAgICAgY29yZS5mZnQocmUsIGltLCAxKTtcbiAgICB9LFxuICAgIC8vIDFELUlGRlRcbiAgICBpZmZ0MWQgOiBmdW5jdGlvbihyZSwgaW0pIHtcbiAgICAgIHZhciBuID0gMS9fbjtcbiAgICAgIGNvcmUuZmZ0KHJlLCBpbSwgLTEpO1xuICAgICAgZm9yKHZhciBpPTA7IGk8X247IGkrKykge1xuICAgICAgICByZVtpXSAqPSBuO1xuICAgICAgICBpbVtpXSAqPSBuO1xuICAgICAgfVxuICAgIH0sXG4gICAgLy8gMkQtRkZUXG4gICAgZmZ0MmQgOiBmdW5jdGlvbihyZSwgaW0pIHtcbiAgICAgIHZhciB0cmUgPSBbXSxcbiAgICAgICAgdGltID0gW10sXG4gICAgICAgIGkgPSAwO1xuICAgICAgLy8geC1heGlzXG4gICAgICBmb3IodmFyIHk9MDsgeTxfbjsgeSsrKSB7XG4gICAgICAgIGkgPSB5Kl9uO1xuICAgICAgICBmb3IodmFyIHgxPTA7IHgxPF9uOyB4MSsrKSB7XG4gICAgICAgICAgdHJlW3gxXSA9IHJlW3gxICsgaV07XG4gICAgICAgICAgdGltW3gxXSA9IGltW3gxICsgaV07XG4gICAgICAgIH1cbiAgICAgICAgY29yZS5mZnQxZCh0cmUsIHRpbSk7XG4gICAgICAgIGZvcih2YXIgeDI9MDsgeDI8X247IHgyKyspIHtcbiAgICAgICAgICByZVt4MiArIGldID0gdHJlW3gyXTtcbiAgICAgICAgICBpbVt4MiArIGldID0gdGltW3gyXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8geS1heGlzXG4gICAgICBmb3IodmFyIHg9MDsgeDxfbjsgeCsrKSB7XG4gICAgICAgIGZvcih2YXIgeTE9MDsgeTE8X247IHkxKyspIHtcbiAgICAgICAgICBpID0geCArIHkxKl9uO1xuICAgICAgICAgIHRyZVt5MV0gPSByZVtpXTtcbiAgICAgICAgICB0aW1beTFdID0gaW1baV07XG4gICAgICAgIH1cbiAgICAgICAgY29yZS5mZnQxZCh0cmUsIHRpbSk7XG4gICAgICAgIGZvcih2YXIgeTI9MDsgeTI8X247IHkyKyspIHtcbiAgICAgICAgICBpID0geCArIHkyKl9uO1xuICAgICAgICAgIHJlW2ldID0gdHJlW3kyXTtcbiAgICAgICAgICBpbVtpXSA9IHRpbVt5Ml07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIC8vIDJELUlGRlRcbiAgICBpZmZ0MmQgOiBmdW5jdGlvbihyZSwgaW0pIHtcbiAgICAgIHZhciB0cmUgPSBbXSxcbiAgICAgICAgdGltID0gW10sXG4gICAgICAgIGkgPSAwO1xuICAgICAgLy8geC1heGlzXG4gICAgICBmb3IodmFyIHk9MDsgeTxfbjsgeSsrKSB7XG4gICAgICAgIGkgPSB5Kl9uO1xuICAgICAgICBmb3IodmFyIHgxPTA7IHgxPF9uOyB4MSsrKSB7XG4gICAgICAgICAgdHJlW3gxXSA9IHJlW3gxICsgaV07XG4gICAgICAgICAgdGltW3gxXSA9IGltW3gxICsgaV07XG4gICAgICAgIH1cbiAgICAgICAgY29yZS5pZmZ0MWQodHJlLCB0aW0pO1xuICAgICAgICBmb3IodmFyIHgyPTA7IHgyPF9uOyB4MisrKSB7XG4gICAgICAgICAgcmVbeDIgKyBpXSA9IHRyZVt4Ml07XG4gICAgICAgICAgaW1beDIgKyBpXSA9IHRpbVt4Ml07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIHktYXhpc1xuICAgICAgZm9yKHZhciB4PTA7IHg8X247IHgrKykge1xuICAgICAgICBmb3IodmFyIHkxPTA7IHkxPF9uOyB5MSsrKSB7XG4gICAgICAgICAgaSA9IHggKyB5MSpfbjtcbiAgICAgICAgICB0cmVbeTFdID0gcmVbaV07XG4gICAgICAgICAgdGltW3kxXSA9IGltW2ldO1xuICAgICAgICB9XG4gICAgICAgIGNvcmUuaWZmdDFkKHRyZSwgdGltKTtcbiAgICAgICAgZm9yKHZhciB5Mj0wOyB5MjxfbjsgeTIrKykge1xuICAgICAgICAgIGkgPSB4ICsgeTIqX247XG4gICAgICAgICAgcmVbaV0gPSB0cmVbeTJdO1xuICAgICAgICAgIGltW2ldID0gdGltW3kyXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgLy8gY29yZSBvcGVyYXRpb24gb2YgRkZUXG4gICAgZmZ0IDogZnVuY3Rpb24ocmUsIGltLCBpbnYpIHtcbiAgICAgIHZhciBkLCBoLCBpaywgbSwgdG1wLCB3ciwgd2ksIHhyLCB4aSxcbiAgICAgICAgbjQgPSBfbiA+PiAyO1xuICAgICAgLy8gYml0IHJldmVyc2FsXG4gICAgICBmb3IodmFyIGw9MDsgbDxfbjsgbCsrKSB7XG4gICAgICAgIG0gPSBfYml0cmV2W2xdO1xuICAgICAgICBpZihsIDwgbSkge1xuICAgICAgICAgIHRtcCA9IHJlW2xdO1xuICAgICAgICAgIHJlW2xdID0gcmVbbV07XG4gICAgICAgICAgcmVbbV0gPSB0bXA7XG4gICAgICAgICAgdG1wID0gaW1bbF07XG4gICAgICAgICAgaW1bbF0gPSBpbVttXTtcbiAgICAgICAgICBpbVttXSA9IHRtcDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gYnV0dGVyZmx5IG9wZXJhdGlvblxuICAgICAgZm9yKHZhciBrPTE7IGs8X247IGs8PD0xKSB7XG4gICAgICAgIGggPSAwO1xuICAgICAgICBkID0gX24vKGsgPDwgMSk7XG4gICAgICAgIGZvcih2YXIgaj0wOyBqPGs7IGorKykge1xuICAgICAgICAgIHdyID0gX2NzdGJbaCArIG40XTtcbiAgICAgICAgICB3aSA9IGludipfY3N0YltoXTtcbiAgICAgICAgICBmb3IodmFyIGk9ajsgaTxfbjsgaSs9KGs8PDEpKSB7XG4gICAgICAgICAgICBpayA9IGkgKyBrO1xuICAgICAgICAgICAgeHIgPSB3cipyZVtpa10gKyB3aSppbVtpa107XG4gICAgICAgICAgICB4aSA9IHdyKmltW2lrXSAtIHdpKnJlW2lrXTtcbiAgICAgICAgICAgIHJlW2lrXSA9IHJlW2ldIC0geHI7XG4gICAgICAgICAgICByZVtpXSArPSB4cjtcbiAgICAgICAgICAgIGltW2lrXSA9IGltW2ldIC0geGk7XG4gICAgICAgICAgICBpbVtpXSArPSB4aTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaCArPSBkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICAvLyBpbml0aWFsaXplIHRoZSBhcnJheSAoc3VwcG9ydHMgVHlwZWRBcnJheSlcbiAgICBfaW5pdEFycmF5IDogZnVuY3Rpb24oKSB7XG4gICAgICBpZih0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgaWYoX248PTI1NilcbiAgICAgICAgICBfYml0cmV2ID0gbmV3IFVpbnQ4QXJyYXkoX24pO1xuICAgICAgICBlbHNlIGlmKF9uPD02NTUzNilcbiAgICAgICAgICBfYml0cmV2ID0gbmV3IFVpbnQxNkFycmF5KF9uKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIF9iaXRyZXYgPSBuZXcgVWludDMyQXJyYXkoX24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX2JpdHJldiA9IFtdO1xuICAgICAgfVxuICAgICAgaWYodHlwZW9mIEZsb2F0NjRBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgX2NzdGIgPSBuZXcgRmxvYXQ2NEFycmF5KF9uKjEuMjUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX2NzdGIgPSBbXTtcbiAgICAgIH1cbiAgICB9LFxuICAgIC8vIHplcm8gcGFkZGluZ1xuICAgIF9wYWRkaW5nWmVybyA6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gVE9ET1xuICAgIH0sXG4gICAgLy8gbWFrZXMgYml0IHJldmVyc2FsIHRhYmxlXG4gICAgX21ha2VCaXRSZXZlcnNhbFRhYmxlIDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaSA9IDAsXG4gICAgICAgIGogPSAwLFxuICAgICAgICBrID0gMDtcbiAgICAgIF9iaXRyZXZbMF0gPSAwO1xuICAgICAgd2hpbGUoKytpIDwgX24pIHtcbiAgICAgICAgayA9IF9uID4+IDE7XG4gICAgICAgIHdoaWxlKGsgPD0gaikge1xuICAgICAgICAgIGogLT0gaztcbiAgICAgICAgICBrID4+PSAxO1xuICAgICAgICB9XG4gICAgICAgIGogKz0gaztcbiAgICAgICAgX2JpdHJldltpXSA9IGo7XG4gICAgICB9XG4gICAgfSxcbiAgICAvLyBtYWtlcyB0cmlnb25vbWV0aXJpYyBmdW5jdGlvbiB0YWJsZVxuICAgIF9tYWtlQ29zU2luVGFibGUgOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBuMiA9IF9uID4+IDEsXG4gICAgICAgIG40ID0gX24gPj4gMixcbiAgICAgICAgbjggPSBfbiA+PiAzLFxuICAgICAgICBuMnA0ID0gbjIgKyBuNCxcbiAgICAgICAgdCA9IE1hdGguc2luKE1hdGguUEkvX24pLFxuICAgICAgICBkYyA9IDIqdCp0LFxuICAgICAgICBkcyA9IE1hdGguc3FydChkYyooMiAtIGRjKSksXG4gICAgICAgIGMgPSBfY3N0YltuNF0gPSAxLFxuICAgICAgICBzID0gX2NzdGJbMF0gPSAwO1xuICAgICAgdCA9IDIqZGM7XG4gICAgICBmb3IodmFyIGk9MTsgaTxuODsgaSsrKSB7XG4gICAgICAgIGMgLT0gZGM7XG4gICAgICAgIGRjICs9IHQqYztcbiAgICAgICAgcyArPSBkcztcbiAgICAgICAgZHMgLT0gdCpzO1xuICAgICAgICBfY3N0YltpXSA9IHM7XG4gICAgICAgIF9jc3RiW240IC0gaV0gPSBjO1xuICAgICAgfVxuICAgICAgaWYobjggIT09IDApIHtcbiAgICAgICAgX2NzdGJbbjhdID0gTWF0aC5zcXJ0KDAuNSk7XG4gICAgICB9XG4gICAgICBmb3IodmFyIGo9MDsgajxuNDsgaisrKSB7XG4gICAgICAgIF9jc3RiW24yIC0gal0gID0gX2NzdGJbal07XG4gICAgICB9XG4gICAgICBmb3IodmFyIGs9MDsgazxuMnA0OyBrKyspIHtcbiAgICAgICAgX2NzdGJbayArIG4yXSA9IC1fY3N0YltrXTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIC8vIGFsaWFzZXMgKHB1YmxpYyBBUElzKVxuICB2YXIgYXBpcyA9IFsnaW5pdCcsICdmZnQxZCcsICdpZmZ0MWQnLCAnZmZ0MmQnLCAnaWZmdDJkJ107XG4gIGZvcih2YXIgaT0wOyBpPGFwaXMubGVuZ3RoOyBpKyspIHtcbiAgICBGRlRbYXBpc1tpXV0gPSBjb3JlW2FwaXNbaV1dO1xuICB9XG4gIEZGVC5mZnQgPSBjb3JlLmZmdDFkO1xuICBGRlQuaWZmdCA9IGNvcmUuaWZmdDFkO1xufSkuY2FsbCh0aGlzKTtcblxuLyoqXG4gKiBTcGF0aWFsIEZyZXF1ZW5jeSBGaWx0ZXJpbmdcbiAqIEhpZ2gtcGFzcy9Mb3ctcGFzcy9CYW5kLXBhc3MgRmlsdGVyXG4gKiBXaW5kb3dpbmcgdXNpbmcgaGFtbWluZyB3aW5kb3dcbiAqL1xuKGZ1bmN0aW9uKCkge1xuICB2YXIgRnJlcXVlbmN5RmlsdGVyOyAgLy8gdG9wLWxldmVsIG5hbWVzcGFjZVxuICB2YXIgX3Jvb3QgPSB0aGlzOyAgICAgLy8gcmVmZXJlbmNlIHRvICd3aW5kb3cnIG9yICdnbG9iYWwnXG5cbiAgaWYodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgRnJlcXVlbmN5RmlsdGVyID0gZXhwb3J0czsgICAvLyBmb3IgQ29tbW9uSlNcbiAgfSBlbHNlIHtcbiAgICBGcmVxdWVuY3lGaWx0ZXIgPSBfcm9vdC5GcmVxdWVuY3lGaWx0ZXIgPSB7fTtcbiAgfVxuXG4gIC8vIGNvcmUgb3BlcmF0aW9uc1xuICB2YXIgX24gPSAwO1xuICB2YXIgY29yZSA9IHtcbiAgICBpbml0IDogZnVuY3Rpb24obikge1xuICAgICAgaWYobiAhPT0gMCAmJiAobiAmIChuIC0gMSkpID09PSAwKSB7XG4gICAgICAgIF9uID0gbjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImluaXQ6IHJhZGl4LTIgcmVxdWlyZWRcIik7XG4gICAgICB9XG4gICAgfSxcbiAgICAvLyBzd2FwcyBxdWFkcmFudFxuICAgIHN3YXAgOiBmdW5jdGlvbihyZSwgaW0pIHtcbiAgICAgIHZhciB4biwgeW4sIGksIGosIGssIGwsIHRtcCxcbiAgICAgICAgbGVuID0gX24gPj4gMTtcbiAgICAgIGZvcih2YXIgeT0wOyB5PGxlbjsgeSsrKSB7XG4gICAgICAgIHluID0geSArIGxlbjtcbiAgICAgICAgZm9yKHZhciB4PTA7IHg8bGVuOyB4KyspIHtcbiAgICAgICAgICB4biA9IHggKyBsZW47XG4gICAgICAgICAgaSA9IHggKyB5Kl9uO1xuICAgICAgICAgIGogPSB4biArIHluKl9uO1xuICAgICAgICAgIGsgPSB4ICsgeW4qX247XG4gICAgICAgICAgbCA9IHhuICsgeSpfbjtcbiAgICAgICAgICB0bXAgPSByZVtpXTtcbiAgICAgICAgICByZVtpXSA9IHJlW2pdO1xuICAgICAgICAgIHJlW2pdID0gdG1wO1xuICAgICAgICAgIHRtcCA9IHJlW2tdO1xuICAgICAgICAgIHJlW2tdID0gcmVbbF07XG4gICAgICAgICAgcmVbbF0gPSB0bXA7XG4gICAgICAgICAgdG1wID0gaW1baV07XG4gICAgICAgICAgaW1baV0gPSBpbVtqXTtcbiAgICAgICAgICBpbVtqXSA9IHRtcDtcbiAgICAgICAgICB0bXAgPSBpbVtrXTtcbiAgICAgICAgICBpbVtrXSA9IGltW2xdO1xuICAgICAgICAgIGltW2xdID0gdG1wO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICAvLyBhcHBsaWVzIEhpZ2gtUGFzcyBGaWx0ZXJcbiAgICBIUEYgOiBmdW5jdGlvbihyZSwgaW0sIHJhZGl1cykge1xuICAgICAgdmFyIGkgPSAwLFxuICAgICAgICBwID0gMCxcbiAgICAgICAgciA9IDAuMCxcbiAgICAgICAgbjIgPSBfbiA+PiAxLFxuICAgICAgICBzcXJ0ID0gTWF0aC5zcXJ0O1xuICAgICAgZm9yKHZhciB5PS1uMjsgeTxuMjsgeSsrKSB7XG4gICAgICAgIGkgPSBuMiArICh5ICsgbjIpKl9uO1xuICAgICAgICBmb3IodmFyIHg9LW4yOyB4PG4yOyB4KyspIHtcbiAgICAgICAgICByID0gc3FydCh4KnggKyB5KnkpO1xuICAgICAgICAgIHAgPSB4ICsgaTtcbiAgICAgICAgICBpZihyIDwgcmFkaXVzKSB7XG4gICAgICAgICAgICByZVtwXSA9IGltW3BdID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIC8vIGFwcGxpZXMgTG93LVBhc3MgRmlsdGVyXG4gICAgTFBGIDogZnVuY3Rpb24ocmUsIGltLCByYWRpdXMpIHtcbiAgICAgIHZhciBpID0gMCxcbiAgICAgICAgcCA9IDAsXG4gICAgICAgIHIgPSAwLjAsXG4gICAgICAgIG4yID0gX24gPj4gMSxcbiAgICAgICAgc3FydCA9IE1hdGguc3FydDtcbiAgICAgIGZvcih2YXIgeT0tbjI7IHk8bjI7IHkrKykge1xuICAgICAgICBpID0gbjIgKyAoeSArIG4yKSpfbjtcbiAgICAgICAgZm9yKHZhciB4PS1uMjsgeDxuMjsgeCsrKSB7XG4gICAgICAgICAgciA9IHNxcnQoeCp4ICsgeSp5KTtcbiAgICAgICAgICBwID0geCArIGk7XG4gICAgICAgICAgaWYociA+IHJhZGl1cykge1xuICAgICAgICAgICAgcmVbcF0gPSBpbVtwXSA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICAvLyBhcHBsaWVzIEJhbmQtUGFzcyBGaWx0ZXJcbiAgICBCUEYgOiBmdW5jdGlvbihyZSwgaW0sIHJhZGl1cywgYmFuZHdpZHRoKSB7XG4gICAgICB2YXIgaSA9IDAsXG4gICAgICAgIHAgPSAwLFxuICAgICAgICByID0gMC4wLFxuICAgICAgICBuMiA9IF9uID4+IDEsXG4gICAgICAgIHNxcnQgPSBNYXRoLnNxcnQ7XG4gICAgICBmb3IodmFyIHk9LW4yOyB5PG4yOyB5KyspIHtcbiAgICAgICAgaSA9IG4yICsgKHkgKyBuMikqX247XG4gICAgICAgIGZvcih2YXIgeD0tbjI7IHg8bjI7IHgrKykge1xuICAgICAgICAgIHIgPSBzcXJ0KHgqeCArIHkqeSk7XG4gICAgICAgICAgcCA9IHggKyBpO1xuICAgICAgICAgIGlmKHIgPCByYWRpdXMgfHwgciA+IChyYWRpdXMgKyBiYW5kd2lkdGgpKSB7XG4gICAgICAgICAgICByZVtwXSA9IGltW3BdID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIC8vIHdpbmRvd2luZyB1c2luZyBoYW1taW5nIHdpbmRvd1xuICAgIHdpbmRvd2luZyA6IGZ1bmN0aW9uKGRhdGEsIGludikge1xuICAgICAgdmFyIGxlbiA9IGRhdGEubGVuZ3RoLFxuICAgICAgICBwaSA9IE1hdGguUEksXG4gICAgICAgIGNvcyA9IE1hdGguY29zO1xuICAgICAgZm9yKHZhciBpPTA7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgaWYoaW52ID09PSAxKSB7XG4gICAgICAgICAgZGF0YVtpXSAqPSAwLjU0IC0gMC40Nipjb3MoMipwaSppLyhsZW4gLSAxKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGF0YVtpXSAvPSAwLjU0IC0gMC40Nipjb3MoMipwaSppLyhsZW4gLSAxKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIC8vIGFsaWFzZXMgKHB1YmxpYyBBUElzKVxuICB2YXIgYXBpcyA9IFsnaW5pdCcsICdzd2FwJywgJ0hQRicsICdMUEYnLCAnQlBGJywgJ3dpbmRvd2luZyddO1xuICBmb3IodmFyIGk9MDsgaTxhcGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgRnJlcXVlbmN5RmlsdGVyW2FwaXNbaV1dID0gY29yZVthcGlzW2ldXTtcbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuLyoqXG4gKiBGRlQgUG93ZXIgU3BlY3RydW0gVmlld2VyXG4gKi9cbihmdW5jdGlvbigpIHtcbiAgdmFyIFNwZWN0cnVtVmlld2VyOyAgLy8gdG9wLWxldmVsIG5hbWVzcGFjZVxuICB2YXIgX3Jvb3QgPSB0aGlzOyAgICAvLyByZWZlcmVuY2UgdG8gJ3dpbmRvdycgb3IgJ2dsb2JhbCdcblxuICBpZih0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBTcGVjdHJ1bVZpZXdlciA9IGV4cG9ydHM7ICAgLy8gZm9yIENvbW1vbkpTXG4gIH0gZWxzZSB7XG4gICAgU3BlY3RydW1WaWV3ZXIgPSBfcm9vdC5TcGVjdHJ1bVZpZXdlciA9IHt9O1xuICB9XG5cbiAgLy8gY29yZSBvcGVyYXRpb25zXG4gIHZhciBfY29udGV4dCA9IG51bGwsXG4gICAgX24gPSAwLFxuICAgIF9pbWcgPSBudWxsLFxuICAgIF9kYXRhID0gbnVsbDtcbiAgdmFyIGNvcmUgPSB7XG4gICAgaW5pdCA6IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICAgIF9jb250ZXh0ID0gY29udGV4dDtcbiAgICAgIF9uID0gY29udGV4dC5jYW52YXMud2lkdGgsXG4gICAgICAgIF9pbWcgPSBjb250ZXh0LmdldEltYWdlRGF0YSgwLCAwLCBfbiwgX24pO1xuICAgICAgX2RhdGEgPSBfaW1nLmRhdGE7XG4gICAgfSxcbiAgICAvLyByZW5kZXJzIEZGVCBwb3dlciBzcGVjdHJ1bSBvbiB0aGUgY2FudmFzXG4gICAgcmVuZGVyIDogZnVuY3Rpb24ocmUsIGltLCBpc2xvZykge1xuICAgICAgdmFyIHZhbCA9IDAsXG4gICAgICAgIGkgPSAwLFxuICAgICAgICBwID0gMCxcbiAgICAgICAgc3BlY3RydW0gPSBbXSxcbiAgICAgICAgbWF4ID0gMS4wLFxuICAgICAgICBpbWF4ID0gMC4wLFxuICAgICAgICBuMiA9IF9uKl9uLFxuICAgICAgICBsb2cgPSBNYXRoLmxvZyxcbiAgICAgICAgc3FydCA9IE1hdGguc3FydDtcbiAgICAgIGZvcih2YXIgaT0wOyBpPG4yOyBpKyspIHtcbiAgICAgICAgaWYoaXNsb2cpe1xuICAgICAgICAgIHNwZWN0cnVtW2ldID0gbG9nKE1hdGguc3FydChyZVtpXSpyZVtpXSArIGltW2ldKmltW2ldKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3BlY3RydW1baV0gPSBzcXJ0KHJlW2ldKnJlW2ldICsgaW1baV0qaW1baV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmKHNwZWN0cnVtW2ldID4gbWF4KSB7XG4gICAgICAgICAgbWF4ID0gc3BlY3RydW1baV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGltYXggPSAxL21heDtcbiAgICAgIGZvcih2YXIgaj0wOyBqPG4yOyBqKyspIHtcbiAgICAgICAgc3BlY3RydW1bal0gPSBzcGVjdHJ1bVtqXSoyNTUqaW1heDtcbiAgICAgIH1cbiAgICAgIGZvcih2YXIgeT0wOyB5PF9uOyB5KyspIHtcbiAgICAgICAgaSA9IHkqX247XG4gICAgICAgIGZvcih2YXIgeD0wOyB4PF9uOyB4KyspIHtcbiAgICAgICAgICB2YWwgPSBzcGVjdHJ1bVtpICsgeF07XG4gICAgICAgICAgcCA9IChpIDw8IDIpICsgKHggPDwgMik7XG4gICAgICAgICAgX2RhdGFbcF0gPSAwO1xuICAgICAgICAgIF9kYXRhW3AgKyAxXSA9IHZhbDtcbiAgICAgICAgICBfZGF0YVtwICsgMl0gPSB2YWwgPj4gMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgX2NvbnRleHQucHV0SW1hZ2VEYXRhKF9pbWcsIDAsIDApO1xuICAgIH1cbiAgfTtcbiAgLy8gYWxpYXNlcyAocHVibGljIEFQSXMpXG4gIFNwZWN0cnVtVmlld2VyLmluaXQgPSBjb3JlLmluaXQ7XG4gIFNwZWN0cnVtVmlld2VyLnJlbmRlciA9IGNvcmUucmVuZGVyO1xufSkuY2FsbCh0aGlzKTtcbiJdLCJuYW1lcyI6WyJGRlQiLCJfcm9vdCIsImV4cG9ydHMiLCJ2ZXJzaW9uIiwicmVsZWFzZSIsImRhdGUiLCJ0b1N0cmluZyIsIl9uIiwiX2JpdHJldiIsIl9jc3RiIiwiY29yZSIsImluaXQiLCJuIiwiX2luaXRBcnJheSIsIl9tYWtlQml0UmV2ZXJzYWxUYWJsZSIsIl9tYWtlQ29zU2luVGFibGUiLCJFcnJvciIsImZmdDFkIiwicmUiLCJpbSIsImZmdCIsImlmZnQxZCIsImkiLCJmZnQyZCIsInRyZSIsInRpbSIsInkiLCJ4MSIsIngyIiwieCIsInkxIiwieTIiLCJpZmZ0MmQiLCJpbnYiLCJkIiwiaCIsImlrIiwibSIsInRtcCIsIndyIiwid2kiLCJ4ciIsInhpIiwibjQiLCJsIiwiayIsImoiLCJVaW50OEFycmF5IiwiVWludDE2QXJyYXkiLCJVaW50MzJBcnJheSIsIkZsb2F0NjRBcnJheSIsIl9wYWRkaW5nWmVybyIsIm4yIiwibjgiLCJuMnA0IiwidCIsIk1hdGgiLCJzaW4iLCJQSSIsImRjIiwiZHMiLCJzcXJ0IiwiYyIsInMiLCJhcGlzIiwibGVuZ3RoIiwiaWZmdCIsImNhbGwiLCJGcmVxdWVuY3lGaWx0ZXIiLCJzd2FwIiwieG4iLCJ5biIsImxlbiIsIkhQRiIsInJhZGl1cyIsInAiLCJyIiwiTFBGIiwiQlBGIiwiYmFuZHdpZHRoIiwid2luZG93aW5nIiwiZGF0YSIsInBpIiwiY29zIiwiU3BlY3RydW1WaWV3ZXIiLCJfY29udGV4dCIsIl9pbWciLCJfZGF0YSIsImNvbnRleHQiLCJjYW52YXMiLCJ3aWR0aCIsImdldEltYWdlRGF0YSIsInJlbmRlciIsImlzbG9nIiwidmFsIiwic3BlY3RydW0iLCJtYXgiLCJpbWF4IiwibG9nIiwicHV0SW1hZ2VEYXRhIl0sIm1hcHBpbmdzIjoiQUFBQTs7O0NBR0MsR0FDQSxDQUFBO0lBQ0MsSUFBSUEsS0FBZSxzQkFBc0I7SUFDekMsSUFBSUMsUUFBUSxJQUFJLEVBQUcsb0NBQW9DO0lBRXZELElBQUcsT0FBT0MsWUFBWSxhQUFhO1FBQ2pDRixNQUFNRSxTQUFXLGVBQWU7SUFDbEMsT0FBTztRQUNMRixNQUFNQyxNQUFNRCxHQUFHLEdBQUcsQ0FBQztJQUNyQjtJQUVBLElBQUlHLFVBQVU7UUFDWkMs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