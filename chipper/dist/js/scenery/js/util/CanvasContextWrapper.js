// Copyright 2013-2024, University of Colorado Boulder
/**
 * Wraps the context and contains a reference to the canvas, so that we can absorb unnecessary state changes,
 * and possibly combine certain fill operations.
 *
 * TODO: performance analysis, possibly axe this and use direct modification. https://github.com/phetsims/scenery/issues/1581
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { isTReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import { scenery } from '../imports.js';
let CanvasContextWrapper = class CanvasContextWrapper {
    /**
   * Set local styles to undefined, so that they will be invalidated later
   * @public
   */ resetStyles() {
        this.fillStyle = undefined; // null
        this.strokeStyle = undefined; // null
        this.lineWidth = undefined; // 1
        this.lineCap = undefined; // 'butt'
        this.lineJoin = undefined; // 'miter'
        this.lineDash = undefined; // []
        this.lineDashOffset = undefined; // 0
        this.miterLimit = undefined; // 10
        this.font = undefined; // '10px sans-serif'
        this.direction = undefined; // 'inherit'
    }
    /**
   * Sets a (possibly) new width and height, and clears the canvas.
   * @public
   *
   * @param {number} width
   * @param {number} height
   */ setDimensions(width, height) {
        //Don't guard against width and height, because we need to clear the canvas.
        //TODO: Is it expensive to clear by setting both the width and the height?  Maybe we just need to set the width to clear it. https://github.com/phetsims/scenery/issues/1581
        this.canvas.width = width;
        this.canvas.height = height;
        // assume all persistent data could have changed
        this.resetStyles();
    }
    /**
   * @public
   *
   * @param {string|Color|Property.<string>} style
   */ setFillStyle(style) {
        // turn {Property}s into their values when necessary
        if (style && isTReadOnlyProperty(style)) {
            style = style.value;
        }
        // turn {Color}s into strings when necessary
        if (style && style.getCanvasStyle) {
            style = style.getCanvasStyle();
        }
        if (this.fillStyle !== style) {
            this.fillStyle = style;
            // allow gradients / patterns
            this.context.fillStyle = style;
        }
    }
    /**
   * @public
   *
   * @param {string|Color|Property.<string>} style
   */ setStrokeStyle(style) {
        // turn {Property}s into their values when necessary
        if (style && isTReadOnlyProperty(style)) {
            style = style.value;
        }
        // turn {Color}s into strings when necessary
        if (style && style.getCanvasStyle) {
            style = style.getCanvasStyle();
        }
        if (this.strokeStyle !== style) {
            this.strokeStyle = style;
            // allow gradients / patterns
            this.context.strokeStyle = style;
        }
    }
    /**
   * @public
   *
   * @param {number} width
   */ setLineWidth(width) {
        if (this.lineWidth !== width) {
            this.lineWidth = width;
            this.context.lineWidth = width;
        }
    }
    /**
   * @public
   *
   * @param {string} cap
   */ setLineCap(cap) {
        if (this.lineCap !== cap) {
            this.lineCap = cap;
            this.context.lineCap = cap;
        }
    }
    /**
   * @public
   *
   * @param {string} join
   */ setLineJoin(join) {
        if (this.lineJoin !== join) {
            this.lineJoin = join;
            this.context.lineJoin = join;
        }
    }
    /**
   * @public
   *
   * @param {number} miterLimit
   */ setMiterLimit(miterLimit) {
        assert && assert(typeof miterLimit === 'number');
        if (this.miterLimit !== miterLimit) {
            this.miterLimit = miterLimit;
            this.context.miterLimit = miterLimit;
        }
    }
    /**
   * @public
   *
   * @param {Array.<number>|null} dash
   */ setLineDash(dash) {
        assert && assert(dash !== undefined, 'undefined line dash would cause hard-to-trace errors');
        if (this.lineDash !== dash) {
            this.lineDash = dash;
            if (this.context.setLineDash) {
                this.context.setLineDash(dash === null ? [] : dash); // see https://github.com/phetsims/scenery/issues/101 for null line-dash workaround
            } else if (this.context.mozDash !== undefined) {
                this.context.mozDash = dash;
            } else if (this.context.webkitLineDash !== undefined) {
                this.context.webkitLineDash = dash ? dash : [];
            } else {
            // unsupported line dash! do... nothing?
            }
        }
    }
    /**
   * @public
   *
   * @param {number} lineDashOffset
   */ setLineDashOffset(lineDashOffset) {
        if (this.lineDashOffset !== lineDashOffset) {
            this.lineDashOffset = lineDashOffset;
            if (this.context.lineDashOffset !== undefined) {
                this.context.lineDashOffset = lineDashOffset;
            } else if (this.context.webkitLineDashOffset !== undefined) {
                this.context.webkitLineDashOffset = lineDashOffset;
            } else {
            // unsupported line dash! do... nothing?
            }
        }
    }
    /**
   * @public
   *
   * @param {string} font
   */ setFont(font) {
        if (this.font !== font) {
            this.font = font;
            this.context.font = font;
        }
    }
    /**
   * @public
   *
   * @param {string} direction
   */ setDirection(direction) {
        if (this.direction !== direction) {
            this.direction = direction;
            this.context.direction = direction;
        }
    }
    /**
   * @param {HTMLCanvasElement} canvas
   * @param {CanvasRenderingContext2D} context
   */ constructor(canvas, context){
        // @public {HTMLCanvasElement}
        this.canvas = canvas;
        // @public {CanvasRenderingContext2D}
        this.context = context;
        this.resetStyles();
    }
};
scenery.register('CanvasContextWrapper', CanvasContextWrapper);
export default CanvasContextWrapper;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9DYW52YXNDb250ZXh0V3JhcHBlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuXG4vKipcbiAqIFdyYXBzIHRoZSBjb250ZXh0IGFuZCBjb250YWlucyBhIHJlZmVyZW5jZSB0byB0aGUgY2FudmFzLCBzbyB0aGF0IHdlIGNhbiBhYnNvcmIgdW5uZWNlc3Nhcnkgc3RhdGUgY2hhbmdlcyxcbiAqIGFuZCBwb3NzaWJseSBjb21iaW5lIGNlcnRhaW4gZmlsbCBvcGVyYXRpb25zLlxuICpcbiAqIFRPRE86IHBlcmZvcm1hbmNlIGFuYWx5c2lzLCBwb3NzaWJseSBheGUgdGhpcyBhbmQgdXNlIGRpcmVjdCBtb2RpZmljYXRpb24uIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCB7IGlzVFJlYWRPbmx5UHJvcGVydHkgfSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCB7IHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuY2xhc3MgQ2FudmFzQ29udGV4dFdyYXBwZXIge1xuICAvKipcbiAgICogQHBhcmFtIHtIVE1MQ2FudmFzRWxlbWVudH0gY2FudmFzXG4gICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjb250ZXh0XG4gICAqL1xuICBjb25zdHJ1Y3RvciggY2FudmFzLCBjb250ZXh0ICkge1xuXG4gICAgLy8gQHB1YmxpYyB7SFRNTENhbnZhc0VsZW1lbnR9XG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG5cbiAgICAvLyBAcHVibGljIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcblxuICAgIHRoaXMucmVzZXRTdHlsZXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgbG9jYWwgc3R5bGVzIHRvIHVuZGVmaW5lZCwgc28gdGhhdCB0aGV5IHdpbGwgYmUgaW52YWxpZGF0ZWQgbGF0ZXJcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgcmVzZXRTdHlsZXMoKSB7XG4gICAgdGhpcy5maWxsU3R5bGUgPSB1bmRlZmluZWQ7IC8vIG51bGxcbiAgICB0aGlzLnN0cm9rZVN0eWxlID0gdW5kZWZpbmVkOyAvLyBudWxsXG4gICAgdGhpcy5saW5lV2lkdGggPSB1bmRlZmluZWQ7IC8vIDFcbiAgICB0aGlzLmxpbmVDYXAgPSB1bmRlZmluZWQ7IC8vICdidXR0J1xuICAgIHRoaXMubGluZUpvaW4gPSB1bmRlZmluZWQ7IC8vICdtaXRlcidcbiAgICB0aGlzLmxpbmVEYXNoID0gdW5kZWZpbmVkOyAvLyBbXVxuICAgIHRoaXMubGluZURhc2hPZmZzZXQgPSB1bmRlZmluZWQ7IC8vIDBcbiAgICB0aGlzLm1pdGVyTGltaXQgPSB1bmRlZmluZWQ7IC8vIDEwXG5cbiAgICB0aGlzLmZvbnQgPSB1bmRlZmluZWQ7IC8vICcxMHB4IHNhbnMtc2VyaWYnXG4gICAgdGhpcy5kaXJlY3Rpb24gPSB1bmRlZmluZWQ7IC8vICdpbmhlcml0J1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgYSAocG9zc2libHkpIG5ldyB3aWR0aCBhbmQgaGVpZ2h0LCBhbmQgY2xlYXJzIHRoZSBjYW52YXMuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHRcbiAgICovXG4gIHNldERpbWVuc2lvbnMoIHdpZHRoLCBoZWlnaHQgKSB7XG5cbiAgICAvL0Rvbid0IGd1YXJkIGFnYWluc3Qgd2lkdGggYW5kIGhlaWdodCwgYmVjYXVzZSB3ZSBuZWVkIHRvIGNsZWFyIHRoZSBjYW52YXMuXG4gICAgLy9UT0RPOiBJcyBpdCBleHBlbnNpdmUgdG8gY2xlYXIgYnkgc2V0dGluZyBib3RoIHRoZSB3aWR0aCBhbmQgdGhlIGhlaWdodD8gIE1heWJlIHdlIGp1c3QgbmVlZCB0byBzZXQgdGhlIHdpZHRoIHRvIGNsZWFyIGl0LiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgLy8gYXNzdW1lIGFsbCBwZXJzaXN0ZW50IGRhdGEgY291bGQgaGF2ZSBjaGFuZ2VkXG4gICAgdGhpcy5yZXNldFN0eWxlcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd8Q29sb3J8UHJvcGVydHkuPHN0cmluZz59IHN0eWxlXG4gICAqL1xuICBzZXRGaWxsU3R5bGUoIHN0eWxlICkge1xuICAgIC8vIHR1cm4ge1Byb3BlcnR5fXMgaW50byB0aGVpciB2YWx1ZXMgd2hlbiBuZWNlc3NhcnlcbiAgICBpZiAoIHN0eWxlICYmIGlzVFJlYWRPbmx5UHJvcGVydHkoIHN0eWxlICkgKSB7XG4gICAgICBzdHlsZSA9IHN0eWxlLnZhbHVlO1xuICAgIH1cblxuICAgIC8vIHR1cm4ge0NvbG9yfXMgaW50byBzdHJpbmdzIHdoZW4gbmVjZXNzYXJ5XG4gICAgaWYgKCBzdHlsZSAmJiBzdHlsZS5nZXRDYW52YXNTdHlsZSApIHtcbiAgICAgIHN0eWxlID0gc3R5bGUuZ2V0Q2FudmFzU3R5bGUoKTtcbiAgICB9XG5cbiAgICBpZiAoIHRoaXMuZmlsbFN0eWxlICE9PSBzdHlsZSApIHtcbiAgICAgIHRoaXMuZmlsbFN0eWxlID0gc3R5bGU7XG5cbiAgICAgIC8vIGFsbG93IGdyYWRpZW50cyAvIHBhdHRlcm5zXG4gICAgICB0aGlzLmNvbnRleHQuZmlsbFN0eWxlID0gc3R5bGU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd8Q29sb3J8UHJvcGVydHkuPHN0cmluZz59IHN0eWxlXG4gICAqL1xuICBzZXRTdHJva2VTdHlsZSggc3R5bGUgKSB7XG4gICAgLy8gdHVybiB7UHJvcGVydHl9cyBpbnRvIHRoZWlyIHZhbHVlcyB3aGVuIG5lY2Vzc2FyeVxuICAgIGlmICggc3R5bGUgJiYgaXNUUmVhZE9ubHlQcm9wZXJ0eSggc3R5bGUgKSApIHtcbiAgICAgIHN0eWxlID0gc3R5bGUudmFsdWU7XG4gICAgfVxuXG4gICAgLy8gdHVybiB7Q29sb3J9cyBpbnRvIHN0cmluZ3Mgd2hlbiBuZWNlc3NhcnlcbiAgICBpZiAoIHN0eWxlICYmIHN0eWxlLmdldENhbnZhc1N0eWxlICkge1xuICAgICAgc3R5bGUgPSBzdHlsZS5nZXRDYW52YXNTdHlsZSgpO1xuICAgIH1cblxuICAgIGlmICggdGhpcy5zdHJva2VTdHlsZSAhPT0gc3R5bGUgKSB7XG4gICAgICB0aGlzLnN0cm9rZVN0eWxlID0gc3R5bGU7XG5cbiAgICAgIC8vIGFsbG93IGdyYWRpZW50cyAvIHBhdHRlcm5zXG4gICAgICB0aGlzLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBzdHlsZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcbiAgICovXG4gIHNldExpbmVXaWR0aCggd2lkdGggKSB7XG4gICAgaWYgKCB0aGlzLmxpbmVXaWR0aCAhPT0gd2lkdGggKSB7XG4gICAgICB0aGlzLmxpbmVXaWR0aCA9IHdpZHRoO1xuICAgICAgdGhpcy5jb250ZXh0LmxpbmVXaWR0aCA9IHdpZHRoO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjYXBcbiAgICovXG4gIHNldExpbmVDYXAoIGNhcCApIHtcbiAgICBpZiAoIHRoaXMubGluZUNhcCAhPT0gY2FwICkge1xuICAgICAgdGhpcy5saW5lQ2FwID0gY2FwO1xuICAgICAgdGhpcy5jb250ZXh0LmxpbmVDYXAgPSBjYXA7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGpvaW5cbiAgICovXG4gIHNldExpbmVKb2luKCBqb2luICkge1xuICAgIGlmICggdGhpcy5saW5lSm9pbiAhPT0gam9pbiApIHtcbiAgICAgIHRoaXMubGluZUpvaW4gPSBqb2luO1xuICAgICAgdGhpcy5jb250ZXh0LmxpbmVKb2luID0gam9pbjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gbWl0ZXJMaW1pdFxuICAgKi9cbiAgc2V0TWl0ZXJMaW1pdCggbWl0ZXJMaW1pdCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgbWl0ZXJMaW1pdCA9PT0gJ251bWJlcicgKTtcbiAgICBpZiAoIHRoaXMubWl0ZXJMaW1pdCAhPT0gbWl0ZXJMaW1pdCApIHtcbiAgICAgIHRoaXMubWl0ZXJMaW1pdCA9IG1pdGVyTGltaXQ7XG4gICAgICB0aGlzLmNvbnRleHQubWl0ZXJMaW1pdCA9IG1pdGVyTGltaXQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtBcnJheS48bnVtYmVyPnxudWxsfSBkYXNoXG4gICAqL1xuICBzZXRMaW5lRGFzaCggZGFzaCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkYXNoICE9PSB1bmRlZmluZWQsICd1bmRlZmluZWQgbGluZSBkYXNoIHdvdWxkIGNhdXNlIGhhcmQtdG8tdHJhY2UgZXJyb3JzJyApO1xuICAgIGlmICggdGhpcy5saW5lRGFzaCAhPT0gZGFzaCApIHtcbiAgICAgIHRoaXMubGluZURhc2ggPSBkYXNoO1xuICAgICAgaWYgKCB0aGlzLmNvbnRleHQuc2V0TGluZURhc2ggKSB7XG4gICAgICAgIHRoaXMuY29udGV4dC5zZXRMaW5lRGFzaCggZGFzaCA9PT0gbnVsbCA/IFtdIDogZGFzaCApOyAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzEwMSBmb3IgbnVsbCBsaW5lLWRhc2ggd29ya2Fyb3VuZFxuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIHRoaXMuY29udGV4dC5tb3pEYXNoICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIHRoaXMuY29udGV4dC5tb3pEYXNoID0gZGFzaDtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCB0aGlzLmNvbnRleHQud2Via2l0TGluZURhc2ggIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgdGhpcy5jb250ZXh0LndlYmtpdExpbmVEYXNoID0gZGFzaCA/IGRhc2ggOiBbXTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyB1bnN1cHBvcnRlZCBsaW5lIGRhc2ghIGRvLi4uIG5vdGhpbmc/XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxpbmVEYXNoT2Zmc2V0XG4gICAqL1xuICBzZXRMaW5lRGFzaE9mZnNldCggbGluZURhc2hPZmZzZXQgKSB7XG4gICAgaWYgKCB0aGlzLmxpbmVEYXNoT2Zmc2V0ICE9PSBsaW5lRGFzaE9mZnNldCApIHtcbiAgICAgIHRoaXMubGluZURhc2hPZmZzZXQgPSBsaW5lRGFzaE9mZnNldDtcbiAgICAgIGlmICggdGhpcy5jb250ZXh0LmxpbmVEYXNoT2Zmc2V0ICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIHRoaXMuY29udGV4dC5saW5lRGFzaE9mZnNldCA9IGxpbmVEYXNoT2Zmc2V0O1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIHRoaXMuY29udGV4dC53ZWJraXRMaW5lRGFzaE9mZnNldCAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICB0aGlzLmNvbnRleHQud2Via2l0TGluZURhc2hPZmZzZXQgPSBsaW5lRGFzaE9mZnNldDtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyB1bnN1cHBvcnRlZCBsaW5lIGRhc2ghIGRvLi4uIG5vdGhpbmc/XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZvbnRcbiAgICovXG4gIHNldEZvbnQoIGZvbnQgKSB7XG4gICAgaWYgKCB0aGlzLmZvbnQgIT09IGZvbnQgKSB7XG4gICAgICB0aGlzLmZvbnQgPSBmb250O1xuICAgICAgdGhpcy5jb250ZXh0LmZvbnQgPSBmb250O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBkaXJlY3Rpb25cbiAgICovXG4gIHNldERpcmVjdGlvbiggZGlyZWN0aW9uICkge1xuICAgIGlmICggdGhpcy5kaXJlY3Rpb24gIT09IGRpcmVjdGlvbiApIHtcbiAgICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICAgICAgdGhpcy5jb250ZXh0LmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICB9XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ0NhbnZhc0NvbnRleHRXcmFwcGVyJywgQ2FudmFzQ29udGV4dFdyYXBwZXIgKTtcbmV4cG9ydCBkZWZhdWx0IENhbnZhc0NvbnRleHRXcmFwcGVyOyJdLCJuYW1lcyI6WyJpc1RSZWFkT25seVByb3BlcnR5Iiwic2NlbmVyeSIsIkNhbnZhc0NvbnRleHRXcmFwcGVyIiwicmVzZXRTdHlsZXMiLCJmaWxsU3R5bGUiLCJ1bmRlZmluZWQiLCJzdHJva2VTdHlsZSIsImxpbmVXaWR0aCIsImxpbmVDYXAiLCJsaW5lSm9pbiIsImxpbmVEYXNoIiwibGluZURhc2hPZmZzZXQiLCJtaXRlckxpbWl0IiwiZm9udCIsImRpcmVjdGlvbiIsInNldERpbWVuc2lvbnMiLCJ3aWR0aCIsImhlaWdodCIsImNhbnZhcyIsInNldEZpbGxTdHlsZSIsInN0eWxlIiwidmFsdWUiLCJnZXRDYW52YXNTdHlsZSIsImNvbnRleHQiLCJzZXRTdHJva2VTdHlsZSIsInNldExpbmVXaWR0aCIsInNldExpbmVDYXAiLCJjYXAiLCJzZXRMaW5lSm9pbiIsImpvaW4iLCJzZXRNaXRlckxpbWl0IiwiYXNzZXJ0Iiwic2V0TGluZURhc2giLCJkYXNoIiwibW96RGFzaCIsIndlYmtpdExpbmVEYXNoIiwic2V0TGluZURhc2hPZmZzZXQiLCJ3ZWJraXRMaW5lRGFzaE9mZnNldCIsInNldEZvbnQiLCJzZXREaXJlY3Rpb24iLCJjb25zdHJ1Y3RvciIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFHdEQ7Ozs7Ozs7Q0FPQyxHQUVELFNBQVNBLG1CQUFtQixRQUFRLHdDQUF3QztBQUM1RSxTQUFTQyxPQUFPLFFBQVEsZ0JBQWdCO0FBRXhDLElBQUEsQUFBTUMsdUJBQU4sTUFBTUE7SUFnQko7OztHQUdDLEdBQ0RDLGNBQWM7UUFDWixJQUFJLENBQUNDLFNBQVMsR0FBR0MsV0FBVyxPQUFPO1FBQ25DLElBQUksQ0FBQ0MsV0FBVyxHQUFHRCxXQUFXLE9BQU87UUFDckMsSUFBSSxDQUFDRSxTQUFTLEdBQUdGLFdBQVcsSUFBSTtRQUNoQyxJQUFJLENBQUNHLE9BQU8sR0FBR0gsV0FBVyxTQUFTO1FBQ25DLElBQUksQ0FBQ0ksUUFBUSxHQUFHSixXQUFXLFVBQVU7UUFDckMsSUFBSSxDQUFDSyxRQUFRLEdBQUdMLFdBQVcsS0FBSztRQUNoQyxJQUFJLENBQUNNLGNBQWMsR0FBR04sV0FBVyxJQUFJO1FBQ3JDLElBQUksQ0FBQ08sVUFBVSxHQUFHUCxXQUFXLEtBQUs7UUFFbEMsSUFBSSxDQUFDUSxJQUFJLEdBQUdSLFdBQVcsb0JBQW9CO1FBQzNDLElBQUksQ0FBQ1MsU0FBUyxHQUFHVCxXQUFXLFlBQVk7SUFDMUM7SUFFQTs7Ozs7O0dBTUMsR0FDRFUsY0FBZUMsS0FBSyxFQUFFQyxNQUFN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