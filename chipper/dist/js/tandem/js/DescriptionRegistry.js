// Copyright 2023-2024, University of Colorado Boulder
/**
 * Registry for all objects with a tandem/descriptionTandem set, for use by the description system.
 *
 * NOTE: Experimental currently, see https://github.com/phetsims/joist/issues/941
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet, _window;
import TinyEmitter from '../../axon/js/TinyEmitter.js';
import tandemNamespace from './tandemNamespace.js';
let DescriptionRegistry = class DescriptionRegistry {
    /**
   * Called when a PhetioObject is created with a tandem, or when a tandem is set on a PhetioObject.
   * Can also be called with a custom tandem that is not part of the PhET-iO API.
   */ static add(tandem, settable) {
        if (!DescriptionRegistry.ENABLED) {
            return;
        }
        assert && assert(!DescriptionRegistry.map.has(tandem.phetioID), 'TandemID already exists in the DescriptionRegistry');
        DescriptionRegistry.map.set(tandem.phetioID, settable);
        // Traverse our DescriptionEntries, creating them as needed
        const bits = tandem.phetioID.split('.');
        let current = DescriptionRegistry.root;
        for(let i = 0; i < bits.length; i++){
            const bit = bits[i];
            if (!current[bit]) {
                current[bit] = {};
            }
            current = current[bit];
        }
        // Tag the _value on the leaf so it's accessible
        current._value = settable;
        DescriptionRegistry.addedEmitter.emit(tandem.phetioID, settable);
    }
    /**
   * Called when a PhetioObject is disposed, or when you want to remove a custom tandem that is not part of the PhET-iO API.
   */ static remove(settable) {
        if (!DescriptionRegistry.ENABLED) {
            return;
        }
        const tandemID = settable.phetioID;
        if (DescriptionRegistry.map.has(tandemID)) {
            DescriptionRegistry.removedEmitter.emit(tandemID, settable);
            DescriptionRegistry.map.delete(tandemID);
            // Traverse our DescriptionEntries, recording the "trail" of entries
            const bits = tandemID.split('.');
            const entries = [];
            let current = DescriptionRegistry.root;
            for(let i = 0; i < bits.length; i++){
                const bit = bits[i];
                if (current) {
                    current = current[bit];
                    if (current) {
                        entries.push(current);
                    }
                }
            }
            // If we have the full trail, remove the tagged _value
            if (entries.length === bits.length) {
                delete current._value;
            }
            // Remove empty entries recursively
            for(let i = entries.length - 1; i >= 0; i--){
                const entry = entries[i];
                if (entry && Object.keys(entry).length === 0) {
                    delete entries[i];
                }
            }
        } else {
            assert && assert(false, 'PhetioObject/Settable not found in DescriptionRegistry');
        }
    }
};
// Feature flag, disabled until is ready for production, see https://github.com/phetsims/joist/issues/941
DescriptionRegistry.ENABLED = !!((_window = window) == null ? void 0 : (_window_phet = _window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.supportsDescriptionPlugin);
// Provides an object-structure matching the tandem hierarchy. On anything with a tandem with a matching
// PhetioObject, it will be set as the _value property.
// E.g. root.density.introScreen.model._value will be the IntroScreen object.
DescriptionRegistry.root = {};
// Map from TandemID to the settable object, so we can find the object from a given tandemID. This
// will often be a PhetioObject, but may be other objects with a custom tandem (that are not part of the PhET-iO API).
DescriptionRegistry.map = new Map();
// Emits with (tandemID, phetioObject) on PhetioObject addition/removal.
DescriptionRegistry.addedEmitter = new TinyEmitter();
DescriptionRegistry.removedEmitter = new TinyEmitter();
export { DescriptionRegistry as default };
tandemNamespace.register('DescriptionRegistry', DescriptionRegistry);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9EZXNjcmlwdGlvblJlZ2lzdHJ5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFJlZ2lzdHJ5IGZvciBhbGwgb2JqZWN0cyB3aXRoIGEgdGFuZGVtL2Rlc2NyaXB0aW9uVGFuZGVtIHNldCwgZm9yIHVzZSBieSB0aGUgZGVzY3JpcHRpb24gc3lzdGVtLlxuICpcbiAqIE5PVEU6IEV4cGVyaW1lbnRhbCBjdXJyZW50bHksIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzk0MVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgVGlueUVtaXR0ZXIgZnJvbSAnLi4vLi4vYXhvbi9qcy9UaW55RW1pdHRlci5qcyc7XG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcbmltcG9ydCBQaGV0aW9PYmplY3QgZnJvbSAnLi9QaGV0aW9PYmplY3QuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuL1RhbmRlbS5qcyc7XG5pbXBvcnQgdGFuZGVtTmFtZXNwYWNlIGZyb20gJy4vdGFuZGVtTmFtZXNwYWNlLmpzJztcblxudHlwZSBEZXNjcmlwdGlvbkVudHJ5ID0ge1xuICAvLyBCb28sIHRoaXMgZG9lc24ndCB3b3JrXG4gIC8vIFsgSyBpbiBzdHJpbmcgXTogSyBleHRlbmRzICdfdmFsdWUnID8gKCBQaGV0aW9PYmplY3QgfCBudWxsICkgOiBEZXNjcmlwdGlvbkVudHJ5O1xuXG4gIFsgSzogc3RyaW5nIF06IERlc2NyaXB0aW9uRW50cnkgfCBQaGV0aW9PYmplY3QgfCBudWxsO1xufTtcblxuLy8gQW55IHNvcnQgb2Ygb2JqZWN0IHRoYXQgY2FuIGhhdmUgc29tZSB2YWx1ZSBzZXQgdG8gaXQuIE9mdGVuIGEgUGhldGlvT2JqZWN0LCBidXQgbm90IGFsd2F5cyBpZiBjcmVhdGluZyBjdXN0b21cbi8vIHRhbmRlbXMgZm9yIHRoaXMgcmVnaXN0cnkuXG50eXBlIFNldHRhYmxlID0gSW50ZW50aW9uYWxBbnk7XG5cbnR5cGUgVGFuZGVtSUQgPSBzdHJpbmc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERlc2NyaXB0aW9uUmVnaXN0cnkge1xuXG4gIC8vIEZlYXR1cmUgZmxhZywgZGlzYWJsZWQgdW50aWwgaXMgcmVhZHkgZm9yIHByb2R1Y3Rpb24sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzk0MVxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEVOQUJMRUQgPSAhISggd2luZG93Py5waGV0Py5jaGlwcGVyPy5xdWVyeVBhcmFtZXRlcnM/LnN1cHBvcnRzRGVzY3JpcHRpb25QbHVnaW4gKTtcblxuICAvLyBQcm92aWRlcyBhbiBvYmplY3Qtc3RydWN0dXJlIG1hdGNoaW5nIHRoZSB0YW5kZW0gaGllcmFyY2h5LiBPbiBhbnl0aGluZyB3aXRoIGEgdGFuZGVtIHdpdGggYSBtYXRjaGluZ1xuICAvLyBQaGV0aW9PYmplY3QsIGl0IHdpbGwgYmUgc2V0IGFzIHRoZSBfdmFsdWUgcHJvcGVydHkuXG4gIC8vIEUuZy4gcm9vdC5kZW5zaXR5LmludHJvU2NyZWVuLm1vZGVsLl92YWx1ZSB3aWxsIGJlIHRoZSBJbnRyb1NjcmVlbiBvYmplY3QuXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgcm9vdDogRGVzY3JpcHRpb25FbnRyeSA9IHt9O1xuXG4gIC8vIE1hcCBmcm9tIFRhbmRlbUlEIHRvIHRoZSBzZXR0YWJsZSBvYmplY3QsIHNvIHdlIGNhbiBmaW5kIHRoZSBvYmplY3QgZnJvbSBhIGdpdmVuIHRhbmRlbUlELiBUaGlzXG4gIC8vIHdpbGwgb2Z0ZW4gYmUgYSBQaGV0aW9PYmplY3QsIGJ1dCBtYXkgYmUgb3RoZXIgb2JqZWN0cyB3aXRoIGEgY3VzdG9tIHRhbmRlbSAodGhhdCBhcmUgbm90IHBhcnQgb2YgdGhlIFBoRVQtaU8gQVBJKS5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBtYXA6IE1hcDxUYW5kZW1JRCwgU2V0dGFibGU+ID0gbmV3IE1hcDxUYW5kZW1JRCwgU2V0dGFibGU+KCk7XG5cbiAgLy8gRW1pdHMgd2l0aCAodGFuZGVtSUQsIHBoZXRpb09iamVjdCkgb24gUGhldGlvT2JqZWN0IGFkZGl0aW9uL3JlbW92YWwuXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgYWRkZWRFbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyPFsgVGFuZGVtSUQsIFBoZXRpb09iamVjdCBdPigpO1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IHJlbW92ZWRFbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyPFsgVGFuZGVtSUQsIFBoZXRpb09iamVjdCBdPigpO1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhIFBoZXRpb09iamVjdCBpcyBjcmVhdGVkIHdpdGggYSB0YW5kZW0sIG9yIHdoZW4gYSB0YW5kZW0gaXMgc2V0IG9uIGEgUGhldGlvT2JqZWN0LlxuICAgKiBDYW4gYWxzbyBiZSBjYWxsZWQgd2l0aCBhIGN1c3RvbSB0YW5kZW0gdGhhdCBpcyBub3QgcGFydCBvZiB0aGUgUGhFVC1pTyBBUEkuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGFkZCggdGFuZGVtOiBUYW5kZW0sIHNldHRhYmxlOiBTZXR0YWJsZSApOiB2b2lkIHtcbiAgICBpZiAoICFEZXNjcmlwdGlvblJlZ2lzdHJ5LkVOQUJMRUQgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFEZXNjcmlwdGlvblJlZ2lzdHJ5Lm1hcC5oYXMoIHRhbmRlbS5waGV0aW9JRCApLCAnVGFuZGVtSUQgYWxyZWFkeSBleGlzdHMgaW4gdGhlIERlc2NyaXB0aW9uUmVnaXN0cnknICk7XG5cbiAgICBEZXNjcmlwdGlvblJlZ2lzdHJ5Lm1hcC5zZXQoIHRhbmRlbS5waGV0aW9JRCwgc2V0dGFibGUgKTtcblxuICAgIC8vIFRyYXZlcnNlIG91ciBEZXNjcmlwdGlvbkVudHJpZXMsIGNyZWF0aW5nIHRoZW0gYXMgbmVlZGVkXG4gICAgY29uc3QgYml0cyA9IHRhbmRlbS5waGV0aW9JRC5zcGxpdCggJy4nICk7XG4gICAgbGV0IGN1cnJlbnQ6IERlc2NyaXB0aW9uRW50cnkgPSBEZXNjcmlwdGlvblJlZ2lzdHJ5LnJvb3Q7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYml0cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IGJpdCA9IGJpdHNbIGkgXTtcblxuICAgICAgaWYgKCAhY3VycmVudFsgYml0IF0gKSB7XG4gICAgICAgIGN1cnJlbnRbIGJpdCBdID0ge307XG4gICAgICB9XG4gICAgICBjdXJyZW50ID0gY3VycmVudFsgYml0IF0gYXMgRGVzY3JpcHRpb25FbnRyeTtcbiAgICB9XG5cbiAgICAvLyBUYWcgdGhlIF92YWx1ZSBvbiB0aGUgbGVhZiBzbyBpdCdzIGFjY2Vzc2libGVcbiAgICBjdXJyZW50Ll92YWx1ZSA9IHNldHRhYmxlO1xuXG4gICAgRGVzY3JpcHRpb25SZWdpc3RyeS5hZGRlZEVtaXR0ZXIuZW1pdCggdGFuZGVtLnBoZXRpb0lELCBzZXR0YWJsZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGEgUGhldGlvT2JqZWN0IGlzIGRpc3Bvc2VkLCBvciB3aGVuIHlvdSB3YW50IHRvIHJlbW92ZSBhIGN1c3RvbSB0YW5kZW0gdGhhdCBpcyBub3QgcGFydCBvZiB0aGUgUGhFVC1pTyBBUEkuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJlbW92ZSggc2V0dGFibGU6IFNldHRhYmxlICk6IHZvaWQge1xuXG4gICAgaWYgKCAhRGVzY3JpcHRpb25SZWdpc3RyeS5FTkFCTEVEICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRhbmRlbUlEID0gc2V0dGFibGUucGhldGlvSUQ7XG5cbiAgICBpZiAoIERlc2NyaXB0aW9uUmVnaXN0cnkubWFwLmhhcyggdGFuZGVtSUQgKSApIHtcblxuICAgICAgRGVzY3JpcHRpb25SZWdpc3RyeS5yZW1vdmVkRW1pdHRlci5lbWl0KCB0YW5kZW1JRCwgc2V0dGFibGUgKTtcbiAgICAgIERlc2NyaXB0aW9uUmVnaXN0cnkubWFwLmRlbGV0ZSggdGFuZGVtSUQgKTtcblxuICAgICAgLy8gVHJhdmVyc2Ugb3VyIERlc2NyaXB0aW9uRW50cmllcywgcmVjb3JkaW5nIHRoZSBcInRyYWlsXCIgb2YgZW50cmllc1xuICAgICAgY29uc3QgYml0cyA9IHRhbmRlbUlELnNwbGl0KCAnLicgKTtcbiAgICAgIGNvbnN0IGVudHJpZXM6IERlc2NyaXB0aW9uRW50cnlbXSA9IFtdO1xuICAgICAgbGV0IGN1cnJlbnQ6IERlc2NyaXB0aW9uRW50cnkgPSBEZXNjcmlwdGlvblJlZ2lzdHJ5LnJvb3Q7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBiaXRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBjb25zdCBiaXQgPSBiaXRzWyBpIF07XG5cbiAgICAgICAgaWYgKCBjdXJyZW50ICkge1xuICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50WyBiaXQgXSBhcyBEZXNjcmlwdGlvbkVudHJ5O1xuXG4gICAgICAgICAgaWYgKCBjdXJyZW50ICkge1xuICAgICAgICAgICAgZW50cmllcy5wdXNoKCBjdXJyZW50ICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHdlIGhhdmUgdGhlIGZ1bGwgdHJhaWwsIHJlbW92ZSB0aGUgdGFnZ2VkIF92YWx1ZVxuICAgICAgaWYgKCBlbnRyaWVzLmxlbmd0aCA9PT0gYml0cy5sZW5ndGggKSB7XG4gICAgICAgIGRlbGV0ZSBjdXJyZW50Ll92YWx1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gUmVtb3ZlIGVtcHR5IGVudHJpZXMgcmVjdXJzaXZlbHlcbiAgICAgIGZvciAoIGxldCBpID0gZW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcbiAgICAgICAgY29uc3QgZW50cnkgPSBlbnRyaWVzWyBpIF07XG4gICAgICAgIGlmICggZW50cnkgJiYgT2JqZWN0LmtleXMoIGVudHJ5ICkubGVuZ3RoID09PSAwICkge1xuICAgICAgICAgIGRlbGV0ZSBlbnRyaWVzWyBpIF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ1BoZXRpb09iamVjdC9TZXR0YWJsZSBub3QgZm91bmQgaW4gRGVzY3JpcHRpb25SZWdpc3RyeScgKTtcbiAgICB9XG4gIH1cbn1cblxudGFuZGVtTmFtZXNwYWNlLnJlZ2lzdGVyKCAnRGVzY3JpcHRpb25SZWdpc3RyeScsIERlc2NyaXB0aW9uUmVnaXN0cnkgKTsiXSwibmFtZXMiOlsid2luZG93IiwiVGlueUVtaXR0ZXIiLCJ0YW5kZW1OYW1lc3BhY2UiLCJEZXNjcmlwdGlvblJlZ2lzdHJ5IiwiYWRkIiwidGFuZGVtIiwic2V0dGFibGUiLCJFTkFCTEVEIiwiYXNzZXJ0IiwibWFwIiwiaGFzIiwicGhldGlvSUQiLCJzZXQiLCJiaXRzIiwic3BsaXQiLCJjdXJyZW50Iiwicm9vdCIsImkiLCJsZW5ndGgiLCJiaXQiLCJfdmFsdWUiLCJhZGRlZEVtaXR0ZXIiLCJlbWl0IiwicmVtb3ZlIiwidGFuZGVtSUQiLCJyZW1vdmVkRW1pdHRlciIsImRlbGV0ZSIsImVudHJpZXMiLCJwdXNoIiwiZW50cnkiLCJPYmplY3QiLCJrZXlzIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJzdXBwb3J0c0Rlc2NyaXB0aW9uUGx1Z2luIiwiTWFwIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7O0NBTUMsT0F3QnNDQSxzQ0FBQUEsc0JBQUFBLGNBQUFBO0FBdEJ2QyxPQUFPQyxpQkFBaUIsK0JBQStCO0FBSXZELE9BQU9DLHFCQUFxQix1QkFBdUI7QUFlcEMsSUFBQSxBQUFNQyxzQkFBTixNQUFNQTtJQWtCbkI7OztHQUdDLEdBQ0QsT0FBY0MsSUFBS0MsTUFBYyxFQUFFQyxRQUFrQixFQUFTO1FBQzVELElBQUssQ0FBQ0gsb0JBQW9CSSxPQUFPLEVBQUc7WUFDbEM7UUFDRjtRQUNBQyxVQUFVQSxPQUFRLENBQUNMLG9CQUFvQk0sR0FBRyxDQUFDQyxHQUFHLENBQUVMLE9BQU9NLFFBQVEsR0FBSTtRQUVuRVIsb0JBQW9CTSxHQUFHLENBQUNHLEdBQUcsQ0FBRVAsT0FBT00sUUFBUSxFQUFFTDtRQUU5QywyREFBMkQ7UUFDM0QsTUFBTU8sT0FBT1IsT0FBT00sUUFBUSxDQUFDRyxLQUFLLENBQUU7UUFDcEMsSUFBSUMsVUFBNEJaLG9CQUFvQmEsSUFBSTtRQUN4RCxJQUFNLElBQUlDLElBQUksR0FBR0EsSUFBSUosS0FBS0ssTUFBTSxFQUFFRCxJQUFNO1lBQ3RDLE1BQU1FLE1BQU1OLElBQUksQ0FBRUksRUFBRztZQUVyQixJQUFLLENBQUNGLE9BQU8sQ0FBRUksSUFBSyxFQUFHO2dCQUNyQkosT0FBTyxDQUFFSSxJQUFLLEdBQUcsQ0FBQztZQUNwQjtZQUNBSixVQUFVQSxPQUFPLENBQUVJLElBQUs7UUFDMUI7UUFFQSxnREFBZ0Q7UUFDaERKLFFBQVFLLE1BQU0sR0FBR2Q7UUFFakJILG9CQUFvQmtCLFlBQVksQ0FBQ0MsSUFBSSxDQUFFakIsT0FBT00sUUFBUSxFQUFFTDtJQUMxRDtJQUVBOztHQUVDLEdBQ0QsT0FBY2lCLE9BQVFqQixRQUFrQixFQUFTO1FBRS9DLElBQUssQ0FBQ0gsb0JBQW9CSSxPQUFPLEVBQUc7WUFDbEM7UUFDRjtRQUVBLE1BQU1pQixXQUFXbEIsU0FBU0ssUUFBUTtRQUVsQyxJQUFLUixvQkFBb0JNLEdBQUcsQ0FBQ0MsR0FBRyxDQUFFYyxXQUFhO1lBRTdDckIsb0JBQW9Cc0IsY0FBYyxDQUFDSCxJQUFJLENBQUVFLFVBQVVsQjtZQUNuREgsb0JBQW9CTSxHQUFHLENBQUNpQixNQUFNLENBQUVGO1lBRWhDLG9FQUFvRTtZQUNwRSxNQUFNWCxPQUFPVyxTQUFTVixLQUFLLENBQUU7WUFDN0IsTUFBTWEsVUFBOEIsRUFBRTtZQUN0QyxJQUFJWixVQUE0Qlosb0JBQW9CYSxJQUFJO1lBQ3hELElBQU0sSUFBSUMsSUFBSSxHQUFHQSxJQUFJSixLQUFLSyxNQUFNLEVBQUVELElBQU07Z0JBQ3RDLE1BQU1FLE1BQU1OLElBQUksQ0FBRUksRUFBRztnQkFFckIsSUFBS0YsU0FBVTtvQkFDYkEsVUFBVUEsT0FBTyxDQUFFSSxJQUFLO29CQUV4QixJQUFLSixTQUFVO3dCQUNiWSxRQUFRQyxJQUFJLENBQUViO29CQUNoQjtnQkFDRjtZQUNGO1lBRUEsc0RBQXNEO1lBQ3RELElBQUtZLFFBQVFULE1BQU0sS0FBS0wsS0FBS0ssTUFBTSxFQUFHO2dCQUNwQyxPQUFPSCxRQUFRSyxNQUFNO1lBQ3ZCO1lBRUEsbUNBQW1DO1lBQ25DLElBQU0sSUFBSUgsSUFBSVUsUUFBUVQsTUFBTSxHQUFHLEdBQUdELEtBQUssR0FBR0EsSUFBTTtnQkFDOUMsTUFBTVksUUFBUUYsT0FBTyxDQUFFVixFQUFHO2dCQUMxQixJQUFLWSxTQUFTQyxPQUFPQyxJQUFJLENBQUVGLE9BQVFYLE1BQU0sS0FBSyxHQUFJO29CQUNoRCxPQUFPUyxPQUFPLENBQUVWLEVBQUc7Z0JBQ3JCO1lBQ0Y7UUFDRixPQUNLO1lBQ0hULFVBQVVBLE9BQVEsT0FBTztRQUMzQjtJQUNGO0FBQ0Y7QUEvRkUseUdBQXlHO0FBRnRGTCxvQkFHSUksVUFBVSxDQUFDLEdBQUdQLFVBQUFBLDRCQUFBQSxlQUFBQSxRQUFRZ0MsSUFBSSxzQkFBWmhDLHVCQUFBQSxhQUFjaUMsT0FBTyxzQkFBckJqQyx1Q0FBQUEscUJBQXVCa0MsZUFBZSxxQkFBdENsQyxxQ0FBd0NtQyx5QkFBeUI7QUFFdEcsd0dBQXdHO0FBQ3hHLHVEQUF1RDtBQUN2RCw2RUFBNkU7QUFQMURoQyxvQkFRSWEsT0FBeUIsQ0FBQztBQUVqRCxrR0FBa0c7QUFDbEcsc0hBQXNIO0FBWG5HYixvQkFZSU0sTUFBK0IsSUFBSTJCO0FBRTFELHdFQUF3RTtBQWRyRGpDLG9CQWVJa0IsZUFBZSxJQUFJcEI7QUFmdkJFLG9CQWdCSXNCLGlCQUFpQixJQUFJeEI7QUFoQjlDLFNBQXFCRSxpQ0FpR3BCO0FBRURELGdCQUFnQm1DLFFBQVEsQ0FBRSx1QkFBdUJsQyJ9