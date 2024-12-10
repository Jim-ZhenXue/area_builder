// Copyright 2013-2024, University of Colorado Boulder
/**
 * Box that can be expanded/collapsed to show/hide contents.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */ import BooleanProperty from '../../axon/js/BooleanProperty.js';
import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { assertNoAdditionalChildren, HighlightFromNode, InteractiveHighlighting, isHeightSizable, isWidthSizable, LayoutConstraint, Node, ParallelDOM, Path, PDOMPeer, PDOMUtils, Rectangle, Sizable, Text } from '../../scenery/js/imports.js';
import sharedSoundPlayers from '../../tambo/js/sharedSoundPlayers.js';
import EventType from '../../tandem/js/EventType.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import ExpandCollapseButton from './ExpandCollapseButton.js';
import sun from './sun.js';
let AccordionBox = class AccordionBox extends Sizable(Node) {
    /**
   * Returns the ideal height of the collapsed box (ignoring things like stroke width)
   */ getCollapsedBoxHeight() {
        const result = this.constraint.lastCollapsedBoxHeight;
        assert && assert(result !== null);
        return result;
    }
    /**
   * Returns the ideal height of the expanded box (ignoring things like stroke width)
   */ getExpandedBoxHeight() {
        const result = this.constraint.lastExpandedBoxHeight;
        assert && assert(result !== null);
        return result;
    }
    reset() {
        this.resetAccordionBox();
    }
    /**
   * @param contentNode - Content that  will be shown or hidden as the accordion box is expanded/collapsed. NOTE: AccordionBox
   *                      places this Node in a pdomOrder, so you should not do that yourself.
   * @param [providedOptions]
   */ constructor(contentNode, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        assert && providedOptions && assert(!(providedOptions.hasOwnProperty('expandedProperty') && providedOptions.hasOwnProperty('expandedDefaultValue')), 'cannot specify expandedProperty and expandedDefaultValue in providedOptions');
        const options = optionize()({
            titleNode: null,
            expandedProperty: null,
            expandedDefaultValue: true,
            resize: true,
            overrideTitleNodePickable: true,
            allowContentToOverlapTitle: false,
            // applied to multiple parts of this UI component
            cursor: 'pointer',
            lineWidth: 1,
            cornerRadius: 10,
            // box
            stroke: 'black',
            fill: 'rgb( 238, 238, 238 )',
            minWidth: 0,
            titleAlignX: 'center',
            titleAlignY: 'center',
            titleXMargin: 10,
            titleYMargin: 2,
            titleXSpacing: 5,
            showTitleWhenExpanded: true,
            useExpandedBoundsWhenCollapsed: true,
            titleBarExpandCollapse: true,
            // expand/collapse button layout
            buttonAlign: 'left',
            buttonXMargin: 4,
            buttonYMargin: 2,
            // content
            contentAlign: 'center',
            contentVerticalAlign: 'center',
            contentXMargin: 15,
            contentYMargin: 8,
            contentXSpacing: 5,
            contentYSpacing: 8,
            // sound
            expandedSoundPlayer: sharedSoundPlayers.get('accordionBoxOpened'),
            collapsedSoundPlayer: sharedSoundPlayers.get('accordionBoxClosed'),
            // pdom
            tagName: 'div',
            headingTagName: 'h3',
            // voicing
            voicingNameResponse: null,
            voicingObjectResponse: null,
            voicingContextResponse: null,
            voicingHintResponse: null,
            // phet-io support
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'AccordionBox',
            phetioType: AccordionBox.AccordionBoxIO,
            phetioEventType: EventType.USER,
            visiblePropertyOptions: {
                phetioFeatured: true
            },
            titleBarOptions: {
                fill: null,
                stroke: null // title bar stroke, used only for the expanded title bar
            }
        }, providedOptions);
        // expandCollapseButtonOptions defaults
        options.expandCollapseButtonOptions = combineOptions({
            sideLength: 16,
            cursor: options.cursor,
            valueOnSoundPlayer: options.expandedSoundPlayer,
            valueOffSoundPlayer: options.collapsedSoundPlayer,
            // voicing
            voicingNameResponse: options.voicingNameResponse,
            voicingObjectResponse: options.voicingObjectResponse,
            voicingContextResponse: options.voicingContextResponse,
            voicingHintResponse: options.voicingHintResponse,
            // phet-io
            tandem: options.tandem.createTandem('expandCollapseButton')
        }, options.expandCollapseButtonOptions);
        super(), // Only defined if there is a stroke
        this.expandedBoxOutline = null, this.collapsedBoxOutline = null;
        let titleNode = options.titleNode;
        // If there is no titleNode specified, we'll provide our own, and handle disposal.
        if (!titleNode) {
            titleNode = new Text('', {
                tandem: options.tandem.createTandem('titleText')
            });
            this.disposeEmitter.addListener(()=>titleNode.dispose());
        }
        // Allow touches to go through to the collapsedTitleBar which handles the input event
        // Note: This mutates the titleNode, so if it is used in multiple places it will become unpickable
        // in those places as well.
        if (options.overrideTitleNodePickable) {
            titleNode.pickable = false;
        }
        this.expandedProperty = options.expandedProperty;
        if (!this.expandedProperty) {
            this.expandedProperty = new BooleanProperty(options.expandedDefaultValue, {
                tandem: options.tandem.createTandem('expandedProperty'),
                phetioFeatured: true
            });
            this.disposeEmitter.addListener(()=>this.expandedProperty.dispose());
        }
        // expand/collapse button, links to expandedProperty, must be disposed of
        this.expandCollapseButton = new ExpandCollapseButton(this.expandedProperty, options.expandCollapseButtonOptions);
        this.disposeEmitter.addListener(()=>this.expandCollapseButton.dispose());
        // Expanded box
        const boxOptions = {
            fill: options.fill,
            cornerRadius: options.cornerRadius
        };
        this.expandedBox = new Rectangle(boxOptions);
        this.collapsedBox = new Rectangle(boxOptions);
        this.expandedTitleBar = new InteractiveHighlightPath(null, combineOptions({
            lineWidth: options.lineWidth,
            cursor: options.cursor
        }, options.titleBarOptions));
        this.expandedBox.addChild(this.expandedTitleBar);
        // Collapsed title bar has corners that match the box. Clicking it operates like expand/collapse button.
        this.collapsedTitleBar = new InteractiveHighlightRectangle(combineOptions({
            cornerRadius: options.cornerRadius,
            cursor: options.cursor
        }, options.titleBarOptions));
        this.collapsedBox.addChild(this.collapsedTitleBar);
        // Set the focus highlights. If the title bar is not visible when expanded, the focus highlight will just surround the
        // button so it doesn't occlude content. Otherwise, the highlight will surround the whole title bar.
        const expandedFocusHighlight = new HighlightFromNode(options.showTitleWhenExpanded ? this.expandedTitleBar : this.expandCollapseButton);
        const collapsedFocusHighlight = new HighlightFromNode(this.collapsedTitleBar);
        this.disposeEmitter.addListener(()=>{
            this.collapsedTitleBar.dispose();
            this.expandedTitleBar.dispose();
        });
        if (options.titleBarExpandCollapse) {
            this.collapsedTitleBar.addInputListener({
                down: ()=>{
                    if (this.expandCollapseButton.isEnabled()) {
                        this.phetioStartEvent('expanded');
                        this.expandedProperty.value = true;
                        options.expandedSoundPlayer.play();
                        this.phetioEndEvent();
                    }
                }
            });
        } else {
            // When titleBar doesn't expand or collapse, don't show interactive highlights for them
            this.expandedTitleBar.interactiveHighlight = 'invisible';
            this.collapsedTitleBar.interactiveHighlight = 'invisible';
        }
        // Set the input listeners for the expandedTitleBar
        if (options.showTitleWhenExpanded && options.titleBarExpandCollapse) {
            this.expandedTitleBar.addInputListener({
                down: ()=>{
                    if (this.expandCollapseButton.isEnabled()) {
                        this.phetioStartEvent('collapsed');
                        options.collapsedSoundPlayer.play();
                        this.expandedProperty.value = false;
                        this.phetioEndEvent();
                    }
                }
            });
        }
        // If we hide the button or make it unpickable, disable interactivity of the title bar,
        // see https://github.com/phetsims/sun/issues/477 and https://github.com/phetsims/sun/issues/573.
        const pickableListener = ()=>{
            const pickable = this.expandCollapseButton.visible && this.expandCollapseButton.pickable;
            this.collapsedTitleBar.pickable = pickable;
            this.expandedTitleBar.pickable = pickable;
        };
        // Add listeners to the expand/collapse button.  These do not need to be unlinked because this component owns the
        // button.
        this.expandCollapseButton.visibleProperty.lazyLink(pickableListener);
        this.expandCollapseButton.pickableProperty.lazyLink(pickableListener);
        this.expandCollapseButton.enabledProperty.link((enabled)=>{
            // Since there are listeners on the titleBars from InteractiveHighlighting, setting pickable: false isn't enough
            // to hide pointer cursor.
            const showCursor = options.titleBarExpandCollapse && enabled;
            this.collapsedTitleBar.cursor = showCursor ? options.cursor || null : null;
            this.expandedTitleBar.cursor = showCursor ? options.cursor || null : null;
        });
        this.expandedBox.addChild(contentNode);
        // optional box outline, on top of everything else
        if (options.stroke) {
            const outlineOptions = {
                stroke: options.stroke,
                lineWidth: options.lineWidth,
                cornerRadius: options.cornerRadius,
                // don't occlude input events from the collapsedTitleBar, which handles the events
                pickable: false
            };
            this.expandedBoxOutline = new Rectangle(outlineOptions);
            this.expandedBox.addChild(this.expandedBoxOutline);
            this.collapsedBoxOutline = new Rectangle(outlineOptions);
            this.collapsedBox.addChild(this.collapsedBoxOutline);
        }
        // Holds the main components when the content's bounds are valid
        const containerNode = new Node({
            excludeInvisibleChildrenFromBounds: !options.useExpandedBoundsWhenCollapsed
        });
        this.addChild(containerNode);
        // pdom - Accessible markup for this component is described in AccordionBox.md in binder.
        // An element just to hold the content.
        const pdomContentNode = new Node({
            tagName: 'div',
            ariaRole: 'region',
            pdomOrder: [
                contentNode
            ],
            ariaLabelledbyAssociations: [
                {
                    otherNode: this.expandCollapseButton,
                    otherElementName: PDOMPeer.PRIMARY_SIBLING,
                    thisElementName: PDOMPeer.PRIMARY_SIBLING
                }
            ]
        });
        // The ExpandCollapseButton receives focus. It is wrapped in a heading element to also create a label for the content.
        const pdomHeading = new Node({
            tagName: options.headingTagName,
            pdomOrder: [
                this.expandCollapseButton
            ]
        });
        // The help text will come after the button but needs to be outside of the heading, so it gets its own Node.
        const pdomHelpTextNode = new Node({
            tagName: 'p'
        });
        // A parent containing all of the PDOM specific Nodes.
        const pdomContainerNode = new Node({
            children: [
                pdomHeading,
                pdomHelpTextNode,
                pdomContentNode
            ],
            pdomOrder: [
                pdomHeading,
                pdomHelpTextNode,
                titleNode,
                pdomContentNode
            ]
        });
        this.addChild(pdomContainerNode);
        // So that setting accessibleName and helpText on AccordionBox forwards it to the correct subcomponents for the
        // accessibility implemenation.
        ParallelDOM.forwardAccessibleName(this, this.expandCollapseButton);
        this.helpTextBehavior = (node, options, helpText, forwardingCallbacks)=>{
            forwardingCallbacks.push(()=>{
                pdomHelpTextNode.innerContent = helpText;
            });
            return options;
        };
        // If no accessibleName has been provided, try to find one from the titleNode
        if (!options.accessibleName && options.titleNode) {
            this.accessibleName = PDOMUtils.findStringProperty(options.titleNode);
        }
        this.constraint = new AccordionBoxConstraint(this, contentNode, containerNode, this.expandedBox, this.collapsedBox, this.expandedTitleBar, this.collapsedTitleBar, this.expandedBoxOutline, this.collapsedBoxOutline, titleNode, this.expandCollapseButton, options);
        this.constraint.updateLayout();
        // Don't update automatically if resize:false
        this.constraint.enabled = options.resize;
        // expand/collapse the box
        const expandedPropertyObserver = ()=>{
            const expanded = this.expandedProperty.value;
            this.expandedBox.visible = expanded;
            this.collapsedBox.visible = !expanded;
            // The "region" containing accessible content should not be discoverable when the box is collapsed.
            pdomContentNode.visible = expanded;
            this.expandCollapseButton.setFocusHighlight(expanded ? expandedFocusHighlight : collapsedFocusHighlight);
            titleNode.visible = expanded && options.showTitleWhenExpanded || !expanded;
            pdomContainerNode.setPDOMAttribute('aria-hidden', !expanded);
            this.expandCollapseButton.voicingSpeakFullResponse({
                hintResponse: null
            });
        };
        this.expandedProperty.link(expandedPropertyObserver);
        this.disposeEmitter.addListener(()=>this.expandedProperty.unlink(expandedPropertyObserver));
        this.mutate(_.omit(options, 'cursor'));
        // reset things that are owned by AccordionBox
        this.resetAccordionBox = ()=>{
            // If expandedProperty wasn't provided via options, we own it and therefore need to reset it.
            if (!options.expandedProperty) {
                this.expandedProperty.reset();
            }
        };
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('sun', 'AccordionBox', this);
        // Decorating with additional content is an anti-pattern, see https://github.com/phetsims/sun/issues/860
        assert && assertNoAdditionalChildren(this);
    }
};
AccordionBox.AccordionBoxIO = new IOType('AccordionBoxIO', {
    valueType: AccordionBox,
    supertype: Node.NodeIO,
    events: [
        'expanded',
        'collapsed'
    ]
});
export { AccordionBox as default };
let InteractiveHighlightPath = class InteractiveHighlightPath extends InteractiveHighlighting(Path) {
};
let InteractiveHighlightRectangle = class InteractiveHighlightRectangle extends InteractiveHighlighting(Rectangle) {
};
let AccordionBoxConstraint = class AccordionBoxConstraint extends LayoutConstraint {
    layout() {
        super.layout();
        const options = this.options;
        if (this.accordionBox.isChildIncludedInLayout(this.contentNode)) {
            this.containerNode.children = [
                this.expandedBox,
                this.collapsedBox,
                this.titleNode,
                this.expandCollapseButton
            ];
        } else {
            this.containerNode.children = [];
            return;
        }
        const expanded = this.accordionBox.expandedProperty.value;
        const useExpandedBounds = expanded || options.useExpandedBoundsWhenCollapsed;
        // We only have to account for the lineWidth in our layout if we have a stroke
        const lineWidth = options.stroke === null ? 0 : options.lineWidth;
        // LayoutProxy helps with some layout operations, and will support a non-child content.
        const contentProxy = this.createLayoutProxy(this.contentNode);
        const titleProxy = this.createLayoutProxy(this.titleNode);
        const minimumContentWidth = contentProxy.minimumWidth;
        const minimumContentHeight = contentProxy.minimumHeight;
        const minumumTitleWidth = titleProxy.minimumWidth;
        // The ideal height of the collapsed box (ignoring things like stroke width). Does not depend on title width
        // OR content size, both of which could be changed depending on preferred sizes.
        const collapsedBoxHeight = Math.max(this.expandCollapseButton.height + 2 * options.buttonYMargin, this.titleNode.height + 2 * options.titleYMargin);
        const minimumExpandedBoxHeight = options.showTitleWhenExpanded ? // content is below button+title
        Math.max(// content (with optional overlap)
        (options.allowContentToOverlapTitle ? options.contentYMargin : collapsedBoxHeight + options.contentYSpacing) + minimumContentHeight + options.contentYMargin, // the collapsed box height itself (if we overlap content, this could be larger)
        collapsedBoxHeight) : // content is next to button
        Math.max(this.expandCollapseButton.height + 2 * options.buttonYMargin, minimumContentHeight + 2 * options.contentYMargin);
        // The computed width of the box (ignoring things like stroke width)
        // Initial width is dependent on width of title section of the accordion box
        let minimumBoxWidth = Math.max(options.minWidth, options.buttonXMargin + this.expandCollapseButton.width + options.titleXSpacing + minumumTitleWidth + options.titleXMargin);
        // Limit width by the necessary space for the title node
        if (options.titleAlignX === 'center') {
            // Handles case where the spacing on the left side of the title is larger than the spacing on the right side.
            minimumBoxWidth = Math.max(minimumBoxWidth, (options.buttonXMargin + this.expandCollapseButton.width + options.titleXSpacing) * 2 + minumumTitleWidth);
            // Handles case where the spacing on the right side of the title is larger than the spacing on the left side.
            minimumBoxWidth = Math.max(minimumBoxWidth, options.titleXMargin * 2 + minumumTitleWidth);
        }
        // Compare width of title section to content section of the accordion box
        // content is below button+title
        if (options.showTitleWhenExpanded) {
            minimumBoxWidth = Math.max(minimumBoxWidth, minimumContentWidth + 2 * options.contentXMargin);
        } else {
            minimumBoxWidth = Math.max(minimumBoxWidth, this.expandCollapseButton.width + minimumContentWidth + options.buttonXMargin + options.contentXMargin + options.contentXSpacing);
        }
        // Both of these use "half" the lineWidth on either side
        const minimumWidth = minimumBoxWidth + lineWidth;
        const minimumHeight = (useExpandedBounds ? minimumExpandedBoxHeight : collapsedBoxHeight) + lineWidth;
        // Our resulting sizes (allow setting preferred width/height on the box)
        const preferredWidth = Math.max(minimumWidth, this.accordionBox.localPreferredWidth || 0);
        const preferredHeight = Math.max(minimumHeight, this.accordionBox.localPreferredHeight || 0);
        const boxWidth = preferredWidth - lineWidth;
        const boxHeight = preferredHeight - lineWidth;
        this.lastCollapsedBoxHeight = collapsedBoxHeight;
        if (useExpandedBounds) {
            this.lastExpandedBoxHeight = boxHeight;
        }
        this.collapsedBox.rectWidth = boxWidth;
        this.collapsedBox.rectHeight = collapsedBoxHeight;
        const collapsedBounds = this.collapsedBox.selfBounds;
        this.collapsedTitleBar.rectWidth = boxWidth;
        this.collapsedTitleBar.rectHeight = collapsedBoxHeight;
        // collapsedBoxOutline exists only if options.stroke is truthy
        if (this.collapsedBoxOutline) {
            this.collapsedBoxOutline.rectWidth = boxWidth;
            this.collapsedBoxOutline.rectHeight = collapsedBoxHeight;
        }
        if (useExpandedBounds) {
            this.expandedBox.rectWidth = boxWidth;
            this.expandedBox.rectHeight = boxHeight;
            const expandedBounds = this.expandedBox.selfBounds;
            // expandedBoxOutline exists only if options.stroke is truthy
            if (this.expandedBoxOutline) {
                this.expandedBoxOutline.rectWidth = boxWidth;
                this.expandedBoxOutline.rectHeight = boxHeight;
            }
            // Expanded title bar has (optional) rounded top corners, square bottom corners. Clicking it operates like
            // expand/collapse button.
            this.expandedTitleBar.shape = Shape.roundedRectangleWithRadii(0, 0, boxWidth, collapsedBoxHeight, {
                topLeft: options.cornerRadius,
                topRight: options.cornerRadius
            });
            let contentSpanLeft = expandedBounds.left + options.contentXMargin;
            let contentSpanRight = expandedBounds.right - options.contentXMargin;
            if (!options.showTitleWhenExpanded) {
                // content will be placed next to button
                if (options.buttonAlign === 'left') {
                    contentSpanLeft += this.expandCollapseButton.width + options.contentXSpacing;
                } else {
                    contentSpanRight -= this.expandCollapseButton.width + options.contentXSpacing;
                }
            }
            const availableContentWidth = contentSpanRight - contentSpanLeft;
            const availableContentHeight = boxHeight - (options.showTitleWhenExpanded && !options.allowContentToOverlapTitle ? collapsedBoxHeight + options.contentYMargin + options.contentYSpacing : 2 * options.contentYMargin);
            // Determine the size available to our content
            // NOTE: We do NOT set preferred sizes of our content if we don't have a preferred size ourself!
            if (isWidthSizable(this.contentNode) && this.accordionBox.localPreferredWidth !== null) {
                this.contentNode.preferredWidth = availableContentWidth;
            }
            if (isHeightSizable(this.contentNode) && this.accordionBox.localPreferredHeight !== null) {
                this.contentNode.preferredHeight = availableContentHeight;
            }
            // content layout
            if (options.contentVerticalAlign === 'top') {
                this.contentNode.top = expandedBounds.bottom - options.contentYMargin - availableContentHeight;
            } else if (options.contentVerticalAlign === 'bottom') {
                this.contentNode.bottom = expandedBounds.bottom - options.contentYMargin;
            } else {
                this.contentNode.centerY = expandedBounds.bottom - options.contentYMargin - availableContentHeight / 2;
            }
            if (options.contentAlign === 'left') {
                this.contentNode.left = contentSpanLeft;
            } else if (options.contentAlign === 'right') {
                this.contentNode.right = contentSpanRight;
            } else {
                this.contentNode.centerX = (contentSpanLeft + contentSpanRight) / 2;
            }
        }
        // button horizontal layout
        let titleLeftSpan = collapsedBounds.left + options.titleXMargin;
        let titleRightSpan = collapsedBounds.right - options.titleXMargin;
        if (options.buttonAlign === 'left') {
            this.expandCollapseButton.left = collapsedBounds.left + options.buttonXMargin;
            titleLeftSpan = this.expandCollapseButton.right + options.titleXSpacing;
        } else {
            this.expandCollapseButton.right = collapsedBounds.right - options.buttonXMargin;
            titleRightSpan = this.expandCollapseButton.left - options.titleXSpacing;
        }
        // title horizontal layout
        if (isWidthSizable(this.titleNode)) {
            this.titleNode.preferredWidth = titleRightSpan - titleLeftSpan;
        }
        if (options.titleAlignX === 'left') {
            this.titleNode.left = titleLeftSpan;
        } else if (options.titleAlignX === 'right') {
            this.titleNode.right = titleRightSpan;
        } else {
            this.titleNode.centerX = collapsedBounds.centerX;
        }
        // button & title vertical layout
        if (options.titleAlignY === 'top') {
            this.expandCollapseButton.top = this.collapsedBox.top + Math.max(options.buttonYMargin, options.titleYMargin);
            this.titleNode.top = this.expandCollapseButton.top;
        } else {
            this.expandCollapseButton.centerY = this.collapsedBox.centerY;
            this.titleNode.centerY = this.expandCollapseButton.centerY;
        }
        contentProxy.dispose();
        titleProxy.dispose();
        // Set minimums at the end, since this may trigger a relayout
        this.accordionBox.localMinimumWidth = minimumWidth;
        this.accordionBox.localMinimumHeight = minimumHeight;
    }
    dispose() {
        this.accordionBox.localPreferredWidthProperty.unlink(this._updateLayoutListener);
        this.accordionBox.localPreferredHeightProperty.unlink(this._updateLayoutListener);
        this.accordionBox.expandedProperty.unlink(this._updateLayoutListener);
        super.dispose();
    }
    constructor(accordionBox, contentNode, containerNode, expandedBox, collapsedBox, expandedTitleBar, collapsedTitleBar, expandedBoxOutline, collapsedBoxOutline, titleNode, expandCollapseButton, options){
        super(accordionBox), this.accordionBox = accordionBox, this.contentNode = contentNode, this.containerNode = containerNode, this.expandedBox = expandedBox, this.collapsedBox = collapsedBox, this.expandedTitleBar = expandedTitleBar, this.collapsedTitleBar = collapsedTitleBar, this.expandedBoxOutline = expandedBoxOutline, this.collapsedBoxOutline = collapsedBoxOutline, this.titleNode = titleNode, this.expandCollapseButton = expandCollapseButton, this.options = options, this.lastCollapsedBoxHeight = null, this.lastExpandedBoxHeight = null;
        this.accordionBox.localPreferredWidthProperty.lazyLink(this._updateLayoutListener);
        this.accordionBox.localPreferredHeightProperty.lazyLink(this._updateLayoutListener);
        this.accordionBox.expandedProperty.lazyLink(this._updateLayoutListener);
        this.addNode(contentNode);
        this.addNode(titleNode);
    }
};
sun.register('AccordionBox', AccordionBox);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9BY2NvcmRpb25Cb3gudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQm94IHRoYXQgY2FuIGJlIGV4cGFuZGVkL2NvbGxhcHNlZCB0byBzaG93L2hpZGUgY29udGVudHMuXG4gKlxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgSW5zdGFuY2VSZWdpc3RyeSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvZG9jdW1lbnRhdGlvbi9JbnN0YW5jZVJlZ2lzdHJ5LmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCB7IGFzc2VydE5vQWRkaXRpb25hbENoaWxkcmVuLCBIaWdobGlnaHRGcm9tTm9kZSwgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcsIGlzSGVpZ2h0U2l6YWJsZSwgaXNXaWR0aFNpemFibGUsIExheW91dENvbnN0cmFpbnQsIE5vZGUsIE5vZGVPcHRpb25zLCBQYWludGFibGVPcHRpb25zLCBQYXJhbGxlbERPTSwgUGF0aCwgUGF0aE9wdGlvbnMsIFBET01QZWVyLCBQRE9NVXRpbHMsIFJlY3RhbmdsZSwgUmVjdGFuZ2xlT3B0aW9ucywgU2l6YWJsZSwgVGV4dCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgc2hhcmVkU291bmRQbGF5ZXJzIGZyb20gJy4uLy4uL3RhbWJvL2pzL3NoYXJlZFNvdW5kUGxheWVycy5qcyc7XG5pbXBvcnQgVFNvdW5kUGxheWVyIGZyb20gJy4uLy4uL3RhbWJvL2pzL1RTb3VuZFBsYXllci5qcyc7XG5pbXBvcnQgRXZlbnRUeXBlIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9FdmVudFR5cGUuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XG5pbXBvcnQgeyBWb2ljaW5nUmVzcG9uc2UgfSBmcm9tICcuLi8uLi91dHRlcmFuY2UtcXVldWUvanMvUmVzcG9uc2VQYWNrZXQuanMnO1xuaW1wb3J0IEV4cGFuZENvbGxhcHNlQnV0dG9uLCB7IEV4cGFuZENvbGxhcHNlQnV0dG9uT3B0aW9ucyB9IGZyb20gJy4vRXhwYW5kQ29sbGFwc2VCdXR0b24uanMnO1xuaW1wb3J0IHN1biBmcm9tICcuL3N1bi5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIC8vIElmIG5vdCBwcm92aWRlZCwgYSBUZXh0IG5vZGUgd2lsbCBiZSBzdXBwbGllZC4gU2hvdWxkIGhhdmUgYW5kIG1haW50YWluIHdlbGwtZGVmaW5lZCBib3VuZHMgaWYgcGFzc2VkIGluXG4gIHRpdGxlTm9kZT86IE5vZGU7XG5cbiAgLy8gSWYgbm90IHByb3ZpZGVkLCBhIEJvb2xlYW5Qcm9wZXJ0eSB3aWxsIGJlIGNyZWF0ZWQsIGRlZmF1bHRpbmcgdG8gdGhlIHZhbHVlIG9mIGV4cGFuZGVkRGVmYXVsdFZhbHVlLlxuICBleHBhbmRlZFByb3BlcnR5PzogUHJvcGVydHk8Ym9vbGVhbj47XG4gIGV4cGFuZGVkRGVmYXVsdFZhbHVlPzogYm9vbGVhbjtcblxuICAvLyBJZiB0cnVlICh0aGUgZGVmYXVsdCksIHdlJ2xsIGFkanVzdCB0aGUgdGl0bGUgc28gdGhhdCBpdCBpc24ndCBwaWNrYWJsZSBhdCBhbGxcbiAgb3ZlcnJpZGVUaXRsZU5vZGVQaWNrYWJsZT86IGJvb2xlYW47XG5cbiAgLy8gSWYgdHJ1ZSwgdGhlIEFjY29yZGlvbkJveCB3aWxsIHJlc2l6ZSBpdHNlbGYgYXMgbmVlZGVkIHdoZW4gdGhlIHRpdGxlL2NvbnRlbnQgcmVzaXplcy5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzMwNFxuICByZXNpemU/OiBib29sZWFuO1xuXG4gIC8vIGFwcGxpZWQgdG8gbXVsdGlwbGUgcGFydHMgb2YgdGhpcyBVSSBjb21wb25lbnQgKE5PVEU6IGN1cnNvciBpcyBOT1QgYXBwbGllZCB0byB0aGUgbWFpbiBub2RlISEpXG4gIGN1cnNvcj86IE5vZGVPcHRpb25zWyAnY3Vyc29yJyBdO1xuICBsaW5lV2lkdGg/OiBQYXRoT3B0aW9uc1sgJ2xpbmVXaWR0aCcgXTtcbiAgY29ybmVyUmFkaXVzPzogUmVjdGFuZ2xlT3B0aW9uc1sgJ2Nvcm5lclJhZGl1cycgXTtcblxuICAvLyBGb3IgdGhlIGJveFxuICBzdHJva2U/OiBQYWludGFibGVPcHRpb25zWyAnc3Ryb2tlJyBdO1xuICBmaWxsPzogUGFpbnRhYmxlT3B0aW9uc1sgJ2ZpbGwnIF07XG4gIG1pbldpZHRoPzogbnVtYmVyO1xuXG4gIC8vIGhvcml6b250YWwgYWxpZ25tZW50IG9mIHRoZSB0aXRsZSwgJ2xlZnQnfCdjZW50ZXInfCdyaWdodCdcbiAgdGl0bGVBbGlnblg/OiAnY2VudGVyJyB8ICdsZWZ0JyB8ICdyaWdodCc7XG5cbiAgLy8gdmVydGljYWwgYWxpZ25tZW50IG9mIHRoZSB0aXRsZSwgcmVsYXRpdmUgdG8gZXhwYW5kL2NvbGxhcHNlIGJ1dHRvbiAndG9wJ3wnY2VudGVyJ1xuICB0aXRsZUFsaWduWT86ICd0b3AnIHwgJ2NlbnRlcic7XG5cbiAgLy8gaG9yaXpvbnRhbCBzcGFjZSBiZXR3ZWVuIHRpdGxlIGFuZCBsZWZ0fHJpZ2h0IGVkZ2Ugb2YgYm94XG4gIHRpdGxlWE1hcmdpbj86IG51bWJlcjtcblxuICAvLyB2ZXJ0aWNhbCBzcGFjZSBiZXR3ZWVuIHRpdGxlIGFuZCB0b3Agb2YgYm94XG4gIHRpdGxlWU1hcmdpbj86IG51bWJlcjtcblxuICAvLyBob3Jpem9udGFsIHNwYWNlIGJldHdlZW4gdGl0bGUgYW5kIGV4cGFuZC9jb2xsYXBzZSBidXR0b25cbiAgdGl0bGVYU3BhY2luZz86IG51bWJlcjtcblxuICAvLyB0cnVlID0gdGl0bGUgaXMgdmlzaWJsZSB3aGVuIGV4cGFuZGVkLCBmYWxzZSA9IHRpdGxlIGlzIGhpZGRlbiB3aGVuIGV4cGFuZGVkXG4gIC8vIFdoZW4gdHJ1ZSwgdGhlIGNvbnRlbnQgaXMgc2hvd24gYmVuZWF0aCB0aGUgdGl0bGUuIFdoZW4gZmFsc2UsIHRoZSBjb250ZW50IGlzIHNob3duIHRvIHRoZSBzaWRlIG9mIHRoZSB0aXRsZVxuICBzaG93VGl0bGVXaGVuRXhwYW5kZWQ/OiBib29sZWFuO1xuXG4gIC8vIElmIHRydWUsIHRoZSBleHBhbmRlZCBib3ggd2lsbCB1c2UgdGhlIGJvdW5kcyBvZiB0aGUgY29udGVudCBub2RlIHdoZW4gY29sbGFwc2VkXG4gIHVzZUV4cGFuZGVkQm91bmRzV2hlbkNvbGxhcHNlZD86IGJvb2xlYW47XG5cbiAgLy8gY2xpY2tpbmcgb24gdGhlIHRpdGxlIGJhciBleHBhbmRzL2NvbGxhcHNlcyB0aGUgYWNjb3JkaW9uIGJveFxuICB0aXRsZUJhckV4cGFuZENvbGxhcHNlPzogYm9vbGVhbjtcblxuICAvLyBpZiB0cnVlLCB0aGUgY29udGVudCB3aWxsIG92ZXJsYXAgdGhlIHRpdGxlIHdoZW4gZXhwYW5kZWQsIGFuZCB3aWxsIHVzZSBjb250ZW50WU1hcmdpbiBhdCB0aGUgdG9wXG4gIGFsbG93Q29udGVudFRvT3ZlcmxhcFRpdGxlPzogYm9vbGVhbjtcblxuICAvLyBvcHRpb25zIHBhc3NlZCB0byBFeHBhbmRDb2xsYXBzZUJ1dHRvbiBjb25zdHJ1Y3RvclxuICBleHBhbmRDb2xsYXBzZUJ1dHRvbk9wdGlvbnM/OiBFeHBhbmRDb2xsYXBzZUJ1dHRvbk9wdGlvbnM7XG5cbiAgLy8gZXhwYW5kL2NvbGxhcHNlIGJ1dHRvbiBsYXlvdXRcbiAgYnV0dG9uQWxpZ24/OiAnbGVmdCcgfCAncmlnaHQnOyAvLyBidXR0b24gYWxpZ25tZW50LCAnbGVmdCd8J3JpZ2h0J1xuICBidXR0b25YTWFyZ2luPzogbnVtYmVyOyAvLyBob3Jpem9udGFsIHNwYWNlIGJldHdlZW4gYnV0dG9uIGFuZCBsZWZ0fHJpZ2h0IGVkZ2Ugb2YgYm94XG4gIGJ1dHRvbllNYXJnaW4/OiBudW1iZXI7IC8vIHZlcnRpY2FsIHNwYWNlIGJldHdlZW4gYnV0dG9uIGFuZCB0b3AgZWRnZSBvZiBib3hcblxuICAvLyBjb250ZW50XG4gIGNvbnRlbnRBbGlnbj86ICdsZWZ0JyB8ICdjZW50ZXInIHwgJ3JpZ2h0JzsgLy8gaG9yaXpvbnRhbCBhbGlnbm1lbnQgb2YgdGhlIGNvbnRlbnRcbiAgY29udGVudFZlcnRpY2FsQWxpZ24/OiAndG9wJyB8ICdjZW50ZXInIHwgJ2JvdHRvbSc7IC8vIHZlcnRpY2FsIGFsaWdubWVudCBvZiB0aGUgY29udGVudCAoaWYgdGhlIHByZWZlcnJlZCBzaXplIGlzIGxhcmdlcilcbiAgY29udGVudFhNYXJnaW4/OiBudW1iZXI7IC8vIGhvcml6b250YWwgc3BhY2UgYmV0d2VlbiBjb250ZW50IGFuZCBsZWZ0L3JpZ2h0IGVkZ2VzIG9mIGJveFxuICBjb250ZW50WU1hcmdpbj86IG51bWJlcjsgLy8gdmVydGljYWwgc3BhY2UgYmV0d2VlbiBjb250ZW50IGFuZCBib3R0b20gZWRnZSBvZiBib3ggKGFuZCB0b3AgaWYgYWxsb3dDb250ZW50VG9PdmVybGFwVGl0bGUgaXMgdHJ1ZSlcbiAgY29udGVudFhTcGFjaW5nPzogbnVtYmVyOyAvLyBob3Jpem9udGFsIHNwYWNlIGJldHdlZW4gY29udGVudCBhbmQgYnV0dG9uLCBpZ25vcmVkIGlmIHNob3dUaXRsZVdoZW5FeHBhbmRlZCBpcyB0cnVlXG4gIGNvbnRlbnRZU3BhY2luZz86IG51bWJlcjsgLy8gdmVydGljYWwgc3BhY2UgYmV0d2VlbiBjb250ZW50IGFuZCB0aXRsZStidXR0b24sIGlnbm9yZWQgaWYgc2hvd1RpdGxlV2hlbkV4cGFuZGVkIGlzIGZhbHNlXG5cbiAgdGl0bGVCYXJPcHRpb25zPzogUmVjdGFuZ2xlT3B0aW9ucztcblxuICAvLyBzb3VuZCBwbGF5ZXJzIGZvciBleHBhbmQgYW5kIGNvbGxhcHNlXG4gIGV4cGFuZGVkU291bmRQbGF5ZXI/OiBUU291bmRQbGF5ZXI7XG4gIGNvbGxhcHNlZFNvdW5kUGxheWVyPzogVFNvdW5kUGxheWVyO1xuXG4gIC8vIHZvaWNpbmcgLSBUaGVzZSBhcmUgZGVmaW5lZCBoZXJlIGluIEFjY29yZGlvbkJveCAoZHVwbGljYXRlZCBmcm9tIFZvaWNpbmcpIHNvIHRoYXQgdGhleSBjYW4gYmUgcGFzc2VkIHRvIHRoZVxuICAvLyBleHBhbmRDb2xsYXBzZSBidXR0b24sIHdoaWNoIGhhbmRsZXMgdm9pY2luZyBmb3IgQWNjb3JkaW9uQm94LCB3aXRob3V0IEFjY29yZGlvbkJveCBtaXhpbmcgVm9pY2luZyBpdHNlbGYuXG4gIHZvaWNpbmdOYW1lUmVzcG9uc2U/OiBWb2ljaW5nUmVzcG9uc2U7XG4gIHZvaWNpbmdPYmplY3RSZXNwb25zZT86IFZvaWNpbmdSZXNwb25zZTtcbiAgdm9pY2luZ0NvbnRleHRSZXNwb25zZT86IFZvaWNpbmdSZXNwb25zZTtcbiAgdm9pY2luZ0hpbnRSZXNwb25zZT86IFZvaWNpbmdSZXNwb25zZTtcblxuICAvLyBwZG9tXG4gIGhlYWRpbmdUYWdOYW1lPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgQWNjb3JkaW9uQm94T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZU9wdGlvbnM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFjY29yZGlvbkJveCBleHRlbmRzIFNpemFibGUoIE5vZGUgKSB7XG5cbiAgcHVibGljIHJlYWRvbmx5IGV4cGFuZGVkUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZXhwYW5kQ29sbGFwc2VCdXR0b246IEV4cGFuZENvbGxhcHNlQnV0dG9uO1xuICBwcml2YXRlIHJlYWRvbmx5IGV4cGFuZGVkQm94OiBSZWN0YW5nbGU7XG4gIHByaXZhdGUgcmVhZG9ubHkgY29sbGFwc2VkQm94OiBSZWN0YW5nbGU7XG4gIHByaXZhdGUgcmVhZG9ubHkgZXhwYW5kZWRUaXRsZUJhcjogSW50ZXJhY3RpdmVIaWdobGlnaHRQYXRoO1xuICBwcml2YXRlIHJlYWRvbmx5IGNvbGxhcHNlZFRpdGxlQmFyOiBJbnRlcmFjdGl2ZUhpZ2hsaWdodFJlY3RhbmdsZTtcbiAgcHJpdmF0ZSByZWFkb25seSByZXNldEFjY29yZGlvbkJveDogKCkgPT4gdm9pZDtcblxuICAvLyBPbmx5IGRlZmluZWQgaWYgdGhlcmUgaXMgYSBzdHJva2VcbiAgcHJpdmF0ZSByZWFkb25seSBleHBhbmRlZEJveE91dGxpbmU6IFJlY3RhbmdsZSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHJlYWRvbmx5IGNvbGxhcHNlZEJveE91dGxpbmU6IFJlY3RhbmdsZSB8IG51bGwgPSBudWxsO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgY29uc3RyYWludDogQWNjb3JkaW9uQm94Q29uc3RyYWludDtcblxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEFjY29yZGlvbkJveElPID0gbmV3IElPVHlwZSggJ0FjY29yZGlvbkJveElPJywge1xuICAgIHZhbHVlVHlwZTogQWNjb3JkaW9uQm94LFxuICAgIHN1cGVydHlwZTogTm9kZS5Ob2RlSU8sXG4gICAgZXZlbnRzOiBbICdleHBhbmRlZCcsICdjb2xsYXBzZWQnIF1cbiAgfSApO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gY29udGVudE5vZGUgLSBDb250ZW50IHRoYXQgIHdpbGwgYmUgc2hvd24gb3IgaGlkZGVuIGFzIHRoZSBhY2NvcmRpb24gYm94IGlzIGV4cGFuZGVkL2NvbGxhcHNlZC4gTk9URTogQWNjb3JkaW9uQm94XG4gICAqICAgICAgICAgICAgICAgICAgICAgIHBsYWNlcyB0aGlzIE5vZGUgaW4gYSBwZG9tT3JkZXIsIHNvIHlvdSBzaG91bGQgbm90IGRvIHRoYXQgeW91cnNlbGYuXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjb250ZW50Tm9kZTogTm9kZSwgcHJvdmlkZWRPcHRpb25zPzogQWNjb3JkaW9uQm94T3B0aW9ucyApIHtcblxuICAgIGFzc2VydCAmJiBwcm92aWRlZE9wdGlvbnMgJiYgYXNzZXJ0KFxuICAgICAgISggcHJvdmlkZWRPcHRpb25zLmhhc093blByb3BlcnR5KCAnZXhwYW5kZWRQcm9wZXJ0eScgKSAmJiBwcm92aWRlZE9wdGlvbnMuaGFzT3duUHJvcGVydHkoICdleHBhbmRlZERlZmF1bHRWYWx1ZScgKSApLFxuICAgICAgJ2Nhbm5vdCBzcGVjaWZ5IGV4cGFuZGVkUHJvcGVydHkgYW5kIGV4cGFuZGVkRGVmYXVsdFZhbHVlIGluIHByb3ZpZGVkT3B0aW9ucydcbiAgICApO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxBY2NvcmRpb25Cb3hPcHRpb25zLCBTdHJpY3RPbWl0PFNlbGZPcHRpb25zLCAnZXhwYW5kQ29sbGFwc2VCdXR0b25PcHRpb25zJz4sIE5vZGVPcHRpb25zPigpKCB7XG5cbiAgICAgIHRpdGxlTm9kZTogbnVsbCBhcyB1bmtub3duIGFzIE5vZGUsXG4gICAgICBleHBhbmRlZFByb3BlcnR5OiBudWxsIGFzIHVua25vd24gYXMgQm9vbGVhblByb3BlcnR5LFxuICAgICAgZXhwYW5kZWREZWZhdWx0VmFsdWU6IHRydWUsXG4gICAgICByZXNpemU6IHRydWUsXG5cbiAgICAgIG92ZXJyaWRlVGl0bGVOb2RlUGlja2FibGU6IHRydWUsXG4gICAgICBhbGxvd0NvbnRlbnRUb092ZXJsYXBUaXRsZTogZmFsc2UsXG5cbiAgICAgIC8vIGFwcGxpZWQgdG8gbXVsdGlwbGUgcGFydHMgb2YgdGhpcyBVSSBjb21wb25lbnRcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgbGluZVdpZHRoOiAxLFxuICAgICAgY29ybmVyUmFkaXVzOiAxMCxcblxuICAgICAgLy8gYm94XG4gICAgICBzdHJva2U6ICdibGFjaycsXG4gICAgICBmaWxsOiAncmdiKCAyMzgsIDIzOCwgMjM4ICknLFxuICAgICAgbWluV2lkdGg6IDAsXG5cbiAgICAgIHRpdGxlQWxpZ25YOiAnY2VudGVyJyxcbiAgICAgIHRpdGxlQWxpZ25ZOiAnY2VudGVyJyxcbiAgICAgIHRpdGxlWE1hcmdpbjogMTAsXG4gICAgICB0aXRsZVlNYXJnaW46IDIsXG4gICAgICB0aXRsZVhTcGFjaW5nOiA1LFxuICAgICAgc2hvd1RpdGxlV2hlbkV4cGFuZGVkOiB0cnVlLFxuICAgICAgdXNlRXhwYW5kZWRCb3VuZHNXaGVuQ29sbGFwc2VkOiB0cnVlLFxuICAgICAgdGl0bGVCYXJFeHBhbmRDb2xsYXBzZTogdHJ1ZSxcblxuICAgICAgLy8gZXhwYW5kL2NvbGxhcHNlIGJ1dHRvbiBsYXlvdXRcbiAgICAgIGJ1dHRvbkFsaWduOiAnbGVmdCcsXG4gICAgICBidXR0b25YTWFyZ2luOiA0LFxuICAgICAgYnV0dG9uWU1hcmdpbjogMixcblxuICAgICAgLy8gY29udGVudFxuICAgICAgY29udGVudEFsaWduOiAnY2VudGVyJyxcbiAgICAgIGNvbnRlbnRWZXJ0aWNhbEFsaWduOiAnY2VudGVyJyxcbiAgICAgIGNvbnRlbnRYTWFyZ2luOiAxNSxcbiAgICAgIGNvbnRlbnRZTWFyZ2luOiA4LFxuICAgICAgY29udGVudFhTcGFjaW5nOiA1LFxuICAgICAgY29udGVudFlTcGFjaW5nOiA4LFxuXG4gICAgICAvLyBzb3VuZFxuICAgICAgZXhwYW5kZWRTb3VuZFBsYXllcjogc2hhcmVkU291bmRQbGF5ZXJzLmdldCggJ2FjY29yZGlvbkJveE9wZW5lZCcgKSxcbiAgICAgIGNvbGxhcHNlZFNvdW5kUGxheWVyOiBzaGFyZWRTb3VuZFBsYXllcnMuZ2V0KCAnYWNjb3JkaW9uQm94Q2xvc2VkJyApLFxuXG4gICAgICAvLyBwZG9tXG4gICAgICB0YWdOYW1lOiAnZGl2JyxcbiAgICAgIGhlYWRpbmdUYWdOYW1lOiAnaDMnLCAvLyBzcGVjaWZ5IHRoZSBoZWFkaW5nIHRoYXQgdGhpcyBBY2NvcmRpb25Cb3ggd2lsbCBiZSwgVE9ETzogdXNlIHRoaXMuaGVhZGluZ0xldmVsIHdoZW4gbm8gbG9uZ2VyIGV4cGVyaW1lbnRhbCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvODU1XG5cbiAgICAgIC8vIHZvaWNpbmdcbiAgICAgIHZvaWNpbmdOYW1lUmVzcG9uc2U6IG51bGwsXG4gICAgICB2b2ljaW5nT2JqZWN0UmVzcG9uc2U6IG51bGwsXG4gICAgICB2b2ljaW5nQ29udGV4dFJlc3BvbnNlOiBudWxsLFxuICAgICAgdm9pY2luZ0hpbnRSZXNwb25zZTogbnVsbCxcblxuICAgICAgLy8gcGhldC1pbyBzdXBwb3J0XG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcbiAgICAgIHRhbmRlbU5hbWVTdWZmaXg6ICdBY2NvcmRpb25Cb3gnLFxuICAgICAgcGhldGlvVHlwZTogQWNjb3JkaW9uQm94LkFjY29yZGlvbkJveElPLFxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcbiAgICAgIHZpc2libGVQcm9wZXJ0eU9wdGlvbnM6IHsgcGhldGlvRmVhdHVyZWQ6IHRydWUgfSxcblxuICAgICAgdGl0bGVCYXJPcHRpb25zOiB7XG4gICAgICAgIGZpbGw6IG51bGwsIC8vIHRpdGxlIGJhciBmaWxsXG4gICAgICAgIHN0cm9rZTogbnVsbCAvLyB0aXRsZSBiYXIgc3Ryb2tlLCB1c2VkIG9ubHkgZm9yIHRoZSBleHBhbmRlZCB0aXRsZSBiYXJcbiAgICAgIH1cbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIC8vIGV4cGFuZENvbGxhcHNlQnV0dG9uT3B0aW9ucyBkZWZhdWx0c1xuICAgIG9wdGlvbnMuZXhwYW5kQ29sbGFwc2VCdXR0b25PcHRpb25zID0gY29tYmluZU9wdGlvbnM8RXhwYW5kQ29sbGFwc2VCdXR0b25PcHRpb25zPigge1xuICAgICAgc2lkZUxlbmd0aDogMTYsIC8vIGJ1dHRvbiBpcyBhIHNxdWFyZSwgdGhpcyBpcyB0aGUgbGVuZ3RoIG9mIG9uZSBzaWRlXG4gICAgICBjdXJzb3I6IG9wdGlvbnMuY3Vyc29yLFxuICAgICAgdmFsdWVPblNvdW5kUGxheWVyOiBvcHRpb25zLmV4cGFuZGVkU291bmRQbGF5ZXIsXG4gICAgICB2YWx1ZU9mZlNvdW5kUGxheWVyOiBvcHRpb25zLmNvbGxhcHNlZFNvdW5kUGxheWVyLFxuXG4gICAgICAvLyB2b2ljaW5nXG4gICAgICB2b2ljaW5nTmFtZVJlc3BvbnNlOiBvcHRpb25zLnZvaWNpbmdOYW1lUmVzcG9uc2UsXG4gICAgICB2b2ljaW5nT2JqZWN0UmVzcG9uc2U6IG9wdGlvbnMudm9pY2luZ09iamVjdFJlc3BvbnNlLFxuICAgICAgdm9pY2luZ0NvbnRleHRSZXNwb25zZTogb3B0aW9ucy52b2ljaW5nQ29udGV4dFJlc3BvbnNlLFxuICAgICAgdm9pY2luZ0hpbnRSZXNwb25zZTogb3B0aW9ucy52b2ljaW5nSGludFJlc3BvbnNlLFxuXG4gICAgICAvLyBwaGV0LWlvXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2V4cGFuZENvbGxhcHNlQnV0dG9uJyApXG4gICAgfSwgb3B0aW9ucy5leHBhbmRDb2xsYXBzZUJ1dHRvbk9wdGlvbnMgKTtcblxuICAgIHN1cGVyKCk7XG5cbiAgICBsZXQgdGl0bGVOb2RlID0gb3B0aW9ucy50aXRsZU5vZGU7XG5cbiAgICAvLyBJZiB0aGVyZSBpcyBubyB0aXRsZU5vZGUgc3BlY2lmaWVkLCB3ZSdsbCBwcm92aWRlIG91ciBvd24sIGFuZCBoYW5kbGUgZGlzcG9zYWwuXG4gICAgaWYgKCAhdGl0bGVOb2RlICkge1xuICAgICAgdGl0bGVOb2RlID0gbmV3IFRleHQoICcnLCB7XG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndGl0bGVUZXh0JyApXG4gICAgICB9ICk7XG4gICAgICB0aGlzLmRpc3Bvc2VFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB0aXRsZU5vZGUuZGlzcG9zZSgpICk7XG4gICAgfVxuXG4gICAgLy8gQWxsb3cgdG91Y2hlcyB0byBnbyB0aHJvdWdoIHRvIHRoZSBjb2xsYXBzZWRUaXRsZUJhciB3aGljaCBoYW5kbGVzIHRoZSBpbnB1dCBldmVudFxuICAgIC8vIE5vdGU6IFRoaXMgbXV0YXRlcyB0aGUgdGl0bGVOb2RlLCBzbyBpZiBpdCBpcyB1c2VkIGluIG11bHRpcGxlIHBsYWNlcyBpdCB3aWxsIGJlY29tZSB1bnBpY2thYmxlXG4gICAgLy8gaW4gdGhvc2UgcGxhY2VzIGFzIHdlbGwuXG4gICAgaWYgKCBvcHRpb25zLm92ZXJyaWRlVGl0bGVOb2RlUGlja2FibGUgKSB7XG4gICAgICB0aXRsZU5vZGUucGlja2FibGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLmV4cGFuZGVkUHJvcGVydHkgPSBvcHRpb25zLmV4cGFuZGVkUHJvcGVydHk7XG4gICAgaWYgKCAhdGhpcy5leHBhbmRlZFByb3BlcnR5ICkge1xuICAgICAgdGhpcy5leHBhbmRlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggb3B0aW9ucy5leHBhbmRlZERlZmF1bHRWYWx1ZSwge1xuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2V4cGFuZGVkUHJvcGVydHknICksXG4gICAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlXG4gICAgICB9ICk7XG4gICAgICB0aGlzLmRpc3Bvc2VFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB0aGlzLmV4cGFuZGVkUHJvcGVydHkuZGlzcG9zZSgpICk7XG4gICAgfVxuXG4gICAgLy8gZXhwYW5kL2NvbGxhcHNlIGJ1dHRvbiwgbGlua3MgdG8gZXhwYW5kZWRQcm9wZXJ0eSwgbXVzdCBiZSBkaXNwb3NlZCBvZlxuICAgIHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24gPSBuZXcgRXhwYW5kQ29sbGFwc2VCdXR0b24oIHRoaXMuZXhwYW5kZWRQcm9wZXJ0eSwgb3B0aW9ucy5leHBhbmRDb2xsYXBzZUJ1dHRvbk9wdGlvbnMgKTtcbiAgICB0aGlzLmRpc3Bvc2VFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLmRpc3Bvc2UoKSApO1xuXG4gICAgLy8gRXhwYW5kZWQgYm94XG4gICAgY29uc3QgYm94T3B0aW9ucyA9IHtcbiAgICAgIGZpbGw6IG9wdGlvbnMuZmlsbCxcbiAgICAgIGNvcm5lclJhZGl1czogb3B0aW9ucy5jb3JuZXJSYWRpdXNcbiAgICB9O1xuXG4gICAgdGhpcy5leHBhbmRlZEJveCA9IG5ldyBSZWN0YW5nbGUoIGJveE9wdGlvbnMgKTtcbiAgICB0aGlzLmNvbGxhcHNlZEJveCA9IG5ldyBSZWN0YW5nbGUoIGJveE9wdGlvbnMgKTtcblxuICAgIHRoaXMuZXhwYW5kZWRUaXRsZUJhciA9IG5ldyBJbnRlcmFjdGl2ZUhpZ2hsaWdodFBhdGgoIG51bGwsIGNvbWJpbmVPcHRpb25zPEV4cGFuZENvbGxhcHNlQnV0dG9uT3B0aW9ucz4oIHtcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5saW5lV2lkdGgsIC8vIHVzZSBzYW1lIGxpbmVXaWR0aCBhcyBib3gsIGZvciBjb25zaXN0ZW50IGxvb2tcbiAgICAgIGN1cnNvcjogb3B0aW9ucy5jdXJzb3JcbiAgICB9LCBvcHRpb25zLnRpdGxlQmFyT3B0aW9ucyApICk7XG4gICAgdGhpcy5leHBhbmRlZEJveC5hZGRDaGlsZCggdGhpcy5leHBhbmRlZFRpdGxlQmFyICk7XG5cbiAgICAvLyBDb2xsYXBzZWQgdGl0bGUgYmFyIGhhcyBjb3JuZXJzIHRoYXQgbWF0Y2ggdGhlIGJveC4gQ2xpY2tpbmcgaXQgb3BlcmF0ZXMgbGlrZSBleHBhbmQvY29sbGFwc2UgYnV0dG9uLlxuICAgIHRoaXMuY29sbGFwc2VkVGl0bGVCYXIgPSBuZXcgSW50ZXJhY3RpdmVIaWdobGlnaHRSZWN0YW5nbGUoIGNvbWJpbmVPcHRpb25zPFJlY3RhbmdsZU9wdGlvbnM+KCB7XG4gICAgICBjb3JuZXJSYWRpdXM6IG9wdGlvbnMuY29ybmVyUmFkaXVzLFxuICAgICAgY3Vyc29yOiBvcHRpb25zLmN1cnNvclxuICAgIH0sIG9wdGlvbnMudGl0bGVCYXJPcHRpb25zICkgKTtcbiAgICB0aGlzLmNvbGxhcHNlZEJveC5hZGRDaGlsZCggdGhpcy5jb2xsYXBzZWRUaXRsZUJhciApO1xuXG4gICAgLy8gU2V0IHRoZSBmb2N1cyBoaWdobGlnaHRzLiBJZiB0aGUgdGl0bGUgYmFyIGlzIG5vdCB2aXNpYmxlIHdoZW4gZXhwYW5kZWQsIHRoZSBmb2N1cyBoaWdobGlnaHQgd2lsbCBqdXN0IHN1cnJvdW5kIHRoZVxuICAgIC8vIGJ1dHRvbiBzbyBpdCBkb2Vzbid0IG9jY2x1ZGUgY29udGVudC4gT3RoZXJ3aXNlLCB0aGUgaGlnaGxpZ2h0IHdpbGwgc3Vycm91bmQgdGhlIHdob2xlIHRpdGxlIGJhci5cbiAgICBjb25zdCBleHBhbmRlZEZvY3VzSGlnaGxpZ2h0ID0gbmV3IEhpZ2hsaWdodEZyb21Ob2RlKCBvcHRpb25zLnNob3dUaXRsZVdoZW5FeHBhbmRlZCA/IHRoaXMuZXhwYW5kZWRUaXRsZUJhciA6IHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24gKTtcbiAgICBjb25zdCBjb2xsYXBzZWRGb2N1c0hpZ2hsaWdodCA9IG5ldyBIaWdobGlnaHRGcm9tTm9kZSggdGhpcy5jb2xsYXBzZWRUaXRsZUJhciApO1xuXG4gICAgdGhpcy5kaXNwb3NlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xuICAgICAgdGhpcy5jb2xsYXBzZWRUaXRsZUJhci5kaXNwb3NlKCk7XG4gICAgICB0aGlzLmV4cGFuZGVkVGl0bGVCYXIuZGlzcG9zZSgpO1xuICAgIH0gKTtcblxuICAgIGlmICggb3B0aW9ucy50aXRsZUJhckV4cGFuZENvbGxhcHNlICkge1xuICAgICAgdGhpcy5jb2xsYXBzZWRUaXRsZUJhci5hZGRJbnB1dExpc3RlbmVyKCB7XG4gICAgICAgIGRvd246ICgpID0+IHtcbiAgICAgICAgICBpZiAoIHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24uaXNFbmFibGVkKCkgKSB7XG4gICAgICAgICAgICB0aGlzLnBoZXRpb1N0YXJ0RXZlbnQoICdleHBhbmRlZCcgKTtcbiAgICAgICAgICAgIHRoaXMuZXhwYW5kZWRQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XG4gICAgICAgICAgICBvcHRpb25zLmV4cGFuZGVkU291bmRQbGF5ZXIucGxheSgpO1xuICAgICAgICAgICAgdGhpcy5waGV0aW9FbmRFdmVudCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH1cbiAgICBlbHNlIHtcblxuICAgICAgLy8gV2hlbiB0aXRsZUJhciBkb2Vzbid0IGV4cGFuZCBvciBjb2xsYXBzZSwgZG9uJ3Qgc2hvdyBpbnRlcmFjdGl2ZSBoaWdobGlnaHRzIGZvciB0aGVtXG4gICAgICB0aGlzLmV4cGFuZGVkVGl0bGVCYXIuaW50ZXJhY3RpdmVIaWdobGlnaHQgPSAnaW52aXNpYmxlJztcbiAgICAgIHRoaXMuY29sbGFwc2VkVGl0bGVCYXIuaW50ZXJhY3RpdmVIaWdobGlnaHQgPSAnaW52aXNpYmxlJztcbiAgICB9XG5cbiAgICAvLyBTZXQgdGhlIGlucHV0IGxpc3RlbmVycyBmb3IgdGhlIGV4cGFuZGVkVGl0bGVCYXJcbiAgICBpZiAoIG9wdGlvbnMuc2hvd1RpdGxlV2hlbkV4cGFuZGVkICYmIG9wdGlvbnMudGl0bGVCYXJFeHBhbmRDb2xsYXBzZSApIHtcbiAgICAgIHRoaXMuZXhwYW5kZWRUaXRsZUJhci5hZGRJbnB1dExpc3RlbmVyKCB7XG4gICAgICAgIGRvd246ICgpID0+IHtcbiAgICAgICAgICBpZiAoIHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24uaXNFbmFibGVkKCkgKSB7XG4gICAgICAgICAgICB0aGlzLnBoZXRpb1N0YXJ0RXZlbnQoICdjb2xsYXBzZWQnICk7XG4gICAgICAgICAgICBvcHRpb25zLmNvbGxhcHNlZFNvdW5kUGxheWVyLnBsYXkoKTtcbiAgICAgICAgICAgIHRoaXMuZXhwYW5kZWRQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5waGV0aW9FbmRFdmVudCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH1cblxuICAgIC8vIElmIHdlIGhpZGUgdGhlIGJ1dHRvbiBvciBtYWtlIGl0IHVucGlja2FibGUsIGRpc2FibGUgaW50ZXJhY3Rpdml0eSBvZiB0aGUgdGl0bGUgYmFyLFxuICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy80NzcgYW5kIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzU3My5cbiAgICBjb25zdCBwaWNrYWJsZUxpc3RlbmVyID0gKCkgPT4ge1xuICAgICAgY29uc3QgcGlja2FibGUgPSB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLnZpc2libGUgJiYgdGhpcy5leHBhbmRDb2xsYXBzZUJ1dHRvbi5waWNrYWJsZTtcbiAgICAgIHRoaXMuY29sbGFwc2VkVGl0bGVCYXIucGlja2FibGUgPSBwaWNrYWJsZTtcbiAgICAgIHRoaXMuZXhwYW5kZWRUaXRsZUJhci5waWNrYWJsZSA9IHBpY2thYmxlO1xuICAgIH07XG5cbiAgICAvLyBBZGQgbGlzdGVuZXJzIHRvIHRoZSBleHBhbmQvY29sbGFwc2UgYnV0dG9uLiAgVGhlc2UgZG8gbm90IG5lZWQgdG8gYmUgdW5saW5rZWQgYmVjYXVzZSB0aGlzIGNvbXBvbmVudCBvd25zIHRoZVxuICAgIC8vIGJ1dHRvbi5cbiAgICB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLnZpc2libGVQcm9wZXJ0eS5sYXp5TGluayggcGlja2FibGVMaXN0ZW5lciApO1xuICAgIHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24ucGlja2FibGVQcm9wZXJ0eS5sYXp5TGluayggcGlja2FibGVMaXN0ZW5lciApO1xuICAgIHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24uZW5hYmxlZFByb3BlcnR5LmxpbmsoIGVuYWJsZWQgPT4ge1xuXG4gICAgICAvLyBTaW5jZSB0aGVyZSBhcmUgbGlzdGVuZXJzIG9uIHRoZSB0aXRsZUJhcnMgZnJvbSBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZywgc2V0dGluZyBwaWNrYWJsZTogZmFsc2UgaXNuJ3QgZW5vdWdoXG4gICAgICAvLyB0byBoaWRlIHBvaW50ZXIgY3Vyc29yLlxuICAgICAgY29uc3Qgc2hvd0N1cnNvciA9IG9wdGlvbnMudGl0bGVCYXJFeHBhbmRDb2xsYXBzZSAmJiBlbmFibGVkO1xuICAgICAgdGhpcy5jb2xsYXBzZWRUaXRsZUJhci5jdXJzb3IgPSBzaG93Q3Vyc29yID8gKCBvcHRpb25zLmN1cnNvciB8fCBudWxsICkgOiBudWxsO1xuICAgICAgdGhpcy5leHBhbmRlZFRpdGxlQmFyLmN1cnNvciA9IHNob3dDdXJzb3IgPyAoIG9wdGlvbnMuY3Vyc29yIHx8IG51bGwgKSA6IG51bGw7XG4gICAgfSApO1xuXG4gICAgdGhpcy5leHBhbmRlZEJveC5hZGRDaGlsZCggY29udGVudE5vZGUgKTtcblxuICAgIC8vIG9wdGlvbmFsIGJveCBvdXRsaW5lLCBvbiB0b3Agb2YgZXZlcnl0aGluZyBlbHNlXG4gICAgaWYgKCBvcHRpb25zLnN0cm9rZSApIHtcblxuICAgICAgY29uc3Qgb3V0bGluZU9wdGlvbnMgPSB7XG4gICAgICAgIHN0cm9rZTogb3B0aW9ucy5zdHJva2UsXG4gICAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5saW5lV2lkdGgsXG4gICAgICAgIGNvcm5lclJhZGl1czogb3B0aW9ucy5jb3JuZXJSYWRpdXMsXG5cbiAgICAgICAgLy8gZG9uJ3Qgb2NjbHVkZSBpbnB1dCBldmVudHMgZnJvbSB0aGUgY29sbGFwc2VkVGl0bGVCYXIsIHdoaWNoIGhhbmRsZXMgdGhlIGV2ZW50c1xuICAgICAgICBwaWNrYWJsZTogZmFsc2VcbiAgICAgIH07XG5cbiAgICAgIHRoaXMuZXhwYW5kZWRCb3hPdXRsaW5lID0gbmV3IFJlY3RhbmdsZSggb3V0bGluZU9wdGlvbnMgKTtcbiAgICAgIHRoaXMuZXhwYW5kZWRCb3guYWRkQ2hpbGQoIHRoaXMuZXhwYW5kZWRCb3hPdXRsaW5lICk7XG5cbiAgICAgIHRoaXMuY29sbGFwc2VkQm94T3V0bGluZSA9IG5ldyBSZWN0YW5nbGUoIG91dGxpbmVPcHRpb25zICk7XG4gICAgICB0aGlzLmNvbGxhcHNlZEJveC5hZGRDaGlsZCggdGhpcy5jb2xsYXBzZWRCb3hPdXRsaW5lICk7XG4gICAgfVxuXG4gICAgLy8gSG9sZHMgdGhlIG1haW4gY29tcG9uZW50cyB3aGVuIHRoZSBjb250ZW50J3MgYm91bmRzIGFyZSB2YWxpZFxuICAgIGNvbnN0IGNvbnRhaW5lck5vZGUgPSBuZXcgTm9kZSgge1xuICAgICAgZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kczogIW9wdGlvbnMudXNlRXhwYW5kZWRCb3VuZHNXaGVuQ29sbGFwc2VkXG4gICAgfSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIGNvbnRhaW5lck5vZGUgKTtcblxuICAgIC8vIHBkb20gLSBBY2Nlc3NpYmxlIG1hcmt1cCBmb3IgdGhpcyBjb21wb25lbnQgaXMgZGVzY3JpYmVkIGluIEFjY29yZGlvbkJveC5tZCBpbiBiaW5kZXIuXG4gICAgLy8gQW4gZWxlbWVudCBqdXN0IHRvIGhvbGQgdGhlIGNvbnRlbnQuXG4gICAgY29uc3QgcGRvbUNvbnRlbnROb2RlID0gbmV3IE5vZGUoIHtcbiAgICAgIHRhZ05hbWU6ICdkaXYnLFxuICAgICAgYXJpYVJvbGU6ICdyZWdpb24nLFxuICAgICAgcGRvbU9yZGVyOiBbIGNvbnRlbnROb2RlIF0sXG4gICAgICBhcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uczogWyB7XG4gICAgICAgIG90aGVyTm9kZTogdGhpcy5leHBhbmRDb2xsYXBzZUJ1dHRvbixcbiAgICAgICAgb3RoZXJFbGVtZW50TmFtZTogUERPTVBlZXIuUFJJTUFSWV9TSUJMSU5HLFxuICAgICAgICB0aGlzRWxlbWVudE5hbWU6IFBET01QZWVyLlBSSU1BUllfU0lCTElOR1xuICAgICAgfSBdXG4gICAgfSApO1xuXG4gICAgLy8gVGhlIEV4cGFuZENvbGxhcHNlQnV0dG9uIHJlY2VpdmVzIGZvY3VzLiBJdCBpcyB3cmFwcGVkIGluIGEgaGVhZGluZyBlbGVtZW50IHRvIGFsc28gY3JlYXRlIGEgbGFiZWwgZm9yIHRoZSBjb250ZW50LlxuICAgIGNvbnN0IHBkb21IZWFkaW5nID0gbmV3IE5vZGUoIHtcbiAgICAgIHRhZ05hbWU6IG9wdGlvbnMuaGVhZGluZ1RhZ05hbWUsXG4gICAgICBwZG9tT3JkZXI6IFsgdGhpcy5leHBhbmRDb2xsYXBzZUJ1dHRvbiBdXG4gICAgfSApO1xuXG4gICAgLy8gVGhlIGhlbHAgdGV4dCB3aWxsIGNvbWUgYWZ0ZXIgdGhlIGJ1dHRvbiBidXQgbmVlZHMgdG8gYmUgb3V0c2lkZSBvZiB0aGUgaGVhZGluZywgc28gaXQgZ2V0cyBpdHMgb3duIE5vZGUuXG4gICAgY29uc3QgcGRvbUhlbHBUZXh0Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdwJyB9ICk7XG5cbiAgICAvLyBBIHBhcmVudCBjb250YWluaW5nIGFsbCBvZiB0aGUgUERPTSBzcGVjaWZpYyBOb2Rlcy5cbiAgICBjb25zdCBwZG9tQ29udGFpbmVyTm9kZSA9IG5ldyBOb2RlKCB7XG4gICAgICBjaGlsZHJlbjogWyBwZG9tSGVhZGluZywgcGRvbUhlbHBUZXh0Tm9kZSwgcGRvbUNvbnRlbnROb2RlIF0sXG4gICAgICBwZG9tT3JkZXI6IFsgcGRvbUhlYWRpbmcsIHBkb21IZWxwVGV4dE5vZGUsIHRpdGxlTm9kZSwgcGRvbUNvbnRlbnROb2RlIF1cbiAgICB9ICk7XG4gICAgdGhpcy5hZGRDaGlsZCggcGRvbUNvbnRhaW5lck5vZGUgKTtcblxuICAgIC8vIFNvIHRoYXQgc2V0dGluZyBhY2Nlc3NpYmxlTmFtZSBhbmQgaGVscFRleHQgb24gQWNjb3JkaW9uQm94IGZvcndhcmRzIGl0IHRvIHRoZSBjb3JyZWN0IHN1YmNvbXBvbmVudHMgZm9yIHRoZVxuICAgIC8vIGFjY2Vzc2liaWxpdHkgaW1wbGVtZW5hdGlvbi5cbiAgICBQYXJhbGxlbERPTS5mb3J3YXJkQWNjZXNzaWJsZU5hbWUoIHRoaXMsIHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24gKTtcbiAgICB0aGlzLmhlbHBUZXh0QmVoYXZpb3IgPSAoIG5vZGUsIG9wdGlvbnMsIGhlbHBUZXh0LCBmb3J3YXJkaW5nQ2FsbGJhY2tzICkgPT4ge1xuICAgICAgZm9yd2FyZGluZ0NhbGxiYWNrcy5wdXNoKCAoKSA9PiB7XG4gICAgICAgIHBkb21IZWxwVGV4dE5vZGUuaW5uZXJDb250ZW50ID0gaGVscFRleHQ7XG4gICAgICB9ICk7XG4gICAgICByZXR1cm4gb3B0aW9ucztcbiAgICB9O1xuXG4gICAgLy8gSWYgbm8gYWNjZXNzaWJsZU5hbWUgaGFzIGJlZW4gcHJvdmlkZWQsIHRyeSB0byBmaW5kIG9uZSBmcm9tIHRoZSB0aXRsZU5vZGVcbiAgICBpZiAoICFvcHRpb25zLmFjY2Vzc2libGVOYW1lICYmIG9wdGlvbnMudGl0bGVOb2RlICkge1xuICAgICAgdGhpcy5hY2Nlc3NpYmxlTmFtZSA9IFBET01VdGlscy5maW5kU3RyaW5nUHJvcGVydHkoIG9wdGlvbnMudGl0bGVOb2RlICk7XG4gICAgfVxuXG4gICAgdGhpcy5jb25zdHJhaW50ID0gbmV3IEFjY29yZGlvbkJveENvbnN0cmFpbnQoXG4gICAgICB0aGlzLFxuICAgICAgY29udGVudE5vZGUsXG4gICAgICBjb250YWluZXJOb2RlLFxuICAgICAgdGhpcy5leHBhbmRlZEJveCxcbiAgICAgIHRoaXMuY29sbGFwc2VkQm94LFxuICAgICAgdGhpcy5leHBhbmRlZFRpdGxlQmFyLFxuICAgICAgdGhpcy5jb2xsYXBzZWRUaXRsZUJhcixcbiAgICAgIHRoaXMuZXhwYW5kZWRCb3hPdXRsaW5lLFxuICAgICAgdGhpcy5jb2xsYXBzZWRCb3hPdXRsaW5lLFxuICAgICAgdGl0bGVOb2RlLFxuICAgICAgdGhpcy5leHBhbmRDb2xsYXBzZUJ1dHRvbixcbiAgICAgIG9wdGlvbnNcbiAgICApO1xuICAgIHRoaXMuY29uc3RyYWludC51cGRhdGVMYXlvdXQoKTtcblxuICAgIC8vIERvbid0IHVwZGF0ZSBhdXRvbWF0aWNhbGx5IGlmIHJlc2l6ZTpmYWxzZVxuICAgIHRoaXMuY29uc3RyYWludC5lbmFibGVkID0gb3B0aW9ucy5yZXNpemU7XG5cbiAgICAvLyBleHBhbmQvY29sbGFwc2UgdGhlIGJveFxuICAgIGNvbnN0IGV4cGFuZGVkUHJvcGVydHlPYnNlcnZlciA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGV4cGFuZGVkID0gdGhpcy5leHBhbmRlZFByb3BlcnR5LnZhbHVlO1xuXG4gICAgICB0aGlzLmV4cGFuZGVkQm94LnZpc2libGUgPSBleHBhbmRlZDtcbiAgICAgIHRoaXMuY29sbGFwc2VkQm94LnZpc2libGUgPSAhZXhwYW5kZWQ7XG5cbiAgICAgIC8vIFRoZSBcInJlZ2lvblwiIGNvbnRhaW5pbmcgYWNjZXNzaWJsZSBjb250ZW50IHNob3VsZCBub3QgYmUgZGlzY292ZXJhYmxlIHdoZW4gdGhlIGJveCBpcyBjb2xsYXBzZWQuXG4gICAgICBwZG9tQ29udGVudE5vZGUudmlzaWJsZSA9IGV4cGFuZGVkO1xuXG4gICAgICB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLnNldEZvY3VzSGlnaGxpZ2h0KCBleHBhbmRlZCA/IGV4cGFuZGVkRm9jdXNIaWdobGlnaHQgOiBjb2xsYXBzZWRGb2N1c0hpZ2hsaWdodCApO1xuXG4gICAgICB0aXRsZU5vZGUudmlzaWJsZSA9ICggZXhwYW5kZWQgJiYgb3B0aW9ucy5zaG93VGl0bGVXaGVuRXhwYW5kZWQgKSB8fCAhZXhwYW5kZWQ7XG5cbiAgICAgIHBkb21Db250YWluZXJOb2RlLnNldFBET01BdHRyaWJ1dGUoICdhcmlhLWhpZGRlbicsICFleHBhbmRlZCApO1xuXG4gICAgICB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLnZvaWNpbmdTcGVha0Z1bGxSZXNwb25zZSgge1xuICAgICAgICBoaW50UmVzcG9uc2U6IG51bGxcbiAgICAgIH0gKTtcbiAgICB9O1xuICAgIHRoaXMuZXhwYW5kZWRQcm9wZXJ0eS5saW5rKCBleHBhbmRlZFByb3BlcnR5T2JzZXJ2ZXIgKTtcblxuICAgIHRoaXMuZGlzcG9zZUVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHRoaXMuZXhwYW5kZWRQcm9wZXJ0eS51bmxpbmsoIGV4cGFuZGVkUHJvcGVydHlPYnNlcnZlciApICk7XG5cbiAgICB0aGlzLm11dGF0ZSggXy5vbWl0KCBvcHRpb25zLCAnY3Vyc29yJyApICk7XG5cbiAgICAvLyByZXNldCB0aGluZ3MgdGhhdCBhcmUgb3duZWQgYnkgQWNjb3JkaW9uQm94XG4gICAgdGhpcy5yZXNldEFjY29yZGlvbkJveCA9ICgpID0+IHtcblxuICAgICAgLy8gSWYgZXhwYW5kZWRQcm9wZXJ0eSB3YXNuJ3QgcHJvdmlkZWQgdmlhIG9wdGlvbnMsIHdlIG93biBpdCBhbmQgdGhlcmVmb3JlIG5lZWQgdG8gcmVzZXQgaXQuXG4gICAgICBpZiAoICFvcHRpb25zLmV4cGFuZGVkUHJvcGVydHkgKSB7XG4gICAgICAgIHRoaXMuZXhwYW5kZWRQcm9wZXJ0eS5yZXNldCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBzdXBwb3J0IGZvciBiaW5kZXIgZG9jdW1lbnRhdGlvbiwgc3RyaXBwZWQgb3V0IGluIGJ1aWxkcyBhbmQgb25seSBydW5zIHdoZW4gP2JpbmRlciBpcyBzcGVjaWZpZWRcbiAgICBhc3NlcnQgJiYgd2luZG93LnBoZXQ/LmNoaXBwZXI/LnF1ZXJ5UGFyYW1ldGVycz8uYmluZGVyICYmIEluc3RhbmNlUmVnaXN0cnkucmVnaXN0ZXJEYXRhVVJMKCAnc3VuJywgJ0FjY29yZGlvbkJveCcsIHRoaXMgKTtcblxuICAgIC8vIERlY29yYXRpbmcgd2l0aCBhZGRpdGlvbmFsIGNvbnRlbnQgaXMgYW4gYW50aS1wYXR0ZXJuLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvODYwXG4gICAgYXNzZXJ0ICYmIGFzc2VydE5vQWRkaXRpb25hbENoaWxkcmVuKCB0aGlzICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaWRlYWwgaGVpZ2h0IG9mIHRoZSBjb2xsYXBzZWQgYm94IChpZ25vcmluZyB0aGluZ3MgbGlrZSBzdHJva2Ugd2lkdGgpXG4gICAqL1xuICBwdWJsaWMgZ2V0Q29sbGFwc2VkQm94SGVpZ2h0KCk6IG51bWJlciB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5jb25zdHJhaW50Lmxhc3RDb2xsYXBzZWRCb3hIZWlnaHQhO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmVzdWx0ICE9PSBudWxsICk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGlkZWFsIGhlaWdodCBvZiB0aGUgZXhwYW5kZWQgYm94IChpZ25vcmluZyB0aGluZ3MgbGlrZSBzdHJva2Ugd2lkdGgpXG4gICAqL1xuICBwdWJsaWMgZ2V0RXhwYW5kZWRCb3hIZWlnaHQoKTogbnVtYmVyIHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmNvbnN0cmFpbnQubGFzdEV4cGFuZGVkQm94SGVpZ2h0ITtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJlc3VsdCAhPT0gbnVsbCApO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcbiAgICB0aGlzLnJlc2V0QWNjb3JkaW9uQm94KCk7XG4gIH1cbn1cblxuY2xhc3MgSW50ZXJhY3RpdmVIaWdobGlnaHRQYXRoIGV4dGVuZHMgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcoIFBhdGggKSB7fVxuXG5jbGFzcyBJbnRlcmFjdGl2ZUhpZ2hsaWdodFJlY3RhbmdsZSBleHRlbmRzIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nKCBSZWN0YW5nbGUgKSB7fVxuXG5jbGFzcyBBY2NvcmRpb25Cb3hDb25zdHJhaW50IGV4dGVuZHMgTGF5b3V0Q29uc3RyYWludCB7XG5cbiAgLy8gU3VwcG9ydCBwdWJsaWMgYWNjZXNzb3JzXG4gIHB1YmxpYyBsYXN0Q29sbGFwc2VkQm94SGVpZ2h0OiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgcHVibGljIGxhc3RFeHBhbmRlZEJveEhlaWdodDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcml2YXRlIHJlYWRvbmx5IGFjY29yZGlvbkJveDogQWNjb3JkaW9uQm94LFxuICAgICAgICAgICAgICAgICAgICAgIHByaXZhdGUgcmVhZG9ubHkgY29udGVudE5vZGU6IE5vZGUsXG4gICAgICAgICAgICAgICAgICAgICAgcHJpdmF0ZSByZWFkb25seSBjb250YWluZXJOb2RlOiBOb2RlLFxuICAgICAgICAgICAgICAgICAgICAgIHByaXZhdGUgcmVhZG9ubHkgZXhwYW5kZWRCb3g6IFJlY3RhbmdsZSxcbiAgICAgICAgICAgICAgICAgICAgICBwcml2YXRlIHJlYWRvbmx5IGNvbGxhcHNlZEJveDogUmVjdGFuZ2xlLFxuICAgICAgICAgICAgICAgICAgICAgIHByaXZhdGUgcmVhZG9ubHkgZXhwYW5kZWRUaXRsZUJhcjogUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICBwcml2YXRlIHJlYWRvbmx5IGNvbGxhcHNlZFRpdGxlQmFyOiBSZWN0YW5nbGUsXG4gICAgICAgICAgICAgICAgICAgICAgcHJpdmF0ZSByZWFkb25seSBleHBhbmRlZEJveE91dGxpbmU6IFJlY3RhbmdsZSB8IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgcHJpdmF0ZSByZWFkb25seSBjb2xsYXBzZWRCb3hPdXRsaW5lOiBSZWN0YW5nbGUgfCBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgIHByaXZhdGUgcmVhZG9ubHkgdGl0bGVOb2RlOiBOb2RlLFxuICAgICAgICAgICAgICAgICAgICAgIHByaXZhdGUgcmVhZG9ubHkgZXhwYW5kQ29sbGFwc2VCdXR0b246IE5vZGUsXG4gICAgICAgICAgICAgICAgICAgICAgcHJpdmF0ZSByZWFkb25seSBvcHRpb25zOiBTdHJpY3RPbWl0PFJlcXVpcmVkPFNlbGZPcHRpb25zPiwgJ2V4cGFuZENvbGxhcHNlQnV0dG9uT3B0aW9ucyc+ICkge1xuICAgIHN1cGVyKCBhY2NvcmRpb25Cb3ggKTtcblxuICAgIHRoaXMuYWNjb3JkaW9uQm94LmxvY2FsUHJlZmVycmVkV2lkdGhQcm9wZXJ0eS5sYXp5TGluayggdGhpcy5fdXBkYXRlTGF5b3V0TGlzdGVuZXIgKTtcbiAgICB0aGlzLmFjY29yZGlvbkJveC5sb2NhbFByZWZlcnJlZEhlaWdodFByb3BlcnR5LmxhenlMaW5rKCB0aGlzLl91cGRhdGVMYXlvdXRMaXN0ZW5lciApO1xuICAgIHRoaXMuYWNjb3JkaW9uQm94LmV4cGFuZGVkUHJvcGVydHkubGF6eUxpbmsoIHRoaXMuX3VwZGF0ZUxheW91dExpc3RlbmVyICk7XG5cbiAgICB0aGlzLmFkZE5vZGUoIGNvbnRlbnROb2RlICk7XG4gICAgdGhpcy5hZGROb2RlKCB0aXRsZU5vZGUgKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBvdmVycmlkZSBsYXlvdXQoKTogdm9pZCB7XG4gICAgc3VwZXIubGF5b3V0KCk7XG5cbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG4gICAgaWYgKCB0aGlzLmFjY29yZGlvbkJveC5pc0NoaWxkSW5jbHVkZWRJbkxheW91dCggdGhpcy5jb250ZW50Tm9kZSApICkge1xuICAgICAgdGhpcy5jb250YWluZXJOb2RlLmNoaWxkcmVuID0gW1xuICAgICAgICB0aGlzLmV4cGFuZGVkQm94LFxuICAgICAgICB0aGlzLmNvbGxhcHNlZEJveCxcbiAgICAgICAgdGhpcy50aXRsZU5vZGUsXG4gICAgICAgIHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b25cbiAgICAgIF07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5jb250YWluZXJOb2RlLmNoaWxkcmVuID0gW107XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZXhwYW5kZWQgPSB0aGlzLmFjY29yZGlvbkJveC5leHBhbmRlZFByb3BlcnR5LnZhbHVlO1xuICAgIGNvbnN0IHVzZUV4cGFuZGVkQm91bmRzID0gZXhwYW5kZWQgfHwgb3B0aW9ucy51c2VFeHBhbmRlZEJvdW5kc1doZW5Db2xsYXBzZWQ7XG5cbiAgICAvLyBXZSBvbmx5IGhhdmUgdG8gYWNjb3VudCBmb3IgdGhlIGxpbmVXaWR0aCBpbiBvdXIgbGF5b3V0IGlmIHdlIGhhdmUgYSBzdHJva2VcbiAgICBjb25zdCBsaW5lV2lkdGggPSBvcHRpb25zLnN0cm9rZSA9PT0gbnVsbCA/IDAgOiBvcHRpb25zLmxpbmVXaWR0aDtcblxuICAgIC8vIExheW91dFByb3h5IGhlbHBzIHdpdGggc29tZSBsYXlvdXQgb3BlcmF0aW9ucywgYW5kIHdpbGwgc3VwcG9ydCBhIG5vbi1jaGlsZCBjb250ZW50LlxuICAgIGNvbnN0IGNvbnRlbnRQcm94eSA9IHRoaXMuY3JlYXRlTGF5b3V0UHJveHkoIHRoaXMuY29udGVudE5vZGUgKSE7XG4gICAgY29uc3QgdGl0bGVQcm94eSA9IHRoaXMuY3JlYXRlTGF5b3V0UHJveHkoIHRoaXMudGl0bGVOb2RlICkhO1xuXG4gICAgY29uc3QgbWluaW11bUNvbnRlbnRXaWR0aCA9IGNvbnRlbnRQcm94eS5taW5pbXVtV2lkdGg7XG4gICAgY29uc3QgbWluaW11bUNvbnRlbnRIZWlnaHQgPSBjb250ZW50UHJveHkubWluaW11bUhlaWdodDtcbiAgICBjb25zdCBtaW51bXVtVGl0bGVXaWR0aCA9IHRpdGxlUHJveHkubWluaW11bVdpZHRoO1xuXG4gICAgLy8gVGhlIGlkZWFsIGhlaWdodCBvZiB0aGUgY29sbGFwc2VkIGJveCAoaWdub3JpbmcgdGhpbmdzIGxpa2Ugc3Ryb2tlIHdpZHRoKS4gRG9lcyBub3QgZGVwZW5kIG9uIHRpdGxlIHdpZHRoXG4gICAgLy8gT1IgY29udGVudCBzaXplLCBib3RoIG9mIHdoaWNoIGNvdWxkIGJlIGNoYW5nZWQgZGVwZW5kaW5nIG9uIHByZWZlcnJlZCBzaXplcy5cbiAgICBjb25zdCBjb2xsYXBzZWRCb3hIZWlnaHQgPSBNYXRoLm1heChcbiAgICAgIHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24uaGVpZ2h0ICsgKCAyICogb3B0aW9ucy5idXR0b25ZTWFyZ2luICksXG4gICAgICB0aGlzLnRpdGxlTm9kZS5oZWlnaHQgKyAoIDIgKiBvcHRpb25zLnRpdGxlWU1hcmdpbiApXG4gICAgKTtcblxuICAgIGNvbnN0IG1pbmltdW1FeHBhbmRlZEJveEhlaWdodCA9XG4gICAgICBvcHRpb25zLnNob3dUaXRsZVdoZW5FeHBhbmRlZCA/XG4gICAgICAgIC8vIGNvbnRlbnQgaXMgYmVsb3cgYnV0dG9uK3RpdGxlXG4gICAgICBNYXRoLm1heChcbiAgICAgICAgLy8gY29udGVudCAod2l0aCBvcHRpb25hbCBvdmVybGFwKVxuICAgICAgICAoIG9wdGlvbnMuYWxsb3dDb250ZW50VG9PdmVybGFwVGl0bGUgPyBvcHRpb25zLmNvbnRlbnRZTWFyZ2luIDogY29sbGFwc2VkQm94SGVpZ2h0ICsgb3B0aW9ucy5jb250ZW50WVNwYWNpbmcgKSArIG1pbmltdW1Db250ZW50SGVpZ2h0ICsgb3B0aW9ucy5jb250ZW50WU1hcmdpbixcbiAgICAgICAgLy8gdGhlIGNvbGxhcHNlZCBib3ggaGVpZ2h0IGl0c2VsZiAoaWYgd2Ugb3ZlcmxhcCBjb250ZW50LCB0aGlzIGNvdWxkIGJlIGxhcmdlcilcbiAgICAgICAgY29sbGFwc2VkQm94SGVpZ2h0XG4gICAgICApIDpcbiAgICAgICAgLy8gY29udGVudCBpcyBuZXh0IHRvIGJ1dHRvblxuICAgICAgTWF0aC5tYXgoXG4gICAgICAgIHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24uaGVpZ2h0ICsgKCAyICogb3B0aW9ucy5idXR0b25ZTWFyZ2luICksXG4gICAgICAgIG1pbmltdW1Db250ZW50SGVpZ2h0ICsgKCAyICogb3B0aW9ucy5jb250ZW50WU1hcmdpbiApXG4gICAgICApO1xuXG5cbiAgICAvLyBUaGUgY29tcHV0ZWQgd2lkdGggb2YgdGhlIGJveCAoaWdub3JpbmcgdGhpbmdzIGxpa2Ugc3Ryb2tlIHdpZHRoKVxuICAgIC8vIEluaXRpYWwgd2lkdGggaXMgZGVwZW5kZW50IG9uIHdpZHRoIG9mIHRpdGxlIHNlY3Rpb24gb2YgdGhlIGFjY29yZGlvbiBib3hcbiAgICBsZXQgbWluaW11bUJveFdpZHRoID0gTWF0aC5tYXgoXG4gICAgICBvcHRpb25zLm1pbldpZHRoLFxuICAgICAgb3B0aW9ucy5idXR0b25YTWFyZ2luICsgdGhpcy5leHBhbmRDb2xsYXBzZUJ1dHRvbi53aWR0aCArIG9wdGlvbnMudGl0bGVYU3BhY2luZyArIG1pbnVtdW1UaXRsZVdpZHRoICsgb3B0aW9ucy50aXRsZVhNYXJnaW5cbiAgICApO1xuXG4gICAgLy8gTGltaXQgd2lkdGggYnkgdGhlIG5lY2Vzc2FyeSBzcGFjZSBmb3IgdGhlIHRpdGxlIG5vZGVcbiAgICBpZiAoIG9wdGlvbnMudGl0bGVBbGlnblggPT09ICdjZW50ZXInICkge1xuICAgICAgLy8gSGFuZGxlcyBjYXNlIHdoZXJlIHRoZSBzcGFjaW5nIG9uIHRoZSBsZWZ0IHNpZGUgb2YgdGhlIHRpdGxlIGlzIGxhcmdlciB0aGFuIHRoZSBzcGFjaW5nIG9uIHRoZSByaWdodCBzaWRlLlxuICAgICAgbWluaW11bUJveFdpZHRoID0gTWF0aC5tYXgoIG1pbmltdW1Cb3hXaWR0aCwgKCBvcHRpb25zLmJ1dHRvblhNYXJnaW4gKyB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLndpZHRoICsgb3B0aW9ucy50aXRsZVhTcGFjaW5nICkgKiAyICsgbWludW11bVRpdGxlV2lkdGggKTtcblxuICAgICAgLy8gSGFuZGxlcyBjYXNlIHdoZXJlIHRoZSBzcGFjaW5nIG9uIHRoZSByaWdodCBzaWRlIG9mIHRoZSB0aXRsZSBpcyBsYXJnZXIgdGhhbiB0aGUgc3BhY2luZyBvbiB0aGUgbGVmdCBzaWRlLlxuICAgICAgbWluaW11bUJveFdpZHRoID0gTWF0aC5tYXgoIG1pbmltdW1Cb3hXaWR0aCwgKCBvcHRpb25zLnRpdGxlWE1hcmdpbiApICogMiArIG1pbnVtdW1UaXRsZVdpZHRoICk7XG4gICAgfVxuXG4gICAgLy8gQ29tcGFyZSB3aWR0aCBvZiB0aXRsZSBzZWN0aW9uIHRvIGNvbnRlbnQgc2VjdGlvbiBvZiB0aGUgYWNjb3JkaW9uIGJveFxuICAgIC8vIGNvbnRlbnQgaXMgYmVsb3cgYnV0dG9uK3RpdGxlXG4gICAgaWYgKCBvcHRpb25zLnNob3dUaXRsZVdoZW5FeHBhbmRlZCApIHtcbiAgICAgIG1pbmltdW1Cb3hXaWR0aCA9IE1hdGgubWF4KCBtaW5pbXVtQm94V2lkdGgsIG1pbmltdW1Db250ZW50V2lkdGggKyAoIDIgKiBvcHRpb25zLmNvbnRlbnRYTWFyZ2luICkgKTtcbiAgICB9XG4gICAgLy8gY29udGVudCBpcyBuZXh0IHRvIGJ1dHRvblxuICAgIGVsc2Uge1xuICAgICAgbWluaW11bUJveFdpZHRoID0gTWF0aC5tYXgoIG1pbmltdW1Cb3hXaWR0aCwgdGhpcy5leHBhbmRDb2xsYXBzZUJ1dHRvbi53aWR0aCArIG1pbmltdW1Db250ZW50V2lkdGggKyBvcHRpb25zLmJ1dHRvblhNYXJnaW4gKyBvcHRpb25zLmNvbnRlbnRYTWFyZ2luICsgb3B0aW9ucy5jb250ZW50WFNwYWNpbmcgKTtcbiAgICB9XG5cbiAgICAvLyBCb3RoIG9mIHRoZXNlIHVzZSBcImhhbGZcIiB0aGUgbGluZVdpZHRoIG9uIGVpdGhlciBzaWRlXG4gICAgY29uc3QgbWluaW11bVdpZHRoID0gbWluaW11bUJveFdpZHRoICsgbGluZVdpZHRoO1xuICAgIGNvbnN0IG1pbmltdW1IZWlnaHQgPSAoIHVzZUV4cGFuZGVkQm91bmRzID8gbWluaW11bUV4cGFuZGVkQm94SGVpZ2h0IDogY29sbGFwc2VkQm94SGVpZ2h0ICkgKyBsaW5lV2lkdGg7XG5cbiAgICAvLyBPdXIgcmVzdWx0aW5nIHNpemVzIChhbGxvdyBzZXR0aW5nIHByZWZlcnJlZCB3aWR0aC9oZWlnaHQgb24gdGhlIGJveClcbiAgICBjb25zdCBwcmVmZXJyZWRXaWR0aDogbnVtYmVyID0gTWF0aC5tYXgoIG1pbmltdW1XaWR0aCwgdGhpcy5hY2NvcmRpb25Cb3gubG9jYWxQcmVmZXJyZWRXaWR0aCB8fCAwICk7XG4gICAgY29uc3QgcHJlZmVycmVkSGVpZ2h0OiBudW1iZXIgPSBNYXRoLm1heCggbWluaW11bUhlaWdodCwgdGhpcy5hY2NvcmRpb25Cb3gubG9jYWxQcmVmZXJyZWRIZWlnaHQgfHwgMCApO1xuXG4gICAgY29uc3QgYm94V2lkdGggPSBwcmVmZXJyZWRXaWR0aCAtIGxpbmVXaWR0aDtcbiAgICBjb25zdCBib3hIZWlnaHQgPSBwcmVmZXJyZWRIZWlnaHQgLSBsaW5lV2lkdGg7XG5cbiAgICB0aGlzLmxhc3RDb2xsYXBzZWRCb3hIZWlnaHQgPSBjb2xsYXBzZWRCb3hIZWlnaHQ7XG4gICAgaWYgKCB1c2VFeHBhbmRlZEJvdW5kcyApIHtcbiAgICAgIHRoaXMubGFzdEV4cGFuZGVkQm94SGVpZ2h0ID0gYm94SGVpZ2h0O1xuICAgIH1cblxuICAgIHRoaXMuY29sbGFwc2VkQm94LnJlY3RXaWR0aCA9IGJveFdpZHRoO1xuICAgIHRoaXMuY29sbGFwc2VkQm94LnJlY3RIZWlnaHQgPSBjb2xsYXBzZWRCb3hIZWlnaHQ7XG5cbiAgICBjb25zdCBjb2xsYXBzZWRCb3VuZHMgPSB0aGlzLmNvbGxhcHNlZEJveC5zZWxmQm91bmRzO1xuXG4gICAgdGhpcy5jb2xsYXBzZWRUaXRsZUJhci5yZWN0V2lkdGggPSBib3hXaWR0aDtcbiAgICB0aGlzLmNvbGxhcHNlZFRpdGxlQmFyLnJlY3RIZWlnaHQgPSBjb2xsYXBzZWRCb3hIZWlnaHQ7XG5cbiAgICAvLyBjb2xsYXBzZWRCb3hPdXRsaW5lIGV4aXN0cyBvbmx5IGlmIG9wdGlvbnMuc3Ryb2tlIGlzIHRydXRoeVxuICAgIGlmICggdGhpcy5jb2xsYXBzZWRCb3hPdXRsaW5lICkge1xuICAgICAgdGhpcy5jb2xsYXBzZWRCb3hPdXRsaW5lLnJlY3RXaWR0aCA9IGJveFdpZHRoO1xuICAgICAgdGhpcy5jb2xsYXBzZWRCb3hPdXRsaW5lLnJlY3RIZWlnaHQgPSBjb2xsYXBzZWRCb3hIZWlnaHQ7XG4gICAgfVxuXG4gICAgaWYgKCB1c2VFeHBhbmRlZEJvdW5kcyApIHtcbiAgICAgIHRoaXMuZXhwYW5kZWRCb3gucmVjdFdpZHRoID0gYm94V2lkdGg7XG4gICAgICB0aGlzLmV4cGFuZGVkQm94LnJlY3RIZWlnaHQgPSBib3hIZWlnaHQ7XG5cbiAgICAgIGNvbnN0IGV4cGFuZGVkQm91bmRzID0gdGhpcy5leHBhbmRlZEJveC5zZWxmQm91bmRzO1xuXG4gICAgICAvLyBleHBhbmRlZEJveE91dGxpbmUgZXhpc3RzIG9ubHkgaWYgb3B0aW9ucy5zdHJva2UgaXMgdHJ1dGh5XG4gICAgICBpZiAoIHRoaXMuZXhwYW5kZWRCb3hPdXRsaW5lICkge1xuICAgICAgICB0aGlzLmV4cGFuZGVkQm94T3V0bGluZS5yZWN0V2lkdGggPSBib3hXaWR0aDtcbiAgICAgICAgdGhpcy5leHBhbmRlZEJveE91dGxpbmUucmVjdEhlaWdodCA9IGJveEhlaWdodDtcbiAgICAgIH1cblxuICAgICAgLy8gRXhwYW5kZWQgdGl0bGUgYmFyIGhhcyAob3B0aW9uYWwpIHJvdW5kZWQgdG9wIGNvcm5lcnMsIHNxdWFyZSBib3R0b20gY29ybmVycy4gQ2xpY2tpbmcgaXQgb3BlcmF0ZXMgbGlrZVxuICAgICAgLy8gZXhwYW5kL2NvbGxhcHNlIGJ1dHRvbi5cbiAgICAgIHRoaXMuZXhwYW5kZWRUaXRsZUJhci5zaGFwZSA9IFNoYXBlLnJvdW5kZWRSZWN0YW5nbGVXaXRoUmFkaWkoIDAsIDAsIGJveFdpZHRoLCBjb2xsYXBzZWRCb3hIZWlnaHQsIHtcbiAgICAgICAgdG9wTGVmdDogb3B0aW9ucy5jb3JuZXJSYWRpdXMsXG4gICAgICAgIHRvcFJpZ2h0OiBvcHRpb25zLmNvcm5lclJhZGl1c1xuICAgICAgfSApO1xuXG4gICAgICBsZXQgY29udGVudFNwYW5MZWZ0ID0gZXhwYW5kZWRCb3VuZHMubGVmdCArIG9wdGlvbnMuY29udGVudFhNYXJnaW47XG4gICAgICBsZXQgY29udGVudFNwYW5SaWdodCA9IGV4cGFuZGVkQm91bmRzLnJpZ2h0IC0gb3B0aW9ucy5jb250ZW50WE1hcmdpbjtcbiAgICAgIGlmICggIW9wdGlvbnMuc2hvd1RpdGxlV2hlbkV4cGFuZGVkICkge1xuICAgICAgICAvLyBjb250ZW50IHdpbGwgYmUgcGxhY2VkIG5leHQgdG8gYnV0dG9uXG4gICAgICAgIGlmICggb3B0aW9ucy5idXR0b25BbGlnbiA9PT0gJ2xlZnQnICkge1xuICAgICAgICAgIGNvbnRlbnRTcGFuTGVmdCArPSB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLndpZHRoICsgb3B0aW9ucy5jb250ZW50WFNwYWNpbmc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7IC8vIHJpZ2h0IG9uIHJpZ2h0XG4gICAgICAgICAgY29udGVudFNwYW5SaWdodCAtPSB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLndpZHRoICsgb3B0aW9ucy5jb250ZW50WFNwYWNpbmc7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgYXZhaWxhYmxlQ29udGVudFdpZHRoID0gY29udGVudFNwYW5SaWdodCAtIGNvbnRlbnRTcGFuTGVmdDtcbiAgICAgIGNvbnN0IGF2YWlsYWJsZUNvbnRlbnRIZWlnaHQgPSBib3hIZWlnaHQgLSAoXG4gICAgICAgIG9wdGlvbnMuc2hvd1RpdGxlV2hlbkV4cGFuZGVkICYmICFvcHRpb25zLmFsbG93Q29udGVudFRvT3ZlcmxhcFRpdGxlID8gY29sbGFwc2VkQm94SGVpZ2h0ICsgb3B0aW9ucy5jb250ZW50WU1hcmdpbiArIG9wdGlvbnMuY29udGVudFlTcGFjaW5nIDogMiAqIG9wdGlvbnMuY29udGVudFlNYXJnaW5cbiAgICAgICk7XG5cbiAgICAgIC8vIERldGVybWluZSB0aGUgc2l6ZSBhdmFpbGFibGUgdG8gb3VyIGNvbnRlbnRcbiAgICAgIC8vIE5PVEU6IFdlIGRvIE5PVCBzZXQgcHJlZmVycmVkIHNpemVzIG9mIG91ciBjb250ZW50IGlmIHdlIGRvbid0IGhhdmUgYSBwcmVmZXJyZWQgc2l6ZSBvdXJzZWxmIVxuICAgICAgaWYgKCBpc1dpZHRoU2l6YWJsZSggdGhpcy5jb250ZW50Tm9kZSApICYmIHRoaXMuYWNjb3JkaW9uQm94LmxvY2FsUHJlZmVycmVkV2lkdGggIT09IG51bGwgKSB7XG4gICAgICAgIHRoaXMuY29udGVudE5vZGUucHJlZmVycmVkV2lkdGggPSBhdmFpbGFibGVDb250ZW50V2lkdGg7XG4gICAgICB9XG4gICAgICBpZiAoIGlzSGVpZ2h0U2l6YWJsZSggdGhpcy5jb250ZW50Tm9kZSApICYmIHRoaXMuYWNjb3JkaW9uQm94LmxvY2FsUHJlZmVycmVkSGVpZ2h0ICE9PSBudWxsICkge1xuICAgICAgICB0aGlzLmNvbnRlbnROb2RlLnByZWZlcnJlZEhlaWdodCA9IGF2YWlsYWJsZUNvbnRlbnRIZWlnaHQ7XG4gICAgICB9XG5cbiAgICAgIC8vIGNvbnRlbnQgbGF5b3V0XG4gICAgICBpZiAoIG9wdGlvbnMuY29udGVudFZlcnRpY2FsQWxpZ24gPT09ICd0b3AnICkge1xuICAgICAgICB0aGlzLmNvbnRlbnROb2RlLnRvcCA9IGV4cGFuZGVkQm91bmRzLmJvdHRvbSAtIG9wdGlvbnMuY29udGVudFlNYXJnaW4gLSBhdmFpbGFibGVDb250ZW50SGVpZ2h0O1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIG9wdGlvbnMuY29udGVudFZlcnRpY2FsQWxpZ24gPT09ICdib3R0b20nICkge1xuICAgICAgICB0aGlzLmNvbnRlbnROb2RlLmJvdHRvbSA9IGV4cGFuZGVkQm91bmRzLmJvdHRvbSAtIG9wdGlvbnMuY29udGVudFlNYXJnaW47XG4gICAgICB9XG4gICAgICBlbHNlIHsgLy8gY2VudGVyXG4gICAgICAgIHRoaXMuY29udGVudE5vZGUuY2VudGVyWSA9IGV4cGFuZGVkQm91bmRzLmJvdHRvbSAtIG9wdGlvbnMuY29udGVudFlNYXJnaW4gLSBhdmFpbGFibGVDb250ZW50SGVpZ2h0IC8gMjtcbiAgICAgIH1cblxuICAgICAgaWYgKCBvcHRpb25zLmNvbnRlbnRBbGlnbiA9PT0gJ2xlZnQnICkge1xuICAgICAgICB0aGlzLmNvbnRlbnROb2RlLmxlZnQgPSBjb250ZW50U3BhbkxlZnQ7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggb3B0aW9ucy5jb250ZW50QWxpZ24gPT09ICdyaWdodCcgKSB7XG4gICAgICAgIHRoaXMuY29udGVudE5vZGUucmlnaHQgPSBjb250ZW50U3BhblJpZ2h0O1xuICAgICAgfVxuICAgICAgZWxzZSB7IC8vIGNlbnRlclxuICAgICAgICB0aGlzLmNvbnRlbnROb2RlLmNlbnRlclggPSAoIGNvbnRlbnRTcGFuTGVmdCArIGNvbnRlbnRTcGFuUmlnaHQgKSAvIDI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gYnV0dG9uIGhvcml6b250YWwgbGF5b3V0XG4gICAgbGV0IHRpdGxlTGVmdFNwYW4gPSBjb2xsYXBzZWRCb3VuZHMubGVmdCArIG9wdGlvbnMudGl0bGVYTWFyZ2luO1xuICAgIGxldCB0aXRsZVJpZ2h0U3BhbiA9IGNvbGxhcHNlZEJvdW5kcy5yaWdodCAtIG9wdGlvbnMudGl0bGVYTWFyZ2luO1xuICAgIGlmICggb3B0aW9ucy5idXR0b25BbGlnbiA9PT0gJ2xlZnQnICkge1xuICAgICAgdGhpcy5leHBhbmRDb2xsYXBzZUJ1dHRvbi5sZWZ0ID0gY29sbGFwc2VkQm91bmRzLmxlZnQgKyBvcHRpb25zLmJ1dHRvblhNYXJnaW47XG4gICAgICB0aXRsZUxlZnRTcGFuID0gdGhpcy5leHBhbmRDb2xsYXBzZUJ1dHRvbi5yaWdodCArIG9wdGlvbnMudGl0bGVYU3BhY2luZztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLnJpZ2h0ID0gY29sbGFwc2VkQm91bmRzLnJpZ2h0IC0gb3B0aW9ucy5idXR0b25YTWFyZ2luO1xuICAgICAgdGl0bGVSaWdodFNwYW4gPSB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLmxlZnQgLSBvcHRpb25zLnRpdGxlWFNwYWNpbmc7XG4gICAgfVxuXG4gICAgLy8gdGl0bGUgaG9yaXpvbnRhbCBsYXlvdXRcbiAgICBpZiAoIGlzV2lkdGhTaXphYmxlKCB0aGlzLnRpdGxlTm9kZSApICkge1xuICAgICAgdGhpcy50aXRsZU5vZGUucHJlZmVycmVkV2lkdGggPSB0aXRsZVJpZ2h0U3BhbiAtIHRpdGxlTGVmdFNwYW47XG4gICAgfVxuICAgIGlmICggb3B0aW9ucy50aXRsZUFsaWduWCA9PT0gJ2xlZnQnICkge1xuICAgICAgdGhpcy50aXRsZU5vZGUubGVmdCA9IHRpdGxlTGVmdFNwYW47XG4gICAgfVxuICAgIGVsc2UgaWYgKCBvcHRpb25zLnRpdGxlQWxpZ25YID09PSAncmlnaHQnICkge1xuICAgICAgdGhpcy50aXRsZU5vZGUucmlnaHQgPSB0aXRsZVJpZ2h0U3BhbjtcbiAgICB9XG4gICAgZWxzZSB7IC8vIGNlbnRlclxuICAgICAgdGhpcy50aXRsZU5vZGUuY2VudGVyWCA9IGNvbGxhcHNlZEJvdW5kcy5jZW50ZXJYO1xuICAgIH1cblxuICAgIC8vIGJ1dHRvbiAmIHRpdGxlIHZlcnRpY2FsIGxheW91dFxuICAgIGlmICggb3B0aW9ucy50aXRsZUFsaWduWSA9PT0gJ3RvcCcgKSB7XG4gICAgICB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLnRvcCA9IHRoaXMuY29sbGFwc2VkQm94LnRvcCArIE1hdGgubWF4KCBvcHRpb25zLmJ1dHRvbllNYXJnaW4sIG9wdGlvbnMudGl0bGVZTWFyZ2luICk7XG4gICAgICB0aGlzLnRpdGxlTm9kZS50b3AgPSB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLnRvcDtcbiAgICB9XG4gICAgZWxzZSB7IC8vIGNlbnRlclxuICAgICAgdGhpcy5leHBhbmRDb2xsYXBzZUJ1dHRvbi5jZW50ZXJZID0gdGhpcy5jb2xsYXBzZWRCb3guY2VudGVyWTtcbiAgICAgIHRoaXMudGl0bGVOb2RlLmNlbnRlclkgPSB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLmNlbnRlclk7XG4gICAgfVxuXG4gICAgY29udGVudFByb3h5LmRpc3Bvc2UoKTtcbiAgICB0aXRsZVByb3h5LmRpc3Bvc2UoKTtcblxuICAgIC8vIFNldCBtaW5pbXVtcyBhdCB0aGUgZW5kLCBzaW5jZSB0aGlzIG1heSB0cmlnZ2VyIGEgcmVsYXlvdXRcbiAgICB0aGlzLmFjY29yZGlvbkJveC5sb2NhbE1pbmltdW1XaWR0aCA9IG1pbmltdW1XaWR0aDtcbiAgICB0aGlzLmFjY29yZGlvbkJveC5sb2NhbE1pbmltdW1IZWlnaHQgPSBtaW5pbXVtSGVpZ2h0O1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5hY2NvcmRpb25Cb3gubG9jYWxQcmVmZXJyZWRXaWR0aFByb3BlcnR5LnVubGluayggdGhpcy5fdXBkYXRlTGF5b3V0TGlzdGVuZXIgKTtcbiAgICB0aGlzLmFjY29yZGlvbkJveC5sb2NhbFByZWZlcnJlZEhlaWdodFByb3BlcnR5LnVubGluayggdGhpcy5fdXBkYXRlTGF5b3V0TGlzdGVuZXIgKTtcbiAgICB0aGlzLmFjY29yZGlvbkJveC5leHBhbmRlZFByb3BlcnR5LnVubGluayggdGhpcy5fdXBkYXRlTGF5b3V0TGlzdGVuZXIgKTtcblxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5zdW4ucmVnaXN0ZXIoICdBY2NvcmRpb25Cb3gnLCBBY2NvcmRpb25Cb3ggKTsiXSwibmFtZXMiOlsiQm9vbGVhblByb3BlcnR5IiwiU2hhcGUiLCJJbnN0YW5jZVJlZ2lzdHJ5Iiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJhc3NlcnROb0FkZGl0aW9uYWxDaGlsZHJlbiIsIkhpZ2hsaWdodEZyb21Ob2RlIiwiSW50ZXJhY3RpdmVIaWdobGlnaHRpbmciLCJpc0hlaWdodFNpemFibGUiLCJpc1dpZHRoU2l6YWJsZSIsIkxheW91dENvbnN0cmFpbnQiLCJOb2RlIiwiUGFyYWxsZWxET00iLCJQYXRoIiwiUERPTVBlZXIiLCJQRE9NVXRpbHMiLCJSZWN0YW5nbGUiLCJTaXphYmxlIiwiVGV4dCIsInNoYXJlZFNvdW5kUGxheWVycyIsIkV2ZW50VHlwZSIsIlRhbmRlbSIsIklPVHlwZSIsIkV4cGFuZENvbGxhcHNlQnV0dG9uIiwic3VuIiwiQWNjb3JkaW9uQm94IiwiZ2V0Q29sbGFwc2VkQm94SGVpZ2h0IiwicmVzdWx0IiwiY29uc3RyYWludCIsImxhc3RDb2xsYXBzZWRCb3hIZWlnaHQiLCJhc3NlcnQiLCJnZXRFeHBhbmRlZEJveEhlaWdodCIsImxhc3RFeHBhbmRlZEJveEhlaWdodCIsInJlc2V0IiwicmVzZXRBY2NvcmRpb25Cb3giLCJjb250ZW50Tm9kZSIsInByb3ZpZGVkT3B0aW9ucyIsIndpbmRvdyIsImhhc093blByb3BlcnR5Iiwib3B0aW9ucyIsInRpdGxlTm9kZSIsImV4cGFuZGVkUHJvcGVydHkiLCJleHBhbmRlZERlZmF1bHRWYWx1ZSIsInJlc2l6ZSIsIm92ZXJyaWRlVGl0bGVOb2RlUGlja2FibGUiLCJhbGxvd0NvbnRlbnRUb092ZXJsYXBUaXRsZSIsImN1cnNvciIsImxpbmVXaWR0aCIsImNvcm5lclJhZGl1cyIsInN0cm9rZSIsImZpbGwiLCJtaW5XaWR0aCIsInRpdGxlQWxpZ25YIiwidGl0bGVBbGlnblkiLCJ0aXRsZVhNYXJnaW4iLCJ0aXRsZVlNYXJnaW4iLCJ0aXRsZVhTcGFjaW5nIiwic2hvd1RpdGxlV2hlbkV4cGFuZGVkIiwidXNlRXhwYW5kZWRCb3VuZHNXaGVuQ29sbGFwc2VkIiwidGl0bGVCYXJFeHBhbmRDb2xsYXBzZSIsImJ1dHRvbkFsaWduIiwiYnV0dG9uWE1hcmdpbiIsImJ1dHRvbllNYXJnaW4iLCJjb250ZW50QWxpZ24iLCJjb250ZW50VmVydGljYWxBbGlnbiIsImNvbnRlbnRYTWFyZ2luIiwiY29udGVudFlNYXJnaW4iLCJjb250ZW50WFNwYWNpbmciLCJjb250ZW50WVNwYWNpbmciLCJleHBhbmRlZFNvdW5kUGxheWVyIiwiZ2V0IiwiY29sbGFwc2VkU291bmRQbGF5ZXIiLCJ0YWdOYW1lIiwiaGVhZGluZ1RhZ05hbWUiLCJ2b2ljaW5nTmFtZVJlc3BvbnNlIiwidm9pY2luZ09iamVjdFJlc3BvbnNlIiwidm9pY2luZ0NvbnRleHRSZXNwb25zZSIsInZvaWNpbmdIaW50UmVzcG9uc2UiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInRhbmRlbU5hbWVTdWZmaXgiLCJwaGV0aW9UeXBlIiwiQWNjb3JkaW9uQm94SU8iLCJwaGV0aW9FdmVudFR5cGUiLCJVU0VSIiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsInBoZXRpb0ZlYXR1cmVkIiwidGl0bGVCYXJPcHRpb25zIiwiZXhwYW5kQ29sbGFwc2VCdXR0b25PcHRpb25zIiwic2lkZUxlbmd0aCIsInZhbHVlT25Tb3VuZFBsYXllciIsInZhbHVlT2ZmU291bmRQbGF5ZXIiLCJjcmVhdGVUYW5kZW0iLCJleHBhbmRlZEJveE91dGxpbmUiLCJjb2xsYXBzZWRCb3hPdXRsaW5lIiwiZGlzcG9zZUVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImRpc3Bvc2UiLCJwaWNrYWJsZSIsImV4cGFuZENvbGxhcHNlQnV0dG9uIiwiYm94T3B0aW9ucyIsImV4cGFuZGVkQm94IiwiY29sbGFwc2VkQm94IiwiZXhwYW5kZWRUaXRsZUJhciIsIkludGVyYWN0aXZlSGlnaGxpZ2h0UGF0aCIsImFkZENoaWxkIiwiY29sbGFwc2VkVGl0bGVCYXIiLCJJbnRlcmFjdGl2ZUhpZ2hsaWdodFJlY3RhbmdsZSIsImV4cGFuZGVkRm9jdXNIaWdobGlnaHQiLCJjb2xsYXBzZWRGb2N1c0hpZ2hsaWdodCIsImFkZElucHV0TGlzdGVuZXIiLCJkb3duIiwiaXNFbmFibGVkIiwicGhldGlvU3RhcnRFdmVudCIsInZhbHVlIiwicGxheSIsInBoZXRpb0VuZEV2ZW50IiwiaW50ZXJhY3RpdmVIaWdobGlnaHQiLCJwaWNrYWJsZUxpc3RlbmVyIiwidmlzaWJsZSIsInZpc2libGVQcm9wZXJ0eSIsImxhenlMaW5rIiwicGlja2FibGVQcm9wZXJ0eSIsImVuYWJsZWRQcm9wZXJ0eSIsImxpbmsiLCJlbmFibGVkIiwic2hvd0N1cnNvciIsIm91dGxpbmVPcHRpb25zIiwiY29udGFpbmVyTm9kZSIsImV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMiLCJwZG9tQ29udGVudE5vZGUiLCJhcmlhUm9sZSIsInBkb21PcmRlciIsImFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zIiwib3RoZXJOb2RlIiwib3RoZXJFbGVtZW50TmFtZSIsIlBSSU1BUllfU0lCTElORyIsInRoaXNFbGVtZW50TmFtZSIsInBkb21IZWFkaW5nIiwicGRvbUhlbHBUZXh0Tm9kZSIsInBkb21Db250YWluZXJOb2RlIiwiY2hpbGRyZW4iLCJmb3J3YXJkQWNjZXNzaWJsZU5hbWUiLCJoZWxwVGV4dEJlaGF2aW9yIiwibm9kZSIsImhlbHBUZXh0IiwiZm9yd2FyZGluZ0NhbGxiYWNrcyIsInB1c2giLCJpbm5lckNvbnRlbnQiLCJhY2Nlc3NpYmxlTmFtZSIsImZpbmRTdHJpbmdQcm9wZXJ0eSIsIkFjY29yZGlvbkJveENvbnN0cmFpbnQiLCJ1cGRhdGVMYXlvdXQiLCJleHBhbmRlZFByb3BlcnR5T2JzZXJ2ZXIiLCJleHBhbmRlZCIsInNldEZvY3VzSGlnaGxpZ2h0Iiwic2V0UERPTUF0dHJpYnV0ZSIsInZvaWNpbmdTcGVha0Z1bGxSZXNwb25zZSIsImhpbnRSZXNwb25zZSIsInVubGluayIsIm11dGF0ZSIsIl8iLCJvbWl0IiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJiaW5kZXIiLCJyZWdpc3RlckRhdGFVUkwiLCJ2YWx1ZVR5cGUiLCJzdXBlcnR5cGUiLCJOb2RlSU8iLCJldmVudHMiLCJsYXlvdXQiLCJhY2NvcmRpb25Cb3giLCJpc0NoaWxkSW5jbHVkZWRJbkxheW91dCIsInVzZUV4cGFuZGVkQm91bmRzIiwiY29udGVudFByb3h5IiwiY3JlYXRlTGF5b3V0UHJveHkiLCJ0aXRsZVByb3h5IiwibWluaW11bUNvbnRlbnRXaWR0aCIsIm1pbmltdW1XaWR0aCIsIm1pbmltdW1Db250ZW50SGVpZ2h0IiwibWluaW11bUhlaWdodCIsIm1pbnVtdW1UaXRsZVdpZHRoIiwiY29sbGFwc2VkQm94SGVpZ2h0IiwiTWF0aCIsIm1heCIsImhlaWdodCIsIm1pbmltdW1FeHBhbmRlZEJveEhlaWdodCIsIm1pbmltdW1Cb3hXaWR0aCIsIndpZHRoIiwicHJlZmVycmVkV2lkdGgiLCJsb2NhbFByZWZlcnJlZFdpZHRoIiwicHJlZmVycmVkSGVpZ2h0IiwibG9jYWxQcmVmZXJyZWRIZWlnaHQiLCJib3hXaWR0aCIsImJveEhlaWdodCIsInJlY3RXaWR0aCIsInJlY3RIZWlnaHQiLCJjb2xsYXBzZWRCb3VuZHMiLCJzZWxmQm91bmRzIiwiZXhwYW5kZWRCb3VuZHMiLCJzaGFwZSIsInJvdW5kZWRSZWN0YW5nbGVXaXRoUmFkaWkiLCJ0b3BMZWZ0IiwidG9wUmlnaHQiLCJjb250ZW50U3BhbkxlZnQiLCJsZWZ0IiwiY29udGVudFNwYW5SaWdodCIsInJpZ2h0IiwiYXZhaWxhYmxlQ29udGVudFdpZHRoIiwiYXZhaWxhYmxlQ29udGVudEhlaWdodCIsInRvcCIsImJvdHRvbSIsImNlbnRlclkiLCJjZW50ZXJYIiwidGl0bGVMZWZ0U3BhbiIsInRpdGxlUmlnaHRTcGFuIiwibG9jYWxNaW5pbXVtV2lkdGgiLCJsb2NhbE1pbmltdW1IZWlnaHQiLCJsb2NhbFByZWZlcnJlZFdpZHRoUHJvcGVydHkiLCJfdXBkYXRlTGF5b3V0TGlzdGVuZXIiLCJsb2NhbFByZWZlcnJlZEhlaWdodFByb3BlcnR5IiwiYWRkTm9kZSIsInJlZ2lzdGVyIl0sIm1hcHBp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