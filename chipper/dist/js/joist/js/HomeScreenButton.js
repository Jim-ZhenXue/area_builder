// Copyright 2020-2024, University of Colorado Boulder
/**
 * A HomeScreenButton is displayed on the HomeScreen for choosing a screen. The button can be in a selected or
 * unselected state - it's large with a yellow frame in its selected state, and small in its unselected state.
 * Selecting the button when in its "selected" state will result in that screen being chosen.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */ import BooleanProperty from '../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Utils from '../../dot/js/Utils.js';
import { Shape } from '../../kite/js/imports.js';
import merge from '../../phet-core/js/merge.js';
import optionize from '../../phet-core/js/optionize.js';
import PhetColorScheme from '../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { FireListener, Node, PDOMPeer, Rectangle, Text, VBox, Voicing } from '../../scenery/js/imports.js';
import EventType from '../../tandem/js/EventType.js';
import Utterance from '../../utterance-queue/js/Utterance.js';
import Frame from './Frame.js';
import joist from './joist.js';
// constants
const LARGE_ICON_HEIGHT = 140;
let HomeScreenButton = class HomeScreenButton extends Voicing(VBox) {
    constructor(screen, homeScreenModel, providedOptions){
        const options = optionize()({
            cursor: 'pointer',
            showUnselectedHomeScreenIconFrame: false,
            // pdom
            tagName: 'button',
            appendDescription: true,
            containerTagName: 'li',
            // phet-io
            phetioEventType: EventType.USER,
            phetioDocumentation: 'A button on the home screen for choosing a simulation screen'
        }, providedOptions);
        // derives a boolean value from homeScreenModel.selectedScreenProperty that says if this button is selected on the
        // home screen.
        const isSelectedProperty = new DerivedProperty([
            homeScreenModel.selectedScreenProperty
        ], (selectedScreen)=>{
            return selectedScreen === screen;
        });
        // true if this button has focus or mouseover
        const isHighlightedProperty = new BooleanProperty(false);
        // maps the number of screens to a scale for the small icons. The scale is percentage of LARGE_ICON_HEIGHT.
        let smallIconScale = Utils.linear(2, 4, 0.875, 0.50, homeScreenModel.simScreens.length);
        if (homeScreenModel.simScreens.length >= 5) {
            smallIconScale = 0.4;
        }
        const smallIconHeight = smallIconScale * LARGE_ICON_HEIGHT;
        assert && assert(screen.homeScreenIcon, `homeScreenIcon is required for screen ${screen.nameProperty.value}`);
        const homeScreenIcon = screen.homeScreenIcon;
        // create an icon for each size
        const smallIcon = new Node({
            children: [
                homeScreenIcon
            ],
            scale: smallIconHeight / homeScreenIcon.height
        });
        const largeIcon = new Node({
            children: [
                homeScreenIcon
            ],
            scale: LARGE_ICON_HEIGHT / homeScreenIcon.height
        });
        // create a frame for each size
        const smallFrame = new Rectangle(0, 0, smallIcon.width, smallIcon.height, {
            stroke: options.showUnselectedHomeScreenIconFrame ? PhetColorScheme.SCREEN_ICON_FRAME : null,
            lineWidth: 0.7
        });
        const largeFrame = new Frame(largeIcon);
        // create one node for the each of large and small frame + icon pairs
        const smallNode = new Node({
            children: [
                smallFrame,
                smallIcon
            ]
        });
        const largeNode = new Node({
            children: [
                largeFrame,
                largeIcon
            ]
        });
        // container for the icon and frame, children updated when isSelectedProperty changes
        const nodeContainer = new Node({
            // pdom - the icon may have focusable components in its graphic but they should be invisible for Interactive
            // Description, the button is all we need for accessibility
            pdomVisible: false
        });
        // text for the button
        const text = new Text(screen.nameProperty);
        super(merge({
            children: [
                nodeContainer,
                text
            ]
        }, options));
        this.screen = screen;
        this.addAriaDescribedbyAssociation({
            otherNode: this,
            otherElementName: PDOMPeer.DESCRIPTION_SIBLING,
            thisElementName: PDOMPeer.PRIMARY_SIBLING
        });
        // create large and small settings
        const settings = {
            small: {
                node: [
                    smallNode
                ],
                font: new PhetFont(18),
                spacing: 3
            },
            large: {
                node: [
                    largeNode
                ],
                font: new PhetFont(42),
                spacing: 0
            }
        };
        // sets the opacity of the icon and fill of the text
        const setOpacityAndFill = ()=>{
            const opacity = isSelectedProperty.value || isHighlightedProperty.value ? 1 : 0.5;
            largeIcon.opacity = opacity;
            smallIcon.opacity = opacity;
            text.fill = isSelectedProperty.value || isHighlightedProperty.value ? 'white' : 'gray';
        };
        // update pieces that change when the button is selected or unselected
        isSelectedProperty.link((isSelected)=>{
            const data = isSelected ? settings.large : settings.small;
            // apply settings for the current size
            nodeContainer.children = data.node;
            text.font = data.font;
            text.maxWidth = nodeContainer.width;
            setOpacityAndFill();
            this.setSpacing(data.spacing);
        });
        // update the appearance when the button is highlighted
        isHighlightedProperty.link((isHighlighted)=>{
            largeFrame.setHighlighted(isHighlighted);
            setOpacityAndFill();
        });
        // Create a new Utterance that isn't registered through Voicing so that it isn't silenced when the
        // home screen is hidden upon selection. (invisible nodes have their voicing silenced).
        const buttonSelectionUtterance = new Utterance();
        let buttonWasAlreadySelected = false;
        // If the button is already selected, then set the sim's screen to be its corresponding screen. Otherwise, make the
        // button selected. The one exception to the former sentence is due to the desired behavior of selecting on
        // touchover, in which case we need to guard on touchdown since we don't want to double fire for touchover and
        // touchdown, see https://github.com/phetsims/joist/issues/624
        const buttonFired = ()=>{
            const pointerIsTouchLike = fireListener.pointer && fireListener.pointer.isTouchLike();
            if (isSelectedProperty.value && (!pointerIsTouchLike || buttonWasAlreadySelected)) {
                // Select the screen that corresponds to this button.  This will make that screen appear to the user and the
                // home screen disappear.
                homeScreenModel.screenProperty.value = screen;
                this.voicingSpeakFullResponse({
                    objectResponse: null,
                    hintResponse: null,
                    utterance: buttonSelectionUtterance
                });
            } else {
                // Select the screen button.  This causes the button to enlarge, but doesn't go to the screen.
                homeScreenModel.selectedScreenProperty.value = screen;
                this.voicingSpeakFullResponse({
                    objectResponse: null,
                    contextResponse: null
                });
            }
        };
        const fireListener = new FireListener({
            fire: buttonFired,
            tandem: options.tandem.createTandem('fireListener')
        });
        this.addInputListener(fireListener);
        this.addInputListener({
            focus: (event)=>{
                !isSelectedProperty.value && fireListener.fire(event);
            }
        });
        // When a screen reader is in use, the button may be selected with the virtual cursor
        // without focus landing on the button - toggle focus (and therefore selection) in this case.
        this.addInputListener({
            click: ()=>!isSelectedProperty.value && this.focus()
        });
        this.addInputListener({
            focus: ()=>isHighlightedProperty.set(true),
            blur: ()=>isHighlightedProperty.set(false),
            over: ()=>isHighlightedProperty.set(true),
            out: ()=>isHighlightedProperty.set(false)
        });
        // If you touch an unselected button, it becomes selected. If then without lifting your finger you swipe over to the
        // next button, that one becomes selected instead.
        const onTouchLikeOver = ()=>{
            buttonWasAlreadySelected = homeScreenModel.selectedScreenProperty.value === screen;
            homeScreenModel.selectedScreenProperty.value = screen;
        };
        this.addInputListener({
            touchover: onTouchLikeOver,
            penover: onTouchLikeOver
        });
        // set the mouseArea and touchArea to be the whole local bounds of this node, because if it just relies on the
        // bounds of the icon and text, then there is a gap in between them. Since the button can change size, this
        // assignment needs to happen anytime the bounds change.
        this.boundsProperty.link(()=>{
            this.mouseArea = this.touchArea = Shape.bounds(this.localBounds);
        });
    }
};
joist.register('HomeScreenButton', HomeScreenButton);
export default HomeScreenButton;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL0hvbWVTY3JlZW5CdXR0b24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBIb21lU2NyZWVuQnV0dG9uIGlzIGRpc3BsYXllZCBvbiB0aGUgSG9tZVNjcmVlbiBmb3IgY2hvb3NpbmcgYSBzY3JlZW4uIFRoZSBidXR0b24gY2FuIGJlIGluIGEgc2VsZWN0ZWQgb3JcbiAqIHVuc2VsZWN0ZWQgc3RhdGUgLSBpdCdzIGxhcmdlIHdpdGggYSB5ZWxsb3cgZnJhbWUgaW4gaXRzIHNlbGVjdGVkIHN0YXRlLCBhbmQgc21hbGwgaW4gaXRzIHVuc2VsZWN0ZWQgc3RhdGUuXG4gKiBTZWxlY3RpbmcgdGhlIGJ1dHRvbiB3aGVuIGluIGl0cyBcInNlbGVjdGVkXCIgc3RhdGUgd2lsbCByZXN1bHQgaW4gdGhhdCBzY3JlZW4gYmVpbmcgY2hvc2VuLlxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Q29sb3JTY2hlbWUuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgeyBGaXJlTGlzdGVuZXIsIE5vZGUsIFBET01QZWVyLCBSZWN0YW5nbGUsIFRleHQsIFZCb3gsIFZCb3hPcHRpb25zLCBWb2ljaW5nLCBWb2ljaW5nT3B0aW9ucyB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgRXZlbnRUeXBlIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9FdmVudFR5cGUuanMnO1xuaW1wb3J0IFV0dGVyYW5jZSBmcm9tICcuLi8uLi91dHRlcmFuY2UtcXVldWUvanMvVXR0ZXJhbmNlLmpzJztcbmltcG9ydCBGcmFtZSBmcm9tICcuL0ZyYW1lLmpzJztcbmltcG9ydCBIb21lU2NyZWVuTW9kZWwgZnJvbSAnLi9Ib21lU2NyZWVuTW9kZWwuanMnO1xuaW1wb3J0IGpvaXN0IGZyb20gJy4vam9pc3QuanMnO1xuaW1wb3J0IFNjcmVlbiBmcm9tICcuL1NjcmVlbi5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgTEFSR0VfSUNPTl9IRUlHSFQgPSAxNDA7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIHNob3dVbnNlbGVjdGVkSG9tZVNjcmVlbkljb25GcmFtZT86IGJvb2xlYW47XG59O1xudHlwZSBQYXJlbnRPcHRpb25zID0gVm9pY2luZ09wdGlvbnMgJiBWQm94T3B0aW9ucztcbmV4cG9ydCB0eXBlIEhvbWVTY3JlZW5CdXR0b25PcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQYXJlbnRPcHRpb25zICYgUGlja1JlcXVpcmVkPFBhcmVudE9wdGlvbnMsICd0YW5kZW0nPjtcblxuY2xhc3MgSG9tZVNjcmVlbkJ1dHRvbiBleHRlbmRzIFZvaWNpbmcoIFZCb3ggKSB7XG4gIHB1YmxpYyByZWFkb25seSBzY3JlZW46IFNjcmVlbjxJbnRlbnRpb25hbEFueSwgSW50ZW50aW9uYWxBbnk+O1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2NyZWVuOiBTY3JlZW48SW50ZW50aW9uYWxBbnksIEludGVudGlvbmFsQW55PiwgaG9tZVNjcmVlbk1vZGVsOiBIb21lU2NyZWVuTW9kZWwsIHByb3ZpZGVkT3B0aW9ucz86IEhvbWVTY3JlZW5CdXR0b25PcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxIb21lU2NyZWVuQnV0dG9uT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBhcmVudE9wdGlvbnM+KCkoIHtcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgc2hvd1Vuc2VsZWN0ZWRIb21lU2NyZWVuSWNvbkZyYW1lOiBmYWxzZSwgLy8gcHV0IGEgZnJhbWUgYXJvdW5kIHVuc2VsZWN0ZWQgaG9tZSBzY3JlZW4gaWNvbnNcblxuICAgICAgLy8gcGRvbVxuICAgICAgdGFnTmFtZTogJ2J1dHRvbicsXG4gICAgICBhcHBlbmREZXNjcmlwdGlvbjogdHJ1ZSxcbiAgICAgIGNvbnRhaW5lclRhZ05hbWU6ICdsaScsXG5cbiAgICAgIC8vIHBoZXQtaW9cbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVIsXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnQSBidXR0b24gb24gdGhlIGhvbWUgc2NyZWVuIGZvciBjaG9vc2luZyBhIHNpbXVsYXRpb24gc2NyZWVuJ1xuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gZGVyaXZlcyBhIGJvb2xlYW4gdmFsdWUgZnJvbSBob21lU2NyZWVuTW9kZWwuc2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eSB0aGF0IHNheXMgaWYgdGhpcyBidXR0b24gaXMgc2VsZWN0ZWQgb24gdGhlXG4gICAgLy8gaG9tZSBzY3JlZW4uXG4gICAgY29uc3QgaXNTZWxlY3RlZFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBob21lU2NyZWVuTW9kZWwuc2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eSBdLCBzZWxlY3RlZFNjcmVlbiA9PiB7XG4gICAgICByZXR1cm4gc2VsZWN0ZWRTY3JlZW4gPT09IHNjcmVlbjtcbiAgICB9ICk7XG5cbiAgICAvLyB0cnVlIGlmIHRoaXMgYnV0dG9uIGhhcyBmb2N1cyBvciBtb3VzZW92ZXJcbiAgICBjb25zdCBpc0hpZ2hsaWdodGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xuXG4gICAgLy8gbWFwcyB0aGUgbnVtYmVyIG9mIHNjcmVlbnMgdG8gYSBzY2FsZSBmb3IgdGhlIHNtYWxsIGljb25zLiBUaGUgc2NhbGUgaXMgcGVyY2VudGFnZSBvZiBMQVJHRV9JQ09OX0hFSUdIVC5cbiAgICBsZXQgc21hbGxJY29uU2NhbGUgPSBVdGlscy5saW5lYXIoIDIsIDQsIDAuODc1LCAwLjUwLCBob21lU2NyZWVuTW9kZWwuc2ltU2NyZWVucy5sZW5ndGggKTtcbiAgICBpZiAoIGhvbWVTY3JlZW5Nb2RlbC5zaW1TY3JlZW5zLmxlbmd0aCA+PSA1ICkge1xuICAgICAgc21hbGxJY29uU2NhbGUgPSAwLjQ7XG4gICAgfVxuICAgIGNvbnN0IHNtYWxsSWNvbkhlaWdodCA9IHNtYWxsSWNvblNjYWxlICogTEFSR0VfSUNPTl9IRUlHSFQ7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzY3JlZW4uaG9tZVNjcmVlbkljb24sIGBob21lU2NyZWVuSWNvbiBpcyByZXF1aXJlZCBmb3Igc2NyZWVuICR7c2NyZWVuLm5hbWVQcm9wZXJ0eS52YWx1ZX1gICk7XG4gICAgY29uc3QgaG9tZVNjcmVlbkljb24gPSBzY3JlZW4uaG9tZVNjcmVlbkljb24hO1xuXG4gICAgLy8gY3JlYXRlIGFuIGljb24gZm9yIGVhY2ggc2l6ZVxuICAgIGNvbnN0IHNtYWxsSWNvbiA9IG5ldyBOb2RlKCB7XG4gICAgICBjaGlsZHJlbjogWyBob21lU2NyZWVuSWNvbiBdLFxuICAgICAgc2NhbGU6IHNtYWxsSWNvbkhlaWdodCAvIGhvbWVTY3JlZW5JY29uLmhlaWdodFxuICAgIH0gKTtcbiAgICBjb25zdCBsYXJnZUljb24gPSBuZXcgTm9kZSgge1xuICAgICAgY2hpbGRyZW46IFsgaG9tZVNjcmVlbkljb24gXSxcbiAgICAgIHNjYWxlOiBMQVJHRV9JQ09OX0hFSUdIVCAvIGhvbWVTY3JlZW5JY29uLmhlaWdodFxuICAgIH0gKTtcblxuICAgIC8vIGNyZWF0ZSBhIGZyYW1lIGZvciBlYWNoIHNpemVcbiAgICBjb25zdCBzbWFsbEZyYW1lID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgc21hbGxJY29uLndpZHRoLCBzbWFsbEljb24uaGVpZ2h0LCB7XG4gICAgICBzdHJva2U6IG9wdGlvbnMuc2hvd1Vuc2VsZWN0ZWRIb21lU2NyZWVuSWNvbkZyYW1lID8gUGhldENvbG9yU2NoZW1lLlNDUkVFTl9JQ09OX0ZSQU1FIDogbnVsbCxcbiAgICAgIGxpbmVXaWR0aDogMC43XG4gICAgfSApO1xuICAgIGNvbnN0IGxhcmdlRnJhbWUgPSBuZXcgRnJhbWUoIGxhcmdlSWNvbiApO1xuXG4gICAgLy8gY3JlYXRlIG9uZSBub2RlIGZvciB0aGUgZWFjaCBvZiBsYXJnZSBhbmQgc21hbGwgZnJhbWUgKyBpY29uIHBhaXJzXG4gICAgY29uc3Qgc21hbGxOb2RlID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgc21hbGxGcmFtZSwgc21hbGxJY29uIF0gfSApO1xuICAgIGNvbnN0IGxhcmdlTm9kZSA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGxhcmdlRnJhbWUsIGxhcmdlSWNvbiBdIH0gKTtcblxuICAgIC8vIGNvbnRhaW5lciBmb3IgdGhlIGljb24gYW5kIGZyYW1lLCBjaGlsZHJlbiB1cGRhdGVkIHdoZW4gaXNTZWxlY3RlZFByb3BlcnR5IGNoYW5nZXNcbiAgICBjb25zdCBub2RlQ29udGFpbmVyID0gbmV3IE5vZGUoIHtcblxuICAgICAgLy8gcGRvbSAtIHRoZSBpY29uIG1heSBoYXZlIGZvY3VzYWJsZSBjb21wb25lbnRzIGluIGl0cyBncmFwaGljIGJ1dCB0aGV5IHNob3VsZCBiZSBpbnZpc2libGUgZm9yIEludGVyYWN0aXZlXG4gICAgICAvLyBEZXNjcmlwdGlvbiwgdGhlIGJ1dHRvbiBpcyBhbGwgd2UgbmVlZCBmb3IgYWNjZXNzaWJpbGl0eVxuICAgICAgcGRvbVZpc2libGU6IGZhbHNlXG4gICAgfSApO1xuXG4gICAgLy8gdGV4dCBmb3IgdGhlIGJ1dHRvblxuICAgIGNvbnN0IHRleHQgPSBuZXcgVGV4dCggc2NyZWVuLm5hbWVQcm9wZXJ0eSApO1xuXG4gICAgc3VwZXIoIG1lcmdlKCB7IGNoaWxkcmVuOiBbIG5vZGVDb250YWluZXIsIHRleHQgXSB9LCBvcHRpb25zICkgKTtcblxuICAgIHRoaXMuc2NyZWVuID0gc2NyZWVuO1xuXG4gICAgdGhpcy5hZGRBcmlhRGVzY3JpYmVkYnlBc3NvY2lhdGlvbigge1xuICAgICAgb3RoZXJOb2RlOiB0aGlzLFxuICAgICAgb3RoZXJFbGVtZW50TmFtZTogUERPTVBlZXIuREVTQ1JJUFRJT05fU0lCTElORyxcbiAgICAgIHRoaXNFbGVtZW50TmFtZTogUERPTVBlZXIuUFJJTUFSWV9TSUJMSU5HXG4gICAgfSApO1xuXG4gICAgLy8gY3JlYXRlIGxhcmdlIGFuZCBzbWFsbCBzZXR0aW5nc1xuICAgIGNvbnN0IHNldHRpbmdzID0ge1xuICAgICAgc21hbGw6IHtcbiAgICAgICAgbm9kZTogWyBzbWFsbE5vZGUgXSxcbiAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxOCApLFxuICAgICAgICBzcGFjaW5nOiAzXG4gICAgICB9LFxuICAgICAgbGFyZ2U6IHtcbiAgICAgICAgbm9kZTogWyBsYXJnZU5vZGUgXSxcbiAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCA0MiApLFxuICAgICAgICBzcGFjaW5nOiAwXG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIHNldHMgdGhlIG9wYWNpdHkgb2YgdGhlIGljb24gYW5kIGZpbGwgb2YgdGhlIHRleHRcbiAgICBjb25zdCBzZXRPcGFjaXR5QW5kRmlsbCA9ICgpID0+IHtcbiAgICAgIGNvbnN0IG9wYWNpdHkgPSAoIGlzU2VsZWN0ZWRQcm9wZXJ0eS52YWx1ZSB8fCBpc0hpZ2hsaWdodGVkUHJvcGVydHkudmFsdWUgKSA/IDEgOiAwLjU7XG4gICAgICBsYXJnZUljb24ub3BhY2l0eSA9IG9wYWNpdHk7XG4gICAgICBzbWFsbEljb24ub3BhY2l0eSA9IG9wYWNpdHk7XG4gICAgICB0ZXh0LmZpbGwgPSAoIGlzU2VsZWN0ZWRQcm9wZXJ0eS52YWx1ZSB8fCBpc0hpZ2hsaWdodGVkUHJvcGVydHkudmFsdWUgKSA/ICd3aGl0ZScgOiAnZ3JheSc7XG4gICAgfTtcblxuICAgIC8vIHVwZGF0ZSBwaWVjZXMgdGhhdCBjaGFuZ2Ugd2hlbiB0aGUgYnV0dG9uIGlzIHNlbGVjdGVkIG9yIHVuc2VsZWN0ZWRcbiAgICBpc1NlbGVjdGVkUHJvcGVydHkubGluayggaXNTZWxlY3RlZCA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gaXNTZWxlY3RlZCA/IHNldHRpbmdzLmxhcmdlIDogc2V0dGluZ3Muc21hbGw7XG5cbiAgICAgIC8vIGFwcGx5IHNldHRpbmdzIGZvciB0aGUgY3VycmVudCBzaXplXG4gICAgICBub2RlQ29udGFpbmVyLmNoaWxkcmVuID0gZGF0YS5ub2RlO1xuICAgICAgdGV4dC5mb250ID0gZGF0YS5mb250O1xuICAgICAgdGV4dC5tYXhXaWR0aCA9IG5vZGVDb250YWluZXIud2lkdGg7XG4gICAgICBzZXRPcGFjaXR5QW5kRmlsbCgpO1xuICAgICAgdGhpcy5zZXRTcGFjaW5nKCBkYXRhLnNwYWNpbmcgKTtcbiAgICB9ICk7XG5cbiAgICAvLyB1cGRhdGUgdGhlIGFwcGVhcmFuY2Ugd2hlbiB0aGUgYnV0dG9uIGlzIGhpZ2hsaWdodGVkXG4gICAgaXNIaWdobGlnaHRlZFByb3BlcnR5LmxpbmsoIGlzSGlnaGxpZ2h0ZWQgPT4ge1xuICAgICAgbGFyZ2VGcmFtZS5zZXRIaWdobGlnaHRlZCggaXNIaWdobGlnaHRlZCApO1xuICAgICAgc2V0T3BhY2l0eUFuZEZpbGwoKTtcbiAgICB9ICk7XG5cbiAgICAvLyBDcmVhdGUgYSBuZXcgVXR0ZXJhbmNlIHRoYXQgaXNuJ3QgcmVnaXN0ZXJlZCB0aHJvdWdoIFZvaWNpbmcgc28gdGhhdCBpdCBpc24ndCBzaWxlbmNlZCB3aGVuIHRoZVxuICAgIC8vIGhvbWUgc2NyZWVuIGlzIGhpZGRlbiB1cG9uIHNlbGVjdGlvbi4gKGludmlzaWJsZSBub2RlcyBoYXZlIHRoZWlyIHZvaWNpbmcgc2lsZW5jZWQpLlxuICAgIGNvbnN0IGJ1dHRvblNlbGVjdGlvblV0dGVyYW5jZSA9IG5ldyBVdHRlcmFuY2UoKTtcblxuICAgIGxldCBidXR0b25XYXNBbHJlYWR5U2VsZWN0ZWQgPSBmYWxzZTtcblxuICAgIC8vIElmIHRoZSBidXR0b24gaXMgYWxyZWFkeSBzZWxlY3RlZCwgdGhlbiBzZXQgdGhlIHNpbSdzIHNjcmVlbiB0byBiZSBpdHMgY29ycmVzcG9uZGluZyBzY3JlZW4uIE90aGVyd2lzZSwgbWFrZSB0aGVcbiAgICAvLyBidXR0b24gc2VsZWN0ZWQuIFRoZSBvbmUgZXhjZXB0aW9uIHRvIHRoZSBmb3JtZXIgc2VudGVuY2UgaXMgZHVlIHRvIHRoZSBkZXNpcmVkIGJlaGF2aW9yIG9mIHNlbGVjdGluZyBvblxuICAgIC8vIHRvdWNob3ZlciwgaW4gd2hpY2ggY2FzZSB3ZSBuZWVkIHRvIGd1YXJkIG9uIHRvdWNoZG93biBzaW5jZSB3ZSBkb24ndCB3YW50IHRvIGRvdWJsZSBmaXJlIGZvciB0b3VjaG92ZXIgYW5kXG4gICAgLy8gdG91Y2hkb3duLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy82MjRcbiAgICBjb25zdCBidXR0b25GaXJlZCA9ICgpID0+IHtcblxuICAgICAgY29uc3QgcG9pbnRlcklzVG91Y2hMaWtlID0gZmlyZUxpc3RlbmVyLnBvaW50ZXIgJiYgZmlyZUxpc3RlbmVyLnBvaW50ZXIuaXNUb3VjaExpa2UoKTtcblxuICAgICAgaWYgKCBpc1NlbGVjdGVkUHJvcGVydHkudmFsdWUgJiYgKCAhcG9pbnRlcklzVG91Y2hMaWtlIHx8IGJ1dHRvbldhc0FscmVhZHlTZWxlY3RlZCApICkge1xuXG4gICAgICAgIC8vIFNlbGVjdCB0aGUgc2NyZWVuIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhpcyBidXR0b24uICBUaGlzIHdpbGwgbWFrZSB0aGF0IHNjcmVlbiBhcHBlYXIgdG8gdGhlIHVzZXIgYW5kIHRoZVxuICAgICAgICAvLyBob21lIHNjcmVlbiBkaXNhcHBlYXIuXG4gICAgICAgIGhvbWVTY3JlZW5Nb2RlbC5zY3JlZW5Qcm9wZXJ0eS52YWx1ZSA9IHNjcmVlbjtcblxuICAgICAgICB0aGlzLnZvaWNpbmdTcGVha0Z1bGxSZXNwb25zZSgge1xuICAgICAgICAgIG9iamVjdFJlc3BvbnNlOiBudWxsLFxuICAgICAgICAgIGhpbnRSZXNwb25zZTogbnVsbCxcbiAgICAgICAgICB1dHRlcmFuY2U6IGJ1dHRvblNlbGVjdGlvblV0dGVyYW5jZVxuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcblxuICAgICAgICAvLyBTZWxlY3QgdGhlIHNjcmVlbiBidXR0b24uICBUaGlzIGNhdXNlcyB0aGUgYnV0dG9uIHRvIGVubGFyZ2UsIGJ1dCBkb2Vzbid0IGdvIHRvIHRoZSBzY3JlZW4uXG4gICAgICAgIGhvbWVTY3JlZW5Nb2RlbC5zZWxlY3RlZFNjcmVlblByb3BlcnR5LnZhbHVlID0gc2NyZWVuO1xuXG4gICAgICAgIHRoaXMudm9pY2luZ1NwZWFrRnVsbFJlc3BvbnNlKCB7XG4gICAgICAgICAgb2JqZWN0UmVzcG9uc2U6IG51bGwsXG4gICAgICAgICAgY29udGV4dFJlc3BvbnNlOiBudWxsXG4gICAgICAgIH0gKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3QgZmlyZUxpc3RlbmVyID0gbmV3IEZpcmVMaXN0ZW5lcigge1xuICAgICAgZmlyZTogYnV0dG9uRmlyZWQsXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZpcmVMaXN0ZW5lcicgKVxuICAgIH0gKTtcbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIGZpcmVMaXN0ZW5lciApO1xuICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggeyBmb2N1czogZXZlbnQgPT4geyAhaXNTZWxlY3RlZFByb3BlcnR5LnZhbHVlICYmIGZpcmVMaXN0ZW5lci5maXJlKCBldmVudCApOyB9IH0gKTtcblxuICAgIC8vIFdoZW4gYSBzY3JlZW4gcmVhZGVyIGlzIGluIHVzZSwgdGhlIGJ1dHRvbiBtYXkgYmUgc2VsZWN0ZWQgd2l0aCB0aGUgdmlydHVhbCBjdXJzb3JcbiAgICAvLyB3aXRob3V0IGZvY3VzIGxhbmRpbmcgb24gdGhlIGJ1dHRvbiAtIHRvZ2dsZSBmb2N1cyAoYW5kIHRoZXJlZm9yZSBzZWxlY3Rpb24pIGluIHRoaXMgY2FzZS5cbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIHtcbiAgICAgIGNsaWNrOiAoKSA9PiAhaXNTZWxlY3RlZFByb3BlcnR5LnZhbHVlICYmIHRoaXMuZm9jdXMoKVxuICAgIH0gKTtcblxuICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lcigge1xuICAgICAgZm9jdXM6ICgpID0+IGlzSGlnaGxpZ2h0ZWRQcm9wZXJ0eS5zZXQoIHRydWUgKSxcbiAgICAgIGJsdXI6ICgpID0+IGlzSGlnaGxpZ2h0ZWRQcm9wZXJ0eS5zZXQoIGZhbHNlICksXG4gICAgICBvdmVyOiAoKSA9PiBpc0hpZ2hsaWdodGVkUHJvcGVydHkuc2V0KCB0cnVlICksXG4gICAgICBvdXQ6ICgpID0+IGlzSGlnaGxpZ2h0ZWRQcm9wZXJ0eS5zZXQoIGZhbHNlIClcbiAgICB9ICk7XG5cbiAgICAvLyBJZiB5b3UgdG91Y2ggYW4gdW5zZWxlY3RlZCBidXR0b24sIGl0IGJlY29tZXMgc2VsZWN0ZWQuIElmIHRoZW4gd2l0aG91dCBsaWZ0aW5nIHlvdXIgZmluZ2VyIHlvdSBzd2lwZSBvdmVyIHRvIHRoZVxuICAgIC8vIG5leHQgYnV0dG9uLCB0aGF0IG9uZSBiZWNvbWVzIHNlbGVjdGVkIGluc3RlYWQuXG4gICAgY29uc3Qgb25Ub3VjaExpa2VPdmVyID0gKCkgPT4ge1xuICAgICAgYnV0dG9uV2FzQWxyZWFkeVNlbGVjdGVkID0gaG9tZVNjcmVlbk1vZGVsLnNlbGVjdGVkU2NyZWVuUHJvcGVydHkudmFsdWUgPT09IHNjcmVlbjtcbiAgICAgIGhvbWVTY3JlZW5Nb2RlbC5zZWxlY3RlZFNjcmVlblByb3BlcnR5LnZhbHVlID0gc2NyZWVuO1xuICAgIH07XG4gICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCB7XG4gICAgICB0b3VjaG92ZXI6IG9uVG91Y2hMaWtlT3ZlcixcbiAgICAgIHBlbm92ZXI6IG9uVG91Y2hMaWtlT3ZlclxuICAgIH0gKTtcblxuICAgIC8vIHNldCB0aGUgbW91c2VBcmVhIGFuZCB0b3VjaEFyZWEgdG8gYmUgdGhlIHdob2xlIGxvY2FsIGJvdW5kcyBvZiB0aGlzIG5vZGUsIGJlY2F1c2UgaWYgaXQganVzdCByZWxpZXMgb24gdGhlXG4gICAgLy8gYm91bmRzIG9mIHRoZSBpY29uIGFuZCB0ZXh0LCB0aGVuIHRoZXJlIGlzIGEgZ2FwIGluIGJldHdlZW4gdGhlbS4gU2luY2UgdGhlIGJ1dHRvbiBjYW4gY2hhbmdlIHNpemUsIHRoaXNcbiAgICAvLyBhc3NpZ25tZW50IG5lZWRzIHRvIGhhcHBlbiBhbnl0aW1lIHRoZSBib3VuZHMgY2hhbmdlLlxuICAgIHRoaXMuYm91bmRzUHJvcGVydHkubGluayggKCkgPT4ge1xuICAgICAgdGhpcy5tb3VzZUFyZWEgPSB0aGlzLnRvdWNoQXJlYSA9IFNoYXBlLmJvdW5kcyggdGhpcy5sb2NhbEJvdW5kcyApO1xuICAgIH0gKTtcbiAgfVxufVxuXG5qb2lzdC5yZWdpc3RlciggJ0hvbWVTY3JlZW5CdXR0b24nLCBIb21lU2NyZWVuQnV0dG9uICk7XG5leHBvcnQgZGVmYXVsdCBIb21lU2NyZWVuQnV0dG9uOyJdLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJVdGlscyIsIlNoYXBlIiwibWVyZ2UiLCJvcHRpb25pemUiLCJQaGV0Q29sb3JTY2hlbWUiLCJQaGV0Rm9udCIsIkZpcmVMaXN0ZW5lciIsIk5vZGUiLCJQRE9NUGVlciIsIlJlY3RhbmdsZSIsIlRleHQiLCJWQm94IiwiVm9pY2luZyIsIkV2ZW50VHlwZSIsIlV0dGVyYW5jZSIsIkZyYW1lIiwiam9pc3QiLCJMQVJHRV9JQ09OX0hFSUdIVCIsIkhvbWVTY3JlZW5CdXR0b24iLCJzY3JlZW4iLCJob21lU2NyZWVuTW9kZWwiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiY3Vyc29yIiwic2hvd1Vuc2VsZWN0ZWRIb21lU2NyZWVuSWNvbkZyYW1lIiwidGFnTmFtZSIsImFwcGVuZERlc2NyaXB0aW9uIiwiY29udGFpbmVyVGFnTmFtZSIsInBoZXRpb0V2ZW50VHlwZSIsIlVTRVIiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiaXNTZWxlY3RlZFByb3BlcnR5Iiwic2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eSIsInNlbGVjdGVkU2NyZWVuIiwiaXNIaWdobGlnaHRlZFByb3BlcnR5Iiwic21hbGxJY29uU2NhbGUiLCJsaW5lYXIiLCJzaW1TY3JlZW5zIiwibGVuZ3RoIiwic21hbGxJY29uSGVpZ2h0IiwiYXNzZXJ0IiwiaG9tZVNjcmVlbkljb24iLCJuYW1lUHJvcGVydHkiLCJ2YWx1ZSIsInNtYWxsSWNvbiIsImNoaWxkcmVuIiwic2NhbGUiLCJoZWlnaHQiLCJsYXJnZUljb24iLCJzbWFsbEZyYW1lIiwid2lkdGgiLCJzdHJva2UiLCJTQ1JFRU5fSUNPTl9GUkFNRSIsImxpbmVXaWR0aCIsImxhcmdlRnJhbWUiLCJzbWFsbE5vZGUiLCJsYXJnZU5vZGUiLCJub2RlQ29udGFpbmVyIiwicGRvbVZpc2libGUiLCJ0ZXh0IiwiYWRkQXJpYURlc2NyaWJlZGJ5QXNzb2NpYXRpb24iLCJvdGhlck5vZGUiLCJvdGhlckVsZW1lbnROYW1lIiwiREVTQ1JJUFRJT05fU0lCTElORyIsInRoaXNFbGVtZW50TmFtZSIsIlBSSU1BUllfU0lCTElORyIsInNldHRpbmdzIiwic21hbGwiLCJub2RlIiwiZm9udCIsInNwYWNpbmciLCJsYXJnZSIsInNldE9wYWNpdHlBbmRGaWxsIiwib3BhY2l0eSIsImZpbGwiLCJsaW5rIiwiaXNTZWxlY3RlZCIsImRhdGEiLCJtYXhXaWR0aCIsInNldFNwYWNpbmciLCJpc0hpZ2hsaWdodGVkIiwic2V0SGlnaGxpZ2h0ZWQiLCJidXR0b25TZWxlY3Rpb25VdHRlcmFuY2UiLCJidXR0b25XYXNBbHJlYWR5U2VsZWN0ZWQiLCJidXR0b25GaXJlZCIsInBvaW50ZXJJc1RvdWNoTGlrZSIsImZpcmVMaXN0ZW5lciIsInBvaW50ZXIiLCJpc1RvdWNoTGlrZSIsInNjcmVlblByb3BlcnR5Iiwidm9pY2luZ1NwZWFrRnVsbFJlc3BvbnNlIiwib2JqZWN0UmVzcG9uc2UiLCJoaW50UmVzcG9uc2UiLCJ1dHRlcmFuY2UiLCJjb250ZXh0UmVzcG9uc2UiLCJmaXJlIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiYWRkSW5wdXRMaXN0ZW5lciIsImZvY3VzIiwiZXZlbnQiLCJjbGljayIsInNldCIsImJsdXIiLCJvdmVyIiwib3V0Iiwib25Ub3VjaExpa2VPdmVyIiwidG91Y2hvdmVyIiwicGVub3ZlciIsImJvdW5kc1Byb3BlcnR5IiwibW91c2VBcmVhIiwidG91Y2hBcmVhIiwiYm91bmRzIiwibG9jYWxCb3VuZHMiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7O0NBT0MsR0FFRCxPQUFPQSxxQkFBcUIsbUNBQW1DO0FBQy9ELE9BQU9DLHFC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