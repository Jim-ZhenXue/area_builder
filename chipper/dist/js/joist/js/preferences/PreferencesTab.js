// Copyright 2022-2024, University of Colorado Boulder
/**
 * A single tab of the PreferencesDialog. Selecting this PreferencesTab makes its associated PreferencesPanel
 * visible in the dialog.
 *
 * @author Jesse Greenberg
 */ import Multilink from '../../../axon/js/Multilink.js';
import PatternStringProperty from '../../../axon/js/PatternStringProperty.js';
import optionize from '../../../phet-core/js/optionize.js';
import { HBox, HighlightPath, Line, Node, PressListener, Rectangle, Text, Voicing } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
let PreferencesTab = class PreferencesTab extends Voicing(Node) {
    /**
   * @param labelProperty - text label for the tab
   * @param property
   * @param value - PreferencesType shown when this tab is selected
   * @param providedOptions
   */ constructor(labelProperty, property, value, providedOptions){
        const options = optionize()({
            iconNode: null,
            pointerAreaXDilation: 0,
            phetioFeatured: true,
            visiblePropertyOptions: {
                phetioFeatured: true
            },
            cursor: 'pointer',
            // pdom
            tagName: 'button',
            innerContent: labelProperty,
            ariaRole: 'tab',
            focusable: true,
            containerTagName: 'li',
            containerAriaRole: 'presentation'
        }, providedOptions);
        // Visual contents for the tab, label Text and optional icon Node
        const text = new Text(labelProperty, PreferencesDialog.TAB_OPTIONS);
        const tabContents = [
            text
        ];
        if (options.iconNode) {
            tabContents.push(options.iconNode);
        }
        const contentsBox = new HBox({
            children: tabContents,
            spacing: 8
        });
        // background Node behind the tab contents for layout spacing and to increase the clickable area of the tab
        const backgroundNode = new Rectangle({
            children: [
                contentsBox
            ]
        });
        // Pink underline Node to indicate which tab is selected
        const underlineNode = new Line(0, 0, 0, 0, {
            stroke: HighlightPath.INNER_FOCUS_COLOR,
            lineWidth: 5
        });
        super(options);
        this.children = [
            backgroundNode,
            underlineNode
        ];
        contentsBox.boundsProperty.link((bounds)=>{
            // margin around the tabContents
            backgroundNode.rectBounds = bounds.dilatedXY(15, 10);
            underlineNode.x2 = bounds.width;
            // spacing between the underline and the tabContents
            underlineNode.centerTop = bounds.centerBottom.plusXY(0, 5);
            this.mouseArea = this.localBounds.dilatedX(options.pointerAreaXDilation);
            this.touchArea = this.mouseArea;
        });
        this.value = value;
        const voicingPatternStringProperty = new PatternStringProperty(JoistStrings.a11y.preferences.tabs.tabResponsePatternStringProperty, {
            title: labelProperty
        }, {
            tandem: Tandem.OPT_OUT
        });
        this.voicingNameResponse = voicingPatternStringProperty;
        const pressListener = new PressListener({
            press: ()=>{
                property.set(value);
                // speak the object response on activation
                this.voicingSpeakNameResponse();
            },
            // phet-io
            tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
        });
        this.addInputListener(pressListener);
        Multilink.multilink([
            property,
            pressListener.isOverProperty
        ], (selectedTab, isOver)=>{
            backgroundNode.opacity = selectedTab === value ? 1 : isOver ? 0.8 : 0.6;
            this.focusable = selectedTab === value;
            underlineNode.visible = selectedTab === value;
        });
    }
};
joist.register('PreferencesTab', PreferencesTab);
export default PreferencesTab;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL3ByZWZlcmVuY2VzL1ByZWZlcmVuY2VzVGFiLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgc2luZ2xlIHRhYiBvZiB0aGUgUHJlZmVyZW5jZXNEaWFsb2cuIFNlbGVjdGluZyB0aGlzIFByZWZlcmVuY2VzVGFiIG1ha2VzIGl0cyBhc3NvY2lhdGVkIFByZWZlcmVuY2VzUGFuZWxcbiAqIHZpc2libGUgaW4gdGhlIGRpYWxvZy5cbiAqXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xuICovXG5cbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xuXG5pbXBvcnQgUGF0dGVyblN0cmluZ1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUGF0dGVyblN0cmluZ1Byb3BlcnR5LmpzJztcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBIQm94LCBIaWdobGlnaHRQYXRoLCBMaW5lLCBOb2RlLCBOb2RlT3B0aW9ucywgUHJlc3NMaXN0ZW5lciwgUmVjdGFuZ2xlLCBUZXh0LCBWb2ljaW5nLCBWb2ljaW5nT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IGpvaXN0IGZyb20gJy4uL2pvaXN0LmpzJztcbmltcG9ydCBKb2lzdFN0cmluZ3MgZnJvbSAnLi4vSm9pc3RTdHJpbmdzLmpzJztcbmltcG9ydCBQcmVmZXJlbmNlc0RpYWxvZyBmcm9tICcuL1ByZWZlcmVuY2VzRGlhbG9nLmpzJztcbmltcG9ydCBQcmVmZXJlbmNlc1R5cGUgZnJvbSAnLi9QcmVmZXJlbmNlc1R5cGUuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuXG4gIC8vIEFuIGFkZGl0aW9uYWwgaWNvbiB0byBkaXNwbGF5IHRvIHRoZSByaWdodCBvZiB0aGUgbGFiZWwgdGV4dCBmb3IgdGhpcyB0YWIuXG4gIGljb25Ob2RlPzogTm9kZSB8IG51bGw7XG5cbiAgLy8gWCBkaWxhdGlvbiBmb3IgdGFiIHBvaW50ZXIgYXJlYXNcbiAgcG9pbnRlckFyZWFYRGlsYXRpb24/OiBudW1iZXI7XG59O1xudHlwZSBQcmVmZXJlbmNlc1RhYk9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxOb2RlT3B0aW9ucywgJ3RhbmRlbSc+ICYgU3RyaWN0T21pdDxOb2RlT3B0aW9ucywgJ2NoaWxkcmVuJz47XG50eXBlIFBhcmVudE9wdGlvbnMgPSBOb2RlT3B0aW9ucyAmIFZvaWNpbmdPcHRpb25zO1xuXG5jbGFzcyBQcmVmZXJlbmNlc1RhYiBleHRlbmRzIFZvaWNpbmcoIE5vZGUgKSB7XG5cbiAgLy8gVGhlIHZhbHVlIG9mIHRoaXMgdGFiLCB3aGVuIHRoaXMgdGFiIGlzIFByZXNzZWQsIHRoZSBwYW5lbCBvZiB0aGlzIFByZWZlcmVuY2VzVHlwZSB3aWxsIGJlIGRpc3BsYXllZC5cbiAgcHVibGljIHJlYWRvbmx5IHZhbHVlOiBQcmVmZXJlbmNlc1R5cGU7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBsYWJlbFByb3BlcnR5IC0gdGV4dCBsYWJlbCBmb3IgdGhlIHRhYlxuICAgKiBAcGFyYW0gcHJvcGVydHlcbiAgICogQHBhcmFtIHZhbHVlIC0gUHJlZmVyZW5jZXNUeXBlIHNob3duIHdoZW4gdGhpcyB0YWIgaXMgc2VsZWN0ZWRcbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9uc1xuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBsYWJlbFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+LCBwcm9wZXJ0eTogVFByb3BlcnR5PFByZWZlcmVuY2VzVHlwZT4sIHZhbHVlOiBQcmVmZXJlbmNlc1R5cGUsIHByb3ZpZGVkT3B0aW9uczogUHJlZmVyZW5jZXNUYWJPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxQcmVmZXJlbmNlc1RhYk9wdGlvbnMsIFNlbGZPcHRpb25zLCBQYXJlbnRPcHRpb25zPigpKCB7XG4gICAgICBpY29uTm9kZTogbnVsbCxcbiAgICAgIHBvaW50ZXJBcmVhWERpbGF0aW9uOiAwLFxuXG4gICAgICBwaGV0aW9GZWF0dXJlZDogdHJ1ZSxcbiAgICAgIHZpc2libGVQcm9wZXJ0eU9wdGlvbnM6IHtcbiAgICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWVcbiAgICAgIH0sXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJyxcblxuICAgICAgLy8gcGRvbVxuICAgICAgdGFnTmFtZTogJ2J1dHRvbicsXG4gICAgICBpbm5lckNvbnRlbnQ6IGxhYmVsUHJvcGVydHksXG4gICAgICBhcmlhUm9sZTogJ3RhYicsXG4gICAgICBmb2N1c2FibGU6IHRydWUsXG4gICAgICBjb250YWluZXJUYWdOYW1lOiAnbGknLFxuICAgICAgY29udGFpbmVyQXJpYVJvbGU6ICdwcmVzZW50YXRpb24nXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAvLyBWaXN1YWwgY29udGVudHMgZm9yIHRoZSB0YWIsIGxhYmVsIFRleHQgYW5kIG9wdGlvbmFsIGljb24gTm9kZVxuICAgIGNvbnN0IHRleHQgPSBuZXcgVGV4dCggbGFiZWxQcm9wZXJ0eSwgUHJlZmVyZW5jZXNEaWFsb2cuVEFCX09QVElPTlMgKTtcbiAgICBjb25zdCB0YWJDb250ZW50czogTm9kZVtdID0gWyB0ZXh0IF07XG4gICAgaWYgKCBvcHRpb25zLmljb25Ob2RlICkge1xuICAgICAgdGFiQ29udGVudHMucHVzaCggb3B0aW9ucy5pY29uTm9kZSApO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50c0JveCA9IG5ldyBIQm94KCB7XG4gICAgICBjaGlsZHJlbjogdGFiQ29udGVudHMsXG4gICAgICBzcGFjaW5nOiA4XG4gICAgfSApO1xuXG4gICAgLy8gYmFja2dyb3VuZCBOb2RlIGJlaGluZCB0aGUgdGFiIGNvbnRlbnRzIGZvciBsYXlvdXQgc3BhY2luZyBhbmQgdG8gaW5jcmVhc2UgdGhlIGNsaWNrYWJsZSBhcmVhIG9mIHRoZSB0YWJcbiAgICBjb25zdCBiYWNrZ3JvdW5kTm9kZSA9IG5ldyBSZWN0YW5nbGUoIHtcbiAgICAgIGNoaWxkcmVuOiBbIGNvbnRlbnRzQm94IF1cbiAgICB9ICk7XG5cbiAgICAvLyBQaW5rIHVuZGVybGluZSBOb2RlIHRvIGluZGljYXRlIHdoaWNoIHRhYiBpcyBzZWxlY3RlZFxuICAgIGNvbnN0IHVuZGVybGluZU5vZGUgPSBuZXcgTGluZSggMCwgMCwgMCwgMCwge1xuICAgICAgc3Ryb2tlOiBIaWdobGlnaHRQYXRoLklOTkVSX0ZPQ1VTX0NPTE9SLFxuICAgICAgbGluZVdpZHRoOiA1XG4gICAgfSApO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcbiAgICB0aGlzLmNoaWxkcmVuID0gWyBiYWNrZ3JvdW5kTm9kZSwgdW5kZXJsaW5lTm9kZSBdO1xuXG4gICAgY29udGVudHNCb3guYm91bmRzUHJvcGVydHkubGluayggYm91bmRzID0+IHtcblxuICAgICAgLy8gbWFyZ2luIGFyb3VuZCB0aGUgdGFiQ29udGVudHNcbiAgICAgIGJhY2tncm91bmROb2RlLnJlY3RCb3VuZHMgPSBib3VuZHMuZGlsYXRlZFhZKCAxNSwgMTAgKTtcblxuICAgICAgdW5kZXJsaW5lTm9kZS54MiA9IGJvdW5kcy53aWR0aDtcblxuICAgICAgLy8gc3BhY2luZyBiZXR3ZWVuIHRoZSB1bmRlcmxpbmUgYW5kIHRoZSB0YWJDb250ZW50c1xuICAgICAgdW5kZXJsaW5lTm9kZS5jZW50ZXJUb3AgPSBib3VuZHMuY2VudGVyQm90dG9tLnBsdXNYWSggMCwgNSApO1xuXG4gICAgICB0aGlzLm1vdXNlQXJlYSA9IHRoaXMubG9jYWxCb3VuZHMuZGlsYXRlZFgoIG9wdGlvbnMucG9pbnRlckFyZWFYRGlsYXRpb24gKTtcbiAgICAgIHRoaXMudG91Y2hBcmVhID0gdGhpcy5tb3VzZUFyZWE7XG4gICAgfSApO1xuXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuXG4gICAgY29uc3Qgdm9pY2luZ1BhdHRlcm5TdHJpbmdQcm9wZXJ0eSA9IG5ldyBQYXR0ZXJuU3RyaW5nUHJvcGVydHkoIEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMudGFiUmVzcG9uc2VQYXR0ZXJuU3RyaW5nUHJvcGVydHksIHtcbiAgICAgIHRpdGxlOiBsYWJlbFByb3BlcnR5XG4gICAgfSwgeyB0YW5kZW06IFRhbmRlbS5PUFRfT1VUIH0gKTtcbiAgICB0aGlzLnZvaWNpbmdOYW1lUmVzcG9uc2UgPSB2b2ljaW5nUGF0dGVyblN0cmluZ1Byb3BlcnR5O1xuXG4gICAgY29uc3QgcHJlc3NMaXN0ZW5lciA9IG5ldyBQcmVzc0xpc3RlbmVyKCB7XG4gICAgICBwcmVzczogKCkgPT4ge1xuICAgICAgICBwcm9wZXJ0eS5zZXQoIHZhbHVlICk7XG5cbiAgICAgICAgLy8gc3BlYWsgdGhlIG9iamVjdCByZXNwb25zZSBvbiBhY3RpdmF0aW9uXG4gICAgICAgIHRoaXMudm9pY2luZ1NwZWFrTmFtZVJlc3BvbnNlKCk7XG4gICAgICB9LFxuXG4gICAgICAvLyBwaGV0LWlvXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUIC8vIFdlIGRvbid0IHdhbnQgdG8gaW5zdHJ1bWVudCBjb21wb25lbnRzIGZvciBwcmVmZXJlbmNlcywgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy83NDQjaXNzdWVjb21tZW50LTExOTYwMjgzNjJcbiAgICB9ICk7XG4gICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCBwcmVzc0xpc3RlbmVyICk7XG5cbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIHByb3BlcnR5LCBwcmVzc0xpc3RlbmVyLmlzT3ZlclByb3BlcnR5IF0sICggc2VsZWN0ZWRUYWIsIGlzT3ZlciApID0+IHtcbiAgICAgIGJhY2tncm91bmROb2RlLm9wYWNpdHkgPSBzZWxlY3RlZFRhYiA9PT0gdmFsdWUgPyAxIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc092ZXIgPyAwLjggOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAuNjtcblxuICAgICAgdGhpcy5mb2N1c2FibGUgPSBzZWxlY3RlZFRhYiA9PT0gdmFsdWU7XG4gICAgICB1bmRlcmxpbmVOb2RlLnZpc2libGUgPSBzZWxlY3RlZFRhYiA9PT0gdmFsdWU7XG4gICAgfSApO1xuICB9XG59XG5cblxuam9pc3QucmVnaXN0ZXIoICdQcmVmZXJlbmNlc1RhYicsIFByZWZlcmVuY2VzVGFiICk7XG5leHBvcnQgZGVmYXVsdCBQcmVmZXJlbmNlc1RhYjsiXSwibmFtZXMiOlsiTXVsdGlsaW5rIiwiUGF0dGVyblN0cmluZ1Byb3BlcnR5Iiwib3B0aW9uaXplIiwiSEJveCIsIkhpZ2hsaWdodFBhdGgiLCJMaW5lIiwiTm9kZSIsIlByZXNzTGlzdGVuZXIiLCJSZWN0YW5nbGUiLCJUZXh0IiwiVm9pY2luZyIsIlRhbmRlbSIsImpvaXN0IiwiSm9pc3RTdHJpbmdzIiwiUHJlZmVyZW5jZXNEaWFsb2ciLCJQcmVmZXJlbmNlc1RhYiIsImxhYmVsUHJvcGVydHkiLCJwcm9wZXJ0eSIsInZhbHVlIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImljb25Ob2RlIiwicG9pbnRlckFyZWFYRGlsYXRpb24iLCJwaGV0aW9GZWF0dXJlZCIsInZpc2libGVQcm9wZXJ0eU9wdGlvbnMiLCJjdXJzb3IiLCJ0YWdOYW1lIiwiaW5uZXJDb250ZW50IiwiYXJpYVJvbGUiLCJmb2N1c2FibGUiLCJjb250YWluZXJUYWdOYW1lIiwiY29udGFpbmVyQXJpYVJvbGUiLCJ0ZXh0IiwiVEFCX09QVElPTlMiLCJ0YWJDb250ZW50cyIsInB1c2giLCJjb250ZW50c0JveCIsImNoaWxkcmVuIiwic3BhY2luZyIsImJhY2tncm91bmROb2RlIiwidW5kZXJsaW5lTm9kZSIsInN0cm9rZSIsIklOTkVSX0ZPQ1VTX0NPTE9SIiwibGluZVdpZHRoIiwiYm91bmRzUHJvcGVydHkiLCJsaW5rIiwiYm91bmRzIiwicmVjdEJvdW5kcyIsImRpbGF0ZWRYWSIsIngyIiwid2lkdGgiLCJjZW50ZXJUb3AiLCJjZW50ZXJCb3R0b20iLCJwbHVzWFkiLCJtb3VzZUFyZWEiLCJsb2NhbEJvdW5kcyIsImRpbGF0ZWRYIiwidG91Y2hBcmVhIiwidm9pY2luZ1BhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsImExMXkiLCJwcmVmZXJlbmNlcyIsInRhYnMiLCJ0YWJSZXNwb25zZVBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsInRpdGxlIiwidGFuZGVtIiwiT1BUX09VVCIsInZvaWNpbmdOYW1lUmVzcG9uc2UiLCJwcmVzc0xpc3RlbmVyIiwicHJlc3MiLCJzZXQiLCJ2b2ljaW5nU3BlYWtOYW1lUmVzcG9uc2UiLCJhZGRJbnB1dExpc3RlbmVyIiwibXVsdGlsaW5rIiwiaXNPdmVyUHJvcGVydHkiLCJzZWxlY3RlZFRhYiIsImlzT3ZlciIsIm9wYWNpdHkiLCJ2aXNpYmxlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELE9BQU9BLGVBQWUsZ0NBQWdDO0FBRXRELE9BQU9DLDJCQUEyQiw0Q0FB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