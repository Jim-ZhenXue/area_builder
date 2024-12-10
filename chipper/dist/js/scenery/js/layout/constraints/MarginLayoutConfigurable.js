// Copyright 2022-2024, University of Colorado Boulder
/**
 * This combines the margin-cell related options common to FlowConfigurable and GridConfigurable
 * Parent mixin for flow/grid configurables (mixins for storing options that can affect each cell).
 * `null` for values usually means "inherit from the default".
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
import assertMutuallyExclusiveOptions from '../../../../phet-core/js/assertMutuallyExclusiveOptions.js';
import memoize from '../../../../phet-core/js/memoize.js';
import { scenery } from '../../imports.js';
const MARGIN_LAYOUT_CONFIGURABLE_OPTION_KEYS = [
    'margin',
    'xMargin',
    'yMargin',
    'leftMargin',
    'rightMargin',
    'topMargin',
    'bottomMargin',
    'minContentWidth',
    'minContentHeight',
    'maxContentWidth',
    'maxContentHeight'
];
// (scenery-internal)
const MarginLayoutConfigurable = memoize((Type)=>{
    return class MarginLayoutConfigurableMixin extends Type {
        /**
     * (scenery-internal)
     */ mutateConfigurable(options) {
            assertMutuallyExclusiveOptions(options, [
                'margin'
            ], [
                'xMargin',
                'yMargin'
            ]);
            assertMutuallyExclusiveOptions(options, [
                'xMargin'
            ], [
                'leftMargin',
                'rightMargin'
            ]);
            assertMutuallyExclusiveOptions(options, [
                'yMargin'
            ], [
                'topMargin',
                'bottomMargin'
            ]);
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
     * NOTE: min/max content width/height are null here (since null is a valid default, and doesn't indicate an
     * "inherit" value like the other types).
     *
     * (scenery-internal)
     */ setConfigToBaseDefault() {
            this._leftMargin = 0;
            this._rightMargin = 0;
            this._topMargin = 0;
            this._bottomMargin = 0;
            this._minContentWidth = null;
            this._minContentHeight = null;
            this._maxContentWidth = null;
            this._maxContentHeight = null;
            this.changedEmitter.emit();
        }
        /**
     * Resets values to the "don't override anything, only inherit from the constraint" state
     *
     * These should be the default values for cells (e.g. "take all the behavior from the constraint, nothing is
     * overridden").
     *
     * NOTE: If ignoreOptions is provided, we will omit setting any values for keys that are defined in the ignoreOptions.
     * This allows us to avoid resetting values that we are just about to set to another value.
     *
     * (scenery-internal)
     */ setConfigToInherit(ignoreOptions) {
            if (!ignoreOptions || ignoreOptions.leftMargin === undefined) {
                this._leftMargin = null;
            }
            if (!ignoreOptions || ignoreOptions.rightMargin === undefined) {
                this._rightMargin = null;
            }
            if (!ignoreOptions || ignoreOptions.topMargin === undefined) {
                this._topMargin = null;
            }
            if (!ignoreOptions || ignoreOptions.bottomMargin === undefined) {
                this._bottomMargin = null;
            }
            if (!ignoreOptions || ignoreOptions.minContentWidth === undefined) {
                this._minContentWidth = null;
            }
            if (!ignoreOptions || ignoreOptions.minContentHeight === undefined) {
                this._minContentHeight = null;
            }
            if (!ignoreOptions || ignoreOptions.maxContentWidth === undefined) {
                this._maxContentWidth = null;
            }
            if (!ignoreOptions || ignoreOptions.maxContentHeight === undefined) {
                this._maxContentHeight = null;
            }
            this.changedEmitter.emit();
        }
        /**
     * (scenery-internal)
     */ get leftMargin() {
            return this._leftMargin;
        }
        /**
     * (scenery-internal)
     */ set leftMargin(value) {
            assert && assert(value === null || typeof value === 'number' && isFinite(value));
            if (this._leftMargin !== value) {
                this._leftMargin = value;
                this.changedEmitter.emit();
            }
        }
        /**
     * (scenery-internal)
     */ get rightMargin() {
            return this._rightMargin;
        }
        /**
     * (scenery-internal)
     */ set rightMargin(value) {
            assert && assert(value === null || typeof value === 'number' && isFinite(value));
            if (this._rightMargin !== value) {
                this._rightMargin = value;
                this.changedEmitter.emit();
            }
        }
        /**
     * (scenery-internal)
     */ get topMargin() {
            return this._topMargin;
        }
        /**
     * (scenery-internal)
     */ set topMargin(value) {
            assert && assert(value === null || typeof value === 'number' && isFinite(value));
            if (this._topMargin !== value) {
                this._topMargin = value;
                this.changedEmitter.emit();
            }
        }
        /**
     * (scenery-internal)
     */ get bottomMargin() {
            return this._bottomMargin;
        }
        /**
     * (scenery-internal)
     */ set bottomMargin(value) {
            assert && assert(value === null || typeof value === 'number' && isFinite(value));
            if (this._bottomMargin !== value) {
                this._bottomMargin = value;
                this.changedEmitter.emit();
            }
        }
        /**
     * (scenery-internal)
     */ get xMargin() {
            assert && assert(this._leftMargin === this._rightMargin);
            return this._leftMargin;
        }
        /**
     * (scenery-internal)
     */ set xMargin(value) {
            assert && assert(value === null || typeof value === 'number' && isFinite(value));
            if (this._leftMargin !== value || this._rightMargin !== value) {
                this._leftMargin = value;
                this._rightMargin = value;
                this.changedEmitter.emit();
            }
        }
        /**
     * (scenery-internal)
     */ get yMargin() {
            assert && assert(this._topMargin === this._bottomMargin);
            return this._topMargin;
        }
        /**
     * (scenery-internal)
     */ set yMargin(value) {
            assert && assert(value === null || typeof value === 'number' && isFinite(value));
            if (this._topMargin !== value || this._bottomMargin !== value) {
                this._topMargin = value;
                this._bottomMargin = value;
                this.changedEmitter.emit();
            }
        }
        /**
     * (scenery-internal)
     */ get margin() {
            assert && assert(this._leftMargin === this._rightMargin && this._leftMargin === this._topMargin && this._leftMargin === this._bottomMargin);
            return this._topMargin;
        }
        /**
     * (scenery-internal)
     */ set margin(value) {
            assert && assert(value === null || typeof value === 'number' && isFinite(value));
            if (this._leftMargin !== value || this._rightMargin !== value || this._topMargin !== value || this._bottomMargin !== value) {
                this._leftMargin = value;
                this._rightMargin = value;
                this._topMargin = value;
                this._bottomMargin = value;
                this.changedEmitter.emit();
            }
        }
        /**
     * (scenery-internal)
     */ get minContentWidth() {
            return this._minContentWidth;
        }
        /**
     * (scenery-internal)
     */ set minContentWidth(value) {
            if (this._minContentWidth !== value) {
                this._minContentWidth = value;
                this.changedEmitter.emit();
            }
        }
        /**
     * (scenery-internal)
     */ get minContentHeight() {
            return this._minContentHeight;
        }
        /**
     * (scenery-internal)
     */ set minContentHeight(value) {
            if (this._minContentHeight !== value) {
                this._minContentHeight = value;
                this.changedEmitter.emit();
            }
        }
        /**
     * (scenery-internal)
     */ get maxContentWidth() {
            return this._maxContentWidth;
        }
        /**
     * (scenery-internal)
     */ set maxContentWidth(value) {
            if (this._maxContentWidth !== value) {
                this._maxContentWidth = value;
                this.changedEmitter.emit();
            }
        }
        /**
     * (scenery-internal)
     */ get maxContentHeight() {
            return this._maxContentHeight;
        }
        /**
     * (scenery-internal)
     */ set maxContentHeight(value) {
            if (this._maxContentHeight !== value) {
                this._maxContentHeight = value;
                this.changedEmitter.emit();
            }
        }
        /**
     * (scenery-internal)
     */ constructor(...args){
            super(...args), // (scenery-internal)
            this._leftMargin = null, this._rightMargin = null, this._topMargin = null, this._bottomMargin = null, this._minContentWidth = null, this._minContentHeight = null, this._maxContentWidth = null, this._maxContentHeight = null, this.changedEmitter = new TinyEmitter();
        }
    };
});
scenery.register('MarginLayoutConfigurable', MarginLayoutConfigurable);
export default MarginLayoutConfigurable;
export { MARGIN_LAYOUT_CONFIGURABLE_OPTION_KEYS };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGF5b3V0L2NvbnN0cmFpbnRzL01hcmdpbkxheW91dENvbmZpZ3VyYWJsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBUaGlzIGNvbWJpbmVzIHRoZSBtYXJnaW4tY2VsbCByZWxhdGVkIG9wdGlvbnMgY29tbW9uIHRvIEZsb3dDb25maWd1cmFibGUgYW5kIEdyaWRDb25maWd1cmFibGVcbiAqIFBhcmVudCBtaXhpbiBmb3IgZmxvdy9ncmlkIGNvbmZpZ3VyYWJsZXMgKG1peGlucyBmb3Igc3RvcmluZyBvcHRpb25zIHRoYXQgY2FuIGFmZmVjdCBlYWNoIGNlbGwpLlxuICogYG51bGxgIGZvciB2YWx1ZXMgdXN1YWxseSBtZWFucyBcImluaGVyaXQgZnJvbSB0aGUgZGVmYXVsdFwiLlxuICpcbiAqIE5PVEU6IFRoaXMgaXMgbWl4ZWQgaW50byBib3RoIHRoZSBjb25zdHJhaW50IEFORCB0aGUgY2VsbCwgc2luY2Ugd2UgaGF2ZSB0d28gbGF5ZXJzIG9mIG9wdGlvbnMuIFRoZSBgbnVsbGAgbWVhbmluZ1xuICogXCJpbmhlcml0IGZyb20gdGhlIGRlZmF1bHRcIiBpcyBtYWlubHkgdXNlZCBmb3IgdGhlIGNlbGxzLCBzbyB0aGF0IGlmIGl0J3Mgbm90IHNwZWNpZmllZCBpbiB0aGUgY2VsbCwgaXQgd2lsbCBiZVxuICogc3BlY2lmaWVkIGluIHRoZSBjb25zdHJhaW50IChhcyBub24tbnVsbCkuXG4gKlxuICogTk9URTogVGhpcyBpcyBhIG1peGluIG1lYW50IHRvIGJlIHVzZWQgaW50ZXJuYWxseSBvbmx5IGJ5IFNjZW5lcnkgKGZvciB0aGUgY29uc3RyYWludCBhbmQgY2VsbCksIGFuZCBzaG91bGQgbm90IGJlXG4gKiB1c2VkIGJ5IG91dHNpZGUgY29kZS5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IFRFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVEVtaXR0ZXIuanMnO1xuaW1wb3J0IFRpbnlFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVGlueUVtaXR0ZXIuanMnO1xuaW1wb3J0IGFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zLmpzJztcbmltcG9ydCBtZW1vaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZW1vaXplLmpzJztcbmltcG9ydCBDb25zdHJ1Y3RvciBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvQ29uc3RydWN0b3IuanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgV2l0aG91dE51bGwgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1dpdGhvdXROdWxsLmpzJztcbmltcG9ydCB7IHNjZW5lcnkgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcblxuY29uc3QgTUFSR0lOX0xBWU9VVF9DT05GSUdVUkFCTEVfT1BUSU9OX0tFWVMgPSBbXG4gICdtYXJnaW4nLFxuICAneE1hcmdpbicsXG4gICd5TWFyZ2luJyxcbiAgJ2xlZnRNYXJnaW4nLFxuICAncmlnaHRNYXJnaW4nLFxuICAndG9wTWFyZ2luJyxcbiAgJ2JvdHRvbU1hcmdpbicsXG4gICdtaW5Db250ZW50V2lkdGgnLFxuICAnbWluQ29udGVudEhlaWdodCcsXG4gICdtYXhDb250ZW50V2lkdGgnLFxuICAnbWF4Q29udGVudEhlaWdodCdcbl07XG5cbmV4cG9ydCB0eXBlIE1hcmdpbkxheW91dENvbmZpZ3VyYWJsZU9wdGlvbnMgPSB7XG4gIC8vIEFkZHMgZXh0cmEgc3BhY2UgZm9yIGVhY2ggY2VsbCBpbiB0aGUgbGF5b3V0IChtYXJnaW4gY29udHJvbHMgYWxsIDQgc2lkZXMsIHhNYXJnaW4gY29udHJvbHMgbGVmdC9yaWdodCwgeU1hcmdpblxuICAvLyBjb250cm9scyB0b3AvYm90dG9tKS5cbiAgLy8gU2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNGbG93Qm94LW1hcmdpbnNcbiAgLy8gU2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LW1hcmdpbnNcbiAgLy8gTWFyZ2lucyB3aWxsIGNvbnRyb2wgaG93IG11Y2ggZXh0cmEgc3BhY2UgaXMgRk9SQ0VEIGFyb3VuZCBjb250ZW50IHdpdGhpbiBhIGNlbGwncyBhdmFpbGFibGUgYXJlYS4gVGhlc2UgbWFyZ2lucyBkb1xuICAvLyBub3QgY29sbGFwc2UgKGVhY2ggY2VsbCBnZXRzIGl0cyBvd24pLlxuICBtYXJnaW4/OiBudW1iZXIgfCBudWxsOyAvLyBzaG9ydGN1dCBmb3IgbGVmdC9yaWdodC90b3AvYm90dG9tIG1hcmdpbnNcbiAgeE1hcmdpbj86IG51bWJlciB8IG51bGw7IC8vIHNob3J0Y3V0IGZvciBsZWZ0L3JpZ2h0IG1hcmdpbnNcbiAgeU1hcmdpbj86IG51bWJlciB8IG51bGw7IC8vIHNob3J0Y3V0IGZvciB0b3AvYm90dG9tIG1hcmdpbnNcbiAgbGVmdE1hcmdpbj86IG51bWJlciB8IG51bGw7XG4gIHJpZ2h0TWFyZ2luPzogbnVtYmVyIHwgbnVsbDtcbiAgdG9wTWFyZ2luPzogbnVtYmVyIHwgbnVsbDtcbiAgYm90dG9tTWFyZ2luPzogbnVtYmVyIHwgbnVsbDtcblxuICAvLyBGb3JjZXMgc2l6ZSBtaW5pbXVtcyBhbmQgbWF4aW11bXMgb24gdGhlIGNlbGxzICh3aGljaCBkb2VzIG5vdCBpbmNsdWRlIHRoZSBtYXJnaW5zKS5cbiAgLy8gTk9URTogRm9yIHRoZXNlLCB0aGUgbnVsbGFibGUgcG9ydGlvbiBpcyBhY3R1YWxseSBwYXJ0IG9mIHRoZSBwb3NzaWJsZSBcInZhbHVlXCJcbiAgLy8gU2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNGbG93Qm94LW1pbkNvbnRlbnQgYW5kXG4gIC8vIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNGbG93Qm94LW1heENvbnRlbnRcbiAgLy8gU2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LW1pbkNvbnRlbnQgYW5kXG4gIC8vIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LW1heENvbnRlbnRcbiAgbWluQ29udGVudFdpZHRoPzogbnVtYmVyIHwgbnVsbDtcbiAgbWluQ29udGVudEhlaWdodD86IG51bWJlciB8IG51bGw7XG4gIG1heENvbnRlbnRXaWR0aD86IG51bWJlciB8IG51bGw7XG4gIG1heENvbnRlbnRIZWlnaHQ/OiBudW1iZXIgfCBudWxsO1xufTtcblxuLy8gV2UgcmVtb3ZlIHRoZSBudWxsIHZhbHVlcyBmb3IgdGhlIHZhbHVlcyB0aGF0IHdvbid0IGFjdHVhbGx5IHRha2UgbnVsbFxuZXhwb3J0IHR5cGUgRXh0ZXJuYWxNYXJnaW5MYXlvdXRDb25maWd1cmFibGVPcHRpb25zID0gV2l0aG91dE51bGw8TWFyZ2luTGF5b3V0Q29uZmlndXJhYmxlT3B0aW9ucywgRXhjbHVkZTxrZXlvZiBNYXJnaW5MYXlvdXRDb25maWd1cmFibGVPcHRpb25zLCAnbWluQ29udGVudFdpZHRoJyB8ICdtaW5Db250ZW50SGVpZ2h0JyB8ICdtYXhDb250ZW50V2lkdGgnIHwgJ21heENvbnRlbnRIZWlnaHQnPj47XG5cbmV4cG9ydCB0eXBlIFRNYXJnaW5MYXlvdXRDb25maWd1cmFibGUgPSB7XG4gIF9sZWZ0TWFyZ2luOiBudW1iZXIgfCBudWxsO1xuICBfcmlnaHRNYXJnaW46IG51bWJlciB8IG51bGw7XG4gIF90b3BNYXJnaW46IG51bWJlciB8IG51bGw7XG4gIF9ib3R0b21NYXJnaW46IG51bWJlciB8IG51bGw7XG4gIF9taW5Db250ZW50V2lkdGg6IG51bWJlciB8IG51bGw7XG4gIF9taW5Db250ZW50SGVpZ2h0OiBudW1iZXIgfCBudWxsO1xuICBfbWF4Q29udGVudFdpZHRoOiBudW1iZXIgfCBudWxsO1xuICBfbWF4Q29udGVudEhlaWdodDogbnVtYmVyIHwgbnVsbDtcbiAgcmVhZG9ubHkgY2hhbmdlZEVtaXR0ZXI6IFRFbWl0dGVyO1xuICBtdXRhdGVDb25maWd1cmFibGUoIG9wdGlvbnM/OiBNYXJnaW5MYXlvdXRDb25maWd1cmFibGVPcHRpb25zICk6IHZvaWQ7XG4gIHNldENvbmZpZ1RvQmFzZURlZmF1bHQoKTogdm9pZDtcbiAgc2V0Q29uZmlnVG9Jbmhlcml0KCBpZ25vcmVPcHRpb25zPzogTWFyZ2luTGF5b3V0Q29uZmlndXJhYmxlT3B0aW9ucyApOiB2b2lkO1xuICBsZWZ0TWFyZ2luOiBudW1iZXIgfCBudWxsO1xuICByaWdodE1hcmdpbjogbnVtYmVyIHwgbnVsbDtcbiAgdG9wTWFyZ2luOiBudW1iZXIgfCBudWxsO1xuICBib3R0b21NYXJnaW46IG51bWJlciB8IG51bGw7XG4gIHhNYXJnaW46IG51bWJlciB8IG51bGw7XG4gIHlNYXJnaW46IG51bWJlciB8IG51bGw7XG4gIG1hcmdpbjogbnVtYmVyIHwgbnVsbDtcbiAgbWluQ29udGVudFdpZHRoOiBudW1iZXIgfCBudWxsO1xuICBtaW5Db250ZW50SGVpZ2h0OiBudW1iZXIgfCBudWxsO1xuICBtYXhDb250ZW50V2lkdGg6IG51bWJlciB8IG51bGw7XG4gIG1heENvbnRlbnRIZWlnaHQ6IG51bWJlciB8IG51bGw7XG59O1xuXG4vLyAoc2NlbmVyeS1pbnRlcm5hbClcbmNvbnN0IE1hcmdpbkxheW91dENvbmZpZ3VyYWJsZSA9IG1lbW9pemUoIDxTdXBlclR5cGUgZXh0ZW5kcyBDb25zdHJ1Y3Rvcj4oIFR5cGU6IFN1cGVyVHlwZSApOiBTdXBlclR5cGUgJiBDb25zdHJ1Y3RvcjxUTWFyZ2luTGF5b3V0Q29uZmlndXJhYmxlPiA9PiB7XG4gIHJldHVybiBjbGFzcyBNYXJnaW5MYXlvdXRDb25maWd1cmFibGVNaXhpbiBleHRlbmRzIFR5cGUgaW1wbGVtZW50cyBUTWFyZ2luTGF5b3V0Q29uZmlndXJhYmxlIHtcblxuICAgIC8vIChzY2VuZXJ5LWludGVybmFsKVxuICAgIHB1YmxpYyBfbGVmdE1hcmdpbjogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gICAgcHVibGljIF9yaWdodE1hcmdpbjogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gICAgcHVibGljIF90b3BNYXJnaW46IG51bWJlciB8IG51bGwgPSBudWxsO1xuICAgIHB1YmxpYyBfYm90dG9tTWFyZ2luOiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgICBwdWJsaWMgX21pbkNvbnRlbnRXaWR0aDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gICAgcHVibGljIF9taW5Db250ZW50SGVpZ2h0OiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgICBwdWJsaWMgX21heENvbnRlbnRXaWR0aDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gICAgcHVibGljIF9tYXhDb250ZW50SGVpZ2h0OiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICAgIHB1YmxpYyByZWFkb25seSBjaGFuZ2VkRW1pdHRlcjogVEVtaXR0ZXIgPSBuZXcgVGlueUVtaXR0ZXIoKTtcblxuICAgIC8qKlxuICAgICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgICAqL1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvciggLi4uYXJnczogSW50ZW50aW9uYWxBbnlbXSApIHtcbiAgICAgIHN1cGVyKCAuLi5hcmdzICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAgICovXG4gICAgcHVibGljIG11dGF0ZUNvbmZpZ3VyYWJsZSggb3B0aW9ucz86IE1hcmdpbkxheW91dENvbmZpZ3VyYWJsZU9wdGlvbnMgKTogdm9pZCB7XG4gICAgICBhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMoIG9wdGlvbnMsIFsgJ21hcmdpbicgXSwgWyAneE1hcmdpbicsICd5TWFyZ2luJyBdICk7XG4gICAgICBhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMoIG9wdGlvbnMsIFsgJ3hNYXJnaW4nIF0sIFsgJ2xlZnRNYXJnaW4nLCAncmlnaHRNYXJnaW4nIF0gKTtcbiAgICAgIGFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyggb3B0aW9ucywgWyAneU1hcmdpbicgXSwgWyAndG9wTWFyZ2luJywgJ2JvdHRvbU1hcmdpbicgXSApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlc2V0cyB2YWx1ZXMgdG8gdGhlIFwiYmFzZVwiIHN0YXRlLlxuICAgICAqXG4gICAgICogVGhpcyBpcyB0aGUgZmFsbGJhY2sgc3RhdGUgZm9yIGEgY29uc3RyYWludCB3aGVyZSBldmVyeSB2YWx1ZSBpcyBkZWZpbmVkIGFuZCB2YWxpZC4gSWYgYSBjZWxsIGRvZXMgbm90IGhhdmUgYVxuICAgICAqIHNwZWNpZmljIFwib3ZlcnJpZGRlblwiIHZhbHVlLCBvciBhIGNvbnN0cmFpbnQgZG9lc24ndCBoYXZlIGFuIFwib3ZlcnJpZGRlblwiIHZhbHVlLCB0aGVuIGl0IHdpbGwgdGFrZSB0aGUgdmFsdWVcbiAgICAgKiBkZWZpbmVkIGhlcmUuXG4gICAgICpcbiAgICAgKiBUaGVzZSBzaG91bGQgYmUgdGhlIGRlZmF1bHQgdmFsdWVzIGZvciBjb25zdHJhaW50cy5cbiAgICAgKlxuICAgICAqIE5PVEU6IG1pbi9tYXggY29udGVudCB3aWR0aC9oZWlnaHQgYXJlIG51bGwgaGVyZSAoc2luY2UgbnVsbCBpcyBhIHZhbGlkIGRlZmF1bHQsIGFuZCBkb2Vzbid0IGluZGljYXRlIGFuXG4gICAgICogXCJpbmhlcml0XCIgdmFsdWUgbGlrZSB0aGUgb3RoZXIgdHlwZXMpLlxuICAgICAqXG4gICAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAgICovXG4gICAgcHVibGljIHNldENvbmZpZ1RvQmFzZURlZmF1bHQoKTogdm9pZCB7XG4gICAgICB0aGlzLl9sZWZ0TWFyZ2luID0gMDtcbiAgICAgIHRoaXMuX3JpZ2h0TWFyZ2luID0gMDtcbiAgICAgIHRoaXMuX3RvcE1hcmdpbiA9IDA7XG4gICAgICB0aGlzLl9ib3R0b21NYXJnaW4gPSAwO1xuICAgICAgdGhpcy5fbWluQ29udGVudFdpZHRoID0gbnVsbDtcbiAgICAgIHRoaXMuX21pbkNvbnRlbnRIZWlnaHQgPSBudWxsO1xuICAgICAgdGhpcy5fbWF4Q29udGVudFdpZHRoID0gbnVsbDtcbiAgICAgIHRoaXMuX21heENvbnRlbnRIZWlnaHQgPSBudWxsO1xuXG4gICAgICB0aGlzLmNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXNldHMgdmFsdWVzIHRvIHRoZSBcImRvbid0IG92ZXJyaWRlIGFueXRoaW5nLCBvbmx5IGluaGVyaXQgZnJvbSB0aGUgY29uc3RyYWludFwiIHN0YXRlXG4gICAgICpcbiAgICAgKiBUaGVzZSBzaG91bGQgYmUgdGhlIGRlZmF1bHQgdmFsdWVzIGZvciBjZWxscyAoZS5nLiBcInRha2UgYWxsIHRoZSBiZWhhdmlvciBmcm9tIHRoZSBjb25zdHJhaW50LCBub3RoaW5nIGlzXG4gICAgICogb3ZlcnJpZGRlblwiKS5cbiAgICAgKlxuICAgICAqIE5PVEU6IElmIGlnbm9yZU9wdGlvbnMgaXMgcHJvdmlkZWQsIHdlIHdpbGwgb21pdCBzZXR0aW5nIGFueSB2YWx1ZXMgZm9yIGtleXMgdGhhdCBhcmUgZGVmaW5lZCBpbiB0aGUgaWdub3JlT3B0aW9ucy5cbiAgICAgKiBUaGlzIGFsbG93cyB1cyB0byBhdm9pZCByZXNldHRpbmcgdmFsdWVzIHRoYXQgd2UgYXJlIGp1c3QgYWJvdXQgdG8gc2V0IHRvIGFub3RoZXIgdmFsdWUuXG4gICAgICpcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0Q29uZmlnVG9Jbmhlcml0KCBpZ25vcmVPcHRpb25zPzogTWFyZ2luTGF5b3V0Q29uZmlndXJhYmxlT3B0aW9ucyApOiB2b2lkIHtcbiAgICAgIGlmICggIWlnbm9yZU9wdGlvbnMgfHwgaWdub3JlT3B0aW9ucy5sZWZ0TWFyZ2luID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIHRoaXMuX2xlZnRNYXJnaW4gPSBudWxsO1xuICAgICAgfVxuICAgICAgaWYgKCAhaWdub3JlT3B0aW9ucyB8fCBpZ25vcmVPcHRpb25zLnJpZ2h0TWFyZ2luID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIHRoaXMuX3JpZ2h0TWFyZ2luID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICggIWlnbm9yZU9wdGlvbnMgfHwgaWdub3JlT3B0aW9ucy50b3BNYXJnaW4gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgdGhpcy5fdG9wTWFyZ2luID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICggIWlnbm9yZU9wdGlvbnMgfHwgaWdub3JlT3B0aW9ucy5ib3R0b21NYXJnaW4gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgdGhpcy5fYm90dG9tTWFyZ2luID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICggIWlnbm9yZU9wdGlvbnMgfHwgaWdub3JlT3B0aW9ucy5taW5Db250ZW50V2lkdGggPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgdGhpcy5fbWluQ29udGVudFdpZHRoID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICggIWlnbm9yZU9wdGlvbnMgfHwgaWdub3JlT3B0aW9ucy5taW5Db250ZW50SGVpZ2h0ID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIHRoaXMuX21pbkNvbnRlbnRIZWlnaHQgPSBudWxsO1xuICAgICAgfVxuICAgICAgaWYgKCAhaWdub3JlT3B0aW9ucyB8fCBpZ25vcmVPcHRpb25zLm1heENvbnRlbnRXaWR0aCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICB0aGlzLl9tYXhDb250ZW50V2lkdGggPSBudWxsO1xuICAgICAgfVxuICAgICAgaWYgKCAhaWdub3JlT3B0aW9ucyB8fCBpZ25vcmVPcHRpb25zLm1heENvbnRlbnRIZWlnaHQgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgdGhpcy5fbWF4Q29udGVudEhlaWdodCA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgbGVmdE1hcmdpbigpOiBudW1iZXIgfCBudWxsIHtcbiAgICAgIHJldHVybiB0aGlzLl9sZWZ0TWFyZ2luO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgbGVmdE1hcmdpbiggdmFsdWU6IG51bWJlciB8IG51bGwgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2YWx1ZSA9PT0gbnVsbCB8fCAoIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIHZhbHVlICkgKSApO1xuXG4gICAgICBpZiAoIHRoaXMuX2xlZnRNYXJnaW4gIT09IHZhbHVlICkge1xuICAgICAgICB0aGlzLl9sZWZ0TWFyZ2luID0gdmFsdWU7XG5cbiAgICAgICAgdGhpcy5jaGFuZ2VkRW1pdHRlci5lbWl0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAgICovXG4gICAgcHVibGljIGdldCByaWdodE1hcmdpbigpOiBudW1iZXIgfCBudWxsIHtcbiAgICAgIHJldHVybiB0aGlzLl9yaWdodE1hcmdpbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IHJpZ2h0TWFyZ2luKCB2YWx1ZTogbnVtYmVyIHwgbnVsbCApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHZhbHVlID09PSBudWxsIHx8ICggdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggdmFsdWUgKSApICk7XG5cbiAgICAgIGlmICggdGhpcy5fcmlnaHRNYXJnaW4gIT09IHZhbHVlICkge1xuICAgICAgICB0aGlzLl9yaWdodE1hcmdpbiA9IHZhbHVlO1xuXG4gICAgICAgIHRoaXMuY2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgdG9wTWFyZ2luKCk6IG51bWJlciB8IG51bGwge1xuICAgICAgcmV0dXJuIHRoaXMuX3RvcE1hcmdpbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IHRvcE1hcmdpbiggdmFsdWU6IG51bWJlciB8IG51bGwgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2YWx1ZSA9PT0gbnVsbCB8fCAoIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIHZhbHVlICkgKSApO1xuXG4gICAgICBpZiAoIHRoaXMuX3RvcE1hcmdpbiAhPT0gdmFsdWUgKSB7XG4gICAgICAgIHRoaXMuX3RvcE1hcmdpbiA9IHZhbHVlO1xuXG4gICAgICAgIHRoaXMuY2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgYm90dG9tTWFyZ2luKCk6IG51bWJlciB8IG51bGwge1xuICAgICAgcmV0dXJuIHRoaXMuX2JvdHRvbU1hcmdpbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IGJvdHRvbU1hcmdpbiggdmFsdWU6IG51bWJlciB8IG51bGwgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2YWx1ZSA9PT0gbnVsbCB8fCAoIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIHZhbHVlICkgKSApO1xuXG4gICAgICBpZiAoIHRoaXMuX2JvdHRvbU1hcmdpbiAhPT0gdmFsdWUgKSB7XG4gICAgICAgIHRoaXMuX2JvdHRvbU1hcmdpbiA9IHZhbHVlO1xuXG4gICAgICAgIHRoaXMuY2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgeE1hcmdpbigpOiBudW1iZXIgfCBudWxsIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2xlZnRNYXJnaW4gPT09IHRoaXMuX3JpZ2h0TWFyZ2luICk7XG5cbiAgICAgIHJldHVybiB0aGlzLl9sZWZ0TWFyZ2luO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgeE1hcmdpbiggdmFsdWU6IG51bWJlciB8IG51bGwgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2YWx1ZSA9PT0gbnVsbCB8fCAoIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIHZhbHVlICkgKSApO1xuXG4gICAgICBpZiAoIHRoaXMuX2xlZnRNYXJnaW4gIT09IHZhbHVlIHx8IHRoaXMuX3JpZ2h0TWFyZ2luICE9PSB2YWx1ZSApIHtcbiAgICAgICAgdGhpcy5fbGVmdE1hcmdpbiA9IHZhbHVlO1xuICAgICAgICB0aGlzLl9yaWdodE1hcmdpbiA9IHZhbHVlO1xuXG4gICAgICAgIHRoaXMuY2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgeU1hcmdpbigpOiBudW1iZXIgfCBudWxsIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3RvcE1hcmdpbiA9PT0gdGhpcy5fYm90dG9tTWFyZ2luICk7XG5cbiAgICAgIHJldHVybiB0aGlzLl90b3BNYXJnaW47XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAgICovXG4gICAgcHVibGljIHNldCB5TWFyZ2luKCB2YWx1ZTogbnVtYmVyIHwgbnVsbCApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHZhbHVlID09PSBudWxsIHx8ICggdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggdmFsdWUgKSApICk7XG5cbiAgICAgIGlmICggdGhpcy5fdG9wTWFyZ2luICE9PSB2YWx1ZSB8fCB0aGlzLl9ib3R0b21NYXJnaW4gIT09IHZhbHVlICkge1xuICAgICAgICB0aGlzLl90b3BNYXJnaW4gPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5fYm90dG9tTWFyZ2luID0gdmFsdWU7XG5cbiAgICAgICAgdGhpcy5jaGFuZ2VkRW1pdHRlci5lbWl0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAgICovXG4gICAgcHVibGljIGdldCBtYXJnaW4oKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KFxuICAgICAgdGhpcy5fbGVmdE1hcmdpbiA9PT0gdGhpcy5fcmlnaHRNYXJnaW4gJiZcbiAgICAgIHRoaXMuX2xlZnRNYXJnaW4gPT09IHRoaXMuX3RvcE1hcmdpbiAmJlxuICAgICAgdGhpcy5fbGVmdE1hcmdpbiA9PT0gdGhpcy5fYm90dG9tTWFyZ2luXG4gICAgICApO1xuXG4gICAgICByZXR1cm4gdGhpcy5fdG9wTWFyZ2luO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgbWFyZ2luKCB2YWx1ZTogbnVtYmVyIHwgbnVsbCApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHZhbHVlID09PSBudWxsIHx8ICggdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggdmFsdWUgKSApICk7XG5cbiAgICAgIGlmICggdGhpcy5fbGVmdE1hcmdpbiAhPT0gdmFsdWUgfHwgdGhpcy5fcmlnaHRNYXJnaW4gIT09IHZhbHVlIHx8IHRoaXMuX3RvcE1hcmdpbiAhPT0gdmFsdWUgfHwgdGhpcy5fYm90dG9tTWFyZ2luICE9PSB2YWx1ZSApIHtcbiAgICAgICAgdGhpcy5fbGVmdE1hcmdpbiA9IHZhbHVlO1xuICAgICAgICB0aGlzLl9yaWdodE1hcmdpbiA9IHZhbHVlO1xuICAgICAgICB0aGlzLl90b3BNYXJnaW4gPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5fYm90dG9tTWFyZ2luID0gdmFsdWU7XG5cbiAgICAgICAgdGhpcy5jaGFuZ2VkRW1pdHRlci5lbWl0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAgICovXG4gICAgcHVibGljIGdldCBtaW5Db250ZW50V2lkdGgoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgICByZXR1cm4gdGhpcy5fbWluQ29udGVudFdpZHRoO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgbWluQ29udGVudFdpZHRoKCB2YWx1ZTogbnVtYmVyIHwgbnVsbCApIHtcbiAgICAgIGlmICggdGhpcy5fbWluQ29udGVudFdpZHRoICE9PSB2YWx1ZSApIHtcbiAgICAgICAgdGhpcy5fbWluQ29udGVudFdpZHRoID0gdmFsdWU7XG5cbiAgICAgICAgdGhpcy5jaGFuZ2VkRW1pdHRlci5lbWl0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAgICovXG4gICAgcHVibGljIGdldCBtaW5Db250ZW50SGVpZ2h0KCk6IG51bWJlciB8IG51bGwge1xuICAgICAgcmV0dXJuIHRoaXMuX21pbkNvbnRlbnRIZWlnaHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAgICovXG4gICAgcHVibGljIHNldCBtaW5Db250ZW50SGVpZ2h0KCB2YWx1ZTogbnVtYmVyIHwgbnVsbCApIHtcbiAgICAgIGlmICggdGhpcy5fbWluQ29udGVudEhlaWdodCAhPT0gdmFsdWUgKSB7XG4gICAgICAgIHRoaXMuX21pbkNvbnRlbnRIZWlnaHQgPSB2YWx1ZTtcblxuICAgICAgICB0aGlzLmNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IG1heENvbnRlbnRXaWR0aCgpOiBudW1iZXIgfCBudWxsIHtcbiAgICAgIHJldHVybiB0aGlzLl9tYXhDb250ZW50V2lkdGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAgICovXG4gICAgcHVibGljIHNldCBtYXhDb250ZW50V2lkdGgoIHZhbHVlOiBudW1iZXIgfCBudWxsICkge1xuICAgICAgaWYgKCB0aGlzLl9tYXhDb250ZW50V2lkdGggIT09IHZhbHVlICkge1xuICAgICAgICB0aGlzLl9tYXhDb250ZW50V2lkdGggPSB2YWx1ZTtcblxuICAgICAgICB0aGlzLmNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IG1heENvbnRlbnRIZWlnaHQoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgICByZXR1cm4gdGhpcy5fbWF4Q29udGVudEhlaWdodDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IG1heENvbnRlbnRIZWlnaHQoIHZhbHVlOiBudW1iZXIgfCBudWxsICkge1xuICAgICAgaWYgKCB0aGlzLl9tYXhDb250ZW50SGVpZ2h0ICE9PSB2YWx1ZSApIHtcbiAgICAgICAgdGhpcy5fbWF4Q29udGVudEhlaWdodCA9IHZhbHVlO1xuXG4gICAgICAgIHRoaXMuY2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn0gKTtcblxuc2NlbmVyeS5yZWdpc3RlciggJ01hcmdpbkxheW91dENvbmZpZ3VyYWJsZScsIE1hcmdpbkxheW91dENvbmZpZ3VyYWJsZSApO1xuXG5leHBvcnQgZGVmYXVsdCBNYXJnaW5MYXlvdXRDb25maWd1cmFibGU7XG5leHBvcnQgeyBNQVJHSU5fTEFZT1VUX0NPTkZJR1VSQUJMRV9PUFRJT05fS0VZUyB9OyJdLCJuYW1lcyI6WyJUaW55RW1pdHRlciIsImFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyIsIm1lbW9pemUiLCJzY2VuZXJ5IiwiTUFSR0lOX0xBWU9VVF9DT05GSUdVUkFCTEVfT1BUSU9OX0tFWVMiLCJNYXJnaW5MYXlvdXRDb25maWd1cmFibGUiLCJUeXBlIiwiTWFyZ2luTGF5b3V0Q29uZmlndXJhYmxlTWl4aW4iLCJtdXRhdGVDb25maWd1cmFibGUiLCJvcHRpb25zIiwic2V0Q29uZmlnVG9CYXNlRGVmYXVsdCIsIl9sZWZ0TWFyZ2luIiwiX3JpZ2h0TWFyZ2luIiwiX3RvcE1hcmdpbiIsIl9ib3R0b21NYXJnaW4iLCJfbWluQ29udGVudFdpZHRoIiwiX21pbkNvbnRlbnRIZWlnaHQiLCJfbWF4Q29udGVudFdpZHRoIiwiX21heENvbnRlbnRIZWlnaHQiLCJjaGFuZ2VkRW1pdHRlciIsImVtaXQiLCJzZXRDb25maWdUb0luaGVyaXQiLCJpZ25vcmVPcHRpb25zIiwibGVmdE1hcmdpbiIsInVuZGVmaW5lZCIsInJpZ2h0TWFyZ2luIiwidG9wTWFyZ2luIiwiYm90dG9tTWFyZ2luIiwibWluQ29udGVudFdpZHRoIiwibWluQ29udGVudEhlaWdodCIsIm1heENvbnRlbnRXaWR0aCIsIm1heENvbnRlbnRIZWlnaHQiLCJ2YWx1ZSIsImFzc2VydCIsImlzRmluaXRlIiwieE1hcmdpbiIsInlNYXJnaW4iLCJtYXJnaW4iLCJhcmdzIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7OztDQWFDLEdBR0QsT0FBT0EsaUJBQWlCLHFDQUFxQztBQUM3RCxPQUFPQyxvQ0FBb0MsNkRBQTZEO0FBQ3hHLE9BQU9DLGFBQWEsc0NBQXNDO0FBSTFELFNBQVNDLE9BQU8sUUFBUSxtQkFBbUI7QUFFM0MsTUFBTUMseUNBQXlDO0lBQzdDO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7Q0FDRDtBQTBERCxxQkFBcUI7QUFDckIsTUFBTUMsMkJBQTJCSCxRQUFTLENBQWlDSTtJQUN6RSxPQUFPLE1BQU1DLHNDQUFzQ0Q7UUFxQmpEOztLQUVDLEdBQ0QsQUFBT0UsbUJBQW9CQyxPQUF5QyxFQUFTO1lBQzNFUiwrQkFBZ0NRLFNBQVM7Z0JBQUU7YUFBVSxFQUFFO2dCQUFFO2dCQUFXO2FBQVc7WUFDL0VSLCtCQUFnQ1EsU0FBUztnQkFBRTthQUFXLEVBQUU7Z0JBQUU7Z0JBQWM7YUFBZTtZQUN2RlIsK0JBQWdDUSxTQUFTO2dCQUFFO2FBQVcsRUFBRTtnQkFBRTtnQkFBYTthQUFnQjtRQUN6RjtRQUVBOzs7Ozs7Ozs7Ozs7O0tBYUMsR0FDRCxBQUFPQyx5QkFBK0I7WUFDcEMsSUFBSSxDQUFDQyxXQUFXLEdBQUc7WUFDbkIsSUFBSSxDQUFDQyxZQUFZLEdBQUc7WUFDcEIsSUFBSSxDQUFDQyxVQUFVLEdBQUc7WUFDbEIsSUFB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