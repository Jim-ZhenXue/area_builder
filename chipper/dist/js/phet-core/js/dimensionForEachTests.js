// Copyright 2018-2023, University of Colorado Boulder
/**
 * Tests for dimensionForEach
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import dimensionForEach from './dimensionForEach.js';
QUnit.module('dimensionForEach');
QUnit.test('1 dimensional', (assert)=>{
    const normalValues = [];
    const ourValues = [];
    const arr = [
        1,
        2,
        4,
        9
    ];
    arr.forEach((element, index)=>{
        normalValues.push({
            element: element,
            index: index
        });
    });
    dimensionForEach(1, arr, (element, index)=>{
        ourValues.push({
            element: element,
            index: index
        });
    });
    assert.ok(_.isEqual(normalValues, ourValues), '1-dimensional comparison');
});
QUnit.test('2 dimensional', (assert)=>{
    const arr = [
        [
            1,
            2,
            4
        ],
        [
            9,
            5
        ]
    ];
    const values = [];
    const expectedValues = [
        {
            element: 1,
            idx1: 0,
            idx2: 0
        },
        {
            element: 2,
            idx1: 0,
            idx2: 1
        },
        {
            element: 4,
            idx1: 0,
            idx2: 2
        },
        {
            element: 9,
            idx1: 1,
            idx2: 0
        },
        {
            element: 5,
            idx1: 1,
            idx2: 1
        }
    ];
    dimensionForEach(2, arr, (element, idx1, idx2)=>{
        values.push({
            element: element,
            idx1: idx1,
            idx2: idx2
        });
    });
    assert.ok(_.isEqual(values, expectedValues), '2-dimensional comparison');
});
QUnit.test('3 dimensional', (assert)=>{
    const arr = [
        [
            [
                1,
                5
            ],
            [
                9,
                2
            ]
        ],
        [
            [
                3,
                3,
                4
            ]
        ]
    ];
    const values = [];
    const expectedValues = [
        {
            element: 1,
            idx1: 0,
            idx2: 0,
            idx3: 0
        },
        {
            element: 5,
            idx1: 0,
            idx2: 0,
            idx3: 1
        },
        {
            element: 9,
            idx1: 0,
            idx2: 1,
            idx3: 0
        },
        {
            element: 2,
            idx1: 0,
            idx2: 1,
            idx3: 1
        },
        {
            element: 3,
            idx1: 1,
            idx2: 0,
            idx3: 0
        },
        {
            element: 3,
            idx1: 1,
            idx2: 0,
            idx3: 1
        },
        {
            element: 4,
            idx1: 1,
            idx2: 0,
            idx3: 2
        }
    ];
    dimensionForEach(3, arr, (element, idx1, idx2, idx3)=>{
        values.push({
            element: element,
            idx1: idx1,
            idx2: idx2,
            idx3: idx3
        });
    });
    assert.ok(_.isEqual(values, expectedValues), '3-dimensional comparison');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9kaW1lbnNpb25Gb3JFYWNoVGVzdHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGVzdHMgZm9yIGRpbWVuc2lvbkZvckVhY2hcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IGRpbWVuc2lvbkZvckVhY2ggZnJvbSAnLi9kaW1lbnNpb25Gb3JFYWNoLmpzJztcblxuUVVuaXQubW9kdWxlKCAnZGltZW5zaW9uRm9yRWFjaCcgKTtcblxudHlwZSBFbGVtZW50ID0geyBlbGVtZW50OiBudW1iZXI7IGluZGV4OiBudW1iZXIgfTtcblxuUVVuaXQudGVzdCggJzEgZGltZW5zaW9uYWwnLCBhc3NlcnQgPT4ge1xuICBjb25zdCBub3JtYWxWYWx1ZXM6IEVsZW1lbnRbXSA9IFtdO1xuICBjb25zdCBvdXJWYWx1ZXM6IEVsZW1lbnRbXSA9IFtdO1xuXG4gIGNvbnN0IGFyciA9IFsgMSwgMiwgNCwgOSBdO1xuXG4gIGFyci5mb3JFYWNoKCAoIGVsZW1lbnQsIGluZGV4ICkgPT4ge1xuICAgIG5vcm1hbFZhbHVlcy5wdXNoKCB7XG4gICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgaW5kZXg6IGluZGV4XG4gICAgfSApO1xuICB9ICk7XG5cbiAgZGltZW5zaW9uRm9yRWFjaCggMSwgYXJyLCAoIGVsZW1lbnQsIGluZGV4ICkgPT4ge1xuICAgIG91clZhbHVlcy5wdXNoKCB7XG4gICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgaW5kZXg6IGluZGV4XG4gICAgfSApO1xuICB9ICk7XG5cbiAgYXNzZXJ0Lm9rKCBfLmlzRXF1YWwoIG5vcm1hbFZhbHVlcywgb3VyVmFsdWVzICksICcxLWRpbWVuc2lvbmFsIGNvbXBhcmlzb24nICk7XG59ICk7XG5cblFVbml0LnRlc3QoICcyIGRpbWVuc2lvbmFsJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgYXJyID0gW1xuICAgIFsgMSwgMiwgNCBdLFxuICAgIFsgOSwgNSBdXG4gIF07XG4gIGNvbnN0IHZhbHVlczogQXJyYXk8eyBlbGVtZW50OiBudW1iZXI7IGlkeDE6IG51bWJlcjsgaWR4MjogbnVtYmVyIH0+ID0gW107XG4gIGNvbnN0IGV4cGVjdGVkVmFsdWVzID0gW1xuICAgIHsgZWxlbWVudDogMSwgaWR4MTogMCwgaWR4MjogMCB9LFxuICAgIHsgZWxlbWVudDogMiwgaWR4MTogMCwgaWR4MjogMSB9LFxuICAgIHsgZWxlbWVudDogNCwgaWR4MTogMCwgaWR4MjogMiB9LFxuICAgIHsgZWxlbWVudDogOSwgaWR4MTogMSwgaWR4MjogMCB9LFxuICAgIHsgZWxlbWVudDogNSwgaWR4MTogMSwgaWR4MjogMSB9XG4gIF07XG5cbiAgZGltZW5zaW9uRm9yRWFjaCggMiwgYXJyLCAoIGVsZW1lbnQsIGlkeDEsIGlkeDIgKSA9PiB7XG4gICAgdmFsdWVzLnB1c2goIHtcbiAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICBpZHgxOiBpZHgxLFxuICAgICAgaWR4MjogaWR4MlxuICAgIH0gKTtcbiAgfSApO1xuXG4gIGFzc2VydC5vayggXy5pc0VxdWFsKCB2YWx1ZXMsIGV4cGVjdGVkVmFsdWVzICksICcyLWRpbWVuc2lvbmFsIGNvbXBhcmlzb24nICk7XG59ICk7XG5cblFVbml0LnRlc3QoICczIGRpbWVuc2lvbmFsJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgYXJyID0gW1xuICAgIFtcbiAgICAgIFsgMSwgNSBdLFxuICAgICAgWyA5LCAyIF1cbiAgICBdLFxuICAgIFtcbiAgICAgIFsgMywgMywgNCBdXG4gICAgXVxuICBdO1xuICBjb25zdCB2YWx1ZXM6IEFycmF5PHsgZWxlbWVudDogbnVtYmVyOyBpZHgxOiBudW1iZXI7IGlkeDI6IG51bWJlcjsgaWR4MzogbnVtYmVyIH0+ID0gW107XG4gIGNvbnN0IGV4cGVjdGVkVmFsdWVzID0gW1xuICAgIHsgZWxlbWVudDogMSwgaWR4MTogMCwgaWR4MjogMCwgaWR4MzogMCB9LFxuICAgIHsgZWxlbWVudDogNSwgaWR4MTogMCwgaWR4MjogMCwgaWR4MzogMSB9LFxuICAgIHsgZWxlbWVudDogOSwgaWR4MTogMCwgaWR4MjogMSwgaWR4MzogMCB9LFxuICAgIHsgZWxlbWVudDogMiwgaWR4MTogMCwgaWR4MjogMSwgaWR4MzogMSB9LFxuICAgIHsgZWxlbWVudDogMywgaWR4MTogMSwgaWR4MjogMCwgaWR4MzogMCB9LFxuICAgIHsgZWxlbWVudDogMywgaWR4MTogMSwgaWR4MjogMCwgaWR4MzogMSB9LFxuICAgIHsgZWxlbWVudDogNCwgaWR4MTogMSwgaWR4MjogMCwgaWR4MzogMiB9XG4gIF07XG5cbiAgZGltZW5zaW9uRm9yRWFjaCggMywgYXJyLCAoIGVsZW1lbnQsIGlkeDEsIGlkeDIsIGlkeDMgKSA9PiB7XG4gICAgdmFsdWVzLnB1c2goIHtcbiAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICBpZHgxOiBpZHgxLFxuICAgICAgaWR4MjogaWR4MixcbiAgICAgIGlkeDM6IGlkeDNcbiAgICB9ICk7XG4gIH0gKTtcblxuICBhc3NlcnQub2soIF8uaXNFcXVhbCggdmFsdWVzLCBleHBlY3RlZFZhbHVlcyApLCAnMy1kaW1lbnNpb25hbCBjb21wYXJpc29uJyApO1xufSApOyJdLCJuYW1lcyI6WyJkaW1lbnNpb25Gb3JFYWNoIiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0Iiwibm9ybWFsVmFsdWVzIiwib3VyVmFsdWVzIiwiYXJyIiwiZm9yRWFjaCIsImVsZW1lbnQiLCJpbmRleCIsInB1c2giLCJvayIsIl8iLCJpc0VxdWFsIiwidmFsdWVzIiwiZXhwZWN0ZWRWYWx1ZXMiLCJpZHgxIiwiaWR4MiIsImlkeDMiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQs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