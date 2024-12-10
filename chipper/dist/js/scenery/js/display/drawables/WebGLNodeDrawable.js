// Copyright 2016-2023, University of Colorado Boulder
/**
 * WebGL drawable for WebGLNode.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid (PhET Interactive Simulations)
 */ import Poolable from '../../../../phet-core/js/Poolable.js';
import { Renderer, scenery, WebGLNode, WebGLSelfDrawable } from '../../imports.js';
let WebGLNodeDrawable = class WebGLNodeDrawable extends WebGLSelfDrawable {
    /**
   * @public
   * @override
   *
   * @param {number} renderer
   * @param {Instance} instance
   */ initialize(renderer, instance) {
        super.initialize(renderer, instance);
        // @private {function}
        this.contextChangeListener = this.contextChangeListener || this.onWebGLContextChange.bind(this);
        // @private {*} - Will be set to whatever type node.painterType is.
        this.painter = null;
    }
    /**
   * Creates an instance of our Node's "painter" type.
   * @private
   *
   * @returns {*} - Whatever node.painterType is will be the type.
   */ createPainter() {
        const PainterType = this.node.painterType;
        return new PainterType(this.webGLBlock.gl, this.node);
    }
    /**
   * Callback for when the WebGL context changes. We'll reconstruct the painter.
   * @public
   */ onWebGLContextChange() {
        //TODO: Should a function be added for "disposeNonWebGL"? https://github.com/phetsims/scenery/issues/1581
        // Create the new painter
        this.painter = this.createPainter();
    }
    /**
   * @public
   *
   * @param {WebGLBlock} webGLBlock
   */ onAddToBlock(webGLBlock) {
        // @private {WebGLBlock}
        this.webGLBlock = webGLBlock;
        this.painter = this.createPainter();
        webGLBlock.glChangedEmitter.addListener(this.contextChangeListener);
    }
    /**
   * @public
   *
   * @param {WebGLBlock} webGLBlock
   */ onRemoveFromBlock(webGLBlock) {
        webGLBlock.glChangedEmitter.removeListener(this.contextChangeListener);
    }
    /**
   * @public
   *
   * @returns {WebGLNode.PAINTED_NOTHING|WebGLNode.PAINTED_SOMETHING}
   */ draw() {
        // we have a precompute need
        const matrix = this.instance.relativeTransform.matrix;
        const painted = this.painter.paint(matrix, this.webGLBlock.projectionMatrix);
        assert && assert(painted === WebGLNode.PAINTED_SOMETHING || painted === WebGLNode.PAINTED_NOTHING);
        assert && assert(WebGLNode.PAINTED_NOTHING === 0 && WebGLNode.PAINTED_SOMETHING === 1, 'Ensure we can pass the value through directly to indicate whether draw calls were made');
        return painted;
    }
    /**
   * Disposes the drawable.
   * @public
   * @override
   */ dispose() {
        this.painter.dispose();
        this.painter = null;
        if (this.webGLBlock) {
            this.webGLBlock = null;
        }
        // super
        super.dispose();
    }
    /**
   * A "catch-all" dirty method that directly marks the paintDirty flag and triggers propagation of dirty
   * information. This can be used by other mark* methods, or directly itself if the paintDirty flag is checked.
   * @public
   *
   * It should be fired (indirectly or directly) for anything besides transforms that needs to make a drawable
   * dirty.
   */ markPaintDirty() {
        this.markDirty();
    }
    // forward call to the WebGLNode
    get shaderAttributes() {
        return this.node.shaderAttributes;
    }
};
// We use a custom renderer for the needed flexibility
WebGLNodeDrawable.prototype.webglRenderer = Renderer.webglCustom;
scenery.register('WebGLNodeDrawable', WebGLNodeDrawable);
Poolable.mixInto(WebGLNodeDrawable);
export default WebGLNodeDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvV2ViR0xOb2RlRHJhd2FibGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogV2ViR0wgZHJhd2FibGUgZm9yIFdlYkdMTm9kZS5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBQb29sYWJsZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbGFibGUuanMnO1xuaW1wb3J0IHsgUmVuZGVyZXIsIHNjZW5lcnksIFdlYkdMTm9kZSwgV2ViR0xTZWxmRHJhd2FibGUgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcblxuY2xhc3MgV2ViR0xOb2RlRHJhd2FibGUgZXh0ZW5kcyBXZWJHTFNlbGZEcmF3YWJsZSB7XG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmVuZGVyZXJcbiAgICogQHBhcmFtIHtJbnN0YW5jZX0gaW5zdGFuY2VcbiAgICovXG4gIGluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSApIHtcbiAgICBzdXBlci5pbml0aWFsaXplKCByZW5kZXJlciwgaW5zdGFuY2UgKTtcblxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbn1cbiAgICB0aGlzLmNvbnRleHRDaGFuZ2VMaXN0ZW5lciA9IHRoaXMuY29udGV4dENoYW5nZUxpc3RlbmVyIHx8IHRoaXMub25XZWJHTENvbnRleHRDaGFuZ2UuYmluZCggdGhpcyApO1xuXG4gICAgLy8gQHByaXZhdGUgeyp9IC0gV2lsbCBiZSBzZXQgdG8gd2hhdGV2ZXIgdHlwZSBub2RlLnBhaW50ZXJUeXBlIGlzLlxuICAgIHRoaXMucGFpbnRlciA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBvdXIgTm9kZSdzIFwicGFpbnRlclwiIHR5cGUuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEByZXR1cm5zIHsqfSAtIFdoYXRldmVyIG5vZGUucGFpbnRlclR5cGUgaXMgd2lsbCBiZSB0aGUgdHlwZS5cbiAgICovXG4gIGNyZWF0ZVBhaW50ZXIoKSB7XG4gICAgY29uc3QgUGFpbnRlclR5cGUgPSB0aGlzLm5vZGUucGFpbnRlclR5cGU7XG4gICAgcmV0dXJuIG5ldyBQYWludGVyVHlwZSggdGhpcy53ZWJHTEJsb2NrLmdsLCB0aGlzLm5vZGUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsYmFjayBmb3Igd2hlbiB0aGUgV2ViR0wgY29udGV4dCBjaGFuZ2VzLiBXZSdsbCByZWNvbnN0cnVjdCB0aGUgcGFpbnRlci5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgb25XZWJHTENvbnRleHRDaGFuZ2UoKSB7XG4gICAgLy9UT0RPOiBTaG91bGQgYSBmdW5jdGlvbiBiZSBhZGRlZCBmb3IgXCJkaXNwb3NlTm9uV2ViR0xcIj8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcblxuICAgIC8vIENyZWF0ZSB0aGUgbmV3IHBhaW50ZXJcbiAgICB0aGlzLnBhaW50ZXIgPSB0aGlzLmNyZWF0ZVBhaW50ZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xCbG9ja30gd2ViR0xCbG9ja1xuICAgKi9cbiAgb25BZGRUb0Jsb2NrKCB3ZWJHTEJsb2NrICkge1xuICAgIC8vIEBwcml2YXRlIHtXZWJHTEJsb2NrfVxuICAgIHRoaXMud2ViR0xCbG9jayA9IHdlYkdMQmxvY2s7XG5cbiAgICB0aGlzLnBhaW50ZXIgPSB0aGlzLmNyZWF0ZVBhaW50ZXIoKTtcblxuICAgIHdlYkdMQmxvY2suZ2xDaGFuZ2VkRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5jb250ZXh0Q2hhbmdlTGlzdGVuZXIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xCbG9ja30gd2ViR0xCbG9ja1xuICAgKi9cbiAgb25SZW1vdmVGcm9tQmxvY2soIHdlYkdMQmxvY2sgKSB7XG4gICAgd2ViR0xCbG9jay5nbENoYW5nZWRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLmNvbnRleHRDaGFuZ2VMaXN0ZW5lciApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge1dlYkdMTm9kZS5QQUlOVEVEX05PVEhJTkd8V2ViR0xOb2RlLlBBSU5URURfU09NRVRISU5HfVxuICAgKi9cbiAgZHJhdygpIHtcbiAgICAvLyB3ZSBoYXZlIGEgcHJlY29tcHV0ZSBuZWVkXG4gICAgY29uc3QgbWF0cml4ID0gdGhpcy5pbnN0YW5jZS5yZWxhdGl2ZVRyYW5zZm9ybS5tYXRyaXg7XG5cbiAgICBjb25zdCBwYWludGVkID0gdGhpcy5wYWludGVyLnBhaW50KCBtYXRyaXgsIHRoaXMud2ViR0xCbG9jay5wcm9qZWN0aW9uTWF0cml4ICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwYWludGVkID09PSBXZWJHTE5vZGUuUEFJTlRFRF9TT01FVEhJTkcgfHwgcGFpbnRlZCA9PT0gV2ViR0xOb2RlLlBBSU5URURfTk9USElORyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIFdlYkdMTm9kZS5QQUlOVEVEX05PVEhJTkcgPT09IDAgJiYgV2ViR0xOb2RlLlBBSU5URURfU09NRVRISU5HID09PSAxLFxuICAgICAgJ0Vuc3VyZSB3ZSBjYW4gcGFzcyB0aGUgdmFsdWUgdGhyb3VnaCBkaXJlY3RseSB0byBpbmRpY2F0ZSB3aGV0aGVyIGRyYXcgY2FsbHMgd2VyZSBtYWRlJyApO1xuXG4gICAgcmV0dXJuIHBhaW50ZWQ7XG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZXMgdGhlIGRyYXdhYmxlLlxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLnBhaW50ZXIuZGlzcG9zZSgpO1xuICAgIHRoaXMucGFpbnRlciA9IG51bGw7XG5cbiAgICBpZiAoIHRoaXMud2ViR0xCbG9jayApIHtcbiAgICAgIHRoaXMud2ViR0xCbG9jayA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gc3VwZXJcbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICogQSBcImNhdGNoLWFsbFwiIGRpcnR5IG1ldGhvZCB0aGF0IGRpcmVjdGx5IG1hcmtzIHRoZSBwYWludERpcnR5IGZsYWcgYW5kIHRyaWdnZXJzIHByb3BhZ2F0aW9uIG9mIGRpcnR5XG4gICAqIGluZm9ybWF0aW9uLiBUaGlzIGNhbiBiZSB1c2VkIGJ5IG90aGVyIG1hcmsqIG1ldGhvZHMsIG9yIGRpcmVjdGx5IGl0c2VsZiBpZiB0aGUgcGFpbnREaXJ0eSBmbGFnIGlzIGNoZWNrZWQuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogSXQgc2hvdWxkIGJlIGZpcmVkIChpbmRpcmVjdGx5IG9yIGRpcmVjdGx5KSBmb3IgYW55dGhpbmcgYmVzaWRlcyB0cmFuc2Zvcm1zIHRoYXQgbmVlZHMgdG8gbWFrZSBhIGRyYXdhYmxlXG4gICAqIGRpcnR5LlxuICAgKi9cbiAgbWFya1BhaW50RGlydHkoKSB7XG4gICAgdGhpcy5tYXJrRGlydHkoKTtcbiAgfVxuXG4gIC8vIGZvcndhcmQgY2FsbCB0byB0aGUgV2ViR0xOb2RlXG4gIGdldCBzaGFkZXJBdHRyaWJ1dGVzKCkge1xuICAgIHJldHVybiB0aGlzLm5vZGUuc2hhZGVyQXR0cmlidXRlcztcbiAgfVxufVxuXG4vLyBXZSB1c2UgYSBjdXN0b20gcmVuZGVyZXIgZm9yIHRoZSBuZWVkZWQgZmxleGliaWxpdHlcbldlYkdMTm9kZURyYXdhYmxlLnByb3RvdHlwZS53ZWJnbFJlbmRlcmVyID0gUmVuZGVyZXIud2ViZ2xDdXN0b207XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdXZWJHTE5vZGVEcmF3YWJsZScsIFdlYkdMTm9kZURyYXdhYmxlICk7XG5cblBvb2xhYmxlLm1peEludG8oIFdlYkdMTm9kZURyYXdhYmxlICk7XG5cbmV4cG9ydCBkZWZhdWx0IFdlYkdMTm9kZURyYXdhYmxlOyJdLCJuYW1lcyI6WyJQb29sYWJsZSIsIlJlbmRlcmVyIiwic2NlbmVyeSIsIldlYkdMTm9kZSIsIldlYkdMU2VsZkRyYXdhYmxlIiwiV2ViR0xOb2RlRHJhd2FibGUiLCJpbml0aWFsaXplIiwicmVuZGVyZXIiLCJpbnN0YW5jZSIsImNvbnRleHRDaGFuZ2VMaXN0ZW5lciIsIm9uV2ViR0xDb250ZXh0Q2hhbmdlIiwiYmluZCIsInBhaW50ZXIiLCJjcmVhdGVQYWludGVyIiwiUGFpbnRlclR5cGUiLCJub2RlIiwicGFpbnRlclR5cGUiLCJ3ZWJHTEJsb2NrIiwiZ2wiLCJvbkFkZFRvQmxvY2siLCJnbENoYW5nZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJvblJlbW92ZUZyb21CbG9jayIsInJlbW92ZUxpc3RlbmVyIiwiZHJhdyIsIm1hdHJpeCIsInJlbGF0aXZlVHJhbnNmb3JtIiwicGFpbnRlZCIsInBhaW50IiwicHJvamVjdGlvbk1hdHJpeCIsImFzc2VydCIsIlBBSU5URURfU09NRVRISU5HIiwiUEFJTlRFRF9OT1RISU5HIiwiZGlzcG9zZSIsIm1hcmtQYWludERpcnR5IiwibWFya0RpcnR5Iiwic2hhZGVyQXR0cmlidXRlcyIsInByb3RvdHlwZSIsIndlYmdsUmVuZGVyZXIiLCJ3ZWJnbEN1c3RvbSIsInJlZ2lzdGVyIiwibWl4SW50byJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EsY0FBYyx1Q0FBdUM7QUFDNUQsU0FBU0MsUUFBUSxFQUFFQyxPQUFPLEVBQUVDLFNBQVMsRUFBRUMsaUJBQWlC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