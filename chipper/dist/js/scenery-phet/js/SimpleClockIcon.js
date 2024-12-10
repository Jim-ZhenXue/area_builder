// Copyright 2013-2024, University of Colorado Boulder
/**
 * Scenery node that represents a simple, non-interactive clock.  It is
 * intended for use in situations where an icon representing time is needed.
 *
 * @author John Blanco
 */ import optionize from '../../phet-core/js/optionize.js';
import { Circle, Line, Node } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
let SimpleClockIcon = class SimpleClockIcon extends Node {
    constructor(radius, providedOptions){
        super();
        const options = optionize()({
            // SelfOptions
            fill: 'white',
            stroke: 'black',
            lineWidth: 2
        }, providedOptions);
        this.addChild(new Circle(radius, options));
        this.addChild(new Circle(radius * 0.15, {
            fill: options.stroke
        }));
        const lineOptionsForClockHands = {
            stroke: options.stroke,
            lineWidth: options.lineWidth,
            lineCap: 'round',
            lineJoin: 'round'
        };
        // Hands at 4 o'clock
        this.addChild(new Line(0, 0, 0, -radius * 0.75, lineOptionsForClockHands));
        this.addChild(new Line(0, 0, radius * 0.45, radius * 0.3, lineOptionsForClockHands));
        this.centerX = radius;
        this.centerY = radius;
        this.mutate(options);
    }
};
export { SimpleClockIcon as default };
sceneryPhet.register('SimpleClockIcon', SimpleClockIcon);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TaW1wbGVDbG9ja0ljb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogU2NlbmVyeSBub2RlIHRoYXQgcmVwcmVzZW50cyBhIHNpbXBsZSwgbm9uLWludGVyYWN0aXZlIGNsb2NrLiAgSXQgaXNcbiAqIGludGVuZGVkIGZvciB1c2UgaW4gc2l0dWF0aW9ucyB3aGVyZSBhbiBpY29uIHJlcHJlc2VudGluZyB0aW1lIGlzIG5lZWRlZC5cbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXG4gKi9cblxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCB7IENpcmNsZSwgTGluZSwgTGluZU9wdGlvbnMsIE5vZGUsIE5vZGVPcHRpb25zLCBUUGFpbnQgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICBmaWxsPzogVFBhaW50O1xuICBzdHJva2U/OiBUUGFpbnQ7XG4gIGxpbmVXaWR0aD86IG51bWJlcjtcbn07XG5cbmV4cG9ydCB0eXBlIFNpbXBsZUNsb2NrSWNvbk9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIE5vZGVPcHRpb25zO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaW1wbGVDbG9ja0ljb24gZXh0ZW5kcyBOb2RlIHtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHJhZGl1czogbnVtYmVyLCBwcm92aWRlZE9wdGlvbnM/OiBTaW1wbGVDbG9ja0ljb25PcHRpb25zICkge1xuXG4gICAgc3VwZXIoKTtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U2ltcGxlQ2xvY2tJY29uT3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIFNlbGZPcHRpb25zXG4gICAgICBmaWxsOiAnd2hpdGUnLFxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxuICAgICAgbGluZVdpZHRoOiAyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgQ2lyY2xlKCByYWRpdXMsIG9wdGlvbnMgKSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBDaXJjbGUoIHJhZGl1cyAqIDAuMTUsIHsgZmlsbDogb3B0aW9ucy5zdHJva2UgfSApICk7XG4gICAgY29uc3QgbGluZU9wdGlvbnNGb3JDbG9ja0hhbmRzOiBMaW5lT3B0aW9ucyA9IHtcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5zdHJva2UsXG4gICAgICBsaW5lV2lkdGg6IG9wdGlvbnMubGluZVdpZHRoLFxuICAgICAgbGluZUNhcDogJ3JvdW5kJyxcbiAgICAgIGxpbmVKb2luOiAncm91bmQnXG4gICAgfTtcblxuICAgIC8vIEhhbmRzIGF0IDQgbydjbG9ja1xuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBMaW5lKCAwLCAwLCAwLCAtcmFkaXVzICogMC43NSwgbGluZU9wdGlvbnNGb3JDbG9ja0hhbmRzICkgKTtcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgTGluZSggMCwgMCwgcmFkaXVzICogMC40NSwgcmFkaXVzICogMC4zLCBsaW5lT3B0aW9uc0ZvckNsb2NrSGFuZHMgKSApO1xuICAgIHRoaXMuY2VudGVyWCA9IHJhZGl1cztcbiAgICB0aGlzLmNlbnRlclkgPSByYWRpdXM7XG5cbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnU2ltcGxlQ2xvY2tJY29uJywgU2ltcGxlQ2xvY2tJY29uICk7Il0sIm5hbWVzIjpbIm9wdGlvbml6ZSIsIkNpcmNsZSIsIkxpbmUiLCJOb2RlIiwic2NlbmVyeVBoZXQiLCJTaW1wbGVDbG9ja0ljb24iLCJyYWRpdXMiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiZmlsbCIsInN0cm9rZSIsImxpbmVXaWR0aCIsImFkZENoaWxkIiwibGluZU9wdGlvbnNGb3JDbG9ja0hhbmRzIiwibGluZUNhcCIsImxpbmVKb2luIiwiY2VudGVyWCIsImNlbnRlclkiLCJtdXRhdGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EsZUFBZSxrQ0FBa0M7QUFDeEQsU0FBU0MsTUFBTSxFQUFFQyxJQUFJLEVBQWVDLElBQUksUUFBNkIsOEJBQThCO0FBQ25HLE9BQU9DLGlCQUFpQixtQkFBbUI7QUFVNUIsSUFBQSxBQUFNQyxrQkFBTixNQUFNQSx3QkFBd0JGO0lBRTNDLFlBQW9CRyxNQUFjLEVBQUVDLGVBQXdDLENBQUc7UUFFN0UsS0FBSztRQUVMLE1BQU1DLFVBQVVSLFlBQStEO1lBRTdFLGNBQWM7WUFDZFMsTUFBTTtZQUNOQyxRQUFRO1lBQ1JDLFdBQVc7UUFDYixHQUFHSjtRQUVILElBQUksQ0FBQ0ssUUFBUSxDQUFFLElBQUlYLE9BQVFLLFFBQVFFO1FBQ25DLElBQUksQ0FBQ0ksUUFBUSxDQUFFLElBQUlYLE9BQVFLLFNBQVMsTUFBTTtZQUFFRyxNQUFNRCxRQUFRRSxNQUFNO1FBQUM7UUFDakUsTUFBTUcsMkJBQXdDO1lBQzVDSCxRQUFRRixRQUFRRSxNQUFNO1lBQ3RCQyxXQUFXSCxRQUFRRyxTQUFTO1lBQzVCRyxTQUFTO1lBQ1RDLFVBQVU7UUFDWjtRQUVBLHFCQUFxQjtRQUNyQixJQUFJLENBQUNILFFBQVEsQ0FBRSxJQUFJVixLQUFNLEdBQUcsR0FBRyxHQUFHLENBQUNJLFNBQVMsTUFBTU87UUFDbEQsSUFBSSxDQUFDRCxRQUFRLENBQUUsSUFBSVYsS0FBTSxHQUFHLEdBQUdJLFNBQVMsTUFBTUEsU0FBUyxLQUFLTztRQUM1RCxJQUFJLENBQUNHLE9BQU8sR0FBR1Y7UUFDZixJQUFJLENBQUNXLE9BQU8sR0FBR1g7UUFFZixJQUFJLENBQUNZLE1BQU0sQ0FBRVY7SUFDZjtBQUNGO0FBL0JBLFNBQXFCSCw2QkErQnBCO0FBRURELFlBQVllLFFBQVEsQ0FBRSxtQkFBbUJkIn0=