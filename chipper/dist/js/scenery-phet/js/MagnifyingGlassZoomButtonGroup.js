// Copyright 2020-2024, University of Colorado Boulder
/**
 * A ZoomButtonGroup that shows magnifying glass icons on the buttons
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import Dimension2 from '../../dot/js/Dimension2.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import MagnifyingGlassNode from './MagnifyingGlassNode.js';
import MinusNode from './MinusNode.js';
import PhetColorScheme from './PhetColorScheme.js';
import PlusNode from './PlusNode.js';
import sceneryPhet from './sceneryPhet.js';
import ZoomButtonGroup from './ZoomButtonGroup.js';
let MagnifyingGlassZoomButtonGroup = class MagnifyingGlassZoomButtonGroup extends ZoomButtonGroup {
    /**
   * @param zoomLevelProperty - smaller value means more zoomed out
   * @param providedOptions
   */ constructor(zoomLevelProperty, providedOptions){
        const options = optionize()({
            // SelfOptions
            magnifyingGlassNodeOptions: {
                glassRadius: 15 // like ZoomButton
            },
            // ZoomButtonGroupOptions
            buttonOptions: {
                baseColor: PhetColorScheme.BUTTON_YELLOW // like ZoomButton
            }
        }, providedOptions);
        const magnifyingGlassRadius = options.magnifyingGlassNodeOptions.glassRadius;
        // options for '+' and '-' signs
        const signOptions = {
            size: new Dimension2(1.3 * magnifyingGlassRadius, magnifyingGlassRadius / 3)
        };
        // magnifying glass with '+'
        const zoomInIcon = new MagnifyingGlassNode(combineOptions({
            icon: new PlusNode(signOptions)
        }, options.magnifyingGlassNodeOptions));
        // magnifying glass with '-'
        const zoomOutIcon = new MagnifyingGlassNode(combineOptions({
            icon: new MinusNode(signOptions)
        }, options.magnifyingGlassNodeOptions));
        super(zoomLevelProperty, zoomInIcon, zoomOutIcon, options);
    }
};
export { MagnifyingGlassZoomButtonGroup as default };
sceneryPhet.register('MagnifyingGlassZoomButtonGroup', MagnifyingGlassZoomButtonGroup);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NYWduaWZ5aW5nR2xhc3Nab29tQnV0dG9uR3JvdXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBab29tQnV0dG9uR3JvdXAgdGhhdCBzaG93cyBtYWduaWZ5aW5nIGdsYXNzIGljb25zIG9uIHRoZSBidXR0b25zXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgTWFnbmlmeWluZ0dsYXNzTm9kZSwgeyBNYWduaWZ5aW5nR2xhc3NOb2RlT3B0aW9ucyB9IGZyb20gJy4vTWFnbmlmeWluZ0dsYXNzTm9kZS5qcyc7XG5pbXBvcnQgTWludXNOb2RlIGZyb20gJy4vTWludXNOb2RlLmpzJztcbmltcG9ydCBQaGV0Q29sb3JTY2hlbWUgZnJvbSAnLi9QaGV0Q29sb3JTY2hlbWUuanMnO1xuaW1wb3J0IFBsdXNOb2RlIGZyb20gJy4vUGx1c05vZGUuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuaW1wb3J0IFpvb21CdXR0b25Hcm91cCwgeyBab29tQnV0dG9uR3JvdXBPcHRpb25zIH0gZnJvbSAnLi9ab29tQnV0dG9uR3JvdXAuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuXG4gIC8vIG9wdGlvbnMgcHJvcGFnYXRlZCB0byBNYWduaWZ5aW5nR2xhc3NOb2RlXG4gIG1hZ25pZnlpbmdHbGFzc05vZGVPcHRpb25zPzogU3RyaWN0T21pdDxNYWduaWZ5aW5nR2xhc3NOb2RlT3B0aW9ucywgJ2ljb24nPjtcbn07XG5cbmV4cG9ydCB0eXBlIE1hZ25pZnlpbmdHbGFzc1pvb21CdXR0b25Hcm91cE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFpvb21CdXR0b25Hcm91cE9wdGlvbnM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hZ25pZnlpbmdHbGFzc1pvb21CdXR0b25Hcm91cCBleHRlbmRzIFpvb21CdXR0b25Hcm91cCB7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB6b29tTGV2ZWxQcm9wZXJ0eSAtIHNtYWxsZXIgdmFsdWUgbWVhbnMgbW9yZSB6b29tZWQgb3V0XG4gICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnNcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggem9vbUxldmVsUHJvcGVydHk6IE51bWJlclByb3BlcnR5LCBwcm92aWRlZE9wdGlvbnM/OiBNYWduaWZ5aW5nR2xhc3Nab29tQnV0dG9uR3JvdXBPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxNYWduaWZ5aW5nR2xhc3Nab29tQnV0dG9uR3JvdXBPcHRpb25zLCBTZWxmT3B0aW9ucywgWm9vbUJ1dHRvbkdyb3VwT3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyBTZWxmT3B0aW9uc1xuICAgICAgbWFnbmlmeWluZ0dsYXNzTm9kZU9wdGlvbnM6IHtcbiAgICAgICAgZ2xhc3NSYWRpdXM6IDE1IC8vIGxpa2UgWm9vbUJ1dHRvblxuICAgICAgfSxcblxuICAgICAgLy8gWm9vbUJ1dHRvbkdyb3VwT3B0aW9uc1xuICAgICAgYnV0dG9uT3B0aW9uczoge1xuICAgICAgICBiYXNlQ29sb3I6IFBoZXRDb2xvclNjaGVtZS5CVVRUT05fWUVMTE9XIC8vIGxpa2UgWm9vbUJ1dHRvblxuICAgICAgfVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgY29uc3QgbWFnbmlmeWluZ0dsYXNzUmFkaXVzID0gb3B0aW9ucy5tYWduaWZ5aW5nR2xhc3NOb2RlT3B0aW9ucy5nbGFzc1JhZGl1cyE7XG5cbiAgICAvLyBvcHRpb25zIGZvciAnKycgYW5kICctJyBzaWduc1xuICAgIGNvbnN0IHNpZ25PcHRpb25zID0ge1xuICAgICAgc2l6ZTogbmV3IERpbWVuc2lvbjIoIDEuMyAqIG1hZ25pZnlpbmdHbGFzc1JhZGl1cywgbWFnbmlmeWluZ0dsYXNzUmFkaXVzIC8gMyApXG4gICAgfTtcblxuICAgIC8vIG1hZ25pZnlpbmcgZ2xhc3Mgd2l0aCAnKydcbiAgICBjb25zdCB6b29tSW5JY29uID0gbmV3IE1hZ25pZnlpbmdHbGFzc05vZGUoIGNvbWJpbmVPcHRpb25zPE1hZ25pZnlpbmdHbGFzc05vZGVPcHRpb25zPigge1xuICAgICAgaWNvbjogbmV3IFBsdXNOb2RlKCBzaWduT3B0aW9ucyApXG4gICAgfSwgb3B0aW9ucy5tYWduaWZ5aW5nR2xhc3NOb2RlT3B0aW9ucyApICk7XG5cbiAgICAvLyBtYWduaWZ5aW5nIGdsYXNzIHdpdGggJy0nXG4gICAgY29uc3Qgem9vbU91dEljb24gPSBuZXcgTWFnbmlmeWluZ0dsYXNzTm9kZSggY29tYmluZU9wdGlvbnM8TWFnbmlmeWluZ0dsYXNzTm9kZU9wdGlvbnM+KCB7XG4gICAgICBpY29uOiBuZXcgTWludXNOb2RlKCBzaWduT3B0aW9ucyApXG4gICAgfSwgb3B0aW9ucy5tYWduaWZ5aW5nR2xhc3NOb2RlT3B0aW9ucyApICk7XG5cbiAgICBzdXBlciggem9vbUxldmVsUHJvcGVydHksIHpvb21Jbkljb24sIHpvb21PdXRJY29uLCBvcHRpb25zICk7XG4gIH1cbn1cblxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdNYWduaWZ5aW5nR2xhc3Nab29tQnV0dG9uR3JvdXAnLCBNYWduaWZ5aW5nR2xhc3Nab29tQnV0dG9uR3JvdXAgKTsiXSwibmFtZXMiOlsiRGltZW5zaW9uMiIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiTWFnbmlmeWluZ0dsYXNzTm9kZSIsIk1pbnVzTm9kZSIsIlBoZXRDb2xvclNjaGVtZSIsIlBsdXNOb2RlIiwic2NlbmVyeVBoZXQiLCJab29tQnV0dG9uR3JvdXAiLCJNYWduaWZ5aW5nR2xhc3Nab29tQnV0dG9uR3JvdXAiLCJ6b29tTGV2ZWxQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJtYWduaWZ5aW5nR2xhc3NOb2RlT3B0aW9ucyIsImdsYXNzUmFkaXVzIiwiYnV0dG9uT3B0aW9ucyIsImJhc2VDb2xvciIsIkJVVFRPTl9ZRUxMT1ciLCJtYWduaWZ5aW5nR2xhc3NSYWRpdXMiLCJzaWduT3B0aW9ucyIsInNpemUiLCJ6b29tSW5JY29uIiwiaWNvbiIsInpvb21PdXRJY29uIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBR0QsT0FBT0EsZ0JBQWdCLDZCQUE2QjtBQUNwRCxPQUFPQyxhQUFhQyxjQUFjLFFBQVEsa0NBQWtDO0FBRTVFLE9BQU9DLHlCQUF5RCwyQkFBMkI7QUFDM0YsT0FBT0MsZUFBZSxpQkFBaUI7QUFDdkMsT0FBT0MscUJBQXFCLHVCQUF1QjtBQUNuRCxPQUFPQyxjQUFjLGdCQUFnQjtBQUNyQyxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBQzNDLE9BQU9DLHFCQUFpRCx1QkFBdUI7QUFVaEUsSUFBQSxBQUFNQyxpQ0FBTixNQUFNQSx1Q0FBdUNEO0lBRTFEOzs7R0FHQyxHQUNELFlBQW9CRSxpQkFBaUMsRUFBRUMsZUFBdUQsQ0FBRztRQUUvRyxNQUFNQyxVQUFVWCxZQUF5RjtZQUV2RyxjQUFjO1lBQ2RZLDRCQUE0QjtnQkFDMUJDLGFBQWEsR0FBRyxrQkFBa0I7WUFDcEM7WUFFQSx5QkFBeUI7WUFDekJDLGVBQWU7Z0JBQ2JDLFdBQVdYLGdCQUFnQlksYUFBYSxDQUFDLGtCQUFrQjtZQUM3RDtRQUNGLEdBQUdOO1FBRUgsTUFBTU8sd0JBQXdCTixRQUFRQywwQkFBMEIsQ0FBQ0MsV0FBVztRQUU1RSxnQ0FBZ0M7UUFDaEMsTUFBTUssY0FBYztZQUNsQkMsTUFBTSxJQUFJcEIsV0FBWSxNQUFNa0IsdUJBQXVCQSx3QkFBd0I7UUFDN0U7UUFFQSw0QkFBNEI7UUFDNUIsTUFBTUcsYUFBYSxJQUFJbEIsb0JBQXFCRCxlQUE0QztZQUN0Rm9CLE1BQU0sSUFBSWhCLFNBQVVhO1FBQ3RCLEdBQUdQLFFBQVFDLDBCQUEwQjtRQUVyQyw0QkFBNEI7UUFDNUIsTUFBTVUsY0FBYyxJQUFJcEIsb0JBQXFCRCxlQUE0QztZQUN2Rm9CLE1BQU0sSUFBSWxCLFVBQVdlO1FBQ3ZCLEdBQUdQLFFBQVFDLDBCQUEwQjtRQUVyQyxLQUFLLENBQUVILG1CQUFtQlcsWUFBWUUsYUFBYVg7SUFDckQ7QUFDRjtBQXhDQSxTQUFxQkgsNENBd0NwQjtBQUVERixZQUFZaUIsUUFBUSxDQUFFLGtDQUFrQ2YifQ==