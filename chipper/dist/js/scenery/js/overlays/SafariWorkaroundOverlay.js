// Copyright 2022-2024, University of Colorado Boulder
/**
 * Tricks Safari into forcing SVG rendering, see https://github.com/phetsims/geometric-optics-basics/issues/31
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import dotRandom from '../../../dot/js/dotRandom.js';
import { scenery, svgns } from '../imports.js';
let SafariWorkaroundOverlay = class SafariWorkaroundOverlay {
    update() {
        const random = dotRandom.nextDouble();
        // Position the rectangle to take up the full display width/height EXCEPT for being eroded by a random
        // less-than-pixel amount.
        this.rect.setAttribute('x', '' + random);
        this.rect.setAttribute('y', '' + random);
        this.rect.setAttribute('style', 'fill: rgba(255,200,100,0); stroke: none;');
        if (this.display.width) {
            this.rect.setAttribute('width', '' + (this.display.width - random * 2));
        }
        if (this.display.height) {
            this.rect.setAttribute('height', '' + (this.display.height - random * 2));
        }
    }
    constructor(display){
        this.display = display;
        // Create an SVG element that will be in front
        const svg = document.createElementNS(svgns, 'svg');
        this.domElement = svg;
        svg.style.position = 'absolute';
        svg.setAttribute('class', 'safari-workaround');
        svg.style.top = '0';
        svg.style.left = '0';
        // @ts-expect-error
        svg.style['pointer-events'] = 'none';
        // Make sure it covers our full size
        display.sizeProperty.link((dimension)=>{
            svg.setAttribute('width', '' + dimension.width);
            svg.setAttribute('height', '' + dimension.height);
            svg.style.clip = `rect(0px,${dimension.width}px,${dimension.height}px,0px)`;
        });
        this.rect = document.createElementNS(svgns, 'rect');
        svg.appendChild(this.rect);
        this.update();
    }
};
export { SafariWorkaroundOverlay as default };
scenery.register('SafariWorkaroundOverlay', SafariWorkaroundOverlay);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvb3ZlcmxheXMvU2FmYXJpV29ya2Fyb3VuZE92ZXJsYXkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVHJpY2tzIFNhZmFyaSBpbnRvIGZvcmNpbmcgU1ZHIHJlbmRlcmluZywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9nZW9tZXRyaWMtb3B0aWNzLWJhc2ljcy9pc3N1ZXMvMzFcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcbmltcG9ydCB7IERpc3BsYXksIHNjZW5lcnksIHN2Z25zLCBUT3ZlcmxheSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTYWZhcmlXb3JrYXJvdW5kT3ZlcmxheSBpbXBsZW1lbnRzIFRPdmVybGF5IHtcblxuICBwdWJsaWMgZG9tRWxlbWVudDogU1ZHRWxlbWVudDtcbiAgcHJpdmF0ZSByZWN0OiBTVkdQYXRoRWxlbWVudDtcbiAgcHJpdmF0ZSBkaXNwbGF5OiBEaXNwbGF5O1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZGlzcGxheTogRGlzcGxheSApIHtcblxuICAgIHRoaXMuZGlzcGxheSA9IGRpc3BsYXk7XG5cbiAgICAvLyBDcmVhdGUgYW4gU1ZHIGVsZW1lbnQgdGhhdCB3aWxsIGJlIGluIGZyb250XG4gICAgY29uc3Qgc3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBzdmducywgJ3N2ZycgKTtcbiAgICB0aGlzLmRvbUVsZW1lbnQgPSBzdmc7XG4gICAgc3ZnLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICBzdmcuc2V0QXR0cmlidXRlKCAnY2xhc3MnLCAnc2FmYXJpLXdvcmthcm91bmQnICk7XG4gICAgc3ZnLnN0eWxlLnRvcCA9ICcwJztcbiAgICBzdmcuc3R5bGUubGVmdCA9ICcwJztcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgc3ZnLnN0eWxlWyAncG9pbnRlci1ldmVudHMnIF0gPSAnbm9uZSc7XG5cbiAgICAvLyBNYWtlIHN1cmUgaXQgY292ZXJzIG91ciBmdWxsIHNpemVcbiAgICBkaXNwbGF5LnNpemVQcm9wZXJ0eS5saW5rKCBkaW1lbnNpb24gPT4ge1xuICAgICAgc3ZnLnNldEF0dHJpYnV0ZSggJ3dpZHRoJywgJycgKyBkaW1lbnNpb24ud2lkdGggKTtcbiAgICAgIHN2Zy5zZXRBdHRyaWJ1dGUoICdoZWlnaHQnLCAnJyArIGRpbWVuc2lvbi5oZWlnaHQgKTtcbiAgICAgIHN2Zy5zdHlsZS5jbGlwID0gYHJlY3QoMHB4LCR7ZGltZW5zaW9uLndpZHRofXB4LCR7ZGltZW5zaW9uLmhlaWdodH1weCwwcHgpYDtcbiAgICB9ICk7XG5cbiAgICB0aGlzLnJlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIHN2Z25zLCAncmVjdCcgKTtcblxuICAgIHN2Zy5hcHBlbmRDaGlsZCggdGhpcy5yZWN0ICk7XG5cbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICBjb25zdCByYW5kb20gPSBkb3RSYW5kb20ubmV4dERvdWJsZSgpO1xuXG4gICAgLy8gUG9zaXRpb24gdGhlIHJlY3RhbmdsZSB0byB0YWtlIHVwIHRoZSBmdWxsIGRpc3BsYXkgd2lkdGgvaGVpZ2h0IEVYQ0VQVCBmb3IgYmVpbmcgZXJvZGVkIGJ5IGEgcmFuZG9tXG4gICAgLy8gbGVzcy10aGFuLXBpeGVsIGFtb3VudC5cbiAgICB0aGlzLnJlY3Quc2V0QXR0cmlidXRlKCAneCcsICcnICsgcmFuZG9tICk7XG4gICAgdGhpcy5yZWN0LnNldEF0dHJpYnV0ZSggJ3knLCAnJyArIHJhbmRvbSApO1xuICAgIHRoaXMucmVjdC5zZXRBdHRyaWJ1dGUoICdzdHlsZScsICdmaWxsOiByZ2JhKDI1NSwyMDAsMTAwLDApOyBzdHJva2U6IG5vbmU7JyApO1xuICAgIGlmICggdGhpcy5kaXNwbGF5LndpZHRoICkge1xuICAgICAgdGhpcy5yZWN0LnNldEF0dHJpYnV0ZSggJ3dpZHRoJywgJycgKyAoIHRoaXMuZGlzcGxheS53aWR0aCAtIHJhbmRvbSAqIDIgKSApO1xuICAgIH1cbiAgICBpZiAoIHRoaXMuZGlzcGxheS5oZWlnaHQgKSB7XG4gICAgICB0aGlzLnJlY3Quc2V0QXR0cmlidXRlKCAnaGVpZ2h0JywgJycgKyAoIHRoaXMuZGlzcGxheS5oZWlnaHQgLSByYW5kb20gKiAyICkgKTtcbiAgICB9XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ1NhZmFyaVdvcmthcm91bmRPdmVybGF5JywgU2FmYXJpV29ya2Fyb3VuZE92ZXJsYXkgKTsiXSwibmFtZXMiOlsiZG90UmFuZG9tIiwic2NlbmVyeSIsInN2Z25zIiwiU2FmYXJpV29ya2Fyb3VuZE92ZXJsYXkiLCJ1cGRhdGUiLCJyYW5kb20iLCJuZXh0RG91YmxlIiwicmVjdCIsInNldEF0dHJpYnV0ZSIsImRpc3BsYXkiLCJ3aWR0aCIsImhlaWdodCIsInN2ZyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudE5TIiwiZG9tRWxlbWVudCIsInN0eWxlIiwicG9zaXRpb24iLCJ0b3AiLCJsZWZ0Iiwic2l6ZVByb3BlcnR5IiwibGluayIsImRpbWVuc2lvbiIsImNsaXAiLCJhcHBlbmRDaGlsZCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGVBQWUsK0JBQStCO0FBQ3JELFNBQWtCQyxPQUFPLEVBQUVDLEtBQUssUUFBa0IsZ0JBQWdCO0FBRW5ELElBQUEsQUFBTUMsMEJBQU4sTUFBTUE7SUFrQ1pDLFNBQWU7UUFDcEIsTUFBTUMsU0FBU0wsVUFBVU0sVUFBVTtRQUVuQyxzR0FBc0c7UUFDdEcsMEJBQTBCO1FBQzFCLElBQUksQ0FBQ0MsSUFBSSxDQUFDQyxZQUFZLENBQUUsS0FBSyxLQUFLSDtRQUNsQyxJQUFJLENBQUNFLElBQUksQ0FBQ0MsWUFBWSxDQUFFLEtBQUssS0FBS0g7UUFDbEMsSUFBSSxDQUFDRSxJQUFJLENBQUNDLFlBQVksQ0FBRSxTQUFTO1FBQ2pDLElBQUssSUFBSSxDQUFDQyxPQUFPLENBQUNDLEtBQUssRUFBRztZQUN4QixJQUFJLENBQUNILElBQUksQ0FBQ0MsWUFBWSxDQUFFLFNBQVMsS0FBTyxDQUFBLElBQUksQ0FBQ0MsT0FBTyxDQUFDQyxLQUFLLEdBQUdMLFNBQVMsQ0FBQTtRQUN4RTtRQUNBLElBQUssSUFBSSxDQUFDSSxPQUFPLENBQUNFLE1BQU0sRUFBRztZQUN6QixJQUFJLENBQUNKLElBQUksQ0FBQ0MsWUFBWSxDQUFFLFVBQVUsS0FBTyxDQUFBLElBQUksQ0FBQ0MsT0FBTyxDQUFDRSxNQUFNLEdBQUdOLFNBQVMsQ0FBQTtRQUMxRTtJQUNGO0lBMUNBLFlBQW9CSSxPQUFnQixDQUFHO1FBRXJDLElBQUksQ0FBQ0EsT0FBTyxHQUFHQTtRQUVmLDhDQUE4QztRQUM5QyxNQUFNRyxNQUFNQyxTQUFTQyxlQUFlLENBQUVaLE9BQU87UUFDN0MsSUFBSSxDQUFDYSxVQUFVLEdBQUdIO1FBQ2xCQSxJQUFJSSxLQUFLLENBQUNDLFFBQVEsR0FBRztRQUNyQkwsSUFBSUosWUFBWSxDQUFFLFNBQVM7UUFDM0JJLElBQUlJLEtBQUssQ0FBQ0UsR0FBRyxHQUFHO1FBQ2hCTixJQUFJSSxLQUFLLENBQUNHLElBQUksR0FBRztRQUNqQixtQkFBbUI7UUFDbkJQLElBQUlJLEtBQUssQ0FBRSxpQkFBa0IsR0FBRztRQUVoQyxvQ0FBb0M7UUFDcENQLFFBQVFXLFlBQVksQ0FBQ0MsSUFBSSxDQUFFQyxDQUFBQTtZQUN6QlYsSUFBSUosWUFBWSxDQUFFLFNBQVMsS0FBS2MsVUFBVVosS0FBSztZQUMvQ0UsSUFBSUosWUFBWSxDQUFFLFVBQVUsS0FBS2MsVUFBVVgsTUFBTTtZQUNqREMsSUFBSUksS0FBSyxDQUFDTyxJQUFJLEdBQUcsQ0FBQyxTQUFTLEVBQUVELFVBQVVaLEtBQUssQ0FBQyxHQUFHLEVBQUVZLFVBQVVYLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDN0U7UUFFQSxJQUFJLENBQUNKLElBQUksR0FBR00sU0FBU0MsZUFBZSxDQUFFWixPQUFPO1FBRTdDVSxJQUFJWSxXQUFXLENBQUUsSUFBSSxDQUFDakIsSUFBSTtRQUUxQixJQUFJLENBQUNILE1BQU07SUFDYjtBQWlCRjtBQWpEQSxTQUFxQkQscUNBaURwQjtBQUVERixRQUFRd0IsUUFBUSxDQUFFLDJCQUEyQnRCIn0=