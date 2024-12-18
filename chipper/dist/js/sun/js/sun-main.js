// Copyright 2014-2024, University of Colorado Boulder
/**
 * Main file for the Sun library demo.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */ import Property from '../../axon/js/Property.js';
import Screen from '../../joist/js/Screen.js';
import ScreenIcon from '../../joist/js/ScreenIcon.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import { Color, Rectangle } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import ButtonsScreenView from './demo/buttons/ButtonsScreenView.js';
import ComponentsScreenView from './demo/components/ComponentsScreenView.js';
import DialogsScreenView from './demo/dialogs/DialogsScreenView.js';
import sunQueryParameters from './sunQueryParameters.js';
import SunStrings from './SunStrings.js';
// empty model used for all demo screens
let Model = class Model {
    reset() {}
};
simLauncher.launch(()=>{
    const screens = [
        new ButtonScreen(Tandem.ROOT.createTandem('buttonsScreen')),
        new ComponentsScreen(Tandem.ROOT.createTandem('componentsScreen')),
        new DialogsScreen(Tandem.ROOT.createTandem('dialogsScreen'))
    ];
    const sim = new Sim(SunStrings.sun.titleStringProperty, screens, {
        credits: {
            leadDesign: 'PhET Interactive Simulations'
        },
        phetioDesigned: true
    });
    sim.start();
});
let ButtonScreen = class ButtonScreen extends Screen {
    constructor(tandem){
        super(()=>new Model(), ()=>new ButtonsScreenView({
                tandem: tandem.createTandem('view')
            }), {
            name: SunStrings.screen.buttonsStringProperty,
            backgroundColorProperty: new Property(Color.toColor(sunQueryParameters.backgroundColor)),
            homeScreenIcon: createScreenIcon('red'),
            tandem: tandem
        });
    }
};
let ComponentsScreen = class ComponentsScreen extends Screen {
    constructor(tandem){
        super(()=>new Model(), ()=>new ComponentsScreenView({
                tandem: tandem.createTandem('view')
            }), {
            name: SunStrings.screen.componentsStringProperty,
            backgroundColorProperty: new Property(Color.toColor(sunQueryParameters.backgroundColor)),
            homeScreenIcon: createScreenIcon('yellow'),
            tandem: tandem
        });
    }
};
let DialogsScreen = class DialogsScreen extends Screen {
    constructor(tandem){
        super(()=>new Model(), ()=>new DialogsScreenView({
                tandem: tandem.createTandem('view')
            }), {
            name: SunStrings.screen.dialogsStringProperty,
            backgroundColorProperty: new Property(Color.toColor(sunQueryParameters.backgroundColor)),
            homeScreenIcon: createScreenIcon('purple'),
            tandem: tandem
        });
    }
};
/**
 * Creates a simple screen icon, a colored rectangle.
 */ function createScreenIcon(color) {
    return new ScreenIcon(new Rectangle(0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, {
        fill: color
    }));
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9zdW4tbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBNYWluIGZpbGUgZm9yIHRoZSBTdW4gbGlicmFyeSBkZW1vLlxuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IFNjcmVlbiBmcm9tICcuLi8uLi9qb2lzdC9qcy9TY3JlZW4uanMnO1xuaW1wb3J0IFNjcmVlbkljb24gZnJvbSAnLi4vLi4vam9pc3QvanMvU2NyZWVuSWNvbi5qcyc7XG5pbXBvcnQgU2ltIGZyb20gJy4uLy4uL2pvaXN0L2pzL1NpbS5qcyc7XG5pbXBvcnQgc2ltTGF1bmNoZXIgZnJvbSAnLi4vLi4vam9pc3QvanMvc2ltTGF1bmNoZXIuanMnO1xuaW1wb3J0IFRNb2RlbCBmcm9tICcuLi8uLi9qb2lzdC9qcy9UTW9kZWwuanMnO1xuaW1wb3J0IHsgQ29sb3IsIFJlY3RhbmdsZSwgVENvbG9yIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgQnV0dG9uc1NjcmVlblZpZXcgZnJvbSAnLi9kZW1vL2J1dHRvbnMvQnV0dG9uc1NjcmVlblZpZXcuanMnO1xuaW1wb3J0IENvbXBvbmVudHNTY3JlZW5WaWV3IGZyb20gJy4vZGVtby9jb21wb25lbnRzL0NvbXBvbmVudHNTY3JlZW5WaWV3LmpzJztcbmltcG9ydCBEaWFsb2dzU2NyZWVuVmlldyBmcm9tICcuL2RlbW8vZGlhbG9ncy9EaWFsb2dzU2NyZWVuVmlldy5qcyc7XG5pbXBvcnQgc3VuUXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4vc3VuUXVlcnlQYXJhbWV0ZXJzLmpzJztcbmltcG9ydCBTdW5TdHJpbmdzIGZyb20gJy4vU3VuU3RyaW5ncy5qcyc7XG5cbi8vIGVtcHR5IG1vZGVsIHVzZWQgZm9yIGFsbCBkZW1vIHNjcmVlbnNcbmNsYXNzIE1vZGVsIGltcGxlbWVudHMgVE1vZGVsIHtcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQgeyAvKiBub3RoaW5nIHRvIGRvICovIH1cbn1cblxuc2ltTGF1bmNoZXIubGF1bmNoKCAoKSA9PiB7XG5cbiAgY29uc3Qgc2NyZWVucyA9IFtcbiAgICBuZXcgQnV0dG9uU2NyZWVuKCBUYW5kZW0uUk9PVC5jcmVhdGVUYW5kZW0oICdidXR0b25zU2NyZWVuJyApICksXG4gICAgbmV3IENvbXBvbmVudHNTY3JlZW4oIFRhbmRlbS5ST09ULmNyZWF0ZVRhbmRlbSggJ2NvbXBvbmVudHNTY3JlZW4nICkgKSxcbiAgICBuZXcgRGlhbG9nc1NjcmVlbiggVGFuZGVtLlJPT1QuY3JlYXRlVGFuZGVtKCAnZGlhbG9nc1NjcmVlbicgKSApXG4gIF07XG5cbiAgY29uc3Qgc2ltID0gbmV3IFNpbSggU3VuU3RyaW5ncy5zdW4udGl0bGVTdHJpbmdQcm9wZXJ0eSwgc2NyZWVucywge1xuICAgIGNyZWRpdHM6IHtcbiAgICAgIGxlYWREZXNpZ246ICdQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zJ1xuICAgIH0sXG4gICAgcGhldGlvRGVzaWduZWQ6IHRydWVcbiAgfSApO1xuXG4gIHNpbS5zdGFydCgpO1xufSApO1xuXG5jbGFzcyBCdXR0b25TY3JlZW4gZXh0ZW5kcyBTY3JlZW48TW9kZWwsIEJ1dHRvbnNTY3JlZW5WaWV3PiB7XG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdGFuZGVtOiBUYW5kZW0gKSB7XG4gICAgc3VwZXIoXG4gICAgICAoKSA9PiBuZXcgTW9kZWwoKSxcbiAgICAgICgpID0+IG5ldyBCdXR0b25zU2NyZWVuVmlldyggeyB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2aWV3JyApIH0gKSwge1xuICAgICAgICBuYW1lOiBTdW5TdHJpbmdzLnNjcmVlbi5idXR0b25zU3RyaW5nUHJvcGVydHksXG4gICAgICAgIGJhY2tncm91bmRDb2xvclByb3BlcnR5OiBuZXcgUHJvcGVydHkoIENvbG9yLnRvQ29sb3IoIHN1blF1ZXJ5UGFyYW1ldGVycy5iYWNrZ3JvdW5kQ29sb3IgKSApLFxuICAgICAgICBob21lU2NyZWVuSWNvbjogY3JlYXRlU2NyZWVuSWNvbiggJ3JlZCcgKSxcbiAgICAgICAgdGFuZGVtOiB0YW5kZW1cbiAgICAgIH1cbiAgICApO1xuICB9XG59XG5cbmNsYXNzIENvbXBvbmVudHNTY3JlZW4gZXh0ZW5kcyBTY3JlZW48TW9kZWwsIENvbXBvbmVudHNTY3JlZW5WaWV3PiB7XG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdGFuZGVtOiBUYW5kZW0gKSB7XG4gICAgc3VwZXIoXG4gICAgICAoKSA9PiBuZXcgTW9kZWwoKSxcbiAgICAgICgpID0+IG5ldyBDb21wb25lbnRzU2NyZWVuVmlldyggeyB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2aWV3JyApIH0gKSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogU3VuU3RyaW5ncy5zY3JlZW4uY29tcG9uZW50c1N0cmluZ1Byb3BlcnR5LFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCBDb2xvci50b0NvbG9yKCBzdW5RdWVyeVBhcmFtZXRlcnMuYmFja2dyb3VuZENvbG9yICkgKSxcbiAgICAgICAgaG9tZVNjcmVlbkljb246IGNyZWF0ZVNjcmVlbkljb24oICd5ZWxsb3cnICksXG4gICAgICAgIHRhbmRlbTogdGFuZGVtXG4gICAgICB9XG4gICAgKTtcbiAgfVxufVxuXG5jbGFzcyBEaWFsb2dzU2NyZWVuIGV4dGVuZHMgU2NyZWVuPE1vZGVsLCBEaWFsb2dzU2NyZWVuVmlldz4ge1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHRhbmRlbTogVGFuZGVtICkge1xuICAgIHN1cGVyKFxuICAgICAgKCkgPT4gbmV3IE1vZGVsKCksXG4gICAgICAoKSA9PiBuZXcgRGlhbG9nc1NjcmVlblZpZXcoIHsgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlldycgKSB9ICksXG4gICAgICB7XG4gICAgICAgIG5hbWU6IFN1blN0cmluZ3Muc2NyZWVuLmRpYWxvZ3NTdHJpbmdQcm9wZXJ0eSxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggQ29sb3IudG9Db2xvciggc3VuUXVlcnlQYXJhbWV0ZXJzLmJhY2tncm91bmRDb2xvciApICksXG4gICAgICAgIGhvbWVTY3JlZW5JY29uOiBjcmVhdGVTY3JlZW5JY29uKCAncHVycGxlJyApLFxuICAgICAgICB0YW5kZW06IHRhbmRlbVxuICAgICAgfVxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgc2ltcGxlIHNjcmVlbiBpY29uLCBhIGNvbG9yZWQgcmVjdGFuZ2xlLlxuICovXG5mdW5jdGlvbiBjcmVhdGVTY3JlZW5JY29uKCBjb2xvcjogVENvbG9yICk6IFNjcmVlbkljb24ge1xuICByZXR1cm4gbmV3IFNjcmVlbkljb24oXG4gICAgbmV3IFJlY3RhbmdsZSggMCwgMCwgU2NyZWVuLk1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFLndpZHRoLCBTY3JlZW4uTUlOSU1VTV9IT01FX1NDUkVFTl9JQ09OX1NJWkUuaGVpZ2h0LCB7XG4gICAgICBmaWxsOiBjb2xvclxuICAgIH0gKVxuICApO1xufSJdLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIlNjcmVlbkljb24iLCJTaW0iLCJzaW1MYXVuY2hlciIsIkNvbG9yIiwiUmVjdGFuZ2xlIiwiVGFuZGVtIiwiQnV0dG9uc1NjcmVlblZpZXciLCJDb21wb25lbnRzU2NyZWVuVmlldyIsIkRpYWxvZ3NTY3JlZW5WaWV3Iiwic3VuUXVlcnlQYXJhbWV0ZXJzIiwiU3VuU3RyaW5ncyIsIk1vZGVsIiwicmVzZXQiLCJsYXVuY2giLCJzY3JlZW5zIiwiQnV0dG9uU2NyZWVuIiwiUk9PVCIsImNyZWF0ZVRhbmRlbSIsIkNvbXBvbmVudHNTY3JlZW4iLCJEaWFsb2dzU2NyZWVuIiwic2ltIiwic3VuIiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsImNyZWRpdHMiLCJsZWFkRGVzaWduIiwicGhldGlvRGVzaWduZWQiLCJzdGFydCIsInRhbmRlbSIsIm5hbWUiLCJzY3JlZW4iLCJidXR0b25zU3RyaW5nUHJvcGVydHkiLCJiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsInRvQ29sb3IiLCJiYWNrZ3JvdW5kQ29sb3IiLCJob21lU2NyZWVuSWNvbiIsImNyZWF0ZVNjcmVlbkljb24iLCJjb21wb25lbnRzU3RyaW5nUHJvcGVydHkiLCJkaWFsb2dzU3RyaW5nUHJvcGVydHkiLCJjb2xvciIsIk1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFIiwid2lkdGgiLCJoZWlnaHQiLCJmaWxsIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGNBQWMsNEJBQTRCO0FBQ2pELE9BQU9DLFlBQVksMkJBQTJCO0FBQzlDLE9BQU9DLGdCQUFnQiwrQkFBK0I7QUFDdEQsT0FBT0MsU0FBUyx3QkFBd0I7QUFDeEMsT0FBT0MsaUJBQWlCLGdDQUFnQztBQUV4RCxTQUFTQyxLQUFLLEVBQUVDLFNBQVMsUUFBZ0IsOEJBQThCO0FBQ3ZFLE9BQU9DLFlBQVksNEJBQTRCO0FBQy9DLE9BQU9DLHVCQUF1QixzQ0FBc0M7QUFDcEUsT0FBT0MsMEJBQTBCLDRDQUE0QztBQUM3RSxPQUFPQyx1QkFBdUIsc0NBQXNDO0FBQ3BFLE9BQU9DLHdCQUF3QiwwQkFBMEI7QUFDekQsT0FBT0MsZ0JBQWdCLGtCQUFrQjtBQUV6Qyx3Q0FBd0M7QUFDeEMsSUFBQSxBQUFNQyxRQUFOLE1BQU1BO0lBQ0dDLFFBQWMsQ0FBc0I7QUFDN0M7QUFFQVYsWUFBWVcsTUFBTSxDQUFFO0lBRWxCLE1BQU1DLFVBQVU7UUFDZCxJQUFJQyxhQUFjVixPQUFPVyxJQUFJLENBQUNDLFlBQVksQ0FBRTtRQUM1QyxJQUFJQyxpQkFBa0JiLE9BQU9XLElBQUksQ0FBQ0MsWUFBWSxDQUFFO1FBQ2hELElBQUlFLGNBQWVkLE9BQU9XLElBQUksQ0FBQ0MsWUFBWSxDQUFFO0tBQzlDO0lBRUQsTUFBTUcsTUFBTSxJQUFJbkIsSUFBS1MsV0FBV1csR0FBRyxDQUFDQyxtQkFBbUIsRUFBRVIsU0FBUztRQUNoRVMsU0FBUztZQUNQQyxZQUFZO1FBQ2Q7UUFDQUMsZ0JBQWdCO0lBQ2xCO0lBRUFMLElBQUlNLEtBQUs7QUFDWDtBQUVBLElBQUEsQUFBTVgsZUFBTixNQUFNQSxxQkFBcUJoQjtJQUN6QixZQUFvQjRCLE1BQWMsQ0FBRztRQUNuQyxLQUFLLENBQ0gsSUFBTSxJQUFJaEIsU0FDVixJQUFNLElBQUlMLGtCQUFtQjtnQkFBRXFCLFFBQVFBLE9BQU9WLFlBQVksQ0FBRTtZQUFTLElBQUs7WUFDeEVXLE1BQU1sQixXQUFXbUIsTUFBTSxDQUFDQyxxQkFBcUI7WUFDN0NDLHlCQUF5QixJQUFJakMsU0FBVUssTUFBTTZCLE9BQU8sQ0FBRXZCLG1CQUFtQndCLGVBQWU7WUFDeEZDLGdCQUFnQkMsaUJBQWtCO1lBQ2xDUixRQUFRQTtRQUNWO0lBRUo7QUFDRjtBQUVBLElBQUEsQUFBTVQsbUJBQU4sTUFBTUEseUJBQXlCbkI7SUFDN0IsWUFBb0I0QixNQUFjLENBQUc7UUFDbkMsS0FBSyxDQUNILElBQU0sSUFBSWhCLFNBQ1YsSUFBTSxJQUFJSixxQkFBc0I7Z0JBQUVvQixRQUFRQSxPQUFPVixZQUFZLENBQUU7WUFBUyxJQUN4RTtZQUNFVyxNQUFNbEIsV0FBV21CLE1BQU0sQ0FBQ08sd0JBQXdCO1lBQ2hETCx5QkFBeUIsSUFBSWpDLFNBQVVLLE1BQU02QixPQUFPLENBQUV2QixtQkFBbUJ3QixlQUFlO1lBQ3hGQyxnQkFBZ0JDLGlCQUFrQjtZQUNsQ1IsUUFBUUE7UUFDVjtJQUVKO0FBQ0Y7QUFFQSxJQUFBLEFBQU1SLGdCQUFOLE1BQU1BLHNCQUFzQnBCO0lBQzFCLFlBQW9CNEIsTUFBYyxDQUFHO1FBQ25DLEtBQUssQ0FDSCxJQUFNLElBQUloQixTQUNWLElBQU0sSUFBSUgsa0JBQW1CO2dCQUFFbUIsUUFBUUEsT0FBT1YsWUFBWSxDQUFFO1lBQVMsSUFDckU7WUFDRVcsTUFBTWxCLFdBQVdtQixNQUFNLENBQUNRLHFCQUFxQjtZQUM3Q04seUJBQXlCLElBQUlqQyxTQUFVSyxNQUFNNkIsT0FBTyxDQUFFdkIsbUJBQW1Cd0IsZUFBZTtZQUN4RkMsZ0JBQWdCQyxpQkFBa0I7WUFDbENSLFFBQVFBO1FBQ1Y7SUFFSjtBQUNGO0FBRUE7O0NBRUMsR0FDRCxTQUFTUSxpQkFBa0JHLEtBQWE7SUFDdEMsT0FBTyxJQUFJdEMsV0FDVCxJQUFJSSxVQUFXLEdBQUcsR0FBR0wsT0FBT3dDLDZCQUE2QixDQUFDQyxLQUFLLEVBQUV6QyxPQUFPd0MsNkJBQTZCLENBQUNFLE1BQU0sRUFBRTtRQUM1R0MsTUFBTUo7SUFDUjtBQUVKIn0=