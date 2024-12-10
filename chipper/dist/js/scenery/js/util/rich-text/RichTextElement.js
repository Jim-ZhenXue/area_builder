// Copyright 2023-2024, University of Colorado Boulder
/**
 * Represents an element in the RichText hierarchy that has child content (renders nothing on its own, but has its own
 * scale, positioning, style, etc.). <span> or <b> are examples of something that would create this.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Pool from '../../../../phet-core/js/Pool.js';
import { Node, RichTextCleanable, scenery } from '../../imports.js';
let RichTextElement = class RichTextElement extends RichTextCleanable(Node) {
    initialize(isLTR) {
        this.isLTR = isLTR;
        this.leftSpacing = 0;
        this.rightSpacing = 0;
        return this;
    }
    /**
   * Adds a child element.
   *
   * @returns- Whether the item was actually added.
   */ addElement(element) {
        const hadChild = this.children.length > 0;
        const hasElement = element.width > 0;
        // May be at a different scale, which we need to handle
        const elementScale = element.getScaleVector().x;
        const leftElementSpacing = element.leftSpacing * elementScale;
        const rightElementSpacing = element.rightSpacing * elementScale;
        // If there is nothing, then no spacing should be handled
        if (!hadChild && !hasElement) {
            sceneryLog && sceneryLog.RichText && sceneryLog.RichText('No child or element, ignoring');
            return false;
        } else if (!hadChild) {
            sceneryLog && sceneryLog.RichText && sceneryLog.RichText(`First child, ltr:${this.isLTR}, spacing: ${this.isLTR ? rightElementSpacing : leftElementSpacing}`);
            if (this.isLTR) {
                element.left = 0;
                this.leftSpacing = leftElementSpacing;
                this.rightSpacing = rightElementSpacing;
            } else {
                element.right = 0;
                this.leftSpacing = leftElementSpacing;
                this.rightSpacing = rightElementSpacing;
            }
            this.addChild(element);
            return true;
        } else if (!hasElement) {
            sceneryLog && sceneryLog.RichText && sceneryLog.RichText(`No element, adding spacing, ltr:${this.isLTR}, spacing: ${leftElementSpacing + rightElementSpacing}`);
            if (this.isLTR) {
                this.rightSpacing += leftElementSpacing + rightElementSpacing;
            } else {
                this.leftSpacing += leftElementSpacing + rightElementSpacing;
            }
        } else {
            if (this.isLTR) {
                sceneryLog && sceneryLog.RichText && sceneryLog.RichText(`LTR add ${this.rightSpacing} + ${leftElementSpacing}`);
                element.left = this.localRight + this.rightSpacing + leftElementSpacing;
                this.rightSpacing = rightElementSpacing;
            } else {
                sceneryLog && sceneryLog.RichText && sceneryLog.RichText(`RTL add ${this.leftSpacing} + ${rightElementSpacing}`);
                element.right = this.localLeft - this.leftSpacing - rightElementSpacing;
                this.leftSpacing = leftElementSpacing;
            }
            this.addChild(element);
            return true;
        }
        return false;
    }
    /**
   * Adds an amount of spacing to the "before" side.
   */ addExtraBeforeSpacing(amount) {
        if (this.isLTR) {
            this.leftSpacing += amount;
        } else {
            this.rightSpacing += amount;
        }
    }
    freeToPool() {
        RichTextElement.pool.freeToPool(this);
    }
    /**
   * @param isLTR - Whether this container will lay out elements in the left-to-right order (if false, will be
   *                          right-to-left).
   */ constructor(isLTR){
        super();
        this.initialize(isLTR);
    }
};
RichTextElement.pool = new Pool(RichTextElement);
export { RichTextElement as default };
scenery.register('RichTextElement', RichTextElement);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9yaWNoLXRleHQvUmljaFRleHRFbGVtZW50LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gZWxlbWVudCBpbiB0aGUgUmljaFRleHQgaGllcmFyY2h5IHRoYXQgaGFzIGNoaWxkIGNvbnRlbnQgKHJlbmRlcnMgbm90aGluZyBvbiBpdHMgb3duLCBidXQgaGFzIGl0cyBvd25cbiAqIHNjYWxlLCBwb3NpdGlvbmluZywgc3R5bGUsIGV0Yy4pLiA8c3Bhbj4gb3IgPGI+IGFyZSBleGFtcGxlcyBvZiBzb21ldGhpbmcgdGhhdCB3b3VsZCBjcmVhdGUgdGhpcy5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cbmltcG9ydCBQb29sLCB7IFRQb29sYWJsZSB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9Qb29sLmpzJztcbmltcG9ydCB7IE5vZGUsIFJpY2hUZXh0Q2xlYW5hYmxlLCBSaWNoVGV4dExlYWYsIFJpY2hUZXh0Tm9kZSwgc2NlbmVyeSB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSaWNoVGV4dEVsZW1lbnQgZXh0ZW5kcyBSaWNoVGV4dENsZWFuYWJsZSggTm9kZSApIGltcGxlbWVudHMgVFBvb2xhYmxlIHtcblxuICBwcml2YXRlIGlzTFRSITogYm9vbGVhbjtcblxuICAvLyBUaGUgYW1vdW50IG9mIGxvY2FsLWNvb3JkaW5hdGUgc3BhY2luZyB0byBhcHBseSBvbiBlYWNoIHNpZGVcbiAgcHVibGljIGxlZnRTcGFjaW5nITogbnVtYmVyO1xuICBwdWJsaWMgcmlnaHRTcGFjaW5nITogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gaXNMVFIgLSBXaGV0aGVyIHRoaXMgY29udGFpbmVyIHdpbGwgbGF5IG91dCBlbGVtZW50cyBpbiB0aGUgbGVmdC10by1yaWdodCBvcmRlciAoaWYgZmFsc2UsIHdpbGwgYmVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0LXRvLWxlZnQpLlxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBpc0xUUjogYm9vbGVhbiApIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5pbml0aWFsaXplKCBpc0xUUiApO1xuICB9XG5cbiAgcHVibGljIGluaXRpYWxpemUoIGlzTFRSOiBib29sZWFuICk6IHRoaXMge1xuICAgIHRoaXMuaXNMVFIgPSBpc0xUUjtcbiAgICB0aGlzLmxlZnRTcGFjaW5nID0gMDtcbiAgICB0aGlzLnJpZ2h0U3BhY2luZyA9IDA7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgY2hpbGQgZWxlbWVudC5cbiAgICpcbiAgICogQHJldHVybnMtIFdoZXRoZXIgdGhlIGl0ZW0gd2FzIGFjdHVhbGx5IGFkZGVkLlxuICAgKi9cbiAgcHVibGljIGFkZEVsZW1lbnQoIGVsZW1lbnQ6IFJpY2hUZXh0RWxlbWVudCB8IFJpY2hUZXh0TGVhZiB8IFJpY2hUZXh0Tm9kZSApOiBib29sZWFuIHtcblxuICAgIGNvbnN0IGhhZENoaWxkID0gdGhpcy5jaGlsZHJlbi5sZW5ndGggPiAwO1xuICAgIGNvbnN0IGhhc0VsZW1lbnQgPSBlbGVtZW50LndpZHRoID4gMDtcblxuICAgIC8vIE1heSBiZSBhdCBhIGRpZmZlcmVudCBzY2FsZSwgd2hpY2ggd2UgbmVlZCB0byBoYW5kbGVcbiAgICBjb25zdCBlbGVtZW50U2NhbGUgPSBlbGVtZW50LmdldFNjYWxlVmVjdG9yKCkueDtcbiAgICBjb25zdCBsZWZ0RWxlbWVudFNwYWNpbmcgPSBlbGVtZW50LmxlZnRTcGFjaW5nICogZWxlbWVudFNjYWxlO1xuICAgIGNvbnN0IHJpZ2h0RWxlbWVudFNwYWNpbmcgPSBlbGVtZW50LnJpZ2h0U3BhY2luZyAqIGVsZW1lbnRTY2FsZTtcblxuICAgIC8vIElmIHRoZXJlIGlzIG5vdGhpbmcsIHRoZW4gbm8gc3BhY2luZyBzaG91bGQgYmUgaGFuZGxlZFxuICAgIGlmICggIWhhZENoaWxkICYmICFoYXNFbGVtZW50ICkge1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0ICYmIHNjZW5lcnlMb2cuUmljaFRleHQoICdObyBjaGlsZCBvciBlbGVtZW50LCBpZ25vcmluZycgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoICFoYWRDaGlsZCApIHtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5SaWNoVGV4dCAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0KCBgRmlyc3QgY2hpbGQsIGx0cjoke3RoaXMuaXNMVFJ9LCBzcGFjaW5nOiAke3RoaXMuaXNMVFIgPyByaWdodEVsZW1lbnRTcGFjaW5nIDogbGVmdEVsZW1lbnRTcGFjaW5nfWAgKTtcbiAgICAgIGlmICggdGhpcy5pc0xUUiApIHtcbiAgICAgICAgZWxlbWVudC5sZWZ0ID0gMDtcbiAgICAgICAgdGhpcy5sZWZ0U3BhY2luZyA9IGxlZnRFbGVtZW50U3BhY2luZztcbiAgICAgICAgdGhpcy5yaWdodFNwYWNpbmcgPSByaWdodEVsZW1lbnRTcGFjaW5nO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGVsZW1lbnQucmlnaHQgPSAwO1xuICAgICAgICB0aGlzLmxlZnRTcGFjaW5nID0gbGVmdEVsZW1lbnRTcGFjaW5nO1xuICAgICAgICB0aGlzLnJpZ2h0U3BhY2luZyA9IHJpZ2h0RWxlbWVudFNwYWNpbmc7XG4gICAgICB9XG4gICAgICB0aGlzLmFkZENoaWxkKCBlbGVtZW50ICk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoICFoYXNFbGVtZW50ICkge1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0ICYmIHNjZW5lcnlMb2cuUmljaFRleHQoIGBObyBlbGVtZW50LCBhZGRpbmcgc3BhY2luZywgbHRyOiR7dGhpcy5pc0xUUn0sIHNwYWNpbmc6ICR7bGVmdEVsZW1lbnRTcGFjaW5nICsgcmlnaHRFbGVtZW50U3BhY2luZ31gICk7XG4gICAgICBpZiAoIHRoaXMuaXNMVFIgKSB7XG4gICAgICAgIHRoaXMucmlnaHRTcGFjaW5nICs9IGxlZnRFbGVtZW50U3BhY2luZyArIHJpZ2h0RWxlbWVudFNwYWNpbmc7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5sZWZ0U3BhY2luZyArPSBsZWZ0RWxlbWVudFNwYWNpbmcgKyByaWdodEVsZW1lbnRTcGFjaW5nO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGlmICggdGhpcy5pc0xUUiApIHtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0ICYmIHNjZW5lcnlMb2cuUmljaFRleHQoIGBMVFIgYWRkICR7dGhpcy5yaWdodFNwYWNpbmd9ICsgJHtsZWZ0RWxlbWVudFNwYWNpbmd9YCApO1xuICAgICAgICBlbGVtZW50LmxlZnQgPSB0aGlzLmxvY2FsUmlnaHQgKyB0aGlzLnJpZ2h0U3BhY2luZyArIGxlZnRFbGVtZW50U3BhY2luZztcbiAgICAgICAgdGhpcy5yaWdodFNwYWNpbmcgPSByaWdodEVsZW1lbnRTcGFjaW5nO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5SaWNoVGV4dCAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0KCBgUlRMIGFkZCAke3RoaXMubGVmdFNwYWNpbmd9ICsgJHtyaWdodEVsZW1lbnRTcGFjaW5nfWAgKTtcbiAgICAgICAgZWxlbWVudC5yaWdodCA9IHRoaXMubG9jYWxMZWZ0IC0gdGhpcy5sZWZ0U3BhY2luZyAtIHJpZ2h0RWxlbWVudFNwYWNpbmc7XG4gICAgICAgIHRoaXMubGVmdFNwYWNpbmcgPSBsZWZ0RWxlbWVudFNwYWNpbmc7XG4gICAgICB9XG4gICAgICB0aGlzLmFkZENoaWxkKCBlbGVtZW50ICk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYW4gYW1vdW50IG9mIHNwYWNpbmcgdG8gdGhlIFwiYmVmb3JlXCIgc2lkZS5cbiAgICovXG4gIHB1YmxpYyBhZGRFeHRyYUJlZm9yZVNwYWNpbmcoIGFtb3VudDogbnVtYmVyICk6IHZvaWQge1xuICAgIGlmICggdGhpcy5pc0xUUiApIHtcbiAgICAgIHRoaXMubGVmdFNwYWNpbmcgKz0gYW1vdW50O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMucmlnaHRTcGFjaW5nICs9IGFtb3VudDtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZnJlZVRvUG9vbCgpOiB2b2lkIHtcbiAgICBSaWNoVGV4dEVsZW1lbnQucG9vbC5mcmVlVG9Qb29sKCB0aGlzICk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IHBvb2wgPSBuZXcgUG9vbCggUmljaFRleHRFbGVtZW50ICk7XG5cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ1JpY2hUZXh0RWxlbWVudCcsIFJpY2hUZXh0RWxlbWVudCApOyJdLCJuYW1lcyI6WyJQb29sIiwiTm9kZSIsIlJpY2hUZXh0Q2xlYW5hYmxlIiwic2NlbmVyeSIsIlJpY2hUZXh0RWxlbWVudCIsImluaXRpYWxpemUiLCJpc0xUUiIsImxlZnRTcGFjaW5nIiwicmlnaHRTcGFjaW5nIiwiYWRkRWxlbWVudCIsImVsZW1lbnQiLCJoYWRDaGlsZCIsImNoaWxkcmVuIiwibGVuZ3RoIiwiaGFzRWxlbWVudCIsIndpZHRoIiwiZWxlbWVudFNjYWxlIiwiZ2V0U2NhbGVWZWN0b3IiLCJ4IiwibGVmdEVsZW1lbnRTcGFjaW5nIiwicmlnaHRFbGVtZW50U3BhY2luZyIsInNjZW5lcnlMb2ciLCJSaWNoVGV4dCIsImxlZnQiLCJyaWdodCIsImFkZENoaWxkIiwibG9jYWxSaWdodCIsImxvY2FsTGVmdCIsImFkZEV4dHJhQmVmb3JlU3BhY2luZyIsImFtb3VudCIsImZyZWVUb1Bvb2wiLCJwb29sIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUNELE9BQU9BLFVBQXlCLG1DQUFtQztBQUNuRSxTQUFTQyxJQUFJLEVBQUVDLGlCQUFpQixFQUE4QkMsT0FBTyxRQUFRLG1CQUFtQjtBQUVqRixJQUFBLEFBQU1DLGtCQUFOLE1BQU1BLHdCQUF3QkYsa0JBQW1CRDtJQWtCdkRJLFdBQVlDLEtBQWMsRUFBUztRQUN4QyxJQUFJLENBQUNBLEtBQUssR0FBR0E7UUFDYixJQUFJLENBQUNDLFdBQVcsR0FBRztRQUNuQixJQUFJLENBQUNDLFlBQVksR0FBRztRQUVwQixPQUFPLElBQUk7SUFDYjtJQUVBOzs7O0dBSUMsR0FDRCxBQUFPQyxXQUFZQyxPQUFzRCxFQUFZO1FBRW5GLE1BQU1DLFdBQVcsSUFBSSxDQUFDQyxRQUFRLENBQUNDLE1BQU0sR0FBRztRQUN4QyxNQUFNQyxhQUFhSixRQUFRSyxLQUFLLEdBQUc7UUFFbkMsdURBQXVEO1FBQ3ZELE1BQU1DLGVBQWVOLFFBQVFPLGNBQWMsR0FBR0MsQ0FBQztRQUMvQyxNQUFNQyxxQkFBcUJULFFBQVFILFdBQVcsR0FBR1M7UUFDakQsTUFBTUksc0JBQXNCVixRQUFRRixZQUFZLEdBQUdRO1FBRW5ELHlEQUF5RDtRQUN6RCxJQUFLLENBQUNMLFlBQVksQ0FBQ0csWUFBYTtZQUM5Qk8sY0FBY0EsV0FBV0MsUUFBUSxJQUFJRCxXQUFXQyxRQUFRLENBQUU7WUFDMUQsT0FBTztRQUNULE9BQ0ssSUFBSyxDQUFDWCxVQUFXO1lBQ3BCVSxjQUFjQSxXQUFXQyxRQUFRLElBQUlELFdBQVdDLFFBQVEsQ0FBRSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQ2hCLEtBQUssQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDQSxLQUFLLEdBQUdjLHNCQUFzQkQsb0JBQW9CO1lBQzdKLElBQUssSUFBSSxDQUFDYixLQUFLLEVBQUc7Z0JBQ2hCSSxRQUFRYSxJQUFJLEdBQUc7Z0JBQ2YsSUFBSSxDQUFDaEIsV0FBVyxHQUFHWTtnQkFDbkIsSUFBSSxDQUFDWCxZQUFZLEdBQUdZO1lBQ3RCLE9BQ0s7Z0JBQ0hWLFFBQVFjLEtBQUssR0FBRztnQkFDaEIsSUFBSSxDQUFDakIsV0FBVyxHQUFHWTtnQkFDbkIsSUFBSSxDQUFDWCxZQUFZLEdBQUdZO1lBQ3RCO1lBQ0EsSUFBSSxDQUFDSyxRQUFRLENBQUVmO1lBQ2YsT0FBTztRQUNULE9BQ0ssSUFBSyxDQUFDSSxZQUFhO1lBQ3RCTyxjQUFjQSxXQUFXQyxRQUFRLElBQUlELFdBQVdDLFFBQVEsQ0FBRSxDQUFDLGdDQUFnQyxFQUFFLElBQUksQ0FBQ2hCLEtBQUssQ0FBQyxXQUFXLEVBQUVhLHFCQUFxQkMscUJBQXFCO1lBQy9KLElBQUssSUFBSSxDQUFDZCxLQUFLLEVBQUc7Z0JBQ2hCLElBQUksQ0FBQ0UsWUFBWSxJQUFJVyxxQkFBcUJDO1lBQzVDLE9BQ0s7Z0JBQ0gsSUFBSSxDQUFDYixXQUFXLElBQUlZLHFCQUFxQkM7WUFDM0M7UUFDRixPQUNLO1lBQ0gsSUFBSyxJQUFJLENBQUNkLEtBQUssRUFBRztnQkFDaEJlLGNBQWNBLFdBQVdDLFFBQVEsSUFBSUQsV0FBV0MsUUFBUSxDQUFFLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQ2QsWUFBWSxDQUFDLEdBQUcsRUFBRVcsb0JBQW9CO2dCQUNoSFQsUUFBUWEsSUFBSSxHQUFHLElBQUksQ0FBQ0csVUFBVSxHQUFHLElBQUksQ0FBQ2xCLFlBQVksR0FBR1c7Z0JBQ3JELElBQUksQ0FBQ1gsWUFBWSxHQUFHWTtZQUN0QixPQUNLO2dCQUNIQyxjQUFjQSxXQUFXQyxRQUFRLElBQUlELFdBQVdDLFFBQVEsQ0FBRSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUNmLFdBQVcsQ0FBQyxHQUFHLEVBQUVhLHFCQUFxQjtnQkFDaEhWLFFBQVFjLEtBQUssR0FBRyxJQUFJLENBQUNHLFNBQVMsR0FBRyxJQUFJLENBQUNwQixXQUFXLEdBQUdhO2dCQUNwRCxJQUFJLENBQUNiLFdBQVcsR0FBR1k7WUFDckI7WUFDQSxJQUFJLENBQUNNLFFBQVEsQ0FBRWY7WUFDZixPQUFPO1FBQ1Q7UUFDQSxPQUFPO0lBQ1Q7SUFFQTs7R0FFQyxHQUNELEFBQU9rQixzQkFBdUJDLE1BQWMsRUFBUztRQUNuRCxJQUFLLElBQUksQ0FBQ3ZCLEtBQUssRUFBRztZQUNoQixJQUFJLENBQUNDLFdBQVcsSUFBSXNCO1FBQ3RCLE9BQ0s7WUFDSCxJQUFJLENBQUNyQixZQUFZLElBQUlxQjtRQUN2QjtJQUNGO0lBRU9DLGFBQW1CO1FBQ3hCMUIsZ0JBQWdCMkIsSUFBSSxDQUFDRCxVQUFVLENBQUUsSUFBSTtJQUN2QztJQTdGQTs7O0dBR0MsR0FDRCxZQUFvQnhCLEtBQWMsQ0FBRztRQUNuQyxLQUFLO1FBRUwsSUFBSSxDQUFDRCxVQUFVLENBQUVDO0lBQ25CO0FBeUZGO0FBekdxQkYsZ0JBdUdJMkIsT0FBTyxJQUFJL0IsS0FBTUk7QUF2RzFDLFNBQXFCQSw2QkF5R3BCO0FBRURELFFBQVE2QixRQUFRLENBQUUsbUJBQW1CNUIifQ==