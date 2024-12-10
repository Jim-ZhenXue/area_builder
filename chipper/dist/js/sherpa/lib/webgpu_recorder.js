let WebGPURecorder = class WebGPURecorder {
    // private:
    _frameStart() {
        this._frameIndex++;
        this._frameVariables[this._frameIndex] = new Set();
        this._currentFrameCommands = [];
        this._frameCommands.push(this._currentFrameCommands);
    }
    _frameEnd() {
        if (this._frameIndex == this.config.maxFrameCount) {
            this._isRecording = false;
            this._generateOutput();
        }
    }
    _generateOutput() {
        let s = `<html>
    <body style="text-align: center;">
        <canvas id="#webgpu" width=${this.config.canvasWidth} height=${this.config.canvasHeight}></canvas>
        <script>
let D = new Array(${this._arrayCache.length});
async function main() {
  let canvas = document.getElementById("#webgpu");
  let frameLabel = document.createElement("div");
  frameLabel.style = "position: absolute; top: 10px; left: 10px; font-size: 24pt; color: #f00;";
  document.body.append(frameLabel);
  ${this._getVariableDeclarations(-1)}
  ${this._initializeCommands.join("\n  ")}\n`;
        for(let fi = 0, fl = this._frameCommands.length; fi < fl; ++fi){
            s += `async function f${fi}() {
  ${this._getVariableDeclarations(fi)}
  ${this._frameCommands[fi].join("\n  ")}
}\n`;
        }
        s += "    let frames=[";
        for(let fi = 0, fl = this._frameCommands.length; fi < fl; ++fi){
            s += `f${fi},`;
        }
        s += "];";
        s += `
    let frame = 0;
    let lastFrame = -1;
    let t0 = performance.now();
    async function renderFrame() {
        if (frame > ${this._frameCommands.length - 1}) return;
        requestAnimationFrame(renderFrame);
        if (frame == lastFrame) return;
        lastFrame = frame;
        let t1 = performance.now();
        frameLabel.innerText = "F: " + frame + "  T:" + (t1 - t0).toFixed(2);
        t0 = t1;
        try {
            await frames[frame]();
        } catch (err) {
            console.log("Error Frame:", frame);
            console.error(err);
        }
        frame++;
    }
    requestAnimationFrame(renderFrame);
}

function decodeBase64(str) {
    const base64codes = [
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 62, 255, 255, 255, 63,
        52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 255, 255, 255, 0, 255, 255,
        255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 255, 255, 255, 255, 255,
        255, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
    ];

    function getBase64Code(charCode) {
        if (charCode >= base64codes.length) {
            throw new Error("Unable to parse base64 string.");
        }
        const code = base64codes[charCode];
        if (code === 255) {
            throw new Error("Unable to parse base64 string.");
        }
        return code;
    }

    if (str.length % 4 !== 0) {
        throw new Error("Unable to parse base64 string.");
    }

    const index = str.indexOf("=");
    if (index !== -1 && index < str.length - 2) {
        throw new Error("Unable to parse base64 string.");
    }

    let missingOctets = str.endsWith("==") ? 2 : str.endsWith("=") ? 1 : 0;
    let n = str.length;
    let result = new Uint8Array(3 * (n / 4));
    for (let i = 0, j = 0; i < n; i += 4, j += 3) {
        let buffer =
            getBase64Code(str.charCodeAt(i)) << 18 |
            getBase64Code(str.charCodeAt(i + 1)) << 12 |
            getBase64Code(str.charCodeAt(i + 2)) << 6 |
            getBase64Code(str.charCodeAt(i + 3));
        result[j] = buffer >> 16;
        result[j + 1] = (buffer >> 8) & 0xFF;
        result[j + 2] = buffer & 0xFF;
    }
    return result.subarray(0, result.length - missingOctets);
}

function B64ToA(s, type, length) {
    let x = decodeBase64(s);
    if (type == "Uint32Array")
        return new Uint32Array(x.buffer, 0, x.length/4);
    return new Uint8Array(x.buffer, 0, x.length);
}\n`;
        for(let ai = 0; ai < this._arrayCache.length; ++ai){
            let a = this._arrayCache[ai];
            let b64 = this._arrayToBase64(a.array);
            s += `D[${ai}] = B64ToA("${b64}", "${a.type}", ${a.length});\n`;
        }
        s += `
window.addEventListener('load', main);
        </script>
    </body>
</html>\n`;
        this._downloadFile(s, (this.config.exportName || 'WebGpuRecord') + ".html");
    }
    _encodeBase64(bytes) {
        const _b2a = [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G",
            "H",
            "I",
            "J",
            "K",
            "L",
            "M",
            "N",
            "O",
            "P",
            "Q",
            "R",
            "S",
            "T",
            "U",
            "V",
            "W",
            "X",
            "Y",
            "Z",
            "a",
            "b",
            "c",
            "d",
            "e",
            "f",
            "g",
            "h",
            "i",
            "j",
            "k",
            "l",
            "m",
            "n",
            "o",
            "p",
            "q",
            "r",
            "s",
            "t",
            "u",
            "v",
            "w",
            "x",
            "y",
            "z",
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "+",
            "/"
        ];
        let result = '', i, l = bytes.length;
        for(i = 2; i < l; i += 3){
            result += _b2a[bytes[i - 2] >> 2];
            result += _b2a[(bytes[i - 2] & 0x03) << 4 | bytes[i - 1] >> 4];
            result += _b2a[(bytes[i - 1] & 0x0F) << 2 | bytes[i] >> 6];
            result += _b2a[bytes[i] & 0x3F];
        }
        if (i === l + 1) {
            result += _b2a[bytes[i - 2] >> 2];
            result += _b2a[(bytes[i - 2] & 0x03) << 4];
            result += "==";
        }
        if (i === l) {
            result += _b2a[bytes[i - 2] >> 2];
            result += _b2a[(bytes[i - 2] & 0x03) << 4 | bytes[i - 1] >> 4];
            result += _b2a[(bytes[i - 1] & 0x0F) << 2];
            result += "=";
        }
        return result;
    }
    _arrayToBase64(a) {
        return this._encodeBase64(new Uint8Array(a.buffer, a.byteOffset, a.byteLength));
    }
    _downloadFile(data, filename) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([
            data
        ], {
            type: 'application/javascript'
        }));
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    _wrapCanvas(c) {
        if (c.__id) return;
        this._registerObject(c);
        let self = this;
        let __getContext = c.getContext;
        c.getContext = function(a1, a2) {
            let ret = __getContext.call(c, a1, a2);
            if (a1 == 'webgpu') {
                if (ret) {
                    self._wrapContext(ret);
                }
            }
            return ret;
        };
    }
    _wrapCanvases() {
        let canvases = document.getElementsByTagName('canvas');
        for(let i = 0; i < canvases.length; ++i){
            let c = canvases[i];
            this._wrapCanvas(c);
        }
    }
    _registerObject(object) {
        let id = this._objectIndex++;
        object.__id = id;
        object.__frame = this._frameIndex;
    }
    _isFrameVariable(frame, name) {
        return this._frameVariables[frame] && this._frameVariables[frame].has(name);
    }
    _removeVariable(name) {
        for(let f in this._frameVariables){
            let fs = this._frameVariables[f];
            fs.delete(name);
        }
    }
    _addVariable(frame, name) {
        this._frameVariables[frame].add(name);
    }
    _getVariableDeclarations(frame) {
        let s = this._frameVariables[frame];
        if (!s.size) return "";
        return `let ${[
            ...s
        ].join(",")};`;
    }
    _getObjectVariable(object) {
        if (object.__id === undefined) this._registerObject(object);
        let name = `x${(object.__id || 0).toString(16)}`;
        if (this._frameIndex != object.__frame) {
            if (!this._isFrameVariable(-1, name)) {
                this._removeVariable(name);
                this._addVariable(-1, name);
            }
        } else {
            this._addVariable(this._frameIndex, name);
        }
        return name;
    }
    _wrapContext(ctx) {
        this._recordLine(`${this._getObjectVariable(ctx)} = canvas.getContext('webgpu');`);
        this._wrapObject(ctx);
    }
    _objectHasMethods(object) {
        for(let m in object){
            if (typeof object[m] == "function" && WebGPURecorder._skipMethods.indexOf(m) == -1) {
                return true;
            }
        }
        return false;
    }
    _wrapObject(object) {
        for(let m in object){
            if (typeof object[m] == "function") {
                if (WebGPURecorder._skipMethods.indexOf(m) == -1) {
                    if (WebGPURecorder._asyncMethods.indexOf(m) != -1) this._wrapAsync(object, m);
                    else this._wrapMethod(object, m);
                }
            } else if (typeof object[m] == "object") {
                let o = object[m];
                if (!o || o.__id) continue;
                let hasMethod = this._objectHasMethods(o);
                if (!o.__id && hasMethod) {
                    this._recordLine(`${this._getObjectVariable(o)} = ${this._getObjectVariable(object)}['${m}'];`);
                    this._wrapObject(o);
                }
            }
        }
    }
    _getBytesFromImageSource(src) {
        let canvas = document.createElement("canvas");
        canvas.width = src.width;
        canvas.height = src.height;
        let c2d = canvas.getContext("2d");
        c2d.drawImage(src, 0, 0);
        let data = c2d.getImageData(0, 0, src.width, src.height);
        return data.data;
    }
    _wrapMethod(object, method) {
        if (WebGPURecorder._skipMethods.indexOf(method) != -1) return;
        let origMethod = object[method];
        let self = this;
        object[method] = function() {
            // We can't track every change made to a mappedRange buffer since that all happens 
            // outside the scope of what WebGPU is in control of. So we keep track of all the
            // mapped buffer ranges, and when unmap is called, we record the content of their data
            // so that they have their correct data for the unmap.
            if (method == "unmap") {
                if (object.__mappedRanges) {
                    for (let buffer of object.__mappedRanges){
                        // Make a copy of the mappedRange buffer data as it is when unmap
                        // is called.
                        let cacheIndex = self._getDataCache(buffer, 0, buffer.byteLength);
                        // Set the mappedRange buffer data in the recording to what is in the buffer
                        // at the time unmap is called.
                        self._recordLine(`new Uint8Array(${self._getObjectVariable(buffer)}).set(D[${cacheIndex}]);`);
                    }
                    delete object.__mappedRanges;
                }
            } else if (method == "copyExternalImageToTexture") {
                origMethod.call(object, ...arguments);
                // copyExternalImageToTexture uses ImageBitmap (or canvas or offscreenCanvas) as
                // its source, which we can't record. ConvertcopyExternalImageToTexture to
                // writeTexture, and record the bytes from the ImageBitmap. To do that, we need
                // to draw the ImageBitmap into a canvas, and record the bytes from that.
                // A very heavy process, but not sure what else to do.
                let bytes = self._getBytesFromImageSource(arguments[0].source);
                let bytesPerPixel = 4;
                let bytesPerRow = arguments[0].source.width * bytesPerPixel;
                let cacheIndex = self._getDataCache(bytes, bytes.byteOffset, bytes.byteLength);
                self._recordLine(`${self._getObjectVariable(object)}.writeTexture(${self._stringifyObject(arguments[1])}, D[${cacheIndex}], {bytesPerRow:${bytesPerRow}}, ${self._stringifyObject(arguments[2])});`);
                return;
            }
            let result = origMethod.call(object, ...arguments);
            self._recordCommand(false, object, method, result, arguments);
            // Keep track of the mapped ranges for the buffer object. The recording will set their
            // data when unmap is called.
            if (method == "getMappedRange") {
                if (!object.__mappedRanges) object.__mappedRanges = [];
                object.__mappedRanges.push(result);
            }
            return result;
        };
    }
    _wrapAsync(object, method) {
        let origMethod = object[method];
        let self = this;
        object[method] = function() {
            let promise = origMethod.call(object, ...arguments);
            let wrappedPromise = new Promise((resolve)=>{
                promise.then((result)=>{
                    if (result.__id) {
                        resolve(result);
                        return;
                    }
                    self._recordCommand(true, object, method, result, arguments);
                    resolve(result);
                });
            });
            return wrappedPromise;
        };
    }
    _stringifyObject(object) {
        let s = "";
        let first = true;
        for(let key in object){
            let value = object[key];
            if (value === undefined) {
                continue;
            }
            if (!first) s += ",";
            first = false;
            s += `"${key}":`;
            if (value === null) {
                s += "null";
            } else if (typeof value == "string") {
                s += `\`${value}\``;
            } else if (value.__id !== undefined) {
                s += this._getObjectVariable(value);
            } else if (value.__data !== undefined) {
                s += `D[${value.__data}]`;
            } else if (value.constructor == Array) {
                s += this._stringifyArray(value);
            } else if (typeof value == "object") {
                s += this._stringifyObject(value);
            } else {
                s += `${value}`;
            }
        }
        s = "{" + s + "}";
        return s;
    }
    _stringifyArray(a) {
        let s = "[";
        s += this._stringifyArgs("", a);
        s += "]";
        return s;
    }
    _getDataCache(heap, offset, length) {
        let self = this;
        function _heapAccessShiftForWebGPUHeap(heap) {
            if (!heap.BYTES_PER_ELEMENT) return 0;
            return 31 - Math.clz32(heap.BYTES_PER_ELEMENT);
        }
        function _compareCacheData(ai, view) {
            let a = self._arrayCache[ai].array;
            if (a.length != view.length) return false;
            for(let i = 0, l = a.length; i < l; ++i){
                if (a[i] != view[i]) {
                    return false;
                }
            }
            return true;
        }
        var _heap_byteOffset;
        let byteOffset = ((_heap_byteOffset = heap.byteOffset) != null ? _heap_byteOffset : 0) + offset << _heapAccessShiftForWebGPUHeap(heap);
        let byteLength = length << _heapAccessShiftForWebGPUHeap(heap);
        this._totalData += byteLength;
        var _heap_buffer;
        let view = new Uint8Array((_heap_buffer = heap.buffer) != null ? _heap_buffer : heap, byteOffset, byteLength);
        let cacheIndex = -1;
        for(let ai = 0; ai < self._arrayCache.length; ++ai){
            let c = self._arrayCache[ai];
            if (c.length == length) {
                if (_compareCacheData(ai, view)) {
                    cacheIndex = ai;
                    break;
                }
            }
        }
        if (cacheIndex == -1) {
            cacheIndex = self._arrayCache.length;
            let arrayCopy = Uint8Array.from(view);
            self._arrayCache.push({
                length: byteLength,
                type: heap.constructor === "ArrayBuffer" ? Uint8Array : heap.constructor.name,
                array: arrayCopy
            });
        }
        return cacheIndex;
    }
    _stringifyArgs(method, args) {
        if (args.length == 0 || args.length == 1 && args[0] === undefined) return "";
        args = Array.from(args);
        // In order to capture buffer data, we need to know the offset and size of the data,
        // which are arguments of specific methods. So we need to special case those methods to
        // properly capture the buffer data passed to them.
        if (method == "writeBuffer") {
            let buffer = args[2];
            let offset = args[3];
            let size = args[4];
            let cacheIndex = this._getDataCache(buffer, offset, size);
            args[2] = {
                __data: cacheIndex
            };
            args[3] = 0;
        } else if (method == "writeTexture") {
            let buffer = args[1];
            let bytesPerRow = args[2].bytesPerRow;
            let rows = args[2].rowsPerImage || args[3].height || args[3][1] || 0;
            let size = bytesPerRow * rows;
            let offset = args[2].offset;
            let cacheIndex = this._getDataCache(buffer, offset, size);
            args[1] = {
                __data: cacheIndex
            };
            args[2].offset = 0;
        } else if (method == "setBindGroup") {
            if (args.length == 5) {
                let buffer = args[2];
                let offset = args[3];
                let size = args[4];
                let offsets = this._getDataCache(buffer, offset, size);
                args[2] = {
                    __data: offsets
                };
                args.length = 3;
            } else if (args.length == 3) {
                let buffer = args[2];
                let offsets = this._getDataCache(buffer, 0, buffer.length);
                args[2] = {
                    __data: offsets
                };
                args.length = 3;
            }
        }
        let argStrings = [];
        for (let a of args){
            if (a === undefined) {
                argStrings.push("undefined");
            } else if (a === null) {
                argStrings.push("null");
            } else if (a.__data !== undefined) {
                argStrings.push(`D[${a.__data}]`); // This is a captured data buffer.
            } else if (a.__id) {
                argStrings.push(this._getObjectVariable(a));
            } else if (a.constructor === Array) {
                argStrings.push(this._stringifyArray(a));
            } else if (typeof a == "object") {
                argStrings.push(this._stringifyObject(a));
            } else if (typeof a == "string") {
                argStrings.push(`\`${a}\``);
            } else {
                argStrings.push(a);
            }
        }
        return argStrings.join();
    }
    _recordLine(line) {
        if (this._isRecording) {
            if (this._frameIndex == -1) {
                this._initializeCommands.push(line);
            } else {
                this._currentFrameCommands.push(line);
            }
        }
    }
    _recordCommand(async, object, method, result, args) {
        if (this._isRecording) {
            if (result) {
                if (typeof result === "string") return;
                this._registerObject(result);
            }
            async = async ? "await " : "";
            if (result) {
                this._recordLine(`${this._getObjectVariable(result)} = ${async}${this._getObjectVariable(object)}.${method}(${this._stringifyArgs(method, args)});`);
            } else {
                this._recordLine(`${async}${this._getObjectVariable(object)}.${method}(${this._stringifyArgs(method, args)});`);
            }
            if (result && typeof result == "object") this._wrapObject(result);
        }
    }
    // public:
    constructor(options){
        options = options || {};
        this.config = {
            maxFrameCount: options.frames || 100,
            exportName: options.export || "WebGPURecord",
            canvasWidth: options.width || 800,
            canvasHeight: options.height || 600
        };
        this._objectIndex = 1;
        this._initalized = false;
        this._initializeCommands = [];
        this._frameCommands = [];
        this._currentFrameCommands = null;
        this._frameIndex = -1;
        this._isRecording = false;
        this._frameVariables = {};
        this._arrayCache = [];
        this._totalData = 0;
        if (!navigator.gpu) return;
        this._isRecording = true;
        this._initalized = true;
        this._frameIndex = -1;
        this._frameCommands = [];
        this._initializeCommands = [];
        this._frameVariables = {};
        this._frameVariables[-1] = new Set();
        this._registerObject(navigator.gpu);
        this._wrapObject(navigator.gpu);
        this._recordLine(`${this._getObjectVariable(navigator.gpu)} = navigator.gpu;`);
        this._wrapCanvases();
        let self = this;
        // Capture any dynamically created canvases
        let __createElement = document.createElement;
        document.createElement = function(type) {
            let element = __createElement.call(document, type);
            if (type == "canvas") {
                self._wrapCanvas(element);
            }
            return element;
        };
        // Wrap requestAnimationFrame so it can keep track of per-frame recording and know when
        // the maximum number of frames has been reached.
        //
        // It would be nice to be able to arbitrarily start/stop recording. To do this,
        // we would need to keep track of things like shader creation/deletion that can happen
        // at arbitrary frames prior to the start, for any objects used within that recorded
        // duration.
        let __requestAnimationFrame = window.requestAnimationFrame;
        window.requestAnimationFrame = function(cb) {
            function callback() {
                self._frameStart();
                cb(performance.now());
                self._frameEnd();
            }
            __requestAnimationFrame(callback);
        };
    }
};
WebGPURecorder._asyncMethods = [
    "requestAdapter",
    "requestDevice",
    "createComputePipelineAsync",
    "createRenderPipelineAsync"
];
WebGPURecorder._skipMethods = [
    "toString",
    "entries",
    "getContext",
    "forEach",
    "has",
    "keys",
    "values",
    "getPreferredFormat",
    "pushErrorScope",
    "popErrorScope"
];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvd2ViZ3B1X3JlY29yZGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFdlYkdQVVJlY29yZGVyIHtcbi8vIHB1YmxpYzpcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgICAgICAgIG1heEZyYW1lQ291bnQ6IG9wdGlvbnMuZnJhbWVzIHx8IDEwMCxcbiAgICAgICAgICAgIGV4cG9ydE5hbWU6IG9wdGlvbnMuZXhwb3J0IHx8IFwiV2ViR1BVUmVjb3JkXCIsXG4gICAgICAgICAgICBjYW52YXNXaWR0aDogb3B0aW9ucy53aWR0aCB8fCA4MDAsXG4gICAgICAgICAgICBjYW52YXNIZWlnaHQ6IG9wdGlvbnMuaGVpZ2h0IHx8IDYwMFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuX29iamVjdEluZGV4ID0gMTtcbiAgICAgICAgdGhpcy5faW5pdGFsaXplZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9pbml0aWFsaXplQ29tbWFuZHMgPSBbXTtcbiAgICAgICAgdGhpcy5fZnJhbWVDb21tYW5kcyA9IFtdO1xuICAgICAgICB0aGlzLl9jdXJyZW50RnJhbWVDb21tYW5kcyA9IG51bGw7XG4gICAgICAgIHRoaXMuX2ZyYW1lSW5kZXggPSAtMTtcbiAgICAgICAgdGhpcy5faXNSZWNvcmRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fZnJhbWVWYXJpYWJsZXMgPSB7fTtcbiAgICAgICAgdGhpcy5fYXJyYXlDYWNoZSA9IFtdO1xuICAgICAgICB0aGlzLl90b3RhbERhdGEgPSAwO1xuXG4gICAgICAgIGlmICghbmF2aWdhdG9yLmdwdSlcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB0aGlzLl9pc1JlY29yZGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuX2luaXRhbGl6ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLl9mcmFtZUluZGV4ID0gLTE7XG4gICAgICAgIHRoaXMuX2ZyYW1lQ29tbWFuZHMgPSBbXTtcbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZUNvbW1hbmRzID0gW107XG4gICAgICAgIHRoaXMuX2ZyYW1lVmFyaWFibGVzID0ge307XG4gICAgICAgIHRoaXMuX2ZyYW1lVmFyaWFibGVzWy0xXSA9IG5ldyBTZXQoKTtcblxuICAgICAgICB0aGlzLl9yZWdpc3Rlck9iamVjdChuYXZpZ2F0b3IuZ3B1KTtcbiAgICAgICAgdGhpcy5fd3JhcE9iamVjdChuYXZpZ2F0b3IuZ3B1KTtcbiAgICAgICAgdGhpcy5fcmVjb3JkTGluZShgJHt0aGlzLl9nZXRPYmplY3RWYXJpYWJsZShuYXZpZ2F0b3IuZ3B1KX0gPSBuYXZpZ2F0b3IuZ3B1O2ApO1xuXG4gICAgICAgIHRoaXMuX3dyYXBDYW52YXNlcygpO1xuXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICAvLyBDYXB0dXJlIGFueSBkeW5hbWljYWxseSBjcmVhdGVkIGNhbnZhc2VzXG4gICAgICAgIGxldCBfX2NyZWF0ZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50O1xuICAgICAgICBkb2N1bWVudC5jcmVhdGVFbGVtZW50ID0gZnVuY3Rpb24odHlwZSkge1xuICAgICAgICAgICAgbGV0IGVsZW1lbnQgPSBfX2NyZWF0ZUVsZW1lbnQuY2FsbChkb2N1bWVudCwgdHlwZSk7XG4gICAgICAgICAgICBpZiAodHlwZSA9PSBcImNhbnZhc1wiKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fd3JhcENhbnZhcyhlbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFdyYXAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIHNvIGl0IGNhbiBrZWVwIHRyYWNrIG9mIHBlci1mcmFtZSByZWNvcmRpbmcgYW5kIGtub3cgd2hlblxuICAgICAgICAvLyB0aGUgbWF4aW11bSBudW1iZXIgb2YgZnJhbWVzIGhhcyBiZWVuIHJlYWNoZWQuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIEl0IHdvdWxkIGJlIG5pY2UgdG8gYmUgYWJsZSB0byBhcmJpdHJhcmlseSBzdGFydC9zdG9wIHJlY29yZGluZy4gVG8gZG8gdGhpcyxcbiAgICAgICAgLy8gd2Ugd291bGQgbmVlZCB0byBrZWVwIHRyYWNrIG9mIHRoaW5ncyBsaWtlIHNoYWRlciBjcmVhdGlvbi9kZWxldGlvbiB0aGF0IGNhbiBoYXBwZW5cbiAgICAgICAgLy8gYXQgYXJiaXRyYXJ5IGZyYW1lcyBwcmlvciB0byB0aGUgc3RhcnQsIGZvciBhbnkgb2JqZWN0cyB1c2VkIHdpdGhpbiB0aGF0IHJlY29yZGVkXG4gICAgICAgIC8vIGR1cmF0aW9uLlxuICAgICAgICBsZXQgX19yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oY2IpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNhbGxiYWNrKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuX2ZyYW1lU3RhcnQoKTtcbiAgICAgICAgICAgICAgICBjYihwZXJmb3JtYW5jZS5ub3coKSk7XG4gICAgICAgICAgICAgICAgc2VsZi5fZnJhbWVFbmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF9fcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbi8vIHByaXZhdGU6XG4gICAgX2ZyYW1lU3RhcnQoKSB7XG4gICAgICAgIHRoaXMuX2ZyYW1lSW5kZXgrKztcbiAgICAgICAgdGhpcy5fZnJhbWVWYXJpYWJsZXNbdGhpcy5fZnJhbWVJbmRleF0gPSBuZXcgU2V0KCk7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRGcmFtZUNvbW1hbmRzID0gW107XG4gICAgICAgIHRoaXMuX2ZyYW1lQ29tbWFuZHMucHVzaCh0aGlzLl9jdXJyZW50RnJhbWVDb21tYW5kcyk7XG4gICAgfVxuXG4gICAgX2ZyYW1lRW5kKCkge1xuICAgICAgICBpZiAodGhpcy5fZnJhbWVJbmRleCA9PSB0aGlzLmNvbmZpZy5tYXhGcmFtZUNvdW50KSB7XG4gICAgICAgICAgICB0aGlzLl9pc1JlY29yZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fZ2VuZXJhdGVPdXRwdXQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9nZW5lcmF0ZU91dHB1dCgpIHtcbiAgICAgICAgbGV0IHMgPSBcbmA8aHRtbD5cbiAgICA8Ym9keSBzdHlsZT1cInRleHQtYWxpZ246IGNlbnRlcjtcIj5cbiAgICAgICAgPGNhbnZhcyBpZD1cIiN3ZWJncHVcIiB3aWR0aD0ke3RoaXMuY29uZmlnLmNhbnZhc1dpZHRofSBoZWlnaHQ9JHt0aGlzLmNvbmZpZy5jYW52YXNIZWlnaHR9PjwvY2FudmFzPlxuICAgICAgICA8c2NyaXB0PlxubGV0IEQgPSBuZXcgQXJyYXkoJHt0aGlzLl9hcnJheUNhY2hlLmxlbmd0aH0pO1xuYXN5bmMgZnVuY3Rpb24gbWFpbigpIHtcbiAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiI3dlYmdwdVwiKTtcbiAgbGV0IGZyYW1lTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBmcmFtZUxhYmVsLnN0eWxlID0gXCJwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogMTBweDsgbGVmdDogMTBweDsgZm9udC1zaXplOiAyNHB0OyBjb2xvcjogI2YwMDtcIjtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmQoZnJhbWVMYWJlbCk7XG4gICR7dGhpcy5fZ2V0VmFyaWFibGVEZWNsYXJhdGlvbnMoLTEpfVxuICAke3RoaXMuX2luaXRpYWxpemVDb21tYW5kcy5qb2luKFwiXFxuICBcIil9XFxuYDtcbmZvciAobGV0IGZpID0gMCwgZmwgPSB0aGlzLl9mcmFtZUNvbW1hbmRzLmxlbmd0aDsgZmkgPCBmbDsgKytmaSkge1xuICAgICAgICBzICs9IGBhc3luYyBmdW5jdGlvbiBmJHtmaX0oKSB7XG4gICR7dGhpcy5fZ2V0VmFyaWFibGVEZWNsYXJhdGlvbnMoZmkpfVxuICAke3RoaXMuX2ZyYW1lQ29tbWFuZHNbZmldLmpvaW4oXCJcXG4gIFwiKX1cbn1cXG5gO1xufVxucyArPSBcIiAgICBsZXQgZnJhbWVzPVtcIjtcbmZvciAobGV0IGZpID0gMCwgZmwgPSB0aGlzLl9mcmFtZUNvbW1hbmRzLmxlbmd0aDsgZmkgPCBmbDsgKytmaSkge1xuICAgIHMgKz0gYGYke2ZpfSxgO1xufVxucyArPSBcIl07XCI7XG5zICs9IGBcbiAgICBsZXQgZnJhbWUgPSAwO1xuICAgIGxldCBsYXN0RnJhbWUgPSAtMTtcbiAgICBsZXQgdDAgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICBhc3luYyBmdW5jdGlvbiByZW5kZXJGcmFtZSgpIHtcbiAgICAgICAgaWYgKGZyYW1lID4gJHt0aGlzLl9mcmFtZUNvbW1hbmRzLmxlbmd0aCAtIDF9KSByZXR1cm47XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXJGcmFtZSk7XG4gICAgICAgIGlmIChmcmFtZSA9PSBsYXN0RnJhbWUpIHJldHVybjtcbiAgICAgICAgbGFzdEZyYW1lID0gZnJhbWU7XG4gICAgICAgIGxldCB0MSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICBmcmFtZUxhYmVsLmlubmVyVGV4dCA9IFwiRjogXCIgKyBmcmFtZSArIFwiICBUOlwiICsgKHQxIC0gdDApLnRvRml4ZWQoMik7XG4gICAgICAgIHQwID0gdDE7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBmcmFtZXNbZnJhbWVdKCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvciBGcmFtZTpcIiwgZnJhbWUpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGZyYW1lKys7XG4gICAgfVxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXJGcmFtZSk7XG59XG5cbmZ1bmN0aW9uIGRlY29kZUJhc2U2NChzdHIpIHtcbiAgICBjb25zdCBiYXNlNjRjb2RlcyA9IFtcbiAgICAgICAgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LFxuICAgICAgICAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsXG4gICAgICAgIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCA2MiwgMjU1LCAyNTUsIDI1NSwgNjMsXG4gICAgICAgIDUyLCA1MywgNTQsIDU1LCA1NiwgNTcsIDU4LCA1OSwgNjAsIDYxLCAyNTUsIDI1NSwgMjU1LCAwLCAyNTUsIDI1NSxcbiAgICAgICAgMjU1LCAwLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMCwgMTEsIDEyLCAxMywgMTQsXG4gICAgICAgIDE1LCAxNiwgMTcsIDE4LCAxOSwgMjAsIDIxLCAyMiwgMjMsIDI0LCAyNSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsXG4gICAgICAgIDI1NSwgMjYsIDI3LCAyOCwgMjksIDMwLCAzMSwgMzIsIDMzLCAzNCwgMzUsIDM2LCAzNywgMzgsIDM5LCA0MCxcbiAgICAgICAgNDEsIDQyLCA0MywgNDQsIDQ1LCA0NiwgNDcsIDQ4LCA0OSwgNTAsIDUxXG4gICAgXTtcblxuICAgIGZ1bmN0aW9uIGdldEJhc2U2NENvZGUoY2hhckNvZGUpIHtcbiAgICAgICAgaWYgKGNoYXJDb2RlID49IGJhc2U2NGNvZGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIHBhcnNlIGJhc2U2NCBzdHJpbmcuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvZGUgPSBiYXNlNjRjb2Rlc1tjaGFyQ29kZV07XG4gICAgICAgIGlmIChjb2RlID09PSAyNTUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBwYXJzZSBiYXNlNjQgc3RyaW5nLlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29kZTtcbiAgICB9XG5cbiAgICBpZiAoc3RyLmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIHBhcnNlIGJhc2U2NCBzdHJpbmcuXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IGluZGV4ID0gc3RyLmluZGV4T2YoXCI9XCIpO1xuICAgIGlmIChpbmRleCAhPT0gLTEgJiYgaW5kZXggPCBzdHIubGVuZ3RoIC0gMikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gcGFyc2UgYmFzZTY0IHN0cmluZy5cIik7XG4gICAgfVxuXG4gICAgbGV0IG1pc3NpbmdPY3RldHMgPSBzdHIuZW5kc1dpdGgoXCI9PVwiKSA/IDIgOiBzdHIuZW5kc1dpdGgoXCI9XCIpID8gMSA6IDA7XG4gICAgbGV0IG4gPSBzdHIubGVuZ3RoO1xuICAgIGxldCByZXN1bHQgPSBuZXcgVWludDhBcnJheSgzICogKG4gLyA0KSk7XG4gICAgZm9yIChsZXQgaSA9IDAsIGogPSAwOyBpIDwgbjsgaSArPSA0LCBqICs9IDMpIHtcbiAgICAgICAgbGV0IGJ1ZmZlciA9XG4gICAgICAgICAgICBnZXRCYXNlNjRDb2RlKHN0ci5jaGFyQ29kZUF0KGkpKSA8PCAxOCB8XG4gICAgICAgICAgICBnZXRCYXNlNjRDb2RlKHN0ci5jaGFyQ29kZUF0KGkgKyAxKSkgPDwgMTIgfFxuICAgICAgICAgICAgZ2V0QmFzZTY0Q29kZShzdHIuY2hhckNvZGVBdChpICsgMikpIDw8IDYgfFxuICAgICAgICAgICAgZ2V0QmFzZTY0Q29kZShzdHIuY2hhckNvZGVBdChpICsgMykpO1xuICAgICAgICByZXN1bHRbal0gPSBidWZmZXIgPj4gMTY7XG4gICAgICAgIHJlc3VsdFtqICsgMV0gPSAoYnVmZmVyID4+IDgpICYgMHhGRjtcbiAgICAgICAgcmVzdWx0W2ogKyAyXSA9IGJ1ZmZlciAmIDB4RkY7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQuc3ViYXJyYXkoMCwgcmVzdWx0Lmxlbmd0aCAtIG1pc3NpbmdPY3RldHMpO1xufVxuXG5mdW5jdGlvbiBCNjRUb0EocywgdHlwZSwgbGVuZ3RoKSB7XG4gICAgbGV0IHggPSBkZWNvZGVCYXNlNjQocyk7XG4gICAgaWYgKHR5cGUgPT0gXCJVaW50MzJBcnJheVwiKVxuICAgICAgICByZXR1cm4gbmV3IFVpbnQzMkFycmF5KHguYnVmZmVyLCAwLCB4Lmxlbmd0aC80KTtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoeC5idWZmZXIsIDAsIHgubGVuZ3RoKTtcbn1cXG5gO1xuICAgIGZvciAobGV0IGFpID0gMDsgYWkgPCB0aGlzLl9hcnJheUNhY2hlLmxlbmd0aDsgKythaSkge1xuICAgICAgICBsZXQgYSA9IHRoaXMuX2FycmF5Q2FjaGVbYWldO1xuICAgICAgICBsZXQgYjY0ID0gdGhpcy5fYXJyYXlUb0Jhc2U2NChhLmFycmF5KTtcbiAgICAgICAgcyArPSBgRFske2FpfV0gPSBCNjRUb0EoXCIke2I2NH1cIiwgXCIke2EudHlwZX1cIiwgJHthLmxlbmd0aH0pO1xcbmA7XG4gICAgfVxuXG5zICs9IGBcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgbWFpbik7XG4gICAgICAgIDwvc2NyaXB0PlxuICAgIDwvYm9keT5cbjwvaHRtbD5cXG5gO1xuICAgICAgICB0aGlzLl9kb3dubG9hZEZpbGUocywgKHRoaXMuY29uZmlnLmV4cG9ydE5hbWUgfHwgJ1dlYkdwdVJlY29yZCcpICsgXCIuaHRtbFwiKTtcbiAgICB9XG5cbiAgICBfZW5jb2RlQmFzZTY0KGJ5dGVzKSB7XG4gICAgICAgIGNvbnN0IF9iMmEgPSBbXG4gICAgICAgICAgICBcIkFcIiwgXCJCXCIsIFwiQ1wiLCBcIkRcIiwgXCJFXCIsIFwiRlwiLCBcIkdcIiwgXCJIXCIsIFwiSVwiLCBcIkpcIiwgXCJLXCIsIFwiTFwiLCBcIk1cIixcbiAgICAgICAgICAgIFwiTlwiLCBcIk9cIiwgXCJQXCIsIFwiUVwiLCBcIlJcIiwgXCJTXCIsIFwiVFwiLCBcIlVcIiwgXCJWXCIsIFwiV1wiLCBcIlhcIiwgXCJZXCIsIFwiWlwiLFxuICAgICAgICAgICAgXCJhXCIsIFwiYlwiLCBcImNcIiwgXCJkXCIsIFwiZVwiLCBcImZcIiwgXCJnXCIsIFwiaFwiLCBcImlcIiwgXCJqXCIsIFwia1wiLCBcImxcIiwgXCJtXCIsXG4gICAgICAgICAgICBcIm5cIiwgXCJvXCIsIFwicFwiLCBcInFcIiwgXCJyXCIsIFwic1wiLCBcInRcIiwgXCJ1XCIsIFwidlwiLCBcIndcIiwgXCJ4XCIsIFwieVwiLCBcInpcIixcbiAgICAgICAgICAgIFwiMFwiLCBcIjFcIiwgXCIyXCIsIFwiM1wiLCBcIjRcIiwgXCI1XCIsIFwiNlwiLCBcIjdcIiwgXCI4XCIsIFwiOVwiLCBcIitcIiwgXCIvXCJcbiAgICAgICAgXTtcblxuICAgICAgICBsZXQgcmVzdWx0ID0gJycsIGksIGwgPSBieXRlcy5sZW5ndGg7XG4gICAgICAgIGZvciAoaSA9IDI7IGkgPCBsOyBpICs9IDMpIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBfYjJhW2J5dGVzW2kgLSAyXSA+PiAyXTtcbiAgICAgICAgICAgIHJlc3VsdCArPSBfYjJhWygoYnl0ZXNbaSAtIDJdICYgMHgwMykgPDwgNCkgfCAoYnl0ZXNbaSAtIDFdID4+IDQpXTtcbiAgICAgICAgICAgIHJlc3VsdCArPSBfYjJhWygoYnl0ZXNbaSAtIDFdICYgMHgwRikgPDwgMikgfCAoYnl0ZXNbaV0gPj4gNildO1xuICAgICAgICAgICAgcmVzdWx0ICs9IF9iMmFbYnl0ZXNbaV0gJiAweDNGXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaSA9PT0gbCArIDEpIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBfYjJhW2J5dGVzW2kgLSAyXSA+PiAyXTtcbiAgICAgICAgICAgIHJlc3VsdCArPSBfYjJhWyhieXRlc1tpIC0gMl0gJiAweDAzKSA8PCA0XTtcbiAgICAgICAgICAgIHJlc3VsdCArPSBcIj09XCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGkgPT09IGwpIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBfYjJhW2J5dGVzW2kgLSAyXSA+PiAyXTtcbiAgICAgICAgICAgIHJlc3VsdCArPSBfYjJhWygoYnl0ZXNbaSAtIDJdICYgMHgwMykgPDwgNCkgfCAoYnl0ZXNbaSAtIDFdID4+IDQpXTtcbiAgICAgICAgICAgIHJlc3VsdCArPSBfYjJhWyhieXRlc1tpIC0gMV0gJiAweDBGKSA8PCAyXTtcbiAgICAgICAgICAgIHJlc3VsdCArPSBcIj1cIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIF9hcnJheVRvQmFzZTY0KGEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VuY29kZUJhc2U2NChuZXcgVWludDhBcnJheShhLmJ1ZmZlciwgYS5ieXRlT2Zmc2V0LCBhLmJ5dGVMZW5ndGgpKTtcbiAgICB9XG5cbiAgICBfZG93bmxvYWRGaWxlKGRhdGEsIGZpbGVuYW1lKSB7XG4gICAgICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgIGxpbmsuaHJlZiA9IFVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW2RhdGFdLCB7dHlwZTogJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnfSkpO1xuICAgICAgICBsaW5rLmRvd25sb2FkID0gZmlsZW5hbWU7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgICAgIGxpbmsuY2xpY2soKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChsaW5rKTtcbiAgICB9XG5cbiAgICBfd3JhcENhbnZhcyhjKSB7XG4gICAgICAgIGlmIChjLl9faWQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyT2JqZWN0KGMpO1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIGxldCBfX2dldENvbnRleHQgPSBjLmdldENvbnRleHQ7XG4gICAgICAgIGMuZ2V0Q29udGV4dCA9IGZ1bmN0aW9uKGExLCBhMikge1xuICAgICAgICAgICAgbGV0IHJldCA9IF9fZ2V0Q29udGV4dC5jYWxsKGMsIGExLCBhMik7XG4gICAgICAgICAgICBpZiAoYTEgPT0gJ3dlYmdwdScpIHtcbiAgICAgICAgICAgICAgICBpZiAocmV0KSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3dyYXBDb250ZXh0KHJldCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfd3JhcENhbnZhc2VzKCkge1xuICAgICAgICBsZXQgY2FudmFzZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnY2FudmFzJyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2FudmFzZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGxldCBjID0gY2FudmFzZXNbaV07XG4gICAgICAgICAgICB0aGlzLl93cmFwQ2FudmFzKGMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX3JlZ2lzdGVyT2JqZWN0KG9iamVjdCkge1xuICAgICAgICBsZXQgaWQgPSB0aGlzLl9vYmplY3RJbmRleCsrO1xuICAgICAgICBvYmplY3QuX19pZCA9IGlkO1xuICAgICAgICBvYmplY3QuX19mcmFtZSA9IHRoaXMuX2ZyYW1lSW5kZXg7XG4gICAgfVxuXG4gICAgX2lzRnJhbWVWYXJpYWJsZShmcmFtZSwgbmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZnJhbWVWYXJpYWJsZXNbZnJhbWVdICYmIHRoaXMuX2ZyYW1lVmFyaWFibGVzW2ZyYW1lXS5oYXMobmFtZSk7XG4gICAgfVxuXG4gICAgX3JlbW92ZVZhcmlhYmxlKG5hbWUpIHtcbiAgICAgICAgZm9yIChsZXQgZiBpbiB0aGlzLl9mcmFtZVZhcmlhYmxlcykge1xuICAgICAgICAgICAgbGV0IGZzID0gdGhpcy5fZnJhbWVWYXJpYWJsZXNbZl07XG4gICAgICAgICAgICBmcy5kZWxldGUobmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfYWRkVmFyaWFibGUoZnJhbWUsIG5hbWUpIHtcbiAgICAgICAgdGhpcy5fZnJhbWVWYXJpYWJsZXNbZnJhbWVdLmFkZChuYW1lKTtcbiAgICB9XG5cbiAgICBfZ2V0VmFyaWFibGVEZWNsYXJhdGlvbnMoZnJhbWUpIHtcbiAgICAgICAgbGV0IHMgPSB0aGlzLl9mcmFtZVZhcmlhYmxlc1tmcmFtZV07XG4gICAgICAgIGlmICghcy5zaXplKSByZXR1cm4gXCJcIjtcbiAgICAgICAgcmV0dXJuIGBsZXQgJHtbLi4uc10uam9pbihcIixcIil9O2A7XG4gICAgfVxuXG4gICAgX2dldE9iamVjdFZhcmlhYmxlKG9iamVjdCkge1xuICAgICAgICBpZiAob2JqZWN0Ll9faWQgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHRoaXMuX3JlZ2lzdGVyT2JqZWN0KG9iamVjdCk7XG5cbiAgICAgICAgbGV0IG5hbWUgPSBgeCR7KG9iamVjdC5fX2lkfHwwKS50b1N0cmluZygxNil9YDtcblxuICAgICAgICBpZiAodGhpcy5fZnJhbWVJbmRleCAhPSBvYmplY3QuX19mcmFtZSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc0ZyYW1lVmFyaWFibGUoLTEsIG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVtb3ZlVmFyaWFibGUobmFtZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVmFyaWFibGUoLTEsIG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fYWRkVmFyaWFibGUodGhpcy5fZnJhbWVJbmRleCwgbmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmFtZTtcbiAgICB9XG5cbiAgICBfd3JhcENvbnRleHQoY3R4KSB7XG4gICAgICAgIHRoaXMuX3JlY29yZExpbmUoYCR7dGhpcy5fZ2V0T2JqZWN0VmFyaWFibGUoY3R4KX0gPSBjYW52YXMuZ2V0Q29udGV4dCgnd2ViZ3B1Jyk7YCk7XG4gICAgICAgIHRoaXMuX3dyYXBPYmplY3QoY3R4KTtcbiAgICB9XG5cbiAgICBfb2JqZWN0SGFzTWV0aG9kcyhvYmplY3QpIHtcbiAgICAgICAgZm9yIChsZXQgbSBpbiBvYmplY3QpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Yob2JqZWN0W21dKSA9PSBcImZ1bmN0aW9uXCIgJiYgV2ViR1BVUmVjb3JkZXIuX3NraXBNZXRob2RzLmluZGV4T2YobSkgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgX3dyYXBPYmplY3Qob2JqZWN0KSB7XG4gICAgICAgIGZvciAobGV0IG0gaW4gb2JqZWN0KSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mKG9iamVjdFttXSkgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKFdlYkdQVVJlY29yZGVyLl9za2lwTWV0aG9kcy5pbmRleE9mKG0pID09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChXZWJHUFVSZWNvcmRlci5fYXN5bmNNZXRob2RzLmluZGV4T2YobSkgIT0gLTEpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl93cmFwQXN5bmMob2JqZWN0LCBtKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fd3JhcE1ldGhvZChvYmplY3QsIG0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mKG9iamVjdFttXSkgPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgIGxldCBvID0gb2JqZWN0W21dO1xuICAgICAgICAgICAgICAgIGlmICghbyB8fCBvLl9faWQpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGxldCBoYXNNZXRob2QgPSB0aGlzLl9vYmplY3RIYXNNZXRob2RzKG8pO1xuICAgICAgICAgICAgICAgIGlmICghby5fX2lkICYmIGhhc01ldGhvZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZWNvcmRMaW5lKGAke3RoaXMuX2dldE9iamVjdFZhcmlhYmxlKG8pfSA9ICR7dGhpcy5fZ2V0T2JqZWN0VmFyaWFibGUob2JqZWN0KX1bJyR7bX0nXTtgKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fd3JhcE9iamVjdChvKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfZ2V0Qnl0ZXNGcm9tSW1hZ2VTb3VyY2Uoc3JjKSB7XG4gICAgICAgIGxldCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgICAgICBjYW52YXMud2lkdGggPSBzcmMud2lkdGg7XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBzcmMuaGVpZ2h0O1xuICAgICAgICBsZXQgYzJkID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgYzJkLmRyYXdJbWFnZShzcmMsIDAsIDApO1xuICAgICAgICBsZXQgZGF0YSA9IGMyZC5nZXRJbWFnZURhdGEoMCwgMCwgc3JjLndpZHRoLCBzcmMuaGVpZ2h0KTtcbiAgICAgICAgcmV0dXJuIGRhdGEuZGF0YTtcbiAgICB9XG5cbiAgICBfd3JhcE1ldGhvZChvYmplY3QsIG1ldGhvZCkge1xuICAgICAgICBpZiAoV2ViR1BVUmVjb3JkZXIuX3NraXBNZXRob2RzLmluZGV4T2YobWV0aG9kKSAhPSAtMSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgbGV0IG9yaWdNZXRob2QgPSBvYmplY3RbbWV0aG9kXTtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICBvYmplY3RbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gV2UgY2FuJ3QgdHJhY2sgZXZlcnkgY2hhbmdlIG1hZGUgdG8gYSBtYXBwZWRSYW5nZSBidWZmZXIgc2luY2UgdGhhdCBhbGwgaGFwcGVucyBcbiAgICAgICAgICAgIC8vIG91dHNpZGUgdGhlIHNjb3BlIG9mIHdoYXQgV2ViR1BVIGlzIGluIGNvbnRyb2wgb2YuIFNvIHdlIGtlZXAgdHJhY2sgb2YgYWxsIHRoZVxuICAgICAgICAgICAgLy8gbWFwcGVkIGJ1ZmZlciByYW5nZXMsIGFuZCB3aGVuIHVubWFwIGlzIGNhbGxlZCwgd2UgcmVjb3JkIHRoZSBjb250ZW50IG9mIHRoZWlyIGRhdGFcbiAgICAgICAgICAgIC8vIHNvIHRoYXQgdGhleSBoYXZlIHRoZWlyIGNvcnJlY3QgZGF0YSBmb3IgdGhlIHVubWFwLlxuICAgICAgICAgICAgaWYgKG1ldGhvZCA9PSBcInVubWFwXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAob2JqZWN0Ll9fbWFwcGVkUmFuZ2VzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGJ1ZmZlciBvZiBvYmplY3QuX19tYXBwZWRSYW5nZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1ha2UgYSBjb3B5IG9mIHRoZSBtYXBwZWRSYW5nZSBidWZmZXIgZGF0YSBhcyBpdCBpcyB3aGVuIHVubWFwXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpcyBjYWxsZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2FjaGVJbmRleCA9IHNlbGYuX2dldERhdGFDYWNoZShidWZmZXIsIDAsIGJ1ZmZlci5ieXRlTGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNldCB0aGUgbWFwcGVkUmFuZ2UgYnVmZmVyIGRhdGEgaW4gdGhlIHJlY29yZGluZyB0byB3aGF0IGlzIGluIHRoZSBidWZmZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGF0IHRoZSB0aW1lIHVubWFwIGlzIGNhbGxlZC5cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX3JlY29yZExpbmUoYG5ldyBVaW50OEFycmF5KCR7c2VsZi5fZ2V0T2JqZWN0VmFyaWFibGUoYnVmZmVyKX0pLnNldChEWyR7Y2FjaGVJbmRleH1dKTtgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgb2JqZWN0Ll9fbWFwcGVkUmFuZ2VzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAobWV0aG9kID09IFwiY29weUV4dGVybmFsSW1hZ2VUb1RleHR1cmVcIikge1xuICAgICAgICAgICAgICAgIG9yaWdNZXRob2QuY2FsbChvYmplY3QsIC4uLmFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgICAgICAvLyBjb3B5RXh0ZXJuYWxJbWFnZVRvVGV4dHVyZSB1c2VzIEltYWdlQml0bWFwIChvciBjYW52YXMgb3Igb2Zmc2NyZWVuQ2FudmFzKSBhc1xuICAgICAgICAgICAgICAgIC8vIGl0cyBzb3VyY2UsIHdoaWNoIHdlIGNhbid0IHJlY29yZC4gQ29udmVydGNvcHlFeHRlcm5hbEltYWdlVG9UZXh0dXJlIHRvXG4gICAgICAgICAgICAgICAgLy8gd3JpdGVUZXh0dXJlLCBhbmQgcmVjb3JkIHRoZSBieXRlcyBmcm9tIHRoZSBJbWFnZUJpdG1hcC4gVG8gZG8gdGhhdCwgd2UgbmVlZFxuICAgICAgICAgICAgICAgIC8vIHRvIGRyYXcgdGhlIEltYWdlQml0bWFwIGludG8gYSBjYW52YXMsIGFuZCByZWNvcmQgdGhlIGJ5dGVzIGZyb20gdGhhdC5cbiAgICAgICAgICAgICAgICAvLyBBIHZlcnkgaGVhdnkgcHJvY2VzcywgYnV0IG5vdCBzdXJlIHdoYXQgZWxzZSB0byBkby5cbiAgICAgICAgICAgICAgICBsZXQgYnl0ZXMgPSBzZWxmLl9nZXRCeXRlc0Zyb21JbWFnZVNvdXJjZShhcmd1bWVudHNbMF0uc291cmNlKTtcbiAgICAgICAgICAgICAgICBsZXQgYnl0ZXNQZXJQaXhlbCA9IDQ7XG4gICAgICAgICAgICAgICAgbGV0IGJ5dGVzUGVyUm93ID0gYXJndW1lbnRzWzBdLnNvdXJjZS53aWR0aCAqIGJ5dGVzUGVyUGl4ZWw7XG5cbiAgICAgICAgICAgICAgICBsZXQgY2FjaGVJbmRleCA9IHNlbGYuX2dldERhdGFDYWNoZShieXRlcywgYnl0ZXMuYnl0ZU9mZnNldCwgYnl0ZXMuYnl0ZUxlbmd0aCk7XG4gICAgICAgICAgICAgICAgc2VsZi5fcmVjb3JkTGluZShgJHtzZWxmLl9nZXRPYmplY3RWYXJpYWJsZShvYmplY3QpfS53cml0ZVRleHR1cmUoJHtzZWxmLl9zdHJpbmdpZnlPYmplY3QoYXJndW1lbnRzWzFdKX0sIERbJHtjYWNoZUluZGV4fV0sIHtieXRlc1BlclJvdzoke2J5dGVzUGVyUm93fX0sICR7c2VsZi5fc3RyaW5naWZ5T2JqZWN0KGFyZ3VtZW50c1syXSl9KTtgKTtcblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IG9yaWdNZXRob2QuY2FsbChvYmplY3QsIC4uLmFyZ3VtZW50cyk7XG4gICAgICAgICAgICBzZWxmLl9yZWNvcmRDb21tYW5kKGZhbHNlLCBvYmplY3QsIG1ldGhvZCwgcmVzdWx0LCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICAvLyBLZWVwIHRyYWNrIG9mIHRoZSBtYXBwZWQgcmFuZ2VzIGZvciB0aGUgYnVmZmVyIG9iamVjdC4gVGhlIHJlY29yZGluZyB3aWxsIHNldCB0aGVpclxuICAgICAgICAgICAgLy8gZGF0YSB3aGVuIHVubWFwIGlzIGNhbGxlZC5cbiAgICAgICAgICAgIGlmIChtZXRob2QgPT0gXCJnZXRNYXBwZWRSYW5nZVwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvYmplY3QuX19tYXBwZWRSYW5nZXMpXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5fX21hcHBlZFJhbmdlcyA9IFtdO1xuICAgICAgICAgICAgICAgIG9iamVjdC5fX21hcHBlZFJhbmdlcy5wdXNoKHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIF93cmFwQXN5bmMob2JqZWN0LCBtZXRob2QpIHtcbiAgICAgICAgbGV0IG9yaWdNZXRob2QgPSBvYmplY3RbbWV0aG9kXTtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICBvYmplY3RbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0IHByb21pc2UgPSBvcmlnTWV0aG9kLmNhbGwob2JqZWN0LCAuLi5hcmd1bWVudHMpO1xuICAgICAgICAgICAgbGV0IHdyYXBwZWRQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgICAgICBwcm9taXNlLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Ll9faWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzZWxmLl9yZWNvcmRDb21tYW5kKHRydWUsIG9iamVjdCwgbWV0aG9kLCByZXN1bHQsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHdyYXBwZWRQcm9taXNlO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9zdHJpbmdpZnlPYmplY3Qob2JqZWN0KSB7XG4gICAgICAgIGxldCBzID0gXCJcIjtcbiAgICAgICAgbGV0IGZpcnN0ID0gdHJ1ZTtcbiAgICAgICAgZm9yIChsZXQga2V5IGluIG9iamVjdCkge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gb2JqZWN0W2tleV07XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFmaXJzdCkgcyArPSBcIixcIjtcbiAgICAgICAgICAgIGZpcnN0ID0gZmFsc2U7XG4gICAgICAgICAgICBzICs9IGBcIiR7a2V5fVwiOmA7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBzICs9IFwibnVsbFwiO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YodmFsdWUpID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBzICs9IGBcXGAke3ZhbHVlfVxcYGA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlLl9faWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHMgKz0gdGhpcy5fZ2V0T2JqZWN0VmFyaWFibGUodmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZS5fX2RhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHMgKz0gYERbJHt2YWx1ZS5fX2RhdGF9XWA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlLmNvbnN0cnVjdG9yID09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgcyArPSB0aGlzLl9zdHJpbmdpZnlBcnJheSh2YWx1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZih2YWx1ZSkgPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgIHMgKz0gdGhpcy5fc3RyaW5naWZ5T2JqZWN0KHZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcyArPSBgJHt2YWx1ZX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHMgPSBcIntcIiArIHMgKyBcIn1cIjtcbiAgICAgICAgcmV0dXJuIHM7XG4gICAgfVxuXG4gICAgX3N0cmluZ2lmeUFycmF5KGEpIHtcbiAgICAgICAgbGV0IHMgPSBcIltcIjtcbiAgICAgICAgcyArPSB0aGlzLl9zdHJpbmdpZnlBcmdzKFwiXCIsIGEpO1xuICAgICAgICBzICs9IFwiXVwiO1xuICAgICAgICByZXR1cm4gcztcbiAgICB9XG5cbiAgICBfZ2V0RGF0YUNhY2hlKGhlYXAsIG9mZnNldCwgbGVuZ3RoKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICBmdW5jdGlvbiBfaGVhcEFjY2Vzc1NoaWZ0Rm9yV2ViR1BVSGVhcChoZWFwKSB7XG4gICAgICAgICAgICBpZiAoIWhlYXAuQllURVNfUEVSX0VMRU1FTlQpIHJldHVybiAwO1xuICAgICAgICAgICAgcmV0dXJuIDMxIC0gTWF0aC5jbHozMihoZWFwLkJZVEVTX1BFUl9FTEVNRU5UKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIF9jb21wYXJlQ2FjaGVEYXRhKGFpLCB2aWV3KSB7XG4gICAgICAgICAgICBsZXQgYSA9IHNlbGYuX2FycmF5Q2FjaGVbYWldLmFycmF5O1xuICAgICAgICAgICAgaWYgKGEubGVuZ3RoICE9IHZpZXcubGVuZ3RoKSBcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IGEubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFbaV0gIT0gdmlld1tpXSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYnl0ZU9mZnNldCA9ICgoaGVhcC5ieXRlT2Zmc2V0ID8/IDApICsgb2Zmc2V0KSA8PCBfaGVhcEFjY2Vzc1NoaWZ0Rm9yV2ViR1BVSGVhcChoZWFwKTtcbiAgICAgICAgbGV0IGJ5dGVMZW5ndGggPSBsZW5ndGggPDwgX2hlYXBBY2Nlc3NTaGlmdEZvcldlYkdQVUhlYXAoaGVhcCk7XG5cbiAgICAgICAgdGhpcy5fdG90YWxEYXRhICs9IGJ5dGVMZW5ndGg7XG4gICAgICAgIGxldCB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoaGVhcC5idWZmZXIgPz8gaGVhcCwgYnl0ZU9mZnNldCwgYnl0ZUxlbmd0aCk7XG5cbiAgICAgICAgbGV0IGNhY2hlSW5kZXggPSAtMTtcbiAgICAgICAgZm9yIChsZXQgYWkgPSAwOyBhaSA8IHNlbGYuX2FycmF5Q2FjaGUubGVuZ3RoOyArK2FpKSB7XG4gICAgICAgICAgICBsZXQgYyA9IHNlbGYuX2FycmF5Q2FjaGVbYWldO1xuICAgICAgICAgICAgaWYgKGMubGVuZ3RoID09IGxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChfY29tcGFyZUNhY2hlRGF0YShhaSwgdmlldykpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FjaGVJbmRleCA9IGFpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FjaGVJbmRleCA9PSAtMSkge1xuICAgICAgICAgICAgY2FjaGVJbmRleCA9IHNlbGYuX2FycmF5Q2FjaGUubGVuZ3RoO1xuICAgICAgICAgICAgbGV0IGFycmF5Q29weSA9IFVpbnQ4QXJyYXkuZnJvbSh2aWV3KTtcbiAgICAgICAgICAgIHNlbGYuX2FycmF5Q2FjaGUucHVzaCh7XG4gICAgICAgICAgICAgICAgbGVuZ3RoOiBieXRlTGVuZ3RoLFxuICAgICAgICAgICAgICAgIHR5cGU6IGhlYXAuY29uc3RydWN0b3IgPT09IFwiQXJyYXlCdWZmZXJcIiA/IFVpbnQ4QXJyYXkgOiBoZWFwLmNvbnN0cnVjdG9yLm5hbWUsXG4gICAgICAgICAgICAgICAgYXJyYXk6IGFycmF5Q29weVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBjYWNoZUluZGV4O1xuICAgIH1cblxuICAgIF9zdHJpbmdpZnlBcmdzKG1ldGhvZCwgYXJncykge1xuICAgICAgICBpZiAoYXJncy5sZW5ndGggPT0gMCB8fCAoYXJncy5sZW5ndGggPT0gMSAmJiBhcmdzWzBdID09PSB1bmRlZmluZWQpKVxuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG5cbiAgICAgICAgYXJncyA9IEFycmF5LmZyb20oYXJncyk7XG5cbiAgICAgICAgLy8gSW4gb3JkZXIgdG8gY2FwdHVyZSBidWZmZXIgZGF0YSwgd2UgbmVlZCB0byBrbm93IHRoZSBvZmZzZXQgYW5kIHNpemUgb2YgdGhlIGRhdGEsXG4gICAgICAgIC8vIHdoaWNoIGFyZSBhcmd1bWVudHMgb2Ygc3BlY2lmaWMgbWV0aG9kcy4gU28gd2UgbmVlZCB0byBzcGVjaWFsIGNhc2UgdGhvc2UgbWV0aG9kcyB0b1xuICAgICAgICAvLyBwcm9wZXJseSBjYXB0dXJlIHRoZSBidWZmZXIgZGF0YSBwYXNzZWQgdG8gdGhlbS5cbiAgICAgICAgaWYgKG1ldGhvZCA9PSBcIndyaXRlQnVmZmVyXCIpIHtcbiAgICAgICAgICAgIGxldCBidWZmZXIgPSBhcmdzWzJdO1xuICAgICAgICAgICAgbGV0IG9mZnNldCA9IGFyZ3NbM107XG4gICAgICAgICAgICBsZXQgc2l6ZSA9IGFyZ3NbNF07XG4gICAgICAgICAgICBsZXQgY2FjaGVJbmRleCA9IHRoaXMuX2dldERhdGFDYWNoZShidWZmZXIsIG9mZnNldCwgc2l6ZSk7XG4gICAgICAgICAgICBhcmdzWzJdID0geyBfX2RhdGE6IGNhY2hlSW5kZXggfTtcbiAgICAgICAgICAgIGFyZ3NbM10gPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKG1ldGhvZCA9PSBcIndyaXRlVGV4dHVyZVwiKSB7XG4gICAgICAgICAgICBsZXQgYnVmZmVyID0gYXJnc1sxXTtcbiAgICAgICAgICAgIGxldCBieXRlc1BlclJvdyA9IGFyZ3NbMl0uYnl0ZXNQZXJSb3c7XG4gICAgICAgICAgICBsZXQgcm93cyA9IGFyZ3NbMl0ucm93c1BlckltYWdlIHx8IGFyZ3NbM10uaGVpZ2h0IHx8IGFyZ3NbM11bMV0gfHwgMDtcbiAgICAgICAgICAgIGxldCBzaXplID0gYnl0ZXNQZXJSb3cgKiByb3dzO1xuICAgICAgICAgICAgbGV0IG9mZnNldCA9IGFyZ3NbMl0ub2Zmc2V0O1xuICAgICAgICAgICAgbGV0IGNhY2hlSW5kZXggPSB0aGlzLl9nZXREYXRhQ2FjaGUoYnVmZmVyLCBvZmZzZXQsIHNpemUpO1xuICAgICAgICAgICAgYXJnc1sxXSA9IHsgX19kYXRhOiBjYWNoZUluZGV4IH07XG4gICAgICAgICAgICBhcmdzWzJdLm9mZnNldCA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAobWV0aG9kID09IFwic2V0QmluZEdyb3VwXCIpIHtcbiAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA9PSA1KSB7XG4gICAgICAgICAgICAgICAgbGV0IGJ1ZmZlciA9IGFyZ3NbMl07XG4gICAgICAgICAgICAgICAgbGV0IG9mZnNldCA9IGFyZ3NbM107XG4gICAgICAgICAgICAgICAgbGV0IHNpemUgPSBhcmdzWzRdO1xuICAgICAgICAgICAgICAgIGxldCBvZmZzZXRzID0gdGhpcy5fZ2V0RGF0YUNhY2hlKGJ1ZmZlciwgb2Zmc2V0LCBzaXplKTtcbiAgICAgICAgICAgICAgICBhcmdzWzJdID0geyBfX2RhdGE6IG9mZnNldHMgfTtcbiAgICAgICAgICAgICAgICBhcmdzLmxlbmd0aCA9IDM7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID09IDMpIHtcbiAgICAgICAgICAgICAgICBsZXQgYnVmZmVyID0gYXJnc1syXTtcbiAgICAgICAgICAgICAgICBsZXQgb2Zmc2V0cyA9IHRoaXMuX2dldERhdGFDYWNoZShidWZmZXIsIDAsIGJ1ZmZlci5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIGFyZ3NbMl0gPSB7IF9fZGF0YTogb2Zmc2V0cyB9O1xuICAgICAgICAgICAgICAgIGFyZ3MubGVuZ3RoID0gMztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBhcmdTdHJpbmdzID0gW107XG4gICAgICAgIGZvciAobGV0IGEgb2YgYXJncykge1xuICAgICAgICAgICAgaWYgKGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGFyZ1N0cmluZ3MucHVzaChcInVuZGVmaW5lZFwiKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGFyZ1N0cmluZ3MucHVzaChcIm51bGxcIik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGEuX19kYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBhcmdTdHJpbmdzLnB1c2goYERbJHthLl9fZGF0YX1dYCk7IC8vIFRoaXMgaXMgYSBjYXB0dXJlZCBkYXRhIGJ1ZmZlci5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYS5fX2lkKSB7XG4gICAgICAgICAgICAgICAgYXJnU3RyaW5ncy5wdXNoKHRoaXMuX2dldE9iamVjdFZhcmlhYmxlKGEpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgICAgICAgICBhcmdTdHJpbmdzLnB1c2godGhpcy5fc3RyaW5naWZ5QXJyYXkoYSkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YoYSkgPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgIGFyZ1N0cmluZ3MucHVzaCh0aGlzLl9zdHJpbmdpZnlPYmplY3QoYSkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YoYSkgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIGFyZ1N0cmluZ3MucHVzaChgXFxgJHthfVxcYGApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhcmdTdHJpbmdzLnB1c2goYSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFyZ1N0cmluZ3Muam9pbigpO1xuICAgIH1cblxuICAgIF9yZWNvcmRMaW5lKGxpbmUpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb3JkaW5nKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fZnJhbWVJbmRleCA9PSAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXRpYWxpemVDb21tYW5kcy5wdXNoKGxpbmUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50RnJhbWVDb21tYW5kcy5wdXNoKGxpbmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX3JlY29yZENvbW1hbmQoYXN5bmMsIG9iamVjdCwgbWV0aG9kLCByZXN1bHQsIGFyZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVjb3JkaW5nKSB7XG4gICAgICAgICAgICBpZiAocmVzdWx0KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YocmVzdWx0KSA9PT0gXCJzdHJpbmdcIilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVnaXN0ZXJPYmplY3QocmVzdWx0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXN5bmMgPSBhc3luYyA/IFwiYXdhaXQgXCIgOiBcIlwiO1xuXG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVjb3JkTGluZShgJHt0aGlzLl9nZXRPYmplY3RWYXJpYWJsZShyZXN1bHQpfSA9ICR7YXN5bmN9JHt0aGlzLl9nZXRPYmplY3RWYXJpYWJsZShvYmplY3QpfS4ke21ldGhvZH0oJHt0aGlzLl9zdHJpbmdpZnlBcmdzKG1ldGhvZCwgYXJncyl9KTtgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVjb3JkTGluZShgJHthc3luY30ke3RoaXMuX2dldE9iamVjdFZhcmlhYmxlKG9iamVjdCl9LiR7bWV0aG9kfSgke3RoaXMuX3N0cmluZ2lmeUFyZ3MobWV0aG9kLCBhcmdzKX0pO2ApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmVzdWx0ICYmIHR5cGVvZihyZXN1bHQpID09IFwib2JqZWN0XCIpXG4gICAgICAgICAgICAgICAgdGhpcy5fd3JhcE9iamVjdChyZXN1bHQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5XZWJHUFVSZWNvcmRlci5fYXN5bmNNZXRob2RzID0gW1xuICAgIFwicmVxdWVzdEFkYXB0ZXJcIixcbiAgICBcInJlcXVlc3REZXZpY2VcIixcbiAgICBcImNyZWF0ZUNvbXB1dGVQaXBlbGluZUFzeW5jXCIsXG4gICAgXCJjcmVhdGVSZW5kZXJQaXBlbGluZUFzeW5jXCJcbl07XG5cbldlYkdQVVJlY29yZGVyLl9za2lwTWV0aG9kcyA9IFtcbiAgICBcInRvU3RyaW5nXCIsXG4gICAgXCJlbnRyaWVzXCIsXG4gICAgXCJnZXRDb250ZXh0XCIsXG4gICAgXCJmb3JFYWNoXCIsXG4gICAgXCJoYXNcIixcbiAgICBcImtleXNcIixcbiAgICBcInZhbHVlc1wiLFxuICAgIFwiZ2V0UHJlZmVycmVkRm9ybWF0XCIsXG4gICAgXCJwdXNoRXJyb3JTY29wZVwiLFxuICAgIFwicG9wRXJyb3JTY29wZVwiXG5dO1xuIl0sIm5hbWVzIjpbIldlYkdQVVJlY29yZGVyIiwiX2ZyYW1lU3RhcnQiLCJfZnJhbWVJbmRleCIsIl9mcmFtZVZhcmlhYmxlcyIsIlNldCIsIl9jdXJyZW50RnJhbWVDb21tYW5kcyIsIl9mcmFtZUNvbW1hbmRzIiwicHVzaCIsIl9mcmFtZUVuZCIsImNvbmZpZyIsIm1heEZyYW1lQ291bnQiLCJfaXNSZWNvcmRpbmciLCJfZ2VuZXJhdGVPdXRwdXQiLCJzIiwiY2FudmFzV2lkdGgiLCJjYW52YXNIZWlnaHQiLCJfYXJyYXlDYWNoZSIsImxlbmd0aCIsIl9nZXRWYXJpYWJsZURlY2xhcmF0aW9ucyIsIl9pbml0aWFsaXplQ29tbWFuZHMiLCJqb2luIiwiZmkiLCJmbCIsImFpIiwiYSIsImI2NCIsIl9hcnJheVRvQmFzZTY0IiwiYXJyYXkiLCJ0eXBlIiwiX2Rvd25sb2FkRmlsZSIsImV4cG9ydE5hbWUiLCJfZW5jb2RlQmFzZTY0IiwiYnl0ZXMiLCJfYjJhIiwicmVzdWx0IiwiaSIsImwiLCJVaW50OEFycmF5IiwiYnVmZmVyIiwiYnl0ZU9mZnNldCIsImJ5dGVMZW5ndGgiLCJkYXRhIiwiZmlsZW5hbWUiLCJsaW5rIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiaHJlZiIsIlVSTCIsImNyZWF0ZU9iamVjdFVSTCIsIkJsb2IiLCJkb3dubG9hZCIsImJvZHkiLCJhcHBlbmRDaGlsZCIsImNsaWNrIiwicmVtb3ZlQ2hpbGQiLCJfd3JhcENhbnZhcyIsImMiLCJfX2lkIiwiX3JlZ2lzdGVyT2JqZWN0Iiwic2VsZiIsIl9fZ2V0Q29udGV4dCIsImdldENvbnRleHQiLCJhMSIsImEyIiwicmV0IiwiY2FsbCIsIl93cmFwQ29udGV4dCIsIl93cmFwQ2FudmFzZXMiLCJjYW52YXNlcyIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwib2JqZWN0IiwiaWQiLCJfb2JqZWN0SW5kZXgiLCJfX2ZyYW1lIiwiX2lzRnJhbWVWYXJpYWJsZSIsImZyYW1lIiwibmFtZSIsImhhcyIsIl9yZW1vdmVWYXJpYWJsZSIsImYiLCJmcyIsImRlbGV0ZSIsIl9hZGRWYXJpYWJsZSIsImFkZCIsInNpemUiLCJfZ2V0T2JqZWN0VmFyaWFibGUiLCJ1bmRlZmluZWQiLCJ0b1N0cmluZyIsImN0eCIsIl9yZWNvcmRMaW5lIiwiX3dyYXBPYmplY3QiLCJfb2JqZWN0SGFzTWV0aG9kcyIsIm0iLCJfc2tpcE1ldGhvZHMiLCJpbmRleE9mIiwiX2FzeW5jTWV0aG9kcyIsIl93cmFwQXN5bmMiLCJfd3JhcE1ldGhvZCIsIm8iLCJoYXNNZXRob2QiLCJfZ2V0Qnl0ZXNGcm9tSW1hZ2VTb3VyY2UiLCJzcmMiLCJjYW52YXMiLCJ3aWR0aCIsImhlaWdodCIsImMyZCIsImRyYXdJbWFnZSIsImdldEltYWdlRGF0YSIsIm1ldGhvZCIsIm9yaWdNZXRob2QiLCJfX21hcHBlZFJhbmdlcyIsImNhY2hlSW5kZXgiLCJfZ2V0RGF0YUNhY2hlIiwiYXJndW1lbnRzIiwic291cmNlIiwiYnl0ZXNQZXJQaXhlbCIsImJ5dGVzUGVyUm93IiwiX3N0cmluZ2lmeU9iamVjdCIsIl9yZWNvcmRDb21tYW5kIiwicHJvbWlzZSIsIndyYXBwZWRQcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJ0aGVuIiwiZmlyc3QiLCJrZXkiLCJ2YWx1ZSIsIl9fZGF0YSIsImNvbnN0cnVjdG9yIiwiQXJyYXkiLCJfc3RyaW5naWZ5QXJyYXkiLCJfc3RyaW5naWZ5QXJncyIsImhlYXAiLCJvZmZzZXQiLCJfaGVhcEFjY2Vzc1NoaWZ0Rm9yV2ViR1BVSGVhcCIsIkJZVEVTX1BFUl9FTEVNRU5UIiwiTWF0aCIsImNsejMyIiwiX2NvbXBhcmVDYWNoZURhdGEiLCJ2aWV3IiwiX3RvdGFsRGF0YSIsImFycmF5Q29weSIsImZyb20iLCJhcmdzIiwicm93cyIsInJvd3NQZXJJbWFnZSIsIm9mZnNldHMiLCJhcmdTdHJpbmdzIiwibGluZSIsImFzeW5jIiwib3B0aW9ucyIsImZyYW1lcyIsImV4cG9ydCIsIl9pbml0YWxpemVkIiwibmF2aWdhdG9yIiwiZ3B1IiwiX19jcmVhdGVFbGVtZW50IiwiZWxlbWVudCIsIl9fcmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwid2luZG93IiwicmVxdWVzdEFuaW1h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