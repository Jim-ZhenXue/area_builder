// Copyright 2021-2024, University of Colorado Boulder
/**
 * CarouselComboBox behaves like a combo box, but its listbox is a carousel. This allows you to scroll through a
 * long list of items, a feature that ComboBoxListBox does not support. ComboBoxItem, ComboBoxButton, and
 * Carousel are reused.
 *
 * THINK TWICE BEFORE USING THIS IN A SIM!
 * CarouselComboBox was created as a quick way to address situations where ComboBox's listbox gets too long,
 * for example https://github.com/phetsims/sun/issues/673. This tends to happen in internal 'demo' applications
 * (sun, scenery-phet,... ) that have long lists of demos. And as a design best-practice, PhET tends to avoid
 * longs lists of things in sims. So if you find yourself reaching for CarouselComboBox, consider whether a
 * different UI component might provide a better UX.
 *
 * Possible future work:
 * - Modify ComboBox so that it can use different types of popups (ComboBoxListBox, Carousel,...), or
 * - Make CarouselComboBox pop up the Carousel in front of everything else
 * - a11y support in CarouselComboBox
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Multilink from '../../axon/js/Multilink.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import dotRandom from '../../dot/js/dotRandom.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { AlignBox, AlignGroup, Color, HBox, Node, PressListener, Rectangle, VBox, WidthSizable } from '../../scenery/js/imports.js';
import sharedSoundPlayers from '../../tambo/js/sharedSoundPlayers.js';
import Tandem from '../../tandem/js/Tandem.js';
import Carousel from './Carousel.js';
import ComboBoxButton from './ComboBoxButton.js';
import { getGroupItemNodes } from './GroupItemOptions.js';
import PageControl from './PageControl.js';
import sun from './sun.js';
let CarouselComboBox = class CarouselComboBox extends WidthSizable(Node) {
    dispose() {
        this.disposeCarouselComboBox();
        super.dispose();
    }
    /**
   * @param property - the Property that is set when an item is selected
   * @param comboBoxItems - the items that appear in the carousel
   * @param providedOptions
   */ constructor(property, comboBoxItems, providedOptions){
        const options = optionize()({
            itemNodeOptions: {
                align: 'left',
                overColor: Color.grayColor(245),
                selectedColor: 'yellow',
                xMargin: 6,
                yMargin: 2 // {number} y margin for backgrounds on the items in the carousel
            },
            carouselOptions: {
                buttonOptions: {
                    arrowSize: new Dimension2(20, 4)
                },
                // Like ComboBox, 'vertical' is the only orientation supported (verified below).
                orientation: 'vertical',
                // Spacing and margins will be built into the backgrounds that are add to the item Nodes,
                // so set them to zero for the carousel.
                spacing: 0,
                margin: 0,
                // {number} If there are fewer items than this in the carousel, the actual number of items will be used.
                itemsPerPage: 15
            },
            pageControlOptions: {
                interactive: true
            },
            buttonOptions: {
                arrowDirection: 'down',
                baseColor: 'rgb( 218, 236, 255 )',
                xMargin: 6,
                yMargin: 4
            },
            // sound generation
            openedSoundPlayer: sharedSoundPlayers.get('generalOpen'),
            closedSoundPlayer: sharedSoundPlayers.get('generalClose'),
            // phet-io
            tandem: Tandem.OPTIONAL
        }, providedOptions);
        // Validate options
        assert && assert(options.carouselOptions.orientation === 'vertical', 'orientation must be vertical');
        assert && assert(options.buttonOptions.arrowDirection === 'down', 'arrowDirection must be down');
        // Don't create pages that are longer than the number of items
        options.carouselOptions.itemsPerPage = Math.min(options.carouselOptions.itemsPerPage, comboBoxItems.length);
        // Create tandems for subcomponents, if they were not provided
        options.carouselOptions.tandem = options.carouselOptions.tandem || options.tandem.createTandem('carousel');
        options.buttonOptions.tandem = options.buttonOptions.tandem || options.tandem.createTandem('button');
        super();
        // Make items in the carousel have the same width and height.
        const alignGroup = new AlignGroup();
        const contentNodes = getGroupItemNodes(comboBoxItems, options.tandem.createTandem('items'));
        // Create items for the carousel, whose API for 'items' is different than ComboBox.
        const carouselItemNodes = _.map(comboBoxItems, (comboBoxItem, i)=>{
            return {
                createNode: ()=>new CarouselItemNode(property, comboBoxItem, contentNodes[i], alignGroup, options.itemNodeOptions)
            };
        });
        assert && assert(carouselItemNodes.length === comboBoxItems.length, 'expected a carouselItem for each comboBoxItem');
        const hBoxChildren = [];
        // Create the carousel.
        const carousel = new Carousel(carouselItemNodes, options.carouselOptions);
        hBoxChildren.push(carousel);
        // page control
        let pageControl = null;
        if (carousel.numberOfPagesProperty.value > 1) {
            pageControl = new PageControl(carousel.pageNumberProperty, carousel.numberOfPagesProperty, combineOptions({
                orientation: options.carouselOptions.orientation
            }, options.pageControlOptions));
            hBoxChildren.push(pageControl);
        }
        // pageControl to the left of carousel
        const carouselAndPageControl = new HBox({
            spacing: 4,
            children: hBoxChildren
        });
        // Pressing this button pops the carousel up and down
        const button = new ComboBoxButton(property, comboBoxItems, contentNodes, combineOptions({
            listener: ()=>{
                carouselAndPageControl.visible = !carouselAndPageControl.visible;
            },
            widthSizable: options.widthSizable,
            localPreferredWidthProperty: this.localPreferredWidthProperty,
            localMinimumWidthProperty: this.localMinimumWidthProperty
        }, options.buttonOptions));
        // Put the button above the carousel, left aligned.
        const vBox = new VBox({
            spacing: 0,
            align: 'left',
            children: [
                button,
                carouselAndPageControl
            ]
        });
        // Wrap everything with Node, to hide VBox's API.
        options.children = [
            vBox
        ];
        this.mutate(options);
        // If the Property changes, hide the carousel. unlink is needed on disposed.
        const propertyListener = ()=>{
            carouselAndPageControl.visible = false;
        };
        property.link(propertyListener);
        // Add sound generation for when the carousel is shown and hidden.
        // NOTE: This is much simpler than the sound gen in ComboBox, which plays different sounds based on the selection.
        carouselAndPageControl.visibleProperty.lazyLink((visible)=>{
            visible ? options.openedSoundPlayer.play() : options.closedSoundPlayer.play();
        });
        // Clicking outside this UI component will hide the carousel and page control.
        // NOTE: adapted from ComboBox.
        const clickToDismissListener = {
            down: (event)=>{
                assert && assert(carousel.visible, 'this listener should be registered only when carousel is visible');
                // If fuzzing is enabled, exercise this listener some percentage of the time, so that this listener is tested.
                // The rest of the time, ignore this listener, so that the carousel remains popped up, and we test making
                // choices from the carousel. See https://github.com/phetsims/sun/issues/677
                if (!phet.chipper.isFuzzEnabled() || dotRandom.nextDouble() < 0.25) {
                    const trail = event.trail;
                    if (!trail.containsNode(button) && !trail.containsNode(carousel) && (!pageControl || !trail.containsNode(pageControl))) {
                        carouselAndPageControl.visible = false;
                    }
                }
            }
        };
        // Add clickToDismissListener only when the carousel & page control are visible. unlink is not needed.
        // NOTE: adapted from ComboBox.
        let display = null;
        carouselAndPageControl.visibleProperty.link((visible)=>{
            if (visible) {
                assert && assert(!display, 'unexpected display');
                display = this.getUniqueTrail().rootNode().getRootedDisplays()[0];
                display.addInputListener(clickToDismissListener);
            } else {
                if (display && display.hasInputListener(clickToDismissListener)) {
                    display.removeInputListener(clickToDismissListener);
                    display = null;
                }
            }
        });
        this.disposeCarouselComboBox = ()=>{
            // Deregister observers
            property.unlink(propertyListener);
            // Dispose of subcomponents
            button.dispose();
            pageControl && pageControl.dispose();
            carousel.dispose();
            contentNodes.forEach((node)=>node.dispose());
        };
    }
};
export { CarouselComboBox as default };
/**
 * CarouselItemNode is an item this UI component's carousel. Carousel and ComboBox have different APIs for 'items'.
 * This class adapts a ComboBoxItem by making the Node have uniform dimensions, and putting a background behind the
 * Node. The background changes color when the item is selected or the pointer is over the item.
 */ let CarouselItemNode = class CarouselItemNode extends Node {
    dispose() {
        this.disposeCarouselItemNode();
        super.dispose();
    }
    constructor(property, comboBoxItem, node, alignGroup, providedOptions){
        const options = optionize()({
            // CarouselItemNodeSelfOptions
            align: 'left',
            xMargin: 6,
            yMargin: 2,
            overColor: Color.grayColor(245),
            selectedColor: 'yellow',
            // NodeOptions
            tandem: Tandem.OPTIONAL
        }, providedOptions);
        const uniformNode = new AlignBox(node, {
            xAlign: options.align,
            group: alignGroup
        });
        const backgroundNode = new Rectangle(0, 0, 1, 1);
        // Size backgroundNode to fit uniformNode. Note that uniformNode's bounds may change when additional Nodes are
        // added to alignGroup.
        uniformNode.boundsProperty.link((bounds)=>{
            backgroundNode.setRectBounds(bounds.dilatedXY(options.xMargin, options.yMargin));
        });
        options.children = [
            backgroundNode,
            uniformNode
        ];
        super(options);
        // Press on an item to select its associated value.
        const pressListener = new PressListener({
            press: ()=>{
                property.value = comboBoxItem.value;
            },
            tandem: options.tandem.createTandem('pressListener')
        });
        this.addInputListener(pressListener);
        // Selecting an item sets its background to the selected color.
        // Pointer over an item sets its background to the highlighted color.
        // Must be disposed because we do not own property.
        const multilink = new Multilink([
            property,
            pressListener.isOverProperty
        ], (propertyValue, isOver)=>{
            if (propertyValue === comboBoxItem.value) {
                backgroundNode.fill = options.selectedColor;
            } else if (isOver) {
                backgroundNode.fill = options.overColor;
            } else {
                backgroundNode.fill = 'transparent';
            }
        });
        this.disposeCarouselItemNode = ()=>{
            multilink.dispose();
        };
    }
};
sun.register('CarouselComboBox', CarouselComboBox);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9DYXJvdXNlbENvbWJvQm94LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENhcm91c2VsQ29tYm9Cb3ggYmVoYXZlcyBsaWtlIGEgY29tYm8gYm94LCBidXQgaXRzIGxpc3Rib3ggaXMgYSBjYXJvdXNlbC4gVGhpcyBhbGxvd3MgeW91IHRvIHNjcm9sbCB0aHJvdWdoIGFcbiAqIGxvbmcgbGlzdCBvZiBpdGVtcywgYSBmZWF0dXJlIHRoYXQgQ29tYm9Cb3hMaXN0Qm94IGRvZXMgbm90IHN1cHBvcnQuIENvbWJvQm94SXRlbSwgQ29tYm9Cb3hCdXR0b24sIGFuZFxuICogQ2Fyb3VzZWwgYXJlIHJldXNlZC5cbiAqXG4gKiBUSElOSyBUV0lDRSBCRUZPUkUgVVNJTkcgVEhJUyBJTiBBIFNJTSFcbiAqIENhcm91c2VsQ29tYm9Cb3ggd2FzIGNyZWF0ZWQgYXMgYSBxdWljayB3YXkgdG8gYWRkcmVzcyBzaXR1YXRpb25zIHdoZXJlIENvbWJvQm94J3MgbGlzdGJveCBnZXRzIHRvbyBsb25nLFxuICogZm9yIGV4YW1wbGUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvNjczLiBUaGlzIHRlbmRzIHRvIGhhcHBlbiBpbiBpbnRlcm5hbCAnZGVtbycgYXBwbGljYXRpb25zXG4gKiAoc3VuLCBzY2VuZXJ5LXBoZXQsLi4uICkgdGhhdCBoYXZlIGxvbmcgbGlzdHMgb2YgZGVtb3MuIEFuZCBhcyBhIGRlc2lnbiBiZXN0LXByYWN0aWNlLCBQaEVUIHRlbmRzIHRvIGF2b2lkXG4gKiBsb25ncyBsaXN0cyBvZiB0aGluZ3MgaW4gc2ltcy4gU28gaWYgeW91IGZpbmQgeW91cnNlbGYgcmVhY2hpbmcgZm9yIENhcm91c2VsQ29tYm9Cb3gsIGNvbnNpZGVyIHdoZXRoZXIgYVxuICogZGlmZmVyZW50IFVJIGNvbXBvbmVudCBtaWdodCBwcm92aWRlIGEgYmV0dGVyIFVYLlxuICpcbiAqIFBvc3NpYmxlIGZ1dHVyZSB3b3JrOlxuICogLSBNb2RpZnkgQ29tYm9Cb3ggc28gdGhhdCBpdCBjYW4gdXNlIGRpZmZlcmVudCB0eXBlcyBvZiBwb3B1cHMgKENvbWJvQm94TGlzdEJveCwgQ2Fyb3VzZWwsLi4uKSwgb3JcbiAqIC0gTWFrZSBDYXJvdXNlbENvbWJvQm94IHBvcCB1cCB0aGUgQ2Fyb3VzZWwgaW4gZnJvbnQgb2YgZXZlcnl0aGluZyBlbHNlXG4gKiAtIGExMXkgc3VwcG9ydCBpbiBDYXJvdXNlbENvbWJvQm94XG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCB7IEFsaWduQm94LCBBbGlnbkdyb3VwLCBDb2xvciwgRGlzcGxheSwgSEJveCwgTm9kZSwgTm9kZU9wdGlvbnMsIFByZXNzTGlzdGVuZXIsIFJlY3RhbmdsZSwgU2NlbmVyeUV2ZW50LCBUQ29sb3IsIFZCb3gsIFdpZHRoU2l6YWJsZSwgV2lkdGhTaXphYmxlT3B0aW9ucyB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgc2hhcmVkU291bmRQbGF5ZXJzIGZyb20gJy4uLy4uL3RhbWJvL2pzL3NoYXJlZFNvdW5kUGxheWVycy5qcyc7XG5pbXBvcnQgVFNvdW5kUGxheWVyIGZyb20gJy4uLy4uL3RhbWJvL2pzL1RTb3VuZFBsYXllci5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IENhcm91c2VsLCB7IENhcm91c2VsT3B0aW9ucyB9IGZyb20gJy4vQ2Fyb3VzZWwuanMnO1xuaW1wb3J0IHsgQ29tYm9Cb3hJdGVtIH0gZnJvbSAnLi9Db21ib0JveC5qcyc7XG5pbXBvcnQgQ29tYm9Cb3hCdXR0b24sIHsgQ29tYm9Cb3hCdXR0b25PcHRpb25zIH0gZnJvbSAnLi9Db21ib0JveEJ1dHRvbi5qcyc7XG5pbXBvcnQgeyBnZXRHcm91cEl0ZW1Ob2RlcyB9IGZyb20gJy4vR3JvdXBJdGVtT3B0aW9ucy5qcyc7XG5pbXBvcnQgUGFnZUNvbnRyb2wsIHsgUGFnZUNvbnRyb2xPcHRpb25zIH0gZnJvbSAnLi9QYWdlQ29udHJvbC5qcyc7XG5pbXBvcnQgc3VuIGZyb20gJy4vc3VuLmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyBOZXN0ZWQgb3B0aW9ucyBwYXNzZWQgdG8gc3ViY29tcG9uZW50c1xuICBpdGVtTm9kZU9wdGlvbnM/OiBDYXJvdXNlbEl0ZW1Ob2RlT3B0aW9ucztcbiAgY2Fyb3VzZWxPcHRpb25zPzogQ2Fyb3VzZWxPcHRpb25zO1xuICBwYWdlQ29udHJvbE9wdGlvbnM/OiBTdHJpY3RPbWl0PFBhZ2VDb250cm9sT3B0aW9ucywgJ29yaWVudGF0aW9uJz47XG4gIGJ1dHRvbk9wdGlvbnM/OiBTdHJpY3RPbWl0PENvbWJvQm94QnV0dG9uT3B0aW9ucywgJ2NvbnRlbnQnIHwgJ2xpc3RlbmVyJz47XG5cbiAgLy8gU291bmQgZ2VuZXJhdG9ycyBmb3Igd2hlbiB0aGUgY29tYm8gYm94IGlzIG9wZW5lZCBhbmQgY2xvc2VkLlxuICBvcGVuZWRTb3VuZFBsYXllcj86IFRTb3VuZFBsYXllcjtcbiAgY2xvc2VkU291bmRQbGF5ZXI/OiBUU291bmRQbGF5ZXI7XG59O1xuXG50eXBlIFBhcmVudE9wdGlvbnMgPSBOb2RlT3B0aW9ucyAmIFdpZHRoU2l6YWJsZU9wdGlvbnM7XG5leHBvcnQgdHlwZSBDYXJvdXNlbENvbWJvQm94T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxQYXJlbnRPcHRpb25zLCAnY2hpbGRyZW4nPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2Fyb3VzZWxDb21ib0JveDxUPiBleHRlbmRzIFdpZHRoU2l6YWJsZSggTm9kZSApIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VDYXJvdXNlbENvbWJvQm94OiAoKSA9PiB2b2lkO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gcHJvcGVydHkgLSB0aGUgUHJvcGVydHkgdGhhdCBpcyBzZXQgd2hlbiBhbiBpdGVtIGlzIHNlbGVjdGVkXG4gICAqIEBwYXJhbSBjb21ib0JveEl0ZW1zIC0gdGhlIGl0ZW1zIHRoYXQgYXBwZWFyIGluIHRoZSBjYXJvdXNlbFxuICAgKiBAcGFyYW0gcHJvdmlkZWRPcHRpb25zXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3BlcnR5OiBUUHJvcGVydHk8VD4sIGNvbWJvQm94SXRlbXM6IENvbWJvQm94SXRlbTxUPltdLCBwcm92aWRlZE9wdGlvbnM/OiBDYXJvdXNlbENvbWJvQm94T3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Q2Fyb3VzZWxDb21ib0JveE9wdGlvbnMsIFNlbGZPcHRpb25zLCBQYXJlbnRPcHRpb25zPigpKCB7XG5cbiAgICAgIGl0ZW1Ob2RlT3B0aW9uczoge1xuICAgICAgICBhbGlnbjogJ2xlZnQnLCAvLyB7c3RyaW5nfSBhbGlnbm1lbnQgb2YgaXRlbSBub2RlcyBvbiBiYWNrZ3JvdW5kcywgJ2xlZnQnfCdjZW50ZXInfCdyaWdodCdcbiAgICAgICAgb3ZlckNvbG9yOiBDb2xvci5ncmF5Q29sb3IoIDI0NSApLCAvLyB7Q29sb3JEZWZ9IGJhY2tncm91bmQgY29sb3Igb2YgdGhlIGl0ZW0gdGhhdCB0aGUgcG9pbnRlciBpcyBvdmVyXG4gICAgICAgIHNlbGVjdGVkQ29sb3I6ICd5ZWxsb3cnLCAvLyB7Q29sb3JEZWZ9IGJhY2tncm91bmQgY29sb3Igb2YgdGhlIHNlbGVjdGVkIGl0ZW1cbiAgICAgICAgeE1hcmdpbjogNiwgLy8ge251bWJlcn0geCBtYXJnaW4gZm9yIGJhY2tncm91bmRzIG9uIHRoZSBpdGVtcyBpbiB0aGUgY2Fyb3VzZWxcbiAgICAgICAgeU1hcmdpbjogMiAvLyB7bnVtYmVyfSB5IG1hcmdpbiBmb3IgYmFja2dyb3VuZHMgb24gdGhlIGl0ZW1zIGluIHRoZSBjYXJvdXNlbFxuICAgICAgfSxcblxuICAgICAgY2Fyb3VzZWxPcHRpb25zOiB7XG4gICAgICAgIGJ1dHRvbk9wdGlvbnM6IHtcbiAgICAgICAgICBhcnJvd1NpemU6IG5ldyBEaW1lbnNpb24yKCAyMCwgNCApXG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gTGlrZSBDb21ib0JveCwgJ3ZlcnRpY2FsJyBpcyB0aGUgb25seSBvcmllbnRhdGlvbiBzdXBwb3J0ZWQgKHZlcmlmaWVkIGJlbG93KS5cbiAgICAgICAgb3JpZW50YXRpb246ICd2ZXJ0aWNhbCcsXG5cbiAgICAgICAgLy8gU3BhY2luZyBhbmQgbWFyZ2lucyB3aWxsIGJlIGJ1aWx0IGludG8gdGhlIGJhY2tncm91bmRzIHRoYXQgYXJlIGFkZCB0byB0aGUgaXRlbSBOb2RlcyxcbiAgICAgICAgLy8gc28gc2V0IHRoZW0gdG8gemVybyBmb3IgdGhlIGNhcm91c2VsLlxuICAgICAgICBzcGFjaW5nOiAwLFxuICAgICAgICBtYXJnaW46IDAsXG5cbiAgICAgICAgLy8ge251bWJlcn0gSWYgdGhlcmUgYXJlIGZld2VyIGl0ZW1zIHRoYW4gdGhpcyBpbiB0aGUgY2Fyb3VzZWwsIHRoZSBhY3R1YWwgbnVtYmVyIG9mIGl0ZW1zIHdpbGwgYmUgdXNlZC5cbiAgICAgICAgaXRlbXNQZXJQYWdlOiAxNVxuICAgICAgfSxcblxuICAgICAgcGFnZUNvbnRyb2xPcHRpb25zOiB7XG4gICAgICAgIGludGVyYWN0aXZlOiB0cnVlXG4gICAgICB9LFxuXG4gICAgICBidXR0b25PcHRpb25zOiB7XG4gICAgICAgIGFycm93RGlyZWN0aW9uOiAnZG93bicsIC8vICd1cCcgaXMgbm90IGN1cnJlbnRseSBzdXBwb3J0ZWQgKHZlcmlmaWVkIGJlbG93KVxuICAgICAgICBiYXNlQ29sb3I6ICdyZ2IoIDIxOCwgMjM2LCAyNTUgKScsXG4gICAgICAgIHhNYXJnaW46IDYsIC8vIFlvdSdsbCB0eXBpY2FsbHkgd2FudCB0aGlzIHRvIGJlIHRoZSBzYW1lIGFzIGl0ZW1Ob2RlT3B0aW9ucy54TWFyZ2luLCBidXQgd2UncmUgbm90IGdvaW5nIHRvIGZvcmNlIHlvdSA6KVxuICAgICAgICB5TWFyZ2luOiA0XG4gICAgICB9LFxuXG4gICAgICAvLyBzb3VuZCBnZW5lcmF0aW9uXG4gICAgICBvcGVuZWRTb3VuZFBsYXllcjogc2hhcmVkU291bmRQbGF5ZXJzLmdldCggJ2dlbmVyYWxPcGVuJyApLFxuICAgICAgY2xvc2VkU291bmRQbGF5ZXI6IHNoYXJlZFNvdW5kUGxheWVycy5nZXQoICdnZW5lcmFsQ2xvc2UnICksXG5cbiAgICAgIC8vIHBoZXQtaW9cbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVElPTkFMXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAvLyBWYWxpZGF0ZSBvcHRpb25zXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5jYXJvdXNlbE9wdGlvbnMub3JpZW50YXRpb24gPT09ICd2ZXJ0aWNhbCcsICdvcmllbnRhdGlvbiBtdXN0IGJlIHZlcnRpY2FsJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuYnV0dG9uT3B0aW9ucy5hcnJvd0RpcmVjdGlvbiA9PT0gJ2Rvd24nLCAnYXJyb3dEaXJlY3Rpb24gbXVzdCBiZSBkb3duJyApO1xuXG4gICAgLy8gRG9uJ3QgY3JlYXRlIHBhZ2VzIHRoYXQgYXJlIGxvbmdlciB0aGFuIHRoZSBudW1iZXIgb2YgaXRlbXNcbiAgICBvcHRpb25zLmNhcm91c2VsT3B0aW9ucy5pdGVtc1BlclBhZ2UgPSBNYXRoLm1pbiggb3B0aW9ucy5jYXJvdXNlbE9wdGlvbnMuaXRlbXNQZXJQYWdlISwgY29tYm9Cb3hJdGVtcy5sZW5ndGggKTtcblxuICAgIC8vIENyZWF0ZSB0YW5kZW1zIGZvciBzdWJjb21wb25lbnRzLCBpZiB0aGV5IHdlcmUgbm90IHByb3ZpZGVkXG4gICAgb3B0aW9ucy5jYXJvdXNlbE9wdGlvbnMudGFuZGVtID0gb3B0aW9ucy5jYXJvdXNlbE9wdGlvbnMudGFuZGVtIHx8IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2Nhcm91c2VsJyApO1xuICAgIG9wdGlvbnMuYnV0dG9uT3B0aW9ucy50YW5kZW0gPSBvcHRpb25zLmJ1dHRvbk9wdGlvbnMudGFuZGVtIHx8IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2J1dHRvbicgKTtcblxuICAgIHN1cGVyKCk7XG5cbiAgICAvLyBNYWtlIGl0ZW1zIGluIHRoZSBjYXJvdXNlbCBoYXZlIHRoZSBzYW1lIHdpZHRoIGFuZCBoZWlnaHQuXG4gICAgY29uc3QgYWxpZ25Hcm91cCA9IG5ldyBBbGlnbkdyb3VwKCk7XG5cbiAgICBjb25zdCBjb250ZW50Tm9kZXMgPSBnZXRHcm91cEl0ZW1Ob2RlcyggY29tYm9Cb3hJdGVtcywgb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnaXRlbXMnICkgKTtcblxuICAgIC8vIENyZWF0ZSBpdGVtcyBmb3IgdGhlIGNhcm91c2VsLCB3aG9zZSBBUEkgZm9yICdpdGVtcycgaXMgZGlmZmVyZW50IHRoYW4gQ29tYm9Cb3guXG4gICAgY29uc3QgY2Fyb3VzZWxJdGVtTm9kZXMgPSBfLm1hcCggY29tYm9Cb3hJdGVtcyxcbiAgICAgICggY29tYm9Cb3hJdGVtLCBpICkgPT4ge1xuICAgICAgICByZXR1cm4geyBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgQ2Fyb3VzZWxJdGVtTm9kZSggcHJvcGVydHksIGNvbWJvQm94SXRlbSwgY29udGVudE5vZGVzWyBpIF0sIGFsaWduR3JvdXAsIG9wdGlvbnMuaXRlbU5vZGVPcHRpb25zICkgfTtcbiAgICAgIH1cbiAgICApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNhcm91c2VsSXRlbU5vZGVzLmxlbmd0aCA9PT0gY29tYm9Cb3hJdGVtcy5sZW5ndGgsICdleHBlY3RlZCBhIGNhcm91c2VsSXRlbSBmb3IgZWFjaCBjb21ib0JveEl0ZW0nICk7XG5cbiAgICBjb25zdCBoQm94Q2hpbGRyZW4gPSBbXTtcblxuICAgIC8vIENyZWF0ZSB0aGUgY2Fyb3VzZWwuXG4gICAgY29uc3QgY2Fyb3VzZWwgPSBuZXcgQ2Fyb3VzZWwoIGNhcm91c2VsSXRlbU5vZGVzLCBvcHRpb25zLmNhcm91c2VsT3B0aW9ucyApO1xuICAgIGhCb3hDaGlsZHJlbi5wdXNoKCBjYXJvdXNlbCApO1xuXG4gICAgLy8gcGFnZSBjb250cm9sXG4gICAgbGV0IHBhZ2VDb250cm9sOiBQYWdlQ29udHJvbCB8IG51bGwgPSBudWxsO1xuICAgIGlmICggY2Fyb3VzZWwubnVtYmVyT2ZQYWdlc1Byb3BlcnR5LnZhbHVlID4gMSApIHtcbiAgICAgIHBhZ2VDb250cm9sID0gbmV3IFBhZ2VDb250cm9sKCBjYXJvdXNlbC5wYWdlTnVtYmVyUHJvcGVydHksIGNhcm91c2VsLm51bWJlck9mUGFnZXNQcm9wZXJ0eSwgY29tYmluZU9wdGlvbnM8UGFnZUNvbnRyb2xPcHRpb25zPigge1xuICAgICAgICBvcmllbnRhdGlvbjogb3B0aW9ucy5jYXJvdXNlbE9wdGlvbnMub3JpZW50YXRpb25cbiAgICAgIH0sIG9wdGlvbnMucGFnZUNvbnRyb2xPcHRpb25zICkgKTtcbiAgICAgIGhCb3hDaGlsZHJlbi5wdXNoKCBwYWdlQ29udHJvbCApO1xuICAgIH1cblxuICAgIC8vIHBhZ2VDb250cm9sIHRvIHRoZSBsZWZ0IG9mIGNhcm91c2VsXG4gICAgY29uc3QgY2Fyb3VzZWxBbmRQYWdlQ29udHJvbCA9IG5ldyBIQm94KCB7XG4gICAgICBzcGFjaW5nOiA0LFxuICAgICAgY2hpbGRyZW46IGhCb3hDaGlsZHJlblxuICAgIH0gKTtcblxuICAgIC8vIFByZXNzaW5nIHRoaXMgYnV0dG9uIHBvcHMgdGhlIGNhcm91c2VsIHVwIGFuZCBkb3duXG4gICAgY29uc3QgYnV0dG9uID0gbmV3IENvbWJvQm94QnV0dG9uKCBwcm9wZXJ0eSwgY29tYm9Cb3hJdGVtcywgY29udGVudE5vZGVzLCBjb21iaW5lT3B0aW9uczxDb21ib0JveEJ1dHRvbk9wdGlvbnM+KCB7XG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xuICAgICAgICBjYXJvdXNlbEFuZFBhZ2VDb250cm9sLnZpc2libGUgPSAhY2Fyb3VzZWxBbmRQYWdlQ29udHJvbC52aXNpYmxlO1xuICAgICAgfSxcbiAgICAgIHdpZHRoU2l6YWJsZTogb3B0aW9ucy53aWR0aFNpemFibGUsXG4gICAgICBsb2NhbFByZWZlcnJlZFdpZHRoUHJvcGVydHk6IHRoaXMubG9jYWxQcmVmZXJyZWRXaWR0aFByb3BlcnR5LFxuICAgICAgbG9jYWxNaW5pbXVtV2lkdGhQcm9wZXJ0eTogdGhpcy5sb2NhbE1pbmltdW1XaWR0aFByb3BlcnR5XG4gICAgfSwgb3B0aW9ucy5idXR0b25PcHRpb25zICkgKTtcblxuICAgIC8vIFB1dCB0aGUgYnV0dG9uIGFib3ZlIHRoZSBjYXJvdXNlbCwgbGVmdCBhbGlnbmVkLlxuICAgIGNvbnN0IHZCb3ggPSBuZXcgVkJveCgge1xuICAgICAgc3BhY2luZzogMCxcbiAgICAgIGFsaWduOiAnbGVmdCcsXG4gICAgICBjaGlsZHJlbjogWyBidXR0b24sIGNhcm91c2VsQW5kUGFnZUNvbnRyb2wgXVxuICAgIH0gKTtcblxuICAgIC8vIFdyYXAgZXZlcnl0aGluZyB3aXRoIE5vZGUsIHRvIGhpZGUgVkJveCdzIEFQSS5cbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyB2Qm94IF07XG5cbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xuXG4gICAgLy8gSWYgdGhlIFByb3BlcnR5IGNoYW5nZXMsIGhpZGUgdGhlIGNhcm91c2VsLiB1bmxpbmsgaXMgbmVlZGVkIG9uIGRpc3Bvc2VkLlxuICAgIGNvbnN0IHByb3BlcnR5TGlzdGVuZXIgPSAoKSA9PiB7IGNhcm91c2VsQW5kUGFnZUNvbnRyb2wudmlzaWJsZSA9IGZhbHNlOyB9O1xuICAgIHByb3BlcnR5LmxpbmsoIHByb3BlcnR5TGlzdGVuZXIgKTtcblxuICAgIC8vIEFkZCBzb3VuZCBnZW5lcmF0aW9uIGZvciB3aGVuIHRoZSBjYXJvdXNlbCBpcyBzaG93biBhbmQgaGlkZGVuLlxuICAgIC8vIE5PVEU6IFRoaXMgaXMgbXVjaCBzaW1wbGVyIHRoYW4gdGhlIHNvdW5kIGdlbiBpbiBDb21ib0JveCwgd2hpY2ggcGxheXMgZGlmZmVyZW50IHNvdW5kcyBiYXNlZCBvbiB0aGUgc2VsZWN0aW9uLlxuICAgIGNhcm91c2VsQW5kUGFnZUNvbnRyb2wudmlzaWJsZVByb3BlcnR5LmxhenlMaW5rKCB2aXNpYmxlID0+IHtcbiAgICAgIHZpc2libGUgPyBvcHRpb25zLm9wZW5lZFNvdW5kUGxheWVyLnBsYXkoKSA6IG9wdGlvbnMuY2xvc2VkU291bmRQbGF5ZXIucGxheSgpO1xuICAgIH0gKTtcblxuICAgIC8vIENsaWNraW5nIG91dHNpZGUgdGhpcyBVSSBjb21wb25lbnQgd2lsbCBoaWRlIHRoZSBjYXJvdXNlbCBhbmQgcGFnZSBjb250cm9sLlxuICAgIC8vIE5PVEU6IGFkYXB0ZWQgZnJvbSBDb21ib0JveC5cbiAgICBjb25zdCBjbGlja1RvRGlzbWlzc0xpc3RlbmVyID0ge1xuICAgICAgZG93bjogKCBldmVudDogU2NlbmVyeUV2ZW50ICkgPT4ge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjYXJvdXNlbC52aXNpYmxlLCAndGhpcyBsaXN0ZW5lciBzaG91bGQgYmUgcmVnaXN0ZXJlZCBvbmx5IHdoZW4gY2Fyb3VzZWwgaXMgdmlzaWJsZScgKTtcblxuICAgICAgICAvLyBJZiBmdXp6aW5nIGlzIGVuYWJsZWQsIGV4ZXJjaXNlIHRoaXMgbGlzdGVuZXIgc29tZSBwZXJjZW50YWdlIG9mIHRoZSB0aW1lLCBzbyB0aGF0IHRoaXMgbGlzdGVuZXIgaXMgdGVzdGVkLlxuICAgICAgICAvLyBUaGUgcmVzdCBvZiB0aGUgdGltZSwgaWdub3JlIHRoaXMgbGlzdGVuZXIsIHNvIHRoYXQgdGhlIGNhcm91c2VsIHJlbWFpbnMgcG9wcGVkIHVwLCBhbmQgd2UgdGVzdCBtYWtpbmdcbiAgICAgICAgLy8gY2hvaWNlcyBmcm9tIHRoZSBjYXJvdXNlbC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzY3N1xuICAgICAgICBpZiAoICFwaGV0LmNoaXBwZXIuaXNGdXp6RW5hYmxlZCgpIHx8IGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgPCAwLjI1ICkge1xuICAgICAgICAgIGNvbnN0IHRyYWlsID0gZXZlbnQudHJhaWw7XG4gICAgICAgICAgaWYgKCAhdHJhaWwuY29udGFpbnNOb2RlKCBidXR0b24gKSAmJiAhdHJhaWwuY29udGFpbnNOb2RlKCBjYXJvdXNlbCApICYmICggIXBhZ2VDb250cm9sIHx8ICF0cmFpbC5jb250YWluc05vZGUoIHBhZ2VDb250cm9sICkgKSApIHtcbiAgICAgICAgICAgIGNhcm91c2VsQW5kUGFnZUNvbnRyb2wudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBBZGQgY2xpY2tUb0Rpc21pc3NMaXN0ZW5lciBvbmx5IHdoZW4gdGhlIGNhcm91c2VsICYgcGFnZSBjb250cm9sIGFyZSB2aXNpYmxlLiB1bmxpbmsgaXMgbm90IG5lZWRlZC5cbiAgICAvLyBOT1RFOiBhZGFwdGVkIGZyb20gQ29tYm9Cb3guXG4gICAgbGV0IGRpc3BsYXk6IERpc3BsYXkgfCBudWxsID0gbnVsbDtcbiAgICBjYXJvdXNlbEFuZFBhZ2VDb250cm9sLnZpc2libGVQcm9wZXJ0eS5saW5rKCB2aXNpYmxlID0+IHtcbiAgICAgIGlmICggdmlzaWJsZSApIHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIWRpc3BsYXksICd1bmV4cGVjdGVkIGRpc3BsYXknICk7XG4gICAgICAgIGRpc3BsYXkgPSB0aGlzLmdldFVuaXF1ZVRyYWlsKCkucm9vdE5vZGUoKS5nZXRSb290ZWREaXNwbGF5cygpWyAwIF07XG4gICAgICAgIGRpc3BsYXkuYWRkSW5wdXRMaXN0ZW5lciggY2xpY2tUb0Rpc21pc3NMaXN0ZW5lciApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGlmICggZGlzcGxheSAmJiBkaXNwbGF5Lmhhc0lucHV0TGlzdGVuZXIoIGNsaWNrVG9EaXNtaXNzTGlzdGVuZXIgKSApIHtcbiAgICAgICAgICBkaXNwbGF5LnJlbW92ZUlucHV0TGlzdGVuZXIoIGNsaWNrVG9EaXNtaXNzTGlzdGVuZXIgKTtcbiAgICAgICAgICBkaXNwbGF5ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gKTtcblxuICAgIHRoaXMuZGlzcG9zZUNhcm91c2VsQ29tYm9Cb3ggPSAoKSA9PiB7XG5cbiAgICAgIC8vIERlcmVnaXN0ZXIgb2JzZXJ2ZXJzXG4gICAgICBwcm9wZXJ0eS51bmxpbmsoIHByb3BlcnR5TGlzdGVuZXIgKTtcblxuICAgICAgLy8gRGlzcG9zZSBvZiBzdWJjb21wb25lbnRzXG4gICAgICBidXR0b24uZGlzcG9zZSgpO1xuICAgICAgcGFnZUNvbnRyb2wgJiYgcGFnZUNvbnRyb2wuZGlzcG9zZSgpO1xuICAgICAgY2Fyb3VzZWwuZGlzcG9zZSgpO1xuICAgICAgY29udGVudE5vZGVzLmZvckVhY2goIG5vZGUgPT4gbm9kZS5kaXNwb3NlKCkgKTtcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlQ2Fyb3VzZWxDb21ib0JveCgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG50eXBlIENhcm91c2VsSXRlbU5vZGVTZWxmT3B0aW9ucyA9IHtcbiAgYWxpZ24/OiAnbGVmdCcgfCAncmlnaHQnIHwgJ2NlbnRlcic7IC8vIGFsaWdubWVudCBvZiBub2RlIG9uIGJhY2tncm91bmRcbiAgeE1hcmdpbj86IG51bWJlcjsgLy8geCBtYXJnaW4gZm9yIGJhY2tncm91bmRzIG9uIHRoZSBpdGVtcyBpbiB0aGUgY2Fyb3VzZWxcbiAgeU1hcmdpbj86IG51bWJlcjsgLy8geSBtYXJnaW4gZm9yIGJhY2tncm91bmRzIG9uIHRoZSBpdGVtcyBpbiB0aGUgY2Fyb3VzZWxcbiAgb3ZlckNvbG9yPzogVENvbG9yOyAvLyBiYWNrZ3JvdW5kIGNvbG9yIG9mIHRoZSBpdGVtIHRoYXQgdGhlIHBvaW50ZXIgaXMgb3ZlclxuICBzZWxlY3RlZENvbG9yPzogVENvbG9yOyAvLyBiYWNrZ3JvdW5kIGNvbG9yIG9mIHRoZSBzZWxlY3RlZCBpdGVtXG59O1xuXG50eXBlIENhcm91c2VsSXRlbU5vZGVPcHRpb25zID0gQ2Fyb3VzZWxJdGVtTm9kZVNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxOb2RlT3B0aW9ucywgJ2NoaWxkcmVuJz47XG5cbi8qKlxuICogQ2Fyb3VzZWxJdGVtTm9kZSBpcyBhbiBpdGVtIHRoaXMgVUkgY29tcG9uZW50J3MgY2Fyb3VzZWwuIENhcm91c2VsIGFuZCBDb21ib0JveCBoYXZlIGRpZmZlcmVudCBBUElzIGZvciAnaXRlbXMnLlxuICogVGhpcyBjbGFzcyBhZGFwdHMgYSBDb21ib0JveEl0ZW0gYnkgbWFraW5nIHRoZSBOb2RlIGhhdmUgdW5pZm9ybSBkaW1lbnNpb25zLCBhbmQgcHV0dGluZyBhIGJhY2tncm91bmQgYmVoaW5kIHRoZVxuICogTm9kZS4gVGhlIGJhY2tncm91bmQgY2hhbmdlcyBjb2xvciB3aGVuIHRoZSBpdGVtIGlzIHNlbGVjdGVkIG9yIHRoZSBwb2ludGVyIGlzIG92ZXIgdGhlIGl0ZW0uXG4gKi9cbmNsYXNzIENhcm91c2VsSXRlbU5vZGU8VD4gZXh0ZW5kcyBOb2RlIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VDYXJvdXNlbEl0ZW1Ob2RlOiAoKSA9PiB2b2lkO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvcGVydHk6IFRQcm9wZXJ0eTxUPiwgY29tYm9Cb3hJdGVtOiBDb21ib0JveEl0ZW08VD4sIG5vZGU6IE5vZGUsIGFsaWduR3JvdXA6IEFsaWduR3JvdXAsIHByb3ZpZGVkT3B0aW9ucz86IENhcm91c2VsSXRlbU5vZGVPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxDYXJvdXNlbEl0ZW1Ob2RlT3B0aW9ucywgQ2Fyb3VzZWxJdGVtTm9kZVNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyBDYXJvdXNlbEl0ZW1Ob2RlU2VsZk9wdGlvbnNcbiAgICAgIGFsaWduOiAnbGVmdCcsXG4gICAgICB4TWFyZ2luOiA2LFxuICAgICAgeU1hcmdpbjogMixcbiAgICAgIG92ZXJDb2xvcjogQ29sb3IuZ3JheUNvbG9yKCAyNDUgKSxcbiAgICAgIHNlbGVjdGVkQ29sb3I6ICd5ZWxsb3cnLFxuXG4gICAgICAvLyBOb2RlT3B0aW9uc1xuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUSU9OQUxcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGNvbnN0IHVuaWZvcm1Ob2RlID0gbmV3IEFsaWduQm94KCBub2RlLCB7XG4gICAgICB4QWxpZ246IG9wdGlvbnMuYWxpZ24sXG4gICAgICBncm91cDogYWxpZ25Hcm91cFxuICAgIH0gKTtcblxuICAgIGNvbnN0IGJhY2tncm91bmROb2RlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMSwgMSApO1xuXG4gICAgLy8gU2l6ZSBiYWNrZ3JvdW5kTm9kZSB0byBmaXQgdW5pZm9ybU5vZGUuIE5vdGUgdGhhdCB1bmlmb3JtTm9kZSdzIGJvdW5kcyBtYXkgY2hhbmdlIHdoZW4gYWRkaXRpb25hbCBOb2RlcyBhcmVcbiAgICAvLyBhZGRlZCB0byBhbGlnbkdyb3VwLlxuICAgIHVuaWZvcm1Ob2RlLmJvdW5kc1Byb3BlcnR5LmxpbmsoIGJvdW5kcyA9PiB7XG4gICAgICBiYWNrZ3JvdW5kTm9kZS5zZXRSZWN0Qm91bmRzKCBib3VuZHMuZGlsYXRlZFhZKCBvcHRpb25zLnhNYXJnaW4sIG9wdGlvbnMueU1hcmdpbiApICk7XG4gICAgfSApO1xuXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgYmFja2dyb3VuZE5vZGUsIHVuaWZvcm1Ob2RlIF07XG5cbiAgICBzdXBlciggb3B0aW9ucyApO1xuXG4gICAgLy8gUHJlc3Mgb24gYW4gaXRlbSB0byBzZWxlY3QgaXRzIGFzc29jaWF0ZWQgdmFsdWUuXG4gICAgY29uc3QgcHJlc3NMaXN0ZW5lciA9IG5ldyBQcmVzc0xpc3RlbmVyKCB7XG4gICAgICBwcmVzczogKCkgPT4ge1xuICAgICAgICBwcm9wZXJ0eS52YWx1ZSA9IGNvbWJvQm94SXRlbS52YWx1ZTtcbiAgICAgIH0sXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ByZXNzTGlzdGVuZXInIClcbiAgICB9ICk7XG4gICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCBwcmVzc0xpc3RlbmVyICk7XG5cbiAgICAvLyBTZWxlY3RpbmcgYW4gaXRlbSBzZXRzIGl0cyBiYWNrZ3JvdW5kIHRvIHRoZSBzZWxlY3RlZCBjb2xvci5cbiAgICAvLyBQb2ludGVyIG92ZXIgYW4gaXRlbSBzZXRzIGl0cyBiYWNrZ3JvdW5kIHRvIHRoZSBoaWdobGlnaHRlZCBjb2xvci5cbiAgICAvLyBNdXN0IGJlIGRpc3Bvc2VkIGJlY2F1c2Ugd2UgZG8gbm90IG93biBwcm9wZXJ0eS5cbiAgICBjb25zdCBtdWx0aWxpbmsgPSBuZXcgTXVsdGlsaW5rKFxuICAgICAgWyBwcm9wZXJ0eSwgcHJlc3NMaXN0ZW5lci5pc092ZXJQcm9wZXJ0eSBdLFxuICAgICAgKCBwcm9wZXJ0eVZhbHVlLCBpc092ZXIgKSA9PiB7XG4gICAgICAgIGlmICggcHJvcGVydHlWYWx1ZSA9PT0gY29tYm9Cb3hJdGVtLnZhbHVlICkge1xuICAgICAgICAgIGJhY2tncm91bmROb2RlLmZpbGwgPSBvcHRpb25zLnNlbGVjdGVkQ29sb3I7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIGlzT3ZlciApIHtcbiAgICAgICAgICBiYWNrZ3JvdW5kTm9kZS5maWxsID0gb3B0aW9ucy5vdmVyQ29sb3I7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgYmFja2dyb3VuZE5vZGUuZmlsbCA9ICd0cmFuc3BhcmVudCc7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcblxuICAgIHRoaXMuZGlzcG9zZUNhcm91c2VsSXRlbU5vZGUgPSAoKSA9PiB7XG4gICAgICBtdWx0aWxpbmsuZGlzcG9zZSgpO1xuICAgIH07XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2VDYXJvdXNlbEl0ZW1Ob2RlKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnN1bi5yZWdpc3RlciggJ0Nhcm91c2VsQ29tYm9Cb3gnLCBDYXJvdXNlbENvbWJvQm94ICk7Il0sIm5hbWVzIjpbIk11bHRpbGluayIsIkRpbWVuc2lvbjIiLCJkb3RSYW5kb20iLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIkFsaWduQm94IiwiQWxpZ25Hcm91cCIsIkNvbG9yIiwiSEJveCIsIk5vZGUiLCJQcmVzc0xpc3RlbmVyIiwiUmVjdGFuZ2xlIiwiVkJveCIsIldpZHRoU2l6YWJsZSIsInNoYXJlZFNvdW5kUGxheWVycyIsIlRhbmRlbSIsIkNhcm91c2VsIiwiQ29tYm9Cb3hCdXR0b24iLCJnZXRHcm91cEl0ZW1Ob2RlcyIsIlBhZ2VDb250cm9sIiwic3VuIiwiQ2Fyb3VzZWxDb21ib0JveCIsImRpc3Bvc2UiLCJkaXNwb3NlQ2Fyb3VzZWxDb21ib0JveCIsInByb3BlcnR5IiwiY29tYm9Cb3hJdGVtcyIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJpdGVtTm9kZU9wdGlvbnMiLCJhbGlnbiIsIm92ZXJDb2xvciIsImdyYXlDb2xvciIsInNlbGVjdGVkQ29sb3IiLCJ4TWFyZ2luIiwieU1hcmdpbiIsImNhcm91c2VsT3B0aW9ucyIsImJ1dHRvbk9wdGlvbnMiLCJhcnJvd1NpemUiLCJvcmllbnRhdGlvbiIsInNwYWNpbmciLCJtYXJnaW4iLCJpdGVtc1BlclBhZ2UiLCJwYWdlQ29udHJvbE9wdGlvbnMiLCJpbnRlcmFjdGl2ZSIsImFycm93RGlyZWN0aW9uIiwiYmFzZUNvbG9yIiwib3BlbmVkU291bmRQbGF5ZXIiLCJnZXQiLCJjbG9zZWRTb3VuZFBsYXllciIsInRhbmRlbSIsIk9QVElPTkFMIiwiYXNzZXJ0IiwiTWF0aCIsIm1pbiIsImxlbmd0aCIsImNyZWF0ZVRhbmRlbSIsImFsaWduR3JvdXAiLCJjb250ZW50Tm9kZXMiLCJjYXJvdXNlbEl0ZW1Ob2RlcyIsIl8iLCJtYXAiLCJjb21ib0JveEl0ZW0iLCJpIiwiY3JlYXRlTm9kZSIsIkNhcm91c2VsSXRlbU5vZGUiLCJoQm94Q2hpbGRyZW4iLCJjYXJvdXNlbCIsInB1c2giLCJwYWdlQ29udHJvbCIsIm51bWJlck9mUGFnZXNQcm9wZXJ0eSIsInZhbHVlIiwicGFnZU51bWJlclByb3BlcnR5IiwiY2Fyb3VzZWxBbmRQYWdlQ29udHJvbCIsImNoaWxkcmVuIiwiYnV0dG9uIiwibGlzdGVuZXIiLCJ2aXNpYmxlIiwid2lkdGhTaXphYmxlIiwibG9jYWxQcmVmZXJyZWRXaWR0aFByb3BlcnR5IiwibG9jYWxNaW5pbXVtV2lkdGhQcm9wZXJ0eSIsInZCb3giLCJtdXRhdGUiLCJwcm9wZXJ0eUxpc3RlbmVyIiwibGluayIsInZpc2libGVQcm9wZXJ0eSIsImxhenlMaW5rIiwicGxheSIsImNsaWNrVG9EaXNtaXNzTGlzdGVuZXIiLCJkb3duIiwiZXZlbnQiLCJwaGV0IiwiY2hpcHBlciIsImlzRnV6ekVuYWJsZWQiLCJuZXh0RG91YmxlIiwidHJhaWwiLCJjb250YWluc05vZGUiLCJkaXNwbGF5IiwiZ2V0VW5pcXVlVHJhaWwiLCJyb290Tm9kZSIsImdldFJvb3RlZERpc3BsYXlzIiwiYWRkSW5wdXRMaXN0ZW5lciIsImhhc0lucHV0TGlzdGVuZXIiLCJyZW1vdmVJbnB1dExpc3RlbmVyIiwidW5saW5rIiwiZm9yRWFjaCIsIm5vZGUiLCJkaXNwb3NlQ2Fyb3VzZWxJdGVtTm9kZSIsInVuaWZvcm1Ob2RlIiwieEFsaWduIiwiZ3JvdXAiLCJiYWNrZ3JvdW5kTm9kZSIsImJvdW5kc1Byb3BlcnR5IiwiYm91bmRzIiwic2V0UmVjdEJvdW5kcyIsImRpbGF0ZWRYWSIsInByZXNzTGlzdGVuZXIiLCJwcmVzcyIsIm11bHRpbGluayIsImlzT3ZlclByb3BlcnR5IiwicHJvcGVydHlWYWx1ZSIsImlzT3ZlciIsImZpbGwiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FrQkMsR0FFRCxPQUFPQSxlQUFlLDZCQUE2QjtBQUVuRCxPQUFPQyxnQkFBZ0IsNkJBQTZCO0FBQ3BELE9BQU9DLGVBQWUsNEJBQTRCO0FBQ2xELE9BQU9DLGFBQWFDLGNBQWMsUUFBUSxrQ0FBa0M7QUFFNUUsU0FBU0MsUUFBUSxFQUFFQyxVQUFVLEVBQUVDLEtBQUssRUFBV0MsSUFBSSxFQUFFQyxJQUFJLEVBQWVDLGFBQWEsRUFBRUMsU0FBUyxFQUF3QkMsSUFBSSxFQUFFQyxZQUFZLFFBQTZCLDhCQUE4QjtBQUNyTSxPQUFPQyx3QkFBd0IsdUNBQXVDO0FBRXRFLE9BQU9DLFlBQVksNEJBQTRCO0FBQy9DLE9BQU9DLGNBQW1DLGdCQUFnQjtBQUUxRCxPQUFPQyxvQkFBK0Msc0JBQXNCO0FBQzVFLFNBQVNDLGlCQUFpQixRQUFRLHdCQUF3QjtBQUMxRCxPQUFPQyxpQkFBeUMsbUJBQW1CO0FBQ25FLE9BQU9DLFNBQVMsV0FBVztBQWtCWixJQUFBLEFBQU1DLG1C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