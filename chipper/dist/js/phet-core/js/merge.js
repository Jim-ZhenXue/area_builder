// Copyright 2019-2023, University of Colorado Boulder
/**
 * Like Lodash's _.merge, this will recursively merge nested options objects provided that the keys end in 'Options'
 * (case sensitive) and they are pure object literals.
 * That is, they must be defined by `... = { ... }` or `somePropOptions: { ... }`.
 * Non object literals (arrays, functions, and inherited types) or anything with an extra prototype will all throw
 * assertion errors if passed in as an arg or as a value to a `*Options` field.
 *
 * @author Michael Barlow (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import phetCore from './phetCore.js';
// constants
const OPTIONS_SUFFIX = 'Options';
/**
 * @param  {Object} target - the object literal that will have keys set to it
 * @param  {...<Object|null>} sources
 */ function merge(target, ...sources) {
    assert && assertIsMergeable(target);
    assert && assert(target !== null, 'target should not be null'); // assertIsMergeable supports null
    assert && assert(sources.length > 0, 'at least one source expected');
    _.each(sources, (source)=>{
        if (source) {
            assert && assertIsMergeable(source);
            for(const property in source){
                // Providing a value of undefined in the target doesn't override the default, see https://github.com/phetsims/phet-core/issues/111
                if (source.hasOwnProperty(property) && source[property] !== undefined) {
                    const sourceProperty = source[property];
                    // Recurse on keys that end with 'Options', but not on keys named 'Options'.
                    if (_.endsWith(property, OPTIONS_SUFFIX) && property !== OPTIONS_SUFFIX) {
                        // *Options property value cannot be undefined, if truthy, it we be validated with assertIsMergeable via recursion.
                        assert && assert(sourceProperty !== undefined, 'nested *Options should not be undefined');
                        target[property] = merge(target[property] || {}, sourceProperty);
                    } else {
                        target[property] = sourceProperty;
                    }
                }
            }
        }
    });
    return target;
}
/**
 * TODO: can we remove assertIsMergeable? https://github.com/phetsims/phet-core/issues/128
 * Asserts that the object is compatible with merge. That is, it's a POJSO.
 * This function must be called like: assert && assertIsMergeable( arg );
 */ function assertIsMergeable(object) {
    assert && assert(object === null || object && typeof object === 'object' && Object.getPrototypeOf(object) === Object.prototype, 'object is not compatible with merge');
    if (object !== null) {
        // ensure that options keys are not ES5 setters or getters
        Object.keys(object).forEach((prop)=>{
            const ownPropertyDescriptor = Object.getOwnPropertyDescriptor(object, prop);
            assert && assert(!ownPropertyDescriptor.hasOwnProperty('set'), 'cannot use merge with an object that has a setter');
            assert && assert(!ownPropertyDescriptor.hasOwnProperty('get'), 'cannot use merge with an object that has a getter');
        });
    }
}
phetCore.register('merge', merge);
export default merge;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBMaWtlIExvZGFzaCdzIF8ubWVyZ2UsIHRoaXMgd2lsbCByZWN1cnNpdmVseSBtZXJnZSBuZXN0ZWQgb3B0aW9ucyBvYmplY3RzIHByb3ZpZGVkIHRoYXQgdGhlIGtleXMgZW5kIGluICdPcHRpb25zJ1xuICogKGNhc2Ugc2Vuc2l0aXZlKSBhbmQgdGhleSBhcmUgcHVyZSBvYmplY3QgbGl0ZXJhbHMuXG4gKiBUaGF0IGlzLCB0aGV5IG11c3QgYmUgZGVmaW5lZCBieSBgLi4uID0geyAuLi4gfWAgb3IgYHNvbWVQcm9wT3B0aW9uczogeyAuLi4gfWAuXG4gKiBOb24gb2JqZWN0IGxpdGVyYWxzIChhcnJheXMsIGZ1bmN0aW9ucywgYW5kIGluaGVyaXRlZCB0eXBlcykgb3IgYW55dGhpbmcgd2l0aCBhbiBleHRyYSBwcm90b3R5cGUgd2lsbCBhbGwgdGhyb3dcbiAqIGFzc2VydGlvbiBlcnJvcnMgaWYgcGFzc2VkIGluIGFzIGFuIGFyZyBvciBhcyBhIHZhbHVlIHRvIGEgYCpPcHRpb25zYCBmaWVsZC5cbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgQmFybG93IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBwaGV0Q29yZSBmcm9tICcuL3BoZXRDb3JlLmpzJztcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBPUFRJT05TX1NVRkZJWCA9ICdPcHRpb25zJztcblxuLy8gRnVuY3Rpb24gb3ZlcmxvYWRpbmcgaXMgZGVzY3JpYmVkIGluIGh0dHBzOi8vd3d3LnR1dG9yaWFsc3RlYWNoZXIuY29tL3R5cGVzY3JpcHQvZnVuY3Rpb24tb3ZlcmxvYWRpbmdcbmZ1bmN0aW9uIG1lcmdlPEEsIEI+KCBhOiBBLCBiOiBCICk6IEEgJiBCO1xuZnVuY3Rpb24gbWVyZ2U8QSwgQiwgQz4oIGE6IEEsIGI6IEIsIGM6IEMgKTogQSAmIEIgJiBDO1xuZnVuY3Rpb24gbWVyZ2U8QSwgQiwgQywgRD4oIGE6IEEsIGI6IEIsIGM6IEMsIGQ6IEQgKTogQSAmIEIgJiBDICYgRDtcbmZ1bmN0aW9uIG1lcmdlPEEsIEIsIEMsIEQsIEU+KCBhOiBBLCBiOiBCLCBjOiBDLCBkOiBELCBlOiBFICk6IEEgJiBCICYgQyAmIEQgJiBFO1xuXG4vKipcbiAqIEBwYXJhbSAge09iamVjdH0gdGFyZ2V0IC0gdGhlIG9iamVjdCBsaXRlcmFsIHRoYXQgd2lsbCBoYXZlIGtleXMgc2V0IHRvIGl0XG4gKiBAcGFyYW0gIHsuLi48T2JqZWN0fG51bGw+fSBzb3VyY2VzXG4gKi9cbmZ1bmN0aW9uIG1lcmdlKCB0YXJnZXQ6IEludGVudGlvbmFsQW55LCAuLi5zb3VyY2VzOiBJbnRlbnRpb25hbEFueVtdICk6IEludGVudGlvbmFsQW55IHtcbiAgYXNzZXJ0ICYmIGFzc2VydElzTWVyZ2VhYmxlKCB0YXJnZXQgKTtcbiAgYXNzZXJ0ICYmIGFzc2VydCggdGFyZ2V0ICE9PSBudWxsLCAndGFyZ2V0IHNob3VsZCBub3QgYmUgbnVsbCcgKTsgLy8gYXNzZXJ0SXNNZXJnZWFibGUgc3VwcG9ydHMgbnVsbFxuICBhc3NlcnQgJiYgYXNzZXJ0KCBzb3VyY2VzLmxlbmd0aCA+IDAsICdhdCBsZWFzdCBvbmUgc291cmNlIGV4cGVjdGVkJyApO1xuXG4gIF8uZWFjaCggc291cmNlcywgc291cmNlID0+IHtcbiAgICBpZiAoIHNvdXJjZSApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnRJc01lcmdlYWJsZSggc291cmNlICk7XG4gICAgICBmb3IgKCBjb25zdCBwcm9wZXJ0eSBpbiBzb3VyY2UgKSB7XG5cbiAgICAgICAgLy8gUHJvdmlkaW5nIGEgdmFsdWUgb2YgdW5kZWZpbmVkIGluIHRoZSB0YXJnZXQgZG9lc24ndCBvdmVycmlkZSB0aGUgZGVmYXVsdCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWNvcmUvaXNzdWVzLzExMVxuICAgICAgICBpZiAoIHNvdXJjZS5oYXNPd25Qcm9wZXJ0eSggcHJvcGVydHkgKSAmJiBzb3VyY2VbIHByb3BlcnR5IF0gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICBjb25zdCBzb3VyY2VQcm9wZXJ0eSA9IHNvdXJjZVsgcHJvcGVydHkgXTtcblxuICAgICAgICAgIC8vIFJlY3Vyc2Ugb24ga2V5cyB0aGF0IGVuZCB3aXRoICdPcHRpb25zJywgYnV0IG5vdCBvbiBrZXlzIG5hbWVkICdPcHRpb25zJy5cbiAgICAgICAgICBpZiAoIF8uZW5kc1dpdGgoIHByb3BlcnR5LCBPUFRJT05TX1NVRkZJWCApICYmIHByb3BlcnR5ICE9PSBPUFRJT05TX1NVRkZJWCApIHtcblxuICAgICAgICAgICAgLy8gKk9wdGlvbnMgcHJvcGVydHkgdmFsdWUgY2Fubm90IGJlIHVuZGVmaW5lZCwgaWYgdHJ1dGh5LCBpdCB3ZSBiZSB2YWxpZGF0ZWQgd2l0aCBhc3NlcnRJc01lcmdlYWJsZSB2aWEgcmVjdXJzaW9uLlxuICAgICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggc291cmNlUHJvcGVydHkgIT09IHVuZGVmaW5lZCwgJ25lc3RlZCAqT3B0aW9ucyBzaG91bGQgbm90IGJlIHVuZGVmaW5lZCcgKTtcbiAgICAgICAgICAgIHRhcmdldFsgcHJvcGVydHkgXSA9IG1lcmdlKCB0YXJnZXRbIHByb3BlcnR5IF0gfHwge30sIHNvdXJjZVByb3BlcnR5ICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0WyBwcm9wZXJ0eSBdID0gc291cmNlUHJvcGVydHk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9ICk7XG4gIHJldHVybiB0YXJnZXQ7XG59XG5cbi8qKlxuICogVE9ETzogY2FuIHdlIHJlbW92ZSBhc3NlcnRJc01lcmdlYWJsZT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtY29yZS9pc3N1ZXMvMTI4XG4gKiBBc3NlcnRzIHRoYXQgdGhlIG9iamVjdCBpcyBjb21wYXRpYmxlIHdpdGggbWVyZ2UuIFRoYXQgaXMsIGl0J3MgYSBQT0pTTy5cbiAqIFRoaXMgZnVuY3Rpb24gbXVzdCBiZSBjYWxsZWQgbGlrZTogYXNzZXJ0ICYmIGFzc2VydElzTWVyZ2VhYmxlKCBhcmcgKTtcbiAqL1xuZnVuY3Rpb24gYXNzZXJ0SXNNZXJnZWFibGUoIG9iamVjdDogSW50ZW50aW9uYWxBbnkgKTogdm9pZCB7XG4gIGFzc2VydCAmJiBhc3NlcnQoIG9iamVjdCA9PT0gbnVsbCB8fFxuICAgICAgICAgICAgICAgICAgICAoIG9iamVjdCAmJiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JyAmJiBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIG9iamVjdCApID09PSBPYmplY3QucHJvdG90eXBlICksXG4gICAgJ29iamVjdCBpcyBub3QgY29tcGF0aWJsZSB3aXRoIG1lcmdlJyApO1xuXG4gIGlmICggb2JqZWN0ICE9PSBudWxsICkge1xuICAgIC8vIGVuc3VyZSB0aGF0IG9wdGlvbnMga2V5cyBhcmUgbm90IEVTNSBzZXR0ZXJzIG9yIGdldHRlcnNcbiAgICBPYmplY3Qua2V5cyggb2JqZWN0ICkuZm9yRWFjaCggcHJvcCA9PiB7XG4gICAgICBjb25zdCBvd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKCBvYmplY3QsIHByb3AgKSE7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3duUHJvcGVydHlEZXNjcmlwdG9yLmhhc093blByb3BlcnR5KCAnc2V0JyApLFxuICAgICAgICAnY2Fubm90IHVzZSBtZXJnZSB3aXRoIGFuIG9iamVjdCB0aGF0IGhhcyBhIHNldHRlcicgKTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFvd25Qcm9wZXJ0eURlc2NyaXB0b3IuaGFzT3duUHJvcGVydHkoICdnZXQnICksXG4gICAgICAgICdjYW5ub3QgdXNlIG1lcmdlIHdpdGggYW4gb2JqZWN0IHRoYXQgaGFzIGEgZ2V0dGVyJyApO1xuICAgIH0gKTtcbiAgfVxufVxuXG5waGV0Q29yZS5yZWdpc3RlciggJ21lcmdlJywgbWVyZ2UgKTtcbmV4cG9ydCBkZWZhdWx0IG1lcmdlOyJdLCJuYW1lcyI6WyJwaGV0Q29yZSIsIk9QVElPTlNfU1VGRklYIiwibWVyZ2UiLCJ0YXJnZXQiLCJzb3VyY2VzIiwiYXNzZXJ0IiwiYXNzZXJ0SXNNZXJnZWFibGUiLCJsZW5ndGgiLCJfIiwiZWFjaCIsInNvdXJjZSIsInByb3BlcnR5IiwiaGFzT3duUHJvcGVydHkiLCJ1bmRlZmluZWQiLCJzb3VyY2VQcm9wZXJ0eSIsImVuZHNXaXRoIiwib2JqZWN0IiwiT2JqZWN0IiwiZ2V0UHJvdG90eXBlT2YiLCJwcm90b3R5cGUiLCJrZXlzIiwiZm9yRWFjaCIsInByb3AiLCJvd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Q0FTQyxHQUVELE9BQU9BLGNBQWMsZ0JBQWdCO0FBR3JDLFlBQVk7QUFDWixNQUFNQyxpQkFBaUI7QUFRdkI7OztDQUdDLEdBQ0QsU0FBU0MsTUFBT0MsTUFBc0IsRUFBRSxHQUFHQyxPQUF5QjtJQUNsRUMsVUFBVUMsa0JBQW1CSDtJQUM3QkUsVUFBVUEsT0FBUUYsV0FBVyxNQUFNLDhCQUErQixrQ0FBa0M7SUFDcEdFLFVBQVVBLE9BQVFELFFBQVFHLE1BQU0sR0FBRyxHQUFHO0lBRXRDQyxFQUFFQyxJQUFJLENBQUVMLFNBQVNNLENBQUFBO1FBQ2YsSUFBS0EsUUFBUztZQUNaTCxVQUFVQyxrQkFBbUJJO1lBQzdCLElBQU0sTUFBTUMsWUFBWUQsT0FBUztnQkFFL0Isa0lBQWtJO2dCQUNsSSxJQUFLQSxPQUFPRSxjQUFjLENBQUVELGFBQWNELE1BQU0sQ0FBRUMsU0FBVSxLQUFLRSxXQUFZO29CQUMzRSxNQUFNQyxpQkFBaUJKLE1BQU0sQ0FBRUMsU0FBVTtvQkFFekMsNEVBQTRFO29CQUM1RSxJQUFLSCxFQUFFTyxRQUFRLENBQUVKLFVBQVVWLG1CQUFvQlUsYUFBYVYsZ0JBQWlCO3dCQUUzRSxtSEFBbUg7d0JBQ25ISSxVQUFVQSxPQUFRUyxtQkFBbUJELFdBQVc7d0JBQ2hEVixNQUFNLENBQUVRLFNBQVUsR0FBR1QsTUFBT0MsTUFBTSxDQUFFUSxTQUFVLElBQUksQ0FBQyxHQUFHRztvQkFDeEQsT0FDSzt3QkFDSFgsTUFBTSxDQUFFUSxTQUFVLEdBQUdHO29CQUN2QjtnQkFDRjtZQUNGO1FBQ0Y7SUFDRjtJQUNBLE9BQU9YO0FBQ1Q7QUFFQTs7OztDQUlDLEdBQ0QsU0FBU0csa0JBQW1CVSxNQUFzQjtJQUNoRFgsVUFBVUEsT0FBUVcsV0FBVyxRQUNUQSxVQUFVLE9BQU9BLFdBQVcsWUFBWUMsT0FBT0MsY0FBYyxDQUFFRixZQUFhQyxPQUFPRSxTQUFTLEVBQzlHO0lBRUYsSUFBS0gsV0FBVyxNQUFPO1FBQ3JCLDBEQUEwRDtRQUMxREMsT0FBT0csSUFBSSxDQUFFSixRQUFTSyxPQUFPLENBQUVDLENBQUFBO1lBQzdCLE1BQU1DLHdCQUF3Qk4sT0FBT08sd0JBQXdCLENBQUVSLFFBQVFNO1lBQ3ZFakIsVUFBVUEsT0FBUSxDQUFDa0Isc0JBQXNCWCxjQUFjLENBQUUsUUFDdkQ7WUFDRlAsVUFBVUEsT0FBUSxDQUFDa0Isc0JBQXNCWCxjQUFjLENBQUUsUUFDdkQ7UUFDSjtJQUNGO0FBQ0Y7QUFFQVosU0FBU3lCLFFBQVEsQ0FBRSxTQUFTdkI7QUFDNUIsZUFBZUEsTUFBTSJ9