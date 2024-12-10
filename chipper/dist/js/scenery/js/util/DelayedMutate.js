// Copyright 2022-2024, University of Colorado Boulder
/**
 * A mixin that delays the mutation of a certain set of mutation keys until AFTER the super() call has fully finished.
 * This can be wrapped around a type where a mutate( { someKey: ... } ) would cause an error in the super(), and we
 * want to postpone that until after construction. e.g.:
 *
 * const SomeNode = DelayedMutate( 'SomeNode', [ 'someOption' ], class extends SuperNode {
 *   constructor( options ) {
 *     super( options );
 *
 *     this.someOptionProperty = new Property( something );
 *   }
 *
 *   set someOption( value: Something ) {
 *     this.someOptionProperty.value = value;
 *   }
 *
 *   get someOption(): Something {
 *     return this.someOptionProperty.value;
 *   }
 * } );
 *
 * If this was NOT done, the following would error out:
 *
 * new SomeNode( { someOption: something } )
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { combineOptions } from '../../../phet-core/js/optionize.js';
import { scenery } from '../imports.js';
/**
 * @param name - A unique name for each call, which customizes the internal key names used to track state
 * @param keys - An array of the mutate option names that should be delayed
 * @param type - The class we're mixing into
 */ const DelayedMutate = (name, keys, type)=>{
    // We typecast these to strings to satisfy the type-checker without large amounts of grief. It doesn't seem to be
    // able to parse that we're using the same keys for each call of this.
    const pendingOptionsKey = `_${name}PendingOptions`;
    const isConstructedKey = `_${name}IsConstructed`;
    return class DelayedMutateMixin extends type {
        // Typescript doesn't want an override here, but we're overriding it
        mutate(options) {
            // If we're not constructed, we need to save the options for later
            // NOTE: If we haven't SET the constructed field yet, then it will be undefined (and falsy), so we do a check
            // for that here.
            if (options && !this[isConstructedKey]) {
                // Store delayed options. If we've provided the same option before, we'll want to use the most recent
                // (so a merge makes sense).
                this[pendingOptionsKey] = combineOptions(this[pendingOptionsKey] || {}, _.pick(options, keys));
                // We'll still want to mutate with the non-delayed options
                options = _.omit(options, keys);
            }
            return super.mutate(options);
        }
        constructor(...args){
            super(...args);
            // Mark ourself as constructed, so further mutates will use all of the options
            this[isConstructedKey] = true;
            // Apply any options that we delayed
            this.mutate(this[pendingOptionsKey]);
            // Prevent memory leaks by tossing the options data that we've now used
            this[pendingOptionsKey] = undefined;
        }
    };
};
scenery.register('DelayedMutate', DelayedMutate);
export default DelayedMutate;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9EZWxheWVkTXV0YXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgbWl4aW4gdGhhdCBkZWxheXMgdGhlIG11dGF0aW9uIG9mIGEgY2VydGFpbiBzZXQgb2YgbXV0YXRpb24ga2V5cyB1bnRpbCBBRlRFUiB0aGUgc3VwZXIoKSBjYWxsIGhhcyBmdWxseSBmaW5pc2hlZC5cbiAqIFRoaXMgY2FuIGJlIHdyYXBwZWQgYXJvdW5kIGEgdHlwZSB3aGVyZSBhIG11dGF0ZSggeyBzb21lS2V5OiAuLi4gfSApIHdvdWxkIGNhdXNlIGFuIGVycm9yIGluIHRoZSBzdXBlcigpLCBhbmQgd2VcbiAqIHdhbnQgdG8gcG9zdHBvbmUgdGhhdCB1bnRpbCBhZnRlciBjb25zdHJ1Y3Rpb24uIGUuZy46XG4gKlxuICogY29uc3QgU29tZU5vZGUgPSBEZWxheWVkTXV0YXRlKCAnU29tZU5vZGUnLCBbICdzb21lT3B0aW9uJyBdLCBjbGFzcyBleHRlbmRzIFN1cGVyTm9kZSB7XG4gKiAgIGNvbnN0cnVjdG9yKCBvcHRpb25zICkge1xuICogICAgIHN1cGVyKCBvcHRpb25zICk7XG4gKlxuICogICAgIHRoaXMuc29tZU9wdGlvblByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBzb21ldGhpbmcgKTtcbiAqICAgfVxuICpcbiAqICAgc2V0IHNvbWVPcHRpb24oIHZhbHVlOiBTb21ldGhpbmcgKSB7XG4gKiAgICAgdGhpcy5zb21lT3B0aW9uUHJvcGVydHkudmFsdWUgPSB2YWx1ZTtcbiAqICAgfVxuICpcbiAqICAgZ2V0IHNvbWVPcHRpb24oKTogU29tZXRoaW5nIHtcbiAqICAgICByZXR1cm4gdGhpcy5zb21lT3B0aW9uUHJvcGVydHkudmFsdWU7XG4gKiAgIH1cbiAqIH0gKTtcbiAqXG4gKiBJZiB0aGlzIHdhcyBOT1QgZG9uZSwgdGhlIGZvbGxvd2luZyB3b3VsZCBlcnJvciBvdXQ6XG4gKlxuICogbmV3IFNvbWVOb2RlKCB7IHNvbWVPcHRpb246IHNvbWV0aGluZyB9IClcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBDb25zdHJ1Y3RvciBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvQ29uc3RydWN0b3IuanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgeyBOb2RlLCBOb2RlT3B0aW9ucywgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG4vKipcbiAqIEBwYXJhbSBuYW1lIC0gQSB1bmlxdWUgbmFtZSBmb3IgZWFjaCBjYWxsLCB3aGljaCBjdXN0b21pemVzIHRoZSBpbnRlcm5hbCBrZXkgbmFtZXMgdXNlZCB0byB0cmFjayBzdGF0ZVxuICogQHBhcmFtIGtleXMgLSBBbiBhcnJheSBvZiB0aGUgbXV0YXRlIG9wdGlvbiBuYW1lcyB0aGF0IHNob3VsZCBiZSBkZWxheWVkXG4gKiBAcGFyYW0gdHlwZSAtIFRoZSBjbGFzcyB3ZSdyZSBtaXhpbmcgaW50b1xuICovXG5jb25zdCBEZWxheWVkTXV0YXRlID0gPFN1cGVyVHlwZSBleHRlbmRzIENvbnN0cnVjdG9yPE5vZGU+PiggbmFtZTogc3RyaW5nLCBrZXlzOiBzdHJpbmdbXSwgdHlwZTogU3VwZXJUeXBlICk6IFN1cGVyVHlwZSA9PiB7XG5cbiAgLy8gV2UgdHlwZWNhc3QgdGhlc2UgdG8gc3RyaW5ncyB0byBzYXRpc2Z5IHRoZSB0eXBlLWNoZWNrZXIgd2l0aG91dCBsYXJnZSBhbW91bnRzIG9mIGdyaWVmLiBJdCBkb2Vzbid0IHNlZW0gdG8gYmVcbiAgLy8gYWJsZSB0byBwYXJzZSB0aGF0IHdlJ3JlIHVzaW5nIHRoZSBzYW1lIGtleXMgZm9yIGVhY2ggY2FsbCBvZiB0aGlzLlxuICBjb25zdCBwZW5kaW5nT3B0aW9uc0tleSA9IGBfJHtuYW1lfVBlbmRpbmdPcHRpb25zYCBhcyAnX2Zha2VQZW5kaW5nT3B0aW9uc1R5cGUnO1xuICBjb25zdCBpc0NvbnN0cnVjdGVkS2V5ID0gYF8ke25hbWV9SXNDb25zdHJ1Y3RlZGAgYXMgJ19mYWtlSXNDb25zdHJ1Y3RlZFR5cGUnO1xuXG4gIHJldHVybiBjbGFzcyBEZWxheWVkTXV0YXRlTWl4aW4gZXh0ZW5kcyB0eXBlIHtcblxuICAgIC8vIFdlIG5lZWQgdG8gc3RvcmUgZGlmZmVyZW50IGZpZWxkcyBpbiBlYWNoIGNsYXNzLCBzbyB3ZSB1c2UgY29tcHV0ZWQgcHJvcGVydGllc1xuICAgIHByaXZhdGUgWyBpc0NvbnN0cnVjdGVkS2V5IF06IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBbIHBlbmRpbmdPcHRpb25zS2V5IF06IE5vZGVPcHRpb25zIHwgdW5kZWZpbmVkO1xuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKCAuLi5hcmdzOiBJbnRlbnRpb25hbEFueVtdICkge1xuICAgICAgc3VwZXIoIC4uLmFyZ3MgKTtcblxuICAgICAgLy8gTWFyayBvdXJzZWxmIGFzIGNvbnN0cnVjdGVkLCBzbyBmdXJ0aGVyIG11dGF0ZXMgd2lsbCB1c2UgYWxsIG9mIHRoZSBvcHRpb25zXG4gICAgICB0aGlzWyBpc0NvbnN0cnVjdGVkS2V5IF0gPSB0cnVlO1xuXG4gICAgICAvLyBBcHBseSBhbnkgb3B0aW9ucyB0aGF0IHdlIGRlbGF5ZWRcbiAgICAgIHRoaXMubXV0YXRlKCB0aGlzWyBwZW5kaW5nT3B0aW9uc0tleSBdICk7XG5cbiAgICAgIC8vIFByZXZlbnQgbWVtb3J5IGxlYWtzIGJ5IHRvc3NpbmcgdGhlIG9wdGlvbnMgZGF0YSB0aGF0IHdlJ3ZlIG5vdyB1c2VkXG4gICAgICB0aGlzWyBwZW5kaW5nT3B0aW9uc0tleSBdID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8vIFR5cGVzY3JpcHQgZG9lc24ndCB3YW50IGFuIG92ZXJyaWRlIGhlcmUsIGJ1dCB3ZSdyZSBvdmVycmlkaW5nIGl0XG4gICAgcHVibGljIG92ZXJyaWRlIG11dGF0ZSggb3B0aW9ucz86IE5vZGVPcHRpb25zICk6IHRoaXMge1xuXG4gICAgICAvLyBJZiB3ZSdyZSBub3QgY29uc3RydWN0ZWQsIHdlIG5lZWQgdG8gc2F2ZSB0aGUgb3B0aW9ucyBmb3IgbGF0ZXJcbiAgICAgIC8vIE5PVEU6IElmIHdlIGhhdmVuJ3QgU0VUIHRoZSBjb25zdHJ1Y3RlZCBmaWVsZCB5ZXQsIHRoZW4gaXQgd2lsbCBiZSB1bmRlZmluZWQgKGFuZCBmYWxzeSksIHNvIHdlIGRvIGEgY2hlY2tcbiAgICAgIC8vIGZvciB0aGF0IGhlcmUuXG4gICAgICBpZiAoIG9wdGlvbnMgJiYgIXRoaXNbIGlzQ29uc3RydWN0ZWRLZXkgXSApIHtcbiAgICAgICAgLy8gU3RvcmUgZGVsYXllZCBvcHRpb25zLiBJZiB3ZSd2ZSBwcm92aWRlZCB0aGUgc2FtZSBvcHRpb24gYmVmb3JlLCB3ZSdsbCB3YW50IHRvIHVzZSB0aGUgbW9zdCByZWNlbnRcbiAgICAgICAgLy8gKHNvIGEgbWVyZ2UgbWFrZXMgc2Vuc2UpLlxuICAgICAgICB0aGlzWyBwZW5kaW5nT3B0aW9uc0tleSBdID0gY29tYmluZU9wdGlvbnM8Tm9kZU9wdGlvbnM+KCB0aGlzWyBwZW5kaW5nT3B0aW9uc0tleSBdIHx8IHt9LCBfLnBpY2soIG9wdGlvbnMsIGtleXMgKSApO1xuXG4gICAgICAgIC8vIFdlJ2xsIHN0aWxsIHdhbnQgdG8gbXV0YXRlIHdpdGggdGhlIG5vbi1kZWxheWVkIG9wdGlvbnNcbiAgICAgICAgb3B0aW9ucyA9IF8ub21pdCggb3B0aW9ucywga2V5cyApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3VwZXIubXV0YXRlKCBvcHRpb25zICk7XG4gICAgfVxuICB9O1xufTtcblxuc2NlbmVyeS5yZWdpc3RlciggJ0RlbGF5ZWRNdXRhdGUnLCBEZWxheWVkTXV0YXRlICk7XG5leHBvcnQgZGVmYXVsdCBEZWxheWVkTXV0YXRlOyJdLCJuYW1lcyI6WyJjb21iaW5lT3B0aW9ucyIsInNjZW5lcnkiLCJEZWxheWVkTXV0YXRlIiwibmFtZSIsImtleXMiLCJ0eXBlIiwicGVuZGluZ09wdGlvbnNLZXkiLCJpc0NvbnN0cnVjdGVkS2V5IiwiRGVsYXllZE11dGF0ZU1peGluIiwibXV0YXRlIiwib3B0aW9ucyIsIl8iLCJwaWNrIiwib21pdCIsImFyZ3MiLCJ1bmRlZmluZWQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTBCQyxHQUVELFNBQVNBLGNBQWMsUUFBUSxxQ0FBcUM7QUFHcEUsU0FBNEJDLE9BQU8sUUFBUSxnQkFBZ0I7QUFFM0Q7Ozs7Q0FJQyxHQUNELE1BQU1DLGdCQUFnQixDQUF1Q0MsTUFBY0MsTUFBZ0JDO0lBRXpGLGlIQUFpSDtJQUNqSCxzRUFBc0U7SUFDdEUsTUFBTUMsb0JBQW9CLENBQUMsQ0FBQyxFQUFFSCxLQUFLLGNBQWMsQ0FBQztJQUNsRCxNQUFNSSxtQkFBbUIsQ0FBQyxDQUFDLEVBQUVKLEtBQUssYUFBYSxDQUFDO0lBRWhELE9BQU8sTUFBTUssMkJBQTJCSDtRQW1CdEMsb0VBQW9FO1FBQ3BESSxPQUFRQyxPQUFxQixFQUFTO1lBRXBELGtFQUFrRTtZQUNsRSw2R0FBNkc7WUFDN0csaUJBQWlCO1lBQ2pCLElBQUtBLFdBQVcsQ0FBQyxJQUFJLENBQUVILGlCQUFrQixFQUFHO2dCQUMxQyxxR0FBcUc7Z0JBQ3JHLDRCQUE0QjtnQkFDNUIsSUFBSSxDQUFFRCxrQkFBbUIsR0FBR04sZUFBNkIsSUFBSSxDQUFFTSxrQkFBbUIsSUFBSSxDQUFDLEdBQUdLLEVBQUVDLElBQUksQ0FBRUYsU0FBU047Z0JBRTNHLDBEQUEwRDtnQkFDMURNLFVBQVVDLEVBQUVFLElBQUksQ0FBRUgsU0FBU047WUFDN0I7WUFFQSxPQUFPLEtBQUssQ0FBQ0ssT0FBUUM7UUFDdkI7UUE3QkEsWUFBb0IsR0FBR0ksSUFBc0IsQ0FBRztZQUM5QyxLQUFLLElBQUtBO1lBRVYsOEVBQThFO1lBQzlFLElBQUksQ0FBRVAsaUJBQWtCLEdBQUc7WUFFM0Isb0NBQW9DO1lBQ3BDLElBQUksQ0FBQ0UsTUFBTSxDQUFFLElBQUksQ0FBRUgsa0JBQW1CO1lBRXRDLHVFQUF1RTtZQUN2RSxJQUFJLENBQUVBLGtCQUFtQixHQUFHUztRQUM5QjtJQW1CRjtBQUNGO0FBRUFkLFFBQVFlLFFBQVEsQ0FBRSxpQkFBaUJkO0FBQ25DLGVBQWVBLGNBQWMifQ==