// Copyright 2013-2024, University of Colorado Boulder
/**
 * The button that pops up the PhET menu, which appears in the bottom right of the home screen and on the right side
 * of the navbar.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import Multilink from '../../axon/js/Multilink.js';
import { AriaHasPopUpMutator, Color, Image, Line, Node } from '../../scenery/js/imports.js';
import sharedSoundPlayers from '../../tambo/js/sharedSoundPlayers.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import joist from './joist.js';
import JoistButton from './JoistButton.js';
import JoistStrings from './JoistStrings.js';
import KebabMenuIcon from './KebabMenuIcon.js';
import PhetMenu from './PhetMenu.js';
import updateCheck from './updateCheck.js';
import UpdateState from './UpdateState.js';
// Accommodate logos of any height by scaling them down proportionately.
// The primary logo is 108px high and we have been scaling it at 0.28 to make it look good even on higher resolution
// displays.  The logo will be scaled up to 108px high so the rest of the layout code will work smoothly
// Scale to the same height as the PhET logo, so that layout code works correctly.
// height of the PhET logo, brand/phet/images/logo.png or brand/adapted-from-phet/images/logo.png
const PHET_LOGO_HEIGHT = 108;
const PHET_LOGO_SCALE = 0.28; // scale applied to the PhET logo
let PhetButton = class PhetButton extends JoistButton {
    constructor(sim, backgroundFillProperty, tandem){
        // Dynamic modules are loaded in simLauncher and accessed through their namespace
        const Brand = phet.brand.Brand;
        assert && assert(Brand, 'Brand should exist by now');
        // The logo images are loaded from the brand which is selected via query parameter (during unbuilt mode)
        // or a grunt option (during the build), please see initialize-globals.js window.phet.chipper.brand for more
        // details
        const logoOnBlackBackground = Brand.logoOnBlackBackground;
        const logoOnWhiteBackground = Brand.logoOnWhiteBackground;
        // PhET logo
        const logoImage = new Image(logoOnBlackBackground, {
            scale: PHET_LOGO_SCALE / logoOnBlackBackground.height * PHET_LOGO_HEIGHT * 0.85,
            pickable: false
        });
        // The menu icon, to the right of the logo
        const menuIcon = new KebabMenuIcon({
            scale: 0.83,
            left: logoImage.width + 8,
            bottom: logoImage.bottom - 0.5,
            pickable: false
        });
        // Assert here means that ?ea was provided (potentially from the wrapper) AND that there are actually assertions
        // available for debugging.
        const children = assert && Tandem.PHET_IO_ENABLED ? [
            // The underline in phet-io debug mode. "7" is the right distance to avoid hiding the trademark.
            new Line(0, 0, logoImage.width - 7, 0, {
                stroke: 'red',
                lineWidth: 3,
                left: logoImage.left,
                bottom: logoImage.bottom
            }),
            logoImage,
            menuIcon
        ] : [
            logoImage,
            menuIcon
        ];
        // The icon combines the PhET logo and the menu icon
        const icon = new Node({
            children: children
        });
        // Get the shared sound player.
        const pushButtonSoundPlayer = sharedSoundPlayers.get('pushButton');
        super(icon, backgroundFillProperty, {
            highlightExtensionWidth: 6,
            highlightExtensionHeight: 5,
            highlightCenterOffsetY: 4,
            listener: ()=>{
                phetMenu.show();
                phetMenu.items[0].focus();
                pushButtonSoundPlayer.play();
            },
            tandem: tandem,
            phetioType: PhetButton.PhetButtonIO,
            phetioDocumentation: 'The button that appears at the right side of the navigation bar, which shows a menu when pressed',
            // This is the primary way to prevent learners from accessing the PhET menu in PhET-iO, so feature it.
            enabledPropertyOptions: {
                phetioFeatured: true,
                phetioDocumentation: 'When disabled, the (three dots) are hidden and the button cannot be pressed, hiding the PhET menu.'
            },
            phetioVisiblePropertyInstrumented: false,
            // pdom
            innerContent: JoistStrings.a11y.phetMenuStringProperty,
            // voicing
            voicingNameResponse: JoistStrings.a11y.phetMenuStringProperty
        });
        const phetMenu = new PhetMenu(sim, {
            tandem: tandem.createTandem('phetMenu'),
            focusOnHideNode: this
        });
        // Sim.js handles scaling the popup menu.  This code sets the position of the popup menu.
        // sim.bounds are null on init, but we will get the callback when it is sized for the first time
        // Does not need to be unlinked or disposed because PhetButton persists for the lifetime of the sim
        Multilink.multilink([
            sim.boundsProperty,
            sim.screenBoundsProperty,
            sim.scaleProperty,
            phetMenu.localBoundsProperty
        ], (bounds, screenBounds, scale)=>{
            if (bounds && screenBounds && scale) {
                phetMenu.setScaleMagnitude(scale);
                phetMenu.right = bounds.right - 2;
                const navBarHeight = bounds.height - screenBounds.height;
                phetMenu.bottom = screenBounds.bottom + navBarHeight / 2;
            }
        });
        // No need to unlink, as the PhetButton exists for the lifetime of the sim
        Multilink.multilink([
            backgroundFillProperty,
            sim.selectedScreenProperty,
            updateCheck.stateProperty
        ], (backgroundFill, screen, updateState)=>{
            const showHomeScreen = screen === sim.homeScreen;
            const backgroundIsWhite = !backgroundFill.equals(Color.BLACK) && !showHomeScreen;
            const outOfDate = updateState === UpdateState.OUT_OF_DATE;
            menuIcon.fill = backgroundIsWhite ? outOfDate ? '#0a0' : '#222' : outOfDate ? '#3F3' : 'white';
            logoImage.image = backgroundIsWhite ? logoOnWhiteBackground : logoOnBlackBackground;
        });
        // Added for phet-io, when toggling enabled, hide the option dots to prevent the cueing.
        // No need to be removed because the PhetButton exists for the lifetime of the sim.
        this.buttonModel.enabledProperty.link((enabled)=>{
            menuIcon.visible = enabled;
        });
        // pdom - add an attribute that lets the user know the button opens a menu
        AriaHasPopUpMutator.mutateNode(this, true);
    }
};
/**
   * PhET-iO Type for PhetButton, to interface with PhET-iO API.  The PhetButtonIO acts as the main phet-io branding/logo in
   * the sim. It doesn't inherit from NodeIO because we neither need all of NodeIO's API methods, nor do we want to
   * support maintaining overriding no-ops in this file see https://github.com/phetsims/scenery/issues/711 for more info.
   */ PhetButton.PhetButtonIO = new IOType('PhetButtonIO', {
    valueType: PhetButton,
    documentation: 'The PhET Button in the bottom right of the screen'
});
joist.register('PhetButton', PhetButton);
export default PhetButton;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL1BoZXRCdXR0b24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGhlIGJ1dHRvbiB0aGF0IHBvcHMgdXAgdGhlIFBoRVQgbWVudSwgd2hpY2ggYXBwZWFycyBpbiB0aGUgYm90dG9tIHJpZ2h0IG9mIHRoZSBob21lIHNjcmVlbiBhbmQgb24gdGhlIHJpZ2h0IHNpZGVcbiAqIG9mIHRoZSBuYXZiYXIuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBUQnJhbmQgZnJvbSAnLi4vLi4vYnJhbmQvanMvVEJyYW5kLmpzJztcbmltcG9ydCB7IEFyaWFIYXNQb3BVcE11dGF0b3IsIENvbG9yLCBJbWFnZSwgTGluZSwgTm9kZSB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgc2hhcmVkU291bmRQbGF5ZXJzIGZyb20gJy4uLy4uL3RhbWJvL2pzL3NoYXJlZFNvdW5kUGxheWVycy5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcbmltcG9ydCBqb2lzdCBmcm9tICcuL2pvaXN0LmpzJztcbmltcG9ydCBKb2lzdEJ1dHRvbiBmcm9tICcuL0pvaXN0QnV0dG9uLmpzJztcbmltcG9ydCBKb2lzdFN0cmluZ3MgZnJvbSAnLi9Kb2lzdFN0cmluZ3MuanMnO1xuaW1wb3J0IEtlYmFiTWVudUljb24gZnJvbSAnLi9LZWJhYk1lbnVJY29uLmpzJztcbmltcG9ydCBQaGV0TWVudSBmcm9tICcuL1BoZXRNZW51LmpzJztcbmltcG9ydCBTaW0gZnJvbSAnLi9TaW0uanMnO1xuaW1wb3J0IHVwZGF0ZUNoZWNrIGZyb20gJy4vdXBkYXRlQ2hlY2suanMnO1xuaW1wb3J0IFVwZGF0ZVN0YXRlIGZyb20gJy4vVXBkYXRlU3RhdGUuanMnO1xuXG4vLyBBY2NvbW1vZGF0ZSBsb2dvcyBvZiBhbnkgaGVpZ2h0IGJ5IHNjYWxpbmcgdGhlbSBkb3duIHByb3BvcnRpb25hdGVseS5cbi8vIFRoZSBwcmltYXJ5IGxvZ28gaXMgMTA4cHggaGlnaCBhbmQgd2UgaGF2ZSBiZWVuIHNjYWxpbmcgaXQgYXQgMC4yOCB0byBtYWtlIGl0IGxvb2sgZ29vZCBldmVuIG9uIGhpZ2hlciByZXNvbHV0aW9uXG4vLyBkaXNwbGF5cy4gIFRoZSBsb2dvIHdpbGwgYmUgc2NhbGVkIHVwIHRvIDEwOHB4IGhpZ2ggc28gdGhlIHJlc3Qgb2YgdGhlIGxheW91dCBjb2RlIHdpbGwgd29yayBzbW9vdGhseVxuLy8gU2NhbGUgdG8gdGhlIHNhbWUgaGVpZ2h0IGFzIHRoZSBQaEVUIGxvZ28sIHNvIHRoYXQgbGF5b3V0IGNvZGUgd29ya3MgY29ycmVjdGx5LlxuLy8gaGVpZ2h0IG9mIHRoZSBQaEVUIGxvZ28sIGJyYW5kL3BoZXQvaW1hZ2VzL2xvZ28ucG5nIG9yIGJyYW5kL2FkYXB0ZWQtZnJvbS1waGV0L2ltYWdlcy9sb2dvLnBuZ1xuY29uc3QgUEhFVF9MT0dPX0hFSUdIVCA9IDEwODtcbmNvbnN0IFBIRVRfTE9HT19TQ0FMRSA9IDAuMjg7IC8vIHNjYWxlIGFwcGxpZWQgdG8gdGhlIFBoRVQgbG9nb1xuXG5jbGFzcyBQaGV0QnV0dG9uIGV4dGVuZHMgSm9pc3RCdXR0b24ge1xuICAvKipcbiAgICogUGhFVC1pTyBUeXBlIGZvciBQaGV0QnV0dG9uLCB0byBpbnRlcmZhY2Ugd2l0aCBQaEVULWlPIEFQSS4gIFRoZSBQaGV0QnV0dG9uSU8gYWN0cyBhcyB0aGUgbWFpbiBwaGV0LWlvIGJyYW5kaW5nL2xvZ28gaW5cbiAgICogdGhlIHNpbS4gSXQgZG9lc24ndCBpbmhlcml0IGZyb20gTm9kZUlPIGJlY2F1c2Ugd2UgbmVpdGhlciBuZWVkIGFsbCBvZiBOb2RlSU8ncyBBUEkgbWV0aG9kcywgbm9yIGRvIHdlIHdhbnQgdG9cbiAgICogc3VwcG9ydCBtYWludGFpbmluZyBvdmVycmlkaW5nIG5vLW9wcyBpbiB0aGlzIGZpbGUgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy83MTEgZm9yIG1vcmUgaW5mby5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgUGhldEJ1dHRvbklPID0gbmV3IElPVHlwZSggJ1BoZXRCdXR0b25JTycsIHtcbiAgICB2YWx1ZVR5cGU6IFBoZXRCdXR0b24sXG4gICAgZG9jdW1lbnRhdGlvbjogJ1RoZSBQaEVUIEJ1dHRvbiBpbiB0aGUgYm90dG9tIHJpZ2h0IG9mIHRoZSBzY3JlZW4nXG4gIH0gKTtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHNpbTogU2ltLCBiYWNrZ3JvdW5kRmlsbFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxDb2xvcj4sIHRhbmRlbTogVGFuZGVtICkge1xuXG4gICAgLy8gRHluYW1pYyBtb2R1bGVzIGFyZSBsb2FkZWQgaW4gc2ltTGF1bmNoZXIgYW5kIGFjY2Vzc2VkIHRocm91Z2ggdGhlaXIgbmFtZXNwYWNlXG4gICAgY29uc3QgQnJhbmQ6IFRCcmFuZCA9IHBoZXQuYnJhbmQuQnJhbmQ7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQnJhbmQsICdCcmFuZCBzaG91bGQgZXhpc3QgYnkgbm93JyApO1xuXG4gICAgLy8gVGhlIGxvZ28gaW1hZ2VzIGFyZSBsb2FkZWQgZnJvbSB0aGUgYnJhbmQgd2hpY2ggaXMgc2VsZWN0ZWQgdmlhIHF1ZXJ5IHBhcmFtZXRlciAoZHVyaW5nIHVuYnVpbHQgbW9kZSlcbiAgICAvLyBvciBhIGdydW50IG9wdGlvbiAoZHVyaW5nIHRoZSBidWlsZCksIHBsZWFzZSBzZWUgaW5pdGlhbGl6ZS1nbG9iYWxzLmpzIHdpbmRvdy5waGV0LmNoaXBwZXIuYnJhbmQgZm9yIG1vcmVcbiAgICAvLyBkZXRhaWxzXG4gICAgY29uc3QgbG9nb09uQmxhY2tCYWNrZ3JvdW5kID0gQnJhbmQubG9nb09uQmxhY2tCYWNrZ3JvdW5kO1xuICAgIGNvbnN0IGxvZ29PbldoaXRlQmFja2dyb3VuZCA9IEJyYW5kLmxvZ29PbldoaXRlQmFja2dyb3VuZDtcblxuICAgIC8vIFBoRVQgbG9nb1xuICAgIGNvbnN0IGxvZ29JbWFnZSA9IG5ldyBJbWFnZSggbG9nb09uQmxhY2tCYWNrZ3JvdW5kLCB7XG4gICAgICBzY2FsZTogUEhFVF9MT0dPX1NDQUxFIC8gbG9nb09uQmxhY2tCYWNrZ3JvdW5kLmhlaWdodCAqIFBIRVRfTE9HT19IRUlHSFQgKiAwLjg1LFxuICAgICAgcGlja2FibGU6IGZhbHNlXG4gICAgfSApO1xuXG4gICAgLy8gVGhlIG1lbnUgaWNvbiwgdG8gdGhlIHJpZ2h0IG9mIHRoZSBsb2dvXG4gICAgY29uc3QgbWVudUljb24gPSBuZXcgS2ViYWJNZW51SWNvbigge1xuICAgICAgc2NhbGU6IDAuODMsXG4gICAgICBsZWZ0OiBsb2dvSW1hZ2Uud2lkdGggKyA4LFxuICAgICAgYm90dG9tOiBsb2dvSW1hZ2UuYm90dG9tIC0gMC41LFxuICAgICAgcGlja2FibGU6IGZhbHNlXG4gICAgfSApO1xuXG4gICAgLy8gQXNzZXJ0IGhlcmUgbWVhbnMgdGhhdCA/ZWEgd2FzIHByb3ZpZGVkIChwb3RlbnRpYWxseSBmcm9tIHRoZSB3cmFwcGVyKSBBTkQgdGhhdCB0aGVyZSBhcmUgYWN0dWFsbHkgYXNzZXJ0aW9uc1xuICAgIC8vIGF2YWlsYWJsZSBmb3IgZGVidWdnaW5nLlxuICAgIGNvbnN0IGNoaWxkcmVuID0gYXNzZXJ0ICYmIFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgP1xuICAgICAgW1xuXG4gICAgICAgIC8vIFRoZSB1bmRlcmxpbmUgaW4gcGhldC1pbyBkZWJ1ZyBtb2RlLiBcIjdcIiBpcyB0aGUgcmlnaHQgZGlzdGFuY2UgdG8gYXZvaWQgaGlkaW5nIHRoZSB0cmFkZW1hcmsuXG4gICAgICAgIG5ldyBMaW5lKCAwLCAwLCBsb2dvSW1hZ2Uud2lkdGggLSA3LCAwLCB7XG4gICAgICAgICAgc3Ryb2tlOiAncmVkJywgbGluZVdpZHRoOiAzLFxuICAgICAgICAgIGxlZnQ6IGxvZ29JbWFnZS5sZWZ0LFxuICAgICAgICAgIGJvdHRvbTogbG9nb0ltYWdlLmJvdHRvbVxuICAgICAgICB9ICksIGxvZ29JbWFnZSwgbWVudUljb24gXSA6XG4gICAgICBbIGxvZ29JbWFnZSwgbWVudUljb24gXTtcblxuICAgIC8vIFRoZSBpY29uIGNvbWJpbmVzIHRoZSBQaEVUIGxvZ28gYW5kIHRoZSBtZW51IGljb25cbiAgICBjb25zdCBpY29uID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IGNoaWxkcmVuIH0gKTtcblxuICAgIC8vIEdldCB0aGUgc2hhcmVkIHNvdW5kIHBsYXllci5cbiAgICBjb25zdCBwdXNoQnV0dG9uU291bmRQbGF5ZXIgPSBzaGFyZWRTb3VuZFBsYXllcnMuZ2V0KCAncHVzaEJ1dHRvbicgKTtcblxuICAgIHN1cGVyKCBpY29uLCBiYWNrZ3JvdW5kRmlsbFByb3BlcnR5LCB7XG4gICAgICBoaWdobGlnaHRFeHRlbnNpb25XaWR0aDogNixcbiAgICAgIGhpZ2hsaWdodEV4dGVuc2lvbkhlaWdodDogNSxcbiAgICAgIGhpZ2hsaWdodENlbnRlck9mZnNldFk6IDQsXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xuICAgICAgICBwaGV0TWVudS5zaG93KCk7XG4gICAgICAgIHBoZXRNZW51Lml0ZW1zWyAwIF0uZm9jdXMoKTtcbiAgICAgICAgcHVzaEJ1dHRvblNvdW5kUGxheWVyLnBsYXkoKTtcbiAgICAgIH0sXG5cbiAgICAgIHRhbmRlbTogdGFuZGVtLFxuICAgICAgcGhldGlvVHlwZTogUGhldEJ1dHRvbi5QaGV0QnV0dG9uSU8sXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVGhlIGJ1dHRvbiB0aGF0IGFwcGVhcnMgYXQgdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIG5hdmlnYXRpb24gYmFyLCB3aGljaCBzaG93cyBhIG1lbnUgd2hlbiBwcmVzc2VkJyxcblxuICAgICAgLy8gVGhpcyBpcyB0aGUgcHJpbWFyeSB3YXkgdG8gcHJldmVudCBsZWFybmVycyBmcm9tIGFjY2Vzc2luZyB0aGUgUGhFVCBtZW51IGluIFBoRVQtaU8sIHNvIGZlYXR1cmUgaXQuXG4gICAgICBlbmFibGVkUHJvcGVydHlPcHRpb25zOiB7XG4gICAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlLFxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnV2hlbiBkaXNhYmxlZCwgdGhlICh0aHJlZSBkb3RzKSBhcmUgaGlkZGVuIGFuZCB0aGUgYnV0dG9uIGNhbm5vdCBiZSBwcmVzc2VkLCBoaWRpbmcgdGhlIFBoRVQgbWVudS4nXG4gICAgICB9LFxuXG4gICAgICBwaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQ6IGZhbHNlLCAvLyBUaGlzIGJ1dHRvbiBpcyBvdXIgYnJhbmRpbmcsIGRvbid0IGV2ZXIgaGlkZSBpdC5cblxuICAgICAgLy8gcGRvbVxuICAgICAgaW5uZXJDb250ZW50OiBKb2lzdFN0cmluZ3MuYTExeS5waGV0TWVudVN0cmluZ1Byb3BlcnR5LFxuXG4gICAgICAvLyB2b2ljaW5nXG4gICAgICB2b2ljaW5nTmFtZVJlc3BvbnNlOiBKb2lzdFN0cmluZ3MuYTExeS5waGV0TWVudVN0cmluZ1Byb3BlcnR5XG4gICAgfSApO1xuXG4gICAgY29uc3QgcGhldE1lbnUgPSBuZXcgUGhldE1lbnUoIHNpbSwge1xuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncGhldE1lbnUnICksXG4gICAgICBmb2N1c09uSGlkZU5vZGU6IHRoaXNcbiAgICB9ICk7XG5cbiAgICAvLyBTaW0uanMgaGFuZGxlcyBzY2FsaW5nIHRoZSBwb3B1cCBtZW51LiAgVGhpcyBjb2RlIHNldHMgdGhlIHBvc2l0aW9uIG9mIHRoZSBwb3B1cCBtZW51LlxuICAgIC8vIHNpbS5ib3VuZHMgYXJlIG51bGwgb24gaW5pdCwgYnV0IHdlIHdpbGwgZ2V0IHRoZSBjYWxsYmFjayB3aGVuIGl0IGlzIHNpemVkIGZvciB0aGUgZmlyc3QgdGltZVxuICAgIC8vIERvZXMgbm90IG5lZWQgdG8gYmUgdW5saW5rZWQgb3IgZGlzcG9zZWQgYmVjYXVzZSBQaGV0QnV0dG9uIHBlcnNpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbVxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFsgc2ltLmJvdW5kc1Byb3BlcnR5LCBzaW0uc2NyZWVuQm91bmRzUHJvcGVydHksIHNpbS5zY2FsZVByb3BlcnR5LCBwaGV0TWVudS5sb2NhbEJvdW5kc1Byb3BlcnR5IF0sXG4gICAgICAoIGJvdW5kcywgc2NyZWVuQm91bmRzLCBzY2FsZSApID0+IHtcbiAgICAgICAgaWYgKCBib3VuZHMgJiYgc2NyZWVuQm91bmRzICYmIHNjYWxlICkge1xuICAgICAgICAgIHBoZXRNZW51LnNldFNjYWxlTWFnbml0dWRlKCBzY2FsZSApO1xuICAgICAgICAgIHBoZXRNZW51LnJpZ2h0ID0gYm91bmRzLnJpZ2h0IC0gMjtcbiAgICAgICAgICBjb25zdCBuYXZCYXJIZWlnaHQgPSBib3VuZHMuaGVpZ2h0IC0gc2NyZWVuQm91bmRzLmhlaWdodDtcbiAgICAgICAgICBwaGV0TWVudS5ib3R0b20gPSBzY3JlZW5Cb3VuZHMuYm90dG9tICsgbmF2QmFySGVpZ2h0IC8gMjtcbiAgICAgICAgfVxuICAgICAgfSApO1xuXG5cbiAgICAvLyBObyBuZWVkIHRvIHVubGluaywgYXMgdGhlIFBoZXRCdXR0b24gZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbVxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFsgYmFja2dyb3VuZEZpbGxQcm9wZXJ0eSwgc2ltLnNlbGVjdGVkU2NyZWVuUHJvcGVydHksIHVwZGF0ZUNoZWNrLnN0YXRlUHJvcGVydHkgXSxcbiAgICAgICggYmFja2dyb3VuZEZpbGwsIHNjcmVlbiwgdXBkYXRlU3RhdGUgKSA9PiB7XG4gICAgICAgIGNvbnN0IHNob3dIb21lU2NyZWVuID0gc2NyZWVuID09PSBzaW0uaG9tZVNjcmVlbjtcbiAgICAgICAgY29uc3QgYmFja2dyb3VuZElzV2hpdGUgPSAhYmFja2dyb3VuZEZpbGwuZXF1YWxzKCBDb2xvci5CTEFDSyApICYmICFzaG93SG9tZVNjcmVlbjtcblxuICAgICAgICBjb25zdCBvdXRPZkRhdGUgPSB1cGRhdGVTdGF0ZSA9PT0gVXBkYXRlU3RhdGUuT1VUX09GX0RBVEU7XG4gICAgICAgIG1lbnVJY29uLmZpbGwgPSBiYWNrZ3JvdW5kSXNXaGl0ZSA/ICggb3V0T2ZEYXRlID8gJyMwYTAnIDogJyMyMjInICkgOiAoIG91dE9mRGF0ZSA/ICcjM0YzJyA6ICd3aGl0ZScgKTtcbiAgICAgICAgbG9nb0ltYWdlLmltYWdlID0gYmFja2dyb3VuZElzV2hpdGUgPyBsb2dvT25XaGl0ZUJhY2tncm91bmQgOiBsb2dvT25CbGFja0JhY2tncm91bmQ7XG4gICAgICB9ICk7XG5cbiAgICAvLyBBZGRlZCBmb3IgcGhldC1pbywgd2hlbiB0b2dnbGluZyBlbmFibGVkLCBoaWRlIHRoZSBvcHRpb24gZG90cyB0byBwcmV2ZW50IHRoZSBjdWVpbmcuXG4gICAgLy8gTm8gbmVlZCB0byBiZSByZW1vdmVkIGJlY2F1c2UgdGhlIFBoZXRCdXR0b24gZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbS5cbiAgICB0aGlzLmJ1dHRvbk1vZGVsLmVuYWJsZWRQcm9wZXJ0eS5saW5rKCBlbmFibGVkID0+IHsgbWVudUljb24udmlzaWJsZSA9IGVuYWJsZWQ7IH0gKTtcblxuICAgIC8vIHBkb20gLSBhZGQgYW4gYXR0cmlidXRlIHRoYXQgbGV0cyB0aGUgdXNlciBrbm93IHRoZSBidXR0b24gb3BlbnMgYSBtZW51XG4gICAgQXJpYUhhc1BvcFVwTXV0YXRvci5tdXRhdGVOb2RlKCB0aGlzLCB0cnVlICk7XG4gIH1cbn1cblxuam9pc3QucmVnaXN0ZXIoICdQaGV0QnV0dG9uJywgUGhldEJ1dHRvbiApO1xuZXhwb3J0IGRlZmF1bHQgUGhldEJ1dHRvbjsiXSwibmFtZXMiOlsiTXVsdGlsaW5rIiwiQXJpYUhhc1BvcFVwTXV0YXRvciIsIkNvbG9yIiwiSW1hZ2UiLCJMaW5lIiwiTm9kZSIsInNoYXJlZFNvdW5kUGxheWVycyIsIlRhbmRlbSIsIklPVHlwZSIsImpvaXN0IiwiSm9pc3RCdXR0b24iLCJKb2lzdFN0cmluZ3MiLCJLZWJhYk1lbnVJY29uIiwiUGhldE1lbnUiLCJ1cGRhdGVDaGVjayIsIlVwZGF0ZVN0YXRlIiwiUEhFVF9MT0dPX0hFSUdIVCIsIlBIRVRfTE9HT19TQ0FMRSIsIlBoZXRCdXR0b24iLCJzaW0iLCJiYWNrZ3JvdW5kRmlsbFByb3BlcnR5IiwidGFuZGVtIiwiQnJhbmQiLCJwaGV0IiwiYnJhbmQiLCJhc3NlcnQiLCJsb2dvT25CbGFja0JhY2tncm91bmQiLCJsb2dvT25XaGl0ZUJhY2tncm91bmQiLCJsb2dvSW1hZ2UiLCJzY2FsZSIsImhlaWdodCIsInBpY2thYmxlIiwibWVudUljb24iLCJsZWZ0Iiwid2lkdGgiLCJib3R0b20iLCJjaGlsZHJlbiIsIlBIRVRfSU9fRU5BQkxFRCIsInN0cm9rZSIsImxpbmVXaWR0aCIsImljb24iLCJwdXNoQnV0dG9uU291bmRQbGF5ZXIiLCJnZXQiLCJoaWdobGlnaHRFeHRlbnNpb25XaWR0aCIsImhpZ2hsaWdodEV4dGVuc2lvbkhlaWdodCIsImhpZ2hsaWdodENlbnRlck9mZnNldFkiLCJsaXN0ZW5lciIsInBoZXRNZW51Iiwic2hvdyIsIml0ZW1zIiwiZm9jdXMiLCJwbGF5IiwicGhldGlvVHlwZSIsIlBoZXRCdXR0b25JTyIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJlbmFibGVkUHJvcGVydHlPcHRpb25zIiwicGhldGlvRmVhdHVyZWQiLCJwaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJpbm5lckNvbnRlbnQiLCJhMTF5IiwicGhldE1lbnVTdHJpbmdQcm9wZXJ0eSIsInZvaWNpbmdOYW1lUmVzcG9uc2UiLCJjcmVhdGVUYW5kZW0iLCJmb2N1c09uSGlkZU5vZGUiLCJtdWx0aWxpbmsiLCJib3VuZHNQcm9wZXJ0eSIsInNjcmVlbkJvdW5kc1Byb3BlcnR5Iiwic2NhbGVQcm9wZXJ0eSIsImxvY2FsQm91bmRzUHJvcGVydHkiLCJib3VuZHMiLCJzY3JlZW5Cb3VuZHMiLCJzZXRTY2FsZU1hZ25pdHVkZSIsInJpZ2h0IiwibmF2QmFySGVpZ2h0Iiwic2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eSIsInN0YXRlUHJvcGVydHkiLCJiYWNrZ3JvdW5kRmlsbCIsInNjcmVlbiIsInVwZGF0ZVN0YXRlIiwic2hvd0hvbWVTY3JlZW4iLCJob21lU2NyZWVuIiwiYmFja2dyb3VuZElzV2hpdGUiLCJlcXVhbHMiLCJCTEFDSyIsIm91dE9mRGF0ZSIsIk9VVF9PRl9EQVRFIiwiZmlsbCIsImltYWdlIiwiYnV0dG9uTW9kZWwiLCJlbmFibGVkUHJvcGVydHkiLCJsaW5rIiwiZW5hYmxlZCIsInZpc2libGUiLCJtdXRhdGVOb2RlIiwidmFsdWVUeXBlIiwiZG9jdW1lbnRhdGlvbiIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBRUQsT0FBT0EsZUFBZSw2QkFBNkI7QUFHbkQsU0FBU0MsbUJBQW1CLEVBQUVDLEtBQUssRUFBRUMsS0FBSyxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSw4QkFBOEI7QUFDNUYsT0FBT0Msd0JBQXdCLHVDQUF1QztBQUN0RSxPQUFPQyxZQUFZLDRCQUE0QjtBQUMvQyxPQUFPQyxZQUFZLGtDQUFrQztBQUNyRCxPQUFPQyxXQUFXLGFBQWE7QUFD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