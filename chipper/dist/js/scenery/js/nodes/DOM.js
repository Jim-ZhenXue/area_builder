// Copyright 2013-2024, University of Colorado Boulder
/**
 * Displays a DOM element directly in a node, so that it can be positioned/transformed properly, and bounds are handled properly in Scenery.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ /* global JQuery */ import Bounds2 from '../../../dot/js/Bounds2.js';
import extendDefined from '../../../phet-core/js/extendDefined.js';
import { DOMDrawable, Node, Renderer, scenery } from '../imports.js';
const DOM_OPTION_KEYS = [
    'element',
    'preventTransform',
    'allowInput'
];
// User-defined type guard
const isJQueryElement = (element)=>!!(element && element.jquery);
let DOM = class DOM extends Node {
    /**
   * Computes the bounds of our current DOM element (using jQuery, as replacing this with other things seems a bit
   * bug-prone and has caused issues in the past).
   *
   * The dom element needs to be attached to the DOM tree in order for this to work.
   *
   * Alternative getBoundingClientRect explored, but did not seem sufficient (possibly due to CSS transforms)?
   */ calculateDOMBounds() {
        const $element = $(this._element);
        return new Bounds2(0, 0, $element.width(), $element.height());
    }
    /**
   * Triggers recomputation of our DOM element's bounds.
   *
   * This should be called after the DOM element's bounds may have changed, to properly update the bounding box
   * in Scenery.
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
            top: 0,
            width: 65535,
            height: 65535
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
   * Creates a DOM drawable for this DOM node. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */ createDOMDrawable(renderer, instance) {
        // @ts-expect-error Poolable
        return DOMDrawable.createFromPool(renderer, instance);
    }
    /**
   * Whether this Node itself is painted (displays something itself).
   */ isPainted() {
        // Always true for DOM nodes
        return true;
    }
    /**
   * Changes the DOM element of this DOM node to another element.
   */ setElement(element) {
        assert && assert(!this._element, 'We should only ever attach one DOMElement to a DOM node');
        if (this._element !== element) {
            if (this._element) {
                this._container.removeChild(this._element);
            }
            this._element = element;
            this._container.appendChild(this._element);
            this.invalidateDOM();
        }
        return this; // allow chaining
    }
    set element(value) {
        this.setElement(value);
    }
    get element() {
        return this.getElement();
    }
    /**
   * Returns the DOM element being displayed by this DOM node.
   */ getElement() {
        return this._element;
    }
    /**
   * Sets the value of the preventTransform flag.
   *
   * When the preventTransform flag is set to true, Scenery will not reposition (CSS transform) the DOM element, but
   * instead it will be at the upper-left (0,0) of the Scenery Display. The client will be responsible for sizing or
   * positioning this element instead.
   */ setPreventTransform(preventTransform) {
        if (this._preventTransform !== preventTransform) {
            this._preventTransform = preventTransform;
        }
    }
    set preventTransform(value) {
        this.setPreventTransform(value);
    }
    get preventTransform() {
        return this.isTransformPrevented();
    }
    /**
   * Returns the value of the preventTransform flag.
   *
   * See the setPreventTransform documentation for more information on the flag.
   */ isTransformPrevented() {
        return this._preventTransform;
    }
    /**
   * Sets whether input is allowed for the DOM element. If false, we will disable input events with pointerEvents and
   * the usual preventDefault(). If true, we'll set a flag internally so that we don't preventDefault() on input events.
   */ setAllowInput(allowInput) {
        if (this._allowInput !== allowInput) {
            this._allowInput = allowInput;
            this.invalidateAllowInput(allowInput);
        }
    }
    isInputAllowed() {
        return this._allowInput;
    }
    invalidateAllowInput(allowInput) {
        this._container.dataset.sceneryAllowInput = allowInput ? 'true' : 'false';
        this._container.style.pointerEvents = allowInput ? 'auto' : 'none';
    }
    set allowInput(value) {
        this.setAllowInput(value);
    }
    get allowInput() {
        return this.isInputAllowed();
    }
    mutate(options) {
        return super.mutate(options);
    }
    /**
   * @param element - The HTML element, or a jQuery selector result.
   * @param [options] - DOM-specific options are documented in DOM_OPTION_KEYS above, and can be provided
   *                             along-side options for Node
   */ constructor(element, options){
        assert && assert(options === undefined || Object.getPrototypeOf(options) === Object.prototype, 'Extra prototype on Node options object is a code smell');
        assert && assert(element instanceof window.Element || element.jquery, 'DOM nodes need to be passed an HTML/DOM element or a jQuery selection like $( ... )');
        // unwrap from jQuery if that is passed in, for consistency
        if (isJQueryElement(element)) {
            element = element[0];
            assert && assert(element instanceof window.Element);
        }
        super();
        this._container = document.createElement('div');
        this._container.style.position = 'absolute';
        this._container.style.left = '0';
        this._container.style.top = '0';
        this._allowInput = false;
        this._$container = $(this._container);
        this.invalidateDOMLock = false;
        this._preventTransform = false;
        this.invalidateAllowInput(this._allowInput);
        // Have mutate() call setElement() in the proper order
        options = extendDefined({
            element: element
        }, options);
        // will set the element after initializing
        this.mutate(options);
        // Only renderer supported, no need to dynamically compute
        this.setRendererBitmask(Renderer.bitmaskDOM);
    }
};
export { DOM as default };
/**
 * {Array.<string>} - String keys for all of the allowed options that will be set by node.mutate( options ), in the
 * order they will be evaluated in.
 *
 * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
 *       cases that may apply.
 */ DOM.prototype._mutatorKeys = DOM_OPTION_KEYS.concat(Node.prototype._mutatorKeys);
scenery.register('DOM', DOM);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbm9kZXMvRE9NLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERpc3BsYXlzIGEgRE9NIGVsZW1lbnQgZGlyZWN0bHkgaW4gYSBub2RlLCBzbyB0aGF0IGl0IGNhbiBiZSBwb3NpdGlvbmVkL3RyYW5zZm9ybWVkIHByb3Blcmx5LCBhbmQgYm91bmRzIGFyZSBoYW5kbGVkIHByb3Blcmx5IGluIFNjZW5lcnkuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbi8qIGdsb2JhbCBKUXVlcnkgKi9cbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBleHRlbmREZWZpbmVkIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9leHRlbmREZWZpbmVkLmpzJztcbmltcG9ydCB7IERPTURyYXdhYmxlLCBET01TZWxmRHJhd2FibGUsIEluc3RhbmNlLCBOb2RlLCBOb2RlT3B0aW9ucywgUmVuZGVyZXIsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuY29uc3QgRE9NX09QVElPTl9LRVlTID0gW1xuICAnZWxlbWVudCcsXG4gICdwcmV2ZW50VHJhbnNmb3JtJyxcbiAgJ2FsbG93SW5wdXQnXG5dO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICAvLyBTZXRzIHRoZSBlbGVtZW50LCBzZWUgc2V0RWxlbWVudCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgZWxlbWVudD86IEVsZW1lbnQ7XG5cbiAgLy8gU2V0cyB3aGV0aGVyIFNjZW5lcnkgaXMgYWxsb3dlZCB0byB0cmFuc2Zvcm0gdGhlIGVsZW1lbnQuIHNlZSBzZXRQcmV2ZW50VHJhbnNmb3JtKCkgZm9yIGRvY3NcbiAgcHJldmVudFRyYW5zZm9ybT86IGJvb2xlYW47XG5cbiAgLy8gV2hldGhlciB3ZSBhbGxvdyBpbnB1dCB0byBiZSByZWNlaXZlZCBieSB0aGUgRE9NIGVsZW1lbnRcbiAgYWxsb3dJbnB1dD86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBET01PcHRpb25zID0gU2VsZk9wdGlvbnMgJiBOb2RlT3B0aW9ucztcblxuLy8gVXNlci1kZWZpbmVkIHR5cGUgZ3VhcmRcbmNvbnN0IGlzSlF1ZXJ5RWxlbWVudCA9ICggZWxlbWVudDogRWxlbWVudCB8IEpRdWVyeSApOiBlbGVtZW50IGlzIEpRdWVyeSA9PiAhISggZWxlbWVudCAmJiAoIGVsZW1lbnQgYXMgSlF1ZXJ5ICkuanF1ZXJ5ICk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERPTSBleHRlbmRzIE5vZGUge1xuXG4gIHByaXZhdGUgX2VsZW1lbnQhOiBIVE1MRWxlbWVudDtcblxuICAvLyBDb250YWluZXIgZGl2IHRoYXQgd2lsbCBoYXZlIG91ciBtYWluIGVsZW1lbnQgYXMgYSBjaGlsZCAoc28gd2UgY2FuIHBvc2l0aW9uIGFuZCBtdXRhdGUgaXQpLlxuICBwdWJsaWMgcmVhZG9ubHkgX2NvbnRhaW5lcjogSFRNTERpdkVsZW1lbnQ7IC8vIHNjZW5lcnktaW50ZXJuYWxcblxuICAvLyBqUXVlcnkgc2VsZWN0aW9uIHNvIHRoYXQgd2UgY2FuIHByb3Blcmx5IGRldGVybWluZSBzaXplIGluZm9ybWF0aW9uXG4gIHByaXZhdGUgcmVhZG9ubHkgXyRjb250YWluZXI6IEpRdWVyeTxIVE1MRGl2RWxlbWVudD47XG5cbiAgLy8gRmxhZyB0aGF0IGluZGljYXRlcyB3aGV0aGVyIHdlIGFyZSB1cGRhdGluZy9pbnZhbGlkYXRpbmcgb3Vyc2VsZiBkdWUgdG8gY2hhbmdlcyB0byB0aGUgRE9NIGVsZW1lbnQuIFRoZSBmbGFnIGlzXG4gIC8vIG5lZWRlZCBzbyB0aGF0IHVwZGF0ZXMgdG8gb3VyIGVsZW1lbnQgdGhhdCB3ZSBtYWtlIGluIHRoZSB1cGRhdGUvaW52YWxpZGF0ZSBzZWN0aW9uIGRvZXNuJ3QgdHJpZ2dlciBhbiBpbmZpbml0ZVxuICAvLyBsb29wIHdpdGggYW5vdGhlciB1cGRhdGUuXG4gIHByaXZhdGUgaW52YWxpZGF0ZURPTUxvY2s6IGJvb2xlYW47XG5cbiAgLy8gRmxhZyB0aGF0IHdoZW4gdHJ1ZSB3b24ndCBsZXQgU2NlbmVyeSBhcHBseSBhIHRyYW5zZm9ybSBkaXJlY3RseSAodGhlIGNsaWVudCB3aWxsIHRha2UgY2FyZSBvZiB0aGF0KS5cbiAgcHJpdmF0ZSBfcHJldmVudFRyYW5zZm9ybTogYm9vbGVhbjtcblxuICAvLyBXaGV0aGVyIHdlIGFsbG93IGlucHV0IHRvIGJlIHJlY2VpdmVkIGJ5IHRoZSBET00gZWxlbWVudFxuICBwcml2YXRlIF9hbGxvd0lucHV0OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gZWxlbWVudCAtIFRoZSBIVE1MIGVsZW1lbnQsIG9yIGEgalF1ZXJ5IHNlbGVjdG9yIHJlc3VsdC5cbiAgICogQHBhcmFtIFtvcHRpb25zXSAtIERPTS1zcGVjaWZpYyBvcHRpb25zIGFyZSBkb2N1bWVudGVkIGluIERPTV9PUFRJT05fS0VZUyBhYm92ZSwgYW5kIGNhbiBiZSBwcm92aWRlZFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxvbmctc2lkZSBvcHRpb25zIGZvciBOb2RlXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGVsZW1lbnQ6IEVsZW1lbnQgfCBKUXVlcnksIG9wdGlvbnM/OiBET01PcHRpb25zICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMgPT09IHVuZGVmaW5lZCB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIG9wdGlvbnMgKSA9PT0gT2JqZWN0LnByb3RvdHlwZSxcbiAgICAgICdFeHRyYSBwcm90b3R5cGUgb24gTm9kZSBvcHRpb25zIG9iamVjdCBpcyBhIGNvZGUgc21lbGwnICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBlbGVtZW50IGluc3RhbmNlb2Ygd2luZG93LkVsZW1lbnQgfHwgZWxlbWVudC5qcXVlcnksICdET00gbm9kZXMgbmVlZCB0byBiZSBwYXNzZWQgYW4gSFRNTC9ET00gZWxlbWVudCBvciBhIGpRdWVyeSBzZWxlY3Rpb24gbGlrZSAkKCAuLi4gKScgKTtcblxuICAgIC8vIHVud3JhcCBmcm9tIGpRdWVyeSBpZiB0aGF0IGlzIHBhc3NlZCBpbiwgZm9yIGNvbnNpc3RlbmN5XG4gICAgaWYgKCBpc0pRdWVyeUVsZW1lbnQoIGVsZW1lbnQgKSApIHtcbiAgICAgIGVsZW1lbnQgPSBlbGVtZW50WyAwIF07XG5cbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGVsZW1lbnQgaW5zdGFuY2VvZiB3aW5kb3cuRWxlbWVudCApO1xuICAgIH1cblxuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9jb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuICAgIHRoaXMuX2NvbnRhaW5lci5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgdGhpcy5fY29udGFpbmVyLnN0eWxlLmxlZnQgPSAnMCc7XG4gICAgdGhpcy5fY29udGFpbmVyLnN0eWxlLnRvcCA9ICcwJztcbiAgICB0aGlzLl9hbGxvd0lucHV0ID0gZmFsc2U7XG5cbiAgICB0aGlzLl8kY29udGFpbmVyID0gJCggdGhpcy5fY29udGFpbmVyICk7XG5cbiAgICB0aGlzLmludmFsaWRhdGVET01Mb2NrID0gZmFsc2U7XG4gICAgdGhpcy5fcHJldmVudFRyYW5zZm9ybSA9IGZhbHNlO1xuXG4gICAgdGhpcy5pbnZhbGlkYXRlQWxsb3dJbnB1dCggdGhpcy5fYWxsb3dJbnB1dCApO1xuXG4gICAgLy8gSGF2ZSBtdXRhdGUoKSBjYWxsIHNldEVsZW1lbnQoKSBpbiB0aGUgcHJvcGVyIG9yZGVyXG4gICAgb3B0aW9ucyA9IGV4dGVuZERlZmluZWQ8RE9NT3B0aW9ucz4oIHtcbiAgICAgIGVsZW1lbnQ6IGVsZW1lbnRcbiAgICB9LCBvcHRpb25zICk7XG5cbiAgICAvLyB3aWxsIHNldCB0aGUgZWxlbWVudCBhZnRlciBpbml0aWFsaXppbmdcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xuXG4gICAgLy8gT25seSByZW5kZXJlciBzdXBwb3J0ZWQsIG5vIG5lZWQgdG8gZHluYW1pY2FsbHkgY29tcHV0ZVxuICAgIHRoaXMuc2V0UmVuZGVyZXJCaXRtYXNrKCBSZW5kZXJlci5iaXRtYXNrRE9NICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyB0aGUgYm91bmRzIG9mIG91ciBjdXJyZW50IERPTSBlbGVtZW50ICh1c2luZyBqUXVlcnksIGFzIHJlcGxhY2luZyB0aGlzIHdpdGggb3RoZXIgdGhpbmdzIHNlZW1zIGEgYml0XG4gICAqIGJ1Zy1wcm9uZSBhbmQgaGFzIGNhdXNlZCBpc3N1ZXMgaW4gdGhlIHBhc3QpLlxuICAgKlxuICAgKiBUaGUgZG9tIGVsZW1lbnQgbmVlZHMgdG8gYmUgYXR0YWNoZWQgdG8gdGhlIERPTSB0cmVlIGluIG9yZGVyIGZvciB0aGlzIHRvIHdvcmsuXG4gICAqXG4gICAqIEFsdGVybmF0aXZlIGdldEJvdW5kaW5nQ2xpZW50UmVjdCBleHBsb3JlZCwgYnV0IGRpZCBub3Qgc2VlbSBzdWZmaWNpZW50IChwb3NzaWJseSBkdWUgdG8gQ1NTIHRyYW5zZm9ybXMpP1xuICAgKi9cbiAgcHJvdGVjdGVkIGNhbGN1bGF0ZURPTUJvdW5kcygpOiBCb3VuZHMyIHtcbiAgICBjb25zdCAkZWxlbWVudCA9ICQoIHRoaXMuX2VsZW1lbnQgKTtcbiAgICByZXR1cm4gbmV3IEJvdW5kczIoIDAsIDAsICRlbGVtZW50LndpZHRoKCkhLCAkZWxlbWVudC5oZWlnaHQoKSEgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyByZWNvbXB1dGF0aW9uIG9mIG91ciBET00gZWxlbWVudCdzIGJvdW5kcy5cbiAgICpcbiAgICogVGhpcyBzaG91bGQgYmUgY2FsbGVkIGFmdGVyIHRoZSBET00gZWxlbWVudCdzIGJvdW5kcyBtYXkgaGF2ZSBjaGFuZ2VkLCB0byBwcm9wZXJseSB1cGRhdGUgdGhlIGJvdW5kaW5nIGJveFxuICAgKiBpbiBTY2VuZXJ5LlxuICAgKi9cbiAgcHVibGljIGludmFsaWRhdGVET00oKTogdm9pZCB7XG4gICAgLy8gcHJldmVudCB0aGlzIGZyb20gYmVpbmcgZXhlY3V0ZWQgYXMgYSBzaWRlLWVmZmVjdCBmcm9tIGluc2lkZSBvbmUgb2YgaXRzIG93biBjYWxsc1xuICAgIGlmICggdGhpcy5pbnZhbGlkYXRlRE9NTG9jayApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5pbnZhbGlkYXRlRE9NTG9jayA9IHRydWU7XG5cbiAgICAvLyB3ZSB3aWxsIHBsYWNlIG91cnNlbHZlcyBpbiBhIHRlbXBvcmFyeSBjb250YWluZXIgdG8gZ2V0IG91ciByZWFsIGRlc2lyZWQgYm91bmRzXG4gICAgY29uc3QgdGVtcG9yYXJ5Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcbiAgICAkKCB0ZW1wb3JhcnlDb250YWluZXIgKS5jc3MoIHtcbiAgICAgIGRpc3BsYXk6ICdoaWRkZW4nLFxuICAgICAgcGFkZGluZzogJzAgIWltcG9ydGFudCcsXG4gICAgICBtYXJnaW46ICcwICFpbXBvcnRhbnQnLFxuICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICBsZWZ0OiAwLFxuICAgICAgdG9wOiAwLFxuICAgICAgd2lkdGg6IDY1NTM1LFxuICAgICAgaGVpZ2h0OiA2NTUzNVxuICAgIH0gKTtcblxuICAgIC8vIG1vdmUgdG8gdGhlIHRlbXBvcmFyeSBjb250YWluZXJcbiAgICB0aGlzLl9jb250YWluZXIucmVtb3ZlQ2hpbGQoIHRoaXMuX2VsZW1lbnQgKTtcbiAgICB0ZW1wb3JhcnlDb250YWluZXIuYXBwZW5kQ2hpbGQoIHRoaXMuX2VsZW1lbnQgKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCB0ZW1wb3JhcnlDb250YWluZXIgKTtcblxuICAgIC8vIGJvdW5kcyBjb21wdXRhdGlvbiBhbmQgcmVzaXplIG91ciBjb250YWluZXIgdG8gZml0IHByZWNpc2VseVxuICAgIGNvbnN0IHNlbGZCb3VuZHMgPSB0aGlzLmNhbGN1bGF0ZURPTUJvdW5kcygpO1xuICAgIHRoaXMuaW52YWxpZGF0ZVNlbGYoIHNlbGZCb3VuZHMgKTtcbiAgICB0aGlzLl8kY29udGFpbmVyLndpZHRoKCBzZWxmQm91bmRzLmdldFdpZHRoKCkgKTtcbiAgICB0aGlzLl8kY29udGFpbmVyLmhlaWdodCggc2VsZkJvdW5kcy5nZXRIZWlnaHQoKSApO1xuXG4gICAgLy8gbW92ZSBiYWNrIHRvIHRoZSBtYWluIGNvbnRhaW5lclxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoIHRlbXBvcmFyeUNvbnRhaW5lciApO1xuICAgIHRlbXBvcmFyeUNvbnRhaW5lci5yZW1vdmVDaGlsZCggdGhpcy5fZWxlbWVudCApO1xuICAgIHRoaXMuX2NvbnRhaW5lci5hcHBlbmRDaGlsZCggdGhpcy5fZWxlbWVudCApO1xuXG4gICAgLy8gdW5sb2NrXG4gICAgdGhpcy5pbnZhbGlkYXRlRE9NTG9jayA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBET00gZHJhd2FibGUgZm9yIHRoaXMgRE9NIG5vZGUuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBAcGFyYW0gcmVuZGVyZXIgLSBJbiB0aGUgYml0bWFzayBmb3JtYXQgc3BlY2lmaWVkIGJ5IFJlbmRlcmVyLCB3aGljaCBtYXkgY29udGFpbiBhZGRpdGlvbmFsIGJpdCBmbGFncy5cbiAgICogQHBhcmFtIGluc3RhbmNlIC0gSW5zdGFuY2Ugb2JqZWN0IHRoYXQgd2lsbCBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGRyYXdhYmxlXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgY3JlYXRlRE9NRHJhd2FibGUoIHJlbmRlcmVyOiBudW1iZXIsIGluc3RhbmNlOiBJbnN0YW5jZSApOiBET01TZWxmRHJhd2FibGUge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgUG9vbGFibGVcbiAgICByZXR1cm4gRE9NRHJhd2FibGUuY3JlYXRlRnJvbVBvb2woIHJlbmRlcmVyLCBpbnN0YW5jZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhpcyBOb2RlIGl0c2VsZiBpcyBwYWludGVkIChkaXNwbGF5cyBzb21ldGhpbmcgaXRzZWxmKS5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBpc1BhaW50ZWQoKTogYm9vbGVhbiB7XG4gICAgLy8gQWx3YXlzIHRydWUgZm9yIERPTSBub2Rlc1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIENoYW5nZXMgdGhlIERPTSBlbGVtZW50IG9mIHRoaXMgRE9NIG5vZGUgdG8gYW5vdGhlciBlbGVtZW50LlxuICAgKi9cbiAgcHVibGljIHNldEVsZW1lbnQoIGVsZW1lbnQ6IEhUTUxFbGVtZW50ICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLl9lbGVtZW50LCAnV2Ugc2hvdWxkIG9ubHkgZXZlciBhdHRhY2ggb25lIERPTUVsZW1lbnQgdG8gYSBET00gbm9kZScgKTtcblxuICAgIGlmICggdGhpcy5fZWxlbWVudCAhPT0gZWxlbWVudCApIHtcbiAgICAgIGlmICggdGhpcy5fZWxlbWVudCApIHtcbiAgICAgICAgdGhpcy5fY29udGFpbmVyLnJlbW92ZUNoaWxkKCB0aGlzLl9lbGVtZW50ICk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuXG4gICAgICB0aGlzLl9jb250YWluZXIuYXBwZW5kQ2hpbGQoIHRoaXMuX2VsZW1lbnQgKTtcblxuICAgICAgdGhpcy5pbnZhbGlkYXRlRE9NKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXG4gIH1cblxuICBwdWJsaWMgc2V0IGVsZW1lbnQoIHZhbHVlOiBIVE1MRWxlbWVudCApIHsgdGhpcy5zZXRFbGVtZW50KCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBlbGVtZW50KCk6IEhUTUxFbGVtZW50IHsgcmV0dXJuIHRoaXMuZ2V0RWxlbWVudCgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIERPTSBlbGVtZW50IGJlaW5nIGRpc3BsYXllZCBieSB0aGlzIERPTSBub2RlLlxuICAgKi9cbiAgcHVibGljIGdldEVsZW1lbnQoKTogSFRNTEVsZW1lbnQge1xuICAgIHJldHVybiB0aGlzLl9lbGVtZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHZhbHVlIG9mIHRoZSBwcmV2ZW50VHJhbnNmb3JtIGZsYWcuXG4gICAqXG4gICAqIFdoZW4gdGhlIHByZXZlbnRUcmFuc2Zvcm0gZmxhZyBpcyBzZXQgdG8gdHJ1ZSwgU2NlbmVyeSB3aWxsIG5vdCByZXBvc2l0aW9uIChDU1MgdHJhbnNmb3JtKSB0aGUgRE9NIGVsZW1lbnQsIGJ1dFxuICAgKiBpbnN0ZWFkIGl0IHdpbGwgYmUgYXQgdGhlIHVwcGVyLWxlZnQgKDAsMCkgb2YgdGhlIFNjZW5lcnkgRGlzcGxheS4gVGhlIGNsaWVudCB3aWxsIGJlIHJlc3BvbnNpYmxlIGZvciBzaXppbmcgb3JcbiAgICogcG9zaXRpb25pbmcgdGhpcyBlbGVtZW50IGluc3RlYWQuXG4gICAqL1xuICBwdWJsaWMgc2V0UHJldmVudFRyYW5zZm9ybSggcHJldmVudFRyYW5zZm9ybTogYm9vbGVhbiApOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMuX3ByZXZlbnRUcmFuc2Zvcm0gIT09IHByZXZlbnRUcmFuc2Zvcm0gKSB7XG4gICAgICB0aGlzLl9wcmV2ZW50VHJhbnNmb3JtID0gcHJldmVudFRyYW5zZm9ybTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc2V0IHByZXZlbnRUcmFuc2Zvcm0oIHZhbHVlOiBib29sZWFuICkgeyB0aGlzLnNldFByZXZlbnRUcmFuc2Zvcm0oIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IHByZXZlbnRUcmFuc2Zvcm0oKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmlzVHJhbnNmb3JtUHJldmVudGVkKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdmFsdWUgb2YgdGhlIHByZXZlbnRUcmFuc2Zvcm0gZmxhZy5cbiAgICpcbiAgICogU2VlIHRoZSBzZXRQcmV2ZW50VHJhbnNmb3JtIGRvY3VtZW50YXRpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24gb24gdGhlIGZsYWcuXG4gICAqL1xuICBwdWJsaWMgaXNUcmFuc2Zvcm1QcmV2ZW50ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3ByZXZlbnRUcmFuc2Zvcm07XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB3aGV0aGVyIGlucHV0IGlzIGFsbG93ZWQgZm9yIHRoZSBET00gZWxlbWVudC4gSWYgZmFsc2UsIHdlIHdpbGwgZGlzYWJsZSBpbnB1dCBldmVudHMgd2l0aCBwb2ludGVyRXZlbnRzIGFuZFxuICAgKiB0aGUgdXN1YWwgcHJldmVudERlZmF1bHQoKS4gSWYgdHJ1ZSwgd2UnbGwgc2V0IGEgZmxhZyBpbnRlcm5hbGx5IHNvIHRoYXQgd2UgZG9uJ3QgcHJldmVudERlZmF1bHQoKSBvbiBpbnB1dCBldmVudHMuXG4gICAqL1xuICBwdWJsaWMgc2V0QWxsb3dJbnB1dCggYWxsb3dJbnB1dDogYm9vbGVhbiApOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMuX2FsbG93SW5wdXQgIT09IGFsbG93SW5wdXQgKSB7XG4gICAgICB0aGlzLl9hbGxvd0lucHV0ID0gYWxsb3dJbnB1dDtcblxuICAgICAgdGhpcy5pbnZhbGlkYXRlQWxsb3dJbnB1dCggYWxsb3dJbnB1dCApO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBpc0lucHV0QWxsb3dlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX2FsbG93SW5wdXQ7IH1cblxuICBwcml2YXRlIGludmFsaWRhdGVBbGxvd0lucHV0KCBhbGxvd0lucHV0OiBib29sZWFuICk6IHZvaWQge1xuICAgIHRoaXMuX2NvbnRhaW5lci5kYXRhc2V0LnNjZW5lcnlBbGxvd0lucHV0ID0gYWxsb3dJbnB1dCA/ICd0cnVlJyA6ICdmYWxzZSc7XG4gICAgdGhpcy5fY29udGFpbmVyLnN0eWxlLnBvaW50ZXJFdmVudHMgPSBhbGxvd0lucHV0ID8gJ2F1dG8nIDogJ25vbmUnO1xuICB9XG5cbiAgcHVibGljIHNldCBhbGxvd0lucHV0KCB2YWx1ZTogYm9vbGVhbiApIHsgdGhpcy5zZXRBbGxvd0lucHV0KCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBhbGxvd0lucHV0KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5pc0lucHV0QWxsb3dlZCgpOyB9XG5cbiAgcHVibGljIG92ZXJyaWRlIG11dGF0ZSggb3B0aW9ucz86IERPTU9wdGlvbnMgKTogdGhpcyB7XG4gICAgcmV0dXJuIHN1cGVyLm11dGF0ZSggb3B0aW9ucyApO1xuICB9XG59XG5cbi8qKlxuICoge0FycmF5LjxzdHJpbmc+fSAtIFN0cmluZyBrZXlzIGZvciBhbGwgb2YgdGhlIGFsbG93ZWQgb3B0aW9ucyB0aGF0IHdpbGwgYmUgc2V0IGJ5IG5vZGUubXV0YXRlKCBvcHRpb25zICksIGluIHRoZVxuICogb3JkZXIgdGhleSB3aWxsIGJlIGV2YWx1YXRlZCBpbi5cbiAqXG4gKiBOT1RFOiBTZWUgTm9kZSdzIF9tdXRhdG9yS2V5cyBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uIG9uIGhvdyB0aGlzIG9wZXJhdGVzLCBhbmQgcG90ZW50aWFsIHNwZWNpYWxcbiAqICAgICAgIGNhc2VzIHRoYXQgbWF5IGFwcGx5LlxuICovXG5ET00ucHJvdG90eXBlLl9tdXRhdG9yS2V5cyA9IERPTV9PUFRJT05fS0VZUy5jb25jYXQoIE5vZGUucHJvdG90eXBlLl9tdXRhdG9yS2V5cyApO1xuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnRE9NJywgRE9NICk7Il0sIm5hbWVzIjpbIkJvdW5kczIiLCJleHRlbmREZWZpbmVkIiwiRE9NRHJhd2FibGUiLCJOb2RlIiwiUmVuZGVyZXIiLCJzY2VuZXJ5IiwiRE9NX09QVElPTl9LRVlTIiwiaXNKUXVlcnlFbGVtZW50IiwiZWxlbWVudCIsImpxdWVyeSIsIkRPTSIsImNhbGN1bGF0ZURPTUJvdW5kcyIsIiRlbGVtZW50IiwiJCIsIl9lbGVtZW50Iiwid2lkdGgiLCJoZWlnaHQiLCJpbnZhbGlkYXRlRE9NIiwiaW52YWxpZGF0ZURPTUxvY2siLCJ0ZW1wb3JhcnlDb250YWluZXIiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJjc3MiLCJkaXNwbGF5IiwicGFkZGluZyIsIm1hcmdpbiIsInBvc2l0aW9uIiwibGVmdCIsInRvcCIsIl9jb250YWluZXIiLCJyZW1vdmVDaGlsZCIsImFwcGVuZENoaWxkIiwiYm9keSIsInNlbGZCb3VuZHMiLCJpbnZhbGlkYXRlU2VsZiIsIl8kY29udGFpbmVyIiwiZ2V0V2lkdGgiLCJnZXRIZWlnaHQiLCJjcmVhdGVET01EcmF3YWJsZSIsInJlbmRlcmVyIiwiaW5zdGFuY2UiLCJjcmVhdGVGcm9tUG9vbCIsImlzUGFpbnRlZCIsInNldEVsZW1lbnQiLCJhc3NlcnQiLCJ2YWx1ZSIsImdldEVsZW1lbnQiLCJzZXRQcmV2ZW50VHJhbnNmb3JtIiwicHJldmVudFRyYW5zZm9ybSIsIl9wcmV2ZW50VHJhbnNmb3JtIiwiaXNUcmFuc2Zvcm1QcmV2ZW50ZWQiLCJzZXRBbGxvd0lucHV0IiwiYWxsb3dJbnB1dCIsIl9hbGxvd0lucHV0IiwiaW52YWxpZGF0ZUFsbG93SW5wdXQiLCJpc0lucHV0QWxsb3dlZCIsImRhdGFzZXQiLCJzY2VuZXJ5QWxsb3dJbnB1dCIsInN0eWxlIiwicG9pbnRlckV2ZW50cyIsIm11dGF0ZSIsIm9wdGlvbnMiLCJ1bmRlZmluZWQiLCJPYmplY3QiLCJnZXRQcm90b3R5cGVPZiIsInByb3RvdHlwZSIsIndpbmRvdyIsIkVsZW1lbnQiLCJzZXRSZW5kZXJlckJpdG1hc2siLCJiaXRtYXNrRE9NIiwiX211dGF0b3JLZXlzIiwiY29uY2F0IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNE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