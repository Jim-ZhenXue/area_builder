// Copyright 2019-2022, University of Colorado Boulder
/**
 * RangeWithValue tests
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */ import RangeWithValue from './RangeWithValue.js';
QUnit.module('RangeWithValue');
QUnit.test('constructor', (assert)=>{
    assert.ok(new RangeWithValue(1, 10, 2), 'valid range with value');
    assert.ok(new RangeWithValue(1, 10, 1), 'valid range with value');
    assert.ok(new RangeWithValue(1, 10, 10), 'valid range with value');
    assert.ok(new RangeWithValue(10, 10, 10), 'valid range with value');
    window.assert && assert.throws(()=>{
        new RangeWithValue(1, 10, 11); // eslint-disable-line no-new
    }, 'invalid range with value, default value is out of range');
    window.assert && assert.throws(()=>{
        new RangeWithValue(1, 10); // eslint-disable-line no-new
    }, 'invalid range with value, default value is required');
});
QUnit.test('methods', (assert)=>{
    // test valid and invalid setMin()
    let rangeWithValue = new RangeWithValue(1, 10, 3);
    rangeWithValue.setMin(2);
    assert.equal(rangeWithValue.min, 2, 'setMin() succeeds when min <= defaultValue <= max');
    rangeWithValue.setMin(3);
    assert.equal(rangeWithValue.min, 3, 'setMin() succeeds when min <= defaultValue <= max');
    window.assert && assert.throws(()=>{
        rangeWithValue.setMin(4);
    }, 'setMin() fails when defaultValue < min');
    // test valid and invalid setMax()
    rangeWithValue = new RangeWithValue(1, 10, 8);
    rangeWithValue.setMax(9);
    assert.equal(rangeWithValue.max, 9, 'setMax() succeeds when max >= defaultValue >= min');
    rangeWithValue.setMax(8);
    assert.equal(rangeWithValue.max, 8, 'setMax() succeeds when max >= defaultValue >= min');
    window.assert && assert.throws(()=>{
        rangeWithValue.setMax(7);
    }, 'setMax() fails when defaultValue > max');
    // test a true and false equals()
    rangeWithValue = new RangeWithValue(1, 10, 5);
    assert.ok(rangeWithValue.equals(new RangeWithValue(1, 10, 5)), 'equals() succeeds when rangeWithValue1 === rangeWithValue2');
    assert.notOk(rangeWithValue.equals(new RangeWithValue(1, 10, 6)), 'equals() fails when rangeWithValue1 !== rangeWithValue2');
    // test valid and invalid setMinMax()
    rangeWithValue = new RangeWithValue(1, 10, 5);
    rangeWithValue.setMinMax(2, 9);
    assert.ok(rangeWithValue.equals(new RangeWithValue(2, 9, 5)), 'setMinMax() succeeds when min <= defaultValue <= max');
    rangeWithValue.setMinMax(2, 5);
    assert.ok(rangeWithValue.equals(new RangeWithValue(2, 5, 5)), 'setMinMax() succeeds when min <= defaultValue <= max');
    rangeWithValue.setMinMax(5, 9);
    assert.ok(rangeWithValue.equals(new RangeWithValue(5, 9, 5)), 'setMinMax() succeeds when min <= defaultValue <= max');
    rangeWithValue.setMinMax(5, 5);
    assert.ok(rangeWithValue.equals(new RangeWithValue(5, 5, 5)), 'setMinMax() succeeds when min <= defaultValue <= max');
    window.assert && assert.throws(()=>{
        rangeWithValue.setMinMax(3, 4);
    }, 'setMinMax() fails when default value is out of range');
    window.assert && assert.throws(()=>{
        rangeWithValue.setMinMax(6, 7);
    }, 'setMinMax() fails when default value is out of range');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZVdpdGhWYWx1ZVRlc3RzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFJhbmdlV2l0aFZhbHVlIHRlc3RzXG4gKlxuICogQGF1dGhvciBDaHJpcyBLbHVzZW5kb3JmIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBSYW5nZVdpdGhWYWx1ZSBmcm9tICcuL1JhbmdlV2l0aFZhbHVlLmpzJztcblxuUVVuaXQubW9kdWxlKCAnUmFuZ2VXaXRoVmFsdWUnICk7XG5cblFVbml0LnRlc3QoICdjb25zdHJ1Y3RvcicsIGFzc2VydCA9PiB7XG4gIGFzc2VydC5vayggbmV3IFJhbmdlV2l0aFZhbHVlKCAxLCAxMCwgMiApLCAndmFsaWQgcmFuZ2Ugd2l0aCB2YWx1ZScgKTtcbiAgYXNzZXJ0Lm9rKCBuZXcgUmFuZ2VXaXRoVmFsdWUoIDEsIDEwLCAxICksICd2YWxpZCByYW5nZSB3aXRoIHZhbHVlJyApO1xuICBhc3NlcnQub2soIG5ldyBSYW5nZVdpdGhWYWx1ZSggMSwgMTAsIDEwICksICd2YWxpZCByYW5nZSB3aXRoIHZhbHVlJyApO1xuICBhc3NlcnQub2soIG5ldyBSYW5nZVdpdGhWYWx1ZSggMTAsIDEwLCAxMCApLCAndmFsaWQgcmFuZ2Ugd2l0aCB2YWx1ZScgKTtcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgbmV3IFJhbmdlV2l0aFZhbHVlKCAxLCAxMCwgMTEgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1uZXdcbiAgfSwgJ2ludmFsaWQgcmFuZ2Ugd2l0aCB2YWx1ZSwgZGVmYXVsdCB2YWx1ZSBpcyBvdXQgb2YgcmFuZ2UnICk7XG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIG5ldyBSYW5nZVdpdGhWYWx1ZSggMSwgMTAgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1uZXdcbiAgfSwgJ2ludmFsaWQgcmFuZ2Ugd2l0aCB2YWx1ZSwgZGVmYXVsdCB2YWx1ZSBpcyByZXF1aXJlZCcgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ21ldGhvZHMnLCBhc3NlcnQgPT4ge1xuXG4gIC8vIHRlc3QgdmFsaWQgYW5kIGludmFsaWQgc2V0TWluKClcbiAgbGV0IHJhbmdlV2l0aFZhbHVlID0gbmV3IFJhbmdlV2l0aFZhbHVlKCAxLCAxMCwgMyApO1xuICByYW5nZVdpdGhWYWx1ZS5zZXRNaW4oIDIgKTtcbiAgYXNzZXJ0LmVxdWFsKCByYW5nZVdpdGhWYWx1ZS5taW4sIDIsICdzZXRNaW4oKSBzdWNjZWVkcyB3aGVuIG1pbiA8PSBkZWZhdWx0VmFsdWUgPD0gbWF4JyApO1xuICByYW5nZVdpdGhWYWx1ZS5zZXRNaW4oIDMgKTtcbiAgYXNzZXJ0LmVxdWFsKCByYW5nZVdpdGhWYWx1ZS5taW4sIDMsICdzZXRNaW4oKSBzdWNjZWVkcyB3aGVuIG1pbiA8PSBkZWZhdWx0VmFsdWUgPD0gbWF4JyApO1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHsgcmFuZ2VXaXRoVmFsdWUuc2V0TWluKCA0ICk7IH0sICdzZXRNaW4oKSBmYWlscyB3aGVuIGRlZmF1bHRWYWx1ZSA8IG1pbicgKTtcblxuICAvLyB0ZXN0IHZhbGlkIGFuZCBpbnZhbGlkIHNldE1heCgpXG4gIHJhbmdlV2l0aFZhbHVlID0gbmV3IFJhbmdlV2l0aFZhbHVlKCAxLCAxMCwgOCApO1xuICByYW5nZVdpdGhWYWx1ZS5zZXRNYXgoIDkgKTtcbiAgYXNzZXJ0LmVxdWFsKCByYW5nZVdpdGhWYWx1ZS5tYXgsIDksICdzZXRNYXgoKSBzdWNjZWVkcyB3aGVuIG1heCA+PSBkZWZhdWx0VmFsdWUgPj0gbWluJyApO1xuICByYW5nZVdpdGhWYWx1ZS5zZXRNYXgoIDggKTtcbiAgYXNzZXJ0LmVxdWFsKCByYW5nZVdpdGhWYWx1ZS5tYXgsIDgsICdzZXRNYXgoKSBzdWNjZWVkcyB3aGVuIG1heCA+PSBkZWZhdWx0VmFsdWUgPj0gbWluJyApO1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHsgcmFuZ2VXaXRoVmFsdWUuc2V0TWF4KCA3ICk7IH0sICdzZXRNYXgoKSBmYWlscyB3aGVuIGRlZmF1bHRWYWx1ZSA+IG1heCcgKTtcblxuICAvLyB0ZXN0IGEgdHJ1ZSBhbmQgZmFsc2UgZXF1YWxzKClcbiAgcmFuZ2VXaXRoVmFsdWUgPSBuZXcgUmFuZ2VXaXRoVmFsdWUoIDEsIDEwLCA1ICk7XG4gIGFzc2VydC5vayhcbiAgICByYW5nZVdpdGhWYWx1ZS5lcXVhbHMoIG5ldyBSYW5nZVdpdGhWYWx1ZSggMSwgMTAsIDUgKSApLFxuICAgICdlcXVhbHMoKSBzdWNjZWVkcyB3aGVuIHJhbmdlV2l0aFZhbHVlMSA9PT0gcmFuZ2VXaXRoVmFsdWUyJ1xuICApO1xuICBhc3NlcnQubm90T2soXG4gICAgcmFuZ2VXaXRoVmFsdWUuZXF1YWxzKCBuZXcgUmFuZ2VXaXRoVmFsdWUoIDEsIDEwLCA2ICkgKSxcbiAgICAnZXF1YWxzKCkgZmFpbHMgd2hlbiByYW5nZVdpdGhWYWx1ZTEgIT09IHJhbmdlV2l0aFZhbHVlMidcbiAgKTtcblxuICAvLyB0ZXN0IHZhbGlkIGFuZCBpbnZhbGlkIHNldE1pbk1heCgpXG4gIHJhbmdlV2l0aFZhbHVlID0gbmV3IFJhbmdlV2l0aFZhbHVlKCAxLCAxMCwgNSApO1xuICByYW5nZVdpdGhWYWx1ZS5zZXRNaW5NYXgoIDIsIDkgKTtcbiAgYXNzZXJ0Lm9rKCByYW5nZVdpdGhWYWx1ZS5lcXVhbHMoIG5ldyBSYW5nZVdpdGhWYWx1ZSggMiwgOSwgNSApICksICdzZXRNaW5NYXgoKSBzdWNjZWVkcyB3aGVuIG1pbiA8PSBkZWZhdWx0VmFsdWUgPD0gbWF4JyApO1xuICByYW5nZVdpdGhWYWx1ZS5zZXRNaW5NYXgoIDIsIDUgKTtcbiAgYXNzZXJ0Lm9rKCByYW5nZVdpdGhWYWx1ZS5lcXVhbHMoIG5ldyBSYW5nZVdpdGhWYWx1ZSggMiwgNSwgNSApICksICdzZXRNaW5NYXgoKSBzdWNjZWVkcyB3aGVuIG1pbiA8PSBkZWZhdWx0VmFsdWUgPD0gbWF4JyApO1xuICByYW5nZVdpdGhWYWx1ZS5zZXRNaW5NYXgoIDUsIDkgKTtcbiAgYXNzZXJ0Lm9rKCByYW5nZVdpdGhWYWx1ZS5lcXVhbHMoIG5ldyBSYW5nZVdpdGhWYWx1ZSggNSwgOSwgNSApICksICdzZXRNaW5NYXgoKSBzdWNjZWVkcyB3aGVuIG1pbiA8PSBkZWZhdWx0VmFsdWUgPD0gbWF4JyApO1xuICByYW5nZVdpdGhWYWx1ZS5zZXRNaW5NYXgoIDUsIDUgKTtcbiAgYXNzZXJ0Lm9rKCByYW5nZVdpdGhWYWx1ZS5lcXVhbHMoIG5ldyBSYW5nZVdpdGhWYWx1ZSggNSwgNSwgNSApICksICdzZXRNaW5NYXgoKSBzdWNjZWVkcyB3aGVuIG1pbiA8PSBkZWZhdWx0VmFsdWUgPD0gbWF4JyApO1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICAgIHJhbmdlV2l0aFZhbHVlLnNldE1pbk1heCggMywgNCApO1xuICAgIH0sICdzZXRNaW5NYXgoKSBmYWlscyB3aGVuIGRlZmF1bHQgdmFsdWUgaXMgb3V0IG9mIHJhbmdlJ1xuICApO1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICAgIHJhbmdlV2l0aFZhbHVlLnNldE1pbk1heCggNiwgNyApO1xuICAgIH0sICdzZXRNaW5NYXgoKSBmYWlscyB3aGVuIGRlZmF1bHQgdmFsdWUgaXMgb3V0IG9mIHJhbmdlJ1xuICApO1xufSApOyJdLCJuYW1lcyI6WyJSYW5nZVdpdGhWYWx1ZSIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsIm9rIiwid2luZG93IiwidGhyb3dzIiwicmFuZ2VXaXRoVmFsdWUiLCJzZXRNaW4iLCJlcXVhbCIsIm1pbiIsInNldE1heCIsIm1heCIsImVxdWFscyIs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