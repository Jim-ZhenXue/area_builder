// Copyright 2017-2024, University of Colorado Boulder
/**
 * Semi-transparent black barrier used to block input events when a dialog (or other popup) is present, and fade out
 * the background.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import dotRandom from '../../dot/js/dotRandom.js';
import optionize from '../../phet-core/js/optionize.js';
import { FireListener, Plane } from '../../scenery/js/imports.js';
import EventType from '../../tandem/js/EventType.js';
import Tandem from '../../tandem/js/Tandem.js';
import sceneryPhet from './sceneryPhet.js';
let BarrierRectangle = class BarrierRectangle extends Plane {
    dispose() {
        this.disposeBarrierRectangle();
        super.dispose();
    }
    constructor(modalNodeStack, providedOptions){
        const options = optionize()({
            fill: 'rgba( 0, 0, 0, 0.3 )',
            pickable: true,
            phetioReadOnly: true,
            phetioEventType: EventType.USER,
            visiblePropertyOptions: {
                phetioState: false
            }
        }, providedOptions);
        super(options);
        const lengthListener = (numberOfBarriers)=>{
            this.visible = numberOfBarriers > 0;
        };
        modalNodeStack.lengthProperty.link(lengthListener);
        this.addInputListener(new FireListener({
            tandem: Tandem.OPT_OUT,
            phetioReadOnly: options.phetioReadOnly,
            fire () {
                assert && assert(modalNodeStack.length > 0, 'There must be a Node in the stack to hide.');
                // If fuzzing is enabled, close popups with a reduced probability, to improve testing coverage.
                // As of this writing, this addresses Dialogs and the PhET menu.
                // See https://github.com/phetsims/aqua/issues/136
                if (!phet.chipper.isFuzzEnabled() || dotRandom.nextDouble() < 0.005) {
                    modalNodeStack.get(modalNodeStack.length - 1).hide();
                }
            }
        }));
        this.disposeBarrierRectangle = ()=>{
            if (modalNodeStack.lengthProperty.hasListener(lengthListener)) {
                modalNodeStack.lengthProperty.unlink(lengthListener);
            }
        };
    }
};
export { BarrierRectangle as default };
sceneryPhet.register('BarrierRectangle', BarrierRectangle);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9CYXJyaWVyUmVjdGFuZ2xlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFNlbWktdHJhbnNwYXJlbnQgYmxhY2sgYmFycmllciB1c2VkIHRvIGJsb2NrIGlucHV0IGV2ZW50cyB3aGVuIGEgZGlhbG9nIChvciBvdGhlciBwb3B1cCkgaXMgcHJlc2VudCwgYW5kIGZhZGUgb3V0XG4gKiB0aGUgYmFja2dyb3VuZC5cbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IHsgT2JzZXJ2YWJsZUFycmF5IH0gZnJvbSAnLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHsgRmlyZUxpc3RlbmVyLCBQbGFuZSwgUGxhbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCB7IFBvcHVwYWJsZU5vZGUgfSBmcm9tICcuLi8uLi9zdW4vanMvUG9wdXBhYmxlLmpzJztcbmltcG9ydCBFdmVudFR5cGUgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL0V2ZW50VHlwZS5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcblxuZXhwb3J0IHR5cGUgQmFycmllclJlY3RhbmdsZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBsYW5lT3B0aW9ucztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFycmllclJlY3RhbmdsZSBleHRlbmRzIFBsYW5lIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VCYXJyaWVyUmVjdGFuZ2xlOiAoKSA9PiB2b2lkO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kYWxOb2RlU3RhY2s6IE9ic2VydmFibGVBcnJheTxQb3B1cGFibGVOb2RlPiwgcHJvdmlkZWRPcHRpb25zPzogQmFycmllclJlY3RhbmdsZU9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEJhcnJpZXJSZWN0YW5nbGVPcHRpb25zLCBTZWxmT3B0aW9ucywgUGxhbmVPcHRpb25zPigpKCB7XG4gICAgICBmaWxsOiAncmdiYSggMCwgMCwgMCwgMC4zICknLFxuICAgICAgcGlja2FibGU6IHRydWUsXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSwgLy8gRGlzYWJsZSBjb250cm9scyBpbiB0aGUgUGhFVC1pTyBTdHVkaW8gd3JhcHBlclxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcbiAgICAgIHZpc2libGVQcm9wZXJ0eU9wdGlvbnM6IHtcbiAgICAgICAgcGhldGlvU3RhdGU6IGZhbHNlXG4gICAgICB9XG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBzdXBlciggb3B0aW9ucyApO1xuXG4gICAgY29uc3QgbGVuZ3RoTGlzdGVuZXIgPSAoIG51bWJlck9mQmFycmllcnM6IG51bWJlciApID0+IHtcbiAgICAgIHRoaXMudmlzaWJsZSA9ICggbnVtYmVyT2ZCYXJyaWVycyA+IDAgKTtcbiAgICB9O1xuICAgIG1vZGFsTm9kZVN0YWNrLmxlbmd0aFByb3BlcnR5LmxpbmsoIGxlbmd0aExpc3RlbmVyICk7XG5cbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIG5ldyBGaXJlTGlzdGVuZXIoIHtcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVQsXG4gICAgICBwaGV0aW9SZWFkT25seTogb3B0aW9ucy5waGV0aW9SZWFkT25seSxcbiAgICAgIGZpcmUoKSB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG1vZGFsTm9kZVN0YWNrLmxlbmd0aCA+IDAsICdUaGVyZSBtdXN0IGJlIGEgTm9kZSBpbiB0aGUgc3RhY2sgdG8gaGlkZS4nICk7XG5cbiAgICAgICAgLy8gSWYgZnV6emluZyBpcyBlbmFibGVkLCBjbG9zZSBwb3B1cHMgd2l0aCBhIHJlZHVjZWQgcHJvYmFiaWxpdHksIHRvIGltcHJvdmUgdGVzdGluZyBjb3ZlcmFnZS5cbiAgICAgICAgLy8gQXMgb2YgdGhpcyB3cml0aW5nLCB0aGlzIGFkZHJlc3NlcyBEaWFsb2dzIGFuZCB0aGUgUGhFVCBtZW51LlxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2FxdWEvaXNzdWVzLzEzNlxuICAgICAgICBpZiAoICFwaGV0LmNoaXBwZXIuaXNGdXp6RW5hYmxlZCgpIHx8IGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgPCAwLjAwNSApIHtcbiAgICAgICAgICBtb2RhbE5vZGVTdGFjay5nZXQoIG1vZGFsTm9kZVN0YWNrLmxlbmd0aCAtIDEgKS5oaWRlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ICkgKTtcblxuICAgIHRoaXMuZGlzcG9zZUJhcnJpZXJSZWN0YW5nbGUgPSAoKSA9PiB7XG4gICAgICBpZiAoIG1vZGFsTm9kZVN0YWNrLmxlbmd0aFByb3BlcnR5Lmhhc0xpc3RlbmVyKCBsZW5ndGhMaXN0ZW5lciApICkge1xuICAgICAgICBtb2RhbE5vZGVTdGFjay5sZW5ndGhQcm9wZXJ0eS51bmxpbmsoIGxlbmd0aExpc3RlbmVyICk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZUJhcnJpZXJSZWN0YW5nbGUoKTtcbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cbn1cblxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdCYXJyaWVyUmVjdGFuZ2xlJywgQmFycmllclJlY3RhbmdsZSApOyJdLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJvcHRpb25pemUiLCJGaXJlTGlzdGVuZXIiLCJQbGFuZSIsIkV2ZW50VHlwZSIsIlRhbmRlbSIsInNjZW5lcnlQaGV0IiwiQmFycmllclJlY3RhbmdsZSIsImRpc3Bvc2UiLCJkaXNwb3NlQmFycmllclJlY3RhbmdsZSIsIm1vZGFsTm9kZVN0YWNrIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImZpbGwiLCJwaWNrYWJsZSIsInBoZXRpb1JlYWRPbmx5IiwicGhldGlvRXZlbnRUeXBlIiwiVVNFUiIsInZpc2libGVQcm9wZXJ0eU9wdGlvbnMiLCJwaGV0aW9TdGF0ZSIsImxlbmd0aExpc3RlbmVyIiwibnVtYmVyT2ZCYXJyaWVycyIsInZpc2libGUiLCJsZW5ndGhQcm9wZXJ0eSIsImxpbmsiLCJhZGRJbnB1dExpc3RlbmVyIiwidGFuZGVtIiwiT1BUX09VVCIsImZpcmUiLCJhc3NlcnQiLCJsZW5ndGgiLCJwaGV0IiwiY2hpcHBlciIsImlzRnV6ekVuYWJsZWQiLCJuZXh0RG91YmxlIiwiZ2V0IiwiaGlkZSIsImhhc0xpc3RlbmVyIiwidW5saW5rIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUdELE9BQU9BLGVBQWUsNEJBQTRCO0FBQ2xELE9BQU9DLGVBQXFDLGtDQUFrQztBQUM5RSxTQUFTQyxZQUFZLEVBQUVDLEtBQUssUUFBc0IsOEJBQThCO0FBRWhGLE9BQU9DLGVBQWUsK0JBQStCO0FBQ3JELE9BQU9DLFlBQVksNEJBQTRCO0FBQy9DLE9BQU9DLGlCQUFpQixtQkFBbUI7QUFNNUIsSUFBQSxBQUFNQyxtQkFBTixNQUFNQSx5QkFBeUJKO0lBNkM1QkssVUFBZ0I7UUFDOUIsSUFBSSxDQUFDQyx1QkFBdUI7UUFDNUIsS0FBSyxDQUFDRDtJQUNSO0lBNUNBLFlBQW9CRSxjQUE4QyxFQUFFQyxlQUF5QyxDQUFHO1FBRTlHLE1BQU1DLFVBQVVYLFlBQWlFO1lBQy9FWSxNQUFNO1lBQ05DLFVBQVU7WUFDVkMsZ0JBQWdCO1lBQ2hCQyxpQkFBaUJaLFVBQVVhLElBQUk7WUFDL0JDLHdCQUF3QjtnQkFDdEJDLGFBQWE7WUFDZjtRQUNGLEdBQUdSO1FBRUgsS0FBSyxDQUFFQztRQUVQLE1BQU1RLGlCQUFpQixDQUFFQztZQUN2QixJQUFJLENBQUNDLE9BQU8sR0FBS0QsbUJBQW1CO1FBQ3RDO1FBQ0FYLGVBQWVhLGNBQWMsQ0FBQ0MsSUFBSSxDQUFFSjtRQUVwQyxJQUFJLENBQUNLLGdCQUFnQixDQUFFLElBQUl2QixhQUFjO1lBQ3ZDd0IsUUFBUXJCLE9BQU9zQixPQUFPO1lBQ3RCWixnQkFBZ0JILFFBQVFHLGNBQWM7WUFDdENhO2dCQUNFQyxVQUFVQSxPQUFRbkIsZUFBZW9CLE1BQU0sR0FBRyxHQUFHO2dCQUU3QywrRkFBK0Y7Z0JBQy9GLGdFQUFnRTtnQkFDaEUsa0RBQWtEO2dCQUNsRCxJQUFLLENBQUNDLEtBQUtDLE9BQU8sQ0FBQ0MsYUFBYSxNQUFNakMsVUFBVWtDLFVBQVUsS0FBSyxPQUFRO29CQUNyRXhCLGVBQWV5QixHQUFHLENBQUV6QixlQUFlb0IsTUFBTSxHQUFHLEdBQUlNLElBQUk7Z0JBQ3REO1lBQ0Y7UUFDRjtRQUVBLElBQUksQ0FBQzNCLHVCQUF1QixHQUFHO1lBQzdCLElBQUtDLGVBQWVhLGNBQWMsQ0FBQ2MsV0FBVyxDQUFFakIsaUJBQW1CO2dCQUNqRVYsZUFBZWEsY0FBYyxDQUFDZSxNQUFNLENBQUVsQjtZQUN4QztRQUNGO0lBQ0Y7QUFNRjtBQWpEQSxTQUFxQmIsOEJBaURwQjtBQUVERCxZQUFZaUMsUUFBUSxDQUFFLG9CQUFvQmhDIn0=