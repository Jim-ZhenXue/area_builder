// Copyright 2017-2024, University of Colorado Boulder

/**
 * Unit tests for phetcommon. Please run once in phet brand and once in brand=phet-io to cover all functionality.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import qunitStart from '../../chipper/js/browser/sim-tests/qunitStart.js';
import './model/FractionTests.js';
import './util/StringUtilsTests.js';

// Since our tests are loaded asynchronously, we must direct QUnit to begin the tests
qunitStart();