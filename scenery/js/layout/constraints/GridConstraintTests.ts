// Copyright 2024, University of Colorado Boulder

/**
 * Unit tests for GridConstraint.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Node from '../../nodes/Node.js';
import Rectangle from '../../nodes/Rectangle.js';
import PixelComparisonTestUtils from '../../tests/PixelComparisonTestUtils.js';
import GridCell from './GridCell.js';
import GridConstraint from './GridConstraint.js';


QUnit.module( 'GridConstraint' );

if ( PixelComparisonTestUtils.platformSupportsPixelComparisonTests() ) {

  const DEFAULT_THRESHOLD = PixelComparisonTestUtils.DEFAULT_THRESHOLD;
  const testedRenderers = PixelComparisonTestUtils.TESTED_RENDERERS;

  //---------------------------------------------------------------------------------
  // Pixel Comparison: Simple GridConstraint
  //---------------------------------------------------------------------------------
  const gridConstraintUrl = 'data:image/png;base64,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QEBguQMECBAgQIAAgWABgRUMajkCBAgQIECAgMByBwgQIECAAAECwQICKxjUcgQIECBAgAABgeUOECBAgAABAgSCBQRWMKjlCBAgQIAAAQICyx0gQIAAAQIECAQLCKxgUMsRIECAAAECBASWO0CAAAECBAgQCBYQWMGgliNAgAABAgQICCx3gAABAgQIECAQLCCwgkEtR4AAAQIECBAQWO4AAQIECBAgQCBYQGAFg1qOAAECBAgQICCw3AECBAgQIECAQLCAwAoGtRwBAgQIECBAQGC5AwQIECBAgACBYAGBFQxqOQIECBAgQICAwHIHCBAgQIAAAQLBAgIrGNRyBAgQIECAAAGB5Q4QIECAAAECBIIFBFYwqOUIECBAgAABAgLLHSBAgAABAgQIBAsIrGBQyxEgQIAAAQIEBJY7QIAAAQIECBAIFhBYwaCWI0CAAAECBAgILHeAAAECBAgQIBAsILCCQS1HgAABAgQIEBBY7gABAgQIECBAIFhAYAWDWo4AAQIECBAgILDcAQIECBAgQIBAsIDACga1HAECBAgQIEBAYLkDBAgQIECAAIFgAYEVDGo5AgQIECBAgIDAcgcIECBAgAABAsECAisY1HIECBAgQIAAAYHlDhAgQIAAAQIEggUEVjCo5QgQIECAAAECAssdIECAAAECBAgECwisYFDLESBAgAABAgQEljtAgAABAgQIEAgWEFjBoJYjQIAAAQIECAgsd4AAAQIECBAgECwgsIJBLUeAAAECBAgQEFjuAAECBAgQIEAgWEBgBYNajgABAgQIECAgsNwBAgQIECBAgECwgMAKBrUcAQIECBAgQEBguQMECBAgQIAAgWABgRUMajkCBAgQIECAgMByBwgQIECAAAECwQICKxjUcgQIECBAgAABgeUOECBAgAABAgSCBQRWMKjlCBAgQIAAAQICyx0gQIAAAQIECAQLCKxgUMsRIECAAAECBASWO0CAAAECBAgQCBYQWMGgliNAgAABAgQICCx3gAABAgQIECAQLCCwgkEtR4AAAQIECBAQWO4AAQIECBAgQCBY4D+Bfypad4hx1wAAAABJRU5ErkJggg==';
  PixelComparisonTestUtils.multipleRendererTest( 'Simple GridConstraint',
    ( scene, display ) => {
      const firstChild = new Rectangle( 0, 0, 150, 30, { fill: 'red' } );
      const secondChild = new Rectangle( 0, 0, 150, 30, { fill: 'green' } );
      const thirdChild = new Rectangle( 0, 0, 150, 30, { fill: 'blue' } );
      firstChild.layoutOptions = { row: 0, column: 0 };
      secondChild.layoutOptions = { row: 1, column: 0 };
      thirdChild.layoutOptions = { row: 0, column: 1 };

      const firstParent = new Node( {
        children: [
          firstChild,
          new Rectangle( 0, 0, 400, 200, { stroke: 'black' } )
        ]
      } );
      const secondParent = new Node( {
        children: [
          secondChild,
          new Rectangle( 0, 0, 400, 200, { stroke: 'black' } )
        ],
        scale: 0.75
      } );
      const thirdParent = new Node( {
        children: [
          thirdChild,
          new Rectangle( 0, 0, 400, 200, { stroke: 'black' } )
        ],
        scale: 0.5
      } );

      const exampleNode = new Node( {
        children: [ firstParent, secondParent, thirdParent ]
      } );

      // Directly create the constraint, specifying a layoutOrigin to position the content
      const constraint = new GridConstraint( exampleNode, {
        layoutOriginProperty: new Property( new Vector2( 10, 10 ) ),
        xAlign: 'left',
        yAlign: 'top',
        spacing: 10
      } );

      // For the grid, cells are created and added (they can be removed/disposed later).
      constraint.addCell( new GridCell( constraint, firstChild, null ) );
      constraint.addCell( new GridCell( constraint, secondChild, null ) );
      constraint.addCell( new GridCell( constraint, thirdChild, null ) );
      constraint.updateLayout();

      scene.addChild( exampleNode );

      display.width = 600;
      display.height = 300;
      display.updateDisplay();
    }, gridConstraintUrl,
    DEFAULT_THRESHOLD, testedRenderers
  );
}