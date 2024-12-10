// Copyright 2016-2024, University of Colorado Boulder
/**
 * Query String parser that supports type coercion, defaults, error checking, etc. based on a schema.
 * See QueryStringMachine.get for the description of a schema.
 *
 * Implemented as a UMD (Universal Module Definition) so that it's capable of working everywhere.
 * See https://github.com/umdjs/umd/blob/master/templates/returnExports.js
 *
 * See TYPES for a description of the schema types and their properties.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */ (function(root, factory) {
    if (typeof window.define === 'function' && window.define.amd) {
        // AMD. Register as an anonymous module.
        window.define([], factory);
    } else {
        // Browser globals (root is window)
        root.QueryStringMachine = factory();
    }
})(this, ()=>{
    // Default string that splits array strings
    const DEFAULT_SEPARATOR = ',';
    // If a query parameter has private:true in its schema, it must pass this predicate to be read from the URL.
    // See https://github.com/phetsims/chipper/issues/743
    const privatePredicate = ()=>{
        // Trying to access localStorage may fail with a SecurityError if cookies are blocked in a certain way.
        // See https://github.com/phetsims/qa/issues/329 for more information.
        try {
            return localStorage.getItem('phetTeamMember') === 'true';
        } catch (e) {
            return false;
        }
    };
    /**
   * Valid parameter strings begin with ? or are the empty string.  This is used for assertions in some cases and for
   * throwing Errors in other cases.
   * @param {string} string
   * @returns {boolean}
   */ const isParameterString = (string)=>string.length === 0 || string.indexOf('?') === 0;
    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return function() {
        /**
     * In order to support graceful failures for user-supplied values, we fall back to default values when public: true
     * is specified.  If the schema entry is public: false, then a queryStringMachineAssert is thrown.
     * @param {boolean} predicate
     * @param {string} key
     * @param {Object} value - value of the parsed type, or, if parsing failed, the {string} that would not parse
     * @param {Object} schema
     * @param {string} message
     * @returns {Object}
     */ const getValidValue = (predicate, key, value, schema, message)=>{
            if (!predicate) {
                if (schema.public) {
                    QueryStringMachine.addWarning(key, value, message);
                    if (schema.hasOwnProperty('defaultValue')) {
                        value = schema.defaultValue;
                    } else {
                        const typeSchema = TYPES[schema.type];
                        queryStringMachineAssert(typeSchema.hasOwnProperty('defaultValue'), 'Type must have a default value if the provided schema does not have one.');
                        value = typeSchema.defaultValue;
                    }
                } else {
                    queryStringMachineAssert(predicate, message);
                }
            }
            return value;
        };
        /**
     * Query String Machine is a query string parser that supports type coercion, default values & validation. Please
     * visit PhET's <a href="https://github.com/phetsims/query-string-machine" target="_blank">query-string-machine</a>
     * repository for documentation and examples.
     */ const QueryStringMachine = {
            // @public (read-only) {{key:string, value:{*}, message:string}[]} - cleared by some tests in QueryStringMachineTests.js
            // See QueryStringMachine.addWarning for a description of these fields, and to add warnings.
            warnings: [],
            /**
       * Gets the value for a single query parameter.
       *
       * @param {string} key - the query parameter name
       * @param {Object} schema
       * @returns {*} query parameter value, converted to the proper type
       * @public
       */ get: function(key, schema) {
                return this.getForString(key, schema, window.location.search);
            },
            /**
       * Gets values for every query parameter, using the specified schema map.
       *
       * @param {Object} schemaMap - see QueryStringMachine.getAllForString
       * @returns {Object} - see QueryStringMachine.getAllForString
       * @public
       */ getAll: function(schemaMap) {
                return this.getAllForString(schemaMap, window.location.search);
            },
            /**
       * Like `get` but for an arbitrary parameter string.
       *
       * @param {string} key - the query parameter name
       * @param {Object} schema - see QueryStringMachine.get
       * @param {string} string - the parameters string.  Must begin with '?' or be the empty string
       * @returns {*} query parameter value, converted to the proper type
       * @public
       */ getForString: function(key, schema, string) {
                if (!isParameterString(string)) {
                    throw new Error(`Query strings should be either the empty string or start with a "?": ${string}`);
                }
                // Ignore URL values for private query parameters that fail privatePredicate.
                // See https://github.com/phetsims/chipper/issues/743.
                const values = schema.private && !privatePredicate() ? [] : getValues(key, string);
                validateSchema(key, schema);
                let value = parseValues(key, schema, values);
                if (schema.hasOwnProperty('validValues')) {
                    value = getValidValue(isValidValue(value, schema.validValues), key, value, schema, `Invalid value supplied for key "${key}": ${value} is not a member of valid values: ${schema.validValues.join(', ')}`);
                } else if (schema.hasOwnProperty('isValidValue')) {
                    value = getValidValue(schema.isValidValue(value), key, value, schema, `Invalid value supplied for key "${key}": ${value}`);
                }
                let valueValid = TYPES[schema.type].isValidValue(value);
                // support custom validation for elementSchema for arrays
                if (schema.type === 'array' && Array.isArray(value)) {
                    let elementsValid = true;
                    for(let i = 0; i < value.length; i++){
                        const element = value[i];
                        if (!TYPES[schema.elementSchema.type].isValidValue(element)) {
                            elementsValid = false;
                            break;
                        }
                        if (schema.elementSchema.hasOwnProperty('isValidValue') && !schema.elementSchema.isValidValue(element)) {
                            elementsValid = false;
                            break;
                        }
                        if (schema.elementSchema.hasOwnProperty('validValues') && !isValidValue(element, schema.elementSchema.validValues)) {
                            elementsValid = false;
                            break;
                        }
                    }
                    valueValid = valueValid && elementsValid;
                }
                // dispatch further validation to a type-specific function
                value = getValidValue(valueValid, key, value, schema, `Invalid value for type, key: ${key}`);
                return value;
            },
            /**
       * Like `getAll` but for an arbitrary parameters string.
       * @param {Object} schemaMap - key/value pairs, key is query parameter name and value is a schema
       * @param {string} string - the parameters string
       * @returns {Object} - key/value pairs holding the parsed results
       * @public
       */ getAllForString: function(schemaMap, string) {
                const result = {};
                for(const key in schemaMap){
                    if (schemaMap.hasOwnProperty(key)) {
                        result[key] = this.getForString(key, schemaMap[key], string);
                    }
                }
                return result;
            },
            /**
       * Returns true if the window.location.search contains the given key
       * @param {string} key
       * @returns {boolean} true if the window.location.search contains the given key
       * @public
       */ containsKey: function(key) {
                return this.containsKeyForString(key, window.location.search);
            },
            /**
       * Returns true if the given string contains the specified key
       * @param {string} key - the key to check for
       * @param {string} string - the query string to search. Must begin with '?' or be the empty string
       * @returns {boolean} true if the given string contains the given key
       * @public
       */ containsKeyForString: function(key, string) {
                if (!isParameterString(string)) {
                    throw new Error(`Query strings should be either the empty string or start with a "?": ${string}`);
                }
                const values = getValues(key, string);
                return values.length > 0;
            },
            /**
       * Returns true if the objects are equal.  Exported on the QueryStringMachine for testing.  Only works for
       * arrays objects that contain primitives (i.e. terminals are compared with ===)
       * @param {Object} a - an object to compare
       * @param {Object} b - an object to compare
       * @private - however, it is called from QueryStringMachineTests
       */ deepEquals: function(a, b) {
                if (typeof a !== typeof b) {
                    return false;
                }
                if (typeof a === 'string' || typeof a === 'number' || typeof a === 'boolean') {
                    return a === b;
                }
                if (a === null && b === null) {
                    return true;
                }
                if (a === undefined && b === undefined) {
                    return true;
                }
                if (a === null && b === undefined) {
                    return false;
                }
                if (a === undefined && b === null) {
                    return false;
                }
                const aKeys = Object.keys(a);
                const bKeys = Object.keys(b);
                if (aKeys.length !== bKeys.length) {
                    return false;
                } else if (aKeys.length === 0) {
                    return a === b;
                } else {
                    for(let i = 0; i < aKeys.length; i++){
                        if (aKeys[i] !== bKeys[i]) {
                            return false;
                        }
                        const aChild = a[aKeys[i]];
                        const bChild = b[aKeys[i]];
                        if (!QueryStringMachine.deepEquals(aChild, bChild)) {
                            return false;
                        }
                    }
                    return true;
                }
            },
            /**
       * Returns a new URL but without the key-value pair.
       *
       * @param {string} queryString - tail of a URL including the beginning '?' (if any)
       * @param {string} key
       * @public
       */ removeKeyValuePair: function(queryString, key) {
                assert && assert(typeof queryString === 'string', `url should be string, but it was: ${typeof queryString}`);
                assert && assert(typeof key === 'string', `url should be string, but it was: ${typeof key}`);
                assert && assert(isParameterString(queryString), 'queryString should be length 0 or begin with ?');
                assert && assert(key.length > 0, 'url should be a string with length > 0');
                if (queryString.indexOf('?') === 0) {
                    const newParameters = [];
                    const query = queryString.substring(1);
                    const elements = query.split('&');
                    for(let i = 0; i < elements.length; i++){
                        const element = elements[i];
                        const keyAndMaybeValue = element.split('=');
                        const elementKey = decodeURIComponent(keyAndMaybeValue[0]);
                        if (elementKey !== key) {
                            newParameters.push(element);
                        }
                    }
                    if (newParameters.length > 0) {
                        return `?${newParameters.join('&')}`;
                    } else {
                        return '';
                    }
                } else {
                    return queryString;
                }
            },
            /**
       * Remove all the keys from the queryString (ok if they do not appear at all)
       * @param {string} queryString
       * @param {string[]} keys
       * @returns {string}
       * @public
       */ removeKeyValuePairs: function(queryString, keys) {
                for(let i = 0; i < keys.length; i++){
                    queryString = this.removeKeyValuePair(queryString, keys[i]);
                }
                return queryString;
            },
            /**
       * Appends a query string to a given url.
       * @param {string} url - may or may not already have other query parameters
       * @param {string} queryParameters - may start with '', '?' or '&'
       * @returns {string}
       * @public
       * @static
       *
       * @example
       * // Limit to the second screen
       * simURL = QueryStringMachine.appendQueryString( simURL, 'screens=2' );
       */ appendQueryString: function(url, queryParameters) {
                if (queryParameters.indexOf('?') === 0 || queryParameters.indexOf('&') === 0) {
                    queryParameters = queryParameters.substring(1);
                }
                if (queryParameters.length === 0) {
                    return url;
                }
                const combination = url.indexOf('?') >= 0 ? '&' : '?';
                return url + combination + queryParameters;
            },
            /**
       * Helper function for multiple query strings
       * @param {string} url - may or may not already have other query parameters
       * @param {Array.<string>} queryStringArray - each item may start with '', '?', or '&'
       * @returns {string}
       * @public
       * @static
       *
       * @example
       * sourceFrame.src = QueryStringMachine.appendQueryStringArray( simURL, [ 'screens=2', 'frameTitle=source' ] );
       */ appendQueryStringArray: function(url, queryStringArray) {
                for(let i = 0; i < queryStringArray.length; i++){
                    url = this.appendQueryString(url, queryStringArray[i]);
                }
                return url;
            },
            /**
       * Returns the query string at the end of a url, or '?' if there is none.
       * @param {string} url
       * @returns {string}
       * @public
       */ getQueryString: function(url) {
                const index = url.indexOf('?');
                if (index >= 0) {
                    return url.substring(index);
                } else {
                    return '?';
                }
            },
            /**
       * Adds a warning to the console and QueryStringMachine.warnings to indicate that the provided invalid value will
       * not be used.
       *
       * @param {string} key - the query parameter name
       * @param {Object} value - type depends on schema type
       * @param {string} message - the message that indicates the problem with the value
       * @public
       */ addWarning: function(key, value, message) {
                let isDuplicate = false;
                for(let i = 0; i < this.warnings.length; i++){
                    const warning = this.warnings[i];
                    if (key === warning.key && value === warning.value && message === warning.message) {
                        isDuplicate = true;
                        break;
                    }
                }
                if (!isDuplicate) {
                    console.warn(message);
                    this.warnings.push({
                        key: key,
                        value: value,
                        message: message
                    });
                }
            },
            /**
       * Determines if there is a warning for a specified key.
       * @param {string} key
       * @returns {boolean}
       * @public
       */ hasWarning: function(key) {
                let hasWarning = false;
                for(let i = 0; i < this.warnings.length && !hasWarning; i++){
                    hasWarning = this.warnings[i].key === key;
                }
                return hasWarning;
            },
            /**
       * @param {string} queryString - tail of a URL including the beginning '?' (if any)
       * @returns {string[]} - the split up still-URI-encoded parameters (with values if present)
       * @public
       */ getQueryParametersFromString: function(queryString) {
                if (queryString.indexOf('?') === 0) {
                    const query = queryString.substring(1);
                    return query.split('&');
                }
                return [];
            },
            /**
       * @param {string} key - the query parameter key to return if present
       * @param {string} string - a URL including a "?" if it has a query string
       * @returns {string|null} - the query parameter as it appears in the URL, like `key=VALUE`, or null if not present
       * @public
       */ getSingleQueryParameterString: function(key, string) {
                const queryString = this.getQueryString(string);
                const queryParameters = this.getQueryParametersFromString(queryString);
                for(let i = 0; i < queryParameters.length; i++){
                    const queryParameter = queryParameters[i];
                    const keyAndMaybeValue = queryParameter.split('=');
                    if (decodeURIComponent(keyAndMaybeValue[0]) === key) {
                        return queryParameter;
                    }
                }
                return null;
            }
        };
        /**
     * Query strings may show the same key appearing multiple times, such as ?value=2&value=3.
     * This method recovers all of the string values.  For this example, it would be ['2','3'].
     *
     * @param {string} key - the key for which we are finding values.
     * @param {string} string - the parameters string
     * @returns {Array.<string|null>} - the resulting values, null indicates the query parameter is present with no value
     */ const getValues = function(key, string) {
            const values = [];
            const params = string.slice(1).split('&');
            for(let i = 0; i < params.length; i++){
                const splitByEquals = params[i].split('=');
                const name = splitByEquals[0];
                const value = splitByEquals.slice(1).join('='); // Support arbitrary number of '=' in the value
                if (name === key) {
                    if (value) {
                        values.push(decodeURIComponent(value));
                    } else {
                        values.push(null); // no value provided
                    }
                }
            }
            return values;
        };
        // Schema validation ===============================================================================================
        /**
     * Validates the schema for a query parameter.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     */ const validateSchema = function(key, schema) {
            // type is required
            queryStringMachineAssert(schema.hasOwnProperty('type'), `type field is required for key: ${key}`);
            // type is valid
            queryStringMachineAssert(TYPES.hasOwnProperty(schema.type), `invalid type: ${schema.type} for key: ${key}`);
            // parse is a function
            if (schema.hasOwnProperty('parse')) {
                queryStringMachineAssert(typeof schema.parse === 'function', `parse must be a function for key: ${key}`);
            }
            // validValues and isValidValue are optional and mutually exclusive
            queryStringMachineAssert(!(schema.hasOwnProperty('validValues') && schema.hasOwnProperty('isValidValue')), schema, key, `validValues and isValidValue are mutually exclusive for key: ${key}`);
            // validValues is an Array
            if (schema.hasOwnProperty('validValues')) {
                queryStringMachineAssert(Array.isArray(schema.validValues), `isValidValue must be an array for key: ${key}`);
            }
            // isValidValue is a function
            if (schema.hasOwnProperty('isValidValue')) {
                queryStringMachineAssert(typeof schema.isValidValue === 'function', `isValidValue must be a function for key: ${key}`);
            }
            // defaultValue has the correct type
            if (schema.hasOwnProperty('defaultValue')) {
                queryStringMachineAssert(TYPES[schema.type].isValidValue(schema.defaultValue), `defaultValue incorrect type: ${key}`);
            }
            // validValues have the correct type
            if (schema.hasOwnProperty('validValues')) {
                schema.validValues.forEach((value)=>queryStringMachineAssert(TYPES[schema.type].isValidValue(value), `validValue incorrect type for key: ${key}`));
            }
            // defaultValue is a member of validValues
            if (schema.hasOwnProperty('defaultValue') && schema.hasOwnProperty('validValues')) {
                queryStringMachineAssert(isValidValue(schema.defaultValue, schema.validValues), schema, key, `defaultValue must be a member of validValues, for key: ${key}`);
            }
            // defaultValue must exist for a public schema so there's a fallback in case a user provides an invalid value.
            // However, defaultValue is not required for flags since they're only a key. While marking a flag as public: true
            // doesn't change its behavior, it's allowed so that we can use the public key for documentation, see https://github.com/phetsims/query-string-machine/issues/41
            if (schema.hasOwnProperty('public') && schema.public && schema.type !== 'flag') {
                queryStringMachineAssert(schema.hasOwnProperty('defaultValue'), `defaultValue is required when public: true for key: ${key}`);
            }
            // verify that the schema has appropriate properties
            validateSchemaProperties(key, schema, TYPES[schema.type].required, TYPES[schema.type].optional);
            // dispatch further validation to an (optional) type-specific function
            if (TYPES[schema.type].validateSchema) {
                TYPES[schema.type].validateSchema(key, schema);
            }
        };
        /**
     * Validates schema for type 'array'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     */ const validateArraySchema = function(key, schema) {
            // separator is a single character
            if (schema.hasOwnProperty('separator')) {
                queryStringMachineAssert(typeof schema.separator === 'string' && schema.separator.length === 1, `invalid separator: ${schema.separator}, for key: ${key}`);
            }
            queryStringMachineAssert(!schema.elementSchema.hasOwnProperty('public'), 'Array elements should not declare public; it comes from the array schema itself.');
            // validate elementSchema
            validateSchema(`${key}.element`, schema.elementSchema);
        };
        /**
     * Verifies that a schema contains only supported properties, and contains all required properties.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string[]} requiredProperties - properties that the schema must have
     * @param {string[]} optionalProperties - properties that the schema may optionally have
     */ const validateSchemaProperties = function(key, schema, requiredProperties, optionalProperties) {
            // {string[]}, the names of the properties in the schema
            const schemaProperties = Object.getOwnPropertyNames(schema);
            // verify that all required properties are present
            requiredProperties.forEach((property)=>{
                queryStringMachineAssert(schemaProperties.indexOf(property) !== -1, `missing required property: ${property} for key: ${key}`);
            });
            // verify that there are no unsupported properties
            const supportedProperties = requiredProperties.concat(optionalProperties);
            schemaProperties.forEach((property)=>{
                queryStringMachineAssert(property === 'type' || supportedProperties.indexOf(property) !== -1, `unsupported property: ${property} for key: ${key}`);
            });
        };
        // Parsing =========================================================================================================
        /**
     * Uses the supplied schema to convert query parameter value(s) from string to the desired value type.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {Array.<string|null|undefined>} values - any matches from the query string,
     *   could be multiple for ?value=x&value=y for example
     * @returns {*} the associated value, converted to the proper type
     */ const parseValues = function(key, schema, values) {
            let returnValue;
            // values contains values for all occurrences of the query parameter.  We currently support only 1 occurrence.
            queryStringMachineAssert(values.length <= 1, `query parameter cannot occur multiple times: ${key}`);
            if (schema.type === 'flag') {
                // flag is a convenient variation of boolean, which depends on whether the query string is present or not
                returnValue = TYPES[schema.type].parse(key, schema, values[0]);
            } else {
                queryStringMachineAssert(values[0] !== undefined || schema.hasOwnProperty('defaultValue'), `missing required query parameter: ${key}`);
                if (values[0] === undefined) {
                    // not in the query string, use the default
                    returnValue = schema.defaultValue;
                } else {
                    // dispatch parsing of query string to a type-specific function
                    returnValue = TYPES[schema.type].parse(key, schema, values[0]);
                }
            }
            return returnValue;
        };
        /**
     * Parses the value for a type 'flag'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {null|undefined|string} value - value from the query parameter string
     * @returns {boolean|string}
     */ const parseFlag = function(key, schema, value) {
            return value === null ? true : value === undefined ? false : value;
        };
        /**
     * Parses the value for a type 'boolean'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string|null} string - value from the query parameter string
     * @returns {boolean|string|null}
     */ const parseBoolean = function(key, schema, string) {
            return string === 'true' ? true : string === 'false' ? false : string;
        };
        /**
     * Parses the value for a type 'number'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string|null} string - value from the query parameter string
     * @returns {number|string|null}
     */ const parseNumber = function(key, schema, string) {
            const number = Number(string);
            return string === null || isNaN(number) ? string : number;
        };
        /**
     * Parses the value for a type 'number'.
     * The value to be parsed is already string, so it is guaranteed to parse as a string.
     * @param {string} key
     * @param {Object} schema
     * @param {string|null} string
     * @returns {string|null}
     */ const parseString = function(key, schema, string) {
            return string;
        };
        /**
     * Parses the value for a type 'array'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string|null} value - value from the query parameter string
     * @returns {Array.<*>|null}
     */ const parseArray = function(key, schema, value) {
            let returnValue;
            if (value === null) {
                // null signifies an empty array. For instance ?screens= would give []
                // See https://github.com/phetsims/query-string-machine/issues/17
                returnValue = [];
            } else {
                // Split up the string into an array of values. E.g. ?screens=1,2 would give [1,2]
                returnValue = value.split(schema.separator || DEFAULT_SEPARATOR).map((element)=>parseValues(key, schema.elementSchema, [
                        element
                    ]));
            }
            return returnValue;
        };
        /**
     * Parses the value for a type 'custom'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string} value - value from the query parameter string
     * @returns {*}
     */ const parseCustom = function(key, schema, value) {
            return schema.parse(value);
        };
        // Utilities =======================================================================================================
        /**
     * Determines if value is in a set of valid values, uses deep comparison.
     * @param {*} value
     * @param {Array.<*>} validValues
     * @returns {boolean}
     */ const isValidValue = function(value, validValues) {
            let found = false;
            for(let i = 0; i < validValues.length && !found; i++){
                found = QueryStringMachine.deepEquals(validValues[i], value);
            }
            return found;
        };
        /**
     * Query parameters are specified by the user, and are outside the control of the programmer.
     * So the application should throw an Error if query parameters are invalid.
     * @param {boolean} predicate - if predicate evaluates to false, an Error is thrown
     * @param {string} message
     */ const queryStringMachineAssert = function(predicate, message) {
            if (!predicate) {
                console && console.log && console.log(message);
                throw new Error(`Query String Machine Assertion failed: ${message}`);
            }
        };
        //==================================================================================================================
        /**
     * Data structure that describes each query parameter type, which properties are required vs optional,
     * how to validate, and how to parse.
     *
     * The properties that are required or optional depend on the type (see TYPES), and include:
     * type - {string} the type name
     * defaultValue - the value to use if no query parameter is provided. If there is no defaultValue, then
     *    the query parameter is required in the query string; omitting the query parameter will result in an Error.
     * validValues - array of the valid values for the query parameter
     * isValidValue - function that takes a parsed Object (not string) and checks if it is acceptable
     * elementSchema - specifies the schema for elements in an array
     * separator -  array elements are separated by this string, defaults to `,`
     * parse - a function that takes a string and returns an Object
     */ const TYPES = {
            // NOTE: Types for this are currently in phet-types.d.ts! Changes here should be made there also
            // value is true if present, false if absent
            flag: {
                required: [],
                optional: [
                    'private',
                    'public'
                ],
                validateSchema: null,
                parse: parseFlag,
                isValidValue: (value)=>value === true || value === false,
                defaultValue: true // only needed for flags marks as 'public: true`
            },
            // value is either true or false, e.g. showAnswer=true
            boolean: {
                required: [],
                optional: [
                    'defaultValue',
                    'private',
                    'public'
                ],
                validateSchema: null,
                parse: parseBoolean,
                isValidValue: (value)=>value === true || value === false
            },
            // value is a number, e.g. frameRate=100
            number: {
                required: [],
                optional: [
                    'defaultValue',
                    'validValues',
                    'isValidValue',
                    'private',
                    'public'
                ],
                validateSchema: null,
                parse: parseNumber,
                isValidValue: (value)=>typeof value === 'number' && !isNaN(value)
            },
            // value is a string, e.g. name=Ringo
            string: {
                required: [],
                optional: [
                    'defaultValue',
                    'validValues',
                    'isValidValue',
                    'private',
                    'public'
                ],
                validateSchema: null,
                parse: parseString,
                isValidValue: (value)=>value === null || typeof value === 'string'
            },
            // value is an array, e.g. screens=1,2,3
            array: {
                required: [
                    'elementSchema'
                ],
                optional: [
                    'defaultValue',
                    'validValues',
                    'isValidValue',
                    'separator',
                    'validValues',
                    'private',
                    'public'
                ],
                validateSchema: validateArraySchema,
                parse: parseArray,
                isValidValue: (value)=>Array.isArray(value) || value === null
            },
            // value is a custom data type, e.g. color=255,0,255
            custom: {
                required: [
                    'parse'
                ],
                optional: [
                    'defaultValue',
                    'validValues',
                    'isValidValue',
                    'private',
                    'public'
                ],
                validateSchema: null,
                parse: parseCustom,
                isValidValue: (value)=>{
                    // TODO do we need to add a property to 'custom' schema that handles validation of custom value's type? see https://github.com/phetsims/query-string-machine/issues/35
                    return true;
                }
            }
        };
        return QueryStringMachine;
    }();
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3F1ZXJ5LXN0cmluZy1tYWNoaW5lL2pzL1F1ZXJ5U3RyaW5nTWFjaGluZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBRdWVyeSBTdHJpbmcgcGFyc2VyIHRoYXQgc3VwcG9ydHMgdHlwZSBjb2VyY2lvbiwgZGVmYXVsdHMsIGVycm9yIGNoZWNraW5nLCBldGMuIGJhc2VkIG9uIGEgc2NoZW1hLlxuICogU2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXQgZm9yIHRoZSBkZXNjcmlwdGlvbiBvZiBhIHNjaGVtYS5cbiAqXG4gKiBJbXBsZW1lbnRlZCBhcyBhIFVNRCAoVW5pdmVyc2FsIE1vZHVsZSBEZWZpbml0aW9uKSBzbyB0aGF0IGl0J3MgY2FwYWJsZSBvZiB3b3JraW5nIGV2ZXJ5d2hlcmUuXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3VtZGpzL3VtZC9ibG9iL21hc3Rlci90ZW1wbGF0ZXMvcmV0dXJuRXhwb3J0cy5qc1xuICpcbiAqIFNlZSBUWVBFUyBmb3IgYSBkZXNjcmlwdGlvbiBvZiB0aGUgc2NoZW1hIHR5cGVzIGFuZCB0aGVpciBwcm9wZXJ0aWVzLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG4oIGZ1bmN0aW9uKCByb290LCBmYWN0b3J5ICkge1xuXG4gIGlmICggdHlwZW9mIHdpbmRvdy5kZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgd2luZG93LmRlZmluZS5hbWQgKSB7XG5cbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgd2luZG93LmRlZmluZSggW10sIGZhY3RvcnkgKTtcbiAgfVxuICBlbHNlIHtcblxuICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgcm9vdC5RdWVyeVN0cmluZ01hY2hpbmUgPSBmYWN0b3J5KCk7XG4gIH1cbn0oIHRoaXMsICgpID0+IHtcblxuICAvLyBEZWZhdWx0IHN0cmluZyB0aGF0IHNwbGl0cyBhcnJheSBzdHJpbmdzXG4gIGNvbnN0IERFRkFVTFRfU0VQQVJBVE9SID0gJywnO1xuXG4gIC8vIElmIGEgcXVlcnkgcGFyYW1ldGVyIGhhcyBwcml2YXRlOnRydWUgaW4gaXRzIHNjaGVtYSwgaXQgbXVzdCBwYXNzIHRoaXMgcHJlZGljYXRlIHRvIGJlIHJlYWQgZnJvbSB0aGUgVVJMLlxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzc0M1xuICBjb25zdCBwcml2YXRlUHJlZGljYXRlID0gKCkgPT4ge1xuICAgIC8vIFRyeWluZyB0byBhY2Nlc3MgbG9jYWxTdG9yYWdlIG1heSBmYWlsIHdpdGggYSBTZWN1cml0eUVycm9yIGlmIGNvb2tpZXMgYXJlIGJsb2NrZWQgaW4gYSBjZXJ0YWluIHdheS5cbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3FhL2lzc3Vlcy8zMjkgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSggJ3BoZXRUZWFtTWVtYmVyJyApID09PSAndHJ1ZSc7XG4gICAgfVxuICAgIGNhdGNoKCBlICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogVmFsaWQgcGFyYW1ldGVyIHN0cmluZ3MgYmVnaW4gd2l0aCA/IG9yIGFyZSB0aGUgZW1wdHkgc3RyaW5nLiAgVGhpcyBpcyB1c2VkIGZvciBhc3NlcnRpb25zIGluIHNvbWUgY2FzZXMgYW5kIGZvclxuICAgKiB0aHJvd2luZyBFcnJvcnMgaW4gb3RoZXIgY2FzZXMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmdcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBjb25zdCBpc1BhcmFtZXRlclN0cmluZyA9IHN0cmluZyA9PiBzdHJpbmcubGVuZ3RoID09PSAwIHx8IHN0cmluZy5pbmRleE9mKCAnPycgKSA9PT0gMDtcblxuICAvLyBKdXN0IHJldHVybiBhIHZhbHVlIHRvIGRlZmluZSB0aGUgbW9kdWxlIGV4cG9ydC5cbiAgLy8gVGhpcyBleGFtcGxlIHJldHVybnMgYW4gb2JqZWN0LCBidXQgdGhlIG1vZHVsZVxuICAvLyBjYW4gcmV0dXJuIGEgZnVuY3Rpb24gYXMgdGhlIGV4cG9ydGVkIHZhbHVlLlxuICByZXR1cm4gKCBmdW5jdGlvbigpIHtcblxuICAgIC8qKlxuICAgICAqIEluIG9yZGVyIHRvIHN1cHBvcnQgZ3JhY2VmdWwgZmFpbHVyZXMgZm9yIHVzZXItc3VwcGxpZWQgdmFsdWVzLCB3ZSBmYWxsIGJhY2sgdG8gZGVmYXVsdCB2YWx1ZXMgd2hlbiBwdWJsaWM6IHRydWVcbiAgICAgKiBpcyBzcGVjaWZpZWQuICBJZiB0aGUgc2NoZW1hIGVudHJ5IGlzIHB1YmxpYzogZmFsc2UsIHRoZW4gYSBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQgaXMgdGhyb3duLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gcHJlZGljYXRlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZSAtIHZhbHVlIG9mIHRoZSBwYXJzZWQgdHlwZSwgb3IsIGlmIHBhcnNpbmcgZmFpbGVkLCB0aGUge3N0cmluZ30gdGhhdCB3b3VsZCBub3QgcGFyc2VcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc2NoZW1hXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICAqL1xuICAgIGNvbnN0IGdldFZhbGlkVmFsdWUgPSAoIHByZWRpY2F0ZSwga2V5LCB2YWx1ZSwgc2NoZW1hLCBtZXNzYWdlICkgPT4ge1xuICAgICAgaWYgKCAhcHJlZGljYXRlICkge1xuXG4gICAgICAgIGlmICggc2NoZW1hLnB1YmxpYyApIHtcbiAgICAgICAgICBRdWVyeVN0cmluZ01hY2hpbmUuYWRkV2FybmluZygga2V5LCB2YWx1ZSwgbWVzc2FnZSApO1xuICAgICAgICAgIGlmICggc2NoZW1hLmhhc093blByb3BlcnR5KCAnZGVmYXVsdFZhbHVlJyApICkge1xuICAgICAgICAgICAgdmFsdWUgPSBzY2hlbWEuZGVmYXVsdFZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHR5cGVTY2hlbWEgPSBUWVBFU1sgc2NoZW1hLnR5cGUgXTtcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggdHlwZVNjaGVtYS5oYXNPd25Qcm9wZXJ0eSggJ2RlZmF1bHRWYWx1ZScgKSxcbiAgICAgICAgICAgICAgJ1R5cGUgbXVzdCBoYXZlIGEgZGVmYXVsdCB2YWx1ZSBpZiB0aGUgcHJvdmlkZWQgc2NoZW1hIGRvZXMgbm90IGhhdmUgb25lLicgKTtcbiAgICAgICAgICAgIHZhbHVlID0gdHlwZVNjaGVtYS5kZWZhdWx0VmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggcHJlZGljYXRlLCBtZXNzYWdlICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUXVlcnkgU3RyaW5nIE1hY2hpbmUgaXMgYSBxdWVyeSBzdHJpbmcgcGFyc2VyIHRoYXQgc3VwcG9ydHMgdHlwZSBjb2VyY2lvbiwgZGVmYXVsdCB2YWx1ZXMgJiB2YWxpZGF0aW9uLiBQbGVhc2VcbiAgICAgKiB2aXNpdCBQaEVUJ3MgPGEgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xdWVyeS1zdHJpbmctbWFjaGluZVwiIHRhcmdldD1cIl9ibGFua1wiPnF1ZXJ5LXN0cmluZy1tYWNoaW5lPC9hPlxuICAgICAqIHJlcG9zaXRvcnkgZm9yIGRvY3VtZW50YXRpb24gYW5kIGV4YW1wbGVzLlxuICAgICAqL1xuICAgIGNvbnN0IFF1ZXJ5U3RyaW5nTWFjaGluZSA9IHtcblxuICAgICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7e2tleTpzdHJpbmcsIHZhbHVlOnsqfSwgbWVzc2FnZTpzdHJpbmd9W119IC0gY2xlYXJlZCBieSBzb21lIHRlc3RzIGluIFF1ZXJ5U3RyaW5nTWFjaGluZVRlc3RzLmpzXG4gICAgICAvLyBTZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmFkZFdhcm5pbmcgZm9yIGEgZGVzY3JpcHRpb24gb2YgdGhlc2UgZmllbGRzLCBhbmQgdG8gYWRkIHdhcm5pbmdzLlxuICAgICAgd2FybmluZ3M6IFtdLFxuXG4gICAgICAvKipcbiAgICAgICAqIEdldHMgdGhlIHZhbHVlIGZvciBhIHNpbmdsZSBxdWVyeSBwYXJhbWV0ZXIuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIgbmFtZVxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IHNjaGVtYVxuICAgICAgICogQHJldHVybnMgeyp9IHF1ZXJ5IHBhcmFtZXRlciB2YWx1ZSwgY29udmVydGVkIHRvIHRoZSBwcm9wZXIgdHlwZVxuICAgICAgICogQHB1YmxpY1xuICAgICAgICovXG4gICAgICBnZXQ6IGZ1bmN0aW9uKCBrZXksIHNjaGVtYSApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Rm9yU3RyaW5nKCBrZXksIHNjaGVtYSwgd2luZG93LmxvY2F0aW9uLnNlYXJjaCApO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBHZXRzIHZhbHVlcyBmb3IgZXZlcnkgcXVlcnkgcGFyYW1ldGVyLCB1c2luZyB0aGUgc3BlY2lmaWVkIHNjaGVtYSBtYXAuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IHNjaGVtYU1hcCAtIHNlZSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0QWxsRm9yU3RyaW5nXG4gICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSAtIHNlZSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0QWxsRm9yU3RyaW5nXG4gICAgICAgKiBAcHVibGljXG4gICAgICAgKi9cbiAgICAgIGdldEFsbDogZnVuY3Rpb24oIHNjaGVtYU1hcCApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QWxsRm9yU3RyaW5nKCBzY2hlbWFNYXAsIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogTGlrZSBgZ2V0YCBidXQgZm9yIGFuIGFyYml0cmFyeSBwYXJhbWV0ZXIgc3RyaW5nLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgLSB0aGUgcXVlcnkgcGFyYW1ldGVyIG5hbWVcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzY2hlbWEgLSBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldFxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyAtIHRoZSBwYXJhbWV0ZXJzIHN0cmluZy4gIE11c3QgYmVnaW4gd2l0aCAnPycgb3IgYmUgdGhlIGVtcHR5IHN0cmluZ1xuICAgICAgICogQHJldHVybnMgeyp9IHF1ZXJ5IHBhcmFtZXRlciB2YWx1ZSwgY29udmVydGVkIHRvIHRoZSBwcm9wZXIgdHlwZVxuICAgICAgICogQHB1YmxpY1xuICAgICAgICovXG4gICAgICBnZXRGb3JTdHJpbmc6IGZ1bmN0aW9uKCBrZXksIHNjaGVtYSwgc3RyaW5nICkge1xuXG4gICAgICAgIGlmICggIWlzUGFyYW1ldGVyU3RyaW5nKCBzdHJpbmcgKSApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBRdWVyeSBzdHJpbmdzIHNob3VsZCBiZSBlaXRoZXIgdGhlIGVtcHR5IHN0cmluZyBvciBzdGFydCB3aXRoIGEgXCI/XCI6ICR7c3RyaW5nfWAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElnbm9yZSBVUkwgdmFsdWVzIGZvciBwcml2YXRlIHF1ZXJ5IHBhcmFtZXRlcnMgdGhhdCBmYWlsIHByaXZhdGVQcmVkaWNhdGUuXG4gICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvNzQzLlxuICAgICAgICBjb25zdCB2YWx1ZXMgPSAoIHNjaGVtYS5wcml2YXRlICYmICFwcml2YXRlUHJlZGljYXRlKCkgKSA/IFtdIDogZ2V0VmFsdWVzKCBrZXksIHN0cmluZyApO1xuXG4gICAgICAgIHZhbGlkYXRlU2NoZW1hKCBrZXksIHNjaGVtYSApO1xuXG4gICAgICAgIGxldCB2YWx1ZSA9IHBhcnNlVmFsdWVzKCBrZXksIHNjaGVtYSwgdmFsdWVzICk7XG5cbiAgICAgICAgaWYgKCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICd2YWxpZFZhbHVlcycgKSApIHtcbiAgICAgICAgICB2YWx1ZSA9IGdldFZhbGlkVmFsdWUoIGlzVmFsaWRWYWx1ZSggdmFsdWUsIHNjaGVtYS52YWxpZFZhbHVlcyApLCBrZXksIHZhbHVlLCBzY2hlbWEsXG4gICAgICAgICAgICBgSW52YWxpZCB2YWx1ZSBzdXBwbGllZCBmb3Iga2V5IFwiJHtrZXl9XCI6ICR7dmFsdWV9IGlzIG5vdCBhIG1lbWJlciBvZiB2YWxpZCB2YWx1ZXM6ICR7c2NoZW1hLnZhbGlkVmFsdWVzLmpvaW4oICcsICcgKX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlzVmFsaWRWYWx1ZSBldmFsdWF0ZXMgdG8gdHJ1ZVxuICAgICAgICBlbHNlIGlmICggc2NoZW1hLmhhc093blByb3BlcnR5KCAnaXNWYWxpZFZhbHVlJyApICkge1xuICAgICAgICAgIHZhbHVlID0gZ2V0VmFsaWRWYWx1ZSggc2NoZW1hLmlzVmFsaWRWYWx1ZSggdmFsdWUgKSwga2V5LCB2YWx1ZSwgc2NoZW1hLFxuICAgICAgICAgICAgYEludmFsaWQgdmFsdWUgc3VwcGxpZWQgZm9yIGtleSBcIiR7a2V5fVwiOiAke3ZhbHVlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHZhbHVlVmFsaWQgPSBUWVBFU1sgc2NoZW1hLnR5cGUgXS5pc1ZhbGlkVmFsdWUoIHZhbHVlICk7XG5cbiAgICAgICAgLy8gc3VwcG9ydCBjdXN0b20gdmFsaWRhdGlvbiBmb3IgZWxlbWVudFNjaGVtYSBmb3IgYXJyYXlzXG4gICAgICAgIGlmICggc2NoZW1hLnR5cGUgPT09ICdhcnJheScgJiYgQXJyYXkuaXNBcnJheSggdmFsdWUgKSApIHtcbiAgICAgICAgICBsZXQgZWxlbWVudHNWYWxpZCA9IHRydWU7XG4gICAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gdmFsdWVbIGkgXTtcbiAgICAgICAgICAgIGlmICggIVRZUEVTWyBzY2hlbWEuZWxlbWVudFNjaGVtYS50eXBlIF0uaXNWYWxpZFZhbHVlKCBlbGVtZW50ICkgKSB7XG4gICAgICAgICAgICAgIGVsZW1lbnRzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIHNjaGVtYS5lbGVtZW50U2NoZW1hLmhhc093blByb3BlcnR5KCAnaXNWYWxpZFZhbHVlJyApICYmICFzY2hlbWEuZWxlbWVudFNjaGVtYS5pc1ZhbGlkVmFsdWUoIGVsZW1lbnQgKSApIHtcbiAgICAgICAgICAgICAgZWxlbWVudHNWYWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICggc2NoZW1hLmVsZW1lbnRTY2hlbWEuaGFzT3duUHJvcGVydHkoICd2YWxpZFZhbHVlcycgKSAmJiAhaXNWYWxpZFZhbHVlKCBlbGVtZW50LCBzY2hlbWEuZWxlbWVudFNjaGVtYS52YWxpZFZhbHVlcyApICkge1xuICAgICAgICAgICAgICBlbGVtZW50c1ZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZVZhbGlkID0gdmFsdWVWYWxpZCAmJiBlbGVtZW50c1ZhbGlkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZGlzcGF0Y2ggZnVydGhlciB2YWxpZGF0aW9uIHRvIGEgdHlwZS1zcGVjaWZpYyBmdW5jdGlvblxuICAgICAgICB2YWx1ZSA9IGdldFZhbGlkVmFsdWUoIHZhbHVlVmFsaWQsIGtleSwgdmFsdWUsIHNjaGVtYSwgYEludmFsaWQgdmFsdWUgZm9yIHR5cGUsIGtleTogJHtrZXl9YCApO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIExpa2UgYGdldEFsbGAgYnV0IGZvciBhbiBhcmJpdHJhcnkgcGFyYW1ldGVycyBzdHJpbmcuXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gc2NoZW1hTWFwIC0ga2V5L3ZhbHVlIHBhaXJzLCBrZXkgaXMgcXVlcnkgcGFyYW1ldGVyIG5hbWUgYW5kIHZhbHVlIGlzIGEgc2NoZW1hXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIC0gdGhlIHBhcmFtZXRlcnMgc3RyaW5nXG4gICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSAtIGtleS92YWx1ZSBwYWlycyBob2xkaW5nIHRoZSBwYXJzZWQgcmVzdWx0c1xuICAgICAgICogQHB1YmxpY1xuICAgICAgICovXG4gICAgICBnZXRBbGxGb3JTdHJpbmc6IGZ1bmN0aW9uKCBzY2hlbWFNYXAsIHN0cmluZyApIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgICAgIGZvciAoIGNvbnN0IGtleSBpbiBzY2hlbWFNYXAgKSB7XG4gICAgICAgICAgaWYgKCBzY2hlbWFNYXAuaGFzT3duUHJvcGVydHkoIGtleSApICkge1xuICAgICAgICAgICAgcmVzdWx0WyBrZXkgXSA9IHRoaXMuZ2V0Rm9yU3RyaW5nKCBrZXksIHNjaGVtYU1hcFsga2V5IF0sIHN0cmluZyApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggY29udGFpbnMgdGhlIGdpdmVuIGtleVxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggY29udGFpbnMgdGhlIGdpdmVuIGtleVxuICAgICAgICogQHB1YmxpY1xuICAgICAgICovXG4gICAgICBjb250YWluc0tleTogZnVuY3Rpb24oIGtleSApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbnNLZXlGb3JTdHJpbmcoIGtleSwgd2luZG93LmxvY2F0aW9uLnNlYXJjaCApO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIHN0cmluZyBjb250YWlucyB0aGUgc3BlY2lmaWVkIGtleVxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSAtIHRoZSBrZXkgdG8gY2hlY2sgZm9yXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIC0gdGhlIHF1ZXJ5IHN0cmluZyB0byBzZWFyY2guIE11c3QgYmVnaW4gd2l0aCAnPycgb3IgYmUgdGhlIGVtcHR5IHN0cmluZ1xuICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIGdpdmVuIHN0cmluZyBjb250YWlucyB0aGUgZ2l2ZW4ga2V5XG4gICAgICAgKiBAcHVibGljXG4gICAgICAgKi9cbiAgICAgIGNvbnRhaW5zS2V5Rm9yU3RyaW5nOiBmdW5jdGlvbigga2V5LCBzdHJpbmcgKSB7XG4gICAgICAgIGlmICggIWlzUGFyYW1ldGVyU3RyaW5nKCBzdHJpbmcgKSApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBRdWVyeSBzdHJpbmdzIHNob3VsZCBiZSBlaXRoZXIgdGhlIGVtcHR5IHN0cmluZyBvciBzdGFydCB3aXRoIGEgXCI/XCI6ICR7c3RyaW5nfWAgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2YWx1ZXMgPSBnZXRWYWx1ZXMoIGtleSwgc3RyaW5nICk7XG4gICAgICAgIHJldHVybiB2YWx1ZXMubGVuZ3RoID4gMDtcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBvYmplY3RzIGFyZSBlcXVhbC4gIEV4cG9ydGVkIG9uIHRoZSBRdWVyeVN0cmluZ01hY2hpbmUgZm9yIHRlc3RpbmcuICBPbmx5IHdvcmtzIGZvclxuICAgICAgICogYXJyYXlzIG9iamVjdHMgdGhhdCBjb250YWluIHByaW1pdGl2ZXMgKGkuZS4gdGVybWluYWxzIGFyZSBjb21wYXJlZCB3aXRoID09PSlcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhIC0gYW4gb2JqZWN0IHRvIGNvbXBhcmVcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBiIC0gYW4gb2JqZWN0IHRvIGNvbXBhcmVcbiAgICAgICAqIEBwcml2YXRlIC0gaG93ZXZlciwgaXQgaXMgY2FsbGVkIGZyb20gUXVlcnlTdHJpbmdNYWNoaW5lVGVzdHNcbiAgICAgICAqL1xuICAgICAgZGVlcEVxdWFsczogZnVuY3Rpb24oIGEsIGIgKSB7XG4gICAgICAgIGlmICggdHlwZW9mIGEgIT09IHR5cGVvZiBiICkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIHR5cGVvZiBhID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgYSA9PT0gJ251bWJlcicgfHwgdHlwZW9mIGEgPT09ICdib29sZWFuJyApIHtcbiAgICAgICAgICByZXR1cm4gYSA9PT0gYjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIGEgPT09IG51bGwgJiYgYiA9PT0gbnVsbCApIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIGEgPT09IHVuZGVmaW5lZCAmJiBiID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCBhID09PSBudWxsICYmIGIgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCBhID09PSB1bmRlZmluZWQgJiYgYiA9PT0gbnVsbCApIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYUtleXMgPSBPYmplY3Qua2V5cyggYSApO1xuICAgICAgICBjb25zdCBiS2V5cyA9IE9iamVjdC5rZXlzKCBiICk7XG4gICAgICAgIGlmICggYUtleXMubGVuZ3RoICE9PSBiS2V5cy5sZW5ndGggKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCBhS2V5cy5sZW5ndGggPT09IDAgKSB7XG4gICAgICAgICAgcmV0dXJuIGEgPT09IGI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYUtleXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICBpZiAoIGFLZXlzWyBpIF0gIT09IGJLZXlzWyBpIF0gKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGFDaGlsZCA9IGFbIGFLZXlzWyBpIF0gXTtcbiAgICAgICAgICAgIGNvbnN0IGJDaGlsZCA9IGJbIGFLZXlzWyBpIF0gXTtcbiAgICAgICAgICAgIGlmICggIVF1ZXJ5U3RyaW5nTWFjaGluZS5kZWVwRXF1YWxzKCBhQ2hpbGQsIGJDaGlsZCApICkge1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIFJldHVybnMgYSBuZXcgVVJMIGJ1dCB3aXRob3V0IHRoZSBrZXktdmFsdWUgcGFpci5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcXVlcnlTdHJpbmcgLSB0YWlsIG9mIGEgVVJMIGluY2x1ZGluZyB0aGUgYmVnaW5uaW5nICc/JyAoaWYgYW55KVxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICAgICAgICogQHB1YmxpY1xuICAgICAgICovXG4gICAgICByZW1vdmVLZXlWYWx1ZVBhaXI6IGZ1bmN0aW9uKCBxdWVyeVN0cmluZywga2V5ICkge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgcXVlcnlTdHJpbmcgPT09ICdzdHJpbmcnLCBgdXJsIHNob3VsZCBiZSBzdHJpbmcsIGJ1dCBpdCB3YXM6ICR7dHlwZW9mIHF1ZXJ5U3RyaW5nfWAgKTtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGtleSA9PT0gJ3N0cmluZycsIGB1cmwgc2hvdWxkIGJlIHN0cmluZywgYnV0IGl0IHdhczogJHt0eXBlb2Yga2V5fWAgKTtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaXNQYXJhbWV0ZXJTdHJpbmcoIHF1ZXJ5U3RyaW5nICksICdxdWVyeVN0cmluZyBzaG91bGQgYmUgbGVuZ3RoIDAgb3IgYmVnaW4gd2l0aCA/JyApO1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBrZXkubGVuZ3RoID4gMCwgJ3VybCBzaG91bGQgYmUgYSBzdHJpbmcgd2l0aCBsZW5ndGggPiAwJyApO1xuXG4gICAgICAgIGlmICggcXVlcnlTdHJpbmcuaW5kZXhPZiggJz8nICkgPT09IDAgKSB7XG4gICAgICAgICAgY29uc3QgbmV3UGFyYW1ldGVycyA9IFtdO1xuICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0gcXVlcnlTdHJpbmcuc3Vic3RyaW5nKCAxICk7XG4gICAgICAgICAgY29uc3QgZWxlbWVudHMgPSBxdWVyeS5zcGxpdCggJyYnICk7XG4gICAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZWxlbWVudHNbIGkgXTtcbiAgICAgICAgICAgIGNvbnN0IGtleUFuZE1heWJlVmFsdWUgPSBlbGVtZW50LnNwbGl0KCAnPScgKTtcblxuICAgICAgICAgICAgY29uc3QgZWxlbWVudEtleSA9IGRlY29kZVVSSUNvbXBvbmVudCgga2V5QW5kTWF5YmVWYWx1ZVsgMCBdICk7XG4gICAgICAgICAgICBpZiAoIGVsZW1lbnRLZXkgIT09IGtleSApIHtcbiAgICAgICAgICAgICAgbmV3UGFyYW1ldGVycy5wdXNoKCBlbGVtZW50ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCBuZXdQYXJhbWV0ZXJzLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgICAgICByZXR1cm4gYD8ke25ld1BhcmFtZXRlcnMuam9pbiggJyYnICl9YDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHJldHVybiBxdWVyeVN0cmluZztcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBSZW1vdmUgYWxsIHRoZSBrZXlzIGZyb20gdGhlIHF1ZXJ5U3RyaW5nIChvayBpZiB0aGV5IGRvIG5vdCBhcHBlYXIgYXQgYWxsKVxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHF1ZXJ5U3RyaW5nXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBrZXlzXG4gICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAgICogQHB1YmxpY1xuICAgICAgICovXG4gICAgICByZW1vdmVLZXlWYWx1ZVBhaXJzOiBmdW5jdGlvbiggcXVlcnlTdHJpbmcsIGtleXMgKSB7XG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgcXVlcnlTdHJpbmcgPSB0aGlzLnJlbW92ZUtleVZhbHVlUGFpciggcXVlcnlTdHJpbmcsIGtleXNbIGkgXSApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBxdWVyeVN0cmluZztcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogQXBwZW5kcyBhIHF1ZXJ5IHN0cmluZyB0byBhIGdpdmVuIHVybC5cbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgLSBtYXkgb3IgbWF5IG5vdCBhbHJlYWR5IGhhdmUgb3RoZXIgcXVlcnkgcGFyYW1ldGVyc1xuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHF1ZXJ5UGFyYW1ldGVycyAtIG1heSBzdGFydCB3aXRoICcnLCAnPycgb3IgJyYnXG4gICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAgICogQHB1YmxpY1xuICAgICAgICogQHN0YXRpY1xuICAgICAgICpcbiAgICAgICAqIEBleGFtcGxlXG4gICAgICAgKiAvLyBMaW1pdCB0byB0aGUgc2Vjb25kIHNjcmVlblxuICAgICAgICogc2ltVVJMID0gUXVlcnlTdHJpbmdNYWNoaW5lLmFwcGVuZFF1ZXJ5U3RyaW5nKCBzaW1VUkwsICdzY3JlZW5zPTInICk7XG4gICAgICAgKi9cbiAgICAgIGFwcGVuZFF1ZXJ5U3RyaW5nOiBmdW5jdGlvbiggdXJsLCBxdWVyeVBhcmFtZXRlcnMgKSB7XG4gICAgICAgIGlmICggcXVlcnlQYXJhbWV0ZXJzLmluZGV4T2YoICc/JyApID09PSAwIHx8IHF1ZXJ5UGFyYW1ldGVycy5pbmRleE9mKCAnJicgKSA9PT0gMCApIHtcbiAgICAgICAgICBxdWVyeVBhcmFtZXRlcnMgPSBxdWVyeVBhcmFtZXRlcnMuc3Vic3RyaW5nKCAxICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCBxdWVyeVBhcmFtZXRlcnMubGVuZ3RoID09PSAwICkge1xuICAgICAgICAgIHJldHVybiB1cmw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY29tYmluYXRpb24gPSB1cmwuaW5kZXhPZiggJz8nICkgPj0gMCA/ICcmJyA6ICc/JztcbiAgICAgICAgcmV0dXJuIHVybCArIGNvbWJpbmF0aW9uICsgcXVlcnlQYXJhbWV0ZXJzO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBIZWxwZXIgZnVuY3Rpb24gZm9yIG11bHRpcGxlIHF1ZXJ5IHN0cmluZ3NcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgLSBtYXkgb3IgbWF5IG5vdCBhbHJlYWR5IGhhdmUgb3RoZXIgcXVlcnkgcGFyYW1ldGVyc1xuICAgICAgICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gcXVlcnlTdHJpbmdBcnJheSAtIGVhY2ggaXRlbSBtYXkgc3RhcnQgd2l0aCAnJywgJz8nLCBvciAnJidcbiAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICAgKiBAcHVibGljXG4gICAgICAgKiBAc3RhdGljXG4gICAgICAgKlxuICAgICAgICogQGV4YW1wbGVcbiAgICAgICAqIHNvdXJjZUZyYW1lLnNyYyA9IFF1ZXJ5U3RyaW5nTWFjaGluZS5hcHBlbmRRdWVyeVN0cmluZ0FycmF5KCBzaW1VUkwsIFsgJ3NjcmVlbnM9MicsICdmcmFtZVRpdGxlPXNvdXJjZScgXSApO1xuICAgICAgICovXG4gICAgICBhcHBlbmRRdWVyeVN0cmluZ0FycmF5OiBmdW5jdGlvbiggdXJsLCBxdWVyeVN0cmluZ0FycmF5ICkge1xuXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHF1ZXJ5U3RyaW5nQXJyYXkubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgdXJsID0gdGhpcy5hcHBlbmRRdWVyeVN0cmluZyggdXJsLCBxdWVyeVN0cmluZ0FycmF5WyBpIF0gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdXJsO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBSZXR1cm5zIHRoZSBxdWVyeSBzdHJpbmcgYXQgdGhlIGVuZCBvZiBhIHVybCwgb3IgJz8nIGlmIHRoZXJlIGlzIG5vbmUuXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAgICogQHB1YmxpY1xuICAgICAgICovXG4gICAgICBnZXRRdWVyeVN0cmluZzogZnVuY3Rpb24oIHVybCApIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB1cmwuaW5kZXhPZiggJz8nICk7XG5cbiAgICAgICAgaWYgKCBpbmRleCA+PSAwICkge1xuICAgICAgICAgIHJldHVybiB1cmwuc3Vic3RyaW5nKCBpbmRleCApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHJldHVybiAnPyc7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogQWRkcyBhIHdhcm5pbmcgdG8gdGhlIGNvbnNvbGUgYW5kIFF1ZXJ5U3RyaW5nTWFjaGluZS53YXJuaW5ncyB0byBpbmRpY2F0ZSB0aGF0IHRoZSBwcm92aWRlZCBpbnZhbGlkIHZhbHVlIHdpbGxcbiAgICAgICAqIG5vdCBiZSB1c2VkLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgLSB0aGUgcXVlcnkgcGFyYW1ldGVyIG5hbWVcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZSAtIHR5cGUgZGVwZW5kcyBvbiBzY2hlbWEgdHlwZVxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSB0aGUgbWVzc2FnZSB0aGF0IGluZGljYXRlcyB0aGUgcHJvYmxlbSB3aXRoIHRoZSB2YWx1ZVxuICAgICAgICogQHB1YmxpY1xuICAgICAgICovXG4gICAgICBhZGRXYXJuaW5nOiBmdW5jdGlvbigga2V5LCB2YWx1ZSwgbWVzc2FnZSApIHtcblxuICAgICAgICBsZXQgaXNEdXBsaWNhdGUgPSBmYWxzZTtcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy53YXJuaW5ncy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICBjb25zdCB3YXJuaW5nID0gdGhpcy53YXJuaW5nc1sgaSBdO1xuICAgICAgICAgIGlmICgga2V5ID09PSB3YXJuaW5nLmtleSAmJiB2YWx1ZSA9PT0gd2FybmluZy52YWx1ZSAmJiBtZXNzYWdlID09PSB3YXJuaW5nLm1lc3NhZ2UgKSB7XG4gICAgICAgICAgICBpc0R1cGxpY2F0ZSA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCAhaXNEdXBsaWNhdGUgKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCBtZXNzYWdlICk7XG5cbiAgICAgICAgICB0aGlzLndhcm5pbmdzLnB1c2goIHtcbiAgICAgICAgICAgIGtleToga2V5LFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZVxuICAgICAgICAgIH0gKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBEZXRlcm1pbmVzIGlmIHRoZXJlIGlzIGEgd2FybmluZyBmb3IgYSBzcGVjaWZpZWQga2V5LlxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICAgKiBAcHVibGljXG4gICAgICAgKi9cbiAgICAgIGhhc1dhcm5pbmc6IGZ1bmN0aW9uKCBrZXkgKSB7XG4gICAgICAgIGxldCBoYXNXYXJuaW5nID0gZmFsc2U7XG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMud2FybmluZ3MubGVuZ3RoICYmICFoYXNXYXJuaW5nOyBpKysgKSB7XG4gICAgICAgICAgaGFzV2FybmluZyA9ICggdGhpcy53YXJuaW5nc1sgaSBdLmtleSA9PT0ga2V5ICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhhc1dhcm5pbmc7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBxdWVyeVN0cmluZyAtIHRhaWwgb2YgYSBVUkwgaW5jbHVkaW5nIHRoZSBiZWdpbm5pbmcgJz8nIChpZiBhbnkpXG4gICAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IC0gdGhlIHNwbGl0IHVwIHN0aWxsLVVSSS1lbmNvZGVkIHBhcmFtZXRlcnMgKHdpdGggdmFsdWVzIGlmIHByZXNlbnQpXG4gICAgICAgKiBAcHVibGljXG4gICAgICAgKi9cbiAgICAgIGdldFF1ZXJ5UGFyYW1ldGVyc0Zyb21TdHJpbmc6IGZ1bmN0aW9uKCBxdWVyeVN0cmluZyApIHtcbiAgICAgICAgaWYgKCBxdWVyeVN0cmluZy5pbmRleE9mKCAnPycgKSA9PT0gMCApIHtcbiAgICAgICAgICBjb25zdCBxdWVyeSA9IHF1ZXJ5U3RyaW5nLnN1YnN0cmluZyggMSApO1xuICAgICAgICAgIHJldHVybiBxdWVyeS5zcGxpdCggJyYnICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBrZXkgdG8gcmV0dXJuIGlmIHByZXNlbnRcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgLSBhIFVSTCBpbmNsdWRpbmcgYSBcIj9cIiBpZiBpdCBoYXMgYSBxdWVyeSBzdHJpbmdcbiAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd8bnVsbH0gLSB0aGUgcXVlcnkgcGFyYW1ldGVyIGFzIGl0IGFwcGVhcnMgaW4gdGhlIFVSTCwgbGlrZSBga2V5PVZBTFVFYCwgb3IgbnVsbCBpZiBub3QgcHJlc2VudFxuICAgICAgICogQHB1YmxpY1xuICAgICAgICovXG4gICAgICBnZXRTaW5nbGVRdWVyeVBhcmFtZXRlclN0cmluZzogZnVuY3Rpb24oIGtleSwgc3RyaW5nICkge1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHRoaXMuZ2V0UXVlcnlTdHJpbmcoIHN0cmluZyApO1xuICAgICAgICBjb25zdCBxdWVyeVBhcmFtZXRlcnMgPSB0aGlzLmdldFF1ZXJ5UGFyYW1ldGVyc0Zyb21TdHJpbmcoIHF1ZXJ5U3RyaW5nICk7XG5cbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcXVlcnlQYXJhbWV0ZXJzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgIGNvbnN0IHF1ZXJ5UGFyYW1ldGVyID0gcXVlcnlQYXJhbWV0ZXJzWyBpIF07XG4gICAgICAgICAgY29uc3Qga2V5QW5kTWF5YmVWYWx1ZSA9IHF1ZXJ5UGFyYW1ldGVyLnNwbGl0KCAnPScgKTtcblxuICAgICAgICAgIGlmICggZGVjb2RlVVJJQ29tcG9uZW50KCBrZXlBbmRNYXliZVZhbHVlWyAwIF0gKSA9PT0ga2V5ICkge1xuICAgICAgICAgICAgcmV0dXJuIHF1ZXJ5UGFyYW1ldGVyO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBRdWVyeSBzdHJpbmdzIG1heSBzaG93IHRoZSBzYW1lIGtleSBhcHBlYXJpbmcgbXVsdGlwbGUgdGltZXMsIHN1Y2ggYXMgP3ZhbHVlPTImdmFsdWU9My5cbiAgICAgKiBUaGlzIG1ldGhvZCByZWNvdmVycyBhbGwgb2YgdGhlIHN0cmluZyB2YWx1ZXMuICBGb3IgdGhpcyBleGFtcGxlLCBpdCB3b3VsZCBiZSBbJzInLCczJ10uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IC0gdGhlIGtleSBmb3Igd2hpY2ggd2UgYXJlIGZpbmRpbmcgdmFsdWVzLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgLSB0aGUgcGFyYW1ldGVycyBzdHJpbmdcbiAgICAgKiBAcmV0dXJucyB7QXJyYXkuPHN0cmluZ3xudWxsPn0gLSB0aGUgcmVzdWx0aW5nIHZhbHVlcywgbnVsbCBpbmRpY2F0ZXMgdGhlIHF1ZXJ5IHBhcmFtZXRlciBpcyBwcmVzZW50IHdpdGggbm8gdmFsdWVcbiAgICAgKi9cbiAgICBjb25zdCBnZXRWYWx1ZXMgPSBmdW5jdGlvbigga2V5LCBzdHJpbmcgKSB7XG4gICAgICBjb25zdCB2YWx1ZXMgPSBbXTtcbiAgICAgIGNvbnN0IHBhcmFtcyA9IHN0cmluZy5zbGljZSggMSApLnNwbGl0KCAnJicgKTtcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHBhcmFtcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgY29uc3Qgc3BsaXRCeUVxdWFscyA9IHBhcmFtc1sgaSBdLnNwbGl0KCAnPScgKTtcbiAgICAgICAgY29uc3QgbmFtZSA9IHNwbGl0QnlFcXVhbHNbIDAgXTtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBzcGxpdEJ5RXF1YWxzLnNsaWNlKCAxICkuam9pbiggJz0nICk7IC8vIFN1cHBvcnQgYXJiaXRyYXJ5IG51bWJlciBvZiAnPScgaW4gdGhlIHZhbHVlXG4gICAgICAgIGlmICggbmFtZSA9PT0ga2V5ICkge1xuICAgICAgICAgIGlmICggdmFsdWUgKSB7XG4gICAgICAgICAgICB2YWx1ZXMucHVzaCggZGVjb2RlVVJJQ29tcG9uZW50KCB2YWx1ZSApICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFsdWVzLnB1c2goIG51bGwgKTsgLy8gbm8gdmFsdWUgcHJvdmlkZWRcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgfTtcblxuICAgIC8vIFNjaGVtYSB2YWxpZGF0aW9uID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvKipcbiAgICAgKiBWYWxpZGF0ZXMgdGhlIHNjaGVtYSBmb3IgYSBxdWVyeSBwYXJhbWV0ZXIuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIgbmFtZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzY2hlbWEgLSBzY2hlbWEgdGhhdCBkZXNjcmliZXMgdGhlIHF1ZXJ5IHBhcmFtZXRlciwgc2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRcbiAgICAgKi9cbiAgICBjb25zdCB2YWxpZGF0ZVNjaGVtYSA9IGZ1bmN0aW9uKCBrZXksIHNjaGVtYSApIHtcblxuICAgICAgLy8gdHlwZSBpcyByZXF1aXJlZFxuICAgICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICd0eXBlJyApLCBgdHlwZSBmaWVsZCBpcyByZXF1aXJlZCBmb3Iga2V5OiAke2tleX1gICk7XG5cbiAgICAgIC8vIHR5cGUgaXMgdmFsaWRcbiAgICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggVFlQRVMuaGFzT3duUHJvcGVydHkoIHNjaGVtYS50eXBlICksIGBpbnZhbGlkIHR5cGU6ICR7c2NoZW1hLnR5cGV9IGZvciBrZXk6ICR7a2V5fWAgKTtcblxuICAgICAgLy8gcGFyc2UgaXMgYSBmdW5jdGlvblxuICAgICAgaWYgKCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICdwYXJzZScgKSApIHtcbiAgICAgICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCB0eXBlb2Ygc2NoZW1hLnBhcnNlID09PSAnZnVuY3Rpb24nLCBgcGFyc2UgbXVzdCBiZSBhIGZ1bmN0aW9uIGZvciBrZXk6ICR7a2V5fWAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gdmFsaWRWYWx1ZXMgYW5kIGlzVmFsaWRWYWx1ZSBhcmUgb3B0aW9uYWwgYW5kIG11dHVhbGx5IGV4Y2x1c2l2ZVxuICAgICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCAhKCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICd2YWxpZFZhbHVlcycgKSAmJiBzY2hlbWEuaGFzT3duUHJvcGVydHkoICdpc1ZhbGlkVmFsdWUnICkgKSxcbiAgICAgICAgc2NoZW1hLCBrZXksIGB2YWxpZFZhbHVlcyBhbmQgaXNWYWxpZFZhbHVlIGFyZSBtdXR1YWxseSBleGNsdXNpdmUgZm9yIGtleTogJHtrZXl9YCApO1xuXG4gICAgICAvLyB2YWxpZFZhbHVlcyBpcyBhbiBBcnJheVxuICAgICAgaWYgKCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICd2YWxpZFZhbHVlcycgKSApIHtcbiAgICAgICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBBcnJheS5pc0FycmF5KCBzY2hlbWEudmFsaWRWYWx1ZXMgKSwgYGlzVmFsaWRWYWx1ZSBtdXN0IGJlIGFuIGFycmF5IGZvciBrZXk6ICR7a2V5fWAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gaXNWYWxpZFZhbHVlIGlzIGEgZnVuY3Rpb25cbiAgICAgIGlmICggc2NoZW1hLmhhc093blByb3BlcnR5KCAnaXNWYWxpZFZhbHVlJyApICkge1xuICAgICAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIHR5cGVvZiBzY2hlbWEuaXNWYWxpZFZhbHVlID09PSAnZnVuY3Rpb24nLCBgaXNWYWxpZFZhbHVlIG11c3QgYmUgYSBmdW5jdGlvbiBmb3Iga2V5OiAke2tleX1gICk7XG4gICAgICB9XG5cbiAgICAgIC8vIGRlZmF1bHRWYWx1ZSBoYXMgdGhlIGNvcnJlY3QgdHlwZVxuICAgICAgaWYgKCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICdkZWZhdWx0VmFsdWUnICkgKSB7XG4gICAgICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggVFlQRVNbIHNjaGVtYS50eXBlIF0uaXNWYWxpZFZhbHVlKCBzY2hlbWEuZGVmYXVsdFZhbHVlICksIGBkZWZhdWx0VmFsdWUgaW5jb3JyZWN0IHR5cGU6ICR7a2V5fWAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gdmFsaWRWYWx1ZXMgaGF2ZSB0aGUgY29ycmVjdCB0eXBlXG4gICAgICBpZiAoIHNjaGVtYS5oYXNPd25Qcm9wZXJ0eSggJ3ZhbGlkVmFsdWVzJyApICkge1xuICAgICAgICBzY2hlbWEudmFsaWRWYWx1ZXMuZm9yRWFjaCggdmFsdWUgPT4gcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBUWVBFU1sgc2NoZW1hLnR5cGUgXS5pc1ZhbGlkVmFsdWUoIHZhbHVlICksIGB2YWxpZFZhbHVlIGluY29ycmVjdCB0eXBlIGZvciBrZXk6ICR7a2V5fWAgKSApO1xuICAgICAgfVxuXG4gICAgICAvLyBkZWZhdWx0VmFsdWUgaXMgYSBtZW1iZXIgb2YgdmFsaWRWYWx1ZXNcbiAgICAgIGlmICggc2NoZW1hLmhhc093blByb3BlcnR5KCAnZGVmYXVsdFZhbHVlJyApICYmIHNjaGVtYS5oYXNPd25Qcm9wZXJ0eSggJ3ZhbGlkVmFsdWVzJyApICkge1xuICAgICAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIGlzVmFsaWRWYWx1ZSggc2NoZW1hLmRlZmF1bHRWYWx1ZSwgc2NoZW1hLnZhbGlkVmFsdWVzICksIHNjaGVtYSxcbiAgICAgICAgICBrZXksIGBkZWZhdWx0VmFsdWUgbXVzdCBiZSBhIG1lbWJlciBvZiB2YWxpZFZhbHVlcywgZm9yIGtleTogJHtrZXl9YCApO1xuICAgICAgfVxuXG4gICAgICAvLyBkZWZhdWx0VmFsdWUgbXVzdCBleGlzdCBmb3IgYSBwdWJsaWMgc2NoZW1hIHNvIHRoZXJlJ3MgYSBmYWxsYmFjayBpbiBjYXNlIGEgdXNlciBwcm92aWRlcyBhbiBpbnZhbGlkIHZhbHVlLlxuICAgICAgLy8gSG93ZXZlciwgZGVmYXVsdFZhbHVlIGlzIG5vdCByZXF1aXJlZCBmb3IgZmxhZ3Mgc2luY2UgdGhleSdyZSBvbmx5IGEga2V5LiBXaGlsZSBtYXJraW5nIGEgZmxhZyBhcyBwdWJsaWM6IHRydWVcbiAgICAgIC8vIGRvZXNuJ3QgY2hhbmdlIGl0cyBiZWhhdmlvciwgaXQncyBhbGxvd2VkIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGUgcHVibGljIGtleSBmb3IgZG9jdW1lbnRhdGlvbiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xdWVyeS1zdHJpbmctbWFjaGluZS9pc3N1ZXMvNDFcbiAgICAgIGlmICggc2NoZW1hLmhhc093blByb3BlcnR5KCAncHVibGljJyApICYmIHNjaGVtYS5wdWJsaWMgJiYgc2NoZW1hLnR5cGUgIT09ICdmbGFnJyApIHtcbiAgICAgICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICdkZWZhdWx0VmFsdWUnICksIGBkZWZhdWx0VmFsdWUgaXMgcmVxdWlyZWQgd2hlbiBwdWJsaWM6IHRydWUgZm9yIGtleTogJHtrZXl9YCApO1xuICAgICAgfVxuXG4gICAgICAvLyB2ZXJpZnkgdGhhdCB0aGUgc2NoZW1hIGhhcyBhcHByb3ByaWF0ZSBwcm9wZXJ0aWVzXG4gICAgICB2YWxpZGF0ZVNjaGVtYVByb3BlcnRpZXMoIGtleSwgc2NoZW1hLCBUWVBFU1sgc2NoZW1hLnR5cGUgXS5yZXF1aXJlZCwgVFlQRVNbIHNjaGVtYS50eXBlIF0ub3B0aW9uYWwgKTtcblxuICAgICAgLy8gZGlzcGF0Y2ggZnVydGhlciB2YWxpZGF0aW9uIHRvIGFuIChvcHRpb25hbCkgdHlwZS1zcGVjaWZpYyBmdW5jdGlvblxuICAgICAgaWYgKCBUWVBFU1sgc2NoZW1hLnR5cGUgXS52YWxpZGF0ZVNjaGVtYSApIHtcbiAgICAgICAgVFlQRVNbIHNjaGVtYS50eXBlIF0udmFsaWRhdGVTY2hlbWEoIGtleSwgc2NoZW1hICk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFZhbGlkYXRlcyBzY2hlbWEgZm9yIHR5cGUgJ2FycmF5Jy5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBuYW1lXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHNjaGVtYSAtIHNjaGVtYSB0aGF0IGRlc2NyaWJlcyB0aGUgcXVlcnkgcGFyYW1ldGVyLCBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldFxuICAgICAqL1xuICAgIGNvbnN0IHZhbGlkYXRlQXJyYXlTY2hlbWEgPSBmdW5jdGlvbigga2V5LCBzY2hlbWEgKSB7XG5cbiAgICAgIC8vIHNlcGFyYXRvciBpcyBhIHNpbmdsZSBjaGFyYWN0ZXJcbiAgICAgIGlmICggc2NoZW1hLmhhc093blByb3BlcnR5KCAnc2VwYXJhdG9yJyApICkge1xuICAgICAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIHR5cGVvZiBzY2hlbWEuc2VwYXJhdG9yID09PSAnc3RyaW5nJyAmJiBzY2hlbWEuc2VwYXJhdG9yLmxlbmd0aCA9PT0gMSwgYGludmFsaWQgc2VwYXJhdG9yOiAke3NjaGVtYS5zZXBhcmF0b3J9LCBmb3Iga2V5OiAke2tleX1gICk7XG4gICAgICB9XG5cbiAgICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggIXNjaGVtYS5lbGVtZW50U2NoZW1hLmhhc093blByb3BlcnR5KCAncHVibGljJyApLCAnQXJyYXkgZWxlbWVudHMgc2hvdWxkIG5vdCBkZWNsYXJlIHB1YmxpYzsgaXQgY29tZXMgZnJvbSB0aGUgYXJyYXkgc2NoZW1hIGl0c2VsZi4nICk7XG5cbiAgICAgIC8vIHZhbGlkYXRlIGVsZW1lbnRTY2hlbWFcbiAgICAgIHZhbGlkYXRlU2NoZW1hKCBgJHtrZXl9LmVsZW1lbnRgLCBzY2hlbWEuZWxlbWVudFNjaGVtYSApO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBWZXJpZmllcyB0aGF0IGEgc2NoZW1hIGNvbnRhaW5zIG9ubHkgc3VwcG9ydGVkIHByb3BlcnRpZXMsIGFuZCBjb250YWlucyBhbGwgcmVxdWlyZWQgcHJvcGVydGllcy5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBuYW1lXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHNjaGVtYSAtIHNjaGVtYSB0aGF0IGRlc2NyaWJlcyB0aGUgcXVlcnkgcGFyYW1ldGVyLCBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldFxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IHJlcXVpcmVkUHJvcGVydGllcyAtIHByb3BlcnRpZXMgdGhhdCB0aGUgc2NoZW1hIG11c3QgaGF2ZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IG9wdGlvbmFsUHJvcGVydGllcyAtIHByb3BlcnRpZXMgdGhhdCB0aGUgc2NoZW1hIG1heSBvcHRpb25hbGx5IGhhdmVcbiAgICAgKi9cbiAgICBjb25zdCB2YWxpZGF0ZVNjaGVtYVByb3BlcnRpZXMgPSBmdW5jdGlvbigga2V5LCBzY2hlbWEsIHJlcXVpcmVkUHJvcGVydGllcywgb3B0aW9uYWxQcm9wZXJ0aWVzICkge1xuXG4gICAgICAvLyB7c3RyaW5nW119LCB0aGUgbmFtZXMgb2YgdGhlIHByb3BlcnRpZXMgaW4gdGhlIHNjaGVtYVxuICAgICAgY29uc3Qgc2NoZW1hUHJvcGVydGllcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKCBzY2hlbWEgKTtcblxuICAgICAgLy8gdmVyaWZ5IHRoYXQgYWxsIHJlcXVpcmVkIHByb3BlcnRpZXMgYXJlIHByZXNlbnRcbiAgICAgIHJlcXVpcmVkUHJvcGVydGllcy5mb3JFYWNoKCBwcm9wZXJ0eSA9PiB7XG4gICAgICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggc2NoZW1hUHJvcGVydGllcy5pbmRleE9mKCBwcm9wZXJ0eSApICE9PSAtMSwgYG1pc3NpbmcgcmVxdWlyZWQgcHJvcGVydHk6ICR7cHJvcGVydHl9IGZvciBrZXk6ICR7a2V5fWAgKTtcbiAgICAgIH0gKTtcblxuICAgICAgLy8gdmVyaWZ5IHRoYXQgdGhlcmUgYXJlIG5vIHVuc3VwcG9ydGVkIHByb3BlcnRpZXNcbiAgICAgIGNvbnN0IHN1cHBvcnRlZFByb3BlcnRpZXMgPSByZXF1aXJlZFByb3BlcnRpZXMuY29uY2F0KCBvcHRpb25hbFByb3BlcnRpZXMgKTtcbiAgICAgIHNjaGVtYVByb3BlcnRpZXMuZm9yRWFjaCggcHJvcGVydHkgPT4ge1xuICAgICAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIHByb3BlcnR5ID09PSAndHlwZScgfHwgc3VwcG9ydGVkUHJvcGVydGllcy5pbmRleE9mKCBwcm9wZXJ0eSApICE9PSAtMSwgYHVuc3VwcG9ydGVkIHByb3BlcnR5OiAke3Byb3BlcnR5fSBmb3Iga2V5OiAke2tleX1gICk7XG4gICAgICB9ICk7XG4gICAgfTtcblxuICAgIC8vIFBhcnNpbmcgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvKipcbiAgICAgKiBVc2VzIHRoZSBzdXBwbGllZCBzY2hlbWEgdG8gY29udmVydCBxdWVyeSBwYXJhbWV0ZXIgdmFsdWUocykgZnJvbSBzdHJpbmcgdG8gdGhlIGRlc2lyZWQgdmFsdWUgdHlwZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBuYW1lXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHNjaGVtYSAtIHNjaGVtYSB0aGF0IGRlc2NyaWJlcyB0aGUgcXVlcnkgcGFyYW1ldGVyLCBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldFxuICAgICAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZ3xudWxsfHVuZGVmaW5lZD59IHZhbHVlcyAtIGFueSBtYXRjaGVzIGZyb20gdGhlIHF1ZXJ5IHN0cmluZyxcbiAgICAgKiAgIGNvdWxkIGJlIG11bHRpcGxlIGZvciA/dmFsdWU9eCZ2YWx1ZT15IGZvciBleGFtcGxlXG4gICAgICogQHJldHVybnMgeyp9IHRoZSBhc3NvY2lhdGVkIHZhbHVlLCBjb252ZXJ0ZWQgdG8gdGhlIHByb3BlciB0eXBlXG4gICAgICovXG4gICAgY29uc3QgcGFyc2VWYWx1ZXMgPSBmdW5jdGlvbigga2V5LCBzY2hlbWEsIHZhbHVlcyApIHtcbiAgICAgIGxldCByZXR1cm5WYWx1ZTtcblxuICAgICAgLy8gdmFsdWVzIGNvbnRhaW5zIHZhbHVlcyBmb3IgYWxsIG9jY3VycmVuY2VzIG9mIHRoZSBxdWVyeSBwYXJhbWV0ZXIuICBXZSBjdXJyZW50bHkgc3VwcG9ydCBvbmx5IDEgb2NjdXJyZW5jZS5cbiAgICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggdmFsdWVzLmxlbmd0aCA8PSAxLCBgcXVlcnkgcGFyYW1ldGVyIGNhbm5vdCBvY2N1ciBtdWx0aXBsZSB0aW1lczogJHtrZXl9YCApO1xuXG4gICAgICBpZiAoIHNjaGVtYS50eXBlID09PSAnZmxhZycgKSB7XG5cbiAgICAgICAgLy8gZmxhZyBpcyBhIGNvbnZlbmllbnQgdmFyaWF0aW9uIG9mIGJvb2xlYW4sIHdoaWNoIGRlcGVuZHMgb24gd2hldGhlciB0aGUgcXVlcnkgc3RyaW5nIGlzIHByZXNlbnQgb3Igbm90XG4gICAgICAgIHJldHVyblZhbHVlID0gVFlQRVNbIHNjaGVtYS50eXBlIF0ucGFyc2UoIGtleSwgc2NoZW1hLCB2YWx1ZXNbIDAgXSApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggdmFsdWVzWyAwIF0gIT09IHVuZGVmaW5lZCB8fCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICdkZWZhdWx0VmFsdWUnICksXG4gICAgICAgICAgYG1pc3NpbmcgcmVxdWlyZWQgcXVlcnkgcGFyYW1ldGVyOiAke2tleX1gICk7XG4gICAgICAgIGlmICggdmFsdWVzWyAwIF0gPT09IHVuZGVmaW5lZCApIHtcblxuICAgICAgICAgIC8vIG5vdCBpbiB0aGUgcXVlcnkgc3RyaW5nLCB1c2UgdGhlIGRlZmF1bHRcbiAgICAgICAgICByZXR1cm5WYWx1ZSA9IHNjaGVtYS5kZWZhdWx0VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG5cbiAgICAgICAgICAvLyBkaXNwYXRjaCBwYXJzaW5nIG9mIHF1ZXJ5IHN0cmluZyB0byBhIHR5cGUtc3BlY2lmaWMgZnVuY3Rpb25cbiAgICAgICAgICByZXR1cm5WYWx1ZSA9IFRZUEVTWyBzY2hlbWEudHlwZSBdLnBhcnNlKCBrZXksIHNjaGVtYSwgdmFsdWVzWyAwIF0gKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFBhcnNlcyB0aGUgdmFsdWUgZm9yIGEgdHlwZSAnZmxhZycuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIgbmFtZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzY2hlbWEgLSBzY2hlbWEgdGhhdCBkZXNjcmliZXMgdGhlIHF1ZXJ5IHBhcmFtZXRlciwgc2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRcbiAgICAgKiBAcGFyYW0ge251bGx8dW5kZWZpbmVkfHN0cmluZ30gdmFsdWUgLSB2YWx1ZSBmcm9tIHRoZSBxdWVyeSBwYXJhbWV0ZXIgc3RyaW5nXG4gICAgICogQHJldHVybnMge2Jvb2xlYW58c3RyaW5nfVxuICAgICAqL1xuICAgIGNvbnN0IHBhcnNlRmxhZyA9IGZ1bmN0aW9uKCBrZXksIHNjaGVtYSwgdmFsdWUgKSB7XG4gICAgICByZXR1cm4gdmFsdWUgPT09IG51bGwgPyB0cnVlIDogdmFsdWUgPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogdmFsdWU7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFBhcnNlcyB0aGUgdmFsdWUgZm9yIGEgdHlwZSAnYm9vbGVhbicuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIgbmFtZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzY2hlbWEgLSBzY2hlbWEgdGhhdCBkZXNjcmliZXMgdGhlIHF1ZXJ5IHBhcmFtZXRlciwgc2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xudWxsfSBzdHJpbmcgLSB2YWx1ZSBmcm9tIHRoZSBxdWVyeSBwYXJhbWV0ZXIgc3RyaW5nXG4gICAgICogQHJldHVybnMge2Jvb2xlYW58c3RyaW5nfG51bGx9XG4gICAgICovXG4gICAgY29uc3QgcGFyc2VCb29sZWFuID0gZnVuY3Rpb24oIGtleSwgc2NoZW1hLCBzdHJpbmcgKSB7XG4gICAgICByZXR1cm4gc3RyaW5nID09PSAndHJ1ZScgPyB0cnVlIDogc3RyaW5nID09PSAnZmFsc2UnID8gZmFsc2UgOiBzdHJpbmc7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFBhcnNlcyB0aGUgdmFsdWUgZm9yIGEgdHlwZSAnbnVtYmVyJy5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBuYW1lXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHNjaGVtYSAtIHNjaGVtYSB0aGF0IGRlc2NyaWJlcyB0aGUgcXVlcnkgcGFyYW1ldGVyLCBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfG51bGx9IHN0cmluZyAtIHZhbHVlIGZyb20gdGhlIHF1ZXJ5IHBhcmFtZXRlciBzdHJpbmdcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfHN0cmluZ3xudWxsfVxuICAgICAqL1xuICAgIGNvbnN0IHBhcnNlTnVtYmVyID0gZnVuY3Rpb24oIGtleSwgc2NoZW1hLCBzdHJpbmcgKSB7XG4gICAgICBjb25zdCBudW1iZXIgPSBOdW1iZXIoIHN0cmluZyApO1xuICAgICAgcmV0dXJuIHN0cmluZyA9PT0gbnVsbCB8fCBpc05hTiggbnVtYmVyICkgPyBzdHJpbmcgOiBudW1iZXI7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFBhcnNlcyB0aGUgdmFsdWUgZm9yIGEgdHlwZSAnbnVtYmVyJy5cbiAgICAgKiBUaGUgdmFsdWUgdG8gYmUgcGFyc2VkIGlzIGFscmVhZHkgc3RyaW5nLCBzbyBpdCBpcyBndWFyYW50ZWVkIHRvIHBhcnNlIGFzIGEgc3RyaW5nLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc2NoZW1hXG4gICAgICogQHBhcmFtIHtzdHJpbmd8bnVsbH0gc3RyaW5nXG4gICAgICogQHJldHVybnMge3N0cmluZ3xudWxsfVxuICAgICAqL1xuICAgIGNvbnN0IHBhcnNlU3RyaW5nID0gZnVuY3Rpb24oIGtleSwgc2NoZW1hLCBzdHJpbmcgKSB7XG4gICAgICByZXR1cm4gc3RyaW5nO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBQYXJzZXMgdGhlIHZhbHVlIGZvciBhIHR5cGUgJ2FycmF5Jy5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBuYW1lXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHNjaGVtYSAtIHNjaGVtYSB0aGF0IGRlc2NyaWJlcyB0aGUgcXVlcnkgcGFyYW1ldGVyLCBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfG51bGx9IHZhbHVlIC0gdmFsdWUgZnJvbSB0aGUgcXVlcnkgcGFyYW1ldGVyIHN0cmluZ1xuICAgICAqIEByZXR1cm5zIHtBcnJheS48Kj58bnVsbH1cbiAgICAgKi9cbiAgICBjb25zdCBwYXJzZUFycmF5ID0gZnVuY3Rpb24oIGtleSwgc2NoZW1hLCB2YWx1ZSApIHtcblxuICAgICAgbGV0IHJldHVyblZhbHVlO1xuXG4gICAgICBpZiAoIHZhbHVlID09PSBudWxsICkge1xuXG4gICAgICAgIC8vIG51bGwgc2lnbmlmaWVzIGFuIGVtcHR5IGFycmF5LiBGb3IgaW5zdGFuY2UgP3NjcmVlbnM9IHdvdWxkIGdpdmUgW11cbiAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xdWVyeS1zdHJpbmctbWFjaGluZS9pc3N1ZXMvMTdcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBbXTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuXG4gICAgICAgIC8vIFNwbGl0IHVwIHRoZSBzdHJpbmcgaW50byBhbiBhcnJheSBvZiB2YWx1ZXMuIEUuZy4gP3NjcmVlbnM9MSwyIHdvdWxkIGdpdmUgWzEsMl1cbiAgICAgICAgcmV0dXJuVmFsdWUgPSB2YWx1ZS5zcGxpdCggc2NoZW1hLnNlcGFyYXRvciB8fCBERUZBVUxUX1NFUEFSQVRPUiApXG4gICAgICAgICAgLm1hcCggZWxlbWVudCA9PiBwYXJzZVZhbHVlcygga2V5LCBzY2hlbWEuZWxlbWVudFNjaGVtYSwgWyBlbGVtZW50IF0gKSApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFBhcnNlcyB0aGUgdmFsdWUgZm9yIGEgdHlwZSAnY3VzdG9tJy5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBuYW1lXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHNjaGVtYSAtIHNjaGVtYSB0aGF0IGRlc2NyaWJlcyB0aGUgcXVlcnkgcGFyYW1ldGVyLCBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIHZhbHVlIGZyb20gdGhlIHF1ZXJ5IHBhcmFtZXRlciBzdHJpbmdcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBjb25zdCBwYXJzZUN1c3RvbSA9IGZ1bmN0aW9uKCBrZXksIHNjaGVtYSwgdmFsdWUgKSB7XG4gICAgICByZXR1cm4gc2NoZW1hLnBhcnNlKCB2YWx1ZSApO1xuICAgIH07XG5cbiAgICAvLyBVdGlsaXRpZXMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBpZiB2YWx1ZSBpcyBpbiBhIHNldCBvZiB2YWxpZCB2YWx1ZXMsIHVzZXMgZGVlcCBjb21wYXJpc29uLlxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAgICAgKiBAcGFyYW0ge0FycmF5LjwqPn0gdmFsaWRWYWx1ZXNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBjb25zdCBpc1ZhbGlkVmFsdWUgPSBmdW5jdGlvbiggdmFsdWUsIHZhbGlkVmFsdWVzICkge1xuICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB2YWxpZFZhbHVlcy5sZW5ndGggJiYgIWZvdW5kOyBpKysgKSB7XG4gICAgICAgIGZvdW5kID0gUXVlcnlTdHJpbmdNYWNoaW5lLmRlZXBFcXVhbHMoIHZhbGlkVmFsdWVzWyBpIF0sIHZhbHVlICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZm91bmQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFF1ZXJ5IHBhcmFtZXRlcnMgYXJlIHNwZWNpZmllZCBieSB0aGUgdXNlciwgYW5kIGFyZSBvdXRzaWRlIHRoZSBjb250cm9sIG9mIHRoZSBwcm9ncmFtbWVyLlxuICAgICAqIFNvIHRoZSBhcHBsaWNhdGlvbiBzaG91bGQgdGhyb3cgYW4gRXJyb3IgaWYgcXVlcnkgcGFyYW1ldGVycyBhcmUgaW52YWxpZC5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHByZWRpY2F0ZSAtIGlmIHByZWRpY2F0ZSBldmFsdWF0ZXMgdG8gZmFsc2UsIGFuIEVycm9yIGlzIHRocm93blxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlXG4gICAgICovXG4gICAgY29uc3QgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0ID0gZnVuY3Rpb24oIHByZWRpY2F0ZSwgbWVzc2FnZSApIHtcbiAgICAgIGlmICggIXByZWRpY2F0ZSApIHtcbiAgICAgICAgY29uc29sZSAmJiBjb25zb2xlLmxvZyAmJiBjb25zb2xlLmxvZyggbWVzc2FnZSApO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBRdWVyeSBTdHJpbmcgTWFjaGluZSBBc3NlcnRpb24gZmFpbGVkOiAke21lc3NhZ2V9YCApO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLyoqXG4gICAgICogRGF0YSBzdHJ1Y3R1cmUgdGhhdCBkZXNjcmliZXMgZWFjaCBxdWVyeSBwYXJhbWV0ZXIgdHlwZSwgd2hpY2ggcHJvcGVydGllcyBhcmUgcmVxdWlyZWQgdnMgb3B0aW9uYWwsXG4gICAgICogaG93IHRvIHZhbGlkYXRlLCBhbmQgaG93IHRvIHBhcnNlLlxuICAgICAqXG4gICAgICogVGhlIHByb3BlcnRpZXMgdGhhdCBhcmUgcmVxdWlyZWQgb3Igb3B0aW9uYWwgZGVwZW5kIG9uIHRoZSB0eXBlIChzZWUgVFlQRVMpLCBhbmQgaW5jbHVkZTpcbiAgICAgKiB0eXBlIC0ge3N0cmluZ30gdGhlIHR5cGUgbmFtZVxuICAgICAqIGRlZmF1bHRWYWx1ZSAtIHRoZSB2YWx1ZSB0byB1c2UgaWYgbm8gcXVlcnkgcGFyYW1ldGVyIGlzIHByb3ZpZGVkLiBJZiB0aGVyZSBpcyBubyBkZWZhdWx0VmFsdWUsIHRoZW5cbiAgICAgKiAgICB0aGUgcXVlcnkgcGFyYW1ldGVyIGlzIHJlcXVpcmVkIGluIHRoZSBxdWVyeSBzdHJpbmc7IG9taXR0aW5nIHRoZSBxdWVyeSBwYXJhbWV0ZXIgd2lsbCByZXN1bHQgaW4gYW4gRXJyb3IuXG4gICAgICogdmFsaWRWYWx1ZXMgLSBhcnJheSBvZiB0aGUgdmFsaWQgdmFsdWVzIGZvciB0aGUgcXVlcnkgcGFyYW1ldGVyXG4gICAgICogaXNWYWxpZFZhbHVlIC0gZnVuY3Rpb24gdGhhdCB0YWtlcyBhIHBhcnNlZCBPYmplY3QgKG5vdCBzdHJpbmcpIGFuZCBjaGVja3MgaWYgaXQgaXMgYWNjZXB0YWJsZVxuICAgICAqIGVsZW1lbnRTY2hlbWEgLSBzcGVjaWZpZXMgdGhlIHNjaGVtYSBmb3IgZWxlbWVudHMgaW4gYW4gYXJyYXlcbiAgICAgKiBzZXBhcmF0b3IgLSAgYXJyYXkgZWxlbWVudHMgYXJlIHNlcGFyYXRlZCBieSB0aGlzIHN0cmluZywgZGVmYXVsdHMgdG8gYCxgXG4gICAgICogcGFyc2UgLSBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYSBzdHJpbmcgYW5kIHJldHVybnMgYW4gT2JqZWN0XG4gICAgICovXG4gICAgY29uc3QgVFlQRVMgPSB7XG4gICAgICAvLyBOT1RFOiBUeXBlcyBmb3IgdGhpcyBhcmUgY3VycmVudGx5IGluIHBoZXQtdHlwZXMuZC50cyEgQ2hhbmdlcyBoZXJlIHNob3VsZCBiZSBtYWRlIHRoZXJlIGFsc29cblxuICAgICAgLy8gdmFsdWUgaXMgdHJ1ZSBpZiBwcmVzZW50LCBmYWxzZSBpZiBhYnNlbnRcbiAgICAgIGZsYWc6IHtcbiAgICAgICAgcmVxdWlyZWQ6IFtdLFxuICAgICAgICBvcHRpb25hbDogWyAncHJpdmF0ZScsICdwdWJsaWMnIF0sXG4gICAgICAgIHZhbGlkYXRlU2NoZW1hOiBudWxsLCAvLyBubyB0eXBlLXNwZWNpZmljIHNjaGVtYSB2YWxpZGF0aW9uXG4gICAgICAgIHBhcnNlOiBwYXJzZUZsYWcsXG4gICAgICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gdmFsdWUgPT09IHRydWUgfHwgdmFsdWUgPT09IGZhbHNlLFxuICAgICAgICBkZWZhdWx0VmFsdWU6IHRydWUgLy8gb25seSBuZWVkZWQgZm9yIGZsYWdzIG1hcmtzIGFzICdwdWJsaWM6IHRydWVgXG4gICAgICB9LFxuXG4gICAgICAvLyB2YWx1ZSBpcyBlaXRoZXIgdHJ1ZSBvciBmYWxzZSwgZS5nLiBzaG93QW5zd2VyPXRydWVcbiAgICAgIGJvb2xlYW46IHtcbiAgICAgICAgcmVxdWlyZWQ6IFtdLFxuICAgICAgICBvcHRpb25hbDogWyAnZGVmYXVsdFZhbHVlJywgJ3ByaXZhdGUnLCAncHVibGljJyBdLFxuICAgICAgICB2YWxpZGF0ZVNjaGVtYTogbnVsbCwgLy8gbm8gdHlwZS1zcGVjaWZpYyBzY2hlbWEgdmFsaWRhdGlvblxuICAgICAgICBwYXJzZTogcGFyc2VCb29sZWFuLFxuICAgICAgICBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+IHZhbHVlID09PSB0cnVlIHx8IHZhbHVlID09PSBmYWxzZVxuICAgICAgfSxcblxuICAgICAgLy8gdmFsdWUgaXMgYSBudW1iZXIsIGUuZy4gZnJhbWVSYXRlPTEwMFxuICAgICAgbnVtYmVyOiB7XG4gICAgICAgIHJlcXVpcmVkOiBbXSxcbiAgICAgICAgb3B0aW9uYWw6IFsgJ2RlZmF1bHRWYWx1ZScsICd2YWxpZFZhbHVlcycsICdpc1ZhbGlkVmFsdWUnLCAncHJpdmF0ZScsICdwdWJsaWMnIF0sXG4gICAgICAgIHZhbGlkYXRlU2NoZW1hOiBudWxsLCAvLyBubyB0eXBlLXNwZWNpZmljIHNjaGVtYSB2YWxpZGF0aW9uXG4gICAgICAgIHBhcnNlOiBwYXJzZU51bWJlcixcbiAgICAgICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc05hTiggdmFsdWUgKVxuICAgICAgfSxcblxuICAgICAgLy8gdmFsdWUgaXMgYSBzdHJpbmcsIGUuZy4gbmFtZT1SaW5nb1xuICAgICAgc3RyaW5nOiB7XG4gICAgICAgIHJlcXVpcmVkOiBbXSxcbiAgICAgICAgb3B0aW9uYWw6IFsgJ2RlZmF1bHRWYWx1ZScsICd2YWxpZFZhbHVlcycsICdpc1ZhbGlkVmFsdWUnLCAncHJpdmF0ZScsICdwdWJsaWMnIF0sXG4gICAgICAgIHZhbGlkYXRlU2NoZW1hOiBudWxsLCAvLyBubyB0eXBlLXNwZWNpZmljIHNjaGVtYSB2YWxpZGF0aW9uXG4gICAgICAgIHBhcnNlOiBwYXJzZVN0cmluZyxcbiAgICAgICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiB2YWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnXG4gICAgICB9LFxuXG4gICAgICAvLyB2YWx1ZSBpcyBhbiBhcnJheSwgZS5nLiBzY3JlZW5zPTEsMiwzXG4gICAgICBhcnJheToge1xuICAgICAgICByZXF1aXJlZDogWyAnZWxlbWVudFNjaGVtYScgXSxcbiAgICAgICAgb3B0aW9uYWw6IFsgJ2RlZmF1bHRWYWx1ZScsICd2YWxpZFZhbHVlcycsICdpc1ZhbGlkVmFsdWUnLCAnc2VwYXJhdG9yJywgJ3ZhbGlkVmFsdWVzJywgJ3ByaXZhdGUnLCAncHVibGljJyBdLFxuICAgICAgICB2YWxpZGF0ZVNjaGVtYTogdmFsaWRhdGVBcnJheVNjaGVtYSxcbiAgICAgICAgcGFyc2U6IHBhcnNlQXJyYXksXG4gICAgICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gQXJyYXkuaXNBcnJheSggdmFsdWUgKSB8fCB2YWx1ZSA9PT0gbnVsbFxuICAgICAgfSxcblxuICAgICAgLy8gdmFsdWUgaXMgYSBjdXN0b20gZGF0YSB0eXBlLCBlLmcuIGNvbG9yPTI1NSwwLDI1NVxuICAgICAgY3VzdG9tOiB7XG4gICAgICAgIHJlcXVpcmVkOiBbICdwYXJzZScgXSxcbiAgICAgICAgb3B0aW9uYWw6IFsgJ2RlZmF1bHRWYWx1ZScsICd2YWxpZFZhbHVlcycsICdpc1ZhbGlkVmFsdWUnLCAncHJpdmF0ZScsICdwdWJsaWMnIF0sXG4gICAgICAgIHZhbGlkYXRlU2NoZW1hOiBudWxsLCAvLyBubyB0eXBlLXNwZWNpZmljIHNjaGVtYSB2YWxpZGF0aW9uXG4gICAgICAgIHBhcnNlOiBwYXJzZUN1c3RvbSxcbiAgICAgICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiB7XG5cbiAgICAgICAgICAvLyBUT0RPIGRvIHdlIG5lZWQgdG8gYWRkIGEgcHJvcGVydHkgdG8gJ2N1c3RvbScgc2NoZW1hIHRoYXQgaGFuZGxlcyB2YWxpZGF0aW9uIG9mIGN1c3RvbSB2YWx1ZSdzIHR5cGU/IHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVlcnktc3RyaW5nLW1hY2hpbmUvaXNzdWVzLzM1XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIFF1ZXJ5U3RyaW5nTWFjaGluZTtcbiAgfSApKCk7XG59ICkgKTsiXSwibmFtZXMiOlsicm9vdCIsImZhY3RvcnkiLCJ3aW5kb3ciLCJkZWZpbmUiLCJhbWQiLCJRdWVyeVN0cmluZ01hY2hpbmUiLCJERUZBVUxUX1NFUEFSQVRPUiIsInByaXZhdGVQcmVkaWNhdGUiLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwiZSIsImlzUGFyYW1ldGVyU3RyaW5nIiwic3RyaW5nIiwibGVuZ3RoIiwiaW5kZXhPZiIsImdldFZhbGlkVmFsdWUiLCJwcmVkaWNhdGUiLCJrZXkiLCJ2YWx1ZSIsInNjaGVtYSIsIm1lc3NhZ2UiLCJwdWJsaWMiLCJhZGRXYXJuaW5nIiwiaGFzT3duUHJvcGVydHkiLCJkZWZhdWx0VmFsdWUiLCJ0eXBlU2NoZW1hIiwiVFlQRVMiLCJ0eXBlIiwicXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0Iiwid2FybmluZ3MiLCJnZXQiLCJnZXRGb3JTdHJpbmciLCJsb2NhdGlvbiIsInNlYXJjaCIsImdldEFsbCIsInNjaGVtYU1hcCIsImdldEFsbEZvclN0cmluZyIsIkVycm9yIiwidmFsdWVzIiwicHJpdmF0ZSIsImdldFZhbHVlcyIsInZhbGlkYXRlU2NoZW1hIiwicGFyc2VWYWx1ZXMiLCJpc1ZhbGlkVmFsdWUiLCJ2YWxpZFZhbHVlcyIsImpvaW4iLCJ2YWx1ZVZhbGlkIiwiQXJyYXkiLCJpc0FycmF5IiwiZWxlbWVudHNWYWxpZCIsImkiLCJlbGVtZW50IiwiZWxlbWVudFNjaGVtYSIsInJlc3VsdCIsImNvbnRhaW5zS2V5IiwiY29udGFpbnNLZXlGb3JTdHJpbmciLCJkZWVwRXF1YWxzIiwiYSIsImIiLCJ1bmRlZmluZWQiLCJhS2V5cyIsIk9iamVjdCIsImtleXMiLCJiS2V5cyIsImFDaGlsZCIsImJDaGlsZCIsInJlbW92ZUtleVZhbHVlUGFpciIsInF1ZXJ5U3RyaW5nIiwiYXNzZXJ0IiwibmV3UGFyYW1ldGVycyIsInF1ZXJ5Iiwic3Vic3RyaW5nIiwiZWxlbWVudHMiLCJzcGxpdCIsImtleUFuZE1heWJlVmFsdWUiLCJlbGVtZW50S2V5IiwiZGVjb2RlVVJJQ29tcG9uZW50IiwicHVzaCIsInJlbW92ZUtleVZhbHVlUGFpcnMiLCJhcHBlbmRRdWVyeVN0cmluZyIsInVybCIsInF1ZXJ5UGFyYW1ldGVycyIsImNvbWJpbmF0aW9uIiwiYXBwZW5kUXVlcnlTdHJpbmdBcnJheSIsInF1ZXJ5U3RyaW5nQXJyYXkiLCJnZXRRdWVyeVN0cmluZyIsImluZGV4IiwiaXNEdXBsaWNhdGUiLCJ3YXJuaW5nIiwiY29uc29sZSIsIndhcm4iLCJoYXNXYXJuaW5nIiwiZ2V0UXVlcnlQYXJhbWV0ZXJzRnJvbVN0cmluZyIsImdldFNpbmdsZVF1ZXJ5UGFyYW1ldGVyU3RyaW5nIiwicXVlcnlQYXJhbWV0ZXIiLCJwYXJhbXMiLCJzbGljZSIsInNwbGl0QnlFcXVhbHMiLCJuYW1lIiwicGFyc2UiLCJmb3JFYWNoIiwidmFsaWRhdGVTY2hlbWFQcm9wZXJ0aWVzIiwicmVxdWlyZWQiLCJvcHRpb25hbCIsInZhbGlkYXRlQXJyYXlTY2hlbWEiLCJzZXBhcmF0b3IiLCJyZXF1aXJlZFByb3BlcnRpZXMiLCJvcHRpb25hbFByb3BlcnRpZXMiLCJzY2hlbWFQcm9wZXJ0aWVzIiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsInByb3BlcnR5Iiwic3VwcG9ydGVkUHJvcGVydGllcyIsImNvbmNhdCIsInJldHVyblZhbHVlIiwicGFyc2VGbGFnIiwicGFyc2VCb29sZWFuIiwicGFyc2VOdW1iZXIiLCJudW1iZXIiLCJOdW1iZXIiLCJpc05hTiIsInBhcnNlU3RyaW5nIiwicGFyc2VBcnJheSIsIm1hcCIsInBhcnNlQ3VzdG9tIiwiZm91bmQiLCJsb2ciLCJmbGFnIiwiYm9vbGVhbiIsImFycmF5IiwiY3VzdG9tIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7O0NBV0MsR0FDQyxDQUFBLFNBQVVBLElBQUksRUFBRUMsT0FB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