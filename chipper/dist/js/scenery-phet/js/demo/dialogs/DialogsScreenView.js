// Copyright 2018-2022, University of Colorado Boulder
/**
 * Demonstration of scenery-phet dialogs.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import ScreenView from '../../../../joist/js/ScreenView.js';
import { Image, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import Dialog from '../../../../sun/js/Dialog.js';
import batteryDCell_png from '../../../images/batteryDCell_png.js';
import CanvasWarningNode from '../../CanvasWarningNode.js';
import ContextLossFailureDialog from '../../ContextLossFailureDialog.js';
import OopsDialog from '../../OopsDialog.js';
import PhetFont from '../../PhetFont.js';
import sceneryPhet from '../../sceneryPhet.js';
// constants
const TEXT_OPTIONS = {
    font: new PhetFont(20)
};
let DialogsScreenView = class DialogsScreenView extends ScreenView {
    constructor(providedOptions){
        super(providedOptions);
        // Context Loss Failure
        let contextLossFailureDialog = null;
        const contextLossFailureButton = new RectangularPushButton({
            content: new Text('Context Loss Failure', TEXT_OPTIONS),
            listener: ()=>{
                if (!contextLossFailureDialog) {
                    contextLossFailureDialog = new ContextLossFailureDialog({
                        // So that we don't cause problems with automated testing.
                        // See https://github.com/phetsims/scenery-phet/issues/375
                        reload: function() {
                            console.log('Reload');
                        }
                    });
                }
                contextLossFailureDialog.show();
            }
        });
        // Canvas Warning
        let canvasWarningDialog = null;
        const canvasWarningButton = new RectangularPushButton({
            content: new Text('Canvas Warning', TEXT_OPTIONS),
            listener: ()=>{
                if (!canvasWarningDialog) {
                    canvasWarningDialog = new Dialog(new CanvasWarningNode());
                }
                canvasWarningDialog.show();
            }
        });
        // Oops!
        let oopsDialog = null;
        const oopsButton = new RectangularPushButton({
            content: new Text('OopsDialog', TEXT_OPTIONS),
            listener: ()=>{
                if (!oopsDialog) {
                    oopsDialog = new OopsDialog('Oops!<br><br>Your battery appears to be dead.', {
                        iconNode: new Image(batteryDCell_png, {
                            rotation: -Math.PI / 2
                        })
                    });
                }
                oopsDialog.show();
            }
        });
        this.addChild(new VBox({
            children: [
                contextLossFailureButton,
                canvasWarningButton,
                oopsButton
            ],
            spacing: 20,
            center: this.layoutBounds.center
        }));
    }
};
export { DialogsScreenView as default };
sceneryPhet.register('DialogsScreenView', DialogsScreenView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2RpYWxvZ3MvRGlhbG9nc1NjcmVlblZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVtb25zdHJhdGlvbiBvZiBzY2VuZXJ5LXBoZXQgZGlhbG9ncy5cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBTY3JlZW5WaWV3LCB7IFNjcmVlblZpZXdPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XG5pbXBvcnQgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xuaW1wb3J0IHsgSW1hZ2UsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclB1c2hCdXR0b24uanMnO1xuaW1wb3J0IERpYWxvZyBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvRGlhbG9nLmpzJztcbmltcG9ydCBiYXR0ZXJ5RENlbGxfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9iYXR0ZXJ5RENlbGxfcG5nLmpzJztcbmltcG9ydCBDYW52YXNXYXJuaW5nTm9kZSBmcm9tICcuLi8uLi9DYW52YXNXYXJuaW5nTm9kZS5qcyc7XG5pbXBvcnQgQ29udGV4dExvc3NGYWlsdXJlRGlhbG9nIGZyb20gJy4uLy4uL0NvbnRleHRMb3NzRmFpbHVyZURpYWxvZy5qcyc7XG5pbXBvcnQgT29wc0RpYWxvZyBmcm9tICcuLi8uLi9Pb3BzRGlhbG9nLmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vLi4vc2NlbmVyeVBoZXQuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IFRFWFRfT1BUSU9OUyA9IHtcbiAgZm9udDogbmV3IFBoZXRGb250KCAyMCApXG59O1xuXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcbnR5cGUgRGlhbG9nc1NjcmVlblZpZXdPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8U2NyZWVuVmlld09wdGlvbnMsICd0YW5kZW0nPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlhbG9nc1NjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM6IERpYWxvZ3NTY3JlZW5WaWV3T3B0aW9ucyApIHtcblxuICAgIHN1cGVyKCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIC8vIENvbnRleHQgTG9zcyBGYWlsdXJlXG4gICAgbGV0IGNvbnRleHRMb3NzRmFpbHVyZURpYWxvZzogRGlhbG9nIHwgbnVsbCA9IG51bGw7XG4gICAgY29uc3QgY29udGV4dExvc3NGYWlsdXJlQnV0dG9uID0gbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xuICAgICAgY29udGVudDogbmV3IFRleHQoICdDb250ZXh0IExvc3MgRmFpbHVyZScsIFRFWFRfT1BUSU9OUyApLFxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcbiAgICAgICAgaWYgKCAhY29udGV4dExvc3NGYWlsdXJlRGlhbG9nICkge1xuICAgICAgICAgIGNvbnRleHRMb3NzRmFpbHVyZURpYWxvZyA9IG5ldyBDb250ZXh0TG9zc0ZhaWx1cmVEaWFsb2coIHtcblxuICAgICAgICAgICAgLy8gU28gdGhhdCB3ZSBkb24ndCBjYXVzZSBwcm9ibGVtcyB3aXRoIGF1dG9tYXRlZCB0ZXN0aW5nLlxuICAgICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5LXBoZXQvaXNzdWVzLzM3NVxuICAgICAgICAgICAgcmVsb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coICdSZWxvYWQnICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRleHRMb3NzRmFpbHVyZURpYWxvZy5zaG93KCk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gQ2FudmFzIFdhcm5pbmdcbiAgICBsZXQgY2FudmFzV2FybmluZ0RpYWxvZzogRGlhbG9nIHwgbnVsbCA9IG51bGw7XG4gICAgY29uc3QgY2FudmFzV2FybmluZ0J1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcbiAgICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCAnQ2FudmFzIFdhcm5pbmcnLCBURVhUX09QVElPTlMgKSxcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XG4gICAgICAgIGlmICggIWNhbnZhc1dhcm5pbmdEaWFsb2cgKSB7XG4gICAgICAgICAgY2FudmFzV2FybmluZ0RpYWxvZyA9IG5ldyBEaWFsb2coIG5ldyBDYW52YXNXYXJuaW5nTm9kZSgpICk7XG4gICAgICAgIH1cbiAgICAgICAgY2FudmFzV2FybmluZ0RpYWxvZy5zaG93KCk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gT29wcyFcbiAgICBsZXQgb29wc0RpYWxvZzogRGlhbG9nIHwgbnVsbCA9IG51bGw7XG4gICAgY29uc3Qgb29wc0J1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcbiAgICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCAnT29wc0RpYWxvZycsIFRFWFRfT1BUSU9OUyApLFxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcbiAgICAgICAgaWYgKCAhb29wc0RpYWxvZyApIHtcbiAgICAgICAgICBvb3BzRGlhbG9nID0gbmV3IE9vcHNEaWFsb2coICdPb3BzITxicj48YnI+WW91ciBiYXR0ZXJ5IGFwcGVhcnMgdG8gYmUgZGVhZC4nLCB7XG4gICAgICAgICAgICBpY29uTm9kZTogbmV3IEltYWdlKCBiYXR0ZXJ5RENlbGxfcG5nLCB7IHJvdGF0aW9uOiAtTWF0aC5QSSAvIDIgfSApXG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICAgIG9vcHNEaWFsb2cuc2hvdygpO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBWQm94KCB7XG4gICAgICBjaGlsZHJlbjogW1xuICAgICAgICBjb250ZXh0TG9zc0ZhaWx1cmVCdXR0b24sXG4gICAgICAgIGNhbnZhc1dhcm5pbmdCdXR0b24sXG4gICAgICAgIG9vcHNCdXR0b25cbiAgICAgIF0sXG4gICAgICBzcGFjaW5nOiAyMCxcbiAgICAgIGNlbnRlcjogdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyXG4gICAgfSApICk7XG4gIH1cbn1cblxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdEaWFsb2dzU2NyZWVuVmlldycsIERpYWxvZ3NTY3JlZW5WaWV3ICk7Il0sIm5hbWVzIjpbIlNjcmVlblZpZXciLCJJbWFnZSIsIlRleHQiLCJWQm94IiwiUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIiwiRGlhbG9nIiwiYmF0dGVyeURDZWxsX3BuZyIsIkNhbnZhc1dhcm5pbmdOb2RlIiwiQ29udGV4dExvc3NGYWlsdXJlRGlhbG9nIiwiT29wc0RpYWxvZyIsIlBoZXRGb250Iiwic2NlbmVyeVBoZXQiLCJURVhUX09QVElPTlMiLCJmb250IiwiRGlhbG9nc1NjcmVlblZpZXciLCJwcm92aWRlZE9wdGlvbnMiLCJjb250ZXh0TG9zc0ZhaWx1cmVEaWFsb2ciLCJjb250ZXh0TG9zc0ZhaWx1cmVCdXR0b24iLCJjb250ZW50IiwibGlzdGVuZXIiLCJyZWxvYWQiLCJjb25zb2xlIiwibG9nIiwic2hvdyIsImNhbnZhc1dhcm5pbmdEaWFsb2ciLCJjYW52YXNXYXJuaW5nQnV0dG9uIiwib29wc0RpYWxvZyIsIm9vcHNCdXR0b24iLCJpY29uTm9kZSIsInJvdGF0aW9uIiwiTWF0aCIsIlBJIiwiYWRkQ2hpbGQiLCJjaGlsZHJlbiIsInNwYWNpbmciLCJjZW50ZXIiLCJsYXlvdXRCb3VuZHMiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxnQkFBdUMscUNBQXFDO0FBR25GLFNBQVNDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsb0NBQW9DO0FBQ3RFLE9BQU9DLDJCQUEyQixzREFBc0Q7QUFDeEYsT0FBT0MsWUFBWSwrQkFBK0I7QUFDbEQsT0FBT0Msc0JBQXNCLHNDQUFzQztBQUNuRSxPQUFPQyx1QkFBdUIsNkJBQTZCO0FBQzNELE9BQU9DLDhCQUE4QixvQ0FBb0M7QUFDekUsT0FBT0MsZ0JBQWdCLHNCQUFzQjtBQUM3QyxPQUFPQyxjQUFjLG9CQUFvQjtBQUN6QyxPQUFPQyxpQkFBaUIsdUJBQXVCO0FBRS9DLFlBQVk7QUFDWixNQUFNQyxlQUFlO0lBQ25CQyxNQUFNLElBQUlILFNBQVU7QUFDdEI7QUFLZSxJQUFBLEFBQU1JLG9CQUFOLE1BQU1BLDBCQUEwQmQ7SUFDN0MsWUFBb0JlLGVBQXlDLENBQUc7UUFFOUQsS0FBSyxDQUFFQTtRQUVQLHVCQUF1QjtRQUN2QixJQUFJQywyQkFBMEM7UUFDOUMsTUFBTUMsMkJBQTJCLElBQUliLHNCQUF1QjtZQUMxRGMsU0FBUyxJQUFJaEIsS0FBTSx3QkFBd0JVO1lBQzNDTyxVQUFVO2dCQUNSLElBQUssQ0FBQ0gsMEJBQTJCO29CQUMvQkEsMkJBQTJCLElBQUlSLHlCQUEwQjt3QkFFdkQsMERBQTBEO3dCQUMxRCwwREFBMEQ7d0JBQzFEWSxRQUFROzRCQUNOQyxRQUFRQyxHQUFHLENBQUU7d0JBQ2Y7b0JBQ0Y7Z0JBQ0Y7Z0JBQ0FOLHlCQUF5Qk8sSUFBSTtZQUMvQjtRQUNGO1FBRUEsaUJBQWlCO1FBQ2pCLElBQUlDLHNCQUFxQztRQUN6QyxNQUFNQyxzQkFBc0IsSUFBSXJCLHNCQUF1QjtZQUNyRGMsU0FBUyxJQUFJaEIsS0FBTSxrQkFBa0JVO1lBQ3JDTyxVQUFVO2dCQUNSLElBQUssQ0FBQ0sscUJBQXNCO29CQUMxQkEsc0JBQXNCLElBQUluQixPQUFRLElBQUlFO2dCQUN4QztnQkFDQWlCLG9CQUFvQkQsSUFBSTtZQUMxQjtRQUNGO1FBRUEsUUFBUTtRQUNSLElBQUlHLGFBQTRCO1FBQ2hDLE1BQU1DLGFBQWEsSUFBSXZCLHNCQUF1QjtZQUM1Q2MsU0FBUyxJQUFJaEIsS0FBTSxjQUFjVTtZQUNqQ08sVUFBVTtnQkFDUixJQUFLLENBQUNPLFlBQWE7b0JBQ2pCQSxhQUFhLElBQUlqQixXQUFZLGlEQUFpRDt3QkFDNUVtQixVQUFVLElBQUkzQixNQUFPSyxrQkFBa0I7NEJBQUV1QixVQUFVLENBQUNDLEtBQUtDLEVBQUUsR0FBRzt3QkFBRTtvQkFDbEU7Z0JBQ0Y7Z0JBQ0FMLFdBQVdILElBQUk7WUFDakI7UUFDRjtRQUVBLElBQUksQ0FBQ1MsUUFBUSxDQUFFLElBQUk3QixLQUFNO1lBQ3ZCOEIsVUFBVTtnQkFDUmhCO2dCQUNBUTtnQkFDQUU7YUFDRDtZQUNETyxTQUFTO1lBQ1RDLFFBQVEsSUFBSSxDQUFDQyxZQUFZLENBQUNELE1BQU07UUFDbEM7SUFDRjtBQUNGO0FBNURBLFNBQXFCckIsK0JBNERwQjtBQUVESCxZQUFZMEIsUUFBUSxDQUFFLHFCQUFxQnZCIn0=