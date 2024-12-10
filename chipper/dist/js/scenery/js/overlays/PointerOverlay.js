// Copyright 2013-2024, University of Colorado Boulder
/**
 * The PointerOverlay shows pointer locations in the scene.  This is useful when recording a session for interviews or when a teacher is broadcasting
 * a tablet session on an overhead projector.  See https://github.com/phetsims/scenery/issues/111
 *
 * Each pointer is rendered in a different <svg> so that CSS3 transforms can be used to make performance smooth on iPad.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import Matrix3 from '../../../dot/js/Matrix3.js';
import { PDOMPointer, scenery, svgns, Utils } from '../imports.js';
let PointerOverlay = class PointerOverlay {
    /**
   * Releases references
   */ dispose() {
        this.display._input.pointerAddedEmitter.removeListener(this.pointerAdded);
    }
    /**
   */ update() {
    // Required for type 'TOverlay'
    }
    constructor(display, rootNode){
        this.display = display;
        this.rootNode = rootNode;
        // add element to show the pointers
        this.pointerSVGContainer = document.createElement('div');
        this.pointerSVGContainer.style.position = 'absolute';
        this.pointerSVGContainer.style.top = '0';
        this.pointerSVGContainer.style.left = '0';
        // @ts-expect-error
        this.pointerSVGContainer.style['pointer-events'] = 'none';
        const innerRadius = 10;
        const strokeWidth = 1;
        const diameter = (innerRadius + strokeWidth / 2) * 2;
        const radius = diameter / 2;
        // Resize the parent div when the rootNode is resized
        display.sizeProperty.lazyLink((dimension)=>{
            this.pointerSVGContainer.setAttribute('width', '' + dimension.width);
            this.pointerSVGContainer.setAttribute('height', '' + dimension.height);
            this.pointerSVGContainer.style.clip = `rect(0px,${dimension.width}px,${dimension.height}px,0px)`;
        });
        const scratchMatrix = Matrix3.IDENTITY.copy();
        //Display a pointer that was added.  Use a separate SVG layer for each pointer so it can be hardware accelerated, otherwise it is too slow just setting svg internal attributes
        this.pointerAdded = (pointer)=>{
            const svg = document.createElementNS(svgns, 'svg');
            svg.style.position = 'absolute';
            svg.style.top = '0';
            svg.style.left = '0';
            // @ts-expect-error
            svg.style['pointer-events'] = 'none';
            Utils.prepareForTransform(svg);
            //Fit the size to the display
            svg.setAttribute('width', '' + diameter);
            svg.setAttribute('height', '' + diameter);
            const circle = document.createElementNS(svgns, 'circle');
            //use css transform for performance?
            circle.setAttribute('cx', '' + (innerRadius + strokeWidth / 2));
            circle.setAttribute('cy', '' + (innerRadius + strokeWidth / 2));
            circle.setAttribute('r', '' + innerRadius);
            circle.setAttribute('style', 'fill:black;');
            circle.setAttribute('style', 'stroke:white;');
            circle.setAttribute('opacity', '0.4');
            const updateToPoint = (point)=>Utils.applyPreparedTransform(scratchMatrix.setToTranslation(point.x - radius, point.y - radius), svg);
            //Add a move listener to the pointer to update position when it has moved
            const pointerRemoved = ()=>{
                // For touche-like events that get a touch up event, remove them.  But when the mouse button is released, don't stop
                // showing the mouse location
                if (pointer.isTouchLike()) {
                    this.pointerSVGContainer.removeChild(svg);
                    pointer.removeInputListener(moveListener);
                }
            };
            const moveListener = {
                // Mouse/Touch/Pen
                move: ()=>{
                    pointer.point && updateToPoint(pointer.point);
                },
                up: pointerRemoved,
                cancel: pointerRemoved,
                // PDOMPointer
                focus: ()=>{
                    if (pointer instanceof PDOMPointer && pointer.point) {
                        updateToPoint(pointer.point);
                        this.pointerSVGContainer.appendChild(svg);
                    }
                },
                blur: ()=>{
                    this.pointerSVGContainer.contains(svg) && this.pointerSVGContainer.removeChild(svg);
                }
            };
            pointer.addInputListener(moveListener);
            moveListener.move();
            svg.appendChild(circle);
            this.pointerSVGContainer.appendChild(svg);
        };
        display._input.pointerAddedEmitter.addListener(this.pointerAdded);
        //if there is already a mouse, add it here
        // TODO: if there already other non-mouse touches, could be added here https://github.com/phetsims/scenery/issues/1581
        if (display._input && display._input.mouse) {
            this.pointerAdded(display._input.mouse);
        }
        this.domElement = this.pointerSVGContainer;
    }
};
export { PointerOverlay as default };
scenery.register('PointerOverlay', PointerOverlay);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvb3ZlcmxheXMvUG9pbnRlck92ZXJsYXkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGhlIFBvaW50ZXJPdmVybGF5IHNob3dzIHBvaW50ZXIgbG9jYXRpb25zIGluIHRoZSBzY2VuZS4gIFRoaXMgaXMgdXNlZnVsIHdoZW4gcmVjb3JkaW5nIGEgc2Vzc2lvbiBmb3IgaW50ZXJ2aWV3cyBvciB3aGVuIGEgdGVhY2hlciBpcyBicm9hZGNhc3RpbmdcbiAqIGEgdGFibGV0IHNlc3Npb24gb24gYW4gb3ZlcmhlYWQgcHJvamVjdG9yLiAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xMTFcbiAqXG4gKiBFYWNoIHBvaW50ZXIgaXMgcmVuZGVyZWQgaW4gYSBkaWZmZXJlbnQgPHN2Zz4gc28gdGhhdCBDU1MzIHRyYW5zZm9ybXMgY2FuIGJlIHVzZWQgdG8gbWFrZSBwZXJmb3JtYW5jZSBzbW9vdGggb24gaVBhZC5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCB7IERpc3BsYXksIE5vZGUsIFBET01Qb2ludGVyLCBQb2ludGVyLCBzY2VuZXJ5LCBzdmducywgVE92ZXJsYXksIFV0aWxzIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBvaW50ZXJPdmVybGF5IGltcGxlbWVudHMgVE92ZXJsYXkge1xuXG4gIHByb3RlY3RlZCBkaXNwbGF5OiBEaXNwbGF5O1xuICBwcm90ZWN0ZWQgcm9vdE5vZGU6IE5vZGU7XG5cbiAgcHJvdGVjdGVkIHBvaW50ZXJTVkdDb250YWluZXI6IEhUTUxEaXZFbGVtZW50O1xuXG4gIHB1YmxpYyBkb21FbGVtZW50OiBIVE1MRGl2RWxlbWVudDtcblxuICBwcml2YXRlIHBvaW50ZXJBZGRlZDogKCBwb2ludGVyOiBQb2ludGVyICkgPT4gdm9pZDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGRpc3BsYXk6IERpc3BsYXksIHJvb3ROb2RlOiBOb2RlICkge1xuICAgIHRoaXMuZGlzcGxheSA9IGRpc3BsYXk7XG4gICAgdGhpcy5yb290Tm9kZSA9IHJvb3ROb2RlO1xuXG4gICAgLy8gYWRkIGVsZW1lbnQgdG8gc2hvdyB0aGUgcG9pbnRlcnNcbiAgICB0aGlzLnBvaW50ZXJTVkdDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuICAgIHRoaXMucG9pbnRlclNWR0NvbnRhaW5lci5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgdGhpcy5wb2ludGVyU1ZHQ29udGFpbmVyLnN0eWxlLnRvcCA9ICcwJztcbiAgICB0aGlzLnBvaW50ZXJTVkdDb250YWluZXIuc3R5bGUubGVmdCA9ICcwJztcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgdGhpcy5wb2ludGVyU1ZHQ29udGFpbmVyLnN0eWxlWyAncG9pbnRlci1ldmVudHMnIF0gPSAnbm9uZSc7XG5cbiAgICBjb25zdCBpbm5lclJhZGl1cyA9IDEwO1xuICAgIGNvbnN0IHN0cm9rZVdpZHRoID0gMTtcbiAgICBjb25zdCBkaWFtZXRlciA9ICggaW5uZXJSYWRpdXMgKyBzdHJva2VXaWR0aCAvIDIgKSAqIDI7XG4gICAgY29uc3QgcmFkaXVzID0gZGlhbWV0ZXIgLyAyO1xuXG4gICAgLy8gUmVzaXplIHRoZSBwYXJlbnQgZGl2IHdoZW4gdGhlIHJvb3ROb2RlIGlzIHJlc2l6ZWRcbiAgICBkaXNwbGF5LnNpemVQcm9wZXJ0eS5sYXp5TGluayggZGltZW5zaW9uID0+IHtcbiAgICAgIHRoaXMucG9pbnRlclNWR0NvbnRhaW5lci5zZXRBdHRyaWJ1dGUoICd3aWR0aCcsICcnICsgZGltZW5zaW9uLndpZHRoICk7XG4gICAgICB0aGlzLnBvaW50ZXJTVkdDb250YWluZXIuc2V0QXR0cmlidXRlKCAnaGVpZ2h0JywgJycgKyBkaW1lbnNpb24uaGVpZ2h0ICk7XG4gICAgICB0aGlzLnBvaW50ZXJTVkdDb250YWluZXIuc3R5bGUuY2xpcCA9IGByZWN0KDBweCwke2RpbWVuc2lvbi53aWR0aH1weCwke2RpbWVuc2lvbi5oZWlnaHR9cHgsMHB4KWA7XG4gICAgfSApO1xuXG4gICAgY29uc3Qgc2NyYXRjaE1hdHJpeCA9IE1hdHJpeDMuSURFTlRJVFkuY29weSgpO1xuXG4gICAgLy9EaXNwbGF5IGEgcG9pbnRlciB0aGF0IHdhcyBhZGRlZC4gIFVzZSBhIHNlcGFyYXRlIFNWRyBsYXllciBmb3IgZWFjaCBwb2ludGVyIHNvIGl0IGNhbiBiZSBoYXJkd2FyZSBhY2NlbGVyYXRlZCwgb3RoZXJ3aXNlIGl0IGlzIHRvbyBzbG93IGp1c3Qgc2V0dGluZyBzdmcgaW50ZXJuYWwgYXR0cmlidXRlc1xuICAgIHRoaXMucG9pbnRlckFkZGVkID0gKCBwb2ludGVyOiBQb2ludGVyICkgPT4ge1xuXG4gICAgICBjb25zdCBzdmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIHN2Z25zLCAnc3ZnJyApO1xuICAgICAgc3ZnLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgIHN2Zy5zdHlsZS50b3AgPSAnMCc7XG4gICAgICBzdmcuc3R5bGUubGVmdCA9ICcwJztcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgIHN2Zy5zdHlsZVsgJ3BvaW50ZXItZXZlbnRzJyBdID0gJ25vbmUnO1xuXG4gICAgICBVdGlscy5wcmVwYXJlRm9yVHJhbnNmb3JtKCBzdmcgKTtcblxuICAgICAgLy9GaXQgdGhlIHNpemUgdG8gdGhlIGRpc3BsYXlcbiAgICAgIHN2Zy5zZXRBdHRyaWJ1dGUoICd3aWR0aCcsICcnICsgZGlhbWV0ZXIgKTtcbiAgICAgIHN2Zy5zZXRBdHRyaWJ1dGUoICdoZWlnaHQnLCAnJyArIGRpYW1ldGVyICk7XG5cbiAgICAgIGNvbnN0IGNpcmNsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggc3ZnbnMsICdjaXJjbGUnICk7XG5cbiAgICAgIC8vdXNlIGNzcyB0cmFuc2Zvcm0gZm9yIHBlcmZvcm1hbmNlP1xuICAgICAgY2lyY2xlLnNldEF0dHJpYnV0ZSggJ2N4JywgJycgKyAoIGlubmVyUmFkaXVzICsgc3Ryb2tlV2lkdGggLyAyICkgKTtcbiAgICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoICdjeScsICcnICsgKCBpbm5lclJhZGl1cyArIHN0cm9rZVdpZHRoIC8gMiApICk7XG4gICAgICBjaXJjbGUuc2V0QXR0cmlidXRlKCAncicsICcnICsgaW5uZXJSYWRpdXMgKTtcbiAgICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoICdzdHlsZScsICdmaWxsOmJsYWNrOycgKTtcbiAgICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoICdzdHlsZScsICdzdHJva2U6d2hpdGU7JyApO1xuICAgICAgY2lyY2xlLnNldEF0dHJpYnV0ZSggJ29wYWNpdHknLCAnMC40JyApO1xuXG4gICAgICBjb25zdCB1cGRhdGVUb1BvaW50ID0gKCBwb2ludDogVmVjdG9yMiApID0+IFV0aWxzLmFwcGx5UHJlcGFyZWRUcmFuc2Zvcm0oIHNjcmF0Y2hNYXRyaXguc2V0VG9UcmFuc2xhdGlvbiggcG9pbnQueCAtIHJhZGl1cywgcG9pbnQueSAtIHJhZGl1cyApLCBzdmcgKTtcblxuICAgICAgLy9BZGQgYSBtb3ZlIGxpc3RlbmVyIHRvIHRoZSBwb2ludGVyIHRvIHVwZGF0ZSBwb3NpdGlvbiB3aGVuIGl0IGhhcyBtb3ZlZFxuICAgICAgY29uc3QgcG9pbnRlclJlbW92ZWQgPSAoKSA9PiB7XG5cbiAgICAgICAgLy8gRm9yIHRvdWNoZS1saWtlIGV2ZW50cyB0aGF0IGdldCBhIHRvdWNoIHVwIGV2ZW50LCByZW1vdmUgdGhlbS4gIEJ1dCB3aGVuIHRoZSBtb3VzZSBidXR0b24gaXMgcmVsZWFzZWQsIGRvbid0IHN0b3BcbiAgICAgICAgLy8gc2hvd2luZyB0aGUgbW91c2UgbG9jYXRpb25cbiAgICAgICAgaWYgKCBwb2ludGVyLmlzVG91Y2hMaWtlKCkgKSB7XG4gICAgICAgICAgdGhpcy5wb2ludGVyU1ZHQ29udGFpbmVyLnJlbW92ZUNoaWxkKCBzdmcgKTtcbiAgICAgICAgICBwb2ludGVyLnJlbW92ZUlucHV0TGlzdGVuZXIoIG1vdmVMaXN0ZW5lciApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY29uc3QgbW92ZUxpc3RlbmVyID0ge1xuXG4gICAgICAgIC8vIE1vdXNlL1RvdWNoL1BlblxuICAgICAgICBtb3ZlOiAoKSA9PiB7XG4gICAgICAgICAgcG9pbnRlci5wb2ludCAmJiB1cGRhdGVUb1BvaW50KCBwb2ludGVyLnBvaW50ICk7XG4gICAgICAgIH0sXG4gICAgICAgIHVwOiBwb2ludGVyUmVtb3ZlZCxcbiAgICAgICAgY2FuY2VsOiBwb2ludGVyUmVtb3ZlZCxcblxuICAgICAgICAvLyBQRE9NUG9pbnRlclxuICAgICAgICBmb2N1czogKCkgPT4ge1xuICAgICAgICAgIGlmICggcG9pbnRlciBpbnN0YW5jZW9mIFBET01Qb2ludGVyICYmIHBvaW50ZXIucG9pbnQgKSB7XG4gICAgICAgICAgICB1cGRhdGVUb1BvaW50KCBwb2ludGVyLnBvaW50ICk7XG4gICAgICAgICAgICB0aGlzLnBvaW50ZXJTVkdDb250YWluZXIuYXBwZW5kQ2hpbGQoIHN2ZyApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgYmx1cjogKCkgPT4ge1xuICAgICAgICAgIHRoaXMucG9pbnRlclNWR0NvbnRhaW5lci5jb250YWlucyggc3ZnICkgJiYgdGhpcy5wb2ludGVyU1ZHQ29udGFpbmVyLnJlbW92ZUNoaWxkKCBzdmcgKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHBvaW50ZXIuYWRkSW5wdXRMaXN0ZW5lciggbW92ZUxpc3RlbmVyICk7XG5cbiAgICAgIG1vdmVMaXN0ZW5lci5tb3ZlKCk7XG4gICAgICBzdmcuYXBwZW5kQ2hpbGQoIGNpcmNsZSApO1xuICAgICAgdGhpcy5wb2ludGVyU1ZHQ29udGFpbmVyLmFwcGVuZENoaWxkKCBzdmcgKTtcbiAgICB9O1xuICAgIGRpc3BsYXkuX2lucHV0IS5wb2ludGVyQWRkZWRFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLnBvaW50ZXJBZGRlZCApO1xuXG4gICAgLy9pZiB0aGVyZSBpcyBhbHJlYWR5IGEgbW91c2UsIGFkZCBpdCBoZXJlXG4gICAgLy8gVE9ETzogaWYgdGhlcmUgYWxyZWFkeSBvdGhlciBub24tbW91c2UgdG91Y2hlcywgY291bGQgYmUgYWRkZWQgaGVyZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIGlmICggZGlzcGxheS5faW5wdXQgJiYgZGlzcGxheS5faW5wdXQubW91c2UgKSB7XG4gICAgICB0aGlzLnBvaW50ZXJBZGRlZCggZGlzcGxheS5faW5wdXQubW91c2UgKTtcbiAgICB9XG5cbiAgICB0aGlzLmRvbUVsZW1lbnQgPSB0aGlzLnBvaW50ZXJTVkdDb250YWluZXI7XG4gIH1cblxuICAvKipcbiAgICogUmVsZWFzZXMgcmVmZXJlbmNlc1xuICAgKi9cbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwbGF5Ll9pbnB1dCEucG9pbnRlckFkZGVkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5wb2ludGVyQWRkZWQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKi9cbiAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICAvLyBSZXF1aXJlZCBmb3IgdHlwZSAnVE92ZXJsYXknXG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ1BvaW50ZXJPdmVybGF5JywgUG9pbnRlck92ZXJsYXkgKTsiXSwibmFtZXMiOlsiTWF0cml4MyIsIlBET01Qb2ludGVyIiwic2NlbmVyeSIsInN2Z25zIiwiVXRpbHMiLCJQb2ludGVyT3ZlcmxheSIsImRpc3Bvc2UiLCJkaXNwbGF5IiwiX2lucHV0IiwicG9pbnRlckFkZGVkRW1pdHRlciIsInJlbW92ZUxpc3RlbmVyIiwicG9pbnRlckFkZGVkIiwidXBkYXRlIiwicm9vdE5vZGUiLCJwb2ludGVyU1ZHQ29udGFpbmVyIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwic3R5bGUiLCJwb3NpdGlvbiIsInRvcCIsImxlZnQiLCJpbm5lclJhZGl1cyIsInN0cm9rZVdpZHRoIiwiZGlhbWV0ZXIiLCJyYWRpdXMiLCJzaXplUHJvcGVydHkiLCJsYXp5TGluayIsImRpbWVuc2lvbiIsInNldEF0dHJpYnV0ZSIsIndpZHRoIiwiaGVpZ2h0IiwiY2xpcCIsInNjcmF0Y2hNYXRyaXgiLCJJREVOVElUWSIsImNvcHkiLCJwb2ludGVyIiwic3ZnIiwiY3JlYXRlRWxlbWVudE5TIiwicHJlcGFyZUZvclRyYW5zZm9ybSIsImNpcmNsZSIsInVwZGF0ZVRvUG9pbnQiLCJwb2ludCIsImFwcGx5UHJlcGFyZWRUcmFuc2Zvcm0iLCJzZXRUb1RyYW5zbGF0aW9uIiwieCIsInkiLCJwb2ludGVyUmVtb3ZlZCIsImlzVG91Y2hMaWtlIiwicmVtb3ZlQ2hpbGQiLCJyZW1vdmVJbnB1dExpc3RlbmVyIiwibW92ZUxpc3RlbmVyIiwibW92ZSIsInVwIiwiY2FuY2VsIiwiZm9jdXMiLCJhcHBlbmRDaGlsZCIsImJsdXIiLCJjb250YWlucyIsImFkZElucHV0TGlzdGVuZXIiLCJhZGRMaXN0ZW5lciIsIm1vdXNlIiwiZG9tRWxlbWVudCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Q0FPQyxHQUVELE9BQU9BLGFBQWEsNkJBQTZCO0FBRWpELFNBQXdCQyxXQUFXLEVBQVdDLE9BQU8sRUFBRUMsS0FBSyxFQUFZQyxLQUFLLFFBQVEsZ0JBQWdCO0FB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