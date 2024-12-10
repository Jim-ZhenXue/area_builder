// Copyright 2021-2024, University of Colorado Boulder
/**
 * Mixin for storing options that can affect each cell.
 *
 * Handles a lot of conversion from internal Enumeration values (for performance) and external string representations.
 * This is done primarily for performance and that style of internal enumeration pattern. If string comparisons are
 * faster, that could be used instead.
 *
 * NOTE: This is mixed into both the constraint AND the cell, since we have two layers of options. The `null` meaning
 * "inherit from the default" is mainly used for the cells, so that if it's not specified in the cell, it will be
 * specified in the constraint (as non-null).
 *
 * NOTE: This is a mixin meant to be used internally only by Scenery (for the constraint and cell), and should not be
 * used by outside code.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import assertMutuallyExclusiveOptions from '../../../../phet-core/js/assertMutuallyExclusiveOptions.js';
import memoize from '../../../../phet-core/js/memoize.js';
import mutate from '../../../../phet-core/js/mutate.js';
import { HorizontalLayoutAlignValues, LayoutAlign, MARGIN_LAYOUT_CONFIGURABLE_OPTION_KEYS, MarginLayoutConfigurable, scenery, VerticalLayoutAlignValues } from '../../imports.js';
const GRID_CONFIGURABLE_OPTION_KEYS = [
    'xAlign',
    'yAlign',
    'stretch',
    'xStretch',
    'yStretch',
    'grow',
    'xGrow',
    'yGrow'
].concat(MARGIN_LAYOUT_CONFIGURABLE_OPTION_KEYS);
// (scenery-internal)
const GridConfigurable = memoize((type)=>{
    return class GridConfigurableMixin extends MarginLayoutConfigurable(type) {
        /**
     * (scenery-internal)
     */ mutateConfigurable(options) {
            super.mutateConfigurable(options);
            assertMutuallyExclusiveOptions(options, [
                'stretch'
            ], [
                'xStretch',
                'yStretch'
            ]);
            assertMutuallyExclusiveOptions(options, [
                'grow'
            ], [
                'xGrow',
                'yGrow'
            ]);
            mutate(this, GRID_CONFIGURABLE_OPTION_KEYS, options);
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
            this._xAlign = LayoutAlign.CENTER;
            this._yAlign = LayoutAlign.CENTER;
            this._xStretch = false;
            this._yStretch = false;
            this._xGrow = 0;
            this._yGrow = 0;
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
            if (!ignoreOptions || ignoreOptions.xAlign === undefined) {
                this._xAlign = null;
            }
            if (!ignoreOptions || ignoreOptions.yAlign === undefined) {
                this._yAlign = null;
            }
            if (!ignoreOptions || ignoreOptions.stretch === undefined && ignoreOptions.xStretch === undefined) {
                this._xStretch = null;
            }
            if (!ignoreOptions || ignoreOptions.stretch === undefined && ignoreOptions.yStretch === undefined) {
                this._yStretch = null;
            }
            if (!ignoreOptions || ignoreOptions.grow === undefined && ignoreOptions.xGrow === undefined) {
                this._xGrow = null;
            }
            if (!ignoreOptions || ignoreOptions.grow === undefined && ignoreOptions.yGrow === undefined) {
                this._yGrow = null;
            }
            super.setConfigToInherit(ignoreOptions);
        }
        /**
     * (scenery-internal)
     */ get xAlign() {
            const result = this._xAlign === null ? null : this._xAlign.horizontal;
            assert && assert(result === null || typeof result === 'string');
            return result;
        }
        /**
     * (scenery-internal)
     */ set xAlign(value) {
            assert && assert(value === null || HorizontalLayoutAlignValues.includes(value), `align ${value} not supported, the valid values are ${HorizontalLayoutAlignValues} or null`);
            // remapping align values to an independent set, so they aren't orientation-dependent
            const mappedValue = LayoutAlign.horizontalAlignToInternal(value);
            assert && assert(mappedValue === null || mappedValue instanceof LayoutAlign);
            if (this._xAlign !== mappedValue) {
                this._xAlign = mappedValue;
                this.changedEmitter.emit();
            }
        }
        /**
     * (scenery-internal)
     */ get yAlign() {
            const result = this._yAlign === null ? null : this._yAlign.vertical;
            assert && assert(result === null || typeof result === 'string');
            return result;
        }
        /**
     * (scenery-internal)
     */ set yAlign(value) {
            assert && assert(value === null || VerticalLayoutAlignValues.includes(value), `align ${value} not supported, the valid values are ${VerticalLayoutAlignValues} or null`);
            // remapping align values to an independent set, so they aren't orientation-dependent
            const mappedValue = LayoutAlign.verticalAlignToInternal(value);
            assert && assert(mappedValue === null || mappedValue instanceof LayoutAlign);
            if (this._yAlign !== mappedValue) {
                this._yAlign = mappedValue;
                this.changedEmitter.emit();
            }
        }
        /**
     * (scenery-internal)
     */ get grow() {
            assert && assert(this._xGrow === this._yGrow);
            return this._xGrow;
        }
        /**
     * (scenery-internal)
     */ set grow(value) {
            assert && assert(value === null || typeof value === 'number' && isFinite(value) && value >= 0);
            if (this._xGrow !== value || this._yGrow !== value) {
                this._xGrow = value;
                this._yGrow = value;
                this.changedEmitter.emit();
            }
        }
        /**
     * (scenery-internal)
     */ get xGrow() {
            return this._xGrow;
        }
        /**
     * (scenery-internal)
     */ set xGrow(value) {
            assert && assert(value === null || typeof value === 'number' && isFinite(value) && value >= 0);
            if (this._xGrow !== value) {
                this._xGrow = value;
                this.changedEmitter.emit();
            }
        }
        /**
     * (scenery-internal)
     */ get yGrow() {
            return this._yGrow;
        }
        /**
     * (scenery-internal)
     */ set yGrow(value) {
            assert && assert(value === null || typeof value === 'number' && isFinite(value) && value >= 0);
            if (this._yGrow !== value) {
                this._yGrow = value;
                this.changedEmitter.emit();
            }
        }
        /**
     * (scenery-internal)
     */ get stretch() {
            assert && assert(this._xStretch === this._yStretch);
            return this._xStretch;
        }
        /**
     * (scenery-internal)
     */ set stretch(value) {
            assert && assert(value === null || typeof value === 'boolean');
            if (this._xStretch !== value || this._yStretch !== value) {
                this._xStretch = value;
                this._yStretch = value;
                this.changedEmitter.emit();
            }
        }
        /**
     * (scenery-internal)
     */ get xStretch() {
            return this._xStretch;
        }
        /**
     * (scenery-internal)
     */ set xStretch(value) {
            assert && assert(value === null || typeof value === 'boolean');
            if (this._xStretch !== value) {
                this._xStretch = value;
                this.changedEmitter.emit();
            }
        }
        /**
     * (scenery-internal)
     */ get yStretch() {
            return this._yStretch;
        }
        /**
     * (scenery-internal)
     */ set yStretch(value) {
            assert && assert(value === null || typeof value === 'boolean');
            if (this._yStretch !== value) {
                this._yStretch = value;
                this.changedEmitter.emit();
            }
        }
        /**
     * (scenery-internal)
     */ constructor(...args){
            super(...args), // (scenery-internal)
            this._xAlign = null, this._yAlign = null, this._xStretch = null, this._yStretch = null, this._xGrow = null, this._yGrow = null;
        }
    };
});
scenery.register('GridConfigurable', GridConfigurable);
export default GridConfigurable;
export { GRID_CONFIGURABLE_OPTION_KEYS };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGF5b3V0L2NvbnN0cmFpbnRzL0dyaWRDb25maWd1cmFibGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogTWl4aW4gZm9yIHN0b3Jpbmcgb3B0aW9ucyB0aGF0IGNhbiBhZmZlY3QgZWFjaCBjZWxsLlxuICpcbiAqIEhhbmRsZXMgYSBsb3Qgb2YgY29udmVyc2lvbiBmcm9tIGludGVybmFsIEVudW1lcmF0aW9uIHZhbHVlcyAoZm9yIHBlcmZvcm1hbmNlKSBhbmQgZXh0ZXJuYWwgc3RyaW5nIHJlcHJlc2VudGF0aW9ucy5cbiAqIFRoaXMgaXMgZG9uZSBwcmltYXJpbHkgZm9yIHBlcmZvcm1hbmNlIGFuZCB0aGF0IHN0eWxlIG9mIGludGVybmFsIGVudW1lcmF0aW9uIHBhdHRlcm4uIElmIHN0cmluZyBjb21wYXJpc29ucyBhcmVcbiAqIGZhc3RlciwgdGhhdCBjb3VsZCBiZSB1c2VkIGluc3RlYWQuXG4gKlxuICogTk9URTogVGhpcyBpcyBtaXhlZCBpbnRvIGJvdGggdGhlIGNvbnN0cmFpbnQgQU5EIHRoZSBjZWxsLCBzaW5jZSB3ZSBoYXZlIHR3byBsYXllcnMgb2Ygb3B0aW9ucy4gVGhlIGBudWxsYCBtZWFuaW5nXG4gKiBcImluaGVyaXQgZnJvbSB0aGUgZGVmYXVsdFwiIGlzIG1haW5seSB1c2VkIGZvciB0aGUgY2VsbHMsIHNvIHRoYXQgaWYgaXQncyBub3Qgc3BlY2lmaWVkIGluIHRoZSBjZWxsLCBpdCB3aWxsIGJlXG4gKiBzcGVjaWZpZWQgaW4gdGhlIGNvbnN0cmFpbnQgKGFzIG5vbi1udWxsKS5cbiAqXG4gKiBOT1RFOiBUaGlzIGlzIGEgbWl4aW4gbWVhbnQgdG8gYmUgdXNlZCBpbnRlcm5hbGx5IG9ubHkgYnkgU2NlbmVyeSAoZm9yIHRoZSBjb25zdHJhaW50IGFuZCBjZWxsKSwgYW5kIHNob3VsZCBub3QgYmVcbiAqIHVzZWQgYnkgb3V0c2lkZSBjb2RlLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9hc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMuanMnO1xuaW1wb3J0IG1lbW9pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lbW9pemUuanMnO1xuaW1wb3J0IG11dGF0ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbXV0YXRlLmpzJztcbmltcG9ydCBDb25zdHJ1Y3RvciBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvQ29uc3RydWN0b3IuanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgV2l0aG91dE51bGwgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1dpdGhvdXROdWxsLmpzJztcbmltcG9ydCB7IEhvcml6b250YWxMYXlvdXRBbGlnbiwgSG9yaXpvbnRhbExheW91dEFsaWduVmFsdWVzLCBMYXlvdXRBbGlnbiwgTUFSR0lOX0xBWU9VVF9DT05GSUdVUkFCTEVfT1BUSU9OX0tFWVMsIE1hcmdpbkxheW91dENvbmZpZ3VyYWJsZSwgTWFyZ2luTGF5b3V0Q29uZmlndXJhYmxlT3B0aW9ucywgc2NlbmVyeSwgVmVydGljYWxMYXlvdXRBbGlnbiwgVmVydGljYWxMYXlvdXRBbGlnblZhbHVlcyB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xuXG5jb25zdCBHUklEX0NPTkZJR1VSQUJMRV9PUFRJT05fS0VZUyA9IFtcbiAgJ3hBbGlnbicsXG4gICd5QWxpZ24nLFxuICAnc3RyZXRjaCcsXG4gICd4U3RyZXRjaCcsXG4gICd5U3RyZXRjaCcsXG4gICdncm93JyxcbiAgJ3hHcm93JyxcbiAgJ3lHcm93J1xuXS5jb25jYXQoIE1BUkdJTl9MQVlPVVRfQ09ORklHVVJBQkxFX09QVElPTl9LRVlTICk7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIC8vIEFsaWdubWVudHMgY29udHJvbCBob3cgdGhlIGNvbnRlbnQgb2YgYSBjZWxsIGlzIHBvc2l0aW9uZWQgd2l0aGluIHRoYXQgY2VsbCdzIGF2YWlsYWJsZSBhcmVhICh0aHVzIGl0IG9ubHkgYXBwbGllc1xuICAvLyBpZiB0aGVyZSBpcyBBRERJVElPTkFMIHNwYWNlLCBlLmcuIGluIGEgcm93L2NvbHVtbiB3aXRoIGEgbGFyZ2VyIGl0ZW0sIG9yIHRoZXJlIGlzIGEgcHJlZmVycmVkIHNpemUgb24gdGhlIEdyaWRCb3guXG4gIC8vXG4gIC8vIEZvciAnb3JpZ2luJywgdGhlIHg9MCBvciB5PTAgcG9pbnRzIG9mIGVhY2ggaXRlbSBjb250ZW50IHdpbGwgYmUgYWxpZ25lZCAodmVydGljYWxseSBvciBob3Jpem9udGFsbHkpLiBUaGlzIGlzXG4gIC8vIHBhcnRpY3VsYXJseSB1c2VmdWwgZm9yIFRleHQsIHdoZXJlIHRoZSBvcmlnaW4gKHk9MCkgaXMgdGhlIGJhc2VsaW5lIG9mIHRoZSB0ZXh0LCBzbyB0aGF0IGRpZmZlcmVudGx5LXNpemVkIHRleHRzXG4gIC8vIGNhbiBoYXZlIHRoZWlyIGJhc2VsaW5lcyBhbGlnbmVkLCBvciBvdGhlciBjb250ZW50IGNhbiBiZSBhbGlnbmVkIChlLmcuIGEgY2lyY2xlIHdob3NlIG9yaWdpbiBpcyBhdCBpdHMgY2VudGVyKS5cbiAgLy9cbiAgLy8gTk9URTogJ29yaWdpbicgYWxpZ25zIHdpbGwgb25seSBhcHBseSB0byBjZWxscyB0aGF0IGFyZSAxIGdyaWQgbGluZSBpbiB0aGF0IG9yaWVudGF0aW9uICh3aWR0aC9oZWlnaHQpXG4gIHhBbGlnbj86IEhvcml6b250YWxMYXlvdXRBbGlnbiB8IG51bGw7XG4gIHlBbGlnbj86IFZlcnRpY2FsTGF5b3V0QWxpZ24gfCBudWxsO1xuXG4gIC8vIFN0cmV0Y2ggd2lsbCBjb250cm9sIHdoZXRoZXIgYSByZXNpemFibGUgY29tcG9uZW50IChtaXhlcyBpbiBXaWR0aFNpemFibGUvSGVpZ2h0U2l6YWJsZSkgd2lsbCBleHBhbmQgdG8gZmlsbCB0aGVcbiAgLy8gYXZhaWxhYmxlIHNwYWNlIHdpdGhpbiBhIGNlbGwncyBhdmFpbGFibGUgYXJlYS4gU2ltaWxhcmx5IHRvIGFsaWduLCB0aGlzIG9ubHkgYXBwbGllcyBpZiB0aGVyZSBpcyBhZGRpdGlvbmFsIHNwYWNlLlxuICBzdHJldGNoPzogYm9vbGVhbjsgLy8gc2hvcnRjdXQgZm9yIHhTdHJldGNoL3lTdHJldGNoXG4gIHhTdHJldGNoPzogYm9vbGVhbiB8IG51bGw7XG4gIHlTdHJldGNoPzogYm9vbGVhbiB8IG51bGw7XG5cbiAgLy8gR3JvdyB3aWxsIGNvbnRyb2wgaG93IGFkZGl0aW9uYWwgZW1wdHkgc3BhY2UgKGFib3ZlIHRoZSBtaW5pbXVtIHNpemVzIHRoYXQgdGhlIGdyaWQgY291bGQgdGFrZSkgd2lsbCBiZVxuICAvLyBwcm9wb3J0aW9uZWQgb3V0IHRvIHRoZSByb3dzIGFuZCBjb2x1bW5zLiBVbmxpa2Ugc3RyZXRjaCwgdGhpcyBhZmZlY3RzIHRoZSBzaXplIG9mIHRoZSBjb2x1bW5zLCBhbmQgZG9lcyBub3QgYWZmZWN0XG4gIC8vIHRoZSBpbmRpdmlkdWFsIGNlbGxzLlxuICBncm93PzogbnVtYmVyIHwgbnVsbDsgLy8gc2hvcnRjdXQgZm9yIHhHcm93L3lHcm93XG4gIHhHcm93PzogbnVtYmVyIHwgbnVsbDtcbiAgeUdyb3c/OiBudW1iZXIgfCBudWxsO1xufTtcblxuZXhwb3J0IHR5cGUgR3JpZENvbmZpZ3VyYWJsZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIE1hcmdpbkxheW91dENvbmZpZ3VyYWJsZU9wdGlvbnM7XG5cbi8vIFdlIHJlbW92ZSB0aGUgbnVsbCB2YWx1ZXMgZm9yIHRoZSB2YWx1ZXMgdGhhdCB3b24ndCBhY3R1YWxseSB0YWtlIG51bGxcbmV4cG9ydCB0eXBlIEV4dGVybmFsR3JpZENvbmZpZ3VyYWJsZU9wdGlvbnMgPSBXaXRob3V0TnVsbDxHcmlkQ29uZmlndXJhYmxlT3B0aW9ucywgRXhjbHVkZTxrZXlvZiBHcmlkQ29uZmlndXJhYmxlT3B0aW9ucywgJ21pbkNvbnRlbnRXaWR0aCcgfCAnbWluQ29udGVudEhlaWdodCcgfCAnbWF4Q29udGVudFdpZHRoJyB8ICdtYXhDb250ZW50SGVpZ2h0Jz4+O1xuXG4vLyAoc2NlbmVyeS1pbnRlcm5hbClcbmNvbnN0IEdyaWRDb25maWd1cmFibGUgPSBtZW1vaXplKCA8U3VwZXJUeXBlIGV4dGVuZHMgQ29uc3RydWN0b3I+KCB0eXBlOiBTdXBlclR5cGUgKSA9PiB7XG4gIHJldHVybiBjbGFzcyBHcmlkQ29uZmlndXJhYmxlTWl4aW4gZXh0ZW5kcyBNYXJnaW5MYXlvdXRDb25maWd1cmFibGUoIHR5cGUgKSB7XG5cbiAgICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICBwdWJsaWMgX3hBbGlnbjogTGF5b3V0QWxpZ24gfCBudWxsID0gbnVsbDtcbiAgICBwdWJsaWMgX3lBbGlnbjogTGF5b3V0QWxpZ24gfCBudWxsID0gbnVsbDtcbiAgICBwdWJsaWMgX3hTdHJldGNoOiBib29sZWFuIHwgbnVsbCA9IG51bGw7XG4gICAgcHVibGljIF95U3RyZXRjaDogYm9vbGVhbiB8IG51bGwgPSBudWxsO1xuICAgIHB1YmxpYyBfeEdyb3c6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICAgIHB1YmxpYyBfeUdyb3c6IG51bWJlciB8IG51bGwgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAgICovXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKCAuLi5hcmdzOiBJbnRlbnRpb25hbEFueVtdICkge1xuICAgICAgc3VwZXIoIC4uLmFyZ3MgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgbXV0YXRlQ29uZmlndXJhYmxlKCBvcHRpb25zPzogR3JpZENvbmZpZ3VyYWJsZU9wdGlvbnMgKTogdm9pZCB7XG4gICAgICBzdXBlci5tdXRhdGVDb25maWd1cmFibGUoIG9wdGlvbnMgKTtcblxuICAgICAgYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zKCBvcHRpb25zLCBbICdzdHJldGNoJyBdLCBbICd4U3RyZXRjaCcsICd5U3RyZXRjaCcgXSApO1xuICAgICAgYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zKCBvcHRpb25zLCBbICdncm93JyBdLCBbICd4R3JvdycsICd5R3JvdycgXSApO1xuXG4gICAgICBtdXRhdGUoIHRoaXMsIEdSSURfQ09ORklHVVJBQkxFX09QVElPTl9LRVlTLCBvcHRpb25zICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzZXRzIHZhbHVlcyB0byB0aGUgXCJiYXNlXCIgc3RhdGUuXG4gICAgICpcbiAgICAgKiBUaGlzIGlzIHRoZSBmYWxsYmFjayBzdGF0ZSBmb3IgYSBjb25zdHJhaW50IHdoZXJlIGV2ZXJ5IHZhbHVlIGlzIGRlZmluZWQgYW5kIHZhbGlkLiBJZiBhIGNlbGwgZG9lcyBub3QgaGF2ZSBhXG4gICAgICogc3BlY2lmaWMgXCJvdmVycmlkZGVuXCIgdmFsdWUsIG9yIGEgY29uc3RyYWludCBkb2Vzbid0IGhhdmUgYW4gXCJvdmVycmlkZGVuXCIgdmFsdWUsIHRoZW4gaXQgd2lsbCB0YWtlIHRoZSB2YWx1ZVxuICAgICAqIGRlZmluZWQgaGVyZS5cbiAgICAgKlxuICAgICAqIFRoZXNlIHNob3VsZCBiZSB0aGUgZGVmYXVsdCB2YWx1ZXMgZm9yIGNvbnN0cmFpbnRzLlxuICAgICAqXG4gICAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIHNldENvbmZpZ1RvQmFzZURlZmF1bHQoKTogdm9pZCB7XG4gICAgICB0aGlzLl94QWxpZ24gPSBMYXlvdXRBbGlnbi5DRU5URVI7XG4gICAgICB0aGlzLl95QWxpZ24gPSBMYXlvdXRBbGlnbi5DRU5URVI7XG4gICAgICB0aGlzLl94U3RyZXRjaCA9IGZhbHNlO1xuICAgICAgdGhpcy5feVN0cmV0Y2ggPSBmYWxzZTtcbiAgICAgIHRoaXMuX3hHcm93ID0gMDtcbiAgICAgIHRoaXMuX3lHcm93ID0gMDtcblxuICAgICAgc3VwZXIuc2V0Q29uZmlnVG9CYXNlRGVmYXVsdCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlc2V0cyB2YWx1ZXMgdG8gdGhlIFwiZG9uJ3Qgb3ZlcnJpZGUgYW55dGhpbmcsIG9ubHkgaW5oZXJpdCBmcm9tIHRoZSBjb25zdHJhaW50XCIgc3RhdGVcbiAgICAgKlxuICAgICAqIFRoZXNlIHNob3VsZCBiZSB0aGUgZGVmYXVsdCB2YWx1ZXMgZm9yIGNlbGxzIChlLmcuIFwidGFrZSBhbGwgdGhlIGJlaGF2aW9yIGZyb20gdGhlIGNvbnN0cmFpbnQsIG5vdGhpbmcgaXNcbiAgICAgKiBvdmVycmlkZGVuXCIpLlxuICAgICAqXG4gICAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIHNldENvbmZpZ1RvSW5oZXJpdCggaWdub3JlT3B0aW9ucz86IEdyaWRDb25maWd1cmFibGVPcHRpb25zICk6IHZvaWQge1xuICAgICAgaWYgKCAhaWdub3JlT3B0aW9ucyB8fCBpZ25vcmVPcHRpb25zLnhBbGlnbiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICB0aGlzLl94QWxpZ24gPSBudWxsO1xuICAgICAgfVxuICAgICAgaWYgKCAhaWdub3JlT3B0aW9ucyB8fCBpZ25vcmVPcHRpb25zLnlBbGlnbiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICB0aGlzLl95QWxpZ24gPSBudWxsO1xuICAgICAgfVxuICAgICAgaWYgKCAhaWdub3JlT3B0aW9ucyB8fCAoIGlnbm9yZU9wdGlvbnMuc3RyZXRjaCA9PT0gdW5kZWZpbmVkICYmIGlnbm9yZU9wdGlvbnMueFN0cmV0Y2ggPT09IHVuZGVmaW5lZCApICkge1xuICAgICAgICB0aGlzLl94U3RyZXRjaCA9IG51bGw7XG4gICAgICB9XG4gICAgICBpZiAoICFpZ25vcmVPcHRpb25zIHx8ICggaWdub3JlT3B0aW9ucy5zdHJldGNoID09PSB1bmRlZmluZWQgJiYgaWdub3JlT3B0aW9ucy55U3RyZXRjaCA9PT0gdW5kZWZpbmVkICkgKSB7XG4gICAgICAgIHRoaXMuX3lTdHJldGNoID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICggIWlnbm9yZU9wdGlvbnMgfHwgKCBpZ25vcmVPcHRpb25zLmdyb3cgPT09IHVuZGVmaW5lZCAmJiBpZ25vcmVPcHRpb25zLnhHcm93ID09PSB1bmRlZmluZWQgKSApIHtcbiAgICAgICAgdGhpcy5feEdyb3cgPSBudWxsO1xuICAgICAgfVxuICAgICAgaWYgKCAhaWdub3JlT3B0aW9ucyB8fCAoIGlnbm9yZU9wdGlvbnMuZ3JvdyA9PT0gdW5kZWZpbmVkICYmIGlnbm9yZU9wdGlvbnMueUdyb3cgPT09IHVuZGVmaW5lZCApICkge1xuICAgICAgICB0aGlzLl95R3JvdyA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHN1cGVyLnNldENvbmZpZ1RvSW5oZXJpdCggaWdub3JlT3B0aW9ucyApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgeEFsaWduKCk6IEhvcml6b250YWxMYXlvdXRBbGlnbiB8IG51bGwge1xuICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5feEFsaWduID09PSBudWxsID8gbnVsbCA6IHRoaXMuX3hBbGlnbi5ob3Jpem9udGFsO1xuXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCByZXN1bHQgPT09IG51bGwgfHwgdHlwZW9mIHJlc3VsdCA9PT0gJ3N0cmluZycgKTtcblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IHhBbGlnbiggdmFsdWU6IEhvcml6b250YWxMYXlvdXRBbGlnbiB8IG51bGwgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2YWx1ZSA9PT0gbnVsbCB8fCBIb3Jpem9udGFsTGF5b3V0QWxpZ25WYWx1ZXMuaW5jbHVkZXMoIHZhbHVlICksXG4gICAgICAgIGBhbGlnbiAke3ZhbHVlfSBub3Qgc3VwcG9ydGVkLCB0aGUgdmFsaWQgdmFsdWVzIGFyZSAke0hvcml6b250YWxMYXlvdXRBbGlnblZhbHVlc30gb3IgbnVsbGAgKTtcblxuICAgICAgLy8gcmVtYXBwaW5nIGFsaWduIHZhbHVlcyB0byBhbiBpbmRlcGVuZGVudCBzZXQsIHNvIHRoZXkgYXJlbid0IG9yaWVudGF0aW9uLWRlcGVuZGVudFxuICAgICAgY29uc3QgbWFwcGVkVmFsdWUgPSBMYXlvdXRBbGlnbi5ob3Jpem9udGFsQWxpZ25Ub0ludGVybmFsKCB2YWx1ZSApO1xuXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYXBwZWRWYWx1ZSA9PT0gbnVsbCB8fCBtYXBwZWRWYWx1ZSBpbnN0YW5jZW9mIExheW91dEFsaWduICk7XG5cbiAgICAgIGlmICggdGhpcy5feEFsaWduICE9PSBtYXBwZWRWYWx1ZSApIHtcbiAgICAgICAgdGhpcy5feEFsaWduID0gbWFwcGVkVmFsdWU7XG5cbiAgICAgICAgdGhpcy5jaGFuZ2VkRW1pdHRlci5lbWl0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAgICovXG4gICAgcHVibGljIGdldCB5QWxpZ24oKTogVmVydGljYWxMYXlvdXRBbGlnbiB8IG51bGwge1xuICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5feUFsaWduID09PSBudWxsID8gbnVsbCA6IHRoaXMuX3lBbGlnbi52ZXJ0aWNhbDtcblxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcmVzdWx0ID09PSBudWxsIHx8IHR5cGVvZiByZXN1bHQgPT09ICdzdHJpbmcnICk7XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAgICovXG4gICAgcHVibGljIHNldCB5QWxpZ24oIHZhbHVlOiBWZXJ0aWNhbExheW91dEFsaWduIHwgbnVsbCApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHZhbHVlID09PSBudWxsIHx8IFZlcnRpY2FsTGF5b3V0QWxpZ25WYWx1ZXMuaW5jbHVkZXMoIHZhbHVlICksXG4gICAgICAgIGBhbGlnbiAke3ZhbHVlfSBub3Qgc3VwcG9ydGVkLCB0aGUgdmFsaWQgdmFsdWVzIGFyZSAke1ZlcnRpY2FsTGF5b3V0QWxpZ25WYWx1ZXN9IG9yIG51bGxgICk7XG5cbiAgICAgIC8vIHJlbWFwcGluZyBhbGlnbiB2YWx1ZXMgdG8gYW4gaW5kZXBlbmRlbnQgc2V0LCBzbyB0aGV5IGFyZW4ndCBvcmllbnRhdGlvbi1kZXBlbmRlbnRcbiAgICAgIGNvbnN0IG1hcHBlZFZhbHVlID0gTGF5b3V0QWxpZ24udmVydGljYWxBbGlnblRvSW50ZXJuYWwoIHZhbHVlICk7XG5cbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG1hcHBlZFZhbHVlID09PSBudWxsIHx8IG1hcHBlZFZhbHVlIGluc3RhbmNlb2YgTGF5b3V0QWxpZ24gKTtcblxuICAgICAgaWYgKCB0aGlzLl95QWxpZ24gIT09IG1hcHBlZFZhbHVlICkge1xuICAgICAgICB0aGlzLl95QWxpZ24gPSBtYXBwZWRWYWx1ZTtcblxuICAgICAgICB0aGlzLmNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGdyb3coKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl94R3JvdyA9PT0gdGhpcy5feUdyb3cgKTtcblxuICAgICAgcmV0dXJuIHRoaXMuX3hHcm93O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgZ3JvdyggdmFsdWU6IG51bWJlciB8IG51bGwgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2YWx1ZSA9PT0gbnVsbCB8fCAoIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIHZhbHVlICkgJiYgdmFsdWUgPj0gMCApICk7XG5cbiAgICAgIGlmICggdGhpcy5feEdyb3cgIT09IHZhbHVlIHx8IHRoaXMuX3lHcm93ICE9PSB2YWx1ZSApIHtcbiAgICAgICAgdGhpcy5feEdyb3cgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5feUdyb3cgPSB2YWx1ZTtcblxuICAgICAgICB0aGlzLmNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHhHcm93KCk6IG51bWJlciB8IG51bGwge1xuICAgICAgcmV0dXJuIHRoaXMuX3hHcm93O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgeEdyb3coIHZhbHVlOiBudW1iZXIgfCBudWxsICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdmFsdWUgPT09IG51bGwgfHwgKCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB2YWx1ZSApICYmIHZhbHVlID49IDAgKSApO1xuXG4gICAgICBpZiAoIHRoaXMuX3hHcm93ICE9PSB2YWx1ZSApIHtcbiAgICAgICAgdGhpcy5feEdyb3cgPSB2YWx1ZTtcblxuICAgICAgICB0aGlzLmNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHlHcm93KCk6IG51bWJlciB8IG51bGwge1xuICAgICAgcmV0dXJuIHRoaXMuX3lHcm93O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgeUdyb3coIHZhbHVlOiBudW1iZXIgfCBudWxsICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdmFsdWUgPT09IG51bGwgfHwgKCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB2YWx1ZSApICYmIHZhbHVlID49IDAgKSApO1xuXG4gICAgICBpZiAoIHRoaXMuX3lHcm93ICE9PSB2YWx1ZSApIHtcbiAgICAgICAgdGhpcy5feUdyb3cgPSB2YWx1ZTtcblxuICAgICAgICB0aGlzLmNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHN0cmV0Y2goKTogYm9vbGVhbiB8IG51bGwge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5feFN0cmV0Y2ggPT09IHRoaXMuX3lTdHJldGNoICk7XG5cbiAgICAgIHJldHVybiB0aGlzLl94U3RyZXRjaDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IHN0cmV0Y2goIHZhbHVlOiBib29sZWFuIHwgbnVsbCApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHZhbHVlID09PSBudWxsIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nICk7XG5cbiAgICAgIGlmICggdGhpcy5feFN0cmV0Y2ggIT09IHZhbHVlIHx8IHRoaXMuX3lTdHJldGNoICE9PSB2YWx1ZSApIHtcbiAgICAgICAgdGhpcy5feFN0cmV0Y2ggPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5feVN0cmV0Y2ggPSB2YWx1ZTtcblxuICAgICAgICB0aGlzLmNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHhTdHJldGNoKCk6IGJvb2xlYW4gfCBudWxsIHtcbiAgICAgIHJldHVybiB0aGlzLl94U3RyZXRjaDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IHhTdHJldGNoKCB2YWx1ZTogYm9vbGVhbiB8IG51bGwgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2YWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJyApO1xuXG4gICAgICBpZiAoIHRoaXMuX3hTdHJldGNoICE9PSB2YWx1ZSApIHtcbiAgICAgICAgdGhpcy5feFN0cmV0Y2ggPSB2YWx1ZTtcblxuICAgICAgICB0aGlzLmNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHlTdHJldGNoKCk6IGJvb2xlYW4gfCBudWxsIHtcbiAgICAgIHJldHVybiB0aGlzLl95U3RyZXRjaDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IHlTdHJldGNoKCB2YWx1ZTogYm9vbGVhbiB8IG51bGwgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2YWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJyApO1xuXG4gICAgICBpZiAoIHRoaXMuX3lTdHJldGNoICE9PSB2YWx1ZSApIHtcbiAgICAgICAgdGhpcy5feVN0cmV0Y2ggPSB2YWx1ZTtcblxuICAgICAgICB0aGlzLmNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59ICk7XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdHcmlkQ29uZmlndXJhYmxlJywgR3JpZENvbmZpZ3VyYWJsZSApO1xuZXhwb3J0IGRlZmF1bHQgR3JpZENvbmZpZ3VyYWJsZTtcbmV4cG9ydCB7IEdSSURfQ09ORklHVVJBQkxFX09QVElPTl9LRVlTIH07Il0sIm5hbWVzIjpbImFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyIsIm1lbW9pemUiLCJtdXRhdGUiLCJIb3Jpem9udGFsTGF5b3V0QWxpZ25WYWx1ZXMiLCJMYXlvdXRBbGlnbiIsIk1BUkdJTl9MQVlPVVRfQ09ORklHVVJBQkxFX09QVElPTl9LRVlTIiwiTWFyZ2luTGF5b3V0Q29uZmlndXJhYmxlIiwic2NlbmVyeSIsIlZlcnRpY2FsTGF5b3V0QWxpZ25WYWx1ZXMiLCJHUklEX0NPTkZJR1VSQUJMRV9PUFRJT05fS0VZUyIsImNvbmNhdCIsIkdyaWRDb25maWd1cmFibGUiLCJ0eXBlIiwiR3JpZENvbmZpZ3VyYWJsZU1peGluIiwibXV0YXRlQ29uZmlndXJhYmxlIiwib3B0aW9ucyIsInNldENvbmZpZ1RvQmFzZURlZmF1bHQiLCJfeEFsaWduIiwiQ0VOVEVSIiwiX3lBbGlnbiIsIl94U3RyZXRjaCIsIl95U3RyZXRjaCIsIl94R3JvdyIsIl95R3JvdyIsInNldENvbmZpZ1RvSW5oZXJpdCIsImlnbm9yZU9wdGlvbnMiLCJ4QWxpZ24iLCJ1bmRlZmluZWQiLCJ5QWxpZ24iLCJzdHJldGNoIiwieFN0cmV0Y2giLCJ5U3RyZXRjaCIsImdyb3ciLCJ4R3JvdyIsInlHcm93IiwicmVzdWx0IiwiaG9yaXpvbnRhbCIsImFzc2VydCIsInZhbHVlIiwiaW5jbHVkZXMiLCJtYXBwZWRWYWx1ZSIsImhvcml6b250YWxBbGlnblRvSW50ZXJuYWwiLCJjaGFuZ2VkRW1pdHRlciIsImVtaXQiLCJ2ZXJ0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