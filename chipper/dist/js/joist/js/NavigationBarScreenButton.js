// Copyright 2013-2024, University of Colorado Boulder
/**
 * Button for a single screen in the navigation bar, shows the text and the navigation bar icon.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Chris Malley (PixelZoom, Inc.)
 */ import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Multilink from '../../axon/js/Multilink.js';
import Utils from '../../dot/js/Utils.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import PhetColorScheme from '../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { Color, Node, Rectangle, Text, VBox, Voicing } from '../../scenery/js/imports.js';
import PushButtonModel from '../../sun/js/buttons/PushButtonModel.js';
import HighlightNode from './HighlightNode.js';
import joist from './joist.js';
// constants
const HIGHLIGHT_SPACING = 4;
const getHighlightWidth = (overlay)=>overlay.width + 2 * HIGHLIGHT_SPACING;
let NavigationBarScreenButton = class NavigationBarScreenButton extends Voicing(Node) {
    /**
   * @param navigationBarFillProperty - the color of the navbar, as a string.
   * @param screenProperty
   * @param screen
   * @param simScreenIndex - the index (within sim screens only) of the screen corresponding to this button
   * @param navBarHeight
   * @param [providedOptions]
   */ constructor(navigationBarFillProperty, screenProperty, screen, simScreenIndex, navBarHeight, providedOptions){
        assert && assert(screen.nameProperty.value, `name is required for screen ${simScreenIndex}`);
        assert && assert(screen.navigationBarIcon, `navigationBarIcon is required for screen ${screen.nameProperty.value}`);
        const options = optionize()({
            cursor: 'pointer',
            phetioDocumentation: `Button in the navigation bar that selects the '${screen.tandem.name}' screen`,
            maxButtonWidth: null,
            // pdom
            tagName: 'button',
            containerTagName: 'li',
            descriptionContent: screen.screenButtonsHelpText,
            appendDescription: true,
            // voicing
            voicingHintResponse: screen.screenButtonsHelpText
        }, providedOptions);
        assert && assert(!options.innerContent, 'NavigationBarScreenButton sets its own innerContent');
        super();
        this.screen = screen;
        screen.pdomDisplayNameProperty.link((name)=>{
            this.innerContent = name;
            this.voicingNameResponse = name;
        });
        assert && assert(screen.navigationBarIcon, 'navigationBarIcon should exist');
        // icon
        const icon = new Node({
            children: [
                screen.navigationBarIcon
            ],
            maxHeight: 0.625 * navBarHeight,
            // pdom - the icon may have focusable components in its graphic, but they should be invisible for Interactive
            // Description, all accessibility should go through this button
            pdomVisible: false
        });
        // frame around the icon
        const iconFrame = new Rectangle(0, 0, icon.width, icon.height);
        const iconAndFrame = new Node({
            children: [
                icon,
                iconFrame
            ]
        });
        const text = new Text(screen.nameProperty, {
            font: new PhetFont(10)
        });
        // spacing set by Property link below
        const iconAndText = new VBox({
            children: [
                iconAndFrame,
                text
            ],
            pickable: false,
            usesOpacity: true,
            maxHeight: navBarHeight
        });
        // add a transparent overlay for input handling and to size touchArea/mouseArea
        const overlay = new Rectangle({
            rectBounds: iconAndText.bounds
        });
        // highlights
        const highlightWidth = getHighlightWidth(overlay);
        const brightenHighlight = new HighlightNode(highlightWidth, overlay.height, {
            center: iconAndText.center,
            fill: 'white'
        });
        const darkenHighlight = new HighlightNode(highlightWidth, overlay.height, {
            center: iconAndText.center,
            fill: 'black'
        });
        // Is this button's screen selected?
        const selectedProperty = new DerivedProperty([
            screenProperty
        ], (currentScreen)=>currentScreen === screen);
        // (phet-io) Create the button model, needs to be public so that PhET-iO wrappers can hook up to it if
        // needed. Note it shares a tandem with this, so the emitter will be instrumented as a child of the button.
        // Note that this buttonModel will always be phetioReadOnly false despite the parent value.
        this.buttonModel = new PushButtonModel({
            listener: ()=>{
                screenProperty.value !== screen && this.voicingSpeakFullResponse({
                    objectResponse: null,
                    hintResponse: null
                });
                screenProperty.value = screen;
            },
            tandem: options.tandem,
            phetioEnabledPropertyInstrumented: false
        });
        // Hook up the input listener
        const pressListener = this.buttonModel.createPressListener({
            tandem: options.tandem.createTandem('pressListener')
        });
        this.addInputListener(pressListener);
        this.addInputListener({
            focus: ()=>{
                this.voicingSpeakFullResponse({
                    objectResponse: null,
                    contextResponse: null
                });
            }
        });
        // manage interaction feedback
        Multilink.multilink([
            selectedProperty,
            this.buttonModel.looksPressedProperty,
            this.buttonModel.looksOverProperty,
            navigationBarFillProperty,
            this.buttonModel.enabledProperty
        ], (selected, looksPressed, looksOver, navigationBarFill, enabled)=>{
            const useDarkenHighlights = !navigationBarFill.equals(Color.BLACK);
            // Color match yellow with the PhET Logo
            const selectedTextColor = useDarkenHighlights ? 'black' : PhetColorScheme.BUTTON_YELLOW;
            const unselectedTextColor = useDarkenHighlights ? 'gray' : 'white';
            text.fill = selected ? selectedTextColor : unselectedTextColor;
            iconAndText.opacity = selected ? 1.0 : looksPressed ? 0.65 : 0.5;
            brightenHighlight.visible = !useDarkenHighlights && enabled && (looksOver || looksPressed);
            darkenHighlight.visible = useDarkenHighlights && enabled && (looksOver || looksPressed);
            // Put a frame around the screen icon, depending on the navigation bar background color.
            if (screen.showScreenIconFrameForNavigationBarFill === 'black' && navigationBarFill.equals(Color.BLACK)) {
                iconFrame.stroke = PhetColorScheme.SCREEN_ICON_FRAME;
            } else if (screen.showScreenIconFrameForNavigationBarFill === 'white' && navigationBarFill.equals(Color.WHITE)) {
                iconFrame.stroke = 'black'; // black frame on a white navbar
            } else {
                iconFrame.stroke = 'transparent'; // keep the same bounds for simplicity
            }
        });
        // Keep the cursor in sync with if the button is enabled. This doesn't need to be disposed.
        this.buttonModel.enabledProperty.link((enabled)=>{
            this.cursor = enabled ? options.cursor : null;
        });
        // Update the button's layout
        const updateLayout = ()=>{
            // adjust the vertical space between icon and text, see https://github.com/phetsims/joist/issues/143
            iconAndText.spacing = Utils.clamp(12 - text.height, 0, 3);
            // adjust the overlay
            overlay.setRectBounds(iconAndText.bounds);
            // adjust the highlights
            brightenHighlight.spacing = darkenHighlight.spacing = getHighlightWidth(overlay);
            brightenHighlight.center = darkenHighlight.center = iconAndText.center;
        };
        // Update the button's layout when the screen name changes
        iconAndText.boundsProperty.lazyLink(updateLayout);
        text.boundsProperty.link(updateLayout);
        this.children = [
            iconAndText,
            overlay,
            brightenHighlight,
            darkenHighlight
        ];
        const needsIconMaxWidth = options.maxButtonWidth && this.width > options.maxButtonWidth;
        // Constrain text and icon width, if necessary
        if (needsIconMaxWidth) {
            text.maxWidth = icon.maxWidth = options.maxButtonWidth - (this.width - iconAndText.width);
        } else {
            // Don't allow the text to grow larger than the icon if changed later on using PhET-iO, see #438
            // Text is allowed to go beyond the bounds of the icon, hence we use `this.width` instead of `icon.width`
            text.maxWidth = this.width;
        }
        needsIconMaxWidth && assert && assert(Utils.toFixed(this.width, 0) === Utils.toFixed(options.maxButtonWidth, 0), `this.width ${this.width} !== options.maxButtonWidth ${options.maxButtonWidth}`);
        // A custom focus highlight so that the bottom of the highlight does not get cut-off below the navigation bar.
        // Setting to the localBounds directly prevents the default dilation of the highlight. Shape updates with changing
        // bounds to support dynamic layout.
        this.localBoundsProperty.link((localBounds)=>{
            this.focusHighlight = Shape.bounds(localBounds);
        });
        this.mutate(options);
    }
};
joist.register('NavigationBarScreenButton', NavigationBarScreenButton);
export default NavigationBarScreenButton;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL05hdmlnYXRpb25CYXJTY3JlZW5CdXR0b24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQnV0dG9uIGZvciBhIHNpbmdsZSBzY3JlZW4gaW4gdGhlIG5hdmlnYXRpb24gYmFyLCBzaG93cyB0aGUgdGV4dCBhbmQgdGhlIG5hdmlnYXRpb24gYmFyIGljb24uXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi9kb3QvanMvVXRpbHMuanMnO1xuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Q29sb3JTY2hlbWUuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgeyBDb2xvciwgTm9kZSwgTm9kZU9wdGlvbnMsIFJlY3RhbmdsZSwgVGV4dCwgVkJveCwgVm9pY2luZywgVm9pY2luZ09wdGlvbnMgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IFB1c2hCdXR0b25Nb2RlbCBmcm9tICcuLi8uLi9zdW4vanMvYnV0dG9ucy9QdXNoQnV0dG9uTW9kZWwuanMnO1xuaW1wb3J0IEhpZ2hsaWdodE5vZGUgZnJvbSAnLi9IaWdobGlnaHROb2RlLmpzJztcbmltcG9ydCBqb2lzdCBmcm9tICcuL2pvaXN0LmpzJztcbmltcG9ydCB7IEFueVNjcmVlbiB9IGZyb20gJy4vU2NyZWVuLmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBISUdITElHSFRfU1BBQ0lORyA9IDQ7XG5jb25zdCBnZXRIaWdobGlnaHRXaWR0aCA9ICggb3ZlcmxheTogTm9kZSApID0+IG92ZXJsYXkud2lkdGggKyAoIDIgKiBISUdITElHSFRfU1BBQ0lORyApO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICBtYXhCdXR0b25XaWR0aD86IG51bWJlciB8IG51bGw7XG59O1xudHlwZSBQYXJlbnRPcHRpb25zID0gVm9pY2luZ09wdGlvbnMgJiBOb2RlT3B0aW9ucztcbnR5cGUgTmF2aWdhdGlvbkJhclNjcmVlbkJ1dHRvbk9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBhcmVudE9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8UGFyZW50T3B0aW9ucywgJ3RhbmRlbSc+O1xuXG5jbGFzcyBOYXZpZ2F0aW9uQmFyU2NyZWVuQnV0dG9uIGV4dGVuZHMgVm9pY2luZyggTm9kZSApIHtcbiAgcHJpdmF0ZSByZWFkb25seSBidXR0b25Nb2RlbDogUHVzaEJ1dHRvbk1vZGVsO1xuXG4gIHB1YmxpYyByZWFkb25seSBzY3JlZW46IEFueVNjcmVlbjtcblxuICAvKipcbiAgICogQHBhcmFtIG5hdmlnYXRpb25CYXJGaWxsUHJvcGVydHkgLSB0aGUgY29sb3Igb2YgdGhlIG5hdmJhciwgYXMgYSBzdHJpbmcuXG4gICAqIEBwYXJhbSBzY3JlZW5Qcm9wZXJ0eVxuICAgKiBAcGFyYW0gc2NyZWVuXG4gICAqIEBwYXJhbSBzaW1TY3JlZW5JbmRleCAtIHRoZSBpbmRleCAod2l0aGluIHNpbSBzY3JlZW5zIG9ubHkpIG9mIHRoZSBzY3JlZW4gY29ycmVzcG9uZGluZyB0byB0aGlzIGJ1dHRvblxuICAgKiBAcGFyYW0gbmF2QmFySGVpZ2h0XG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBuYXZpZ2F0aW9uQmFyRmlsbFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxDb2xvcj4sIHNjcmVlblByb3BlcnR5OiBQcm9wZXJ0eTxBbnlTY3JlZW4+LFxuICAgICAgICAgICAgICAgICAgICAgIHNjcmVlbjogQW55U2NyZWVuLCBzaW1TY3JlZW5JbmRleDogbnVtYmVyLCBuYXZCYXJIZWlnaHQ6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM6IE5hdmlnYXRpb25CYXJTY3JlZW5CdXR0b25PcHRpb25zICkge1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2NyZWVuLm5hbWVQcm9wZXJ0eS52YWx1ZSwgYG5hbWUgaXMgcmVxdWlyZWQgZm9yIHNjcmVlbiAke3NpbVNjcmVlbkluZGV4fWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzY3JlZW4ubmF2aWdhdGlvbkJhckljb24sIGBuYXZpZ2F0aW9uQmFySWNvbiBpcyByZXF1aXJlZCBmb3Igc2NyZWVuICR7c2NyZWVuLm5hbWVQcm9wZXJ0eS52YWx1ZX1gICk7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPE5hdmlnYXRpb25CYXJTY3JlZW5CdXR0b25PcHRpb25zLCBTZWxmT3B0aW9ucywgUGFyZW50T3B0aW9ucz4oKSgge1xuICAgICAgY3Vyc29yOiAncG9pbnRlcicsXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiBgQnV0dG9uIGluIHRoZSBuYXZpZ2F0aW9uIGJhciB0aGF0IHNlbGVjdHMgdGhlICcke3NjcmVlbi50YW5kZW0ubmFtZX0nIHNjcmVlbmAsXG4gICAgICBtYXhCdXR0b25XaWR0aDogbnVsbCwgLy8ge251bWJlcnxudWxsfSB0aGUgbWF4aW11bSB3aWR0aCBvZiB0aGUgYnV0dG9uLCBjYXVzZXMgdGV4dCBhbmQvb3IgaWNvbiB0byBiZSBzY2FsZWQgZG93biBpZiBuZWNlc3NhcnlcblxuICAgICAgLy8gcGRvbVxuICAgICAgdGFnTmFtZTogJ2J1dHRvbicsXG4gICAgICBjb250YWluZXJUYWdOYW1lOiAnbGknLFxuICAgICAgZGVzY3JpcHRpb25Db250ZW50OiBzY3JlZW4uc2NyZWVuQnV0dG9uc0hlbHBUZXh0LFxuICAgICAgYXBwZW5kRGVzY3JpcHRpb246IHRydWUsXG5cbiAgICAgIC8vIHZvaWNpbmdcbiAgICAgIHZvaWNpbmdIaW50UmVzcG9uc2U6IHNjcmVlbi5zY3JlZW5CdXR0b25zSGVscFRleHRcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmlubmVyQ29udGVudCwgJ05hdmlnYXRpb25CYXJTY3JlZW5CdXR0b24gc2V0cyBpdHMgb3duIGlubmVyQ29udGVudCcgKTtcblxuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLnNjcmVlbiA9IHNjcmVlbjtcblxuICAgIHNjcmVlbi5wZG9tRGlzcGxheU5hbWVQcm9wZXJ0eS5saW5rKCBuYW1lID0+IHtcbiAgICAgIHRoaXMuaW5uZXJDb250ZW50ID0gbmFtZTtcbiAgICAgIHRoaXMudm9pY2luZ05hbWVSZXNwb25zZSA9IG5hbWU7XG4gICAgfSApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2NyZWVuLm5hdmlnYXRpb25CYXJJY29uLCAnbmF2aWdhdGlvbkJhckljb24gc2hvdWxkIGV4aXN0JyApO1xuICAgIC8vIGljb25cbiAgICBjb25zdCBpY29uID0gbmV3IE5vZGUoIHtcbiAgICAgIGNoaWxkcmVuOiBbIHNjcmVlbi5uYXZpZ2F0aW9uQmFySWNvbiEgXSwgLy8gd3JhcCBpbiBjYXNlIHRoaXMgaWNvbiBpcyB1c2VkIGluIG11bHRpcGxlIHBsYWNlIChlZywgaG9tZSBzY3JlZW4gYW5kIG5hdmJhcilcbiAgICAgIG1heEhlaWdodDogMC42MjUgKiBuYXZCYXJIZWlnaHQsXG5cbiAgICAgIC8vIHBkb20gLSB0aGUgaWNvbiBtYXkgaGF2ZSBmb2N1c2FibGUgY29tcG9uZW50cyBpbiBpdHMgZ3JhcGhpYywgYnV0IHRoZXkgc2hvdWxkIGJlIGludmlzaWJsZSBmb3IgSW50ZXJhY3RpdmVcbiAgICAgIC8vIERlc2NyaXB0aW9uLCBhbGwgYWNjZXNzaWJpbGl0eSBzaG91bGQgZ28gdGhyb3VnaCB0aGlzIGJ1dHRvblxuICAgICAgcGRvbVZpc2libGU6IGZhbHNlXG4gICAgfSApO1xuXG4gICAgLy8gZnJhbWUgYXJvdW5kIHRoZSBpY29uXG4gICAgY29uc3QgaWNvbkZyYW1lID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgaWNvbi53aWR0aCwgaWNvbi5oZWlnaHQgKTtcblxuICAgIGNvbnN0IGljb25BbmRGcmFtZSA9IG5ldyBOb2RlKCB7XG4gICAgICBjaGlsZHJlbjogWyBpY29uLCBpY29uRnJhbWUgXVxuICAgIH0gKTtcblxuICAgIGNvbnN0IHRleHQgPSBuZXcgVGV4dCggc2NyZWVuLm5hbWVQcm9wZXJ0eSwge1xuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxMCApXG4gICAgfSApO1xuXG4gICAgLy8gc3BhY2luZyBzZXQgYnkgUHJvcGVydHkgbGluayBiZWxvd1xuICAgIGNvbnN0IGljb25BbmRUZXh0ID0gbmV3IFZCb3goIHtcbiAgICAgIGNoaWxkcmVuOiBbIGljb25BbmRGcmFtZSwgdGV4dCBdLFxuICAgICAgcGlja2FibGU6IGZhbHNlLFxuICAgICAgdXNlc09wYWNpdHk6IHRydWUsIC8vIGhpbnQsIHNpbmNlIHdlIGNoYW5nZSBpdHMgb3BhY2l0eVxuICAgICAgbWF4SGVpZ2h0OiBuYXZCYXJIZWlnaHRcbiAgICB9ICk7XG5cbiAgICAvLyBhZGQgYSB0cmFuc3BhcmVudCBvdmVybGF5IGZvciBpbnB1dCBoYW5kbGluZyBhbmQgdG8gc2l6ZSB0b3VjaEFyZWEvbW91c2VBcmVhXG4gICAgY29uc3Qgb3ZlcmxheSA9IG5ldyBSZWN0YW5nbGUoIHsgcmVjdEJvdW5kczogaWNvbkFuZFRleHQuYm91bmRzIH0gKTtcblxuICAgIC8vIGhpZ2hsaWdodHNcbiAgICBjb25zdCBoaWdobGlnaHRXaWR0aCA9IGdldEhpZ2hsaWdodFdpZHRoKCBvdmVybGF5ICk7XG4gICAgY29uc3QgYnJpZ2h0ZW5IaWdobGlnaHQgPSBuZXcgSGlnaGxpZ2h0Tm9kZSggaGlnaGxpZ2h0V2lkdGgsIG92ZXJsYXkuaGVpZ2h0LCB7XG4gICAgICBjZW50ZXI6IGljb25BbmRUZXh0LmNlbnRlcixcbiAgICAgIGZpbGw6ICd3aGl0ZSdcbiAgICB9ICk7XG4gICAgY29uc3QgZGFya2VuSGlnaGxpZ2h0ID0gbmV3IEhpZ2hsaWdodE5vZGUoIGhpZ2hsaWdodFdpZHRoLCBvdmVybGF5LmhlaWdodCwge1xuICAgICAgY2VudGVyOiBpY29uQW5kVGV4dC5jZW50ZXIsXG4gICAgICBmaWxsOiAnYmxhY2snXG4gICAgfSApO1xuXG4gICAgLy8gSXMgdGhpcyBidXR0b24ncyBzY3JlZW4gc2VsZWN0ZWQ/XG4gICAgY29uc3Qgc2VsZWN0ZWRQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgc2NyZWVuUHJvcGVydHkgXSwgY3VycmVudFNjcmVlbiA9PiAoIGN1cnJlbnRTY3JlZW4gPT09IHNjcmVlbiApICk7XG5cbiAgICAvLyAocGhldC1pbykgQ3JlYXRlIHRoZSBidXR0b24gbW9kZWwsIG5lZWRzIHRvIGJlIHB1YmxpYyBzbyB0aGF0IFBoRVQtaU8gd3JhcHBlcnMgY2FuIGhvb2sgdXAgdG8gaXQgaWZcbiAgICAvLyBuZWVkZWQuIE5vdGUgaXQgc2hhcmVzIGEgdGFuZGVtIHdpdGggdGhpcywgc28gdGhlIGVtaXR0ZXIgd2lsbCBiZSBpbnN0cnVtZW50ZWQgYXMgYSBjaGlsZCBvZiB0aGUgYnV0dG9uLlxuICAgIC8vIE5vdGUgdGhhdCB0aGlzIGJ1dHRvbk1vZGVsIHdpbGwgYWx3YXlzIGJlIHBoZXRpb1JlYWRPbmx5IGZhbHNlIGRlc3BpdGUgdGhlIHBhcmVudCB2YWx1ZS5cbiAgICB0aGlzLmJ1dHRvbk1vZGVsID0gbmV3IFB1c2hCdXR0b25Nb2RlbCgge1xuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcblxuICAgICAgICBzY3JlZW5Qcm9wZXJ0eS52YWx1ZSAhPT0gc2NyZWVuICYmIHRoaXMudm9pY2luZ1NwZWFrRnVsbFJlc3BvbnNlKCB7XG4gICAgICAgICAgb2JqZWN0UmVzcG9uc2U6IG51bGwsXG4gICAgICAgICAgaGludFJlc3BvbnNlOiBudWxsXG4gICAgICAgIH0gKTtcbiAgICAgICAgc2NyZWVuUHJvcGVydHkudmFsdWUgPSBzY3JlZW47XG4gICAgICB9LFxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbSxcbiAgICAgIHBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZDogZmFsc2VcbiAgICB9ICk7XG5cbiAgICAvLyBIb29rIHVwIHRoZSBpbnB1dCBsaXN0ZW5lclxuICAgIGNvbnN0IHByZXNzTGlzdGVuZXIgPSB0aGlzLmJ1dHRvbk1vZGVsLmNyZWF0ZVByZXNzTGlzdGVuZXIoIHtcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncHJlc3NMaXN0ZW5lcicgKVxuICAgIH0gKTtcbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIHByZXNzTGlzdGVuZXIgKTtcblxuICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lcigge1xuICAgICAgZm9jdXM6ICgpID0+IHtcbiAgICAgICAgdGhpcy52b2ljaW5nU3BlYWtGdWxsUmVzcG9uc2UoIHtcbiAgICAgICAgICBvYmplY3RSZXNwb25zZTogbnVsbCxcbiAgICAgICAgICBjb250ZXh0UmVzcG9uc2U6IG51bGxcbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIC8vIG1hbmFnZSBpbnRlcmFjdGlvbiBmZWVkYmFja1xuICAgIE11bHRpbGluay5tdWx0aWxpbmsoXG4gICAgICBbIHNlbGVjdGVkUHJvcGVydHksIHRoaXMuYnV0dG9uTW9kZWwubG9va3NQcmVzc2VkUHJvcGVydHksIHRoaXMuYnV0dG9uTW9kZWwubG9va3NPdmVyUHJvcGVydHksIG5hdmlnYXRpb25CYXJGaWxsUHJvcGVydHksIHRoaXMuYnV0dG9uTW9kZWwuZW5hYmxlZFByb3BlcnR5IF0sXG4gICAgICAoIHNlbGVjdGVkLCBsb29rc1ByZXNzZWQsIGxvb2tzT3ZlciwgbmF2aWdhdGlvbkJhckZpbGwsIGVuYWJsZWQgKSA9PiB7XG5cbiAgICAgICAgY29uc3QgdXNlRGFya2VuSGlnaGxpZ2h0cyA9ICFuYXZpZ2F0aW9uQmFyRmlsbC5lcXVhbHMoIENvbG9yLkJMQUNLICk7XG5cbiAgICAgICAgLy8gQ29sb3IgbWF0Y2ggeWVsbG93IHdpdGggdGhlIFBoRVQgTG9nb1xuICAgICAgICBjb25zdCBzZWxlY3RlZFRleHRDb2xvciA9IHVzZURhcmtlbkhpZ2hsaWdodHMgPyAnYmxhY2snIDogUGhldENvbG9yU2NoZW1lLkJVVFRPTl9ZRUxMT1c7XG4gICAgICAgIGNvbnN0IHVuc2VsZWN0ZWRUZXh0Q29sb3IgPSB1c2VEYXJrZW5IaWdobGlnaHRzID8gJ2dyYXknIDogJ3doaXRlJztcblxuICAgICAgICB0ZXh0LmZpbGwgPSBzZWxlY3RlZCA/IHNlbGVjdGVkVGV4dENvbG9yIDogdW5zZWxlY3RlZFRleHRDb2xvcjtcbiAgICAgICAgaWNvbkFuZFRleHQub3BhY2l0eSA9IHNlbGVjdGVkID8gMS4wIDogKCBsb29rc1ByZXNzZWQgPyAwLjY1IDogMC41ICk7XG5cbiAgICAgICAgYnJpZ2h0ZW5IaWdobGlnaHQudmlzaWJsZSA9ICF1c2VEYXJrZW5IaWdobGlnaHRzICYmIGVuYWJsZWQgJiYgKCBsb29rc092ZXIgfHwgbG9va3NQcmVzc2VkICk7XG4gICAgICAgIGRhcmtlbkhpZ2hsaWdodC52aXNpYmxlID0gdXNlRGFya2VuSGlnaGxpZ2h0cyAmJiBlbmFibGVkICYmICggbG9va3NPdmVyIHx8IGxvb2tzUHJlc3NlZCApO1xuXG4gICAgICAgIC8vIFB1dCBhIGZyYW1lIGFyb3VuZCB0aGUgc2NyZWVuIGljb24sIGRlcGVuZGluZyBvbiB0aGUgbmF2aWdhdGlvbiBiYXIgYmFja2dyb3VuZCBjb2xvci5cbiAgICAgICAgaWYgKCBzY3JlZW4uc2hvd1NjcmVlbkljb25GcmFtZUZvck5hdmlnYXRpb25CYXJGaWxsID09PSAnYmxhY2snICYmIG5hdmlnYXRpb25CYXJGaWxsLmVxdWFscyggQ29sb3IuQkxBQ0sgKSApIHtcbiAgICAgICAgICBpY29uRnJhbWUuc3Ryb2tlID0gUGhldENvbG9yU2NoZW1lLlNDUkVFTl9JQ09OX0ZSQU1FO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSBpZiAoIHNjcmVlbi5zaG93U2NyZWVuSWNvbkZyYW1lRm9yTmF2aWdhdGlvbkJhckZpbGwgPT09ICd3aGl0ZScgJiYgbmF2aWdhdGlvbkJhckZpbGwuZXF1YWxzKCBDb2xvci5XSElURSApICkge1xuICAgICAgICAgIGljb25GcmFtZS5zdHJva2UgPSAnYmxhY2snOyAvLyBibGFjayBmcmFtZSBvbiBhIHdoaXRlIG5hdmJhclxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGljb25GcmFtZS5zdHJva2UgPSAndHJhbnNwYXJlbnQnOyAvLyBrZWVwIHRoZSBzYW1lIGJvdW5kcyBmb3Igc2ltcGxpY2l0eVxuICAgICAgICB9XG4gICAgICB9ICk7XG5cbiAgICAvLyBLZWVwIHRoZSBjdXJzb3IgaW4gc3luYyB3aXRoIGlmIHRoZSBidXR0b24gaXMgZW5hYmxlZC4gVGhpcyBkb2Vzbid0IG5lZWQgdG8gYmUgZGlzcG9zZWQuXG4gICAgdGhpcy5idXR0b25Nb2RlbC5lbmFibGVkUHJvcGVydHkubGluayggZW5hYmxlZCA9PiB7XG4gICAgICB0aGlzLmN1cnNvciA9IGVuYWJsZWQgPyBvcHRpb25zLmN1cnNvciA6IG51bGw7XG4gICAgfSApO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBidXR0b24ncyBsYXlvdXRcbiAgICBjb25zdCB1cGRhdGVMYXlvdXQgPSAoKSA9PiB7XG5cbiAgICAgIC8vIGFkanVzdCB0aGUgdmVydGljYWwgc3BhY2UgYmV0d2VlbiBpY29uIGFuZCB0ZXh0LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy8xNDNcbiAgICAgIGljb25BbmRUZXh0LnNwYWNpbmcgPSBVdGlscy5jbGFtcCggMTIgLSB0ZXh0LmhlaWdodCwgMCwgMyApO1xuXG4gICAgICAvLyBhZGp1c3QgdGhlIG92ZXJsYXlcbiAgICAgIG92ZXJsYXkuc2V0UmVjdEJvdW5kcyggaWNvbkFuZFRleHQuYm91bmRzICk7XG5cbiAgICAgIC8vIGFkanVzdCB0aGUgaGlnaGxpZ2h0c1xuICAgICAgYnJpZ2h0ZW5IaWdobGlnaHQuc3BhY2luZyA9IGRhcmtlbkhpZ2hsaWdodC5zcGFjaW5nID0gZ2V0SGlnaGxpZ2h0V2lkdGgoIG92ZXJsYXkgKTtcbiAgICAgIGJyaWdodGVuSGlnaGxpZ2h0LmNlbnRlciA9IGRhcmtlbkhpZ2hsaWdodC5jZW50ZXIgPSBpY29uQW5kVGV4dC5jZW50ZXI7XG4gICAgfTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgYnV0dG9uJ3MgbGF5b3V0IHdoZW4gdGhlIHNjcmVlbiBuYW1lIGNoYW5nZXNcbiAgICBpY29uQW5kVGV4dC5ib3VuZHNQcm9wZXJ0eS5sYXp5TGluayggdXBkYXRlTGF5b3V0ICk7XG4gICAgdGV4dC5ib3VuZHNQcm9wZXJ0eS5saW5rKCB1cGRhdGVMYXlvdXQgKTtcblxuICAgIHRoaXMuY2hpbGRyZW4gPSBbXG4gICAgICBpY29uQW5kVGV4dCxcbiAgICAgIG92ZXJsYXksXG4gICAgICBicmlnaHRlbkhpZ2hsaWdodCxcbiAgICAgIGRhcmtlbkhpZ2hsaWdodFxuICAgIF07XG5cbiAgICBjb25zdCBuZWVkc0ljb25NYXhXaWR0aCA9IG9wdGlvbnMubWF4QnV0dG9uV2lkdGggJiYgKCB0aGlzLndpZHRoID4gb3B0aW9ucy5tYXhCdXR0b25XaWR0aCApO1xuXG4gICAgLy8gQ29uc3RyYWluIHRleHQgYW5kIGljb24gd2lkdGgsIGlmIG5lY2Vzc2FyeVxuICAgIGlmICggbmVlZHNJY29uTWF4V2lkdGggKSB7XG4gICAgICB0ZXh0Lm1heFdpZHRoID0gaWNvbi5tYXhXaWR0aCA9IG9wdGlvbnMubWF4QnV0dG9uV2lkdGghIC0gKCB0aGlzLndpZHRoIC0gaWNvbkFuZFRleHQud2lkdGggKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBEb24ndCBhbGxvdyB0aGUgdGV4dCB0byBncm93IGxhcmdlciB0aGFuIHRoZSBpY29uIGlmIGNoYW5nZWQgbGF0ZXIgb24gdXNpbmcgUGhFVC1pTywgc2VlICM0MzhcbiAgICAgIC8vIFRleHQgaXMgYWxsb3dlZCB0byBnbyBiZXlvbmQgdGhlIGJvdW5kcyBvZiB0aGUgaWNvbiwgaGVuY2Ugd2UgdXNlIGB0aGlzLndpZHRoYCBpbnN0ZWFkIG9mIGBpY29uLndpZHRoYFxuICAgICAgdGV4dC5tYXhXaWR0aCA9IHRoaXMud2lkdGg7XG4gICAgfVxuXG4gICAgbmVlZHNJY29uTWF4V2lkdGggJiYgYXNzZXJ0ICYmIGFzc2VydCggVXRpbHMudG9GaXhlZCggdGhpcy53aWR0aCwgMCApID09PSBVdGlscy50b0ZpeGVkKCBvcHRpb25zLm1heEJ1dHRvbldpZHRoISwgMCApLFxuICAgICAgYHRoaXMud2lkdGggJHt0aGlzLndpZHRofSAhPT0gb3B0aW9ucy5tYXhCdXR0b25XaWR0aCAke29wdGlvbnMubWF4QnV0dG9uV2lkdGh9YCApO1xuXG4gICAgLy8gQSBjdXN0b20gZm9jdXMgaGlnaGxpZ2h0IHNvIHRoYXQgdGhlIGJvdHRvbSBvZiB0aGUgaGlnaGxpZ2h0IGRvZXMgbm90IGdldCBjdXQtb2ZmIGJlbG93IHRoZSBuYXZpZ2F0aW9uIGJhci5cbiAgICAvLyBTZXR0aW5nIHRvIHRoZSBsb2NhbEJvdW5kcyBkaXJlY3RseSBwcmV2ZW50cyB0aGUgZGVmYXVsdCBkaWxhdGlvbiBvZiB0aGUgaGlnaGxpZ2h0LiBTaGFwZSB1cGRhdGVzIHdpdGggY2hhbmdpbmdcbiAgICAvLyBib3VuZHMgdG8gc3VwcG9ydCBkeW5hbWljIGxheW91dC5cbiAgICB0aGlzLmxvY2FsQm91bmRzUHJvcGVydHkubGluayggbG9jYWxCb3VuZHMgPT4ge1xuICAgICAgdGhpcy5mb2N1c0hpZ2hsaWdodCA9IFNoYXBlLmJvdW5kcyggbG9jYWxCb3VuZHMgKTtcbiAgICB9ICk7XG5cbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xuICB9XG59XG5cbmpvaXN0LnJlZ2lzdGVyKCAnTmF2aWdhdGlvbkJhclNjcmVlbkJ1dHRvbicsIE5hdmlnYXRpb25CYXJTY3JlZW5CdXR0b24gKTtcbmV4cG9ydCBkZWZhdWx0IE5hdmlnYXRpb25CYXJTY3JlZW5CdXR0b247Il0sIm5hbWVzIjpbIkRlcml2ZWRQcm9wZXJ0eSIsIk11bHRpbGluayIsIlV0aWxzIiwiU2hhcGUiLCJvcHRpb25pemUiLCJQaGV0Q29sb3JTY2hlbWUiLCJQaGV0Rm9udCIsIkNvbG9yIiwiTm9kZSIsIlJlY3RhbmdsZSIsIlRleHQiLCJWQm94IiwiVm9pY2luZyIsIlB1c2hCdXR0b25Nb2RlbCIsIkhpZ2hsaWdodE5vZGUiLCJqb2lzdCIsIkhJR0hMSUdIVF9TUEFDSU5HIiwiZ2V0SGlnaGxpZ2h0V2lkdGgiLCJvdmVybGF5Iiwid2lkdGgiLCJOYXZpZ2F0aW9uQmFyU2NyZWVuQnV0dG9uIiwibmF2aWdhdGlvbkJhckZpbGxQcm9wZXJ0eSIsInNjcmVlblByb3BlcnR5Iiwic2NyZWVuIiwic2ltU2NyZWVuSW5kZXgiLCJuYXZCYXJIZWlnaHQiLCJwcm92aWRlZE9wdGlvbnMiLCJhc3NlcnQiLCJuYW1lUHJvcGVydHkiLCJ2YWx1ZSIsIm5hdmlnYXRpb25CYXJJY29uIiwib3B0aW9ucyIsImN1cnNvciIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJ0YW5kZW0iLCJuYW1lIiwibWF4QnV0dG9uV2lkdGgiLCJ0YWdOYW1lIiwiY29udGFpbmVyVGFnTmFtZSIsImRlc2NyaXB0aW9uQ29udGVudCIsInNjcmVlbkJ1dHRvbnNIZWxwVGV4dCIsImFwcGVuZERlc2NyaXB0aW9uIiwidm9pY2luZ0hpbnRSZXNwb25zZSIsImlubmVyQ29udGVudCIsInBkb21EaXNwbGF5TmFtZVByb3BlcnR5IiwibGluayIsInZvaWNpbmdOYW1lUmVzcG9uc2UiLCJpY29uIiwiY2hpbGRyZW4iLCJtYXhIZWlnaHQiLCJwZG9tVmlzaWJsZSIsImljb25GcmFtZSIsImhlaWdodCIsImljb25BbmRGcmFtZSIsInRleHQiLCJmb250IiwiaWNvbkFuZFRleHQiLCJwaWNrYWJsZSIsInVzZXNPcGFjaXR5IiwicmVjdEJvdW5kcyIsImJvdW5kcyIsImhpZ2hsaWdodFdpZHRoIiwiYnJpZ2h0ZW5IaWdobGlnaHQiLCJjZW50ZXIiLCJmaWxsIiwiZGFya2VuSGlnaGxpZ2h0Iiwic2VsZWN0ZWRQcm9wZXJ0eSIsImN1cnJlbnRTY3JlZW4iLCJidXR0b25Nb2RlbCIsImxpc3RlbmVyIiwidm9pY2luZ1NwZWFrRnVsbFJlc3BvbnNlIiwib2JqZWN0UmVzcG9uc2UiLCJoaW50UmVzcG9uc2UiLCJwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJwcmVzc0xpc3RlbmVyIiwiY3JlYXRlUHJlc3NMaXN0ZW5lciIsImNyZWF0ZVRhbmRlbSIsImFkZElucHV0TGlzdGVuZXIiLCJmb2N1cyIsImNvbnRleHRSZXNwb25zZSIsIm11bHRpbGluayIsImxvb2tzUHJlc3NlZFByb3BlcnR5IiwibG9va3NPdmVyUHJvcGVydHkiLCJlbmFibGVkUHJvcGVydHkiLCJzZWxlY3RlZCIsImxvb2tzUHJlc3NlZCIsImxvb2tzT3ZlciIsIm5hdmlnYXRpb25CYXJGaWxsIiwiZW5hYmxlZCIsInVzZURhcmtlbkhpZ2hsaWdodHMiLCJlcXVhbHMiLCJCTEFDSyIsInNlbGVjdGVkVGV4dENvbG9yIiwiQlVUVE9OX1lFTExPVyIsInVuc2VsZWN0ZWRUZXh0Q29sb3IiLCJvcGFjaXR5IiwidmlzaWJsZSIsInNob3dTY3JlZW5JY29uRnJhbWVGb3JOYXZpZ2F0aW9uQmFyRmlsbCIsInN0cm9rZSIsIlNDUkVFTl9JQ09OX0ZSQU1FIiwiV0hJVEUiLCJ1cGRhdGVMYXlvdXQiLCJzcGFjaW5nIiwiY2xhbXAiLCJzZXRSZWN0Qm91bmRzIiwiYm91bmRzUHJvcGVydHkiLCJsYXp5TGluayIsIm5lZWRzSWNvbk1heFdpZHRoIiwibWF4V2lkdGgiLCJ0b0ZpeGVkIiwibG9jYWxCb3VuZHNQcm9wZXJ0eSIsImxvY2FsQm91bmRzIiwiZm9jdXNIaWdobGlnaHQiLCJtdXRhdGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Q0FNQyxHQUVELE9BQU9BLHFCQUFxQixtQ0FBbUM7QUFDL0QsT0FBT0MsZUFBZSw2QkFBNkI7QUFHbkQsT0FBT0MsV0FBVyx3QkFBd0I7QUFDMUMsU0FBU0MsS0FBSyxRQUFRLDJCQUEyQjtBQUNqRCxPQUFPQyxlQUFlLGtDQUFrQztBQUV4RCxPQUFPQyxxQkFBcUIsMkNBQTJDO0FBQ3ZFLE9BQU9DLGNBQWMsb0NBQW9DO0FBQ3pELFNBQVNDLEtBQUssRUFBRUMsSUFBSSxFQUFlQyxTQUFTLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxPQUFPLFFBQXdCLDhCQUE4QjtBQUN2SCxPQUFPQyxxQkFBcUIsMENBQTBDO0FBQ3RFLE9BQU9DLG1CQUFtQixxQkFBcUI7QUFDL0MsT0FBT0MsV0FBVyxhQUFhO0FBRy9CLFlBQVk7QUFDWixNQUFNQyxvQkFBb0I7QUFDMUIsTUFBTUMsb0JBQW9CLENBQUVDLFVBQW1CQSxRQUFRQyxLQUFLLEdBQUssSUFB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