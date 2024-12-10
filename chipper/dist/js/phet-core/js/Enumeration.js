// Copyright 2021-2024, University of Colorado Boulder
/**
 * This implementation auto-detects the enumeration values by Object.keys and instanceof. Every property that has a
 * type matching the enumeration type is marked as a value.  See sample usage in Orientation.ts.
 *
 * For general pattern see https://github.com/phetsims/phet-info/blob/main/doc/phet-software-design-patterns.md#enumeration
 *
 * This creates 2-way maps (key-to-value and value-to-key) for ease of use and to enable phet-io serialization.
 *
 * class T extends EnumerationValue {
 *     static a=new T();
 *     static b =new T();
 *     getName(){return 'he';}
 *     get thing(){return 'text';}
 *     static get age(){return 77;}
 *     static enumeration = new Enumeration( T );
 * }
 * T.enumeration.keys => ['a', 'b']
 * T.enumeration.values => [T, T]
 *
 * Note how `keys` only picks up 'a' and 'b'.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import EnumerationValue from './EnumerationValue.js';
import inheritance from './inheritance.js';
import optionize from './optionize.js';
import phetCore from './phetCore.js';
let Enumeration = class Enumeration {
    getKey(value) {
        return value.name;
    }
    getValue(key) {
        return this.Enumeration[key];
    }
    includes(value) {
        return this.values.includes(value);
    }
    constructor(Enumeration, providedOptions){
        const options = optionize()({
            phetioDocumentation: '',
            // Values are plucked from the supplied Enumeration, but in order to support subtyping (augmenting) Enumerations,
            // you can specify the rule for what counts as a member of the enumeration. This should only be used in the
            // special case of augmenting existing enumerations.
            instanceType: Enumeration
        }, providedOptions);
        this.phetioDocumentation = options.phetioDocumentation;
        const instanceType = options.instanceType;
        // Iterate over the type hierarchy to support augmenting enumerations, but reverse so that newly added enumeration
        // values appear after previously existing enumeration values
        const types = _.reverse(inheritance(Enumeration));
        assert && assert(types.includes(instanceType), 'the specified type should be in its own hierarchy');
        this.keys = [];
        this.values = [];
        types.forEach((type)=>{
            Object.keys(type).forEach((key)=>{
                const value = type[key];
                if (value instanceof instanceType) {
                    assert && assert(key === key.toUpperCase(), 'keys should be upper case by convention');
                    this.keys.push(key);
                    this.values.push(value);
                    // Only assign this to the lowest Enumeration in the hierarchy. Otherwise this would overwrite the
                    // supertype-assigned Enumeration. See https://github.com/phetsims/phet-core/issues/102
                    if (value instanceof Enumeration) {
                        value.name = key;
                        value.enumeration = this;
                    }
                }
            });
        });
        assert && assert(this.keys.length > 0, 'no keys found');
        assert && assert(this.values.length > 0, 'no values found');
        this.Enumeration = Enumeration;
        EnumerationValue.sealedCache.add(Enumeration);
    }
};
phetCore.register('Enumeration', Enumeration);
export default Enumeration;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBUaGlzIGltcGxlbWVudGF0aW9uIGF1dG8tZGV0ZWN0cyB0aGUgZW51bWVyYXRpb24gdmFsdWVzIGJ5IE9iamVjdC5rZXlzIGFuZCBpbnN0YW5jZW9mLiBFdmVyeSBwcm9wZXJ0eSB0aGF0IGhhcyBhXG4gKiB0eXBlIG1hdGNoaW5nIHRoZSBlbnVtZXJhdGlvbiB0eXBlIGlzIG1hcmtlZCBhcyBhIHZhbHVlLiAgU2VlIHNhbXBsZSB1c2FnZSBpbiBPcmllbnRhdGlvbi50cy5cbiAqXG4gKiBGb3IgZ2VuZXJhbCBwYXR0ZXJuIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pbmZvL2Jsb2IvbWFpbi9kb2MvcGhldC1zb2Z0d2FyZS1kZXNpZ24tcGF0dGVybnMubWQjZW51bWVyYXRpb25cbiAqXG4gKiBUaGlzIGNyZWF0ZXMgMi13YXkgbWFwcyAoa2V5LXRvLXZhbHVlIGFuZCB2YWx1ZS10by1rZXkpIGZvciBlYXNlIG9mIHVzZSBhbmQgdG8gZW5hYmxlIHBoZXQtaW8gc2VyaWFsaXphdGlvbi5cbiAqXG4gKiBjbGFzcyBUIGV4dGVuZHMgRW51bWVyYXRpb25WYWx1ZSB7XG4gKiAgICAgc3RhdGljIGE9bmV3IFQoKTtcbiAqICAgICBzdGF0aWMgYiA9bmV3IFQoKTtcbiAqICAgICBnZXROYW1lKCl7cmV0dXJuICdoZSc7fVxuICogICAgIGdldCB0aGluZygpe3JldHVybiAndGV4dCc7fVxuICogICAgIHN0YXRpYyBnZXQgYWdlKCl7cmV0dXJuIDc3O31cbiAqICAgICBzdGF0aWMgZW51bWVyYXRpb24gPSBuZXcgRW51bWVyYXRpb24oIFQgKTtcbiAqIH1cbiAqIFQuZW51bWVyYXRpb24ua2V5cyA9PiBbJ2EnLCAnYiddXG4gKiBULmVudW1lcmF0aW9uLnZhbHVlcyA9PiBbVCwgVF1cbiAqXG4gKiBOb3RlIGhvdyBga2V5c2Agb25seSBwaWNrcyB1cCAnYScgYW5kICdiJy5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBFbnVtZXJhdGlvblZhbHVlIGZyb20gJy4vRW51bWVyYXRpb25WYWx1ZS5qcyc7XG5pbXBvcnQgaW5oZXJpdGFuY2UgZnJvbSAnLi9pbmhlcml0YW5jZS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4vb3B0aW9uaXplLmpzJztcbmltcG9ydCBwaGV0Q29yZSBmcm9tICcuL3BoZXRDb3JlLmpzJztcbmltcG9ydCBURW51bWVyYXRpb24gZnJvbSAnLi9URW51bWVyYXRpb24uanMnO1xuaW1wb3J0IENvbnN0cnVjdG9yIGZyb20gJy4vdHlwZXMvQ29uc3RydWN0b3IuanMnO1xuXG5leHBvcnQgdHlwZSBFbnVtZXJhdGlvbk9wdGlvbnM8VCBleHRlbmRzIEVudW1lcmF0aW9uVmFsdWU+ID0ge1xuICBwaGV0aW9Eb2N1bWVudGF0aW9uPzogc3RyaW5nO1xuICBpbnN0YW5jZVR5cGU/OiBDb25zdHJ1Y3RvcjxUPjtcbn07XG5cbmNsYXNzIEVudW1lcmF0aW9uPFQgZXh0ZW5kcyBFbnVtZXJhdGlvblZhbHVlPiBpbXBsZW1lbnRzIFRFbnVtZXJhdGlvbjxUPiB7XG4gIHB1YmxpYyByZWFkb25seSB2YWx1ZXM6IFRbXTsgLy8gaW4gdGhlIG9yZGVyIHRoYXQgc3RhdGljIGluc3RhbmNlcyBhcmUgZGVmaW5lZFxuICBwdWJsaWMgcmVhZG9ubHkga2V5czogc3RyaW5nW107XG4gIHB1YmxpYyByZWFkb25seSBFbnVtZXJhdGlvbjogQ29uc3RydWN0b3I8VD4gJiBSZWNvcmQ8c3RyaW5nLCBUPjtcbiAgcHVibGljIHJlYWRvbmx5IHBoZXRpb0RvY3VtZW50YXRpb24/OiBzdHJpbmc7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBFbnVtZXJhdGlvbjogQ29uc3RydWN0b3I8VD4sIHByb3ZpZGVkT3B0aW9ucz86IEVudW1lcmF0aW9uT3B0aW9uczxUPiApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8RW51bWVyYXRpb25PcHRpb25zPFQ+PigpKCB7XG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnJyxcblxuICAgICAgLy8gVmFsdWVzIGFyZSBwbHVja2VkIGZyb20gdGhlIHN1cHBsaWVkIEVudW1lcmF0aW9uLCBidXQgaW4gb3JkZXIgdG8gc3VwcG9ydCBzdWJ0eXBpbmcgKGF1Z21lbnRpbmcpIEVudW1lcmF0aW9ucyxcbiAgICAgIC8vIHlvdSBjYW4gc3BlY2lmeSB0aGUgcnVsZSBmb3Igd2hhdCBjb3VudHMgYXMgYSBtZW1iZXIgb2YgdGhlIGVudW1lcmF0aW9uLiBUaGlzIHNob3VsZCBvbmx5IGJlIHVzZWQgaW4gdGhlXG4gICAgICAvLyBzcGVjaWFsIGNhc2Ugb2YgYXVnbWVudGluZyBleGlzdGluZyBlbnVtZXJhdGlvbnMuXG4gICAgICBpbnN0YW5jZVR5cGU6IEVudW1lcmF0aW9uXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG4gICAgdGhpcy5waGV0aW9Eb2N1bWVudGF0aW9uID0gb3B0aW9ucy5waGV0aW9Eb2N1bWVudGF0aW9uO1xuXG4gICAgY29uc3QgaW5zdGFuY2VUeXBlID0gb3B0aW9ucy5pbnN0YW5jZVR5cGU7XG5cbiAgICAvLyBJdGVyYXRlIG92ZXIgdGhlIHR5cGUgaGllcmFyY2h5IHRvIHN1cHBvcnQgYXVnbWVudGluZyBlbnVtZXJhdGlvbnMsIGJ1dCByZXZlcnNlIHNvIHRoYXQgbmV3bHkgYWRkZWQgZW51bWVyYXRpb25cbiAgICAvLyB2YWx1ZXMgYXBwZWFyIGFmdGVyIHByZXZpb3VzbHkgZXhpc3RpbmcgZW51bWVyYXRpb24gdmFsdWVzXG4gICAgY29uc3QgdHlwZXMgPSBfLnJldmVyc2UoIGluaGVyaXRhbmNlKCBFbnVtZXJhdGlvbiApICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlcy5pbmNsdWRlcyggaW5zdGFuY2VUeXBlICksICd0aGUgc3BlY2lmaWVkIHR5cGUgc2hvdWxkIGJlIGluIGl0cyBvd24gaGllcmFyY2h5JyApO1xuXG4gICAgdGhpcy5rZXlzID0gW107XG4gICAgdGhpcy52YWx1ZXMgPSBbXTtcbiAgICB0eXBlcy5mb3JFYWNoKCB0eXBlID0+IHtcbiAgICAgIE9iamVjdC5rZXlzKCB0eXBlICkuZm9yRWFjaCgga2V5ID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSB0eXBlWyBrZXkgXTtcbiAgICAgICAgaWYgKCB2YWx1ZSBpbnN0YW5jZW9mIGluc3RhbmNlVHlwZSApIHtcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBrZXkgPT09IGtleS50b1VwcGVyQ2FzZSgpLCAna2V5cyBzaG91bGQgYmUgdXBwZXIgY2FzZSBieSBjb252ZW50aW9uJyApO1xuICAgICAgICAgIHRoaXMua2V5cy5wdXNoKCBrZXkgKTtcbiAgICAgICAgICB0aGlzLnZhbHVlcy5wdXNoKCB2YWx1ZSApO1xuXG4gICAgICAgICAgLy8gT25seSBhc3NpZ24gdGhpcyB0byB0aGUgbG93ZXN0IEVudW1lcmF0aW9uIGluIHRoZSBoaWVyYXJjaHkuIE90aGVyd2lzZSB0aGlzIHdvdWxkIG92ZXJ3cml0ZSB0aGVcbiAgICAgICAgICAvLyBzdXBlcnR5cGUtYXNzaWduZWQgRW51bWVyYXRpb24uIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1jb3JlL2lzc3Vlcy8xMDJcbiAgICAgICAgICBpZiAoIHZhbHVlIGluc3RhbmNlb2YgRW51bWVyYXRpb24gKSB7XG4gICAgICAgICAgICB2YWx1ZS5uYW1lID0ga2V5O1xuICAgICAgICAgICAgdmFsdWUuZW51bWVyYXRpb24gPSB0aGlzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH0gKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMua2V5cy5sZW5ndGggPiAwLCAnbm8ga2V5cyBmb3VuZCcgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnZhbHVlcy5sZW5ndGggPiAwLCAnbm8gdmFsdWVzIGZvdW5kJyApO1xuXG4gICAgdGhpcy5FbnVtZXJhdGlvbiA9IEVudW1lcmF0aW9uIGFzIENvbnN0cnVjdG9yPFQ+ICYgUmVjb3JkPHN0cmluZywgVD47XG4gICAgRW51bWVyYXRpb25WYWx1ZS5zZWFsZWRDYWNoZS5hZGQoIEVudW1lcmF0aW9uICk7XG4gIH1cblxuICBwdWJsaWMgZ2V0S2V5KCB2YWx1ZTogVCApOiBzdHJpbmcge1xuICAgIHJldHVybiB2YWx1ZS5uYW1lO1xuICB9XG5cbiAgcHVibGljIGdldFZhbHVlKCBrZXk6IHN0cmluZyApOiBUIHtcbiAgICByZXR1cm4gdGhpcy5FbnVtZXJhdGlvblsga2V5IF07XG4gIH1cblxuICBwdWJsaWMgaW5jbHVkZXMoIHZhbHVlOiBUICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnZhbHVlcy5pbmNsdWRlcyggdmFsdWUgKTtcbiAgfVxufVxuXG5waGV0Q29yZS5yZWdpc3RlciggJ0VudW1lcmF0aW9uJywgRW51bWVyYXRpb24gKTtcblxuZXhwb3J0IGRlZmF1bHQgRW51bWVyYXRpb247Il0sIm5hbWVzIjpbIkVudW1lcmF0aW9uVmFsdWUiLCJpbmhlcml0YW5jZSIsIm9wdGlvbml6ZSIsInBoZXRDb3JlIiwiRW51bWVyYXRpb24iLCJnZXRLZXkiLCJ2YWx1ZSIsIm5hbWUiLCJnZXRWYWx1ZSIsImtleSIsImluY2x1ZGVzIiwidmFsdWVzIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJpbnN0YW5jZVR5cGUiLCJ0eXBlcyIsIl8iLCJyZXZlcnNlIiwiYXNzZXJ0Iiwia2V5cyIsImZvckVhY2giLCJ0eXBlIiwiT2JqZWN0IiwidG9VcHBlckNhc2UiLCJwdXNoIiwiZW51bWVyYXRpb24iLCJsZW5ndGgiLCJzZWFsZWRDYWNoZSIsImFkZCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBdUJDLEdBRUQsT0FBT0Esc0JBQXNCLHdCQUF3QjtBQUNyRCxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBQzNDLE9BQU9DLGVBQWUsaUJBQWlCO0FBQ3ZDLE9BQU9DLGNBQWMsZ0JBQWdCO0FBU3JDLElBQUEsQUFBTUMsY0FBTixNQUFNQTtJQXFER0MsT0FBUUMsS0FBUSxFQUFXO1FBQ2hDLE9BQU9BLE1BQU1DLElBQUk7SUFDbkI7SUFFT0MsU0FBVUMsR0FBVyxFQUFNO1FBQ2hDLE9BQU8sSUFBSSxDQUFDTCxXQUFXLENBQUVLLElBQUs7SUFDaEM7SUFFT0MsU0FBVUosS0FBUSxFQUFZO1FBQ25DLE9BQU8sSUFBSSxDQUFDSyxNQUFNLENBQUNELFFBQVEsQ0FBRUo7SUFDL0I7SUF6REEsWUFBb0JGLFdBQTJCLEVBQUVRLGVBQXVDLENBQUc7UUFFekYsTUFBTUMsVUFBVVgsWUFBb0M7WUFDbERZLHFCQUFxQjtZQUVyQixpSEFBaUg7WUFDakgsMkdBQTJHO1lBQzNHLG9EQUFvRDtZQUNwREMsY0FBY1g7UUFDaEIsR0FBR1E7UUFDSCxJQUFJLENBQUNFLG1CQUFtQixHQUFHRCxRQUFRQyxtQkFBbUI7UUFFdEQsTUFBTUMsZUFBZUYsUUFBUUUsWUFBWTtRQUV6QyxrSEFBa0g7UUFDbEgsNkRBQTZEO1FBQzdELE1BQU1DLFFBQVFDLEVBQUVDLE9BQU8sQ0FBRWpCLFlBQWFHO1FBRXRDZSxVQUFVQSxPQUFRSCxNQUFNTixRQUFRLENBQUVLLGVBQWdCO1FBRWxELElBQUksQ0FBQ0ssSUFBSSxHQUFHLEVBQUU7UUFDZCxJQUFJLENBQUNULE1BQU0sR0FBRyxFQUFFO1FBQ2hCSyxNQUFNSyxPQUFPLENBQUVDLENBQUFBO1lBQ2JDLE9BQU9ILElBQUksQ0FBRUUsTUFBT0QsT0FBTyxDQUFFWixDQUFBQTtnQkFDM0IsTUFBTUgsUUFBUWdCLElBQUksQ0FBRWIsSUFBSztnQkFDekIsSUFBS0gsaUJBQWlCUyxjQUFlO29CQUNuQ0ksVUFBVUEsT0FBUVYsUUFBUUEsSUFBSWUsV0FBVyxJQUFJO29CQUM3QyxJQUFJLENBQUNKLElBQUksQ0FBQ0ssSUFBSSxDQUFFaEI7b0JBQ2hCLElBQUksQ0FBQ0UsTUFBTSxDQUFDYyxJQUFJLENBQUVuQjtvQkFFbEIsa0dBQWtHO29CQUNsRyx1RkFBdUY7b0JBQ3ZGLElBQUtBLGlCQUFpQkYsYUFBYzt3QkFDbENFLE1BQU1DLElBQUksR0FBR0U7d0JBQ2JILE1BQU1vQixXQUFXLEdBQUcsSUFBSTtvQkFDMUI7Z0JBQ0Y7WUFDRjtRQUNGO1FBRUFQLFVBQVVBLE9BQVEsSUFBSSxDQUFDQyxJQUFJLENBQUNPLE1BQU0sR0FBRyxHQUFHO1FBQ3hDUixVQUFVQSxPQUFRLElBQUksQ0FBQ1IsTUFBTSxDQUFDZ0IsTUFBTSxHQUFHLEdBQUc7UUFFMUMsSUFBSSxDQUFDdkIsV0FBVyxHQUFHQTtRQUNuQkosaUJBQWlCNEIsV0FBVyxDQUFDQyxHQUFHLENBQUV6QjtJQUNwQztBQWFGO0FBRUFELFNBQVMyQixRQUFRLENBQUUsZUFBZTFCO0FBRWxDLGVBQWVBLFlBQVkifQ==