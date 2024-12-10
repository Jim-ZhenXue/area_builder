// Copyright 2019-2024, University of Colorado Boulder
/**
 * OopsDialog is displayed when some limitation of the simulation is encountered.
 * So named because the messages typically begin with 'Oops!', so that's how people referred to it.
 * See https://github.com/phetsims/equality-explorer/issues/48
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import optionize from '../../phet-core/js/optionize.js';
import { HBox, Image, RichText } from '../../scenery/js/imports.js';
import Dialog from '../../sun/js/Dialog.js';
import IOType from '../../tandem/js/types/IOType.js';
import phetGirlWaggingFinger_png from '../images/phetGirlWaggingFinger_png.js';
import PhetFont from './PhetFont.js';
import sceneryPhet from './sceneryPhet.js';
let OopsDialog = class OopsDialog extends Dialog {
    dispose() {
        this.disposeOopsDialog();
        super.dispose();
    }
    /**
   * @param messageString - supports RichText formatting
   * @param [providedOptions]
   */ constructor(messageString, providedOptions){
        const options = optionize()({
            // DialogOptions
            topMargin: 20,
            bottomMargin: 20,
            // phet-io
            phetioType: OopsDialog.OopsDialogIO
        }, providedOptions);
        const text = new RichText(messageString, optionize()({
            font: new PhetFont(20),
            maxWidth: 600,
            maxHeight: 400
        }, options.richTextOptions));
        const iconNode = options.iconNode || new Image(phetGirlWaggingFinger_png, {
            maxHeight: 132 // determined empirically
        });
        const content = new HBox({
            spacing: 20,
            children: [
                text,
                iconNode
            ]
        });
        super(content, options);
        this.disposeOopsDialog = ()=>{
            text.dispose();
        };
        if (typeof messageString !== 'string') {
            this.addLinkedElement(messageString);
        }
    }
};
OopsDialog.OopsDialogIO = new IOType('OopsDialogIO', {
    valueType: OopsDialog,
    supertype: Dialog.DialogIO
});
export { OopsDialog as default };
sceneryPhet.register('OopsDialog', OopsDialog);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9Pb3BzRGlhbG9nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIE9vcHNEaWFsb2cgaXMgZGlzcGxheWVkIHdoZW4gc29tZSBsaW1pdGF0aW9uIG9mIHRoZSBzaW11bGF0aW9uIGlzIGVuY291bnRlcmVkLlxuICogU28gbmFtZWQgYmVjYXVzZSB0aGUgbWVzc2FnZXMgdHlwaWNhbGx5IGJlZ2luIHdpdGggJ09vcHMhJywgc28gdGhhdCdzIGhvdyBwZW9wbGUgcmVmZXJyZWQgdG8gaXQuXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VxdWFsaXR5LWV4cGxvcmVyL2lzc3Vlcy80OFxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9SZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IHsgSEJveCwgSW1hZ2UsIE5vZGUsIFJpY2hUZXh0LCBSaWNoVGV4dE9wdGlvbnMgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IERpYWxvZywgeyBEaWFsb2dPcHRpb25zIH0gZnJvbSAnLi4vLi4vc3VuL2pzL0RpYWxvZy5qcyc7XG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xuaW1wb3J0IHBoZXRHaXJsV2FnZ2luZ0Zpbmdlcl9wbmcgZnJvbSAnLi4vaW1hZ2VzL3BoZXRHaXJsV2FnZ2luZ0Zpbmdlcl9wbmcuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4vUGhldEZvbnQuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuXG4gIC8vIE9wdGlvbmFsIGljb24gdGhhdCB3aWxsIGJlIHBsYWNlZCB0byB0aGUgcmlnaHQgb2YgdGhlIGltYWdlLlxuICAvLyBJZiBub3QgcHJvdmlkZWQsIHRoZW4gYSBQaEVUIEdpcmwgaW1hZ2UgaXMgdXNlZC5cbiAgLy8gSWYgcHJvdmlkZWQsIHRoZSBjYWxsZXIgaXMgcmVzcG9uc2libGUgZm9yIGFsbCBhc3BlY3RzIG9mIHRoZSBpY29uLCBpbmNsdWRpbmcgc2NhbGUuXG4gIGljb25Ob2RlPzogTm9kZTtcblxuICAvLyBQYXNzZWQgdG8gUmljaFRleHQgbm9kZSB0aGF0IGRpc3BsYXlzIG1lc3NhZ2VTdHJpbmdcbiAgcmljaFRleHRPcHRpb25zPzogUmljaFRleHRPcHRpb25zO1xufTtcblxuZXhwb3J0IHR5cGUgT29wc0RpYWxvZ09wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIERpYWxvZ09wdGlvbnM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9vcHNEaWFsb2cgZXh0ZW5kcyBEaWFsb2cge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZU9vcHNEaWFsb2c6ICgpID0+IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBtZXNzYWdlU3RyaW5nIC0gc3VwcG9ydHMgUmljaFRleHQgZm9ybWF0dGluZ1xuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbWVzc2FnZVN0cmluZzogc3RyaW5nIHwgUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+LCBwcm92aWRlZE9wdGlvbnM/OiBPb3BzRGlhbG9nT3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8T29wc0RpYWxvZ09wdGlvbnMsIFN0cmljdE9taXQ8U2VsZk9wdGlvbnMsICdpY29uTm9kZScgfCAncmljaFRleHRPcHRpb25zJz4sIERpYWxvZ09wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gRGlhbG9nT3B0aW9uc1xuICAgICAgdG9wTWFyZ2luOiAyMCxcbiAgICAgIGJvdHRvbU1hcmdpbjogMjAsXG5cbiAgICAgIC8vIHBoZXQtaW9cbiAgICAgIHBoZXRpb1R5cGU6IE9vcHNEaWFsb2cuT29wc0RpYWxvZ0lPXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBjb25zdCB0ZXh0ID0gbmV3IFJpY2hUZXh0KCBtZXNzYWdlU3RyaW5nLCBvcHRpb25pemU8UmljaFRleHRPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zLCBSaWNoVGV4dE9wdGlvbnM+KCkoIHtcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMjAgKSxcbiAgICAgIG1heFdpZHRoOiA2MDAsXG4gICAgICBtYXhIZWlnaHQ6IDQwMFxuICAgIH0sIG9wdGlvbnMucmljaFRleHRPcHRpb25zICkgKTtcblxuICAgIGNvbnN0IGljb25Ob2RlID0gb3B0aW9ucy5pY29uTm9kZSB8fCBuZXcgSW1hZ2UoIHBoZXRHaXJsV2FnZ2luZ0Zpbmdlcl9wbmcsIHtcbiAgICAgIG1heEhlaWdodDogMTMyIC8vIGRldGVybWluZWQgZW1waXJpY2FsbHlcbiAgICB9ICk7XG5cbiAgICBjb25zdCBjb250ZW50ID0gbmV3IEhCb3goIHtcbiAgICAgIHNwYWNpbmc6IDIwLFxuICAgICAgY2hpbGRyZW46IFsgdGV4dCwgaWNvbk5vZGUgXVxuICAgIH0gKTtcblxuICAgIHN1cGVyKCBjb250ZW50LCBvcHRpb25zICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VPb3BzRGlhbG9nID0gKCkgPT4ge1xuICAgICAgdGV4dC5kaXNwb3NlKCk7XG4gICAgfTtcblxuICAgIGlmICggdHlwZW9mIG1lc3NhZ2VTdHJpbmcgIT09ICdzdHJpbmcnICkge1xuICAgICAgdGhpcy5hZGRMaW5rZWRFbGVtZW50KCBtZXNzYWdlU3RyaW5nICk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlT29wc0RpYWxvZygpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgT29wc0RpYWxvZ0lPID0gbmV3IElPVHlwZSggJ09vcHNEaWFsb2dJTycsIHtcbiAgICB2YWx1ZVR5cGU6IE9vcHNEaWFsb2csXG4gICAgc3VwZXJ0eXBlOiBEaWFsb2cuRGlhbG9nSU9cbiAgfSApO1xufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ09vcHNEaWFsb2cnLCBPb3BzRGlhbG9nICk7Il0sIm5hbWVzIjpbIm9wdGlvbml6ZSIsIkhCb3giLCJJbWFnZSIsIlJpY2hUZXh0IiwiRGlhbG9nIiwiSU9UeXBlIiwicGhldEdpcmxXYWdnaW5nRmluZ2VyX3BuZyIsIlBoZXRGb250Iiwic2NlbmVyeVBoZXQiLCJPb3BzRGlhbG9nIiwiZGlzcG9zZSIsImRpc3Bvc2VPb3BzRGlhbG9nIiwibWVzc2FnZVN0cmluZyIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJ0b3BNYXJnaW4iLCJib3R0b21NYXJnaW4iLCJwaGV0aW9UeXBlIiwiT29wc0RpYWxvZ0lPIiwidGV4dCIsImZvbnQiLCJtYXhXaWR0aCIsIm1heEhlaWdodCIsInJpY2hUZXh0T3B0aW9ucyIsImljb25Ob2RlIiwiY29udGVudCIsInNwYWNpbmciLCJjaGlsZHJlbiIsImFkZExpbmtlZEVsZW1lbnQiLCJ2YWx1ZVR5cGUiLCJzdXBlcnR5cGUiLCJEaWFsb2dJTyIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBR0QsT0FBT0EsZUFBcUMsa0NBQWtDO0FBRTlFLFNBQVNDLElBQUksRUFBRUMsS0FBSyxFQUFRQyxRQUFRLFFBQXlCLDhCQUE4QjtBQUMzRixPQUFPQyxZQUErQix5QkFBeUI7QUFDL0QsT0FBT0MsWUFBWSxrQ0FBa0M7QUFDckQsT0FBT0MsK0JBQStCLHlDQUF5QztBQUMvRSxPQUFPQyxjQUFjLGdCQUFnQjtBQUNyQyxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBZTVCLElBQUEsQUFBTUMsYUFBTixNQUFNQSxtQkFBbUJMO0lBOEN0Qk0sVUFBZ0I7UUFDOUIsSUFBSSxDQUFDQyxpQkFBaUI7UUFDdEIsS0FBSyxDQUFDRDtJQUNSO0lBN0NBOzs7R0FHQyxHQUNELFlBQW9CRSxhQUFnRCxFQUFFQyxlQUFtQyxDQUFHO1FBRTFHLE1BQU1DLFVBQVVkLFlBQXdHO1lBRXRILGdCQUFnQjtZQUNoQmUsV0FBVztZQUNYQyxjQUFjO1lBRWQsVUFBVTtZQUNWQyxZQUFZUixXQUFXUyxZQUFZO1FBQ3JDLEdBQUdMO1FBRUgsTUFBTU0sT0FBTyxJQUFJaEIsU0FBVVMsZUFBZVosWUFBaUU7WUFDekdvQixNQUFNLElBQUliLFNBQVU7WUFDcEJjLFVBQVU7WUFDVkMsV0FBVztRQUNiLEdBQUdSLFFBQVFTLGVBQWU7UUFFMUIsTUFBTUMsV0FBV1YsUUFBUVUsUUFBUSxJQUFJLElBQUl0QixNQUFPSSwyQkFBMkI7WUFDekVnQixXQUFXLElBQUkseUJBQXlCO1FBQzFDO1FBRUEsTUFBTUcsVUFBVSxJQUFJeEIsS0FBTTtZQUN4QnlCLFNBQVM7WUFDVEMsVUFBVTtnQkFBRVI7Z0JBQU1LO2FBQVU7UUFDOUI7UUFFQSxLQUFLLENBQUVDLFNBQVNYO1FBRWhCLElBQUksQ0FBQ0gsaUJBQWlCLEdBQUc7WUFDdkJRLEtBQUtULE9BQU87UUFDZDtRQUVBLElBQUssT0FBT0Usa0JBQWtCLFVBQVc7WUFDdkMsSUFBSSxDQUFDZ0IsZ0JBQWdCLENBQUVoQjtRQUN6QjtJQUNGO0FBV0Y7QUF2RHFCSCxXQW1ESVMsZUFBZSxJQUFJYixPQUFRLGdCQUFnQjtJQUNoRXdCLFdBQVdwQjtJQUNYcUIsV0FBVzFCLE9BQU8yQixRQUFRO0FBQzVCO0FBdERGLFNBQXFCdEIsd0JBdURwQjtBQUVERCxZQUFZd0IsUUFBUSxDQUFFLGNBQWN2QiJ9