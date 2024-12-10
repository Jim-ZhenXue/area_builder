// Copyright 2022-2024, University of Colorado Boulder
/**
 * A stand-in for the layout-based fields of a Node, but where everything is done in the coordinate frame of the
 * "root" of the Trail. It is a pooled object, so it can be reused to avoid memory issues.
 *
 * NOTE: For layout, these trails usually have the "root" Node equal to the children of the layout constraint's ancestor
 * Node. Therefore, the coordinate space is typically the local coordinate frame of the ancestorNode of the
 * LayoutConstraint. This is not the same as the "global" coordinates for a Scenery Node in general (as most of the root
 * nodes of the trails provided to LayoutProxy will have parents!)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Orientation from '../../../phet-core/js/Orientation.js';
import Pool from '../../../phet-core/js/Pool.js';
import { isHeightSizable, isWidthSizable, scenery } from '../imports.js';
let LayoutProxy = class LayoutProxy {
    /**
   * This is where the logic of a poolable type's "initializer" will go. It will be potentially run MULTIPLE times,
   * as if it was constructing multiple different objects. It will be put back in the pool with dispose().
   * It will go through cycles of:
   * - constructor(...) => initialize(...) --- only at the start
   * - dispose()
   * - initialize(...)
   * - dispose()
   * - initialize(...)
   * - dispose()
   * and so on.
   *
   * DO not call it twice without in-between disposals (follow the above pattern).
   */ initialize(trail) {
        this.trail = trail;
        return this;
    }
    checkPreconditions() {
        assert && assert(this.trail, 'Should not be disposed');
        assert && assert(this.trail.getParentMatrix().isAxisAligned(), 'Transforms with LayoutProxy need to be axis-aligned');
    }
    get node() {
        assert && this.checkPreconditions();
        return this.trail.lastNode();
    }
    /**
   * Returns the bounds of the last node in the trail, but in the root coordinate frame.
   */ get bounds() {
        assert && this.checkPreconditions();
        return this.trail.parentToGlobalBounds(this.node.bounds);
    }
    /**
   * Returns the visibleBounds of the last node in the trail, but in the root coordinate frame.
   */ get visibleBounds() {
        assert && this.checkPreconditions();
        return this.trail.parentToGlobalBounds(this.node.visibleBounds);
    }
    /**
   * Returns the width of the last node in the trail, but in the root coordinate frame.
   */ get width() {
        return this.bounds.width;
    }
    /**
   * Returns the height of the last node in the trail, but in the root coordinate frame.
   */ get height() {
        return this.bounds.height;
    }
    /**
   * Returns the x of the last node in the trail, but in the root coordinate frame.
   */ get x() {
        assert && this.checkPreconditions();
        return this.trail.getParentTransform().transformX(this.node.x);
    }
    /**
   * Sets the x of the last node in the trail, but in the root coordinate frame.
   */ set x(value) {
        assert && this.checkPreconditions();
        this.node.x = this.trail.getParentTransform().inverseX(value);
    }
    /**
   * Returns the y of the last node in the trail, but in the root coordinate frame.
   */ get y() {
        assert && this.checkPreconditions();
        return this.trail.getParentTransform().transformY(this.node.y);
    }
    /**
   * Sets the y of the last node in the trail, but in the root coordinate frame.
   */ set y(value) {
        assert && this.checkPreconditions();
        this.node.y = this.trail.getParentTransform().inverseY(value);
    }
    /**
   * Returns the translation of the last node in the trail, but in the root coordinate frame.
   */ get translation() {
        assert && this.checkPreconditions();
        return this.trail.getParentTransform().transformPosition2(this.node.translation);
    }
    /**
   * Sets the translation of the last node in the trail, but in the root coordinate frame.
   */ set translation(value) {
        assert && this.checkPreconditions();
        this.node.translation = this.trail.getParentTransform().inversePosition2(value);
    }
    /**
   * Returns the left of the last node in the trail, but in the root coordinate frame.
   */ get left() {
        assert && this.checkPreconditions();
        return this.trail.getParentTransform().transformX(this.node.left);
    }
    /**
   * Sets the left of the last node in the trail, but in the root coordinate frame.
   */ set left(value) {
        this.node.left = this.trail.getParentTransform().inverseX(value);
    }
    /**
   * Returns the right of the last node in the trail, but in the root coordinate frame.
   */ get right() {
        assert && this.checkPreconditions();
        return this.trail.getParentTransform().transformX(this.node.right);
    }
    /**
   * Sets the right of the last node in the trail, but in the root coordinate frame.
   */ set right(value) {
        assert && this.checkPreconditions();
        this.node.right = this.trail.getParentTransform().inverseX(value);
    }
    /**
   * Returns the centerX of the last node in the trail, but in the root coordinate frame.
   */ get centerX() {
        assert && this.checkPreconditions();
        return this.trail.getParentTransform().transformX(this.node.centerX);
    }
    /**
   * Sets the centerX of the last node in the trail, but in the root coordinate frame.
   */ set centerX(value) {
        assert && this.checkPreconditions();
        this.node.centerX = this.trail.getParentTransform().inverseX(value);
    }
    /**
   * Returns the top of the last node in the trail, but in the root coordinate frame.
   */ get top() {
        assert && this.checkPreconditions();
        return this.trail.getParentTransform().transformY(this.node.top);
    }
    /**
   * Sets the top of the last node in the trail, but in the root coordinate frame.
   */ set top(value) {
        assert && this.checkPreconditions();
        this.node.top = this.trail.getParentTransform().inverseY(value);
    }
    /**
   * Returns the bottom of the last node in the trail, but in the root coordinate frame.
   */ get bottom() {
        assert && this.checkPreconditions();
        return this.trail.getParentTransform().transformY(this.node.bottom);
    }
    /**
   * Sets the bottom of the last node in the trail, but in the root coordinate frame.
   */ set bottom(value) {
        assert && this.checkPreconditions();
        this.node.bottom = this.trail.getParentTransform().inverseY(value);
    }
    /**
   * Returns the centerY of the last node in the trail, but in the root coordinate frame.
   */ get centerY() {
        assert && this.checkPreconditions();
        return this.trail.getParentTransform().transformY(this.node.centerY);
    }
    /**
   * Sets the centerY of the last node in the trail, but in the root coordinate frame.
   */ set centerY(value) {
        assert && this.checkPreconditions();
        this.node.centerY = this.trail.getParentTransform().inverseY(value);
    }
    /**
   * Returns the leftTop of the last node in the trail, but in the root coordinate frame.
   */ get leftTop() {
        assert && this.checkPreconditions();
        return this.trail.getParentTransform().transformPosition2(this.node.leftTop);
    }
    /**
   * Sets the leftTop of the last node in the trail, but in the root coordinate frame.
   */ set leftTop(value) {
        assert && this.checkPreconditions();
        this.node.leftTop = this.trail.getParentTransform().inversePosition2(value);
    }
    /**
   * Returns the centerTop of the last node in the trail, but in the root coordinate frame.
   */ get centerTop() {
        assert && this.checkPreconditions();
        return this.trail.getParentTransform().transformPosition2(this.node.centerTop);
    }
    /**
   * Sets the centerTop of the last node in the trail, but in the root coordinate frame.
   */ set centerTop(value) {
        assert && this.checkPreconditions();
        this.node.centerTop = this.trail.getParentTransform().inversePosition2(value);
    }
    /**
   * Returns the rightTop of the last node in the trail, but in the root coordinate frame.
   */ get rightTop() {
        assert && this.checkPreconditions();
        return this.trail.getParentTransform().transformPosition2(this.node.rightTop);
    }
    /**
   * Sets the rightTop of the last node in the trail, but in the root coordinate frame.
   */ set rightTop(value) {
        assert && this.checkPreconditions();
        this.node.rightTop = this.trail.getParentTransform().inversePosition2(value);
    }
    /**
   * Returns the leftCenter of the last node in the trail, but in the root coordinate frame.
   */ get leftCenter() {
        assert && this.checkPreconditions();
        return this.trail.getParentTransform().transformPosition2(this.node.leftCenter);
    }
    /**
   * Sets the leftCenter of the last node in the trail, but in the root coordinate frame.
   */ set leftCenter(value) {
        assert && this.checkPreconditions();
        this.node.leftCenter = this.trail.getParentTransform().inversePosition2(value);
    }
    /**
   * Returns the center of the last node in the trail, but in the root coordinate frame.
   */ get center() {
        assert && this.checkPreconditions();
        return this.trail.getParentTransform().transformPosition2(this.node.center);
    }
    /**
   * Sets the center of the last node in the trail, but in the root coordinate frame.
   */ set center(value) {
        assert && this.checkPreconditions();
        this.node.center = this.trail.getParentTransform().inversePosition2(value);
    }
    /**
   * Returns the rightCenter of the last node in the trail, but in the root coordinate frame.
   */ get rightCenter() {
        assert && this.checkPreconditions();
        return this.trail.getParentTransform().transformPosition2(this.node.rightCenter);
    }
    /**
   * Sets the rightCenter of the last node in the trail, but in the root coordinate frame.
   */ set rightCenter(value) {
        assert && this.checkPreconditions();
        this.node.rightCenter = this.trail.getParentTransform().inversePosition2(value);
    }
    /**
   * Returns the leftBottom of the last node in the trail, but in the root coordinate frame.
   */ get leftBottom() {
        assert && this.checkPreconditions();
        return this.trail.getParentTransform().transformPosition2(this.node.leftBottom);
    }
    /**
   * Sets the leftBottom of the last node in the trail, but in the root coordinate frame.
   */ set leftBottom(value) {
        assert && this.checkPreconditions();
        this.node.leftBottom = this.trail.getParentTransform().inversePosition2(value);
    }
    /**
   * Returns the centerBottom of the last node in the trail, but in the root coordinate frame.
   */ get centerBottom() {
        assert && this.checkPreconditions();
        return this.trail.getParentTransform().transformPosition2(this.node.centerBottom);
    }
    /**
   * Sets the centerBottom of the last node in the trail, but in the root coordinate frame.
   */ set centerBottom(value) {
        assert && this.checkPreconditions();
        this.node.centerBottom = this.trail.getParentTransform().inversePosition2(value);
    }
    /**
   * Returns the rightBottom of the last node in the trail, but in the root coordinate frame.
   */ get rightBottom() {
        assert && this.checkPreconditions();
        return this.trail.getParentTransform().transformPosition2(this.node.rightBottom);
    }
    /**
   * Sets the rightBottom of the last node in the trail, but in the root coordinate frame.
   */ set rightBottom(value) {
        assert && this.checkPreconditions();
        this.node.rightBottom = this.trail.getParentTransform().inversePosition2(value);
    }
    get widthSizable() {
        return this.node.widthSizable;
    }
    get heightSizable() {
        return this.node.heightSizable;
    }
    isSizable(orientation) {
        return orientation === Orientation.HORIZONTAL ? this.widthSizable : this.heightSizable;
    }
    get minimumWidth() {
        assert && this.checkPreconditions();
        var _this_node_minimumWidth;
        const minimumWidth = isWidthSizable(this.node) ? (_this_node_minimumWidth = this.node.minimumWidth) != null ? _this_node_minimumWidth : 0 : this.node.width;
        return Math.abs(this.trail.getParentTransform().transformDeltaX(minimumWidth));
    }
    get minimumHeight() {
        assert && this.checkPreconditions();
        var _this_node_minimumHeight;
        const minimumHeight = isHeightSizable(this.node) ? (_this_node_minimumHeight = this.node.minimumHeight) != null ? _this_node_minimumHeight : 0 : this.node.height;
        return Math.abs(this.trail.getParentTransform().transformDeltaY(minimumHeight));
    }
    getMinimum(orientation) {
        return orientation === Orientation.HORIZONTAL ? this.minimumWidth : this.minimumHeight;
    }
    get maxWidth() {
        assert && this.checkPreconditions();
        if (this.node.maxWidth === null) {
            return null;
        } else {
            return Math.abs(this.trail.getParentTransform().transformDeltaX(this.node.maxWidth));
        }
    }
    set maxWidth(value) {
        assert && this.checkPreconditions();
        this.node.maxWidth = value === null ? null : Math.abs(this.trail.getParentTransform().inverseDeltaX(value));
    }
    get maxHeight() {
        assert && this.checkPreconditions();
        if (this.node.maxHeight === null) {
            return null;
        } else {
            return Math.abs(this.trail.getParentTransform().transformDeltaY(this.node.maxHeight));
        }
    }
    set maxHeight(value) {
        assert && this.checkPreconditions();
        this.node.maxHeight = value === null ? null : Math.abs(this.trail.getParentTransform().inverseDeltaY(value));
    }
    /**
   * Returns either the maxWidth or maxHeight depending on the orientation
   */ getMax(orientation) {
        return orientation === Orientation.HORIZONTAL ? this.maxWidth : this.maxHeight;
    }
    attemptPreferredSize(orientation, preferredSize) {
        assert && this.checkPreconditions();
        if (this.isSizable(orientation)) {
            if (preferredSize === null) {
                this.node[orientation.preferredSize] = null;
            } else {
                // coordinate transformation
                preferredSize = Math.abs(this.trail.getParentTransform()[orientation === Orientation.HORIZONTAL ? 'inverseDeltaX' : 'inverseDeltaY'](preferredSize));
                const minimumSize = this.getMinimum(orientation);
                assert && assert(isFinite(minimumSize));
                preferredSize = Math.max(minimumSize, preferredSize);
                const maxSize = this.getMax(orientation);
                if (maxSize !== null) {
                    preferredSize = Math.min(maxSize, preferredSize);
                }
                this.node[orientation.preferredSize] = preferredSize;
            }
        }
    }
    get preferredWidth() {
        assert && this.checkPreconditions();
        if (isWidthSizable(this.node)) {
            const preferredWidth = this.node.preferredWidth;
            return preferredWidth === null ? null : Math.abs(this.trail.getParentTransform().transformDeltaX(preferredWidth));
        } else {
            return null;
        }
    }
    set preferredWidth(preferredWidth) {
        this.attemptPreferredSize(Orientation.HORIZONTAL, preferredWidth);
    }
    get preferredHeight() {
        assert && this.checkPreconditions();
        if (isHeightSizable(this.node)) {
            const preferredHeight = this.node.preferredHeight;
            return preferredHeight === null ? null : Math.abs(this.trail.getParentTransform().transformDeltaY(preferredHeight));
        } else {
            return null;
        }
    }
    set preferredHeight(preferredHeight) {
        this.attemptPreferredSize(Orientation.VERTICAL, preferredHeight);
    }
    get visible() {
        return this.node.visible;
    }
    set visible(value) {
        this.node.visible = value;
    }
    /**
   * Releases references, and frees it to the pool.
   */ dispose() {
        this.trail = null;
        this.freeToPool();
    }
    freeToPool() {
        LayoutProxy.pool.freeToPool(this);
    }
    /**
   * @param trail - The wrapped Node is the leaf-most node, but coordinates will be handled in the global frame
   * of the trail itself.
   */ constructor(trail){
        this.initialize(trail);
    }
};
LayoutProxy.pool = new Pool(LayoutProxy, {
    maxSize: 1000
});
export { LayoutProxy as default };
scenery.register('LayoutProxy', LayoutProxy);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGF5b3V0L0xheW91dFByb3h5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgc3RhbmQtaW4gZm9yIHRoZSBsYXlvdXQtYmFzZWQgZmllbGRzIG9mIGEgTm9kZSwgYnV0IHdoZXJlIGV2ZXJ5dGhpbmcgaXMgZG9uZSBpbiB0aGUgY29vcmRpbmF0ZSBmcmFtZSBvZiB0aGVcbiAqIFwicm9vdFwiIG9mIHRoZSBUcmFpbC4gSXQgaXMgYSBwb29sZWQgb2JqZWN0LCBzbyBpdCBjYW4gYmUgcmV1c2VkIHRvIGF2b2lkIG1lbW9yeSBpc3N1ZXMuXG4gKlxuICogTk9URTogRm9yIGxheW91dCwgdGhlc2UgdHJhaWxzIHVzdWFsbHkgaGF2ZSB0aGUgXCJyb290XCIgTm9kZSBlcXVhbCB0byB0aGUgY2hpbGRyZW4gb2YgdGhlIGxheW91dCBjb25zdHJhaW50J3MgYW5jZXN0b3JcbiAqIE5vZGUuIFRoZXJlZm9yZSwgdGhlIGNvb3JkaW5hdGUgc3BhY2UgaXMgdHlwaWNhbGx5IHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lIG9mIHRoZSBhbmNlc3Rvck5vZGUgb2YgdGhlXG4gKiBMYXlvdXRDb25zdHJhaW50LiBUaGlzIGlzIG5vdCB0aGUgc2FtZSBhcyB0aGUgXCJnbG9iYWxcIiBjb29yZGluYXRlcyBmb3IgYSBTY2VuZXJ5IE5vZGUgaW4gZ2VuZXJhbCAoYXMgbW9zdCBvZiB0aGUgcm9vdFxuICogbm9kZXMgb2YgdGhlIHRyYWlscyBwcm92aWRlZCB0byBMYXlvdXRQcm94eSB3aWxsIGhhdmUgcGFyZW50cyEpXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCBPcmllbnRhdGlvbiBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvT3JpZW50YXRpb24uanMnO1xuaW1wb3J0IFBvb2wgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2wuanMnO1xuaW1wb3J0IHsgaXNIZWlnaHRTaXphYmxlLCBpc1dpZHRoU2l6YWJsZSwgTm9kZSwgc2NlbmVyeSwgU2l6YWJsZU5vZGUsIFRyYWlsIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbi8vIEZvciBzdXBwb3J0aW5nIGdlbmVyYWwgY2FzZXMgd2hlcmUgeW91IG1heSBsYXlvdXQgYSBOb2RlLCBvciB1c2UgaW4gTWFudWFsQ29uc3RyYWludHMuXG5leHBvcnQgdHlwZSBMYXlvdXRhYmxlID0gTm9kZSB8IExheW91dFByb3h5O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMYXlvdXRQcm94eSB7XG5cbiAgLy8gTnVsbGVkIG91dCB3aGVuIGRpc3Bvc2VkXG4gIHB1YmxpYyB0cmFpbCE6IFRyYWlsIHwgbnVsbDtcblxuICAvKipcbiAgICogQHBhcmFtIHRyYWlsIC0gVGhlIHdyYXBwZWQgTm9kZSBpcyB0aGUgbGVhZi1tb3N0IG5vZGUsIGJ1dCBjb29yZGluYXRlcyB3aWxsIGJlIGhhbmRsZWQgaW4gdGhlIGdsb2JhbCBmcmFtZVxuICAgKiBvZiB0aGUgdHJhaWwgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0cmFpbDogVHJhaWwgKSB7XG4gICAgdGhpcy5pbml0aWFsaXplKCB0cmFpbCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgaXMgd2hlcmUgdGhlIGxvZ2ljIG9mIGEgcG9vbGFibGUgdHlwZSdzIFwiaW5pdGlhbGl6ZXJcIiB3aWxsIGdvLiBJdCB3aWxsIGJlIHBvdGVudGlhbGx5IHJ1biBNVUxUSVBMRSB0aW1lcyxcbiAgICogYXMgaWYgaXQgd2FzIGNvbnN0cnVjdGluZyBtdWx0aXBsZSBkaWZmZXJlbnQgb2JqZWN0cy4gSXQgd2lsbCBiZSBwdXQgYmFjayBpbiB0aGUgcG9vbCB3aXRoIGRpc3Bvc2UoKS5cbiAgICogSXQgd2lsbCBnbyB0aHJvdWdoIGN5Y2xlcyBvZjpcbiAgICogLSBjb25zdHJ1Y3RvciguLi4pID0+IGluaXRpYWxpemUoLi4uKSAtLS0gb25seSBhdCB0aGUgc3RhcnRcbiAgICogLSBkaXNwb3NlKClcbiAgICogLSBpbml0aWFsaXplKC4uLilcbiAgICogLSBkaXNwb3NlKClcbiAgICogLSBpbml0aWFsaXplKC4uLilcbiAgICogLSBkaXNwb3NlKClcbiAgICogYW5kIHNvIG9uLlxuICAgKlxuICAgKiBETyBub3QgY2FsbCBpdCB0d2ljZSB3aXRob3V0IGluLWJldHdlZW4gZGlzcG9zYWxzIChmb2xsb3cgdGhlIGFib3ZlIHBhdHRlcm4pLlxuICAgKi9cbiAgcHVibGljIGluaXRpYWxpemUoIHRyYWlsOiBUcmFpbCApOiB0aGlzIHtcbiAgICB0aGlzLnRyYWlsID0gdHJhaWw7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHByaXZhdGUgY2hlY2tQcmVjb25kaXRpb25zKCk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMudHJhaWwsICdTaG91bGQgbm90IGJlIGRpc3Bvc2VkJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMudHJhaWwhLmdldFBhcmVudE1hdHJpeCgpLmlzQXhpc0FsaWduZWQoKSwgJ1RyYW5zZm9ybXMgd2l0aCBMYXlvdXRQcm94eSBuZWVkIHRvIGJlIGF4aXMtYWxpZ25lZCcgKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbm9kZSgpOiBOb2RlIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5jaGVja1ByZWNvbmRpdGlvbnMoKTtcblxuICAgIHJldHVybiB0aGlzLnRyYWlsIS5sYXN0Tm9kZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJvdW5kcyBvZiB0aGUgbGFzdCBub2RlIGluIHRoZSB0cmFpbCwgYnV0IGluIHRoZSByb290IGNvb3JkaW5hdGUgZnJhbWUuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGJvdW5kcygpOiBCb3VuZHMyIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5jaGVja1ByZWNvbmRpdGlvbnMoKTtcblxuICAgIHJldHVybiB0aGlzLnRyYWlsIS5wYXJlbnRUb0dsb2JhbEJvdW5kcyggdGhpcy5ub2RlLmJvdW5kcyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHZpc2libGVCb3VuZHMgb2YgdGhlIGxhc3Qgbm9kZSBpbiB0aGUgdHJhaWwsIGJ1dCBpbiB0aGUgcm9vdCBjb29yZGluYXRlIGZyYW1lLlxuICAgKi9cbiAgcHVibGljIGdldCB2aXNpYmxlQm91bmRzKCk6IEJvdW5kczIge1xuICAgIGFzc2VydCAmJiB0aGlzLmNoZWNrUHJlY29uZGl0aW9ucygpO1xuXG4gICAgcmV0dXJuIHRoaXMudHJhaWwhLnBhcmVudFRvR2xvYmFsQm91bmRzKCB0aGlzLm5vZGUudmlzaWJsZUJvdW5kcyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHdpZHRoIG9mIHRoZSBsYXN0IG5vZGUgaW4gdGhlIHRyYWlsLCBidXQgaW4gdGhlIHJvb3QgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICovXG4gIHB1YmxpYyBnZXQgd2lkdGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5ib3VuZHMud2lkdGg7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaGVpZ2h0IG9mIHRoZSBsYXN0IG5vZGUgaW4gdGhlIHRyYWlsLCBidXQgaW4gdGhlIHJvb3QgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICovXG4gIHB1YmxpYyBnZXQgaGVpZ2h0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuYm91bmRzLmhlaWdodDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB4IG9mIHRoZSBsYXN0IG5vZGUgaW4gdGhlIHRyYWlsLCBidXQgaW4gdGhlIHJvb3QgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICovXG4gIHB1YmxpYyBnZXQgeCgpOiBudW1iZXIge1xuICAgIGFzc2VydCAmJiB0aGlzLmNoZWNrUHJlY29uZGl0aW9ucygpO1xuXG4gICAgcmV0dXJuIHRoaXMudHJhaWwhLmdldFBhcmVudFRyYW5zZm9ybSgpLnRyYW5zZm9ybVgoIHRoaXMubm9kZS54ICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgeCBvZiB0aGUgbGFzdCBub2RlIGluIHRoZSB0cmFpbCwgYnV0IGluIHRoZSByb290IGNvb3JkaW5hdGUgZnJhbWUuXG4gICAqL1xuICBwdWJsaWMgc2V0IHgoIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgYXNzZXJ0ICYmIHRoaXMuY2hlY2tQcmVjb25kaXRpb25zKCk7XG5cbiAgICB0aGlzLm5vZGUueCA9IHRoaXMudHJhaWwhLmdldFBhcmVudFRyYW5zZm9ybSgpLmludmVyc2VYKCB2YWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHkgb2YgdGhlIGxhc3Qgbm9kZSBpbiB0aGUgdHJhaWwsIGJ1dCBpbiB0aGUgcm9vdCBjb29yZGluYXRlIGZyYW1lLlxuICAgKi9cbiAgcHVibGljIGdldCB5KCk6IG51bWJlciB7XG4gICAgYXNzZXJ0ICYmIHRoaXMuY2hlY2tQcmVjb25kaXRpb25zKCk7XG5cbiAgICByZXR1cm4gdGhpcy50cmFpbCEuZ2V0UGFyZW50VHJhbnNmb3JtKCkudHJhbnNmb3JtWSggdGhpcy5ub2RlLnkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB5IG9mIHRoZSBsYXN0IG5vZGUgaW4gdGhlIHRyYWlsLCBidXQgaW4gdGhlIHJvb3QgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICovXG4gIHB1YmxpYyBzZXQgeSggdmFsdWU6IG51bWJlciApIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5jaGVja1ByZWNvbmRpdGlvbnMoKTtcblxuICAgIHRoaXMubm9kZS55ID0gdGhpcy50cmFpbCEuZ2V0UGFyZW50VHJhbnNmb3JtKCkuaW52ZXJzZVkoIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdHJhbnNsYXRpb24gb2YgdGhlIGxhc3Qgbm9kZSBpbiB0aGUgdHJhaWwsIGJ1dCBpbiB0aGUgcm9vdCBjb29yZGluYXRlIGZyYW1lLlxuICAgKi9cbiAgcHVibGljIGdldCB0cmFuc2xhdGlvbigpOiBWZWN0b3IyIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5jaGVja1ByZWNvbmRpdGlvbnMoKTtcblxuICAgIHJldHVybiB0aGlzLnRyYWlsIS5nZXRQYXJlbnRUcmFuc2Zvcm0oKS50cmFuc2Zvcm1Qb3NpdGlvbjIoIHRoaXMubm9kZS50cmFuc2xhdGlvbiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHRyYW5zbGF0aW9uIG9mIHRoZSBsYXN0IG5vZGUgaW4gdGhlIHRyYWlsLCBidXQgaW4gdGhlIHJvb3QgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICovXG4gIHB1YmxpYyBzZXQgdHJhbnNsYXRpb24oIHZhbHVlOiBWZWN0b3IyICkge1xuICAgIGFzc2VydCAmJiB0aGlzLmNoZWNrUHJlY29uZGl0aW9ucygpO1xuXG4gICAgdGhpcy5ub2RlLnRyYW5zbGF0aW9uID0gdGhpcy50cmFpbCEuZ2V0UGFyZW50VHJhbnNmb3JtKCkuaW52ZXJzZVBvc2l0aW9uMiggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBsZWZ0IG9mIHRoZSBsYXN0IG5vZGUgaW4gdGhlIHRyYWlsLCBidXQgaW4gdGhlIHJvb3QgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICovXG4gIHB1YmxpYyBnZXQgbGVmdCgpOiBudW1iZXIge1xuICAgIGFzc2VydCAmJiB0aGlzLmNoZWNrUHJlY29uZGl0aW9ucygpO1xuXG4gICAgcmV0dXJuIHRoaXMudHJhaWwhLmdldFBhcmVudFRyYW5zZm9ybSgpLnRyYW5zZm9ybVgoIHRoaXMubm9kZS5sZWZ0ICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgbGVmdCBvZiB0aGUgbGFzdCBub2RlIGluIHRoZSB0cmFpbCwgYnV0IGluIHRoZSByb290IGNvb3JkaW5hdGUgZnJhbWUuXG4gICAqL1xuICBwdWJsaWMgc2V0IGxlZnQoIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgdGhpcy5ub2RlLmxlZnQgPSB0aGlzLnRyYWlsIS5nZXRQYXJlbnRUcmFuc2Zvcm0oKS5pbnZlcnNlWCggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByaWdodCBvZiB0aGUgbGFzdCBub2RlIGluIHRoZSB0cmFpbCwgYnV0IGluIHRoZSByb290IGNvb3JkaW5hdGUgZnJhbWUuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHJpZ2h0KCk6IG51bWJlciB7XG4gICAgYXNzZXJ0ICYmIHRoaXMuY2hlY2tQcmVjb25kaXRpb25zKCk7XG5cbiAgICByZXR1cm4gdGhpcy50cmFpbCEuZ2V0UGFyZW50VHJhbnNmb3JtKCkudHJhbnNmb3JtWCggdGhpcy5ub2RlLnJpZ2h0ICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgcmlnaHQgb2YgdGhlIGxhc3Qgbm9kZSBpbiB0aGUgdHJhaWwsIGJ1dCBpbiB0aGUgcm9vdCBjb29yZGluYXRlIGZyYW1lLlxuICAgKi9cbiAgcHVibGljIHNldCByaWdodCggdmFsdWU6IG51bWJlciApIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5jaGVja1ByZWNvbmRpdGlvbnMoKTtcblxuICAgIHRoaXMubm9kZS5yaWdodCA9IHRoaXMudHJhaWwhLmdldFBhcmVudFRyYW5zZm9ybSgpLmludmVyc2VYKCB2YWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNlbnRlclggb2YgdGhlIGxhc3Qgbm9kZSBpbiB0aGUgdHJhaWwsIGJ1dCBpbiB0aGUgcm9vdCBjb29yZGluYXRlIGZyYW1lLlxuICAgKi9cbiAgcHVibGljIGdldCBjZW50ZXJYKCk6IG51bWJlciB7XG4gICAgYXNzZXJ0ICYmIHRoaXMuY2hlY2tQcmVjb25kaXRpb25zKCk7XG5cbiAgICByZXR1cm4gdGhpcy50cmFpbCEuZ2V0UGFyZW50VHJhbnNmb3JtKCkudHJhbnNmb3JtWCggdGhpcy5ub2RlLmNlbnRlclggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBjZW50ZXJYIG9mIHRoZSBsYXN0IG5vZGUgaW4gdGhlIHRyYWlsLCBidXQgaW4gdGhlIHJvb3QgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICovXG4gIHB1YmxpYyBzZXQgY2VudGVyWCggdmFsdWU6IG51bWJlciApIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5jaGVja1ByZWNvbmRpdGlvbnMoKTtcblxuICAgIHRoaXMubm9kZS5jZW50ZXJYID0gdGhpcy50cmFpbCEuZ2V0UGFyZW50VHJhbnNmb3JtKCkuaW52ZXJzZVgoIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdG9wIG9mIHRoZSBsYXN0IG5vZGUgaW4gdGhlIHRyYWlsLCBidXQgaW4gdGhlIHJvb3QgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICovXG4gIHB1YmxpYyBnZXQgdG9wKCk6IG51bWJlciB7XG4gICAgYXNzZXJ0ICYmIHRoaXMuY2hlY2tQcmVjb25kaXRpb25zKCk7XG5cbiAgICByZXR1cm4gdGhpcy50cmFpbCEuZ2V0UGFyZW50VHJhbnNmb3JtKCkudHJhbnNmb3JtWSggdGhpcy5ub2RlLnRvcCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHRvcCBvZiB0aGUgbGFzdCBub2RlIGluIHRoZSB0cmFpbCwgYnV0IGluIHRoZSByb290IGNvb3JkaW5hdGUgZnJhbWUuXG4gICAqL1xuICBwdWJsaWMgc2V0IHRvcCggdmFsdWU6IG51bWJlciApIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5jaGVja1ByZWNvbmRpdGlvbnMoKTtcblxuICAgIHRoaXMubm9kZS50b3AgPSB0aGlzLnRyYWlsIS5nZXRQYXJlbnRUcmFuc2Zvcm0oKS5pbnZlcnNlWSggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBib3R0b20gb2YgdGhlIGxhc3Qgbm9kZSBpbiB0aGUgdHJhaWwsIGJ1dCBpbiB0aGUgcm9vdCBjb29yZGluYXRlIGZyYW1lLlxuICAgKi9cbiAgcHVibGljIGdldCBib3R0b20oKTogbnVtYmVyIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5jaGVja1ByZWNvbmRpdGlvbnMoKTtcblxuICAgIHJldHVybiB0aGlzLnRyYWlsIS5nZXRQYXJlbnRUcmFuc2Zvcm0oKS50cmFuc2Zvcm1ZKCB0aGlzLm5vZGUuYm90dG9tICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgYm90dG9tIG9mIHRoZSBsYXN0IG5vZGUgaW4gdGhlIHRyYWlsLCBidXQgaW4gdGhlIHJvb3QgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICovXG4gIHB1YmxpYyBzZXQgYm90dG9tKCB2YWx1ZTogbnVtYmVyICkge1xuICAgIGFzc2VydCAmJiB0aGlzLmNoZWNrUHJlY29uZGl0aW9ucygpO1xuXG4gICAgdGhpcy5ub2RlLmJvdHRvbSA9IHRoaXMudHJhaWwhLmdldFBhcmVudFRyYW5zZm9ybSgpLmludmVyc2VZKCB2YWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNlbnRlclkgb2YgdGhlIGxhc3Qgbm9kZSBpbiB0aGUgdHJhaWwsIGJ1dCBpbiB0aGUgcm9vdCBjb29yZGluYXRlIGZyYW1lLlxuICAgKi9cbiAgcHVibGljIGdldCBjZW50ZXJZKCk6IG51bWJlciB7XG4gICAgYXNzZXJ0ICYmIHRoaXMuY2hlY2tQcmVjb25kaXRpb25zKCk7XG5cbiAgICByZXR1cm4gdGhpcy50cmFpbCEuZ2V0UGFyZW50VHJhbnNmb3JtKCkudHJhbnNmb3JtWSggdGhpcy5ub2RlLmNlbnRlclkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBjZW50ZXJZIG9mIHRoZSBsYXN0IG5vZGUgaW4gdGhlIHRyYWlsLCBidXQgaW4gdGhlIHJvb3QgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICovXG4gIHB1YmxpYyBzZXQgY2VudGVyWSggdmFsdWU6IG51bWJlciApIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5jaGVja1ByZWNvbmRpdGlvbnMoKTtcblxuICAgIHRoaXMubm9kZS5jZW50ZXJZID0gdGhpcy50cmFpbCEuZ2V0UGFyZW50VHJhbnNmb3JtKCkuaW52ZXJzZVkoIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbGVmdFRvcCBvZiB0aGUgbGFzdCBub2RlIGluIHRoZSB0cmFpbCwgYnV0IGluIHRoZSByb290IGNvb3JkaW5hdGUgZnJhbWUuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGxlZnRUb3AoKTogVmVjdG9yMiB7XG4gICAgYXNzZXJ0ICYmIHRoaXMuY2hlY2tQcmVjb25kaXRpb25zKCk7XG5cbiAgICByZXR1cm4gdGhpcy50cmFpbCEuZ2V0UGFyZW50VHJhbnNmb3JtKCkudHJhbnNmb3JtUG9zaXRpb24yKCB0aGlzLm5vZGUubGVmdFRvcCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGxlZnRUb3Agb2YgdGhlIGxhc3Qgbm9kZSBpbiB0aGUgdHJhaWwsIGJ1dCBpbiB0aGUgcm9vdCBjb29yZGluYXRlIGZyYW1lLlxuICAgKi9cbiAgcHVibGljIHNldCBsZWZ0VG9wKCB2YWx1ZTogVmVjdG9yMiApIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5jaGVja1ByZWNvbmRpdGlvbnMoKTtcblxuICAgIHRoaXMubm9kZS5sZWZ0VG9wID0gdGhpcy50cmFpbCEuZ2V0UGFyZW50VHJhbnNmb3JtKCkuaW52ZXJzZVBvc2l0aW9uMiggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjZW50ZXJUb3Agb2YgdGhlIGxhc3Qgbm9kZSBpbiB0aGUgdHJhaWwsIGJ1dCBpbiB0aGUgcm9vdCBjb29yZGluYXRlIGZyYW1lLlxuICAgKi9cbiAgcHVibGljIGdldCBjZW50ZXJUb3AoKTogVmVjdG9yMiB7XG4gICAgYXNzZXJ0ICYmIHRoaXMuY2hlY2tQcmVjb25kaXRpb25zKCk7XG5cbiAgICByZXR1cm4gdGhpcy50cmFpbCEuZ2V0UGFyZW50VHJhbnNmb3JtKCkudHJhbnNmb3JtUG9zaXRpb24yKCB0aGlzLm5vZGUuY2VudGVyVG9wICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgY2VudGVyVG9wIG9mIHRoZSBsYXN0IG5vZGUgaW4gdGhlIHRyYWlsLCBidXQgaW4gdGhlIHJvb3QgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICovXG4gIHB1YmxpYyBzZXQgY2VudGVyVG9wKCB2YWx1ZTogVmVjdG9yMiApIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5jaGVja1ByZWNvbmRpdGlvbnMoKTtcblxuICAgIHRoaXMubm9kZS5jZW50ZXJUb3AgPSB0aGlzLnRyYWlsIS5nZXRQYXJlbnRUcmFuc2Zvcm0oKS5pbnZlcnNlUG9zaXRpb24yKCB2YWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHJpZ2h0VG9wIG9mIHRoZSBsYXN0IG5vZGUgaW4gdGhlIHRyYWlsLCBidXQgaW4gdGhlIHJvb3QgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICovXG4gIHB1YmxpYyBnZXQgcmlnaHRUb3AoKTogVmVjdG9yMiB7XG4gICAgYXNzZXJ0ICYmIHRoaXMuY2hlY2tQcmVjb25kaXRpb25zKCk7XG5cbiAgICByZXR1cm4gdGhpcy50cmFpbCEuZ2V0UGFyZW50VHJhbnNmb3JtKCkudHJhbnNmb3JtUG9zaXRpb24yKCB0aGlzLm5vZGUucmlnaHRUb3AgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSByaWdodFRvcCBvZiB0aGUgbGFzdCBub2RlIGluIHRoZSB0cmFpbCwgYnV0IGluIHRoZSByb290IGNvb3JkaW5hdGUgZnJhbWUuXG4gICAqL1xuICBwdWJsaWMgc2V0IHJpZ2h0VG9wKCB2YWx1ZTogVmVjdG9yMiApIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5jaGVja1ByZWNvbmRpdGlvbnMoKTtcblxuICAgIHRoaXMubm9kZS5yaWdodFRvcCA9IHRoaXMudHJhaWwhLmdldFBhcmVudFRyYW5zZm9ybSgpLmludmVyc2VQb3NpdGlvbjIoIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbGVmdENlbnRlciBvZiB0aGUgbGFzdCBub2RlIGluIHRoZSB0cmFpbCwgYnV0IGluIHRoZSByb290IGNvb3JkaW5hdGUgZnJhbWUuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGxlZnRDZW50ZXIoKTogVmVjdG9yMiB7XG4gICAgYXNzZXJ0ICYmIHRoaXMuY2hlY2tQcmVjb25kaXRpb25zKCk7XG5cbiAgICByZXR1cm4gdGhpcy50cmFpbCEuZ2V0UGFyZW50VHJhbnNmb3JtKCkudHJhbnNmb3JtUG9zaXRpb24yKCB0aGlzLm5vZGUubGVmdENlbnRlciApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGxlZnRDZW50ZXIgb2YgdGhlIGxhc3Qgbm9kZSBpbiB0aGUgdHJhaWwsIGJ1dCBpbiB0aGUgcm9vdCBjb29yZGluYXRlIGZyYW1lLlxuICAgKi9cbiAgcHVibGljIHNldCBsZWZ0Q2VudGVyKCB2YWx1ZTogVmVjdG9yMiApIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5jaGVja1ByZWNvbmRpdGlvbnMoKTtcblxuICAgIHRoaXMubm9kZS5sZWZ0Q2VudGVyID0gdGhpcy50cmFpbCEuZ2V0UGFyZW50VHJhbnNmb3JtKCkuaW52ZXJzZVBvc2l0aW9uMiggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjZW50ZXIgb2YgdGhlIGxhc3Qgbm9kZSBpbiB0aGUgdHJhaWwsIGJ1dCBpbiB0aGUgcm9vdCBjb29yZGluYXRlIGZyYW1lLlxuICAgKi9cbiAgcHVibGljIGdldCBjZW50ZXIoKTogVmVjdG9yMiB7XG4gICAgYXNzZXJ0ICYmIHRoaXMuY2hlY2tQcmVjb25kaXRpb25zKCk7XG5cbiAgICByZXR1cm4gdGhpcy50cmFpbCEuZ2V0UGFyZW50VHJhbnNmb3JtKCkudHJhbnNmb3JtUG9zaXRpb24yKCB0aGlzLm5vZGUuY2VudGVyICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgY2VudGVyIG9mIHRoZSBsYXN0IG5vZGUgaW4gdGhlIHRyYWlsLCBidXQgaW4gdGhlIHJvb3QgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICovXG4gIHB1YmxpYyBzZXQgY2VudGVyKCB2YWx1ZTogVmVjdG9yMiApIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5jaGVja1ByZWNvbmRpdGlvbnMoKTtcblxuICAgIHRoaXMubm9kZS5jZW50ZXIgPSB0aGlzLnRyYWlsIS5nZXRQYXJlbnRUcmFuc2Zvcm0oKS5pbnZlcnNlUG9zaXRpb24yKCB2YWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHJpZ2h0Q2VudGVyIG9mIHRoZSBsYXN0IG5vZGUgaW4gdGhlIHRyYWlsLCBidXQgaW4gdGhlIHJvb3QgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICovXG4gIHB1YmxpYyBnZXQgcmlnaHRDZW50ZXIoKTogVmVjdG9yMiB7XG4gICAgYXNzZXJ0ICYmIHRoaXMuY2hlY2tQcmVjb25kaXRpb25zKCk7XG5cbiAgICByZXR1cm4gdGhpcy50cmFpbCEuZ2V0UGFyZW50VHJhbnNmb3JtKCkudHJhbnNmb3JtUG9zaXRpb24yKCB0aGlzLm5vZGUucmlnaHRDZW50ZXIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSByaWdodENlbnRlciBvZiB0aGUgbGFzdCBub2RlIGluIHRoZSB0cmFpbCwgYnV0IGluIHRoZSByb290IGNvb3JkaW5hdGUgZnJhbWUuXG4gICAqL1xuICBwdWJsaWMgc2V0IHJpZ2h0Q2VudGVyKCB2YWx1ZTogVmVjdG9yMiApIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5jaGVja1ByZWNvbmRpdGlvbnMoKTtcblxuICAgIHRoaXMubm9kZS5yaWdodENlbnRlciA9IHRoaXMudHJhaWwhLmdldFBhcmVudFRyYW5zZm9ybSgpLmludmVyc2VQb3NpdGlvbjIoIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbGVmdEJvdHRvbSBvZiB0aGUgbGFzdCBub2RlIGluIHRoZSB0cmFpbCwgYnV0IGluIHRoZSByb290IGNvb3JkaW5hdGUgZnJhbWUuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGxlZnRCb3R0b20oKTogVmVjdG9yMiB7XG4gICAgYXNzZXJ0ICYmIHRoaXMuY2hlY2tQcmVjb25kaXRpb25zKCk7XG5cbiAgICByZXR1cm4gdGhpcy50cmFpbCEuZ2V0UGFyZW50VHJhbnNmb3JtKCkudHJhbnNmb3JtUG9zaXRpb24yKCB0aGlzLm5vZGUubGVmdEJvdHRvbSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGxlZnRCb3R0b20gb2YgdGhlIGxhc3Qgbm9kZSBpbiB0aGUgdHJhaWwsIGJ1dCBpbiB0aGUgcm9vdCBjb29yZGluYXRlIGZyYW1lLlxuICAgKi9cbiAgcHVibGljIHNldCBsZWZ0Qm90dG9tKCB2YWx1ZTogVmVjdG9yMiApIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5jaGVja1ByZWNvbmRpdGlvbnMoKTtcblxuICAgIHRoaXMubm9kZS5sZWZ0Qm90dG9tID0gdGhpcy50cmFpbCEuZ2V0UGFyZW50VHJhbnNmb3JtKCkuaW52ZXJzZVBvc2l0aW9uMiggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjZW50ZXJCb3R0b20gb2YgdGhlIGxhc3Qgbm9kZSBpbiB0aGUgdHJhaWwsIGJ1dCBpbiB0aGUgcm9vdCBjb29yZGluYXRlIGZyYW1lLlxuICAgKi9cbiAgcHVibGljIGdldCBjZW50ZXJCb3R0b20oKTogVmVjdG9yMiB7XG4gICAgYXNzZXJ0ICYmIHRoaXMuY2hlY2tQcmVjb25kaXRpb25zKCk7XG5cbiAgICByZXR1cm4gdGhpcy50cmFpbCEuZ2V0UGFyZW50VHJhbnNmb3JtKCkudHJhbnNmb3JtUG9zaXRpb24yKCB0aGlzLm5vZGUuY2VudGVyQm90dG9tICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgY2VudGVyQm90dG9tIG9mIHRoZSBsYXN0IG5vZGUgaW4gdGhlIHRyYWlsLCBidXQgaW4gdGhlIHJvb3QgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICovXG4gIHB1YmxpYyBzZXQgY2VudGVyQm90dG9tKCB2YWx1ZTogVmVjdG9yMiApIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5jaGVja1ByZWNvbmRpdGlvbnMoKTtcblxuICAgIHRoaXMubm9kZS5jZW50ZXJCb3R0b20gPSB0aGlzLnRyYWlsIS5nZXRQYXJlbnRUcmFuc2Zvcm0oKS5pbnZlcnNlUG9zaXRpb24yKCB2YWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHJpZ2h0Qm90dG9tIG9mIHRoZSBsYXN0IG5vZGUgaW4gdGhlIHRyYWlsLCBidXQgaW4gdGhlIHJvb3QgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICovXG4gIHB1YmxpYyBnZXQgcmlnaHRCb3R0b20oKTogVmVjdG9yMiB7XG4gICAgYXNzZXJ0ICYmIHRoaXMuY2hlY2tQcmVjb25kaXRpb25zKCk7XG5cbiAgICByZXR1cm4gdGhpcy50cmFpbCEuZ2V0UGFyZW50VHJhbnNmb3JtKCkudHJhbnNmb3JtUG9zaXRpb24yKCB0aGlzLm5vZGUucmlnaHRCb3R0b20gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSByaWdodEJvdHRvbSBvZiB0aGUgbGFzdCBub2RlIGluIHRoZSB0cmFpbCwgYnV0IGluIHRoZSByb290IGNvb3JkaW5hdGUgZnJhbWUuXG4gICAqL1xuICBwdWJsaWMgc2V0IHJpZ2h0Qm90dG9tKCB2YWx1ZTogVmVjdG9yMiApIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5jaGVja1ByZWNvbmRpdGlvbnMoKTtcblxuICAgIHRoaXMubm9kZS5yaWdodEJvdHRvbSA9IHRoaXMudHJhaWwhLmdldFBhcmVudFRyYW5zZm9ybSgpLmludmVyc2VQb3NpdGlvbjIoIHZhbHVlICk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHdpZHRoU2l6YWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ub2RlLndpZHRoU2l6YWJsZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaGVpZ2h0U2l6YWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ub2RlLmhlaWdodFNpemFibGU7XG4gIH1cblxuICBwdWJsaWMgaXNTaXphYmxlKCBvcmllbnRhdGlvbjogT3JpZW50YXRpb24gKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIG9yaWVudGF0aW9uID09PSBPcmllbnRhdGlvbi5IT1JJWk9OVEFMID8gdGhpcy53aWR0aFNpemFibGUgOiB0aGlzLmhlaWdodFNpemFibGU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1pbmltdW1XaWR0aCgpOiBudW1iZXIge1xuICAgIGFzc2VydCAmJiB0aGlzLmNoZWNrUHJlY29uZGl0aW9ucygpO1xuXG4gICAgY29uc3QgbWluaW11bVdpZHRoID0gaXNXaWR0aFNpemFibGUoIHRoaXMubm9kZSApID8gdGhpcy5ub2RlLm1pbmltdW1XaWR0aCA/PyAwIDogdGhpcy5ub2RlLndpZHRoO1xuXG4gICAgcmV0dXJuIE1hdGguYWJzKCB0aGlzLnRyYWlsIS5nZXRQYXJlbnRUcmFuc2Zvcm0oKS50cmFuc2Zvcm1EZWx0YVgoIG1pbmltdW1XaWR0aCApICk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1pbmltdW1IZWlnaHQoKTogbnVtYmVyIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5jaGVja1ByZWNvbmRpdGlvbnMoKTtcblxuICAgIGNvbnN0IG1pbmltdW1IZWlnaHQgPSBpc0hlaWdodFNpemFibGUoIHRoaXMubm9kZSApID8gdGhpcy5ub2RlLm1pbmltdW1IZWlnaHQgPz8gMCA6IHRoaXMubm9kZS5oZWlnaHQ7XG5cbiAgICByZXR1cm4gTWF0aC5hYnMoIHRoaXMudHJhaWwhLmdldFBhcmVudFRyYW5zZm9ybSgpLnRyYW5zZm9ybURlbHRhWSggbWluaW11bUhlaWdodCApICk7XG4gIH1cblxuICBwdWJsaWMgZ2V0TWluaW11bSggb3JpZW50YXRpb246IE9yaWVudGF0aW9uICk6IG51bWJlciB7XG4gICAgcmV0dXJuIG9yaWVudGF0aW9uID09PSBPcmllbnRhdGlvbi5IT1JJWk9OVEFMID8gdGhpcy5taW5pbXVtV2lkdGggOiB0aGlzLm1pbmltdW1IZWlnaHQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1heFdpZHRoKCk6IG51bWJlciB8IG51bGwge1xuICAgIGFzc2VydCAmJiB0aGlzLmNoZWNrUHJlY29uZGl0aW9ucygpO1xuXG4gICAgaWYgKCB0aGlzLm5vZGUubWF4V2lkdGggPT09IG51bGwgKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gTWF0aC5hYnMoIHRoaXMudHJhaWwhLmdldFBhcmVudFRyYW5zZm9ybSgpLnRyYW5zZm9ybURlbHRhWCggdGhpcy5ub2RlLm1heFdpZHRoICkgKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc2V0IG1heFdpZHRoKCB2YWx1ZTogbnVtYmVyIHwgbnVsbCApIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5jaGVja1ByZWNvbmRpdGlvbnMoKTtcblxuICAgIHRoaXMubm9kZS5tYXhXaWR0aCA9IHZhbHVlID09PSBudWxsID8gbnVsbCA6IE1hdGguYWJzKCB0aGlzLnRyYWlsIS5nZXRQYXJlbnRUcmFuc2Zvcm0oKS5pbnZlcnNlRGVsdGFYKCB2YWx1ZSApICk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1heEhlaWdodCgpOiBudW1iZXIgfCBudWxsIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5jaGVja1ByZWNvbmRpdGlvbnMoKTtcblxuICAgIGlmICggdGhpcy5ub2RlLm1heEhlaWdodCA9PT0gbnVsbCApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBNYXRoLmFicyggdGhpcy50cmFpbCEuZ2V0UGFyZW50VHJhbnNmb3JtKCkudHJhbnNmb3JtRGVsdGFZKCB0aGlzLm5vZGUubWF4SGVpZ2h0ICkgKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc2V0IG1heEhlaWdodCggdmFsdWU6IG51bWJlciB8IG51bGwgKSB7XG4gICAgYXNzZXJ0ICYmIHRoaXMuY2hlY2tQcmVjb25kaXRpb25zKCk7XG5cbiAgICB0aGlzLm5vZGUubWF4SGVpZ2h0ID0gdmFsdWUgPT09IG51bGwgPyBudWxsIDogTWF0aC5hYnMoIHRoaXMudHJhaWwhLmdldFBhcmVudFRyYW5zZm9ybSgpLmludmVyc2VEZWx0YVkoIHZhbHVlICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGVpdGhlciB0aGUgbWF4V2lkdGggb3IgbWF4SGVpZ2h0IGRlcGVuZGluZyBvbiB0aGUgb3JpZW50YXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXRNYXgoIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbiApOiBudW1iZXIgfCBudWxsIHtcbiAgICByZXR1cm4gb3JpZW50YXRpb24gPT09IE9yaWVudGF0aW9uLkhPUklaT05UQUwgPyB0aGlzLm1heFdpZHRoIDogdGhpcy5tYXhIZWlnaHQ7XG4gIH1cblxuICBwdWJsaWMgYXR0ZW1wdFByZWZlcnJlZFNpemUoIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbiwgcHJlZmVycmVkU2l6ZTogbnVtYmVyIHwgbnVsbCApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5jaGVja1ByZWNvbmRpdGlvbnMoKTtcblxuICAgIGlmICggdGhpcy5pc1NpemFibGUoIG9yaWVudGF0aW9uICkgKSB7XG4gICAgICBpZiAoIHByZWZlcnJlZFNpemUgPT09IG51bGwgKSB7XG4gICAgICAgICggdGhpcy5ub2RlIGFzIFNpemFibGVOb2RlIClbIG9yaWVudGF0aW9uLnByZWZlcnJlZFNpemUgXSA9IG51bGw7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gY29vcmRpbmF0ZSB0cmFuc2Zvcm1hdGlvblxuICAgICAgICBwcmVmZXJyZWRTaXplID0gTWF0aC5hYnMoIHRoaXMudHJhaWwhLmdldFBhcmVudFRyYW5zZm9ybSgpWyBvcmllbnRhdGlvbiA9PT0gT3JpZW50YXRpb24uSE9SSVpPTlRBTCA/ICdpbnZlcnNlRGVsdGFYJyA6ICdpbnZlcnNlRGVsdGFZJyBdKCBwcmVmZXJyZWRTaXplICkgKTtcblxuICAgICAgICBjb25zdCBtaW5pbXVtU2l6ZSA9IHRoaXMuZ2V0TWluaW11bSggb3JpZW50YXRpb24gKTtcblxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggbWluaW11bVNpemUgKSApO1xuXG4gICAgICAgIHByZWZlcnJlZFNpemUgPSBNYXRoLm1heCggbWluaW11bVNpemUsIHByZWZlcnJlZFNpemUgKTtcblxuICAgICAgICBjb25zdCBtYXhTaXplID0gdGhpcy5nZXRNYXgoIG9yaWVudGF0aW9uICk7XG4gICAgICAgIGlmICggbWF4U2l6ZSAhPT0gbnVsbCApIHtcbiAgICAgICAgICBwcmVmZXJyZWRTaXplID0gTWF0aC5taW4oIG1heFNpemUsIHByZWZlcnJlZFNpemUgKTtcbiAgICAgICAgfVxuXG4gICAgICAgICggdGhpcy5ub2RlIGFzIFNpemFibGVOb2RlIClbIG9yaWVudGF0aW9uLnByZWZlcnJlZFNpemUgXSA9IHByZWZlcnJlZFNpemU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldCBwcmVmZXJyZWRXaWR0aCgpOiBudW1iZXIgfCBudWxsIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5jaGVja1ByZWNvbmRpdGlvbnMoKTtcblxuICAgIGlmICggaXNXaWR0aFNpemFibGUoIHRoaXMubm9kZSApICkge1xuICAgICAgY29uc3QgcHJlZmVycmVkV2lkdGggPSB0aGlzLm5vZGUucHJlZmVycmVkV2lkdGg7XG5cbiAgICAgIHJldHVybiBwcmVmZXJyZWRXaWR0aCA9PT0gbnVsbCA/IG51bGwgOiBNYXRoLmFicyggdGhpcy50cmFpbCEuZ2V0UGFyZW50VHJhbnNmb3JtKCkudHJhbnNmb3JtRGVsdGFYKCBwcmVmZXJyZWRXaWR0aCApICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNldCBwcmVmZXJyZWRXaWR0aCggcHJlZmVycmVkV2lkdGg6IG51bWJlciB8IG51bGwgKSB7XG4gICAgdGhpcy5hdHRlbXB0UHJlZmVycmVkU2l6ZSggT3JpZW50YXRpb24uSE9SSVpPTlRBTCwgcHJlZmVycmVkV2lkdGggKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgcHJlZmVycmVkSGVpZ2h0KCk6IG51bWJlciB8IG51bGwge1xuICAgIGFzc2VydCAmJiB0aGlzLmNoZWNrUHJlY29uZGl0aW9ucygpO1xuXG4gICAgaWYgKCBpc0hlaWdodFNpemFibGUoIHRoaXMubm9kZSApICkge1xuICAgICAgY29uc3QgcHJlZmVycmVkSGVpZ2h0ID0gdGhpcy5ub2RlLnByZWZlcnJlZEhlaWdodDtcblxuICAgICAgcmV0dXJuIHByZWZlcnJlZEhlaWdodCA9PT0gbnVsbCA/IG51bGwgOiBNYXRoLmFicyggdGhpcy50cmFpbCEuZ2V0UGFyZW50VHJhbnNmb3JtKCkudHJhbnNmb3JtRGVsdGFZKCBwcmVmZXJyZWRIZWlnaHQgKSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZXQgcHJlZmVycmVkSGVpZ2h0KCBwcmVmZXJyZWRIZWlnaHQ6IG51bWJlciB8IG51bGwgKSB7XG4gICAgdGhpcy5hdHRlbXB0UHJlZmVycmVkU2l6ZSggT3JpZW50YXRpb24uVkVSVElDQUwsIHByZWZlcnJlZEhlaWdodCApO1xuICB9XG5cbiAgcHVibGljIGdldCB2aXNpYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm5vZGUudmlzaWJsZTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgdmlzaWJsZSggdmFsdWU6IGJvb2xlYW4gKSB7XG4gICAgdGhpcy5ub2RlLnZpc2libGUgPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzLCBhbmQgZnJlZXMgaXQgdG8gdGhlIHBvb2wuXG4gICAqL1xuICBwdWJsaWMgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLnRyYWlsID0gbnVsbDtcblxuICAgIHRoaXMuZnJlZVRvUG9vbCgpO1xuICB9XG5cbiAgcHVibGljIGZyZWVUb1Bvb2woKTogdm9pZCB7XG4gICAgTGF5b3V0UHJveHkucG9vbC5mcmVlVG9Qb29sKCB0aGlzICk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IHBvb2wgPSBuZXcgUG9vbCggTGF5b3V0UHJveHksIHtcbiAgICBtYXhTaXplOiAxMDAwXG4gIH0gKTtcbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ0xheW91dFByb3h5JywgTGF5b3V0UHJveHkgKTsiXSwibmFtZXMiOlsiT3JpZW50YXRpb24iLCJQb29sIiwiaXNIZWlnaHRTaXphYmxlIiwiaXNXaWR0aFNpemFibGUiLCJzY2VuZXJ5IiwiTGF5b3V0UHJveHkiLCJpbml0aWFsaXplIiwidHJhaWwiLCJjaGVja1ByZWNvbmRpdGlvbnMiLCJhc3NlcnQiLCJnZXRQYXJlbnRNYXRyaXgiLCJpc0F4aXNBbGlnbmVkIiwibm9kZSIsImxhc3ROb2RlIiwiYm91bmRzIiwicGFyZW50VG9HbG9iYWxCb3VuZHMiLCJ2aXNpYmxlQm91bmRzIiwid2lkdGgiLCJoZWlnaHQiLCJ4IiwiZ2V0UGFyZW50VHJhbnNmb3JtIiwidHJhbnNmb3JtWCIsInZhbHVlIiwiaW52ZXJzZVgiLCJ5IiwidHJhbnNmb3JtWSIsImludmVyc2VZIiwidHJhbnNsYXRpb24iLCJ0cmFuc2Zvcm1Qb3NpdGlvbjIiLCJpbnZlcnNlUG9zaXRpb24yIiwibGVmdCIsInJpZ2h0IiwiY2VudGVyWCIsInRvcCIsImJvdHRvbSIsImNlbnRlclkiLCJsZWZ0VG9wIiwiY2VudGVyVG9wIiwicmlnaHRUb3AiLCJsZWZ0Q2VudGVyIiwiY2VudGVyIiwicmlnaHRDZW50ZXIiLCJsZWZ0Qm90dG9tIiwiY2VudGVyQm90dG9tIiwicmlnaHRCb3R0b20iLCJ3aWR0aFNpemFibGUiLCJoZWlnaHRTaXphYmxlIiwiaXNTaXphYmxlIiwib3JpZW50YXRpb24iLCJIT1JJWk9OVEFMIiwibWluaW11bVdpZHRoIiwiTWF0aCIsImFicyIsInRyYW5zZm9ybURlbHRhWCIsIm1pbmltdW1IZWlnaHQiLCJ0cmFuc2Zvcm1EZWx0YVkiLCJnZXRNaW5pbXVtIiwibWF4V2lkdGgiLCJpbnZlcnNlRGVsdGFYIiwibWF4SGVpZ2h0IiwiaW52ZXJzZURlbHRhWSIsImdldE1heCIsImF0dGVtcHRQcmVmZXJyZWRTaXplIiwicHJlZmVycmVkU2l6ZSIsIm1pbmltdW1TaXplIiwiaXNGaW5pdGUiLCJtYXgiLCJtYXhTaXplIiwibWluIiwicHJlZmVycmVkV2lkdGgiLCJwcmVmZXJyZWRIZWlnaHQiLCJWRVJUSUNBTCIsInZpc2libGUiLCJkaXNwb3NlIiwiZnJlZVRvUG9vbCIsInBvb2wiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7O0NBVUMsR0FJRCxPQUFPQSxpQkFBaUIsdUNBQXVDO0FBQy9ELE9BQU9DLFVBQVUsZ0NBQWdDO0FBQ2pELFNBQVNDLGVBQWUsRUFBRUMsY0FBYyxFQUFRQyxPQUFPLFFBQTRCLGdCQUFnQjtBQUtwRixJQUFBLEFBQU1DLGNBQU4sTUFBTUE7SUFhbkI7Ozs7Ozs7Ozs7Ozs7R0FhQyxHQUNELEFBQU9DLFdBQVlDLEtBQVksRUFBUztRQUN0QyxJQUFJLENBQUNBLEtBQUssR0FBR0E7UUFFYixPQUFPLElBQUk7SUFDYjtJQUVRQyxxQkFBMkI7UUFDakNDLFVBQVVBLE9BQVEsSUFBSSxDQUFDRixLQUFLLEVBQUU7UUFDOUJFLFVBQVVBLE9BQVEsSUFBSSxDQUFDRixLQUFLLENBQUVHLGVBQWUsR0FBR0MsYUFBYSxJQUFJO0lBQ25FO0lBRUEsSUFBV0MsT0FBYTtRQUN0QkgsVUFBVSxJQUFJLENBQUNELGtCQUFrQjtRQUVqQyxPQUFPLElBQUksQ0FBQ0QsS0FBSyxDQUFFTSxRQUFRO0lBQzdCO0lBRUE7O0dBRUMsR0FDRCxJQUFXQyxTQUFrQjtRQUMzQkwsVUFBVSxJQUFJLENBQUNELGtCQUFrQjtRQUVqQyxPQUFPLElBQUksQ0FBQ0QsS0FBSyxDQUFFUSxvQkFB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