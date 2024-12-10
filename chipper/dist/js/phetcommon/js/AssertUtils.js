// Copyright 2020-2022, University of Colorado Boulder
/**
 * AssertUtils is a collection of utility functions for common assertions. Many of these assertions are related to
 * type-checking, useful in a weakly-typed language like JavaScript.
 *
 * To minimize performance impact, these methods should generally be called after testing for the presence of assert,
 * for example: assert && AssertUtils.assertPropertyOf( someProperty, 'number' );
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import EnumerationDeprecatedProperty from '../../axon/js/EnumerationDeprecatedProperty.js';
import Property from '../../axon/js/Property.js';
import ReadOnlyProperty from '../../axon/js/ReadOnlyProperty.js';
import Range from '../../dot/js/Range.js';
import EnumerationDeprecated from '../../phet-core/js/EnumerationDeprecated.js';
import phetcommon from '../../phetcommon/js/phetcommon.js';
const AssertUtils = {
    /**
   * Asserts that a value is a Property, whose value satisfies an optional predicate.
   * @param {Property} property
   * @param {function(value:*):boolean} [predicate]
   * @public
   */ assertProperty (property, predicate) {
        assert && assert(property instanceof Property, 'property is not a Property');
        if (predicate) {
            assert && assert(predicate(property.value), 'Property.value failed predicate');
        }
    },
    /**
   * Asserts that a value is a Property, whose value satisfies an optional predicate.
   * @param {Property} property
   * @param {function(value:*):boolean} [predicate]
   * @public
   */ assertAbstractProperty (property, predicate) {
        assert && assert(property instanceof ReadOnlyProperty, 'property is not an ReadOnlyProperty');
        if (predicate) {
            assert && assert(predicate(property.value), 'Property.value failed predicate');
        }
    },
    /**
   * Asserts that a value is a Property, whose value is a specified type.
   * @param {Property} property
   * @param {string|EnumerationDeprecated|constructor} type - primitive type (string), EnumerationDeprecated type, or object type (constructor)
   * @public
   */ assertPropertyOf (property, type) {
        if (typeof type === 'string') {
            assert && AssertUtils.assertProperty(property, (value)=>typeof value === type);
        } else if (type instanceof EnumerationDeprecated) {
            assert && AssertUtils.assertProperty(property, (value)=>type.includes(value));
        } else {
            assert && AssertUtils.assertProperty(property, (value)=>value instanceof type);
        }
    },
    /**
   * Asserts that a value is a Property, whose value is a specified type.
   * @param {Property} property
   * @param {string|EnumerationDeprecated|constructor} type - primitive type (string), EnumerationDeprecated type, or object type (constructor)
   * @public
   */ assertAbstractPropertyOf (property, type) {
        if (typeof type === 'string') {
            assert && AssertUtils.assertAbstractProperty(property, (value)=>typeof value === type);
        } else if (type instanceof EnumerationDeprecated) {
            assert && AssertUtils.assertAbstractProperty(property, (value)=>type.includes(value));
        } else {
            assert && AssertUtils.assertAbstractProperty(property, (value)=>value instanceof type);
        }
    },
    /**
   * Asserts that a value is an integer that satisfies an optional predicate.
   * @param {number} value
   * @param {function(value:number):boolean} [predicate]
   * @returns {boolean}
   * @public
   */ assertInteger (value, predicate) {
        assert && assert(typeof value === 'number' && Number.isInteger(value), `invalid value: ${value}`);
        if (predicate) {
            assert && assert(predicate(value), `value does not satisfy predicate: ${value}`);
        }
    },
    /**
   * Asserts that a value is a positive integer, > 0.
   * @param {number} value
   * @returns {boolean}
   * @public
   */ assertPositiveInteger (value) {
        assert && AssertUtils.assertInteger(value, (value)=>value > 0);
    },
    /**
   * Asserts that a value is a non-negative integer, >= 0.
   * @param {number} value
   * @returns {boolean}
   * @public
   */ assertNonNegativeInteger (value) {
        assert && AssertUtils.assertInteger(value, (value)=>value >= 0);
    },
    /**
   * Asserts that a value is a positive number, > 0.
   * @param {number} value
   * @returns {boolean}
   * @public
   */ assertPositiveNumber (value) {
        assert && assert(typeof value === 'number' && value > 0);
    },
    /**
   * Asserts that a value is a non-negative number, >= 0.
   * @param {number} value
   * @returns {boolean}
   * @public
   */ assertNonNegativeNumber (value) {
        assert && assert(typeof value === 'number' && value >= 0);
    },
    /**
   * Asserts that a value is a Range, whose value is between min and max inclusive.
   * @param {Range} range
   * @param {number} min
   * @param {number} max
   * @public
   */ assertRangeBetween (range, min, max) {
        assert && assert(range instanceof Range, 'invalid range');
        assert && assert(range.min >= min && range.max <= max, `range exceeds limits: ${range}`);
    },
    /**
   * Asserts that a value is an Array, whose elements satisfy an optional predicate.
   * @param {Array} array
   * @param {function(array:Array):boolean} [predicate]
   * @public
   */ assertArray (array, predicate) {
        assert && assert(Array.isArray(array), 'array is not an Array');
        if (predicate) {
            assert && assert(predicate(array), 'array failed predicate');
        }
    },
    /**
   * Asserts that a value is an Array, with elements of a specific type.
   * @param {Array} array
   * @param {string|constructor} type - primitive type (string) or object type (constructor)
   * @public
   */ assertArrayOf (array, type) {
        if (typeof type === 'string') {
            assert && AssertUtils.assertArray(array, (array)=>_.every(array, (element)=>typeof element === type));
        } else {
            assert && AssertUtils.assertArray(array, (array)=>_.every(array, (element)=>element instanceof type));
        }
    },
    /**
   * Asserts that a value is an EnumerationDeprecatedProperty, whose values are a specific type of EnumerationDeprecated.
   * @param {EnumerationDeprecatedProperty} enumerationProperty
   * @param {EnumerationDeprecated} enumeration
   * @deprecated
   */ assertEnumerationDeprecatedPropertyOf (enumerationProperty, enumeration) {
        assert && assert(enumerationProperty instanceof EnumerationDeprecatedProperty, 'invalid enumerationProperty');
        assert && assert(enumerationProperty.enumeration === enumeration, 'invalid enumeration');
    }
};
phetcommon.register('AssertUtils', AssertUtils);
export default AssertUtils;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvQXNzZXJ0VXRpbHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQXNzZXJ0VXRpbHMgaXMgYSBjb2xsZWN0aW9uIG9mIHV0aWxpdHkgZnVuY3Rpb25zIGZvciBjb21tb24gYXNzZXJ0aW9ucy4gTWFueSBvZiB0aGVzZSBhc3NlcnRpb25zIGFyZSByZWxhdGVkIHRvXG4gKiB0eXBlLWNoZWNraW5nLCB1c2VmdWwgaW4gYSB3ZWFrbHktdHlwZWQgbGFuZ3VhZ2UgbGlrZSBKYXZhU2NyaXB0LlxuICpcbiAqIFRvIG1pbmltaXplIHBlcmZvcm1hbmNlIGltcGFjdCwgdGhlc2UgbWV0aG9kcyBzaG91bGQgZ2VuZXJhbGx5IGJlIGNhbGxlZCBhZnRlciB0ZXN0aW5nIGZvciB0aGUgcHJlc2VuY2Ugb2YgYXNzZXJ0LFxuICogZm9yIGV4YW1wbGU6IGFzc2VydCAmJiBBc3NlcnRVdGlscy5hc3NlcnRQcm9wZXJ0eU9mKCBzb21lUHJvcGVydHksICdudW1iZXInICk7XG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1JlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgRW51bWVyYXRpb25EZXByZWNhdGVkIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbkRlcHJlY2F0ZWQuanMnO1xuaW1wb3J0IHBoZXRjb21tb24gZnJvbSAnLi4vLi4vcGhldGNvbW1vbi9qcy9waGV0Y29tbW9uLmpzJztcblxuY29uc3QgQXNzZXJ0VXRpbHMgPSB7XG5cbiAgLyoqXG4gICAqIEFzc2VydHMgdGhhdCBhIHZhbHVlIGlzIGEgUHJvcGVydHksIHdob3NlIHZhbHVlIHNhdGlzZmllcyBhbiBvcHRpb25hbCBwcmVkaWNhdGUuXG4gICAqIEBwYXJhbSB7UHJvcGVydHl9IHByb3BlcnR5XG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24odmFsdWU6Kik6Ym9vbGVhbn0gW3ByZWRpY2F0ZV1cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgYXNzZXJ0UHJvcGVydHkoIHByb3BlcnR5LCBwcmVkaWNhdGUgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcHJvcGVydHkgaW5zdGFuY2VvZiBQcm9wZXJ0eSwgJ3Byb3BlcnR5IGlzIG5vdCBhIFByb3BlcnR5JyApO1xuICAgIGlmICggcHJlZGljYXRlICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcHJlZGljYXRlKCBwcm9wZXJ0eS52YWx1ZSApLCAnUHJvcGVydHkudmFsdWUgZmFpbGVkIHByZWRpY2F0ZScgKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEFzc2VydHMgdGhhdCBhIHZhbHVlIGlzIGEgUHJvcGVydHksIHdob3NlIHZhbHVlIHNhdGlzZmllcyBhbiBvcHRpb25hbCBwcmVkaWNhdGUuXG4gICAqIEBwYXJhbSB7UHJvcGVydHl9IHByb3BlcnR5XG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24odmFsdWU6Kik6Ym9vbGVhbn0gW3ByZWRpY2F0ZV1cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgYXNzZXJ0QWJzdHJhY3RQcm9wZXJ0eSggcHJvcGVydHksIHByZWRpY2F0ZSApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwcm9wZXJ0eSBpbnN0YW5jZW9mIFJlYWRPbmx5UHJvcGVydHksICdwcm9wZXJ0eSBpcyBub3QgYW4gUmVhZE9ubHlQcm9wZXJ0eScgKTtcbiAgICBpZiAoIHByZWRpY2F0ZSApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHByZWRpY2F0ZSggcHJvcGVydHkudmFsdWUgKSwgJ1Byb3BlcnR5LnZhbHVlIGZhaWxlZCBwcmVkaWNhdGUnICk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBBc3NlcnRzIHRoYXQgYSB2YWx1ZSBpcyBhIFByb3BlcnR5LCB3aG9zZSB2YWx1ZSBpcyBhIHNwZWNpZmllZCB0eXBlLlxuICAgKiBAcGFyYW0ge1Byb3BlcnR5fSBwcm9wZXJ0eVxuICAgKiBAcGFyYW0ge3N0cmluZ3xFbnVtZXJhdGlvbkRlcHJlY2F0ZWR8Y29uc3RydWN0b3J9IHR5cGUgLSBwcmltaXRpdmUgdHlwZSAoc3RyaW5nKSwgRW51bWVyYXRpb25EZXByZWNhdGVkIHR5cGUsIG9yIG9iamVjdCB0eXBlIChjb25zdHJ1Y3RvcilcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgYXNzZXJ0UHJvcGVydHlPZiggcHJvcGVydHksIHR5cGUgKSB7XG4gICAgaWYgKCB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgKSB7XG4gICAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0UHJvcGVydHkoIHByb3BlcnR5LCB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09IHR5cGUgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHR5cGUgaW5zdGFuY2VvZiBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgKSB7XG4gICAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0UHJvcGVydHkoIHByb3BlcnR5LCB2YWx1ZSA9PiB0eXBlLmluY2x1ZGVzKCB2YWx1ZSApICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgYXNzZXJ0ICYmIEFzc2VydFV0aWxzLmFzc2VydFByb3BlcnR5KCBwcm9wZXJ0eSwgdmFsdWUgPT4gdmFsdWUgaW5zdGFuY2VvZiB0eXBlICk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBBc3NlcnRzIHRoYXQgYSB2YWx1ZSBpcyBhIFByb3BlcnR5LCB3aG9zZSB2YWx1ZSBpcyBhIHNwZWNpZmllZCB0eXBlLlxuICAgKiBAcGFyYW0ge1Byb3BlcnR5fSBwcm9wZXJ0eVxuICAgKiBAcGFyYW0ge3N0cmluZ3xFbnVtZXJhdGlvbkRlcHJlY2F0ZWR8Y29uc3RydWN0b3J9IHR5cGUgLSBwcmltaXRpdmUgdHlwZSAoc3RyaW5nKSwgRW51bWVyYXRpb25EZXByZWNhdGVkIHR5cGUsIG9yIG9iamVjdCB0eXBlIChjb25zdHJ1Y3RvcilcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgYXNzZXJ0QWJzdHJhY3RQcm9wZXJ0eU9mKCBwcm9wZXJ0eSwgdHlwZSApIHtcbiAgICBpZiAoIHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyApIHtcbiAgICAgIGFzc2VydCAmJiBBc3NlcnRVdGlscy5hc3NlcnRBYnN0cmFjdFByb3BlcnR5KCBwcm9wZXJ0eSwgdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSB0eXBlICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCB0eXBlIGluc3RhbmNlb2YgRW51bWVyYXRpb25EZXByZWNhdGVkICkge1xuICAgICAgYXNzZXJ0ICYmIEFzc2VydFV0aWxzLmFzc2VydEFic3RyYWN0UHJvcGVydHkoIHByb3BlcnR5LCB2YWx1ZSA9PiB0eXBlLmluY2x1ZGVzKCB2YWx1ZSApICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgYXNzZXJ0ICYmIEFzc2VydFV0aWxzLmFzc2VydEFic3RyYWN0UHJvcGVydHkoIHByb3BlcnR5LCB2YWx1ZSA9PiB2YWx1ZSBpbnN0YW5jZW9mIHR5cGUgKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEFzc2VydHMgdGhhdCBhIHZhbHVlIGlzIGFuIGludGVnZXIgdGhhdCBzYXRpc2ZpZXMgYW4gb3B0aW9uYWwgcHJlZGljYXRlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcbiAgICogQHBhcmFtIHtmdW5jdGlvbih2YWx1ZTpudW1iZXIpOmJvb2xlYW59IFtwcmVkaWNhdGVdXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKiBAcHVibGljXG4gICAqL1xuICBhc3NlcnRJbnRlZ2VyKCB2YWx1ZSwgcHJlZGljYXRlICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzSW50ZWdlciggdmFsdWUgKSwgYGludmFsaWQgdmFsdWU6ICR7dmFsdWV9YCApO1xuICAgIGlmICggcHJlZGljYXRlICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcHJlZGljYXRlKCB2YWx1ZSApLCBgdmFsdWUgZG9lcyBub3Qgc2F0aXNmeSBwcmVkaWNhdGU6ICR7dmFsdWV9YCApO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQXNzZXJ0cyB0aGF0IGEgdmFsdWUgaXMgYSBwb3NpdGl2ZSBpbnRlZ2VyLCA+IDAuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgYXNzZXJ0UG9zaXRpdmVJbnRlZ2VyKCB2YWx1ZSApIHtcbiAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0SW50ZWdlciggdmFsdWUsIHZhbHVlID0+IHZhbHVlID4gMCApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBBc3NlcnRzIHRoYXQgYSB2YWx1ZSBpcyBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyLCA+PSAwLlxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGFzc2VydE5vbk5lZ2F0aXZlSW50ZWdlciggdmFsdWUgKSB7XG4gICAgYXNzZXJ0ICYmIEFzc2VydFV0aWxzLmFzc2VydEludGVnZXIoIHZhbHVlLCB2YWx1ZSA9PiB2YWx1ZSA+PSAwICk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEFzc2VydHMgdGhhdCBhIHZhbHVlIGlzIGEgcG9zaXRpdmUgbnVtYmVyLCA+IDAuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgYXNzZXJ0UG9zaXRpdmVOdW1iZXIoIHZhbHVlICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgdmFsdWUgPiAwICk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEFzc2VydHMgdGhhdCBhIHZhbHVlIGlzIGEgbm9uLW5lZ2F0aXZlIG51bWJlciwgPj0gMC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKiBAcHVibGljXG4gICAqL1xuICBhc3NlcnROb25OZWdhdGl2ZU51bWJlciggdmFsdWUgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiB2YWx1ZSA+PSAwICk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEFzc2VydHMgdGhhdCBhIHZhbHVlIGlzIGEgUmFuZ2UsIHdob3NlIHZhbHVlIGlzIGJldHdlZW4gbWluIGFuZCBtYXggaW5jbHVzaXZlLlxuICAgKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICAgKiBAcGFyYW0ge251bWJlcn0gbWluXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtYXhcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgYXNzZXJ0UmFuZ2VCZXR3ZWVuKCByYW5nZSwgbWluLCBtYXggKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmFuZ2UgaW5zdGFuY2VvZiBSYW5nZSwgJ2ludmFsaWQgcmFuZ2UnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmFuZ2UubWluID49IG1pbiAmJiByYW5nZS5tYXggPD0gbWF4LCBgcmFuZ2UgZXhjZWVkcyBsaW1pdHM6ICR7cmFuZ2V9YCApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBBc3NlcnRzIHRoYXQgYSB2YWx1ZSBpcyBhbiBBcnJheSwgd2hvc2UgZWxlbWVudHMgc2F0aXNmeSBhbiBvcHRpb25hbCBwcmVkaWNhdGUuXG4gICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5XG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oYXJyYXk6QXJyYXkpOmJvb2xlYW59IFtwcmVkaWNhdGVdXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGFzc2VydEFycmF5KCBhcnJheSwgcHJlZGljYXRlICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIGFycmF5ICksICdhcnJheSBpcyBub3QgYW4gQXJyYXknICk7XG4gICAgaWYgKCBwcmVkaWNhdGUgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwcmVkaWNhdGUoIGFycmF5ICksICdhcnJheSBmYWlsZWQgcHJlZGljYXRlJyApO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQXNzZXJ0cyB0aGF0IGEgdmFsdWUgaXMgYW4gQXJyYXksIHdpdGggZWxlbWVudHMgb2YgYSBzcGVjaWZpYyB0eXBlLlxuICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheVxuICAgKiBAcGFyYW0ge3N0cmluZ3xjb25zdHJ1Y3Rvcn0gdHlwZSAtIHByaW1pdGl2ZSB0eXBlIChzdHJpbmcpIG9yIG9iamVjdCB0eXBlIChjb25zdHJ1Y3RvcilcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgYXNzZXJ0QXJyYXlPZiggYXJyYXksIHR5cGUgKSB7XG4gICAgaWYgKCB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgKSB7XG4gICAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0QXJyYXkoIGFycmF5LCBhcnJheSA9PiBfLmV2ZXJ5KCBhcnJheSwgZWxlbWVudCA9PiB0eXBlb2YgZWxlbWVudCA9PT0gdHlwZSApICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgYXNzZXJ0ICYmIEFzc2VydFV0aWxzLmFzc2VydEFycmF5KCBhcnJheSwgYXJyYXkgPT4gXy5ldmVyeSggYXJyYXksIGVsZW1lbnQgPT4gZWxlbWVudCBpbnN0YW5jZW9mIHR5cGUgKSApO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQXNzZXJ0cyB0aGF0IGEgdmFsdWUgaXMgYW4gRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHksIHdob3NlIHZhbHVlcyBhcmUgYSBzcGVjaWZpYyB0eXBlIG9mIEVudW1lcmF0aW9uRGVwcmVjYXRlZC5cbiAgICogQHBhcmFtIHtFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eX0gZW51bWVyYXRpb25Qcm9wZXJ0eVxuICAgKiBAcGFyYW0ge0VudW1lcmF0aW9uRGVwcmVjYXRlZH0gZW51bWVyYXRpb25cbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIGFzc2VydEVudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5T2YoIGVudW1lcmF0aW9uUHJvcGVydHksIGVudW1lcmF0aW9uICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGVudW1lcmF0aW9uUHJvcGVydHkgaW5zdGFuY2VvZiBFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSwgJ2ludmFsaWQgZW51bWVyYXRpb25Qcm9wZXJ0eScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBlbnVtZXJhdGlvblByb3BlcnR5LmVudW1lcmF0aW9uID09PSBlbnVtZXJhdGlvbiwgJ2ludmFsaWQgZW51bWVyYXRpb24nICk7XG4gIH1cbn07XG5cbnBoZXRjb21tb24ucmVnaXN0ZXIoICdBc3NlcnRVdGlscycsIEFzc2VydFV0aWxzICk7XG5leHBvcnQgZGVmYXVsdCBBc3NlcnRVdGlsczsiXSwibmFtZXMiOlsiRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlJlYWRPbmx5UHJvcGVydHkiLCJSYW5nZSIsIkVudW1lcmF0aW9uRGVwcmVjYXRlZCIsInBoZXRjb21tb24iLCJBc3NlcnRVdGlscyIsImFzc2VydFByb3BlcnR5IiwicHJvcGVydHkiLCJwcmVkaWNhdGUiLCJhc3NlcnQiLCJ2YWx1ZSIsImFzc2VydEFic3RyYWN0UHJvcGVydHkiLCJhc3NlcnRQcm9wZXJ0eU9mIiwidHlwZSIsImluY2x1ZGVzIiwiYXNzZXJ0QWJzdHJhY3RQcm9wZXJ0eU9mIiwiYXNzZXJ0SW50ZWdlciIsIk51bWJlciIsImlzSW50ZWdlciIsImFzc2VydFBvc2l0aXZlSW50ZWdlciIsImFzc2VydE5vbk5lZ2F0aXZlSW50ZWdlciIsImFzc2VydFBvc2l0aXZlTnVtYmVyIiwiYXNzZXJ0Tm9uTmVnYXRpdmVOdW1iZXIiLCJhc3NlcnRSYW5nZUJldHdlZW4iLCJyYW5nZSIsIm1pbiIsIm1heCIsImFzc2VydEFycmF5IiwiYXJyYXkiLCJBcnJheSIsImlzQXJyYXkiLCJhc3NlcnRBcnJheU9mIiwiXyIsImV2ZXJ5IiwiZWxlbWVudCIsImFzc2VydEVudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5T2YiLCJlbnVtZXJhdGlvblByb3BlcnR5IiwiZW51bWVyYXRpb24iLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7OztDQVFDLEdBRUQsT0FBT0EsbUNBQW1DLGlEQUFpRDtBQUMzRixPQUFPQyxjQUFjLDRCQUE0QjtBQUNqRCxPQUFPQyxzQkFBc0Isb0NBQW9DO0FBQ2pFLE9BQU9DLFdBQVcsd0JBQXdCO0FBQzFDLE9BQU9DLDJCQUEyQiw4Q0FBOEM7QUFDaEYsT0FBT0MsZ0JBQWdCLG9DQUFvQztBQUUzRCxNQUFNQyxjQUFjO0lBRWxCOzs7OztHQUtDLEdBQ0RDLGdCQUFnQkMsUUFBUSxFQUFFQyxTQUFTO1FBQ2pDQyxVQUFVQSxPQUFRRixvQkFBb0JQLFVBQVU7UUFDaEQsSUFBS1EsV0FBWTtZQUNmQyxVQUFVQSxPQUFRRCxVQUFXRCxTQUFTRyxLQUFLLEdBQUk7UUFDakQ7SUFDRjtJQUVBOzs7OztHQUtDLEdBQ0RDLHdCQUF3QkosUUFBUSxFQUFFQyxTQUFTO1FBQ3pDQyxVQUFVQSxPQUFRRixvQkFBb0JOLGtCQUFrQjtRQUN4RCxJQUFLTyxXQUFZO1lBQ2ZDLFVBQVVBLE9BQVFELFVBQVdELFNBQVNHLEtBQUss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