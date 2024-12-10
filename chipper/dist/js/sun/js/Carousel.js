// Copyright 2015-2024, University of Colorado Boulder
/**
 * A carousel UI component.
 *
 * A set of N items is divided into M 'pages', based on how many items are visible in the carousel.
 * Pressing the next and previous buttons moves through the pages.
 * Movement through the pages is animated, so that items appear to scroll by.
 *
 * Note that Carousel wraps each item (Node) in an alignBox to ensure all items have an equal "footprint" dimension.
 *
 * The Carousel handles dynamic layout as far as carousel items changing sizes - it will resize to fit all of the items.
 * If you want to align or stretch item content, that can be done with CarouselItem's alignBoxOptions
 * (align:stretch will cause the item to be expanded to its section in the Carousel).
 *
 * Carousel currently is not sizable on its own (you can't set a preferred width/height that causes it to expand).
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import BooleanProperty from '../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Multilink from '../../axon/js/Multilink.js';
import NumberProperty from '../../axon/js/NumberProperty.js';
import stepTimer from '../../axon/js/stepTimer.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Range from '../../dot/js/Range.js';
import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import Orientation from '../../phet-core/js/Orientation.js';
import { AlignGroup, assertNoAdditionalChildren, FlowBox, IndexedNodeIO, LayoutConstraint, Node, Rectangle, Separator } from '../../scenery/js/imports.js';
import sharedSoundPlayers from '../../tambo/js/sharedSoundPlayers.js';
import isSettingPhetioStateProperty from '../../tandem/js/isSettingPhetioStateProperty.js';
import Tandem from '../../tandem/js/Tandem.js';
import Animation from '../../twixt/js/Animation.js';
import Easing from '../../twixt/js/Easing.js';
import CarouselButton from './buttons/CarouselButton.js';
import ColorConstants from './ColorConstants.js';
import { getGroupItemNodes } from './GroupItemOptions.js';
import sun from './sun.js';
const DEFAULT_ARROW_SIZE = new Dimension2(20, 7);
let Carousel = class Carousel extends Node {
    /**
   * NOTE: This will dispose the item Nodes
   */ dispose() {
        this.disposeCarousel();
        super.dispose();
    }
    /**
   * Resets the carousel to its initial state.
   * @param animationEnabled - whether to enable animation during reset
   */ reset(animationEnabled = false) {
        const saveAnimationEnabled = this.animationEnabled;
        this.animationEnabled = animationEnabled;
        // Reset the page number to the default page number if possible (if things are hidden, it might not be possible)
        this.pageNumberProperty.value = Math.min(this.defaultPageNumber, this.numberOfPagesProperty.value - 1);
        this.animationEnabled = saveAnimationEnabled;
    }
    /**
   * Given an item's visible index, scrolls the carousel to the page that contains that item.
   */ scrollToItemVisibleIndex(itemVisibleIndex) {
        this.pageNumberProperty.set(this.itemVisibleIndexToPageNumber(itemVisibleIndex));
    }
    /**
   * Given an item, scrolls the carousel to the page that contains that item. This will only scroll if item is in the
   * Carousel and visible.
   */ scrollToItem(item) {
        this.scrollToAlignBox(this.getAlignBoxForItem(item));
    }
    /**
   * Public for ScrollingFlowBox only
   */ scrollToAlignBox(alignBox) {
        // If the layout is dynamic, then only account for the visible items
        const alignBoxIndex = this.visibleAlignBoxesProperty.value.indexOf(alignBox);
        assert && assert(alignBoxIndex >= 0, 'item not present or visible');
        if (alignBoxIndex >= 0) {
            this.scrollToItemVisibleIndex(alignBoxIndex);
        }
    }
    /**
   * Set the visibility of an item in the Carousel. This toggles visibility and will reflow the layout, such that hidden
   * items do not leave a gap in the layout.
   */ setItemVisible(item, visible) {
        this.getAlignBoxForItem(item).visible = visible;
    }
    /**
   * Gets the AlignBox that wraps an item's Node.
   */ getAlignBoxForItem(item) {
        const alignBox = this.alignBoxes[this.items.indexOf(item)];
        assert && assert(alignBox, 'item does not have corresponding alignBox');
        return alignBox;
    }
    /**
   * Returns the Node that was created for a given item.
   */ getNodeForItem(item) {
        const node = this.carouselItemNodes[this.items.indexOf(item)];
        assert && assert(node, 'item does not have corresponding node');
        return node;
    }
    itemVisibleIndexToPageNumber(itemIndex) {
        assert && assert(itemIndex >= 0 && itemIndex < this.items.length, `itemIndex out of range: ${itemIndex}`);
        return Math.floor(itemIndex / this.itemsPerPage);
    }
    // The order of alignBoxes might be tweaked in scrollingNode's children. We need to respect this order
    getVisibleAlignBoxes() {
        return _.sortBy(this.alignBoxes.filter((alignBox)=>alignBox.visible), (alignBox)=>this.scrollingNode.children.indexOf(alignBox));
    }
    /**
   * NOTE: This will dispose the item Nodes when the carousel is disposed
   */ constructor(items, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        // Don't animate during initialization
        let isInitialized = false;
        // Override defaults with specified options
        const options = optionize()({
            // container
            orientation: 'horizontal',
            fill: 'white',
            stroke: 'black',
            lineWidth: 1,
            cornerRadius: 4,
            defaultPageNumber: 0,
            // items
            itemsPerPage: 4,
            spacing: 12,
            margin: 6,
            alignBoxOptions: {
                phetioType: IndexedNodeIO,
                phetioState: true,
                visiblePropertyOptions: {
                    phetioFeatured: true
                }
            },
            // next/previous buttons
            buttonOptions: {
                xMargin: 5,
                yMargin: 5,
                // for dilating pointer areas of next/previous buttons such that they do not overlap with Carousel content
                touchAreaXDilation: 0,
                touchAreaYDilation: 0,
                mouseAreaXDilation: 0,
                mouseAreaYDilation: 0,
                baseColor: 'rgba( 200, 200, 200, 0.5 )',
                disabledColor: ColorConstants.LIGHT_GRAY,
                lineWidth: 1,
                arrowPathOptions: {
                    stroke: 'black',
                    lineWidth: 3
                },
                arrowSize: DEFAULT_ARROW_SIZE,
                enabledPropertyOptions: {
                    phetioReadOnly: true,
                    phetioFeatured: false
                },
                soundPlayer: sharedSoundPlayers.get('pushButton')
            },
            // item separators
            separatorsVisible: false,
            separatorOptions: {
                stroke: 'rgb( 180, 180, 180 )',
                lineWidth: 0.5,
                pickable: false
            },
            // animation, scrolling between pages
            animationEnabled: true,
            animationOptions: {
                duration: 0.4,
                stepEmitter: stepTimer,
                easing: Easing.CUBIC_IN_OUT
            },
            // phet-io
            tandem: Tandem.OPTIONAL,
            visiblePropertyOptions: {
                phetioFeatured: true
            }
        }, providedOptions);
        super(), this.isAnimatingProperty = new BooleanProperty(false);
        this.animationEnabled = options.animationEnabled;
        this.items = items;
        this.itemsPerPage = options.itemsPerPage;
        this.defaultPageNumber = options.defaultPageNumber;
        const orientation = Orientation.fromLayoutOrientation(options.orientation);
        const alignGroup = new AlignGroup();
        const itemsTandem = options.tandem.createTandem('items');
        this.carouselItemNodes = getGroupItemNodes(items, itemsTandem);
        // All items are wrapped in AlignBoxes to ensure consistent sizing
        this.alignBoxes = items.map((item, index)=>{
            return alignGroup.createBox(this.carouselItemNodes[index], combineOptions({
                tandem: item.tandemName ? itemsTandem.createTandem(item.tandemName) : Tandem.OPTIONAL
            }, options.alignBoxOptions, // Item-specific options take precedence
            item.alignBoxOptions));
        });
        // scrollingNode will contain all items, arranged in the proper orientation, with margins and spacing.
        // NOTE: We'll need to handle updates to the order (for phet-io IndexedNodeIO).
        // Horizontal carousel arrange items left-to-right, vertical is top-to-bottom.
        // Translation of this node will be animated to give the effect of scrolling through the items.
        this.scrollingNode = new ScrollingFlowBox(this, {
            children: this.alignBoxes,
            orientation: options.orientation,
            spacing: options.spacing,
            [`${orientation.opposite.coordinate}Margin`]: options.margin
        });
        // Visible AlignBoxes (these are the ones we lay out and base everything on)
        this.visibleAlignBoxesProperty = DerivedProperty.deriveAny(this.alignBoxes.map((alignBox)=>alignBox.visibleProperty), ()=>{
            return this.getVisibleAlignBoxes();
        });
        // When the AlignBoxes are reordered, we need to recompute the visibleAlignBoxesProperty
        this.scrollingNode.childrenReorderedEmitter.addListener(()=>this.visibleAlignBoxesProperty.recomputeDerivation());
        // Options common to both buttons
        const buttonOptions = combineOptions({
            cornerRadius: options.cornerRadius
        }, options.buttonOptions);
        assert && assert(options.spacing >= options.margin, 'The spacing must be >= the margin, or you will see ' + 'page 2 items at the end of page 1');
        // In order to make it easy for phet-io to re-order items, the separators should not participate
        // in the layout and have indices that get moved around.  Therefore, we add a separate layer to
        // show the separators.
        const separatorLayer = options.separatorsVisible ? new Node({
            pickable: false
        }) : null;
        // Contains the scrolling node and the associated separators, if any
        const scrollingNodeContainer = new Node({
            children: options.separatorsVisible ? [
                separatorLayer,
                this.scrollingNode
            ] : [
                this.scrollingNode
            ]
        });
        // Have to have at least one page, even if it is blank
        const countPages = (items)=>Math.max(Math.ceil(items.length / options.itemsPerPage), 1);
        // Number of pages is derived from the total number of items and the number of items per page
        this.numberOfPagesProperty = new DerivedProperty([
            this.visibleAlignBoxesProperty
        ], (visibleAlignBoxes)=>{
            return countPages(visibleAlignBoxes);
        }, {
            isValidValue: (v)=>v > 0
        });
        const maxPages = countPages(this.alignBoxes);
        assert && assert(options.defaultPageNumber >= 0 && options.defaultPageNumber <= this.numberOfPagesProperty.value - 1, `defaultPageNumber is out of range: ${options.defaultPageNumber}`);
        // Number of the page that is visible in the carousel.
        this.pageNumberProperty = new NumberProperty(options.defaultPageNumber, {
            tandem: options.tandem.createTandem('pageNumberProperty'),
            numberType: 'Integer',
            isValidValue: (value)=>value < this.numberOfPagesProperty.value && value >= 0,
            // Based on the total number of possible alignBoxes, not just the ones visible on startup
            range: new Range(0, maxPages - 1),
            phetioFeatured: true
        });
        const buttonsVisibleProperty = new DerivedProperty([
            this.numberOfPagesProperty
        ], (numberOfPages)=>{
            // always show the buttons if there is more than one page, and always hide the buttons if there is only one page
            return numberOfPages > 1;
        });
        // Next button
        const nextButton = new CarouselButton(combineOptions({
            arrowDirection: orientation === Orientation.HORIZONTAL ? 'right' : 'down',
            tandem: options.tandem.createTandem('nextButton'),
            listener: ()=>this.pageNumberProperty.set(this.pageNumberProperty.get() + 1),
            enabledProperty: new DerivedProperty([
                this.pageNumberProperty,
                this.numberOfPagesProperty
            ], (pageNumber, numberofPages)=>{
                return pageNumber < numberofPages - 1;
            }),
            visibleProperty: buttonsVisibleProperty
        }, buttonOptions));
        // Previous button
        const previousButton = new CarouselButton(combineOptions({
            arrowDirection: orientation === Orientation.HORIZONTAL ? 'left' : 'up',
            tandem: options.tandem.createTandem('previousButton'),
            listener: ()=>this.pageNumberProperty.set(this.pageNumberProperty.get() - 1),
            enabledProperty: new DerivedProperty([
                this.pageNumberProperty
            ], (pageNumber)=>{
                return pageNumber > 0;
            }),
            visibleProperty: buttonsVisibleProperty
        }, buttonOptions));
        // Window with clipping area, so that the scrollingNodeContainer can be scrolled
        const windowNode = new Node({
            children: [
                scrollingNodeContainer
            ]
        });
        // Background - displays the carousel's fill color
        const backgroundNode = new Rectangle({
            cornerRadius: options.cornerRadius,
            fill: options.fill
        });
        // Foreground - displays the carousel's outline, created as a separate node so that it can be placed on top of
        // everything, for a clean look.
        const foregroundNode = new Rectangle({
            cornerRadius: options.cornerRadius,
            stroke: options.stroke,
            pickable: false
        });
        // Top-level layout (based on background changes).
        this.carouselConstraint = new CarouselConstraint(this, backgroundNode, foregroundNode, windowNode, previousButton, nextButton, scrollingNodeContainer, this.alignBoxes, orientation, this.scrollingNode, this.itemsPerPage, options.margin, alignGroup, separatorLayer, options.separatorOptions);
        // Handle changing pages (or if the content changes)
        let scrollAnimation = null;
        const lastScrollBounds = new Bounds2(0, 0, 0, 0); // used mutably
        Multilink.multilink([
            this.pageNumberProperty,
            scrollingNodeContainer.localBoundsProperty
        ], (pageNumber, scrollBounds)=>{
            // We might temporarily hit this value. Bail out now instead of an assertion (it will get fired again)
            if (pageNumber >= this.numberOfPagesProperty.value) {
                return;
            }
            // stop any animation that's in progress
            scrollAnimation && scrollAnimation.stop();
            // Find the item at the top of pageNumber page
            const firstItemOnPage = this.visibleAlignBoxesProperty.value[pageNumber * options.itemsPerPage];
            // Place we want to scroll to
            const targetValue = firstItemOnPage ? -firstItemOnPage[orientation.minSide] + options.margin : 0;
            const scrollBoundsChanged = lastScrollBounds === null || !lastScrollBounds.equals(scrollBounds);
            lastScrollBounds.set(scrollBounds); // scrollBounds is mutable, we get the same reference, don't store it
            // Only animate if animation is enabled and PhET-iO state is not being set.  When PhET-iO state is being set (as
            // in loading a customized state), the carousel should immediately reflect the desired page
            // Do not animate during initialization.
            // Do not animate when our scrollBounds have changed (our content probably resized)
            if (this.animationEnabled && !(isSettingPhetioStateProperty == null ? void 0 : isSettingPhetioStateProperty.value) && isInitialized && !scrollBoundsChanged) {
                // create and start the scroll animation
                scrollAnimation = new Animation(combineOptions({}, options.animationOptions, {
                    to: targetValue,
                    // options that are specific to orientation
                    getValue: ()=>scrollingNodeContainer[orientation.coordinate],
                    setValue: (value)=>{
                        scrollingNodeContainer[orientation.coordinate] = value;
                    }
                }));
                scrollAnimation.endedEmitter.addListener(()=>this.isAnimatingProperty.set(false));
                scrollAnimation.start();
                this.isAnimatingProperty.value = true;
            } else {
                // animation disabled, move immediate to new page
                scrollingNodeContainer[orientation.coordinate] = targetValue;
            }
        });
        // Don't stay on a page that doesn't exist
        this.visibleAlignBoxesProperty.link(()=>{
            // if the only element in the last page is removed, remove the page and autoscroll to the new final page
            this.pageNumberProperty.value = Math.min(this.pageNumberProperty.value, this.numberOfPagesProperty.value - 1);
        });
        options.children = [
            backgroundNode,
            windowNode,
            nextButton,
            previousButton,
            foregroundNode
        ];
        this.disposeCarousel = ()=>{
            this.visibleAlignBoxesProperty.dispose();
            this.pageNumberProperty.dispose();
            this.alignBoxes.forEach((alignBox)=>{
                assert && assert(alignBox.children.length === 1, 'Carousel AlignBox instances should have only one child');
                assert && assert(this.carouselItemNodes.includes(alignBox.children[0]), 'Carousel AlignBox instances should wrap a content node');
                alignBox.dispose();
            });
            this.scrollingNode.dispose();
            this.carouselConstraint.dispose();
            this.carouselItemNodes.forEach((node)=>node.dispose());
        };
        this.mutate(options);
        // Decorating with additional content is an anti-pattern, see https://github.com/phetsims/sun/issues/860
        assert && assertNoAdditionalChildren(this);
        // Will allow potential animation after this
        isInitialized = true;
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('sun', 'Carousel', this);
    }
};
export { Carousel as default };
/**
 * When moveChildToIndex is called, scrolls the Carousel to that item. For use in PhET-iO when the order of items is
 * changed.
 */ let ScrollingFlowBox = class ScrollingFlowBox extends FlowBox {
    onIndexedNodeIOChildMoved(child) {
        this.carousel.scrollToAlignBox(child);
    }
    constructor(carousel, options){
        super(options);
        this.carousel = carousel;
    }
};
let CarouselConstraint = class CarouselConstraint extends LayoutConstraint {
    updateSeparators() {
        const visibleChildren = this.carousel.getVisibleAlignBoxes();
        // Add separators between the visible children
        const range = visibleChildren.length >= 2 ? _.range(1, visibleChildren.length) : [];
        this.separatorLayer.children = range.map((index)=>{
            // Find the location between adjacent nodes
            const inbetween = (visibleChildren[index - 1][this.orientation.maxSide] + visibleChildren[index][this.orientation.minSide]) / 2;
            return new Separator(combineOptions({
                [`${this.orientation.coordinate}1`]: inbetween,
                [`${this.orientation.coordinate}2`]: inbetween,
                [`${this.orientation.opposite.coordinate}2`]: this.scrollingNode[this.orientation.opposite.size]
            }, this.separatorOptions));
        });
    }
    // Returns the clip area dimension for our Carousel based off of how many items we want to see per Carousel page.
    computeClipArea() {
        const orientation = this.orientation;
        const visibleAlignBoxes = this.carousel.getVisibleAlignBoxes();
        if (visibleAlignBoxes.length === 0) {
            return new Dimension2(0, 0);
        } else {
            // This doesn't fill one page in number play preferences dialog when you forget locales=*,
            // so take the last item, even if it is not a full page
            const lastBox = visibleAlignBoxes[this.itemsPerPage - 1] || visibleAlignBoxes[visibleAlignBoxes.length - 1];
            const horizontalSize = new Dimension2(// Measure from the beginning of the first item to the end of the last item on the 1st page
            lastBox[orientation.maxSide] - visibleAlignBoxes[0][orientation.minSide] + 2 * this.margin, this.scrollingNodeContainer.boundsProperty.value[orientation.opposite.size]);
            return this.orientation === Orientation.HORIZONTAL ? horizontalSize : horizontalSize.swapped();
        }
    }
    getBackgroundDimension() {
        let backgroundWidth;
        let backgroundHeight;
        if (this.orientation === Orientation.HORIZONTAL) {
            // For horizontal orientation, buttons contribute to width, if they are visible.
            const nextButtonWidth = this.nextButton.visible ? this.nextButton.width : 0;
            const previousButtonWidth = this.previousButton.visible ? this.previousButton.width : 0;
            backgroundWidth = this.windowNode.width + nextButtonWidth + previousButtonWidth;
            backgroundHeight = this.windowNode.height;
        } else {
            // For vertical orientation, buttons contribute to height, if they are visible.
            const nextButtonHeight = this.nextButton.visible ? this.nextButton.height : 0;
            const previousButtonHeight = this.previousButton.visible ? this.previousButton.height : 0;
            backgroundWidth = this.windowNode.width;
            backgroundHeight = this.windowNode.height + nextButtonHeight + previousButtonHeight;
        }
        return new Dimension2(backgroundWidth, backgroundHeight);
    }
    layout() {
        super.layout();
        const orientation = this.orientation;
        // Resize next/previous buttons dynamically
        const maxOppositeSize = this.alignGroup.getMaxSizeProperty(orientation.opposite).value;
        const buttonOppositeSize = maxOppositeSize + 2 * this.margin;
        this.nextButton[orientation.opposite.preferredSize] = buttonOppositeSize;
        this.previousButton[orientation.opposite.preferredSize] = buttonOppositeSize;
        this.nextButton[orientation.opposite.centerCoordinate] = this.backgroundNode[orientation.opposite.centerCoordinate];
        this.previousButton[orientation.opposite.centerCoordinate] = this.backgroundNode[orientation.opposite.centerCoordinate];
        this.windowNode[orientation.opposite.centerCoordinate] = this.backgroundNode[orientation.opposite.centerCoordinate];
        this.previousButton[orientation.minSide] = this.backgroundNode[orientation.minSide];
        this.nextButton[orientation.maxSide] = this.backgroundNode[orientation.maxSide];
        this.windowNode[orientation.centerCoordinate] = this.backgroundNode[orientation.centerCoordinate];
        const clipBounds = this.computeClipArea().toBounds();
        this.windowNode.clipArea = Shape.bounds(clipBounds);
        // Specify the local bounds in order to ensure centering. For full pages, this is not necessary since the scrollingNodeContainer
        // already spans the full area. But for a partial page, this is necessary so the window will be centered.
        this.windowNode.localBounds = clipBounds;
        const backgroundDimension = this.getBackgroundDimension();
        this.carousel.backgroundWidth = backgroundDimension.width;
        this.carousel.backgroundHeight = backgroundDimension.height;
        const backgroundBounds = backgroundDimension.toBounds();
        this.backgroundNode.rectBounds = backgroundBounds;
        this.foregroundNode.rectBounds = backgroundBounds;
        // Only update separators if they are visible
        this.separatorLayer && this.updateSeparators();
    }
    constructor(carousel, backgroundNode, foregroundNode, windowNode, previousButton, nextButton, scrollingNodeContainer, alignBoxes, orientation, scrollingNode, itemsPerPage, margin, alignGroup, separatorLayer, separatorOptions){
        super(carousel), this.carousel = carousel, this.backgroundNode = backgroundNode, this.foregroundNode = foregroundNode, this.windowNode = windowNode, this.previousButton = previousButton, this.nextButton = nextButton, this.scrollingNodeContainer = scrollingNodeContainer, this.alignBoxes = alignBoxes, this.orientation = orientation, this.scrollingNode = scrollingNode, this.itemsPerPage = itemsPerPage, this.margin = margin, this.alignGroup = alignGroup, this.separatorLayer = separatorLayer, this.separatorOptions = separatorOptions;
        // Hook up to listen to these nodes (will be handled by LayoutConstraint disposal)
        [
            this.backgroundNode,
            this.foregroundNode,
            this.windowNode,
            this.previousButton,
            this.nextButton,
            this.scrollingNodeContainer,
            ...this.alignBoxes
        ].forEach((node)=>this.addNode(node, false));
        // Whenever layout happens in the scrolling node, it's the perfect time to update the separators
        if (this.separatorLayer) {
            // We do not need to remove this listener because it is internal to Carousel and will get garbage collected
            // when Carousel is disposed.
            this.scrollingNode.constraint.finishedLayoutEmitter.addListener(()=>{
                this.updateSeparators();
            });
        }
        this.updateLayout();
    }
};
sun.register('Carousel', Carousel);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9DYXJvdXNlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIGNhcm91c2VsIFVJIGNvbXBvbmVudC5cbiAqXG4gKiBBIHNldCBvZiBOIGl0ZW1zIGlzIGRpdmlkZWQgaW50byBNICdwYWdlcycsIGJhc2VkIG9uIGhvdyBtYW55IGl0ZW1zIGFyZSB2aXNpYmxlIGluIHRoZSBjYXJvdXNlbC5cbiAqIFByZXNzaW5nIHRoZSBuZXh0IGFuZCBwcmV2aW91cyBidXR0b25zIG1vdmVzIHRocm91Z2ggdGhlIHBhZ2VzLlxuICogTW92ZW1lbnQgdGhyb3VnaCB0aGUgcGFnZXMgaXMgYW5pbWF0ZWQsIHNvIHRoYXQgaXRlbXMgYXBwZWFyIHRvIHNjcm9sbCBieS5cbiAqXG4gKiBOb3RlIHRoYXQgQ2Fyb3VzZWwgd3JhcHMgZWFjaCBpdGVtIChOb2RlKSBpbiBhbiBhbGlnbkJveCB0byBlbnN1cmUgYWxsIGl0ZW1zIGhhdmUgYW4gZXF1YWwgXCJmb290cHJpbnRcIiBkaW1lbnNpb24uXG4gKlxuICogVGhlIENhcm91c2VsIGhhbmRsZXMgZHluYW1pYyBsYXlvdXQgYXMgZmFyIGFzIGNhcm91c2VsIGl0ZW1zIGNoYW5naW5nIHNpemVzIC0gaXQgd2lsbCByZXNpemUgdG8gZml0IGFsbCBvZiB0aGUgaXRlbXMuXG4gKiBJZiB5b3Ugd2FudCB0byBhbGlnbiBvciBzdHJldGNoIGl0ZW0gY29udGVudCwgdGhhdCBjYW4gYmUgZG9uZSB3aXRoIENhcm91c2VsSXRlbSdzIGFsaWduQm94T3B0aW9uc1xuICogKGFsaWduOnN0cmV0Y2ggd2lsbCBjYXVzZSB0aGUgaXRlbSB0byBiZSBleHBhbmRlZCB0byBpdHMgc2VjdGlvbiBpbiB0aGUgQ2Fyb3VzZWwpLlxuICpcbiAqIENhcm91c2VsIGN1cnJlbnRseSBpcyBub3Qgc2l6YWJsZSBvbiBpdHMgb3duICh5b3UgY2FuJ3Qgc2V0IGEgcHJlZmVycmVkIHdpZHRoL2hlaWdodCB0aGF0IGNhdXNlcyBpdCB0byBleHBhbmQpLlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSwgeyBVbmtub3duRGVyaXZlZFByb3BlcnR5IH0gZnJvbSAnLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1JlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IHN0ZXBUaW1lciBmcm9tICcuLi8uLi9heG9uL2pzL3N0ZXBUaW1lci5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBJbnN0YW5jZVJlZ2lzdHJ5IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9kb2N1bWVudGF0aW9uL0luc3RhbmNlUmVnaXN0cnkuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IE9yaWVudGF0aW9uIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9PcmllbnRhdGlvbi5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBBbGlnbkJveCwgQWxpZ25Cb3hPcHRpb25zLCBBbGlnbkdyb3VwLCBhc3NlcnROb0FkZGl0aW9uYWxDaGlsZHJlbiwgRmxvd0JveCwgRmxvd0JveE9wdGlvbnMsIEluZGV4ZWROb2RlSU8sIEluZGV4ZWROb2RlSU9QYXJlbnQsIExheW91dENvbnN0cmFpbnQsIExheW91dE9yaWVudGF0aW9uLCBOb2RlLCBOb2RlT3B0aW9ucywgUmVjdGFuZ2xlLCBTZXBhcmF0b3IsIFNlcGFyYXRvck9wdGlvbnMsIFRQYWludCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgc2hhcmVkU291bmRQbGF5ZXJzIGZyb20gJy4uLy4uL3RhbWJvL2pzL3NoYXJlZFNvdW5kUGxheWVycy5qcyc7XG5pbXBvcnQgaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eSBmcm9tICcuLi8uLi90YW5kZW0vanMvaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IEFuaW1hdGlvbiwgeyBBbmltYXRpb25PcHRpb25zIH0gZnJvbSAnLi4vLi4vdHdpeHQvanMvQW5pbWF0aW9uLmpzJztcbmltcG9ydCBFYXNpbmcgZnJvbSAnLi4vLi4vdHdpeHQvanMvRWFzaW5nLmpzJztcbmltcG9ydCBCdXR0b25Ob2RlIGZyb20gJy4vYnV0dG9ucy9CdXR0b25Ob2RlLmpzJztcbmltcG9ydCBDYXJvdXNlbEJ1dHRvbiwgeyBDYXJvdXNlbEJ1dHRvbk9wdGlvbnMgfSBmcm9tICcuL2J1dHRvbnMvQ2Fyb3VzZWxCdXR0b24uanMnO1xuaW1wb3J0IENvbG9yQ29uc3RhbnRzIGZyb20gJy4vQ29sb3JDb25zdGFudHMuanMnO1xuaW1wb3J0IEdyb3VwSXRlbU9wdGlvbnMsIHsgZ2V0R3JvdXBJdGVtTm9kZXMgfSBmcm9tICcuL0dyb3VwSXRlbU9wdGlvbnMuanMnO1xuaW1wb3J0IHN1biBmcm9tICcuL3N1bi5qcyc7XG5cbmNvbnN0IERFRkFVTFRfQVJST1dfU0laRSA9IG5ldyBEaW1lbnNpb24yKCAyMCwgNyApO1xuXG5leHBvcnQgdHlwZSBDYXJvdXNlbEl0ZW0gPSBHcm91cEl0ZW1PcHRpb25zICYge1xuXG4gIC8vIEl0ZW0tc3BlY2lmaWMgb3B0aW9ucyB0YWtlIHByZWNlZGVuY2Ugb3ZlciBnZW5lcmFsIGFsaWduQm94T3B0aW9uc1xuICBhbGlnbkJveE9wdGlvbnM/OiBBbGlnbkJveE9wdGlvbnM7XG59O1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuXG4gIC8vIGNvbnRhaW5lclxuICBvcmllbnRhdGlvbj86IExheW91dE9yaWVudGF0aW9uO1xuICBmaWxsPzogVFBhaW50OyAvLyBiYWNrZ3JvdW5kIGNvbG9yIG9mIHRoZSBjYXJvdXNlbFxuICBzdHJva2U/OiBUUGFpbnQ7IC8vIGNvbG9yIHVzZWQgdG8gc3Ryb2tlIHRoZSBib3JkZXIgb2YgdGhlIGNhcm91c2VsXG4gIGxpbmVXaWR0aD86IG51bWJlcjsgLy8gd2lkdGggb2YgdGhlIGJvcmRlciBhcm91bmQgdGhlIGNhcm91c2VsXG4gIGNvcm5lclJhZGl1cz86IG51bWJlcjsgLy8gcmFkaXVzIGFwcGxpZWQgdG8gdGhlIGNhcm91c2VsIGFuZCBuZXh0L3ByZXZpb3VzIGJ1dHRvbnNcbiAgZGVmYXVsdFBhZ2VOdW1iZXI/OiBudW1iZXI7IC8vIHBhZ2UgdGhhdCBpcyBpbml0aWFsbHkgdmlzaWJsZVxuXG4gIC8vIGl0ZW1zXG4gIGl0ZW1zUGVyUGFnZT86IG51bWJlcjsgLy8gbnVtYmVyIG9mIGl0ZW1zIHBlciBwYWdlLCBvciBob3cgbWFueSBpdGVtcyBhcmUgdmlzaWJsZSBhdCBhIHRpbWUgaW4gdGhlIGNhcm91c2VsXG4gIHNwYWNpbmc/OiBudW1iZXI7IC8vIHNwYWNpbmcgYmV0d2VlbiBpdGVtcywgYmV0d2VlbiBpdGVtcyBhbmQgb3B0aW9uYWwgc2VwYXJhdG9ycywgYW5kIGJldHdlZW4gaXRlbXMgYW5kIGJ1dHRvbnNcbiAgbWFyZ2luPzogbnVtYmVyOyAvLyBtYXJnaW4gYmV0d2VlbiBpdGVtcyBhbmQgdGhlIGVkZ2VzIG9mIHRoZSBjYXJvdXNlbFxuXG4gIC8vIG9wdGlvbnMgZm9yIHRoZSBBbGlnbkJveGVzIChwYXJ0aWN1bGFybHkgaWYgYWxpZ25tZW50IG9mIGl0ZW1zIHNob3VsZCBiZSBjaGFuZ2VkLCBvciBpZiBzcGVjaWZpYyBtYXJnaW5zIGFyZSBkZXNpcmVkKVxuICBhbGlnbkJveE9wdGlvbnM/OiBBbGlnbkJveE9wdGlvbnM7XG5cbiAgLy8gbmV4dC9wcmV2aW91cyBidXR0b24gb3B0aW9uc1xuICBidXR0b25PcHRpb25zPzogQ2Fyb3VzZWxCdXR0b25PcHRpb25zO1xuXG4gIC8vIGl0ZW0gc2VwYXJhdG9yIG9wdGlvbnNcbiAgc2VwYXJhdG9yc1Zpc2libGU/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIHB1dCBzZXBhcmF0b3JzIGJldHdlZW4gaXRlbXNcbiAgc2VwYXJhdG9yT3B0aW9ucz86IFNlcGFyYXRvck9wdGlvbnM7XG5cbiAgLy8gYW5pbWF0aW9uLCBzY3JvbGxpbmcgYmV0d2VlbiBwYWdlc1xuICBhbmltYXRpb25FbmFibGVkPzogYm9vbGVhbjsgLy8gaXMgYW5pbWF0aW9uIGVuYWJsZWQgd2hlbiBzY3JvbGxpbmcgYmV0d2VlbiBwYWdlcz9cbiAgYW5pbWF0aW9uT3B0aW9ucz86IFN0cmljdE9taXQ8QW5pbWF0aW9uT3B0aW9uczxudW1iZXI+LCAndG8nIHwgJ3NldFZhbHVlJyB8ICdnZXRWYWx1ZSc+OyAvLyBXZSBvdmVycmlkZSB0by9zZXRWYWx1ZS9nZXRWYWx1ZVxufTtcblxuZXhwb3J0IHR5cGUgQ2Fyb3VzZWxPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PE5vZGVPcHRpb25zLCAnY2hpbGRyZW4nPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2Fyb3VzZWwgZXh0ZW5kcyBOb2RlIHtcblxuICAvLyBJdGVtcyBob2xkIHRoZSBkYXRhIHRvIGNyZWF0ZSB0aGUgY2Fyb3VzZWxJdGVtTm9kZVxuICBwcml2YXRlIHJlYWRvbmx5IGl0ZW1zOiBDYXJvdXNlbEl0ZW1bXTtcblxuICAvLyBlYWNoIEFsaWduQm94IGhvbGRzIGEgY2Fyb3VzZWxJdGVtTm9kZSBhbmQgZW5zdXJlcyBwcm9wZXIgc2l6aW5nIGluIHRoZSBDYXJvdXNlbFxuICBwcml2YXRlIHJlYWRvbmx5IGFsaWduQm94ZXM6IEFsaWduQm94W107XG5cbiAgLy8gU3RvcmVzIHRoZSB2aXNpYmxlIGFsaWduIGJveGVzXG4gIHByaXZhdGUgcmVhZG9ubHkgdmlzaWJsZUFsaWduQm94ZXNQcm9wZXJ0eTogVW5rbm93bkRlcml2ZWRQcm9wZXJ0eTxBbGlnbkJveFtdPjtcblxuICAvLyBjcmVhdGVkIGZyb20gY3JlYXRlTm9kZSgpIGluIENhcm91c2VsSXRlbVxuICBwdWJsaWMgcmVhZG9ubHkgY2Fyb3VzZWxJdGVtTm9kZXM6IE5vZGVbXTtcblxuICBwcml2YXRlIHJlYWRvbmx5IGl0ZW1zUGVyUGFnZTogbnVtYmVyO1xuICBwcml2YXRlIHJlYWRvbmx5IGRlZmF1bHRQYWdlTnVtYmVyOiBudW1iZXI7XG5cbiAgLy8gbnVtYmVyIG9mIHBhZ2VzIGluIHRoZSBjYXJvdXNlbFxuICBwdWJsaWMgcmVhZG9ubHkgbnVtYmVyT2ZQYWdlc1Byb3BlcnR5OiBSZWFkT25seVByb3BlcnR5PG51bWJlcj47XG5cbiAgLy8gcGFnZSBudW1iZXIgdGhhdCBpcyBjdXJyZW50bHkgdmlzaWJsZVxuICBwdWJsaWMgcmVhZG9ubHkgcGFnZU51bWJlclByb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXI+O1xuXG4gIC8vIGVuYWJsZXMgYW5pbWF0aW9uIHdoZW4gc2Nyb2xsaW5nIGJldHdlZW4gcGFnZXNcbiAgcHVibGljIGFuaW1hdGlvbkVuYWJsZWQ6IGJvb2xlYW47XG5cbiAgLy8gVGhlc2UgYXJlIHB1YmxpYyBmb3IgbGF5b3V0IC0gTk9URTogVGhlc2UgYXJlIG11dGF0ZWQgaWYgdGhlIHNpemUgY2hhbmdlcyBhZnRlciBjb25zdHJ1Y3Rpb25cbiAgcHVibGljIGJhY2tncm91bmRXaWR0aCE6IG51bWJlcjtcbiAgcHVibGljIGJhY2tncm91bmRIZWlnaHQhOiBudW1iZXI7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlQ2Fyb3VzZWw6ICgpID0+IHZvaWQ7XG4gIHByaXZhdGUgcmVhZG9ubHkgc2Nyb2xsaW5nTm9kZTogRmxvd0JveDtcbiAgcHJpdmF0ZSByZWFkb25seSBjYXJvdXNlbENvbnN0cmFpbnQ6IENhcm91c2VsQ29uc3RyYWludDtcblxuICBwdWJsaWMgcmVhZG9ubHkgaXNBbmltYXRpbmdQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XG5cbiAgLyoqXG4gICAqIE5PVEU6IFRoaXMgd2lsbCBkaXNwb3NlIHRoZSBpdGVtIE5vZGVzIHdoZW4gdGhlIGNhcm91c2VsIGlzIGRpc3Bvc2VkXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGl0ZW1zOiBDYXJvdXNlbEl0ZW1bXSwgcHJvdmlkZWRPcHRpb25zPzogQ2Fyb3VzZWxPcHRpb25zICkge1xuXG4gICAgLy8gRG9uJ3QgYW5pbWF0ZSBkdXJpbmcgaW5pdGlhbGl6YXRpb25cbiAgICBsZXQgaXNJbml0aWFsaXplZCA9IGZhbHNlO1xuXG4gICAgLy8gT3ZlcnJpZGUgZGVmYXVsdHMgd2l0aCBzcGVjaWZpZWQgb3B0aW9uc1xuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Q2Fyb3VzZWxPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gY29udGFpbmVyXG4gICAgICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLFxuICAgICAgZmlsbDogJ3doaXRlJyxcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcbiAgICAgIGxpbmVXaWR0aDogMSxcbiAgICAgIGNvcm5lclJhZGl1czogNCxcbiAgICAgIGRlZmF1bHRQYWdlTnVtYmVyOiAwLFxuXG4gICAgICAvLyBpdGVtc1xuICAgICAgaXRlbXNQZXJQYWdlOiA0LFxuICAgICAgc3BhY2luZzogMTIsXG4gICAgICBtYXJnaW46IDYsXG5cbiAgICAgIGFsaWduQm94T3B0aW9uczoge1xuICAgICAgICBwaGV0aW9UeXBlOiBJbmRleGVkTm9kZUlPLFxuICAgICAgICBwaGV0aW9TdGF0ZTogdHJ1ZSxcbiAgICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczoge1xuICAgICAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8vIG5leHQvcHJldmlvdXMgYnV0dG9uc1xuICAgICAgYnV0dG9uT3B0aW9uczoge1xuICAgICAgICB4TWFyZ2luOiA1LFxuICAgICAgICB5TWFyZ2luOiA1LFxuXG4gICAgICAgIC8vIGZvciBkaWxhdGluZyBwb2ludGVyIGFyZWFzIG9mIG5leHQvcHJldmlvdXMgYnV0dG9ucyBzdWNoIHRoYXQgdGhleSBkbyBub3Qgb3ZlcmxhcCB3aXRoIENhcm91c2VsIGNvbnRlbnRcbiAgICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiAwLFxuICAgICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDAsXG4gICAgICAgIG1vdXNlQXJlYVhEaWxhdGlvbjogMCxcbiAgICAgICAgbW91c2VBcmVhWURpbGF0aW9uOiAwLFxuXG4gICAgICAgIGJhc2VDb2xvcjogJ3JnYmEoIDIwMCwgMjAwLCAyMDAsIDAuNSApJyxcbiAgICAgICAgZGlzYWJsZWRDb2xvcjogQ29sb3JDb25zdGFudHMuTElHSFRfR1JBWSxcbiAgICAgICAgbGluZVdpZHRoOiAxLFxuXG4gICAgICAgIGFycm93UGF0aE9wdGlvbnM6IHtcbiAgICAgICAgICBzdHJva2U6ICdibGFjaycsXG4gICAgICAgICAgbGluZVdpZHRoOiAzXG4gICAgICAgIH0sXG4gICAgICAgIGFycm93U2l6ZTogREVGQVVMVF9BUlJPV19TSVpFLFxuXG4gICAgICAgIGVuYWJsZWRQcm9wZXJ0eU9wdGlvbnM6IHtcbiAgICAgICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcbiAgICAgICAgICBwaGV0aW9GZWF0dXJlZDogZmFsc2VcbiAgICAgICAgfSxcblxuICAgICAgICBzb3VuZFBsYXllcjogc2hhcmVkU291bmRQbGF5ZXJzLmdldCggJ3B1c2hCdXR0b24nIClcbiAgICAgIH0sXG5cbiAgICAgIC8vIGl0ZW0gc2VwYXJhdG9yc1xuICAgICAgc2VwYXJhdG9yc1Zpc2libGU6IGZhbHNlLFxuICAgICAgc2VwYXJhdG9yT3B0aW9uczoge1xuICAgICAgICBzdHJva2U6ICdyZ2IoIDE4MCwgMTgwLCAxODAgKScsXG4gICAgICAgIGxpbmVXaWR0aDogMC41LFxuICAgICAgICBwaWNrYWJsZTogZmFsc2VcbiAgICAgIH0sXG5cbiAgICAgIC8vIGFuaW1hdGlvbiwgc2Nyb2xsaW5nIGJldHdlZW4gcGFnZXNcbiAgICAgIGFuaW1hdGlvbkVuYWJsZWQ6IHRydWUsXG4gICAgICBhbmltYXRpb25PcHRpb25zOiB7XG4gICAgICAgIGR1cmF0aW9uOiAwLjQsXG4gICAgICAgIHN0ZXBFbWl0dGVyOiBzdGVwVGltZXIsXG4gICAgICAgIGVhc2luZzogRWFzaW5nLkNVQklDX0lOX09VVFxuICAgICAgfSxcblxuICAgICAgLy8gcGhldC1pb1xuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUSU9OQUwsXG4gICAgICB2aXNpYmxlUHJvcGVydHlPcHRpb25zOiB7XG4gICAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlXG4gICAgICB9XG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5hbmltYXRpb25FbmFibGVkID0gb3B0aW9ucy5hbmltYXRpb25FbmFibGVkO1xuICAgIHRoaXMuaXRlbXMgPSBpdGVtcztcbiAgICB0aGlzLml0ZW1zUGVyUGFnZSA9IG9wdGlvbnMuaXRlbXNQZXJQYWdlO1xuICAgIHRoaXMuZGVmYXVsdFBhZ2VOdW1iZXIgPSBvcHRpb25zLmRlZmF1bHRQYWdlTnVtYmVyO1xuXG4gICAgY29uc3Qgb3JpZW50YXRpb24gPSBPcmllbnRhdGlvbi5mcm9tTGF5b3V0T3JpZW50YXRpb24oIG9wdGlvbnMub3JpZW50YXRpb24gKTtcbiAgICBjb25zdCBhbGlnbkdyb3VwID0gbmV3IEFsaWduR3JvdXAoKTtcblxuICAgIGNvbnN0IGl0ZW1zVGFuZGVtID0gb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnaXRlbXMnICk7XG4gICAgdGhpcy5jYXJvdXNlbEl0ZW1Ob2RlcyA9IGdldEdyb3VwSXRlbU5vZGVzKCBpdGVtcywgaXRlbXNUYW5kZW0gKTtcblxuICAgIC8vIEFsbCBpdGVtcyBhcmUgd3JhcHBlZCBpbiBBbGlnbkJveGVzIHRvIGVuc3VyZSBjb25zaXN0ZW50IHNpemluZ1xuICAgIHRoaXMuYWxpZ25Cb3hlcyA9IGl0ZW1zLm1hcCggKCBpdGVtLCBpbmRleCApID0+IHtcbiAgICAgIHJldHVybiBhbGlnbkdyb3VwLmNyZWF0ZUJveCggdGhpcy5jYXJvdXNlbEl0ZW1Ob2Rlc1sgaW5kZXggXSwgY29tYmluZU9wdGlvbnM8QWxpZ25Cb3hPcHRpb25zPigge1xuICAgICAgICAgIHRhbmRlbTogaXRlbS50YW5kZW1OYW1lID8gaXRlbXNUYW5kZW0uY3JlYXRlVGFuZGVtKCBpdGVtLnRhbmRlbU5hbWUgKSA6IFRhbmRlbS5PUFRJT05BTFxuICAgICAgICB9LCBvcHRpb25zLmFsaWduQm94T3B0aW9ucyxcblxuICAgICAgICAvLyBJdGVtLXNwZWNpZmljIG9wdGlvbnMgdGFrZSBwcmVjZWRlbmNlXG4gICAgICAgIGl0ZW0uYWxpZ25Cb3hPcHRpb25zICkgKTtcbiAgICB9ICk7XG5cbiAgICAvLyBzY3JvbGxpbmdOb2RlIHdpbGwgY29udGFpbiBhbGwgaXRlbXMsIGFycmFuZ2VkIGluIHRoZSBwcm9wZXIgb3JpZW50YXRpb24sIHdpdGggbWFyZ2lucyBhbmQgc3BhY2luZy5cbiAgICAvLyBOT1RFOiBXZSdsbCBuZWVkIHRvIGhhbmRsZSB1cGRhdGVzIHRvIHRoZSBvcmRlciAoZm9yIHBoZXQtaW8gSW5kZXhlZE5vZGVJTykuXG4gICAgLy8gSG9yaXpvbnRhbCBjYXJvdXNlbCBhcnJhbmdlIGl0ZW1zIGxlZnQtdG8tcmlnaHQsIHZlcnRpY2FsIGlzIHRvcC10by1ib3R0b20uXG4gICAgLy8gVHJhbnNsYXRpb24gb2YgdGhpcyBub2RlIHdpbGwgYmUgYW5pbWF0ZWQgdG8gZ2l2ZSB0aGUgZWZmZWN0IG9mIHNjcm9sbGluZyB0aHJvdWdoIHRoZSBpdGVtcy5cbiAgICB0aGlzLnNjcm9sbGluZ05vZGUgPSBuZXcgU2Nyb2xsaW5nRmxvd0JveCggdGhpcywge1xuICAgICAgY2hpbGRyZW46IHRoaXMuYWxpZ25Cb3hlcyxcbiAgICAgIG9yaWVudGF0aW9uOiBvcHRpb25zLm9yaWVudGF0aW9uLFxuICAgICAgc3BhY2luZzogb3B0aW9ucy5zcGFjaW5nLFxuICAgICAgWyBgJHtvcmllbnRhdGlvbi5vcHBvc2l0ZS5jb29yZGluYXRlfU1hcmdpbmAgXTogb3B0aW9ucy5tYXJnaW5cbiAgICB9ICk7XG5cbiAgICAvLyBWaXNpYmxlIEFsaWduQm94ZXMgKHRoZXNlIGFyZSB0aGUgb25lcyB3ZSBsYXkgb3V0IGFuZCBiYXNlIGV2ZXJ5dGhpbmcgb24pXG4gICAgdGhpcy52aXNpYmxlQWxpZ25Cb3hlc1Byb3BlcnR5ID0gRGVyaXZlZFByb3BlcnR5LmRlcml2ZUFueSggdGhpcy5hbGlnbkJveGVzLm1hcCggYWxpZ25Cb3ggPT4gYWxpZ25Cb3gudmlzaWJsZVByb3BlcnR5ICksICgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmdldFZpc2libGVBbGlnbkJveGVzKCk7XG4gICAgfSApO1xuXG4gICAgLy8gV2hlbiB0aGUgQWxpZ25Cb3hlcyBhcmUgcmVvcmRlcmVkLCB3ZSBuZWVkIHRvIHJlY29tcHV0ZSB0aGUgdmlzaWJsZUFsaWduQm94ZXNQcm9wZXJ0eVxuICAgIHRoaXMuc2Nyb2xsaW5nTm9kZS5jaGlsZHJlblJlb3JkZXJlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHRoaXMudmlzaWJsZUFsaWduQm94ZXNQcm9wZXJ0eS5yZWNvbXB1dGVEZXJpdmF0aW9uKCkgKTtcblxuICAgIC8vIE9wdGlvbnMgY29tbW9uIHRvIGJvdGggYnV0dG9uc1xuICAgIGNvbnN0IGJ1dHRvbk9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxDYXJvdXNlbEJ1dHRvbk9wdGlvbnM+KCB7XG4gICAgICBjb3JuZXJSYWRpdXM6IG9wdGlvbnMuY29ybmVyUmFkaXVzXG4gICAgfSwgb3B0aW9ucy5idXR0b25PcHRpb25zICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnNwYWNpbmcgPj0gb3B0aW9ucy5tYXJnaW4sICdUaGUgc3BhY2luZyBtdXN0IGJlID49IHRoZSBtYXJnaW4sIG9yIHlvdSB3aWxsIHNlZSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdwYWdlIDIgaXRlbXMgYXQgdGhlIGVuZCBvZiBwYWdlIDEnICk7XG5cbiAgICAvLyBJbiBvcmRlciB0byBtYWtlIGl0IGVhc3kgZm9yIHBoZXQtaW8gdG8gcmUtb3JkZXIgaXRlbXMsIHRoZSBzZXBhcmF0b3JzIHNob3VsZCBub3QgcGFydGljaXBhdGVcbiAgICAvLyBpbiB0aGUgbGF5b3V0IGFuZCBoYXZlIGluZGljZXMgdGhhdCBnZXQgbW92ZWQgYXJvdW5kLiAgVGhlcmVmb3JlLCB3ZSBhZGQgYSBzZXBhcmF0ZSBsYXllciB0b1xuICAgIC8vIHNob3cgdGhlIHNlcGFyYXRvcnMuXG4gICAgY29uc3Qgc2VwYXJhdG9yTGF5ZXIgPSBvcHRpb25zLnNlcGFyYXRvcnNWaXNpYmxlID8gbmV3IE5vZGUoIHtcbiAgICAgIHBpY2thYmxlOiBmYWxzZVxuICAgIH0gKSA6IG51bGw7XG5cbiAgICAvLyBDb250YWlucyB0aGUgc2Nyb2xsaW5nIG5vZGUgYW5kIHRoZSBhc3NvY2lhdGVkIHNlcGFyYXRvcnMsIGlmIGFueVxuICAgIGNvbnN0IHNjcm9sbGluZ05vZGVDb250YWluZXIgPSBuZXcgTm9kZSgge1xuICAgICAgY2hpbGRyZW46IG9wdGlvbnMuc2VwYXJhdG9yc1Zpc2libGUgPyBbIHNlcGFyYXRvckxheWVyISwgdGhpcy5zY3JvbGxpbmdOb2RlIF0gOiBbIHRoaXMuc2Nyb2xsaW5nTm9kZSBdXG4gICAgfSApO1xuXG4gICAgLy8gSGF2ZSB0byBoYXZlIGF0IGxlYXN0IG9uZSBwYWdlLCBldmVuIGlmIGl0IGlzIGJsYW5rXG4gICAgY29uc3QgY291bnRQYWdlcyA9ICggaXRlbXM6IEFsaWduQm94W10gKSA9PiBNYXRoLm1heCggTWF0aC5jZWlsKCBpdGVtcy5sZW5ndGggLyBvcHRpb25zLml0ZW1zUGVyUGFnZSApLCAxICk7XG5cbiAgICAvLyBOdW1iZXIgb2YgcGFnZXMgaXMgZGVyaXZlZCBmcm9tIHRoZSB0b3RhbCBudW1iZXIgb2YgaXRlbXMgYW5kIHRoZSBudW1iZXIgb2YgaXRlbXMgcGVyIHBhZ2VcbiAgICB0aGlzLm51bWJlck9mUGFnZXNQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy52aXNpYmxlQWxpZ25Cb3hlc1Byb3BlcnR5IF0sIHZpc2libGVBbGlnbkJveGVzID0+IHtcbiAgICAgIHJldHVybiBjb3VudFBhZ2VzKCB2aXNpYmxlQWxpZ25Cb3hlcyApO1xuICAgIH0sIHtcbiAgICAgIGlzVmFsaWRWYWx1ZTogdiA9PiB2ID4gMFxuICAgIH0gKTtcblxuICAgIGNvbnN0IG1heFBhZ2VzID0gY291bnRQYWdlcyggdGhpcy5hbGlnbkJveGVzICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLmRlZmF1bHRQYWdlTnVtYmVyID49IDAgJiYgb3B0aW9ucy5kZWZhdWx0UGFnZU51bWJlciA8PSB0aGlzLm51bWJlck9mUGFnZXNQcm9wZXJ0eS52YWx1ZSAtIDEsXG4gICAgICBgZGVmYXVsdFBhZ2VOdW1iZXIgaXMgb3V0IG9mIHJhbmdlOiAke29wdGlvbnMuZGVmYXVsdFBhZ2VOdW1iZXJ9YCApO1xuXG4gICAgLy8gTnVtYmVyIG9mIHRoZSBwYWdlIHRoYXQgaXMgdmlzaWJsZSBpbiB0aGUgY2Fyb3VzZWwuXG4gICAgdGhpcy5wYWdlTnVtYmVyUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIG9wdGlvbnMuZGVmYXVsdFBhZ2VOdW1iZXIsIHtcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncGFnZU51bWJlclByb3BlcnR5JyApLFxuICAgICAgbnVtYmVyVHlwZTogJ0ludGVnZXInLFxuICAgICAgaXNWYWxpZFZhbHVlOiAoIHZhbHVlOiBudW1iZXIgKSA9PiB2YWx1ZSA8IHRoaXMubnVtYmVyT2ZQYWdlc1Byb3BlcnR5LnZhbHVlICYmIHZhbHVlID49IDAsXG5cbiAgICAgIC8vIEJhc2VkIG9uIHRoZSB0b3RhbCBudW1iZXIgb2YgcG9zc2libGUgYWxpZ25Cb3hlcywgbm90IGp1c3QgdGhlIG9uZXMgdmlzaWJsZSBvbiBzdGFydHVwXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAwLCBtYXhQYWdlcyAtIDEgKSxcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlXG4gICAgfSApO1xuXG4gICAgY29uc3QgYnV0dG9uc1Zpc2libGVQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy5udW1iZXJPZlBhZ2VzUHJvcGVydHkgXSwgbnVtYmVyT2ZQYWdlcyA9PiB7XG4gICAgICAvLyBhbHdheXMgc2hvdyB0aGUgYnV0dG9ucyBpZiB0aGVyZSBpcyBtb3JlIHRoYW4gb25lIHBhZ2UsIGFuZCBhbHdheXMgaGlkZSB0aGUgYnV0dG9ucyBpZiB0aGVyZSBpcyBvbmx5IG9uZSBwYWdlXG4gICAgICByZXR1cm4gbnVtYmVyT2ZQYWdlcyA+IDE7XG4gICAgfSApO1xuXG4gICAgLy8gTmV4dCBidXR0b25cbiAgICBjb25zdCBuZXh0QnV0dG9uID0gbmV3IENhcm91c2VsQnV0dG9uKCBjb21iaW5lT3B0aW9uczxDYXJvdXNlbEJ1dHRvbk9wdGlvbnM+KCB7XG4gICAgICBhcnJvd0RpcmVjdGlvbjogb3JpZW50YXRpb24gPT09IE9yaWVudGF0aW9uLkhPUklaT05UQUwgPyAncmlnaHQnIDogJ2Rvd24nLFxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICduZXh0QnV0dG9uJyApLFxuICAgICAgbGlzdGVuZXI6ICgpID0+IHRoaXMucGFnZU51bWJlclByb3BlcnR5LnNldCggdGhpcy5wYWdlTnVtYmVyUHJvcGVydHkuZ2V0KCkgKyAxICksXG4gICAgICBlbmFibGVkUHJvcGVydHk6IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy5wYWdlTnVtYmVyUHJvcGVydHksIHRoaXMubnVtYmVyT2ZQYWdlc1Byb3BlcnR5IF0sICggcGFnZU51bWJlciwgbnVtYmVyb2ZQYWdlcyApID0+IHtcbiAgICAgICAgcmV0dXJuIHBhZ2VOdW1iZXIgPCBudW1iZXJvZlBhZ2VzIC0gMTtcbiAgICAgIH0gKSxcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogYnV0dG9uc1Zpc2libGVQcm9wZXJ0eVxuICAgIH0sIGJ1dHRvbk9wdGlvbnMgKSApO1xuXG4gICAgLy8gUHJldmlvdXMgYnV0dG9uXG4gICAgY29uc3QgcHJldmlvdXNCdXR0b24gPSBuZXcgQ2Fyb3VzZWxCdXR0b24oIGNvbWJpbmVPcHRpb25zPENhcm91c2VsQnV0dG9uT3B0aW9ucz4oIHtcbiAgICAgIGFycm93RGlyZWN0aW9uOiBvcmllbnRhdGlvbiA9PT0gT3JpZW50YXRpb24uSE9SSVpPTlRBTCA/ICdsZWZ0JyA6ICd1cCcsXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ByZXZpb3VzQnV0dG9uJyApLFxuICAgICAgbGlzdGVuZXI6ICgpID0+IHRoaXMucGFnZU51bWJlclByb3BlcnR5LnNldCggdGhpcy5wYWdlTnVtYmVyUHJvcGVydHkuZ2V0KCkgLSAxICksXG4gICAgICBlbmFibGVkUHJvcGVydHk6IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy5wYWdlTnVtYmVyUHJvcGVydHkgXSwgcGFnZU51bWJlciA9PiB7XG4gICAgICAgIHJldHVybiBwYWdlTnVtYmVyID4gMDtcbiAgICAgIH0gKSxcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogYnV0dG9uc1Zpc2libGVQcm9wZXJ0eVxuICAgIH0sIGJ1dHRvbk9wdGlvbnMgKSApO1xuXG4gICAgLy8gV2luZG93IHdpdGggY2xpcHBpbmcgYXJlYSwgc28gdGhhdCB0aGUgc2Nyb2xsaW5nTm9kZUNvbnRhaW5lciBjYW4gYmUgc2Nyb2xsZWRcbiAgICBjb25zdCB3aW5kb3dOb2RlID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgc2Nyb2xsaW5nTm9kZUNvbnRhaW5lciBdIH0gKTtcblxuICAgIC8vIEJhY2tncm91bmQgLSBkaXNwbGF5cyB0aGUgY2Fyb3VzZWwncyBmaWxsIGNvbG9yXG4gICAgY29uc3QgYmFja2dyb3VuZE5vZGUgPSBuZXcgUmVjdGFuZ2xlKCB7XG4gICAgICBjb3JuZXJSYWRpdXM6IG9wdGlvbnMuY29ybmVyUmFkaXVzLFxuICAgICAgZmlsbDogb3B0aW9ucy5maWxsXG4gICAgfSApO1xuXG4gICAgLy8gRm9yZWdyb3VuZCAtIGRpc3BsYXlzIHRoZSBjYXJvdXNlbCdzIG91dGxpbmUsIGNyZWF0ZWQgYXMgYSBzZXBhcmF0ZSBub2RlIHNvIHRoYXQgaXQgY2FuIGJlIHBsYWNlZCBvbiB0b3Agb2ZcbiAgICAvLyBldmVyeXRoaW5nLCBmb3IgYSBjbGVhbiBsb29rLlxuICAgIGNvbnN0IGZvcmVncm91bmROb2RlID0gbmV3IFJlY3RhbmdsZSgge1xuICAgICAgY29ybmVyUmFkaXVzOiBvcHRpb25zLmNvcm5lclJhZGl1cyxcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5zdHJva2UsXG4gICAgICBwaWNrYWJsZTogZmFsc2VcbiAgICB9ICk7XG5cbiAgICAvLyBUb3AtbGV2ZWwgbGF5b3V0IChiYXNlZCBvbiBiYWNrZ3JvdW5kIGNoYW5nZXMpLlxuICAgIHRoaXMuY2Fyb3VzZWxDb25zdHJhaW50ID0gbmV3IENhcm91c2VsQ29uc3RyYWludChcbiAgICAgIHRoaXMsXG4gICAgICBiYWNrZ3JvdW5kTm9kZSxcbiAgICAgIGZvcmVncm91bmROb2RlLFxuICAgICAgd2luZG93Tm9kZSxcbiAgICAgIHByZXZpb3VzQnV0dG9uLFxuICAgICAgbmV4dEJ1dHRvbixcbiAgICAgIHNjcm9sbGluZ05vZGVDb250YWluZXIsXG4gICAgICB0aGlzLmFsaWduQm94ZXMsXG4gICAgICBvcmllbnRhdGlvbixcbiAgICAgIHRoaXMuc2Nyb2xsaW5nTm9kZSxcbiAgICAgIHRoaXMuaXRlbXNQZXJQYWdlLFxuICAgICAgb3B0aW9ucy5tYXJnaW4sXG4gICAgICBhbGlnbkdyb3VwLFxuICAgICAgc2VwYXJhdG9yTGF5ZXIsXG4gICAgICBvcHRpb25zLnNlcGFyYXRvck9wdGlvbnMgKTtcblxuICAgIC8vIEhhbmRsZSBjaGFuZ2luZyBwYWdlcyAob3IgaWYgdGhlIGNvbnRlbnQgY2hhbmdlcylcbiAgICBsZXQgc2Nyb2xsQW5pbWF0aW9uOiBBbmltYXRpb24gfCBudWxsID0gbnVsbDtcbiAgICBjb25zdCBsYXN0U2Nyb2xsQm91bmRzID0gbmV3IEJvdW5kczIoIDAsIDAsIDAsIDAgKTsgLy8gdXNlZCBtdXRhYmx5XG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyB0aGlzLnBhZ2VOdW1iZXJQcm9wZXJ0eSwgc2Nyb2xsaW5nTm9kZUNvbnRhaW5lci5sb2NhbEJvdW5kc1Byb3BlcnR5IF0sICggcGFnZU51bWJlciwgc2Nyb2xsQm91bmRzICkgPT4ge1xuXG4gICAgICAvLyBXZSBtaWdodCB0ZW1wb3JhcmlseSBoaXQgdGhpcyB2YWx1ZS4gQmFpbCBvdXQgbm93IGluc3RlYWQgb2YgYW4gYXNzZXJ0aW9uIChpdCB3aWxsIGdldCBmaXJlZCBhZ2FpbilcbiAgICAgIGlmICggcGFnZU51bWJlciA+PSB0aGlzLm51bWJlck9mUGFnZXNQcm9wZXJ0eS52YWx1ZSApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBzdG9wIGFueSBhbmltYXRpb24gdGhhdCdzIGluIHByb2dyZXNzXG4gICAgICBzY3JvbGxBbmltYXRpb24gJiYgc2Nyb2xsQW5pbWF0aW9uLnN0b3AoKTtcblxuICAgICAgLy8gRmluZCB0aGUgaXRlbSBhdCB0aGUgdG9wIG9mIHBhZ2VOdW1iZXIgcGFnZVxuICAgICAgY29uc3QgZmlyc3RJdGVtT25QYWdlID0gdGhpcy52aXNpYmxlQWxpZ25Cb3hlc1Byb3BlcnR5LnZhbHVlWyBwYWdlTnVtYmVyICogb3B0aW9ucy5pdGVtc1BlclBhZ2UgXTtcblxuICAgICAgLy8gUGxhY2Ugd2Ugd2FudCB0byBzY3JvbGwgdG9cbiAgICAgIGNvbnN0IHRhcmdldFZhbHVlID0gZmlyc3RJdGVtT25QYWdlID8gKCAoIC1maXJzdEl0ZW1PblBhZ2VbIG9yaWVudGF0aW9uLm1pblNpZGUgXSApICsgb3B0aW9ucy5tYXJnaW4gKSA6IDA7XG5cbiAgICAgIGNvbnN0IHNjcm9sbEJvdW5kc0NoYW5nZWQgPSBsYXN0U2Nyb2xsQm91bmRzID09PSBudWxsIHx8ICFsYXN0U2Nyb2xsQm91bmRzLmVxdWFscyggc2Nyb2xsQm91bmRzICk7XG4gICAgICBsYXN0U2Nyb2xsQm91bmRzLnNldCggc2Nyb2xsQm91bmRzICk7IC8vIHNjcm9sbEJvdW5kcyBpcyBtdXRhYmxlLCB3ZSBnZXQgdGhlIHNhbWUgcmVmZXJlbmNlLCBkb24ndCBzdG9yZSBpdFxuXG4gICAgICAvLyBPbmx5IGFuaW1hdGUgaWYgYW5pbWF0aW9uIGlzIGVuYWJsZWQgYW5kIFBoRVQtaU8gc3RhdGUgaXMgbm90IGJlaW5nIHNldC4gIFdoZW4gUGhFVC1pTyBzdGF0ZSBpcyBiZWluZyBzZXQgKGFzXG4gICAgICAvLyBpbiBsb2FkaW5nIGEgY3VzdG9taXplZCBzdGF0ZSksIHRoZSBjYXJvdXNlbCBzaG91bGQgaW1tZWRpYXRlbHkgcmVmbGVjdCB0aGUgZGVzaXJlZCBwYWdlXG4gICAgICAvLyBEbyBub3QgYW5pbWF0ZSBkdXJpbmcgaW5pdGlhbGl6YXRpb24uXG4gICAgICAvLyBEbyBub3QgYW5pbWF0ZSB3aGVuIG91ciBzY3JvbGxCb3VuZHMgaGF2ZSBjaGFuZ2VkIChvdXIgY29udGVudCBwcm9iYWJseSByZXNpemVkKVxuICAgICAgaWYgKCB0aGlzLmFuaW1hdGlvbkVuYWJsZWQgJiYgIWlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHk/LnZhbHVlICYmIGlzSW5pdGlhbGl6ZWQgJiYgIXNjcm9sbEJvdW5kc0NoYW5nZWQgKSB7XG5cbiAgICAgICAgLy8gY3JlYXRlIGFuZCBzdGFydCB0aGUgc2Nyb2xsIGFuaW1hdGlvblxuICAgICAgICBzY3JvbGxBbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKCBjb21iaW5lT3B0aW9uczxBbmltYXRpb25PcHRpb25zPG51bWJlcj4+KCB7fSwgb3B0aW9ucy5hbmltYXRpb25PcHRpb25zLCB7XG4gICAgICAgICAgdG86IHRhcmdldFZhbHVlLFxuXG4gICAgICAgICAgLy8gb3B0aW9ucyB0aGF0IGFyZSBzcGVjaWZpYyB0byBvcmllbnRhdGlvblxuICAgICAgICAgIGdldFZhbHVlOiAoKSA9PiBzY3JvbGxpbmdOb2RlQ29udGFpbmVyWyBvcmllbnRhdGlvbi5jb29yZGluYXRlIF0sXG4gICAgICAgICAgc2V0VmFsdWU6ICggdmFsdWU6IG51bWJlciApID0+IHsgc2Nyb2xsaW5nTm9kZUNvbnRhaW5lclsgb3JpZW50YXRpb24uY29vcmRpbmF0ZSBdID0gdmFsdWU7IH1cblxuICAgICAgICB9ICkgKTtcbiAgICAgICAgc2Nyb2xsQW5pbWF0aW9uLmVuZGVkRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gdGhpcy5pc0FuaW1hdGluZ1Byb3BlcnR5LnNldCggZmFsc2UgKSApO1xuICAgICAgICBzY3JvbGxBbmltYXRpb24uc3RhcnQoKTtcbiAgICAgICAgdGhpcy5pc0FuaW1hdGluZ1Byb3BlcnR5LnZhbHVlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuXG4gICAgICAgIC8vIGFuaW1hdGlvbiBkaXNhYmxlZCwgbW92ZSBpbW1lZGlhdGUgdG8gbmV3IHBhZ2VcbiAgICAgICAgc2Nyb2xsaW5nTm9kZUNvbnRhaW5lclsgb3JpZW50YXRpb24uY29vcmRpbmF0ZSBdID0gdGFyZ2V0VmFsdWU7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gRG9uJ3Qgc3RheSBvbiBhIHBhZ2UgdGhhdCBkb2Vzbid0IGV4aXN0XG4gICAgdGhpcy52aXNpYmxlQWxpZ25Cb3hlc1Byb3BlcnR5LmxpbmsoICgpID0+IHtcbiAgICAgIC8vIGlmIHRoZSBvbmx5IGVsZW1lbnQgaW4gdGhlIGxhc3QgcGFnZSBpcyByZW1vdmVkLCByZW1vdmUgdGhlIHBhZ2UgYW5kIGF1dG9zY3JvbGwgdG8gdGhlIG5ldyBmaW5hbCBwYWdlXG4gICAgICB0aGlzLnBhZ2VOdW1iZXJQcm9wZXJ0eS52YWx1ZSA9IE1hdGgubWluKCB0aGlzLnBhZ2VOdW1iZXJQcm9wZXJ0eS52YWx1ZSwgdGhpcy5udW1iZXJPZlBhZ2VzUHJvcGVydHkudmFsdWUgLSAxICk7XG4gICAgfSApO1xuXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgYmFja2dyb3VuZE5vZGUsIHdpbmRvd05vZGUsIG5leHRCdXR0b24sIHByZXZpb3VzQnV0dG9uLCBmb3JlZ3JvdW5kTm9kZSBdO1xuXG4gICAgdGhpcy5kaXNwb3NlQ2Fyb3VzZWwgPSAoKSA9PiB7XG4gICAgICB0aGlzLnZpc2libGVBbGlnbkJveGVzUHJvcGVydHkuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5wYWdlTnVtYmVyUHJvcGVydHkuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5hbGlnbkJveGVzLmZvckVhY2goIGFsaWduQm94ID0+IHtcblxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhbGlnbkJveC5jaGlsZHJlbi5sZW5ndGggPT09IDEsICdDYXJvdXNlbCBBbGlnbkJveCBpbnN0YW5jZXMgc2hvdWxkIGhhdmUgb25seSBvbmUgY2hpbGQnICk7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuY2Fyb3VzZWxJdGVtTm9kZXMuaW5jbHVkZXMoIGFsaWduQm94LmNoaWxkcmVuWyAwIF0gKSwgJ0Nhcm91c2VsIEFsaWduQm94IGluc3RhbmNlcyBzaG91bGQgd3JhcCBhIGNvbnRlbnQgbm9kZScgKTtcblxuICAgICAgICBhbGlnbkJveC5kaXNwb3NlKCk7XG4gICAgICB9ICk7XG4gICAgICB0aGlzLnNjcm9sbGluZ05vZGUuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5jYXJvdXNlbENvbnN0cmFpbnQuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5jYXJvdXNlbEl0ZW1Ob2Rlcy5mb3JFYWNoKCBub2RlID0+IG5vZGUuZGlzcG9zZSgpICk7XG4gICAgfTtcblxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XG5cbiAgICAvLyBEZWNvcmF0aW5nIHdpdGggYWRkaXRpb25hbCBjb250ZW50IGlzIGFuIGFudGktcGF0dGVybiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzg2MFxuICAgIGFzc2VydCAmJiBhc3NlcnROb0FkZGl0aW9uYWxDaGlsZHJlbiggdGhpcyApO1xuXG4gICAgLy8gV2lsbCBhbGxvdyBwb3RlbnRpYWwgYW5pbWF0aW9uIGFmdGVyIHRoaXNcbiAgICBpc0luaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgIC8vIHN1cHBvcnQgZm9yIGJpbmRlciBkb2N1bWVudGF0aW9uLCBzdHJpcHBlZCBvdXQgaW4gYnVpbGRzIGFuZCBvbmx5IHJ1bnMgd2hlbiA/YmluZGVyIGlzIHNwZWNpZmllZFxuICAgIGFzc2VydCAmJiB3aW5kb3cucGhldD8uY2hpcHBlcj8ucXVlcnlQYXJhbWV0ZXJzPy5iaW5kZXIgJiYgSW5zdGFuY2VSZWdpc3RyeS5yZWdpc3RlckRhdGFVUkwoICdzdW4nLCAnQ2Fyb3VzZWwnLCB0aGlzICk7XG4gIH1cblxuICAvKipcbiAgICogTk9URTogVGhpcyB3aWxsIGRpc3Bvc2UgdGhlIGl0ZW0gTm9kZXNcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZUNhcm91c2VsKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0cyB0aGUgY2Fyb3VzZWwgdG8gaXRzIGluaXRpYWwgc3RhdGUuXG4gICAqIEBwYXJhbSBhbmltYXRpb25FbmFibGVkIC0gd2hldGhlciB0byBlbmFibGUgYW5pbWF0aW9uIGR1cmluZyByZXNldFxuICAgKi9cbiAgcHVibGljIHJlc2V0KCBhbmltYXRpb25FbmFibGVkID0gZmFsc2UgKTogdm9pZCB7XG4gICAgY29uc3Qgc2F2ZUFuaW1hdGlvbkVuYWJsZWQgPSB0aGlzLmFuaW1hdGlvbkVuYWJsZWQ7XG4gICAgdGhpcy5hbmltYXRpb25FbmFibGVkID0gYW5pbWF0aW9uRW5hYmxlZDtcblxuICAgIC8vIFJlc2V0IHRoZSBwYWdlIG51bWJlciB0byB0aGUgZGVmYXVsdCBwYWdlIG51bWJlciBpZiBwb3NzaWJsZSAoaWYgdGhpbmdzIGFyZSBoaWRkZW4sIGl0IG1pZ2h0IG5vdCBiZSBwb3NzaWJsZSlcbiAgICB0aGlzLnBhZ2VOdW1iZXJQcm9wZXJ0eS52YWx1ZSA9IE1hdGgubWluKCB0aGlzLmRlZmF1bHRQYWdlTnVtYmVyLCB0aGlzLm51bWJlck9mUGFnZXNQcm9wZXJ0eS52YWx1ZSAtIDEgKTtcblxuICAgIHRoaXMuYW5pbWF0aW9uRW5hYmxlZCA9IHNhdmVBbmltYXRpb25FbmFibGVkO1xuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIGFuIGl0ZW0ncyB2aXNpYmxlIGluZGV4LCBzY3JvbGxzIHRoZSBjYXJvdXNlbCB0byB0aGUgcGFnZSB0aGF0IGNvbnRhaW5zIHRoYXQgaXRlbS5cbiAgICovXG4gIHByaXZhdGUgc2Nyb2xsVG9JdGVtVmlzaWJsZUluZGV4KCBpdGVtVmlzaWJsZUluZGV4OiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5wYWdlTnVtYmVyUHJvcGVydHkuc2V0KCB0aGlzLml0ZW1WaXNpYmxlSW5kZXhUb1BhZ2VOdW1iZXIoIGl0ZW1WaXNpYmxlSW5kZXggKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIGFuIGl0ZW0sIHNjcm9sbHMgdGhlIGNhcm91c2VsIHRvIHRoZSBwYWdlIHRoYXQgY29udGFpbnMgdGhhdCBpdGVtLiBUaGlzIHdpbGwgb25seSBzY3JvbGwgaWYgaXRlbSBpcyBpbiB0aGVcbiAgICogQ2Fyb3VzZWwgYW5kIHZpc2libGUuXG4gICAqL1xuICBwdWJsaWMgc2Nyb2xsVG9JdGVtKCBpdGVtOiBDYXJvdXNlbEl0ZW0gKTogdm9pZCB7XG4gICAgdGhpcy5zY3JvbGxUb0FsaWduQm94KCB0aGlzLmdldEFsaWduQm94Rm9ySXRlbSggaXRlbSApICk7XG4gIH1cblxuICAvKipcbiAgICogUHVibGljIGZvciBTY3JvbGxpbmdGbG93Qm94IG9ubHlcbiAgICovXG4gIHB1YmxpYyBzY3JvbGxUb0FsaWduQm94KCBhbGlnbkJveDogQWxpZ25Cb3ggKTogdm9pZCB7XG5cblxuICAgIC8vIElmIHRoZSBsYXlvdXQgaXMgZHluYW1pYywgdGhlbiBvbmx5IGFjY291bnQgZm9yIHRoZSB2aXNpYmxlIGl0ZW1zXG4gICAgY29uc3QgYWxpZ25Cb3hJbmRleCA9IHRoaXMudmlzaWJsZUFsaWduQm94ZXNQcm9wZXJ0eS52YWx1ZS5pbmRleE9mKCBhbGlnbkJveCApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYWxpZ25Cb3hJbmRleCA+PSAwLCAnaXRlbSBub3QgcHJlc2VudCBvciB2aXNpYmxlJyApO1xuICAgIGlmICggYWxpZ25Cb3hJbmRleCA+PSAwICkge1xuICAgICAgdGhpcy5zY3JvbGxUb0l0ZW1WaXNpYmxlSW5kZXgoIGFsaWduQm94SW5kZXggKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSB2aXNpYmlsaXR5IG9mIGFuIGl0ZW0gaW4gdGhlIENhcm91c2VsLiBUaGlzIHRvZ2dsZXMgdmlzaWJpbGl0eSBhbmQgd2lsbCByZWZsb3cgdGhlIGxheW91dCwgc3VjaCB0aGF0IGhpZGRlblxuICAgKiBpdGVtcyBkbyBub3QgbGVhdmUgYSBnYXAgaW4gdGhlIGxheW91dC5cbiAgICovXG4gIHB1YmxpYyBzZXRJdGVtVmlzaWJsZSggaXRlbTogQ2Fyb3VzZWxJdGVtLCB2aXNpYmxlOiBib29sZWFuICk6IHZvaWQge1xuICAgIHRoaXMuZ2V0QWxpZ25Cb3hGb3JJdGVtKCBpdGVtICkudmlzaWJsZSA9IHZpc2libGU7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgQWxpZ25Cb3ggdGhhdCB3cmFwcyBhbiBpdGVtJ3MgTm9kZS5cbiAgICovXG4gIHByaXZhdGUgZ2V0QWxpZ25Cb3hGb3JJdGVtKCBpdGVtOiBDYXJvdXNlbEl0ZW0gKTogQWxpZ25Cb3gge1xuICAgIGNvbnN0IGFsaWduQm94ID0gdGhpcy5hbGlnbkJveGVzWyB0aGlzLml0ZW1zLmluZGV4T2YoIGl0ZW0gKSBdO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYWxpZ25Cb3gsICdpdGVtIGRvZXMgbm90IGhhdmUgY29ycmVzcG9uZGluZyBhbGlnbkJveCcgKTtcbiAgICByZXR1cm4gYWxpZ25Cb3g7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgTm9kZSB0aGF0IHdhcyBjcmVhdGVkIGZvciBhIGdpdmVuIGl0ZW0uXG4gICAqL1xuICBwdWJsaWMgZ2V0Tm9kZUZvckl0ZW0oIGl0ZW06IENhcm91c2VsSXRlbSApOiBOb2RlIHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5jYXJvdXNlbEl0ZW1Ob2Rlc1sgdGhpcy5pdGVtcy5pbmRleE9mKCBpdGVtICkgXTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG5vZGUsICdpdGVtIGRvZXMgbm90IGhhdmUgY29ycmVzcG9uZGluZyBub2RlJyApO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgcHJpdmF0ZSBpdGVtVmlzaWJsZUluZGV4VG9QYWdlTnVtYmVyKCBpdGVtSW5kZXg6IG51bWJlciApOiBudW1iZXIge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGl0ZW1JbmRleCA+PSAwICYmIGl0ZW1JbmRleCA8IHRoaXMuaXRlbXMubGVuZ3RoLCBgaXRlbUluZGV4IG91dCBvZiByYW5nZTogJHtpdGVtSW5kZXh9YCApO1xuICAgIHJldHVybiBNYXRoLmZsb29yKCBpdGVtSW5kZXggLyB0aGlzLml0ZW1zUGVyUGFnZSApO1xuICB9XG5cbiAgLy8gVGhlIG9yZGVyIG9mIGFsaWduQm94ZXMgbWlnaHQgYmUgdHdlYWtlZCBpbiBzY3JvbGxpbmdOb2RlJ3MgY2hpbGRyZW4uIFdlIG5lZWQgdG8gcmVzcGVjdCB0aGlzIG9yZGVyXG4gIHB1YmxpYyBnZXRWaXNpYmxlQWxpZ25Cb3hlcygpOiBBbGlnbkJveFtdIHtcbiAgICByZXR1cm4gXy5zb3J0QnkoIHRoaXMuYWxpZ25Cb3hlcy5maWx0ZXIoIGFsaWduQm94ID0+IGFsaWduQm94LnZpc2libGUgKSwgYWxpZ25Cb3ggPT4gdGhpcy5zY3JvbGxpbmdOb2RlLmNoaWxkcmVuLmluZGV4T2YoIGFsaWduQm94ICkgKTtcbiAgfVxufVxuXG4vKipcbiAqIFdoZW4gbW92ZUNoaWxkVG9JbmRleCBpcyBjYWxsZWQsIHNjcm9sbHMgdGhlIENhcm91c2VsIHRvIHRoYXQgaXRlbS4gRm9yIHVzZSBpbiBQaEVULWlPIHdoZW4gdGhlIG9yZGVyIG9mIGl0ZW1zIGlzXG4gKiBjaGFuZ2VkLlxuICovXG5jbGFzcyBTY3JvbGxpbmdGbG93Qm94IGV4dGVuZHMgRmxvd0JveCBpbXBsZW1lbnRzIEluZGV4ZWROb2RlSU9QYXJlbnQge1xuICBwcml2YXRlIHJlYWRvbmx5IGNhcm91c2VsOiBDYXJvdXNlbDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGNhcm91c2VsOiBDYXJvdXNlbCwgb3B0aW9ucz86IEZsb3dCb3hPcHRpb25zICkge1xuICAgIHN1cGVyKCBvcHRpb25zICk7XG4gICAgdGhpcy5jYXJvdXNlbCA9IGNhcm91c2VsO1xuICB9XG5cbiAgcHVibGljIG9uSW5kZXhlZE5vZGVJT0NoaWxkTW92ZWQoIGNoaWxkOiBOb2RlICk6IHZvaWQge1xuICAgIHRoaXMuY2Fyb3VzZWwuc2Nyb2xsVG9BbGlnbkJveCggY2hpbGQgYXMgQWxpZ25Cb3ggKTtcbiAgfVxufVxuXG5cbmNsYXNzIENhcm91c2VsQ29uc3RyYWludCBleHRlbmRzIExheW91dENvbnN0cmFpbnQge1xuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBjYXJvdXNlbDogQ2Fyb3VzZWwsXG4gICAgcHJpdmF0ZSByZWFkb25seSBiYWNrZ3JvdW5kTm9kZTogUmVjdGFuZ2xlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgZm9yZWdyb3VuZE5vZGU6IFJlY3RhbmdsZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IHdpbmRvd05vZGU6IE5vZGUsXG4gICAgcHJpdmF0ZSByZWFkb25seSBwcmV2aW91c0J1dHRvbjogQnV0dG9uTm9kZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IG5leHRCdXR0b246IEJ1dHRvbk5vZGUsXG4gICAgcHJpdmF0ZSByZWFkb25seSBzY3JvbGxpbmdOb2RlQ29udGFpbmVyOiBOb2RlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgYWxpZ25Cb3hlczogTm9kZVtdLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgb3JpZW50YXRpb246IE9yaWVudGF0aW9uLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgc2Nyb2xsaW5nTm9kZTogRmxvd0JveCxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGl0ZW1zUGVyUGFnZTogbnVtYmVyLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgbWFyZ2luOiBudW1iZXIsXG4gICAgcHJpdmF0ZSByZWFkb25seSBhbGlnbkdyb3VwOiBBbGlnbkdyb3VwLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgc2VwYXJhdG9yTGF5ZXI6IE5vZGUgfCBudWxsLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgc2VwYXJhdG9yT3B0aW9uczogU2VwYXJhdG9yT3B0aW9ucyApIHtcbiAgICBzdXBlciggY2Fyb3VzZWwgKTtcblxuICAgIC8vIEhvb2sgdXAgdG8gbGlzdGVuIHRvIHRoZXNlIG5vZGVzICh3aWxsIGJlIGhhbmRsZWQgYnkgTGF5b3V0Q29uc3RyYWludCBkaXNwb3NhbClcbiAgICBbIHRoaXMuYmFja2dyb3VuZE5vZGUsXG4gICAgICB0aGlzLmZvcmVncm91bmROb2RlLFxuICAgICAgdGhpcy53aW5kb3dOb2RlLFxuICAgICAgdGhpcy5wcmV2aW91c0J1dHRvbixcbiAgICAgIHRoaXMubmV4dEJ1dHRvbixcbiAgICAgIHRoaXMuc2Nyb2xsaW5nTm9kZUNvbnRhaW5lcixcbiAgICAgIC4uLnRoaXMuYWxpZ25Cb3hlcyBdLmZvckVhY2goIG5vZGUgPT4gdGhpcy5hZGROb2RlKCBub2RlLCBmYWxzZSApICk7XG5cbiAgICAvLyBXaGVuZXZlciBsYXlvdXQgaGFwcGVucyBpbiB0aGUgc2Nyb2xsaW5nIG5vZGUsIGl0J3MgdGhlIHBlcmZlY3QgdGltZSB0byB1cGRhdGUgdGhlIHNlcGFyYXRvcnNcbiAgICBpZiAoIHRoaXMuc2VwYXJhdG9yTGF5ZXIgKSB7XG5cbiAgICAgIC8vIFdlIGRvIG5vdCBuZWVkIHRvIHJlbW92ZSB0aGlzIGxpc3RlbmVyIGJlY2F1c2UgaXQgaXMgaW50ZXJuYWwgdG8gQ2Fyb3VzZWwgYW5kIHdpbGwgZ2V0IGdhcmJhZ2UgY29sbGVjdGVkXG4gICAgICAvLyB3aGVuIENhcm91c2VsIGlzIGRpc3Bvc2VkLlxuICAgICAgdGhpcy5zY3JvbGxpbmdOb2RlLmNvbnN0cmFpbnQuZmluaXNoZWRMYXlvdXRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XG4gICAgICAgIHRoaXMudXBkYXRlU2VwYXJhdG9ycygpO1xuICAgICAgfSApO1xuICAgIH1cblxuICAgIHRoaXMudXBkYXRlTGF5b3V0KCk7XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZVNlcGFyYXRvcnMoKTogdm9pZCB7XG4gICAgY29uc3QgdmlzaWJsZUNoaWxkcmVuID0gdGhpcy5jYXJvdXNlbC5nZXRWaXNpYmxlQWxpZ25Cb3hlcygpO1xuXG4gICAgLy8gQWRkIHNlcGFyYXRvcnMgYmV0d2VlbiB0aGUgdmlzaWJsZSBjaGlsZHJlblxuICAgIGNvbnN0IHJhbmdlID0gdmlzaWJsZUNoaWxkcmVuLmxlbmd0aCA+PSAyID8gXy5yYW5nZSggMSwgdmlzaWJsZUNoaWxkcmVuLmxlbmd0aCApIDogW107XG4gICAgdGhpcy5zZXBhcmF0b3JMYXllciEuY2hpbGRyZW4gPSByYW5nZS5tYXAoIGluZGV4ID0+IHtcblxuICAgICAgLy8gRmluZCB0aGUgbG9jYXRpb24gYmV0d2VlbiBhZGphY2VudCBub2Rlc1xuICAgICAgY29uc3QgaW5iZXR3ZWVuID0gKCB2aXNpYmxlQ2hpbGRyZW5bIGluZGV4IC0gMSBdWyB0aGlzLm9yaWVudGF0aW9uLm1heFNpZGUgXSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGVDaGlsZHJlblsgaW5kZXggXVsgdGhpcy5vcmllbnRhdGlvbi5taW5TaWRlIF0gKSAvIDI7XG5cbiAgICAgIHJldHVybiBuZXcgU2VwYXJhdG9yKCBjb21iaW5lT3B0aW9uczxTZXBhcmF0b3JPcHRpb25zPigge1xuICAgICAgICBbIGAke3RoaXMub3JpZW50YXRpb24uY29vcmRpbmF0ZX0xYCBdOiBpbmJldHdlZW4sXG4gICAgICAgIFsgYCR7dGhpcy5vcmllbnRhdGlvbi5jb29yZGluYXRlfTJgIF06IGluYmV0d2VlbixcbiAgICAgICAgWyBgJHt0aGlzLm9yaWVudGF0aW9uLm9wcG9zaXRlLmNvb3JkaW5hdGV9MmAgXTogdGhpcy5zY3JvbGxpbmdOb2RlWyB0aGlzLm9yaWVudGF0aW9uLm9wcG9zaXRlLnNpemUgXVxuICAgICAgfSwgdGhpcy5zZXBhcmF0b3JPcHRpb25zICkgKTtcbiAgICB9ICk7XG4gIH1cblxuICAvLyBSZXR1cm5zIHRoZSBjbGlwIGFyZWEgZGltZW5zaW9uIGZvciBvdXIgQ2Fyb3VzZWwgYmFzZWQgb2ZmIG9mIGhvdyBtYW55IGl0ZW1zIHdlIHdhbnQgdG8gc2VlIHBlciBDYXJvdXNlbCBwYWdlLlxuICBwcml2YXRlIGNvbXB1dGVDbGlwQXJlYSgpOiBEaW1lbnNpb24yIHtcbiAgICBjb25zdCBvcmllbnRhdGlvbiA9IHRoaXMub3JpZW50YXRpb247XG5cbiAgICBjb25zdCB2aXNpYmxlQWxpZ25Cb3hlcyA9IHRoaXMuY2Fyb3VzZWwuZ2V0VmlzaWJsZUFsaWduQm94ZXMoKTtcblxuICAgIGlmICggdmlzaWJsZUFsaWduQm94ZXMubGVuZ3RoID09PSAwICkge1xuICAgICAgcmV0dXJuIG5ldyBEaW1lbnNpb24yKCAwLCAwICk7XG4gICAgfVxuICAgIGVsc2Uge1xuXG4gICAgICAvLyBUaGlzIGRvZXNuJ3QgZmlsbCBvbmUgcGFnZSBpbiBudW1iZXIgcGxheSBwcmVmZXJlbmNlcyBkaWFsb2cgd2hlbiB5b3UgZm9yZ2V0IGxvY2FsZXM9KixcbiAgICAgIC8vIHNvIHRha2UgdGhlIGxhc3QgaXRlbSwgZXZlbiBpZiBpdCBpcyBub3QgYSBmdWxsIHBhZ2VcbiAgICAgIGNvbnN0IGxhc3RCb3ggPSB2aXNpYmxlQWxpZ25Cb3hlc1sgdGhpcy5pdGVtc1BlclBhZ2UgLSAxIF0gfHwgdmlzaWJsZUFsaWduQm94ZXNbIHZpc2libGVBbGlnbkJveGVzLmxlbmd0aCAtIDEgXTtcblxuICAgICAgY29uc3QgaG9yaXpvbnRhbFNpemUgPSBuZXcgRGltZW5zaW9uMihcbiAgICAgICAgLy8gTWVhc3VyZSBmcm9tIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGZpcnN0IGl0ZW0gdG8gdGhlIGVuZCBvZiB0aGUgbGFzdCBpdGVtIG9uIHRoZSAxc3QgcGFnZVxuICAgICAgICBsYXN0Qm94WyBvcmllbnRhdGlvbi5tYXhTaWRlIF0gLSB2aXNpYmxlQWxpZ25Cb3hlc1sgMCBdWyBvcmllbnRhdGlvbi5taW5TaWRlIF0gKyAoIDIgKiB0aGlzLm1hcmdpbiApLFxuXG4gICAgICAgIHRoaXMuc2Nyb2xsaW5nTm9kZUNvbnRhaW5lci5ib3VuZHNQcm9wZXJ0eS52YWx1ZVsgb3JpZW50YXRpb24ub3Bwb3NpdGUuc2l6ZSBdXG4gICAgICApO1xuICAgICAgcmV0dXJuIHRoaXMub3JpZW50YXRpb24gPT09IE9yaWVudGF0aW9uLkhPUklaT05UQUwgPyBob3Jpem9udGFsU2l6ZSA6IGhvcml6b250YWxTaXplLnN3YXBwZWQoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldEJhY2tncm91bmREaW1lbnNpb24oKTogRGltZW5zaW9uMiB7XG4gICAgbGV0IGJhY2tncm91bmRXaWR0aDtcbiAgICBsZXQgYmFja2dyb3VuZEhlaWdodDtcbiAgICBpZiAoIHRoaXMub3JpZW50YXRpb24gPT09IE9yaWVudGF0aW9uLkhPUklaT05UQUwgKSB7XG5cbiAgICAgIC8vIEZvciBob3Jpem9udGFsIG9yaWVudGF0aW9uLCBidXR0b25zIGNvbnRyaWJ1dGUgdG8gd2lkdGgsIGlmIHRoZXkgYXJlIHZpc2libGUuXG4gICAgICBjb25zdCBuZXh0QnV0dG9uV2lkdGggPSB0aGlzLm5leHRCdXR0b24udmlzaWJsZSA/IHRoaXMubmV4dEJ1dHRvbi53aWR0aCA6IDA7XG4gICAgICBjb25zdCBwcmV2aW91c0J1dHRvbldpZHRoID0gdGhpcy5wcmV2aW91c0J1dHRvbi52aXNpYmxlID8gdGhpcy5wcmV2aW91c0J1dHRvbi53aWR0aCA6IDA7XG4gICAgICBiYWNrZ3JvdW5kV2lkdGggPSB0aGlzLndpbmRvd05vZGUud2lkdGggKyBuZXh0QnV0dG9uV2lkdGggKyBwcmV2aW91c0J1dHRvbldpZHRoO1xuICAgICAgYmFja2dyb3VuZEhlaWdodCA9IHRoaXMud2luZG93Tm9kZS5oZWlnaHQ7XG4gICAgfVxuICAgIGVsc2Uge1xuXG4gICAgICAvLyBGb3IgdmVydGljYWwgb3JpZW50YXRpb24sIGJ1dHRvbnMgY29udHJpYnV0ZSB0byBoZWlnaHQsIGlmIHRoZXkgYXJlIHZpc2libGUuXG4gICAgICBjb25zdCBuZXh0QnV0dG9uSGVpZ2h0ID0gdGhpcy5uZXh0QnV0dG9uLnZpc2libGUgPyB0aGlzLm5leHRCdXR0b24uaGVpZ2h0IDogMDtcbiAgICAgIGNvbnN0IHByZXZpb3VzQnV0dG9uSGVpZ2h0ID0gdGhpcy5wcmV2aW91c0J1dHRvbi52aXNpYmxlID8gdGhpcy5wcmV2aW91c0J1dHRvbi5oZWlnaHQgOiAwO1xuICAgICAgYmFja2dyb3VuZFdpZHRoID0gdGhpcy53aW5kb3dOb2RlLndpZHRoO1xuICAgICAgYmFja2dyb3VuZEhlaWdodCA9IHRoaXMud2luZG93Tm9kZS5oZWlnaHQgKyBuZXh0QnV0dG9uSGVpZ2h0ICsgcHJldmlvdXNCdXR0b25IZWlnaHQ7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRGltZW5zaW9uMiggYmFja2dyb3VuZFdpZHRoLCBiYWNrZ3JvdW5kSGVpZ2h0ICk7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgbGF5b3V0KCk6IHZvaWQge1xuICAgIHN1cGVyLmxheW91dCgpO1xuXG4gICAgY29uc3Qgb3JpZW50YXRpb24gPSB0aGlzLm9yaWVudGF0aW9uO1xuXG4gICAgLy8gUmVzaXplIG5leHQvcHJldmlvdXMgYnV0dG9ucyBkeW5hbWljYWxseVxuICAgIGNvbnN0IG1heE9wcG9zaXRlU2l6ZSA9IHRoaXMuYWxpZ25Hcm91cC5nZXRNYXhTaXplUHJvcGVydHkoIG9yaWVudGF0aW9uLm9wcG9zaXRlICkudmFsdWU7XG4gICAgY29uc3QgYnV0dG9uT3Bwb3NpdGVTaXplID0gbWF4T3Bwb3NpdGVTaXplICsgKCAyICogdGhpcy5tYXJnaW4gKTtcbiAgICB0aGlzLm5leHRCdXR0b25bIG9yaWVudGF0aW9uLm9wcG9zaXRlLnByZWZlcnJlZFNpemUgXSA9IGJ1dHRvbk9wcG9zaXRlU2l6ZTtcbiAgICB0aGlzLnByZXZpb3VzQnV0dG9uWyBvcmllbnRhdGlvbi5vcHBvc2l0ZS5wcmVmZXJyZWRTaXplIF0gPSBidXR0b25PcHBvc2l0ZVNpemU7XG5cbiAgICB0aGlzLm5leHRCdXR0b25bIG9yaWVudGF0aW9uLm9wcG9zaXRlLmNlbnRlckNvb3JkaW5hdGUgXSA9IHRoaXMuYmFja2dyb3VuZE5vZGVbIG9yaWVudGF0aW9uLm9wcG9zaXRlLmNlbnRlckNvb3JkaW5hdGUgXTtcbiAgICB0aGlzLnByZXZpb3VzQnV0dG9uWyBvcmllbnRhdGlvbi5vcHBvc2l0ZS5jZW50ZXJDb29yZGluYXRlIF0gPSB0aGlzLmJhY2tncm91bmROb2RlWyBvcmllbnRhdGlvbi5vcHBvc2l0ZS5jZW50ZXJDb29yZGluYXRlIF07XG4gICAgdGhpcy53aW5kb3dOb2RlWyBvcmllbnRhdGlvbi5vcHBvc2l0ZS5jZW50ZXJDb29yZGluYXRlIF0gPSB0aGlzLmJhY2tncm91bmROb2RlWyBvcmllbnRhdGlvbi5vcHBvc2l0ZS5jZW50ZXJDb29yZGluYXRlIF07XG4gICAgdGhpcy5wcmV2aW91c0J1dHRvblsgb3JpZW50YXRpb24ubWluU2lkZSBdID0gdGhpcy5iYWNrZ3JvdW5kTm9kZVsgb3JpZW50YXRpb24ubWluU2lkZSBdO1xuICAgIHRoaXMubmV4dEJ1dHRvblsgb3JpZW50YXRpb24ubWF4U2lkZSBdID0gdGhpcy5iYWNrZ3JvdW5kTm9kZVsgb3JpZW50YXRpb24ubWF4U2lkZSBdO1xuICAgIHRoaXMud2luZG93Tm9kZVsgb3JpZW50YXRpb24uY2VudGVyQ29vcmRpbmF0ZSBdID0gdGhpcy5iYWNrZ3JvdW5kTm9kZVsgb3JpZW50YXRpb24uY2VudGVyQ29vcmRpbmF0ZSBdO1xuXG4gICAgY29uc3QgY2xpcEJvdW5kcyA9IHRoaXMuY29tcHV0ZUNsaXBBcmVhKCkudG9Cb3VuZHMoKTtcbiAgICB0aGlzLndpbmRvd05vZGUuY2xpcEFyZWEgPSBTaGFwZS5ib3VuZHMoIGNsaXBCb3VuZHMgKTtcblxuICAgIC8vIFNwZWNpZnkgdGhlIGxvY2FsIGJvdW5kcyBpbiBvcmRlciB0byBlbnN1cmUgY2VudGVyaW5nLiBGb3IgZnVsbCBwYWdlcywgdGhpcyBpcyBub3QgbmVjZXNzYXJ5IHNpbmNlIHRoZSBzY3JvbGxpbmdOb2RlQ29udGFpbmVyXG4gICAgLy8gYWxyZWFkeSBzcGFucyB0aGUgZnVsbCBhcmVhLiBCdXQgZm9yIGEgcGFydGlhbCBwYWdlLCB0aGlzIGlzIG5lY2Vzc2FyeSBzbyB0aGUgd2luZG93IHdpbGwgYmUgY2VudGVyZWQuXG4gICAgdGhpcy53aW5kb3dOb2RlLmxvY2FsQm91bmRzID0gY2xpcEJvdW5kcztcblxuICAgIGNvbnN0IGJhY2tncm91bmREaW1lbnNpb24gPSB0aGlzLmdldEJhY2tncm91bmREaW1lbnNpb24oKTtcblxuICAgIHRoaXMuY2Fyb3VzZWwuYmFja2dyb3VuZFdpZHRoID0gYmFja2dyb3VuZERpbWVuc2lvbi53aWR0aDtcbiAgICB0aGlzLmNhcm91c2VsLmJhY2tncm91bmRIZWlnaHQgPSBiYWNrZ3JvdW5kRGltZW5zaW9uLmhlaWdodDtcblxuICAgIGNvbnN0IGJhY2tncm91bmRCb3VuZHMgPSBiYWNrZ3JvdW5kRGltZW5zaW9uLnRvQm91bmRzKCk7XG4gICAgdGhpcy5iYWNrZ3JvdW5kTm9kZS5yZWN0Qm91bmRzID0gYmFja2dyb3VuZEJvdW5kcztcbiAgICB0aGlzLmZvcmVncm91bmROb2RlLnJlY3RCb3VuZHMgPSBiYWNrZ3JvdW5kQm91bmRzO1xuXG4gICAgLy8gT25seSB1cGRhdGUgc2VwYXJhdG9ycyBpZiB0aGV5IGFyZSB2aXNpYmxlXG4gICAgdGhpcy5zZXBhcmF0b3JMYXllciAmJiB0aGlzLnVwZGF0ZVNlcGFyYXRvcnMoKTtcbiAgfVxufVxuXG5zdW4ucmVnaXN0ZXIoICdDYXJvdXNlbCcsIENhcm91c2VsICk7Il0sIm5hbWVzIjpbIkJvb2xlYW5Qcm9wZXJ0eSIsIkRlcml2ZWRQcm9wZXJ0eSIsIk11bHRpbGluayIsIk51bWJlclByb3BlcnR5Iiwic3RlcFRpbWVyIiwiQm91bmRzMiIsIkRpbWVuc2lvbjIiLCJSYW5nZSIsIlNoYXBlIiwiSW5zdGFuY2VSZWdpc3RyeSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiT3JpZW50YXRpb24iLCJBbGlnbkdyb3VwIiwiYXNzZXJ0Tm9BZGRpdGlvbmFsQ2hpbGRyZW4iLCJGbG93Qm94IiwiSW5kZXhlZE5vZGVJTyIsIkxheW91dENvbnN0cmFpbnQiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiU2VwYXJhdG9yIiwic2hhcmVkU291bmRQbGF5ZXJzIiwiaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eSIsIlRhbmRlbSIsIkFuaW1hdGlvbiIsIkVhc2luZyIsIkNhcm91c2VsQnV0dG9uIiwiQ29sb3JDb25zdGFudHMiLCJnZXRHcm91cEl0ZW1Ob2RlcyIsInN1biIsIkRFRkFVTFRfQVJST1dfU0laRSIsIkNhcm91c2VsIiwiZGlzcG9zZSIsImRpc3Bvc2VDYXJvdXNlbCIsInJlc2V0IiwiYW5pbWF0aW9uRW5hYmxlZCIsInNhdmVBbmltYXRpb25FbmFibGVkIiwicGFnZU51bWJlclByb3BlcnR5IiwidmFsdWUiLCJNYXRoIiwibWluIiwiZGVmYXVsdFBhZ2VOdW1iZXIiLCJudW1iZXJPZlBhZ2VzUHJvcGVydHkiLCJzY3JvbGxUb0l0ZW1WaXNpYmxlSW5kZXgiLCJpdGVtVmlzaWJsZUluZGV4Iiwic2V0IiwiaXRlbVZpc2libGVJbmRleFRvUGFnZU51bWJlciIsInNjcm9sbFRvSXRlbSIsIml0ZW0iLCJzY3JvbGxUb0FsaWduQm94IiwiZ2V0QWxpZ25Cb3hGb3JJdGVtIiwiYWxpZ25Cb3giLCJhbGlnbkJveEluZGV4IiwidmlzaWJsZUFsaWduQm94ZXNQcm9wZXJ0eSIsImluZGV4T2YiLCJhc3NlcnQiLCJzZXRJdGVtVmlzaWJsZSIsInZpc2libGUiLCJhbGlnbkJveGVzIiwiaXRlbXMiLCJnZXROb2RlRm9ySXRlbSIsIm5vZGUiLCJjYXJvdXNlbEl0ZW1Ob2RlcyIsIml0ZW1JbmRleCIsImxlbmd0aCIsImZsb29yIiwiaXRlbXNQZXJQYWdlIiwiZ2V0VmlzaWJsZUFsaWduQm94ZXMiLCJfIiwic29ydEJ5IiwiZmlsdGVyIiwic2Nyb2xsaW5nTm9kZSIsImNoaWxkcmVuIiwicHJvdmlkZWRPcHRpb25zIiwid2luZG93IiwiaXNJbml0aWFsaXplZCIsIm9wdGlvbnMiLCJvcmllbnRhdGlvbiIsImZpbGwiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJjb3JuZXJSYWRpdXMiLCJzcGFjaW5nIiwibWFyZ2luIiwiYWxpZ25Cb3hPcHRpb25zIiwicGhldGlvVHlwZSIsInBoZXRpb1N0YXRlIiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsInBoZXRpb0ZlYXR1cmVkIiwiYnV0dG9uT3B0aW9ucyIsInhNYXJnaW4iLCJ5TWFyZ2luIiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwibW91c2VBcmVhWERpbGF0aW9uIiwibW91c2VBcmVhWURpbGF0aW9uIiwiYmFzZUNvbG9yIiwiZGlzYWJsZWRDb2xvciIsIkxJR0hUX0dSQVkiLCJhcnJvd1BhdGhPcHRpb25zIiwiYXJyb3dTaXplIiwiZW5hYmxlZFByb3BlcnR5T3B0aW9ucyIsInBoZXRpb1JlYWRPbmx5Iiwic291bmRQbGF5ZXIiLCJnZXQiLCJzZXBhcmF0b3JzVmlzaWJsZSIsInNlcGFyYXRvck9wdGlvbnMiLCJwaWNrYWJsZSIsImFuaW1hdGlvbk9wdGlvbnMiLCJkdXJhdGlvbiIsInN0ZXBFbWl0dGVyIiwiZWFzaW5nIiwiQ1VCSUNfSU5fT1VUIiwidGFuZGVtIiwiT1BUSU9OQUwiLCJpc0FuaW1hdGluZ1Byb3BlcnR5IiwiZnJvbUxheW91dE9yaWVudGF0aW9uIiwiYWxpZ25Hcm91cCIsIml0ZW1zVGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwibWFwIiwiaW5kZXgiLCJjcmVhdGVCb3giLCJ0YW5kZW1OYW1lIiwiU2Nyb2xsaW5nRmxvd0JveCIsIm9wcG9zaXRlIiwiY29vcmRpbmF0ZSIsImRlcml2ZUFueSIsInZpc2libGVQcm9wZXJ0eSIsImNoaWxkcmVuUmVvcmRlcmVkRW1pdHRlciIsImFkZExpc3RlbmVyIiwicmVjb21wdXRlRGVyaXZhdGlvbiIsInNlcGFyYXRvckxheWVyIiwic2Nyb2xsaW5nTm9kZUNvbnRhaW5lciIsImNvdW50UGFnZXMiLCJtYXgiLCJjZWlsIiwidmlzaWJsZUFsaWduQm94ZXMiLCJpc1ZhbGlkVmFsdWUiLCJ2IiwibWF4UGFnZXMiLCJudW1iZXJUeXBlIiwicmFuZ2UiLCJidXR0b25zVmlzaWJsZVByb3BlcnR5IiwibnVtYmVyT2ZQYWdlcyIsIm5leHRCdXR0b24iLCJhcnJvd0RpcmVjdGlvbiIsIkhPUklaT05UQUwiLCJsaXN0ZW5lciIsImVuYWJsZWRQcm9wZXJ0eSIsInBhZ2VOdW1iZXIiLCJudW1iZXJvZlBhZ2VzIiwicHJldmlvdXNCdXR0b24iLCJ3aW5kb3dOb2RlIiwiYmFja2dyb3VuZE5vZGUiLCJmb3JlZ3JvdW5kTm9kZSIsImNhcm91c2VsQ29uc3RyYWludCIsIkNhcm91c2VsQ29uc3RyYWludCIsInNjcm9sbEFuaW1hdGlvbiIsImxhc3RTY3JvbGxCb3VuZHMiLCJtdWx0aWxpbmsiLCJsb2NhbEJvdW5kc1Byb3BlcnR5Iiwic2Nyb2xsQm91bmRzIiwic3RvcCIsImZpcnN0SXRlbU9uUGFnZSIsInRhcmdldFZhbHVlIiwibWluU2lkZSIsInNjcm9sbEJvdW5kc0NoYW5nZWQiLCJlcXVhbHMiLCJ0byIsImdldFZhbHVlIiwic2V0VmFsdWUiLCJlbmRlZEVtaXR0ZXIiLCJzdGFydCIsImxpbmsiLCJmb3JFYWNoIiwiaW5jbHVkZXMiLCJtdXRhdGUiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImJpbmRlciIsInJlZ2lzdGVyRGF0YVVSTCIsIm9uSW5kZXhlZE5vZGVJT0NoaWxkTW92ZWQiLCJjaGlsZCIsImNhcm91c2VsIiwidXBkYXRlU2VwYXJhdG9ycyIsInZpc2libGVDaGlsZHJlbiIsImluYmV0d2VlbiIsIm1heFNpZGUiLCJzaXplIiwiY29tcHV0ZUNsaXBBcmVhIiwibGFzdEJveCIsImhvcml6b250YWxTaXplIiwiYm91bmRzUHJvcGVydHkiLCJzd2FwcGVkIiwiZ2V0QmFja2dyb3VuZERpbWVuc2lvbiIsImJhY2tncm91bmRXaWR0aCIsImJhY2tncm91bmRIZWlnaHQiLCJuZXh0QnV0dG9uV2lkdGgiLCJ3aWR0aCIsInByZXZpb3VzQnV0dG9uV2lkdGgiLCJoZWlnaHQiLCJuZXh0QnV0dG9uSGVpZ2h0IiwicHJldmlvdXNCdXR0b25IZWlnaHQiLCJsYXlvdXQiLCJtYXhPcHBvc2l0ZVNpemUiLCJnZXRNYXhTaXplUHJvcGVydHkiLCJidXR0b25PcHBvc2l0ZVNpemUiLCJwcmVmZXJyZWRTaXplIiwiY2VudGVyQ29vcmRpbmF0ZSIsImNsaXBCb3VuZHMiLCJ0b0JvdW5kcyIsImNsaXBBcmVhIiwiYm91bmRzIiwibG9jYWxCb3VuZHMiLCJiYWNrZ3JvdW5kRGltZW5zaW9uIiwiYmFja2dyb3VuZEJvdW5kcyIsInJlY3RCb3VuZHMiLCJhZGROb2RlIiwiY29uc3RyYWludCIsImZpbmlzaGVkTGF5b3V0RW1pdHRlciIsInVwZGF0ZUxheW91dCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBaUJDLEdBRUQsT0FBT0EscUJBQXFCLG1DQUFtQztBQUMvRCxPQUFPQyxxQkFBaUQsbUNBQW1DO0FBQzNGLE9BQU9DLGVBQWUsNkJBQTZCO0FBQ25ELE9BQU9DLG9CQUFvQixrQ0FBa0M7QUFHN0QsT0FBT0MsZUFBZSw2QkFBNkI7QUFDbkQsT0FBT0MsYUFBYSwwQkFBMEI7QUFDOUMsT0FBT0MsZ0JBQWdCLDZCQUE2QjtBQUNwRCxPQUFPQyxXQUFXLHdCQUF3QjtBQUMxQyxTQUFTQyxLQUFLLFFBQVEsMkJBQTJCO0FBQ2pELE9BQU9DLHNCQUFzQix1REFBdUQ7QUFDcEYsT0FBT0MsYUFBYUMsY0FBYyxRQUFRLGtDQUFrQztBQUM1RSxPQUFPQyxpQkFBaUIsb0NBQW9DO0FBRTVELFNBQW9DQyxVQUFVLEVBQUVDLDBCQUEwQixFQUFFQyxPQUFPLEVBQWtCQyxhQUFhLEVBQXVCQyxnQkFBZ0IsRUFBcUJDLElBQUksRUFBZUMsU0FBUyxFQUFFQyxTQUFTLFFBQWtDLDhCQUE4QjtBQUNyUixPQUFP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