// Copyright 2017-2024, University of Colorado Boulder
/**
 * A trait for subtypes of Node, used to make the Node behave like a 'slider' with assistive technology. This could be
 * used by anything that moves along a 1-D line. An accessible slider behaves like:
 *
 * - Arrow keys increment/decrement the slider by a specified step size.
 * - Holding shift with arrow keys will increment/decrement by alternative step size, usually smaller than default.
 * - Page Up and Page Down increments/decrements value by an alternative step size, usually larger than default.
 * - Home key sets value to its minimum.
 * - End key sets value to its maximum.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import assertHasProperties from '../../../phet-core/js/assertHasProperties.js';
import { DelayedMutate } from '../../../scenery/js/imports.js';
import sun from '../sun.js';
import AccessibleValueHandler from './AccessibleValueHandler.js';
const ACCESSIBLE_SLIDER_OPTIONS = [
    'startDrag',
    'drag',
    'endDrag'
];
/**
 * @param Type
 * @param optionsArgPosition - zero-indexed number that the options argument is provided at in the constructor for Type
 */ const AccessibleSlider = (Type, optionsArgPosition)=>{
    const AccessibleSliderClass = DelayedMutate('AccessibleSlider', ACCESSIBLE_SLIDER_OPTIONS, class AccessibleSlider extends AccessibleValueHandler(Type, optionsArgPosition) {
        set startDrag(value) {
            this._startDrag = value;
            // Also (unfortunately) forwarding to the startInput
            this.startInput = value;
        }
        get startDrag() {
            return this._startDrag;
        }
        set drag(value) {
            this._drag = value;
            // Also (unfortunately) forwarding to the onInput
            this.onInput = value;
        }
        get drag() {
            return this._drag;
        }
        set endDrag(value) {
            this._endDrag = value;
            // Also (unfortunately) forwarding to the endInput
            this.endInput = value;
        }
        get endDrag() {
            return this._endDrag;
        }
        /**
       * Make the accessible slider portions of this node eligible for garbage collection. Call when disposing
       * the type that this trait is mixed into.
       */ dispose() {
            this._disposeAccessibleSlider();
            super.dispose();
        }
        constructor(...args){
            const providedOptions = args[optionsArgPosition];
            assert && providedOptions && assert(Object.getPrototypeOf(providedOptions) === Object.prototype, 'Extra prototype on AccessibleSlider options object is a code smell (or probably a bug)');
            // AccessibleSlider uses 'drag' terminology rather than 'change' for consistency with Slider
            assert && assert(providedOptions.startInput === undefined, 'AccessibleSlider sets startInput through options.startDrag');
            assert && assert(providedOptions.endInput === undefined, 'AccessibleSlider sets endInput through options.endDrag');
            assert && assert(providedOptions.onInput === undefined, 'AccessibleSlider sets onInput through options.drag');
            super(...args), this._startDrag = _.noop, this._drag = _.noop, this._endDrag = _.noop;
            // members of the Node API that are used by this trait
            assertHasProperties(this, [
                'addInputListener',
                'removeInputListener'
            ]);
            // handle all accessible event input
            const accessibleInputListener = this.getAccessibleValueHandlerInputListener();
            this.addInputListener(accessibleInputListener);
            // called by disposeAccessibleSlider to prevent memory leaks
            this._disposeAccessibleSlider = ()=>{
                this.removeInputListener(accessibleInputListener);
            };
        }
    });
    /**
   * {Array.<string>} - String keys for all the allowed options that will be set by Node.mutate( options ), in
   * the order they will be evaluated.
   *
   * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
   *       cases that may apply.
   */ AccessibleSliderClass.prototype._mutatorKeys = ACCESSIBLE_SLIDER_OPTIONS.concat(AccessibleSliderClass.prototype._mutatorKeys);
    assert && assert(AccessibleSliderClass.prototype._mutatorKeys.length === _.uniq(AccessibleSliderClass.prototype._mutatorKeys).length, 'duplicate mutator keys in AccessibleSlider');
    return AccessibleSliderClass;
};
sun.register('AccessibleSlider', AccessibleSlider);
export default AccessibleSlider;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9hY2Nlc3NpYmlsaXR5L0FjY2Vzc2libGVTbGlkZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSB0cmFpdCBmb3Igc3VidHlwZXMgb2YgTm9kZSwgdXNlZCB0byBtYWtlIHRoZSBOb2RlIGJlaGF2ZSBsaWtlIGEgJ3NsaWRlcicgd2l0aCBhc3Npc3RpdmUgdGVjaG5vbG9neS4gVGhpcyBjb3VsZCBiZVxuICogdXNlZCBieSBhbnl0aGluZyB0aGF0IG1vdmVzIGFsb25nIGEgMS1EIGxpbmUuIEFuIGFjY2Vzc2libGUgc2xpZGVyIGJlaGF2ZXMgbGlrZTpcbiAqXG4gKiAtIEFycm93IGtleXMgaW5jcmVtZW50L2RlY3JlbWVudCB0aGUgc2xpZGVyIGJ5IGEgc3BlY2lmaWVkIHN0ZXAgc2l6ZS5cbiAqIC0gSG9sZGluZyBzaGlmdCB3aXRoIGFycm93IGtleXMgd2lsbCBpbmNyZW1lbnQvZGVjcmVtZW50IGJ5IGFsdGVybmF0aXZlIHN0ZXAgc2l6ZSwgdXN1YWxseSBzbWFsbGVyIHRoYW4gZGVmYXVsdC5cbiAqIC0gUGFnZSBVcCBhbmQgUGFnZSBEb3duIGluY3JlbWVudHMvZGVjcmVtZW50cyB2YWx1ZSBieSBhbiBhbHRlcm5hdGl2ZSBzdGVwIHNpemUsIHVzdWFsbHkgbGFyZ2VyIHRoYW4gZGVmYXVsdC5cbiAqIC0gSG9tZSBrZXkgc2V0cyB2YWx1ZSB0byBpdHMgbWluaW11bS5cbiAqIC0gRW5kIGtleSBzZXRzIHZhbHVlIHRvIGl0cyBtYXhpbXVtLlxuICpcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBhc3NlcnRIYXNQcm9wZXJ0aWVzIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9hc3NlcnRIYXNQcm9wZXJ0aWVzLmpzJztcbmltcG9ydCBDb25zdHJ1Y3RvciBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvQ29uc3RydWN0b3IuanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgeyBEZWxheWVkTXV0YXRlLCBOb2RlLCBTY2VuZXJ5RXZlbnQgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHN1biBmcm9tICcuLi9zdW4uanMnO1xuaW1wb3J0IEFjY2Vzc2libGVWYWx1ZUhhbmRsZXIsIHsgQWNjZXNzaWJsZVZhbHVlSGFuZGxlck9wdGlvbnMsIFRBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyIH0gZnJvbSAnLi9BY2Nlc3NpYmxlVmFsdWVIYW5kbGVyLmpzJztcblxuY29uc3QgQUNDRVNTSUJMRV9TTElERVJfT1BUSU9OUyA9IFtcbiAgJ3N0YXJ0RHJhZycsXG4gICdkcmFnJyxcbiAgJ2VuZERyYWcnXG5dO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuXG4gIC8vIGNhbGxlZCB3aGVuIGEgZHJhZyBzZXF1ZW5jZSBzdGFydHNcbiAgc3RhcnREcmFnPzogKCBldmVudDogU2NlbmVyeUV2ZW50ICkgPT4gdm9pZDtcblxuICAvLyBjYWxsZWQgYXQgdGhlIGVuZCBvZiBhIGRyYWcgZXZlbnQsIGFmdGVyIHRoZSB2YWx1ZVByb3BlcnR5IGNoYW5nZXNcbiAgZHJhZz86ICggZXZlbnQ6IFNjZW5lcnlFdmVudCApID0+IHZvaWQ7XG5cbiAgLy8gY2FsbGVkIHdoZW4gYSBkcmFnIHNlcXVlbmNlIGVuZHNcbiAgZW5kRHJhZz86ICggZXZlbnQ6IFNjZW5lcnlFdmVudCB8IG51bGwgKSA9PiB2b2lkO1xufTtcblxudHlwZSBBY2Nlc3NpYmxlU2xpZGVyT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgQWNjZXNzaWJsZVZhbHVlSGFuZGxlck9wdGlvbnM7XG5cbnR5cGUgVEFjY2Vzc2libGVTbGlkZXIgPSB7XG4gIHN0YXJ0RHJhZzogKCBldmVudDogU2NlbmVyeUV2ZW50ICkgPT4gdm9pZDtcbiAgZHJhZzogKCBldmVudDogU2NlbmVyeUV2ZW50ICkgPT4gdm9pZDtcbiAgZW5kRHJhZzogKCBldmVudDogU2NlbmVyeUV2ZW50IHwgbnVsbCApID0+IHZvaWQ7XG59ICYgVEFjY2Vzc2libGVWYWx1ZUhhbmRsZXI7XG5cbi8qKlxuICogQHBhcmFtIFR5cGVcbiAqIEBwYXJhbSBvcHRpb25zQXJnUG9zaXRpb24gLSB6ZXJvLWluZGV4ZWQgbnVtYmVyIHRoYXQgdGhlIG9wdGlvbnMgYXJndW1lbnQgaXMgcHJvdmlkZWQgYXQgaW4gdGhlIGNvbnN0cnVjdG9yIGZvciBUeXBlXG4gKi9cbmNvbnN0IEFjY2Vzc2libGVTbGlkZXIgPSA8U3VwZXJUeXBlIGV4dGVuZHMgQ29uc3RydWN0b3I8Tm9kZT4+KCBUeXBlOiBTdXBlclR5cGUsIG9wdGlvbnNBcmdQb3NpdGlvbjogbnVtYmVyICk6IFN1cGVyVHlwZSAmIENvbnN0cnVjdG9yPFRBY2Nlc3NpYmxlU2xpZGVyPiA9PiB7XG4gIGNvbnN0IEFjY2Vzc2libGVTbGlkZXJDbGFzcyA9IERlbGF5ZWRNdXRhdGUoICdBY2Nlc3NpYmxlU2xpZGVyJywgQUNDRVNTSUJMRV9TTElERVJfT1BUSU9OUyxcbiAgICBjbGFzcyBBY2Nlc3NpYmxlU2xpZGVyIGV4dGVuZHMgQWNjZXNzaWJsZVZhbHVlSGFuZGxlciggVHlwZSwgb3B0aW9uc0FyZ1Bvc2l0aW9uICkgaW1wbGVtZW50cyBUQWNjZXNzaWJsZVNsaWRlciB7XG5cbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgX2Rpc3Bvc2VBY2Nlc3NpYmxlU2xpZGVyOiAoKSA9PiB2b2lkO1xuXG4gICAgICBwcml2YXRlIF9zdGFydERyYWc6ICggZXZlbnQ6IFNjZW5lcnlFdmVudCApID0+IHZvaWQgPSBfLm5vb3A7XG4gICAgICBwcml2YXRlIF9kcmFnOiAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKSA9PiB2b2lkID0gXy5ub29wO1xuICAgICAgcHJpdmF0ZSBfZW5kRHJhZzogKCBldmVudDogU2NlbmVyeUV2ZW50IHwgbnVsbCApID0+IHZvaWQgPSBfLm5vb3A7XG5cbiAgICAgIHB1YmxpYyBjb25zdHJ1Y3RvciggLi4uYXJnczogSW50ZW50aW9uYWxBbnlbXSApIHtcblxuICAgICAgICBjb25zdCBwcm92aWRlZE9wdGlvbnMgPSBhcmdzWyBvcHRpb25zQXJnUG9zaXRpb24gXSBhcyBBY2Nlc3NpYmxlU2xpZGVyT3B0aW9ucztcblxuICAgICAgICBhc3NlcnQgJiYgcHJvdmlkZWRPcHRpb25zICYmIGFzc2VydCggT2JqZWN0LmdldFByb3RvdHlwZU9mKCBwcm92aWRlZE9wdGlvbnMgKSA9PT0gT2JqZWN0LnByb3RvdHlwZSxcbiAgICAgICAgICAnRXh0cmEgcHJvdG90eXBlIG9uIEFjY2Vzc2libGVTbGlkZXIgb3B0aW9ucyBvYmplY3QgaXMgYSBjb2RlIHNtZWxsIChvciBwcm9iYWJseSBhIGJ1ZyknICk7XG5cbiAgICAgICAgLy8gQWNjZXNzaWJsZVNsaWRlciB1c2VzICdkcmFnJyB0ZXJtaW5vbG9neSByYXRoZXIgdGhhbiAnY2hhbmdlJyBmb3IgY29uc2lzdGVuY3kgd2l0aCBTbGlkZXJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcHJvdmlkZWRPcHRpb25zLnN0YXJ0SW5wdXQgPT09IHVuZGVmaW5lZCwgJ0FjY2Vzc2libGVTbGlkZXIgc2V0cyBzdGFydElucHV0IHRocm91Z2ggb3B0aW9ucy5zdGFydERyYWcnICk7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHByb3ZpZGVkT3B0aW9ucy5lbmRJbnB1dCA9PT0gdW5kZWZpbmVkLCAnQWNjZXNzaWJsZVNsaWRlciBzZXRzIGVuZElucHV0IHRocm91Z2ggb3B0aW9ucy5lbmREcmFnJyApO1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwcm92aWRlZE9wdGlvbnMub25JbnB1dCA9PT0gdW5kZWZpbmVkLCAnQWNjZXNzaWJsZVNsaWRlciBzZXRzIG9uSW5wdXQgdGhyb3VnaCBvcHRpb25zLmRyYWcnICk7XG5cbiAgICAgICAgc3VwZXIoIC4uLmFyZ3MgKTtcblxuICAgICAgICAvLyBtZW1iZXJzIG9mIHRoZSBOb2RlIEFQSSB0aGF0IGFyZSB1c2VkIGJ5IHRoaXMgdHJhaXRcbiAgICAgICAgYXNzZXJ0SGFzUHJvcGVydGllcyggdGhpcywgWyAnYWRkSW5wdXRMaXN0ZW5lcicsICdyZW1vdmVJbnB1dExpc3RlbmVyJyBdICk7XG5cbiAgICAgICAgLy8gaGFuZGxlIGFsbCBhY2Nlc3NpYmxlIGV2ZW50IGlucHV0XG4gICAgICAgIGNvbnN0IGFjY2Vzc2libGVJbnB1dExpc3RlbmVyID0gdGhpcy5nZXRBY2Nlc3NpYmxlVmFsdWVIYW5kbGVySW5wdXRMaXN0ZW5lcigpO1xuICAgICAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIGFjY2Vzc2libGVJbnB1dExpc3RlbmVyICk7XG5cbiAgICAgICAgLy8gY2FsbGVkIGJ5IGRpc3Bvc2VBY2Nlc3NpYmxlU2xpZGVyIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzXG4gICAgICAgIHRoaXMuX2Rpc3Bvc2VBY2Nlc3NpYmxlU2xpZGVyID0gKCkgPT4ge1xuICAgICAgICAgIHRoaXMucmVtb3ZlSW5wdXRMaXN0ZW5lciggYWNjZXNzaWJsZUlucHV0TGlzdGVuZXIgKTtcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgcHVibGljIHNldCBzdGFydERyYWcoIHZhbHVlOiAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKSA9PiB2b2lkICkge1xuICAgICAgICB0aGlzLl9zdGFydERyYWcgPSB2YWx1ZTtcblxuICAgICAgICAvLyBBbHNvICh1bmZvcnR1bmF0ZWx5KSBmb3J3YXJkaW5nIHRvIHRoZSBzdGFydElucHV0XG4gICAgICAgIHRoaXMuc3RhcnRJbnB1dCA9IHZhbHVlO1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgZ2V0IHN0YXJ0RHJhZygpOiAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKSA9PiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0YXJ0RHJhZztcbiAgICAgIH1cblxuICAgICAgcHVibGljIHNldCBkcmFnKCB2YWx1ZTogKCBldmVudDogU2NlbmVyeUV2ZW50ICkgPT4gdm9pZCApIHtcbiAgICAgICAgdGhpcy5fZHJhZyA9IHZhbHVlO1xuXG4gICAgICAgIC8vIEFsc28gKHVuZm9ydHVuYXRlbHkpIGZvcndhcmRpbmcgdG8gdGhlIG9uSW5wdXRcbiAgICAgICAgdGhpcy5vbklucHV0ID0gdmFsdWU7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBnZXQgZHJhZygpOiAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKSA9PiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RyYWc7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBzZXQgZW5kRHJhZyggdmFsdWU6ICggZXZlbnQ6IFNjZW5lcnlFdmVudCB8IG51bGwgKSA9PiB2b2lkICkge1xuICAgICAgICB0aGlzLl9lbmREcmFnID0gdmFsdWU7XG5cbiAgICAgICAgLy8gQWxzbyAodW5mb3J0dW5hdGVseSkgZm9yd2FyZGluZyB0byB0aGUgZW5kSW5wdXRcbiAgICAgICAgdGhpcy5lbmRJbnB1dCA9IHZhbHVlO1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgZ2V0IGVuZERyYWcoKTogKCBldmVudDogU2NlbmVyeUV2ZW50IHwgbnVsbCApID0+IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5fZW5kRHJhZztcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBNYWtlIHRoZSBhY2Nlc3NpYmxlIHNsaWRlciBwb3J0aW9ucyBvZiB0aGlzIG5vZGUgZWxpZ2libGUgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi4gQ2FsbCB3aGVuIGRpc3Bvc2luZ1xuICAgICAgICogdGhlIHR5cGUgdGhhdCB0aGlzIHRyYWl0IGlzIG1peGVkIGludG8uXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9kaXNwb3NlQWNjZXNzaWJsZVNsaWRlcigpO1xuXG4gICAgICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgLyoqXG4gICAqIHtBcnJheS48c3RyaW5nPn0gLSBTdHJpbmcga2V5cyBmb3IgYWxsIHRoZSBhbGxvd2VkIG9wdGlvbnMgdGhhdCB3aWxsIGJlIHNldCBieSBOb2RlLm11dGF0ZSggb3B0aW9ucyApLCBpblxuICAgKiB0aGUgb3JkZXIgdGhleSB3aWxsIGJlIGV2YWx1YXRlZC5cbiAgICpcbiAgICogTk9URTogU2VlIE5vZGUncyBfbXV0YXRvcktleXMgZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBob3cgdGhpcyBvcGVyYXRlcywgYW5kIHBvdGVudGlhbCBzcGVjaWFsXG4gICAqICAgICAgIGNhc2VzIHRoYXQgbWF5IGFwcGx5LlxuICAgKi9cbiAgQWNjZXNzaWJsZVNsaWRlckNsYXNzLnByb3RvdHlwZS5fbXV0YXRvcktleXMgPSBBQ0NFU1NJQkxFX1NMSURFUl9PUFRJT05TLmNvbmNhdCggQWNjZXNzaWJsZVNsaWRlckNsYXNzLnByb3RvdHlwZS5fbXV0YXRvcktleXMgKTtcblxuICBhc3NlcnQgJiYgYXNzZXJ0KCBBY2Nlc3NpYmxlU2xpZGVyQ2xhc3MucHJvdG90eXBlLl9tdXRhdG9yS2V5cy5sZW5ndGggPT09IF8udW5pcSggQWNjZXNzaWJsZVNsaWRlckNsYXNzLnByb3RvdHlwZS5fbXV0YXRvcktleXMgKS5sZW5ndGgsICdkdXBsaWNhdGUgbXV0YXRvciBrZXlzIGluIEFjY2Vzc2libGVTbGlkZXInICk7XG5cbiAgcmV0dXJuIEFjY2Vzc2libGVTbGlkZXJDbGFzcztcbn07XG5cbnN1bi5yZWdpc3RlciggJ0FjY2Vzc2libGVTbGlkZXInLCBBY2Nlc3NpYmxlU2xpZGVyICk7XG5cbmV4cG9ydCBkZWZhdWx0IEFjY2Vzc2libGVTbGlkZXI7XG5leHBvcnQgdHlwZSB7IEFjY2Vzc2libGVTbGlkZXJPcHRpb25zIH07Il0sIm5hbWVzIjpbImFzc2VydEhhc1Byb3BlcnRpZXMiLCJEZWxheWVkTXV0YXRlIiwic3VuIiwiQWNjZXNzaWJsZVZhbHVlSGFuZGxlciIsIkFDQ0VTU0lCTEVfU0xJREVSX09QVElPTlMiLCJBY2Nlc3NpYmxlU2xpZGVyIiwiVHlwZSIsIm9wdGlvbnNBcmdQb3NpdGlvbiIsIkFjY2Vzc2libGVTbGlkZXJDbGFzcyIsInN0YXJ0RHJhZyIsInZhbHVlIiwiX3N0YXJ0RHJhZyIsInN0YXJ0SW5wdXQiLCJkcmFnIiwiX2RyYWciLCJvbklucHV0IiwiZW5kRHJhZyIsIl9lbmREcmFnIiwiZW5kSW5wdXQiLCJkaXNwb3NlIiwiX2Rpc3Bvc2VBY2Nlc3NpYmxlU2xpZGVyIiwiYXJncyIsInByb3ZpZGVkT3B0aW9ucyIsImFzc2VydCIsIk9iamVjdCIsImdldFByb3RvdHlwZU9mIiwicHJvdG90eXBlIiwidW5kZWZpbmVkIiwiXyIsIm5vb3AiLCJhY2Nlc3NpYmxlSW5wdXRMaXN0ZW5lciIsImdldEFjY2Vzc2libGVWYWx1ZUhhbmRsZXJJbnB1dExpc3RlbmVyIiwiYWRkSW5wdXRMaXN0ZW5lciIsInJlbW92ZUlucHV0TGlzdGVuZXIiLCJfbXV0YXRvcktleXMiLCJjb25jYXQiLCJsZW5ndGgiLCJ1bmlxIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Q0FXQyxHQUVELE9BQU9BLHlCQUF5QiwrQ0FBK0M7QUFHL0UsU0FBU0MsYUFBYSxRQUE0QixpQ0FBaUM7QUFDbkYsT0FBT0MsU0FBUyxZQUFZO0FBQzVCLE9BQU9DLDRCQUF3Riw4QkFBOEI7QUFFN0gsTUFBTUMsNEJBQTRCO0lBQ2hDO0lBQ0E7SUFDQTtDQUNEO0FBc0JEOzs7Q0FHQyxHQUNELE1BQU1DLG1CQUFtQixDQUF1Q0MsTUFBaUJDO0lBQy9FLE1BQU1DLHdCQUF3QlAsY0FBZSxvQkFBb0JHLDJCQUMvRCxNQUFNQyx5QkFBeUJGLHVCQUF3QkcsTUFBTUM7UUFtQzNELElBQVdFLFVBQVdDLEtBQXNDLEVBQUc7WUFDN0QsSUFBSSxDQUFDQyxVQUFVLEdBQUdEO1lBRWxCLG9EQUFvRDtZQUNwRCxJQUFJLENBQUNFLFVBQVUsR0FBR0Y7UUFDcEI7UUFFQSxJQUFXRCxZQUE2QztZQUN0RCxPQUFPLElBQUksQ0FBQ0UsVUFBVTtRQUN4QjtRQUVBLElBQVdFLEtBQU1ILEtBQXNDLEVBQUc7WUFDeEQsSUFBSSxDQUFDSSxLQUFLLEdBQUdKO1lBRWIsaURBQWlEO1lBQ2pELElBQUksQ0FBQ0ssT0FBTyxHQUFHTDtRQUNqQjtRQUVBLElBQVdHLE9BQXdDO1lBQ2pELE9BQU8sSUFBSSxDQUFDQyxLQUFLO1FBQ25CO1FBRUEsSUFBV0UsUUFBU04sS0FBNkMsRUFBRztZQUNsRSxJQUFJLENBQUNPLFFBQVEsR0FBR1A7WUFFaEIsa0RBQWtEO1lBQ2xELElBQUksQ0FBQ1EsUUFBUSxHQUFHUjtRQUNsQjtRQUVBLElBQVdNLFVBQWtEO1lBQzNELE9BQU8sSUFBSSxDQUFDQyxRQUFRO1FBQ3RCO1FBRUE7OztPQUdDLEdBQ0QsQUFBZ0JFLFVBQWdCO1lBQzlCLElBQUksQ0FBQ0Msd0JBQXdCO1lBRTdCLEtBQUssQ0FBQ0Q7UUFDUjtRQXBFQSxZQUFvQixHQUFHRSxJQUFzQixDQUFHO1lBRTlDLE1BQU1DLGtCQUFrQkQsSUFBSSxDQUFFZCxtQkFBb0I7WUFFbERnQixVQUFVRCxtQkFBbUJDLE9BQVFDLE9BQU9DLGNBQWMsQ0FBRUgscUJBQXNCRSxPQUFPRSxTQUFTLEVBQ2hHO1lBRUYsNEZBQTRGO1lBQzVGSCxVQUFVQSxPQUFRRCxnQkFBZ0JWLFVBQVUsS0FBS2UsV0FBVztZQUM1REosVUFBVUEsT0FBUUQsZ0JBQWdCSixRQUFRLEtBQUtTLFdBQVc7WUFDMURKLFVBQVVBLE9BQVFELGdCQUFnQlAsT0FBTyxLQUFLWSxXQUFXO1lBRXpELEtBQUssSUFBS04sWUFoQkpWLGFBQThDaUIsRUFBRUMsSUFBSSxPQUNwRGYsUUFBeUNjLEVBQUVDLElBQUksT0FDL0NaLFdBQW1EVyxFQUFFQyxJQUFJO1lBZ0IvRCxzREFBc0Q7WUFDdEQ3QixvQkFBcUIsSUFBSSxFQUFFO2dCQUFFO2dCQUFvQjthQUF1QjtZQUV4RSxvQ0FBb0M7WUFDcEMsTUFBTThCLDBCQUEwQixJQUFJLENBQUNDLHNDQUFzQztZQUMzRSxJQUFJLENBQUNDLGdCQUFnQixDQUFFRjtZQUV2Qiw0REFBNEQ7WUFDNUQsSUFBSSxDQUFDVix3QkFBd0IsR0FBRztnQkFDOUIsSUFBSSxDQUFDYSxtQkFBbUIsQ0FBRUg7WUFDNUI7UUFDRjtJQTRDRjtJQUVGOzs7Ozs7R0FNQyxHQUNEdEIsc0JBQXNCa0IsU0FBUyxDQUFDUSxZQUFZLEdBQUc5QiwwQkFBMEIrQixNQUFNLENBQUUzQixzQkFBc0JrQixTQUFTLENBQUNRLFlBQVk7SUFFN0hYLFVBQVVBLE9BQVFmLHNCQUFzQmtCLFNBQVMsQ0FBQ1EsWUFBWSxDQUFDRSxNQUFNLEtBQUtSLEVBQUVTLElBQUksQ0FBRTdCLHNCQUFzQmtCLFNBQVMsQ0FBQ1EsWUFBWSxFQUFHRSxNQUFNLEVBQUU7SUFFekksT0FBTzVCO0FBQ1Q7QUFFQU4sSUFBSW9DLFFBQVEsQ0FBRSxvQkFBb0JqQztBQUVsQyxlQUFlQSxpQkFBaUIifQ==