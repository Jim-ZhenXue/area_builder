// Copyright 2019-2024, University of Colorado Boulder
/**
 * A type of spinner UI component that supports 'fine' and 'coarse' changes to a numeric value.
 *
 *   <  <<  [ value ]  >>  >
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Multilink from '../../axon/js/Multilink.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { HBox, KeyboardUtils, Node } from '../../scenery/js/imports.js';
import AccessibleNumberSpinner from '../../sun/js/accessibility/AccessibleNumberSpinner.js';
import ArrowButton from '../../sun/js/buttons/ArrowButton.js';
import sharedSoundPlayers from '../../tambo/js/sharedSoundPlayers.js';
import Tandem from '../../tandem/js/Tandem.js';
import NumberDisplay from './NumberDisplay.js';
import sceneryPhet from './sceneryPhet.js';
let FineCoarseSpinner = class FineCoarseSpinner extends AccessibleNumberSpinner(Node, 0) {
    dispose() {
        this.disposeFineCoarseSpinner();
        super.dispose();
    }
    constructor(numberProperty, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        const options = optionize()({
            // SelfOptions
            deltaFine: 1,
            deltaCoarse: 10,
            spacing: 10,
            arrowsSoundPlayer: sharedSoundPlayers.get('pushButton'),
            // AccessibleNumberSpinnerOptions
            valueProperty: numberProperty,
            enabledRangeProperty: numberProperty.rangeProperty,
            // As with NumberSpinner...
            // The focus highlight surrounds the entire component, but the spinner display is not interactive with
            // mouse and touch events so this highlight is hidden. Instead, default highlights surround the arrow buttons.
            interactiveHighlight: 'invisible',
            // Instead of changing the value with keyboard step options, the arrow buttons are synthetically
            // pressed in response to keyboard input so that the buttons look pressed.
            keyboardStep: 0,
            shiftKeyboardStep: 0,
            pageKeyboardStep: 0,
            // NodeOptions
            disabledOpacity: 0.5,
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'Spinner',
            phetioFeatured: true,
            phetioEnabledPropertyInstrumented: true
        }, providedOptions);
        assert && assert(options.deltaFine > 0, `invalid deltaFine: ${options.deltaFine}`);
        assert && assert(options.deltaCoarse > 0, `invalid deltaCoarse: ${options.deltaCoarse}`);
        // options for the 'fine' arrow buttons, which show 1 arrow
        const fineButtonOptions = combineOptions({
            focusable: false,
            numberOfArrows: 1,
            arrowWidth: 12,
            arrowHeight: 14,
            soundPlayer: options.arrowsSoundPlayer,
            // pointer areas
            touchAreaXDilation: 3,
            touchAreaYDilation: 3,
            mouseAreaXDilation: 0,
            mouseAreaYDilation: 0,
            // phet-io, as requested in https://github.com/phetsims/sun/issues/575
            enabledPropertyOptions: {
                phetioReadOnly: true,
                phetioFeatured: false
            }
        }, options.arrowButtonOptions);
        assert && assert(fineButtonOptions.arrowHeight !== undefined);
        const fineButtonArrowHeight = fineButtonOptions.arrowHeight;
        // options for the 'coarse' arrow buttons, which show 2 arrows
        const coarseButtonOptions = combineOptions({}, fineButtonOptions, {
            focusable: false,
            numberOfArrows: 2,
            arrowSpacing: -0.5 * fineButtonArrowHeight,
            soundPlayer: options.arrowsSoundPlayer,
            // phet-io, as requested in https://github.com/phetsims/sun/issues/575
            enabledPropertyOptions: {
                phetioReadOnly: true,
                phetioFeatured: false
            }
        });
        // <
        const decrementFineButton = new ArrowButton('left', ()=>{
            numberProperty.value = numberProperty.value - options.deltaFine;
        }, combineOptions({}, fineButtonOptions, {
            tandem: options.tandem.createTandem('decrementFineButton')
        }));
        // <<
        const decrementCoarseButton = new ArrowButton('left', ()=>{
            const delta = Math.min(options.deltaCoarse, numberProperty.value - numberProperty.range.min);
            numberProperty.value = numberProperty.value - delta;
        }, combineOptions({}, coarseButtonOptions, {
            tandem: options.tandem.createTandem('decrementCoarseButton')
        }));
        // [ value ]
        const numberDisplay = new NumberDisplay(numberProperty, numberProperty.range, combineOptions({
            tandem: options.tandem.createTandem('numberDisplay')
        }, options.numberDisplayOptions));
        // >
        const incrementFineButton = new ArrowButton('right', ()=>{
            numberProperty.value = numberProperty.value + options.deltaFine;
        }, combineOptions({}, fineButtonOptions, {
            tandem: options.tandem.createTandem('incrementFineButton')
        }));
        // >>
        const incrementCoarseButton = new ArrowButton('right', ()=>{
            const delta = Math.min(options.deltaCoarse, numberProperty.range.max - numberProperty.value);
            numberProperty.value = numberProperty.value + delta;
        }, combineOptions({}, coarseButtonOptions, {
            tandem: options.tandem.createTandem('incrementCoarseButton')
        }));
        // <  <<  [ value ]  >>  >
        const hBox = new HBox({
            spacing: options.spacing,
            children: [
                decrementFineButton,
                decrementCoarseButton,
                numberDisplay,
                incrementCoarseButton,
                incrementFineButton
            ]
        });
        // Wrap in Node to hide HBox API.
        options.children = [
            hBox
        ];
        // Sounds are played when a button is pressed. But for 'home' and 'end' keys, the button is not pressed, so the
        // sound is played manually.
        options.onInput = (event, oldValue)=>{
            if (event.isFromPDOM()) {
                const domEvent = event.domEvent;
                // The sound should not play if the value is already at the home or end value.
                const currentValue = numberProperty.value;
                if (KeyboardUtils.isKeyEvent(domEvent, KeyboardUtils.KEY_HOME) && oldValue !== currentValue) {
                    options.arrowsSoundPlayer.play();
                } else if (KeyboardUtils.isKeyEvent(domEvent, KeyboardUtils.KEY_END) && oldValue !== currentValue) {
                    options.arrowsSoundPlayer.play();
                }
            }
        };
        super(options);
        // Disable the buttons when the value is at min or max of the range
        const buttonsEnabledListener = (value, range)=>{
            // left buttons
            decrementFineButton.enabled = decrementCoarseButton.enabled = value !== range.min;
            // right buttons
            incrementFineButton.enabled = incrementCoarseButton.enabled = value !== range.max;
        };
        const rangeAndNumberPropertyMultilink = Multilink.multilink([
            numberProperty,
            numberProperty.rangeProperty
        ], buttonsEnabledListener);
        // pdom - manually click arrow buttons from alt input events so that the buttons look pressed while the key is down
        const increasedListener = (isDown)=>{
            if (isDown) {
                this.shiftKeyDown ? incrementFineButton.pdomClick() : incrementCoarseButton.pdomClick();
            }
        };
        const decreasedListener = (isDown)=>{
            if (isDown) {
                this.shiftKeyDown ? decrementFineButton.pdomClick() : decrementCoarseButton.pdomClick();
            }
        };
        this.pdomIncrementDownEmitter.addListener(increasedListener);
        this.pdomDecrementDownEmitter.addListener(decreasedListener);
        this.disposeFineCoarseSpinner = ()=>{
            rangeAndNumberPropertyMultilink.dispose();
            // unregister tandems
            numberDisplay.dispose();
            decrementFineButton.dispose();
            decrementCoarseButton.dispose();
            incrementFineButton.dispose();
            incrementCoarseButton.dispose();
        };
        // Create a link to associated Property, so it's easier to find in Studio.
        this.addLinkedElement(numberProperty, {
            tandemName: 'property'
        });
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'FineCoarseSpinner', this);
    }
};
export { FineCoarseSpinner as default };
sceneryPhet.register('FineCoarseSpinner', FineCoarseSpinner);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9GaW5lQ29hcnNlU3Bpbm5lci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIHR5cGUgb2Ygc3Bpbm5lciBVSSBjb21wb25lbnQgdGhhdCBzdXBwb3J0cyAnZmluZScgYW5kICdjb2Fyc2UnIGNoYW5nZXMgdG8gYSBudW1lcmljIHZhbHVlLlxuICpcbiAqICAgPCAgPDwgIFsgdmFsdWUgXSAgPj4gID5cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgSW5zdGFuY2VSZWdpc3RyeSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvZG9jdW1lbnRhdGlvbi9JbnN0YW5jZVJlZ2lzdHJ5LmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCB7IEhCb3gsIEtleWJvYXJkVXRpbHMsIE5vZGUsIE5vZGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBBY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lciwgeyBBY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lck9wdGlvbnMgfSBmcm9tICcuLi8uLi9zdW4vanMvYWNjZXNzaWJpbGl0eS9BY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lci5qcyc7XG5pbXBvcnQgQXJyb3dCdXR0b24sIHsgQXJyb3dCdXR0b25PcHRpb25zIH0gZnJvbSAnLi4vLi4vc3VuL2pzL2J1dHRvbnMvQXJyb3dCdXR0b24uanMnO1xuaW1wb3J0IHNoYXJlZFNvdW5kUGxheWVycyBmcm9tICcuLi8uLi90YW1iby9qcy9zaGFyZWRTb3VuZFBsYXllcnMuanMnO1xuaW1wb3J0IFRTb3VuZFBsYXllciBmcm9tICcuLi8uLi90YW1iby9qcy9UU291bmRQbGF5ZXIuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBOdW1iZXJEaXNwbGF5LCB7IE51bWJlckRpc3BsYXlPcHRpb25zIH0gZnJvbSAnLi9OdW1iZXJEaXNwbGF5LmpzJztcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcbiAgZGVsdGFGaW5lPzogbnVtYmVyOyAvLyBhbW91bnQgdG8gaW5jcmVtZW50L2RlY3JlbWVudCB3aGVuIHRoZSAnZmluZScgdHdlYWtlcnMgYXJlIHByZXNzZWRcbiAgZGVsdGFDb2Fyc2U/OiBudW1iZXI7IC8vIGFtb3VudCB0byBpbmNyZW1lbnQvZGVjcmVtZW50IHdoZW4gdGhlICdjb2Fyc2UnIHR3ZWFrZXJzIGFyZSBwcmVzc2VkXG4gIHNwYWNpbmc/OiBudW1iZXI7IC8vIGhvcml6b250YWwgc3BhY2UgYmV0d2VlbiBzdWJjb21wb25lbnRzXG4gIGFycm93c1NvdW5kUGxheWVyPzogVFNvdW5kUGxheWVyO1xuICBudW1iZXJEaXNwbGF5T3B0aW9ucz86IFN0cmljdE9taXQ8TnVtYmVyRGlzcGxheU9wdGlvbnMsICd0YW5kZW0nPjtcbiAgYXJyb3dCdXR0b25PcHRpb25zPzogU3RyaWN0T21pdDxBcnJvd0J1dHRvbk9wdGlvbnMsICdudW1iZXJPZkFycm93cycgfCAndGFuZGVtJyB8ICdmb2N1c2FibGUnIHwgJ3NvdW5kUGxheWVyJz47XG59O1xuXG50eXBlIFBhcmVudE9wdGlvbnMgPSBBY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lck9wdGlvbnMgJiBOb2RlT3B0aW9ucztcblxuZXhwb3J0IHR5cGUgRmluZUNvYXJzZVNwaW5uZXJPcHRpb25zID1cbiAgU2VsZk9wdGlvbnNcbiAgJiBTdHJpY3RPbWl0PFBhcmVudE9wdGlvbnMsICdjaGlsZHJlbicgfCAndmFsdWVQcm9wZXJ0eScgfCAnZW5hYmxlZFJhbmdlUHJvcGVydHknIHwgJ2tleWJvYXJkU3RlcCcgfCAnc2hpZnRLZXlib2FyZFN0ZXAnIHwgJ3BhZ2VLZXlib2FyZFN0ZXAnIHwgJ29uSW5wdXQnPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmluZUNvYXJzZVNwaW5uZXIgZXh0ZW5kcyBBY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lciggTm9kZSwgMCApIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VGaW5lQ29hcnNlU3Bpbm5lcjogKCkgPT4gdm9pZDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIG51bWJlclByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eSwgcHJvdmlkZWRPcHRpb25zPzogRmluZUNvYXJzZVNwaW5uZXJPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxGaW5lQ29hcnNlU3Bpbm5lck9wdGlvbnMsXG4gICAgICBTdHJpY3RPbWl0PFNlbGZPcHRpb25zLCAnbnVtYmVyRGlzcGxheU9wdGlvbnMnIHwgJ2Fycm93QnV0dG9uT3B0aW9ucyc+LCBQYXJlbnRPcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIFNlbGZPcHRpb25zXG4gICAgICBkZWx0YUZpbmU6IDEsXG4gICAgICBkZWx0YUNvYXJzZTogMTAsXG4gICAgICBzcGFjaW5nOiAxMCxcbiAgICAgIGFycm93c1NvdW5kUGxheWVyOiBzaGFyZWRTb3VuZFBsYXllcnMuZ2V0KCAncHVzaEJ1dHRvbicgKSxcblxuICAgICAgLy8gQWNjZXNzaWJsZU51bWJlclNwaW5uZXJPcHRpb25zXG4gICAgICB2YWx1ZVByb3BlcnR5OiBudW1iZXJQcm9wZXJ0eSxcbiAgICAgIGVuYWJsZWRSYW5nZVByb3BlcnR5OiBudW1iZXJQcm9wZXJ0eS5yYW5nZVByb3BlcnR5LFxuXG4gICAgICAvLyBBcyB3aXRoIE51bWJlclNwaW5uZXIuLi5cbiAgICAgIC8vIFRoZSBmb2N1cyBoaWdobGlnaHQgc3Vycm91bmRzIHRoZSBlbnRpcmUgY29tcG9uZW50LCBidXQgdGhlIHNwaW5uZXIgZGlzcGxheSBpcyBub3QgaW50ZXJhY3RpdmUgd2l0aFxuICAgICAgLy8gbW91c2UgYW5kIHRvdWNoIGV2ZW50cyBzbyB0aGlzIGhpZ2hsaWdodCBpcyBoaWRkZW4uIEluc3RlYWQsIGRlZmF1bHQgaGlnaGxpZ2h0cyBzdXJyb3VuZCB0aGUgYXJyb3cgYnV0dG9ucy5cbiAgICAgIGludGVyYWN0aXZlSGlnaGxpZ2h0OiAnaW52aXNpYmxlJyxcblxuICAgICAgLy8gSW5zdGVhZCBvZiBjaGFuZ2luZyB0aGUgdmFsdWUgd2l0aCBrZXlib2FyZCBzdGVwIG9wdGlvbnMsIHRoZSBhcnJvdyBidXR0b25zIGFyZSBzeW50aGV0aWNhbGx5XG4gICAgICAvLyBwcmVzc2VkIGluIHJlc3BvbnNlIHRvIGtleWJvYXJkIGlucHV0IHNvIHRoYXQgdGhlIGJ1dHRvbnMgbG9vayBwcmVzc2VkLlxuICAgICAga2V5Ym9hcmRTdGVwOiAwLFxuICAgICAgc2hpZnRLZXlib2FyZFN0ZXA6IDAsXG4gICAgICBwYWdlS2V5Ym9hcmRTdGVwOiAwLFxuXG4gICAgICAvLyBOb2RlT3B0aW9uc1xuICAgICAgZGlzYWJsZWRPcGFjaXR5OiAwLjUsIC8vIHtudW1iZXJ9IG9wYWNpdHkgdXNlZCB0byBtYWtlIHRoZSBjb250cm9sIGxvb2sgZGlzYWJsZWRcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELFxuICAgICAgdGFuZGVtTmFtZVN1ZmZpeDogJ1NwaW5uZXInLFxuICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWUsXG4gICAgICBwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQ6IHRydWVcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuZGVsdGFGaW5lID4gMCwgYGludmFsaWQgZGVsdGFGaW5lOiAke29wdGlvbnMuZGVsdGFGaW5lfWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLmRlbHRhQ29hcnNlID4gMCwgYGludmFsaWQgZGVsdGFDb2Fyc2U6ICR7b3B0aW9ucy5kZWx0YUNvYXJzZX1gICk7XG5cbiAgICAvLyBvcHRpb25zIGZvciB0aGUgJ2ZpbmUnIGFycm93IGJ1dHRvbnMsIHdoaWNoIHNob3cgMSBhcnJvd1xuICAgIGNvbnN0IGZpbmVCdXR0b25PcHRpb25zOiBBcnJvd0J1dHRvbk9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxBcnJvd0J1dHRvbk9wdGlvbnM+KCB7XG4gICAgICBmb2N1c2FibGU6IGZhbHNlLFxuICAgICAgbnVtYmVyT2ZBcnJvd3M6IDEsXG4gICAgICBhcnJvd1dpZHRoOiAxMiwgLy8gd2lkdGggb2YgYmFzZVxuICAgICAgYXJyb3dIZWlnaHQ6IDE0LCAvLyBmcm9tIHRpcCB0byBiYXNlXG4gICAgICBzb3VuZFBsYXllcjogb3B0aW9ucy5hcnJvd3NTb3VuZFBsYXllcixcblxuICAgICAgLy8gcG9pbnRlciBhcmVhc1xuICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiAzLFxuICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiAzLFxuICAgICAgbW91c2VBcmVhWERpbGF0aW9uOiAwLFxuICAgICAgbW91c2VBcmVhWURpbGF0aW9uOiAwLFxuXG4gICAgICAvLyBwaGV0LWlvLCBhcyByZXF1ZXN0ZWQgaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvNTc1XG4gICAgICBlbmFibGVkUHJvcGVydHlPcHRpb25zOiB7XG4gICAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxuICAgICAgICBwaGV0aW9GZWF0dXJlZDogZmFsc2VcbiAgICAgIH1cbiAgICB9LCBvcHRpb25zLmFycm93QnV0dG9uT3B0aW9ucyApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmluZUJ1dHRvbk9wdGlvbnMuYXJyb3dIZWlnaHQgIT09IHVuZGVmaW5lZCApO1xuICAgIGNvbnN0IGZpbmVCdXR0b25BcnJvd0hlaWdodCA9IGZpbmVCdXR0b25PcHRpb25zLmFycm93SGVpZ2h0ITtcblxuICAgIC8vIG9wdGlvbnMgZm9yIHRoZSAnY29hcnNlJyBhcnJvdyBidXR0b25zLCB3aGljaCBzaG93IDIgYXJyb3dzXG4gICAgY29uc3QgY29hcnNlQnV0dG9uT3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPEFycm93QnV0dG9uT3B0aW9ucz4oIHt9LCBmaW5lQnV0dG9uT3B0aW9ucywge1xuICAgICAgZm9jdXNhYmxlOiBmYWxzZSxcbiAgICAgIG51bWJlck9mQXJyb3dzOiAyLFxuICAgICAgYXJyb3dTcGFjaW5nOiAtMC41ICogZmluZUJ1dHRvbkFycm93SGVpZ2h0LCAvLyBhcnJvd3Mgb3ZlcmxhcFxuICAgICAgc291bmRQbGF5ZXI6IG9wdGlvbnMuYXJyb3dzU291bmRQbGF5ZXIsXG5cbiAgICAgIC8vIHBoZXQtaW8sIGFzIHJlcXVlc3RlZCBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy81NzVcbiAgICAgIGVuYWJsZWRQcm9wZXJ0eU9wdGlvbnM6IHtcbiAgICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXG4gICAgICAgIHBoZXRpb0ZlYXR1cmVkOiBmYWxzZVxuICAgICAgfVxuICAgIH0gKTtcblxuICAgIC8vIDxcbiAgICBjb25zdCBkZWNyZW1lbnRGaW5lQnV0dG9uID0gbmV3IEFycm93QnV0dG9uKCAnbGVmdCcsICggKCkgPT4ge1xuICAgICAgbnVtYmVyUHJvcGVydHkudmFsdWUgPSBudW1iZXJQcm9wZXJ0eS52YWx1ZSAtIG9wdGlvbnMuZGVsdGFGaW5lO1xuICAgIH0gKSwgY29tYmluZU9wdGlvbnM8QXJyb3dCdXR0b25PcHRpb25zPigge30sIGZpbmVCdXR0b25PcHRpb25zLFxuICAgICAgeyB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RlY3JlbWVudEZpbmVCdXR0b24nICkgfSApICk7XG5cbiAgICAvLyA8PFxuICAgIGNvbnN0IGRlY3JlbWVudENvYXJzZUJ1dHRvbiA9IG5ldyBBcnJvd0J1dHRvbiggJ2xlZnQnLCAoICgpID0+IHtcbiAgICAgIGNvbnN0IGRlbHRhID0gTWF0aC5taW4oIG9wdGlvbnMuZGVsdGFDb2Fyc2UsIG51bWJlclByb3BlcnR5LnZhbHVlIC0gbnVtYmVyUHJvcGVydHkucmFuZ2UubWluICk7XG4gICAgICBudW1iZXJQcm9wZXJ0eS52YWx1ZSA9IG51bWJlclByb3BlcnR5LnZhbHVlIC0gZGVsdGE7XG4gICAgfSApLCBjb21iaW5lT3B0aW9uczxBcnJvd0J1dHRvbk9wdGlvbnM+KCB7fSwgY29hcnNlQnV0dG9uT3B0aW9ucywge1xuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdkZWNyZW1lbnRDb2Fyc2VCdXR0b24nIClcbiAgICB9ICkgKTtcblxuICAgIC8vIFsgdmFsdWUgXVxuICAgIGNvbnN0IG51bWJlckRpc3BsYXkgPSBuZXcgTnVtYmVyRGlzcGxheSggbnVtYmVyUHJvcGVydHksIG51bWJlclByb3BlcnR5LnJhbmdlLFxuICAgICAgY29tYmluZU9wdGlvbnM8TnVtYmVyRGlzcGxheU9wdGlvbnM+KCB7XG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnbnVtYmVyRGlzcGxheScgKVxuICAgICAgfSwgb3B0aW9ucy5udW1iZXJEaXNwbGF5T3B0aW9ucyApICk7XG5cbiAgICAvLyA+XG4gICAgY29uc3QgaW5jcmVtZW50RmluZUJ1dHRvbiA9IG5ldyBBcnJvd0J1dHRvbiggJ3JpZ2h0JywgKCAoKSA9PiB7XG4gICAgICBudW1iZXJQcm9wZXJ0eS52YWx1ZSA9IG51bWJlclByb3BlcnR5LnZhbHVlICsgb3B0aW9ucy5kZWx0YUZpbmU7XG4gICAgfSApLCBjb21iaW5lT3B0aW9uczxBcnJvd0J1dHRvbk9wdGlvbnM+KCB7fSwgZmluZUJ1dHRvbk9wdGlvbnMsXG4gICAgICB7IHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnaW5jcmVtZW50RmluZUJ1dHRvbicgKSB9ICkgKTtcblxuICAgIC8vID4+XG4gICAgY29uc3QgaW5jcmVtZW50Q29hcnNlQnV0dG9uID0gbmV3IEFycm93QnV0dG9uKCAncmlnaHQnLCAoICgpID0+IHtcbiAgICAgIGNvbnN0IGRlbHRhID0gTWF0aC5taW4oIG9wdGlvbnMuZGVsdGFDb2Fyc2UsIG51bWJlclByb3BlcnR5LnJhbmdlLm1heCAtIG51bWJlclByb3BlcnR5LnZhbHVlICk7XG4gICAgICBudW1iZXJQcm9wZXJ0eS52YWx1ZSA9IG51bWJlclByb3BlcnR5LnZhbHVlICsgZGVsdGE7XG4gICAgfSApLCBjb21iaW5lT3B0aW9uczxBcnJvd0J1dHRvbk9wdGlvbnM+KCB7fSwgY29hcnNlQnV0dG9uT3B0aW9ucyxcbiAgICAgIHsgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdpbmNyZW1lbnRDb2Fyc2VCdXR0b24nICkgfSApICk7XG5cbiAgICAvLyA8ICA8PCAgWyB2YWx1ZSBdICA+PiAgPlxuICAgIGNvbnN0IGhCb3ggPSBuZXcgSEJveCgge1xuICAgICAgc3BhY2luZzogb3B0aW9ucy5zcGFjaW5nLFxuICAgICAgY2hpbGRyZW46IFsgZGVjcmVtZW50RmluZUJ1dHRvbiwgZGVjcmVtZW50Q29hcnNlQnV0dG9uLCBudW1iZXJEaXNwbGF5LCBpbmNyZW1lbnRDb2Fyc2VCdXR0b24sIGluY3JlbWVudEZpbmVCdXR0b24gXVxuICAgIH0gKTtcblxuICAgIC8vIFdyYXAgaW4gTm9kZSB0byBoaWRlIEhCb3ggQVBJLlxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIGhCb3ggXTtcblxuICAgIC8vIFNvdW5kcyBhcmUgcGxheWVkIHdoZW4gYSBidXR0b24gaXMgcHJlc3NlZC4gQnV0IGZvciAnaG9tZScgYW5kICdlbmQnIGtleXMsIHRoZSBidXR0b24gaXMgbm90IHByZXNzZWQsIHNvIHRoZVxuICAgIC8vIHNvdW5kIGlzIHBsYXllZCBtYW51YWxseS5cbiAgICBvcHRpb25zLm9uSW5wdXQgPSAoICggKCBldmVudCwgb2xkVmFsdWUgKSA9PiB7XG4gICAgICBpZiAoIGV2ZW50LmlzRnJvbVBET00oKSApIHtcbiAgICAgICAgY29uc3QgZG9tRXZlbnQgPSBldmVudC5kb21FdmVudDtcblxuICAgICAgICAvLyBUaGUgc291bmQgc2hvdWxkIG5vdCBwbGF5IGlmIHRoZSB2YWx1ZSBpcyBhbHJlYWR5IGF0IHRoZSBob21lIG9yIGVuZCB2YWx1ZS5cbiAgICAgICAgY29uc3QgY3VycmVudFZhbHVlID0gbnVtYmVyUHJvcGVydHkudmFsdWU7XG4gICAgICAgIGlmICggS2V5Ym9hcmRVdGlscy5pc0tleUV2ZW50KCBkb21FdmVudCwgS2V5Ym9hcmRVdGlscy5LRVlfSE9NRSApICYmIG9sZFZhbHVlICE9PSBjdXJyZW50VmFsdWUgKSB7XG4gICAgICAgICAgb3B0aW9ucy5hcnJvd3NTb3VuZFBsYXllci5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIEtleWJvYXJkVXRpbHMuaXNLZXlFdmVudCggZG9tRXZlbnQsIEtleWJvYXJkVXRpbHMuS0VZX0VORCApICYmIG9sZFZhbHVlICE9PSBjdXJyZW50VmFsdWUgKSB7XG4gICAgICAgICAgb3B0aW9ucy5hcnJvd3NTb3VuZFBsYXllci5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ICkgKTtcblxuICAgIHN1cGVyKCBvcHRpb25zICk7XG5cbiAgICAvLyBEaXNhYmxlIHRoZSBidXR0b25zIHdoZW4gdGhlIHZhbHVlIGlzIGF0IG1pbiBvciBtYXggb2YgdGhlIHJhbmdlXG4gICAgY29uc3QgYnV0dG9uc0VuYWJsZWRMaXN0ZW5lciA9ICggdmFsdWU6IG51bWJlciwgcmFuZ2U6IFJhbmdlICkgPT4ge1xuXG4gICAgICAvLyBsZWZ0IGJ1dHRvbnNcbiAgICAgIGRlY3JlbWVudEZpbmVCdXR0b24uZW5hYmxlZCA9IGRlY3JlbWVudENvYXJzZUJ1dHRvbi5lbmFibGVkID0gKCB2YWx1ZSAhPT0gcmFuZ2UubWluICk7XG5cbiAgICAgIC8vIHJpZ2h0IGJ1dHRvbnNcbiAgICAgIGluY3JlbWVudEZpbmVCdXR0b24uZW5hYmxlZCA9IGluY3JlbWVudENvYXJzZUJ1dHRvbi5lbmFibGVkID0gKCB2YWx1ZSAhPT0gcmFuZ2UubWF4ICk7XG4gICAgfTtcbiAgICBjb25zdCByYW5nZUFuZE51bWJlclByb3BlcnR5TXVsdGlsaW5rID0gTXVsdGlsaW5rLm11bHRpbGluayggWyBudW1iZXJQcm9wZXJ0eSwgbnVtYmVyUHJvcGVydHkucmFuZ2VQcm9wZXJ0eSBdLCBidXR0b25zRW5hYmxlZExpc3RlbmVyICk7XG5cbiAgICAvLyBwZG9tIC0gbWFudWFsbHkgY2xpY2sgYXJyb3cgYnV0dG9ucyBmcm9tIGFsdCBpbnB1dCBldmVudHMgc28gdGhhdCB0aGUgYnV0dG9ucyBsb29rIHByZXNzZWQgd2hpbGUgdGhlIGtleSBpcyBkb3duXG4gICAgY29uc3QgaW5jcmVhc2VkTGlzdGVuZXIgPSAoIGlzRG93bjogYm9vbGVhbiApID0+IHtcbiAgICAgIGlmICggaXNEb3duICkge1xuICAgICAgICB0aGlzLnNoaWZ0S2V5RG93biA/IGluY3JlbWVudEZpbmVCdXR0b24ucGRvbUNsaWNrKCkgOiBpbmNyZW1lbnRDb2Fyc2VCdXR0b24ucGRvbUNsaWNrKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBkZWNyZWFzZWRMaXN0ZW5lciA9ICggaXNEb3duOiBib29sZWFuICkgPT4ge1xuICAgICAgaWYgKCBpc0Rvd24gKSB7XG4gICAgICAgIHRoaXMuc2hpZnRLZXlEb3duID8gZGVjcmVtZW50RmluZUJ1dHRvbi5wZG9tQ2xpY2soKSA6IGRlY3JlbWVudENvYXJzZUJ1dHRvbi5wZG9tQ2xpY2soKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHRoaXMucGRvbUluY3JlbWVudERvd25FbWl0dGVyLmFkZExpc3RlbmVyKCBpbmNyZWFzZWRMaXN0ZW5lciApO1xuICAgIHRoaXMucGRvbURlY3JlbWVudERvd25FbWl0dGVyLmFkZExpc3RlbmVyKCBkZWNyZWFzZWRMaXN0ZW5lciApO1xuXG4gICAgdGhpcy5kaXNwb3NlRmluZUNvYXJzZVNwaW5uZXIgPSAoKSA9PiB7XG4gICAgICByYW5nZUFuZE51bWJlclByb3BlcnR5TXVsdGlsaW5rLmRpc3Bvc2UoKTtcblxuICAgICAgLy8gdW5yZWdpc3RlciB0YW5kZW1zXG4gICAgICBudW1iZXJEaXNwbGF5LmRpc3Bvc2UoKTtcbiAgICAgIGRlY3JlbWVudEZpbmVCdXR0b24uZGlzcG9zZSgpO1xuICAgICAgZGVjcmVtZW50Q29hcnNlQnV0dG9uLmRpc3Bvc2UoKTtcbiAgICAgIGluY3JlbWVudEZpbmVCdXR0b24uZGlzcG9zZSgpO1xuICAgICAgaW5jcmVtZW50Q29hcnNlQnV0dG9uLmRpc3Bvc2UoKTtcbiAgICB9O1xuXG4gICAgLy8gQ3JlYXRlIGEgbGluayB0byBhc3NvY2lhdGVkIFByb3BlcnR5LCBzbyBpdCdzIGVhc2llciB0byBmaW5kIGluIFN0dWRpby5cbiAgICB0aGlzLmFkZExpbmtlZEVsZW1lbnQoIG51bWJlclByb3BlcnR5LCB7XG4gICAgICB0YW5kZW1OYW1lOiAncHJvcGVydHknXG4gICAgfSApO1xuXG4gICAgLy8gc3VwcG9ydCBmb3IgYmluZGVyIGRvY3VtZW50YXRpb24sIHN0cmlwcGVkIG91dCBpbiBidWlsZHMgYW5kIG9ubHkgcnVucyB3aGVuID9iaW5kZXIgaXMgc3BlY2lmaWVkXG4gICAgYXNzZXJ0ICYmIHdpbmRvdy5waGV0Py5jaGlwcGVyPy5xdWVyeVBhcmFtZXRlcnM/LmJpbmRlciAmJiBJbnN0YW5jZVJlZ2lzdHJ5LnJlZ2lzdGVyRGF0YVVSTCggJ3NjZW5lcnktcGhldCcsICdGaW5lQ29hcnNlU3Bpbm5lcicsIHRoaXMgKTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZUZpbmVDb2Fyc2VTcGlubmVyKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnRmluZUNvYXJzZVNwaW5uZXInLCBGaW5lQ29hcnNlU3Bpbm5lciApOyJdLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJJbnN0YW5jZVJlZ2lzdHJ5Iiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJIQm94IiwiS2V5Ym9hcmRVdGlscyIsIk5vZGUiLCJBY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lciIsIkFycm93QnV0dG9uIiwic2hhcmVkU291bmRQbGF5ZXJzIiwiVGFuZGVtIiwiTnVtYmVyRGlzcGxheSIsInNjZW5lcnlQaGV0IiwiRmluZUNvYXJzZVNwaW5uZXIiLCJkaXNwb3NlIiwiZGlzcG9zZUZpbmVDb2Fyc2VTcGlubmVyIiwibnVtYmVyUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJ3aW5kb3ciLCJvcHRpb25zIiwiZGVsdGFGaW5lIiwiZGVsdGFDb2Fyc2UiLCJzcGFjaW5nIiwiYXJyb3dzU291bmRQbGF5ZXIiLCJnZXQiLCJ2YWx1ZVByb3BlcnR5IiwiZW5hYmxlZFJhbmdlUHJvcGVydHkiLCJyYW5nZVByb3BlcnR5IiwiaW50ZXJhY3RpdmVIaWdobGlnaHQiLCJrZXlib2FyZFN0ZXAiLCJzaGlmdEtleWJvYXJkU3RlcCIsInBhZ2VLZXlib2FyZFN0ZXAiLCJkaXNhYmxlZE9wYWNpdHkiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInRhbmRlbU5hbWVTdWZmaXgiLCJwaGV0aW9GZWF0dXJlZCIsInBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCIsImFzc2VydCIsImZpbmVCdXR0b25PcHRpb25zIiwiZm9jdXNhYmxlIiwibnVtYmVyT2ZBcnJvd3MiLCJhcnJvd1dpZHRoIiwiYXJyb3dIZWlnaHQiLCJzb3VuZFBsYXllciIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsIm1vdXNlQXJlYVhEaWxhdGlvbiIsIm1vdXNlQXJlYVlEaWxhdGlvbiIsImVuYWJsZWRQcm9wZXJ0eU9wdGlvbnMiLCJwaGV0aW9SZWFkT25seSIsImFycm93QnV0dG9uT3B0aW9ucyIsInVuZGVmaW5lZCIsImZpbmVCdXR0b25BcnJvd0hlaWdodCIsImNvYXJzZUJ1dHRvbk9wdGlvbnMiLCJhcnJvd1NwYWNpbmciLCJkZWNyZW1lbnRGaW5lQnV0dG9uIiwidmFsdWUiLCJjcmVhdGVUYW5kZW0iLCJkZWNyZW1lbnRDb2Fyc2VCdXR0b24iLCJkZWx0YSIsIk1hdGgiLCJtaW4iLCJyYW5nZSIsIm51bWJlckRpc3BsYXkiLCJudW1iZXJEaXNwbGF5T3B0aW9ucyIsImluY3JlbWVudEZpbmVCdXR0b24iLCJpbmNyZW1lbnRDb2Fyc2VCdXR0b24iLCJtYXgiLCJoQm94IiwiY2hpbGRyZW4iLCJvbklucHV0IiwiZXZlbnQiLCJvbGRWYWx1ZSIsImlzRnJvbVBET00iLCJkb21FdmVudCIsImN1cnJlbnRWYWx1ZSIsImlzS2V5RXZlbnQiLCJLRVlfSE9NRSIsInBsYXkiLCJLRVlfRU5EIiwiYnV0dG9uc0VuYWJsZWRMaXN0ZW5lciIsImVuYWJsZWQiLCJyYW5nZUFuZE51bWJlclByb3BlcnR5TXVsdGlsaW5rIiwibXVsdGlsaW5rIiwiaW5jcmVhc2VkTGlzdGVuZXIiLCJpc0Rvd24iLCJzaGlmdEtleURvd24iLCJwZG9tQ2xpY2siLCJkZWNyZWFzZWRMaXN0ZW5lciIsInBkb21JbmNyZW1lbnREb3duRW1pdHRlciIsImFkZExpc3RlbmVyIiwicGRvbURlY3JlbWVudERvd25FbWl0dGVyIiwiYWRkTGlua2VkRWxlbWVudCIsInRhbmRlbU5hbWUiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImJpbmRlciIsInJlZ2lzdGVyRGF0YVVSTCIsInJlZ2lzdGVy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