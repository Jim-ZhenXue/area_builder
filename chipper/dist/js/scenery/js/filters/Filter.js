// Copyright 2020-2024, University of Colorado Boulder
/**
 * Base type for filters
 *
 * Filters have different ways of being applied, depending on what the platform supports AND what content is below.
 * These different ways have potentially different performance characteristics, and potentially quality differences.
 *
 * The current ways are:
 * - DOM element with CSS filter specified (can include mixed content and WebGL underneath, and this is used as a
 *   general fallback). NOTE: General color matrix support is NOT provided under this, we only have specific named
 *   filters that can be used.
 * - SVG filter elements (which are very flexible, a combination of filters may be combined into SVG filter elements).
 *   This only works if ALL of the content under the filter(s) can be placed in one SVG element, so a layerSplit or
 *   non-SVG content can prevent this from being used.
 * - Canvas filter attribute (similar to DOM CSS). Similar to DOM CSS, but not as accelerated (requires applying the
 *   filter by drawing into another Canvas). Chromium-based browsers seem to have issues with the color space used,
 *   so this can't be used on that platform. Additionally, this only works if ALL the content under the filter(s) can
 *   be placed in one Canvas, so a layerSplit or non-SVG content can prevent this from being used.
 * - Canvas ImageData. This is a fallback where we directly get, manipulate, and set pixel data in a Canvas (with the
 *   corresponding performance hit that it takes to CPU-process every pixel). Additionally, this only works if ALL the
 *   content under the filter(s) can   be placed in one Canvas, so a layerSplit or non-SVG content can prevent this from
 *   being used.
 *
 * Some filters may have slightly different appearances depending on the browser/platform/renderer.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { Features, scenery, svgns } from '../imports.js';
let globalId = 1;
let Filter = class Filter {
    isDOMCompatible() {
        // TODO: We can browser-check on things like color matrix? But we want to disallow things that we can't guarantee we https://github.com/phetsims/scenery/issues/1581
        // can support?
        return false;
    }
    isSVGCompatible() {
        return false;
    }
    isCanvasCompatible() {
        return Features.canvasFilter ? this.isDOMCompatible() : false;
    }
    isWebGLCompatible() {
        return false;
    }
    /**
   * Returns a string form of this object
   */ toString() {
        return this.id;
    }
    /**
   * Applies a color matrix effect into an existing SVG filter.
   */ static applyColorMatrix(matrixValues, svgFilter, inName, resultName) {
        const feColorMatrix = document.createElementNS(svgns, 'feColorMatrix');
        feColorMatrix.setAttribute('type', 'matrix');
        feColorMatrix.setAttribute('values', matrixValues);
        feColorMatrix.setAttribute('in', inName);
        // Since the DOM effects are done with sRGB and we can't manipulate that, we'll instead adjust SVG to apply the
        // effects in sRGB so that we have consistency
        feColorMatrix.setAttribute('color-interpolation-filters', 'sRGB');
        if (resultName) {
            feColorMatrix.setAttribute('result', resultName);
        }
        svgFilter.appendChild(feColorMatrix);
    }
    constructor(){
        this.id = `filter${globalId++}`;
        this.filterRegionPercentageIncrease = 0;
    }
};
export { Filter as default };
scenery.register('Filter', Filter);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZmlsdGVycy9GaWx0ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQmFzZSB0eXBlIGZvciBmaWx0ZXJzXG4gKlxuICogRmlsdGVycyBoYXZlIGRpZmZlcmVudCB3YXlzIG9mIGJlaW5nIGFwcGxpZWQsIGRlcGVuZGluZyBvbiB3aGF0IHRoZSBwbGF0Zm9ybSBzdXBwb3J0cyBBTkQgd2hhdCBjb250ZW50IGlzIGJlbG93LlxuICogVGhlc2UgZGlmZmVyZW50IHdheXMgaGF2ZSBwb3RlbnRpYWxseSBkaWZmZXJlbnQgcGVyZm9ybWFuY2UgY2hhcmFjdGVyaXN0aWNzLCBhbmQgcG90ZW50aWFsbHkgcXVhbGl0eSBkaWZmZXJlbmNlcy5cbiAqXG4gKiBUaGUgY3VycmVudCB3YXlzIGFyZTpcbiAqIC0gRE9NIGVsZW1lbnQgd2l0aCBDU1MgZmlsdGVyIHNwZWNpZmllZCAoY2FuIGluY2x1ZGUgbWl4ZWQgY29udGVudCBhbmQgV2ViR0wgdW5kZXJuZWF0aCwgYW5kIHRoaXMgaXMgdXNlZCBhcyBhXG4gKiAgIGdlbmVyYWwgZmFsbGJhY2spLiBOT1RFOiBHZW5lcmFsIGNvbG9yIG1hdHJpeCBzdXBwb3J0IGlzIE5PVCBwcm92aWRlZCB1bmRlciB0aGlzLCB3ZSBvbmx5IGhhdmUgc3BlY2lmaWMgbmFtZWRcbiAqICAgZmlsdGVycyB0aGF0IGNhbiBiZSB1c2VkLlxuICogLSBTVkcgZmlsdGVyIGVsZW1lbnRzICh3aGljaCBhcmUgdmVyeSBmbGV4aWJsZSwgYSBjb21iaW5hdGlvbiBvZiBmaWx0ZXJzIG1heSBiZSBjb21iaW5lZCBpbnRvIFNWRyBmaWx0ZXIgZWxlbWVudHMpLlxuICogICBUaGlzIG9ubHkgd29ya3MgaWYgQUxMIG9mIHRoZSBjb250ZW50IHVuZGVyIHRoZSBmaWx0ZXIocykgY2FuIGJlIHBsYWNlZCBpbiBvbmUgU1ZHIGVsZW1lbnQsIHNvIGEgbGF5ZXJTcGxpdCBvclxuICogICBub24tU1ZHIGNvbnRlbnQgY2FuIHByZXZlbnQgdGhpcyBmcm9tIGJlaW5nIHVzZWQuXG4gKiAtIENhbnZhcyBmaWx0ZXIgYXR0cmlidXRlIChzaW1pbGFyIHRvIERPTSBDU1MpLiBTaW1pbGFyIHRvIERPTSBDU1MsIGJ1dCBub3QgYXMgYWNjZWxlcmF0ZWQgKHJlcXVpcmVzIGFwcGx5aW5nIHRoZVxuICogICBmaWx0ZXIgYnkgZHJhd2luZyBpbnRvIGFub3RoZXIgQ2FudmFzKS4gQ2hyb21pdW0tYmFzZWQgYnJvd3NlcnMgc2VlbSB0byBoYXZlIGlzc3VlcyB3aXRoIHRoZSBjb2xvciBzcGFjZSB1c2VkLFxuICogICBzbyB0aGlzIGNhbid0IGJlIHVzZWQgb24gdGhhdCBwbGF0Zm9ybS4gQWRkaXRpb25hbGx5LCB0aGlzIG9ubHkgd29ya3MgaWYgQUxMIHRoZSBjb250ZW50IHVuZGVyIHRoZSBmaWx0ZXIocykgY2FuXG4gKiAgIGJlIHBsYWNlZCBpbiBvbmUgQ2FudmFzLCBzbyBhIGxheWVyU3BsaXQgb3Igbm9uLVNWRyBjb250ZW50IGNhbiBwcmV2ZW50IHRoaXMgZnJvbSBiZWluZyB1c2VkLlxuICogLSBDYW52YXMgSW1hZ2VEYXRhLiBUaGlzIGlzIGEgZmFsbGJhY2sgd2hlcmUgd2UgZGlyZWN0bHkgZ2V0LCBtYW5pcHVsYXRlLCBhbmQgc2V0IHBpeGVsIGRhdGEgaW4gYSBDYW52YXMgKHdpdGggdGhlXG4gKiAgIGNvcnJlc3BvbmRpbmcgcGVyZm9ybWFuY2UgaGl0IHRoYXQgaXQgdGFrZXMgdG8gQ1BVLXByb2Nlc3MgZXZlcnkgcGl4ZWwpLiBBZGRpdGlvbmFsbHksIHRoaXMgb25seSB3b3JrcyBpZiBBTEwgdGhlXG4gKiAgIGNvbnRlbnQgdW5kZXIgdGhlIGZpbHRlcihzKSBjYW4gICBiZSBwbGFjZWQgaW4gb25lIENhbnZhcywgc28gYSBsYXllclNwbGl0IG9yIG5vbi1TVkcgY29udGVudCBjYW4gcHJldmVudCB0aGlzIGZyb21cbiAqICAgYmVpbmcgdXNlZC5cbiAqXG4gKiBTb21lIGZpbHRlcnMgbWF5IGhhdmUgc2xpZ2h0bHkgZGlmZmVyZW50IGFwcGVhcmFuY2VzIGRlcGVuZGluZyBvbiB0aGUgYnJvd3Nlci9wbGF0Zm9ybS9yZW5kZXJlci5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHsgQ2FudmFzQ29udGV4dFdyYXBwZXIsIEZlYXR1cmVzLCBzY2VuZXJ5LCBzdmducyB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5sZXQgZ2xvYmFsSWQgPSAxO1xuXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBGaWx0ZXIge1xuXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxuICBwdWJsaWMgcmVhZG9ubHkgaWQ6IHN0cmluZztcblxuICAvLyBDYW4gYmUgbXV0YXRlZCBieSBzdWJ0eXBlcywgZGV0ZXJtaW5lcyB3aGF0IGZpbHRlciByZWdpb24gaW5jcmVhc2VzIHNob3VsZCBiZSB1c2VkIGZvciB3aGVuIFNWRyBpcyB1c2VkIGZvclxuICAvLyByZW5kZXJpbmcuXG4gIHB1YmxpYyBmaWx0ZXJSZWdpb25QZXJjZW50YWdlSW5jcmVhc2U6IG51bWJlcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5pZCA9IGBmaWx0ZXIke2dsb2JhbElkKyt9YDtcbiAgICB0aGlzLmZpbHRlclJlZ2lvblBlcmNlbnRhZ2VJbmNyZWFzZSA9IDA7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgQ1NTLXN0eWxlIGZpbHRlciBzdWJzdHJpbmcgc3BlY2lmaWMgdG8gdGhpcyBzaW5nbGUgZmlsdGVyLCBlLmcuIGBncmF5c2NhbGUoMSlgLiBUaGlzIHNob3VsZCBiZSB1c2VkIGZvclxuICAgKiBib3RoIERPTSBlbGVtZW50cyAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL2ZpbHRlcikgYW5kIHdoZW4gc3VwcG9ydGVkLCBDYW52YXNcbiAgICogKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DYW52YXNSZW5kZXJpbmdDb250ZXh0MkQvZmlsdGVyKS5cbiAgICovXG4gIHB1YmxpYyBhYnN0cmFjdCBnZXRDU1NGaWx0ZXJTdHJpbmcoKTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBBcHBlbmRzIGZpbHRlciBzdWItZWxlbWVudHMgaW50byB0aGUgU1ZHIGZpbHRlciBlbGVtZW50IHByb3ZpZGVkLiBTaG91bGQgaW5jbHVkZSBhbiBpbj0ke2luTmFtZX0gZm9yIGFsbCBpbnB1dHMsXG4gICAqIGFuZCBzaG91bGQgZWl0aGVyIG91dHB1dCB1c2luZyB0aGUgcmVzdWx0TmFtZSAob3IgaWYgbm90IHByb3ZpZGVkLCB0aGUgbGFzdCBlbGVtZW50IGFwcGVuZGVkIHNob3VsZCBiZSB0aGUgb3V0cHV0KS5cbiAgICogVGhpcyBlZmZlY3RpdmVseSBtdXRhdGVzIHRoZSBwcm92aWRlZCBmaWx0ZXIgb2JqZWN0LCBhbmQgd2lsbCBiZSBzdWNjZXNzaXZlbHkgY2FsbGVkIG9uIGFsbCBGaWx0ZXJzIHRvIGJ1aWxkIGFuXG4gICAqIFNWRyBmaWx0ZXIgb2JqZWN0LlxuICAgKi9cbiAgcHVibGljIGFic3RyYWN0IGFwcGx5U1ZHRmlsdGVyKCBzdmdGaWx0ZXI6IFNWR0ZpbHRlckVsZW1lbnQsIGluTmFtZTogc3RyaW5nLCByZXN1bHROYW1lPzogc3RyaW5nICk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgc3BlY2lmaWMgY2FudmFzL2NvbnRleHQgd3JhcHBlciwgdGhpcyBtZXRob2Qgc2hvdWxkIG11dGF0ZSBpdHMgc3RhdGUgc28gdGhhdCB0aGUgY2FudmFzIG5vdyBob2xkcyB0aGVcbiAgICogZmlsdGVyZWQgY29udGVudC4gVXN1YWxseSB0aGlzIHdvdWxkIGJlIGJ5IHVzaW5nIGdldEltYWdlRGF0YS9wdXRJbWFnZURhdGEsIGhvd2V2ZXIgcmVkcmF3aW5nIG9yIG90aGVyIG9wZXJhdGlvbnNcbiAgICogYXJlIGFsc28gcG9zc2libGUuXG4gICAqL1xuICBwdWJsaWMgYWJzdHJhY3QgYXBwbHlDYW52YXNGaWx0ZXIoIHdyYXBwZXI6IENhbnZhc0NvbnRleHRXcmFwcGVyICk6IHZvaWQ7XG5cbiAgcHVibGljIGlzRE9NQ29tcGF0aWJsZSgpOiBib29sZWFuIHtcbiAgICAvLyBUT0RPOiBXZSBjYW4gYnJvd3Nlci1jaGVjayBvbiB0aGluZ3MgbGlrZSBjb2xvciBtYXRyaXg/IEJ1dCB3ZSB3YW50IHRvIGRpc2FsbG93IHRoaW5ncyB0aGF0IHdlIGNhbid0IGd1YXJhbnRlZSB3ZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIC8vIGNhbiBzdXBwb3J0P1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHB1YmxpYyBpc1NWR0NvbXBhdGlibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHVibGljIGlzQ2FudmFzQ29tcGF0aWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gRmVhdHVyZXMuY2FudmFzRmlsdGVyID8gdGhpcy5pc0RPTUNvbXBhdGlibGUoKSA6IGZhbHNlO1xuICB9XG5cbiAgcHVibGljIGlzV2ViR0xDb21wYXRpYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIGZvcm0gb2YgdGhpcyBvYmplY3RcbiAgICovXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmlkO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgYSBjb2xvciBtYXRyaXggZWZmZWN0IGludG8gYW4gZXhpc3RpbmcgU1ZHIGZpbHRlci5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgYXBwbHlDb2xvck1hdHJpeCggbWF0cml4VmFsdWVzOiBzdHJpbmcsIHN2Z0ZpbHRlcjogU1ZHRmlsdGVyRWxlbWVudCwgaW5OYW1lOiBzdHJpbmcsIHJlc3VsdE5hbWU/OiBzdHJpbmcgKTogdm9pZCB7XG4gICAgY29uc3QgZmVDb2xvck1hdHJpeCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggc3ZnbnMsICdmZUNvbG9yTWF0cml4JyApO1xuXG4gICAgZmVDb2xvck1hdHJpeC5zZXRBdHRyaWJ1dGUoICd0eXBlJywgJ21hdHJpeCcgKTtcbiAgICBmZUNvbG9yTWF0cml4LnNldEF0dHJpYnV0ZSggJ3ZhbHVlcycsIG1hdHJpeFZhbHVlcyApO1xuICAgIGZlQ29sb3JNYXRyaXguc2V0QXR0cmlidXRlKCAnaW4nLCBpbk5hbWUgKTtcblxuICAgIC8vIFNpbmNlIHRoZSBET00gZWZmZWN0cyBhcmUgZG9uZSB3aXRoIHNSR0IgYW5kIHdlIGNhbid0IG1hbmlwdWxhdGUgdGhhdCwgd2UnbGwgaW5zdGVhZCBhZGp1c3QgU1ZHIHRvIGFwcGx5IHRoZVxuICAgIC8vIGVmZmVjdHMgaW4gc1JHQiBzbyB0aGF0IHdlIGhhdmUgY29uc2lzdGVuY3lcbiAgICBmZUNvbG9yTWF0cml4LnNldEF0dHJpYnV0ZSggJ2NvbG9yLWludGVycG9sYXRpb24tZmlsdGVycycsICdzUkdCJyApO1xuXG4gICAgaWYgKCByZXN1bHROYW1lICkge1xuICAgICAgZmVDb2xvck1hdHJpeC5zZXRBdHRyaWJ1dGUoICdyZXN1bHQnLCByZXN1bHROYW1lICk7XG4gICAgfVxuICAgIHN2Z0ZpbHRlci5hcHBlbmRDaGlsZCggZmVDb2xvck1hdHJpeCApO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdGaWx0ZXInLCBGaWx0ZXIgKTsiXSwibmFtZXMiOlsiRmVhdHVyZXMiLCJzY2VuZXJ5Iiwic3ZnbnMiLCJnbG9iYWxJZCIsIkZpbHRlciIsImlzRE9NQ29tcGF0aWJsZSIsImlzU1ZHQ29tcGF0aWJsZSIsImlzQ2FudmFzQ29tcGF0aWJsZSIsImNhbnZhc0ZpbHRlciIsImlzV2ViR0xDb21wYXRpYmxlIiwidG9TdHJpbmciLCJpZCIsImFwcGx5Q29sb3JNYXRyaXgiLCJtYXRyaXhWYWx1ZXMiLCJzdmdGaWx0ZXIiLCJpbk5hbWUiLCJyZXN1bHROYW1lIiwiZmVDb2xvck1hdHJpeCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudE5TIiwic2V0QXR0cmlidXRlIiwiYXBwZW5kQ2hpbGQiLCJmaWx0ZXJSZWdpb25QZXJjZW50YWdlSW5jcmVhc2UiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBeUJDLEdBRUQsU0FBK0JBLFFBQVEsRUFBRUMsT0FBTyxFQUFFQyxLQUFLLFFBQVEsZ0JBQWdCO0FBRS9FLElBQUlDLFdBQVc7QUFFQSxJQUFBLEFBQWVDLFNBQWYsTUFBZUE7SUFvQ3JCQyxrQkFBMkI7UUFDaEMsb0tBQW9LO1FBQ3BLLGVBQWU7UUFDZixPQUFPO0lBQ1Q7SUFFT0Msa0JBQTJCO1FBQ2hDLE9BQU87SUFDVDtJQUVPQyxxQkFBOEI7UUFDbkMsT0FBT1AsU0FBU1EsWUFBWSxHQUFHLElBQUksQ0FBQ0gsZUFBZSxLQUFLO0lBQzFEO0lBRU9JLG9CQUE2QjtRQUNsQyxPQUFPO0lBQ1Q7SUFFQTs7R0FFQyxHQUNELEFBQU9DLFdBQW1CO1FBQ3hCLE9BQU8sSUFBSSxDQUFDQyxFQUFFO0lBQ2hCO0lBRUE7O0dBRUMsR0FDRCxPQUFjQyxpQkFBa0JDLFlBQW9CLEVBQUVDLFNBQTJCLEVBQUVDLE1BQWMsRUFBRUMsVUFBbUIsRUFBUztRQUM3SCxNQUFNQyxnQkFBZ0JDLFNBQVNDLGVBQWUsQ0FBRWpCLE9BQU87UUFFdkRlLGNBQWNHLFlBQVksQ0FBRSxRQUFRO1FBQ3BDSCxjQUFjRyxZQUFZLENBQUUsVUFBVVA7UUFDdENJLGNBQWNHLFlBQVksQ0FBRSxNQUFNTDtRQUVsQywrR0FBK0c7UUFDL0csOENBQThDO1FBQzlDRSxjQUFjRyxZQUFZLENBQUUsK0JBQStCO1FBRTNELElBQUtKLFlBQWE7WUFDaEJDLGNBQWNHLFlBQVksQ0FBRSxVQUFVSjtRQUN4QztRQUNBRixVQUFVTyxXQUFXLENBQUVKO0lBQ3pCO0lBdEVBLGFBQXFCO1FBQ25CLElBQUksQ0FBQ04sRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFUixZQUFZO1FBQy9CLElBQUksQ0FBQ21CLDhCQUE4QixHQUFHO0lBQ3hDO0FBb0VGO0FBaEZBLFNBQThCbEIsb0JBZ0Y3QjtBQUVESCxRQUFRc0IsUUFBUSxDQUFFLFVBQVVuQiJ9