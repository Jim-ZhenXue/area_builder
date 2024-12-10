// Copyright 2017-2024, University of Colorado Boulder
/**
 * ElectronChargeNode renders a shaded 2d electron with a "-" sign in the middle.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import { Circle, Node, RadialGradient, Rectangle } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
let ElectronChargeNode = class ElectronChargeNode extends Node {
    constructor(providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        const options = optionize()({
            // Workaround for https://github.com/phetsims/circuit-construction-kit-dc/issues/160
            sphereOpacity: 1,
            minusSignOpacity: 1,
            radius: 10
        }, providedOptions);
        options.children = [
            // The blue shaded sphere
            new Circle(options.radius, {
                opacity: options.sphereOpacity,
                fill: new RadialGradient(2, -3, 2, 2, -3, 7).addColorStop(0, '#4fcfff').addColorStop(0.5, '#2cbef5').addColorStop(1, '#00a9e8')
            }),
            // Minus sign, intentionally not internationalized
            new Rectangle(0, 0, 11, 2, {
                opacity: options.minusSignOpacity,
                fill: 'white',
                centerX: 0,
                centerY: 0
            })
        ];
        super(options);
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'ElectronChargeNode', this);
    }
};
export { ElectronChargeNode as default };
sceneryPhet.register('ElectronChargeNode', ElectronChargeNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9FbGVjdHJvbkNoYXJnZU5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRWxlY3Ryb25DaGFyZ2VOb2RlIHJlbmRlcnMgYSBzaGFkZWQgMmQgZWxlY3Ryb24gd2l0aCBhIFwiLVwiIHNpZ24gaW4gdGhlIG1pZGRsZS5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBJbnN0YW5jZVJlZ2lzdHJ5IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9kb2N1bWVudGF0aW9uL0luc3RhbmNlUmVnaXN0cnkuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCB7IENpcmNsZSwgTm9kZSwgTm9kZU9wdGlvbnMsIFJhZGlhbEdyYWRpZW50LCBSZWN0YW5nbGUgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICBzcGhlcmVPcGFjaXR5PzogbnVtYmVyO1xuICBtaW51c1NpZ25PcGFjaXR5PzogbnVtYmVyO1xuICByYWRpdXM/OiBudW1iZXI7XG59O1xuXG5leHBvcnQgdHlwZSBFbGVjdHJvbkNoYXJnZU5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PE5vZGVPcHRpb25zLCAnY2hpbGRyZW4nPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWxlY3Ryb25DaGFyZ2VOb2RlIGV4dGVuZHMgTm9kZSB7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBFbGVjdHJvbkNoYXJnZU5vZGVPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxFbGVjdHJvbkNoYXJnZU5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NpcmN1aXQtY29uc3RydWN0aW9uLWtpdC1kYy9pc3N1ZXMvMTYwXG4gICAgICBzcGhlcmVPcGFjaXR5OiAxLFxuICAgICAgbWludXNTaWduT3BhY2l0eTogMSxcbiAgICAgIHJhZGl1czogMTBcblxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFtcblxuICAgICAgLy8gVGhlIGJsdWUgc2hhZGVkIHNwaGVyZVxuICAgICAgbmV3IENpcmNsZSggb3B0aW9ucy5yYWRpdXMsIHtcbiAgICAgICAgb3BhY2l0eTogb3B0aW9ucy5zcGhlcmVPcGFjaXR5LFxuICAgICAgICBmaWxsOiBuZXcgUmFkaWFsR3JhZGllbnQoXG4gICAgICAgICAgMiwgLTMsIDIsXG4gICAgICAgICAgMiwgLTMsIDcgKVxuICAgICAgICAgIC5hZGRDb2xvclN0b3AoIDAsICcjNGZjZmZmJyApXG4gICAgICAgICAgLmFkZENvbG9yU3RvcCggMC41LCAnIzJjYmVmNScgKVxuICAgICAgICAgIC5hZGRDb2xvclN0b3AoIDEsICcjMDBhOWU4JyApXG4gICAgICB9ICksXG5cbiAgICAgIC8vIE1pbnVzIHNpZ24sIGludGVudGlvbmFsbHkgbm90IGludGVybmF0aW9uYWxpemVkXG4gICAgICBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAxMSwgMiwge1xuICAgICAgICBvcGFjaXR5OiBvcHRpb25zLm1pbnVzU2lnbk9wYWNpdHksXG4gICAgICAgIGZpbGw6ICd3aGl0ZScsXG4gICAgICAgIGNlbnRlclg6IDAsXG4gICAgICAgIGNlbnRlclk6IDBcbiAgICAgIH0gKVxuICAgIF07XG5cbiAgICBzdXBlciggb3B0aW9ucyApO1xuXG4gICAgLy8gc3VwcG9ydCBmb3IgYmluZGVyIGRvY3VtZW50YXRpb24sIHN0cmlwcGVkIG91dCBpbiBidWlsZHMgYW5kIG9ubHkgcnVucyB3aGVuID9iaW5kZXIgaXMgc3BlY2lmaWVkXG4gICAgYXNzZXJ0ICYmIHdpbmRvdy5waGV0Py5jaGlwcGVyPy5xdWVyeVBhcmFtZXRlcnM/LmJpbmRlciAmJiBJbnN0YW5jZVJlZ2lzdHJ5LnJlZ2lzdGVyRGF0YVVSTCggJ3NjZW5lcnktcGhldCcsICdFbGVjdHJvbkNoYXJnZU5vZGUnLCB0aGlzICk7XG4gIH1cbn1cblxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdFbGVjdHJvbkNoYXJnZU5vZGUnLCBFbGVjdHJvbkNoYXJnZU5vZGUgKTsiXSwibmFtZXMiOlsiSW5zdGFuY2VSZWdpc3RyeSIsIm9wdGlvbml6ZSIsIkNpcmNsZSIsIk5vZGUiLCJSYWRpYWxHcmFkaWVudCIsIlJlY3RhbmdsZSIsInNjZW5lcnlQaGV0IiwiRWxlY3Ryb25DaGFyZ2VOb2RlIiwicHJvdmlkZWRPcHRpb25zIiwid2luZG93Iiwib3B0aW9ucyIsInNwaGVyZU9wYWNpdHkiLCJtaW51c1NpZ25PcGFjaXR5IiwicmFkaXVzIiwiY2hpbGRyZW4iLCJvcGFjaXR5IiwiZmlsbCIsImFkZENvbG9yU3RvcCIsImNlbnRlclgiLCJjZW50ZXJZIiwiYXNzZXJ0IiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJiaW5kZXIiLCJyZWdpc3RlckRhdGFVUkwiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxzQkFBc0IsdURBQXVEO0FBQ3BGLE9BQU9DLGVBQWUsa0NBQWtDO0FBRXhELFNBQVNDLE1BQU0sRUFBRUMsSUFBSSxFQUFlQyxjQUFjLEVBQUVDLFNBQVMsUUFBUSw4QkFBOEI7QUFDbkcsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQVU1QixJQUFBLEFBQU1DLHFCQUFOLE1BQU1BLDJCQUEyQko7SUFFOUMsWUFBb0JLLGVBQTJDLENBQUc7WUFvQ3REQyxzQ0FBQUEsc0JBQUFBO1FBbENWLE1BQU1DLFVBQVVULFlBQWtFO1lBRWhGLG9GQUFvRjtZQUNwRlUsZUFBZTtZQUNmQyxrQkFBa0I7WUFDbEJDLFFBQVE7UUFFVixHQUFHTDtRQUVIRSxRQUFRSSxRQUFRLEdBQUc7WUFFakIseUJBQXlCO1lBQ3pCLElBQUlaLE9BQVFRLFFBQVFHLE1BQU0sRUFBRTtnQkFDMUJFLFNBQVNMLFFBQVFDLGFBQWE7Z0JBQzlCSyxNQUFNLElBQUlaLGVBQ1IsR0FBRyxDQUFDLEdBQUcsR0FDUCxHQUFHLENBQUMsR0FBRyxHQUNOYSxZQUFZLENBQUUsR0FBRyxXQUNqQkEsWUFBWSxDQUFFLEtBQUssV0FDbkJBLFlBQVksQ0FBRSxHQUFHO1lBQ3RCO1lBRUEsa0RBQWtEO1lBQ2xELElBQUlaLFVBQVcsR0FBRyxHQUFHLElBQUksR0FBRztnQkFDMUJVLFNBQVNMLFFBQVFFLGdCQUFnQjtnQkFDakNJLE1BQU07Z0JBQ05FLFNBQVM7Z0JBQ1RDLFNBQVM7WUFDWDtTQUNEO1FBRUQsS0FBSyxDQUFFVDtRQUVQLG1HQUFtRztRQUNuR1UsWUFBVVgsZUFBQUEsT0FBT1ksSUFBSSxzQkFBWFosdUJBQUFBLGFBQWFhLE9BQU8sc0JBQXBCYix1Q0FBQUEscUJBQXNCYyxlQUFlLHFCQUFyQ2QscUNBQXVDZSxNQUFNLEtBQUl4QixpQkFBaUJ5QixlQUFlLENBQUUsZ0JBQWdCLHNCQUFzQixJQUFJO0lBQ3pJO0FBQ0Y7QUF4Q0EsU0FBcUJsQixnQ0F3Q3BCO0FBRURELFlBQVlvQixRQUFRLENBQUUsc0JBQXNCbkIifQ==