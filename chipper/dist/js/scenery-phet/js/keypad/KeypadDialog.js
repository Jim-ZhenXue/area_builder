// Copyright 2022-2024, University of Colorado Boulder
/**
 * KeypadDialog is a Dialog sub-type that handles the creation and management of a Keypad.
 *
 * The KeypadDialog is shown when requested through the beginEdit() method, which occurs when the user presses on a
 * BallValuesPanelNumberDisplay, to allow the user to manipulate a Ball Property. Edits must be within a specified
 * range. There will be a 'Enter' button to allow the user to submit a edit, and edits are canceled if the user hides
 * the Dialog.
 *
 * KeypadDialog is created at the start of the sim and is never disposed, so no dispose method is necessary and
 * internal links are left as-is.
 *
 * @author Brandon Li
 */ import PatternStringProperty from '../../../axon/js/PatternStringProperty.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import Keypad from '../../../scenery-phet/js/keypad/Keypad.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { Color, KeyboardListener, Node, Rectangle, RichText, Text, VBox } from '../../../scenery/js/imports.js';
import RectangularPushButton from '../../../sun/js/buttons/RectangularPushButton.js';
import Dialog from '../../../sun/js/Dialog.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sceneryPhet from '../sceneryPhet.js';
import SceneryPhetStrings from '../SceneryPhetStrings.js';
let KeypadDialog = class KeypadDialog extends Dialog {
    /**
   * Begins an edit by showing the KeypadDialog. Called when the user presses on a BallValuesPanelNumberDisplay to allow
   * the user to manipulate a Ball.
   *
   * @param editValue - the function called when a edit in-range successfully occurs.
   * @param valueRange - the Range that the user can edit the valueProperty
   * @param patternStringProperty - the template string that formats the text on the rangeText.
   * @param editFinishedCallback - callback when edit is entered or canceled.
   */ beginEdit(editValue, valueRange, patternStringProperty, editFinishedCallback) {
        this.keypad.clear();
        // Update references. These references are released when the edit is canceled or finished.
        this.editValue = editValue;
        this.valueRange = valueRange;
        this.editFinishedCallback = editFinishedCallback;
        // Clear a previous value out if it exists
        this.rangeStringProperty && this.rangeStringProperty.dispose();
        this.rangeStringProperty = new PatternStringProperty(patternStringProperty, {
            min: valueRange.min,
            max: valueRange.max
        }, {
            tandem: Tandem.OPT_OUT
        });
        this.rangeText.mutate({
            stringProperty: this.rangeStringProperty
        });
        // Display the KeypadDialog.
        this.show();
    }
    /**
   * Attempts to submit the current Keypad edit. If the edit is valid, the valueProperty is set and the edit is
   * finished. Otherwise, the edit is invalid, and the warnOutOfRange() method is invoked.
   *
   * This is called when the user presses the 'Enter' button.
   */ submitEdit() {
        // If the user didn't enter anything, treat this as a cancel.
        if (this.keypad.stringProperty.value === '') {
            this.finishEdit();
            return;
        }
        // Retrieve the value from the Keypad
        const value = this.keypad.valueProperty.value;
        // If the edit is valid, the valueProperty is set and the edit.
        if (value !== null && Number.isFinite(value) && (!this.valueRange || this.valueRange.contains(value))) {
            this.editValue !== null && this.editValue(value);
            this.finishEdit();
        } else {
            this.warnOutOfRange();
        }
    }
    /**
   * Changes the text colors of the Value and the Range Text to indicate that a entered Edit is out of range.
   */ warnOutOfRange() {
        this.valueText.fill = this.errorTextColor;
        this.rangeText.fill = this.errorTextColor;
        this.keypad.setClearOnNextKeyPress(true);
    }
    /**
   * Convenience method to finish the KeypadDialog.
   *
   * This method is invoked when a edit is canceled or when a valid edit is entered.
   */ finishEdit() {
        this.hide(); // Hide the KeypadDialog
        this.keypad.clear(); // Clear the Keypad
        // Release references.
        this.valueRange = null;
        this.editFinishedCallback = null;
    }
    /**
   * Hides the dialog. Overridden to also call the editFinishedCallback function when edits are canceled.
   */ hide() {
        this.editFinishedCallback && this.editFinishedCallback();
        super.hide();
    }
    dispose() {
        this.disposeKeypadDialog();
        super.dispose();
    }
    constructor(providedOptions){
        const options = optionize()({
            font: new PhetFont(15),
            valueBoxWidth: 85,
            valueYMargin: 3,
            contentSpacing: 10,
            useRichTextRange: false,
            keypadLayout: Keypad.PositiveAndNegativeFloatingPointLayout,
            keypadDefaultTextColor: Color.BLACK,
            keypadErrorTextColor: Color.RED,
            enterButtonOptions: {
            },
            keypadOptions: {},
            tandem: Tandem.OPTIONAL // TODO: is this optional or required? https://github.com/phetsims/scenery-phet/issues/540
        }, providedOptions);
        //----------------------------------------------------------------------------------------
        // Reference the content of the Dialog. Children are added later.
        const contentNode = new VBox({
            spacing: options.contentSpacing,
            align: 'center'
        });
        const keypad = new Keypad(options.keypadLayout, combineOptions({}, options.keypadOptions, {
            tandem: Tandem.OPT_OUT
        }));
        options.focusOnShowNode = keypad;
        super(contentNode, options), // Reference to the function called when a edit in-range successfully occurs. If null, the Keypad dialog is currently
        // not shown.
        this.editValue = null, // Reference to the Range of the value that the Keypad is editing, if non-null.
        this.valueRange = null, // Reference to a potential callback function for when the Keypad is finished editing. This is provided by the client
        // in the beginEdit() method.
        this.editFinishedCallback = null, // So we can dispose it
        this.rangeStringProperty = null;
        this.defaultTextColor = options.keypadDefaultTextColor;
        this.errorTextColor = options.keypadErrorTextColor;
        this.keypad = keypad;
        this.rangeText = options.useRichTextRange ? new RichText('', {
            font: options.font,
            maxWidth: this.keypad.width
        }) : new Text('', {
            font: options.font,
            maxWidth: this.keypad.width
        });
        this.valueText = new Text('', {
            font: options.font
        });
        // Create the Background to the valueText Node.
        const valueBackgroundNode = new Rectangle(0, 0, options.valueBoxWidth, this.height + 2 * options.valueYMargin, {
            cornerRadius: 3,
            fill: Color.WHITE,
            stroke: Color.BLACK
        });
        const valueDisplayBox = new Node({
            children: [
                valueBackgroundNode,
                this.valueText
            ]
        });
        // Create the enterButton, which allows the user to submit an Edit.
        const enterText = new Text(SceneryPhetStrings.key.enterStringProperty, {
            font: options.font,
            maxWidth: this.keypad.width // constrain width for i18n
        });
        const enterButton = new RectangularPushButton(combineOptions({
            listener: this.submitEdit.bind(this),
            content: enterText,
            accessibleName: SceneryPhetStrings.key.enterStringProperty,
            tandem: Tandem.OPT_OUT
        }, options.enterButtonOptions));
        // Set the children of the content of the KeypadDialog, in the correct rendering order.
        contentNode.children = [
            this.rangeText,
            valueDisplayBox,
            this.keypad,
            enterButton
        ];
        //----------------------------------------------------------------------------------------
        // Observe when the Keypad is edited and update our valueText display. Link is never disposed as KeypadDialogs
        // are never disposed.
        this.keypad.stringProperty.link((string)=>{
            this.valueText.string = string;
            this.valueText.center = valueBackgroundNode.center;
        });
        // Observe when a key is pressed and reset text colors. Link is never disposed.
        this.keypad.accumulatedKeysProperty.link(()=>{
            this.valueText.fill = this.defaultTextColor;
            this.rangeText.fill = this.defaultTextColor;
        });
        const submitFromKeypadListener = new KeyboardListener({
            keys: [
                'space',
                'enter'
            ],
            fireOnDown: false,
            fire: ()=>this.submitEdit()
        });
        this.keypad.addInputListener(submitFromKeypadListener);
        this.disposeKeypadDialog = ()=>{
            submitFromKeypadListener.dispose();
            this.keypad.dispose();
            this.rangeStringProperty && this.rangeStringProperty.dispose();
            enterText.dispose(); // linked to a translated string Property
        };
    }
};
sceneryPhet.register('KeypadDialog', KeypadDialog);
export default KeypadDialog;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9rZXlwYWQvS2V5cGFkRGlhbG9nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEtleXBhZERpYWxvZyBpcyBhIERpYWxvZyBzdWItdHlwZSB0aGF0IGhhbmRsZXMgdGhlIGNyZWF0aW9uIGFuZCBtYW5hZ2VtZW50IG9mIGEgS2V5cGFkLlxuICpcbiAqIFRoZSBLZXlwYWREaWFsb2cgaXMgc2hvd24gd2hlbiByZXF1ZXN0ZWQgdGhyb3VnaCB0aGUgYmVnaW5FZGl0KCkgbWV0aG9kLCB3aGljaCBvY2N1cnMgd2hlbiB0aGUgdXNlciBwcmVzc2VzIG9uIGFcbiAqIEJhbGxWYWx1ZXNQYW5lbE51bWJlckRpc3BsYXksIHRvIGFsbG93IHRoZSB1c2VyIHRvIG1hbmlwdWxhdGUgYSBCYWxsIFByb3BlcnR5LiBFZGl0cyBtdXN0IGJlIHdpdGhpbiBhIHNwZWNpZmllZFxuICogcmFuZ2UuIFRoZXJlIHdpbGwgYmUgYSAnRW50ZXInIGJ1dHRvbiB0byBhbGxvdyB0aGUgdXNlciB0byBzdWJtaXQgYSBlZGl0LCBhbmQgZWRpdHMgYXJlIGNhbmNlbGVkIGlmIHRoZSB1c2VyIGhpZGVzXG4gKiB0aGUgRGlhbG9nLlxuICpcbiAqIEtleXBhZERpYWxvZyBpcyBjcmVhdGVkIGF0IHRoZSBzdGFydCBvZiB0aGUgc2ltIGFuZCBpcyBuZXZlciBkaXNwb3NlZCwgc28gbm8gZGlzcG9zZSBtZXRob2QgaXMgbmVjZXNzYXJ5IGFuZFxuICogaW50ZXJuYWwgbGlua3MgYXJlIGxlZnQgYXMtaXMuXG4gKlxuICogQGF1dGhvciBCcmFuZG9uIExpXG4gKi9cblxuaW1wb3J0IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1BhdHRlcm5TdHJpbmdQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCBLZXlwYWQsIHsgS2V5cGFkTGF5b3V0LCBLZXlwYWRPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2tleXBhZC9LZXlwYWQuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgeyBDb2xvciwgRm9udCwgS2V5Ym9hcmRMaXN0ZW5lciwgTm9kZSwgUmVjdGFuZ2xlLCBSaWNoVGV4dCwgVENvbG9yLCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBSZWN0YW5ndWxhclB1c2hCdXR0b24sIHsgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JlY3Rhbmd1bGFyUHVzaEJ1dHRvbi5qcyc7XG5pbXBvcnQgRGlhbG9nLCB7IERpYWxvZ09wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9zdW4vanMvRGlhbG9nLmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vc2NlbmVyeVBoZXQuanMnO1xuaW1wb3J0IFNjZW5lcnlQaGV0U3RyaW5ncyBmcm9tICcuLi9TY2VuZXJ5UGhldFN0cmluZ3MuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICAvLyBGb250IHVzZWQgZm9yIGFsbCBUZXh0IGluc3RhbmNlcyB3aXRoaW4gdGhlIERpYWxvZy5cbiAgZm9udD86IEZvbnQ7XG5cbiAgLy8gV2lkdGggb2YgdGhlIHZhbHVlIGZpZWxkLCBoZWlnaHQgZGV0ZXJtaW5lZCBieSB2YWx1ZUZvbnQuXG4gIHZhbHVlQm94V2lkdGg/OiBudW1iZXI7XG5cbiAgLy8gVmVydGljYWwgbWFyZ2luIGluc2lkZSB0aGUgdmFsdWUgYm94LlxuICB2YWx1ZVlNYXJnaW4/OiBudW1iZXI7XG5cbiAgLy8gVmVydGljYWwgc3BhY2luZyBiZXR3ZWVuIHRoZSBjb250ZW50IG9mIHRoZSBLZXlwYWREaWFsb2cuXG4gIGNvbnRlbnRTcGFjaW5nPzogbnVtYmVyO1xuXG4gIC8vIElmIHRydWUsIHRoZSByYW5nZSBUZXh0IHdpbGwgYmUgY3JlYXRlZCBhcyBhIFJpY2hUZXh0XG4gIHVzZVJpY2hUZXh0UmFuZ2U/OiBib29sZWFuO1xuXG4gIGtleXBhZExheW91dD86IEtleXBhZExheW91dDtcblxuICBrZXlwYWRPcHRpb25zPzogU3RyaWN0T21pdDxLZXlwYWRPcHRpb25zLCAndGFuZGVtJz47XG5cbiAgZW50ZXJCdXR0b25PcHRpb25zPzogUmVjdGFuZ3VsYXJQdXNoQnV0dG9uT3B0aW9ucztcblxuICBrZXlwYWREZWZhdWx0VGV4dENvbG9yPzogVENvbG9yO1xuICBrZXlwYWRFcnJvclRleHRDb2xvcj86IFRDb2xvcjtcbn07XG5cbmV4cG9ydCB0eXBlIEtleXBhZERpYWxvZ09wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8RGlhbG9nT3B0aW9ucywgJ2ZvY3VzT25TaG93Tm9kZSc+O1xuXG5jbGFzcyBLZXlwYWREaWFsb2cgZXh0ZW5kcyBEaWFsb2cge1xuXG4gIC8vIFJlZmVyZW5jZSB0byB0aGUgZnVuY3Rpb24gY2FsbGVkIHdoZW4gYSBlZGl0IGluLXJhbmdlIHN1Y2Nlc3NmdWxseSBvY2N1cnMuIElmIG51bGwsIHRoZSBLZXlwYWQgZGlhbG9nIGlzIGN1cnJlbnRseVxuICAvLyBub3Qgc2hvd24uXG4gIHByaXZhdGUgZWRpdFZhbHVlOiAoICggdmFsdWU6IG51bWJlciApID0+IHZvaWQgKSB8IG51bGwgPSBudWxsO1xuXG4gIC8vIFJlZmVyZW5jZSB0byB0aGUgUmFuZ2Ugb2YgdGhlIHZhbHVlIHRoYXQgdGhlIEtleXBhZCBpcyBlZGl0aW5nLCBpZiBub24tbnVsbC5cbiAgcHJpdmF0ZSB2YWx1ZVJhbmdlOiBSYW5nZSB8IG51bGwgPSBudWxsO1xuXG4gIC8vIFJlZmVyZW5jZSB0byBhIHBvdGVudGlhbCBjYWxsYmFjayBmdW5jdGlvbiBmb3Igd2hlbiB0aGUgS2V5cGFkIGlzIGZpbmlzaGVkIGVkaXRpbmcuIFRoaXMgaXMgcHJvdmlkZWQgYnkgdGhlIGNsaWVudFxuICAvLyBpbiB0aGUgYmVnaW5FZGl0KCkgbWV0aG9kLlxuICBwcml2YXRlIGVkaXRGaW5pc2hlZENhbGxiYWNrOiAoICgpID0+IHZvaWQgKSB8IG51bGwgPSBudWxsO1xuXG4gIC8vIFRoZSBLZXlwYWQgb2YgdGhlIEtleXBhZERpYWxvZ1xuICBwcml2YXRlIHJlYWRvbmx5IGtleXBhZDogS2V5cGFkO1xuXG4gIC8vIFRoZSBUZXh0IE5vZGUgdGhhdCBkaXNwbGF5cyB0aGUgUmFuZ2Ugb2YgdGhlIGN1cnJlbnQgZWRpdC5cbiAgcHJpdmF0ZSByZWFkb25seSByYW5nZVRleHQ6IFRleHQgfCBSaWNoVGV4dDtcblxuICAvLyBTbyB3ZSBjYW4gZGlzcG9zZSBpdFxuICBwcml2YXRlIHJhbmdlU3RyaW5nUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4gfCBudWxsID0gbnVsbDtcblxuICAvLyBUaGUgVGV4dCBOb2RlIHRoYXQgc2hvd3MgdGhlIGN1cnJlbnQgdmFsdWUgb2YgdGhlIEtleXBhZCBlZGl0LlxuICBwcml2YXRlIHJlYWRvbmx5IHZhbHVlVGV4dDogVGV4dDtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRlZmF1bHRUZXh0Q29sb3I6IFRDb2xvcjtcbiAgcHJpdmF0ZSByZWFkb25seSBlcnJvclRleHRDb2xvcjogVENvbG9yO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUtleXBhZERpYWxvZzogKCkgPT4gdm9pZDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IEtleXBhZERpYWxvZ09wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEtleXBhZERpYWxvZ09wdGlvbnMsIFNlbGZPcHRpb25zLCBEaWFsb2dPcHRpb25zPigpKCB7XG5cbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTUgKSxcblxuICAgICAgdmFsdWVCb3hXaWR0aDogODUsXG4gICAgICB2YWx1ZVlNYXJnaW46IDMsXG4gICAgICBjb250ZW50U3BhY2luZzogMTAsXG5cbiAgICAgIHVzZVJpY2hUZXh0UmFuZ2U6IGZhbHNlLFxuXG4gICAgICBrZXlwYWRMYXlvdXQ6IEtleXBhZC5Qb3NpdGl2ZUFuZE5lZ2F0aXZlRmxvYXRpbmdQb2ludExheW91dCxcblxuICAgICAga2V5cGFkRGVmYXVsdFRleHRDb2xvcjogQ29sb3IuQkxBQ0ssXG4gICAgICBrZXlwYWRFcnJvclRleHRDb2xvcjogQ29sb3IuUkVELFxuXG4gICAgICBlbnRlckJ1dHRvbk9wdGlvbnM6IHtcbiAgICAgICAgLy8gYmFzZUNvbG9yOiBDb2xsaXNpb25MYWJDb2xvcnMuS0VZUEFEX0VOVEVSX0JVVFRPTixcbiAgICAgIH0sXG4gICAgICBrZXlwYWRPcHRpb25zOiB7fSxcblxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUSU9OQUwgLy8gVE9ETzogaXMgdGhpcyBvcHRpb25hbCBvciByZXF1aXJlZD8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvNTQwXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vIFJlZmVyZW5jZSB0aGUgY29udGVudCBvZiB0aGUgRGlhbG9nLiBDaGlsZHJlbiBhcmUgYWRkZWQgbGF0ZXIuXG4gICAgY29uc3QgY29udGVudE5vZGUgPSBuZXcgVkJveCggeyBzcGFjaW5nOiBvcHRpb25zLmNvbnRlbnRTcGFjaW5nLCBhbGlnbjogJ2NlbnRlcicgfSApO1xuXG4gICAgY29uc3Qga2V5cGFkID0gbmV3IEtleXBhZCggb3B0aW9ucy5rZXlwYWRMYXlvdXQsIGNvbWJpbmVPcHRpb25zPEtleXBhZE9wdGlvbnM+KCB7fSwgb3B0aW9ucy5rZXlwYWRPcHRpb25zLCB7XG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXG4gICAgfSApICk7XG5cbiAgICBvcHRpb25zLmZvY3VzT25TaG93Tm9kZSA9IGtleXBhZDtcblxuICAgIHN1cGVyKCBjb250ZW50Tm9kZSwgb3B0aW9ucyApO1xuXG4gICAgdGhpcy5kZWZhdWx0VGV4dENvbG9yID0gb3B0aW9ucy5rZXlwYWREZWZhdWx0VGV4dENvbG9yO1xuICAgIHRoaXMuZXJyb3JUZXh0Q29sb3IgPSBvcHRpb25zLmtleXBhZEVycm9yVGV4dENvbG9yO1xuXG4gICAgdGhpcy5rZXlwYWQgPSBrZXlwYWQ7XG4gICAgdGhpcy5yYW5nZVRleHQgPSBvcHRpb25zLnVzZVJpY2hUZXh0UmFuZ2VcbiAgICAgICAgICAgICAgICAgICAgID8gbmV3IFJpY2hUZXh0KCAnJywgeyBmb250OiBvcHRpb25zLmZvbnQsIG1heFdpZHRoOiB0aGlzLmtleXBhZC53aWR0aCB9IClcbiAgICAgICAgICAgICAgICAgICAgIDogbmV3IFRleHQoICcnLCB7IGZvbnQ6IG9wdGlvbnMuZm9udCwgbWF4V2lkdGg6IHRoaXMua2V5cGFkLndpZHRoIH0gKTtcbiAgICB0aGlzLnZhbHVlVGV4dCA9IG5ldyBUZXh0KCAnJywgeyBmb250OiBvcHRpb25zLmZvbnQgfSApO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBCYWNrZ3JvdW5kIHRvIHRoZSB2YWx1ZVRleHQgTm9kZS5cbiAgICBjb25zdCB2YWx1ZUJhY2tncm91bmROb2RlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgb3B0aW9ucy52YWx1ZUJveFdpZHRoLCB0aGlzLmhlaWdodCArIDIgKiBvcHRpb25zLnZhbHVlWU1hcmdpbiwge1xuICAgICAgY29ybmVyUmFkaXVzOiAzLFxuICAgICAgZmlsbDogQ29sb3IuV0hJVEUsXG4gICAgICBzdHJva2U6IENvbG9yLkJMQUNLXG4gICAgfSApO1xuXG4gICAgY29uc3QgdmFsdWVEaXNwbGF5Qm94ID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgdmFsdWVCYWNrZ3JvdW5kTm9kZSwgdGhpcy52YWx1ZVRleHQgXSB9ICk7XG5cbiAgICAvLyBDcmVhdGUgdGhlIGVudGVyQnV0dG9uLCB3aGljaCBhbGxvd3MgdGhlIHVzZXIgdG8gc3VibWl0IGFuIEVkaXQuXG4gICAgY29uc3QgZW50ZXJUZXh0ID0gbmV3IFRleHQoIFNjZW5lcnlQaGV0U3RyaW5ncy5rZXkuZW50ZXJTdHJpbmdQcm9wZXJ0eSwge1xuICAgICAgZm9udDogb3B0aW9ucy5mb250LFxuICAgICAgbWF4V2lkdGg6IHRoaXMua2V5cGFkLndpZHRoIC8vIGNvbnN0cmFpbiB3aWR0aCBmb3IgaTE4blxuICAgIH0gKTtcbiAgICBjb25zdCBlbnRlckJ1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIGNvbWJpbmVPcHRpb25zPFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbk9wdGlvbnM+KCB7XG4gICAgICBsaXN0ZW5lcjogdGhpcy5zdWJtaXRFZGl0LmJpbmQoIHRoaXMgKSxcblxuICAgICAgY29udGVudDogZW50ZXJUZXh0LFxuICAgICAgYWNjZXNzaWJsZU5hbWU6IFNjZW5lcnlQaGV0U3RyaW5ncy5rZXkuZW50ZXJTdHJpbmdQcm9wZXJ0eSxcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgICB9LCBvcHRpb25zLmVudGVyQnV0dG9uT3B0aW9ucyApICk7XG5cbiAgICAvLyBTZXQgdGhlIGNoaWxkcmVuIG9mIHRoZSBjb250ZW50IG9mIHRoZSBLZXlwYWREaWFsb2csIGluIHRoZSBjb3JyZWN0IHJlbmRlcmluZyBvcmRlci5cbiAgICBjb250ZW50Tm9kZS5jaGlsZHJlbiA9IFtcbiAgICAgIHRoaXMucmFuZ2VUZXh0LFxuICAgICAgdmFsdWVEaXNwbGF5Qm94LFxuICAgICAgdGhpcy5rZXlwYWQsXG4gICAgICBlbnRlckJ1dHRvblxuICAgIF07XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vIE9ic2VydmUgd2hlbiB0aGUgS2V5cGFkIGlzIGVkaXRlZCBhbmQgdXBkYXRlIG91ciB2YWx1ZVRleHQgZGlzcGxheS4gTGluayBpcyBuZXZlciBkaXNwb3NlZCBhcyBLZXlwYWREaWFsb2dzXG4gICAgLy8gYXJlIG5ldmVyIGRpc3Bvc2VkLlxuICAgIHRoaXMua2V5cGFkLnN0cmluZ1Byb3BlcnR5LmxpbmsoIHN0cmluZyA9PiB7XG4gICAgICB0aGlzLnZhbHVlVGV4dC5zdHJpbmcgPSBzdHJpbmc7XG4gICAgICB0aGlzLnZhbHVlVGV4dC5jZW50ZXIgPSB2YWx1ZUJhY2tncm91bmROb2RlLmNlbnRlcjtcbiAgICB9ICk7XG5cbiAgICAvLyBPYnNlcnZlIHdoZW4gYSBrZXkgaXMgcHJlc3NlZCBhbmQgcmVzZXQgdGV4dCBjb2xvcnMuIExpbmsgaXMgbmV2ZXIgZGlzcG9zZWQuXG4gICAgdGhpcy5rZXlwYWQuYWNjdW11bGF0ZWRLZXlzUHJvcGVydHkubGluayggKCkgPT4ge1xuICAgICAgdGhpcy52YWx1ZVRleHQuZmlsbCA9IHRoaXMuZGVmYXVsdFRleHRDb2xvcjtcbiAgICAgIHRoaXMucmFuZ2VUZXh0LmZpbGwgPSB0aGlzLmRlZmF1bHRUZXh0Q29sb3I7XG4gICAgfSApO1xuXG4gICAgY29uc3Qgc3VibWl0RnJvbUtleXBhZExpc3RlbmVyID0gbmV3IEtleWJvYXJkTGlzdGVuZXIoIHtcbiAgICAgIGtleXM6IFsgJ3NwYWNlJywgJ2VudGVyJyBdLFxuICAgICAgZmlyZU9uRG93bjogZmFsc2UsXG4gICAgICBmaXJlOiAoKSA9PiB0aGlzLnN1Ym1pdEVkaXQoKVxuICAgIH0gKTtcbiAgICB0aGlzLmtleXBhZC5hZGRJbnB1dExpc3RlbmVyKCBzdWJtaXRGcm9tS2V5cGFkTGlzdGVuZXIgKTtcblxuICAgIHRoaXMuZGlzcG9zZUtleXBhZERpYWxvZyA9ICgpID0+IHtcbiAgICAgIHN1Ym1pdEZyb21LZXlwYWRMaXN0ZW5lci5kaXNwb3NlKCk7XG4gICAgICB0aGlzLmtleXBhZC5kaXNwb3NlKCk7XG4gICAgICB0aGlzLnJhbmdlU3RyaW5nUHJvcGVydHkgJiYgdGhpcy5yYW5nZVN0cmluZ1Byb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICAgIGVudGVyVGV4dC5kaXNwb3NlKCk7IC8vIGxpbmtlZCB0byBhIHRyYW5zbGF0ZWQgc3RyaW5nIFByb3BlcnR5XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCZWdpbnMgYW4gZWRpdCBieSBzaG93aW5nIHRoZSBLZXlwYWREaWFsb2cuIENhbGxlZCB3aGVuIHRoZSB1c2VyIHByZXNzZXMgb24gYSBCYWxsVmFsdWVzUGFuZWxOdW1iZXJEaXNwbGF5IHRvIGFsbG93XG4gICAqIHRoZSB1c2VyIHRvIG1hbmlwdWxhdGUgYSBCYWxsLlxuICAgKlxuICAgKiBAcGFyYW0gZWRpdFZhbHVlIC0gdGhlIGZ1bmN0aW9uIGNhbGxlZCB3aGVuIGEgZWRpdCBpbi1yYW5nZSBzdWNjZXNzZnVsbHkgb2NjdXJzLlxuICAgKiBAcGFyYW0gdmFsdWVSYW5nZSAtIHRoZSBSYW5nZSB0aGF0IHRoZSB1c2VyIGNhbiBlZGl0IHRoZSB2YWx1ZVByb3BlcnR5XG4gICAqIEBwYXJhbSBwYXR0ZXJuU3RyaW5nUHJvcGVydHkgLSB0aGUgdGVtcGxhdGUgc3RyaW5nIHRoYXQgZm9ybWF0cyB0aGUgdGV4dCBvbiB0aGUgcmFuZ2VUZXh0LlxuICAgKiBAcGFyYW0gZWRpdEZpbmlzaGVkQ2FsbGJhY2sgLSBjYWxsYmFjayB3aGVuIGVkaXQgaXMgZW50ZXJlZCBvciBjYW5jZWxlZC5cbiAgICovXG4gIHB1YmxpYyBiZWdpbkVkaXQoIGVkaXRWYWx1ZTogKCB2YWx1ZTogbnVtYmVyICkgPT4gdm9pZCwgdmFsdWVSYW5nZTogUmFuZ2UsIHBhdHRlcm5TdHJpbmdQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiwgZWRpdEZpbmlzaGVkQ2FsbGJhY2s6ICgpID0+IHZvaWQgKTogdm9pZCB7XG5cbiAgICB0aGlzLmtleXBhZC5jbGVhcigpO1xuXG4gICAgLy8gVXBkYXRlIHJlZmVyZW5jZXMuIFRoZXNlIHJlZmVyZW5jZXMgYXJlIHJlbGVhc2VkIHdoZW4gdGhlIGVkaXQgaXMgY2FuY2VsZWQgb3IgZmluaXNoZWQuXG4gICAgdGhpcy5lZGl0VmFsdWUgPSBlZGl0VmFsdWU7XG4gICAgdGhpcy52YWx1ZVJhbmdlID0gdmFsdWVSYW5nZTtcbiAgICB0aGlzLmVkaXRGaW5pc2hlZENhbGxiYWNrID0gZWRpdEZpbmlzaGVkQ2FsbGJhY2s7XG5cbiAgICAvLyBDbGVhciBhIHByZXZpb3VzIHZhbHVlIG91dCBpZiBpdCBleGlzdHNcbiAgICB0aGlzLnJhbmdlU3RyaW5nUHJvcGVydHkgJiYgdGhpcy5yYW5nZVN0cmluZ1Byb3BlcnR5LmRpc3Bvc2UoKTtcblxuICAgIHRoaXMucmFuZ2VTdHJpbmdQcm9wZXJ0eSA9IG5ldyBQYXR0ZXJuU3RyaW5nUHJvcGVydHkoIHBhdHRlcm5TdHJpbmdQcm9wZXJ0eSwge1xuICAgICAgbWluOiB2YWx1ZVJhbmdlLm1pbixcbiAgICAgIG1heDogdmFsdWVSYW5nZS5tYXhcbiAgICB9LCB7IHRhbmRlbTogVGFuZGVtLk9QVF9PVVQgfSApO1xuICAgIHRoaXMucmFuZ2VUZXh0Lm11dGF0ZSgge1xuICAgICAgc3RyaW5nUHJvcGVydHk6IHRoaXMucmFuZ2VTdHJpbmdQcm9wZXJ0eVxuICAgIH0gKTtcblxuICAgIC8vIERpc3BsYXkgdGhlIEtleXBhZERpYWxvZy5cbiAgICB0aGlzLnNob3coKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRlbXB0cyB0byBzdWJtaXQgdGhlIGN1cnJlbnQgS2V5cGFkIGVkaXQuIElmIHRoZSBlZGl0IGlzIHZhbGlkLCB0aGUgdmFsdWVQcm9wZXJ0eSBpcyBzZXQgYW5kIHRoZSBlZGl0IGlzXG4gICAqIGZpbmlzaGVkLiBPdGhlcndpc2UsIHRoZSBlZGl0IGlzIGludmFsaWQsIGFuZCB0aGUgd2Fybk91dE9mUmFuZ2UoKSBtZXRob2QgaXMgaW52b2tlZC5cbiAgICpcbiAgICogVGhpcyBpcyBjYWxsZWQgd2hlbiB0aGUgdXNlciBwcmVzc2VzIHRoZSAnRW50ZXInIGJ1dHRvbi5cbiAgICovXG4gIHByaXZhdGUgc3VibWl0RWRpdCgpOiB2b2lkIHtcblxuICAgIC8vIElmIHRoZSB1c2VyIGRpZG4ndCBlbnRlciBhbnl0aGluZywgdHJlYXQgdGhpcyBhcyBhIGNhbmNlbC5cbiAgICBpZiAoIHRoaXMua2V5cGFkLnN0cmluZ1Byb3BlcnR5LnZhbHVlID09PSAnJyApIHtcbiAgICAgIHRoaXMuZmluaXNoRWRpdCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFJldHJpZXZlIHRoZSB2YWx1ZSBmcm9tIHRoZSBLZXlwYWRcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMua2V5cGFkLnZhbHVlUHJvcGVydHkudmFsdWU7XG5cbiAgICAvLyBJZiB0aGUgZWRpdCBpcyB2YWxpZCwgdGhlIHZhbHVlUHJvcGVydHkgaXMgc2V0IGFuZCB0aGUgZWRpdC5cbiAgICBpZiAoIHZhbHVlICE9PSBudWxsICYmIE51bWJlci5pc0Zpbml0ZSggdmFsdWUgKSAmJiAoICF0aGlzLnZhbHVlUmFuZ2UgfHwgdGhpcy52YWx1ZVJhbmdlLmNvbnRhaW5zKCB2YWx1ZSApICkgKSB7XG4gICAgICB0aGlzLmVkaXRWYWx1ZSAhPT0gbnVsbCAmJiB0aGlzLmVkaXRWYWx1ZSggdmFsdWUgKTtcbiAgICAgIHRoaXMuZmluaXNoRWRpdCgpO1xuICAgIH1cbiAgICBlbHNlIHsgdGhpcy53YXJuT3V0T2ZSYW5nZSgpOyB9XG4gIH1cblxuICAvKipcbiAgICogQ2hhbmdlcyB0aGUgdGV4dCBjb2xvcnMgb2YgdGhlIFZhbHVlIGFuZCB0aGUgUmFuZ2UgVGV4dCB0byBpbmRpY2F0ZSB0aGF0IGEgZW50ZXJlZCBFZGl0IGlzIG91dCBvZiByYW5nZS5cbiAgICovXG4gIHByaXZhdGUgd2Fybk91dE9mUmFuZ2UoKTogdm9pZCB7XG4gICAgdGhpcy52YWx1ZVRleHQuZmlsbCA9IHRoaXMuZXJyb3JUZXh0Q29sb3I7XG4gICAgdGhpcy5yYW5nZVRleHQuZmlsbCA9IHRoaXMuZXJyb3JUZXh0Q29sb3I7XG4gICAgdGhpcy5rZXlwYWQuc2V0Q2xlYXJPbk5leHRLZXlQcmVzcyggdHJ1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlbmllbmNlIG1ldGhvZCB0byBmaW5pc2ggdGhlIEtleXBhZERpYWxvZy5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgaXMgaW52b2tlZCB3aGVuIGEgZWRpdCBpcyBjYW5jZWxlZCBvciB3aGVuIGEgdmFsaWQgZWRpdCBpcyBlbnRlcmVkLlxuICAgKi9cbiAgcHJpdmF0ZSBmaW5pc2hFZGl0KCk6IHZvaWQge1xuICAgIHRoaXMuaGlkZSgpOyAvLyBIaWRlIHRoZSBLZXlwYWREaWFsb2dcbiAgICB0aGlzLmtleXBhZC5jbGVhcigpOyAvLyBDbGVhciB0aGUgS2V5cGFkXG5cbiAgICAvLyBSZWxlYXNlIHJlZmVyZW5jZXMuXG4gICAgdGhpcy52YWx1ZVJhbmdlID0gbnVsbDtcbiAgICB0aGlzLmVkaXRGaW5pc2hlZENhbGxiYWNrID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBIaWRlcyB0aGUgZGlhbG9nLiBPdmVycmlkZGVuIHRvIGFsc28gY2FsbCB0aGUgZWRpdEZpbmlzaGVkQ2FsbGJhY2sgZnVuY3Rpb24gd2hlbiBlZGl0cyBhcmUgY2FuY2VsZWQuXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgaGlkZSgpOiB2b2lkIHtcbiAgICB0aGlzLmVkaXRGaW5pc2hlZENhbGxiYWNrICYmIHRoaXMuZWRpdEZpbmlzaGVkQ2FsbGJhY2soKTtcblxuICAgIHN1cGVyLmhpZGUoKTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZUtleXBhZERpYWxvZygpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ0tleXBhZERpYWxvZycsIEtleXBhZERpYWxvZyApO1xuZXhwb3J0IGRlZmF1bHQgS2V5cGFkRGlhbG9nOyJdLCJuYW1lcyI6WyJQYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIktleXBhZCIsIlBoZXRGb250IiwiQ29sb3IiLCJLZXlib2FyZExpc3RlbmVyIiwiTm9kZSIsIlJlY3RhbmdsZSIsIlJpY2hUZXh0IiwiVGV4dCIsIlZCb3giLCJSZWN0YW5ndWxhclB1c2hCdXR0b24iLCJEaWFsb2ciLCJUYW5kZW0iLCJzY2VuZXJ5UGhldCIsIlNjZW5lcnlQaGV0U3RyaW5ncyIsIktleXBhZERpYWxvZyIsImJlZ2luRWRpdCIsImVkaXRWYWx1ZSIsInZhbHVlUmFuZ2UiLCJwYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJlZGl0RmluaXNoZWRDYWxsYmFjayIsImtleXBhZCIsImNsZWFyIiwicmFuZ2VTdHJpbmdQcm9wZXJ0eSIsImRpc3Bvc2UiLCJtaW4iLCJtYXgiLCJ0YW5kZW0iLCJPUFRfT1VUIiwicmFuZ2VUZXh0IiwibXV0YXRlIiwic3RyaW5nUHJvcGVydHkiLCJzaG93Iiwic3VibWl0RWRpdCIsInZhbHVlIiwiZmluaXNoRWRpdCIsInZhbHVlUHJvcGVydHkiLCJOdW1iZXIiLCJpc0Zpbml0ZSIsImNvbnRhaW5zIiwid2Fybk91dE9mUmFuZ2UiLCJ2YWx1ZVRleHQiLCJmaWxsIiwiZXJyb3JUZXh0Q29sb3IiLCJzZXRDbGVhck9uTmV4dEtleVByZXNzIiwiaGlkZSIsImRpc3Bvc2VLZXlwYWREaWFsb2ciLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiZm9udCIsInZhbHVlQm94V2lkdGgiLCJ2YWx1ZVlNYXJnaW4iLCJjb250ZW50U3BhY2luZyIsInVzZVJpY2hUZXh0UmFuZ2UiLCJrZXlwYWRMYXlvdXQiLCJQb3NpdGl2ZUFuZE5lZ2F0aXZlRmxvYXRpbmdQb2ludExheW91dCIsImtleXBhZERlZmF1bHRUZXh0Q29sb3IiLCJCTEFDSyIsImtleXBhZEVycm9yVGV4dENvbG9yIiwiUkVEIiwiZW50ZXJCdXR0b25PcHRpb25zIiwia2V5cGFkT3B0aW9ucyIsIk9QVElPTkFMIiwiY29udGVudE5vZGUiLCJzcGFjaW5nIiwiYWxpZ24iLCJmb2N1c09uU2hvd05vZGUiLCJkZWZhdWx0VGV4dENvbG9yIiwibWF4V2lkdGgiLCJ3aWR0aCIsInZhbHVlQmFja2dyb3VuZE5vZGUiLCJoZWlnaHQiLCJjb3JuZXJSYWRpdXMiLCJXSElURSIsInN0cm9rZSIsInZhbHVlRGlzcGxheUJveCIsImNoaWxkcmVuIiwiZW50ZXJUZXh0Iiwia2V5IiwiZW50ZXJTdHJpbmdQcm9wZXJ0eSIsImVudGVyQnV0dG9uIiwibGlzdGVuZXIiLCJiaW5kIiwiY29udGVudCIsImFjY2Vzc2libGVOYW1lIiwibGluayIsInN0cmluZyIsImNlbnRlciIsImFjY3VtdWxhdGVkS2V5c1Byb3BlcnR5Iiwic3VibWl0RnJvbUtleXBhZExpc3RlbmVyIiwia2V5cyIsImZpcmVPbkRvd24iLCJmaXJlIiwiYWRkSW5wdXRMaXN0ZW5lciIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7OztDQVlDLEdBRUQsT0FBT0EsMkJBQTJCLDRDQUE0QztBQUc5RSxPQUFPQyxhQUFhQyxjQUFjLFFBQVEscUNBQXFDO0FBRS9FLE9BQU9DLFlBQTZDLDRDQUE0QztBQUNoRyxP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