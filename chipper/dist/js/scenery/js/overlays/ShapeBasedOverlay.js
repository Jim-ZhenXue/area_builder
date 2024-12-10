// Copyright 2013-2024, University of Colorado Boulder
/**
 * Supertype for overlays that display colored shapes (updated every frame).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { scenery, svgns } from '../imports.js';
let ShapeBasedOverlay = class ShapeBasedOverlay {
    addShape(shape, color, isOffset) {
        const path = document.createElementNS(svgns, 'path');
        let svgPath = shape.getSVGPath();
        // temporary workaround for https://bugs.webkit.org/show_bug.cgi?id=78980
        // and http://code.google.com/p/chromium/issues/detail?id=231626 where even removing
        // the attribute can cause this bug
        if (!svgPath) {
            svgPath = 'M0 0';
        }
        if (svgPath) {
            // only set the SVG path if it's not the empty string
            path.setAttribute('d', svgPath);
        } else if (path.hasAttribute('d')) {
            path.removeAttribute('d');
        }
        path.setAttribute('style', `fill: none; stroke: ${color}; stroke-dasharray: 5, 3; stroke-dashoffset: ${isOffset ? 5 : 0}; stroke-width: 3;`);
        this.svg.appendChild(path);
    }
    update() {
        while(this.svg.childNodes.length){
            this.svg.removeChild(this.svg.childNodes[this.svg.childNodes.length - 1]);
        }
        this.addShapes();
    }
    /**
   * Releases references
   */ dispose() {
    // Nothing to dispose
    }
    constructor(display, rootNode, name){
        this.display = display;
        this.rootNode = rootNode;
        const svg = document.createElementNS(svgns, 'svg');
        svg.style.position = 'absolute';
        svg.setAttribute('class', name);
        svg.style.top = '0';
        svg.style.left = '0';
        // @ts-expect-error
        svg.style['pointer-events'] = 'none';
        this.svg = svg;
        function resize(width, height) {
            svg.setAttribute('width', '' + width);
            svg.setAttribute('height', '' + height);
            svg.style.clip = `rect(0px,${width}px,${height}px,0px)`;
        }
        display.sizeProperty.link((dimension)=>{
            resize(dimension.width, dimension.height);
        });
        this.domElement = svg;
    }
};
export { ShapeBasedOverlay as default };
scenery.register('ShapeBasedOverlay', ShapeBasedOverlay);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvb3ZlcmxheXMvU2hhcGVCYXNlZE92ZXJsYXkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogU3VwZXJ0eXBlIGZvciBvdmVybGF5cyB0aGF0IGRpc3BsYXkgY29sb3JlZCBzaGFwZXMgKHVwZGF0ZWQgZXZlcnkgZnJhbWUpLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgeyBEaXNwbGF5LCBOb2RlLCBzY2VuZXJ5LCBzdmducywgVE92ZXJsYXkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgU2hhcGVCYXNlZE92ZXJsYXkgaW1wbGVtZW50cyBUT3ZlcmxheSB7XG5cbiAgcHJvdGVjdGVkIGRpc3BsYXk6IERpc3BsYXk7XG4gIHByb3RlY3RlZCByb290Tm9kZTogTm9kZTtcbiAgcHJvdGVjdGVkIHN2ZzogU1ZHRWxlbWVudDtcbiAgcHVibGljIGRvbUVsZW1lbnQ6IFNWR0VsZW1lbnQ7XG5cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKCBkaXNwbGF5OiBEaXNwbGF5LCByb290Tm9kZTogTm9kZSwgbmFtZTogc3RyaW5nICkge1xuICAgIHRoaXMuZGlzcGxheSA9IGRpc3BsYXk7XG4gICAgdGhpcy5yb290Tm9kZSA9IHJvb3ROb2RlO1xuXG4gICAgY29uc3Qgc3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBzdmducywgJ3N2ZycgKTtcbiAgICBzdmcuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoICdjbGFzcycsIG5hbWUgKTtcbiAgICBzdmcuc3R5bGUudG9wID0gJzAnO1xuICAgIHN2Zy5zdHlsZS5sZWZ0ID0gJzAnO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICBzdmcuc3R5bGVbICdwb2ludGVyLWV2ZW50cycgXSA9ICdub25lJztcbiAgICB0aGlzLnN2ZyA9IHN2ZztcblxuICAgIGZ1bmN0aW9uIHJlc2l6ZSggd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgKTogdm9pZCB7XG4gICAgICBzdmcuc2V0QXR0cmlidXRlKCAnd2lkdGgnLCAnJyArIHdpZHRoICk7XG4gICAgICBzdmcuc2V0QXR0cmlidXRlKCAnaGVpZ2h0JywgJycgKyBoZWlnaHQgKTtcbiAgICAgIHN2Zy5zdHlsZS5jbGlwID0gYHJlY3QoMHB4LCR7d2lkdGh9cHgsJHtoZWlnaHR9cHgsMHB4KWA7XG4gICAgfVxuXG4gICAgZGlzcGxheS5zaXplUHJvcGVydHkubGluayggZGltZW5zaW9uID0+IHtcbiAgICAgIHJlc2l6ZSggZGltZW5zaW9uLndpZHRoLCBkaW1lbnNpb24uaGVpZ2h0ICk7XG4gICAgfSApO1xuXG4gICAgdGhpcy5kb21FbGVtZW50ID0gc3ZnO1xuICB9XG5cbiAgcHVibGljIGFkZFNoYXBlKCBzaGFwZTogU2hhcGUsIGNvbG9yOiBzdHJpbmcsIGlzT2Zmc2V0OiBib29sZWFuICk6IHZvaWQge1xuICAgIGNvbnN0IHBhdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIHN2Z25zLCAncGF0aCcgKTtcbiAgICBsZXQgc3ZnUGF0aCA9IHNoYXBlLmdldFNWR1BhdGgoKTtcblxuICAgIC8vIHRlbXBvcmFyeSB3b3JrYXJvdW5kIGZvciBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Nzg5ODBcbiAgICAvLyBhbmQgaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MjMxNjI2IHdoZXJlIGV2ZW4gcmVtb3ZpbmdcbiAgICAvLyB0aGUgYXR0cmlidXRlIGNhbiBjYXVzZSB0aGlzIGJ1Z1xuICAgIGlmICggIXN2Z1BhdGggKSB7IHN2Z1BhdGggPSAnTTAgMCc7IH1cblxuICAgIGlmICggc3ZnUGF0aCApIHtcbiAgICAgIC8vIG9ubHkgc2V0IHRoZSBTVkcgcGF0aCBpZiBpdCdzIG5vdCB0aGUgZW1wdHkgc3RyaW5nXG4gICAgICBwYXRoLnNldEF0dHJpYnV0ZSggJ2QnLCBzdmdQYXRoICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBwYXRoLmhhc0F0dHJpYnV0ZSggJ2QnICkgKSB7XG4gICAgICBwYXRoLnJlbW92ZUF0dHJpYnV0ZSggJ2QnICk7XG4gICAgfVxuXG4gICAgcGF0aC5zZXRBdHRyaWJ1dGUoICdzdHlsZScsIGBmaWxsOiBub25lOyBzdHJva2U6ICR7Y29sb3J9OyBzdHJva2UtZGFzaGFycmF5OiA1LCAzOyBzdHJva2UtZGFzaG9mZnNldDogJHtpc09mZnNldCA/IDUgOiAwfTsgc3Ryb2tlLXdpZHRoOiAzO2AgKTtcbiAgICB0aGlzLnN2Zy5hcHBlbmRDaGlsZCggcGF0aCApO1xuICB9XG5cbiAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICB3aGlsZSAoIHRoaXMuc3ZnLmNoaWxkTm9kZXMubGVuZ3RoICkge1xuICAgICAgdGhpcy5zdmcucmVtb3ZlQ2hpbGQoIHRoaXMuc3ZnLmNoaWxkTm9kZXNbIHRoaXMuc3ZnLmNoaWxkTm9kZXMubGVuZ3RoIC0gMSBdICk7XG4gICAgfVxuXG4gICAgdGhpcy5hZGRTaGFwZXMoKTtcbiAgfVxuXG4gIHB1YmxpYyBhYnN0cmFjdCBhZGRTaGFwZXMoKTogdm9pZDtcblxuICAvKipcbiAgICogUmVsZWFzZXMgcmVmZXJlbmNlc1xuICAgKi9cbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgLy8gTm90aGluZyB0byBkaXNwb3NlXG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ1NoYXBlQmFzZWRPdmVybGF5JywgU2hhcGVCYXNlZE92ZXJsYXkgKTsiXSwibmFtZXMiOlsic2NlbmVyeSIsInN2Z25zIiwiU2hhcGVCYXNlZE92ZXJsYXkiLCJhZGRTaGFwZSIsInNoYXBlIiwiY29sb3IiLCJpc09mZnNldCIsInBhdGgiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnROUyIsInN2Z1BhdGgiLCJnZXRTVkdQYXRoIiwic2V0QXR0cmlidXRlIiwiaGFzQXR0cmlidXRlIiwicmVtb3ZlQXR0cmlidXRlIiwic3ZnIiwiYXBwZW5kQ2hpbGQiLCJ1cGRhdGUiLCJjaGlsZE5vZGVzIiwibGVuZ3RoIiwicmVtb3ZlQ2hpbGQiLCJhZGRTaGFwZXMiLCJkaXNwb3NlIiwiZGlzcGxheSIsInJvb3ROb2RlIiwibmFtZSIsInN0eWxlIiwicG9zaXRpb24iLCJ0b3AiLCJsZWZ0IiwicmVzaXplIiwid2lkdGgiLCJoZWlnaHQiLCJjbGlwIiwic2l6ZVByb3BlcnR5IiwibGluayIsImRpbWVuc2lvbiIsImRvbUVsZW1lbnQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FHRCxTQUF3QkEsT0FBTyxFQUFFQyxLQUFLLFFBQWtCLGdCQUFnQjtBQUV6RCxJQUFBLEFBQWVDLG9CQUFmLE1BQWVBO0lBaUNyQkMsU0FBVUMsS0FBWSxFQUFFQyxLQUFhLEVBQUVDLFFBQWlCLEVBQVM7UUFDdEUsTUFBTUMsT0FBT0MsU0FBU0MsZUFBZSxDQUFFUixPQUFPO1FBQzlDLElBQUlTLFVBQVVOLE1BQU1PLFVBQVU7UUFFOUIseUVBQXlFO1FBQ3pFLG9GQUFvRjtRQUNwRixtQ0FBbUM7UUFDbkMsSUFBSyxDQUFDRCxTQUFVO1lBQUVBLFVBQVU7UUFBUTtRQUVwQyxJQUFLQSxTQUFVO1lBQ2IscURBQXFEO1lBQ3JESCxLQUFLSyxZQUFZLENBQUUsS0FBS0Y7UUFDMUIsT0FDSyxJQUFLSCxLQUFLTSxZQUFZLENBQUUsTUFBUTtZQUNuQ04sS0FBS08sZUFBZSxDQUFFO1FBQ3hCO1FBRUFQLEtBQUtLLFlBQVksQ0FBRSxTQUFTLENBQUMsb0JBQW9CLEVBQUVQLE1BQU0sNkNBQTZDLEVBQUVDLFdBQVcsSUFBSSxFQUFFLGtCQUFrQixDQUFDO1FBQzVJLElBQUksQ0FBQ1MsR0FBRyxDQUFDQyxXQUFXLENBQUVUO0lBQ3hCO0lBRU9VLFNBQWU7UUFDcEIsTUFBUSxJQUFJLENBQUNGLEdBQUcsQ0FBQ0csVUFBVSxDQUFDQyxNQUFNLENBQUc7WUFDbkMsSUFBSSxDQUFDSixHQUFHLENBQUNLLFdBQVcsQ0FBRSxJQUFJLENBQUNMLEdBQUcsQ0FBQ0csVUFBVSxDQUFFLElBQUksQ0FBQ0gsR0FBRyxDQUFDRyxVQUFVLENBQUNDLE1BQU0sR0FBRyxFQUFHO1FBQzdFO1FBRUEsSUFBSSxDQUFDRSxTQUFTO0lBQ2hCO0lBSUE7O0dBRUMsR0FDRCxBQUFPQyxVQUFnQjtJQUNyQixxQkFBcUI7SUFDdkI7SUE5REEsWUFBdUJDLE9BQWdCLEVBQUVDLFFBQWMsRUFBRUMsSUFBWSxDQUFHO1FBQ3RFLElBQUksQ0FBQ0YsT0FBTyxHQUFHQTtRQUNmLElBQUksQ0FBQ0MsUUFBUSxHQUFHQTtRQUVoQixNQUFNVCxNQUFNUCxTQUFTQyxlQUFlLENBQUVSLE9BQU87UUFDN0NjLElBQUlXLEtBQUssQ0FBQ0MsUUFBUSxHQUFHO1FBQ3JCWixJQUFJSCxZQUFZLENBQUUsU0FBU2E7UUFDM0JWLElBQUlXLEtBQUssQ0FBQ0UsR0FBRyxHQUFHO1FBQ2hCYixJQUFJVyxLQUFLLENBQUNHLElBQUksR0FBRztRQUNqQixtQkFBbUI7UUFDbkJkLElBQUlXLEtBQUssQ0FBRSxpQkFBa0IsR0FBRztRQUNoQyxJQUFJLENBQUNYLEdBQUcsR0FBR0E7UUFFWCxTQUFTZSxPQUFRQyxLQUFhLEVBQUVDLE1BQWM7WUFDNUNqQixJQUFJSCxZQUFZLENBQUUsU0FBUyxLQUFLbUI7WUFDaENoQixJQUFJSCxZQUFZLENBQUUsVUFBVSxLQUFLb0I7WUFDakNqQixJQUFJVyxLQUFLLENBQUNPLElBQUksR0FBRyxDQUFDLFNBQVMsRUFBRUYsTUFBTSxHQUFHLEVBQUVDLE9BQU8sT0FBTyxDQUFDO1FBQ3pEO1FBRUFULFFBQVFXLFlBQVksQ0FBQ0MsSUFBSSxDQUFFQyxDQUFBQTtZQUN6Qk4sT0FBUU0sVUFBVUwsS0FBSyxFQUFFSyxVQUFVSixNQUFNO1FBQzNDO1FBRUEsSUFBSSxDQUFDSyxVQUFVLEdBQUd0QjtJQUNwQjtBQXVDRjtBQXRFQSxTQUE4QmIsK0JBc0U3QjtBQUVERixRQUFRc0MsUUFBUSxDQUFFLHFCQUFxQnBDIn0=