// Copyright 2013-2024, University of Colorado Boulder
/**
 * The 'PhET' menu, which appears in the bottom-right of the home screen and the navigation bar, with options like
 * "PhET Website", "Settings", etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import DerivedProperty from '../../axon/js/DerivedProperty.js';
import TinyProperty from '../../axon/js/TinyProperty.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import platform from '../../phet-core/js/platform.js';
import stripEmbeddingMarks from '../../phet-core/js/stripEmbeddingMarks.js';
import { FullScreen, HSeparator, KeyboardListener, Node, openPopup, Path, PDOMUtils, VBox } from '../../scenery/js/imports.js';
import Dialog from '../../sun/js/Dialog.js';
import MenuItem from '../../sun/js/MenuItem.js';
import Popupable from '../../sun/js/Popupable.js';
import PhetioCapsule from '../../tandem/js/PhetioCapsule.js';
import IOType from '../../tandem/js/types/IOType.js';
import AboutDialog from './AboutDialog.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';
import ScreenshotGenerator from './ScreenshotGenerator.js';
import updateCheck from './updateCheck.js';
import UpdateDialog from './UpdateDialog.js';
import UpdateState from './UpdateState.js';
let PhetMenu = class PhetMenu extends Popupable(Node, 0) {
    /**
   * (joist-internal)
   */ dispose() {
        this.disposePhetMenu();
        _.each(this.items, (item)=>item.dispose());
        super.dispose();
    }
    constructor(sim, providedOptions){
        // Only show certain features for PhET Sims, such as links to our website
        const isPhETBrand = phet.chipper.brand === 'phet';
        const isApp = phet.chipper.isApp;
        const options = optionize()({
            phetioType: PhetMenu.PhetMenuIO,
            phetioState: false,
            phetioDocumentation: 'This menu is displayed when the PhET button is pressed.',
            phetioVisiblePropertyInstrumented: false,
            // pdom, tagName and role for content in the menu
            tagName: 'ul',
            ariaRole: 'menu'
        }, providedOptions);
        super(options);
        // AboutDialog is created lazily (so that Sim bounds are valid), then reused.
        // Since AboutDialog is instrumented for PhET-iO, this lazy creation requires use of PhetioCapsule.
        const aboutDialogCapsule = new PhetioCapsule((tandem)=>{
            return new AboutDialog(sim.simNameProperty, sim.version, sim.credits, {
                tandem: tandem,
                focusOnHideNode: this.focusOnHideNode
            });
        }, [], {
            tandem: options.tandem.createTandem('aboutDialogCapsule'),
            phetioType: PhetioCapsule.PhetioCapsuleIO(Dialog.DialogIO),
            disposeOnClear: false
        });
        // Update dialog is created lazily (so that Sim bounds are valid), then reused.
        let updateDialog = null;
        /*
     * Description of the items in the menu. See Menu Item for a list of properties for each itemDescriptor
     */ const itemDescriptors = [
            {
                textStringProperty: JoistStrings.menuItem.phetWebsiteStringProperty,
                present: isPhETBrand,
                shouldBeHiddenWhenLinksAreNotAllowed: true,
                callback: ()=>{
                    // Open locale-specific PhET home page. If there is no website translation for locale, fallback will be handled by server. See joist#97.
                    openPopup(`https://phet.colorado.edu/${sim.locale}`);
                }
            },
            {
                textStringProperty: JoistStrings.menuItem.reportAProblemStringProperty,
                present: isPhETBrand && !isApp,
                shouldBeHiddenWhenLinksAreNotAllowed: true,
                callback: ()=>{
                    const url = `${'https://phet.colorado.edu/files/troubleshooting/' + '?sim='}${encodeURIComponent(sim.simNameProperty.value)}&version=${encodeURIComponent(`${sim.version} ${phet.chipper.buildTimestamp ? phet.chipper.buildTimestamp : '(unbuilt)'}`)}&url=${encodeURIComponent(window.location.href)}&dependencies=${encodeURIComponent(JSON.stringify({}))}`;
                    openPopup(url);
                }
            },
            {
                textStringProperty: new TinyProperty('QR code'),
                present: phet.chipper.queryParameters.qrCode,
                shouldBeHiddenWhenLinksAreNotAllowed: true,
                callback: ()=>{
                    openPopup(`http://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(window.location.href)}&size=220x220&margin=0`);
                }
            },
            {
                textStringProperty: JoistStrings.menuItem.getUpdateStringProperty,
                present: updateCheck.areUpdatesChecked,
                shouldBeHiddenWhenLinksAreNotAllowed: true,
                callback: ()=>{
                    if (!updateDialog) {
                        updateDialog = new UpdateDialog({
                            focusOnHideNode: this.focusOnHideNode
                        });
                    }
                    updateDialog.show();
                },
                options: {
                    textFill: new DerivedProperty([
                        updateCheck.stateProperty
                    ], (state)=>{
                        return state === UpdateState.OUT_OF_DATE ? '#0a0' : '#000';
                    })
                }
            },
            // "Screenshot" Menu item
            {
                textStringProperty: JoistStrings.menuItem.screenshotStringProperty,
                present: !isApp && !phet.chipper.isFuzzEnabled(),
                shouldBeHiddenWhenLinksAreNotAllowed: false,
                callback: ()=>{
                    const dataURL = ScreenshotGenerator.generateScreenshot(sim);
                    // if we have FileSaver support
                    if (window.Blob && !!new window.Blob()) {
                        // construct a blob out of it
                        const requiredPrefix = 'data:image/png;base64,';
                        assert && assert(dataURL.startsWith(requiredPrefix));
                        const dataBase64 = dataURL.slice(requiredPrefix.length);
                        const byteChars = window.atob(dataBase64);
                        const byteArray = new window.Uint8Array(byteChars.length);
                        for(let i = 0; i < byteArray.length; i++){
                            byteArray[i] = byteChars.charCodeAt(i); // need check to make sure this cast doesn't give problems?
                        }
                        const blob = new window.Blob([
                            byteArray
                        ], {
                            type: 'image/png'
                        });
                        // our preferred filename
                        const filename = `${stripEmbeddingMarks(sim.simNameProperty.value)} screenshot.png`;
                        if (!phet.chipper.isFuzzEnabled()) {
                            // @ts-expect-error when typescript knows anything about window. . ..
                            window.saveAs(blob, filename);
                        }
                    } else {
                        openPopup(dataURL, true);
                    }
                },
                options: {
                    tandem: options.tandem.createTandem('screenshotMenuItem'),
                    phetioDocumentation: 'This menu item captures a screenshot from the simulation and saves it to the file system.',
                    visiblePropertyOptions: {
                        phetioFeatured: true
                    }
                }
            },
            // "Full Screen" menu item
            {
                textStringProperty: JoistStrings.menuItem.fullscreenStringProperty,
                present: FullScreen.isFullScreenEnabled() && !isApp && !platform.mobileSafari && !phet.chipper.queryParameters.preventFullScreen,
                shouldBeHiddenWhenLinksAreNotAllowed: false,
                callback: ()=>{
                    if (!phet.chipper.isFuzzEnabled()) {
                        FullScreen.toggleFullScreen(sim.display);
                    }
                },
                options: {
                    checkedProperty: FullScreen.isFullScreenProperty,
                    tandem: options.tandem.createTandem('fullScreenMenuItem'),
                    phetioDocumentation: 'This menu item requests full-screen access for the simulation display.',
                    visiblePropertyOptions: {
                        phetioFeatured: true
                    }
                }
            },
            // About dialog button
            {
                textStringProperty: JoistStrings.menuItem.aboutStringProperty,
                present: true,
                shouldBeHiddenWhenLinksAreNotAllowed: false,
                callback: ()=>aboutDialogCapsule.getElement().show(),
                options: {
                    separatorBefore: isPhETBrand,
                    // phet-io
                    tandem: options.tandem.createTandem('aboutMenuItem'),
                    phetioDocumentation: 'This menu item shows a dialog with information about the simulation.',
                    visiblePropertyOptions: {
                        phetioFeatured: true
                    }
                }
            }
        ];
        const keepItemDescriptors = itemDescriptors.filter((itemDescriptor)=>{
            // If there is a tandem, then we need to create the MenuItem to have a consistent API.
            return itemDescriptor.present || itemDescriptor.options && itemDescriptor.options.tandem;
        });
        // Create the menu items.
        const unfilteredItems = keepItemDescriptors.map((itemDescriptor)=>{
            return new MenuItem(()=>this.hide(), itemDescriptor.textStringProperty, itemDescriptor.callback, itemDescriptor.present, itemDescriptor.shouldBeHiddenWhenLinksAreNotAllowed, itemDescriptor.options);
        });
        const items = unfilteredItems.filter((item)=>item.present);
        // Some items that aren't present were created just to maintain a consistent PhET-iO API across all
        // runtimes, we can ignore those now.
        this.items = items;
        const content = new VBox({
            stretch: true,
            spacing: 2,
            children: _.flatten(items.map((item)=>{
                return item.separatorBefore ? [
                    new HSeparator({
                        stroke: 'gray'
                    }),
                    item
                ] : [
                    item
                ];
            }))
        });
        // Create a comic-book-style bubble.
        const X_MARGIN = 5;
        const Y_MARGIN = 5;
        const bubble = new Path(null, {
            fill: 'white',
            stroke: 'black'
        });
        content.localBoundsProperty.link(()=>{
            content.left = X_MARGIN;
            content.top = Y_MARGIN;
        });
        content.boundsProperty.link((bounds)=>{
            bubble.shape = createBubbleShape(bounds.width + 2 * X_MARGIN, bounds.height + 2 * Y_MARGIN);
        });
        this.addChild(bubble);
        this.addChild(content);
        // pdom - handles navigation of items and closing with escape
        const keyboardListener = new KeyboardListener({
            keys: [
                'escape',
                'arrowDown',
                'arrowUp',
                'tab',
                'shift+tab'
            ],
            fire: (event, keysPressed)=>{
                const firstItem = this.items[0];
                const lastItem = this.items[this.items.length - 1];
                if (event) {
                    // this attempts to prevent the screen reader's virtual cursor from also moving with the arrow keys
                    event.preventDefault();
                }
                if (keysPressed === 'arrowDown') {
                    // On down arrow, focus next item in the list, or wrap up to the first item if focus is at the end
                    const nextFocusable = lastItem.focused ? firstItem : PDOMUtils.getNextFocusable();
                    nextFocusable.focus();
                } else if (keysPressed === 'arrowUp') {
                    // On up arrow, focus previous item in the list, or wrap back to the last item if focus is on first item
                    const previousFocusable = firstItem.focused ? lastItem : PDOMUtils.getPreviousFocusable();
                    previousFocusable.focus();
                } else if (keysPressed === 'escape' || keysPressed === 'tab' || keysPressed === 'shift+tab') {
                    // On escape or tab, close the menu and restore focus to the element that had focus before the menu was
                    // opened.
                    this.hide();
                }
            }
        });
        this.addInputListener(keyboardListener);
        this.disposePhetMenu = ()=>{
            this.removeInputListener(keyboardListener);
            keyboardListener.dispose();
        };
    }
};
PhetMenu.PhetMenuIO = new IOType('PhetMenuIO', {
    valueType: PhetMenu,
    documentation: 'The PhET Menu in the bottom right of the screen'
});
const createBubbleShape = (width, height)=>{
    const tail = new Shape().moveTo(width - 20, height).lineToRelative(0, 20).lineToRelative(-20, -20).close();
    return Shape.roundRect(0, 0, width, height, 8, 8).shapeUnion(tail);
};
joist.register('PhetMenu', PhetMenu);
export default PhetMenu;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL1BoZXRNZW51LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRoZSAnUGhFVCcgbWVudSwgd2hpY2ggYXBwZWFycyBpbiB0aGUgYm90dG9tLXJpZ2h0IG9mIHRoZSBob21lIHNjcmVlbiBhbmQgdGhlIG5hdmlnYXRpb24gYmFyLCB3aXRoIG9wdGlvbnMgbGlrZVxuICogXCJQaEVUIFdlYnNpdGVcIiwgXCJTZXR0aW5nc1wiLCBldGMuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcbmltcG9ydCBUaW55UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UaW55UHJvcGVydHkuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgcGxhdGZvcm0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3BsYXRmb3JtLmpzJztcbmltcG9ydCBzdHJpcEVtYmVkZGluZ01hcmtzIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9zdHJpcEVtYmVkZGluZ01hcmtzLmpzJztcbmltcG9ydCBXaXRoUmVxdWlyZWQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1dpdGhSZXF1aXJlZC5qcyc7XG5pbXBvcnQgeyBGdWxsU2NyZWVuLCBIU2VwYXJhdG9yLCBLZXlib2FyZExpc3RlbmVyLCBOb2RlLCBOb2RlT3B0aW9ucywgb3BlblBvcHVwLCBQYXRoLCBQRE9NVXRpbHMsIFZCb3ggfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IERpYWxvZyBmcm9tICcuLi8uLi9zdW4vanMvRGlhbG9nLmpzJztcbmltcG9ydCBNZW51SXRlbSwgeyBNZW51SXRlbU9wdGlvbnMgfSBmcm9tICcuLi8uLi9zdW4vanMvTWVudUl0ZW0uanMnO1xuaW1wb3J0IFBvcHVwYWJsZSwgeyBQb3B1cGFibGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vc3VuL2pzL1BvcHVwYWJsZS5qcyc7XG5pbXBvcnQgUGhldGlvQ2Fwc3VsZSBmcm9tICcuLi8uLi90YW5kZW0vanMvUGhldGlvQ2Fwc3VsZS5qcyc7XG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xuaW1wb3J0IEFib3V0RGlhbG9nIGZyb20gJy4vQWJvdXREaWFsb2cuanMnO1xuaW1wb3J0IGpvaXN0IGZyb20gJy4vam9pc3QuanMnO1xuaW1wb3J0IEpvaXN0U3RyaW5ncyBmcm9tICcuL0pvaXN0U3RyaW5ncy5qcyc7XG5pbXBvcnQgU2NyZWVuc2hvdEdlbmVyYXRvciBmcm9tICcuL1NjcmVlbnNob3RHZW5lcmF0b3IuanMnO1xuaW1wb3J0IFNpbSBmcm9tICcuL1NpbS5qcyc7XG5pbXBvcnQgdXBkYXRlQ2hlY2sgZnJvbSAnLi91cGRhdGVDaGVjay5qcyc7XG5pbXBvcnQgVXBkYXRlRGlhbG9nIGZyb20gJy4vVXBkYXRlRGlhbG9nLmpzJztcbmltcG9ydCBVcGRhdGVTdGF0ZSBmcm9tICcuL1VwZGF0ZVN0YXRlLmpzJztcblxudHlwZSBNZW51SXRlbURlc2NyaXB0b3IgPSB7XG4gIHRleHRTdHJpbmdQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPjtcbiAgcHJlc2VudDogYm9vbGVhbjtcbiAgc2hvdWxkQmVIaWRkZW5XaGVuTGlua3NBcmVOb3RBbGxvd2VkOiBib29sZWFuO1xuICBjYWxsYmFjazogKCkgPT4gdm9pZDtcbiAgc2VwYXJhdG9yQmVmb3JlPzogYm9vbGVhbjtcbiAgb3B0aW9ucz86IE1lbnVJdGVtT3B0aW9ucztcbn07XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xuXG50eXBlIFBhcmVudE9wdGlvbnMgPSBQb3B1cGFibGVPcHRpb25zICYgV2l0aFJlcXVpcmVkPE5vZGVPcHRpb25zLCAndGFuZGVtJz47XG50eXBlIFBoZXRNZW51T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGFyZW50T3B0aW9ucztcblxuY2xhc3MgUGhldE1lbnUgZXh0ZW5kcyBQb3B1cGFibGUoIE5vZGUsIDAgKSB7XG5cbiAgLy8gVGhlIGl0ZW1zIHRoYXQgd2lsbCBhY3R1YWxseSBiZSBzaG93biBpbiB0aGlzIHJ1bnRpbWVcbiAgcHVibGljIHJlYWRvbmx5IGl0ZW1zOiBNZW51SXRlbVtdO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZVBoZXRNZW51OiAoKSA9PiB2b2lkO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2ltOiBTaW0sIHByb3ZpZGVkT3B0aW9ucz86IFBoZXRNZW51T3B0aW9ucyApIHtcblxuICAgIC8vIE9ubHkgc2hvdyBjZXJ0YWluIGZlYXR1cmVzIGZvciBQaEVUIFNpbXMsIHN1Y2ggYXMgbGlua3MgdG8gb3VyIHdlYnNpdGVcbiAgICBjb25zdCBpc1BoRVRCcmFuZCA9IHBoZXQuY2hpcHBlci5icmFuZCA9PT0gJ3BoZXQnO1xuICAgIGNvbnN0IGlzQXBwID0gcGhldC5jaGlwcGVyLmlzQXBwO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxQaGV0TWVudU9wdGlvbnMsIFNlbGZPcHRpb25zLCBQYXJlbnRPcHRpb25zPigpKCB7XG5cbiAgICAgIHBoZXRpb1R5cGU6IFBoZXRNZW51LlBoZXRNZW51SU8sXG4gICAgICBwaGV0aW9TdGF0ZTogZmFsc2UsXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVGhpcyBtZW51IGlzIGRpc3BsYXllZCB3aGVuIHRoZSBQaEVUIGJ1dHRvbiBpcyBwcmVzc2VkLicsXG5cbiAgICAgIHBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZDogZmFsc2UsIC8vIHZpc2libGUgaXNuJ3QgdG9nZ2xlZCB3aGVuIHNob3dpbmcgYSBQaGV0TWVudVxuXG4gICAgICAvLyBwZG9tLCB0YWdOYW1lIGFuZCByb2xlIGZvciBjb250ZW50IGluIHRoZSBtZW51XG4gICAgICB0YWdOYW1lOiAndWwnLFxuICAgICAgYXJpYVJvbGU6ICdtZW51J1xuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIC8vIEFib3V0RGlhbG9nIGlzIGNyZWF0ZWQgbGF6aWx5IChzbyB0aGF0IFNpbSBib3VuZHMgYXJlIHZhbGlkKSwgdGhlbiByZXVzZWQuXG4gICAgLy8gU2luY2UgQWJvdXREaWFsb2cgaXMgaW5zdHJ1bWVudGVkIGZvciBQaEVULWlPLCB0aGlzIGxhenkgY3JlYXRpb24gcmVxdWlyZXMgdXNlIG9mIFBoZXRpb0NhcHN1bGUuXG4gICAgY29uc3QgYWJvdXREaWFsb2dDYXBzdWxlID0gbmV3IFBoZXRpb0NhcHN1bGUoIHRhbmRlbSA9PiB7XG4gICAgICByZXR1cm4gbmV3IEFib3V0RGlhbG9nKCBzaW0uc2ltTmFtZVByb3BlcnR5LCBzaW0udmVyc2lvbiwgc2ltLmNyZWRpdHMsIHtcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0sXG4gICAgICAgIGZvY3VzT25IaWRlTm9kZTogdGhpcy5mb2N1c09uSGlkZU5vZGVcbiAgICAgIH0gKTtcbiAgICB9LCBbXSwge1xuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdhYm91dERpYWxvZ0NhcHN1bGUnICksXG4gICAgICBwaGV0aW9UeXBlOiBQaGV0aW9DYXBzdWxlLlBoZXRpb0NhcHN1bGVJTyggRGlhbG9nLkRpYWxvZ0lPICksXG4gICAgICBkaXNwb3NlT25DbGVhcjogZmFsc2VcbiAgICB9ICk7XG5cbiAgICAvLyBVcGRhdGUgZGlhbG9nIGlzIGNyZWF0ZWQgbGF6aWx5IChzbyB0aGF0IFNpbSBib3VuZHMgYXJlIHZhbGlkKSwgdGhlbiByZXVzZWQuXG4gICAgbGV0IHVwZGF0ZURpYWxvZzogVXBkYXRlRGlhbG9nIHwgbnVsbCA9IG51bGw7XG5cbiAgICAvKlxuICAgICAqIERlc2NyaXB0aW9uIG9mIHRoZSBpdGVtcyBpbiB0aGUgbWVudS4gU2VlIE1lbnUgSXRlbSBmb3IgYSBsaXN0IG9mIHByb3BlcnRpZXMgZm9yIGVhY2ggaXRlbURlc2NyaXB0b3JcbiAgICAgKi9cbiAgICBjb25zdCBpdGVtRGVzY3JpcHRvcnM6IE1lbnVJdGVtRGVzY3JpcHRvcltdID0gW1xuICAgICAge1xuICAgICAgICB0ZXh0U3RyaW5nUHJvcGVydHk6IEpvaXN0U3RyaW5ncy5tZW51SXRlbS5waGV0V2Vic2l0ZVN0cmluZ1Byb3BlcnR5LFxuICAgICAgICBwcmVzZW50OiBpc1BoRVRCcmFuZCxcbiAgICAgICAgc2hvdWxkQmVIaWRkZW5XaGVuTGlua3NBcmVOb3RBbGxvd2VkOiB0cnVlLFxuICAgICAgICBjYWxsYmFjazogKCkgPT4ge1xuXG4gICAgICAgICAgLy8gT3BlbiBsb2NhbGUtc3BlY2lmaWMgUGhFVCBob21lIHBhZ2UuIElmIHRoZXJlIGlzIG5vIHdlYnNpdGUgdHJhbnNsYXRpb24gZm9yIGxvY2FsZSwgZmFsbGJhY2sgd2lsbCBiZSBoYW5kbGVkIGJ5IHNlcnZlci4gU2VlIGpvaXN0Izk3LlxuICAgICAgICAgIG9wZW5Qb3B1cCggYGh0dHBzOi8vcGhldC5jb2xvcmFkby5lZHUvJHtzaW0ubG9jYWxlfWAgKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGV4dFN0cmluZ1Byb3BlcnR5OiBKb2lzdFN0cmluZ3MubWVudUl0ZW0ucmVwb3J0QVByb2JsZW1TdHJpbmdQcm9wZXJ0eSxcbiAgICAgICAgcHJlc2VudDogaXNQaEVUQnJhbmQgJiYgIWlzQXBwLFxuICAgICAgICBzaG91bGRCZUhpZGRlbldoZW5MaW5rc0FyZU5vdEFsbG93ZWQ6IHRydWUsXG4gICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgdXJsID0gYCR7J2h0dHBzOi8vcGhldC5jb2xvcmFkby5lZHUvZmlsZXMvdHJvdWJsZXNob290aW5nLycgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICc/c2ltPSd9JHtlbmNvZGVVUklDb21wb25lbnQoIHNpbS5zaW1OYW1lUHJvcGVydHkudmFsdWUgKVxuICAgICAgICAgIH0mdmVyc2lvbj0ke2VuY29kZVVSSUNvbXBvbmVudCggYCR7c2ltLnZlcnNpb259ICR7XG4gICAgICAgICAgICBwaGV0LmNoaXBwZXIuYnVpbGRUaW1lc3RhbXAgPyBwaGV0LmNoaXBwZXIuYnVpbGRUaW1lc3RhbXAgOiAnKHVuYnVpbHQpJ31gIClcbiAgICAgICAgICB9JnVybD0ke2VuY29kZVVSSUNvbXBvbmVudCggd2luZG93LmxvY2F0aW9uLmhyZWYgKVxuICAgICAgICAgIH0mZGVwZW5kZW5jaWVzPSR7ZW5jb2RlVVJJQ29tcG9uZW50KCBKU09OLnN0cmluZ2lmeSgge30gKSApfWA7XG4gICAgICAgICAgb3BlblBvcHVwKCB1cmwgKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGV4dFN0cmluZ1Byb3BlcnR5OiBuZXcgVGlueVByb3BlcnR5KCAnUVIgY29kZScgKSxcbiAgICAgICAgcHJlc2VudDogcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5xckNvZGUsXG4gICAgICAgIHNob3VsZEJlSGlkZGVuV2hlbkxpbmtzQXJlTm90QWxsb3dlZDogdHJ1ZSxcbiAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICBvcGVuUG9wdXAoIGBodHRwOi8vYXBpLnFyc2VydmVyLmNvbS92MS9jcmVhdGUtcXItY29kZS8/ZGF0YT0ke2VuY29kZVVSSUNvbXBvbmVudCggd2luZG93LmxvY2F0aW9uLmhyZWYgKX0mc2l6ZT0yMjB4MjIwJm1hcmdpbj0wYCApO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0ZXh0U3RyaW5nUHJvcGVydHk6IEpvaXN0U3RyaW5ncy5tZW51SXRlbS5nZXRVcGRhdGVTdHJpbmdQcm9wZXJ0eSxcbiAgICAgICAgcHJlc2VudDogdXBkYXRlQ2hlY2suYXJlVXBkYXRlc0NoZWNrZWQsXG4gICAgICAgIHNob3VsZEJlSGlkZGVuV2hlbkxpbmtzQXJlTm90QWxsb3dlZDogdHJ1ZSxcbiAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICBpZiAoICF1cGRhdGVEaWFsb2cgKSB7XG4gICAgICAgICAgICB1cGRhdGVEaWFsb2cgPSBuZXcgVXBkYXRlRGlhbG9nKCB7XG4gICAgICAgICAgICAgIGZvY3VzT25IaWRlTm9kZTogdGhpcy5mb2N1c09uSGlkZU5vZGVcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdXBkYXRlRGlhbG9nLnNob3coKTtcbiAgICAgICAgfSxcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgIHRleHRGaWxsOiBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHVwZGF0ZUNoZWNrLnN0YXRlUHJvcGVydHkgXSwgKCBzdGF0ZSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gc3RhdGUgPT09IFVwZGF0ZVN0YXRlLk9VVF9PRl9EQVRFID8gJyMwYTAnIDogJyMwMDAnO1xuICAgICAgICAgIH0gKSApXG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8vIFwiU2NyZWVuc2hvdFwiIE1lbnUgaXRlbVxuICAgICAge1xuICAgICAgICB0ZXh0U3RyaW5nUHJvcGVydHk6IEpvaXN0U3RyaW5ncy5tZW51SXRlbS5zY3JlZW5zaG90U3RyaW5nUHJvcGVydHksXG4gICAgICAgIHByZXNlbnQ6ICFpc0FwcCAmJiAhcGhldC5jaGlwcGVyLmlzRnV6ekVuYWJsZWQoKSwgLy8gTm90IHN1cHBvcnRlZCBieSBJRTksIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzIxMlxuICAgICAgICBzaG91bGRCZUhpZGRlbldoZW5MaW5rc0FyZU5vdEFsbG93ZWQ6IGZhbHNlLFxuICAgICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGRhdGFVUkwgPSBTY3JlZW5zaG90R2VuZXJhdG9yLmdlbmVyYXRlU2NyZWVuc2hvdCggc2ltICk7XG5cbiAgICAgICAgICAvLyBpZiB3ZSBoYXZlIEZpbGVTYXZlciBzdXBwb3J0XG4gICAgICAgICAgaWYgKCB3aW5kb3cuQmxvYiAmJiAhIW5ldyB3aW5kb3cuQmxvYigpICkge1xuXG4gICAgICAgICAgICAvLyBjb25zdHJ1Y3QgYSBibG9iIG91dCBvZiBpdFxuICAgICAgICAgICAgY29uc3QgcmVxdWlyZWRQcmVmaXggPSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LCc7XG4gICAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkYXRhVVJMLnN0YXJ0c1dpdGgoIHJlcXVpcmVkUHJlZml4ICkgKTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGFCYXNlNjQgPSBkYXRhVVJMLnNsaWNlKCByZXF1aXJlZFByZWZpeC5sZW5ndGggKTtcbiAgICAgICAgICAgIGNvbnN0IGJ5dGVDaGFycyA9IHdpbmRvdy5hdG9iKCBkYXRhQmFzZTY0ICk7XG4gICAgICAgICAgICBjb25zdCBieXRlQXJyYXkgPSBuZXcgd2luZG93LlVpbnQ4QXJyYXkoIGJ5dGVDaGFycy5sZW5ndGggKTtcbiAgICAgICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGJ5dGVBcnJheS5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgICAgYnl0ZUFycmF5WyBpIF0gPSBieXRlQ2hhcnMuY2hhckNvZGVBdCggaSApOyAvLyBuZWVkIGNoZWNrIHRvIG1ha2Ugc3VyZSB0aGlzIGNhc3QgZG9lc24ndCBnaXZlIHByb2JsZW1zP1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBibG9iID0gbmV3IHdpbmRvdy5CbG9iKCBbIGJ5dGVBcnJheSBdLCB7IHR5cGU6ICdpbWFnZS9wbmcnIH0gKTtcblxuICAgICAgICAgICAgLy8gb3VyIHByZWZlcnJlZCBmaWxlbmFtZVxuICAgICAgICAgICAgY29uc3QgZmlsZW5hbWUgPSBgJHtzdHJpcEVtYmVkZGluZ01hcmtzKCBzaW0uc2ltTmFtZVByb3BlcnR5LnZhbHVlICl9IHNjcmVlbnNob3QucG5nYDtcblxuICAgICAgICAgICAgaWYgKCAhcGhldC5jaGlwcGVyLmlzRnV6ekVuYWJsZWQoKSApIHtcblxuICAgICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHdoZW4gdHlwZXNjcmlwdCBrbm93cyBhbnl0aGluZyBhYm91dCB3aW5kb3cuIC4gLi5cbiAgICAgICAgICAgICAgd2luZG93LnNhdmVBcyggYmxvYiwgZmlsZW5hbWUgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBvcGVuUG9wdXAoIGRhdGFVUkwsIHRydWUgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NjcmVlbnNob3RNZW51SXRlbScgKSxcbiAgICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVGhpcyBtZW51IGl0ZW0gY2FwdHVyZXMgYSBzY3JlZW5zaG90IGZyb20gdGhlIHNpbXVsYXRpb24gYW5kIHNhdmVzIGl0IHRvIHRoZSBmaWxlIHN5c3RlbS4nLFxuICAgICAgICAgIHZpc2libGVQcm9wZXJ0eU9wdGlvbnM6IHsgcGhldGlvRmVhdHVyZWQ6IHRydWUgfVxuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICAvLyBcIkZ1bGwgU2NyZWVuXCIgbWVudSBpdGVtXG4gICAgICB7XG4gICAgICAgIHRleHRTdHJpbmdQcm9wZXJ0eTogSm9pc3RTdHJpbmdzLm1lbnVJdGVtLmZ1bGxzY3JlZW5TdHJpbmdQcm9wZXJ0eSxcbiAgICAgICAgcHJlc2VudDogRnVsbFNjcmVlbi5pc0Z1bGxTY3JlZW5FbmFibGVkKCkgJiYgIWlzQXBwICYmICFwbGF0Zm9ybS5tb2JpbGVTYWZhcmkgJiYgIXBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMucHJldmVudEZ1bGxTY3JlZW4sXG4gICAgICAgIHNob3VsZEJlSGlkZGVuV2hlbkxpbmtzQXJlTm90QWxsb3dlZDogZmFsc2UsXG4gICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgaWYgKCAhcGhldC5jaGlwcGVyLmlzRnV6ekVuYWJsZWQoKSApIHtcbiAgICAgICAgICAgIEZ1bGxTY3JlZW4udG9nZ2xlRnVsbFNjcmVlbiggc2ltLmRpc3BsYXkgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICBjaGVja2VkUHJvcGVydHk6IEZ1bGxTY3JlZW4uaXNGdWxsU2NyZWVuUHJvcGVydHksXG4gICAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdmdWxsU2NyZWVuTWVudUl0ZW0nICksXG4gICAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RoaXMgbWVudSBpdGVtIHJlcXVlc3RzIGZ1bGwtc2NyZWVuIGFjY2VzcyBmb3IgdGhlIHNpbXVsYXRpb24gZGlzcGxheS4nLFxuICAgICAgICAgIHZpc2libGVQcm9wZXJ0eU9wdGlvbnM6IHsgcGhldGlvRmVhdHVyZWQ6IHRydWUgfVxuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICAvLyBBYm91dCBkaWFsb2cgYnV0dG9uXG4gICAgICB7XG4gICAgICAgIHRleHRTdHJpbmdQcm9wZXJ0eTogSm9pc3RTdHJpbmdzLm1lbnVJdGVtLmFib3V0U3RyaW5nUHJvcGVydHksXG4gICAgICAgIHByZXNlbnQ6IHRydWUsXG4gICAgICAgIHNob3VsZEJlSGlkZGVuV2hlbkxpbmtzQXJlTm90QWxsb3dlZDogZmFsc2UsXG4gICAgICAgIGNhbGxiYWNrOiAoKSA9PiBhYm91dERpYWxvZ0NhcHN1bGUuZ2V0RWxlbWVudCgpLnNob3coKSxcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgIHNlcGFyYXRvckJlZm9yZTogaXNQaEVUQnJhbmQsXG5cbiAgICAgICAgICAvLyBwaGV0LWlvXG4gICAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdhYm91dE1lbnVJdGVtJyApLFxuICAgICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdUaGlzIG1lbnUgaXRlbSBzaG93cyBhIGRpYWxvZyB3aXRoIGluZm9ybWF0aW9uIGFib3V0IHRoZSBzaW11bGF0aW9uLicsXG4gICAgICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczogeyBwaGV0aW9GZWF0dXJlZDogdHJ1ZSB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBdO1xuXG4gICAgY29uc3Qga2VlcEl0ZW1EZXNjcmlwdG9ycyA9IGl0ZW1EZXNjcmlwdG9ycy5maWx0ZXIoIGl0ZW1EZXNjcmlwdG9yID0+IHtcblxuICAgICAgLy8gSWYgdGhlcmUgaXMgYSB0YW5kZW0sIHRoZW4gd2UgbmVlZCB0byBjcmVhdGUgdGhlIE1lbnVJdGVtIHRvIGhhdmUgYSBjb25zaXN0ZW50IEFQSS5cbiAgICAgIHJldHVybiBpdGVtRGVzY3JpcHRvci5wcmVzZW50IHx8ICggaXRlbURlc2NyaXB0b3Iub3B0aW9ucyAmJiBpdGVtRGVzY3JpcHRvci5vcHRpb25zLnRhbmRlbSApO1xuICAgIH0gKTtcblxuICAgIC8vIENyZWF0ZSB0aGUgbWVudSBpdGVtcy5cbiAgICBjb25zdCB1bmZpbHRlcmVkSXRlbXMgPSBrZWVwSXRlbURlc2NyaXB0b3JzLm1hcCggaXRlbURlc2NyaXB0b3IgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IE1lbnVJdGVtKFxuICAgICAgICAgICgpID0+IHRoaXMuaGlkZSgpLFxuICAgICAgICAgIGl0ZW1EZXNjcmlwdG9yLnRleHRTdHJpbmdQcm9wZXJ0eSxcbiAgICAgICAgICBpdGVtRGVzY3JpcHRvci5jYWxsYmFjayxcbiAgICAgICAgICBpdGVtRGVzY3JpcHRvci5wcmVzZW50LFxuICAgICAgICAgIGl0ZW1EZXNjcmlwdG9yLnNob3VsZEJlSGlkZGVuV2hlbkxpbmtzQXJlTm90QWxsb3dlZCxcbiAgICAgICAgICBpdGVtRGVzY3JpcHRvci5vcHRpb25zXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgKTtcbiAgICBjb25zdCBpdGVtcyA9IHVuZmlsdGVyZWRJdGVtcy5maWx0ZXIoIGl0ZW0gPT4gaXRlbS5wcmVzZW50ICk7XG5cbiAgICAvLyBTb21lIGl0ZW1zIHRoYXQgYXJlbid0IHByZXNlbnQgd2VyZSBjcmVhdGVkIGp1c3QgdG8gbWFpbnRhaW4gYSBjb25zaXN0ZW50IFBoRVQtaU8gQVBJIGFjcm9zcyBhbGxcbiAgICAvLyBydW50aW1lcywgd2UgY2FuIGlnbm9yZSB0aG9zZSBub3cuXG4gICAgdGhpcy5pdGVtcyA9IGl0ZW1zO1xuXG4gICAgY29uc3QgY29udGVudCA9IG5ldyBWQm94KCB7XG4gICAgICBzdHJldGNoOiB0cnVlLFxuICAgICAgc3BhY2luZzogMixcbiAgICAgIGNoaWxkcmVuOiBfLmZsYXR0ZW4oIGl0ZW1zLm1hcCggaXRlbSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVtLnNlcGFyYXRvckJlZm9yZSA/IFsgbmV3IEhTZXBhcmF0b3IoIHsgc3Ryb2tlOiAnZ3JheScgfSApLCBpdGVtIF0gOiBbIGl0ZW0gXTtcbiAgICAgIH0gKSApXG4gICAgfSApO1xuXG4gICAgLy8gQ3JlYXRlIGEgY29taWMtYm9vay1zdHlsZSBidWJibGUuXG4gICAgY29uc3QgWF9NQVJHSU4gPSA1O1xuICAgIGNvbnN0IFlfTUFSR0lOID0gNTtcbiAgICBjb25zdCBidWJibGUgPSBuZXcgUGF0aCggbnVsbCwge1xuICAgICAgZmlsbDogJ3doaXRlJyxcbiAgICAgIHN0cm9rZTogJ2JsYWNrJ1xuICAgIH0gKTtcbiAgICBjb250ZW50LmxvY2FsQm91bmRzUHJvcGVydHkubGluayggKCkgPT4ge1xuICAgICAgY29udGVudC5sZWZ0ID0gWF9NQVJHSU47XG4gICAgICBjb250ZW50LnRvcCA9IFlfTUFSR0lOO1xuICAgIH0gKTtcbiAgICBjb250ZW50LmJvdW5kc1Byb3BlcnR5LmxpbmsoIGJvdW5kcyA9PiB7XG4gICAgICBidWJibGUuc2hhcGUgPSBjcmVhdGVCdWJibGVTaGFwZSggYm91bmRzLndpZHRoICsgMiAqIFhfTUFSR0lOLCBib3VuZHMuaGVpZ2h0ICsgMiAqIFlfTUFSR0lOICk7XG4gICAgfSApO1xuXG4gICAgdGhpcy5hZGRDaGlsZCggYnViYmxlICk7XG4gICAgdGhpcy5hZGRDaGlsZCggY29udGVudCApO1xuXG4gICAgLy8gcGRvbSAtIGhhbmRsZXMgbmF2aWdhdGlvbiBvZiBpdGVtcyBhbmQgY2xvc2luZyB3aXRoIGVzY2FwZVxuICAgIGNvbnN0IGtleWJvYXJkTGlzdGVuZXIgPSBuZXcgS2V5Ym9hcmRMaXN0ZW5lcigge1xuICAgICAga2V5czogWyAnZXNjYXBlJywgJ2Fycm93RG93bicsICdhcnJvd1VwJywgJ3RhYicsICdzaGlmdCt0YWInIF0sXG4gICAgICBmaXJlOiAoIGV2ZW50LCBrZXlzUHJlc3NlZCApID0+IHtcbiAgICAgICAgY29uc3QgZmlyc3RJdGVtID0gdGhpcy5pdGVtc1sgMCBdO1xuICAgICAgICBjb25zdCBsYXN0SXRlbSA9IHRoaXMuaXRlbXNbIHRoaXMuaXRlbXMubGVuZ3RoIC0gMSBdO1xuXG4gICAgICAgIGlmICggZXZlbnQgKSB7XG5cbiAgICAgICAgICAvLyB0aGlzIGF0dGVtcHRzIHRvIHByZXZlbnQgdGhlIHNjcmVlbiByZWFkZXIncyB2aXJ0dWFsIGN1cnNvciBmcm9tIGFsc28gbW92aW5nIHdpdGggdGhlIGFycm93IGtleXNcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBrZXlzUHJlc3NlZCA9PT0gJ2Fycm93RG93bicgKSB7XG5cbiAgICAgICAgICAvLyBPbiBkb3duIGFycm93LCBmb2N1cyBuZXh0IGl0ZW0gaW4gdGhlIGxpc3QsIG9yIHdyYXAgdXAgdG8gdGhlIGZpcnN0IGl0ZW0gaWYgZm9jdXMgaXMgYXQgdGhlIGVuZFxuICAgICAgICAgIGNvbnN0IG5leHRGb2N1c2FibGUgPSBsYXN0SXRlbS5mb2N1c2VkID8gZmlyc3RJdGVtIDogUERPTVV0aWxzLmdldE5leHRGb2N1c2FibGUoKTtcbiAgICAgICAgICBuZXh0Rm9jdXNhYmxlLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIGtleXNQcmVzc2VkID09PSAnYXJyb3dVcCcgKSB7XG5cbiAgICAgICAgICAvLyBPbiB1cCBhcnJvdywgZm9jdXMgcHJldmlvdXMgaXRlbSBpbiB0aGUgbGlzdCwgb3Igd3JhcCBiYWNrIHRvIHRoZSBsYXN0IGl0ZW0gaWYgZm9jdXMgaXMgb24gZmlyc3QgaXRlbVxuICAgICAgICAgIGNvbnN0IHByZXZpb3VzRm9jdXNhYmxlID0gZmlyc3RJdGVtLmZvY3VzZWQgPyBsYXN0SXRlbSA6IFBET01VdGlscy5nZXRQcmV2aW91c0ZvY3VzYWJsZSgpO1xuICAgICAgICAgIHByZXZpb3VzRm9jdXNhYmxlLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIGtleXNQcmVzc2VkID09PSAnZXNjYXBlJyB8fCBrZXlzUHJlc3NlZCA9PT0gJ3RhYicgfHwga2V5c1ByZXNzZWQgPT09ICdzaGlmdCt0YWInICkge1xuXG4gICAgICAgICAgLy8gT24gZXNjYXBlIG9yIHRhYiwgY2xvc2UgdGhlIG1lbnUgYW5kIHJlc3RvcmUgZm9jdXMgdG8gdGhlIGVsZW1lbnQgdGhhdCBoYWQgZm9jdXMgYmVmb3JlIHRoZSBtZW51IHdhc1xuICAgICAgICAgIC8vIG9wZW5lZC5cbiAgICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gKTtcbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIGtleWJvYXJkTGlzdGVuZXIgKTtcblxuICAgIHRoaXMuZGlzcG9zZVBoZXRNZW51ID0gKCkgPT4ge1xuICAgICAgdGhpcy5yZW1vdmVJbnB1dExpc3RlbmVyKCBrZXlib2FyZExpc3RlbmVyICk7XG4gICAgICBrZXlib2FyZExpc3RlbmVyLmRpc3Bvc2UoKTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIChqb2lzdC1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZVBoZXRNZW51KCk7XG4gICAgXy5lYWNoKCB0aGlzLml0ZW1zLCBpdGVtID0+IGl0ZW0uZGlzcG9zZSgpICk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBQaGV0TWVudUlPID0gbmV3IElPVHlwZSggJ1BoZXRNZW51SU8nLCB7XG4gICAgdmFsdWVUeXBlOiBQaGV0TWVudSxcbiAgICBkb2N1bWVudGF0aW9uOiAnVGhlIFBoRVQgTWVudSBpbiB0aGUgYm90dG9tIHJpZ2h0IG9mIHRoZSBzY3JlZW4nXG4gIH0gKTtcbn1cblxuY29uc3QgY3JlYXRlQnViYmxlU2hhcGUgPSAoIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyICk6IFNoYXBlID0+IHtcbiAgY29uc3QgdGFpbCA9IG5ldyBTaGFwZSgpXG4gICAgLm1vdmVUbyggd2lkdGggLSAyMCwgaGVpZ2h0IClcbiAgICAubGluZVRvUmVsYXRpdmUoIDAsIDIwIClcbiAgICAubGluZVRvUmVsYXRpdmUoIC0yMCwgLTIwIClcbiAgICAuY2xvc2UoKTtcbiAgcmV0dXJuIFNoYXBlLnJvdW5kUmVjdCggMCwgMCwgd2lkdGgsIGhlaWdodCwgOCwgOCApLnNoYXBlVW5pb24oIHRhaWwgKTtcbn07XG5cbmpvaXN0LnJlZ2lzdGVyKCAnUGhldE1lbnUnLCBQaGV0TWVudSApO1xuZXhwb3J0IGRlZmF1bHQgUGhldE1lbnU7Il0sIm5hbWVzIjpbIkRlcml2ZWRQcm9wZXJ0eSIsIlRpbnlQcm9wZXJ0eSIsIlNoYXBlIiwib3B0aW9uaXplIiwicGxhdGZvcm0iLCJzdHJpcEVtYmVkZGluZ01hcmtzIiwiRnVsbFNjcmVlbiIsIkhTZXBhcmF0b3IiLCJLZXlib2FyZExpc3RlbmVyIiwiTm9kZSIsIm9wZW5Qb3B1cCIsIlBhdGgiLCJQRE9NVXRpbHMiLCJWQm94IiwiRGlhbG9nIiwiTWVudUl0ZW0iLCJQb3B1cGFibGUiLCJQaGV0aW9DYXBzdWxlIiwiSU9UeXBlIiwiQWJvdXREaWFsb2ciLCJqb2lzdCIsIkpvaXN0U3RyaW5ncyIsIlNjcmVlbnNob3RHZW5lcmF0b3IiLCJ1cGRhdGVDaGVjayIsIlVwZGF0ZURpYWxvZyIsIlVwZGF0ZVN0YXRlIiwiUGhldE1lbnUiLCJkaXNwb3NlIiwiZGlzcG9zZVBoZXRNZW51IiwiXyIsImVhY2giLCJpdGVtcyIsIml0ZW0iLCJzaW0iLCJwcm92aWRlZE9wdGlvbnMiLCJpc1BoRVRCcmFuZCIsInBoZXQiLCJjaGlwcGVyIiwiYnJhbmQiLCJpc0FwcCIsIm9wdGlvbnMiLCJwaGV0aW9UeXBlIiwiUGhldE1lbnVJTyIsInBoZXRpb1N0YXRlIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCIsInRhZ05hbWUiLCJhcmlhUm9sZSIsImFib3V0RGlhbG9nQ2Fwc3VsZSIsInRhbmRlbSIsInNpbU5hbWVQcm9wZXJ0eSIsInZlcnNpb24iLCJjcmVkaXRzIiwiZm9jdXNPbkhpZGVOb2RlIiwiY3JlYXRlVGFuZGVtIiwiUGhldGlvQ2Fwc3VsZUlPIiwiRGlhbG9nSU8iLCJkaXNwb3NlT25DbGVhciIsInVwZGF0ZURpYWxvZyIsIml0ZW1EZXNjcmlwdG9ycyIsInRleHRTdHJpbmdQcm9wZXJ0eSIsIm1lbnVJdGVtIiwicGhldFdlYnNpdGVTdHJpbmdQcm9wZXJ0eSIsInByZXNlbnQiLCJzaG91bGRCZUhpZGRlbldoZW5MaW5rc0FyZU5vdEFsbG93ZWQiLCJjYWxsYmFjayIsImxvY2FsZSIsInJlcG9ydEFQcm9ibGVtU3RyaW5nUHJvcGVydHkiLCJ1cmwiLCJlbmNvZGVVUklDb21wb25lbnQiLCJ2YWx1ZSIsImJ1aWxkVGltZXN0YW1wIiwid2luZG93IiwibG9jYXRpb24iLCJocmVmIiwiSlNPTiIsInN0cmluZ2lmeSIsInF1ZXJ5UGFyYW1ldGVycyIsInFyQ29kZSIsImdldFVwZGF0ZVN0cmluZ1Byb3BlcnR5IiwiYXJlVXBkYXRlc0NoZWNrZWQiLCJzaG93IiwidGV4dEZpbGwiLCJzdGF0ZVByb3BlcnR5Iiwic3RhdGUiLCJPVVRfT0ZfREFURSIsInNjcmVlbnNob3RTdHJpbmdQcm9wZXJ0eSIsImlzRnV6ekVuYWJsZWQiLCJkYXRhVVJMIiwiZ2VuZXJhdGVTY3JlZW5zaG90IiwiQmxvYiIsInJlcXVpcmVkUHJlZml4IiwiYXNzZXJ0Iiwic3RhcnRzV2l0aCIsImRhdGFCYXNlNjQiLCJzbGljZSIsImxlbmd0aCIsImJ5dGVDaGFycyIsImF0b2IiLCJieXRlQXJyYXkiLCJVaW50OEFycmF5IiwiaSIsImNoYXJDb2RlQXQiLCJibG9iIiwidHlwZSIsImZpbGVuYW1lIiwic2F2ZUFzIiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsInBoZXRpb0ZlYXR1cmVkIiwiZnVsbHNjcmVlblN0cmluZ1Byb3BlcnR5IiwiaXNGdWxsU2NyZWVuRW5hYmxlZCIsIm1vYmlsZVNhZmFyaSIsInByZXZlbnRGdWxsU2NyZWVuIiwidG9nZ2xlRnVsbFNjcmVlbiIsImRpc3BsYXkiLCJjaGVja2VkUHJvcGVydHkiLCJpc0Z1bGxTY3JlZW5Qcm9wZXJ0eSIsImFib3V0U3RyaW5nUHJvcGVydHkiLCJnZXRFbGVtZW50Iiwic2VwYXJhdG9yQmVmb3JlIiwia2VlcEl0ZW1EZXNjcmlwdG9ycyIsImZpbHRlciIsIml0ZW1EZXNjcmlwdG9yIiwidW5maWx0ZXJlZEl0ZW1zIiwibWFwIiwiaGlkZSIsImNvbnRlbnQiLCJzdHJldGNoIiwic3BhY2luZyIsImNoaWxkcmVuIiwiZmxhdHRlbiIsInN0cm9rZSIsIlhfTUFSR0lOIiwiWV9NQVJHSU4iLCJidWJibGUiLCJmaWxsIiwibG9jYWxCb3VuZHNQcm9wZXJ0eSIsImxpbmsiLCJsZWZ0IiwidG9wIiwiYm91bmRzUHJvcGVydHkiLCJib3VuZHMiLCJzaGFwZSIsImNyZWF0ZUJ1YmJsZVNoYXBlIiwid2lkdGgiLCJoZWlnaHQiLCJhZGRDaGlsZCIsImtleWJvYXJkTGlzdGVuZXIiLCJrZXlzIiwiZmlyZSIsImV2ZW50Iiwia2V5c1ByZXNzZWQiLCJmaXJzdEl0ZW0iLCJsYXN0SXRlbSIsInByZXZlbnREZWZhdWx0IiwibmV4dEZvY3VzYWJsZSIsImZvY3VzZWQiLCJnZXROZXh0Rm9jdXNhYmxlIiwiZm9jdXMiLCJwcmV2aW91c0ZvY3VzYWJsZSIsImdldFByZXZpb3VzRm9jdXNhYmxlIiwiYWRkSW5wdXRMaXN0ZW5lciIsInJlbW92ZUlucHV0TGlzdGVuZXIiLCJ2YWx1ZVR5cGUiLCJkb2N1bWVudGF0aW9uIiwidGFpbCIsIm1vdmVUbyIsImxpbmVUb1JlbGF0aXZlIiwiY2xvc2UiLCJyb3VuZFJlY3QiLCJzaGFwZVVuaW9uIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELE9BQU9BLHFCQUFxQixtQ0FBbUM7QUFDL0QsT0FBT0Msa0JBQWtCLGdDQUFnQztBQUV6RCxTQUFTQyxLQUFLLFFBQVEsMkJBQTJCO0FBQ2pELE9BQU9DLGVBQXFDLGtDQUFrQztBQUM5RSxPQUFPQyxjQUFjLGlDQUFpQztBQUN0RCxPQUFPQyx5QkFBeUIsNENBQTRDO0FBRTVFLFNBQVNDLFVBQVUsRUFBRUMsVUFBVSxFQUFFQyxnQkFBZ0IsRUFBRUMsSUFBSSxFQUFlQyxTQUFTLEVBQUVDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxJQUFJLFFBQVEsOEJBQThCO0FBQzVJLE9BQU9DLFlBQVkseUJBQXlCO0FBQzVDLE9BQU9DLGNBQW1DLDJCQUEyQjtBQUNyRSxPQUFPQyxlQUFxQyw0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