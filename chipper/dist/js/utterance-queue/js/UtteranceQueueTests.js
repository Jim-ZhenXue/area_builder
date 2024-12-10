// Copyright 2022-2024, University of Colorado Boulder
/**
 * QUnit tests for Utterance and UtteranceQueue that use voicingManager as the Announcer.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
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
import { Display, voicingManager } from '../../scenery/js/imports.js';
import responseCollector from './responseCollector.js';
import SpeechSynthesisAnnouncer from './SpeechSynthesisAnnouncer.js';
import Utterance from './Utterance.js';
import UtteranceQueue from './UtteranceQueue.js';
import UtteranceQueueTestUtils from './UtteranceQueueTestUtils.js';
const queryParameters = QueryStringMachine.getAll({
    // When enabled, extra tests are run that verify the timing of Utterances. It requires the browser to actually
    // speak with SpeechSynthesis. That is only possibly if there is some manual input into the browser window.
    // With this query parameter, there is a brief pause before the first tests are run, so that you can click
    // somewhere in the browser window.
    manualInput: {
        type: 'flag'
    }
});
// See VOICING_UTTERANCE_INTERVAL in voicingManager for why this is necessary. We need to wait this long before
// checking on the utteranceQueue state when working with voicing.
const VOICING_UTTERANCE_INTERVAL = 125;
// When we want to add a little time to make that an interval has completed.
const TIMING_BUFFER = VOICING_UTTERANCE_INTERVAL + 50;
const DEFAULT_VOICE_TIMEOUT = 3000;
// @ts-expect-error we don't want to expose the constructor of this singleton just for unit tests.
const testVoicingManager = new voicingManager.constructor();
const testVoicingUtteranceQueue = new UtteranceQueue(testVoicingManager);
const setDefaultVoice = /*#__PURE__*/ _async_to_generator(function*() {
    let resolved = false;
    return new Promise((resolve)=>{
        const setIt = ()=>{
            if (!resolved) {
                testVoicingManager.voiceProperty.value = testVoicingManager.voicesProperty.value[0] || null;
                clearTimeout(timeout);
                resolved = true;
                resolve();
            }
        };
        const timeout = setTimeout(()=>{
            setIt();
        }, DEFAULT_VOICE_TIMEOUT);
        if (testVoicingManager.voicesProperty.value.length > 0) {
            setIt();
        } else {
            testVoicingManager.voicesProperty.lazyLink(()=>{
                setIt();
            });
        }
    });
});
testVoicingManager.initialize(Display.userGestureEmitter);
testVoicingManager.enabledProperty.value = true;
// helper es6 functions from  https://stackoverflow.com/questions/33289726/combination-of-async-function-await-settimeout/33292942
function timeout(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms)); // eslint-disable-line phet/bad-sim-text
}
let alerts = [];
// Utterance options that will have no cancellation from cancelSelf and cancelOther
const noCancelOptions = {
    cancelSelf: false,
    cancelOther: false
};
const timeUtterance = (utterance)=>{
    return new Promise((resolve)=>{
        const startTime = Date.now();
        testVoicingUtteranceQueue.addToBack(utterance);
        testVoicingManager.announcementCompleteEmitter.addListener(function toRemove(completeUtterance) {
            if (completeUtterance === utterance) {
                resolve(Date.now() - startTime);
                testVoicingManager.announcementCompleteEmitter.removeListener(toRemove);
            }
        });
    });
};
// Reach into the testVoicingManager and get a reference to the Utterance that is currently being spoken for tests.
// Returns null if the Announcer doesn't have a currentlySpeakingUtterance
const getSpeakingUtterance = ()=>{
    return testVoicingManager['speakingSpeechSynthesisUtteranceWrapper'] ? testVoicingManager['speakingSpeechSynthesisUtteranceWrapper'].utterance : null;
};
const firstUtterance = new Utterance({
    alert: 'This is the first utterance',
    alertStableDelay: 0,
    announcerOptions: noCancelOptions
});
const secondUtterance = new Utterance({
    alert: 'This is the second utterance',
    alertStableDelay: 0,
    announcerOptions: noCancelOptions
});
const thirdUtterance = new Utterance({
    alert: 'This is the third utterance',
    alertStableDelay: 0,
    announcerOptions: noCancelOptions
});
let timeForFirstUtterance;
let timeForSecondUtterance;
let timeForThirdUtterance;
let intervalID;
QUnit.module('UtteranceQueue', {
    before: /*#__PURE__*/ _async_to_generator(function*() {
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
        testVoicingManager.announcementCompleteEmitter.addListener((utterance)=>{
            alerts.unshift(utterance);
        });
        if (queryParameters.manualInput) {
            // This seems long, but gives us time to click into the browser before the first test. The following
            // timeUtterance calls can run almost instantly and if you don't click into the sim before they start
            // the tests can break. We try to verify that you clicked into the browser with the following error, but
            // it won't catch everyting. If you click into the browser halfway through speaking the first utterance,
            // the time for the first utterance may be greater than 2000 ms but the timings will still be off.
            yield timeout(3000);
            timeForFirstUtterance = yield timeUtterance(firstUtterance);
            timeForSecondUtterance = yield timeUtterance(secondUtterance);
            timeForThirdUtterance = yield timeUtterance(thirdUtterance);
            // Make sure that speech synthesis is enabled and the Utterances are long enough for timing tests to be
            // consistent. Note that speech is faster or slower depending on your browser. Currently the test
            // utterances take ~1400 ms on Safari and ~2000 ms on Chrome.
            if (timeForFirstUtterance < 1200 || timeForSecondUtterance < 1200 || timeForThirdUtterance < 1200) {
                console.log(`timeForFirstUtterance: ${timeForFirstUtterance}, timeForThirdUtterance: ${timeForSecondUtterance}, timeForThirdUtterane: ${timeForThirdUtterance}`);
                throw new Error('time for Utterances is too short, did you click in the window before the first test started?');
            }
        }
        alerts = [];
        // Set a default voice
        yield setDefaultVoice();
    }),
    beforeEach: /*#__PURE__*/ _async_to_generator(function*() {
        testVoicingUtteranceQueue.cancel();
        // all have default priority for the next test
        firstUtterance.priorityProperty.value = 1;
        secondUtterance.priorityProperty.value = 1;
        thirdUtterance.priorityProperty.value = 1;
        // Apply some workarounds that will hopefully make the tests more consistent when running on CT,
        // see https://github.com/phetsims/utterance-queue/issues/115.
        yield UtteranceQueueTestUtils.beforeEachTimingWorkarounds();
        responseCollector.reset();
        // clear the alerts before each new test
        alerts = [];
    }),
    after () {
        clearInterval(intervalID);
    }
});
QUnit.test('Welcome to UtteranceQueueTests!', /*#__PURE__*/ _async_to_generator(function*(assert) {
    assert.ok(true, 'UtteranceQueue tests take time, run with ?manualInput and click in the window before the first test');
}));
QUnit.test('prioritize utterances on add to back', /*#__PURE__*/ _async_to_generator(function*(assert) {
    const utterance1 = new Utterance({
        alert: '1',
        priority: 5
    });
    const utterance2 = new Utterance({
        alert: '2',
        priority: 1
    });
    const utterance3 = new Utterance({
        alert: '3',
        priority: 1
    });
    const utterance4 = new Utterance({
        alert: '4',
        priority: 1,
        announcerOptions: {
            cancelOther: false
        }
    });
    const utterance5 = new Utterance({
        alert: '5',
        priority: 1,
        announcerOptions: {
            cancelOther: false
        }
    });
    const speechSynthesisAnnouncer = new SpeechSynthesisAnnouncer();
    speechSynthesisAnnouncer.hasSpoken = true; // HAX
    const utteranceQueue = new UtteranceQueue(speechSynthesisAnnouncer);
    assert.ok(utteranceQueue['queue'].length === 0, 'nothing man');
    utteranceQueue.addToBack(utterance1);
    assert.ok(utteranceQueue['queue'].length === 1, 'one add to back');
    utteranceQueue.addToBack(utterance2);
    assert.ok(utteranceQueue['queue'].length === 2, 'one add to back');
    utteranceQueue.addToBack(utterance3);
    assert.ok(utteranceQueue['queue'].length === 2, 'one add to back');
    assert.ok(utteranceQueue['queue'][0].utterance === utterance1, 'one add to back');
    assert.ok(utteranceQueue['queue'][1].utterance === utterance3, 'utterance3 removed utterance1 because cancelOther:true');
    utteranceQueue.addToBack(utterance4);
    assert.ok(utteranceQueue['queue'].length === 3, 'one add to back');
    assert.ok(utteranceQueue['queue'][0].utterance === utterance1, 'one add to back');
    assert.ok(utteranceQueue['queue'][1].utterance === utterance3, 'utterance3 removed utterance1 because cancelOther:true');
    assert.ok(utteranceQueue['queue'][2].utterance === utterance4, 'utterance4 does not removed utterance3 because cancelOther:true');
    utteranceQueue.addToBack(utterance5);
    assert.ok(utteranceQueue['queue'].length === 4, 'one add to back');
    assert.ok(utteranceQueue['queue'][0].utterance === utterance1, 'one add to back');
    assert.ok(utteranceQueue['queue'][1].utterance === utterance3, 'utterance3 removed utterance1 because cancelOther:true');
    assert.ok(utteranceQueue['queue'][2].utterance === utterance4, 'utterance4 does not removed utterance3 because cancelOther:true');
    assert.ok(utteranceQueue['queue'][3].utterance === utterance5, 'utterance4 does not removed utterance3 because cancelOther:true');
    /**
   * UtteranceQueue.prioritizeUtterances() handles prioritizing utterances before AND after the changed utterance. We want
   * to test here that it can handle that when both need updating in the same call. Thus, don't notify for one case,
   * and let the prioritization of the queue occur all during one priority listener call.
   *
   * HAX alert - please make this value between the utterance4 value below and also lower than utterance1.
   */ utterance5.priorityProperty['setPropertyValue'](3);
    utterance4.priorityProperty.value = 2;
    assert.ok(utteranceQueue['queue'].length === 2, 'one add to back');
    assert.ok(utteranceQueue['queue'][0].utterance === utterance1, 'one add to back');
    assert.ok(utteranceQueue['queue'][1].utterance === utterance5, 'utterance5 kicked utterance4 outta the park.');
}));
// CT and some headless browsers don't support SpeechSynthesis
if (testVoicingManager.voicesProperty.value > 0) {
    QUnit.test('utterance.announcerOptions.voice', /*#__PURE__*/ _async_to_generator(function*(assert) {
        const done = assert.async();
        testVoicingManager.voiceProperty.value = null;
        const voice = testVoicingManager.voicesProperty.value[0];
        const utterance = new Utterance({
            alert: 'one',
            announcerOptions: {
                voice: voice
            }
        });
        testVoicingManager.endSpeakingEmitter.addListener(function myListener() {
            const x = testVoicingManager['speakingSpeechSynthesisUtteranceWrapper'];
            assert.ok(x, 'we should have one');
            assert.ok(x.speechSynthesisUtterance.voice === voice, 'voice should match the provided utterance\'s');
            testVoicingManager.endSpeakingEmitter.removeListener(myListener);
            done();
        });
        testVoicingManager.speakIgnoringEnabled(utterance);
        testVoicingManager.voiceProperty.value = voice;
    }));
}
if (queryParameters.manualInput) {
    QUnit.test('Basic UtteranceQueue test', /*#__PURE__*/ _async_to_generator(function*(assert) {
        // basic test, we should hear all three Utterances
        testVoicingUtteranceQueue.addToBack(firstUtterance);
        testVoicingUtteranceQueue.addToBack(secondUtterance);
        testVoicingUtteranceQueue.addToBack(thirdUtterance);
        yield timeout(timeForFirstUtterance + timeForSecondUtterance + timeForThirdUtterance + TIMING_BUFFER * 3);
        assert.ok(alerts.length === 3, 'Three basic Utterances went through the queue');
    }));
    QUnit.test('cancelUtterance tests', /*#__PURE__*/ _async_to_generator(function*(assert) {
        // Test that cancelUtterance will not introduce a memory leak with multiple listeners on the Property
        testVoicingUtteranceQueue.addToBack(firstUtterance);
        yield timeout(timeForFirstUtterance / 2);
        testVoicingUtteranceQueue.cancelUtterance(firstUtterance);
        // Make sure that we handle the `end` event happening asynchronously from the cancel, this should not crash
        testVoicingUtteranceQueue.addToBack(firstUtterance);
        assert.ok(alerts[0] === firstUtterance, 'firstUtterance was cancelled');
        assert.ok(testVoicingUtteranceQueue['queue'].length === 1, 'There is one Utterance in the queue');
    }));
    QUnit.test('PriorityProperty interruption', /*#__PURE__*/ _async_to_generator(function*(assert) {
        // Add all 3 to back
        testVoicingUtteranceQueue.addToBack(firstUtterance);
        testVoicingUtteranceQueue.addToBack(secondUtterance);
        testVoicingUtteranceQueue.addToBack(thirdUtterance);
        assert.ok(testVoicingUtteranceQueue['queue'].length === 3, 'All three utterances in the queue');
        // make the third Utterance high priority, it should remove the other two Utterances
        thirdUtterance.priorityProperty.value = 2;
        assert.ok(testVoicingUtteranceQueue['queue'].length === 1, 'Only the one Utterance remains');
        assert.ok(testVoicingUtteranceQueue['queue'][0].utterance === thirdUtterance, 'Only the third Utterance remains');
    }));
    QUnit.test('Announced Utterance can also be in queue and interruption during announcement', /*#__PURE__*/ _async_to_generator(function*(assert) {
        // while an Utterance is being announced, make sure that we can add the same Utterance to the queue and that
        // priorityProperty is still observed
        testVoicingUtteranceQueue.addToBack(firstUtterance);
        yield timeout(timeForFirstUtterance / 2);
        testVoicingUtteranceQueue.addToBack(firstUtterance);
        testVoicingUtteranceQueue.addToBack(secondUtterance);
        yield timeout(timeForFirstUtterance); // Time to get halfway through second announcement of firstUtterance
        // reduce priorityProperty of firstUtterance while it is being announced, secondUtterance should interrupt
        // eslint-disable-next-line require-atomic-updates
        firstUtterance.priorityProperty.value = 0;
        yield timeout(timeForSecondUtterance / 2);
        assert.ok(getSpeakingUtterance() === secondUtterance, 'Utterance being announced still observes priorityProperty');
        assert.ok(testVoicingUtteranceQueue['queue'].length === 0, 'queue empty after interruption and sending secondUtterance to Announcer');
    }));
    QUnit.test('Higher priority removes earlier Utterances from queue', /*#__PURE__*/ _async_to_generator(function*(assert) {
        // Unit test cases taken from examples that demonstrated the priorityProperty feature in
        // https://github.com/phetsims/utterance-queue/issues/50
        //------------------------------------------------------------------------------------------------------------------
        // Add all 3 to back
        testVoicingUtteranceQueue.addToBack(firstUtterance);
        testVoicingUtteranceQueue.addToBack(secondUtterance);
        testVoicingUtteranceQueue.addToBack(thirdUtterance);
        assert.ok(testVoicingUtteranceQueue['queue'].length === 3, 'All three utterances in the queue');
        secondUtterance.priorityProperty.value = 2;
        // enough time for the secondUtterance to start speaking while the firstUtterance was just removed from the queue
        yield timeout(timeForSecondUtterance / 2);
        assert.ok(getSpeakingUtterance() === secondUtterance, 'The secondUtterance interrupted the firstUtterance because it is higher priority.');
        // enough time to finish the secondUtterance and start speaking the thirdUtterance
        yield timeout(timeForSecondUtterance / 2 + timeForThirdUtterance / 2);
        assert.ok(alerts[0] === secondUtterance, 'secondUtterance spoken in full');
        assert.ok(getSpeakingUtterance() === thirdUtterance, 'thirdUtterance spoken after secondUtterance finished');
    //------------------------------------------------------------------------------------------------------------------
    }));
    QUnit.test('Utterance removed because of self priority reduction before another is added to queue', /*#__PURE__*/ _async_to_generator(function*(assert) {
        firstUtterance.priorityProperty.value = 10;
        testVoicingUtteranceQueue.addToBack(firstUtterance);
        // reduce priorityProperty before adding thirdUtterance to queue
        firstUtterance.priorityProperty.value = 0;
        testVoicingUtteranceQueue.addToBack(thirdUtterance);
        // enough time to start speaking either the first or third Utterances
        yield timeout(timeForFirstUtterance / 2);
        assert.ok(getSpeakingUtterance() === thirdUtterance, 'thirdUtterance spoken because firstUtterance.priorityProperty was reduced before adding thirdUtterance to the queue');
    }));
    QUnit.test('Utterance removed because of self priority reduction after another is added to queue', /*#__PURE__*/ _async_to_generator(function*(assert) {
        firstUtterance.priorityProperty.value = 10;
        testVoicingUtteranceQueue.addToBack(firstUtterance);
        // reduce priorityProperty AFTER adding thirdUtterance to queue
        testVoicingUtteranceQueue.addToBack(thirdUtterance);
        firstUtterance.priorityProperty.value = 0;
        // enough time to start speaking either the first or third Utterances
        yield timeout(timeForFirstUtterance / 2);
        assert.ok(getSpeakingUtterance() === thirdUtterance, 'thirdUtterance spoken because firstUtterance.priorityProperty was reduced after adding thirdUtterance to the queue');
    }));
    QUnit.test('Utterance interruption because self priority reduced while being announced', /*#__PURE__*/ _async_to_generator(function*(assert) {
        firstUtterance.priorityProperty.value = 10;
        testVoicingUtteranceQueue.addToBack(firstUtterance);
        testVoicingUtteranceQueue.addToBack(thirdUtterance);
        yield timeout(timeForFirstUtterance / 2);
        assert.ok(getSpeakingUtterance() === firstUtterance);
        // reducing priority below third utterance should interrupt firstUtterance for thirdUtterance
        firstUtterance.priorityProperty.value = 0;
        // not enough time for firstUtterance to finish in full, but enough time to verify that it was interrupted
        yield timeout(timeForFirstUtterance / 4);
        assert.ok(alerts[0] === firstUtterance, 'firstUtterance was interrupted because its priority was reduced while it was being announced');
        // enough time for thirdUtterance to start speaking
        yield timeout(timeForThirdUtterance / 2);
        assert.ok(getSpeakingUtterance() === thirdUtterance, 'thirdUtterance being announced after interrupting firstUtterance');
    }));
    QUnit.test('Utterance interruption during annoumcement because another in the queue made higher priority', /*#__PURE__*/ _async_to_generator(function*(assert) {
        firstUtterance.priorityProperty.value = 0;
        thirdUtterance.priorityProperty.value = 0;
        testVoicingUtteranceQueue.addToBack(firstUtterance);
        testVoicingUtteranceQueue.addToBack(thirdUtterance);
        yield timeout(timeForFirstUtterance / 2);
        assert.ok(getSpeakingUtterance() === firstUtterance, 'firstUtterance being announced');
        // increasing priority of thirdUtterance in the queue should interrupt firstUtterance being announced
        // eslint-disable-next-line require-atomic-updates
        thirdUtterance.priorityProperty.value = 3;
        // not enough time for firstUtterance to finish, but enough to make sure that it was interrupted
        yield timeout(timeForFirstUtterance / 4);
        assert.ok(alerts[0] === firstUtterance, 'firstUtterance was interrupted because an Utterance in the queue was made higher priority');
        // enough time for thirdUtterance to start speaking
        yield timeout(timeForThirdUtterance / 2);
        assert.ok(getSpeakingUtterance() === thirdUtterance, 'thirdUtterance being announced after interrupting firstUtterance');
    }));
    QUnit.test('Utterance NOT interrupted because self priority still relatively higher', /*#__PURE__*/ _async_to_generator(function*(assert) {
        firstUtterance.priorityProperty.value = 10;
        testVoicingUtteranceQueue.addToBack(firstUtterance);
        testVoicingUtteranceQueue.addToBack(thirdUtterance);
        yield timeout(timeForFirstUtterance / 2);
        // we should still hear both Utterances in full, new priority for firstUtterance is higher than thirdUtterance
        // eslint-disable-next-line require-atomic-updates
        firstUtterance.priorityProperty.value = 5;
        // not enough time for firstUtterance to finish, but enough to make sure that it was not interrupted
        yield timeout(timeForFirstUtterance / 10);
        assert.ok(alerts.length === 0, 'firstUtterance was not interrupted because priority was set to a value higher than next utterance in queue');
        // enough time for thirdUtterance to start speaking after firstUtterance finishes
        yield timeout(timeForThirdUtterance / 2 + timeForFirstUtterance / 2);
        assert.ok(alerts[0] === firstUtterance, 'firstUtterance finished being announced');
        assert.ok(getSpeakingUtterance() === thirdUtterance, 'thirdUtterance being announced after waiting for firstUtterance');
    }));
    QUnit.test('announceImmediately', /*#__PURE__*/ _async_to_generator(function*(assert) {
        testVoicingUtteranceQueue.announceImmediately(firstUtterance);
        assert.ok(testVoicingUtteranceQueue['queue'].length === 0, 'announceImmediately should be synchronous with voicingManager for an empty queue');
        yield timeout(timeForFirstUtterance / 2);
        assert.ok(getSpeakingUtterance() === firstUtterance, 'first utterance spoken immediately');
    }));
    QUnit.test('announceImmediately reduces duplicate Utterances in queue', /*#__PURE__*/ _async_to_generator(function*(assert) {
        testVoicingUtteranceQueue.addToBack(firstUtterance);
        testVoicingUtteranceQueue.addToBack(secondUtterance);
        testVoicingUtteranceQueue.addToBack(thirdUtterance);
        // now speak the first utterance immediately
        testVoicingUtteranceQueue.announceImmediately(firstUtterance);
        yield timeout(timeForFirstUtterance / 2);
        assert.ok(testVoicingUtteranceQueue['queue'].length === 2, 'announcing firstUtterance immediately should remove the duplicate firstUtterance in the queue');
        assert.ok(getSpeakingUtterance() === firstUtterance, 'first utterance is being spoken after announceImmediately');
    }));
    QUnit.test('announceImmediately does nothing when Utterance has low priority relative to queued Utterances', /*#__PURE__*/ _async_to_generator(function*(assert) {
        testVoicingUtteranceQueue.addToBack(firstUtterance);
        testVoicingUtteranceQueue.addToBack(secondUtterance);
        firstUtterance.priorityProperty.value = 2;
        thirdUtterance.priorityProperty.value = 1;
        testVoicingUtteranceQueue.announceImmediately(thirdUtterance);
        // thirdUtterance is lower priority than next item in the queue, it should not be spoken and should not be
        // in the queue at all
        assert.ok(testVoicingUtteranceQueue['queue'].length === 2, 'only first and second utterances in the queue');
        assert.ok(!testVoicingUtteranceQueue.hasUtterance(thirdUtterance), 'thirdUtterance not in queue after announceImmediately');
        yield timeout(timeForFirstUtterance / 2);
        assert.ok(getSpeakingUtterance() === firstUtterance);
        assert.ok(alerts[0] !== thirdUtterance, 'thirdUtterance was not spoken with announceImmediately');
    }));
    QUnit.test('anounceImmediatelety does nothing when Utterance has low priority relative to announcing Utterance', /*#__PURE__*/ _async_to_generator(function*(assert) {
        firstUtterance.priorityProperty.value = 1;
        thirdUtterance.priorityProperty.value = 1;
        testVoicingUtteranceQueue.addToBack(firstUtterance);
        testVoicingUtteranceQueue.addToBack(secondUtterance);
        firstUtterance.priorityProperty.value = 2;
        thirdUtterance.priorityProperty.value = 1;
        yield timeout(timeForFirstUtterance / 2);
        testVoicingUtteranceQueue.announceImmediately(thirdUtterance);
        // thirdUtterance is lower priority than what is currently being spoken so it should NOT be heard
        yield timeout(timeForFirstUtterance / 4); // less than remaining time for firstUtterance checking for interruption
        assert.ok(getSpeakingUtterance() !== thirdUtterance, 'announceImmediately should not interrupt a higher priority utterance');
        assert.ok(!testVoicingUtteranceQueue.hasUtterance(thirdUtterance), 'lower priority thirdUtterance should be dropped from the queue');
    }));
    QUnit.test('Utterance spoken with announceImmediately should be interrupted if priority is reduced', /*#__PURE__*/ _async_to_generator(function*(assert) {
        //--------------------------------------------------------------------------------------------------
        // The Utterance spoken with announceImmediately should be interrupted if its priority is reduced
        // below another item in the queue
        //--------------------------------------------------------------------------------------------------
        firstUtterance.priorityProperty.value = 2;
        thirdUtterance.priorityProperty.value = 2;
        testVoicingUtteranceQueue.addToBack(firstUtterance);
        testVoicingUtteranceQueue.addToBack(secondUtterance);
        testVoicingUtteranceQueue.announceImmediately(thirdUtterance);
        yield timeout(timeForThirdUtterance / 2);
        assert.ok(getSpeakingUtterance() === thirdUtterance, 'thirdUtterance is announced immediately');
        thirdUtterance.priorityProperty.value = 1;
        // the priority of the thirdUtterance is reduced while being spoken from announceImmediately, it should be
        // interrupted and the next item in the queue should be spoken
        yield timeout(timeForThirdUtterance / 4); // less than the remaining time for third utterance for interruption
        assert.ok(alerts[0] === thirdUtterance, 'third utterance was interrupted by reducing its priority');
        yield timeout(timeForFirstUtterance / 2);
        assert.ok(getSpeakingUtterance() === firstUtterance, 'moved on to next utterance in queue');
    }));
    QUnit.test('Utterance spoken by announceImmediately is interrupted by raising priority of queued utterance', /*#__PURE__*/ _async_to_generator(function*(assert) {
        firstUtterance.priorityProperty.value = 1;
        thirdUtterance.priorityProperty.value = 1;
        testVoicingUtteranceQueue.addToBack(firstUtterance);
        testVoicingUtteranceQueue.addToBack(secondUtterance);
        testVoicingUtteranceQueue.announceImmediately(thirdUtterance);
        yield timeout(timeForThirdUtterance / 2);
        assert.ok(getSpeakingUtterance() === thirdUtterance, 'thirdUtterance is announced immediately');
        // eslint-disable-next-line require-atomic-updates
        firstUtterance.priorityProperty.value = 2;
        // the priority of firstUtterance is increased so the utterance of announceImmediately should be interrupted
        yield timeout(timeForThirdUtterance / 4); // less than remaining time for third utterance for interruption
        assert.ok(alerts[0] === thirdUtterance, 'third utterance was interrupted by the next Utterance increasing priority');
        yield timeout(timeForFirstUtterance / 2);
        assert.ok(getSpeakingUtterance() === firstUtterance, 'moved on to higher priority utterance in queue');
    }));
    QUnit.test('announceImmediately interrupts another Utterance if new Utterance is high priority', /*#__PURE__*/ _async_to_generator(function*(assert) {
        firstUtterance.priorityProperty.value = 1;
        thirdUtterance.priorityProperty.value = 2;
        testVoicingUtteranceQueue.addToBack(firstUtterance);
        testVoicingUtteranceQueue.addToBack(secondUtterance);
        yield timeout(timeForFirstUtterance / 2);
        testVoicingUtteranceQueue.announceImmediately(thirdUtterance);
        yield timeout(timeForFirstUtterance / 4); // should not be enough time for firstUtterance to finish
        assert.ok(alerts[0] === firstUtterance, 'firstUtterance interrupted because it had lower priority');
        yield timeout(timeForThirdUtterance / 2);
        assert.ok(getSpeakingUtterance() === thirdUtterance, 'thirdUtterance spoken immediately');
    }));
    QUnit.test('announceImmediately will not interrupt Utterance of equal or lesser priority ', /*#__PURE__*/ _async_to_generator(function*(assert) {
        firstUtterance.priorityProperty.value = 1;
        thirdUtterance.priorityProperty.value = 1;
        testVoicingUtteranceQueue.addToBack(firstUtterance);
        testVoicingUtteranceQueue.addToBack(secondUtterance);
        yield timeout(timeForFirstUtterance / 2);
        testVoicingUtteranceQueue.announceImmediately(thirdUtterance);
        yield timeout(timeForFirstUtterance / 4);
        assert.ok(getSpeakingUtterance() === firstUtterance, 'firstUtterance not interrupted, it has equal priority');
        assert.ok(testVoicingUtteranceQueue['queue'][0].utterance === secondUtterance, 'thirdUtterance was added to the front of the queue');
        assert.ok(testVoicingUtteranceQueue['queue'].length === 1, 'thirdUtterance was not added to queue and will never be announced');
        yield timeout(timeForFirstUtterance / 4 + timeForThirdUtterance / 2);
        assert.ok(alerts[0] === firstUtterance, 'firstUtterance spoken in full');
    }));
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9VdHRlcmFuY2VRdWV1ZVRlc3RzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFFVbml0IHRlc3RzIGZvciBVdHRlcmFuY2UgYW5kIFV0dGVyYW5jZVF1ZXVlIHRoYXQgdXNlIHZvaWNpbmdNYW5hZ2VyIGFzIHRoZSBBbm5vdW5jZXIuXG4gKlxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9SZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBzdGVwVGltZXIgZnJvbSAnLi4vLi4vYXhvbi9qcy9zdGVwVGltZXIuanMnO1xuaW1wb3J0IHsgRGlzcGxheSwgdm9pY2luZ01hbmFnZXIgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHJlc3BvbnNlQ29sbGVjdG9yIGZyb20gJy4vcmVzcG9uc2VDb2xsZWN0b3IuanMnO1xuaW1wb3J0IFNwZWVjaFN5bnRoZXNpc0Fubm91bmNlciBmcm9tICcuL1NwZWVjaFN5bnRoZXNpc0Fubm91bmNlci5qcyc7XG5pbXBvcnQgVXR0ZXJhbmNlIGZyb20gJy4vVXR0ZXJhbmNlLmpzJztcbmltcG9ydCBVdHRlcmFuY2VRdWV1ZSBmcm9tICcuL1V0dGVyYW5jZVF1ZXVlLmpzJztcbmltcG9ydCBVdHRlcmFuY2VRdWV1ZVRlc3RVdGlscyBmcm9tICcuL1V0dGVyYW5jZVF1ZXVlVGVzdFV0aWxzLmpzJztcblxuY29uc3QgcXVlcnlQYXJhbWV0ZXJzID0gUXVlcnlTdHJpbmdNYWNoaW5lLmdldEFsbCgge1xuXG4gIC8vIFdoZW4gZW5hYmxlZCwgZXh0cmEgdGVzdHMgYXJlIHJ1biB0aGF0IHZlcmlmeSB0aGUgdGltaW5nIG9mIFV0dGVyYW5jZXMuIEl0IHJlcXVpcmVzIHRoZSBicm93c2VyIHRvIGFjdHVhbGx5XG4gIC8vIHNwZWFrIHdpdGggU3BlZWNoU3ludGhlc2lzLiBUaGF0IGlzIG9ubHkgcG9zc2libHkgaWYgdGhlcmUgaXMgc29tZSBtYW51YWwgaW5wdXQgaW50byB0aGUgYnJvd3NlciB3aW5kb3cuXG4gIC8vIFdpdGggdGhpcyBxdWVyeSBwYXJhbWV0ZXIsIHRoZXJlIGlzIGEgYnJpZWYgcGF1c2UgYmVmb3JlIHRoZSBmaXJzdCB0ZXN0cyBhcmUgcnVuLCBzbyB0aGF0IHlvdSBjYW4gY2xpY2tcbiAgLy8gc29tZXdoZXJlIGluIHRoZSBicm93c2VyIHdpbmRvdy5cbiAgbWFudWFsSW5wdXQ6IHtcbiAgICB0eXBlOiAnZmxhZydcbiAgfVxufSApO1xuXG4vLyBTZWUgVk9JQ0lOR19VVFRFUkFOQ0VfSU5URVJWQUwgaW4gdm9pY2luZ01hbmFnZXIgZm9yIHdoeSB0aGlzIGlzIG5lY2Vzc2FyeS4gV2UgbmVlZCB0byB3YWl0IHRoaXMgbG9uZyBiZWZvcmVcbi8vIGNoZWNraW5nIG9uIHRoZSB1dHRlcmFuY2VRdWV1ZSBzdGF0ZSB3aGVuIHdvcmtpbmcgd2l0aCB2b2ljaW5nLlxuY29uc3QgVk9JQ0lOR19VVFRFUkFOQ0VfSU5URVJWQUwgPSAxMjU7XG5cbi8vIFdoZW4gd2Ugd2FudCB0byBhZGQgYSBsaXR0bGUgdGltZSB0byBtYWtlIHRoYXQgYW4gaW50ZXJ2YWwgaGFzIGNvbXBsZXRlZC5cbmNvbnN0IFRJTUlOR19CVUZGRVIgPSBWT0lDSU5HX1VUVEVSQU5DRV9JTlRFUlZBTCArIDUwO1xuXG5jb25zdCBERUZBVUxUX1ZPSUNFX1RJTUVPVVQgPSAzMDAwO1xuXG4vLyBAdHMtZXhwZWN0LWVycm9yIHdlIGRvbid0IHdhbnQgdG8gZXhwb3NlIHRoZSBjb25zdHJ1Y3RvciBvZiB0aGlzIHNpbmdsZXRvbiBqdXN0IGZvciB1bml0IHRlc3RzLlxuY29uc3QgdGVzdFZvaWNpbmdNYW5hZ2VyID0gbmV3IHZvaWNpbmdNYW5hZ2VyLmNvbnN0cnVjdG9yKCk7XG5jb25zdCB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlID0gbmV3IFV0dGVyYW5jZVF1ZXVlKCB0ZXN0Vm9pY2luZ01hbmFnZXIgKTtcblxuY29uc3Qgc2V0RGVmYXVsdFZvaWNlID0gYXN5bmMgKCkgPT4ge1xuICBsZXQgcmVzb2x2ZWQgPSBmYWxzZTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KCByZXNvbHZlID0+IHtcbiAgICBjb25zdCBzZXRJdCA9ICgpID0+IHtcbiAgICAgIGlmICggIXJlc29sdmVkICkge1xuICAgICAgICB0ZXN0Vm9pY2luZ01hbmFnZXIudm9pY2VQcm9wZXJ0eS52YWx1ZSA9IHRlc3RWb2ljaW5nTWFuYWdlci52b2ljZXNQcm9wZXJ0eS52YWx1ZVsgMCBdIHx8IG51bGw7XG4gICAgICAgIGNsZWFyVGltZW91dCggdGltZW91dCApO1xuICAgICAgICByZXNvbHZlZCA9IHRydWU7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCAoKSA9PiB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC9iYWQtc2ltLXRleHRcbiAgICAgIHNldEl0KCk7XG4gICAgfSwgREVGQVVMVF9WT0lDRV9USU1FT1VUICk7XG5cbiAgICBpZiAoIHRlc3RWb2ljaW5nTWFuYWdlci52b2ljZXNQcm9wZXJ0eS52YWx1ZS5sZW5ndGggPiAwICkge1xuICAgICAgc2V0SXQoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0ZXN0Vm9pY2luZ01hbmFnZXIudm9pY2VzUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcbiAgICAgICAgc2V0SXQoKTtcbiAgICAgIH0gKTtcbiAgICB9XG4gIH0gKTtcbn07XG5cbnRlc3RWb2ljaW5nTWFuYWdlci5pbml0aWFsaXplKCBEaXNwbGF5LnVzZXJHZXN0dXJlRW1pdHRlciApO1xudGVzdFZvaWNpbmdNYW5hZ2VyLmVuYWJsZWRQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XG5cbi8vIGhlbHBlciBlczYgZnVuY3Rpb25zIGZyb20gIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzMzMjg5NzI2L2NvbWJpbmF0aW9uLW9mLWFzeW5jLWZ1bmN0aW9uLWF3YWl0LXNldHRpbWVvdXQvMzMyOTI5NDJcbmZ1bmN0aW9uIHRpbWVvdXQoIG1zOiBudW1iZXIgKTogUHJvbWlzZTx1bmtub3duPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSggcmVzb2x2ZSA9PiBzZXRUaW1lb3V0KCByZXNvbHZlLCBtcyApICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC9iYWQtc2ltLXRleHRcbn1cblxubGV0IGFsZXJ0czogVXR0ZXJhbmNlW10gPSBbXTtcblxuLy8gVXR0ZXJhbmNlIG9wdGlvbnMgdGhhdCB3aWxsIGhhdmUgbm8gY2FuY2VsbGF0aW9uIGZyb20gY2FuY2VsU2VsZiBhbmQgY2FuY2VsT3RoZXJcbmNvbnN0IG5vQ2FuY2VsT3B0aW9ucyA9IHtcbiAgY2FuY2VsU2VsZjogZmFsc2UsXG4gIGNhbmNlbE90aGVyOiBmYWxzZVxufTtcblxuY29uc3QgdGltZVV0dGVyYW5jZSA9ICggdXR0ZXJhbmNlOiBVdHRlcmFuY2UgKTogUHJvbWlzZTxudW1iZXI+ID0+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKCByZXNvbHZlID0+IHtcbiAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCB1dHRlcmFuY2UgKTtcblxuICAgIHRlc3RWb2ljaW5nTWFuYWdlci5hbm5vdW5jZW1lbnRDb21wbGV0ZUVtaXR0ZXIuYWRkTGlzdGVuZXIoIGZ1bmN0aW9uIHRvUmVtb3ZlKCBjb21wbGV0ZVV0dGVyYW5jZTogVXR0ZXJhbmNlICkge1xuICAgICAgaWYgKCBjb21wbGV0ZVV0dGVyYW5jZSA9PT0gdXR0ZXJhbmNlICkge1xuICAgICAgICByZXNvbHZlKCBEYXRlLm5vdygpIC0gc3RhcnRUaW1lICk7XG4gICAgICAgIHRlc3RWb2ljaW5nTWFuYWdlci5hbm5vdW5jZW1lbnRDb21wbGV0ZUVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRvUmVtb3ZlICk7XG4gICAgICB9XG4gICAgfSApO1xuICB9ICk7XG59O1xuXG4vLyBSZWFjaCBpbnRvIHRoZSB0ZXN0Vm9pY2luZ01hbmFnZXIgYW5kIGdldCBhIHJlZmVyZW5jZSB0byB0aGUgVXR0ZXJhbmNlIHRoYXQgaXMgY3VycmVudGx5IGJlaW5nIHNwb2tlbiBmb3IgdGVzdHMuXG4vLyBSZXR1cm5zIG51bGwgaWYgdGhlIEFubm91bmNlciBkb2Vzbid0IGhhdmUgYSBjdXJyZW50bHlTcGVha2luZ1V0dGVyYW5jZVxuY29uc3QgZ2V0U3BlYWtpbmdVdHRlcmFuY2UgPSAoKTogVXR0ZXJhbmNlIHwgbnVsbCA9PiB7XG4gIHJldHVybiB0ZXN0Vm9pY2luZ01hbmFnZXJbICdzcGVha2luZ1NwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXInIF0gPyB0ZXN0Vm9pY2luZ01hbmFnZXJbICdzcGVha2luZ1NwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXInIF0udXR0ZXJhbmNlIDogbnVsbDtcbn07XG5cbmNvbnN0IGZpcnN0VXR0ZXJhbmNlID0gbmV3IFV0dGVyYW5jZSgge1xuICBhbGVydDogJ1RoaXMgaXMgdGhlIGZpcnN0IHV0dGVyYW5jZScsXG4gIGFsZXJ0U3RhYmxlRGVsYXk6IDAsXG4gIGFubm91bmNlck9wdGlvbnM6IG5vQ2FuY2VsT3B0aW9uc1xufSApO1xuY29uc3Qgc2Vjb25kVXR0ZXJhbmNlID0gbmV3IFV0dGVyYW5jZSgge1xuICBhbGVydDogJ1RoaXMgaXMgdGhlIHNlY29uZCB1dHRlcmFuY2UnLFxuICBhbGVydFN0YWJsZURlbGF5OiAwLFxuICBhbm5vdW5jZXJPcHRpb25zOiBub0NhbmNlbE9wdGlvbnNcbn0gKTtcblxuY29uc3QgdGhpcmRVdHRlcmFuY2UgPSBuZXcgVXR0ZXJhbmNlKCB7XG4gIGFsZXJ0OiAnVGhpcyBpcyB0aGUgdGhpcmQgdXR0ZXJhbmNlJyxcbiAgYWxlcnRTdGFibGVEZWxheTogMCxcbiAgYW5ub3VuY2VyT3B0aW9uczogbm9DYW5jZWxPcHRpb25zXG59ICk7XG5cblxubGV0IHRpbWVGb3JGaXJzdFV0dGVyYW5jZTogbnVtYmVyO1xubGV0IHRpbWVGb3JTZWNvbmRVdHRlcmFuY2U6IG51bWJlcjtcbmxldCB0aW1lRm9yVGhpcmRVdHRlcmFuY2U6IG51bWJlcjtcblxubGV0IGludGVydmFsSUQ6IG51bWJlcjtcblFVbml0Lm1vZHVsZSggJ1V0dGVyYW5jZVF1ZXVlJywge1xuICBiZWZvcmU6IGFzeW5jICgpID0+IHtcblxuICAgIC8vIHRpbWVyIHN0ZXAgaW4gc2Vjb25kcywgc3RlcHBlZCA2MCB0aW1lcyBwZXIgc2Vjb25kXG4gICAgY29uc3QgdGltZXJJbnRlcnZhbCA9IDEgLyA2MDtcblxuICAgIC8vIHN0ZXAgdGhlIHRpbWVyLCBiZWNhdXNlIHV0dGVyYW5jZVF1ZXVlIHJ1bnMgb24gdGltZXJcbiAgICBsZXQgcHJldmlvdXNUaW1lID0gRGF0ZS5ub3coKTsgLy8gaW4gbXNcblxuICAgIGludGVydmFsSUQgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoICgpID0+IHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L2JhZC1zaW0tdGV4dFxuXG4gICAgICAvLyBpbiBtc1xuICAgICAgY29uc3QgY3VycmVudFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgY29uc3QgZWxhcHNlZFRpbWUgPSBjdXJyZW50VGltZSAtIHByZXZpb3VzVGltZTtcblxuICAgICAgc3RlcFRpbWVyLmVtaXQoIGVsYXBzZWRUaW1lIC8gMTAwMCApOyAvLyBzdGVwIHRpbWVyIGluIHNlY29uZHNcblxuICAgICAgcHJldmlvdXNUaW1lID0gY3VycmVudFRpbWU7XG4gICAgfSwgdGltZXJJbnRlcnZhbCAqIDEwMDAgKTtcblxuICAgIC8vIHdoZW5ldmVyIGFubm91bmNpbmcsIGdldCBhIGNhbGxiYWNrIGFuZCBwb3B1bGF0ZSB0aGUgYWxlcnRzIGFycmF5XG4gICAgdGVzdFZvaWNpbmdNYW5hZ2VyLmFubm91bmNlbWVudENvbXBsZXRlRW1pdHRlci5hZGRMaXN0ZW5lciggKCB1dHRlcmFuY2U6IFV0dGVyYW5jZSApID0+IHtcbiAgICAgIGFsZXJ0cy51bnNoaWZ0KCB1dHRlcmFuY2UgKTtcbiAgICB9ICk7XG5cbiAgICBpZiAoIHF1ZXJ5UGFyYW1ldGVycy5tYW51YWxJbnB1dCApIHtcblxuICAgICAgLy8gVGhpcyBzZWVtcyBsb25nLCBidXQgZ2l2ZXMgdXMgdGltZSB0byBjbGljayBpbnRvIHRoZSBicm93c2VyIGJlZm9yZSB0aGUgZmlyc3QgdGVzdC4gVGhlIGZvbGxvd2luZ1xuICAgICAgLy8gdGltZVV0dGVyYW5jZSBjYWxscyBjYW4gcnVuIGFsbW9zdCBpbnN0YW50bHkgYW5kIGlmIHlvdSBkb24ndCBjbGljayBpbnRvIHRoZSBzaW0gYmVmb3JlIHRoZXkgc3RhcnRcbiAgICAgIC8vIHRoZSB0ZXN0cyBjYW4gYnJlYWsuIFdlIHRyeSB0byB2ZXJpZnkgdGhhdCB5b3UgY2xpY2tlZCBpbnRvIHRoZSBicm93c2VyIHdpdGggdGhlIGZvbGxvd2luZyBlcnJvciwgYnV0XG4gICAgICAvLyBpdCB3b24ndCBjYXRjaCBldmVyeXRpbmcuIElmIHlvdSBjbGljayBpbnRvIHRoZSBicm93c2VyIGhhbGZ3YXkgdGhyb3VnaCBzcGVha2luZyB0aGUgZmlyc3QgdXR0ZXJhbmNlLFxuICAgICAgLy8gdGhlIHRpbWUgZm9yIHRoZSBmaXJzdCB1dHRlcmFuY2UgbWF5IGJlIGdyZWF0ZXIgdGhhbiAyMDAwIG1zIGJ1dCB0aGUgdGltaW5ncyB3aWxsIHN0aWxsIGJlIG9mZi5cbiAgICAgIGF3YWl0IHRpbWVvdXQoIDMwMDAgKTtcblxuICAgICAgdGltZUZvckZpcnN0VXR0ZXJhbmNlID0gYXdhaXQgdGltZVV0dGVyYW5jZSggZmlyc3RVdHRlcmFuY2UgKTtcbiAgICAgIHRpbWVGb3JTZWNvbmRVdHRlcmFuY2UgPSBhd2FpdCB0aW1lVXR0ZXJhbmNlKCBzZWNvbmRVdHRlcmFuY2UgKTtcbiAgICAgIHRpbWVGb3JUaGlyZFV0dGVyYW5jZSA9IGF3YWl0IHRpbWVVdHRlcmFuY2UoIHRoaXJkVXR0ZXJhbmNlICk7XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSB0aGF0IHNwZWVjaCBzeW50aGVzaXMgaXMgZW5hYmxlZCBhbmQgdGhlIFV0dGVyYW5jZXMgYXJlIGxvbmcgZW5vdWdoIGZvciB0aW1pbmcgdGVzdHMgdG8gYmVcbiAgICAgIC8vIGNvbnNpc3RlbnQuIE5vdGUgdGhhdCBzcGVlY2ggaXMgZmFzdGVyIG9yIHNsb3dlciBkZXBlbmRpbmcgb24geW91ciBicm93c2VyLiBDdXJyZW50bHkgdGhlIHRlc3RcbiAgICAgIC8vIHV0dGVyYW5jZXMgdGFrZSB+MTQwMCBtcyBvbiBTYWZhcmkgYW5kIH4yMDAwIG1zIG9uIENocm9tZS5cbiAgICAgIGlmICggdGltZUZvckZpcnN0VXR0ZXJhbmNlIDwgMTIwMCB8fCB0aW1lRm9yU2Vjb25kVXR0ZXJhbmNlIDwgMTIwMCB8fCB0aW1lRm9yVGhpcmRVdHRlcmFuY2UgPCAxMjAwICkge1xuICAgICAgICBjb25zb2xlLmxvZyggYHRpbWVGb3JGaXJzdFV0dGVyYW5jZTogJHt0aW1lRm9yRmlyc3RVdHRlcmFuY2V9LCB0aW1lRm9yVGhpcmRVdHRlcmFuY2U6ICR7dGltZUZvclNlY29uZFV0dGVyYW5jZX0sIHRpbWVGb3JUaGlyZFV0dGVyYW5lOiAke3RpbWVGb3JUaGlyZFV0dGVyYW5jZX1gICk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvciggJ3RpbWUgZm9yIFV0dGVyYW5jZXMgaXMgdG9vIHNob3J0LCBkaWQgeW91IGNsaWNrIGluIHRoZSB3aW5kb3cgYmVmb3JlIHRoZSBmaXJzdCB0ZXN0IHN0YXJ0ZWQ/JyApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGFsZXJ0cyA9IFtdO1xuXG4gICAgLy8gU2V0IGEgZGVmYXVsdCB2b2ljZVxuICAgIGF3YWl0IHNldERlZmF1bHRWb2ljZSgpO1xuICB9LFxuICBiZWZvcmVFYWNoOiBhc3luYyAoKSA9PiB7XG5cbiAgICB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmNhbmNlbCgpO1xuXG4gICAgLy8gYWxsIGhhdmUgZGVmYXVsdCBwcmlvcml0eSBmb3IgdGhlIG5leHQgdGVzdFxuICAgIGZpcnN0VXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAxO1xuICAgIHNlY29uZFV0dGVyYW5jZS5wcmlvcml0eVByb3BlcnR5LnZhbHVlID0gMTtcbiAgICB0aGlyZFV0dGVyYW5jZS5wcmlvcml0eVByb3BlcnR5LnZhbHVlID0gMTtcblxuICAgIC8vIEFwcGx5IHNvbWUgd29ya2Fyb3VuZHMgdGhhdCB3aWxsIGhvcGVmdWxseSBtYWtlIHRoZSB0ZXN0cyBtb3JlIGNvbnNpc3RlbnQgd2hlbiBydW5uaW5nIG9uIENULFxuICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdXR0ZXJhbmNlLXF1ZXVlL2lzc3Vlcy8xMTUuXG4gICAgYXdhaXQgVXR0ZXJhbmNlUXVldWVUZXN0VXRpbHMuYmVmb3JlRWFjaFRpbWluZ1dvcmthcm91bmRzKCk7XG5cbiAgICByZXNwb25zZUNvbGxlY3Rvci5yZXNldCgpO1xuXG4gICAgLy8gY2xlYXIgdGhlIGFsZXJ0cyBiZWZvcmUgZWFjaCBuZXcgdGVzdFxuICAgIGFsZXJ0cyA9IFtdO1xuICB9LFxuICBhZnRlcigpIHtcbiAgICBjbGVhckludGVydmFsKCBpbnRlcnZhbElEICk7XG4gIH1cbn0gKTtcblxuUVVuaXQudGVzdCggJ1dlbGNvbWUgdG8gVXR0ZXJhbmNlUXVldWVUZXN0cyEnLCBhc3luYyBhc3NlcnQgPT4ge1xuICBhc3NlcnQub2soIHRydWUsICdVdHRlcmFuY2VRdWV1ZSB0ZXN0cyB0YWtlIHRpbWUsIHJ1biB3aXRoID9tYW51YWxJbnB1dCBhbmQgY2xpY2sgaW4gdGhlIHdpbmRvdyBiZWZvcmUgdGhlIGZpcnN0IHRlc3QnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdwcmlvcml0aXplIHV0dGVyYW5jZXMgb24gYWRkIHRvIGJhY2snLCBhc3luYyBhc3NlcnQgPT4ge1xuICBjb25zdCB1dHRlcmFuY2UxID0gbmV3IFV0dGVyYW5jZSgge1xuICAgIGFsZXJ0OiAnMScsXG4gICAgcHJpb3JpdHk6IDVcbiAgfSApO1xuICBjb25zdCB1dHRlcmFuY2UyID0gbmV3IFV0dGVyYW5jZSgge1xuICAgIGFsZXJ0OiAnMicsXG4gICAgcHJpb3JpdHk6IDFcbiAgfSApO1xuICBjb25zdCB1dHRlcmFuY2UzID0gbmV3IFV0dGVyYW5jZSgge1xuICAgIGFsZXJ0OiAnMycsXG4gICAgcHJpb3JpdHk6IDFcbiAgfSApO1xuXG4gIGNvbnN0IHV0dGVyYW5jZTQgPSBuZXcgVXR0ZXJhbmNlKCB7XG4gICAgYWxlcnQ6ICc0JyxcbiAgICBwcmlvcml0eTogMSxcbiAgICBhbm5vdW5jZXJPcHRpb25zOiB7XG4gICAgICBjYW5jZWxPdGhlcjogZmFsc2VcbiAgICB9XG4gIH0gKTtcblxuICBjb25zdCB1dHRlcmFuY2U1ID0gbmV3IFV0dGVyYW5jZSgge1xuICAgIGFsZXJ0OiAnNScsXG4gICAgcHJpb3JpdHk6IDEsXG4gICAgYW5ub3VuY2VyT3B0aW9uczoge1xuICAgICAgY2FuY2VsT3RoZXI6IGZhbHNlXG4gICAgfVxuICB9ICk7XG5cbiAgY29uc3Qgc3BlZWNoU3ludGhlc2lzQW5ub3VuY2VyID0gbmV3IFNwZWVjaFN5bnRoZXNpc0Fubm91bmNlcigpO1xuICBzcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIuaGFzU3Bva2VuID0gdHJ1ZTsgLy8gSEFYXG5cbiAgY29uc3QgdXR0ZXJhbmNlUXVldWUgPSBuZXcgVXR0ZXJhbmNlUXVldWUoIHNwZWVjaFN5bnRoZXNpc0Fubm91bmNlciApO1xuXG4gIGFzc2VydC5vayggdXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXS5sZW5ndGggPT09IDAsICdub3RoaW5nIG1hbicgKTtcbiAgdXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCB1dHRlcmFuY2UxICk7XG5cbiAgYXNzZXJ0Lm9rKCB1dHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdLmxlbmd0aCA9PT0gMSwgJ29uZSBhZGQgdG8gYmFjaycgKTtcbiAgdXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCB1dHRlcmFuY2UyICk7XG4gIGFzc2VydC5vayggdXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXS5sZW5ndGggPT09IDIsICdvbmUgYWRkIHRvIGJhY2snICk7XG4gIHV0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggdXR0ZXJhbmNlMyApO1xuICBhc3NlcnQub2soIHV0dGVyYW5jZVF1ZXVlWyAncXVldWUnIF0ubGVuZ3RoID09PSAyLCAnb25lIGFkZCB0byBiYWNrJyApO1xuICBhc3NlcnQub2soIHV0dGVyYW5jZVF1ZXVlWyAncXVldWUnIF1bIDAgXS51dHRlcmFuY2UgPT09IHV0dGVyYW5jZTEsICdvbmUgYWRkIHRvIGJhY2snICk7XG4gIGFzc2VydC5vayggdXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXVsgMSBdLnV0dGVyYW5jZSA9PT0gdXR0ZXJhbmNlMywgJ3V0dGVyYW5jZTMgcmVtb3ZlZCB1dHRlcmFuY2UxIGJlY2F1c2UgY2FuY2VsT3RoZXI6dHJ1ZScgKTtcbiAgdXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCB1dHRlcmFuY2U0ICk7XG4gIGFzc2VydC5vayggdXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXS5sZW5ndGggPT09IDMsICdvbmUgYWRkIHRvIGJhY2snICk7XG4gIGFzc2VydC5vayggdXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXVsgMCBdLnV0dGVyYW5jZSA9PT0gdXR0ZXJhbmNlMSwgJ29uZSBhZGQgdG8gYmFjaycgKTtcbiAgYXNzZXJ0Lm9rKCB1dHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdWyAxIF0udXR0ZXJhbmNlID09PSB1dHRlcmFuY2UzLCAndXR0ZXJhbmNlMyByZW1vdmVkIHV0dGVyYW5jZTEgYmVjYXVzZSBjYW5jZWxPdGhlcjp0cnVlJyApO1xuICBhc3NlcnQub2soIHV0dGVyYW5jZVF1ZXVlWyAncXVldWUnIF1bIDIgXS51dHRlcmFuY2UgPT09IHV0dGVyYW5jZTQsICd1dHRlcmFuY2U0IGRvZXMgbm90IHJlbW92ZWQgdXR0ZXJhbmNlMyBiZWNhdXNlIGNhbmNlbE90aGVyOnRydWUnICk7XG5cbiAgdXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCB1dHRlcmFuY2U1ICk7XG5cbiAgYXNzZXJ0Lm9rKCB1dHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdLmxlbmd0aCA9PT0gNCwgJ29uZSBhZGQgdG8gYmFjaycgKTtcbiAgYXNzZXJ0Lm9rKCB1dHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdWyAwIF0udXR0ZXJhbmNlID09PSB1dHRlcmFuY2UxLCAnb25lIGFkZCB0byBiYWNrJyApO1xuICBhc3NlcnQub2soIHV0dGVyYW5jZVF1ZXVlWyAncXVldWUnIF1bIDEgXS51dHRlcmFuY2UgPT09IHV0dGVyYW5jZTMsICd1dHRlcmFuY2UzIHJlbW92ZWQgdXR0ZXJhbmNlMSBiZWNhdXNlIGNhbmNlbE90aGVyOnRydWUnICk7XG4gIGFzc2VydC5vayggdXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXVsgMiBdLnV0dGVyYW5jZSA9PT0gdXR0ZXJhbmNlNCwgJ3V0dGVyYW5jZTQgZG9lcyBub3QgcmVtb3ZlZCB1dHRlcmFuY2UzIGJlY2F1c2UgY2FuY2VsT3RoZXI6dHJ1ZScgKTtcbiAgYXNzZXJ0Lm9rKCB1dHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdWyAzIF0udXR0ZXJhbmNlID09PSB1dHRlcmFuY2U1LCAndXR0ZXJhbmNlNCBkb2VzIG5vdCByZW1vdmVkIHV0dGVyYW5jZTMgYmVjYXVzZSBjYW5jZWxPdGhlcjp0cnVlJyApO1xuXG4gIC8qKlxuICAgKiBVdHRlcmFuY2VRdWV1ZS5wcmlvcml0aXplVXR0ZXJhbmNlcygpIGhhbmRsZXMgcHJpb3JpdGl6aW5nIHV0dGVyYW5jZXMgYmVmb3JlIEFORCBhZnRlciB0aGUgY2hhbmdlZCB1dHRlcmFuY2UuIFdlIHdhbnRcbiAgICogdG8gdGVzdCBoZXJlIHRoYXQgaXQgY2FuIGhhbmRsZSB0aGF0IHdoZW4gYm90aCBuZWVkIHVwZGF0aW5nIGluIHRoZSBzYW1lIGNhbGwuIFRodXMsIGRvbid0IG5vdGlmeSBmb3Igb25lIGNhc2UsXG4gICAqIGFuZCBsZXQgdGhlIHByaW9yaXRpemF0aW9uIG9mIHRoZSBxdWV1ZSBvY2N1ciBhbGwgZHVyaW5nIG9uZSBwcmlvcml0eSBsaXN0ZW5lciBjYWxsLlxuICAgKlxuICAgKiBIQVggYWxlcnQgLSBwbGVhc2UgbWFrZSB0aGlzIHZhbHVlIGJldHdlZW4gdGhlIHV0dGVyYW5jZTQgdmFsdWUgYmVsb3cgYW5kIGFsc28gbG93ZXIgdGhhbiB1dHRlcmFuY2UxLlxuICAgKi9cbiAgKCB1dHRlcmFuY2U1LnByaW9yaXR5UHJvcGVydHkgYXMgdW5rbm93biBhcyBSZWFkT25seVByb3BlcnR5PG51bWJlcj4gKVsgJ3NldFByb3BlcnR5VmFsdWUnIF0oIDMgKTtcbiAgdXR0ZXJhbmNlNC5wcmlvcml0eVByb3BlcnR5LnZhbHVlID0gMjtcblxuICBhc3NlcnQub2soIHV0dGVyYW5jZVF1ZXVlWyAncXVldWUnIF0ubGVuZ3RoID09PSAyLCAnb25lIGFkZCB0byBiYWNrJyApO1xuICBhc3NlcnQub2soIHV0dGVyYW5jZVF1ZXVlWyAncXVldWUnIF1bIDAgXS51dHRlcmFuY2UgPT09IHV0dGVyYW5jZTEsICdvbmUgYWRkIHRvIGJhY2snICk7XG4gIGFzc2VydC5vayggdXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXVsgMSBdLnV0dGVyYW5jZSA9PT0gdXR0ZXJhbmNlNSwgJ3V0dGVyYW5jZTUga2lja2VkIHV0dGVyYW5jZTQgb3V0dGEgdGhlIHBhcmsuJyApO1xufSApO1xuXG4vLyBDVCBhbmQgc29tZSBoZWFkbGVzcyBicm93c2VycyBkb24ndCBzdXBwb3J0IFNwZWVjaFN5bnRoZXNpc1xuaWYgKCB0ZXN0Vm9pY2luZ01hbmFnZXIudm9pY2VzUHJvcGVydHkudmFsdWUgPiAwICkge1xuXG4gIFFVbml0LnRlc3QoICd1dHRlcmFuY2UuYW5ub3VuY2VyT3B0aW9ucy52b2ljZScsIGFzeW5jIGFzc2VydCA9PiB7XG5cbiAgICBjb25zdCBkb25lID0gYXNzZXJ0LmFzeW5jKCk7XG5cbiAgICB0ZXN0Vm9pY2luZ01hbmFnZXIudm9pY2VQcm9wZXJ0eS52YWx1ZSA9IG51bGw7XG5cbiAgICBjb25zdCB2b2ljZSA9IHRlc3RWb2ljaW5nTWFuYWdlci52b2ljZXNQcm9wZXJ0eS52YWx1ZVsgMCBdO1xuICAgIGNvbnN0IHV0dGVyYW5jZSA9IG5ldyBVdHRlcmFuY2UoIHtcbiAgICAgIGFsZXJ0OiAnb25lJyxcbiAgICAgIGFubm91bmNlck9wdGlvbnM6IHtcbiAgICAgICAgdm9pY2U6IHZvaWNlXG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgdGVzdFZvaWNpbmdNYW5hZ2VyLmVuZFNwZWFraW5nRW1pdHRlci5hZGRMaXN0ZW5lciggZnVuY3Rpb24gbXlMaXN0ZW5lcigpIHtcblxuICAgICAgY29uc3QgeCA9IHRlc3RWb2ljaW5nTWFuYWdlclsgJ3NwZWFraW5nU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlcicgXSE7XG4gICAgICBhc3NlcnQub2soIHgsICd3ZSBzaG91bGQgaGF2ZSBvbmUnICk7XG4gICAgICBhc3NlcnQub2soIHguc3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlLnZvaWNlID09PSB2b2ljZSwgJ3ZvaWNlIHNob3VsZCBtYXRjaCB0aGUgcHJvdmlkZWQgdXR0ZXJhbmNlXFwncycgKTtcbiAgICAgIHRlc3RWb2ljaW5nTWFuYWdlci5lbmRTcGVha2luZ0VtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIG15TGlzdGVuZXIgKTtcbiAgICAgIGRvbmUoKTtcbiAgICB9ICk7XG4gICAgdGVzdFZvaWNpbmdNYW5hZ2VyLnNwZWFrSWdub3JpbmdFbmFibGVkKCB1dHRlcmFuY2UgKTtcblxuICAgIHRlc3RWb2ljaW5nTWFuYWdlci52b2ljZVByb3BlcnR5LnZhbHVlID0gdm9pY2U7XG4gIH0gKTtcbn1cblxuXG5pZiAoIHF1ZXJ5UGFyYW1ldGVycy5tYW51YWxJbnB1dCApIHtcblxuICBRVW5pdC50ZXN0KCAnQmFzaWMgVXR0ZXJhbmNlUXVldWUgdGVzdCcsIGFzeW5jIGFzc2VydCA9PiB7XG5cbiAgICAvLyBiYXNpYyB0ZXN0LCB3ZSBzaG91bGQgaGVhciBhbGwgdGhyZWUgVXR0ZXJhbmNlc1xuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBmaXJzdFV0dGVyYW5jZSApO1xuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBzZWNvbmRVdHRlcmFuY2UgKTtcbiAgICB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggdGhpcmRVdHRlcmFuY2UgKTtcblxuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JGaXJzdFV0dGVyYW5jZSArIHRpbWVGb3JTZWNvbmRVdHRlcmFuY2UgKyB0aW1lRm9yVGhpcmRVdHRlcmFuY2UgKyBUSU1JTkdfQlVGRkVSICogMyApO1xuICAgIGFzc2VydC5vayggYWxlcnRzLmxlbmd0aCA9PT0gMywgJ1RocmVlIGJhc2ljIFV0dGVyYW5jZXMgd2VudCB0aHJvdWdoIHRoZSBxdWV1ZScgKTtcbiAgfSApO1xuXG4gIFFVbml0LnRlc3QoICdjYW5jZWxVdHRlcmFuY2UgdGVzdHMnLCBhc3luYyBhc3NlcnQgPT4ge1xuXG4gICAgLy8gVGVzdCB0aGF0IGNhbmNlbFV0dGVyYW5jZSB3aWxsIG5vdCBpbnRyb2R1Y2UgYSBtZW1vcnkgbGVhayB3aXRoIG11bHRpcGxlIGxpc3RlbmVycyBvbiB0aGUgUHJvcGVydHlcbiAgICB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggZmlyc3RVdHRlcmFuY2UgKTtcbiAgICBhd2FpdCB0aW1lb3V0KCB0aW1lRm9yRmlyc3RVdHRlcmFuY2UgLyAyICk7XG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5jYW5jZWxVdHRlcmFuY2UoIGZpcnN0VXR0ZXJhbmNlICk7XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhhdCB3ZSBoYW5kbGUgdGhlIGBlbmRgIGV2ZW50IGhhcHBlbmluZyBhc3luY2hyb25vdXNseSBmcm9tIHRoZSBjYW5jZWwsIHRoaXMgc2hvdWxkIG5vdCBjcmFzaFxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBmaXJzdFV0dGVyYW5jZSApO1xuICAgIGFzc2VydC5vayggYWxlcnRzWyAwIF0gPT09IGZpcnN0VXR0ZXJhbmNlLCAnZmlyc3RVdHRlcmFuY2Ugd2FzIGNhbmNlbGxlZCcgKTtcbiAgICBhc3NlcnQub2soIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXS5sZW5ndGggPT09IDEsICdUaGVyZSBpcyBvbmUgVXR0ZXJhbmNlIGluIHRoZSBxdWV1ZScgKTtcbiAgfSApO1xuXG4gIFFVbml0LnRlc3QoICdQcmlvcml0eVByb3BlcnR5IGludGVycnVwdGlvbicsIGFzeW5jIGFzc2VydCA9PiB7XG5cbiAgICAvLyBBZGQgYWxsIDMgdG8gYmFja1xuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBmaXJzdFV0dGVyYW5jZSApO1xuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBzZWNvbmRVdHRlcmFuY2UgKTtcbiAgICB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggdGhpcmRVdHRlcmFuY2UgKTtcblxuICAgIGFzc2VydC5vayggdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdLmxlbmd0aCA9PT0gMywgJ0FsbCB0aHJlZSB1dHRlcmFuY2VzIGluIHRoZSBxdWV1ZScgKTtcblxuICAgIC8vIG1ha2UgdGhlIHRoaXJkIFV0dGVyYW5jZSBoaWdoIHByaW9yaXR5LCBpdCBzaG91bGQgcmVtb3ZlIHRoZSBvdGhlciB0d28gVXR0ZXJhbmNlc1xuICAgIHRoaXJkVXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAyO1xuICAgIGFzc2VydC5vayggdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdLmxlbmd0aCA9PT0gMSwgJ09ubHkgdGhlIG9uZSBVdHRlcmFuY2UgcmVtYWlucycgKTtcbiAgICBhc3NlcnQub2soIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXVsgMCBdLnV0dGVyYW5jZSA9PT0gdGhpcmRVdHRlcmFuY2UsICdPbmx5IHRoZSB0aGlyZCBVdHRlcmFuY2UgcmVtYWlucycgKTtcbiAgfSApO1xuXG4gIFFVbml0LnRlc3QoICdBbm5vdW5jZWQgVXR0ZXJhbmNlIGNhbiBhbHNvIGJlIGluIHF1ZXVlIGFuZCBpbnRlcnJ1cHRpb24gZHVyaW5nIGFubm91bmNlbWVudCcsIGFzeW5jIGFzc2VydCA9PiB7XG5cbiAgICAvLyB3aGlsZSBhbiBVdHRlcmFuY2UgaXMgYmVpbmcgYW5ub3VuY2VkLCBtYWtlIHN1cmUgdGhhdCB3ZSBjYW4gYWRkIHRoZSBzYW1lIFV0dGVyYW5jZSB0byB0aGUgcXVldWUgYW5kIHRoYXRcbiAgICAvLyBwcmlvcml0eVByb3BlcnR5IGlzIHN0aWxsIG9ic2VydmVkXG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIGZpcnN0VXR0ZXJhbmNlICk7XG4gICAgYXdhaXQgdGltZW91dCggdGltZUZvckZpcnN0VXR0ZXJhbmNlIC8gMiApO1xuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBmaXJzdFV0dGVyYW5jZSApO1xuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBzZWNvbmRVdHRlcmFuY2UgKTtcbiAgICBhd2FpdCB0aW1lb3V0KCB0aW1lRm9yRmlyc3RVdHRlcmFuY2UgKTsgLy8gVGltZSB0byBnZXQgaGFsZndheSB0aHJvdWdoIHNlY29uZCBhbm5vdW5jZW1lbnQgb2YgZmlyc3RVdHRlcmFuY2VcblxuICAgIC8vIHJlZHVjZSBwcmlvcml0eVByb3BlcnR5IG9mIGZpcnN0VXR0ZXJhbmNlIHdoaWxlIGl0IGlzIGJlaW5nIGFubm91bmNlZCwgc2Vjb25kVXR0ZXJhbmNlIHNob3VsZCBpbnRlcnJ1cHRcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVxdWlyZS1hdG9taWMtdXBkYXRlc1xuICAgIGZpcnN0VXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAwO1xuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JTZWNvbmRVdHRlcmFuY2UgLyAyICk7XG4gICAgYXNzZXJ0Lm9rKCBnZXRTcGVha2luZ1V0dGVyYW5jZSgpID09PSBzZWNvbmRVdHRlcmFuY2UsICdVdHRlcmFuY2UgYmVpbmcgYW5ub3VuY2VkIHN0aWxsIG9ic2VydmVzIHByaW9yaXR5UHJvcGVydHknICk7XG4gICAgYXNzZXJ0Lm9rKCB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlWyAncXVldWUnIF0ubGVuZ3RoID09PSAwLCAncXVldWUgZW1wdHkgYWZ0ZXIgaW50ZXJydXB0aW9uIGFuZCBzZW5kaW5nIHNlY29uZFV0dGVyYW5jZSB0byBBbm5vdW5jZXInICk7XG4gIH0gKTtcblxuICBRVW5pdC50ZXN0KCAnSGlnaGVyIHByaW9yaXR5IHJlbW92ZXMgZWFybGllciBVdHRlcmFuY2VzIGZyb20gcXVldWUnLCBhc3luYyBhc3NlcnQgPT4ge1xuXG4gICAgLy8gVW5pdCB0ZXN0IGNhc2VzIHRha2VuIGZyb20gZXhhbXBsZXMgdGhhdCBkZW1vbnN0cmF0ZWQgdGhlIHByaW9yaXR5UHJvcGVydHkgZmVhdHVyZSBpblxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy91dHRlcmFuY2UtcXVldWUvaXNzdWVzLzUwXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vIEFkZCBhbGwgMyB0byBiYWNrXG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIGZpcnN0VXR0ZXJhbmNlICk7XG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHNlY29uZFV0dGVyYW5jZSApO1xuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCB0aGlyZFV0dGVyYW5jZSApO1xuICAgIGFzc2VydC5vayggdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdLmxlbmd0aCA9PT0gMywgJ0FsbCB0aHJlZSB1dHRlcmFuY2VzIGluIHRoZSBxdWV1ZScgKTtcblxuICAgIHNlY29uZFV0dGVyYW5jZS5wcmlvcml0eVByb3BlcnR5LnZhbHVlID0gMjtcblxuICAgIC8vIGVub3VnaCB0aW1lIGZvciB0aGUgc2Vjb25kVXR0ZXJhbmNlIHRvIHN0YXJ0IHNwZWFraW5nIHdoaWxlIHRoZSBmaXJzdFV0dGVyYW5jZSB3YXMganVzdCByZW1vdmVkIGZyb20gdGhlIHF1ZXVlXG4gICAgYXdhaXQgdGltZW91dCggdGltZUZvclNlY29uZFV0dGVyYW5jZSAvIDIgKTtcbiAgICBhc3NlcnQub2soIGdldFNwZWFraW5nVXR0ZXJhbmNlKCkgPT09IHNlY29uZFV0dGVyYW5jZSwgJ1RoZSBzZWNvbmRVdHRlcmFuY2UgaW50ZXJydXB0ZWQgdGhlIGZpcnN0VXR0ZXJhbmNlIGJlY2F1c2UgaXQgaXMgaGlnaGVyIHByaW9yaXR5LicgKTtcblxuICAgIC8vIGVub3VnaCB0aW1lIHRvIGZpbmlzaCB0aGUgc2Vjb25kVXR0ZXJhbmNlIGFuZCBzdGFydCBzcGVha2luZyB0aGUgdGhpcmRVdHRlcmFuY2VcbiAgICBhd2FpdCB0aW1lb3V0KCB0aW1lRm9yU2Vjb25kVXR0ZXJhbmNlIC8gMiArIHRpbWVGb3JUaGlyZFV0dGVyYW5jZSAvIDIgKTtcbiAgICBhc3NlcnQub2soIGFsZXJ0c1sgMCBdID09PSBzZWNvbmRVdHRlcmFuY2UsICdzZWNvbmRVdHRlcmFuY2Ugc3Bva2VuIGluIGZ1bGwnICk7XG4gICAgYXNzZXJ0Lm9rKCBnZXRTcGVha2luZ1V0dGVyYW5jZSgpID09PSB0aGlyZFV0dGVyYW5jZSwgJ3RoaXJkVXR0ZXJhbmNlIHNwb2tlbiBhZnRlciBzZWNvbmRVdHRlcmFuY2UgZmluaXNoZWQnICk7XG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgfSApO1xuXG4gIFFVbml0LnRlc3QoICdVdHRlcmFuY2UgcmVtb3ZlZCBiZWNhdXNlIG9mIHNlbGYgcHJpb3JpdHkgcmVkdWN0aW9uIGJlZm9yZSBhbm90aGVyIGlzIGFkZGVkIHRvIHF1ZXVlJywgYXN5bmMgYXNzZXJ0ID0+IHtcblxuICAgIGZpcnN0VXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAxMDtcbiAgICB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggZmlyc3RVdHRlcmFuY2UgKTtcblxuICAgIC8vIHJlZHVjZSBwcmlvcml0eVByb3BlcnR5IGJlZm9yZSBhZGRpbmcgdGhpcmRVdHRlcmFuY2UgdG8gcXVldWVcbiAgICBmaXJzdFV0dGVyYW5jZS5wcmlvcml0eVByb3BlcnR5LnZhbHVlID0gMDtcbiAgICB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggdGhpcmRVdHRlcmFuY2UgKTtcblxuICAgIC8vIGVub3VnaCB0aW1lIHRvIHN0YXJ0IHNwZWFraW5nIGVpdGhlciB0aGUgZmlyc3Qgb3IgdGhpcmQgVXR0ZXJhbmNlc1xuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JGaXJzdFV0dGVyYW5jZSAvIDIgKTtcbiAgICBhc3NlcnQub2soIGdldFNwZWFraW5nVXR0ZXJhbmNlKCkgPT09IHRoaXJkVXR0ZXJhbmNlLCAndGhpcmRVdHRlcmFuY2Ugc3Bva2VuIGJlY2F1c2UgZmlyc3RVdHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eSB3YXMgcmVkdWNlZCBiZWZvcmUgYWRkaW5nIHRoaXJkVXR0ZXJhbmNlIHRvIHRoZSBxdWV1ZScgKTtcbiAgfSApO1xuXG4gIFFVbml0LnRlc3QoICdVdHRlcmFuY2UgcmVtb3ZlZCBiZWNhdXNlIG9mIHNlbGYgcHJpb3JpdHkgcmVkdWN0aW9uIGFmdGVyIGFub3RoZXIgaXMgYWRkZWQgdG8gcXVldWUnLCBhc3luYyBhc3NlcnQgPT4ge1xuXG4gICAgZmlyc3RVdHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSA9IDEwO1xuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBmaXJzdFV0dGVyYW5jZSApO1xuXG4gICAgLy8gcmVkdWNlIHByaW9yaXR5UHJvcGVydHkgQUZURVIgYWRkaW5nIHRoaXJkVXR0ZXJhbmNlIHRvIHF1ZXVlXG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHRoaXJkVXR0ZXJhbmNlICk7XG4gICAgZmlyc3RVdHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSA9IDA7XG5cbiAgICAvLyBlbm91Z2ggdGltZSB0byBzdGFydCBzcGVha2luZyBlaXRoZXIgdGhlIGZpcnN0IG9yIHRoaXJkIFV0dGVyYW5jZXNcbiAgICBhd2FpdCB0aW1lb3V0KCB0aW1lRm9yRmlyc3RVdHRlcmFuY2UgLyAyICk7XG4gICAgYXNzZXJ0Lm9rKCBnZXRTcGVha2luZ1V0dGVyYW5jZSgpID09PSB0aGlyZFV0dGVyYW5jZSwgJ3RoaXJkVXR0ZXJhbmNlIHNwb2tlbiBiZWNhdXNlIGZpcnN0VXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkgd2FzIHJlZHVjZWQgYWZ0ZXIgYWRkaW5nIHRoaXJkVXR0ZXJhbmNlIHRvIHRoZSBxdWV1ZScgKTtcbiAgfSApO1xuXG4gIFFVbml0LnRlc3QoICdVdHRlcmFuY2UgaW50ZXJydXB0aW9uIGJlY2F1c2Ugc2VsZiBwcmlvcml0eSByZWR1Y2VkIHdoaWxlIGJlaW5nIGFubm91bmNlZCcsIGFzeW5jIGFzc2VydCA9PiB7XG5cbiAgICBmaXJzdFV0dGVyYW5jZS5wcmlvcml0eVByb3BlcnR5LnZhbHVlID0gMTA7XG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIGZpcnN0VXR0ZXJhbmNlICk7XG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHRoaXJkVXR0ZXJhbmNlICk7XG5cbiAgICBhd2FpdCB0aW1lb3V0KCB0aW1lRm9yRmlyc3RVdHRlcmFuY2UgLyAyICk7XG4gICAgYXNzZXJ0Lm9rKCBnZXRTcGVha2luZ1V0dGVyYW5jZSgpID09PSBmaXJzdFV0dGVyYW5jZSApO1xuXG4gICAgLy8gcmVkdWNpbmcgcHJpb3JpdHkgYmVsb3cgdGhpcmQgdXR0ZXJhbmNlIHNob3VsZCBpbnRlcnJ1cHQgZmlyc3RVdHRlcmFuY2UgZm9yIHRoaXJkVXR0ZXJhbmNlXG4gICAgZmlyc3RVdHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSA9IDA7XG5cbiAgICAvLyBub3QgZW5vdWdoIHRpbWUgZm9yIGZpcnN0VXR0ZXJhbmNlIHRvIGZpbmlzaCBpbiBmdWxsLCBidXQgZW5vdWdoIHRpbWUgdG8gdmVyaWZ5IHRoYXQgaXQgd2FzIGludGVycnVwdGVkXG4gICAgYXdhaXQgdGltZW91dCggdGltZUZvckZpcnN0VXR0ZXJhbmNlIC8gNCApO1xuICAgIGFzc2VydC5vayggYWxlcnRzWyAwIF0gPT09IGZpcnN0VXR0ZXJhbmNlLCAnZmlyc3RVdHRlcmFuY2Ugd2FzIGludGVycnVwdGVkIGJlY2F1c2UgaXRzIHByaW9yaXR5IHdhcyByZWR1Y2VkIHdoaWxlIGl0IHdhcyBiZWluZyBhbm5vdW5jZWQnICk7XG5cbiAgICAvLyBlbm91Z2ggdGltZSBmb3IgdGhpcmRVdHRlcmFuY2UgdG8gc3RhcnQgc3BlYWtpbmdcbiAgICBhd2FpdCB0aW1lb3V0KCB0aW1lRm9yVGhpcmRVdHRlcmFuY2UgLyAyICk7XG4gICAgYXNzZXJ0Lm9rKCBnZXRTcGVha2luZ1V0dGVyYW5jZSgpID09PSB0aGlyZFV0dGVyYW5jZSwgJ3RoaXJkVXR0ZXJhbmNlIGJlaW5nIGFubm91bmNlZCBhZnRlciBpbnRlcnJ1cHRpbmcgZmlyc3RVdHRlcmFuY2UnICk7XG4gIH0gKTtcblxuICBRVW5pdC50ZXN0KCAnVXR0ZXJhbmNlIGludGVycnVwdGlvbiBkdXJpbmcgYW5ub3VtY2VtZW50IGJlY2F1c2UgYW5vdGhlciBpbiB0aGUgcXVldWUgbWFkZSBoaWdoZXIgcHJpb3JpdHknLCBhc3luYyBhc3NlcnQgPT4ge1xuXG4gICAgZmlyc3RVdHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSA9IDA7XG4gICAgdGhpcmRVdHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSA9IDA7XG5cbiAgICB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggZmlyc3RVdHRlcmFuY2UgKTtcbiAgICB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggdGhpcmRVdHRlcmFuY2UgKTtcblxuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JGaXJzdFV0dGVyYW5jZSAvIDIgKTtcbiAgICBhc3NlcnQub2soIGdldFNwZWFraW5nVXR0ZXJhbmNlKCkgPT09IGZpcnN0VXR0ZXJhbmNlLCAnZmlyc3RVdHRlcmFuY2UgYmVpbmcgYW5ub3VuY2VkJyApO1xuXG4gICAgLy8gaW5jcmVhc2luZyBwcmlvcml0eSBvZiB0aGlyZFV0dGVyYW5jZSBpbiB0aGUgcXVldWUgc2hvdWxkIGludGVycnVwdCBmaXJzdFV0dGVyYW5jZSBiZWluZyBhbm5vdW5jZWRcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVxdWlyZS1hdG9taWMtdXBkYXRlc1xuICAgIHRoaXJkVXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAzO1xuXG4gICAgLy8gbm90IGVub3VnaCB0aW1lIGZvciBmaXJzdFV0dGVyYW5jZSB0byBmaW5pc2gsIGJ1dCBlbm91Z2ggdG8gbWFrZSBzdXJlIHRoYXQgaXQgd2FzIGludGVycnVwdGVkXG4gICAgYXdhaXQgdGltZW91dCggdGltZUZvckZpcnN0VXR0ZXJhbmNlIC8gNCApO1xuICAgIGFzc2VydC5vayggYWxlcnRzWyAwIF0gPT09IGZpcnN0VXR0ZXJhbmNlLCAnZmlyc3RVdHRlcmFuY2Ugd2FzIGludGVycnVwdGVkIGJlY2F1c2UgYW4gVXR0ZXJhbmNlIGluIHRoZSBxdWV1ZSB3YXMgbWFkZSBoaWdoZXIgcHJpb3JpdHknICk7XG5cbiAgICAvLyBlbm91Z2ggdGltZSBmb3IgdGhpcmRVdHRlcmFuY2UgdG8gc3RhcnQgc3BlYWtpbmdcbiAgICBhd2FpdCB0aW1lb3V0KCB0aW1lRm9yVGhpcmRVdHRlcmFuY2UgLyAyICk7XG4gICAgYXNzZXJ0Lm9rKCBnZXRTcGVha2luZ1V0dGVyYW5jZSgpID09PSB0aGlyZFV0dGVyYW5jZSwgJ3RoaXJkVXR0ZXJhbmNlIGJlaW5nIGFubm91bmNlZCBhZnRlciBpbnRlcnJ1cHRpbmcgZmlyc3RVdHRlcmFuY2UnICk7XG4gIH0gKTtcblxuICBRVW5pdC50ZXN0KCAnVXR0ZXJhbmNlIE5PVCBpbnRlcnJ1cHRlZCBiZWNhdXNlIHNlbGYgcHJpb3JpdHkgc3RpbGwgcmVsYXRpdmVseSBoaWdoZXInLCBhc3luYyBhc3NlcnQgPT4ge1xuXG4gICAgZmlyc3RVdHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSA9IDEwO1xuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBmaXJzdFV0dGVyYW5jZSApO1xuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCB0aGlyZFV0dGVyYW5jZSApO1xuXG4gICAgYXdhaXQgdGltZW91dCggdGltZUZvckZpcnN0VXR0ZXJhbmNlIC8gMiApO1xuXG4gICAgLy8gd2Ugc2hvdWxkIHN0aWxsIGhlYXIgYm90aCBVdHRlcmFuY2VzIGluIGZ1bGwsIG5ldyBwcmlvcml0eSBmb3IgZmlyc3RVdHRlcmFuY2UgaXMgaGlnaGVyIHRoYW4gdGhpcmRVdHRlcmFuY2VcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVxdWlyZS1hdG9taWMtdXBkYXRlc1xuICAgIGZpcnN0VXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSA1O1xuXG4gICAgLy8gbm90IGVub3VnaCB0aW1lIGZvciBmaXJzdFV0dGVyYW5jZSB0byBmaW5pc2gsIGJ1dCBlbm91Z2ggdG8gbWFrZSBzdXJlIHRoYXQgaXQgd2FzIG5vdCBpbnRlcnJ1cHRlZFxuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JGaXJzdFV0dGVyYW5jZSAvIDEwICk7XG4gICAgYXNzZXJ0Lm9rKCBhbGVydHMubGVuZ3RoID09PSAwLCAnZmlyc3RVdHRlcmFuY2Ugd2FzIG5vdCBpbnRlcnJ1cHRlZCBiZWNhdXNlIHByaW9yaXR5IHdhcyBzZXQgdG8gYSB2YWx1ZSBoaWdoZXIgdGhhbiBuZXh0IHV0dGVyYW5jZSBpbiBxdWV1ZScgKTtcblxuICAgIC8vIGVub3VnaCB0aW1lIGZvciB0aGlyZFV0dGVyYW5jZSB0byBzdGFydCBzcGVha2luZyBhZnRlciBmaXJzdFV0dGVyYW5jZSBmaW5pc2hlc1xuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JUaGlyZFV0dGVyYW5jZSAvIDIgKyB0aW1lRm9yRmlyc3RVdHRlcmFuY2UgLyAyICk7XG4gICAgYXNzZXJ0Lm9rKCBhbGVydHNbIDAgXSA9PT0gZmlyc3RVdHRlcmFuY2UsICdmaXJzdFV0dGVyYW5jZSBmaW5pc2hlZCBiZWluZyBhbm5vdW5jZWQnICk7XG4gICAgYXNzZXJ0Lm9rKCBnZXRTcGVha2luZ1V0dGVyYW5jZSgpID09PSB0aGlyZFV0dGVyYW5jZSwgJ3RoaXJkVXR0ZXJhbmNlIGJlaW5nIGFubm91bmNlZCBhZnRlciB3YWl0aW5nIGZvciBmaXJzdFV0dGVyYW5jZScgKTtcbiAgfSApO1xuXG4gIFFVbml0LnRlc3QoICdhbm5vdW5jZUltbWVkaWF0ZWx5JywgYXN5bmMgYXNzZXJ0ID0+IHtcblxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYW5ub3VuY2VJbW1lZGlhdGVseSggZmlyc3RVdHRlcmFuY2UgKTtcbiAgICBhc3NlcnQub2soIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXS5sZW5ndGggPT09IDAsICdhbm5vdW5jZUltbWVkaWF0ZWx5IHNob3VsZCBiZSBzeW5jaHJvbm91cyB3aXRoIHZvaWNpbmdNYW5hZ2VyIGZvciBhbiBlbXB0eSBxdWV1ZScgKTtcblxuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JGaXJzdFV0dGVyYW5jZSAvIDIgKTtcbiAgICBhc3NlcnQub2soIGdldFNwZWFraW5nVXR0ZXJhbmNlKCkgPT09IGZpcnN0VXR0ZXJhbmNlLCAnZmlyc3QgdXR0ZXJhbmNlIHNwb2tlbiBpbW1lZGlhdGVseScgKTtcbiAgfSApO1xuXG4gIFFVbml0LnRlc3QoICdhbm5vdW5jZUltbWVkaWF0ZWx5IHJlZHVjZXMgZHVwbGljYXRlIFV0dGVyYW5jZXMgaW4gcXVldWUnLCBhc3luYyBhc3NlcnQgPT4ge1xuXG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIGZpcnN0VXR0ZXJhbmNlICk7XG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHNlY29uZFV0dGVyYW5jZSApO1xuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCB0aGlyZFV0dGVyYW5jZSApO1xuXG4gICAgLy8gbm93IHNwZWFrIHRoZSBmaXJzdCB1dHRlcmFuY2UgaW1tZWRpYXRlbHlcbiAgICB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmFubm91bmNlSW1tZWRpYXRlbHkoIGZpcnN0VXR0ZXJhbmNlICk7XG5cbiAgICBhd2FpdCB0aW1lb3V0KCB0aW1lRm9yRmlyc3RVdHRlcmFuY2UgLyAyICk7XG4gICAgYXNzZXJ0Lm9rKCB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlWyAncXVldWUnIF0ubGVuZ3RoID09PSAyLCAnYW5ub3VuY2luZyBmaXJzdFV0dGVyYW5jZSBpbW1lZGlhdGVseSBzaG91bGQgcmVtb3ZlIHRoZSBkdXBsaWNhdGUgZmlyc3RVdHRlcmFuY2UgaW4gdGhlIHF1ZXVlJyApO1xuICAgIGFzc2VydC5vayggZ2V0U3BlYWtpbmdVdHRlcmFuY2UoKSA9PT0gZmlyc3RVdHRlcmFuY2UsICdmaXJzdCB1dHRlcmFuY2UgaXMgYmVpbmcgc3Bva2VuIGFmdGVyIGFubm91bmNlSW1tZWRpYXRlbHknICk7XG4gIH0gKTtcblxuICBRVW5pdC50ZXN0KCAnYW5ub3VuY2VJbW1lZGlhdGVseSBkb2VzIG5vdGhpbmcgd2hlbiBVdHRlcmFuY2UgaGFzIGxvdyBwcmlvcml0eSByZWxhdGl2ZSB0byBxdWV1ZWQgVXR0ZXJhbmNlcycsIGFzeW5jIGFzc2VydCA9PiB7XG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIGZpcnN0VXR0ZXJhbmNlICk7XG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHNlY29uZFV0dGVyYW5jZSApO1xuXG4gICAgZmlyc3RVdHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSA9IDI7XG4gICAgdGhpcmRVdHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSA9IDE7XG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hbm5vdW5jZUltbWVkaWF0ZWx5KCB0aGlyZFV0dGVyYW5jZSApO1xuXG4gICAgLy8gdGhpcmRVdHRlcmFuY2UgaXMgbG93ZXIgcHJpb3JpdHkgdGhhbiBuZXh0IGl0ZW0gaW4gdGhlIHF1ZXVlLCBpdCBzaG91bGQgbm90IGJlIHNwb2tlbiBhbmQgc2hvdWxkIG5vdCBiZVxuICAgIC8vIGluIHRoZSBxdWV1ZSBhdCBhbGxcbiAgICBhc3NlcnQub2soIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXS5sZW5ndGggPT09IDIsICdvbmx5IGZpcnN0IGFuZCBzZWNvbmQgdXR0ZXJhbmNlcyBpbiB0aGUgcXVldWUnICk7XG4gICAgYXNzZXJ0Lm9rKCAhdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5oYXNVdHRlcmFuY2UoIHRoaXJkVXR0ZXJhbmNlICksICd0aGlyZFV0dGVyYW5jZSBub3QgaW4gcXVldWUgYWZ0ZXIgYW5ub3VuY2VJbW1lZGlhdGVseScgKTtcblxuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JGaXJzdFV0dGVyYW5jZSAvIDIgKTtcbiAgICBhc3NlcnQub2soIGdldFNwZWFraW5nVXR0ZXJhbmNlKCkgPT09IGZpcnN0VXR0ZXJhbmNlICk7XG4gICAgYXNzZXJ0Lm9rKCBhbGVydHNbIDAgXSAhPT0gdGhpcmRVdHRlcmFuY2UsICd0aGlyZFV0dGVyYW5jZSB3YXMgbm90IHNwb2tlbiB3aXRoIGFubm91bmNlSW1tZWRpYXRlbHknICk7XG4gIH0gKTtcblxuICBRVW5pdC50ZXN0KCAnYW5vdW5jZUltbWVkaWF0ZWxldHkgZG9lcyBub3RoaW5nIHdoZW4gVXR0ZXJhbmNlIGhhcyBsb3cgcHJpb3JpdHkgcmVsYXRpdmUgdG8gYW5ub3VuY2luZyBVdHRlcmFuY2UnLCBhc3luYyBhc3NlcnQgPT4ge1xuICAgIGZpcnN0VXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAxO1xuICAgIHRoaXJkVXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAxO1xuXG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIGZpcnN0VXR0ZXJhbmNlICk7XG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHNlY29uZFV0dGVyYW5jZSApO1xuXG4gICAgZmlyc3RVdHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSA9IDI7XG4gICAgdGhpcmRVdHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSA9IDE7XG5cbiAgICBhd2FpdCB0aW1lb3V0KCB0aW1lRm9yRmlyc3RVdHRlcmFuY2UgLyAyICk7XG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hbm5vdW5jZUltbWVkaWF0ZWx5KCB0aGlyZFV0dGVyYW5jZSApO1xuXG4gICAgLy8gdGhpcmRVdHRlcmFuY2UgaXMgbG93ZXIgcHJpb3JpdHkgdGhhbiB3aGF0IGlzIGN1cnJlbnRseSBiZWluZyBzcG9rZW4gc28gaXQgc2hvdWxkIE5PVCBiZSBoZWFyZFxuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JGaXJzdFV0dGVyYW5jZSAvIDQgKTsgLy8gbGVzcyB0aGFuIHJlbWFpbmluZyB0aW1lIGZvciBmaXJzdFV0dGVyYW5jZSBjaGVja2luZyBmb3IgaW50ZXJydXB0aW9uXG4gICAgYXNzZXJ0Lm9rKCBnZXRTcGVha2luZ1V0dGVyYW5jZSgpICE9PSB0aGlyZFV0dGVyYW5jZSwgJ2Fubm91bmNlSW1tZWRpYXRlbHkgc2hvdWxkIG5vdCBpbnRlcnJ1cHQgYSBoaWdoZXIgcHJpb3JpdHkgdXR0ZXJhbmNlJyApO1xuICAgIGFzc2VydC5vayggIXRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuaGFzVXR0ZXJhbmNlKCB0aGlyZFV0dGVyYW5jZSApLCAnbG93ZXIgcHJpb3JpdHkgdGhpcmRVdHRlcmFuY2Ugc2hvdWxkIGJlIGRyb3BwZWQgZnJvbSB0aGUgcXVldWUnICk7XG4gIH0gKTtcblxuICBRVW5pdC50ZXN0KCAnVXR0ZXJhbmNlIHNwb2tlbiB3aXRoIGFubm91bmNlSW1tZWRpYXRlbHkgc2hvdWxkIGJlIGludGVycnVwdGVkIGlmIHByaW9yaXR5IGlzIHJlZHVjZWQnLCBhc3luYyBhc3NlcnQgPT4ge1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIFRoZSBVdHRlcmFuY2Ugc3Bva2VuIHdpdGggYW5ub3VuY2VJbW1lZGlhdGVseSBzaG91bGQgYmUgaW50ZXJydXB0ZWQgaWYgaXRzIHByaW9yaXR5IGlzIHJlZHVjZWRcbiAgICAvLyBiZWxvdyBhbm90aGVyIGl0ZW0gaW4gdGhlIHF1ZXVlXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGZpcnN0VXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAyO1xuICAgIHRoaXJkVXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAyO1xuXG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIGZpcnN0VXR0ZXJhbmNlICk7XG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHNlY29uZFV0dGVyYW5jZSApO1xuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYW5ub3VuY2VJbW1lZGlhdGVseSggdGhpcmRVdHRlcmFuY2UgKTtcblxuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JUaGlyZFV0dGVyYW5jZSAvIDIgKTtcbiAgICBhc3NlcnQub2soIGdldFNwZWFraW5nVXR0ZXJhbmNlKCkgPT09IHRoaXJkVXR0ZXJhbmNlLCAndGhpcmRVdHRlcmFuY2UgaXMgYW5ub3VuY2VkIGltbWVkaWF0ZWx5JyApO1xuXG4gICAgdGhpcmRVdHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSA9IDE7XG5cbiAgICAvLyB0aGUgcHJpb3JpdHkgb2YgdGhlIHRoaXJkVXR0ZXJhbmNlIGlzIHJlZHVjZWQgd2hpbGUgYmVpbmcgc3Bva2VuIGZyb20gYW5ub3VuY2VJbW1lZGlhdGVseSwgaXQgc2hvdWxkIGJlXG4gICAgLy8gaW50ZXJydXB0ZWQgYW5kIHRoZSBuZXh0IGl0ZW0gaW4gdGhlIHF1ZXVlIHNob3VsZCBiZSBzcG9rZW5cbiAgICBhd2FpdCB0aW1lb3V0KCB0aW1lRm9yVGhpcmRVdHRlcmFuY2UgLyA0ICk7IC8vIGxlc3MgdGhhbiB0aGUgcmVtYWluaW5nIHRpbWUgZm9yIHRoaXJkIHV0dGVyYW5jZSBmb3IgaW50ZXJydXB0aW9uXG4gICAgYXNzZXJ0Lm9rKCBhbGVydHNbIDAgXSA9PT0gdGhpcmRVdHRlcmFuY2UsICd0aGlyZCB1dHRlcmFuY2Ugd2FzIGludGVycnVwdGVkIGJ5IHJlZHVjaW5nIGl0cyBwcmlvcml0eScgKTtcblxuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JGaXJzdFV0dGVyYW5jZSAvIDIgKTtcbiAgICBhc3NlcnQub2soIGdldFNwZWFraW5nVXR0ZXJhbmNlKCkgPT09IGZpcnN0VXR0ZXJhbmNlLCAnbW92ZWQgb24gdG8gbmV4dCB1dHRlcmFuY2UgaW4gcXVldWUnICk7XG4gIH0gKTtcblxuICBRVW5pdC50ZXN0KCAnVXR0ZXJhbmNlIHNwb2tlbiBieSBhbm5vdW5jZUltbWVkaWF0ZWx5IGlzIGludGVycnVwdGVkIGJ5IHJhaXNpbmcgcHJpb3JpdHkgb2YgcXVldWVkIHV0dGVyYW5jZScsIGFzeW5jIGFzc2VydCA9PiB7XG4gICAgZmlyc3RVdHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSA9IDE7XG4gICAgdGhpcmRVdHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSA9IDE7XG5cbiAgICB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggZmlyc3RVdHRlcmFuY2UgKTtcbiAgICB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggc2Vjb25kVXR0ZXJhbmNlICk7XG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hbm5vdW5jZUltbWVkaWF0ZWx5KCB0aGlyZFV0dGVyYW5jZSApO1xuXG4gICAgYXdhaXQgdGltZW91dCggdGltZUZvclRoaXJkVXR0ZXJhbmNlIC8gMiApO1xuICAgIGFzc2VydC5vayggZ2V0U3BlYWtpbmdVdHRlcmFuY2UoKSA9PT0gdGhpcmRVdHRlcmFuY2UsICd0aGlyZFV0dGVyYW5jZSBpcyBhbm5vdW5jZWQgaW1tZWRpYXRlbHknICk7XG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVxdWlyZS1hdG9taWMtdXBkYXRlc1xuICAgIGZpcnN0VXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAyO1xuXG4gICAgLy8gdGhlIHByaW9yaXR5IG9mIGZpcnN0VXR0ZXJhbmNlIGlzIGluY3JlYXNlZCBzbyB0aGUgdXR0ZXJhbmNlIG9mIGFubm91bmNlSW1tZWRpYXRlbHkgc2hvdWxkIGJlIGludGVycnVwdGVkXG4gICAgYXdhaXQgdGltZW91dCggdGltZUZvclRoaXJkVXR0ZXJhbmNlIC8gNCApOyAvLyBsZXNzIHRoYW4gcmVtYWluaW5nIHRpbWUgZm9yIHRoaXJkIHV0dGVyYW5jZSBmb3IgaW50ZXJydXB0aW9uXG4gICAgYXNzZXJ0Lm9rKCBhbGVydHNbIDAgXSA9PT0gdGhpcmRVdHRlcmFuY2UsICd0aGlyZCB1dHRlcmFuY2Ugd2FzIGludGVycnVwdGVkIGJ5IHRoZSBuZXh0IFV0dGVyYW5jZSBpbmNyZWFzaW5nIHByaW9yaXR5JyApO1xuXG4gICAgYXdhaXQgdGltZW91dCggdGltZUZvckZpcnN0VXR0ZXJhbmNlIC8gMiApO1xuICAgIGFzc2VydC5vayggZ2V0U3BlYWtpbmdVdHRlcmFuY2UoKSA9PT0gZmlyc3RVdHRlcmFuY2UsICdtb3ZlZCBvbiB0byBoaWdoZXIgcHJpb3JpdHkgdXR0ZXJhbmNlIGluIHF1ZXVlJyApO1xuICB9ICk7XG5cbiAgUVVuaXQudGVzdCggJ2Fubm91bmNlSW1tZWRpYXRlbHkgaW50ZXJydXB0cyBhbm90aGVyIFV0dGVyYW5jZSBpZiBuZXcgVXR0ZXJhbmNlIGlzIGhpZ2ggcHJpb3JpdHknLCBhc3luYyBhc3NlcnQgPT4ge1xuICAgIGZpcnN0VXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAxO1xuICAgIHRoaXJkVXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAyO1xuXG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIGZpcnN0VXR0ZXJhbmNlICk7XG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHNlY29uZFV0dGVyYW5jZSApO1xuXG4gICAgYXdhaXQgdGltZW91dCggdGltZUZvckZpcnN0VXR0ZXJhbmNlIC8gMiApO1xuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYW5ub3VuY2VJbW1lZGlhdGVseSggdGhpcmRVdHRlcmFuY2UgKTtcblxuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JGaXJzdFV0dGVyYW5jZSAvIDQgKTsgLy8gc2hvdWxkIG5vdCBiZSBlbm91Z2ggdGltZSBmb3IgZmlyc3RVdHRlcmFuY2UgdG8gZmluaXNoXG4gICAgYXNzZXJ0Lm9rKCBhbGVydHNbIDAgXSA9PT0gZmlyc3RVdHRlcmFuY2UsICdmaXJzdFV0dGVyYW5jZSBpbnRlcnJ1cHRlZCBiZWNhdXNlIGl0IGhhZCBsb3dlciBwcmlvcml0eScgKTtcblxuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JUaGlyZFV0dGVyYW5jZSAvIDIgKTtcbiAgICBhc3NlcnQub2soIGdldFNwZWFraW5nVXR0ZXJhbmNlKCkgPT09IHRoaXJkVXR0ZXJhbmNlLCAndGhpcmRVdHRlcmFuY2Ugc3Bva2VuIGltbWVkaWF0ZWx5JyApO1xuICB9ICk7XG5cbiAgUVVuaXQudGVzdCggJ2Fubm91bmNlSW1tZWRpYXRlbHkgd2lsbCBub3QgaW50ZXJydXB0IFV0dGVyYW5jZSBvZiBlcXVhbCBvciBsZXNzZXIgcHJpb3JpdHkgJywgYXN5bmMgYXNzZXJ0ID0+IHtcbiAgICBmaXJzdFV0dGVyYW5jZS5wcmlvcml0eVByb3BlcnR5LnZhbHVlID0gMTtcbiAgICB0aGlyZFV0dGVyYW5jZS5wcmlvcml0eVByb3BlcnR5LnZhbHVlID0gMTtcblxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBmaXJzdFV0dGVyYW5jZSApO1xuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBzZWNvbmRVdHRlcmFuY2UgKTtcblxuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JGaXJzdFV0dGVyYW5jZSAvIDIgKTtcbiAgICB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmFubm91bmNlSW1tZWRpYXRlbHkoIHRoaXJkVXR0ZXJhbmNlICk7XG5cbiAgICBhd2FpdCB0aW1lb3V0KCB0aW1lRm9yRmlyc3RVdHRlcmFuY2UgLyA0ICk7XG4gICAgYXNzZXJ0Lm9rKCBnZXRTcGVha2luZ1V0dGVyYW5jZSgpID09PSBmaXJzdFV0dGVyYW5jZSwgJ2ZpcnN0VXR0ZXJhbmNlIG5vdCBpbnRlcnJ1cHRlZCwgaXQgaGFzIGVxdWFsIHByaW9yaXR5JyApO1xuICAgIGFzc2VydC5vayggdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdWyAwIF0udXR0ZXJhbmNlID09PSBzZWNvbmRVdHRlcmFuY2UsICd0aGlyZFV0dGVyYW5jZSB3YXMgYWRkZWQgdG8gdGhlIGZyb250IG9mIHRoZSBxdWV1ZScgKTtcbiAgICBhc3NlcnQub2soIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXS5sZW5ndGggPT09IDEsICd0aGlyZFV0dGVyYW5jZSB3YXMgbm90IGFkZGVkIHRvIHF1ZXVlIGFuZCB3aWxsIG5ldmVyIGJlIGFubm91bmNlZCcgKTtcblxuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JGaXJzdFV0dGVyYW5jZSAvIDQgKyB0aW1lRm9yVGhpcmRVdHRlcmFuY2UgLyAyICk7XG4gICAgYXNzZXJ0Lm9rKCBhbGVydHNbIDAgXSA9PT0gZmlyc3RVdHRlcmFuY2UsICdmaXJzdFV0dGVyYW5jZSBzcG9rZW4gaW4gZnVsbCcgKTtcbiAgfSApO1xufSJdLCJuYW1lcyI6WyJzdGVwVGltZXIiLCJEaXNwbGF5Iiwidm9pY2luZ01hbmFnZXIiLCJyZXNwb25zZUNvbGxlY3RvciIsIlNwZWVjaFN5bnRoZXNpc0Fubm91bmNlciIsIlV0dGVyYW5jZSIsIlV0dGVyYW5jZVF1ZXVlIiwiVXR0ZXJhbmNlUXVldWVUZXN0VXRpbHMiLCJxdWVyeVBhcmFtZXRlcnMiLCJRdWVyeVN0cmluZ01hY2hpbmUiLCJnZXRBbGwiLCJtYW51YWxJbnB1dCIsInR5cGUiLCJWT0lDSU5HX1VUVEVSQU5DRV9JTlRFUlZBTCIsIlRJTUlOR19CVUZGRVIiLCJERUZBVUxUX1ZPSUNFX1RJTUVPVVQiLCJ0ZXN0Vm9pY2luZ01hbmFnZXIiLCJjb25zdHJ1Y3RvciIsInRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUiLCJzZXREZWZhdWx0Vm9pY2UiLCJyZXNvbHZlZCIsIlByb21pc2UiLCJyZXNvbHZlIiwic2V0SXQiLCJ2b2ljZVByb3BlcnR5IiwidmFsdWUiLCJ2b2ljZXNQcm9wZXJ0eSIsImNsZWFyVGltZW91dCIsInRpbWVvdXQiLCJzZXRUaW1lb3V0IiwibGVuZ3RoIiwibGF6eUxpbmsiLCJpbml0aWFsaXplIiwidXNlckdlc3R1cmVFbWl0dGVyIiwiZW5hYmxlZFByb3BlcnR5IiwibXMiLCJhbGVydHMiLCJub0NhbmNlbE9wdGlvbnMiLCJjYW5jZWxTZWxmIiwiY2FuY2VsT3RoZXIiLCJ0aW1lVXR0ZXJhbmNlIiwidXR0ZXJhbmNlIiwic3RhcnRUaW1lIiwiRGF0ZSIsIm5vdyIsImFkZFRvQmFjayIsImFubm91bmNlbWVudENvbXBsZXRlRW1pdHRlciIsImFkZExpc3RlbmVyIiwidG9SZW1vdmUiLCJjb21wbGV0ZVV0dGVyYW5jZSIsInJlbW92ZUxpc3RlbmVyIiwiZ2V0U3BlYWtpbmdVdHRlcmFuY2UiLCJmaXJzdFV0dGVyYW5jZSIsImFsZXJ0IiwiYWxlcnRTdGFibGVEZWxheSIsImFubm91bmNlck9wdGlvbnMiLCJzZWNvbmRVdHRlcmFuY2UiLCJ0aGlyZFV0dGVyYW5jZSIsInRpbWVGb3JGaXJzdFV0dGVyYW5jZSIsInRpbWVGb3JTZWNvbmRVdHRlcmFuY2UiLCJ0aW1lRm9yVGhpcmRVdHRlcmFuY2UiLCJpbnRlcnZhbElEIiwiUVVuaXQiLCJtb2R1bGUiLCJiZWZvcmUiLCJ0aW1lckludGVydmFsIiwicHJldmlvdXNUaW1lIiwid2luZG93Iiwic2V0SW50ZXJ2YWwiLCJjdXJyZW50VGltZSIsImVsYXBzZWRUaW1lIiwiZW1pdCIsInVuc2hpZnQiLCJjb25zb2xlIiwibG9nIiwiRXJyb3IiLCJiZWZvcmVFYWNoIiwiY2FuY2VsIiwicHJpb3JpdHlQcm9wZXJ0eSIsImJlZm9yZUVhY2hUaW1pbmdXb3JrYXJvdW5kcyIsInJlc2V0IiwiYWZ0ZXIiLCJjbGVhckludGVydmFsIiwidGVzdCIsImFzc2VydCIsIm9rIiwidXR0ZXJhbmNlMSIsInByaW9yaXR5IiwidXR0ZXJhbmNlMiIsInV0dGVyYW5jZTMiLCJ1dHRlcmFuY2U0IiwidXR0ZXJhbmNlNSIsInNwZWVjaFN5bnRoZXNpc0Fubm91bmNlciIsImhhc1Nwb2tlbiIsInV0dGVyYW5jZVF1ZXVlIiwiZG9uZSIsImFzeW5jIiwidm9pY2UiLCJlbmRTcGVha2luZ0VtaXR0ZXIiLCJteUxpc3RlbmVyIiwieCIsInNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZSIsInNwZWFrSWdub3JpbmdFbmFibGVkIiwiY2FuY2VsVXR0ZXJhbmNlIiwiYW5ub3VuY2VJbW1lZGlhdGVseSIsImhhc1V0dGVyYW5jZSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdELE9BQU9BLGVBQWUsNkJBQTZCO0FBQ25ELFNBQVNDLE9BQU8sRUFBRUMsY0FBYyxRQUFRLDhCQUE4QjtBQUN0RSxPQUFPQyx1QkFBdUIseUJBQXlCO0FBQ3ZELE9BQU9DLDhCQUE4QixnQ0FBZ0M7QUFDckUsT0FBT0MsZUFBZSxpQkFBaUI7QUFDdkMsT0FBT0Msb0JBQW9CLHNCQUFzQjtBQUNqRCxPQUFPQyw2QkFBNkIsK0JBQStCO0FBRW5FLE1BQU1DLGtCQUFrQkMsbUJBQW1CQyxNQUFNLENBQUU7SUFFakQsOEdBQThHO0lBQzlHLDJHQUEyRztJQUMzRywwR0FBMEc7SUFDMUcsbUNBQW1DO0lBQ25DQyxhQUFhO1FBQ1hDLE1BQU07SUFDUjtBQUNGO0FBRUEsK0dBQStHO0FBQy9HLGtFQUFrRTtBQUNsRSxNQUFNQyw2QkFBNkI7QUFFbkMsNEVBQTRFO0FBQzVFLE1BQU1DLGdCQUFnQkQsNkJBQTZCO0FBRW5ELE1BQU1FLHdCQUF3QjtBQUU5QixrR0FBa0c7QUFDbEcsTUFBTUMscUJBQXFCLElBQUlkLGVBQWVlLFdBQVc7QUFDekQsTUFBTUMsNEJBQTRCLElBQUlaLGVBQWdCVTtBQUV0RCxNQUFNRyxvREFBa0I7SUFDdEIsSUFBSUMsV0FBVztJQUNmLE9BQU8sSUFBSUMsUUFBZUMsQ0FBQUE7UUFDeEIsTUFBTUMsUUFBUTtZQUNaLElBQUssQ0FBQ0gsVUFBVztnQkFDZkosbUJBQW1CUSxhQUFhLENBQUNDLEtBQUssR0FBR1QsbUJBQW1CVSxjQUFjLENBQUNELEtBQUssQ0FBRSxFQUFHLElBQUk7Z0JBQ3pGRSxhQUFjQztnQkFDZFIsV0FBVztnQkFDWEU7WUFDRjtRQUNGO1FBQ0EsTUFBTU0sVUFBVUMsV0FBWTtZQUMxQk47UUFDRixHQUFHUjtRQUVILElBQUtDLG1CQUFtQlUsY0FBYyxDQUFDRCxLQUFLLENBQUNLLE1BQU0sR0FBRyxHQUFJO1lBQ3hEUDtRQUNGLE9BQ0s7WUFDSFAsbUJBQW1CVSxjQUFjLENBQUNLLFFBQVEsQ0FBRTtnQkFDMUNSO1lBQ0Y7UUFDRjtJQUNGO0FBQ0Y7QUFFQVAsbUJBQW1CZ0IsVUFBVSxDQUFFL0IsUUFBUWdDLGtCQUFrQjtBQUN6RGpCLG1CQUFtQmtCLGVBQWUsQ0FBQ1QsS0FBSyxHQUFHO0FBRTNDLGtJQUFrSTtBQUNsSSxTQUFTRyxRQUFTTyxFQUFVO0lBQzFCLE9BQU8sSUFBSWQsUUFBU0MsQ0FBQUEsVUFBV08sV0FBWVAsU0FBU2EsTUFBUSx3Q0FBd0M7QUFDdEc7QUFFQSxJQUFJQyxTQUFzQixFQUFFO0FBRTVCLG1GQUFtRjtBQUNuRixNQUFNQyxrQkFBa0I7SUFDdEJDLFlBQVk7SUFDWkMsYUFBYTtBQUNmO0FBRUEsTUFBTUMsZ0JBQWdCLENBQUVDO0lBQ3RCLE9BQU8sSUFBSXBCLFFBQVNDLENBQUFBO1FBQ2xCLE1BQU1vQixZQUFZQyxLQUFLQyxHQUFHO1FBQzFCMUIsMEJBQTBCMkIsU0FBUyxDQUFFSjtRQUVyQ3pCLG1CQUFtQjhCLDJCQUEyQixDQUFDQyxXQUFXLENBQUUsU0FBU0MsU0FBVUMsaUJBQTRCO1lBQ3pHLElBQUtBLHNCQUFzQlIsV0FBWTtnQkFDckNuQixRQUFTcUIsS0FBS0MsR0FBRyxLQUFLRjtnQkFDdEIxQixtQkFBbUI4QiwyQkFBMkIsQ0FBQ0ksY0FBYyxDQUFFRjtZQUNqRTtRQUNGO0lBQ0Y7QUFDRjtBQUVBLG1IQUFtSDtBQUNuSCwwRUFBMEU7QUFDMUUsTUFBTUcsdUJBQXVCO0lBQzNCLE9BQU9uQyxrQkFBa0IsQ0FBRSwwQ0FBMkMsR0FBR0Esa0JBQWtCLENBQUUsMENBQTJDLENBQUN5QixTQUFTLEdBQUc7QUFDdko7QUFFQSxNQUFNVyxpQkFBaUIsSUFBSS9DLFVBQVc7SUFDcENnRCxPQUFPO0lBQ1BDLGtCQUFrQjtJQUNsQkMsa0JBQWtCbEI7QUFDcEI7QUFDQSxNQUFNbUIsa0JBQWtCLElBQUluRCxVQUFXO0lBQ3JDZ0QsT0FBTztJQUNQQyxrQkFBa0I7SUFDbEJDLGtCQUFrQmxCO0FBQ3BCO0FBRUEsTUFBTW9CLGlCQUFpQixJQUFJcEQsVUFBVztJQUNwQ2dELE9BQU87SUFDUEMsa0JBQWtCO0lBQ2xCQyxrQkFBa0JsQjtBQUNwQjtBQUdBLElBQUlxQjtBQUNKLElBQUlDO0FBQ0osSUFBSUM7QUFFSixJQUFJQztBQUNKQyxNQUFNQyxNQUFNLENBQUUsa0JBQWtCO0lBQzlCQyxNQUFNLG9DQUFFO1FBRU4scURBQXFEO1FBQ3JELE1BQU1DLGdCQUFnQixJQUFJO1FBRTFCLHVEQUF1RDtRQUN2RCxJQUFJQyxlQUFldkIsS0FBS0MsR0FBRyxJQUFJLFFBQVE7UUFFdkNpQixhQUFhTSxPQUFPQyxXQUFXLENBQUU7WUFFL0IsUUFBUTtZQUNSLE1BQU1DLGNBQWMxQixLQUFLQyxHQUFHO1lBQzVCLE1BQU0wQixjQUFjRCxjQUFjSDtZQUVsQ2xFLFVBQVV1RSxJQUFJLENBQUVELGNBQWMsT0FBUSx3QkFBd0I7WUFFOURKLGVBQWVHO1FBQ2pCLEdBQUdKLGdCQUFnQjtRQUVuQixvRUFBb0U7UUFDcEVqRCxtQkFBbUI4QiwyQkFBMkIsQ0FBQ0MsV0FBVyxDQUFFLENBQUVOO1lBQzVETCxPQUFPb0MsT0FBTyxDQUFFL0I7UUFDbEI7UUFFQSxJQUFLakMsZ0JBQWdCRyxXQUFXLEVBQUc7WUFFakMsb0dBQW9HO1lBQ3BHLHFHQUFxRztZQUNyRyx3R0FBd0c7WUFDeEcsd0dBQXdHO1lBQ3hHLGtHQUFrRztZQUNsRyxNQUFNaUIsUUFBUztZQUVmOEIsd0JBQXdCLE1BQU1sQixjQUFlWTtZQUM3Q08seUJBQXlCLE1BQU1uQixjQUFlZ0I7WUFDOUNJLHdCQUF3QixNQUFNcEIsY0FBZWlCO1lBRTdDLHVHQUF1RztZQUN2RyxpR0FBaUc7WUFDakcsNkRBQTZEO1lBQzdELElBQUtDLHdCQUF3QixRQUFRQyx5QkFBeUIsUUFBUUMsd0JBQXdCLE1BQU87Z0JBQ25HYSxRQUFRQyxHQUFHLENBQUUsQ0FBQyx1QkFBdUIsRUFBRWhCLHNCQUFzQix5QkFBeUIsRUFBRUMsdUJBQXVCLHdCQUF3QixFQUFFQyx1QkFBdUI7Z0JBQ2hLLE1BQU0sSUFBSWUsTUFBTztZQUNuQjtRQUNGO1FBRUF2QyxTQUFTLEVBQUU7UUFFWCxzQkFBc0I7UUFDdEIsTUFBTWpCO0lBQ1I7SUFDQXlELFVBQVUsb0NBQUU7UUFFVjFELDBCQUEwQjJELE1BQU07UUFFaEMsOENBQThDO1FBQzlDekIsZUFBZTBCLGdCQUFnQixDQUFDckQsS0FBSyxHQUFHO1FBQ3hDK0IsZ0JBQWdCc0IsZ0JBQWdCLENBQUNyRCxLQUFLLEdBQUc7UUFDekNnQyxlQUFlcUIsZ0JBQWdCLENBQUNyRCxLQUFLLEdBQUc7UUFFeEMsZ0dBQWdHO1FBQ2hHLDhEQUE4RDtRQUM5RCxNQUFNbEIsd0JBQXdCd0UsMkJBQTJCO1FBRXpENUUsa0JBQWtCNkUsS0FBSztRQUV2Qix3Q0FBd0M7UUFDeEM1QyxTQUFTLEVBQUU7SUFDYjtJQUNBNkM7UUFDRUMsY0FBZXJCO0lBQ2pCO0FBQ0Y7QUFFQUMsTUFBTXFCLElBQUksQ0FBRSxxRUFBbUMsVUFBTUM7SUFDbkRBLE9BQU9DLEVBQUUsQ0FBRSxNQUFNO0FBQ25CO0FBRUF2QixNQUFNcUIsSUFBSSxDQUFFLDBFQUF3QyxVQUFNQztJQUN4RCxNQUFNRSxhQUFhLElBQUlqRixVQUFXO1FBQ2hDZ0QsT0FBTztRQUNQa0MsVUFBVTtJQUNaO0lBQ0EsTUFBTUMsYUFBYSxJQUFJbkYsVUFBVztRQUNoQ2dELE9BQU87UUFDUGtDLFVBQVU7SUFDWjtJQUNBLE1BQU1FLGFBQWEsSUFBSXBGLFVBQVc7UUFDaENnRCxPQUFPO1FBQ1BrQyxVQUFVO0lBQ1o7SUFFQSxNQUFNRyxhQUFhLElBQUlyRixVQUFXO1FBQ2hDZ0QsT0FBTztRQUNQa0MsVUFBVTtRQUNWaEMsa0JBQWtCO1lBQ2hCaEIsYUFBYTtRQUNmO0lBQ0Y7SUFFQSxNQUFNb0QsYUFBYSxJQUFJdEYsVUFBVztRQUNoQ2dELE9BQU87UUFDUGtDLFVBQVU7UUFDVmhDLGtCQUFrQjtZQUNoQmhCLGFBQWE7UUFDZjtJQUNGO0lBRUEsTUFBTXFELDJCQUEyQixJQUFJeEY7SUFDckN3Rix5QkFBeUJDLFNBQVMsR0FBRyxNQUFNLE1BQU07SUFFakQsTUFBTUMsaUJBQWlCLElBQUl4RixlQUFnQnNGO0lBRTNDUixPQUFPQyxFQUFFLENBQUVTLGNBQWMsQ0FBRSxRQUFTLENBQUNoRSxNQUFNLEtBQUssR0FBRztJQUNuRGdFLGVBQWVqRCxTQUFTLENBQUV5QztJQUUxQkYsT0FBT0MsRUFBRSxDQUFFUyxjQUFjLENBQUUsUUFBUyxDQUFDaEUsTUFBTSxLQUFLLEdBQUc7SUFDbkRnRSxlQUFlakQsU0FBUyxDQUFFMkM7SUFDMUJKLE9BQU9DLEVBQUUsQ0FBRVMsY0FBYyxDQUFFLFFBQVMsQ0FBQ2hFLE1BQU0sS0FBSyxHQUFHO0lBQ25EZ0UsZUFBZWpELFNBQVMsQ0FBRTRDO0lBQzFCTCxPQUFPQyxFQUFFLENBQUVTLGNBQWMsQ0FBRSxRQUFTLENBQUNoRSxNQUFNLEtBQUssR0FBRztJQUNuRHNELE9BQU9DLEVBQUUsQ0FBRVMsY0FBYyxDQUFFLFFBQVMsQ0FBRSxFQUFHLENBQUNyRCxTQUFTLEtBQUs2QyxZQUFZO0lBQ3BFRixPQUFPQyxFQUFFLENBQUVTLGNBQWMsQ0FBRSxRQUFTLENBQUUsRUFBRyxDQUFDckQsU0FBUyxLQUFLZ0QsWUFBWTtJQUNwRUssZUFBZWpELFNBQVMsQ0FBRTZDO0lBQzFCTixPQUFPQyxFQUFFLENBQUVTLGNBQWMsQ0FBRSxRQUFTLENBQUNoRSxNQUFNLEtBQUssR0FBRztJQUNuRHNELE9BQU9DLEVBQUUsQ0FBRVMsY0FBYyxDQUFFLFFBQVMsQ0FBRSxFQUFHLENBQUNyRCxTQUFTLEtBQUs2QyxZQUFZO0lBQ3BFRixPQUFPQyxFQUFFLENBQUVTLGNBQWMsQ0FBRSxRQUFTLENBQUUsRUFBRyxDQUFDckQsU0FBUyxLQUFLZ0QsWUFBWTtJQUNwRUwsT0FBT0MsRUFBRSxDQUFFUyxjQUFjLENBQUUsUUFBUyxDQUFFLEVBQUcsQ0FBQ3JELFNBQVMsS0FBS2lELFlBQVk7SUFFcEVJLGVBQWVqRCxTQUFTLENBQUU4QztJQUUxQlAsT0FBT0MsRUFBRSxDQUFFUyxjQUFjLENBQUUsUUFBUyxDQUFDaEUsTUFBTSxLQUFLLEdBQUc7SUFDbkRzRCxPQUFPQyxFQUFFLENBQUVTLGNBQWMsQ0FBRSxRQUFTLENBQUUsRUFBRyxDQUFDckQsU0FBUyxLQUFLNkMsWUFBWTtJQUNwRUYsT0FBT0MsRUFBRSxDQUFFUyxjQUFjLENBQUUsUUFBUyxDQUFFLEVBQUcsQ0FBQ3JELFNBQVMsS0FBS2dELFlBQVk7SUFDcEVMLE9BQU9DLEVBQUUsQ0FBRVMsY0FBYyxDQUFFLFFBQVMsQ0FBRSxFQUFHLENBQUNyRCxTQUFTLEtBQUtpRCxZQUFZO0lBQ3BFTixPQUFPQyxFQUFFLENBQUVTLGNBQWMsQ0FBRSxRQUFTLENBQUUsRUFBRyxDQUFDckQsU0FBUyxLQUFLa0QsWUFBWTtJQUVwRTs7Ozs7O0dBTUMsR0FDQ0EsV0FBV2IsZ0JBQWdCLEFBQXlDLENBQUUsbUJBQW9CLENBQUU7SUFDOUZZLFdBQVdaLGdCQUFnQixDQUFDckQsS0FBSyxHQUFHO0lBRXBDMkQsT0FBT0MsRUFBRSxDQUFFUyxjQUFjLENBQUUsUUFBUyxDQUFDaEUsTUFBTSxLQUFLLEdBQUc7SUFDbkRzRCxPQUFPQyxFQUFFLENBQUVTLGNBQWMsQ0FBRSxRQUFTLENBQUUsRUFBRyxDQUFDckQsU0FBUyxLQUFLNkMsWUFBWTtJQUNwRUYsT0FBT0MsRUFBRSxDQUFFUyxjQUFjLENBQUUsUUFBUyxDQUFFLEVBQUcsQ0FBQ3JELFNBQVMsS0FBS2tELFlBQVk7QUFDdEU7QUFFQSw4REFBOEQ7QUFDOUQsSUFBSzNFLG1CQUFtQlUsY0FBYyxDQUFDRCxLQUFLLEdBQUcsR0FBSTtJQUVqRHFDLE1BQU1xQixJQUFJLENBQUUsc0VBQW9DLFVBQU1DO1FBRXBELE1BQU1XLE9BQU9YLE9BQU9ZLEtBQUs7UUFFekJoRixtQkFBbUJRLGFBQWEsQ0FBQ0MsS0FBSyxHQUFHO1FBRXpDLE1BQU13RSxRQUFRakYsbUJBQW1CVSxjQUFjLENBQUNELEtBQUssQ0FBRSxFQUFHO1FBQzFELE1BQU1nQixZQUFZLElBQUlwQyxVQUFXO1lBQy9CZ0QsT0FBTztZQUNQRSxrQkFBa0I7Z0JBQ2hCMEMsT0FBT0E7WUFDVDtRQUNGO1FBRUFqRixtQkFBbUJrRixrQkFBa0IsQ0FBQ25ELFdBQVcsQ0FBRSxTQUFTb0Q7WUFFMUQsTUFBTUMsSUFBSXBGLGtCQUFrQixDQUFFLDBDQUEyQztZQUN6RW9FLE9BQU9DLEVBQUUsQ0FBRWUsR0FBRztZQUNkaEIsT0FBT0MsRUFBRSxDQUFFZSxFQUFFQyx3QkFBd0IsQ0FBQ0osS0FBSyxLQUFLQSxPQUFPO1lBQ3ZEakYsbUJBQW1Ca0Ysa0JBQWtCLENBQUNoRCxjQUFjLENBQUVpRDtZQUN0REo7UUFDRjtRQUNBL0UsbUJBQW1Cc0Ysb0JBQW9CLENBQUU3RDtRQUV6Q3pCLG1CQUFtQlEsYUFBYSxDQUFDQyxLQUFLLEdBQUd3RTtJQUMzQztBQUNGO0FBR0EsSUFBS3pGLGdCQUFnQkcsV0FBVyxFQUFHO0lBRWpDbUQsTUFBTXFCLElBQUksQ0FBRSwrREFBNkIsVUFBTUM7UUFFN0Msa0RBQWtEO1FBQ2xEbEUsMEJBQTBCMkIsU0FBUyxDQUFFTztRQUNyQ2xDLDBCQUEwQjJCLFNBQVMsQ0FBRVc7UUFDckN0QywwQkFBMEIyQixTQUFTLENBQUVZO1FBRXJDLE1BQU03QixRQUFTOEIsd0JBQXdCQyx5QkFBeUJDLHdCQUF3QjlDLGdCQUFnQjtRQUN4R3NFLE9BQU9DLEVBQUUsQ0FBRWpELE9BQU9OLE1BQU0sS0FBSyxHQUFHO0lBQ2xDO0lBRUFnQyxNQUFNcUIsSUFBSSxDQUFFLDJEQUF5QixVQUFNQztRQUV6QyxxR0FBcUc7UUFDckdsRSwwQkFBMEIyQixTQUFTLENBQUVPO1FBQ3JDLE1BQU14QixRQUFTOEIsd0JBQXdCO1FBQ3ZDeEMsMEJBQTBCcUYsZUFBZSxDQUFFbkQ7UUFFM0MsMkdBQTJHO1FBQzNHbEMsMEJBQTBCMkIsU0FBUyxDQUFFTztRQUNyQ2dDLE9BQU9DLEVBQUUsQ0FBRWpELE1BQU0sQ0FBRSxFQUFHLEtBQUtnQixnQkFBZ0I7UUFDM0NnQyxPQUFPQyxFQUFFLENBQUVuRSx5QkFBeUIsQ0FBRSxRQUFTLENBQUNZLE1BQU0sS0FBSyxHQUFHO0lBQ2hFO0lBRUFnQyxNQUFNcUIsSUFBSSxDQUFFLG1FQUFpQyxVQUFNQztRQUVqRCxvQkFBb0I7UUFDcEJsRSwwQkFBMEIyQixTQUFTLENBQUVPO1FBQ3JDbEMsMEJBQTBCMkIsU0FBUyxDQUFFVztRQUNyQ3RDLDBCQUEwQjJCLFNBQVMsQ0FBRVk7UUFFckMyQixPQUFPQyxFQUFFLENBQUVuRSx5QkFBeUIsQ0FBRSxRQUFTLENBQUNZLE1BQU0sS0FBSyxHQUFHO1FBRTlELG9GQUFvRjtRQUNwRjJCLGVBQWVxQixnQkFBZ0IsQ0FBQ3JELEtBQUssR0FBRztRQUN4QzJELE9BQU9DLEVBQUUsQ0FBRW5FLHlCQUF5QixDQUFFLFFBQVMsQ0FBQ1ksTUFBTSxLQUFLLEdBQUc7UUFDOURzRCxPQUFPQyxFQUFFLENBQUVuRSx5QkFBeUIsQ0FBRSxRQUFTLENBQUUsRUFBRyxDQUFDdUIsU0FBUyxLQUFLZ0IsZ0JBQWdCO0lBQ3JGO0lBRUFLLE1BQU1xQixJQUFJLENBQUUsbUhBQWlGLFVBQU1DO1FBRWpHLDRHQUE0RztRQUM1RyxxQ0FBcUM7UUFDckNsRSwwQkFBMEIyQixTQUFTLENBQUVPO1FBQ3JDLE1BQU14QixRQUFTOEIsd0JBQXdCO1FBQ3ZDeEMsMEJBQTBCMkIsU0FBUyxDQUFFTztRQUNyQ2xDLDBCQUEwQjJCLFNBQVMsQ0FBRVc7UUFDckMsTUFBTTVCLFFBQVM4Qix3QkFBeUIsb0VBQW9FO1FBRTVHLDBHQUEwRztRQUMxRyxrREFBa0Q7UUFDbEROLGVBQWUwQixnQkFBZ0IsQ0FBQ3JELEtBQUssR0FBRztRQUN4QyxNQUFNRyxRQUFTK0IseUJBQXlCO1FBQ3hDeUIsT0FBT0MsRUFBRSxDQUFFbEMsMkJBQTJCSyxpQkFBaUI7UUFDdkQ0QixPQUFPQyxFQUFFLENBQUVuRSx5QkFBeUIsQ0FBRSxRQUFTLENBQUNZLE1BQU0sS0FBSyxHQUFHO0lBQ2hFO0lBRUFnQyxNQUFNcUIsSUFBSSxDQUFFLDJGQUF5RCxVQUFNQztRQUV6RSx3RkFBd0Y7UUFDeEYsd0RBQXdEO1FBQ3hELG9IQUFvSDtRQUVwSCxvQkFBb0I7UUFDcEJsRSwwQkFBMEIyQixTQUFTLENBQUVPO1FBQ3JDbEMsMEJBQTBCMkIsU0FBUyxDQUFFVztRQUNyQ3RDLDBCQUEwQjJCLFNBQVMsQ0FBRVk7UUFDckMyQixPQUFPQyxFQUFFLENBQUVuRSx5QkFBeUIsQ0FBRSxRQUFTLENBQUNZLE1BQU0sS0FBSyxHQUFHO1FBRTlEMEIsZ0JBQWdCc0IsZ0JBQWdCLENBQUNyRCxLQUFLLEdBQUc7UUFFekMsaUhBQWlIO1FBQ2pILE1BQU1HLFFBQVMrQix5QkFBeUI7UUFDeEN5QixPQUFPQyxFQUFFLENBQUVsQywyQkFBMkJLLGlCQUFpQjtRQUV2RCxrRkFBa0Y7UUFDbEYsTUFBTTVCLFFBQVMrQix5QkFBeUIsSUFBSUMsd0JBQXdCO1FBQ3BFd0IsT0FBT0MsRUFBRSxDQUFFakQsTUFBTSxDQUFFLEVBQUcsS0FBS29CLGlCQUFpQjtRQUM1QzRCLE9BQU9DLEVBQUUsQ0FBRWxDLDJCQUEyQk0sZ0JBQWdCO0lBQ3RELG9IQUFvSDtJQUN0SDtJQUVBSyxNQUFNcUIsSUFBSSxDQUFFLDJIQUF5RixVQUFNQztRQUV6R2hDLGVBQWUwQixnQkFBZ0IsQ0FBQ3JELEtBQUssR0FBRztRQUN4Q1AsMEJBQTBCMkIsU0FBUyxDQUFFTztRQUVyQyxnRUFBZ0U7UUFDaEVBLGVBQWUwQixnQkFBZ0IsQ0FBQ3JELEtBQUssR0FBRztRQUN4Q1AsMEJBQTBCMkIsU0FBUyxDQUFFWTtRQUVyQyxxRUFBcUU7UUFDckUsTUFBTTdCLFFBQVM4Qix3QkFBd0I7UUFDdkMwQixPQUFPQyxFQUFFLENBQUVsQywyQkFBMkJNLGdCQUFnQjtJQUN4RDtJQUVBSyxNQUFNcUIsSUFBSSxDQUFFLDBIQUF3RixVQUFNQztRQUV4R2hDLGVBQWUwQixnQkFBZ0IsQ0FBQ3JELEtBQUssR0FBRztRQUN4Q1AsMEJBQTBCMkIsU0FBUyxDQUFFTztRQUVyQywrREFBK0Q7UUFDL0RsQywwQkFBMEIyQixTQUFTLENBQUVZO1FBQ3JDTCxlQUFlMEIsZ0JBQWdCLENBQUNyRCxLQUFLLEdBQUc7UUFFeEMscUVBQXFFO1FBQ3JFLE1BQU1HLFFBQVM4Qix3QkFBd0I7UUFDdkMwQixPQUFPQyxFQUFFLENBQUVsQywyQkFBMkJNLGdCQUFnQjtJQUN4RDtJQUVBSyxNQUFNcUIsSUFBSSxDQUFFLGdIQUE4RSxVQUFNQztRQUU5RmhDLGVBQWUwQixnQkFBZ0IsQ0FBQ3JELEtBQUssR0FBRztRQUN4Q1AsMEJBQTBCMkIsU0FBUyxDQUFFTztRQUNyQ2xDLDBCQUEwQjJCLFNBQVMsQ0FBRVk7UUFFckMsTUFBTTdCLFFBQVM4Qix3QkFBd0I7UUFDdkMwQixPQUFPQyxFQUFFLENBQUVsQywyQkFBMkJDO1FBRXRDLDZGQUE2RjtRQUM3RkEsZUFBZTBCLGdCQUFnQixDQUFDckQsS0FBSyxHQUFHO1FBRXhDLDBHQUEwRztRQUMxRyxNQUFNRyxRQUFTOEIsd0JBQXdCO1FBQ3ZDMEIsT0FBT0MsRUFBRSxDQUFFakQsTUFBTSxDQUFFLEVBQUcsS0FBS2dCLGdCQUFnQjtRQUUzQyxtREFBbUQ7UUFDbkQsTUFBTXhCLFFBQVNnQyx3QkFBd0I7UUFDdkN3QixPQUFPQyxFQUFFLENBQUVsQywyQkFBMkJNLGdCQUFnQjtJQUN4RDtJQUVBSyxNQUFNcUIsSUFBSSxDQUFFLGtJQUFnRyxVQUFNQztRQUVoSGhDLGVBQWUwQixnQkFBZ0IsQ0FBQ3JELEtBQUssR0FBRztRQUN4Q2dDLGVBQWVxQixnQkFBZ0IsQ0FBQ3JELEtBQUssR0FBRztRQUV4Q1AsMEJBQTBCMkIsU0FBUyxDQUFFTztRQUNyQ2xDLDBCQUEwQjJCLFNBQVMsQ0FBRVk7UUFFckMsTUFBTTdCLFFBQVM4Qix3QkFBd0I7UUFDdkMwQixPQUFPQyxFQUFFLENBQUVsQywyQkFBMkJDLGdCQUFnQjtRQUV0RCxxR0FBcUc7UUFDckcsa0RBQWtEO1FBQ2xESyxlQUFlcUIsZ0JBQWdCLENBQUNyRCxLQUFLLEdBQUc7UUFFeEMsZ0dBQWdHO1FBQ2hHLE1BQU1HLFFBQVM4Qix3QkFBd0I7UUFDdkMwQixPQUFPQyxFQUFFLENBQUVqRCxNQUFNLENBQUUsRUFBRyxLQUFLZ0IsZ0JBQWdCO1FBRTNDLG1EQUFtRDtRQUNuRCxNQUFNeEIsUUFBU2dDLHdCQUF3QjtRQUN2Q3dCLE9BQU9DLEVBQUUsQ0FBRWxDLDJCQUEyQk0sZ0JBQWdCO0lBQ3hEO0lBRUFLLE1BQU1xQixJQUFJLENBQUUsNkdBQTJFLFVBQU1DO1FBRTNGaEMsZUFBZTBCLGdCQUFnQixDQUFDckQsS0FBSyxHQUFHO1FBQ3hDUCwwQkFBMEIyQixTQUFTLENBQUVPO1FBQ3JDbEMsMEJBQTBCMkIsU0FBUyxDQUFFWTtRQUVyQyxNQUFNN0IsUUFBUzhCLHdCQUF3QjtRQUV2Qyw4R0FBOEc7UUFDOUcsa0RBQWtEO1FBQ2xETixlQUFlMEIsZ0JBQWdCLENBQUNyRCxLQUFLLEdBQUc7UUFFeEMsb0dBQW9HO1FBQ3BHLE1BQU1HLFFBQVM4Qix3QkFBd0I7UUFDdkMwQixPQUFPQyxFQUFFLENBQUVqRCxPQUFPTixNQUFNLEtBQUssR0FBRztRQUVoQyxpRkFBaUY7UUFDakYsTUFBTUYsUUFBU2dDLHdCQUF3QixJQUFJRix3QkFBd0I7UUFDbkUwQixPQUFPQyxFQUFFLENBQUVqRCxNQUFNLENBQUUsRUFBRyxLQUFLZ0IsZ0JBQWdCO1FBQzNDZ0MsT0FBT0MsRUFBRSxDQUFFbEMsMkJBQTJCTSxnQkFBZ0I7SUFDeEQ7SUFFQUssTUFBTXFCLElBQUksQ0FBRSx5REFBdUIsVUFBTUM7UUFFdkNsRSwwQkFBMEJzRixtQkFBbUIsQ0FBRXBEO1FBQy9DZ0MsT0FBT0MsRUFBRSxDQUFFbkUseUJBQXlCLENBQUUsUUFBUyxDQUFDWSxNQUFNLEtBQUssR0FBRztRQUU5RCxNQUFNRixRQUFTOEIsd0JBQXdCO1FBQ3ZDMEIsT0FBT0MsRUFBRSxDQUFFbEMsMkJBQTJCQyxnQkFBZ0I7SUFDeEQ7SUFFQVUsTUFBTXFCLElBQUksQ0FBRSwrRkFBNkQsVUFBTUM7UUFFN0VsRSwwQkFBMEIyQixTQUFTLENBQUVPO1FBQ3JDbEMsMEJBQTBCMkIsU0FBUyxDQUFFVztRQUNyQ3RDLDBCQUEwQjJCLFNBQVMsQ0FBRVk7UUFFckMsNENBQTRDO1FBQzVDdkMsMEJBQTBCc0YsbUJBQW1CLENBQUVwRDtRQUUvQyxNQUFNeEIsUUFBUzhCLHdCQUF3QjtRQUN2QzBCLE9BQU9DLEVBQUUsQ0FBRW5FLHlCQUF5QixDQUFFLFFBQVMsQ0FBQ1ksTUFBTSxLQUFLLEdBQUc7UUFDOURzRCxPQUFPQyxFQUFFLENBQUVsQywyQkFBMkJDLGdCQUFnQjtJQUN4RDtJQUVBVSxNQUFNcUIsSUFBSSxDQUFFLG9JQUFrRyxVQUFNQztRQUNsSGxFLDBCQUEwQjJCLFNBQVMsQ0FBRU87UUFDckNsQywwQkFBMEIyQixTQUFTLENBQUVXO1FBRXJDSixlQUFlMEIsZ0JBQWdCLENBQUNyRCxLQUFLLEdBQUc7UUFDeENnQyxlQUFlcUIsZ0JBQWdCLENBQUNyRCxLQUFLLEdBQUc7UUFDeENQLDBCQUEwQnNGLG1CQUFtQixDQUFFL0M7UUFFL0MsMEdBQTBHO1FBQzFHLHNCQUFzQjtRQUN0QjJCLE9BQU9DLEVBQUUsQ0FBRW5FLHlCQUF5QixDQUFFLFFBQVMsQ0FBQ1ksTUFBTSxLQUFLLEdBQUc7UUFDOURzRCxPQUFPQyxFQUFFLENBQUUsQ0FBQ25FLDBCQUEwQnVGLFlBQVksQ0FBRWhELGlCQUFrQjtRQUV0RSxNQUFNN0IsUUFBUzhCLHdCQUF3QjtRQUN2QzBCLE9BQU9DLEVBQUUsQ0FBRWxDLDJCQUEyQkM7UUFDdENnQyxPQUFPQyxFQUFFLENBQUVqRCxNQUFNLENBQUUsRUFBRyxLQUFLcUIsZ0JBQWdCO0lBQzdDO0lBRUFLLE1BQU1xQixJQUFJLENBQUUsd0lBQXNHLFVBQU1DO1FBQ3RIaEMsZUFBZTBCLGdCQUFnQixDQUFDckQsS0FBSyxHQUFHO1FBQ3hDZ0MsZUFBZXFCLGdCQUFnQixDQUFDckQsS0FBSyxHQUFHO1FBRXhDUCwwQkFBMEIyQixTQUFTLENBQUVPO1FBQ3JDbEMsMEJBQTBCMkIsU0FBUyxDQUFFVztRQUVyQ0osZUFBZTBCLGdCQUFnQixDQUFDckQsS0FBSyxHQUFHO1FBQ3hDZ0MsZUFBZXFCLGdCQUFnQixDQUFDckQsS0FBSyxHQUFHO1FBRXhDLE1BQU1HLFFBQVM4Qix3QkFBd0I7UUFDdkN4QywwQkFBMEJzRixtQkFBbUIsQ0FBRS9DO1FBRS9DLGlHQUFpRztRQUNqRyxNQUFNN0IsUUFBUzhCLHdCQUF3QixJQUFLLHdFQUF3RTtRQUNwSDBCLE9BQU9DLEVBQUUsQ0FBRWxDLDJCQUEyQk0sZ0JBQWdCO1FBQ3REMkIsT0FBT0MsRUFBRSxDQUFFLENBQUNuRSwwQkFBMEJ1RixZQUFZLENBQUVoRCxpQkFBa0I7SUFDeEU7SUFFQUssTUFBTXFCLElBQUksQ0FBRSw0SEFBMEYsVUFBTUM7UUFFMUcsb0dBQW9HO1FBQ3BHLGlHQUFpRztRQUNqRyxrQ0FBa0M7UUFDbEMsb0dBQW9HO1FBQ3BHaEMsZUFBZTBCLGdCQUFnQixDQUFDckQsS0FBSyxHQUFHO1FBQ3hDZ0MsZUFBZXFCLGdCQUFnQixDQUFDckQsS0FBSyxHQUFHO1FBRXhDUCwwQkFBMEIyQixTQUFTLENBQUVPO1FBQ3JDbEMsMEJBQTBCMkIsU0FBUyxDQUFFVztRQUNyQ3RDLDBCQUEwQnNGLG1CQUFtQixDQUFFL0M7UUFFL0MsTUFBTTdCLFFBQVNnQyx3QkFBd0I7UUFDdkN3QixPQUFPQyxFQUFFLENBQUVsQywyQkFBMkJNLGdCQUFnQjtRQUV0REEsZUFBZXFCLGdCQUFnQixDQUFDckQsS0FBSyxHQUFHO1FBRXhDLDBHQUEwRztRQUMxRyw4REFBOEQ7UUFDOUQsTUFBTUcsUUFBU2dDLHdCQUF3QixJQUFLLG9FQUFvRTtRQUNoSHdCLE9BQU9DLEVBQUUsQ0FBRWpELE1BQU0sQ0FBRSxFQUFHLEtBQUtxQixnQkFBZ0I7UUFFM0MsTUFBTTdCLFFBQVM4Qix3QkFBd0I7UUFDdkMwQixPQUFPQyxFQUFFLENBQUVsQywyQkFBMkJDLGdCQUFnQjtJQUN4RDtJQUVBVSxNQUFNcUIsSUFBSSxDQUFFLG9JQUFrRyxVQUFNQztRQUNsSGhDLGVBQWUwQixnQkFBZ0IsQ0FBQ3JELEtBQUssR0FBRztRQUN4Q2dDLGVBQWVxQixnQkFBZ0IsQ0FBQ3JELEtBQUssR0FBRztRQUV4Q1AsMEJBQTBCMkIsU0FBUyxDQUFFTztRQUNyQ2xDLDBCQUEwQjJCLFNBQVMsQ0FBRVc7UUFDckN0QywwQkFBMEJzRixtQkFBbUIsQ0FBRS9DO1FBRS9DLE1BQU03QixRQUFTZ0Msd0JBQXdCO1FBQ3ZDd0IsT0FBT0MsRUFBRSxDQUFFbEMsMkJBQTJCTSxnQkFBZ0I7UUFFdEQsa0RBQWtEO1FBQ2xETCxlQUFlMEIsZ0JBQWdCLENBQUNyRCxLQUFLLEdBQUc7UUFFeEMsNEdBQTRHO1FBQzVHLE1BQU1HLFFBQVNnQyx3QkFBd0IsSUFBSyxnRUFBZ0U7UUFDNUd3QixPQUFPQyxFQUFFLENBQUVqRCxNQUFNLENBQUUsRUFBRyxLQUFLcUIsZ0JBQWdCO1FBRTNDLE1BQU03QixRQUFTOEIsd0JBQXdCO1FBQ3ZDMEIsT0FBT0MsRUFBRSxDQUFFbEMsMkJBQTJCQyxnQkFBZ0I7SUFDeEQ7SUFFQVUsTUFBTXFCLElBQUksQ0FBRSx3SEFBc0YsVUFBTUM7UUFDdEdoQyxlQUFlMEIsZ0JBQWdCLENBQUNyRCxLQUFLLEdBQUc7UUFDeENnQyxlQUFlcUIsZ0JBQWdCLENBQUNyRCxLQUFLLEdBQUc7UUFFeENQLDBCQUEwQjJCLFNBQVMsQ0FBRU87UUFDckNsQywwQkFBMEIyQixTQUFTLENBQUVXO1FBRXJDLE1BQU01QixRQUFTOEIsd0JBQXdCO1FBQ3ZDeEMsMEJBQTBCc0YsbUJBQW1CLENBQUUvQztRQUUvQyxNQUFNN0IsUUFBUzhCLHdCQUF3QixJQUFLLHlEQUF5RDtRQUNyRzBCLE9BQU9DLEVBQUUsQ0FBRWpELE1BQU0sQ0FBRSxFQUFHLEtBQUtnQixnQkFBZ0I7UUFFM0MsTUFBTXhCLFFBQVNnQyx3QkFBd0I7UUFDdkN3QixPQUFPQyxFQUFFLENBQUVsQywyQkFBMkJNLGdCQUFnQjtJQUN4RDtJQUVBSyxNQUFNcUIsSUFBSSxDQUFFLG1IQUFpRixVQUFNQztRQUNqR2hDLGVBQWUwQixnQkFBZ0IsQ0FBQ3JELEtBQUssR0FBRztRQUN4Q2dDLGVBQWVxQixnQkFBZ0IsQ0FBQ3JELEtBQUssR0FBRztRQUV4Q1AsMEJBQTBCMkIsU0FBUyxDQUFFTztRQUNyQ2xDLDBCQUEwQjJCLFNBQVMsQ0FBRVc7UUFFckMsTUFBTTVCLFFBQVM4Qix3QkFBd0I7UUFDdkN4QywwQkFBMEJzRixtQkFBbUIsQ0FBRS9DO1FBRS9DLE1BQU03QixRQUFTOEIsd0JBQXdCO1FBQ3ZDMEIsT0FBT0MsRUFBRSxDQUFFbEMsMkJBQTJCQyxnQkFBZ0I7UUFDdERnQyxPQUFPQyxFQUFFLENBQUVuRSx5QkFBeUIsQ0FBRSxRQUFTLENBQUUsRUFBRyxDQUFDdUIsU0FBUyxLQUFLZSxpQkFBaUI7UUFDcEY0QixPQUFPQyxFQUFFLENBQUVuRSx5QkFBeUIsQ0FBRSxRQUFTLENBQUNZLE1BQU0sS0FBSyxHQUFHO1FBRTlELE1BQU1GLFFBQVM4Qix3QkFBd0IsSUFBSUUsd0JBQXdCO1FBQ25Fd0IsT0FBT0MsRUFBRSxDQUFFakQsTUFBTSxDQUFFLEVBQUcsS0FBS2dCLGdCQUFnQjtJQUM3QztBQUNGIn0=