// Copyright 2018-2024, University of Colorado Boulder
/**
 * Unit tests for scenery-phet. Please run once in phet brand and once in brand=phet-io to cover all functionality.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */ import qunitStart from '../../chipper/js/browser/sim-tests/qunitStart.js';
import './accessibility/grab-drag/GrabDragInteractionTests.js';
import './ScientificNotationNodeTests.js';
import './StopwatchNodeTests.js';
// Since our tests are loaded asynchronously, we must direct QUnit to begin the tests
qunitStart();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9zY2VuZXJ5LXBoZXQtdGVzdHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVW5pdCB0ZXN0cyBmb3Igc2NlbmVyeS1waGV0LiBQbGVhc2UgcnVuIG9uY2UgaW4gcGhldCBicmFuZCBhbmQgb25jZSBpbiBicmFuZD1waGV0LWlvIHRvIGNvdmVyIGFsbCBmdW5jdGlvbmFsaXR5LlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IHF1bml0U3RhcnQgZnJvbSAnLi4vLi4vY2hpcHBlci9qcy9icm93c2VyL3NpbS10ZXN0cy9xdW5pdFN0YXJ0LmpzJztcbmltcG9ydCAnLi9hY2Nlc3NpYmlsaXR5L2dyYWItZHJhZy9HcmFiRHJhZ0ludGVyYWN0aW9uVGVzdHMuanMnO1xuaW1wb3J0ICcuL1NjaWVudGlmaWNOb3RhdGlvbk5vZGVUZXN0cy5qcyc7XG5pbXBvcnQgJy4vU3RvcHdhdGNoTm9kZVRlc3RzLmpzJztcblxuLy8gU2luY2Ugb3VyIHRlc3RzIGFyZSBsb2FkZWQgYXN5bmNocm9ub3VzbHksIHdlIG11c3QgZGlyZWN0IFFVbml0IHRvIGJlZ2luIHRoZSB0ZXN0c1xucXVuaXRTdGFydCgpOyJdLCJuYW1lcyI6WyJxdW5pdFN0YXJ0Il0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBRUQsT0FBT0EsZ0JBQWdCLG1EQUFtRDtBQUMxRSxPQUFPLHdEQUF3RDtBQUMvRCxPQUFPLG1DQUFtQztBQUMxQyxPQUFPLDBCQUEwQjtBQUVqQyxxRkFBcUY7QUFDckZBIn0=