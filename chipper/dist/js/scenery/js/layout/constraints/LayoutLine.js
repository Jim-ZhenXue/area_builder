// Copyright 2022-2024, University of Colorado Boulder
/**
 * An internal representation of a row/column for grid/flow handling in constraints (set up for pooling)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { scenery } from '../../imports.js';
let LayoutLine = class LayoutLine {
    initializeLayoutLine() {
        this.min = 0;
        this.max = Number.POSITIVE_INFINITY;
        this.minOrigin = Number.POSITIVE_INFINITY;
        this.maxOrigin = Number.NEGATIVE_INFINITY;
        this.size = 0;
        this.position = 0;
    }
    /**
   * Whether there was origin-based content in the layout
   * (scenery-internal)
   */ hasOrigin() {
        return isFinite(this.minOrigin) && isFinite(this.maxOrigin);
    }
};
export { LayoutLine as default };
scenery.register('LayoutLine', LayoutLine);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGF5b3V0L2NvbnN0cmFpbnRzL0xheW91dExpbmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQW4gaW50ZXJuYWwgcmVwcmVzZW50YXRpb24gb2YgYSByb3cvY29sdW1uIGZvciBncmlkL2Zsb3cgaGFuZGxpbmcgaW4gY29uc3RyYWludHMgKHNldCB1cCBmb3IgcG9vbGluZylcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHsgc2NlbmVyeSB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMYXlvdXRMaW5lIHtcblxuICAvLyBBIHJhbmdlIG9mIHNpemVzIGFsb25nIHRoZSBzZWNvbmRhcnkgYXhpcyB0aGF0IG91ciBjZWxscyBjb3VsZCB0YWtlIHVwXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxuICBwdWJsaWMgbWluITogbnVtYmVyO1xuICBwdWJsaWMgbWF4ITogbnVtYmVyO1xuXG4gIC8vIEEgcmFuZ2Ugb2YgcG9zaXRpb25zIHdoZXJlIG91ciBhbGlnbjpvcmlnaW4gY29udGVudCBjb3VsZCBnbyBvdXQgdG8gKHRoZSBmYXJ0aGVzdCArLy0gZnJvbSAwIHRoYXQgb3VyIGFsaWduOm9yaWdpblxuICAvLyBub2RlcyBnbykuXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxuICBwdWJsaWMgbWluT3JpZ2luITogbnVtYmVyO1xuICBwdWJsaWMgbWF4T3JpZ2luITogbnVtYmVyO1xuXG4gIC8vIFRoZSBsaW5lJ3Mgc2l6ZSAoYWxvbmcgdGhlIHNlY29uZGFyeSBheGlzKVxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcbiAgcHVibGljIHNpemUhOiBudW1iZXI7XG5cbiAgLy8gVGhlIGxpbmUncyBwb3NpdGlvbiAoYWxvbmcgdGhlIHByaW1hcnkgYXhpcylcbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXG4gIHB1YmxpYyBwb3NpdGlvbiE6IG51bWJlcjtcblxuICBwcm90ZWN0ZWQgaW5pdGlhbGl6ZUxheW91dExpbmUoKTogdm9pZCB7XG4gICAgdGhpcy5taW4gPSAwO1xuICAgIHRoaXMubWF4ID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAgIHRoaXMubWluT3JpZ2luID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAgIHRoaXMubWF4T3JpZ2luID0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZO1xuICAgIHRoaXMuc2l6ZSA9IDA7XG4gICAgdGhpcy5wb3NpdGlvbiA9IDA7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGVyZSB3YXMgb3JpZ2luLWJhc2VkIGNvbnRlbnQgaW4gdGhlIGxheW91dFxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBoYXNPcmlnaW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzRmluaXRlKCB0aGlzLm1pbk9yaWdpbiApICYmIGlzRmluaXRlKCB0aGlzLm1heE9yaWdpbiApO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdMYXlvdXRMaW5lJywgTGF5b3V0TGluZSApOyJdLCJuYW1lcyI6WyJzY2VuZXJ5IiwiTGF5b3V0TGluZSIsImluaXRpYWxpemVMYXlvdXRMaW5lIiwibWluIiwibWF4IiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJtaW5PcmlnaW4iLCJtYXhPcmlnaW4iLCJORUdBVElWRV9JTkZJTklUWSIsInNpemUiLCJwb3NpdGlvbiIsImhhc09yaWdpbiIsImlzRmluaXRlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsU0FBU0EsT0FBTyxRQUFRLG1CQUFtQjtBQUU1QixJQUFBLEFBQU1DLGFBQU4sTUFBTUE7SUFxQlRDLHVCQUE2QjtRQUNyQyxJQUFJLENBQUNDLEdBQUcsR0FBRztRQUNYLElBQUksQ0FBQ0MsR0FBRyxHQUFHQyxPQUFPQyxpQkFBaUI7UUFDbkMsSUFBSSxDQUFDQyxTQUFTLEdBQUdGLE9BQU9DLGlCQUFpQjtRQUN6QyxJQUFJLENBQUNFLFNBQVMsR0FBR0gsT0FBT0ksaUJBQWlCO1FBQ3pDLElBQUksQ0FBQ0MsSUFBSSxHQUFHO1FBQ1osSUFBSSxDQUFDQyxRQUFRLEdBQUc7SUFDbEI7SUFFQTs7O0dBR0MsR0FDRCxBQUFPQyxZQUFxQjtRQUMxQixPQUFPQyxTQUFVLElBQUksQ0FBQ04sU0FBUyxLQUFNTSxTQUFVLElBQUksQ0FBQ0wsU0FBUztJQUMvRDtBQUNGO0FBckNBLFNBQXFCUCx3QkFxQ3BCO0FBRURELFFBQVFjLFFBQVEsQ0FBRSxjQUFjYiJ9