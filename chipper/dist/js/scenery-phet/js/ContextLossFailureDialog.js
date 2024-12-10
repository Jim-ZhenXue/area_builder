// Copyright 2015-2024, University of Colorado Boulder
/**
 * Failure message displayed when a WebGL context loss is experienced and we can't recover. Offers a button to reload
 * the simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import optionize from '../../phet-core/js/optionize.js';
import { HBox, Path, Text } from '../../scenery/js/imports.js';
import warningSignShape from '../../sherpa/js/fontawesome-4/warningSignShape.js';
import TextPushButton from '../../sun/js/buttons/TextPushButton.js';
import Dialog from '../../sun/js/Dialog.js';
import Tandem from '../../tandem/js/Tandem.js';
import PhetFont from './PhetFont.js';
import sceneryPhet from './sceneryPhet.js';
import SceneryPhetStrings from './SceneryPhetStrings.js';
let ContextLossFailureDialog = class ContextLossFailureDialog extends Dialog {
    dispose() {
        this.disposeContextLossFailureDialog();
        super.dispose();
    }
    /**
   * Invokes the reload callback when the dialog is hidden.
   * See https://github.com/phetsims/scenery-phet/issues/373.
   */ hide() {
        this.reload();
        super.hide();
    }
    /**
   * Hides the dialog without invoking the reload callback.
   */ hideWithoutReload() {
        super.hide();
    }
    constructor(providedOptions){
        const options = optionize()({
            // ContextLossFailureDialogOptions
            reload: ()=>window.location.reload(),
            // Dialog options
            xSpacing: 30,
            topMargin: 30,
            bottomMargin: 30,
            leftMargin: 30
        }, providedOptions);
        const warningSign = new Path(warningSignShape, {
            fill: '#E87600',
            scale: 0.03
        });
        const text = new Text(SceneryPhetStrings.webglWarning.contextLossFailureStringProperty, {
            font: new PhetFont(12)
        });
        const button = new TextPushButton(SceneryPhetStrings.webglWarning.contextLossReloadStringProperty, {
            font: new PhetFont(12),
            baseColor: '#E87600',
            listener: ()=>this.hide(),
            tandem: Tandem.OPT_OUT
        });
        const content = new HBox({
            children: [
                warningSign,
                text,
                button
            ],
            spacing: 10
        });
        super(content, options);
        this.reload = options.reload;
        this.disposeContextLossFailureDialog = ()=>{
            text.dispose();
            button.dispose();
        };
    }
};
export { ContextLossFailureDialog as default };
sceneryPhet.register('ContextLossFailureDialog', ContextLossFailureDialog);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9Db250ZXh0TG9zc0ZhaWx1cmVEaWFsb2cudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRmFpbHVyZSBtZXNzYWdlIGRpc3BsYXllZCB3aGVuIGEgV2ViR0wgY29udGV4dCBsb3NzIGlzIGV4cGVyaWVuY2VkIGFuZCB3ZSBjYW4ndCByZWNvdmVyLiBPZmZlcnMgYSBidXR0b24gdG8gcmVsb2FkXG4gKiB0aGUgc2ltdWxhdGlvbi5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCB7IEhCb3gsIFBhdGgsIFRleHQgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHdhcm5pbmdTaWduU2hhcGUgZnJvbSAnLi4vLi4vc2hlcnBhL2pzL2ZvbnRhd2Vzb21lLTQvd2FybmluZ1NpZ25TaGFwZS5qcyc7XG5pbXBvcnQgVGV4dFB1c2hCdXR0b24gZnJvbSAnLi4vLi4vc3VuL2pzL2J1dHRvbnMvVGV4dFB1c2hCdXR0b24uanMnO1xuaW1wb3J0IERpYWxvZywgeyBEaWFsb2dPcHRpb25zIH0gZnJvbSAnLi4vLi4vc3VuL2pzL0RpYWxvZy5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4vUGhldEZvbnQuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuaW1wb3J0IFNjZW5lcnlQaGV0U3RyaW5ncyBmcm9tICcuL1NjZW5lcnlQaGV0U3RyaW5ncy5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG5cbiAgLy8gQnkgZGVmYXVsdCwgcHJlc3NpbmcgdGhlIFJlbG9hZCBidXR0b24gcmVsb2FkcyB0aGUgc2ltdWxhdGlvbiBpbiB0aGUgYnJvd3Nlci5cbiAgLy8gUHJvdmlkZWQgYXMgYW4gb3B0aW9uIHNvIHRoYXQgc2NlbmVyeS1waGV0IGRlbW8gYXBwIGNhbiB0ZXN0IHdpdGhvdXQgY2F1c2luZyBhdXRvbWF0ZWQtdGVzdGluZyBmYWlsdXJlcy5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5LXBoZXQvaXNzdWVzLzM3NVxuICByZWxvYWQ/OiAoKSA9PiB2b2lkO1xufTtcblxuZXhwb3J0IHR5cGUgQ29udGV4dExvc3NGYWlsdXJlRGlhbG9nT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgRGlhbG9nT3B0aW9ucztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29udGV4dExvc3NGYWlsdXJlRGlhbG9nIGV4dGVuZHMgRGlhbG9nIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IHJlbG9hZDogKCkgPT4gdm9pZDsgLy8gc2VlIFNlbGZPcHRpb25zLnJlbG9hZFxuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUNvbnRleHRMb3NzRmFpbHVyZURpYWxvZzogKCkgPT4gdm9pZDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IENvbnRleHRMb3NzRmFpbHVyZURpYWxvZ09wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPENvbnRleHRMb3NzRmFpbHVyZURpYWxvZ09wdGlvbnMsIFNlbGZPcHRpb25zLCBEaWFsb2dPcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIENvbnRleHRMb3NzRmFpbHVyZURpYWxvZ09wdGlvbnNcbiAgICAgIHJlbG9hZDogKCkgPT4gd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpLFxuXG4gICAgICAvLyBEaWFsb2cgb3B0aW9uc1xuICAgICAgeFNwYWNpbmc6IDMwLFxuICAgICAgdG9wTWFyZ2luOiAzMCxcbiAgICAgIGJvdHRvbU1hcmdpbjogMzAsXG4gICAgICBsZWZ0TWFyZ2luOiAzMFxuXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBjb25zdCB3YXJuaW5nU2lnbiA9IG5ldyBQYXRoKCB3YXJuaW5nU2lnblNoYXBlLCB7XG4gICAgICBmaWxsOiAnI0U4NzYwMCcsIC8vIFwic2FmZXR5IG9yYW5nZVwiLCBhY2NvcmRpbmcgdG8gV2lraXBlZGlhXG4gICAgICBzY2FsZTogMC4wM1xuICAgIH0gKTtcblxuICAgIGNvbnN0IHRleHQgPSBuZXcgVGV4dCggU2NlbmVyeVBoZXRTdHJpbmdzLndlYmdsV2FybmluZy5jb250ZXh0TG9zc0ZhaWx1cmVTdHJpbmdQcm9wZXJ0eSwge1xuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxMiApXG4gICAgfSApO1xuXG4gICAgY29uc3QgYnV0dG9uID0gbmV3IFRleHRQdXNoQnV0dG9uKCBTY2VuZXJ5UGhldFN0cmluZ3Mud2ViZ2xXYXJuaW5nLmNvbnRleHRMb3NzUmVsb2FkU3RyaW5nUHJvcGVydHksIHtcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTIgKSxcbiAgICAgIGJhc2VDb2xvcjogJyNFODc2MDAnLFxuICAgICAgbGlzdGVuZXI6ICgpID0+IHRoaXMuaGlkZSgpLFxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxuICAgIH0gKTtcblxuICAgIGNvbnN0IGNvbnRlbnQgPSBuZXcgSEJveCgge1xuICAgICAgY2hpbGRyZW46IFsgd2FybmluZ1NpZ24sIHRleHQsIGJ1dHRvbiBdLFxuICAgICAgc3BhY2luZzogMTBcbiAgICB9ICk7XG5cbiAgICBzdXBlciggY29udGVudCwgb3B0aW9ucyApO1xuXG4gICAgdGhpcy5yZWxvYWQgPSBvcHRpb25zLnJlbG9hZDtcblxuICAgIHRoaXMuZGlzcG9zZUNvbnRleHRMb3NzRmFpbHVyZURpYWxvZyA9ICgpID0+IHtcbiAgICAgIHRleHQuZGlzcG9zZSgpO1xuICAgICAgYnV0dG9uLmRpc3Bvc2UoKTtcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlQ29udGV4dExvc3NGYWlsdXJlRGlhbG9nKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEludm9rZXMgdGhlIHJlbG9hZCBjYWxsYmFjayB3aGVuIHRoZSBkaWFsb2cgaXMgaGlkZGVuLlxuICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvMzczLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGhpZGUoKTogdm9pZCB7XG4gICAgdGhpcy5yZWxvYWQoKTtcbiAgICBzdXBlci5oaWRlKCk7XG4gIH1cblxuICAvKipcbiAgICogSGlkZXMgdGhlIGRpYWxvZyB3aXRob3V0IGludm9raW5nIHRoZSByZWxvYWQgY2FsbGJhY2suXG4gICAqL1xuICBwdWJsaWMgaGlkZVdpdGhvdXRSZWxvYWQoKTogdm9pZCB7XG4gICAgc3VwZXIuaGlkZSgpO1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnQ29udGV4dExvc3NGYWlsdXJlRGlhbG9nJywgQ29udGV4dExvc3NGYWlsdXJlRGlhbG9nICk7Il0sIm5hbWVzIjpbIm9wdGlvbml6ZSIsIkhCb3giLCJQYXRoIiwiVGV4dCIsIndhcm5pbmdTaWduU2hhcGUiLCJUZXh0UHVzaEJ1dHRvbiIsIkRpYWxvZyIsIlRhbmRlbSIsIlBoZXRGb250Iiwic2NlbmVyeVBoZXQiLCJTY2VuZXJ5UGhldFN0cmluZ3MiLCJDb250ZXh0TG9zc0ZhaWx1cmVEaWFsb2ciLCJkaXNwb3NlIiwiZGlzcG9zZUNvbnRleHRMb3NzRmFpbHVyZURpYWxvZyIsImhpZGUiLCJyZWxvYWQiLCJoaWRlV2l0aG91dFJlbG9hZCIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInhTcGFjaW5nIiwidG9wTWFyZ2luIiwiYm90dG9tTWFyZ2luIiwibGVmdE1hcmdpbiIsIndhcm5pbmdTaWduIiwiZmlsbCIsInNjYWxlIiwidGV4dCIsIndlYmdsV2FybmluZyIsImNvbnRleHRMb3NzRmFpbHVyZVN0cmluZ1Byb3BlcnR5IiwiZm9udCIsImJ1dHRvbiIsImNvbnRleHRMb3NzUmVsb2FkU3RyaW5nUHJvcGVydHkiLCJiYXNlQ29sb3IiLCJsaXN0ZW5lciIsInRhbmRlbSIsIk9QVF9PVVQiLCJjb250ZW50IiwiY2hpbGRyZW4iLCJzcGFjaW5nIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELE9BQU9BLGVBQWUsa0NBQWtDO0FBQ3hELFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsOEJBQThCO0FBQy9ELE9BQU9DLHNCQUFzQixvREFBb0Q7QUFDakYsT0FBT0Msb0JBQW9CLHlDQUF5QztBQUNwRSxPQUFPQyxZQUErQix5QkFBeUI7QUFDL0QsT0FBT0MsWUFBWSw0QkFBNEI7QUFDL0MsT0FBT0MsY0FBYyxnQkFBZ0I7QUFDckMsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQUMzQyxPQUFPQyx3QkFBd0IsMEJBQTBCO0FBWTFDLElBQUEsQUFBTUMsMkJBQU4sTUFBTUEsaUNBQWlDTDtJQW9EcENNLFVBQWdCO1FBQzlCLElBQUksQ0FBQ0MsK0JBQStCO1FBQ3BDLEtBQUssQ0FBQ0Q7SUFDUjtJQUVBOzs7R0FHQyxHQUNELEFBQWdCRSxPQUFhO1FBQzNCLElBQUksQ0FBQ0MsTUFBTTtRQUNYLEtBQUssQ0FBQ0Q7SUFDUjtJQUVBOztHQUVDLEdBQ0QsQUFBT0Usb0JBQTBCO1FBQy9CLEtBQUssQ0FBQ0Y7SUFDUjtJQWpFQSxZQUFvQkcsZUFBaUQsQ0FBRztRQUV0RSxNQUFNQyxVQUFVbEIsWUFBMEU7WUFFeEYsa0NBQWtDO1lBQ2xDZSxRQUFRLElBQU1JLE9BQU9DLFFBQVEsQ0FBQ0wsTUFBTTtZQUVwQyxpQkFBaUI7WUFDakJNLFVBQVU7WUFDVkMsV0FBVztZQUNYQyxjQUFjO1lBQ2RDLFlBQVk7UUFFZCxHQUFHUDtRQUVILE1BQU1RLGNBQWMsSUFBSXZCLEtBQU1FLGtCQUFrQjtZQUM5Q3NCLE1BQU07WUFDTkMsT0FBTztRQUNUO1FBRUEsTUFBTUMsT0FBTyxJQUFJekIsS0FBTU8sbUJBQW1CbUIsWUFBWSxDQUFDQyxnQ0FBZ0MsRUFBRTtZQUN2RkMsTUFBTSxJQUFJdkIsU0FBVTtRQUN0QjtRQUVBLE1BQU13QixTQUFTLElBQUkzQixlQUFnQkssbUJBQW1CbUIsWUFBWSxDQUFDSSwrQkFBK0IsRUFBRTtZQUNsR0YsTUFBTSxJQUFJdkIsU0FBVTtZQUNwQjBCLFdBQVc7WUFDWEMsVUFBVSxJQUFNLElBQUksQ0FBQ3JCLElBQUk7WUFDekJzQixRQUFRN0IsT0FBTzhCLE9BQU87UUFDeEI7UUFFQSxNQUFNQyxVQUFVLElBQUlyQyxLQUFNO1lBQ3hCc0MsVUFBVTtnQkFBRWQ7Z0JBQWFHO2dCQUFNSTthQUFRO1lBQ3ZDUSxTQUFTO1FBQ1g7UUFFQSxLQUFLLENBQUVGLFNBQVNwQjtRQUVoQixJQUFJLENBQUNILE1BQU0sR0FBR0csUUFBUUgsTUFBTTtRQUU1QixJQUFJLENBQUNGLCtCQUErQixHQUFHO1lBQ3JDZSxLQUFLaEIsT0FBTztZQUNab0IsT0FBT3BCLE9BQU87UUFDaEI7SUFDRjtBQXNCRjtBQXhFQSxTQUFxQkQsc0NBd0VwQjtBQUVERixZQUFZZ0MsUUFBUSxDQUFFLDRCQUE0QjlCIn0=