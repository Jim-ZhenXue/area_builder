// Copyright 2013-2024, University of Colorado Boulder
/**
 * The navigation bar at the bottom of the screen.
 * For a single-screen sim, it shows the name of the sim at the far left and the PhET button at the far right.
 * For a multi-screen sim, it additionally shows buttons for each screen, and a home button.
 *
 * Layout of NavigationBar adapts to different text widths, icon widths, and numbers of screens, and attempts to
 * perform an "optimal" layout. The sim title is initially constrained to a max percentage of the bar width,
 * and that's used to compute how much space is available for screen buttons.  After creation and layout of the
 * screen buttons, we then compute how much space is actually available for the sim title, and use that to
 * constrain the title's width.
 *
 * The bar is composed of a background (always pixel-perfect), and expandable content (that gets scaled as one part).
 * If we are width-constrained, the navigation bar is in a 'compact' state where the children of the content (e.g.
 * home button, screen buttons, phet menu, title) do not change positions. If we are height-constrained, the amount
 * available to the bar expands, so we lay out the children to fit. See https://github.com/phetsims/joist/issues/283
 * for more details on how this is done.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */ import BooleanProperty from '../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import StringProperty from '../../axon/js/StringProperty.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { AlignBox, HBox, ManualConstraint, Node, PDOMPeer, Rectangle, RelaxedManualConstraint, Text } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import A11yButtonsHBox from './A11yButtonsHBox.js';
import HomeButton from './HomeButton.js';
import HomeScreen from './HomeScreen.js';
import HomeScreenView from './HomeScreenView.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';
import NavigationBarScreenButton from './NavigationBarScreenButton.js';
import PhetButton from './PhetButton.js';
// constants
// for layout of the NavigationBar, used in the following way:
// [
//  {TITLE_LEFT_MARGIN}Title{TITLE_RIGHT_MARGIN}
//  {HOME_BUTTON_LEFT_MARGIN}HomeButton{HOME_BUTTON_RIGHT_MARGIN} (if visible)
//  {ScreenButtons centered} (if visible)
//  a11yButtonsHBox (if present){PHET_BUTTON_LEFT_MARGIN}PhetButton{PHET_BUTTON_RIGHT_MARGIN}
// ]
const NAVIGATION_BAR_SIZE = new Dimension2(HomeScreenView.LAYOUT_BOUNDS.width, 40);
const TITLE_LEFT_MARGIN = 10;
const TITLE_RIGHT_MARGIN = 25;
const PHET_BUTTON_LEFT_MARGIN = 6;
const PHET_BUTTON_RIGHT_MARGIN = 10;
const HOME_BUTTON_LEFT_MARGIN = 5;
const HOME_BUTTON_RIGHT_MARGIN = HOME_BUTTON_LEFT_MARGIN;
const SCREEN_BUTTON_SPACING = 0;
const MINIMUM_SCREEN_BUTTON_WIDTH = 60; // Make sure each button is at least a minimum width so they don't get too close together, see #279
let NavigationBar = class NavigationBar extends Node {
    /**
   * Called when the navigation bar layout needs to be updated, typically when the browser window is resized.
   */ layout(scale, width, height) {
        // resize the background
        this.background.rectWidth = width;
        this.background.rectHeight = height;
        // scale the entire bar contents
        this.barContents.setScaleMagnitude(scale);
    }
    constructor(sim, tandem){
        super(), this.homeButton = null // mutated if multiscreen sim
        ;
        // The nav bar fill and determining fill for elements on the nav bar (if it's black, the elements are white)
        this.navigationBarFillProperty = new DerivedProperty([
            sim.selectedScreenProperty,
            sim.lookAndFeel.navigationBarFillProperty
        ], (screen, simNavigationBarFill)=>{
            const showHomeScreen = screen === sim.homeScreen;
            // If the homescreen is showing, the navigation bar should blend into it.  This is done by making it the same color.
            // It cannot be made transparent here, because other code relies on the value of navigationBarFillProperty being
            // 'black' to make the icons show up as white, even when the navigation bar is hidden on the home screen.
            return showHomeScreen ? HomeScreen.BACKGROUND_COLOR : simNavigationBarFill;
        });
        // The bar's background (resized in layout)
        this.background = new Rectangle(0, 0, NAVIGATION_BAR_SIZE.width, NAVIGATION_BAR_SIZE.height, {
            pickable: true,
            fill: this.navigationBarFillProperty
        });
        this.addChild(this.background);
        // Everything else besides the background in the navigation bar (used for scaling)
        this.barContents = new Node();
        this.addChild(this.barContents);
        const titleText = new Text(sim.displayedSimNameProperty, {
            font: new PhetFont(16),
            fill: sim.lookAndFeel.navigationBarTextFillProperty,
            tandem: tandem.createTandem('titleText'),
            phetioFeatured: true,
            phetioDocumentation: 'Displays the title of the simulation in the navigation bar (bottom left)',
            visiblePropertyOptions: {
                phetioFeatured: true
            },
            stringPropertyOptions: {
                phetioReadOnly: true
            },
            phetioVisiblePropertyInstrumented: true
        });
        // Container node so that the visibility of the Navigation Bar title text can be controlled
        // independently by PhET-iO and whether the user is on the homescreen.
        const titleContainerNode = new Node({
            children: [
                titleText
            ],
            visibleProperty: new DerivedProperty([
                sim.selectedScreenProperty
            ], (screen)=>screen !== sim.homeScreen)
        });
        this.barContents.addChild(titleContainerNode);
        // PhET button, fill determined by state of navigationBarFillProperty
        const phetButton = new PhetButton(sim, this.navigationBarFillProperty, tandem.createTandem('phetButton'));
        this.barContents.addChild(phetButton);
        // a11y HBox, button fills determined by state of navigationBarFillProperty
        this.a11yButtonsHBox = new A11yButtonsHBox(sim, this.navigationBarFillProperty, {
            tandem: tandem // no need for a container here. If there is a conflict, then it will error loudly.
        });
        this.barContents.addChild(this.a11yButtonsHBox);
        this.localeNode && this.barContents.addChild(this.localeNode);
        // pdom - tell this node that it is aria-labelled by its own labelContent.
        this.addAriaLabelledbyAssociation({
            thisElementName: PDOMPeer.PRIMARY_SIBLING,
            otherNode: this,
            otherElementName: PDOMPeer.LABEL_SIBLING
        });
        let buttons;
        const a11yButtonsWidth = this.a11yButtonsHBox.bounds.isValid() ? this.a11yButtonsHBox.width : 0;
        // No potential for multiple screens if this is true
        if (sim.simScreens.length === 1) {
            /* single-screen sim */ // title can occupy all space to the left of the PhET button
            titleText.maxWidth = HomeScreenView.LAYOUT_BOUNDS.width - TITLE_LEFT_MARGIN - TITLE_RIGHT_MARGIN - PHET_BUTTON_LEFT_MARGIN - a11yButtonsWidth - (this.localeNode ? this.localeNode.width : 0) - PHET_BUTTON_LEFT_MARGIN - phetButton.width - PHET_BUTTON_RIGHT_MARGIN;
        } else {
            /* multi-screen sim */ // Start with the assumption that the title can occupy (at most) this percentage of the bar.
            const maxTitleWidth = Math.min(titleText.width, 0.20 * HomeScreenView.LAYOUT_BOUNDS.width);
            const isUserNavigableProperty = new BooleanProperty(true, {
                tandem: Tandem.GENERAL_MODEL.createTandem('screens').createTandem('isUserNavigableProperty'),
                phetioFeatured: true,
                phetioDocumentation: 'If the screens are user navigable, icons are displayed in the navigation bar and the user can switch between screens.'
            });
            // pdom - container for the homeButton and all the screen buttons.
            buttons = new Node({
                tagName: 'ol',
                containerTagName: 'nav',
                labelTagName: 'h2',
                labelContent: JoistStrings.a11y.simScreensStringProperty,
                visibleProperty: new DerivedProperty([
                    sim.activeSimScreensProperty,
                    sim.selectedScreenProperty,
                    isUserNavigableProperty
                ], (screens, screen, isUserNavigable)=>{
                    return screen !== sim.homeScreen && screens.length > 1 && isUserNavigable;
                })
            });
            buttons.ariaLabelledbyAssociations = [
                {
                    thisElementName: PDOMPeer.CONTAINER_PARENT,
                    otherElementName: PDOMPeer.LABEL_SIBLING,
                    otherNode: buttons
                }
            ];
            this.barContents.addChild(buttons);
            // Create the home button
            this.homeButton = new HomeButton(NAVIGATION_BAR_SIZE.height, sim.lookAndFeel.navigationBarFillProperty, sim.homeScreen ? sim.homeScreen.pdomDisplayNameProperty : new StringProperty('NO HOME SCREEN'), {
                listener: ()=>{
                    sim.selectedScreenProperty.value = sim.homeScreen;
                },
                tandem: tandem.createTandem('homeButton'),
                centerY: NAVIGATION_BAR_SIZE.height / 2
            });
            // Add the home button, but only if the homeScreen exists
            sim.homeScreen && buttons.addChild(this.homeButton);
            /*
       * Allocate remaining horizontal space equally for screen buttons, assuming they will be centered in the navbar.
       * Computations here reflect the left-to-right layout of the navbar.
       */ // available width left of center
            const availableLeft = HomeScreenView.LAYOUT_BOUNDS.width / 2 - TITLE_LEFT_MARGIN - maxTitleWidth - TITLE_RIGHT_MARGIN - HOME_BUTTON_LEFT_MARGIN - this.homeButton.width - HOME_BUTTON_RIGHT_MARGIN;
            // available width right of center
            const availableRight = HomeScreenView.LAYOUT_BOUNDS.width / 2 - PHET_BUTTON_LEFT_MARGIN - a11yButtonsWidth - (this.localeNode ? this.localeNode.width : 0) - PHET_BUTTON_LEFT_MARGIN - phetButton.width - PHET_BUTTON_RIGHT_MARGIN;
            // total available width for the screen buttons when they are centered
            const availableTotal = 2 * Math.min(availableLeft, availableRight);
            // width per screen button
            const screenButtonWidth = (availableTotal - (sim.simScreens.length - 1) * SCREEN_BUTTON_SPACING) / sim.simScreens.length;
            // Create the screen buttons
            const screenButtons = sim.simScreens.map((screen)=>{
                return new NavigationBarScreenButton(sim.lookAndFeel.navigationBarFillProperty, sim.selectedScreenProperty, screen, sim.simScreens.indexOf(screen), NAVIGATION_BAR_SIZE.height, {
                    maxButtonWidth: screenButtonWidth,
                    tandem: screen.tandem.supplied ? tandem.createTandem(`${screen.tandem.name}Button`) : Tandem.REQUIRED
                });
            });
            const allNavBarScreenButtons = [
                this.homeButton,
                ...screenButtons
            ];
            // Layout out screen buttons horizontally, with equal distance between their centers
            // Make sure each button is at least a minimum size, so they don't get too close together, see #279
            const maxScreenButtonWidth = Math.max(MINIMUM_SCREEN_BUTTON_WIDTH, _.maxBy(screenButtons, (button)=>{
                return button.width;
            }).width);
            const maxScreenButtonHeight = _.maxBy(screenButtons, (button)=>button.height).height;
            const screenButtonMap = new Map();
            screenButtons.forEach((screenButton)=>{
                screenButtonMap.set(screenButton.screen, new AlignBox(screenButton, {
                    excludeInvisibleChildrenFromBounds: true,
                    alignBounds: new Bounds2(0, 0, maxScreenButtonWidth, maxScreenButtonHeight),
                    visibleProperty: screenButton.visibleProperty
                }));
            });
            // Put all screen buttons under a parent, to simplify layout
            const screenButtonsContainer = new HBox({
                spacing: SCREEN_BUTTON_SPACING,
                maxWidth: availableTotal // in case we have so many screens that the screen buttons need to be scaled down
            });
            buttons.addChild(screenButtonsContainer);
            sim.activeSimScreensProperty.link((simScreens)=>{
                screenButtonsContainer.children = simScreens.map((screen)=>screenButtonMap.get(screen));
            });
            // Screen buttons centered.  These buttons are centered around the origin in the screenButtonsContainer, so the
            // screenButtonsContainer can be put at the center of the navbar.
            ManualConstraint.create(this, [
                this.background,
                screenButtonsContainer
            ], (backgroundProxy, screenButtonsContainerProxy)=>{
                screenButtonsContainerProxy.center = backgroundProxy.center;
            });
            // home button to the left of screen buttons
            RelaxedManualConstraint.create(this.barContents, [
                this.homeButton,
                ...screenButtons
            ], (homeButtonProxy, ...screenButtonProxies)=>{
                const visibleScreenButtonProxies = screenButtonProxies.filter((proxy)=>proxy && proxy.visible);
                // Find the left-most visible button. We don't want the extra padding of the alignbox to be included in this calculation,
                // for backwards compatibility, so it's a lot more complicated.
                if (homeButtonProxy && visibleScreenButtonProxies.length > 0) {
                    homeButtonProxy.right = Math.min(...visibleScreenButtonProxies.map((proxy)=>proxy.left)) - HOME_BUTTON_RIGHT_MARGIN;
                }
            });
            // max width relative to position of home button
            ManualConstraint.create(this.barContents, [
                this.homeButton,
                titleText
            ], (homeButtonProxy, titleTextProxy)=>{
                titleTextProxy.maxWidth = homeButtonProxy.left - TITLE_LEFT_MARGIN - TITLE_RIGHT_MARGIN;
            });
            sim.simNameProperty.link((simName)=>{
                allNavBarScreenButtons.forEach((screenButton)=>{
                    screenButton.voicingContextResponse = simName;
                });
            });
        }
        // initial layout (that doesn't need to change when we are re-laid out)
        titleText.left = TITLE_LEFT_MARGIN;
        titleText.centerY = NAVIGATION_BAR_SIZE.height / 2;
        phetButton.centerY = NAVIGATION_BAR_SIZE.height / 2;
        ManualConstraint.create(this, [
            this.background,
            phetButton
        ], (backgroundProxy, phetButtonProxy)=>{
            phetButtonProxy.right = backgroundProxy.right - PHET_BUTTON_RIGHT_MARGIN;
        });
        ManualConstraint.create(this.barContents, [
            phetButton,
            this.a11yButtonsHBox
        ], (phetButtonProxy, a11yButtonsHBoxProxy)=>{
            a11yButtonsHBoxProxy.right = phetButtonProxy.left - PHET_BUTTON_LEFT_MARGIN;
            // The icon is vertically adjusted in KeyboardHelpButton, so that the centers can be aligned here
            a11yButtonsHBoxProxy.centerY = phetButtonProxy.centerY;
        });
        if (this.localeNode) {
            ManualConstraint.create(this.barContents, [
                phetButton,
                this.a11yButtonsHBox,
                this.localeNode
            ], (phetButtonProxy, a11yButtonsHBoxProxy, localeNodeProxy)=>{
                a11yButtonsHBoxProxy.right = phetButtonProxy.left - PHET_BUTTON_LEFT_MARGIN;
                // The icon is vertically adjusted in KeyboardHelpButton, so that the centers can be aligned here
                a11yButtonsHBoxProxy.centerY = phetButtonProxy.centerY;
                localeNodeProxy.centerY = phetButtonProxy.centerY;
                localeNodeProxy.right = Math.min(a11yButtonsHBoxProxy.left, phetButtonProxy.left) - PHET_BUTTON_LEFT_MARGIN;
            });
        }
        this.layout(1, NAVIGATION_BAR_SIZE.width, NAVIGATION_BAR_SIZE.height);
        const simResourcesContainer = new Node({
            // pdom
            tagName: 'div',
            containerTagName: 'section',
            labelTagName: 'h2',
            labelContent: JoistStrings.a11y.simResourcesStringProperty,
            pdomOrder: [
                this.a11yButtonsHBox,
                phetButton
            ].filter((node)=>node !== undefined)
        });
        simResourcesContainer.ariaLabelledbyAssociations = [
            {
                thisElementName: PDOMPeer.CONTAINER_PARENT,
                otherElementName: PDOMPeer.LABEL_SIBLING,
                otherNode: simResourcesContainer
            }
        ];
        this.addChild(simResourcesContainer);
    }
};
NavigationBar.NAVIGATION_BAR_SIZE = NAVIGATION_BAR_SIZE;
joist.register('NavigationBar', NavigationBar);
export default NavigationBar;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL05hdmlnYXRpb25CYXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGhlIG5hdmlnYXRpb24gYmFyIGF0IHRoZSBib3R0b20gb2YgdGhlIHNjcmVlbi5cbiAqIEZvciBhIHNpbmdsZS1zY3JlZW4gc2ltLCBpdCBzaG93cyB0aGUgbmFtZSBvZiB0aGUgc2ltIGF0IHRoZSBmYXIgbGVmdCBhbmQgdGhlIFBoRVQgYnV0dG9uIGF0IHRoZSBmYXIgcmlnaHQuXG4gKiBGb3IgYSBtdWx0aS1zY3JlZW4gc2ltLCBpdCBhZGRpdGlvbmFsbHkgc2hvd3MgYnV0dG9ucyBmb3IgZWFjaCBzY3JlZW4sIGFuZCBhIGhvbWUgYnV0dG9uLlxuICpcbiAqIExheW91dCBvZiBOYXZpZ2F0aW9uQmFyIGFkYXB0cyB0byBkaWZmZXJlbnQgdGV4dCB3aWR0aHMsIGljb24gd2lkdGhzLCBhbmQgbnVtYmVycyBvZiBzY3JlZW5zLCBhbmQgYXR0ZW1wdHMgdG9cbiAqIHBlcmZvcm0gYW4gXCJvcHRpbWFsXCIgbGF5b3V0LiBUaGUgc2ltIHRpdGxlIGlzIGluaXRpYWxseSBjb25zdHJhaW5lZCB0byBhIG1heCBwZXJjZW50YWdlIG9mIHRoZSBiYXIgd2lkdGgsXG4gKiBhbmQgdGhhdCdzIHVzZWQgdG8gY29tcHV0ZSBob3cgbXVjaCBzcGFjZSBpcyBhdmFpbGFibGUgZm9yIHNjcmVlbiBidXR0b25zLiAgQWZ0ZXIgY3JlYXRpb24gYW5kIGxheW91dCBvZiB0aGVcbiAqIHNjcmVlbiBidXR0b25zLCB3ZSB0aGVuIGNvbXB1dGUgaG93IG11Y2ggc3BhY2UgaXMgYWN0dWFsbHkgYXZhaWxhYmxlIGZvciB0aGUgc2ltIHRpdGxlLCBhbmQgdXNlIHRoYXQgdG9cbiAqIGNvbnN0cmFpbiB0aGUgdGl0bGUncyB3aWR0aC5cbiAqXG4gKiBUaGUgYmFyIGlzIGNvbXBvc2VkIG9mIGEgYmFja2dyb3VuZCAoYWx3YXlzIHBpeGVsLXBlcmZlY3QpLCBhbmQgZXhwYW5kYWJsZSBjb250ZW50ICh0aGF0IGdldHMgc2NhbGVkIGFzIG9uZSBwYXJ0KS5cbiAqIElmIHdlIGFyZSB3aWR0aC1jb25zdHJhaW5lZCwgdGhlIG5hdmlnYXRpb24gYmFyIGlzIGluIGEgJ2NvbXBhY3QnIHN0YXRlIHdoZXJlIHRoZSBjaGlsZHJlbiBvZiB0aGUgY29udGVudCAoZS5nLlxuICogaG9tZSBidXR0b24sIHNjcmVlbiBidXR0b25zLCBwaGV0IG1lbnUsIHRpdGxlKSBkbyBub3QgY2hhbmdlIHBvc2l0aW9ucy4gSWYgd2UgYXJlIGhlaWdodC1jb25zdHJhaW5lZCwgdGhlIGFtb3VudFxuICogYXZhaWxhYmxlIHRvIHRoZSBiYXIgZXhwYW5kcywgc28gd2UgbGF5IG91dCB0aGUgY2hpbGRyZW4gdG8gZml0LiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy8yODNcbiAqIGZvciBtb3JlIGRldGFpbHMgb24gaG93IHRoaXMgaXMgZG9uZS5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xuaW1wb3J0IFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9SZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBTdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1N0cmluZ1Byb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xuaW1wb3J0IHsgQWxpZ25Cb3gsIENvbG9yLCBIQm94LCBNYW51YWxDb25zdHJhaW50LCBOb2RlLCBQRE9NUGVlciwgUmVjdGFuZ2xlLCBSZWxheGVkTWFudWFsQ29uc3RyYWludCwgVGV4dCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IEExMXlCdXR0b25zSEJveCBmcm9tICcuL0ExMXlCdXR0b25zSEJveC5qcyc7XG5pbXBvcnQgSG9tZUJ1dHRvbiBmcm9tICcuL0hvbWVCdXR0b24uanMnO1xuaW1wb3J0IEhvbWVTY3JlZW4gZnJvbSAnLi9Ib21lU2NyZWVuLmpzJztcbmltcG9ydCBIb21lU2NyZWVuVmlldyBmcm9tICcuL0hvbWVTY3JlZW5WaWV3LmpzJztcbmltcG9ydCBqb2lzdCBmcm9tICcuL2pvaXN0LmpzJztcbmltcG9ydCBKb2lzdFN0cmluZ3MgZnJvbSAnLi9Kb2lzdFN0cmluZ3MuanMnO1xuaW1wb3J0IE5hdmlnYXRpb25CYXJTY3JlZW5CdXR0b24gZnJvbSAnLi9OYXZpZ2F0aW9uQmFyU2NyZWVuQnV0dG9uLmpzJztcbmltcG9ydCBQaGV0QnV0dG9uIGZyb20gJy4vUGhldEJ1dHRvbi5qcyc7XG5pbXBvcnQgeyBBbnlTY3JlZW4gfSBmcm9tICcuL1NjcmVlbi5qcyc7XG5pbXBvcnQgU2ltIGZyb20gJy4vU2ltLmpzJztcblxuLy8gY29uc3RhbnRzXG4vLyBmb3IgbGF5b3V0IG9mIHRoZSBOYXZpZ2F0aW9uQmFyLCB1c2VkIGluIHRoZSBmb2xsb3dpbmcgd2F5OlxuLy8gW1xuLy8gIHtUSVRMRV9MRUZUX01BUkdJTn1UaXRsZXtUSVRMRV9SSUdIVF9NQVJHSU59XG4vLyAge0hPTUVfQlVUVE9OX0xFRlRfTUFSR0lOfUhvbWVCdXR0b257SE9NRV9CVVRUT05fUklHSFRfTUFSR0lOfSAoaWYgdmlzaWJsZSlcbi8vICB7U2NyZWVuQnV0dG9ucyBjZW50ZXJlZH0gKGlmIHZpc2libGUpXG4vLyAgYTExeUJ1dHRvbnNIQm94IChpZiBwcmVzZW50KXtQSEVUX0JVVFRPTl9MRUZUX01BUkdJTn1QaGV0QnV0dG9ue1BIRVRfQlVUVE9OX1JJR0hUX01BUkdJTn1cbi8vIF1cbmNvbnN0IE5BVklHQVRJT05fQkFSX1NJWkUgPSBuZXcgRGltZW5zaW9uMiggSG9tZVNjcmVlblZpZXcuTEFZT1VUX0JPVU5EUy53aWR0aCwgNDAgKTtcbmNvbnN0IFRJVExFX0xFRlRfTUFSR0lOID0gMTA7XG5jb25zdCBUSVRMRV9SSUdIVF9NQVJHSU4gPSAyNTtcbmNvbnN0IFBIRVRfQlVUVE9OX0xFRlRfTUFSR0lOID0gNjtcbmNvbnN0IFBIRVRfQlVUVE9OX1JJR0hUX01BUkdJTiA9IDEwO1xuY29uc3QgSE9NRV9CVVRUT05fTEVGVF9NQVJHSU4gPSA1O1xuY29uc3QgSE9NRV9CVVRUT05fUklHSFRfTUFSR0lOID0gSE9NRV9CVVRUT05fTEVGVF9NQVJHSU47XG5jb25zdCBTQ1JFRU5fQlVUVE9OX1NQQUNJTkcgPSAwO1xuY29uc3QgTUlOSU1VTV9TQ1JFRU5fQlVUVE9OX1dJRFRIID0gNjA7IC8vIE1ha2Ugc3VyZSBlYWNoIGJ1dHRvbiBpcyBhdCBsZWFzdCBhIG1pbmltdW0gd2lkdGggc28gdGhleSBkb24ndCBnZXQgdG9vIGNsb3NlIHRvZ2V0aGVyLCBzZWUgIzI3OVxuXG5jbGFzcyBOYXZpZ2F0aW9uQmFyIGV4dGVuZHMgTm9kZSB7XG4gIHByaXZhdGUgcmVhZG9ubHkgbmF2aWdhdGlvbkJhckZpbGxQcm9wZXJ0eTogUmVhZE9ubHlQcm9wZXJ0eTxDb2xvcj47XG4gIHByaXZhdGUgcmVhZG9ubHkgYmFja2dyb3VuZDogUmVjdGFuZ2xlO1xuICBwcml2YXRlIHJlYWRvbmx5IGJhckNvbnRlbnRzOiBOb2RlO1xuICBwcml2YXRlIHJlYWRvbmx5IGExMXlCdXR0b25zSEJveDogQTExeUJ1dHRvbnNIQm94O1xuICBwcml2YXRlIHJlYWRvbmx5IGxvY2FsZU5vZGUhOiBOb2RlO1xuICBwcml2YXRlIHJlYWRvbmx5IGhvbWVCdXR0b246IEhvbWVCdXR0b24gfCBudWxsID0gbnVsbDsgLy8gbXV0YXRlZCBpZiBtdWx0aXNjcmVlbiBzaW1cblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHNpbTogU2ltLCB0YW5kZW06IFRhbmRlbSApIHtcblxuICAgIHN1cGVyKCk7XG5cbiAgICAvLyBUaGUgbmF2IGJhciBmaWxsIGFuZCBkZXRlcm1pbmluZyBmaWxsIGZvciBlbGVtZW50cyBvbiB0aGUgbmF2IGJhciAoaWYgaXQncyBibGFjaywgdGhlIGVsZW1lbnRzIGFyZSB3aGl0ZSlcbiAgICB0aGlzLm5hdmlnYXRpb25CYXJGaWxsUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbXG4gICAgICBzaW0uc2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eSxcbiAgICAgIHNpbS5sb29rQW5kRmVlbC5uYXZpZ2F0aW9uQmFyRmlsbFByb3BlcnR5XG4gICAgXSwgKCBzY3JlZW4sIHNpbU5hdmlnYXRpb25CYXJGaWxsICkgPT4ge1xuXG4gICAgICBjb25zdCBzaG93SG9tZVNjcmVlbiA9IHNjcmVlbiA9PT0gc2ltLmhvbWVTY3JlZW47XG5cbiAgICAgIC8vIElmIHRoZSBob21lc2NyZWVuIGlzIHNob3dpbmcsIHRoZSBuYXZpZ2F0aW9uIGJhciBzaG91bGQgYmxlbmQgaW50byBpdC4gIFRoaXMgaXMgZG9uZSBieSBtYWtpbmcgaXQgdGhlIHNhbWUgY29sb3IuXG4gICAgICAvLyBJdCBjYW5ub3QgYmUgbWFkZSB0cmFuc3BhcmVudCBoZXJlLCBiZWNhdXNlIG90aGVyIGNvZGUgcmVsaWVzIG9uIHRoZSB2YWx1ZSBvZiBuYXZpZ2F0aW9uQmFyRmlsbFByb3BlcnR5IGJlaW5nXG4gICAgICAvLyAnYmxhY2snIHRvIG1ha2UgdGhlIGljb25zIHNob3cgdXAgYXMgd2hpdGUsIGV2ZW4gd2hlbiB0aGUgbmF2aWdhdGlvbiBiYXIgaXMgaGlkZGVuIG9uIHRoZSBob21lIHNjcmVlbi5cbiAgICAgIHJldHVybiBzaG93SG9tZVNjcmVlbiA/IEhvbWVTY3JlZW4uQkFDS0dST1VORF9DT0xPUiA6IHNpbU5hdmlnYXRpb25CYXJGaWxsO1xuICAgIH0gKTtcblxuICAgIC8vIFRoZSBiYXIncyBiYWNrZ3JvdW5kIChyZXNpemVkIGluIGxheW91dClcbiAgICB0aGlzLmJhY2tncm91bmQgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBOQVZJR0FUSU9OX0JBUl9TSVpFLndpZHRoLCBOQVZJR0FUSU9OX0JBUl9TSVpFLmhlaWdodCwge1xuICAgICAgcGlja2FibGU6IHRydWUsXG4gICAgICBmaWxsOiB0aGlzLm5hdmlnYXRpb25CYXJGaWxsUHJvcGVydHlcbiAgICB9ICk7XG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5iYWNrZ3JvdW5kICk7XG5cbiAgICAvLyBFdmVyeXRoaW5nIGVsc2UgYmVzaWRlcyB0aGUgYmFja2dyb3VuZCBpbiB0aGUgbmF2aWdhdGlvbiBiYXIgKHVzZWQgZm9yIHNjYWxpbmcpXG4gICAgdGhpcy5iYXJDb250ZW50cyA9IG5ldyBOb2RlKCk7XG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5iYXJDb250ZW50cyApO1xuXG4gICAgY29uc3QgdGl0bGVUZXh0ID0gbmV3IFRleHQoIHNpbS5kaXNwbGF5ZWRTaW1OYW1lUHJvcGVydHksIHtcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTYgKSxcbiAgICAgIGZpbGw6IHNpbS5sb29rQW5kRmVlbC5uYXZpZ2F0aW9uQmFyVGV4dEZpbGxQcm9wZXJ0eSxcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RpdGxlVGV4dCcgKSxcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlLFxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0Rpc3BsYXlzIHRoZSB0aXRsZSBvZiB0aGUgc2ltdWxhdGlvbiBpbiB0aGUgbmF2aWdhdGlvbiBiYXIgKGJvdHRvbSBsZWZ0KScsXG4gICAgICB2aXNpYmxlUHJvcGVydHlPcHRpb25zOiB7IHBoZXRpb0ZlYXR1cmVkOiB0cnVlIH0sXG4gICAgICBzdHJpbmdQcm9wZXJ0eU9wdGlvbnM6IHsgcGhldGlvUmVhZE9ubHk6IHRydWUgfSxcbiAgICAgIHBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZDogdHJ1ZVxuICAgIH0gKTtcblxuICAgIC8vIENvbnRhaW5lciBub2RlIHNvIHRoYXQgdGhlIHZpc2liaWxpdHkgb2YgdGhlIE5hdmlnYXRpb24gQmFyIHRpdGxlIHRleHQgY2FuIGJlIGNvbnRyb2xsZWRcbiAgICAvLyBpbmRlcGVuZGVudGx5IGJ5IFBoRVQtaU8gYW5kIHdoZXRoZXIgdGhlIHVzZXIgaXMgb24gdGhlIGhvbWVzY3JlZW4uXG4gICAgY29uc3QgdGl0bGVDb250YWluZXJOb2RlID0gbmV3IE5vZGUoIHtcbiAgICAgIGNoaWxkcmVuOiBbIHRpdGxlVGV4dCBdLFxuICAgICAgdmlzaWJsZVByb3BlcnR5OiBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHNpbS5zZWxlY3RlZFNjcmVlblByb3BlcnR5IF0sIHNjcmVlbiA9PiBzY3JlZW4gIT09IHNpbS5ob21lU2NyZWVuIClcbiAgICB9ICk7XG4gICAgdGhpcy5iYXJDb250ZW50cy5hZGRDaGlsZCggdGl0bGVDb250YWluZXJOb2RlICk7XG5cbiAgICAvLyBQaEVUIGJ1dHRvbiwgZmlsbCBkZXRlcm1pbmVkIGJ5IHN0YXRlIG9mIG5hdmlnYXRpb25CYXJGaWxsUHJvcGVydHlcbiAgICBjb25zdCBwaGV0QnV0dG9uID0gbmV3IFBoZXRCdXR0b24oXG4gICAgICBzaW0sXG4gICAgICB0aGlzLm5hdmlnYXRpb25CYXJGaWxsUHJvcGVydHksXG4gICAgICB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncGhldEJ1dHRvbicgKVxuICAgICk7XG4gICAgdGhpcy5iYXJDb250ZW50cy5hZGRDaGlsZCggcGhldEJ1dHRvbiApO1xuXG4gICAgLy8gYTExeSBIQm94LCBidXR0b24gZmlsbHMgZGV0ZXJtaW5lZCBieSBzdGF0ZSBvZiBuYXZpZ2F0aW9uQmFyRmlsbFByb3BlcnR5XG4gICAgdGhpcy5hMTF5QnV0dG9uc0hCb3ggPSBuZXcgQTExeUJ1dHRvbnNIQm94KFxuICAgICAgc2ltLFxuICAgICAgdGhpcy5uYXZpZ2F0aW9uQmFyRmlsbFByb3BlcnR5LCB7XG4gICAgICAgIHRhbmRlbTogdGFuZGVtIC8vIG5vIG5lZWQgZm9yIGEgY29udGFpbmVyIGhlcmUuIElmIHRoZXJlIGlzIGEgY29uZmxpY3QsIHRoZW4gaXQgd2lsbCBlcnJvciBsb3VkbHkuXG4gICAgICB9XG4gICAgKTtcbiAgICB0aGlzLmJhckNvbnRlbnRzLmFkZENoaWxkKCB0aGlzLmExMXlCdXR0b25zSEJveCApO1xuICAgIHRoaXMubG9jYWxlTm9kZSAmJiB0aGlzLmJhckNvbnRlbnRzLmFkZENoaWxkKCB0aGlzLmxvY2FsZU5vZGUgKTtcblxuICAgIC8vIHBkb20gLSB0ZWxsIHRoaXMgbm9kZSB0aGF0IGl0IGlzIGFyaWEtbGFiZWxsZWQgYnkgaXRzIG93biBsYWJlbENvbnRlbnQuXG4gICAgdGhpcy5hZGRBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uKCB7XG4gICAgICB0aGlzRWxlbWVudE5hbWU6IFBET01QZWVyLlBSSU1BUllfU0lCTElORyxcbiAgICAgIG90aGVyTm9kZTogdGhpcyxcbiAgICAgIG90aGVyRWxlbWVudE5hbWU6IFBET01QZWVyLkxBQkVMX1NJQkxJTkdcbiAgICB9ICk7XG5cbiAgICBsZXQgYnV0dG9uczogTm9kZTtcblxuICAgIGNvbnN0IGExMXlCdXR0b25zV2lkdGggPSAoIHRoaXMuYTExeUJ1dHRvbnNIQm94LmJvdW5kcy5pc1ZhbGlkKCkgPyB0aGlzLmExMXlCdXR0b25zSEJveC53aWR0aCA6IDAgKTtcblxuICAgIC8vIE5vIHBvdGVudGlhbCBmb3IgbXVsdGlwbGUgc2NyZWVucyBpZiB0aGlzIGlzIHRydWVcbiAgICBpZiAoIHNpbS5zaW1TY3JlZW5zLmxlbmd0aCA9PT0gMSApIHtcblxuICAgICAgLyogc2luZ2xlLXNjcmVlbiBzaW0gKi9cblxuICAgICAgLy8gdGl0bGUgY2FuIG9jY3VweSBhbGwgc3BhY2UgdG8gdGhlIGxlZnQgb2YgdGhlIFBoRVQgYnV0dG9uXG4gICAgICB0aXRsZVRleHQubWF4V2lkdGggPSBIb21lU2NyZWVuVmlldy5MQVlPVVRfQk9VTkRTLndpZHRoIC0gVElUTEVfTEVGVF9NQVJHSU4gLSBUSVRMRV9SSUdIVF9NQVJHSU4gLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgUEhFVF9CVVRUT05fTEVGVF9NQVJHSU4gLSBhMTF5QnV0dG9uc1dpZHRoIC0gKCB0aGlzLmxvY2FsZU5vZGUgPyB0aGlzLmxvY2FsZU5vZGUud2lkdGggOiAwICkgLSBQSEVUX0JVVFRPTl9MRUZUX01BUkdJTiAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBwaGV0QnV0dG9uLndpZHRoIC0gUEhFVF9CVVRUT05fUklHSFRfTUFSR0lOO1xuICAgIH1cbiAgICBlbHNlIHtcblxuICAgICAgLyogbXVsdGktc2NyZWVuIHNpbSAqL1xuXG4gICAgICAvLyBTdGFydCB3aXRoIHRoZSBhc3N1bXB0aW9uIHRoYXQgdGhlIHRpdGxlIGNhbiBvY2N1cHkgKGF0IG1vc3QpIHRoaXMgcGVyY2VudGFnZSBvZiB0aGUgYmFyLlxuICAgICAgY29uc3QgbWF4VGl0bGVXaWR0aCA9IE1hdGgubWluKCB0aXRsZVRleHQud2lkdGgsIDAuMjAgKiBIb21lU2NyZWVuVmlldy5MQVlPVVRfQk9VTkRTLndpZHRoICk7XG5cbiAgICAgIGNvbnN0IGlzVXNlck5hdmlnYWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xuICAgICAgICB0YW5kZW06IFRhbmRlbS5HRU5FUkFMX01PREVMLmNyZWF0ZVRhbmRlbSggJ3NjcmVlbnMnICkuY3JlYXRlVGFuZGVtKCAnaXNVc2VyTmF2aWdhYmxlUHJvcGVydHknICksXG4gICAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlLFxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnSWYgdGhlIHNjcmVlbnMgYXJlIHVzZXIgbmF2aWdhYmxlLCBpY29ucyBhcmUgZGlzcGxheWVkIGluIHRoZSBuYXZpZ2F0aW9uIGJhciBhbmQgdGhlIHVzZXIgY2FuIHN3aXRjaCBiZXR3ZWVuIHNjcmVlbnMuJ1xuICAgICAgfSApO1xuXG4gICAgICAvLyBwZG9tIC0gY29udGFpbmVyIGZvciB0aGUgaG9tZUJ1dHRvbiBhbmQgYWxsIHRoZSBzY3JlZW4gYnV0dG9ucy5cbiAgICAgIGJ1dHRvbnMgPSBuZXcgTm9kZSgge1xuICAgICAgICB0YWdOYW1lOiAnb2wnLFxuICAgICAgICBjb250YWluZXJUYWdOYW1lOiAnbmF2JyxcbiAgICAgICAgbGFiZWxUYWdOYW1lOiAnaDInLFxuICAgICAgICBsYWJlbENvbnRlbnQ6IEpvaXN0U3RyaW5ncy5hMTF5LnNpbVNjcmVlbnNTdHJpbmdQcm9wZXJ0eSxcbiAgICAgICAgdmlzaWJsZVByb3BlcnR5OiBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHNpbS5hY3RpdmVTaW1TY3JlZW5zUHJvcGVydHksIHNpbS5zZWxlY3RlZFNjcmVlblByb3BlcnR5LCBpc1VzZXJOYXZpZ2FibGVQcm9wZXJ0eSBdLCAoIHNjcmVlbnMsIHNjcmVlbiwgaXNVc2VyTmF2aWdhYmxlICkgPT4ge1xuICAgICAgICAgIHJldHVybiBzY3JlZW4gIT09IHNpbS5ob21lU2NyZWVuICYmIHNjcmVlbnMubGVuZ3RoID4gMSAmJiBpc1VzZXJOYXZpZ2FibGU7XG4gICAgICAgIH0gKVxuICAgICAgfSApO1xuXG4gICAgICBidXR0b25zLmFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zID0gWyB7XG4gICAgICAgIHRoaXNFbGVtZW50TmFtZTogUERPTVBlZXIuQ09OVEFJTkVSX1BBUkVOVCxcbiAgICAgICAgb3RoZXJFbGVtZW50TmFtZTogUERPTVBlZXIuTEFCRUxfU0lCTElORyxcbiAgICAgICAgb3RoZXJOb2RlOiBidXR0b25zXG4gICAgICB9IF07XG4gICAgICB0aGlzLmJhckNvbnRlbnRzLmFkZENoaWxkKCBidXR0b25zICk7XG5cbiAgICAgIC8vIENyZWF0ZSB0aGUgaG9tZSBidXR0b25cbiAgICAgIHRoaXMuaG9tZUJ1dHRvbiA9IG5ldyBIb21lQnV0dG9uKFxuICAgICAgICBOQVZJR0FUSU9OX0JBUl9TSVpFLmhlaWdodCxcbiAgICAgICAgc2ltLmxvb2tBbmRGZWVsLm5hdmlnYXRpb25CYXJGaWxsUHJvcGVydHksXG4gICAgICAgIHNpbS5ob21lU2NyZWVuID8gc2ltLmhvbWVTY3JlZW4ucGRvbURpc3BsYXlOYW1lUHJvcGVydHkgOiBuZXcgU3RyaW5nUHJvcGVydHkoICdOTyBIT01FIFNDUkVFTicgKSwge1xuICAgICAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XG4gICAgICAgICAgICBzaW0uc2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eS52YWx1ZSA9IHNpbS5ob21lU2NyZWVuITtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2hvbWVCdXR0b24nICksXG4gICAgICAgICAgY2VudGVyWTogTkFWSUdBVElPTl9CQVJfU0laRS5oZWlnaHQgLyAyXG4gICAgICAgIH0gKTtcblxuICAgICAgLy8gQWRkIHRoZSBob21lIGJ1dHRvbiwgYnV0IG9ubHkgaWYgdGhlIGhvbWVTY3JlZW4gZXhpc3RzXG4gICAgICBzaW0uaG9tZVNjcmVlbiAmJiBidXR0b25zLmFkZENoaWxkKCB0aGlzLmhvbWVCdXR0b24gKTtcblxuICAgICAgLypcbiAgICAgICAqIEFsbG9jYXRlIHJlbWFpbmluZyBob3Jpem9udGFsIHNwYWNlIGVxdWFsbHkgZm9yIHNjcmVlbiBidXR0b25zLCBhc3N1bWluZyB0aGV5IHdpbGwgYmUgY2VudGVyZWQgaW4gdGhlIG5hdmJhci5cbiAgICAgICAqIENvbXB1dGF0aW9ucyBoZXJlIHJlZmxlY3QgdGhlIGxlZnQtdG8tcmlnaHQgbGF5b3V0IG9mIHRoZSBuYXZiYXIuXG4gICAgICAgKi9cbiAgICAgIC8vIGF2YWlsYWJsZSB3aWR0aCBsZWZ0IG9mIGNlbnRlclxuICAgICAgY29uc3QgYXZhaWxhYmxlTGVmdCA9ICggSG9tZVNjcmVlblZpZXcuTEFZT1VUX0JPVU5EUy53aWR0aCAvIDIgKSAtIFRJVExFX0xFRlRfTUFSR0lOIC0gbWF4VGl0bGVXaWR0aCAtIFRJVExFX1JJR0hUX01BUkdJTiAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSE9NRV9CVVRUT05fTEVGVF9NQVJHSU4gLSB0aGlzLmhvbWVCdXR0b24ud2lkdGggLSBIT01FX0JVVFRPTl9SSUdIVF9NQVJHSU47XG5cbiAgICAgIC8vIGF2YWlsYWJsZSB3aWR0aCByaWdodCBvZiBjZW50ZXJcbiAgICAgIGNvbnN0IGF2YWlsYWJsZVJpZ2h0ID0gKCBIb21lU2NyZWVuVmlldy5MQVlPVVRfQk9VTkRTLndpZHRoIC8gMiApIC0gUEhFVF9CVVRUT05fTEVGVF9NQVJHSU4gLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhMTF5QnV0dG9uc1dpZHRoIC0gKCB0aGlzLmxvY2FsZU5vZGUgPyB0aGlzLmxvY2FsZU5vZGUud2lkdGggOiAwICkgLSBQSEVUX0JVVFRPTl9MRUZUX01BUkdJTiAtIHBoZXRCdXR0b24ud2lkdGggLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBQSEVUX0JVVFRPTl9SSUdIVF9NQVJHSU47XG5cbiAgICAgIC8vIHRvdGFsIGF2YWlsYWJsZSB3aWR0aCBmb3IgdGhlIHNjcmVlbiBidXR0b25zIHdoZW4gdGhleSBhcmUgY2VudGVyZWRcbiAgICAgIGNvbnN0IGF2YWlsYWJsZVRvdGFsID0gMiAqIE1hdGgubWluKCBhdmFpbGFibGVMZWZ0LCBhdmFpbGFibGVSaWdodCApO1xuXG4gICAgICAvLyB3aWR0aCBwZXIgc2NyZWVuIGJ1dHRvblxuICAgICAgY29uc3Qgc2NyZWVuQnV0dG9uV2lkdGggPSAoIGF2YWlsYWJsZVRvdGFsIC0gKCBzaW0uc2ltU2NyZWVucy5sZW5ndGggLSAxICkgKiBTQ1JFRU5fQlVUVE9OX1NQQUNJTkcgKSAvIHNpbS5zaW1TY3JlZW5zLmxlbmd0aDtcblxuICAgICAgLy8gQ3JlYXRlIHRoZSBzY3JlZW4gYnV0dG9uc1xuICAgICAgY29uc3Qgc2NyZWVuQnV0dG9ucyA9IHNpbS5zaW1TY3JlZW5zLm1hcCggc2NyZWVuID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBOYXZpZ2F0aW9uQmFyU2NyZWVuQnV0dG9uKFxuICAgICAgICAgIHNpbS5sb29rQW5kRmVlbC5uYXZpZ2F0aW9uQmFyRmlsbFByb3BlcnR5LFxuICAgICAgICAgIHNpbS5zZWxlY3RlZFNjcmVlblByb3BlcnR5LFxuICAgICAgICAgIHNjcmVlbixcbiAgICAgICAgICBzaW0uc2ltU2NyZWVucy5pbmRleE9mKCBzY3JlZW4gKSxcbiAgICAgICAgICBOQVZJR0FUSU9OX0JBUl9TSVpFLmhlaWdodCwge1xuICAgICAgICAgICAgbWF4QnV0dG9uV2lkdGg6IHNjcmVlbkJ1dHRvbldpZHRoLFxuICAgICAgICAgICAgdGFuZGVtOiBzY3JlZW4udGFuZGVtLnN1cHBsaWVkID8gdGFuZGVtLmNyZWF0ZVRhbmRlbSggYCR7c2NyZWVuLnRhbmRlbS5uYW1lfUJ1dHRvbmAgKSA6IFRhbmRlbS5SRVFVSVJFRFxuICAgICAgICAgIH0gKTtcbiAgICAgIH0gKTtcbiAgICAgIGNvbnN0IGFsbE5hdkJhclNjcmVlbkJ1dHRvbnMgPSBbIHRoaXMuaG9tZUJ1dHRvbiwgLi4uc2NyZWVuQnV0dG9ucyBdO1xuXG4gICAgICAvLyBMYXlvdXQgb3V0IHNjcmVlbiBidXR0b25zIGhvcml6b250YWxseSwgd2l0aCBlcXVhbCBkaXN0YW5jZSBiZXR3ZWVuIHRoZWlyIGNlbnRlcnNcbiAgICAgIC8vIE1ha2Ugc3VyZSBlYWNoIGJ1dHRvbiBpcyBhdCBsZWFzdCBhIG1pbmltdW0gc2l6ZSwgc28gdGhleSBkb24ndCBnZXQgdG9vIGNsb3NlIHRvZ2V0aGVyLCBzZWUgIzI3OVxuICAgICAgY29uc3QgbWF4U2NyZWVuQnV0dG9uV2lkdGggPSBNYXRoLm1heCggTUlOSU1VTV9TQ1JFRU5fQlVUVE9OX1dJRFRILCBfLm1heEJ5KCBzY3JlZW5CdXR0b25zLCBidXR0b24gPT4ge1xuICAgICAgICByZXR1cm4gYnV0dG9uLndpZHRoO1xuICAgICAgfSApIS53aWR0aCApO1xuICAgICAgY29uc3QgbWF4U2NyZWVuQnV0dG9uSGVpZ2h0ID0gXy5tYXhCeSggc2NyZWVuQnV0dG9ucywgYnV0dG9uID0+IGJ1dHRvbi5oZWlnaHQgKSEuaGVpZ2h0O1xuXG4gICAgICBjb25zdCBzY3JlZW5CdXR0b25NYXAgPSBuZXcgTWFwPEFueVNjcmVlbiwgTm9kZT4oKTtcbiAgICAgIHNjcmVlbkJ1dHRvbnMuZm9yRWFjaCggc2NyZWVuQnV0dG9uID0+IHtcbiAgICAgICAgc2NyZWVuQnV0dG9uTWFwLnNldCggc2NyZWVuQnV0dG9uLnNjcmVlbiwgbmV3IEFsaWduQm94KCBzY3JlZW5CdXR0b24sIHtcbiAgICAgICAgICBleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzOiB0cnVlLFxuICAgICAgICAgIGFsaWduQm91bmRzOiBuZXcgQm91bmRzMiggMCwgMCwgbWF4U2NyZWVuQnV0dG9uV2lkdGgsIG1heFNjcmVlbkJ1dHRvbkhlaWdodCApLFxuICAgICAgICAgIHZpc2libGVQcm9wZXJ0eTogc2NyZWVuQnV0dG9uLnZpc2libGVQcm9wZXJ0eVxuICAgICAgICB9ICkgKTtcbiAgICAgIH0gKTtcblxuICAgICAgLy8gUHV0IGFsbCBzY3JlZW4gYnV0dG9ucyB1bmRlciBhIHBhcmVudCwgdG8gc2ltcGxpZnkgbGF5b3V0XG4gICAgICBjb25zdCBzY3JlZW5CdXR0b25zQ29udGFpbmVyID0gbmV3IEhCb3goIHtcbiAgICAgICAgc3BhY2luZzogU0NSRUVOX0JVVFRPTl9TUEFDSU5HLFxuICAgICAgICBtYXhXaWR0aDogYXZhaWxhYmxlVG90YWwgLy8gaW4gY2FzZSB3ZSBoYXZlIHNvIG1hbnkgc2NyZWVucyB0aGF0IHRoZSBzY3JlZW4gYnV0dG9ucyBuZWVkIHRvIGJlIHNjYWxlZCBkb3duXG4gICAgICB9ICk7XG4gICAgICBidXR0b25zLmFkZENoaWxkKCBzY3JlZW5CdXR0b25zQ29udGFpbmVyICk7XG4gICAgICBzaW0uYWN0aXZlU2ltU2NyZWVuc1Byb3BlcnR5LmxpbmsoIHNpbVNjcmVlbnMgPT4ge1xuICAgICAgICBzY3JlZW5CdXR0b25zQ29udGFpbmVyLmNoaWxkcmVuID0gc2ltU2NyZWVucy5tYXAoIHNjcmVlbiA9PiBzY3JlZW5CdXR0b25NYXAuZ2V0KCBzY3JlZW4gKSEgKTtcbiAgICAgIH0gKTtcblxuICAgICAgLy8gU2NyZWVuIGJ1dHRvbnMgY2VudGVyZWQuICBUaGVzZSBidXR0b25zIGFyZSBjZW50ZXJlZCBhcm91bmQgdGhlIG9yaWdpbiBpbiB0aGUgc2NyZWVuQnV0dG9uc0NvbnRhaW5lciwgc28gdGhlXG4gICAgICAvLyBzY3JlZW5CdXR0b25zQ29udGFpbmVyIGNhbiBiZSBwdXQgYXQgdGhlIGNlbnRlciBvZiB0aGUgbmF2YmFyLlxuICAgICAgTWFudWFsQ29uc3RyYWludC5jcmVhdGUoIHRoaXMsIFsgdGhpcy5iYWNrZ3JvdW5kLCBzY3JlZW5CdXR0b25zQ29udGFpbmVyIF0sICggYmFja2dyb3VuZFByb3h5LCBzY3JlZW5CdXR0b25zQ29udGFpbmVyUHJveHkgKSA9PiB7XG4gICAgICAgIHNjcmVlbkJ1dHRvbnNDb250YWluZXJQcm94eS5jZW50ZXIgPSBiYWNrZ3JvdW5kUHJveHkuY2VudGVyO1xuICAgICAgfSApO1xuXG4gICAgICAvLyBob21lIGJ1dHRvbiB0byB0aGUgbGVmdCBvZiBzY3JlZW4gYnV0dG9uc1xuICAgICAgUmVsYXhlZE1hbnVhbENvbnN0cmFpbnQuY3JlYXRlKCB0aGlzLmJhckNvbnRlbnRzLCBbIHRoaXMuaG9tZUJ1dHRvbiwgLi4uc2NyZWVuQnV0dG9ucyBdLCAoIGhvbWVCdXR0b25Qcm94eSwgLi4uc2NyZWVuQnV0dG9uUHJveGllcyApID0+IHtcblxuICAgICAgICBjb25zdCB2aXNpYmxlU2NyZWVuQnV0dG9uUHJveGllcyA9IHNjcmVlbkJ1dHRvblByb3hpZXMuZmlsdGVyKCBwcm94eSA9PiBwcm94eSAmJiBwcm94eS52aXNpYmxlICk7XG5cbiAgICAgICAgLy8gRmluZCB0aGUgbGVmdC1tb3N0IHZpc2libGUgYnV0dG9uLiBXZSBkb24ndCB3YW50IHRoZSBleHRyYSBwYWRkaW5nIG9mIHRoZSBhbGlnbmJveCB0byBiZSBpbmNsdWRlZCBpbiB0aGlzIGNhbGN1bGF0aW9uLFxuICAgICAgICAvLyBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHksIHNvIGl0J3MgYSBsb3QgbW9yZSBjb21wbGljYXRlZC5cbiAgICAgICAgaWYgKCBob21lQnV0dG9uUHJveHkgJiYgdmlzaWJsZVNjcmVlbkJ1dHRvblByb3hpZXMubGVuZ3RoID4gMCApIHtcbiAgICAgICAgICBob21lQnV0dG9uUHJveHkucmlnaHQgPSBNYXRoLm1pbiggLi4udmlzaWJsZVNjcmVlbkJ1dHRvblByb3hpZXMubWFwKCBwcm94eSA9PiBwcm94eSEubGVmdCApICkgLSBIT01FX0JVVFRPTl9SSUdIVF9NQVJHSU47XG4gICAgICAgIH1cbiAgICAgIH0gKTtcblxuICAgICAgLy8gbWF4IHdpZHRoIHJlbGF0aXZlIHRvIHBvc2l0aW9uIG9mIGhvbWUgYnV0dG9uXG4gICAgICBNYW51YWxDb25zdHJhaW50LmNyZWF0ZSggdGhpcy5iYXJDb250ZW50cywgWyB0aGlzLmhvbWVCdXR0b24sIHRpdGxlVGV4dCBdLCAoIGhvbWVCdXR0b25Qcm94eSwgdGl0bGVUZXh0UHJveHkgKSA9PiB7XG4gICAgICAgIHRpdGxlVGV4dFByb3h5Lm1heFdpZHRoID0gaG9tZUJ1dHRvblByb3h5LmxlZnQgLSBUSVRMRV9MRUZUX01BUkdJTiAtIFRJVExFX1JJR0hUX01BUkdJTjtcbiAgICAgIH0gKTtcblxuICAgICAgc2ltLnNpbU5hbWVQcm9wZXJ0eS5saW5rKCBzaW1OYW1lID0+IHtcbiAgICAgICAgYWxsTmF2QmFyU2NyZWVuQnV0dG9ucy5mb3JFYWNoKCBzY3JlZW5CdXR0b24gPT4ge1xuICAgICAgICAgIHNjcmVlbkJ1dHRvbi52b2ljaW5nQ29udGV4dFJlc3BvbnNlID0gc2ltTmFtZTtcbiAgICAgICAgfSApO1xuICAgICAgfSApO1xuICAgIH1cblxuICAgIC8vIGluaXRpYWwgbGF5b3V0ICh0aGF0IGRvZXNuJ3QgbmVlZCB0byBjaGFuZ2Ugd2hlbiB3ZSBhcmUgcmUtbGFpZCBvdXQpXG4gICAgdGl0bGVUZXh0LmxlZnQgPSBUSVRMRV9MRUZUX01BUkdJTjtcbiAgICB0aXRsZVRleHQuY2VudGVyWSA9IE5BVklHQVRJT05fQkFSX1NJWkUuaGVpZ2h0IC8gMjtcbiAgICBwaGV0QnV0dG9uLmNlbnRlclkgPSBOQVZJR0FUSU9OX0JBUl9TSVpFLmhlaWdodCAvIDI7XG5cbiAgICBNYW51YWxDb25zdHJhaW50LmNyZWF0ZSggdGhpcywgWyB0aGlzLmJhY2tncm91bmQsIHBoZXRCdXR0b24gXSwgKCBiYWNrZ3JvdW5kUHJveHksIHBoZXRCdXR0b25Qcm94eSApID0+IHtcbiAgICAgIHBoZXRCdXR0b25Qcm94eS5yaWdodCA9IGJhY2tncm91bmRQcm94eS5yaWdodCAtIFBIRVRfQlVUVE9OX1JJR0hUX01BUkdJTjtcbiAgICB9ICk7XG5cbiAgICBNYW51YWxDb25zdHJhaW50LmNyZWF0ZSggdGhpcy5iYXJDb250ZW50cywgWyBwaGV0QnV0dG9uLCB0aGlzLmExMXlCdXR0b25zSEJveCBdLCAoIHBoZXRCdXR0b25Qcm94eSwgYTExeUJ1dHRvbnNIQm94UHJveHkgKSA9PiB7XG4gICAgICBhMTF5QnV0dG9uc0hCb3hQcm94eS5yaWdodCA9IHBoZXRCdXR0b25Qcm94eS5sZWZ0IC0gUEhFVF9CVVRUT05fTEVGVF9NQVJHSU47XG5cbiAgICAgIC8vIFRoZSBpY29uIGlzIHZlcnRpY2FsbHkgYWRqdXN0ZWQgaW4gS2V5Ym9hcmRIZWxwQnV0dG9uLCBzbyB0aGF0IHRoZSBjZW50ZXJzIGNhbiBiZSBhbGlnbmVkIGhlcmVcbiAgICAgIGExMXlCdXR0b25zSEJveFByb3h5LmNlbnRlclkgPSBwaGV0QnV0dG9uUHJveHkuY2VudGVyWTtcbiAgICB9ICk7XG5cbiAgICBpZiAoIHRoaXMubG9jYWxlTm9kZSApIHtcbiAgICAgIE1hbnVhbENvbnN0cmFpbnQuY3JlYXRlKCB0aGlzLmJhckNvbnRlbnRzLCBbIHBoZXRCdXR0b24sIHRoaXMuYTExeUJ1dHRvbnNIQm94LCB0aGlzLmxvY2FsZU5vZGUgXSwgKCBwaGV0QnV0dG9uUHJveHksIGExMXlCdXR0b25zSEJveFByb3h5LCBsb2NhbGVOb2RlUHJveHkgKSA9PiB7XG4gICAgICAgIGExMXlCdXR0b25zSEJveFByb3h5LnJpZ2h0ID0gcGhldEJ1dHRvblByb3h5LmxlZnQgLSBQSEVUX0JVVFRPTl9MRUZUX01BUkdJTjtcblxuICAgICAgICAvLyBUaGUgaWNvbiBpcyB2ZXJ0aWNhbGx5IGFkanVzdGVkIGluIEtleWJvYXJkSGVscEJ1dHRvbiwgc28gdGhhdCB0aGUgY2VudGVycyBjYW4gYmUgYWxpZ25lZCBoZXJlXG4gICAgICAgIGExMXlCdXR0b25zSEJveFByb3h5LmNlbnRlclkgPSBwaGV0QnV0dG9uUHJveHkuY2VudGVyWTtcblxuICAgICAgICBsb2NhbGVOb2RlUHJveHkuY2VudGVyWSA9IHBoZXRCdXR0b25Qcm94eS5jZW50ZXJZO1xuICAgICAgICBsb2NhbGVOb2RlUHJveHkucmlnaHQgPSBNYXRoLm1pbiggYTExeUJ1dHRvbnNIQm94UHJveHkubGVmdCwgcGhldEJ1dHRvblByb3h5LmxlZnQgKSAtIFBIRVRfQlVUVE9OX0xFRlRfTUFSR0lOO1xuICAgICAgfSApO1xuICAgIH1cblxuICAgIHRoaXMubGF5b3V0KCAxLCBOQVZJR0FUSU9OX0JBUl9TSVpFLndpZHRoLCBOQVZJR0FUSU9OX0JBUl9TSVpFLmhlaWdodCApO1xuXG4gICAgY29uc3Qgc2ltUmVzb3VyY2VzQ29udGFpbmVyID0gbmV3IE5vZGUoIHtcblxuICAgICAgLy8gcGRvbVxuICAgICAgdGFnTmFtZTogJ2RpdicsXG4gICAgICBjb250YWluZXJUYWdOYW1lOiAnc2VjdGlvbicsXG4gICAgICBsYWJlbFRhZ05hbWU6ICdoMicsXG4gICAgICBsYWJlbENvbnRlbnQ6IEpvaXN0U3RyaW5ncy5hMTF5LnNpbVJlc291cmNlc1N0cmluZ1Byb3BlcnR5LFxuICAgICAgcGRvbU9yZGVyOiBbXG4gICAgICAgIHRoaXMuYTExeUJ1dHRvbnNIQm94LFxuICAgICAgICBwaGV0QnV0dG9uXG4gICAgICBdLmZpbHRlciggbm9kZSA9PiBub2RlICE9PSB1bmRlZmluZWQgKVxuICAgIH0gKTtcblxuICAgIHNpbVJlc291cmNlc0NvbnRhaW5lci5hcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucyA9IFsge1xuICAgICAgdGhpc0VsZW1lbnROYW1lOiBQRE9NUGVlci5DT05UQUlORVJfUEFSRU5ULFxuICAgICAgb3RoZXJFbGVtZW50TmFtZTogUERPTVBlZXIuTEFCRUxfU0lCTElORyxcbiAgICAgIG90aGVyTm9kZTogc2ltUmVzb3VyY2VzQ29udGFpbmVyXG4gICAgfSBdO1xuICAgIHRoaXMuYWRkQ2hpbGQoIHNpbVJlc291cmNlc0NvbnRhaW5lciApO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBuYXZpZ2F0aW9uIGJhciBsYXlvdXQgbmVlZHMgdG8gYmUgdXBkYXRlZCwgdHlwaWNhbGx5IHdoZW4gdGhlIGJyb3dzZXIgd2luZG93IGlzIHJlc2l6ZWQuXG4gICAqL1xuICBwdWJsaWMgbGF5b3V0KCBzY2FsZTogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciApOiB2b2lkIHtcbiAgICAvLyByZXNpemUgdGhlIGJhY2tncm91bmRcbiAgICB0aGlzLmJhY2tncm91bmQucmVjdFdpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5iYWNrZ3JvdW5kLnJlY3RIZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAvLyBzY2FsZSB0aGUgZW50aXJlIGJhciBjb250ZW50c1xuICAgIHRoaXMuYmFyQ29udGVudHMuc2V0U2NhbGVNYWduaXR1ZGUoIHNjYWxlICk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE5BVklHQVRJT05fQkFSX1NJWkUgPSBOQVZJR0FUSU9OX0JBUl9TSVpFO1xufVxuXG5qb2lzdC5yZWdpc3RlciggJ05hdmlnYXRpb25CYXInLCBOYXZpZ2F0aW9uQmFyICk7XG5leHBvcnQgZGVmYXVsdCBOYXZpZ2F0aW9uQmFyOyJdLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJTdHJpbmdQcm9wZXJ0eSIsIkJvdW5kczIiLCJEaW1lbnNpb24yIiwiUGhldEZvbnQiLCJBbGlnbkJveCIsIkhCb3giLCJNYW51YWxDb25zdHJhaW50IiwiTm9kZSIsIlBET01QZWVyIiwiUmVjdGFuZ2xlIiwiUmVsYXhlZE1hbnVhbENvbnN0cmFpbnQiLCJUZXh0IiwiVGFuZGVtIiwiQTExeUJ1dHRvbnNIQm94IiwiSG9tZUJ1dHRvbiIsIkhvbWVTY3JlZW4iLCJIb21lU2NyZWVuVmlldyIsImpvaXN0IiwiSm9pc3RTdHJpbmdzIiwiTmF2aWdhdGlvbkJhclNjcmVlbkJ1dHRvbiIsIlBoZXRCdXR0b24iLCJOQVZJR0FUSU9OX0JBUl9TSVpFIiwiTEFZT1VUX0JPVU5EUyIsIndpZHRoIiwiVElUTEVfTEVGVF9NQVJHSU4iLCJUSVRMRV9SSUdIVF9NQVJHSU4iLCJQSEVUX0JVVFRPTl9MRUZUX01BUkdJTiIsIlBIRVRfQlVUVE9OX1JJR0hUX01BUkdJTiIsIkhPTUVfQlVUVE9OX0xFRlRfTUFSR0lOIiwiSE9NRV9CVVRUT05fUklHSFRfTUFSR0lOIiwiU0NSRUVOX0JVVFRPTl9TUEFDSU5HIiwiTUlOSU1VTV9TQ1JFRU5fQlVUVE9OX1dJRFRIIiwiTmF2aWdhdGlvbkJhciIsImxheW91dCIsInNjYWxlIiwiaGVpZ2h0IiwiYmFja2dyb3VuZCIsInJlY3RXaWR0aCIsInJlY3RIZWlnaHQiLCJiYXJDb250ZW50cyIsInNldFNjYWxlTWFnbml0dWRlIiwic2ltIiwidGFuZGVtIiwiaG9tZUJ1dHRvbiIsIm5hdmlnYXRpb25CYXJGaWxsUHJvcGVydHkiLCJzZWxlY3RlZFNjcmVlblByb3BlcnR5IiwibG9va0FuZEZlZWwiLCJzY3JlZW4iLCJzaW1OYXZpZ2F0aW9uQmFyRmlsbCIsInNob3dIb21lU2NyZWVuIiwiaG9tZVNjcmVlbiIsIkJBQ0tHUk9VTkRfQ09MT1IiLCJwaWNrYWJsZSIsImZpbGwiLCJhZGRDaGlsZCIsInRpdGxlVGV4dCIsImRpc3BsYXllZFNpbU5hbWVQcm9wZXJ0eSIsImZvbnQiLCJuYXZpZ2F0aW9uQmFyVGV4dEZpbGxQcm9wZXJ0eSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0ZlYXR1cmVkIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInZpc2libGVQcm9wZXJ0eU9wdGlvbnMiLCJzdHJpbmdQcm9wZXJ0eU9wdGlvbnMiLCJwaGV0aW9SZWFkT25seSIsInBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCIsInRpdGxlQ29udGFpbmVyTm9kZSIsImNoaWxkcmVuIiwidmlzaWJsZVByb3BlcnR5IiwicGhldEJ1dHRvbiIsImExMXlCdXR0b25zSEJveCIsImxvY2FsZU5vZGUiLCJhZGRBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uIiwidGhpc0VsZW1lbnROYW1lIiwiUFJJTUFSWV9TSUJMSU5HIiwib3RoZXJOb2RlIiwib3RoZXJFbGVtZW50TmFtZSIsIkxBQkVMX1NJQkxJTkciLCJidXR0b25zIiwiYTExeUJ1dHRvbnNXaWR0aCIsImJvdW5kcyIsImlzVmFsaWQiLCJzaW1TY3JlZW5zIiwibGVuZ3RoIiwibWF4V2lkdGgiLCJtYXhUaXRsZVdpZHRoIiwiTWF0aCIsIm1pbiIsImlzVXNlck5hdmlnYWJsZVByb3BlcnR5IiwiR0VORVJBTF9NT0RFTCIsInRhZ05hbWUiLCJjb250YWluZXJUYWdOYW1lIiwibGFiZWxUYWdOYW1lIiwibGFiZWxDb250ZW50IiwiYTExeSIsInNpbVNjcmVlbnNTdHJpbmdQcm9wZXJ0eSIsImFjdGl2ZVNpbVNjcmVlbnNQcm9wZXJ0eSIsInNjcmVlbnMiLCJpc1VzZXJOYXZpZ2FibGUiLCJhcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucyIsIkNPTlRBSU5FUl9QQVJFTlQiLCJwZG9tRGlzcGxheU5hbWVQcm9wZXJ0eSIsImxpc3RlbmVyIiwidmFsdWUiLCJjZW50ZXJZIiwiYXZhaWxhYmxlTGVmdCIsImF2YWlsYWJsZVJpZ2h0IiwiYXZhaWxhYmxlVG90YWwiLCJzY3JlZW5CdXR0b25XaWR0aCIsInNjcmVlbkJ1dHRvbnMiLCJtYXAiLCJpbmRleE9mIiwibWF4QnV0dG9uV2lkdGgiLCJzdXBwbGllZCIsIm5hbWUiLCJSRVFVSVJFRCIsImFsbE5hdkJhclNjcmVlbkJ1dHRvbnMiLCJtYXhTY3JlZW5CdXR0b25XaWR0aCIsIm1heCIsIl8iLCJtYXhCeSIsImJ1dHRvbiIsIm1heFNjcmVlbkJ1dHRvbkhlaWdodCIsInNjcmVlbkJ1dHRvbk1hcCIsIk1hcCIsImZvckVhY2giLCJzY3JlZW5CdXR0b24iLCJzZXQiLCJleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzIiwiYWxpZ25Cb3VuZHMiLCJzY3JlZW5CdXR0b25zQ29udGFpbmVyIiwic3BhY2luZyIsImxpbmsiLCJnZXQiLCJjcmVhdGUiLCJiYWNrZ3JvdW5kUHJveHkiLCJzY3JlZW5CdXR0b25zQ29udGFpbmVyUHJveHkiLCJjZW50ZXIiLCJob21lQnV0dG9uUHJveHkiLCJzY3JlZW5CdXR0b25Qcm94aWVzIiwidmlzaWJsZVNjcmVlbkJ1dHRvblByb3hpZXMiLCJmaWx0ZXIiLCJwcm94eSIsInZpc2libGUiLCJyaWdodCIsImxlZnQiLCJ0aXRsZVRleHRQcm94eSIsInNpbU5hbWVQcm9wZXJ0eSIsInNpbU5hbWUiLCJ2b2ljaW5nQ29udGV4dFJlc3BvbnNlIiwicGhldEJ1dHRvblByb3h5IiwiYTExeUJ1dHRvbnNIQm94UHJveHkiLCJsb2NhbGVOb2RlUHJveHkiLCJzaW1SZXNvdXJjZXNDb250YWluZXIiLCJzaW1SZXNvdXJjZXNTdHJpbmdQcm9wZXJ0eSIsInBkb21PcmRlciIsIm5vZGUiLCJ1bmRlZmluZWQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FxQkMsR0FFRCxPQUFPQSxxQkFBcUIsbUNBQW1DO0FBQy9ELE9BQU9DLHFCQUFxQixtQ0FBbUM7QUFFL0QsT0FBT0Msb0JBQW9CLGtDQUFrQztBQUM3RCxPQUFPQyxhQUFhLDBCQUEwQjtBQUM5QyxPQUFPQyxnQkFBZ0IsNkJBQTZCO0FBQ3BELE9BQU9DLGNBQWMsb0NBQW9DO0FBQ3pELFNBQVNDLFFBQVEsRUFBU0MsSUFBSSxFQUFFQyxnQkFBZ0IsRUFBRUMsSUFBSSxFQUFFQyxRQUFRLEVBQUVDLFNBQVMsRUFBRUMsdUJBQXVCLEVBQUVDLElBQUksUUFBUSw4QkFBOEI7QUFDaEosT0FBT0MsWUFBWSw0QkFBNEI7QUFDL0MsT0FBT0MscUJBQXFCLHVCQUF1QjtBQUNuRCxPQUFPQyxnQkFBZ0Isa0JBQWtCO0FBQ3pDLE9BQU9DLGdCQUFnQixrQkFBa0I7QUFDekMsT0FBT0Msb0JBQW9CLHNCQUFzQjtBQUNqRCxPQUFPQyxXQUFXLGFBQWE7QUFDL0IsT0FBT0Msa0JBQWtCLG9CQUFvQjtBQUM3QyxPQUFPQywrQkFBK0IsaUNBQWlDO0FBQ3ZFLE9BQU9DLGdCQUFnQixrQkFBa0I7QUFJekMsWUFBWTtBQUNaLDhEQUE4RDtBQUM5RCxJQUFJO0FBQ0osZ0RBQWdEO0FBQ2hELDhFQUE4RTtBQUM5RSx5Q0FBeUM7QUFDekMsNkZBQTZGO0FBQzdGLElBQUk7QUFDSixNQUFNQyxzQkFBc0IsSUFBSW5CLFdBQVljLGVBQWVNLGFBQWEsQ0FBQ0MsS0FBSyxFQUFFO0FBQ2hGLE1BQU1DLG9CQUFvQjtBQUMxQixNQUFNQyxxQkFBcUI7QUFDM0IsTUFBTUMsMEJBQTBCO0FBQ2hDLE1BQU1DLDJCQUEyQjtBQUNqQyxNQUFNQywwQkFBMEI7QUFDaEMsTUFBTUMsMkJBQTJCRDtBQUNqQyxNQUFNRSx3QkFBd0I7QUFDOUIsTUFBTUMsOEJBQThCLElBQUksbUdBQW1HO0FBRTNJLElBQUEsQUFBTUMsZ0JBQU4sTUFBTUEsc0JBQXNCekI7SUF5UjFCOztHQUVDLEdBQ0QsQUFBTzBCLE9BQVFDLEtBQWEsRUFBRVgsS0FBYSxFQUFFWSxNQUFjLEVBQVM7UUFDbEUsd0JBQXdCO1FBQ3hCLElBQUksQ0FBQ0MsVUFBVSxDQUFDQyxTQUFTLEdBQUdkO1FBQzVCLElBQUksQ0FBQ2EsVUFBVSxDQUFDRSxVQUFVLEdBQUdIO1FBRTdCLGdDQUFnQztRQUNoQyxJQUFJLENBQUNJLFdBQVcsQ0FBQ0MsaUJBQWlCLENBQUVOO0lBQ3RDO0lBM1JBLFlBQW9CTyxHQUFRLEVBQUVDLE1BQWMsQ0FBRztRQUU3QyxLQUFLLFNBSlVDLGFBQWdDLEtBQU0sNkJBQTZCOztRQU1sRiw0R0FBNEc7UUFDNUcsSUFBSSxDQUFDQyx5QkFBeUIsR0FBRyxJQUFJN0MsZ0JBQWlCO1lBQ3BEMEMsSUFBSUksc0JBQXNCO1lBQzFCSixJQUFJSyxXQUFXLENBQUNGLHlCQUF5QjtTQUMxQyxFQUFFLENBQUVHLFFBQVFDO1lBRVgsTUFBTUMsaUJBQWlCRixXQUFXTixJQUFJUyxVQUFVO1lBRWhELG9IQUFvSDtZQUNwSCxnSEFBZ0g7WUFDaEgseUdBQXlHO1lBQ3pHLE9BQU9ELGlCQUFpQmxDLFdBQVdvQyxnQkFBZ0IsR0FBR0g7UUFDeEQ7UUFFQSwyQ0FBMkM7UUFDM0MsSUFBSSxDQUFDWixVQUFVLEdBQUcsSUFBSTNCLFVBQVcsR0FBRyxHQUFHWSxvQkFBb0JFLEtBQUssRUFBRUYsb0JBQW9CYyxNQUFNLEVBQUU7WUFDNUZpQixVQUFVO1lBQ1ZDLE1BQU0sSUFBSSxDQUFDVCx5QkFBeUI7UUFDdEM7UUFDQSxJQUFJLENBQUNVLFFBQVEsQ0FBRSxJQUFJLENBQUNsQixVQUFVO1FBRTlCLGtGQUFrRjtRQUNsRixJQUFJLENBQUNHLFdBQVcsR0FBRyxJQUFJaEM7UUFDdkIsSUFBSSxDQUFDK0MsUUFBUSxDQUFFLElBQUksQ0FBQ2YsV0FBVztRQUUvQixNQUFNZ0IsWUFBWSxJQUFJNUMsS0FBTThCLElBQUllLHdCQUF3QixFQUFFO1lBQ3hEQyxNQUFNLElBQUl0RCxTQUFVO1lBQ3BCa0QsTUFBTVosSUFBSUssV0FBVyxDQUFDWSw2QkFBNkI7WUFDbkRoQixRQUFRQSxPQUFPaUIsWUFBWSxDQUFFO1lBQzdCQyxnQkFBZ0I7WUFDaEJDLHFCQUFxQjtZQUNyQkMsd0JBQXdCO2dCQUFFRixnQkFBZ0I7WUFBSztZQUMvQ0csdUJBQXVCO2dCQUFFQyxnQkFBZ0I7WUFBSztZQUM5Q0MsbUNBQW1DO1FBQ3JDO1FBRUEsMkZBQTJGO1FBQzNGLHNFQUFzRTtRQUN0RSxNQUFNQyxxQkFBcUIsSUFBSTNELEtBQU07WUFDbkM0RCxVQUFVO2dCQUFFWjthQUFXO1lBQ3ZCYSxpQkFBaUIsSUFBSXJFLGdCQUFpQjtnQkFBRTBDLElBQUlJLHNCQUFzQjthQUFFLEVBQUVFLENBQUFBLFNBQVVBLFdBQVdOLElBQUlTLFVBQVU7UUFDM0c7UUFDQSxJQUFJLENBQUNYLFdBQVcsQ0FBQ2UsUUFBUSxDQUFFWTtRQUUzQixxRUFBcUU7UUFDckUsTUFBTUcsYUFBYSxJQUFJakQsV0FDckJxQixLQUNBLElBQUksQ0FBQ0cseUJBQXlCLEVBQzlCRixPQUFPaUIsWUFBWSxDQUFFO1FBRXZCLElBQUksQ0FBQ3BCLFdBQVcsQ0FBQ2UsUUFBUSxDQUFFZTtRQUUzQiwyRUFBMkU7UUFDM0UsSUFBSSxDQUFDQyxlQUFlLEdBQUcsSUFBSXpELGdCQUN6QjRCLEtBQ0EsSUFBSSxDQUFDRyx5QkFBeUIsRUFBRTtZQUM5QkYsUUFBUUEsT0FBTyxtRkFBbUY7UUFDcEc7UUFFRixJQUFJLENBQUNILFdBQVcsQ0FBQ2UsUUFBUSxDQUFFLElBQUksQ0FBQ2dCLGVBQWU7UUFDL0MsSUFBSSxDQUFDQyxVQUFVLElBQUksSUFBSSxDQUFDaEMsV0FBVyxDQUFDZSxRQUFRLENBQUUsSUFBSSxDQUFDaUIsVUFBVTtRQUU3RCwwRUFBMEU7UUFDMUUsSUFBSSxDQUFDQyw0QkFBNEIsQ0FBRTtZQUNqQ0MsaUJBQWlCakUsU0FBU2tFLGVBQWU7WUFDekNDLFdBQVcsSUFBSTtZQUNmQyxrQkFBa0JwRSxTQUFTcUUsYUFBYTtRQUMxQztRQUVBLElBQUlDO1FBRUosTUFBTUMsbUJBQXFCLElBQUksQ0FBQ1QsZUFBZSxDQUFDVSxNQUFNLENBQUNDLE9BQU8sS0FBSyxJQUFJLENBQUNYLGVBQWUsQ0FBQy9DLEtBQUssR0FBRztRQUVoRyxvREFBb0Q7UUFDcEQsSUFBS2tCLElBQUl5QyxVQUFVLENBQUNDLE1BQU0sS0FBSyxHQUFJO1lBRWpDLHFCQUFxQixHQUVyQiw0REFBNEQ7WUFDNUQ1QixVQUFVNkIsUUFBUSxHQUFHcEUsZUFBZU0sYUFBYSxDQUFDQyxLQUFLLEdBQUdDLG9CQUFvQkMscUJBQ3pEQywwQkFBMEJxRCxtQkFBcUIsQ0FBQSxJQUFJLENBQUNSLFVBQVUsR0FBRyxJQUFJLENBQUNBLFVBQVUsQ0FBQ2hELEtBQUssR0FBRyxDQUFBLElBQU1HLDBCQUMvRjJDLFdBQVc5QyxLQUFLLEdBQUdJO1FBQzFDLE9BQ0s7WUFFSCxvQkFBb0IsR0FFcEIsNEZBQTRGO1lBQzVGLE1BQU0wRCxnQkFBZ0JDLEtBQUtDLEdBQUcsQ0FBRWhDLFVBQVVoQyxLQUFLLEVBQUUsT0FBT1AsZUFBZU0sYUFBYSxDQUFDQyxLQUFLO1lBRTFGLE1BQU1pRSwwQkFBMEIsSUFBSTFGLGdCQUFpQixNQUFNO2dCQUN6RDRDLFFBQVE5QixPQUFPNkUsYUFBYSxDQUFDOUIsWUFBWSxDQUFFLFdBQVlBLFlBQVksQ0FBRTtnQkFDckVDLGdCQUFnQjtnQkFDaEJDLHFCQUFxQjtZQUN2QjtZQUVBLGtFQUFrRTtZQUNsRWlCLFVBQVUsSUFBSXZFLEtBQU07Z0JBQ2xCbUYsU0FBUztnQkFDVEMsa0JBQWtCO2dCQUNsQkMsY0FBYztnQkFDZEMsY0FBYzNFLGFBQWE0RSxJQUFJLENBQUNDLHdCQUF3QjtnQkFDeEQzQixpQkFBaUIsSUFBSXJFLGdCQUFpQjtvQkFBRTBDLElBQUl1RCx3QkFBd0I7b0JBQUV2RCxJQUFJSSxzQkFBc0I7b0JBQUUyQztpQkFBeUIsRUFBRSxDQUFFUyxTQUFTbEQsUUFBUW1EO29CQUM5SSxPQUFPbkQsV0FBV04sSUFBSVMsVUFBVSxJQUFJK0MsUUFBUWQsTUFBTSxHQUFHLEtBQUtlO2dCQUM1RDtZQUNGO1lBRUFwQixRQUFRcUIsMEJBQTBCLEdBQUc7Z0JBQUU7b0JBQ3JDMUIsaUJBQWlCakUsU0FBUzRGLGdCQUFnQjtvQkFDMUN4QixrQkFBa0JwRSxTQUFTcUUsYUFBYTtvQkFDeENGLFdBQVdHO2dCQUNiO2FBQUc7WUFDSCxJQUFJLENBQUN2QyxXQUFXLENBQUNlLFFBQVEsQ0FBRXdCO1lBRTNCLHlCQUF5QjtZQUN6QixJQUFJLENBQUNuQyxVQUFVLEdBQUcsSUFBSTdCLFdBQ3BCTyxvQkFBb0JjLE1BQU0sRUFDMUJNLElBQUlLLFdBQVcsQ0FBQ0YseUJBQXlCLEVBQ3pDSCxJQUFJUyxVQUFVLEdBQUdULElBQUlTLFVBQVUsQ0FBQ21ELHVCQUF1QixHQUFHLElBQUlyRyxlQUFnQixtQkFBb0I7Z0JBQ2hHc0csVUFBVTtvQkFDUjdELElBQUlJLHNCQUFzQixDQUFDMEQsS0FBSyxHQUFHOUQsSUFBSVMsVUFBVTtnQkFDbkQ7Z0JBQ0FSLFFBQVFBLE9BQU9pQixZQUFZLENBQUU7Z0JBQzdCNkMsU0FBU25GLG9CQUFvQmMsTUFBTSxHQUFHO1lBQ3hDO1lBRUYseURBQXlEO1lBQ3pETSxJQUFJUyxVQUFVLElBQUk0QixRQUFReEIsUUFBUSxDQUFFLElBQUksQ0FBQ1gsVUFBVTtZQUVuRDs7O09BR0MsR0FDRCxpQ0FBaUM7WUFDakMsTUFBTThELGdCQUFnQixBQUFFekYsZUFBZU0sYUFBYSxDQUFDQyxLQUFLLEdBQUcsSUFBTUMsb0JBQW9CNkQsZ0JBQWdCNUQscUJBQ2pGRywwQkFBMEIsSUFBSSxDQUFDZSxVQUFVLENBQUNwQixLQUFLLEdBQUdNO1lBRXhFLGtDQUFrQztZQUNsQyxNQUFNNkUsaUJBQWlCLEFBQUUxRixlQUFlTSxhQUFhLENBQUNDLEtBQUssR0FBRyxJQUFNRywwQkFDN0NxRCxtQkFBcUIsQ0FBQSxJQUFJLENBQUNSLFVBQVUsR0FBRyxJQUFJLENBQUNBLFVBQVUsQ0FBQ2hELEtBQUssR0FBRyxDQUFBLElBQU1HLDBCQUEwQjJDLFdBQVc5QyxLQUFLLEdBQy9HSTtZQUV2QixzRUFBc0U7WUFDdEUsTUFBTWdGLGlCQUFpQixJQUFJckIsS0FBS0MsR0FBRyxDQUFFa0IsZUFBZUM7WUFFcEQsMEJBQTBCO1lBQzFCLE1BQU1FLG9CQUFvQixBQUFFRCxDQUFBQSxpQkFBaUIsQUFBRWxFLENBQUFBLElBQUl5QyxVQUFVLENBQUNDLE1BQU0sR0FBRyxDQUFBLElBQU1yRCxxQkFBb0IsSUFBTVcsSUFBSXlDLFVBQVUsQ0FBQ0MsTUFBTTtZQUU1SCw0QkFBNEI7WUFDNUIsTUFBTTBCLGdCQUFnQnBFLElBQUl5QyxVQUFVLENBQUM0QixHQUFHLENBQUUvRCxDQUFBQTtnQkFDeEMsT0FBTyxJQUFJNUIsMEJBQ1RzQixJQUFJSyxXQUFXLENBQUNGLHlCQUF5QixFQUN6Q0gsSUFBSUksc0JBQXNCLEVBQzFCRSxRQUNBTixJQUFJeUMsVUFBVSxDQUFDNkIsT0FBTyxDQUFFaEUsU0FDeEIxQixvQkFBb0JjLE1BQU0sRUFBRTtvQkFDMUI2RSxnQkFBZ0JKO29CQUNoQmxFLFFBQVFLLE9BQU9MLE1BQU0sQ0FBQ3VFLFFBQVEsR0FBR3ZFLE9BQU9pQixZQUFZLENBQUUsR0FBR1osT0FBT0wsTUFBTSxDQUFDd0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFLdEcsT0FBT3VHLFFBQVE7Z0JBQ3pHO1lBQ0o7WUFDQSxNQUFNQyx5QkFBeUI7Z0JBQUUsSUFBSSxDQUFDekUsVUFBVTttQkFBS2tFO2FBQWU7WUFFcEUsb0ZBQW9GO1lBQ3BGLG1HQUFtRztZQUNuRyxNQUFNUSx1QkFBdUIvQixLQUFLZ0MsR0FBRyxDQUFFdkYsNkJBQTZCd0YsRUFBRUMsS0FBSyxDQUFFWCxlQUFlWSxDQUFBQTtnQkFDMUYsT0FBT0EsT0FBT2xHLEtBQUs7WUFDckIsR0FBS0EsS0FBSztZQUNWLE1BQU1tRyx3QkFBd0JILEVBQUVDLEtBQUssQ0FBRVgsZUFBZVksQ0FBQUEsU0FBVUEsT0FBT3RGLE1BQU0sRUFBSUEsTUFBTTtZQUV2RixNQUFNd0Ysa0JBQWtCLElBQUlDO1lBQzVCZixjQUFjZ0IsT0FBTyxDQUFFQyxDQUFBQTtnQkFDckJILGdCQUFnQkksR0FBRyxDQUFFRCxhQUFhL0UsTUFBTSxFQUFFLElBQUkzQyxTQUFVMEgsY0FBYztvQkFDcEVFLG9DQUFvQztvQkFDcENDLGFBQWEsSUFBSWhJLFFBQVMsR0FBRyxHQUFHb0gsc0JBQXNCSztvQkFDdER0RCxpQkFBaUIwRCxhQUFhMUQsZUFBZTtnQkFDL0M7WUFDRjtZQUVBLDREQUE0RDtZQUM1RCxNQUFNOEQseUJBQXlCLElBQUk3SCxLQUFNO2dCQUN2QzhILFNBQVNyRztnQkFDVHNELFVBQVV1QixlQUFlLGlGQUFpRjtZQUM1RztZQUNBN0IsUUFBUXhCLFFBQVEsQ0FBRTRFO1lBQ2xCekYsSUFBSXVELHdCQUF3QixDQUFDb0MsSUFBSSxDQUFFbEQsQ0FBQUE7Z0JBQ2pDZ0QsdUJBQXVCL0QsUUFBUSxHQUFHZSxXQUFXNEIsR0FBRyxDQUFFL0QsQ0FBQUEsU0FBVTRFLGdCQUFnQlUsR0FBRyxDQUFFdEY7WUFDbkY7WUFFQSwrR0FBK0c7WUFDL0csaUVBQWlFO1lBQ2pFekMsaUJBQWlCZ0ksTUFBTSxDQUFFLElBQUksRUFBRTtnQkFBRSxJQUFJLENBQUNsRyxVQUFVO2dCQUFFOEY7YUFBd0IsRUFBRSxDQUFFSyxpQkFBaUJDO2dCQUM3RkEsNEJBQTRCQyxNQUFNLEdBQUdGLGdCQUFnQkUsTUFBTTtZQUM3RDtZQUVBLDRDQUE0QztZQUM1Qy9ILHdCQUF3QjRILE1BQU0sQ0FBRSxJQUFJLENBQUMvRixXQUFXLEVBQUU7Z0JBQUUsSUFBSSxDQUFDSSxVQUFVO21CQUFLa0U7YUFBZSxFQUFFLENBQUU2QixpQkFBaUIsR0FBR0M7Z0JBRTdHLE1BQU1DLDZCQUE2QkQsb0JBQW9CRSxNQUFNLENBQUVDLENBQUFBLFFBQVNBLFNBQVNBLE1BQU1DLE9BQU87Z0JBRTlGLHlIQUF5SDtnQkFDekgsK0RBQStEO2dCQUMvRCxJQUFLTCxtQkFBbUJFLDJCQUEyQnpELE1BQU0sR0FBRyxHQUFJO29CQUM5RHVELGdCQUFnQk0sS0FBSyxHQUFHMUQsS0FBS0MsR0FBRyxJQUFLcUQsMkJBQTJCOUIsR0FBRyxDQUFFZ0MsQ0FBQUEsUUFBU0EsTUFBT0csSUFBSSxLQUFPcEg7Z0JBQ2xHO1lBQ0Y7WUFFQSxnREFBZ0Q7WUFDaER2QixpQkFBaUJnSSxNQUFNLENBQUUsSUFBSSxDQUFDL0YsV0FBVyxFQUFFO2dCQUFFLElBQUksQ0FBQ0ksVUFBVTtnQkFBRVk7YUFBVyxFQUFFLENBQUVtRixpQkFBaUJRO2dCQUM1RkEsZUFBZTlELFFBQVEsR0FBR3NELGdCQUFnQk8sSUFBSSxHQUFHekgsb0JBQW9CQztZQUN2RTtZQUVBZ0IsSUFBSTBHLGVBQWUsQ0FBQ2YsSUFBSSxDQUFFZ0IsQ0FBQUE7Z0JBQ3hCaEMsdUJBQXVCUyxPQUFPLENBQUVDLENBQUFBO29CQUM5QkEsYUFBYXVCLHNCQUFzQixHQUFHRDtnQkFDeEM7WUFDRjtRQUNGO1FBRUEsdUVBQXVFO1FBQ3ZFN0YsVUFBVTBGLElBQUksR0FBR3pIO1FBQ2pCK0IsVUFBVWlELE9BQU8sR0FBR25GLG9CQUFvQmMsTUFBTSxHQUFHO1FBQ2pEa0MsV0FBV21DLE9BQU8sR0FBR25GLG9CQUFvQmMsTUFBTSxHQUFHO1FBRWxEN0IsaUJBQWlCZ0ksTUFBTSxDQUFFLElBQUksRUFBRTtZQUFFLElBQUksQ0FBQ2xHLFVBQVU7WUFBRWlDO1NBQVksRUFBRSxDQUFFa0UsaUJBQWlCZTtZQUNqRkEsZ0JBQWdCTixLQUFLLEdBQUdULGdCQUFnQlMsS0FBSyxHQUFHckg7UUFDbEQ7UUFFQXJCLGlCQUFpQmdJLE1BQU0sQ0FBRSxJQUFJLENBQUMvRixXQUFXLEVBQUU7WUFBRThCO1lBQVksSUFBSSxDQUFDQyxlQUFlO1NBQUUsRUFBRSxDQUFFZ0YsaUJBQWlCQztZQUNsR0EscUJBQXFCUCxLQUFLLEdBQUdNLGdCQUFnQkwsSUFBSSxHQUFHdkg7WUFFcEQsaUdBQWlHO1lBQ2pHNkgscUJBQXFCL0MsT0FBTyxHQUFHOEMsZ0JBQWdCOUMsT0FBTztRQUN4RDtRQUVBLElBQUssSUFBSSxDQUFDakMsVUFBVSxFQUFHO1lBQ3JCakUsaUJBQWlCZ0ksTUFBTSxDQUFFLElBQUksQ0FBQy9GLFdBQVcsRUFBRTtnQkFBRThCO2dCQUFZLElBQUksQ0FBQ0MsZUFBZTtnQkFBRSxJQUFJLENBQUNDLFVBQVU7YUFBRSxFQUFFLENBQUUrRSxpQkFBaUJDLHNCQUFzQkM7Z0JBQ3pJRCxxQkFBcUJQLEtBQUssR0FBR00sZ0JBQWdCTCxJQUFJLEdBQUd2SDtnQkFFcEQsaUdBQWlHO2dCQUNqRzZILHFCQUFxQi9DLE9BQU8sR0FBRzhDLGdCQUFnQjlDLE9BQU87Z0JBRXREZ0QsZ0JBQWdCaEQsT0FBTyxHQUFHOEMsZ0JBQWdCOUMsT0FBTztnQkFDakRnRCxnQkFBZ0JSLEtBQUssR0FBRzFELEtBQUtDLEdBQUcsQ0FBRWdFLHFCQUFxQk4sSUFBSSxFQUFFSyxnQkFBZ0JMLElBQUksSUFBS3ZIO1lBQ3hGO1FBQ0Y7UUFFQSxJQUFJLENBQUNPLE1BQU0sQ0FBRSxHQUFHWixvQkFBb0JFLEtBQUssRUFBRUYsb0JBQW9CYyxNQUFNO1FBRXJFLE1BQU1zSCx3QkFBd0IsSUFBSWxKLEtBQU07WUFFdEMsT0FBTztZQUNQbUYsU0FBUztZQUNUQyxrQkFBa0I7WUFDbEJDLGNBQWM7WUFDZEMsY0FBYzNFLGFBQWE0RSxJQUFJLENBQUM0RCwwQkFBMEI7WUFDMURDLFdBQVc7Z0JBQ1QsSUFBSSxDQUFDckYsZUFBZTtnQkFDcEJEO2FBQ0QsQ0FBQ3dFLE1BQU0sQ0FBRWUsQ0FBQUEsT0FBUUEsU0FBU0M7UUFDN0I7UUFFQUosc0JBQXNCdEQsMEJBQTBCLEdBQUc7WUFBRTtnQkFDbkQxQixpQkFBaUJqRSxTQUFTNEYsZ0JBQWdCO2dCQUMxQ3hCLGtCQUFrQnBFLFNBQVNxRSxhQUFhO2dCQUN4Q0YsV0FBVzhFO1lBQ2I7U0FBRztRQUNILElBQUksQ0FBQ25HLFFBQVEsQ0FBRW1HO0lBQ2pCO0FBZUY7QUF0U016SCxjQXFTbUJYLHNCQUFzQkE7QUFHL0NKLE1BQU02SSxRQUFRLENBQUUsaUJBQWlCOUg7QUFDakMsZUFBZUEsY0FBYyJ9