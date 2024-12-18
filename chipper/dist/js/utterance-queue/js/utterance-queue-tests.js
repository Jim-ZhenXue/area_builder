// Copyright 2019-2024, University of Colorado Boulder
/**
 * Unit tests for utterance-queue.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import qunitStart from '../../chipper/js/browser/sim-tests/qunitStart.js';
import './ResponsePacketTests.js';
import './UtteranceTests.js';
import './UtteranceQueueTests.js';
// Since our tests are loaded asynchronously, we must direct QUnit to begin the tests
qunitStart();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy91dHRlcmFuY2UtcXVldWUtdGVzdHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVW5pdCB0ZXN0cyBmb3IgdXR0ZXJhbmNlLXF1ZXVlLlxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgcXVuaXRTdGFydCBmcm9tICcuLi8uLi9jaGlwcGVyL2pzL2Jyb3dzZXIvc2ltLXRlc3RzL3F1bml0U3RhcnQuanMnO1xuaW1wb3J0ICcuL1Jlc3BvbnNlUGFja2V0VGVzdHMuanMnO1xuaW1wb3J0ICcuL1V0dGVyYW5jZVRlc3RzLmpzJztcbmltcG9ydCAnLi9VdHRlcmFuY2VRdWV1ZVRlc3RzLmpzJztcblxuLy8gU2luY2Ugb3VyIHRlc3RzIGFyZSBsb2FkZWQgYXN5bmNocm9ub3VzbHksIHdlIG11c3QgZGlyZWN0IFFVbml0IHRvIGJlZ2luIHRoZSB0ZXN0c1xucXVuaXRTdGFydCgpOyJdLCJuYW1lcyI6WyJxdW5pdFN0YXJ0Il0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGdCQUFnQixtREFBbUQ7QUFDMUUsT0FBTywyQkFBMkI7QUFDbEMsT0FBTyxzQkFBc0I7QUFDN0IsT0FBTywyQkFBMkI7QUFFbEMscUZBQXFGO0FBQ3JGQSJ9