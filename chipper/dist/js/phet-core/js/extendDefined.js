// Copyright 2016-2023, University of Colorado Boulder
/**
 * Like phet-core's extend, but does not overwrite properties with undefined values.
 *
 * For example:
 *
 * extendDefined( { a: 5 }, { a: undefined } ) will return { a: 5 }
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import phetCore from './phetCore.js';
function extendDefined(obj, ...sources) {
    _.each(sources, (source)=>{
        if (source) {
            for(const prop in source){
                const descriptor = Object.getOwnPropertyDescriptor(source, prop);
                if (descriptor && (typeof descriptor.get === 'function' || source[prop] !== undefined)) {
                    Object.defineProperty(obj, prop, descriptor);
                }
            }
        }
    });
    return obj;
}
phetCore.register('extendDefined', extendDefined);
export default extendDefined;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9leHRlbmREZWZpbmVkLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIExpa2UgcGhldC1jb3JlJ3MgZXh0ZW5kLCBidXQgZG9lcyBub3Qgb3ZlcndyaXRlIHByb3BlcnRpZXMgd2l0aCB1bmRlZmluZWQgdmFsdWVzLlxuICpcbiAqIEZvciBleGFtcGxlOlxuICpcbiAqIGV4dGVuZERlZmluZWQoIHsgYTogNSB9LCB7IGE6IHVuZGVmaW5lZCB9ICkgd2lsbCByZXR1cm4geyBhOiA1IH1cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHBoZXRDb3JlIGZyb20gJy4vcGhldENvcmUuanMnO1xuXG5mdW5jdGlvbiBleHRlbmREZWZpbmVkPFQ+KCBvYmo6IFQsIC4uLnNvdXJjZXM6IEFycmF5PFQgfCB1bmRlZmluZWQ+ICk6IFQge1xuICBfLmVhY2goIHNvdXJjZXMsIHNvdXJjZSA9PiB7XG4gICAgaWYgKCBzb3VyY2UgKSB7XG4gICAgICBmb3IgKCBjb25zdCBwcm9wIGluIHNvdXJjZSApIHtcbiAgICAgICAgY29uc3QgZGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoIHNvdXJjZSwgcHJvcCApO1xuXG4gICAgICAgIGlmICggZGVzY3JpcHRvciAmJiAoIHR5cGVvZiBkZXNjcmlwdG9yLmdldCA9PT0gJ2Z1bmN0aW9uJyB8fCBzb3VyY2VbIHByb3AgXSAhPT0gdW5kZWZpbmVkICkgKSB7XG4gICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBvYmosIHByb3AsIGRlc2NyaXB0b3IgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSApO1xuICByZXR1cm4gb2JqO1xufVxuXG5waGV0Q29yZS5yZWdpc3RlciggJ2V4dGVuZERlZmluZWQnLCBleHRlbmREZWZpbmVkICk7XG5cbmV4cG9ydCBkZWZhdWx0IGV4dGVuZERlZmluZWQ7Il0sIm5hbWVzIjpbInBoZXRDb3JlIiwiZXh0ZW5kRGVmaW5lZCIsIm9iaiIsInNvdXJjZXMiLCJfIiwiZWFjaCIsInNvdXJjZSIsInByb3AiLCJkZXNjcmlwdG9yIiwiT2JqZWN0IiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIiwiZ2V0IiwidW5kZWZpbmVkIiwiZGVmaW5lUHJvcGVydHkiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7OztDQVFDLEdBRUQsT0FBT0EsY0FBYyxnQkFBZ0I7QUFFckMsU0FBU0MsY0FBa0JDLEdBQU0sRUFBRSxHQUFHQyxPQUE2QjtJQUNqRUMsRUFBRUMsSUFBSSxDQUFFRixTQUFTRyxDQUFBQTtRQUNmLElBQUtBLFFBQVM7WUFDWixJQUFNLE1BQU1DLFFBQVFELE9BQVM7Z0JBQzNCLE1BQU1FLGFBQWFDLE9BQU9DLHdCQUF3QixDQUFFSixRQUFRQztnQkFFNUQsSUFBS0MsY0FBZ0IsQ0FBQSxPQUFPQSxXQUFXRyxHQUFHLEtBQUssY0FBY0wsTUFBTSxDQUFFQyxLQUFNLEtBQUtLLFNBQVEsR0FBTTtvQkFDNUZILE9BQU9JLGNBQWMsQ0FBRVgsS0FBS0ssTUFBTUM7Z0JBQ3BDO1lBQ0Y7UUFDRjtJQUNGO0lBQ0EsT0FBT047QUFDVDtBQUVBRixTQUFTYyxRQUFRLENBQUUsaUJBQWlCYjtBQUVwQyxlQUFlQSxjQUFjIn0=