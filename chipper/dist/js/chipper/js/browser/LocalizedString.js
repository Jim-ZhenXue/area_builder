// Copyright 2022-2024, University of Colorado Boulder
/**
 * Sets up a system of Properties to handle translation fallback and phet-io support for a single translated string.
 *
 * @author Jonathan Olson <jonathan.olson>
 */ import TinyProperty from '../../../axon/js/TinyProperty.js';
import localeProperty from '../../../joist/js/i18n/localeProperty.js';
import arrayRemove from '../../../phet-core/js/arrayRemove.js';
import chipper from './chipper.js';
import { localizedStrings } from './getStringModule.js';
import LocalizedStringProperty from './LocalizedStringProperty.js';
// constants
const FALLBACK_LOCALE = 'en';
const localeData = phet.chipper.localeData;
assert && assert(localeData, 'localeData expected but global has not been set');
let LocalizedString = class LocalizedString {
    /**
   * Returns an object that shows the changes of strings from their initial values. This includes whether strings are
   * marked as "overridden"
   */ getStateDelta() {
        const result = {};
        this.usedLocales.forEach((locale)=>{
            const initialValue = this.initialValues[locale];
            const currentValue = this.getLocaleSpecificProperty(locale).value;
            if (currentValue !== initialValue) {
                result[locale] = currentValue;
            }
        });
        return result;
    }
    /**
   * Take a state from getStateDelta, and apply it.
   */ setStateDelta(state) {
        // Create potential new locales (since locale-specific Properties are lazily created as needed
        Object.keys(state).forEach((locale)=>this.getLocaleSpecificProperty(locale));
        this.usedLocales.forEach((locale)=>{
            const localeSpecificProperty = this.getLocaleSpecificProperty(locale);
            const initialValue = this.initialValues[locale];
            assert && assert(initialValue !== undefined);
            const stateValue = state[locale] !== undefined ? state[locale] : null;
            localeSpecificProperty.value = stateValue != null ? stateValue : initialValue;
        });
    }
    get usedLocales() {
        return [
            ...this.localePropertyMap.keys()
        ];
    }
    /**
   * Returns the locale-specific Property for any locale (lazily creating it if necessary)
   */ getLocaleSpecificProperty(locale) {
        // Lazy creation
        if (!this.localePropertyMap.has(locale)) {
            // Locales in order of fallback
            const orderedLocales = LocalizedString.getLocaleFallbacks(locale);
            // Find the first-defined value
            let initialValue = null;
            for (const locale of orderedLocales){
                if (this.localeToTranslationMap[locale] !== undefined) {
                    initialValue = this.localeToTranslationMap[locale];
                    break;
                }
            }
            // Should be guaranteed because of `en` as a fallback
            assert && assert(initialValue !== undefined, 'no initial value found for', locale);
            this.initialValues[locale] = initialValue;
            this.localePropertyMap.set(locale, new TinyProperty(initialValue));
        }
        return this.localePropertyMap.get(locale);
    }
    dispose() {
        this.property.dispose();
        arrayRemove(localizedStrings, this);
    }
    /**
   * Reset to the initial value for the specified locale, used for testing.
   */ restoreInitialValue(locale) {
        assert && assert(typeof this.initialValues[locale] === 'string', 'initial value expected for', locale);
        this.property.value = this.initialValues[locale];
    }
    static getLocaleFallbacks(locale = localeProperty.value) {
        return _.uniq([
            locale,
            ...localeData[locale].fallbackLocales || [],
            FALLBACK_LOCALE
        ]);
    }
    constructor(stringKey, // Store initial values, so we can handle state deltas
    localeToTranslationMap, tandem, metadata){
        this.stringKey = stringKey;
        this.localeToTranslationMap = localeToTranslationMap;
        this.localePropertyMap = new Map();
        this.initialValues = {};
        this.property = new LocalizedStringProperty(this, tandem, metadata);
        // Add to a global list to support PhET-iO serialization and internal testing
        localizedStrings.push(this);
    }
};
chipper.register('LocalizedString', LocalizedString);
export default LocalizedString;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2Jyb3dzZXIvTG9jYWxpemVkU3RyaW5nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFNldHMgdXAgYSBzeXN0ZW0gb2YgUHJvcGVydGllcyB0byBoYW5kbGUgdHJhbnNsYXRpb24gZmFsbGJhY2sgYW5kIHBoZXQtaW8gc3VwcG9ydCBmb3IgYSBzaW5nbGUgdHJhbnNsYXRlZCBzdHJpbmcuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb24+XG4gKi9cblxuaW1wb3J0IFRpbnlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RpbnlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFByb3BlcnR5LmpzJztcbmltcG9ydCBsb2NhbGVQcm9wZXJ0eSwgeyBMb2NhbGUgfSBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9pMThuL2xvY2FsZVByb3BlcnR5LmpzJztcbmltcG9ydCBhcnJheVJlbW92ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvYXJyYXlSZW1vdmUuanMnO1xuaW1wb3J0IHsgUGhldGlvSUQgfSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvcGhldC1pby10eXBlcy5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IGNoaXBwZXIgZnJvbSAnLi9jaGlwcGVyLmpzJztcbmltcG9ydCB7IGxvY2FsaXplZFN0cmluZ3MgfSBmcm9tICcuL2dldFN0cmluZ01vZHVsZS5qcyc7XG5pbXBvcnQgTG9jYWxpemVkU3RyaW5nUHJvcGVydHkgZnJvbSAnLi9Mb2NhbGl6ZWRTdHJpbmdQcm9wZXJ0eS5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgRkFMTEJBQ0tfTE9DQUxFID0gJ2VuJztcblxuLy8gZm9yIHJlYWRhYmlsaXR5L2RvY3NcbnR5cGUgVHJhbnNsYXRpb25TdHJpbmcgPSBzdHJpbmc7XG5leHBvcnQgdHlwZSBMb2NhbGl6ZWRTdHJpbmdTdGF0ZURlbHRhID0gUGFydGlhbDxSZWNvcmQ8TG9jYWxlLCBUcmFuc2xhdGlvblN0cmluZz4+O1xuXG4vLyBXaGVyZSBcInN0cmluZ1wiIGlzIGEgcGhldGlvSURcbmV4cG9ydCB0eXBlIFN0cmluZ3NTdGF0ZVN0YXRlT2JqZWN0ID0geyBkYXRhOiBSZWNvcmQ8UGhldGlvSUQsIExvY2FsaXplZFN0cmluZ1N0YXRlRGVsdGE+IH07XG5cbmNvbnN0IGxvY2FsZURhdGEgPSBwaGV0LmNoaXBwZXIubG9jYWxlRGF0YTtcbmFzc2VydCAmJiBhc3NlcnQoIGxvY2FsZURhdGEsICdsb2NhbGVEYXRhIGV4cGVjdGVkIGJ1dCBnbG9iYWwgaGFzIG5vdCBiZWVuIHNldCcgKTtcblxuY2xhc3MgTG9jYWxpemVkU3RyaW5nIHtcblxuICAvLyBQdWJsaWMtZmFjaW5nIElQcm9wZXJ0eTxzdHJpbmc+LCB1c2VkIGJ5IHN0cmluZyBtb2R1bGVzXG4gIHB1YmxpYyByZWFkb25seSBwcm9wZXJ0eTogTG9jYWxpemVkU3RyaW5nUHJvcGVydHk7XG5cbiAgLy8gVXNlcyBsYXp5IGNyZWF0aW9uIG9mIGxvY2FsZXNcbiAgcHJpdmF0ZSByZWFkb25seSBsb2NhbGVQcm9wZXJ0eU1hcCA9IG5ldyBNYXA8TG9jYWxlLCBUaW55UHJvcGVydHk8VHJhbnNsYXRpb25TdHJpbmc+PigpO1xuXG4gIC8vIFN0b3JlIGluaXRpYWwgdmFsdWVzLCBzbyB3ZSBjYW4gaGFuZGxlIHN0YXRlIGRlbHRhc1xuICBwcml2YXRlIHJlYWRvbmx5IGluaXRpYWxWYWx1ZXM6IExvY2FsaXplZFN0cmluZ1N0YXRlRGVsdGEgPSB7fTtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHJlYWRvbmx5IHN0cmluZ0tleTogc3RyaW5nLFxuICAgIC8vIFN0b3JlIGluaXRpYWwgdmFsdWVzLCBzbyB3ZSBjYW4gaGFuZGxlIHN0YXRlIGRlbHRhc1xuICAgIHByaXZhdGUgcmVhZG9ubHkgbG9jYWxlVG9UcmFuc2xhdGlvbk1hcDogTG9jYWxpemVkU3RyaW5nU3RhdGVEZWx0YSxcbiAgICB0YW5kZW06IFRhbmRlbSxcbiAgICBtZXRhZGF0YT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+XG4gICkge1xuICAgIHRoaXMucHJvcGVydHkgPSBuZXcgTG9jYWxpemVkU3RyaW5nUHJvcGVydHkoIHRoaXMsIHRhbmRlbSwgbWV0YWRhdGEgKTtcblxuICAgIC8vIEFkZCB0byBhIGdsb2JhbCBsaXN0IHRvIHN1cHBvcnQgUGhFVC1pTyBzZXJpYWxpemF0aW9uIGFuZCBpbnRlcm5hbCB0ZXN0aW5nXG4gICAgbG9jYWxpemVkU3RyaW5ncy5wdXNoKCB0aGlzICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCBzaG93cyB0aGUgY2hhbmdlcyBvZiBzdHJpbmdzIGZyb20gdGhlaXIgaW5pdGlhbCB2YWx1ZXMuIFRoaXMgaW5jbHVkZXMgd2hldGhlciBzdHJpbmdzIGFyZVxuICAgKiBtYXJrZWQgYXMgXCJvdmVycmlkZGVuXCJcbiAgICovXG4gIHB1YmxpYyBnZXRTdGF0ZURlbHRhKCk6IExvY2FsaXplZFN0cmluZ1N0YXRlRGVsdGEge1xuICAgIGNvbnN0IHJlc3VsdDogTG9jYWxpemVkU3RyaW5nU3RhdGVEZWx0YSA9IHt9O1xuXG4gICAgdGhpcy51c2VkTG9jYWxlcy5mb3JFYWNoKCBsb2NhbGUgPT4ge1xuICAgICAgY29uc3QgaW5pdGlhbFZhbHVlOiBzdHJpbmcgPSB0aGlzLmluaXRpYWxWYWx1ZXNbIGxvY2FsZSBdITtcbiAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IHRoaXMuZ2V0TG9jYWxlU3BlY2lmaWNQcm9wZXJ0eSggbG9jYWxlICkudmFsdWU7XG5cbiAgICAgIGlmICggY3VycmVudFZhbHVlICE9PSBpbml0aWFsVmFsdWUgKSB7XG4gICAgICAgIHJlc3VsdFsgbG9jYWxlIF0gPSBjdXJyZW50VmFsdWU7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlIGEgc3RhdGUgZnJvbSBnZXRTdGF0ZURlbHRhLCBhbmQgYXBwbHkgaXQuXG4gICAqL1xuICBwdWJsaWMgc2V0U3RhdGVEZWx0YSggc3RhdGU6IExvY2FsaXplZFN0cmluZ1N0YXRlRGVsdGEgKTogdm9pZCB7XG5cbiAgICAvLyBDcmVhdGUgcG90ZW50aWFsIG5ldyBsb2NhbGVzIChzaW5jZSBsb2NhbGUtc3BlY2lmaWMgUHJvcGVydGllcyBhcmUgbGF6aWx5IGNyZWF0ZWQgYXMgbmVlZGVkXG4gICAgT2JqZWN0LmtleXMoIHN0YXRlICkuZm9yRWFjaCggbG9jYWxlID0+IHRoaXMuZ2V0TG9jYWxlU3BlY2lmaWNQcm9wZXJ0eSggbG9jYWxlIGFzIExvY2FsZSApICk7XG5cbiAgICB0aGlzLnVzZWRMb2NhbGVzLmZvckVhY2goIGxvY2FsZSA9PiB7XG4gICAgICBjb25zdCBsb2NhbGVTcGVjaWZpY1Byb3BlcnR5ID0gdGhpcy5nZXRMb2NhbGVTcGVjaWZpY1Byb3BlcnR5KCBsb2NhbGUgKTtcbiAgICAgIGNvbnN0IGluaXRpYWxWYWx1ZTogc3RyaW5nID0gdGhpcy5pbml0aWFsVmFsdWVzWyBsb2NhbGUgXSE7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbml0aWFsVmFsdWUgIT09IHVuZGVmaW5lZCApO1xuXG4gICAgICBjb25zdCBzdGF0ZVZhbHVlOiBzdHJpbmcgfCBudWxsID0gc3RhdGVbIGxvY2FsZSBdICE9PSB1bmRlZmluZWQgPyBzdGF0ZVsgbG9jYWxlIF0gOiBudWxsO1xuXG4gICAgICBsb2NhbGVTcGVjaWZpY1Byb3BlcnR5LnZhbHVlID0gc3RhdGVWYWx1ZSA/PyBpbml0aWFsVmFsdWU7XG4gICAgfSApO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgdXNlZExvY2FsZXMoKTogTG9jYWxlW10ge1xuICAgIHJldHVybiBbIC4uLnRoaXMubG9jYWxlUHJvcGVydHlNYXAua2V5cygpIF07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbG9jYWxlLXNwZWNpZmljIFByb3BlcnR5IGZvciBhbnkgbG9jYWxlIChsYXppbHkgY3JlYXRpbmcgaXQgaWYgbmVjZXNzYXJ5KVxuICAgKi9cbiAgcHVibGljIGdldExvY2FsZVNwZWNpZmljUHJvcGVydHkoIGxvY2FsZTogTG9jYWxlICk6IFRQcm9wZXJ0eTxzdHJpbmc+IHtcbiAgICAvLyBMYXp5IGNyZWF0aW9uXG4gICAgaWYgKCAhdGhpcy5sb2NhbGVQcm9wZXJ0eU1hcC5oYXMoIGxvY2FsZSApICkge1xuICAgICAgLy8gTG9jYWxlcyBpbiBvcmRlciBvZiBmYWxsYmFja1xuICAgICAgY29uc3Qgb3JkZXJlZExvY2FsZXMgPSBMb2NhbGl6ZWRTdHJpbmcuZ2V0TG9jYWxlRmFsbGJhY2tzKCBsb2NhbGUgKTtcblxuICAgICAgLy8gRmluZCB0aGUgZmlyc3QtZGVmaW5lZCB2YWx1ZVxuICAgICAgbGV0IGluaXRpYWxWYWx1ZTogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gICAgICBmb3IgKCBjb25zdCBsb2NhbGUgb2Ygb3JkZXJlZExvY2FsZXMgKSB7XG4gICAgICAgIGlmICggdGhpcy5sb2NhbGVUb1RyYW5zbGF0aW9uTWFwWyBsb2NhbGUgXSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgIGluaXRpYWxWYWx1ZSA9IHRoaXMubG9jYWxlVG9UcmFuc2xhdGlvbk1hcFsgbG9jYWxlIF0hO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBTaG91bGQgYmUgZ3VhcmFudGVlZCBiZWNhdXNlIG9mIGBlbmAgYXMgYSBmYWxsYmFja1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaW5pdGlhbFZhbHVlICE9PSB1bmRlZmluZWQsICdubyBpbml0aWFsIHZhbHVlIGZvdW5kIGZvcicsIGxvY2FsZSApO1xuXG4gICAgICB0aGlzLmluaXRpYWxWYWx1ZXNbIGxvY2FsZSBdID0gaW5pdGlhbFZhbHVlITtcbiAgICAgIHRoaXMubG9jYWxlUHJvcGVydHlNYXAuc2V0KCBsb2NhbGUsIG5ldyBUaW55UHJvcGVydHkoIGluaXRpYWxWYWx1ZSEgKSApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmxvY2FsZVByb3BlcnR5TWFwLmdldCggbG9jYWxlICkhO1xuICB9XG5cbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5wcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgYXJyYXlSZW1vdmUoIGxvY2FsaXplZFN0cmluZ3MsIHRoaXMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCB0byB0aGUgaW5pdGlhbCB2YWx1ZSBmb3IgdGhlIHNwZWNpZmllZCBsb2NhbGUsIHVzZWQgZm9yIHRlc3RpbmcuXG4gICAqL1xuICBwdWJsaWMgcmVzdG9yZUluaXRpYWxWYWx1ZSggbG9jYWxlOiBMb2NhbGUgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHRoaXMuaW5pdGlhbFZhbHVlc1sgbG9jYWxlIF0gPT09ICdzdHJpbmcnLCAnaW5pdGlhbCB2YWx1ZSBleHBlY3RlZCBmb3InLCBsb2NhbGUgKTtcbiAgICB0aGlzLnByb3BlcnR5LnZhbHVlID0gdGhpcy5pbml0aWFsVmFsdWVzWyBsb2NhbGUgXSE7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGdldExvY2FsZUZhbGxiYWNrcyggbG9jYWxlOiBMb2NhbGUgPSBsb2NhbGVQcm9wZXJ0eS52YWx1ZSApOiBMb2NhbGVbXSB7XG4gICAgcmV0dXJuIF8udW5pcSggW1xuICAgICAgbG9jYWxlLFxuICAgICAgLi4uKCBsb2NhbGVEYXRhWyBsb2NhbGUgXS5mYWxsYmFja0xvY2FsZXMgfHwgW10gKSxcbiAgICAgIEZBTExCQUNLX0xPQ0FMRVxuICAgIF0gKTtcbiAgfVxufVxuXG5jaGlwcGVyLnJlZ2lzdGVyKCAnTG9jYWxpemVkU3RyaW5nJywgTG9jYWxpemVkU3RyaW5nICk7XG5cbmV4cG9ydCBkZWZhdWx0IExvY2FsaXplZFN0cmluZzsiXSwibmFtZXMiOlsiVGlueVByb3BlcnR5IiwibG9jYWxlUHJvcGVydHkiLCJhcnJheVJlbW92ZSIsImNoaXBwZXIiLCJsb2NhbGl6ZWRTdHJpbmdzIiwiTG9jYWxpemVkU3RyaW5nUHJvcGVydHkiLCJGQUxMQkFDS19MT0NBTEUiLCJsb2NhbGVEYXRhIiwicGhldCIsImFzc2VydCIsIkxvY2FsaXplZFN0cmluZyIsImdldFN0YXRlRGVsdGEiLCJyZXN1bHQiLCJ1c2VkTG9jYWxlcyIsImZvckVhY2giLCJsb2NhbGUiLCJpbml0aWFsVmFsdWUiLCJpbml0aWFsVmFsdWVzIiwiY3VycmVudFZhbHVlIiwiZ2V0TG9jYWxlU3BlY2lmaWNQcm9wZXJ0eSIsInZhbHVlIiwic2V0U3RhdGVEZWx0YSIsInN0YXRlIiwiT2JqZWN0Iiwia2V5cyIsImxvY2FsZVNwZWNpZmljUHJvcGVydHkiLCJ1bmRlZmluZWQiLCJzdGF0ZVZhbHVlIiwibG9jYWxlUHJvcGVydHlNYXAiLCJoYXMiLCJvcmRlcmVkTG9jYWxlcyIsImdldExvY2FsZUZhbGxiYWNrcyIsImxvY2FsZVRvVHJhbnNsYXRpb25NYXAiLCJzZXQiLCJnZXQiLCJkaXNwb3NlIiwicHJvcGVydHkiLCJyZXN0b3JlSW5pdGlhbFZhbHVlIiwiXyIsInVuaXEiLCJmYWxsYmFja0xvY2FsZXMiLCJzdHJpbmdLZXkiLCJ0YW5kZW0iLCJtZXRhZGF0YSIsIk1hcCIsInB1c2giLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxrQkFBa0IsbUNBQW1DO0FBRTVELE9BQU9DLG9CQUFnQywyQ0FBMkM7QUFDbEYsT0FBT0MsaUJBQWlCLHVDQUF1QztBQUcvRCxPQUFPQyxhQUFhLGVBQWU7QUFDbkMsU0FBU0MsZ0JBQWdCLFFBQVEsdUJBQXVCO0FBQ3hELE9BQU9DLDZCQUE2QiwrQkFBK0I7QUFFbkUsWUFBWTtBQUNaLE1B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