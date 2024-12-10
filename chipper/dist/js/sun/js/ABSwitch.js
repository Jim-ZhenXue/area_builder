// Copyright 2014-2024, University of Colorado Boulder
/**
 * ABSwitch is a control for switching between 2 choices, referred to as 'A' & 'B'.
 * Choice 'A' is to the left of the switch, choice 'B' is to the right.
 * This decorates ToggleSwitch with labels.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Emitter from '../../axon/js/Emitter.js';
import PatternStringProperty from '../../axon/js/PatternStringProperty.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { AlignBox, AlignGroup, HBox, ParallelDOM, PDOMUtils, PressListener, SceneryConstants } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';
import SunStrings from './SunStrings.js';
import ToggleSwitch from './ToggleSwitch.js';
// constants
// Uses opacity as the default method of indicating whether a {Node} label is {boolean} enabled.
const DEFAULT_SET_LABEL_ENABLED = (label, enabled)=>{
    label.opacity = enabled ? 1.0 : SceneryConstants.DISABLED_OPACITY;
};
let ABSwitch = class ABSwitch extends HBox {
    dispose() {
        this.disposeABSwitch();
        super.dispose();
    }
    /**
   * Provide a custom look for when this switch is disabled. We are overriding the default implementation so that
   * the unselected label does not appear to be doubly disabled when the ABSwitch is disabled.
   * See https://github.com/phetsims/sun/issues/853
   */ onEnabledPropertyChange(enabled) {
        !enabled && this.interruptSubtreeInput();
        this.inputEnabled = enabled;
        this.toggleSwitch.enabled = enabled;
        this.updateLabelsEnabled();
    }
    /**
   * Updates the enabled state of the labels based on the current value of the associated Property.
   * The selected label will appear to be enabled, while the unselected label will appear to be disabled.
   * If the ABSwitch itself is disabled, both labels will appear to be disabled.
   */ updateLabelsEnabled() {
        this.setLabelEnabled(this.labelA, this.enabled && this.property.value === this.valueA);
        this.setLabelEnabled(this.labelB, this.enabled && this.property.value === this.valueB);
    }
    /**
   * @param property - value of the current choice
   * @param valueA - value for choice 'A'
   * @param labelA - label for choice 'A'
   * @param valueB - value for choice 'B'
   * @param labelB - label for choice 'B'
   * @param providedOptions
   */ constructor(property, valueA, labelA, valueB, labelB, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        assert && assert(property.valueComparisonStrategy === 'reference', 'ABSwitch depends on "===" equality for value comparison');
        // PhET-iO requirements
        assert && assert(labelA.tandem, 'labelA must have a tandem');
        assert && assert(labelB.tandem, 'labelB must have a tandem');
        // default option values
        const options = optionize()({
            // SelfOptions
            toggleSwitchOptions: {
                enabledPropertyOptions: {
                    phetioFeatured: false // ABSwitch has an enabledProperty that is preferred to the sub-component's
                }
            },
            setLabelEnabled: DEFAULT_SET_LABEL_ENABLED,
            centerOnSwitch: false,
            valueAAccessibleName: null,
            valueBAccessibleName: null,
            // HBoxOptions
            cursor: 'pointer',
            disabledOpacity: SceneryConstants.DISABLED_OPACITY,
            spacing: 8,
            // phet-io
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'Switch',
            visiblePropertyOptions: {
                phetioFeatured: true
            },
            phetioEnabledPropertyInstrumented: true // opt into default PhET-iO instrumented enabledProperty
        }, providedOptions);
        const toggleSwitch = new ToggleSwitch(property, valueA, valueB, combineOptions({
            tandem: options.tandem.createTandem('toggleSwitch'),
            // Aria switch attributes do not accurately describe switches with more than a binary state.
            // Instead, custom accessible names are used to describe the switch state.
            accessibleSwitch: false
        }, options.toggleSwitchOptions));
        let nodeA = labelA;
        let nodeB = labelB;
        if (options.centerOnSwitch) {
            // Make both labels have the same effective size, so that this.center is at the center of toggleSwitch.
            const alignGroup = new AlignGroup();
            nodeA = new AlignBox(labelA, {
                group: alignGroup,
                xAlign: 'right'
            });
            nodeB = new AlignBox(labelB, {
                group: alignGroup,
                xAlign: 'left'
            });
        }
        options.children = [
            nodeA,
            toggleSwitch,
            nodeB
        ];
        super(options), // Emits on input that results in a change to the Property value, after the Property has changed.
        this.onInputEmitter = new Emitter();
        this.property = property;
        this.valueA = valueA;
        this.valueB = valueB;
        this.labelA = labelA;
        this.labelB = labelB;
        this.toggleSwitch = toggleSwitch;
        this.setLabelEnabled = options.setLabelEnabled;
        // pdom - Setting helpText on ABSwitch forwards the values to the actual ToggleSwitch.
        ParallelDOM.forwardHelpText(this, toggleSwitch);
        // Find accessible names from the labels if optional values were not provided.
        const valueAAccessibleName = options.valueAAccessibleName || PDOMUtils.findStringProperty(labelA);
        const valueBAccessibleName = options.valueBAccessibleName || PDOMUtils.findStringProperty(labelB);
        // PatternStringProperties for each switch value so that the accessible name will also change when changing locales.
        const valueASelectedAccessibleNameStringProperty = new PatternStringProperty(SunStrings.a11y.aBSwitch.accessibleNamePatternStringProperty, {
            selectedValue: valueAAccessibleName,
            otherValue: valueBAccessibleName
        });
        const valueBSelectedAccessibleNameStringProperty = new PatternStringProperty(SunStrings.a11y.aBSwitch.accessibleNamePatternStringProperty, {
            selectedValue: valueBAccessibleName,
            otherValue: valueAAccessibleName
        });
        const propertyListener = (value)=>{
            this.updateLabelsEnabled();
            toggleSwitch.accessibleName = value === valueA ? valueASelectedAccessibleNameStringProperty : valueBSelectedAccessibleNameStringProperty;
        };
        property.link(propertyListener); // unlink on dispose
        // click on labels to select
        const pressListenerA = new PressListener({
            release: ()=>{
                const oldValue = property.value;
                property.value = valueA;
                if (oldValue !== valueA) {
                    this.onInputEmitter.emit();
                }
            },
            tandem: labelA.tandem.createTandem('pressListener')
        });
        labelA.addInputListener(pressListenerA); // removeInputListener on dispose
        const pressListenerB = new PressListener({
            release: ()=>{
                const oldValue = property.value;
                property.value = valueB;
                if (oldValue !== valueB) {
                    this.onInputEmitter.emit();
                }
            },
            tandem: labelB.tandem.createTandem('pressListener')
        });
        labelB.addInputListener(pressListenerB); // removeInputListener on dispose
        // The toggleSwitch input triggers ABSwitch input.
        toggleSwitch.onInputEmitter.addListener(()=>this.onInputEmitter.emit());
        // Wire up sound on input
        this.onInputEmitter.addListener(()=>{
            if (property.value === valueB) {
                toggleSwitch.switchToRightSoundPlayer.play();
            }
            if (property.value === valueA) {
                toggleSwitch.switchToLeftSoundPlayer.play();
            }
        });
        this.disposeABSwitch = ()=>{
            property.unlink(propertyListener);
            toggleSwitch.dispose();
            valueASelectedAccessibleNameStringProperty.dispose();
            valueBSelectedAccessibleNameStringProperty.dispose();
            this.onInputEmitter.dispose();
            labelA.removeInputListener(pressListenerA);
            labelB.removeInputListener(pressListenerB);
            pressListenerA.dispose();
            pressListenerB.dispose();
        };
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('sun', 'ABSwitch', this);
    }
};
export { ABSwitch as default };
sun.register('ABSwitch', ABSwitch);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9BQlN3aXRjaC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBQlN3aXRjaCBpcyBhIGNvbnRyb2wgZm9yIHN3aXRjaGluZyBiZXR3ZWVuIDIgY2hvaWNlcywgcmVmZXJyZWQgdG8gYXMgJ0EnICYgJ0InLlxuICogQ2hvaWNlICdBJyBpcyB0byB0aGUgbGVmdCBvZiB0aGUgc3dpdGNoLCBjaG9pY2UgJ0InIGlzIHRvIHRoZSByaWdodC5cbiAqIFRoaXMgZGVjb3JhdGVzIFRvZ2dsZVN3aXRjaCB3aXRoIGxhYmVscy5cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XG5pbXBvcnQgUGF0dGVyblN0cmluZ1Byb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUGF0dGVyblN0cmluZ1Byb3BlcnR5LmpzJztcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBURW1pdHRlciBmcm9tICcuLi8uLi9heG9uL2pzL1RFbWl0dGVyLmpzJztcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBJbnN0YW5jZVJlZ2lzdHJ5IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9kb2N1bWVudGF0aW9uL0luc3RhbmNlUmVnaXN0cnkuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IHsgQWxpZ25Cb3gsIEFsaWduR3JvdXAsIEhCb3gsIEhCb3hPcHRpb25zLCBOb2RlLCBQYXJhbGxlbERPTSwgUERPTVV0aWxzLCBQcmVzc0xpc3RlbmVyLCBTY2VuZXJ5Q29uc3RhbnRzLCBUcmltUGFyYWxsZWxET01PcHRpb25zIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgc3VuIGZyb20gJy4vc3VuLmpzJztcbmltcG9ydCBTdW5TdHJpbmdzIGZyb20gJy4vU3VuU3RyaW5ncy5qcyc7XG5pbXBvcnQgVG9nZ2xlU3dpdGNoLCB7IFRvZ2dsZVN3aXRjaE9wdGlvbnMgfSBmcm9tICcuL1RvZ2dsZVN3aXRjaC5qcyc7XG5cbi8vIGNvbnN0YW50c1xuXG4vLyBVc2VzIG9wYWNpdHkgYXMgdGhlIGRlZmF1bHQgbWV0aG9kIG9mIGluZGljYXRpbmcgd2hldGhlciBhIHtOb2RlfSBsYWJlbCBpcyB7Ym9vbGVhbn0gZW5hYmxlZC5cbmNvbnN0IERFRkFVTFRfU0VUX0xBQkVMX0VOQUJMRUQgPSAoIGxhYmVsOiBOb2RlLCBlbmFibGVkOiBib29sZWFuICkgPT4ge1xuICBsYWJlbC5vcGFjaXR5ID0gZW5hYmxlZCA/IDEuMCA6IFNjZW5lcnlDb25zdGFudHMuRElTQUJMRURfT1BBQ0lUWTtcbn07XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG5cbiAgLy8gb3B0aW9ucyBwYXNzZWQgdG8gVG9nZ2xlU3dpdGNoXG4gIHRvZ2dsZVN3aXRjaE9wdGlvbnM/OiBUb2dnbGVTd2l0Y2hPcHRpb25zO1xuXG4gIC8vIG1ldGhvZCBvZiBtYWtpbmcgYSBsYWJlbCBsb29rIGRpc2FibGVkXG4gIHNldExhYmVsRW5hYmxlZD86ICggbGFiZWxOb2RlOiBOb2RlLCBlbmFibGVkOiBib29sZWFuICkgPT4gdm9pZDtcblxuICAvLyBBY2Nlc3NpYmxlIG5hbWVzIGZvciBlYWNoIHZhbHVlLiBUaGV5IHdpbGwgYmUgaW5zZXJ0ZWQgaW50byBhIHBhdHRlcm4gc3RyaW5nIGZvciB0aGUgYWNjZXNzaWJsZSBuYW1lXG4gIC8vIG9mIHRoZSBBQlN3aXRjaC4gSWYgbm90IHByb3ZpZGVkLCBBQlN3aXRjaCB3aWxsIHRyeSB0byBmaW5kIGRlZmF1bHQgdmFsdWVzIGZyb20gdGhlIGxhYmVsIE5vZGVzLiBUaGVcbiAgLy8gZmluYWwgc3RyaW5nIHdpbGwgbG9vayBsaWtlOlxuICAvLyBcInt7dmFsdWVBQWNjZXNzaWJsZU5hbWV9fSwgU3dpdGNoIHRvIHt7dmFsdWVCQWNjZXNzaWJsZU5hbWV9fVwiXG4gIHZhbHVlQUFjY2Vzc2libGVOYW1lPzogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiB8IHN0cmluZyB8IG51bGw7XG4gIHZhbHVlQkFjY2Vzc2libGVOYW1lPzogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiB8IHN0cmluZyB8IG51bGw7XG5cbiAgLy8gaWYgdHJ1ZSwgdGhpcy5jZW50ZXIgd2lsbCBiZSBhdCB0aGUgY2VudGVyIG9mIHRoZSBUb2dnbGVTd2l0Y2hcbiAgY2VudGVyT25Td2l0Y2g/OiBib29sZWFuO1xufTtcblxuLy8gQWNjZXNzaWJsZSBuYW1lIGZvciB0aGUgQUJTd2l0Y2ggaXMgY3JlYXRlZCBieSBjb21iaW5pbmcgdGhlIGFjY2Vzc2libGUgbmFtZXMgb2YgdGhlIGxhYmVscy4gU2VlIG9wdGlvbnMuXG5leHBvcnQgdHlwZSBBQlN3aXRjaE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8VHJpbVBhcmFsbGVsRE9NT3B0aW9uczxIQm94T3B0aW9ucz4sICdhY2Nlc3NpYmxlTmFtZSc+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBQlN3aXRjaDxUPiBleHRlbmRzIEhCb3gge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgcHJvcGVydHk6IFByb3BlcnR5PFQ+O1xuICBwcml2YXRlIHJlYWRvbmx5IHZhbHVlQTogVDtcbiAgcHJpdmF0ZSByZWFkb25seSB2YWx1ZUI6IFQ7XG4gIHByaXZhdGUgcmVhZG9ubHkgbGFiZWxBOiBOb2RlO1xuICBwcml2YXRlIHJlYWRvbmx5IGxhYmVsQjogTm9kZTtcbiAgcHJpdmF0ZSByZWFkb25seSB0b2dnbGVTd2l0Y2g6IFRvZ2dsZVN3aXRjaDxUPjtcbiAgcHJpdmF0ZSByZWFkb25seSBzZXRMYWJlbEVuYWJsZWQ6ICggbGFiZWxOb2RlOiBOb2RlLCBlbmFibGVkOiBib29sZWFuICkgPT4gdm9pZDtcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlQUJTd2l0Y2g6ICgpID0+IHZvaWQ7XG5cbiAgLy8gRW1pdHMgb24gaW5wdXQgdGhhdCByZXN1bHRzIGluIGEgY2hhbmdlIHRvIHRoZSBQcm9wZXJ0eSB2YWx1ZSwgYWZ0ZXIgdGhlIFByb3BlcnR5IGhhcyBjaGFuZ2VkLlxuICBwdWJsaWMgcmVhZG9ubHkgb25JbnB1dEVtaXR0ZXI6IFRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcblxuICAvKipcbiAgICogQHBhcmFtIHByb3BlcnR5IC0gdmFsdWUgb2YgdGhlIGN1cnJlbnQgY2hvaWNlXG4gICAqIEBwYXJhbSB2YWx1ZUEgLSB2YWx1ZSBmb3IgY2hvaWNlICdBJ1xuICAgKiBAcGFyYW0gbGFiZWxBIC0gbGFiZWwgZm9yIGNob2ljZSAnQSdcbiAgICogQHBhcmFtIHZhbHVlQiAtIHZhbHVlIGZvciBjaG9pY2UgJ0InXG4gICAqIEBwYXJhbSBsYWJlbEIgLSBsYWJlbCBmb3IgY2hvaWNlICdCJ1xuICAgKiBAcGFyYW0gcHJvdmlkZWRPcHRpb25zXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3BlcnR5OiBQcm9wZXJ0eTxUPiwgdmFsdWVBOiBULCBsYWJlbEE6IE5vZGUsIHZhbHVlQjogVCwgbGFiZWxCOiBOb2RlLCBwcm92aWRlZE9wdGlvbnM/OiBBQlN3aXRjaE9wdGlvbnMgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcHJvcGVydHkudmFsdWVDb21wYXJpc29uU3RyYXRlZ3kgPT09ICdyZWZlcmVuY2UnLFxuICAgICAgJ0FCU3dpdGNoIGRlcGVuZHMgb24gXCI9PT1cIiBlcXVhbGl0eSBmb3IgdmFsdWUgY29tcGFyaXNvbicgKTtcblxuICAgIC8vIFBoRVQtaU8gcmVxdWlyZW1lbnRzXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbGFiZWxBLnRhbmRlbSwgJ2xhYmVsQSBtdXN0IGhhdmUgYSB0YW5kZW0nICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbGFiZWxCLnRhbmRlbSwgJ2xhYmVsQiBtdXN0IGhhdmUgYSB0YW5kZW0nICk7XG5cbiAgICAvLyBkZWZhdWx0IG9wdGlvbiB2YWx1ZXNcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEFCU3dpdGNoT3B0aW9ucywgU2VsZk9wdGlvbnMsIEhCb3hPcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIFNlbGZPcHRpb25zXG4gICAgICB0b2dnbGVTd2l0Y2hPcHRpb25zOiB7XG4gICAgICAgIGVuYWJsZWRQcm9wZXJ0eU9wdGlvbnM6IHtcbiAgICAgICAgICBwaGV0aW9GZWF0dXJlZDogZmFsc2UgLy8gQUJTd2l0Y2ggaGFzIGFuIGVuYWJsZWRQcm9wZXJ0eSB0aGF0IGlzIHByZWZlcnJlZCB0byB0aGUgc3ViLWNvbXBvbmVudCdzXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBzZXRMYWJlbEVuYWJsZWQ6IERFRkFVTFRfU0VUX0xBQkVMX0VOQUJMRUQsXG4gICAgICBjZW50ZXJPblN3aXRjaDogZmFsc2UsXG4gICAgICB2YWx1ZUFBY2Nlc3NpYmxlTmFtZTogbnVsbCxcbiAgICAgIHZhbHVlQkFjY2Vzc2libGVOYW1lOiBudWxsLFxuXG4gICAgICAvLyBIQm94T3B0aW9uc1xuICAgICAgY3Vyc29yOiAncG9pbnRlcicsXG4gICAgICBkaXNhYmxlZE9wYWNpdHk6IFNjZW5lcnlDb25zdGFudHMuRElTQUJMRURfT1BBQ0lUWSxcbiAgICAgIHNwYWNpbmc6IDgsXG5cbiAgICAgIC8vIHBoZXQtaW9cbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELFxuICAgICAgdGFuZGVtTmFtZVN1ZmZpeDogJ1N3aXRjaCcsXG4gICAgICB2aXNpYmxlUHJvcGVydHlPcHRpb25zOiB7IHBoZXRpb0ZlYXR1cmVkOiB0cnVlIH0sXG4gICAgICBwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQ6IHRydWUgLy8gb3B0IGludG8gZGVmYXVsdCBQaEVULWlPIGluc3RydW1lbnRlZCBlbmFibGVkUHJvcGVydHlcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGNvbnN0IHRvZ2dsZVN3aXRjaCA9IG5ldyBUb2dnbGVTd2l0Y2g8VD4oIHByb3BlcnR5LCB2YWx1ZUEsIHZhbHVlQixcbiAgICAgIGNvbWJpbmVPcHRpb25zPFRvZ2dsZVN3aXRjaE9wdGlvbnM+KCB7XG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndG9nZ2xlU3dpdGNoJyApLFxuXG4gICAgICAgIC8vIEFyaWEgc3dpdGNoIGF0dHJpYnV0ZXMgZG8gbm90IGFjY3VyYXRlbHkgZGVzY3JpYmUgc3dpdGNoZXMgd2l0aCBtb3JlIHRoYW4gYSBiaW5hcnkgc3RhdGUuXG4gICAgICAgIC8vIEluc3RlYWQsIGN1c3RvbSBhY2Nlc3NpYmxlIG5hbWVzIGFyZSB1c2VkIHRvIGRlc2NyaWJlIHRoZSBzd2l0Y2ggc3RhdGUuXG4gICAgICAgIGFjY2Vzc2libGVTd2l0Y2g6IGZhbHNlXG4gICAgICB9LCBvcHRpb25zLnRvZ2dsZVN3aXRjaE9wdGlvbnMgKSApO1xuXG4gICAgbGV0IG5vZGVBID0gbGFiZWxBO1xuICAgIGxldCBub2RlQiA9IGxhYmVsQjtcbiAgICBpZiAoIG9wdGlvbnMuY2VudGVyT25Td2l0Y2ggKSB7XG5cbiAgICAgIC8vIE1ha2UgYm90aCBsYWJlbHMgaGF2ZSB0aGUgc2FtZSBlZmZlY3RpdmUgc2l6ZSwgc28gdGhhdCB0aGlzLmNlbnRlciBpcyBhdCB0aGUgY2VudGVyIG9mIHRvZ2dsZVN3aXRjaC5cbiAgICAgIGNvbnN0IGFsaWduR3JvdXAgPSBuZXcgQWxpZ25Hcm91cCgpO1xuICAgICAgbm9kZUEgPSBuZXcgQWxpZ25Cb3goIGxhYmVsQSwge1xuICAgICAgICBncm91cDogYWxpZ25Hcm91cCxcbiAgICAgICAgeEFsaWduOiAncmlnaHQnXG4gICAgICB9ICk7XG4gICAgICBub2RlQiA9IG5ldyBBbGlnbkJveCggbGFiZWxCLCB7XG4gICAgICAgIGdyb3VwOiBhbGlnbkdyb3VwLFxuICAgICAgICB4QWxpZ246ICdsZWZ0J1xuICAgICAgfSApO1xuICAgIH1cblxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIG5vZGVBLCB0b2dnbGVTd2l0Y2gsIG5vZGVCIF07XG5cbiAgICBzdXBlciggb3B0aW9ucyApO1xuXG4gICAgdGhpcy5wcm9wZXJ0eSA9IHByb3BlcnR5O1xuICAgIHRoaXMudmFsdWVBID0gdmFsdWVBO1xuICAgIHRoaXMudmFsdWVCID0gdmFsdWVCO1xuICAgIHRoaXMubGFiZWxBID0gbGFiZWxBO1xuICAgIHRoaXMubGFiZWxCID0gbGFiZWxCO1xuICAgIHRoaXMudG9nZ2xlU3dpdGNoID0gdG9nZ2xlU3dpdGNoO1xuICAgIHRoaXMuc2V0TGFiZWxFbmFibGVkID0gb3B0aW9ucy5zZXRMYWJlbEVuYWJsZWQ7XG5cbiAgICAvLyBwZG9tIC0gU2V0dGluZyBoZWxwVGV4dCBvbiBBQlN3aXRjaCBmb3J3YXJkcyB0aGUgdmFsdWVzIHRvIHRoZSBhY3R1YWwgVG9nZ2xlU3dpdGNoLlxuICAgIFBhcmFsbGVsRE9NLmZvcndhcmRIZWxwVGV4dCggdGhpcywgdG9nZ2xlU3dpdGNoICk7XG5cbiAgICAvLyBGaW5kIGFjY2Vzc2libGUgbmFtZXMgZnJvbSB0aGUgbGFiZWxzIGlmIG9wdGlvbmFsIHZhbHVlcyB3ZXJlIG5vdCBwcm92aWRlZC5cbiAgICBjb25zdCB2YWx1ZUFBY2Nlc3NpYmxlTmFtZSA9IG9wdGlvbnMudmFsdWVBQWNjZXNzaWJsZU5hbWUgfHwgUERPTVV0aWxzLmZpbmRTdHJpbmdQcm9wZXJ0eSggbGFiZWxBICk7XG4gICAgY29uc3QgdmFsdWVCQWNjZXNzaWJsZU5hbWUgPSBvcHRpb25zLnZhbHVlQkFjY2Vzc2libGVOYW1lIHx8IFBET01VdGlscy5maW5kU3RyaW5nUHJvcGVydHkoIGxhYmVsQiApO1xuXG4gICAgLy8gUGF0dGVyblN0cmluZ1Byb3BlcnRpZXMgZm9yIGVhY2ggc3dpdGNoIHZhbHVlIHNvIHRoYXQgdGhlIGFjY2Vzc2libGUgbmFtZSB3aWxsIGFsc28gY2hhbmdlIHdoZW4gY2hhbmdpbmcgbG9jYWxlcy5cbiAgICBjb25zdCB2YWx1ZUFTZWxlY3RlZEFjY2Vzc2libGVOYW1lU3RyaW5nUHJvcGVydHkgPSBuZXcgUGF0dGVyblN0cmluZ1Byb3BlcnR5KCBTdW5TdHJpbmdzLmExMXkuYUJTd2l0Y2guYWNjZXNzaWJsZU5hbWVQYXR0ZXJuU3RyaW5nUHJvcGVydHksIHtcbiAgICAgIHNlbGVjdGVkVmFsdWU6IHZhbHVlQUFjY2Vzc2libGVOYW1lLFxuICAgICAgb3RoZXJWYWx1ZTogdmFsdWVCQWNjZXNzaWJsZU5hbWVcbiAgICB9ICk7XG4gICAgY29uc3QgdmFsdWVCU2VsZWN0ZWRBY2Nlc3NpYmxlTmFtZVN0cmluZ1Byb3BlcnR5ID0gbmV3IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSggU3VuU3RyaW5ncy5hMTF5LmFCU3dpdGNoLmFjY2Vzc2libGVOYW1lUGF0dGVyblN0cmluZ1Byb3BlcnR5LCB7XG4gICAgICBzZWxlY3RlZFZhbHVlOiB2YWx1ZUJBY2Nlc3NpYmxlTmFtZSxcbiAgICAgIG90aGVyVmFsdWU6IHZhbHVlQUFjY2Vzc2libGVOYW1lXG4gICAgfSApO1xuXG4gICAgY29uc3QgcHJvcGVydHlMaXN0ZW5lciA9ICggdmFsdWU6IFQgKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZUxhYmVsc0VuYWJsZWQoKTtcbiAgICAgIHRvZ2dsZVN3aXRjaC5hY2Nlc3NpYmxlTmFtZSA9IHZhbHVlID09PSB2YWx1ZUEgPyB2YWx1ZUFTZWxlY3RlZEFjY2Vzc2libGVOYW1lU3RyaW5nUHJvcGVydHkgOiB2YWx1ZUJTZWxlY3RlZEFjY2Vzc2libGVOYW1lU3RyaW5nUHJvcGVydHk7XG4gICAgfTtcbiAgICBwcm9wZXJ0eS5saW5rKCBwcm9wZXJ0eUxpc3RlbmVyICk7IC8vIHVubGluayBvbiBkaXNwb3NlXG5cbiAgICAvLyBjbGljayBvbiBsYWJlbHMgdG8gc2VsZWN0XG4gICAgY29uc3QgcHJlc3NMaXN0ZW5lckEgPSBuZXcgUHJlc3NMaXN0ZW5lcigge1xuICAgICAgcmVsZWFzZTogKCkgPT4ge1xuICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IHByb3BlcnR5LnZhbHVlO1xuICAgICAgICBwcm9wZXJ0eS52YWx1ZSA9IHZhbHVlQTtcbiAgICAgICAgaWYgKCBvbGRWYWx1ZSAhPT0gdmFsdWVBICkge1xuICAgICAgICAgIHRoaXMub25JbnB1dEVtaXR0ZXIuZW1pdCgpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdGFuZGVtOiBsYWJlbEEudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ByZXNzTGlzdGVuZXInIClcbiAgICB9ICk7XG4gICAgbGFiZWxBLmFkZElucHV0TGlzdGVuZXIoIHByZXNzTGlzdGVuZXJBICk7IC8vIHJlbW92ZUlucHV0TGlzdGVuZXIgb24gZGlzcG9zZVxuXG4gICAgY29uc3QgcHJlc3NMaXN0ZW5lckIgPSBuZXcgUHJlc3NMaXN0ZW5lcigge1xuICAgICAgcmVsZWFzZTogKCkgPT4ge1xuICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IHByb3BlcnR5LnZhbHVlO1xuICAgICAgICBwcm9wZXJ0eS52YWx1ZSA9IHZhbHVlQjtcbiAgICAgICAgaWYgKCBvbGRWYWx1ZSAhPT0gdmFsdWVCICkge1xuICAgICAgICAgIHRoaXMub25JbnB1dEVtaXR0ZXIuZW1pdCgpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdGFuZGVtOiBsYWJlbEIudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ByZXNzTGlzdGVuZXInIClcbiAgICB9ICk7XG4gICAgbGFiZWxCLmFkZElucHV0TGlzdGVuZXIoIHByZXNzTGlzdGVuZXJCICk7IC8vIHJlbW92ZUlucHV0TGlzdGVuZXIgb24gZGlzcG9zZVxuXG4gICAgLy8gVGhlIHRvZ2dsZVN3aXRjaCBpbnB1dCB0cmlnZ2VycyBBQlN3aXRjaCBpbnB1dC5cbiAgICB0b2dnbGVTd2l0Y2gub25JbnB1dEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHRoaXMub25JbnB1dEVtaXR0ZXIuZW1pdCgpICk7XG5cbiAgICAvLyBXaXJlIHVwIHNvdW5kIG9uIGlucHV0XG4gICAgdGhpcy5vbklucHV0RW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xuICAgICAgaWYgKCBwcm9wZXJ0eS52YWx1ZSA9PT0gdmFsdWVCICkge1xuICAgICAgICB0b2dnbGVTd2l0Y2guc3dpdGNoVG9SaWdodFNvdW5kUGxheWVyLnBsYXkoKTtcbiAgICAgIH1cbiAgICAgIGlmICggcHJvcGVydHkudmFsdWUgPT09IHZhbHVlQSApIHtcbiAgICAgICAgdG9nZ2xlU3dpdGNoLnN3aXRjaFRvTGVmdFNvdW5kUGxheWVyLnBsYXkoKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VBQlN3aXRjaCA9ICgpID0+IHtcbiAgICAgIHByb3BlcnR5LnVubGluayggcHJvcGVydHlMaXN0ZW5lciApO1xuICAgICAgdG9nZ2xlU3dpdGNoLmRpc3Bvc2UoKTtcbiAgICAgIHZhbHVlQVNlbGVjdGVkQWNjZXNzaWJsZU5hbWVTdHJpbmdQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgICB2YWx1ZUJTZWxlY3RlZEFjY2Vzc2libGVOYW1lU3RyaW5nUHJvcGVydHkuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5vbklucHV0RW1pdHRlci5kaXNwb3NlKCk7XG4gICAgICBsYWJlbEEucmVtb3ZlSW5wdXRMaXN0ZW5lciggcHJlc3NMaXN0ZW5lckEgKTtcbiAgICAgIGxhYmVsQi5yZW1vdmVJbnB1dExpc3RlbmVyKCBwcmVzc0xpc3RlbmVyQiApO1xuICAgICAgcHJlc3NMaXN0ZW5lckEuZGlzcG9zZSgpO1xuICAgICAgcHJlc3NMaXN0ZW5lckIuZGlzcG9zZSgpO1xuICAgIH07XG5cbiAgICAvLyBzdXBwb3J0IGZvciBiaW5kZXIgZG9jdW1lbnRhdGlvbiwgc3RyaXBwZWQgb3V0IGluIGJ1aWxkcyBhbmQgb25seSBydW5zIHdoZW4gP2JpbmRlciBpcyBzcGVjaWZpZWRcbiAgICBhc3NlcnQgJiYgd2luZG93LnBoZXQ/LmNoaXBwZXI/LnF1ZXJ5UGFyYW1ldGVycz8uYmluZGVyICYmIEluc3RhbmNlUmVnaXN0cnkucmVnaXN0ZXJEYXRhVVJMKCAnc3VuJywgJ0FCU3dpdGNoJywgdGhpcyApO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlQUJTd2l0Y2goKTtcbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBQcm92aWRlIGEgY3VzdG9tIGxvb2sgZm9yIHdoZW4gdGhpcyBzd2l0Y2ggaXMgZGlzYWJsZWQuIFdlIGFyZSBvdmVycmlkaW5nIHRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIHNvIHRoYXRcbiAgICogdGhlIHVuc2VsZWN0ZWQgbGFiZWwgZG9lcyBub3QgYXBwZWFyIHRvIGJlIGRvdWJseSBkaXNhYmxlZCB3aGVuIHRoZSBBQlN3aXRjaCBpcyBkaXNhYmxlZC5cbiAgICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzg1M1xuICAgKi9cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIG9uRW5hYmxlZFByb3BlcnR5Q2hhbmdlKCBlbmFibGVkOiBib29sZWFuICk6IHZvaWQge1xuICAgICFlbmFibGVkICYmIHRoaXMuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7XG4gICAgdGhpcy5pbnB1dEVuYWJsZWQgPSBlbmFibGVkO1xuICAgIHRoaXMudG9nZ2xlU3dpdGNoLmVuYWJsZWQgPSBlbmFibGVkO1xuICAgIHRoaXMudXBkYXRlTGFiZWxzRW5hYmxlZCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGVuYWJsZWQgc3RhdGUgb2YgdGhlIGxhYmVscyBiYXNlZCBvbiB0aGUgY3VycmVudCB2YWx1ZSBvZiB0aGUgYXNzb2NpYXRlZCBQcm9wZXJ0eS5cbiAgICogVGhlIHNlbGVjdGVkIGxhYmVsIHdpbGwgYXBwZWFyIHRvIGJlIGVuYWJsZWQsIHdoaWxlIHRoZSB1bnNlbGVjdGVkIGxhYmVsIHdpbGwgYXBwZWFyIHRvIGJlIGRpc2FibGVkLlxuICAgKiBJZiB0aGUgQUJTd2l0Y2ggaXRzZWxmIGlzIGRpc2FibGVkLCBib3RoIGxhYmVscyB3aWxsIGFwcGVhciB0byBiZSBkaXNhYmxlZC5cbiAgICovXG4gIHByaXZhdGUgdXBkYXRlTGFiZWxzRW5hYmxlZCgpOiB2b2lkIHtcbiAgICB0aGlzLnNldExhYmVsRW5hYmxlZCggdGhpcy5sYWJlbEEsIHRoaXMuZW5hYmxlZCAmJiB0aGlzLnByb3BlcnR5LnZhbHVlID09PSB0aGlzLnZhbHVlQSApO1xuICAgIHRoaXMuc2V0TGFiZWxFbmFibGVkKCB0aGlzLmxhYmVsQiwgdGhpcy5lbmFibGVkICYmIHRoaXMucHJvcGVydHkudmFsdWUgPT09IHRoaXMudmFsdWVCICk7XG4gIH1cbn1cblxuc3VuLnJlZ2lzdGVyKCAnQUJTd2l0Y2gnLCBBQlN3aXRjaCApOyJdLCJuYW1lcyI6WyJFbWl0dGVyIiwiUGF0dGVyblN0cmluZ1Byb3BlcnR5IiwiSW5zdGFuY2VSZWdpc3RyeSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiQWxpZ25Cb3giLCJBbGlnbkdyb3VwIiwiSEJveCIsIlBhcmFsbGVsRE9NIiwiUERPTVV0aWxzIiwiUHJlc3NMaXN0ZW5lciIsIlNjZW5lcnlDb25zdGFudHMiLCJUYW5kZW0iLCJzdW4iLCJTdW5TdHJpbmdzIiwiVG9nZ2xlU3dpdGNoIiwiREVGQVVMVF9TRVRfTEFCRUxfRU5BQkxFRCIsImxhYmVsIiwiZW5hYmxlZCIsIm9wYWNpdHkiLCJESVNBQkxFRF9PUEFDSVRZIiwiQUJTd2l0Y2giLCJkaXNwb3NlIiwiZGlzcG9zZUFCU3dpdGNoIiwib25FbmFibGVkUHJvcGVydHlDaGFuZ2UiLCJpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQiLCJpbnB1dEVuYWJsZWQiLCJ0b2dnbGVTd2l0Y2giLCJ1cGRhdGVMYWJlbHNFbmFibGVkIiwic2V0TGFiZWxFbmFibGVkIiwibGFiZWxBIiwicHJvcGVydHkiLCJ2YWx1ZSIsInZhbHVlQSIsImxhYmVsQiIsInZhbHVlQiIsInByb3ZpZGVkT3B0aW9ucyIsIndpbmRvdyIsImFzc2VydCIsInZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5IiwidGFuZGVtIiwib3B0aW9ucyIsInRvZ2dsZVN3aXRjaE9wdGlvbnMiLCJlbmFibGVkUHJvcGVydHlPcHRpb25zIiwicGhldGlvRmVhdHVyZWQiLCJjZW50ZXJPblN3aXRjaCIsInZhbHVlQUFjY2Vzc2libGVOYW1lIiwidmFsdWVCQWNjZXNzaWJsZU5hbWUiLCJjdXJzb3IiLCJkaXNhYmxlZE9wYWNpdHkiLCJzcGFjaW5nIiwiUkVRVUlSRUQiLCJ0YW5kZW1OYW1lU3VmZml4IiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsInBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCIsImNyZWF0ZVRhbmRlbSIsImFjY2Vzc2libGVTd2l0Y2giLCJub2RlQSIsIm5vZGVCIiwiYWxpZ25Hcm91cCIsImdyb3VwIiwieEFsaWduIiwiY2hpbGRyZW4iLCJvbklucHV0RW1pdHRlciIsImZvcndhcmRIZWxwVGV4dCIsImZpbmRTdHJpbmdQcm9wZXJ0eSIsInZhbHVlQVNlbGVjdGVkQWNjZXNzaWJsZU5hbWVTdHJpbmdQcm9wZXJ0eSIsImExMXkiLCJhQlN3aXRjaCIsImFjY2Vzc2libGVOYW1lUGF0dGVyblN0cmluZ1Byb3BlcnR5Iiwic2VsZWN0ZWRWYWx1ZSIsIm90aGVyVmFsdWUiLCJ2YWx1ZUJTZWxlY3RlZEFjY2Vzc2libGVOYW1lU3RyaW5nUHJvcGVydHkiLCJwcm9wZXJ0eUxpc3RlbmVyIiwiYWNjZXNzaWJsZU5hbWUiLCJsaW5rIiwicHJlc3NMaXN0ZW5lckEiLCJyZWxlYXNlIiwib2xkVmFsdWUiLCJlbWl0IiwiYWRkSW5wdXRMaXN0ZW5lciIsInByZXNzTGlzdGVuZXJCIiwiYWRkTGlzdGVuZXIiLCJzd2l0Y2hUb1JpZ2h0U291bmRQbGF5ZXIiLCJwbGF5Iiwic3dpdGNoVG9MZWZ0U291bmRQbGF5ZXIiLCJ1bmxpbmsiLCJyZW1vdmVJbnB1dExpc3RlbmVyIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJiaW5kZXIiLCJyZWdpc3RlckRhdGFVUkwiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Q0FNQyxHQUVELE9BQU9BLGFBQWEsMkJBQTJCO0FBQy9DLE9BQU9DLDJCQUEyQix5Q0FBeUM7QUFJM0UsT0FBT0Msc0JBQXNCLHVEQUF1RDtBQUNwRixPQUFPQyxhQUFhQyxjQUFjLFFBQVEsa0NBQWtDO0FBRTVFLFNBQVNDLFFBQVEsRUFBRUMsVUFBVSxFQUFFQyxJQUFJLEVBQXFCQyxXQUFXLEVBQUVDLFNBQVMsRUFBRUMsYUFBYSxFQUFFQyxnQkFBZ0IsUUFBZ0MsOEJBQThCO0FBQzdLLE9BQU9DLFlBQVksNEJBQTRCO0FBQy9DLE9BQU9DLFNBQVMsV0FBVztBQUMzQixPQUFPQyxnQkFBZ0Isa0JBQWtCO0FBQ3pDLE9BQU9DLGtCQUEyQyxvQkFBb0I7QUFFdEUsWUFBWTtBQUVaLGdHQUFnRztBQUNoRyxNQUFNQyw0QkFBNEIsQ0FBRUMsT0FBYUM7SUFDL0NELE1BQU1FLE9BQU8sR0FBR0QsVUFBVSxNQUFNUCxpQkFBaUJTLGdCQUFnQjtBQUNuRTtBQXdCZSxJQUFBLEFBQU1DLFdBQU4sTUFBTUEsaUJBQW9CZDtJQTBLdkJlLFVBQWdCO1FBQzlCLElBQUksQ0FBQ0MsZUFBZTtRQUNwQixLQUFLLENBQUNEO0lBQ1I7SUFHQTs7OztHQUlDLEdBQ0QsQUFBbUJFLHdCQUF5Qk4sT0FBZ0IsRUFBUztRQUNuRSxDQUFDQSxXQUFXLElBQUksQ0FBQ08scUJBQXFCO1FBQ3RD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