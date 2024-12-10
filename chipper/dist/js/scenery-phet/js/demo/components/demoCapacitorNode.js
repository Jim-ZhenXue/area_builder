// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for CapacitorNode
 *
 * @author Sam Reid
 */ import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';
import Range from '../../../../dot/js/Range.js';
import { VBox } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import CapacitorConstants from '../../capacitor/CapacitorConstants.js';
import CapacitorNode from '../../capacitor/CapacitorNode.js';
import YawPitchModelViewTransform3 from '../../capacitor/YawPitchModelViewTransform3.js';
import NumberControl from '../../NumberControl.js';
export default function demoCapacitorNode(layoutBounds) {
    const plateBounds = new Bounds3(0, 0, 0, 0.01414213562373095, CapacitorConstants.PLATE_HEIGHT, 0.01414213562373095);
    // An object literal is fine in a demo like this, but we probably wouldn't do this in production code.
    const circuit = {
        maxPlateCharge: 2.6562e-12,
        capacitor: {
            plateSizeProperty: new Property(plateBounds),
            plateSeparationProperty: new NumberProperty(0.006),
            plateVoltageProperty: new NumberProperty(1.5),
            plateChargeProperty: new NumberProperty(4.426999999999999e-13 / 10 * 4),
            getEffectiveEField () {
                return 0;
            }
        }
    };
    const modelViewTransform = new YawPitchModelViewTransform3();
    const plateChargeVisibleProperty = new BooleanProperty(true);
    const electricFieldVisibleProperty = new BooleanProperty(true);
    const capacitorNode = new CapacitorNode(circuit, modelViewTransform, plateChargeVisibleProperty, electricFieldVisibleProperty, {
        tandem: Tandem.OPT_OUT
    });
    const controls = new VBox({
        children: [
            new NumberControl('separation', circuit.capacitor.plateSeparationProperty, new Range(0, 0.01), {
                delta: 0.0001,
                numberDisplayOptions: {
                    decimalPlaces: 5
                }
            }),
            new NumberControl('charge', circuit.capacitor.plateChargeProperty, new Range(-4.426999999999999e-13 * 1.5, 4.426999999999999e-13 * 1.5), {
                delta: 4.426999999999999e-13 / 30,
                numberDisplayOptions: {
                    decimalPlaces: 20
                }
            })
        ]
    });
    return new VBox({
        spacing: 20,
        resize: false,
        children: [
            capacitorNode,
            controls
        ],
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb0NhcGFjaXRvck5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVtbyBmb3IgQ2FwYWNpdG9yTm9kZVxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWRcbiAqL1xuXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBCb3VuZHMzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMzLmpzJztcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xuaW1wb3J0IHsgTm9kZSwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IENhcGFjaXRvckNvbnN0YW50cyBmcm9tICcuLi8uLi9jYXBhY2l0b3IvQ2FwYWNpdG9yQ29uc3RhbnRzLmpzJztcbmltcG9ydCBDYXBhY2l0b3JOb2RlIGZyb20gJy4uLy4uL2NhcGFjaXRvci9DYXBhY2l0b3JOb2RlLmpzJztcbmltcG9ydCBZYXdQaXRjaE1vZGVsVmlld1RyYW5zZm9ybTMgZnJvbSAnLi4vLi4vY2FwYWNpdG9yL1lhd1BpdGNoTW9kZWxWaWV3VHJhbnNmb3JtMy5qcyc7XG5pbXBvcnQgTnVtYmVyQ29udHJvbCBmcm9tICcuLi8uLi9OdW1iZXJDb250cm9sLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVtb0NhcGFjaXRvck5vZGUoIGxheW91dEJvdW5kczogQm91bmRzMiApOiBOb2RlIHtcblxuICBjb25zdCBwbGF0ZUJvdW5kcyA9IG5ldyBCb3VuZHMzKCAwLCAwLCAwLCAwLjAxNDE0MjEzNTYyMzczMDk1LCBDYXBhY2l0b3JDb25zdGFudHMuUExBVEVfSEVJR0hULCAwLjAxNDE0MjEzNTYyMzczMDk1ICk7XG5cbiAgLy8gQW4gb2JqZWN0IGxpdGVyYWwgaXMgZmluZSBpbiBhIGRlbW8gbGlrZSB0aGlzLCBidXQgd2UgcHJvYmFibHkgd291bGRuJ3QgZG8gdGhpcyBpbiBwcm9kdWN0aW9uIGNvZGUuXG4gIGNvbnN0IGNpcmN1aXQgPSB7XG4gICAgbWF4UGxhdGVDaGFyZ2U6IDIuNjU2MmUtMTIsXG4gICAgY2FwYWNpdG9yOiB7XG4gICAgICBwbGF0ZVNpemVQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCBwbGF0ZUJvdW5kcyApLFxuICAgICAgcGxhdGVTZXBhcmF0aW9uUHJvcGVydHk6IG5ldyBOdW1iZXJQcm9wZXJ0eSggMC4wMDYgKSxcbiAgICAgIHBsYXRlVm9sdGFnZVByb3BlcnR5OiBuZXcgTnVtYmVyUHJvcGVydHkoIDEuNSApLFxuICAgICAgcGxhdGVDaGFyZ2VQcm9wZXJ0eTogbmV3IE51bWJlclByb3BlcnR5KCA0LjQyNjk5OTk5OTk5OTk5OWUtMTMgLyAxMCAqIDQgKSxcbiAgICAgIGdldEVmZmVjdGl2ZUVGaWVsZCgpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBjb25zdCBtb2RlbFZpZXdUcmFuc2Zvcm0gPSBuZXcgWWF3UGl0Y2hNb2RlbFZpZXdUcmFuc2Zvcm0zKCk7XG4gIGNvbnN0IHBsYXRlQ2hhcmdlVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSApO1xuICBjb25zdCBlbGVjdHJpY0ZpZWxkVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSApO1xuXG4gIGNvbnN0IGNhcGFjaXRvck5vZGUgPSBuZXcgQ2FwYWNpdG9yTm9kZSggY2lyY3VpdCwgbW9kZWxWaWV3VHJhbnNmb3JtLCBwbGF0ZUNoYXJnZVZpc2libGVQcm9wZXJ0eSwgZWxlY3RyaWNGaWVsZFZpc2libGVQcm9wZXJ0eSwge1xuICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgfSApO1xuXG4gIGNvbnN0IGNvbnRyb2xzID0gbmV3IFZCb3goIHtcbiAgICBjaGlsZHJlbjogW1xuICAgICAgbmV3IE51bWJlckNvbnRyb2woICdzZXBhcmF0aW9uJywgY2lyY3VpdC5jYXBhY2l0b3IucGxhdGVTZXBhcmF0aW9uUHJvcGVydHksIG5ldyBSYW5nZSggMCwgMC4wMSApLCB7XG4gICAgICAgIGRlbHRhOiAwLjAwMDEsXG4gICAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XG4gICAgICAgICAgZGVjaW1hbFBsYWNlczogNVxuICAgICAgICB9XG4gICAgICB9ICksXG4gICAgICBuZXcgTnVtYmVyQ29udHJvbCggJ2NoYXJnZScsIGNpcmN1aXQuY2FwYWNpdG9yLnBsYXRlQ2hhcmdlUHJvcGVydHksIG5ldyBSYW5nZSggLSggNC40MjY5OTk5OTk5OTk5OTllLTEzICkgKiAxLjUsICggNC40MjY5OTk5OTk5OTk5OTllLTEzICkgKiAxLjUgKSwge1xuICAgICAgICBkZWx0YTogNC40MjY5OTk5OTk5OTk5OTllLTEzIC8gMzAsXG4gICAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XG4gICAgICAgICAgZGVjaW1hbFBsYWNlczogMjBcbiAgICAgICAgfVxuICAgICAgfSApXG4gICAgXVxuICB9ICk7XG5cbiAgcmV0dXJuIG5ldyBWQm94KCB7XG4gICAgc3BhY2luZzogMjAsXG4gICAgcmVzaXplOiBmYWxzZSxcbiAgICBjaGlsZHJlbjogW1xuICAgICAgY2FwYWNpdG9yTm9kZSxcbiAgICAgIGNvbnRyb2xzXG4gICAgXSxcbiAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXJcbiAgfSApO1xufSJdLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwiQm91bmRzMyIsIlJhbmdlIiwiVkJveCIsIlRhbmRlbSIsIkNhcGFjaXRvckNvbnN0YW50cyIsIkNhcGFjaXRvck5vZGUiLCJZYXdQaXRjaE1vZGVsVmlld1RyYW5zZm9ybTMiLCJOdW1iZXJDb250cm9sIiwiZGVtb0NhcGFjaXRvck5vZGUiLCJsYXlvdXRCb3VuZHMiLCJwbGF0ZUJvdW5kcyIsIlBMQVRFX0hFSUdIVCIsImNpcmN1aXQiLCJtYXhQbGF0ZUNoYXJnZSIsImNhcGFjaXRvciIsInBsYXRlU2l6ZVByb3BlcnR5IiwicGxhdGVTZXBhcmF0aW9uUHJvcGVydHkiLCJwbGF0ZVZvbHRhZ2VQcm9wZXJ0eSIsInBsYXRlQ2hhcmdlUHJvcGVydHkiLCJnZXRFZmZlY3RpdmVFRmllbGQiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJwbGF0ZUNoYXJnZVZpc2libGVQcm9wZXJ0eSIsImVsZWN0cmljRmllbGRWaXNpYmxlUHJvcGVydHkiLCJjYXBhY2l0b3JOb2RlIiwidGFuZGVtIiwiT1BUX09VVCIsImNvbnRyb2xzIiwiY2hpbGRyZW4iLCJkZWx0YSIsIm51bWJlckRpc3BsYXlPcHRpb25zIiwiZGVjaW1hbFBsYWNlcyIsInNwYWNpbmciLCJyZXNpemUiLCJjZW50ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EscUJBQXFCLHlDQUF5QztBQUNyRSxPQUFPQyxvQkFBb0Isd0NBQXdDO0FBQ25FLE9BQU9DLGNBQWMsa0NBQWtDO0FBRXZELE9BQU9DLGFBQWEsZ0NBQWdDO0FBQ3BELE9BQU9DLFdBQVcsOEJBQThCO0FBQ2hELFNBQWVDLElBQUksUUFBUSxvQ0FBb0M7QUFDL0QsT0FBT0MsWUFBWSxrQ0FBa0M7QUFDckQsT0FBT0Msd0JBQXdCLHdDQUF3QztBQUN2RSxPQUFPQyxtQkFBbUIsbUNBQW1DO0FBQzdELE9BQU9DLGlDQUFpQyxpREFBaUQ7QUFDekYsT0FBT0MsbUJBQW1CLHlCQUF5QjtBQUVuRCxlQUFlLFNBQVNDLGtCQUFtQkMsWUFBcUI7SUFFOUQsTUFBTUMsY0FBYyxJQUFJVixRQUFTLEdBQUcsR0FBRyxHQUFHLHFCQUFxQkksbUJBQW1CTyxZQUFZLEVBQUU7SUFFaEcsc0dBQXNHO0lBQ3RHLE1BQU1DLFVBQVU7UUFDZEMsZ0JBQWdCO1FBQ2hCQyxXQUFXO1lBQ1RDLG1CQUFtQixJQUFJaEIsU0FBVVc7WUFDakNNLHlCQUF5QixJQUFJbEIsZUFBZ0I7WUFDN0NtQixzQkFBc0IsSUFBSW5CLGVBQWdCO1lBQzFDb0IscUJBQXFCLElBQUlwQixlQUFnQix3QkFBd0IsS0FBSztZQUN0RXFCO2dCQUNFLE9BQU87WUFDVDtRQUNGO0lBQ0Y7SUFDQSxNQUFNQyxxQkFBcUIsSUFBSWQ7SUFDL0IsTUFBTWUsNkJBQTZCLElBQUl4QixnQkFBaUI7SUFDeEQsTUFBTXlCLCtCQUErQixJQUFJekIsZ0JBQWlCO0lBRTFELE1BQU0wQixnQkFBZ0IsSUFBSWxCLGNBQWVPLFNBQVNRLG9CQUFvQkMsNEJBQTRCQyw4QkFBOEI7UUFDOUhFLFFBQVFyQixPQUFPc0IsT0FBTztJQUN4QjtJQUVBLE1BQU1DLFdBQVcsSUFBSXhCLEtBQU07UUFDekJ5QixVQUFVO1lBQ1IsSUFBSXBCLGNBQWUsY0FBY0ssUUFBUUUsU0FBUyxDQUFDRSx1QkFBdUIsRUFBRSxJQUFJZixNQUFPLEdBQUcsT0FBUTtnQkFDaEcyQixPQUFPO2dCQUNQQyxzQkFBc0I7b0JBQ3BCQyxlQUFlO2dCQUNqQjtZQUNGO1lBQ0EsSUFBSXZCLGNBQWUsVUFBVUssUUFBUUUsU0FBUyxDQUFDSSxtQkFBbUIsRUFBRSxJQUFJakIsTUFBTyxDQUFHLHdCQUEwQixLQUFLLEFBQUUsd0JBQTBCLE1BQU87Z0JBQ2xKMkIsT0FBTyx3QkFBd0I7Z0JBQy9CQyxzQkFBc0I7b0JBQ3BCQyxlQUFlO2dCQUNqQjtZQUNGO1NBQ0Q7SUFDSDtJQUVBLE9BQU8sSUFBSTVCLEtBQU07UUFDZjZCLFNBQVM7UUFDVEMsUUFBUTtRQUNSTCxVQUFVO1lBQ1JKO1lBQ0FHO1NBQ0Q7UUFDRE8sUUFBUXhCLGFBQWF3QixNQUFNO0lBQzdCO0FBQ0YifQ==