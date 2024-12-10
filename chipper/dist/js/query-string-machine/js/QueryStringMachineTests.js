// Copyright 2016-2024, University of Colorado Boulder
/**
 * QueryStringMachine tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ QUnit.module('QueryStringMachine');
// assert shadows window.assert
QUnit.test('basic tests', (assert)=>{
    const value = 'hello';
    assert.equal(value, 'hello', 'We expect value to be hello');
    const schemaMap = {
        height: {
            type: 'number',
            defaultValue: 6,
            validValues: [
                4,
                5,
                6,
                7,
                8
            ]
        },
        name: {
            type: 'string',
            defaultValue: 'Larry',
            isValidValue: function(str) {
                return str.indexOf('Z') !== 0; // Name cannot start with 'Z'
            }
        },
        custom: {
            type: 'custom',
            defaultValue: 'abc',
            validValues: [
                'abc',
                'def',
                'ghi'
            ],
            parse: function(string) {
                return string.toLowerCase();
            }
        },
        isWebGL: {
            type: 'flag'
        },
        screens: {
            type: 'array',
            defaultValue: [],
            elementSchema: {
                type: 'number'
            }
        },
        colors: {
            type: 'array',
            defaultValue: [
                'red',
                'green',
                'blue'
            ],
            elementSchema: {
                type: 'string'
            }
        }
    };
    assert.deepEqual(QueryStringMachine.getAllForString(schemaMap, ''), {
        height: 6,
        name: 'Larry',
        custom: 'abc',
        isWebGL: false,
        screens: [],
        colors: [
            'red',
            'green',
            'blue'
        ]
    }, 'A blank query string should provide defaults');
    assert.deepEqual(QueryStringMachine.getAllForString(schemaMap, '?height=7&isWebGL'), {
        height: 7,
        name: 'Larry',
        custom: 'abc',
        isWebGL: true,
        screens: [],
        colors: [
            'red',
            'green',
            'blue'
        ]
    }, 'Query parameter values should be parsed');
    assert.deepEqual(QueryStringMachine.getAllForString(schemaMap, '?screens='), {
        height: 6,
        name: 'Larry',
        custom: 'abc',
        isWebGL: false,
        screens: [],
        colors: [
            'red',
            'green',
            'blue'
        ]
    }, 'No value for screens should result in an empty array ');
    assert.deepEqual(QueryStringMachine.getAllForString(schemaMap, '?height=7&isWebGL&custom=DEF'), {
        height: 7,
        name: 'Larry',
        custom: 'def',
        isWebGL: true,
        screens: [],
        colors: [
            'red',
            'green',
            'blue'
        ]
    }, 'Custom query parameter should be supported');
    assert.deepEqual(QueryStringMachine.getAllForString(schemaMap, '?isWebGL&screens=1,2,3,5&colors=yellow,orange,pink'), {
        height: 6,
        name: 'Larry',
        custom: 'abc',
        isWebGL: true,
        screens: [
            1,
            2,
            3,
            5
        ],
        colors: [
            'yellow',
            'orange',
            'pink'
        ]
    }, 'Array should be parsed');
    const flagSchema = {
        flag: {
            type: 'flag'
        }
    };
    assert.deepEqual(QueryStringMachine.getAllForString(flagSchema, '?flag'), {
        flag: true
    }, 'Flag was provided');
    assert.deepEqual(QueryStringMachine.getAllForString(flagSchema, '?flag='), {
        flag: true
    }, 'Flag was provided with no value');
    assert.throws(()=>{
        QueryStringMachine.getAllForString(flagSchema, '?flag=hello');
    }, 'Flags cannot have values');
    assert.throws(()=>{
        QueryStringMachine.getAllForString(flagSchema, '?flag=true');
    }, 'Flags cannot have values');
    // Test that isValidValue is supported for arrays with a contrived check (element sum == 7).
    // With an input of [2,4,0], QSM should throw an error, and it should be caught here.
    assert.throws(()=>{
        QueryStringMachine.getAllForString({
            numbers: {
                type: 'array',
                elementSchema: {
                    type: 'number'
                },
                defaultValue: [
                    1,
                    6,
                    0
                ],
                isValidValue: function(arr) {
                    // Fake test: check that elements sum to 7 for phetsims/query-string-machine#11
                    const arraySum = arr.reduce((a, b)=>a + b, 0);
                    return arraySum === 7;
                }
            }
        }, '?numbers=2,4,0');
    }, 'Array error handling should catch exception');
    assert.throws(()=>{
        QueryStringMachine.getAllForString({
            sim: {
                type: 'string'
            }
        }, '?ea&hello=true');
    }, 'Catch missing required query parameter');
    assert.deepEqual(QueryStringMachine.getForString('hello', {
        type: 'array',
        elementSchema: {
            type: 'number'
        },
        validValues: [
            [
                1,
                2
            ],
            [
                3,
                4
            ],
            [
                1,
                2,
                3
            ]
        ],
        defaultValue: [
            1,
            2
        ]
    }, '?ea&hello=1,2,3'), [
        1,
        2,
        3
    ], 'Arrays should support defaultValue and validValues');
    assert.throws(()=>{
        QueryStringMachine.getForString('hello', {
            type: 'array',
            elementSchema: {
                type: 'number'
            },
            validValues: [
                [
                    1,
                    2
                ],
                [
                    3,
                    4
                ],
                [
                    1,
                    2,
                    3
                ]
            ],
            defaultValue: [
                1,
                2
            ]
        }, '?ea&hello=1,2,3,99');
    }, 'Catch invalid value for array');
    assert.deepEqual(QueryStringMachine.getForString('screens', {
        type: 'array',
        elementSchema: {
            type: 'number'
        },
        defaultValue: null
    }, '?screens=1,2,3'), [
        1,
        2,
        3
    ], 'Test array of numbers');
});
// Tests for our own deepEquals method
QUnit.test('deepEquals', (assert)=>{
    assert.equal(QueryStringMachine.deepEquals(7, 7), true, '7 should equal itself');
    assert.equal(QueryStringMachine.deepEquals(7, 8), false, '7 should not equal 8');
    assert.equal(QueryStringMachine.deepEquals(7, '7'), false, '7 should not equal "7"');
    assert.equal(QueryStringMachine.deepEquals({
        0: 'A'
    }, 'A'), false, 'string tests');
    assert.equal(QueryStringMachine.deepEquals([
        'hello',
        7
    ], [
        'hello',
        7
    ]), true, 'array equality test');
    assert.equal(QueryStringMachine.deepEquals([
        'hello',
        7
    ], [
        'hello',
        '7'
    ]), false, 'array inequality test');
    assert.equal(QueryStringMachine.deepEquals([
        'hello',
        {
            hello: true
        }
    ], [
        'hello',
        {
            hello: true
        }
    ]), true, 'object in array inequality test');
    assert.equal(QueryStringMachine.deepEquals([
        'hello',
        {
            hello: true
        }
    ], [
        'hello',
        {
            hello: false
        }
    ]), false, 'object in array  inequality test');
    assert.equal(QueryStringMachine.deepEquals({
        x: [
            {
                y: 'hello'
            },
            true,
            123,
            'x'
        ]
    }, {
        x: [
            {
                y: 'hello'
            },
            true,
            123,
            'x'
        ]
    }), true, 'object in array  inequality test');
    assert.equal(QueryStringMachine.deepEquals({
        x: [
            {
                y: 'hello'
            },
            true,
            123,
            'x'
        ]
    }, {
        x: [
            true,
            {
                y: 'hello'
            },
            true,
            123,
            'x'
        ]
    }), false, 'object in array  inequality test');
    assert.equal(QueryStringMachine.deepEquals({
        x: [
            {
                y: 'hello'
            },
            true,
            123,
            'x'
        ]
    }, {
        y: [
            {
                y: 'hello'
            },
            true,
            123,
            'x'
        ]
    }), false, 'object in array  inequality test');
    assert.equal(QueryStringMachine.deepEquals(null, null), true, 'null null');
    assert.equal(QueryStringMachine.deepEquals(null, undefined), false, 'null undefined');
    assert.equal(QueryStringMachine.deepEquals(undefined, undefined), true, 'undefined undefined');
    assert.equal(QueryStringMachine.deepEquals(()=>{}, ()=>{}), false, 'different implementations of similar functions');
    const f = function() {};
    assert.equal(QueryStringMachine.deepEquals(f, f), true, 'same reference function');
});
QUnit.test('removeKeyValuePair', (assert)=>{
    assert.equal(QueryStringMachine.removeKeyValuePair('?time=now', 'time'), '', 'Remove single occurrence');
    assert.equal(QueryStringMachine.removeKeyValuePair('?time=now&place=here', 'time'), '?place=here', 'Remove single occurrence but leave other');
    assert.equal(QueryStringMachine.removeKeyValuePair('?time=now&time=later', 'time'), '', 'Remove multiple occurrences');
    assert.equal(QueryStringMachine.removeKeyValuePair('?time=now&time', 'time'), '', 'Remove multiple occurrences, one with value');
    assert.equal(QueryStringMachine.removeKeyValuePair('?place=here&time=now', 'time'), '?place=here', 'Different order');
    assert.equal(QueryStringMachine.removeKeyValuePair('?time&place', 'time'), '?place', 'Remove with no values');
    assert.equal(QueryStringMachine.removeKeyValuePair('?place&time', 'time'), '?place', 'Remove with no values');
    assert.equal(QueryStringMachine.removeKeyValuePair('?place&time', 'times'), '?place&time', 'Key to remove not present');
    assert.equal(QueryStringMachine.removeKeyValuePair('?sim=ohms-law&phetioValidation&phetioDebug=true', 'fuzz'), '?sim=ohms-law&phetioValidation&phetioDebug=true', 'Key to remove not present');
    assert.equal(QueryStringMachine.removeKeyValuePair('', 'fuzz'), '', 'No search present');
    if (window.assert) {
        assert.throws(()=>QueryStringMachine.removeKeyValuePair('time=now', 'time'), 'Not removed if there is no question mark');
    }
});
QUnit.test('appendQueryString', (assert)=>{
    const test = function(url, queryParameters, expected) {
        assert.equal(QueryStringMachine.appendQueryString(url, queryParameters), expected, `${url} + ${queryParameters} should be ok`);
    };
    test('http://localhost.com/hello.html', '', 'http://localhost.com/hello.html');
    test('http://localhost.com/hello.html?hi', '', 'http://localhost.com/hello.html?hi');
    test('http://localhost.com/hello.html', '?test', 'http://localhost.com/hello.html?test');
    test('http://localhost.com/hello.html', '&test', 'http://localhost.com/hello.html?test');
    test('http://localhost.com/hello.html?abc', '', 'http://localhost.com/hello.html?abc');
    test('http://localhost.com/hello.html?abc', '?123', 'http://localhost.com/hello.html?abc&123');
    test('http://localhost.com/hello.html?abc', '&123', 'http://localhost.com/hello.html?abc&123');
    test('?abc', '&123', '?abc&123');
    test('?abc', '123', '?abc&123');
    test('?abc', '123&hi', '?abc&123&hi');
    test('?', 'abc&123&hi', '?&abc&123&hi');
});
QUnit.test('getSingleQueryParameterString', (assert)=>{
    const test = function(url, key, expected) {
        assert.equal(QueryStringMachine.getSingleQueryParameterString(key, url), expected, `${url} + ${key} should be equal`);
    };
    test('http://phet.colorado.com/hello.html?test', 'test', 'test');
    test('http://phet.colorado.com/hello.html?test=hi', 'test', 'test=hi');
    test('http://phet.colorado.com/hello.html?hi&test=hi', 'test', 'test=hi');
    test('?hi&test=hi,4,3,%203', 'test', 'test=hi,4,3,%203');
    const parameterKey = encodeURIComponent('jf4238597043*$(%$*()#%&*#(^_(&');
    const parameterEntire = `${parameterKey}=7`;
    test(`http://something.edu/hello.html?${parameterEntire}`, decodeURIComponent(parameterKey), parameterEntire);
});
QUnit.test('public query parameters should be graceful', (assert)=>{
    // clear any warnings from before this test
    QueryStringMachine.warnings.length = 0;
    const screensSchema = {
        type: 'array',
        elementSchema: {
            type: 'number',
            isValidValue: Number.isInteger
        },
        defaultValue: null,
        isValidValue: function(value) {
            // screen indices cannot be duplicated
            return value === null || value.length === _.uniq(value).length;
        },
        public: true
    };
    let screens = QueryStringMachine.getForString('screens', screensSchema, '?screens=1');
    assert.ok(screens.length === 1);
    assert.ok(screens[0] === 1);
    screens = QueryStringMachine.getForString('screens', screensSchema, '?screens=1.1');
    assert.ok(QueryStringMachine.warnings.length === 1);
    assert.ok(screens === null, 'should have the default value');
    screens = QueryStringMachine.getForString('screens', screensSchema, '?screens=54890,fd');
    assert.ok(QueryStringMachine.warnings.length === 2);
    assert.ok(screens === null, 'should have the default value');
    screens = QueryStringMachine.getForString('screens', screensSchema, '?screens=1,1,1');
    assert.ok(QueryStringMachine.warnings.length === 3);
    assert.ok(screens === null, 'should have the default value');
    // should use the fallback
    screens = QueryStringMachine.getForString('screens', screensSchema, '?screens=Hello1,1,Goose1');
    assert.ok(screens === null, 'should have the default value');
    QueryStringMachine.warnings.length = 0;
    const otherScreensSchema = {
        type: 'array',
        elementSchema: {
            type: 'string',
            validValues: [
                'first',
                'notFirst'
            ]
        },
        defaultValue: null,
        isValidValue: function(value) {
            // screen indices cannot be duplicated
            return value === null || value.length === _.uniq(value).length;
        },
        public: true
    };
    screens = QueryStringMachine.getForString('screens', otherScreensSchema, '?screens=first');
    assert.ok(screens.length === 1);
    assert.ok(screens[0] === 'first');
    screens = QueryStringMachine.getForString('screens', otherScreensSchema, '?screens=first,notFirst');
    assert.ok(screens.length === 2);
    assert.ok(screens[0] === 'first');
    assert.ok(screens[1] === 'notFirst');
    screens = QueryStringMachine.getForString('screens', otherScreensSchema, '?screens=firsfdt,notFisrst');
    assert.ok(QueryStringMachine.warnings.length === 1);
    assert.ok(screens === null);
    screens = QueryStringMachine.getForString('screens', otherScreensSchema, '?screens=firsfdt,1');
    assert.ok(QueryStringMachine.warnings.length === 2);
    assert.ok(screens === null);
    QueryStringMachine.warnings.length = 0;
    const flagSchema = {
        type: 'flag',
        public: true
    };
    let flag = QueryStringMachine.getForString('flag', flagSchema, '?flag=true');
    assert.ok(flag === true);
    assert.ok(QueryStringMachine.warnings.length === 1);
    flag = QueryStringMachine.getForString('flag', flagSchema, '?flag=');
    assert.ok(flag === true);
    assert.ok(QueryStringMachine.warnings.length === 1);
    flag = QueryStringMachine.getForString('flag', flagSchema, '?hello');
    assert.ok(flag === false);
    assert.ok(QueryStringMachine.warnings.length === 1);
    QueryStringMachine.warnings.length = 0;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3F1ZXJ5LXN0cmluZy1tYWNoaW5lL2pzL1F1ZXJ5U3RyaW5nTWFjaGluZVRlc3RzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFF1ZXJ5U3RyaW5nTWFjaGluZSB0ZXN0c1xuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuXG5RVW5pdC5tb2R1bGUoICdRdWVyeVN0cmluZ01hY2hpbmUnICk7XG5cbi8vIGFzc2VydCBzaGFkb3dzIHdpbmRvdy5hc3NlcnRcblFVbml0LnRlc3QoICdiYXNpYyB0ZXN0cycsIGFzc2VydCA9PiB7XG4gIGNvbnN0IHZhbHVlID0gJ2hlbGxvJztcbiAgYXNzZXJ0LmVxdWFsKCB2YWx1ZSwgJ2hlbGxvJywgJ1dlIGV4cGVjdCB2YWx1ZSB0byBiZSBoZWxsbycgKTtcblxuICBjb25zdCBzY2hlbWFNYXAgPSB7XG4gICAgaGVpZ2h0OiB7XG4gICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogNixcbiAgICAgIHZhbGlkVmFsdWVzOiBbIDQsIDUsIDYsIDcsIDggXVxuICAgIH0sXG4gICAgbmFtZToge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0VmFsdWU6ICdMYXJyeScsXG4gICAgICBpc1ZhbGlkVmFsdWU6IGZ1bmN0aW9uKCBzdHIgKSB7XG4gICAgICAgIHJldHVybiAoIHN0ci5pbmRleE9mKCAnWicgKSAhPT0gMCApOyAvLyBOYW1lIGNhbm5vdCBzdGFydCB3aXRoICdaJ1xuICAgICAgfVxuICAgIH0sXG4gICAgY3VzdG9tOiB7XG4gICAgICB0eXBlOiAnY3VzdG9tJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogJ2FiYycsXG4gICAgICB2YWxpZFZhbHVlczogWyAnYWJjJywgJ2RlZicsICdnaGknIF0sXG4gICAgICBwYXJzZTogZnVuY3Rpb24oIHN0cmluZyApIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy50b0xvd2VyQ2FzZSgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgaXNXZWJHTDoge1xuICAgICAgdHlwZTogJ2ZsYWcnXG4gICAgfSxcbiAgICBzY3JlZW5zOiB7XG4gICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgZGVmYXVsdFZhbHVlOiBbXSxcbiAgICAgIGVsZW1lbnRTY2hlbWE6IHtcbiAgICAgICAgdHlwZTogJ251bWJlcidcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbG9yczoge1xuICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogWyAncmVkJywgJ2dyZWVuJywgJ2JsdWUnIF0sXG4gICAgICBlbGVtZW50U2NoZW1hOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGFzc2VydC5kZWVwRXF1YWwoIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRBbGxGb3JTdHJpbmcoIHNjaGVtYU1hcCwgJycgKSwge1xuICAgIGhlaWdodDogNixcbiAgICBuYW1lOiAnTGFycnknLFxuICAgIGN1c3RvbTogJ2FiYycsXG4gICAgaXNXZWJHTDogZmFsc2UsXG4gICAgc2NyZWVuczogW10sXG4gICAgY29sb3JzOiBbICdyZWQnLCAnZ3JlZW4nLCAnYmx1ZScgXVxuICB9LCAnQSBibGFuayBxdWVyeSBzdHJpbmcgc2hvdWxkIHByb3ZpZGUgZGVmYXVsdHMnICk7XG5cbiAgYXNzZXJ0LmRlZXBFcXVhbCggUXVlcnlTdHJpbmdNYWNoaW5lLmdldEFsbEZvclN0cmluZyggc2NoZW1hTWFwLCAnP2hlaWdodD03JmlzV2ViR0wnICksIHtcbiAgICBoZWlnaHQ6IDcsXG4gICAgbmFtZTogJ0xhcnJ5JyxcbiAgICBjdXN0b206ICdhYmMnLFxuICAgIGlzV2ViR0w6IHRydWUsXG4gICAgc2NyZWVuczogW10sXG4gICAgY29sb3JzOiBbICdyZWQnLCAnZ3JlZW4nLCAnYmx1ZScgXVxuICB9LCAnUXVlcnkgcGFyYW1ldGVyIHZhbHVlcyBzaG91bGQgYmUgcGFyc2VkJyApO1xuXG4gIGFzc2VydC5kZWVwRXF1YWwoIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRBbGxGb3JTdHJpbmcoIHNjaGVtYU1hcCwgJz9zY3JlZW5zPScgKSwge1xuICAgIGhlaWdodDogNixcbiAgICBuYW1lOiAnTGFycnknLFxuICAgIGN1c3RvbTogJ2FiYycsXG4gICAgaXNXZWJHTDogZmFsc2UsXG4gICAgc2NyZWVuczogW10sXG4gICAgY29sb3JzOiBbICdyZWQnLCAnZ3JlZW4nLCAnYmx1ZScgXVxuICB9LCAnTm8gdmFsdWUgZm9yIHNjcmVlbnMgc2hvdWxkIHJlc3VsdCBpbiBhbiBlbXB0eSBhcnJheSAnICk7XG5cbiAgYXNzZXJ0LmRlZXBFcXVhbCggUXVlcnlTdHJpbmdNYWNoaW5lLmdldEFsbEZvclN0cmluZyggc2NoZW1hTWFwLCAnP2hlaWdodD03JmlzV2ViR0wmY3VzdG9tPURFRicgKSwge1xuICAgIGhlaWdodDogNyxcbiAgICBuYW1lOiAnTGFycnknLFxuICAgIGN1c3RvbTogJ2RlZicsXG4gICAgaXNXZWJHTDogdHJ1ZSxcbiAgICBzY3JlZW5zOiBbXSxcbiAgICBjb2xvcnM6IFsgJ3JlZCcsICdncmVlbicsICdibHVlJyBdXG4gIH0sICdDdXN0b20gcXVlcnkgcGFyYW1ldGVyIHNob3VsZCBiZSBzdXBwb3J0ZWQnICk7XG5cbiAgYXNzZXJ0LmRlZXBFcXVhbCggUXVlcnlTdHJpbmdNYWNoaW5lLmdldEFsbEZvclN0cmluZyggc2NoZW1hTWFwLCAnP2lzV2ViR0wmc2NyZWVucz0xLDIsMyw1JmNvbG9ycz15ZWxsb3csb3JhbmdlLHBpbmsnICksIHtcbiAgICBoZWlnaHQ6IDYsXG4gICAgbmFtZTogJ0xhcnJ5JyxcbiAgICBjdXN0b206ICdhYmMnLFxuICAgIGlzV2ViR0w6IHRydWUsXG4gICAgc2NyZWVuczogWyAxLCAyLCAzLCA1IF0sXG4gICAgY29sb3JzOiBbICd5ZWxsb3cnLCAnb3JhbmdlJywgJ3BpbmsnIF1cbiAgfSwgJ0FycmF5IHNob3VsZCBiZSBwYXJzZWQnICk7XG5cbiAgY29uc3QgZmxhZ1NjaGVtYSA9IHtcbiAgICBmbGFnOiB7XG4gICAgICB0eXBlOiAnZmxhZydcbiAgICB9XG4gIH07XG4gIGFzc2VydC5kZWVwRXF1YWwoIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRBbGxGb3JTdHJpbmcoIGZsYWdTY2hlbWEsICc/ZmxhZycgKSwge1xuICAgIGZsYWc6IHRydWVcbiAgfSwgJ0ZsYWcgd2FzIHByb3ZpZGVkJyApO1xuXG4gIGFzc2VydC5kZWVwRXF1YWwoIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRBbGxGb3JTdHJpbmcoIGZsYWdTY2hlbWEsICc/ZmxhZz0nICksIHtcbiAgICBmbGFnOiB0cnVlXG4gIH0sICdGbGFnIHdhcyBwcm92aWRlZCB3aXRoIG5vIHZhbHVlJyApO1xuXG4gIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0QWxsRm9yU3RyaW5nKCBmbGFnU2NoZW1hLCAnP2ZsYWc9aGVsbG8nICk7XG4gIH0sICdGbGFncyBjYW5ub3QgaGF2ZSB2YWx1ZXMnICk7XG5cbiAgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRBbGxGb3JTdHJpbmcoIGZsYWdTY2hlbWEsICc/ZmxhZz10cnVlJyApO1xuICB9LCAnRmxhZ3MgY2Fubm90IGhhdmUgdmFsdWVzJyApO1xuXG4gIC8vIFRlc3QgdGhhdCBpc1ZhbGlkVmFsdWUgaXMgc3VwcG9ydGVkIGZvciBhcnJheXMgd2l0aCBhIGNvbnRyaXZlZCBjaGVjayAoZWxlbWVudCBzdW0gPT0gNykuXG4gIC8vIFdpdGggYW4gaW5wdXQgb2YgWzIsNCwwXSwgUVNNIHNob3VsZCB0aHJvdyBhbiBlcnJvciwgYW5kIGl0IHNob3VsZCBiZSBjYXVnaHQgaGVyZS5cbiAgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRBbGxGb3JTdHJpbmcoIHtcbiAgICAgIG51bWJlcnM6IHtcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgZWxlbWVudFNjaGVtYToge1xuICAgICAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgICAgIH0sXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogWyAxLCA2LCAwIF0sXG4gICAgICAgIGlzVmFsaWRWYWx1ZTogZnVuY3Rpb24oIGFyciApIHtcbiAgICAgICAgICAvLyBGYWtlIHRlc3Q6IGNoZWNrIHRoYXQgZWxlbWVudHMgc3VtIHRvIDcgZm9yIHBoZXRzaW1zL3F1ZXJ5LXN0cmluZy1tYWNoaW5lIzExXG4gICAgICAgICAgY29uc3QgYXJyYXlTdW0gPSBhcnIucmVkdWNlKCAoIGEsIGIgKSA9PiBhICsgYiwgMCApO1xuICAgICAgICAgIHJldHVybiAoIGFycmF5U3VtID09PSA3ICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCAnP251bWJlcnM9Miw0LDAnICk7XG4gIH0sICdBcnJheSBlcnJvciBoYW5kbGluZyBzaG91bGQgY2F0Y2ggZXhjZXB0aW9uJyApO1xuXG4gIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0QWxsRm9yU3RyaW5nKCB7XG4gICAgICBzaW06IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIH1cbiAgICB9LCAnP2VhJmhlbGxvPXRydWUnICk7XG5cbiAgfSwgJ0NhdGNoIG1pc3NpbmcgcmVxdWlyZWQgcXVlcnkgcGFyYW1ldGVyJyApO1xuXG4gIGFzc2VydC5kZWVwRXF1YWwoIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRGb3JTdHJpbmcoICdoZWxsbycsIHtcbiAgICB0eXBlOiAnYXJyYXknLFxuICAgIGVsZW1lbnRTY2hlbWE6IHtcbiAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgfSxcbiAgICB2YWxpZFZhbHVlczogW1xuICAgICAgWyAxLCAyIF0sIFsgMywgNCBdLCBbIDEsIDIsIDMgXVxuICAgIF0sXG4gICAgZGVmYXVsdFZhbHVlOiBbIDEsIDIgXVxuICB9LCAnP2VhJmhlbGxvPTEsMiwzJyApLCBbIDEsIDIsIDMgXSwgJ0FycmF5cyBzaG91bGQgc3VwcG9ydCBkZWZhdWx0VmFsdWUgYW5kIHZhbGlkVmFsdWVzJyApO1xuXG4gIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0Rm9yU3RyaW5nKCAnaGVsbG8nLCB7XG4gICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgZWxlbWVudFNjaGVtYToge1xuICAgICAgICB0eXBlOiAnbnVtYmVyJ1xuICAgICAgfSxcbiAgICAgIHZhbGlkVmFsdWVzOiBbXG4gICAgICAgIFsgMSwgMiBdLCBbIDMsIDQgXSwgWyAxLCAyLCAzIF1cbiAgICAgIF0sXG4gICAgICBkZWZhdWx0VmFsdWU6IFsgMSwgMiBdXG4gICAgfSwgJz9lYSZoZWxsbz0xLDIsMyw5OScgKTtcbiAgfSwgJ0NhdGNoIGludmFsaWQgdmFsdWUgZm9yIGFycmF5JyApO1xuXG4gIGFzc2VydC5kZWVwRXF1YWwoIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRGb3JTdHJpbmcoICdzY3JlZW5zJywge1xuICAgIHR5cGU6ICdhcnJheScsXG4gICAgZWxlbWVudFNjaGVtYToge1xuICAgICAgdHlwZTogJ251bWJlcidcbiAgICB9LFxuICAgIGRlZmF1bHRWYWx1ZTogbnVsbFxuICB9LCAnP3NjcmVlbnM9MSwyLDMnICksIFsgMSwgMiwgMyBdLCAnVGVzdCBhcnJheSBvZiBudW1iZXJzJyApO1xuXG59ICk7XG5cbi8vIFRlc3RzIGZvciBvdXIgb3duIGRlZXBFcXVhbHMgbWV0aG9kXG5RVW5pdC50ZXN0KCAnZGVlcEVxdWFscycsIGFzc2VydCA9PiB7XG4gIGFzc2VydC5lcXVhbCggUXVlcnlTdHJpbmdNYWNoaW5lLmRlZXBFcXVhbHMoIDcsIDcgKSwgdHJ1ZSwgJzcgc2hvdWxkIGVxdWFsIGl0c2VsZicgKTtcbiAgYXNzZXJ0LmVxdWFsKCBRdWVyeVN0cmluZ01hY2hpbmUuZGVlcEVxdWFscyggNywgOCApLCBmYWxzZSwgJzcgc2hvdWxkIG5vdCBlcXVhbCA4JyApO1xuICBhc3NlcnQuZXF1YWwoIFF1ZXJ5U3RyaW5nTWFjaGluZS5kZWVwRXF1YWxzKCA3LCAnNycgKSwgZmFsc2UsICc3IHNob3VsZCBub3QgZXF1YWwgXCI3XCInICk7XG4gIGFzc2VydC5lcXVhbCggUXVlcnlTdHJpbmdNYWNoaW5lLmRlZXBFcXVhbHMoIHsgMDogJ0EnIH0sICdBJyApLCBmYWxzZSwgJ3N0cmluZyB0ZXN0cycgKTtcbiAgYXNzZXJ0LmVxdWFsKCBRdWVyeVN0cmluZ01hY2hpbmUuZGVlcEVxdWFscyggWyAnaGVsbG8nLCA3IF0sIFsgJ2hlbGxvJywgNyBdICksIHRydWUsICdhcnJheSBlcXVhbGl0eSB0ZXN0JyApO1xuICBhc3NlcnQuZXF1YWwoIFF1ZXJ5U3RyaW5nTWFjaGluZS5kZWVwRXF1YWxzKCBbICdoZWxsbycsIDcgXSwgWyAnaGVsbG8nLCAnNycgXSApLCBmYWxzZSwgJ2FycmF5IGluZXF1YWxpdHkgdGVzdCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBRdWVyeVN0cmluZ01hY2hpbmUuZGVlcEVxdWFscyggWyAnaGVsbG8nLCB7IGhlbGxvOiB0cnVlIH0gXSwgWyAnaGVsbG8nLCB7IGhlbGxvOiB0cnVlIH0gXSApLCB0cnVlLCAnb2JqZWN0IGluIGFycmF5IGluZXF1YWxpdHkgdGVzdCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBRdWVyeVN0cmluZ01hY2hpbmUuZGVlcEVxdWFscyggWyAnaGVsbG8nLCB7IGhlbGxvOiB0cnVlIH0gXSwgWyAnaGVsbG8nLCB7IGhlbGxvOiBmYWxzZSB9IF0gKSwgZmFsc2UsICdvYmplY3QgaW4gYXJyYXkgIGluZXF1YWxpdHkgdGVzdCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBRdWVyeVN0cmluZ01hY2hpbmUuZGVlcEVxdWFscyggeyB4OiBbIHsgeTogJ2hlbGxvJyB9LCB0cnVlLCAxMjMsICd4JyBdIH0sIHsgeDogWyB7IHk6ICdoZWxsbycgfSwgdHJ1ZSwgMTIzLCAneCcgXSB9ICksIHRydWUsICdvYmplY3QgaW4gYXJyYXkgIGluZXF1YWxpdHkgdGVzdCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBRdWVyeVN0cmluZ01hY2hpbmUuZGVlcEVxdWFscyggeyB4OiBbIHsgeTogJ2hlbGxvJyB9LCB0cnVlLCAxMjMsICd4JyBdIH0sIHsgeDogWyB0cnVlLCB7IHk6ICdoZWxsbycgfSwgdHJ1ZSwgMTIzLCAneCcgXSB9ICksIGZhbHNlLCAnb2JqZWN0IGluIGFycmF5ICBpbmVxdWFsaXR5IHRlc3QnICk7XG4gIGFzc2VydC5lcXVhbCggUXVlcnlTdHJpbmdNYWNoaW5lLmRlZXBFcXVhbHMoIHsgeDogWyB7IHk6ICdoZWxsbycgfSwgdHJ1ZSwgMTIzLCAneCcgXSB9LCB7IHk6IFsgeyB5OiAnaGVsbG8nIH0sIHRydWUsIDEyMywgJ3gnIF0gfSApLCBmYWxzZSwgJ29iamVjdCBpbiBhcnJheSAgaW5lcXVhbGl0eSB0ZXN0JyApO1xuICBhc3NlcnQuZXF1YWwoIFF1ZXJ5U3RyaW5nTWFjaGluZS5kZWVwRXF1YWxzKCBudWxsLCBudWxsICksIHRydWUsICdudWxsIG51bGwnICk7XG4gIGFzc2VydC5lcXVhbCggUXVlcnlTdHJpbmdNYWNoaW5lLmRlZXBFcXVhbHMoIG51bGwsIHVuZGVmaW5lZCApLCBmYWxzZSwgJ251bGwgdW5kZWZpbmVkJyApO1xuICBhc3NlcnQuZXF1YWwoIFF1ZXJ5U3RyaW5nTWFjaGluZS5kZWVwRXF1YWxzKCB1bmRlZmluZWQsIHVuZGVmaW5lZCApLCB0cnVlLCAndW5kZWZpbmVkIHVuZGVmaW5lZCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBRdWVyeVN0cmluZ01hY2hpbmUuZGVlcEVxdWFscyggKCkgPT4ge30sICgpID0+IHt9ICksIGZhbHNlLCAnZGlmZmVyZW50IGltcGxlbWVudGF0aW9ucyBvZiBzaW1pbGFyIGZ1bmN0aW9ucycgKTtcbiAgY29uc3QgZiA9IGZ1bmN0aW9uKCkge307XG4gIGFzc2VydC5lcXVhbCggUXVlcnlTdHJpbmdNYWNoaW5lLmRlZXBFcXVhbHMoIGYsIGYgKSwgdHJ1ZSwgJ3NhbWUgcmVmZXJlbmNlIGZ1bmN0aW9uJyApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAncmVtb3ZlS2V5VmFsdWVQYWlyJywgYXNzZXJ0ID0+IHtcbiAgYXNzZXJ0LmVxdWFsKCBRdWVyeVN0cmluZ01hY2hpbmUucmVtb3ZlS2V5VmFsdWVQYWlyKCAnP3RpbWU9bm93JywgJ3RpbWUnICksICcnLCAnUmVtb3ZlIHNpbmdsZSBvY2N1cnJlbmNlJyApO1xuICBhc3NlcnQuZXF1YWwoIFF1ZXJ5U3RyaW5nTWFjaGluZS5yZW1vdmVLZXlWYWx1ZVBhaXIoICc/dGltZT1ub3cmcGxhY2U9aGVyZScsICd0aW1lJyApLCAnP3BsYWNlPWhlcmUnLCAnUmVtb3ZlIHNpbmdsZSBvY2N1cnJlbmNlIGJ1dCBsZWF2ZSBvdGhlcicgKTtcbiAgYXNzZXJ0LmVxdWFsKCBRdWVyeVN0cmluZ01hY2hpbmUucmVtb3ZlS2V5VmFsdWVQYWlyKCAnP3RpbWU9bm93JnRpbWU9bGF0ZXInLCAndGltZScgKSwgJycsICdSZW1vdmUgbXVsdGlwbGUgb2NjdXJyZW5jZXMnICk7XG4gIGFzc2VydC5lcXVhbCggUXVlcnlTdHJpbmdNYWNoaW5lLnJlbW92ZUtleVZhbHVlUGFpciggJz90aW1lPW5vdyZ0aW1lJywgJ3RpbWUnICksICcnLCAnUmVtb3ZlIG11bHRpcGxlIG9jY3VycmVuY2VzLCBvbmUgd2l0aCB2YWx1ZScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBRdWVyeVN0cmluZ01hY2hpbmUucmVtb3ZlS2V5VmFsdWVQYWlyKCAnP3BsYWNlPWhlcmUmdGltZT1ub3cnLCAndGltZScgKSwgJz9wbGFjZT1oZXJlJywgJ0RpZmZlcmVudCBvcmRlcicgKTtcbiAgYXNzZXJ0LmVxdWFsKCBRdWVyeVN0cmluZ01hY2hpbmUucmVtb3ZlS2V5VmFsdWVQYWlyKCAnP3RpbWUmcGxhY2UnLCAndGltZScgKSwgJz9wbGFjZScsICdSZW1vdmUgd2l0aCBubyB2YWx1ZXMnICk7XG4gIGFzc2VydC5lcXVhbCggUXVlcnlTdHJpbmdNYWNoaW5lLnJlbW92ZUtleVZhbHVlUGFpciggJz9wbGFjZSZ0aW1lJywgJ3RpbWUnICksICc/cGxhY2UnLCAnUmVtb3ZlIHdpdGggbm8gdmFsdWVzJyApO1xuICBhc3NlcnQuZXF1YWwoIFF1ZXJ5U3RyaW5nTWFjaGluZS5yZW1vdmVLZXlWYWx1ZVBhaXIoICc/cGxhY2UmdGltZScsICd0aW1lcycgKSwgJz9wbGFjZSZ0aW1lJywgJ0tleSB0byByZW1vdmUgbm90IHByZXNlbnQnICk7XG4gIGFzc2VydC5lcXVhbCggUXVlcnlTdHJpbmdNYWNoaW5lLnJlbW92ZUtleVZhbHVlUGFpciggJz9zaW09b2htcy1sYXcmcGhldGlvVmFsaWRhdGlvbiZwaGV0aW9EZWJ1Zz10cnVlJywgJ2Z1enonICksXG4gICAgJz9zaW09b2htcy1sYXcmcGhldGlvVmFsaWRhdGlvbiZwaGV0aW9EZWJ1Zz10cnVlJywgJ0tleSB0byByZW1vdmUgbm90IHByZXNlbnQnICk7XG4gIGFzc2VydC5lcXVhbCggUXVlcnlTdHJpbmdNYWNoaW5lLnJlbW92ZUtleVZhbHVlUGFpciggJycsICdmdXp6JyApLFxuICAgICcnLCAnTm8gc2VhcmNoIHByZXNlbnQnICk7XG5cbiAgaWYgKCB3aW5kb3cuYXNzZXJ0ICkge1xuICAgIGFzc2VydC50aHJvd3MoICgpID0+IFF1ZXJ5U3RyaW5nTWFjaGluZS5yZW1vdmVLZXlWYWx1ZVBhaXIoICd0aW1lPW5vdycsICd0aW1lJyApLCAnTm90IHJlbW92ZWQgaWYgdGhlcmUgaXMgbm8gcXVlc3Rpb24gbWFyaycgKTtcbiAgfVxuXG59ICk7XG5cblFVbml0LnRlc3QoICdhcHBlbmRRdWVyeVN0cmluZycsIGFzc2VydCA9PiB7XG5cbiAgY29uc3QgdGVzdCA9IGZ1bmN0aW9uKCB1cmwsIHF1ZXJ5UGFyYW1ldGVycywgZXhwZWN0ZWQgKSB7XG4gICAgYXNzZXJ0LmVxdWFsKCBRdWVyeVN0cmluZ01hY2hpbmUuYXBwZW5kUXVlcnlTdHJpbmcoIHVybCwgcXVlcnlQYXJhbWV0ZXJzICksIGV4cGVjdGVkLCBgJHt1cmx9ICsgJHtxdWVyeVBhcmFtZXRlcnN9IHNob3VsZCBiZSBva2AgKTtcbiAgfTtcblxuICB0ZXN0KCAnaHR0cDovL2xvY2FsaG9zdC5jb20vaGVsbG8uaHRtbCcsICcnLCAnaHR0cDovL2xvY2FsaG9zdC5jb20vaGVsbG8uaHRtbCcgKTtcbiAgdGVzdCggJ2h0dHA6Ly9sb2NhbGhvc3QuY29tL2hlbGxvLmh0bWw/aGknLCAnJywgJ2h0dHA6Ly9sb2NhbGhvc3QuY29tL2hlbGxvLmh0bWw/aGknICk7XG4gIHRlc3QoICdodHRwOi8vbG9jYWxob3N0LmNvbS9oZWxsby5odG1sJywgJz90ZXN0JywgJ2h0dHA6Ly9sb2NhbGhvc3QuY29tL2hlbGxvLmh0bWw/dGVzdCcgKTtcbiAgdGVzdCggJ2h0dHA6Ly9sb2NhbGhvc3QuY29tL2hlbGxvLmh0bWwnLCAnJnRlc3QnLCAnaHR0cDovL2xvY2FsaG9zdC5jb20vaGVsbG8uaHRtbD90ZXN0JyApO1xuICB0ZXN0KCAnaHR0cDovL2xvY2FsaG9zdC5jb20vaGVsbG8uaHRtbD9hYmMnLCAnJywgJ2h0dHA6Ly9sb2NhbGhvc3QuY29tL2hlbGxvLmh0bWw/YWJjJyApO1xuICB0ZXN0KCAnaHR0cDovL2xvY2FsaG9zdC5jb20vaGVsbG8uaHRtbD9hYmMnLCAnPzEyMycsICdodHRwOi8vbG9jYWxob3N0LmNvbS9oZWxsby5odG1sP2FiYyYxMjMnICk7XG4gIHRlc3QoICdodHRwOi8vbG9jYWxob3N0LmNvbS9oZWxsby5odG1sP2FiYycsICcmMTIzJywgJ2h0dHA6Ly9sb2NhbGhvc3QuY29tL2hlbGxvLmh0bWw/YWJjJjEyMycgKTtcbiAgdGVzdCggJz9hYmMnLCAnJjEyMycsICc/YWJjJjEyMycgKTtcbiAgdGVzdCggJz9hYmMnLCAnMTIzJywgJz9hYmMmMTIzJyApO1xuICB0ZXN0KCAnP2FiYycsICcxMjMmaGknLCAnP2FiYyYxMjMmaGknICk7XG4gIHRlc3QoICc/JywgJ2FiYyYxMjMmaGknLCAnPyZhYmMmMTIzJmhpJyApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnZ2V0U2luZ2xlUXVlcnlQYXJhbWV0ZXJTdHJpbmcnLCBhc3NlcnQgPT4ge1xuXG4gIGNvbnN0IHRlc3QgPSBmdW5jdGlvbiggdXJsLCBrZXksIGV4cGVjdGVkICkge1xuICAgIGFzc2VydC5lcXVhbCggUXVlcnlTdHJpbmdNYWNoaW5lLmdldFNpbmdsZVF1ZXJ5UGFyYW1ldGVyU3RyaW5nKCBrZXksIHVybCApLCBleHBlY3RlZCwgYCR7dXJsfSArICR7a2V5fSBzaG91bGQgYmUgZXF1YWxgICk7XG4gIH07XG5cbiAgdGVzdCggJ2h0dHA6Ly9waGV0LmNvbG9yYWRvLmNvbS9oZWxsby5odG1sP3Rlc3QnLCAndGVzdCcsICd0ZXN0JyApO1xuICB0ZXN0KCAnaHR0cDovL3BoZXQuY29sb3JhZG8uY29tL2hlbGxvLmh0bWw/dGVzdD1oaScsICd0ZXN0JywgJ3Rlc3Q9aGknICk7XG4gIHRlc3QoICdodHRwOi8vcGhldC5jb2xvcmFkby5jb20vaGVsbG8uaHRtbD9oaSZ0ZXN0PWhpJywgJ3Rlc3QnLCAndGVzdD1oaScgKTtcbiAgdGVzdCggJz9oaSZ0ZXN0PWhpLDQsMywlMjAzJywgJ3Rlc3QnLCAndGVzdD1oaSw0LDMsJTIwMycgKTtcblxuICBjb25zdCBwYXJhbWV0ZXJLZXkgPSBlbmNvZGVVUklDb21wb25lbnQoICdqZjQyMzg1OTcwNDMqJCglJCooKSMlJiojKF5fKCYnICk7XG4gIGNvbnN0IHBhcmFtZXRlckVudGlyZSA9IGAke3BhcmFtZXRlcktleX09N2A7XG5cbiAgdGVzdCggYGh0dHA6Ly9zb21ldGhpbmcuZWR1L2hlbGxvLmh0bWw/JHtwYXJhbWV0ZXJFbnRpcmV9YCwgZGVjb2RlVVJJQ29tcG9uZW50KCBwYXJhbWV0ZXJLZXkgKSwgcGFyYW1ldGVyRW50aXJlICk7XG59ICk7XG5RVW5pdC50ZXN0KCAncHVibGljIHF1ZXJ5IHBhcmFtZXRlcnMgc2hvdWxkIGJlIGdyYWNlZnVsJywgYXNzZXJ0ID0+IHtcblxuICAvLyBjbGVhciBhbnkgd2FybmluZ3MgZnJvbSBiZWZvcmUgdGhpcyB0ZXN0XG4gIFF1ZXJ5U3RyaW5nTWFjaGluZS53YXJuaW5ncy5sZW5ndGggPSAwO1xuXG4gIGNvbnN0IHNjcmVlbnNTY2hlbWEgPSB7XG4gICAgdHlwZTogJ2FycmF5JyxcbiAgICBlbGVtZW50U2NoZW1hOiB7XG4gICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgIGlzVmFsaWRWYWx1ZTogTnVtYmVyLmlzSW50ZWdlclxuICAgIH0sXG4gICAgZGVmYXVsdFZhbHVlOiBudWxsLFxuICAgIGlzVmFsaWRWYWx1ZTogZnVuY3Rpb24oIHZhbHVlICkge1xuXG4gICAgICAvLyBzY3JlZW4gaW5kaWNlcyBjYW5ub3QgYmUgZHVwbGljYXRlZFxuICAgICAgcmV0dXJuIHZhbHVlID09PSBudWxsIHx8ICggdmFsdWUubGVuZ3RoID09PSBfLnVuaXEoIHZhbHVlICkubGVuZ3RoICk7XG4gICAgfSxcbiAgICBwdWJsaWM6IHRydWVcbiAgfTtcblxuICBsZXQgc2NyZWVucyA9IFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRGb3JTdHJpbmcoICdzY3JlZW5zJywgc2NyZWVuc1NjaGVtYSwgJz9zY3JlZW5zPTEnICk7XG4gIGFzc2VydC5vayggc2NyZWVucy5sZW5ndGggPT09IDEgKTtcbiAgYXNzZXJ0Lm9rKCBzY3JlZW5zWyAwIF0gPT09IDEgKTtcblxuICBzY3JlZW5zID0gUXVlcnlTdHJpbmdNYWNoaW5lLmdldEZvclN0cmluZyggJ3NjcmVlbnMnLCBzY3JlZW5zU2NoZW1hLCAnP3NjcmVlbnM9MS4xJyApO1xuICBhc3NlcnQub2soIFF1ZXJ5U3RyaW5nTWFjaGluZS53YXJuaW5ncy5sZW5ndGggPT09IDEgKTtcbiAgYXNzZXJ0Lm9rKCBzY3JlZW5zID09PSBudWxsLCAnc2hvdWxkIGhhdmUgdGhlIGRlZmF1bHQgdmFsdWUnICk7XG4gIHNjcmVlbnMgPSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0Rm9yU3RyaW5nKCAnc2NyZWVucycsIHNjcmVlbnNTY2hlbWEsICc/c2NyZWVucz01NDg5MCxmZCcgKTtcbiAgYXNzZXJ0Lm9rKCBRdWVyeVN0cmluZ01hY2hpbmUud2FybmluZ3MubGVuZ3RoID09PSAyICk7XG4gIGFzc2VydC5vayggc2NyZWVucyA9PT0gbnVsbCwgJ3Nob3VsZCBoYXZlIHRoZSBkZWZhdWx0IHZhbHVlJyApO1xuXG4gIHNjcmVlbnMgPSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0Rm9yU3RyaW5nKCAnc2NyZWVucycsIHNjcmVlbnNTY2hlbWEsICc/c2NyZWVucz0xLDEsMScgKTtcbiAgYXNzZXJ0Lm9rKCBRdWVyeVN0cmluZ01hY2hpbmUud2FybmluZ3MubGVuZ3RoID09PSAzICk7XG4gIGFzc2VydC5vayggc2NyZWVucyA9PT0gbnVsbCwgJ3Nob3VsZCBoYXZlIHRoZSBkZWZhdWx0IHZhbHVlJyApO1xuXG4gIC8vIHNob3VsZCB1c2UgdGhlIGZhbGxiYWNrXG4gIHNjcmVlbnMgPSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0Rm9yU3RyaW5nKCAnc2NyZWVucycsIHNjcmVlbnNTY2hlbWEsICc/c2NyZWVucz1IZWxsbzEsMSxHb29zZTEnICk7XG4gIGFzc2VydC5vayggc2NyZWVucyA9PT0gbnVsbCwgJ3Nob3VsZCBoYXZlIHRoZSBkZWZhdWx0IHZhbHVlJyApO1xuXG4gIFF1ZXJ5U3RyaW5nTWFjaGluZS53YXJuaW5ncy5sZW5ndGggPSAwO1xuXG4gIGNvbnN0IG90aGVyU2NyZWVuc1NjaGVtYSA9IHtcbiAgICB0eXBlOiAnYXJyYXknLFxuICAgIGVsZW1lbnRTY2hlbWE6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgdmFsaWRWYWx1ZXM6IFsgJ2ZpcnN0JywgJ25vdEZpcnN0JyBdXG4gICAgfSxcbiAgICBkZWZhdWx0VmFsdWU6IG51bGwsXG4gICAgaXNWYWxpZFZhbHVlOiBmdW5jdGlvbiggdmFsdWUgKSB7XG5cbiAgICAgIC8vIHNjcmVlbiBpbmRpY2VzIGNhbm5vdCBiZSBkdXBsaWNhdGVkXG4gICAgICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgKCB2YWx1ZS5sZW5ndGggPT09IF8udW5pcSggdmFsdWUgKS5sZW5ndGggKTtcbiAgICB9LFxuICAgIHB1YmxpYzogdHJ1ZVxuICB9O1xuICBzY3JlZW5zID0gUXVlcnlTdHJpbmdNYWNoaW5lLmdldEZvclN0cmluZyggJ3NjcmVlbnMnLCBvdGhlclNjcmVlbnNTY2hlbWEsICc/c2NyZWVucz1maXJzdCcgKTtcbiAgYXNzZXJ0Lm9rKCBzY3JlZW5zLmxlbmd0aCA9PT0gMSApO1xuICBhc3NlcnQub2soIHNjcmVlbnNbIDAgXSA9PT0gJ2ZpcnN0JyApO1xuXG4gIHNjcmVlbnMgPSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0Rm9yU3RyaW5nKCAnc2NyZWVucycsIG90aGVyU2NyZWVuc1NjaGVtYSwgJz9zY3JlZW5zPWZpcnN0LG5vdEZpcnN0JyApO1xuICBhc3NlcnQub2soIHNjcmVlbnMubGVuZ3RoID09PSAyICk7XG4gIGFzc2VydC5vayggc2NyZWVuc1sgMCBdID09PSAnZmlyc3QnICk7XG4gIGFzc2VydC5vayggc2NyZWVuc1sgMSBdID09PSAnbm90Rmlyc3QnICk7XG5cbiAgc2NyZWVucyA9IFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRGb3JTdHJpbmcoICdzY3JlZW5zJywgb3RoZXJTY3JlZW5zU2NoZW1hLCAnP3NjcmVlbnM9Zmlyc2ZkdCxub3RGaXNyc3QnICk7XG4gIGFzc2VydC5vayggUXVlcnlTdHJpbmdNYWNoaW5lLndhcm5pbmdzLmxlbmd0aCA9PT0gMSApO1xuICBhc3NlcnQub2soIHNjcmVlbnMgPT09IG51bGwgKTtcblxuICBzY3JlZW5zID0gUXVlcnlTdHJpbmdNYWNoaW5lLmdldEZvclN0cmluZyggJ3NjcmVlbnMnLCBvdGhlclNjcmVlbnNTY2hlbWEsICc/c2NyZWVucz1maXJzZmR0LDEnICk7XG4gIGFzc2VydC5vayggUXVlcnlTdHJpbmdNYWNoaW5lLndhcm5pbmdzLmxlbmd0aCA9PT0gMiApO1xuICBhc3NlcnQub2soIHNjcmVlbnMgPT09IG51bGwgKTtcblxuICBRdWVyeVN0cmluZ01hY2hpbmUud2FybmluZ3MubGVuZ3RoID0gMDtcblxuICBjb25zdCBmbGFnU2NoZW1hID0ge1xuICAgIHR5cGU6ICdmbGFnJyxcbiAgICBwdWJsaWM6IHRydWVcbiAgfTtcblxuICBsZXQgZmxhZyA9IFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRGb3JTdHJpbmcoICdmbGFnJywgZmxhZ1NjaGVtYSwgJz9mbGFnPXRydWUnICk7XG4gIGFzc2VydC5vayggZmxhZyA9PT0gdHJ1ZSApO1xuICBhc3NlcnQub2soIFF1ZXJ5U3RyaW5nTWFjaGluZS53YXJuaW5ncy5sZW5ndGggPT09IDEgKTtcblxuICBmbGFnID0gUXVlcnlTdHJpbmdNYWNoaW5lLmdldEZvclN0cmluZyggJ2ZsYWcnLCBmbGFnU2NoZW1hLCAnP2ZsYWc9JyApO1xuICBhc3NlcnQub2soIGZsYWcgPT09IHRydWUgKTtcbiAgYXNzZXJ0Lm9rKCBRdWVyeVN0cmluZ01hY2hpbmUud2FybmluZ3MubGVuZ3RoID09PSAxICk7XG5cbiAgZmxhZyA9IFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRGb3JTdHJpbmcoICdmbGFnJywgZmxhZ1NjaGVtYSwgJz9oZWxsbycgKTtcbiAgYXNzZXJ0Lm9rKCBmbGFnID09PSBmYWxzZSApO1xuICBhc3NlcnQub2soIFF1ZXJ5U3RyaW5nTWFjaGluZS53YXJuaW5ncy5sZW5ndGggPT09IDEgKTtcblxuICBRdWVyeVN0cmluZ01hY2hpbmUud2FybmluZ3MubGVuZ3RoID0gMDtcbn0gKTsiXSwibmFtZXMiOlsiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0IiwidmFsdWUiLCJlcXVhbCIsInNjaGVtYU1hcCIsImhlaWdodCIsInR5cGUiLCJkZWZhdWx0VmFsdWUiLCJ2YWxpZFZhbHVlcyIsIm5hbWUiLCJpc1ZhbGlkVmFsdWUiLCJzdHIiLCJpbmRleE9mIiwiY3VzdG9tIiwicGFyc2UiLCJzdHJpbmciLCJ0b0xvd2VyQ2FzZSIsImlzV2ViR0wiLCJzY3JlZW5zIiwiZWxlbWVudFNjaGVtYSIsImNvbG9ycyIsImRlZXBFcXVhbCIsIlF1ZXJ5U3RyaW5nTWFjaGluZSIsImdldEFsbEZvclN0cmluZyIsImZsYWdTY2hlbWEiLCJmbGFnIiwidGhyb3dzIiwibnVtYmVycyIsImFyciIsImFycmF5U3VtIiwicmVkdWNlIiwiYSIsImIiLCJzaW0iLCJnZXRGb3JTdHJpbmciLCJkZWVwRXF1YWxzIiwiaGVsbG8iLCJ4IiwieSIsInVuZGVmaW5lZCIsImYiLCJyZW1vdmVLZXlWYWx1ZVBhaXIiLCJ3aW5kb3ciLCJ1cmwiLCJxdWVyeVBhcmFtZXRlcnMiLCJleHBlY3RlZCIsImFwcGVuZFF1ZXJ5U3RyaW5nIiwia2V5IiwiZ2V0U2luZ2xlUXVlcnlQYXJhbWV0ZXJTdHJpbmciLCJwYXJhbWV0ZXJLZXkiLCJlbmNvZGVVUklDb21wb25lbnQiLCJwYXJhbWV0ZXJFbnRpcmUiLCJkZWNvZGVVUklDb21wb25lbnQiLCJ3YXJuaW5ncyIsImxlbmd0aCIsInNjcmVlbnNTY2hlbWEiLCJOdW1iZXIiLCJpc0ludGVnZXIiLCJfIiwidW5pcSIsInB1YmxpYyIsIm9rIiwib3RoZXJTY3JlZW5zU2NoZW1hIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUdEQSxNQUFNQyxNQUFNLENBQUU7QUFFZCwrQkFBK0I7QUFDL0JELE1BQU1FLElBQUksQ0FBRSxlQUFlQyxDQUFBQTtJQUN6QixNQUFNQyxRQUFRO0lBQ2RELE9BQU9FLEtBQUssQ0FBRUQsT0FBTyxTQUFTO0lBRTlCLE1BQU1FLFlBQVk7UUFDaEJDLFFBQVE7WUFDTkMsTUFBTTtZQUNOQyxjQUFjO1lBQ2RDLGFBQWE7Z0JBQUU7Z0JBQUc7Z0JBQUc7Z0JBQUc7Z0JBQUc7YUFBRztRQUNoQztRQUNBQyxNQUFNO1lBQ0pILE1BQU07WUFDTkMsY0FBYztZQUNkRyxjQUFjLFNBQVVDLEdBQUc7Z0JBQ3pCLE9BQVNBLElBQUlDLE9BQU8sQ0FBRSxTQUFVLEdBQUssNkJBQTZCO1lBQ3BFO1FBQ0Y7UUFDQUMsUUFBUTtZQUNOUCxNQUFNO1lBQ05DLGNB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