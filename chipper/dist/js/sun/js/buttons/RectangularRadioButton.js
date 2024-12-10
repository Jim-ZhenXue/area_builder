// Copyright 2014-2024, University of Colorado Boulder
/**
 * RectangularRadioButton is a single rectangular radio button. It typically appears as part of a
 * RectangularRadioButtonGroup, but can be used in other context.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */ import Emitter from '../../../axon/js/Emitter.js';
import optionize from '../../../phet-core/js/optionize.js';
import { assertNoAdditionalChildren, Color, PaintColorProperty } from '../../../scenery/js/imports.js';
import sharedSoundPlayers from '../../../tambo/js/sharedSoundPlayers.js';
import EventType from '../../../tandem/js/EventType.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ColorConstants from '../ColorConstants.js';
import sun from '../sun.js';
import ButtonModel from './ButtonModel.js';
import RadioButtonInteractionState from './RadioButtonInteractionState.js';
import RadioButtonInteractionStateProperty from './RadioButtonInteractionStateProperty.js';
import RectangularButton from './RectangularButton.js';
let RectangularRadioButton = class RectangularRadioButton extends RectangularButton {
    dispose() {
        this.disposeRectangularRadioButton();
        super.dispose();
    }
    /**
   * fire on up if the button is enabled, public for use in the accessibility tree
   */ fire() {
        if (this.buttonModel.enabledProperty.get()) {
            this.firedEmitter.emit();
            this.buttonModel.produceSoundEmitter.emit();
        }
    }
    /**
   * @param property - axon Property that can take on a set of values, one for each radio button in the group
   * @param value - value when this radio button is selected
   * @param providedOptions
   */ constructor(property, value, providedOptions){
        assert && assert(property.valueComparisonStrategy === 'reference', 'RectangularRadioButton depends on "===" equality for value comparison');
        const options = optionize()({
            // SelfOptions
            soundPlayer: null,
            // RectangularButtonOptions
            baseColor: ColorConstants.LIGHT_BLUE,
            buttonAppearanceStrategy: RectangularRadioButton.FlatAppearanceStrategy,
            buttonAppearanceStrategyOptions: {
                overButtonOpacity: 0.8,
                overStroke: null,
                selectedStroke: Color.BLACK,
                selectedLineWidth: 1.5,
                selectedButtonOpacity: 1,
                deselectedStroke: new Color(50, 50, 50),
                deselectedLineWidth: 1,
                deselectedButtonOpacity: 0.6
            },
            contentAppearanceStrategy: RectangularRadioButton.ContentAppearanceStrategy,
            contentAppearanceStrategyOptions: {
                overContentOpacity: 0.8,
                selectedContentOpacity: 1,
                deselectedContentOpacity: 0.6
            },
            // pdom
            tagName: 'input',
            inputType: 'radio',
            labelTagName: 'label',
            containerTagName: 'li',
            appendDescription: true,
            appendLabel: true,
            // phet-io
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'RadioButton',
            phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
        }, providedOptions);
        // ButtonModel is responsible for enabledProperty, so propagate enabledPropertyOptions.
        // tandem is also propagated because we want enabledProperty to appear as a child of this button.
        // Since enabledProperty is unrelated to the look of the button when selected/deselected, we've also included
        // phetioEnabledPropertyInstrumented so that one can opt out of this potentially confusing instrumentation.
        // See https://github.com/phetsims/sun/issues/847.
        const buttonModel = new ButtonModel({
            enabledPropertyOptions: options.enabledPropertyOptions,
            tandem: options.tandem,
            phetioEnabledPropertyInstrumented: options.phetioEnabledPropertyInstrumented
        });
        const interactionStateProperty = new RadioButtonInteractionStateProperty(buttonModel, property, value);
        super(buttonModel, interactionStateProperty, options);
        // for use in RectangularRadioButtonGroup for managing the labels
        this.interactionStateProperty = interactionStateProperty;
        // pdom - Specify the default value for assistive technology, this attribute is needed in addition to
        // the 'checked' Property to mark this element as the default selection since 'checked' may be set before
        // we are finished adding RectangularRadioButtons to the RectangularRadioButtonGroup.
        if (property.value === value) {
            this.setPDOMAttribute('checked', 'checked');
        }
        // pdom - when the Property changes, make sure the correct radio button is marked as 'checked' so that this button
        // receives focus on 'tab'
        const pdomCheckedListener = (newValue)=>{
            this.pdomChecked = newValue === value;
        };
        property.link(pdomCheckedListener);
        this.property = property;
        this.value = value;
        this.firedEmitter = new Emitter({
            tandem: options.tandem.createTandem('firedEmitter'),
            phetioDocumentation: 'Emits when the radio button is pressed',
            phetioReadOnly: options.phetioReadOnly,
            phetioEventType: EventType.USER
        });
        this.firedEmitter.addListener(()=>property.set(value));
        // When the button model triggers an event, fire from the radio button
        buttonModel.downProperty.link((down)=>{
            if (!down && (buttonModel.overProperty.get() || buttonModel.focusedProperty.get()) && !buttonModel.interrupted) {
                this.fire();
                this.voicingSpeakFullResponse({
                    hintResponse: null
                });
            }
        });
        // sound generation
        const soundPlayer = options.soundPlayer || sharedSoundPlayers.get('pushButton');
        const playSound = ()=>{
            soundPlayer.play();
        };
        buttonModel.produceSoundEmitter.addListener(playSound);
        this.disposeRectangularRadioButton = ()=>{
            property.unlink(pdomCheckedListener);
            this.firedEmitter.dispose();
            buttonModel.produceSoundEmitter.removeListener(playSound);
            buttonModel.dispose();
            this.interactionStateProperty.dispose();
        };
        // Adding children to UI components with content is problematic for dynamic layout.
        assert && assertNoAdditionalChildren(this);
    }
};
/**
   * FlatAppearanceStrategy is a value for RectangularRadioButton options.buttonAppearanceStrategy. It makes radio buttons
   * that look flat, i.e. no shading or highlighting, but that change color on mouseover, press, selected, etc.
   */ RectangularRadioButton.FlatAppearanceStrategy = class FlatAppearanceStrategy {
    dispose() {
        this.disposeFlatAppearanceStrategy();
    }
    /**
     * buttonBackground is the Node for the button's background, sans content
     */ constructor(buttonBackground, interactionStateProperty, baseColorProperty, providedOptions){
        const options = optionize()({
            stroke: baseColorProperty,
            lineWidth: 1,
            deselectedButtonOpacity: 1,
            deselectedLineWidth: 1,
            deselectedStroke: 'gray',
            deselectedFill: null,
            overButtonOpacity: 0.8,
            overFill: null,
            overLineWidth: 0,
            overStroke: null,
            selectedButtonOpacity: 1,
            selectedLineWidth: 1,
            selectedStroke: 'black'
        }, providedOptions);
        // Dynamic fills and strokes
        const pressedFillProperty = new PaintColorProperty(baseColorProperty, {
            luminanceFactor: -0.4
        });
        const overFillProperty = new PaintColorProperty(options.overFill || baseColorProperty, {
            luminanceFactor: providedOptions && providedOptions.overFill ? 0 : 0.4
        });
        // Editorial Note: The code below, where the deselected stroke is used as the value for the over stroke if no over
        // stroke is provided, seems a bit odd.  However, I (jbphet) tried removing it when refactoring this to support
        // TypeScript, and a number of sims broke.  The code was reviewed and discussed with some other devs, and we
        // decided to leave it as is, despite it being a bit unintuitive.  See https://github.com/phetsims/sun/issues/772.
        const overStrokeProperty = new PaintColorProperty(options.overStroke || options.deselectedStroke, {
            luminanceFactor: providedOptions && providedOptions.overStroke ? 0 : -0.4
        });
        this.maxLineWidth = Math.max(options.selectedLineWidth, options.deselectedLineWidth, options.overLineWidth);
        // Cache colors
        buttonBackground.cachedPaints = [
            baseColorProperty,
            overFillProperty,
            pressedFillProperty,
            overStrokeProperty,
            options.selectedStroke,
            options.deselectedStroke
        ];
        // Change colors and opacity to match interactionState
        function interactionStateListener(interactionState) {
            switch(interactionState){
                case RadioButtonInteractionState.SELECTED:
                    buttonBackground.fill = baseColorProperty;
                    buttonBackground.stroke = options.selectedStroke;
                    buttonBackground.lineWidth = options.selectedLineWidth;
                    buttonBackground.opacity = options.selectedButtonOpacity;
                    break;
                case RadioButtonInteractionState.DESELECTED:
                    buttonBackground.fill = options.deselectedFill || baseColorProperty;
                    buttonBackground.stroke = options.deselectedStroke;
                    buttonBackground.lineWidth = options.deselectedLineWidth;
                    buttonBackground.opacity = options.deselectedButtonOpacity;
                    break;
                case RadioButtonInteractionState.OVER:
                    buttonBackground.fill = overFillProperty;
                    buttonBackground.stroke = overStrokeProperty;
                    buttonBackground.lineWidth = Math.max(options.overLineWidth, options.deselectedLineWidth);
                    buttonBackground.opacity = options.overButtonOpacity;
                    break;
                case RadioButtonInteractionState.PRESSED:
                    buttonBackground.fill = pressedFillProperty;
                    buttonBackground.stroke = options.deselectedStroke;
                    buttonBackground.lineWidth = options.deselectedLineWidth;
                    buttonBackground.opacity = options.selectedButtonOpacity;
                    break;
                default:
                    throw new Error(`unsupported interactionState: ${interactionState}`);
            }
        }
        interactionStateProperty.link(interactionStateListener);
        this.disposeFlatAppearanceStrategy = ()=>{
            if (interactionStateProperty.hasListener(interactionStateListener)) {
                interactionStateProperty.unlink(interactionStateListener);
            }
            overStrokeProperty.dispose();
            overFillProperty.dispose();
            pressedFillProperty.dispose();
        };
    }
};
/**
   * ContentAppearanceStrategy is a value for RectangularRadioButton options.contentAppearanceStrategy. It changes
   * their look based on the value of interactionStateProperty.
   */ RectangularRadioButton.ContentAppearanceStrategy = class ContentAppearanceStrategy {
    dispose() {
        this.disposeContentAppearanceStrategy();
    }
    constructor(content, interactionStateProperty, providedOptions){
        const options = optionize()({
            deselectedContentOpacity: 1,
            overContentOpacity: 1,
            selectedContentOpacity: 1
        }, providedOptions);
        // The button is not the parent of the content, therefore it is necessary to set the opacity on the content separately
        function handleInteractionStateChanged(state) {
            if (content !== null) {
                switch(state){
                    case RadioButtonInteractionState.DESELECTED:
                        content.opacity = options.deselectedContentOpacity;
                        break;
                    // mouseover for deselected buttons
                    case RadioButtonInteractionState.OVER:
                        content.opacity = options.overContentOpacity;
                        break;
                    case RadioButtonInteractionState.SELECTED:
                        content.opacity = options.selectedContentOpacity;
                        break;
                    case RadioButtonInteractionState.PRESSED:
                        content.opacity = options.deselectedContentOpacity;
                        break;
                    default:
                        throw new Error(`unsupported state: ${state}`);
                }
            }
        }
        interactionStateProperty.link(handleInteractionStateChanged);
        this.disposeContentAppearanceStrategy = ()=>{
            if (interactionStateProperty.hasListener(handleInteractionStateChanged)) {
                interactionStateProperty.unlink(handleInteractionStateChanged);
            }
        };
    }
};
export { RectangularRadioButton as default };
sun.register('RectangularRadioButton', RectangularRadioButton);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JlY3Rhbmd1bGFyUmFkaW9CdXR0b24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbiBpcyBhIHNpbmdsZSByZWN0YW5ndWxhciByYWRpbyBidXR0b24uIEl0IHR5cGljYWxseSBhcHBlYXJzIGFzIHBhcnQgb2YgYVxuICogUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwLCBidXQgY2FuIGJlIHVzZWQgaW4gb3RoZXIgY29udGV4dC5cbiAqXG4gKiBAYXV0aG9yIEFhcm9uIERhdmlzIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XG5pbXBvcnQgVFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFByb3BlcnR5LmpzJztcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBhc3NlcnROb0FkZGl0aW9uYWxDaGlsZHJlbiwgQ29sb3IsIE5vZGUsIFBhaW50YWJsZU5vZGUsIFBhaW50Q29sb3JQcm9wZXJ0eSwgVHJpbVBhcmFsbGVsRE9NT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgc2hhcmVkU291bmRQbGF5ZXJzIGZyb20gJy4uLy4uLy4uL3RhbWJvL2pzL3NoYXJlZFNvdW5kUGxheWVycy5qcyc7XG5pbXBvcnQgVFNvdW5kUGxheWVyIGZyb20gJy4uLy4uLy4uL3RhbWJvL2pzL1RTb3VuZFBsYXllci5qcyc7XG5pbXBvcnQgRXZlbnRUeXBlIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9FdmVudFR5cGUuanMnO1xuaW1wb3J0IFBoZXRpb09iamVjdCBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgQ29sb3JDb25zdGFudHMgZnJvbSAnLi4vQ29sb3JDb25zdGFudHMuanMnO1xuaW1wb3J0IHN1biBmcm9tICcuLi9zdW4uanMnO1xuaW1wb3J0IEJ1dHRvbk1vZGVsIGZyb20gJy4vQnV0dG9uTW9kZWwuanMnO1xuaW1wb3J0IFJhZGlvQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZSBmcm9tICcuL1JhZGlvQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZS5qcyc7XG5pbXBvcnQgUmFkaW9CdXR0b25JbnRlcmFjdGlvblN0YXRlUHJvcGVydHkgZnJvbSAnLi9SYWRpb0J1dHRvbkludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUmVjdGFuZ3VsYXJCdXR0b24sIHsgUmVjdGFuZ3VsYXJCdXR0b25PcHRpb25zIH0gZnJvbSAnLi9SZWN0YW5ndWxhckJ1dHRvbi5qcyc7XG5pbXBvcnQgVEJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneSwgeyBUQnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5T3B0aW9ucyB9IGZyb20gJy4vVEJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneS5qcyc7XG5pbXBvcnQgVENvbnRlbnRBcHBlYXJhbmNlU3RyYXRlZ3ksIHsgVENvbnRlbnRBcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zIH0gZnJvbSAnLi9UQ29udGVudEFwcGVhcmFuY2VTdHJhdGVneS5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG5cbiAgLy8gU291bmQgZ2VuZXJhdGlvbiAtIElmIHNldCB0byBudWxsIGEgZGVmYXVsdCB3aWxsIGJlIHVzZWQgdGhhdCBpcyBiYXNlZCBvbiB0aGlzIGJ1dHRvbidzIHBvc2l0aW9uIHdpdGhpbiB0aGUgcmFkaW9cbiAgLy8gYnV0dG9uIGdyb3VwLiAgQ2FuIGJlIHNldCB0byBudWxsU291bmRQbGF5ZXIgdG8gdHVybiBvZmYgYWxsIHNvdW5kIGdlbmVyYXRpb24uXG4gIHNvdW5kUGxheWVyPzogVFNvdW5kUGxheWVyIHwgbnVsbDtcbn07XG5cbmV4cG9ydCB0eXBlIFJlY3Rhbmd1bGFyUmFkaW9CdXR0b25PcHRpb25zID0gU2VsZk9wdGlvbnMgJlxuICAvLyBUaGVzZSBvcHRpb25zIGFyZSBub3QgYXBwcm9wcmlhdGUgZm9yIHJhZGlvIGJ1dHRvbnMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy84NDdcbiAgU3RyaWN0T21pdDxUcmltUGFyYWxsZWxET01PcHRpb25zPFJlY3Rhbmd1bGFyQnV0dG9uT3B0aW9ucz4sICdlbmFibGVkUHJvcGVydHknIHwgJ2VuYWJsZWQnPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbjxUPiBleHRlbmRzIFJlY3Rhbmd1bGFyQnV0dG9uIHtcblxuICAvLyB0aGUgUHJvcGVydHkgdGhpcyBidXR0b24gY2hhbmdlc1xuICBwdWJsaWMgcmVhZG9ubHkgcHJvcGVydHk6IFRQcm9wZXJ0eTxUPjtcblxuICAvLyB0aGUgdmFsdWUgdGhhdCBpcyBzZXQgdG8gdGhlIFByb3BlcnR5IHdoZW4gdGhpcyBidXR0b24gaXMgcHJlc3NlZFxuICBwdWJsaWMgcmVhZG9ubHkgdmFsdWU6IFQ7XG5cbiAgcHVibGljIHJlYWRvbmx5IGludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eTogUmFkaW9CdXR0b25JbnRlcmFjdGlvblN0YXRlUHJvcGVydHk8VD47XG5cbiAgcHJpdmF0ZSByZWFkb25seSBmaXJlZEVtaXR0ZXI6IFRFbWl0dGVyO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZVJlY3Rhbmd1bGFyUmFkaW9CdXR0b246ICgpID0+IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBwcm9wZXJ0eSAtIGF4b24gUHJvcGVydHkgdGhhdCBjYW4gdGFrZSBvbiBhIHNldCBvZiB2YWx1ZXMsIG9uZSBmb3IgZWFjaCByYWRpbyBidXR0b24gaW4gdGhlIGdyb3VwXG4gICAqIEBwYXJhbSB2YWx1ZSAtIHZhbHVlIHdoZW4gdGhpcyByYWRpbyBidXR0b24gaXMgc2VsZWN0ZWRcbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9uc1xuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm9wZXJ0eTogVFByb3BlcnR5PFQ+LCB2YWx1ZTogVCwgcHJvdmlkZWRPcHRpb25zPzogUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbk9wdGlvbnMgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcHJvcGVydHkudmFsdWVDb21wYXJpc29uU3RyYXRlZ3kgPT09ICdyZWZlcmVuY2UnLFxuICAgICAgJ1JlY3Rhbmd1bGFyUmFkaW9CdXR0b24gZGVwZW5kcyBvbiBcIj09PVwiIGVxdWFsaXR5IGZvciB2YWx1ZSBjb21wYXJpc29uJyApO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxSZWN0YW5ndWxhclJhZGlvQnV0dG9uT3B0aW9ucywgU2VsZk9wdGlvbnMsIFJlY3Rhbmd1bGFyQnV0dG9uT3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyBTZWxmT3B0aW9uc1xuICAgICAgc291bmRQbGF5ZXI6IG51bGwsXG5cbiAgICAgIC8vIFJlY3Rhbmd1bGFyQnV0dG9uT3B0aW9uc1xuICAgICAgYmFzZUNvbG9yOiBDb2xvckNvbnN0YW50cy5MSUdIVF9CTFVFLFxuICAgICAgYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5OiBSZWN0YW5ndWxhclJhZGlvQnV0dG9uLkZsYXRBcHBlYXJhbmNlU3RyYXRlZ3ksXG4gICAgICBidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zOiB7XG4gICAgICAgIG92ZXJCdXR0b25PcGFjaXR5OiAwLjgsXG4gICAgICAgIG92ZXJTdHJva2U6IG51bGwsXG4gICAgICAgIHNlbGVjdGVkU3Ryb2tlOiBDb2xvci5CTEFDSyxcbiAgICAgICAgc2VsZWN0ZWRMaW5lV2lkdGg6IDEuNSxcbiAgICAgICAgc2VsZWN0ZWRCdXR0b25PcGFjaXR5OiAxLFxuICAgICAgICBkZXNlbGVjdGVkU3Ryb2tlOiBuZXcgQ29sb3IoIDUwLCA1MCwgNTAgKSxcbiAgICAgICAgZGVzZWxlY3RlZExpbmVXaWR0aDogMSxcbiAgICAgICAgZGVzZWxlY3RlZEJ1dHRvbk9wYWNpdHk6IDAuNlxuICAgICAgfSxcbiAgICAgIGNvbnRlbnRBcHBlYXJhbmNlU3RyYXRlZ3k6IFJlY3Rhbmd1bGFyUmFkaW9CdXR0b24uQ29udGVudEFwcGVhcmFuY2VTdHJhdGVneSxcbiAgICAgIGNvbnRlbnRBcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zOiB7XG4gICAgICAgIG92ZXJDb250ZW50T3BhY2l0eTogMC44LFxuICAgICAgICBzZWxlY3RlZENvbnRlbnRPcGFjaXR5OiAxLFxuICAgICAgICBkZXNlbGVjdGVkQ29udGVudE9wYWNpdHk6IDAuNlxuICAgICAgfSxcblxuICAgICAgLy8gcGRvbVxuICAgICAgdGFnTmFtZTogJ2lucHV0JyxcbiAgICAgIGlucHV0VHlwZTogJ3JhZGlvJyxcbiAgICAgIGxhYmVsVGFnTmFtZTogJ2xhYmVsJyxcbiAgICAgIGNvbnRhaW5lclRhZ05hbWU6ICdsaScsXG4gICAgICBhcHBlbmREZXNjcmlwdGlvbjogdHJ1ZSxcbiAgICAgIGFwcGVuZExhYmVsOiB0cnVlLFxuXG4gICAgICAvLyBwaGV0LWlvXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcbiAgICAgIHRhbmRlbU5hbWVTdWZmaXg6ICdSYWRpb0J1dHRvbicsXG4gICAgICBwaGV0aW9SZWFkT25seTogUGhldGlvT2JqZWN0LkRFRkFVTFRfT1BUSU9OUy5waGV0aW9SZWFkT25seSAvLyB0byBzdXBwb3J0IHByb3Blcmx5IHBhc3NpbmcgdGhpcyB0byBjaGlsZHJlbiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy90YW5kZW0vaXNzdWVzLzYwXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAvLyBCdXR0b25Nb2RlbCBpcyByZXNwb25zaWJsZSBmb3IgZW5hYmxlZFByb3BlcnR5LCBzbyBwcm9wYWdhdGUgZW5hYmxlZFByb3BlcnR5T3B0aW9ucy5cbiAgICAvLyB0YW5kZW0gaXMgYWxzbyBwcm9wYWdhdGVkIGJlY2F1c2Ugd2Ugd2FudCBlbmFibGVkUHJvcGVydHkgdG8gYXBwZWFyIGFzIGEgY2hpbGQgb2YgdGhpcyBidXR0b24uXG4gICAgLy8gU2luY2UgZW5hYmxlZFByb3BlcnR5IGlzIHVucmVsYXRlZCB0byB0aGUgbG9vayBvZiB0aGUgYnV0dG9uIHdoZW4gc2VsZWN0ZWQvZGVzZWxlY3RlZCwgd2UndmUgYWxzbyBpbmNsdWRlZFxuICAgIC8vIHBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCBzbyB0aGF0IG9uZSBjYW4gb3B0IG91dCBvZiB0aGlzIHBvdGVudGlhbGx5IGNvbmZ1c2luZyBpbnN0cnVtZW50YXRpb24uXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzg0Ny5cbiAgICBjb25zdCBidXR0b25Nb2RlbCA9IG5ldyBCdXR0b25Nb2RlbCgge1xuICAgICAgZW5hYmxlZFByb3BlcnR5T3B0aW9uczogb3B0aW9ucy5lbmFibGVkUHJvcGVydHlPcHRpb25zLFxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbSxcbiAgICAgIHBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZDogb3B0aW9ucy5waGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWRcbiAgICB9ICk7XG5cbiAgICBjb25zdCBpbnRlcmFjdGlvblN0YXRlUHJvcGVydHkgPSBuZXcgUmFkaW9CdXR0b25JbnRlcmFjdGlvblN0YXRlUHJvcGVydHkoIGJ1dHRvbk1vZGVsLCBwcm9wZXJ0eSwgdmFsdWUgKTtcblxuICAgIHN1cGVyKCBidXR0b25Nb2RlbCwgaW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5LCBvcHRpb25zICk7XG5cbiAgICAvLyBmb3IgdXNlIGluIFJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCBmb3IgbWFuYWdpbmcgdGhlIGxhYmVsc1xuICAgIHRoaXMuaW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5ID0gaW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5O1xuXG4gICAgLy8gcGRvbSAtIFNwZWNpZnkgdGhlIGRlZmF1bHQgdmFsdWUgZm9yIGFzc2lzdGl2ZSB0ZWNobm9sb2d5LCB0aGlzIGF0dHJpYnV0ZSBpcyBuZWVkZWQgaW4gYWRkaXRpb24gdG9cbiAgICAvLyB0aGUgJ2NoZWNrZWQnIFByb3BlcnR5IHRvIG1hcmsgdGhpcyBlbGVtZW50IGFzIHRoZSBkZWZhdWx0IHNlbGVjdGlvbiBzaW5jZSAnY2hlY2tlZCcgbWF5IGJlIHNldCBiZWZvcmVcbiAgICAvLyB3ZSBhcmUgZmluaXNoZWQgYWRkaW5nIFJlY3Rhbmd1bGFyUmFkaW9CdXR0b25zIHRvIHRoZSBSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAuXG4gICAgaWYgKCBwcm9wZXJ0eS52YWx1ZSA9PT0gdmFsdWUgKSB7XG4gICAgICB0aGlzLnNldFBET01BdHRyaWJ1dGUoICdjaGVja2VkJywgJ2NoZWNrZWQnICk7XG4gICAgfVxuXG4gICAgLy8gcGRvbSAtIHdoZW4gdGhlIFByb3BlcnR5IGNoYW5nZXMsIG1ha2Ugc3VyZSB0aGUgY29ycmVjdCByYWRpbyBidXR0b24gaXMgbWFya2VkIGFzICdjaGVja2VkJyBzbyB0aGF0IHRoaXMgYnV0dG9uXG4gICAgLy8gcmVjZWl2ZXMgZm9jdXMgb24gJ3RhYidcbiAgICBjb25zdCBwZG9tQ2hlY2tlZExpc3RlbmVyID0gKCBuZXdWYWx1ZTogVCApID0+IHtcbiAgICAgIHRoaXMucGRvbUNoZWNrZWQgPSAoIG5ld1ZhbHVlID09PSB2YWx1ZSApO1xuICAgIH07XG4gICAgcHJvcGVydHkubGluayggcGRvbUNoZWNrZWRMaXN0ZW5lciApO1xuXG4gICAgdGhpcy5wcm9wZXJ0eSA9IHByb3BlcnR5O1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmZpcmVkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7XG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZpcmVkRW1pdHRlcicgKSxcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdFbWl0cyB3aGVuIHRoZSByYWRpbyBidXR0b24gaXMgcHJlc3NlZCcsXG4gICAgICBwaGV0aW9SZWFkT25seTogb3B0aW9ucy5waGV0aW9SZWFkT25seSxcbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVJcbiAgICB9ICk7XG5cbiAgICB0aGlzLmZpcmVkRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gcHJvcGVydHkuc2V0KCB2YWx1ZSApICk7XG5cbiAgICAvLyBXaGVuIHRoZSBidXR0b24gbW9kZWwgdHJpZ2dlcnMgYW4gZXZlbnQsIGZpcmUgZnJvbSB0aGUgcmFkaW8gYnV0dG9uXG4gICAgYnV0dG9uTW9kZWwuZG93blByb3BlcnR5LmxpbmsoIGRvd24gPT4ge1xuICAgICAgaWYgKCAhZG93biAmJiAoIGJ1dHRvbk1vZGVsLm92ZXJQcm9wZXJ0eS5nZXQoKSB8fCBidXR0b25Nb2RlbC5mb2N1c2VkUHJvcGVydHkuZ2V0KCkgKSAmJiAhYnV0dG9uTW9kZWwuaW50ZXJydXB0ZWQgKSB7XG4gICAgICAgIHRoaXMuZmlyZSgpO1xuICAgICAgICB0aGlzLnZvaWNpbmdTcGVha0Z1bGxSZXNwb25zZSgge1xuICAgICAgICAgIGhpbnRSZXNwb25zZTogbnVsbFxuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gc291bmQgZ2VuZXJhdGlvblxuICAgIGNvbnN0IHNvdW5kUGxheWVyID0gb3B0aW9ucy5zb3VuZFBsYXllciB8fCBzaGFyZWRTb3VuZFBsYXllcnMuZ2V0KCAncHVzaEJ1dHRvbicgKTtcbiAgICBjb25zdCBwbGF5U291bmQgPSAoKSA9PiB7IHNvdW5kUGxheWVyLnBsYXkoKTsgfTtcbiAgICBidXR0b25Nb2RlbC5wcm9kdWNlU291bmRFbWl0dGVyLmFkZExpc3RlbmVyKCBwbGF5U291bmQgKTtcblxuICAgIHRoaXMuZGlzcG9zZVJlY3Rhbmd1bGFyUmFkaW9CdXR0b24gPSAoKSA9PiB7XG4gICAgICBwcm9wZXJ0eS51bmxpbmsoIHBkb21DaGVja2VkTGlzdGVuZXIgKTtcbiAgICAgIHRoaXMuZmlyZWRFbWl0dGVyLmRpc3Bvc2UoKTtcbiAgICAgIGJ1dHRvbk1vZGVsLnByb2R1Y2VTb3VuZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHBsYXlTb3VuZCApO1xuICAgICAgYnV0dG9uTW9kZWwuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5pbnRlcmFjdGlvblN0YXRlUHJvcGVydHkuZGlzcG9zZSgpO1xuICAgIH07XG5cbiAgICAvLyBBZGRpbmcgY2hpbGRyZW4gdG8gVUkgY29tcG9uZW50cyB3aXRoIGNvbnRlbnQgaXMgcHJvYmxlbWF0aWMgZm9yIGR5bmFtaWMgbGF5b3V0LlxuICAgIGFzc2VydCAmJiBhc3NlcnROb0FkZGl0aW9uYWxDaGlsZHJlbiggdGhpcyApO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbigpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBmaXJlIG9uIHVwIGlmIHRoZSBidXR0b24gaXMgZW5hYmxlZCwgcHVibGljIGZvciB1c2UgaW4gdGhlIGFjY2Vzc2liaWxpdHkgdHJlZVxuICAgKi9cbiAgcHVibGljIGZpcmUoKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLmJ1dHRvbk1vZGVsLmVuYWJsZWRQcm9wZXJ0eS5nZXQoKSApIHtcbiAgICAgIHRoaXMuZmlyZWRFbWl0dGVyLmVtaXQoKTtcbiAgICAgIHRoaXMuYnV0dG9uTW9kZWwucHJvZHVjZVNvdW5kRW1pdHRlci5lbWl0KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZsYXRBcHBlYXJhbmNlU3RyYXRlZ3kgaXMgYSB2YWx1ZSBmb3IgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbiBvcHRpb25zLmJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneS4gSXQgbWFrZXMgcmFkaW8gYnV0dG9uc1xuICAgKiB0aGF0IGxvb2sgZmxhdCwgaS5lLiBubyBzaGFkaW5nIG9yIGhpZ2hsaWdodGluZywgYnV0IHRoYXQgY2hhbmdlIGNvbG9yIG9uIG1vdXNlb3ZlciwgcHJlc3MsIHNlbGVjdGVkLCBldGMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIG92ZXJyaWRlIHJlYWRvbmx5IEZsYXRBcHBlYXJhbmNlU3RyYXRlZ3k6IFRCdXR0b25BcHBlYXJhbmNlU3RyYXRlZ3kgPSBjbGFzcyBGbGF0QXBwZWFyYW5jZVN0cmF0ZWd5IHtcblxuICAgIHB1YmxpYyByZWFkb25seSBtYXhMaW5lV2lkdGg6IG51bWJlcjtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUZsYXRBcHBlYXJhbmNlU3RyYXRlZ3k6ICgpID0+IHZvaWQ7XG5cbiAgICAvKipcbiAgICAgKiBidXR0b25CYWNrZ3JvdW5kIGlzIHRoZSBOb2RlIGZvciB0aGUgYnV0dG9uJ3MgYmFja2dyb3VuZCwgc2FucyBjb250ZW50XG4gICAgICovXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKCBidXR0b25CYWNrZ3JvdW5kOiBQYWludGFibGVOb2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxSYWRpb0J1dHRvbkludGVyYWN0aW9uU3RhdGU+LFxuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZUNvbG9yUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PENvbG9yPixcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9ucz86IFRCdXR0b25BcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zICkge1xuXG4gICAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFRCdXR0b25BcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zPigpKCB7XG4gICAgICAgIHN0cm9rZTogYmFzZUNvbG9yUHJvcGVydHksXG4gICAgICAgIGxpbmVXaWR0aDogMSxcbiAgICAgICAgZGVzZWxlY3RlZEJ1dHRvbk9wYWNpdHk6IDEsXG4gICAgICAgIGRlc2VsZWN0ZWRMaW5lV2lkdGg6IDEsXG4gICAgICAgIGRlc2VsZWN0ZWRTdHJva2U6ICdncmF5JyxcbiAgICAgICAgZGVzZWxlY3RlZEZpbGw6IG51bGwsXG4gICAgICAgIG92ZXJCdXR0b25PcGFjaXR5OiAwLjgsXG4gICAgICAgIG92ZXJGaWxsOiBudWxsLFxuICAgICAgICBvdmVyTGluZVdpZHRoOiAwLFxuICAgICAgICBvdmVyU3Ryb2tlOiBudWxsLFxuICAgICAgICBzZWxlY3RlZEJ1dHRvbk9wYWNpdHk6IDEsXG4gICAgICAgIHNlbGVjdGVkTGluZVdpZHRoOiAxLFxuICAgICAgICBzZWxlY3RlZFN0cm9rZTogJ2JsYWNrJ1xuICAgICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAgIC8vIER5bmFtaWMgZmlsbHMgYW5kIHN0cm9rZXNcbiAgICAgIGNvbnN0IHByZXNzZWRGaWxsUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBiYXNlQ29sb3JQcm9wZXJ0eSwge1xuICAgICAgICBsdW1pbmFuY2VGYWN0b3I6IC0wLjRcbiAgICAgIH0gKTtcbiAgICAgIGNvbnN0IG92ZXJGaWxsUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBvcHRpb25zLm92ZXJGaWxsIHx8IGJhc2VDb2xvclByb3BlcnR5LCB7XG4gICAgICAgIGx1bWluYW5jZUZhY3RvcjogcHJvdmlkZWRPcHRpb25zICYmIHByb3ZpZGVkT3B0aW9ucy5vdmVyRmlsbCA/IDAgOiAwLjRcbiAgICAgIH0gKTtcblxuICAgICAgLy8gRWRpdG9yaWFsIE5vdGU6IFRoZSBjb2RlIGJlbG93LCB3aGVyZSB0aGUgZGVzZWxlY3RlZCBzdHJva2UgaXMgdXNlZCBhcyB0aGUgdmFsdWUgZm9yIHRoZSBvdmVyIHN0cm9rZSBpZiBubyBvdmVyXG4gICAgICAvLyBzdHJva2UgaXMgcHJvdmlkZWQsIHNlZW1zIGEgYml0IG9kZC4gIEhvd2V2ZXIsIEkgKGpicGhldCkgdHJpZWQgcmVtb3ZpbmcgaXQgd2hlbiByZWZhY3RvcmluZyB0aGlzIHRvIHN1cHBvcnRcbiAgICAgIC8vIFR5cGVTY3JpcHQsIGFuZCBhIG51bWJlciBvZiBzaW1zIGJyb2tlLiAgVGhlIGNvZGUgd2FzIHJldmlld2VkIGFuZCBkaXNjdXNzZWQgd2l0aCBzb21lIG90aGVyIGRldnMsIGFuZCB3ZVxuICAgICAgLy8gZGVjaWRlZCB0byBsZWF2ZSBpdCBhcyBpcywgZGVzcGl0ZSBpdCBiZWluZyBhIGJpdCB1bmludHVpdGl2ZS4gIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy83NzIuXG4gICAgICBjb25zdCBvdmVyU3Ryb2tlUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBvcHRpb25zLm92ZXJTdHJva2UgfHwgb3B0aW9ucy5kZXNlbGVjdGVkU3Ryb2tlLCB7XG4gICAgICAgIGx1bWluYW5jZUZhY3RvcjogcHJvdmlkZWRPcHRpb25zICYmIHByb3ZpZGVkT3B0aW9ucy5vdmVyU3Ryb2tlID8gMCA6IC0wLjRcbiAgICAgIH0gKTtcblxuICAgICAgdGhpcy5tYXhMaW5lV2lkdGggPSBNYXRoLm1heCggb3B0aW9ucy5zZWxlY3RlZExpbmVXaWR0aCwgb3B0aW9ucy5kZXNlbGVjdGVkTGluZVdpZHRoLCBvcHRpb25zLm92ZXJMaW5lV2lkdGggKTtcblxuICAgICAgLy8gQ2FjaGUgY29sb3JzXG4gICAgICBidXR0b25CYWNrZ3JvdW5kLmNhY2hlZFBhaW50cyA9IFtcbiAgICAgICAgYmFzZUNvbG9yUHJvcGVydHksIG92ZXJGaWxsUHJvcGVydHksIHByZXNzZWRGaWxsUHJvcGVydHksIG92ZXJTdHJva2VQcm9wZXJ0eSwgb3B0aW9ucy5zZWxlY3RlZFN0cm9rZSwgb3B0aW9ucy5kZXNlbGVjdGVkU3Ryb2tlXG4gICAgICBdO1xuXG4gICAgICAvLyBDaGFuZ2UgY29sb3JzIGFuZCBvcGFjaXR5IHRvIG1hdGNoIGludGVyYWN0aW9uU3RhdGVcbiAgICAgIGZ1bmN0aW9uIGludGVyYWN0aW9uU3RhdGVMaXN0ZW5lciggaW50ZXJhY3Rpb25TdGF0ZTogUmFkaW9CdXR0b25JbnRlcmFjdGlvblN0YXRlICk6IHZvaWQge1xuICAgICAgICBzd2l0Y2goIGludGVyYWN0aW9uU3RhdGUgKSB7XG5cbiAgICAgICAgICBjYXNlIFJhZGlvQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZS5TRUxFQ1RFRDpcbiAgICAgICAgICAgIGJ1dHRvbkJhY2tncm91bmQuZmlsbCA9IGJhc2VDb2xvclByb3BlcnR5O1xuICAgICAgICAgICAgYnV0dG9uQmFja2dyb3VuZC5zdHJva2UgPSBvcHRpb25zLnNlbGVjdGVkU3Ryb2tlO1xuICAgICAgICAgICAgYnV0dG9uQmFja2dyb3VuZC5saW5lV2lkdGggPSBvcHRpb25zLnNlbGVjdGVkTGluZVdpZHRoO1xuICAgICAgICAgICAgYnV0dG9uQmFja2dyb3VuZC5vcGFjaXR5ID0gb3B0aW9ucy5zZWxlY3RlZEJ1dHRvbk9wYWNpdHk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgUmFkaW9CdXR0b25JbnRlcmFjdGlvblN0YXRlLkRFU0VMRUNURUQ6XG4gICAgICAgICAgICBidXR0b25CYWNrZ3JvdW5kLmZpbGwgPSBvcHRpb25zLmRlc2VsZWN0ZWRGaWxsIHx8IGJhc2VDb2xvclByb3BlcnR5O1xuICAgICAgICAgICAgYnV0dG9uQmFja2dyb3VuZC5zdHJva2UgPSBvcHRpb25zLmRlc2VsZWN0ZWRTdHJva2U7XG4gICAgICAgICAgICBidXR0b25CYWNrZ3JvdW5kLmxpbmVXaWR0aCA9IG9wdGlvbnMuZGVzZWxlY3RlZExpbmVXaWR0aDtcbiAgICAgICAgICAgIGJ1dHRvbkJhY2tncm91bmQub3BhY2l0eSA9IG9wdGlvbnMuZGVzZWxlY3RlZEJ1dHRvbk9wYWNpdHk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgUmFkaW9CdXR0b25JbnRlcmFjdGlvblN0YXRlLk9WRVI6XG4gICAgICAgICAgICBidXR0b25CYWNrZ3JvdW5kLmZpbGwgPSBvdmVyRmlsbFByb3BlcnR5O1xuICAgICAgICAgICAgYnV0dG9uQmFja2dyb3VuZC5zdHJva2UgPSBvdmVyU3Ryb2tlUHJvcGVydHk7XG4gICAgICAgICAgICBidXR0b25CYWNrZ3JvdW5kLmxpbmVXaWR0aCA9IE1hdGgubWF4KCBvcHRpb25zLm92ZXJMaW5lV2lkdGgsIG9wdGlvbnMuZGVzZWxlY3RlZExpbmVXaWR0aCApO1xuICAgICAgICAgICAgYnV0dG9uQmFja2dyb3VuZC5vcGFjaXR5ID0gb3B0aW9ucy5vdmVyQnV0dG9uT3BhY2l0eTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSBSYWRpb0J1dHRvbkludGVyYWN0aW9uU3RhdGUuUFJFU1NFRDpcbiAgICAgICAgICAgIGJ1dHRvbkJhY2tncm91bmQuZmlsbCA9IHByZXNzZWRGaWxsUHJvcGVydHk7XG4gICAgICAgICAgICBidXR0b25CYWNrZ3JvdW5kLnN0cm9rZSA9IG9wdGlvbnMuZGVzZWxlY3RlZFN0cm9rZTtcbiAgICAgICAgICAgIGJ1dHRvbkJhY2tncm91bmQubGluZVdpZHRoID0gb3B0aW9ucy5kZXNlbGVjdGVkTGluZVdpZHRoO1xuICAgICAgICAgICAgYnV0dG9uQmFja2dyb3VuZC5vcGFjaXR5ID0gb3B0aW9ucy5zZWxlY3RlZEJ1dHRvbk9wYWNpdHk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGB1bnN1cHBvcnRlZCBpbnRlcmFjdGlvblN0YXRlOiAke2ludGVyYWN0aW9uU3RhdGV9YCApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eS5saW5rKCBpbnRlcmFjdGlvblN0YXRlTGlzdGVuZXIgKTtcblxuICAgICAgdGhpcy5kaXNwb3NlRmxhdEFwcGVhcmFuY2VTdHJhdGVneSA9ICgpID0+IHtcbiAgICAgICAgaWYgKCBpbnRlcmFjdGlvblN0YXRlUHJvcGVydHkuaGFzTGlzdGVuZXIoIGludGVyYWN0aW9uU3RhdGVMaXN0ZW5lciApICkge1xuICAgICAgICAgIGludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eS51bmxpbmsoIGludGVyYWN0aW9uU3RhdGVMaXN0ZW5lciApO1xuICAgICAgICB9XG4gICAgICAgIG92ZXJTdHJva2VQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgICAgIG92ZXJGaWxsUHJvcGVydHkuZGlzcG9zZSgpO1xuICAgICAgICBwcmVzc2VkRmlsbFByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgICB0aGlzLmRpc3Bvc2VGbGF0QXBwZWFyYW5jZVN0cmF0ZWd5KCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBDb250ZW50QXBwZWFyYW5jZVN0cmF0ZWd5IGlzIGEgdmFsdWUgZm9yIFJlY3Rhbmd1bGFyUmFkaW9CdXR0b24gb3B0aW9ucy5jb250ZW50QXBwZWFyYW5jZVN0cmF0ZWd5LiBJdCBjaGFuZ2VzXG4gICAqIHRoZWlyIGxvb2sgYmFzZWQgb24gdGhlIHZhbHVlIG9mIGludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgQ29udGVudEFwcGVhcmFuY2VTdHJhdGVneTogVENvbnRlbnRBcHBlYXJhbmNlU3RyYXRlZ3kgPSBjbGFzcyBDb250ZW50QXBwZWFyYW5jZVN0cmF0ZWd5IHtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUNvbnRlbnRBcHBlYXJhbmNlU3RyYXRlZ3k6ICgpID0+IHZvaWQ7XG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IoIGNvbnRlbnQ6IE5vZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlcmFjdGlvblN0YXRlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PFJhZGlvQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZT4sXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM/OiBUQ29udGVudEFwcGVhcmFuY2VTdHJhdGVneU9wdGlvbnMgKSB7XG5cbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8VENvbnRlbnRBcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zPigpKCB7XG4gICAgICAgIGRlc2VsZWN0ZWRDb250ZW50T3BhY2l0eTogMSxcbiAgICAgICAgb3ZlckNvbnRlbnRPcGFjaXR5OiAxLFxuICAgICAgICBzZWxlY3RlZENvbnRlbnRPcGFjaXR5OiAxXG4gICAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgICAgLy8gVGhlIGJ1dHRvbiBpcyBub3QgdGhlIHBhcmVudCBvZiB0aGUgY29udGVudCwgdGhlcmVmb3JlIGl0IGlzIG5lY2Vzc2FyeSB0byBzZXQgdGhlIG9wYWNpdHkgb24gdGhlIGNvbnRlbnQgc2VwYXJhdGVseVxuICAgICAgZnVuY3Rpb24gaGFuZGxlSW50ZXJhY3Rpb25TdGF0ZUNoYW5nZWQoIHN0YXRlOiBSYWRpb0J1dHRvbkludGVyYWN0aW9uU3RhdGUgKTogdm9pZCB7XG4gICAgICAgIGlmICggY29udGVudCAhPT0gbnVsbCApIHtcbiAgICAgICAgICBzd2l0Y2goIHN0YXRlICkge1xuXG4gICAgICAgICAgICBjYXNlIFJhZGlvQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZS5ERVNFTEVDVEVEOlxuICAgICAgICAgICAgICBjb250ZW50Lm9wYWNpdHkgPSBvcHRpb25zLmRlc2VsZWN0ZWRDb250ZW50T3BhY2l0eTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIC8vIG1vdXNlb3ZlciBmb3IgZGVzZWxlY3RlZCBidXR0b25zXG4gICAgICAgICAgICBjYXNlIFJhZGlvQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZS5PVkVSOlxuICAgICAgICAgICAgICBjb250ZW50Lm9wYWNpdHkgPSBvcHRpb25zLm92ZXJDb250ZW50T3BhY2l0eTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgUmFkaW9CdXR0b25JbnRlcmFjdGlvblN0YXRlLlNFTEVDVEVEOlxuICAgICAgICAgICAgICBjb250ZW50Lm9wYWNpdHkgPSBvcHRpb25zLnNlbGVjdGVkQ29udGVudE9wYWNpdHk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFJhZGlvQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZS5QUkVTU0VEOlxuICAgICAgICAgICAgICBjb250ZW50Lm9wYWNpdHkgPSBvcHRpb25zLmRlc2VsZWN0ZWRDb250ZW50T3BhY2l0eTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciggYHVuc3VwcG9ydGVkIHN0YXRlOiAke3N0YXRlfWAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5LmxpbmsoIGhhbmRsZUludGVyYWN0aW9uU3RhdGVDaGFuZ2VkICk7XG5cbiAgICAgIHRoaXMuZGlzcG9zZUNvbnRlbnRBcHBlYXJhbmNlU3RyYXRlZ3kgPSAoKSA9PiB7XG4gICAgICAgIGlmICggaW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5Lmhhc0xpc3RlbmVyKCBoYW5kbGVJbnRlcmFjdGlvblN0YXRlQ2hhbmdlZCApICkge1xuICAgICAgICAgIGludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eS51bmxpbmsoIGhhbmRsZUludGVyYWN0aW9uU3RhdGVDaGFuZ2VkICk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgICB0aGlzLmRpc3Bvc2VDb250ZW50QXBwZWFyYW5jZVN0cmF0ZWd5KCk7XG4gICAgfVxuICB9O1xufVxuXG5zdW4ucmVnaXN0ZXIoICdSZWN0YW5ndWxhclJhZGlvQnV0dG9uJywgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbiApOyJdLCJuYW1lcyI6WyJFbWl0dGVyIiwib3B0aW9uaXplIiwiYXNzZXJ0Tm9BZGRpdGlvbmFsQ2hpbGRyZW4iLCJDb2xvciIsIlBhaW50Q29sb3JQcm9wZXJ0eSIsInNoYXJlZFNvdW5kUGxheWVycyIsIkV2ZW50VHlwZSIsIlBoZXRpb09iamVjdCIsIlRhbmRlbSIsIkNvbG9yQ29uc3RhbnRzIiwic3VuIiwiQnV0dG9uTW9kZWwiLCJSYWRpb0J1dHRvbkludGVyYWN0aW9uU3RhdGUiLCJSYWRpb0J1dHRvbkludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eSIsIlJlY3Rhbmd1bGFyQnV0dG9uIiwiUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbiIsImRpc3Bvc2UiLCJkaXNwb3NlUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbiIsImZpcmUiLCJidXR0b25Nb2RlbCIsImVuYWJsZWRQcm9wZXJ0eSIsImdldCIsImZpcmVkRW1pdHRlciIsImVtaXQiLCJwcm9kdWNlU291bmRFbWl0dGVyIiwicHJvcGVydHkiLCJ2YWx1ZSIsInByb3ZpZGVkT3B0aW9ucyIsImFzc2VydCIsInZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5Iiwib3B0aW9ucyIsInNvdW5kUGxheWVyIiwiYmFzZUNvbG9yIiwiTElHSFRfQkxVRSIsImJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneSIsIkZsYXRBcHBlYXJhbmNlU3RyYXRlZ3kiLCJidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zIiwib3ZlckJ1dHRvbk9wYWNpdHkiLCJvdmVyU3Ryb2tlIiwic2VsZWN0ZWRTdHJva2UiLCJCTEFDSyIsInNlbGVjdGVkTGluZVdpZHRoIiwic2VsZWN0ZWRCdXR0b25PcGFjaXR5IiwiZGVzZWxlY3RlZFN0cm9rZSIsImRlc2VsZWN0ZWRMaW5lV2lkdGgiLCJkZXNlbGVjdGVkQnV0dG9uT3BhY2l0eSIsImNvbnRlbnRBcHBlYXJhbmNlU3RyYXRlZ3kiLCJDb250ZW50QXBwZWFyYW5jZVN0cmF0ZWd5IiwiY29udGVudEFwcGVhcmFuY2VTdHJhdGVneU9wdGlvbnMiLCJvdmVyQ29udGVudE9wYWNpdHkiLCJzZWxlY3RlZENvbnRlbnRPcGFjaXR5IiwiZGVzZWxlY3RlZENvbnRlbnRPcGFjaXR5IiwidGFnTmFtZSIsImlucHV0VHlwZSIsImxhYmVsVGFnTmFtZSIsImNvbnRhaW5lclRhZ05hbWUiLCJhcHBlbmREZXNjcmlwdGlvbiIsImFwcGVuZExhYmVsIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJ0YW5kZW1OYW1lU3VmZml4IiwicGhldGlvUmVhZE9ubHkiLCJERUZBVUxUX09QVElPTlMiLCJlbmFibGVkUHJvcGVydHlPcHRpb25zIiwicGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwiaW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5Iiwic2V0UERPTUF0dHJpYnV0ZSIsInBkb21DaGVja2VkTGlzdGVuZXIiLCJuZXdWYWx1ZSIsInBkb21DaGVja2VkIiwibGluayIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJwaGV0aW9FdmVudFR5cGUiLCJVU0VSIiwiYWRkTGlzdGVuZXIiLCJzZXQiLCJkb3duUHJvcGVydHkiLCJkb3duIiwib3ZlclByb3BlcnR5IiwiZm9jdXNlZFByb3BlcnR5IiwiaW50ZXJydXB0ZWQiLCJ2b2ljaW5nU3BlYWtGdWxsUmVzcG9uc2UiLCJoaW50UmVzcG9uc2UiLCJwbGF5U291bmQiLCJwbGF5IiwidW5saW5rIiwicmVtb3ZlTGlzdGVuZXIiLCJkaXNwb3NlRmxhdEFwcGVhcmFuY2VTdHJhdGVneSIsImJ1dHRvbkJhY2tncm91bmQiLCJiYXNlQ29sb3JQcm9wZXJ0eSIsInN0cm9rZSIsImxpbmVXaWR0aCIsImRlc2VsZWN0ZWRGaWxsIiwib3ZlckZpbGwiLCJvdmVyTGluZVdpZHRoIiwicHJlc3NlZEZpbGxQcm9wZXJ0eSIsImx1bWluYW5jZUZhY3RvciIsIm92ZXJGaWxsUHJvcGVydHkiLCJvdmVyU3Ryb2tlUHJvcGVydHkiLCJtYXhMaW5lV2lkdGgiLCJNYXRoIiwibWF4IiwiY2FjaGVkUGFpbnRzIiwiaW50ZXJhY3Rpb25TdGF0ZUxpc3RlbmVyIiwiaW50ZXJhY3Rpb25TdGF0ZSIsIlNFTEVDVEVEIiwiZmlsbCIsIm9wYWNpdHkiLCJERVNFTEVDVEVEIiwiT1ZFUiIsIlBSRVNTRUQiLCJFcnJvciIsImhhc0xpc3RlbmVyIiwiZGlzcG9zZUNvbnRlbnRBcHBlYXJhbmNlU3RyYXRlZ3kiLCJjb250ZW50IiwiaGFuZGxlSW50ZXJhY3Rpb25TdGF0ZUNoYW5nZWQiLCJzdGF0ZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxhQUFhLDhCQUE4QjtBQUlsRCxPQUFPQyxlQUFlLHFDQUFxQztBQUUzRCxTQUFTQywwQkFBMEIsRUFBRUMsS0FBSyxFQUF1QkMsa0JBQWtCLFFBQWdDLGlDQUFpQztBQUNwSixPQUFPQyx3QkFBd0IsMENBQTBDO0FBRXpFLE9BQU9DLGVBQWUsa0NBQWtDO0FBQ3hELE9BQU9DLGtCQUFrQixxQ0FBcUM7QUFDOUQsT0FBT0MsWUFBWSwrQkFBK0I7QUFDbEQsT0FBT0Msb0JBQW9CLHVCQUF1QjtBQUNsRCxPQUFPQyxTQUFTLFlBQVk7QUFDNUIsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQUMzQyxPQUFPQyxpQ0FBaUMsbUNBQW1DO0FBQzNFLE9BQU9DLHlDQUF5QywyQ0FBMkM7QUFDM0YsT0FBT0Ms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