// Copyright 2020-2024, University of Colorado Boulder
/**
 * ZoomButtonGroup is the base class for a pair of buttons used to zoom 'in' and 'out'.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { FlowBox } from '../../scenery/js/imports.js';
import RectangularPushButton from '../../sun/js/buttons/RectangularPushButton.js';
import Tandem from '../../tandem/js/Tandem.js';
import sceneryPhet from './sceneryPhet.js';
import SceneryPhetStrings from './SceneryPhetStrings.js';
let ZoomButtonGroup = class ZoomButtonGroup extends FlowBox {
    dispose() {
        this.disposeZoomButtonGroup();
        super.dispose();
    }
    /**
   * @param zoomLevelProperty - smaller value means more zoomed out
   * @param zoomInIcon
   * @param zoomOutIcon
   * @param providedOptions?
   */ constructor(zoomLevelProperty, zoomInIcon, zoomOutIcon, providedOptions){
        const zoomLevelRange = zoomLevelProperty.range;
        const options = optionize()({
            // ZoomButtonGroupOptions
            applyZoomIn: (currentZoom)=>currentZoom + 1,
            applyZoomOut: (currentZoom)=>currentZoom - 1,
            touchAreaXDilation: 0,
            touchAreaYDilation: 0,
            mouseAreaXDilation: 0,
            mouseAreaYDilation: 0,
            buttonOptions: {
                fireOnHold: true,
                fireOnHoldDelay: 600,
                fireOnHoldInterval: 250,
                phetioVisiblePropertyInstrumented: false,
                phetioEnabledPropertyInstrumented: false
            },
            // FlowBoxOptions
            spacing: 0,
            orientation: 'horizontal',
            align: 'center',
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'ZoomButtonGroup',
            phetioFeatured: true
        }, providedOptions);
        // For pointer areas. Dependent on options.spacing, pointer areas will be shifted to prevent overlap.
        const halfSpacing = options.spacing / 2;
        const mouseXShift = Math.max(0, options.orientation === 'horizontal' ? options.mouseAreaXDilation - halfSpacing : 0);
        const touchXShift = Math.max(0, options.orientation === 'horizontal' ? options.touchAreaXDilation - halfSpacing : 0);
        const mouseYShift = Math.max(0, options.orientation === 'vertical' ? options.mouseAreaYDilation - halfSpacing : 0);
        const touchYShift = Math.max(0, options.orientation === 'vertical' ? options.touchAreaYDilation - halfSpacing : 0);
        // zoom in
        const zoomInButton = new RectangularPushButton(combineOptions({
            content: zoomInIcon,
            listener: ()=>{
                zoomLevelProperty.value = options.applyZoomIn(zoomLevelProperty.value);
            },
            touchAreaXDilation: options.touchAreaXDilation,
            touchAreaYDilation: options.touchAreaYDilation,
            mouseAreaXDilation: options.mouseAreaXDilation,
            mouseAreaYDilation: options.mouseAreaYDilation,
            touchAreaXShift: touchXShift,
            touchAreaYShift: -touchYShift,
            mouseAreaXShift: mouseXShift,
            mouseAreaYShift: -mouseYShift,
            accessibleName: SceneryPhetStrings.a11y.zoomInStringProperty,
            tandem: options.tandem.createTandem('zoomInButton')
        }, options.buttonOptions));
        // zoom out
        const zoomOutButton = new RectangularPushButton(combineOptions({
            content: zoomOutIcon,
            listener: ()=>{
                zoomLevelProperty.value = options.applyZoomOut(zoomLevelProperty.value);
            },
            touchAreaXDilation: options.touchAreaXDilation,
            touchAreaYDilation: options.touchAreaYDilation,
            mouseAreaXDilation: options.mouseAreaXDilation,
            mouseAreaYDilation: options.mouseAreaYDilation,
            touchAreaXShift: -touchXShift,
            touchAreaYShift: touchYShift,
            mouseAreaXShift: -mouseXShift,
            mouseAreaYShift: mouseYShift,
            accessibleName: SceneryPhetStrings.a11y.zoomOutStringProperty,
            tandem: options.tandem.createTandem('zoomOutButton')
        }, options.buttonOptions));
        options.children = options.orientation === 'horizontal' ? [
            zoomOutButton,
            zoomInButton
        ] : [
            zoomInButton,
            zoomOutButton
        ];
        // disable a button if we reach the min or max
        const zoomLevelListener = (zoomLevel)=>{
            zoomOutButton.enabled = zoomLevelRange.contains(options.applyZoomOut(zoomLevel));
            zoomInButton.enabled = zoomLevelRange.contains(options.applyZoomIn(zoomLevel));
        };
        zoomLevelProperty.link(zoomLevelListener);
        super(options);
        // Make the zoom buttons available as properties.
        this.zoomOutButton = zoomOutButton;
        this.zoomInButton = zoomInButton;
        this.addLinkedElement(zoomLevelProperty, {
            tandemName: 'zoomProperty'
        });
        this.disposeZoomButtonGroup = ()=>{
            zoomInButton.dispose();
            zoomOutButton.dispose();
            zoomLevelProperty.unlink(zoomLevelListener);
        };
    }
};
export { ZoomButtonGroup as default };
sceneryPhet.register('ZoomButtonGroup', ZoomButtonGroup);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9ab29tQnV0dG9uR3JvdXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogWm9vbUJ1dHRvbkdyb3VwIGlzIHRoZSBiYXNlIGNsYXNzIGZvciBhIHBhaXIgb2YgYnV0dG9ucyB1c2VkIHRvIHpvb20gJ2luJyBhbmQgJ291dCcuXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgVFJhbmdlZFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJhbmdlZFByb3BlcnR5LmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCB7IEZsb3dCb3gsIEZsb3dCb3hPcHRpb25zLCBOb2RlIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBSZWN0YW5ndWxhclB1c2hCdXR0b24sIHsgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uT3B0aW9ucyB9IGZyb20gJy4uLy4uL3N1bi9qcy9idXR0b25zL1JlY3Rhbmd1bGFyUHVzaEJ1dHRvbi5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuaW1wb3J0IFNjZW5lcnlQaGV0U3RyaW5ncyBmcm9tICcuL1NjZW5lcnlQaGV0U3RyaW5ncy5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG5cbiAgLy8gZnVuY3Rpb24gYXBwbGllZCB3aGVuIHRoZSAnKycgYnV0dG9uIGlzIHByZXNzZWRcbiAgYXBwbHlab29tSW4/OiAoIGN1cnJlbnRab29tOiBudW1iZXIgKSA9PiBudW1iZXI7XG5cbiAgLy8gZnVuY3Rpb24gYXBwbGllZCB3aGVuIHRoZSAnLScgYnV0dG9uIGlzIHByZXNzZWRcbiAgYXBwbHlab29tT3V0PzogKCBjdXJyZW50Wm9vbTogbnVtYmVyICkgPT4gbnVtYmVyO1xuXG4gIC8vIHByb3BhZ2F0ZWQgdG8gdGhlICcrJyBhbmQgJy0nIHB1c2ggYnV0dG9uc1xuICBidXR0b25PcHRpb25zPzogU3RyaWN0T21pdDxSZWN0YW5ndWxhclB1c2hCdXR0b25PcHRpb25zLCAnY29udGVudCcgfCAnbGlzdGVuZXInIHwgJ3RhbmRlbSc+O1xuXG4gIC8vIHBvaW50ZXIgYXJlYSBkaWxhdGlvbiwgY29ycmVjdCBmb3Igb3B0aW9ucy5vcmllbnRhdGlvbiwgYW5kIG92ZXJsYXAgd2lsbCBiZSBwcmV2ZW50ZWQgYnkgc2hpZnRpbmdcbiAgdG91Y2hBcmVhWERpbGF0aW9uPzogbnVtYmVyO1xuICB0b3VjaEFyZWFZRGlsYXRpb24/OiBudW1iZXI7XG4gIG1vdXNlQXJlYVhEaWxhdGlvbj86IG51bWJlcjtcbiAgbW91c2VBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xufTtcblxuZXhwb3J0IHR5cGUgWm9vbUJ1dHRvbkdyb3VwT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxGbG93Qm94T3B0aW9ucywgJ2NoaWxkcmVuJz47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFpvb21CdXR0b25Hcm91cCBleHRlbmRzIEZsb3dCb3gge1xuXG4gIHB1YmxpYyByZWFkb25seSB6b29tSW5CdXR0b246IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbjtcbiAgcHVibGljIHJlYWRvbmx5IHpvb21PdXRCdXR0b246IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbjtcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlWm9vbUJ1dHRvbkdyb3VwOiAoKSA9PiB2b2lkO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gem9vbUxldmVsUHJvcGVydHkgLSBzbWFsbGVyIHZhbHVlIG1lYW5zIG1vcmUgem9vbWVkIG91dFxuICAgKiBAcGFyYW0gem9vbUluSWNvblxuICAgKiBAcGFyYW0gem9vbU91dEljb25cbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9ucz9cbiAgICovXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3Rvciggem9vbUxldmVsUHJvcGVydHk6IFRSYW5nZWRQcm9wZXJ0eSwgem9vbUluSWNvbjogTm9kZSwgem9vbU91dEljb246IE5vZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zPzogWm9vbUJ1dHRvbkdyb3VwT3B0aW9ucyApIHtcblxuICAgIGNvbnN0IHpvb21MZXZlbFJhbmdlID0gem9vbUxldmVsUHJvcGVydHkucmFuZ2U7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFpvb21CdXR0b25Hcm91cE9wdGlvbnMsIFNlbGZPcHRpb25zLCBGbG93Qm94T3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyBab29tQnV0dG9uR3JvdXBPcHRpb25zXG4gICAgICBhcHBseVpvb21JbjogKCBjdXJyZW50Wm9vbTogbnVtYmVyICkgPT4gY3VycmVudFpvb20gKyAxLFxuICAgICAgYXBwbHlab29tT3V0OiAoIGN1cnJlbnRab29tOiBudW1iZXIgKSA9PiBjdXJyZW50Wm9vbSAtIDEsXG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDAsXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDAsXG4gICAgICBtb3VzZUFyZWFYRGlsYXRpb246IDAsXG4gICAgICBtb3VzZUFyZWFZRGlsYXRpb246IDAsXG4gICAgICBidXR0b25PcHRpb25zOiB7XG4gICAgICAgIGZpcmVPbkhvbGQ6IHRydWUsXG4gICAgICAgIGZpcmVPbkhvbGREZWxheTogNjAwLCAvLyBtc1xuICAgICAgICBmaXJlT25Ib2xkSW50ZXJ2YWw6IDI1MCwgLy8gbXNcbiAgICAgICAgcGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkOiBmYWxzZSxcbiAgICAgICAgcGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkOiBmYWxzZVxuICAgICAgfSxcblxuICAgICAgLy8gRmxvd0JveE9wdGlvbnNcbiAgICAgIHNwYWNpbmc6IDAsXG4gICAgICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLFxuICAgICAgYWxpZ246ICdjZW50ZXInLFxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXG4gICAgICB0YW5kZW1OYW1lU3VmZml4OiAnWm9vbUJ1dHRvbkdyb3VwJyxcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAvLyBGb3IgcG9pbnRlciBhcmVhcy4gRGVwZW5kZW50IG9uIG9wdGlvbnMuc3BhY2luZywgcG9pbnRlciBhcmVhcyB3aWxsIGJlIHNoaWZ0ZWQgdG8gcHJldmVudCBvdmVybGFwLlxuICAgIGNvbnN0IGhhbGZTcGFjaW5nID0gb3B0aW9ucy5zcGFjaW5nIC8gMjtcbiAgICBjb25zdCBtb3VzZVhTaGlmdCA9IE1hdGgubWF4KCAwLCBvcHRpb25zLm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcgPyBvcHRpb25zLm1vdXNlQXJlYVhEaWxhdGlvbiAtIGhhbGZTcGFjaW5nIDogMCApO1xuICAgIGNvbnN0IHRvdWNoWFNoaWZ0ID0gTWF0aC5tYXgoIDAsIG9wdGlvbnMub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJyA/IG9wdGlvbnMudG91Y2hBcmVhWERpbGF0aW9uIC0gaGFsZlNwYWNpbmcgOiAwICk7XG4gICAgY29uc3QgbW91c2VZU2hpZnQgPSBNYXRoLm1heCggMCwgb3B0aW9ucy5vcmllbnRhdGlvbiA9PT0gJ3ZlcnRpY2FsJyA/IG9wdGlvbnMubW91c2VBcmVhWURpbGF0aW9uIC0gaGFsZlNwYWNpbmcgOiAwICk7XG4gICAgY29uc3QgdG91Y2hZU2hpZnQgPSBNYXRoLm1heCggMCwgb3B0aW9ucy5vcmllbnRhdGlvbiA9PT0gJ3ZlcnRpY2FsJyA/IG9wdGlvbnMudG91Y2hBcmVhWURpbGF0aW9uIC0gaGFsZlNwYWNpbmcgOiAwICk7XG5cbiAgICAvLyB6b29tIGluXG4gICAgY29uc3Qgem9vbUluQnV0dG9uID0gbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiggY29tYmluZU9wdGlvbnM8UmVjdGFuZ3VsYXJQdXNoQnV0dG9uT3B0aW9ucz4oIHtcbiAgICAgIGNvbnRlbnQ6IHpvb21Jbkljb24sXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xuICAgICAgICB6b29tTGV2ZWxQcm9wZXJ0eS52YWx1ZSA9IG9wdGlvbnMuYXBwbHlab29tSW4oIHpvb21MZXZlbFByb3BlcnR5LnZhbHVlICk7XG4gICAgICB9LFxuICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiBvcHRpb25zLnRvdWNoQXJlYVhEaWxhdGlvbixcbiAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogb3B0aW9ucy50b3VjaEFyZWFZRGlsYXRpb24sXG4gICAgICBtb3VzZUFyZWFYRGlsYXRpb246IG9wdGlvbnMubW91c2VBcmVhWERpbGF0aW9uLFxuICAgICAgbW91c2VBcmVhWURpbGF0aW9uOiBvcHRpb25zLm1vdXNlQXJlYVlEaWxhdGlvbixcbiAgICAgIHRvdWNoQXJlYVhTaGlmdDogdG91Y2hYU2hpZnQsXG4gICAgICB0b3VjaEFyZWFZU2hpZnQ6IC10b3VjaFlTaGlmdCxcbiAgICAgIG1vdXNlQXJlYVhTaGlmdDogbW91c2VYU2hpZnQsXG4gICAgICBtb3VzZUFyZWFZU2hpZnQ6IC1tb3VzZVlTaGlmdCxcbiAgICAgIGFjY2Vzc2libGVOYW1lOiBTY2VuZXJ5UGhldFN0cmluZ3MuYTExeS56b29tSW5TdHJpbmdQcm9wZXJ0eSxcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnem9vbUluQnV0dG9uJyApXG4gICAgfSwgb3B0aW9ucy5idXR0b25PcHRpb25zICkgKTtcblxuICAgIC8vIHpvb20gb3V0XG4gICAgY29uc3Qgem9vbU91dEJ1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIGNvbWJpbmVPcHRpb25zPFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbk9wdGlvbnM+KCB7XG4gICAgICBjb250ZW50OiB6b29tT3V0SWNvbixcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XG4gICAgICAgIHpvb21MZXZlbFByb3BlcnR5LnZhbHVlID0gb3B0aW9ucy5hcHBseVpvb21PdXQoIHpvb21MZXZlbFByb3BlcnR5LnZhbHVlICk7XG4gICAgICB9LFxuICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiBvcHRpb25zLnRvdWNoQXJlYVhEaWxhdGlvbixcbiAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogb3B0aW9ucy50b3VjaEFyZWFZRGlsYXRpb24sXG4gICAgICBtb3VzZUFyZWFYRGlsYXRpb246IG9wdGlvbnMubW91c2VBcmVhWERpbGF0aW9uLFxuICAgICAgbW91c2VBcmVhWURpbGF0aW9uOiBvcHRpb25zLm1vdXNlQXJlYVlEaWxhdGlvbixcbiAgICAgIHRvdWNoQXJlYVhTaGlmdDogLXRvdWNoWFNoaWZ0LFxuICAgICAgdG91Y2hBcmVhWVNoaWZ0OiB0b3VjaFlTaGlmdCxcbiAgICAgIG1vdXNlQXJlYVhTaGlmdDogLW1vdXNlWFNoaWZ0LFxuICAgICAgbW91c2VBcmVhWVNoaWZ0OiBtb3VzZVlTaGlmdCxcbiAgICAgIGFjY2Vzc2libGVOYW1lOiBTY2VuZXJ5UGhldFN0cmluZ3MuYTExeS56b29tT3V0U3RyaW5nUHJvcGVydHksXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3pvb21PdXRCdXR0b24nIClcbiAgICB9LCBvcHRpb25zLmJ1dHRvbk9wdGlvbnMgKSApO1xuXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9ICggb3B0aW9ucy5vcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnICkgPyBbIHpvb21PdXRCdXR0b24sIHpvb21JbkJ1dHRvbiBdIDogWyB6b29tSW5CdXR0b24sIHpvb21PdXRCdXR0b24gXTtcblxuICAgIC8vIGRpc2FibGUgYSBidXR0b24gaWYgd2UgcmVhY2ggdGhlIG1pbiBvciBtYXhcbiAgICBjb25zdCB6b29tTGV2ZWxMaXN0ZW5lciA9ICggem9vbUxldmVsOiBudW1iZXIgKSA9PiB7XG4gICAgICB6b29tT3V0QnV0dG9uLmVuYWJsZWQgPSB6b29tTGV2ZWxSYW5nZS5jb250YWlucyggb3B0aW9ucy5hcHBseVpvb21PdXQoIHpvb21MZXZlbCApICk7XG4gICAgICB6b29tSW5CdXR0b24uZW5hYmxlZCA9IHpvb21MZXZlbFJhbmdlLmNvbnRhaW5zKCBvcHRpb25zLmFwcGx5Wm9vbUluKCB6b29tTGV2ZWwgKSApO1xuICAgIH07XG4gICAgem9vbUxldmVsUHJvcGVydHkubGluayggem9vbUxldmVsTGlzdGVuZXIgKTtcblxuICAgIHN1cGVyKCBvcHRpb25zICk7XG5cbiAgICAvLyBNYWtlIHRoZSB6b29tIGJ1dHRvbnMgYXZhaWxhYmxlIGFzIHByb3BlcnRpZXMuXG4gICAgdGhpcy56b29tT3V0QnV0dG9uID0gem9vbU91dEJ1dHRvbjtcbiAgICB0aGlzLnpvb21JbkJ1dHRvbiA9IHpvb21JbkJ1dHRvbjtcblxuICAgIHRoaXMuYWRkTGlua2VkRWxlbWVudCggem9vbUxldmVsUHJvcGVydHksIHtcbiAgICAgIHRhbmRlbU5hbWU6ICd6b29tUHJvcGVydHknXG4gICAgfSApO1xuXG4gICAgdGhpcy5kaXNwb3NlWm9vbUJ1dHRvbkdyb3VwID0gKCkgPT4ge1xuICAgICAgem9vbUluQnV0dG9uLmRpc3Bvc2UoKTtcbiAgICAgIHpvb21PdXRCdXR0b24uZGlzcG9zZSgpO1xuICAgICAgem9vbUxldmVsUHJvcGVydHkudW5saW5rKCB6b29tTGV2ZWxMaXN0ZW5lciApO1xuICAgIH07XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2Vab29tQnV0dG9uR3JvdXAoKTtcbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cbn1cblxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdab29tQnV0dG9uR3JvdXAnLCBab29tQnV0dG9uR3JvdXAgKTsiXSwibmFtZXMiOlsib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJGbG93Qm94IiwiUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIiwiVGFuZGVtIiwic2NlbmVyeVBoZXQiLCJTY2VuZXJ5UGhldFN0cmluZ3MiLCJab29tQnV0dG9uR3JvdXAiLCJkaXNwb3NlIiwiZGlzcG9zZVpvb21CdXR0b25Hcm91cCIsInpvb21MZXZlbFByb3BlcnR5Iiwiem9vbUluSWNvbiIsInpvb21PdXRJY29uIiwicHJvdmlkZWRPcHRpb25zIiwiem9vbUxldmVsUmFuZ2UiLCJyYW5nZSIsIm9wdGlvbnMiLCJhcHBseVpvb21JbiIsImN1cnJlbnRab29tIiwiYXBwbHlab29tT3V0IiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwibW91c2VBcmVhWERpbGF0aW9uIiwibW91c2VBcmVhWURpbGF0aW9uIiwiYnV0dG9uT3B0aW9ucyIsImZpcmVPbkhvbGQiLCJmaXJlT25Ib2xkRGVsYXkiLCJmaXJlT25Ib2xkSW50ZXJ2YWwiLCJwaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJzcGFjaW5nIiwib3JpZW50YXRpb24iLCJhbGlnbiIsInRhbmRlbSIsIlJFUVVJUkVEIiwidGFuZGVtTmFtZVN1ZmZpeCIsInBoZXRpb0ZlYXR1cmVkIiwiaGFsZlNwYWNpbmciLCJtb3VzZVhTaGlmdCIsIk1hdGgiLCJtYXgiLCJ0b3VjaFhTaGlmdCIsIm1vdXNlWVNoaWZ0IiwidG91Y2hZU2hpZnQiLCJ6b29tSW5CdXR0b24iLCJjb250ZW50IiwibGlzdGVuZXIiLCJ2YWx1ZSIsInRvdWNoQXJlYVhTaGlmdCIsInRvdWNoQXJlYVlTaGlmdCIsIm1vdXNlQXJlYVhTaGlmdCIsIm1vdXNlQXJlYVlTaGlmdCIsImFjY2Vzc2libGVOYW1lIiwiYTExeSIsInpvb21JblN0cmluZ1Byb3BlcnR5IiwiY3JlYXRlVGFuZGVtIiwiem9vbU91dEJ1dHRvbiIsInpvb21PdXRTdHJpbmdQcm9wZXJ0eSIsImNoaWxkcmVuIiwiem9vbUxldmVsTGlzdGVuZXIiLCJ6b29tTGV2ZWwiLCJlbmFibGVkIiwiY29udGFpbnMiLCJsaW5rIiwiYWRkTGlua2VkRWxlbWVudCIsInRhbmRlbU5hbWUiLCJ1bmxpbmsiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FHRCxPQUFPQSxhQUFhQyxjQUFjLFFBQVEsa0NBQWtDO0FBRTVFLFNBQVNDLE9BQU8sUUFBOEIsOEJBQThCO0FBQzVFLE9BQU9DLDJCQUE2RCxnREFBZ0Q7QUFDcEgsT0FBT0MsWUFBWSw0QkFBNEI7QUFDL0MsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQUMzQyxPQUFPQyx3QkFBd0IsMEJBQTBCO0FBc0IxQyxJQUFBLEFBQU1DLGtCQUFOLE1BQU1BLHdCQUF3Qkw7SUFnSDNCTSxVQUFnQjtRQUM5QixJQUFJLENBQUNDLHNCQUFzQjtRQUMzQixLQUFLLENBQUNEO0lBQ1I7SUE3R0E7Ozs7O0dBS0MsR0FDRCxZQUF1QkUsaUJBQWtDLEVBQUVDLFVBQWdCLEVBQUVDLFdBQWlCLEVBQ3ZFQyxlQUF3QyxDQUFHO1FBRWhFLE1BQU1DLGlCQUFpQkosa0JBQWtCSyxLQUFLO1FBRTlDLE1BQU1DLFVBQVVoQixZQUFrRTtZQUVoRix5QkFBeUI7WUFDekJpQixhQUFhLENBQUVDLGNBQXlCQSxjQUFjO1lBQ3REQyxjQUFjLENBQUVELGNBQXlCQSxjQUFjO1lBQ3ZERSxvQkFBb0I7WUFDcEJDLG9CQUFvQjtZQUNwQkMsb0JBQW9CO1lBQ3BCQyxvQkFBb0I7WUFDcEJDLGVBQWU7Z0JBQ2JDLFlBQVk7Z0JBQ1pDLGlCQUFpQjtnQkFDakJDLG9CQUFvQjtnQkFDcEJDLG1DQUFtQztnQkFDbkNDLG1DQUFtQztZQUNyQztZ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