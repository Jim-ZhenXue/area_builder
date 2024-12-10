// Copyright 2016-2021, University of Colorado Boulder
/**
 * Handles SVG <defs> and fill/stroke style for SVG elements (by composition, not a trait or for inheritance).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { scenery } from '../imports.js';
let PaintSVGState = class PaintSVGState {
    /**
   * Initializes the state
   * @public
   */ initialize() {
        // @public {SVGBlock|null}
        this.svgBlock = null;
        // @public {string} fill/stroke style fragments that are currently used
        this.fillStyle = 'none';
        this.strokeStyle = 'none';
        // @public {PaintDef} - current reference-counted fill/stroke paints (gradients and fills) that will need to be
        // released on changes or disposal
        this.fillPaint = null;
        this.strokePaint = null;
        // these are used by the actual SVG element
        this.updateBaseStyle(); // the main style CSS
        this.strokeDetailStyle = ''; // width/dash/cap/join CSS
    }
    /**
   * Disposes the PaintSVGState, releasing listeners as needed.
   * @public
   */ dispose() {
        // be cautious, release references
        this.releaseFillPaint();
        this.releaseStrokePaint();
    }
    /**
   * @private
   */ releaseFillPaint() {
        if (this.fillPaint) {
            this.svgBlock.decrementPaint(this.fillPaint);
            this.fillPaint = null;
        }
    }
    /**
   * @private
   */ releaseStrokePaint() {
        if (this.strokePaint) {
            this.svgBlock.decrementPaint(this.strokePaint);
            this.strokePaint = null;
        }
    }
    /**
   * Called when the fill needs to be updated, with the latest defs SVG block
   * @public
   *
   * @param {SVGBlock} svgBlock
   * @param {null|string|Color|LinearGradient|RadialGradient|Pattern} fill
   */ updateFill(svgBlock, fill) {
        assert && assert(this.svgBlock === svgBlock);
        // NOTE: If fill.isPaint === true, this should be different if we switched to a different SVG block.
        const fillStyle = paintToSVGStyle(fill, svgBlock);
        // If our fill paint reference changed
        if (fill !== this.fillPaint) {
            // release the old reference
            this.releaseFillPaint();
            // only store a new reference if our new fill is a paint
            if (fill && fill.isPaint) {
                this.fillPaint = fill;
                svgBlock.incrementPaint(fill);
            }
        }
        // If we need to update the SVG style of our fill
        if (fillStyle !== this.fillStyle) {
            this.fillStyle = fillStyle;
            this.updateBaseStyle();
        }
    }
    /**
   * Called when the stroke needs to be updated, with the latest defs SVG block
   * @public
   *
   * @param {SVGBlock} svgBlock
   * @param {null|string|Color|LinearGradient|RadialGradient|Pattern} fill
   */ updateStroke(svgBlock, stroke) {
        assert && assert(this.svgBlock === svgBlock);
        // NOTE: If stroke.isPaint === true, this should be different if we switched to a different SVG block.
        const strokeStyle = paintToSVGStyle(stroke, svgBlock);
        // If our stroke paint reference changed
        if (stroke !== this.strokePaint) {
            // release the old reference
            this.releaseStrokePaint();
            // only store a new reference if our new stroke is a paint
            if (stroke && stroke.isPaint) {
                this.strokePaint = stroke;
                svgBlock.incrementPaint(stroke);
            }
        }
        // If we need to update the SVG style of our stroke
        if (strokeStyle !== this.strokeStyle) {
            this.strokeStyle = strokeStyle;
            this.updateBaseStyle();
        }
    }
    /**
   * @private
   */ updateBaseStyle() {
        this.baseStyle = `fill: ${this.fillStyle}; stroke: ${this.strokeStyle};`;
    }
    /**
   * @private
   *
   * @param {Node} node
   */ updateStrokeDetailStyle(node) {
        let strokeDetailStyle = '';
        const lineWidth = node.getLineWidth();
        if (lineWidth !== 1) {
            strokeDetailStyle += `stroke-width: ${lineWidth};`;
        }
        const lineCap = node.getLineCap();
        if (lineCap !== 'butt') {
            strokeDetailStyle += `stroke-linecap: ${lineCap};`;
        }
        const lineJoin = node.getLineJoin();
        if (lineJoin !== 'miter') {
            strokeDetailStyle += `stroke-linejoin: ${lineJoin};`;
        }
        const miterLimit = node.getMiterLimit();
        strokeDetailStyle += `stroke-miterlimit: ${miterLimit};`;
        if (node.hasLineDash()) {
            strokeDetailStyle += `stroke-dasharray: ${node.getLineDash().join(',')};`;
            strokeDetailStyle += `stroke-dashoffset: ${node.getLineDashOffset()};`;
        }
        this.strokeDetailStyle = strokeDetailStyle;
    }
    /**
   * Called when the defs SVG block is switched (our SVG element was moved to another SVG top-level context)
   * @public
   *
   * @param {SVGBlock} svgBlock
   */ updateSVGBlock(svgBlock) {
        // remove paints from the old svgBlock
        const oldSvgBlock = this.svgBlock;
        if (oldSvgBlock) {
            if (this.fillPaint) {
                oldSvgBlock.decrementPaint(this.fillPaint);
            }
            if (this.strokePaint) {
                oldSvgBlock.decrementPaint(this.strokePaint);
            }
        }
        this.svgBlock = svgBlock;
        // add paints to the new svgBlock
        if (this.fillPaint) {
            svgBlock.incrementPaint(this.fillPaint);
        }
        if (this.strokePaint) {
            svgBlock.incrementPaint(this.strokePaint);
        }
    }
    constructor(){
        this.initialize();
    }
};
/**
 * Returns the SVG style string used to represent a paint.
 *
 * @param {null|string|Color|LinearGradient|RadialGradient|Pattern} paint
 * @param {SVGBlock} svgBlock
 */ function paintToSVGStyle(paint, svgBlock) {
    if (!paint) {
        // no paint
        return 'none';
    } else if (paint.toCSS) {
        // Color object paint
        return paint.toCSS();
    } else if (paint.isPaint) {
        // reference the SVG definition with a URL
        return `url(#${paint.id}-${svgBlock ? svgBlock.id : 'noblock'})`;
    } else {
        // plain CSS color
        return paint;
    }
}
scenery.register('PaintSVGState', PaintSVGState);
export default PaintSVGState;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9QYWludFNWR1N0YXRlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEhhbmRsZXMgU1ZHIDxkZWZzPiBhbmQgZmlsbC9zdHJva2Ugc3R5bGUgZm9yIFNWRyBlbGVtZW50cyAoYnkgY29tcG9zaXRpb24sIG5vdCBhIHRyYWl0IG9yIGZvciBpbmhlcml0YW5jZSkuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCB7IHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuY2xhc3MgUGFpbnRTVkdTdGF0ZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBzdGF0ZVxuICAgKiBAcHVibGljXG4gICAqL1xuICBpbml0aWFsaXplKCkge1xuICAgIC8vIEBwdWJsaWMge1NWR0Jsb2NrfG51bGx9XG4gICAgdGhpcy5zdmdCbG9jayA9IG51bGw7XG5cbiAgICAvLyBAcHVibGljIHtzdHJpbmd9IGZpbGwvc3Ryb2tlIHN0eWxlIGZyYWdtZW50cyB0aGF0IGFyZSBjdXJyZW50bHkgdXNlZFxuICAgIHRoaXMuZmlsbFN0eWxlID0gJ25vbmUnO1xuICAgIHRoaXMuc3Ryb2tlU3R5bGUgPSAnbm9uZSc7XG5cbiAgICAvLyBAcHVibGljIHtQYWludERlZn0gLSBjdXJyZW50IHJlZmVyZW5jZS1jb3VudGVkIGZpbGwvc3Ryb2tlIHBhaW50cyAoZ3JhZGllbnRzIGFuZCBmaWxscykgdGhhdCB3aWxsIG5lZWQgdG8gYmVcbiAgICAvLyByZWxlYXNlZCBvbiBjaGFuZ2VzIG9yIGRpc3Bvc2FsXG4gICAgdGhpcy5maWxsUGFpbnQgPSBudWxsO1xuICAgIHRoaXMuc3Ryb2tlUGFpbnQgPSBudWxsO1xuXG4gICAgLy8gdGhlc2UgYXJlIHVzZWQgYnkgdGhlIGFjdHVhbCBTVkcgZWxlbWVudFxuICAgIHRoaXMudXBkYXRlQmFzZVN0eWxlKCk7IC8vIHRoZSBtYWluIHN0eWxlIENTU1xuICAgIHRoaXMuc3Ryb2tlRGV0YWlsU3R5bGUgPSAnJzsgLy8gd2lkdGgvZGFzaC9jYXAvam9pbiBDU1NcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwb3NlcyB0aGUgUGFpbnRTVkdTdGF0ZSwgcmVsZWFzaW5nIGxpc3RlbmVycyBhcyBuZWVkZWQuXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgLy8gYmUgY2F1dGlvdXMsIHJlbGVhc2UgcmVmZXJlbmNlc1xuICAgIHRoaXMucmVsZWFzZUZpbGxQYWludCgpO1xuICAgIHRoaXMucmVsZWFzZVN0cm9rZVBhaW50KCk7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHJlbGVhc2VGaWxsUGFpbnQoKSB7XG4gICAgaWYgKCB0aGlzLmZpbGxQYWludCApIHtcbiAgICAgIHRoaXMuc3ZnQmxvY2suZGVjcmVtZW50UGFpbnQoIHRoaXMuZmlsbFBhaW50ICk7XG4gICAgICB0aGlzLmZpbGxQYWludCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICByZWxlYXNlU3Ryb2tlUGFpbnQoKSB7XG4gICAgaWYgKCB0aGlzLnN0cm9rZVBhaW50ICkge1xuICAgICAgdGhpcy5zdmdCbG9jay5kZWNyZW1lbnRQYWludCggdGhpcy5zdHJva2VQYWludCApO1xuICAgICAgdGhpcy5zdHJva2VQYWludCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBmaWxsIG5lZWRzIHRvIGJlIHVwZGF0ZWQsIHdpdGggdGhlIGxhdGVzdCBkZWZzIFNWRyBibG9ja1xuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7U1ZHQmxvY2t9IHN2Z0Jsb2NrXG4gICAqIEBwYXJhbSB7bnVsbHxzdHJpbmd8Q29sb3J8TGluZWFyR3JhZGllbnR8UmFkaWFsR3JhZGllbnR8UGF0dGVybn0gZmlsbFxuICAgKi9cbiAgdXBkYXRlRmlsbCggc3ZnQmxvY2ssIGZpbGwgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5zdmdCbG9jayA9PT0gc3ZnQmxvY2sgKTtcblxuICAgIC8vIE5PVEU6IElmIGZpbGwuaXNQYWludCA9PT0gdHJ1ZSwgdGhpcyBzaG91bGQgYmUgZGlmZmVyZW50IGlmIHdlIHN3aXRjaGVkIHRvIGEgZGlmZmVyZW50IFNWRyBibG9jay5cbiAgICBjb25zdCBmaWxsU3R5bGUgPSBwYWludFRvU1ZHU3R5bGUoIGZpbGwsIHN2Z0Jsb2NrICk7XG5cbiAgICAvLyBJZiBvdXIgZmlsbCBwYWludCByZWZlcmVuY2UgY2hhbmdlZFxuICAgIGlmICggZmlsbCAhPT0gdGhpcy5maWxsUGFpbnQgKSB7XG4gICAgICAvLyByZWxlYXNlIHRoZSBvbGQgcmVmZXJlbmNlXG4gICAgICB0aGlzLnJlbGVhc2VGaWxsUGFpbnQoKTtcblxuICAgICAgLy8gb25seSBzdG9yZSBhIG5ldyByZWZlcmVuY2UgaWYgb3VyIG5ldyBmaWxsIGlzIGEgcGFpbnRcbiAgICAgIGlmICggZmlsbCAmJiBmaWxsLmlzUGFpbnQgKSB7XG4gICAgICAgIHRoaXMuZmlsbFBhaW50ID0gZmlsbDtcbiAgICAgICAgc3ZnQmxvY2suaW5jcmVtZW50UGFpbnQoIGZpbGwgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBuZWVkIHRvIHVwZGF0ZSB0aGUgU1ZHIHN0eWxlIG9mIG91ciBmaWxsXG4gICAgaWYgKCBmaWxsU3R5bGUgIT09IHRoaXMuZmlsbFN0eWxlICkge1xuICAgICAgdGhpcy5maWxsU3R5bGUgPSBmaWxsU3R5bGU7XG4gICAgICB0aGlzLnVwZGF0ZUJhc2VTdHlsZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgc3Ryb2tlIG5lZWRzIHRvIGJlIHVwZGF0ZWQsIHdpdGggdGhlIGxhdGVzdCBkZWZzIFNWRyBibG9ja1xuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7U1ZHQmxvY2t9IHN2Z0Jsb2NrXG4gICAqIEBwYXJhbSB7bnVsbHxzdHJpbmd8Q29sb3J8TGluZWFyR3JhZGllbnR8UmFkaWFsR3JhZGllbnR8UGF0dGVybn0gZmlsbFxuICAgKi9cbiAgdXBkYXRlU3Ryb2tlKCBzdmdCbG9jaywgc3Ryb2tlICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuc3ZnQmxvY2sgPT09IHN2Z0Jsb2NrICk7XG5cbiAgICAvLyBOT1RFOiBJZiBzdHJva2UuaXNQYWludCA9PT0gdHJ1ZSwgdGhpcyBzaG91bGQgYmUgZGlmZmVyZW50IGlmIHdlIHN3aXRjaGVkIHRvIGEgZGlmZmVyZW50IFNWRyBibG9jay5cbiAgICBjb25zdCBzdHJva2VTdHlsZSA9IHBhaW50VG9TVkdTdHlsZSggc3Ryb2tlLCBzdmdCbG9jayApO1xuXG4gICAgLy8gSWYgb3VyIHN0cm9rZSBwYWludCByZWZlcmVuY2UgY2hhbmdlZFxuICAgIGlmICggc3Ryb2tlICE9PSB0aGlzLnN0cm9rZVBhaW50ICkge1xuICAgICAgLy8gcmVsZWFzZSB0aGUgb2xkIHJlZmVyZW5jZVxuICAgICAgdGhpcy5yZWxlYXNlU3Ryb2tlUGFpbnQoKTtcblxuICAgICAgLy8gb25seSBzdG9yZSBhIG5ldyByZWZlcmVuY2UgaWYgb3VyIG5ldyBzdHJva2UgaXMgYSBwYWludFxuICAgICAgaWYgKCBzdHJva2UgJiYgc3Ryb2tlLmlzUGFpbnQgKSB7XG4gICAgICAgIHRoaXMuc3Ryb2tlUGFpbnQgPSBzdHJva2U7XG4gICAgICAgIHN2Z0Jsb2NrLmluY3JlbWVudFBhaW50KCBzdHJva2UgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBuZWVkIHRvIHVwZGF0ZSB0aGUgU1ZHIHN0eWxlIG9mIG91ciBzdHJva2VcbiAgICBpZiAoIHN0cm9rZVN0eWxlICE9PSB0aGlzLnN0cm9rZVN0eWxlICkge1xuICAgICAgdGhpcy5zdHJva2VTdHlsZSA9IHN0cm9rZVN0eWxlO1xuICAgICAgdGhpcy51cGRhdGVCYXNlU3R5bGUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZUJhc2VTdHlsZSgpIHtcbiAgICB0aGlzLmJhc2VTdHlsZSA9IGBmaWxsOiAke3RoaXMuZmlsbFN0eWxlfTsgc3Ryb2tlOiAke3RoaXMuc3Ryb2tlU3R5bGV9O2A7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfSBub2RlXG4gICAqL1xuICB1cGRhdGVTdHJva2VEZXRhaWxTdHlsZSggbm9kZSApIHtcbiAgICBsZXQgc3Ryb2tlRGV0YWlsU3R5bGUgPSAnJztcblxuICAgIGNvbnN0IGxpbmVXaWR0aCA9IG5vZGUuZ2V0TGluZVdpZHRoKCk7XG4gICAgaWYgKCBsaW5lV2lkdGggIT09IDEgKSB7XG4gICAgICBzdHJva2VEZXRhaWxTdHlsZSArPSBgc3Ryb2tlLXdpZHRoOiAke2xpbmVXaWR0aH07YDtcbiAgICB9XG5cbiAgICBjb25zdCBsaW5lQ2FwID0gbm9kZS5nZXRMaW5lQ2FwKCk7XG4gICAgaWYgKCBsaW5lQ2FwICE9PSAnYnV0dCcgKSB7XG4gICAgICBzdHJva2VEZXRhaWxTdHlsZSArPSBgc3Ryb2tlLWxpbmVjYXA6ICR7bGluZUNhcH07YDtcbiAgICB9XG5cbiAgICBjb25zdCBsaW5lSm9pbiA9IG5vZGUuZ2V0TGluZUpvaW4oKTtcbiAgICBpZiAoIGxpbmVKb2luICE9PSAnbWl0ZXInICkge1xuICAgICAgc3Ryb2tlRGV0YWlsU3R5bGUgKz0gYHN0cm9rZS1saW5lam9pbjogJHtsaW5lSm9pbn07YDtcbiAgICB9XG5cbiAgICBjb25zdCBtaXRlckxpbWl0ID0gbm9kZS5nZXRNaXRlckxpbWl0KCk7XG4gICAgc3Ryb2tlRGV0YWlsU3R5bGUgKz0gYHN0cm9rZS1taXRlcmxpbWl0OiAke21pdGVyTGltaXR9O2A7XG5cbiAgICBpZiAoIG5vZGUuaGFzTGluZURhc2goKSApIHtcbiAgICAgIHN0cm9rZURldGFpbFN0eWxlICs9IGBzdHJva2UtZGFzaGFycmF5OiAke25vZGUuZ2V0TGluZURhc2goKS5qb2luKCAnLCcgKX07YDtcbiAgICAgIHN0cm9rZURldGFpbFN0eWxlICs9IGBzdHJva2UtZGFzaG9mZnNldDogJHtub2RlLmdldExpbmVEYXNoT2Zmc2V0KCl9O2A7XG4gICAgfVxuXG4gICAgdGhpcy5zdHJva2VEZXRhaWxTdHlsZSA9IHN0cm9rZURldGFpbFN0eWxlO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBkZWZzIFNWRyBibG9jayBpcyBzd2l0Y2hlZCAob3VyIFNWRyBlbGVtZW50IHdhcyBtb3ZlZCB0byBhbm90aGVyIFNWRyB0b3AtbGV2ZWwgY29udGV4dClcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1NWR0Jsb2NrfSBzdmdCbG9ja1xuICAgKi9cbiAgdXBkYXRlU1ZHQmxvY2soIHN2Z0Jsb2NrICkge1xuICAgIC8vIHJlbW92ZSBwYWludHMgZnJvbSB0aGUgb2xkIHN2Z0Jsb2NrXG4gICAgY29uc3Qgb2xkU3ZnQmxvY2sgPSB0aGlzLnN2Z0Jsb2NrO1xuICAgIGlmICggb2xkU3ZnQmxvY2sgKSB7XG4gICAgICBpZiAoIHRoaXMuZmlsbFBhaW50ICkge1xuICAgICAgICBvbGRTdmdCbG9jay5kZWNyZW1lbnRQYWludCggdGhpcy5maWxsUGFpbnQgKTtcbiAgICAgIH1cbiAgICAgIGlmICggdGhpcy5zdHJva2VQYWludCApIHtcbiAgICAgICAgb2xkU3ZnQmxvY2suZGVjcmVtZW50UGFpbnQoIHRoaXMuc3Ryb2tlUGFpbnQgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnN2Z0Jsb2NrID0gc3ZnQmxvY2s7XG5cbiAgICAvLyBhZGQgcGFpbnRzIHRvIHRoZSBuZXcgc3ZnQmxvY2tcbiAgICBpZiAoIHRoaXMuZmlsbFBhaW50ICkge1xuICAgICAgc3ZnQmxvY2suaW5jcmVtZW50UGFpbnQoIHRoaXMuZmlsbFBhaW50ICk7XG4gICAgfVxuICAgIGlmICggdGhpcy5zdHJva2VQYWludCApIHtcbiAgICAgIHN2Z0Jsb2NrLmluY3JlbWVudFBhaW50KCB0aGlzLnN0cm9rZVBhaW50ICk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgU1ZHIHN0eWxlIHN0cmluZyB1c2VkIHRvIHJlcHJlc2VudCBhIHBhaW50LlxuICpcbiAqIEBwYXJhbSB7bnVsbHxzdHJpbmd8Q29sb3J8TGluZWFyR3JhZGllbnR8UmFkaWFsR3JhZGllbnR8UGF0dGVybn0gcGFpbnRcbiAqIEBwYXJhbSB7U1ZHQmxvY2t9IHN2Z0Jsb2NrXG4gKi9cbmZ1bmN0aW9uIHBhaW50VG9TVkdTdHlsZSggcGFpbnQsIHN2Z0Jsb2NrICkge1xuICBpZiAoICFwYWludCApIHtcbiAgICAvLyBubyBwYWludFxuICAgIHJldHVybiAnbm9uZSc7XG4gIH1cbiAgZWxzZSBpZiAoIHBhaW50LnRvQ1NTICkge1xuICAgIC8vIENvbG9yIG9iamVjdCBwYWludFxuICAgIHJldHVybiBwYWludC50b0NTUygpO1xuICB9XG4gIGVsc2UgaWYgKCBwYWludC5pc1BhaW50ICkge1xuICAgIC8vIHJlZmVyZW5jZSB0aGUgU1ZHIGRlZmluaXRpb24gd2l0aCBhIFVSTFxuICAgIHJldHVybiBgdXJsKCMke3BhaW50LmlkfS0ke3N2Z0Jsb2NrID8gc3ZnQmxvY2suaWQgOiAnbm9ibG9jayd9KWA7XG4gIH1cbiAgZWxzZSB7XG4gICAgLy8gcGxhaW4gQ1NTIGNvbG9yXG4gICAgcmV0dXJuIHBhaW50O1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdQYWludFNWR1N0YXRlJywgUGFpbnRTVkdTdGF0ZSApO1xuXG5leHBvcnQgZGVmYXVsdCBQYWludFNWR1N0YXRlOyJdLCJuYW1lcyI6WyJzY2VuZXJ5IiwiUGFpbnRTVkdTdGF0ZSIsImluaXRpYWxpemUiLCJzdmdCbG9jayIsImZpbGxTdHlsZSIsInN0cm9rZVN0eWxlIiwiZmlsbFBhaW50Iiwic3Ryb2tlUGFpbnQiLCJ1cGRhdGVCYXNlU3R5bGUiLCJzdHJva2VEZXRhaWxTdHlsZSIsImRpc3Bvc2UiLCJyZWxlYXNlRmlsbFBhaW50IiwicmVsZWFzZVN0cm9rZVBhaW50IiwiZGVjcmVtZW50UGFpbnQiLCJ1cGRhdGVGaWxsIiwiZmlsbCIsImFzc2VydCIsInBhaW50VG9TVkdTdHlsZSIsImlzUGFpbnQiLCJpbmNyZW1lbnRQYWludCIsInVwZGF0ZVN0cm9rZSIsInN0cm9rZSIsImJhc2VTdHlsZSIsInVwZGF0ZVN0cm9rZURldGFpbFN0eWxlIiwibm9kZSIsImxpbmVXaWR0aCIsImdldExpbmVXaWR0aCIsImxpbmVDYXAiLCJnZXRMaW5lQ2FwIiwibGluZUpvaW4iLCJnZXRMaW5lSm9pbiIsIm1pdGVyTGltaXQiLCJnZXRNaXRlckxpbWl0IiwiaGFzTGluZURhc2giLCJnZXRMaW5lRGFzaCIsImpvaW4iLCJnZXRMaW5lRGFzaE9mZnNldCIsInVwZGF0ZVNWR0Jsb2NrIiwib2xkU3ZnQmxvY2siLCJjb25zdHJ1Y3RvciIsInBhaW50IiwidG9DU1MiLCJpZCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELFNBQVNBLE9BQU8sUUFBUSxnQkFBZ0I7QUFFeEMsSUFBQSxBQUFNQyxnQkFBTixNQUFNQTtJQUtKOzs7R0FHQyxHQUNEQyxhQUFhO1FBQ1gsMEJBQTBCO1FBQzFCLElBQUksQ0FBQ0MsUUFBUSxHQUFHO1FBRWhCLHVFQUF1RTtRQUN2RSxJQUFJLENBQUNDLFNBQVMsR0FBRztRQUNqQixJQUFJLENBQUNDLFdBQVcsR0FBRztRQUVuQiwrR0FBK0c7UUFDL0csa0NBQWtDO1FBQ2xDLElBQUksQ0FBQ0MsU0FBUyxHQUFHO1FBQ2pCLElBQUksQ0FBQ0MsV0FBVyxHQUFHO1FBRW5CLDJDQUEyQztRQUMz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