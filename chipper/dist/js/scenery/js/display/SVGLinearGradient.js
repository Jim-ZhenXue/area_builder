// Copyright 2017-2024, University of Colorado Boulder
/**
 * Controller that creates and keeps an SVG linear gradient up-to-date with a Scenery LinearGradient
 *
 * SVG gradients, see http://www.w3.org/TR/SVG/pservers.html
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Pool from '../../../phet-core/js/Pool.js';
import { scenery, SVGGradient, svgns } from '../imports.js';
let SVGLinearGradient = class SVGLinearGradient extends SVGGradient {
    initialize(svgBlock, gradient) {
        sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGLinearGradient] initialize ${gradient.id}`);
        sceneryLog && sceneryLog.Paints && sceneryLog.push();
        super.initialize(svgBlock, gradient);
        // seems we need the defs: http://stackoverflow.com/questions/7614209/linear-gradients-in-svg-without-defs
        // SVG: spreadMethod 'pad' 'reflect' 'repeat' - find Canvas usage
        /* Approximate example of what we are creating:
     <linearGradient id="grad2" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
     <stop offset="0" style="stop-color:rgb(255,255,0);stop-opacity:1" />
     <stop offset="0.5" style="stop-color:rgba(255,255,0,0);stop-opacity:0" />
     <stop offset="1" style="stop-color:rgb(255,0,0);stop-opacity:1" />
     </linearGradient>
     */ // Linear-specific setup
        const linearGradient = gradient;
        this.definition.setAttribute('x1', '' + linearGradient.start.x);
        this.definition.setAttribute('y1', '' + linearGradient.start.y);
        this.definition.setAttribute('x2', '' + linearGradient.end.x);
        this.definition.setAttribute('y2', '' + linearGradient.end.y);
        sceneryLog && sceneryLog.Paints && sceneryLog.pop();
        return this;
    }
    /**
   * Creates the gradient-type-specific definition.
   */ createDefinition() {
        return document.createElementNS(svgns, 'linearGradient');
    }
    freeToPool() {
        SVGLinearGradient.pool.freeToPool(this);
    }
    constructor(svgBlock, gradient){
        super(svgBlock, gradient);
    }
};
SVGLinearGradient.pool = new Pool(SVGLinearGradient);
export { SVGLinearGradient as default };
scenery.register('SVGLinearGradient', SVGLinearGradient);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9TVkdMaW5lYXJHcmFkaWVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDb250cm9sbGVyIHRoYXQgY3JlYXRlcyBhbmQga2VlcHMgYW4gU1ZHIGxpbmVhciBncmFkaWVudCB1cC10by1kYXRlIHdpdGggYSBTY2VuZXJ5IExpbmVhckdyYWRpZW50XG4gKlxuICogU1ZHIGdyYWRpZW50cywgc2VlIGh0dHA6Ly93d3cudzMub3JnL1RSL1NWRy9wc2VydmVycy5odG1sXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBQb29sLCB7IFRQb29sYWJsZSB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9Qb29sLmpzJztcbmltcG9ydCB7IExpbmVhckdyYWRpZW50LCBzY2VuZXJ5LCBTVkdCbG9jaywgU1ZHR3JhZGllbnQsIHN2Z25zIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNWR0xpbmVhckdyYWRpZW50IGV4dGVuZHMgU1ZHR3JhZGllbnQgaW1wbGVtZW50cyBUUG9vbGFibGUge1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc3ZnQmxvY2s6IFNWR0Jsb2NrLCBncmFkaWVudDogTGluZWFyR3JhZGllbnQgKSB7XG4gICAgc3VwZXIoIHN2Z0Jsb2NrLCBncmFkaWVudCApO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGluaXRpYWxpemUoIHN2Z0Jsb2NrOiBTVkdCbG9jaywgZ3JhZGllbnQ6IExpbmVhckdyYWRpZW50ICk6IHRoaXMge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5QYWludHMoIGBbU1ZHTGluZWFyR3JhZGllbnRdIGluaXRpYWxpemUgJHtncmFkaWVudC5pZH1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIHN1cGVyLmluaXRpYWxpemUoIHN2Z0Jsb2NrLCBncmFkaWVudCApO1xuXG4gICAgLy8gc2VlbXMgd2UgbmVlZCB0aGUgZGVmczogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy83NjE0MjA5L2xpbmVhci1ncmFkaWVudHMtaW4tc3ZnLXdpdGhvdXQtZGVmc1xuICAgIC8vIFNWRzogc3ByZWFkTWV0aG9kICdwYWQnICdyZWZsZWN0JyAncmVwZWF0JyAtIGZpbmQgQ2FudmFzIHVzYWdlXG5cbiAgICAvKiBBcHByb3hpbWF0ZSBleGFtcGxlIG9mIHdoYXQgd2UgYXJlIGNyZWF0aW5nOlxuICAgICA8bGluZWFyR3JhZGllbnQgaWQ9XCJncmFkMlwiIHgxPVwiMFwiIHkxPVwiMFwiIHgyPVwiMTAwXCIgeTI9XCIwXCIgZ3JhZGllbnRVbml0cz1cInVzZXJTcGFjZU9uVXNlXCI+XG4gICAgIDxzdG9wIG9mZnNldD1cIjBcIiBzdHlsZT1cInN0b3AtY29sb3I6cmdiKDI1NSwyNTUsMCk7c3RvcC1vcGFjaXR5OjFcIiAvPlxuICAgICA8c3RvcCBvZmZzZXQ9XCIwLjVcIiBzdHlsZT1cInN0b3AtY29sb3I6cmdiYSgyNTUsMjU1LDAsMCk7c3RvcC1vcGFjaXR5OjBcIiAvPlxuICAgICA8c3RvcCBvZmZzZXQ9XCIxXCIgc3R5bGU9XCJzdG9wLWNvbG9yOnJnYigyNTUsMCwwKTtzdG9wLW9wYWNpdHk6MVwiIC8+XG4gICAgIDwvbGluZWFyR3JhZGllbnQ+XG4gICAgICovXG5cbiAgICAvLyBMaW5lYXItc3BlY2lmaWMgc2V0dXBcbiAgICBjb25zdCBsaW5lYXJHcmFkaWVudCA9IGdyYWRpZW50IGFzIHVua25vd24gYXMgTGluZWFyR3JhZGllbnQ7XG4gICAgdGhpcy5kZWZpbml0aW9uLnNldEF0dHJpYnV0ZSggJ3gxJywgJycgKyBsaW5lYXJHcmFkaWVudC5zdGFydC54ICk7XG4gICAgdGhpcy5kZWZpbml0aW9uLnNldEF0dHJpYnV0ZSggJ3kxJywgJycgKyBsaW5lYXJHcmFkaWVudC5zdGFydC55ICk7XG4gICAgdGhpcy5kZWZpbml0aW9uLnNldEF0dHJpYnV0ZSggJ3gyJywgJycgKyBsaW5lYXJHcmFkaWVudC5lbmQueCApO1xuICAgIHRoaXMuZGVmaW5pdGlvbi5zZXRBdHRyaWJ1dGUoICd5MicsICcnICsgbGluZWFyR3JhZGllbnQuZW5kLnkgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5wb3AoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgdGhlIGdyYWRpZW50LXR5cGUtc3BlY2lmaWMgZGVmaW5pdGlvbi5cbiAgICovXG4gIHByb3RlY3RlZCBjcmVhdGVEZWZpbml0aW9uKCk6IFNWR0xpbmVhckdyYWRpZW50RWxlbWVudCB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggc3ZnbnMsICdsaW5lYXJHcmFkaWVudCcgKTtcbiAgfVxuXG4gIHB1YmxpYyBmcmVlVG9Qb29sKCk6IHZvaWQge1xuICAgIFNWR0xpbmVhckdyYWRpZW50LnBvb2wuZnJlZVRvUG9vbCggdGhpcyApO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBwb29sID0gbmV3IFBvb2woIFNWR0xpbmVhckdyYWRpZW50ICk7XG59XG5zY2VuZXJ5LnJlZ2lzdGVyKCAnU1ZHTGluZWFyR3JhZGllbnQnLCBTVkdMaW5lYXJHcmFkaWVudCApOyJdLCJuYW1lcyI6WyJQb29sIiwic2NlbmVyeSIsIlNWR0dyYWRpZW50Iiwic3ZnbnMiLCJTVkdMaW5lYXJHcmFkaWVudCIsImluaXRpYWxpemUiLCJzdmdCbG9jayIsImdyYWRpZW50Iiwic2NlbmVyeUxvZyIsIlBhaW50cyIsImlkIiwicHVzaCIsImxpbmVhckdyYWRpZW50IiwiZGVmaW5pdGlvbiIsInNldEF0dHJpYnV0ZSIsInN0YXJ0IiwieCIsInkiLCJlbmQiLCJwb3AiLCJjcmVhdGVEZWZpbml0aW9uIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50TlMiLCJmcmVlVG9Qb29sIiwicG9vbCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBRUQsT0FBT0EsVUFBeUIsZ0NBQWdDO0FBQ2hFLFNBQXlCQyxPQUFPLEVBQVlDLFdBQVcsRUFBRUMsS0FBSyxRQUFRLGdCQUFnQjtBQUV2RSxJQUFBLEFBQU1DLG9CQUFOLE1BQU1BLDBCQUEwQkY7SUFNN0JHLFdBQVlDLFFBQWtCLEVBQUVDLFFBQXdCLEVBQVM7UUFDL0VDLGNBQWNBLFdBQVdDLE1BQU0sSUFBSUQsV0FBV0MsTUFBTSxDQUFFLENBQUMsK0JBQStCLEVBQUVGLFNBQVNHLEVBQUUsRUFBRTtRQUNyR0YsY0FBY0EsV0FBV0MsTUFBTSxJQUFJRCxXQUFXRyxJQUFJO1FBRWxELEtBQUssQ0FBQ04sV0FBWUMsVUFBVUM7UUFFNUIsMEdBQTBHO1FBQzFHLGlFQUFpRTtRQUVqRTs7Ozs7O0tBTUMsR0FFRCx3QkFBd0I7UUFDeEIsTUFBTUssaUJBQWlCTDtRQUN2QixJQUFJLENBQUNNLFVBQVUsQ0FBQ0MsWUFBWSxDQUFFLE1BQU0sS0FBS0YsZUFBZUcsS0FBSyxDQUFDQyxDQUFDO1FBQy9ELElBQUksQ0FBQ0gsVUFBVSxDQUFDQyxZQUFZLENBQUUsTUFBTSxLQUFLRixlQUFlRyxLQUFLLENBQUNFLENBQUM7UUFDL0QsSUFBSSxDQUFDSixVQUFVLENBQUNDLFlBQVksQ0FBRSxNQUFNLEtBQUtGLGVBQWVNLEdBQUcsQ0FBQ0YsQ0FBQztRQUM3RCxJQUFJLENBQUNILFVBQVUsQ0FBQ0MsWUFBWSxDQUFFLE1BQU0sS0FBS0YsZUFBZU0sR0FBRyxDQUFDRCxDQUFDO1FBRTdEVCxjQUFjQSxXQUFXQyxNQUFNLElBQUlELFdBQVdXLEdBQUc7UUFFakQsT0FBTyxJQUFJO0lBQ2I7SUFFQTs7R0FFQyxHQUNELEFBQVVDLG1CQUE2QztRQUNyRCxPQUFPQyxTQUFTQyxlQUFlLENBQUVuQixPQUFPO0lBQzFDO0lBRU9vQixhQUFtQjtRQUN4Qm5CLGtCQUFrQm9CLElBQUksQ0FBQ0QsVUFBVSxDQUFFLElBQUk7SUFDekM7SUExQ0EsWUFBb0JqQixRQUFrQixFQUFFQyxRQUF3QixDQUFHO1FBQ2pFLEtBQUssQ0FBRUQsVUFBVUM7SUFDbkI7QUEyQ0Y7QUEvQ3FCSCxrQkE4Q0lvQixPQUFPLElBQUl4QixLQUFNSTtBQTlDMUMsU0FBcUJBLCtCQStDcEI7QUFDREgsUUFBUXdCLFFBQVEsQ0FBRSxxQkFBcUJyQiJ9