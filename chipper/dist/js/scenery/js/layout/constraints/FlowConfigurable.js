// Copyright 2022-2024, University of Colorado Boulder
/**
 * Mixin for storing options that can affect each cell. `null` for values usually means "inherit from the default".
 *
 * Handles a lot of conversion from internal Enumeration values (for performance) and external string representations.
 * This is done primarily for performance and that style of internal enumeration pattern. If string comparisons are
 * faster, that could be used instead.
 *
 * NOTE: Internal non-string representations are also orientation-agnostic - thus "left" and "top" map to the same
 * "start" internally, and thus the external value will appear to "switch" depending on the orientation.
 *
 * NOTE: This is mixed into both the constraint AND the cell, since we have two layers of options. The `null` meaning
 * "inherit from the default" is mainly used for the cells, so that if it's not specified in the cell, it will be
 * specified in the constraint (as non-null).
 *
 * NOTE: This is a mixin meant to be used internally only by Scenery (for the constraint and cell), and should not be
 * used by outside code.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import TinyEmitter from '../../../../axon/js/TinyEmitter.js';
import memoize from '../../../../phet-core/js/memoize.js';
import mutate from '../../../../phet-core/js/mutate.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import { LayoutAlign, MARGIN_LAYOUT_CONFIGURABLE_OPTION_KEYS, MarginLayoutConfigurable, scenery } from '../../imports.js';
const FLOW_CONFIGURABLE_OPTION_KEYS = [
    'orientation',
    'align',
    'cellAlign',
    'stretch',
    'grow'
].concat(MARGIN_LAYOUT_CONFIGURABLE_OPTION_KEYS);
// (scenery-internal)
const FlowConfigurable = memoize((Type)=>{
    return class FlowConfigurableMixin extends MarginLayoutConfigurable(Type) {
        /**
     * (scenery-internal)
     */ mutateConfigurable(options) {
            super.mutateConfigurable(options);
            mutate(this, FLOW_CONFIGURABLE_OPTION_KEYS, options);
        }
        /**
     * Resets values to the "base" state.
     *
     * This is the fallback state for a constraint where every value is defined and valid. If a cell does not have a
     * specific "overridden" value, or a constraint doesn't have an "overridden" value, then it will take the value
     * defined here.
     *
     * These should be the default values for constraints.
     *
     * (scenery-internal)
     */ setConfigToBaseDefault() {
            this._align = LayoutAlign.CENTER;
            this._cellAlign = LayoutAlign.START;
            this._stretch = false;
            this._grow = 0;
            super.setConfigToBaseDefault();
        }
        /**
     * Resets values to the "don't override anything, only inherit from the constraint" state
     *
     * These should be the default values for cells (e.g. "take all the behavior from the constraint, nothing is
     * overridden").
     *
     * (scenery-internal)
     */ setConfigToInherit(ignoreOptions) {
            if (!ignoreOptions || ignoreOptions.align === undefined) {
                this._align = null;
            }
            if (!ignoreOptions || ignoreOptions.cellAlign === undefined) {
                this._cellAlign = null;
            }
            if (!ignoreOptions || ignoreOptions.stretch === undefined) {
                this._stretch = null;
            }
            if (!ignoreOptions || ignoreOptions.grow === undefined) {
                this._grow = null;
            }
            super.setConfigToInherit(ignoreOptions);
        }
        /**
     * (scenery-internal)
     */ get orientation() {
            return this._orientation === Orientation.HORIZONTAL ? 'horizontal' : 'vertical';
        }
        /**
     * (scenery-internal)
     */ set orientation(value) {
            assert && assert(value === 'horizontal' || value === 'vertical');
            const enumOrientation = value === 'horizontal' ? Orientation.HORIZONTAL : Orientation.VERTICAL;
            if (this._orientation !== enumOrientation) {
                this._orientation = enumOrientation;
                this.orientationChangedEmitter.emit();
                this.changedEmitter.emit();
            }
        }
        /**
     * (scenery-internal)
     */ get align() {
            const result = LayoutAlign.internalToAlign(this._orientation.opposite, this._align);
            assert && assert(result === null || typeof result === 'string');
            return result;
        }
        /**
     * (scenery-internal)
     */ set align(value) {
            assert && assert(LayoutAlign.getAllowedAligns(this._orientation.opposite).includes(value), `align ${value} not supported, with the orientation ${this._orientation}, the valid values are ${LayoutAlign.getAllowedAligns(this._orientation.opposite)}`);
            // remapping align values to an independent set, so they aren't orientation-dependent
            const mappedValue = LayoutAlign.alignToInternal(this._orientation.opposite, value);
            assert && assert(mappedValue === null || mappedValue instanceof LayoutAlign);
            if (this._align !== mappedValue) {
                this._align = mappedValue;
                this.changedEmitter.emit();
            }
        }
        /**
     * (scenery-internal)
     */ get cellAlign() {
            const result = LayoutAlign.internalToAlign(this._orientation, this._cellAlign);
            assert && assert(result === null || typeof result === 'string');
            assert && assert(result !== 'origin');
            return result;
        }
        /**
     * (scenery-internal)
     */ set cellAlign(value) {
            assert && assert(LayoutAlign.getAllowedRestrictedAligns(this._orientation).includes(value), `cellAlign ${value} not supported, with the orientation ${this._orientation}, the valid values are ${LayoutAlign.getAllowedRestrictedAligns(this._orientation)}`);
            // remapping align values to an independent set, so they aren't orientation-dependent
            const mappedValue = LayoutAlign.alignToInternal(this._orientation, value);
            assert && assert(mappedValue === null || mappedValue instanceof LayoutAlign);
            if (this._cellAlign !== mappedValue) {
                this._cellAlign = mappedValue;
                this.changedEmitter.emit();
            }
        }
        /**
     * (scenery-internal)
     */ get stretch() {
            return this._stretch;
        }
        /**
     * (scenery-internal)
     */ set stretch(value) {
            if (this._stretch !== value) {
                this._stretch = value;
                this.changedEmitter.emit();
            }
        }
        /**
     * (scenery-internal)
     */ get grow() {
            return this._grow;
        }
        /**
     * (scenery-internal)
     */ set grow(value) {
            assert && assert(value === null || typeof value === 'number' && isFinite(value) && value >= 0);
            if (this._grow !== value) {
                this._grow = value;
                this.changedEmitter.emit();
            }
        }
        /**
     * (scenery-internal)
     */ constructor(...args){
            super(...args), // @mixin-protected - made public for use in the mixin only
            this._orientation = Orientation.HORIZONTAL, // (scenery-internal)
            this._align = null, this._cellAlign = null, this._stretch = null, this._grow = null, this.orientationChangedEmitter = new TinyEmitter();
        }
    };
});
scenery.register('FlowConfigurable', FlowConfigurable);
export default FlowConfigurable;
export { FLOW_CONFIGURABLE_OPTION_KEYS };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGF5b3V0L2NvbnN0cmFpbnRzL0Zsb3dDb25maWd1cmFibGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogTWl4aW4gZm9yIHN0b3Jpbmcgb3B0aW9ucyB0aGF0IGNhbiBhZmZlY3QgZWFjaCBjZWxsLiBgbnVsbGAgZm9yIHZhbHVlcyB1c3VhbGx5IG1lYW5zIFwiaW5oZXJpdCBmcm9tIHRoZSBkZWZhdWx0XCIuXG4gKlxuICogSGFuZGxlcyBhIGxvdCBvZiBjb252ZXJzaW9uIGZyb20gaW50ZXJuYWwgRW51bWVyYXRpb24gdmFsdWVzIChmb3IgcGVyZm9ybWFuY2UpIGFuZCBleHRlcm5hbCBzdHJpbmcgcmVwcmVzZW50YXRpb25zLlxuICogVGhpcyBpcyBkb25lIHByaW1hcmlseSBmb3IgcGVyZm9ybWFuY2UgYW5kIHRoYXQgc3R5bGUgb2YgaW50ZXJuYWwgZW51bWVyYXRpb24gcGF0dGVybi4gSWYgc3RyaW5nIGNvbXBhcmlzb25zIGFyZVxuICogZmFzdGVyLCB0aGF0IGNvdWxkIGJlIHVzZWQgaW5zdGVhZC5cbiAqXG4gKiBOT1RFOiBJbnRlcm5hbCBub24tc3RyaW5nIHJlcHJlc2VudGF0aW9ucyBhcmUgYWxzbyBvcmllbnRhdGlvbi1hZ25vc3RpYyAtIHRodXMgXCJsZWZ0XCIgYW5kIFwidG9wXCIgbWFwIHRvIHRoZSBzYW1lXG4gKiBcInN0YXJ0XCIgaW50ZXJuYWxseSwgYW5kIHRodXMgdGhlIGV4dGVybmFsIHZhbHVlIHdpbGwgYXBwZWFyIHRvIFwic3dpdGNoXCIgZGVwZW5kaW5nIG9uIHRoZSBvcmllbnRhdGlvbi5cbiAqXG4gKiBOT1RFOiBUaGlzIGlzIG1peGVkIGludG8gYm90aCB0aGUgY29uc3RyYWludCBBTkQgdGhlIGNlbGwsIHNpbmNlIHdlIGhhdmUgdHdvIGxheWVycyBvZiBvcHRpb25zLiBUaGUgYG51bGxgIG1lYW5pbmdcbiAqIFwiaW5oZXJpdCBmcm9tIHRoZSBkZWZhdWx0XCIgaXMgbWFpbmx5IHVzZWQgZm9yIHRoZSBjZWxscywgc28gdGhhdCBpZiBpdCdzIG5vdCBzcGVjaWZpZWQgaW4gdGhlIGNlbGwsIGl0IHdpbGwgYmVcbiAqIHNwZWNpZmllZCBpbiB0aGUgY29uc3RyYWludCAoYXMgbm9uLW51bGwpLlxuICpcbiAqIE5PVEU6IFRoaXMgaXMgYSBtaXhpbiBtZWFudCB0byBiZSB1c2VkIGludGVybmFsbHkgb25seSBieSBTY2VuZXJ5IChmb3IgdGhlIGNvbnN0cmFpbnQgYW5kIGNlbGwpLCBhbmQgc2hvdWxkIG5vdCBiZVxuICogdXNlZCBieSBvdXRzaWRlIGNvZGUuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBURW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RFbWl0dGVyLmpzJztcbmltcG9ydCBUaW55RW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RpbnlFbWl0dGVyLmpzJztcbmltcG9ydCBtZW1vaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZW1vaXplLmpzJztcbmltcG9ydCBtdXRhdGUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL211dGF0ZS5qcyc7XG5pbXBvcnQgT3JpZW50YXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL09yaWVudGF0aW9uLmpzJztcbmltcG9ydCBDb25zdHJ1Y3RvciBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvQ29uc3RydWN0b3IuanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgV2l0aG91dE51bGwgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1dpdGhvdXROdWxsLmpzJztcbmltcG9ydCB7IEhvcml6b250YWxMYXlvdXRBbGlnbiwgTGF5b3V0QWxpZ24sIExheW91dE9yaWVudGF0aW9uLCBNQVJHSU5fTEFZT1VUX0NPTkZJR1VSQUJMRV9PUFRJT05fS0VZUywgTWFyZ2luTGF5b3V0Q29uZmlndXJhYmxlLCBNYXJnaW5MYXlvdXRDb25maWd1cmFibGVPcHRpb25zLCBSZXN0cmljdGVkSG9yaXpvbnRhbExheW91dEFsaWduLCBSZXN0cmljdGVkVmVydGljYWxMYXlvdXRBbGlnbiwgc2NlbmVyeSwgVmVydGljYWxMYXlvdXRBbGlnbiB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xuaW1wb3J0IHsgVE1hcmdpbkxheW91dENvbmZpZ3VyYWJsZSB9IGZyb20gJy4vTWFyZ2luTGF5b3V0Q29uZmlndXJhYmxlLmpzJztcblxuY29uc3QgRkxPV19DT05GSUdVUkFCTEVfT1BUSU9OX0tFWVMgPSBbXG4gICdvcmllbnRhdGlvbicsXG4gICdhbGlnbicsXG4gICdjZWxsQWxpZ24nLFxuICAnc3RyZXRjaCcsXG4gICdncm93J1xuXS5jb25jYXQoIE1BUkdJTl9MQVlPVVRfQ09ORklHVVJBQkxFX09QVElPTl9LRVlTICk7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIC8vIFRoZSBtYWluIG9yaWVudGF0aW9uIG9mIHRoZSBsYXlvdXQgdGhhdCB0YWtlcyBwbGFjZS4gSXRlbXMgd2lsbCBiZSBzcGFjZWQgb3V0IGluIHRoaXMgb3JpZW50YXRpb24gKGUuZy4gaWYgaXQnc1xuICAvLyAndmVydGljYWwnLCB0aGUgeS12YWx1ZXMgb2YgdGhlIGNvbXBvbmVudHMgd2lsbCBiZSBhZGp1c3RlZCB0byBzcGFjZSB0aGVtIG91dCk7IHRoaXMgaXMga25vd24gYXMgdGhlIFwicHJpbWFyeVwiXG4gIC8vIGF4aXMuIEl0ZW1zIHdpbGwgYmUgYWxpZ25lZC9zdHJldGNoZWQgaW4gdGhlIG9wcG9zaXRlIG9yaWVudGF0aW9uIChlLmcuIGlmIGl0J3MgJ3ZlcnRpY2FsJywgdGhlIHgtdmFsdWVzIG9mXG4gIC8vIHRoZSBjb21wb25lbnRzIHdpbGwgYmUgYWRqdXN0ZWQgYnkgYWxpZ24gYW5kIHN0cmV0Y2gpOyB0aGlzIGlzIGtub3duIGFzIHRoZSBcInNlY29uZGFyeVwiIG9yIFwib3Bwb3NpdGVcIiBheGlzLlxuICAvLyBTZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0Zsb3dCb3gtb3JpZW50YXRpb25cbiAgb3JpZW50YXRpb24/OiBMYXlvdXRPcmllbnRhdGlvbiB8IG51bGw7XG5cbiAgLy8gQWRqdXN0cyB0aGUgcG9zaXRpb24gb2YgZWxlbWVudHMgaW4gdGhlIFwib3Bwb3NpdGVcIiBheGlzLCBlaXRoZXIgdG8gYSBzcGVjaWZpYyBzaWRlLCB0aGUgY2VudGVyLCBvciBzbyB0aGF0IGFsbFxuICAvLyB0aGUgb3JpZ2lucyBvZiBpdGVtcyBhcmUgYWxpZ25lZCAoc2ltaWxhciB0byB4PTAgZm9yIGEgJ3ZlcnRpY2FsJyBvcmllbnRhdGlvbikuXG4gIC8vIFNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjRmxvd0JveC1hbGlnblxuICBhbGlnbj86IEhvcml6b250YWxMYXlvdXRBbGlnbiB8IFZlcnRpY2FsTGF5b3V0QWxpZ24gfCBudWxsO1xuXG4gIC8vIEluIHRoZSBcInByaW1hcnlcIiBheGlzLCBJRiB0aGUgY2VsbCBpcyBtYXJrZWQgd2l0aCBhIGdyb3cgdmFsdWUsIEFORCB0aGUgbm9kZSBjYW5ub3QgZXhwYW5kIHRvIGZpbGwgdGhlIHNwYWNlLFxuICAvLyBjZWxsQWxpZ24gd2lsbCBjb250cm9sIHRoZSBwb3NpdGlvbmluZyBvZiB0aGUgbm9kZSB3aXRoaW4gdGhlIGNlbGwuXG4gIC8vIFNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjRmxvd0JveC1jZWxsQWxpZ25cbiAgY2VsbEFsaWduPzogUmVzdHJpY3RlZFZlcnRpY2FsTGF5b3V0QWxpZ24gfCBSZXN0cmljdGVkSG9yaXpvbnRhbExheW91dEFsaWduIHwgbnVsbDtcblxuICAvLyBDb250cm9scyB3aGV0aGVyIGVsZW1lbnRzIHdpbGwgYXR0ZW1wdCB0byBleHBhbmQgYWxvbmcgdGhlIFwib3Bwb3NpdGVcIiBheGlzIHRvIHRha2UgdXAgdGhlIGZ1bGwgc2l6ZSBvZiB0aGVcbiAgLy8gbGFyZ2VzdCBsYXlvdXQgZWxlbWVudC5cbiAgLy8gU2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNGbG93Qm94LXN0cmV0Y2hcbiAgc3RyZXRjaD86IGJvb2xlYW47XG5cbiAgLy8gQ29udHJvbHMgd2hldGhlciBlbGVtZW50cyB3aWxsIGF0dGVtcHQgdG8gZXhwYW5kIGFsb25nIHRoZSBcInByaW1hcnlcIiBheGlzLiBFbGVtZW50cyB3aWxsIGV4cGFuZCBwcm9wb3J0aW9uYWxseVxuICAvLyBiYXNlZCBvbiB0aGUgdG90YWwgZ3JvdyBzdW0gKGFuZCB3aWxsIG5vdCBleHBhbmQgYXQgYWxsIGlmIHRoZSBncm93IGlzIHplcm8pLlxuICAvLyBTZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0Zsb3dCb3gtZ3Jvd1xuICBncm93PzogbnVtYmVyIHwgbnVsbDtcbn07XG5cbmV4cG9ydCB0eXBlIEZsb3dDb25maWd1cmFibGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBNYXJnaW5MYXlvdXRDb25maWd1cmFibGVPcHRpb25zO1xuXG4vLyBXZSByZW1vdmUgdGhlIG51bGwgdmFsdWVzIGZvciB0aGUgdmFsdWVzIHRoYXQgd29uJ3QgYWN0dWFsbHkgdGFrZSBudWxsXG5leHBvcnQgdHlwZSBFeHRlcm5hbEZsb3dDb25maWd1cmFibGVPcHRpb25zID0gV2l0aG91dE51bGw8Rmxvd0NvbmZpZ3VyYWJsZU9wdGlvbnMsIEV4Y2x1ZGU8a2V5b2YgRmxvd0NvbmZpZ3VyYWJsZU9wdGlvbnMsICdtaW5Db250ZW50V2lkdGgnIHwgJ21pbkNvbnRlbnRIZWlnaHQnIHwgJ21heENvbnRlbnRXaWR0aCcgfCAnbWF4Q29udGVudEhlaWdodCc+PjtcblxudHlwZSBURmxvd0NvbmZpZ3VyYWJsZSA9IHtcblxuICBfYWxpZ246IExheW91dEFsaWduIHwgbnVsbDtcbiAgX2NlbGxBbGlnbjogTGF5b3V0QWxpZ24gfCBudWxsO1xuICBfc3RyZXRjaDogYm9vbGVhbiB8IG51bGw7XG4gIF9ncm93OiBudW1iZXIgfCBudWxsO1xuICByZWFkb25seSBvcmllbnRhdGlvbkNoYW5nZWRFbWl0dGVyOiBURW1pdHRlcjtcbiAgb3JpZW50YXRpb246IExheW91dE9yaWVudGF0aW9uO1xuICBhbGlnbjogSG9yaXpvbnRhbExheW91dEFsaWduIHwgVmVydGljYWxMYXlvdXRBbGlnbiB8IG51bGw7XG4gIHN0cmV0Y2g6IGJvb2xlYW4gfCBudWxsO1xuICBncm93OiBudW1iZXIgfCBudWxsO1xuXG4gIC8vIEBtaXhpbi1wcm90ZWN0ZWQgLSBtYWRlIHB1YmxpYyBmb3IgdXNlIGluIHRoZSBtaXhpbiBvbmx5XG4gIF9vcmllbnRhdGlvbjogT3JpZW50YXRpb247XG5cbn0gJiBUTWFyZ2luTGF5b3V0Q29uZmlndXJhYmxlO1xuXG4vLyAoc2NlbmVyeS1pbnRlcm5hbClcbmNvbnN0IEZsb3dDb25maWd1cmFibGUgPSBtZW1vaXplKCA8U3VwZXJUeXBlIGV4dGVuZHMgQ29uc3RydWN0b3I+KCBUeXBlOiBTdXBlclR5cGUgKTogU3VwZXJUeXBlICYgQ29uc3RydWN0b3I8VEZsb3dDb25maWd1cmFibGU+ID0+IHtcbiAgcmV0dXJuIGNsYXNzIEZsb3dDb25maWd1cmFibGVNaXhpbiBleHRlbmRzIE1hcmdpbkxheW91dENvbmZpZ3VyYWJsZSggVHlwZSApIGltcGxlbWVudHMgVEZsb3dDb25maWd1cmFibGUge1xuXG4gICAgLy8gQG1peGluLXByb3RlY3RlZCAtIG1hZGUgcHVibGljIGZvciB1c2UgaW4gdGhlIG1peGluIG9ubHlcbiAgICBwdWJsaWMgX29yaWVudGF0aW9uOiBPcmllbnRhdGlvbiA9IE9yaWVudGF0aW9uLkhPUklaT05UQUw7XG5cbiAgICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICBwdWJsaWMgX2FsaWduOiBMYXlvdXRBbGlnbiB8IG51bGwgPSBudWxsO1xuICAgIHB1YmxpYyBfY2VsbEFsaWduOiBMYXlvdXRBbGlnbiB8IG51bGwgPSBudWxsO1xuICAgIHB1YmxpYyBfc3RyZXRjaDogYm9vbGVhbiB8IG51bGwgPSBudWxsO1xuICAgIHB1YmxpYyBfZ3JvdzogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgICBwdWJsaWMgcmVhZG9ubHkgb3JpZW50YXRpb25DaGFuZ2VkRW1pdHRlcjogVEVtaXR0ZXIgPSBuZXcgVGlueUVtaXR0ZXIoKTtcblxuICAgIC8qKlxuICAgICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgICAqL1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvciggLi4uYXJnczogSW50ZW50aW9uYWxBbnlbXSApIHtcbiAgICAgIHN1cGVyKCAuLi5hcmdzICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIG11dGF0ZUNvbmZpZ3VyYWJsZSggb3B0aW9ucz86IEZsb3dDb25maWd1cmFibGVPcHRpb25zICk6IHZvaWQge1xuICAgICAgc3VwZXIubXV0YXRlQ29uZmlndXJhYmxlKCBvcHRpb25zICk7XG5cbiAgICAgIG11dGF0ZSggdGhpcywgRkxPV19DT05GSUdVUkFCTEVfT1BUSU9OX0tFWVMsIG9wdGlvbnMgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXNldHMgdmFsdWVzIHRvIHRoZSBcImJhc2VcIiBzdGF0ZS5cbiAgICAgKlxuICAgICAqIFRoaXMgaXMgdGhlIGZhbGxiYWNrIHN0YXRlIGZvciBhIGNvbnN0cmFpbnQgd2hlcmUgZXZlcnkgdmFsdWUgaXMgZGVmaW5lZCBhbmQgdmFsaWQuIElmIGEgY2VsbCBkb2VzIG5vdCBoYXZlIGFcbiAgICAgKiBzcGVjaWZpYyBcIm92ZXJyaWRkZW5cIiB2YWx1ZSwgb3IgYSBjb25zdHJhaW50IGRvZXNuJ3QgaGF2ZSBhbiBcIm92ZXJyaWRkZW5cIiB2YWx1ZSwgdGhlbiBpdCB3aWxsIHRha2UgdGhlIHZhbHVlXG4gICAgICogZGVmaW5lZCBoZXJlLlxuICAgICAqXG4gICAgICogVGhlc2Ugc2hvdWxkIGJlIHRoZSBkZWZhdWx0IHZhbHVlcyBmb3IgY29uc3RyYWludHMuXG4gICAgICpcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgc2V0Q29uZmlnVG9CYXNlRGVmYXVsdCgpOiB2b2lkIHtcbiAgICAgIHRoaXMuX2FsaWduID0gTGF5b3V0QWxpZ24uQ0VOVEVSO1xuICAgICAgdGhpcy5fY2VsbEFsaWduID0gTGF5b3V0QWxpZ24uU1RBUlQ7XG4gICAgICB0aGlzLl9zdHJldGNoID0gZmFsc2U7XG4gICAgICB0aGlzLl9ncm93ID0gMDtcblxuICAgICAgc3VwZXIuc2V0Q29uZmlnVG9CYXNlRGVmYXVsdCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlc2V0cyB2YWx1ZXMgdG8gdGhlIFwiZG9uJ3Qgb3ZlcnJpZGUgYW55dGhpbmcsIG9ubHkgaW5oZXJpdCBmcm9tIHRoZSBjb25zdHJhaW50XCIgc3RhdGVcbiAgICAgKlxuICAgICAqIFRoZXNlIHNob3VsZCBiZSB0aGUgZGVmYXVsdCB2YWx1ZXMgZm9yIGNlbGxzIChlLmcuIFwidGFrZSBhbGwgdGhlIGJlaGF2aW9yIGZyb20gdGhlIGNvbnN0cmFpbnQsIG5vdGhpbmcgaXNcbiAgICAgKiBvdmVycmlkZGVuXCIpLlxuICAgICAqXG4gICAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIHNldENvbmZpZ1RvSW5oZXJpdCggaWdub3JlT3B0aW9ucz86IEZsb3dDb25maWd1cmFibGVPcHRpb25zICk6IHZvaWQge1xuICAgICAgaWYgKCAhaWdub3JlT3B0aW9ucyB8fCBpZ25vcmVPcHRpb25zLmFsaWduID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIHRoaXMuX2FsaWduID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICggIWlnbm9yZU9wdGlvbnMgfHwgaWdub3JlT3B0aW9ucy5jZWxsQWxpZ24gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgdGhpcy5fY2VsbEFsaWduID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICggIWlnbm9yZU9wdGlvbnMgfHwgaWdub3JlT3B0aW9ucy5zdHJldGNoID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIHRoaXMuX3N0cmV0Y2ggPSBudWxsO1xuICAgICAgfVxuICAgICAgaWYgKCAhaWdub3JlT3B0aW9ucyB8fCBpZ25vcmVPcHRpb25zLmdyb3cgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgdGhpcy5fZ3JvdyA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHN1cGVyLnNldENvbmZpZ1RvSW5oZXJpdCggaWdub3JlT3B0aW9ucyApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgb3JpZW50YXRpb24oKTogTGF5b3V0T3JpZW50YXRpb24ge1xuICAgICAgcmV0dXJuIHRoaXMuX29yaWVudGF0aW9uID09PSBPcmllbnRhdGlvbi5IT1JJWk9OVEFMID8gJ2hvcml6b250YWwnIDogJ3ZlcnRpY2FsJztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IG9yaWVudGF0aW9uKCB2YWx1ZTogTGF5b3V0T3JpZW50YXRpb24gKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2YWx1ZSA9PT0gJ2hvcml6b250YWwnIHx8IHZhbHVlID09PSAndmVydGljYWwnICk7XG5cbiAgICAgIGNvbnN0IGVudW1PcmllbnRhdGlvbiA9IHZhbHVlID09PSAnaG9yaXpvbnRhbCcgPyBPcmllbnRhdGlvbi5IT1JJWk9OVEFMIDogT3JpZW50YXRpb24uVkVSVElDQUw7XG5cbiAgICAgIGlmICggdGhpcy5fb3JpZW50YXRpb24gIT09IGVudW1PcmllbnRhdGlvbiApIHtcbiAgICAgICAgdGhpcy5fb3JpZW50YXRpb24gPSBlbnVtT3JpZW50YXRpb247XG5cbiAgICAgICAgdGhpcy5vcmllbnRhdGlvbkNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcbiAgICAgICAgdGhpcy5jaGFuZ2VkRW1pdHRlci5lbWl0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAgICovXG4gICAgcHVibGljIGdldCBhbGlnbigpOiBIb3Jpem9udGFsTGF5b3V0QWxpZ24gfCBWZXJ0aWNhbExheW91dEFsaWduIHwgbnVsbCB7XG4gICAgICBjb25zdCByZXN1bHQgPSBMYXlvdXRBbGlnbi5pbnRlcm5hbFRvQWxpZ24oIHRoaXMuX29yaWVudGF0aW9uLm9wcG9zaXRlLCB0aGlzLl9hbGlnbiApO1xuXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCByZXN1bHQgPT09IG51bGwgfHwgdHlwZW9mIHJlc3VsdCA9PT0gJ3N0cmluZycgKTtcblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IGFsaWduKCB2YWx1ZTogSG9yaXpvbnRhbExheW91dEFsaWduIHwgVmVydGljYWxMYXlvdXRBbGlnbiB8IG51bGwgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBMYXlvdXRBbGlnbi5nZXRBbGxvd2VkQWxpZ25zKCB0aGlzLl9vcmllbnRhdGlvbi5vcHBvc2l0ZSApLmluY2x1ZGVzKCB2YWx1ZSApLFxuICAgICAgICBgYWxpZ24gJHt2YWx1ZX0gbm90IHN1cHBvcnRlZCwgd2l0aCB0aGUgb3JpZW50YXRpb24gJHt0aGlzLl9vcmllbnRhdGlvbn0sIHRoZSB2YWxpZCB2YWx1ZXMgYXJlICR7TGF5b3V0QWxpZ24uZ2V0QWxsb3dlZEFsaWducyggdGhpcy5fb3JpZW50YXRpb24ub3Bwb3NpdGUgKX1gICk7XG5cbiAgICAgIC8vIHJlbWFwcGluZyBhbGlnbiB2YWx1ZXMgdG8gYW4gaW5kZXBlbmRlbnQgc2V0LCBzbyB0aGV5IGFyZW4ndCBvcmllbnRhdGlvbi1kZXBlbmRlbnRcbiAgICAgIGNvbnN0IG1hcHBlZFZhbHVlID0gTGF5b3V0QWxpZ24uYWxpZ25Ub0ludGVybmFsKCB0aGlzLl9vcmllbnRhdGlvbi5vcHBvc2l0ZSwgdmFsdWUgKTtcblxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbWFwcGVkVmFsdWUgPT09IG51bGwgfHwgbWFwcGVkVmFsdWUgaW5zdGFuY2VvZiBMYXlvdXRBbGlnbiApO1xuXG4gICAgICBpZiAoIHRoaXMuX2FsaWduICE9PSBtYXBwZWRWYWx1ZSApIHtcbiAgICAgICAgdGhpcy5fYWxpZ24gPSBtYXBwZWRWYWx1ZTtcblxuICAgICAgICB0aGlzLmNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGNlbGxBbGlnbigpOiBSZXN0cmljdGVkSG9yaXpvbnRhbExheW91dEFsaWduIHwgUmVzdHJpY3RlZFZlcnRpY2FsTGF5b3V0QWxpZ24gfCBudWxsIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IExheW91dEFsaWduLmludGVybmFsVG9BbGlnbiggdGhpcy5fb3JpZW50YXRpb24sIHRoaXMuX2NlbGxBbGlnbiApO1xuXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCByZXN1bHQgPT09IG51bGwgfHwgdHlwZW9mIHJlc3VsdCA9PT0gJ3N0cmluZycgKTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHJlc3VsdCAhPT0gJ29yaWdpbicgKTtcblxuICAgICAgcmV0dXJuIHJlc3VsdCBhcyBFeGNsdWRlPHR5cGVvZiByZXN1bHQsICdvcmlnaW4nPjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IGNlbGxBbGlnbiggdmFsdWU6IFJlc3RyaWN0ZWRIb3Jpem9udGFsTGF5b3V0QWxpZ24gfCBSZXN0cmljdGVkVmVydGljYWxMYXlvdXRBbGlnbiB8IG51bGwgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBMYXlvdXRBbGlnbi5nZXRBbGxvd2VkUmVzdHJpY3RlZEFsaWducyggdGhpcy5fb3JpZW50YXRpb24gKS5pbmNsdWRlcyggdmFsdWUgKSxcbiAgICAgICAgYGNlbGxBbGlnbiAke3ZhbHVlfSBub3Qgc3VwcG9ydGVkLCB3aXRoIHRoZSBvcmllbnRhdGlvbiAke3RoaXMuX29yaWVudGF0aW9ufSwgdGhlIHZhbGlkIHZhbHVlcyBhcmUgJHtMYXlvdXRBbGlnbi5nZXRBbGxvd2VkUmVzdHJpY3RlZEFsaWducyggdGhpcy5fb3JpZW50YXRpb24gKX1gICk7XG5cbiAgICAgIC8vIHJlbWFwcGluZyBhbGlnbiB2YWx1ZXMgdG8gYW4gaW5kZXBlbmRlbnQgc2V0LCBzbyB0aGV5IGFyZW4ndCBvcmllbnRhdGlvbi1kZXBlbmRlbnRcbiAgICAgIGNvbnN0IG1hcHBlZFZhbHVlID0gTGF5b3V0QWxpZ24uYWxpZ25Ub0ludGVybmFsKCB0aGlzLl9vcmllbnRhdGlvbiwgdmFsdWUgKTtcblxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbWFwcGVkVmFsdWUgPT09IG51bGwgfHwgbWFwcGVkVmFsdWUgaW5zdGFuY2VvZiBMYXlvdXRBbGlnbiApO1xuXG4gICAgICBpZiAoIHRoaXMuX2NlbGxBbGlnbiAhPT0gbWFwcGVkVmFsdWUgKSB7XG4gICAgICAgIHRoaXMuX2NlbGxBbGlnbiA9IG1hcHBlZFZhbHVlO1xuXG4gICAgICAgIHRoaXMuY2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgc3RyZXRjaCgpOiBib29sZWFuIHwgbnVsbCB7XG4gICAgICByZXR1cm4gdGhpcy5fc3RyZXRjaDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IHN0cmV0Y2goIHZhbHVlOiBib29sZWFuIHwgbnVsbCApIHtcbiAgICAgIGlmICggdGhpcy5fc3RyZXRjaCAhPT0gdmFsdWUgKSB7XG4gICAgICAgIHRoaXMuX3N0cmV0Y2ggPSB2YWx1ZTtcblxuICAgICAgICB0aGlzLmNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGdyb3coKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgICByZXR1cm4gdGhpcy5fZ3JvdztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IGdyb3coIHZhbHVlOiBudW1iZXIgfCBudWxsICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdmFsdWUgPT09IG51bGwgfHwgKCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB2YWx1ZSApICYmIHZhbHVlID49IDAgKSApO1xuXG4gICAgICBpZiAoIHRoaXMuX2dyb3cgIT09IHZhbHVlICkge1xuICAgICAgICB0aGlzLl9ncm93ID0gdmFsdWU7XG5cbiAgICAgICAgdGhpcy5jaGFuZ2VkRW1pdHRlci5lbWl0KCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufSApO1xuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnRmxvd0NvbmZpZ3VyYWJsZScsIEZsb3dDb25maWd1cmFibGUgKTtcbmV4cG9ydCBkZWZhdWx0IEZsb3dDb25maWd1cmFibGU7XG5leHBvcnQgeyBGTE9XX0NPTkZJR1VSQUJMRV9PUFRJT05fS0VZUyB9OyJdLCJuYW1lcyI6WyJUaW55RW1pdHRlciIsIm1lbW9pemUiLCJtdXRhdGUiLCJPcmllbnRhdGlvbiIsIkxheW91dEFsaWduIiwiTUFSR0lOX0xBWU9VVF9DT05GSUdVUkFCTEVfT1BUSU9OX0tFWVMiLCJNYXJnaW5MYXlvdXRDb25maWd1cmFibGUiLCJzY2VuZXJ5IiwiRkxPV19DT05GSUdVUkFCTEVfT1BUSU9OX0tFWVMiLCJjb25jYXQiLCJGbG93Q29uZmlndXJhYmxlIiwiVHlwZSIsIkZsb3dDb25maWd1cmFibGVNaXhpbiIsIm11dGF0ZUNvbmZpZ3VyYWJsZSIsIm9wdGlvbnMiLCJzZXRDb25maWdUb0Jhc2VEZWZhdWx0IiwiX2FsaWduIiwiQ0VOVEVSIiwiX2NlbGxBbGlnbiIsIlNUQVJUIiwiX3N0cmV0Y2giLCJfZ3JvdyIsInNldENvbmZpZ1RvSW5oZXJpdCIsImlnbm9yZU9wdGlvbnMiLCJhbGlnbiIsInVuZGVmaW5lZCIsImNlbGxBbGlnbiIsInN0cmV0Y2giLCJncm93Iiwib3JpZW50YXRpb24iLCJfb3JpZW50YXRpb24iLCJIT1JJWk9OVEFMIiwidmFsdWUiLCJhc3NlcnQiLCJlbnVtT3JpZW50YXRpb24iLCJWRVJUSUNBTCIsIm9yaWVudGF0aW9uQ2hhbmdlZEVtaXR0ZXIiLCJlbWl0IiwiY2hhbmdlZEVtaXR0ZXIiLCJyZXN1bHQiLCJpbnRlcm5hbFRvQWxpZ24iLCJvcHBvc2l0ZSIsImdldEFsbG93ZWRBbGlnbnMiLCJpbmNsdWRlcyIsIm1hcHBlZFZhbHVlIiwiYWxpZ25Ub0ludGVybmFsIiwiZ2V0QWxsb3dlZFJlc3RyaWN0ZWRBbGlnbnMiLCJpc0Zpbml0ZSIsImFyZ3MiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FrQkMsR0FHRCxPQUFPQSxpQkFBaUIscUNBQXFDO0FBQzdELE9BQU9DLGFB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