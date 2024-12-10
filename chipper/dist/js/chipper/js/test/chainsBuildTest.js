// Copyright 2017-2024, University of Colorado Boulder
/**
 * Unit tests, run with `qunit` at the *top-level* of chipper. May need `npm install -g qunit` beforehand, if it hasn't been run yet.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
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
import execute from '../../../perennial-alias/js/common/execute.js';
import gruntCommand from '../../../perennial-alias/js/common/gruntCommand.js';
import grunt from '../../../perennial-alias/js/npm-dependencies/grunt.js';
import qunit from '../../../perennial-alias/js/npm-dependencies/qunit.js';
qunit.module('Chains building');
function assertFileExistence(assert, filename) {
    assert.ok(grunt.file.exists(filename), filename);
}
function assertChainsExistence(assert, brand, options) {
    const { allHTML = false, debugHTML = false, locales = [
        'en'
    ] } = options || {};
    if (brand === 'phet') {
        if (locales.includes('en')) {
            assertFileExistence(assert, '../chains/build/phet/chains_en_iframe_phet.html');
        }
        for (const locale of locales){
            assertFileExistence(assert, `../chains/build/phet/chains_${locale}_phet.html`);
        }
        assertFileExistence(assert, '../chains/build/phet/chains-128.png');
        assertFileExistence(assert, '../chains/build/phet/chains-600.png');
        assertFileExistence(assert, '../chains/build/phet/chains-twitter-card.png');
        assertFileExistence(assert, '../chains/build/phet/dependencies.json');
        allHTML && assertFileExistence(assert, '../chains/build/phet/chains_all_phet.html');
        debugHTML && assertFileExistence(assert, '../chains/build/phet/chains_all_phet_debug.html');
    }
    if (brand === 'phet-io') {
        assertFileExistence(assert, '../chains/build/phet-io/chains_all_phet-io.html');
        assertFileExistence(assert, '../chains/build/phet-io/chains-128.png');
        assertFileExistence(assert, '../chains/build/phet-io/chains-600.png');
        assertFileExistence(assert, '../chains/build/phet-io/contrib');
        assertFileExistence(assert, '../chains/build/phet-io/doc');
        assertFileExistence(assert, '../chains/build/phet-io/lib');
        assertFileExistence(assert, '../chains/build/phet-io/wrappers');
        assertFileExistence(assert, '../chains/build/phet-io/dependencies.json');
        assertFileExistence(assert, '../chains/build/phet-io/chains_all_phet-io_debug.html'); // phet-io brand should always have debug html.
    }
}
qunit.test('Build (no args)', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.timeout(120000);
    yield execute(gruntCommand, [
        '--brands=phet,phet-io'
    ], '../chains');
    assertChainsExistence(assert, 'phet', {});
    assertChainsExistence(assert, 'phet-io', {});
}));
qunit.test('Build (with added HTMLs)', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.timeout(120000);
    yield execute(gruntCommand, [
        '--brands=phet,phet-io',
        '--debugHTML'
    ], '../chains');
    assertChainsExistence(assert, 'phet', {
        allHTML: true,
        debugHTML: true
    });
    assertChainsExistence(assert, 'phet-io', {
        allHTML: true,
        debugHTML: true
    });
}));
qunit.test('Build (no uglification)', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.timeout(120000);
    yield execute(gruntCommand, [
        '--brands=phet,phet-io',
        '--uglify=false'
    ], '../chains');
    assertChainsExistence(assert, 'phet', {});
    assertChainsExistence(assert, 'phet-io', {});
}));
qunit.test('Build (no mangling)', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.timeout(120000);
    yield execute(gruntCommand, [
        '--brands=phet,phet-io',
        '--mangle=false'
    ], '../chains');
    assertChainsExistence(assert, 'phet', {});
    assertChainsExistence(assert, 'phet-io', {});
}));
qunit.test('Build (instrument)', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.timeout(120000);
    yield execute(gruntCommand, [
        '--brands=phet,phet-io',
        '--instrument',
        '--uglify=false'
    ], '../chains');
    assertChainsExistence(assert, 'phet', {});
    assertChainsExistence(assert, 'phet-io', {});
}));
qunit.test('Build (all locales)', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.timeout(120000);
    yield execute(gruntCommand, [
        '--brands=phet,phet-io',
        '--locales=*'
    ], '../chains');
    assertChainsExistence(assert, 'phet', {
        locales: [
            'en',
            'ar',
            'es',
            'zh_CN'
        ]
    });
    assertChainsExistence(assert, 'phet-io', {});
}));
qunit.test('Build (es,zh_CN locales)', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.timeout(120000);
    yield execute(gruntCommand, [
        '--brands=phet,phet-io',
        '--locales=es,zh_CN'
    ], '../chains');
    assertChainsExistence(assert, 'phet', {
        locales: [
            'es',
            'zh_CN'
        ]
    });
    assertChainsExistence(assert, 'phet-io', {});
}));
qunit.test('Build (phet brand only)', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.timeout(120000);
    yield execute(gruntCommand, [
        '--brands=phet'
    ], '../chains');
    assertChainsExistence(assert, 'phet', {});
}));
qunit.test('Build (phet-io brand only)', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.timeout(120000);
    yield execute(gruntCommand, [
        '--brands=phet-io'
    ], '../chains');
    assertChainsExistence(assert, 'phet-io', {});
}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL3Rlc3QvY2hhaW5zQnVpbGRUZXN0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFVuaXQgdGVzdHMsIHJ1biB3aXRoIGBxdW5pdGAgYXQgdGhlICp0b3AtbGV2ZWwqIG9mIGNoaXBwZXIuIE1heSBuZWVkIGBucG0gaW5zdGFsbCAtZyBxdW5pdGAgYmVmb3JlaGFuZCwgaWYgaXQgaGFzbid0IGJlZW4gcnVuIHlldC5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IGV4ZWN1dGUgZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2NvbW1vbi9leGVjdXRlLmpzJztcbmltcG9ydCBncnVudENvbW1hbmQgZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2NvbW1vbi9ncnVudENvbW1hbmQuanMnO1xuaW1wb3J0IGdydW50IGZyb20gJy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ucG0tZGVwZW5kZW5jaWVzL2dydW50LmpzJztcbmltcG9ydCBxdW5pdCBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvbnBtLWRlcGVuZGVuY2llcy9xdW5pdC5qcyc7XG5cbnF1bml0Lm1vZHVsZSggJ0NoYWlucyBidWlsZGluZycgKTtcblxuZnVuY3Rpb24gYXNzZXJ0RmlsZUV4aXN0ZW5jZSggYXNzZXJ0OiBBc3NlcnQsIGZpbGVuYW1lOiBzdHJpbmcgKTogdm9pZCB7XG4gIGFzc2VydC5vayggZ3J1bnQuZmlsZS5leGlzdHMoIGZpbGVuYW1lICksIGZpbGVuYW1lICk7XG59XG5cbnR5cGUgQXNzZXJ0Q2hhaW5zRXhpc3RlbmNlT3B0aW9ucyA9IHtcbiAgYWxsSFRNTDogYm9vbGVhbjtcbiAgZGVidWdIVE1MOiBib29sZWFuO1xuICBsb2NhbGVzOiBzdHJpbmdbXTtcbn07XG5cbmZ1bmN0aW9uIGFzc2VydENoYWluc0V4aXN0ZW5jZSggYXNzZXJ0OiBBc3NlcnQsIGJyYW5kOiBzdHJpbmcsIG9wdGlvbnM6IFBhcnRpYWw8QXNzZXJ0Q2hhaW5zRXhpc3RlbmNlT3B0aW9ucz4gKTogdm9pZCB7XG4gIGNvbnN0IHtcbiAgICBhbGxIVE1MID0gZmFsc2UsXG4gICAgZGVidWdIVE1MID0gZmFsc2UsXG4gICAgbG9jYWxlcyA9IFsgJ2VuJyBdXG4gIH0gPSBvcHRpb25zIHx8IHt9O1xuXG4gIGlmICggYnJhbmQgPT09ICdwaGV0JyApIHtcbiAgICBpZiAoIGxvY2FsZXMuaW5jbHVkZXMoICdlbicgKSApIHtcbiAgICAgIGFzc2VydEZpbGVFeGlzdGVuY2UoIGFzc2VydCwgJy4uL2NoYWlucy9idWlsZC9waGV0L2NoYWluc19lbl9pZnJhbWVfcGhldC5odG1sJyApO1xuICAgIH1cbiAgICBmb3IgKCBjb25zdCBsb2NhbGUgb2YgbG9jYWxlcyApIHtcbiAgICAgIGFzc2VydEZpbGVFeGlzdGVuY2UoIGFzc2VydCwgYC4uL2NoYWlucy9idWlsZC9waGV0L2NoYWluc18ke2xvY2FsZX1fcGhldC5odG1sYCApO1xuICAgIH1cbiAgICBhc3NlcnRGaWxlRXhpc3RlbmNlKCBhc3NlcnQsICcuLi9jaGFpbnMvYnVpbGQvcGhldC9jaGFpbnMtMTI4LnBuZycgKTtcbiAgICBhc3NlcnRGaWxlRXhpc3RlbmNlKCBhc3NlcnQsICcuLi9jaGFpbnMvYnVpbGQvcGhldC9jaGFpbnMtNjAwLnBuZycgKTtcbiAgICBhc3NlcnRGaWxlRXhpc3RlbmNlKCBhc3NlcnQsICcuLi9jaGFpbnMvYnVpbGQvcGhldC9jaGFpbnMtdHdpdHRlci1jYXJkLnBuZycgKTtcbiAgICBhc3NlcnRGaWxlRXhpc3RlbmNlKCBhc3NlcnQsICcuLi9jaGFpbnMvYnVpbGQvcGhldC9kZXBlbmRlbmNpZXMuanNvbicgKTtcbiAgICBhbGxIVE1MICYmIGFzc2VydEZpbGVFeGlzdGVuY2UoIGFzc2VydCwgJy4uL2NoYWlucy9idWlsZC9waGV0L2NoYWluc19hbGxfcGhldC5odG1sJyApO1xuICAgIGRlYnVnSFRNTCAmJiBhc3NlcnRGaWxlRXhpc3RlbmNlKCBhc3NlcnQsICcuLi9jaGFpbnMvYnVpbGQvcGhldC9jaGFpbnNfYWxsX3BoZXRfZGVidWcuaHRtbCcgKTtcbiAgfVxuXG4gIGlmICggYnJhbmQgPT09ICdwaGV0LWlvJyApIHtcbiAgICBhc3NlcnRGaWxlRXhpc3RlbmNlKCBhc3NlcnQsICcuLi9jaGFpbnMvYnVpbGQvcGhldC1pby9jaGFpbnNfYWxsX3BoZXQtaW8uaHRtbCcgKTtcbiAgICBhc3NlcnRGaWxlRXhpc3RlbmNlKCBhc3NlcnQsICcuLi9jaGFpbnMvYnVpbGQvcGhldC1pby9jaGFpbnMtMTI4LnBuZycgKTtcbiAgICBhc3NlcnRGaWxlRXhpc3RlbmNlKCBhc3NlcnQsICcuLi9jaGFpbnMvYnVpbGQvcGhldC1pby9jaGFpbnMtNjAwLnBuZycgKTtcbiAgICBhc3NlcnRGaWxlRXhpc3RlbmNlKCBhc3NlcnQsICcuLi9jaGFpbnMvYnVpbGQvcGhldC1pby9jb250cmliJyApO1xuICAgIGFzc2VydEZpbGVFeGlzdGVuY2UoIGFzc2VydCwgJy4uL2NoYWlucy9idWlsZC9waGV0LWlvL2RvYycgKTtcbiAgICBhc3NlcnRGaWxlRXhpc3RlbmNlKCBhc3NlcnQsICcuLi9jaGFpbnMvYnVpbGQvcGhldC1pby9saWInICk7XG4gICAgYXNzZXJ0RmlsZUV4aXN0ZW5jZSggYXNzZXJ0LCAnLi4vY2hhaW5zL2J1aWxkL3BoZXQtaW8vd3JhcHBlcnMnICk7XG4gICAgYXNzZXJ0RmlsZUV4aXN0ZW5jZSggYXNzZXJ0LCAnLi4vY2hhaW5zL2J1aWxkL3BoZXQtaW8vZGVwZW5kZW5jaWVzLmpzb24nICk7XG4gICAgYXNzZXJ0RmlsZUV4aXN0ZW5jZSggYXNzZXJ0LCAnLi4vY2hhaW5zL2J1aWxkL3BoZXQtaW8vY2hhaW5zX2FsbF9waGV0LWlvX2RlYnVnLmh0bWwnICk7IC8vIHBoZXQtaW8gYnJhbmQgc2hvdWxkIGFsd2F5cyBoYXZlIGRlYnVnIGh0bWwuXG4gIH1cbn1cblxucXVuaXQudGVzdCggJ0J1aWxkIChubyBhcmdzKScsIGFzeW5jIGFzc2VydCA9PiB7XG4gIGFzc2VydC50aW1lb3V0KCAxMjAwMDAgKTtcbiAgYXdhaXQgZXhlY3V0ZSggZ3J1bnRDb21tYW5kLCBbICctLWJyYW5kcz1waGV0LHBoZXQtaW8nIF0sICcuLi9jaGFpbnMnICk7XG4gIGFzc2VydENoYWluc0V4aXN0ZW5jZSggYXNzZXJ0LCAncGhldCcsIHt9ICk7XG4gIGFzc2VydENoYWluc0V4aXN0ZW5jZSggYXNzZXJ0LCAncGhldC1pbycsIHt9ICk7XG59ICk7XG5cbnF1bml0LnRlc3QoICdCdWlsZCAod2l0aCBhZGRlZCBIVE1McyknLCBhc3luYyBhc3NlcnQgPT4ge1xuICBhc3NlcnQudGltZW91dCggMTIwMDAwICk7XG4gIGF3YWl0IGV4ZWN1dGUoIGdydW50Q29tbWFuZCwgWyAnLS1icmFuZHM9cGhldCxwaGV0LWlvJywgJy0tZGVidWdIVE1MJyBdLCAnLi4vY2hhaW5zJyApO1xuICBhc3NlcnRDaGFpbnNFeGlzdGVuY2UoIGFzc2VydCwgJ3BoZXQnLCB7IGFsbEhUTUw6IHRydWUsIGRlYnVnSFRNTDogdHJ1ZSB9ICk7XG4gIGFzc2VydENoYWluc0V4aXN0ZW5jZSggYXNzZXJ0LCAncGhldC1pbycsIHsgYWxsSFRNTDogdHJ1ZSwgZGVidWdIVE1MOiB0cnVlIH0gKTtcbn0gKTtcblxucXVuaXQudGVzdCggJ0J1aWxkIChubyB1Z2xpZmljYXRpb24pJywgYXN5bmMgYXNzZXJ0ID0+IHtcbiAgYXNzZXJ0LnRpbWVvdXQoIDEyMDAwMCApO1xuICBhd2FpdCBleGVjdXRlKCBncnVudENvbW1hbmQsIFsgJy0tYnJhbmRzPXBoZXQscGhldC1pbycsICctLXVnbGlmeT1mYWxzZScgXSwgJy4uL2NoYWlucycgKTtcbiAgYXNzZXJ0Q2hhaW5zRXhpc3RlbmNlKCBhc3NlcnQsICdwaGV0Jywge30gKTtcbiAgYXNzZXJ0Q2hhaW5zRXhpc3RlbmNlKCBhc3NlcnQsICdwaGV0LWlvJywge30gKTtcbn0gKTtcblxucXVuaXQudGVzdCggJ0J1aWxkIChubyBtYW5nbGluZyknLCBhc3luYyBhc3NlcnQgPT4ge1xuICBhc3NlcnQudGltZW91dCggMTIwMDAwICk7XG4gIGF3YWl0IGV4ZWN1dGUoIGdydW50Q29tbWFuZCwgWyAnLS1icmFuZHM9cGhldCxwaGV0LWlvJywgJy0tbWFuZ2xlPWZhbHNlJyBdLCAnLi4vY2hhaW5zJyApO1xuICBhc3NlcnRDaGFpbnNFeGlzdGVuY2UoIGFzc2VydCwgJ3BoZXQnLCB7fSApO1xuICBhc3NlcnRDaGFpbnNFeGlzdGVuY2UoIGFzc2VydCwgJ3BoZXQtaW8nLCB7fSApO1xufSApO1xuXG5xdW5pdC50ZXN0KCAnQnVpbGQgKGluc3RydW1lbnQpJywgYXN5bmMgYXNzZXJ0ID0+IHtcbiAgYXNzZXJ0LnRpbWVvdXQoIDEyMDAwMCApO1xuICBhd2FpdCBleGVjdXRlKCBncnVudENvbW1hbmQsIFsgJy0tYnJhbmRzPXBoZXQscGhldC1pbycsICctLWluc3RydW1lbnQnLCAnLS11Z2xpZnk9ZmFsc2UnIF0sICcuLi9jaGFpbnMnICk7XG4gIGFzc2VydENoYWluc0V4aXN0ZW5jZSggYXNzZXJ0LCAncGhldCcsIHt9ICk7XG4gIGFzc2VydENoYWluc0V4aXN0ZW5jZSggYXNzZXJ0LCAncGhldC1pbycsIHt9ICk7XG59ICk7XG5cbnF1bml0LnRlc3QoICdCdWlsZCAoYWxsIGxvY2FsZXMpJywgYXN5bmMgYXNzZXJ0ID0+IHtcbiAgYXNzZXJ0LnRpbWVvdXQoIDEyMDAwMCApO1xuICBhd2FpdCBleGVjdXRlKCBncnVudENvbW1hbmQsIFsgJy0tYnJhbmRzPXBoZXQscGhldC1pbycsICctLWxvY2FsZXM9KicgXSwgJy4uL2NoYWlucycgKTtcbiAgYXNzZXJ0Q2hhaW5zRXhpc3RlbmNlKCBhc3NlcnQsICdwaGV0JywgeyBsb2NhbGVzOiBbICdlbicsICdhcicsICdlcycsICd6aF9DTicgXSB9ICk7XG4gIGFzc2VydENoYWluc0V4aXN0ZW5jZSggYXNzZXJ0LCAncGhldC1pbycsIHt9ICk7XG59ICk7XG5cbnF1bml0LnRlc3QoICdCdWlsZCAoZXMsemhfQ04gbG9jYWxlcyknLCBhc3luYyBhc3NlcnQgPT4ge1xuICBhc3NlcnQudGltZW91dCggMTIwMDAwICk7XG4gIGF3YWl0IGV4ZWN1dGUoIGdydW50Q29tbWFuZCwgWyAnLS1icmFuZHM9cGhldCxwaGV0LWlvJywgJy0tbG9jYWxlcz1lcyx6aF9DTicgXSwgJy4uL2NoYWlucycgKTtcbiAgYXNzZXJ0Q2hhaW5zRXhpc3RlbmNlKCBhc3NlcnQsICdwaGV0JywgeyBsb2NhbGVzOiBbICdlcycsICd6aF9DTicgXSB9ICk7XG4gIGFzc2VydENoYWluc0V4aXN0ZW5jZSggYXNzZXJ0LCAncGhldC1pbycsIHt9ICk7XG59ICk7XG5cbnF1bml0LnRlc3QoICdCdWlsZCAocGhldCBicmFuZCBvbmx5KScsIGFzeW5jIGFzc2VydCA9PiB7XG4gIGFzc2VydC50aW1lb3V0KCAxMjAwMDAgKTtcbiAgYXdhaXQgZXhlY3V0ZSggZ3J1bnRDb21tYW5kLCBbICctLWJyYW5kcz1waGV0JyBdLCAnLi4vY2hhaW5zJyApO1xuICBhc3NlcnRDaGFpbnNFeGlzdGVuY2UoIGFzc2VydCwgJ3BoZXQnLCB7fSApO1xufSApO1xuXG5xdW5pdC50ZXN0KCAnQnVpbGQgKHBoZXQtaW8gYnJhbmQgb25seSknLCBhc3luYyBhc3NlcnQgPT4ge1xuICBhc3NlcnQudGltZW91dCggMTIwMDAwICk7XG4gIGF3YWl0IGV4ZWN1dGUoIGdydW50Q29tbWFuZCwgWyAnLS1icmFuZHM9cGhldC1pbycgXSwgJy4uL2NoYWlucycgKTtcbiAgYXNzZXJ0Q2hhaW5zRXhpc3RlbmNlKCBhc3NlcnQsICdwaGV0LWlvJywge30gKTtcbn0gKTsiXSwibmFtZXMiOlsiZXhlY3V0ZSIsImdydW50Q29tbWFuZCIsImdydW50IiwicXVuaXQiLCJtb2R1bGUiLCJhc3NlcnRGaWxlRXhpc3RlbmNlIiwiYXNzZXJ0IiwiZmlsZW5hbWUiLCJvayIsImZpbGUiLCJleGlzdHMiLCJhc3NlcnRDaGFpbnNFeGlzdGVuY2UiLCJicmFuZCIsIm9wdGlvbnMiLCJhbGxIVE1MIiwiZGVidWdIVE1MIiwibG9jYWxlcyIsImluY2x1ZGVzIiwibG9jYWxlIiwidGVzdCIsInRpbWVvdXQiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE9BQU9BLGFBQWEsZ0RBQWdEO0FBQ3BFLE9BQU9DLGtCQUFrQixxREFBcUQ7QUFDOUUsT0FBT0MsV0FBVyx3REFBd0Q7QUFDMUUsT0FBT0MsV0FBVyx3REFBd0Q7QUFFMUVBLE1BQU1DLE1BQU0sQ0FBRTtBQUVkLFNBQVNDLG9CQUFxQkMsTUFBYyxFQUFFQyxRQUFnQjtJQUM1REQsT0FBT0UsRUFBRSxDQUFFTixNQUFNTyxJQUFJLENBQUNDLE1BQU0sQ0FBRUgsV0FBWUE7QUFDNUM7QUFRQSxTQUFTSSxzQkFBdUJMLE1BQWMsRUFBRU0sS0FBYSxFQUFFQyxPQUE4QztJQUMzRyxNQUFNLEVBQ0pDLFVBQVUsS0FBSyxFQUNmQyxZQUFZLEtBQUssRUFDakJDLFVBQVU7UUFBRTtLQUFNLEVBQ25CLEdBQUdILFdBQVcsQ0FBQztJQUVoQixJQUFLRCxVQUFVLFFBQVM7UUFDdEIsSUFBS0ksUUFBUUMsUUFBUSxDQUFFLE9BQVM7WUFDOUJaLG9CQUFxQkMsUUFBUTtRQUMvQjtRQUNBLEtBQU0sTUFBTVksVUFBVUYsUUFBVTtZQUM5Qlgsb0JBQXFCQyxRQUFRLENBQUMsNEJBQTRCLEVBQUVZLE9BQU8sVUFBVSxDQUFDO1FBQ2hGO1FBQ0FiLG9CQUFxQkMsUUFBUTtRQUM3QkQsb0JBQXFCQyxRQUFRO1FBQzdCRCxvQkFBcUJDLFFBQVE7UUFDN0JELG9CQUFxQkMsUUFBUTtRQUM3QlEsV0FBV1Qsb0JBQXFCQyxRQUFRO1FBQ3hDUyxhQUFhVixvQkFBcUJDLFFBQVE7SUFDNUM7SUFFQSxJQUFLTSxVQUFVLFdBQVk7UUFD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