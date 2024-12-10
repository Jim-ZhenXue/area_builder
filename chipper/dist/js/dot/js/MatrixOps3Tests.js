// Copyright 2017-2022, University of Colorado Boulder
/**
 * Bounds2 tests
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import MatrixOps3 from './MatrixOps3.js';
QUnit.module('MatrixOps3');
function approxEqual(assert, a, b, msg) {
    assert.ok(Math.abs(a - b) < 0.0001, msg);
}
function approxEqualArray(assert, arr, barr, msg) {
    for(let i = 0; i < arr.length; i++){
        approxEqual(assert, arr[i], barr[i], `${msg}: index ${i}`);
    }
}
QUnit.test('3x3 mults', (assert)=>{
    const a = new MatrixOps3.Array([
        1,
        2,
        7,
        5,
        2,
        6,
        -1,
        -5,
        4
    ]); // a:= {{1, 2, 7}, {5, 2, 6}, {-1, -5, 4}}
    const b = new MatrixOps3.Array([
        4,
        3,
        1,
        -7,
        2,
        -1,
        -1,
        0,
        -2
    ]); // b:= {{4, 3, 1}, {-7, 2, -1}, {-1, 0, -2}}
    const c = new MatrixOps3.Array(9);
    MatrixOps3.mult3(a, b, c);
    approxEqualArray(assert, c, [
        -17,
        7,
        -15,
        0,
        19,
        -9,
        27,
        -13,
        -4
    ], 'mult3');
    MatrixOps3.mult3LeftTranspose(a, b, c);
    approxEqualArray(assert, c, [
        -30,
        13,
        -2,
        -1,
        10,
        10,
        -18,
        33,
        -7
    ], 'mult3LeftTranspose');
    MatrixOps3.mult3RightTranspose(a, b, c);
    approxEqualArray(assert, c, [
        17,
        -10,
        -15,
        32,
        -37,
        -17,
        -15,
        -7,
        -7
    ], 'mult3RightTranspose');
    MatrixOps3.mult3BothTranspose(a, b, c);
    approxEqualArray(assert, c, [
        18,
        4,
        1,
        9,
        -5,
        8,
        50,
        -41,
        -15
    ], 'mult3BothTranspose');
});
QUnit.test('optimized Givens rotation equivalence', (assert)=>{
    const a = new MatrixOps3.Array([
        1,
        2,
        7,
        5,
        2,
        6,
        -1,
        -5,
        4
    ]);
    const normal = new MatrixOps3.Array(9);
    const accel = new MatrixOps3.Array(9);
    const givens = new MatrixOps3.Array(9);
    const cos = Math.cos(Math.PI / 6);
    const sin = Math.sin(Math.PI / 6);
    MatrixOps3.set3(a, normal);
    MatrixOps3.set3(a, accel);
    approxEqualArray(assert, normal, accel, 'sanity check 1');
    approxEqualArray(assert, a, accel, 'sanity check 2');
    // left mult 0,1
    MatrixOps3.setGivens3(givens, cos, sin, 0, 1);
    MatrixOps3.mult3(givens, normal, normal);
    MatrixOps3.preMult3Givens(accel, cos, sin, 0, 1);
    approxEqualArray(assert, normal, accel, 'left mult 0,1');
    // left mult 0,2
    MatrixOps3.setGivens3(givens, cos, sin, 0, 2);
    MatrixOps3.mult3(givens, normal, normal);
    MatrixOps3.preMult3Givens(accel, cos, sin, 0, 2);
    approxEqualArray(assert, normal, accel, 'left mult 0,2');
    // left mult 1,2
    MatrixOps3.setGivens3(givens, cos, sin, 1, 2);
    MatrixOps3.mult3(givens, normal, normal);
    MatrixOps3.preMult3Givens(accel, cos, sin, 1, 2);
    approxEqualArray(assert, normal, accel, 'left mult 1,2');
    // right mult 0,1
    MatrixOps3.setGivens3(givens, cos, sin, 0, 1);
    MatrixOps3.mult3RightTranspose(normal, givens, normal);
    MatrixOps3.postMult3Givens(accel, cos, sin, 0, 1);
    approxEqualArray(assert, normal, accel, 'right mult 0,1');
    // right mult 0,2
    MatrixOps3.setGivens3(givens, cos, sin, 0, 2);
    MatrixOps3.mult3RightTranspose(normal, givens, normal);
    MatrixOps3.postMult3Givens(accel, cos, sin, 0, 2);
    approxEqualArray(assert, normal, accel, 'right mult 0,2');
    // right mult 1,2
    MatrixOps3.setGivens3(givens, cos, sin, 1, 2);
    MatrixOps3.mult3RightTranspose(normal, givens, normal);
    MatrixOps3.postMult3Givens(accel, cos, sin, 1, 2);
    approxEqualArray(assert, normal, accel, 'right mult 1,2');
});
QUnit.test('SVD', (assert)=>{
    const a = new MatrixOps3.Array([
        1,
        2,
        7,
        5,
        2,
        6,
        -1,
        -5,
        4
    ]);
    const u = new MatrixOps3.Array(9);
    const sigma = new MatrixOps3.Array(9);
    const v = new MatrixOps3.Array(9);
    MatrixOps3.svd3(a, 20, u, sigma, v);
    const c = new MatrixOps3.Array(9);
    // c = U * Sigma * V^T
    MatrixOps3.mult3(u, sigma, c);
    MatrixOps3.mult3RightTranspose(c, v, c);
    approxEqualArray(assert, a, c, 'SVD composes');
    approxEqualArray(assert, sigma, [
        sigma[0],
        0,
        0,
        0,
        sigma[4],
        0,
        0,
        0,
        sigma[8]
    ], 'Diagonal matrix should be diagonal');
    MatrixOps3.mult3RightTranspose(u, u, c);
    approxEqualArray(assert, c, [
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1
    ], 'U should be unitary');
    MatrixOps3.mult3RightTranspose(v, v, c);
    approxEqualArray(assert, c, [
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1
    ], 'V should be unitary');
    approxEqual(assert, MatrixOps3.det3(u), 1, 'U should be a rotation matrix with the current customs');
    approxEqual(assert, MatrixOps3.det3(v), 1, 'V should be a rotation matrix with the current customs');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9NYXRyaXhPcHMzVGVzdHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQm91bmRzMiB0ZXN0c1xuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBNYXRyaXhPcHMzIGZyb20gJy4vTWF0cml4T3BzMy5qcyc7XG5cblFVbml0Lm1vZHVsZSggJ01hdHJpeE9wczMnICk7XG5cbmZ1bmN0aW9uIGFwcHJveEVxdWFsKCBhc3NlcnQsIGEsIGIsIG1zZyApIHtcbiAgYXNzZXJ0Lm9rKCBNYXRoLmFicyggYSAtIGIgKSA8IDAuMDAwMSwgbXNnICk7XG59XG5cbmZ1bmN0aW9uIGFwcHJveEVxdWFsQXJyYXkoIGFzc2VydCwgYXJyLCBiYXJyLCBtc2cgKSB7XG4gIGZvciAoIGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKyApIHtcbiAgICBhcHByb3hFcXVhbCggYXNzZXJ0LCBhcnJbIGkgXSwgYmFyclsgaSBdLCBgJHttc2d9OiBpbmRleCAke2l9YCApO1xuICB9XG59XG5cbiBcblFVbml0LnRlc3QoICczeDMgbXVsdHMnLCBhc3NlcnQgPT4ge1xuICBjb25zdCBhID0gbmV3IE1hdHJpeE9wczMuQXJyYXkoIFsgMSwgMiwgNywgNSwgMiwgNiwgLTEsIC01LCA0IF0gKTsgLy8gYTo9IHt7MSwgMiwgN30sIHs1LCAyLCA2fSwgey0xLCAtNSwgNH19XG4gIGNvbnN0IGIgPSBuZXcgTWF0cml4T3BzMy5BcnJheSggWyA0LCAzLCAxLCAtNywgMiwgLTEsIC0xLCAwLCAtMiBdICk7IC8vIGI6PSB7ezQsIDMsIDF9LCB7LTcsIDIsIC0xfSwgey0xLCAwLCAtMn19XG4gIGNvbnN0IGMgPSBuZXcgTWF0cml4T3BzMy5BcnJheSggOSApO1xuXG4gIE1hdHJpeE9wczMubXVsdDMoIGEsIGIsIGMgKTtcbiAgYXBwcm94RXF1YWxBcnJheSggYXNzZXJ0LCBjLCBbIC0xNywgNywgLTE1LCAwLCAxOSwgLTksIDI3LCAtMTMsIC00IF0sICdtdWx0MycgKTtcblxuICBNYXRyaXhPcHMzLm11bHQzTGVmdFRyYW5zcG9zZSggYSwgYiwgYyApO1xuICBhcHByb3hFcXVhbEFycmF5KCBhc3NlcnQsIGMsIFsgLTMwLCAxMywgLTIsIC0xLCAxMCwgMTAsIC0xOCwgMzMsIC03IF0sICdtdWx0M0xlZnRUcmFuc3Bvc2UnICk7XG4gIE1hdHJpeE9wczMubXVsdDNSaWdodFRyYW5zcG9zZSggYSwgYiwgYyApO1xuICBhcHByb3hFcXVhbEFycmF5KCBhc3NlcnQsIGMsIFsgMTcsIC0xMCwgLTE1LCAzMiwgLTM3LCAtMTcsIC0xNSwgLTcsIC03IF0sICdtdWx0M1JpZ2h0VHJhbnNwb3NlJyApO1xuICBNYXRyaXhPcHMzLm11bHQzQm90aFRyYW5zcG9zZSggYSwgYiwgYyApO1xuICBhcHByb3hFcXVhbEFycmF5KCBhc3NlcnQsIGMsIFsgMTgsIDQsIDEsIDksIC01LCA4LCA1MCwgLTQxLCAtMTUgXSwgJ211bHQzQm90aFRyYW5zcG9zZScgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ29wdGltaXplZCBHaXZlbnMgcm90YXRpb24gZXF1aXZhbGVuY2UnLCBhc3NlcnQgPT4ge1xuICBjb25zdCBhID0gbmV3IE1hdHJpeE9wczMuQXJyYXkoIFsgMSwgMiwgNywgNSwgMiwgNiwgLTEsIC01LCA0IF0gKTtcbiAgY29uc3Qgbm9ybWFsID0gbmV3IE1hdHJpeE9wczMuQXJyYXkoIDkgKTtcbiAgY29uc3QgYWNjZWwgPSBuZXcgTWF0cml4T3BzMy5BcnJheSggOSApO1xuICBjb25zdCBnaXZlbnMgPSBuZXcgTWF0cml4T3BzMy5BcnJheSggOSApO1xuXG4gIGNvbnN0IGNvcyA9IE1hdGguY29zKCBNYXRoLlBJIC8gNiApO1xuICBjb25zdCBzaW4gPSBNYXRoLnNpbiggTWF0aC5QSSAvIDYgKTtcblxuICBNYXRyaXhPcHMzLnNldDMoIGEsIG5vcm1hbCApO1xuICBNYXRyaXhPcHMzLnNldDMoIGEsIGFjY2VsICk7XG4gIGFwcHJveEVxdWFsQXJyYXkoIGFzc2VydCwgbm9ybWFsLCBhY2NlbCwgJ3Nhbml0eSBjaGVjayAxJyApO1xuICBhcHByb3hFcXVhbEFycmF5KCBhc3NlcnQsIGEsIGFjY2VsLCAnc2FuaXR5IGNoZWNrIDInICk7XG5cbiAgLy8gbGVmdCBtdWx0IDAsMVxuICBNYXRyaXhPcHMzLnNldEdpdmVuczMoIGdpdmVucywgY29zLCBzaW4sIDAsIDEgKTtcbiAgTWF0cml4T3BzMy5tdWx0MyggZ2l2ZW5zLCBub3JtYWwsIG5vcm1hbCApO1xuICBNYXRyaXhPcHMzLnByZU11bHQzR2l2ZW5zKCBhY2NlbCwgY29zLCBzaW4sIDAsIDEgKTtcbiAgYXBwcm94RXF1YWxBcnJheSggYXNzZXJ0LCBub3JtYWwsIGFjY2VsLCAnbGVmdCBtdWx0IDAsMScgKTtcblxuICAvLyBsZWZ0IG11bHQgMCwyXG4gIE1hdHJpeE9wczMuc2V0R2l2ZW5zMyggZ2l2ZW5zLCBjb3MsIHNpbiwgMCwgMiApO1xuICBNYXRyaXhPcHMzLm11bHQzKCBnaXZlbnMsIG5vcm1hbCwgbm9ybWFsICk7XG4gIE1hdHJpeE9wczMucHJlTXVsdDNHaXZlbnMoIGFjY2VsLCBjb3MsIHNpbiwgMCwgMiApO1xuICBhcHByb3hFcXVhbEFycmF5KCBhc3NlcnQsIG5vcm1hbCwgYWNjZWwsICdsZWZ0IG11bHQgMCwyJyApO1xuXG4gIC8vIGxlZnQgbXVsdCAxLDJcbiAgTWF0cml4T3BzMy5zZXRHaXZlbnMzKCBnaXZlbnMsIGNvcywgc2luLCAxLCAyICk7XG4gIE1hdHJpeE9wczMubXVsdDMoIGdpdmVucywgbm9ybWFsLCBub3JtYWwgKTtcbiAgTWF0cml4T3BzMy5wcmVNdWx0M0dpdmVucyggYWNjZWwsIGNvcywgc2luLCAxLCAyICk7XG4gIGFwcHJveEVxdWFsQXJyYXkoIGFzc2VydCwgbm9ybWFsLCBhY2NlbCwgJ2xlZnQgbXVsdCAxLDInICk7XG5cbiAgLy8gcmlnaHQgbXVsdCAwLDFcbiAgTWF0cml4T3BzMy5zZXRHaXZlbnMzKCBnaXZlbnMsIGNvcywgc2luLCAwLCAxICk7XG4gIE1hdHJpeE9wczMubXVsdDNSaWdodFRyYW5zcG9zZSggbm9ybWFsLCBnaXZlbnMsIG5vcm1hbCApO1xuICBNYXRyaXhPcHMzLnBvc3RNdWx0M0dpdmVucyggYWNjZWwsIGNvcywgc2luLCAwLCAxICk7XG4gIGFwcHJveEVxdWFsQXJyYXkoIGFzc2VydCwgbm9ybWFsLCBhY2NlbCwgJ3JpZ2h0IG11bHQgMCwxJyApO1xuXG4gIC8vIHJpZ2h0IG11bHQgMCwyXG4gIE1hdHJpeE9wczMuc2V0R2l2ZW5zMyggZ2l2ZW5zLCBjb3MsIHNpbiwgMCwgMiApO1xuICBNYXRyaXhPcHMzLm11bHQzUmlnaHRUcmFuc3Bvc2UoIG5vcm1hbCwgZ2l2ZW5zLCBub3JtYWwgKTtcbiAgTWF0cml4T3BzMy5wb3N0TXVsdDNHaXZlbnMoIGFjY2VsLCBjb3MsIHNpbiwgMCwgMiApO1xuICBhcHByb3hFcXVhbEFycmF5KCBhc3NlcnQsIG5vcm1hbCwgYWNjZWwsICdyaWdodCBtdWx0IDAsMicgKTtcblxuICAvLyByaWdodCBtdWx0IDEsMlxuICBNYXRyaXhPcHMzLnNldEdpdmVuczMoIGdpdmVucywgY29zLCBzaW4sIDEsIDIgKTtcbiAgTWF0cml4T3BzMy5tdWx0M1JpZ2h0VHJhbnNwb3NlKCBub3JtYWwsIGdpdmVucywgbm9ybWFsICk7XG4gIE1hdHJpeE9wczMucG9zdE11bHQzR2l2ZW5zKCBhY2NlbCwgY29zLCBzaW4sIDEsIDIgKTtcbiAgYXBwcm94RXF1YWxBcnJheSggYXNzZXJ0LCBub3JtYWwsIGFjY2VsLCAncmlnaHQgbXVsdCAxLDInICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdTVkQnLCBhc3NlcnQgPT4ge1xuICBjb25zdCBhID0gbmV3IE1hdHJpeE9wczMuQXJyYXkoIFsgMSwgMiwgNywgNSwgMiwgNiwgLTEsIC01LCA0IF0gKTtcbiAgY29uc3QgdSA9IG5ldyBNYXRyaXhPcHMzLkFycmF5KCA5ICk7XG4gIGNvbnN0IHNpZ21hID0gbmV3IE1hdHJpeE9wczMuQXJyYXkoIDkgKTtcbiAgY29uc3QgdiA9IG5ldyBNYXRyaXhPcHMzLkFycmF5KCA5ICk7XG5cbiAgTWF0cml4T3BzMy5zdmQzKCBhLCAyMCwgdSwgc2lnbWEsIHYgKTtcblxuICBjb25zdCBjID0gbmV3IE1hdHJpeE9wczMuQXJyYXkoIDkgKTtcblxuICAvLyBjID0gVSAqIFNpZ21hICogVl5UXG4gIE1hdHJpeE9wczMubXVsdDMoIHUsIHNpZ21hLCBjICk7XG4gIE1hdHJpeE9wczMubXVsdDNSaWdodFRyYW5zcG9zZSggYywgdiwgYyApO1xuXG4gIGFwcHJveEVxdWFsQXJyYXkoIGFzc2VydCwgYSwgYywgJ1NWRCBjb21wb3NlcycgKTtcblxuICBhcHByb3hFcXVhbEFycmF5KCBhc3NlcnQsIHNpZ21hLCBbIHNpZ21hWyAwIF0sIDAsIDAsIDAsIHNpZ21hWyA0IF0sIDAsIDAsIDAsIHNpZ21hWyA4IF0gXSwgJ0RpYWdvbmFsIG1hdHJpeCBzaG91bGQgYmUgZGlhZ29uYWwnICk7XG5cbiAgTWF0cml4T3BzMy5tdWx0M1JpZ2h0VHJhbnNwb3NlKCB1LCB1LCBjICk7XG4gIGFwcHJveEVxdWFsQXJyYXkoIGFzc2VydCwgYywgWyAxLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAxIF0sICdVIHNob3VsZCBiZSB1bml0YXJ5JyApO1xuXG4gIE1hdHJpeE9wczMubXVsdDNSaWdodFRyYW5zcG9zZSggdiwgdiwgYyApO1xuICBhcHByb3hFcXVhbEFycmF5KCBhc3NlcnQsIGMsIFsgMSwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMSBdLCAnViBzaG91bGQgYmUgdW5pdGFyeScgKTtcblxuICBhcHByb3hFcXVhbCggYXNzZXJ0LCBNYXRyaXhPcHMzLmRldDMoIHUgKSwgMSwgJ1Ugc2hvdWxkIGJlIGEgcm90YXRpb24gbWF0cml4IHdpdGggdGhlIGN1cnJlbnQgY3VzdG9tcycgKTtcbiAgYXBwcm94RXF1YWwoIGFzc2VydCwgTWF0cml4T3BzMy5kZXQzKCB2ICksIDEsICdWIHNob3VsZCBiZSBhIHJvdGF0aW9uIG1hdHJpeCB3aXRoIHRoZSBjdXJyZW50IGN1c3RvbXMnICk7XG59ICk7Il0sIm5hbWVzIjpbIk1hdHJpeE9wczMiLCJRVW5pdCIsIm1vZHVsZSIsImFwcHJveEVxdWFsIiwiYXNzZXJ0IiwiYSIsImIiLCJtc2ciLCJvayIsIk1hdGgiLCJhYnMiLCJhcHByb3hFcXVhbEFycmF5IiwiYXJyIiwiYmFyciIsImkiLCJsZW5ndGgiLCJ0ZXN0IiwiQXJyYXkiLCJjIiwibXVsdDMiLCJtdWx0M0xlZnRUcmFuc3Bvc2UiLCJtdWx0M1JpZ2h0VHJhbnNwb3NlIiwibXVsdDNCb3RoVHJhbnNwb3NlIiwibm9ybWFsIiwiYWNjZWwiLCJnaXZlbnMiLCJjb3MiLCJQSSIsInNpbiIsInNldDMiLCJzZXRHaXZlbnMzIiwicHJlTXVsdDNHaXZlbnMiLCJwb3N0TXVsdDNHaXZlbnMiLCJ1Iiwic2lnbWEiLCJ2Iiwic3ZkMyIsImRldDMiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELE9BQU9BLGdCQUFnQixrQkFBa0I7QUFFekNDLE1BQU1DLE1BQU0sQ0FBRTtBQUVkLFNBQVNDLFlBQWFDLE1BQU0sRUFBRUMsQ0FBQyxFQUFFQyxDQUFDLEVBQUVDLEdBQUc7SUFDckNILE9BQU9JLEVBQUUsQ0FBRUMsS0FBS0MsR0FBRyxDQUFFTCxJQUFJQyxLQUFNLFFBQVFDO0FBQ3pDO0FBRUEsU0FBU0ksaUJBQWtCUCxNQUFNLEVBQUVRLEdBQUcsRUFBRUMsSUFBSSxFQUFFTixHQUFHO0lBQy9DLElBQU0sSUFBSU8sSUFBSSxHQUFHQSxJQUFJRixJQUFJRyxNQUFNLEVBQUVELElBQU07UUFDckNYLFlBQWFDLFFBQVFRLEdBQUcsQ0FBRUUsRUFBRyxFQUFFRCxJQUFJLENBQUVDLEVBQUcsRUFB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