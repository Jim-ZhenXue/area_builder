// Copyright 2013-2024, University of Colorado Boulder
/**
 * Checkbox is a typical checkbox UI component.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import validate from '../../axon/js/validate.js';
import { m3 } from '../../dot/js/Matrix3.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import { assertNoAdditionalChildren, FireListener, LayoutConstraint, Node, Path, PDOMUtils, Rectangle, SceneryConstants, Voicing, WidthSizable } from '../../scenery/js/imports.js';
import checkEmptySolidShape from '../../sherpa/js/fontawesome-4/checkEmptySolidShape.js';
import checkSquareOSolidShape from '../../sherpa/js/fontawesome-4/checkSquareOSolidShape.js';
import sharedSoundPlayers from '../../tambo/js/sharedSoundPlayers.js';
import EventType from '../../tandem/js/EventType.js';
import PhetioAction from '../../tandem/js/PhetioAction.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import Utterance from '../../utterance-queue/js/Utterance.js';
import sun from './sun.js';
// constants
const BOOLEAN_VALIDATOR = {
    valueType: 'boolean'
};
const SHAPE_MATRIX = m3(0.025, 0, 0, 0, -0.025, 0, 0, 0, 1); // to create a unity-scale icon
const uncheckedShape = checkEmptySolidShape.transformed(SHAPE_MATRIX);
const checkedShape = checkSquareOSolidShape.transformed(SHAPE_MATRIX);
let Checkbox = class Checkbox extends WidthSizable(Voicing(Node)) {
    dispose() {
        this.constraint.dispose();
        this.disposeCheckbox();
        super.dispose();
    }
    /**
   * Sets the background color of the checkbox.
   */ setCheckboxColorBackground(value) {
        this.backgroundNode.fill = value;
    }
    set checkboxColorBackground(value) {
        this.setCheckboxColorBackground(value);
    }
    get checkboxColorBackground() {
        return this.getCheckboxColorBackground();
    }
    /**
   * Gets the background color of the checkbox.
   */ getCheckboxColorBackground() {
        return this.backgroundNode.fill;
    }
    /**
   * Sets the color of the checkbox.
   */ setCheckboxColor(value) {
        this.checkedNode.fill = this.uncheckedNode.fill = value;
    }
    set checkboxColor(value) {
        this.setCheckboxColor(value);
    }
    get checkboxColor() {
        return this.getCheckboxColor();
    }
    /**
   * Gets the color of the checkbox.
   */ getCheckboxColor() {
        return this.checkedNode.fill;
    }
    setMouseArea(area) {
        if (!this._isSettingAreas) {
            this._isMouseAreaCustomized = true;
        }
        return super.setMouseArea(area);
    }
    setTouchArea(area) {
        if (!this._isSettingAreas) {
            this._isTouchAreaCustomized = true;
        }
        return super.setTouchArea(area);
    }
    constructor(property, content, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        const options = optionize()({
            // CheckboxOptions
            spacing: 5,
            boxWidth: 21,
            checkboxColor: 'black',
            checkboxColorBackground: 'white',
            touchAreaXDilation: 0,
            touchAreaYDilation: 0,
            mouseAreaXDilation: 0,
            mouseAreaYDilation: 0,
            checkedSoundPlayer: sharedSoundPlayers.get('checkboxChecked'),
            uncheckedSoundPlayer: sharedSoundPlayers.get('checkboxUnchecked'),
            phetioLinkProperty: true,
            // NodeOptions
            cursor: 'pointer',
            disabledOpacity: SceneryConstants.DISABLED_OPACITY,
            // phet-io
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'Checkbox',
            phetioEventType: EventType.USER,
            visiblePropertyOptions: {
                phetioFeatured: true
            },
            phetioEnabledPropertyInstrumented: true,
            // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
            phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly,
            phetioFeatured: true,
            // pdom
            tagName: 'input',
            inputType: 'checkbox',
            appendDescription: true,
            // voicing
            voicingCheckedObjectResponse: null,
            voicingUncheckedObjectResponse: null,
            // Utterances to be spoken with a screen reader after the checkbox is pressed. Also used for
            // the voicingContextResponse
            checkedContextResponse: null,
            uncheckedContextResponse: null,
            voiceNameResponseOnSelection: true
        }, providedOptions);
        super(), // We need to record if the mouse/touch areas are customized, so that we can avoid overwriting them.
        // public for use by CheckboxConstraint only!
        this._isMouseAreaCustomized = false, this._isTouchAreaCustomized = false, this._isSettingAreas = false;
        // sends out notifications when the checkbox is toggled.
        const toggleAction = new PhetioAction(()=>{
            property.value = !property.value;
            validate(property.value, BOOLEAN_VALIDATOR);
            if (property.value) {
                options.checkedSoundPlayer.play();
                options.checkedContextResponse && this.alertDescriptionUtterance(options.checkedContextResponse);
                this.voicingSpeakResponse({
                    nameResponse: options.voiceNameResponseOnSelection ? this.voicingNameResponse : null,
                    objectResponse: Utterance.alertableToText(options.voicingCheckedObjectResponse),
                    contextResponse: Utterance.alertableToText(options.checkedContextResponse)
                });
            } else {
                options.uncheckedSoundPlayer.play();
                options.uncheckedContextResponse && this.alertDescriptionUtterance(options.uncheckedContextResponse);
                this.voicingSpeakResponse({
                    nameResponse: options.voiceNameResponseOnSelection ? this.voicingNameResponse : null,
                    objectResponse: Utterance.alertableToText(options.voicingUncheckedObjectResponse),
                    contextResponse: Utterance.alertableToText(options.uncheckedContextResponse)
                });
            }
        }, {
            parameters: [],
            tandem: options.tandem.createTandem('toggleAction'),
            phetioDocumentation: 'Emits when user input causes the checkbox to toggle, emitting a single arg: ' + 'the new boolean value of the checkbox state.',
            phetioReadOnly: true,
            phetioEventType: EventType.USER
        });
        // Create the background.
        // Until we are creating our own shapes, just put a rectangle behind the font awesome checkbox icons.
        this.backgroundNode = new Rectangle(0, -options.boxWidth, options.boxWidth * 0.95, options.boxWidth * 0.95, options.boxWidth * 0.2, options.boxWidth * 0.2, {
            fill: options.checkboxColorBackground
        });
        this.uncheckedNode = new Path(uncheckedShape, {
            fill: options.checkboxColor
        });
        const iconScale = options.boxWidth / this.uncheckedNode.width;
        this.uncheckedNode.scale(iconScale);
        this.checkedNode = new Path(checkedShape, {
            scale: iconScale,
            fill: options.checkboxColor
        });
        const checkboxNode = new Node({
            children: [
                this.backgroundNode,
                this.checkedNode,
                this.uncheckedNode
            ]
        });
        // put a rectangle on top of everything to prevent dead zones when clicking
        const rectangle = new Rectangle({});
        this.children = [
            checkboxNode,
            content,
            rectangle
        ];
        this.constraint = new CheckboxConstraint(this, checkboxNode, this.checkedNode, content, rectangle, options);
        this.constraint.updateLayout();
        content.pickable = false; // since there's a pickable rectangle on top of content
        // In case the content is an instance of a focusable Node. Checkbox icon should not be in the traversal order.
        content.pdomVisible = false;
        // interactivity
        const fireListener = new FireListener({
            fire: ()=>toggleAction.execute(),
            tandem: options.tandem.createTandem('fireListener')
        });
        this.addInputListener(fireListener);
        // sync with property
        const checkboxCheckedListener = (checked)=>{
            this.checkedNode.visible = checked;
            this.uncheckedNode.visible = !checked;
            this.pdomChecked = checked;
        };
        property.link(checkboxCheckedListener);
        // Apply additional options
        this.mutate(options);
        // pdom - to prevent a bug with NVDA and Firefox where the label sibling receives two click events, see
        // https://github.com/phetsims/gravity-force-lab/issues/257
        this.setExcludeLabelSiblingFromInput();
        // If no accessibleName is provided, look for one in the content Node
        if (!options.accessibleName) {
            this.accessibleName = PDOMUtils.findStringProperty(content);
        }
        // must be after the Checkbox is instrumented
        options.phetioLinkProperty && this.addLinkedElement(property, {
            tandemName: 'property'
        });
        if (assert && Tandem.VALIDATION && this.isPhetioInstrumented()) {
            assert && assert(property.isPhetioInstrumented(), 'Property should be instrumented if Checkbox is instrumented');
            assert && assert(options.phetioLinkProperty, 'Property should be linked if Checkbox is instrumented');
            if (this.phetioFeatured) {
                assert && assert(property.phetioFeatured, `Property should be featured if the controlling Checkbox is featured: ${property.phetioID}`);
            }
        }
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('sun', 'Checkbox', this);
        // Decorating Checkbox with additional content is an anti-pattern, see https://github.com/phetsims/sun/issues/860
        assert && assertNoAdditionalChildren(this);
        this.disposeCheckbox = ()=>{
            rectangle.dispose();
            this.backgroundNode.dispose();
            this.uncheckedNode.dispose();
            this.checkedNode.dispose();
            checkboxNode.dispose();
            fireListener.dispose();
            if (property.hasListener(checkboxCheckedListener)) {
                property.unlink(checkboxCheckedListener);
            }
            // Private to Checkbox, but we need to clean up tandem.
            toggleAction.dispose();
        };
    }
};
export { Checkbox as default };
let CheckboxConstraint = class CheckboxConstraint extends LayoutConstraint {
    layout() {
        super.layout();
        // LayoutProxy helps with some layout operations, and will support a non-child content.
        const contentProxy = this.createLayoutProxy(this.content);
        // Should only happen when we are disconnected during disposal
        if (!contentProxy) {
            return;
        }
        const contentWidth = contentProxy.minimumWidth;
        // Our bounds are based on checkboxNode, but our layout is relative to checkedNode
        const checkboxWithoutSpacingWidth = this.checkedNode.right - this.checkboxNode.left;
        const minimumWidth = checkboxWithoutSpacingWidth + this.options.spacing + contentWidth;
        const preferredWidth = Math.max(minimumWidth, this.checkbox.localPreferredWidth || 0);
        contentProxy.preferredWidth = preferredWidth - checkboxWithoutSpacingWidth - this.options.spacing;
        // For now just position content. Future updates could include widthResizable content?
        contentProxy.left = this.checkedNode.right + this.options.spacing;
        contentProxy.centerY = this.checkedNode.centerY;
        // Our rectangle bounds will cover the checkboxNode and content, and if necessary expand to include the full
        // preferredWidth
        this.rectangle.rectBounds = this.checkboxNode.bounds.union(contentProxy.bounds).withMaxX(Math.max(this.checkboxNode.left + preferredWidth, contentProxy.right));
        // Update pointer areas (if the client hasn't customized them)
        this.checkbox._isSettingAreas = true;
        if (!this.checkbox._isTouchAreaCustomized) {
            this.checkbox.touchArea = this.checkbox.localBounds.dilatedXY(this.options.touchAreaXDilation, this.options.touchAreaYDilation);
        }
        if (!this.checkbox._isMouseAreaCustomized) {
            this.checkbox.mouseArea = this.checkbox.localBounds.dilatedXY(this.options.mouseAreaXDilation, this.options.mouseAreaYDilation);
        }
        this.checkbox._isSettingAreas = false;
        contentProxy.dispose();
        // Set the minimumWidth last, since this may trigger a relayout
        this.checkbox.localMinimumWidth = minimumWidth;
    }
    dispose() {
        this.checkbox.localPreferredWidthProperty.unlink(this._updateLayoutListener);
        super.dispose();
    }
    constructor(checkbox, checkboxNode, checkedNode, content, rectangle, options){
        super(checkbox);
        this.checkbox = checkbox;
        this.checkboxNode = checkboxNode;
        this.checkedNode = checkedNode;
        this.content = content;
        this.rectangle = rectangle;
        this.options = options;
        this.checkbox.localPreferredWidthProperty.lazyLink(this._updateLayoutListener);
        this.addNode(content);
    }
};
sun.register('Checkbox', Checkbox);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9DaGVja2JveC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDaGVja2JveCBpcyBhIHR5cGljYWwgY2hlY2tib3ggVUkgY29tcG9uZW50LlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IFBoZXRpb1Byb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUGhldGlvUHJvcGVydHkuanMnO1xuaW1wb3J0IHZhbGlkYXRlIGZyb20gJy4uLy4uL2F4b24vanMvdmFsaWRhdGUuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IHsgbTMgfSBmcm9tICcuLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgSW5zdGFuY2VSZWdpc3RyeSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvZG9jdW1lbnRhdGlvbi9JbnN0YW5jZVJlZ2lzdHJ5LmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBhc3NlcnROb0FkZGl0aW9uYWxDaGlsZHJlbiwgRmlyZUxpc3RlbmVyLCBMYXlvdXRDb25zdHJhaW50LCBOb2RlLCBOb2RlT3B0aW9ucywgUGF0aCwgUERPTVV0aWxzLCBSZWN0YW5nbGUsIFNjZW5lcnlDb25zdGFudHMsIFRQYWludCwgVm9pY2luZywgVm9pY2luZ09wdGlvbnMsIFdpZHRoU2l6YWJsZSwgV2lkdGhTaXphYmxlT3B0aW9ucyB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgY2hlY2tFbXB0eVNvbGlkU2hhcGUgZnJvbSAnLi4vLi4vc2hlcnBhL2pzL2ZvbnRhd2Vzb21lLTQvY2hlY2tFbXB0eVNvbGlkU2hhcGUuanMnO1xuaW1wb3J0IGNoZWNrU3F1YXJlT1NvbGlkU2hhcGUgZnJvbSAnLi4vLi4vc2hlcnBhL2pzL2ZvbnRhd2Vzb21lLTQvY2hlY2tTcXVhcmVPU29saWRTaGFwZS5qcyc7XG5pbXBvcnQgc2hhcmVkU291bmRQbGF5ZXJzIGZyb20gJy4uLy4uL3RhbWJvL2pzL3NoYXJlZFNvdW5kUGxheWVycy5qcyc7XG5pbXBvcnQgVFNvdW5kUGxheWVyIGZyb20gJy4uLy4uL3RhbWJvL2pzL1RTb3VuZFBsYXllci5qcyc7XG5pbXBvcnQgRXZlbnRUeXBlIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9FdmVudFR5cGUuanMnO1xuaW1wb3J0IFBoZXRpb0FjdGlvbiBmcm9tICcuLi8uLi90YW5kZW0vanMvUGhldGlvQWN0aW9uLmpzJztcbmltcG9ydCBQaGV0aW9PYmplY3QgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IFV0dGVyYW5jZSwgeyBUQWxlcnRhYmxlIH0gZnJvbSAnLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL1V0dGVyYW5jZS5qcyc7XG5pbXBvcnQgc3VuIGZyb20gJy4vc3VuLmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBCT09MRUFOX1ZBTElEQVRPUiA9IHsgdmFsdWVUeXBlOiAnYm9vbGVhbicgfTtcbmNvbnN0IFNIQVBFX01BVFJJWCA9IG0zKCAwLjAyNSwgMCwgMCwgMCwgLTAuMDI1LCAwLCAwLCAwLCAxICk7IC8vIHRvIGNyZWF0ZSBhIHVuaXR5LXNjYWxlIGljb25cbmNvbnN0IHVuY2hlY2tlZFNoYXBlID0gY2hlY2tFbXB0eVNvbGlkU2hhcGUudHJhbnNmb3JtZWQoIFNIQVBFX01BVFJJWCApO1xuY29uc3QgY2hlY2tlZFNoYXBlID0gY2hlY2tTcXVhcmVPU29saWRTaGFwZS50cmFuc2Zvcm1lZCggU0hBUEVfTUFUUklYICk7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIHNwYWNpbmc/OiBudW1iZXI7ICAvLyBzcGFjaW5nIGJldHdlZW4gYm94IGFuZCBjb250ZW50XG4gIGJveFdpZHRoPzogbnVtYmVyOyAvLyB3aWR0aCAoYW5kIGhlaWdodCkgb2YgdGhlIGJveFxuICBjaGVja2JveENvbG9yPzogVFBhaW50O1xuICBjaGVja2JveENvbG9yQmFja2dyb3VuZD86IFRQYWludDtcblxuICAvLyBwb2ludGVyIGFyZWFzXG4gIHRvdWNoQXJlYVhEaWxhdGlvbj86IG51bWJlcjtcbiAgdG91Y2hBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xuICBtb3VzZUFyZWFYRGlsYXRpb24/OiBudW1iZXI7XG4gIG1vdXNlQXJlYVlEaWxhdGlvbj86IG51bWJlcjtcblxuICAvLyBzb3VuZHNcbiAgY2hlY2tlZFNvdW5kUGxheWVyPzogVFNvdW5kUGxheWVyO1xuICB1bmNoZWNrZWRTb3VuZFBsYXllcj86IFRTb3VuZFBsYXllcjtcblxuICAvLyBVdHRlcmFuY2VzIHRvIGJlIHNwb2tlbiB3aXRoIGEgc2NyZWVuIHJlYWRlciBhZnRlciB0aGUgY2hlY2tib3ggaXMgcHJlc3NlZC4gQWxzbyB1c2VkIGZvciB0aGUgdm9pY2luZ0NvbnRleHRSZXNwb25zZS5cbiAgY2hlY2tlZENvbnRleHRSZXNwb25zZT86IFRBbGVydGFibGU7XG4gIHVuY2hlY2tlZENvbnRleHRSZXNwb25zZT86IFRBbGVydGFibGU7XG5cbiAgLy8gQnkgZGVmYXVsdCB2b2ljZSB0aGUgbmFtZSByZXNwb25zZSBvbiBjaGVja2JveCBjaGFuZ2UgKHdpdGggdGhlIGNvbnRleHQgcmVzcG9uc2UpLCBidXQgb3B0aW9uYWxseSB0dXJuIGl0IG9mZiBoZXJlLlxuICB2b2ljZU5hbWVSZXNwb25zZU9uU2VsZWN0aW9uPzogYm9vbGVhbjtcblxuICAvLyBPdXRwdXQgZGVzY3JpYmluZyB0aGUgc3RhdGUgb2YgdGhlIENoZWNrYm94IGFmdGVyIGl0IGlzIHByZXNzZWQgdXNpbmcgdGhlIFZvaWNpbmcgZmVhdHVyZS4gTGlrZSBcIkNoZWNrZWRcIiBvclxuICAvLyBcIkxvY2tlZFwiLiBOb3QgdXN1YWxseSBuZWVkZWQsIGRlZmF1bHQgaXMgbnVsbC5cbiAgdm9pY2luZ0NoZWNrZWRPYmplY3RSZXNwb25zZT86IFRBbGVydGFibGU7XG4gIHZvaWNpbmdVbmNoZWNrZWRPYmplY3RSZXNwb25zZT86IFRBbGVydGFibGU7XG5cbiAgLy8gd2hldGhlciBhIFBoRVQtaU8gbGluayB0byB0aGUgY2hlY2tib3gncyBQcm9wZXJ0eSBpcyBjcmVhdGVkXG4gIHBoZXRpb0xpbmtQcm9wZXJ0eT86IGJvb2xlYW47XG59O1xuXG50eXBlIFBhcmVudE9wdGlvbnMgPSBXaWR0aFNpemFibGVPcHRpb25zICYgVm9pY2luZ09wdGlvbnMgJiBOb2RlT3B0aW9ucztcblxuZXhwb3J0IHR5cGUgQ2hlY2tib3hPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PFBhcmVudE9wdGlvbnMsICdjaGlsZHJlbicgfCAnbW91c2VBcmVhJyB8ICd0b3VjaEFyZWEnPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hlY2tib3ggZXh0ZW5kcyBXaWR0aFNpemFibGUoIFZvaWNpbmcoIE5vZGUgKSApIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGJhY2tncm91bmROb2RlOiBSZWN0YW5nbGU7XG4gIHByaXZhdGUgcmVhZG9ubHkgY2hlY2tlZE5vZGU6IFBhdGg7XG4gIHByaXZhdGUgcmVhZG9ubHkgdW5jaGVja2VkTm9kZTogUGF0aDtcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlQ2hlY2tib3g6ICgpID0+IHZvaWQ7XG5cbiAgLy8gV2UgbmVlZCB0byByZWNvcmQgaWYgdGhlIG1vdXNlL3RvdWNoIGFyZWFzIGFyZSBjdXN0b21pemVkLCBzbyB0aGF0IHdlIGNhbiBhdm9pZCBvdmVyd3JpdGluZyB0aGVtLlxuICAvLyBwdWJsaWMgZm9yIHVzZSBieSBDaGVja2JveENvbnN0cmFpbnQgb25seSFcbiAgcHVibGljIF9pc01vdXNlQXJlYUN1c3RvbWl6ZWQgPSBmYWxzZTtcbiAgcHVibGljIF9pc1RvdWNoQXJlYUN1c3RvbWl6ZWQgPSBmYWxzZTtcbiAgcHVibGljIF9pc1NldHRpbmdBcmVhcyA9IGZhbHNlO1xuXG4gIC8vIEhhbmRsZXMgbGF5b3V0IG9mIHRoZSBjb250ZW50LCByZWN0YW5nbGVzIGFuZCBtb3VzZS90b3VjaCBhcmVhc1xuICBwcml2YXRlIHJlYWRvbmx5IGNvbnN0cmFpbnQ6IENoZWNrYm94Q29uc3RyYWludDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3BlcnR5OiBQaGV0aW9Qcm9wZXJ0eTxib29sZWFuPiwgY29udGVudDogTm9kZSwgcHJvdmlkZWRPcHRpb25zPzogQ2hlY2tib3hPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxDaGVja2JveE9wdGlvbnMsIFNlbGZPcHRpb25zLCBQYXJlbnRPcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIENoZWNrYm94T3B0aW9uc1xuICAgICAgc3BhY2luZzogNSxcbiAgICAgIGJveFdpZHRoOiAyMSxcbiAgICAgIGNoZWNrYm94Q29sb3I6ICdibGFjaycsXG4gICAgICBjaGVja2JveENvbG9yQmFja2dyb3VuZDogJ3doaXRlJyxcbiAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogMCxcbiAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogMCxcbiAgICAgIG1vdXNlQXJlYVhEaWxhdGlvbjogMCxcbiAgICAgIG1vdXNlQXJlYVlEaWxhdGlvbjogMCxcbiAgICAgIGNoZWNrZWRTb3VuZFBsYXllcjogc2hhcmVkU291bmRQbGF5ZXJzLmdldCggJ2NoZWNrYm94Q2hlY2tlZCcgKSxcbiAgICAgIHVuY2hlY2tlZFNvdW5kUGxheWVyOiBzaGFyZWRTb3VuZFBsYXllcnMuZ2V0KCAnY2hlY2tib3hVbmNoZWNrZWQnICksXG4gICAgICBwaGV0aW9MaW5rUHJvcGVydHk6IHRydWUsXG5cbiAgICAgIC8vIE5vZGVPcHRpb25zXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgIGRpc2FibGVkT3BhY2l0eTogU2NlbmVyeUNvbnN0YW50cy5ESVNBQkxFRF9PUEFDSVRZLFxuXG4gICAgICAvLyBwaGV0LWlvXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcbiAgICAgIHRhbmRlbU5hbWVTdWZmaXg6ICdDaGVja2JveCcsXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSLFxuICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczogeyBwaGV0aW9GZWF0dXJlZDogdHJ1ZSB9LFxuICAgICAgcGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkOiB0cnVlLCAvLyBvcHQgaW50byBkZWZhdWx0IFBoRVQtaU8gaW5zdHJ1bWVudGVkIGVuYWJsZWRQcm9wZXJ0eVxuXG4gICAgICAvLyB0byBzdXBwb3J0IHByb3Blcmx5IHBhc3NpbmcgdGhpcyB0byBjaGlsZHJlbiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy90YW5kZW0vaXNzdWVzLzYwXG4gICAgICBwaGV0aW9SZWFkT25seTogUGhldGlvT2JqZWN0LkRFRkFVTFRfT1BUSU9OUy5waGV0aW9SZWFkT25seSxcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlLFxuXG4gICAgICAvLyBwZG9tXG4gICAgICB0YWdOYW1lOiAnaW5wdXQnLFxuICAgICAgaW5wdXRUeXBlOiAnY2hlY2tib3gnLFxuICAgICAgYXBwZW5kRGVzY3JpcHRpb246IHRydWUsXG5cbiAgICAgIC8vIHZvaWNpbmdcbiAgICAgIHZvaWNpbmdDaGVja2VkT2JqZWN0UmVzcG9uc2U6IG51bGwsXG4gICAgICB2b2ljaW5nVW5jaGVja2VkT2JqZWN0UmVzcG9uc2U6IG51bGwsXG5cbiAgICAgIC8vIFV0dGVyYW5jZXMgdG8gYmUgc3Bva2VuIHdpdGggYSBzY3JlZW4gcmVhZGVyIGFmdGVyIHRoZSBjaGVja2JveCBpcyBwcmVzc2VkLiBBbHNvIHVzZWQgZm9yXG4gICAgICAvLyB0aGUgdm9pY2luZ0NvbnRleHRSZXNwb25zZVxuICAgICAgY2hlY2tlZENvbnRleHRSZXNwb25zZTogbnVsbCxcbiAgICAgIHVuY2hlY2tlZENvbnRleHRSZXNwb25zZTogbnVsbCxcbiAgICAgIHZvaWNlTmFtZVJlc3BvbnNlT25TZWxlY3Rpb246IHRydWVcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIHN1cGVyKCk7XG5cbiAgICAvLyBzZW5kcyBvdXQgbm90aWZpY2F0aW9ucyB3aGVuIHRoZSBjaGVja2JveCBpcyB0b2dnbGVkLlxuICAgIGNvbnN0IHRvZ2dsZUFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oICgpID0+IHtcbiAgICAgIHByb3BlcnR5LnZhbHVlID0gIXByb3BlcnR5LnZhbHVlO1xuICAgICAgdmFsaWRhdGUoIHByb3BlcnR5LnZhbHVlLCBCT09MRUFOX1ZBTElEQVRPUiApO1xuICAgICAgaWYgKCBwcm9wZXJ0eS52YWx1ZSApIHtcbiAgICAgICAgb3B0aW9ucy5jaGVja2VkU291bmRQbGF5ZXIucGxheSgpO1xuICAgICAgICBvcHRpb25zLmNoZWNrZWRDb250ZXh0UmVzcG9uc2UgJiYgdGhpcy5hbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlKCBvcHRpb25zLmNoZWNrZWRDb250ZXh0UmVzcG9uc2UgKTtcbiAgICAgICAgdGhpcy52b2ljaW5nU3BlYWtSZXNwb25zZSgge1xuICAgICAgICAgIG5hbWVSZXNwb25zZTogb3B0aW9ucy52b2ljZU5hbWVSZXNwb25zZU9uU2VsZWN0aW9uID8gdGhpcy52b2ljaW5nTmFtZVJlc3BvbnNlIDogbnVsbCxcbiAgICAgICAgICBvYmplY3RSZXNwb25zZTogVXR0ZXJhbmNlLmFsZXJ0YWJsZVRvVGV4dCggb3B0aW9ucy52b2ljaW5nQ2hlY2tlZE9iamVjdFJlc3BvbnNlICksXG4gICAgICAgICAgY29udGV4dFJlc3BvbnNlOiBVdHRlcmFuY2UuYWxlcnRhYmxlVG9UZXh0KCBvcHRpb25zLmNoZWNrZWRDb250ZXh0UmVzcG9uc2UgKVxuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgb3B0aW9ucy51bmNoZWNrZWRTb3VuZFBsYXllci5wbGF5KCk7XG4gICAgICAgIG9wdGlvbnMudW5jaGVja2VkQ29udGV4dFJlc3BvbnNlICYmIHRoaXMuYWxlcnREZXNjcmlwdGlvblV0dGVyYW5jZSggb3B0aW9ucy51bmNoZWNrZWRDb250ZXh0UmVzcG9uc2UgKTtcbiAgICAgICAgdGhpcy52b2ljaW5nU3BlYWtSZXNwb25zZSgge1xuICAgICAgICAgIG5hbWVSZXNwb25zZTogb3B0aW9ucy52b2ljZU5hbWVSZXNwb25zZU9uU2VsZWN0aW9uID8gdGhpcy52b2ljaW5nTmFtZVJlc3BvbnNlIDogbnVsbCxcbiAgICAgICAgICBvYmplY3RSZXNwb25zZTogVXR0ZXJhbmNlLmFsZXJ0YWJsZVRvVGV4dCggb3B0aW9ucy52b2ljaW5nVW5jaGVja2VkT2JqZWN0UmVzcG9uc2UgKSxcbiAgICAgICAgICBjb250ZXh0UmVzcG9uc2U6IFV0dGVyYW5jZS5hbGVydGFibGVUb1RleHQoIG9wdGlvbnMudW5jaGVja2VkQ29udGV4dFJlc3BvbnNlIClcbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIHBhcmFtZXRlcnM6IFtdLFxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd0b2dnbGVBY3Rpb24nICksXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRW1pdHMgd2hlbiB1c2VyIGlucHV0IGNhdXNlcyB0aGUgY2hlY2tib3ggdG8gdG9nZ2xlLCBlbWl0dGluZyBhIHNpbmdsZSBhcmc6ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RoZSBuZXcgYm9vbGVhbiB2YWx1ZSBvZiB0aGUgY2hlY2tib3ggc3RhdGUuJyxcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLCAvLyBpbnRlcm9wZXJhYmlsaXR5IHNob3VsZCBiZSBkb25lIHRocm91Z2ggdGhlIFByb3BlcnR5LCB0aGlzIGlzIGp1c3QgZm9yIHRoZSBkYXRhIHN0cmVhbSBldmVudC5cbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVJcbiAgICB9ICk7XG5cbiAgICAvLyBDcmVhdGUgdGhlIGJhY2tncm91bmQuXG4gICAgLy8gVW50aWwgd2UgYXJlIGNyZWF0aW5nIG91ciBvd24gc2hhcGVzLCBqdXN0IHB1dCBhIHJlY3RhbmdsZSBiZWhpbmQgdGhlIGZvbnQgYXdlc29tZSBjaGVja2JveCBpY29ucy5cbiAgICB0aGlzLmJhY2tncm91bmROb2RlID0gbmV3IFJlY3RhbmdsZSggMCwgLW9wdGlvbnMuYm94V2lkdGgsIG9wdGlvbnMuYm94V2lkdGggKiAwLjk1LCBvcHRpb25zLmJveFdpZHRoICogMC45NSxcbiAgICAgIG9wdGlvbnMuYm94V2lkdGggKiAwLjIsIG9wdGlvbnMuYm94V2lkdGggKiAwLjIsIHtcbiAgICAgICAgZmlsbDogb3B0aW9ucy5jaGVja2JveENvbG9yQmFja2dyb3VuZFxuICAgICAgfSApO1xuXG4gICAgdGhpcy51bmNoZWNrZWROb2RlID0gbmV3IFBhdGgoIHVuY2hlY2tlZFNoYXBlLCB7XG4gICAgICBmaWxsOiBvcHRpb25zLmNoZWNrYm94Q29sb3JcbiAgICB9ICk7XG4gICAgY29uc3QgaWNvblNjYWxlID0gb3B0aW9ucy5ib3hXaWR0aCAvIHRoaXMudW5jaGVja2VkTm9kZS53aWR0aDtcbiAgICB0aGlzLnVuY2hlY2tlZE5vZGUuc2NhbGUoIGljb25TY2FsZSApO1xuXG4gICAgdGhpcy5jaGVja2VkTm9kZSA9IG5ldyBQYXRoKCBjaGVja2VkU2hhcGUsIHtcbiAgICAgIHNjYWxlOiBpY29uU2NhbGUsXG4gICAgICBmaWxsOiBvcHRpb25zLmNoZWNrYm94Q29sb3JcbiAgICB9ICk7XG5cbiAgICBjb25zdCBjaGVja2JveE5vZGUgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyB0aGlzLmJhY2tncm91bmROb2RlLCB0aGlzLmNoZWNrZWROb2RlLCB0aGlzLnVuY2hlY2tlZE5vZGUgXSB9ICk7XG5cbiAgICAvLyBwdXQgYSByZWN0YW5nbGUgb24gdG9wIG9mIGV2ZXJ5dGhpbmcgdG8gcHJldmVudCBkZWFkIHpvbmVzIHdoZW4gY2xpY2tpbmdcbiAgICBjb25zdCByZWN0YW5nbGUgPSBuZXcgUmVjdGFuZ2xlKCB7fSApO1xuXG4gICAgdGhpcy5jaGlsZHJlbiA9IFtcbiAgICAgIGNoZWNrYm94Tm9kZSxcbiAgICAgIGNvbnRlbnQsXG4gICAgICByZWN0YW5nbGVcbiAgICBdO1xuXG4gICAgdGhpcy5jb25zdHJhaW50ID0gbmV3IENoZWNrYm94Q29uc3RyYWludCggdGhpcywgY2hlY2tib3hOb2RlLCB0aGlzLmNoZWNrZWROb2RlLCBjb250ZW50LCByZWN0YW5nbGUsIG9wdGlvbnMgKTtcbiAgICB0aGlzLmNvbnN0cmFpbnQudXBkYXRlTGF5b3V0KCk7XG5cbiAgICBjb250ZW50LnBpY2thYmxlID0gZmFsc2U7IC8vIHNpbmNlIHRoZXJlJ3MgYSBwaWNrYWJsZSByZWN0YW5nbGUgb24gdG9wIG9mIGNvbnRlbnRcblxuICAgIC8vIEluIGNhc2UgdGhlIGNvbnRlbnQgaXMgYW4gaW5zdGFuY2Ugb2YgYSBmb2N1c2FibGUgTm9kZS4gQ2hlY2tib3ggaWNvbiBzaG91bGQgbm90IGJlIGluIHRoZSB0cmF2ZXJzYWwgb3JkZXIuXG4gICAgY29udGVudC5wZG9tVmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgLy8gaW50ZXJhY3Rpdml0eVxuICAgIGNvbnN0IGZpcmVMaXN0ZW5lciA9IG5ldyBGaXJlTGlzdGVuZXIoIHtcbiAgICAgIGZpcmU6ICgpID0+IHRvZ2dsZUFjdGlvbi5leGVjdXRlKCksXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZpcmVMaXN0ZW5lcicgKVxuICAgIH0gKTtcbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIGZpcmVMaXN0ZW5lciApO1xuXG4gICAgLy8gc3luYyB3aXRoIHByb3BlcnR5XG4gICAgY29uc3QgY2hlY2tib3hDaGVja2VkTGlzdGVuZXIgPSAoIGNoZWNrZWQ6IGJvb2xlYW4gKSA9PiB7XG4gICAgICB0aGlzLmNoZWNrZWROb2RlLnZpc2libGUgPSBjaGVja2VkO1xuICAgICAgdGhpcy51bmNoZWNrZWROb2RlLnZpc2libGUgPSAhY2hlY2tlZDtcbiAgICAgIHRoaXMucGRvbUNoZWNrZWQgPSBjaGVja2VkO1xuICAgIH07XG4gICAgcHJvcGVydHkubGluayggY2hlY2tib3hDaGVja2VkTGlzdGVuZXIgKTtcblxuICAgIC8vIEFwcGx5IGFkZGl0aW9uYWwgb3B0aW9uc1xuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XG5cbiAgICAvLyBwZG9tIC0gdG8gcHJldmVudCBhIGJ1ZyB3aXRoIE5WREEgYW5kIEZpcmVmb3ggd2hlcmUgdGhlIGxhYmVsIHNpYmxpbmcgcmVjZWl2ZXMgdHdvIGNsaWNrIGV2ZW50cywgc2VlXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dyYXZpdHktZm9yY2UtbGFiL2lzc3Vlcy8yNTdcbiAgICB0aGlzLnNldEV4Y2x1ZGVMYWJlbFNpYmxpbmdGcm9tSW5wdXQoKTtcblxuICAgIC8vIElmIG5vIGFjY2Vzc2libGVOYW1lIGlzIHByb3ZpZGVkLCBsb29rIGZvciBvbmUgaW4gdGhlIGNvbnRlbnQgTm9kZVxuICAgIGlmICggIW9wdGlvbnMuYWNjZXNzaWJsZU5hbWUgKSB7XG4gICAgICB0aGlzLmFjY2Vzc2libGVOYW1lID0gUERPTVV0aWxzLmZpbmRTdHJpbmdQcm9wZXJ0eSggY29udGVudCApO1xuICAgIH1cblxuICAgIC8vIG11c3QgYmUgYWZ0ZXIgdGhlIENoZWNrYm94IGlzIGluc3RydW1lbnRlZFxuICAgIG9wdGlvbnMucGhldGlvTGlua1Byb3BlcnR5ICYmIHRoaXMuYWRkTGlua2VkRWxlbWVudCggcHJvcGVydHksIHtcbiAgICAgIHRhbmRlbU5hbWU6ICdwcm9wZXJ0eSdcbiAgICB9ICk7XG5cbiAgICBpZiAoIGFzc2VydCAmJiBUYW5kZW0uVkFMSURBVElPTiAmJiB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwcm9wZXJ0eS5pc1BoZXRpb0luc3RydW1lbnRlZCgpLCAnUHJvcGVydHkgc2hvdWxkIGJlIGluc3RydW1lbnRlZCBpZiBDaGVja2JveCBpcyBpbnN0cnVtZW50ZWQnICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnBoZXRpb0xpbmtQcm9wZXJ0eSwgJ1Byb3BlcnR5IHNob3VsZCBiZSBsaW5rZWQgaWYgQ2hlY2tib3ggaXMgaW5zdHJ1bWVudGVkJyApO1xuXG4gICAgICBpZiAoIHRoaXMucGhldGlvRmVhdHVyZWQgKSB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHByb3BlcnR5LnBoZXRpb0ZlYXR1cmVkLCBgUHJvcGVydHkgc2hvdWxkIGJlIGZlYXR1cmVkIGlmIHRoZSBjb250cm9sbGluZyBDaGVja2JveCBpcyBmZWF0dXJlZDogJHtwcm9wZXJ0eS5waGV0aW9JRH1gICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gc3VwcG9ydCBmb3IgYmluZGVyIGRvY3VtZW50YXRpb24sIHN0cmlwcGVkIG91dCBpbiBidWlsZHMgYW5kIG9ubHkgcnVucyB3aGVuID9iaW5kZXIgaXMgc3BlY2lmaWVkXG4gICAgYXNzZXJ0ICYmIHdpbmRvdy5waGV0Py5jaGlwcGVyPy5xdWVyeVBhcmFtZXRlcnM/LmJpbmRlciAmJiBJbnN0YW5jZVJlZ2lzdHJ5LnJlZ2lzdGVyRGF0YVVSTCggJ3N1bicsICdDaGVja2JveCcsIHRoaXMgKTtcblxuICAgIC8vIERlY29yYXRpbmcgQ2hlY2tib3ggd2l0aCBhZGRpdGlvbmFsIGNvbnRlbnQgaXMgYW4gYW50aS1wYXR0ZXJuLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvODYwXG4gICAgYXNzZXJ0ICYmIGFzc2VydE5vQWRkaXRpb25hbENoaWxkcmVuKCB0aGlzICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VDaGVja2JveCA9ICgpID0+IHtcbiAgICAgIHJlY3RhbmdsZS5kaXNwb3NlKCk7XG4gICAgICB0aGlzLmJhY2tncm91bmROb2RlLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMudW5jaGVja2VkTm9kZS5kaXNwb3NlKCk7XG4gICAgICB0aGlzLmNoZWNrZWROb2RlLmRpc3Bvc2UoKTtcbiAgICAgIGNoZWNrYm94Tm9kZS5kaXNwb3NlKCk7XG4gICAgICBmaXJlTGlzdGVuZXIuZGlzcG9zZSgpO1xuXG4gICAgICBpZiAoIHByb3BlcnR5Lmhhc0xpc3RlbmVyKCBjaGVja2JveENoZWNrZWRMaXN0ZW5lciApICkge1xuICAgICAgICBwcm9wZXJ0eS51bmxpbmsoIGNoZWNrYm94Q2hlY2tlZExpc3RlbmVyICk7XG4gICAgICB9XG5cbiAgICAgIC8vIFByaXZhdGUgdG8gQ2hlY2tib3gsIGJ1dCB3ZSBuZWVkIHRvIGNsZWFuIHVwIHRhbmRlbS5cbiAgICAgIHRvZ2dsZUFjdGlvbi5kaXNwb3NlKCk7XG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuY29uc3RyYWludC5kaXNwb3NlKCk7XG5cbiAgICB0aGlzLmRpc3Bvc2VDaGVja2JveCgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBiYWNrZ3JvdW5kIGNvbG9yIG9mIHRoZSBjaGVja2JveC5cbiAgICovXG4gIHB1YmxpYyBzZXRDaGVja2JveENvbG9yQmFja2dyb3VuZCggdmFsdWU6IFRQYWludCApOiB2b2lkIHsgdGhpcy5iYWNrZ3JvdW5kTm9kZS5maWxsID0gdmFsdWU7IH1cblxuICBwdWJsaWMgc2V0IGNoZWNrYm94Q29sb3JCYWNrZ3JvdW5kKCB2YWx1ZTogVFBhaW50ICkgeyB0aGlzLnNldENoZWNrYm94Q29sb3JCYWNrZ3JvdW5kKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBjaGVja2JveENvbG9yQmFja2dyb3VuZCgpOiBUUGFpbnQgeyByZXR1cm4gdGhpcy5nZXRDaGVja2JveENvbG9yQmFja2dyb3VuZCgpOyB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGJhY2tncm91bmQgY29sb3Igb2YgdGhlIGNoZWNrYm94LlxuICAgKi9cbiAgcHVibGljIGdldENoZWNrYm94Q29sb3JCYWNrZ3JvdW5kKCk6IFRQYWludCB7IHJldHVybiB0aGlzLmJhY2tncm91bmROb2RlLmZpbGw7IH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgY29sb3Igb2YgdGhlIGNoZWNrYm94LlxuICAgKi9cbiAgcHVibGljIHNldENoZWNrYm94Q29sb3IoIHZhbHVlOiBUUGFpbnQgKTogdm9pZCB7IHRoaXMuY2hlY2tlZE5vZGUuZmlsbCA9IHRoaXMudW5jaGVja2VkTm9kZS5maWxsID0gdmFsdWU7IH1cblxuICBwdWJsaWMgc2V0IGNoZWNrYm94Q29sb3IoIHZhbHVlOiBUUGFpbnQgKSB7IHRoaXMuc2V0Q2hlY2tib3hDb2xvciggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgY2hlY2tib3hDb2xvcigpOiBUUGFpbnQgeyByZXR1cm4gdGhpcy5nZXRDaGVja2JveENvbG9yKCk7IH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgY29sb3Igb2YgdGhlIGNoZWNrYm94LlxuICAgKi9cbiAgcHVibGljIGdldENoZWNrYm94Q29sb3IoKTogVFBhaW50IHsgcmV0dXJuIHRoaXMuY2hlY2tlZE5vZGUuZmlsbDsgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBzZXRNb3VzZUFyZWEoIGFyZWE6IFNoYXBlIHwgQm91bmRzMiB8IG51bGwgKTogdGhpcyB7XG4gICAgaWYgKCAhdGhpcy5faXNTZXR0aW5nQXJlYXMgKSB7XG4gICAgICB0aGlzLl9pc01vdXNlQXJlYUN1c3RvbWl6ZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gc3VwZXIuc2V0TW91c2VBcmVhKCBhcmVhICk7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgc2V0VG91Y2hBcmVhKCBhcmVhOiBTaGFwZSB8IEJvdW5kczIgfCBudWxsICk6IHRoaXMge1xuICAgIGlmICggIXRoaXMuX2lzU2V0dGluZ0FyZWFzICkge1xuICAgICAgdGhpcy5faXNUb3VjaEFyZWFDdXN0b21pemVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHN1cGVyLnNldFRvdWNoQXJlYSggYXJlYSApO1xuICB9XG59XG5cbmNsYXNzIENoZWNrYm94Q29uc3RyYWludCBleHRlbmRzIExheW91dENvbnN0cmFpbnQge1xuICBwcml2YXRlIHJlYWRvbmx5IGNoZWNrYm94OiBDaGVja2JveDtcbiAgcHJpdmF0ZSByZWFkb25seSBjaGVja2JveE5vZGU6IE5vZGU7XG4gIHByaXZhdGUgcmVhZG9ubHkgY2hlY2tlZE5vZGU6IE5vZGU7XG4gIHByaXZhdGUgcmVhZG9ubHkgY29udGVudDogTm9kZTtcbiAgcHJpdmF0ZSByZWFkb25seSByZWN0YW5nbGU6IFJlY3RhbmdsZTtcbiAgcHJpdmF0ZSByZWFkb25seSBvcHRpb25zOiBSZXF1aXJlZDxTZWxmT3B0aW9ucz47XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjaGVja2JveDogQ2hlY2tib3gsIGNoZWNrYm94Tm9kZTogTm9kZSwgY2hlY2tlZE5vZGU6IE5vZGUsIGNvbnRlbnQ6IE5vZGUsIHJlY3RhbmdsZTogUmVjdGFuZ2xlLCBvcHRpb25zOiBSZXF1aXJlZDxTZWxmT3B0aW9ucz4gKSB7XG4gICAgc3VwZXIoIGNoZWNrYm94ICk7XG5cbiAgICB0aGlzLmNoZWNrYm94ID0gY2hlY2tib3g7XG4gICAgdGhpcy5jaGVja2JveE5vZGUgPSBjaGVja2JveE5vZGU7XG4gICAgdGhpcy5jaGVja2VkTm9kZSA9IGNoZWNrZWROb2RlO1xuICAgIHRoaXMuY29udGVudCA9IGNvbnRlbnQ7XG4gICAgdGhpcy5yZWN0YW5nbGUgPSByZWN0YW5nbGU7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcblxuICAgIHRoaXMuY2hlY2tib3gubG9jYWxQcmVmZXJyZWRXaWR0aFByb3BlcnR5LmxhenlMaW5rKCB0aGlzLl91cGRhdGVMYXlvdXRMaXN0ZW5lciApO1xuXG4gICAgdGhpcy5hZGROb2RlKCBjb250ZW50ICk7XG4gIH1cblxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgbGF5b3V0KCk6IHZvaWQge1xuICAgIHN1cGVyLmxheW91dCgpO1xuXG4gICAgLy8gTGF5b3V0UHJveHkgaGVscHMgd2l0aCBzb21lIGxheW91dCBvcGVyYXRpb25zLCBhbmQgd2lsbCBzdXBwb3J0IGEgbm9uLWNoaWxkIGNvbnRlbnQuXG4gICAgY29uc3QgY29udGVudFByb3h5ID0gdGhpcy5jcmVhdGVMYXlvdXRQcm94eSggdGhpcy5jb250ZW50ICk7XG5cbiAgICAvLyBTaG91bGQgb25seSBoYXBwZW4gd2hlbiB3ZSBhcmUgZGlzY29ubmVjdGVkIGR1cmluZyBkaXNwb3NhbFxuICAgIGlmICggIWNvbnRlbnRQcm94eSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZW50V2lkdGggPSBjb250ZW50UHJveHkubWluaW11bVdpZHRoO1xuXG4gICAgLy8gT3VyIGJvdW5kcyBhcmUgYmFzZWQgb24gY2hlY2tib3hOb2RlLCBidXQgb3VyIGxheW91dCBpcyByZWxhdGl2ZSB0byBjaGVja2VkTm9kZVxuICAgIGNvbnN0IGNoZWNrYm94V2l0aG91dFNwYWNpbmdXaWR0aCA9ICggdGhpcy5jaGVja2VkTm9kZS5yaWdodCAtIHRoaXMuY2hlY2tib3hOb2RlLmxlZnQgKTtcbiAgICBjb25zdCBtaW5pbXVtV2lkdGggPSBjaGVja2JveFdpdGhvdXRTcGFjaW5nV2lkdGggKyB0aGlzLm9wdGlvbnMuc3BhY2luZyArIGNvbnRlbnRXaWR0aDtcblxuICAgIGNvbnN0IHByZWZlcnJlZFdpZHRoID0gTWF0aC5tYXgoIG1pbmltdW1XaWR0aCwgdGhpcy5jaGVja2JveC5sb2NhbFByZWZlcnJlZFdpZHRoIHx8IDAgKTtcblxuICAgIGNvbnRlbnRQcm94eS5wcmVmZXJyZWRXaWR0aCA9IHByZWZlcnJlZFdpZHRoIC0gY2hlY2tib3hXaXRob3V0U3BhY2luZ1dpZHRoIC0gdGhpcy5vcHRpb25zLnNwYWNpbmc7XG5cbiAgICAvLyBGb3Igbm93IGp1c3QgcG9zaXRpb24gY29udGVudC4gRnV0dXJlIHVwZGF0ZXMgY291bGQgaW5jbHVkZSB3aWR0aFJlc2l6YWJsZSBjb250ZW50P1xuICAgIGNvbnRlbnRQcm94eS5sZWZ0ID0gdGhpcy5jaGVja2VkTm9kZS5yaWdodCArIHRoaXMub3B0aW9ucy5zcGFjaW5nO1xuICAgIGNvbnRlbnRQcm94eS5jZW50ZXJZID0gdGhpcy5jaGVja2VkTm9kZS5jZW50ZXJZO1xuXG4gICAgLy8gT3VyIHJlY3RhbmdsZSBib3VuZHMgd2lsbCBjb3ZlciB0aGUgY2hlY2tib3hOb2RlIGFuZCBjb250ZW50LCBhbmQgaWYgbmVjZXNzYXJ5IGV4cGFuZCB0byBpbmNsdWRlIHRoZSBmdWxsXG4gICAgLy8gcHJlZmVycmVkV2lkdGhcbiAgICB0aGlzLnJlY3RhbmdsZS5yZWN0Qm91bmRzID0gdGhpcy5jaGVja2JveE5vZGUuYm91bmRzLnVuaW9uKCBjb250ZW50UHJveHkuYm91bmRzICkud2l0aE1heFgoXG4gICAgICBNYXRoLm1heCggdGhpcy5jaGVja2JveE5vZGUubGVmdCArIHByZWZlcnJlZFdpZHRoLCBjb250ZW50UHJveHkucmlnaHQgKVxuICAgICk7XG5cbiAgICAvLyBVcGRhdGUgcG9pbnRlciBhcmVhcyAoaWYgdGhlIGNsaWVudCBoYXNuJ3QgY3VzdG9taXplZCB0aGVtKVxuICAgIHRoaXMuY2hlY2tib3guX2lzU2V0dGluZ0FyZWFzID0gdHJ1ZTtcbiAgICBpZiAoICF0aGlzLmNoZWNrYm94Ll9pc1RvdWNoQXJlYUN1c3RvbWl6ZWQgKSB7XG4gICAgICB0aGlzLmNoZWNrYm94LnRvdWNoQXJlYSA9IHRoaXMuY2hlY2tib3gubG9jYWxCb3VuZHMuZGlsYXRlZFhZKCB0aGlzLm9wdGlvbnMudG91Y2hBcmVhWERpbGF0aW9uLCB0aGlzLm9wdGlvbnMudG91Y2hBcmVhWURpbGF0aW9uICk7XG4gICAgfVxuICAgIGlmICggIXRoaXMuY2hlY2tib3guX2lzTW91c2VBcmVhQ3VzdG9taXplZCApIHtcbiAgICAgIHRoaXMuY2hlY2tib3gubW91c2VBcmVhID0gdGhpcy5jaGVja2JveC5sb2NhbEJvdW5kcy5kaWxhdGVkWFkoIHRoaXMub3B0aW9ucy5tb3VzZUFyZWFYRGlsYXRpb24sIHRoaXMub3B0aW9ucy5tb3VzZUFyZWFZRGlsYXRpb24gKTtcbiAgICB9XG4gICAgdGhpcy5jaGVja2JveC5faXNTZXR0aW5nQXJlYXMgPSBmYWxzZTtcblxuICAgIGNvbnRlbnRQcm94eS5kaXNwb3NlKCk7XG5cbiAgICAvLyBTZXQgdGhlIG1pbmltdW1XaWR0aCBsYXN0LCBzaW5jZSB0aGlzIG1heSB0cmlnZ2VyIGEgcmVsYXlvdXRcbiAgICB0aGlzLmNoZWNrYm94LmxvY2FsTWluaW11bVdpZHRoID0gbWluaW11bVdpZHRoO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5jaGVja2JveC5sb2NhbFByZWZlcnJlZFdpZHRoUHJvcGVydHkudW5saW5rKCB0aGlzLl91cGRhdGVMYXlvdXRMaXN0ZW5lciApO1xuXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnN1bi5yZWdpc3RlciggJ0NoZWNrYm94JywgQ2hlY2tib3ggKTsiXSwibmFtZXMiOlsidmFsaWRhdGUiLCJtMyIsIkluc3RhbmNlUmVnaXN0cnkiLCJvcHRpb25pemUiLCJhc3NlcnROb0FkZGl0aW9uYWxDaGlsZHJlbiIsIkZpcmVMaXN0ZW5lciIsIkxheW91dENvbnN0cmFpbnQiLCJOb2RlIiwiUGF0aCIsIlBET01VdGlscyIsIlJlY3RhbmdsZSIsIlNjZW5lcnlDb25zdGFudHMiLCJWb2ljaW5nIiwiV2lkdGhTaXphYmxlIiwiY2hlY2tFbXB0eVNvbGlkU2hhcGUiLCJjaGVja1NxdWFyZU9Tb2xpZFNoYXBlIiwic2hhcmVkU291bmRQbGF5ZXJzIiwiRXZlbnRUeXBlIiwiUGhldGlvQWN0aW9uIiwiUGhldGlvT2JqZWN0IiwiVGFuZGVtIiwiVXR0ZXJhbmNlIiwic3VuIiwiQk9PTEVBTl9WQUxJREFUT1IiLCJ2YWx1ZVR5cGUiLCJTSEFQRV9NQVRSSVgiLCJ1bmNoZWNrZWRTaGFwZSIsInRyYW5zZm9ybWVkIiwiY2hlY2tlZFNoYXBlIiwiQ2hlY2tib3giLCJkaXNwb3NlIiwiY29uc3RyYWludCIsImRpc3Bvc2VDaGVja2JveCIsInNldENoZWNrYm94Q29sb3JCYWNrZ3JvdW5kIiwidmFsdWUiLCJiYWNrZ3JvdW5kTm9kZSIsImZpbGwiLCJjaGVja2JveENvbG9yQmFja2dyb3VuZCIsImdldENoZWNrYm94Q29sb3JCYWNrZ3JvdW5kIiwic2V0Q2hlY2tib3hDb2xvciIsImNoZWNrZWROb2RlIiwidW5jaGVja2VkTm9kZSIsImNoZWNrYm94Q29sb3IiLCJnZXRDaGVja2JveENvbG9yIiwic2V0TW91c2VBcmVhIiwiYXJlYSIsIl9pc1NldHRpbmdBcmVhcyIsIl9pc01vdXNlQXJlYUN1c3RvbWl6ZWQiLCJzZXRUb3VjaEFyZWEiLCJfaXNUb3VjaEFyZWFDdXN0b21pemVkIiwicHJvcGVydHkiLCJjb250ZW50IiwicHJvdmlkZWRPcHRpb25zIiwid2luZG93Iiwib3B0aW9ucyIsInNwYWNpbmciLCJib3hXaWR0aCIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsIm1vdXNlQXJlYVhEaWxhdGlvbiIsIm1vdXNlQXJlYVlEaWxhdGlvbiIsImNoZWNrZWRTb3VuZFBsYXllciIsImdldCIsInVuY2hlY2tlZFNvdW5kUGxheWVyIiwicGhldGlvTGlua1Byb3BlcnR5IiwiY3Vyc29yIiwiZGlzYWJsZWRPcGFjaXR5IiwiRElTQUJMRURfT1BBQ0lUWSIsInRhbmRlbSIsIlJFUVVJUkVEIiwidGFuZGVtTmFtZVN1ZmZpeCIsInBoZXRpb0V2ZW50VHlwZSIsIlVTRVIiLCJ2aXNpYmxlUHJvcGVydHlPcHRpb25zIiwicGhldGlvRmVhdHVyZWQiLCJwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJwaGV0aW9SZWFkT25seSIsIkRFRkFVTFRfT1BUSU9OUyIsInRhZ05hbWUiLCJpbnB1dFR5cGUiLCJhcHBlbmREZXNjcmlwdGlvbiIsInZvaWNpbmdDaGVja2VkT2JqZWN0UmVzcG9uc2UiLCJ2b2ljaW5nVW5jaGVja2VkT2JqZWN0UmVzcG9uc2UiLCJjaGVja2VkQ29udGV4dFJlc3BvbnNlIiwidW5jaGVja2VkQ29udGV4dFJlc3BvbnNlIiwidm9pY2VOYW1lUmVzcG9uc2VPblNlbGVjdGlvbiIsInRvZ2dsZUFjdGlvbiIsInBsYXkiLCJhbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlIiwidm9pY2luZ1NwZWFrUmVzcG9uc2UiLCJuYW1lUmVzcG9uc2UiLCJ2b2ljaW5nTmFtZVJlc3BvbnNlIiwib2JqZWN0UmVzcG9uc2UiLCJhbGVydGFibGVUb1RleHQiLCJjb250ZXh0UmVzcG9uc2UiLCJwYXJhbWV0ZXJzIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsImljb25TY2FsZSIsIndpZHRoIiwic2NhbGUiLCJjaGVja2JveE5vZGUiLCJjaGlsZHJlbiIsInJlY3RhbmdsZSIsIkNoZWNrYm94Q29uc3RyYWludCIsInVwZGF0ZUxheW91dCIsInBpY2thYmxlIiwicGRvbVZpc2libGUiLCJmaXJlTGlzdGVuZXIiLCJmaXJlIiwiZXhlY3V0ZSIsImFkZElucHV0TGlzdGVuZXIiLCJjaGVja2JveENoZWNrZWRMaXN0ZW5lciIsImNoZWNrZWQiLCJ2aXNpYmxlIiwicGRvbUNoZWNrZWQiLCJsaW5rIiwibXV0YXRlIiwic2V0RXhjbHVkZUxhYmVsU2libGluZ0Zyb21JbnB1dCIsImFjY2Vzc2libGVOYW1lIiwiZmluZFN0cmluZ1Byb3BlcnR5IiwiYWRkTGlua2VkRWxlbWVudCIsInRhbmRlbU5hbWUiLCJhc3NlcnQiLCJWQUxJREFUSU9OIiwiaXNQaGV0aW9JbnN0cnVtZW50ZWQiLCJwaGV0aW9JRCIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwiYmluZGVyIiwicmVnaXN0ZXJEYXRhVVJMIiwiaGFzTGlzdGVuZXIiLCJ1bmxpbmsiLCJsYXlvdXQiLCJjb250ZW50UHJveHkiLCJjcmVhdGVMYXlvdXRQcm94eSIsImNvbnRlbnRXaWR0aCIsIm1pbmltdW1XaWR0aCIsImNoZWNrYm94V2l0aG91dFNwYWNpbmdXaWR0aCIsInJpZ2h0IiwibGVmdCIsInByZWZlcnJlZFdpZHRoIiwiTWF0aCIsIm1heCIsImNoZWNrYm94IiwibG9jYWxQcmVmZXJyZWRXaWR0aCIsImNlbnRlclkiLCJyZWN0Qm91bmRzIiwiYm91bmRzIiwidW5pb24iLCJ3aXRoTWF4WCIsInRvdWNoQXJlYSIsImxvY2FsQm91bmRzIiwiZGlsYXRlZFhZIiwibW91c2VBcmVhIiwibG9jYWxNaW5pbXVtV2lkdGgiLCJsb2NhbFByZWZlcnJlZFdpZHRoUHJvcGVydHkiLCJfdXBkYXRlTGF5b3V0TGlzdGVuZXIiLCJsYXp5TGluayIsImFkZE5vZGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FHRCxPQUFPQSxjQUFjLDRCQUE0QjtBQUVqRCxTQUFTQyxFQUFFLFFBQVEsMEJBQTBCO0FBRTdDLE9BQU9DLHNCQUFzQix1REFBdUQ7QUFDcEYsT0FBT0MsZUFBZSxrQ0FBa0M7QUFFeEQsU0FBU0MsMEJBQTBCLEVBQUVDLFlBQVksRUFBRUMsZ0JBQWdCLEVBQUVDLElBQUksRUFBZUMsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBRUMsZ0JBQWdCLEVBQVVDLE9BQU8sRUFBa0JDLFlBQVksUUFBNkIsOEJBQThCO0FBQzlPLE9BQU9DLDBCQUEwQix3REFBd0Q7QUFDekYsT0FBT0MsNEJBQTRCLDBEQUEwRDtBQUM3RixPQUFPQyx3QkFBd0Is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