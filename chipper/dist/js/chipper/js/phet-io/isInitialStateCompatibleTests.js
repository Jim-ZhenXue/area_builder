// Copyright 2024, University of Colorado Boulder
// This PhET-iO file requires a license
// USE WITHOUT A LICENSE AGREEMENT IS STRICTLY PROHIBITED.
// For licensing, please contact phethelp@colorado.edu
/**
 * isInitialStateCompatible tests
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import isInitialStateCompatible from '../browser-and-node/isInitialStateCompatible.js';
QUnit.module('isInitialStateCompatible');
QUnit.test('isInitialStateCompatible', (assert)=>{
    // Example 1: Compatible with extra items in test array
    const testObj1 = {
        a: 1,
        b: [
            {
                min: 0,
                max: 5
            },
            {
                min: 6,
                max: 10
            },
            {
                min: 11,
                max: 15
            } // Extra item in test array
        ],
        g: 5
    };
    const groundTruthObj1 = {
        a: 1,
        b: [
            {
                min: 0,
                max: 5
            },
            {
                min: 6,
                max: 10
            }
        ]
    };
    assert.equal(isInitialStateCompatible(groundTruthObj1, testObj1), false);
    // Example 2: Incompatible due to mismatched value
    const groundTruthObj2 = {
        a: 1,
        b: [
            {
                min: 0,
                max: 5
            },
            {
                min: 6,
                max: 15
            } // max value differs
        ]
    };
    assert.equal(isInitialStateCompatible(groundTruthObj2, testObj1), false);
    // Example 3: Compatible with nested objects and extra array items
    const testObj2 = {
        a: 1,
        b: [
            {
                min: 0,
                max: 5,
                extra: 'ignore'
            },
            {
                min: 6,
                max: 10
            },
            {
                min: 11,
                max: 15
            }
        ],
        g: 5
    };
    const groundTruthObj3 = {
        b: [
            {
                min: 0,
                max: 5
            }
        ]
    };
    assert.equal(isInitialStateCompatible(groundTruthObj3, testObj2), false);
    // Example 4: Compatible when groundTruth array has same number of elements
    const groundTruthObj4 = {
        b: [
            {
                min: 0,
                max: 5
            },
            {
                min: 6,
                max: 10
            },
            {
                min: 11,
                max: 15
            }
        ]
    };
    assert.equal(isInitialStateCompatible(groundTruthObj4, testObj2), true);
    // Example 5: Incompatible due to no corresponding test array item
    const groundTruthObj5 = {
        b: [
            {
                min: 0,
                max: 5
            },
            {
                min: 6,
                max: 10
            },
            {
                min: 16,
                max: 20
            } // No compatible item in test array at index 2
        ]
    };
    assert.equal(isInitialStateCompatible(groundTruthObj5, testObj2), false);
    const groundTruthObj6 = {
        a: 1,
        b: [
            {
                min: 0,
                max: 5
            },
            {
                min: 6,
                max: 10
            },
            {
                min: 11,
                max: 15
            },
            {
                min: 0,
                max: 10
            }
        ],
        g: 5
    };
    assert.equal(isInitialStateCompatible(groundTruthObj6, testObj2), false);
    const groundTruthObj7 = {
        a: 1,
        b: [
            {
                min: 0,
                max: 5
            },
            {
                min: 6,
                max: 10
            }
        ],
        g: 5
    };
    assert.equal(isInitialStateCompatible(groundTruthObj7, testObj2), false);
    // Example 6: Compatible with deeply nested structures
    const testObjA = {
        user: {
            id: 123,
            name: 'Alice',
            roles: [
                'admin',
                'editor',
                'viewer'
            ],
            preferences: {
                theme: 'dark',
                notifications: true
            }
        },
        metadata: {
            createdAt: '2023-01-01',
            updatedAt: '2023-06-01'
        }
    };
    const groundTruthObjA = {
        user: {
            id: 123,
            roles: [
                'admin',
                'editor'
            ],
            preferences: {
                theme: 'dark'
            }
        }
    };
    assert.equal(isInitialStateCompatible(groundTruthObjA, testObjA), false);
    // Example 7: Incompatible due to missing role at specific index
    const groundTruthObjB = {
        user: {
            id: 123,
            roles: [
                'admin',
                'viewer'
            ] // 'manager' role not present at index 1
        }
    };
    assert.equal(isInitialStateCompatible(groundTruthObjB, testObjA), false);
    // Example 8: Compatible with multiple schema items in groundTruth array
    const testObjC = {
        products: [
            {
                id: 1,
                name: 'Laptop',
                specs: {
                    ram: '16GB',
                    storage: '512GB'
                }
            },
            {
                id: 2,
                name: 'Phone',
                specs: {
                    ram: '8GB',
                    storage: '256GB'
                }
            },
            {
                id: 3,
                name: 'Tablet',
                specs: {
                    ram: '4GB',
                    storage: '128GB'
                }
            }
        ]
    };
    const groundTruthObjC = {
        products: [
            {
                name: 'Laptop',
                specs: {
                    ram: '16GB'
                }
            },
            {
                name: 'Phone',
                specs: {
                    storage: '256GB'
                }
            },
            {
                name: 'Tablet'
            }
        ]
    };
    assert.equal(isInitialStateCompatible(groundTruthObjC, testObjC), true);
    // Example 9: Incompatible due to mismatched nested value
    const groundTruthObjD = {
        products: [
            {
                name: 'Laptop',
                specs: {
                    ram: '32GB'
                }
            } // ram value differs
        ]
    };
    assert.equal(isInitialStateCompatible(groundTruthObjD, testObjC), false);
    assert.equal(isInitialStateCompatible({}, {}), true);
    assert.equal(isInitialStateCompatible({}, {
        hi: true
    }), true);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL3BoZXQtaW8vaXNJbml0aWFsU3RhdGVDb21wYXRpYmxlVGVzdHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuLy8gVGhpcyBQaEVULWlPIGZpbGUgcmVxdWlyZXMgYSBsaWNlbnNlXG4vLyBVU0UgV0lUSE9VVCBBIExJQ0VOU0UgQUdSRUVNRU5UIElTIFNUUklDVExZIFBST0hJQklURUQuXG4vLyBGb3IgbGljZW5zaW5nLCBwbGVhc2UgY29udGFjdCBwaGV0aGVscEBjb2xvcmFkby5lZHVcblxuLyoqXG4gKiBpc0luaXRpYWxTdGF0ZUNvbXBhdGlibGUgdGVzdHNcbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cblxuaW1wb3J0IGlzSW5pdGlhbFN0YXRlQ29tcGF0aWJsZSBmcm9tICcuLi9icm93c2VyLWFuZC1ub2RlL2lzSW5pdGlhbFN0YXRlQ29tcGF0aWJsZS5qcyc7XG5cblFVbml0Lm1vZHVsZSggJ2lzSW5pdGlhbFN0YXRlQ29tcGF0aWJsZScgKTtcblxuUVVuaXQudGVzdCggJ2lzSW5pdGlhbFN0YXRlQ29tcGF0aWJsZScsIGFzc2VydCA9PiB7XG5cbiAgLy8gRXhhbXBsZSAxOiBDb21wYXRpYmxlIHdpdGggZXh0cmEgaXRlbXMgaW4gdGVzdCBhcnJheVxuICBjb25zdCB0ZXN0T2JqMSA9IHtcbiAgICBhOiAxLFxuICAgIGI6IFtcbiAgICAgIHsgbWluOiAwLCBtYXg6IDUgfSxcbiAgICAgIHsgbWluOiA2LCBtYXg6IDEwIH0sXG4gICAgICB7IG1pbjogMTEsIG1heDogMTUgfSAvLyBFeHRyYSBpdGVtIGluIHRlc3QgYXJyYXlcbiAgICBdLFxuICAgIGc6IDVcbiAgfTtcblxuICBjb25zdCBncm91bmRUcnV0aE9iajEgPSB7XG4gICAgYTogMSxcbiAgICBiOiBbXG4gICAgICB7IG1pbjogMCwgbWF4OiA1IH0sXG4gICAgICB7IG1pbjogNiwgbWF4OiAxMCB9XG4gICAgXVxuICB9O1xuICBhc3NlcnQuZXF1YWwoIGlzSW5pdGlhbFN0YXRlQ29tcGF0aWJsZSggZ3JvdW5kVHJ1dGhPYmoxLCB0ZXN0T2JqMSApLCBmYWxzZSApO1xuXG4gIC8vIEV4YW1wbGUgMjogSW5jb21wYXRpYmxlIGR1ZSB0byBtaXNtYXRjaGVkIHZhbHVlXG4gIGNvbnN0IGdyb3VuZFRydXRoT2JqMiA9IHtcbiAgICBhOiAxLFxuICAgIGI6IFtcbiAgICAgIHsgbWluOiAwLCBtYXg6IDUgfSxcbiAgICAgIHsgbWluOiA2LCBtYXg6IDE1IH0gLy8gbWF4IHZhbHVlIGRpZmZlcnNcbiAgICBdXG4gIH07XG5cbiAgYXNzZXJ0LmVxdWFsKCBpc0luaXRpYWxTdGF0ZUNvbXBhdGlibGUoIGdyb3VuZFRydXRoT2JqMiwgdGVzdE9iajEgKSwgZmFsc2UgKTtcblxuICAvLyBFeGFtcGxlIDM6IENvbXBhdGlibGUgd2l0aCBuZXN0ZWQgb2JqZWN0cyBhbmQgZXh0cmEgYXJyYXkgaXRlbXNcbiAgY29uc3QgdGVzdE9iajIgPSB7XG4gICAgYTogMSxcbiAgICBiOiBbXG4gICAgICB7IG1pbjogMCwgbWF4OiA1LCBleHRyYTogJ2lnbm9yZScgfSxcbiAgICAgIHsgbWluOiA2LCBtYXg6IDEwIH0sXG4gICAgICB7IG1pbjogMTEsIG1heDogMTUgfVxuICAgIF0sXG4gICAgZzogNVxuICB9O1xuXG4gIGNvbnN0IGdyb3VuZFRydXRoT2JqMyA9IHtcbiAgICBiOiBbXG4gICAgICB7IG1pbjogMCwgbWF4OiA1IH1cbiAgICBdXG4gIH07XG5cbiAgYXNzZXJ0LmVxdWFsKCBpc0luaXRpYWxTdGF0ZUNvbXBhdGlibGUoIGdyb3VuZFRydXRoT2JqMywgdGVzdE9iajIgKSwgZmFsc2UgKTtcblxuICAvLyBFeGFtcGxlIDQ6IENvbXBhdGlibGUgd2hlbiBncm91bmRUcnV0aCBhcnJheSBoYXMgc2FtZSBudW1iZXIgb2YgZWxlbWVudHNcbiAgY29uc3QgZ3JvdW5kVHJ1dGhPYmo0ID0ge1xuICAgIGI6IFtcbiAgICAgIHsgbWluOiAwLCBtYXg6IDUgfSxcbiAgICAgIHsgbWluOiA2LCBtYXg6IDEwIH0sXG4gICAgICB7IG1pbjogMTEsIG1heDogMTUgfVxuICAgIF1cbiAgfTtcblxuICBhc3NlcnQuZXF1YWwoIGlzSW5pdGlhbFN0YXRlQ29tcGF0aWJsZSggZ3JvdW5kVHJ1dGhPYmo0LCB0ZXN0T2JqMiApLCB0cnVlICk7XG5cbiAgLy8gRXhhbXBsZSA1OiBJbmNvbXBhdGlibGUgZHVlIHRvIG5vIGNvcnJlc3BvbmRpbmcgdGVzdCBhcnJheSBpdGVtXG4gIGNvbnN0IGdyb3VuZFRydXRoT2JqNSA9IHtcbiAgICBiOiBbXG4gICAgICB7IG1pbjogMCwgbWF4OiA1IH0sXG4gICAgICB7IG1pbjogNiwgbWF4OiAxMCB9LFxuICAgICAgeyBtaW46IDE2LCBtYXg6IDIwIH0gLy8gTm8gY29tcGF0aWJsZSBpdGVtIGluIHRlc3QgYXJyYXkgYXQgaW5kZXggMlxuICAgIF1cbiAgfTtcblxuICBhc3NlcnQuZXF1YWwoIGlzSW5pdGlhbFN0YXRlQ29tcGF0aWJsZSggZ3JvdW5kVHJ1dGhPYmo1LCB0ZXN0T2JqMiApLCBmYWxzZSApO1xuXG5cbiAgY29uc3QgZ3JvdW5kVHJ1dGhPYmo2ID0ge1xuICAgIGE6IDEsXG4gICAgYjogW1xuICAgICAgeyBtaW46IDAsIG1heDogNSB9LFxuICAgICAgeyBtaW46IDYsIG1heDogMTAgfSxcbiAgICAgIHsgbWluOiAxMSwgbWF4OiAxNSB9LFxuICAgICAgeyBtaW46IDAsIG1heDogMTAgfVxuICAgIF0sXG4gICAgZzogNVxuICB9O1xuXG4gIGFzc2VydC5lcXVhbCggaXNJbml0aWFsU3RhdGVDb21wYXRpYmxlKCBncm91bmRUcnV0aE9iajYsIHRlc3RPYmoyICksIGZhbHNlICk7XG5cbiAgY29uc3QgZ3JvdW5kVHJ1dGhPYmo3ID0ge1xuICAgIGE6IDEsXG4gICAgYjogW1xuICAgICAgeyBtaW46IDAsIG1heDogNSB9LFxuICAgICAgeyBtaW46IDYsIG1heDogMTAgfVxuICAgIF0sXG4gICAgZzogNVxuICB9O1xuXG4gIGFzc2VydC5lcXVhbCggaXNJbml0aWFsU3RhdGVDb21wYXRpYmxlKCBncm91bmRUcnV0aE9iajcsIHRlc3RPYmoyICksIGZhbHNlICk7XG5cbiAgLy8gRXhhbXBsZSA2OiBDb21wYXRpYmxlIHdpdGggZGVlcGx5IG5lc3RlZCBzdHJ1Y3R1cmVzXG4gIGNvbnN0IHRlc3RPYmpBID0ge1xuICAgIHVzZXI6IHtcbiAgICAgIGlkOiAxMjMsXG4gICAgICBuYW1lOiAnQWxpY2UnLFxuICAgICAgcm9sZXM6IFsgJ2FkbWluJywgJ2VkaXRvcicsICd2aWV3ZXInIF0sXG4gICAgICBwcmVmZXJlbmNlczoge1xuICAgICAgICB0aGVtZTogJ2RhcmsnLFxuICAgICAgICBub3RpZmljYXRpb25zOiB0cnVlXG4gICAgICB9XG4gICAgfSxcbiAgICBtZXRhZGF0YToge1xuICAgICAgY3JlYXRlZEF0OiAnMjAyMy0wMS0wMScsXG4gICAgICB1cGRhdGVkQXQ6ICcyMDIzLTA2LTAxJ1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBncm91bmRUcnV0aE9iakEgPSB7XG4gICAgdXNlcjoge1xuICAgICAgaWQ6IDEyMyxcbiAgICAgIHJvbGVzOiBbICdhZG1pbicsICdlZGl0b3InIF0sXG4gICAgICBwcmVmZXJlbmNlczoge1xuICAgICAgICB0aGVtZTogJ2RhcmsnXG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGFzc2VydC5lcXVhbCggaXNJbml0aWFsU3RhdGVDb21wYXRpYmxlKCBncm91bmRUcnV0aE9iakEsIHRlc3RPYmpBICksIGZhbHNlICk7XG5cbiAgLy8gRXhhbXBsZSA3OiBJbmNvbXBhdGlibGUgZHVlIHRvIG1pc3Npbmcgcm9sZSBhdCBzcGVjaWZpYyBpbmRleFxuICBjb25zdCBncm91bmRUcnV0aE9iakIgPSB7XG4gICAgdXNlcjoge1xuICAgICAgaWQ6IDEyMyxcbiAgICAgIHJvbGVzOiBbICdhZG1pbicsICd2aWV3ZXInIF0gLy8gJ21hbmFnZXInIHJvbGUgbm90IHByZXNlbnQgYXQgaW5kZXggMVxuICAgIH1cbiAgfTtcblxuICBhc3NlcnQuZXF1YWwoIGlzSW5pdGlhbFN0YXRlQ29tcGF0aWJsZSggZ3JvdW5kVHJ1dGhPYmpCLCB0ZXN0T2JqQSApLCBmYWxzZSApO1xuXG4gIC8vIEV4YW1wbGUgODogQ29tcGF0aWJsZSB3aXRoIG11bHRpcGxlIHNjaGVtYSBpdGVtcyBpbiBncm91bmRUcnV0aCBhcnJheVxuICBjb25zdCB0ZXN0T2JqQyA9IHtcbiAgICBwcm9kdWN0czogW1xuICAgICAgeyBpZDogMSwgbmFtZTogJ0xhcHRvcCcsIHNwZWNzOiB7IHJhbTogJzE2R0InLCBzdG9yYWdlOiAnNTEyR0InIH0gfSxcbiAgICAgIHsgaWQ6IDIsIG5hbWU6ICdQaG9uZScsIHNwZWNzOiB7IHJhbTogJzhHQicsIHN0b3JhZ2U6ICcyNTZHQicgfSB9LFxuICAgICAgeyBpZDogMywgbmFtZTogJ1RhYmxldCcsIHNwZWNzOiB7IHJhbTogJzRHQicsIHN0b3JhZ2U6ICcxMjhHQicgfSB9XG4gICAgXVxuICB9O1xuXG4gIGNvbnN0IGdyb3VuZFRydXRoT2JqQyA9IHtcbiAgICBwcm9kdWN0czogW1xuICAgICAgeyBuYW1lOiAnTGFwdG9wJywgc3BlY3M6IHsgcmFtOiAnMTZHQicgfSB9LFxuICAgICAgeyBuYW1lOiAnUGhvbmUnLCBzcGVjczogeyBzdG9yYWdlOiAnMjU2R0InIH0gfSxcbiAgICAgIHsgbmFtZTogJ1RhYmxldCcgfVxuXG4gICAgXVxuICB9O1xuXG4gIGFzc2VydC5lcXVhbCggaXNJbml0aWFsU3RhdGVDb21wYXRpYmxlKCBncm91bmRUcnV0aE9iakMsIHRlc3RPYmpDICksIHRydWUgKTtcblxuICAvLyBFeGFtcGxlIDk6IEluY29tcGF0aWJsZSBkdWUgdG8gbWlzbWF0Y2hlZCBuZXN0ZWQgdmFsdWVcbiAgY29uc3QgZ3JvdW5kVHJ1dGhPYmpEID0ge1xuICAgIHByb2R1Y3RzOiBbXG4gICAgICB7IG5hbWU6ICdMYXB0b3AnLCBzcGVjczogeyByYW06ICczMkdCJyB9IH0gLy8gcmFtIHZhbHVlIGRpZmZlcnNcbiAgICBdXG4gIH07XG5cbiAgYXNzZXJ0LmVxdWFsKCBpc0luaXRpYWxTdGF0ZUNvbXBhdGlibGUoIGdyb3VuZFRydXRoT2JqRCwgdGVzdE9iakMgKSwgZmFsc2UgKTtcblxuICBhc3NlcnQuZXF1YWwoIGlzSW5pdGlhbFN0YXRlQ29tcGF0aWJsZSgge30sIHt9ICksIHRydWUgKTtcbiAgYXNzZXJ0LmVxdWFsKCBpc0luaXRpYWxTdGF0ZUNvbXBhdGlibGUoIHt9LCB7IGhpOiB0cnVlIH0gKSwgdHJ1ZSApO1xufSApOyJdLCJuYW1lcyI6WyJpc0luaXRpYWxTdGF0ZUNvbXBhdGlibGUiLCJRVW5pdCIsIm1vZHVsZSIsInRlc3QiLCJhc3NlcnQiLCJ0ZXN0T2JqMSIsImEiLCJiIiwibWluIiwibWF4IiwiZyIsImdyb3VuZFRydXRoT2JqMSIsImVxdWFsIiwiZ3JvdW5kVHJ1dGhPYmoyIiwidGVzdE9iajIiLCJleHRyYSIsImdyb3VuZFRydXRoT2JqMyIsImdyb3VuZFRydXRoT2JqNCIsImdyb3VuZFRydXRoT2JqNSIsImdyb3VuZFRydXRoT2JqNiIsImdyb3VuZFRydXRoT2JqNyIsInRlc3RPYmpBIiwidXNlciIsImlkIiwibmFtZSIsInJvbGVzIiwicHJlZmVyZW5jZXMiLCJ0aGVtZSIsIm5vdGlmaWNhdGlvbnMiLCJtZXRhZGF0YSIsImNyZWF0ZWRBdCIsInVwZGF0ZWRBdCIsImdyb3VuZFRydXRoT2JqQSIsImdyb3VuZFRydXRoT2JqQiIsInRlc3RPYmpDIiwicHJvZHVjdHMiLCJzcGVjcyIsInJhbSIsInN0b3JhZ2UiLCJncm91bmRUcnV0aE9iakMiLCJncm91bmRUcnV0aE9iakQiLCJoaSJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBQ2pELHVDQUF1QztB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