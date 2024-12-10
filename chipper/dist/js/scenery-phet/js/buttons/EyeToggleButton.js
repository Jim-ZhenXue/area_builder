// Copyright 2016-2024, University of Colorado Boulder
/**
 * Button that toggles between an open and closed eyeball, used to control the visibility of something.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import InstanceRegistry from '../../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../../phet-core/js/optionize.js';
import { Node, Path } from '../../../scenery/js/imports.js';
import eyeSlashSolidShape from '../../../sherpa/js/fontawesome-5/eyeSlashSolidShape.js';
import eyeSolidShape from '../../../sherpa/js/fontawesome-5/eyeSolidShape.js';
import RectangularToggleButton from '../../../sun/js/buttons/RectangularToggleButton.js';
import sceneryPhet from '../sceneryPhet.js';
let EyeToggleButton = class EyeToggleButton extends RectangularToggleButton {
    dispose() {
        this.disposeEyeToggleButton();
        super.dispose();
    }
    /**
   * @param eyeOpenProperty - true: eye is open; false: eye is closed
   * @param providedOptions
   */ constructor(eyeOpenProperty, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        const options = optionize()({}, providedOptions);
        // icons
        const iconOptions = {
            scale: 0.08,
            fill: 'black'
        };
        const eyeOpenNode = new Path(eyeSolidShape, iconOptions);
        const eyeCloseNode = new Path(eyeSlashSolidShape, iconOptions);
        eyeCloseNode.center = eyeOpenNode.center;
        // button content
        options.content = new Node({
            children: [
                eyeCloseNode,
                eyeOpenNode
            ]
        });
        // toggle which icon is shown
        const eyeOpenObserver = (eyeOpen)=>{
            eyeOpenNode.visible = eyeOpen;
            eyeCloseNode.visible = !eyeOpen;
        };
        eyeOpenProperty.link(eyeOpenObserver); // unlink required by dispose
        super(eyeOpenProperty, true, false, options);
        this.disposeEyeToggleButton = ()=>{
            eyeOpenProperty.unlink(eyeOpenObserver);
        };
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'EyeToggleButton', this);
    }
};
export { EyeToggleButton as default };
sceneryPhet.register('EyeToggleButton', EyeToggleButton);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL0V5ZVRvZ2dsZUJ1dHRvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBCdXR0b24gdGhhdCB0b2dnbGVzIGJldHdlZW4gYW4gb3BlbiBhbmQgY2xvc2VkIGV5ZWJhbGwsIHVzZWQgdG8gY29udHJvbCB0aGUgdmlzaWJpbGl0eSBvZiBzb21ldGhpbmcuXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgSW5zdGFuY2VSZWdpc3RyeSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvZG9jdW1lbnRhdGlvbi9JbnN0YW5jZVJlZ2lzdHJ5LmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IHsgTm9kZSwgUGF0aCB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgZXllU2xhc2hTb2xpZFNoYXBlIGZyb20gJy4uLy4uLy4uL3NoZXJwYS9qcy9mb250YXdlc29tZS01L2V5ZVNsYXNoU29saWRTaGFwZS5qcyc7XG5pbXBvcnQgZXllU29saWRTaGFwZSBmcm9tICcuLi8uLi8uLi9zaGVycGEvanMvZm9udGF3ZXNvbWUtNS9leWVTb2xpZFNoYXBlLmpzJztcbmltcG9ydCBSZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbiwgeyBSZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbi5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vc2NlbmVyeVBoZXQuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcblxuZXhwb3J0IHR5cGUgRXllVG9nZ2xlQnV0dG9uT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxSZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbk9wdGlvbnMsICdjb250ZW50Jz47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV5ZVRvZ2dsZUJ1dHRvbiBleHRlbmRzIFJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uPGJvb2xlYW4+IHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VFeWVUb2dnbGVCdXR0b246ICgpID0+IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBleWVPcGVuUHJvcGVydHkgLSB0cnVlOiBleWUgaXMgb3BlbjsgZmFsc2U6IGV5ZSBpcyBjbG9zZWRcbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9uc1xuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBleWVPcGVuUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LCBwcm92aWRlZE9wdGlvbnM/OiBFeWVUb2dnbGVCdXR0b25PcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxFeWVUb2dnbGVCdXR0b25PcHRpb25zLCBTZWxmT3B0aW9ucywgUmVjdGFuZ3VsYXJUb2dnbGVCdXR0b25PcHRpb25zPigpKCB7fSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAvLyBpY29uc1xuICAgIGNvbnN0IGljb25PcHRpb25zID0ge1xuICAgICAgc2NhbGU6IDAuMDgsXG4gICAgICBmaWxsOiAnYmxhY2snXG4gICAgfTtcbiAgICBjb25zdCBleWVPcGVuTm9kZSA9IG5ldyBQYXRoKCBleWVTb2xpZFNoYXBlLCBpY29uT3B0aW9ucyApO1xuICAgIGNvbnN0IGV5ZUNsb3NlTm9kZSA9IG5ldyBQYXRoKCBleWVTbGFzaFNvbGlkU2hhcGUsIGljb25PcHRpb25zICk7XG4gICAgZXllQ2xvc2VOb2RlLmNlbnRlciA9IGV5ZU9wZW5Ob2RlLmNlbnRlcjtcblxuICAgIC8vIGJ1dHRvbiBjb250ZW50XG4gICAgb3B0aW9ucy5jb250ZW50ID0gbmV3IE5vZGUoIHtcbiAgICAgIGNoaWxkcmVuOiBbIGV5ZUNsb3NlTm9kZSwgZXllT3Blbk5vZGUgXVxuICAgIH0gKTtcblxuICAgIC8vIHRvZ2dsZSB3aGljaCBpY29uIGlzIHNob3duXG4gICAgY29uc3QgZXllT3Blbk9ic2VydmVyID0gKCBleWVPcGVuOiBib29sZWFuICkgPT4ge1xuICAgICAgZXllT3Blbk5vZGUudmlzaWJsZSA9IGV5ZU9wZW47XG4gICAgICBleWVDbG9zZU5vZGUudmlzaWJsZSA9ICFleWVPcGVuO1xuICAgIH07XG4gICAgZXllT3BlblByb3BlcnR5LmxpbmsoIGV5ZU9wZW5PYnNlcnZlciApOyAvLyB1bmxpbmsgcmVxdWlyZWQgYnkgZGlzcG9zZVxuXG4gICAgc3VwZXIoIGV5ZU9wZW5Qcm9wZXJ0eSwgdHJ1ZSwgZmFsc2UsIG9wdGlvbnMgKTtcblxuICAgIHRoaXMuZGlzcG9zZUV5ZVRvZ2dsZUJ1dHRvbiA9ICgpID0+IHtcbiAgICAgIGV5ZU9wZW5Qcm9wZXJ0eS51bmxpbmsoIGV5ZU9wZW5PYnNlcnZlciApO1xuICAgIH07XG5cbiAgICAvLyBzdXBwb3J0IGZvciBiaW5kZXIgZG9jdW1lbnRhdGlvbiwgc3RyaXBwZWQgb3V0IGluIGJ1aWxkcyBhbmQgb25seSBydW5zIHdoZW4gP2JpbmRlciBpcyBzcGVjaWZpZWRcbiAgICBhc3NlcnQgJiYgd2luZG93LnBoZXQ/LmNoaXBwZXI/LnF1ZXJ5UGFyYW1ldGVycz8uYmluZGVyICYmIEluc3RhbmNlUmVnaXN0cnkucmVnaXN0ZXJEYXRhVVJMKCAnc2NlbmVyeS1waGV0JywgJ0V5ZVRvZ2dsZUJ1dHRvbicsIHRoaXMgKTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZUV5ZVRvZ2dsZUJ1dHRvbigpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ0V5ZVRvZ2dsZUJ1dHRvbicsIEV5ZVRvZ2dsZUJ1dHRvbiApOyJdLCJuYW1lcyI6WyJJbnN0YW5jZVJlZ2lzdHJ5Iiwib3B0aW9uaXplIiwiTm9kZSIsIlBhdGgiLCJleWVTbGFzaFNvbGlkU2hhcGUiLCJleWVTb2xpZFNoYXBlIiwiUmVjdGFuZ3VsYXJUb2dnbGVCdXR0b24iLCJzY2VuZXJ5UGhldCIsIkV5ZVRvZ2dsZUJ1dHRvbiIsImRpc3Bvc2UiLCJkaXNwb3NlRXllVG9nZ2xlQnV0dG9uIiwiZXllT3BlblByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwid2luZG93Iiwib3B0aW9ucyIsImljb25PcHRpb25zIiwic2NhbGUiLCJmaWxsIiwiZXllT3Blbk5vZGUiLCJleWVDbG9zZU5vZGUiLCJjZW50ZXIiLCJjb250ZW50IiwiY2hpbGRyZW4iLCJleWVPcGVuT2JzZXJ2ZXIiLCJleWVPcGVuIiwidmlzaWJsZSIsImxpbmsiLCJ1bmxpbmsiLCJhc3NlcnQiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImJpbmRlciIsInJlZ2lzdGVyRGF0YVVSTCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUdELE9BQU9BLHNCQUFzQiwwREFBMEQ7QUFDdkYsT0FBT0MsZUFBcUMscUNBQXFDO0FBRWpGLFNBQVNDLElBQUksRUFBRUMsSUFBSSxRQUFRLGlDQUFpQztBQUM1RCxPQUFPQyx3QkFBd0IseURBQXlEO0FBQ3hGLE9BQU9DLG1CQUFtQixvREFBb0Q7QUFDOUUsT0FBT0MsNkJBQWlFLHFEQUFxRDtBQUM3SCxPQUFPQyxpQkFBaUIsb0JBQW9CO0FBTTdCLElBQUEsQUFBTUMsa0JBQU4sTUFBTUEsd0JBQXdCRjtJQTJDM0JHLFVBQWdCO1FBQzlCLElBQUksQ0FBQ0Msc0JBQXNCO1FBQzNCLEtBQUssQ0FBQ0Q7SUFDUjtJQTFDQTs7O0dBR0MsR0FDRCxZQUFvQkUsZUFBa0MsRUFBRUMsZUFBd0MsQ0FBRztZQWdDdkZDLHNDQUFBQSxzQkFBQUE7UUE5QlYsTUFBTUMsVUFBVWIsWUFBa0YsQ0FBQyxHQUFHVztRQUV0RyxRQUFRO1FBQ1IsTUFBTUcsY0FBYztZQUNsQkMsT0FBTztZQUNQQyxNQUFNO1FBQ1I7UUFDQSxNQUFNQyxjQUFjLElBQUlmLEtBQU1FLGVBQWVVO1FBQzdDLE1BQU1JLGVBQWUsSUFBSWhCLEtBQU1DLG9CQUFvQlc7UUFDbkRJLGFBQWFDLE1BQU0sR0FBR0YsWUFBWUUsTUFBTTtRQUV4QyxpQkFBaUI7UUFDakJOLFFBQVFPLE9BQU8sR0FBRyxJQUFJbkIsS0FBTTtZQUMxQm9CLFVBQVU7Z0JBQUVIO2dCQUFjRDthQUFhO1FBQ3pDO1FBRUEsNkJBQTZCO1FBQzdCLE1BQU1LLGtCQUFrQixDQUFFQztZQUN4Qk4sWUFBWU8sT0FBTyxHQUFHRDtZQUN0QkwsYUFBYU0sT0FBTyxHQUFHLENBQUNEO1FBQzFCO1FBQ0FiLGdCQUFnQmUsSUFBSSxDQUFFSCxrQkFBbUIsNkJBQTZCO1FBRXRFLEtBQUssQ0FBRVosaUJBQWlCLE1BQU0sT0FBT0c7UUFFckMsSUFBSSxDQUFDSixzQkFBc0IsR0FBRztZQUM1QkMsZ0JBQWdCZ0IsTUFBTSxDQUFFSjtRQUMxQjtRQUVBLG1HQUFtRztRQUNuR0ssWUFBVWYsZUFBQUEsT0FBT2dCLElBQUksc0JBQVhoQix1QkFBQUEsYUFBYWlCLE9BQU8sc0JBQXBCakIsdUNBQUFBLHFCQUFzQmtCLGVBQWUscUJBQXJDbEIscUNBQXVDbUIsTUFBTSxLQUFJaEMsaUJBQWlCaUMsZUFBZSxDQUFFLGdCQUFnQixtQkFBbUIsSUFBSTtJQUN0STtBQU1GO0FBL0NBLFNBQXFCekIsNkJBK0NwQjtBQUVERCxZQUFZMkIsUUFBUSxDQUFFLG1CQUFtQjFCIn0=