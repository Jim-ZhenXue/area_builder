// Copyright 2023-2024, University of Colorado Boulder
/**
 * A leaf (text) element in the RichText, which will display a snippet of Text.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Pool from '../../../../phet-core/js/Pool.js';
import { RichText, RichTextCleanable, RichTextUtils, scenery, Text } from '../../imports.js';
let RichTextLeaf = class RichTextLeaf extends RichTextCleanable(Text) {
    initialize(content, isLTR, font, boundsMethod, fill, stroke, lineWidth) {
        // Grab all spaces at the (logical) start
        let whitespaceBefore = '';
        while(content.startsWith(' ')){
            whitespaceBefore += ' ';
            content = content.slice(1);
        }
        // Grab all spaces at the (logical) end
        let whitespaceAfter = '';
        while(content.endsWith(' ')){
            whitespaceAfter = ' ';
            content = content.slice(0, content.length - 1);
        }
        this.string = RichText.contentToString(content, isLTR);
        this.boundsMethod = boundsMethod;
        this.font = font;
        this.fill = fill;
        this.stroke = stroke;
        this.lineWidth = lineWidth;
        const spacingBefore = whitespaceBefore.length ? RichTextUtils.scratchText.setString(whitespaceBefore).setFont(font).width : 0;
        const spacingAfter = whitespaceAfter.length ? RichTextUtils.scratchText.setString(whitespaceAfter).setFont(font).width : 0;
        // Turn logical spacing into directional
        this.leftSpacing = isLTR ? spacingBefore : spacingAfter;
        this.rightSpacing = isLTR ? spacingAfter : spacingBefore;
        return this;
    }
    /**
   * Cleans references that could cause memory leaks (as those things may contain other references).
   */ clean() {
        super.clean();
        this.fill = null;
        this.stroke = null;
    }
    /**
   * Whether this leaf will fit in the specified amount of space (including, if required, the amount of spacing on
   * the side).
   */ fitsIn(widthAvailable, hasAddedLeafToLine, isContainerLTR) {
        return this.width + (hasAddedLeafToLine ? isContainerLTR ? this.leftSpacing : this.rightSpacing : 0) <= widthAvailable;
    }
    freeToPool() {
        RichTextLeaf.pool.freeToPool(this);
    }
    constructor(content, isLTR, font, boundsMethod, fill, stroke, lineWidth){
        super('');
        this.initialize(content, isLTR, font, boundsMethod, fill, stroke, lineWidth);
    }
};
RichTextLeaf.pool = new Pool(RichTextLeaf);
export { RichTextLeaf as default };
scenery.register('RichTextLeaf', RichTextLeaf);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9yaWNoLXRleHQvUmljaFRleHRMZWFmLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgbGVhZiAodGV4dCkgZWxlbWVudCBpbiB0aGUgUmljaFRleHQsIHdoaWNoIHdpbGwgZGlzcGxheSBhIHNuaXBwZXQgb2YgVGV4dC5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cbmltcG9ydCBQb29sLCB7IFRQb29sYWJsZSB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9Qb29sLmpzJztcbmltcG9ydCB7IEZvbnQsIFJpY2hUZXh0LCBSaWNoVGV4dENsZWFuYWJsZSwgUmljaFRleHRVdGlscywgc2NlbmVyeSwgVGV4dCwgVGV4dEJvdW5kc01ldGhvZCwgVFBhaW50IH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJpY2hUZXh0TGVhZiBleHRlbmRzIFJpY2hUZXh0Q2xlYW5hYmxlKCBUZXh0ICkgaW1wbGVtZW50cyBUUG9vbGFibGUge1xuXG4gIHB1YmxpYyBsZWZ0U3BhY2luZyE6IG51bWJlcjtcbiAgcHVibGljIHJpZ2h0U3BhY2luZyE6IG51bWJlcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGNvbnRlbnQ6IHN0cmluZywgaXNMVFI6IGJvb2xlYW4sIGZvbnQ6IEZvbnQgfCBzdHJpbmcsIGJvdW5kc01ldGhvZDogVGV4dEJvdW5kc01ldGhvZCwgZmlsbDogVFBhaW50LCBzdHJva2U6IFRQYWludCwgbGluZVdpZHRoOiBudW1iZXIgKSB7XG4gICAgc3VwZXIoICcnICk7XG5cbiAgICB0aGlzLmluaXRpYWxpemUoIGNvbnRlbnQsIGlzTFRSLCBmb250LCBib3VuZHNNZXRob2QsIGZpbGwsIHN0cm9rZSwgbGluZVdpZHRoICk7XG4gIH1cblxuICBwdWJsaWMgaW5pdGlhbGl6ZSggY29udGVudDogc3RyaW5nLCBpc0xUUjogYm9vbGVhbiwgZm9udDogRm9udCB8IHN0cmluZywgYm91bmRzTWV0aG9kOiBUZXh0Qm91bmRzTWV0aG9kLCBmaWxsOiBUUGFpbnQsIHN0cm9rZTogVFBhaW50LCBsaW5lV2lkdGg6IG51bWJlciApOiB0aGlzIHtcblxuICAgIC8vIEdyYWIgYWxsIHNwYWNlcyBhdCB0aGUgKGxvZ2ljYWwpIHN0YXJ0XG4gICAgbGV0IHdoaXRlc3BhY2VCZWZvcmUgPSAnJztcbiAgICB3aGlsZSAoIGNvbnRlbnQuc3RhcnRzV2l0aCggJyAnICkgKSB7XG4gICAgICB3aGl0ZXNwYWNlQmVmb3JlICs9ICcgJztcbiAgICAgIGNvbnRlbnQgPSBjb250ZW50LnNsaWNlKCAxICk7XG4gICAgfVxuXG4gICAgLy8gR3JhYiBhbGwgc3BhY2VzIGF0IHRoZSAobG9naWNhbCkgZW5kXG4gICAgbGV0IHdoaXRlc3BhY2VBZnRlciA9ICcnO1xuICAgIHdoaWxlICggY29udGVudC5lbmRzV2l0aCggJyAnICkgKSB7XG4gICAgICB3aGl0ZXNwYWNlQWZ0ZXIgPSAnICc7XG4gICAgICBjb250ZW50ID0gY29udGVudC5zbGljZSggMCwgY29udGVudC5sZW5ndGggLSAxICk7XG4gICAgfVxuXG4gICAgdGhpcy5zdHJpbmcgPSBSaWNoVGV4dC5jb250ZW50VG9TdHJpbmcoIGNvbnRlbnQsIGlzTFRSICk7XG4gICAgdGhpcy5ib3VuZHNNZXRob2QgPSBib3VuZHNNZXRob2Q7XG4gICAgdGhpcy5mb250ID0gZm9udDtcbiAgICB0aGlzLmZpbGwgPSBmaWxsO1xuICAgIHRoaXMuc3Ryb2tlID0gc3Ryb2tlO1xuICAgIHRoaXMubGluZVdpZHRoID0gbGluZVdpZHRoO1xuXG4gICAgY29uc3Qgc3BhY2luZ0JlZm9yZSA9IHdoaXRlc3BhY2VCZWZvcmUubGVuZ3RoID8gUmljaFRleHRVdGlscy5zY3JhdGNoVGV4dC5zZXRTdHJpbmcoIHdoaXRlc3BhY2VCZWZvcmUgKS5zZXRGb250KCBmb250ICkud2lkdGggOiAwO1xuICAgIGNvbnN0IHNwYWNpbmdBZnRlciA9IHdoaXRlc3BhY2VBZnRlci5sZW5ndGggPyBSaWNoVGV4dFV0aWxzLnNjcmF0Y2hUZXh0LnNldFN0cmluZyggd2hpdGVzcGFjZUFmdGVyICkuc2V0Rm9udCggZm9udCApLndpZHRoIDogMDtcblxuICAgIC8vIFR1cm4gbG9naWNhbCBzcGFjaW5nIGludG8gZGlyZWN0aW9uYWxcbiAgICB0aGlzLmxlZnRTcGFjaW5nID0gaXNMVFIgPyBzcGFjaW5nQmVmb3JlIDogc3BhY2luZ0FmdGVyO1xuICAgIHRoaXMucmlnaHRTcGFjaW5nID0gaXNMVFIgPyBzcGFjaW5nQWZ0ZXIgOiBzcGFjaW5nQmVmb3JlO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYW5zIHJlZmVyZW5jZXMgdGhhdCBjb3VsZCBjYXVzZSBtZW1vcnkgbGVha3MgKGFzIHRob3NlIHRoaW5ncyBtYXkgY29udGFpbiBvdGhlciByZWZlcmVuY2VzKS5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBjbGVhbigpOiB2b2lkIHtcbiAgICBzdXBlci5jbGVhbigpO1xuXG4gICAgdGhpcy5maWxsID0gbnVsbDtcbiAgICB0aGlzLnN0cm9rZSA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGlzIGxlYWYgd2lsbCBmaXQgaW4gdGhlIHNwZWNpZmllZCBhbW91bnQgb2Ygc3BhY2UgKGluY2x1ZGluZywgaWYgcmVxdWlyZWQsIHRoZSBhbW91bnQgb2Ygc3BhY2luZyBvblxuICAgKiB0aGUgc2lkZSkuXG4gICAqL1xuICBwdWJsaWMgZml0c0luKCB3aWR0aEF2YWlsYWJsZTogbnVtYmVyLCBoYXNBZGRlZExlYWZUb0xpbmU6IGJvb2xlYW4sIGlzQ29udGFpbmVyTFRSOiBib29sZWFuICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLndpZHRoICsgKCBoYXNBZGRlZExlYWZUb0xpbmUgPyAoIGlzQ29udGFpbmVyTFRSID8gdGhpcy5sZWZ0U3BhY2luZyA6IHRoaXMucmlnaHRTcGFjaW5nICkgOiAwICkgPD0gd2lkdGhBdmFpbGFibGU7XG4gIH1cblxuICBwdWJsaWMgZnJlZVRvUG9vbCgpOiB2b2lkIHtcbiAgICBSaWNoVGV4dExlYWYucG9vbC5mcmVlVG9Qb29sKCB0aGlzICk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IHBvb2wgPSBuZXcgUG9vbCggUmljaFRleHRMZWFmICk7XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdSaWNoVGV4dExlYWYnLCBSaWNoVGV4dExlYWYgKTsiXSwibmFtZXMiOlsiUG9vbCIsIlJpY2hUZXh0IiwiUmljaFRleHRDbGVhbmFibGUiLCJSaWNoVGV4dFV0aWxzIiwic2NlbmVyeSIsIlRleHQiLCJSaWNoVGV4dExlYWYiLCJpbml0aWFsaXplIiwiY29udGVudCIsImlzTFRSIiwiZm9udCIsImJvdW5kc01ldGhvZCIsImZpbGwiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJ3aGl0ZXNwYWNlQmVmb3JlIiwic3RhcnRzV2l0aCIsInNsaWNlIiwid2hpdGVzcGFjZUFmdGVyIiwiZW5kc1dpdGgiLCJsZW5ndGgiLCJzdHJpbmciLCJjb250ZW50VG9TdHJpbmciLCJzcGFjaW5nQmVmb3JlIiwic2NyYXRjaFRleHQiLCJzZXRTdHJpbmciLCJzZXRGb250Iiwid2lkdGgiLCJzcGFjaW5nQWZ0ZXIiLCJsZWZ0U3BhY2luZyIsInJpZ2h0U3BhY2luZyIsImNsZWFuIiwiZml0c0luIiwid2lkdGhBdmFpbGFibGUiLCJoYXNBZGRlZExlYWZUb0xpbmUiLCJpc0NvbnRhaW5lckxUUiIsImZyZWVUb1Bvb2wiLCJwb29sIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBQ0QsT0FBT0EsVUFBeUIsbUNBQW1DO0FBQ25FLFNBQWVDLFFBQVEsRUFB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