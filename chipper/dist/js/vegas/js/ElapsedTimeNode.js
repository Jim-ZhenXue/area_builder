// Copyright 2018-2024, University of Colorado Boulder
/**
 * ElapsedTimeNode shows the elapsed time in a game status bar (FiniteStatusBar).
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Multilink from '../../axon/js/Multilink.js';
import optionize from '../../phet-core/js/optionize.js';
import SimpleClockIcon from '../../scenery-phet/js/SimpleClockIcon.js';
import StatusBar from '../../scenery-phet/js/StatusBar.js';
import { HBox, Text } from '../../scenery/js/imports.js';
import GameTimer from './GameTimer.js';
import vegas from './vegas.js';
import VegasStrings from './VegasStrings.js';
let ElapsedTimeNode = class ElapsedTimeNode extends HBox {
    dispose() {
        this.disposeElapsedTimeNode();
        super.dispose();
    }
    constructor(elapsedTimeProperty, providedOptions){
        const options = optionize()({
            // SelfOptions
            clockIconRadius: 15,
            font: StatusBar.DEFAULT_FONT,
            textFill: 'black',
            // HBoxOptions
            spacing: 8
        }, providedOptions);
        const clockIcon = new SimpleClockIcon(options.clockIconRadius);
        const timeValue = new Text('', {
            font: options.font,
            fill: options.textFill
        });
        options.children = [
            clockIcon,
            timeValue
        ];
        super(options);
        // Update the time display.
        const multilink = new Multilink([
            elapsedTimeProperty,
            // Dynamic strings used by GameTimer.formatTime
            VegasStrings.pattern['0hours']['1minutes']['2secondsStringProperty'],
            VegasStrings.pattern['0minutes']['1secondsStringProperty']
        ], (elapsedTime, pattern1, pattern2)=>{
            timeValue.string = GameTimer.formatTime(elapsedTime);
        });
        this.disposeElapsedTimeNode = ()=>{
            multilink.dispose();
        };
    }
};
export { ElapsedTimeNode as default };
vegas.register('ElapsedTimeNode', ElapsedTimeNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL0VsYXBzZWRUaW1lTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBFbGFwc2VkVGltZU5vZGUgc2hvd3MgdGhlIGVsYXBzZWQgdGltZSBpbiBhIGdhbWUgc3RhdHVzIGJhciAoRmluaXRlU3RhdHVzQmFyKS5cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCBTaW1wbGVDbG9ja0ljb24gZnJvbSAnLi4vLi4vc2NlbmVyeS1waGV0L2pzL1NpbXBsZUNsb2NrSWNvbi5qcyc7XG5pbXBvcnQgU3RhdHVzQmFyIGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9TdGF0dXNCYXIuanMnO1xuaW1wb3J0IHsgRm9udCwgSEJveCwgSEJveE9wdGlvbnMsIFRDb2xvciwgVGV4dCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgR2FtZVRpbWVyIGZyb20gJy4vR2FtZVRpbWVyLmpzJztcbmltcG9ydCB2ZWdhcyBmcm9tICcuL3ZlZ2FzLmpzJztcbmltcG9ydCBWZWdhc1N0cmluZ3MgZnJvbSAnLi9WZWdhc1N0cmluZ3MuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICBjbG9ja0ljb25SYWRpdXM/OiBudW1iZXI7XG4gIGZvbnQ/OiBGb250O1xuICB0ZXh0RmlsbD86IFRDb2xvcjtcbn07XG5cbmV4cG9ydCB0eXBlIEVsYXBzZWRUaW1lTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8SEJveE9wdGlvbnMsICdjaGlsZHJlbic+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbGFwc2VkVGltZU5vZGUgZXh0ZW5kcyBIQm94IHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VFbGFwc2VkVGltZU5vZGU6ICgpID0+IHZvaWQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBlbGFwc2VkVGltZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+LCBwcm92aWRlZE9wdGlvbnM/OiBFbGFwc2VkVGltZU5vZGVPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxFbGFwc2VkVGltZU5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgSEJveE9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gU2VsZk9wdGlvbnNcbiAgICAgIGNsb2NrSWNvblJhZGl1czogMTUsXG4gICAgICBmb250OiBTdGF0dXNCYXIuREVGQVVMVF9GT05ULFxuICAgICAgdGV4dEZpbGw6ICdibGFjaycsXG5cbiAgICAgIC8vIEhCb3hPcHRpb25zXG4gICAgICBzcGFjaW5nOiA4XG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBjb25zdCBjbG9ja0ljb24gPSBuZXcgU2ltcGxlQ2xvY2tJY29uKCBvcHRpb25zLmNsb2NrSWNvblJhZGl1cyApO1xuXG4gICAgY29uc3QgdGltZVZhbHVlID0gbmV3IFRleHQoICcnLCB7XG4gICAgICBmb250OiBvcHRpb25zLmZvbnQsXG4gICAgICBmaWxsOiBvcHRpb25zLnRleHRGaWxsXG4gICAgfSApO1xuXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgY2xvY2tJY29uLCB0aW1lVmFsdWUgXTtcblxuICAgIHN1cGVyKCBvcHRpb25zICk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIHRpbWUgZGlzcGxheS5cbiAgICBjb25zdCBtdWx0aWxpbmsgPSBuZXcgTXVsdGlsaW5rKCBbXG4gICAgICBlbGFwc2VkVGltZVByb3BlcnR5LFxuXG4gICAgICAvLyBEeW5hbWljIHN0cmluZ3MgdXNlZCBieSBHYW1lVGltZXIuZm9ybWF0VGltZVxuICAgICAgVmVnYXNTdHJpbmdzLnBhdHRlcm5bICcwaG91cnMnIF1bICcxbWludXRlcycgXVsgJzJzZWNvbmRzU3RyaW5nUHJvcGVydHknIF0sXG4gICAgICBWZWdhc1N0cmluZ3MucGF0dGVyblsgJzBtaW51dGVzJyBdWyAnMXNlY29uZHNTdHJpbmdQcm9wZXJ0eScgXVxuICAgIF0sICggZWxhcHNlZFRpbWUsIHBhdHRlcm4xLCBwYXR0ZXJuMiApID0+IHtcbiAgICAgIHRpbWVWYWx1ZS5zdHJpbmcgPSBHYW1lVGltZXIuZm9ybWF0VGltZSggZWxhcHNlZFRpbWUgKTtcbiAgICB9ICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VFbGFwc2VkVGltZU5vZGUgPSAoKSA9PiB7XG4gICAgICBtdWx0aWxpbmsuZGlzcG9zZSgpO1xuICAgIH07XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2VFbGFwc2VkVGltZU5vZGUoKTtcbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cbn1cblxudmVnYXMucmVnaXN0ZXIoICdFbGFwc2VkVGltZU5vZGUnLCBFbGFwc2VkVGltZU5vZGUgKTsiXSwibmFtZXMiOlsiTXVsdGlsaW5rIiwib3B0aW9uaXplIiwiU2ltcGxlQ2xvY2tJY29uIiwiU3RhdHVzQmFyIiwiSEJveCIsIlRleHQiLCJHYW1lVGltZXIiLCJ2ZWdhcyIsIlZlZ2FzU3RyaW5ncyIsIkVsYXBzZWRUaW1lTm9kZSIsImRpc3Bvc2UiLCJkaXNwb3NlRWxhcHNlZFRpbWVOb2RlIiwiZWxhcHNlZFRpbWVQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJjbG9ja0ljb25SYWRpdXMiLCJmb250IiwiREVGQVVMVF9GT05UIiwidGV4dEZpbGwiLCJzcGFjaW5nIiwiY2xvY2tJY29uIiwidGltZVZhbHVlIiwiZmlsbCIsImNoaWxkcmVuIiwibXVsdGlsaW5rIiwicGF0dGVybiIsImVsYXBzZWRUaW1lIiwicGF0dGVybjEiLCJwYXR0ZXJuMiIsInN0cmluZyIsImZvcm1hdFRpbWUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxlQUFlLDZCQUE2QjtBQUVuRCxPQUFPQyxlQUFlLGtDQUFrQztBQUV4RCxPQUFPQyxxQkFBcUIsMkNBQTJDO0FBQ3ZFLE9BQU9DLGVBQWUscUNBQXFDO0FBQzNELFNBQWVDLElBQUksRUFBdUJDLElBQUksUUFBUSw4QkFBOEI7QUFDcEYsT0FBT0MsZUFBZSxpQkFBaUI7QUFDdkMsT0FBT0MsV0FBVyxhQUFhO0FBQy9CLE9BQU9DLGtCQUFrQixvQkFBb0I7QUFVOUIsSUFBQSxBQUFNQyxrQkFBTixNQUFNQSx3QkFBd0JMO0lBNEMzQk0sVUFBZ0I7UUFDOUIsSUFBSSxDQUFDQyxzQkFBc0I7UUFDM0IsS0FBSyxDQUFDRDtJQUNSO0lBM0NBLFlBQW9CRSxtQkFBOEMsRUFBRUMsZUFBd0MsQ0FBRztRQUU3RyxNQUFNQyxVQUFVYixZQUErRDtZQUU3RSxjQUFjO1lBQ2RjLGlCQUFpQjtZQUNqQkMsTUFBTWIsVUFBVWMsWUFBWTtZQUM1QkMsVUFBVTtZQUVWLGNBQWM7WUFDZEMsU0FBUztRQUNYLEdBQUdOO1FBRUgsTUFBTU8sWUFBWSxJQUFJbEIsZ0JBQWlCWSxRQUFRQyxlQUFlO1FBRTlELE1BQU1NLFlBQVksSUFBSWhCLEtBQU0sSUFBSTtZQUM5QlcsTUFBTUYsUUFBUUUsSUFBSTtZQUNsQk0sTUFBTVIsUUFBUUksUUFBUTtRQUN4QjtRQUVBSixRQUFRUyxRQUFRLEdBQUc7WUFBRUg7WUFBV0M7U0FBVztRQUUzQyxLQUFLLENBQUVQO1FBRVAsMkJBQTJCO1FBQzNCLE1BQU1VLFlBQVksSUFBSXhCLFVBQVc7WUFDL0JZO1lBRUEsK0NBQStDO1lBQy9DSixhQUFhaUIsT0FBTyxDQUFFLFNBQVUsQ0FBRSxXQUFZLENBQUUseUJBQTBCO1lBQzFFakIsYUFBYWlCLE9BQU8sQ0FBRSxXQUFZLENBQUUseUJBQTBCO1NBQy9ELEVBQUUsQ0FBRUMsYUFBYUMsVUFBVUM7WUFDMUJQLFVBQVVRLE1BQU0sR0FBR3ZCLFVBQVV3QixVQUFVLENBQUVKO1FBQzNDO1FBRUEsSUFBSSxDQUFDZixzQkFBc0IsR0FBRztZQUM1QmEsVUFBVWQsT0FBTztRQUNuQjtJQUNGO0FBTUY7QUFoREEsU0FBcUJELDZCQWdEcEI7QUFFREYsTUFBTXdCLFFBQVEsQ0FBRSxtQkFBbUJ0QiJ9