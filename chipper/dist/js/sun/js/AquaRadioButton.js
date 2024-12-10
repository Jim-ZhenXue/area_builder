// Copyright 2013-2024, University of Colorado Boulder
/**
 * AquaRadioButton is a radio button whose look is similar to macOS' Aqua theme. The button is circular and
 * contains a dot when selected.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Emitter from '../../axon/js/Emitter.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import { assertNoAdditionalChildren, Circle, FireListener, isWidthSizable, LayoutConstraint, Node, PDOMUtils, Rectangle, SceneryConstants, Voicing, WidthSizable } from '../../scenery/js/imports.js';
import multiSelectionSoundPlayerFactory from '../../tambo/js/multiSelectionSoundPlayerFactory.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';
let AquaRadioButton = class AquaRadioButton extends WidthSizable(Voicing(Node)) {
    dispose() {
        this.disposeAquaRadioButton();
        super.dispose();
    }
    /**
   * @param property
   * @param value - the value that corresponds to this button, same type as property
   * @param labelNode - Node that will be vertically centered to the right of the button
   * @param providedOptions
   */ constructor(property, value, labelNode, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        assert && assert(property.valueComparisonStrategy === 'reference', 'ToggleSwitch depends on "===" equality for value comparison');
        const options = optionize()({
            // SelfOptions
            centerColor: 'black',
            radius: AquaRadioButton.DEFAULT_RADIUS,
            selectedColor: 'rgb( 143, 197, 250 )',
            deselectedColor: 'white',
            xSpacing: 8,
            stroke: 'black',
            soundPlayer: multiSelectionSoundPlayerFactory.getSelectionSoundPlayer(0),
            a11yNameAttribute: null,
            touchAreaXDilation: 0,
            touchAreaYDilation: 0,
            mouseAreaXDilation: 0,
            mouseAreaYDilation: 0,
            // NodeOptions
            cursor: 'pointer',
            // {number} - opt into Node's disabled opacity when enabled:false
            disabledOpacity: SceneryConstants.DISABLED_OPACITY,
            // phet-io
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'RadioButton',
            visiblePropertyOptions: {
                phetioFeatured: true
            },
            phetioEnabledPropertyInstrumented: true,
            // pdom
            tagName: 'input',
            inputType: 'radio',
            containerTagName: 'li',
            labelTagName: 'label',
            appendLabel: true,
            appendDescription: true
        }, providedOptions);
        super(), this.onInputEmitter = new Emitter(), // We need to record if the mouse/touch areas are customized, so that we can avoid overwriting them.
        // public for use by AquaRadioButtonConstraint only!
        this._isMouseAreaCustomized = false, this._isTouchAreaCustomized = false, this._isSettingAreas = false;
        this.value = value;
        // selected Node
        const selectedNode = new Node();
        const innerCircle = new Circle(options.radius / 3, {
            fill: options.centerColor
        });
        const outerCircleSelected = new Circle(options.radius, {
            fill: options.selectedColor,
            stroke: options.stroke
        });
        const selectedCircleButton = new Node({
            children: [
                outerCircleSelected,
                innerCircle
            ]
        });
        selectedNode.addChild(selectedCircleButton);
        // deselected Node
        const deselectedNode = new Node();
        const deselectedCircleButton = new Circle(options.radius, {
            fill: options.deselectedColor,
            stroke: options.stroke
        });
        deselectedNode.addChild(deselectedCircleButton);
        const radioNode = new Node({
            children: [
                selectedNode,
                deselectedNode
            ],
            pickable: false // rectangle used for input
        });
        const labelBoundsListener = ()=>{
            labelNode.left = deselectedCircleButton.right + options.xSpacing;
            labelNode.centerY = deselectedCircleButton.centerY;
        };
        labelNode.boundsProperty.link(labelBoundsListener);
        // Add an invisible Node to make sure the layout for selected vs deselected is the same
        const rectangle = new Rectangle({});
        selectedNode.pickable = deselectedNode.pickable = false; // the background rectangle suffices
        labelNode.pickable = false; // since there's a pickable rectangle on top of content
        this.children = [
            radioNode,
            labelNode,
            rectangle
        ];
        this.constraint = new AquaRadioButtonConstraint(this, radioNode, labelNode, rectangle, options);
        this.constraint.updateLayout();
        // sync control with model
        const syncWithModel = (newValue)=>{
            selectedNode.visible = newValue === value;
            deselectedNode.visible = !selectedNode.visible;
        };
        property.link(syncWithModel);
        // set Property value on fire
        const fire = ()=>{
            const oldValue = property.value;
            property.set(value);
            if (oldValue !== property.value) {
                this.onInputEmitter.emit();
            }
        };
        const fireListener = new FireListener({
            fire: fire,
            tandem: options.tandem.createTandem('fireListener')
        });
        this.addInputListener(fireListener);
        // sound support
        this.onInputEmitter.addListener(()=>options.soundPlayer.play());
        // pdom - input listener so that updates the state of the radio button with keyboard interaction
        const changeListener = {
            change: fire
        };
        this.addInputListener(changeListener);
        // pdom - Specify the default value for assistive technology. This attribute is needed in addition to
        // the 'checked' Property to mark this element as the default selection since 'checked' may be set before
        // we are finished adding RadioButtons to the containing group, and the browser will remove the boolean
        // 'checked' flag when new buttons are added.
        if (property.value === value) {
            this.setPDOMAttribute('checked', 'checked');
        }
        // pdom - when the Property changes, make sure the correct radio button is marked as 'checked' so that this button
        // receives focus on 'tab'
        const pdomCheckedListener = (newValue)=>{
            this.pdomChecked = newValue === value;
        };
        property.link(pdomCheckedListener);
        // pdom - If an accessibleName was not provided, search for one in the labelNode
        if (!options.accessibleName) {
            options.accessibleName = PDOMUtils.findStringProperty(labelNode);
        }
        // pdom - every button in a group of radio buttons should have the same name, see options for more info
        if (options.a11yNameAttribute !== null) {
            this.setPDOMAttribute('name', options.a11yNameAttribute);
        }
        this.mutate(options);
        this.disposeAquaRadioButton = ()=>{
            this.constraint.dispose();
            this.onInputEmitter.dispose();
            this.removeInputListener(fireListener);
            this.removeInputListener(changeListener);
            property.unlink(pdomCheckedListener);
            property.unlink(syncWithModel);
            if (labelNode.boundsProperty.hasListener(labelBoundsListener)) {
                labelNode.boundsProperty.unlink(labelBoundsListener);
            }
            // phet-io: Unregister listener
            fireListener.dispose();
        };
        // Decorating with additional content is an anti-pattern, see https://github.com/phetsims/sun/issues/860
        assert && assertNoAdditionalChildren(this);
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('sun', 'AquaRadioButton', this);
    }
};
AquaRadioButton.DEFAULT_RADIUS = 7;
export { AquaRadioButton as default };
let AquaRadioButtonConstraint = class AquaRadioButtonConstraint extends LayoutConstraint {
    layout() {
        super.layout();
        // LayoutProxy helps with some layout operations, and will support a non-child content.
        const labelNodeProxy = this.createLayoutProxy(this.labelNode);
        const labelNodeWidth = labelNodeProxy.minimumWidth;
        const minimumWidth = this.radioNode.width + this.options.xSpacing + labelNodeWidth;
        const preferredWidth = Math.max(minimumWidth, this.radioButton.localPreferredWidth || 0);
        // Attempt to set a preferredWidth
        if (isWidthSizable(this.labelNode)) {
            labelNodeProxy.preferredWidth = preferredWidth - this.radioNode.width - this.options.xSpacing;
        }
        labelNodeProxy.left = this.radioNode.right + this.options.xSpacing;
        labelNodeProxy.centerY = this.radioNode.centerY;
        // Our rectangle bounds will cover the radioNode and labelNode, and if necessary expand to include the full
        // preferredWidth
        this.rectangle.rectBounds = this.radioNode.bounds.union(labelNodeProxy.bounds).withMaxX(Math.max(this.radioNode.left + preferredWidth, labelNodeProxy.right));
        // Update pointer areas (if the client hasn't customized them)
        this.radioButton._isSettingAreas = true;
        if (!this.radioButton._isTouchAreaCustomized) {
            this.radioButton.touchArea = this.radioButton.localBounds.dilatedXY(this.options.touchAreaXDilation, this.options.touchAreaYDilation);
        }
        if (!this.radioButton._isMouseAreaCustomized) {
            this.radioButton.mouseArea = this.radioButton.localBounds.dilatedXY(this.options.mouseAreaXDilation, this.options.mouseAreaYDilation);
        }
        this.radioButton._isSettingAreas = false;
        labelNodeProxy.dispose();
        // Set the minimumWidth last, since this may trigger a relayout
        this.radioButton.localMinimumWidth = minimumWidth;
    }
    dispose() {
        this.radioButton.localPreferredWidthProperty.unlink(this._updateLayoutListener);
        super.dispose();
    }
    constructor(radioButton, radioNode, labelNode, rectangle, options){
        super(radioButton);
        this.radioButton = radioButton;
        this.radioNode = radioNode;
        this.labelNode = labelNode;
        this.rectangle = rectangle;
        this.options = options;
        this.radioButton.localPreferredWidthProperty.lazyLink(this._updateLayoutListener);
        this.addNode(labelNode);
    }
};
sun.register('AquaRadioButton', AquaRadioButton);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9BcXVhUmFkaW9CdXR0b24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQXF1YVJhZGlvQnV0dG9uIGlzIGEgcmFkaW8gYnV0dG9uIHdob3NlIGxvb2sgaXMgc2ltaWxhciB0byBtYWNPUycgQXF1YSB0aGVtZS4gVGhlIGJ1dHRvbiBpcyBjaXJjdWxhciBhbmRcbiAqIGNvbnRhaW5zIGEgZG90IHdoZW4gc2VsZWN0ZWQuXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xuaW1wb3J0IFRFbWl0dGVyIGZyb20gJy4uLy4uL2F4b24vanMvVEVtaXR0ZXIuanMnO1xuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgSW5zdGFuY2VSZWdpc3RyeSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvZG9jdW1lbnRhdGlvbi9JbnN0YW5jZVJlZ2lzdHJ5LmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBhc3NlcnROb0FkZGl0aW9uYWxDaGlsZHJlbiwgQ2lyY2xlLCBGaXJlTGlzdGVuZXIsIGlzV2lkdGhTaXphYmxlLCBMYXlvdXRDb25zdHJhaW50LCBOb2RlLCBOb2RlT3B0aW9ucywgUERPTVV0aWxzLCBSZWN0YW5nbGUsIFNjZW5lcnlDb25zdGFudHMsIFRQYWludCwgVHJpbVBhcmFsbGVsRE9NT3B0aW9ucywgVm9pY2luZywgVm9pY2luZ09wdGlvbnMsIFdpZHRoU2l6YWJsZSB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgbXVsdGlTZWxlY3Rpb25Tb3VuZFBsYXllckZhY3RvcnkgZnJvbSAnLi4vLi4vdGFtYm8vanMvbXVsdGlTZWxlY3Rpb25Tb3VuZFBsYXllckZhY3RvcnkuanMnO1xuaW1wb3J0IFRTb3VuZFBsYXllciBmcm9tICcuLi8uLi90YW1iby9qcy9UU291bmRQbGF5ZXIuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBzdW4gZnJvbSAnLi9zdW4uanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuXG4gIC8vIGNvbG9yIHVzZWQgdG8gZmlsbCB0aGUgY2VudGVyIG9mIHRoZSBidXR0b24gd2hlbiBpdCdzIHNlbGVjdGVkXG4gIGNlbnRlckNvbG9yPzogVFBhaW50O1xuXG4gIC8vIHJhZGl1cyBvZiB0aGUgYnV0dG9uXG4gIHJhZGl1cz86IG51bWJlcjtcblxuICAvLyBjb2xvciB1c2VkIHRvIGZpbGwgdGhlIGJ1dHRvbiB3aGVuIGl0J3Mgc2VsZWN0ZWRcbiAgc2VsZWN0ZWRDb2xvcj86IFRQYWludDtcblxuICAvLyBjb2xvciB1c2VkIHRvIGZpbGwgdGhlIGJ1dHRvbiB3aGVuIGl0J3MgZGVzZWxlY3RlZFxuICBkZXNlbGVjdGVkQ29sb3I/OiBUUGFpbnQ7XG5cbiAgLy8gaG9yaXpvbnRhbCBzcGFjZSBiZXR3ZWVuIHRoZSBidXR0b24gYW5kIHRoZSBsYWJlbE5vZGVcbiAgeFNwYWNpbmc/OiBudW1iZXI7XG5cbiAgLy8gY29sb3IgdXNlZCB0byBzdHJva2UgdGhlIG91dGVyIGVkZ2Ugb2YgdGhlIGJ1dHRvblxuICBzdHJva2U/OiBUUGFpbnQ7XG5cbiAgLy8gc291bmQgZ2VuZXJhdG9yLCB1c3VhbGx5IG92ZXJyaWRkZW4gd2hlbiBjcmVhdGluZyBhIGdyb3VwIG9mIHRoZXNlXG4gIHNvdW5kUGxheWVyPzogVFNvdW5kUGxheWVyO1xuXG4gIC8vIHBvaW50ZXIgYXJlYXNcbiAgdG91Y2hBcmVhWERpbGF0aW9uPzogbnVtYmVyO1xuICB0b3VjaEFyZWFZRGlsYXRpb24/OiBudW1iZXI7XG4gIG1vdXNlQXJlYVhEaWxhdGlvbj86IG51bWJlcjtcbiAgbW91c2VBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xuXG4gIC8vIEVhY2ggYnV0dG9uIGluIGEgZ3JvdXAgb2YgcmFkaW8gYnV0dG9ucyBtdXN0IGhhdmUgdGhlIHNhbWUgJ25hbWUnIGF0dHJpYnV0ZSB0byBiZSBjb25zaWRlcmVkIGEgJ2dyb3VwJyBieSB0aGVcbiAgLy8gYnJvd3Nlci4gT3RoZXJ3aXNlLCBhcnJvdyBrZXlzIHdpbGwgbmF2aWdhdGUgdGhyb3VnaCBhbGwgaW5wdXRzIG9mIHR5cGUgcmFkaW8gaW4gdGhlIGRvY3VtZW50LlxuICBhMTF5TmFtZUF0dHJpYnV0ZT86IHN0cmluZyB8IG51bWJlciB8IG51bGw7XG59O1xudHlwZSBQYXJlbnRPcHRpb25zID0gVm9pY2luZ09wdGlvbnMgJiBTdHJpY3RPbWl0PE5vZGVPcHRpb25zLCAnY2hpbGRyZW4nPjtcbmV4cG9ydCB0eXBlIEFxdWFSYWRpb0J1dHRvbk9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFRyaW1QYXJhbGxlbERPTU9wdGlvbnM8UGFyZW50T3B0aW9ucz47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFxdWFSYWRpb0J1dHRvbjxUPiBleHRlbmRzIFdpZHRoU2l6YWJsZSggVm9pY2luZyggTm9kZSApICkge1xuXG4gIC8vIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhpcyByYWRpbyBidXR0b25cbiAgcHVibGljIHJlYWRvbmx5IHZhbHVlOiBUO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUFxdWFSYWRpb0J1dHRvbjogKCkgPT4gdm9pZDtcblxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IERFRkFVTFRfUkFESVVTID0gNztcblxuICBwdWJsaWMgcmVhZG9ubHkgb25JbnB1dEVtaXR0ZXI6IFRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcblxuICAvLyBIYW5kbGVzIGxheW91dCBvZiB0aGUgY29udGVudCwgcmVjdGFuZ2xlcyBhbmQgbW91c2UvdG91Y2ggYXJlYXNcbiAgcHJpdmF0ZSByZWFkb25seSBjb25zdHJhaW50OiBBcXVhUmFkaW9CdXR0b25Db25zdHJhaW50PFQ+O1xuXG4gIC8vIFdlIG5lZWQgdG8gcmVjb3JkIGlmIHRoZSBtb3VzZS90b3VjaCBhcmVhcyBhcmUgY3VzdG9taXplZCwgc28gdGhhdCB3ZSBjYW4gYXZvaWQgb3ZlcndyaXRpbmcgdGhlbS5cbiAgLy8gcHVibGljIGZvciB1c2UgYnkgQXF1YVJhZGlvQnV0dG9uQ29uc3RyYWludCBvbmx5IVxuICBwdWJsaWMgX2lzTW91c2VBcmVhQ3VzdG9taXplZCA9IGZhbHNlO1xuICBwdWJsaWMgX2lzVG91Y2hBcmVhQ3VzdG9taXplZCA9IGZhbHNlO1xuICBwdWJsaWMgX2lzU2V0dGluZ0FyZWFzID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBwcm9wZXJ0eVxuICAgKiBAcGFyYW0gdmFsdWUgLSB0aGUgdmFsdWUgdGhhdCBjb3JyZXNwb25kcyB0byB0aGlzIGJ1dHRvbiwgc2FtZSB0eXBlIGFzIHByb3BlcnR5XG4gICAqIEBwYXJhbSBsYWJlbE5vZGUgLSBOb2RlIHRoYXQgd2lsbCBiZSB2ZXJ0aWNhbGx5IGNlbnRlcmVkIHRvIHRoZSByaWdodCBvZiB0aGUgYnV0dG9uXG4gICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnNcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvcGVydHk6IFRQcm9wZXJ0eTxUPiwgdmFsdWU6IFQsIGxhYmVsTm9kZTogTm9kZSwgcHJvdmlkZWRPcHRpb25zPzogQXF1YVJhZGlvQnV0dG9uT3B0aW9ucyApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwcm9wZXJ0eS52YWx1ZUNvbXBhcmlzb25TdHJhdGVneSA9PT0gJ3JlZmVyZW5jZScsXG4gICAgICAnVG9nZ2xlU3dpdGNoIGRlcGVuZHMgb24gXCI9PT1cIiBlcXVhbGl0eSBmb3IgdmFsdWUgY29tcGFyaXNvbicgKTtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8QXF1YVJhZGlvQnV0dG9uT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBhcmVudE9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gU2VsZk9wdGlvbnNcbiAgICAgIGNlbnRlckNvbG9yOiAnYmxhY2snLFxuICAgICAgcmFkaXVzOiBBcXVhUmFkaW9CdXR0b24uREVGQVVMVF9SQURJVVMsXG4gICAgICBzZWxlY3RlZENvbG9yOiAncmdiKCAxNDMsIDE5NywgMjUwICknLFxuICAgICAgZGVzZWxlY3RlZENvbG9yOiAnd2hpdGUnLFxuICAgICAgeFNwYWNpbmc6IDgsXG4gICAgICBzdHJva2U6ICdibGFjaycsXG4gICAgICBzb3VuZFBsYXllcjogbXVsdGlTZWxlY3Rpb25Tb3VuZFBsYXllckZhY3RvcnkuZ2V0U2VsZWN0aW9uU291bmRQbGF5ZXIoIDAgKSxcbiAgICAgIGExMXlOYW1lQXR0cmlidXRlOiBudWxsLFxuICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiAwLFxuICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiAwLFxuICAgICAgbW91c2VBcmVhWERpbGF0aW9uOiAwLFxuICAgICAgbW91c2VBcmVhWURpbGF0aW9uOiAwLFxuXG4gICAgICAvLyBOb2RlT3B0aW9uc1xuICAgICAgY3Vyc29yOiAncG9pbnRlcicsXG5cbiAgICAgIC8vIHtudW1iZXJ9IC0gb3B0IGludG8gTm9kZSdzIGRpc2FibGVkIG9wYWNpdHkgd2hlbiBlbmFibGVkOmZhbHNlXG4gICAgICBkaXNhYmxlZE9wYWNpdHk6IFNjZW5lcnlDb25zdGFudHMuRElTQUJMRURfT1BBQ0lUWSxcblxuICAgICAgLy8gcGhldC1pb1xuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXG4gICAgICB0YW5kZW1OYW1lU3VmZml4OiAnUmFkaW9CdXR0b24nLFxuICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczogeyBwaGV0aW9GZWF0dXJlZDogdHJ1ZSB9LFxuICAgICAgcGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkOiB0cnVlLCAvLyBvcHQgaW50byBkZWZhdWx0IFBoRVQtaU8gaW5zdHJ1bWVudGVkIGVuYWJsZWRQcm9wZXJ0eVxuXG4gICAgICAvLyBwZG9tXG4gICAgICB0YWdOYW1lOiAnaW5wdXQnLFxuICAgICAgaW5wdXRUeXBlOiAncmFkaW8nLFxuICAgICAgY29udGFpbmVyVGFnTmFtZTogJ2xpJyxcbiAgICAgIGxhYmVsVGFnTmFtZTogJ2xhYmVsJyxcbiAgICAgIGFwcGVuZExhYmVsOiB0cnVlLFxuICAgICAgYXBwZW5kRGVzY3JpcHRpb246IHRydWVcblxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcblxuICAgIC8vIHNlbGVjdGVkIE5vZGVcbiAgICBjb25zdCBzZWxlY3RlZE5vZGUgPSBuZXcgTm9kZSgpO1xuICAgIGNvbnN0IGlubmVyQ2lyY2xlID0gbmV3IENpcmNsZSggb3B0aW9ucy5yYWRpdXMgLyAzLCB7IGZpbGw6IG9wdGlvbnMuY2VudGVyQ29sb3IgfSApO1xuICAgIGNvbnN0IG91dGVyQ2lyY2xlU2VsZWN0ZWQgPSBuZXcgQ2lyY2xlKCBvcHRpb25zLnJhZGl1cywgeyBmaWxsOiBvcHRpb25zLnNlbGVjdGVkQ29sb3IsIHN0cm9rZTogb3B0aW9ucy5zdHJva2UgfSApO1xuICAgIGNvbnN0IHNlbGVjdGVkQ2lyY2xlQnV0dG9uID0gbmV3IE5vZGUoIHtcbiAgICAgIGNoaWxkcmVuOiBbIG91dGVyQ2lyY2xlU2VsZWN0ZWQsIGlubmVyQ2lyY2xlIF1cbiAgICB9ICk7XG4gICAgc2VsZWN0ZWROb2RlLmFkZENoaWxkKCBzZWxlY3RlZENpcmNsZUJ1dHRvbiApO1xuXG4gICAgLy8gZGVzZWxlY3RlZCBOb2RlXG4gICAgY29uc3QgZGVzZWxlY3RlZE5vZGUgPSBuZXcgTm9kZSgpO1xuICAgIGNvbnN0IGRlc2VsZWN0ZWRDaXJjbGVCdXR0b24gPSBuZXcgQ2lyY2xlKCBvcHRpb25zLnJhZGl1cywge1xuICAgICAgZmlsbDogb3B0aW9ucy5kZXNlbGVjdGVkQ29sb3IsXG4gICAgICBzdHJva2U6IG9wdGlvbnMuc3Ryb2tlXG4gICAgfSApO1xuICAgIGRlc2VsZWN0ZWROb2RlLmFkZENoaWxkKCBkZXNlbGVjdGVkQ2lyY2xlQnV0dG9uICk7XG5cbiAgICBjb25zdCByYWRpb05vZGUgPSBuZXcgTm9kZSgge1xuICAgICAgY2hpbGRyZW46IFsgc2VsZWN0ZWROb2RlLCBkZXNlbGVjdGVkTm9kZSBdLFxuICAgICAgcGlja2FibGU6IGZhbHNlIC8vIHJlY3RhbmdsZSB1c2VkIGZvciBpbnB1dFxuICAgIH0gKTtcblxuICAgIGNvbnN0IGxhYmVsQm91bmRzTGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgICBsYWJlbE5vZGUubGVmdCA9IGRlc2VsZWN0ZWRDaXJjbGVCdXR0b24ucmlnaHQgKyBvcHRpb25zLnhTcGFjaW5nO1xuICAgICAgbGFiZWxOb2RlLmNlbnRlclkgPSBkZXNlbGVjdGVkQ2lyY2xlQnV0dG9uLmNlbnRlclk7XG4gICAgfTtcbiAgICBsYWJlbE5vZGUuYm91bmRzUHJvcGVydHkubGluayggbGFiZWxCb3VuZHNMaXN0ZW5lciApO1xuXG4gICAgLy8gQWRkIGFuIGludmlzaWJsZSBOb2RlIHRvIG1ha2Ugc3VyZSB0aGUgbGF5b3V0IGZvciBzZWxlY3RlZCB2cyBkZXNlbGVjdGVkIGlzIHRoZSBzYW1lXG4gICAgY29uc3QgcmVjdGFuZ2xlID0gbmV3IFJlY3RhbmdsZSgge30gKTtcbiAgICBzZWxlY3RlZE5vZGUucGlja2FibGUgPSBkZXNlbGVjdGVkTm9kZS5waWNrYWJsZSA9IGZhbHNlOyAvLyB0aGUgYmFja2dyb3VuZCByZWN0YW5nbGUgc3VmZmljZXNcblxuICAgIGxhYmVsTm9kZS5waWNrYWJsZSA9IGZhbHNlOyAvLyBzaW5jZSB0aGVyZSdzIGEgcGlja2FibGUgcmVjdGFuZ2xlIG9uIHRvcCBvZiBjb250ZW50XG5cbiAgICB0aGlzLmNoaWxkcmVuID0gW1xuICAgICAgcmFkaW9Ob2RlLFxuICAgICAgbGFiZWxOb2RlLFxuICAgICAgcmVjdGFuZ2xlXG4gICAgXTtcblxuICAgIHRoaXMuY29uc3RyYWludCA9IG5ldyBBcXVhUmFkaW9CdXR0b25Db25zdHJhaW50KCB0aGlzLCByYWRpb05vZGUsIGxhYmVsTm9kZSwgcmVjdGFuZ2xlLCBvcHRpb25zICk7XG4gICAgdGhpcy5jb25zdHJhaW50LnVwZGF0ZUxheW91dCgpO1xuXG4gICAgLy8gc3luYyBjb250cm9sIHdpdGggbW9kZWxcbiAgICBjb25zdCBzeW5jV2l0aE1vZGVsID0gKCBuZXdWYWx1ZTogVCApID0+IHtcbiAgICAgIHNlbGVjdGVkTm9kZS52aXNpYmxlID0gKCBuZXdWYWx1ZSA9PT0gdmFsdWUgKTtcbiAgICAgIGRlc2VsZWN0ZWROb2RlLnZpc2libGUgPSAhc2VsZWN0ZWROb2RlLnZpc2libGU7XG4gICAgfTtcbiAgICBwcm9wZXJ0eS5saW5rKCBzeW5jV2l0aE1vZGVsICk7XG5cbiAgICAvLyBzZXQgUHJvcGVydHkgdmFsdWUgb24gZmlyZVxuICAgIGNvbnN0IGZpcmUgPSAoKSA9PiB7XG4gICAgICBjb25zdCBvbGRWYWx1ZSA9IHByb3BlcnR5LnZhbHVlO1xuICAgICAgcHJvcGVydHkuc2V0KCB2YWx1ZSApO1xuICAgICAgaWYgKCBvbGRWYWx1ZSAhPT0gcHJvcGVydHkudmFsdWUgKSB7XG4gICAgICAgIHRoaXMub25JbnB1dEVtaXR0ZXIuZW1pdCgpO1xuICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgZmlyZUxpc3RlbmVyID0gbmV3IEZpcmVMaXN0ZW5lcigge1xuICAgICAgZmlyZTogZmlyZSxcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZmlyZUxpc3RlbmVyJyApXG4gICAgfSApO1xuICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggZmlyZUxpc3RlbmVyICk7XG5cbiAgICAvLyBzb3VuZCBzdXBwb3J0XG4gICAgdGhpcy5vbklucHV0RW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gb3B0aW9ucy5zb3VuZFBsYXllci5wbGF5KCkgKTtcblxuICAgIC8vIHBkb20gLSBpbnB1dCBsaXN0ZW5lciBzbyB0aGF0IHVwZGF0ZXMgdGhlIHN0YXRlIG9mIHRoZSByYWRpbyBidXR0b24gd2l0aCBrZXlib2FyZCBpbnRlcmFjdGlvblxuICAgIGNvbnN0IGNoYW5nZUxpc3RlbmVyID0ge1xuICAgICAgY2hhbmdlOiBmaXJlXG4gICAgfTtcbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIGNoYW5nZUxpc3RlbmVyICk7XG5cbiAgICAvLyBwZG9tIC0gU3BlY2lmeSB0aGUgZGVmYXVsdCB2YWx1ZSBmb3IgYXNzaXN0aXZlIHRlY2hub2xvZ3kuIFRoaXMgYXR0cmlidXRlIGlzIG5lZWRlZCBpbiBhZGRpdGlvbiB0b1xuICAgIC8vIHRoZSAnY2hlY2tlZCcgUHJvcGVydHkgdG8gbWFyayB0aGlzIGVsZW1lbnQgYXMgdGhlIGRlZmF1bHQgc2VsZWN0aW9uIHNpbmNlICdjaGVja2VkJyBtYXkgYmUgc2V0IGJlZm9yZVxuICAgIC8vIHdlIGFyZSBmaW5pc2hlZCBhZGRpbmcgUmFkaW9CdXR0b25zIHRvIHRoZSBjb250YWluaW5nIGdyb3VwLCBhbmQgdGhlIGJyb3dzZXIgd2lsbCByZW1vdmUgdGhlIGJvb2xlYW5cbiAgICAvLyAnY2hlY2tlZCcgZmxhZyB3aGVuIG5ldyBidXR0b25zIGFyZSBhZGRlZC5cbiAgICBpZiAoIHByb3BlcnR5LnZhbHVlID09PSB2YWx1ZSApIHtcbiAgICAgIHRoaXMuc2V0UERPTUF0dHJpYnV0ZSggJ2NoZWNrZWQnLCAnY2hlY2tlZCcgKTtcbiAgICB9XG5cbiAgICAvLyBwZG9tIC0gd2hlbiB0aGUgUHJvcGVydHkgY2hhbmdlcywgbWFrZSBzdXJlIHRoZSBjb3JyZWN0IHJhZGlvIGJ1dHRvbiBpcyBtYXJrZWQgYXMgJ2NoZWNrZWQnIHNvIHRoYXQgdGhpcyBidXR0b25cbiAgICAvLyByZWNlaXZlcyBmb2N1cyBvbiAndGFiJ1xuICAgIGNvbnN0IHBkb21DaGVja2VkTGlzdGVuZXIgPSAoIG5ld1ZhbHVlOiBUICkgPT4ge1xuICAgICAgdGhpcy5wZG9tQ2hlY2tlZCA9ICggbmV3VmFsdWUgPT09IHZhbHVlICk7XG4gICAgfTtcbiAgICBwcm9wZXJ0eS5saW5rKCBwZG9tQ2hlY2tlZExpc3RlbmVyICk7XG5cbiAgICAvLyBwZG9tIC0gSWYgYW4gYWNjZXNzaWJsZU5hbWUgd2FzIG5vdCBwcm92aWRlZCwgc2VhcmNoIGZvciBvbmUgaW4gdGhlIGxhYmVsTm9kZVxuICAgIGlmICggIW9wdGlvbnMuYWNjZXNzaWJsZU5hbWUgKSB7XG4gICAgICBvcHRpb25zLmFjY2Vzc2libGVOYW1lID0gUERPTVV0aWxzLmZpbmRTdHJpbmdQcm9wZXJ0eSggbGFiZWxOb2RlICk7XG4gICAgfVxuXG4gICAgLy8gcGRvbSAtIGV2ZXJ5IGJ1dHRvbiBpbiBhIGdyb3VwIG9mIHJhZGlvIGJ1dHRvbnMgc2hvdWxkIGhhdmUgdGhlIHNhbWUgbmFtZSwgc2VlIG9wdGlvbnMgZm9yIG1vcmUgaW5mb1xuICAgIGlmICggb3B0aW9ucy5hMTF5TmFtZUF0dHJpYnV0ZSAhPT0gbnVsbCApIHtcbiAgICAgIHRoaXMuc2V0UERPTUF0dHJpYnV0ZSggJ25hbWUnLCBvcHRpb25zLmExMXlOYW1lQXR0cmlidXRlICk7XG4gICAgfVxuXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcblxuICAgIHRoaXMuZGlzcG9zZUFxdWFSYWRpb0J1dHRvbiA9ICgpID0+IHtcbiAgICAgIHRoaXMuY29uc3RyYWludC5kaXNwb3NlKCk7XG5cbiAgICAgIHRoaXMub25JbnB1dEVtaXR0ZXIuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5yZW1vdmVJbnB1dExpc3RlbmVyKCBmaXJlTGlzdGVuZXIgKTtcbiAgICAgIHRoaXMucmVtb3ZlSW5wdXRMaXN0ZW5lciggY2hhbmdlTGlzdGVuZXIgKTtcbiAgICAgIHByb3BlcnR5LnVubGluayggcGRvbUNoZWNrZWRMaXN0ZW5lciApO1xuICAgICAgcHJvcGVydHkudW5saW5rKCBzeW5jV2l0aE1vZGVsICk7XG5cbiAgICAgIGlmICggbGFiZWxOb2RlLmJvdW5kc1Byb3BlcnR5Lmhhc0xpc3RlbmVyKCBsYWJlbEJvdW5kc0xpc3RlbmVyICkgKSB7XG4gICAgICAgIGxhYmVsTm9kZS5ib3VuZHNQcm9wZXJ0eS51bmxpbmsoIGxhYmVsQm91bmRzTGlzdGVuZXIgKTtcbiAgICAgIH1cblxuICAgICAgLy8gcGhldC1pbzogVW5yZWdpc3RlciBsaXN0ZW5lclxuICAgICAgZmlyZUxpc3RlbmVyLmRpc3Bvc2UoKTtcbiAgICB9O1xuXG4gICAgLy8gRGVjb3JhdGluZyB3aXRoIGFkZGl0aW9uYWwgY29udGVudCBpcyBhbiBhbnRpLXBhdHRlcm4sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy84NjBcbiAgICBhc3NlcnQgJiYgYXNzZXJ0Tm9BZGRpdGlvbmFsQ2hpbGRyZW4oIHRoaXMgKTtcblxuICAgIC8vIHN1cHBvcnQgZm9yIGJpbmRlciBkb2N1bWVudGF0aW9uLCBzdHJpcHBlZCBvdXQgaW4gYnVpbGRzIGFuZCBvbmx5IHJ1bnMgd2hlbiA/YmluZGVyIGlzIHNwZWNpZmllZFxuICAgIGFzc2VydCAmJiB3aW5kb3cucGhldD8uY2hpcHBlcj8ucXVlcnlQYXJhbWV0ZXJzPy5iaW5kZXIgJiYgSW5zdGFuY2VSZWdpc3RyeS5yZWdpc3RlckRhdGFVUkwoICdzdW4nLCAnQXF1YVJhZGlvQnV0dG9uJywgdGhpcyApO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlQXF1YVJhZGlvQnV0dG9uKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbmNsYXNzIEFxdWFSYWRpb0J1dHRvbkNvbnN0cmFpbnQ8VD4gZXh0ZW5kcyBMYXlvdXRDb25zdHJhaW50IHtcbiAgcHJpdmF0ZSByZWFkb25seSByYWRpb0J1dHRvbjogQXF1YVJhZGlvQnV0dG9uPFQ+O1xuICBwcml2YXRlIHJlYWRvbmx5IHJhZGlvTm9kZTogTm9kZTtcbiAgcHJpdmF0ZSByZWFkb25seSBsYWJlbE5vZGU6IE5vZGU7XG4gIHByaXZhdGUgcmVhZG9ubHkgcmVjdGFuZ2xlOiBSZWN0YW5nbGU7XG4gIHByaXZhdGUgcmVhZG9ubHkgb3B0aW9uczogUmVxdWlyZWQ8U2VsZk9wdGlvbnM+O1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcmFkaW9CdXR0b246IEFxdWFSYWRpb0J1dHRvbjxUPiwgcmFkaW9Ob2RlOiBOb2RlLCBsYWJlbE5vZGU6IE5vZGUsIHJlY3RhbmdsZTogUmVjdGFuZ2xlLCBvcHRpb25zOiBSZXF1aXJlZDxTZWxmT3B0aW9ucz4gKSB7XG4gICAgc3VwZXIoIHJhZGlvQnV0dG9uICk7XG5cbiAgICB0aGlzLnJhZGlvQnV0dG9uID0gcmFkaW9CdXR0b247XG4gICAgdGhpcy5yYWRpb05vZGUgPSByYWRpb05vZGU7XG4gICAgdGhpcy5sYWJlbE5vZGUgPSBsYWJlbE5vZGU7XG4gICAgdGhpcy5yZWN0YW5nbGUgPSByZWN0YW5nbGU7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcblxuICAgIHRoaXMucmFkaW9CdXR0b24ubG9jYWxQcmVmZXJyZWRXaWR0aFByb3BlcnR5LmxhenlMaW5rKCB0aGlzLl91cGRhdGVMYXlvdXRMaXN0ZW5lciApO1xuXG4gICAgdGhpcy5hZGROb2RlKCBsYWJlbE5vZGUgKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBvdmVycmlkZSBsYXlvdXQoKTogdm9pZCB7XG4gICAgc3VwZXIubGF5b3V0KCk7XG5cbiAgICAvLyBMYXlvdXRQcm94eSBoZWxwcyB3aXRoIHNvbWUgbGF5b3V0IG9wZXJhdGlvbnMsIGFuZCB3aWxsIHN1cHBvcnQgYSBub24tY2hpbGQgY29udGVudC5cbiAgICBjb25zdCBsYWJlbE5vZGVQcm94eSA9IHRoaXMuY3JlYXRlTGF5b3V0UHJveHkoIHRoaXMubGFiZWxOb2RlICkhO1xuXG4gICAgY29uc3QgbGFiZWxOb2RlV2lkdGggPSBsYWJlbE5vZGVQcm94eS5taW5pbXVtV2lkdGg7XG5cbiAgICBjb25zdCBtaW5pbXVtV2lkdGggPSB0aGlzLnJhZGlvTm9kZS53aWR0aCArIHRoaXMub3B0aW9ucy54U3BhY2luZyArIGxhYmVsTm9kZVdpZHRoO1xuXG4gICAgY29uc3QgcHJlZmVycmVkV2lkdGggPSBNYXRoLm1heCggbWluaW11bVdpZHRoLCB0aGlzLnJhZGlvQnV0dG9uLmxvY2FsUHJlZmVycmVkV2lkdGggfHwgMCApO1xuXG4gICAgLy8gQXR0ZW1wdCB0byBzZXQgYSBwcmVmZXJyZWRXaWR0aFxuICAgIGlmICggaXNXaWR0aFNpemFibGUoIHRoaXMubGFiZWxOb2RlICkgKSB7XG4gICAgICBsYWJlbE5vZGVQcm94eS5wcmVmZXJyZWRXaWR0aCA9IHByZWZlcnJlZFdpZHRoIC0gdGhpcy5yYWRpb05vZGUud2lkdGggLSB0aGlzLm9wdGlvbnMueFNwYWNpbmc7XG4gICAgfVxuXG4gICAgbGFiZWxOb2RlUHJveHkubGVmdCA9IHRoaXMucmFkaW9Ob2RlLnJpZ2h0ICsgdGhpcy5vcHRpb25zLnhTcGFjaW5nO1xuICAgIGxhYmVsTm9kZVByb3h5LmNlbnRlclkgPSB0aGlzLnJhZGlvTm9kZS5jZW50ZXJZO1xuXG4gICAgLy8gT3VyIHJlY3RhbmdsZSBib3VuZHMgd2lsbCBjb3ZlciB0aGUgcmFkaW9Ob2RlIGFuZCBsYWJlbE5vZGUsIGFuZCBpZiBuZWNlc3NhcnkgZXhwYW5kIHRvIGluY2x1ZGUgdGhlIGZ1bGxcbiAgICAvLyBwcmVmZXJyZWRXaWR0aFxuICAgIHRoaXMucmVjdGFuZ2xlLnJlY3RCb3VuZHMgPSB0aGlzLnJhZGlvTm9kZS5ib3VuZHMudW5pb24oIGxhYmVsTm9kZVByb3h5LmJvdW5kcyApLndpdGhNYXhYKFxuICAgICAgTWF0aC5tYXgoIHRoaXMucmFkaW9Ob2RlLmxlZnQgKyBwcmVmZXJyZWRXaWR0aCwgbGFiZWxOb2RlUHJveHkucmlnaHQgKVxuICAgICk7XG5cbiAgICAvLyBVcGRhdGUgcG9pbnRlciBhcmVhcyAoaWYgdGhlIGNsaWVudCBoYXNuJ3QgY3VzdG9taXplZCB0aGVtKVxuICAgIHRoaXMucmFkaW9CdXR0b24uX2lzU2V0dGluZ0FyZWFzID0gdHJ1ZTtcbiAgICBpZiAoICF0aGlzLnJhZGlvQnV0dG9uLl9pc1RvdWNoQXJlYUN1c3RvbWl6ZWQgKSB7XG4gICAgICB0aGlzLnJhZGlvQnV0dG9uLnRvdWNoQXJlYSA9IHRoaXMucmFkaW9CdXR0b24ubG9jYWxCb3VuZHMuZGlsYXRlZFhZKCB0aGlzLm9wdGlvbnMudG91Y2hBcmVhWERpbGF0aW9uLCB0aGlzLm9wdGlvbnMudG91Y2hBcmVhWURpbGF0aW9uICk7XG4gICAgfVxuICAgIGlmICggIXRoaXMucmFkaW9CdXR0b24uX2lzTW91c2VBcmVhQ3VzdG9taXplZCApIHtcbiAgICAgIHRoaXMucmFkaW9CdXR0b24ubW91c2VBcmVhID0gdGhpcy5yYWRpb0J1dHRvbi5sb2NhbEJvdW5kcy5kaWxhdGVkWFkoIHRoaXMub3B0aW9ucy5tb3VzZUFyZWFYRGlsYXRpb24sIHRoaXMub3B0aW9ucy5tb3VzZUFyZWFZRGlsYXRpb24gKTtcbiAgICB9XG4gICAgdGhpcy5yYWRpb0J1dHRvbi5faXNTZXR0aW5nQXJlYXMgPSBmYWxzZTtcblxuICAgIGxhYmVsTm9kZVByb3h5LmRpc3Bvc2UoKTtcblxuICAgIC8vIFNldCB0aGUgbWluaW11bVdpZHRoIGxhc3QsIHNpbmNlIHRoaXMgbWF5IHRyaWdnZXIgYSByZWxheW91dFxuICAgIHRoaXMucmFkaW9CdXR0b24ubG9jYWxNaW5pbXVtV2lkdGggPSBtaW5pbXVtV2lkdGg7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLnJhZGlvQnV0dG9uLmxvY2FsUHJlZmVycmVkV2lkdGhQcm9wZXJ0eS51bmxpbmsoIHRoaXMuX3VwZGF0ZUxheW91dExpc3RlbmVyICk7XG5cbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cbn1cblxuc3VuLnJlZ2lzdGVyKCAnQXF1YVJhZGlvQnV0dG9uJywgQXF1YVJhZGlvQnV0dG9uICk7Il0sIm5hbWVzIjpbIkVtaXR0ZXIiLCJJbnN0YW5jZVJlZ2lzdHJ5Iiwib3B0aW9uaXplIiwiYXNzZXJ0Tm9BZGRpdGlvbmFsQ2hpbGRyZW4iLCJDaXJjbGUiLCJGaXJlTGlzdGVuZXIiLCJpc1dpZHRoU2l6YWJsZSIsIkxheW91dENvbnN0cmFpbnQiLCJOb2RlIiwiUERPTVV0aWxzIiwiUmVjdGFuZ2xlIiwiU2NlbmVyeUNvbnN0YW50cyIsIlZvaWNpbmciLCJXaWR0aFNpemFibGUiLCJtdWx0aVNlbGVjdGlvblNvdW5kUGxheWVyRmFjdG9yeSIsIlRhbmRlbSIsInN1biIsIkFxdWFSYWRpb0J1dHRvbiIsImRpc3Bvc2UiLCJkaXNwb3NlQXF1YVJhZGlvQnV0dG9uIiwicHJvcGVydHkiLCJ2YWx1ZSIsImxhYmVsTm9kZSIsInByb3ZpZGVkT3B0aW9ucyIsIndpbmRvdyIsImFzc2VydCIsInZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5Iiwib3B0aW9ucyIsImNlbnRlckNvbG9yIiwicmFkaXVzIiwiREVGQVVMVF9SQURJVVMiLCJzZWxlY3RlZENvbG9yIiwiZGVzZWxlY3RlZENvbG9yIiwieFNwYWNpbmciLCJzdHJva2UiLCJzb3VuZFBsYXllciIsImdldFNlbGVjdGlvblNvdW5kUGxheWVyIiwiYTExeU5hbWVBdHRyaWJ1dGUiLCJ0b3VjaEFyZWFYRGlsYXRpb24iLCJ0b3VjaEFyZWFZRGlsYXRpb24iLCJtb3VzZUFyZWFYRGlsYXRpb24iLCJtb3VzZUFyZWFZRGlsYXRpb24iLCJjdXJzb3IiLCJkaXNhYmxlZE9wYWNpdHkiLCJESVNBQkxFRF9PUEFDSVRZIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJ0YW5kZW1OYW1lU3VmZml4IiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsInBoZXRpb0ZlYXR1cmVkIiwicGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwidGFnTmFtZSIsImlucHV0VHlwZSIsImNvbnRhaW5lclRhZ05hbWUiLCJsYWJlbFRhZ05hbWUiLCJhcHBlbmRMYWJlbCIsImFwcGVuZERlc2NyaXB0aW9uIiwib25JbnB1dEVtaXR0ZXIiLCJfaXNNb3VzZUFyZWFDdXN0b21pemVkIiwiX2lzVG91Y2hBcmVhQ3VzdG9taXplZCIsIl9pc1NldHRpbmdBcmVhcyIsInNlbGVjdGVkTm9kZSIsImlubmVyQ2lyY2xlIiwiZmlsbCIsIm91dGVyQ2lyY2xlU2VsZWN0ZWQiLCJzZWxlY3RlZENpcmNsZUJ1dHRvbiIsImNoaWxkcmVuIiwiYWRkQ2hpbGQiLCJkZXNlbGVjdGVkTm9kZSIsImRlc2VsZWN0ZWRDaXJjbGVCdXR0b24iLCJyYWRpb05vZGUiLCJwaWNrYWJsZSIsImxhYmVsQm91bmRzTGlzdGVuZXIiLCJsZWZ0IiwicmlnaHQiLCJjZW50ZXJZIiwiYm91bmRzUHJvcGVydHkiLCJsaW5rIiwicmVjdGFuZ2xlIiwiY29uc3RyYWludCIsIkFxdWFSYWRpb0J1dHRvbkNvbnN0cmFpbnQiLCJ1cGRhdGVMYXlvdXQiLCJzeW5jV2l0aE1vZGVsIiwibmV3VmFsdWUiLCJ2aXNpYmxlIiwiZmlyZSIsIm9sZFZhbHVlIiwic2V0IiwiZW1pdCIsImZpcmVMaXN0ZW5lciIsImNyZWF0ZVRhbmRlbSIsImFkZElucHV0TGlzdGVuZXIiLCJhZGRMaXN0ZW5lciIsInBsYXkiLCJjaGFuZ2VMaXN0ZW5lciIsImNoYW5nZSIsInNldFBET01BdHRyaWJ1dGUiLCJwZG9tQ2hlY2tlZExpc3RlbmVyIiwicGRvbUNoZWNrZWQiLCJhY2Nlc3NpYmxlTmFtZSIsImZpbmRTdHJpbmdQcm9wZXJ0eSIsIm11dGF0ZSIsInJlbW92ZUlucHV0TGlzdGVuZXIiLCJ1bmxpbmsiLCJoYXNMaXN0ZW5lciIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwiYmluZGVyIiwicmVnaXN0ZXJEYXRhVVJMIiwibGF5b3V0IiwibGFiZWxOb2RlUHJveHkiLCJjcmVhdGVMYXlvdXRQcm94eSIsImxhYmVsTm9kZVdpZHRoIiwibWluaW11bVdpZHRoIiwid2lkdGgiLCJwcmVmZXJyZWRXaWR0aCIsIk1hdGgiLCJtYXgiLCJyYWRpb0J1dHRvbiIsImxvY2FsUHJlZmVycmVkV2lkdGgiLCJyZWN0Qm91bmRzIiwiYm91bmRzIiwidW5pb24iLCJ3aXRoTWF4WCIsInRvdWNoQXJlYSIsImxvY2FsQm91bmRzIiwiZGlsYXRlZFhZIiwibW91c2VBcmVhIiwibG9jYWxNaW5pbXVtV2lkdGgiLCJsb2NhbFByZWZlcnJlZFdpZHRoUHJvcGVydHkiLCJfdXBkYXRlTGF5b3V0TGlzdGVuZXIiLCJsYXp5TGluayIsImFkZE5vZGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EsYUFBYSwyQkFBMkI7QUFHL0MsT0FBT0Msc0JBQXNCLHVEQUF1RDtBQUNwRixPQUFPQyxlQUFlLGtDQUFrQztBQUV4RCxTQUFTQywwQkFBMEIsRUFBRUMsTUFBTSxFQUFFQyxZQUFZLEVBQUVDLGNBQWMsRUFBRUMsZ0JBQWdCLEVBQUVDLElBQUksRUFBZUMsU0FBUyxFQUFFQyxTQUFTLEVBQUVDLGdCQUFnQixFQUFrQ0MsT0FBTyxFQUFrQkMsWUFBWSxRQUFRLDhCQUE4QjtBQUNuUSxPQUFPQyxzQ0FBc0MscURBQXFEO0FBRWxHLE9BQU9DLFlBQVksNEJBQTRCO0FBQy9DLE9BQU9DLFNBQVMsV0FBVztBQXNDWixJQUFBLEFBQU1DLGtCQUFOLE1BQU1BLHdCQUEyQkosYUFBY0QsUUFBU0o7SUFvTXJEVSxVQUFnQjtRQUM5QixJQUFJLENBQUNDLHNCQUFzQjtRQUMzQixLQUFLLENBQUNEO0lBQ1I7SUFuTEE7Ozs7O0dBS0MsR0FDRCxZQUFvQkUsUUFBc0IsRUFBRUMsS0FBUSxFQUFFQyxTQUFlLEVBQUVDLGVBQXdDLENBQUc7WUF1S3RHQyxzQ0FBQUEsc0JBQUFBO1FBdEtWQyxVQUFVQSxPQUFRTCxTQUFTTSx1QkFBdUIsS0FBSyxhQUNyRDtRQUVGLE1BQU1DLFVBQVV6QixZQUFpRTtZQUUvRSxjQUFj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