// Copyright 2013-2023, University of Colorado Boulder
/**
 * A debugging version of the CanvasRenderingContext2D that will output all commands issued,
 * but can also forward them to a real context
 *
 * See the spec at http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#2dcontext
 * Wrapping of the CanvasRenderingContext2D interface as of January 27th, 2013 (but not other interfaces like TextMetrics and Path)
 *
 * Shortcut to create:
 *    var context = new phet.scenery.DebugContext( document.createElement( 'canvas' ).getContext( '2d' ) );
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import scenery from '../scenery.js';
// used to serialize arguments so that it displays exactly like the call would be executed
function s(value) {
    return JSON.stringify(value);
}
function log(message) {
    console.log(`context.${message};`);
}
function attributeGet(name) {
    log(name);
}
function attributeSet(name, value) {
    log(`${name} = ${s(value)}`);
}
function command(name, args) {
    if (args === undefined || args.length === 0) {
        log(`${name}()`);
    } else {
        log(`${name}( ${_.reduce(args, (memo, arg)=>{
            if (memo.length > 0) {
                return `${memo}, ${s(arg)}`;
            } else {
                return s(arg);
            }
        }, '')} )`);
    }
}
let DebugContext = class DebugContext {
    /**
   * @public
   *
   * @returns {HTMLCanvasElement}
   */ get canvas() {
        attributeGet('canvas');
        return this._context.canvas;
    }
    /**
   * @public
   *
   * @returns {number}
   */ get width() {
        attributeGet('width');
        return this._context.width;
    }
    /**
   * @public
   *
   * @returns {number}
   */ get height() {
        attributeGet('height');
        return this._context.height;
    }
    /**
   * @public
   */ commit() {
        command('commit');
        this._context.commit();
    }
    /**
   * @public
   */ save() {
        command('save');
        this._context.save();
    }
    /**
   * @public
   */ restore() {
        command('restore');
        this._context.restore();
    }
    /**
   * @public
   *
   * @returns {DOMMatrix}
   */ get currentTransform() {
        attributeGet('currentTransform');
        return this._context.currentTransform;
    }
    /**
   * @public
   *
   * @param {DOMMatrix} transform
   */ set currentTransform(transform) {
        attributeSet('currentTransform', transform);
        this._context.currentTransform = transform;
    }
    /**
   * @public
   *
   * @param {number} x
   * @param {number} y
   */ scale(x, y) {
        command('scale', [
            x,
            y
        ]);
        this._context.scale(x, y);
    }
    /**
   * @public
   *
   * @param {number} angle
   */ rotate(angle) {
        command('rotate', [
            angle
        ]);
        this._context.rotate(angle);
    }
    /**
   * @public
   *
   * @param {number} x
   * @param {number} y
   */ translate(x, y) {
        command('translate', [
            x,
            y
        ]);
        this._context.translate(x, y);
    }
    /**
   * @public
   *
   * @param {number} a
   * @param {number} b
   * @param {number} c
   * @param {number} d
   * @param {number} e
   * @param {number} f
   */ transform(a, b, c, d, e, f) {
        command('transform', [
            a,
            b,
            c,
            d,
            e,
            f
        ]);
        this._context.transform(a, b, c, d, e, f);
    }
    /**
   * @public
   *
   * @param {number} a
   * @param {number} b
   * @param {number} c
   * @param {number} d
   * @param {number} e
   * @param {number} f
   */ setTransform(a, b, c, d, e, f) {
        command('setTransform', [
            a,
            b,
            c,
            d,
            e,
            f
        ]);
        this._context.setTransform(a, b, c, d, e, f);
    }
    /**
   * @public
   */ resetTransform() {
        command('resetTransform');
        this._context.resetTransform();
    }
    /**
   * @public
   *
   * @returns {number}
   */ get globalAlpha() {
        attributeGet('globalAlpha');
        return this._context.globalAlpha;
    }
    /**
   * @public
   *
   * @param {number} value
   */ set globalAlpha(value) {
        attributeSet('globalAlpha', value);
        this._context.globalAlpha = value;
    }
    /**
   * @public
   *
   * @returns {string}
   */ get globalCompositeOperation() {
        attributeGet('globalCompositeOperation');
        return this._context.globalCompositeOperation;
    }
    /**
   * @public
   *
   * @param {string} value
   */ set globalCompositeOperation(value) {
        attributeSet('globalCompositeOperation', value);
        this._context.globalCompositeOperation = value;
    }
    /**
   * @public
   *
   * @returns {boolean}
   */ get imageSmoothingEnabled() {
        attributeGet('imageSmoothingEnabled');
        return this._context.imageSmoothingEnabled;
    }
    /**
   * @public
   *
   * @param {boolean} value
   */ set imageSmoothingEnabled(value) {
        attributeSet('imageSmoothingEnabled', value);
        this._context.imageSmoothingEnabled = value;
    }
    /**
   * @public
   *
   * @returns {string}
   */ get strokeStyle() {
        attributeGet('strokeStyle');
        return this._context.strokeStyle;
    }
    /**
   * @public
   *
   * @param {string} value
   */ set strokeStyle(value) {
        attributeSet('strokeStyle', value);
        this._context.strokeStyle = value;
    }
    /**
   * @public
   *
   * @returns {string}
   */ get fillStyle() {
        attributeGet('fillStyle');
        return this._context.fillStyle;
    }
    /**
   * @public
   *
   * @param {string} value
   */ set fillStyle(value) {
        attributeSet('fillStyle', value);
        this._context.fillStyle = value;
    }
    // TODO: create wrapper https://github.com/phetsims/scenery/issues/1581
    /**
   * @public
   *
   * @param {number} x0
   * @param {number} y0
   * @param {number} x1
   * @param {number} y1
   * @returns {*}
   */ createLinearGradient(x0, y0, x1, y1) {
        command('createLinearGradient', [
            x0,
            y0,
            x1,
            y1
        ]);
        return this._context.createLinearGradient(x0, y0, x1, y1);
    }
    // TODO: create wrapper https://github.com/phetsims/scenery/issues/1581
    /**
   * @public
   *
   * @param {number} x0
   * @param {number} y0
   * @param {number} r0
   * @param {number} x1
   * @param {number} y1
   * @param {number} r1
   * @returns {*}
   */ createRadialGradient(x0, y0, r0, x1, y1, r1) {
        command('createRadialGradient', [
            x0,
            y0,
            r0,
            x1,
            y1,
            r1
        ]);
        return this._context.createRadialGradient(x0, y0, r0, x1, y1, r1);
    }
    // TODO: create wrapper https://github.com/phetsims/scenery/issues/1581
    /**
   * @public
   *
   * @param {*} image
   * @param {string} repetition
   * @returns {*}
   */ createPattern(image, repetition) {
        command('createPattern', [
            image,
            repetition
        ]);
        return this._context.createPattern(image, repetition);
    }
    /**
   * @public
   *
   * @returns {number}
   */ get shadowOffsetX() {
        attributeGet('shadowOffsetX');
        return this._context.shadowOffsetX;
    }
    /**
   * @public
   *
   * @param {number} value
   */ set shadowOffsetX(value) {
        attributeSet('shadowOffsetX', value);
        this._context.shadowOffsetX = value;
    }
    /**
   * @public
   *
   * @returns {number}
   */ get shadowOffsetY() {
        attributeGet('shadowOffsetY');
        return this._context.shadowOffsetY;
    }
    /**
   * @public
   *
   * @param {number} value
   */ set shadowOffsetY(value) {
        attributeSet('shadowOffsetY', value);
        this._context.shadowOffsetY = value;
    }
    /**
   * @public
   *
   * @returns {number}
   */ get shadowBlur() {
        attributeGet('shadowBlur');
        return this._context.shadowBlur;
    }
    /**
   * @public
   *
   * @param {number} value
   */ set shadowBlur(value) {
        attributeSet('shadowBlur', value);
        this._context.shadowBlur = value;
    }
    /**
   * @public
   *
   * @returns {string}
   */ get shadowColor() {
        attributeGet('shadowColor');
        return this._context.shadowColor;
    }
    /**
   * @public
   *
   * @param {string} value
   */ set shadowColor(value) {
        attributeSet('shadowColor', value);
        this._context.shadowColor = value;
    }
    /**
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */ clearRect(x, y, w, h) {
        command('clearRect', [
            x,
            y,
            w,
            h
        ]);
        this._context.clearRect(x, y, w, h);
    }
    /**
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */ fillRect(x, y, w, h) {
        command('fillRect', [
            x,
            y,
            w,
            h
        ]);
        this._context.fillRect(x, y, w, h);
    }
    /**
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */ strokeRect(x, y, w, h) {
        command('strokeRect', [
            x,
            y,
            w,
            h
        ]);
        this._context.strokeRect(x, y, w, h);
    }
    /**
   * @public
   *
   * @returns {string}
   */ get fillRule() {
        attributeGet('fillRule');
        return this._context.fillRule;
    }
    /**
   * @public
   *
   * @param {string} value
   */ set fillRule(value) {
        attributeSet('fillRule', value);
        this._context.fillRule = value;
    }
    /**
   * @public
   */ beginPath() {
        command('beginPath');
        this._context.beginPath();
    }
    /**
   * @public
   *
   * @param {Path2D} path
   */ fill(path) {
        if (path) {
            command('fill', [
                path
            ]);
            this._context.fill(path);
        } else {
            command('fill');
            this._context.fill();
        }
    }
    /**
   * @public
   *
   * @param {Path2D} path
   */ stroke(path) {
        if (path) {
            command('stroke', [
                path
            ]);
            this._context.stroke(path);
        } else {
            command('stroke');
            this._context.stroke();
        }
    }
    /**
   * @public
   *
   * @param {Path2D} path
   */ scrollPathIntoView(path) {
        command('scrollPathIntoView', path ? [
            path
        ] : undefined);
        this._context.scrollPathIntoView(path);
    }
    /**
   * @public
   *
   * @param {Path2D} path
   */ clip(path) {
        command('clip', path ? [
            path
        ] : undefined);
        this._context.clip(path);
    }
    /**
   * @public
   */ resetClip() {
        command('resetClip');
        this._context.resetClip();
    }
    /**
   * @public
   *
   * @param {*} a
   * @param {*} b
   * @param {*} c
   * @returns {*}
   */ isPointInPath(a, b, c) {
        command('isPointInPath', c ? [
            a,
            b,
            c
        ] : [
            a,
            b
        ]);
        return this._context.isPointInPath(a, b, c);
    }
    /**
   * @public
   *
   * @param {*} text
   * @param {number} x
   * @param {number} y
   * @param {*} maxWidth
   */ fillText(text, x, y, maxWidth) {
        command('fillText', maxWidth !== undefined ? [
            text,
            x,
            y,
            maxWidth
        ] : [
            text,
            x,
            y
        ]);
        this._context.fillText(text, x, y, maxWidth);
    }
    /**
   * @public
   *
   * @param {*} text
   * @param {number} x
   * @param {number} y
   * @param {*} maxWidth
   */ strokeText(text, x, y, maxWidth) {
        command('strokeText', maxWidth !== undefined ? [
            text,
            x,
            y,
            maxWidth
        ] : [
            text,
            x,
            y
        ]);
        this._context.strokeText(text, x, y, maxWidth);
    }
    /**
   * @public
   *
   * @param {*} text
   * @returns {*}
   */ measureText(text) {
        command('measureText', [
            text
        ]);
        return this._context.measureText(text);
    }
    /**
   * @public
   *
   * @param {*} image
   * @param {*} a
   * @param {*} b
   * @param {*} c
   * @param {*} d
   * @param {*} e
   * @param {*} f
   * @param {*} g
   * @param {number} h
   */ drawImage(image, a, b, c, d, e, f, g, h) {
        command('drawImage', c !== undefined ? e !== undefined ? [
            image,
            a,
            b,
            c,
            d,
            e,
            f,
            g,
            h
        ] : [
            image,
            a,
            b,
            c,
            d
        ] : [
            image,
            a,
            b
        ]);
        this._context.drawImage(image, a, b, c, d, e, f, g, h);
    }
    /**
   * @public
   *
   * @param {[Object]} options
   */ addHitRegion(options) {
        command('addHitRegion', [
            options
        ]);
        this._context.addHitRegion(options);
    }
    /**
   * @public
   *
   * @param {[Object]} options
   */ removeHitRegion(options) {
        command('removeHitRegion', [
            options
        ]);
        this._context.removeHitRegion(options);
    }
    /**
   * @public
   *
   * @param {*} a
   * @param {*} b
   * @returns {*}
   */ createImageData(a, b) {
        command('createImageData', b !== undefined ? [
            a,
            b
        ] : [
            a
        ]);
        return this._context.createImageData(a, b);
    }
    /**
   * @public
   *
   * @param {*} a
   * @param {*} b
   * @returns {*}
   */ createImageDataHD(a, b) {
        command('createImageDataHD', [
            a,
            b
        ]);
        return this._context.createImageDataHD(a, b);
    }
    /**
   * @public
   *
   * @param {*} sx
   * @param {*} sy
   * @param {*} sw
   * @param {*} sh
   * @returns {*}
   */ getImageData(sx, sy, sw, sh) {
        command('getImageData', [
            sx,
            sy,
            sw,
            sh
        ]);
        return this._context.getImageData(sx, sy, sw, sh);
    }
    /**
   * @public
   *
   * @param {*} sx
   * @param {*} sy
   * @param {*} sw
   * @param {*} sh
   * @returns {*}
   */ getImageDataHD(sx, sy, sw, sh) {
        command('getImageDataHD', [
            sx,
            sy,
            sw,
            sh
        ]);
        return this._context.getImageDataHD(sx, sy, sw, sh);
    }
    /**
   * @public
   *
   * @param {*} imageData
   * @param {*} dx
   * @param {*} dy
   * @param {*} dirtyX
   * @param {*} dirtyY
   * @param {*} dirtyWidth
   * @param {*} dirtyHeight
   */ putImageData(imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
        command('putImageData', dirtyX !== undefined ? [
            imageData,
            dx,
            dy,
            dirtyX,
            dirtyY,
            dirtyWidth,
            dirtyHeight
        ] : [
            imageData,
            dx,
            dy
        ]);
        this._context.putImageData(imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
    }
    /**
   * @public
   *
   * @param {*} imageData
   * @param {*} dx
   * @param {*} dy
   * @param {*} dirtyX
   * @param {*} dirtyY
   * @param {*} dirtyWidth
   * @param {*} dirtyHeight
   */ putImageDataHD(imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
        command('putImageDataHD', dirtyX !== undefined ? [
            imageData,
            dx,
            dy,
            dirtyX,
            dirtyY,
            dirtyWidth,
            dirtyHeight
        ] : [
            imageData,
            dx,
            dy
        ]);
        this._context.putImageDataHD(imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
    }
    /*---------------------------------------------------------------------------*
   * CanvasDrawingStyles
   *----------------------------------------------------------------------------*/ /**
   * @public
   *
   * @returns {number}
   */ get lineWidth() {
        attributeGet('lineWidth');
        return this._context.lineWidth;
    }
    /**
   * @public
   *
   * @param {number} value
   */ set lineWidth(value) {
        attributeSet('lineWidth', value);
        this._context.lineWidth = value;
    }
    /**
   * @public
   *
   * @returns {string}
   */ get lineCap() {
        attributeGet('lineCap');
        return this._context.lineCap;
    }
    /**
   * @public
   *
   * @param {string} value
   */ set lineCap(value) {
        attributeSet('lineCap', value);
        this._context.lineCap = value;
    }
    /**
   * @public
   *
   * @returns {string}
   */ get lineJoin() {
        attributeGet('lineJoin');
        return this._context.lineJoin;
    }
    /**
   * @public
   *
   * @param {string} value
   */ set lineJoin(value) {
        attributeSet('lineJoin', value);
        this._context.lineJoin = value;
    }
    /**
   * @public
   *
   * @returns {number}
   */ get miterLimit() {
        attributeGet('miterLimit');
        return this._context.miterLimit;
    }
    /**
   * @public
   *
   * @param {number} value
   */ set miterLimit(value) {
        attributeSet('miterLimit', value);
        this._context.miterLimit = value;
    }
    /**
   * @public
   *
   * @param {*} segments
   */ setLineDash(segments) {
        command('setLineDash', [
            segments
        ]);
        this._context.setLineDash(segments);
    }
    /**
   * @public
   * @returns {*}
   */ getLineDash() {
        command('getLineDash');
        return this._context.getLineDash();
    }
    /**
   * @public
   *
   * @returns {number}
   */ get lineDashOffset() {
        attributeGet('lineDashOffset');
        return this._context.lineDashOffset;
    }
    /**
   * @public
   *
   * @param {number} value
   */ set lineDashOffset(value) {
        attributeSet('lineDashOffset', value);
        this._context.lineDashOffset = value;
    }
    /**
   * @public
   *
   * @returns {string}
   */ get font() {
        attributeGet('font');
        return this._context.font;
    }
    /**
   * @public
   *
   * @param {string} value
   */ set font(value) {
        attributeSet('font', value);
        this._context.font = value;
    }
    /**
   * @public
   *
   * @returns {string}
   */ get textAlign() {
        attributeGet('textAlign');
        return this._context.textAlign;
    }
    /**
   * @public
   *
   * @param {string} value
   */ set textAlign(value) {
        attributeSet('textAlign', value);
        this._context.textAlign = value;
    }
    /**
   * @public
   *
   * @returns {string}
   */ get textBaseline() {
        attributeGet('textBaseline');
        return this._context.textBaseline;
    }
    /**
   * @public
   *
   * @param {string} value
   */ set textBaseline(value) {
        attributeSet('textBaseline', value);
        this._context.textBaseline = value;
    }
    /**
   * @public
   *
   * @returns {string}
   */ get direction() {
        attributeGet('direction');
        return this._context.direction;
    }
    /**
   * @public
   *
   * @param {string} value
   */ set direction(value) {
        attributeSet('direction', value);
        this._context.direction = value;
    }
    /*---------------------------------------------------------------------------*
   * CanvasPathMethods
   *----------------------------------------------------------------------------*/ /**
   * @public
   */ closePath() {
        command('closePath');
        this._context.closePath();
    }
    /**
   * @public
   *
   * @param {number} x
   * @param {number} y
   */ moveTo(x, y) {
        command('moveTo', [
            x,
            y
        ]);
        this._context.moveTo(x, y);
    }
    /**
   * @public
   *
   * @param {number} x
   * @param {number} y
   */ lineTo(x, y) {
        command('lineTo', [
            x,
            y
        ]);
        this._context.lineTo(x, y);
    }
    /**
   * @public
   *
   * @param {*} cpx
   * @param {*} cpy
   * @param {number} x
   * @param {number} y
   */ quadraticCurveTo(cpx, cpy, x, y) {
        command('quadraticCurveTo', [
            cpx,
            cpy,
            x,
            y
        ]);
        this._context.quadraticCurveTo(cpx, cpy, x, y);
    }
    /**
   * @public
   *
   * @param {*} cp1x
   * @param {*} cp1y
   * @param {*} cp2x
   * @param {*} cp2y
   * @param {number} x
   * @param {number} y
   */ bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
        command('bezierCurveTo', [
            cp1x,
            cp1y,
            cp2x,
            cp2y,
            x,
            y
        ]);
        this._context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
    }
    /**
   * @public
   *
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {number} radiusX
   * @param {number} radiusY
   * @param {number} rotation
   */ arcTo(x1, y1, x2, y2, radiusX, radiusY, rotation) {
        command('arcTo', radiusY !== undefined ? [
            x1,
            y1,
            x2,
            y2,
            radiusX,
            radiusY,
            rotation
        ] : [
            x1,
            y1,
            x2,
            y2,
            radiusX
        ]);
        this._context.arcTo(x1, y1, x2, y2, radiusX, radiusY, rotation);
    }
    /**
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */ rect(x, y, w, h) {
        command('rect', [
            x,
            y,
            w,
            h
        ]);
        this._context.rect(x, y, w, h);
    }
    /**
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @param {number} startAngle
   * @param {number} endAngle
   * @param {boolean} anticlockwise
   */ arc(x, y, radius, startAngle, endAngle, anticlockwise) {
        command('arc', [
            x,
            y,
            radius,
            startAngle,
            endAngle,
            anticlockwise
        ]);
        this._context.arc(x, y, radius, startAngle, endAngle, anticlockwise);
    }
    /**
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} radiusX
   * @param {number} radiusY
   * @param {number} rotation
   * @param {number} startAngle
   * @param {number} endAngle
   * @param {boolean} anticlockwise
   */ ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
        command('ellipse', [
            x,
            y,
            radiusX,
            radiusY,
            rotation,
            startAngle,
            endAngle,
            anticlockwise
        ]);
        this._context.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
    }
    /**
   * @param {CanvasRenderingContext2D} context
   */ constructor(context){
        this._context = context;
        // allow checking of context.ellipse for existence
        if (context && !context.ellipse) {
            this.ellipse = context.ellipse;
        }
    }
};
scenery.register('DebugContext', DebugContext);
export default DebugContext;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGVidWcvRGVidWdDb250ZXh0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgZGVidWdnaW5nIHZlcnNpb24gb2YgdGhlIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB0aGF0IHdpbGwgb3V0cHV0IGFsbCBjb21tYW5kcyBpc3N1ZWQsXG4gKiBidXQgY2FuIGFsc28gZm9yd2FyZCB0aGVtIHRvIGEgcmVhbCBjb250ZXh0XG4gKlxuICogU2VlIHRoZSBzcGVjIGF0IGh0dHA6Ly93d3cud2hhdHdnLm9yZy9zcGVjcy93ZWItYXBwcy9jdXJyZW50LXdvcmsvbXVsdGlwYWdlL3RoZS1jYW52YXMtZWxlbWVudC5odG1sIzJkY29udGV4dFxuICogV3JhcHBpbmcgb2YgdGhlIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCBpbnRlcmZhY2UgYXMgb2YgSmFudWFyeSAyN3RoLCAyMDEzIChidXQgbm90IG90aGVyIGludGVyZmFjZXMgbGlrZSBUZXh0TWV0cmljcyBhbmQgUGF0aClcbiAqXG4gKiBTaG9ydGN1dCB0byBjcmVhdGU6XG4gKiAgICB2YXIgY29udGV4dCA9IG5ldyBwaGV0LnNjZW5lcnkuRGVidWdDb250ZXh0KCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApLmdldENvbnRleHQoICcyZCcgKSApO1xuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgc2NlbmVyeSBmcm9tICcuLi9zY2VuZXJ5LmpzJztcblxuLy8gdXNlZCB0byBzZXJpYWxpemUgYXJndW1lbnRzIHNvIHRoYXQgaXQgZGlzcGxheXMgZXhhY3RseSBsaWtlIHRoZSBjYWxsIHdvdWxkIGJlIGV4ZWN1dGVkXG5mdW5jdGlvbiBzKCB2YWx1ZSApIHtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KCB2YWx1ZSApO1xufVxuXG5mdW5jdGlvbiBsb2coIG1lc3NhZ2UgKSB7XG4gIGNvbnNvbGUubG9nKCBgY29udGV4dC4ke21lc3NhZ2V9O2AgKTtcbn1cblxuZnVuY3Rpb24gYXR0cmlidXRlR2V0KCBuYW1lICkge1xuICBsb2coIG5hbWUgKTtcbn1cblxuZnVuY3Rpb24gYXR0cmlidXRlU2V0KCBuYW1lLCB2YWx1ZSApIHtcbiAgbG9nKCBgJHtuYW1lfSA9ICR7cyggdmFsdWUgKX1gICk7XG59XG5cbmZ1bmN0aW9uIGNvbW1hbmQoIG5hbWUsIGFyZ3MgKSB7XG4gIGlmICggYXJncyA9PT0gdW5kZWZpbmVkIHx8IGFyZ3MubGVuZ3RoID09PSAwICkge1xuICAgIGxvZyggYCR7bmFtZX0oKWAgKTtcbiAgfVxuICBlbHNlIHtcbiAgICBsb2coIGAke25hbWV9KCAke18ucmVkdWNlKCBhcmdzLCAoIG1lbW8sIGFyZyApID0+IHtcbiAgICAgIGlmICggbWVtby5sZW5ndGggPiAwICkge1xuICAgICAgICByZXR1cm4gYCR7bWVtb30sICR7cyggYXJnICl9YDtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gcyggYXJnICk7XG4gICAgICB9XG4gICAgfSwgJycgKX0gKWAgKTtcbiAgfVxufVxuXG5jbGFzcyBEZWJ1Z0NvbnRleHQge1xuICAvKipcbiAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGNvbnRleHRcbiAgICovXG4gIGNvbnN0cnVjdG9yKCBjb250ZXh0ICkge1xuICAgIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xuXG4gICAgLy8gYWxsb3cgY2hlY2tpbmcgb2YgY29udGV4dC5lbGxpcHNlIGZvciBleGlzdGVuY2VcbiAgICBpZiAoIGNvbnRleHQgJiYgIWNvbnRleHQuZWxsaXBzZSApIHtcbiAgICAgIHRoaXMuZWxsaXBzZSA9IGNvbnRleHQuZWxsaXBzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7SFRNTENhbnZhc0VsZW1lbnR9XG4gICAqL1xuICBnZXQgY2FudmFzKCkge1xuICAgIGF0dHJpYnV0ZUdldCggJ2NhbnZhcycgKTtcbiAgICByZXR1cm4gdGhpcy5fY29udGV4dC5jYW52YXM7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgZ2V0IHdpZHRoKCkge1xuICAgIGF0dHJpYnV0ZUdldCggJ3dpZHRoJyApO1xuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LndpZHRoO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGdldCBoZWlnaHQoKSB7XG4gICAgYXR0cmlidXRlR2V0KCAnaGVpZ2h0JyApO1xuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LmhlaWdodDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqL1xuICBjb21taXQoKSB7XG4gICAgY29tbWFuZCggJ2NvbW1pdCcgKTtcbiAgICB0aGlzLl9jb250ZXh0LmNvbW1pdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIHNhdmUoKSB7XG4gICAgY29tbWFuZCggJ3NhdmUnICk7XG4gICAgdGhpcy5fY29udGV4dC5zYXZlKCk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgcmVzdG9yZSgpIHtcbiAgICBjb21tYW5kKCAncmVzdG9yZScgKTtcbiAgICB0aGlzLl9jb250ZXh0LnJlc3RvcmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtET01NYXRyaXh9XG4gICAqL1xuICBnZXQgY3VycmVudFRyYW5zZm9ybSgpIHtcbiAgICBhdHRyaWJ1dGVHZXQoICdjdXJyZW50VHJhbnNmb3JtJyApO1xuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LmN1cnJlbnRUcmFuc2Zvcm07XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0RPTU1hdHJpeH0gdHJhbnNmb3JtXG4gICAqL1xuICBzZXQgY3VycmVudFRyYW5zZm9ybSggdHJhbnNmb3JtICkge1xuICAgIGF0dHJpYnV0ZVNldCggJ2N1cnJlbnRUcmFuc2Zvcm0nLCB0cmFuc2Zvcm0gKTtcbiAgICB0aGlzLl9jb250ZXh0LmN1cnJlbnRUcmFuc2Zvcm0gPSB0cmFuc2Zvcm07XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0geFxuICAgKiBAcGFyYW0ge251bWJlcn0geVxuICAgKi9cbiAgc2NhbGUoIHgsIHkgKSB7XG4gICAgY29tbWFuZCggJ3NjYWxlJywgWyB4LCB5IF0gKTtcbiAgICB0aGlzLl9jb250ZXh0LnNjYWxlKCB4LCB5ICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGVcbiAgICovXG4gIHJvdGF0ZSggYW5nbGUgKSB7XG4gICAgY29tbWFuZCggJ3JvdGF0ZScsIFsgYW5nbGUgXSApO1xuICAgIHRoaXMuX2NvbnRleHQucm90YXRlKCBhbmdsZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcbiAgICovXG4gIHRyYW5zbGF0ZSggeCwgeSApIHtcbiAgICBjb21tYW5kKCAndHJhbnNsYXRlJywgWyB4LCB5IF0gKTtcbiAgICB0aGlzLl9jb250ZXh0LnRyYW5zbGF0ZSggeCwgeSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFcbiAgICogQHBhcmFtIHtudW1iZXJ9IGJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVcbiAgICogQHBhcmFtIHtudW1iZXJ9IGZcbiAgICovXG4gIHRyYW5zZm9ybSggYSwgYiwgYywgZCwgZSwgZiApIHtcbiAgICBjb21tYW5kKCAndHJhbnNmb3JtJywgWyBhLCBiLCBjLCBkLCBlLCBmIF0gKTtcbiAgICB0aGlzLl9jb250ZXh0LnRyYW5zZm9ybSggYSwgYiwgYywgZCwgZSwgZiApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFcbiAgICogQHBhcmFtIHtudW1iZXJ9IGJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVcbiAgICogQHBhcmFtIHtudW1iZXJ9IGZcbiAgICovXG4gIHNldFRyYW5zZm9ybSggYSwgYiwgYywgZCwgZSwgZiApIHtcbiAgICBjb21tYW5kKCAnc2V0VHJhbnNmb3JtJywgWyBhLCBiLCBjLCBkLCBlLCBmIF0gKTtcbiAgICB0aGlzLl9jb250ZXh0LnNldFRyYW5zZm9ybSggYSwgYiwgYywgZCwgZSwgZiApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIHJlc2V0VHJhbnNmb3JtKCkge1xuICAgIGNvbW1hbmQoICdyZXNldFRyYW5zZm9ybScgKTtcbiAgICB0aGlzLl9jb250ZXh0LnJlc2V0VHJhbnNmb3JtKCk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgZ2V0IGdsb2JhbEFscGhhKCkge1xuICAgIGF0dHJpYnV0ZUdldCggJ2dsb2JhbEFscGhhJyApO1xuICAgIHJldHVybiB0aGlzLl9jb250ZXh0Lmdsb2JhbEFscGhhO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlXG4gICAqL1xuICBzZXQgZ2xvYmFsQWxwaGEoIHZhbHVlICkge1xuICAgIGF0dHJpYnV0ZVNldCggJ2dsb2JhbEFscGhhJywgdmFsdWUgKTtcbiAgICB0aGlzLl9jb250ZXh0Lmdsb2JhbEFscGhhID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgZ2V0IGdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbigpIHtcbiAgICBhdHRyaWJ1dGVHZXQoICdnbG9iYWxDb21wb3NpdGVPcGVyYXRpb24nICk7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXG4gICAqL1xuICBzZXQgZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uKCB2YWx1ZSApIHtcbiAgICBhdHRyaWJ1dGVTZXQoICdnbG9iYWxDb21wb3NpdGVPcGVyYXRpb24nLCB2YWx1ZSApO1xuICAgIHRoaXMuX2NvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGdldCBpbWFnZVNtb290aGluZ0VuYWJsZWQoKSB7XG4gICAgYXR0cmlidXRlR2V0KCAnaW1hZ2VTbW9vdGhpbmdFbmFibGVkJyApO1xuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LmltYWdlU21vb3RoaW5nRW5hYmxlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdmFsdWVcbiAgICovXG4gIHNldCBpbWFnZVNtb290aGluZ0VuYWJsZWQoIHZhbHVlICkge1xuICAgIGF0dHJpYnV0ZVNldCggJ2ltYWdlU21vb3RoaW5nRW5hYmxlZCcsIHZhbHVlICk7XG4gICAgdGhpcy5fY29udGV4dC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICBnZXQgc3Ryb2tlU3R5bGUoKSB7XG4gICAgYXR0cmlidXRlR2V0KCAnc3Ryb2tlU3R5bGUnICk7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRleHQuc3Ryb2tlU3R5bGU7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcbiAgICovXG4gIHNldCBzdHJva2VTdHlsZSggdmFsdWUgKSB7XG4gICAgYXR0cmlidXRlU2V0KCAnc3Ryb2tlU3R5bGUnLCB2YWx1ZSApO1xuICAgIHRoaXMuX2NvbnRleHQuc3Ryb2tlU3R5bGUgPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICBnZXQgZmlsbFN0eWxlKCkge1xuICAgIGF0dHJpYnV0ZUdldCggJ2ZpbGxTdHlsZScgKTtcbiAgICByZXR1cm4gdGhpcy5fY29udGV4dC5maWxsU3R5bGU7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcbiAgICovXG4gIHNldCBmaWxsU3R5bGUoIHZhbHVlICkge1xuICAgIGF0dHJpYnV0ZVNldCggJ2ZpbGxTdHlsZScsIHZhbHVlICk7XG4gICAgdGhpcy5fY29udGV4dC5maWxsU3R5bGUgPSB2YWx1ZTtcbiAgfVxuXG4gIC8vIFRPRE86IGNyZWF0ZSB3cmFwcGVyIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4MFxuICAgKiBAcGFyYW0ge251bWJlcn0geTBcbiAgICogQHBhcmFtIHtudW1iZXJ9IHgxXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5MVxuICAgKiBAcmV0dXJucyB7Kn1cbiAgICovXG4gIGNyZWF0ZUxpbmVhckdyYWRpZW50KCB4MCwgeTAsIHgxLCB5MSApIHtcbiAgICBjb21tYW5kKCAnY3JlYXRlTGluZWFyR3JhZGllbnQnLCBbIHgwLCB5MCwgeDEsIHkxIF0gKTtcbiAgICByZXR1cm4gdGhpcy5fY29udGV4dC5jcmVhdGVMaW5lYXJHcmFkaWVudCggeDAsIHkwLCB4MSwgeTEgKTtcbiAgfVxuXG4gIC8vIFRPRE86IGNyZWF0ZSB3cmFwcGVyIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4MFxuICAgKiBAcGFyYW0ge251bWJlcn0geTBcbiAgICogQHBhcmFtIHtudW1iZXJ9IHIwXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4MVxuICAgKiBAcGFyYW0ge251bWJlcn0geTFcbiAgICogQHBhcmFtIHtudW1iZXJ9IHIxXG4gICAqIEByZXR1cm5zIHsqfVxuICAgKi9cbiAgY3JlYXRlUmFkaWFsR3JhZGllbnQoIHgwLCB5MCwgcjAsIHgxLCB5MSwgcjEgKSB7XG4gICAgY29tbWFuZCggJ2NyZWF0ZVJhZGlhbEdyYWRpZW50JywgWyB4MCwgeTAsIHIwLCB4MSwgeTEsIHIxIF0gKTtcbiAgICByZXR1cm4gdGhpcy5fY29udGV4dC5jcmVhdGVSYWRpYWxHcmFkaWVudCggeDAsIHkwLCByMCwgeDEsIHkxLCByMSApO1xuICB9XG5cbiAgLy8gVE9ETzogY3JlYXRlIHdyYXBwZXIgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHsqfSBpbWFnZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVwZXRpdGlvblxuICAgKiBAcmV0dXJucyB7Kn1cbiAgICovXG4gIGNyZWF0ZVBhdHRlcm4oIGltYWdlLCByZXBldGl0aW9uICkge1xuICAgIGNvbW1hbmQoICdjcmVhdGVQYXR0ZXJuJywgWyBpbWFnZSwgcmVwZXRpdGlvbiBdICk7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRleHQuY3JlYXRlUGF0dGVybiggaW1hZ2UsIHJlcGV0aXRpb24gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBnZXQgc2hhZG93T2Zmc2V0WCgpIHtcbiAgICBhdHRyaWJ1dGVHZXQoICdzaGFkb3dPZmZzZXRYJyApO1xuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LnNoYWRvd09mZnNldFg7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcbiAgICovXG4gIHNldCBzaGFkb3dPZmZzZXRYKCB2YWx1ZSApIHtcbiAgICBhdHRyaWJ1dGVTZXQoICdzaGFkb3dPZmZzZXRYJywgdmFsdWUgKTtcbiAgICB0aGlzLl9jb250ZXh0LnNoYWRvd09mZnNldFggPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBnZXQgc2hhZG93T2Zmc2V0WSgpIHtcbiAgICBhdHRyaWJ1dGVHZXQoICdzaGFkb3dPZmZzZXRZJyApO1xuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LnNoYWRvd09mZnNldFk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcbiAgICovXG4gIHNldCBzaGFkb3dPZmZzZXRZKCB2YWx1ZSApIHtcbiAgICBhdHRyaWJ1dGVTZXQoICdzaGFkb3dPZmZzZXRZJywgdmFsdWUgKTtcbiAgICB0aGlzLl9jb250ZXh0LnNoYWRvd09mZnNldFkgPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBnZXQgc2hhZG93Qmx1cigpIHtcbiAgICBhdHRyaWJ1dGVHZXQoICdzaGFkb3dCbHVyJyApO1xuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LnNoYWRvd0JsdXI7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcbiAgICovXG4gIHNldCBzaGFkb3dCbHVyKCB2YWx1ZSApIHtcbiAgICBhdHRyaWJ1dGVTZXQoICdzaGFkb3dCbHVyJywgdmFsdWUgKTtcbiAgICB0aGlzLl9jb250ZXh0LnNoYWRvd0JsdXIgPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICBnZXQgc2hhZG93Q29sb3IoKSB7XG4gICAgYXR0cmlidXRlR2V0KCAnc2hhZG93Q29sb3InICk7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRleHQuc2hhZG93Q29sb3I7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcbiAgICovXG4gIHNldCBzaGFkb3dDb2xvciggdmFsdWUgKSB7XG4gICAgYXR0cmlidXRlU2V0KCAnc2hhZG93Q29sb3InLCB2YWx1ZSApO1xuICAgIHRoaXMuX2NvbnRleHQuc2hhZG93Q29sb3IgPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoXG4gICAqL1xuICBjbGVhclJlY3QoIHgsIHksIHcsIGggKSB7XG4gICAgY29tbWFuZCggJ2NsZWFyUmVjdCcsIFsgeCwgeSwgdywgaCBdICk7XG4gICAgdGhpcy5fY29udGV4dC5jbGVhclJlY3QoIHgsIHksIHcsIGggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoXG4gICAqL1xuICBmaWxsUmVjdCggeCwgeSwgdywgaCApIHtcbiAgICBjb21tYW5kKCAnZmlsbFJlY3QnLCBbIHgsIHksIHcsIGggXSApO1xuICAgIHRoaXMuX2NvbnRleHQuZmlsbFJlY3QoIHgsIHksIHcsIGggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoXG4gICAqL1xuICBzdHJva2VSZWN0KCB4LCB5LCB3LCBoICkge1xuICAgIGNvbW1hbmQoICdzdHJva2VSZWN0JywgWyB4LCB5LCB3LCBoIF0gKTtcbiAgICB0aGlzLl9jb250ZXh0LnN0cm9rZVJlY3QoIHgsIHksIHcsIGggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICBnZXQgZmlsbFJ1bGUoKSB7XG4gICAgYXR0cmlidXRlR2V0KCAnZmlsbFJ1bGUnICk7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRleHQuZmlsbFJ1bGU7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcbiAgICovXG4gIHNldCBmaWxsUnVsZSggdmFsdWUgKSB7XG4gICAgYXR0cmlidXRlU2V0KCAnZmlsbFJ1bGUnLCB2YWx1ZSApO1xuICAgIHRoaXMuX2NvbnRleHQuZmlsbFJ1bGUgPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqL1xuICBiZWdpblBhdGgoKSB7XG4gICAgY29tbWFuZCggJ2JlZ2luUGF0aCcgKTtcbiAgICB0aGlzLl9jb250ZXh0LmJlZ2luUGF0aCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtQYXRoMkR9IHBhdGhcbiAgICovXG4gIGZpbGwoIHBhdGggKSB7XG4gICAgaWYgKCBwYXRoICkge1xuICAgICAgY29tbWFuZCggJ2ZpbGwnLCBbIHBhdGggXSApO1xuICAgICAgdGhpcy5fY29udGV4dC5maWxsKCBwYXRoICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY29tbWFuZCggJ2ZpbGwnICk7XG4gICAgICB0aGlzLl9jb250ZXh0LmZpbGwoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1BhdGgyRH0gcGF0aFxuICAgKi9cbiAgc3Ryb2tlKCBwYXRoICkge1xuICAgIGlmICggcGF0aCApIHtcbiAgICAgIGNvbW1hbmQoICdzdHJva2UnLCBbIHBhdGggXSApO1xuICAgICAgdGhpcy5fY29udGV4dC5zdHJva2UoIHBhdGggKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb21tYW5kKCAnc3Ryb2tlJyApO1xuICAgICAgdGhpcy5fY29udGV4dC5zdHJva2UoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1BhdGgyRH0gcGF0aFxuICAgKi9cbiAgc2Nyb2xsUGF0aEludG9WaWV3KCBwYXRoICkge1xuICAgIGNvbW1hbmQoICdzY3JvbGxQYXRoSW50b1ZpZXcnLCBwYXRoID8gWyBwYXRoIF0gOiB1bmRlZmluZWQgKTtcbiAgICB0aGlzLl9jb250ZXh0LnNjcm9sbFBhdGhJbnRvVmlldyggcGF0aCApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtQYXRoMkR9IHBhdGhcbiAgICovXG4gIGNsaXAoIHBhdGggKSB7XG4gICAgY29tbWFuZCggJ2NsaXAnLCBwYXRoID8gWyBwYXRoIF0gOiB1bmRlZmluZWQgKTtcbiAgICB0aGlzLl9jb250ZXh0LmNsaXAoIHBhdGggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqL1xuICByZXNldENsaXAoKSB7XG4gICAgY29tbWFuZCggJ3Jlc2V0Q2xpcCcgKTtcbiAgICB0aGlzLl9jb250ZXh0LnJlc2V0Q2xpcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHsqfSBhXG4gICAqIEBwYXJhbSB7Kn0gYlxuICAgKiBAcGFyYW0geyp9IGNcbiAgICogQHJldHVybnMgeyp9XG4gICAqL1xuICBpc1BvaW50SW5QYXRoKCBhLCBiLCBjICkge1xuICAgIGNvbW1hbmQoICdpc1BvaW50SW5QYXRoJywgYyA/IFsgYSwgYiwgYyBdIDogWyBhLCBiIF0gKTtcbiAgICByZXR1cm4gdGhpcy5fY29udGV4dC5pc1BvaW50SW5QYXRoKCBhLCBiLCBjICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0geyp9IHRleHRcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcbiAgICogQHBhcmFtIHsqfSBtYXhXaWR0aFxuICAgKi9cbiAgZmlsbFRleHQoIHRleHQsIHgsIHksIG1heFdpZHRoICkge1xuICAgIGNvbW1hbmQoICdmaWxsVGV4dCcsIG1heFdpZHRoICE9PSB1bmRlZmluZWQgPyBbIHRleHQsIHgsIHksIG1heFdpZHRoIF0gOiBbIHRleHQsIHgsIHkgXSApO1xuICAgIHRoaXMuX2NvbnRleHQuZmlsbFRleHQoIHRleHQsIHgsIHksIG1heFdpZHRoICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0geyp9IHRleHRcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcbiAgICogQHBhcmFtIHsqfSBtYXhXaWR0aFxuICAgKi9cbiAgc3Ryb2tlVGV4dCggdGV4dCwgeCwgeSwgbWF4V2lkdGggKSB7XG4gICAgY29tbWFuZCggJ3N0cm9rZVRleHQnLCBtYXhXaWR0aCAhPT0gdW5kZWZpbmVkID8gWyB0ZXh0LCB4LCB5LCBtYXhXaWR0aCBdIDogWyB0ZXh0LCB4LCB5IF0gKTtcbiAgICB0aGlzLl9jb250ZXh0LnN0cm9rZVRleHQoIHRleHQsIHgsIHksIG1heFdpZHRoICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0geyp9IHRleHRcbiAgICogQHJldHVybnMgeyp9XG4gICAqL1xuICBtZWFzdXJlVGV4dCggdGV4dCApIHtcbiAgICBjb21tYW5kKCAnbWVhc3VyZVRleHQnLCBbIHRleHQgXSApO1xuICAgIHJldHVybiB0aGlzLl9jb250ZXh0Lm1lYXN1cmVUZXh0KCB0ZXh0ICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0geyp9IGltYWdlXG4gICAqIEBwYXJhbSB7Kn0gYVxuICAgKiBAcGFyYW0geyp9IGJcbiAgICogQHBhcmFtIHsqfSBjXG4gICAqIEBwYXJhbSB7Kn0gZFxuICAgKiBAcGFyYW0geyp9IGVcbiAgICogQHBhcmFtIHsqfSBmXG4gICAqIEBwYXJhbSB7Kn0gZ1xuICAgKiBAcGFyYW0ge251bWJlcn0gaFxuICAgKi9cbiAgZHJhd0ltYWdlKCBpbWFnZSwgYSwgYiwgYywgZCwgZSwgZiwgZywgaCApIHtcbiAgICBjb21tYW5kKCAnZHJhd0ltYWdlJywgYyAhPT0gdW5kZWZpbmVkID8gKCBlICE9PSB1bmRlZmluZWQgPyBbIGltYWdlLCBhLCBiLCBjLCBkLCBlLCBmLCBnLCBoIF0gOiBbIGltYWdlLCBhLCBiLCBjLCBkIF0gKSA6IFsgaW1hZ2UsIGEsIGIgXSApO1xuICAgIHRoaXMuX2NvbnRleHQuZHJhd0ltYWdlKCBpbWFnZSwgYSwgYiwgYywgZCwgZSwgZiwgZywgaCApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtbT2JqZWN0XX0gb3B0aW9uc1xuICAgKi9cbiAgYWRkSGl0UmVnaW9uKCBvcHRpb25zICkge1xuICAgIGNvbW1hbmQoICdhZGRIaXRSZWdpb24nLCBbIG9wdGlvbnMgXSApO1xuICAgIHRoaXMuX2NvbnRleHQuYWRkSGl0UmVnaW9uKCBvcHRpb25zICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1tPYmplY3RdfSBvcHRpb25zXG4gICAqL1xuICByZW1vdmVIaXRSZWdpb24oIG9wdGlvbnMgKSB7XG4gICAgY29tbWFuZCggJ3JlbW92ZUhpdFJlZ2lvbicsIFsgb3B0aW9ucyBdICk7XG4gICAgdGhpcy5fY29udGV4dC5yZW1vdmVIaXRSZWdpb24oIG9wdGlvbnMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gYVxuICAgKiBAcGFyYW0geyp9IGJcbiAgICogQHJldHVybnMgeyp9XG4gICAqL1xuICBjcmVhdGVJbWFnZURhdGEoIGEsIGIgKSB7XG4gICAgY29tbWFuZCggJ2NyZWF0ZUltYWdlRGF0YScsIGIgIT09IHVuZGVmaW5lZCA/IFsgYSwgYiBdIDogWyBhIF0gKTtcbiAgICByZXR1cm4gdGhpcy5fY29udGV4dC5jcmVhdGVJbWFnZURhdGEoIGEsIGIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gYVxuICAgKiBAcGFyYW0geyp9IGJcbiAgICogQHJldHVybnMgeyp9XG4gICAqL1xuICBjcmVhdGVJbWFnZURhdGFIRCggYSwgYiApIHtcbiAgICBjb21tYW5kKCAnY3JlYXRlSW1hZ2VEYXRhSEQnLCBbIGEsIGIgXSApO1xuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LmNyZWF0ZUltYWdlRGF0YUhEKCBhLCBiICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0geyp9IHN4XG4gICAqIEBwYXJhbSB7Kn0gc3lcbiAgICogQHBhcmFtIHsqfSBzd1xuICAgKiBAcGFyYW0geyp9IHNoXG4gICAqIEByZXR1cm5zIHsqfVxuICAgKi9cbiAgZ2V0SW1hZ2VEYXRhKCBzeCwgc3ksIHN3LCBzaCApIHtcbiAgICBjb21tYW5kKCAnZ2V0SW1hZ2VEYXRhJywgWyBzeCwgc3ksIHN3LCBzaCBdICk7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRleHQuZ2V0SW1hZ2VEYXRhKCBzeCwgc3ksIHN3LCBzaCApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHsqfSBzeFxuICAgKiBAcGFyYW0geyp9IHN5XG4gICAqIEBwYXJhbSB7Kn0gc3dcbiAgICogQHBhcmFtIHsqfSBzaFxuICAgKiBAcmV0dXJucyB7Kn1cbiAgICovXG4gIGdldEltYWdlRGF0YUhEKCBzeCwgc3ksIHN3LCBzaCApIHtcbiAgICBjb21tYW5kKCAnZ2V0SW1hZ2VEYXRhSEQnLCBbIHN4LCBzeSwgc3csIHNoIF0gKTtcbiAgICByZXR1cm4gdGhpcy5fY29udGV4dC5nZXRJbWFnZURhdGFIRCggc3gsIHN5LCBzdywgc2ggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gaW1hZ2VEYXRhXG4gICAqIEBwYXJhbSB7Kn0gZHhcbiAgICogQHBhcmFtIHsqfSBkeVxuICAgKiBAcGFyYW0geyp9IGRpcnR5WFxuICAgKiBAcGFyYW0geyp9IGRpcnR5WVxuICAgKiBAcGFyYW0geyp9IGRpcnR5V2lkdGhcbiAgICogQHBhcmFtIHsqfSBkaXJ0eUhlaWdodFxuICAgKi9cbiAgcHV0SW1hZ2VEYXRhKCBpbWFnZURhdGEsIGR4LCBkeSwgZGlydHlYLCBkaXJ0eVksIGRpcnR5V2lkdGgsIGRpcnR5SGVpZ2h0ICkge1xuICAgIGNvbW1hbmQoICdwdXRJbWFnZURhdGEnLCBkaXJ0eVggIT09IHVuZGVmaW5lZCA/IFsgaW1hZ2VEYXRhLCBkeCwgZHksIGRpcnR5WCwgZGlydHlZLCBkaXJ0eVdpZHRoLCBkaXJ0eUhlaWdodCBdIDogWyBpbWFnZURhdGEsIGR4LCBkeSBdICk7XG4gICAgdGhpcy5fY29udGV4dC5wdXRJbWFnZURhdGEoIGltYWdlRGF0YSwgZHgsIGR5LCBkaXJ0eVgsIGRpcnR5WSwgZGlydHlXaWR0aCwgZGlydHlIZWlnaHQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gaW1hZ2VEYXRhXG4gICAqIEBwYXJhbSB7Kn0gZHhcbiAgICogQHBhcmFtIHsqfSBkeVxuICAgKiBAcGFyYW0geyp9IGRpcnR5WFxuICAgKiBAcGFyYW0geyp9IGRpcnR5WVxuICAgKiBAcGFyYW0geyp9IGRpcnR5V2lkdGhcbiAgICogQHBhcmFtIHsqfSBkaXJ0eUhlaWdodFxuICAgKi9cbiAgcHV0SW1hZ2VEYXRhSEQoIGltYWdlRGF0YSwgZHgsIGR5LCBkaXJ0eVgsIGRpcnR5WSwgZGlydHlXaWR0aCwgZGlydHlIZWlnaHQgKSB7XG4gICAgY29tbWFuZCggJ3B1dEltYWdlRGF0YUhEJywgZGlydHlYICE9PSB1bmRlZmluZWQgPyBbIGltYWdlRGF0YSwgZHgsIGR5LCBkaXJ0eVgsIGRpcnR5WSwgZGlydHlXaWR0aCwgZGlydHlIZWlnaHQgXSA6IFsgaW1hZ2VEYXRhLCBkeCwgZHkgXSApO1xuICAgIHRoaXMuX2NvbnRleHQucHV0SW1hZ2VEYXRhSEQoIGltYWdlRGF0YSwgZHgsIGR5LCBkaXJ0eVgsIGRpcnR5WSwgZGlydHlXaWR0aCwgZGlydHlIZWlnaHQgKTtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICAgKiBDYW52YXNEcmF3aW5nU3R5bGVzXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGdldCBsaW5lV2lkdGgoKSB7XG4gICAgYXR0cmlidXRlR2V0KCAnbGluZVdpZHRoJyApO1xuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LmxpbmVXaWR0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxuICAgKi9cbiAgc2V0IGxpbmVXaWR0aCggdmFsdWUgKSB7XG4gICAgYXR0cmlidXRlU2V0KCAnbGluZVdpZHRoJywgdmFsdWUgKTtcbiAgICB0aGlzLl9jb250ZXh0LmxpbmVXaWR0aCA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIGdldCBsaW5lQ2FwKCkge1xuICAgIGF0dHJpYnV0ZUdldCggJ2xpbmVDYXAnICk7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRleHQubGluZUNhcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICAgKi9cbiAgc2V0IGxpbmVDYXAoIHZhbHVlICkge1xuICAgIGF0dHJpYnV0ZVNldCggJ2xpbmVDYXAnLCB2YWx1ZSApO1xuICAgIHRoaXMuX2NvbnRleHQubGluZUNhcCA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIGdldCBsaW5lSm9pbigpIHtcbiAgICBhdHRyaWJ1dGVHZXQoICdsaW5lSm9pbicgKTtcbiAgICByZXR1cm4gdGhpcy5fY29udGV4dC5saW5lSm9pbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICAgKi9cbiAgc2V0IGxpbmVKb2luKCB2YWx1ZSApIHtcbiAgICBhdHRyaWJ1dGVTZXQoICdsaW5lSm9pbicsIHZhbHVlICk7XG4gICAgdGhpcy5fY29udGV4dC5saW5lSm9pbiA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGdldCBtaXRlckxpbWl0KCkge1xuICAgIGF0dHJpYnV0ZUdldCggJ21pdGVyTGltaXQnICk7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRleHQubWl0ZXJMaW1pdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxuICAgKi9cbiAgc2V0IG1pdGVyTGltaXQoIHZhbHVlICkge1xuICAgIGF0dHJpYnV0ZVNldCggJ21pdGVyTGltaXQnLCB2YWx1ZSApO1xuICAgIHRoaXMuX2NvbnRleHQubWl0ZXJMaW1pdCA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHsqfSBzZWdtZW50c1xuICAgKi9cbiAgc2V0TGluZURhc2goIHNlZ21lbnRzICkge1xuICAgIGNvbW1hbmQoICdzZXRMaW5lRGFzaCcsIFsgc2VnbWVudHMgXSApO1xuICAgIHRoaXMuX2NvbnRleHQuc2V0TGluZURhc2goIHNlZ21lbnRzICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKiBAcmV0dXJucyB7Kn1cbiAgICovXG4gIGdldExpbmVEYXNoKCkge1xuICAgIGNvbW1hbmQoICdnZXRMaW5lRGFzaCcgKTtcbiAgICByZXR1cm4gdGhpcy5fY29udGV4dC5nZXRMaW5lRGFzaCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGdldCBsaW5lRGFzaE9mZnNldCgpIHtcbiAgICBhdHRyaWJ1dGVHZXQoICdsaW5lRGFzaE9mZnNldCcgKTtcbiAgICByZXR1cm4gdGhpcy5fY29udGV4dC5saW5lRGFzaE9mZnNldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxuICAgKi9cbiAgc2V0IGxpbmVEYXNoT2Zmc2V0KCB2YWx1ZSApIHtcbiAgICBhdHRyaWJ1dGVTZXQoICdsaW5lRGFzaE9mZnNldCcsIHZhbHVlICk7XG4gICAgdGhpcy5fY29udGV4dC5saW5lRGFzaE9mZnNldCA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIGdldCBmb250KCkge1xuICAgIGF0dHJpYnV0ZUdldCggJ2ZvbnQnICk7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRleHQuZm9udDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICAgKi9cbiAgc2V0IGZvbnQoIHZhbHVlICkge1xuICAgIGF0dHJpYnV0ZVNldCggJ2ZvbnQnLCB2YWx1ZSApO1xuICAgIHRoaXMuX2NvbnRleHQuZm9udCA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIGdldCB0ZXh0QWxpZ24oKSB7XG4gICAgYXR0cmlidXRlR2V0KCAndGV4dEFsaWduJyApO1xuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LnRleHRBbGlnbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICAgKi9cbiAgc2V0IHRleHRBbGlnbiggdmFsdWUgKSB7XG4gICAgYXR0cmlidXRlU2V0KCAndGV4dEFsaWduJywgdmFsdWUgKTtcbiAgICB0aGlzLl9jb250ZXh0LnRleHRBbGlnbiA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIGdldCB0ZXh0QmFzZWxpbmUoKSB7XG4gICAgYXR0cmlidXRlR2V0KCAndGV4dEJhc2VsaW5lJyApO1xuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LnRleHRCYXNlbGluZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICAgKi9cbiAgc2V0IHRleHRCYXNlbGluZSggdmFsdWUgKSB7XG4gICAgYXR0cmlidXRlU2V0KCAndGV4dEJhc2VsaW5lJywgdmFsdWUgKTtcbiAgICB0aGlzLl9jb250ZXh0LnRleHRCYXNlbGluZSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIGdldCBkaXJlY3Rpb24oKSB7XG4gICAgYXR0cmlidXRlR2V0KCAnZGlyZWN0aW9uJyApO1xuICAgIHJldHVybiB0aGlzLl9jb250ZXh0LmRpcmVjdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICAgKi9cbiAgc2V0IGRpcmVjdGlvbiggdmFsdWUgKSB7XG4gICAgYXR0cmlidXRlU2V0KCAnZGlyZWN0aW9uJywgdmFsdWUgKTtcbiAgICB0aGlzLl9jb250ZXh0LmRpcmVjdGlvbiA9IHZhbHVlO1xuICB9XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXG4gICAqIENhbnZhc1BhdGhNZXRob2RzXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGNsb3NlUGF0aCgpIHtcbiAgICBjb21tYW5kKCAnY2xvc2VQYXRoJyApO1xuICAgIHRoaXMuX2NvbnRleHQuY2xvc2VQYXRoKCk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0geFxuICAgKiBAcGFyYW0ge251bWJlcn0geVxuICAgKi9cbiAgbW92ZVRvKCB4LCB5ICkge1xuICAgIGNvbW1hbmQoICdtb3ZlVG8nLCBbIHgsIHkgXSApO1xuICAgIHRoaXMuX2NvbnRleHQubW92ZVRvKCB4LCB5ICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0geFxuICAgKiBAcGFyYW0ge251bWJlcn0geVxuICAgKi9cbiAgbGluZVRvKCB4LCB5ICkge1xuICAgIGNvbW1hbmQoICdsaW5lVG8nLCBbIHgsIHkgXSApO1xuICAgIHRoaXMuX2NvbnRleHQubGluZVRvKCB4LCB5ICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0geyp9IGNweFxuICAgKiBAcGFyYW0geyp9IGNweVxuICAgKiBAcGFyYW0ge251bWJlcn0geFxuICAgKiBAcGFyYW0ge251bWJlcn0geVxuICAgKi9cbiAgcXVhZHJhdGljQ3VydmVUbyggY3B4LCBjcHksIHgsIHkgKSB7XG4gICAgY29tbWFuZCggJ3F1YWRyYXRpY0N1cnZlVG8nLCBbIGNweCwgY3B5LCB4LCB5IF0gKTtcbiAgICB0aGlzLl9jb250ZXh0LnF1YWRyYXRpY0N1cnZlVG8oIGNweCwgY3B5LCB4LCB5ICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0geyp9IGNwMXhcbiAgICogQHBhcmFtIHsqfSBjcDF5XG4gICAqIEBwYXJhbSB7Kn0gY3AyeFxuICAgKiBAcGFyYW0geyp9IGNwMnlcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcbiAgICovXG4gIGJlemllckN1cnZlVG8oIGNwMXgsIGNwMXksIGNwMngsIGNwMnksIHgsIHkgKSB7XG4gICAgY29tbWFuZCggJ2JlemllckN1cnZlVG8nLCBbIGNwMXgsIGNwMXksIGNwMngsIGNwMnksIHgsIHkgXSApO1xuICAgIHRoaXMuX2NvbnRleHQuYmV6aWVyQ3VydmVUbyggY3AxeCwgY3AxeSwgY3AyeCwgY3AyeSwgeCwgeSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHgxXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5MVxuICAgKiBAcGFyYW0ge251bWJlcn0geDJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHkyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXNYXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXNZXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByb3RhdGlvblxuICAgKi9cbiAgYXJjVG8oIHgxLCB5MSwgeDIsIHkyLCByYWRpdXNYLCByYWRpdXNZLCByb3RhdGlvbiApIHtcbiAgICBjb21tYW5kKCAnYXJjVG8nLCByYWRpdXNZICE9PSB1bmRlZmluZWQgPyBbIHgxLCB5MSwgeDIsIHkyLCByYWRpdXNYLCByYWRpdXNZLCByb3RhdGlvbiBdIDogWyB4MSwgeTEsIHgyLCB5MiwgcmFkaXVzWCBdICk7XG4gICAgdGhpcy5fY29udGV4dC5hcmNUbyggeDEsIHkxLCB4MiwgeTIsIHJhZGl1c1gsIHJhZGl1c1ksIHJvdGF0aW9uICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0geFxuICAgKiBAcGFyYW0ge251bWJlcn0geVxuICAgKiBAcGFyYW0ge251bWJlcn0gd1xuICAgKiBAcGFyYW0ge251bWJlcn0gaFxuICAgKi9cbiAgcmVjdCggeCwgeSwgdywgaCApIHtcbiAgICBjb21tYW5kKCAncmVjdCcsIFsgeCwgeSwgdywgaCBdICk7XG4gICAgdGhpcy5fY29udGV4dC5yZWN0KCB4LCB5LCB3LCBoICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0geFxuICAgKiBAcGFyYW0ge251bWJlcn0geVxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydEFuZ2xlXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBlbmRBbmdsZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFudGljbG9ja3dpc2VcbiAgICovXG4gIGFyYyggeCwgeSwgcmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgYW50aWNsb2Nrd2lzZSApIHtcbiAgICBjb21tYW5kKCAnYXJjJywgWyB4LCB5LCByYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBhbnRpY2xvY2t3aXNlIF0gKTtcbiAgICB0aGlzLl9jb250ZXh0LmFyYyggeCwgeSwgcmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgYW50aWNsb2Nrd2lzZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1c1hcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1c1lcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJvdGF0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydEFuZ2xlXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBlbmRBbmdsZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFudGljbG9ja3dpc2VcbiAgICovXG4gIGVsbGlwc2UoIHgsIHksIHJhZGl1c1gsIHJhZGl1c1ksIHJvdGF0aW9uLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgYW50aWNsb2Nrd2lzZSApIHtcbiAgICBjb21tYW5kKCAnZWxsaXBzZScsIFsgeCwgeSwgcmFkaXVzWCwgcmFkaXVzWSwgcm90YXRpb24sIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBhbnRpY2xvY2t3aXNlIF0gKTtcbiAgICB0aGlzLl9jb250ZXh0LmVsbGlwc2UoIHgsIHksIHJhZGl1c1gsIHJhZGl1c1ksIHJvdGF0aW9uLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgYW50aWNsb2Nrd2lzZSApO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdEZWJ1Z0NvbnRleHQnLCBEZWJ1Z0NvbnRleHQgKTtcbmV4cG9ydCBkZWZhdWx0IERlYnVnQ29udGV4dDsiXSwibmFtZXMiOlsic2NlbmVyeSIsInMiLCJ2YWx1ZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJsb2ciLCJtZXNzYWdlIiwiY29uc29sZSIsImF0dHJpYnV0ZUdldCIsIm5hbWUiLCJhdHRyaWJ1dGVTZXQiLCJjb21tYW5kIiwiYXJncyIsInVuZGVmaW5lZCIsImxlbmd0aCIsIl8iLCJyZWR1Y2UiLCJtZW1vIiwiYXJnIiwiRGVidWdDb250ZXh0IiwiY2FudmFzIiwiX2NvbnRleHQiLCJ3aWR0aCIsImhlaWdodCIsImNvbW1pdCIsInNhdmUiLCJyZXN0b3JlIiwiY3VycmVudFRyYW5zZm9ybSIsInRyYW5zZm9ybSIsInNjYWxlIiwieCIsInkiLCJyb3RhdGUiLCJhbmdsZSIsInRyYW5zbGF0ZSIsImEiLCJiIiwiYyIsImQiLCJlIiwiZiIsInNldFRyYW5zZm9ybSIsInJlc2V0VHJhbnNmb3JtIiwiZ2xvYmFsQWxwaGEiLCJnbG9iYWxDb21wb3NpdGVPcGVyYXRpb24iLCJpbWFnZVNtb290aGluZ0VuYWJsZWQiLCJzdHJva2VTdHlsZSIsImZpbGxTdHlsZSIsImNyZWF0ZUxpbmVhckdyYWRpZW50IiwieDAiLCJ5MCIsIngxIiwieTEiLCJjcmVhdGVSYWRpYWxHcmFkaWVudCIsInIwIiwicjEiLCJjcmVhdGVQYXR0ZXJuIiwiaW1hZ2UiLCJyZXBldGl0aW9uIiwic2hhZG93T2Zmc2V0WCIsInNoYWRvd09mZnNldFkiLCJzaGFkb3dCbHVyIiwic2hhZG93Q29sb3IiLCJjbGVhclJlY3QiLCJ3IiwiaCIsImZpbGxSZWN0Iiwic3Ryb2tlUmVjdCIsImZpbGxSdWxlIiwiYmVnaW5QYXRoIiwiZmlsbCIsInBhdGgiLCJzdHJva2UiLCJzY3JvbGxQYXRoSW50b1ZpZXciLCJjbGlwIiwicmVzZXRDbGlwIiwiaXNQb2ludEluUGF0aCIsImZpbGxUZXh0IiwidGV4dCIsIm1heFdpZHRoIiwic3Ryb2tlVGV4dCIsIm1lYXN1cmVUZXh0IiwiZHJhd0ltYWdlIiwiZyIsImFkZEhpdFJlZ2lvbiIsIm9wdGlvbnMiLCJyZW1vdmVIaXRSZWdpb24iLCJjcmVhdGVJbWFnZURhdGEiLCJjcmVhdGVJbWFnZURhdGFIRCIsImdldEltYWdlRGF0YSIsInN4Iiwic3kiLCJzdyIsInNoIiwiZ2V0SW1hZ2VEYXRhSEQiLCJwdXRJbWFnZURhdGEiLCJpbWFnZURhdGEiLCJkeCIsImR5IiwiZGlydHlYIiwiZGlydHlZIiwiZGlydHlXaWR0aCIsImRpcnR5SGVpZ2h0IiwicHV0SW1hZ2VEYXRhSEQiLCJsaW5lV2lkdGgiLCJsaW5lQ2FwIiwibGluZUpvaW4iLCJtaXRlckxpbWl0Iiwic2V0TGluZURhc2giLCJzZWdtZW50cyIsImdldExpbmVEYXNoIiwibGluZURhc2hPZmZzZXQiLCJmb250IiwidGV4dEFsaWduIiwidGV4dEJhc2VsaW5lIiwiZGlyZWN0aW9uIiwiY2xvc2VQYXRoIiwibW92ZVRvIiwibGluZVRvIiwicXVhZHJhdGljQ3VydmVUbyIsImNweCIsImNweSIsImJlemllckN1cnZlVG8iLCJjcDF4IiwiY3AxeSIsImNwMngiLCJjcDJ5IiwiYXJjVG8iLCJ4MiIsInkyIiwicmFkaXVzWCIsInJhZGl1c1kiLCJyb3RhdGlvbiIsInJlY3QiLCJhcmMiLCJyYWRpdXMiLCJzdGFydEFuZ2xlIiwiZW5kQW5nbGUiLCJhbnRpY2xvY2t3aXNlIiwiZWxsaXBzZSIsImNvbnN0cnVjdG9yIiwiY29udGV4dCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7O0NBV0MsR0FFRCxPQUFPQSxhQUFhLGdCQUFnQjtBQUVwQywwRkFBMEY7QUFDMUYsU0FBU0MsRUFBR0MsS0FBSztJQUNmLE9BQU9DLEtBQUtDLFNBQVMsQ0FBRUY7QUFDekI7QUFFQSxTQUFTRyxJQUFLQyxP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