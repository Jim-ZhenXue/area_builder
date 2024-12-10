// Copyright 2021-2024, University of Colorado Boulder
/**
 * A ToggleSwitch decorated with a visual label and description with layout for each. To be used in the
 * PreferencesDialog.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Marla Schulz (PhET Interactive Simulations)
 */ import optionize from '../../../phet-core/js/optionize.js';
import { GridBox, SceneryConstants } from '../../../scenery/js/imports.js';
import joist from '../joist.js';
// Layout using GridBox and layoutOptions will accomplish the following when all components are available.
// [[labelNode]]         [[ToggleSwitch]]
// [[descriptionNode                   ]]
let PreferencesControl = class PreferencesControl extends GridBox {
    constructor(providedOptions){
        const options = optionize()({
            headingControl: false,
            labelSpacing: 10,
            allowDescriptionStretch: true,
            valueLabelXSpacing: 8,
            ySpacing: 5,
            nestedContent: [],
            grow: 1,
            layoutOptions: {
                stretch: !(providedOptions == null ? void 0 : providedOptions.headingControl)
            }
        }, providedOptions);
        super(options);
        if (options.controlNode) {
            assert && assert(options.controlNode.layoutOptions === null, 'PreferencesControl will control layout');
            this.enabledProperty.link((enabled)=>{
                options.controlNode.enabled = enabled;
            });
            options.controlNode.layoutOptions = {
                row: 0,
                column: 1,
                xAlign: 'right'
            };
            this.addChild(options.controlNode);
        }
        if (options.labelNode) {
            assert && assert(options.labelNode.layoutOptions === null, 'PreferencesControl will control layout');
            options.labelNode.layoutOptions = {
                row: 0,
                column: 0,
                xAlign: 'left',
                rightMargin: options.labelSpacing
            };
            this.addChild(options.labelNode);
        }
        // descriptionNode will be in the second row if a labelNode is provided.
        if (options.descriptionNode && options.labelNode) {
            assert && assert(options.descriptionNode.layoutOptions === null, 'PreferencesControl will control layout');
            const layoutOptions = {
                row: 1,
                column: 0,
                horizontalSpan: 2,
                xAlign: 'left'
            };
            // Allows the description to stretch and takes up a minimum width, so that the control aligns with other contents.
            if (options.allowDescriptionStretch) {
                layoutOptions.minContentWidth = 480;
                layoutOptions.stretch = true;
            }
            options.descriptionNode.layoutOptions = layoutOptions;
            this.addChild(options.descriptionNode);
        } else if (options.descriptionNode) {
            assert && assert(options.descriptionNode.layoutOptions === null, 'PreferencesControl will control layout');
            options.descriptionNode.layoutOptions = {
                row: 0,
                column: 0,
                xAlign: 'left'
            };
            this.addChild(options.descriptionNode);
        }
        // This component manages disabledOpacity, we don't want it to compound over subcomponents.
        this.disabledOpacity = SceneryConstants.DISABLED_OPACITY;
    }
};
joist.register('PreferencesControl', PreferencesControl);
export default PreferencesControl;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL3ByZWZlcmVuY2VzL1ByZWZlcmVuY2VzQ29udHJvbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIFRvZ2dsZVN3aXRjaCBkZWNvcmF0ZWQgd2l0aCBhIHZpc3VhbCBsYWJlbCBhbmQgZGVzY3JpcHRpb24gd2l0aCBsYXlvdXQgZm9yIGVhY2guIFRvIGJlIHVzZWQgaW4gdGhlXG4gKiBQcmVmZXJlbmNlc0RpYWxvZy5cbiAqXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgTWFybGEgU2NodWx6IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBHcmlkQm94LCBHcmlkQm94T3B0aW9ucywgTm9kZSwgU2NlbmVyeUNvbnN0YW50cywgVExheW91dE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IGpvaXN0IGZyb20gJy4uL2pvaXN0LmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyBpZiBwcm92aWRlZCwgYSBsYWJlbCBOb2RlIHRvIHRoZSBsZWZ0IG9mIHRoZSB0b2dnbGUgc3dpdGNoIGNvbnRyb2xcbiAgbGFiZWxOb2RlPzogTm9kZTtcblxuICAvLyBob3Jpem9udGFsIHNwYWNpbmcgYmV0d2VlbiBsYWJlbCBmb3IgdGhlIGNvbXBvbmVudCBhbmQgdG9nZ2xlIHN3aXRjaCBJRiB0aGVyZSBpcyBubyBkZXNjcmlwdGlvbk5vZGUuXG4gIC8vIElmIGEgZGVzY3JpcHRpb25Ob2RlIGlzIHByb3ZpZGVkLCBsYXlvdXQgb2YgdGhlIGxhYmVsTm9kZSB3aWxsIGJlIHJlbGF0aXZlIHRvIHRoZSBkZXNjcmlwdGlvbi5cbiAgbGFiZWxTcGFjaW5nPzogbnVtYmVyO1xuXG4gIC8vIGhvcml6b250YWwgc3BhY2luZyBiZXR3ZWVuIHRoZSB0b2dnbGUgc3dpdGNoIGFuZCBsZWZ0L3JpZ2h0IHZhbHVlIGxhYmVsc1xuICB2YWx1ZUxhYmVsWFNwYWNpbmc/OiBudW1iZXI7XG5cbiAgLy8gaWYgcHJvdmlkZWQsIGEgTm9kZSB1bmRlciB0aGUgVG9nZ2xlU3dpdGNoIGFuZCBsYWJlbCB0aGF0IGlzIG1lYW50IHRvIGRlc2NyaWJlIHRoZSBwdXJwb3NlIG9mIHRoZSBzd2l0Y2hcbiAgZGVzY3JpcHRpb25Ob2RlPzogTm9kZTtcblxuICAvLyBJZiB0cnVlLCB0aGUgZGVzY3JpcHRpb24gY2VsbCB3aWxsIHN0cmV0Y2ggdG8gYSBtaW5pbXVtIGNvbnRlbnQgd2lkdGgsIGFuZCB0aGUgY29udHJvbCB3aWxsIGJlIHB1c2hlZCBvdXQgdG8gYWxpZ25cbiAgLy8gd2l0aCB0aGF0IHdpZHRoLiBUaGlzIG1ha2VzIHRoZSBjb250cm9sIGFsaWduIHdpdGggb3RoZXIgY29udHJvbHMgaW4gdGhlIGRpYWxvZy4gRGlzYWJsZSBpZiB5b3Ugd2FudCB0aGUgY29udHJvbFxuICAvLyB0byBhbHdheXMgYmUgcmlnaHQgYWxpZ25lZCB3aXRoIHRoZSBkZXNjcmlwdGlvbi5cbiAgYWxsb3dEZXNjcmlwdGlvblN0cmV0Y2g/OiBib29sZWFuO1xuXG4gIC8vIHZlcnRpY2FsIHNwYWNpbmcgYmV0d2VlbiBUb2dnbGVTd2l0Y2ggYW5kIGRlc2NyaXB0aW9uIE5vZGVcbiAgeVNwYWNpbmc/OiBudW1iZXI7XG5cbiAgY29udHJvbE5vZGU/OiBOb2RlO1xuXG4gIG5lc3RlZENvbnRlbnQ/OiBBcnJheTxOb2RlPjtcblxuICBoZWFkaW5nQ29udHJvbD86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBQcmVmZXJlbmNlc0NvbnRyb2xPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBHcmlkQm94T3B0aW9ucztcblxuLy8gTGF5b3V0IHVzaW5nIEdyaWRCb3ggYW5kIGxheW91dE9wdGlvbnMgd2lsbCBhY2NvbXBsaXNoIHRoZSBmb2xsb3dpbmcgd2hlbiBhbGwgY29tcG9uZW50cyBhcmUgYXZhaWxhYmxlLlxuLy8gW1tsYWJlbE5vZGVdXSAgICAgICAgIFtbVG9nZ2xlU3dpdGNoXV1cbi8vIFtbZGVzY3JpcHRpb25Ob2RlICAgICAgICAgICAgICAgICAgIF1dXG5jbGFzcyBQcmVmZXJlbmNlc0NvbnRyb2wgZXh0ZW5kcyBHcmlkQm94IHtcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBQcmVmZXJlbmNlc0NvbnRyb2xPcHRpb25zICkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UHJlZmVyZW5jZXNDb250cm9sT3B0aW9ucywgU3RyaWN0T21pdDxTZWxmT3B0aW9ucywgJ2xhYmVsTm9kZScgfCAnZGVzY3JpcHRpb25Ob2RlJyB8ICdjb250cm9sTm9kZSc+LCBHcmlkQm94T3B0aW9ucz4oKSgge1xuICAgICAgaGVhZGluZ0NvbnRyb2w6IGZhbHNlLFxuICAgICAgbGFiZWxTcGFjaW5nOiAxMCxcbiAgICAgIGFsbG93RGVzY3JpcHRpb25TdHJldGNoOiB0cnVlLFxuICAgICAgdmFsdWVMYWJlbFhTcGFjaW5nOiA4LFxuICAgICAgeVNwYWNpbmc6IDUsXG4gICAgICBuZXN0ZWRDb250ZW50OiBbXSxcbiAgICAgIGdyb3c6IDEsXG4gICAgICBsYXlvdXRPcHRpb25zOiB7XG4gICAgICAgIHN0cmV0Y2g6ICFwcm92aWRlZE9wdGlvbnM/LmhlYWRpbmdDb250cm9sXG4gICAgICB9XG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBzdXBlciggb3B0aW9ucyApO1xuXG4gICAgaWYgKCBvcHRpb25zLmNvbnRyb2xOb2RlICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5jb250cm9sTm9kZS5sYXlvdXRPcHRpb25zID09PSBudWxsLCAnUHJlZmVyZW5jZXNDb250cm9sIHdpbGwgY29udHJvbCBsYXlvdXQnICk7XG4gICAgICB0aGlzLmVuYWJsZWRQcm9wZXJ0eS5saW5rKCBlbmFibGVkID0+IHtcbiAgICAgICAgb3B0aW9ucy5jb250cm9sTm9kZSEuZW5hYmxlZCA9IGVuYWJsZWQ7XG4gICAgICB9ICk7XG5cbiAgICAgIG9wdGlvbnMuY29udHJvbE5vZGUubGF5b3V0T3B0aW9ucyA9IHtcbiAgICAgICAgcm93OiAwLFxuICAgICAgICBjb2x1bW46IDEsXG4gICAgICAgIHhBbGlnbjogJ3JpZ2h0J1xuICAgICAgfTtcblxuICAgICAgdGhpcy5hZGRDaGlsZCggb3B0aW9ucy5jb250cm9sTm9kZSApO1xuICAgIH1cblxuICAgIGlmICggb3B0aW9ucy5sYWJlbE5vZGUgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLmxhYmVsTm9kZS5sYXlvdXRPcHRpb25zID09PSBudWxsLCAnUHJlZmVyZW5jZXNDb250cm9sIHdpbGwgY29udHJvbCBsYXlvdXQnICk7XG4gICAgICBvcHRpb25zLmxhYmVsTm9kZS5sYXlvdXRPcHRpb25zID0ge1xuICAgICAgICByb3c6IDAsXG4gICAgICAgIGNvbHVtbjogMCxcbiAgICAgICAgeEFsaWduOiAnbGVmdCcsXG4gICAgICAgIHJpZ2h0TWFyZ2luOiBvcHRpb25zLmxhYmVsU3BhY2luZ1xuICAgICAgfTtcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIG9wdGlvbnMubGFiZWxOb2RlICk7XG4gICAgfVxuXG4gICAgLy8gZGVzY3JpcHRpb25Ob2RlIHdpbGwgYmUgaW4gdGhlIHNlY29uZCByb3cgaWYgYSBsYWJlbE5vZGUgaXMgcHJvdmlkZWQuXG4gICAgaWYgKCBvcHRpb25zLmRlc2NyaXB0aW9uTm9kZSAmJiBvcHRpb25zLmxhYmVsTm9kZSApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuZGVzY3JpcHRpb25Ob2RlLmxheW91dE9wdGlvbnMgPT09IG51bGwsICdQcmVmZXJlbmNlc0NvbnRyb2wgd2lsbCBjb250cm9sIGxheW91dCcgKTtcblxuICAgICAgY29uc3QgbGF5b3V0T3B0aW9uczogVExheW91dE9wdGlvbnMgPSB7XG4gICAgICAgIHJvdzogMSxcbiAgICAgICAgY29sdW1uOiAwLFxuICAgICAgICBob3Jpem9udGFsU3BhbjogMixcbiAgICAgICAgeEFsaWduOiAnbGVmdCdcbiAgICAgIH07XG5cbiAgICAgIC8vIEFsbG93cyB0aGUgZGVzY3JpcHRpb24gdG8gc3RyZXRjaCBhbmQgdGFrZXMgdXAgYSBtaW5pbXVtIHdpZHRoLCBzbyB0aGF0IHRoZSBjb250cm9sIGFsaWducyB3aXRoIG90aGVyIGNvbnRlbnRzLlxuICAgICAgaWYgKCBvcHRpb25zLmFsbG93RGVzY3JpcHRpb25TdHJldGNoICkge1xuICAgICAgICBsYXlvdXRPcHRpb25zLm1pbkNvbnRlbnRXaWR0aCA9IDQ4MDtcbiAgICAgICAgbGF5b3V0T3B0aW9ucy5zdHJldGNoID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgb3B0aW9ucy5kZXNjcmlwdGlvbk5vZGUubGF5b3V0T3B0aW9ucyA9IGxheW91dE9wdGlvbnM7XG4gICAgICB0aGlzLmFkZENoaWxkKCBvcHRpb25zLmRlc2NyaXB0aW9uTm9kZSApO1xuICAgIH1cblxuXG4gICAgLy8gZGVzY3JpcHRpb25Ob2RlIHdpbGwgYmUgaW4gdGhlIGZpcnN0IHJvdyBpZiBsYWJlbE5vZGUgaXMgbm90IHByb3ZpZGVkLlxuICAgIGVsc2UgaWYgKCBvcHRpb25zLmRlc2NyaXB0aW9uTm9kZSApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuZGVzY3JpcHRpb25Ob2RlLmxheW91dE9wdGlvbnMgPT09IG51bGwsICdQcmVmZXJlbmNlc0NvbnRyb2wgd2lsbCBjb250cm9sIGxheW91dCcgKTtcbiAgICAgIG9wdGlvbnMuZGVzY3JpcHRpb25Ob2RlLmxheW91dE9wdGlvbnMgPSB7XG4gICAgICAgIHJvdzogMCxcbiAgICAgICAgY29sdW1uOiAwLFxuICAgICAgICB4QWxpZ246ICdsZWZ0J1xuICAgICAgfTtcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIG9wdGlvbnMuZGVzY3JpcHRpb25Ob2RlICk7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBjb21wb25lbnQgbWFuYWdlcyBkaXNhYmxlZE9wYWNpdHksIHdlIGRvbid0IHdhbnQgaXQgdG8gY29tcG91bmQgb3ZlciBzdWJjb21wb25lbnRzLlxuICAgIHRoaXMuZGlzYWJsZWRPcGFjaXR5ID0gU2NlbmVyeUNvbnN0YW50cy5ESVNBQkxFRF9PUEFDSVRZO1xuICB9XG59XG5cbmpvaXN0LnJlZ2lzdGVyKCAnUHJlZmVyZW5jZXNDb250cm9sJywgUHJlZmVyZW5jZXNDb250cm9sICk7XG5leHBvcnQgZGVmYXVsdCBQcmVmZXJlbmNlc0NvbnRyb2w7Il0sIm5hbWVzIjpbIm9wdGlvbml6ZSIsIkdyaWRCb3giLCJTY2VuZXJ5Q29uc3RhbnRzIiwiam9pc3QiLCJQcmVmZXJlbmNlc0NvbnRyb2wiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiaGVhZGluZ0NvbnRyb2wiLCJsYWJlbFNwYWNpbmciLCJhbGxvd0Rlc2NyaXB0aW9uU3RyZXRjaCIsInZhbHVlTGFiZWxYU3BhY2luZyIsInlTcGFjaW5nIiwibmVzdGVkQ29udGVudCIsImdyb3ciLCJsYXlvdXRPcHRpb25zIiwic3RyZXRjaCIsImNvbnRyb2xOb2RlIiwiYXNzZXJ0IiwiZW5hYmxlZFByb3BlcnR5IiwibGluayIsImVuYWJsZWQiLCJyb3ciLCJjb2x1bW4iLCJ4QWxpZ24iLCJhZGRDaGlsZCIsImxhYmVsTm9kZSIsInJpZ2h0TWFyZ2luIiwiZGVzY3JpcHRpb25Ob2RlIiwiaG9yaXpvbnRhbFNwYW4iLCJtaW5Db250ZW50V2lkdGgiLCJkaXNhYmxlZE9wYWNpdHkiLCJESVNBQkxFRF9PUEFD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