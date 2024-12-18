// Copyright 2017-2024, University of Colorado Boulder
/**
 * An octagonal, red stop sign node with a white internal border
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import { Node, Path } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import sceneryPhet from './sceneryPhet.js';
// constants
const NUMBER_OF_SIDES = 8;
let StopSignNode = class StopSignNode extends Node {
    constructor(providedOptions){
        const options = optionize()({
            // SelfOptions
            fillRadius: 23,
            innerStrokeWidth: 2,
            outerStrokeWidth: 1,
            fill: 'red',
            innerStroke: 'white',
            outerStroke: 'black',
            // NodeOptions
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'StopSignNode'
        }, providedOptions);
        options.children = [
            createStopSignPath(options.outerStroke, options.fillRadius + options.innerStrokeWidth + options.outerStrokeWidth),
            createStopSignPath(options.innerStroke, options.fillRadius + options.innerStrokeWidth),
            createStopSignPath(options.fill, options.fillRadius)
        ];
        super(options);
    }
};
export { StopSignNode as default };
function createStopSignPath(fill, radius) {
    return new Path(Shape.regularPolygon(NUMBER_OF_SIDES, radius), {
        fill: fill,
        rotation: Math.PI / NUMBER_OF_SIDES,
        // To support centering when stacked in z-order
        centerX: 0,
        centerY: 0
    });
}
sceneryPhet.register('StopSignNode', StopSignNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TdG9wU2lnbk5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQW4gb2N0YWdvbmFsLCByZWQgc3RvcCBzaWduIG5vZGUgd2l0aCBhIHdoaXRlIGludGVybmFsIGJvcmRlclxuICpcbiAqIEBhdXRob3IgRGVuemVsbCBCYXJuZXR0IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IHsgTm9kZSwgTm9kZU9wdGlvbnMsIFBhdGgsIFRDb2xvciB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IE5VTUJFUl9PRl9TSURFUyA9IDg7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIGZpbGxSYWRpdXM/OiBudW1iZXI7XG4gIGlubmVyU3Ryb2tlV2lkdGg/OiBudW1iZXI7XG4gIG91dGVyU3Ryb2tlV2lkdGg/OiBudW1iZXI7XG4gIGZpbGw/OiBUQ29sb3I7XG4gIGlubmVyU3Ryb2tlPzogVENvbG9yO1xuICBvdXRlclN0cm9rZT86IFRDb2xvcjtcbn07XG5cbmV4cG9ydCB0eXBlIFN0b3BTaWduTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8Tm9kZU9wdGlvbnMsICdjaGlsZHJlbic+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdG9wU2lnbk5vZGUgZXh0ZW5kcyBOb2RlIHtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IFN0b3BTaWduTm9kZU9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFN0b3BTaWduTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyBTZWxmT3B0aW9uc1xuICAgICAgZmlsbFJhZGl1czogMjMsXG4gICAgICBpbm5lclN0cm9rZVdpZHRoOiAyLFxuICAgICAgb3V0ZXJTdHJva2VXaWR0aDogMSxcbiAgICAgIGZpbGw6ICdyZWQnLFxuICAgICAgaW5uZXJTdHJva2U6ICd3aGl0ZScsXG4gICAgICBvdXRlclN0cm9rZTogJ2JsYWNrJyxcblxuICAgICAgLy8gTm9kZU9wdGlvbnNcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELFxuICAgICAgdGFuZGVtTmFtZVN1ZmZpeDogJ1N0b3BTaWduTm9kZSdcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbXG4gICAgICBjcmVhdGVTdG9wU2lnblBhdGgoIG9wdGlvbnMub3V0ZXJTdHJva2UsIG9wdGlvbnMuZmlsbFJhZGl1cyArIG9wdGlvbnMuaW5uZXJTdHJva2VXaWR0aCArIG9wdGlvbnMub3V0ZXJTdHJva2VXaWR0aCApLFxuICAgICAgY3JlYXRlU3RvcFNpZ25QYXRoKCBvcHRpb25zLmlubmVyU3Ryb2tlLCBvcHRpb25zLmZpbGxSYWRpdXMgKyBvcHRpb25zLmlubmVyU3Ryb2tlV2lkdGggKSxcbiAgICAgIGNyZWF0ZVN0b3BTaWduUGF0aCggb3B0aW9ucy5maWxsLCBvcHRpb25zLmZpbGxSYWRpdXMgKVxuICAgIF07XG5cbiAgICBzdXBlciggb3B0aW9ucyApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN0b3BTaWduUGF0aCggZmlsbDogVENvbG9yLCByYWRpdXM6IG51bWJlciApOiBQYXRoIHtcbiAgcmV0dXJuIG5ldyBQYXRoKCBTaGFwZS5yZWd1bGFyUG9seWdvbiggTlVNQkVSX09GX1NJREVTLCByYWRpdXMgKSwge1xuICAgIGZpbGw6IGZpbGwsXG4gICAgcm90YXRpb246IE1hdGguUEkgLyBOVU1CRVJfT0ZfU0lERVMsXG5cbiAgICAvLyBUbyBzdXBwb3J0IGNlbnRlcmluZyB3aGVuIHN0YWNrZWQgaW4gei1vcmRlclxuICAgIGNlbnRlclg6IDAsXG4gICAgY2VudGVyWTogMFxuICB9ICk7XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnU3RvcFNpZ25Ob2RlJywgU3RvcFNpZ25Ob2RlICk7Il0sIm5hbWVzIjpbIlNoYXBlIiwib3B0aW9uaXplIiwiTm9kZSIsIlBhdGgiLCJUYW5kZW0iLCJzY2VuZXJ5UGhldCIsIk5VTUJFUl9PRl9TSURFUyIsIlN0b3BTaWduTm9kZSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJmaWxsUmFkaXVzIiwiaW5uZXJTdHJva2VXaWR0aCIsIm91dGVyU3Ryb2tlV2lkdGgiLCJmaWxsIiwiaW5uZXJTdHJva2UiLCJvdXRlclN0cm9rZSIsInRhbmRlbSIsIlJFUVVJUkVEIiwidGFuZGVtTmFtZVN1ZmZpeCIsImNoaWxkcmVuIiwiY3JlYXRlU3RvcFNpZ25QYXRoIiwicmFkaXVzIiwicmVndWxhclBvbHlnb24iLCJyb3RhdGlvbiIsIk1hdGgiLCJQSSIsImNlbnRlclgiLCJjZW50ZXJZIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELFNBQVNBLEtBQUssUUFBUSwyQkFBMkI7QUFDakQsT0FBT0MsZUFBZSxrQ0FBa0M7QUFFeEQsU0FBU0MsSUFBSSxFQUFlQyxJQUFJLFFBQWdCLDhCQUE4QjtBQUM5RSxPQUFPQyxZQUFZLDRCQUE0QjtBQUMvQyxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBRTNDLFlBQVk7QUFDWixNQUFNQyxrQkFBa0I7QUFhVCxJQUFBLEFBQU1DLGVBQU4sTUFBTUEscUJBQXFCTDtJQUV4QyxZQUFvQk0sZUFBcUMsQ0FBRztRQUUxRCxNQUFNQyxVQUFVUixZQUE0RDtZQUUxRSxjQUFjO1lBQ2RTLFlBQVk7WUFDWkMsa0JBQWtCO1lBQ2xCQyxrQkFBa0I7WUFDbEJDLE1BQU07WUFDTkMsYUFBYTtZQUNiQyxhQUFhO1lBRWIsY0FBYztZQUNkQyxRQUFRWixPQUFPYSxRQUFRO1lBQ3ZCQyxrQkFBa0I7UUFDcEIsR0FBR1Y7UUFFSEMsUUFBUVUsUUFBUSxHQUFHO1lBQ2pCQyxtQkFBb0JYLFFBQVFNLFdBQVcsRUFBRU4sUUFBUUMsVUFBVSxHQUFHRCxRQUFRRSxnQkFBZ0IsR0FBR0YsUUFBUUcsZ0JBQWdCO1lBQ2pIUSxtQkFBb0JYLFFBQVFLLFdBQVcsRUFBRUwsUUFBUUMsVUFBVSxHQUFHRCxRQUFRRSxnQkFBZ0I7WUFDdEZTLG1CQUFvQlgsUUFBUUksSUFBSSxFQUFFSixRQUFRQyxVQUFVO1NBQ3JEO1FBRUQsS0FBSyxDQUFFRDtJQUNUO0FBQ0Y7QUEzQkEsU0FBcUJGLDBCQTJCcEI7QUFFRCxTQUFTYSxtQkFBb0JQLElBQVksRUFBRVEsTUFBYztJQUN2RCxPQUFPLElBQUlsQixLQUFNSCxNQUFNc0IsY0FBYyxDQUFFaEIsaUJBQWlCZSxTQUFVO1FBQ2hFUixNQUFNQTtRQUNOVSxVQUFVQyxLQUFLQyxFQUFFLEdBQUduQjtRQUVwQiwrQ0FBK0M7UUFDL0NvQixTQUFTO1FBQ1RDLFNBQVM7SUFDWDtBQUNGO0FBRUF0QixZQUFZdUIsUUFBUSxDQUFFLGdCQUFnQnJCIn0=