// Copyright 2020-2024, University of Colorado Boulder
/**
 * QUnit tests for ScreenSelector
 *
 * Porting to TS will require re-writing tests to create Screen fixtures.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */ function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
import selectScreens from './selectScreens.js';
// test screen constants. Since these are tests, it is actually more valuable to typecast instead of making these actual screens.
const a = 'a';
const b = 'b';
const c = 'c';
const hs = 'hs';
const getQueryParameterValues = (queryString)=>{
    // TODO: Get schema from initialize-globals.js instead of duplicating here, see https://github.com/phetsims/chipper/issues/936
    // For documentation, please see initialize-globals
    return QueryStringMachine.getAllForString({
        homeScreen: {
            type: 'boolean',
            defaultValue: true,
            public: true
        },
        initialScreen: {
            type: 'number',
            defaultValue: 0,
            public: true
        },
        screens: {
            type: 'array',
            elementSchema: {
                type: 'number',
                isValidValue: Number.isInteger
            },
            defaultValue: null,
            isValidValue: function(value) {
                return value === null || value.length === _.uniq(value).length && value.length > 0;
            },
            public: true
        }
    }, queryString);
};
/**
 * Formats a message for each testValidScreenSelector result
 */ const formatMessage = (key, expectedResult, result, description)=>`expected ${key}: ${expectedResult[key]}, actual ${key}: ${result[key]} for valid selectScreens test ${description}`;
/**
 * Format the query string + all sim screens to uniquely identify the test.
 */ const getDescription = (queryString, allSimScreens)=>`${queryString} ${JSON.stringify(allSimScreens)}`;
/**
 * Tests a valid combination of allSimScreens and screens-related query parameters, where the expectedResult should
 * equal the result returned from ScreenSelector.select
 */ const testValidScreenSelector = (queryString, allSimScreens, assert, expectedResult)=>{
    const queryParameterValues = getQueryParameterValues(queryString);
    const result = selectScreens(allSimScreens, queryParameterValues.homeScreen, QueryStringMachine.containsKeyForString('homeScreen', queryString), queryParameterValues.initialScreen, QueryStringMachine.containsKeyForString('initialScreen', queryString), queryParameterValues.screens, QueryStringMachine.containsKeyForString('screens', queryString), _.noop, ()=>hs);
    const description = getDescription(queryString, allSimScreens);
    // test the four return values from selectScreens
    assert.ok(result.homeScreen === expectedResult.homeScreen, formatMessage('homeScreen', expectedResult, result, description));
    assert.ok(result.initialScreen === expectedResult.initialScreen, formatMessage('initialScreen', expectedResult, result, description));
    assert.ok(_.isEqual(result.selectedSimScreens, expectedResult.selectedSimScreens), formatMessage('selectedSimScreens', expectedResult, result, description));
    assert.ok(_.isEqual(result.screens, expectedResult.screens), formatMessage('screens', expectedResult, result, description));
    assert.ok(_.isEqual(result.allScreensCreated, expectedResult.allScreensCreated), formatMessage('allScreensCreated', expectedResult, result, description));
};
QUnit.test('valid selectScreens', /*#__PURE__*/ _async_to_generator(function*(assert) {
    // multi-screen
    testValidScreenSelector('?screens=1', [
        a,
        b
    ], assert, {
        homeScreen: null,
        initialScreen: a,
        selectedSimScreens: [
            a
        ],
        screens: [
            a
        ],
        allScreensCreated: false
    });
    testValidScreenSelector('?screens=2', [
        a,
        b
    ], assert, {
        homeScreen: null,
        initialScreen: b,
        selectedSimScreens: [
            b
        ],
        screens: [
            b
        ],
        allScreensCreated: false
    });
    testValidScreenSelector('?screens=1,2', [
        a,
        b
    ], assert, {
        homeScreen: hs,
        initialScreen: hs,
        selectedSimScreens: [
            a,
            b
        ],
        screens: [
            hs,
            a,
            b
        ],
        allScreensCreated: true
    });
    testValidScreenSelector('?screens=2,1', [
        a,
        b
    ], assert, {
        homeScreen: hs,
        initialScreen: hs,
        selectedSimScreens: [
            b,
            a
        ],
        screens: [
            hs,
            b,
            a
        ],
        allScreensCreated: true
    });
    testValidScreenSelector('?initialScreen=2&homeScreen=false', [
        a,
        b
    ], assert, {
        homeScreen: null,
        initialScreen: b,
        selectedSimScreens: [
            a,
            b
        ],
        screens: [
            a,
            b
        ],
        allScreensCreated: false
    });
    testValidScreenSelector('?homeScreen=false', [
        a,
        b
    ], assert, {
        homeScreen: null,
        initialScreen: a,
        selectedSimScreens: [
            a,
            b
        ],
        screens: [
            a,
            b
        ],
        allScreensCreated: false
    });
    testValidScreenSelector('?screens=2,1', [
        a,
        b,
        c
    ], assert, {
        homeScreen: hs,
        initialScreen: hs,
        selectedSimScreens: [
            b,
            a
        ],
        screens: [
            hs,
            b,
            a
        ],
        allScreensCreated: false
    });
    testValidScreenSelector('?screens=3,1', [
        a,
        b,
        c
    ], assert, {
        homeScreen: hs,
        initialScreen: hs,
        selectedSimScreens: [
            c,
            a
        ],
        screens: [
            hs,
            c,
            a
        ],
        allScreensCreated: false
    });
    testValidScreenSelector('?screens=2,3', [
        a,
        b,
        c
    ], assert, {
        homeScreen: hs,
        initialScreen: hs,
        selectedSimScreens: [
            b,
            c
        ],
        screens: [
            hs,
            b,
            c
        ],
        allScreensCreated: false
    });
    testValidScreenSelector('?initialScreen=1&homeScreen=false&screens=2,1', [
        a,
        b
    ], assert, {
        homeScreen: null,
        initialScreen: a,
        selectedSimScreens: [
            b,
            a
        ],
        screens: [
            b,
            a
        ],
        allScreensCreated: false
    });
    testValidScreenSelector('?initialScreen=0&homeScreen=true&screens=2,1', [
        a,
        b
    ], assert, {
        homeScreen: hs,
        initialScreen: hs,
        selectedSimScreens: [
            b,
            a
        ],
        screens: [
            hs,
            b,
            a
        ],
        allScreensCreated: true
    });
    testValidScreenSelector('?initialScreen=1&homeScreen=true&screens=2,1', [
        a,
        b
    ], assert, {
        homeScreen: hs,
        initialScreen: a,
        selectedSimScreens: [
            b,
            a
        ],
        screens: [
            hs,
            b,
            a
        ],
        allScreensCreated: true
    });
    testValidScreenSelector('?initialScreen=2&homeScreen=true&screens=1,2', [
        a,
        b
    ], assert, {
        homeScreen: hs,
        initialScreen: b,
        selectedSimScreens: [
            a,
            b
        ],
        screens: [
            hs,
            a,
            b
        ],
        allScreensCreated: true
    });
    testValidScreenSelector('?initialScreen=1&homeScreen=false&screens=1', [
        a,
        b
    ], assert, {
        homeScreen: null,
        initialScreen: a,
        selectedSimScreens: [
            a
        ],
        screens: [
            a
        ],
        allScreensCreated: false
    });
    testValidScreenSelector('?initialScreen=2&homeScreen=false&screens=2', [
        a,
        b
    ], assert, {
        homeScreen: null,
        initialScreen: b,
        selectedSimScreens: [
            b
        ],
        screens: [
            b
        ],
        allScreensCreated: false
    });
    // single-screen
    // Like ph-scale-basics_en.html?screens=1
    testValidScreenSelector('?screens=1', [
        a
    ], assert, {
        homeScreen: null,
        initialScreen: a,
        selectedSimScreens: [
            a
        ],
        screens: [
            a
        ],
        allScreensCreated: true
    });
    testValidScreenSelector('?initialScreen=1', [
        a
    ], assert, {
        homeScreen: null,
        initialScreen: a,
        selectedSimScreens: [
            a
        ],
        screens: [
            a
        ],
        allScreensCreated: true
    });
    testValidScreenSelector('?homeScreen=false', [
        a
    ], assert, {
        homeScreen: null,
        initialScreen: a,
        selectedSimScreens: [
            a
        ],
        screens: [
            a
        ],
        allScreensCreated: true
    });
}));
QUnit.test('invalid selectScreens (with assertions)', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.ok(true, 'At least one assert must run, even if not running with ?ea');
    /**
   * Tests an invalid combination of allSimScreens and screens-related query parameters, where selectScreens should
   * throw an error
   */ const testInvalidScreenSelector = (queryString, allSimScreens)=>{
        const queryParameterValues = getQueryParameterValues(queryString);
        const description = getDescription(queryString, allSimScreens);
        window.assert && assert.throws(()=>{
            selectScreens(allSimScreens, queryParameterValues.homeScreen, QueryStringMachine.containsKeyForString('homeScreen', queryString), queryParameterValues.initialScreen, QueryStringMachine.containsKeyForString('initialScreen', queryString), queryParameterValues.screens, QueryStringMachine.containsKeyForString('screens', queryString), _.noop, ()=>hs);
        }, `expected error for invalid selectScreens test ${description}`);
    };
    // multi-screen
    testInvalidScreenSelector('?screens=0', [
        a,
        b
    ]);
    testInvalidScreenSelector('?screens=3', [
        a,
        b
    ]);
    testInvalidScreenSelector('?screens=', [
        a,
        b
    ]);
    testInvalidScreenSelector('?initialScreen=0&homeScreen=true&screens=1', [
        a,
        b
    ]);
    testInvalidScreenSelector('?initialScreen=0&homeScreen=false&screens=0', [
        a,
        b
    ]);
    testInvalidScreenSelector('?initialScreen=0&homeScreen=false&screens=2,1', [
        a,
        b
    ]);
    testInvalidScreenSelector('?initialScreen=0&homeScreen=false&screens=1', [
        a,
        b
    ]);
    testInvalidScreenSelector('?initialScreen=2&homeScreen=false&screens=1', [
        a,
        b
    ]);
    // Like ph-scale_en.html?screens=1,4
    testInvalidScreenSelector('?screens=1,4', [
        a,
        b,
        c
    ]);
    // single-screen
    testInvalidScreenSelector('?initialScreen=0', [
        a
    ]);
    testInvalidScreenSelector('?initialScreen=2', [
        a
    ]);
    testInvalidScreenSelector('?homeScreen=true', [
        a
    ]);
    testInvalidScreenSelector('?screens=0', [
        a
    ]);
    testInvalidScreenSelector('?screens=2', [
        a
    ]);
    testInvalidScreenSelector('?screens=2', [
        a
    ]);
    // These contain errors, display warning dialog, and revert to default.
    // like ph-scale-basics_en.html?screens=2,1
    testInvalidScreenSelector('?screens=2,1', [
        a
    ]);
}));
// Public query parameters can't just error out, they need to support adding warnings and setting to a reasonable default, so only run these when assertions are disabled. At the time of writing, the above assertion tests were copied directly into this test, to ensure each of those had a correct fallback default.
QUnit.test('invalid selectScreens (grace without assertions)', /*#__PURE__*/ _async_to_generator(function*(assert) {
    if (window.assert === null) {
        testValidScreenSelector('?screens=1,2,5&initialScreen=4', [
            a,
            b,
            c
        ], assert, {
            homeScreen: hs,
            initialScreen: hs,
            selectedSimScreens: [
                a,
                b,
                c
            ],
            screens: [
                hs,
                a,
                b,
                c
            ],
            allScreensCreated: true
        });
        testValidScreenSelector('?screens=1,2,5&initialScreen=2', [
            a,
            b,
            c
        ], assert, {
            homeScreen: hs,
            initialScreen: b,
            selectedSimScreens: [
                a,
                b,
                c
            ],
            screens: [
                hs,
                a,
                b,
                c
            ],
            allScreensCreated: true
        });
        testValidScreenSelector('?screens=1,2&homeScreen=false&initialScreen=7', [
            a,
            b,
            c
        ], assert, {
            homeScreen: null,
            initialScreen: a,
            selectedSimScreens: [
                a,
                b
            ],
            screens: [
                a,
                b
            ],
            allScreensCreated: false
        });
        testValidScreenSelector('?screens=1,2&initialScreen=7', [
            a,
            b,
            c
        ], assert, {
            homeScreen: hs,
            initialScreen: hs,
            selectedSimScreens: [
                a,
                b
            ],
            screens: [
                hs,
                a,
                b
            ],
            allScreensCreated: false
        });
        // multi-screen
        testValidScreenSelector('?screens=0', [
            a,
            b
        ], assert, {
            homeScreen: hs,
            initialScreen: hs,
            selectedSimScreens: [
                a,
                b
            ],
            screens: [
                hs,
                a,
                b
            ],
            allScreensCreated: true
        });
        testValidScreenSelector('?screens=3', [
            a,
            b
        ], assert, {
            homeScreen: hs,
            initialScreen: hs,
            selectedSimScreens: [
                a,
                b
            ],
            screens: [
                hs,
                a,
                b
            ],
            allScreensCreated: true
        });
        testValidScreenSelector('?screens=', [
            a,
            b
        ], assert, {
            homeScreen: hs,
            initialScreen: hs,
            selectedSimScreens: [
                a,
                b
            ],
            screens: [
                hs,
                a,
                b
            ],
            allScreensCreated: true
        });
        testValidScreenSelector('?homeScreen=false&screens=', [
            a,
            b
        ], assert, {
            homeScreen: null,
            initialScreen: a,
            selectedSimScreens: [
                a,
                b
            ],
            screens: [
                a,
                b
            ],
            allScreensCreated: false
        });
        testValidScreenSelector('?initialScreen=0&homeScreen=true&screens=1', [
            a,
            b
        ], assert, {
            homeScreen: null,
            initialScreen: a,
            selectedSimScreens: [
                a
            ],
            screens: [
                a
            ],
            allScreensCreated: false
        });
        testValidScreenSelector('?initialScreen=0&homeScreen=true&screens=2,1', [
            a,
            b
        ], assert, {
            homeScreen: hs,
            initialScreen: hs,
            selectedSimScreens: [
                b,
                a
            ],
            screens: [
                hs,
                b,
                a
            ],
            allScreensCreated: true
        });
        testValidScreenSelector('?initialScreen=0&homeScreen=false&screens=0', [
            a,
            b
        ], assert, {
            homeScreen: null,
            initialScreen: a,
            selectedSimScreens: [
                a,
                b
            ],
            screens: [
                a,
                b
            ],
            allScreensCreated: false
        });
        testValidScreenSelector('?initialScreen=1&homeScreen=false&screens=0', [
            a,
            b
        ], assert, {
            homeScreen: null,
            initialScreen: a,
            selectedSimScreens: [
                a,
                b
            ],
            screens: [
                a,
                b
            ],
            allScreensCreated: false
        });
        testValidScreenSelector('?initialScreen=0&homeScreen=false&screens=2,1', [
            a,
            b
        ], assert, {
            homeScreen: null,
            initialScreen: b,
            selectedSimScreens: [
                b,
                a
            ],
            screens: [
                b,
                a
            ],
            allScreensCreated: false
        });
        testValidScreenSelector('?initialScreen=0&homeScreen=false&screens=1', [
            a,
            b
        ], assert, {
            homeScreen: null,
            initialScreen: a,
            selectedSimScreens: [
                a
            ],
            screens: [
                a
            ],
            allScreensCreated: false
        });
        testValidScreenSelector('?initialScreen=2&homeScreen=false&screens=1', [
            a,
            b
        ], assert, {
            homeScreen: null,
            initialScreen: a,
            selectedSimScreens: [
                a
            ],
            screens: [
                a
            ],
            allScreensCreated: false
        });
        // Like ph-scale_en.html?screens=1,4
        testValidScreenSelector('?screens=1,4', [
            a,
            b,
            c
        ], assert, {
            homeScreen: hs,
            initialScreen: hs,
            selectedSimScreens: [
                a,
                b,
                c
            ],
            screens: [
                hs,
                a,
                b,
                c
            ],
            allScreensCreated: true
        });
        // single-screen
        testValidScreenSelector('?initialScreen=0', [
            a
        ], assert, {
            homeScreen: null,
            initialScreen: a,
            selectedSimScreens: [
                a
            ],
            screens: [
                a
            ],
            allScreensCreated: true
        });
        testValidScreenSelector('?initialScreen=2', [
            a
        ], assert, {
            homeScreen: null,
            initialScreen: a,
            selectedSimScreens: [
                a
            ],
            screens: [
                a
            ],
            allScreensCreated: true
        });
        testValidScreenSelector('?homeScreen=true', [
            a
        ], assert, {
            homeScreen: null,
            initialScreen: a,
            selectedSimScreens: [
                a
            ],
            screens: [
                a
            ],
            allScreensCreated: true
        });
        testValidScreenSelector('?screens=0', [
            a
        ], assert, {
            homeScreen: null,
            initialScreen: a,
            selectedSimScreens: [
                a
            ],
            screens: [
                a
            ],
            allScreensCreated: true
        });
        testValidScreenSelector('?screens=2', [
            a
        ], assert, {
            homeScreen: null,
            initialScreen: a,
            selectedSimScreens: [
                a
            ],
            screens: [
                a
            ],
            allScreensCreated: true
        });
        testValidScreenSelector('?screens=2', [
            a
        ], assert, {
            homeScreen: null,
            initialScreen: a,
            selectedSimScreens: [
                a
            ],
            screens: [
                a
            ],
            allScreensCreated: true
        });
        // These contain errors, display warning dialog, and revert to default.
        // like ph-scale-basics_en.html?screens=2,1
        testValidScreenSelector('?screens=2,1', [
            a
        ], assert, {
            homeScreen: null,
            initialScreen: a,
            selectedSimScreens: [
                a
            ],
            screens: [
                a
            ],
            allScreensCreated: true
        });
        testValidScreenSelector('?screens=1.2,Screen2', [
            a,
            b,
            c
        ], assert, {
            homeScreen: hs,
            initialScreen: hs,
            selectedSimScreens: [
                a,
                b,
                c
            ],
            screens: [
                hs,
                a,
                b,
                c
            ],
            allScreensCreated: true
        });
    } else {
        assert.ok(true, 'cannot test for grace when assertions are enabled');
    }
}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL3NlbGVjdFNjcmVlbnNUZXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBRVW5pdCB0ZXN0cyBmb3IgU2NyZWVuU2VsZWN0b3JcbiAqXG4gKiBQb3J0aW5nIHRvIFRTIHdpbGwgcmVxdWlyZSByZS13cml0aW5nIHRlc3RzIHRvIGNyZWF0ZSBTY3JlZW4gZml4dHVyZXMuXG4gKlxuICogQGF1dGhvciBDaHJpcyBLbHVzZW5kb3JmIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBIb21lU2NyZWVuIGZyb20gJy4vSG9tZVNjcmVlbi5qcyc7XG5pbXBvcnQgeyBBbnlTY3JlZW4gfSBmcm9tICcuL1NjcmVlbi5qcyc7XG5pbXBvcnQgc2VsZWN0U2NyZWVucywgeyBTY3JlZW5SZXR1cm5UeXBlIH0gZnJvbSAnLi9zZWxlY3RTY3JlZW5zLmpzJztcblxuLy8gdGVzdCBzY3JlZW4gY29uc3RhbnRzLiBTaW5jZSB0aGVzZSBhcmUgdGVzdHMsIGl0IGlzIGFjdHVhbGx5IG1vcmUgdmFsdWFibGUgdG8gdHlwZWNhc3QgaW5zdGVhZCBvZiBtYWtpbmcgdGhlc2UgYWN0dWFsIHNjcmVlbnMuXG5jb25zdCBhID0gJ2EnIGFzIHVua25vd24gYXMgQW55U2NyZWVuO1xuY29uc3QgYiA9ICdiJyBhcyB1bmtub3duIGFzIEFueVNjcmVlbjtcbmNvbnN0IGMgPSAnYycgYXMgdW5rbm93biBhcyBBbnlTY3JlZW47XG5jb25zdCBocyA9ICdocycgYXMgdW5rbm93biBhcyBIb21lU2NyZWVuO1xuXG5jb25zdCBnZXRRdWVyeVBhcmFtZXRlclZhbHVlcyA9ICggcXVlcnlTdHJpbmc6IHN0cmluZyApID0+IHtcblxuICAvLyBUT0RPOiBHZXQgc2NoZW1hIGZyb20gaW5pdGlhbGl6ZS1nbG9iYWxzLmpzIGluc3RlYWQgb2YgZHVwbGljYXRpbmcgaGVyZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy85MzZcbiAgLy8gRm9yIGRvY3VtZW50YXRpb24sIHBsZWFzZSBzZWUgaW5pdGlhbGl6ZS1nbG9iYWxzXG4gIHJldHVybiBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0QWxsRm9yU3RyaW5nKCB7XG5cbiAgICBob21lU2NyZWVuOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0VmFsdWU6IHRydWUsXG4gICAgICBwdWJsaWM6IHRydWVcbiAgICB9LFxuXG4gICAgaW5pdGlhbFNjcmVlbjoge1xuICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICBkZWZhdWx0VmFsdWU6IDAsXG4gICAgICBwdWJsaWM6IHRydWVcblxuICAgIH0sXG5cbiAgICBzY3JlZW5zOiB7XG4gICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgZWxlbWVudFNjaGVtYToge1xuICAgICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgICAgaXNWYWxpZFZhbHVlOiBOdW1iZXIuaXNJbnRlZ2VyXG4gICAgICB9LFxuICAgICAgZGVmYXVsdFZhbHVlOiBudWxsLFxuICAgICAgaXNWYWxpZFZhbHVlOiBmdW5jdGlvbiggdmFsdWUgKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZSA9PT0gbnVsbCB8fCAoIHZhbHVlLmxlbmd0aCA9PT0gXy51bmlxKCB2YWx1ZSApLmxlbmd0aCAmJiB2YWx1ZS5sZW5ndGggPiAwICk7XG4gICAgICB9LFxuICAgICAgcHVibGljOiB0cnVlXG4gICAgfVxuICB9LCBxdWVyeVN0cmluZyApO1xufTtcblxuLyoqXG4gKiBGb3JtYXRzIGEgbWVzc2FnZSBmb3IgZWFjaCB0ZXN0VmFsaWRTY3JlZW5TZWxlY3RvciByZXN1bHRcbiAqL1xuY29uc3QgZm9ybWF0TWVzc2FnZSA9ICgga2V5OiBrZXlvZiBTY3JlZW5SZXR1cm5UeXBlLCBleHBlY3RlZFJlc3VsdDogU2NyZWVuUmV0dXJuVHlwZSwgcmVzdWx0OiBTY3JlZW5SZXR1cm5UeXBlLCBkZXNjcmlwdGlvbjogc3RyaW5nICk6IHN0cmluZyA9PlxuICBgZXhwZWN0ZWQgJHtrZXl9OiAke2V4cGVjdGVkUmVzdWx0WyBrZXkgXX0sIGFjdHVhbCAke2tleX06ICR7cmVzdWx0WyBrZXkgXX0gZm9yIHZhbGlkIHNlbGVjdFNjcmVlbnMgdGVzdCAke2Rlc2NyaXB0aW9ufWA7XG5cbi8qKlxuICogRm9ybWF0IHRoZSBxdWVyeSBzdHJpbmcgKyBhbGwgc2ltIHNjcmVlbnMgdG8gdW5pcXVlbHkgaWRlbnRpZnkgdGhlIHRlc3QuXG4gKi9cbmNvbnN0IGdldERlc2NyaXB0aW9uID0gKCBxdWVyeVN0cmluZzogc3RyaW5nLCBhbGxTaW1TY3JlZW5zOiBBbnlTY3JlZW5bXSApOiBzdHJpbmcgPT4gYCR7cXVlcnlTdHJpbmd9ICR7SlNPTi5zdHJpbmdpZnkoIGFsbFNpbVNjcmVlbnMgKX1gO1xuXG5cbi8qKlxuICogVGVzdHMgYSB2YWxpZCBjb21iaW5hdGlvbiBvZiBhbGxTaW1TY3JlZW5zIGFuZCBzY3JlZW5zLXJlbGF0ZWQgcXVlcnkgcGFyYW1ldGVycywgd2hlcmUgdGhlIGV4cGVjdGVkUmVzdWx0IHNob3VsZFxuICogZXF1YWwgdGhlIHJlc3VsdCByZXR1cm5lZCBmcm9tIFNjcmVlblNlbGVjdG9yLnNlbGVjdFxuICovXG5jb25zdCB0ZXN0VmFsaWRTY3JlZW5TZWxlY3RvciA9ICggcXVlcnlTdHJpbmc6IHN0cmluZywgYWxsU2ltU2NyZWVuczogQW55U2NyZWVuW10sIGFzc2VydDogQXNzZXJ0LCBleHBlY3RlZFJlc3VsdDogU2NyZWVuUmV0dXJuVHlwZSApID0+IHtcbiAgY29uc3QgcXVlcnlQYXJhbWV0ZXJWYWx1ZXMgPSBnZXRRdWVyeVBhcmFtZXRlclZhbHVlcyggcXVlcnlTdHJpbmcgKTtcblxuICBjb25zdCByZXN1bHQgPSBzZWxlY3RTY3JlZW5zKFxuICAgIGFsbFNpbVNjcmVlbnMsXG4gICAgcXVlcnlQYXJhbWV0ZXJWYWx1ZXMuaG9tZVNjcmVlbixcbiAgICBRdWVyeVN0cmluZ01hY2hpbmUuY29udGFpbnNLZXlGb3JTdHJpbmcoICdob21lU2NyZWVuJywgcXVlcnlTdHJpbmcgKSxcbiAgICBxdWVyeVBhcmFtZXRlclZhbHVlcy5pbml0aWFsU2NyZWVuLFxuICAgIFF1ZXJ5U3RyaW5nTWFjaGluZS5jb250YWluc0tleUZvclN0cmluZyggJ2luaXRpYWxTY3JlZW4nLCBxdWVyeVN0cmluZyApLFxuICAgIHF1ZXJ5UGFyYW1ldGVyVmFsdWVzLnNjcmVlbnMsXG4gICAgUXVlcnlTdHJpbmdNYWNoaW5lLmNvbnRhaW5zS2V5Rm9yU3RyaW5nKCAnc2NyZWVucycsIHF1ZXJ5U3RyaW5nICksXG4gICAgXy5ub29wLFxuICAgICgpID0+IGhzXG4gICk7XG5cbiAgY29uc3QgZGVzY3JpcHRpb24gPSBnZXREZXNjcmlwdGlvbiggcXVlcnlTdHJpbmcsIGFsbFNpbVNjcmVlbnMgKTtcblxuICAvLyB0ZXN0IHRoZSBmb3VyIHJldHVybiB2YWx1ZXMgZnJvbSBzZWxlY3RTY3JlZW5zXG4gIGFzc2VydC5vayggcmVzdWx0LmhvbWVTY3JlZW4gPT09IGV4cGVjdGVkUmVzdWx0LmhvbWVTY3JlZW4sXG4gICAgZm9ybWF0TWVzc2FnZSggJ2hvbWVTY3JlZW4nLCBleHBlY3RlZFJlc3VsdCwgcmVzdWx0LCBkZXNjcmlwdGlvbiApICk7XG4gIGFzc2VydC5vayggcmVzdWx0LmluaXRpYWxTY3JlZW4gPT09IGV4cGVjdGVkUmVzdWx0LmluaXRpYWxTY3JlZW4sXG4gICAgZm9ybWF0TWVzc2FnZSggJ2luaXRpYWxTY3JlZW4nLCBleHBlY3RlZFJlc3VsdCwgcmVzdWx0LCBkZXNjcmlwdGlvbiApICk7XG4gIGFzc2VydC5vayggXy5pc0VxdWFsKCByZXN1bHQuc2VsZWN0ZWRTaW1TY3JlZW5zLCBleHBlY3RlZFJlc3VsdC5zZWxlY3RlZFNpbVNjcmVlbnMgKSxcbiAgICBmb3JtYXRNZXNzYWdlKCAnc2VsZWN0ZWRTaW1TY3JlZW5zJywgZXhwZWN0ZWRSZXN1bHQsIHJlc3VsdCwgZGVzY3JpcHRpb24gKSApO1xuICBhc3NlcnQub2soIF8uaXNFcXVhbCggcmVzdWx0LnNjcmVlbnMsIGV4cGVjdGVkUmVzdWx0LnNjcmVlbnMgKSxcbiAgICBmb3JtYXRNZXNzYWdlKCAnc2NyZWVucycsIGV4cGVjdGVkUmVzdWx0LCByZXN1bHQsIGRlc2NyaXB0aW9uICkgKTtcblxuICBhc3NlcnQub2soIF8uaXNFcXVhbCggcmVzdWx0LmFsbFNjcmVlbnNDcmVhdGVkLCBleHBlY3RlZFJlc3VsdC5hbGxTY3JlZW5zQ3JlYXRlZCApLFxuICAgIGZvcm1hdE1lc3NhZ2UoICdhbGxTY3JlZW5zQ3JlYXRlZCcsIGV4cGVjdGVkUmVzdWx0LCByZXN1bHQsIGRlc2NyaXB0aW9uICkgKTtcbn07XG5cblFVbml0LnRlc3QoICd2YWxpZCBzZWxlY3RTY3JlZW5zJywgYXN5bmMgYXNzZXJ0ID0+IHtcblxuICAvLyBtdWx0aS1zY3JlZW5cbiAgdGVzdFZhbGlkU2NyZWVuU2VsZWN0b3IoICc/c2NyZWVucz0xJywgWyBhLCBiIF0sIGFzc2VydCwge1xuICAgIGhvbWVTY3JlZW46IG51bGwsXG4gICAgaW5pdGlhbFNjcmVlbjogYSxcbiAgICBzZWxlY3RlZFNpbVNjcmVlbnM6IFsgYSBdLFxuICAgIHNjcmVlbnM6IFsgYSBdLFxuICAgIGFsbFNjcmVlbnNDcmVhdGVkOiBmYWxzZVxuICB9ICk7XG4gIHRlc3RWYWxpZFNjcmVlblNlbGVjdG9yKCAnP3NjcmVlbnM9MicsIFsgYSwgYiBdLCBhc3NlcnQsIHtcbiAgICBob21lU2NyZWVuOiBudWxsLFxuICAgIGluaXRpYWxTY3JlZW46IGIsXG4gICAgc2VsZWN0ZWRTaW1TY3JlZW5zOiBbIGIgXSxcbiAgICBzY3JlZW5zOiBbIGIgXSxcbiAgICBhbGxTY3JlZW5zQ3JlYXRlZDogZmFsc2VcbiAgfSApO1xuICB0ZXN0VmFsaWRTY3JlZW5TZWxlY3RvciggJz9zY3JlZW5zPTEsMicsIFsgYSwgYiBdLCBhc3NlcnQsIHtcbiAgICBob21lU2NyZWVuOiBocyxcbiAgICBpbml0aWFsU2NyZWVuOiBocyxcbiAgICBzZWxlY3RlZFNpbVNjcmVlbnM6IFsgYSwgYiBdLFxuICAgIHNjcmVlbnM6IFsgaHMsIGEsIGIgXSxcbiAgICBhbGxTY3JlZW5zQ3JlYXRlZDogdHJ1ZVxuICB9ICk7XG4gIHRlc3RWYWxpZFNjcmVlblNlbGVjdG9yKCAnP3NjcmVlbnM9MiwxJywgWyBhLCBiIF0sIGFzc2VydCwge1xuICAgIGhvbWVTY3JlZW46IGhzLFxuICAgIGluaXRpYWxTY3JlZW46IGhzLFxuICAgIHNlbGVjdGVkU2ltU2NyZWVuczogWyBiLCBhIF0sXG4gICAgc2NyZWVuczogWyBocywgYiwgYSBdLFxuICAgIGFsbFNjcmVlbnNDcmVhdGVkOiB0cnVlXG4gIH0gKTtcbiAgdGVzdFZhbGlkU2NyZWVuU2VsZWN0b3IoICc/aW5pdGlhbFNjcmVlbj0yJmhvbWVTY3JlZW49ZmFsc2UnLCBbIGEsIGIgXSwgYXNzZXJ0LCB7XG4gICAgaG9tZVNjcmVlbjogbnVsbCxcbiAgICBpbml0aWFsU2NyZWVuOiBiLFxuICAgIHNlbGVjdGVkU2ltU2NyZWVuczogWyBhLCBiIF0sXG4gICAgc2NyZWVuczogWyBhLCBiIF0sXG4gICAgYWxsU2NyZWVuc0NyZWF0ZWQ6IGZhbHNlXG4gIH0gKTtcbiAgdGVzdFZhbGlkU2NyZWVuU2VsZWN0b3IoICc/aG9tZVNjcmVlbj1mYWxzZScsIFsgYSwgYiBdLCBhc3NlcnQsIHtcbiAgICBob21lU2NyZWVuOiBudWxsLFxuICAgIGluaXRpYWxTY3JlZW46IGEsXG4gICAgc2VsZWN0ZWRTaW1TY3JlZW5zOiBbIGEsIGIgXSxcbiAgICBzY3JlZW5zOiBbIGEsIGIgXSxcbiAgICBhbGxTY3JlZW5zQ3JlYXRlZDogZmFsc2VcbiAgfSApO1xuICB0ZXN0VmFsaWRTY3JlZW5TZWxlY3RvciggJz9zY3JlZW5zPTIsMScsIFsgYSwgYiwgYyBdLCBhc3NlcnQsIHtcbiAgICBob21lU2NyZWVuOiBocyxcbiAgICBpbml0aWFsU2NyZWVuOiBocyxcbiAgICBzZWxlY3RlZFNpbVNjcmVlbnM6IFsgYiwgYSBdLFxuICAgIHNjcmVlbnM6IFsgaHMsIGIsIGEgXSxcbiAgICBhbGxTY3JlZW5zQ3JlYXRlZDogZmFsc2VcbiAgfSApO1xuICB0ZXN0VmFsaWRTY3JlZW5TZWxlY3RvciggJz9zY3JlZW5zPTMsMScsIFsgYSwgYiwgYyBdLCBhc3NlcnQsIHtcbiAgICBob21lU2NyZWVuOiBocyxcbiAgICBpbml0aWFsU2NyZWVuOiBocyxcbiAgICBzZWxlY3RlZFNpbVNjcmVlbnM6IFsgYywgYSBdLFxuICAgIHNjcmVlbnM6IFsgaHMsIGMsIGEgXSxcbiAgICBhbGxTY3JlZW5zQ3JlYXRlZDogZmFsc2VcbiAgfSApO1xuICB0ZXN0VmFsaWRTY3JlZW5TZWxlY3RvciggJz9zY3JlZW5zPTIsMycsIFsgYSwgYiwgYyBdLCBhc3NlcnQsIHtcbiAgICBob21lU2NyZWVuOiBocyxcbiAgICBpbml0aWFsU2NyZWVuOiBocyxcbiAgICBzZWxlY3RlZFNpbVNjcmVlbnM6IFsgYiwgYyBdLFxuICAgIHNjcmVlbnM6IFsgaHMsIGIsIGMgXSxcbiAgICBhbGxTY3JlZW5zQ3JlYXRlZDogZmFsc2VcbiAgfSApO1xuICB0ZXN0VmFsaWRTY3JlZW5TZWxlY3RvciggJz9pbml0aWFsU2NyZWVuPTEmaG9tZVNjcmVlbj1mYWxzZSZzY3JlZW5zPTIsMScsIFsgYSwgYiBdLCBhc3NlcnQsIHtcbiAgICBob21lU2NyZWVuOiBudWxsLFxuICAgIGluaXRpYWxTY3JlZW46IGEsXG4gICAgc2VsZWN0ZWRTaW1TY3JlZW5zOiBbIGIsIGEgXSxcbiAgICBzY3JlZW5zOiBbIGIsIGEgXSxcbiAgICBhbGxTY3JlZW5zQ3JlYXRlZDogZmFsc2VcbiAgfSApO1xuICB0ZXN0VmFsaWRTY3JlZW5TZWxlY3RvciggJz9pbml0aWFsU2NyZWVuPTAmaG9tZVNjcmVlbj10cnVlJnNjcmVlbnM9MiwxJywgWyBhLCBiIF0sIGFzc2VydCwge1xuICAgIGhvbWVTY3JlZW46IGhzLFxuICAgIGluaXRpYWxTY3JlZW46IGhzLFxuICAgIHNlbGVjdGVkU2ltU2NyZWVuczogWyBiLCBhIF0sXG4gICAgc2NyZWVuczogWyBocywgYiwgYSBdLFxuICAgIGFsbFNjcmVlbnNDcmVhdGVkOiB0cnVlXG4gIH0gKTtcbiAgdGVzdFZhbGlkU2NyZWVuU2VsZWN0b3IoICc/aW5pdGlhbFNjcmVlbj0xJmhvbWVTY3JlZW49dHJ1ZSZzY3JlZW5zPTIsMScsIFsgYSwgYiBdLCBhc3NlcnQsIHtcbiAgICBob21lU2NyZWVuOiBocyxcbiAgICBpbml0aWFsU2NyZWVuOiBhLFxuICAgIHNlbGVjdGVkU2ltU2NyZWVuczogWyBiLCBhIF0sXG4gICAgc2NyZWVuczogWyBocywgYiwgYSBdLFxuICAgIGFsbFNjcmVlbnNDcmVhdGVkOiB0cnVlXG4gIH0gKTtcbiAgdGVzdFZhbGlkU2NyZWVuU2VsZWN0b3IoICc/aW5pdGlhbFNjcmVlbj0yJmhvbWVTY3JlZW49dHJ1ZSZzY3JlZW5zPTEsMicsIFsgYSwgYiBdLCBhc3NlcnQsIHtcbiAgICBob21lU2NyZWVuOiBocyxcbiAgICBpbml0aWFsU2NyZWVuOiBiLFxuICAgIHNlbGVjdGVkU2ltU2NyZWVuczogWyBhLCBiIF0sXG4gICAgc2NyZWVuczogWyBocywgYSwgYiBdLFxuICAgIGFsbFNjcmVlbnNDcmVhdGVkOiB0cnVlXG4gIH0gKTtcbiAgdGVzdFZhbGlkU2NyZWVuU2VsZWN0b3IoICc/aW5pdGlhbFNjcmVlbj0xJmhvbWVTY3JlZW49ZmFsc2Umc2NyZWVucz0xJywgWyBhLCBiIF0sIGFzc2VydCwge1xuICAgIGhvbWVTY3JlZW46IG51bGwsXG4gICAgaW5pdGlhbFNjcmVlbjogYSxcbiAgICBzZWxlY3RlZFNpbVNjcmVlbnM6IFsgYSBdLFxuICAgIHNjcmVlbnM6IFsgYSBdLFxuICAgIGFsbFNjcmVlbnNDcmVhdGVkOiBmYWxzZVxuICB9ICk7XG4gIHRlc3RWYWxpZFNjcmVlblNlbGVjdG9yKCAnP2luaXRpYWxTY3JlZW49MiZob21lU2NyZWVuPWZhbHNlJnNjcmVlbnM9MicsIFsgYSwgYiBdLCBhc3NlcnQsIHtcbiAgICBob21lU2NyZWVuOiBudWxsLFxuICAgIGluaXRpYWxTY3JlZW46IGIsXG4gICAgc2VsZWN0ZWRTaW1TY3JlZW5zOiBbIGIgXSxcbiAgICBzY3JlZW5zOiBbIGIgXSxcbiAgICBhbGxTY3JlZW5zQ3JlYXRlZDogZmFsc2VcbiAgfSApO1xuXG4gIC8vIHNpbmdsZS1zY3JlZW5cbiAgLy8gTGlrZSBwaC1zY2FsZS1iYXNpY3NfZW4uaHRtbD9zY3JlZW5zPTFcbiAgdGVzdFZhbGlkU2NyZWVuU2VsZWN0b3IoICc/c2NyZWVucz0xJywgWyBhIF0sIGFzc2VydCwge1xuICAgIGhvbWVTY3JlZW46IG51bGwsXG4gICAgaW5pdGlhbFNjcmVlbjogYSxcbiAgICBzZWxlY3RlZFNpbVNjcmVlbnM6IFsgYSBdLFxuICAgIHNjcmVlbnM6IFsgYSBdLFxuICAgIGFsbFNjcmVlbnNDcmVhdGVkOiB0cnVlXG4gIH0gKTtcbiAgdGVzdFZhbGlkU2NyZWVuU2VsZWN0b3IoICc/aW5pdGlhbFNjcmVlbj0xJywgWyBhIF0sIGFzc2VydCwge1xuICAgIGhvbWVTY3JlZW46IG51bGwsXG4gICAgaW5pdGlhbFNjcmVlbjogYSxcbiAgICBzZWxlY3RlZFNpbVNjcmVlbnM6IFsgYSBdLFxuICAgIHNjcmVlbnM6IFsgYSBdLFxuICAgIGFsbFNjcmVlbnNDcmVhdGVkOiB0cnVlXG4gIH0gKTtcbiAgdGVzdFZhbGlkU2NyZWVuU2VsZWN0b3IoICc/aG9tZVNjcmVlbj1mYWxzZScsIFsgYSBdLCBhc3NlcnQsIHtcbiAgICBob21lU2NyZWVuOiBudWxsLFxuICAgIGluaXRpYWxTY3JlZW46IGEsXG4gICAgc2VsZWN0ZWRTaW1TY3JlZW5zOiBbIGEgXSxcbiAgICBzY3JlZW5zOiBbIGEgXSxcbiAgICBhbGxTY3JlZW5zQ3JlYXRlZDogdHJ1ZVxuICB9ICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdpbnZhbGlkIHNlbGVjdFNjcmVlbnMgKHdpdGggYXNzZXJ0aW9ucyknLCBhc3luYyBhc3NlcnQgPT4ge1xuXG4gIGFzc2VydC5vayggdHJ1ZSwgJ0F0IGxlYXN0IG9uZSBhc3NlcnQgbXVzdCBydW4sIGV2ZW4gaWYgbm90IHJ1bm5pbmcgd2l0aCA/ZWEnICk7XG5cbiAgLyoqXG4gICAqIFRlc3RzIGFuIGludmFsaWQgY29tYmluYXRpb24gb2YgYWxsU2ltU2NyZWVucyBhbmQgc2NyZWVucy1yZWxhdGVkIHF1ZXJ5IHBhcmFtZXRlcnMsIHdoZXJlIHNlbGVjdFNjcmVlbnMgc2hvdWxkXG4gICAqIHRocm93IGFuIGVycm9yXG4gICAqL1xuICBjb25zdCB0ZXN0SW52YWxpZFNjcmVlblNlbGVjdG9yID0gKCBxdWVyeVN0cmluZzogc3RyaW5nLCBhbGxTaW1TY3JlZW5zOiBBbnlTY3JlZW5bXSApID0+IHtcbiAgICBjb25zdCBxdWVyeVBhcmFtZXRlclZhbHVlcyA9IGdldFF1ZXJ5UGFyYW1ldGVyVmFsdWVzKCBxdWVyeVN0cmluZyApO1xuICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gZ2V0RGVzY3JpcHRpb24oIHF1ZXJ5U3RyaW5nLCBhbGxTaW1TY3JlZW5zICk7XG5cbiAgICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICAgIHNlbGVjdFNjcmVlbnMoXG4gICAgICAgIGFsbFNpbVNjcmVlbnMsXG4gICAgICAgIHF1ZXJ5UGFyYW1ldGVyVmFsdWVzLmhvbWVTY3JlZW4sXG4gICAgICAgIFF1ZXJ5U3RyaW5nTWFjaGluZS5jb250YWluc0tleUZvclN0cmluZyggJ2hvbWVTY3JlZW4nLCBxdWVyeVN0cmluZyApLFxuICAgICAgICBxdWVyeVBhcmFtZXRlclZhbHVlcy5pbml0aWFsU2NyZWVuLFxuICAgICAgICBRdWVyeVN0cmluZ01hY2hpbmUuY29udGFpbnNLZXlGb3JTdHJpbmcoICdpbml0aWFsU2NyZWVuJywgcXVlcnlTdHJpbmcgKSxcbiAgICAgICAgcXVlcnlQYXJhbWV0ZXJWYWx1ZXMuc2NyZWVucyxcbiAgICAgICAgUXVlcnlTdHJpbmdNYWNoaW5lLmNvbnRhaW5zS2V5Rm9yU3RyaW5nKCAnc2NyZWVucycsIHF1ZXJ5U3RyaW5nICksXG4gICAgICAgIF8ubm9vcCxcbiAgICAgICAgKCkgPT4gaHNcbiAgICAgICk7XG4gICAgfSwgYGV4cGVjdGVkIGVycm9yIGZvciBpbnZhbGlkIHNlbGVjdFNjcmVlbnMgdGVzdCAke2Rlc2NyaXB0aW9ufWAgKTtcbiAgfTtcblxuICAvLyBtdWx0aS1zY3JlZW5cbiAgdGVzdEludmFsaWRTY3JlZW5TZWxlY3RvciggJz9zY3JlZW5zPTAnLCBbIGEsIGIgXSApO1xuICB0ZXN0SW52YWxpZFNjcmVlblNlbGVjdG9yKCAnP3NjcmVlbnM9MycsIFsgYSwgYiBdICk7XG4gIHRlc3RJbnZhbGlkU2NyZWVuU2VsZWN0b3IoICc/c2NyZWVucz0nLCBbIGEsIGIgXSApO1xuICB0ZXN0SW52YWxpZFNjcmVlblNlbGVjdG9yKCAnP2luaXRpYWxTY3JlZW49MCZob21lU2NyZWVuPXRydWUmc2NyZWVucz0xJywgWyBhLCBiIF0gKTtcbiAgdGVzdEludmFsaWRTY3JlZW5TZWxlY3RvciggJz9pbml0aWFsU2NyZWVuPTAmaG9tZVNjcmVlbj1mYWxzZSZzY3JlZW5zPTAnLCBbIGEsIGIgXSApO1xuICB0ZXN0SW52YWxpZFNjcmVlblNlbGVjdG9yKCAnP2luaXRpYWxTY3JlZW49MCZob21lU2NyZWVuPWZhbHNlJnNjcmVlbnM9MiwxJywgWyBhLCBiIF0gKTtcbiAgdGVzdEludmFsaWRTY3JlZW5TZWxlY3RvciggJz9pbml0aWFsU2NyZWVuPTAmaG9tZVNjcmVlbj1mYWxzZSZzY3JlZW5zPTEnLCBbIGEsIGIgXSApO1xuICB0ZXN0SW52YWxpZFNjcmVlblNlbGVjdG9yKCAnP2luaXRpYWxTY3JlZW49MiZob21lU2NyZWVuPWZhbHNlJnNjcmVlbnM9MScsIFsgYSwgYiBdICk7XG5cbiAgLy8gTGlrZSBwaC1zY2FsZV9lbi5odG1sP3NjcmVlbnM9MSw0XG4gIHRlc3RJbnZhbGlkU2NyZWVuU2VsZWN0b3IoICc/c2NyZWVucz0xLDQnLCBbIGEsIGIsIGMgXSApO1xuXG4gIC8vIHNpbmdsZS1zY3JlZW5cbiAgdGVzdEludmFsaWRTY3JlZW5TZWxlY3RvciggJz9pbml0aWFsU2NyZWVuPTAnLCBbIGEgXSApO1xuICB0ZXN0SW52YWxpZFNjcmVlblNlbGVjdG9yKCAnP2luaXRpYWxTY3JlZW49MicsIFsgYSBdICk7XG4gIHRlc3RJbnZhbGlkU2NyZWVuU2VsZWN0b3IoICc/aG9tZVNjcmVlbj10cnVlJywgWyBhIF0gKTtcbiAgdGVzdEludmFsaWRTY3JlZW5TZWxlY3RvciggJz9zY3JlZW5zPTAnLCBbIGEgXSApO1xuICB0ZXN0SW52YWxpZFNjcmVlblNlbGVjdG9yKCAnP3NjcmVlbnM9MicsIFsgYSBdICk7XG5cbiAgdGVzdEludmFsaWRTY3JlZW5TZWxlY3RvciggJz9zY3JlZW5zPTInLCBbIGEgXSApO1xuXG4gIC8vIFRoZXNlIGNvbnRhaW4gZXJyb3JzLCBkaXNwbGF5IHdhcm5pbmcgZGlhbG9nLCBhbmQgcmV2ZXJ0IHRvIGRlZmF1bHQuXG4gIC8vIGxpa2UgcGgtc2NhbGUtYmFzaWNzX2VuLmh0bWw/c2NyZWVucz0yLDFcbiAgdGVzdEludmFsaWRTY3JlZW5TZWxlY3RvciggJz9zY3JlZW5zPTIsMScsIFsgYSBdICk7XG59ICk7XG5cbi8vIFB1YmxpYyBxdWVyeSBwYXJhbWV0ZXJzIGNhbid0IGp1c3QgZXJyb3Igb3V0LCB0aGV5IG5lZWQgdG8gc3VwcG9ydCBhZGRpbmcgd2FybmluZ3MgYW5kIHNldHRpbmcgdG8gYSByZWFzb25hYmxlIGRlZmF1bHQsIHNvIG9ubHkgcnVuIHRoZXNlIHdoZW4gYXNzZXJ0aW9ucyBhcmUgZGlzYWJsZWQuIEF0IHRoZSB0aW1lIG9mIHdyaXRpbmcsIHRoZSBhYm92ZSBhc3NlcnRpb24gdGVzdHMgd2VyZSBjb3BpZWQgZGlyZWN0bHkgaW50byB0aGlzIHRlc3QsIHRvIGVuc3VyZSBlYWNoIG9mIHRob3NlIGhhZCBhIGNvcnJlY3QgZmFsbGJhY2sgZGVmYXVsdC5cblFVbml0LnRlc3QoICdpbnZhbGlkIHNlbGVjdFNjcmVlbnMgKGdyYWNlIHdpdGhvdXQgYXNzZXJ0aW9ucyknLCBhc3luYyBhc3NlcnQgPT4ge1xuXG4gIGlmICggd2luZG93LmFzc2VydCA9PT0gbnVsbCApIHtcblxuICAgIHRlc3RWYWxpZFNjcmVlblNlbGVjdG9yKCAnP3NjcmVlbnM9MSwyLDUmaW5pdGlhbFNjcmVlbj00JywgWyBhLCBiLCBjIF0sIGFzc2VydCwge1xuICAgICAgaG9tZVNjcmVlbjogaHMsXG4gICAgICBpbml0aWFsU2NyZWVuOiBocyxcbiAgICAgIHNlbGVjdGVkU2ltU2NyZWVuczogWyBhLCBiLCBjIF0sXG4gICAgICBzY3JlZW5zOiBbIGhzLCBhLCBiLCBjIF0sXG4gICAgICBhbGxTY3JlZW5zQ3JlYXRlZDogdHJ1ZVxuICAgIH0gKTtcbiAgICB0ZXN0VmFsaWRTY3JlZW5TZWxlY3RvciggJz9zY3JlZW5zPTEsMiw1JmluaXRpYWxTY3JlZW49MicsIFsgYSwgYiwgYyBdLCBhc3NlcnQsIHtcbiAgICAgIGhvbWVTY3JlZW46IGhzLFxuICAgICAgaW5pdGlhbFNjcmVlbjogYixcbiAgICAgIHNlbGVjdGVkU2ltU2NyZWVuczogWyBhLCBiLCBjIF0sXG4gICAgICBzY3JlZW5zOiBbIGhzLCBhLCBiLCBjIF0sXG4gICAgICBhbGxTY3JlZW5zQ3JlYXRlZDogdHJ1ZVxuICAgIH0gKTtcblxuICAgIHRlc3RWYWxpZFNjcmVlblNlbGVjdG9yKCAnP3NjcmVlbnM9MSwyJmhvbWVTY3JlZW49ZmFsc2UmaW5pdGlhbFNjcmVlbj03JywgWyBhLCBiLCBjIF0sIGFzc2VydCwge1xuICAgICAgaG9tZVNjcmVlbjogbnVsbCxcbiAgICAgIGluaXRpYWxTY3JlZW46IGEsXG4gICAgICBzZWxlY3RlZFNpbVNjcmVlbnM6IFsgYSwgYiBdLFxuICAgICAgc2NyZWVuczogWyBhLCBiIF0sXG4gICAgICBhbGxTY3JlZW5zQ3JlYXRlZDogZmFsc2VcbiAgICB9ICk7XG5cbiAgICB0ZXN0VmFsaWRTY3JlZW5TZWxlY3RvciggJz9zY3JlZW5zPTEsMiZpbml0aWFsU2NyZWVuPTcnLCBbIGEsIGIsIGMgXSwgYXNzZXJ0LCB7XG4gICAgICBob21lU2NyZWVuOiBocyxcbiAgICAgIGluaXRpYWxTY3JlZW46IGhzLFxuICAgICAgc2VsZWN0ZWRTaW1TY3JlZW5zOiBbIGEsIGIgXSxcbiAgICAgIHNjcmVlbnM6IFsgaHMsIGEsIGIgXSxcbiAgICAgIGFsbFNjcmVlbnNDcmVhdGVkOiBmYWxzZVxuICAgIH0gKTtcblxuICAgIC8vIG11bHRpLXNjcmVlblxuICAgIHRlc3RWYWxpZFNjcmVlblNlbGVjdG9yKCAnP3NjcmVlbnM9MCcsIFsgYSwgYiBdLCBhc3NlcnQsIHtcbiAgICAgIGhvbWVTY3JlZW46IGhzLFxuICAgICAgaW5pdGlhbFNjcmVlbjogaHMsXG4gICAgICBzZWxlY3RlZFNpbVNjcmVlbnM6IFsgYSwgYiBdLFxuICAgICAgc2NyZWVuczogWyBocywgYSwgYiBdLFxuICAgICAgYWxsU2NyZWVuc0NyZWF0ZWQ6IHRydWVcbiAgICB9ICk7XG4gICAgdGVzdFZhbGlkU2NyZWVuU2VsZWN0b3IoICc/c2NyZWVucz0zJywgWyBhLCBiIF0sIGFzc2VydCwge1xuICAgICAgaG9tZVNjcmVlbjogaHMsXG4gICAgICBpbml0aWFsU2NyZWVuOiBocyxcbiAgICAgIHNlbGVjdGVkU2ltU2NyZWVuczogWyBhLCBiIF0sXG4gICAgICBzY3JlZW5zOiBbIGhzLCBhLCBiIF0sXG4gICAgICBhbGxTY3JlZW5zQ3JlYXRlZDogdHJ1ZVxuICAgIH0gKTtcbiAgICB0ZXN0VmFsaWRTY3JlZW5TZWxlY3RvciggJz9zY3JlZW5zPScsIFsgYSwgYiBdLCBhc3NlcnQsIHtcbiAgICAgIGhvbWVTY3JlZW46IGhzLFxuICAgICAgaW5pdGlhbFNjcmVlbjogaHMsXG4gICAgICBzZWxlY3RlZFNpbVNjcmVlbnM6IFsgYSwgYiBdLFxuICAgICAgc2NyZWVuczogWyBocywgYSwgYiBdLFxuICAgICAgYWxsU2NyZWVuc0NyZWF0ZWQ6IHRydWVcbiAgICB9ICk7XG4gICAgdGVzdFZhbGlkU2NyZWVuU2VsZWN0b3IoICc/aG9tZVNjcmVlbj1mYWxzZSZzY3JlZW5zPScsIFsgYSwgYiBdLCBhc3NlcnQsIHtcbiAgICAgIGhvbWVTY3JlZW46IG51bGwsXG4gICAgICBpbml0aWFsU2NyZWVuOiBhLFxuICAgICAgc2VsZWN0ZWRTaW1TY3JlZW5zOiBbIGEsIGIgXSxcbiAgICAgIHNjcmVlbnM6IFsgYSwgYiBdLFxuICAgICAgYWxsU2NyZWVuc0NyZWF0ZWQ6IGZhbHNlXG4gICAgfSApO1xuICAgIHRlc3RWYWxpZFNjcmVlblNlbGVjdG9yKCAnP2luaXRpYWxTY3JlZW49MCZob21lU2NyZWVuPXRydWUmc2NyZWVucz0xJywgWyBhLCBiIF0sIGFzc2VydCwge1xuICAgICAgaG9tZVNjcmVlbjogbnVsbCxcbiAgICAgIGluaXRpYWxTY3JlZW46IGEsXG4gICAgICBzZWxlY3RlZFNpbVNjcmVlbnM6IFsgYSBdLFxuICAgICAgc2NyZWVuczogWyBhIF0sXG4gICAgICBhbGxTY3JlZW5zQ3JlYXRlZDogZmFsc2VcbiAgICB9ICk7XG5cbiAgICB0ZXN0VmFsaWRTY3JlZW5TZWxlY3RvciggJz9pbml0aWFsU2NyZWVuPTAmaG9tZVNjcmVlbj10cnVlJnNjcmVlbnM9MiwxJywgWyBhLCBiIF0sIGFzc2VydCwge1xuICAgICAgaG9tZVNjcmVlbjogaHMsXG4gICAgICBpbml0aWFsU2NyZWVuOiBocyxcbiAgICAgIHNlbGVjdGVkU2ltU2NyZWVuczogWyBiLCBhIF0sXG4gICAgICBzY3JlZW5zOiBbIGhzLCBiLCBhIF0sXG4gICAgICBhbGxTY3JlZW5zQ3JlYXRlZDogdHJ1ZVxuICAgIH0gKTtcbiAgICB0ZXN0VmFsaWRTY3JlZW5TZWxlY3RvciggJz9pbml0aWFsU2NyZWVuPTAmaG9tZVNjcmVlbj1mYWxzZSZzY3JlZW5zPTAnLCBbIGEsIGIgXSwgYXNzZXJ0LCB7XG4gICAgICBob21lU2NyZWVuOiBudWxsLFxuICAgICAgaW5pdGlhbFNjcmVlbjogYSxcbiAgICAgIHNlbGVjdGVkU2ltU2NyZWVuczogWyBhLCBiIF0sXG4gICAgICBzY3JlZW5zOiBbIGEsIGIgXSxcbiAgICAgIGFsbFNjcmVlbnNDcmVhdGVkOiBmYWxzZVxuICAgIH0gKTtcbiAgICB0ZXN0VmFsaWRTY3JlZW5TZWxlY3RvciggJz9pbml0aWFsU2NyZWVuPTEmaG9tZVNjcmVlbj1mYWxzZSZzY3JlZW5zPTAnLCBbIGEsIGIgXSwgYXNzZXJ0LCB7XG4gICAgICBob21lU2NyZWVuOiBudWxsLFxuICAgICAgaW5pdGlhbFNjcmVlbjogYSxcbiAgICAgIHNlbGVjdGVkU2ltU2NyZWVuczogWyBhLCBiIF0sXG4gICAgICBzY3JlZW5zOiBbIGEsIGIgXSxcbiAgICAgIGFsbFNjcmVlbnNDcmVhdGVkOiBmYWxzZVxuICAgIH0gKTtcbiAgICB0ZXN0VmFsaWRTY3JlZW5TZWxlY3RvciggJz9pbml0aWFsU2NyZWVuPTAmaG9tZVNjcmVlbj1mYWxzZSZzY3JlZW5zPTIsMScsIFsgYSwgYiBdLCBhc3NlcnQsIHtcbiAgICAgIGhvbWVTY3JlZW46IG51bGwsXG4gICAgICBpbml0aWFsU2NyZWVuOiBiLFxuICAgICAgc2VsZWN0ZWRTaW1TY3JlZW5zOiBbIGIsIGEgXSxcbiAgICAgIHNjcmVlbnM6IFsgYiwgYSBdLFxuICAgICAgYWxsU2NyZWVuc0NyZWF0ZWQ6IGZhbHNlXG4gICAgfSApO1xuICAgIHRlc3RWYWxpZFNjcmVlblNlbGVjdG9yKCAnP2luaXRpYWxTY3JlZW49MCZob21lU2NyZWVuPWZhbHNlJnNjcmVlbnM9MScsIFsgYSwgYiBdLCBhc3NlcnQsIHtcbiAgICAgIGhvbWVTY3JlZW46IG51bGwsXG4gICAgICBpbml0aWFsU2NyZWVuOiBhLFxuICAgICAgc2VsZWN0ZWRTaW1TY3JlZW5zOiBbIGEgXSxcbiAgICAgIHNjcmVlbnM6IFsgYSBdLFxuICAgICAgYWxsU2NyZWVuc0NyZWF0ZWQ6IGZhbHNlXG4gICAgfSApO1xuICAgIHRlc3RWYWxpZFNjcmVlblNlbGVjdG9yKCAnP2luaXRpYWxTY3JlZW49MiZob21lU2NyZWVuPWZhbHNlJnNjcmVlbnM9MScsIFsgYSwgYiBdLCBhc3NlcnQsIHtcbiAgICAgIGhvbWVTY3JlZW46IG51bGwsXG4gICAgICBpbml0aWFsU2NyZWVuOiBhLFxuICAgICAgc2VsZWN0ZWRTaW1TY3JlZW5zOiBbIGEgXSxcbiAgICAgIHNjcmVlbnM6IFsgYSBdLFxuICAgICAgYWxsU2NyZWVuc0NyZWF0ZWQ6IGZhbHNlXG4gICAgfSApO1xuXG4gICAgLy8gTGlrZSBwaC1zY2FsZV9lbi5odG1sP3NjcmVlbnM9MSw0XG4gICAgdGVzdFZhbGlkU2NyZWVuU2VsZWN0b3IoICc/c2NyZWVucz0xLDQnLCBbIGEsIGIsIGMgXSwgYXNzZXJ0LCB7XG4gICAgICBob21lU2NyZWVuOiBocyxcbiAgICAgIGluaXRpYWxTY3JlZW46IGhzLFxuICAgICAgc2VsZWN0ZWRTaW1TY3JlZW5zOiBbIGEsIGIsIGMgXSxcbiAgICAgIHNjcmVlbnM6IFsgaHMsIGEsIGIsIGMgXSxcbiAgICAgIGFsbFNjcmVlbnNDcmVhdGVkOiB0cnVlXG4gICAgfSApO1xuXG4gICAgLy8gc2luZ2xlLXNjcmVlblxuICAgIHRlc3RWYWxpZFNjcmVlblNlbGVjdG9yKCAnP2luaXRpYWxTY3JlZW49MCcsIFsgYSBdLCBhc3NlcnQsIHtcbiAgICAgIGhvbWVTY3JlZW46IG51bGwsXG4gICAgICBpbml0aWFsU2NyZWVuOiBhLFxuICAgICAgc2VsZWN0ZWRTaW1TY3JlZW5zOiBbIGEgXSxcbiAgICAgIHNjcmVlbnM6IFsgYSBdLFxuICAgICAgYWxsU2NyZWVuc0NyZWF0ZWQ6IHRydWVcbiAgICB9ICk7XG4gICAgdGVzdFZhbGlkU2NyZWVuU2VsZWN0b3IoICc/aW5pdGlhbFNjcmVlbj0yJywgWyBhIF0sIGFzc2VydCwge1xuICAgICAgaG9tZVNjcmVlbjogbnVsbCxcbiAgICAgIGluaXRpYWxTY3JlZW46IGEsXG4gICAgICBzZWxlY3RlZFNpbVNjcmVlbnM6IFsgYSBdLFxuICAgICAgc2NyZWVuczogWyBhIF0sXG4gICAgICBhbGxTY3JlZW5zQ3JlYXRlZDogdHJ1ZVxuICAgIH0gKTtcbiAgICB0ZXN0VmFsaWRTY3JlZW5TZWxlY3RvciggJz9ob21lU2NyZWVuPXRydWUnLCBbIGEgXSwgYXNzZXJ0LCB7XG4gICAgICBob21lU2NyZWVuOiBudWxsLFxuICAgICAgaW5pdGlhbFNjcmVlbjogYSxcbiAgICAgIHNlbGVjdGVkU2ltU2NyZWVuczogWyBhIF0sXG4gICAgICBzY3JlZW5zOiBbIGEgXSxcbiAgICAgIGFsbFNjcmVlbnNDcmVhdGVkOiB0cnVlXG4gICAgfSApO1xuICAgIHRlc3RWYWxpZFNjcmVlblNlbGVjdG9yKCAnP3NjcmVlbnM9MCcsIFsgYSBdLCBhc3NlcnQsIHtcbiAgICAgIGhvbWVTY3JlZW46IG51bGwsXG4gICAgICBpbml0aWFsU2NyZWVuOiBhLFxuICAgICAgc2VsZWN0ZWRTaW1TY3JlZW5zOiBbIGEgXSxcbiAgICAgIHNjcmVlbnM6IFsgYSBdLFxuICAgICAgYWxsU2NyZWVuc0NyZWF0ZWQ6IHRydWVcbiAgICB9ICk7XG4gICAgdGVzdFZhbGlkU2NyZWVuU2VsZWN0b3IoICc/c2NyZWVucz0yJywgWyBhIF0sIGFzc2VydCwge1xuICAgICAgaG9tZVNjcmVlbjogbnVsbCxcbiAgICAgIGluaXRpYWxTY3JlZW46IGEsXG4gICAgICBzZWxlY3RlZFNpbVNjcmVlbnM6IFsgYSBdLFxuICAgICAgc2NyZWVuczogWyBhIF0sXG4gICAgICBhbGxTY3JlZW5zQ3JlYXRlZDogdHJ1ZVxuICAgIH0gKTtcblxuICAgIHRlc3RWYWxpZFNjcmVlblNlbGVjdG9yKCAnP3NjcmVlbnM9MicsIFsgYSBdLCBhc3NlcnQsIHtcbiAgICAgIGhvbWVTY3JlZW46IG51bGwsXG4gICAgICBpbml0aWFsU2NyZWVuOiBhLFxuICAgICAgc2VsZWN0ZWRTaW1TY3JlZW5zOiBbIGEgXSxcbiAgICAgIHNjcmVlbnM6IFsgYSBdLFxuICAgICAgYWxsU2NyZWVuc0NyZWF0ZWQ6IHRydWVcbiAgICB9ICk7XG5cbiAgICAvLyBUaGVzZSBjb250YWluIGVycm9ycywgZGlzcGxheSB3YXJuaW5nIGRpYWxvZywgYW5kIHJldmVydCB0byBkZWZhdWx0LlxuICAgIC8vIGxpa2UgcGgtc2NhbGUtYmFzaWNzX2VuLmh0bWw/c2NyZWVucz0yLDFcbiAgICB0ZXN0VmFsaWRTY3JlZW5TZWxlY3RvciggJz9zY3JlZW5zPTIsMScsIFsgYSBdLCBhc3NlcnQsIHtcbiAgICAgIGhvbWVTY3JlZW46IG51bGwsXG4gICAgICBpbml0aWFsU2NyZWVuOiBhLFxuICAgICAgc2VsZWN0ZWRTaW1TY3JlZW5zOiBbIGEgXSxcbiAgICAgIHNjcmVlbnM6IFsgYSBdLFxuICAgICAgYWxsU2NyZWVuc0NyZWF0ZWQ6IHRydWVcbiAgICB9ICk7XG5cbiAgICB0ZXN0VmFsaWRTY3JlZW5TZWxlY3RvciggJz9zY3JlZW5zPTEuMixTY3JlZW4yJywgWyBhLCBiLCBjIF0sIGFzc2VydCwge1xuICAgICAgaG9tZVNjcmVlbjogaHMsXG4gICAgICBpbml0aWFsU2NyZWVuOiBocyxcbiAgICAgIHNlbGVjdGVkU2ltU2NyZWVuczogWyBhLCBiLCBjIF0sXG4gICAgICBzY3JlZW5zOiBbIGhzLCBhLCBiLCBjIF0sXG4gICAgICBhbGxTY3JlZW5zQ3JlYXRlZDogdHJ1ZVxuICAgIH0gKTtcbiAgfVxuICBlbHNlIHtcbiAgICBhc3NlcnQub2soIHRydWUsICdjYW5ub3QgdGVzdCBmb3IgZ3JhY2Ugd2hlbiBhc3NlcnRpb25zIGFyZSBlbmFibGVkJyApO1xuICB9XG59ICk7Il0sIm5hbWVzIjpbInNlbGVjdFNjcmVlbnMiLCJhIiwiYiIsImMiLCJocyIsImdldFF1ZXJ5UGFyYW1ldGVyVmFsdWVzIiwicXVlcnlTdHJpbmciLCJRdWVyeVN0cmluZ01hY2hpbmUiLCJnZXRBbGxGb3JTdHJpbmciLCJob21lU2NyZWVuIiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsInB1YmxpYyIsImluaXRpYWxTY3JlZW4iLCJzY3JlZW5zIiwiZWxlbWVudFNjaGVtYSIsImlzVmFsaWRWYWx1ZSIsIk51bWJlciIsImlzSW50ZWdlciIsInZhbHVlIiwibGVuZ3RoIiwiXyIsInVuaXEiLCJmb3JtYXRNZXNzYWdlIiwia2V5IiwiZXhwZWN0ZWRSZXN1bHQiLCJyZXN1bHQiLCJkZXNjcmlwdGlvbiIsImdldERlc2NyaXB0aW9uIiwiYWxsU2ltU2NyZWVucyIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0ZXN0VmFsaWRTY3JlZW5TZWxlY3RvciIsImFzc2VydCIsInF1ZXJ5UGFyYW1ldGVyVmFsdWVzIiwiY29udGFpbnNLZXlGb3JTdHJpbmciLCJub29wIiwib2siLCJpc0VxdWFsIiwic2VsZWN0ZWRTaW1TY3JlZW5zIiwiYWxsU2NyZWVuc0NyZWF0ZWQiLCJRVW5pdCIsInRlc3QiLCJ0ZXN0SW52YWxpZFNjcmVlblNlbGVjdG9yIiwid2luZG93IiwidGhyb3dzIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUlELE9BQU9BLG1CQUF5QyxxQkFBcUI7QUFFckUsaUlBQWlJO0FBQ2pJLE1BQU1DLElBQUk7QUFDVixNQUFNQyxJQUFJO0FBQ1YsTUFBTUMsSUFBSTtBQUNWLE1BQU1DLEtBQUs7QUFFWCxNQUFNQywwQkFBMEIsQ0FBRUM7SUFFaEMsOEhBQThIO0lBQzlILG1EQUFtRDtJQUNuRCxPQUFPQyxtQkFBbUJDLGVBQWUsQ0FBRTtRQUV6Q0MsWUFBWTtZQUNWQyxNQUFNO1lBQ05DLGNBQWM7WUFDZEMsUUFBUTtRQUNWO1FBRUFDLGVBQWU7WUFDYkgsTUFBTTtZQUNOQyxjQUFjO1lBQ2RDLFFBQVE7UUFFVjtRQUVBRSxTQUFTO1lBQ1BKLE1BQU07WUFDTkssZUFBZTtnQkFDYkwsTUFBTTtnQkFDTk0sY0FBY0MsT0FBT0MsU0FBUztZQUNoQztZQUNBUCxjQUFjO1lBQ2RLLGNBQWMsU0FBVUcsS0FBSztnQkFDM0IsT0FBT0EsVUFBVSxRQUFVQSxNQUFNQyxNQUFNLEtBQUtDLEVBQUVDLElBQUksQ0FBRUgsT0FBUUMsTUFBTSxJQUFJRCxNQUFNQyxNQUFNLEdBQUc7WUFDdkY7WUFDQVIsUUFBUTtRQUNWO0lBQ0YsR0FBR047QUFDTDtBQUVB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