// Copyright 2015-2024, University of Colorado Boulder
/**
 * DemosScreenView is the base class for ScreenViews that use a carousel to select a demo.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Property from '../../../axon/js/Property.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import optionize from '../../../phet-core/js/optionize.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CarouselComboBox from '../CarouselComboBox.js';
import sun from '../sun.js';
import sunQueryParameters from '../sunQueryParameters.js';
// constants
const COMBO_BOX_ITEM_FONT = new PhetFont(14);
let DemosScreenView = class DemosScreenView extends ScreenView {
    constructor(demos, providedOptions){
        const options = optionize()({
            // DemosScreenViewOptions
            selectedDemoLabel: sunQueryParameters.component,
            cacheDemos: false,
            // ScreenViewOptions
            tandem: Tandem.OPTIONAL
        }, providedOptions);
        super(options);
        const demosParent = new Node();
        const layoutBounds = this.layoutBounds;
        // Support PhET-iO API instrumentation and API tracking
        if (Tandem.PHET_IO_ENABLED) {
            options.cacheDemos = true;
            demos.forEach((demo)=>{
                demo.node = demo.createNode(layoutBounds, {
                    tandem: options.tandem.createTandem(`demo${demo.tandemName ? demo.tandemName : demo.label}`)
                });
                demo.node.visible = false;
                demosParent.addChild(demo.node);
            });
        }
        // All demos will be children of this node, to maintain rendering order with combo box list
        this.addChild(demosParent);
        // Sort the demos by label, so that they appear in the combo box in alphabetical order
        demos = _.sortBy(demos, (demo)=>{
            return demo.label;
        });
        // The initial demo that is selected, allow grace for query parameter support
        const selectedDemo = options.selectedDemoLabel ? _.find(demos, (demo)=>demo.label === options.selectedDemoLabel) || demos[0] : demos[0];
        // {Property.<Demo>} the demo that is currently selected
        const selectedDemoProperty = new Property(selectedDemo);
        const selectADemoLabel = new Text('Select a Demo:', {
            font: new PhetFont(16)
        });
        this.addChild(selectADemoLabel);
        // {ComboBoxItem[]}
        const items = demos.map((demo)=>{
            return {
                value: demo,
                createNode: ()=>new Text(demo.label, {
                        font: COMBO_BOX_ITEM_FONT
                    })
            };
        });
        const carouselComboBox = new CarouselComboBox(selectedDemoProperty, items, {
            tandem: options.tandem.createTandem('carouselComboBox')
        });
        this.addChild(carouselComboBox);
        // Layout, with button vertically centered on label.
        selectADemoLabel.left = this.layoutBounds.left + 20;
        carouselComboBox.left = selectADemoLabel.right + 10;
        carouselComboBox.top = this.layoutBounds.top + 20;
        selectADemoLabel.centerY = carouselComboBox.visibleBounds.centerY;
        // Make the selected demo visible
        selectedDemoProperty.link((demo, oldDemo)=>{
            // clean up the previously selected demo
            if (oldDemo) {
                const oldDemoNode = oldDemo.node;
                if (options.cacheDemos) {
                    // make the old demo invisible
                    oldDemoNode.visible = false;
                } else {
                    // Delete the old demo.  Note that this will ONLY call the dispose function on the component being demoed if
                    // that component is the only thing provided as a demo node, or if the demo node is subclassed and provides
                    // its own dispose function.  If the demo node is a VBox or something of that nature, the dispose function of
                    // the demoed component(s) will not be invoked.  See https://github.com/phetsims/sun/issues/386.
                    demosParent.removeChild(oldDemoNode);
                    oldDemoNode.dispose();
                    oldDemo.node = null;
                }
            }
            if (demo.node) {
                // If the selected demo has an associated node, make it visible.
                demo.node.visible = true;
            } else {
                // If the selected demo doesn't doesn't have an associated node, create it.
                demo.node = demo.createNode(layoutBounds, {
                    tandem: options.tandem.createTandem(`demo${demo.tandemName ? demo.tandemName : demo.label}`)
                });
                demosParent.addChild(demo.node);
            }
        });
    }
};
sun.register('DemosScreenView', DemosScreenView);
export default DemosScreenView;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL0RlbW9zU2NyZWVuVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZW1vc1NjcmVlblZpZXcgaXMgdGhlIGJhc2UgY2xhc3MgZm9yIFNjcmVlblZpZXdzIHRoYXQgdXNlIGEgY2Fyb3VzZWwgdG8gc2VsZWN0IGEgZGVtby5cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBTY3JlZW5WaWV3LCB7IFNjcmVlblZpZXdPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFBpY2tPcHRpb25hbCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja09wdGlvbmFsLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xuaW1wb3J0IHsgTm9kZSwgTm9kZU9wdGlvbnMsIFRleHQgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBDYXJvdXNlbENvbWJvQm94IGZyb20gJy4uL0Nhcm91c2VsQ29tYm9Cb3guanMnO1xuaW1wb3J0IHN1biBmcm9tICcuLi9zdW4uanMnO1xuaW1wb3J0IHN1blF1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi9zdW5RdWVyeVBhcmFtZXRlcnMuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IENPTUJPX0JPWF9JVEVNX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDE0ICk7XG5cbmV4cG9ydCB0eXBlIFN1bkRlbW9PcHRpb25zID0gTm9kZU9wdGlvbnM7XG5cbnR5cGUgRGVtb0l0ZW1OYW1lID0gc3RyaW5nO1xuXG5leHBvcnQgdHlwZSBEZW1vSXRlbURhdGEgPSB7XG5cbiAgLy8gc3RyaW5nIHVzZWQgdG8gbGFiZWwgdGhlIGRlbW8gaW4gQ29tYm9Cb3hcbiAgbGFiZWw6IERlbW9JdGVtTmFtZTtcblxuICAvLyBjcmVhdGVzIHRoZSBOb2RlIGZvciB0aGUgZGVtb1xuICBjcmVhdGVOb2RlOiAoIGxheW91dEJvdW5kczogQm91bmRzMiwgb3B0aW9uczogU3VuRGVtb09wdGlvbnMgKSA9PiBOb2RlO1xuXG4gIG5vZGU/OiBOb2RlIHwgbnVsbCB8IHVuZGVmaW5lZDtcblxuICB0YW5kZW1OYW1lPzogc3RyaW5nO1xufTtcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyBsYWJlbCBmaWVsZCBvZiB0aGUgRGVtb0l0ZW1EYXRhIHRvIGJlIHNlbGVjdGVkIGluaXRpYWxseSwgZGVmYXVsdHMgdG8gdGhlIGZpcnN0IGRlbW8gYWZ0ZXIgc29ydGluZ1xuICBzZWxlY3RlZERlbW9MYWJlbD86IERlbW9JdGVtTmFtZSB8IG51bGw7XG5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzM4NlxuICAvLyB0cnVlID0gY2FjaGVzIE5vZGVzIGZvciBhbGwgZGVtb3MgdGhhdCBoYXZlIGJlZW4gc2VsZWN0ZWRcbiAgLy8gZmFsc2UgPSBrZWVwcyBvbmx5IHRoZSBOb2RlIGZvciB0aGUgc2VsZWN0ZWQgZGVtbyBpbiBtZW1vcnlcbiAgY2FjaGVEZW1vcz86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBEZW1vc1NjcmVlblZpZXdPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PFNjcmVlblZpZXdPcHRpb25zLCAndGFuZGVtJz4gJlxuICBQaWNrT3B0aW9uYWw8U2NyZWVuVmlld09wdGlvbnMsICd0YW5kZW0nPjtcblxuY2xhc3MgRGVtb3NTY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBkZW1vczogRGVtb0l0ZW1EYXRhW10sIHByb3ZpZGVkT3B0aW9ucz86IERlbW9zU2NyZWVuVmlld09wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPERlbW9zU2NyZWVuVmlld09wdGlvbnMsIFNlbGZPcHRpb25zLCBTY3JlZW5WaWV3T3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyBEZW1vc1NjcmVlblZpZXdPcHRpb25zXG4gICAgICBzZWxlY3RlZERlbW9MYWJlbDogc3VuUXVlcnlQYXJhbWV0ZXJzLmNvbXBvbmVudCxcbiAgICAgIGNhY2hlRGVtb3M6IGZhbHNlLFxuXG4gICAgICAvLyBTY3JlZW5WaWV3T3B0aW9uc1xuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUSU9OQUxcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIHN1cGVyKCBvcHRpb25zICk7XG5cbiAgICBjb25zdCBkZW1vc1BhcmVudCA9IG5ldyBOb2RlKCk7XG4gICAgY29uc3QgbGF5b3V0Qm91bmRzID0gdGhpcy5sYXlvdXRCb3VuZHM7XG5cbiAgICAvLyBTdXBwb3J0IFBoRVQtaU8gQVBJIGluc3RydW1lbnRhdGlvbiBhbmQgQVBJIHRyYWNraW5nXG4gICAgaWYgKCBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICkge1xuICAgICAgb3B0aW9ucy5jYWNoZURlbW9zID0gdHJ1ZTtcblxuICAgICAgZGVtb3MuZm9yRWFjaCggZGVtbyA9PiB7XG4gICAgICAgIGRlbW8ubm9kZSA9IGRlbW8uY3JlYXRlTm9kZSggbGF5b3V0Qm91bmRzLCB7XG4gICAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oIGBkZW1vJHtkZW1vLnRhbmRlbU5hbWUgPyBkZW1vLnRhbmRlbU5hbWUgOiBkZW1vLmxhYmVsfWAgKVxuICAgICAgICB9ICk7XG4gICAgICAgIGRlbW8ubm9kZS52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIGRlbW9zUGFyZW50LmFkZENoaWxkKCBkZW1vLm5vZGUgKTtcbiAgICAgIH0gKTtcbiAgICB9XG5cbiAgICAvLyBBbGwgZGVtb3Mgd2lsbCBiZSBjaGlsZHJlbiBvZiB0aGlzIG5vZGUsIHRvIG1haW50YWluIHJlbmRlcmluZyBvcmRlciB3aXRoIGNvbWJvIGJveCBsaXN0XG4gICAgdGhpcy5hZGRDaGlsZCggZGVtb3NQYXJlbnQgKTtcblxuICAgIC8vIFNvcnQgdGhlIGRlbW9zIGJ5IGxhYmVsLCBzbyB0aGF0IHRoZXkgYXBwZWFyIGluIHRoZSBjb21ibyBib3ggaW4gYWxwaGFiZXRpY2FsIG9yZGVyXG4gICAgZGVtb3MgPSBfLnNvcnRCeSggZGVtb3MsIGRlbW8gPT4ge1xuICAgICAgcmV0dXJuIGRlbW8ubGFiZWw7XG4gICAgfSApO1xuXG4gICAgLy8gVGhlIGluaXRpYWwgZGVtbyB0aGF0IGlzIHNlbGVjdGVkLCBhbGxvdyBncmFjZSBmb3IgcXVlcnkgcGFyYW1ldGVyIHN1cHBvcnRcbiAgICBjb25zdCBzZWxlY3RlZERlbW8gPSBvcHRpb25zLnNlbGVjdGVkRGVtb0xhYmVsID9cbiAgICAgICAgICAgICAgICAgICAgICAgICBfLmZpbmQoIGRlbW9zLCBkZW1vID0+IGRlbW8ubGFiZWwgPT09IG9wdGlvbnMuc2VsZWN0ZWREZW1vTGFiZWwgKSB8fCBkZW1vc1sgMCBdIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICBkZW1vc1sgMCBdO1xuXG4gICAgLy8ge1Byb3BlcnR5LjxEZW1vPn0gdGhlIGRlbW8gdGhhdCBpcyBjdXJyZW50bHkgc2VsZWN0ZWRcbiAgICBjb25zdCBzZWxlY3RlZERlbW9Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggc2VsZWN0ZWREZW1vICk7XG5cbiAgICBjb25zdCBzZWxlY3RBRGVtb0xhYmVsID0gbmV3IFRleHQoICdTZWxlY3QgYSBEZW1vOicsIHtcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTYgKVxuICAgIH0gKTtcbiAgICB0aGlzLmFkZENoaWxkKCBzZWxlY3RBRGVtb0xhYmVsICk7XG5cbiAgICAvLyB7Q29tYm9Cb3hJdGVtW119XG4gICAgY29uc3QgaXRlbXMgPSBkZW1vcy5tYXAoIGRlbW8gPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6IGRlbW8sXG4gICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBUZXh0KCBkZW1vLmxhYmVsLCB7IGZvbnQ6IENPTUJPX0JPWF9JVEVNX0ZPTlQgfSApXG4gICAgICB9O1xuICAgIH0gKTtcblxuICAgIGNvbnN0IGNhcm91c2VsQ29tYm9Cb3ggPSBuZXcgQ2Fyb3VzZWxDb21ib0JveCggc2VsZWN0ZWREZW1vUHJvcGVydHksIGl0ZW1zLCB7XG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2Nhcm91c2VsQ29tYm9Cb3gnIClcbiAgICB9ICk7XG4gICAgdGhpcy5hZGRDaGlsZCggY2Fyb3VzZWxDb21ib0JveCApO1xuXG4gICAgLy8gTGF5b3V0LCB3aXRoIGJ1dHRvbiB2ZXJ0aWNhbGx5IGNlbnRlcmVkIG9uIGxhYmVsLlxuICAgIHNlbGVjdEFEZW1vTGFiZWwubGVmdCA9IHRoaXMubGF5b3V0Qm91bmRzLmxlZnQgKyAyMDtcbiAgICBjYXJvdXNlbENvbWJvQm94LmxlZnQgPSBzZWxlY3RBRGVtb0xhYmVsLnJpZ2h0ICsgMTA7XG4gICAgY2Fyb3VzZWxDb21ib0JveC50b3AgPSB0aGlzLmxheW91dEJvdW5kcy50b3AgKyAyMDtcbiAgICBzZWxlY3RBRGVtb0xhYmVsLmNlbnRlclkgPSBjYXJvdXNlbENvbWJvQm94LnZpc2libGVCb3VuZHMuY2VudGVyWTtcblxuICAgIC8vIE1ha2UgdGhlIHNlbGVjdGVkIGRlbW8gdmlzaWJsZVxuICAgIHNlbGVjdGVkRGVtb1Byb3BlcnR5LmxpbmsoICggZGVtbywgb2xkRGVtbyApID0+IHtcblxuICAgICAgLy8gY2xlYW4gdXAgdGhlIHByZXZpb3VzbHkgc2VsZWN0ZWQgZGVtb1xuICAgICAgaWYgKCBvbGREZW1vICkge1xuXG4gICAgICAgIGNvbnN0IG9sZERlbW9Ob2RlID0gb2xkRGVtby5ub2RlITtcblxuICAgICAgICBpZiAoIG9wdGlvbnMuY2FjaGVEZW1vcyApIHtcblxuICAgICAgICAgIC8vIG1ha2UgdGhlIG9sZCBkZW1vIGludmlzaWJsZVxuICAgICAgICAgIG9sZERlbW9Ob2RlLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcblxuICAgICAgICAgIC8vIERlbGV0ZSB0aGUgb2xkIGRlbW8uICBOb3RlIHRoYXQgdGhpcyB3aWxsIE9OTFkgY2FsbCB0aGUgZGlzcG9zZSBmdW5jdGlvbiBvbiB0aGUgY29tcG9uZW50IGJlaW5nIGRlbW9lZCBpZlxuICAgICAgICAgIC8vIHRoYXQgY29tcG9uZW50IGlzIHRoZSBvbmx5IHRoaW5nIHByb3ZpZGVkIGFzIGEgZGVtbyBub2RlLCBvciBpZiB0aGUgZGVtbyBub2RlIGlzIHN1YmNsYXNzZWQgYW5kIHByb3ZpZGVzXG4gICAgICAgICAgLy8gaXRzIG93biBkaXNwb3NlIGZ1bmN0aW9uLiAgSWYgdGhlIGRlbW8gbm9kZSBpcyBhIFZCb3ggb3Igc29tZXRoaW5nIG9mIHRoYXQgbmF0dXJlLCB0aGUgZGlzcG9zZSBmdW5jdGlvbiBvZlxuICAgICAgICAgIC8vIHRoZSBkZW1vZWQgY29tcG9uZW50KHMpIHdpbGwgbm90IGJlIGludm9rZWQuICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvMzg2LlxuICAgICAgICAgIGRlbW9zUGFyZW50LnJlbW92ZUNoaWxkKCBvbGREZW1vTm9kZSApO1xuICAgICAgICAgIG9sZERlbW9Ob2RlLmRpc3Bvc2UoKTtcbiAgICAgICAgICBvbGREZW1vLm5vZGUgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICggZGVtby5ub2RlICkge1xuXG4gICAgICAgIC8vIElmIHRoZSBzZWxlY3RlZCBkZW1vIGhhcyBhbiBhc3NvY2lhdGVkIG5vZGUsIG1ha2UgaXQgdmlzaWJsZS5cbiAgICAgICAgZGVtby5ub2RlLnZpc2libGUgPSB0cnVlO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG5cbiAgICAgICAgLy8gSWYgdGhlIHNlbGVjdGVkIGRlbW8gZG9lc24ndCBkb2Vzbid0IGhhdmUgYW4gYXNzb2NpYXRlZCBub2RlLCBjcmVhdGUgaXQuXG4gICAgICAgIGRlbW8ubm9kZSA9IGRlbW8uY3JlYXRlTm9kZSggbGF5b3V0Qm91bmRzLCB7XG4gICAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oIGBkZW1vJHtkZW1vLnRhbmRlbU5hbWUgPyBkZW1vLnRhbmRlbU5hbWUgOiBkZW1vLmxhYmVsfWAgKVxuICAgICAgICB9ICk7XG4gICAgICAgIGRlbW9zUGFyZW50LmFkZENoaWxkKCBkZW1vLm5vZGUgKTtcbiAgICAgIH1cbiAgICB9ICk7XG4gIH1cbn1cblxuc3VuLnJlZ2lzdGVyKCAnRGVtb3NTY3JlZW5WaWV3JywgRGVtb3NTY3JlZW5WaWV3ICk7XG5leHBvcnQgZGVmYXVsdCBEZW1vc1NjcmVlblZpZXc7Il0sIm5hbWVzIjpbIlByb3BlcnR5IiwiU2NyZWVuVmlldyIsIm9wdGlvbml6ZSIsIlBoZXRGb250IiwiTm9kZSIsIlRleHQiLCJUYW5kZW0iLCJDYXJvdXNlbENvbWJvQm94Iiwic3VuIiwic3VuUXVlcnlQYXJhbWV0ZXJzIiwiQ09NQk9fQk9YX0lURU1fRk9OVCIsIkRlbW9zU2NyZWVuVmlldyIsImRlbW9zIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInNlbGVjdGVkRGVtb0xhYmVsIiwiY29tcG9uZW50IiwiY2FjaGVEZW1vcyIsInRhbmRlbSIsIk9QVElPTkFMIiwiZGVtb3NQYXJlbnQiLCJsYXlvdXRCb3VuZHMiLCJQSEVUX0lPX0VOQUJMRUQiLCJmb3JFYWNoIiwiZGVtbyIsIm5vZGUiLCJjcmVhdGVOb2RlIiwiY3JlYXRlVGFuZGVtIiwidGFuZGVtTmFtZSIsImxhYmVsIiwidmlzaWJsZSIsImFkZENoaWxkIiwiXyIsInNvcnRCeSIsInNlbGVjdGVkRGVtbyIsImZpbmQiLCJzZWxlY3RlZERlbW9Qcm9wZXJ0eSIsInNlbGVjdEFEZW1vTGFiZWwiLCJmb250IiwiaXRlbXMiLCJtYXAiLCJ2YWx1ZSIsImNhcm91c2VsQ29tYm9Cb3giLCJsZWZ0IiwicmlnaHQiLCJ0b3AiLCJjZW50ZXJZIiwidmlzaWJsZUJvdW5kcyIsImxpbmsiLCJvbGREZW1vIiwib2xkRGVtb05vZGUiLCJyZW1vdmVDaGlsZCIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxjQUFjLCtCQUErQjtBQUVwRCxPQUFPQyxnQkFBdUMsa0NBQWtDO0FBQ2hGLE9BQU9DLGVBQWUscUNBQXFDO0FBRzNELE9BQU9DLGNBQWMsdUNBQXVDO0FBQzVELFNBQVNDLElBQUksRUFBZUMsSUFBSSxRQUFRLGlDQUFpQztBQUN6RSxPQUFPQyxZQUFZLCtCQUErQjtBQUNsRCxPQUFPQyxzQkFBc0IseUJBQXlCO0FBQ3RELE9BQU9DLFNBQVMsWUFBWTtBQUM1QixPQUFPQyx3QkFBd0IsMkJBQTJCO0FBRTFELFlBQVk7QUFDWixNQUFNQyxzQkFBc0IsSUFBSVAsU0FBVTtBQWlDMUMsSUFBQSxBQUFNUSxrQkFBTixNQUFNQSx3QkFBd0JWO0lBRTVCLFlBQW9CVyxLQUFxQixFQUFFQyxlQUF3QyxDQUFHO1FBRXBGLE1BQU1DLFVBQVVaLFlBQXFFO1lBRW5GLHlCQUF5QjtZQUN6QmEsbUJBQW1CTixtQkFBbUJPLFNBQVM7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