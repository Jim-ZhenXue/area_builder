// Copyright 2016-2024, University of Colorado Boulder
/**
 * SVG drawable for Image nodes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Poolable from '../../../../phet-core/js/Poolable.js';
import { ImageStatefulDrawable, scenery, svgns, SVGSelfDrawable, xlinkns } from '../../imports.js';
// TODO: change this based on memory and performance characteristics of the platform https://github.com/phetsims/scenery/issues/1581
const keepSVGImageElements = true; // whether we should pool SVG elements for the SVG rendering states, or whether we should free them when possible for memory
let ImageSVGDrawable = class ImageSVGDrawable extends ImageStatefulDrawable(SVGSelfDrawable) {
    /**
   * @public
   * @override
   *
   * @param {number} renderer
   * @param {Instance} instance
   */ initialize(renderer, instance) {
        super.initialize(renderer, instance, false, keepSVGImageElements); // usesPaint: false
        sceneryLog && sceneryLog.ImageSVGDrawable && sceneryLog.ImageSVGDrawable(`${this.id} initialized for ${instance.toString()}`);
        // @protected {SVGImageElement} - Sole SVG element for this drawable, implementing API for SVGSelfDrawable
        this.svgElement = this.svgElement || document.createElementNS(svgns, 'image');
        this.svgElement.setAttribute('x', '0');
        this.svgElement.setAttribute('y', '0');
        // @private {boolean} - Whether we have an opacity attribute specified on the DOM element.
        this.hasOpacity = false;
        // @private {boolean}
        this.usingMipmap = false;
        // @private {number} - will always be invalidated
        this.mipmapLevel = -1;
        // @private {function} - if mipmaps are enabled, this listener will be added to when our relative transform changes
        this._mipmapTransformListener = this._mipmapTransformListener || this.onMipmapTransform.bind(this);
        this._mipmapListener = this._mipmapListener || this.onMipmap.bind(this);
        this.node.mipmapEmitter.addListener(this._mipmapListener);
        this.updateMipmapStatus(instance.node._mipmap);
    }
    /**
   * Updates the SVG elements so that they will appear like the current node's representation.
   * @protected
   *
   * Implements the interface for SVGSelfDrawable (and is called from the SVGSelfDrawable's update).
   */ updateSVGSelf() {
        const image = this.svgElement;
        if (this.dirtyImage) {
            sceneryLog && sceneryLog.ImageSVGDrawable && sceneryLog.ImageSVGDrawable(`${this.id} Updating dirty image`);
            if (this.node._image) {
                // like <image xlink:href='https://phet.colorado.edu/images/phet-logo-yellow.png' x='0' y='0' height='127px' width='242px'/>
                this.updateURL(image, true);
            } else {
                image.setAttribute('width', '0');
                image.setAttribute('height', '0');
                image.setAttributeNS(xlinkns, 'xlink:href', '//:0'); // see http://stackoverflow.com/questions/5775469/whats-the-valid-way-to-include-an-image-with-no-src
            }
        } else if (this.dirtyMipmap && this.node._image) {
            sceneryLog && sceneryLog.ImageSVGDrawable && sceneryLog.ImageSVGDrawable(`${this.id} Updating dirty mipmap`);
            this.updateURL(image, false);
        }
        if (this.dirtyImageOpacity) {
            if (this.node._imageOpacity === 1) {
                if (this.hasOpacity) {
                    this.hasOpacity = false;
                    image.removeAttribute('opacity');
                }
            } else {
                this.hasOpacity = true;
                image.setAttribute('opacity', this.node._imageOpacity);
            }
        }
    }
    /**
   * @private
   *
   * @param {SVGImageElement} image
   * @param {boolean} forced
   */ updateURL(image, forced) {
        // determine our mipmap level, if any is used
        let level = -1; // signals a default of "we are not using mipmapping"
        if (this.node._mipmap) {
            level = this.node.getMipmapLevel(this.instance.relativeTransform.matrix);
            sceneryLog && sceneryLog.ImageSVGDrawable && sceneryLog.ImageSVGDrawable(`${this.id} Mipmap level: ${level}`);
        }
        // bail out if we would use the currently-used mipmap level (or none) and there was no image change
        if (!forced && level === this.mipmapLevel) {
            return;
        }
        // if we are switching to having no mipmap
        if (this.mipmapLevel >= 0 && level === -1) {
            image.removeAttribute('transform');
        }
        this.mipmapLevel = level;
        if (this.node._mipmap && this.node.hasMipmaps()) {
            sceneryLog && sceneryLog.ImageSVGDrawable && sceneryLog.ImageSVGDrawable(`${this.id} Setting image URL to mipmap level ${level}`);
            const url = this.node.getMipmapURL(level);
            const canvas = this.node.getMipmapCanvas(level);
            image.setAttribute('width', `${canvas.width}px`);
            image.setAttribute('height', `${canvas.height}px`);
            // Since SVG doesn't support parsing scientific notation (e.g. 7e5), we need to output fixed decimal-point strings.
            // Since this needs to be done quickly, and we don't particularly care about slight rounding differences (it's
            // being used for display purposes only, and is never shown to the user), we use the built-in JS toFixed instead of
            // Dot's version of toFixed. See https://github.com/phetsims/kite/issues/50
            image.setAttribute('transform', `scale(${Math.pow(2, level).toFixed(20)})`); // eslint-disable-line phet/bad-sim-text
            image.setAttributeNS(xlinkns, 'xlink:href', url);
        } else {
            sceneryLog && sceneryLog.ImageSVGDrawable && sceneryLog.ImageSVGDrawable(`${this.id} Setting image URL`);
            image.setAttribute('width', `${this.node.getImageWidth()}px`);
            image.setAttribute('height', `${this.node.getImageHeight()}px`);
            image.setAttributeNS(xlinkns, 'xlink:href', this.node.getImageURL());
        }
    }
    /**
   * @private
   *
   * @param {boolean} usingMipmap
   */ updateMipmapStatus(usingMipmap) {
        if (this.usingMipmap !== usingMipmap) {
            this.usingMipmap = usingMipmap;
            if (usingMipmap) {
                sceneryLog && sceneryLog.ImageSVGDrawable && sceneryLog.ImageSVGDrawable(`${this.id} Adding mipmap compute/listener needs`);
                this.instance.relativeTransform.addListener(this._mipmapTransformListener); // when our relative tranform changes, notify us in the pre-repaint phase
                this.instance.relativeTransform.addPrecompute(); // trigger precomputation of the relative transform, since we will always need it when it is updated
            } else {
                sceneryLog && sceneryLog.ImageSVGDrawable && sceneryLog.ImageSVGDrawable(`${this.id} Removing mipmap compute/listener needs`);
                this.instance.relativeTransform.removeListener(this._mipmapTransformListener);
                this.instance.relativeTransform.removePrecompute();
            }
            // sanity check
            this.markDirtyMipmap();
        }
    }
    /**
   * @private
   */ onMipmap() {
        // sanity check
        this.markDirtyMipmap();
        // update our mipmap usage status
        this.updateMipmapStatus(this.node._mipmap);
    }
    /**
   * @private
   */ onMipmapTransform() {
        sceneryLog && sceneryLog.ImageSVGDrawable && sceneryLog.ImageSVGDrawable(`${this.id} Transform dirties mipmap`);
        this.markDirtyMipmap();
    }
    /**
   * Disposes the drawable.
   * @public
   * @override
   */ dispose() {
        sceneryLog && sceneryLog.ImageSVGDrawable && sceneryLog.ImageSVGDrawable(`${this.id} disposing`);
        // clean up mipmap listeners and compute needs
        this.updateMipmapStatus(false);
        this.node.mipmapEmitter.removeListener(this._mipmapListener);
        super.dispose();
    }
};
scenery.register('ImageSVGDrawable', ImageSVGDrawable);
Poolable.mixInto(ImageSVGDrawable);
export default ImageSVGDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvSW1hZ2VTVkdEcmF3YWJsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBTVkcgZHJhd2FibGUgZm9yIEltYWdlIG5vZGVzLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgUG9vbGFibGUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2xhYmxlLmpzJztcbmltcG9ydCB7IEltYWdlU3RhdGVmdWxEcmF3YWJsZSwgc2NlbmVyeSwgc3ZnbnMsIFNWR1NlbGZEcmF3YWJsZSwgeGxpbmtucyB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xuXG4vLyBUT0RPOiBjaGFuZ2UgdGhpcyBiYXNlZCBvbiBtZW1vcnkgYW5kIHBlcmZvcm1hbmNlIGNoYXJhY3RlcmlzdGljcyBvZiB0aGUgcGxhdGZvcm0gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbmNvbnN0IGtlZXBTVkdJbWFnZUVsZW1lbnRzID0gdHJ1ZTsgLy8gd2hldGhlciB3ZSBzaG91bGQgcG9vbCBTVkcgZWxlbWVudHMgZm9yIHRoZSBTVkcgcmVuZGVyaW5nIHN0YXRlcywgb3Igd2hldGhlciB3ZSBzaG91bGQgZnJlZSB0aGVtIHdoZW4gcG9zc2libGUgZm9yIG1lbW9yeVxuXG5jbGFzcyBJbWFnZVNWR0RyYXdhYmxlIGV4dGVuZHMgSW1hZ2VTdGF0ZWZ1bERyYXdhYmxlKCBTVkdTZWxmRHJhd2FibGUgKSB7XG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmVuZGVyZXJcbiAgICogQHBhcmFtIHtJbnN0YW5jZX0gaW5zdGFuY2VcbiAgICovXG4gIGluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSApIHtcbiAgICBzdXBlci5pbml0aWFsaXplKCByZW5kZXJlciwgaW5zdGFuY2UsIGZhbHNlLCBrZWVwU1ZHSW1hZ2VFbGVtZW50cyApOyAvLyB1c2VzUGFpbnQ6IGZhbHNlXG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW1hZ2VTVkdEcmF3YWJsZSAmJiBzY2VuZXJ5TG9nLkltYWdlU1ZHRHJhd2FibGUoIGAke3RoaXMuaWR9IGluaXRpYWxpemVkIGZvciAke2luc3RhbmNlLnRvU3RyaW5nKCl9YCApO1xuXG4gICAgLy8gQHByb3RlY3RlZCB7U1ZHSW1hZ2VFbGVtZW50fSAtIFNvbGUgU1ZHIGVsZW1lbnQgZm9yIHRoaXMgZHJhd2FibGUsIGltcGxlbWVudGluZyBBUEkgZm9yIFNWR1NlbGZEcmF3YWJsZVxuICAgIHRoaXMuc3ZnRWxlbWVudCA9IHRoaXMuc3ZnRWxlbWVudCB8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIHN2Z25zLCAnaW1hZ2UnICk7XG4gICAgdGhpcy5zdmdFbGVtZW50LnNldEF0dHJpYnV0ZSggJ3gnLCAnMCcgKTtcbiAgICB0aGlzLnN2Z0VsZW1lbnQuc2V0QXR0cmlidXRlKCAneScsICcwJyApO1xuXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gV2hldGhlciB3ZSBoYXZlIGFuIG9wYWNpdHkgYXR0cmlidXRlIHNwZWNpZmllZCBvbiB0aGUgRE9NIGVsZW1lbnQuXG4gICAgdGhpcy5oYXNPcGFjaXR5ID0gZmFsc2U7XG5cbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn1cbiAgICB0aGlzLnVzaW5nTWlwbWFwID0gZmFsc2U7XG5cbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfSAtIHdpbGwgYWx3YXlzIGJlIGludmFsaWRhdGVkXG4gICAgdGhpcy5taXBtYXBMZXZlbCA9IC0xO1xuXG4gICAgLy8gQHByaXZhdGUge2Z1bmN0aW9ufSAtIGlmIG1pcG1hcHMgYXJlIGVuYWJsZWQsIHRoaXMgbGlzdGVuZXIgd2lsbCBiZSBhZGRlZCB0byB3aGVuIG91ciByZWxhdGl2ZSB0cmFuc2Zvcm0gY2hhbmdlc1xuICAgIHRoaXMuX21pcG1hcFRyYW5zZm9ybUxpc3RlbmVyID0gdGhpcy5fbWlwbWFwVHJhbnNmb3JtTGlzdGVuZXIgfHwgdGhpcy5vbk1pcG1hcFRyYW5zZm9ybS5iaW5kKCB0aGlzICk7XG4gICAgdGhpcy5fbWlwbWFwTGlzdGVuZXIgPSB0aGlzLl9taXBtYXBMaXN0ZW5lciB8fCB0aGlzLm9uTWlwbWFwLmJpbmQoIHRoaXMgKTtcblxuICAgIHRoaXMubm9kZS5taXBtYXBFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLl9taXBtYXBMaXN0ZW5lciApO1xuICAgIHRoaXMudXBkYXRlTWlwbWFwU3RhdHVzKCBpbnN0YW5jZS5ub2RlLl9taXBtYXAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBTVkcgZWxlbWVudHMgc28gdGhhdCB0aGV5IHdpbGwgYXBwZWFyIGxpa2UgdGhlIGN1cnJlbnQgbm9kZSdzIHJlcHJlc2VudGF0aW9uLlxuICAgKiBAcHJvdGVjdGVkXG4gICAqXG4gICAqIEltcGxlbWVudHMgdGhlIGludGVyZmFjZSBmb3IgU1ZHU2VsZkRyYXdhYmxlIChhbmQgaXMgY2FsbGVkIGZyb20gdGhlIFNWR1NlbGZEcmF3YWJsZSdzIHVwZGF0ZSkuXG4gICAqL1xuICB1cGRhdGVTVkdTZWxmKCkge1xuICAgIGNvbnN0IGltYWdlID0gdGhpcy5zdmdFbGVtZW50O1xuXG4gICAgaWYgKCB0aGlzLmRpcnR5SW1hZ2UgKSB7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW1hZ2VTVkdEcmF3YWJsZSAmJiBzY2VuZXJ5TG9nLkltYWdlU1ZHRHJhd2FibGUoIGAke3RoaXMuaWR9IFVwZGF0aW5nIGRpcnR5IGltYWdlYCApO1xuICAgICAgaWYgKCB0aGlzLm5vZGUuX2ltYWdlICkge1xuICAgICAgICAvLyBsaWtlIDxpbWFnZSB4bGluazpocmVmPSdodHRwczovL3BoZXQuY29sb3JhZG8uZWR1L2ltYWdlcy9waGV0LWxvZ28teWVsbG93LnBuZycgeD0nMCcgeT0nMCcgaGVpZ2h0PScxMjdweCcgd2lkdGg9JzI0MnB4Jy8+XG4gICAgICAgIHRoaXMudXBkYXRlVVJMKCBpbWFnZSwgdHJ1ZSApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGltYWdlLnNldEF0dHJpYnV0ZSggJ3dpZHRoJywgJzAnICk7XG4gICAgICAgIGltYWdlLnNldEF0dHJpYnV0ZSggJ2hlaWdodCcsICcwJyApO1xuICAgICAgICBpbWFnZS5zZXRBdHRyaWJ1dGVOUyggeGxpbmtucywgJ3hsaW5rOmhyZWYnLCAnLy86MCcgKTsgLy8gc2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTc3NTQ2OS93aGF0cy10aGUtdmFsaWQtd2F5LXRvLWluY2x1ZGUtYW4taW1hZ2Utd2l0aC1uby1zcmNcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoIHRoaXMuZGlydHlNaXBtYXAgJiYgdGhpcy5ub2RlLl9pbWFnZSApIHtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbWFnZVNWR0RyYXdhYmxlICYmIHNjZW5lcnlMb2cuSW1hZ2VTVkdEcmF3YWJsZSggYCR7dGhpcy5pZH0gVXBkYXRpbmcgZGlydHkgbWlwbWFwYCApO1xuICAgICAgdGhpcy51cGRhdGVVUkwoIGltYWdlLCBmYWxzZSApO1xuICAgIH1cblxuICAgIGlmICggdGhpcy5kaXJ0eUltYWdlT3BhY2l0eSApIHtcbiAgICAgIGlmICggdGhpcy5ub2RlLl9pbWFnZU9wYWNpdHkgPT09IDEgKSB7XG4gICAgICAgIGlmICggdGhpcy5oYXNPcGFjaXR5ICkge1xuICAgICAgICAgIHRoaXMuaGFzT3BhY2l0eSA9IGZhbHNlO1xuICAgICAgICAgIGltYWdlLnJlbW92ZUF0dHJpYnV0ZSggJ29wYWNpdHknICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmhhc09wYWNpdHkgPSB0cnVlO1xuICAgICAgICBpbWFnZS5zZXRBdHRyaWJ1dGUoICdvcGFjaXR5JywgdGhpcy5ub2RlLl9pbWFnZU9wYWNpdHkgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtTVkdJbWFnZUVsZW1lbnR9IGltYWdlXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZm9yY2VkXG4gICAqL1xuICB1cGRhdGVVUkwoIGltYWdlLCBmb3JjZWQgKSB7XG4gICAgLy8gZGV0ZXJtaW5lIG91ciBtaXBtYXAgbGV2ZWwsIGlmIGFueSBpcyB1c2VkXG4gICAgbGV0IGxldmVsID0gLTE7IC8vIHNpZ25hbHMgYSBkZWZhdWx0IG9mIFwid2UgYXJlIG5vdCB1c2luZyBtaXBtYXBwaW5nXCJcbiAgICBpZiAoIHRoaXMubm9kZS5fbWlwbWFwICkge1xuICAgICAgbGV2ZWwgPSB0aGlzLm5vZGUuZ2V0TWlwbWFwTGV2ZWwoIHRoaXMuaW5zdGFuY2UucmVsYXRpdmVUcmFuc2Zvcm0ubWF0cml4ICk7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW1hZ2VTVkdEcmF3YWJsZSAmJiBzY2VuZXJ5TG9nLkltYWdlU1ZHRHJhd2FibGUoIGAke3RoaXMuaWR9IE1pcG1hcCBsZXZlbDogJHtsZXZlbH1gICk7XG4gICAgfVxuXG4gICAgLy8gYmFpbCBvdXQgaWYgd2Ugd291bGQgdXNlIHRoZSBjdXJyZW50bHktdXNlZCBtaXBtYXAgbGV2ZWwgKG9yIG5vbmUpIGFuZCB0aGVyZSB3YXMgbm8gaW1hZ2UgY2hhbmdlXG4gICAgaWYgKCAhZm9yY2VkICYmIGxldmVsID09PSB0aGlzLm1pcG1hcExldmVsICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGlmIHdlIGFyZSBzd2l0Y2hpbmcgdG8gaGF2aW5nIG5vIG1pcG1hcFxuICAgIGlmICggdGhpcy5taXBtYXBMZXZlbCA+PSAwICYmIGxldmVsID09PSAtMSApIHtcbiAgICAgIGltYWdlLnJlbW92ZUF0dHJpYnV0ZSggJ3RyYW5zZm9ybScgKTtcbiAgICB9XG4gICAgdGhpcy5taXBtYXBMZXZlbCA9IGxldmVsO1xuXG4gICAgaWYgKCB0aGlzLm5vZGUuX21pcG1hcCAmJiB0aGlzLm5vZGUuaGFzTWlwbWFwcygpICkge1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkltYWdlU1ZHRHJhd2FibGUgJiYgc2NlbmVyeUxvZy5JbWFnZVNWR0RyYXdhYmxlKCBgJHt0aGlzLmlkfSBTZXR0aW5nIGltYWdlIFVSTCB0byBtaXBtYXAgbGV2ZWwgJHtsZXZlbH1gICk7XG4gICAgICBjb25zdCB1cmwgPSB0aGlzLm5vZGUuZ2V0TWlwbWFwVVJMKCBsZXZlbCApO1xuICAgICAgY29uc3QgY2FudmFzID0gdGhpcy5ub2RlLmdldE1pcG1hcENhbnZhcyggbGV2ZWwgKTtcbiAgICAgIGltYWdlLnNldEF0dHJpYnV0ZSggJ3dpZHRoJywgYCR7Y2FudmFzLndpZHRofXB4YCApO1xuICAgICAgaW1hZ2Uuc2V0QXR0cmlidXRlKCAnaGVpZ2h0JywgYCR7Y2FudmFzLmhlaWdodH1weGAgKTtcbiAgICAgIC8vIFNpbmNlIFNWRyBkb2Vzbid0IHN1cHBvcnQgcGFyc2luZyBzY2llbnRpZmljIG5vdGF0aW9uIChlLmcuIDdlNSksIHdlIG5lZWQgdG8gb3V0cHV0IGZpeGVkIGRlY2ltYWwtcG9pbnQgc3RyaW5ncy5cbiAgICAgIC8vIFNpbmNlIHRoaXMgbmVlZHMgdG8gYmUgZG9uZSBxdWlja2x5LCBhbmQgd2UgZG9uJ3QgcGFydGljdWxhcmx5IGNhcmUgYWJvdXQgc2xpZ2h0IHJvdW5kaW5nIGRpZmZlcmVuY2VzIChpdCdzXG4gICAgICAvLyBiZWluZyB1c2VkIGZvciBkaXNwbGF5IHB1cnBvc2VzIG9ubHksIGFuZCBpcyBuZXZlciBzaG93biB0byB0aGUgdXNlciksIHdlIHVzZSB0aGUgYnVpbHQtaW4gSlMgdG9GaXhlZCBpbnN0ZWFkIG9mXG4gICAgICAvLyBEb3QncyB2ZXJzaW9uIG9mIHRvRml4ZWQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNTBcbiAgICAgIGltYWdlLnNldEF0dHJpYnV0ZSggJ3RyYW5zZm9ybScsIGBzY2FsZSgke01hdGgucG93KCAyLCBsZXZlbCApLnRvRml4ZWQoIDIwICl9KWAgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L2JhZC1zaW0tdGV4dFxuICAgICAgaW1hZ2Uuc2V0QXR0cmlidXRlTlMoIHhsaW5rbnMsICd4bGluazpocmVmJywgdXJsICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkltYWdlU1ZHRHJhd2FibGUgJiYgc2NlbmVyeUxvZy5JbWFnZVNWR0RyYXdhYmxlKCBgJHt0aGlzLmlkfSBTZXR0aW5nIGltYWdlIFVSTGAgKTtcbiAgICAgIGltYWdlLnNldEF0dHJpYnV0ZSggJ3dpZHRoJywgYCR7dGhpcy5ub2RlLmdldEltYWdlV2lkdGgoKX1weGAgKTtcbiAgICAgIGltYWdlLnNldEF0dHJpYnV0ZSggJ2hlaWdodCcsIGAke3RoaXMubm9kZS5nZXRJbWFnZUhlaWdodCgpfXB4YCApO1xuICAgICAgaW1hZ2Uuc2V0QXR0cmlidXRlTlMoIHhsaW5rbnMsICd4bGluazpocmVmJywgdGhpcy5ub2RlLmdldEltYWdlVVJMKCkgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFufSB1c2luZ01pcG1hcFxuICAgKi9cbiAgdXBkYXRlTWlwbWFwU3RhdHVzKCB1c2luZ01pcG1hcCApIHtcbiAgICBpZiAoIHRoaXMudXNpbmdNaXBtYXAgIT09IHVzaW5nTWlwbWFwICkge1xuICAgICAgdGhpcy51c2luZ01pcG1hcCA9IHVzaW5nTWlwbWFwO1xuXG4gICAgICBpZiAoIHVzaW5nTWlwbWFwICkge1xuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW1hZ2VTVkdEcmF3YWJsZSAmJiBzY2VuZXJ5TG9nLkltYWdlU1ZHRHJhd2FibGUoIGAke3RoaXMuaWR9IEFkZGluZyBtaXBtYXAgY29tcHV0ZS9saXN0ZW5lciBuZWVkc2AgKTtcbiAgICAgICAgdGhpcy5pbnN0YW5jZS5yZWxhdGl2ZVRyYW5zZm9ybS5hZGRMaXN0ZW5lciggdGhpcy5fbWlwbWFwVHJhbnNmb3JtTGlzdGVuZXIgKTsgLy8gd2hlbiBvdXIgcmVsYXRpdmUgdHJhbmZvcm0gY2hhbmdlcywgbm90aWZ5IHVzIGluIHRoZSBwcmUtcmVwYWludCBwaGFzZVxuICAgICAgICB0aGlzLmluc3RhbmNlLnJlbGF0aXZlVHJhbnNmb3JtLmFkZFByZWNvbXB1dGUoKTsgLy8gdHJpZ2dlciBwcmVjb21wdXRhdGlvbiBvZiB0aGUgcmVsYXRpdmUgdHJhbnNmb3JtLCBzaW5jZSB3ZSB3aWxsIGFsd2F5cyBuZWVkIGl0IHdoZW4gaXQgaXMgdXBkYXRlZFxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbWFnZVNWR0RyYXdhYmxlICYmIHNjZW5lcnlMb2cuSW1hZ2VTVkdEcmF3YWJsZSggYCR7dGhpcy5pZH0gUmVtb3ZpbmcgbWlwbWFwIGNvbXB1dGUvbGlzdGVuZXIgbmVlZHNgICk7XG4gICAgICAgIHRoaXMuaW5zdGFuY2UucmVsYXRpdmVUcmFuc2Zvcm0ucmVtb3ZlTGlzdGVuZXIoIHRoaXMuX21pcG1hcFRyYW5zZm9ybUxpc3RlbmVyICk7XG4gICAgICAgIHRoaXMuaW5zdGFuY2UucmVsYXRpdmVUcmFuc2Zvcm0ucmVtb3ZlUHJlY29tcHV0ZSgpO1xuICAgICAgfVxuXG4gICAgICAvLyBzYW5pdHkgY2hlY2tcbiAgICAgIHRoaXMubWFya0RpcnR5TWlwbWFwKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvbk1pcG1hcCgpIHtcbiAgICAvLyBzYW5pdHkgY2hlY2tcbiAgICB0aGlzLm1hcmtEaXJ0eU1pcG1hcCgpO1xuXG4gICAgLy8gdXBkYXRlIG91ciBtaXBtYXAgdXNhZ2Ugc3RhdHVzXG4gICAgdGhpcy51cGRhdGVNaXBtYXBTdGF0dXMoIHRoaXMubm9kZS5fbWlwbWFwICk7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uTWlwbWFwVHJhbnNmb3JtKCkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbWFnZVNWR0RyYXdhYmxlICYmIHNjZW5lcnlMb2cuSW1hZ2VTVkdEcmF3YWJsZSggYCR7dGhpcy5pZH0gVHJhbnNmb3JtIGRpcnRpZXMgbWlwbWFwYCApO1xuXG4gICAgdGhpcy5tYXJrRGlydHlNaXBtYXAoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwb3NlcyB0aGUgZHJhd2FibGUuXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBkaXNwb3NlKCkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbWFnZVNWR0RyYXdhYmxlICYmIHNjZW5lcnlMb2cuSW1hZ2VTVkdEcmF3YWJsZSggYCR7dGhpcy5pZH0gZGlzcG9zaW5nYCApO1xuXG4gICAgLy8gY2xlYW4gdXAgbWlwbWFwIGxpc3RlbmVycyBhbmQgY29tcHV0ZSBuZWVkc1xuICAgIHRoaXMudXBkYXRlTWlwbWFwU3RhdHVzKCBmYWxzZSApO1xuICAgIHRoaXMubm9kZS5taXBtYXBFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLl9taXBtYXBMaXN0ZW5lciApO1xuXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdJbWFnZVNWR0RyYXdhYmxlJywgSW1hZ2VTVkdEcmF3YWJsZSApO1xuXG5Qb29sYWJsZS5taXhJbnRvKCBJbWFnZVNWR0RyYXdhYmxlICk7XG5cbmV4cG9ydCBkZWZhdWx0IEltYWdlU1ZHRHJhd2FibGU7Il0sIm5hbWVzIjpbIlBvb2xhYmxlIiwiSW1hZ2VTdGF0ZWZ1bERyYXdhYmxlIiwic2NlbmVyeSIsInN2Z25zIiwiU1ZHU2VsZkRyYXdhYmxlIiwieGxpbmtucyIsImtlZXBTVkdJbWFnZUVsZW1lbnRzIiwiSW1hZ2VTVkdEcmF3YWJsZSIsImluaXRpYWxpemUiLCJyZW5kZXJlciIsImluc3RhbmNlIiwic2NlbmVyeUxvZyIsImlkIiwidG9TdHJpbmciLCJzdmdFbGVtZW50IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50TlMiLCJzZXRBdHRyaWJ1dGUiLCJoYXNPcGFjaXR5IiwidXNpbmdNaXBtYXAiLCJtaXBtYXBMZXZlbCIsIl9taXBtYXBUcmFuc2Zvcm1MaXN0ZW5lciIsIm9uTWlwbWFwVHJhbnNmb3JtIiwiYmluZCIsIl9taXBtYXBMaXN0ZW5lciIsIm9uTWlwbWFwIiwibm9kZSIsIm1pcG1hcEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsInVwZGF0ZU1pcG1hcFN0YXR1cyIsIl9taXBtYXAiLCJ1cGRhdGVTVkdTZWxmIiwiaW1hZ2UiLCJkaXJ0eUltYWdlIiwiX2ltYWdlIiwidXBkYXRlVVJMIiwic2V0QXR0cmlidXRlTlMiLCJkaXJ0eU1pcG1hcCIsImRpcnR5SW1hZ2VPcGFjaXR5IiwiX2ltYWdlT3BhY2l0eSIsInJlbW92ZUF0dHJpYnV0ZSIsImZvcmNlZCIsImxldmVsIiwiZ2V0TWlwbWFwTGV2ZWwiLCJyZWxhdGl2ZVRyYW5zZm9ybSIsIm1hdHJpeCIsImhhc01pcG1hcHMiLCJ1cmwiLCJnZXRNaXBtYXBVUkwiLCJjYW52YXMiLCJnZXRNaXBtYXBDYW52YXMiLCJ3aWR0aCIsImhlaWdodCIsIk1hdGgiLCJwb3ciLCJ0b0ZpeGVkIiwiZ2V0SW1hZ2VXaWR0aCIsImdldEltYWdlSGVpZ2h0IiwiZ2V0SW1hZ2VVUkwiLCJhZGRQcmVjb21wdXRlIiwicmVtb3ZlTGlzdGVuZXIiLCJyZW1vdmVQcmVjb21wdXRlIiwibWFya0RpcnR5TWlwbWFwIiwiZGlzcG9zZSIsInJlZ2lzdGVyIiwibWl4SW50byJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxjQUFj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