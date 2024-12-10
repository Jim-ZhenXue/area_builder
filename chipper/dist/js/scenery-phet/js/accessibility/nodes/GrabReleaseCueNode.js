// Copyright 2018-2024, University of Colorado Boulder
/**
 * A Node that displays a visual queue to use space to grab and release a component.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import optionize from '../../../../phet-core/js/optionize.js';
import { HBox, RichText } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import TextKeyNode from '../../keyboard/TextKeyNode.js';
import PhetFont from '../../PhetFont.js';
import sceneryPhet from '../../sceneryPhet.js';
import SceneryPhetStrings from '../../SceneryPhetStrings.js';
let GrabReleaseCueNode = class GrabReleaseCueNode extends Panel {
    constructor(providedOptions){
        const options = optionize()({
            // SelfOptions
            spaceKeyWidth: 50,
            keyHeight: 24,
            // PanelOptions
            fill: 'white',
            stroke: 'black',
            xMargin: 15,
            yMargin: 5,
            cornerRadius: 0
        }, providedOptions);
        // Create the help content for the space key to pick up the draggable item
        const spaceKeyNode = TextKeyNode.space({
            keyHeight: options.keyHeight,
            minKeyWidth: options.spaceKeyWidth
        });
        const spaceLabelText = new RichText(SceneryPhetStrings.key.toGrabOrReleaseStringProperty, {
            maxWidth: 200,
            font: new PhetFont(12)
        });
        const spaceKeyHBox = new HBox({
            children: [
                spaceKeyNode,
                spaceLabelText
            ],
            spacing: 10
        });
        // rectangle containing the content, not visible until focused the first time
        super(spaceKeyHBox, options);
        this.disposeEmitter.addListener(()=>{
            spaceKeyNode.dispose();
            spaceLabelText.dispose();
            spaceKeyHBox.dispose();
        });
    }
};
export { GrabReleaseCueNode as default };
sceneryPhet.register('GrabReleaseCueNode', GrabReleaseCueNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9hY2Nlc3NpYmlsaXR5L25vZGVzL0dyYWJSZWxlYXNlQ3VlTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIE5vZGUgdGhhdCBkaXNwbGF5cyBhIHZpc3VhbCBxdWV1ZSB0byB1c2Ugc3BhY2UgdG8gZ3JhYiBhbmQgcmVsZWFzZSBhIGNvbXBvbmVudC5cbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCB7IEhCb3gsIFJpY2hUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBQYW5lbCwgeyBQYW5lbE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvUGFuZWwuanMnO1xuaW1wb3J0IFRleHRLZXlOb2RlIGZyb20gJy4uLy4uL2tleWJvYXJkL1RleHRLZXlOb2RlLmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vLi4vc2NlbmVyeVBoZXQuanMnO1xuaW1wb3J0IFNjZW5lcnlQaGV0U3RyaW5ncyBmcm9tICcuLi8uLi9TY2VuZXJ5UGhldFN0cmluZ3MuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuXG4gIC8vIHByb3BlcnRpZXMgb2YgdGhlIHNwYWNlIGtleVxuICBzcGFjZUtleVdpZHRoPzogbnVtYmVyO1xuICBrZXlIZWlnaHQ/OiBudW1iZXI7XG59O1xuZXhwb3J0IHR5cGUgR3JhYlJlbGVhc2VDdWVOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGFuZWxPcHRpb25zO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcmFiUmVsZWFzZUN1ZU5vZGUgZXh0ZW5kcyBQYW5lbCB7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBHcmFiUmVsZWFzZUN1ZU5vZGVPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxHcmFiUmVsZWFzZUN1ZU5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgUGFuZWxPcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIFNlbGZPcHRpb25zXG4gICAgICBzcGFjZUtleVdpZHRoOiA1MCwgLy8gdGhpcyBzcGFjZSBrZXkgaXMgd2lkZXIgdGhhbiBkZWZhdWx0IHNwYWNlIGtleVxuICAgICAga2V5SGVpZ2h0OiAyNCwgLy8gaGVpZ2h0IG9mIHRoZSBzcGFjZSBrZXksIGxhcmdlciB0aGFuIGRlZmF1bHQgS2V5Tm9kZSBoZWlnaHRcblxuICAgICAgLy8gUGFuZWxPcHRpb25zXG4gICAgICBmaWxsOiAnd2hpdGUnLFxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxuICAgICAgeE1hcmdpbjogMTUsXG4gICAgICB5TWFyZ2luOiA1LFxuICAgICAgY29ybmVyUmFkaXVzOiAwXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cblxuICAgIC8vIENyZWF0ZSB0aGUgaGVscCBjb250ZW50IGZvciB0aGUgc3BhY2Uga2V5IHRvIHBpY2sgdXAgdGhlIGRyYWdnYWJsZSBpdGVtXG4gICAgY29uc3Qgc3BhY2VLZXlOb2RlID0gVGV4dEtleU5vZGUuc3BhY2UoIHtcbiAgICAgIGtleUhlaWdodDogb3B0aW9ucy5rZXlIZWlnaHQsXG4gICAgICBtaW5LZXlXaWR0aDogb3B0aW9ucy5zcGFjZUtleVdpZHRoXG4gICAgfSApO1xuICAgIGNvbnN0IHNwYWNlTGFiZWxUZXh0ID0gbmV3IFJpY2hUZXh0KCBTY2VuZXJ5UGhldFN0cmluZ3Mua2V5LnRvR3JhYk9yUmVsZWFzZVN0cmluZ1Byb3BlcnR5LCB7XG4gICAgICBtYXhXaWR0aDogMjAwLFxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxMiApXG4gICAgfSApO1xuICAgIGNvbnN0IHNwYWNlS2V5SEJveCA9IG5ldyBIQm94KCB7XG4gICAgICBjaGlsZHJlbjogWyBzcGFjZUtleU5vZGUsIHNwYWNlTGFiZWxUZXh0IF0sXG4gICAgICBzcGFjaW5nOiAxMFxuICAgIH0gKTtcblxuICAgIC8vIHJlY3RhbmdsZSBjb250YWluaW5nIHRoZSBjb250ZW50LCBub3QgdmlzaWJsZSB1bnRpbCBmb2N1c2VkIHRoZSBmaXJzdCB0aW1lXG4gICAgc3VwZXIoIHNwYWNlS2V5SEJveCwgb3B0aW9ucyApO1xuXG4gICAgdGhpcy5kaXNwb3NlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xuICAgICAgc3BhY2VLZXlOb2RlLmRpc3Bvc2UoKTtcbiAgICAgIHNwYWNlTGFiZWxUZXh0LmRpc3Bvc2UoKTtcbiAgICAgIHNwYWNlS2V5SEJveC5kaXNwb3NlKCk7XG4gICAgfSApO1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnR3JhYlJlbGVhc2VDdWVOb2RlJywgR3JhYlJlbGVhc2VDdWVOb2RlICk7Il0sIm5hbWVzIjpbIm9wdGlvbml6ZSIsIkhCb3giLCJSaWNoVGV4dCIsIlBhbmVsIiwiVGV4dEtleU5vZGUiLCJQaGV0Rm9udCIsInNjZW5lcnlQaGV0IiwiU2NlbmVyeVBoZXRTdHJpbmdzIiwiR3JhYlJlbGVhc2VDdWVOb2RlIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInNwYWNlS2V5V2lkdGgiLCJrZXlIZWlnaHQiLCJmaWxsIiwic3Ryb2tlIiwieE1hcmdpbiIsInlNYXJnaW4iLCJjb3JuZXJSYWRpdXMiLCJzcGFjZUtleU5vZGUiLCJzcGFjZSIsIm1pbktleVdpZHRoIiwic3BhY2VMYWJlbFRleHQiLCJrZXkiLCJ0b0dyYWJPclJlbGVhc2VTdHJpbmdQcm9wZXJ0eSIsIm1heFdpZHRoIiwiZm9udCIsInNwYWNlS2V5SEJveCIsImNoaWxkcmVuIiwic3BhY2luZyIsImRpc3Bvc2VFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJkaXNwb3NlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsZUFBZSx3Q0FBd0M7QUFDOUQsU0FBU0MsSUFBSSxFQUFFQyxRQUFRLFFBQVEsb0NBQW9DO0FBQ25FLE9BQU9DLFdBQTZCLDhCQUE4QjtBQUNsRSxPQUFPQyxpQkFBaUIsZ0NBQWdDO0FBQ3hELE9BQU9DLGNBQWMsb0JBQW9CO0FBQ3pDLE9BQU9DLGlCQUFpQix1QkFBdUI7QUFDL0MsT0FBT0Msd0JBQXdCLDhCQUE4QjtBQVU5QyxJQUFBLEFBQU1DLHFCQUFOLE1BQU1BLDJCQUEyQkw7SUFFOUMsWUFBb0JNLGVBQTJDLENBQUc7UUFFaEUsTUFBTUMsVUFBVVYsWUFBbUU7WUFFakYsY0FBYztZQUNkVyxlQUFlO1lBQ2ZDLFdBQVc7WUFFWCxlQUFlO1lBQ2ZDLE1BQU07WUFDTkMsUUFBUTtZQUNSQyxTQUFTO1lBQ1RDLFNBQVM7WUFDVEMsY0FBYztRQUNoQixHQUFHUjtRQUdILDBFQUEwRTtRQUMxRSxNQUFNUyxlQUFlZCxZQUFZZSxLQUFLLENBQUU7WUFDdENQLFdBQVdGLFFBQVFFLFNBQVM7WUFDNUJRLGFBQWFWLFFBQVFDLGFBQWE7UUFDcEM7UUFDQSxNQUFNVSxpQkFBaUIsSUFBSW5CLFNBQVVLLG1CQUFtQmUsR0FBRyxDQUFDQyw2QkFBNkIsRUFBRTtZQUN6RkMsVUFBVTtZQUNWQyxNQUFNLElBQUlwQixTQUFVO1FBQ3RCO1FBQ0EsTUFBTXFCLGVBQWUsSUFBSXpCLEtBQU07WUFDN0IwQixVQUFVO2dCQUFFVDtnQkFBY0c7YUFBZ0I7WUFDMUNPLFNBQVM7UUFDWDtRQUVBLDZFQUE2RTtRQUM3RSxLQUFLLENBQUVGLGNBQWNoQjtRQUVyQixJQUFJLENBQUNtQixjQUFjLENBQUNDLFdBQVcsQ0FBRTtZQUMvQlosYUFBYWEsT0FBTztZQUNwQlYsZUFBZVUsT0FBTztZQUN0QkwsYUFBYUssT0FBTztRQUN0QjtJQUNGO0FBQ0Y7QUExQ0EsU0FBcUJ2QixnQ0EwQ3BCO0FBRURGLFlBQVkwQixRQUFRLENBQUUsc0JBQXNCeEIifQ==