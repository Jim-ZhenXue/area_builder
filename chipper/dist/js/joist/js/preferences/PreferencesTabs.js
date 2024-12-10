// Copyright 2021-2024, University of Colorado Boulder
/**
 * The tabs for the PreferencesDialog. Activating a tab will select a PreferencesTabPanel to be displayed to the user.
 * The actual tabs are implemented as radio buttons, styled to look like flat like a set of tabs.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import Multilink from '../../../axon/js/Multilink.js';
import optionize from '../../../phet-core/js/optionize.js';
import { HBox, KeyboardListener, Path } from '../../../scenery/js/imports.js';
import globeSolidShape from '../../../sherpa/js/fontawesome-5/globeSolidShape.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesTab from './PreferencesTab.js';
import PreferencesType from './PreferencesType.js';
const DEFAULT_TAB_SPACING = 10;
let PreferencesTabs = class PreferencesTabs extends HBox {
    /**
   * Returns the visibleProperty for the Tab associated with the PreferencesType. PreferencesTabs need to be hidden
   * if the Tab becomes invisible (mostly needed for PhET-iO).
   */ getTabVisibleProperty(preferencesType) {
        const tab = _.find(this.content, (content)=>content.value === preferencesType);
        assert && assert(tab, `tab not found for PreferencesType, ${preferencesType.name}`);
        return tab.visibleProperty;
    }
    /**
   * Move focus to the selected tab. Useful when the Preferences dialog is opened.
   */ focusSelectedTab() {
        this.content.forEach((content)=>{
            if (content.value === this.selectedPanelProperty.value) {
                content.focus();
            }
        });
    }
    constructor(supportedTabs, selectedPanelProperty, providedOptions){
        const options = optionize()({
            isDisposable: false,
            // pdom
            tagName: 'ul',
            ariaRole: 'tablist',
            groupFocusHighlight: true,
            spacing: DEFAULT_TAB_SPACING,
            align: 'bottom'
        }, providedOptions);
        super(options), //  A reference to the selected and focusable tab content so that we can determine which
        // tab is next in order when cycling through with alternative input.
        this.selectedButton = null, this.content = [];
        this.selectedPanelProperty = selectedPanelProperty;
        const isTabSupported = (preferencesType)=>_.includes(supportedTabs, preferencesType);
        // A dilation of the pointer areas makes it so that highlights that sorround the tabs are flush against eachother
        // which looks better, see https://github.com/phetsims/joist/issues/932
        const dilation = options.spacing / 2;
        if (isTabSupported(PreferencesType.OVERVIEW)) {
            this.content.push(new PreferencesTab(JoistStrings.preferences.tabs.overview.titleStringProperty, selectedPanelProperty, PreferencesType.OVERVIEW, {
                pointerAreaXDilation: dilation,
                tandem: options.tandem.createTandem('overviewTab')
            }));
        }
        if (isTabSupported(PreferencesType.SIMULATION)) {
            this.content.push(new PreferencesTab(JoistStrings.preferences.tabs.simulation.titleStringProperty, selectedPanelProperty, PreferencesType.SIMULATION, {
                pointerAreaXDilation: dilation,
                tandem: options.tandem.createTandem('simulationTab')
            }));
        }
        if (isTabSupported(PreferencesType.VISUAL)) {
            this.content.push(new PreferencesTab(JoistStrings.preferences.tabs.visual.titleStringProperty, selectedPanelProperty, PreferencesType.VISUAL, {
                pointerAreaXDilation: dilation,
                tandem: options.tandem.createTandem('visualTab')
            }));
        }
        if (isTabSupported(PreferencesType.AUDIO)) {
            this.content.push(new PreferencesTab(JoistStrings.preferences.tabs.audio.titleStringProperty, selectedPanelProperty, PreferencesType.AUDIO, {
                pointerAreaXDilation: dilation,
                tandem: options.tandem.createTandem('audioTab')
            }));
        }
        if (isTabSupported(PreferencesType.INPUT)) {
            this.content.push(new PreferencesTab(JoistStrings.preferences.tabs.input.titleStringProperty, selectedPanelProperty, PreferencesType.INPUT, {
                pointerAreaXDilation: dilation,
                tandem: options.tandem.createTandem('inputTab')
            }));
        }
        if (isTabSupported(PreferencesType.LOCALIZATION)) {
            this.content.push(new PreferencesTab(JoistStrings.preferences.tabs.localization.titleStringProperty, selectedPanelProperty, PreferencesType.LOCALIZATION, {
                pointerAreaXDilation: dilation,
                // Display a globe icon next to the localization label
                iconNode: new Path(globeSolidShape, {
                    scale: 1 / 25,
                    fill: 'black'
                }),
                tandem: options.tandem.createTandem('localizationTab')
            }));
        }
        this.children = this.content;
        // If the currently selected tab is hidden via phet-io, then select the first visible tab (if there is one)
        Multilink.multilinkAny([
            selectedPanelProperty,
            ...this.content.map((tab)=>tab.visibleProperty)
        ], ()=>{
            // Find the tab corresponding to the current selection
            const tab = this.content.find((tab)=>tab.value === selectedPanelProperty.value);
            // If the selected tab is not showing...
            if (!tab.visibleProperty.value) {
                // Find the leftmost tab that is showing (if there are any showing tabs)
                const firstShowingTab = this.content.find((tab)=>tab.visibleProperty.value);
                if (firstShowingTab) {
                    selectedPanelProperty.value = firstShowingTab.value;
                }
            }
        });
        // pdom - keyboard support to move through tabs with arrow keys
        const keyboardListener = new KeyboardListener({
            keys: [
                'arrowRight',
                'arrowLeft'
            ],
            fireOnDown: false,
            fire: (event, keysPressed)=>{
                // prevent "native" behavior so that Safari doesn't make an error sound with arrow keys in full screen mode
                if (event) {
                    event.preventDefault();
                }
                const direction = keysPressed === 'arrowRight' ? 1 : -1;
                for(let i = 0; i < this.content.length; i++){
                    if (this.selectedButton === this.content[i]) {
                        const nextButtonContent = this.content[i + direction];
                        if (nextButtonContent) {
                            // select the next tab and move focus to it - a listener on selectedPanelProperty sets the next
                            // selectedButton and makes it focusable
                            selectedPanelProperty.value = nextButtonContent.value;
                            this.selectedButton.focus();
                            break;
                        }
                    }
                }
            }
        });
        this.addInputListener(keyboardListener);
        const selectedPanelListener = ()=>{
            this.content.forEach((content)=>{
                if (content.value === this.selectedPanelProperty.value) {
                    this.selectedButton = content;
                }
            });
        };
        selectedPanelProperty.link(selectedPanelListener);
        // if there is only one tab, it is not interactive
        if (supportedTabs.length === 1) {
            this.focusable = false;
            this.inputEnabledProperty.value = false;
        }
    }
};
joist.register('PreferencesTabs', PreferencesTabs);
export default PreferencesTabs;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL3ByZWZlcmVuY2VzL1ByZWZlcmVuY2VzVGFicy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBUaGUgdGFicyBmb3IgdGhlIFByZWZlcmVuY2VzRGlhbG9nLiBBY3RpdmF0aW5nIGEgdGFiIHdpbGwgc2VsZWN0IGEgUHJlZmVyZW5jZXNUYWJQYW5lbCB0byBiZSBkaXNwbGF5ZWQgdG8gdGhlIHVzZXIuXG4gKiBUaGUgYWN0dWFsIHRhYnMgYXJlIGltcGxlbWVudGVkIGFzIHJhZGlvIGJ1dHRvbnMsIHN0eWxlZCB0byBsb29rIGxpa2UgZmxhdCBsaWtlIGEgc2V0IG9mIHRhYnMuXG4gKlxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XG5pbXBvcnQgVFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFByb3BlcnR5LmpzJztcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcbmltcG9ydCB7IEhCb3gsIEhCb3hPcHRpb25zLCBLZXlib2FyZExpc3RlbmVyLCBOb2RlLCBQYXRoIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBnbG9iZVNvbGlkU2hhcGUgZnJvbSAnLi4vLi4vLi4vc2hlcnBhL2pzL2ZvbnRhd2Vzb21lLTUvZ2xvYmVTb2xpZFNoYXBlLmpzJztcbmltcG9ydCBqb2lzdCBmcm9tICcuLi9qb2lzdC5qcyc7XG5pbXBvcnQgSm9pc3RTdHJpbmdzIGZyb20gJy4uL0pvaXN0U3RyaW5ncy5qcyc7XG5pbXBvcnQgUHJlZmVyZW5jZXNUYWIgZnJvbSAnLi9QcmVmZXJlbmNlc1RhYi5qcyc7XG5pbXBvcnQgUHJlZmVyZW5jZXNUeXBlIGZyb20gJy4vUHJlZmVyZW5jZXNUeXBlLmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XG5cbmV4cG9ydCB0eXBlIFByZWZlcmVuY2VzVGFic09wdGlvbnMgPSBIQm94T3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxIQm94T3B0aW9ucywgJ3RhbmRlbSc+O1xuXG5jb25zdCBERUZBVUxUX1RBQl9TUEFDSU5HID0gMTA7XG5cbmNsYXNzIFByZWZlcmVuY2VzVGFicyBleHRlbmRzIEhCb3gge1xuXG4gIC8vICBBIHJlZmVyZW5jZSB0byB0aGUgc2VsZWN0ZWQgYW5kIGZvY3VzYWJsZSB0YWIgY29udGVudCBzbyB0aGF0IHdlIGNhbiBkZXRlcm1pbmUgd2hpY2hcbiAgLy8gdGFiIGlzIG5leHQgaW4gb3JkZXIgd2hlbiBjeWNsaW5nIHRocm91Z2ggd2l0aCBhbHRlcm5hdGl2ZSBpbnB1dC5cbiAgcHJpdmF0ZSBzZWxlY3RlZEJ1dHRvbjogTm9kZSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHJlYWRvbmx5IHNlbGVjdGVkUGFuZWxQcm9wZXJ0eTogVFByb3BlcnR5PFByZWZlcmVuY2VzVHlwZT47XG4gIHByaXZhdGUgcmVhZG9ubHkgY29udGVudDogUHJlZmVyZW5jZXNUYWJbXSA9IFtdO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc3VwcG9ydGVkVGFiczogUHJlZmVyZW5jZXNUeXBlW10sIHNlbGVjdGVkUGFuZWxQcm9wZXJ0eTogVFByb3BlcnR5PFByZWZlcmVuY2VzVHlwZT4sIHByb3ZpZGVkT3B0aW9uczogUHJlZmVyZW5jZXNUYWJzT3B0aW9ucyApIHtcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFByZWZlcmVuY2VzVGFic09wdGlvbnMsIFNlbGZPcHRpb25zLCBIQm94T3B0aW9ucz4oKSgge1xuICAgICAgaXNEaXNwb3NhYmxlOiBmYWxzZSxcblxuICAgICAgLy8gcGRvbVxuICAgICAgdGFnTmFtZTogJ3VsJyxcbiAgICAgIGFyaWFSb2xlOiAndGFibGlzdCcsXG4gICAgICBncm91cEZvY3VzSGlnaGxpZ2h0OiB0cnVlLFxuICAgICAgc3BhY2luZzogREVGQVVMVF9UQUJfU1BBQ0lORyxcbiAgICAgIGFsaWduOiAnYm90dG9tJ1xuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIHRoaXMuc2VsZWN0ZWRQYW5lbFByb3BlcnR5ID0gc2VsZWN0ZWRQYW5lbFByb3BlcnR5O1xuXG4gICAgY29uc3QgaXNUYWJTdXBwb3J0ZWQgPSAoIHByZWZlcmVuY2VzVHlwZTogUHJlZmVyZW5jZXNUeXBlICkgPT4gXy5pbmNsdWRlcyggc3VwcG9ydGVkVGFicywgcHJlZmVyZW5jZXNUeXBlICk7XG5cbiAgICAvLyBBIGRpbGF0aW9uIG9mIHRoZSBwb2ludGVyIGFyZWFzIG1ha2VzIGl0IHNvIHRoYXQgaGlnaGxpZ2h0cyB0aGF0IHNvcnJvdW5kIHRoZSB0YWJzIGFyZSBmbHVzaCBhZ2FpbnN0IGVhY2hvdGhlclxuICAgIC8vIHdoaWNoIGxvb2tzIGJldHRlciwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvOTMyXG4gICAgY29uc3QgZGlsYXRpb24gPSBvcHRpb25zLnNwYWNpbmcgLyAyO1xuICAgIGlmICggaXNUYWJTdXBwb3J0ZWQoIFByZWZlcmVuY2VzVHlwZS5PVkVSVklFVyApICkge1xuICAgICAgdGhpcy5jb250ZW50LnB1c2goIG5ldyBQcmVmZXJlbmNlc1RhYiggSm9pc3RTdHJpbmdzLnByZWZlcmVuY2VzLnRhYnMub3ZlcnZpZXcudGl0bGVTdHJpbmdQcm9wZXJ0eSwgc2VsZWN0ZWRQYW5lbFByb3BlcnR5LCBQcmVmZXJlbmNlc1R5cGUuT1ZFUlZJRVcsIHtcbiAgICAgICAgcG9pbnRlckFyZWFYRGlsYXRpb246IGRpbGF0aW9uLFxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ292ZXJ2aWV3VGFiJyApXG4gICAgICB9ICkgKTtcbiAgICB9XG4gICAgaWYgKCBpc1RhYlN1cHBvcnRlZCggUHJlZmVyZW5jZXNUeXBlLlNJTVVMQVRJT04gKSApIHtcbiAgICAgIHRoaXMuY29udGVudC5wdXNoKCBuZXcgUHJlZmVyZW5jZXNUYWIoIEpvaXN0U3RyaW5ncy5wcmVmZXJlbmNlcy50YWJzLnNpbXVsYXRpb24udGl0bGVTdHJpbmdQcm9wZXJ0eSwgc2VsZWN0ZWRQYW5lbFByb3BlcnR5LCBQcmVmZXJlbmNlc1R5cGUuU0lNVUxBVElPTiwge1xuICAgICAgICBwb2ludGVyQXJlYVhEaWxhdGlvbjogZGlsYXRpb24sXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnc2ltdWxhdGlvblRhYicgKVxuICAgICAgfSApICk7XG4gICAgfVxuICAgIGlmICggaXNUYWJTdXBwb3J0ZWQoIFByZWZlcmVuY2VzVHlwZS5WSVNVQUwgKSApIHtcbiAgICAgIHRoaXMuY29udGVudC5wdXNoKCBuZXcgUHJlZmVyZW5jZXNUYWIoIEpvaXN0U3RyaW5ncy5wcmVmZXJlbmNlcy50YWJzLnZpc3VhbC50aXRsZVN0cmluZ1Byb3BlcnR5LCBzZWxlY3RlZFBhbmVsUHJvcGVydHksIFByZWZlcmVuY2VzVHlwZS5WSVNVQUwsIHtcbiAgICAgICAgcG9pbnRlckFyZWFYRGlsYXRpb246IGRpbGF0aW9uLFxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Zpc3VhbFRhYicgKVxuICAgICAgfSApICk7XG4gICAgfVxuICAgIGlmICggaXNUYWJTdXBwb3J0ZWQoIFByZWZlcmVuY2VzVHlwZS5BVURJTyApICkge1xuICAgICAgdGhpcy5jb250ZW50LnB1c2goIG5ldyBQcmVmZXJlbmNlc1RhYiggSm9pc3RTdHJpbmdzLnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udGl0bGVTdHJpbmdQcm9wZXJ0eSwgc2VsZWN0ZWRQYW5lbFByb3BlcnR5LCBQcmVmZXJlbmNlc1R5cGUuQVVESU8sIHtcbiAgICAgICAgcG9pbnRlckFyZWFYRGlsYXRpb246IGRpbGF0aW9uLFxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2F1ZGlvVGFiJyApXG4gICAgICB9ICkgKTtcbiAgICB9XG4gICAgaWYgKCBpc1RhYlN1cHBvcnRlZCggUHJlZmVyZW5jZXNUeXBlLklOUFVUICkgKSB7XG4gICAgICB0aGlzLmNvbnRlbnQucHVzaCggbmV3IFByZWZlcmVuY2VzVGFiKCBKb2lzdFN0cmluZ3MucHJlZmVyZW5jZXMudGFicy5pbnB1dC50aXRsZVN0cmluZ1Byb3BlcnR5LCBzZWxlY3RlZFBhbmVsUHJvcGVydHksIFByZWZlcmVuY2VzVHlwZS5JTlBVVCwge1xuICAgICAgICBwb2ludGVyQXJlYVhEaWxhdGlvbjogZGlsYXRpb24sXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnaW5wdXRUYWInIClcbiAgICAgIH0gKSApO1xuICAgIH1cbiAgICBpZiAoIGlzVGFiU3VwcG9ydGVkKCBQcmVmZXJlbmNlc1R5cGUuTE9DQUxJWkFUSU9OICkgKSB7XG4gICAgICB0aGlzLmNvbnRlbnQucHVzaCggbmV3IFByZWZlcmVuY2VzVGFiKCBKb2lzdFN0cmluZ3MucHJlZmVyZW5jZXMudGFicy5sb2NhbGl6YXRpb24udGl0bGVTdHJpbmdQcm9wZXJ0eSwgc2VsZWN0ZWRQYW5lbFByb3BlcnR5LCBQcmVmZXJlbmNlc1R5cGUuTE9DQUxJWkFUSU9OLCB7XG4gICAgICAgIHBvaW50ZXJBcmVhWERpbGF0aW9uOiBkaWxhdGlvbixcblxuICAgICAgICAvLyBEaXNwbGF5IGEgZ2xvYmUgaWNvbiBuZXh0IHRvIHRoZSBsb2NhbGl6YXRpb24gbGFiZWxcbiAgICAgICAgaWNvbk5vZGU6IG5ldyBQYXRoKCBnbG9iZVNvbGlkU2hhcGUsIHtcbiAgICAgICAgICBzY2FsZTogMSAvIDI1LCAvLyBieSBpbnNwZWN0aW9uXG4gICAgICAgICAgZmlsbDogJ2JsYWNrJ1xuICAgICAgICB9ICksXG5cbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdsb2NhbGl6YXRpb25UYWInIClcbiAgICAgIH0gKSApO1xuICAgIH1cblxuICAgIHRoaXMuY2hpbGRyZW4gPSB0aGlzLmNvbnRlbnQ7XG5cbiAgICAvLyBJZiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHRhYiBpcyBoaWRkZW4gdmlhIHBoZXQtaW8sIHRoZW4gc2VsZWN0IHRoZSBmaXJzdCB2aXNpYmxlIHRhYiAoaWYgdGhlcmUgaXMgb25lKVxuICAgIE11bHRpbGluay5tdWx0aWxpbmtBbnkoIFsgc2VsZWN0ZWRQYW5lbFByb3BlcnR5LCAuLi50aGlzLmNvbnRlbnQubWFwKCB0YWIgPT4gdGFiLnZpc2libGVQcm9wZXJ0eSApIF0sICgpID0+IHtcblxuICAgICAgLy8gRmluZCB0aGUgdGFiIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGN1cnJlbnQgc2VsZWN0aW9uXG4gICAgICBjb25zdCB0YWIgPSB0aGlzLmNvbnRlbnQuZmluZCggdGFiID0+IHRhYi52YWx1ZSA9PT0gc2VsZWN0ZWRQYW5lbFByb3BlcnR5LnZhbHVlICkhO1xuXG4gICAgICAvLyBJZiB0aGUgc2VsZWN0ZWQgdGFiIGlzIG5vdCBzaG93aW5nLi4uXG4gICAgICBpZiAoICF0YWIudmlzaWJsZVByb3BlcnR5LnZhbHVlICkge1xuXG4gICAgICAgIC8vIEZpbmQgdGhlIGxlZnRtb3N0IHRhYiB0aGF0IGlzIHNob3dpbmcgKGlmIHRoZXJlIGFyZSBhbnkgc2hvd2luZyB0YWJzKVxuICAgICAgICBjb25zdCBmaXJzdFNob3dpbmdUYWIgPSB0aGlzLmNvbnRlbnQuZmluZCggdGFiID0+IHRhYi52aXNpYmxlUHJvcGVydHkudmFsdWUgKTtcbiAgICAgICAgaWYgKCBmaXJzdFNob3dpbmdUYWIgKSB7XG4gICAgICAgICAgc2VsZWN0ZWRQYW5lbFByb3BlcnR5LnZhbHVlID0gZmlyc3RTaG93aW5nVGFiLnZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gcGRvbSAtIGtleWJvYXJkIHN1cHBvcnQgdG8gbW92ZSB0aHJvdWdoIHRhYnMgd2l0aCBhcnJvdyBrZXlzXG4gICAgY29uc3Qga2V5Ym9hcmRMaXN0ZW5lciA9IG5ldyBLZXlib2FyZExpc3RlbmVyKCB7XG4gICAgICBrZXlzOiBbICdhcnJvd1JpZ2h0JywgJ2Fycm93TGVmdCcgXSxcbiAgICAgIGZpcmVPbkRvd246IGZhbHNlLFxuICAgICAgZmlyZTogKCBldmVudCwga2V5c1ByZXNzZWQgKSA9PiB7XG5cbiAgICAgICAgLy8gcHJldmVudCBcIm5hdGl2ZVwiIGJlaGF2aW9yIHNvIHRoYXQgU2FmYXJpIGRvZXNuJ3QgbWFrZSBhbiBlcnJvciBzb3VuZCB3aXRoIGFycm93IGtleXMgaW4gZnVsbCBzY3JlZW4gbW9kZVxuICAgICAgICBpZiAoIGV2ZW50ICkge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkaXJlY3Rpb24gPSBrZXlzUHJlc3NlZCA9PT0gJ2Fycm93UmlnaHQnID8gMSA6IC0xO1xuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmNvbnRlbnQubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgaWYgKCB0aGlzLnNlbGVjdGVkQnV0dG9uID09PSB0aGlzLmNvbnRlbnRbIGkgXSApIHtcbiAgICAgICAgICAgIGNvbnN0IG5leHRCdXR0b25Db250ZW50ID0gdGhpcy5jb250ZW50WyBpICsgZGlyZWN0aW9uIF07XG4gICAgICAgICAgICBpZiAoIG5leHRCdXR0b25Db250ZW50ICkge1xuXG4gICAgICAgICAgICAgIC8vIHNlbGVjdCB0aGUgbmV4dCB0YWIgYW5kIG1vdmUgZm9jdXMgdG8gaXQgLSBhIGxpc3RlbmVyIG9uIHNlbGVjdGVkUGFuZWxQcm9wZXJ0eSBzZXRzIHRoZSBuZXh0XG4gICAgICAgICAgICAgIC8vIHNlbGVjdGVkQnV0dG9uIGFuZCBtYWtlcyBpdCBmb2N1c2FibGVcbiAgICAgICAgICAgICAgc2VsZWN0ZWRQYW5lbFByb3BlcnR5LnZhbHVlID0gbmV4dEJ1dHRvbkNvbnRlbnQudmFsdWU7XG4gICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRCdXR0b24uZm9jdXMoKTtcblxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ICk7XG4gICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCBrZXlib2FyZExpc3RlbmVyICk7XG5cbiAgICBjb25zdCBzZWxlY3RlZFBhbmVsTGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgICB0aGlzLmNvbnRlbnQuZm9yRWFjaCggY29udGVudCA9PiB7XG4gICAgICAgIGlmICggY29udGVudC52YWx1ZSA9PT0gdGhpcy5zZWxlY3RlZFBhbmVsUHJvcGVydHkudmFsdWUgKSB7XG4gICAgICAgICAgdGhpcy5zZWxlY3RlZEJ1dHRvbiA9IGNvbnRlbnQ7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICB9O1xuICAgIHNlbGVjdGVkUGFuZWxQcm9wZXJ0eS5saW5rKCBzZWxlY3RlZFBhbmVsTGlzdGVuZXIgKTtcblxuICAgIC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lIHRhYiwgaXQgaXMgbm90IGludGVyYWN0aXZlXG4gICAgaWYgKCBzdXBwb3J0ZWRUYWJzLmxlbmd0aCA9PT0gMSApIHtcbiAgICAgIHRoaXMuZm9jdXNhYmxlID0gZmFsc2U7XG4gICAgICB0aGlzLmlucHV0RW5hYmxlZFByb3BlcnR5LnZhbHVlID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHZpc2libGVQcm9wZXJ0eSBmb3IgdGhlIFRhYiBhc3NvY2lhdGVkIHdpdGggdGhlIFByZWZlcmVuY2VzVHlwZS4gUHJlZmVyZW5jZXNUYWJzIG5lZWQgdG8gYmUgaGlkZGVuXG4gICAqIGlmIHRoZSBUYWIgYmVjb21lcyBpbnZpc2libGUgKG1vc3RseSBuZWVkZWQgZm9yIFBoRVQtaU8pLlxuICAgKi9cbiAgcHVibGljIGdldFRhYlZpc2libGVQcm9wZXJ0eSggcHJlZmVyZW5jZXNUeXBlOiBQcmVmZXJlbmNlc1R5cGUgKTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHRhYiA9IF8uZmluZCggdGhpcy5jb250ZW50LCBjb250ZW50ID0+IGNvbnRlbnQudmFsdWUgPT09IHByZWZlcmVuY2VzVHlwZSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRhYiwgYHRhYiBub3QgZm91bmQgZm9yIFByZWZlcmVuY2VzVHlwZSwgJHtwcmVmZXJlbmNlc1R5cGUubmFtZX1gICk7XG4gICAgcmV0dXJuIHRhYiEudmlzaWJsZVByb3BlcnR5O1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgZm9jdXMgdG8gdGhlIHNlbGVjdGVkIHRhYi4gVXNlZnVsIHdoZW4gdGhlIFByZWZlcmVuY2VzIGRpYWxvZyBpcyBvcGVuZWQuXG4gICAqL1xuICBwdWJsaWMgZm9jdXNTZWxlY3RlZFRhYigpOiB2b2lkIHtcbiAgICB0aGlzLmNvbnRlbnQuZm9yRWFjaCggY29udGVudCA9PiB7XG4gICAgICBpZiAoIGNvbnRlbnQudmFsdWUgPT09IHRoaXMuc2VsZWN0ZWRQYW5lbFByb3BlcnR5LnZhbHVlICkge1xuICAgICAgICBjb250ZW50LmZvY3VzKCk7XG4gICAgICB9XG4gICAgfSApO1xuICB9XG59XG5cbmpvaXN0LnJlZ2lzdGVyKCAnUHJlZmVyZW5jZXNUYWJzJywgUHJlZmVyZW5jZXNUYWJzICk7XG5leHBvcnQgZGVmYXVsdCBQcmVmZXJlbmNlc1RhYnM7Il0sIm5hbWVzIjpbIk11bHRpbGluayIsIm9wdGlvbml6ZSIsIkhCb3giLCJLZXlib2FyZExpc3RlbmVyIiwiUGF0aCIsImdsb2JlU29saWRTaGFwZSIsImpvaXN0IiwiSm9pc3RTdHJpbmdzIiwiUHJlZmVyZW5jZXNUYWIiLCJQcmVmZXJlbmNlc1R5cGUiLCJERUZBVUxUX1RBQl9TUEFDSU5HIiwiUHJlZmVyZW5jZXNUYWJzIiwiZ2V0VGFiVmlzaWJsZVByb3BlcnR5IiwicHJlZmVyZW5jZXNUeXBlIiwidGFiIiwiXyIsImZpbmQiLCJjb250ZW50IiwidmFsdWUiLCJhc3NlcnQiLCJuYW1lIiwidmlzaWJsZVByb3BlcnR5IiwiZm9jdXNTZWxlY3RlZFRhYiIsImZvckVhY2giLCJzZWxlY3RlZFBhbmVsUHJvcGVydHkiLCJmb2N1cyIsInN1cHBvcnRlZFRhYnMiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiaXNEaXNwb3NhYmxlIiwidGFnTmFtZSIsImFyaWFSb2xlIiwiZ3JvdXBGb2N1c0hpZ2hsaWdodCIsInNwYWNpbmciLCJhbGlnbiIsInNlbGVjdGVkQnV0dG9uIiwiaXNUYWJTdXBwb3J0ZWQiLCJpbmNsdWRlcyIsImRpbGF0aW9uIiwiT1ZFUlZJRVciLCJwdXNoIiwicHJlZmVyZW5jZXMiLCJ0YWJzIiwib3ZlcnZpZXciLCJ0aXRsZVN0cmluZ1Byb3BlcnR5IiwicG9pbnRlckFyZWFYRGlsYXRpb24iLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJTSU1VTEFUSU9OIiwic2ltdWxhdGlvbiIsIlZJU1VBTCIsInZpc3VhbCIsIkFVRElPIiwiYXVkaW8iLCJJTlBVVCIsImlucHV0IiwiTE9DQUxJWkFUSU9OIiwibG9jYWxpemF0aW9uIiwiaWNvbk5vZGUiLCJzY2FsZSIsImZpbGwiLCJjaGlsZHJlbiIsIm11bHRpbGlua0FueSIsIm1hcCIsImZpcnN0U2hvd2luZ1RhYiIsImtleWJvYXJkTGlzdGVuZXIiLCJrZXlzIiwiZmlyZU9uRG93biIsImZpcmUiLCJldmVudCIsImtleXNQcmVzc2VkIiwicHJldmVudERlZmF1bHQiLCJkaXJlY3Rpb24iLCJpIiwibGVuZ3RoIiwibmV4dEJ1dHRvbkNvbnRlbnQiLCJhZGRJbnB1dExpc3RlbmVyIiwic2VsZWN0ZWRQYW5lbExpc3RlbmVyIiwibGluayIsImZvY3VzYWJsZSIsImlucHV0RW5hYmxlZFByb3BlcnR5IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELE9BQU9BLGVBQWUsZ0NBQWdDO0FBR3RELE9BQU9DLGVBQXFDLHFDQUFxQztBQUVqRixTQUFTQyxJQUFJLEVBQWVDLGdCQUFnQixFQUFRQyxJQUFJLFFBQVEsaUNBQWlDO0FBQ2pHLE9BQU9DLHFCQUFxQixzREFBc0Q7QUFDbEYsT0FBT0MsV0FBVyxjQUFjO0FBQ2hDLE9BQU9DLGtCQUFrQixxQkFBcUI7QUFDOUMsT0FBT0Msb0JBQW9CLHNCQUFzQjtBQUNqRCxPQUFPQyxxQkFBcUIsdUJBQXVCO0FBTW5ELE1BQU1DLHNCQUFzQjtBQUU1QixJQUFBLEFBQU1DLGtCQUFOLE1BQU1BLHdCQUF3QlQ7SUEwSTVCOzs7R0FHQyxHQUNELEFBQU9VLHNCQUF1QkMsZUFBZ0MsRUFBK0I7UUFDM0YsTUFBTUMsTUFBTUMsRUFBRUMsSUFBSSxDQUFFLElBQUksQ0FBQ0MsT0FBTyxFQUFFQSxDQUFBQSxVQUFXQSxRQUFRQyxLQUFLLEtBQUtMO1FBQy9ETSxVQUFVQSxPQUFRTCxLQUFLLENBQUMsbUNBQW1DLEVBQUVELGdCQUFnQk8sSUFBSSxFQUFFO1FBQ25GLE9BQU9OLElBQUtPLGVBQWU7SUFDN0I7SUFFQTs7R0FFQyxHQUNELEFBQU9DLG1CQUF5QjtRQUM5QixJQUFJLENBQUNMLE9BQU8sQ0FBQ00sT0FBTyxDQUFFTixDQUFBQTtZQUNwQixJQUFLQSxRQUFRQyxLQUFLLEtBQUssSUFBSSxDQUFDTSxxQkFBcUIsQ0FBQ04sS0FBSyxFQUFHO2dCQUN4REQsUUFB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