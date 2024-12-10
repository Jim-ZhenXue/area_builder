// Copyright 2019-2024, University of Colorado Boulder
/**
 * Node for an item in a combo box list.
 * Responsible for highlighting itself when the pointer is over it.
 * Typically instantiated by ComboBox, not by client code.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import PatternStringProperty from '../../axon/js/PatternStringProperty.js';
import Property from '../../axon/js/Property.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import { IndexedNodeIO, ManualConstraint, Node, PressListener, Rectangle, Voicing } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';
import SunConstants from './SunConstants.js';
let ComboBoxListItemNode = class ComboBoxListItemNode extends Voicing(Node) {
    /**
   * Ask for the voicing response for opening the ComboBox upon next focus, but only for the very next focus event.
   */ supplyOpenResponseOnNextFocus() {
        this._supplyOpenResponseOnNextFocus = true;
    }
    /**
   * Free memory references to avoid leaks.
   */ dispose() {
        this.disposeComboBoxListItemNode();
        super.dispose();
    }
    /**
   * A custom focus listener for this type, with conditional support for providing a normal focus vs an "open" response.
   */ comboBoxListItemNodeVoicingFocusListener() {
        this.voicingSpeakFullResponse({
            nameResponse: this._supplyOpenResponseOnNextFocus ? this.voicingNameResponse : null,
            objectResponse: this._supplyOpenResponseOnNextFocus ? null : this.voicingObjectResponse,
            contextResponse: null,
            hintResponse: this._supplyOpenResponseOnNextFocus ? this.voicingHintResponse : null
        });
        this._supplyOpenResponseOnNextFocus = false;
    }
    constructor(item, node, highlightWidthProperty, highlightHeightProperty, providedOptions){
        const options = optionize()({
            cursor: 'pointer',
            align: 'left',
            xMargin: 6,
            highlightFill: 'rgb( 245, 245, 245 )',
            highlightCornerRadius: 4,
            // pdom
            tagName: 'li',
            focusable: true,
            ariaRole: 'option',
            // the `li` with ariaRole `option` does not get click events on iOS VoiceOver, so position
            // elements so they receive pointer events
            positionInPDOM: true,
            // voicing
            voicingFocusListener: ()=>this.comboBoxListItemNodeVoicingFocusListener(),
            comboBoxVoicingNameResponsePattern: SunConstants.VALUE_NAMED_PLACEHOLDER,
            // phet-io
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'Item',
            // Together, these options make it possible to reorder the combo box items in studio, and save a customized
            // simulation with the new order.
            phetioType: IndexedNodeIO,
            phetioState: true,
            visiblePropertyOptions: {
                phetioFeatured: true
            }
        }, providedOptions);
        // @ts-expect-error convert Property into string
        options.comboBoxVoicingNameResponsePattern = options.comboBoxVoicingNameResponsePattern.get ? // @ts-expect-error convert Property into string
        options.comboBoxVoicingNameResponsePattern.get() : options.comboBoxVoicingNameResponsePattern;
        // Don't test the contents of strings when ?stringTest is enabled
        assert && assert(!!phet.chipper.queryParameters.stringTest || // @ts-expect-error is a string now.
        options.comboBoxVoicingNameResponsePattern.includes('{{value}}'), 'value needs to be filled in');
        // pdom: get innerContent from the item
        options.innerContent = item.accessibleName || null;
        options.voicingObjectResponse = item.accessibleName || null;
        const patternProperty = typeof options.comboBoxVoicingNameResponsePattern === 'string' ? new Property(options.comboBoxVoicingNameResponsePattern) : options.comboBoxVoicingNameResponsePattern;
        const patternStringProperty = new PatternStringProperty(patternProperty, {
            value: item.accessibleName
        }, {
            tandem: Tandem.OPT_OUT
        });
        options.voicingNameResponse = patternStringProperty;
        // Highlight that is shown when the pointer is over this item. This is not the a11y focus rectangle.
        const highlightRectangle = new Rectangle({
            cornerRadius: options.highlightCornerRadius
        });
        // Wrapper for the item's Node. Do not transform item.node because it is shared with ComboBoxButton!
        const itemNodeWrapper = new Node({
            children: [
                node
            ]
        });
        // Adjust the size when the highlight size changes.
        const highlightWidthListener = (width)=>{
            highlightRectangle.rectWidth = width;
            itemNodeWrapper.maxWidth = width;
        };
        highlightWidthProperty.link(highlightWidthListener);
        const highlightHeightListener = (height)=>{
            highlightRectangle.rectHeight = height;
            itemNodeWrapper.maxHeight = height;
        };
        highlightHeightProperty.link(highlightHeightListener);
        options.children = [
            highlightRectangle,
            itemNodeWrapper
        ];
        super(options);
        this._supplyOpenResponseOnNextFocus = false;
        // Assume that item.node may change (as in ComboBoxDisplay) and adjust layout dynamically.
        // See https://github.com/phetsims/scenery-phet/issues/482
        ManualConstraint.create(this, [
            highlightRectangle,
            itemNodeWrapper
        ], (highlightProxy, itemProxy)=>{
            if (options.align === 'left') {
                itemProxy.left = highlightProxy.left + options.xMargin;
            } else if (options.align === 'right') {
                itemProxy.right = highlightProxy.right - options.xMargin;
            } else {
                itemProxy.centerX = highlightProxy.centerX;
            }
            itemProxy.centerY = highlightProxy.centerY;
        });
        this.item = item;
        // pdom focus highlight is fitted to this Node's bounds, so that it doesn't overlap other items in the list box
        this.localBoundsProperty.link((localBounds)=>{
            this.focusHighlight = Shape.bounds(localBounds);
        });
        const pressListener = new PressListener({
            attach: false,
            tandem: Tandem.OPT_OUT
        });
        this.addInputListener(pressListener);
        // Show highlight when pointer is over this item.
        // Change fill instead of visibility so that we don't end up with vertical pointer gaps in the list
        pressListener.looksOverProperty.link((pressed)=>{
            highlightRectangle.fill = pressed ? options.highlightFill : null;
        });
        this.disposeComboBoxListItemNode = ()=>{
            pressListener.dispose();
            patternStringProperty.dispose();
            highlightWidthProperty.unlink(highlightWidthListener);
            highlightHeightProperty.unlink(highlightHeightListener);
        };
    }
};
export { ComboBoxListItemNode as default };
sun.register('ComboBoxListItemNode', ComboBoxListItemNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9Db21ib0JveExpc3RJdGVtTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBOb2RlIGZvciBhbiBpdGVtIGluIGEgY29tYm8gYm94IGxpc3QuXG4gKiBSZXNwb25zaWJsZSBmb3IgaGlnaGxpZ2h0aW5nIGl0c2VsZiB3aGVuIHRoZSBwb2ludGVyIGlzIG92ZXIgaXQuXG4gKiBUeXBpY2FsbHkgaW5zdGFudGlhdGVkIGJ5IENvbWJvQm94LCBub3QgYnkgY2xpZW50IGNvZGUuXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgUGF0dGVyblN0cmluZ1Byb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUGF0dGVyblN0cmluZ1Byb3BlcnR5LmpzJztcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBJbmRleGVkTm9kZUlPLCBNYW51YWxDb25zdHJhaW50LCBOb2RlLCBOb2RlT3B0aW9ucywgUHJlc3NMaXN0ZW5lciwgUmVjdGFuZ2xlLCBUUGFpbnQsIFZvaWNpbmcsIFZvaWNpbmdPcHRpb25zIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgeyBDb21ib0JveEl0ZW1Ob05vZGUgfSBmcm9tICcuL0NvbWJvQm94LmpzJztcbmltcG9ydCBzdW4gZnJvbSAnLi9zdW4uanMnO1xuaW1wb3J0IFN1bkNvbnN0YW50cyBmcm9tICcuL1N1bkNvbnN0YW50cy5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIGFsaWduPzogJ2xlZnQnIHwgJ3JpZ2h0JyB8ICdjZW50ZXInO1xuXG4gIC8vIG1hcmdpbiBiZXR3ZWVuIHRoZSBpdGVtIGFuZCB0aGUgaGlnaGxpZ2h0IGVkZ2VcbiAgeE1hcmdpbj86IG51bWJlcjtcblxuICAvLyBoaWdobGlnaHQgYmVoaW5kIHRoZSBpdGVtXG4gIGhpZ2hsaWdodEZpbGw/OiBUUGFpbnQ7XG5cbiAgLy8gY29ybmVyIHJhZGl1cyBmb3IgdGhlIGhpZ2hsaWdodFxuICBoaWdobGlnaHRDb3JuZXJSYWRpdXM/OiBudW1iZXI7XG5cbiAgY29tYm9Cb3hWb2ljaW5nTmFtZVJlc3BvbnNlUGF0dGVybj86IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4gfCBzdHJpbmc7XG59O1xudHlwZSBQYXJlbnRPcHRpb25zID0gVm9pY2luZ09wdGlvbnMgJiBOb2RlT3B0aW9ucztcbmV4cG9ydCB0eXBlIENvbWJvQm94TGlzdEl0ZW1Ob2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxQYXJlbnRPcHRpb25zLCAnY2hpbGRyZW4nIHwgJ2lubmVyQ29udGVudCc+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21ib0JveExpc3RJdGVtTm9kZTxUPiBleHRlbmRzIFZvaWNpbmcoIE5vZGUgKSB7XG5cbiAgLy8gd2hlbiB0cnVlLCB0aGUgbmV4dCB2b2ljaW5nIGZvY3VzIGxpc3RlbmVyIHdpbGwgc3VwcGx5IHRoZSByZXNwb25zZSBuZWVkZWQgd2hlbiBvcGVuaW5nIHRoZSBjb21ib0JveC5cbiAgLy8gSXQgd2lsbCB0aGVuIHNldCB0aGlzIGJhY2sgdG8gZmFsc2UuXG4gIHByaXZhdGUgX3N1cHBseU9wZW5SZXNwb25zZU9uTmV4dEZvY3VzOiBib29sZWFuO1xuXG4gIHB1YmxpYyByZWFkb25seSBpdGVtOiBDb21ib0JveEl0ZW1Ob05vZGU8VD47XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlQ29tYm9Cb3hMaXN0SXRlbU5vZGU6ICgpID0+IHZvaWQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgIGl0ZW06IENvbWJvQm94SXRlbU5vTm9kZTxUPixcbiAgICBub2RlOiBOb2RlLFxuICAgIGhpZ2hsaWdodFdpZHRoUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj4sXG4gICAgaGlnaGxpZ2h0SGVpZ2h0UHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj4sXG4gICAgcHJvdmlkZWRPcHRpb25zPzogQ29tYm9Cb3hMaXN0SXRlbU5vZGVPcHRpb25zXG4gICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxDb21ib0JveExpc3RJdGVtTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBQYXJlbnRPcHRpb25zPigpKCB7XG5cbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgYWxpZ246ICdsZWZ0JyxcbiAgICAgIHhNYXJnaW46IDYsXG4gICAgICBoaWdobGlnaHRGaWxsOiAncmdiKCAyNDUsIDI0NSwgMjQ1ICknLFxuICAgICAgaGlnaGxpZ2h0Q29ybmVyUmFkaXVzOiA0LFxuXG4gICAgICAvLyBwZG9tXG4gICAgICB0YWdOYW1lOiAnbGknLFxuICAgICAgZm9jdXNhYmxlOiB0cnVlLFxuICAgICAgYXJpYVJvbGU6ICdvcHRpb24nLFxuXG4gICAgICAvLyB0aGUgYGxpYCB3aXRoIGFyaWFSb2xlIGBvcHRpb25gIGRvZXMgbm90IGdldCBjbGljayBldmVudHMgb24gaU9TIFZvaWNlT3Zlciwgc28gcG9zaXRpb25cbiAgICAgIC8vIGVsZW1lbnRzIHNvIHRoZXkgcmVjZWl2ZSBwb2ludGVyIGV2ZW50c1xuICAgICAgcG9zaXRpb25JblBET006IHRydWUsXG5cbiAgICAgIC8vIHZvaWNpbmdcbiAgICAgIHZvaWNpbmdGb2N1c0xpc3RlbmVyOiAoKSA9PiB0aGlzLmNvbWJvQm94TGlzdEl0ZW1Ob2RlVm9pY2luZ0ZvY3VzTGlzdGVuZXIoKSxcbiAgICAgIGNvbWJvQm94Vm9pY2luZ05hbWVSZXNwb25zZVBhdHRlcm46IFN1bkNvbnN0YW50cy5WQUxVRV9OQU1FRF9QTEFDRUhPTERFUixcblxuICAgICAgLy8gcGhldC1pb1xuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXG4gICAgICB0YW5kZW1OYW1lU3VmZml4OiAnSXRlbScsXG5cbiAgICAgIC8vIFRvZ2V0aGVyLCB0aGVzZSBvcHRpb25zIG1ha2UgaXQgcG9zc2libGUgdG8gcmVvcmRlciB0aGUgY29tYm8gYm94IGl0ZW1zIGluIHN0dWRpbywgYW5kIHNhdmUgYSBjdXN0b21pemVkXG4gICAgICAvLyBzaW11bGF0aW9uIHdpdGggdGhlIG5ldyBvcmRlci5cbiAgICAgIHBoZXRpb1R5cGU6IEluZGV4ZWROb2RlSU8sXG4gICAgICBwaGV0aW9TdGF0ZTogdHJ1ZSxcbiAgICAgIHZpc2libGVQcm9wZXJ0eU9wdGlvbnM6IHsgcGhldGlvRmVhdHVyZWQ6IHRydWUgfVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBjb252ZXJ0IFByb3BlcnR5IGludG8gc3RyaW5nXG4gICAgb3B0aW9ucy5jb21ib0JveFZvaWNpbmdOYW1lUmVzcG9uc2VQYXR0ZXJuID0gb3B0aW9ucy5jb21ib0JveFZvaWNpbmdOYW1lUmVzcG9uc2VQYXR0ZXJuLmdldCA/XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIGNvbnZlcnQgUHJvcGVydHkgaW50byBzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmNvbWJvQm94Vm9pY2luZ05hbWVSZXNwb25zZVBhdHRlcm4uZ2V0KCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuY29tYm9Cb3hWb2ljaW5nTmFtZVJlc3BvbnNlUGF0dGVybjtcblxuICAgIC8vIERvbid0IHRlc3QgdGhlIGNvbnRlbnRzIG9mIHN0cmluZ3Mgd2hlbiA/c3RyaW5nVGVzdCBpcyBlbmFibGVkXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggISFwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLnN0cmluZ1Rlc3QgfHxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIGlzIGEgc3RyaW5nIG5vdy5cbiAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmNvbWJvQm94Vm9pY2luZ05hbWVSZXNwb25zZVBhdHRlcm4uaW5jbHVkZXMoICd7e3ZhbHVlfX0nICksXG4gICAgICAndmFsdWUgbmVlZHMgdG8gYmUgZmlsbGVkIGluJyApO1xuXG4gICAgLy8gcGRvbTogZ2V0IGlubmVyQ29udGVudCBmcm9tIHRoZSBpdGVtXG4gICAgb3B0aW9ucy5pbm5lckNvbnRlbnQgPSAoIGl0ZW0uYWNjZXNzaWJsZU5hbWUgfHwgbnVsbCApO1xuICAgIG9wdGlvbnMudm9pY2luZ09iamVjdFJlc3BvbnNlID0gKCBpdGVtLmFjY2Vzc2libGVOYW1lIHx8IG51bGwgKTtcbiAgICBjb25zdCBwYXR0ZXJuUHJvcGVydHkgPSB0eXBlb2Ygb3B0aW9ucy5jb21ib0JveFZvaWNpbmdOYW1lUmVzcG9uc2VQYXR0ZXJuID09PSAnc3RyaW5nJyA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFByb3BlcnR5KCBvcHRpb25zLmNvbWJvQm94Vm9pY2luZ05hbWVSZXNwb25zZVBhdHRlcm4gKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5jb21ib0JveFZvaWNpbmdOYW1lUmVzcG9uc2VQYXR0ZXJuO1xuICAgIGNvbnN0IHBhdHRlcm5TdHJpbmdQcm9wZXJ0eSA9IG5ldyBQYXR0ZXJuU3RyaW5nUHJvcGVydHkoIHBhdHRlcm5Qcm9wZXJ0eSwge1xuICAgICAgdmFsdWU6IGl0ZW0uYWNjZXNzaWJsZU5hbWUhXG4gICAgfSwgeyB0YW5kZW06IFRhbmRlbS5PUFRfT1VUIH0gKTtcbiAgICBvcHRpb25zLnZvaWNpbmdOYW1lUmVzcG9uc2UgPSBwYXR0ZXJuU3RyaW5nUHJvcGVydHk7XG5cbiAgICAvLyBIaWdobGlnaHQgdGhhdCBpcyBzaG93biB3aGVuIHRoZSBwb2ludGVyIGlzIG92ZXIgdGhpcyBpdGVtLiBUaGlzIGlzIG5vdCB0aGUgYTExeSBmb2N1cyByZWN0YW5nbGUuXG4gICAgY29uc3QgaGlnaGxpZ2h0UmVjdGFuZ2xlID0gbmV3IFJlY3RhbmdsZSgge1xuICAgICAgY29ybmVyUmFkaXVzOiBvcHRpb25zLmhpZ2hsaWdodENvcm5lclJhZGl1c1xuICAgIH0gKTtcblxuICAgIC8vIFdyYXBwZXIgZm9yIHRoZSBpdGVtJ3MgTm9kZS4gRG8gbm90IHRyYW5zZm9ybSBpdGVtLm5vZGUgYmVjYXVzZSBpdCBpcyBzaGFyZWQgd2l0aCBDb21ib0JveEJ1dHRvbiFcbiAgICBjb25zdCBpdGVtTm9kZVdyYXBwZXIgPSBuZXcgTm9kZSgge1xuICAgICAgY2hpbGRyZW46IFsgbm9kZSBdXG4gICAgfSApO1xuXG4gICAgLy8gQWRqdXN0IHRoZSBzaXplIHdoZW4gdGhlIGhpZ2hsaWdodCBzaXplIGNoYW5nZXMuXG4gICAgY29uc3QgaGlnaGxpZ2h0V2lkdGhMaXN0ZW5lciA9ICggd2lkdGg6IG51bWJlciApID0+IHtcbiAgICAgIGhpZ2hsaWdodFJlY3RhbmdsZS5yZWN0V2lkdGggPSB3aWR0aDtcbiAgICAgIGl0ZW1Ob2RlV3JhcHBlci5tYXhXaWR0aCA9IHdpZHRoO1xuICAgIH07XG4gICAgaGlnaGxpZ2h0V2lkdGhQcm9wZXJ0eS5saW5rKCBoaWdobGlnaHRXaWR0aExpc3RlbmVyICk7XG4gICAgY29uc3QgaGlnaGxpZ2h0SGVpZ2h0TGlzdGVuZXIgPSAoIGhlaWdodDogbnVtYmVyICkgPT4ge1xuICAgICAgaGlnaGxpZ2h0UmVjdGFuZ2xlLnJlY3RIZWlnaHQgPSBoZWlnaHQ7XG4gICAgICBpdGVtTm9kZVdyYXBwZXIubWF4SGVpZ2h0ID0gaGVpZ2h0O1xuICAgIH07XG4gICAgaGlnaGxpZ2h0SGVpZ2h0UHJvcGVydHkubGluayggaGlnaGxpZ2h0SGVpZ2h0TGlzdGVuZXIgKTtcblxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIGhpZ2hsaWdodFJlY3RhbmdsZSwgaXRlbU5vZGVXcmFwcGVyIF07XG5cbiAgICBzdXBlciggb3B0aW9ucyApO1xuICAgIHRoaXMuX3N1cHBseU9wZW5SZXNwb25zZU9uTmV4dEZvY3VzID0gZmFsc2U7XG5cbiAgICAvLyBBc3N1bWUgdGhhdCBpdGVtLm5vZGUgbWF5IGNoYW5nZSAoYXMgaW4gQ29tYm9Cb3hEaXNwbGF5KSBhbmQgYWRqdXN0IGxheW91dCBkeW5hbWljYWxseS5cbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvNDgyXG4gICAgTWFudWFsQ29uc3RyYWludC5jcmVhdGUoIHRoaXMsIFsgaGlnaGxpZ2h0UmVjdGFuZ2xlLCBpdGVtTm9kZVdyYXBwZXIgXSwgKCBoaWdobGlnaHRQcm94eSwgaXRlbVByb3h5ICkgPT4ge1xuICAgICAgaWYgKCBvcHRpb25zLmFsaWduID09PSAnbGVmdCcgKSB7XG4gICAgICAgIGl0ZW1Qcm94eS5sZWZ0ID0gaGlnaGxpZ2h0UHJveHkubGVmdCArIG9wdGlvbnMueE1hcmdpbjtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCBvcHRpb25zLmFsaWduID09PSAncmlnaHQnICkge1xuICAgICAgICBpdGVtUHJveHkucmlnaHQgPSBoaWdobGlnaHRQcm94eS5yaWdodCAtIG9wdGlvbnMueE1hcmdpbjtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBpdGVtUHJveHkuY2VudGVyWCA9IGhpZ2hsaWdodFByb3h5LmNlbnRlclg7XG4gICAgICB9XG4gICAgICBpdGVtUHJveHkuY2VudGVyWSA9IGhpZ2hsaWdodFByb3h5LmNlbnRlclk7XG4gICAgfSApO1xuXG4gICAgdGhpcy5pdGVtID0gaXRlbTtcblxuICAgIC8vIHBkb20gZm9jdXMgaGlnaGxpZ2h0IGlzIGZpdHRlZCB0byB0aGlzIE5vZGUncyBib3VuZHMsIHNvIHRoYXQgaXQgZG9lc24ndCBvdmVybGFwIG90aGVyIGl0ZW1zIGluIHRoZSBsaXN0IGJveFxuICAgIHRoaXMubG9jYWxCb3VuZHNQcm9wZXJ0eS5saW5rKCBsb2NhbEJvdW5kcyA9PiB7XG4gICAgICB0aGlzLmZvY3VzSGlnaGxpZ2h0ID0gU2hhcGUuYm91bmRzKCBsb2NhbEJvdW5kcyApO1xuICAgIH0gKTtcblxuICAgIGNvbnN0IHByZXNzTGlzdGVuZXIgPSBuZXcgUHJlc3NMaXN0ZW5lcigge1xuICAgICAgYXR0YWNoOiBmYWxzZSxcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgICB9ICk7XG4gICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCBwcmVzc0xpc3RlbmVyICk7XG5cbiAgICAvLyBTaG93IGhpZ2hsaWdodCB3aGVuIHBvaW50ZXIgaXMgb3ZlciB0aGlzIGl0ZW0uXG4gICAgLy8gQ2hhbmdlIGZpbGwgaW5zdGVhZCBvZiB2aXNpYmlsaXR5IHNvIHRoYXQgd2UgZG9uJ3QgZW5kIHVwIHdpdGggdmVydGljYWwgcG9pbnRlciBnYXBzIGluIHRoZSBsaXN0XG4gICAgcHJlc3NMaXN0ZW5lci5sb29rc092ZXJQcm9wZXJ0eS5saW5rKCBwcmVzc2VkID0+IHtcbiAgICAgIGhpZ2hsaWdodFJlY3RhbmdsZS5maWxsID0gcHJlc3NlZCA/IG9wdGlvbnMuaGlnaGxpZ2h0RmlsbCA6IG51bGw7XG4gICAgfSApO1xuXG4gICAgdGhpcy5kaXNwb3NlQ29tYm9Cb3hMaXN0SXRlbU5vZGUgPSAoKSA9PiB7XG4gICAgICBwcmVzc0xpc3RlbmVyLmRpc3Bvc2UoKTtcbiAgICAgIHBhdHRlcm5TdHJpbmdQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgICBoaWdobGlnaHRXaWR0aFByb3BlcnR5LnVubGluayggaGlnaGxpZ2h0V2lkdGhMaXN0ZW5lciApO1xuICAgICAgaGlnaGxpZ2h0SGVpZ2h0UHJvcGVydHkudW5saW5rKCBoaWdobGlnaHRIZWlnaHRMaXN0ZW5lciApO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQXNrIGZvciB0aGUgdm9pY2luZyByZXNwb25zZSBmb3Igb3BlbmluZyB0aGUgQ29tYm9Cb3ggdXBvbiBuZXh0IGZvY3VzLCBidXQgb25seSBmb3IgdGhlIHZlcnkgbmV4dCBmb2N1cyBldmVudC5cbiAgICovXG4gIHB1YmxpYyBzdXBwbHlPcGVuUmVzcG9uc2VPbk5leHRGb2N1cygpOiB2b2lkIHtcbiAgICB0aGlzLl9zdXBwbHlPcGVuUmVzcG9uc2VPbk5leHRGb2N1cyA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogRnJlZSBtZW1vcnkgcmVmZXJlbmNlcyB0byBhdm9pZCBsZWFrcy5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZUNvbWJvQm94TGlzdEl0ZW1Ob2RlKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgY3VzdG9tIGZvY3VzIGxpc3RlbmVyIGZvciB0aGlzIHR5cGUsIHdpdGggY29uZGl0aW9uYWwgc3VwcG9ydCBmb3IgcHJvdmlkaW5nIGEgbm9ybWFsIGZvY3VzIHZzIGFuIFwib3BlblwiIHJlc3BvbnNlLlxuICAgKi9cbiAgcHJpdmF0ZSBjb21ib0JveExpc3RJdGVtTm9kZVZvaWNpbmdGb2N1c0xpc3RlbmVyKCk6IHZvaWQge1xuICAgIHRoaXMudm9pY2luZ1NwZWFrRnVsbFJlc3BvbnNlKCB7XG4gICAgICBuYW1lUmVzcG9uc2U6IHRoaXMuX3N1cHBseU9wZW5SZXNwb25zZU9uTmV4dEZvY3VzID8gdGhpcy52b2ljaW5nTmFtZVJlc3BvbnNlIDogbnVsbCxcbiAgICAgIG9iamVjdFJlc3BvbnNlOiB0aGlzLl9zdXBwbHlPcGVuUmVzcG9uc2VPbk5leHRGb2N1cyA/IG51bGwgOiB0aGlzLnZvaWNpbmdPYmplY3RSZXNwb25zZSxcbiAgICAgIGNvbnRleHRSZXNwb25zZTogbnVsbCxcbiAgICAgIGhpbnRSZXNwb25zZTogdGhpcy5fc3VwcGx5T3BlblJlc3BvbnNlT25OZXh0Rm9jdXMgPyB0aGlzLnZvaWNpbmdIaW50UmVzcG9uc2UgOiBudWxsXG4gICAgfSApO1xuICAgIHRoaXMuX3N1cHBseU9wZW5SZXNwb25zZU9uTmV4dEZvY3VzID0gZmFsc2U7XG4gIH1cbn1cblxuc3VuLnJlZ2lzdGVyKCAnQ29tYm9Cb3hMaXN0SXRlbU5vZGUnLCBDb21ib0JveExpc3RJdGVtTm9kZSApOyJdLCJuYW1lcyI6WyJQYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlNoYXBlIiwib3B0aW9uaXplIiwiSW5kZXhlZE5vZGVJTyIsIk1hbnVhbENvbnN0cmFpbnQiLCJOb2RlIiwiUHJlc3NMaXN0ZW5lciIsIlJlY3RhbmdsZSIsIlZvaWNpbmciLCJUYW5kZW0iLCJzdW4iLCJTdW5Db25zdGFudHMiLCJDb21ib0JveExpc3RJdGVtTm9kZSIsInN1cHBseU9wZW5SZXNwb25zZU9uTmV4dEZvY3VzIiwiX3N1cHBseU9wZW5SZXNwb25zZU9uTmV4dEZvY3VzIiwiZGlzcG9zZSIsImRpc3Bvc2VDb21ib0JveExpc3RJdGVtTm9kZSIsImNvbWJvQm94TGlzdEl0ZW1Ob2RlVm9pY2luZ0ZvY3VzTGlzdGVuZXIiLCJ2b2ljaW5nU3BlYWtGdWxsUmVzcG9uc2UiLCJuYW1lUmVzcG9uc2UiLCJ2b2ljaW5nTmFtZVJlc3BvbnNlIiwib2JqZWN0UmVzcG9uc2UiLCJ2b2ljaW5nT2JqZWN0UmVzcG9uc2UiLCJjb250ZXh0UmVzcG9uc2UiLCJoaW50UmVzcG9uc2UiLCJ2b2ljaW5nSGludFJlc3BvbnNlIiwiaXRlbSIsIm5vZGUiLCJoaWdobGlnaHRXaWR0aFByb3BlcnR5IiwiaGlnaGxpZ2h0SGVpZ2h0UHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiY3Vyc29yIiwiYWxpZ24iLCJ4TWFyZ2luIiwiaGlnaGxpZ2h0RmlsbCIsImhpZ2hsaWdodENvcm5lclJhZGl1cyIsInRhZ05hbWUiLCJmb2N1c2FibGUiLCJhcmlhUm9sZSIsInBvc2l0aW9uSW5QRE9NIiwidm9pY2luZ0ZvY3VzTGlzdGVuZXIiLCJjb21ib0JveFZvaWNpbmdOYW1lUmVzcG9uc2VQYXR0ZXJuIiwiVkFMVUVfTkFNRURfUExBQ0VIT0xERVIiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInRhbmRlbU5hbWVTdWZmaXgiLCJwaGV0aW9UeXBlIiwicGhldGlvU3RhdGUiLCJ2aXNpYmxlUHJvcGVydHlPcHRpb25zIiwicGhldGlvRmVhdHVyZWQiLCJnZXQiLCJhc3NlcnQiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsInN0cmluZ1Rlc3QiLCJpbmNsdWRlcyIsImlubmVyQ29udGVudCIsImFjY2Vzc2libGVOYW1lIiwicGF0dGVyblByb3BlcnR5IiwicGF0dGVyblN0cmluZ1Byb3BlcnR5IiwidmFsdWUiLCJPUFRfT1VUIiwiaGlnaGxpZ2h0UmVjdGFuZ2xlIiwiY29ybmVyUmFkaXVzIiwiaXRlbU5vZGVXcmFwcGVyIiwiY2hpbGRyZW4iLCJoaWdobGlnaHRXaWR0aExpc3RlbmVyIiwid2lkdGgiLCJyZWN0V2lkdGgiLCJtYXhXaWR0aCIsImxpbmsiLCJoaWdobGlnaHRIZWlnaHRMaXN0ZW5lciIsImhlaWdodCIsInJlY3RIZWlnaHQiLCJtYXhIZWlnaHQiLCJjcmVhdGUiLCJoaWdobGlnaHRQcm94eSIsIml0ZW1Qcm94eSIsImxlZnQiLCJyaWdodCIsImNlbnRlclgiLCJjZW50ZXJZIiwibG9jYWxCb3VuZHNQcm9wZXJ0eSIsImxvY2FsQm91bmRzIiwiZm9jdXNIaWdobGlnaHQiLCJib3VuZHMiLCJwcmVzc0xpc3RlbmVyIiwiYXR0YWNoIiwiYWRkSW5wdXRMaXN0ZW5lciIsImxvb2tzT3ZlclByb3BlcnR5IiwicHJlc3NlZCIsImZpbGwiLCJ1bmxpbmsiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Q0FNQyxHQUVELE9BQU9BLDJCQUEyQix5Q0FBeUM7QUFDM0UsT0FBT0MsY0FBYyw0QkFBNEI7QUFFakQsU0FBU0MsS0FBSyxRQUFRLDJCQUEyQjtBQUNqRCxPQUFPQyxlQUFlLGtDQUFrQztBQUV4RCxTQUFTQyxhQUFhLEVBQUVDLGdCQUFnQixFQUFFQyxJQUFJLEVBQWVDLGFBQWEsRUFBRUMsU0FBUyxFQUFVQyxPQUFPLFFBQXdCLDhCQUE4QjtBQUM1SixPQUFPQyxZQUFZLDRCQUE0QjtBQUUvQyxPQUFPQyxTQUFTLFdBQVc7QUFDM0IsT0FBT0Msa0JBQWtCLG9CQUFvQjtBQW1COUIsSUFBQSxBQUFNQyx1QkFBTixNQUFNQSw2QkFBZ0NKLFFBQVNIO0lBOEk1RDs7R0FFQyxHQUNELEFBQU9RLGdDQUFzQztRQUMzQyxJQUFJLENBQUNDLDhCQUE4QixHQUFHO0lBQ3hDO0lBRUE7O0dBRUMsR0FDRCxBQUFnQkMsVUFBZ0I7UUFDOUIsSUFBSSxDQUFDQywyQkFBMkI7UUFDaEMsS0FBSyxDQUFDRDtJQUNSO0lBRUE7O0dBRUMsR0FDRCxBQUFRRSwyQ0FBaUQ7UUFDdkQsSUFBSSxDQUFDQyx3QkFBd0IsQ0FBRTtZQUM3QkMsY0FBYyxJQUFJLENBQUNMLDhCQUE4QixHQUFHLElBQUksQ0FBQ00sbUJBQW1CLEdBQUc7WUFDL0VDLGdCQUFnQixJQUFJLENBQUNQLDhCQUE4QixHQUFHLE9BQU8sSUFBSSxDQUFDUSxxQkFBcUI7WUFDdkZDLGlCQUFpQjtZQUNqQkMsY0FBYyxJQUFJLENBQUNWLDhCQUE4QixHQUFHLElBQUksQ0FBQ1csbUJBQW1CLEdBQUc7UUFDakY7UUFDQSxJQUFJLENBQUNYLDhCQUE4QixHQUFHO0lBQ3hDO0lBOUpBLFlBQ0VZLElBQTJCLEVBQzNCQyxJQUFVLEVBQ1ZDLHNCQUFpRCxFQUNq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