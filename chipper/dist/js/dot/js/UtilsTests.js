// Copyright 2019-2024, University of Colorado Boulder
/**
 * Bounds2 tests
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import dot from './dot.js';
import Utils from './Utils.js';
import Vector2 from './Vector2.js';
QUnit.module('Utils');
function approximateEquals(assert, a, b, msg) {
    assert.ok(Math.abs(a - b) < 0.00000001, `${msg} expected: ${b}, result: ${a}`);
}
function arrayApproximateEquals(assert, a, b, msg) {
    const aSorted = a.slice().sort();
    const bSorted = b.slice().sort();
    assert.equal(a.length, b.length, `${msg} (length different)`);
    for(let i = 0; i < a.length; i++){
        approximateEquals(assert, aSorted[i], bSorted[i], `${msg} (index ${i})`);
    }
}
QUnit.test('Modulus between up/down tests', (assert)=>{
    assert.equal(Utils.moduloBetweenDown(8, 0, 1), 0);
    assert.equal(Utils.moduloBetweenUp(8, 0, 1), 1);
    assert.equal(Utils.moduloBetweenDown(8, -1, 0), -1);
    assert.equal(Utils.moduloBetweenUp(8, -1, 0), 0);
    assert.equal(Utils.moduloBetweenDown(8, 0, 4), 0);
    assert.equal(Utils.moduloBetweenUp(8, 0, 4), 4);
    assert.equal(Utils.moduloBetweenDown(8, -2, 2), 0);
    assert.equal(Utils.moduloBetweenUp(8, -2, 2), 0);
});
QUnit.test('roundSymmetric', (assert)=>{
    assert.equal(Utils.roundSymmetric(0.5), 1, '0.5 => 1');
    assert.equal(Utils.roundSymmetric(0.3), 0, '0.3 => 0');
    assert.equal(Utils.roundSymmetric(0.8), 1, '0.8 => 1');
    assert.equal(Utils.roundSymmetric(-0.5), -1, '-0.5 => -1');
    for(let i = 0; i < 20; i++){
        assert.equal(Utils.roundSymmetric(i), i, `${i} integer`);
        assert.equal(Utils.roundSymmetric(-i), -i, `${-i} integer`);
        assert.equal(Utils.roundSymmetric(i + 0.5), i + 1, `${i + 0.5} => ${i + 1}`);
        assert.equal(Utils.roundSymmetric(-i - 0.5), -i - 1, `${-i - 0.5} => ${-i - 1}`);
    }
    const original = dot.v2(1.5, -2.5);
    const rounded = original.roundedSymmetric();
    assert.ok(original.equals(dot.v2(1.5, -2.5)), 'sanity');
    assert.ok(rounded.equals(dot.v2(2, -3)), 'rounded');
    const result = original.roundSymmetric();
    assert.equal(result, original, 'reflexive');
    assert.ok(original.equals(rounded), 'both rounded now');
    assert.equal(Utils.roundSymmetric(Number.POSITIVE_INFINITY), Number.POSITIVE_INFINITY, 'infinity');
    assert.equal(Utils.roundSymmetric(Number.NEGATIVE_INFINITY), Number.NEGATIVE_INFINITY, 'negative infinity');
});
QUnit.test('lineLineIntersection', (assert)=>{
    const f = Utils.lineLineIntersection;
    const p1 = Vector2.ZERO;
    const p2 = new Vector2(1, 1);
    const p3 = new Vector2(-10, 10);
    const p4 = new Vector2(-12, 8);
    assert.equal(f(p1, p2, p3, p4), null);
    assert.equal(f(p1, p4, p4, p1), null);
    assert.equal(f(p1, p1, p3, p4), null);
    assert.equal(f(p1, p2, p2, p3).x, 1);
    assert.equal(f(p1, p2, p2, p3).y, 1);
});
QUnit.test('lineSegmentIntersection', (assert)=>{
    const h = Utils.lineSegmentIntersection;
    const p1 = Vector2.ZERO;
    const p2 = new Vector2(1, 1);
    const p3 = new Vector2(-10, 8);
    const p4 = new Vector2(-3, -3);
    const p5 = new Vector2(8, -10);
    const f = (p1, p2, p3, p4)=>h(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
    assert.equal(f(p4, p1, p1, p2), null);
    assert.equal(f(p3, p2, p4, p1), null);
    assert.equal(f(p4, p3, p5, p2), null);
    assert.equal(f(p4, p1, p3, p2), null);
    assert.equal(f(p3, p1, p4, p2).x, 0);
    assert.equal(f(p3, p1, p4, p2).y, 0);
    assert.equal(f(p3, p4, p4, p1).x, p4.x);
    assert.equal(f(p3, p4, p4, p1).y, p4.y);
    assert.equal(f(p4, p2, p3, p5).x, -1);
    assert.equal(f(p4, p2, p3, p5).y, -1);
    assert.equal(f(p3, p4, p3, p2).x, -10);
    assert.equal(f(p3, p4, p3, p2).y, 8);
});
QUnit.test('distToSegmentSquared', (assert)=>{
    const f = Utils.distToSegmentSquared;
    const p1 = Vector2.ZERO;
    const p2 = new Vector2(-6, 0);
    const p3 = new Vector2(-5, 1);
    approximateEquals(assert, f(p1, p2, p3), 26);
    approximateEquals(assert, f(p2, p3, p1), 2);
    approximateEquals(assert, f(p3, p1, p2), 1);
    approximateEquals(assert, f(p1, p2, p2), 36);
    approximateEquals(assert, f(p3, p2, p2), 2);
});
QUnit.test('linear map', (assert)=>{
    approximateEquals(assert, Utils.linear(4, 8, 8, 0, 4), 8);
    approximateEquals(assert, Utils.linear(4, 8, 8, 0, 8), 0);
    approximateEquals(assert, Utils.linear(4, 8, 8, 0, 6), 4);
});
QUnit.test('clamp', (assert)=>{
    assert.equal(Utils.clamp(5, 1, 4), 4);
    assert.equal(Utils.clamp(3, 1, 4), 3);
    assert.equal(Utils.clamp(0, 1, 4), 1);
});
QUnit.test('rangeInclusive', (assert)=>{
    let arr = Utils.rangeInclusive(2, 4);
    assert.equal(arr.length, 3);
    assert.equal(arr[0], 2);
    assert.equal(arr[1], 3);
    assert.equal(arr[2], 4);
    arr = Utils.rangeInclusive(4, 2);
    assert.equal(arr.length, 0);
});
QUnit.test('rangeExclusive', (assert)=>{
    let arr = Utils.rangeExclusive(2, 4);
    assert.equal(arr.length, 1);
    assert.equal(arr[0], 3);
    arr = Utils.rangeExclusive(4, 2);
    assert.equal(arr.length, 0);
});
QUnit.test('toRadians', (assert)=>{
    approximateEquals(assert, Utils.toRadians(90), Math.PI / 2);
    approximateEquals(assert, Utils.toRadians(45), Math.PI / 4);
    approximateEquals(assert, Utils.toRadians(-45), -Math.PI / 4);
});
QUnit.test('toDegrees', (assert)=>{
    approximateEquals(assert, 90, Utils.toDegrees(Math.PI / 2));
    approximateEquals(assert, 45, Utils.toDegrees(Math.PI / 4));
    approximateEquals(assert, -45, Utils.toDegrees(-Math.PI / 4));
});
QUnit.test('numberOfDecimalPlaces', (assert)=>{
    // Tests that should succeed.
    assert.equal(Utils.numberOfDecimalPlaces(10), 0);
    assert.equal(Utils.numberOfDecimalPlaces(-10), 0);
    assert.equal(Utils.numberOfDecimalPlaces(10.1), 1);
    assert.equal(Utils.numberOfDecimalPlaces(-10.1), 1);
    assert.equal(Utils.numberOfDecimalPlaces(10.10), 1);
    assert.equal(Utils.numberOfDecimalPlaces(-10.10), 1);
    assert.equal(Utils.numberOfDecimalPlaces(0.567), 3);
    assert.equal(Utils.numberOfDecimalPlaces(-0.567), 3);
    assert.equal(Utils.numberOfDecimalPlaces(0.001), 3);
    assert.equal(Utils.numberOfDecimalPlaces(-0.001), 3);
    assert.equal(Utils.numberOfDecimalPlaces(0.56), 2);
    assert.equal(Utils.numberOfDecimalPlaces(1e50), 0);
    assert.equal(Utils.numberOfDecimalPlaces(1e-50), 50);
    assert.equal(Utils.numberOfDecimalPlaces(1.5e-50), 51);
    assert.equal(Utils.numberOfDecimalPlaces(1.5e1), 0);
    assert.equal(Utils.numberOfDecimalPlaces(1.5e-2), 3);
    assert.equal(Utils.numberOfDecimalPlaces(2.345e-17), 20);
    // Tests that should fail.
    if (window.assert) {
        assert.throws(()=>Utils.numberOfDecimalPlaces('foo'), 'value must be a number');
        assert.throws(()=>Utils.numberOfDecimalPlaces(Infinity), 'value must be a finite number');
    }
});
QUnit.test('roundToInterval', (assert)=>{
    assert.equal(Utils.roundToInterval(0.567, 0.01), 0.57);
    assert.equal(Utils.roundToInterval(-0.567, 0.01), -0.57);
    assert.equal(Utils.roundToInterval(0.567, 0.02), 0.56);
    assert.equal(Utils.roundToInterval(-0.567, 0.02), -0.56);
    assert.equal(Utils.roundToInterval(5.67, 0.5), 5.5);
    assert.equal(Utils.roundToInterval(-5.67, 0.5), -5.5);
    assert.equal(Utils.roundToInterval(5.67, 2), 6);
    assert.equal(Utils.roundToInterval(-5.67, 2), -6);
    assert.equal(Utils.roundToInterval(4.9, 2), 4);
    assert.equal(Utils.roundToInterval(-4.9, 2), -4);
});
QUnit.test('solveLinearRootsReal', (assert)=>{
    assert.equal(Utils.solveLinearRootsReal(0, 0), null, '0*x + 0 = 0 --- all values are solutions');
    arrayApproximateEquals(assert, Utils.solveLinearRootsReal(1, 0), [
        0
    ], '1*x + 0 = 0 --- 0 is a solution');
    arrayApproximateEquals(assert, Utils.solveLinearRootsReal(-1, 0), [
        0
    ], '-1*x + 0 = 0 --- 0 is a solution');
    arrayApproximateEquals(assert, Utils.solveLinearRootsReal(0, 1), [], '0*x + 1 = 0 --- no solutions');
    arrayApproximateEquals(assert, Utils.solveLinearRootsReal(1, 1), [
        -1
    ], '1*x + 1 = 0 --- one solution');
    arrayApproximateEquals(assert, Utils.solveLinearRootsReal(-1, 1), [
        1
    ], '-1*x + 1 = 0 --- one solution');
    arrayApproximateEquals(assert, Utils.solveLinearRootsReal(3, 2), [
        -2 / 3
    ], '3*x + 2 = 0 --- one solution');
    arrayApproximateEquals(assert, Utils.solveLinearRootsReal(-3, 2), [
        2 / 3
    ], '-3*x + 2 = 0 --- one solution');
});
QUnit.test('solveQuadraticRootsReal', (assert)=>{
    assert.equal(Utils.solveQuadraticRootsReal(0, 0, 0), null, '0*x + 0 = 0 --- all values are solutions');
    arrayApproximateEquals(assert, Utils.solveQuadraticRootsReal(0, 1, 0), [
        0
    ], '1*x + 0 = 0 --- 0 is a solution');
    arrayApproximateEquals(assert, Utils.solveQuadraticRootsReal(0, -1, 0), [
        0
    ], '-1*x + 0 = 0 --- 0 is a solution');
    arrayApproximateEquals(assert, Utils.solveQuadraticRootsReal(0, 0, 1), [], '0*x + 1 = 0 --- no solutions');
    arrayApproximateEquals(assert, Utils.solveQuadraticRootsReal(0, 1, 1), [
        -1
    ], '1*x + 1 = 0 --- one solution');
    arrayApproximateEquals(assert, Utils.solveQuadraticRootsReal(0, -1, 1), [
        1
    ], '-1*x + 1 = 0 --- one solution');
    arrayApproximateEquals(assert, Utils.solveQuadraticRootsReal(0, 3, 2), [
        -2 / 3
    ], '3*x + 2 = 0 --- one solution');
    arrayApproximateEquals(assert, Utils.solveQuadraticRootsReal(0, -3, 2), [
        2 / 3
    ], '-3*x + 2 = 0 --- one solution');
    arrayApproximateEquals(assert, Utils.solveQuadraticRootsReal(1, 0, 0), [
        0,
        0
    ], 'x^2 = 0 --- one solution with multiplicity 2');
    arrayApproximateEquals(assert, Utils.solveQuadraticRootsReal(1, 0, -1), [
        -1,
        1
    ], 'x^2 = 1 --- two solutions');
    arrayApproximateEquals(assert, Utils.solveQuadraticRootsReal(1, 0, -2), [
        -Math.sqrt(2),
        Math.sqrt(2)
    ], 'x^2 = 2 --- two solutions');
    arrayApproximateEquals(assert, Utils.solveQuadraticRootsReal(2, -1, -3), [
        -1,
        3 / 2
    ], '2x^2 - x = 3 --- two solutions');
});
QUnit.test('solveCubicRootsReal', (assert)=>{
    assert.equal(Utils.solveCubicRootsReal(0, 0, 0, 0), null, '0*x + 0 = 0 --- all values are solutions');
    arrayApproximateEquals(assert, Utils.solveCubicRootsReal(0, 0, 1, 0), [
        0
    ], '1*x + 0 = 0 --- 0 is a solution');
    arrayApproximateEquals(assert, Utils.solveCubicRootsReal(0, 0, -1, 0), [
        0
    ], '-1*x + 0 = 0 --- 0 is a solution');
    arrayApproximateEquals(assert, Utils.solveCubicRootsReal(0, 0, 0, 1), [], '0*x + 1 = 0 --- no solutions');
    arrayApproximateEquals(assert, Utils.solveCubicRootsReal(0, 0, 1, 1), [
        -1
    ], '1*x + 1 = 0 --- one solution');
    arrayApproximateEquals(assert, Utils.solveCubicRootsReal(0, 0, -1, 1), [
        1
    ], '-1*x + 1 = 0 --- one solution');
    arrayApproximateEquals(assert, Utils.solveCubicRootsReal(0, 0, 3, 2), [
        -2 / 3
    ], '3*x + 2 = 0 --- one solution');
    arrayApproximateEquals(assert, Utils.solveCubicRootsReal(0, 0, -3, 2), [
        2 / 3
    ], '-3*x + 2 = 0 --- one solution');
    arrayApproximateEquals(assert, Utils.solveCubicRootsReal(0, 1, 0, 0), [
        0,
        0
    ], 'x^2 = 0 --- one solution with multiplicity 2');
    arrayApproximateEquals(assert, Utils.solveCubicRootsReal(0, 1, 0, -1), [
        -1,
        1
    ], 'x^2 = 1 --- two solutions');
    arrayApproximateEquals(assert, Utils.solveCubicRootsReal(0, 1, 0, -2), [
        -Math.sqrt(2),
        Math.sqrt(2)
    ], 'x^2 = 2 --- two solutions');
    arrayApproximateEquals(assert, Utils.solveCubicRootsReal(0, 2, -1, -3), [
        -1,
        3 / 2
    ], '2x^2 - x = 3 --- two solutions');
    arrayApproximateEquals(assert, Utils.solveCubicRootsReal(1, 0, 0, -8), [
        2
    ], 'x^3 = 8 --- one solution');
    arrayApproximateEquals(assert, Utils.solveCubicRootsReal(1, -6, 11, -6), [
        1,
        2,
        3
    ], 'three solutions');
    arrayApproximateEquals(assert, Utils.solveCubicRootsReal(1, -5, 8, -4), [
        1,
        2,
        2
    ], 'two solutions, one with multiplicity 2');
    arrayApproximateEquals(assert, Utils.solveCubicRootsReal(1, -3, 3, -1), [
        1,
        1,
        1
    ], 'one solution with multiplicity 3');
    arrayApproximateEquals(assert, Utils.solveCubicRootsReal(1, 1, 1, -3), [
        1
    ], 'one solution');
    arrayApproximateEquals(assert, Utils.solveCubicRootsReal(1, 1, -33, 63), [
        -7,
        3,
        3
    ], 'two solutions, one with multiplicity 2');
    arrayApproximateEquals(assert, Utils.solveCubicRootsReal(1, -3, 0, 0), [
        0,
        0,
        3
    ], 'two solutions, one with multiplicity 2');
    arrayApproximateEquals(assert, Utils.solveCubicRootsReal(1, 0, 0, 0), [
        0,
        0,
        0
    ], 'one solution, multiplicity 3');
    arrayApproximateEquals(assert, Utils.solveCubicRootsReal(1, 10, 25, 0), [
        -5,
        -5,
        0
    ], 'two solutions, one with multiplicity 2');
    arrayApproximateEquals(assert, Utils.solveCubicRootsReal(1, 0, -25, 0), [
        -5,
        0,
        5
    ], 'three solutions');
    arrayApproximateEquals(assert, Utils.solveCubicRootsReal(1, -18, 107, -210), [
        5,
        6,
        7
    ], 'three solutions');
});
QUnit.test('toFixed', (assert)=>{
    assert.equal(Utils.toFixed(Number.POSITIVE_INFINITY, 0), 'Infinity');
    assert.equal(Utils.toFixed(Number.POSITIVE_INFINITY, 1), 'Infinity');
    assert.equal(Utils.toFixed(Number.POSITIVE_INFINITY, 5), 'Infinity');
    assert.equal(Utils.toFixed(Number.NEGATIVE_INFINITY, 0), '-Infinity');
    assert.equal(Utils.toFixed(Number.NEGATIVE_INFINITY, 1), '-Infinity');
    assert.equal(Utils.toFixed(Number.NEGATIVE_INFINITY, 5), '-Infinity');
    assert.equal(Utils.toFixed(NaN, 0), 'NaN');
    assert.equal(Utils.toFixed(NaN, 1), 'NaN');
    assert.equal(Utils.toFixed(35.855, 0), '36');
    assert.equal(Utils.toFixed(35.855, 3), '35.855');
    assert.equal(Utils.toFixed(35.855, 2), '35.86');
    assert.equal(Utils.toFixed(35.854, 2), '35.85');
    assert.equal(Utils.toFixed(-35.855, 2), '-35.86');
    assert.equal(Utils.toFixed(-35.854, 2), '-35.85');
    assert.equal(Utils.toFixed(0.005, 2), '0.01');
    assert.equal(Utils.toFixed(0.004, 2), '0.00');
    assert.equal(Utils.toFixed(-0.005, 2), '-0.01');
    assert.equal(Utils.toFixed(-0.004, 2), '0.00');
    assert.equal(Utils.toFixed(-0.005, 2), '-0.01');
    assert.equal(Utils.toFixed(1.5, 0), '2');
    assert.equal(Utils.toFixed(1.56, 0), '2');
    assert.equal(Utils.toFixed(1.56, 1), '1.6');
    assert.equal(Utils.toFixed(1.54, 1), '1.5');
    assert.equal(Utils.toFixed(1.4, 0), '1');
    assert.equal(Utils.toFixed(1.46, 0), '1');
    assert.equal(Utils.toFixed(1.46, 1), '1.5');
    assert.equal(Utils.toFixed(1.44, 1), '1.4');
    assert.equal(Utils.toFixed(4.577999999999999, 7), '4.5780000');
    assert.equal(Utils.toFixed(0.07957747154594767, 3), '0.080');
    assert.equal(Utils.toFixed(1e-7, 10), '0.0000001000');
    assert.equal(Utils.toFixed(2.7439999999999998, 7), '2.7440000');
    assert.equal(Utils.toFixed(0.396704, 2), '0.40');
    assert.equal(Utils.toFixed(1.0002929999999999, 7), '1.0002930');
    assert.equal(Utils.toFixed(0.4996160344827586, 3), '0.500');
    assert.equal(Utils.toFixed(99.99999999999999, 2), '100.00');
    assert.equal(Utils.toFixed(2.169880191815152, 3), '2.170');
    assert.equal(Utils.toFixed(1.0999999999999999e-7, 1), '0.0');
    assert.equal(Utils.toFixed(3.2303029999999997, 7), '3.2303030');
    assert.equal(Utils.toFixed(0.497625, 2), '0.50');
    assert.equal(Utils.toFixed(2e-12, 12), '0.000000000002');
    assert.equal(Utils.toFixed(6.98910467173495, 1), '7.0');
    assert.equal(Utils.toFixed(8.976212933741225, 1), '9.0');
    assert.equal(Utils.toFixed(2.9985632338511543, 1), '3.0');
    assert.equal(Utils.toFixed(-8.951633986928105, 1), -'9.0');
    assert.equal(Utils.toFixed(99.99999999999999, 2), '100.00');
    assert.equal(Utils.toFixed(-4.547473508864641e-13, 10), '0.0000000000');
    assert.equal(Utils.toFixed(0.98, 1), '1.0');
    assert.equal(Utils.toFixed(0.2953388796149264, 2), '0.30');
    assert.equal(Utils.toFixed(1.1119839827800002, 4), '1.1120');
    assert.equal(Utils.toFixed(1.0099982756502124, 4), '1.0100');
    assert.equal(Utils.toFixed(-1.5, 2), '-1.50');
    assert.equal(Utils.toFixed(1.113774420948007e+25, 9), '11137744209480070000000000.000000000');
    assert.equal(Utils.toFixed(29495969594939.1, 3), '29495969594939.100');
    assert.equal(Utils.toFixed(29495969594939.0, 3), '29495969594939.000');
    // eslint-disable-next-line no-floating-decimal
    assert.equal(Utils.toFixed(29495969594939., 3), '29495969594939.000');
    assert.equal(Utils.toFixed(29495969594939, 3), '29495969594939.000');
    assert.equal(Utils.toFixed(29495969594939, 0), '29495969594939');
    assert.equal(Utils.toFixed(294959695949390000000, 3), '294959695949390000000.000');
    assert.equal(Utils.toFixed(294959695949390000000, 0), '294959695949390000000');
    window.assert && assert.throws(()=>{
        Utils.toFixed(0, 1.3010299956639813);
    }, 'integer for decimalPlaces');
    assert.equal(Utils.toFixed(0, 0), '0');
    assert.equal(Utils.toFixed(0, 1), '0.0');
    assert.equal(Utils.toFixed(-0, 0), '0');
    assert.equal(Utils.toFixed(-0, 1), '0.0');
    assert.equal(Utils.toFixed(-0, 4), '0.0000');
});
QUnit.test('toFixedNumber', (assert)=>{
    assert.equal(Utils.toFixedNumber(Number.POSITIVE_INFINITY, 0), Number.POSITIVE_INFINITY);
    assert.equal(Utils.toFixedNumber(Number.POSITIVE_INFINITY, 1), Number.POSITIVE_INFINITY);
    assert.equal(Utils.toFixedNumber(Number.POSITIVE_INFINITY, 5), Number.POSITIVE_INFINITY);
    assert.equal(Utils.toFixedNumber(Number.NEGATIVE_INFINITY, 0), Number.NEGATIVE_INFINITY);
    assert.equal(Utils.toFixedNumber(Number.NEGATIVE_INFINITY, 1), Number.NEGATIVE_INFINITY);
    assert.equal(Utils.toFixedNumber(Number.NEGATIVE_INFINITY, 5), Number.NEGATIVE_INFINITY);
    assert.equal(Utils.toFixedNumber(1000.100, 0).toString(), '1000');
    assert.equal(Utils.toFixedNumber(1000.100, 0), 1000);
    assert.equal(Utils.toFixedNumber(1000.100, 1).toString(), '1000.1');
    assert.equal(Utils.toFixedNumber(1000.100, 1), 1000.1);
    assert.equal(Utils.toFixedNumber(-0, 1).toString(), '0');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlsc1Rlc3RzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEJvdW5kczIgdGVzdHNcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgZG90IGZyb20gJy4vZG90LmpzJztcbmltcG9ydCBVdGlscyBmcm9tICcuL1V0aWxzLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4vVmVjdG9yMi5qcyc7XG5cblFVbml0Lm1vZHVsZSggJ1V0aWxzJyApO1xuXG5mdW5jdGlvbiBhcHByb3hpbWF0ZUVxdWFscyggYXNzZXJ0LCBhLCBiLCBtc2cgKSB7XG4gIGFzc2VydC5vayggTWF0aC5hYnMoIGEgLSBiICkgPCAwLjAwMDAwMDAxLCBgJHttc2d9IGV4cGVjdGVkOiAke2J9LCByZXN1bHQ6ICR7YX1gICk7XG59XG5cbmZ1bmN0aW9uIGFycmF5QXBwcm94aW1hdGVFcXVhbHMoIGFzc2VydCwgYSwgYiwgbXNnICkge1xuICBjb25zdCBhU29ydGVkID0gYS5zbGljZSgpLnNvcnQoKTtcbiAgY29uc3QgYlNvcnRlZCA9IGIuc2xpY2UoKS5zb3J0KCk7XG5cbiAgYXNzZXJ0LmVxdWFsKCBhLmxlbmd0aCwgYi5sZW5ndGgsIGAke21zZ30gKGxlbmd0aCBkaWZmZXJlbnQpYCApO1xuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrICkge1xuICAgIGFwcHJveGltYXRlRXF1YWxzKCBhc3NlcnQsIGFTb3J0ZWRbIGkgXSwgYlNvcnRlZFsgaSBdLCBgJHttc2d9IChpbmRleCAke2l9KWAgKTtcbiAgfVxufVxuXG5RVW5pdC50ZXN0KCAnTW9kdWx1cyBiZXR3ZWVuIHVwL2Rvd24gdGVzdHMnLCBhc3NlcnQgPT4ge1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLm1vZHVsb0JldHdlZW5Eb3duKCA4LCAwLCAxICksIDAgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy5tb2R1bG9CZXR3ZWVuVXAoIDgsIDAsIDEgKSwgMSApO1xuXG4gIGFzc2VydC5lcXVhbCggVXRpbHMubW9kdWxvQmV0d2VlbkRvd24oIDgsIC0xLCAwICksIC0xICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMubW9kdWxvQmV0d2VlblVwKCA4LCAtMSwgMCApLCAwICk7XG5cbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy5tb2R1bG9CZXR3ZWVuRG93biggOCwgMCwgNCApLCAwICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMubW9kdWxvQmV0d2VlblVwKCA4LCAwLCA0ICksIDQgKTtcblxuICBhc3NlcnQuZXF1YWwoIFV0aWxzLm1vZHVsb0JldHdlZW5Eb3duKCA4LCAtMiwgMiApLCAwICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMubW9kdWxvQmV0d2VlblVwKCA4LCAtMiwgMiApLCAwICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdyb3VuZFN5bW1ldHJpYycsIGFzc2VydCA9PiB7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMucm91bmRTeW1tZXRyaWMoIDAuNSApLCAxLCAnMC41ID0+IDEnICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMucm91bmRTeW1tZXRyaWMoIDAuMyApLCAwLCAnMC4zID0+IDAnICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMucm91bmRTeW1tZXRyaWMoIDAuOCApLCAxLCAnMC44ID0+IDEnICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMucm91bmRTeW1tZXRyaWMoIC0wLjUgKSwgLTEsICctMC41ID0+IC0xJyApO1xuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCAyMDsgaSsrICkge1xuICAgIGFzc2VydC5lcXVhbCggVXRpbHMucm91bmRTeW1tZXRyaWMoIGkgKSwgaSwgYCR7aX0gaW50ZWdlcmAgKTtcbiAgICBhc3NlcnQuZXF1YWwoIFV0aWxzLnJvdW5kU3ltbWV0cmljKCAtaSApLCAtaSwgYCR7LWl9IGludGVnZXJgICk7XG4gICAgYXNzZXJ0LmVxdWFsKCBVdGlscy5yb3VuZFN5bW1ldHJpYyggaSArIDAuNSApLCBpICsgMSwgYCR7aSArIDAuNX0gPT4gJHtpICsgMX1gICk7XG4gICAgYXNzZXJ0LmVxdWFsKCBVdGlscy5yb3VuZFN5bW1ldHJpYyggLWkgLSAwLjUgKSwgLWkgLSAxLCBgJHstaSAtIDAuNX0gPT4gJHstaSAtIDF9YCApO1xuICB9XG5cbiAgY29uc3Qgb3JpZ2luYWwgPSBkb3QudjIoIDEuNSwgLTIuNSApO1xuICBjb25zdCByb3VuZGVkID0gb3JpZ2luYWwucm91bmRlZFN5bW1ldHJpYygpO1xuICBhc3NlcnQub2soIG9yaWdpbmFsLmVxdWFscyggZG90LnYyKCAxLjUsIC0yLjUgKSApLCAnc2FuaXR5JyApO1xuICBhc3NlcnQub2soIHJvdW5kZWQuZXF1YWxzKCBkb3QudjIoIDIsIC0zICkgKSwgJ3JvdW5kZWQnICk7XG4gIGNvbnN0IHJlc3VsdCA9IG9yaWdpbmFsLnJvdW5kU3ltbWV0cmljKCk7XG4gIGFzc2VydC5lcXVhbCggcmVzdWx0LCBvcmlnaW5hbCwgJ3JlZmxleGl2ZScgKTtcbiAgYXNzZXJ0Lm9rKCBvcmlnaW5hbC5lcXVhbHMoIHJvdW5kZWQgKSwgJ2JvdGggcm91bmRlZCBub3cnICk7XG5cbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy5yb3VuZFN5bW1ldHJpYyggTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZICksIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSwgJ2luZmluaXR5JyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnJvdW5kU3ltbWV0cmljKCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkgKSwgTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZLCAnbmVnYXRpdmUgaW5maW5pdHknICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdsaW5lTGluZUludGVyc2VjdGlvbicsIGFzc2VydCA9PiB7XG4gIGNvbnN0IGYgPSBVdGlscy5saW5lTGluZUludGVyc2VjdGlvbjtcblxuICBjb25zdCBwMSA9IFZlY3RvcjIuWkVSTztcbiAgY29uc3QgcDIgPSBuZXcgVmVjdG9yMiggMSwgMSApO1xuICBjb25zdCBwMyA9IG5ldyBWZWN0b3IyKCAtMTAsIDEwICk7XG4gIGNvbnN0IHA0ID0gbmV3IFZlY3RvcjIoIC0xMiwgOCApO1xuXG4gIGFzc2VydC5lcXVhbCggZiggcDEsIHAyLCBwMywgcDQgKSwgbnVsbCApO1xuICBhc3NlcnQuZXF1YWwoIGYoIHAxLCBwNCwgcDQsIHAxICksIG51bGwgKTtcbiAgYXNzZXJ0LmVxdWFsKCBmKCBwMSwgcDEsIHAzLCBwNCApLCBudWxsICk7XG4gIGFzc2VydC5lcXVhbCggZiggcDEsIHAyLCBwMiwgcDMgKS54LCAxICk7XG4gIGFzc2VydC5lcXVhbCggZiggcDEsIHAyLCBwMiwgcDMgKS55LCAxICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdsaW5lU2VnbWVudEludGVyc2VjdGlvbicsIGFzc2VydCA9PiB7XG4gIGNvbnN0IGggPSBVdGlscy5saW5lU2VnbWVudEludGVyc2VjdGlvbjtcblxuICBjb25zdCBwMSA9IFZlY3RvcjIuWkVSTztcbiAgY29uc3QgcDIgPSBuZXcgVmVjdG9yMiggMSwgMSApO1xuICBjb25zdCBwMyA9IG5ldyBWZWN0b3IyKCAtMTAsIDggKTtcbiAgY29uc3QgcDQgPSBuZXcgVmVjdG9yMiggLTMsIC0zICk7XG4gIGNvbnN0IHA1ID0gbmV3IFZlY3RvcjIoIDgsIC0xMCApO1xuXG4gIGNvbnN0IGYgPSAoIHAxLCBwMiwgcDMsIHA0ICkgPT4gaCggcDEueCwgcDEueSwgcDIueCwgcDIueSwgcDMueCwgcDMueSwgcDQueCwgcDQueSApO1xuXG4gIGFzc2VydC5lcXVhbCggZiggcDQsIHAxLCBwMSwgcDIgKSwgbnVsbCApO1xuICBhc3NlcnQuZXF1YWwoIGYoIHAzLCBwMiwgcDQsIHAxICksIG51bGwgKTtcbiAgYXNzZXJ0LmVxdWFsKCBmKCBwNCwgcDMsIHA1LCBwMiApLCBudWxsICk7XG4gIGFzc2VydC5lcXVhbCggZiggcDQsIHAxLCBwMywgcDIgKSwgbnVsbCApO1xuICBhc3NlcnQuZXF1YWwoIGYoIHAzLCBwMSwgcDQsIHAyICkueCwgMCApO1xuICBhc3NlcnQuZXF1YWwoIGYoIHAzLCBwMSwgcDQsIHAyICkueSwgMCApO1xuICBhc3NlcnQuZXF1YWwoIGYoIHAzLCBwNCwgcDQsIHAxICkueCwgcDQueCApO1xuICBhc3NlcnQuZXF1YWwoIGYoIHAzLCBwNCwgcDQsIHAxICkueSwgcDQueSApO1xuICBhc3NlcnQuZXF1YWwoIGYoIHA0LCBwMiwgcDMsIHA1ICkueCwgLTEgKTtcbiAgYXNzZXJ0LmVxdWFsKCBmKCBwNCwgcDIsIHAzLCBwNSApLnksIC0xICk7XG4gIGFzc2VydC5lcXVhbCggZiggcDMsIHA0LCBwMywgcDIgKS54LCAtMTAgKTtcbiAgYXNzZXJ0LmVxdWFsKCBmKCBwMywgcDQsIHAzLCBwMiApLnksIDggKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ2Rpc3RUb1NlZ21lbnRTcXVhcmVkJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgZiA9IFV0aWxzLmRpc3RUb1NlZ21lbnRTcXVhcmVkO1xuXG4gIGNvbnN0IHAxID0gVmVjdG9yMi5aRVJPO1xuICBjb25zdCBwMiA9IG5ldyBWZWN0b3IyKCAtNiwgMCApO1xuICBjb25zdCBwMyA9IG5ldyBWZWN0b3IyKCAtNSwgMSApO1xuXG4gIGFwcHJveGltYXRlRXF1YWxzKCBhc3NlcnQsIGYoIHAxLCBwMiwgcDMgKSwgMjYgKTtcbiAgYXBwcm94aW1hdGVFcXVhbHMoIGFzc2VydCwgZiggcDIsIHAzLCBwMSApLCAyICk7XG4gIGFwcHJveGltYXRlRXF1YWxzKCBhc3NlcnQsIGYoIHAzLCBwMSwgcDIgKSwgMSApO1xuICBhcHByb3hpbWF0ZUVxdWFscyggYXNzZXJ0LCBmKCBwMSwgcDIsIHAyICksIDM2ICk7XG4gIGFwcHJveGltYXRlRXF1YWxzKCBhc3NlcnQsIGYoIHAzLCBwMiwgcDIgKSwgMiApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnbGluZWFyIG1hcCcsIGFzc2VydCA9PiB7XG4gIGFwcHJveGltYXRlRXF1YWxzKCBhc3NlcnQsIFV0aWxzLmxpbmVhciggNCwgOCwgOCwgMCwgNCApLCA4ICk7XG4gIGFwcHJveGltYXRlRXF1YWxzKCBhc3NlcnQsIFV0aWxzLmxpbmVhciggNCwgOCwgOCwgMCwgOCApLCAwICk7XG4gIGFwcHJveGltYXRlRXF1YWxzKCBhc3NlcnQsIFV0aWxzLmxpbmVhciggNCwgOCwgOCwgMCwgNiApLCA0ICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdjbGFtcCcsIGFzc2VydCA9PiB7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMuY2xhbXAoIDUsIDEsIDQgKSwgNCApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLmNsYW1wKCAzLCAxLCA0ICksIDMgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy5jbGFtcCggMCwgMSwgNCApLCAxICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdyYW5nZUluY2x1c2l2ZScsIGFzc2VydCA9PiB7XG4gIGxldCBhcnIgPSBVdGlscy5yYW5nZUluY2x1c2l2ZSggMiwgNCApO1xuICBhc3NlcnQuZXF1YWwoIGFyci5sZW5ndGgsIDMgKTtcbiAgYXNzZXJ0LmVxdWFsKCBhcnJbIDAgXSwgMiApO1xuICBhc3NlcnQuZXF1YWwoIGFyclsgMSBdLCAzICk7XG4gIGFzc2VydC5lcXVhbCggYXJyWyAyIF0sIDQgKTtcblxuICBhcnIgPSBVdGlscy5yYW5nZUluY2x1c2l2ZSggNCwgMiApO1xuICBhc3NlcnQuZXF1YWwoIGFyci5sZW5ndGgsIDAgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ3JhbmdlRXhjbHVzaXZlJywgYXNzZXJ0ID0+IHtcbiAgbGV0IGFyciA9IFV0aWxzLnJhbmdlRXhjbHVzaXZlKCAyLCA0ICk7XG4gIGFzc2VydC5lcXVhbCggYXJyLmxlbmd0aCwgMSApO1xuICBhc3NlcnQuZXF1YWwoIGFyclsgMCBdLCAzICk7XG5cbiAgYXJyID0gVXRpbHMucmFuZ2VFeGNsdXNpdmUoIDQsIDIgKTtcbiAgYXNzZXJ0LmVxdWFsKCBhcnIubGVuZ3RoLCAwICk7XG59ICk7XG5cblFVbml0LnRlc3QoICd0b1JhZGlhbnMnLCBhc3NlcnQgPT4ge1xuICBhcHByb3hpbWF0ZUVxdWFscyggYXNzZXJ0LCBVdGlscy50b1JhZGlhbnMoIDkwICksIE1hdGguUEkgLyAyICk7XG4gIGFwcHJveGltYXRlRXF1YWxzKCBhc3NlcnQsIFV0aWxzLnRvUmFkaWFucyggNDUgKSwgTWF0aC5QSSAvIDQgKTtcbiAgYXBwcm94aW1hdGVFcXVhbHMoIGFzc2VydCwgVXRpbHMudG9SYWRpYW5zKCAtNDUgKSwgLU1hdGguUEkgLyA0ICk7XG59ICk7XG5cblFVbml0LnRlc3QoICd0b0RlZ3JlZXMnLCBhc3NlcnQgPT4ge1xuICBhcHByb3hpbWF0ZUVxdWFscyggYXNzZXJ0LCA5MCwgVXRpbHMudG9EZWdyZWVzKCBNYXRoLlBJIC8gMiApICk7XG4gIGFwcHJveGltYXRlRXF1YWxzKCBhc3NlcnQsIDQ1LCBVdGlscy50b0RlZ3JlZXMoIE1hdGguUEkgLyA0ICkgKTtcbiAgYXBwcm94aW1hdGVFcXVhbHMoIGFzc2VydCwgLTQ1LCBVdGlscy50b0RlZ3JlZXMoIC1NYXRoLlBJIC8gNCApICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdudW1iZXJPZkRlY2ltYWxQbGFjZXMnLCBhc3NlcnQgPT4ge1xuXG4gIC8vIFRlc3RzIHRoYXQgc2hvdWxkIHN1Y2NlZWQuXG4gIGFzc2VydC5lcXVhbCggVXRpbHMubnVtYmVyT2ZEZWNpbWFsUGxhY2VzKCAxMCApLCAwICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMubnVtYmVyT2ZEZWNpbWFsUGxhY2VzKCAtMTAgKSwgMCApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLm51bWJlck9mRGVjaW1hbFBsYWNlcyggMTAuMSApLCAxICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMubnVtYmVyT2ZEZWNpbWFsUGxhY2VzKCAtMTAuMSApLCAxICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMubnVtYmVyT2ZEZWNpbWFsUGxhY2VzKCAxMC4xMCApLCAxICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMubnVtYmVyT2ZEZWNpbWFsUGxhY2VzKCAtMTAuMTAgKSwgMSApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLm51bWJlck9mRGVjaW1hbFBsYWNlcyggMC41NjcgKSwgMyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLm51bWJlck9mRGVjaW1hbFBsYWNlcyggLTAuNTY3ICksIDMgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy5udW1iZXJPZkRlY2ltYWxQbGFjZXMoIDAuMDAxICksIDMgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy5udW1iZXJPZkRlY2ltYWxQbGFjZXMoIC0wLjAwMSApLCAzICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMubnVtYmVyT2ZEZWNpbWFsUGxhY2VzKCAwLjU2ICksIDIgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy5udW1iZXJPZkRlY2ltYWxQbGFjZXMoIDFlNTAgKSwgMCApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLm51bWJlck9mRGVjaW1hbFBsYWNlcyggMWUtNTAgKSwgNTAgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy5udW1iZXJPZkRlY2ltYWxQbGFjZXMoIDEuNWUtNTAgKSwgNTEgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy5udW1iZXJPZkRlY2ltYWxQbGFjZXMoIDEuNWUxICksIDAgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy5udW1iZXJPZkRlY2ltYWxQbGFjZXMoIDEuNWUtMiApLCAzICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMubnVtYmVyT2ZEZWNpbWFsUGxhY2VzKCAyLjM0NWUtMTcgKSwgMjAgKTtcblxuICAvLyBUZXN0cyB0aGF0IHNob3VsZCBmYWlsLlxuICBpZiAoIHdpbmRvdy5hc3NlcnQgKSB7XG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4gVXRpbHMubnVtYmVyT2ZEZWNpbWFsUGxhY2VzKCAnZm9vJyApLCAndmFsdWUgbXVzdCBiZSBhIG51bWJlcicgKTtcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBVdGlscy5udW1iZXJPZkRlY2ltYWxQbGFjZXMoIEluZmluaXR5ICksICd2YWx1ZSBtdXN0IGJlIGEgZmluaXRlIG51bWJlcicgKTtcbiAgfVxufSApO1xuXG5RVW5pdC50ZXN0KCAncm91bmRUb0ludGVydmFsJywgYXNzZXJ0ID0+IHtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy5yb3VuZFRvSW50ZXJ2YWwoIDAuNTY3LCAwLjAxICksIDAuNTcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy5yb3VuZFRvSW50ZXJ2YWwoIC0wLjU2NywgMC4wMSApLCAtMC41NyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnJvdW5kVG9JbnRlcnZhbCggMC41NjcsIDAuMDIgKSwgMC41NiApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnJvdW5kVG9JbnRlcnZhbCggLTAuNTY3LCAwLjAyICksIC0wLjU2ICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMucm91bmRUb0ludGVydmFsKCA1LjY3LCAwLjUgKSwgNS41ICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMucm91bmRUb0ludGVydmFsKCAtNS42NywgMC41ICksIC01LjUgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy5yb3VuZFRvSW50ZXJ2YWwoIDUuNjcsIDIgKSwgNiApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnJvdW5kVG9JbnRlcnZhbCggLTUuNjcsIDIgKSwgLTYgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy5yb3VuZFRvSW50ZXJ2YWwoIDQuOSwgMiApLCA0ICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMucm91bmRUb0ludGVydmFsKCAtNC45LCAyICksIC00ICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdzb2x2ZUxpbmVhclJvb3RzUmVhbCcsIGFzc2VydCA9PiB7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMuc29sdmVMaW5lYXJSb290c1JlYWwoIDAsIDAgKSwgbnVsbCwgJzAqeCArIDAgPSAwIC0tLSBhbGwgdmFsdWVzIGFyZSBzb2x1dGlvbnMnICk7XG4gIGFycmF5QXBwcm94aW1hdGVFcXVhbHMoIGFzc2VydCwgVXRpbHMuc29sdmVMaW5lYXJSb290c1JlYWwoIDEsIDAgKSwgWyAwIF0sICcxKnggKyAwID0gMCAtLS0gMCBpcyBhIHNvbHV0aW9uJyApO1xuICBhcnJheUFwcHJveGltYXRlRXF1YWxzKCBhc3NlcnQsIFV0aWxzLnNvbHZlTGluZWFyUm9vdHNSZWFsKCAtMSwgMCApLCBbIDAgXSwgJy0xKnggKyAwID0gMCAtLS0gMCBpcyBhIHNvbHV0aW9uJyApO1xuICBhcnJheUFwcHJveGltYXRlRXF1YWxzKCBhc3NlcnQsIFV0aWxzLnNvbHZlTGluZWFyUm9vdHNSZWFsKCAwLCAxICksIFtdLCAnMCp4ICsgMSA9IDAgLS0tIG5vIHNvbHV0aW9ucycgKTtcbiAgYXJyYXlBcHByb3hpbWF0ZUVxdWFscyggYXNzZXJ0LCBVdGlscy5zb2x2ZUxpbmVhclJvb3RzUmVhbCggMSwgMSApLCBbIC0xIF0sICcxKnggKyAxID0gMCAtLS0gb25lIHNvbHV0aW9uJyApO1xuICBhcnJheUFwcHJveGltYXRlRXF1YWxzKCBhc3NlcnQsIFV0aWxzLnNvbHZlTGluZWFyUm9vdHNSZWFsKCAtMSwgMSApLCBbIDEgXSwgJy0xKnggKyAxID0gMCAtLS0gb25lIHNvbHV0aW9uJyApO1xuICBhcnJheUFwcHJveGltYXRlRXF1YWxzKCBhc3NlcnQsIFV0aWxzLnNvbHZlTGluZWFyUm9vdHNSZWFsKCAzLCAyICksIFsgLTIgLyAzIF0sICczKnggKyAyID0gMCAtLS0gb25lIHNvbHV0aW9uJyApO1xuICBhcnJheUFwcHJveGltYXRlRXF1YWxzKCBhc3NlcnQsIFV0aWxzLnNvbHZlTGluZWFyUm9vdHNSZWFsKCAtMywgMiApLCBbIDIgLyAzIF0sICctMyp4ICsgMiA9IDAgLS0tIG9uZSBzb2x1dGlvbicgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ3NvbHZlUXVhZHJhdGljUm9vdHNSZWFsJywgYXNzZXJ0ID0+IHtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy5zb2x2ZVF1YWRyYXRpY1Jvb3RzUmVhbCggMCwgMCwgMCApLCBudWxsLCAnMCp4ICsgMCA9IDAgLS0tIGFsbCB2YWx1ZXMgYXJlIHNvbHV0aW9ucycgKTtcbiAgYXJyYXlBcHByb3hpbWF0ZUVxdWFscyggYXNzZXJ0LCBVdGlscy5zb2x2ZVF1YWRyYXRpY1Jvb3RzUmVhbCggMCwgMSwgMCApLCBbIDAgXSwgJzEqeCArIDAgPSAwIC0tLSAwIGlzIGEgc29sdXRpb24nICk7XG4gIGFycmF5QXBwcm94aW1hdGVFcXVhbHMoIGFzc2VydCwgVXRpbHMuc29sdmVRdWFkcmF0aWNSb290c1JlYWwoIDAsIC0xLCAwICksIFsgMCBdLCAnLTEqeCArIDAgPSAwIC0tLSAwIGlzIGEgc29sdXRpb24nICk7XG4gIGFycmF5QXBwcm94aW1hdGVFcXVhbHMoIGFzc2VydCwgVXRpbHMuc29sdmVRdWFkcmF0aWNSb290c1JlYWwoIDAsIDAsIDEgKSwgW10sICcwKnggKyAxID0gMCAtLS0gbm8gc29sdXRpb25zJyApO1xuICBhcnJheUFwcHJveGltYXRlRXF1YWxzKCBhc3NlcnQsIFV0aWxzLnNvbHZlUXVhZHJhdGljUm9vdHNSZWFsKCAwLCAxLCAxICksIFsgLTEgXSwgJzEqeCArIDEgPSAwIC0tLSBvbmUgc29sdXRpb24nICk7XG4gIGFycmF5QXBwcm94aW1hdGVFcXVhbHMoIGFzc2VydCwgVXRpbHMuc29sdmVRdWFkcmF0aWNSb290c1JlYWwoIDAsIC0xLCAxICksIFsgMSBdLCAnLTEqeCArIDEgPSAwIC0tLSBvbmUgc29sdXRpb24nICk7XG4gIGFycmF5QXBwcm94aW1hdGVFcXVhbHMoIGFzc2VydCwgVXRpbHMuc29sdmVRdWFkcmF0aWNSb290c1JlYWwoIDAsIDMsIDIgKSwgWyAtMiAvIDMgXSwgJzMqeCArIDIgPSAwIC0tLSBvbmUgc29sdXRpb24nICk7XG4gIGFycmF5QXBwcm94aW1hdGVFcXVhbHMoIGFzc2VydCwgVXRpbHMuc29sdmVRdWFkcmF0aWNSb290c1JlYWwoIDAsIC0zLCAyICksIFsgMiAvIDMgXSwgJy0zKnggKyAyID0gMCAtLS0gb25lIHNvbHV0aW9uJyApO1xuXG4gIGFycmF5QXBwcm94aW1hdGVFcXVhbHMoIGFzc2VydCwgVXRpbHMuc29sdmVRdWFkcmF0aWNSb290c1JlYWwoIDEsIDAsIDAgKSwgWyAwLCAwIF0sICd4XjIgPSAwIC0tLSBvbmUgc29sdXRpb24gd2l0aCBtdWx0aXBsaWNpdHkgMicgKTtcbiAgYXJyYXlBcHByb3hpbWF0ZUVxdWFscyggYXNzZXJ0LCBVdGlscy5zb2x2ZVF1YWRyYXRpY1Jvb3RzUmVhbCggMSwgMCwgLTEgKSwgWyAtMSwgMSBdLCAneF4yID0gMSAtLS0gdHdvIHNvbHV0aW9ucycgKTtcbiAgYXJyYXlBcHByb3hpbWF0ZUVxdWFscyggYXNzZXJ0LCBVdGlscy5zb2x2ZVF1YWRyYXRpY1Jvb3RzUmVhbCggMSwgMCwgLTIgKSwgWyAtTWF0aC5zcXJ0KCAyICksIE1hdGguc3FydCggMiApIF0sICd4XjIgPSAyIC0tLSB0d28gc29sdXRpb25zJyApO1xuICBhcnJheUFwcHJveGltYXRlRXF1YWxzKCBhc3NlcnQsIFV0aWxzLnNvbHZlUXVhZHJhdGljUm9vdHNSZWFsKCAyLCAtMSwgLTMgKSwgWyAtMSwgMyAvIDIgXSwgJzJ4XjIgLSB4ID0gMyAtLS0gdHdvIHNvbHV0aW9ucycgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ3NvbHZlQ3ViaWNSb290c1JlYWwnLCBhc3NlcnQgPT4ge1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnNvbHZlQ3ViaWNSb290c1JlYWwoIDAsIDAsIDAsIDAgKSwgbnVsbCwgJzAqeCArIDAgPSAwIC0tLSBhbGwgdmFsdWVzIGFyZSBzb2x1dGlvbnMnICk7XG4gIGFycmF5QXBwcm94aW1hdGVFcXVhbHMoIGFzc2VydCwgVXRpbHMuc29sdmVDdWJpY1Jvb3RzUmVhbCggMCwgMCwgMSwgMCApLCBbIDAgXSwgJzEqeCArIDAgPSAwIC0tLSAwIGlzIGEgc29sdXRpb24nICk7XG4gIGFycmF5QXBwcm94aW1hdGVFcXVhbHMoIGFzc2VydCwgVXRpbHMuc29sdmVDdWJpY1Jvb3RzUmVhbCggMCwgMCwgLTEsIDAgKSwgWyAwIF0sICctMSp4ICsgMCA9IDAgLS0tIDAgaXMgYSBzb2x1dGlvbicgKTtcbiAgYXJyYXlBcHByb3hpbWF0ZUVxdWFscyggYXNzZXJ0LCBVdGlscy5zb2x2ZUN1YmljUm9vdHNSZWFsKCAwLCAwLCAwLCAxICksIFtdLCAnMCp4ICsgMSA9IDAgLS0tIG5vIHNvbHV0aW9ucycgKTtcbiAgYXJyYXlBcHByb3hpbWF0ZUVxdWFscyggYXNzZXJ0LCBVdGlscy5zb2x2ZUN1YmljUm9vdHNSZWFsKCAwLCAwLCAxLCAxICksIFsgLTEgXSwgJzEqeCArIDEgPSAwIC0tLSBvbmUgc29sdXRpb24nICk7XG4gIGFycmF5QXBwcm94aW1hdGVFcXVhbHMoIGFzc2VydCwgVXRpbHMuc29sdmVDdWJpY1Jvb3RzUmVhbCggMCwgMCwgLTEsIDEgKSwgWyAxIF0sICctMSp4ICsgMSA9IDAgLS0tIG9uZSBzb2x1dGlvbicgKTtcbiAgYXJyYXlBcHByb3hpbWF0ZUVxdWFscyggYXNzZXJ0LCBVdGlscy5zb2x2ZUN1YmljUm9vdHNSZWFsKCAwLCAwLCAzLCAyICksIFsgLTIgLyAzIF0sICczKnggKyAyID0gMCAtLS0gb25lIHNvbHV0aW9uJyApO1xuICBhcnJheUFwcHJveGltYXRlRXF1YWxzKCBhc3NlcnQsIFV0aWxzLnNvbHZlQ3ViaWNSb290c1JlYWwoIDAsIDAsIC0zLCAyICksIFsgMiAvIDMgXSwgJy0zKnggKyAyID0gMCAtLS0gb25lIHNvbHV0aW9uJyApO1xuXG4gIGFycmF5QXBwcm94aW1hdGVFcXVhbHMoIGFzc2VydCwgVXRpbHMuc29sdmVDdWJpY1Jvb3RzUmVhbCggMCwgMSwgMCwgMCApLCBbIDAsIDAgXSwgJ3heMiA9IDAgLS0tIG9uZSBzb2x1dGlvbiB3aXRoIG11bHRpcGxpY2l0eSAyJyApO1xuICBhcnJheUFwcHJveGltYXRlRXF1YWxzKCBhc3NlcnQsIFV0aWxzLnNvbHZlQ3ViaWNSb290c1JlYWwoIDAsIDEsIDAsIC0xICksIFsgLTEsIDEgXSwgJ3heMiA9IDEgLS0tIHR3byBzb2x1dGlvbnMnICk7XG4gIGFycmF5QXBwcm94aW1hdGVFcXVhbHMoIGFzc2VydCwgVXRpbHMuc29sdmVDdWJpY1Jvb3RzUmVhbCggMCwgMSwgMCwgLTIgKSwgWyAtTWF0aC5zcXJ0KCAyICksIE1hdGguc3FydCggMiApIF0sICd4XjIgPSAyIC0tLSB0d28gc29sdXRpb25zJyApO1xuICBhcnJheUFwcHJveGltYXRlRXF1YWxzKCBhc3NlcnQsIFV0aWxzLnNvbHZlQ3ViaWNSb290c1JlYWwoIDAsIDIsIC0xLCAtMyApLCBbIC0xLCAzIC8gMiBdLCAnMnheMiAtIHggPSAzIC0tLSB0d28gc29sdXRpb25zJyApO1xuXG4gIGFycmF5QXBwcm94aW1hdGVFcXVhbHMoIGFzc2VydCwgVXRpbHMuc29sdmVDdWJpY1Jvb3RzUmVhbCggMSwgMCwgMCwgLTggKSwgWyAyIF0sICd4XjMgPSA4IC0tLSBvbmUgc29sdXRpb24nICk7XG4gIGFycmF5QXBwcm94aW1hdGVFcXVhbHMoIGFzc2VydCwgVXRpbHMuc29sdmVDdWJpY1Jvb3RzUmVhbCggMSwgLTYsIDExLCAtNiApLCBbIDEsIDIsIDMgXSwgJ3RocmVlIHNvbHV0aW9ucycgKTtcbiAgYXJyYXlBcHByb3hpbWF0ZUVxdWFscyggYXNzZXJ0LCBVdGlscy5zb2x2ZUN1YmljUm9vdHNSZWFsKCAxLCAtNSwgOCwgLTQgKSwgWyAxLCAyLCAyIF0sICd0d28gc29sdXRpb25zLCBvbmUgd2l0aCBtdWx0aXBsaWNpdHkgMicgKTtcbiAgYXJyYXlBcHByb3hpbWF0ZUVxdWFscyggYXNzZXJ0LCBVdGlscy5zb2x2ZUN1YmljUm9vdHNSZWFsKCAxLCAtMywgMywgLTEgKSwgWyAxLCAxLCAxIF0sICdvbmUgc29sdXRpb24gd2l0aCBtdWx0aXBsaWNpdHkgMycgKTtcbiAgYXJyYXlBcHByb3hpbWF0ZUVxdWFscyggYXNzZXJ0LCBVdGlscy5zb2x2ZUN1YmljUm9vdHNSZWFsKCAxLCAxLCAxLCAtMyApLCBbIDEgXSwgJ29uZSBzb2x1dGlvbicgKTtcbiAgYXJyYXlBcHByb3hpbWF0ZUVxdWFscyggYXNzZXJ0LCBVdGlscy5zb2x2ZUN1YmljUm9vdHNSZWFsKCAxLCAxLCAtMzMsIDYzICksIFsgLTcsIDMsIDMgXSwgJ3R3byBzb2x1dGlvbnMsIG9uZSB3aXRoIG11bHRpcGxpY2l0eSAyJyApO1xuICBhcnJheUFwcHJveGltYXRlRXF1YWxzKCBhc3NlcnQsIFV0aWxzLnNvbHZlQ3ViaWNSb290c1JlYWwoIDEsIC0zLCAwLCAwICksIFsgMCwgMCwgMyBdLCAndHdvIHNvbHV0aW9ucywgb25lIHdpdGggbXVsdGlwbGljaXR5IDInICk7XG4gIGFycmF5QXBwcm94aW1hdGVFcXVhbHMoIGFzc2VydCwgVXRpbHMuc29sdmVDdWJpY1Jvb3RzUmVhbCggMSwgMCwgMCwgMCApLCBbIDAsIDAsIDAgXSwgJ29uZSBzb2x1dGlvbiwgbXVsdGlwbGljaXR5IDMnICk7XG4gIGFycmF5QXBwcm94aW1hdGVFcXVhbHMoIGFzc2VydCwgVXRpbHMuc29sdmVDdWJpY1Jvb3RzUmVhbCggMSwgMTAsIDI1LCAwICksIFsgLTUsIC01LCAwIF0sICd0d28gc29sdXRpb25zLCBvbmUgd2l0aCBtdWx0aXBsaWNpdHkgMicgKTtcbiAgYXJyYXlBcHByb3hpbWF0ZUVxdWFscyggYXNzZXJ0LCBVdGlscy5zb2x2ZUN1YmljUm9vdHNSZWFsKCAxLCAwLCAtMjUsIDAgKSwgWyAtNSwgMCwgNSBdLCAndGhyZWUgc29sdXRpb25zJyApO1xuICBhcnJheUFwcHJveGltYXRlRXF1YWxzKCBhc3NlcnQsIFV0aWxzLnNvbHZlQ3ViaWNSb290c1JlYWwoIDEsIC0xOCwgMTA3LCAtMjEwICksIFsgNSwgNiwgNyBdLCAndGhyZWUgc29sdXRpb25zJyApO1xufSApO1xuXG5cblFVbml0LnRlc3QoICd0b0ZpeGVkJywgYXNzZXJ0ID0+IHtcblxuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSwgMCApLCAnSW5maW5pdHknICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMudG9GaXhlZCggTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLCAxICksICdJbmZpbml0eScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkKCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksIDUgKSwgJ0luZmluaXR5JyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIE51bWJlci5ORUdBVElWRV9JTkZJTklUWSwgMCApLCAnLUluZmluaXR5JyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIE51bWJlci5ORUdBVElWRV9JTkZJTklUWSwgMSApLCAnLUluZmluaXR5JyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIE51bWJlci5ORUdBVElWRV9JTkZJTklUWSwgNSApLCAnLUluZmluaXR5JyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIE5hTiwgMCApLCAnTmFOJyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIE5hTiwgMSApLCAnTmFOJyApO1xuXG4gIGFzc2VydC5lcXVhbCggVXRpbHMudG9GaXhlZCggMzUuODU1LCAwICksICczNicgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkKCAzNS44NTUsIDMgKSwgJzM1Ljg1NScgKTtcblxuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIDM1Ljg1NSwgMiApLCAnMzUuODYnICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMudG9GaXhlZCggMzUuODU0LCAyICksICczNS44NScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkKCAtMzUuODU1LCAyICksICctMzUuODYnICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMudG9GaXhlZCggLTM1Ljg1NCwgMiApLCAnLTM1Ljg1JyApO1xuXG4gIGFzc2VydC5lcXVhbCggVXRpbHMudG9GaXhlZCggMC4wMDUsIDIgKSwgJzAuMDEnICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMudG9GaXhlZCggMC4wMDQsIDIgKSwgJzAuMDAnICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMudG9GaXhlZCggLTAuMDA1LCAyICksICctMC4wMScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkKCAtMC4wMDQsIDIgKSwgJzAuMDAnICk7XG5cbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkKCAtMC4wMDUsIDIgKSwgJy0wLjAxJyApO1xuXG4gIGFzc2VydC5lcXVhbCggVXRpbHMudG9GaXhlZCggMS41LCAwICksICcyJyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIDEuNTYsIDAgKSwgJzInICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMudG9GaXhlZCggMS41NiwgMSApLCAnMS42JyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIDEuNTQsIDEgKSwgJzEuNScgKTtcblxuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIDEuNCwgMCApLCAnMScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkKCAxLjQ2LCAwICksICcxJyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIDEuNDYsIDEgKSwgJzEuNScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkKCAxLjQ0LCAxICksICcxLjQnICk7XG5cbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkKCA0LjU3Nzk5OTk5OTk5OTk5OSwgNyApLCAnNC41NzgwMDAwJyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIDAuMDc5NTc3NDcxNTQ1OTQ3NjcsIDMgKSwgJzAuMDgwJyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIDFlLTcsIDEwICksICcwLjAwMDAwMDEwMDAnICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMudG9GaXhlZCggMi43NDM5OTk5OTk5OTk5OTk4LCA3ICksICcyLjc0NDAwMDAnICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMudG9GaXhlZCggMC4zOTY3MDQsIDIgKSwgJzAuNDAnICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMudG9GaXhlZCggMS4wMDAyOTI5OTk5OTk5OTk5LCA3ICksICcxLjAwMDI5MzAnICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMudG9GaXhlZCggMC40OTk2MTYwMzQ0ODI3NTg2LCAzICksICcwLjUwMCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkKCA5OS45OTk5OTk5OTk5OTk5OSwgMiApLCAnMTAwLjAwJyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIDIuMTY5ODgwMTkxODE1MTUyLCAzICksICcyLjE3MCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkKCAxLjA5OTk5OTk5OTk5OTk5OTllLTcsIDEgKSwgJzAuMCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkKCAzLjIzMDMwMjk5OTk5OTk5OTcsIDcgKSwgJzMuMjMwMzAzMCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkKCAwLjQ5NzYyNSwgMiApLCAnMC41MCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkKCAyZS0xMiwgMTIgKSwgJzAuMDAwMDAwMDAwMDAyJyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIDYuOTg5MTA0NjcxNzM0OTUsIDEgKSwgJzcuMCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkKCA4Ljk3NjIxMjkzMzc0MTIyNSwgMSApLCAnOS4wJyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIDIuOTk4NTYzMjMzODUxMTU0MywgMSApLCAnMy4wJyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIC04Ljk1MTYzMzk4NjkyODEwNSwgMSApLCAtJzkuMCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkKCA5OS45OTk5OTk5OTk5OTk5OSwgMiApLCAnMTAwLjAwJyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIC00LjU0NzQ3MzUwODg2NDY0MWUtMTMsIDEwICksICcwLjAwMDAwMDAwMDAnICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMudG9GaXhlZCggMC45OCwgMSApLCAnMS4wJyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIDAuMjk1MzM4ODc5NjE0OTI2NCwgMiApLCAnMC4zMCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkKCAxLjExMTk4Mzk4Mjc4MDAwMDIsIDQgKSwgJzEuMTEyMCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkKCAxLjAwOTk5ODI3NTY1MDIxMjQsIDQgKSwgJzEuMDEwMCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkKCAtMS41LCAyICksICctMS41MCcgKTtcblxuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIDEuMTEzNzc0NDIwOTQ4MDA3ZSsyNSwgOSApLCAnMTExMzc3NDQyMDk0ODAwNzAwMDAwMDAwMDAuMDAwMDAwMDAwJyApO1xuXG4gIGFzc2VydC5lcXVhbCggVXRpbHMudG9GaXhlZCggMjk0OTU5Njk1OTQ5MzkuMSwgMyApLCAnMjk0OTU5Njk1OTQ5MzkuMTAwJyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIDI5NDk1OTY5NTk0OTM5LjAsIDMgKSwgJzI5NDk1OTY5NTk0OTM5LjAwMCcgKTtcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tZmxvYXRpbmctZGVjaW1hbFxuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIDI5NDk1OTY5NTk0OTM5LiwgMyApLCAnMjk0OTU5Njk1OTQ5MzkuMDAwJyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIDI5NDk1OTY5NTk0OTM5LCAzICksICcyOTQ5NTk2OTU5NDkzOS4wMDAnICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMudG9GaXhlZCggMjk0OTU5Njk1OTQ5MzksIDAgKSwgJzI5NDk1OTY5NTk0OTM5JyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIDI5NDk1OTY5NTk0OTM5MDAwMDAwMCwgMyApLCAnMjk0OTU5Njk1OTQ5MzkwMDAwMDAwLjAwMCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkKCAyOTQ5NTk2OTU5NDkzOTAwMDAwMDAsIDAgKSwgJzI5NDk1OTY5NTk0OTM5MDAwMDAwMCcgKTtcblxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICBVdGlscy50b0ZpeGVkKCAwLCAxLjMwMTAyOTk5NTY2Mzk4MTMgKTtcbiAgfSwgJ2ludGVnZXIgZm9yIGRlY2ltYWxQbGFjZXMnICk7XG5cbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkKCAwLCAwICksICcwJyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIDAsIDEgKSwgJzAuMCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkKCAtMCwgMCApLCAnMCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkKCAtMCwgMSApLCAnMC4wJyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWQoIC0wLCA0ICksICcwLjAwMDAnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICd0b0ZpeGVkTnVtYmVyJywgYXNzZXJ0ID0+IHtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkTnVtYmVyKCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksIDAgKSwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMudG9GaXhlZE51bWJlciggTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLCAxICksIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWROdW1iZXIoIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSwgNSApLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkTnVtYmVyKCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFksIDAgKSwgTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMudG9GaXhlZE51bWJlciggTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZLCAxICksIE51bWJlci5ORUdBVElWRV9JTkZJTklUWSApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWROdW1iZXIoIE51bWJlci5ORUdBVElWRV9JTkZJTklUWSwgNSApLCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkTnVtYmVyKCAxMDAwLjEwMCwgMCApLnRvU3RyaW5nKCksICcxMDAwJyApO1xuICBhc3NlcnQuZXF1YWwoIFV0aWxzLnRvRml4ZWROdW1iZXIoIDEwMDAuMTAwLCAwICksIDEwMDAgKTtcbiAgYXNzZXJ0LmVxdWFsKCBVdGlscy50b0ZpeGVkTnVtYmVyKCAxMDAwLjEwMCwgMSApLnRvU3RyaW5nKCksICcxMDAwLjEnICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMudG9GaXhlZE51bWJlciggMTAwMC4xMDAsIDEgKSwgMTAwMC4xICk7XG4gIGFzc2VydC5lcXVhbCggVXRpbHMudG9GaXhlZE51bWJlciggLTAsIDEgKS50b1N0cmluZygpLCAnMCcgKTtcbn0gKTsiXSwibmFtZXMiOlsiZG90IiwiVXRpbHMiLCJWZWN0b3IyIiwiUVVuaXQiLCJtb2R1bGUiLCJhcHByb3hpbWF0ZUVxdWFscyIsImFzc2VydCIsImEiLCJiIiwibXNnIiwib2siLCJNYXRoIiwiYWJzIiwiYXJyYXlBcHByb3hpbWF0ZUVxdWFscyIsImFTb3J0ZWQiLCJzbGljZSIsInNvcnQiLCJiU29ydGVkIiwiZXF1YWwiLCJsZW5ndGgiLCJpIiwidGVzdCIsIm1vZHVsb0JldHdlZW5Eb3duIiwibW9kdWxvQmV0d2VlblVwIiwicm91bmRTeW1tZXRyaWMiLCJvcmlnaW5hbCIsInYyIiwicm91bmRlZCIsInJvdW5kZWRTeW1tZXRyaWMiLCJlcXVhbHMiLCJyZXN1bHQiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsIk5FR0FUSVZFX0lORklOSVRZIiwiZiIsImxpbmVMaW5lSW50ZXJzZWN0aW9uIiwicDEiLCJaRVJPIiwicDIiLCJwMyIsInA0IiwieCIsInkiLCJoIiwibGluZVNlZ21lbnRJbnRlcnNlY3Rpb24iLCJwNSIsImRpc3RUb1NlZ21lbnRTcXVhcmVkIiwibGluZWFyIiwiY2xhbXAiLCJhcnIiLCJyYW5nZUluY2x1c2l2ZSIsInJhbmdlRXhjbHVzaXZlIiwidG9SYWRpYW5zIiwiUEkiLCJ0b0RlZ3JlZXMiLCJudW1iZXJPZkRlY2ltYWxQbGFjZXMiLCJ3aW5kb3ciLCJ0aHJvd3MiLCJJbmZpbml0eSIsInJvdW5kVG9JbnRlcnZhbCIsInNvbHZlTGluZWFyUm9vdHNSZWFsIiwic29sdmVRdWFkcmF0aWNSb290c1JlYWwiLCJzcXJ0Iiwic29sdmVDdWJpY1Jvb3RzUmVhbCIsInRvRml4ZWQiLCJOYU4iLCJ0b0ZpeGVkTnVtYmVyIiwidG9TdHJpbmciXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELE9BQU9BLFNBQVMsV0FBVztBQUMzQixPQUFPQyxXQUFXLGFBQWE7QUFDL0IsT0FBT0MsYUFBYSxlQUFlO0FBRW5DQyxNQUFNQyxNQUFNLENBQUU7QUFFZCxTQUFTQyxrQkFBbUJDLE1BQU0sRUFBRUMsQ0FBQyxFQUFFQyxDQUFDLEVBQUVDLEdBQUc7SUFDM0NILE9BQU9JLEVBQUUsQ0FBRUMsS0FBS0MsR0FBRyxDQUFFTCxJQUFJQyxLQUFNLFlBQVksR0FBR0MsSUFBSSxXQUFXLEVBQUVELEVBQUUsVUFBVSxFQUFF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