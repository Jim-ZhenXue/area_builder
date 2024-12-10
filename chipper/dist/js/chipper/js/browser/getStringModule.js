// Copyright 2020-2024, University of Colorado Boulder
/**
 * Given a requirejsNamespace, we filter out strings from phet.chipper.strings that start with it, and construct an
 * object with locale fallbacks already pre-computed, so that the correct strings can be accessed via object literal
 * access, e.g. getStringModule( 'JOIST' ).ResetAllButton.name will give the desired string value for whatever locale
 * the sim is being run with.
 *
 * A string "key" is in the form of "NAMESPACE/key.from.strings.json"
 *
 * NOTE: This file likely belongs in joist/js/i18n/, but should stay here to make maintenance-release maintainability easier.
 *
 * @author Jonathan Olson <jonathan.olson>
 */ import CouldNotYetDeserializeError from '../../../tandem/js/CouldNotYetDeserializeError.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import IOType from '../../../tandem/js/types/IOType.js';
import ObjectLiteralIO from '../../../tandem/js/types/ObjectLiteralIO.js';
import LocalizedString from './LocalizedString.js';
// constants
const FALLBACK_LOCALE = 'en';
// Holds all of our localizedStrings, so that we can save our phet-io string change state
export const localizedStrings = [];
// For developer internal use, particularly for memory leak detection
// e.g. _.max( phet.chipper.localizedStrings.map( ls => ls.property.tinyProperty.listeners.size ) ) to see if there is
// likely a leak
window.phet.chipper.localizedStrings = localizedStrings;
// For developer internal use, similar to the stringTest query parameter
window.phet.chipper.setAllStrings = (str)=>{
    localizedStrings.forEach((localizedString)=>{
        localizedString.property.value = str;
    });
};
const stringKeyToTandemName = (key)=>{
    return key.replace(/(?:[-_\s]\w)/g, (word)=>word[1].toUpperCase());
};
const StringStateIOType = new IOType('StringStateIO', {
    valueType: PhetioObject,
    toStateObject: ()=>{
        const data = {};
        localizedStrings.forEach((localizedString)=>{
            const state = localizedString.getStateDelta();
            // Only create an entry if there is anything (we can save bytes by not including the tandem here)
            if (Object.keys(state).length > 0) {
                data[localizedString.property.tandem.phetioID] = state;
            }
        });
        return {
            data: data // Data nested for a valid schema
        };
    },
    stateSchema: {
        data: ObjectLiteralIO
    },
    applyState: (ignored, state)=>{
        // Every string in state has to be in localizedStrings to continue
        Object.keys(state.data).forEach((phetioID)=>{
            const match = localizedStrings.find((localizedString)=>localizedString.property.tandem.phetioID === phetioID);
            // When PhetioDynamicElementContainer elements such as PhetioGroup members add localizedStrings, we wait until
            // all of the members have been created (populating localizedStrings) before trying to set any of the strings.
            if (!match) {
                throw new CouldNotYetDeserializeError();
            }
        });
        // We need to iterate through every string in this runtime, since it might need to revert back to "initial" state.
        localizedStrings.forEach((localizedString)=>{
            localizedString.setStateDelta(state.data[localizedString.property.tandem.phetioID] || {});
        });
    }
});
PhetioObject.create({
    phetioType: StringStateIOType,
    tandem: Tandem.GENERAL_MODEL.createTandem('stringsState'),
    phetioDocumentation: 'Strings that have changed from their initial values. Each string value is specific to the locale it changed in.',
    phetioState: true
});
/**
 * @param requirejsNamespace - E.g. 'JOIST', to pull string keys out from that namespace
 * @returns Nested object to be accessed like JoistStrings.ResetAllButton.name
 */ const getStringModule = (requirejsNamespace)=>{
    // Our string information is pulled globally, e.g. phet.chipper.strings[ locale ][ stringKey ] = stringValue;
    // Our locale information is from phet.chipper.locale
    assert && assert(typeof phet.chipper.locale === 'string', 'phet.chipper.locale should have been loaded by now');
    assert && assert(Object.keys(phet.chipper.localeData).includes(phet.chipper.locale), `phet.chipper.locale:${phet.chipper.locale} is not in localeData`);
    assert && assert(phet.chipper.strings, 'phet.chipper.strings should have been loaded by now');
    // Construct locales in increasing specificity, e.g. [ 'en', 'zh', 'zh_CN' ], so we get fallbacks in order
    // const locales = [ FALLBACK_LOCALE ];
    const stringKeyPrefix = `${requirejsNamespace}/`;
    // We may have other older (unused) keys in babel, and we are only doing the search that matters with the English
    // string keys.
    let allStringKeysInRepo = Object.keys(phet.chipper.strings[FALLBACK_LOCALE]).filter((stringKey)=>stringKey.startsWith(stringKeyPrefix));
    // TODO: https://github.com/phetsims/phet-io/issues/1877 What if this list doesn't exist?  Should that be an error?
    // Or an error if running an api-stable phet-io sim?
    // TODO: https://github.com/phetsims/phet-io/issues/1877 What will happen if this is stale? How will a developer know
    // to update it? Should it run in daily-grunt-work?
    if (phet.chipper.usedStringsEN) {
        allStringKeysInRepo = allStringKeysInRepo.filter((stringKey)=>phet.chipper.usedStringsEN.hasOwnProperty(stringKey));
    }
    // localizedStringMap[ stringKey ]
    const localizedStringMap = {};
    const stringModule = {};
    allStringKeysInRepo.forEach((stringKey)=>{
        // strip off the requirejsNamespace, e.g. 'JOIST/ResetAllButton.name' => 'ResetAllButton.name'
        const stringKeyWithoutPrefix = stringKey.slice(stringKeyPrefix.length);
        const keyParts = stringKeyWithoutPrefix.split('.');
        const lastKeyPart = keyParts[keyParts.length - 1];
        const allButLastKeyPart = keyParts.slice(0, keyParts.length - 1);
        // During traversal into the string object, this will hold the object where the next level needs to be defined,
        // whether that's another child object, or the string value itself.
        let reference = stringModule;
        // We'll traverse down through the parts of a string key (separated by '.'), creating a new level in the
        // string object for each one. This is done for all BUT the last part, since we'll want to assign the result
        // of that to a raw string value (rather than an object).
        let partialKey = stringKeyPrefix;
        allButLastKeyPart.forEach((keyPart, i)=>{
            // When concatenating each level into the final string key, we don't want to put a '.' directly after the
            // slash, because `JOIST/.ResetAllButton.name` would be invalid.
            // See https://github.com/phetsims/chipper/issues/922
            partialKey += `${i > 0 ? '.' : ''}${keyPart}`;
            // Don't allow e.g. JOIST/a and JOIST/a.b, since localeObject.a would need to be a string AND an object at the
            // same time.
            assert && assert(typeof reference[keyPart] !== 'string', 'It is not allowed to have two different string keys where one is extended by adding a period (.) at the end ' + `of the other. The string key ${partialKey} is extended by ${stringKey} in this case, and should be changed.`);
            // Create the next nested level, and move into it
            if (!reference[keyPart]) {
                reference[keyPart] = {};
            }
            reference = reference[keyPart]; // since we are on all but the last key part, it cannot be stringlike
        });
        assert && assert(typeof reference[lastKeyPart] !== 'object', 'It is not allowed to have two different string keys where one is extended by adding a period (.) at the end ' + `of the other. The string key ${stringKey} is extended by another key, something containing ${reference[lastKeyPart] && Object.keys(reference[lastKeyPart])}.`);
        assert && assert(!reference[lastKeyPart], `We should not have defined this place in the object (${stringKey}), otherwise it means a duplicated string key OR extended string key`);
        // In case our assertions are not enabled, we'll need to proceed without failing out (so we allow for the
        // extended string keys in our actual code, even though assertions should prevent that).
        if (typeof reference !== 'string') {
            let tandem = Tandem.STRINGS.createTandem(_.camelCase(requirejsNamespace));
            for(let i = 0; i < keyParts.length; i++){
                let tandemName = stringKeyToTandemName(keyParts[i]);
                // If it is the tail of the string key, then make the tandem be a "*StringProperty"
                if (i === keyParts.length - 1) {
                    let currentTandemName = tandemName;
                    let j = 0;
                    let tandemNameTaken = true;
                    // Handle the case where two unique string keys map to the same camel case value, i.e. "Solid" and "solid".
                    // Here we will be solidStringProperty and solid2StringProperty
                    while(tandemNameTaken){
                        j++;
                        currentTandemName = `${tandemName}${j === 1 ? '' : j}StringProperty`;
                        tandemNameTaken = tandem.hasChild(currentTandemName);
                    }
                    tandemName = currentTandemName;
                }
                tandem = tandem.createTandem(tandemName);
            }
            // strings nested under the a11y section are not currently PhET-iO instrumented, see https://github.com/phetsims/chipper/issues/1352
            if (tandem.phetioID.includes('.a11y.')) {
                tandem = Tandem.OPT_OUT;
            }
            const localeToTranslationMap = {};
            Object.keys(phet.chipper.strings).forEach((locale)=>{
                const string = phet.chipper.strings[locale][stringKey];
                // Ignore zero-length strings, see https://github.com/phetsims/chipper/issues/1343
                if (locale === FALLBACK_LOCALE || typeof string === 'string' && string !== '') {
                    // A11y is not translatable and should not appear mapped, see https://github.com/phetsims/tasks/issues/1133
                    localeToTranslationMap[locale] = stringKey.includes('/a11y.') ? string : phet.chipper.mapString(string);
                }
            });
            const localizedString = new LocalizedString(stringKey, localeToTranslationMap, tandem, phet.chipper.stringMetadata[stringKey]);
            localizedStringMap[stringKey] = localizedString;
            // Put our Property in the stringModule
            reference[`${lastKeyPart}StringProperty`] = localizedString.property;
            // Change our stringModule based on the Property value
            localizedString.property.link((string)=>{
                reference[lastKeyPart] = string;
            });
        }
    });
    return stringModule;
};
export default getStringModule;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2Jyb3dzZXIvZ2V0U3RyaW5nTW9kdWxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEdpdmVuIGEgcmVxdWlyZWpzTmFtZXNwYWNlLCB3ZSBmaWx0ZXIgb3V0IHN0cmluZ3MgZnJvbSBwaGV0LmNoaXBwZXIuc3RyaW5ncyB0aGF0IHN0YXJ0IHdpdGggaXQsIGFuZCBjb25zdHJ1Y3QgYW5cbiAqIG9iamVjdCB3aXRoIGxvY2FsZSBmYWxsYmFja3MgYWxyZWFkeSBwcmUtY29tcHV0ZWQsIHNvIHRoYXQgdGhlIGNvcnJlY3Qgc3RyaW5ncyBjYW4gYmUgYWNjZXNzZWQgdmlhIG9iamVjdCBsaXRlcmFsXG4gKiBhY2Nlc3MsIGUuZy4gZ2V0U3RyaW5nTW9kdWxlKCAnSk9JU1QnICkuUmVzZXRBbGxCdXR0b24ubmFtZSB3aWxsIGdpdmUgdGhlIGRlc2lyZWQgc3RyaW5nIHZhbHVlIGZvciB3aGF0ZXZlciBsb2NhbGVcbiAqIHRoZSBzaW0gaXMgYmVpbmcgcnVuIHdpdGguXG4gKlxuICogQSBzdHJpbmcgXCJrZXlcIiBpcyBpbiB0aGUgZm9ybSBvZiBcIk5BTUVTUEFDRS9rZXkuZnJvbS5zdHJpbmdzLmpzb25cIlxuICpcbiAqIE5PVEU6IFRoaXMgZmlsZSBsaWtlbHkgYmVsb25ncyBpbiBqb2lzdC9qcy9pMThuLywgYnV0IHNob3VsZCBzdGF5IGhlcmUgdG8gbWFrZSBtYWludGVuYW5jZS1yZWxlYXNlIG1haW50YWluYWJpbGl0eSBlYXNpZXIuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb24+XG4gKi9cblxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IHsgTG9jYWxlIH0gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvaTE4bi9sb2NhbGVQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgQ291bGROb3RZZXREZXNlcmlhbGl6ZUVycm9yIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9Db3VsZE5vdFlldERlc2VyaWFsaXplRXJyb3IuanMnO1xuaW1wb3J0IHsgUGhldGlvSUQgfSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvcGhldC1pby10eXBlcy5qcyc7XG5pbXBvcnQgUGhldGlvT2JqZWN0IGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XG5pbXBvcnQgT2JqZWN0TGl0ZXJhbElPIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9PYmplY3RMaXRlcmFsSU8uanMnO1xuaW1wb3J0IExvY2FsaXplZFN0cmluZywgeyBMb2NhbGl6ZWRTdHJpbmdTdGF0ZURlbHRhLCBTdHJpbmdzU3RhdGVTdGF0ZU9iamVjdCB9IGZyb20gJy4vTG9jYWxpemVkU3RyaW5nLmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBGQUxMQkFDS19MT0NBTEUgPSAnZW4nO1xuXG4vLyBIb2xkcyBhbGwgb2Ygb3VyIGxvY2FsaXplZFN0cmluZ3MsIHNvIHRoYXQgd2UgY2FuIHNhdmUgb3VyIHBoZXQtaW8gc3RyaW5nIGNoYW5nZSBzdGF0ZVxuZXhwb3J0IGNvbnN0IGxvY2FsaXplZFN0cmluZ3M6IExvY2FsaXplZFN0cmluZ1tdID0gW107XG5cbi8vIEZvciBkZXZlbG9wZXIgaW50ZXJuYWwgdXNlLCBwYXJ0aWN1bGFybHkgZm9yIG1lbW9yeSBsZWFrIGRldGVjdGlvblxuLy8gZS5nLiBfLm1heCggcGhldC5jaGlwcGVyLmxvY2FsaXplZFN0cmluZ3MubWFwKCBscyA9PiBscy5wcm9wZXJ0eS50aW55UHJvcGVydHkubGlzdGVuZXJzLnNpemUgKSApIHRvIHNlZSBpZiB0aGVyZSBpc1xuLy8gbGlrZWx5IGEgbGVha1xud2luZG93LnBoZXQuY2hpcHBlci5sb2NhbGl6ZWRTdHJpbmdzID0gbG9jYWxpemVkU3RyaW5ncztcblxuLy8gRm9yIGRldmVsb3BlciBpbnRlcm5hbCB1c2UsIHNpbWlsYXIgdG8gdGhlIHN0cmluZ1Rlc3QgcXVlcnkgcGFyYW1ldGVyXG53aW5kb3cucGhldC5jaGlwcGVyLnNldEFsbFN0cmluZ3MgPSAoIHN0cjogc3RyaW5nICkgPT4ge1xuICBsb2NhbGl6ZWRTdHJpbmdzLmZvckVhY2goIGxvY2FsaXplZFN0cmluZyA9PiB7XG4gICAgbG9jYWxpemVkU3RyaW5nLnByb3BlcnR5LnZhbHVlID0gc3RyO1xuICB9ICk7XG59O1xuXG5jb25zdCBzdHJpbmdLZXlUb1RhbmRlbU5hbWUgPSAoIGtleTogc3RyaW5nICkgPT4ge1xuICByZXR1cm4ga2V5LnJlcGxhY2UoIC8oPzpbLV9cXHNdXFx3KS9nLCB3b3JkID0+IHdvcmRbIDEgXS50b1VwcGVyQ2FzZSgpICk7XG59O1xuXG5jb25zdCBTdHJpbmdTdGF0ZUlPVHlwZSA9IG5ldyBJT1R5cGU8UGhldGlvT2JqZWN0LCBTdHJpbmdzU3RhdGVTdGF0ZU9iamVjdD4oICdTdHJpbmdTdGF0ZUlPJywge1xuICB2YWx1ZVR5cGU6IFBoZXRpb09iamVjdCxcbiAgdG9TdGF0ZU9iamVjdDogKCk6IFN0cmluZ3NTdGF0ZVN0YXRlT2JqZWN0ID0+IHtcbiAgICBjb25zdCBkYXRhOiBSZWNvcmQ8UGhldGlvSUQsIExvY2FsaXplZFN0cmluZ1N0YXRlRGVsdGE+ID0ge307XG5cbiAgICBsb2NhbGl6ZWRTdHJpbmdzLmZvckVhY2goIGxvY2FsaXplZFN0cmluZyA9PiB7XG4gICAgICBjb25zdCBzdGF0ZSA9IGxvY2FsaXplZFN0cmluZy5nZXRTdGF0ZURlbHRhKCk7XG5cbiAgICAgIC8vIE9ubHkgY3JlYXRlIGFuIGVudHJ5IGlmIHRoZXJlIGlzIGFueXRoaW5nICh3ZSBjYW4gc2F2ZSBieXRlcyBieSBub3QgaW5jbHVkaW5nIHRoZSB0YW5kZW0gaGVyZSlcbiAgICAgIGlmICggT2JqZWN0LmtleXMoIHN0YXRlICkubGVuZ3RoID4gMCApIHtcbiAgICAgICAgZGF0YVsgbG9jYWxpemVkU3RyaW5nLnByb3BlcnR5LnRhbmRlbS5waGV0aW9JRCBdID0gc3RhdGU7XG4gICAgICB9XG4gICAgfSApO1xuICAgIHJldHVybiB7XG4gICAgICBkYXRhOiBkYXRhIC8vIERhdGEgbmVzdGVkIGZvciBhIHZhbGlkIHNjaGVtYVxuICAgIH07XG4gIH0sXG4gIHN0YXRlU2NoZW1hOiB7XG4gICAgZGF0YTogT2JqZWN0TGl0ZXJhbElPXG4gIH0sXG4gIGFwcGx5U3RhdGU6ICggaWdub3JlZCwgc3RhdGUgKSA9PiB7XG5cbiAgICAvLyBFdmVyeSBzdHJpbmcgaW4gc3RhdGUgaGFzIHRvIGJlIGluIGxvY2FsaXplZFN0cmluZ3MgdG8gY29udGludWVcbiAgICBPYmplY3Qua2V5cyggc3RhdGUuZGF0YSApLmZvckVhY2goIHBoZXRpb0lEID0+IHtcbiAgICAgIGNvbnN0IG1hdGNoID0gbG9jYWxpemVkU3RyaW5ncy5maW5kKCBsb2NhbGl6ZWRTdHJpbmcgPT4gbG9jYWxpemVkU3RyaW5nLnByb3BlcnR5LnRhbmRlbS5waGV0aW9JRCA9PT0gcGhldGlvSUQgKTtcblxuICAgICAgLy8gV2hlbiBQaGV0aW9EeW5hbWljRWxlbWVudENvbnRhaW5lciBlbGVtZW50cyBzdWNoIGFzIFBoZXRpb0dyb3VwIG1lbWJlcnMgYWRkIGxvY2FsaXplZFN0cmluZ3MsIHdlIHdhaXQgdW50aWxcbiAgICAgIC8vIGFsbCBvZiB0aGUgbWVtYmVycyBoYXZlIGJlZW4gY3JlYXRlZCAocG9wdWxhdGluZyBsb2NhbGl6ZWRTdHJpbmdzKSBiZWZvcmUgdHJ5aW5nIHRvIHNldCBhbnkgb2YgdGhlIHN0cmluZ3MuXG4gICAgICBpZiAoICFtYXRjaCApIHtcbiAgICAgICAgdGhyb3cgbmV3IENvdWxkTm90WWV0RGVzZXJpYWxpemVFcnJvcigpO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIC8vIFdlIG5lZWQgdG8gaXRlcmF0ZSB0aHJvdWdoIGV2ZXJ5IHN0cmluZyBpbiB0aGlzIHJ1bnRpbWUsIHNpbmNlIGl0IG1pZ2h0IG5lZWQgdG8gcmV2ZXJ0IGJhY2sgdG8gXCJpbml0aWFsXCIgc3RhdGUuXG4gICAgbG9jYWxpemVkU3RyaW5ncy5mb3JFYWNoKCBsb2NhbGl6ZWRTdHJpbmcgPT4ge1xuICAgICAgbG9jYWxpemVkU3RyaW5nLnNldFN0YXRlRGVsdGEoIHN0YXRlLmRhdGFbIGxvY2FsaXplZFN0cmluZy5wcm9wZXJ0eS50YW5kZW0ucGhldGlvSUQgXSB8fCB7fSApO1xuICAgIH0gKTtcbiAgfVxufSApO1xuXG5QaGV0aW9PYmplY3QuY3JlYXRlKCB7XG4gIHBoZXRpb1R5cGU6IFN0cmluZ1N0YXRlSU9UeXBlLFxuICB0YW5kZW06IFRhbmRlbS5HRU5FUkFMX01PREVMLmNyZWF0ZVRhbmRlbSggJ3N0cmluZ3NTdGF0ZScgKSxcbiAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1N0cmluZ3MgdGhhdCBoYXZlIGNoYW5nZWQgZnJvbSB0aGVpciBpbml0aWFsIHZhbHVlcy4gRWFjaCBzdHJpbmcgdmFsdWUgaXMgc3BlY2lmaWMgdG8gdGhlIGxvY2FsZSBpdCBjaGFuZ2VkIGluLicsXG4gIHBoZXRpb1N0YXRlOiB0cnVlXG59ICk7XG5cbnR5cGUgVFN0cmluZ01vZHVsZSA9IHtcbiAgWyBrZXk6IHN0cmluZyBdOiBUU3RyaW5nTW9kdWxlIHwgc3RyaW5nIHwgVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPjtcbn07XG5cbi8qKlxuICogQHBhcmFtIHJlcXVpcmVqc05hbWVzcGFjZSAtIEUuZy4gJ0pPSVNUJywgdG8gcHVsbCBzdHJpbmcga2V5cyBvdXQgZnJvbSB0aGF0IG5hbWVzcGFjZVxuICogQHJldHVybnMgTmVzdGVkIG9iamVjdCB0byBiZSBhY2Nlc3NlZCBsaWtlIEpvaXN0U3RyaW5ncy5SZXNldEFsbEJ1dHRvbi5uYW1lXG4gKi9cbmNvbnN0IGdldFN0cmluZ01vZHVsZSA9ICggcmVxdWlyZWpzTmFtZXNwYWNlOiBzdHJpbmcgKTogb2JqZWN0ID0+IHtcbiAgLy8gT3VyIHN0cmluZyBpbmZvcm1hdGlvbiBpcyBwdWxsZWQgZ2xvYmFsbHksIGUuZy4gcGhldC5jaGlwcGVyLnN0cmluZ3NbIGxvY2FsZSBdWyBzdHJpbmdLZXkgXSA9IHN0cmluZ1ZhbHVlO1xuICAvLyBPdXIgbG9jYWxlIGluZm9ybWF0aW9uIGlzIGZyb20gcGhldC5jaGlwcGVyLmxvY2FsZVxuXG4gIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBwaGV0LmNoaXBwZXIubG9jYWxlID09PSAnc3RyaW5nJywgJ3BoZXQuY2hpcHBlci5sb2NhbGUgc2hvdWxkIGhhdmUgYmVlbiBsb2FkZWQgYnkgbm93JyApO1xuICBhc3NlcnQgJiYgYXNzZXJ0KCBPYmplY3Qua2V5cyggcGhldC5jaGlwcGVyLmxvY2FsZURhdGEgKS5pbmNsdWRlcyggcGhldC5jaGlwcGVyLmxvY2FsZSApLCBgcGhldC5jaGlwcGVyLmxvY2FsZToke3BoZXQuY2hpcHBlci5sb2NhbGV9IGlzIG5vdCBpbiBsb2NhbGVEYXRhYCApO1xuICBhc3NlcnQgJiYgYXNzZXJ0KCBwaGV0LmNoaXBwZXIuc3RyaW5ncywgJ3BoZXQuY2hpcHBlci5zdHJpbmdzIHNob3VsZCBoYXZlIGJlZW4gbG9hZGVkIGJ5IG5vdycgKTtcblxuICAvLyBDb25zdHJ1Y3QgbG9jYWxlcyBpbiBpbmNyZWFzaW5nIHNwZWNpZmljaXR5LCBlLmcuIFsgJ2VuJywgJ3poJywgJ3poX0NOJyBdLCBzbyB3ZSBnZXQgZmFsbGJhY2tzIGluIG9yZGVyXG4gIC8vIGNvbnN0IGxvY2FsZXMgPSBbIEZBTExCQUNLX0xPQ0FMRSBdO1xuICBjb25zdCBzdHJpbmdLZXlQcmVmaXggPSBgJHtyZXF1aXJlanNOYW1lc3BhY2V9L2A7XG5cbiAgLy8gV2UgbWF5IGhhdmUgb3RoZXIgb2xkZXIgKHVudXNlZCkga2V5cyBpbiBiYWJlbCwgYW5kIHdlIGFyZSBvbmx5IGRvaW5nIHRoZSBzZWFyY2ggdGhhdCBtYXR0ZXJzIHdpdGggdGhlIEVuZ2xpc2hcbiAgLy8gc3RyaW5nIGtleXMuXG4gIGxldCBhbGxTdHJpbmdLZXlzSW5SZXBvID0gT2JqZWN0LmtleXMoIHBoZXQuY2hpcHBlci5zdHJpbmdzWyBGQUxMQkFDS19MT0NBTEUgXSApLmZpbHRlciggc3RyaW5nS2V5ID0+IHN0cmluZ0tleS5zdGFydHNXaXRoKCBzdHJpbmdLZXlQcmVmaXggKSApO1xuXG4gIC8vIFRPRE86IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvL2lzc3Vlcy8xODc3IFdoYXQgaWYgdGhpcyBsaXN0IGRvZXNuJ3QgZXhpc3Q/ICBTaG91bGQgdGhhdCBiZSBhbiBlcnJvcj9cbiAgLy8gT3IgYW4gZXJyb3IgaWYgcnVubmluZyBhbiBhcGktc3RhYmxlIHBoZXQtaW8gc2ltP1xuICAvLyBUT0RPOiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby9pc3N1ZXMvMTg3NyBXaGF0IHdpbGwgaGFwcGVuIGlmIHRoaXMgaXMgc3RhbGU/IEhvdyB3aWxsIGEgZGV2ZWxvcGVyIGtub3dcbiAgLy8gdG8gdXBkYXRlIGl0PyBTaG91bGQgaXQgcnVuIGluIGRhaWx5LWdydW50LXdvcms/XG4gIGlmICggcGhldC5jaGlwcGVyLnVzZWRTdHJpbmdzRU4gKSB7XG4gICAgYWxsU3RyaW5nS2V5c0luUmVwbyA9IGFsbFN0cmluZ0tleXNJblJlcG8uZmlsdGVyKCBzdHJpbmdLZXkgPT4gcGhldC5jaGlwcGVyLnVzZWRTdHJpbmdzRU4uaGFzT3duUHJvcGVydHkoIHN0cmluZ0tleSApICk7XG4gIH1cblxuICAvLyBsb2NhbGl6ZWRTdHJpbmdNYXBbIHN0cmluZ0tleSBdXG4gIGNvbnN0IGxvY2FsaXplZFN0cmluZ01hcDogUmVjb3JkPHN0cmluZywgTG9jYWxpemVkU3RyaW5nPiA9IHt9O1xuXG4gIGNvbnN0IHN0cmluZ01vZHVsZTogVFN0cmluZ01vZHVsZSA9IHt9O1xuXG4gIGFsbFN0cmluZ0tleXNJblJlcG8uZm9yRWFjaCggc3RyaW5nS2V5ID0+IHtcbiAgICAvLyBzdHJpcCBvZmYgdGhlIHJlcXVpcmVqc05hbWVzcGFjZSwgZS5nLiAnSk9JU1QvUmVzZXRBbGxCdXR0b24ubmFtZScgPT4gJ1Jlc2V0QWxsQnV0dG9uLm5hbWUnXG4gICAgY29uc3Qgc3RyaW5nS2V5V2l0aG91dFByZWZpeCA9IHN0cmluZ0tleS5zbGljZSggc3RyaW5nS2V5UHJlZml4Lmxlbmd0aCApO1xuXG4gICAgY29uc3Qga2V5UGFydHMgPSBzdHJpbmdLZXlXaXRob3V0UHJlZml4LnNwbGl0KCAnLicgKTtcbiAgICBjb25zdCBsYXN0S2V5UGFydCA9IGtleVBhcnRzWyBrZXlQYXJ0cy5sZW5ndGggLSAxIF07XG4gICAgY29uc3QgYWxsQnV0TGFzdEtleVBhcnQgPSBrZXlQYXJ0cy5zbGljZSggMCwga2V5UGFydHMubGVuZ3RoIC0gMSApO1xuXG4gICAgLy8gRHVyaW5nIHRyYXZlcnNhbCBpbnRvIHRoZSBzdHJpbmcgb2JqZWN0LCB0aGlzIHdpbGwgaG9sZCB0aGUgb2JqZWN0IHdoZXJlIHRoZSBuZXh0IGxldmVsIG5lZWRzIHRvIGJlIGRlZmluZWQsXG4gICAgLy8gd2hldGhlciB0aGF0J3MgYW5vdGhlciBjaGlsZCBvYmplY3QsIG9yIHRoZSBzdHJpbmcgdmFsdWUgaXRzZWxmLlxuICAgIGxldCByZWZlcmVuY2U6IFRTdHJpbmdNb2R1bGUgPSBzdHJpbmdNb2R1bGU7XG5cbiAgICAvLyBXZSdsbCB0cmF2ZXJzZSBkb3duIHRocm91Z2ggdGhlIHBhcnRzIG9mIGEgc3RyaW5nIGtleSAoc2VwYXJhdGVkIGJ5ICcuJyksIGNyZWF0aW5nIGEgbmV3IGxldmVsIGluIHRoZVxuICAgIC8vIHN0cmluZyBvYmplY3QgZm9yIGVhY2ggb25lLiBUaGlzIGlzIGRvbmUgZm9yIGFsbCBCVVQgdGhlIGxhc3QgcGFydCwgc2luY2Ugd2UnbGwgd2FudCB0byBhc3NpZ24gdGhlIHJlc3VsdFxuICAgIC8vIG9mIHRoYXQgdG8gYSByYXcgc3RyaW5nIHZhbHVlIChyYXRoZXIgdGhhbiBhbiBvYmplY3QpLlxuICAgIGxldCBwYXJ0aWFsS2V5ID0gc3RyaW5nS2V5UHJlZml4O1xuICAgIGFsbEJ1dExhc3RLZXlQYXJ0LmZvckVhY2goICgga2V5UGFydCwgaSApID0+IHtcbiAgICAgIC8vIFdoZW4gY29uY2F0ZW5hdGluZyBlYWNoIGxldmVsIGludG8gdGhlIGZpbmFsIHN0cmluZyBrZXksIHdlIGRvbid0IHdhbnQgdG8gcHV0IGEgJy4nIGRpcmVjdGx5IGFmdGVyIHRoZVxuICAgICAgLy8gc2xhc2gsIGJlY2F1c2UgYEpPSVNULy5SZXNldEFsbEJ1dHRvbi5uYW1lYCB3b3VsZCBiZSBpbnZhbGlkLlxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy85MjJcbiAgICAgIHBhcnRpYWxLZXkgKz0gYCR7aSA+IDAgPyAnLicgOiAnJ30ke2tleVBhcnR9YDtcblxuICAgICAgLy8gRG9uJ3QgYWxsb3cgZS5nLiBKT0lTVC9hIGFuZCBKT0lTVC9hLmIsIHNpbmNlIGxvY2FsZU9iamVjdC5hIHdvdWxkIG5lZWQgdG8gYmUgYSBzdHJpbmcgQU5EIGFuIG9iamVjdCBhdCB0aGVcbiAgICAgIC8vIHNhbWUgdGltZS5cbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiByZWZlcmVuY2VbIGtleVBhcnQgXSAhPT0gJ3N0cmluZycsXG4gICAgICAgICdJdCBpcyBub3QgYWxsb3dlZCB0byBoYXZlIHR3byBkaWZmZXJlbnQgc3RyaW5nIGtleXMgd2hlcmUgb25lIGlzIGV4dGVuZGVkIGJ5IGFkZGluZyBhIHBlcmlvZCAoLikgYXQgdGhlIGVuZCAnICtcbiAgICAgICAgYG9mIHRoZSBvdGhlci4gVGhlIHN0cmluZyBrZXkgJHtwYXJ0aWFsS2V5fSBpcyBleHRlbmRlZCBieSAke3N0cmluZ0tleX0gaW4gdGhpcyBjYXNlLCBhbmQgc2hvdWxkIGJlIGNoYW5nZWQuYCApO1xuXG4gICAgICAvLyBDcmVhdGUgdGhlIG5leHQgbmVzdGVkIGxldmVsLCBhbmQgbW92ZSBpbnRvIGl0XG4gICAgICBpZiAoICFyZWZlcmVuY2VbIGtleVBhcnQgXSApIHtcbiAgICAgICAgcmVmZXJlbmNlWyBrZXlQYXJ0IF0gPSB7fTtcbiAgICAgIH1cblxuICAgICAgcmVmZXJlbmNlID0gcmVmZXJlbmNlWyBrZXlQYXJ0IF0gYXMgVFN0cmluZ01vZHVsZTsgLy8gc2luY2Ugd2UgYXJlIG9uIGFsbCBidXQgdGhlIGxhc3Qga2V5IHBhcnQsIGl0IGNhbm5vdCBiZSBzdHJpbmdsaWtlXG4gICAgfSApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHJlZmVyZW5jZVsgbGFzdEtleVBhcnQgXSAhPT0gJ29iamVjdCcsXG4gICAgICAnSXQgaXMgbm90IGFsbG93ZWQgdG8gaGF2ZSB0d28gZGlmZmVyZW50IHN0cmluZyBrZXlzIHdoZXJlIG9uZSBpcyBleHRlbmRlZCBieSBhZGRpbmcgYSBwZXJpb2QgKC4pIGF0IHRoZSBlbmQgJyArXG4gICAgICBgb2YgdGhlIG90aGVyLiBUaGUgc3RyaW5nIGtleSAke3N0cmluZ0tleX0gaXMgZXh0ZW5kZWQgYnkgYW5vdGhlciBrZXksIHNvbWV0aGluZyBjb250YWluaW5nICR7cmVmZXJlbmNlWyBsYXN0S2V5UGFydCBdICYmIE9iamVjdC5rZXlzKCByZWZlcmVuY2VbIGxhc3RLZXlQYXJ0IF0gKX0uYCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICFyZWZlcmVuY2VbIGxhc3RLZXlQYXJ0IF0sXG4gICAgICBgV2Ugc2hvdWxkIG5vdCBoYXZlIGRlZmluZWQgdGhpcyBwbGFjZSBpbiB0aGUgb2JqZWN0ICgke3N0cmluZ0tleX0pLCBvdGhlcndpc2UgaXQgbWVhbnMgYSBkdXBsaWNhdGVkIHN0cmluZyBrZXkgT1IgZXh0ZW5kZWQgc3RyaW5nIGtleWAgKTtcblxuICAgIC8vIEluIGNhc2Ugb3VyIGFzc2VydGlvbnMgYXJlIG5vdCBlbmFibGVkLCB3ZSdsbCBuZWVkIHRvIHByb2NlZWQgd2l0aG91dCBmYWlsaW5nIG91dCAoc28gd2UgYWxsb3cgZm9yIHRoZVxuICAgIC8vIGV4dGVuZGVkIHN0cmluZyBrZXlzIGluIG91ciBhY3R1YWwgY29kZSwgZXZlbiB0aG91Z2ggYXNzZXJ0aW9ucyBzaG91bGQgcHJldmVudCB0aGF0KS5cbiAgICBpZiAoIHR5cGVvZiByZWZlcmVuY2UgIT09ICdzdHJpbmcnICkge1xuICAgICAgbGV0IHRhbmRlbSA9IFRhbmRlbS5TVFJJTkdTLmNyZWF0ZVRhbmRlbSggXy5jYW1lbENhc2UoIHJlcXVpcmVqc05hbWVzcGFjZSApICk7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBrZXlQYXJ0cy5sZW5ndGg7IGkrKyApIHtcblxuICAgICAgICBsZXQgdGFuZGVtTmFtZSA9IHN0cmluZ0tleVRvVGFuZGVtTmFtZSgga2V5UGFydHNbIGkgXSApO1xuXG4gICAgICAgIC8vIElmIGl0IGlzIHRoZSB0YWlsIG9mIHRoZSBzdHJpbmcga2V5LCB0aGVuIG1ha2UgdGhlIHRhbmRlbSBiZSBhIFwiKlN0cmluZ1Byb3BlcnR5XCJcbiAgICAgICAgaWYgKCBpID09PSBrZXlQYXJ0cy5sZW5ndGggLSAxICkge1xuXG4gICAgICAgICAgbGV0IGN1cnJlbnRUYW5kZW1OYW1lID0gdGFuZGVtTmFtZTtcbiAgICAgICAgICBsZXQgaiA9IDA7XG4gICAgICAgICAgbGV0IHRhbmRlbU5hbWVUYWtlbiA9IHRydWU7XG5cbiAgICAgICAgICAvLyBIYW5kbGUgdGhlIGNhc2Ugd2hlcmUgdHdvIHVuaXF1ZSBzdHJpbmcga2V5cyBtYXAgdG8gdGhlIHNhbWUgY2FtZWwgY2FzZSB2YWx1ZSwgaS5lLiBcIlNvbGlkXCIgYW5kIFwic29saWRcIi5cbiAgICAgICAgICAvLyBIZXJlIHdlIHdpbGwgYmUgc29saWRTdHJpbmdQcm9wZXJ0eSBhbmQgc29saWQyU3RyaW5nUHJvcGVydHlcbiAgICAgICAgICB3aGlsZSAoIHRhbmRlbU5hbWVUYWtlbiApIHtcbiAgICAgICAgICAgIGorKztcblxuICAgICAgICAgICAgY3VycmVudFRhbmRlbU5hbWUgPSBgJHt0YW5kZW1OYW1lfSR7aiA9PT0gMSA/ICcnIDogan1TdHJpbmdQcm9wZXJ0eWA7XG5cbiAgICAgICAgICAgIHRhbmRlbU5hbWVUYWtlbiA9IHRhbmRlbS5oYXNDaGlsZCggY3VycmVudFRhbmRlbU5hbWUgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGFuZGVtTmFtZSA9IGN1cnJlbnRUYW5kZW1OYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgdGFuZGVtID0gdGFuZGVtLmNyZWF0ZVRhbmRlbSggdGFuZGVtTmFtZSApO1xuICAgICAgfVxuXG4gICAgICAvLyBzdHJpbmdzIG5lc3RlZCB1bmRlciB0aGUgYTExeSBzZWN0aW9uIGFyZSBub3QgY3VycmVudGx5IFBoRVQtaU8gaW5zdHJ1bWVudGVkLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzEzNTJcbiAgICAgIGlmICggdGFuZGVtLnBoZXRpb0lELmluY2x1ZGVzKCAnLmExMXkuJyApICkge1xuICAgICAgICB0YW5kZW0gPSBUYW5kZW0uT1BUX09VVDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbG9jYWxlVG9UcmFuc2xhdGlvbk1hcDogTG9jYWxpemVkU3RyaW5nU3RhdGVEZWx0YSA9IHt9O1xuICAgICAgKCBPYmplY3Qua2V5cyggcGhldC5jaGlwcGVyLnN0cmluZ3MgKSBhcyBMb2NhbGVbXSApLmZvckVhY2goICggbG9jYWxlOiBMb2NhbGUgKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0cmluZzogc3RyaW5nID0gcGhldC5jaGlwcGVyLnN0cmluZ3NbIGxvY2FsZSBdWyBzdHJpbmdLZXkgXTtcbiAgICAgICAgLy8gSWdub3JlIHplcm8tbGVuZ3RoIHN0cmluZ3MsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvMTM0M1xuICAgICAgICBpZiAoIGxvY2FsZSA9PT0gRkFMTEJBQ0tfTE9DQUxFIHx8ICggdHlwZW9mIHN0cmluZyA9PT0gJ3N0cmluZycgJiYgc3RyaW5nICE9PSAnJyApICkge1xuICAgICAgICAgIC8vIEExMXkgaXMgbm90IHRyYW5zbGF0YWJsZSBhbmQgc2hvdWxkIG5vdCBhcHBlYXIgbWFwcGVkLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3Rhc2tzL2lzc3Vlcy8xMTMzXG4gICAgICAgICAgbG9jYWxlVG9UcmFuc2xhdGlvbk1hcFsgbG9jYWxlIF0gPSBzdHJpbmdLZXkuaW5jbHVkZXMoICcvYTExeS4nICkgPyBzdHJpbmcgOiBwaGV0LmNoaXBwZXIubWFwU3RyaW5nKCBzdHJpbmcgKTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuXG4gICAgICBjb25zdCBsb2NhbGl6ZWRTdHJpbmcgPSBuZXcgTG9jYWxpemVkU3RyaW5nKFxuICAgICAgICBzdHJpbmdLZXksXG4gICAgICAgIGxvY2FsZVRvVHJhbnNsYXRpb25NYXAsXG4gICAgICAgIHRhbmRlbSxcbiAgICAgICAgcGhldC5jaGlwcGVyLnN0cmluZ01ldGFkYXRhWyBzdHJpbmdLZXkgXVxuICAgICAgKTtcbiAgICAgIGxvY2FsaXplZFN0cmluZ01hcFsgc3RyaW5nS2V5IF0gPSBsb2NhbGl6ZWRTdHJpbmc7XG5cbiAgICAgIC8vIFB1dCBvdXIgUHJvcGVydHkgaW4gdGhlIHN0cmluZ01vZHVsZVxuICAgICAgcmVmZXJlbmNlWyBgJHtsYXN0S2V5UGFydH1TdHJpbmdQcm9wZXJ0eWAgXSA9IGxvY2FsaXplZFN0cmluZy5wcm9wZXJ0eTtcblxuICAgICAgLy8gQ2hhbmdlIG91ciBzdHJpbmdNb2R1bGUgYmFzZWQgb24gdGhlIFByb3BlcnR5IHZhbHVlXG4gICAgICBsb2NhbGl6ZWRTdHJpbmcucHJvcGVydHkubGluayggc3RyaW5nID0+IHtcbiAgICAgICAgcmVmZXJlbmNlWyBsYXN0S2V5UGFydCBdID0gc3RyaW5nO1xuICAgICAgfSApO1xuICAgIH1cbiAgfSApO1xuXG4gIHJldHVybiBzdHJpbmdNb2R1bGU7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBnZXRTdHJpbmdNb2R1bGU7Il0sIm5hbWVzIjpbIkNvdWxkTm90WWV0RGVzZXJpYWxpemVFcnJvciIsIlBoZXRpb09iamVjdCIsIlRhbmRlbSIsIklPVHlwZSIsIk9iamVjdExpdGVyYWxJTyIsIkxvY2FsaXplZFN0cmluZyIsIkZBTExCQUNLX0xPQ0FMRSIsImxvY2FsaXplZFN0cmluZ3MiLCJ3aW5kb3ciLCJwaGV0IiwiY2hpcHBlciIsInNldEFsbFN0cmluZ3MiLCJzdHIiLCJmb3JFYWNoIiwibG9jYWxpemVkU3RyaW5nIiwicHJvcGVydHkiLCJ2YWx1ZSIsInN0cmluZ0tleVRvVGFuZGVtTmFtZSIsImtleSIsInJlcGxhY2UiLCJ3b3JkIiwidG9VcHBlckNhc2UiLCJTdHJpbmdTdGF0ZUlPVHlwZSIsInZhbHVlVHlwZSIsInRvU3RhdGVPYmplY3QiLCJkYXRhIiwic3RhdGUiLCJnZXRTdGF0ZURlbHRhIiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsInRhbmRlbSIsInBoZXRpb0lEIiwic3RhdGVTY2hlbWEiLCJhcHBseVN0YXRlIiwiaWdub3JlZCIsIm1hdGNoIiwiZmluZCIsInNldFN0YXRlRGVsdGEiLCJjcmVhdGUiLCJwaGV0aW9UeXBlIiwiR0VORVJBTF9NT0RFTCIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJwaGV0aW9TdGF0ZSIsImdldFN0cmluZ01vZHVsZSIsInJlcXVpcmVqc05hbWVzcGFjZSIsImFzc2VydCIsImxvY2FsZSIsImxvY2FsZURhdGEiLCJpbmNsdWRlcyIsInN0cmluZ3MiLCJzdHJpbmdLZXlQcmVmaXgiLCJhbGxTdHJpbmdLZXlzSW5SZXBvIiwiZmlsdGVyIiwic3RyaW5nS2V5Iiwic3RhcnRzV2l0aCIsInVzZWRTdHJpbmdzRU4iLCJoYXNPd25Qcm9wZXJ0eSIsImxvY2FsaXplZFN0cmluZ01hcCIsInN0cmluZ01vZHVsZSIsInN0cmluZ0tleVdpdGhvdXRQcmVmaXgiLCJzbGljZSIsImtleVBhcnRzIiwic3BsaXQiLCJsYXN0S2V5UGFydCIsImFsbEJ1dExhc3RLZXlQYXJ0IiwicmVmZXJlbmNlIiwicGFydGlhbEtleSIsImtleVBhcnQiLCJpIiwiU1RSSU5HUyIsIl8iLCJjYW1lbENhc2UiLCJ0YW5kZW1OYW1lIiwiY3VycmVudFRhbmRlbU5hbWUiLCJqIiwidGFuZGVtTmFtZVRha2VuIiwiaGFzQ2hpbGQiLCJPUFRfT1VUIiwibG9jYWxlVG9UcmFuc2xhdGlvbk1hcCIsInN0cmluZyIsIm1hcFN0cmluZyIsInN0cmluZ01ldGFkYXRhIiwibGluayJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7OztDQVdDLEdBSUQsT0FBT0EsaUNBQWlDLG9EQUFvRDtBQUU1RixPQUFPQyxrQkFBa0IscUNBQXFDO0FBQzlELE9BQU9DLFlBQVksK0JBQStCO0FBQ2xELE9BQU9DLFlBQVkscUNBQXFDO0FBQ3hELE9BQU9DLHFCQUFxQiw4Q0FBOEM7QUFDMUUsT0FBT0MscUJBQTZFLHVCQUF1QjtBQUUzRyxZQUFZO0FBQ1osTUFBTUMsa0JBQWtCO0FBRXhCLHlGQUF5RjtBQUN6RixPQUFPLE1BQU1DLG1CQUFzQyxFQUFFLENBQUM7QUFFdEQscUVBQXFFO0FBQ3JFLHNIQUFzSDtBQUN0SCxnQkFBZ0I7QUFDaEJDLE9BQU9DLElBQUksQ0FBQ0MsT0FBTyxDQUFDSCxnQkFBZ0IsR0FBR0E7QUFFdkMsd0VBQXdFO0FBQ3hFQyxPQUFPQyxJQUFJLENBQUNDLE9BQU8sQ0FBQ0MsYUFBYSxHQUFHLENBQUVDO0lBQ3BDTCxpQkFBaUJNLE9BQU8sQ0FBRUMsQ0FBQUE7UUFDeEJBLGdCQUFnQkMsUUFBUSxDQUFDQyxLQUFLLEdBQUdKO0lBQ25DO0FBQ0Y7QUFFQSxNQUFNSyx3QkFBd0IsQ0FBRUM7SUFDOUIsT0FBT0EsSUFBSUMsT0FBTyxDQUFFLGlCQUFpQkMsQ0FBQUEsT0FBUUEsSUFBSSxDQUFFLEVBQUcsQ0FBQ0MsV0FBVztBQUNwRTtBQUVBLE1BQU1DLG9CQUFvQixJQUFJbkIsT0FBK0Ms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