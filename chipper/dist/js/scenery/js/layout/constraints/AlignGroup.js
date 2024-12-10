// Copyright 2016-2024, University of Colorado Boulder
/**
 * A group of alignment boxes that follow the constraints:
 * 1. Every box will have the same bounds, with an upper-left of (0,0)
 * 2. The box sizes will be the smallest possible to fit every box's content (with respective padding).
 * 3. Each box is responsible for positioning its content in its bounds (with customizable alignment and padding).
 *
 * Align boxes can be dynamically created and disposed, and only active boxes will be considered for the bounds.
 *
 * Since many sun components do not support resizing their contents dynamically, you may need to populate the AlignGroup
 * in the order of largest to smallest so that a fixed size container is large enough to contain the largest item.
 *
 * NOTE: Align box resizes may not happen immediately, and may be delayed until bounds of a align box's child occurs.
 *       layout updates can be forced with group.updateLayout(). If the align box's content that changed is connected
 *       to a Scenery display, its bounds will update when Display.updateDisplay() will called, so this will guarantee
 *       that the layout will be applied before it is displayed.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Disposable from '../../../../axon/js/Disposable.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import { combineOptions, optionize3 } from '../../../../phet-core/js/optionize.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import { AlignBox, scenery } from '../../imports.js';
let globalId = 1;
const DEFAULT_OPTIONS = {
    matchHorizontal: true,
    matchVertical: true
};
let AlignGroup = class AlignGroup extends Disposable {
    /**
   * Returns the current maximum width of the grouped content.
   */ getMaxWidth() {
        return this._maxWidthProperty.value;
    }
    get maxWidth() {
        return this.getMaxWidth();
    }
    /**
   * Returns the Property holding the current maximum width of the grouped content.
   */ getMaxWidthProperty() {
        return this._maxWidthProperty;
    }
    get maxWidthProperty() {
        return this.getMaxWidthProperty();
    }
    /**
   * Returns the current maximum height of the grouped content.
   */ getMaxHeight() {
        return this._maxHeightProperty.value;
    }
    get maxHeight() {
        return this.getMaxHeight();
    }
    /**
   * Returns the Property holding the current maximum height of the grouped content.
   */ getMaxHeightProperty() {
        return this._maxHeightProperty;
    }
    get maxHeightProperty() {
        return this.getMaxHeightProperty();
    }
    getMaxSizeProperty(orientation) {
        return orientation === Orientation.HORIZONTAL ? this._maxWidthProperty : this._maxHeightProperty;
    }
    /**
   * Creates an alignment box with the given content and options.
   */ createBox(content, options) {
        // Setting the group should call our addAlignBox()
        return new AlignBox(content, combineOptions({
            group: this
        }, options));
    }
    /**
   * Sets whether the widths of the align boxes should all match. If false, each box will use its preferred width
   * (usually equal to the content width + horizontal margins).
   */ setMatchHorizontal(matchHorizontal) {
        if (this._matchHorizontal !== matchHorizontal) {
            this._matchHorizontal = matchHorizontal;
            // Update layout, since it will probably change
            this.updateLayout();
        }
        return this;
    }
    set matchHorizontal(value) {
        this.setMatchHorizontal(value);
    }
    get matchHorizontal() {
        return this.getMatchHorizontal();
    }
    /**
   * Returns whether boxes currently are horizontally matched. See setMatchHorizontal() for details.
   */ getMatchHorizontal() {
        return this._matchHorizontal;
    }
    /**
   * Sets whether the heights of the align boxes should all match. If false, each box will use its preferred height
   * (usually equal to the content height + vertical margins).
   */ setMatchVertical(matchVertical) {
        if (this._matchVertical !== matchVertical) {
            this._matchVertical = matchVertical;
            // Update layout, since it will probably change
            this.updateLayout();
        }
        return this;
    }
    set matchVertical(value) {
        this.setMatchVertical(value);
    }
    get matchVertical() {
        return this.getMatchVertical();
    }
    /**
   * Returns whether boxes currently are vertically matched. See setMatchVertical() for details.
   */ getMatchVertical() {
        return this._matchVertical;
    }
    /**
   * Updates the localBounds and alignment for each alignBox.
   *
   * NOTE: Calling this will usually not be necessary outside of Scenery, but this WILL trigger bounds revalidation
   *       for every alignBox, which can force the layout code to run.
   */ updateLayout() {
        if (this._resizeLock) {
            return;
        }
        this._resizeLock = true;
        sceneryLog && sceneryLog.AlignGroup && sceneryLog.AlignGroup(`AlignGroup#${this.id} updateLayout`);
        sceneryLog && sceneryLog.AlignGroup && sceneryLog.push();
        sceneryLog && sceneryLog.AlignGroup && sceneryLog.AlignGroup('AlignGroup computing maximum dimension');
        sceneryLog && sceneryLog.AlignGroup && sceneryLog.push();
        // Compute the maximum dimension of our alignBoxs' content
        let maxWidth = 0;
        let maxHeight = 0;
        for(let i = 0; i < this._alignBoxes.length; i++){
            const alignBox = this._alignBoxes[i];
            const width = alignBox.getMinimumWidth();
            const height = alignBox.getMinimumHeight();
            // Ignore bad bounds
            if (isFinite(width) && width > 0) {
                maxWidth = Math.max(maxWidth, width);
            }
            if (isFinite(height) && height > 0) {
                maxHeight = Math.max(maxHeight, height);
            }
        }
        sceneryLog && sceneryLog.AlignGroup && sceneryLog.pop();
        sceneryLog && sceneryLog.AlignGroup && sceneryLog.AlignGroup('AlignGroup applying to boxes');
        sceneryLog && sceneryLog.AlignGroup && sceneryLog.push();
        this._maxWidthProperty.value = maxWidth;
        this._maxHeightProperty.value = maxHeight;
        if (maxWidth > 0 && maxHeight > 0) {
            // Apply that maximum dimension for each alignBox
            for(let i = 0; i < this._alignBoxes.length; i++){
                this.setBoxBounds(this._alignBoxes[i], maxWidth, maxHeight);
            }
        }
        sceneryLog && sceneryLog.AlignGroup && sceneryLog.pop();
        sceneryLog && sceneryLog.AlignGroup && sceneryLog.pop();
        this._resizeLock = false;
    }
    /**
   * Sets a box's bounds based on our maximum dimensions.
   */ setBoxBounds(alignBox, maxWidth, maxHeight) {
        let alignBounds;
        // If we match both dimensions, we don't have to inspect the box's preferred size
        if (this._matchVertical && this._matchHorizontal) {
            alignBounds = new Bounds2(0, 0, maxWidth, maxHeight);
        } else {
            // Grab the preferred size
            const contentBounds = alignBox.getContentBounds();
            // Match one orientation
            if (this._matchVertical) {
                alignBounds = new Bounds2(0, 0, isFinite(contentBounds.width) ? contentBounds.width : maxWidth, maxHeight);
            } else if (this._matchHorizontal) {
                alignBounds = new Bounds2(0, 0, maxWidth, isFinite(contentBounds.height) ? contentBounds.height : maxHeight);
            } else {
                alignBounds = contentBounds;
            }
        }
        alignBox.alignBounds = alignBounds;
    }
    /**
   * Lets the group know that the alignBox has had its content resized. Called by the AlignBox
   * (scenery-internal)
   */ onAlignBoxResized(alignBox) {
        // NOTE: in the future, we could only update this specific alignBox if the others don't need updating.
        this.updateLayout();
    }
    /**
   * Adds the AlignBox to the group -- Used in AlignBox --- do NOT use in public code
   * (scenery-internal)
   */ addAlignBox(alignBox) {
        this._alignBoxes.push(alignBox);
        // Trigger an update when a alignBox is added
        this.updateLayout();
    }
    /**
   * Removes the AlignBox from the group
   * (scenery-internal)
   */ removeAlignBox(alignBox) {
        arrayRemove(this._alignBoxes, alignBox);
        // Trigger an update when a alignBox is removed
        this.updateLayout();
    }
    /**
   * Dispose all the boxes.
   */ dispose() {
        for(let i = this._alignBoxes.length - 1; i >= 0; i--){
            this._alignBoxes[i].dispose();
        }
        super.dispose();
    }
    /**
   * Creates an alignment group that can be composed of multiple boxes.
   *
   * Use createBox() to create alignment boxes. You can dispose() individual boxes, or call dispose() on this
   * group to dispose all of them.
   *
   * It is also possible to create AlignBox instances independently and assign their 'group' to this AlignGroup.
   */ constructor(providedOptions){
        assert && assert(providedOptions === undefined || Object.getPrototypeOf(providedOptions) === Object.prototype, 'Extra prototype on options object is a code smell');
        const options = optionize3()({}, DEFAULT_OPTIONS, providedOptions);
        assert && assert(typeof options.matchHorizontal === 'boolean');
        assert && assert(typeof options.matchVertical === 'boolean');
        super(options);
        this._alignBoxes = [];
        this._matchHorizontal = options.matchHorizontal;
        this._matchVertical = options.matchVertical;
        // Gets locked when certain layout is performed.
        this._resizeLock = false;
        this._maxWidthProperty = new NumberProperty(0);
        this._maxHeightProperty = new NumberProperty(0);
        this.id = globalId++;
    }
};
export { AlignGroup as default };
scenery.register('AlignGroup', AlignGroup);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGF5b3V0L2NvbnN0cmFpbnRzL0FsaWduR3JvdXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBncm91cCBvZiBhbGlnbm1lbnQgYm94ZXMgdGhhdCBmb2xsb3cgdGhlIGNvbnN0cmFpbnRzOlxuICogMS4gRXZlcnkgYm94IHdpbGwgaGF2ZSB0aGUgc2FtZSBib3VuZHMsIHdpdGggYW4gdXBwZXItbGVmdCBvZiAoMCwwKVxuICogMi4gVGhlIGJveCBzaXplcyB3aWxsIGJlIHRoZSBzbWFsbGVzdCBwb3NzaWJsZSB0byBmaXQgZXZlcnkgYm94J3MgY29udGVudCAod2l0aCByZXNwZWN0aXZlIHBhZGRpbmcpLlxuICogMy4gRWFjaCBib3ggaXMgcmVzcG9uc2libGUgZm9yIHBvc2l0aW9uaW5nIGl0cyBjb250ZW50IGluIGl0cyBib3VuZHMgKHdpdGggY3VzdG9taXphYmxlIGFsaWdubWVudCBhbmQgcGFkZGluZykuXG4gKlxuICogQWxpZ24gYm94ZXMgY2FuIGJlIGR5bmFtaWNhbGx5IGNyZWF0ZWQgYW5kIGRpc3Bvc2VkLCBhbmQgb25seSBhY3RpdmUgYm94ZXMgd2lsbCBiZSBjb25zaWRlcmVkIGZvciB0aGUgYm91bmRzLlxuICpcbiAqIFNpbmNlIG1hbnkgc3VuIGNvbXBvbmVudHMgZG8gbm90IHN1cHBvcnQgcmVzaXppbmcgdGhlaXIgY29udGVudHMgZHluYW1pY2FsbHksIHlvdSBtYXkgbmVlZCB0byBwb3B1bGF0ZSB0aGUgQWxpZ25Hcm91cFxuICogaW4gdGhlIG9yZGVyIG9mIGxhcmdlc3QgdG8gc21hbGxlc3Qgc28gdGhhdCBhIGZpeGVkIHNpemUgY29udGFpbmVyIGlzIGxhcmdlIGVub3VnaCB0byBjb250YWluIHRoZSBsYXJnZXN0IGl0ZW0uXG4gKlxuICogTk9URTogQWxpZ24gYm94IHJlc2l6ZXMgbWF5IG5vdCBoYXBwZW4gaW1tZWRpYXRlbHksIGFuZCBtYXkgYmUgZGVsYXllZCB1bnRpbCBib3VuZHMgb2YgYSBhbGlnbiBib3gncyBjaGlsZCBvY2N1cnMuXG4gKiAgICAgICBsYXlvdXQgdXBkYXRlcyBjYW4gYmUgZm9yY2VkIHdpdGggZ3JvdXAudXBkYXRlTGF5b3V0KCkuIElmIHRoZSBhbGlnbiBib3gncyBjb250ZW50IHRoYXQgY2hhbmdlZCBpcyBjb25uZWN0ZWRcbiAqICAgICAgIHRvIGEgU2NlbmVyeSBkaXNwbGF5LCBpdHMgYm91bmRzIHdpbGwgdXBkYXRlIHdoZW4gRGlzcGxheS51cGRhdGVEaXNwbGF5KCkgd2lsbCBjYWxsZWQsIHNvIHRoaXMgd2lsbCBndWFyYW50ZWVcbiAqICAgICAgIHRoYXQgdGhlIGxheW91dCB3aWxsIGJlIGFwcGxpZWQgYmVmb3JlIGl0IGlzIGRpc3BsYXllZC5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IERpc3Bvc2FibGUsIHsgRGlzcG9zYWJsZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rpc3Bvc2FibGUuanMnO1xuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgYXJyYXlSZW1vdmUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL2FycmF5UmVtb3ZlLmpzJztcbmltcG9ydCB7IGNvbWJpbmVPcHRpb25zLCBvcHRpb25pemUzIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgT3JpZW50YXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL09yaWVudGF0aW9uLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCB7IEFsaWduQm94LCBOb2RlLCBzY2VuZXJ5IH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XG5pbXBvcnQgeyBBbGlnbkJveE9wdGlvbnMgfSBmcm9tICcuLi9ub2Rlcy9BbGlnbkJveC5qcyc7XG5cbmxldCBnbG9iYWxJZCA9IDE7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIC8vIFdoZXRoZXIgdGhlIGJveGVzIHNob3VsZCBoYXZlIGFsbCBtYXRjaGluZyB3aWR0aHMgKG90aGVyd2lzZSBpdCBmaXRzIHRvIHNpemUpXG4gIG1hdGNoSG9yaXpvbnRhbD86IGJvb2xlYW47XG5cbiAgLy8gV2hldGhlciB0aGUgYm94ZXMgc2hvdWxkIGhhdmUgYWxsIG1hdGNoaW5nIGhlaWdodHMgKG90aGVyd2lzZSBpdCBmaXRzIHRvIHNpemUpXG4gIG1hdGNoVmVydGljYWw/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgQWxpZ25Hcm91cE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIERpc3Bvc2FibGVPcHRpb25zO1xuXG5jb25zdCBERUZBVUxUX09QVElPTlMgPSB7XG4gIG1hdGNoSG9yaXpvbnRhbDogdHJ1ZSxcbiAgbWF0Y2hWZXJ0aWNhbDogdHJ1ZVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWxpZ25Hcm91cCBleHRlbmRzIERpc3Bvc2FibGUge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2FsaWduQm94ZXM6IEFsaWduQm94W107XG4gIHByaXZhdGUgX21hdGNoSG9yaXpvbnRhbDogYm9vbGVhbjtcbiAgcHJpdmF0ZSBfbWF0Y2hWZXJ0aWNhbDogYm9vbGVhbjtcblxuICAvLyBHZXRzIGxvY2tlZCB3aGVuIGNlcnRhaW4gbGF5b3V0IGlzIHBlcmZvcm1lZC5cbiAgcHJpdmF0ZSBfcmVzaXplTG9jazogYm9vbGVhbjtcblxuICBwcml2YXRlIHJlYWRvbmx5IF9tYXhXaWR0aFByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eTtcbiAgcHJpdmF0ZSByZWFkb25seSBfbWF4SGVpZ2h0UHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xuICBwcml2YXRlIHJlYWRvbmx5IGlkOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gYWxpZ25tZW50IGdyb3VwIHRoYXQgY2FuIGJlIGNvbXBvc2VkIG9mIG11bHRpcGxlIGJveGVzLlxuICAgKlxuICAgKiBVc2UgY3JlYXRlQm94KCkgdG8gY3JlYXRlIGFsaWdubWVudCBib3hlcy4gWW91IGNhbiBkaXNwb3NlKCkgaW5kaXZpZHVhbCBib3hlcywgb3IgY2FsbCBkaXNwb3NlKCkgb24gdGhpc1xuICAgKiBncm91cCB0byBkaXNwb3NlIGFsbCBvZiB0aGVtLlxuICAgKlxuICAgKiBJdCBpcyBhbHNvIHBvc3NpYmxlIHRvIGNyZWF0ZSBBbGlnbkJveCBpbnN0YW5jZXMgaW5kZXBlbmRlbnRseSBhbmQgYXNzaWduIHRoZWlyICdncm91cCcgdG8gdGhpcyBBbGlnbkdyb3VwLlxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBBbGlnbkdyb3VwT3B0aW9ucyApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwcm92aWRlZE9wdGlvbnMgPT09IHVuZGVmaW5lZCB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIHByb3ZpZGVkT3B0aW9ucyApID09PSBPYmplY3QucHJvdG90eXBlLFxuICAgICAgJ0V4dHJhIHByb3RvdHlwZSBvbiBvcHRpb25zIG9iamVjdCBpcyBhIGNvZGUgc21lbGwnICk7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplMzxBbGlnbkdyb3VwT3B0aW9ucywgU2VsZk9wdGlvbnMsIERpc3Bvc2FibGVPcHRpb25zPigpKCB7fSwgREVGQVVMVF9PUFRJT05TLCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBvcHRpb25zLm1hdGNoSG9yaXpvbnRhbCA9PT0gJ2Jvb2xlYW4nICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIG9wdGlvbnMubWF0Y2hWZXJ0aWNhbCA9PT0gJ2Jvb2xlYW4nICk7XG5cbiAgICBzdXBlciggb3B0aW9ucyApO1xuXG4gICAgdGhpcy5fYWxpZ25Cb3hlcyA9IFtdO1xuXG4gICAgdGhpcy5fbWF0Y2hIb3Jpem9udGFsID0gb3B0aW9ucy5tYXRjaEhvcml6b250YWw7XG5cbiAgICB0aGlzLl9tYXRjaFZlcnRpY2FsID0gb3B0aW9ucy5tYXRjaFZlcnRpY2FsO1xuXG4gICAgLy8gR2V0cyBsb2NrZWQgd2hlbiBjZXJ0YWluIGxheW91dCBpcyBwZXJmb3JtZWQuXG4gICAgdGhpcy5fcmVzaXplTG9jayA9IGZhbHNlO1xuXG4gICAgdGhpcy5fbWF4V2lkdGhQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApO1xuXG4gICAgdGhpcy5fbWF4SGVpZ2h0UHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKTtcblxuICAgIHRoaXMuaWQgPSBnbG9iYWxJZCsrO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGN1cnJlbnQgbWF4aW11bSB3aWR0aCBvZiB0aGUgZ3JvdXBlZCBjb250ZW50LlxuICAgKi9cbiAgcHVibGljIGdldE1heFdpZHRoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21heFdpZHRoUHJvcGVydHkudmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1heFdpZHRoKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldE1heFdpZHRoKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgUHJvcGVydHkgaG9sZGluZyB0aGUgY3VycmVudCBtYXhpbXVtIHdpZHRoIG9mIHRoZSBncm91cGVkIGNvbnRlbnQuXG4gICAqL1xuICBwdWJsaWMgZ2V0TWF4V2lkdGhQcm9wZXJ0eSgpOiBUUHJvcGVydHk8bnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMuX21heFdpZHRoUHJvcGVydHk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1heFdpZHRoUHJvcGVydHkoKTogVFByb3BlcnR5PG51bWJlcj4geyByZXR1cm4gdGhpcy5nZXRNYXhXaWR0aFByb3BlcnR5KCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3VycmVudCBtYXhpbXVtIGhlaWdodCBvZiB0aGUgZ3JvdXBlZCBjb250ZW50LlxuICAgKi9cbiAgcHVibGljIGdldE1heEhlaWdodCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9tYXhIZWlnaHRQcm9wZXJ0eS52YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWF4SGVpZ2h0KCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldE1heEhlaWdodCgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIFByb3BlcnR5IGhvbGRpbmcgdGhlIGN1cnJlbnQgbWF4aW11bSBoZWlnaHQgb2YgdGhlIGdyb3VwZWQgY29udGVudC5cbiAgICovXG4gIHB1YmxpYyBnZXRNYXhIZWlnaHRQcm9wZXJ0eSgpOiBUUHJvcGVydHk8bnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMuX21heEhlaWdodFByb3BlcnR5O1xuICB9XG5cbiAgcHVibGljIGdldCBtYXhIZWlnaHRQcm9wZXJ0eSgpOiBUUHJvcGVydHk8bnVtYmVyPiB7IHJldHVybiB0aGlzLmdldE1heEhlaWdodFByb3BlcnR5KCk7IH1cblxuICBwdWJsaWMgZ2V0TWF4U2l6ZVByb3BlcnR5KCBvcmllbnRhdGlvbjogT3JpZW50YXRpb24gKTogVFByb3BlcnR5PG51bWJlcj4ge1xuICAgIHJldHVybiBvcmllbnRhdGlvbiA9PT0gT3JpZW50YXRpb24uSE9SSVpPTlRBTCA/IHRoaXMuX21heFdpZHRoUHJvcGVydHkgOiB0aGlzLl9tYXhIZWlnaHRQcm9wZXJ0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGFsaWdubWVudCBib3ggd2l0aCB0aGUgZ2l2ZW4gY29udGVudCBhbmQgb3B0aW9ucy5cbiAgICovXG4gIHB1YmxpYyBjcmVhdGVCb3goIGNvbnRlbnQ6IE5vZGUsIG9wdGlvbnM/OiBTdHJpY3RPbWl0PEFsaWduQm94T3B0aW9ucywgJ2dyb3VwJz4gKTogQWxpZ25Cb3gge1xuXG4gICAgLy8gU2V0dGluZyB0aGUgZ3JvdXAgc2hvdWxkIGNhbGwgb3VyIGFkZEFsaWduQm94KClcbiAgICByZXR1cm4gbmV3IEFsaWduQm94KCBjb250ZW50LCBjb21iaW5lT3B0aW9uczxBbGlnbkJveE9wdGlvbnM+KCB7XG4gICAgICBncm91cDogdGhpc1xuICAgIH0sIG9wdGlvbnMgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgd2hldGhlciB0aGUgd2lkdGhzIG9mIHRoZSBhbGlnbiBib3hlcyBzaG91bGQgYWxsIG1hdGNoLiBJZiBmYWxzZSwgZWFjaCBib3ggd2lsbCB1c2UgaXRzIHByZWZlcnJlZCB3aWR0aFxuICAgKiAodXN1YWxseSBlcXVhbCB0byB0aGUgY29udGVudCB3aWR0aCArIGhvcml6b250YWwgbWFyZ2lucykuXG4gICAqL1xuICBwdWJsaWMgc2V0TWF0Y2hIb3Jpem9udGFsKCBtYXRjaEhvcml6b250YWw6IGJvb2xlYW4gKTogdGhpcyB7XG5cbiAgICBpZiAoIHRoaXMuX21hdGNoSG9yaXpvbnRhbCAhPT0gbWF0Y2hIb3Jpem9udGFsICkge1xuICAgICAgdGhpcy5fbWF0Y2hIb3Jpem9udGFsID0gbWF0Y2hIb3Jpem9udGFsO1xuXG4gICAgICAvLyBVcGRhdGUgbGF5b3V0LCBzaW5jZSBpdCB3aWxsIHByb2JhYmx5IGNoYW5nZVxuICAgICAgdGhpcy51cGRhdGVMYXlvdXQoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgbWF0Y2hIb3Jpem9udGFsKCB2YWx1ZTogYm9vbGVhbiApIHsgdGhpcy5zZXRNYXRjaEhvcml6b250YWwoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IG1hdGNoSG9yaXpvbnRhbCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZ2V0TWF0Y2hIb3Jpem9udGFsKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIGJveGVzIGN1cnJlbnRseSBhcmUgaG9yaXpvbnRhbGx5IG1hdGNoZWQuIFNlZSBzZXRNYXRjaEhvcml6b250YWwoKSBmb3IgZGV0YWlscy5cbiAgICovXG4gIHB1YmxpYyBnZXRNYXRjaEhvcml6b250YWwoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX21hdGNoSG9yaXpvbnRhbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHdoZXRoZXIgdGhlIGhlaWdodHMgb2YgdGhlIGFsaWduIGJveGVzIHNob3VsZCBhbGwgbWF0Y2guIElmIGZhbHNlLCBlYWNoIGJveCB3aWxsIHVzZSBpdHMgcHJlZmVycmVkIGhlaWdodFxuICAgKiAodXN1YWxseSBlcXVhbCB0byB0aGUgY29udGVudCBoZWlnaHQgKyB2ZXJ0aWNhbCBtYXJnaW5zKS5cbiAgICovXG4gIHB1YmxpYyBzZXRNYXRjaFZlcnRpY2FsKCBtYXRjaFZlcnRpY2FsOiBib29sZWFuICk6IHRoaXMge1xuXG4gICAgaWYgKCB0aGlzLl9tYXRjaFZlcnRpY2FsICE9PSBtYXRjaFZlcnRpY2FsICkge1xuICAgICAgdGhpcy5fbWF0Y2hWZXJ0aWNhbCA9IG1hdGNoVmVydGljYWw7XG5cbiAgICAgIC8vIFVwZGF0ZSBsYXlvdXQsIHNpbmNlIGl0IHdpbGwgcHJvYmFibHkgY2hhbmdlXG4gICAgICB0aGlzLnVwZGF0ZUxheW91dCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIHNldCBtYXRjaFZlcnRpY2FsKCB2YWx1ZTogYm9vbGVhbiApIHsgdGhpcy5zZXRNYXRjaFZlcnRpY2FsKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBtYXRjaFZlcnRpY2FsKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5nZXRNYXRjaFZlcnRpY2FsKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIGJveGVzIGN1cnJlbnRseSBhcmUgdmVydGljYWxseSBtYXRjaGVkLiBTZWUgc2V0TWF0Y2hWZXJ0aWNhbCgpIGZvciBkZXRhaWxzLlxuICAgKi9cbiAgcHVibGljIGdldE1hdGNoVmVydGljYWwoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX21hdGNoVmVydGljYWw7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgbG9jYWxCb3VuZHMgYW5kIGFsaWdubWVudCBmb3IgZWFjaCBhbGlnbkJveC5cbiAgICpcbiAgICogTk9URTogQ2FsbGluZyB0aGlzIHdpbGwgdXN1YWxseSBub3QgYmUgbmVjZXNzYXJ5IG91dHNpZGUgb2YgU2NlbmVyeSwgYnV0IHRoaXMgV0lMTCB0cmlnZ2VyIGJvdW5kcyByZXZhbGlkYXRpb25cbiAgICogICAgICAgZm9yIGV2ZXJ5IGFsaWduQm94LCB3aGljaCBjYW4gZm9yY2UgdGhlIGxheW91dCBjb2RlIHRvIHJ1bi5cbiAgICovXG4gIHB1YmxpYyB1cGRhdGVMYXlvdXQoKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLl9yZXNpemVMb2NrICkgeyByZXR1cm47IH1cbiAgICB0aGlzLl9yZXNpemVMb2NrID0gdHJ1ZTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5BbGlnbkdyb3VwICYmIHNjZW5lcnlMb2cuQWxpZ25Hcm91cChcbiAgICAgIGBBbGlnbkdyb3VwIyR7dGhpcy5pZH0gdXBkYXRlTGF5b3V0YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5BbGlnbkdyb3VwICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkFsaWduR3JvdXAgJiYgc2NlbmVyeUxvZy5BbGlnbkdyb3VwKCAnQWxpZ25Hcm91cCBjb21wdXRpbmcgbWF4aW11bSBkaW1lbnNpb24nICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkFsaWduR3JvdXAgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBDb21wdXRlIHRoZSBtYXhpbXVtIGRpbWVuc2lvbiBvZiBvdXIgYWxpZ25Cb3hzJyBjb250ZW50XG4gICAgbGV0IG1heFdpZHRoID0gMDtcbiAgICBsZXQgbWF4SGVpZ2h0ID0gMDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9hbGlnbkJveGVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgYWxpZ25Cb3ggPSB0aGlzLl9hbGlnbkJveGVzWyBpIF07XG5cbiAgICAgIGNvbnN0IHdpZHRoID0gYWxpZ25Cb3guZ2V0TWluaW11bVdpZHRoKCk7XG4gICAgICBjb25zdCBoZWlnaHQgPSBhbGlnbkJveC5nZXRNaW5pbXVtSGVpZ2h0KCk7XG5cbiAgICAgIC8vIElnbm9yZSBiYWQgYm91bmRzXG4gICAgICBpZiAoIGlzRmluaXRlKCB3aWR0aCApICYmIHdpZHRoID4gMCApIHtcbiAgICAgICAgbWF4V2lkdGggPSBNYXRoLm1heCggbWF4V2lkdGgsIHdpZHRoICk7XG4gICAgICB9XG4gICAgICBpZiAoIGlzRmluaXRlKCBoZWlnaHQgKSAmJiBoZWlnaHQgPiAwICkge1xuICAgICAgICBtYXhIZWlnaHQgPSBNYXRoLm1heCggbWF4SGVpZ2h0LCBoZWlnaHQgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQWxpZ25Hcm91cCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5BbGlnbkdyb3VwICYmIHNjZW5lcnlMb2cuQWxpZ25Hcm91cCggJ0FsaWduR3JvdXAgYXBwbHlpbmcgdG8gYm94ZXMnICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkFsaWduR3JvdXAgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICB0aGlzLl9tYXhXaWR0aFByb3BlcnR5LnZhbHVlID0gbWF4V2lkdGg7XG4gICAgdGhpcy5fbWF4SGVpZ2h0UHJvcGVydHkudmFsdWUgPSBtYXhIZWlnaHQ7XG5cbiAgICBpZiAoIG1heFdpZHRoID4gMCAmJiBtYXhIZWlnaHQgPiAwICkge1xuICAgICAgLy8gQXBwbHkgdGhhdCBtYXhpbXVtIGRpbWVuc2lvbiBmb3IgZWFjaCBhbGlnbkJveFxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fYWxpZ25Cb3hlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgdGhpcy5zZXRCb3hCb3VuZHMoIHRoaXMuX2FsaWduQm94ZXNbIGkgXSwgbWF4V2lkdGgsIG1heEhlaWdodCApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5BbGlnbkdyb3VwICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkFsaWduR3JvdXAgJiYgc2NlbmVyeUxvZy5wb3AoKTtcblxuICAgIHRoaXMuX3Jlc2l6ZUxvY2sgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGEgYm94J3MgYm91bmRzIGJhc2VkIG9uIG91ciBtYXhpbXVtIGRpbWVuc2lvbnMuXG4gICAqL1xuICBwcml2YXRlIHNldEJveEJvdW5kcyggYWxpZ25Cb3g6IEFsaWduQm94LCBtYXhXaWR0aDogbnVtYmVyLCBtYXhIZWlnaHQ6IG51bWJlciApOiB2b2lkIHtcbiAgICBsZXQgYWxpZ25Cb3VuZHM7XG5cbiAgICAvLyBJZiB3ZSBtYXRjaCBib3RoIGRpbWVuc2lvbnMsIHdlIGRvbid0IGhhdmUgdG8gaW5zcGVjdCB0aGUgYm94J3MgcHJlZmVycmVkIHNpemVcbiAgICBpZiAoIHRoaXMuX21hdGNoVmVydGljYWwgJiYgdGhpcy5fbWF0Y2hIb3Jpem9udGFsICkge1xuICAgICAgYWxpZ25Cb3VuZHMgPSBuZXcgQm91bmRzMiggMCwgMCwgbWF4V2lkdGgsIG1heEhlaWdodCApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIEdyYWIgdGhlIHByZWZlcnJlZCBzaXplXG4gICAgICBjb25zdCBjb250ZW50Qm91bmRzID0gYWxpZ25Cb3guZ2V0Q29udGVudEJvdW5kcygpO1xuXG4gICAgICAvLyBNYXRjaCBvbmUgb3JpZW50YXRpb25cbiAgICAgIGlmICggdGhpcy5fbWF0Y2hWZXJ0aWNhbCApIHtcbiAgICAgICAgYWxpZ25Cb3VuZHMgPSBuZXcgQm91bmRzMiggMCwgMCwgaXNGaW5pdGUoIGNvbnRlbnRCb3VuZHMud2lkdGggKSA/IGNvbnRlbnRCb3VuZHMud2lkdGggOiBtYXhXaWR0aCwgbWF4SGVpZ2h0ICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggdGhpcy5fbWF0Y2hIb3Jpem9udGFsICkge1xuICAgICAgICBhbGlnbkJvdW5kcyA9IG5ldyBCb3VuZHMyKCAwLCAwLCBtYXhXaWR0aCwgaXNGaW5pdGUoIGNvbnRlbnRCb3VuZHMuaGVpZ2h0ICkgPyBjb250ZW50Qm91bmRzLmhlaWdodCA6IG1heEhlaWdodCApO1xuICAgICAgfVxuICAgICAgLy8gSWYgbm90IG1hdGNoaW5nIGFueXRoaW5nLCBqdXN0IHVzZSBpdHMgcHJlZmVycmVkIHNpemVcbiAgICAgIGVsc2Uge1xuICAgICAgICBhbGlnbkJvdW5kcyA9IGNvbnRlbnRCb3VuZHM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgYWxpZ25Cb3guYWxpZ25Cb3VuZHMgPSBhbGlnbkJvdW5kcztcbiAgfVxuXG4gIC8qKlxuICAgKiBMZXRzIHRoZSBncm91cCBrbm93IHRoYXQgdGhlIGFsaWduQm94IGhhcyBoYWQgaXRzIGNvbnRlbnQgcmVzaXplZC4gQ2FsbGVkIGJ5IHRoZSBBbGlnbkJveFxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBvbkFsaWduQm94UmVzaXplZCggYWxpZ25Cb3g6IEFsaWduQm94ICk6IHZvaWQge1xuICAgIC8vIE5PVEU6IGluIHRoZSBmdXR1cmUsIHdlIGNvdWxkIG9ubHkgdXBkYXRlIHRoaXMgc3BlY2lmaWMgYWxpZ25Cb3ggaWYgdGhlIG90aGVycyBkb24ndCBuZWVkIHVwZGF0aW5nLlxuICAgIHRoaXMudXBkYXRlTGF5b3V0KCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyB0aGUgQWxpZ25Cb3ggdG8gdGhlIGdyb3VwIC0tIFVzZWQgaW4gQWxpZ25Cb3ggLS0tIGRvIE5PVCB1c2UgaW4gcHVibGljIGNvZGVcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgYWRkQWxpZ25Cb3goIGFsaWduQm94OiBBbGlnbkJveCApOiB2b2lkIHtcbiAgICB0aGlzLl9hbGlnbkJveGVzLnB1c2goIGFsaWduQm94ICk7XG5cbiAgICAvLyBUcmlnZ2VyIGFuIHVwZGF0ZSB3aGVuIGEgYWxpZ25Cb3ggaXMgYWRkZWRcbiAgICB0aGlzLnVwZGF0ZUxheW91dCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIEFsaWduQm94IGZyb20gdGhlIGdyb3VwXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIHJlbW92ZUFsaWduQm94KCBhbGlnbkJveDogQWxpZ25Cb3ggKTogdm9pZCB7XG4gICAgYXJyYXlSZW1vdmUoIHRoaXMuX2FsaWduQm94ZXMsIGFsaWduQm94ICk7XG5cbiAgICAvLyBUcmlnZ2VyIGFuIHVwZGF0ZSB3aGVuIGEgYWxpZ25Cb3ggaXMgcmVtb3ZlZFxuICAgIHRoaXMudXBkYXRlTGF5b3V0KCk7XG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZSBhbGwgdGhlIGJveGVzLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgZm9yICggbGV0IGkgPSB0aGlzLl9hbGlnbkJveGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xuICAgICAgdGhpcy5fYWxpZ25Cb3hlc1sgaSBdLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdBbGlnbkdyb3VwJywgQWxpZ25Hcm91cCApOyJdLCJuYW1lcyI6WyJEaXNwb3NhYmxlIiwiTnVtYmVyUHJvcGVydHkiLCJCb3VuZHMyIiwiYXJyYXlSZW1vdmUiLCJjb21iaW5lT3B0aW9ucyIsIm9wdGlvbml6ZTMiLCJPcmllbnRhdGlvbiIsIkFsaWduQm94Iiwic2NlbmVyeSIsImdsb2JhbElkIiwiREVGQVVMVF9PUFRJT05TIiwibWF0Y2hIb3Jpem9udGFsIiwibWF0Y2hWZXJ0aWNhbCIsIkFsaWduR3JvdXAiLCJnZXRNYXhXaWR0aCIsIl9tYXhXaWR0aFByb3BlcnR5IiwidmFsdWUiLCJtYXhXaWR0aCIsImdldE1heFdpZHRoUHJvcGVydHkiLCJtYXhXaWR0aFByb3BlcnR5IiwiZ2V0TWF4SGVpZ2h0IiwiX21heEhlaWdodFByb3BlcnR5IiwibWF4SGVpZ2h0IiwiZ2V0TWF4SGVpZ2h0UHJvcGVydHkiLCJtYXhIZWlnaHRQcm9wZXJ0eSIsImdldE1heFNpemVQcm9wZXJ0eSIsIm9yaWVudGF0aW9uIiwiSE9SSVpPTlRBTCIsImNyZWF0ZUJveCIsImNvbnRlbnQiLCJvcHRpb25zIiwiZ3JvdXAiLCJzZXRNYXRjaEhvcml6b250YWwiLCJfbWF0Y2hIb3Jpem9udGFsIiwidXBkYXRlTGF5b3V0IiwiZ2V0TWF0Y2hIb3Jpem9udGFsIiwic2V0TWF0Y2hWZXJ0aWNhbCIsIl9tYXRjaFZlcnRpY2FsIiwiZ2V0TWF0Y2hWZXJ0aWNhbCIsIl9yZXNpemVMb2NrIiwic2NlbmVyeUxvZyIsImlkIiwicHVzaCIsImkiLCJfYWxpZ25Cb3hlcyIsImxlbmd0aCIsImFsaWduQm94Iiwid2lkdGgiLCJnZXRNaW5pbXVtV2lkdGgiLCJoZWlnaHQiLCJnZXRNaW5pbXVtSGVpZ2h0IiwiaXNGaW5pdGUiLCJNYXRoIiwibWF4IiwicG9wIiwic2V0Qm94Qm91bmRzIiwiYWxpZ25Cb3VuZHMiLCJjb250ZW50Qm91bmRzIiwiZ2V0Q29udGVudEJvdW5kcyIsIm9uQWxpZ25Cb3hSZXNpemVkIiwiYWRkQWxpZ25Cb3giLCJyZW1vdmVBbGlnbkJveCIsImRpc3Bvc2UiLCJwcm92aWRlZE9wdGlvbnMiLCJhc3NlcnQiLCJ1bmRlZmluZWQiLCJPYmplY3QiLCJnZXRQcm90b3R5cGVPZiIsInByb3RvdHlwZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBaUJDLEdBRUQsT0FBT0EsZ0JBQXVDLG9DQUFvQztBQUNsRixPQUFPQyxvQkFBb0Isd0NBQXdDO0FBRW5FLE9BQU9DLGFBQWEsZ0NBQWdDO0FBQ3BELE9BQU9DLGlCQUFpQiwwQ0FBMEM7QUFDbEUsU0FBU0MsY0FBYyxFQUFFQyxVQUFVLFFBQVEsd0NBQXdDO0FBQ25GLE9BQU9DLGlCQUFpQiwwQ0FBMEM7QUFFbEUsU0FBU0MsUUFBUSxFQUFRQyxPQUFPLFFBQVEsbUJBQW1CO0FBRzNELElBQUlDLFdBQVc7QUFZZixNQUFNQyxrQkFBa0I7SUFDdEJDLGlCQUFpQjtJQUNqQkMsZUFBZTtBQUNqQjtBQUVlLElBQUEsQUFBTUMsYUFBTixNQUFNQSxtQkFBbUJiO0lBZ0R0Qzs7R0FFQyxHQUNELEFBQU9jLGNBQXNCO1FBQzNCLE9BQU8sSUFBSSxDQUFDQyxpQkFBaUIsQ0FBQ0MsS0FBSztJQUNyQztJQUVBLElBQVdDLFdBQW1CO1FBQUUsT0FBTyxJQUFJLENBQUNILFdBQVc7SUFBSTtJQUUzRDs7R0FFQyxHQUNELEFBQU9JLHNCQUF5QztRQUM5QyxPQUFPLElBQUksQ0FBQ0gsaUJBQWlCO0lBQy9CO0lBRUEsSUFBV0ksbUJBQXNDO1FBQUUsT0FBTyxJQUFJLENBQUNELG1CQUFtQjtJQUFJO0lBRXRGOztHQUVDLEdBQ0QsQUFBT0UsZUFBdUI7UUFDNUIsT0FBTyxJQUFJLENBQUNDLGtCQUFrQixDQUFDTCxLQUFLO0lBQ3RDO0lBRUEsSUFBV00sWUFBb0I7UUFBRSxPQUFPLElBQUksQ0FBQ0YsWUFBWTtJQUFJO0lBRTdEOztHQUVDLEdBQ0QsQUFBT0csdUJBQTBDO1FBQy9DLE9BQU8sSUFBSSxDQUFDRixrQkFBa0I7SUFDaEM7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