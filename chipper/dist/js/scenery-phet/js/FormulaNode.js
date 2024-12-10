// Copyright 2015-2021, University of Colorado Boulder
/**
 * Displays a LaTeX-style mathematical formula with KaTeX.
 *
 * IMPORTANT: Using this will require including the KaTeX preloads, and may require generation of a custom bundle for
 * the simulation. Currently two preloads will be needed, one for the CSS/font-files, and one for the JS, e.g.:
 * - katex-0.11.0-css-all.js
 * - katex-0.11.0.min.js
 *
 * IMPORTANT: See packageKatexCSS.js for more information, particularly about generating a particular customized preload
 * file that includes only the font-files needed.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Saurabh Totey
 */ import Bounds2 from '../../dot/js/Bounds2.js';
import merge from '../../phet-core/js/merge.js';
import { DOM } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
let FormulaNode = class FormulaNode extends DOM {
    /**
   * We need to have a fairly custom bounds measurement method, since it's a block-level element.
   * @protected
   * @override
   *
   * @returns {Bounds2}
   */ calculateDOMBounds() {
        // Grab a particular child node for measurement, since it's an inline element and contains everything graphical.
        const htmlList = this.element.getElementsByClassName('katex-html');
        // Empty if we have no formula yet
        if (htmlList.length === 0) {
            return Bounds2.NOTHING.copy();
        }
        // Our element from the list
        const element = htmlList[0];
        // offsetLeft is always 0 once in place, and this seems like the best way to measure the change both before AND
        // after it's been added to the DOM.
        return Bounds2.rect(0, element.offsetTop, element.offsetWidth, element.offsetHeight);
    }
    /**
   *
   * FormulaNode needs this override in order to render formulas correctly in DOM's invalidateDOM method, the
   * temporaryContainer is given a size temporaryContainer having a size affects the size of the formula and renders
   * calculateDOMBounds useless this method is almost the same as the one it overrides, but it just removes
   * temporaryContainer's size so that calculateDOMBounds can work and this can render correctly
   * @public
   * @override
   */ invalidateDOM() {
        // prevent this from being executed as a side-effect from inside one of its own calls
        if (this.invalidateDOMLock) {
            return;
        }
        this.invalidateDOMLock = true;
        // we will place ourselves in a temporary container to get our real desired bounds
        const temporaryContainer = document.createElement('div');
        $(temporaryContainer).css({
            display: 'hidden',
            padding: '0 !important',
            margin: '0 !important',
            position: 'absolute',
            left: 0,
            top: 0
        });
        // move to the temporary container
        this._container.removeChild(this._element);
        temporaryContainer.appendChild(this._element);
        document.body.appendChild(temporaryContainer);
        // bounds computation and resize our container to fit precisely
        const selfBounds = this.calculateDOMBounds();
        this.invalidateSelf(selfBounds);
        this._$container.width(selfBounds.getWidth());
        this._$container.height(selfBounds.getHeight());
        // move back to the main container
        document.body.removeChild(temporaryContainer);
        temporaryContainer.removeChild(this._element);
        this._container.appendChild(this._element);
        // unlock
        this.invalidateDOMLock = false;
    }
    /**
   * Updates the formula to display. It should be a string, formatted with the general LaTeX style. Particular
   * function support is available at https://github.com/Khan/KaTeX/wiki/Function-Support-in-KaTeX.
   * @public
   *
   * @param {string} formula - The particular formula to display.
   */ setFormula(formula) {
        assert && assert(typeof formula === 'string');
        if (formula !== this._formula) {
            this._formula = formula;
            this.updateFormula();
        }
        return this;
    }
    set formula(value) {
        this.setFormula(value);
    }
    /**
   * @public
   *
   * @returns {string} - The string for the formula that is currently displayed.
   */ getFormula() {
        return this._formula;
    }
    get formula() {
        return this.getFormula();
    }
    /**
   * Updates the {boolean} display mode.
   * @private
   *
   * @param {boolean} mode
   *   If true, the formula will be displayed in the display-mode ($$ in LaTeX) style, which is typically separated from
   *   other text, and on its own line.
   *   If false, the formula will be displayed in the 'inline math' ($ in LaTeX) style, which is typically
   *   meant to be embedded within flowed text.
   */ setDisplayMode(mode) {
        assert && assert(typeof mode === 'boolean');
        if (mode !== this._displayMode) {
            this._displayMode = mode;
            this.updateFormula();
        }
        return this;
    }
    set displayMode(value) {
        this.setDisplayMode(value);
    }
    /**
   * Whether the displayMode is currently true.
   * @public
   *
   * @returns {boolean}
   */ getDisplayMode() {
        return this._displayMode;
    }
    get displayMode() {
        return this.getDisplayMode();
    }
    /**
   * Updates the displayed formula and its bounds.
   * @private
   */ updateFormula() {
        katex.render(this._formula, this._span, {
            displayMode: this._displayMode,
            strict: (errorCode)=>{
                if (_.includes([
                    'unknownSymbol',
                    'unicodeTextInMathMode'
                ], errorCode)) {
                    return 'ignore';
                }
                return 'error';
            }
        });
        // recompute bounds
        this.invalidateDOM();
    }
    /**
   * @param {string} formula - LaTeX-style string, assumed to be in math mode
   * @param {Object} [options]
   */ constructor(formula, options){
        options = merge({
            // Defaults
            displayMode: true // If false, it will render with the 'inline math' mode which is vertically constrained more.
        }, options);
        const span = document.createElement('span');
        super(span);
        // @private
        this._span = span;
        // @private - Store these initially, so we can update the formula before mutating.
        this._formula = formula; // {string}
        this._displayMode = options.displayMode; // {boolean}
        this.updateFormula();
        this.mutate(options);
    }
};
sceneryPhet.register('FormulaNode', FormulaNode);
// Allow the mutate() call to change displayMode and formula.
FormulaNode.prototype._mutatorKeys = [
    'displayMode',
    'formula'
].concat(DOM.prototype._mutatorKeys);
export default FormulaNode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9Gb3JtdWxhTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEaXNwbGF5cyBhIExhVGVYLXN0eWxlIG1hdGhlbWF0aWNhbCBmb3JtdWxhIHdpdGggS2FUZVguXG4gKlxuICogSU1QT1JUQU5UOiBVc2luZyB0aGlzIHdpbGwgcmVxdWlyZSBpbmNsdWRpbmcgdGhlIEthVGVYIHByZWxvYWRzLCBhbmQgbWF5IHJlcXVpcmUgZ2VuZXJhdGlvbiBvZiBhIGN1c3RvbSBidW5kbGUgZm9yXG4gKiB0aGUgc2ltdWxhdGlvbi4gQ3VycmVudGx5IHR3byBwcmVsb2FkcyB3aWxsIGJlIG5lZWRlZCwgb25lIGZvciB0aGUgQ1NTL2ZvbnQtZmlsZXMsIGFuZCBvbmUgZm9yIHRoZSBKUywgZS5nLjpcbiAqIC0ga2F0ZXgtMC4xMS4wLWNzcy1hbGwuanNcbiAqIC0ga2F0ZXgtMC4xMS4wLm1pbi5qc1xuICpcbiAqIElNUE9SVEFOVDogU2VlIHBhY2thZ2VLYXRleENTUy5qcyBmb3IgbW9yZSBpbmZvcm1hdGlvbiwgcGFydGljdWxhcmx5IGFib3V0IGdlbmVyYXRpbmcgYSBwYXJ0aWN1bGFyIGN1c3RvbWl6ZWQgcHJlbG9hZFxuICogZmlsZSB0aGF0IGluY2x1ZGVzIG9ubHkgdGhlIGZvbnQtZmlsZXMgbmVlZGVkLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqIEBhdXRob3IgU2F1cmFiaCBUb3RleVxuICovXG5cbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xuaW1wb3J0IHsgRE9NIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcblxuY2xhc3MgRm9ybXVsYU5vZGUgZXh0ZW5kcyBET00ge1xuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZvcm11bGEgLSBMYVRlWC1zdHlsZSBzdHJpbmcsIGFzc3VtZWQgdG8gYmUgaW4gbWF0aCBtb2RlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICovXG4gIGNvbnN0cnVjdG9yKCBmb3JtdWxhLCBvcHRpb25zICkge1xuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xuICAgICAgLy8gRGVmYXVsdHNcbiAgICAgIGRpc3BsYXlNb2RlOiB0cnVlIC8vIElmIGZhbHNlLCBpdCB3aWxsIHJlbmRlciB3aXRoIHRoZSAnaW5saW5lIG1hdGgnIG1vZGUgd2hpY2ggaXMgdmVydGljYWxseSBjb25zdHJhaW5lZCBtb3JlLlxuICAgIH0sIG9wdGlvbnMgKTtcblxuICAgIGNvbnN0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc3BhbicgKTtcblxuICAgIHN1cGVyKCBzcGFuICk7XG5cbiAgICAvLyBAcHJpdmF0ZVxuICAgIHRoaXMuX3NwYW4gPSBzcGFuO1xuXG4gICAgLy8gQHByaXZhdGUgLSBTdG9yZSB0aGVzZSBpbml0aWFsbHksIHNvIHdlIGNhbiB1cGRhdGUgdGhlIGZvcm11bGEgYmVmb3JlIG11dGF0aW5nLlxuICAgIHRoaXMuX2Zvcm11bGEgPSBmb3JtdWxhOyAvLyB7c3RyaW5nfVxuICAgIHRoaXMuX2Rpc3BsYXlNb2RlID0gb3B0aW9ucy5kaXNwbGF5TW9kZTsgLy8ge2Jvb2xlYW59XG5cbiAgICB0aGlzLnVwZGF0ZUZvcm11bGEoKTtcblxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBXZSBuZWVkIHRvIGhhdmUgYSBmYWlybHkgY3VzdG9tIGJvdW5kcyBtZWFzdXJlbWVudCBtZXRob2QsIHNpbmNlIGl0J3MgYSBibG9jay1sZXZlbCBlbGVtZW50LlxuICAgKiBAcHJvdGVjdGVkXG4gICAqIEBvdmVycmlkZVxuICAgKlxuICAgKiBAcmV0dXJucyB7Qm91bmRzMn1cbiAgICovXG4gIGNhbGN1bGF0ZURPTUJvdW5kcygpIHtcbiAgICAvLyBHcmFiIGEgcGFydGljdWxhciBjaGlsZCBub2RlIGZvciBtZWFzdXJlbWVudCwgc2luY2UgaXQncyBhbiBpbmxpbmUgZWxlbWVudCBhbmQgY29udGFpbnMgZXZlcnl0aGluZyBncmFwaGljYWwuXG4gICAgY29uc3QgaHRtbExpc3QgPSB0aGlzLmVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSggJ2thdGV4LWh0bWwnICk7XG5cbiAgICAvLyBFbXB0eSBpZiB3ZSBoYXZlIG5vIGZvcm11bGEgeWV0XG4gICAgaWYgKCBodG1sTGlzdC5sZW5ndGggPT09IDAgKSB7XG4gICAgICByZXR1cm4gQm91bmRzMi5OT1RISU5HLmNvcHkoKTtcbiAgICB9XG5cbiAgICAvLyBPdXIgZWxlbWVudCBmcm9tIHRoZSBsaXN0XG4gICAgY29uc3QgZWxlbWVudCA9IGh0bWxMaXN0WyAwIF07XG5cbiAgICAvLyBvZmZzZXRMZWZ0IGlzIGFsd2F5cyAwIG9uY2UgaW4gcGxhY2UsIGFuZCB0aGlzIHNlZW1zIGxpa2UgdGhlIGJlc3Qgd2F5IHRvIG1lYXN1cmUgdGhlIGNoYW5nZSBib3RoIGJlZm9yZSBBTkRcbiAgICAvLyBhZnRlciBpdCdzIGJlZW4gYWRkZWQgdG8gdGhlIERPTS5cbiAgICByZXR1cm4gQm91bmRzMi5yZWN0KCAwLCBlbGVtZW50Lm9mZnNldFRvcCwgZWxlbWVudC5vZmZzZXRXaWR0aCwgZWxlbWVudC5vZmZzZXRIZWlnaHQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBGb3JtdWxhTm9kZSBuZWVkcyB0aGlzIG92ZXJyaWRlIGluIG9yZGVyIHRvIHJlbmRlciBmb3JtdWxhcyBjb3JyZWN0bHkgaW4gRE9NJ3MgaW52YWxpZGF0ZURPTSBtZXRob2QsIHRoZVxuICAgKiB0ZW1wb3JhcnlDb250YWluZXIgaXMgZ2l2ZW4gYSBzaXplIHRlbXBvcmFyeUNvbnRhaW5lciBoYXZpbmcgYSBzaXplIGFmZmVjdHMgdGhlIHNpemUgb2YgdGhlIGZvcm11bGEgYW5kIHJlbmRlcnNcbiAgICogY2FsY3VsYXRlRE9NQm91bmRzIHVzZWxlc3MgdGhpcyBtZXRob2QgaXMgYWxtb3N0IHRoZSBzYW1lIGFzIHRoZSBvbmUgaXQgb3ZlcnJpZGVzLCBidXQgaXQganVzdCByZW1vdmVzXG4gICAqIHRlbXBvcmFyeUNvbnRhaW5lcidzIHNpemUgc28gdGhhdCBjYWxjdWxhdGVET01Cb3VuZHMgY2FuIHdvcmsgYW5kIHRoaXMgY2FuIHJlbmRlciBjb3JyZWN0bHlcbiAgICogQHB1YmxpY1xuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIGludmFsaWRhdGVET00oKSB7XG4gICAgLy8gcHJldmVudCB0aGlzIGZyb20gYmVpbmcgZXhlY3V0ZWQgYXMgYSBzaWRlLWVmZmVjdCBmcm9tIGluc2lkZSBvbmUgb2YgaXRzIG93biBjYWxsc1xuICAgIGlmICggdGhpcy5pbnZhbGlkYXRlRE9NTG9jayApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5pbnZhbGlkYXRlRE9NTG9jayA9IHRydWU7XG5cbiAgICAvLyB3ZSB3aWxsIHBsYWNlIG91cnNlbHZlcyBpbiBhIHRlbXBvcmFyeSBjb250YWluZXIgdG8gZ2V0IG91ciByZWFsIGRlc2lyZWQgYm91bmRzXG4gICAgY29uc3QgdGVtcG9yYXJ5Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcbiAgICAkKCB0ZW1wb3JhcnlDb250YWluZXIgKS5jc3MoIHtcbiAgICAgIGRpc3BsYXk6ICdoaWRkZW4nLFxuICAgICAgcGFkZGluZzogJzAgIWltcG9ydGFudCcsXG4gICAgICBtYXJnaW46ICcwICFpbXBvcnRhbnQnLFxuICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICBsZWZ0OiAwLFxuICAgICAgdG9wOiAwXG4gICAgfSApO1xuXG4gICAgLy8gbW92ZSB0byB0aGUgdGVtcG9yYXJ5IGNvbnRhaW5lclxuICAgIHRoaXMuX2NvbnRhaW5lci5yZW1vdmVDaGlsZCggdGhpcy5fZWxlbWVudCApO1xuICAgIHRlbXBvcmFyeUNvbnRhaW5lci5hcHBlbmRDaGlsZCggdGhpcy5fZWxlbWVudCApO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIHRlbXBvcmFyeUNvbnRhaW5lciApO1xuXG4gICAgLy8gYm91bmRzIGNvbXB1dGF0aW9uIGFuZCByZXNpemUgb3VyIGNvbnRhaW5lciB0byBmaXQgcHJlY2lzZWx5XG4gICAgY29uc3Qgc2VsZkJvdW5kcyA9IHRoaXMuY2FsY3VsYXRlRE9NQm91bmRzKCk7XG4gICAgdGhpcy5pbnZhbGlkYXRlU2VsZiggc2VsZkJvdW5kcyApO1xuICAgIHRoaXMuXyRjb250YWluZXIud2lkdGgoIHNlbGZCb3VuZHMuZ2V0V2lkdGgoKSApO1xuICAgIHRoaXMuXyRjb250YWluZXIuaGVpZ2h0KCBzZWxmQm91bmRzLmdldEhlaWdodCgpICk7XG5cbiAgICAvLyBtb3ZlIGJhY2sgdG8gdGhlIG1haW4gY29udGFpbmVyXG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCggdGVtcG9yYXJ5Q29udGFpbmVyICk7XG4gICAgdGVtcG9yYXJ5Q29udGFpbmVyLnJlbW92ZUNoaWxkKCB0aGlzLl9lbGVtZW50ICk7XG4gICAgdGhpcy5fY29udGFpbmVyLmFwcGVuZENoaWxkKCB0aGlzLl9lbGVtZW50ICk7XG5cbiAgICAvLyB1bmxvY2tcbiAgICB0aGlzLmludmFsaWRhdGVET01Mb2NrID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgZm9ybXVsYSB0byBkaXNwbGF5LiBJdCBzaG91bGQgYmUgYSBzdHJpbmcsIGZvcm1hdHRlZCB3aXRoIHRoZSBnZW5lcmFsIExhVGVYIHN0eWxlLiBQYXJ0aWN1bGFyXG4gICAqIGZ1bmN0aW9uIHN1cHBvcnQgaXMgYXZhaWxhYmxlIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9LaGFuL0thVGVYL3dpa2kvRnVuY3Rpb24tU3VwcG9ydC1pbi1LYVRlWC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZm9ybXVsYSAtIFRoZSBwYXJ0aWN1bGFyIGZvcm11bGEgdG8gZGlzcGxheS5cbiAgICovXG4gIHNldEZvcm11bGEoIGZvcm11bGEgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGZvcm11bGEgPT09ICdzdHJpbmcnICk7XG5cbiAgICBpZiAoIGZvcm11bGEgIT09IHRoaXMuX2Zvcm11bGEgKSB7XG4gICAgICB0aGlzLl9mb3JtdWxhID0gZm9ybXVsYTtcbiAgICAgIHRoaXMudXBkYXRlRm9ybXVsYSgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0IGZvcm11bGEoIHZhbHVlICkgeyB0aGlzLnNldEZvcm11bGEoIHZhbHVlICk7IH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIFRoZSBzdHJpbmcgZm9yIHRoZSBmb3JtdWxhIHRoYXQgaXMgY3VycmVudGx5IGRpc3BsYXllZC5cbiAgICovXG4gIGdldEZvcm11bGEoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Zvcm11bGE7XG4gIH1cblxuICBnZXQgZm9ybXVsYSgpIHsgcmV0dXJuIHRoaXMuZ2V0Rm9ybXVsYSgpOyB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHtib29sZWFufSBkaXNwbGF5IG1vZGUuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gbW9kZVxuICAgKiAgIElmIHRydWUsIHRoZSBmb3JtdWxhIHdpbGwgYmUgZGlzcGxheWVkIGluIHRoZSBkaXNwbGF5LW1vZGUgKCQkIGluIExhVGVYKSBzdHlsZSwgd2hpY2ggaXMgdHlwaWNhbGx5IHNlcGFyYXRlZCBmcm9tXG4gICAqICAgb3RoZXIgdGV4dCwgYW5kIG9uIGl0cyBvd24gbGluZS5cbiAgICogICBJZiBmYWxzZSwgdGhlIGZvcm11bGEgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlICdpbmxpbmUgbWF0aCcgKCQgaW4gTGFUZVgpIHN0eWxlLCB3aGljaCBpcyB0eXBpY2FsbHlcbiAgICogICBtZWFudCB0byBiZSBlbWJlZGRlZCB3aXRoaW4gZmxvd2VkIHRleHQuXG4gICAqL1xuICBzZXREaXNwbGF5TW9kZSggbW9kZSApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgbW9kZSA9PT0gJ2Jvb2xlYW4nICk7XG5cbiAgICBpZiAoIG1vZGUgIT09IHRoaXMuX2Rpc3BsYXlNb2RlICkge1xuICAgICAgdGhpcy5fZGlzcGxheU1vZGUgPSBtb2RlO1xuXG4gICAgICB0aGlzLnVwZGF0ZUZvcm11bGEoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldCBkaXNwbGF5TW9kZSggdmFsdWUgKSB7IHRoaXMuc2V0RGlzcGxheU1vZGUoIHZhbHVlICk7IH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgZGlzcGxheU1vZGUgaXMgY3VycmVudGx5IHRydWUuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBnZXREaXNwbGF5TW9kZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzcGxheU1vZGU7XG4gIH1cblxuICBnZXQgZGlzcGxheU1vZGUoKSB7IHJldHVybiB0aGlzLmdldERpc3BsYXlNb2RlKCk7IH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgZGlzcGxheWVkIGZvcm11bGEgYW5kIGl0cyBib3VuZHMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB1cGRhdGVGb3JtdWxhKCkge1xuICAgIGthdGV4LnJlbmRlciggdGhpcy5fZm9ybXVsYSwgdGhpcy5fc3Bhbiwge1xuICAgICAgZGlzcGxheU1vZGU6IHRoaXMuX2Rpc3BsYXlNb2RlLFxuICAgICAgc3RyaWN0OiBlcnJvckNvZGUgPT4ge1xuICAgICAgICBpZiAoIF8uaW5jbHVkZXMoIFsgJ3Vua25vd25TeW1ib2wnLCAndW5pY29kZVRleHRJbk1hdGhNb2RlJyBdLCBlcnJvckNvZGUgKSApIHtcbiAgICAgICAgICByZXR1cm4gJ2lnbm9yZSc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICdlcnJvcic7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gcmVjb21wdXRlIGJvdW5kc1xuICAgIHRoaXMuaW52YWxpZGF0ZURPTSgpO1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnRm9ybXVsYU5vZGUnLCBGb3JtdWxhTm9kZSApO1xuXG4vLyBBbGxvdyB0aGUgbXV0YXRlKCkgY2FsbCB0byBjaGFuZ2UgZGlzcGxheU1vZGUgYW5kIGZvcm11bGEuXG5Gb3JtdWxhTm9kZS5wcm90b3R5cGUuX211dGF0b3JLZXlzID0gWyAnZGlzcGxheU1vZGUnLCAnZm9ybXVsYScgXS5jb25jYXQoIERPTS5wcm90b3R5cGUuX211dGF0b3JLZXlzICk7XG5cbmV4cG9ydCBkZWZhdWx0IEZvcm11bGFOb2RlOyJdLCJuYW1lcyI6WyJCb3VuZHMyIiwibWVyZ2UiLCJET00iLCJzY2VuZXJ5UGhldCIsIkZvcm11bGFOb2RlIiwiY2FsY3VsYXRlRE9NQm91bmRzIiwiaHRtbExpc3QiLCJlbGVtZW50IiwiZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSIsImxlbmd0aCIsIk5PVEhJTkciLCJjb3B5IiwicmVjdCIsIm9mZnNldFRvcCIsIm9mZnNldFdpZHRoIiwib2Zmc2V0SGVpZ2h0IiwiaW52YWxpZGF0ZURPTSIsImludmFsaWRhdGVET01Mb2NrIiwidGVtcG9yYXJ5Q29udGFpbmVyIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiJCIsImNzcyIsImRpc3BsYXkiLCJwYWRkaW5nIiwibWFyZ2luIiwicG9zaXRpb24iLCJsZWZ0IiwidG9wIiwiX2NvbnRhaW5lciIsInJlbW92ZUNoaWxkIiwiX2VsZW1lbnQiLCJhcHBlbmRDaGlsZCIsImJvZHkiLCJzZWxmQm91bmRzIiwiaW52YWxpZGF0ZVNlbGYiLCJfJGNvbnRhaW5lciIsIndpZHRoIiwiZ2V0V2lkdGgiLCJoZWlnaHQiLCJnZXRIZWlnaHQiLCJzZXRGb3JtdWxhIiwiZm9ybXVsYSIsImFzc2VydCIsIl9mb3JtdWxhIiwidXBkYXRlRm9ybXVsYSIsInZhbHVlIiwiZ2V0Rm9ybXVsYSIsInNldERpc3BsYXlNb2RlIiwibW9kZSIsIl9kaXNwbGF5TW9kZSIsImRpc3BsYXlNb2RlIiwiZ2V0RGlzcGxheU1vZGUiLCJrYXRleCIsInJlbmRlciIsIl9zcGFuIiwic3RyaWN0IiwiZXJyb3JDb2RlIiwiXyIsImluY2x1ZGVzIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwic3BhbiIsIm11dGF0ZSIsInJlZ2lzdGVyIiwicHJvdG90eXBlIiwiX211dGF0b3JLZXlzIiwiY29uY2F0Il0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Q0FhQyxHQUVELE9BQU9BLGFBQWEsMEJBQTBCO0FBQzlDLE9BQU9DLFdBQVcsOEJBQThCO0FBQ2hELFNBQVNDLEdBQUcsUUFBUSw4QkFBOEI7QUFDbEQsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQUUzQyxJQUFBLEFBQU1DLGNBQU4sTUFBTUEsb0JBQW9CRjtJQTRCeEI7Ozs7OztHQU1DLEdBQ0RHLHFCQUFxQjtRQUNuQixnSEFBZ0g7UUFDaEgsTUFBTUMsV0FBVyxJQUFJLENBQUNDLE9BQU8sQ0FBQ0Msc0JBQXNCLENBQUU7UUFFdEQsa0NBQWtDO1FBQ2xDLElBQUtGLFNBQVNHLE1BQU0sS0FBSyxHQUFJO1lBQzNCLE9BQU9ULFFBQVFVLE9BQU8sQ0FBQ0MsSUFBSTtRQUM3QjtRQUVBLDRCQUE0QjtRQUM1QixNQUFNSixVQUFVRCxRQUFRLENBQUUsRUFBRztRQUU3QiwrR0FBK0c7UUFDL0csb0NBQW9DO1FBQ3BDLE9BQU9OLFFBQVFZLElBQUksQ0FBRSxHQUFHTCxRQUFRTSxTQUFTLEVBQUVOLFFBQVFPLFdBQVcsRUFB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