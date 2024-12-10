// Copyright 2019-2024, University of Colorado Boulder
/**
 * QUnit tests for Utterance and UtteranceQueue that use AriaLiveAnnouncer as the Announcer.
 *
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
import stepTimer from '../../axon/js/stepTimer.js';
import AriaLiveAnnouncer from './AriaLiveAnnouncer.js';
import responseCollector from './responseCollector.js';
import ResponsePacket from './ResponsePacket.js';
import Utterance from './Utterance.js';
import UtteranceQueue from './UtteranceQueue.js';
import UtteranceQueueTestUtils from './UtteranceQueueTestUtils.js';
let sleepTiming = 0;
const ariaLiveAnnouncer = new AriaLiveAnnouncer({
    respectResponseCollectorProperties: true
});
const utteranceQueue = new UtteranceQueue(ariaLiveAnnouncer);
// helper es6 functions from  https://stackoverflow.com/questions/33289726/combination-of-async-function-await-settimeout/33292942
function timeout(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms)); // eslint-disable-line phet/bad-sim-text
}
let alerts = [];
let intervalID;
QUnit.module('Utterance', {
    before () {
        // timer step in seconds, stepped 60 times per second
        const timerInterval = 1 / 60;
        // step the timer, because utteranceQueue runs on timer
        let previousTime = Date.now(); // in ms
        intervalID = window.setInterval(()=>{
            // in ms
            const currentTime = Date.now();
            const elapsedTime = currentTime - previousTime;
            stepTimer.emit(elapsedTime / 1000); // step timer in seconds
            previousTime = currentTime;
        }, timerInterval * 1000);
        // whenever announcing, get a callback and populate the alerts array
        ariaLiveAnnouncer.announcementCompleteEmitter.addListener((utterance)=>{
            alerts.unshift(utterance['previousAlertText'] + '');
        });
        // slightly slower than the interval that the utteranceQueue will wait so we don't have a race condition
        sleepTiming = AriaLiveAnnouncer.ARIA_LIVE_DELAY * 1.5;
    },
    beforeEach () {
        return _async_to_generator(function*() {
            // clear the alerts before each new test
            alerts = [];
            utteranceQueue.clear();
            responseCollector.reset();
            // Apply some workarounds that will hopefully make the tests more consistent when running on CT,
            // see https://github.com/phetsims/utterance-queue/issues/115.
            yield UtteranceQueueTestUtils.beforeEachTimingWorkarounds();
            // A workaround for unit tests, we want to be able to test the queue without the 'announceImmediately' feature
            // (which is necessary for browser compatability).
            ariaLiveAnnouncer.hasSpoken = true;
            // wait for the Announcer to be ready to speak again
            yield timeout(sleepTiming);
        })();
    },
    after () {
        clearInterval(intervalID);
    }
});
QUnit.test('Basic Utterance testing', /*#__PURE__*/ _async_to_generator(function*(assert) {
    // for this test, we just want to verify that the alert makes it through to ariaLiveAnnouncer
    const alertContent = 'hi';
    const utterance = new Utterance({
        alert: alertContent,
        alertStableDelay: 0 // alert as fast as possible
    });
    utteranceQueue.addToBack(utterance);
    yield timeout(sleepTiming);
    assert.ok(alerts[0] === alertContent, 'first alert made it to ariaLiveAnnouncer');
    const otherAlert = 'alert';
    utterance.alert = otherAlert;
    utteranceQueue.addToBack(utterance);
    yield timeout(sleepTiming);
    assert.ok(alerts[0] === otherAlert, 'second alert made it to ariaLiveAnnouncer');
    utterance.reset();
    assert.ok(utterance['previousAlertText'] === null, 'previousAlertText reset');
}));
QUnit.test('alertStable and alertStableDelay tests', /*#__PURE__*/ _async_to_generator(function*(assert) {
    const highFrequencyUtterance = new Utterance({
        alert: 'Rapidly Changing',
        alertStableDelay: 0 // we want to hear the utterance every time it is added to the queue
    });
    const numAlerts = 4;
    // add the utterance to the back many times, by default they should collapse
    for(let i = 0; i < numAlerts; i++){
        utteranceQueue.addToBack(highFrequencyUtterance);
    }
    assert.ok(utteranceQueue['queue'].length === 1, 'utterances should collapse by default after addToBack');
    yield timeout(sleepTiming);
    // cleanup step
    assert.ok(utteranceQueue['queue'].length === 0, 'cleared queue');
    /////////////////////////////////////////
    alerts = [];
    const stableDelay = sleepTiming * 3.1; // slightly longer than 3x
    const myUtterance = new Utterance({
        alert: 'hi',
        alertStableDelay: stableDelay
    });
    for(let i = 0; i < 100; i++){
        utteranceQueue.addToBack(myUtterance);
    }
    assert.ok(utteranceQueue['queue'].length === 1, 'same Utterance should override in queue');
    yield timeout(sleepTiming);
    // The wrapper has the timing variables
    const utteranceWrapper = utteranceQueue['queue'][0];
    // It is a bit dependent on the system running as to if this sleep time will be too long to flush this one too.
    if (utteranceWrapper) {
        assert.ok(utteranceWrapper.stableTime >= utteranceWrapper.timeInQueue, 'utterance should be in queue for at least stableDelay');
        assert.ok(utteranceQueue['queue'].length === 1, 'Alert still in queue after waiting less than alertStableDelay but more than stepInterval.');
    }
    yield timeout(stableDelay);
    assert.ok(utteranceQueue['queue'].length === 0, 'Utterance alerted after alertStableDelay time passed');
    assert.ok(alerts.length === 1, 'utterance ended up in alerts list');
    assert.ok(alerts[0] === myUtterance.alert, 'utterance text matches that which is expected');
}));
// Don't test on CT, because we often get timing issues in headless mode
if (window.parent === window) {
    QUnit.test('alertMaximumDelay tests', /*#__PURE__*/ _async_to_generator(function*(assert) {
        const rapidlyChanging = 'Rapidly Changing';
        const highFrequencyUtterance = new Utterance({
            alert: rapidlyChanging,
            alertStableDelay: 200,
            alertMaximumDelay: 300
        });
        utteranceQueue.addToBack(highFrequencyUtterance);
        assert.ok(utteranceQueue['queue'].length === 1, 'sanity 1');
        yield timeout(100);
        assert.ok(utteranceQueue['queue'].length === 1, 'still has it, not stable, not max');
        utteranceQueue.addToBack(highFrequencyUtterance);
        assert.ok(utteranceQueue['queue'].length === 1, 'sanity 2');
        yield timeout(100);
        assert.ok(utteranceQueue['queue'].length === 1, 'still has it, not stable, not max, 2');
        utteranceQueue.addToBack(highFrequencyUtterance);
        assert.ok(utteranceQueue['queue'].length === 1, 'sanity 2');
        yield timeout(150);
        assert.ok(utteranceQueue['queue'].length === 0, 'not stable, but past max');
        assert.ok(alerts[0] === rapidlyChanging, 'it was announced');
    }));
}
QUnit.test('announceImmediately', /*#__PURE__*/ _async_to_generator(function*(assert) {
    const myUtteranceText = 'This is my utterance text';
    const myUtterance = new Utterance({
        alert: myUtteranceText
    });
    utteranceQueue.announceImmediately(myUtterance);
    assert.ok(utteranceQueue['queue'].length === 0, 'should not be added to the queue');
    assert.ok(alerts[0] === myUtteranceText, 'should be immediately alerted');
    utteranceQueue.addToBack(myUtterance);
    assert.ok(utteranceQueue['queue'].length === 1, 'one added to the queue');
    assert.ok(alerts.length === 1, 'still just one alert occurred');
    utteranceQueue.announceImmediately(myUtterance);
    // We expect myUtterance to still be in the queue because the announcer is not ready to announce yet.
    assert.ok(utteranceQueue['queue'].length === 1, 'announceImmediately removed duplicates, but myUtterance still in queue');
////////////////////
// NOTE: Commented out because this final test was not working well with a very laggy browser when testing on CT. It
// isn't too important anyways.
//
// // Give the utteranceQueue and announcer a moment to become ready to announce again to move the final utterance
// // through the queue.
// await timeout( sleepTiming + 100 );
//
// assert.ok( alerts.length === 2, 'myUtterance announced immediately when Announcer was ready' + JSON.stringify( alerts ) );
// assert.ok( alerts[ 0 ] === myUtteranceText, 'announceImmediately Utterance was last alert' );
}));
QUnit.test('ResponsePacket tests', /*#__PURE__*/ _async_to_generator(function*(assert) {
    responseCollector.nameResponsesEnabledProperty.value = true;
    responseCollector.objectResponsesEnabledProperty.value = true;
    responseCollector.contextResponsesEnabledProperty.value = true;
    responseCollector.hintResponsesEnabledProperty.value = true;
    const NAME = 'name';
    const OBJECT = 'object';
    const CONTEXT = 'context';
    const HINT = 'hint';
    const utterance = new Utterance({
        alertStableDelay: 0,
        alert: new ResponsePacket({
            nameResponse: NAME,
            objectResponse: OBJECT,
            contextResponse: CONTEXT,
            hintResponse: HINT
        })
    });
    utteranceQueue.addToBack(utterance);
    yield timeout(sleepTiming);
    assert.ok(alerts[0].includes(NAME), 'name expected');
    assert.ok(alerts[0].includes(OBJECT), 'object expected');
    assert.ok(alerts[0].includes(CONTEXT), 'context expected');
    assert.ok(alerts[0].includes(HINT), 'hint expected');
    responseCollector.nameResponsesEnabledProperty.value = false;
    utteranceQueue.addToBack(utterance);
    yield timeout(sleepTiming);
    assert.ok(!alerts[0].includes(NAME), 'name expected');
    assert.ok(alerts[0].includes(OBJECT), 'object expected');
    assert.ok(alerts[0].includes(CONTEXT), 'context expected');
    assert.ok(alerts[0].includes(HINT), 'hint expected');
    responseCollector.nameResponsesEnabledProperty.value = false;
    responseCollector.objectResponsesEnabledProperty.value = false;
    responseCollector.contextResponsesEnabledProperty.value = false;
    responseCollector.hintResponsesEnabledProperty.value = true; // need something in order to alert
    utteranceQueue.addToBack(utterance);
    yield timeout(sleepTiming);
    assert.ok(!alerts[0].includes(NAME), 'name not expected');
    assert.ok(!alerts[0].includes(OBJECT), 'object not expected');
    assert.ok(!alerts[0].includes(CONTEXT), 'context not expected');
    assert.ok(alerts[0] === HINT, 'hint expected');
}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9VdHRlcmFuY2VUZXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBRVW5pdCB0ZXN0cyBmb3IgVXR0ZXJhbmNlIGFuZCBVdHRlcmFuY2VRdWV1ZSB0aGF0IHVzZSBBcmlhTGl2ZUFubm91bmNlciBhcyB0aGUgQW5ub3VuY2VyLlxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgc3RlcFRpbWVyIGZyb20gJy4uLy4uL2F4b24vanMvc3RlcFRpbWVyLmpzJztcbmltcG9ydCBBcmlhTGl2ZUFubm91bmNlciBmcm9tICcuL0FyaWFMaXZlQW5ub3VuY2VyLmpzJztcbmltcG9ydCByZXNwb25zZUNvbGxlY3RvciBmcm9tICcuL3Jlc3BvbnNlQ29sbGVjdG9yLmpzJztcbmltcG9ydCBSZXNwb25zZVBhY2tldCBmcm9tICcuL1Jlc3BvbnNlUGFja2V0LmpzJztcbmltcG9ydCBVdHRlcmFuY2UgZnJvbSAnLi9VdHRlcmFuY2UuanMnO1xuaW1wb3J0IFV0dGVyYW5jZVF1ZXVlIGZyb20gJy4vVXR0ZXJhbmNlUXVldWUuanMnO1xuaW1wb3J0IFV0dGVyYW5jZVF1ZXVlVGVzdFV0aWxzIGZyb20gJy4vVXR0ZXJhbmNlUXVldWVUZXN0VXRpbHMuanMnO1xuXG5sZXQgc2xlZXBUaW1pbmcgPSAwO1xuXG5jb25zdCBhcmlhTGl2ZUFubm91bmNlciA9IG5ldyBBcmlhTGl2ZUFubm91bmNlciggeyByZXNwZWN0UmVzcG9uc2VDb2xsZWN0b3JQcm9wZXJ0aWVzOiB0cnVlIH0gKTtcbmNvbnN0IHV0dGVyYW5jZVF1ZXVlID0gbmV3IFV0dGVyYW5jZVF1ZXVlKCBhcmlhTGl2ZUFubm91bmNlciApO1xuXG4vLyBoZWxwZXIgZXM2IGZ1bmN0aW9ucyBmcm9tICBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zMzI4OTcyNi9jb21iaW5hdGlvbi1vZi1hc3luYy1mdW5jdGlvbi1hd2FpdC1zZXR0aW1lb3V0LzMzMjkyOTQyXG5mdW5jdGlvbiB0aW1lb3V0KCBtczogbnVtYmVyICk6IFByb21pc2U8dW5rbm93bj4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoIHJlc29sdmUgPT4gc2V0VGltZW91dCggcmVzb2x2ZSwgbXMgKSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvYmFkLXNpbS10ZXh0XG59XG5cbmxldCBhbGVydHM6IHN0cmluZ1tdID0gW107XG5cbmxldCBpbnRlcnZhbElEOiBudW1iZXI7XG5RVW5pdC5tb2R1bGUoICdVdHRlcmFuY2UnLCB7XG4gIGJlZm9yZSgpIHtcblxuICAgIC8vIHRpbWVyIHN0ZXAgaW4gc2Vjb25kcywgc3RlcHBlZCA2MCB0aW1lcyBwZXIgc2Vjb25kXG4gICAgY29uc3QgdGltZXJJbnRlcnZhbCA9IDEgLyA2MDtcblxuICAgIC8vIHN0ZXAgdGhlIHRpbWVyLCBiZWNhdXNlIHV0dGVyYW5jZVF1ZXVlIHJ1bnMgb24gdGltZXJcbiAgICBsZXQgcHJldmlvdXNUaW1lID0gRGF0ZS5ub3coKTsgLy8gaW4gbXNcblxuICAgIGludGVydmFsSUQgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoICgpID0+IHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L2JhZC1zaW0tdGV4dFxuXG4gICAgICAvLyBpbiBtc1xuICAgICAgY29uc3QgY3VycmVudFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgY29uc3QgZWxhcHNlZFRpbWUgPSBjdXJyZW50VGltZSAtIHByZXZpb3VzVGltZTtcblxuICAgICAgc3RlcFRpbWVyLmVtaXQoIGVsYXBzZWRUaW1lIC8gMTAwMCApOyAvLyBzdGVwIHRpbWVyIGluIHNlY29uZHNcblxuICAgICAgcHJldmlvdXNUaW1lID0gY3VycmVudFRpbWU7XG4gICAgfSwgdGltZXJJbnRlcnZhbCAqIDEwMDAgKTtcblxuICAgIC8vIHdoZW5ldmVyIGFubm91bmNpbmcsIGdldCBhIGNhbGxiYWNrIGFuZCBwb3B1bGF0ZSB0aGUgYWxlcnRzIGFycmF5XG4gICAgYXJpYUxpdmVBbm5vdW5jZXIuYW5ub3VuY2VtZW50Q29tcGxldGVFbWl0dGVyLmFkZExpc3RlbmVyKCB1dHRlcmFuY2UgPT4ge1xuICAgICAgYWxlcnRzLnVuc2hpZnQoIHV0dGVyYW5jZVsgJ3ByZXZpb3VzQWxlcnRUZXh0JyBdICsgJycgKTtcbiAgICB9ICk7XG5cbiAgICAvLyBzbGlnaHRseSBzbG93ZXIgdGhhbiB0aGUgaW50ZXJ2YWwgdGhhdCB0aGUgdXR0ZXJhbmNlUXVldWUgd2lsbCB3YWl0IHNvIHdlIGRvbid0IGhhdmUgYSByYWNlIGNvbmRpdGlvblxuICAgIHNsZWVwVGltaW5nID0gQXJpYUxpdmVBbm5vdW5jZXIuQVJJQV9MSVZFX0RFTEFZICogMS41O1xuICB9LFxuICBhc3luYyBiZWZvcmVFYWNoKCkge1xuXG4gICAgLy8gY2xlYXIgdGhlIGFsZXJ0cyBiZWZvcmUgZWFjaCBuZXcgdGVzdFxuICAgIGFsZXJ0cyA9IFtdO1xuICAgIHV0dGVyYW5jZVF1ZXVlLmNsZWFyKCk7XG4gICAgcmVzcG9uc2VDb2xsZWN0b3IucmVzZXQoKTtcblxuICAgIC8vIEFwcGx5IHNvbWUgd29ya2Fyb3VuZHMgdGhhdCB3aWxsIGhvcGVmdWxseSBtYWtlIHRoZSB0ZXN0cyBtb3JlIGNvbnNpc3RlbnQgd2hlbiBydW5uaW5nIG9uIENULFxuICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdXR0ZXJhbmNlLXF1ZXVlL2lzc3Vlcy8xMTUuXG4gICAgYXdhaXQgVXR0ZXJhbmNlUXVldWVUZXN0VXRpbHMuYmVmb3JlRWFjaFRpbWluZ1dvcmthcm91bmRzKCk7XG5cbiAgICAvLyBBIHdvcmthcm91bmQgZm9yIHVuaXQgdGVzdHMsIHdlIHdhbnQgdG8gYmUgYWJsZSB0byB0ZXN0IHRoZSBxdWV1ZSB3aXRob3V0IHRoZSAnYW5ub3VuY2VJbW1lZGlhdGVseScgZmVhdHVyZVxuICAgIC8vICh3aGljaCBpcyBuZWNlc3NhcnkgZm9yIGJyb3dzZXIgY29tcGF0YWJpbGl0eSkuXG4gICAgYXJpYUxpdmVBbm5vdW5jZXIuaGFzU3Bva2VuID0gdHJ1ZTtcblxuICAgIC8vIHdhaXQgZm9yIHRoZSBBbm5vdW5jZXIgdG8gYmUgcmVhZHkgdG8gc3BlYWsgYWdhaW5cbiAgICBhd2FpdCB0aW1lb3V0KCBzbGVlcFRpbWluZyApO1xuICB9LFxuICBhZnRlcigpIHtcbiAgICBjbGVhckludGVydmFsKCBpbnRlcnZhbElEISApO1xuICB9XG59ICk7XG5cblFVbml0LnRlc3QoICdCYXNpYyBVdHRlcmFuY2UgdGVzdGluZycsIGFzeW5jIGFzc2VydCA9PiB7XG5cbiAgLy8gZm9yIHRoaXMgdGVzdCwgd2UganVzdCB3YW50IHRvIHZlcmlmeSB0aGF0IHRoZSBhbGVydCBtYWtlcyBpdCB0aHJvdWdoIHRvIGFyaWFMaXZlQW5ub3VuY2VyXG4gIGNvbnN0IGFsZXJ0Q29udGVudCA9ICdoaSc7XG4gIGNvbnN0IHV0dGVyYW5jZSA9IG5ldyBVdHRlcmFuY2UoIHtcbiAgICBhbGVydDogYWxlcnRDb250ZW50LFxuICAgIGFsZXJ0U3RhYmxlRGVsYXk6IDAgLy8gYWxlcnQgYXMgZmFzdCBhcyBwb3NzaWJsZVxuICB9ICk7XG4gIHV0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggdXR0ZXJhbmNlICk7XG5cbiAgYXdhaXQgdGltZW91dCggc2xlZXBUaW1pbmcgKTtcbiAgYXNzZXJ0Lm9rKCBhbGVydHNbIDAgXSA9PT0gYWxlcnRDb250ZW50LCAnZmlyc3QgYWxlcnQgbWFkZSBpdCB0byBhcmlhTGl2ZUFubm91bmNlcicgKTtcblxuICBjb25zdCBvdGhlckFsZXJ0ID0gJ2FsZXJ0JztcbiAgdXR0ZXJhbmNlLmFsZXJ0ID0gb3RoZXJBbGVydDtcbiAgdXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCB1dHRlcmFuY2UgKTtcbiAgYXdhaXQgdGltZW91dCggc2xlZXBUaW1pbmcgKTtcbiAgYXNzZXJ0Lm9rKCBhbGVydHNbIDAgXSA9PT0gb3RoZXJBbGVydCwgJ3NlY29uZCBhbGVydCBtYWRlIGl0IHRvIGFyaWFMaXZlQW5ub3VuY2VyJyApO1xuXG4gIHV0dGVyYW5jZS5yZXNldCgpO1xuICBhc3NlcnQub2soIHV0dGVyYW5jZVsgJ3ByZXZpb3VzQWxlcnRUZXh0JyBdID09PSBudWxsLCAncHJldmlvdXNBbGVydFRleHQgcmVzZXQnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdhbGVydFN0YWJsZSBhbmQgYWxlcnRTdGFibGVEZWxheSB0ZXN0cycsIGFzeW5jIGFzc2VydCA9PiB7XG4gIGNvbnN0IGhpZ2hGcmVxdWVuY3lVdHRlcmFuY2UgPSBuZXcgVXR0ZXJhbmNlKCB7XG4gICAgYWxlcnQ6ICdSYXBpZGx5IENoYW5naW5nJyxcbiAgICBhbGVydFN0YWJsZURlbGF5OiAwIC8vIHdlIHdhbnQgdG8gaGVhciB0aGUgdXR0ZXJhbmNlIGV2ZXJ5IHRpbWUgaXQgaXMgYWRkZWQgdG8gdGhlIHF1ZXVlXG4gIH0gKTtcblxuICBjb25zdCBudW1BbGVydHMgPSA0O1xuXG4gIC8vIGFkZCB0aGUgdXR0ZXJhbmNlIHRvIHRoZSBiYWNrIG1hbnkgdGltZXMsIGJ5IGRlZmF1bHQgdGhleSBzaG91bGQgY29sbGFwc2VcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtQWxlcnRzOyBpKysgKSB7XG4gICAgdXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBoaWdoRnJlcXVlbmN5VXR0ZXJhbmNlICk7XG4gIH1cbiAgYXNzZXJ0Lm9rKCB1dHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdLmxlbmd0aCA9PT0gMSwgJ3V0dGVyYW5jZXMgc2hvdWxkIGNvbGxhcHNlIGJ5IGRlZmF1bHQgYWZ0ZXIgYWRkVG9CYWNrJyApO1xuXG4gIGF3YWl0IHRpbWVvdXQoIHNsZWVwVGltaW5nICk7XG5cbiAgLy8gY2xlYW51cCBzdGVwXG4gIGFzc2VydC5vayggdXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXS5sZW5ndGggPT09IDAsICdjbGVhcmVkIHF1ZXVlJyApO1xuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgYWxlcnRzID0gW107XG4gIGNvbnN0IHN0YWJsZURlbGF5ID0gc2xlZXBUaW1pbmcgKiAzLjE7IC8vIHNsaWdodGx5IGxvbmdlciB0aGFuIDN4XG4gIGNvbnN0IG15VXR0ZXJhbmNlID0gbmV3IFV0dGVyYW5jZSgge1xuICAgIGFsZXJ0OiAnaGknLFxuICAgIGFsZXJ0U3RhYmxlRGVsYXk6IHN0YWJsZURlbGF5XG4gIH0gKTtcblxuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCAxMDA7IGkrKyApIHtcbiAgICB1dHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIG15VXR0ZXJhbmNlICk7XG4gIH1cblxuICBhc3NlcnQub2soIHV0dGVyYW5jZVF1ZXVlWyAncXVldWUnIF0ubGVuZ3RoID09PSAxLCAnc2FtZSBVdHRlcmFuY2Ugc2hvdWxkIG92ZXJyaWRlIGluIHF1ZXVlJyApO1xuICBhd2FpdCB0aW1lb3V0KCBzbGVlcFRpbWluZyApO1xuXG4gIC8vIFRoZSB3cmFwcGVyIGhhcyB0aGUgdGltaW5nIHZhcmlhYmxlc1xuICBjb25zdCB1dHRlcmFuY2VXcmFwcGVyID0gdXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXVsgMCBdO1xuXG4gIC8vIEl0IGlzIGEgYml0IGRlcGVuZGVudCBvbiB0aGUgc3lzdGVtIHJ1bm5pbmcgYXMgdG8gaWYgdGhpcyBzbGVlcCB0aW1lIHdpbGwgYmUgdG9vIGxvbmcgdG8gZmx1c2ggdGhpcyBvbmUgdG9vLlxuICBpZiAoIHV0dGVyYW5jZVdyYXBwZXIgKSB7XG4gICAgYXNzZXJ0Lm9rKCB1dHRlcmFuY2VXcmFwcGVyLnN0YWJsZVRpbWUgPj0gdXR0ZXJhbmNlV3JhcHBlci50aW1lSW5RdWV1ZSwgJ3V0dGVyYW5jZSBzaG91bGQgYmUgaW4gcXVldWUgZm9yIGF0IGxlYXN0IHN0YWJsZURlbGF5JyApO1xuXG4gICAgYXNzZXJ0Lm9rKCB1dHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdLmxlbmd0aCA9PT0gMSwgJ0FsZXJ0IHN0aWxsIGluIHF1ZXVlIGFmdGVyIHdhaXRpbmcgbGVzcyB0aGFuIGFsZXJ0U3RhYmxlRGVsYXkgYnV0IG1vcmUgdGhhbiBzdGVwSW50ZXJ2YWwuJyApO1xuICB9XG4gIGF3YWl0IHRpbWVvdXQoIHN0YWJsZURlbGF5ICk7XG5cbiAgYXNzZXJ0Lm9rKCB1dHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdLmxlbmd0aCA9PT0gMCwgJ1V0dGVyYW5jZSBhbGVydGVkIGFmdGVyIGFsZXJ0U3RhYmxlRGVsYXkgdGltZSBwYXNzZWQnICk7XG4gIGFzc2VydC5vayggYWxlcnRzLmxlbmd0aCA9PT0gMSwgJ3V0dGVyYW5jZSBlbmRlZCB1cCBpbiBhbGVydHMgbGlzdCcgKTtcbiAgYXNzZXJ0Lm9rKCBhbGVydHNbIDAgXSA9PT0gbXlVdHRlcmFuY2UuYWxlcnQsICd1dHRlcmFuY2UgdGV4dCBtYXRjaGVzIHRoYXQgd2hpY2ggaXMgZXhwZWN0ZWQnICk7XG59ICk7XG5cbi8vIERvbid0IHRlc3Qgb24gQ1QsIGJlY2F1c2Ugd2Ugb2Z0ZW4gZ2V0IHRpbWluZyBpc3N1ZXMgaW4gaGVhZGxlc3MgbW9kZVxuaWYgKCB3aW5kb3cucGFyZW50ID09PSB3aW5kb3cgKSB7XG5cbiAgUVVuaXQudGVzdCggJ2FsZXJ0TWF4aW11bURlbGF5IHRlc3RzJywgYXN5bmMgYXNzZXJ0ID0+IHtcbiAgICBjb25zdCByYXBpZGx5Q2hhbmdpbmcgPSAnUmFwaWRseSBDaGFuZ2luZyc7XG4gICAgY29uc3QgaGlnaEZyZXF1ZW5jeVV0dGVyYW5jZSA9IG5ldyBVdHRlcmFuY2UoIHtcbiAgICAgIGFsZXJ0OiByYXBpZGx5Q2hhbmdpbmcsXG4gICAgICBhbGVydFN0YWJsZURlbGF5OiAyMDAsXG4gICAgICBhbGVydE1heGltdW1EZWxheTogMzAwXG4gICAgfSApO1xuXG4gICAgdXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBoaWdoRnJlcXVlbmN5VXR0ZXJhbmNlICk7XG4gICAgYXNzZXJ0Lm9rKCB1dHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdLmxlbmd0aCA9PT0gMSwgJ3Nhbml0eSAxJyApO1xuICAgIGF3YWl0IHRpbWVvdXQoIDEwMCApO1xuICAgIGFzc2VydC5vayggdXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXS5sZW5ndGggPT09IDEsICdzdGlsbCBoYXMgaXQsIG5vdCBzdGFibGUsIG5vdCBtYXgnICk7XG4gICAgdXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBoaWdoRnJlcXVlbmN5VXR0ZXJhbmNlICk7XG4gICAgYXNzZXJ0Lm9rKCB1dHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdLmxlbmd0aCA9PT0gMSwgJ3Nhbml0eSAyJyApO1xuICAgIGF3YWl0IHRpbWVvdXQoIDEwMCApO1xuICAgIGFzc2VydC5vayggdXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXS5sZW5ndGggPT09IDEsICdzdGlsbCBoYXMgaXQsIG5vdCBzdGFibGUsIG5vdCBtYXgsIDInICk7XG4gICAgdXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBoaWdoRnJlcXVlbmN5VXR0ZXJhbmNlICk7XG4gICAgYXNzZXJ0Lm9rKCB1dHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdLmxlbmd0aCA9PT0gMSwgJ3Nhbml0eSAyJyApO1xuICAgIGF3YWl0IHRpbWVvdXQoIDE1MCApO1xuICAgIGFzc2VydC5vayggdXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXS5sZW5ndGggPT09IDAsICdub3Qgc3RhYmxlLCBidXQgcGFzdCBtYXgnICk7XG4gICAgYXNzZXJ0Lm9rKCBhbGVydHNbIDAgXSA9PT0gcmFwaWRseUNoYW5naW5nLCAnaXQgd2FzIGFubm91bmNlZCcgKTtcbiAgfSApO1xufVxuXG5RVW5pdC50ZXN0KCAnYW5ub3VuY2VJbW1lZGlhdGVseScsIGFzeW5jIGFzc2VydCA9PiB7XG4gIGNvbnN0IG15VXR0ZXJhbmNlVGV4dCA9ICdUaGlzIGlzIG15IHV0dGVyYW5jZSB0ZXh0JztcbiAgY29uc3QgbXlVdHRlcmFuY2UgPSBuZXcgVXR0ZXJhbmNlKCB7IGFsZXJ0OiBteVV0dGVyYW5jZVRleHQgfSApO1xuXG4gIHV0dGVyYW5jZVF1ZXVlLmFubm91bmNlSW1tZWRpYXRlbHkoIG15VXR0ZXJhbmNlICk7XG4gIGFzc2VydC5vayggdXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXS5sZW5ndGggPT09IDAsICdzaG91bGQgbm90IGJlIGFkZGVkIHRvIHRoZSBxdWV1ZScgKTtcbiAgYXNzZXJ0Lm9rKCBhbGVydHNbIDAgXSA9PT0gbXlVdHRlcmFuY2VUZXh0LCAnc2hvdWxkIGJlIGltbWVkaWF0ZWx5IGFsZXJ0ZWQnICk7XG5cbiAgdXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBteVV0dGVyYW5jZSApO1xuICBhc3NlcnQub2soIHV0dGVyYW5jZVF1ZXVlWyAncXVldWUnIF0ubGVuZ3RoID09PSAxLCAnb25lIGFkZGVkIHRvIHRoZSBxdWV1ZScgKTtcbiAgYXNzZXJ0Lm9rKCBhbGVydHMubGVuZ3RoID09PSAxLCAnc3RpbGwganVzdCBvbmUgYWxlcnQgb2NjdXJyZWQnICk7XG4gIHV0dGVyYW5jZVF1ZXVlLmFubm91bmNlSW1tZWRpYXRlbHkoIG15VXR0ZXJhbmNlICk7XG5cbiAgLy8gV2UgZXhwZWN0IG15VXR0ZXJhbmNlIHRvIHN0aWxsIGJlIGluIHRoZSBxdWV1ZSBiZWNhdXNlIHRoZSBhbm5vdW5jZXIgaXMgbm90IHJlYWR5IHRvIGFubm91bmNlIHlldC5cbiAgYXNzZXJ0Lm9rKCB1dHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdLmxlbmd0aCA9PT0gMSwgJ2Fubm91bmNlSW1tZWRpYXRlbHkgcmVtb3ZlZCBkdXBsaWNhdGVzLCBidXQgbXlVdHRlcmFuY2Ugc3RpbGwgaW4gcXVldWUnICk7XG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gTk9URTogQ29tbWVudGVkIG91dCBiZWNhdXNlIHRoaXMgZmluYWwgdGVzdCB3YXMgbm90IHdvcmtpbmcgd2VsbCB3aXRoIGEgdmVyeSBsYWdneSBicm93c2VyIHdoZW4gdGVzdGluZyBvbiBDVC4gSXRcbiAgLy8gaXNuJ3QgdG9vIGltcG9ydGFudCBhbnl3YXlzLlxuICAvL1xuICAvLyAvLyBHaXZlIHRoZSB1dHRlcmFuY2VRdWV1ZSBhbmQgYW5ub3VuY2VyIGEgbW9tZW50IHRvIGJlY29tZSByZWFkeSB0byBhbm5vdW5jZSBhZ2FpbiB0byBtb3ZlIHRoZSBmaW5hbCB1dHRlcmFuY2VcbiAgLy8gLy8gdGhyb3VnaCB0aGUgcXVldWUuXG4gIC8vIGF3YWl0IHRpbWVvdXQoIHNsZWVwVGltaW5nICsgMTAwICk7XG4gIC8vXG4gIC8vIGFzc2VydC5vayggYWxlcnRzLmxlbmd0aCA9PT0gMiwgJ215VXR0ZXJhbmNlIGFubm91bmNlZCBpbW1lZGlhdGVseSB3aGVuIEFubm91bmNlciB3YXMgcmVhZHknICsgSlNPTi5zdHJpbmdpZnkoIGFsZXJ0cyApICk7XG4gIC8vIGFzc2VydC5vayggYWxlcnRzWyAwIF0gPT09IG15VXR0ZXJhbmNlVGV4dCwgJ2Fubm91bmNlSW1tZWRpYXRlbHkgVXR0ZXJhbmNlIHdhcyBsYXN0IGFsZXJ0JyApO1xufSApO1xuXG5cblFVbml0LnRlc3QoICdSZXNwb25zZVBhY2tldCB0ZXN0cycsIGFzeW5jIGFzc2VydCA9PiB7XG4gIHJlc3BvbnNlQ29sbGVjdG9yLm5hbWVSZXNwb25zZXNFbmFibGVkUHJvcGVydHkudmFsdWUgPSB0cnVlO1xuICByZXNwb25zZUNvbGxlY3Rvci5vYmplY3RSZXNwb25zZXNFbmFibGVkUHJvcGVydHkudmFsdWUgPSB0cnVlO1xuICByZXNwb25zZUNvbGxlY3Rvci5jb250ZXh0UmVzcG9uc2VzRW5hYmxlZFByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcbiAgcmVzcG9uc2VDb2xsZWN0b3IuaGludFJlc3BvbnNlc0VuYWJsZWRQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XG5cbiAgY29uc3QgTkFNRSA9ICduYW1lJztcbiAgY29uc3QgT0JKRUNUID0gJ29iamVjdCc7XG4gIGNvbnN0IENPTlRFWFQgPSAnY29udGV4dCc7XG4gIGNvbnN0IEhJTlQgPSAnaGludCc7XG4gIGNvbnN0IHV0dGVyYW5jZSA9IG5ldyBVdHRlcmFuY2UoIHtcbiAgICBhbGVydFN0YWJsZURlbGF5OiAwLFxuICAgIGFsZXJ0OiBuZXcgUmVzcG9uc2VQYWNrZXQoIHtcbiAgICAgIG5hbWVSZXNwb25zZTogTkFNRSxcbiAgICAgIG9iamVjdFJlc3BvbnNlOiBPQkpFQ1QsXG4gICAgICBjb250ZXh0UmVzcG9uc2U6IENPTlRFWFQsXG4gICAgICBoaW50UmVzcG9uc2U6IEhJTlRcbiAgICB9IClcbiAgfSApO1xuXG4gIHV0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggdXR0ZXJhbmNlICk7XG4gIGF3YWl0IHRpbWVvdXQoIHNsZWVwVGltaW5nICk7XG5cbiAgYXNzZXJ0Lm9rKCBhbGVydHNbIDAgXS5pbmNsdWRlcyggTkFNRSApLCAnbmFtZSBleHBlY3RlZCcgKTtcbiAgYXNzZXJ0Lm9rKCBhbGVydHNbIDAgXS5pbmNsdWRlcyggT0JKRUNUICksICdvYmplY3QgZXhwZWN0ZWQnICk7XG4gIGFzc2VydC5vayggYWxlcnRzWyAwIF0uaW5jbHVkZXMoIENPTlRFWFQgKSwgJ2NvbnRleHQgZXhwZWN0ZWQnICk7XG4gIGFzc2VydC5vayggYWxlcnRzWyAwIF0uaW5jbHVkZXMoIEhJTlQgKSwgJ2hpbnQgZXhwZWN0ZWQnICk7XG5cbiAgcmVzcG9uc2VDb2xsZWN0b3IubmFtZVJlc3BvbnNlc0VuYWJsZWRQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xuXG4gIHV0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggdXR0ZXJhbmNlICk7XG4gIGF3YWl0IHRpbWVvdXQoIHNsZWVwVGltaW5nICk7XG5cbiAgYXNzZXJ0Lm9rKCAhYWxlcnRzWyAwIF0uaW5jbHVkZXMoIE5BTUUgKSwgJ25hbWUgZXhwZWN0ZWQnICk7XG4gIGFzc2VydC5vayggYWxlcnRzWyAwIF0uaW5jbHVkZXMoIE9CSkVDVCApLCAnb2JqZWN0IGV4cGVjdGVkJyApO1xuICBhc3NlcnQub2soIGFsZXJ0c1sgMCBdLmluY2x1ZGVzKCBDT05URVhUICksICdjb250ZXh0IGV4cGVjdGVkJyApO1xuICBhc3NlcnQub2soIGFsZXJ0c1sgMCBdLmluY2x1ZGVzKCBISU5UICksICdoaW50IGV4cGVjdGVkJyApO1xuXG4gIHJlc3BvbnNlQ29sbGVjdG9yLm5hbWVSZXNwb25zZXNFbmFibGVkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcbiAgcmVzcG9uc2VDb2xsZWN0b3Iub2JqZWN0UmVzcG9uc2VzRW5hYmxlZFByb3BlcnR5LnZhbHVlID0gZmFsc2U7XG4gIHJlc3BvbnNlQ29sbGVjdG9yLmNvbnRleHRSZXNwb25zZXNFbmFibGVkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcbiAgcmVzcG9uc2VDb2xsZWN0b3IuaGludFJlc3BvbnNlc0VuYWJsZWRQcm9wZXJ0eS52YWx1ZSA9IHRydWU7IC8vIG5lZWQgc29tZXRoaW5nIGluIG9yZGVyIHRvIGFsZXJ0XG5cbiAgdXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCB1dHRlcmFuY2UgKTtcbiAgYXdhaXQgdGltZW91dCggc2xlZXBUaW1pbmcgKTtcblxuICBhc3NlcnQub2soICFhbGVydHNbIDAgXS5pbmNsdWRlcyggTkFNRSApLCAnbmFtZSBub3QgZXhwZWN0ZWQnICk7XG4gIGFzc2VydC5vayggIWFsZXJ0c1sgMCBdLmluY2x1ZGVzKCBPQkpFQ1QgKSwgJ29iamVjdCBub3QgZXhwZWN0ZWQnICk7XG4gIGFzc2VydC5vayggIWFsZXJ0c1sgMCBdLmluY2x1ZGVzKCBDT05URVhUICksICdjb250ZXh0IG5vdCBleHBlY3RlZCcgKTtcbiAgYXNzZXJ0Lm9rKCBhbGVydHNbIDAgXSA9PT0gSElOVCwgJ2hpbnQgZXhwZWN0ZWQnICk7XG59ICk7Il0sIm5hbWVzIjpbInN0ZXBUaW1lciIsIkFyaWFMaXZlQW5ub3VuY2VyIiwicmVzcG9uc2VDb2xsZWN0b3IiLCJSZXNwb25zZVBhY2tldCIsIlV0dGVyYW5jZSIsIlV0dGVyYW5jZVF1ZXVlIiwiVXR0ZXJhbmNlUXVldWVUZXN0VXRpbHMiLCJzbGVlcFRpbWluZyIsImFyaWFMaXZlQW5ub3VuY2VyIiwicmVzcGVjdFJlc3BvbnNlQ29sbGVjdG9yUHJvcGVydGllcyIsInV0dGVyYW5jZVF1ZXVlIiwidGltZW91dCIsIm1zIiwiUHJvbWlzZSIsInJlc29sdmUiLCJzZXRUaW1lb3V0IiwiYWxlcnRzIiwiaW50ZXJ2YWxJRCIsIlFVbml0IiwibW9kdWxlIiwiYmVmb3JlIiwidGltZXJJbnRlcnZhbCIsInByZXZpb3VzVGltZSIsIkRhdGUiLCJub3ciLCJ3aW5kb3ciLCJzZXRJbnRlcnZhbCIsImN1cnJlbnRUaW1lIiwiZWxhcHNlZFRpbWUiLCJlbWl0IiwiYW5ub3VuY2VtZW50Q29tcGxldGVFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJ1dHRlcmFuY2UiLCJ1bnNoaWZ0IiwiQVJJQV9MSVZFX0RFTEFZIiwiYmVmb3JlRWFjaCIsImNsZWFyIiwicmVzZXQiLCJiZWZvcmVFYWNoVGltaW5nV29ya2Fyb3VuZHMiLCJoYXNTcG9rZW4iLCJhZnRlciIsImNsZWFySW50ZXJ2YWwiLCJ0ZXN0IiwiYXNzZXJ0IiwiYWxlcnRDb250ZW50IiwiYWxlcnQiLCJhbGVydFN0YWJsZURlbGF5IiwiYWRkVG9CYWNrIiwib2siLCJvdGhlckFsZXJ0IiwiaGlnaEZyZXF1ZW5jeVV0dGVyYW5jZSIsIm51bUFsZXJ0cyIsImkiLCJsZW5ndGgiLCJzdGFibGVEZWxheSIsIm15VXR0ZXJhbmNlIiwidXR0ZXJhbmNlV3JhcHBlciIsInN0YWJsZVRpbWUiLCJ0aW1lSW5RdWV1ZSIsInBhcmVudCIsInJhcGlkbHlDaGFuZ2luZyIsImFsZXJ0TWF4aW11bURlbGF5IiwibXlVdHRlcmFuY2VUZXh0IiwiYW5ub3VuY2VJbW1lZGlhdGVseSIsIm5hbWVSZXNwb25zZXNFbmFibGVkUHJvcGVydHkiLCJ2YWx1ZSIsIm9iamVjdFJlc3BvbnNlc0VuYWJsZWRQcm9wZXJ0eSIsImNvbnRleHRSZXNwb25zZXNFbmFibGVkUHJvcGVydHkiLCJoaW50UmVzcG9uc2VzRW5hYmxlZFByb3BlcnR5IiwiTkFNRSIsIk9CSkVDVCIsIkNPTlRFWFQiLCJISU5UIiwibmFtZVJlc3BvbnNlIiwib2JqZWN0UmVzcG9uc2UiLCJjb250ZXh0UmVzcG9uc2UiLCJoaW50UmVzcG9uc2UiLCJpbmNsdWRlcyJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsT0FBT0EsZUFBZSw2QkFBNkI7QUFDbkQsT0FBT0MsdUJBQXVCLHlCQUF5QjtBQUN2RCxPQUFPQyx1QkFBdUIseUJBQXlCO0FBQ3ZELE9BQU9DLG9CQUFvQixzQkFBc0I7QUFDakQsT0FBT0MsZUFBZSxpQkFBaUI7QUFDdkMsT0FBT0Msb0JBQW9CLHNCQUFzQjtBQUNqRCxPQUFPQyw2QkFBNkIsK0JBQStCO0FBRW5FLElBQUlDLGNBQWM7QUFFbEIsTUFBTUMsb0JBQW9CLElBQUlQLGtCQUFtQjtJQUFFUSxvQ0FBb0M7QUFBSztBQUM1RixNQUFNQyxpQkFBaUIsSUFBSUwsZUFBZ0JHO0FBRTNDLGtJQUFrSTtBQUNsSSxTQUFTRyxRQUFTQyxFQUFVO0lBQzFCLE9BQU8sSUFBSUMsUUFBU0MsQ0FBQUEsVUFBV0MsV0FBWUQsU0FBU0YsTUFBUSx3Q0FBd0M7QUFDdEc7QUFFQSxJQUFJSSxTQUFtQixFQUFFO0FBRXpCLElBQUlDO0FBQ0pDLE1BQU1DLE1BQU0sQ0FBRSxhQUFhO0lBQ3pCQztRQUVFLHFEQUFxRDtRQUNyRCxNQUFNQyxnQkFBZ0IsSUFBSTtRQUUxQix1REFBdUQ7UUFDdkQsSUFBSUMsZUFBZUMsS0FBS0MsR0FBRyxJQUFJLFFBQVE7UUFFdkNQLGFBQWFRLE9BQU9DLFdBQVcsQ0FBRTtZQUUvQixRQUFRO1lBQ1IsTUFBTUMsY0FBY0osS0FBS0MsR0FBRztZQUM1QixNQUFNSSxjQUFjRCxjQUFjTDtZQUVsQ3RCLFVBQVU2QixJQUFJLENBQUVELGNBQWMsT0FBUSx3QkFBd0I7WUFFOUROLGVBQWVLO1FBQ2pCLEdBQUdOLGdCQUFnQjtRQUVuQixvRUFBb0U7UUFDcEViLGtCQUFrQnNC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