// Copyright 2018-2023, University of Colorado Boulder
/**
 * Tests for dimensionMap
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import dimensionMap from './dimensionMap.js';
QUnit.module('dimensionMap');
QUnit.test('1 dimensional', (assert)=>{
    function checkMap(values, map, message) {
        assert.ok(_.isEqual(dimensionMap(1, values, map), values.map(map)), message);
    }
    checkMap([
        1,
        2,
        4
    ], (x)=>x, 'Identity');
    checkMap([
        1,
        2,
        4
    ], (x)=>2 * x, 'Simple map');
    checkMap([
        1,
        2,
        4
    ], (x, index)=>2 * x + index, 'Indexed map');
});
QUnit.test('multidimensional', (assert)=>{
    const dim2 = [
        [
            1,
            4,
            10
        ],
        [
            5,
            3,
            -1
        ]
    ];
    const dim3 = [
        [
            [
                1,
                9,
                25
            ],
            [
                23
            ]
        ],
        [
            [
                5,
                5,
                5,
                5
            ],
            [
                2,
                9
            ],
            [
                1
            ],
            [
                3,
                -10
            ]
        ]
    ];
    assert.ok(_.isEqual(dimensionMap(2, dim2, (x)=>x), dim2), '2-dimensional identity');
    assert.ok(_.isEqual(dimensionMap(3, dim3, (x)=>x), dim3), '3-dimensional identity');
    assert.ok(_.isEqual(dimensionMap(2, dim2, (x, idx1, idx2)=>dim2[idx1][idx2]), dim2), '2-dimensional indexing-based');
    assert.ok(_.isEqual(dimensionMap(3, dim3, (x, idx1, idx2, idx3)=>dim3[idx1][idx2][idx3]), dim3), '3-dimensional indexing-based');
    assert.ok(_.isEqual(dimensionMap(2, dim2, (x)=>2 * x), [
        [
            2,
            8,
            20
        ],
        [
            10,
            6,
            -2
        ]
    ]), '2-dimensional times 2');
    assert.ok(_.isEqual(dimensionMap(3, dim3, (x)=>2 * x), [
        [
            [
                2,
                18,
                50
            ],
            [
                46
            ]
        ],
        [
            [
                10,
                10,
                10,
                10
            ],
            [
                4,
                18
            ],
            [
                2
            ],
            [
                6,
                -20
            ]
        ]
    ]), '3-dimensional times 2');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9kaW1lbnNpb25NYXBUZXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBUZXN0cyBmb3IgZGltZW5zaW9uTWFwXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBkaW1lbnNpb25NYXAgZnJvbSAnLi9kaW1lbnNpb25NYXAuanMnO1xuXG5RVW5pdC5tb2R1bGUoICdkaW1lbnNpb25NYXAnICk7XG5cblFVbml0LnRlc3QoICcxIGRpbWVuc2lvbmFsJywgYXNzZXJ0ID0+IHtcbiAgZnVuY3Rpb24gY2hlY2tNYXAoIHZhbHVlczogbnVtYmVyW10sIG1hcDogKCBpbnB1dDogbnVtYmVyLCBpbmRleDogbnVtYmVyICkgPT4gbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcgKTogdm9pZCB7XG4gICAgYXNzZXJ0Lm9rKCBfLmlzRXF1YWwoIGRpbWVuc2lvbk1hcCggMSwgdmFsdWVzLCBtYXAgKSwgdmFsdWVzLm1hcCggbWFwICkgKSwgbWVzc2FnZSApO1xuICB9XG5cbiAgY2hlY2tNYXAoIFsgMSwgMiwgNCBdLCB4ID0+IHgsICdJZGVudGl0eScgKTtcbiAgY2hlY2tNYXAoIFsgMSwgMiwgNCBdLCB4ID0+IDIgKiB4LCAnU2ltcGxlIG1hcCcgKTtcbiAgY2hlY2tNYXAoIFsgMSwgMiwgNCBdLCAoIHgsIGluZGV4ICkgPT4gMiAqIHggKyBpbmRleCwgJ0luZGV4ZWQgbWFwJyApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnbXVsdGlkaW1lbnNpb25hbCcsIGFzc2VydCA9PiB7XG4gIGNvbnN0IGRpbTIgPSBbXG4gICAgWyAxLCA0LCAxMCBdLFxuICAgIFsgNSwgMywgLTEgXVxuICBdO1xuXG4gIGNvbnN0IGRpbTMgPSBbXG4gICAgW1xuICAgICAgWyAxLCA5LCAyNSBdLFxuICAgICAgWyAyMyBdXG4gICAgXSxcbiAgICBbXG4gICAgICBbIDUsIDUsIDUsIDUgXSxcbiAgICAgIFsgMiwgOSBdLFxuICAgICAgWyAxIF0sXG4gICAgICBbIDMsIC0xMCBdXG4gICAgXVxuICBdO1xuXG4gIGFzc2VydC5vayggXy5pc0VxdWFsKCBkaW1lbnNpb25NYXA8bnVtYmVyLCBudW1iZXI+KCAyLCBkaW0yLCB4ID0+IHggKSwgZGltMiApLCAnMi1kaW1lbnNpb25hbCBpZGVudGl0eScgKTtcbiAgYXNzZXJ0Lm9rKCBfLmlzRXF1YWwoIGRpbWVuc2lvbk1hcDxudW1iZXIsIG51bWJlcj4oIDMsIGRpbTMsIHggPT4geCApLCBkaW0zICksICczLWRpbWVuc2lvbmFsIGlkZW50aXR5JyApO1xuICBhc3NlcnQub2soIF8uaXNFcXVhbCggZGltZW5zaW9uTWFwPG51bWJlciwgbnVtYmVyPiggMiwgZGltMiwgKCB4LCBpZHgxLCBpZHgyICkgPT4gZGltMlsgaWR4MSBdWyBpZHgyIF0gKSwgZGltMiApLCAnMi1kaW1lbnNpb25hbCBpbmRleGluZy1iYXNlZCcgKTtcbiAgYXNzZXJ0Lm9rKCBfLmlzRXF1YWwoIGRpbWVuc2lvbk1hcDxudW1iZXIsIG51bWJlcj4oIDMsIGRpbTMsICggeCwgaWR4MSwgaWR4MiwgaWR4MyApID0+IGRpbTNbIGlkeDEgXVsgaWR4MiBdWyBpZHgzIF0gKSwgZGltMyApLCAnMy1kaW1lbnNpb25hbCBpbmRleGluZy1iYXNlZCcgKTtcbiAgYXNzZXJ0Lm9rKCBfLmlzRXF1YWwoIGRpbWVuc2lvbk1hcDxudW1iZXIsIG51bWJlcj4oIDIsIGRpbTIsIHggPT4gMiAqIHggKSwgW1xuICAgIFsgMiwgOCwgMjAgXSxcbiAgICBbIDEwLCA2LCAtMiBdXG4gIF0gKSwgJzItZGltZW5zaW9uYWwgdGltZXMgMicgKTtcbiAgYXNzZXJ0Lm9rKCBfLmlzRXF1YWwoIGRpbWVuc2lvbk1hcCggMywgZGltMywgeCA9PiAyICogeCApLCBbXG4gICAgW1xuICAgICAgWyAyLCAxOCwgNTAgXSxcbiAgICAgIFsgNDYgXVxuICAgIF0sXG4gICAgW1xuICAgICAgWyAxMCwgMTAsIDEwLCAxMCBdLFxuICAgICAgWyA0LCAxOCBdLFxuICAgICAgWyAyIF0sXG4gICAgICBbIDYsIC0yMCBdXG4gICAgXVxuICBdICksICczLWRpbWVuc2lvbmFsIHRpbWVzIDInICk7XG59ICk7Il0sIm5hbWVzIjpbImRpbWVuc2lvbk1hcCIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsImNoZWNrTWFwIiwidmFsdWVzIiwibWFwIiwibWVzc2FnZSIsIm9rIiwiXyIsImlzRXF1YWwiLCJ4IiwiaW5kZXgiLCJkaW0yIiwiZGltMyIsImlkeDEiLCJpZHgyIiwiaWR4MyJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxrQkFBa0Isb0JBQW9CO0FBRTdDQyxNQUFNQyxNQUFNLENBQUU7QUFFZEQsTUFBTUUsSUFBSSxDQUFFLGlCQUFpQkMsQ0FBQUE7SUFDM0IsU0FBU0MsU0FBVUMsTUFBZ0IsRUFBRUMsR0FBK0MsRUFBRUMsT0FBZTtRQUNuR0osT0FBT0ssRUFBRSxDQUFFQyxFQUFFQyxPQUFPLENBQUVYLGFBQWMsR0FBR00sUUFBUUMsTUFBT0QsT0FBT0MsR0FBRyxDQUFFQSxPQUFTQztJQUM3RTtJQUVBSCxTQUFVO1FBQUU7UUFBRztRQUFHO0tBQUcsRUFBRU8sQ0FBQUEsSUFBS0EsR0FBRztJQUMvQlAsU0FBVTtRQUFFO1FBQUc7UUFBRztLQUFHLEVBQUVPLENBQUFBLElBQUssSUFBSUEsR0FBRztJQUNuQ1AsU0FBVTtRQUFFO1FBQUc7UUFBRztLQUFHLEVBQUUsQ0FBRU8sR0FBR0MsUUFBVyxJQUFJRCxJQUFJQyxPQUFPO0FBQ3hEO0FBRUFaLE1BQU1FLElBQUksQ0FBRSxvQkFBb0JDLENBQUFBO0lBQzlCLE1BQU1VLE9BQU87UUFDWDtZQUFFO1lBQUc7WUFBRztTQUFJO1FBQ1o7WUFBRTtZQUFHO1lBQUcsQ0FBQztTQUFHO0tBQ2I7SUFFRCxNQUFNQyxPQUFPO1FBQ1g7WUFDRTtnQkFBRTtnQkFBRztnQkFBRzthQUFJO1lBQ1o7Z0JBQUU7YUFBSTtTQUNQO1FBQ0Q7WUFDRTtnQkFBRTtnQkFBRztnQkFBRztnQkFBRzthQUFHO1lBQ2Q7Z0JBQUU7Z0JBQUc7YUFBRztZQUNSO2dCQUFFO2FBQUc7WUFDTDtnQkFBRTtnQkFBRyxDQUFDO2FBQUk7U0FDWDtLQUNGO0lBRURYLE9BQU9LLEVBQUUsQ0FBRUMsRUFBRUMsT0FBTyxDQUFFWCxhQUE4QixHQUFHYyxNQUFNRixDQUFBQSxJQUFLQSxJQUFLRSxPQUFRO0lBQy9FVixPQUFPSyxFQUFFLENBQUVDLEVBQUVDLE9BQU8sQ0FBRVgsYUFBOEIsR0FBR2UsTUFBTUgsQ0FBQUEsSUFBS0EsSUFBS0csT0FBUTtJQUMvRVgsT0FBT0ssRUFBRSxDQUFFQyxFQUFFQyxPQUFPLENBQUVYLGFBQThCLEdBQUdjLE1BQU0sQ0FBRUYsR0FBR0ksTUFBTUMsT0FBVUgsSUFBSSxDQUFFRSxLQUFNLENBQUVDLEtBQU0sR0FBSUgsT0FBUTtJQUNsSFYsT0FBT0ssRUFBRSxDQUFFQyxFQUFFQyxPQUFPLENBQUVYLGFBQThCLEdBQUdlLE1BQU0sQ0FBRUgsR0FBR0ksTUFBTUMsTUFBTUMsT0FBVUgsSUFBSSxDQUFFQyxLQUFNLENBQUVDLEtBQU0sQ0FBRUMsS0FBTSxHQUFJSCxPQUFRO0lBQ2hJWCxPQUFPSyxFQUFFLENBQUVDLEVBQUVDLE9BQU8sQ0FBRVgsYUFBOEIsR0FBR2MsTUFBTUYsQ0FBQUEsSUFBSyxJQUFJQSxJQUFLO1FBQ3pFO1lBQUU7WUFBRztZQUFHO1NBQUk7UUFDWjtZQUFFO1lBQUk7WUFBRyxDQUFDO1NBQUc7S0FDZCxHQUFJO0lBQ0xSLE9BQU9LLEVBQUUsQ0FBRUMsRUFBRUMsT0FBTyxDQUFFWCxhQUFjLEdBQUdlLE1BQU1ILENBQUFBLElBQUssSUFBSUEsSUFBSztRQUN6RDtZQUNFO2dCQUFFO2dCQUFHO2dCQUFJO2FBQUk7WUFDYjtnQkFBRTthQUFJO1NBQ1A7UUFDRDtZQUNFO2dCQUFFO2dCQUFJO2dCQUFJO2dCQUFJO2FBQUk7WUFDbEI7Z0JBQUU7Z0JBQUc7YUFBSTtZQUNUO2dCQUFFO2FBQUc7WUFDTDtnQkFBRTtnQkFBRyxDQUFDO2FBQUk7U0FDWDtLQUNGLEdBQUk7QUFDUCJ9