// Copyright 2016-2024, University of Colorado Boulder
/**
 * WebGL drawable for Rectangle nodes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { isTReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Poolable from '../../../../phet-core/js/Poolable.js';
import { Color, RectangleStatefulDrawable, Renderer, scenery, WebGLSelfDrawable } from '../../imports.js';
const scratchColor = new Color('transparent');
let RectangleWebGLDrawable = class RectangleWebGLDrawable extends RectangleStatefulDrawable(WebGLSelfDrawable) {
    /**
   * @public
   * @override
   *
   * @param {number} renderer
   * @param {Instance} instance
   */ initialize(renderer, instance) {
        super.initialize(renderer, instance);
        if (!this.vertexArray) {
            // format [X Y R G B A] for all vertices
            this.vertexArray = new Float32Array(6 * 6); // 6-length components for 6 vertices (2 tris).
        }
        // corner vertices in the relative transform root coordinate space
        this.upperLeft = new Vector2(0, 0);
        this.lowerLeft = new Vector2(0, 0);
        this.upperRight = new Vector2(0, 0);
        this.lowerRight = new Vector2(0, 0);
        this.transformDirty = true;
        this.includeVertices = true; // used by the processor
    }
    /**
   * @public
   *
   * @param {WebGLBlock} webglBlock
   */ onAddToBlock(webglBlock) {
        this.webglBlock = webglBlock; // TODO: do we need this reference? https://github.com/phetsims/scenery/issues/1581
        this.markDirty();
    }
    /**
   * @public
   *
   * @param {WebGLBlock} webglBlock
   */ onRemoveFromBlock(webglBlock) {}
    /**
   * @public
   * @override
   */ markTransformDirty() {
        this.transformDirty = true;
        super.markTransformDirty();
    }
    /**
   * Updates the DOM appearance of this drawable (whether by preparing/calling draw calls, DOM element updates, etc.)
   * @public
   * @override
   *
   * @returns {boolean} - Whether the update should continue (if false, further updates in supertype steps should not
   *                      be done).
   */ update() {
        // See if we need to actually update things (will bail out if we are not dirty, or if we've been disposed)
        if (!super.update()) {
            return false;
        }
        if (this.dirtyFill) {
            this.includeVertices = this.node.hasFill();
            if (this.includeVertices) {
                const fill = isTReadOnlyProperty(this.node.fill) ? this.node.fill.value : this.node.fill;
                const color = scratchColor.set(fill);
                const red = color.red / 255;
                const green = color.green / 255;
                const blue = color.blue / 255;
                const alpha = color.alpha;
                for(let i = 0; i < 6; i++){
                    const offset = i * 6;
                    this.vertexArray[2 + offset] = red;
                    this.vertexArray[3 + offset] = green;
                    this.vertexArray[4 + offset] = blue;
                    this.vertexArray[5 + offset] = alpha;
                }
            }
        }
        if (this.transformDirty || this.dirtyX || this.dirtyY || this.dirtyWidth || this.dirtyHeight) {
            this.transformDirty = false;
            const x = this.node._rectX;
            const y = this.node._rectY;
            const width = this.node._rectWidth;
            const height = this.node._rectHeight;
            const transformMatrix = this.instance.relativeTransform.matrix; // with compute need, should always be accurate
            transformMatrix.multiplyVector2(this.upperLeft.setXY(x, y));
            transformMatrix.multiplyVector2(this.lowerLeft.setXY(x, y + height));
            transformMatrix.multiplyVector2(this.upperRight.setXY(x + width, y));
            transformMatrix.multiplyVector2(this.lowerRight.setXY(x + width, y + height));
            // first triangle XYs
            this.vertexArray[0] = this.upperLeft.x;
            this.vertexArray[1] = this.upperLeft.y;
            this.vertexArray[6] = this.lowerLeft.x;
            this.vertexArray[7] = this.lowerLeft.y;
            this.vertexArray[12] = this.upperRight.x;
            this.vertexArray[13] = this.upperRight.y;
            // second triangle XYs
            this.vertexArray[18] = this.upperRight.x;
            this.vertexArray[19] = this.upperRight.y;
            this.vertexArray[24] = this.lowerLeft.x;
            this.vertexArray[25] = this.lowerLeft.y;
            this.vertexArray[30] = this.lowerRight.x;
            this.vertexArray[31] = this.lowerRight.y;
        }
        this.setToCleanState();
        this.cleanPaintableState();
        return true;
    }
};
RectangleWebGLDrawable.prototype.webglRenderer = Renderer.webglVertexColorPolygons;
scenery.register('RectangleWebGLDrawable', RectangleWebGLDrawable);
Poolable.mixInto(RectangleWebGLDrawable);
export default RectangleWebGLDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvUmVjdGFuZ2xlV2ViR0xEcmF3YWJsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBXZWJHTCBkcmF3YWJsZSBmb3IgUmVjdGFuZ2xlIG5vZGVzLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgeyBpc1RSZWFkT25seVByb3BlcnR5IH0gZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgUG9vbGFibGUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2xhYmxlLmpzJztcbmltcG9ydCB7IENvbG9yLCBSZWN0YW5nbGVTdGF0ZWZ1bERyYXdhYmxlLCBSZW5kZXJlciwgc2NlbmVyeSwgV2ViR0xTZWxmRHJhd2FibGUgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcblxuY29uc3Qgc2NyYXRjaENvbG9yID0gbmV3IENvbG9yKCAndHJhbnNwYXJlbnQnICk7XG5cbmNsYXNzIFJlY3RhbmdsZVdlYkdMRHJhd2FibGUgZXh0ZW5kcyBSZWN0YW5nbGVTdGF0ZWZ1bERyYXdhYmxlKCBXZWJHTFNlbGZEcmF3YWJsZSApIHtcbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlclxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxuICAgKi9cbiAgaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlICkge1xuICAgIHN1cGVyLmluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSApO1xuXG4gICAgaWYgKCAhdGhpcy52ZXJ0ZXhBcnJheSApIHtcbiAgICAgIC8vIGZvcm1hdCBbWCBZIFIgRyBCIEFdIGZvciBhbGwgdmVydGljZXNcbiAgICAgIHRoaXMudmVydGV4QXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KCA2ICogNiApOyAvLyA2LWxlbmd0aCBjb21wb25lbnRzIGZvciA2IHZlcnRpY2VzICgyIHRyaXMpLlxuICAgIH1cblxuICAgIC8vIGNvcm5lciB2ZXJ0aWNlcyBpbiB0aGUgcmVsYXRpdmUgdHJhbnNmb3JtIHJvb3QgY29vcmRpbmF0ZSBzcGFjZVxuICAgIHRoaXMudXBwZXJMZWZ0ID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcbiAgICB0aGlzLmxvd2VyTGVmdCA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XG4gICAgdGhpcy51cHBlclJpZ2h0ID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcbiAgICB0aGlzLmxvd2VyUmlnaHQgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xuXG4gICAgdGhpcy50cmFuc2Zvcm1EaXJ0eSA9IHRydWU7XG4gICAgdGhpcy5pbmNsdWRlVmVydGljZXMgPSB0cnVlOyAvLyB1c2VkIGJ5IHRoZSBwcm9jZXNzb3JcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xCbG9ja30gd2ViZ2xCbG9ja1xuICAgKi9cbiAgb25BZGRUb0Jsb2NrKCB3ZWJnbEJsb2NrICkge1xuICAgIHRoaXMud2ViZ2xCbG9jayA9IHdlYmdsQmxvY2s7IC8vIFRPRE86IGRvIHdlIG5lZWQgdGhpcyByZWZlcmVuY2U/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgdGhpcy5tYXJrRGlydHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xCbG9ja30gd2ViZ2xCbG9ja1xuICAgKi9cbiAgb25SZW1vdmVGcm9tQmxvY2soIHdlYmdsQmxvY2sgKSB7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIG1hcmtUcmFuc2Zvcm1EaXJ0eSgpIHtcbiAgICB0aGlzLnRyYW5zZm9ybURpcnR5ID0gdHJ1ZTtcblxuICAgIHN1cGVyLm1hcmtUcmFuc2Zvcm1EaXJ0eSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIERPTSBhcHBlYXJhbmNlIG9mIHRoaXMgZHJhd2FibGUgKHdoZXRoZXIgYnkgcHJlcGFyaW5nL2NhbGxpbmcgZHJhdyBjYWxscywgRE9NIGVsZW1lbnQgdXBkYXRlcywgZXRjLilcbiAgICogQHB1YmxpY1xuICAgKiBAb3ZlcnJpZGVcbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59IC0gV2hldGhlciB0aGUgdXBkYXRlIHNob3VsZCBjb250aW51ZSAoaWYgZmFsc2UsIGZ1cnRoZXIgdXBkYXRlcyBpbiBzdXBlcnR5cGUgc3RlcHMgc2hvdWxkIG5vdFxuICAgKiAgICAgICAgICAgICAgICAgICAgICBiZSBkb25lKS5cbiAgICovXG4gIHVwZGF0ZSgpIHtcbiAgICAvLyBTZWUgaWYgd2UgbmVlZCB0byBhY3R1YWxseSB1cGRhdGUgdGhpbmdzICh3aWxsIGJhaWwgb3V0IGlmIHdlIGFyZSBub3QgZGlydHksIG9yIGlmIHdlJ3ZlIGJlZW4gZGlzcG9zZWQpXG4gICAgaWYgKCAhc3VwZXIudXBkYXRlKCkgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCB0aGlzLmRpcnR5RmlsbCApIHtcbiAgICAgIHRoaXMuaW5jbHVkZVZlcnRpY2VzID0gdGhpcy5ub2RlLmhhc0ZpbGwoKTtcblxuICAgICAgaWYgKCB0aGlzLmluY2x1ZGVWZXJ0aWNlcyApIHtcbiAgICAgICAgY29uc3QgZmlsbCA9ICggaXNUUmVhZE9ubHlQcm9wZXJ0eSggdGhpcy5ub2RlLmZpbGwgKSApID9cbiAgICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZS5maWxsLnZhbHVlIDogdGhpcy5ub2RlLmZpbGw7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gc2NyYXRjaENvbG9yLnNldCggZmlsbCApO1xuICAgICAgICBjb25zdCByZWQgPSBjb2xvci5yZWQgLyAyNTU7XG4gICAgICAgIGNvbnN0IGdyZWVuID0gY29sb3IuZ3JlZW4gLyAyNTU7XG4gICAgICAgIGNvbnN0IGJsdWUgPSBjb2xvci5ibHVlIC8gMjU1O1xuICAgICAgICBjb25zdCBhbHBoYSA9IGNvbG9yLmFscGhhO1xuXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IDY7IGkrKyApIHtcbiAgICAgICAgICBjb25zdCBvZmZzZXQgPSBpICogNjtcbiAgICAgICAgICB0aGlzLnZlcnRleEFycmF5WyAyICsgb2Zmc2V0IF0gPSByZWQ7XG4gICAgICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgMyArIG9mZnNldCBdID0gZ3JlZW47XG4gICAgICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgNCArIG9mZnNldCBdID0gYmx1ZTtcbiAgICAgICAgICB0aGlzLnZlcnRleEFycmF5WyA1ICsgb2Zmc2V0IF0gPSBhbHBoYTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICggdGhpcy50cmFuc2Zvcm1EaXJ0eSB8fCB0aGlzLmRpcnR5WCB8fCB0aGlzLmRpcnR5WSB8fCB0aGlzLmRpcnR5V2lkdGggfHwgdGhpcy5kaXJ0eUhlaWdodCApIHtcbiAgICAgIHRoaXMudHJhbnNmb3JtRGlydHkgPSBmYWxzZTtcblxuICAgICAgY29uc3QgeCA9IHRoaXMubm9kZS5fcmVjdFg7XG4gICAgICBjb25zdCB5ID0gdGhpcy5ub2RlLl9yZWN0WTtcbiAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy5ub2RlLl9yZWN0V2lkdGg7XG4gICAgICBjb25zdCBoZWlnaHQgPSB0aGlzLm5vZGUuX3JlY3RIZWlnaHQ7XG5cbiAgICAgIGNvbnN0IHRyYW5zZm9ybU1hdHJpeCA9IHRoaXMuaW5zdGFuY2UucmVsYXRpdmVUcmFuc2Zvcm0ubWF0cml4OyAvLyB3aXRoIGNvbXB1dGUgbmVlZCwgc2hvdWxkIGFsd2F5cyBiZSBhY2N1cmF0ZVxuICAgICAgdHJhbnNmb3JtTWF0cml4Lm11bHRpcGx5VmVjdG9yMiggdGhpcy51cHBlckxlZnQuc2V0WFkoIHgsIHkgKSApO1xuICAgICAgdHJhbnNmb3JtTWF0cml4Lm11bHRpcGx5VmVjdG9yMiggdGhpcy5sb3dlckxlZnQuc2V0WFkoIHgsIHkgKyBoZWlnaHQgKSApO1xuICAgICAgdHJhbnNmb3JtTWF0cml4Lm11bHRpcGx5VmVjdG9yMiggdGhpcy51cHBlclJpZ2h0LnNldFhZKCB4ICsgd2lkdGgsIHkgKSApO1xuICAgICAgdHJhbnNmb3JtTWF0cml4Lm11bHRpcGx5VmVjdG9yMiggdGhpcy5sb3dlclJpZ2h0LnNldFhZKCB4ICsgd2lkdGgsIHkgKyBoZWlnaHQgKSApO1xuXG4gICAgICAvLyBmaXJzdCB0cmlhbmdsZSBYWXNcbiAgICAgIHRoaXMudmVydGV4QXJyYXlbIDAgXSA9IHRoaXMudXBwZXJMZWZ0Lng7XG4gICAgICB0aGlzLnZlcnRleEFycmF5WyAxIF0gPSB0aGlzLnVwcGVyTGVmdC55O1xuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgNiBdID0gdGhpcy5sb3dlckxlZnQueDtcbiAgICAgIHRoaXMudmVydGV4QXJyYXlbIDcgXSA9IHRoaXMubG93ZXJMZWZ0Lnk7XG4gICAgICB0aGlzLnZlcnRleEFycmF5WyAxMiBdID0gdGhpcy51cHBlclJpZ2h0Lng7XG4gICAgICB0aGlzLnZlcnRleEFycmF5WyAxMyBdID0gdGhpcy51cHBlclJpZ2h0Lnk7XG5cbiAgICAgIC8vIHNlY29uZCB0cmlhbmdsZSBYWXNcbiAgICAgIHRoaXMudmVydGV4QXJyYXlbIDE4IF0gPSB0aGlzLnVwcGVyUmlnaHQueDtcbiAgICAgIHRoaXMudmVydGV4QXJyYXlbIDE5IF0gPSB0aGlzLnVwcGVyUmlnaHQueTtcbiAgICAgIHRoaXMudmVydGV4QXJyYXlbIDI0IF0gPSB0aGlzLmxvd2VyTGVmdC54O1xuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgMjUgXSA9IHRoaXMubG93ZXJMZWZ0Lnk7XG4gICAgICB0aGlzLnZlcnRleEFycmF5WyAzMCBdID0gdGhpcy5sb3dlclJpZ2h0Lng7XG4gICAgICB0aGlzLnZlcnRleEFycmF5WyAzMSBdID0gdGhpcy5sb3dlclJpZ2h0Lnk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRUb0NsZWFuU3RhdGUoKTtcbiAgICB0aGlzLmNsZWFuUGFpbnRhYmxlU3RhdGUoKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cblJlY3RhbmdsZVdlYkdMRHJhd2FibGUucHJvdG90eXBlLndlYmdsUmVuZGVyZXIgPSBSZW5kZXJlci53ZWJnbFZlcnRleENvbG9yUG9seWdvbnM7XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdSZWN0YW5nbGVXZWJHTERyYXdhYmxlJywgUmVjdGFuZ2xlV2ViR0xEcmF3YWJsZSApO1xuXG5Qb29sYWJsZS5taXhJbnRvKCBSZWN0YW5nbGVXZWJHTERyYXdhYmxlICk7XG5cbmV4cG9ydCBkZWZhdWx0IFJlY3RhbmdsZVdlYkdMRHJhd2FibGU7Il0sIm5hbWVzIjpbImlzVFJlYWRPbmx5UHJvcGVydHkiLCJWZWN0b3IyIiwiUG9vbGFibGUiLCJDb2xvciIsIlJlY3RhbmdsZVN0YXRlZnVsRHJhd2FibGUiLCJSZW5kZXJlciIsInNjZW5lcnkiLCJXZWJHTFNlbGZEcmF3YWJsZSIsInNjcmF0Y2hDb2xvciIsIlJlY3RhbmdsZVdlYkdMRHJhd2FibGUiLCJpbml0aWFsaXplIiwicmVuZGVyZXIiLCJpbnN0YW5jZSIsInZlcnRleEFycmF5IiwiRmxvYXQzMkFycmF5IiwidXBwZXJMZWZ0IiwibG93ZXJMZWZ0IiwidXBwZXJSaWdodCIsImxvd2VyUmlnaHQiLCJ0cmFuc2Zvcm1EaXJ0eSIsImluY2x1ZGVWZXJ0aWNlcyIsIm9uQWRkVG9CbG9jayIsIndlYmdsQmxvY2siLCJtYXJrRGlydHkiLCJvblJlbW92ZUZyb21CbG9jayIsIm1hcmtUcmFuc2Zvcm1EaXJ0eSIsInVwZGF0ZSIsImRpcnR5RmlsbCIsIm5vZGUiLCJoYXNGaWxsIiwiZmlsbCIsInZhbHVlIiwiY29sb3IiLCJzZXQiLCJyZWQiLCJncmVlbiIsImJsdWUiLCJhbHBoYSIsImkiLCJvZmZzZXQiLCJkaXJ0eVgiLCJkaXJ0eVkiLCJkaXJ0eVdpZHRoIiwiZGlydHlIZWlnaHQiLCJ4IiwiX3JlY3RYIiwieSIsIl9yZWN0WSIsIndpZHRoIiwiX3JlY3RXaWR0aCIsImhlaWdodCIsIl9yZWN0SGVpZ2h0IiwidHJhbnNmb3JtTWF0cml4IiwicmVsYXRpdmVUcmFuc2Zvcm0iLCJtYXRyaXgiLCJtdWx0aXBseVZlY3RvcjIiLCJzZXRYWSIsInNldFRvQ2xlYW5TdGF0ZSIsImNsZWFuUGFpbnRhYmxlU3RhdGUiLCJwcm90b3R5cGUiLCJ3ZWJnbFJlbmRlcmVyIiwid2ViZ2xWZXJ0ZXhDb2xvclBvbHlnb25zIiwicmVnaXN0ZXIiLCJtaXhJbnRvIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELFNBQVNBLG1CQUFtQixRQUFRLDJDQUEyQztBQUMvRSxPQUFPQyxhQUFhLGdDQUFnQztBQUNwRCxPQUFPQyxjQUFjLHVDQUF1QztBQUM1RCxTQUFTQyxLQUFLLEVBQUVDLHlCQUF5QixFQUFFQyxRQUFRLEVBQUVDLE9BQU8sRUFBRUMsaUJBQWlCLFFBQVEsbUJBQW1CO0FBRTFHLE1BQU1DLGVBQWUsSUFBSUwsTUFBTztBQUVoQyxJQUFBLEFBQU1NLHlCQUFOLE1BQU1BLCtCQUErQkwsMEJBQTJCRztJQUM5RDs7Ozs7O0dBTUMsR0FDREcsV0FBWUMsUUFBUSxFQUFFQyxRQUFRLEVBQUc7UUFDL0IsS0FBSyxDQUFDRixXQUFZQyxVQUFVQztRQUU1QixJQUFLLENBQUMsSUFBSSxDQUFDQyxXQUFXLEVBQUc7WUFDdkIsd0NBQXdDO1lBQ3hDLElBQUksQ0FBQ0EsV0FBVyxHQUFHLElBQUlDLGFBQWMsSUFBSSxJQUFLLCtDQUErQztRQUMvRjtRQUVBLGtFQUFrRTtRQUNsRSxJ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