// Copyright 2018-2024, University of Colorado Boulder
/**
 * General dialog type. Migrated from Joist on 4/10/2018
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrea Lin (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Multilink from '../../axon/js/Multilink.js';
import PatternStringProperty from '../../axon/js/PatternStringProperty.js';
import TinyProperty from '../../axon/js/TinyProperty.js';
import ScreenView from '../../joist/js/ScreenView.js';
import getGlobal from '../../phet-core/js/getGlobal.js';
import optionize from '../../phet-core/js/optionize.js';
import CloseButton from '../../scenery-phet/js/buttons/CloseButton.js';
import { AlignBox, assertNoAdditionalChildren, FocusManager, FullScreen, HBox, KeyboardListener, Node, ParallelDOM, PDOMPeer, PDOMUtils, VBox, voicingManager } from '../../scenery/js/imports.js';
import nullSoundPlayer from '../../tambo/js/nullSoundPlayer.js';
import sharedSoundPlayers from '../../tambo/js/sharedSoundPlayers.js';
import Tandem, { DYNAMIC_ARCHETYPE_NAME } from '../../tandem/js/Tandem.js';
import DynamicMarkerIO from '../../tandem/js/types/DynamicMarkerIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import Utterance from '../../utterance-queue/js/Utterance.js';
import ButtonNode from './buttons/ButtonNode.js';
import Panel from './Panel.js';
import Popupable from './Popupable.js';
import sun from './sun.js';
import SunStrings from './SunStrings.js';
let Dialog = class Dialog extends Popupable(Panel, 1) {
    dispose() {
        this.disposeDialog();
        super.dispose();
    }
    /**
   * @param content - The content to display inside the dialog (not including the title)
   * @param providedOptions
   */ constructor(content, providedOptions){
        var _options_tandem;
        const options = optionize()({
            // DialogOptions
            xSpacing: 10,
            ySpacing: 10,
            topMargin: 15,
            bottomMargin: 15,
            leftMargin: null,
            maxWidthMargin: 12,
            maxHeightMargin: 12,
            closeButtonLength: 18.2,
            closeButtonTopMargin: 10,
            closeButtonRightMargin: 10,
            title: null,
            titleAlign: 'center',
            layoutStrategy: defaultLayoutStrategy,
            closeButtonListener: ()=>this.hide(),
            closeButtonColor: 'black',
            closeButtonTouchAreaXDilation: 0,
            closeButtonTouchAreaYDilation: 0,
            closeButtonMouseAreaXDilation: 0,
            closeButtonMouseAreaYDilation: 0,
            closeButtonVoicingDialogTitle: null,
            closeButtonLastInPDOM: false,
            openedSoundPlayer: sharedSoundPlayers.get('generalOpen'),
            closedSoundPlayer: sharedSoundPlayers.get('generalClose'),
            sim: getGlobal('phet.joist.sim'),
            showCallback: null,
            hideCallback: null,
            // PopupableOptions
            layoutBounds: ScreenView.DEFAULT_LAYOUT_BOUNDS,
            focusOnShowNode: null,
            // PanelOptions
            cornerRadius: 10,
            resize: true,
            fill: 'white',
            stroke: 'black',
            backgroundPickable: true,
            maxHeight: null,
            maxWidth: null,
            // phet-io
            tandemNameSuffix: [
                'Dialog',
                DYNAMIC_ARCHETYPE_NAME
            ],
            phetioType: Dialog.DialogIO,
            phetioState: true,
            phetioVisiblePropertyInstrumented: false,
            // pdom options
            tagName: 'div',
            ariaRole: 'dialog',
            positionInPDOM: true
        }, providedOptions);
        assert && assert(options.sim, 'sim must be provided, as Dialog needs a Sim instance');
        assert && assert(options.xMargin === undefined, 'Dialog sets xMargin');
        options.xMargin = 0;
        assert && assert(options.yMargin === undefined, 'Dialog sets yMargin');
        options.yMargin = 0;
        // if left margin is specified in options, use it. otherwise, set it to make the left right gutters symmetrical
        if (options.leftMargin === null) {
            options.leftMargin = options.xSpacing + options.closeButtonLength + options.closeButtonRightMargin;
        }
        assert && assert(options.maxHeight === null || typeof options.maxHeight === 'number');
        assert && assert(options.maxWidth === null || typeof options.maxWidth === 'number');
        // Apply maxWidth/maxHeight depending on the margins and layoutBounds
        if (!options.maxWidth && options.layoutBounds) {
            options.maxWidth = applyDoubleMargin(options.layoutBounds.width, options.maxWidthMargin);
        }
        if (!options.maxHeight && options.layoutBounds) {
            options.maxHeight = applyDoubleMargin(options.layoutBounds.height, options.maxHeightMargin);
        }
        // We need an "unattached" utterance so that when the close button fires, hiding the close button, we still hear
        // the context response. But we still should only hear this context response when "Sim Voicing" is enabled.
        const contextResponseUtterance = new Utterance({
            priority: Utterance.MEDIUM_PRIORITY,
            voicingCanAnnounceProperties: [
                voicingManager.voicingFullyEnabledProperty
            ]
        });
        // create close button - a flat "X"
        const closeButton = new CloseButton({
            iconLength: options.closeButtonLength,
            baseColor: 'transparent',
            buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
            // no margins since the flat X takes up all the space
            xMargin: 0,
            yMargin: 0,
            listener: ()=>{
                // Context response first, before potentially changing focus with the callback listener
                closeButton.voicingSpeakContextResponse({
                    utterance: contextResponseUtterance
                });
                options.closeButtonListener();
            },
            pathOptions: {
                stroke: options.closeButtonColor
            },
            // phet-io
            tandem: (_options_tandem = options.tandem) == null ? void 0 : _options_tandem.createTandem('closeButton'),
            phetioState: false,
            // It is a usability concern to change either of these, also there are other ways to exit a Dialog, so using
            // these is buggy.
            phetioVisiblePropertyInstrumented: false,
            phetioEnabledPropertyInstrumented: false,
            // turn off default sound generation, Dialog will create its own sounds
            soundPlayer: nullSoundPlayer,
            // voicing
            voicingContextResponse: SunStrings.a11y.closedStringProperty
        });
        let closeButtonVoicingNameResponseProperty;
        if (options.closeButtonVoicingDialogTitle) {
            const titleProperty = typeof options.closeButtonVoicingDialogTitle === 'string' ? new TinyProperty(options.closeButtonVoicingDialogTitle) : options.closeButtonVoicingDialogTitle;
            closeButtonVoicingNameResponseProperty = closeButton.voicingNameResponse = new PatternStringProperty(SunStrings.a11y.titleClosePatternStringProperty, {
                title: titleProperty
            }, {
                tandem: Tandem.OPT_OUT
            });
        }
        // touch/mouse areas for the close button
        closeButton.touchArea = closeButton.bounds.dilatedXY(options.closeButtonTouchAreaXDilation, options.closeButtonTouchAreaYDilation);
        closeButton.mouseArea = closeButton.bounds.dilatedXY(options.closeButtonMouseAreaXDilation, options.closeButtonMouseAreaYDilation);
        // A container Node for the accessible name and help text for the Dialog.
        const pdomNode = new Node({
            tagName: 'div',
            labelTagName: 'h1'
        });
        // pdom - set the order of content, close button first so remaining content can be read from top to bottom
        // with virtual cursor
        let pdomOrder = [
            pdomNode,
            options.title,
            content
        ];
        options.closeButtonLastInPDOM ? pdomOrder.push(closeButton) : pdomOrder.unshift(closeButton);
        pdomOrder = pdomOrder.filter((node)=>node !== undefined && node !== null);
        // pdom - fall back to focusing the closeButton by default if there is no focusOnShowNode or the
        // content is not focusable
        assert && assert(pdomOrder[0]);
        options.focusOnShowNode = options.focusOnShowNode ? options.focusOnShowNode : pdomOrder[0].focusable ? pdomOrder[0] : closeButton;
        assert && assert(options.focusOnShowNode instanceof Node, 'should be non-null and defined');
        assert && assert(options.focusOnShowNode.focusable, 'focusOnShowNode must be focusable.');
        // Align content, title, and close button using spacing and margin options
        // align content and title (if provided) vertically
        const contentAndTitle = new VBox({
            children: options.title ? [
                options.title,
                content
            ] : [
                content
            ],
            spacing: options.ySpacing,
            align: options.titleAlign
        });
        // add topMargin, bottomMargin, and leftMargin
        const contentAndTitleWithMargins = new AlignBox(contentAndTitle, {
            topMargin: options.topMargin,
            bottomMargin: options.bottomMargin,
            leftMargin: options.leftMargin
        });
        // add closeButtonTopMargin and closeButtonRightMargin
        const closeButtonWithMargins = new AlignBox(closeButton, {
            topMargin: options.closeButtonTopMargin,
            rightMargin: options.closeButtonRightMargin
        });
        // create content for Panel
        const dialogContent = new HBox({
            children: [
                pdomNode,
                contentAndTitleWithMargins,
                closeButtonWithMargins
            ],
            spacing: options.xSpacing,
            align: 'top'
        });
        super(dialogContent, options);
        // The Dialog's display runs on this Property, so add the listener that controls show/hide.
        this.isShowingProperty.lazyLink((isShowing)=>{
            if (isShowing) {
                // sound generation
                options.openedSoundPlayer.play();
                // Do this last
                options.showCallback && options.showCallback();
            } else {
                // sound generation
                options.closedSoundPlayer.play();
                // Do this last
                options.hideCallback && options.hideCallback();
            }
        });
        this.sim = options.sim;
        this.closeButton = closeButton;
        const updateLayoutMultilink = Multilink.multilink([
            this.sim.boundsProperty,
            this.sim.screenBoundsProperty,
            this.sim.scaleProperty,
            this.sim.selectedScreenProperty,
            this.isShowingProperty,
            this.localBoundsProperty
        ], (bounds, screenBounds, scale)=>{
            if (bounds && screenBounds && scale) {
                options.layoutStrategy(this, bounds, screenBounds, scale);
            }
        });
        // Setter after the super call
        this.pdomOrder = pdomOrder;
        ParallelDOM.forwardAccessibleName(this, pdomNode);
        ParallelDOM.forwardHelpText(this, pdomNode);
        // If no accessibleName has been provided, try to find one from the title by default
        if (!options.accessibleName && options.title) {
            this.accessibleName = PDOMUtils.findStringProperty(options.title);
        }
        // pdom - set the aria-labelledby relation so that whenever focus enters the dialog the accessible name is read
        this.addAriaLabelledbyAssociation({
            thisElementName: PDOMPeer.PRIMARY_SIBLING,
            otherNode: pdomNode,
            otherElementName: PDOMPeer.LABEL_SIBLING
        });
        // pdom - close the dialog when pressing "escape"
        const keyboardListener = new KeyboardListener({
            keys: [
                'escape',
                'tab',
                'shift+tab'
            ],
            fire: (event, keysPressed)=>{
                assert && assert(event, 'event should be non-null and defined for this listener');
                const domEvent = event;
                if (keysPressed === 'escape') {
                    domEvent.preventDefault();
                    this.hide();
                } else if ((keysPressed === 'tab' || keysPressed === 'shift+tab') && FullScreen.isFullScreen()) {
                    // prevent a particular bug in Windows 7/8.1 Firefox where focus gets trapped in the document
                    // when the navigation bar is hidden and there is only one focusable element in the DOM
                    // see https://bugzilla.mozilla.org/show_bug.cgi?id=910136
                    assert && assert(FocusManager.pdomFocus); // {Focus|null}
                    const activeId = FocusManager.pdomFocus.trail.getUniqueId();
                    const noNextFocusable = PDOMUtils.getNextFocusable().id === activeId;
                    const noPreviousFocusable = PDOMUtils.getPreviousFocusable().id === activeId;
                    if (noNextFocusable && noPreviousFocusable) {
                        domEvent.preventDefault();
                    }
                }
            }
        });
        this.addInputListener(keyboardListener);
        this.disposeDialog = ()=>{
            updateLayoutMultilink.dispose();
            closeButtonWithMargins.dispose();
            this.removeInputListener(keyboardListener);
            keyboardListener.dispose();
            closeButtonVoicingNameResponseProperty && closeButtonVoicingNameResponseProperty.dispose();
            closeButton.dispose();
            contextResponseUtterance.dispose();
            contentAndTitle.dispose();
            // remove dialog content from scene graph, but don't dispose because Panel
            // needs to remove listeners on the content in its dispose()
            dialogContent.removeAllChildren();
            dialogContent.detach();
        };
        // Set content through the constructor, Dialog does not support decorating with additional content
        assert && assertNoAdditionalChildren(this);
    }
};
Dialog.DialogIO = new IOType('DialogIO', {
    valueType: Dialog,
    // Since many Dialogs are dynamic elements, these need to be in the state. The value of the state object doesn't
    // matter, but it instead just serves as a marker to tell the state engine to recreate the Dialog (if dynamic) when
    // setting state.
    supertype: DynamicMarkerIO
});
export { Dialog as default };
// Default value for options.layoutStrategy, centers the Dialog in the layoutBounds.
function defaultLayoutStrategy(dialog, simBounds, screenBounds, scale) {
    if (dialog.layoutBounds) {
        dialog.center = dialog.layoutBounds.center;
    }
}
/**
 * @param dimension - width or height dimension
 * @param margin - margin to be applied to the dimension
 */ function applyDoubleMargin(dimension, margin) {
    return dimension > margin * 2 ? dimension - margin * 2 : dimension;
}
sun.register('Dialog', Dialog);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9EaWFsb2cudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogR2VuZXJhbCBkaWFsb2cgdHlwZS4gTWlncmF0ZWQgZnJvbSBKb2lzdCBvbiA0LzEwLzIwMThcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgQW5kcmVhIExpbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XG5pbXBvcnQgUGF0dGVyblN0cmluZ1Byb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUGF0dGVyblN0cmluZ1Byb3BlcnR5LmpzJztcbmltcG9ydCBUaW55UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UaW55UHJvcGVydHkuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IFNjcmVlblZpZXcgZnJvbSAnLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XG5pbXBvcnQgU2ltIGZyb20gJy4uLy4uL2pvaXN0L2pzL1NpbS5qcyc7XG5pbXBvcnQgZ2V0R2xvYmFsIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9nZXRHbG9iYWwuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCBDbG9zZUJ1dHRvbiBmcm9tICcuLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9DbG9zZUJ1dHRvbi5qcyc7XG5pbXBvcnQgeyBBbGlnbkJveCwgYXNzZXJ0Tm9BZGRpdGlvbmFsQ2hpbGRyZW4sIEZvY3VzTWFuYWdlciwgRnVsbFNjcmVlbiwgSEJveCwgS2V5Ym9hcmRMaXN0ZW5lciwgTm9kZSwgUGFyYWxsZWxET00sIFBET01QZWVyLCBQRE9NVXRpbHMsIFRDb2xvciwgVHJpbVBhcmFsbGVsRE9NT3B0aW9ucywgVkJveCwgdm9pY2luZ01hbmFnZXIgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IG51bGxTb3VuZFBsYXllciBmcm9tICcuLi8uLi90YW1iby9qcy9udWxsU291bmRQbGF5ZXIuanMnO1xuaW1wb3J0IHNoYXJlZFNvdW5kUGxheWVycyBmcm9tICcuLi8uLi90YW1iby9qcy9zaGFyZWRTb3VuZFBsYXllcnMuanMnO1xuaW1wb3J0IFRTb3VuZFBsYXllciBmcm9tICcuLi8uLi90YW1iby9qcy9UU291bmRQbGF5ZXIuanMnO1xuaW1wb3J0IFRhbmRlbSwgeyBEWU5BTUlDX0FSQ0hFVFlQRV9OQU1FIH0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgRHluYW1pY01hcmtlcklPIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9EeW5hbWljTWFya2VySU8uanMnO1xuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcbmltcG9ydCBVdHRlcmFuY2UgZnJvbSAnLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL1V0dGVyYW5jZS5qcyc7XG5pbXBvcnQgQnV0dG9uTm9kZSBmcm9tICcuL2J1dHRvbnMvQnV0dG9uTm9kZS5qcyc7XG5pbXBvcnQgUGFuZWwsIHsgUGFuZWxPcHRpb25zIH0gZnJvbSAnLi9QYW5lbC5qcyc7XG5pbXBvcnQgUG9wdXBhYmxlLCB7IFBvcHVwYWJsZU9wdGlvbnMgfSBmcm9tICcuL1BvcHVwYWJsZS5qcyc7XG5pbXBvcnQgc3VuIGZyb20gJy4vc3VuLmpzJztcbmltcG9ydCBTdW5TdHJpbmdzIGZyb20gJy4vU3VuU3RyaW5ncy5qcyc7XG5cbi8vIHNlZSBTZWxmT3B0aW9ucy50aXRsZUFsaWduXG50eXBlIERpYWxvZ1RpdGxlQWxpZ24gPSAnbGVmdCcgfCAncmlnaHQnIHwgJ2NlbnRlcic7XG5cbi8qKlxuICogc2VlIFNlbGZPcHRpb25zLmxheW91dFN0cmF0ZWd5XG4gKiBAcGFyYW0gZGlhbG9nXG4gKiBAcGFyYW0gc2ltQm91bmRzIC0gc2VlIFNpbS5ib3VuZHNQcm9wZXJ0eVxuICogQHBhcmFtIHNjcmVlbkJvdW5kcyAtIHNlZSBTaW0uc2NyZWVuQm91bmRzUHJvcGVydHlcbiAqIEBwYXJhbSBzY2FsZSAtIHNlZSBTaW0uc2NhbGVQcm9wZXJ0eVxuICovXG50eXBlIERpYWxvZ0xheW91dFN0cmF0ZWd5ID0gKCBkaWFsb2c6IERpYWxvZywgc2ltQm91bmRzOiBCb3VuZHMyLCBzY3JlZW5Cb3VuZHM6IEJvdW5kczIsIHNjYWxlOiBudW1iZXIgKSA9PiB2b2lkO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuXG4gIC8qIE1hcmdpbnMgYW5kIHNwYWNpbmc6XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heEhlaWdodE1hcmdpblxuICBfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXG4gIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgfFxuICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlQnV0dG9uIHxcbiAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3BNYXJnaW4gICAgICAgICAgICAgICAgICBUb3BNYXJnaW4gICB8XG4gIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICBffF9fXyAgICAgICAgfFxuICB8ICAgICAgICAgICAgICAgICAgX19fX19fX19fX19fX19fX19fX3xfX19fX19fX19fX19fX19fX19fXyAgICB8ICAgICB8ICAgICAgIHxcbm0gfC0tLS0tLS0tbC0tLS0tLS0tfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8LXgtfCAgWCAgfC0tLWMtLS18IG1cbmEgfCAgICAgICAgZSAgICAgICAgfCAgIFRpdGxlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFMgfF9fX19ffCAgIGwgICB8IGFcbnggfCAgICAgICAgZiAgICAgICAgfF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX198IFAgICAgICAgICAgIG8gICB8IHhcblcgfCAgICAgICAgdCAgICAgICAgfCAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGEgICAgICAgICAgIHMgICB8IFdcbmkgfCAgICAgICAgTSAgICAgICAgfCAgIHlTcGFjaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGMgICAgICAgICAgIGUgICB8IGlcbmQgfCAgICAgICAgYSAgICAgICAgfF9fX3xfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX198IGkgICAgICAgICAgIEIgICB8IGRcbnQgfCAgICAgICAgciAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IG4gICAgICAgICAgIHUgICB8IHRcbmggfCAgICAgICAgZyAgICAgICAgfCAgIENvbnRlbnQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGcgICAgICAgICAgIHQgICB8IGhcbk0gfCAgICAgICAgaSAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgIHQgICB8IE1cbmEgfCAgICAgICAgbiAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgIG8gICB8IGFcbnIgfCAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgIG4gICB8IHJcbmcgfCAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgIFIgICB8IGdcbmkgfCAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgIGkgICB8IGlcbm4gfCAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgIGcgICB8IG5cbiAgfCAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgIGggICB8XG4gIHwgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICBNICAgfFxuICB8ICAgICAgICAgICAgICAgICB8X19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX3wgICAgICAgICAgICAgYSAgIHxcbiAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHIgICB8XG4gIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnICAgfFxuICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvdHRvbU1hcmdpbiAgICAgICAgICAgICAgICAgICAgICAgaSAgIHxcbiAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG4gICB8XG4gIHxfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19ffF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19ffFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4SGVpZ2h0TWFyZ2luXG4gKi9cblxuICAvLyBNYXJnaW5zIGFuZCBzcGFjaW5nXG4gIHhTcGFjaW5nPzogbnVtYmVyOyAvLyBob3cgZmFyIHRoZSB0aXRsZSBhbmQgY29udGVudCBpcyBwbGFjZWQgdG8gdGhlIGxlZnQgb2YgdGhlIGNsb3NlIGJ1dHRvblxuICB5U3BhY2luZz86IG51bWJlcjsgLy8gdmVydGljYWwgc3BhY2UgYmV0d2VlbiB0aXRsZSBhbmQgY29udGVudFxuICB0b3BNYXJnaW4/OiBudW1iZXI7IC8vIG1hcmdpbiBhYm92ZSBjb250ZW50LCBvciBhYm92ZSB0aXRsZSBpZiBwcm92aWRlZFxuICBib3R0b21NYXJnaW4/OiBudW1iZXI7IC8vIG1hcmdpbiBiZWxvdyBjb250ZW50XG4gIGxlZnRNYXJnaW4/OiBudW1iZXIgfCBudWxsOyAvLyBtYXJnaW4gdG8gdGhlIGxlZnQgb2YgdGhlIGNvbnRlbnQuICBJZiBudWxsLCB0aGlzIGlzIGNvbXB1dGVkIHNvIHRoYXQgd2UgaGF2ZSB0aGUgc2FtZSBtYXJnaW5zIG9uIHRoZSBsZWZ0IGFuZCByaWdodCBvZiB0aGUgY29udGVudC5cbiAgbWF4V2lkdGhNYXJnaW4/OiBudW1iZXI7IC8vIHRoZSBtYXJnaW4gYmV0d2VlbiB0aGUgbGVmdC9yaWdodCBvZiB0aGUgbGF5b3V0Qm91bmRzIGFuZCB0aGUgZGlhbG9nLCBpZ25vcmVkIGlmIG1heFdpZHRoIGlzIHNwZWNpZmllZFxuICBtYXhIZWlnaHRNYXJnaW4/OiBudW1iZXI7IC8vIHRoZSBtYXJnaW4gYmV0d2VlbiB0aGUgdG9wL2JvdHRvbSBvZiB0aGUgbGF5b3V0Qm91bmRzIGFuZCB0aGUgZGlhbG9nLCBpZ25vcmVkIGlmIG1heEhlaWdodCBpcyBzcGVjaWZpZWRcbiAgY2xvc2VCdXR0b25MZW5ndGg/OiBudW1iZXI7IC8vIHdpZHRoIG9mIHRoZSBjbG9zZSBidXR0b25cbiAgY2xvc2VCdXR0b25Ub3BNYXJnaW4/OiBudW1iZXI7IC8vIG1hcmdpbiBhYm92ZSB0aGUgY2xvc2UgYnV0dG9uXG4gIGNsb3NlQnV0dG9uUmlnaHRNYXJnaW4/OiBudW1iZXI7IC8vIG1hcmdpbiB0byB0aGUgcmlnaHQgb2YgdGhlIGNsb3NlIGJ1dHRvblxuXG4gIC8vIHRpdGxlXG4gIHRpdGxlPzogTm9kZSB8IG51bGw7IC8vIFRpdGxlIHRvIGJlIGRpc3BsYXllZCBhdCB0b3AuIEZvciBhMTF5LCBpdHMgcHJpbWFyeSBzaWJsaW5nIG11c3QgaGF2ZSBhbiBhY2Nlc3NpYmxlIG5hbWUuXG4gIHRpdGxlQWxpZ24/OiBEaWFsb2dUaXRsZUFsaWduOyAvLyBob3Jpem9udGFsIGFsaWdubWVudFxuXG4gIC8vIFNldHMgdGhlIGRpYWxvZydzIHBvc2l0aW9uIGluIGdsb2JhbCBjb29yZGluYXRlcy5cbiAgbGF5b3V0U3RyYXRlZ3k/OiBEaWFsb2dMYXlvdXRTdHJhdGVneTtcblxuICAvLyBjbG9zZSBidXR0b24gb3B0aW9uc1xuICBjbG9zZUJ1dHRvbkxpc3RlbmVyPzogKCkgPT4gdm9pZDtcbiAgY2xvc2VCdXR0b25Db2xvcj86IFRDb2xvcjtcbiAgY2xvc2VCdXR0b25Ub3VjaEFyZWFYRGlsYXRpb24/OiBudW1iZXI7XG4gIGNsb3NlQnV0dG9uVG91Y2hBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xuICBjbG9zZUJ1dHRvbk1vdXNlQXJlYVhEaWxhdGlvbj86IG51bWJlcjtcbiAgY2xvc2VCdXR0b25Nb3VzZUFyZWFZRGlsYXRpb24/OiBudW1iZXI7XG5cbiAgLy8gSWYgcHJvdmlkZWQgdXNlIHRoaXMgZGlhbG9nIHRpdGxlIGluIHRoZSBDbG9zZSBidXR0b24gdm9pY2luZ05hbWVSZXNwb25zZS4gVGhpcyBzaG91bGQgYmUgcHJvdmlkZWRcbiAgLy8gZm9yIHByb3BlciBEaWFsb2cgVm9pY2luZyBkZXNpZ24uXG4gIGNsb3NlQnV0dG9uVm9pY2luZ0RpYWxvZ1RpdGxlPzogc3RyaW5nIHwgVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiB8IG51bGw7XG5cbiAgLy8gQnkgZGVmYXVsdCwgdGhlIGNsb3NlIGJ1dHRvbiBpcyBwbGFjZWQgZmlyc3QgaW4gdGhlIFBET01PcmRlciAoYW5kIHRodXMgdGhlIGZvY3VzIG9yZGVyKS4gU2V0IHRoaXMgdG8gdHJ1ZVxuICAvLyBpZiB5b3Ugd2FudCB0aGUgY2xvc2UgYnV0dG9uIHRvIGJlIHRoZSBsYXN0IGVsZW1lbnQgaW4gdGhlIGZvY3VzIG9yZGVyIGZvciB0aGUgRGlhbG9nLlxuICBjbG9zZUJ1dHRvbkxhc3RJblBET00/OiBib29sZWFuO1xuXG4gIC8vIHNvdW5kIGdlbmVyYXRpb25cbiAgb3BlbmVkU291bmRQbGF5ZXI/OiBUU291bmRQbGF5ZXI7XG4gIGNsb3NlZFNvdW5kUGxheWVyPzogVFNvdW5kUGxheWVyO1xuXG4gIHNpbT86IFNpbTtcblxuICAvLyBDYWxsZWQgYWZ0ZXIgdGhlIGRpYWxvZyBpcyBzaG93biwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvNDc4XG4gIHNob3dDYWxsYmFjaz86ICggKCkgPT4gdm9pZCApIHwgbnVsbDtcblxuICAvLyBDYWxsZWQgYWZ0ZXIgdGhlIGRpYWxvZyBpcyBoaWRkZW4sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzQ3OFxuICBoaWRlQ2FsbGJhY2s/OiAoICgpID0+IHZvaWQgKSB8IG51bGw7XG59O1xuXG50eXBlIFBhcmVudE9wdGlvbnMgPSBQYW5lbE9wdGlvbnMgJiBQb3B1cGFibGVPcHRpb25zO1xuXG50eXBlIFRyaW1tZWRQYXJlbnRPcHRpb25zID0gVHJpbVBhcmFsbGVsRE9NT3B0aW9uczxQYXJlbnRPcHRpb25zPjtcbmV4cG9ydCB0eXBlIERpYWxvZ09wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8VHJpbW1lZFBhcmVudE9wdGlvbnMsICd4TWFyZ2luJyB8ICd5TWFyZ2luJz47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpYWxvZyBleHRlbmRzIFBvcHVwYWJsZSggUGFuZWwsIDEgKSB7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBjbG9zZUJ1dHRvbjogQ2xvc2VCdXR0b247XG4gIHByaXZhdGUgcmVhZG9ubHkgc2ltOiBTaW07XG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZURpYWxvZzogKCkgPT4gdm9pZDtcblxuICAvKipcbiAgICogQHBhcmFtIGNvbnRlbnQgLSBUaGUgY29udGVudCB0byBkaXNwbGF5IGluc2lkZSB0aGUgZGlhbG9nIChub3QgaW5jbHVkaW5nIHRoZSB0aXRsZSlcbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9uc1xuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjb250ZW50OiBOb2RlLCBwcm92aWRlZE9wdGlvbnM/OiBEaWFsb2dPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxEaWFsb2dPcHRpb25zLCBTZWxmT3B0aW9ucywgUGFyZW50T3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyBEaWFsb2dPcHRpb25zXG4gICAgICB4U3BhY2luZzogMTAsXG4gICAgICB5U3BhY2luZzogMTAsXG4gICAgICB0b3BNYXJnaW46IDE1LFxuICAgICAgYm90dG9tTWFyZ2luOiAxNSxcbiAgICAgIGxlZnRNYXJnaW46IG51bGwsXG4gICAgICBtYXhXaWR0aE1hcmdpbjogMTIsXG4gICAgICBtYXhIZWlnaHRNYXJnaW46IDEyLFxuICAgICAgY2xvc2VCdXR0b25MZW5ndGg6IDE4LjIsXG4gICAgICBjbG9zZUJ1dHRvblRvcE1hcmdpbjogMTAsXG4gICAgICBjbG9zZUJ1dHRvblJpZ2h0TWFyZ2luOiAxMCxcbiAgICAgIHRpdGxlOiBudWxsLFxuICAgICAgdGl0bGVBbGlnbjogJ2NlbnRlcicsXG4gICAgICBsYXlvdXRTdHJhdGVneTogZGVmYXVsdExheW91dFN0cmF0ZWd5LFxuICAgICAgY2xvc2VCdXR0b25MaXN0ZW5lcjogKCkgPT4gdGhpcy5oaWRlKCksXG4gICAgICBjbG9zZUJ1dHRvbkNvbG9yOiAnYmxhY2snLFxuICAgICAgY2xvc2VCdXR0b25Ub3VjaEFyZWFYRGlsYXRpb246IDAsXG4gICAgICBjbG9zZUJ1dHRvblRvdWNoQXJlYVlEaWxhdGlvbjogMCxcbiAgICAgIGNsb3NlQnV0dG9uTW91c2VBcmVhWERpbGF0aW9uOiAwLFxuICAgICAgY2xvc2VCdXR0b25Nb3VzZUFyZWFZRGlsYXRpb246IDAsXG4gICAgICBjbG9zZUJ1dHRvblZvaWNpbmdEaWFsb2dUaXRsZTogbnVsbCxcbiAgICAgIGNsb3NlQnV0dG9uTGFzdEluUERPTTogZmFsc2UsXG4gICAgICBvcGVuZWRTb3VuZFBsYXllcjogc2hhcmVkU291bmRQbGF5ZXJzLmdldCggJ2dlbmVyYWxPcGVuJyApLFxuICAgICAgY2xvc2VkU291bmRQbGF5ZXI6IHNoYXJlZFNvdW5kUGxheWVycy5nZXQoICdnZW5lcmFsQ2xvc2UnICksXG4gICAgICBzaW06IGdldEdsb2JhbCggJ3BoZXQuam9pc3Quc2ltJyApLFxuICAgICAgc2hvd0NhbGxiYWNrOiBudWxsLFxuICAgICAgaGlkZUNhbGxiYWNrOiBudWxsLFxuXG4gICAgICAvLyBQb3B1cGFibGVPcHRpb25zXG4gICAgICBsYXlvdXRCb3VuZHM6IFNjcmVlblZpZXcuREVGQVVMVF9MQVlPVVRfQk9VTkRTLFxuICAgICAgZm9jdXNPblNob3dOb2RlOiBudWxsLFxuXG4gICAgICAvLyBQYW5lbE9wdGlvbnNcbiAgICAgIGNvcm5lclJhZGl1czogMTAsIC8vIHtudW1iZXJ9IHJhZGl1cyBvZiB0aGUgZGlhbG9nJ3MgY29ybmVyc1xuICAgICAgcmVzaXplOiB0cnVlLCAvLyB7Ym9vbGVhbn0gd2hldGhlciB0byByZXNpemUgaWYgY29udGVudCdzIHNpemUgY2hhbmdlc1xuICAgICAgZmlsbDogJ3doaXRlJywgLy8ge3N0cmluZ3xDb2xvcn1cbiAgICAgIHN0cm9rZTogJ2JsYWNrJywgLy8ge3N0cmluZ3xDb2xvcn1cbiAgICAgIGJhY2tncm91bmRQaWNrYWJsZTogdHJ1ZSxcbiAgICAgIG1heEhlaWdodDogbnVsbCwgLy8gaWYgbm90IHByb3ZpZGVkLCB0aGVuIGR5bmFtaWNhbGx5IGNhbGN1bGF0ZSBiYXNlZCBvbiB0aGUgbGF5b3V0Qm91bmRzIG9mIHRoZSBjdXJyZW50IHNjcmVlbiwgc2VlIHVwZGF0ZUxheW91dE11bHRpbGlua1xuICAgICAgbWF4V2lkdGg6IG51bGwsIC8vIGlmIG5vdCBwcm92aWRlZCwgdGhlbiBkeW5hbWljYWxseSBjYWxjdWxhdGUgYmFzZWQgb24gdGhlIGxheW91dEJvdW5kcyBvZiB0aGUgY3VycmVudCBzY3JlZW4sIHNlZSB1cGRhdGVMYXlvdXRNdWx0aWxpbmtcblxuICAgICAgLy8gcGhldC1pb1xuICAgICAgdGFuZGVtTmFtZVN1ZmZpeDogWyAnRGlhbG9nJywgRFlOQU1JQ19BUkNIRVRZUEVfTkFNRSBdLCAvLyBEWU5BTUlDX0FSQ0hFVFlQRV9OQU1FIG1lYW5zIHRoYXQgdGhpcyBEaWFsb2cgaXMgYW4gYXJjaGV0eXBlLlxuICAgICAgcGhldGlvVHlwZTogRGlhbG9nLkRpYWxvZ0lPLFxuICAgICAgcGhldGlvU3RhdGU6IHRydWUsIC8vIERpYWxvZyBpcyBvZnRlbiBhIGR5bmFtaWMgZWxlbWVudCwgYW5kIHRodXMgbmVlZHMgdG8gYmUgaW4gc3RhdGUgdG8gdHJpZ2dlciBlbGVtZW50IGNyZWF0aW9uLlxuICAgICAgcGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkOiBmYWxzZSwgLy8gdmlzaWJsZSBpc24ndCB0b2dnbGVkIHdoZW4gc2hvd2luZyBhIERpYWxvZ1xuXG4gICAgICAvLyBwZG9tIG9wdGlvbnNcbiAgICAgIHRhZ05hbWU6ICdkaXYnLFxuICAgICAgYXJpYVJvbGU6ICdkaWFsb2cnLFxuICAgICAgcG9zaXRpb25JblBET006IHRydWVcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuc2ltLCAnc2ltIG11c3QgYmUgcHJvdmlkZWQsIGFzIERpYWxvZyBuZWVkcyBhIFNpbSBpbnN0YW5jZScgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMueE1hcmdpbiA9PT0gdW5kZWZpbmVkLCAnRGlhbG9nIHNldHMgeE1hcmdpbicgKTtcbiAgICBvcHRpb25zLnhNYXJnaW4gPSAwO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMueU1hcmdpbiA9PT0gdW5kZWZpbmVkLCAnRGlhbG9nIHNldHMgeU1hcmdpbicgKTtcbiAgICBvcHRpb25zLnlNYXJnaW4gPSAwO1xuXG4gICAgLy8gaWYgbGVmdCBtYXJnaW4gaXMgc3BlY2lmaWVkIGluIG9wdGlvbnMsIHVzZSBpdC4gb3RoZXJ3aXNlLCBzZXQgaXQgdG8gbWFrZSB0aGUgbGVmdCByaWdodCBndXR0ZXJzIHN5bW1ldHJpY2FsXG4gICAgaWYgKCBvcHRpb25zLmxlZnRNYXJnaW4gPT09IG51bGwgKSB7XG4gICAgICBvcHRpb25zLmxlZnRNYXJnaW4gPSBvcHRpb25zLnhTcGFjaW5nICsgb3B0aW9ucy5jbG9zZUJ1dHRvbkxlbmd0aCArIG9wdGlvbnMuY2xvc2VCdXR0b25SaWdodE1hcmdpbjtcbiAgICB9XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLm1heEhlaWdodCA9PT0gbnVsbCB8fCB0eXBlb2Ygb3B0aW9ucy5tYXhIZWlnaHQgPT09ICdudW1iZXInICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5tYXhXaWR0aCA9PT0gbnVsbCB8fCB0eXBlb2Ygb3B0aW9ucy5tYXhXaWR0aCA9PT0gJ251bWJlcicgKTtcblxuICAgIC8vIEFwcGx5IG1heFdpZHRoL21heEhlaWdodCBkZXBlbmRpbmcgb24gdGhlIG1hcmdpbnMgYW5kIGxheW91dEJvdW5kc1xuICAgIGlmICggIW9wdGlvbnMubWF4V2lkdGggJiYgb3B0aW9ucy5sYXlvdXRCb3VuZHMgKSB7XG4gICAgICBvcHRpb25zLm1heFdpZHRoID0gYXBwbHlEb3VibGVNYXJnaW4oIG9wdGlvbnMubGF5b3V0Qm91bmRzLndpZHRoLCBvcHRpb25zLm1heFdpZHRoTWFyZ2luICk7XG4gICAgfVxuICAgIGlmICggIW9wdGlvbnMubWF4SGVpZ2h0ICYmIG9wdGlvbnMubGF5b3V0Qm91bmRzICkge1xuICAgICAgb3B0aW9ucy5tYXhIZWlnaHQgPSBhcHBseURvdWJsZU1hcmdpbiggb3B0aW9ucy5sYXlvdXRCb3VuZHMuaGVpZ2h0LCBvcHRpb25zLm1heEhlaWdodE1hcmdpbiApO1xuICAgIH1cblxuICAgIC8vIFdlIG5lZWQgYW4gXCJ1bmF0dGFjaGVkXCIgdXR0ZXJhbmNlIHNvIHRoYXQgd2hlbiB0aGUgY2xvc2UgYnV0dG9uIGZpcmVzLCBoaWRpbmcgdGhlIGNsb3NlIGJ1dHRvbiwgd2Ugc3RpbGwgaGVhclxuICAgIC8vIHRoZSBjb250ZXh0IHJlc3BvbnNlLiBCdXQgd2Ugc3RpbGwgc2hvdWxkIG9ubHkgaGVhciB0aGlzIGNvbnRleHQgcmVzcG9uc2Ugd2hlbiBcIlNpbSBWb2ljaW5nXCIgaXMgZW5hYmxlZC5cbiAgICBjb25zdCBjb250ZXh0UmVzcG9uc2VVdHRlcmFuY2UgPSBuZXcgVXR0ZXJhbmNlKCB7XG4gICAgICBwcmlvcml0eTogVXR0ZXJhbmNlLk1FRElVTV9QUklPUklUWSxcbiAgICAgIHZvaWNpbmdDYW5Bbm5vdW5jZVByb3BlcnRpZXM6IFsgdm9pY2luZ01hbmFnZXIudm9pY2luZ0Z1bGx5RW5hYmxlZFByb3BlcnR5IF1cbiAgICB9ICk7XG5cbiAgICAvLyBjcmVhdGUgY2xvc2UgYnV0dG9uIC0gYSBmbGF0IFwiWFwiXG4gICAgY29uc3QgY2xvc2VCdXR0b24gPSBuZXcgQ2xvc2VCdXR0b24oIHtcbiAgICAgIGljb25MZW5ndGg6IG9wdGlvbnMuY2xvc2VCdXR0b25MZW5ndGgsXG4gICAgICBiYXNlQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgICBidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3k6IEJ1dHRvbk5vZGUuRmxhdEFwcGVhcmFuY2VTdHJhdGVneSxcblxuICAgICAgLy8gbm8gbWFyZ2lucyBzaW5jZSB0aGUgZmxhdCBYIHRha2VzIHVwIGFsbCB0aGUgc3BhY2VcbiAgICAgIHhNYXJnaW46IDAsXG4gICAgICB5TWFyZ2luOiAwLFxuXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xuXG4gICAgICAgIC8vIENvbnRleHQgcmVzcG9uc2UgZmlyc3QsIGJlZm9yZSBwb3RlbnRpYWxseSBjaGFuZ2luZyBmb2N1cyB3aXRoIHRoZSBjYWxsYmFjayBsaXN0ZW5lclxuICAgICAgICBjbG9zZUJ1dHRvbi52b2ljaW5nU3BlYWtDb250ZXh0UmVzcG9uc2UoIHtcbiAgICAgICAgICB1dHRlcmFuY2U6IGNvbnRleHRSZXNwb25zZVV0dGVyYW5jZVxuICAgICAgICB9ICk7XG5cbiAgICAgICAgb3B0aW9ucy5jbG9zZUJ1dHRvbkxpc3RlbmVyKCk7XG4gICAgICB9LFxuXG4gICAgICBwYXRoT3B0aW9uczoge1xuICAgICAgICBzdHJva2U6IG9wdGlvbnMuY2xvc2VCdXR0b25Db2xvclxuICAgICAgfSxcblxuICAgICAgLy8gcGhldC1pb1xuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAnY2xvc2VCdXR0b24nICksXG4gICAgICBwaGV0aW9TdGF0ZTogZmFsc2UsIC8vIGNsb3NlIGJ1dHRvbiBzaG91bGQgbm90IGJlIGluIHN0YXRlXG5cbiAgICAgIC8vIEl0IGlzIGEgdXNhYmlsaXR5IGNvbmNlcm4gdG8gY2hhbmdlIGVpdGhlciBvZiB0aGVzZSwgYWxzbyB0aGVyZSBhcmUgb3RoZXIgd2F5cyB0byBleGl0IGEgRGlhbG9nLCBzbyB1c2luZ1xuICAgICAgLy8gdGhlc2UgaXMgYnVnZ3kuXG4gICAgICBwaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQ6IGZhbHNlLFxuICAgICAgcGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkOiBmYWxzZSxcblxuICAgICAgLy8gdHVybiBvZmYgZGVmYXVsdCBzb3VuZCBnZW5lcmF0aW9uLCBEaWFsb2cgd2lsbCBjcmVhdGUgaXRzIG93biBzb3VuZHNcbiAgICAgIHNvdW5kUGxheWVyOiBudWxsU291bmRQbGF5ZXIsXG5cbiAgICAgIC8vIHZvaWNpbmdcbiAgICAgIHZvaWNpbmdDb250ZXh0UmVzcG9uc2U6IFN1blN0cmluZ3MuYTExeS5jbG9zZWRTdHJpbmdQcm9wZXJ0eVxuICAgIH0gKTtcblxuXG4gICAgbGV0IGNsb3NlQnV0dG9uVm9pY2luZ05hbWVSZXNwb25zZVByb3BlcnR5OiBQYXR0ZXJuU3RyaW5nUHJvcGVydHk8eyB0aXRsZTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiB9PjtcbiAgICBpZiAoIG9wdGlvbnMuY2xvc2VCdXR0b25Wb2ljaW5nRGlhbG9nVGl0bGUgKSB7XG4gICAgICBjb25zdCB0aXRsZVByb3BlcnR5ID0gdHlwZW9mIG9wdGlvbnMuY2xvc2VCdXR0b25Wb2ljaW5nRGlhbG9nVGl0bGUgPT09ICdzdHJpbmcnID8gbmV3IFRpbnlQcm9wZXJ0eSggb3B0aW9ucy5jbG9zZUJ1dHRvblZvaWNpbmdEaWFsb2dUaXRsZSApIDogb3B0aW9ucy5jbG9zZUJ1dHRvblZvaWNpbmdEaWFsb2dUaXRsZTtcbiAgICAgIGNsb3NlQnV0dG9uVm9pY2luZ05hbWVSZXNwb25zZVByb3BlcnR5ID0gY2xvc2VCdXR0b24udm9pY2luZ05hbWVSZXNwb25zZSA9IG5ldyBQYXR0ZXJuU3RyaW5nUHJvcGVydHkoIFN1blN0cmluZ3MuYTExeS50aXRsZUNsb3NlUGF0dGVyblN0cmluZ1Byb3BlcnR5LCB7IHRpdGxlOiB0aXRsZVByb3BlcnR5IH0sIHsgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCB9ICk7XG4gICAgfVxuXG4gICAgLy8gdG91Y2gvbW91c2UgYXJlYXMgZm9yIHRoZSBjbG9zZSBidXR0b25cbiAgICBjbG9zZUJ1dHRvbi50b3VjaEFyZWEgPSBjbG9zZUJ1dHRvbi5ib3VuZHMuZGlsYXRlZFhZKFxuICAgICAgb3B0aW9ucy5jbG9zZUJ1dHRvblRvdWNoQXJlYVhEaWxhdGlvbixcbiAgICAgIG9wdGlvbnMuY2xvc2VCdXR0b25Ub3VjaEFyZWFZRGlsYXRpb25cbiAgICApO1xuICAgIGNsb3NlQnV0dG9uLm1vdXNlQXJlYSA9IGNsb3NlQnV0dG9uLmJvdW5kcy5kaWxhdGVkWFkoXG4gICAgICBvcHRpb25zLmNsb3NlQnV0dG9uTW91c2VBcmVhWERpbGF0aW9uLFxuICAgICAgb3B0aW9ucy5jbG9zZUJ1dHRvbk1vdXNlQXJlYVlEaWxhdGlvblxuICAgICk7XG5cbiAgICAvLyBBIGNvbnRhaW5lciBOb2RlIGZvciB0aGUgYWNjZXNzaWJsZSBuYW1lIGFuZCBoZWxwIHRleHQgZm9yIHRoZSBEaWFsb2cuXG4gICAgY29uc3QgcGRvbU5vZGUgPSBuZXcgTm9kZSgge1xuICAgICAgdGFnTmFtZTogJ2RpdicsXG4gICAgICBsYWJlbFRhZ05hbWU6ICdoMSdcbiAgICB9ICk7XG5cbiAgICAvLyBwZG9tIC0gc2V0IHRoZSBvcmRlciBvZiBjb250ZW50LCBjbG9zZSBidXR0b24gZmlyc3Qgc28gcmVtYWluaW5nIGNvbnRlbnQgY2FuIGJlIHJlYWQgZnJvbSB0b3AgdG8gYm90dG9tXG4gICAgLy8gd2l0aCB2aXJ0dWFsIGN1cnNvclxuICAgIGxldCBwZG9tT3JkZXIgPSBbIHBkb21Ob2RlLCBvcHRpb25zLnRpdGxlLCBjb250ZW50IF07XG4gICAgb3B0aW9ucy5jbG9zZUJ1dHRvbkxhc3RJblBET00gPyBwZG9tT3JkZXIucHVzaCggY2xvc2VCdXR0b24gKSA6IHBkb21PcmRlci51bnNoaWZ0KCBjbG9zZUJ1dHRvbiApO1xuICAgIHBkb21PcmRlciA9IHBkb21PcmRlci5maWx0ZXIoIG5vZGUgPT4gbm9kZSAhPT0gdW5kZWZpbmVkICYmIG5vZGUgIT09IG51bGwgKTtcblxuICAgIC8vIHBkb20gLSBmYWxsIGJhY2sgdG8gZm9jdXNpbmcgdGhlIGNsb3NlQnV0dG9uIGJ5IGRlZmF1bHQgaWYgdGhlcmUgaXMgbm8gZm9jdXNPblNob3dOb2RlIG9yIHRoZVxuICAgIC8vIGNvbnRlbnQgaXMgbm90IGZvY3VzYWJsZVxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBkb21PcmRlclsgMCBdICk7XG4gICAgb3B0aW9ucy5mb2N1c09uU2hvd05vZGUgPSBvcHRpb25zLmZvY3VzT25TaG93Tm9kZSA/IG9wdGlvbnMuZm9jdXNPblNob3dOb2RlIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBkb21PcmRlclsgMCBdIS5mb2N1c2FibGUgPyBwZG9tT3JkZXJbIDAgXSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZUJ1dHRvbjtcblxuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5mb2N1c09uU2hvd05vZGUgaW5zdGFuY2VvZiBOb2RlLCAnc2hvdWxkIGJlIG5vbi1udWxsIGFuZCBkZWZpbmVkJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuZm9jdXNPblNob3dOb2RlIS5mb2N1c2FibGUsICdmb2N1c09uU2hvd05vZGUgbXVzdCBiZSBmb2N1c2FibGUuJyApO1xuXG4gICAgLy8gQWxpZ24gY29udGVudCwgdGl0bGUsIGFuZCBjbG9zZSBidXR0b24gdXNpbmcgc3BhY2luZyBhbmQgbWFyZ2luIG9wdGlvbnNcblxuICAgIC8vIGFsaWduIGNvbnRlbnQgYW5kIHRpdGxlIChpZiBwcm92aWRlZCkgdmVydGljYWxseVxuICAgIGNvbnN0IGNvbnRlbnRBbmRUaXRsZSA9IG5ldyBWQm94KCB7XG4gICAgICBjaGlsZHJlbjogb3B0aW9ucy50aXRsZSA/IFsgb3B0aW9ucy50aXRsZSwgY29udGVudCBdIDogWyBjb250ZW50IF0sXG4gICAgICBzcGFjaW5nOiBvcHRpb25zLnlTcGFjaW5nLFxuICAgICAgYWxpZ246IG9wdGlvbnMudGl0bGVBbGlnblxuICAgIH0gKTtcblxuICAgIC8vIGFkZCB0b3BNYXJnaW4sIGJvdHRvbU1hcmdpbiwgYW5kIGxlZnRNYXJnaW5cbiAgICBjb25zdCBjb250ZW50QW5kVGl0bGVXaXRoTWFyZ2lucyA9IG5ldyBBbGlnbkJveCggY29udGVudEFuZFRpdGxlLCB7XG4gICAgICB0b3BNYXJnaW46IG9wdGlvbnMudG9wTWFyZ2luLFxuICAgICAgYm90dG9tTWFyZ2luOiBvcHRpb25zLmJvdHRvbU1hcmdpbixcbiAgICAgIGxlZnRNYXJnaW46IG9wdGlvbnMubGVmdE1hcmdpblxuICAgIH0gKTtcblxuICAgIC8vIGFkZCBjbG9zZUJ1dHRvblRvcE1hcmdpbiBhbmQgY2xvc2VCdXR0b25SaWdodE1hcmdpblxuICAgIGNvbnN0IGNsb3NlQnV0dG9uV2l0aE1hcmdpbnMgPSBuZXcgQWxpZ25Cb3goIGNsb3NlQnV0dG9uLCB7XG4gICAgICB0b3BNYXJnaW46IG9wdGlvbnMuY2xvc2VCdXR0b25Ub3BNYXJnaW4sXG4gICAgICByaWdodE1hcmdpbjogb3B0aW9ucy5jbG9zZUJ1dHRvblJpZ2h0TWFyZ2luXG4gICAgfSApO1xuXG4gICAgLy8gY3JlYXRlIGNvbnRlbnQgZm9yIFBhbmVsXG4gICAgY29uc3QgZGlhbG9nQ29udGVudCA9IG5ldyBIQm94KCB7XG4gICAgICBjaGlsZHJlbjogWyBwZG9tTm9kZSwgY29udGVudEFuZFRpdGxlV2l0aE1hcmdpbnMsIGNsb3NlQnV0dG9uV2l0aE1hcmdpbnMgXSxcbiAgICAgIHNwYWNpbmc6IG9wdGlvbnMueFNwYWNpbmcsXG4gICAgICBhbGlnbjogJ3RvcCdcbiAgICB9ICk7XG5cbiAgICBzdXBlciggZGlhbG9nQ29udGVudCwgb3B0aW9ucyApO1xuXG4gICAgLy8gVGhlIERpYWxvZydzIGRpc3BsYXkgcnVucyBvbiB0aGlzIFByb3BlcnR5LCBzbyBhZGQgdGhlIGxpc3RlbmVyIHRoYXQgY29udHJvbHMgc2hvdy9oaWRlLlxuICAgIHRoaXMuaXNTaG93aW5nUHJvcGVydHkubGF6eUxpbmsoIGlzU2hvd2luZyA9PiB7XG4gICAgICBpZiAoIGlzU2hvd2luZyApIHtcbiAgICAgICAgLy8gc291bmQgZ2VuZXJhdGlvblxuICAgICAgICBvcHRpb25zLm9wZW5lZFNvdW5kUGxheWVyLnBsYXkoKTtcblxuICAgICAgICAvLyBEbyB0aGlzIGxhc3RcbiAgICAgICAgb3B0aW9ucy5zaG93Q2FsbGJhY2sgJiYgb3B0aW9ucy5zaG93Q2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyBzb3VuZCBnZW5lcmF0aW9uXG4gICAgICAgIG9wdGlvbnMuY2xvc2VkU291bmRQbGF5ZXIucGxheSgpO1xuXG4gICAgICAgIC8vIERvIHRoaXMgbGFzdFxuICAgICAgICBvcHRpb25zLmhpZGVDYWxsYmFjayAmJiBvcHRpb25zLmhpZGVDYWxsYmFjaygpO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIHRoaXMuc2ltID0gb3B0aW9ucy5zaW07XG4gICAgdGhpcy5jbG9zZUJ1dHRvbiA9IGNsb3NlQnV0dG9uO1xuXG4gICAgY29uc3QgdXBkYXRlTGF5b3V0TXVsdGlsaW5rID0gTXVsdGlsaW5rLm11bHRpbGluayggW1xuICAgICAgdGhpcy5zaW0uYm91bmRzUHJvcGVydHksXG4gICAgICB0aGlzLnNpbS5zY3JlZW5Cb3VuZHNQcm9wZXJ0eSxcbiAgICAgIHRoaXMuc2ltLnNjYWxlUHJvcGVydHksXG4gICAgICB0aGlzLnNpbS5zZWxlY3RlZFNjcmVlblByb3BlcnR5LFxuICAgICAgdGhpcy5pc1Nob3dpbmdQcm9wZXJ0eSxcbiAgICAgIHRoaXMubG9jYWxCb3VuZHNQcm9wZXJ0eVxuICAgIF0sICggYm91bmRzLCBzY3JlZW5Cb3VuZHMsIHNjYWxlICkgPT4ge1xuICAgICAgaWYgKCBib3VuZHMgJiYgc2NyZWVuQm91bmRzICYmIHNjYWxlICkge1xuICAgICAgICBvcHRpb25zLmxheW91dFN0cmF0ZWd5KCB0aGlzLCBib3VuZHMsIHNjcmVlbkJvdW5kcywgc2NhbGUgKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICAvLyBTZXR0ZXIgYWZ0ZXIgdGhlIHN1cGVyIGNhbGxcbiAgICB0aGlzLnBkb21PcmRlciA9IHBkb21PcmRlcjtcblxuICAgIFBhcmFsbGVsRE9NLmZvcndhcmRBY2Nlc3NpYmxlTmFtZSggdGhpcywgcGRvbU5vZGUgKTtcbiAgICBQYXJhbGxlbERPTS5mb3J3YXJkSGVscFRleHQoIHRoaXMsIHBkb21Ob2RlICk7XG5cbiAgICAvLyBJZiBubyBhY2Nlc3NpYmxlTmFtZSBoYXMgYmVlbiBwcm92aWRlZCwgdHJ5IHRvIGZpbmQgb25lIGZyb20gdGhlIHRpdGxlIGJ5IGRlZmF1bHRcbiAgICBpZiAoICFvcHRpb25zLmFjY2Vzc2libGVOYW1lICYmIG9wdGlvbnMudGl0bGUgKSB7XG4gICAgICB0aGlzLmFjY2Vzc2libGVOYW1lID0gUERPTVV0aWxzLmZpbmRTdHJpbmdQcm9wZXJ0eSggb3B0aW9ucy50aXRsZSApO1xuICAgIH1cblxuICAgIC8vIHBkb20gLSBzZXQgdGhlIGFyaWEtbGFiZWxsZWRieSByZWxhdGlvbiBzbyB0aGF0IHdoZW5ldmVyIGZvY3VzIGVudGVycyB0aGUgZGlhbG9nIHRoZSBhY2Nlc3NpYmxlIG5hbWUgaXMgcmVhZFxuICAgIHRoaXMuYWRkQXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbigge1xuICAgICAgdGhpc0VsZW1lbnROYW1lOiBQRE9NUGVlci5QUklNQVJZX1NJQkxJTkcsXG4gICAgICBvdGhlck5vZGU6IHBkb21Ob2RlLFxuICAgICAgb3RoZXJFbGVtZW50TmFtZTogUERPTVBlZXIuTEFCRUxfU0lCTElOR1xuICAgIH0gKTtcblxuICAgIC8vIHBkb20gLSBjbG9zZSB0aGUgZGlhbG9nIHdoZW4gcHJlc3NpbmcgXCJlc2NhcGVcIlxuICAgIGNvbnN0IGtleWJvYXJkTGlzdGVuZXIgPSBuZXcgS2V5Ym9hcmRMaXN0ZW5lcigge1xuICAgICAga2V5czogWyAnZXNjYXBlJywgJ3RhYicsICdzaGlmdCt0YWInIF0sXG4gICAgICBmaXJlOiAoIGV2ZW50LCBrZXlzUHJlc3NlZCApID0+IHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZXZlbnQsICdldmVudCBzaG91bGQgYmUgbm9uLW51bGwgYW5kIGRlZmluZWQgZm9yIHRoaXMgbGlzdGVuZXInICk7XG4gICAgICAgIGNvbnN0IGRvbUV2ZW50ID0gZXZlbnQhO1xuXG4gICAgICAgIGlmICgga2V5c1ByZXNzZWQgPT09ICdlc2NhcGUnICkge1xuICAgICAgICAgIGRvbUV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoICgga2V5c1ByZXNzZWQgPT09ICd0YWInIHx8IGtleXNQcmVzc2VkID09PSAnc2hpZnQrdGFiJyApICYmIEZ1bGxTY3JlZW4uaXNGdWxsU2NyZWVuKCkgKSB7XG5cbiAgICAgICAgICAvLyBwcmV2ZW50IGEgcGFydGljdWxhciBidWcgaW4gV2luZG93cyA3LzguMSBGaXJlZm94IHdoZXJlIGZvY3VzIGdldHMgdHJhcHBlZCBpbiB0aGUgZG9jdW1lbnRcbiAgICAgICAgICAvLyB3aGVuIHRoZSBuYXZpZ2F0aW9uIGJhciBpcyBoaWRkZW4gYW5kIHRoZXJlIGlzIG9ubHkgb25lIGZvY3VzYWJsZSBlbGVtZW50IGluIHRoZSBET01cbiAgICAgICAgICAvLyBzZWUgaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9OTEwMTM2XG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggRm9jdXNNYW5hZ2VyLnBkb21Gb2N1cyApOyAvLyB7Rm9jdXN8bnVsbH1cbiAgICAgICAgICBjb25zdCBhY3RpdmVJZCA9IEZvY3VzTWFuYWdlci5wZG9tRm9jdXMhLnRyYWlsLmdldFVuaXF1ZUlkKCk7XG4gICAgICAgICAgY29uc3Qgbm9OZXh0Rm9jdXNhYmxlID0gUERPTVV0aWxzLmdldE5leHRGb2N1c2FibGUoKS5pZCA9PT0gYWN0aXZlSWQ7XG4gICAgICAgICAgY29uc3Qgbm9QcmV2aW91c0ZvY3VzYWJsZSA9IFBET01VdGlscy5nZXRQcmV2aW91c0ZvY3VzYWJsZSgpLmlkID09PSBhY3RpdmVJZDtcblxuICAgICAgICAgIGlmICggbm9OZXh0Rm9jdXNhYmxlICYmIG5vUHJldmlvdXNGb2N1c2FibGUgKSB7XG4gICAgICAgICAgICBkb21FdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gKTtcbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIGtleWJvYXJkTGlzdGVuZXIgKTtcblxuICAgIHRoaXMuZGlzcG9zZURpYWxvZyA9ICgpID0+IHtcbiAgICAgIHVwZGF0ZUxheW91dE11bHRpbGluay5kaXNwb3NlKCk7XG4gICAgICBjbG9zZUJ1dHRvbldpdGhNYXJnaW5zLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMucmVtb3ZlSW5wdXRMaXN0ZW5lcigga2V5Ym9hcmRMaXN0ZW5lciApO1xuICAgICAga2V5Ym9hcmRMaXN0ZW5lci5kaXNwb3NlKCk7XG5cbiAgICAgIGNsb3NlQnV0dG9uVm9pY2luZ05hbWVSZXNwb25zZVByb3BlcnR5ICYmIGNsb3NlQnV0dG9uVm9pY2luZ05hbWVSZXNwb25zZVByb3BlcnR5LmRpc3Bvc2UoKTtcblxuICAgICAgY2xvc2VCdXR0b24uZGlzcG9zZSgpO1xuXG4gICAgICBjb250ZXh0UmVzcG9uc2VVdHRlcmFuY2UuZGlzcG9zZSgpO1xuICAgICAgY29udGVudEFuZFRpdGxlLmRpc3Bvc2UoKTtcblxuICAgICAgLy8gcmVtb3ZlIGRpYWxvZyBjb250ZW50IGZyb20gc2NlbmUgZ3JhcGgsIGJ1dCBkb24ndCBkaXNwb3NlIGJlY2F1c2UgUGFuZWxcbiAgICAgIC8vIG5lZWRzIHRvIHJlbW92ZSBsaXN0ZW5lcnMgb24gdGhlIGNvbnRlbnQgaW4gaXRzIGRpc3Bvc2UoKVxuICAgICAgZGlhbG9nQ29udGVudC5yZW1vdmVBbGxDaGlsZHJlbigpO1xuICAgICAgZGlhbG9nQ29udGVudC5kZXRhY2goKTtcbiAgICB9O1xuXG4gICAgLy8gU2V0IGNvbnRlbnQgdGhyb3VnaCB0aGUgY29uc3RydWN0b3IsIERpYWxvZyBkb2VzIG5vdCBzdXBwb3J0IGRlY29yYXRpbmcgd2l0aCBhZGRpdGlvbmFsIGNvbnRlbnRcbiAgICBhc3NlcnQgJiYgYXNzZXJ0Tm9BZGRpdGlvbmFsQ2hpbGRyZW4oIHRoaXMgKTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZURpYWxvZygpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgRGlhbG9nSU8gPSBuZXcgSU9UeXBlKCAnRGlhbG9nSU8nLCB7XG4gICAgdmFsdWVUeXBlOiBEaWFsb2csXG5cbiAgICAvLyBTaW5jZSBtYW55IERpYWxvZ3MgYXJlIGR5bmFtaWMgZWxlbWVudHMsIHRoZXNlIG5lZWQgdG8gYmUgaW4gdGhlIHN0YXRlLiBUaGUgdmFsdWUgb2YgdGhlIHN0YXRlIG9iamVjdCBkb2Vzbid0XG4gICAgLy8gbWF0dGVyLCBidXQgaXQgaW5zdGVhZCBqdXN0IHNlcnZlcyBhcyBhIG1hcmtlciB0byB0ZWxsIHRoZSBzdGF0ZSBlbmdpbmUgdG8gcmVjcmVhdGUgdGhlIERpYWxvZyAoaWYgZHluYW1pYykgd2hlblxuICAgIC8vIHNldHRpbmcgc3RhdGUuXG4gICAgc3VwZXJ0eXBlOiBEeW5hbWljTWFya2VySU9cbiAgfSApO1xufVxuXG4vLyBEZWZhdWx0IHZhbHVlIGZvciBvcHRpb25zLmxheW91dFN0cmF0ZWd5LCBjZW50ZXJzIHRoZSBEaWFsb2cgaW4gdGhlIGxheW91dEJvdW5kcy5cbmZ1bmN0aW9uIGRlZmF1bHRMYXlvdXRTdHJhdGVneSggZGlhbG9nOiBEaWFsb2csIHNpbUJvdW5kczogQm91bmRzMiwgc2NyZWVuQm91bmRzOiBCb3VuZHMyLCBzY2FsZTogbnVtYmVyICk6IHZvaWQge1xuICBpZiAoIGRpYWxvZy5sYXlvdXRCb3VuZHMgKSB7XG4gICAgZGlhbG9nLmNlbnRlciA9IGRpYWxvZy5sYXlvdXRCb3VuZHMuY2VudGVyO1xuICB9XG59XG5cbi8qKlxuICogQHBhcmFtIGRpbWVuc2lvbiAtIHdpZHRoIG9yIGhlaWdodCBkaW1lbnNpb25cbiAqIEBwYXJhbSBtYXJnaW4gLSBtYXJnaW4gdG8gYmUgYXBwbGllZCB0byB0aGUgZGltZW5zaW9uXG4gKi9cbmZ1bmN0aW9uIGFwcGx5RG91YmxlTWFyZ2luKCBkaW1lbnNpb246IG51bWJlciwgbWFyZ2luOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgcmV0dXJuICggZGltZW5zaW9uID4gbWFyZ2luICogMiApID8gKCBkaW1lbnNpb24gLSBtYXJnaW4gKiAyICkgOiBkaW1lbnNpb247XG59XG5cbnN1bi5yZWdpc3RlciggJ0RpYWxvZycsIERpYWxvZyApOyJdLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJQYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJUaW55UHJvcGVydHkiLCJTY3JlZW5WaWV3IiwiZ2V0R2xvYmFsIiwib3B0aW9uaXplIiwiQ2xvc2VCdXR0b24iLCJBbGlnbkJveCIsImFzc2VydE5vQWRkaXRpb25hbENoaWxkcmVuIiwiRm9jdXNNYW5hZ2VyIiwiRnVsbFNjcmVlbiIsIkhCb3giLCJLZXlib2FyZExpc3RlbmVyIiwiTm9kZSIsIlBhcmFsbGVsRE9NIiwiUERPTVBlZXIiLCJQRE9NVXRpbHMiLCJWQm94Iiwidm9pY2luZ01hbmFnZXIiLCJudWxsU291bmRQbGF5ZXIiLCJzaGFyZWRTb3VuZFBsYXllcnMiLCJUYW5kZW0iLCJEWU5BTUlDX0FSQ0hFVFlQRV9OQU1FIiwiRHluYW1pY01hcmtlcklPIiwiSU9UeXBlIiwiVXR0ZXJhbmNlIiwiQnV0dG9uTm9kZSIsIlBhbmVsIiwiUG9wdXBhYmxlIiwic3VuIiwiU3VuU3RyaW5ncyIsIkRpYWxvZyIsImRpc3Bvc2UiLCJkaXNwb3NlRGlhbG9nIiwiY29udGVudCIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJ4U3BhY2luZyIsInlTcGFjaW5nIiwidG9wTWFyZ2luIiwiYm90dG9tTWFyZ2luIiwibGVmdE1hcmdpbiIsIm1heFdpZHRoTWFyZ2luIiwibWF4SGVpZ2h0TWFyZ2luIiwiY2xvc2VCdXR0b25MZW5ndGgiLCJjbG9zZUJ1dHRvblRvcE1hcmdpbiIsImNsb3NlQnV0dG9uUmlnaHRNYXJnaW4iLCJ0aXRsZSIsInRpdGxlQWxpZ24iLCJsYXlvdXRTdHJhdGVneSIsImRlZmF1bHRMYXlvdXRTdHJhdGVneSIsImNsb3NlQnV0dG9uTGlzdGVuZXIiLCJoaWRlIiwiY2xvc2VCdXR0b25Db2xvciIsImNsb3NlQnV0dG9uVG91Y2hBcmVhWERpbGF0aW9uIiwiY2xvc2VCdXR0b25Ub3VjaEFyZWFZRGlsYXRpb24iLCJjbG9zZUJ1dHRvbk1vdXNlQXJlYVhEaWxhdGlvbiIsImNsb3NlQnV0dG9uTW91c2VBcmVhWURpbGF0aW9uIiwiY2xvc2VCdXR0b25Wb2ljaW5nRGlhbG9nVGl0bGUiLCJjbG9zZUJ1dHRvbkxhc3RJblBET00iLCJvcGVuZWRTb3VuZFBsYXllciIsImdldCIsImNsb3NlZFNvdW5kUGxheWVyIiwic2ltIiwic2hvd0NhbGxiYWNrIiwiaGlkZUNhbGxiYWNrIiwibGF5b3V0Qm91bmRzIiwiREVGQVVMVF9MQVlPVVRfQk9VTkRTIiwiZm9jdXNPblNob3dOb2RlIiwiY29ybmVyUmFkaXVzIiwicmVzaXplIiwiZmlsbCIsInN0cm9rZSIsImJhY2tncm91bmRQaWNrYWJsZSIsIm1heEhlaWdodCIsIm1heFdpZHRoIiwidGFuZGVtTmFtZVN1ZmZpeCIsInBoZXRpb1R5cGUiLCJEaWFsb2dJTyIsInBoZXRpb1N0YXRlIiwicGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkIiwidGFnTmFtZSIsImFyaWFSb2xlIiwicG9zaXRpb25JblBET00iLCJhc3NlcnQiLCJ4TWFyZ2luIiwidW5kZWZpbmVkIiwieU1hcmdpbiIsImFwcGx5RG91YmxlTWFyZ2luIiwid2lkdGgiLCJoZWlnaHQiLCJjb250ZXh0UmVzcG9uc2VVdHRlcmFuY2UiLCJwcmlvcml0eSIsIk1FRElVTV9QUklPUklUWSIsInZvaWNpbmdDYW5Bbm5vdW5jZVByb3BlcnRpZXMiLCJ2b2ljaW5nRnVsbHlFbmFibGVkUHJvcGVydHkiLCJjbG9zZUJ1dHRvbiIsImljb25MZW5ndGgiLCJiYXNlQ29sb3IiLCJidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3kiLCJGbGF0QXBwZWFyYW5jZVN0cmF0ZWd5IiwibGlzdGVuZXIiLCJ2b2ljaW5nU3BlYWtDb250ZXh0UmVzcG9uc2UiLCJ1dHRlcmFuY2UiLCJwYXRoT3B0aW9ucyIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCIsInNvdW5kUGxheWVyIiwidm9pY2luZ0NvbnRleHRSZXNwb25zZSIsImExMXkiLCJjbG9zZWRTdHJpbmdQcm9wZXJ0eSIsImNsb3NlQnV0dG9uVm9pY2luZ05hbWVSZXNwb25zZVByb3BlcnR5IiwidGl0bGVQcm9wZXJ0eSIsInZvaWNpbmdOYW1lUmVzcG9uc2UiLCJ0aXRsZUNsb3NlUGF0dGVyblN0cmluZ1Byb3BlcnR5IiwiT1BUX09VVCIsInRvdWNoQXJlYSIsImJvdW5kcyIsImRpbGF0ZWRYWSIsIm1vdXNlQXJlYSIsInBkb21Ob2RlIiwibGFiZWxUYWdOYW1lIiwicGRvbU9yZGVyIiwicHVzaCIsInVuc2hpZnQiLCJmaWx0ZXIiLCJub2RlIiwiZm9jdXNhYmxlIiwiY29udGVudEFuZFRpdGxlIiwiY2hpbGRyZW4iLCJzcGFjaW5nIiwiYWxpZ24iLCJjb250ZW50QW5kVGl0bGVXaXRoTWFyZ2lucyIsImNsb3NlQnV0dG9uV2l0aE1hcmdpbnMiLCJyaWdodE1hcmdpbiIsImRpYWxvZ0NvbnRlbnQiLCJpc1Nob3dpbmdQcm9wZXJ0eSIsImxhenlMaW5rIiwiaXNTaG93aW5nIiwicGxheSIsInVwZGF0ZUxheW91dE11bHRpbGluayIsIm11bHRpbGluayIsImJvdW5kc1Byb3BlcnR5Iiwic2NyZWVuQm91bmRzUHJvcGVydHkiLCJzY2FsZVByb3BlcnR5Iiwic2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eSIsImxvY2FsQm91bmRzUHJvcGVydHkiLCJzY3JlZW5Cb3VuZHMiLCJzY2FsZSIsImZvcndhcmRBY2Nlc3NpYmxlTmFtZSIsImZvcndhcmRIZWxwVGV4dCIsImFjY2Vzc2libGVOYW1lIiwiZmluZFN0cmluZ1Byb3BlcnR5IiwiYWRkQXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbiIsInRoaXNFbGVtZW50TmFtZSIsIlBSSU1BUllfU0lCTElORyIsIm90aGVyTm9kZSIsIm90aGVyRWxlbWVudE5hbWUiLCJMQUJFTF9TSUJMSU5HIiwia2V5Ym9hcmRMaXN0ZW5lciIsImtleXMiLCJmaXJlIiwiZXZlbnQiLCJrZXlzUHJlc3NlZCIsImRvbUV2ZW50IiwicHJldmVudERlZmF1bHQiLCJpc0Z1bGxTY3JlZW4iLCJwZG9tRm9jdXMiLCJhY3RpdmVJZCIsInRyYWlsIiwiZ2V0VW5pcXVlSWQiLCJub05leHRGb2N1c2FibGUiLCJnZXROZXh0Rm9jdXNhYmxlIiwiaWQiLCJub1ByZXZpb3VzRm9jdXNhYmxlIiwiZ2V0UHJldmlvdXNGb2N1c2FibGUiLCJhZGRJbnB1dExpc3RlbmVyIiwicmVtb3ZlSW5wdXRMaXN0ZW5lciIsInJlbW92ZUFsbENoaWxkcmVuIiwiZGV0YWNoIiwidmFsdWVUeXBlIiwic3VwZXJ0eXBlIiwiZGlhbG9nIiwic2ltQm91bmRzIiwiY2VudGVyIiwiZGltZW5zaW9uIiwibWFyZ2luIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7OztDQU9DLEdBRUQsT0FBT0EsZUFBZSw2QkFBNkI7QUFDbkQsT0FBT0MsMkJBQTJCLHlDQUF5QztBQUMz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