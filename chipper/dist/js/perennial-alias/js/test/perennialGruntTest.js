// Copyright 2017, University of Colorado Boulder
/**
 * Unit tests, run with `npm run test-long` at the top-level of perennial.
 * NOTE! This task will change shas in many repos. Do not run in parallel and do not run outside of main.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Michael Kauzmann (PhET Interactive Simulations)
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
const execute = require('../common/execute').default;
const getBranches = require('../common/getBranches');
const gruntCommand = require('../common/gruntCommand');
const qunit = require('qunit');
qunit.module('Perennial grunt tasks');
function getLatestBranch(repo) {
    return _getLatestBranch.apply(this, arguments);
}
function _getLatestBranch() {
    _getLatestBranch = _async_to_generator(function*(repo) {
        let currentMajor = 0;
        let currentMinor = 0;
        (yield getBranches(repo)).filter((branch)=>/^\d+\.\d+$/.test(branch)).forEach((branch)=>{
            const [major, minor] = branch.split('.').map((str)=>Number(str));
            if (major > currentMajor || major === currentMajor && minor > currentMinor) {
                currentMajor = major;
                currentMinor = minor;
            }
        });
        return {
            major: currentMajor,
            minor: currentMinor,
            toString () {
                return `${this.major}.${this.minor}`;
            }
        };
    });
    return _getLatestBranch.apply(this, arguments);
}
function getLikelyNextBranch(repo, incrementMajor, incrementMinor) {
    return _getLikelyNextBranch.apply(this, arguments);
}
function _getLikelyNextBranch() {
    _getLikelyNextBranch = _async_to_generator(function*(repo, incrementMajor, incrementMinor) {
        const latest = yield getLatestBranch(repo);
        incrementMajor && latest.major++;
        incrementMinor && latest.minor++;
        return latest.toString();
    });
    return _getLikelyNextBranch.apply(this, arguments);
}
qunit.test('NPM update', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.timeout(120000);
    yield execute(gruntCommand, [
        'npm-update',
        '--repo=bumper'
    ], '.');
    assert.expect(0);
}));
qunit.test('Bumper one-off (random)', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.timeout(3000000);
    const branch = `oneoff${Math.random().toString(36).substring(2)}`;
    // Create a random one-off branch
    yield execute(gruntCommand, [
        'create-one-off',
        '--repo=bumper',
        `--branch=${branch}`
    ], '.');
    yield execute(gruntCommand, [
        'one-off',
        '--repo=bumper',
        `--branch=${branch}`,
        '--brands=phet,phet-io',
        '--noninteractive'
    ], '.');
    yield execute(gruntCommand, [
        'checkout-main',
        '--repo=bumper'
    ], '.');
    assert.expect(0);
}));
qunit.test('Bumper dev phet,phet-io', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.timeout(600000);
    yield execute(gruntCommand, [
        'dev',
        '--repo=bumper',
        '--brands=phet,phet-io',
        '--noninteractive'
    ], '.');
    assert.expect(0);
}));
qunit.test('Bumper dev phet', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.timeout(600000);
    yield execute(gruntCommand, [
        'dev',
        '--repo=bumper',
        '--brands=phet',
        '--noninteractive'
    ], '.');
    assert.expect(0);
}));
qunit.test('Bumper dev phet-io', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.timeout(600000);
    yield execute(gruntCommand, [
        'dev',
        '--repo=bumper',
        '--brands=phet-io',
        '--noninteractive'
    ], '.');
    assert.expect(0);
}));
qunit.test('Major bump, RC/Production', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.timeout(3000000);
    const branch = yield getLikelyNextBranch('bumper', false, true);
    // We can't create the branch interactively (for maintenance releases), so we do so here
    yield execute(gruntCommand, [
        'create-release',
        '--repo=bumper',
        `--branch=${branch}`,
        '--brands=phet,phet-io'
    ], '.');
    // should be rc.1 and maintenance:0 (phet,phet-io)
    yield execute(gruntCommand, [
        'rc',
        '--repo=bumper',
        '--brands=phet,phet-io',
        `--branch=${branch}`,
        '--noninteractive'
    ], '.');
    yield execute(gruntCommand, [
        'production',
        '--repo=bumper',
        '--brands=phet,phet-io',
        `--branch=${branch}`,
        '--noninteractive'
    ], '.');
    // same thing, but maintenance:1 (phet brand only)
    yield execute(gruntCommand, [
        'rc',
        '--repo=bumper',
        '--brands=phet',
        `--branch=${branch}`,
        '--noninteractive'
    ], '.');
    yield execute(gruntCommand, [
        'production',
        '--repo=bumper',
        '--brands=phet',
        `--branch=${branch}`,
        '--noninteractive'
    ], '.');
    // same thing, but maintenance:1 (phet-io brand only)
    yield execute(gruntCommand, [
        'rc',
        '--repo=bumper',
        '--brands=phet-io',
        `--branch=${branch}`,
        '--noninteractive'
    ], '.');
    yield execute(gruntCommand, [
        'production',
        '--repo=bumper',
        '--brands=phet-io',
        `--branch=${branch}`,
        '--noninteractive'
    ], '.');
    assert.expect(0);
}));
qunit.test('Checkout target', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.timeout(120000);
    const latestBranch = yield getLatestBranch('bumper');
    yield execute(gruntCommand, [
        'checkout-target',
        '--repo=bumper',
        `--target=${latestBranch}`,
        '--skipNpmUpdate'
    ], '.');
    yield execute(gruntCommand, [
        'checkout-main',
        '--repo=bumper',
        '--skipNpmUpdate'
    ], '.');
    assert.expect(0);
}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy90ZXN0L3BlcmVubmlhbEdydW50VGVzdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVW5pdCB0ZXN0cywgcnVuIHdpdGggYG5wbSBydW4gdGVzdC1sb25nYCBhdCB0aGUgdG9wLWxldmVsIG9mIHBlcmVubmlhbC5cbiAqIE5PVEUhIFRoaXMgdGFzayB3aWxsIGNoYW5nZSBzaGFzIGluIG1hbnkgcmVwb3MuIERvIG5vdCBydW4gaW4gcGFyYWxsZWwgYW5kIGRvIG5vdCBydW4gb3V0c2lkZSBvZiBtYWluLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5cbmNvbnN0IGV4ZWN1dGUgPSByZXF1aXJlKCAnLi4vY29tbW9uL2V4ZWN1dGUnICkuZGVmYXVsdDtcbmNvbnN0IGdldEJyYW5jaGVzID0gcmVxdWlyZSggJy4uL2NvbW1vbi9nZXRCcmFuY2hlcycgKTtcbmNvbnN0IGdydW50Q29tbWFuZCA9IHJlcXVpcmUoICcuLi9jb21tb24vZ3J1bnRDb21tYW5kJyApO1xuY29uc3QgcXVuaXQgPSByZXF1aXJlKCAncXVuaXQnICk7XG5cbnF1bml0Lm1vZHVsZSggJ1BlcmVubmlhbCBncnVudCB0YXNrcycgKTtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0TGF0ZXN0QnJhbmNoKCByZXBvICkge1xuICBsZXQgY3VycmVudE1ham9yID0gMDtcbiAgbGV0IGN1cnJlbnRNaW5vciA9IDA7XG4gICggYXdhaXQgZ2V0QnJhbmNoZXMoIHJlcG8gKSApLmZpbHRlciggYnJhbmNoID0+IC9eXFxkK1xcLlxcZCskLy50ZXN0KCBicmFuY2ggKSApLmZvckVhY2goIGJyYW5jaCA9PiB7XG4gICAgY29uc3QgWyBtYWpvciwgbWlub3IgXSA9IGJyYW5jaC5zcGxpdCggJy4nICkubWFwKCBzdHIgPT4gTnVtYmVyKCBzdHIgKSApO1xuICAgIGlmICggbWFqb3IgPiBjdXJyZW50TWFqb3IgfHwgKCBtYWpvciA9PT0gY3VycmVudE1ham9yICYmIG1pbm9yID4gY3VycmVudE1pbm9yICkgKSB7XG4gICAgICBjdXJyZW50TWFqb3IgPSBtYWpvcjtcbiAgICAgIGN1cnJlbnRNaW5vciA9IG1pbm9yO1xuICAgIH1cbiAgfSApO1xuICByZXR1cm4ge1xuICAgIG1ham9yOiBjdXJyZW50TWFqb3IsXG4gICAgbWlub3I6IGN1cnJlbnRNaW5vcixcbiAgICB0b1N0cmluZygpIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLm1ham9yfS4ke3RoaXMubWlub3J9YDtcbiAgICB9XG4gIH07XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldExpa2VseU5leHRCcmFuY2goIHJlcG8sIGluY3JlbWVudE1ham9yLCBpbmNyZW1lbnRNaW5vciApIHtcbiAgY29uc3QgbGF0ZXN0ID0gYXdhaXQgZ2V0TGF0ZXN0QnJhbmNoKCByZXBvICk7XG4gIGluY3JlbWVudE1ham9yICYmIGxhdGVzdC5tYWpvcisrO1xuICBpbmNyZW1lbnRNaW5vciAmJiBsYXRlc3QubWlub3IrKztcbiAgcmV0dXJuIGxhdGVzdC50b1N0cmluZygpO1xufVxuXG5xdW5pdC50ZXN0KCAnTlBNIHVwZGF0ZScsIGFzeW5jIGFzc2VydCA9PiB7XG4gIGFzc2VydC50aW1lb3V0KCAxMjAwMDAgKTtcbiAgYXdhaXQgZXhlY3V0ZSggZ3J1bnRDb21tYW5kLCBbICducG0tdXBkYXRlJywgJy0tcmVwbz1idW1wZXInIF0sICcuJyApO1xuICBhc3NlcnQuZXhwZWN0KCAwICk7XG59ICk7XG5cbnF1bml0LnRlc3QoICdCdW1wZXIgb25lLW9mZiAocmFuZG9tKScsIGFzeW5jIGFzc2VydCA9PiB7XG4gIGFzc2VydC50aW1lb3V0KCAzMDAwMDAwICk7XG4gIGNvbnN0IGJyYW5jaCA9IGBvbmVvZmYke01hdGgucmFuZG9tKCkudG9TdHJpbmcoIDM2ICkuc3Vic3RyaW5nKCAyICl9YDtcblxuICAvLyBDcmVhdGUgYSByYW5kb20gb25lLW9mZiBicmFuY2hcbiAgYXdhaXQgZXhlY3V0ZSggZ3J1bnRDb21tYW5kLCBbICdjcmVhdGUtb25lLW9mZicsICctLXJlcG89YnVtcGVyJywgYC0tYnJhbmNoPSR7YnJhbmNofWAgXSwgJy4nICk7XG5cbiAgYXdhaXQgZXhlY3V0ZSggZ3J1bnRDb21tYW5kLCBbICdvbmUtb2ZmJywgJy0tcmVwbz1idW1wZXInLCBgLS1icmFuY2g9JHticmFuY2h9YCwgJy0tYnJhbmRzPXBoZXQscGhldC1pbycsICctLW5vbmludGVyYWN0aXZlJyBdLCAnLicgKTtcblxuICBhd2FpdCBleGVjdXRlKCBncnVudENvbW1hbmQsIFsgJ2NoZWNrb3V0LW1haW4nLCAnLS1yZXBvPWJ1bXBlcicgXSwgJy4nICk7XG4gIGFzc2VydC5leHBlY3QoIDAgKTtcbn0gKTtcblxucXVuaXQudGVzdCggJ0J1bXBlciBkZXYgcGhldCxwaGV0LWlvJywgYXN5bmMgYXNzZXJ0ID0+IHtcbiAgYXNzZXJ0LnRpbWVvdXQoIDYwMDAwMCApO1xuICBhd2FpdCBleGVjdXRlKCBncnVudENvbW1hbmQsIFsgJ2RldicsICctLXJlcG89YnVtcGVyJywgJy0tYnJhbmRzPXBoZXQscGhldC1pbycsICctLW5vbmludGVyYWN0aXZlJyBdLCAnLicgKTtcbiAgYXNzZXJ0LmV4cGVjdCggMCApO1xufSApO1xuXG5xdW5pdC50ZXN0KCAnQnVtcGVyIGRldiBwaGV0JywgYXN5bmMgYXNzZXJ0ID0+IHtcbiAgYXNzZXJ0LnRpbWVvdXQoIDYwMDAwMCApO1xuICBhd2FpdCBleGVjdXRlKCBncnVudENvbW1hbmQsIFsgJ2RldicsICctLXJlcG89YnVtcGVyJywgJy0tYnJhbmRzPXBoZXQnLCAnLS1ub25pbnRlcmFjdGl2ZScgXSwgJy4nICk7XG4gIGFzc2VydC5leHBlY3QoIDAgKTtcbn0gKTtcblxucXVuaXQudGVzdCggJ0J1bXBlciBkZXYgcGhldC1pbycsIGFzeW5jIGFzc2VydCA9PiB7XG4gIGFzc2VydC50aW1lb3V0KCA2MDAwMDAgKTtcbiAgYXdhaXQgZXhlY3V0ZSggZ3J1bnRDb21tYW5kLCBbICdkZXYnLCAnLS1yZXBvPWJ1bXBlcicsICctLWJyYW5kcz1waGV0LWlvJywgJy0tbm9uaW50ZXJhY3RpdmUnIF0sICcuJyApO1xuICBhc3NlcnQuZXhwZWN0KCAwICk7XG59ICk7XG5cbnF1bml0LnRlc3QoICdNYWpvciBidW1wLCBSQy9Qcm9kdWN0aW9uJywgYXN5bmMgYXNzZXJ0ID0+IHtcbiAgYXNzZXJ0LnRpbWVvdXQoIDMwMDAwMDAgKTtcbiAgY29uc3QgYnJhbmNoID0gYXdhaXQgZ2V0TGlrZWx5TmV4dEJyYW5jaCggJ2J1bXBlcicsIGZhbHNlLCB0cnVlICk7XG5cbiAgLy8gV2UgY2FuJ3QgY3JlYXRlIHRoZSBicmFuY2ggaW50ZXJhY3RpdmVseSAoZm9yIG1haW50ZW5hbmNlIHJlbGVhc2VzKSwgc28gd2UgZG8gc28gaGVyZVxuICBhd2FpdCBleGVjdXRlKCBncnVudENvbW1hbmQsIFsgJ2NyZWF0ZS1yZWxlYXNlJywgJy0tcmVwbz1idW1wZXInLCBgLS1icmFuY2g9JHticmFuY2h9YCwgJy0tYnJhbmRzPXBoZXQscGhldC1pbycgXSwgJy4nICk7XG5cbiAgLy8gc2hvdWxkIGJlIHJjLjEgYW5kIG1haW50ZW5hbmNlOjAgKHBoZXQscGhldC1pbylcbiAgYXdhaXQgZXhlY3V0ZSggZ3J1bnRDb21tYW5kLCBbICdyYycsICctLXJlcG89YnVtcGVyJywgJy0tYnJhbmRzPXBoZXQscGhldC1pbycsIGAtLWJyYW5jaD0ke2JyYW5jaH1gLCAnLS1ub25pbnRlcmFjdGl2ZScgXSwgJy4nICk7XG4gIGF3YWl0IGV4ZWN1dGUoIGdydW50Q29tbWFuZCwgWyAncHJvZHVjdGlvbicsICctLXJlcG89YnVtcGVyJywgJy0tYnJhbmRzPXBoZXQscGhldC1pbycsIGAtLWJyYW5jaD0ke2JyYW5jaH1gLCAnLS1ub25pbnRlcmFjdGl2ZScgXSwgJy4nICk7XG5cbiAgLy8gc2FtZSB0aGluZywgYnV0IG1haW50ZW5hbmNlOjEgKHBoZXQgYnJhbmQgb25seSlcbiAgYXdhaXQgZXhlY3V0ZSggZ3J1bnRDb21tYW5kLCBbICdyYycsICctLXJlcG89YnVtcGVyJywgJy0tYnJhbmRzPXBoZXQnLCBgLS1icmFuY2g9JHticmFuY2h9YCwgJy0tbm9uaW50ZXJhY3RpdmUnIF0sICcuJyApO1xuICBhd2FpdCBleGVjdXRlKCBncnVudENvbW1hbmQsIFsgJ3Byb2R1Y3Rpb24nLCAnLS1yZXBvPWJ1bXBlcicsICctLWJyYW5kcz1waGV0JywgYC0tYnJhbmNoPSR7YnJhbmNofWAsICctLW5vbmludGVyYWN0aXZlJyBdLCAnLicgKTtcblxuICAvLyBzYW1lIHRoaW5nLCBidXQgbWFpbnRlbmFuY2U6MSAocGhldC1pbyBicmFuZCBvbmx5KVxuICBhd2FpdCBleGVjdXRlKCBncnVudENvbW1hbmQsIFsgJ3JjJywgJy0tcmVwbz1idW1wZXInLCAnLS1icmFuZHM9cGhldC1pbycsIGAtLWJyYW5jaD0ke2JyYW5jaH1gLCAnLS1ub25pbnRlcmFjdGl2ZScgXSwgJy4nICk7XG4gIGF3YWl0IGV4ZWN1dGUoIGdydW50Q29tbWFuZCwgWyAncHJvZHVjdGlvbicsICctLXJlcG89YnVtcGVyJywgJy0tYnJhbmRzPXBoZXQtaW8nLCBgLS1icmFuY2g9JHticmFuY2h9YCwgJy0tbm9uaW50ZXJhY3RpdmUnIF0sICcuJyApO1xuICBhc3NlcnQuZXhwZWN0KCAwICk7XG59ICk7XG5cbnF1bml0LnRlc3QoICdDaGVja291dCB0YXJnZXQnLCBhc3luYyBhc3NlcnQgPT4ge1xuICBhc3NlcnQudGltZW91dCggMTIwMDAwICk7XG4gIGNvbnN0IGxhdGVzdEJyYW5jaCA9IGF3YWl0IGdldExhdGVzdEJyYW5jaCggJ2J1bXBlcicgKTtcbiAgYXdhaXQgZXhlY3V0ZSggZ3J1bnRDb21tYW5kLCBbICdjaGVja291dC10YXJnZXQnLCAnLS1yZXBvPWJ1bXBlcicsIGAtLXRhcmdldD0ke2xhdGVzdEJyYW5jaH1gLCAnLS1za2lwTnBtVXBkYXRlJyBdLCAnLicgKTtcbiAgYXdhaXQgZXhlY3V0ZSggZ3J1bnRDb21tYW5kLCBbICdjaGVja291dC1tYWluJywgJy0tcmVwbz1idW1wZXInLCAnLS1za2lwTnBtVXBkYXRlJyBdLCAnLicgKTtcbiAgYXNzZXJ0LmV4cGVjdCggMCApO1xufSApOyJdLCJuYW1lcyI6WyJleGVjdXRlIiwicmVxdWlyZSIsImRlZmF1bHQiLCJnZXRCcmFuY2hlcyIsImdydW50Q29tbWFuZCIsInF1bml0IiwibW9kdWxlIiwiZ2V0TGF0ZXN0QnJhbmNoIiwicmVwbyIsImN1cnJlbnRNYWpvciIsImN1cnJlbnRNaW5vciIsImZpbHRlciIsImJyYW5jaCIsInRlc3QiLCJmb3JFYWNoIiwibWFqb3IiLCJtaW5vciIsInNwbGl0IiwibWFwIiwic3RyIiwiTnVtYmVyIiwidG9TdHJpbmciLCJnZXRMaWtlbHlOZXh0QnJhbmNoIiwiaW5jcmVtZW50TWFqb3IiLCJpbmNyZW1lbnRNaW5vciIsImxhdGVzdCIsImFzc2VydCIsInRpbWVvdXQiLCJleHBlY3QiLCJNYXRoIiwicmFuZG9tIiwic3Vic3RyaW5nIiwibGF0ZXN0QnJhbmNoIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7OztDQU1DOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdELE1BQU1BLFVBQVVDLFFBQVMscUJBQXNCQyxPQUFPO0FBQ3RELE1BQU1DLGNBQWNGLFFBQVM7QUFDN0IsTUFBTUcsZUFBZUgsUUFBUztBQUM5QixNQUFNSSxRQUFRSixRQUFTO0FBRXZCSSxNQUFNQyxNQUFNLENBQUU7U0FFQ0MsZ0JBQWlCQyxJQUFJO1dBQXJCRDs7U0FBQUE7SUFBQUEsbUJBQWYsb0JBQUEsVUFBZ0NDLElBQUk7UUFDbEMsSUFBSUMsZUFBZTtRQUNuQixJQUFJQyxlQUFlO1FBQ2pCLENBQUEsTUFBTVAsWUFBYUssS0FB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