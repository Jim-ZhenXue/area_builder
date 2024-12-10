// Copyright 2017-2024, University of Colorado Boulder
/**
 * MenuItem is an item in the PhetMenu.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import optionize from '../../phet-core/js/optionize.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { allowLinksProperty, FireListener, ManualConstraint, Node, Path, Rectangle, Text, Voicing, WidthSizable } from '../../scenery/js/imports.js';
import checkSolidShape from '../../sherpa/js/fontawesome-5/checkSolidShape.js';
import EventType from '../../tandem/js/EventType.js';
import sun from './sun.js';
// the check mark used for toggle-able menu items
const CHECK_MARK_NODE = new Path(checkSolidShape, {
    fill: 'rgba(0,0,0,0.7)',
    maxWidth: 15.5
});
// constants
const FONT_SIZE = 18;
const HIGHLIGHT_COLOR = '#a6d2f4';
const MAX_ITEM_WIDTH = 400;
const CHECK_PADDING = 2; // padding between the check and text
const CHECK_OFFSET = CHECK_MARK_NODE.width + CHECK_PADDING; // offset that includes the check mark's width and padding
const LEFT_X_MARGIN = 2;
const RIGHT_X_MARGIN = 5;
const Y_MARGIN = 3;
const CORNER_RADIUS = 5;
let MenuItem = class MenuItem extends WidthSizable(Voicing(Node)) {
    dispose() {
        this.disposeMenuItem();
        super.dispose();
    }
    /**
   * @param closeCallback - called when firing the menu item, most likely this should close the PhetMenu.
   * @param labelStringProperty - label for the menu item
   * @param callback - called when the menu item is selected
   * @param present - see present field
   * @param shouldBeHiddenWhenLinksAreNotAllowed
   * @param [providedOptions]
   */ constructor(closeCallback, labelStringProperty, callback, present, shouldBeHiddenWhenLinksAreNotAllowed, providedOptions){
        var _options_tandem;
        // Extend the object with defaults.
        const options = optionize()({
            // SelfOptions
            separatorBefore: false,
            checkedProperty: null,
            textFill: 'black',
            // VoicingOptions
            cursor: 'pointer',
            // phet-io
            phetioDocumentation: 'Item buttons shown in a popup menu',
            phetioEventType: EventType.USER,
            // pdom
            tagName: 'button',
            containerTagName: 'li',
            containerAriaRole: 'none',
            ariaRole: 'menuitem',
            // 'menuitem' role does not get click events on iOS VoiceOver, position siblings so that
            // we get Pointer events instead
            positionInPDOM: true
        }, providedOptions);
        super();
        if (shouldBeHiddenWhenLinksAreNotAllowed) {
            this.setVisibleProperty(allowLinksProperty);
        }
        const labelStringListener = (labelString)=>{
            this.innerContent = labelString;
            this.voicingNameResponse = labelString;
        };
        labelStringProperty.link(labelStringListener);
        this.present = present;
        const labelText = new Text(labelStringProperty, {
            font: new PhetFont(FONT_SIZE),
            fill: options.textFill,
            maxWidth: MAX_ITEM_WIDTH
        });
        const highlight = new Rectangle({
            cornerRadius: CORNER_RADIUS
        });
        labelText.boundsProperty.link((textBounds)=>{
            this.localMinimumWidth = textBounds.width + LEFT_X_MARGIN + RIGHT_X_MARGIN + CHECK_OFFSET;
            highlight.rectHeight = textBounds.height + Y_MARGIN + Y_MARGIN;
        });
        this.localPreferredWidthProperty.link((preferredWidth)=>{
            if (preferredWidth === null) {
                preferredWidth = this.localMinimumWidth;
            } else {
                preferredWidth = Math.max(this.localMinimumWidth || 0, preferredWidth);
            }
            if (preferredWidth) {
                highlight.rectWidth = preferredWidth;
            }
        });
        this.addChild(highlight);
        this.addChild(labelText);
        ManualConstraint.create(this, [
            highlight,
            labelText
        ], (highlightProxy, labelTextProxy)=>{
            labelTextProxy.left = highlightProxy.left + LEFT_X_MARGIN + CHECK_OFFSET; // labelStringProperty is left aligned
            labelTextProxy.centerY = highlightProxy.centerY;
        });
        this.addInputListener({
            enter: ()=>{
                highlight.fill = HIGHLIGHT_COLOR;
            },
            exit: ()=>{
                highlight.fill = null;
            }
        });
        this.addInputListener(new FireListener({
            tandem: (_options_tandem = options.tandem) == null ? void 0 : _options_tandem.createTandem('fireListener'),
            fire: (event)=>{
                closeCallback(event);
                callback(event);
            }
        }));
        this.separatorBefore = options.separatorBefore;
        // Optionally add a check mark and hook up visibility changes.
        let checkedListener = null;
        if (options.checkedProperty) {
            const checkMarkWrapper = new Node({
                children: [
                    CHECK_MARK_NODE
                ],
                right: labelText.left - CHECK_PADDING,
                centerY: labelText.centerY
            });
            checkedListener = (isChecked)=>{
                checkMarkWrapper.visible = isChecked;
            };
            options.checkedProperty.link(checkedListener);
            this.addChild(checkMarkWrapper);
        }
        this.mutate(options);
        this.disposeMenuItem = ()=>{
            if (options.checkedProperty && checkedListener && options.checkedProperty.hasListener(checkedListener)) {
                options.checkedProperty.unlink(checkedListener);
            }
            if (labelStringProperty.hasListener(labelStringListener)) {
                labelStringProperty.unlink(labelStringListener);
            }
            labelText.dispose();
        };
    }
};
export { MenuItem as default };
sun.register('MenuItem', MenuItem);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9NZW51SXRlbS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBNZW51SXRlbSBpcyBhbiBpdGVtIGluIHRoZSBQaGV0TWVudS5cbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgeyBhbGxvd0xpbmtzUHJvcGVydHksIEZpcmVMaXN0ZW5lciwgTWFudWFsQ29uc3RyYWludCwgTm9kZSwgTm9kZU9wdGlvbnMsIFBhdGgsIFJlY3RhbmdsZSwgU2NlbmVyeUV2ZW50LCBUZXh0LCBUUGFpbnQsIFZvaWNpbmcsIFZvaWNpbmdPcHRpb25zLCBXaWR0aFNpemFibGUgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IGNoZWNrU29saWRTaGFwZSBmcm9tICcuLi8uLi9zaGVycGEvanMvZm9udGF3ZXNvbWUtNS9jaGVja1NvbGlkU2hhcGUuanMnO1xuaW1wb3J0IEV2ZW50VHlwZSBmcm9tICcuLi8uLi90YW5kZW0vanMvRXZlbnRUeXBlLmpzJztcbmltcG9ydCBzdW4gZnJvbSAnLi9zdW4uanMnO1xuXG4vLyB0aGUgY2hlY2sgbWFyayB1c2VkIGZvciB0b2dnbGUtYWJsZSBtZW51IGl0ZW1zXG5jb25zdCBDSEVDS19NQVJLX05PREUgPSBuZXcgUGF0aCggY2hlY2tTb2xpZFNoYXBlLCB7XG4gIGZpbGw6ICdyZ2JhKDAsMCwwLDAuNyknLFxuICBtYXhXaWR0aDogMTUuNVxufSApO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IEZPTlRfU0laRSA9IDE4O1xuY29uc3QgSElHSExJR0hUX0NPTE9SID0gJyNhNmQyZjQnO1xuY29uc3QgTUFYX0lURU1fV0lEVEggPSA0MDA7XG5jb25zdCBDSEVDS19QQURESU5HID0gMjsgIC8vIHBhZGRpbmcgYmV0d2VlbiB0aGUgY2hlY2sgYW5kIHRleHRcbmNvbnN0IENIRUNLX09GRlNFVCA9IENIRUNLX01BUktfTk9ERS53aWR0aCArIENIRUNLX1BBRERJTkc7IC8vIG9mZnNldCB0aGF0IGluY2x1ZGVzIHRoZSBjaGVjayBtYXJrJ3Mgd2lkdGggYW5kIHBhZGRpbmdcbmNvbnN0IExFRlRfWF9NQVJHSU4gPSAyO1xuY29uc3QgUklHSFRfWF9NQVJHSU4gPSA1O1xuY29uc3QgWV9NQVJHSU4gPSAzO1xuY29uc3QgQ09STkVSX1JBRElVUyA9IDU7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG5cbiAgLy8gaWYgdGhlcmUgc2hvdWxkIGJlIGEgaG9yaXpvbnRhbCBzZXBhcmF0b3IgYmV0d2VlbiB0aGlzIE1lbnVJdGVtIGFuZCB0aGUgb25lIGltbWVkaWF0ZWx5IHByZXZpb3VzXG4gIHNlcGFyYXRvckJlZm9yZT86IGJvb2xlYW47XG5cbiAgLy8gaWYgcHJvdmlkZWQgYWRkIGEgY2hlY2ttYXJrIG5leHQgdG8gdGhlIE1lbnVJdGVtIHRleHQgd2hlbmV2ZXIgdGhpcyBQcm9wZXJ0eSBpcyB0cnVlLlxuICBjaGVja2VkUHJvcGVydHk/OiBUUHJvcGVydHk8Ym9vbGVhbj4gfCBudWxsO1xuXG4gIHRleHRGaWxsPzogVFBhaW50O1xufTtcbnR5cGUgUGFyZW50T3B0aW9ucyA9IFZvaWNpbmdPcHRpb25zICYgTm9kZU9wdGlvbnM7XG5leHBvcnQgdHlwZSBNZW51SXRlbU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBhcmVudE9wdGlvbnM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1lbnVJdGVtIGV4dGVuZHMgV2lkdGhTaXphYmxlKCBWb2ljaW5nKCBOb2RlICkgKSB7XG5cbiAgLy8gaWYgdGhpcyBNZW51SXRlbSB3aWxsIGJlIHNob3duIGluIHRoZSBtZW51LiBTb21lIGl0ZW1zIGFyZSBqdXN0IGNyZWF0ZWQgdG8gbWFpbnRhaW4gYVxuICAvLyBjb25zaXN0ZW50IFBoRVQtaU8gQVBJIGZvciBhbGwgc2ltIHJ1bnRpbWVzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vaXNzdWVzLzE0NTdcbiAgcHVibGljIHJlYWRvbmx5IHByZXNlbnQ6IGJvb2xlYW47XG5cbiAgLy8gaWYgdGhlcmUgc2hvdWxkIGJlIGEgaG9yaXpvbnRhbCBzZXBhcmF0b3IgYmV0d2VlbiB0aGlzIE1lbnVJdGVtIGFuZCB0aGUgb25lIGFib3ZlIGl0XG4gIHB1YmxpYyByZWFkb25seSBzZXBhcmF0b3JCZWZvcmU6IGJvb2xlYW47XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlTWVudUl0ZW06ICgpID0+IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBjbG9zZUNhbGxiYWNrIC0gY2FsbGVkIHdoZW4gZmlyaW5nIHRoZSBtZW51IGl0ZW0sIG1vc3QgbGlrZWx5IHRoaXMgc2hvdWxkIGNsb3NlIHRoZSBQaGV0TWVudS5cbiAgICogQHBhcmFtIGxhYmVsU3RyaW5nUHJvcGVydHkgLSBsYWJlbCBmb3IgdGhlIG1lbnUgaXRlbVxuICAgKiBAcGFyYW0gY2FsbGJhY2sgLSBjYWxsZWQgd2hlbiB0aGUgbWVudSBpdGVtIGlzIHNlbGVjdGVkXG4gICAqIEBwYXJhbSBwcmVzZW50IC0gc2VlIHByZXNlbnQgZmllbGRcbiAgICogQHBhcmFtIHNob3VsZEJlSGlkZGVuV2hlbkxpbmtzQXJlTm90QWxsb3dlZFxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggY2xvc2VDYWxsYmFjazogKCBldmVudDogU2NlbmVyeUV2ZW50ICkgPT4gdm9pZCxcbiAgICAgICAgICAgICAgICAgICAgICBsYWJlbFN0cmluZ1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+LFxuICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKSA9PiB2b2lkLCBwcmVzZW50OiBib29sZWFuLFxuICAgICAgICAgICAgICAgICAgICAgIHNob3VsZEJlSGlkZGVuV2hlbkxpbmtzQXJlTm90QWxsb3dlZDogYm9vbGVhbixcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM/OiBNZW51SXRlbU9wdGlvbnMgKSB7XG5cbiAgICAvLyBFeHRlbmQgdGhlIG9iamVjdCB3aXRoIGRlZmF1bHRzLlxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8TWVudUl0ZW1PcHRpb25zLCBTZWxmT3B0aW9ucywgUGFyZW50T3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyBTZWxmT3B0aW9uc1xuICAgICAgc2VwYXJhdG9yQmVmb3JlOiBmYWxzZSxcbiAgICAgIGNoZWNrZWRQcm9wZXJ0eTogbnVsbCxcbiAgICAgIHRleHRGaWxsOiAnYmxhY2snLFxuXG4gICAgICAvLyBWb2ljaW5nT3B0aW9uc1xuICAgICAgY3Vyc29yOiAncG9pbnRlcicsXG5cbiAgICAgIC8vIHBoZXQtaW9cbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdJdGVtIGJ1dHRvbnMgc2hvd24gaW4gYSBwb3B1cCBtZW51JyxcbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVIsXG5cbiAgICAgIC8vIHBkb21cbiAgICAgIHRhZ05hbWU6ICdidXR0b24nLFxuICAgICAgY29udGFpbmVyVGFnTmFtZTogJ2xpJyxcbiAgICAgIGNvbnRhaW5lckFyaWFSb2xlOiAnbm9uZScsIC8vIHRoaXMgaXMgcmVxdWlyZWQgZm9yIEpBV1MgdG8gaGFuZGxlIGZvY3VzIGNvcnJlY3RseSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2huLXRyYXZvbHRhZ2UvaXNzdWVzLzIyNVxuICAgICAgYXJpYVJvbGU6ICdtZW51aXRlbScsXG5cbiAgICAgIC8vICdtZW51aXRlbScgcm9sZSBkb2VzIG5vdCBnZXQgY2xpY2sgZXZlbnRzIG9uIGlPUyBWb2ljZU92ZXIsIHBvc2l0aW9uIHNpYmxpbmdzIHNvIHRoYXRcbiAgICAgIC8vIHdlIGdldCBQb2ludGVyIGV2ZW50cyBpbnN0ZWFkXG4gICAgICBwb3NpdGlvbkluUERPTTogdHJ1ZVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoKTtcblxuICAgIGlmICggc2hvdWxkQmVIaWRkZW5XaGVuTGlua3NBcmVOb3RBbGxvd2VkICkge1xuICAgICAgdGhpcy5zZXRWaXNpYmxlUHJvcGVydHkoIGFsbG93TGlua3NQcm9wZXJ0eSApO1xuICAgIH1cblxuICAgIGNvbnN0IGxhYmVsU3RyaW5nTGlzdGVuZXIgPSAoIGxhYmVsU3RyaW5nOiBzdHJpbmcgKSA9PiB7XG4gICAgICB0aGlzLmlubmVyQ29udGVudCA9IGxhYmVsU3RyaW5nO1xuICAgICAgdGhpcy52b2ljaW5nTmFtZVJlc3BvbnNlID0gbGFiZWxTdHJpbmc7XG4gICAgfTtcbiAgICBsYWJlbFN0cmluZ1Byb3BlcnR5LmxpbmsoIGxhYmVsU3RyaW5nTGlzdGVuZXIgKTtcblxuICAgIHRoaXMucHJlc2VudCA9IHByZXNlbnQ7XG5cbiAgICBjb25zdCBsYWJlbFRleHQgPSBuZXcgVGV4dCggbGFiZWxTdHJpbmdQcm9wZXJ0eSwge1xuICAgICAgZm9udDogbmV3IFBoZXRGb250KCBGT05UX1NJWkUgKSxcbiAgICAgIGZpbGw6IG9wdGlvbnMudGV4dEZpbGwsXG4gICAgICBtYXhXaWR0aDogTUFYX0lURU1fV0lEVEhcbiAgICB9ICk7XG5cbiAgICBjb25zdCBoaWdobGlnaHQgPSBuZXcgUmVjdGFuZ2xlKCB7XG4gICAgICBjb3JuZXJSYWRpdXM6IENPUk5FUl9SQURJVVNcbiAgICB9ICk7XG5cbiAgICBsYWJlbFRleHQuYm91bmRzUHJvcGVydHkubGluayggdGV4dEJvdW5kcyA9PiB7XG4gICAgICB0aGlzLmxvY2FsTWluaW11bVdpZHRoID0gdGV4dEJvdW5kcy53aWR0aCArIExFRlRfWF9NQVJHSU4gKyBSSUdIVF9YX01BUkdJTiArIENIRUNLX09GRlNFVDtcbiAgICAgIGhpZ2hsaWdodC5yZWN0SGVpZ2h0ID0gdGV4dEJvdW5kcy5oZWlnaHQgKyBZX01BUkdJTiArIFlfTUFSR0lOO1xuICAgIH0gKTtcblxuICAgIHRoaXMubG9jYWxQcmVmZXJyZWRXaWR0aFByb3BlcnR5LmxpbmsoIHByZWZlcnJlZFdpZHRoID0+IHtcbiAgICAgIGlmICggcHJlZmVycmVkV2lkdGggPT09IG51bGwgKSB7XG4gICAgICAgIHByZWZlcnJlZFdpZHRoID0gdGhpcy5sb2NhbE1pbmltdW1XaWR0aDtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBwcmVmZXJyZWRXaWR0aCA9IE1hdGgubWF4KCB0aGlzLmxvY2FsTWluaW11bVdpZHRoIHx8IDAsIHByZWZlcnJlZFdpZHRoICk7XG4gICAgICB9XG4gICAgICBpZiAoIHByZWZlcnJlZFdpZHRoICkge1xuICAgICAgICBoaWdobGlnaHQucmVjdFdpZHRoID0gcHJlZmVycmVkV2lkdGg7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgdGhpcy5hZGRDaGlsZCggaGlnaGxpZ2h0ICk7XG4gICAgdGhpcy5hZGRDaGlsZCggbGFiZWxUZXh0ICk7XG5cbiAgICBNYW51YWxDb25zdHJhaW50LmNyZWF0ZSggdGhpcywgWyBoaWdobGlnaHQsIGxhYmVsVGV4dCBdLCAoIGhpZ2hsaWdodFByb3h5LCBsYWJlbFRleHRQcm94eSApID0+IHtcbiAgICAgIGxhYmVsVGV4dFByb3h5LmxlZnQgPSBoaWdobGlnaHRQcm94eS5sZWZ0ICsgTEVGVF9YX01BUkdJTiArIENIRUNLX09GRlNFVDsgLy8gbGFiZWxTdHJpbmdQcm9wZXJ0eSBpcyBsZWZ0IGFsaWduZWRcbiAgICAgIGxhYmVsVGV4dFByb3h5LmNlbnRlclkgPSBoaWdobGlnaHRQcm94eS5jZW50ZXJZO1xuICAgIH0gKTtcblxuICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lcigge1xuICAgICAgZW50ZXI6ICgpID0+IHsgaGlnaGxpZ2h0LmZpbGwgPSBISUdITElHSFRfQ09MT1I7IH0sXG4gICAgICBleGl0OiAoKSA9PiB7IGhpZ2hsaWdodC5maWxsID0gbnVsbDsgfVxuICAgIH0gKTtcblxuICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggbmV3IEZpcmVMaXN0ZW5lcigge1xuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAnZmlyZUxpc3RlbmVyJyApLFxuICAgICAgZmlyZTogKCBldmVudDogU2NlbmVyeUV2ZW50ICkgPT4ge1xuICAgICAgICBjbG9zZUNhbGxiYWNrKCBldmVudCApO1xuICAgICAgICBjYWxsYmFjayggZXZlbnQgKTtcbiAgICAgIH1cbiAgICB9ICkgKTtcblxuICAgIHRoaXMuc2VwYXJhdG9yQmVmb3JlID0gb3B0aW9ucy5zZXBhcmF0b3JCZWZvcmU7XG5cbiAgICAvLyBPcHRpb25hbGx5IGFkZCBhIGNoZWNrIG1hcmsgYW5kIGhvb2sgdXAgdmlzaWJpbGl0eSBjaGFuZ2VzLlxuICAgIGxldCBjaGVja2VkTGlzdGVuZXI6ICggKCBpc0NoZWNrZWQ6IGJvb2xlYW4gKSA9PiB2b2lkICkgfCBudWxsID0gbnVsbDtcbiAgICBpZiAoIG9wdGlvbnMuY2hlY2tlZFByb3BlcnR5ICkge1xuICAgICAgY29uc3QgY2hlY2tNYXJrV3JhcHBlciA9IG5ldyBOb2RlKCB7XG4gICAgICAgIGNoaWxkcmVuOiBbIENIRUNLX01BUktfTk9ERSBdLFxuICAgICAgICByaWdodDogbGFiZWxUZXh0LmxlZnQgLSBDSEVDS19QQURESU5HLFxuICAgICAgICBjZW50ZXJZOiBsYWJlbFRleHQuY2VudGVyWVxuICAgICAgfSApO1xuICAgICAgY2hlY2tlZExpc3RlbmVyID0gKCBpc0NoZWNrZWQ6IGJvb2xlYW4gKSA9PiB7XG4gICAgICAgIGNoZWNrTWFya1dyYXBwZXIudmlzaWJsZSA9IGlzQ2hlY2tlZDtcbiAgICAgIH07XG4gICAgICBvcHRpb25zLmNoZWNrZWRQcm9wZXJ0eS5saW5rKCBjaGVja2VkTGlzdGVuZXIgKTtcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIGNoZWNrTWFya1dyYXBwZXIgKTtcbiAgICB9XG5cbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xuXG4gICAgdGhpcy5kaXNwb3NlTWVudUl0ZW0gPSAoKSA9PiB7XG4gICAgICBpZiAoIG9wdGlvbnMuY2hlY2tlZFByb3BlcnR5ICYmIGNoZWNrZWRMaXN0ZW5lciAmJiBvcHRpb25zLmNoZWNrZWRQcm9wZXJ0eS5oYXNMaXN0ZW5lciggY2hlY2tlZExpc3RlbmVyICkgKSB7XG4gICAgICAgIG9wdGlvbnMuY2hlY2tlZFByb3BlcnR5LnVubGluayggY2hlY2tlZExpc3RlbmVyICk7XG4gICAgICB9XG5cbiAgICAgIGlmICggbGFiZWxTdHJpbmdQcm9wZXJ0eS5oYXNMaXN0ZW5lciggbGFiZWxTdHJpbmdMaXN0ZW5lciApICkge1xuICAgICAgICBsYWJlbFN0cmluZ1Byb3BlcnR5LnVubGluayggbGFiZWxTdHJpbmdMaXN0ZW5lciApO1xuICAgICAgfVxuXG4gICAgICBsYWJlbFRleHQuZGlzcG9zZSgpO1xuICAgIH07XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2VNZW51SXRlbSgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5zdW4ucmVnaXN0ZXIoICdNZW51SXRlbScsIE1lbnVJdGVtICk7Il0sIm5hbWVzIjpbIm9wdGlvbml6ZSIsIlBoZXRGb250IiwiYWxsb3dMaW5rc1Byb3BlcnR5IiwiRmlyZUxpc3RlbmVyIiwiTWFudWFsQ29uc3RyYWludCIsIk5vZGUiLCJQYXRoIiwiUmVjdGFuZ2xlIiwiVGV4dCIsIlZvaWNpbmciLCJXaWR0aFNpemFibGUiLCJjaGVja1NvbGlkU2hhcGUiLCJFdmVudFR5cGUiLCJzdW4iLCJDSEVDS19NQVJLX05PREUiLCJmaWxsIiwibWF4V2lkdGgiLCJGT05UX1NJWkUiLCJISUdITElHSFRfQ09MT1IiLCJNQVhfSVRFTV9XSURUSCIsIkNIRUNLX1BBRERJTkciLCJDSEVDS19PRkZTRVQiLCJ3aWR0aCIsIkxFRlRfWF9NQVJHSU4iLCJSSUdIVF9YX01BUkdJTiIsIllfTUFSR0lOIiwiQ09STkVSX1JBRElVUyIsIk1lbnVJdGVtIiwiZGlzcG9zZSIsImRpc3Bvc2VNZW51SXRlbSIsImNsb3NlQ2FsbGJhY2siLCJsYWJlbFN0cmluZ1Byb3BlcnR5IiwiY2FsbGJhY2siLCJwcmVzZW50Iiwic2hvdWxkQmVIaWRkZW5XaGVuTGlua3NBcmVOb3RBbGxvd2VkIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInNlcGFyYXRvckJlZm9yZSIsImNoZWNrZWRQcm9wZXJ0eSIsInRleHRGaWxsIiwiY3Vyc29yIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInBoZXRpb0V2ZW50VHlwZSIsIlVTRVIiLCJ0YWdOYW1lIiwiY29udGFpbmVyVGFnTmFtZSIsImNvbnRhaW5lckFyaWFSb2xlIiwiYXJpYVJvbGUiLCJwb3NpdGlvbkluUERPTSIsInNldFZpc2libGVQcm9wZXJ0eSIsImxhYmVsU3RyaW5nTGlzdGVuZXIiLCJsYWJlbFN0cmluZyIsImlubmVyQ29udGVudCIsInZvaWNpbmdOYW1lUmVzcG9uc2UiLCJsaW5rIiwibGFiZWxUZXh0IiwiZm9udCIsImhpZ2hsaWdodCIsImNvcm5lclJhZGl1cyIsImJvdW5kc1Byb3BlcnR5IiwidGV4dEJvdW5kcyIsImxvY2FsTWluaW11bVdpZHRoIiwicmVjdEhlaWdodCIsImhlaWdodCIsImxvY2FsUHJlZmVycmVkV2lkdGhQcm9wZXJ0eSIsInByZWZlcnJlZFdpZHRoIiwiTWF0aCIsIm1heCIsInJlY3RXaWR0aCIsImFkZENoaWxkIiwiY3JlYXRlIiwiaGlnaGxpZ2h0UHJveHkiLCJsYWJlbFRleHRQcm94eSIsImxlZnQiLCJjZW50ZXJZIiwiYWRkSW5wdXRMaXN0ZW5lciIsImVudGVyIiwiZXhpdCIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsImZpcmUiLCJldmVudCIsImNoZWNrZWRMaXN0ZW5lciIsImNoZWNrTWFya1dyYXBwZXIiLCJjaGlsZHJlbiIsInJpZ2h0IiwiaXNDaGVja2VkIiwidmlzaWJsZSIsIm11dGF0ZSIsImhhc0xpc3RlbmVyIiwidW5saW5rIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBSUQsT0FBT0EsZUFBZSxrQ0FBa0M7QUFDeEQsT0FBT0MsY0FBYyxvQ0FBb0M7QUFDekQsU0FBU0Msa0JBQWtCLEVBQUVDLFlBQVksRUFBRUMsZ0JBQWdCLEVBQUVDLElBQUksRUFBZUMsSUFBSSxFQUFFQyxTQUFTLEVBQWdCQyxJQUFJLEVBQVVDLE9BQU8sRUFBa0JDLFlBQVksUUFBUSw4QkFBOEI7QUFDeE0sT0FBT0MscUJBQXFCLG1EQUFtRDtBQUMvRSxPQUFPQyxlQUFlLCtCQUErQjtBQUNyRCxPQUFPQyxTQUFTLFdBQVc7QUFFM0IsaURBQWlEO0FBQ2pELE1BQU1DLGtCQUFrQixJQUFJUixLQUFNSyxpQkFBaUI7SUFDakRJLE1BQU07SUFDTkMsVUFBVTtBQUNaO0FBRUEsWUFBWTtBQUNaLE1BQU1DLFlBQVk7QUFDbEIsTUFBTUMsa0JBQWtCO0FBQ3hCLE1BQU1DLGlCQUFpQjtBQUN2QixNQUFNQyxnQkFBZ0IsR0FBSSxxQ0FBcUM7QUFDL0QsTUFBTUMsZUFBZVAsZ0JBQWdCUSxLQUFLLEdBQUdGLGVBQWUsMERBQTBEO0FBQ3RILE1BQU1HLGdCQUFnQjtBQUN0QixNQUFNQyxpQkFBaUI7QUFDdkIsTUFBTUMsV0FBVztBQUNqQixNQUFNQyxnQkFBZ0I7QUFlUCxJQUFBLEFBQU1DLFdBQU4sTUFBTUEsaUJBQWlCakIsYUFB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