// Copyright 2022-2024, University of Colorado Boulder

/**
 * Demo for HeaterCoolerNode
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import { Node } from '../../../../scenery/js/imports.js';
import HeaterCoolerNode from '../../HeaterCoolerNode.js';

export default function demoHeaterCoolerNode( layoutBounds: Bounds2 ): Node {
  return new HeaterCoolerNode( new NumberProperty( 0, {
    range: new Range( -1, 1 ) // +1 for max heating, -1 for max cooling
  } ), { center: layoutBounds.center } );
}