// Copyright 2017-2024, University of Colorado Boulder
/**
 * MoveToTrashButton is a push button whose icon means 'move to trash'.
 * The arrow can be color-coded to the thing being deleted by setting options.arrowColor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import InstanceRegistry from '../../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../../phet-core/js/optionize.js';
import { Node, Path } from '../../../scenery/js/imports.js';
import trashAltRegularShape from '../../../sherpa/js/fontawesome-5/trashAltRegularShape.js';
import RectangularPushButton from '../../../sun/js/buttons/RectangularPushButton.js';
import CurvedArrowShape from '../CurvedArrowShape.js';
import sceneryPhet from '../sceneryPhet.js';
let MoveToTrashButton = class MoveToTrashButton extends RectangularPushButton {
    constructor(providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        const options = optionize()({
            // MoveToTrashButtonOptions
            arrowColor: 'black',
            iconScale: 0.46
        }, providedOptions);
        const trashNode = new Path(trashAltRegularShape, {
            fill: 'black',
            scale: 0.08
        });
        const arrowShape = new CurvedArrowShape(10, -0.9 * Math.PI, -0.2 * Math.PI, {
            headWidth: 12,
            tailWidth: 4
        });
        const arrowPath = new Path(arrowShape, {
            fill: options.arrowColor,
            right: trashNode.left + 0.75 * trashNode.width,
            bottom: trashNode.top
        });
        options.content = new Node({
            children: [
                trashNode,
                arrowPath
            ],
            scale: options.iconScale
        });
        super(options);
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'MoveToTrashButton', this);
    }
};
export { MoveToTrashButton as default };
sceneryPhet.register('MoveToTrashButton', MoveToTrashButton);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL01vdmVUb1RyYXNoQnV0dG9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIE1vdmVUb1RyYXNoQnV0dG9uIGlzIGEgcHVzaCBidXR0b24gd2hvc2UgaWNvbiBtZWFucyAnbW92ZSB0byB0cmFzaCcuXG4gKiBUaGUgYXJyb3cgY2FuIGJlIGNvbG9yLWNvZGVkIHRvIHRoZSB0aGluZyBiZWluZyBkZWxldGVkIGJ5IHNldHRpbmcgb3B0aW9ucy5hcnJvd0NvbG9yLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IEluc3RhbmNlUmVnaXN0cnkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2RvY3VtZW50YXRpb24vSW5zdGFuY2VSZWdpc3RyeS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IHsgTm9kZSwgUGF0aCwgVENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCB0cmFzaEFsdFJlZ3VsYXJTaGFwZSBmcm9tICcuLi8uLi8uLi9zaGVycGEvanMvZm9udGF3ZXNvbWUtNS90cmFzaEFsdFJlZ3VsYXJTaGFwZS5qcyc7XG5pbXBvcnQgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uLCB7IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclB1c2hCdXR0b24uanMnO1xuaW1wb3J0IEN1cnZlZEFycm93U2hhcGUgZnJvbSAnLi4vQ3VydmVkQXJyb3dTaGFwZS5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vc2NlbmVyeVBoZXQuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICBhcnJvd0NvbG9yPzogVENvbG9yO1xuICBpY29uU2NhbGU/OiBudW1iZXI7XG59O1xuXG5leHBvcnQgdHlwZSBNb3ZlVG9UcmFzaEJ1dHRvbk9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8UmVjdGFuZ3VsYXJQdXNoQnV0dG9uT3B0aW9ucywgJ2NvbnRlbnQnPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW92ZVRvVHJhc2hCdXR0b24gZXh0ZW5kcyBSZWN0YW5ndWxhclB1c2hCdXR0b24ge1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogTW92ZVRvVHJhc2hCdXR0b25PcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxNb3ZlVG9UcmFzaEJ1dHRvbk9wdGlvbnMsIFNlbGZPcHRpb25zLCBSZWN0YW5ndWxhclB1c2hCdXR0b25PcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIE1vdmVUb1RyYXNoQnV0dG9uT3B0aW9uc1xuICAgICAgYXJyb3dDb2xvcjogJ2JsYWNrJyxcblxuICAgICAgaWNvblNjYWxlOiAwLjQ2XG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBjb25zdCB0cmFzaE5vZGUgPSBuZXcgUGF0aCggdHJhc2hBbHRSZWd1bGFyU2hhcGUsIHtcbiAgICAgIGZpbGw6ICdibGFjaycsXG4gICAgICBzY2FsZTogMC4wOFxuICAgIH0gKTtcblxuICAgIGNvbnN0IGFycm93U2hhcGUgPSBuZXcgQ3VydmVkQXJyb3dTaGFwZSggMTAsIC0wLjkgKiBNYXRoLlBJLCAtMC4yICogTWF0aC5QSSwge1xuICAgICAgaGVhZFdpZHRoOiAxMixcbiAgICAgIHRhaWxXaWR0aDogNFxuICAgIH0gKTtcblxuICAgIGNvbnN0IGFycm93UGF0aCA9IG5ldyBQYXRoKCBhcnJvd1NoYXBlLCB7XG4gICAgICBmaWxsOiBvcHRpb25zLmFycm93Q29sb3IsXG4gICAgICByaWdodDogdHJhc2hOb2RlLmxlZnQgKyAoIDAuNzUgKiB0cmFzaE5vZGUud2lkdGggKSwgLy8gYSBiaXQgdG8gdGhlIGxlZnQgb2YgY2VudGVyXG4gICAgICBib3R0b206IHRyYXNoTm9kZS50b3BcbiAgICB9ICk7XG5cbiAgICBvcHRpb25zLmNvbnRlbnQgPSBuZXcgTm9kZSgge1xuICAgICAgY2hpbGRyZW46IFsgdHJhc2hOb2RlLCBhcnJvd1BhdGggXSxcbiAgICAgIHNjYWxlOiBvcHRpb25zLmljb25TY2FsZVxuICAgIH0gKTtcblxuICAgIHN1cGVyKCBvcHRpb25zICk7XG5cbiAgICAvLyBzdXBwb3J0IGZvciBiaW5kZXIgZG9jdW1lbnRhdGlvbiwgc3RyaXBwZWQgb3V0IGluIGJ1aWxkcyBhbmQgb25seSBydW5zIHdoZW4gP2JpbmRlciBpcyBzcGVjaWZpZWRcbiAgICBhc3NlcnQgJiYgd2luZG93LnBoZXQ/LmNoaXBwZXI/LnF1ZXJ5UGFyYW1ldGVycz8uYmluZGVyICYmIEluc3RhbmNlUmVnaXN0cnkucmVnaXN0ZXJEYXRhVVJMKCAnc2NlbmVyeS1waGV0JywgJ01vdmVUb1RyYXNoQnV0dG9uJywgdGhpcyApO1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnTW92ZVRvVHJhc2hCdXR0b24nLCBNb3ZlVG9UcmFzaEJ1dHRvbiApOyJdLCJuYW1lcyI6WyJJbnN0YW5jZVJlZ2lzdHJ5Iiwib3B0aW9uaXplIiwiTm9kZSIsIlBhdGgiLCJ0cmFzaEFsdFJlZ3VsYXJTaGFwZSIsIlJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiIsIkN1cnZlZEFycm93U2hhcGUiLCJzY2VuZXJ5UGhldCIsIk1vdmVUb1RyYXNoQnV0dG9uIiwicHJvdmlkZWRPcHRpb25zIiwid2luZG93Iiwib3B0aW9ucyIsImFycm93Q29sb3IiLCJpY29uU2NhbGUiLCJ0cmFzaE5vZGUiLCJmaWxsIiwic2NhbGUiLCJhcnJvd1NoYXBlIiwiTWF0aCIsIlBJIiwiaGVhZFdpZHRoIiwidGFpbFdpZHRoIiwiYXJyb3dQYXRoIiwicmlnaHQiLCJsZWZ0Iiwid2lkdGgiLCJib3R0b20iLCJ0b3AiLCJjb250ZW50IiwiY2hpbGRyZW4iLCJhc3NlcnQiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImJpbmRlciIsInJlZ2lzdGVyRGF0YVVSTCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBRUQsT0FBT0Esc0JBQXNCLDBEQUEwRDtBQUN2RixPQUFPQyxlQUFlLHFDQUFxQztBQUUzRCxTQUFTQyxJQUFJLEVBQUVDLElBQUksUUFBZ0IsaUNBQWlDO0FBQ3BFLE9BQU9DLDBCQUEwQiwyREFBMkQ7QUFDNUYsT0FBT0MsMkJBQTZELG1EQUFtRDtBQUN2SCxPQUFPQyxzQkFBc0IseUJBQXlCO0FBQ3RELE9BQU9DLGlCQUFpQixvQkFBb0I7QUFTN0IsSUFBQSxBQUFNQyxvQkFBTixNQUFNQSwwQkFBMEJIO0lBRTdDLFlBQW9CSSxlQUEwQyxDQUFHO1lBa0NyREMsc0NBQUFBLHNCQUFBQTtRQWhDVixNQUFNQyxVQUFVVixZQUFrRjtZQUVoRywyQkFBMkI7WUFDM0JXLFlBQVk7WUFFWkMsV0FBVztRQUNiLEdBQUdKO1FBRUgsTUFBTUssWUFBWSxJQUFJWCxLQUFNQyxzQkFBc0I7WUFDaERXLE1BQU07WUFDTkMsT0FBTztRQUNUO1FBRUEsTUFBTUMsYUFBYSxJQUFJWCxpQkFBa0IsSUFBSSxDQUFDLE1BQU1ZLEtBQUtDLEVBQUUsRUFBRSxDQUFDLE1BQU1ELEtBQUtDLEVBQUUsRUFBRTtZQUMzRUMsV0FBVztZQUNYQyxXQUFXO1FBQ2I7UUFFQSxNQUFNQyxZQUFZLElBQUluQixLQUFNYyxZQUFZO1lBQ3RDRixNQUFNSixRQUFRQyxVQUFVO1lBQ3hCVyxPQUFPVCxVQUFVVSxJQUFJLEdBQUssT0FBT1YsVUFBVVcsS0FBSztZQUNoREMsUUFBUVosVUFBVWEsR0FBRztRQUN2QjtRQUVBaEIsUUFBUWlCLE9BQU8sR0FBRyxJQUFJMUIsS0FBTTtZQUMxQjJCLFVBQVU7Z0JBQUVmO2dCQUFXUTthQUFXO1lBQ2xDTixPQUFPTCxRQUFRRSxTQUFTO1FBQzFCO1FBRUEsS0FBSyxDQUFFRjtRQUVQLG1HQUFtRztRQUNuR21CLFlBQVVwQixlQUFBQSxPQUFPcUIsSUFBSSxzQkFBWHJCLHVCQUFBQSxhQUFhc0IsT0FBTyxzQkFBcEJ0Qix1Q0FBQUEscUJBQXNCdUIsZUFBZSxxQkFBckN2QixxQ0FBdUN3QixNQUFNLEtBQUlsQyxpQkFBaUJtQyxlQUFlLENBQUUsZ0JBQWdCLHFCQUFxQixJQUFJO0lBQ3hJO0FBQ0Y7QUF0Q0EsU0FBcUIzQiwrQkFzQ3BCO0FBRURELFlBQVk2QixRQUFRLENBQUUscUJBQXFCNUIifQ==