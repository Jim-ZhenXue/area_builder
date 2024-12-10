// Copyright 2021-2024, University of Colorado Boulder
/**
 * A LayoutCell that has margins, and can be positioned and sized relative to those. Used for Flow/Grid layouts
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Bounds2 from '../../../../dot/js/Bounds2.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import OrientationPair from '../../../../phet-core/js/OrientationPair.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import { Font, LayoutAlign, LayoutCell, Node, NodePattern, Path, PressListener, Rectangle, RichText, scenery, Text } from '../../imports.js';
let MarginLayoutCell = class MarginLayoutCell extends LayoutCell {
    /**
   * Positions and sizes the cell (used for grid and flow layouts)
   * (scenery-internal)
   *
   * Returns the cell's bounds
   */ reposition(orientation, lineSize, linePosition, stretch, originOffset, align) {
        // Mimicking https://www.w3.org/TR/css-flexbox-1/#align-items-property for baseline (for our origin)
        // Origin will sync all origin-based items (so their origin matches), and then position ALL of that as if it was
        // align:left or align:top (depending on the orientation).
        const preferredSize = stretch && this.isSizable(orientation) ? lineSize : this.getMinimumSize(orientation);
        if (assert) {
            const maxSize = orientation === Orientation.HORIZONTAL ? this.node.maxWidth : this.node.maxHeight;
            assert(!this.isSizable(orientation) || maxSize === null || Math.abs(maxSize - preferredSize) > -1e-9, `Tried to set a preferred size ${preferredSize} larger than the specified max${orientation === Orientation.HORIZONTAL ? 'Width' : 'Height'} of ${maxSize}. ` + 'Ideally, try to avoid putting a maxWidth/maxHeight on a width/height-sizable Node (one that will resize to fit its preferred size) inside a layout container, ' + 'particularly one that will try to expand the Node past its maximum size.');
        }
        this.attemptPreferredSize(orientation, preferredSize);
        if (align === LayoutAlign.ORIGIN) {
            this.positionOrigin(orientation, linePosition + originOffset);
        } else {
            this.positionStart(orientation, linePosition + (lineSize - this.getCellBounds()[orientation.size]) * align.padRatio);
        }
        const cellBounds = this.getCellBounds();
        assert && assert(cellBounds.isFinite());
        this.lastAvailableBounds[orientation.minCoordinate] = linePosition;
        this.lastAvailableBounds[orientation.maxCoordinate] = linePosition + lineSize;
        this.lastUsedBounds.set(cellBounds);
        return cellBounds;
    }
    /**
   * Returns the used value, with this cell's value taking precedence over the constraint's default
   * (scenery-internal)
   */ get effectiveLeftMargin() {
        return this._leftMargin !== null ? this._leftMargin : this._marginConstraint._leftMargin;
    }
    /**
   * Returns the used value, with this cell's value taking precedence over the constraint's default
   * (scenery-internal)
   */ get effectiveRightMargin() {
        return this._rightMargin !== null ? this._rightMargin : this._marginConstraint._rightMargin;
    }
    /**
   * Returns the used value, with this cell's value taking precedence over the constraint's default
   * (scenery-internal)
   */ get effectiveTopMargin() {
        return this._topMargin !== null ? this._topMargin : this._marginConstraint._topMargin;
    }
    /**
   * Returns the used value, with this cell's value taking precedence over the constraint's default
   * (scenery-internal)
   */ get effectiveBottomMargin() {
        return this._bottomMargin !== null ? this._bottomMargin : this._marginConstraint._bottomMargin;
    }
    /**
   * (scenery-internal)
   */ getEffectiveMinMargin(orientation) {
        return orientation === Orientation.HORIZONTAL ? this.effectiveLeftMargin : this.effectiveTopMargin;
    }
    /**
   * (scenery-internal)
   */ getEffectiveMaxMargin(orientation) {
        return orientation === Orientation.HORIZONTAL ? this.effectiveRightMargin : this.effectiveBottomMargin;
    }
    /**
   * Returns the used value, with this cell's value taking precedence over the constraint's default
   * (scenery-internal)
   */ get effectiveMinContentWidth() {
        return this._minContentWidth !== null ? this._minContentWidth : this._marginConstraint._minContentWidth;
    }
    /**
   * Returns the used value, with this cell's value taking precedence over the constraint's default
   * (scenery-internal)
   */ get effectiveMinContentHeight() {
        return this._minContentHeight !== null ? this._minContentHeight : this._marginConstraint._minContentHeight;
    }
    /**
   * (scenery-internal)
   */ getEffectiveMinContent(orientation) {
        return orientation === Orientation.HORIZONTAL ? this.effectiveMinContentWidth : this.effectiveMinContentHeight;
    }
    /**
   * Returns the used value, with this cell's value taking precedence over the constraint's default
   * (scenery-internal)
   */ get effectiveMaxContentWidth() {
        return this._maxContentWidth !== null ? this._maxContentWidth : this._marginConstraint._maxContentWidth;
    }
    /**
   * Returns the used value, with this cell's value taking precedence over the constraint's default
   * (scenery-internal)
   */ get effectiveMaxContentHeight() {
        return this._maxContentHeight !== null ? this._maxContentHeight : this._marginConstraint._maxContentHeight;
    }
    /**
   * (scenery-internal)
   */ getEffectiveMaxContent(orientation) {
        return orientation === Orientation.HORIZONTAL ? this.effectiveMaxContentWidth : this.effectiveMaxContentHeight;
    }
    /**
   * Returns the effective minimum size this cell can take (including the margins)
   * (scenery-internal)
   */ getMinimumSize(orientation) {
        return this.getEffectiveMinMargin(orientation) + Math.max(this.proxy.getMinimum(orientation), this.getEffectiveMinContent(orientation) || 0) + this.getEffectiveMaxMargin(orientation);
    }
    /**
   * Returns the effective maximum size this cell can take (including the margins)
   * (scenery-internal)
   */ getMaximumSize(orientation) {
        return this.getEffectiveMinMargin(orientation) + (this.getEffectiveMaxContent(orientation) || Number.POSITIVE_INFINITY) + this.getEffectiveMaxMargin(orientation);
    }
    /**
   * Sets a preferred size on the content, obeying many constraints.
   * (scenery-internal)
   */ attemptPreferredSize(orientation, value) {
        if (this.proxy[orientation.sizable]) {
            const minimumSize = this.getMinimumSize(orientation);
            const maximumSize = this.getMaximumSize(orientation);
            assert && assert(isFinite(minimumSize));
            assert && assert(maximumSize >= minimumSize);
            value = Utils.clamp(value, minimumSize, maximumSize);
            let preferredSize = value - this.getEffectiveMinMargin(orientation) - this.getEffectiveMaxMargin(orientation);
            const maxSize = this.proxy.getMax(orientation);
            if (maxSize !== null) {
                preferredSize = Math.min(maxSize, preferredSize);
            }
            this._marginConstraint.setProxyPreferredSize(orientation, this.proxy, preferredSize);
            // Record that we set
            this.preferredSizeSet.set(orientation, true);
        }
    }
    /**
   * Unsets the preferred size (if WE set it)
   * (scenery-internal)
   */ unsetPreferredSize(orientation) {
        if (this.proxy[orientation.sizable]) {
            this._marginConstraint.setProxyPreferredSize(orientation, this.proxy, null);
        }
    }
    /**
   * Sets the left/top position of the (content+margin) for the cell in the constraint's ancestor coordinate frame.
   * (scenery-internal)
   */ positionStart(orientation, value) {
        const start = this.getEffectiveMinMargin(orientation) + value;
        this._marginConstraint.setProxyMinSide(orientation, this.proxy, start);
    }
    /**
   * Sets the x/y value of the content for the cell in the constraint's ancestor coordinate frame.
   * (scenery-internal)
   */ positionOrigin(orientation, value) {
        this._marginConstraint.setProxyOrigin(orientation, this.proxy, value);
    }
    /**
   * Returns the bounding box of the cell if it was repositioned to have its origin shifted to the origin of the
   * ancestor node's local coordinate frame.
   * (scenery-internal)
   */ getOriginBounds() {
        return this.getCellBounds().shiftedXY(-this.proxy.x, -this.proxy.y);
    }
    /**
   * The current bounds of the cell (with margins included)
   * (scenery-internal)
   */ getCellBounds() {
        return this.proxy.bounds.withOffsets(this.effectiveLeftMargin, this.effectiveTopMargin, this.effectiveRightMargin, this.effectiveBottomMargin);
    }
    dispose() {
        // Unset the specified preferred sizes that were set by our layout (when we're removed)
        Orientation.enumeration.values.forEach((orientation)=>{
            if (this.preferredSizeSet.get(orientation)) {
                this.unsetPreferredSize(orientation);
            }
        });
        super.dispose();
    }
    static createHelperNode(cells, layoutBounds, cellToText) {
        const container = new Node();
        const lineWidth = 0.4;
        const availableCellsShape = Shape.union(cells.map((cell)=>Shape.bounds(cell.lastAvailableBounds)));
        const usedCellsShape = Shape.union(cells.map((cell)=>Shape.bounds(cell.lastUsedBounds)));
        const usedContentShape = Shape.union(cells.map((cell)=>Shape.bounds(cell.proxy.bounds)));
        const spacingShape = Shape.bounds(layoutBounds).shapeDifference(availableCellsShape);
        const emptyShape = availableCellsShape.shapeDifference(usedCellsShape);
        const marginShape = usedCellsShape.shapeDifference(usedContentShape);
        const createLabeledTexture = (label, foreground, background)=>{
            const text = new Text(label, {
                font: new Font({
                    size: 6,
                    family: 'monospace'
                }),
                fill: foreground
            });
            const rectangle = Rectangle.bounds(text.bounds, {
                fill: background,
                children: [
                    text
                ]
            });
            return new NodePattern(rectangle, 4, Math.floor(rectangle.left), Math.ceil(rectangle.top + 1), Math.floor(rectangle.width), Math.floor(rectangle.height - 2), Matrix3.rotation2(-Math.PI / 4));
        };
        container.addChild(new Path(spacingShape, {
            fill: createLabeledTexture('spacing', '#000', '#fff'),
            opacity: 0.6
        }));
        container.addChild(new Path(emptyShape, {
            fill: createLabeledTexture('empty', '#aaa', '#000'),
            opacity: 0.6
        }));
        container.addChild(new Path(marginShape, {
            fill: createLabeledTexture('margin', '#600', '#f00'),
            opacity: 0.6
        }));
        container.addChild(Rectangle.bounds(layoutBounds, {
            stroke: 'white',
            lineDash: [
                2,
                2
            ],
            lineDashOffset: 2,
            lineWidth: lineWidth
        }));
        container.addChild(Rectangle.bounds(layoutBounds, {
            stroke: 'black',
            lineDash: [
                2,
                2
            ],
            lineWidth: lineWidth
        }));
        cells.forEach((cell)=>{
            container.addChild(Rectangle.bounds(cell.getCellBounds(), {
                stroke: 'rgba(0,255,0,1)',
                lineWidth: lineWidth
            }));
        });
        cells.forEach((cell)=>{
            container.addChild(Rectangle.bounds(cell.proxy.bounds, {
                stroke: 'rgba(255,0,0,1)',
                lineWidth: lineWidth
            }));
        });
        cells.forEach((cell)=>{
            const bounds = cell.getCellBounds();
            const hoverListener = new PressListener({
                tandem: Tandem.OPT_OUT
            });
            container.addChild(Rectangle.bounds(bounds, {
                inputListeners: [
                    hoverListener
                ]
            }));
            let str = cellToText(cell);
            if (cell.effectiveLeftMargin) {
                str += `leftMargin: ${cell.effectiveLeftMargin}\n`;
            }
            if (cell.effectiveRightMargin) {
                str += `rightMargin: ${cell.effectiveRightMargin}\n`;
            }
            if (cell.effectiveTopMargin) {
                str += `topMargin: ${cell.effectiveTopMargin}\n`;
            }
            if (cell.effectiveBottomMargin) {
                str += `bottomMargin: ${cell.effectiveBottomMargin}\n`;
            }
            if (cell.effectiveMinContentWidth) {
                str += `minContentWidth: ${cell.effectiveMinContentWidth}\n`;
            }
            if (cell.effectiveMinContentHeight) {
                str += `minContentHeight: ${cell.effectiveMinContentHeight}\n`;
            }
            if (cell.effectiveMaxContentWidth) {
                str += `maxContentWidth: ${cell.effectiveMaxContentWidth}\n`;
            }
            if (cell.effectiveMaxContentHeight) {
                str += `maxContentHeight: ${cell.effectiveMaxContentHeight}\n`;
            }
            str += `layoutOptions: ${JSON.stringify(cell.node.layoutOptions, null, 2).replace(/ /g, '&nbsp;')}\n`;
            const hoverText = new RichText(str.trim().replace(/\n/g, '<br>'), {
                font: new Font({
                    size: 12
                })
            });
            const hoverNode = Rectangle.bounds(hoverText.bounds.dilated(3), {
                fill: 'rgba(255,255,255,0.8)',
                children: [
                    hoverText
                ],
                leftTop: bounds.leftTop
            });
            container.addChild(hoverNode);
            hoverListener.isOverProperty.link((isOver)=>{
                hoverNode.visible = isOver;
            });
        });
        return container;
    }
    /**
   * NOTE: Consider this scenery-internal AND protected. It's effectively a protected constructor for an abstract type,
   * but cannot be due to how mixins constrain things (TypeScript doesn't work with private/protected things like this)
   *
   * (scenery-internal)
   */ constructor(constraint, node, proxy){
        super(constraint, node, proxy), this.preferredSizeSet = new OrientationPair(false, false), // (scenery-internal) Set to be the bounds available for the cell
        this.lastAvailableBounds = Bounds2.NOTHING.copy(), // (scenery-internal) Set to be the bounds used by the cell
        this.lastUsedBounds = Bounds2.NOTHING.copy();
        this._marginConstraint = constraint;
    }
};
// NOTE: This would be an abstract class, but that is incompatible with how mixin constraints work in TypeScript
export { MarginLayoutCell as default };
scenery.register('MarginLayoutCell', MarginLayoutCell);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGF5b3V0L2NvbnN0cmFpbnRzL01hcmdpbkxheW91dENlbGwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBMYXlvdXRDZWxsIHRoYXQgaGFzIG1hcmdpbnMsIGFuZCBjYW4gYmUgcG9zaXRpb25lZCBhbmQgc2l6ZWQgcmVsYXRpdmUgdG8gdGhvc2UuIFVzZWQgZm9yIEZsb3cvR3JpZCBsYXlvdXRzXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IE9yaWVudGF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9PcmllbnRhdGlvbi5qcyc7XG5pbXBvcnQgT3JpZW50YXRpb25QYWlyIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9PcmllbnRhdGlvblBhaXIuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCB7IEZvbnQsIExheW91dEFsaWduLCBMYXlvdXRDZWxsLCBMYXlvdXRQcm94eSwgTm9kZSwgTm9kZUxheW91dENvbnN0cmFpbnQsIE5vZGVQYXR0ZXJuLCBQYXRoLCBQcmVzc0xpc3RlbmVyLCBSZWN0YW5nbGUsIFJpY2hUZXh0LCBzY2VuZXJ5LCBUQ29sb3IsIFRleHQgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcblxuLy8gSW50ZXJmYWNlIGV4cGVjdGVkIHRvIGJlIG92ZXJyaWRkZW4gYnkgc3VidHlwZXMgKEdyaWRDZWxsLCBGbG93Q2VsbClcbmV4cG9ydCB0eXBlIE1hcmdpbkxheW91dCA9IHtcbiAgX2xlZnRNYXJnaW46IG51bWJlciB8IG51bGw7XG4gIF9yaWdodE1hcmdpbjogbnVtYmVyIHwgbnVsbDtcbiAgX3RvcE1hcmdpbjogbnVtYmVyIHwgbnVsbDtcbiAgX2JvdHRvbU1hcmdpbjogbnVtYmVyIHwgbnVsbDtcbiAgX21pbkNvbnRlbnRXaWR0aDogbnVtYmVyIHwgbnVsbDtcbiAgX21pbkNvbnRlbnRIZWlnaHQ6IG51bWJlciB8IG51bGw7XG4gIF9tYXhDb250ZW50V2lkdGg6IG51bWJlciB8IG51bGw7XG4gIF9tYXhDb250ZW50SGVpZ2h0OiBudW1iZXIgfCBudWxsO1xufTtcblxuZXhwb3J0IHR5cGUgTWFyZ2luTGF5b3V0Q29uc3RyYWludCA9IE5vZGVMYXlvdXRDb25zdHJhaW50ICYgTWFyZ2luTGF5b3V0O1xuXG4vLyBOT1RFOiBUaGlzIHdvdWxkIGJlIGFuIGFic3RyYWN0IGNsYXNzLCBidXQgdGhhdCBpcyBpbmNvbXBhdGlibGUgd2l0aCBob3cgbWl4aW4gY29uc3RyYWludHMgd29yayBpbiBUeXBlU2NyaXB0XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXJnaW5MYXlvdXRDZWxsIGV4dGVuZHMgTGF5b3V0Q2VsbCB7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfbWFyZ2luQ29uc3RyYWludDogTWFyZ2luTGF5b3V0Q29uc3RyYWludDtcblxuICBwcml2YXRlIHJlYWRvbmx5IHByZWZlcnJlZFNpemVTZXQ6IE9yaWVudGF0aW9uUGFpcjxib29sZWFuPiA9IG5ldyBPcmllbnRhdGlvblBhaXI8Ym9vbGVhbj4oIGZhbHNlLCBmYWxzZSApO1xuXG4gIC8vIFRoZXNlIHdpbGwgZ2V0IG92ZXJyaWRkZW4sIHRoZXkncmUgbmVlZGVkIHNpbmNlIG1peGlucyBoYXZlIG1hbnkgbGltaXRhdGlvbnMgYW5kIHdlJ2QgaGF2ZSB0byBoYXZlIGEgdG9uIG9mIGNhc3RzXG4gIC8vIHdpdGhvdXQgdGhlc2UgZXhpc3RpbmcuXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxuICBwdWJsaWMgX2xlZnRNYXJnaW4hOiBudW1iZXIgfCBudWxsO1xuICBwdWJsaWMgX3JpZ2h0TWFyZ2luITogbnVtYmVyIHwgbnVsbDtcbiAgcHVibGljIF90b3BNYXJnaW4hOiBudW1iZXIgfCBudWxsO1xuICBwdWJsaWMgX2JvdHRvbU1hcmdpbiE6IG51bWJlciB8IG51bGw7XG4gIHB1YmxpYyBfbWluQ29udGVudFdpZHRoITogbnVtYmVyIHwgbnVsbDtcbiAgcHVibGljIF9taW5Db250ZW50SGVpZ2h0ITogbnVtYmVyIHwgbnVsbDtcbiAgcHVibGljIF9tYXhDb250ZW50V2lkdGghOiBudW1iZXIgfCBudWxsO1xuICBwdWJsaWMgX21heENvbnRlbnRIZWlnaHQhOiBudW1iZXIgfCBudWxsO1xuXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKSBTZXQgdG8gYmUgdGhlIGJvdW5kcyBhdmFpbGFibGUgZm9yIHRoZSBjZWxsXG4gIHB1YmxpYyBsYXN0QXZhaWxhYmxlQm91bmRzOiBCb3VuZHMyID0gQm91bmRzMi5OT1RISU5HLmNvcHkoKTtcblxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbCkgU2V0IHRvIGJlIHRoZSBib3VuZHMgdXNlZCBieSB0aGUgY2VsbFxuICBwdWJsaWMgbGFzdFVzZWRCb3VuZHM6IEJvdW5kczIgPSBCb3VuZHMyLk5PVEhJTkcuY29weSgpO1xuXG4gIC8qKlxuICAgKiBOT1RFOiBDb25zaWRlciB0aGlzIHNjZW5lcnktaW50ZXJuYWwgQU5EIHByb3RlY3RlZC4gSXQncyBlZmZlY3RpdmVseSBhIHByb3RlY3RlZCBjb25zdHJ1Y3RvciBmb3IgYW4gYWJzdHJhY3QgdHlwZSxcbiAgICogYnV0IGNhbm5vdCBiZSBkdWUgdG8gaG93IG1peGlucyBjb25zdHJhaW4gdGhpbmdzIChUeXBlU2NyaXB0IGRvZXNuJ3Qgd29yayB3aXRoIHByaXZhdGUvcHJvdGVjdGVkIHRoaW5ncyBsaWtlIHRoaXMpXG4gICAqXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjb25zdHJhaW50OiBNYXJnaW5MYXlvdXRDb25zdHJhaW50LCBub2RlOiBOb2RlLCBwcm94eTogTGF5b3V0UHJveHkgfCBudWxsICkge1xuICAgIHN1cGVyKCBjb25zdHJhaW50LCBub2RlLCBwcm94eSApO1xuXG4gICAgdGhpcy5fbWFyZ2luQ29uc3RyYWludCA9IGNvbnN0cmFpbnQ7XG4gIH1cblxuICAvKipcbiAgICogUG9zaXRpb25zIGFuZCBzaXplcyB0aGUgY2VsbCAodXNlZCBmb3IgZ3JpZCBhbmQgZmxvdyBsYXlvdXRzKVxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogUmV0dXJucyB0aGUgY2VsbCdzIGJvdW5kc1xuICAgKi9cbiAgcHVibGljIHJlcG9zaXRpb24oIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbiwgbGluZVNpemU6IG51bWJlciwgbGluZVBvc2l0aW9uOiBudW1iZXIsIHN0cmV0Y2g6IGJvb2xlYW4sIG9yaWdpbk9mZnNldDogbnVtYmVyLCBhbGlnbjogTGF5b3V0QWxpZ24gKTogQm91bmRzMiB7XG4gICAgLy8gTWltaWNraW5nIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9jc3MtZmxleGJveC0xLyNhbGlnbi1pdGVtcy1wcm9wZXJ0eSBmb3IgYmFzZWxpbmUgKGZvciBvdXIgb3JpZ2luKVxuICAgIC8vIE9yaWdpbiB3aWxsIHN5bmMgYWxsIG9yaWdpbi1iYXNlZCBpdGVtcyAoc28gdGhlaXIgb3JpZ2luIG1hdGNoZXMpLCBhbmQgdGhlbiBwb3NpdGlvbiBBTEwgb2YgdGhhdCBhcyBpZiBpdCB3YXNcbiAgICAvLyBhbGlnbjpsZWZ0IG9yIGFsaWduOnRvcCAoZGVwZW5kaW5nIG9uIHRoZSBvcmllbnRhdGlvbikuXG5cbiAgICBjb25zdCBwcmVmZXJyZWRTaXplID0gKCBzdHJldGNoICYmIHRoaXMuaXNTaXphYmxlKCBvcmllbnRhdGlvbiApICkgPyBsaW5lU2l6ZSA6IHRoaXMuZ2V0TWluaW11bVNpemUoIG9yaWVudGF0aW9uICk7XG5cbiAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgIGNvbnN0IG1heFNpemUgPSBvcmllbnRhdGlvbiA9PT0gT3JpZW50YXRpb24uSE9SSVpPTlRBTCA/IHRoaXMubm9kZS5tYXhXaWR0aCA6IHRoaXMubm9kZS5tYXhIZWlnaHQ7XG4gICAgICBhc3NlcnQoICF0aGlzLmlzU2l6YWJsZSggb3JpZW50YXRpb24gKSB8fCBtYXhTaXplID09PSBudWxsIHx8IE1hdGguYWJzKCBtYXhTaXplIC0gcHJlZmVycmVkU2l6ZSApID4gLTFlLTksXG4gICAgICAgIGBUcmllZCB0byBzZXQgYSBwcmVmZXJyZWQgc2l6ZSAke3ByZWZlcnJlZFNpemV9IGxhcmdlciB0aGFuIHRoZSBzcGVjaWZpZWQgbWF4JHtvcmllbnRhdGlvbiA9PT0gT3JpZW50YXRpb24uSE9SSVpPTlRBTCA/ICdXaWR0aCcgOiAnSGVpZ2h0J30gb2YgJHttYXhTaXplfS4gYCArXG4gICAgICAgICdJZGVhbGx5LCB0cnkgdG8gYXZvaWQgcHV0dGluZyBhIG1heFdpZHRoL21heEhlaWdodCBvbiBhIHdpZHRoL2hlaWdodC1zaXphYmxlIE5vZGUgKG9uZSB0aGF0IHdpbGwgcmVzaXplIHRvIGZpdCBpdHMgcHJlZmVycmVkIHNpemUpIGluc2lkZSBhIGxheW91dCBjb250YWluZXIsICcgK1xuICAgICAgICAncGFydGljdWxhcmx5IG9uZSB0aGF0IHdpbGwgdHJ5IHRvIGV4cGFuZCB0aGUgTm9kZSBwYXN0IGl0cyBtYXhpbXVtIHNpemUuJyApO1xuICAgIH1cblxuICAgIHRoaXMuYXR0ZW1wdFByZWZlcnJlZFNpemUoIG9yaWVudGF0aW9uLCBwcmVmZXJyZWRTaXplICk7XG5cbiAgICBpZiAoIGFsaWduID09PSBMYXlvdXRBbGlnbi5PUklHSU4gKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uT3JpZ2luKCBvcmllbnRhdGlvbiwgbGluZVBvc2l0aW9uICsgb3JpZ2luT2Zmc2V0ICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5wb3NpdGlvblN0YXJ0KCBvcmllbnRhdGlvbiwgbGluZVBvc2l0aW9uICsgKCBsaW5lU2l6ZSAtIHRoaXMuZ2V0Q2VsbEJvdW5kcygpWyBvcmllbnRhdGlvbi5zaXplIF0gKSAqIGFsaWduLnBhZFJhdGlvICk7XG4gICAgfVxuXG4gICAgY29uc3QgY2VsbEJvdW5kcyA9IHRoaXMuZ2V0Q2VsbEJvdW5kcygpO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY2VsbEJvdW5kcy5pc0Zpbml0ZSgpICk7XG5cbiAgICB0aGlzLmxhc3RBdmFpbGFibGVCb3VuZHNbIG9yaWVudGF0aW9uLm1pbkNvb3JkaW5hdGUgXSA9IGxpbmVQb3NpdGlvbjtcbiAgICB0aGlzLmxhc3RBdmFpbGFibGVCb3VuZHNbIG9yaWVudGF0aW9uLm1heENvb3JkaW5hdGUgXSA9IGxpbmVQb3NpdGlvbiArIGxpbmVTaXplO1xuICAgIHRoaXMubGFzdFVzZWRCb3VuZHMuc2V0KCBjZWxsQm91bmRzICk7XG5cbiAgICByZXR1cm4gY2VsbEJvdW5kcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB1c2VkIHZhbHVlLCB3aXRoIHRoaXMgY2VsbCdzIHZhbHVlIHRha2luZyBwcmVjZWRlbmNlIG92ZXIgdGhlIGNvbnN0cmFpbnQncyBkZWZhdWx0XG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGdldCBlZmZlY3RpdmVMZWZ0TWFyZ2luKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2xlZnRNYXJnaW4gIT09IG51bGwgPyB0aGlzLl9sZWZ0TWFyZ2luIDogdGhpcy5fbWFyZ2luQ29uc3RyYWludC5fbGVmdE1hcmdpbiE7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdXNlZCB2YWx1ZSwgd2l0aCB0aGlzIGNlbGwncyB2YWx1ZSB0YWtpbmcgcHJlY2VkZW5jZSBvdmVyIHRoZSBjb25zdHJhaW50J3MgZGVmYXVsdFxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBnZXQgZWZmZWN0aXZlUmlnaHRNYXJnaW4oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fcmlnaHRNYXJnaW4gIT09IG51bGwgPyB0aGlzLl9yaWdodE1hcmdpbiA6IHRoaXMuX21hcmdpbkNvbnN0cmFpbnQuX3JpZ2h0TWFyZ2luITtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB1c2VkIHZhbHVlLCB3aXRoIHRoaXMgY2VsbCdzIHZhbHVlIHRha2luZyBwcmVjZWRlbmNlIG92ZXIgdGhlIGNvbnN0cmFpbnQncyBkZWZhdWx0XG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGdldCBlZmZlY3RpdmVUb3BNYXJnaW4oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdG9wTWFyZ2luICE9PSBudWxsID8gdGhpcy5fdG9wTWFyZ2luIDogdGhpcy5fbWFyZ2luQ29uc3RyYWludC5fdG9wTWFyZ2luITtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB1c2VkIHZhbHVlLCB3aXRoIHRoaXMgY2VsbCdzIHZhbHVlIHRha2luZyBwcmVjZWRlbmNlIG92ZXIgdGhlIGNvbnN0cmFpbnQncyBkZWZhdWx0XG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGdldCBlZmZlY3RpdmVCb3R0b21NYXJnaW4oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fYm90dG9tTWFyZ2luICE9PSBudWxsID8gdGhpcy5fYm90dG9tTWFyZ2luIDogdGhpcy5fbWFyZ2luQ29uc3RyYWludC5fYm90dG9tTWFyZ2luITtcbiAgfVxuXG4gIC8qKlxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBnZXRFZmZlY3RpdmVNaW5NYXJnaW4oIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbiApOiBudW1iZXIge1xuICAgIHJldHVybiBvcmllbnRhdGlvbiA9PT0gT3JpZW50YXRpb24uSE9SSVpPTlRBTCA/IHRoaXMuZWZmZWN0aXZlTGVmdE1hcmdpbiA6IHRoaXMuZWZmZWN0aXZlVG9wTWFyZ2luO1xuICB9XG5cbiAgLyoqXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGdldEVmZmVjdGl2ZU1heE1hcmdpbiggb3JpZW50YXRpb246IE9yaWVudGF0aW9uICk6IG51bWJlciB7XG4gICAgcmV0dXJuIG9yaWVudGF0aW9uID09PSBPcmllbnRhdGlvbi5IT1JJWk9OVEFMID8gdGhpcy5lZmZlY3RpdmVSaWdodE1hcmdpbiA6IHRoaXMuZWZmZWN0aXZlQm90dG9tTWFyZ2luO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHVzZWQgdmFsdWUsIHdpdGggdGhpcyBjZWxsJ3MgdmFsdWUgdGFraW5nIHByZWNlZGVuY2Ugb3ZlciB0aGUgY29uc3RyYWludCdzIGRlZmF1bHRcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgZ2V0IGVmZmVjdGl2ZU1pbkNvbnRlbnRXaWR0aCgpOiBudW1iZXIgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fbWluQ29udGVudFdpZHRoICE9PSBudWxsID8gdGhpcy5fbWluQ29udGVudFdpZHRoIDogdGhpcy5fbWFyZ2luQ29uc3RyYWludC5fbWluQ29udGVudFdpZHRoO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHVzZWQgdmFsdWUsIHdpdGggdGhpcyBjZWxsJ3MgdmFsdWUgdGFraW5nIHByZWNlZGVuY2Ugb3ZlciB0aGUgY29uc3RyYWludCdzIGRlZmF1bHRcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgZ2V0IGVmZmVjdGl2ZU1pbkNvbnRlbnRIZWlnaHQoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX21pbkNvbnRlbnRIZWlnaHQgIT09IG51bGwgPyB0aGlzLl9taW5Db250ZW50SGVpZ2h0IDogdGhpcy5fbWFyZ2luQ29uc3RyYWludC5fbWluQ29udGVudEhlaWdodDtcbiAgfVxuXG4gIC8qKlxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBnZXRFZmZlY3RpdmVNaW5Db250ZW50KCBvcmllbnRhdGlvbjogT3JpZW50YXRpb24gKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgcmV0dXJuIG9yaWVudGF0aW9uID09PSBPcmllbnRhdGlvbi5IT1JJWk9OVEFMID8gdGhpcy5lZmZlY3RpdmVNaW5Db250ZW50V2lkdGggOiB0aGlzLmVmZmVjdGl2ZU1pbkNvbnRlbnRIZWlnaHQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdXNlZCB2YWx1ZSwgd2l0aCB0aGlzIGNlbGwncyB2YWx1ZSB0YWtpbmcgcHJlY2VkZW5jZSBvdmVyIHRoZSBjb25zdHJhaW50J3MgZGVmYXVsdFxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBnZXQgZWZmZWN0aXZlTWF4Q29udGVudFdpZHRoKCk6IG51bWJlciB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9tYXhDb250ZW50V2lkdGggIT09IG51bGwgPyB0aGlzLl9tYXhDb250ZW50V2lkdGggOiB0aGlzLl9tYXJnaW5Db25zdHJhaW50Ll9tYXhDb250ZW50V2lkdGg7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdXNlZCB2YWx1ZSwgd2l0aCB0aGlzIGNlbGwncyB2YWx1ZSB0YWtpbmcgcHJlY2VkZW5jZSBvdmVyIHRoZSBjb25zdHJhaW50J3MgZGVmYXVsdFxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBnZXQgZWZmZWN0aXZlTWF4Q29udGVudEhlaWdodCgpOiBudW1iZXIgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fbWF4Q29udGVudEhlaWdodCAhPT0gbnVsbCA/IHRoaXMuX21heENvbnRlbnRIZWlnaHQgOiB0aGlzLl9tYXJnaW5Db25zdHJhaW50Ll9tYXhDb250ZW50SGVpZ2h0O1xuICB9XG5cbiAgLyoqXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGdldEVmZmVjdGl2ZU1heENvbnRlbnQoIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbiApOiBudW1iZXIgfCBudWxsIHtcbiAgICByZXR1cm4gb3JpZW50YXRpb24gPT09IE9yaWVudGF0aW9uLkhPUklaT05UQUwgPyB0aGlzLmVmZmVjdGl2ZU1heENvbnRlbnRXaWR0aCA6IHRoaXMuZWZmZWN0aXZlTWF4Q29udGVudEhlaWdodDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBlZmZlY3RpdmUgbWluaW11bSBzaXplIHRoaXMgY2VsbCBjYW4gdGFrZSAoaW5jbHVkaW5nIHRoZSBtYXJnaW5zKVxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBnZXRNaW5pbXVtU2l6ZSggb3JpZW50YXRpb246IE9yaWVudGF0aW9uICk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RWZmZWN0aXZlTWluTWFyZ2luKCBvcmllbnRhdGlvbiApICtcbiAgICAgICAgICAgTWF0aC5tYXgoIHRoaXMucHJveHkuZ2V0TWluaW11bSggb3JpZW50YXRpb24gKSwgdGhpcy5nZXRFZmZlY3RpdmVNaW5Db250ZW50KCBvcmllbnRhdGlvbiApIHx8IDAgKSArXG4gICAgICAgICAgIHRoaXMuZ2V0RWZmZWN0aXZlTWF4TWFyZ2luKCBvcmllbnRhdGlvbiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGVmZmVjdGl2ZSBtYXhpbXVtIHNpemUgdGhpcyBjZWxsIGNhbiB0YWtlIChpbmNsdWRpbmcgdGhlIG1hcmdpbnMpXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGdldE1heGltdW1TaXplKCBvcmllbnRhdGlvbjogT3JpZW50YXRpb24gKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRFZmZlY3RpdmVNaW5NYXJnaW4oIG9yaWVudGF0aW9uICkgK1xuICAgICAgICAgICAoIHRoaXMuZ2V0RWZmZWN0aXZlTWF4Q29udGVudCggb3JpZW50YXRpb24gKSB8fCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgKSArXG4gICAgICAgICAgIHRoaXMuZ2V0RWZmZWN0aXZlTWF4TWFyZ2luKCBvcmllbnRhdGlvbiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgYSBwcmVmZXJyZWQgc2l6ZSBvbiB0aGUgY29udGVudCwgb2JleWluZyBtYW55IGNvbnN0cmFpbnRzLlxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBhdHRlbXB0UHJlZmVycmVkU2l6ZSggb3JpZW50YXRpb246IE9yaWVudGF0aW9uLCB2YWx1ZTogbnVtYmVyICk6IHZvaWQge1xuICAgIGlmICggdGhpcy5wcm94eVsgb3JpZW50YXRpb24uc2l6YWJsZSBdICkge1xuICAgICAgY29uc3QgbWluaW11bVNpemUgPSB0aGlzLmdldE1pbmltdW1TaXplKCBvcmllbnRhdGlvbiApO1xuICAgICAgY29uc3QgbWF4aW11bVNpemUgPSB0aGlzLmdldE1heGltdW1TaXplKCBvcmllbnRhdGlvbiApO1xuXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggbWluaW11bVNpemUgKSApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbWF4aW11bVNpemUgPj0gbWluaW11bVNpemUgKTtcblxuICAgICAgdmFsdWUgPSBVdGlscy5jbGFtcCggdmFsdWUsIG1pbmltdW1TaXplLCBtYXhpbXVtU2l6ZSApO1xuXG4gICAgICBsZXQgcHJlZmVycmVkU2l6ZSA9IHZhbHVlIC0gdGhpcy5nZXRFZmZlY3RpdmVNaW5NYXJnaW4oIG9yaWVudGF0aW9uICkgLSB0aGlzLmdldEVmZmVjdGl2ZU1heE1hcmdpbiggb3JpZW50YXRpb24gKTtcbiAgICAgIGNvbnN0IG1heFNpemUgPSB0aGlzLnByb3h5LmdldE1heCggb3JpZW50YXRpb24gKTtcbiAgICAgIGlmICggbWF4U2l6ZSAhPT0gbnVsbCApIHtcbiAgICAgICAgcHJlZmVycmVkU2l6ZSA9IE1hdGgubWluKCBtYXhTaXplLCBwcmVmZXJyZWRTaXplICk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX21hcmdpbkNvbnN0cmFpbnQuc2V0UHJveHlQcmVmZXJyZWRTaXplKCBvcmllbnRhdGlvbiwgdGhpcy5wcm94eSwgcHJlZmVycmVkU2l6ZSApO1xuXG4gICAgICAvLyBSZWNvcmQgdGhhdCB3ZSBzZXRcbiAgICAgIHRoaXMucHJlZmVycmVkU2l6ZVNldC5zZXQoIG9yaWVudGF0aW9uLCB0cnVlICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVuc2V0cyB0aGUgcHJlZmVycmVkIHNpemUgKGlmIFdFIHNldCBpdClcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgdW5zZXRQcmVmZXJyZWRTaXplKCBvcmllbnRhdGlvbjogT3JpZW50YXRpb24gKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLnByb3h5WyBvcmllbnRhdGlvbi5zaXphYmxlIF0gKSB7XG4gICAgICB0aGlzLl9tYXJnaW5Db25zdHJhaW50LnNldFByb3h5UHJlZmVycmVkU2l6ZSggb3JpZW50YXRpb24sIHRoaXMucHJveHksIG51bGwgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgbGVmdC90b3AgcG9zaXRpb24gb2YgdGhlIChjb250ZW50K21hcmdpbikgZm9yIHRoZSBjZWxsIGluIHRoZSBjb25zdHJhaW50J3MgYW5jZXN0b3IgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgcG9zaXRpb25TdGFydCggb3JpZW50YXRpb246IE9yaWVudGF0aW9uLCB2YWx1ZTogbnVtYmVyICk6IHZvaWQge1xuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5nZXRFZmZlY3RpdmVNaW5NYXJnaW4oIG9yaWVudGF0aW9uICkgKyB2YWx1ZTtcblxuICAgIHRoaXMuX21hcmdpbkNvbnN0cmFpbnQuc2V0UHJveHlNaW5TaWRlKCBvcmllbnRhdGlvbiwgdGhpcy5wcm94eSwgc3RhcnQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB4L3kgdmFsdWUgb2YgdGhlIGNvbnRlbnQgZm9yIHRoZSBjZWxsIGluIHRoZSBjb25zdHJhaW50J3MgYW5jZXN0b3IgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgcG9zaXRpb25PcmlnaW4oIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbiwgdmFsdWU6IG51bWJlciApOiB2b2lkIHtcbiAgICB0aGlzLl9tYXJnaW5Db25zdHJhaW50LnNldFByb3h5T3JpZ2luKCBvcmllbnRhdGlvbiwgdGhpcy5wcm94eSwgdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBib3VuZGluZyBib3ggb2YgdGhlIGNlbGwgaWYgaXQgd2FzIHJlcG9zaXRpb25lZCB0byBoYXZlIGl0cyBvcmlnaW4gc2hpZnRlZCB0byB0aGUgb3JpZ2luIG9mIHRoZVxuICAgKiBhbmNlc3RvciBub2RlJ3MgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgZ2V0T3JpZ2luQm91bmRzKCk6IEJvdW5kczIge1xuICAgIHJldHVybiB0aGlzLmdldENlbGxCb3VuZHMoKS5zaGlmdGVkWFkoIC10aGlzLnByb3h5LngsIC10aGlzLnByb3h5LnkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgY3VycmVudCBib3VuZHMgb2YgdGhlIGNlbGwgKHdpdGggbWFyZ2lucyBpbmNsdWRlZClcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgZ2V0Q2VsbEJvdW5kcygpOiBCb3VuZHMyIHtcbiAgICByZXR1cm4gdGhpcy5wcm94eS5ib3VuZHMud2l0aE9mZnNldHMoXG4gICAgICB0aGlzLmVmZmVjdGl2ZUxlZnRNYXJnaW4sXG4gICAgICB0aGlzLmVmZmVjdGl2ZVRvcE1hcmdpbixcbiAgICAgIHRoaXMuZWZmZWN0aXZlUmlnaHRNYXJnaW4sXG4gICAgICB0aGlzLmVmZmVjdGl2ZUJvdHRvbU1hcmdpblxuICAgICk7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICAvLyBVbnNldCB0aGUgc3BlY2lmaWVkIHByZWZlcnJlZCBzaXplcyB0aGF0IHdlcmUgc2V0IGJ5IG91ciBsYXlvdXQgKHdoZW4gd2UncmUgcmVtb3ZlZClcbiAgICBPcmllbnRhdGlvbi5lbnVtZXJhdGlvbi52YWx1ZXMuZm9yRWFjaCggb3JpZW50YXRpb24gPT4ge1xuICAgICAgaWYgKCB0aGlzLnByZWZlcnJlZFNpemVTZXQuZ2V0KCBvcmllbnRhdGlvbiApICkge1xuICAgICAgICB0aGlzLnVuc2V0UHJlZmVycmVkU2l6ZSggb3JpZW50YXRpb24gKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGNyZWF0ZUhlbHBlck5vZGU8Q2VsbCBleHRlbmRzIE1hcmdpbkxheW91dENlbGw+KCBjZWxsczogQ2VsbFtdLCBsYXlvdXRCb3VuZHM6IEJvdW5kczIsIGNlbGxUb1RleHQ6ICggY2VsbDogQ2VsbCApID0+IHN0cmluZyApOiBOb2RlIHtcbiAgICBjb25zdCBjb250YWluZXIgPSBuZXcgTm9kZSgpO1xuICAgIGNvbnN0IGxpbmVXaWR0aCA9IDAuNDtcblxuICAgIGNvbnN0IGF2YWlsYWJsZUNlbGxzU2hhcGUgPSBTaGFwZS51bmlvbiggY2VsbHMubWFwKCBjZWxsID0+IFNoYXBlLmJvdW5kcyggY2VsbC5sYXN0QXZhaWxhYmxlQm91bmRzICkgKSApO1xuICAgIGNvbnN0IHVzZWRDZWxsc1NoYXBlID0gU2hhcGUudW5pb24oIGNlbGxzLm1hcCggY2VsbCA9PiBTaGFwZS5ib3VuZHMoIGNlbGwubGFzdFVzZWRCb3VuZHMgKSApICk7XG4gICAgY29uc3QgdXNlZENvbnRlbnRTaGFwZSA9IFNoYXBlLnVuaW9uKCBjZWxscy5tYXAoIGNlbGwgPT4gU2hhcGUuYm91bmRzKCBjZWxsLnByb3h5LmJvdW5kcyApICkgKTtcbiAgICBjb25zdCBzcGFjaW5nU2hhcGUgPSBTaGFwZS5ib3VuZHMoIGxheW91dEJvdW5kcyApLnNoYXBlRGlmZmVyZW5jZSggYXZhaWxhYmxlQ2VsbHNTaGFwZSApO1xuICAgIGNvbnN0IGVtcHR5U2hhcGUgPSBhdmFpbGFibGVDZWxsc1NoYXBlLnNoYXBlRGlmZmVyZW5jZSggdXNlZENlbGxzU2hhcGUgKTtcbiAgICBjb25zdCBtYXJnaW5TaGFwZSA9IHVzZWRDZWxsc1NoYXBlLnNoYXBlRGlmZmVyZW5jZSggdXNlZENvbnRlbnRTaGFwZSApO1xuXG4gICAgY29uc3QgY3JlYXRlTGFiZWxlZFRleHR1cmUgPSAoIGxhYmVsOiBzdHJpbmcsIGZvcmVncm91bmQ6IFRDb2xvciwgYmFja2dyb3VuZDogVENvbG9yICkgPT4ge1xuICAgICAgY29uc3QgdGV4dCA9IG5ldyBUZXh0KCBsYWJlbCwge1xuICAgICAgICBmb250OiBuZXcgRm9udCggeyBzaXplOiA2LCBmYW1pbHk6ICdtb25vc3BhY2UnIH0gKSxcbiAgICAgICAgZmlsbDogZm9yZWdyb3VuZFxuICAgICAgfSApO1xuICAgICAgY29uc3QgcmVjdGFuZ2xlID0gUmVjdGFuZ2xlLmJvdW5kcyggdGV4dC5ib3VuZHMsIHtcbiAgICAgICAgZmlsbDogYmFja2dyb3VuZCxcbiAgICAgICAgY2hpbGRyZW46IFsgdGV4dCBdXG4gICAgICB9ICk7XG4gICAgICByZXR1cm4gbmV3IE5vZGVQYXR0ZXJuKFxuICAgICAgICByZWN0YW5nbGUsXG4gICAgICAgIDQsXG4gICAgICAgIE1hdGguZmxvb3IoIHJlY3RhbmdsZS5sZWZ0ICksXG4gICAgICAgIE1hdGguY2VpbCggcmVjdGFuZ2xlLnRvcCArIDEgKSxcbiAgICAgICAgTWF0aC5mbG9vciggcmVjdGFuZ2xlLndpZHRoICksXG4gICAgICAgIE1hdGguZmxvb3IoIHJlY3RhbmdsZS5oZWlnaHQgLSAyICksXG4gICAgICAgIE1hdHJpeDMucm90YXRpb24yKCAtTWF0aC5QSSAvIDQgKVxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgY29udGFpbmVyLmFkZENoaWxkKCBuZXcgUGF0aCggc3BhY2luZ1NoYXBlLCB7XG4gICAgICBmaWxsOiBjcmVhdGVMYWJlbGVkVGV4dHVyZSggJ3NwYWNpbmcnLCAnIzAwMCcsICcjZmZmJyApLFxuICAgICAgb3BhY2l0eTogMC42XG4gICAgfSApICk7XG4gICAgY29udGFpbmVyLmFkZENoaWxkKCBuZXcgUGF0aCggZW1wdHlTaGFwZSwge1xuICAgICAgZmlsbDogY3JlYXRlTGFiZWxlZFRleHR1cmUoICdlbXB0eScsICcjYWFhJywgJyMwMDAnICksXG4gICAgICBvcGFjaXR5OiAwLjZcbiAgICB9ICkgKTtcbiAgICBjb250YWluZXIuYWRkQ2hpbGQoIG5ldyBQYXRoKCBtYXJnaW5TaGFwZSwge1xuICAgICAgZmlsbDogY3JlYXRlTGFiZWxlZFRleHR1cmUoICdtYXJnaW4nLCAnIzYwMCcsICcjZjAwJyApLFxuICAgICAgb3BhY2l0eTogMC42XG4gICAgfSApICk7XG5cbiAgICBjb250YWluZXIuYWRkQ2hpbGQoIFJlY3RhbmdsZS5ib3VuZHMoIGxheW91dEJvdW5kcywge1xuICAgICAgc3Ryb2tlOiAnd2hpdGUnLFxuICAgICAgbGluZURhc2g6IFsgMiwgMiBdLFxuICAgICAgbGluZURhc2hPZmZzZXQ6IDIsXG4gICAgICBsaW5lV2lkdGg6IGxpbmVXaWR0aFxuICAgIH0gKSApO1xuICAgIGNvbnRhaW5lci5hZGRDaGlsZCggUmVjdGFuZ2xlLmJvdW5kcyggbGF5b3V0Qm91bmRzLCB7XG4gICAgICBzdHJva2U6ICdibGFjaycsXG4gICAgICBsaW5lRGFzaDogWyAyLCAyIF0sXG4gICAgICBsaW5lV2lkdGg6IGxpbmVXaWR0aFxuICAgIH0gKSApO1xuXG4gICAgY2VsbHMuZm9yRWFjaCggY2VsbCA9PiB7XG4gICAgICBjb250YWluZXIuYWRkQ2hpbGQoIFJlY3RhbmdsZS5ib3VuZHMoIGNlbGwuZ2V0Q2VsbEJvdW5kcygpLCB7XG4gICAgICAgIHN0cm9rZTogJ3JnYmEoMCwyNTUsMCwxKScsXG4gICAgICAgIGxpbmVXaWR0aDogbGluZVdpZHRoXG4gICAgICB9ICkgKTtcbiAgICB9ICk7XG5cbiAgICBjZWxscy5mb3JFYWNoKCBjZWxsID0+IHtcbiAgICAgIGNvbnRhaW5lci5hZGRDaGlsZCggUmVjdGFuZ2xlLmJvdW5kcyggY2VsbC5wcm94eS5ib3VuZHMsIHtcbiAgICAgICAgc3Ryb2tlOiAncmdiYSgyNTUsMCwwLDEpJyxcbiAgICAgICAgbGluZVdpZHRoOiBsaW5lV2lkdGhcbiAgICAgIH0gKSApO1xuICAgIH0gKTtcblxuICAgIGNlbGxzLmZvckVhY2goIGNlbGwgPT4ge1xuICAgICAgY29uc3QgYm91bmRzID0gY2VsbC5nZXRDZWxsQm91bmRzKCk7XG5cbiAgICAgIGNvbnN0IGhvdmVyTGlzdGVuZXIgPSBuZXcgUHJlc3NMaXN0ZW5lcigge1xuICAgICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXG4gICAgICB9ICk7XG4gICAgICBjb250YWluZXIuYWRkQ2hpbGQoIFJlY3RhbmdsZS5ib3VuZHMoIGJvdW5kcywge1xuICAgICAgICBpbnB1dExpc3RlbmVyczogWyBob3Zlckxpc3RlbmVyIF1cbiAgICAgIH0gKSApO1xuXG4gICAgICBsZXQgc3RyID0gY2VsbFRvVGV4dCggY2VsbCApO1xuXG4gICAgICBpZiAoIGNlbGwuZWZmZWN0aXZlTGVmdE1hcmdpbiApIHtcbiAgICAgICAgc3RyICs9IGBsZWZ0TWFyZ2luOiAke2NlbGwuZWZmZWN0aXZlTGVmdE1hcmdpbn1cXG5gO1xuICAgICAgfVxuICAgICAgaWYgKCBjZWxsLmVmZmVjdGl2ZVJpZ2h0TWFyZ2luICkge1xuICAgICAgICBzdHIgKz0gYHJpZ2h0TWFyZ2luOiAke2NlbGwuZWZmZWN0aXZlUmlnaHRNYXJnaW59XFxuYDtcbiAgICAgIH1cbiAgICAgIGlmICggY2VsbC5lZmZlY3RpdmVUb3BNYXJnaW4gKSB7XG4gICAgICAgIHN0ciArPSBgdG9wTWFyZ2luOiAke2NlbGwuZWZmZWN0aXZlVG9wTWFyZ2lufVxcbmA7XG4gICAgICB9XG4gICAgICBpZiAoIGNlbGwuZWZmZWN0aXZlQm90dG9tTWFyZ2luICkge1xuICAgICAgICBzdHIgKz0gYGJvdHRvbU1hcmdpbjogJHtjZWxsLmVmZmVjdGl2ZUJvdHRvbU1hcmdpbn1cXG5gO1xuICAgICAgfVxuICAgICAgaWYgKCBjZWxsLmVmZmVjdGl2ZU1pbkNvbnRlbnRXaWR0aCApIHtcbiAgICAgICAgc3RyICs9IGBtaW5Db250ZW50V2lkdGg6ICR7Y2VsbC5lZmZlY3RpdmVNaW5Db250ZW50V2lkdGh9XFxuYDtcbiAgICAgIH1cbiAgICAgIGlmICggY2VsbC5lZmZlY3RpdmVNaW5Db250ZW50SGVpZ2h0ICkge1xuICAgICAgICBzdHIgKz0gYG1pbkNvbnRlbnRIZWlnaHQ6ICR7Y2VsbC5lZmZlY3RpdmVNaW5Db250ZW50SGVpZ2h0fVxcbmA7XG4gICAgICB9XG4gICAgICBpZiAoIGNlbGwuZWZmZWN0aXZlTWF4Q29udGVudFdpZHRoICkge1xuICAgICAgICBzdHIgKz0gYG1heENvbnRlbnRXaWR0aDogJHtjZWxsLmVmZmVjdGl2ZU1heENvbnRlbnRXaWR0aH1cXG5gO1xuICAgICAgfVxuICAgICAgaWYgKCBjZWxsLmVmZmVjdGl2ZU1heENvbnRlbnRIZWlnaHQgKSB7XG4gICAgICAgIHN0ciArPSBgbWF4Q29udGVudEhlaWdodDogJHtjZWxsLmVmZmVjdGl2ZU1heENvbnRlbnRIZWlnaHR9XFxuYDtcbiAgICAgIH1cbiAgICAgIHN0ciArPSBgbGF5b3V0T3B0aW9uczogJHtKU09OLnN0cmluZ2lmeSggY2VsbC5ub2RlLmxheW91dE9wdGlvbnMsIG51bGwsIDIgKS5yZXBsYWNlKCAvIC9nLCAnJm5ic3A7JyApfVxcbmA7XG5cbiAgICAgIGNvbnN0IGhvdmVyVGV4dCA9IG5ldyBSaWNoVGV4dCggc3RyLnRyaW0oKS5yZXBsYWNlKCAvXFxuL2csICc8YnI+JyApLCB7XG4gICAgICAgIGZvbnQ6IG5ldyBGb250KCB7IHNpemU6IDEyIH0gKVxuICAgICAgfSApO1xuICAgICAgY29uc3QgaG92ZXJOb2RlID0gUmVjdGFuZ2xlLmJvdW5kcyggaG92ZXJUZXh0LmJvdW5kcy5kaWxhdGVkKCAzICksIHtcbiAgICAgICAgZmlsbDogJ3JnYmEoMjU1LDI1NSwyNTUsMC44KScsXG4gICAgICAgIGNoaWxkcmVuOiBbIGhvdmVyVGV4dCBdLFxuICAgICAgICBsZWZ0VG9wOiBib3VuZHMubGVmdFRvcFxuICAgICAgfSApO1xuICAgICAgY29udGFpbmVyLmFkZENoaWxkKCBob3Zlck5vZGUgKTtcbiAgICAgIGhvdmVyTGlzdGVuZXIuaXNPdmVyUHJvcGVydHkubGluayggaXNPdmVyID0+IHtcbiAgICAgICAgaG92ZXJOb2RlLnZpc2libGUgPSBpc092ZXI7XG4gICAgICB9ICk7XG4gICAgfSApO1xuXG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnTWFyZ2luTGF5b3V0Q2VsbCcsIE1hcmdpbkxheW91dENlbGwgKTsiXSwibmFtZXMiOlsiQm91bmRzMiIsIk1hdHJpeDMiLCJVdGlscyIsIlNoYXBlIiwiT3JpZW50YXRpb24iLCJPcmllbnRhdGlvblBhaXIiLCJUYW5kZW0iLCJGb250IiwiTGF5b3V0QWxpZ24iLCJMYXlvdXRDZWxsIiwiTm9kZSIsIk5vZGVQYXR0ZXJuIiwiUGF0aCIsIlByZXNzTGlzdGVuZXIiLCJSZWN0YW5nbGUiLCJSaWNoVGV4dCIsInNjZW5lcnkiLCJUZXh0IiwiTWFyZ2luTGF5b3V0Q2VsbCIsInJlcG9zaXRpb24iLCJvcmllbnRhdGlvbiIsImxpbmVTaXplIiwibGluZVBvc2l0aW9uIiwic3RyZXRjaCIsIm9yaWdpbk9mZnNldCIsImFsaWduIiwicHJlZmVycmVkU2l6ZSIsImlzU2l6YWJsZSIsImdldE1pbmltdW1TaXplIiwiYXNzZXJ0IiwibWF4U2l6ZSIsIkhPUklaT05UQUwiLCJub2RlIiwibWF4V2lkdGgiLCJtYXhIZWlnaHQiLCJNYXRoIiwiYWJzIiwiYXR0ZW1wdFByZWZlcnJlZFNpemUiLCJPUklHSU4iLCJwb3NpdGlvbk9yaWdpbiIsInBvc2l0aW9uU3RhcnQiLCJnZXRDZWxsQm91bmRzIiwic2l6ZSIsInBhZFJhdGlvIiwiY2VsbEJvdW5kcyIsImlzRmluaXRlIiwibGFzdEF2YWlsYWJsZUJvdW5kcyIsIm1pbkNvb3JkaW5hdGUiLCJtYXhDb29yZGluYXRlIiwibGFzdFVzZWRCb3VuZHMiLCJzZXQiLCJlZmZlY3RpdmVMZWZ0TWFyZ2luIiwiX2xlZnRNYXJnaW4iLCJfbWFyZ2luQ29uc3RyYWludCIsImVmZmVjdGl2ZVJpZ2h0TWFyZ2luIiwiX3JpZ2h0TWFyZ2luIiwiZWZmZWN0aXZlVG9wTWFyZ2luIiwiX3RvcE1hcmdpbiIsImVmZmVjdGl2ZUJvdHRvbU1hcmdpbiIsIl9ib3R0b21NYXJnaW4iLCJnZXRFZmZlY3RpdmVNaW5NYXJnaW4iLCJnZXRFZmZlY3RpdmVNYXhNYXJnaW4iLCJlZmZlY3RpdmVNaW5Db250ZW50V2lkdGgiLCJfbWluQ29udGVudFdpZHRoIiwiZWZmZWN0aXZlTWluQ29udGVudEhlaWdodCIsIl9taW5Db250ZW50SGVpZ2h0IiwiZ2V0RWZmZWN0aXZlTWluQ29udGVudCIsImVmZmVjdGl2ZU1heENvbnRlbnRXaWR0aCIsIl9tYXhDb250ZW50V2lkdGgiLCJlZmZlY3RpdmVNYXhDb250ZW50SGVpZ2h0IiwiX21heENvbnRlbnRIZWlnaHQiLCJnZXRFZmZlY3RpdmVNYXhDb250ZW50IiwibWF4IiwicHJveHkiLCJnZXRNaW5pbXVtIiwiZ2V0TWF4aW11bVNpemUiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsInZhbHVlIiwic2l6YWJsZSIsIm1pbmltdW1TaXplIiwibWF4aW11bVNpemUiLCJjbGFtcCIsImdldE1heCIsIm1pbiIsInNldFByb3h5UHJlZmVycmVkU2l6ZSIsInByZWZlcnJlZFNpemVTZXQiLCJ1bnNldFByZWZlcnJlZFNpemUiLCJzdGFydCIsInNldFByb3h5TWluU2lkZSIsInNldFByb3h5T3JpZ2luIiwiZ2V0T3JpZ2luQm91bmRzIiwic2hpZnRlZFhZIiwieCIsInkiLCJib3VuZHMiLCJ3aXRoT2Zmc2V0cyIsImRpc3Bvc2UiLCJlbnVtZXJhdGlvbiIsInZhbHVlcyIsImZvckVhY2giLCJnZXQiLCJjcmVhdGVIZWxwZXJOb2RlIiwiY2VsbHMiLCJsYXlvdXRCb3VuZHMiLCJjZWxsVG9UZXh0IiwiY29udGFpbmVyIiwibGluZVdpZHRoIiwiYXZhaWxhYmxlQ2VsbHNTaGFwZSIsInVuaW9uIiwibWFwIiwiY2VsbCIsInVzZWRDZWxsc1NoYXBlIiwidXNlZENvbnRlbnRTaGFwZSIsInNwYWNpbmdTaGFwZSIsInNoYXBlRGlmZmVyZW5jZSIsImVtcHR5U2hhcGUiLCJtYXJnaW5TaGFwZSIsImNyZWF0ZUxhYmVsZWRUZXh0dXJlIiwibGFiZWwiLCJmb3JlZ3JvdW5kIiwiYmFja2dyb3VuZCIsInRleHQiLCJmb250IiwiZmFtaWx5IiwiZmlsbCIsInJlY3RhbmdsZSIsImNoaWxkcmVuIiwiZmxvb3IiLCJsZWZ0IiwiY2VpbCIsInRvcCIsIndpZHRoIiwiaGVpZ2h0Iiwicm90YXRpb24yIiwiUEkiLCJhZGRDaGlsZCIsIm9wYWNpdHkiLCJzdHJva2UiLCJsaW5lRGFzaCIsImxpbmVEYXNoT2Zmc2V0IiwiaG92ZXJMaXN0ZW5lciIsInRhbmRlbSIsIk9QVF9PVVQiLCJpbnB1dExpc3RlbmVycyIsInN0ciIsIkpTT04iLCJzdHJpbmdpZnkiLCJsYXlvdXRPcHRpb25zIiwicmVwbGFjZSIsImhvdmVyVGV4dCIsInRyaW0iLCJob3Zlck5vZGUiLCJkaWxhdGVkIiwibGVmdFRvcCIsImlzT3ZlclByb3BlcnR5IiwibGluayIsImlz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