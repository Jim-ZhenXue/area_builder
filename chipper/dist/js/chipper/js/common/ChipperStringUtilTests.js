// Copyright 2019-2024, University of Colorado Boulder
import qunit from '../../../perennial-alias/js/npm-dependencies/qunit.js';
/**
 * Tests for ChipperStringUtils
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import ChipperStringUtils from './ChipperStringUtils.js';
qunit.module('ChipperStringUtils');
qunit.test('forEachString', (assert)=>{
    const map1 = {
        x: {
            value: 'x'
        },
        y: {
            value: 'y',
            z: {
                value: 'z'
            }
        },
        intermediary: {
            a: {
                value: 'a'
            },
            b: {
                value: 'b'
            },
            intermediary2: {
                c: {
                    value: 'c'
                }
            }
        }
    };
    let count = 0;
    const expectedKeys = [
        'x',
        'y',
        'y.z',
        'intermediary.a',
        'intermediary.b',
        'intermediary.intermediary2.c'
    ];
    ChipperStringUtils.forEachString(map1, (key)=>{
        count++;
        const keyIndex = expectedKeys.indexOf(key);
        assert.ok(keyIndex >= 0, `unexpected key:${key}`);
        expectedKeys.splice(keyIndex, 1); // just remove the single item
    });
    assert.ok(expectedKeys.length === 0, 'all keys should be accounted for');
    assert.ok(count === 6, 'should be three string');
    assert.ok(true, 'success');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2NvbW1vbi9DaGlwcGVyU3RyaW5nVXRpbFRlc3RzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG5pbXBvcnQgcXVuaXQgZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL25wbS1kZXBlbmRlbmNpZXMvcXVuaXQuanMnO1xuLyoqXG4gKiBUZXN0cyBmb3IgQ2hpcHBlclN0cmluZ1V0aWxzXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cbmltcG9ydCBDaGlwcGVyU3RyaW5nVXRpbHMsIHsgU3RyaW5nRmlsZU1hcCB9IGZyb20gJy4vQ2hpcHBlclN0cmluZ1V0aWxzLmpzJztcblxucXVuaXQubW9kdWxlKCAnQ2hpcHBlclN0cmluZ1V0aWxzJyApO1xuXG5xdW5pdC50ZXN0KCAnZm9yRWFjaFN0cmluZycsIGFzc2VydCA9PiB7XG4gIGNvbnN0IG1hcDE6IFN0cmluZ0ZpbGVNYXAgPSB7XG4gICAgeDogeyB2YWx1ZTogJ3gnIH0sXG4gICAgeToge1xuICAgICAgdmFsdWU6ICd5JyxcbiAgICAgIHo6IHsgdmFsdWU6ICd6JyB9XG4gICAgfSxcbiAgICBpbnRlcm1lZGlhcnk6IHtcbiAgICAgIGE6IHsgdmFsdWU6ICdhJyB9LFxuICAgICAgYjogeyB2YWx1ZTogJ2InIH0sXG4gICAgICBpbnRlcm1lZGlhcnkyOiB7XG4gICAgICAgIGM6IHsgdmFsdWU6ICdjJyB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGxldCBjb3VudCA9IDA7XG4gIGNvbnN0IGV4cGVjdGVkS2V5cyA9IFtcbiAgICAneCcsXG4gICAgJ3knLFxuICAgICd5LnonLFxuICAgICdpbnRlcm1lZGlhcnkuYScsXG4gICAgJ2ludGVybWVkaWFyeS5iJyxcbiAgICAnaW50ZXJtZWRpYXJ5LmludGVybWVkaWFyeTIuYydcbiAgXTtcbiAgQ2hpcHBlclN0cmluZ1V0aWxzLmZvckVhY2hTdHJpbmcoIG1hcDEsIGtleSA9PiB7XG4gICAgY291bnQrKztcbiAgICBjb25zdCBrZXlJbmRleCA9IGV4cGVjdGVkS2V5cy5pbmRleE9mKCBrZXkgKTtcbiAgICBhc3NlcnQub2soIGtleUluZGV4ID49IDAsIGB1bmV4cGVjdGVkIGtleToke2tleX1gICk7XG4gICAgZXhwZWN0ZWRLZXlzLnNwbGljZSgga2V5SW5kZXgsIDEgKTsgLy8ganVzdCByZW1vdmUgdGhlIHNpbmdsZSBpdGVtXG4gIH0gKTtcbiAgYXNzZXJ0Lm9rKCBleHBlY3RlZEtleXMubGVuZ3RoID09PSAwLCAnYWxsIGtleXMgc2hvdWxkIGJlIGFjY291bnRlZCBmb3InICk7XG4gIGFzc2VydC5vayggY291bnQgPT09IDYsICdzaG91bGQgYmUgdGhyZWUgc3RyaW5nJyApO1xuICBhc3NlcnQub2soIHRydWUsICdzdWNjZXNzJyApO1xufSApOyJdLCJuYW1lcyI6WyJxdW5pdCIsIkNoaXBwZXJTdHJpbmdVdGlscyIsIm1vZHVsZSIsInRlc3QiLCJhc3NlcnQiLCJtYXAxIiwieCIsInZhbHVlIiwieSIsInoiLCJpbnRlcm1lZGlhcnkiLCJhIiwiYiIsImludGVybWVkaWFyeTIiLCJjIiwiY291bnQiLCJleHBlY3RlZEtleXMiLCJmb3JFYWNoU3RyaW5nIiwia2V5Iiwia2V5SW5kZXgiLCJpbmRleE9mIiwib2siLCJzcGxpY2UiLCJsZW5ndGgiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RCxPQUFPQSxXQUFXLHdEQUF3RDtBQUMxRTs7O0NBR0MsR0FDRCxPQUFPQyx3QkFBMkMsMEJBQTBCO0FBRTVFRCxNQUFNRSxNQUFNLENBQUU7QUFFZEYsTUFBTUcsSUFBSSxDQUFFLGlCQUFpQkMsQ0FBQUE7SUFDM0IsTUFBTUMsT0FBc0I7UUFDMUJDLEdBQUc7WUFBRUMsT0FBTztRQUFJO1FBQ2hCQyxHQUFHO1lBQ0RELE9BQU87WUFDUEUsR0FBRztnQkFBRUYsT0FBTztZQUFJO1FBQ2xCO1FBQ0FHLGNBQWM7WUFDWkMsR0FBRztnQkFBRUosT0FBTztZQUFJO1lBQ2hCSyxHQUFHO2dCQUFFTCxPQUFPO1lBQUk7WUFDaEJNLGVBQWU7Z0JBQ2JDLEdBQUc7b0JBQUVQLE9BQU87Z0JBQUk7WUFDbEI7UUFDRjtJQUNGO0lBRUEsSUFBSVEsUUFBUTtJQUNaLE1BQU1DLGVBQWU7UUFDbkI7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO0tBQ0Q7SUFDRGYsbUJBQW1CZ0IsYUFBYSxDQUFFWixNQUFNYSxDQUFBQTtRQUN0Q0g7UUFDQSxNQUFNSSxXQUFXSCxhQUFhSSxPQUFPLENBQUVGO1FBQ3ZDZCxPQUFPaUIsRUFBRSxDQUFFRixZQUFZLEdBQUcsQ0FBQyxlQUFlLEVBQUVELEtBQUs7UUFDakRGLGFBQWFNLE1BQU0sQ0FBRUgsVUFBVSxJQUFLLDhCQUE4QjtJQUNwRTtJQUNBZixPQUFPaUIsRUFBRSxDQUFFTCxhQUFhTyxNQUFNLEtBQUssR0FBRztJQUN0Q25CLE9BQU9pQixFQUFFLENBQUVOLFVBQVUsR0FBRztJQUN4QlgsT0FBT2lCLEVBQUUsQ0FBRSxNQUFNO0FBQ25CIn0=