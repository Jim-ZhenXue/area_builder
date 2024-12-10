// Copyright 2016-2024, University of Colorado Boulder
/**
 * A Node that will align child (content) Node within a specific bounding box.
 *
 * If a custom alignBounds is provided, content will be aligned within that bounding box. Otherwise, it will be aligned
 * within a bounding box with the left-top corner of (0,0) of the necessary size to include both the content and
 * all the margins.
 *
 * Preferred sizes will set the alignBounds (to a minimum x/y of 0, and a maximum x/y of preferredWidth/preferredHeight)
 *
 * If alignBounds or a specific preferred size have not been set yet, the AlignBox will not adjust things on that
 * dimension.
 *
 * There are four margins: left, right, top, bottom. They can be set independently, or multiple can be set at the
 * same time (xMargin, yMargin and margin).
 *
 * AlignBox will only adjust the preferred size of its content if:
 * 1. The align for the axis is 'stretch'
 * 2. The content is sizable for that axis
 * Additionally, if the above is true and there is an associated AlignGroup, the minimum size of the content will be
 * used to compute the AlignGroup's size (instead of current counts).
 *
 * NOTE: AlignBox resize may not happen immediately, and may be delayed until bounds of a alignBox's child occurs.
 *       layout updates can be forced with invalidateAlignment(). If the alignBox's content that changed is connected
 *       to a Scenery display, its bounds will update when Display.updateDisplay() will called, so this will guarantee
 *       that the layout will be applied before it is displayed. alignBox.getBounds() will not force a refresh, and
 *       may return stale bounds.
 *
 * See https://phetsims.github.io/scenery/doc/layout#AlignBox for details
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Multilink from '../../../../axon/js/Multilink.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import assertMutuallyExclusiveOptions from '../../../../phet-core/js/assertMutuallyExclusiveOptions.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { AlignGroup, assertNoAdditionalChildren, extendsHeightSizable, extendsWidthSizable, isHeightSizable, isWidthSizable, LayoutConstraint, Node, scenery, Sizable } from '../../imports.js';
const ALIGNMENT_CONTAINER_OPTION_KEYS = [
    'alignBounds',
    'align',
    'xAlign',
    'yAlign',
    'margin',
    'xMargin',
    'yMargin',
    'leftMargin',
    'rightMargin',
    'topMargin',
    'bottomMargin',
    'group' // {AlignGroup|null} - Share bounds with others, see setGroup() for more documentation
];
export const AlignBoxXAlignValues = [
    'left',
    'center',
    'right',
    'stretch'
];
export const AlignBoxYAlignValues = [
    'top',
    'center',
    'bottom',
    'stretch'
];
const SuperType = Sizable(Node);
let AlignBox = class AlignBox extends SuperType {
    /**
   * Triggers recomputation of the alignment. Should be called if it needs to be refreshed.
   *
   * NOTE: alignBox.getBounds() will not trigger a bounds validation for our content, and thus WILL NOT trigger
   * layout. content.getBounds() should trigger it, but invalidateAligment() is the preferred method for forcing a
   * re-check.
   */ invalidateAlignment() {
        sceneryLog && sceneryLog.AlignBox && sceneryLog.AlignBox(`AlignBox#${this.id} invalidateAlignment`);
        sceneryLog && sceneryLog.AlignBox && sceneryLog.push();
        // The group update will change our alignBounds if required.
        if (this._group) {
            this._group.onAlignBoxResized(this);
        }
        // If the alignBounds didn't change, we'll still need to update our own layout
        this.constraint.updateLayout();
        sceneryLog && sceneryLog.AlignBox && sceneryLog.pop();
    }
    /**
   * Sets the alignment bounds (the bounds in which our content will be aligned). If null, AlignBox will act
   * as if the alignment bounds have a left-top corner of (0,0) and with a width/height that fits the content and
   * bounds.
   *
   * NOTE: If the group is a valid AlignGroup, it will be responsible for setting the alignBounds.
   */ setAlignBounds(alignBounds) {
        assert && assert(alignBounds === null || alignBounds instanceof Bounds2 && !alignBounds.isEmpty() && alignBounds.isFinite(), 'alignBounds should be a non-empty finite Bounds2');
        this._xSet = true;
        this._ySet = true;
        // See if the bounds have changed. If both are Bounds2 with the same value, we won't update it.
        if (this._alignBounds !== alignBounds && (!alignBounds || !this._alignBounds || !alignBounds.equals(this._alignBounds))) {
            this._alignBounds = alignBounds;
            this.constraint.updateLayout();
        }
        return this;
    }
    set alignBounds(value) {
        this.setAlignBounds(value);
    }
    get alignBounds() {
        return this.getAlignBounds();
    }
    /**
   * Returns the current alignment bounds (if available, see setAlignBounds for details).
   */ getAlignBounds() {
        return this._alignBounds;
    }
    /**
   * Sets the attachment to an AlignGroup. When attached, our alignBounds will be controlled by the group.
   */ setGroup(group) {
        assert && assert(group === null || group instanceof AlignGroup, 'group should be an AlignGroup');
        if (this._group !== group) {
            // Remove from a previous group
            if (this._group) {
                this._group.removeAlignBox(this);
            }
            this._group = group;
            // Add to a new group
            if (this._group) {
                this._group.addAlignBox(this);
            }
        }
        return this;
    }
    set group(value) {
        this.setGroup(value);
    }
    get group() {
        return this.getGroup();
    }
    /**
   * Returns the attached alignment group (if one exists), or null otherwise.
   */ getGroup() {
        return this._group;
    }
    /**
   * Sets the horizontal alignment of this box.
   */ setXAlign(xAlign) {
        assert && assert(AlignBoxXAlignValues.includes(xAlign), `xAlign should be one of: ${AlignBoxXAlignValues}`);
        if (this._xAlign !== xAlign) {
            this._xAlign = xAlign;
            // Trigger re-layout
            this.invalidateAlignment();
        }
        return this;
    }
    set xAlign(value) {
        this.setXAlign(value);
    }
    get xAlign() {
        return this.getXAlign();
    }
    /**
   * Returns the current horizontal alignment of this box.
   */ getXAlign() {
        return this._xAlign;
    }
    /**
   * Sets the vertical alignment of this box.
   */ setYAlign(yAlign) {
        assert && assert(AlignBoxYAlignValues.includes(yAlign), `xAlign should be one of: ${AlignBoxYAlignValues}`);
        if (this._yAlign !== yAlign) {
            this._yAlign = yAlign;
            // Trigger re-layout
            this.invalidateAlignment();
        }
        return this;
    }
    set yAlign(value) {
        this.setYAlign(value);
    }
    get yAlign() {
        return this.getYAlign();
    }
    /**
   * Returns the current vertical alignment of this box.
   */ getYAlign() {
        return this._yAlign;
    }
    getAlign() {
        assert && assert(this._xAlign === this._yAlign);
        return this._xAlign;
    }
    setAlign(value) {
        this.setXAlign(value);
        this.setYAlign(value);
        return this;
    }
    get align() {
        return this.getAlign();
    }
    set align(value) {
        this.setAlign(value);
    }
    /**
   * Sets the margin of this box (setting margin values for all sides at once).
   *
   * This margin is the minimum amount of horizontal space that will exist between the content the sides of this
   * box.
   */ setMargin(margin) {
        assert && assert(isFinite(margin) && margin >= 0, 'margin should be a finite non-negative number');
        if (this._leftMargin !== margin || this._rightMargin !== margin || this._topMargin !== margin || this._bottomMargin !== margin) {
            this._leftMargin = this._rightMargin = this._topMargin = this._bottomMargin = margin;
            // Trigger re-layout
            this.invalidateAlignment();
        }
        return this;
    }
    set margin(value) {
        this.setMargin(value);
    }
    get margin() {
        return this.getMargin();
    }
    /**
   * Returns the current margin of this box (assuming all margin values are the same).
   */ getMargin() {
        assert && assert(this._leftMargin === this._rightMargin && this._leftMargin === this._topMargin && this._leftMargin === this._bottomMargin, 'Getting margin does not have a unique result if the left and right margins are different');
        return this._leftMargin;
    }
    /**
   * Sets the horizontal margin of this box (setting both left and right margins at once).
   *
   * This margin is the minimum amount of horizontal space that will exist between the content and the left and
   * right sides of this box.
   */ setXMargin(xMargin) {
        assert && assert(isFinite(xMargin) && xMargin >= 0, 'xMargin should be a finite non-negative number');
        if (this._leftMargin !== xMargin || this._rightMargin !== xMargin) {
            this._leftMargin = this._rightMargin = xMargin;
            // Trigger re-layout
            this.invalidateAlignment();
        }
        return this;
    }
    set xMargin(value) {
        this.setXMargin(value);
    }
    get xMargin() {
        return this.getXMargin();
    }
    /**
   * Returns the current horizontal margin of this box (assuming the left and right margins are the same).
   */ getXMargin() {
        assert && assert(this._leftMargin === this._rightMargin, 'Getting xMargin does not have a unique result if the left and right margins are different');
        return this._leftMargin;
    }
    /**
   * Sets the vertical margin of this box (setting both top and bottom margins at once).
   *
   * This margin is the minimum amount of vertical space that will exist between the content and the top and
   * bottom sides of this box.
   */ setYMargin(yMargin) {
        assert && assert(isFinite(yMargin) && yMargin >= 0, 'yMargin should be a finite non-negative number');
        if (this._topMargin !== yMargin || this._bottomMargin !== yMargin) {
            this._topMargin = this._bottomMargin = yMargin;
            // Trigger re-layout
            this.invalidateAlignment();
        }
        return this;
    }
    set yMargin(value) {
        this.setYMargin(value);
    }
    get yMargin() {
        return this.getYMargin();
    }
    /**
   * Returns the current vertical margin of this box (assuming the top and bottom margins are the same).
   */ getYMargin() {
        assert && assert(this._topMargin === this._bottomMargin, 'Getting yMargin does not have a unique result if the top and bottom margins are different');
        return this._topMargin;
    }
    /**
   * Sets the left margin of this box.
   *
   * This margin is the minimum amount of horizontal space that will exist between the content and the left side of
   * the box.
   */ setLeftMargin(leftMargin) {
        assert && assert(isFinite(leftMargin) && leftMargin >= 0, 'leftMargin should be a finite non-negative number');
        if (this._leftMargin !== leftMargin) {
            this._leftMargin = leftMargin;
            // Trigger re-layout
            this.invalidateAlignment();
        }
        return this;
    }
    set leftMargin(value) {
        this.setLeftMargin(value);
    }
    get leftMargin() {
        return this.getLeftMargin();
    }
    /**
   * Returns the current left margin of this box.
   */ getLeftMargin() {
        return this._leftMargin;
    }
    /**
   * Sets the right margin of this box.
   *
   * This margin is the minimum amount of horizontal space that will exist between the content and the right side of
   * the container.
   */ setRightMargin(rightMargin) {
        assert && assert(isFinite(rightMargin) && rightMargin >= 0, 'rightMargin should be a finite non-negative number');
        if (this._rightMargin !== rightMargin) {
            this._rightMargin = rightMargin;
            // Trigger re-layout
            this.invalidateAlignment();
        }
        return this;
    }
    set rightMargin(value) {
        this.setRightMargin(value);
    }
    get rightMargin() {
        return this.getRightMargin();
    }
    /**
   * Returns the current right margin of this box.
   */ getRightMargin() {
        return this._rightMargin;
    }
    /**
   * Sets the top margin of this box.
   *
   * This margin is the minimum amount of vertical space that will exist between the content and the top side of the
   * container.
   */ setTopMargin(topMargin) {
        assert && assert(isFinite(topMargin) && topMargin >= 0, 'topMargin should be a finite non-negative number');
        if (this._topMargin !== topMargin) {
            this._topMargin = topMargin;
            // Trigger re-layout
            this.invalidateAlignment();
        }
        return this;
    }
    set topMargin(value) {
        this.setTopMargin(value);
    }
    get topMargin() {
        return this.getTopMargin();
    }
    /**
   * Returns the current top margin of this box.
   */ getTopMargin() {
        return this._topMargin;
    }
    /**
   * Sets the bottom margin of this box.
   *
   * This margin is the minimum amount of vertical space that will exist between the content and the bottom side of the
   * container.
   */ setBottomMargin(bottomMargin) {
        assert && assert(isFinite(bottomMargin) && bottomMargin >= 0, 'bottomMargin should be a finite non-negative number');
        if (this._bottomMargin !== bottomMargin) {
            this._bottomMargin = bottomMargin;
            // Trigger re-layout
            this.invalidateAlignment();
        }
        return this;
    }
    set bottomMargin(value) {
        this.setBottomMargin(value);
    }
    get bottomMargin() {
        return this.getBottomMargin();
    }
    /**
   * Returns the current bottom margin of this box.
   */ getBottomMargin() {
        return this._bottomMargin;
    }
    getContent() {
        return this._content;
    }
    get content() {
        return this.getContent();
    }
    /**
   * Returns the bounding box of this box's content. This will include any margins.
   */ getContentBounds() {
        sceneryLog && sceneryLog.AlignBox && sceneryLog.AlignBox(`AlignBox#${this.id} getContentBounds`);
        sceneryLog && sceneryLog.AlignBox && sceneryLog.push();
        const bounds = this._content.bounds;
        sceneryLog && sceneryLog.AlignBox && sceneryLog.pop();
        return new Bounds2(bounds.left - this._leftMargin, bounds.top - this._topMargin, bounds.right + this._rightMargin, bounds.bottom + this._bottomMargin);
    }
    getMinimumWidth() {
        var _this__content_minimumWidth;
        const contentWidth = this._xAlign === 'stretch' && isWidthSizable(this._content) ? (_this__content_minimumWidth = this._content.minimumWidth) != null ? _this__content_minimumWidth : 0 : this._content.width;
        return contentWidth + this._leftMargin + this._rightMargin;
    }
    getMinimumHeight() {
        var _this__content_minimumHeight;
        const contentHeight = this._yAlign === 'stretch' && isHeightSizable(this._content) ? (_this__content_minimumHeight = this._content.minimumHeight) != null ? _this__content_minimumHeight : 0 : this._content.height;
        return contentHeight + this._topMargin + this._bottomMargin;
    }
    // scenery-internal, designed so that we can ignore adjusting certain dimensions
    setAdjustedLocalBounds(bounds) {
        if (this._xSet && this._ySet) {
            this.localBounds = bounds;
        } else if (this._xSet) {
            const contentBounds = this.getContentBounds();
            this.localBounds = new Bounds2(bounds.minX, contentBounds.minY, bounds.maxX, contentBounds.maxY);
        } else if (this._ySet) {
            const contentBounds = this.getContentBounds();
            this.localBounds = new Bounds2(contentBounds.minX, bounds.minY, contentBounds.maxX, bounds.maxY);
        } else {
            this.localBounds = this.getContentBounds();
        }
    }
    /**
   * Disposes this box, releasing listeners and any references to an AlignGroup
   */ dispose() {
        this._alignBoundsProperty && this._alignBoundsProperty.unlink(this._alignBoundsPropertyListener);
        // Remove our listener
        this._content.boundsProperty.unlink(this._contentBoundsListener);
        if (extendsWidthSizable(this._content)) {
            this._content.minimumWidthProperty.unlink(this._contentBoundsListener);
        }
        if (extendsHeightSizable(this._content)) {
            this._content.minimumHeightProperty.unlink(this._contentBoundsListener);
        }
        this._content = new Node(); // clear the reference for GC
        // Disconnects from the group
        this.group = null;
        this.constraint.dispose();
        super.dispose();
    }
    mutate(options) {
        return super.mutate(options);
    }
    /**
   * An individual container for an alignment group. Will maintain its size to match that of the group by overriding
   * its localBounds, and will position its content inside its localBounds by respecting its alignment and margins.
   *
   * @param content - Content to align inside the alignBox
   * @param [providedOptions] - AlignBox-specific options are documented in ALIGNMENT_CONTAINER_OPTION_KEYS
   *                    above, and can be provided along-side options for Node
   */ constructor(content, providedOptions){
        const options = optionize()({
            children: [
                content
            ]
        }, providedOptions);
        // We'll want to default to sizable:false, but allow clients to pass in something conflicting like widthSizable:true
        // in the super mutate. To avoid the exclusive options, we isolate this out here.
        const initialOptions = {
            // By default, don't set an AlignBox to be resizable, since it's used a lot to block out a certain amount of
            // space.
            sizable: false
        };
        super(initialOptions), // Whether x/y has been set
        this._xSet = false, this._ySet = false, // Callback for when bounds change (takes no arguments)
        // (scenery-internal)
        this._contentBoundsListener = _.noop;
        assert && assert(options === undefined || Object.getPrototypeOf(options) === Object.prototype, 'Extra prototype on Node options object is a code smell');
        this._content = content;
        this._alignBounds = null;
        this._xAlign = 'center';
        this._yAlign = 'center';
        this._leftMargin = 0;
        this._rightMargin = 0;
        this._topMargin = 0;
        this._bottomMargin = 0;
        this._group = null;
        this._contentBoundsListener = this.invalidateAlignment.bind(this);
        this._alignBoundsProperty = null;
        this._alignBoundsPropertyListener = _.noop;
        assertMutuallyExclusiveOptions(options, [
            'alignBounds'
        ], [
            'alignBoundsProperty'
        ]);
        // We will dynamically update alignBounds if an alignBoundsProperty was passed in through options.
        if (providedOptions == null ? void 0 : providedOptions.alignBoundsProperty) {
            this._alignBoundsProperty = providedOptions.alignBoundsProperty;
            // Overrides any possible alignBounds passed in (should not be provided, assertion above).
            options.alignBounds = this._alignBoundsProperty.value;
            this._alignBoundsPropertyListener = (bounds)=>{
                this.alignBounds = bounds;
            };
            this._alignBoundsProperty.lazyLink(this._alignBoundsPropertyListener);
        }
        this.localBounds = new Bounds2(0, 0, 0, 0);
        this.constraint = new AlignBoxConstraint(this, content);
        // Will be removed by dispose()
        this._content.boundsProperty.link(this._contentBoundsListener);
        if (extendsWidthSizable(this._content)) {
            this._content.minimumWidthProperty.link(this._contentBoundsListener);
        }
        if (extendsHeightSizable(this._content)) {
            this._content.minimumHeightProperty.link(this._contentBoundsListener);
        }
        this.mutate(options);
        // Update alignBounds based on preferred sizes
        Multilink.multilink([
            this.localPreferredWidthProperty,
            this.localPreferredHeightProperty
        ], (preferredWidth, preferredHeight)=>{
            if (preferredWidth !== null || preferredHeight !== null) {
                const bounds = this._alignBounds || new Bounds2(0, 0, 0, 0);
                // Overwrite bounds with any preferred setting, with the left/top at 0
                if (preferredWidth) {
                    bounds.minX = 0;
                    bounds.maxX = preferredWidth;
                    this._xSet = true;
                }
                if (preferredHeight) {
                    bounds.minY = 0;
                    bounds.maxY = preferredHeight;
                    this._ySet = true;
                }
                // Manual update and layout
                this._alignBounds = bounds;
                this.constraint.updateLayout();
            }
        });
        // Decorating with additional content is an anti-pattern, see https://github.com/phetsims/sun/issues/860
        assert && assertNoAdditionalChildren(this);
    }
};
export { AlignBox as default };
// Layout logic for AlignBox
let AlignBoxConstraint = class AlignBoxConstraint extends LayoutConstraint {
    /**
   * Conditionally updates a certain property of our content's positioning.
   *
   * Essentially does the following (but prevents infinite loops by not applying changes if the numbers are very
   * similar):
   * this._content[ propName ] = this.localBounds[ propName ] + offset;
   *
   * @param propName - A positional property on both Node and Bounds2, e.g. 'left'
   * @param offset - Offset to be applied to the localBounds location.
   */ updateProperty(propName, offset) {
        const currentValue = this.content[propName];
        const newValue = this.alignBox.localBounds[propName] + offset;
        // Prevent infinite loops or stack overflows by ignoring tiny changes
        if (Math.abs(currentValue - newValue) > 1e-5) {
            this.content[propName] = newValue;
        }
    }
    layout() {
        super.layout();
        const box = this.alignBox;
        const content = this.content;
        sceneryLog && sceneryLog.AlignBox && sceneryLog.AlignBox(`AlignBoxConstraint#${this.alignBox.id} layout`);
        sceneryLog && sceneryLog.AlignBox && sceneryLog.push();
        if (!content.bounds.isValid()) {
            return;
        }
        const totalXMargins = box.leftMargin + box.rightMargin;
        const totalYMargins = box.topMargin + box.bottomMargin;
        // If we have alignBounds, use that.
        if (box.alignBounds !== null) {
            box.setAdjustedLocalBounds(box.alignBounds);
        } else {
            const widthWithMargin = content.width + totalXMargins;
            const heightWithMargin = content.height + totalYMargins;
            box.setAdjustedLocalBounds(new Bounds2(0, 0, widthWithMargin, heightWithMargin));
        }
        const minimumWidth = isFinite(content.width) ? (isWidthSizable(content) ? content.minimumWidth || 0 : content.width) + totalXMargins : null;
        const minimumHeight = isFinite(content.height) ? (isHeightSizable(content) ? content.minimumHeight || 0 : content.height) + totalYMargins : null;
        // Don't try to lay out empty bounds
        if (!content.localBounds.isEmpty()) {
            if (box.xAlign === 'center') {
                this.updateProperty('centerX', (box.leftMargin - box.rightMargin) / 2);
            } else if (box.xAlign === 'left') {
                this.updateProperty('left', box.leftMargin);
            } else if (box.xAlign === 'right') {
                this.updateProperty('right', -box.rightMargin);
            } else if (box.xAlign === 'stretch') {
                assert && assert(isWidthSizable(content), 'xAlign:stretch can only be used if WidthSizable is mixed into the content');
                content.preferredWidth = box.localWidth - box.leftMargin - box.rightMargin;
                this.updateProperty('left', box.leftMargin);
            } else {
                assert && assert(`Bad xAlign: ${box.xAlign}`);
            }
            if (box.yAlign === 'center') {
                this.updateProperty('centerY', (box.topMargin - box.bottomMargin) / 2);
            } else if (box.yAlign === 'top') {
                this.updateProperty('top', box.topMargin);
            } else if (box.yAlign === 'bottom') {
                this.updateProperty('bottom', -box.bottomMargin);
            } else if (box.yAlign === 'stretch') {
                assert && assert(isHeightSizable(content), 'yAlign:stretch can only be used if HeightSizable is mixed into the content');
                content.preferredHeight = box.localHeight - box.topMargin - box.bottomMargin;
                this.updateProperty('top', box.topMargin);
            } else {
                assert && assert(`Bad yAlign: ${box.yAlign}`);
            }
        }
        sceneryLog && sceneryLog.AlignBox && sceneryLog.pop();
        // After the layout lock on purpose (we want these to be reentrant, especially if they change) - however only apply
        // this concept if we're capable of shrinking (we want the default to continue to block off the layoutBounds)
        box.localMinimumWidth = box.widthSizable ? minimumWidth : box.localWidth;
        box.localMinimumHeight = box.heightSizable ? minimumHeight : box.localHeight;
    }
    constructor(alignBox, content){
        super(alignBox);
        this.alignBox = alignBox;
        this.content = content;
        this.addNode(content);
        alignBox.isWidthResizableProperty.lazyLink(this._updateLayoutListener);
        alignBox.isHeightResizableProperty.lazyLink(this._updateLayoutListener);
    }
};
/**
 * {Array.<string>} - String keys for all of the allowed options that will be set by node.mutate( options ), in the
 * order they will be evaluated in.
 *
 * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
 *       cases that may apply.
 */ AlignBox.prototype._mutatorKeys = ALIGNMENT_CONTAINER_OPTION_KEYS.concat(SuperType.prototype._mutatorKeys);
scenery.register('AlignBox', AlignBox);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGF5b3V0L25vZGVzL0FsaWduQm94LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgTm9kZSB0aGF0IHdpbGwgYWxpZ24gY2hpbGQgKGNvbnRlbnQpIE5vZGUgd2l0aGluIGEgc3BlY2lmaWMgYm91bmRpbmcgYm94LlxuICpcbiAqIElmIGEgY3VzdG9tIGFsaWduQm91bmRzIGlzIHByb3ZpZGVkLCBjb250ZW50IHdpbGwgYmUgYWxpZ25lZCB3aXRoaW4gdGhhdCBib3VuZGluZyBib3guIE90aGVyd2lzZSwgaXQgd2lsbCBiZSBhbGlnbmVkXG4gKiB3aXRoaW4gYSBib3VuZGluZyBib3ggd2l0aCB0aGUgbGVmdC10b3AgY29ybmVyIG9mICgwLDApIG9mIHRoZSBuZWNlc3Nhcnkgc2l6ZSB0byBpbmNsdWRlIGJvdGggdGhlIGNvbnRlbnQgYW5kXG4gKiBhbGwgdGhlIG1hcmdpbnMuXG4gKlxuICogUHJlZmVycmVkIHNpemVzIHdpbGwgc2V0IHRoZSBhbGlnbkJvdW5kcyAodG8gYSBtaW5pbXVtIHgveSBvZiAwLCBhbmQgYSBtYXhpbXVtIHgveSBvZiBwcmVmZXJyZWRXaWR0aC9wcmVmZXJyZWRIZWlnaHQpXG4gKlxuICogSWYgYWxpZ25Cb3VuZHMgb3IgYSBzcGVjaWZpYyBwcmVmZXJyZWQgc2l6ZSBoYXZlIG5vdCBiZWVuIHNldCB5ZXQsIHRoZSBBbGlnbkJveCB3aWxsIG5vdCBhZGp1c3QgdGhpbmdzIG9uIHRoYXRcbiAqIGRpbWVuc2lvbi5cbiAqXG4gKiBUaGVyZSBhcmUgZm91ciBtYXJnaW5zOiBsZWZ0LCByaWdodCwgdG9wLCBib3R0b20uIFRoZXkgY2FuIGJlIHNldCBpbmRlcGVuZGVudGx5LCBvciBtdWx0aXBsZSBjYW4gYmUgc2V0IGF0IHRoZVxuICogc2FtZSB0aW1lICh4TWFyZ2luLCB5TWFyZ2luIGFuZCBtYXJnaW4pLlxuICpcbiAqIEFsaWduQm94IHdpbGwgb25seSBhZGp1c3QgdGhlIHByZWZlcnJlZCBzaXplIG9mIGl0cyBjb250ZW50IGlmOlxuICogMS4gVGhlIGFsaWduIGZvciB0aGUgYXhpcyBpcyAnc3RyZXRjaCdcbiAqIDIuIFRoZSBjb250ZW50IGlzIHNpemFibGUgZm9yIHRoYXQgYXhpc1xuICogQWRkaXRpb25hbGx5LCBpZiB0aGUgYWJvdmUgaXMgdHJ1ZSBhbmQgdGhlcmUgaXMgYW4gYXNzb2NpYXRlZCBBbGlnbkdyb3VwLCB0aGUgbWluaW11bSBzaXplIG9mIHRoZSBjb250ZW50IHdpbGwgYmVcbiAqIHVzZWQgdG8gY29tcHV0ZSB0aGUgQWxpZ25Hcm91cCdzIHNpemUgKGluc3RlYWQgb2YgY3VycmVudCBjb3VudHMpLlxuICpcbiAqIE5PVEU6IEFsaWduQm94IHJlc2l6ZSBtYXkgbm90IGhhcHBlbiBpbW1lZGlhdGVseSwgYW5kIG1heSBiZSBkZWxheWVkIHVudGlsIGJvdW5kcyBvZiBhIGFsaWduQm94J3MgY2hpbGQgb2NjdXJzLlxuICogICAgICAgbGF5b3V0IHVwZGF0ZXMgY2FuIGJlIGZvcmNlZCB3aXRoIGludmFsaWRhdGVBbGlnbm1lbnQoKS4gSWYgdGhlIGFsaWduQm94J3MgY29udGVudCB0aGF0IGNoYW5nZWQgaXMgY29ubmVjdGVkXG4gKiAgICAgICB0byBhIFNjZW5lcnkgZGlzcGxheSwgaXRzIGJvdW5kcyB3aWxsIHVwZGF0ZSB3aGVuIERpc3BsYXkudXBkYXRlRGlzcGxheSgpIHdpbGwgY2FsbGVkLCBzbyB0aGlzIHdpbGwgZ3VhcmFudGVlXG4gKiAgICAgICB0aGF0IHRoZSBsYXlvdXQgd2lsbCBiZSBhcHBsaWVkIGJlZm9yZSBpdCBpcyBkaXNwbGF5ZWQuIGFsaWduQm94LmdldEJvdW5kcygpIHdpbGwgbm90IGZvcmNlIGEgcmVmcmVzaCwgYW5kXG4gKiAgICAgICBtYXkgcmV0dXJuIHN0YWxlIGJvdW5kcy5cbiAqXG4gKiBTZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0FsaWduQm94IGZvciBkZXRhaWxzXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IGFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zLmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IHsgQWxpZ25Hcm91cCwgYXNzZXJ0Tm9BZGRpdGlvbmFsQ2hpbGRyZW4sIGV4dGVuZHNIZWlnaHRTaXphYmxlLCBleHRlbmRzV2lkdGhTaXphYmxlLCBIZWlnaHRTaXphYmxlTm9kZSwgaXNIZWlnaHRTaXphYmxlLCBpc1dpZHRoU2l6YWJsZSwgTGF5b3V0Q29uc3RyYWludCwgTm9kZSwgTm9kZU9wdGlvbnMsIHNjZW5lcnksIFNpemFibGUsIFNpemFibGVPcHRpb25zLCBXaWR0aFNpemFibGVOb2RlIH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XG5cbmNvbnN0IEFMSUdOTUVOVF9DT05UQUlORVJfT1BUSU9OX0tFWVMgPSBbXG4gICdhbGlnbkJvdW5kcycsIC8vIHtCb3VuZHMyfG51bGx9IC0gU2VlIHNldEFsaWduQm91bmRzKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuICAnYWxpZ24nLCAvLyB7c3RyaW5nfSAtIFNldHMgYWxsIGFsaWducywgb25seSAnY2VudGVyJyBhbmQgJ3N0cmV0Y2gnXG4gICd4QWxpZ24nLCAvLyB7c3RyaW5nfSAtICdsZWZ0JywgJ2NlbnRlcicsICdyaWdodCcgb3IgJ3N0cmV0Y2gnLCBzZWUgc2V0WEFsaWduKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuICAneUFsaWduJywgLy8ge3N0cmluZ30gLSAndG9wJywgJ2NlbnRlcicsICdib3R0b20nIG9yICdzdHJldGNoJywgc2VlIHNldFlBbGlnbigpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgJ21hcmdpbicsIC8vIHtudW1iZXJ9IC0gU2V0cyBhbGwgbWFyZ2lucywgc2VlIHNldE1hcmdpbigpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgJ3hNYXJnaW4nLCAvLyB7bnVtYmVyfSAtIFNldHMgaG9yaXpvbnRhbCBtYXJnaW5zLCBzZWUgc2V0WE1hcmdpbigpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgJ3lNYXJnaW4nLCAvLyB7bnVtYmVyfSAtIFNldHMgdmVydGljYWwgbWFyZ2lucywgc2VlIHNldFlNYXJnaW4oKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICdsZWZ0TWFyZ2luJywgLy8ge251bWJlcn0gLSBTZXRzIGxlZnQgbWFyZ2luLCBzZWUgc2V0TGVmdE1hcmdpbigpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgJ3JpZ2h0TWFyZ2luJywgLy8ge251bWJlcn0gLSBTZXRzIHJpZ2h0IG1hcmdpbiwgc2VlIHNldFJpZ2h0TWFyZ2luKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuICAndG9wTWFyZ2luJywgLy8ge251bWJlcn0gLSBTZXRzIHRvcCBtYXJnaW4sIHNlZSBzZXRUb3BNYXJnaW4oKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICdib3R0b21NYXJnaW4nLCAvLyB7bnVtYmVyfSAtIFNldHMgYm90dG9tIG1hcmdpbiwgc2VlIHNldEJvdHRvbU1hcmdpbigpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgJ2dyb3VwJyAvLyB7QWxpZ25Hcm91cHxudWxsfSAtIFNoYXJlIGJvdW5kcyB3aXRoIG90aGVycywgc2VlIHNldEdyb3VwKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuXTtcblxuZXhwb3J0IGNvbnN0IEFsaWduQm94WEFsaWduVmFsdWVzID0gWyAnbGVmdCcsICdjZW50ZXInLCAncmlnaHQnLCAnc3RyZXRjaCcgXSBhcyBjb25zdDtcbmV4cG9ydCB0eXBlIEFsaWduQm94WEFsaWduID0gKCB0eXBlb2YgQWxpZ25Cb3hYQWxpZ25WYWx1ZXMgKVtudW1iZXJdO1xuXG5leHBvcnQgY29uc3QgQWxpZ25Cb3hZQWxpZ25WYWx1ZXMgPSBbICd0b3AnLCAnY2VudGVyJywgJ2JvdHRvbScsICdzdHJldGNoJyBdIGFzIGNvbnN0O1xuZXhwb3J0IHR5cGUgQWxpZ25Cb3hZQWxpZ24gPSAoIHR5cGVvZiBBbGlnbkJveFlBbGlnblZhbHVlcyApW251bWJlcl07XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIGFsaWduQm91bmRzPzogQm91bmRzMiB8IG51bGw7XG4gIGFsaWduQm91bmRzUHJvcGVydHk/OiBUUmVhZE9ubHlQcm9wZXJ0eTxCb3VuZHMyPjsgLy8gaWYgcGFzc2VkIGluIHdpbGwgb3ZlcnJpZGUgYWxpZ25Cb3VuZHMgb3B0aW9uXG4gIGFsaWduPzogQWxpZ25Cb3hYQWxpZ24gJiBBbGlnbkJveFlBbGlnbjtcbiAgeEFsaWduPzogQWxpZ25Cb3hYQWxpZ247XG4gIHlBbGlnbj86IEFsaWduQm94WUFsaWduO1xuICBtYXJnaW4/OiBudW1iZXI7XG4gIHhNYXJnaW4/OiBudW1iZXI7XG4gIHlNYXJnaW4/OiBudW1iZXI7XG4gIGxlZnRNYXJnaW4/OiBudW1iZXI7XG4gIHJpZ2h0TWFyZ2luPzogbnVtYmVyO1xuICB0b3BNYXJnaW4/OiBudW1iZXI7XG4gIGJvdHRvbU1hcmdpbj86IG51bWJlcjtcbiAgZ3JvdXA/OiBBbGlnbkdyb3VwIHwgbnVsbDtcbn07XG5cbnR5cGUgUGFyZW50T3B0aW9ucyA9IE5vZGVPcHRpb25zICYgU2l6YWJsZU9wdGlvbnM7XG5cbmV4cG9ydCB0eXBlIEFsaWduQm94T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxQYXJlbnRPcHRpb25zLCAnY2hpbGRyZW4nPjtcblxuY29uc3QgU3VwZXJUeXBlID0gU2l6YWJsZSggTm9kZSApO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBbGlnbkJveCBleHRlbmRzIFN1cGVyVHlwZSB7XG5cbiAgLy8gT3VyIGFjdHVhbCBjb250ZW50XG4gIHByaXZhdGUgX2NvbnRlbnQ6IE5vZGU7XG5cbiAgLy8gQ29udHJvbHMgdGhlIGJvdW5kcyBpbiB3aGljaCBjb250ZW50IGlzIGFsaWduZWQuXG4gIHByaXZhdGUgX2FsaWduQm91bmRzOiBCb3VuZHMyIHwgbnVsbDtcblxuICAvLyBXaGV0aGVyIHgveSBoYXMgYmVlbiBzZXRcbiAgcHJpdmF0ZSBfeFNldCA9IGZhbHNlO1xuICBwcml2YXRlIF95U2V0ID0gZmFsc2U7XG5cbiAgLy8gSG93IHRvIGFsaWduIHRoZSBjb250ZW50IHdoZW4gdGhlIGFsaWduQm91bmRzIGFyZSBsYXJnZXIgdGhhbiBvdXIgY29udGVudCB3aXRoIGl0cyBtYXJnaW5zLlxuICBwcml2YXRlIF94QWxpZ246IEFsaWduQm94WEFsaWduO1xuICBwcml2YXRlIF95QWxpZ246IEFsaWduQm94WUFsaWduO1xuXG4gIC8vIEhvdyBtdWNoIHNwYWNlIHNob3VsZCBiZSBvbiBlYWNoIHNpZGUuXG4gIHByaXZhdGUgX2xlZnRNYXJnaW46IG51bWJlcjtcbiAgcHJpdmF0ZSBfcmlnaHRNYXJnaW46IG51bWJlcjtcbiAgcHJpdmF0ZSBfdG9wTWFyZ2luOiBudW1iZXI7XG4gIHByaXZhdGUgX2JvdHRvbU1hcmdpbjogbnVtYmVyO1xuXG4gIC8vIElmIGF2YWlsYWJsZSwgYW4gQWxpZ25Hcm91cCB0aGF0IHdpbGwgY29udHJvbCBvdXIgYWxpZ25Cb3VuZHNcbiAgcHJpdmF0ZSBfZ3JvdXA6IEFsaWduR3JvdXAgfCBudWxsO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgY29uc3RyYWludDogQWxpZ25Cb3hDb25zdHJhaW50O1xuXG4gIC8vIENhbGxiYWNrIGZvciB3aGVuIGJvdW5kcyBjaGFuZ2UgKHRha2VzIG5vIGFyZ3VtZW50cylcbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXG4gIHB1YmxpYyBfY29udGVudEJvdW5kc0xpc3RlbmVyID0gXy5ub29wO1xuXG4gIC8vIFdpbGwgc3luYyB0aGUgYWxpZ25Cb3VuZHMgdG8gdGhlIHBhc3NlZCBpbiBwcm9wZXJ0eVxuICBwcml2YXRlIHJlYWRvbmx5IF9hbGlnbkJvdW5kc1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxCb3VuZHMyPiB8IG51bGw7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2FsaWduQm91bmRzUHJvcGVydHlMaXN0ZW5lcjogKCBiOiBCb3VuZHMyICkgPT4gdm9pZDtcblxuICAvKipcbiAgICogQW4gaW5kaXZpZHVhbCBjb250YWluZXIgZm9yIGFuIGFsaWdubWVudCBncm91cC4gV2lsbCBtYWludGFpbiBpdHMgc2l6ZSB0byBtYXRjaCB0aGF0IG9mIHRoZSBncm91cCBieSBvdmVycmlkaW5nXG4gICAqIGl0cyBsb2NhbEJvdW5kcywgYW5kIHdpbGwgcG9zaXRpb24gaXRzIGNvbnRlbnQgaW5zaWRlIGl0cyBsb2NhbEJvdW5kcyBieSByZXNwZWN0aW5nIGl0cyBhbGlnbm1lbnQgYW5kIG1hcmdpbnMuXG4gICAqXG4gICAqIEBwYXJhbSBjb250ZW50IC0gQ29udGVudCB0byBhbGlnbiBpbnNpZGUgdGhlIGFsaWduQm94XG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXSAtIEFsaWduQm94LXNwZWNpZmljIG9wdGlvbnMgYXJlIGRvY3VtZW50ZWQgaW4gQUxJR05NRU5UX0NPTlRBSU5FUl9PUFRJT05fS0VZU1xuICAgKiAgICAgICAgICAgICAgICAgICAgYWJvdmUsIGFuZCBjYW4gYmUgcHJvdmlkZWQgYWxvbmctc2lkZSBvcHRpb25zIGZvciBOb2RlXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGNvbnRlbnQ6IE5vZGUsIHByb3ZpZGVkT3B0aW9ucz86IEFsaWduQm94T3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8QWxpZ25Cb3hPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zLCBQYXJlbnRPcHRpb25zPigpKCB7XG4gICAgICBjaGlsZHJlbjogWyBjb250ZW50IF1cbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIC8vIFdlJ2xsIHdhbnQgdG8gZGVmYXVsdCB0byBzaXphYmxlOmZhbHNlLCBidXQgYWxsb3cgY2xpZW50cyB0byBwYXNzIGluIHNvbWV0aGluZyBjb25mbGljdGluZyBsaWtlIHdpZHRoU2l6YWJsZTp0cnVlXG4gICAgLy8gaW4gdGhlIHN1cGVyIG11dGF0ZS4gVG8gYXZvaWQgdGhlIGV4Y2x1c2l2ZSBvcHRpb25zLCB3ZSBpc29sYXRlIHRoaXMgb3V0IGhlcmUuXG4gICAgY29uc3QgaW5pdGlhbE9wdGlvbnM6IEFsaWduQm94T3B0aW9ucyA9IHtcbiAgICAgIC8vIEJ5IGRlZmF1bHQsIGRvbid0IHNldCBhbiBBbGlnbkJveCB0byBiZSByZXNpemFibGUsIHNpbmNlIGl0J3MgdXNlZCBhIGxvdCB0byBibG9jayBvdXQgYSBjZXJ0YWluIGFtb3VudCBvZlxuICAgICAgLy8gc3BhY2UuXG4gICAgICBzaXphYmxlOiBmYWxzZVxuICAgIH07XG4gICAgc3VwZXIoIGluaXRpYWxPcHRpb25zICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zID09PSB1bmRlZmluZWQgfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKCBvcHRpb25zICkgPT09IE9iamVjdC5wcm90b3R5cGUsXG4gICAgICAnRXh0cmEgcHJvdG90eXBlIG9uIE5vZGUgb3B0aW9ucyBvYmplY3QgaXMgYSBjb2RlIHNtZWxsJyApO1xuXG4gICAgdGhpcy5fY29udGVudCA9IGNvbnRlbnQ7XG4gICAgdGhpcy5fYWxpZ25Cb3VuZHMgPSBudWxsO1xuXG4gICAgdGhpcy5feEFsaWduID0gJ2NlbnRlcic7XG4gICAgdGhpcy5feUFsaWduID0gJ2NlbnRlcic7XG4gICAgdGhpcy5fbGVmdE1hcmdpbiA9IDA7XG4gICAgdGhpcy5fcmlnaHRNYXJnaW4gPSAwO1xuICAgIHRoaXMuX3RvcE1hcmdpbiA9IDA7XG4gICAgdGhpcy5fYm90dG9tTWFyZ2luID0gMDtcbiAgICB0aGlzLl9ncm91cCA9IG51bGw7XG4gICAgdGhpcy5fY29udGVudEJvdW5kc0xpc3RlbmVyID0gdGhpcy5pbnZhbGlkYXRlQWxpZ25tZW50LmJpbmQoIHRoaXMgKTtcbiAgICB0aGlzLl9hbGlnbkJvdW5kc1Byb3BlcnR5ID0gbnVsbDtcbiAgICB0aGlzLl9hbGlnbkJvdW5kc1Byb3BlcnR5TGlzdGVuZXIgPSBfLm5vb3A7XG5cbiAgICBhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMoIG9wdGlvbnMsIFsgJ2FsaWduQm91bmRzJyBdLCBbICdhbGlnbkJvdW5kc1Byb3BlcnR5JyBdICk7XG5cbiAgICAvLyBXZSB3aWxsIGR5bmFtaWNhbGx5IHVwZGF0ZSBhbGlnbkJvdW5kcyBpZiBhbiBhbGlnbkJvdW5kc1Byb3BlcnR5IHdhcyBwYXNzZWQgaW4gdGhyb3VnaCBvcHRpb25zLlxuICAgIGlmICggcHJvdmlkZWRPcHRpb25zPy5hbGlnbkJvdW5kc1Byb3BlcnR5ICkge1xuICAgICAgdGhpcy5fYWxpZ25Cb3VuZHNQcm9wZXJ0eSA9IHByb3ZpZGVkT3B0aW9ucy5hbGlnbkJvdW5kc1Byb3BlcnR5O1xuXG4gICAgICAvLyBPdmVycmlkZXMgYW55IHBvc3NpYmxlIGFsaWduQm91bmRzIHBhc3NlZCBpbiAoc2hvdWxkIG5vdCBiZSBwcm92aWRlZCwgYXNzZXJ0aW9uIGFib3ZlKS5cbiAgICAgIG9wdGlvbnMuYWxpZ25Cb3VuZHMgPSB0aGlzLl9hbGlnbkJvdW5kc1Byb3BlcnR5LnZhbHVlO1xuXG4gICAgICB0aGlzLl9hbGlnbkJvdW5kc1Byb3BlcnR5TGlzdGVuZXIgPSAoIGJvdW5kczogQm91bmRzMiApID0+IHsgdGhpcy5hbGlnbkJvdW5kcyA9IGJvdW5kczsgfTtcbiAgICAgIHRoaXMuX2FsaWduQm91bmRzUHJvcGVydHkubGF6eUxpbmsoIHRoaXMuX2FsaWduQm91bmRzUHJvcGVydHlMaXN0ZW5lciApO1xuICAgIH1cblxuICAgIHRoaXMubG9jYWxCb3VuZHMgPSBuZXcgQm91bmRzMiggMCwgMCwgMCwgMCApO1xuXG4gICAgdGhpcy5jb25zdHJhaW50ID0gbmV3IEFsaWduQm94Q29uc3RyYWludCggdGhpcywgY29udGVudCApO1xuXG4gICAgLy8gV2lsbCBiZSByZW1vdmVkIGJ5IGRpc3Bvc2UoKVxuICAgIHRoaXMuX2NvbnRlbnQuYm91bmRzUHJvcGVydHkubGluayggdGhpcy5fY29udGVudEJvdW5kc0xpc3RlbmVyICk7XG4gICAgaWYgKCBleHRlbmRzV2lkdGhTaXphYmxlKCB0aGlzLl9jb250ZW50ICkgKSB7XG4gICAgICB0aGlzLl9jb250ZW50Lm1pbmltdW1XaWR0aFByb3BlcnR5LmxpbmsoIHRoaXMuX2NvbnRlbnRCb3VuZHNMaXN0ZW5lciApO1xuICAgIH1cbiAgICBpZiAoIGV4dGVuZHNIZWlnaHRTaXphYmxlKCB0aGlzLl9jb250ZW50ICkgKSB7XG4gICAgICB0aGlzLl9jb250ZW50Lm1pbmltdW1IZWlnaHRQcm9wZXJ0eS5saW5rKCB0aGlzLl9jb250ZW50Qm91bmRzTGlzdGVuZXIgKTtcbiAgICB9XG5cbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xuXG4gICAgLy8gVXBkYXRlIGFsaWduQm91bmRzIGJhc2VkIG9uIHByZWZlcnJlZCBzaXplc1xuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFsgdGhpcy5sb2NhbFByZWZlcnJlZFdpZHRoUHJvcGVydHksIHRoaXMubG9jYWxQcmVmZXJyZWRIZWlnaHRQcm9wZXJ0eSBdLCAoIHByZWZlcnJlZFdpZHRoLCBwcmVmZXJyZWRIZWlnaHQgKSA9PiB7XG4gICAgICBpZiAoIHByZWZlcnJlZFdpZHRoICE9PSBudWxsIHx8IHByZWZlcnJlZEhlaWdodCAhPT0gbnVsbCApIHtcbiAgICAgICAgY29uc3QgYm91bmRzID0gdGhpcy5fYWxpZ25Cb3VuZHMgfHwgbmV3IEJvdW5kczIoIDAsIDAsIDAsIDAgKTtcblxuICAgICAgICAvLyBPdmVyd3JpdGUgYm91bmRzIHdpdGggYW55IHByZWZlcnJlZCBzZXR0aW5nLCB3aXRoIHRoZSBsZWZ0L3RvcCBhdCAwXG4gICAgICAgIGlmICggcHJlZmVycmVkV2lkdGggKSB7XG4gICAgICAgICAgYm91bmRzLm1pblggPSAwO1xuICAgICAgICAgIGJvdW5kcy5tYXhYID0gcHJlZmVycmVkV2lkdGg7XG4gICAgICAgICAgdGhpcy5feFNldCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCBwcmVmZXJyZWRIZWlnaHQgKSB7XG4gICAgICAgICAgYm91bmRzLm1pblkgPSAwO1xuICAgICAgICAgIGJvdW5kcy5tYXhZID0gcHJlZmVycmVkSGVpZ2h0O1xuICAgICAgICAgIHRoaXMuX3lTZXQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTWFudWFsIHVwZGF0ZSBhbmQgbGF5b3V0XG4gICAgICAgIHRoaXMuX2FsaWduQm91bmRzID0gYm91bmRzO1xuICAgICAgICB0aGlzLmNvbnN0cmFpbnQudXBkYXRlTGF5b3V0KCk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gRGVjb3JhdGluZyB3aXRoIGFkZGl0aW9uYWwgY29udGVudCBpcyBhbiBhbnRpLXBhdHRlcm4sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy84NjBcbiAgICBhc3NlcnQgJiYgYXNzZXJ0Tm9BZGRpdGlvbmFsQ2hpbGRyZW4oIHRoaXMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyByZWNvbXB1dGF0aW9uIG9mIHRoZSBhbGlnbm1lbnQuIFNob3VsZCBiZSBjYWxsZWQgaWYgaXQgbmVlZHMgdG8gYmUgcmVmcmVzaGVkLlxuICAgKlxuICAgKiBOT1RFOiBhbGlnbkJveC5nZXRCb3VuZHMoKSB3aWxsIG5vdCB0cmlnZ2VyIGEgYm91bmRzIHZhbGlkYXRpb24gZm9yIG91ciBjb250ZW50LCBhbmQgdGh1cyBXSUxMIE5PVCB0cmlnZ2VyXG4gICAqIGxheW91dC4gY29udGVudC5nZXRCb3VuZHMoKSBzaG91bGQgdHJpZ2dlciBpdCwgYnV0IGludmFsaWRhdGVBbGlnbWVudCgpIGlzIHRoZSBwcmVmZXJyZWQgbWV0aG9kIGZvciBmb3JjaW5nIGFcbiAgICogcmUtY2hlY2suXG4gICAqL1xuICBwdWJsaWMgaW52YWxpZGF0ZUFsaWdubWVudCgpOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQWxpZ25Cb3ggJiYgc2NlbmVyeUxvZy5BbGlnbkJveCggYEFsaWduQm94IyR7dGhpcy5pZH0gaW52YWxpZGF0ZUFsaWdubWVudGAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQWxpZ25Cb3ggJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBUaGUgZ3JvdXAgdXBkYXRlIHdpbGwgY2hhbmdlIG91ciBhbGlnbkJvdW5kcyBpZiByZXF1aXJlZC5cbiAgICBpZiAoIHRoaXMuX2dyb3VwICkge1xuICAgICAgdGhpcy5fZ3JvdXAub25BbGlnbkJveFJlc2l6ZWQoIHRoaXMgKTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgYWxpZ25Cb3VuZHMgZGlkbid0IGNoYW5nZSwgd2UnbGwgc3RpbGwgbmVlZCB0byB1cGRhdGUgb3VyIG93biBsYXlvdXRcbiAgICB0aGlzLmNvbnN0cmFpbnQudXBkYXRlTGF5b3V0KCk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQWxpZ25Cb3ggJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBhbGlnbm1lbnQgYm91bmRzICh0aGUgYm91bmRzIGluIHdoaWNoIG91ciBjb250ZW50IHdpbGwgYmUgYWxpZ25lZCkuIElmIG51bGwsIEFsaWduQm94IHdpbGwgYWN0XG4gICAqIGFzIGlmIHRoZSBhbGlnbm1lbnQgYm91bmRzIGhhdmUgYSBsZWZ0LXRvcCBjb3JuZXIgb2YgKDAsMCkgYW5kIHdpdGggYSB3aWR0aC9oZWlnaHQgdGhhdCBmaXRzIHRoZSBjb250ZW50IGFuZFxuICAgKiBib3VuZHMuXG4gICAqXG4gICAqIE5PVEU6IElmIHRoZSBncm91cCBpcyBhIHZhbGlkIEFsaWduR3JvdXAsIGl0IHdpbGwgYmUgcmVzcG9uc2libGUgZm9yIHNldHRpbmcgdGhlIGFsaWduQm91bmRzLlxuICAgKi9cbiAgcHVibGljIHNldEFsaWduQm91bmRzKCBhbGlnbkJvdW5kczogQm91bmRzMiB8IG51bGwgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYWxpZ25Cb3VuZHMgPT09IG51bGwgfHwgKCBhbGlnbkJvdW5kcyBpbnN0YW5jZW9mIEJvdW5kczIgJiYgIWFsaWduQm91bmRzLmlzRW1wdHkoKSAmJiBhbGlnbkJvdW5kcy5pc0Zpbml0ZSgpICksXG4gICAgICAnYWxpZ25Cb3VuZHMgc2hvdWxkIGJlIGEgbm9uLWVtcHR5IGZpbml0ZSBCb3VuZHMyJyApO1xuXG4gICAgdGhpcy5feFNldCA9IHRydWU7XG4gICAgdGhpcy5feVNldCA9IHRydWU7XG5cbiAgICAvLyBTZWUgaWYgdGhlIGJvdW5kcyBoYXZlIGNoYW5nZWQuIElmIGJvdGggYXJlIEJvdW5kczIgd2l0aCB0aGUgc2FtZSB2YWx1ZSwgd2Ugd29uJ3QgdXBkYXRlIGl0LlxuICAgIGlmICggdGhpcy5fYWxpZ25Cb3VuZHMgIT09IGFsaWduQm91bmRzICYmXG4gICAgICAgICAoICFhbGlnbkJvdW5kcyB8fFxuICAgICAgICAgICAhdGhpcy5fYWxpZ25Cb3VuZHMgfHxcbiAgICAgICAgICAgIWFsaWduQm91bmRzLmVxdWFscyggdGhpcy5fYWxpZ25Cb3VuZHMgKSApICkge1xuICAgICAgdGhpcy5fYWxpZ25Cb3VuZHMgPSBhbGlnbkJvdW5kcztcblxuICAgICAgdGhpcy5jb25zdHJhaW50LnVwZGF0ZUxheW91dCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIHNldCBhbGlnbkJvdW5kcyggdmFsdWU6IEJvdW5kczIgfCBudWxsICkgeyB0aGlzLnNldEFsaWduQm91bmRzKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBhbGlnbkJvdW5kcygpOiBCb3VuZHMyIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldEFsaWduQm91bmRzKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3VycmVudCBhbGlnbm1lbnQgYm91bmRzIChpZiBhdmFpbGFibGUsIHNlZSBzZXRBbGlnbkJvdW5kcyBmb3IgZGV0YWlscykuXG4gICAqL1xuICBwdWJsaWMgZ2V0QWxpZ25Cb3VuZHMoKTogQm91bmRzMiB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9hbGlnbkJvdW5kcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBhdHRhY2htZW50IHRvIGFuIEFsaWduR3JvdXAuIFdoZW4gYXR0YWNoZWQsIG91ciBhbGlnbkJvdW5kcyB3aWxsIGJlIGNvbnRyb2xsZWQgYnkgdGhlIGdyb3VwLlxuICAgKi9cbiAgcHVibGljIHNldEdyb3VwKCBncm91cDogQWxpZ25Hcm91cCB8IG51bGwgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZ3JvdXAgPT09IG51bGwgfHwgZ3JvdXAgaW5zdGFuY2VvZiBBbGlnbkdyb3VwLCAnZ3JvdXAgc2hvdWxkIGJlIGFuIEFsaWduR3JvdXAnICk7XG5cbiAgICBpZiAoIHRoaXMuX2dyb3VwICE9PSBncm91cCApIHtcbiAgICAgIC8vIFJlbW92ZSBmcm9tIGEgcHJldmlvdXMgZ3JvdXBcbiAgICAgIGlmICggdGhpcy5fZ3JvdXAgKSB7XG4gICAgICAgIHRoaXMuX2dyb3VwLnJlbW92ZUFsaWduQm94KCB0aGlzICk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2dyb3VwID0gZ3JvdXA7XG5cbiAgICAgIC8vIEFkZCB0byBhIG5ldyBncm91cFxuICAgICAgaWYgKCB0aGlzLl9ncm91cCApIHtcbiAgICAgICAgdGhpcy5fZ3JvdXAuYWRkQWxpZ25Cb3goIHRoaXMgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgZ3JvdXAoIHZhbHVlOiBBbGlnbkdyb3VwIHwgbnVsbCApIHsgdGhpcy5zZXRHcm91cCggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgZ3JvdXAoKTogQWxpZ25Hcm91cCB8IG51bGwgeyByZXR1cm4gdGhpcy5nZXRHcm91cCgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGF0dGFjaGVkIGFsaWdubWVudCBncm91cCAoaWYgb25lIGV4aXN0cyksIG9yIG51bGwgb3RoZXJ3aXNlLlxuICAgKi9cbiAgcHVibGljIGdldEdyb3VwKCk6IEFsaWduR3JvdXAgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fZ3JvdXA7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgaG9yaXpvbnRhbCBhbGlnbm1lbnQgb2YgdGhpcyBib3guXG4gICAqL1xuICBwdWJsaWMgc2V0WEFsaWduKCB4QWxpZ246IEFsaWduQm94WEFsaWduICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIEFsaWduQm94WEFsaWduVmFsdWVzLmluY2x1ZGVzKCB4QWxpZ24gKSwgYHhBbGlnbiBzaG91bGQgYmUgb25lIG9mOiAke0FsaWduQm94WEFsaWduVmFsdWVzfWAgKTtcblxuICAgIGlmICggdGhpcy5feEFsaWduICE9PSB4QWxpZ24gKSB7XG4gICAgICB0aGlzLl94QWxpZ24gPSB4QWxpZ247XG5cbiAgICAgIC8vIFRyaWdnZXIgcmUtbGF5b3V0XG4gICAgICB0aGlzLmludmFsaWRhdGVBbGlnbm1lbnQoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeEFsaWduKCB2YWx1ZTogQWxpZ25Cb3hYQWxpZ24gKSB7IHRoaXMuc2V0WEFsaWduKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCB4QWxpZ24oKTogQWxpZ25Cb3hYQWxpZ24geyByZXR1cm4gdGhpcy5nZXRYQWxpZ24oKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IGhvcml6b250YWwgYWxpZ25tZW50IG9mIHRoaXMgYm94LlxuICAgKi9cbiAgcHVibGljIGdldFhBbGlnbigpOiBBbGlnbkJveFhBbGlnbiB7XG4gICAgcmV0dXJuIHRoaXMuX3hBbGlnbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB2ZXJ0aWNhbCBhbGlnbm1lbnQgb2YgdGhpcyBib3guXG4gICAqL1xuICBwdWJsaWMgc2V0WUFsaWduKCB5QWxpZ246IEFsaWduQm94WUFsaWduICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIEFsaWduQm94WUFsaWduVmFsdWVzLmluY2x1ZGVzKCB5QWxpZ24gKSwgYHhBbGlnbiBzaG91bGQgYmUgb25lIG9mOiAke0FsaWduQm94WUFsaWduVmFsdWVzfWAgKTtcblxuICAgIGlmICggdGhpcy5feUFsaWduICE9PSB5QWxpZ24gKSB7XG4gICAgICB0aGlzLl95QWxpZ24gPSB5QWxpZ247XG5cbiAgICAgIC8vIFRyaWdnZXIgcmUtbGF5b3V0XG4gICAgICB0aGlzLmludmFsaWRhdGVBbGlnbm1lbnQoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeUFsaWduKCB2YWx1ZTogQWxpZ25Cb3hZQWxpZ24gKSB7IHRoaXMuc2V0WUFsaWduKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCB5QWxpZ24oKTogQWxpZ25Cb3hZQWxpZ24geyByZXR1cm4gdGhpcy5nZXRZQWxpZ24oKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHZlcnRpY2FsIGFsaWdubWVudCBvZiB0aGlzIGJveC5cbiAgICovXG4gIHB1YmxpYyBnZXRZQWxpZ24oKTogQWxpZ25Cb3hZQWxpZ24ge1xuICAgIHJldHVybiB0aGlzLl95QWxpZ247XG4gIH1cblxuICBwdWJsaWMgZ2V0QWxpZ24oKTogQWxpZ25Cb3hYQWxpZ24gJiBBbGlnbkJveFlBbGlnbiB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5feEFsaWduID09PSB0aGlzLl95QWxpZ24gKTtcblxuICAgIHJldHVybiB0aGlzLl94QWxpZ24gYXMgQWxpZ25Cb3hYQWxpZ24gJiBBbGlnbkJveFlBbGlnbjtcbiAgfVxuXG4gIHB1YmxpYyBzZXRBbGlnbiggdmFsdWU6IEFsaWduQm94WEFsaWduICYgQWxpZ25Cb3hZQWxpZ24gKTogdGhpcyB7XG4gICAgdGhpcy5zZXRYQWxpZ24oIHZhbHVlICk7XG4gICAgdGhpcy5zZXRZQWxpZ24oIHZhbHVlICk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBnZXQgYWxpZ24oKTogQWxpZ25Cb3hYQWxpZ24gJiBBbGlnbkJveFlBbGlnbiB7IHJldHVybiB0aGlzLmdldEFsaWduKCk7IH1cblxuICBwdWJsaWMgc2V0IGFsaWduKCB2YWx1ZTogQWxpZ25Cb3hYQWxpZ24gJiBBbGlnbkJveFlBbGlnbiApIHsgdGhpcy5zZXRBbGlnbiggdmFsdWUgKTsgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBtYXJnaW4gb2YgdGhpcyBib3ggKHNldHRpbmcgbWFyZ2luIHZhbHVlcyBmb3IgYWxsIHNpZGVzIGF0IG9uY2UpLlxuICAgKlxuICAgKiBUaGlzIG1hcmdpbiBpcyB0aGUgbWluaW11bSBhbW91bnQgb2YgaG9yaXpvbnRhbCBzcGFjZSB0aGF0IHdpbGwgZXhpc3QgYmV0d2VlbiB0aGUgY29udGVudCB0aGUgc2lkZXMgb2YgdGhpc1xuICAgKiBib3guXG4gICAqL1xuICBwdWJsaWMgc2V0TWFyZ2luKCBtYXJnaW46IG51bWJlciApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggbWFyZ2luICkgJiYgbWFyZ2luID49IDAsXG4gICAgICAnbWFyZ2luIHNob3VsZCBiZSBhIGZpbml0ZSBub24tbmVnYXRpdmUgbnVtYmVyJyApO1xuXG4gICAgaWYgKCB0aGlzLl9sZWZ0TWFyZ2luICE9PSBtYXJnaW4gfHxcbiAgICAgICAgIHRoaXMuX3JpZ2h0TWFyZ2luICE9PSBtYXJnaW4gfHxcbiAgICAgICAgIHRoaXMuX3RvcE1hcmdpbiAhPT0gbWFyZ2luIHx8XG4gICAgICAgICB0aGlzLl9ib3R0b21NYXJnaW4gIT09IG1hcmdpbiApIHtcbiAgICAgIHRoaXMuX2xlZnRNYXJnaW4gPSB0aGlzLl9yaWdodE1hcmdpbiA9IHRoaXMuX3RvcE1hcmdpbiA9IHRoaXMuX2JvdHRvbU1hcmdpbiA9IG1hcmdpbjtcblxuICAgICAgLy8gVHJpZ2dlciByZS1sYXlvdXRcbiAgICAgIHRoaXMuaW52YWxpZGF0ZUFsaWdubWVudCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIHNldCBtYXJnaW4oIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0TWFyZ2luKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBtYXJnaW4oKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0TWFyZ2luKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3VycmVudCBtYXJnaW4gb2YgdGhpcyBib3ggKGFzc3VtaW5nIGFsbCBtYXJnaW4gdmFsdWVzIGFyZSB0aGUgc2FtZSkuXG4gICAqL1xuICBwdWJsaWMgZ2V0TWFyZ2luKCk6IG51bWJlciB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fbGVmdE1hcmdpbiA9PT0gdGhpcy5fcmlnaHRNYXJnaW4gJiZcbiAgICB0aGlzLl9sZWZ0TWFyZ2luID09PSB0aGlzLl90b3BNYXJnaW4gJiZcbiAgICB0aGlzLl9sZWZ0TWFyZ2luID09PSB0aGlzLl9ib3R0b21NYXJnaW4sXG4gICAgICAnR2V0dGluZyBtYXJnaW4gZG9lcyBub3QgaGF2ZSBhIHVuaXF1ZSByZXN1bHQgaWYgdGhlIGxlZnQgYW5kIHJpZ2h0IG1hcmdpbnMgYXJlIGRpZmZlcmVudCcgKTtcbiAgICByZXR1cm4gdGhpcy5fbGVmdE1hcmdpbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBob3Jpem9udGFsIG1hcmdpbiBvZiB0aGlzIGJveCAoc2V0dGluZyBib3RoIGxlZnQgYW5kIHJpZ2h0IG1hcmdpbnMgYXQgb25jZSkuXG4gICAqXG4gICAqIFRoaXMgbWFyZ2luIGlzIHRoZSBtaW5pbXVtIGFtb3VudCBvZiBob3Jpem9udGFsIHNwYWNlIHRoYXQgd2lsbCBleGlzdCBiZXR3ZWVuIHRoZSBjb250ZW50IGFuZCB0aGUgbGVmdCBhbmRcbiAgICogcmlnaHQgc2lkZXMgb2YgdGhpcyBib3guXG4gICAqL1xuICBwdWJsaWMgc2V0WE1hcmdpbiggeE1hcmdpbjogbnVtYmVyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB4TWFyZ2luICkgJiYgeE1hcmdpbiA+PSAwLFxuICAgICAgJ3hNYXJnaW4gc2hvdWxkIGJlIGEgZmluaXRlIG5vbi1uZWdhdGl2ZSBudW1iZXInICk7XG5cbiAgICBpZiAoIHRoaXMuX2xlZnRNYXJnaW4gIT09IHhNYXJnaW4gfHwgdGhpcy5fcmlnaHRNYXJnaW4gIT09IHhNYXJnaW4gKSB7XG4gICAgICB0aGlzLl9sZWZ0TWFyZ2luID0gdGhpcy5fcmlnaHRNYXJnaW4gPSB4TWFyZ2luO1xuXG4gICAgICAvLyBUcmlnZ2VyIHJlLWxheW91dFxuICAgICAgdGhpcy5pbnZhbGlkYXRlQWxpZ25tZW50KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgc2V0IHhNYXJnaW4oIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0WE1hcmdpbiggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgeE1hcmdpbigpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRYTWFyZ2luKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3VycmVudCBob3Jpem9udGFsIG1hcmdpbiBvZiB0aGlzIGJveCAoYXNzdW1pbmcgdGhlIGxlZnQgYW5kIHJpZ2h0IG1hcmdpbnMgYXJlIHRoZSBzYW1lKS5cbiAgICovXG4gIHB1YmxpYyBnZXRYTWFyZ2luKCk6IG51bWJlciB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fbGVmdE1hcmdpbiA9PT0gdGhpcy5fcmlnaHRNYXJnaW4sXG4gICAgICAnR2V0dGluZyB4TWFyZ2luIGRvZXMgbm90IGhhdmUgYSB1bmlxdWUgcmVzdWx0IGlmIHRoZSBsZWZ0IGFuZCByaWdodCBtYXJnaW5zIGFyZSBkaWZmZXJlbnQnICk7XG4gICAgcmV0dXJuIHRoaXMuX2xlZnRNYXJnaW47XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdmVydGljYWwgbWFyZ2luIG9mIHRoaXMgYm94IChzZXR0aW5nIGJvdGggdG9wIGFuZCBib3R0b20gbWFyZ2lucyBhdCBvbmNlKS5cbiAgICpcbiAgICogVGhpcyBtYXJnaW4gaXMgdGhlIG1pbmltdW0gYW1vdW50IG9mIHZlcnRpY2FsIHNwYWNlIHRoYXQgd2lsbCBleGlzdCBiZXR3ZWVuIHRoZSBjb250ZW50IGFuZCB0aGUgdG9wIGFuZFxuICAgKiBib3R0b20gc2lkZXMgb2YgdGhpcyBib3guXG4gICAqL1xuICBwdWJsaWMgc2V0WU1hcmdpbiggeU1hcmdpbjogbnVtYmVyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB5TWFyZ2luICkgJiYgeU1hcmdpbiA+PSAwLFxuICAgICAgJ3lNYXJnaW4gc2hvdWxkIGJlIGEgZmluaXRlIG5vbi1uZWdhdGl2ZSBudW1iZXInICk7XG5cbiAgICBpZiAoIHRoaXMuX3RvcE1hcmdpbiAhPT0geU1hcmdpbiB8fCB0aGlzLl9ib3R0b21NYXJnaW4gIT09IHlNYXJnaW4gKSB7XG4gICAgICB0aGlzLl90b3BNYXJnaW4gPSB0aGlzLl9ib3R0b21NYXJnaW4gPSB5TWFyZ2luO1xuXG4gICAgICAvLyBUcmlnZ2VyIHJlLWxheW91dFxuICAgICAgdGhpcy5pbnZhbGlkYXRlQWxpZ25tZW50KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgc2V0IHlNYXJnaW4oIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0WU1hcmdpbiggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgeU1hcmdpbigpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRZTWFyZ2luKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3VycmVudCB2ZXJ0aWNhbCBtYXJnaW4gb2YgdGhpcyBib3ggKGFzc3VtaW5nIHRoZSB0b3AgYW5kIGJvdHRvbSBtYXJnaW5zIGFyZSB0aGUgc2FtZSkuXG4gICAqL1xuICBwdWJsaWMgZ2V0WU1hcmdpbigpOiBudW1iZXIge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3RvcE1hcmdpbiA9PT0gdGhpcy5fYm90dG9tTWFyZ2luLFxuICAgICAgJ0dldHRpbmcgeU1hcmdpbiBkb2VzIG5vdCBoYXZlIGEgdW5pcXVlIHJlc3VsdCBpZiB0aGUgdG9wIGFuZCBib3R0b20gbWFyZ2lucyBhcmUgZGlmZmVyZW50JyApO1xuICAgIHJldHVybiB0aGlzLl90b3BNYXJnaW47XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgbGVmdCBtYXJnaW4gb2YgdGhpcyBib3guXG4gICAqXG4gICAqIFRoaXMgbWFyZ2luIGlzIHRoZSBtaW5pbXVtIGFtb3VudCBvZiBob3Jpem9udGFsIHNwYWNlIHRoYXQgd2lsbCBleGlzdCBiZXR3ZWVuIHRoZSBjb250ZW50IGFuZCB0aGUgbGVmdCBzaWRlIG9mXG4gICAqIHRoZSBib3guXG4gICAqL1xuICBwdWJsaWMgc2V0TGVmdE1hcmdpbiggbGVmdE1hcmdpbjogbnVtYmVyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBsZWZ0TWFyZ2luICkgJiYgbGVmdE1hcmdpbiA+PSAwLFxuICAgICAgJ2xlZnRNYXJnaW4gc2hvdWxkIGJlIGEgZmluaXRlIG5vbi1uZWdhdGl2ZSBudW1iZXInICk7XG5cbiAgICBpZiAoIHRoaXMuX2xlZnRNYXJnaW4gIT09IGxlZnRNYXJnaW4gKSB7XG4gICAgICB0aGlzLl9sZWZ0TWFyZ2luID0gbGVmdE1hcmdpbjtcblxuICAgICAgLy8gVHJpZ2dlciByZS1sYXlvdXRcbiAgICAgIHRoaXMuaW52YWxpZGF0ZUFsaWdubWVudCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIHNldCBsZWZ0TWFyZ2luKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldExlZnRNYXJnaW4oIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IGxlZnRNYXJnaW4oKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0TGVmdE1hcmdpbigpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGN1cnJlbnQgbGVmdCBtYXJnaW4gb2YgdGhpcyBib3guXG4gICAqL1xuICBwdWJsaWMgZ2V0TGVmdE1hcmdpbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9sZWZ0TWFyZ2luO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHJpZ2h0IG1hcmdpbiBvZiB0aGlzIGJveC5cbiAgICpcbiAgICogVGhpcyBtYXJnaW4gaXMgdGhlIG1pbmltdW0gYW1vdW50IG9mIGhvcml6b250YWwgc3BhY2UgdGhhdCB3aWxsIGV4aXN0IGJldHdlZW4gdGhlIGNvbnRlbnQgYW5kIHRoZSByaWdodCBzaWRlIG9mXG4gICAqIHRoZSBjb250YWluZXIuXG4gICAqL1xuICBwdWJsaWMgc2V0UmlnaHRNYXJnaW4oIHJpZ2h0TWFyZ2luOiBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHJpZ2h0TWFyZ2luICkgJiYgcmlnaHRNYXJnaW4gPj0gMCxcbiAgICAgICdyaWdodE1hcmdpbiBzaG91bGQgYmUgYSBmaW5pdGUgbm9uLW5lZ2F0aXZlIG51bWJlcicgKTtcblxuICAgIGlmICggdGhpcy5fcmlnaHRNYXJnaW4gIT09IHJpZ2h0TWFyZ2luICkge1xuICAgICAgdGhpcy5fcmlnaHRNYXJnaW4gPSByaWdodE1hcmdpbjtcblxuICAgICAgLy8gVHJpZ2dlciByZS1sYXlvdXRcbiAgICAgIHRoaXMuaW52YWxpZGF0ZUFsaWdubWVudCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIHNldCByaWdodE1hcmdpbiggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRSaWdodE1hcmdpbiggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgcmlnaHRNYXJnaW4oKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0UmlnaHRNYXJnaW4oKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHJpZ2h0IG1hcmdpbiBvZiB0aGlzIGJveC5cbiAgICovXG4gIHB1YmxpYyBnZXRSaWdodE1hcmdpbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9yaWdodE1hcmdpbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB0b3AgbWFyZ2luIG9mIHRoaXMgYm94LlxuICAgKlxuICAgKiBUaGlzIG1hcmdpbiBpcyB0aGUgbWluaW11bSBhbW91bnQgb2YgdmVydGljYWwgc3BhY2UgdGhhdCB3aWxsIGV4aXN0IGJldHdlZW4gdGhlIGNvbnRlbnQgYW5kIHRoZSB0b3Agc2lkZSBvZiB0aGVcbiAgICogY29udGFpbmVyLlxuICAgKi9cbiAgcHVibGljIHNldFRvcE1hcmdpbiggdG9wTWFyZ2luOiBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHRvcE1hcmdpbiApICYmIHRvcE1hcmdpbiA+PSAwLFxuICAgICAgJ3RvcE1hcmdpbiBzaG91bGQgYmUgYSBmaW5pdGUgbm9uLW5lZ2F0aXZlIG51bWJlcicgKTtcblxuICAgIGlmICggdGhpcy5fdG9wTWFyZ2luICE9PSB0b3BNYXJnaW4gKSB7XG4gICAgICB0aGlzLl90b3BNYXJnaW4gPSB0b3BNYXJnaW47XG5cbiAgICAgIC8vIFRyaWdnZXIgcmUtbGF5b3V0XG4gICAgICB0aGlzLmludmFsaWRhdGVBbGlnbm1lbnQoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgdG9wTWFyZ2luKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldFRvcE1hcmdpbiggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgdG9wTWFyZ2luKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldFRvcE1hcmdpbigpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGN1cnJlbnQgdG9wIG1hcmdpbiBvZiB0aGlzIGJveC5cbiAgICovXG4gIHB1YmxpYyBnZXRUb3BNYXJnaW4oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdG9wTWFyZ2luO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGJvdHRvbSBtYXJnaW4gb2YgdGhpcyBib3guXG4gICAqXG4gICAqIFRoaXMgbWFyZ2luIGlzIHRoZSBtaW5pbXVtIGFtb3VudCBvZiB2ZXJ0aWNhbCBzcGFjZSB0aGF0IHdpbGwgZXhpc3QgYmV0d2VlbiB0aGUgY29udGVudCBhbmQgdGhlIGJvdHRvbSBzaWRlIG9mIHRoZVxuICAgKiBjb250YWluZXIuXG4gICAqL1xuICBwdWJsaWMgc2V0Qm90dG9tTWFyZ2luKCBib3R0b21NYXJnaW46IG51bWJlciApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggYm90dG9tTWFyZ2luICkgJiYgYm90dG9tTWFyZ2luID49IDAsXG4gICAgICAnYm90dG9tTWFyZ2luIHNob3VsZCBiZSBhIGZpbml0ZSBub24tbmVnYXRpdmUgbnVtYmVyJyApO1xuXG4gICAgaWYgKCB0aGlzLl9ib3R0b21NYXJnaW4gIT09IGJvdHRvbU1hcmdpbiApIHtcbiAgICAgIHRoaXMuX2JvdHRvbU1hcmdpbiA9IGJvdHRvbU1hcmdpbjtcblxuICAgICAgLy8gVHJpZ2dlciByZS1sYXlvdXRcbiAgICAgIHRoaXMuaW52YWxpZGF0ZUFsaWdubWVudCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIHNldCBib3R0b21NYXJnaW4oIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0Qm90dG9tTWFyZ2luKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBib3R0b21NYXJnaW4oKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0Qm90dG9tTWFyZ2luKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3VycmVudCBib3R0b20gbWFyZ2luIG9mIHRoaXMgYm94LlxuICAgKi9cbiAgcHVibGljIGdldEJvdHRvbU1hcmdpbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9ib3R0b21NYXJnaW47XG4gIH1cblxuICBwdWJsaWMgZ2V0Q29udGVudCgpOiBOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5fY29udGVudDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgY29udGVudCgpOiBOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDb250ZW50KCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYm91bmRpbmcgYm94IG9mIHRoaXMgYm94J3MgY29udGVudC4gVGhpcyB3aWxsIGluY2x1ZGUgYW55IG1hcmdpbnMuXG4gICAqL1xuICBwdWJsaWMgZ2V0Q29udGVudEJvdW5kcygpOiBCb3VuZHMyIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQWxpZ25Cb3ggJiYgc2NlbmVyeUxvZy5BbGlnbkJveCggYEFsaWduQm94IyR7dGhpcy5pZH0gZ2V0Q29udGVudEJvdW5kc2AgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQWxpZ25Cb3ggJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICBjb25zdCBib3VuZHMgPSB0aGlzLl9jb250ZW50LmJvdW5kcztcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5BbGlnbkJveCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuXG4gICAgcmV0dXJuIG5ldyBCb3VuZHMyKCBib3VuZHMubGVmdCAtIHRoaXMuX2xlZnRNYXJnaW4sXG4gICAgICBib3VuZHMudG9wIC0gdGhpcy5fdG9wTWFyZ2luLFxuICAgICAgYm91bmRzLnJpZ2h0ICsgdGhpcy5fcmlnaHRNYXJnaW4sXG4gICAgICBib3VuZHMuYm90dG9tICsgdGhpcy5fYm90dG9tTWFyZ2luICk7XG4gIH1cblxuICBwdWJsaWMgZ2V0TWluaW11bVdpZHRoKCk6IG51bWJlciB7XG4gICAgY29uc3QgY29udGVudFdpZHRoID0gdGhpcy5feEFsaWduID09PSAnc3RyZXRjaCcgJiYgaXNXaWR0aFNpemFibGUoIHRoaXMuX2NvbnRlbnQgKSA/ICggdGhpcy5fY29udGVudC5taW5pbXVtV2lkdGggPz8gMCApIDogdGhpcy5fY29udGVudC53aWR0aDtcblxuICAgIHJldHVybiBjb250ZW50V2lkdGggKyB0aGlzLl9sZWZ0TWFyZ2luICsgdGhpcy5fcmlnaHRNYXJnaW47XG4gIH1cblxuICBwdWJsaWMgZ2V0TWluaW11bUhlaWdodCgpOiBudW1iZXIge1xuICAgIGNvbnN0IGNvbnRlbnRIZWlnaHQgPSB0aGlzLl95QWxpZ24gPT09ICdzdHJldGNoJyAmJiBpc0hlaWdodFNpemFibGUoIHRoaXMuX2NvbnRlbnQgKSA/ICggdGhpcy5fY29udGVudC5taW5pbXVtSGVpZ2h0ID8/IDAgKSA6IHRoaXMuX2NvbnRlbnQuaGVpZ2h0O1xuXG4gICAgcmV0dXJuIGNvbnRlbnRIZWlnaHQgKyB0aGlzLl90b3BNYXJnaW4gKyB0aGlzLl9ib3R0b21NYXJnaW47XG4gIH1cblxuICAvLyBzY2VuZXJ5LWludGVybmFsLCBkZXNpZ25lZCBzbyB0aGF0IHdlIGNhbiBpZ25vcmUgYWRqdXN0aW5nIGNlcnRhaW4gZGltZW5zaW9uc1xuICBwdWJsaWMgc2V0QWRqdXN0ZWRMb2NhbEJvdW5kcyggYm91bmRzOiBCb3VuZHMyICk6IHZvaWQge1xuICAgIGlmICggdGhpcy5feFNldCAmJiB0aGlzLl95U2V0ICkge1xuICAgICAgdGhpcy5sb2NhbEJvdW5kcyA9IGJvdW5kcztcbiAgICB9XG4gICAgZWxzZSBpZiAoIHRoaXMuX3hTZXQgKSB7XG4gICAgICBjb25zdCBjb250ZW50Qm91bmRzID0gdGhpcy5nZXRDb250ZW50Qm91bmRzKCk7XG5cbiAgICAgIHRoaXMubG9jYWxCb3VuZHMgPSBuZXcgQm91bmRzMiggYm91bmRzLm1pblgsIGNvbnRlbnRCb3VuZHMubWluWSwgYm91bmRzLm1heFgsIGNvbnRlbnRCb3VuZHMubWF4WSApO1xuICAgIH1cbiAgICBlbHNlIGlmICggdGhpcy5feVNldCApIHtcbiAgICAgIGNvbnN0IGNvbnRlbnRCb3VuZHMgPSB0aGlzLmdldENvbnRlbnRCb3VuZHMoKTtcblxuICAgICAgdGhpcy5sb2NhbEJvdW5kcyA9IG5ldyBCb3VuZHMyKCBjb250ZW50Qm91bmRzLm1pblgsIGJvdW5kcy5taW5ZLCBjb250ZW50Qm91bmRzLm1heFgsIGJvdW5kcy5tYXhZICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5sb2NhbEJvdW5kcyA9IHRoaXMuZ2V0Q29udGVudEJvdW5kcygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwb3NlcyB0aGlzIGJveCwgcmVsZWFzaW5nIGxpc3RlbmVycyBhbmQgYW55IHJlZmVyZW5jZXMgdG8gYW4gQWxpZ25Hcm91cFxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG5cbiAgICB0aGlzLl9hbGlnbkJvdW5kc1Byb3BlcnR5ICYmIHRoaXMuX2FsaWduQm91bmRzUHJvcGVydHkudW5saW5rKCB0aGlzLl9hbGlnbkJvdW5kc1Byb3BlcnR5TGlzdGVuZXIgKTtcblxuICAgIC8vIFJlbW92ZSBvdXIgbGlzdGVuZXJcbiAgICB0aGlzLl9jb250ZW50LmJvdW5kc1Byb3BlcnR5LnVubGluayggdGhpcy5fY29udGVudEJvdW5kc0xpc3RlbmVyICk7XG4gICAgaWYgKCBleHRlbmRzV2lkdGhTaXphYmxlKCB0aGlzLl9jb250ZW50ICkgKSB7XG4gICAgICB0aGlzLl9jb250ZW50Lm1pbmltdW1XaWR0aFByb3BlcnR5LnVubGluayggdGhpcy5fY29udGVudEJvdW5kc0xpc3RlbmVyICk7XG4gICAgfVxuICAgIGlmICggZXh0ZW5kc0hlaWdodFNpemFibGUoIHRoaXMuX2NvbnRlbnQgKSApIHtcbiAgICAgIHRoaXMuX2NvbnRlbnQubWluaW11bUhlaWdodFByb3BlcnR5LnVubGluayggdGhpcy5fY29udGVudEJvdW5kc0xpc3RlbmVyICk7XG4gICAgfVxuICAgIHRoaXMuX2NvbnRlbnQgPSBuZXcgTm9kZSgpOyAvLyBjbGVhciB0aGUgcmVmZXJlbmNlIGZvciBHQ1xuXG4gICAgLy8gRGlzY29ubmVjdHMgZnJvbSB0aGUgZ3JvdXBcbiAgICB0aGlzLmdyb3VwID0gbnVsbDtcblxuICAgIHRoaXMuY29uc3RyYWludC5kaXNwb3NlKCk7XG5cbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgbXV0YXRlKCBvcHRpb25zPzogQWxpZ25Cb3hPcHRpb25zICk6IHRoaXMge1xuICAgIHJldHVybiBzdXBlci5tdXRhdGUoIG9wdGlvbnMgKTtcbiAgfVxufVxuXG4vLyBMYXlvdXQgbG9naWMgZm9yIEFsaWduQm94XG5jbGFzcyBBbGlnbkJveENvbnN0cmFpbnQgZXh0ZW5kcyBMYXlvdXRDb25zdHJhaW50IHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGFsaWduQm94OiBBbGlnbkJveDtcbiAgcHJpdmF0ZSByZWFkb25seSBjb250ZW50OiBOb2RlO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYWxpZ25Cb3g6IEFsaWduQm94LCBjb250ZW50OiBOb2RlICkge1xuICAgIHN1cGVyKCBhbGlnbkJveCApO1xuXG4gICAgdGhpcy5hbGlnbkJveCA9IGFsaWduQm94O1xuICAgIHRoaXMuY29udGVudCA9IGNvbnRlbnQ7XG5cbiAgICB0aGlzLmFkZE5vZGUoIGNvbnRlbnQgKTtcblxuICAgIGFsaWduQm94LmlzV2lkdGhSZXNpemFibGVQcm9wZXJ0eS5sYXp5TGluayggdGhpcy5fdXBkYXRlTGF5b3V0TGlzdGVuZXIgKTtcbiAgICBhbGlnbkJveC5pc0hlaWdodFJlc2l6YWJsZVByb3BlcnR5LmxhenlMaW5rKCB0aGlzLl91cGRhdGVMYXlvdXRMaXN0ZW5lciApO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbmRpdGlvbmFsbHkgdXBkYXRlcyBhIGNlcnRhaW4gcHJvcGVydHkgb2Ygb3VyIGNvbnRlbnQncyBwb3NpdGlvbmluZy5cbiAgICpcbiAgICogRXNzZW50aWFsbHkgZG9lcyB0aGUgZm9sbG93aW5nIChidXQgcHJldmVudHMgaW5maW5pdGUgbG9vcHMgYnkgbm90IGFwcGx5aW5nIGNoYW5nZXMgaWYgdGhlIG51bWJlcnMgYXJlIHZlcnlcbiAgICogc2ltaWxhcik6XG4gICAqIHRoaXMuX2NvbnRlbnRbIHByb3BOYW1lIF0gPSB0aGlzLmxvY2FsQm91bmRzWyBwcm9wTmFtZSBdICsgb2Zmc2V0O1xuICAgKlxuICAgKiBAcGFyYW0gcHJvcE5hbWUgLSBBIHBvc2l0aW9uYWwgcHJvcGVydHkgb24gYm90aCBOb2RlIGFuZCBCb3VuZHMyLCBlLmcuICdsZWZ0J1xuICAgKiBAcGFyYW0gb2Zmc2V0IC0gT2Zmc2V0IHRvIGJlIGFwcGxpZWQgdG8gdGhlIGxvY2FsQm91bmRzIGxvY2F0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSB1cGRhdGVQcm9wZXJ0eSggcHJvcE5hbWU6ICdsZWZ0JyB8ICdyaWdodCcgfCAndG9wJyB8ICdib3R0b20nIHwgJ2NlbnRlclgnIHwgJ2NlbnRlclknLCBvZmZzZXQ6IG51bWJlciApOiB2b2lkIHtcbiAgICBjb25zdCBjdXJyZW50VmFsdWUgPSB0aGlzLmNvbnRlbnRbIHByb3BOYW1lIF07XG4gICAgY29uc3QgbmV3VmFsdWUgPSB0aGlzLmFsaWduQm94LmxvY2FsQm91bmRzWyBwcm9wTmFtZSBdICsgb2Zmc2V0O1xuXG4gICAgLy8gUHJldmVudCBpbmZpbml0ZSBsb29wcyBvciBzdGFjayBvdmVyZmxvd3MgYnkgaWdub3JpbmcgdGlueSBjaGFuZ2VzXG4gICAgaWYgKCBNYXRoLmFicyggY3VycmVudFZhbHVlIC0gbmV3VmFsdWUgKSA+IDFlLTUgKSB7XG4gICAgICB0aGlzLmNvbnRlbnRbIHByb3BOYW1lIF0gPSBuZXdWYWx1ZTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgbGF5b3V0KCk6IHZvaWQge1xuICAgIHN1cGVyLmxheW91dCgpO1xuXG4gICAgY29uc3QgYm94ID0gdGhpcy5hbGlnbkJveDtcbiAgICBjb25zdCBjb250ZW50ID0gdGhpcy5jb250ZW50O1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkFsaWduQm94ICYmIHNjZW5lcnlMb2cuQWxpZ25Cb3goIGBBbGlnbkJveENvbnN0cmFpbnQjJHt0aGlzLmFsaWduQm94LmlkfSBsYXlvdXRgICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkFsaWduQm94ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgaWYgKCAhY29udGVudC5ib3VuZHMuaXNWYWxpZCgpICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRvdGFsWE1hcmdpbnMgPSBib3gubGVmdE1hcmdpbiArIGJveC5yaWdodE1hcmdpbjtcbiAgICBjb25zdCB0b3RhbFlNYXJnaW5zID0gYm94LnRvcE1hcmdpbiArIGJveC5ib3R0b21NYXJnaW47XG5cbiAgICAvLyBJZiB3ZSBoYXZlIGFsaWduQm91bmRzLCB1c2UgdGhhdC5cbiAgICBpZiAoIGJveC5hbGlnbkJvdW5kcyAhPT0gbnVsbCApIHtcbiAgICAgIGJveC5zZXRBZGp1c3RlZExvY2FsQm91bmRzKCBib3guYWxpZ25Cb3VuZHMgKTtcbiAgICB9XG4gICAgLy8gT3RoZXJ3aXNlLCB3ZSdsbCBncmFiIGEgQm91bmRzMiBhbmNob3JlZCBhdCB0aGUgdXBwZXItbGVmdCB3aXRoIG91ciByZXF1aXJlZCBkaW1lbnNpb25zLlxuICAgIGVsc2Uge1xuICAgICAgY29uc3Qgd2lkdGhXaXRoTWFyZ2luID0gY29udGVudC53aWR0aCArIHRvdGFsWE1hcmdpbnM7XG4gICAgICBjb25zdCBoZWlnaHRXaXRoTWFyZ2luID0gY29udGVudC5oZWlnaHQgKyB0b3RhbFlNYXJnaW5zO1xuICAgICAgYm94LnNldEFkanVzdGVkTG9jYWxCb3VuZHMoIG5ldyBCb3VuZHMyKCAwLCAwLCB3aWR0aFdpdGhNYXJnaW4sIGhlaWdodFdpdGhNYXJnaW4gKSApO1xuICAgIH1cblxuICAgIGNvbnN0IG1pbmltdW1XaWR0aCA9IGlzRmluaXRlKCBjb250ZW50LndpZHRoIClcbiAgICAgICAgICAgICAgICAgICAgICAgICA/ICggaXNXaWR0aFNpemFibGUoIGNvbnRlbnQgKSA/IGNvbnRlbnQubWluaW11bVdpZHRoIHx8IDAgOiBjb250ZW50LndpZHRoICkgKyB0b3RhbFhNYXJnaW5zXG4gICAgICAgICAgICAgICAgICAgICAgICAgOiBudWxsO1xuICAgIGNvbnN0IG1pbmltdW1IZWlnaHQgPSBpc0Zpbml0ZSggY29udGVudC5oZWlnaHQgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICA/ICggaXNIZWlnaHRTaXphYmxlKCBjb250ZW50ICkgPyBjb250ZW50Lm1pbmltdW1IZWlnaHQgfHwgMCA6IGNvbnRlbnQuaGVpZ2h0ICkgKyB0b3RhbFlNYXJnaW5zXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogbnVsbDtcblxuICAgIC8vIERvbid0IHRyeSB0byBsYXkgb3V0IGVtcHR5IGJvdW5kc1xuICAgIGlmICggIWNvbnRlbnQubG9jYWxCb3VuZHMuaXNFbXB0eSgpICkge1xuXG4gICAgICBpZiAoIGJveC54QWxpZ24gPT09ICdjZW50ZXInICkge1xuICAgICAgICB0aGlzLnVwZGF0ZVByb3BlcnR5KCAnY2VudGVyWCcsICggYm94LmxlZnRNYXJnaW4gLSBib3gucmlnaHRNYXJnaW4gKSAvIDIgKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCBib3gueEFsaWduID09PSAnbGVmdCcgKSB7XG4gICAgICAgIHRoaXMudXBkYXRlUHJvcGVydHkoICdsZWZ0JywgYm94LmxlZnRNYXJnaW4gKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCBib3gueEFsaWduID09PSAncmlnaHQnICkge1xuICAgICAgICB0aGlzLnVwZGF0ZVByb3BlcnR5KCAncmlnaHQnLCAtYm94LnJpZ2h0TWFyZ2luICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggYm94LnhBbGlnbiA9PT0gJ3N0cmV0Y2gnICkge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc1dpZHRoU2l6YWJsZSggY29udGVudCApLCAneEFsaWduOnN0cmV0Y2ggY2FuIG9ubHkgYmUgdXNlZCBpZiBXaWR0aFNpemFibGUgaXMgbWl4ZWQgaW50byB0aGUgY29udGVudCcgKTtcbiAgICAgICAgKCBjb250ZW50IGFzIFdpZHRoU2l6YWJsZU5vZGUgKS5wcmVmZXJyZWRXaWR0aCA9IGJveC5sb2NhbFdpZHRoIC0gYm94LmxlZnRNYXJnaW4gLSBib3gucmlnaHRNYXJnaW47XG4gICAgICAgIHRoaXMudXBkYXRlUHJvcGVydHkoICdsZWZ0JywgYm94LmxlZnRNYXJnaW4gKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBgQmFkIHhBbGlnbjogJHtib3gueEFsaWdufWAgKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCBib3gueUFsaWduID09PSAnY2VudGVyJyApIHtcbiAgICAgICAgdGhpcy51cGRhdGVQcm9wZXJ0eSggJ2NlbnRlclknLCAoIGJveC50b3BNYXJnaW4gLSBib3guYm90dG9tTWFyZ2luICkgLyAyICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggYm94LnlBbGlnbiA9PT0gJ3RvcCcgKSB7XG4gICAgICAgIHRoaXMudXBkYXRlUHJvcGVydHkoICd0b3AnLCBib3gudG9wTWFyZ2luICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggYm94LnlBbGlnbiA9PT0gJ2JvdHRvbScgKSB7XG4gICAgICAgIHRoaXMudXBkYXRlUHJvcGVydHkoICdib3R0b20nLCAtYm94LmJvdHRvbU1hcmdpbiApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIGJveC55QWxpZ24gPT09ICdzdHJldGNoJyApIHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaXNIZWlnaHRTaXphYmxlKCBjb250ZW50ICksICd5QWxpZ246c3RyZXRjaCBjYW4gb25seSBiZSB1c2VkIGlmIEhlaWdodFNpemFibGUgaXMgbWl4ZWQgaW50byB0aGUgY29udGVudCcgKTtcbiAgICAgICAgKCBjb250ZW50IGFzIEhlaWdodFNpemFibGVOb2RlICkucHJlZmVycmVkSGVpZ2h0ID0gYm94LmxvY2FsSGVpZ2h0IC0gYm94LnRvcE1hcmdpbiAtIGJveC5ib3R0b21NYXJnaW47XG4gICAgICAgIHRoaXMudXBkYXRlUHJvcGVydHkoICd0b3AnLCBib3gudG9wTWFyZ2luICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggYEJhZCB5QWxpZ246ICR7Ym94LnlBbGlnbn1gICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkFsaWduQm94ICYmIHNjZW5lcnlMb2cucG9wKCk7XG5cbiAgICAvLyBBZnRlciB0aGUgbGF5b3V0IGxvY2sgb24gcHVycG9zZSAod2Ugd2FudCB0aGVzZSB0byBiZSByZWVudHJhbnQsIGVzcGVjaWFsbHkgaWYgdGhleSBjaGFuZ2UpIC0gaG93ZXZlciBvbmx5IGFwcGx5XG4gICAgLy8gdGhpcyBjb25jZXB0IGlmIHdlJ3JlIGNhcGFibGUgb2Ygc2hyaW5raW5nICh3ZSB3YW50IHRoZSBkZWZhdWx0IHRvIGNvbnRpbnVlIHRvIGJsb2NrIG9mZiB0aGUgbGF5b3V0Qm91bmRzKVxuICAgIGJveC5sb2NhbE1pbmltdW1XaWR0aCA9IGJveC53aWR0aFNpemFibGUgPyBtaW5pbXVtV2lkdGggOiBib3gubG9jYWxXaWR0aDtcbiAgICBib3gubG9jYWxNaW5pbXVtSGVpZ2h0ID0gYm94LmhlaWdodFNpemFibGUgPyBtaW5pbXVtSGVpZ2h0IDogYm94LmxvY2FsSGVpZ2h0O1xuICB9XG59XG5cbi8qKlxuICoge0FycmF5LjxzdHJpbmc+fSAtIFN0cmluZyBrZXlzIGZvciBhbGwgb2YgdGhlIGFsbG93ZWQgb3B0aW9ucyB0aGF0IHdpbGwgYmUgc2V0IGJ5IG5vZGUubXV0YXRlKCBvcHRpb25zICksIGluIHRoZVxuICogb3JkZXIgdGhleSB3aWxsIGJlIGV2YWx1YXRlZCBpbi5cbiAqXG4gKiBOT1RFOiBTZWUgTm9kZSdzIF9tdXRhdG9yS2V5cyBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uIG9uIGhvdyB0aGlzIG9wZXJhdGVzLCBhbmQgcG90ZW50aWFsIHNwZWNpYWxcbiAqICAgICAgIGNhc2VzIHRoYXQgbWF5IGFwcGx5LlxuICovXG5BbGlnbkJveC5wcm90b3R5cGUuX211dGF0b3JLZXlzID0gQUxJR05NRU5UX0NPTlRBSU5FUl9PUFRJT05fS0VZUy5jb25jYXQoIFN1cGVyVHlwZS5wcm90b3R5cGUuX211dGF0b3JLZXlzICk7XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdBbGlnbkJveCcsIEFsaWduQm94ICk7Il0sIm5hbWVzIjpbIk11bHRpbGluayIsIkJvdW5kczIiLCJhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMiLCJvcHRpb25pemUiLCJBbGlnbkdyb3VwIiwiYXNzZXJ0Tm9BZGRpdGlvbmFsQ2hpbGRyZW4iLCJleHRlbmRzSGVpZ2h0U2l6YWJsZSIsImV4dGVuZHNXaWR0aFNpemFibGUiLCJpc0hlaWdodFNpemFibGUiLCJpc1dpZHRoU2l6YWJsZSIsIkxheW91dENvbnN0cmFpbnQiLCJOb2RlIiwic2NlbmVyeSIsIlNpemFibGUiLCJBTElHTk1FTlRfQ09OVEFJTkVSX09QVElPTl9LRVlTIiwiQWxpZ25Cb3hYQWxpZ25WYWx1ZXMiLCJBbGlnbkJveFlBbGlnblZhbHVlcyIsIlN1cGVyVHlwZSIsIkFsaWduQm94IiwiaW52YWxpZGF0ZUFsaWdubWVudCIsInNjZW5lcnlMb2ciLCJpZCIsInB1c2giLCJfZ3JvdXAiLCJvbkFsaWduQm94UmVzaXplZCIsImNvbnN0cmFpbnQiLCJ1cGRhdGVMYXlvdXQiLCJwb3AiLCJzZXRBbGlnbkJvdW5kcyIsImFsaWduQm91bmRzIiwiYXNzZXJ0IiwiaXNFbXB0eSIsImlzRmluaXRlIiwiX3hTZXQiLCJfeVNldCIsIl9hbGlnbkJvdW5kcyIsImVxdWFscyIsInZhbHVlIiwiZ2V0QWxpZ25Cb3VuZHMiLCJzZXRHcm91cCIsImdyb3VwIiwicmVtb3ZlQWxpZ25Cb3giLCJhZGRBbGlnbkJveCIsImdldEdyb3VwIiwic2V0WEFsaWduIiwieEFsaWduIiwiaW5jbHVkZXMiLCJfeEFsaWduIiwiZ2V0WEFsaWduIiwic2V0WUFsaWduIiwieUFsaWduIiwiX3lBbGlnbiIsImdldFlBbGlnbiIsImdldEFsaWduIiwic2V0QWxpZ24iLCJhbGlnbiIsInNldE1hcmdpbiIsIm1hcmdpbiIsIl9sZWZ0TWFyZ2luIiwiX3JpZ2h0TWFyZ2luIiwiX3RvcE1hcmdpbiIsIl9ib3R0b21NYXJnaW4iLCJnZXRNYXJnaW4iLCJzZXRYTWFyZ2luIiwieE1hcmdpbiIsImdldFhNYXJnaW4iLCJzZXRZTWFyZ2luIiwieU1hcmdpbiIsImdldFlNYXJnaW4iLCJzZXRMZWZ0TWFyZ2luIiwibGVmdE1hcmdpbiIsImdldExlZnRNYXJnaW4iLCJzZXRSaWdodE1hcmdpbiIsInJpZ2h0TWFyZ2luIiwiZ2V0UmlnaHRNYXJnaW4iLCJzZXRUb3BNYXJnaW4iLCJ0b3BNYXJnaW4iLCJnZXRUb3BNYXJnaW4iLCJzZXRCb3R0b21NYXJnaW4iLCJib3R0b21NYXJnaW4iLCJnZXRCb3R0b21NYXJnaW4iLCJnZXRDb250ZW50IiwiX2NvbnRlbnQiLCJjb250ZW50IiwiZ2V0Q29udGVudEJvdW5kcyIsImJvdW5kcyIsImxlZnQiLCJ0b3AiLCJyaWdodCIsImJvdHRvbSIsImdldE1pbmltdW1XaWR0aCIsImNvbnRlbnRXaWR0aCIsIm1pbmltdW1XaWR0aCIsIndpZHRoIiwiZ2V0TWluaW11bUhlaWdodCIsImNvbnRlbnRIZWlnaHQiLCJtaW5pbXVtSGVpZ2h0IiwiaGVpZ2h0Iiwic2V0QWRqdXN0ZWRMb2NhbEJvdW5kcyIsImxvY2FsQm91bmRzIiwiY29udGVudEJvdW5kcyIsIm1pblgiLCJtaW5ZIiwibWF4WCIsIm1heFkiLCJkaXNwb3NlIiwiX2FsaWduQm91bmRzUHJvcGVydHkiLCJ1bmxpbmsiLCJfYWxpZ25Cb3VuZHNQcm9wZXJ0eUxpc3RlbmVyIiwiYm91bmRzUHJvcGVydHkiLCJfY29udGVudEJvdW5kc0xpc3RlbmVyIiwibWluaW11bVdpZHRoUHJvcGVydHkiLCJtaW5pbXVtSGVpZ2h0UHJvcGVydHkiLCJtdXRhdGUiLCJvcHRpb25zIiwicHJvdmlkZWRPcHRpb25zIiwiY2hpbGRyZW4iLCJpbml0aWFsT3B0aW9ucyIsInNpemFibGUiLCJfIiwibm9vcCIsInVuZGVmaW5lZCIsIk9iamVjdCIsImdldFByb3RvdHlwZU9mIiwicHJvdG90eXBlIiwiYmluZCIsImFsaWduQm91bmRzUHJvcGVydHkiLCJsYXp5TGluayIsIkFsaWduQm94Q29uc3RyYWludCIsImxpbmsiLCJtdWx0aWxpbmsiLCJsb2NhbFByZWZlcnJlZFdpZHRoUHJvcGVydHkiLCJsb2NhbFByZWZlcnJlZEhlaWdodFByb3BlcnR5IiwicHJlZmVycmVkV2lkdGgiLCJwcmVmZXJyZWRIZWlnaHQiLCJ1cGRhdGVQcm9wZXJ0eSIsInByb3BOYW1lIiwib2Zmc2V0IiwiY3VycmVudFZhbHVlIiwibmV3VmFsdWUiLCJhbGlnbkJveCIsIk1hdGgiLCJhYnMiLCJsYXlvdXQiLCJib3giLCJpc1ZhbGlkIiwidG90YWxYTWFyZ2lucyIsInRvdGFsWU1hcmdpbnMiLCJ3aWR0aFdpdGhNYXJnaW4iLCJoZWlnaHRXaXRoTWFyZ2luIiwibG9jYWxXaWR0aCIsImxvY2FsSGVpZ2h0IiwibG9jYWxNaW5pbXVtV2lkdGgiLCJ3aWR0aFNpemFibGUiLCJsb2NhbE1pbmltdW1IZWlnaHQiLCJoZWlnaHRTaXphYmxlIiwiYWRkTm9kZSIsImlzV2lkdGhSZXNpemFibGVQcm9wZXJ0eSIsIl91cGRhdGVMYXlvdXRMaXN0ZW5lciIsImlzSGVpZ2h0UmVzaXphYmxlUHJvcGVydHkiLCJfbXV0YXRvcktleXMiLCJjb25jYXQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0E4QkMsR0FFRCxPQUFPQSxlQUFlLG1DQUFtQztBQUV6RCxPQUFPQyxhQUFhLGdDQUFnQztBQUNwRCxPQUFPQyxvQ0FBb0MsNkRBQTZEO0FBQ3hHLE9BQU9DLGVBQXFDLHdDQUF3QztBQUVwRixTQUFTQyxVQUFVLEVBQUVDLDBCQUEwQixFQUFFQyxvQkFBb0IsRUFBRUMsbUJBQW1CLEVBQXFCQyxlQUFlLEVBQUVDLGNBQWMsRUFBRUMsZ0JBQWdCLEVBQUVDLElBQUksRUFBZUMsT0FBTyxFQUFFQyxPQUFPLFFBQTBDLG1CQUFtQjtBQUVsUSxNQUFNQyxrQ0FBa0M7SUFDdEM7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBLFFBQVEsc0ZBQXNGO0NBQy9GO0FBRUQsT0FBTyxNQUFNQyx1QkFBdUI7SUFBRTtJQUFRO0lBQVU7SUFBUztDQUFXLENBQVU7QUFHdEYsT0FBTyxNQUFNQyx1QkFBdUI7SUFBRTtJQUFPO0lBQVU7SUFBVTtDQUFXLENBQVU7QUF1QnRGLE1BQU1DLFlBQVlKLFFBQVNGO0FBRVosSUFBQSxBQUFNTyxXQUFOLE1BQU1BLGlCQUFpQkQ7SUFrSXBDOzs7Ozs7R0FNQyxHQUNELEFBQU9FLHNCQUE0QjtRQUNqQ0MsY0FBY0EsV0FBV0YsUUFBUSxJQUFJRSxXQUFXRixRQUFRLENB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