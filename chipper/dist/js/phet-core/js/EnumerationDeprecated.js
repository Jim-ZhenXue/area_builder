// Copyright 2018-2022, University of Colorado Boulder
/**
 * Creates a simple enumeration, with most of the boilerplate.
 *
 * An EnumerationDeprecated can be created like this:
 *
 *   const CardinalDirection = EnumerationDeprecated.byKeys( [ 'NORTH', 'SOUTH', 'EAST', 'WEST' ] );
 *
 * OR using rich values like so:
 *
 *   const CardinalDirection = EnumerationDeprecated.byMap( {NORTH: northObject, SOUTH: southObject, EAST: eastObject, WEST: westObject} );
 *
 * and values are referenced like this:
 *
 *   CardinalDirection.NORTH;
 *   CardinalDirection.SOUTH;
 *   CardinalDirection.EAST;
 *   CardinalDirection.WEST;
 *
 *   CardinalDirection.VALUES;
 *   // returns [ CardinalDirection.NORTH, CardinalDirection.SOUTH, CardinalDirection.EAST, CardinalDirection.WEST ]
 *
 * And support for checking whether any value is a value of the enumeration:
 *
 *   CardinalDirection.includes( CardinalDirection.NORTH ); // true
 *   CardinalDirection.includes( CardinalDirection.SOUTHWEST ); // false
 *   CardinalDirection.includes( 'NORTH' ); // false, values are not strings
 *
 * Conventions for using EnumerationDeprecated, from https://github.com/phetsims/phet-core/issues/53:
 *
 * (1) Enumerations are named like classes/types. Nothing in the name needs to identify that they are Enumerations.
 *     See the example above: CardinalDirection, not CardinalDirectionEnum or CardinalDirectionEnumeration.
 *
 * (2) EnumerationDeprecated values are named like constants, using uppercase. See the example above.
 *
 * (3) If an EnumerationDeprecated is closely related to some class, then make it a static field of that class. If an
 *     EnumerationDeprecated is specific to a Property, then the EnumerationDeprecated should likely be owned by the class that
 *     owns that Property.
 *
 * (4) If an EnumerationDeprecated is not closely related to some class, then put the EnumerationDeprecated in its own .js file.
 *     Do not combine multiple Enumerations into one file.
 *
 * (5) If a Property takes an EnumerationDeprecated value, its validation typically looks like this:
 *
 *     const cardinalDirectionProperty = new Property( CardinalDirection.NORTH, {
 *       validValues: CardinalDirection.VALUES
 *     }
 *
 * (6) Values of the EnumerationDeprecated are considered instances of the EnumerationDeprecated in documentation. For example, a method
 *     that that takes an EnumerationDeprecated value as an argument would be documented like this:
 *
 *     // @param {Scene} mode - value from Scene EnumerationDeprecated
 *     setSceneMode( mode ) {
 *       assert && assert( Scene.includes( mode ) );
 *       //...
 *     }
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import deprecationWarning from './deprecationWarning.js';
import merge from './merge.js';
import phetCore from './phetCore.js';
/**
 * @deprecated
 */ let EnumerationDeprecated = class EnumerationDeprecated {
    /**
   * Based solely on the keys in EnumerationDeprecated.
   * @public
   *
   * @returns {String}
   */ toString() {
        return this.KEYS.join(', ');
    }
    /**
   * Checks whether the given value is a value of this enumeration. Should generally be used for assertions
   * @public
   *
   * @param {Object} value
   * @returns {boolean}
   */ includes(value) {
        return _.includes(this.VALUES, value);
    }
    /**
   * To support consistent API with Enumeration.
   * @public
   * @param {string} key
   * @returns {*}
   */ getValue(key) {
        return this[key];
    }
    /**
   * To support consistent API with Enumeration.
   * @public
   * @param {Object} enumerationValue
   * @returns {string}
   */ getKey(enumerationValue) {
        return enumerationValue.name;
    }
    /**
   * To support consistent API with Enumeration.
   * @public
   * @returns {Object[]}
   */ get values() {
        return this.VALUES;
    }
    /**
   * To support consistent API with Enumeration.
   * @public
   * @returns {string[]}
   */ get keys() {
        return this.KEYS;
    }
    /**
   * To support consistent API with Enumeration.
   * @public
   * @returns {EnumerationDeprecated}
   */ get enumeration() {
        return this;
    }
    /**
   * Creates an enumeration based on the provided string array
   * @param {string[]} keys - such as ['RED','BLUE']
   * @param {Object} [options]
   * @returns {EnumerationDeprecated}
   * @public
   */ static byKeys(keys, options) {
        assert && assert(Array.isArray(keys), 'keys must be an array');
        assert && assert(!options || options.keys === undefined);
        return new EnumerationDeprecated(merge({
            keys: keys
        }, options));
    }
    /**
   * Creates a "rich" enumeration based on the provided map
   * @param {Object} map - such as {RED: myRedValue, BLUE: myBlueValue}
   * @param {Object} [options]
   * @returns {EnumerationDeprecated}
   * @public
   */ static byMap(map, options) {
        assert && assert(!options || options.map === undefined);
        if (assert) {
            const values = _.values(map);
            assert && assert(values.length >= 1, 'must have at least 2 entries in an enumeration');
            assert && assert(_.every(values, (value)=>value.constructor === values[0].constructor), 'Values must have same constructor');
        }
        return new EnumerationDeprecated(merge({
            map: map
        }, options));
    }
    /**
   * @param {Object} config - must provide keys such as {keys:['RED','BLUE]}
   *                          - or map such as {map:{RED: myRedValue, BLUE: myBlueValue}}
   *
   * @private - clients should use EnumerationDeprecated.byKeys or EnumerationDeprecated.byMap
   */ constructor(config){
        deprecationWarning('EnumerationDeprecated should be exchanged for classes that extend EnumerationValue, see WilderEnumerationPatterns for examples.');
        assert && assert(config, 'config must be provided');
        const keysProvided = !!config.keys;
        const mapProvided = !!config.map;
        assert && assert(keysProvided !== mapProvided, 'must provide one or the other but not both of keys/map');
        const keys = config.keys || Object.keys(config.map);
        const map = config.map || {};
        config = merge({
            // {string|null} Will be appended to the EnumerationIO documentation, if provided
            phetioDocumentation: null,
            // {function(EnumerationDeprecated):|null} If provided, it will be called as beforeFreeze( enumeration ) just before the
            // enumeration is frozen. Since it's not possible to modify the enumeration after
            // it is frozen (e.g. adding convenience functions), and there is no reference to
            // the enumeration object beforehand, this allows defining custom values/methods
            // on the enumeration object itself.
            beforeFreeze: null
        }, config);
        assert && assert(Array.isArray(keys), 'Values should be an array');
        assert && assert(_.uniq(keys).length === keys.length, 'There should be no duplicated values provided');
        assert && keys.forEach((value)=>assert(typeof value === 'string', 'Each value should be a string'));
        assert && keys.forEach((value)=>assert(/^[A-Z][A-Z0-9_]*$/g.test(value), 'EnumerationDeprecated values should be uppercase alphanumeric with underscores and begin with a letter'));
        assert && assert(!_.includes(keys, 'VALUES'), 'This is the name of a built-in provided value, so it cannot be included as an enumeration value');
        assert && assert(!_.includes(keys, 'KEYS'), 'This is the name of a built-in provided value, so it cannot be included as an enumeration value');
        assert && assert(!_.includes(keys, 'includes'), 'This is the name of a built-in provided value, so it cannot be included as an enumeration value');
        // @public (phet-io) - provides additional documentation for PhET-iO which can be viewed in studio
        // Note this uses the same term as used by PhetioObject, but via a different channel.
        this.phetioDocumentation = config.phetioDocumentation;
        // @public {string[]} (read-only) - the string keys of the enumeration
        this.KEYS = keys;
        // @public {Object[]} (read-only) - the object values of the enumeration
        this.VALUES = [];
        keys.forEach((key)=>{
            const value = map[key] || {};
            // Set attributes of the enumeration value
            assert && assert(value.name === undefined, '"rich" enumeration values cannot provide their own name attribute');
            assert && assert(value.toString === Object.prototype.toString, '"rich" enumeration values cannot provide their own toString');
            // @public {string} (read-only) - PhET-iO public API relies on this mapping, do not change it lightly
            value.name = key;
            // @public {function():string} (read-only)
            value.toString = ()=>key;
            // Assign to the enumeration
            this[key] = value;
            this.VALUES.push(value);
        });
        config.beforeFreeze && config.beforeFreeze(this);
        assert && Object.freeze(this);
        assert && Object.freeze(this.VALUES);
        assert && Object.freeze(this.KEYS);
        assert && keys.forEach((key)=>assert && Object.freeze(map[key]));
    }
};
phetCore.register('EnumerationDeprecated', EnumerationDeprecated);
export default EnumerationDeprecated;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbkRlcHJlY2F0ZWQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQ3JlYXRlcyBhIHNpbXBsZSBlbnVtZXJhdGlvbiwgd2l0aCBtb3N0IG9mIHRoZSBib2lsZXJwbGF0ZS5cbiAqXG4gKiBBbiBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgY2FuIGJlIGNyZWF0ZWQgbGlrZSB0aGlzOlxuICpcbiAqICAgY29uc3QgQ2FyZGluYWxEaXJlY3Rpb24gPSBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQuYnlLZXlzKCBbICdOT1JUSCcsICdTT1VUSCcsICdFQVNUJywgJ1dFU1QnIF0gKTtcbiAqXG4gKiBPUiB1c2luZyByaWNoIHZhbHVlcyBsaWtlIHNvOlxuICpcbiAqICAgY29uc3QgQ2FyZGluYWxEaXJlY3Rpb24gPSBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQuYnlNYXAoIHtOT1JUSDogbm9ydGhPYmplY3QsIFNPVVRIOiBzb3V0aE9iamVjdCwgRUFTVDogZWFzdE9iamVjdCwgV0VTVDogd2VzdE9iamVjdH0gKTtcbiAqXG4gKiBhbmQgdmFsdWVzIGFyZSByZWZlcmVuY2VkIGxpa2UgdGhpczpcbiAqXG4gKiAgIENhcmRpbmFsRGlyZWN0aW9uLk5PUlRIO1xuICogICBDYXJkaW5hbERpcmVjdGlvbi5TT1VUSDtcbiAqICAgQ2FyZGluYWxEaXJlY3Rpb24uRUFTVDtcbiAqICAgQ2FyZGluYWxEaXJlY3Rpb24uV0VTVDtcbiAqXG4gKiAgIENhcmRpbmFsRGlyZWN0aW9uLlZBTFVFUztcbiAqICAgLy8gcmV0dXJucyBbIENhcmRpbmFsRGlyZWN0aW9uLk5PUlRILCBDYXJkaW5hbERpcmVjdGlvbi5TT1VUSCwgQ2FyZGluYWxEaXJlY3Rpb24uRUFTVCwgQ2FyZGluYWxEaXJlY3Rpb24uV0VTVCBdXG4gKlxuICogQW5kIHN1cHBvcnQgZm9yIGNoZWNraW5nIHdoZXRoZXIgYW55IHZhbHVlIGlzIGEgdmFsdWUgb2YgdGhlIGVudW1lcmF0aW9uOlxuICpcbiAqICAgQ2FyZGluYWxEaXJlY3Rpb24uaW5jbHVkZXMoIENhcmRpbmFsRGlyZWN0aW9uLk5PUlRIICk7IC8vIHRydWVcbiAqICAgQ2FyZGluYWxEaXJlY3Rpb24uaW5jbHVkZXMoIENhcmRpbmFsRGlyZWN0aW9uLlNPVVRIV0VTVCApOyAvLyBmYWxzZVxuICogICBDYXJkaW5hbERpcmVjdGlvbi5pbmNsdWRlcyggJ05PUlRIJyApOyAvLyBmYWxzZSwgdmFsdWVzIGFyZSBub3Qgc3RyaW5nc1xuICpcbiAqIENvbnZlbnRpb25zIGZvciB1c2luZyBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQsIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtY29yZS9pc3N1ZXMvNTM6XG4gKlxuICogKDEpIEVudW1lcmF0aW9ucyBhcmUgbmFtZWQgbGlrZSBjbGFzc2VzL3R5cGVzLiBOb3RoaW5nIGluIHRoZSBuYW1lIG5lZWRzIHRvIGlkZW50aWZ5IHRoYXQgdGhleSBhcmUgRW51bWVyYXRpb25zLlxuICogICAgIFNlZSB0aGUgZXhhbXBsZSBhYm92ZTogQ2FyZGluYWxEaXJlY3Rpb24sIG5vdCBDYXJkaW5hbERpcmVjdGlvbkVudW0gb3IgQ2FyZGluYWxEaXJlY3Rpb25FbnVtZXJhdGlvbi5cbiAqXG4gKiAoMikgRW51bWVyYXRpb25EZXByZWNhdGVkIHZhbHVlcyBhcmUgbmFtZWQgbGlrZSBjb25zdGFudHMsIHVzaW5nIHVwcGVyY2FzZS4gU2VlIHRoZSBleGFtcGxlIGFib3ZlLlxuICpcbiAqICgzKSBJZiBhbiBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgaXMgY2xvc2VseSByZWxhdGVkIHRvIHNvbWUgY2xhc3MsIHRoZW4gbWFrZSBpdCBhIHN0YXRpYyBmaWVsZCBvZiB0aGF0IGNsYXNzLiBJZiBhblxuICogICAgIEVudW1lcmF0aW9uRGVwcmVjYXRlZCBpcyBzcGVjaWZpYyB0byBhIFByb3BlcnR5LCB0aGVuIHRoZSBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgc2hvdWxkIGxpa2VseSBiZSBvd25lZCBieSB0aGUgY2xhc3MgdGhhdFxuICogICAgIG93bnMgdGhhdCBQcm9wZXJ0eS5cbiAqXG4gKiAoNCkgSWYgYW4gRW51bWVyYXRpb25EZXByZWNhdGVkIGlzIG5vdCBjbG9zZWx5IHJlbGF0ZWQgdG8gc29tZSBjbGFzcywgdGhlbiBwdXQgdGhlIEVudW1lcmF0aW9uRGVwcmVjYXRlZCBpbiBpdHMgb3duIC5qcyBmaWxlLlxuICogICAgIERvIG5vdCBjb21iaW5lIG11bHRpcGxlIEVudW1lcmF0aW9ucyBpbnRvIG9uZSBmaWxlLlxuICpcbiAqICg1KSBJZiBhIFByb3BlcnR5IHRha2VzIGFuIEVudW1lcmF0aW9uRGVwcmVjYXRlZCB2YWx1ZSwgaXRzIHZhbGlkYXRpb24gdHlwaWNhbGx5IGxvb2tzIGxpa2UgdGhpczpcbiAqXG4gKiAgICAgY29uc3QgY2FyZGluYWxEaXJlY3Rpb25Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggQ2FyZGluYWxEaXJlY3Rpb24uTk9SVEgsIHtcbiAqICAgICAgIHZhbGlkVmFsdWVzOiBDYXJkaW5hbERpcmVjdGlvbi5WQUxVRVNcbiAqICAgICB9XG4gKlxuICogKDYpIFZhbHVlcyBvZiB0aGUgRW51bWVyYXRpb25EZXByZWNhdGVkIGFyZSBjb25zaWRlcmVkIGluc3RhbmNlcyBvZiB0aGUgRW51bWVyYXRpb25EZXByZWNhdGVkIGluIGRvY3VtZW50YXRpb24uIEZvciBleGFtcGxlLCBhIG1ldGhvZFxuICogICAgIHRoYXQgdGhhdCB0YWtlcyBhbiBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgdmFsdWUgYXMgYW4gYXJndW1lbnQgd291bGQgYmUgZG9jdW1lbnRlZCBsaWtlIHRoaXM6XG4gKlxuICogICAgIC8vIEBwYXJhbSB7U2NlbmV9IG1vZGUgLSB2YWx1ZSBmcm9tIFNjZW5lIEVudW1lcmF0aW9uRGVwcmVjYXRlZFxuICogICAgIHNldFNjZW5lTW9kZSggbW9kZSApIHtcbiAqICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIFNjZW5lLmluY2x1ZGVzKCBtb2RlICkgKTtcbiAqICAgICAgIC8vLi4uXG4gKiAgICAgfVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgZGVwcmVjYXRpb25XYXJuaW5nIGZyb20gJy4vZGVwcmVjYXRpb25XYXJuaW5nLmpzJztcbmltcG9ydCBtZXJnZSBmcm9tICcuL21lcmdlLmpzJztcbmltcG9ydCBwaGV0Q29yZSBmcm9tICcuL3BoZXRDb3JlLmpzJztcblxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICovXG5jbGFzcyBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQge1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIC0gbXVzdCBwcm92aWRlIGtleXMgc3VjaCBhcyB7a2V5czpbJ1JFRCcsJ0JMVUVdfVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgLSBvciBtYXAgc3VjaCBhcyB7bWFwOntSRUQ6IG15UmVkVmFsdWUsIEJMVUU6IG15Qmx1ZVZhbHVlfX1cbiAgICpcbiAgICogQHByaXZhdGUgLSBjbGllbnRzIHNob3VsZCB1c2UgRW51bWVyYXRpb25EZXByZWNhdGVkLmJ5S2V5cyBvciBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQuYnlNYXBcbiAgICovXG4gIGNvbnN0cnVjdG9yKCBjb25maWcgKSB7XG4gICAgZGVwcmVjYXRpb25XYXJuaW5nKCAnRW51bWVyYXRpb25EZXByZWNhdGVkIHNob3VsZCBiZSBleGNoYW5nZWQgZm9yIGNsYXNzZXMgdGhhdCBleHRlbmQgRW51bWVyYXRpb25WYWx1ZSwgc2VlIFdpbGRlckVudW1lcmF0aW9uUGF0dGVybnMgZm9yIGV4YW1wbGVzLicgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbmZpZywgJ2NvbmZpZyBtdXN0IGJlIHByb3ZpZGVkJyApO1xuXG4gICAgY29uc3Qga2V5c1Byb3ZpZGVkID0gISFjb25maWcua2V5cztcbiAgICBjb25zdCBtYXBQcm92aWRlZCA9ICEhY29uZmlnLm1hcDtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBrZXlzUHJvdmlkZWQgIT09IG1hcFByb3ZpZGVkLCAnbXVzdCBwcm92aWRlIG9uZSBvciB0aGUgb3RoZXIgYnV0IG5vdCBib3RoIG9mIGtleXMvbWFwJyApO1xuXG4gICAgY29uc3Qga2V5cyA9IGNvbmZpZy5rZXlzIHx8IE9iamVjdC5rZXlzKCBjb25maWcubWFwICk7XG4gICAgY29uc3QgbWFwID0gY29uZmlnLm1hcCB8fCB7fTtcblxuICAgIGNvbmZpZyA9IG1lcmdlKCB7XG5cbiAgICAgIC8vIHtzdHJpbmd8bnVsbH0gV2lsbCBiZSBhcHBlbmRlZCB0byB0aGUgRW51bWVyYXRpb25JTyBkb2N1bWVudGF0aW9uLCBpZiBwcm92aWRlZFxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogbnVsbCxcblxuICAgICAgLy8ge2Z1bmN0aW9uKEVudW1lcmF0aW9uRGVwcmVjYXRlZCk6fG51bGx9IElmIHByb3ZpZGVkLCBpdCB3aWxsIGJlIGNhbGxlZCBhcyBiZWZvcmVGcmVlemUoIGVudW1lcmF0aW9uICkganVzdCBiZWZvcmUgdGhlXG4gICAgICAvLyBlbnVtZXJhdGlvbiBpcyBmcm96ZW4uIFNpbmNlIGl0J3Mgbm90IHBvc3NpYmxlIHRvIG1vZGlmeSB0aGUgZW51bWVyYXRpb24gYWZ0ZXJcbiAgICAgIC8vIGl0IGlzIGZyb3plbiAoZS5nLiBhZGRpbmcgY29udmVuaWVuY2UgZnVuY3Rpb25zKSwgYW5kIHRoZXJlIGlzIG5vIHJlZmVyZW5jZSB0b1xuICAgICAgLy8gdGhlIGVudW1lcmF0aW9uIG9iamVjdCBiZWZvcmVoYW5kLCB0aGlzIGFsbG93cyBkZWZpbmluZyBjdXN0b20gdmFsdWVzL21ldGhvZHNcbiAgICAgIC8vIG9uIHRoZSBlbnVtZXJhdGlvbiBvYmplY3QgaXRzZWxmLlxuICAgICAgYmVmb3JlRnJlZXplOiBudWxsXG4gICAgfSwgY29uZmlnICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBrZXlzICksICdWYWx1ZXMgc2hvdWxkIGJlIGFuIGFycmF5JyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8udW5pcSgga2V5cyApLmxlbmd0aCA9PT0ga2V5cy5sZW5ndGgsICdUaGVyZSBzaG91bGQgYmUgbm8gZHVwbGljYXRlZCB2YWx1ZXMgcHJvdmlkZWQnICk7XG4gICAgYXNzZXJ0ICYmIGtleXMuZm9yRWFjaCggdmFsdWUgPT4gYXNzZXJ0KCB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnLCAnRWFjaCB2YWx1ZSBzaG91bGQgYmUgYSBzdHJpbmcnICkgKTtcbiAgICBhc3NlcnQgJiYga2V5cy5mb3JFYWNoKCB2YWx1ZSA9PiBhc3NlcnQoIC9eW0EtWl1bQS1aMC05X10qJC9nLnRlc3QoIHZhbHVlICksXG4gICAgICAnRW51bWVyYXRpb25EZXByZWNhdGVkIHZhbHVlcyBzaG91bGQgYmUgdXBwZXJjYXNlIGFscGhhbnVtZXJpYyB3aXRoIHVuZGVyc2NvcmVzIGFuZCBiZWdpbiB3aXRoIGEgbGV0dGVyJyApICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIV8uaW5jbHVkZXMoIGtleXMsICdWQUxVRVMnICksXG4gICAgICAnVGhpcyBpcyB0aGUgbmFtZSBvZiBhIGJ1aWx0LWluIHByb3ZpZGVkIHZhbHVlLCBzbyBpdCBjYW5ub3QgYmUgaW5jbHVkZWQgYXMgYW4gZW51bWVyYXRpb24gdmFsdWUnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIV8uaW5jbHVkZXMoIGtleXMsICdLRVlTJyApLFxuICAgICAgJ1RoaXMgaXMgdGhlIG5hbWUgb2YgYSBidWlsdC1pbiBwcm92aWRlZCB2YWx1ZSwgc28gaXQgY2Fubm90IGJlIGluY2x1ZGVkIGFzIGFuIGVudW1lcmF0aW9uIHZhbHVlJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICFfLmluY2x1ZGVzKCBrZXlzLCAnaW5jbHVkZXMnICksXG4gICAgICAnVGhpcyBpcyB0aGUgbmFtZSBvZiBhIGJ1aWx0LWluIHByb3ZpZGVkIHZhbHVlLCBzbyBpdCBjYW5ub3QgYmUgaW5jbHVkZWQgYXMgYW4gZW51bWVyYXRpb24gdmFsdWUnICk7XG5cbiAgICAvLyBAcHVibGljIChwaGV0LWlvKSAtIHByb3ZpZGVzIGFkZGl0aW9uYWwgZG9jdW1lbnRhdGlvbiBmb3IgUGhFVC1pTyB3aGljaCBjYW4gYmUgdmlld2VkIGluIHN0dWRpb1xuICAgIC8vIE5vdGUgdGhpcyB1c2VzIHRoZSBzYW1lIHRlcm0gYXMgdXNlZCBieSBQaGV0aW9PYmplY3QsIGJ1dCB2aWEgYSBkaWZmZXJlbnQgY2hhbm5lbC5cbiAgICB0aGlzLnBoZXRpb0RvY3VtZW50YXRpb24gPSBjb25maWcucGhldGlvRG9jdW1lbnRhdGlvbjtcblxuICAgIC8vIEBwdWJsaWMge3N0cmluZ1tdfSAocmVhZC1vbmx5KSAtIHRoZSBzdHJpbmcga2V5cyBvZiB0aGUgZW51bWVyYXRpb25cbiAgICB0aGlzLktFWVMgPSBrZXlzO1xuXG4gICAgLy8gQHB1YmxpYyB7T2JqZWN0W119IChyZWFkLW9ubHkpIC0gdGhlIG9iamVjdCB2YWx1ZXMgb2YgdGhlIGVudW1lcmF0aW9uXG4gICAgdGhpcy5WQUxVRVMgPSBbXTtcblxuICAgIGtleXMuZm9yRWFjaCgga2V5ID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gbWFwWyBrZXkgXSB8fCB7fTtcblxuICAgICAgLy8gU2V0IGF0dHJpYnV0ZXMgb2YgdGhlIGVudW1lcmF0aW9uIHZhbHVlXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2YWx1ZS5uYW1lID09PSB1bmRlZmluZWQsICdcInJpY2hcIiBlbnVtZXJhdGlvbiB2YWx1ZXMgY2Fubm90IHByb3ZpZGUgdGhlaXIgb3duIG5hbWUgYXR0cmlidXRlJyApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdmFsdWUudG9TdHJpbmcgPT09IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcsICdcInJpY2hcIiBlbnVtZXJhdGlvbiB2YWx1ZXMgY2Fubm90IHByb3ZpZGUgdGhlaXIgb3duIHRvU3RyaW5nJyApO1xuXG4gICAgICAvLyBAcHVibGljIHtzdHJpbmd9IChyZWFkLW9ubHkpIC0gUGhFVC1pTyBwdWJsaWMgQVBJIHJlbGllcyBvbiB0aGlzIG1hcHBpbmcsIGRvIG5vdCBjaGFuZ2UgaXQgbGlnaHRseVxuICAgICAgdmFsdWUubmFtZSA9IGtleTtcblxuICAgICAgLy8gQHB1YmxpYyB7ZnVuY3Rpb24oKTpzdHJpbmd9IChyZWFkLW9ubHkpXG4gICAgICB2YWx1ZS50b1N0cmluZyA9ICgpID0+IGtleTtcblxuICAgICAgLy8gQXNzaWduIHRvIHRoZSBlbnVtZXJhdGlvblxuICAgICAgdGhpc1sga2V5IF0gPSB2YWx1ZTtcbiAgICAgIHRoaXMuVkFMVUVTLnB1c2goIHZhbHVlICk7XG4gICAgfSApO1xuXG4gICAgY29uZmlnLmJlZm9yZUZyZWV6ZSAmJiBjb25maWcuYmVmb3JlRnJlZXplKCB0aGlzICk7XG4gICAgYXNzZXJ0ICYmIE9iamVjdC5mcmVlemUoIHRoaXMgKTtcbiAgICBhc3NlcnQgJiYgT2JqZWN0LmZyZWV6ZSggdGhpcy5WQUxVRVMgKTtcbiAgICBhc3NlcnQgJiYgT2JqZWN0LmZyZWV6ZSggdGhpcy5LRVlTICk7XG4gICAgYXNzZXJ0ICYmIGtleXMuZm9yRWFjaCgga2V5ID0+IGFzc2VydCAmJiBPYmplY3QuZnJlZXplKCBtYXBbIGtleSBdICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCYXNlZCBzb2xlbHkgb24gdGhlIGtleXMgaW4gRW51bWVyYXRpb25EZXByZWNhdGVkLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9XG4gICAqL1xuXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLktFWVMuam9pbiggJywgJyApO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiB2YWx1ZSBpcyBhIHZhbHVlIG9mIHRoaXMgZW51bWVyYXRpb24uIFNob3VsZCBnZW5lcmFsbHkgYmUgdXNlZCBmb3IgYXNzZXJ0aW9uc1xuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGluY2x1ZGVzKCB2YWx1ZSApIHtcbiAgICByZXR1cm4gXy5pbmNsdWRlcyggdGhpcy5WQUxVRVMsIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogVG8gc3VwcG9ydCBjb25zaXN0ZW50IEFQSSB3aXRoIEVudW1lcmF0aW9uLlxuICAgKiBAcHVibGljXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAgICogQHJldHVybnMgeyp9XG4gICAqL1xuICBnZXRWYWx1ZSgga2V5ICkge1xuICAgIHJldHVybiB0aGlzWyBrZXkgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUbyBzdXBwb3J0IGNvbnNpc3RlbnQgQVBJIHdpdGggRW51bWVyYXRpb24uXG4gICAqIEBwdWJsaWNcbiAgICogQHBhcmFtIHtPYmplY3R9IGVudW1lcmF0aW9uVmFsdWVcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIGdldEtleSggZW51bWVyYXRpb25WYWx1ZSApIHtcbiAgICByZXR1cm4gZW51bWVyYXRpb25WYWx1ZS5uYW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvIHN1cHBvcnQgY29uc2lzdGVudCBBUEkgd2l0aCBFbnVtZXJhdGlvbi5cbiAgICogQHB1YmxpY1xuICAgKiBAcmV0dXJucyB7T2JqZWN0W119XG4gICAqL1xuICBnZXQgdmFsdWVzKCkge1xuICAgIHJldHVybiB0aGlzLlZBTFVFUztcbiAgfVxuXG4gIC8qKlxuICAgKiBUbyBzdXBwb3J0IGNvbnNpc3RlbnQgQVBJIHdpdGggRW51bWVyYXRpb24uXG4gICAqIEBwdWJsaWNcbiAgICogQHJldHVybnMge3N0cmluZ1tdfVxuICAgKi9cbiAgZ2V0IGtleXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuS0VZUztcbiAgfVxuXG4gIC8qKlxuICAgKiBUbyBzdXBwb3J0IGNvbnNpc3RlbnQgQVBJIHdpdGggRW51bWVyYXRpb24uXG4gICAqIEBwdWJsaWNcbiAgICogQHJldHVybnMge0VudW1lcmF0aW9uRGVwcmVjYXRlZH1cbiAgICovXG4gIGdldCBlbnVtZXJhdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGVudW1lcmF0aW9uIGJhc2VkIG9uIHRoZSBwcm92aWRlZCBzdHJpbmcgYXJyYXlcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0ga2V5cyAtIHN1Y2ggYXMgWydSRUQnLCdCTFVFJ11cbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKiBAcmV0dXJucyB7RW51bWVyYXRpb25EZXByZWNhdGVkfVxuICAgKiBAcHVibGljXG4gICAqL1xuICBzdGF0aWMgYnlLZXlzKCBrZXlzLCBvcHRpb25zICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIGtleXMgKSwgJ2tleXMgbXVzdCBiZSBhbiBhcnJheScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucyB8fCBvcHRpb25zLmtleXMgPT09IHVuZGVmaW5lZCApO1xuICAgIHJldHVybiBuZXcgRW51bWVyYXRpb25EZXByZWNhdGVkKCBtZXJnZSggeyBrZXlzOiBrZXlzIH0sIG9wdGlvbnMgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBcInJpY2hcIiBlbnVtZXJhdGlvbiBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgbWFwXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBtYXAgLSBzdWNoIGFzIHtSRUQ6IG15UmVkVmFsdWUsIEJMVUU6IG15Qmx1ZVZhbHVlfVxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAqIEByZXR1cm5zIHtFbnVtZXJhdGlvbkRlcHJlY2F0ZWR9XG4gICAqIEBwdWJsaWNcbiAgICovXG4gIHN0YXRpYyBieU1hcCggbWFwLCBvcHRpb25zICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zIHx8IG9wdGlvbnMubWFwID09PSB1bmRlZmluZWQgKTtcbiAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgIGNvbnN0IHZhbHVlcyA9IF8udmFsdWVzKCBtYXAgKTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHZhbHVlcy5sZW5ndGggPj0gMSwgJ211c3QgaGF2ZSBhdCBsZWFzdCAyIGVudHJpZXMgaW4gYW4gZW51bWVyYXRpb24nICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmV2ZXJ5KCB2YWx1ZXMsIHZhbHVlID0+IHZhbHVlLmNvbnN0cnVjdG9yID09PSB2YWx1ZXNbIDAgXS5jb25zdHJ1Y3RvciApLCAnVmFsdWVzIG11c3QgaGF2ZSBzYW1lIGNvbnN0cnVjdG9yJyApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IEVudW1lcmF0aW9uRGVwcmVjYXRlZCggbWVyZ2UoIHsgbWFwOiBtYXAgfSwgb3B0aW9ucyApICk7XG4gIH1cbn1cblxucGhldENvcmUucmVnaXN0ZXIoICdFbnVtZXJhdGlvbkRlcHJlY2F0ZWQnLCBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgKTtcbmV4cG9ydCBkZWZhdWx0IEVudW1lcmF0aW9uRGVwcmVjYXRlZDsiXSwibmFtZXMiOlsiZGVwcmVjYXRpb25XYXJuaW5nIiwibWVyZ2UiLCJwaGV0Q29yZSIsIkVudW1lcmF0aW9uRGVwcmVjYXRlZCIsInRvU3RyaW5nIiwiS0VZUyIsImpvaW4iLCJpbmNsdWRlcyIsInZhbHVlIiwiXyIsIlZBTFVFUyIsImdldFZhbHVlIiwia2V5IiwiZ2V0S2V5IiwiZW51bWVyYXRpb25WYWx1ZSIsIm5hbWUiLCJ2YWx1ZXMiLCJrZXlzIiwiZW51bWVyYXRpb24iLCJieUtleXMiLCJvcHRpb25zIiwiYXNzZXJ0IiwiQXJyYXkiLCJpc0FycmF5IiwidW5kZWZpbmVkIiwiYnlNYXAiLCJtYXAiLCJsZW5ndGgiLCJldmVyeSIsImNvbnN0cnVjdG9yIiwiY29uZmlnIiwia2V5c1Byb3ZpZGVkIiwibWFwUHJvdmlkZWQiLCJPYmplY3QiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiYmVmb3JlRnJlZXplIiwidW5pcSIsImZvckVhY2giLCJ0ZXN0IiwicHJvdG90eXBlIiwicHVzaCIsImZyZWV6ZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXlEQyxHQUVELE9BQU9BLHdCQUF3QiwwQkFBMEI7QUFDekQsT0FBT0MsV0FBVyxhQUFhO0FBQy9CLE9BQU9DLGNBQWMsZ0JBQWdCO0FBRXJDOztDQUVDLEdBQ0QsSUFBQSxBQUFNQyx3QkFBTixNQUFNQTtJQWdGSjs7Ozs7R0FLQyxHQUVEQyxXQUFXO1FBQ1QsT0FBTyxJQUFJLENBQUNDLElBQUksQ0FBQ0MsSUFBSSxDQUFFO0lBQ3pCO0lBRUE7Ozs7OztHQU1DLEdBQ0RDLFNBQVVDLEtBQUssRUFBRztRQUNoQixPQUFPQyxFQUFFRixRQUFRLENBQUUsSUFBSSxDQUFDRyxNQUFNLEVBQUVGO0lBQ2xDO0lBRUE7Ozs7O0dBS0MsR0FDREcsU0FBVUMsR0FBRyxFQUFHO1FBQ2QsT0FBTyxJQUFJLENBQUVBLElBQUs7SUFDcEI7SUFFQTs7Ozs7R0FLQyxHQUNEQyxPQUFRQyxnQkFBZ0IsRUFBRztRQUN6QixPQUFPQSxpQkFBaUJDLElBQUk7SUFDOUI7SUFFQTs7OztHQUlDLEdBQ0QsSUFBSUMsU0FBUztRQUNYLE9BQU8sSUFBSSxDQUFDTixNQUFNO0lBQ3BCO0lBRUE7Ozs7R0FJQyxHQUNELElBQUlPLE9BQU87UUFDVCxPQUFPLElBQUksQ0FBQ1osSUFBSTtJQUNsQjtJQUVBOzs7O0dBSUMsR0FDRCxJQUFJYSxjQUFjO1FBQ2hCLE9BQU8sSUFBSTtJQUNiO0lBRUE7Ozs7OztHQU1DLEdBQ0QsT0FBT0MsT0FBUUYsSUFBSSxFQUFFRyxPQUFPLEVBQUc7UUFDN0JDLFVBQVVBLE9BQVFDLE1BQU1DLE9BQU8sQ0FBRU4sT0FBUTtRQUN6Q0ksVUFBVUEsT0FBUSxDQUFDRCxXQUFXQSxRQUFRSCxJQUFJLEtBQUtPO1FBQy9DLE9BQU8sSUFBSXJCLHNCQUF1QkYsTUFBTztZQUFFZ0IsTUFBTUE7UUFBSyxHQUFHRztJQUMzRDtJQUVBOzs7Ozs7R0FNQyxHQUNELE9BQU9LLE1BQU9DLEdBQUcsRUFBRU4sT0FBTyxFQUFHO1FBQzNCQyxVQUFVQSxPQUFRLENBQUNELFdBQVdBLFFBQVFNLEdBQUcsS0FBS0Y7UUFDOUMsSUFBS0gsUUFBUztZQUNaLE1BQU1MLFNBQVNQLEVBQUVPLE1BQU0sQ0FBRVU7WUFDekJMLFVBQVVBLE9BQVFMLE9BQU9XLE1BQU0sSUFBSSxHQUFHO1lBQ3RDTixVQUFVQSxPQUFRWixFQUFFbUIsS0FBSyxDQUFFWixRQUFRUixDQUFBQSxRQUFTQSxNQUFNcUIsV0FBVyxLQUFLYixNQUFNLENBQUUsRUFBRyxDQUFDYSxXQUFXLEdBQUk7UUFDL0Y7UUFDQSxPQUFPLElBQUkxQixzQkFBdUJGLE1BQU87WUFBRXlCLEtBQUtBO1FBQUksR0FBR047SUFDekQ7SUEvS0E7Ozs7O0dBS0MsR0FDRFMsWUFBYUMsTUFBTSxDQUFHO1FBQ3BCOUIsbUJBQW9CO1FBRXBCcUIsVUFBVUEsT0FBUVMsUUFBUTtRQUUxQixNQUFNQyxlQUFlLENBQUMsQ0FBQ0QsT0FBT2IsSUFBSTtRQUNsQyxNQUFNZSxjQUFjLENBQUMsQ0FBQ0YsT0FBT0osR0FBRztRQUNoQ0wsVUFBVUEsT0FBUVUsaUJBQWlCQyxhQUFhO1FBRWhELE1BQU1mLE9BQU9hLE9BQU9iLElBQUksSUFBSWdCLE9BQU9oQixJQUFJLENBQUVhLE9BQU9KLEdBQUc7UUFDbkQsTUFBTUEsTUFBTUksT0FBT0osR0FBRyxJQUFJLENBQUM7UUFFM0JJLFNBQVM3QixNQUFPO1lBRWQsaUZBQWlGO1lBQ2pGaUMscUJBQXFCO1lBRXJCLHdIQUF3SDtZQUN4SCxpRkFBaUY7WUFDakYsaUZBQWlGO1lBQ2pGLGdGQUFnRjtZQUNoRixvQ0FBb0M7WUFDcENDLGNBQWM7UUFDaEIsR0FBR0w7UUFFSFQsVUFBVUEsT0FBUUMsTUFBTUMsT0FBTyxDQUFFTixPQUFRO1FBQ3pDSSxVQUFVQSxPQUFRWixFQUFFMkIsSUFBSSxDQUFFbkIsTUFBT1UsTUFBTSxLQUFLVixLQUFLVSxNQUFNLEVBQUU7UUFDekROLFVBQVVKLEtBQUtvQixPQUFPLENBQUU3QixDQUFBQSxRQUFTYSxPQUFRLE9BQU9iLFVBQVUsVUFBVTtRQUNwRWEsVUFBVUosS0FBS29CLE9BQU8sQ0FBRTdCLENBQUFBLFFBQVNhLE9BQVEscUJBQXFCaUIsSUFBSSxDQUFFOUIsUUFDbEU7UUFDRmEsVUFBVUEsT0FBUSxDQUFDWixFQUFFRixRQUFRLENBQUVVLE1BQU0sV0FDbkM7UUFDRkksVUFBVUEsT0FBUSxDQUFDWixFQUFFRixRQUFRLENBQUVVLE1BQU0sU0FDbkM7UUFDRkksVUFBVUEsT0FBUSxDQUFDWixFQUFFRixRQUFRLENBQUVVLE1BQU0sYUFDbkM7UUFFRixrR0FBa0c7UUFDbEcscUZBQXFGO1FBQ3JGLElBQUksQ0FBQ2lCLG1CQUFtQixHQUFHSixPQUFPSSxtQkFBbUI7UUFFckQsc0VBQXNFO1FBQ3RFLElBQUksQ0FBQzdCLElBQUksR0FBR1k7UUFFWix3RUFBd0U7UUFDeEUsSUFBSSxDQUFDUCxNQUFNLEdBQUcsRUFBRTtRQUVoQk8sS0FBS29CLE9BQU8sQ0FBRXpCLENBQUFBO1lBQ1osTUFBTUosUUFBUWtCLEdBQUcsQ0FBRWQsSUFBSyxJQUFJLENBQUM7WUFFN0IsMENBQTBDO1lBQzFDUyxVQUFVQSxPQUFRYixNQUFNTyxJQUFJLEtBQUtTLFdBQVc7WUFDNUNILFVBQVVBLE9BQVFiLE1BQU1KLFFBQVEsS0FBSzZCLE9BQU9NLFNBQVMsQ0FBQ25DLFFBQVEsRUFBRTtZQUVoRSxxR0FBcUc7WUFDckdJLE1BQU1PLElBQUksR0FBR0g7WUFFYiwwQ0FBMEM7WUFDMUNKLE1BQU1KLFFBQVEsR0FBRyxJQUFNUTtZQUV2Qiw0QkFBNEI7WUFDNUIsSUFBSSxDQUFFQSxJQUFLLEdBQUdKO1lBQ2QsSUFBSSxDQUFDRSxNQUFNLENBQUM4QixJQUFJLENBQUVoQztRQUNwQjtRQUVBc0IsT0FBT0ssWUFBWSxJQUFJTCxPQUFPSyxZQUFZLENBQUUsSUFBSTtRQUNoRGQsVUFBVVksT0FBT1EsTUFBTSxDQUFFLElBQUk7UUFDN0JwQixVQUFVWSxPQUFPUSxNQUFNLENBQUUsSUFBSSxDQUFDL0IsTUFBTTtRQUNwQ1csVUFBVVksT0FBT1EsTUFBTSxDQUFFLElBQUksQ0FBQ3BDLElBQUk7UUFDbENnQixVQUFVSixLQUFLb0IsT0FBTyxDQUFFekIsQ0FBQUEsTUFBT1MsVUFBVVksT0FBT1EsTUFBTSxDQUFFZixHQUFHLENBQUVkLElBQUs7SUFDcEU7QUFvR0Y7QUFFQVYsU0FBU3dDLFFBQVEsQ0FBRSx5QkFBeUJ2QztBQUM1QyxlQUFlQSxzQkFBc0IifQ==