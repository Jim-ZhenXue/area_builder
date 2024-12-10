// Copyright 2014-2023, University of Colorado Boulder
/**
 * Model of a rectangular board (like a white board or bulletin board) upon which various smaller shapes can be placed.
 *
 * @author John Blanco
 */ import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import { Color } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../AreaBuilderSharedConstants.js';
import PerimeterShape from './PerimeterShape.js';
// constants
const MOVEMENT_VECTORS = {
    // This sim is using screen conventions, meaning positive Y indicates down.
    up: new Vector2(0, -1),
    down: new Vector2(0, 1),
    left: new Vector2(-1, 0),
    right: new Vector2(1, 0)
};
// Functions used for scanning the edge of the perimeter.  These are a key component of the "marching squares"
// algorithm that is used for perimeter traversal, see the function where they are used for more information.
const SCAN_AREA_MOVEMENT_FUNCTIONS = [
    null,
    ()=>MOVEMENT_VECTORS.up,
    ()=>MOVEMENT_VECTORS.right,
    ()=>MOVEMENT_VECTORS.right,
    ()=>MOVEMENT_VECTORS.left,
    ()=>MOVEMENT_VECTORS.up,
    (previousStep)=>previousStep === MOVEMENT_VECTORS.up ? MOVEMENT_VECTORS.left : MOVEMENT_VECTORS.right,
    ()=>MOVEMENT_VECTORS.right,
    ()=>MOVEMENT_VECTORS.down,
    (previousStep)=>previousStep === MOVEMENT_VECTORS.right ? MOVEMENT_VECTORS.up : MOVEMENT_VECTORS.down,
    ()=>MOVEMENT_VECTORS.down,
    ()=>MOVEMENT_VECTORS.down,
    ()=>MOVEMENT_VECTORS.left,
    ()=>MOVEMENT_VECTORS.up,
    ()=>MOVEMENT_VECTORS.left,
    null // 15
];
let ShapePlacementBoard = class ShapePlacementBoard {
    // @private
    shapeOverlapsBoard(shape) {
        const shapePosition = shape.positionProperty.get();
        const shapeBounds = new Bounds2(shapePosition.x, shapePosition.y, shapePosition.x + shape.shape.bounds.getWidth(), shapePosition.y + shape.shape.bounds.getHeight());
        return this.bounds.intersectsBounds(shapeBounds);
    }
    /**
   * Place the provide shape on this board.  Returns false if the color does not match the handled color or if the
   * shape is not partially over the board.
   * @public
   * @param {MovableShape} movableShape A model shape
   */ placeShape(movableShape) {
        assert && assert(movableShape.userControlledProperty.get() === false, 'Shapes can\'t be placed when still controlled by user.');
        // Only place the shape if it is of the correct color and is positioned so that it overlaps with the board.
        if (this.colorHandled !== '*' && !movableShape.color.equals(this.colorHandled) || !this.shapeOverlapsBoard(movableShape)) {
            return false;
        }
        // Set the shape's visibility behavior based on whether a composite shape is being depicted.
        movableShape.invisibleWhenStillProperty.set(this.formCompositeProperty.get());
        // Determine where to place the shape on the board.
        let placementPosition = null;
        for(let surroundingPointsLevel = 0; surroundingPointsLevel < Math.max(this.numRows, this.numColumns) && placementPosition === null; surroundingPointsLevel++){
            const surroundingPoints = this.getOuterSurroundingPoints(movableShape.positionProperty.get(), surroundingPointsLevel);
            surroundingPoints.sort((p1, p2)=>p1.distance(movableShape.positionProperty.get()) - p2.distance(movableShape.positionProperty.get()));
            for(let pointIndex = 0; pointIndex < surroundingPoints.length && placementPosition === null; pointIndex++){
                if (this.isValidToPlace(movableShape, surroundingPoints[pointIndex])) {
                    placementPosition = surroundingPoints[pointIndex];
                }
            }
        }
        if (placementPosition === null) {
            // No valid position found - bail out.
            return false;
        }
        // add this shape to the list of incoming shapes
        this.addIncomingShape(movableShape, placementPosition, true);
        // If we made it to here, placement succeeded.
        return true;
    }
    /**
   * Add a shape directly to the specified cell.  This bypasses the placement process, and is generally used when
   * displaying solutions to challenges.  The shape will animate to the chosen cell.
   * @public
   * @param cellColumn
   * @param cellRow
   * @param movableShape
   */ addShapeDirectlyToCell(cellColumn, cellRow, movableShape) {
        // Set the shape's visibility behavior based on whether a composite shape is being depicted.
        movableShape.invisibleWhenStillProperty.set(this.formCompositeProperty.get());
        // Add the shape by putting it on the list of incoming shapes and setting its destination.
        this.addIncomingShape(movableShape, this.cellToModelCoords(cellColumn, cellRow, false));
    }
    /**
   * Get the proportion of area that match the provided color.
   * @param color
   * @public
   */ getProportionOfColor(color) {
        const compareColor = Color.toColor(color);
        let totalArea = 0;
        let areaOfSpecifiedColor = 0;
        this.residentShapes.forEach((residentShape)=>{
            const areaOfShape = residentShape.shape.bounds.width * residentShape.shape.bounds.height / (this.unitSquareLength * this.unitSquareLength);
            totalArea += areaOfShape;
            if (compareColor.equals(residentShape.color)) {
                areaOfSpecifiedColor += areaOfShape;
            }
        });
        const proportion = new Fraction(areaOfSpecifiedColor, totalArea);
        proportion.reduce();
        return proportion;
    }
    // @private, add a shape to the list of residents and make the other updates that go along with this.
    addResidentShape(movableShape, releaseOrphans) {
        // Make sure that the shape is not moving
        assert && assert(movableShape.positionProperty.get().equals(movableShape.destination), 'Error: Shapes should not become residents until they have completed animating.');
        // Made sure that the shape isn't already a resident.
        assert && assert(!this.isResidentShape(movableShape), 'Error: Attempt to add shape that is already a resident.');
        this.residentShapes.push(movableShape);
        // Make the appropriate updates.
        this.updateCellOccupation(movableShape, 'add');
        if (releaseOrphans) {
            this.releaseAnyOrphans();
        }
        this.updateAll();
    }
    //@private, remove the specified shape from the shape placement board
    removeResidentShape(movableShape) {
        assert && assert(this.isResidentShape(movableShape), 'Error: Attempt to remove shape that is not a resident.');
        const self = this;
        this.residentShapes.remove(movableShape);
        this.updateCellOccupation(movableShape, 'remove');
        this.updateAll();
        if (movableShape.userControlledProperty.get()) {
            // Watch the shape so that we can do needed updates when the user releases it.
            movableShape.userControlledProperty.lazyLink(function releaseOrphansIfDroppedOfBoard(userControlled) {
                assert && assert(!userControlled, 'Unexpected transition of userControlled flag.');
                if (!self.shapeOverlapsBoard(movableShape)) {
                    // This shape isn't coming back, so we need to trigger an orphan release.
                    self.releaseAnyOrphans();
                    self.updateAll();
                }
                movableShape.userControlledProperty.unlink(releaseOrphansIfDroppedOfBoard);
            });
        }
    }
    // @private, add the shape to the list of incoming shapes and set up a listener to move it to resident shapes
    addIncomingShape(movableShape, destination, releaseOrphans) {
        const self = this;
        movableShape.setDestination(destination, true);
        // The remaining code in this method assumes that the shape is animating to the new position, and will cause
        // odd results if it isn't, so we double check it here.
        assert && assert(movableShape.animatingProperty.get(), 'Shape is is expected to be animating');
        // The shape is moving to a spot on the board.  We don't want to add it to the list of resident shapes yet, or we
        // may trigger a change to the exterior and interior perimeters, but we need to keep a reference to it so that
        // the valid placement positions can be updated, especially in multi-touch environments.  So, basically, there is
        // an intermediate 'holding place' for incoming shapes.
        this.incomingShapes.push(movableShape);
        // Create a listener that will move this shape from the incoming shape list to the resident list once the
        // animation completes.
        function animationCompleteListener(animating) {
            if (!animating) {
                // Move the shape from the incoming list to the resident list.
                self.incomingShapes.splice(self.incomingShapes.indexOf(movableShape), 1);
                self.addResidentShape(movableShape, releaseOrphans);
                movableShape.animatingProperty.unlink(animationCompleteListener);
                if (self.updatesSuspended && self.incomingShapes.length === 0) {
                    // updates had been suspended (for better performance), and the last incoming shapes was added, so resume updates
                    self.updatesSuspended = false;
                    self.updateAll();
                }
            }
            // Set up a listener to remove this shape if and when the user grabs it.
            self.addRemovalListener(movableShape);
        }
        // Tag the listener so that it can be removed without firing if needed, such as when the board is cleared.
        this.tagListener(animationCompleteListener);
        // Hook up the listener.
        movableShape.animatingProperty.lazyLink(animationCompleteListener);
    }
    // @private, tag a listener for removal
    tagListener(listener) {
        listener.shapePlacementBoard = this;
    }
    // @private, check if listener function was tagged by this instance
    listenerTagMatches(listener) {
        return listener.shapePlacementBoard && listener.shapePlacementBoard === this;
    }
    //TODO https://github.com/phetsims/area-builder/issues/127 This is rather ugly.  Work with SR to improve or find alternative, or to bake into Axon.  Maybe a map.
    // @private, remove all observers from a property that have been tagged by this shape placement board.
    removeTaggedObservers(property) {
        const taggedObservers = [];
        property.forEachListener((observer)=>{
            if (this.listenerTagMatches(observer)) {
                taggedObservers.push(observer);
            }
        });
        taggedObservers.forEach((taggedObserver)=>{
            property.unlink(taggedObserver);
        });
    }
    // @private Convenience function for returning a cell or null if row or column are out of range.
    getCell(column, row) {
        if (column < 0 || row < 0 || column >= this.numColumns || row >= this.numRows) {
            return null;
        }
        return this.cells[column][row];
    }
    // @private Function for getting the occupant of the specified cell, does bounds checking.
    getCellOccupant(column, row) {
        const cell = this.getCell(column, row);
        return cell ? cell.occupiedBy : null;
    }
    /**
   * Set or clear the occupation status of the cells.
   * @param movableShape
   * @param operation
   * @private
   */ updateCellOccupation(movableShape, operation) {
        const xIndex = Utils.roundSymmetric((movableShape.destination.x - this.bounds.minX) / this.unitSquareLength);
        const yIndex = Utils.roundSymmetric((movableShape.destination.y - this.bounds.minY) / this.unitSquareLength);
        // Mark all cells occupied by this shape.
        for(let row = 0; row < movableShape.shape.bounds.height / this.unitSquareLength; row++){
            for(let column = 0; column < movableShape.shape.bounds.width / this.unitSquareLength; column++){
                this.cells[xIndex + column][yIndex + row].occupiedBy = operation === 'add' ? movableShape : null;
            }
        }
    }
    // @private
    updateAreaAndTotalPerimeter() {
        if (this.compositeShapeProperty.get().exteriorPerimeters.length <= 1) {
            let totalArea = 0;
            this.residentShapes.forEach((residentShape)=>{
                totalArea += residentShape.shape.bounds.width * residentShape.shape.bounds.height / (this.unitSquareLength * this.unitSquareLength);
            });
            let totalPerimeter = 0;
            this.compositeShapeProperty.get().exteriorPerimeters.forEach((exteriorPerimeter)=>{
                totalPerimeter += exteriorPerimeter.length;
            });
            this.compositeShapeProperty.get().interiorPerimeters.forEach((interiorPerimeter)=>{
                totalPerimeter += interiorPerimeter.length;
            });
            this.areaAndPerimeterProperty.set({
                area: totalArea,
                perimeter: totalPerimeter
            });
        } else {
            // Area and perimeter readings are currently invalid.
            this.areaAndPerimeterProperty.set({
                area: AreaBuilderSharedConstants.INVALID_VALUE,
                perimeter: AreaBuilderSharedConstants.INVALID_VALUE
            });
        }
    }
    /**
   * Convenience function for finding out whether a cell is occupied that handles out of bounds case (returns false).
   * @private
   * @param column
   * @param row
   */ isCellOccupied(column, row) {
        if (column >= this.numColumns || column < 0 || row >= this.numRows || row < 0) {
            return false;
        } else {
            return this.cells[column][row].occupiedBy !== null;
        }
    }
    /**
   * Function that returns true if a cell is occupied or if an incoming shape is heading for it.
   * @private
   * @param column
   * @param row
   */ isCellOccupiedNowOrSoon(column, row) {
        if (this.isCellOccupied(column, row)) {
            return true;
        }
        for(let i = 0; i < this.incomingShapes.length; i++){
            const targetCell = this.modelToCellVector(this.incomingShapes[i].destination);
            const normalizedWidth = Utils.roundSymmetric(this.incomingShapes[i].shape.bounds.width / this.unitSquareLength);
            const normalizedHeight = Utils.roundSymmetric(this.incomingShapes[i].shape.bounds.height / this.unitSquareLength);
            if (column >= targetCell.x && column < targetCell.x + normalizedWidth && row >= targetCell.y && row < targetCell.y + normalizedHeight) {
                return true;
            }
        }
        return false;
    }
    /**
   * Get the outer layer of grid points surrounding the given point.  The 2nd parameter indicates how many steps away
   * from the center 'shell' should be provided.
   * @private
   * @param point
   * @param levelsRemoved
   */ getOuterSurroundingPoints(point, levelsRemoved) {
        const normalizedPoints = [];
        // Get the closest point in cell coordinates.
        const normalizedStartingPoint = new Vector2(Math.floor((point.x - this.bounds.minX) / this.unitSquareLength) - levelsRemoved, Math.floor((point.y - this.bounds.minY) / this.unitSquareLength) - levelsRemoved);
        const squareSize = (levelsRemoved + 1) * 2;
        for(let row = 0; row < squareSize; row++){
            for(let column = 0; column < squareSize; column++){
                if ((row === 0 || row === squareSize - 1 || column === 0 || column === squareSize - 1) && column + normalizedStartingPoint.x <= this.numColumns && row + normalizedStartingPoint.y <= this.numRows) {
                    // This is an outer point, and is valid, so include it.
                    normalizedPoints.push(new Vector2(column + normalizedStartingPoint.x, row + normalizedStartingPoint.y));
                }
            }
        }
        const outerSurroundingPoints = [];
        normalizedPoints.forEach((p)=>{
            outerSurroundingPoints.push(this.cellToModelVector(p));
        });
        return outerSurroundingPoints;
    }
    /**
   * Determine whether it is valid to place the given shape at the given position.  For placement to be valid, the
   * shape can't overlap with any other shape, and must share at least one side with an occupied space.
   * @param movableShape
   * @param position
   * @returns {boolean}
   * @private
   */ isValidToPlace(movableShape, position) {
        const normalizedPosition = this.modelToCellVector(position);
        const normalizedWidth = Utils.roundSymmetric(movableShape.shape.bounds.width / this.unitSquareLength);
        const normalizedHeight = Utils.roundSymmetric(movableShape.shape.bounds.height / this.unitSquareLength);
        let row;
        let column;
        // Return false if the shape would go off the board if placed at this position.
        if (normalizedPosition.x < 0 || normalizedPosition.x + normalizedWidth > this.numColumns || normalizedPosition.y < 0 || normalizedPosition.y + normalizedHeight > this.numRows) {
            return false;
        }
        // If there are no other shapes on the board, any position on the board is valid.
        if (this.residentShapes.length === 0) {
            return true;
        }
        // Return false if this shape overlaps any previously placed shapes.
        for(row = 0; row < normalizedHeight; row++){
            for(column = 0; column < normalizedWidth; column++){
                if (this.isCellOccupiedNowOrSoon(normalizedPosition.x + column, normalizedPosition.y + row)) {
                    return false;
                }
            }
        }
        // If this board is not set to consolidate shapes, we've done enough, and this position is valid.
        if (!this.formCompositeProperty.get()) {
            return true;
        }
        // This position is only valid if the shape will share an edge with an already placed shape or an incoming shape,
        // since the 'formComposite' mode is enabled.
        for(row = 0; row < normalizedHeight; row++){
            for(column = 0; column < normalizedWidth; column++){
                if (this.isCellOccupiedNowOrSoon(normalizedPosition.x + column, normalizedPosition.y + row - 1) || this.isCellOccupiedNowOrSoon(normalizedPosition.x + column - 1, normalizedPosition.y + row) || this.isCellOccupiedNowOrSoon(normalizedPosition.x + column + 1, normalizedPosition.y + row) || this.isCellOccupiedNowOrSoon(normalizedPosition.x + column, normalizedPosition.y + row + 1)) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
   * Release all the shapes that are currently on this board and send them to their home positions.
   * @public
   * @param releaseMode - Controls what the shapes do after release, options are 'fade', 'animateHome', and
   * 'jumpHome'.  'jumpHome' is the default.
   */ releaseAllShapes(releaseMode) {
        const shapesToRelease = [];
        // Remove all listeners added to the shapes by this placement board.
        this.residentShapes.forEach((shape)=>{
            this.removeTaggedObservers(shape.userControlledProperty);
            shapesToRelease.push(shape);
        });
        this.incomingShapes.forEach((shape)=>{
            this.removeTaggedObservers(shape.animatingProperty);
            shapesToRelease.push(shape);
        });
        // Clear out all references to shapes placed on this board.
        this.residentShapes.clear();
        this.incomingShapes.length = 0;
        // Clear the cell array that tracks occupancy.
        for(let row = 0; row < this.numRows; row++){
            for(let column = 0; column < this.numColumns; column++){
                this.cells[column][row].occupiedBy = null;
            }
        }
        // Tell the shapes what to do after being released.
        shapesToRelease.forEach((shape)=>{
            if (typeof releaseMode === 'undefined' || releaseMode === 'jumpHome') {
                shape.returnToOrigin(false);
            } else if (releaseMode === 'animateHome') {
                shape.returnToOrigin(true);
            } else if (releaseMode === 'fade') {
                shape.fadeAway();
            } else {
                throw new Error('Unsupported release mode for shapes.');
            }
        });
        // Update board state.
        this.updateAll();
    }
    // @public - check if a shape is resident on the board
    isResidentShape(shape) {
        return this.residentShapes.includes(shape);
    }
    // @private
    releaseShape(shape) {
        assert && assert(this.isResidentShape(shape) || this.incomingShapes.contains(shape), 'Error: An attempt was made to release a shape that is not present.');
        if (this.isResidentShape(shape)) {
            this.removeTaggedObservers(shape.userControlledProperty);
            this.removeResidentShape(shape);
        } else if (this.incomingShapes.indexOf(shape) >= 0) {
            this.removeTaggedObservers(shape.animatingProperty);
            this.incomingShapes.splice(this.incomingShapes.indexOf(shape), 1);
        }
    }
    //@private
    cellToModelCoords(column, row) {
        return new Vector2(column * this.unitSquareLength + this.bounds.minX, row * this.unitSquareLength + this.bounds.minY);
    }
    //@private
    cellToModelVector(v) {
        return this.cellToModelCoords(v.x, v.y);
    }
    //@private
    modelToCellCoords(x, y) {
        return new Vector2(Utils.roundSymmetric((x - this.bounds.minX) / this.unitSquareLength), Utils.roundSymmetric((y - this.bounds.minY) / this.unitSquareLength));
    }
    //@private
    modelToCellVector(v) {
        return this.modelToCellCoords(v.x, v.y);
    }
    // @private
    createShapeFromPerimeterPoints(perimeterPoints) {
        const perimeterShape = new Shape();
        perimeterShape.moveToPoint(perimeterPoints[0]);
        for(let i = 1; i < perimeterPoints.length; i++){
            perimeterShape.lineToPoint(perimeterPoints[i]);
        }
        perimeterShape.close(); // Shouldn't be needed, but best to be sure.
        return perimeterShape;
    }
    // @private
    createShapeFromPerimeterList(perimeters) {
        const perimeterShape = new Shape();
        perimeters.forEach((perimeterPoints)=>{
            perimeterShape.moveToPoint(perimeterPoints[0]);
            for(let i = 1; i < perimeterPoints.length; i++){
                perimeterShape.lineToPoint(perimeterPoints[i]);
            }
            perimeterShape.close();
        });
        return perimeterShape;
    }
    /**
   * Marching squares algorithm for scanning the perimeter of a shape, see
   * https://en.wikipedia.org/wiki/Marching_squares or search the Internet for 'Marching Squares Algorithm' for more
   * information on this.
   * @private
   */ scanPerimeter(windowStart) {
        const scanWindow = windowStart.copy();
        let scanComplete = false;
        const perimeterPoints = [];
        let previousMovementVector = MOVEMENT_VECTORS.up; // Init this way allows algorithm to work for interior perimeters.
        while(!scanComplete){
            // Scan the current four-pixel area.
            const upLeftOccupied = this.isCellOccupied(scanWindow.x - 1, scanWindow.y - 1);
            const upRightOccupied = this.isCellOccupied(scanWindow.x, scanWindow.y - 1);
            const downLeftOccupied = this.isCellOccupied(scanWindow.x - 1, scanWindow.y);
            const downRightOccupied = this.isCellOccupied(scanWindow.x, scanWindow.y);
            // Map the scan to the one of 16 possible states.
            let marchingSquaresState = 0;
            if (upLeftOccupied) {
                marchingSquaresState |= 1;
            } // eslint-disable-line no-bitwise
            if (upRightOccupied) {
                marchingSquaresState |= 2;
            } // eslint-disable-line no-bitwise
            if (downLeftOccupied) {
                marchingSquaresState |= 4;
            } // eslint-disable-line no-bitwise
            if (downRightOccupied) {
                marchingSquaresState |= 8;
            } // eslint-disable-line no-bitwise
            assert && assert(marchingSquaresState !== 0 && marchingSquaresState !== 15, 'Marching squares algorithm reached invalid state.');
            // Convert and add this point to the perimeter points.
            perimeterPoints.push(this.cellToModelCoords(scanWindow.x, scanWindow.y));
            // Move the scan window to the next position.
            const movementVector = SCAN_AREA_MOVEMENT_FUNCTIONS[marchingSquaresState](previousMovementVector);
            scanWindow.add(movementVector);
            previousMovementVector = movementVector;
            if (scanWindow.equals(windowStart)) {
                scanComplete = true;
            }
        }
        return perimeterPoints;
    }
    // @private, Update the exterior and interior perimeters.
    updatePerimeters() {
        // The perimeters can only be computed for a single consolidated shape.
        if (!this.formCompositeProperty.get() || this.residentShapes.length === 0) {
            this.perimeter = 0;
            this.compositeShapeProperty.reset();
        } else {
            let row;
            let column;
            const exteriorPerimeters = [];
            // Identify each outer perimeter.  There may be more than one if the user is moving a shape that was previously
            // on this board, since any orphaned shapes are not released until the move is complete.
            const contiguousCellGroups = this.identifyContiguousCellGroups();
            contiguousCellGroups.forEach((cellGroup)=>{
                // Find the top left square of this group to use as a starting point.
                let topLeftCell = null;
                cellGroup.forEach((cell)=>{
                    if (topLeftCell === null || cell.row < topLeftCell.row || cell.row === topLeftCell.row && cell.column < topLeftCell.column) {
                        topLeftCell = cell;
                    }
                });
                // Scan the outer perimeter and add to list.
                const topLeftCellOfGroup = new Vector2(topLeftCell.column, topLeftCell.row);
                exteriorPerimeters.push(this.scanPerimeter(topLeftCellOfGroup));
            });
            // Scan for empty spaces enclosed within the outer perimeter(s).
            const outlineShape = this.createShapeFromPerimeterList(exteriorPerimeters);
            let enclosedSpaces = [];
            for(row = 0; row < this.numRows; row++){
                for(column = 0; column < this.numColumns; column++){
                    if (!this.isCellOccupied(column, row)) {
                        // This cell is empty.  Test if it is within the outline perimeter.
                        const cellCenterInModel = this.cellToModelCoords(column, row).addXY(this.unitSquareLength / 2, this.unitSquareLength / 2);
                        if (outlineShape.containsPoint(cellCenterInModel)) {
                            enclosedSpaces.push(new Vector2(column, row));
                        }
                    }
                }
            }
            // Map the internal perimeters
            const interiorPerimeters = [];
            while(enclosedSpaces.length > 0){
                // Locate the top left most space
                let topLeftSpace = enclosedSpaces[0];
                enclosedSpaces.forEach((cell)=>{
                    if (cell.y < topLeftSpace.y || cell.y === topLeftSpace.y && cell.x < topLeftSpace.x) {
                        topLeftSpace = cell;
                    }
                });
                // Map the interior perimeter.
                const enclosedPerimeterPoints = this.scanPerimeter(topLeftSpace);
                interiorPerimeters.push(enclosedPerimeterPoints);
                // Identify and save all spaces not enclosed by this perimeter.
                const perimeterShape = this.createShapeFromPerimeterPoints(enclosedPerimeterPoints);
                const leftoverEmptySpaces = [];
                enclosedSpaces.forEach((enclosedSpace)=>{
                    const positionPoint = this.cellToModelCoords(enclosedSpace.x, enclosedSpace.y);
                    const centerPoint = positionPoint.plusXY(this.unitSquareLength / 2, this.unitSquareLength / 2);
                    if (!perimeterShape.containsPoint(centerPoint)) {
                        // This space is not contained in the perimeter that was just mapped.
                        leftoverEmptySpaces.push(enclosedSpace);
                    }
                });
                // Set up for the next time through the loop.
                enclosedSpaces = leftoverEmptySpaces;
            }
            // Update externally visible properties.  Only update the perimeters if they have changed in order to minimize
            // work done in the view.
            if (!(this.perimeterListsEqual(exteriorPerimeters, this.compositeShapeProperty.get().exteriorPerimeters) && this.perimeterListsEqual(interiorPerimeters, this.compositeShapeProperty.get().interiorPerimeters))) {
                this.compositeShapeProperty.set(new PerimeterShape(exteriorPerimeters, interiorPerimeters, this.unitSquareLength, {
                    fillColor: this.compositeShapeFillColor,
                    edgeColor: this.compositeShapeEdgeColor
                }));
            }
        }
    }
    // @private
    perimeterPointsEqual(perimeter1, perimeter2) {
        assert && assert(Array.isArray(perimeter1) && Array.isArray(perimeter2), 'Invalid parameters for perimeterPointsEqual');
        if (perimeter1.length !== perimeter2.length) {
            return false;
        }
        return perimeter1.every((point, index)=>point.equals(perimeter2[index]));
    }
    // @private
    perimeterListsEqual(perimeterList1, perimeterList2) {
        assert && assert(Array.isArray(perimeterList1) && Array.isArray(perimeterList2), 'Invalid parameters for perimeterListsEqual');
        if (perimeterList1.length !== perimeterList2.length) {
            return false;
        }
        return perimeterList1.every((perimeterPoints, index)=>this.perimeterPointsEqual(perimeterPoints, perimeterList2[index]));
    }
    /**
   * Identify all cells that are adjacent to the provided cell and that are currently occupied by a shape.  Only
   * shapes that share an edge are considered to be adjacent, shapes that only touch at the corner don't count.  This
   * uses recursion.  It also relies on a flag that must be cleared for the cells before calling this algorithm.  The
   * flag is done for efficiency, but this could be changed to search through the list of cells in the cell group if
   * that flag method is too weird.
   *
   * @private
   * @param startCell
   * @param cellGroup
   */ identifyAdjacentOccupiedCells(startCell, cellGroup) {
        assert && assert(startCell.occupiedBy !== null, 'Usage error: Unoccupied cell passed to group identification.');
        assert && assert(!startCell.cataloged, 'Usage error: Cataloged cell passed to group identification algorithm.');
        // Catalog this cell.
        cellGroup.push(startCell);
        startCell.cataloged = true;
        // Check occupancy of each of the four adjecent cells.
        Object.keys(MOVEMENT_VECTORS).forEach((key)=>{
            const movementVector = MOVEMENT_VECTORS[key];
            const adjacentCell = this.getCell(startCell.column + movementVector.x, startCell.row + movementVector.y);
            if (adjacentCell !== null && adjacentCell.occupiedBy !== null && !adjacentCell.cataloged) {
                this.identifyAdjacentOccupiedCells(adjacentCell, cellGroup);
            }
        });
    }
    /**
   * Returns an array representing all contiguous groups of occupied cells.  Each group is a list of cells.
   * @private
   * @returns {Array}
   */ identifyContiguousCellGroups() {
        // Make a list of positions for all occupied cells.
        let ungroupedOccupiedCells = [];
        for(let row = 0; row < this.numRows; row++){
            for(let column = 0; column < this.numColumns; column++){
                const cell = this.cells[column][row];
                if (cell.occupiedBy !== null) {
                    ungroupedOccupiedCells.push(this.cells[column][row]);
                    // Clear the flag used by the search algorithm.
                    cell.cataloged = false;
                }
            }
        }
        // Identify the interconnected groups of cells.
        const contiguousCellGroups = [];
        while(ungroupedOccupiedCells.length > 0){
            const cellGroup = [];
            this.identifyAdjacentOccupiedCells(ungroupedOccupiedCells[0], cellGroup);
            contiguousCellGroups.push(cellGroup);
            ungroupedOccupiedCells = _.difference(ungroupedOccupiedCells, cellGroup);
        }
        return contiguousCellGroups;
    }
    /**
   * Release any shapes that are resident on the board but that don't share at least one edge with the largest
   * composite shape on the board.  Such shapes are referred to as 'orphans' and, when release, they are sent back to
   * the position where they were created.
   * @private
   */ releaseAnyOrphans() {
        // Orphans can only exist when operating in the 'formComposite' mode.
        if (this.formCompositeProperty.get()) {
            const contiguousCellGroups = this.identifyContiguousCellGroups();
            if (contiguousCellGroups.length > 1) {
                // There are orphans that should be released.  Determine which ones.
                let indexOfRetainedGroup = 0;
                contiguousCellGroups.forEach((group, index)=>{
                    if (group.length > contiguousCellGroups[indexOfRetainedGroup].length) {
                        indexOfRetainedGroup = index;
                    }
                });
                contiguousCellGroups.forEach((group, groupIndex)=>{
                    if (groupIndex !== indexOfRetainedGroup) {
                        group.forEach((cell)=>{
                            const movableShape = cell.occupiedBy;
                            if (movableShape !== null) {
                                this.releaseShape(movableShape);
                                movableShape.returnToOrigin(true);
                            }
                        });
                    }
                });
            }
        }
    }
    /**
   * Replace one of the composite shapes that currently resides on this board with a set of unit squares.  This is
   * generally done when a composite shape was placed on the board but we now want it treated as a bunch of smaller
   * unit squares instead.
   *
   * @param {MovableShape} originalShape
   * @param {Array.<MovableShape>} unitSquares Pieces that comprise the original shape, MUST BE CORRECTLY LOCATED
   * since this method does not relocate them to the appropriate places.
   * @public
   */ replaceShapeWithUnitSquares(originalShape, unitSquares) {
        assert && assert(this.isResidentShape(originalShape), 'Error: Specified shape to be replaced does not appear to be present.');
        // The following add and remove operations do not use the add and remove methods in order to avoid releasing
        // orphans (which could cause undesired behavior) and attribute updates (which are unnecessary).
        this.residentShapes.remove(originalShape);
        this.updateCellOccupation(originalShape, 'remove');
        unitSquares.forEach((movableUnitSquare)=>{
            this.residentShapes.push(movableUnitSquare);
            // Set up a listener to remove this shape when the user grabs it.
            this.addRemovalListener(movableUnitSquare);
            // Make some state updates.
            this.updateCellOccupation(movableUnitSquare, 'add');
        });
    }
    /**
   * adds a listener that will remove this shape from the board when the user grabs it
   * @param {MovableShape} movableShape
   * @private
   */ addRemovalListener(movableShape) {
        const self = this;
        function removalListener(userControlled) {
            assert && assert(userControlled === true, 'should only see shapes become user controlled after being added to a placement board');
            self.removeResidentShape(movableShape);
            movableShape.userControlledProperty.unlink(removalListener);
        }
        this.tagListener(removalListener);
        movableShape.userControlledProperty.lazyLink(removalListener);
    }
    // @public, set colors used for the composite shape shown for this board
    setCompositeShapeColorScheme(fillColor, edgeColor) {
        this.compositeShapeFillColor = fillColor;
        this.compositeShapeEdgeColor = edgeColor;
    }
    // @private, Update perimeter points, placement positions, total area, and total perimeter.
    updateAll() {
        if (!this.updatesSuspended) {
            this.updatePerimeters();
            this.updateAreaAndTotalPerimeter();
        }
    }
    /**
   * This method suspends updates so that a block of squares can be added without having to all the recalculations
   * for each one.  This is generally done for performance reasons in cases such as depicting the solution to a
   * challenge in the game.  The flag is automatically cleared when the last incoming shape is added as a resident
   * shape.
   * @public
   */ suspendUpdatesForBlockAdd() {
        this.updatesSuspended = true;
    }
    /**
   * Set the background shape.  The shape can optionally be centered horizontally and vertically when placed on the
   * board.
   *
   * @public
   * @param {PerimeterShape} perimeterShape The new background perimeterShape, or null to set no background
   * perimeterShape.
   * @param {boolean} centered True if the perimeterShape should be centered on the board (but still aligned with grid).
   */ setBackgroundShape(perimeterShape, centered) {
        if (perimeterShape === null) {
            this.backgroundShapeProperty.reset();
        } else {
            assert && assert(perimeterShape instanceof PerimeterShape, 'Background perimeterShape must be a PerimeterShape.');
            assert && assert(perimeterShape.getWidth() % this.unitSquareLength === 0 && perimeterShape.getHeight() % this.unitSquareLength === 0, 'Background shape width and height must be integer multiples of the unit square size.');
            if (centered) {
                const xOffset = this.bounds.minX + Math.floor((this.bounds.width - perimeterShape.getWidth()) / 2 / this.unitSquareLength) * this.unitSquareLength;
                const yOffset = this.bounds.minY + Math.floor((this.bounds.height - perimeterShape.getHeight()) / 2 / this.unitSquareLength) * this.unitSquareLength;
                this.backgroundShapeProperty.set(perimeterShape.translated(xOffset, yOffset));
            } else {
                this.backgroundShapeProperty.set(perimeterShape);
            }
        }
    }
    /**
   * @param {Dimension2} size
   * @param {number} unitSquareLength
   * @param {Vector2} position
   * @param {string || Color} colorHandled A string or Color object, can be wildcard string ('*') for all colors
   * @param {Property.<boolean>} showGridProperty
   * @param {Property.<boolean>} showDimensionsProperty
   */ constructor(size, unitSquareLength, position, colorHandled, showGridProperty, showDimensionsProperty){
        // The size should be an integer number of unit squares for both dimensions.
        assert && assert(size.width % unitSquareLength === 0 && size.height % unitSquareLength === 0, 'ShapePlacementBoard dimensions must be integral numbers of unit square dimensions');
        this.showGridProperty = showGridProperty;
        this.showDimensionsProperty = showDimensionsProperty;
        // Set the initial fill and edge colors for the composite shape (defined in Property declarations below).
        this.compositeShapeFillColor = colorHandled === '*' ? new Color(AreaBuilderSharedConstants.GREENISH_COLOR) : Color.toColor(colorHandled);
        this.compositeShapeEdgeColor = this.compositeShapeFillColor.colorUtilsDarker(AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR);
        // @public boolean Read/Write value that controls whether the placement board moves individual shapes that are
        // added to the board such that they form a single, contiguous, composite shape, or if it just snaps them to the
        // grid. The perimeter and area values are only updated when this is set to true.
        this.formCompositeProperty = new Property(true);
        // @public Read-only property that indicates the area and perimeter of the composite shape.  These must be
        // together in an object so that they can be updated simultaneously, otherwise race conditions can occur when
        // evaluating challenges.
        this.areaAndPerimeterProperty = new Property({
            area: 0,
            perimeter: 0 // {number||string} number when valid, string when invalid
        });
        // @public Read-only shape defined in terms of perimeter points that describes the composite shape created by all
        // of the individual shapes placed on the board by the user.
        this.compositeShapeProperty = new Property(new PerimeterShape([], [], unitSquareLength, {
            fillColor: this.compositeShapeFillColor,
            edgeColor: this.compositeShapeEdgeColor
        }));
        // @public Read-only shape that can be placed on the board, generally as a template over which the user can add
        // other shapes.  The shape is positioned relative to this board, not in absolute model space.  It should be
        // set through the method provided on this class rather than directly.
        this.backgroundShapeProperty = new Property(new PerimeterShape([], [], unitSquareLength, {
            fillColor: 'black'
        }));
        // @public Read/write value for controlling whether the background shape should show a grid when portrayed in the
        // view.
        this.showGridOnBackgroundShapeProperty = new Property(false);
        // Observable array of the shapes that have been placed on this board.
        this.residentShapes = createObservableArray(); // @public, read only
        // Non-dynamic public values.
        this.unitSquareLength = unitSquareLength; // @public
        this.bounds = new Bounds2(position.x, position.y, position.x + size.width, position.y + size.height); // @public
        this.colorHandled = colorHandled === '*' ? colorHandled : Color.toColor(colorHandled); // @public
        // Private variables
        this.numRows = size.height / unitSquareLength; // @private
        this.numColumns = size.width / unitSquareLength; // @private
        this.incomingShapes = []; // @private, {Array.<MovableShape>}, list of shapes that are animating to a spot on this board but aren't here yet
        this.updatesSuspended = false; // @private, used to improve performance when adding a bunch of shapes at once to the board
        // For efficiency and simplicity in evaluating the interior and exterior perimeter, identifying orphaned shapes,
        // and so forth, a 2D array is used to track various state information about the 'cells' that correspond to the
        // positions on this board where shapes may be placed.
        this.cells = []; //@private
        for(let column = 0; column < this.numColumns; column++){
            const currentRow = [];
            for(let row = 0; row < this.numRows; row++){
                // Add an object that defines the information internally tracked for each cell.
                currentRow.push({
                    column: column,
                    row: row,
                    occupiedBy: null,
                    cataloged: false,
                    catalogedBy: null // used by group identification algorithm
                });
            }
            this.cells.push(currentRow);
        }
    }
};
areaBuilder.register('ShapePlacementBoard', ShapePlacementBoard);
export default ShapePlacementBoard;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9jb21tb24vbW9kZWwvU2hhcGVQbGFjZW1lbnRCb2FyZC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBNb2RlbCBvZiBhIHJlY3Rhbmd1bGFyIGJvYXJkIChsaWtlIGEgd2hpdGUgYm9hcmQgb3IgYnVsbGV0aW4gYm9hcmQpIHVwb24gd2hpY2ggdmFyaW91cyBzbWFsbGVyIHNoYXBlcyBjYW4gYmUgcGxhY2VkLlxuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cbiAqL1xuXG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEZyYWN0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvbW9kZWwvRnJhY3Rpb24uanMnO1xuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IGFyZWFCdWlsZGVyIGZyb20gJy4uLy4uL2FyZWFCdWlsZGVyLmpzJztcbmltcG9ydCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cyBmcm9tICcuLi9BcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5qcyc7XG5pbXBvcnQgUGVyaW1ldGVyU2hhcGUgZnJvbSAnLi9QZXJpbWV0ZXJTaGFwZS5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgTU9WRU1FTlRfVkVDVE9SUyA9IHtcbiAgLy8gVGhpcyBzaW0gaXMgdXNpbmcgc2NyZWVuIGNvbnZlbnRpb25zLCBtZWFuaW5nIHBvc2l0aXZlIFkgaW5kaWNhdGVzIGRvd24uXG4gIHVwOiBuZXcgVmVjdG9yMiggMCwgLTEgKSxcbiAgZG93bjogbmV3IFZlY3RvcjIoIDAsIDEgKSxcbiAgbGVmdDogbmV3IFZlY3RvcjIoIC0xLCAwICksXG4gIHJpZ2h0OiBuZXcgVmVjdG9yMiggMSwgMCApXG59O1xuXG4vLyBGdW5jdGlvbnMgdXNlZCBmb3Igc2Nhbm5pbmcgdGhlIGVkZ2Ugb2YgdGhlIHBlcmltZXRlci4gIFRoZXNlIGFyZSBhIGtleSBjb21wb25lbnQgb2YgdGhlIFwibWFyY2hpbmcgc3F1YXJlc1wiXG4vLyBhbGdvcml0aG0gdGhhdCBpcyB1c2VkIGZvciBwZXJpbWV0ZXIgdHJhdmVyc2FsLCBzZWUgdGhlIGZ1bmN0aW9uIHdoZXJlIHRoZXkgYXJlIHVzZWQgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG5jb25zdCBTQ0FOX0FSRUFfTU9WRU1FTlRfRlVOQ1RJT05TID0gW1xuICBudWxsLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMFxuICAoKSA9PiBNT1ZFTUVOVF9WRUNUT1JTLnVwLCAgICAgIC8vIDFcbiAgKCkgPT4gTU9WRU1FTlRfVkVDVE9SUy5yaWdodCwgICAvLyAyXG4gICgpID0+IE1PVkVNRU5UX1ZFQ1RPUlMucmlnaHQsICAgLy8gM1xuICAoKSA9PiBNT1ZFTUVOVF9WRUNUT1JTLmxlZnQsICAgIC8vIDRcbiAgKCkgPT4gTU9WRU1FTlRfVkVDVE9SUy51cCwgICAgICAvLyA1XG4gIHByZXZpb3VzU3RlcCA9PiBwcmV2aW91c1N0ZXAgPT09IE1PVkVNRU5UX1ZFQ1RPUlMudXAgPyBNT1ZFTUVOVF9WRUNUT1JTLmxlZnQgOiBNT1ZFTUVOVF9WRUNUT1JTLnJpZ2h0LCAgLy8gNlxuICAoKSA9PiBNT1ZFTUVOVF9WRUNUT1JTLnJpZ2h0LCAgIC8vIDdcbiAgKCkgPT4gTU9WRU1FTlRfVkVDVE9SUy5kb3duLCAgICAvLyA4XG4gIHByZXZpb3VzU3RlcCA9PiBwcmV2aW91c1N0ZXAgPT09IE1PVkVNRU5UX1ZFQ1RPUlMucmlnaHQgPyBNT1ZFTUVOVF9WRUNUT1JTLnVwIDogTU9WRU1FTlRfVkVDVE9SUy5kb3duLCAgLy8gOVxuICAoKSA9PiBNT1ZFTUVOVF9WRUNUT1JTLmRvd24sICAgLy8gMTBcbiAgKCkgPT4gTU9WRU1FTlRfVkVDVE9SUy5kb3duLCAgIC8vIDExXG4gICgpID0+IE1PVkVNRU5UX1ZFQ1RPUlMubGVmdCwgICAvLyAxMlxuICAoKSA9PiBNT1ZFTUVOVF9WRUNUT1JTLnVwLCAgICAgLy8gMTNcbiAgKCkgPT4gTU9WRU1FTlRfVkVDVE9SUy5sZWZ0LCAgIC8vIDE0XG4gIG51bGwgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAxNVxuXTtcblxuY2xhc3MgU2hhcGVQbGFjZW1lbnRCb2FyZCB7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RGltZW5zaW9uMn0gc2l6ZVxuICAgKiBAcGFyYW0ge251bWJlcn0gdW5pdFNxdWFyZUxlbmd0aFxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nIHx8IENvbG9yfSBjb2xvckhhbmRsZWQgQSBzdHJpbmcgb3IgQ29sb3Igb2JqZWN0LCBjYW4gYmUgd2lsZGNhcmQgc3RyaW5nICgnKicpIGZvciBhbGwgY29sb3JzXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBzaG93R3JpZFByb3BlcnR5XG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBzaG93RGltZW5zaW9uc1Byb3BlcnR5XG4gICAqL1xuICBjb25zdHJ1Y3Rvciggc2l6ZSwgdW5pdFNxdWFyZUxlbmd0aCwgcG9zaXRpb24sIGNvbG9ySGFuZGxlZCwgc2hvd0dyaWRQcm9wZXJ0eSwgc2hvd0RpbWVuc2lvbnNQcm9wZXJ0eSApIHtcblxuICAgIC8vIFRoZSBzaXplIHNob3VsZCBiZSBhbiBpbnRlZ2VyIG51bWJlciBvZiB1bml0IHNxdWFyZXMgZm9yIGJvdGggZGltZW5zaW9ucy5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzaXplLndpZHRoICUgdW5pdFNxdWFyZUxlbmd0aCA9PT0gMCAmJiBzaXplLmhlaWdodCAlIHVuaXRTcXVhcmVMZW5ndGggPT09IDAsXG4gICAgICAnU2hhcGVQbGFjZW1lbnRCb2FyZCBkaW1lbnNpb25zIG11c3QgYmUgaW50ZWdyYWwgbnVtYmVycyBvZiB1bml0IHNxdWFyZSBkaW1lbnNpb25zJyApO1xuXG4gICAgdGhpcy5zaG93R3JpZFByb3BlcnR5ID0gc2hvd0dyaWRQcm9wZXJ0eTtcbiAgICB0aGlzLnNob3dEaW1lbnNpb25zUHJvcGVydHkgPSBzaG93RGltZW5zaW9uc1Byb3BlcnR5O1xuXG4gICAgLy8gU2V0IHRoZSBpbml0aWFsIGZpbGwgYW5kIGVkZ2UgY29sb3JzIGZvciB0aGUgY29tcG9zaXRlIHNoYXBlIChkZWZpbmVkIGluIFByb3BlcnR5IGRlY2xhcmF0aW9ucyBiZWxvdykuXG4gICAgdGhpcy5jb21wb3NpdGVTaGFwZUZpbGxDb2xvciA9IGNvbG9ySGFuZGxlZCA9PT0gJyonID8gbmV3IENvbG9yKCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5HUkVFTklTSF9DT0xPUiApIDogQ29sb3IudG9Db2xvciggY29sb3JIYW5kbGVkICk7XG4gICAgdGhpcy5jb21wb3NpdGVTaGFwZUVkZ2VDb2xvciA9IHRoaXMuY29tcG9zaXRlU2hhcGVGaWxsQ29sb3IuY29sb3JVdGlsc0RhcmtlciggQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuUEVSSU1FVEVSX0RBUktFTl9GQUNUT1IgKTtcblxuICAgIC8vIEBwdWJsaWMgYm9vbGVhbiBSZWFkL1dyaXRlIHZhbHVlIHRoYXQgY29udHJvbHMgd2hldGhlciB0aGUgcGxhY2VtZW50IGJvYXJkIG1vdmVzIGluZGl2aWR1YWwgc2hhcGVzIHRoYXQgYXJlXG4gICAgLy8gYWRkZWQgdG8gdGhlIGJvYXJkIHN1Y2ggdGhhdCB0aGV5IGZvcm0gYSBzaW5nbGUsIGNvbnRpZ3VvdXMsIGNvbXBvc2l0ZSBzaGFwZSwgb3IgaWYgaXQganVzdCBzbmFwcyB0aGVtIHRvIHRoZVxuICAgIC8vIGdyaWQuIFRoZSBwZXJpbWV0ZXIgYW5kIGFyZWEgdmFsdWVzIGFyZSBvbmx5IHVwZGF0ZWQgd2hlbiB0aGlzIGlzIHNldCB0byB0cnVlLlxuICAgIHRoaXMuZm9ybUNvbXBvc2l0ZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCB0cnVlICk7XG5cbiAgICAvLyBAcHVibGljIFJlYWQtb25seSBwcm9wZXJ0eSB0aGF0IGluZGljYXRlcyB0aGUgYXJlYSBhbmQgcGVyaW1ldGVyIG9mIHRoZSBjb21wb3NpdGUgc2hhcGUuICBUaGVzZSBtdXN0IGJlXG4gICAgLy8gdG9nZXRoZXIgaW4gYW4gb2JqZWN0IHNvIHRoYXQgdGhleSBjYW4gYmUgdXBkYXRlZCBzaW11bHRhbmVvdXNseSwgb3RoZXJ3aXNlIHJhY2UgY29uZGl0aW9ucyBjYW4gb2NjdXIgd2hlblxuICAgIC8vIGV2YWx1YXRpbmcgY2hhbGxlbmdlcy5cbiAgICB0aGlzLmFyZWFBbmRQZXJpbWV0ZXJQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSgge1xuICAgICAgYXJlYTogMCwgLy8ge251bWJlcnx8c3RyaW5nfSAtIG51bWJlciB3aGVuIHZhbGlkLCBzdHJpbmcgd2hlbiBpbnZhbGlkXG4gICAgICBwZXJpbWV0ZXI6IDAgIC8vIHtudW1iZXJ8fHN0cmluZ30gbnVtYmVyIHdoZW4gdmFsaWQsIHN0cmluZyB3aGVuIGludmFsaWRcbiAgICB9ICk7XG5cbiAgICAvLyBAcHVibGljIFJlYWQtb25seSBzaGFwZSBkZWZpbmVkIGluIHRlcm1zIG9mIHBlcmltZXRlciBwb2ludHMgdGhhdCBkZXNjcmliZXMgdGhlIGNvbXBvc2l0ZSBzaGFwZSBjcmVhdGVkIGJ5IGFsbFxuICAgIC8vIG9mIHRoZSBpbmRpdmlkdWFsIHNoYXBlcyBwbGFjZWQgb24gdGhlIGJvYXJkIGJ5IHRoZSB1c2VyLlxuICAgIHRoaXMuY29tcG9zaXRlU2hhcGVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbmV3IFBlcmltZXRlclNoYXBlKCBbXSwgW10sIHVuaXRTcXVhcmVMZW5ndGgsIHtcbiAgICAgIGZpbGxDb2xvcjogdGhpcy5jb21wb3NpdGVTaGFwZUZpbGxDb2xvcixcbiAgICAgIGVkZ2VDb2xvcjogdGhpcy5jb21wb3NpdGVTaGFwZUVkZ2VDb2xvclxuICAgIH0gKSApO1xuXG4gICAgLy8gQHB1YmxpYyBSZWFkLW9ubHkgc2hhcGUgdGhhdCBjYW4gYmUgcGxhY2VkIG9uIHRoZSBib2FyZCwgZ2VuZXJhbGx5IGFzIGEgdGVtcGxhdGUgb3ZlciB3aGljaCB0aGUgdXNlciBjYW4gYWRkXG4gICAgLy8gb3RoZXIgc2hhcGVzLiAgVGhlIHNoYXBlIGlzIHBvc2l0aW9uZWQgcmVsYXRpdmUgdG8gdGhpcyBib2FyZCwgbm90IGluIGFic29sdXRlIG1vZGVsIHNwYWNlLiAgSXQgc2hvdWxkIGJlXG4gICAgLy8gc2V0IHRocm91Z2ggdGhlIG1ldGhvZCBwcm92aWRlZCBvbiB0aGlzIGNsYXNzIHJhdGhlciB0aGFuIGRpcmVjdGx5LlxuICAgIHRoaXMuYmFja2dyb3VuZFNoYXBlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoXG4gICAgICBuZXcgUGVyaW1ldGVyU2hhcGUoIFtdLCBbXSwgdW5pdFNxdWFyZUxlbmd0aCwgeyBmaWxsQ29sb3I6ICdibGFjaycgfSApXG4gICAgKTtcblxuICAgIC8vIEBwdWJsaWMgUmVhZC93cml0ZSB2YWx1ZSBmb3IgY29udHJvbGxpbmcgd2hldGhlciB0aGUgYmFja2dyb3VuZCBzaGFwZSBzaG91bGQgc2hvdyBhIGdyaWQgd2hlbiBwb3J0cmF5ZWQgaW4gdGhlXG4gICAgLy8gdmlldy5cbiAgICB0aGlzLnNob3dHcmlkT25CYWNrZ3JvdW5kU2hhcGVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggZmFsc2UgKTtcblxuICAgIC8vIE9ic2VydmFibGUgYXJyYXkgb2YgdGhlIHNoYXBlcyB0aGF0IGhhdmUgYmVlbiBwbGFjZWQgb24gdGhpcyBib2FyZC5cbiAgICB0aGlzLnJlc2lkZW50U2hhcGVzID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7IC8vIEBwdWJsaWMsIHJlYWQgb25seVxuXG4gICAgLy8gTm9uLWR5bmFtaWMgcHVibGljIHZhbHVlcy5cbiAgICB0aGlzLnVuaXRTcXVhcmVMZW5ndGggPSB1bml0U3F1YXJlTGVuZ3RoOyAvLyBAcHVibGljXG4gICAgdGhpcy5ib3VuZHMgPSBuZXcgQm91bmRzMiggcG9zaXRpb24ueCwgcG9zaXRpb24ueSwgcG9zaXRpb24ueCArIHNpemUud2lkdGgsIHBvc2l0aW9uLnkgKyBzaXplLmhlaWdodCApOyAvLyBAcHVibGljXG4gICAgdGhpcy5jb2xvckhhbmRsZWQgPSBjb2xvckhhbmRsZWQgPT09ICcqJyA/IGNvbG9ySGFuZGxlZCA6IENvbG9yLnRvQ29sb3IoIGNvbG9ySGFuZGxlZCApOyAvLyBAcHVibGljXG5cbiAgICAvLyBQcml2YXRlIHZhcmlhYmxlc1xuICAgIHRoaXMubnVtUm93cyA9IHNpemUuaGVpZ2h0IC8gdW5pdFNxdWFyZUxlbmd0aDsgLy8gQHByaXZhdGVcbiAgICB0aGlzLm51bUNvbHVtbnMgPSBzaXplLndpZHRoIC8gdW5pdFNxdWFyZUxlbmd0aDsgLy8gQHByaXZhdGVcbiAgICB0aGlzLmluY29taW5nU2hhcGVzID0gW107IC8vIEBwcml2YXRlLCB7QXJyYXkuPE1vdmFibGVTaGFwZT59LCBsaXN0IG9mIHNoYXBlcyB0aGF0IGFyZSBhbmltYXRpbmcgdG8gYSBzcG90IG9uIHRoaXMgYm9hcmQgYnV0IGFyZW4ndCBoZXJlIHlldFxuICAgIHRoaXMudXBkYXRlc1N1c3BlbmRlZCA9IGZhbHNlOyAvLyBAcHJpdmF0ZSwgdXNlZCB0byBpbXByb3ZlIHBlcmZvcm1hbmNlIHdoZW4gYWRkaW5nIGEgYnVuY2ggb2Ygc2hhcGVzIGF0IG9uY2UgdG8gdGhlIGJvYXJkXG5cbiAgICAvLyBGb3IgZWZmaWNpZW5jeSBhbmQgc2ltcGxpY2l0eSBpbiBldmFsdWF0aW5nIHRoZSBpbnRlcmlvciBhbmQgZXh0ZXJpb3IgcGVyaW1ldGVyLCBpZGVudGlmeWluZyBvcnBoYW5lZCBzaGFwZXMsXG4gICAgLy8gYW5kIHNvIGZvcnRoLCBhIDJEIGFycmF5IGlzIHVzZWQgdG8gdHJhY2sgdmFyaW91cyBzdGF0ZSBpbmZvcm1hdGlvbiBhYm91dCB0aGUgJ2NlbGxzJyB0aGF0IGNvcnJlc3BvbmQgdG8gdGhlXG4gICAgLy8gcG9zaXRpb25zIG9uIHRoaXMgYm9hcmQgd2hlcmUgc2hhcGVzIG1heSBiZSBwbGFjZWQuXG4gICAgdGhpcy5jZWxscyA9IFtdOyAvL0Bwcml2YXRlXG4gICAgZm9yICggbGV0IGNvbHVtbiA9IDA7IGNvbHVtbiA8IHRoaXMubnVtQ29sdW1uczsgY29sdW1uKysgKSB7XG4gICAgICBjb25zdCBjdXJyZW50Um93ID0gW107XG4gICAgICBmb3IgKCBsZXQgcm93ID0gMDsgcm93IDwgdGhpcy5udW1Sb3dzOyByb3crKyApIHtcbiAgICAgICAgLy8gQWRkIGFuIG9iamVjdCB0aGF0IGRlZmluZXMgdGhlIGluZm9ybWF0aW9uIGludGVybmFsbHkgdHJhY2tlZCBmb3IgZWFjaCBjZWxsLlxuICAgICAgICBjdXJyZW50Um93LnB1c2goIHtcbiAgICAgICAgICBjb2x1bW46IGNvbHVtbixcbiAgICAgICAgICByb3c6IHJvdyxcbiAgICAgICAgICBvY2N1cGllZEJ5OiBudWxsLCAgIC8vIHRoZSBzaGFwZSBvY2N1cHlpbmcgdGhpcyBjZWxsLCBudWxsIGlmIG5vbmVcbiAgICAgICAgICBjYXRhbG9nZWQ6IGZhbHNlLCAgIC8vIHVzZWQgYnkgZ3JvdXAgaWRlbnRpZmljYXRpb24gYWxnb3JpdGhtXG4gICAgICAgICAgY2F0YWxvZ2VkQnk6IG51bGwgICAvLyB1c2VkIGJ5IGdyb3VwIGlkZW50aWZpY2F0aW9uIGFsZ29yaXRobVxuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgICB0aGlzLmNlbGxzLnB1c2goIGN1cnJlbnRSb3cgKTtcbiAgICB9XG4gIH1cblxuICAvLyBAcHJpdmF0ZVxuICBzaGFwZU92ZXJsYXBzQm9hcmQoIHNoYXBlICkge1xuICAgIGNvbnN0IHNoYXBlUG9zaXRpb24gPSBzaGFwZS5wb3NpdGlvblByb3BlcnR5LmdldCgpO1xuICAgIGNvbnN0IHNoYXBlQm91bmRzID0gbmV3IEJvdW5kczIoXG4gICAgICBzaGFwZVBvc2l0aW9uLngsXG4gICAgICBzaGFwZVBvc2l0aW9uLnksXG4gICAgICBzaGFwZVBvc2l0aW9uLnggKyBzaGFwZS5zaGFwZS5ib3VuZHMuZ2V0V2lkdGgoKSxcbiAgICAgIHNoYXBlUG9zaXRpb24ueSArIHNoYXBlLnNoYXBlLmJvdW5kcy5nZXRIZWlnaHQoKVxuICAgICk7XG4gICAgcmV0dXJuIHRoaXMuYm91bmRzLmludGVyc2VjdHNCb3VuZHMoIHNoYXBlQm91bmRzICk7XG4gIH1cblxuICAvKipcbiAgICogUGxhY2UgdGhlIHByb3ZpZGUgc2hhcGUgb24gdGhpcyBib2FyZC4gIFJldHVybnMgZmFsc2UgaWYgdGhlIGNvbG9yIGRvZXMgbm90IG1hdGNoIHRoZSBoYW5kbGVkIGNvbG9yIG9yIGlmIHRoZVxuICAgKiBzaGFwZSBpcyBub3QgcGFydGlhbGx5IG92ZXIgdGhlIGJvYXJkLlxuICAgKiBAcHVibGljXG4gICAqIEBwYXJhbSB7TW92YWJsZVNoYXBlfSBtb3ZhYmxlU2hhcGUgQSBtb2RlbCBzaGFwZVxuICAgKi9cbiAgcGxhY2VTaGFwZSggbW92YWJsZVNoYXBlICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoXG4gICAgICBtb3ZhYmxlU2hhcGUudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5nZXQoKSA9PT0gZmFsc2UsXG4gICAgICAnU2hhcGVzIGNhblxcJ3QgYmUgcGxhY2VkIHdoZW4gc3RpbGwgY29udHJvbGxlZCBieSB1c2VyLidcbiAgICApO1xuICAgIC8vIE9ubHkgcGxhY2UgdGhlIHNoYXBlIGlmIGl0IGlzIG9mIHRoZSBjb3JyZWN0IGNvbG9yIGFuZCBpcyBwb3NpdGlvbmVkIHNvIHRoYXQgaXQgb3ZlcmxhcHMgd2l0aCB0aGUgYm9hcmQuXG4gICAgaWYgKCAoIHRoaXMuY29sb3JIYW5kbGVkICE9PSAnKicgJiYgIW1vdmFibGVTaGFwZS5jb2xvci5lcXVhbHMoIHRoaXMuY29sb3JIYW5kbGVkICkgKSB8fCAhdGhpcy5zaGFwZU92ZXJsYXBzQm9hcmQoIG1vdmFibGVTaGFwZSApICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFNldCB0aGUgc2hhcGUncyB2aXNpYmlsaXR5IGJlaGF2aW9yIGJhc2VkIG9uIHdoZXRoZXIgYSBjb21wb3NpdGUgc2hhcGUgaXMgYmVpbmcgZGVwaWN0ZWQuXG4gICAgbW92YWJsZVNoYXBlLmludmlzaWJsZVdoZW5TdGlsbFByb3BlcnR5LnNldCggdGhpcy5mb3JtQ29tcG9zaXRlUHJvcGVydHkuZ2V0KCkgKTtcblxuICAgIC8vIERldGVybWluZSB3aGVyZSB0byBwbGFjZSB0aGUgc2hhcGUgb24gdGhlIGJvYXJkLlxuICAgIGxldCBwbGFjZW1lbnRQb3NpdGlvbiA9IG51bGw7XG4gICAgZm9yICggbGV0IHN1cnJvdW5kaW5nUG9pbnRzTGV2ZWwgPSAwO1xuICAgICAgICAgIHN1cnJvdW5kaW5nUG9pbnRzTGV2ZWwgPCBNYXRoLm1heCggdGhpcy5udW1Sb3dzLCB0aGlzLm51bUNvbHVtbnMgKSAmJiBwbGFjZW1lbnRQb3NpdGlvbiA9PT0gbnVsbDtcbiAgICAgICAgICBzdXJyb3VuZGluZ1BvaW50c0xldmVsKysgKSB7XG5cbiAgICAgIGNvbnN0IHN1cnJvdW5kaW5nUG9pbnRzID0gdGhpcy5nZXRPdXRlclN1cnJvdW5kaW5nUG9pbnRzKFxuICAgICAgICBtb3ZhYmxlU2hhcGUucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSxcbiAgICAgICAgc3Vycm91bmRpbmdQb2ludHNMZXZlbFxuICAgICAgKTtcbiAgICAgIHN1cnJvdW5kaW5nUG9pbnRzLnNvcnQoICggcDEsIHAyICkgPT4gcDEuZGlzdGFuY2UoIG1vdmFibGVTaGFwZS5wb3NpdGlvblByb3BlcnR5LmdldCgpICkgLSBwMi5kaXN0YW5jZSggbW92YWJsZVNoYXBlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKSApO1xuICAgICAgZm9yICggbGV0IHBvaW50SW5kZXggPSAwOyBwb2ludEluZGV4IDwgc3Vycm91bmRpbmdQb2ludHMubGVuZ3RoICYmIHBsYWNlbWVudFBvc2l0aW9uID09PSBudWxsOyBwb2ludEluZGV4KysgKSB7XG4gICAgICAgIGlmICggdGhpcy5pc1ZhbGlkVG9QbGFjZSggbW92YWJsZVNoYXBlLCBzdXJyb3VuZGluZ1BvaW50c1sgcG9pbnRJbmRleCBdICkgKSB7XG4gICAgICAgICAgcGxhY2VtZW50UG9zaXRpb24gPSBzdXJyb3VuZGluZ1BvaW50c1sgcG9pbnRJbmRleCBdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmICggcGxhY2VtZW50UG9zaXRpb24gPT09IG51bGwgKSB7XG4gICAgICAvLyBObyB2YWxpZCBwb3NpdGlvbiBmb3VuZCAtIGJhaWwgb3V0LlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIGFkZCB0aGlzIHNoYXBlIHRvIHRoZSBsaXN0IG9mIGluY29taW5nIHNoYXBlc1xuICAgIHRoaXMuYWRkSW5jb21pbmdTaGFwZSggbW92YWJsZVNoYXBlLCBwbGFjZW1lbnRQb3NpdGlvbiwgdHJ1ZSApO1xuXG4gICAgLy8gSWYgd2UgbWFkZSBpdCB0byBoZXJlLCBwbGFjZW1lbnQgc3VjY2VlZGVkLlxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHNoYXBlIGRpcmVjdGx5IHRvIHRoZSBzcGVjaWZpZWQgY2VsbC4gIFRoaXMgYnlwYXNzZXMgdGhlIHBsYWNlbWVudCBwcm9jZXNzLCBhbmQgaXMgZ2VuZXJhbGx5IHVzZWQgd2hlblxuICAgKiBkaXNwbGF5aW5nIHNvbHV0aW9ucyB0byBjaGFsbGVuZ2VzLiAgVGhlIHNoYXBlIHdpbGwgYW5pbWF0ZSB0byB0aGUgY2hvc2VuIGNlbGwuXG4gICAqIEBwdWJsaWNcbiAgICogQHBhcmFtIGNlbGxDb2x1bW5cbiAgICogQHBhcmFtIGNlbGxSb3dcbiAgICogQHBhcmFtIG1vdmFibGVTaGFwZVxuICAgKi9cbiAgYWRkU2hhcGVEaXJlY3RseVRvQ2VsbCggY2VsbENvbHVtbiwgY2VsbFJvdywgbW92YWJsZVNoYXBlICkge1xuXG4gICAgLy8gU2V0IHRoZSBzaGFwZSdzIHZpc2liaWxpdHkgYmVoYXZpb3IgYmFzZWQgb24gd2hldGhlciBhIGNvbXBvc2l0ZSBzaGFwZSBpcyBiZWluZyBkZXBpY3RlZC5cbiAgICBtb3ZhYmxlU2hhcGUuaW52aXNpYmxlV2hlblN0aWxsUHJvcGVydHkuc2V0KCB0aGlzLmZvcm1Db21wb3NpdGVQcm9wZXJ0eS5nZXQoKSApO1xuXG4gICAgLy8gQWRkIHRoZSBzaGFwZSBieSBwdXR0aW5nIGl0IG9uIHRoZSBsaXN0IG9mIGluY29taW5nIHNoYXBlcyBhbmQgc2V0dGluZyBpdHMgZGVzdGluYXRpb24uXG4gICAgdGhpcy5hZGRJbmNvbWluZ1NoYXBlKCBtb3ZhYmxlU2hhcGUsIHRoaXMuY2VsbFRvTW9kZWxDb29yZHMoIGNlbGxDb2x1bW4sIGNlbGxSb3csIGZhbHNlICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHByb3BvcnRpb24gb2YgYXJlYSB0aGF0IG1hdGNoIHRoZSBwcm92aWRlZCBjb2xvci5cbiAgICogQHBhcmFtIGNvbG9yXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGdldFByb3BvcnRpb25PZkNvbG9yKCBjb2xvciApIHtcbiAgICBjb25zdCBjb21wYXJlQ29sb3IgPSBDb2xvci50b0NvbG9yKCBjb2xvciApO1xuICAgIGxldCB0b3RhbEFyZWEgPSAwO1xuICAgIGxldCBhcmVhT2ZTcGVjaWZpZWRDb2xvciA9IDA7XG4gICAgdGhpcy5yZXNpZGVudFNoYXBlcy5mb3JFYWNoKCByZXNpZGVudFNoYXBlID0+IHtcbiAgICAgIGNvbnN0IGFyZWFPZlNoYXBlID0gcmVzaWRlbnRTaGFwZS5zaGFwZS5ib3VuZHMud2lkdGggKiByZXNpZGVudFNoYXBlLnNoYXBlLmJvdW5kcy5oZWlnaHQgLyAoIHRoaXMudW5pdFNxdWFyZUxlbmd0aCAqIHRoaXMudW5pdFNxdWFyZUxlbmd0aCApO1xuICAgICAgdG90YWxBcmVhICs9IGFyZWFPZlNoYXBlO1xuICAgICAgaWYgKCBjb21wYXJlQ29sb3IuZXF1YWxzKCByZXNpZGVudFNoYXBlLmNvbG9yICkgKSB7XG4gICAgICAgIGFyZWFPZlNwZWNpZmllZENvbG9yICs9IGFyZWFPZlNoYXBlO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIGNvbnN0IHByb3BvcnRpb24gPSBuZXcgRnJhY3Rpb24oIGFyZWFPZlNwZWNpZmllZENvbG9yLCB0b3RhbEFyZWEgKTtcbiAgICBwcm9wb3J0aW9uLnJlZHVjZSgpO1xuICAgIHJldHVybiBwcm9wb3J0aW9uO1xuICB9XG5cbiAgLy8gQHByaXZhdGUsIGFkZCBhIHNoYXBlIHRvIHRoZSBsaXN0IG9mIHJlc2lkZW50cyBhbmQgbWFrZSB0aGUgb3RoZXIgdXBkYXRlcyB0aGF0IGdvIGFsb25nIHdpdGggdGhpcy5cbiAgYWRkUmVzaWRlbnRTaGFwZSggbW92YWJsZVNoYXBlLCByZWxlYXNlT3JwaGFucyApIHtcblxuICAgIC8vIE1ha2Ugc3VyZSB0aGF0IHRoZSBzaGFwZSBpcyBub3QgbW92aW5nXG4gICAgYXNzZXJ0ICYmIGFzc2VydChcbiAgICAgIG1vdmFibGVTaGFwZS5wb3NpdGlvblByb3BlcnR5LmdldCgpLmVxdWFscyggbW92YWJsZVNoYXBlLmRlc3RpbmF0aW9uICksXG4gICAgICAnRXJyb3I6IFNoYXBlcyBzaG91bGQgbm90IGJlY29tZSByZXNpZGVudHMgdW50aWwgdGhleSBoYXZlIGNvbXBsZXRlZCBhbmltYXRpbmcuJ1xuICAgICk7XG5cbiAgICAvLyBNYWRlIHN1cmUgdGhhdCB0aGUgc2hhcGUgaXNuJ3QgYWxyZWFkeSBhIHJlc2lkZW50LlxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmlzUmVzaWRlbnRTaGFwZSggbW92YWJsZVNoYXBlICksICdFcnJvcjogQXR0ZW1wdCB0byBhZGQgc2hhcGUgdGhhdCBpcyBhbHJlYWR5IGEgcmVzaWRlbnQuJyApO1xuXG4gICAgdGhpcy5yZXNpZGVudFNoYXBlcy5wdXNoKCBtb3ZhYmxlU2hhcGUgKTtcblxuICAgIC8vIE1ha2UgdGhlIGFwcHJvcHJpYXRlIHVwZGF0ZXMuXG4gICAgdGhpcy51cGRhdGVDZWxsT2NjdXBhdGlvbiggbW92YWJsZVNoYXBlLCAnYWRkJyApO1xuICAgIGlmICggcmVsZWFzZU9ycGhhbnMgKSB7XG4gICAgICB0aGlzLnJlbGVhc2VBbnlPcnBoYW5zKCk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlQWxsKCk7XG4gIH1cblxuICAvL0Bwcml2YXRlLCByZW1vdmUgdGhlIHNwZWNpZmllZCBzaGFwZSBmcm9tIHRoZSBzaGFwZSBwbGFjZW1lbnQgYm9hcmRcbiAgcmVtb3ZlUmVzaWRlbnRTaGFwZSggbW92YWJsZVNoYXBlICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNSZXNpZGVudFNoYXBlKCBtb3ZhYmxlU2hhcGUgKSwgJ0Vycm9yOiBBdHRlbXB0IHRvIHJlbW92ZSBzaGFwZSB0aGF0IGlzIG5vdCBhIHJlc2lkZW50LicgKTtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICB0aGlzLnJlc2lkZW50U2hhcGVzLnJlbW92ZSggbW92YWJsZVNoYXBlICk7XG4gICAgdGhpcy51cGRhdGVDZWxsT2NjdXBhdGlvbiggbW92YWJsZVNoYXBlLCAncmVtb3ZlJyApO1xuICAgIHRoaXMudXBkYXRlQWxsKCk7XG5cbiAgICBpZiAoIG1vdmFibGVTaGFwZS51c2VyQ29udHJvbGxlZFByb3BlcnR5LmdldCgpICkge1xuXG4gICAgICAvLyBXYXRjaCB0aGUgc2hhcGUgc28gdGhhdCB3ZSBjYW4gZG8gbmVlZGVkIHVwZGF0ZXMgd2hlbiB0aGUgdXNlciByZWxlYXNlcyBpdC5cbiAgICAgIG1vdmFibGVTaGFwZS51c2VyQ29udHJvbGxlZFByb3BlcnR5LmxhenlMaW5rKCBmdW5jdGlvbiByZWxlYXNlT3JwaGFuc0lmRHJvcHBlZE9mQm9hcmQoIHVzZXJDb250cm9sbGVkICkge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdXNlckNvbnRyb2xsZWQsICdVbmV4cGVjdGVkIHRyYW5zaXRpb24gb2YgdXNlckNvbnRyb2xsZWQgZmxhZy4nICk7XG4gICAgICAgIGlmICggIXNlbGYuc2hhcGVPdmVybGFwc0JvYXJkKCBtb3ZhYmxlU2hhcGUgKSApIHtcbiAgICAgICAgICAvLyBUaGlzIHNoYXBlIGlzbid0IGNvbWluZyBiYWNrLCBzbyB3ZSBuZWVkIHRvIHRyaWdnZXIgYW4gb3JwaGFuIHJlbGVhc2UuXG4gICAgICAgICAgc2VsZi5yZWxlYXNlQW55T3JwaGFucygpO1xuICAgICAgICAgIHNlbGYudXBkYXRlQWxsKCk7XG4gICAgICAgIH1cbiAgICAgICAgbW92YWJsZVNoYXBlLnVzZXJDb250cm9sbGVkUHJvcGVydHkudW5saW5rKCByZWxlYXNlT3JwaGFuc0lmRHJvcHBlZE9mQm9hcmQgKTtcbiAgICAgIH0gKTtcbiAgICB9XG4gIH1cblxuICAvLyBAcHJpdmF0ZSwgYWRkIHRoZSBzaGFwZSB0byB0aGUgbGlzdCBvZiBpbmNvbWluZyBzaGFwZXMgYW5kIHNldCB1cCBhIGxpc3RlbmVyIHRvIG1vdmUgaXQgdG8gcmVzaWRlbnQgc2hhcGVzXG4gIGFkZEluY29taW5nU2hhcGUoIG1vdmFibGVTaGFwZSwgZGVzdGluYXRpb24sIHJlbGVhc2VPcnBoYW5zICkge1xuXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBtb3ZhYmxlU2hhcGUuc2V0RGVzdGluYXRpb24oIGRlc3RpbmF0aW9uLCB0cnVlICk7XG5cbiAgICAvLyBUaGUgcmVtYWluaW5nIGNvZGUgaW4gdGhpcyBtZXRob2QgYXNzdW1lcyB0aGF0IHRoZSBzaGFwZSBpcyBhbmltYXRpbmcgdG8gdGhlIG5ldyBwb3NpdGlvbiwgYW5kIHdpbGwgY2F1c2VcbiAgICAvLyBvZGQgcmVzdWx0cyBpZiBpdCBpc24ndCwgc28gd2UgZG91YmxlIGNoZWNrIGl0IGhlcmUuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbW92YWJsZVNoYXBlLmFuaW1hdGluZ1Byb3BlcnR5LmdldCgpLCAnU2hhcGUgaXMgaXMgZXhwZWN0ZWQgdG8gYmUgYW5pbWF0aW5nJyApO1xuXG4gICAgLy8gVGhlIHNoYXBlIGlzIG1vdmluZyB0byBhIHNwb3Qgb24gdGhlIGJvYXJkLiAgV2UgZG9uJ3Qgd2FudCB0byBhZGQgaXQgdG8gdGhlIGxpc3Qgb2YgcmVzaWRlbnQgc2hhcGVzIHlldCwgb3Igd2VcbiAgICAvLyBtYXkgdHJpZ2dlciBhIGNoYW5nZSB0byB0aGUgZXh0ZXJpb3IgYW5kIGludGVyaW9yIHBlcmltZXRlcnMsIGJ1dCB3ZSBuZWVkIHRvIGtlZXAgYSByZWZlcmVuY2UgdG8gaXQgc28gdGhhdFxuICAgIC8vIHRoZSB2YWxpZCBwbGFjZW1lbnQgcG9zaXRpb25zIGNhbiBiZSB1cGRhdGVkLCBlc3BlY2lhbGx5IGluIG11bHRpLXRvdWNoIGVudmlyb25tZW50cy4gIFNvLCBiYXNpY2FsbHksIHRoZXJlIGlzXG4gICAgLy8gYW4gaW50ZXJtZWRpYXRlICdob2xkaW5nIHBsYWNlJyBmb3IgaW5jb21pbmcgc2hhcGVzLlxuICAgIHRoaXMuaW5jb21pbmdTaGFwZXMucHVzaCggbW92YWJsZVNoYXBlICk7XG5cbiAgICAvLyBDcmVhdGUgYSBsaXN0ZW5lciB0aGF0IHdpbGwgbW92ZSB0aGlzIHNoYXBlIGZyb20gdGhlIGluY29taW5nIHNoYXBlIGxpc3QgdG8gdGhlIHJlc2lkZW50IGxpc3Qgb25jZSB0aGVcbiAgICAvLyBhbmltYXRpb24gY29tcGxldGVzLlxuICAgIGZ1bmN0aW9uIGFuaW1hdGlvbkNvbXBsZXRlTGlzdGVuZXIoIGFuaW1hdGluZyApIHtcbiAgICAgIGlmICggIWFuaW1hdGluZyApIHtcbiAgICAgICAgLy8gTW92ZSB0aGUgc2hhcGUgZnJvbSB0aGUgaW5jb21pbmcgbGlzdCB0byB0aGUgcmVzaWRlbnQgbGlzdC5cbiAgICAgICAgc2VsZi5pbmNvbWluZ1NoYXBlcy5zcGxpY2UoIHNlbGYuaW5jb21pbmdTaGFwZXMuaW5kZXhPZiggbW92YWJsZVNoYXBlICksIDEgKTtcbiAgICAgICAgc2VsZi5hZGRSZXNpZGVudFNoYXBlKCBtb3ZhYmxlU2hhcGUsIHJlbGVhc2VPcnBoYW5zICk7XG4gICAgICAgIG1vdmFibGVTaGFwZS5hbmltYXRpbmdQcm9wZXJ0eS51bmxpbmsoIGFuaW1hdGlvbkNvbXBsZXRlTGlzdGVuZXIgKTtcbiAgICAgICAgaWYgKCBzZWxmLnVwZGF0ZXNTdXNwZW5kZWQgJiYgc2VsZi5pbmNvbWluZ1NoYXBlcy5sZW5ndGggPT09IDAgKSB7XG4gICAgICAgICAgLy8gdXBkYXRlcyBoYWQgYmVlbiBzdXNwZW5kZWQgKGZvciBiZXR0ZXIgcGVyZm9ybWFuY2UpLCBhbmQgdGhlIGxhc3QgaW5jb21pbmcgc2hhcGVzIHdhcyBhZGRlZCwgc28gcmVzdW1lIHVwZGF0ZXNcbiAgICAgICAgICBzZWxmLnVwZGF0ZXNTdXNwZW5kZWQgPSBmYWxzZTtcbiAgICAgICAgICBzZWxmLnVwZGF0ZUFsbCgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFNldCB1cCBhIGxpc3RlbmVyIHRvIHJlbW92ZSB0aGlzIHNoYXBlIGlmIGFuZCB3aGVuIHRoZSB1c2VyIGdyYWJzIGl0LlxuICAgICAgc2VsZi5hZGRSZW1vdmFsTGlzdGVuZXIoIG1vdmFibGVTaGFwZSApO1xuICAgIH1cblxuICAgIC8vIFRhZyB0aGUgbGlzdGVuZXIgc28gdGhhdCBpdCBjYW4gYmUgcmVtb3ZlZCB3aXRob3V0IGZpcmluZyBpZiBuZWVkZWQsIHN1Y2ggYXMgd2hlbiB0aGUgYm9hcmQgaXMgY2xlYXJlZC5cbiAgICB0aGlzLnRhZ0xpc3RlbmVyKCBhbmltYXRpb25Db21wbGV0ZUxpc3RlbmVyICk7XG5cbiAgICAvLyBIb29rIHVwIHRoZSBsaXN0ZW5lci5cbiAgICBtb3ZhYmxlU2hhcGUuYW5pbWF0aW5nUHJvcGVydHkubGF6eUxpbmsoIGFuaW1hdGlvbkNvbXBsZXRlTGlzdGVuZXIgKTtcbiAgfVxuXG5cbiAgLy8gQHByaXZhdGUsIHRhZyBhIGxpc3RlbmVyIGZvciByZW1vdmFsXG4gIHRhZ0xpc3RlbmVyKCBsaXN0ZW5lciApIHtcbiAgICBsaXN0ZW5lci5zaGFwZVBsYWNlbWVudEJvYXJkID0gdGhpcztcbiAgfVxuXG4gIC8vIEBwcml2YXRlLCBjaGVjayBpZiBsaXN0ZW5lciBmdW5jdGlvbiB3YXMgdGFnZ2VkIGJ5IHRoaXMgaW5zdGFuY2VcbiAgbGlzdGVuZXJUYWdNYXRjaGVzKCBsaXN0ZW5lciApIHtcbiAgICByZXR1cm4gKCBsaXN0ZW5lci5zaGFwZVBsYWNlbWVudEJvYXJkICYmIGxpc3RlbmVyLnNoYXBlUGxhY2VtZW50Qm9hcmQgPT09IHRoaXMgKTtcbiAgfVxuXG4gIC8vVE9ETyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXJlYS1idWlsZGVyL2lzc3Vlcy8xMjcgVGhpcyBpcyByYXRoZXIgdWdseS4gIFdvcmsgd2l0aCBTUiB0byBpbXByb3ZlIG9yIGZpbmQgYWx0ZXJuYXRpdmUsIG9yIHRvIGJha2UgaW50byBBeG9uLiAgTWF5YmUgYSBtYXAuXG4gIC8vIEBwcml2YXRlLCByZW1vdmUgYWxsIG9ic2VydmVycyBmcm9tIGEgcHJvcGVydHkgdGhhdCBoYXZlIGJlZW4gdGFnZ2VkIGJ5IHRoaXMgc2hhcGUgcGxhY2VtZW50IGJvYXJkLlxuICByZW1vdmVUYWdnZWRPYnNlcnZlcnMoIHByb3BlcnR5ICkge1xuICAgIGNvbnN0IHRhZ2dlZE9ic2VydmVycyA9IFtdO1xuICAgIHByb3BlcnR5LmZvckVhY2hMaXN0ZW5lciggb2JzZXJ2ZXIgPT4ge1xuICAgICAgaWYgKCB0aGlzLmxpc3RlbmVyVGFnTWF0Y2hlcyggb2JzZXJ2ZXIgKSApIHtcbiAgICAgICAgdGFnZ2VkT2JzZXJ2ZXJzLnB1c2goIG9ic2VydmVyICk7XG4gICAgICB9XG4gICAgfSApO1xuICAgIHRhZ2dlZE9ic2VydmVycy5mb3JFYWNoKCB0YWdnZWRPYnNlcnZlciA9PiB7XG4gICAgICBwcm9wZXJ0eS51bmxpbmsoIHRhZ2dlZE9ic2VydmVyICk7XG4gICAgfSApO1xuICB9XG5cbiAgLy8gQHByaXZhdGUgQ29udmVuaWVuY2UgZnVuY3Rpb24gZm9yIHJldHVybmluZyBhIGNlbGwgb3IgbnVsbCBpZiByb3cgb3IgY29sdW1uIGFyZSBvdXQgb2YgcmFuZ2UuXG4gIGdldENlbGwoIGNvbHVtbiwgcm93ICkge1xuICAgIGlmICggY29sdW1uIDwgMCB8fCByb3cgPCAwIHx8IGNvbHVtbiA+PSB0aGlzLm51bUNvbHVtbnMgfHwgcm93ID49IHRoaXMubnVtUm93cyApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jZWxsc1sgY29sdW1uIF1bIHJvdyBdO1xuICB9XG5cbiAgLy8gQHByaXZhdGUgRnVuY3Rpb24gZm9yIGdldHRpbmcgdGhlIG9jY3VwYW50IG9mIHRoZSBzcGVjaWZpZWQgY2VsbCwgZG9lcyBib3VuZHMgY2hlY2tpbmcuXG4gIGdldENlbGxPY2N1cGFudCggY29sdW1uLCByb3cgKSB7XG4gICAgY29uc3QgY2VsbCA9IHRoaXMuZ2V0Q2VsbCggY29sdW1uLCByb3cgKTtcbiAgICByZXR1cm4gY2VsbCA/IGNlbGwub2NjdXBpZWRCeSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogU2V0IG9yIGNsZWFyIHRoZSBvY2N1cGF0aW9uIHN0YXR1cyBvZiB0aGUgY2VsbHMuXG4gICAqIEBwYXJhbSBtb3ZhYmxlU2hhcGVcbiAgICogQHBhcmFtIG9wZXJhdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdXBkYXRlQ2VsbE9jY3VwYXRpb24oIG1vdmFibGVTaGFwZSwgb3BlcmF0aW9uICkge1xuICAgIGNvbnN0IHhJbmRleCA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCAoIG1vdmFibGVTaGFwZS5kZXN0aW5hdGlvbi54IC0gdGhpcy5ib3VuZHMubWluWCApIC8gdGhpcy51bml0U3F1YXJlTGVuZ3RoICk7XG4gICAgY29uc3QgeUluZGV4ID0gVXRpbHMucm91bmRTeW1tZXRyaWMoICggbW92YWJsZVNoYXBlLmRlc3RpbmF0aW9uLnkgLSB0aGlzLmJvdW5kcy5taW5ZICkgLyB0aGlzLnVuaXRTcXVhcmVMZW5ndGggKTtcblxuICAgIC8vIE1hcmsgYWxsIGNlbGxzIG9jY3VwaWVkIGJ5IHRoaXMgc2hhcGUuXG4gICAgZm9yICggbGV0IHJvdyA9IDA7IHJvdyA8IG1vdmFibGVTaGFwZS5zaGFwZS5ib3VuZHMuaGVpZ2h0IC8gdGhpcy51bml0U3F1YXJlTGVuZ3RoOyByb3crKyApIHtcbiAgICAgIGZvciAoIGxldCBjb2x1bW4gPSAwOyBjb2x1bW4gPCBtb3ZhYmxlU2hhcGUuc2hhcGUuYm91bmRzLndpZHRoIC8gdGhpcy51bml0U3F1YXJlTGVuZ3RoOyBjb2x1bW4rKyApIHtcbiAgICAgICAgdGhpcy5jZWxsc1sgeEluZGV4ICsgY29sdW1uIF1bIHlJbmRleCArIHJvdyBdLm9jY3VwaWVkQnkgPSBvcGVyYXRpb24gPT09ICdhZGQnID8gbW92YWJsZVNoYXBlIDogbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBAcHJpdmF0ZVxuICB1cGRhdGVBcmVhQW5kVG90YWxQZXJpbWV0ZXIoKSB7XG4gICAgaWYgKCB0aGlzLmNvbXBvc2l0ZVNoYXBlUHJvcGVydHkuZ2V0KCkuZXh0ZXJpb3JQZXJpbWV0ZXJzLmxlbmd0aCA8PSAxICkge1xuICAgICAgbGV0IHRvdGFsQXJlYSA9IDA7XG4gICAgICB0aGlzLnJlc2lkZW50U2hhcGVzLmZvckVhY2goIHJlc2lkZW50U2hhcGUgPT4ge1xuICAgICAgICB0b3RhbEFyZWEgKz0gcmVzaWRlbnRTaGFwZS5zaGFwZS5ib3VuZHMud2lkdGggKiByZXNpZGVudFNoYXBlLnNoYXBlLmJvdW5kcy5oZWlnaHQgLyAoIHRoaXMudW5pdFNxdWFyZUxlbmd0aCAqIHRoaXMudW5pdFNxdWFyZUxlbmd0aCApO1xuICAgICAgfSApO1xuICAgICAgbGV0IHRvdGFsUGVyaW1ldGVyID0gMDtcbiAgICAgIHRoaXMuY29tcG9zaXRlU2hhcGVQcm9wZXJ0eS5nZXQoKS5leHRlcmlvclBlcmltZXRlcnMuZm9yRWFjaCggZXh0ZXJpb3JQZXJpbWV0ZXIgPT4ge1xuICAgICAgICB0b3RhbFBlcmltZXRlciArPSBleHRlcmlvclBlcmltZXRlci5sZW5ndGg7XG4gICAgICB9ICk7XG4gICAgICB0aGlzLmNvbXBvc2l0ZVNoYXBlUHJvcGVydHkuZ2V0KCkuaW50ZXJpb3JQZXJpbWV0ZXJzLmZvckVhY2goIGludGVyaW9yUGVyaW1ldGVyID0+IHtcbiAgICAgICAgdG90YWxQZXJpbWV0ZXIgKz0gaW50ZXJpb3JQZXJpbWV0ZXIubGVuZ3RoO1xuICAgICAgfSApO1xuICAgICAgdGhpcy5hcmVhQW5kUGVyaW1ldGVyUHJvcGVydHkuc2V0KCB7XG4gICAgICAgIGFyZWE6IHRvdGFsQXJlYSxcbiAgICAgICAgcGVyaW1ldGVyOiB0b3RhbFBlcmltZXRlclxuICAgICAgfSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIEFyZWEgYW5kIHBlcmltZXRlciByZWFkaW5ncyBhcmUgY3VycmVudGx5IGludmFsaWQuXG4gICAgICB0aGlzLmFyZWFBbmRQZXJpbWV0ZXJQcm9wZXJ0eS5zZXQoIHtcbiAgICAgICAgYXJlYTogQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuSU5WQUxJRF9WQUxVRSxcbiAgICAgICAgcGVyaW1ldGVyOiBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5JTlZBTElEX1ZBTFVFXG4gICAgICB9ICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlbmllbmNlIGZ1bmN0aW9uIGZvciBmaW5kaW5nIG91dCB3aGV0aGVyIGEgY2VsbCBpcyBvY2N1cGllZCB0aGF0IGhhbmRsZXMgb3V0IG9mIGJvdW5kcyBjYXNlIChyZXR1cm5zIGZhbHNlKS5cbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIGNvbHVtblxuICAgKiBAcGFyYW0gcm93XG4gICAqL1xuICBpc0NlbGxPY2N1cGllZCggY29sdW1uLCByb3cgKSB7XG4gICAgaWYgKCBjb2x1bW4gPj0gdGhpcy5udW1Db2x1bW5zIHx8IGNvbHVtbiA8IDAgfHwgcm93ID49IHRoaXMubnVtUm93cyB8fCByb3cgPCAwICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmNlbGxzWyBjb2x1bW4gXVsgcm93IF0ub2NjdXBpZWRCeSAhPT0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRnVuY3Rpb24gdGhhdCByZXR1cm5zIHRydWUgaWYgYSBjZWxsIGlzIG9jY3VwaWVkIG9yIGlmIGFuIGluY29taW5nIHNoYXBlIGlzIGhlYWRpbmcgZm9yIGl0LlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0gY29sdW1uXG4gICAqIEBwYXJhbSByb3dcbiAgICovXG4gIGlzQ2VsbE9jY3VwaWVkTm93T3JTb29uKCBjb2x1bW4sIHJvdyApIHtcbiAgICBpZiAoIHRoaXMuaXNDZWxsT2NjdXBpZWQoIGNvbHVtbiwgcm93ICkgKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5pbmNvbWluZ1NoYXBlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IHRhcmdldENlbGwgPSB0aGlzLm1vZGVsVG9DZWxsVmVjdG9yKCB0aGlzLmluY29taW5nU2hhcGVzWyBpIF0uZGVzdGluYXRpb24gKTtcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWRXaWR0aCA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCB0aGlzLmluY29taW5nU2hhcGVzWyBpIF0uc2hhcGUuYm91bmRzLndpZHRoIC8gdGhpcy51bml0U3F1YXJlTGVuZ3RoICk7XG4gICAgICBjb25zdCBub3JtYWxpemVkSGVpZ2h0ID0gVXRpbHMucm91bmRTeW1tZXRyaWMoIHRoaXMuaW5jb21pbmdTaGFwZXNbIGkgXS5zaGFwZS5ib3VuZHMuaGVpZ2h0IC8gdGhpcy51bml0U3F1YXJlTGVuZ3RoICk7XG4gICAgICBpZiAoIGNvbHVtbiA+PSB0YXJnZXRDZWxsLnggJiYgY29sdW1uIDwgdGFyZ2V0Q2VsbC54ICsgbm9ybWFsaXplZFdpZHRoICYmXG4gICAgICAgICAgIHJvdyA+PSB0YXJnZXRDZWxsLnkgJiYgcm93IDwgdGFyZ2V0Q2VsbC55ICsgbm9ybWFsaXplZEhlaWdodCApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG91dGVyIGxheWVyIG9mIGdyaWQgcG9pbnRzIHN1cnJvdW5kaW5nIHRoZSBnaXZlbiBwb2ludC4gIFRoZSAybmQgcGFyYW1ldGVyIGluZGljYXRlcyBob3cgbWFueSBzdGVwcyBhd2F5XG4gICAqIGZyb20gdGhlIGNlbnRlciAnc2hlbGwnIHNob3VsZCBiZSBwcm92aWRlZC5cbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHBvaW50XG4gICAqIEBwYXJhbSBsZXZlbHNSZW1vdmVkXG4gICAqL1xuICBnZXRPdXRlclN1cnJvdW5kaW5nUG9pbnRzKCBwb2ludCwgbGV2ZWxzUmVtb3ZlZCApIHtcbiAgICBjb25zdCBub3JtYWxpemVkUG9pbnRzID0gW107XG5cbiAgICAvLyBHZXQgdGhlIGNsb3Nlc3QgcG9pbnQgaW4gY2VsbCBjb29yZGluYXRlcy5cbiAgICBjb25zdCBub3JtYWxpemVkU3RhcnRpbmdQb2ludCA9IG5ldyBWZWN0b3IyKFxuICAgICAgTWF0aC5mbG9vciggKCBwb2ludC54IC0gdGhpcy5ib3VuZHMubWluWCApIC8gdGhpcy51bml0U3F1YXJlTGVuZ3RoICkgLSBsZXZlbHNSZW1vdmVkLFxuICAgICAgTWF0aC5mbG9vciggKCBwb2ludC55IC0gdGhpcy5ib3VuZHMubWluWSApIC8gdGhpcy51bml0U3F1YXJlTGVuZ3RoICkgLSBsZXZlbHNSZW1vdmVkXG4gICAgKTtcblxuICAgIGNvbnN0IHNxdWFyZVNpemUgPSAoIGxldmVsc1JlbW92ZWQgKyAxICkgKiAyO1xuXG4gICAgZm9yICggbGV0IHJvdyA9IDA7IHJvdyA8IHNxdWFyZVNpemU7IHJvdysrICkge1xuICAgICAgZm9yICggbGV0IGNvbHVtbiA9IDA7IGNvbHVtbiA8IHNxdWFyZVNpemU7IGNvbHVtbisrICkge1xuICAgICAgICBpZiAoICggcm93ID09PSAwIHx8IHJvdyA9PT0gc3F1YXJlU2l6ZSAtIDEgfHwgY29sdW1uID09PSAwIHx8IGNvbHVtbiA9PT0gc3F1YXJlU2l6ZSAtIDEgKSAmJlxuICAgICAgICAgICAgICggY29sdW1uICsgbm9ybWFsaXplZFN0YXJ0aW5nUG9pbnQueCA8PSB0aGlzLm51bUNvbHVtbnMgJiYgcm93ICsgbm9ybWFsaXplZFN0YXJ0aW5nUG9pbnQueSA8PSB0aGlzLm51bVJvd3MgKSApIHtcbiAgICAgICAgICAvLyBUaGlzIGlzIGFuIG91dGVyIHBvaW50LCBhbmQgaXMgdmFsaWQsIHNvIGluY2x1ZGUgaXQuXG4gICAgICAgICAgbm9ybWFsaXplZFBvaW50cy5wdXNoKCBuZXcgVmVjdG9yMiggY29sdW1uICsgbm9ybWFsaXplZFN0YXJ0aW5nUG9pbnQueCwgcm93ICsgbm9ybWFsaXplZFN0YXJ0aW5nUG9pbnQueSApICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBvdXRlclN1cnJvdW5kaW5nUG9pbnRzID0gW107XG4gICAgbm9ybWFsaXplZFBvaW50cy5mb3JFYWNoKCBwID0+IHsgb3V0ZXJTdXJyb3VuZGluZ1BvaW50cy5wdXNoKCB0aGlzLmNlbGxUb01vZGVsVmVjdG9yKCBwICkgKTsgfSApO1xuICAgIHJldHVybiBvdXRlclN1cnJvdW5kaW5nUG9pbnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZSB3aGV0aGVyIGl0IGlzIHZhbGlkIHRvIHBsYWNlIHRoZSBnaXZlbiBzaGFwZSBhdCB0aGUgZ2l2ZW4gcG9zaXRpb24uICBGb3IgcGxhY2VtZW50IHRvIGJlIHZhbGlkLCB0aGVcbiAgICogc2hhcGUgY2FuJ3Qgb3ZlcmxhcCB3aXRoIGFueSBvdGhlciBzaGFwZSwgYW5kIG11c3Qgc2hhcmUgYXQgbGVhc3Qgb25lIHNpZGUgd2l0aCBhbiBvY2N1cGllZCBzcGFjZS5cbiAgICogQHBhcmFtIG1vdmFibGVTaGFwZVxuICAgKiBAcGFyYW0gcG9zaXRpb25cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpc1ZhbGlkVG9QbGFjZSggbW92YWJsZVNoYXBlLCBwb3NpdGlvbiApIHtcbiAgICBjb25zdCBub3JtYWxpemVkUG9zaXRpb24gPSB0aGlzLm1vZGVsVG9DZWxsVmVjdG9yKCBwb3NpdGlvbiApO1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRXaWR0aCA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCBtb3ZhYmxlU2hhcGUuc2hhcGUuYm91bmRzLndpZHRoIC8gdGhpcy51bml0U3F1YXJlTGVuZ3RoICk7XG4gICAgY29uc3Qgbm9ybWFsaXplZEhlaWdodCA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCBtb3ZhYmxlU2hhcGUuc2hhcGUuYm91bmRzLmhlaWdodCAvIHRoaXMudW5pdFNxdWFyZUxlbmd0aCApO1xuICAgIGxldCByb3c7XG4gICAgbGV0IGNvbHVtbjtcblxuICAgIC8vIFJldHVybiBmYWxzZSBpZiB0aGUgc2hhcGUgd291bGQgZ28gb2ZmIHRoZSBib2FyZCBpZiBwbGFjZWQgYXQgdGhpcyBwb3NpdGlvbi5cbiAgICBpZiAoIG5vcm1hbGl6ZWRQb3NpdGlvbi54IDwgMCB8fCBub3JtYWxpemVkUG9zaXRpb24ueCArIG5vcm1hbGl6ZWRXaWR0aCA+IHRoaXMubnVtQ29sdW1ucyB8fFxuICAgICAgICAgbm9ybWFsaXplZFBvc2l0aW9uLnkgPCAwIHx8IG5vcm1hbGl6ZWRQb3NpdGlvbi55ICsgbm9ybWFsaXplZEhlaWdodCA+IHRoaXMubnVtUm93cyApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGVyZSBhcmUgbm8gb3RoZXIgc2hhcGVzIG9uIHRoZSBib2FyZCwgYW55IHBvc2l0aW9uIG9uIHRoZSBib2FyZCBpcyB2YWxpZC5cbiAgICBpZiAoIHRoaXMucmVzaWRlbnRTaGFwZXMubGVuZ3RoID09PSAwICkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIGZhbHNlIGlmIHRoaXMgc2hhcGUgb3ZlcmxhcHMgYW55IHByZXZpb3VzbHkgcGxhY2VkIHNoYXBlcy5cbiAgICBmb3IgKCByb3cgPSAwOyByb3cgPCBub3JtYWxpemVkSGVpZ2h0OyByb3crKyApIHtcbiAgICAgIGZvciAoIGNvbHVtbiA9IDA7IGNvbHVtbiA8IG5vcm1hbGl6ZWRXaWR0aDsgY29sdW1uKysgKSB7XG4gICAgICAgIGlmICggdGhpcy5pc0NlbGxPY2N1cGllZE5vd09yU29vbiggbm9ybWFsaXplZFBvc2l0aW9uLnggKyBjb2x1bW4sIG5vcm1hbGl6ZWRQb3NpdGlvbi55ICsgcm93ICkgKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgdGhpcyBib2FyZCBpcyBub3Qgc2V0IHRvIGNvbnNvbGlkYXRlIHNoYXBlcywgd2UndmUgZG9uZSBlbm91Z2gsIGFuZCB0aGlzIHBvc2l0aW9uIGlzIHZhbGlkLlxuICAgIGlmICggIXRoaXMuZm9ybUNvbXBvc2l0ZVByb3BlcnR5LmdldCgpICkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBwb3NpdGlvbiBpcyBvbmx5IHZhbGlkIGlmIHRoZSBzaGFwZSB3aWxsIHNoYXJlIGFuIGVkZ2Ugd2l0aCBhbiBhbHJlYWR5IHBsYWNlZCBzaGFwZSBvciBhbiBpbmNvbWluZyBzaGFwZSxcbiAgICAvLyBzaW5jZSB0aGUgJ2Zvcm1Db21wb3NpdGUnIG1vZGUgaXMgZW5hYmxlZC5cbiAgICBmb3IgKCByb3cgPSAwOyByb3cgPCBub3JtYWxpemVkSGVpZ2h0OyByb3crKyApIHtcbiAgICAgIGZvciAoIGNvbHVtbiA9IDA7IGNvbHVtbiA8IG5vcm1hbGl6ZWRXaWR0aDsgY29sdW1uKysgKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICB0aGlzLmlzQ2VsbE9jY3VwaWVkTm93T3JTb29uKCBub3JtYWxpemVkUG9zaXRpb24ueCArIGNvbHVtbiwgbm9ybWFsaXplZFBvc2l0aW9uLnkgKyByb3cgLSAxICkgfHxcbiAgICAgICAgICB0aGlzLmlzQ2VsbE9jY3VwaWVkTm93T3JTb29uKCBub3JtYWxpemVkUG9zaXRpb24ueCArIGNvbHVtbiAtIDEsIG5vcm1hbGl6ZWRQb3NpdGlvbi55ICsgcm93ICkgfHxcbiAgICAgICAgICB0aGlzLmlzQ2VsbE9jY3VwaWVkTm93T3JTb29uKCBub3JtYWxpemVkUG9zaXRpb24ueCArIGNvbHVtbiArIDEsIG5vcm1hbGl6ZWRQb3NpdGlvbi55ICsgcm93ICkgfHxcbiAgICAgICAgICB0aGlzLmlzQ2VsbE9jY3VwaWVkTm93T3JTb29uKCBub3JtYWxpemVkUG9zaXRpb24ueCArIGNvbHVtbiwgbm9ybWFsaXplZFBvc2l0aW9uLnkgKyByb3cgKyAxIClcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogUmVsZWFzZSBhbGwgdGhlIHNoYXBlcyB0aGF0IGFyZSBjdXJyZW50bHkgb24gdGhpcyBib2FyZCBhbmQgc2VuZCB0aGVtIHRvIHRoZWlyIGhvbWUgcG9zaXRpb25zLlxuICAgKiBAcHVibGljXG4gICAqIEBwYXJhbSByZWxlYXNlTW9kZSAtIENvbnRyb2xzIHdoYXQgdGhlIHNoYXBlcyBkbyBhZnRlciByZWxlYXNlLCBvcHRpb25zIGFyZSAnZmFkZScsICdhbmltYXRlSG9tZScsIGFuZFxuICAgKiAnanVtcEhvbWUnLiAgJ2p1bXBIb21lJyBpcyB0aGUgZGVmYXVsdC5cbiAgICovXG4gIHJlbGVhc2VBbGxTaGFwZXMoIHJlbGVhc2VNb2RlICkge1xuICAgIGNvbnN0IHNoYXBlc1RvUmVsZWFzZSA9IFtdO1xuXG4gICAgLy8gUmVtb3ZlIGFsbCBsaXN0ZW5lcnMgYWRkZWQgdG8gdGhlIHNoYXBlcyBieSB0aGlzIHBsYWNlbWVudCBib2FyZC5cbiAgICB0aGlzLnJlc2lkZW50U2hhcGVzLmZvckVhY2goIHNoYXBlID0+IHtcbiAgICAgIHRoaXMucmVtb3ZlVGFnZ2VkT2JzZXJ2ZXJzKCBzaGFwZS51c2VyQ29udHJvbGxlZFByb3BlcnR5ICk7XG4gICAgICBzaGFwZXNUb1JlbGVhc2UucHVzaCggc2hhcGUgKTtcbiAgICB9ICk7XG4gICAgdGhpcy5pbmNvbWluZ1NoYXBlcy5mb3JFYWNoKCBzaGFwZSA9PiB7XG4gICAgICB0aGlzLnJlbW92ZVRhZ2dlZE9ic2VydmVycyggc2hhcGUuYW5pbWF0aW5nUHJvcGVydHkgKTtcbiAgICAgIHNoYXBlc1RvUmVsZWFzZS5wdXNoKCBzaGFwZSApO1xuICAgIH0gKTtcblxuICAgIC8vIENsZWFyIG91dCBhbGwgcmVmZXJlbmNlcyB0byBzaGFwZXMgcGxhY2VkIG9uIHRoaXMgYm9hcmQuXG4gICAgdGhpcy5yZXNpZGVudFNoYXBlcy5jbGVhcigpO1xuICAgIHRoaXMuaW5jb21pbmdTaGFwZXMubGVuZ3RoID0gMDtcblxuICAgIC8vIENsZWFyIHRoZSBjZWxsIGFycmF5IHRoYXQgdHJhY2tzIG9jY3VwYW5jeS5cbiAgICBmb3IgKCBsZXQgcm93ID0gMDsgcm93IDwgdGhpcy5udW1Sb3dzOyByb3crKyApIHtcbiAgICAgIGZvciAoIGxldCBjb2x1bW4gPSAwOyBjb2x1bW4gPCB0aGlzLm51bUNvbHVtbnM7IGNvbHVtbisrICkge1xuICAgICAgICB0aGlzLmNlbGxzWyBjb2x1bW4gXVsgcm93IF0ub2NjdXBpZWRCeSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVGVsbCB0aGUgc2hhcGVzIHdoYXQgdG8gZG8gYWZ0ZXIgYmVpbmcgcmVsZWFzZWQuXG4gICAgc2hhcGVzVG9SZWxlYXNlLmZvckVhY2goIHNoYXBlID0+IHtcbiAgICAgIGlmICggdHlwZW9mICggcmVsZWFzZU1vZGUgKSA9PT0gJ3VuZGVmaW5lZCcgfHwgcmVsZWFzZU1vZGUgPT09ICdqdW1wSG9tZScgKSB7XG4gICAgICAgIHNoYXBlLnJldHVyblRvT3JpZ2luKCBmYWxzZSApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIHJlbGVhc2VNb2RlID09PSAnYW5pbWF0ZUhvbWUnICkge1xuICAgICAgICBzaGFwZS5yZXR1cm5Ub09yaWdpbiggdHJ1ZSApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIHJlbGVhc2VNb2RlID09PSAnZmFkZScgKSB7XG4gICAgICAgIHNoYXBlLmZhZGVBd2F5KCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnVW5zdXBwb3J0ZWQgcmVsZWFzZSBtb2RlIGZvciBzaGFwZXMuJyApO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIC8vIFVwZGF0ZSBib2FyZCBzdGF0ZS5cbiAgICB0aGlzLnVwZGF0ZUFsbCgpO1xuICB9XG5cbiAgLy8gQHB1YmxpYyAtIGNoZWNrIGlmIGEgc2hhcGUgaXMgcmVzaWRlbnQgb24gdGhlIGJvYXJkXG4gIGlzUmVzaWRlbnRTaGFwZSggc2hhcGUgKSB7XG4gICAgcmV0dXJuIHRoaXMucmVzaWRlbnRTaGFwZXMuaW5jbHVkZXMoIHNoYXBlICk7XG4gIH1cblxuICAvLyBAcHJpdmF0ZVxuICByZWxlYXNlU2hhcGUoIHNoYXBlICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNSZXNpZGVudFNoYXBlKCBzaGFwZSApIHx8IHRoaXMuaW5jb21pbmdTaGFwZXMuY29udGFpbnMoIHNoYXBlICksICdFcnJvcjogQW4gYXR0ZW1wdCB3YXMgbWFkZSB0byByZWxlYXNlIGEgc2hhcGUgdGhhdCBpcyBub3QgcHJlc2VudC4nICk7XG4gICAgaWYgKCB0aGlzLmlzUmVzaWRlbnRTaGFwZSggc2hhcGUgKSApIHtcbiAgICAgIHRoaXMucmVtb3ZlVGFnZ2VkT2JzZXJ2ZXJzKCBzaGFwZS51c2VyQ29udHJvbGxlZFByb3BlcnR5ICk7XG4gICAgICB0aGlzLnJlbW92ZVJlc2lkZW50U2hhcGUoIHNoYXBlICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCB0aGlzLmluY29taW5nU2hhcGVzLmluZGV4T2YoIHNoYXBlICkgPj0gMCApIHtcbiAgICAgIHRoaXMucmVtb3ZlVGFnZ2VkT2JzZXJ2ZXJzKCBzaGFwZS5hbmltYXRpbmdQcm9wZXJ0eSApO1xuICAgICAgdGhpcy5pbmNvbWluZ1NoYXBlcy5zcGxpY2UoIHRoaXMuaW5jb21pbmdTaGFwZXMuaW5kZXhPZiggc2hhcGUgKSwgMSApO1xuICAgIH1cbiAgfVxuXG4gIC8vQHByaXZhdGVcbiAgY2VsbFRvTW9kZWxDb29yZHMoIGNvbHVtbiwgcm93ICkge1xuICAgIHJldHVybiBuZXcgVmVjdG9yMiggY29sdW1uICogdGhpcy51bml0U3F1YXJlTGVuZ3RoICsgdGhpcy5ib3VuZHMubWluWCwgcm93ICogdGhpcy51bml0U3F1YXJlTGVuZ3RoICsgdGhpcy5ib3VuZHMubWluWSApO1xuICB9XG5cbiAgLy9AcHJpdmF0ZVxuICBjZWxsVG9Nb2RlbFZlY3RvciggdiApIHtcbiAgICByZXR1cm4gdGhpcy5jZWxsVG9Nb2RlbENvb3Jkcyggdi54LCB2LnkgKTtcbiAgfVxuXG4gIC8vQHByaXZhdGVcbiAgbW9kZWxUb0NlbGxDb29yZHMoIHgsIHkgKSB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IyKCBVdGlscy5yb3VuZFN5bW1ldHJpYyggKCB4IC0gdGhpcy5ib3VuZHMubWluWCApIC8gdGhpcy51bml0U3F1YXJlTGVuZ3RoICksXG4gICAgICBVdGlscy5yb3VuZFN5bW1ldHJpYyggKCB5IC0gdGhpcy5ib3VuZHMubWluWSApIC8gdGhpcy51bml0U3F1YXJlTGVuZ3RoICkgKTtcbiAgfVxuXG4gIC8vQHByaXZhdGVcbiAgbW9kZWxUb0NlbGxWZWN0b3IoIHYgKSB7XG4gICAgcmV0dXJuIHRoaXMubW9kZWxUb0NlbGxDb29yZHMoIHYueCwgdi55ICk7XG4gIH1cblxuICAvLyBAcHJpdmF0ZVxuICBjcmVhdGVTaGFwZUZyb21QZXJpbWV0ZXJQb2ludHMoIHBlcmltZXRlclBvaW50cyApIHtcbiAgICBjb25zdCBwZXJpbWV0ZXJTaGFwZSA9IG5ldyBTaGFwZSgpO1xuICAgIHBlcmltZXRlclNoYXBlLm1vdmVUb1BvaW50KCBwZXJpbWV0ZXJQb2ludHNbIDAgXSApO1xuICAgIGZvciAoIGxldCBpID0gMTsgaSA8IHBlcmltZXRlclBvaW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHBlcmltZXRlclNoYXBlLmxpbmVUb1BvaW50KCBwZXJpbWV0ZXJQb2ludHNbIGkgXSApO1xuICAgIH1cbiAgICBwZXJpbWV0ZXJTaGFwZS5jbG9zZSgpOyAvLyBTaG91bGRuJ3QgYmUgbmVlZGVkLCBidXQgYmVzdCB0byBiZSBzdXJlLlxuICAgIHJldHVybiBwZXJpbWV0ZXJTaGFwZTtcbiAgfVxuXG4gIC8vIEBwcml2YXRlXG4gIGNyZWF0ZVNoYXBlRnJvbVBlcmltZXRlckxpc3QoIHBlcmltZXRlcnMgKSB7XG4gICAgY29uc3QgcGVyaW1ldGVyU2hhcGUgPSBuZXcgU2hhcGUoKTtcbiAgICBwZXJpbWV0ZXJzLmZvckVhY2goIHBlcmltZXRlclBvaW50cyA9PiB7XG4gICAgICBwZXJpbWV0ZXJTaGFwZS5tb3ZlVG9Qb2ludCggcGVyaW1ldGVyUG9pbnRzWyAwIF0gKTtcbiAgICAgIGZvciAoIGxldCBpID0gMTsgaSA8IHBlcmltZXRlclBvaW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgcGVyaW1ldGVyU2hhcGUubGluZVRvUG9pbnQoIHBlcmltZXRlclBvaW50c1sgaSBdICk7XG4gICAgICB9XG4gICAgICBwZXJpbWV0ZXJTaGFwZS5jbG9zZSgpO1xuICAgIH0gKTtcbiAgICByZXR1cm4gcGVyaW1ldGVyU2hhcGU7XG4gIH1cblxuICAvKipcbiAgICogTWFyY2hpbmcgc3F1YXJlcyBhbGdvcml0aG0gZm9yIHNjYW5uaW5nIHRoZSBwZXJpbWV0ZXIgb2YgYSBzaGFwZSwgc2VlXG4gICAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01hcmNoaW5nX3NxdWFyZXMgb3Igc2VhcmNoIHRoZSBJbnRlcm5ldCBmb3IgJ01hcmNoaW5nIFNxdWFyZXMgQWxnb3JpdGhtJyBmb3IgbW9yZVxuICAgKiBpbmZvcm1hdGlvbiBvbiB0aGlzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2NhblBlcmltZXRlciggd2luZG93U3RhcnQgKSB7XG4gICAgY29uc3Qgc2NhbldpbmRvdyA9IHdpbmRvd1N0YXJ0LmNvcHkoKTtcbiAgICBsZXQgc2NhbkNvbXBsZXRlID0gZmFsc2U7XG4gICAgY29uc3QgcGVyaW1ldGVyUG9pbnRzID0gW107XG4gICAgbGV0IHByZXZpb3VzTW92ZW1lbnRWZWN0b3IgPSBNT1ZFTUVOVF9WRUNUT1JTLnVwOyAvLyBJbml0IHRoaXMgd2F5IGFsbG93cyBhbGdvcml0aG0gdG8gd29yayBmb3IgaW50ZXJpb3IgcGVyaW1ldGVycy5cbiAgICB3aGlsZSAoICFzY2FuQ29tcGxldGUgKSB7XG5cbiAgICAgIC8vIFNjYW4gdGhlIGN1cnJlbnQgZm91ci1waXhlbCBhcmVhLlxuICAgICAgY29uc3QgdXBMZWZ0T2NjdXBpZWQgPSB0aGlzLmlzQ2VsbE9jY3VwaWVkKCBzY2FuV2luZG93LnggLSAxLCBzY2FuV2luZG93LnkgLSAxICk7XG4gICAgICBjb25zdCB1cFJpZ2h0T2NjdXBpZWQgPSB0aGlzLmlzQ2VsbE9jY3VwaWVkKCBzY2FuV2luZG93LngsIHNjYW5XaW5kb3cueSAtIDEgKTtcbiAgICAgIGNvbnN0IGRvd25MZWZ0T2NjdXBpZWQgPSB0aGlzLmlzQ2VsbE9jY3VwaWVkKCBzY2FuV2luZG93LnggLSAxLCBzY2FuV2luZG93LnkgKTtcbiAgICAgIGNvbnN0IGRvd25SaWdodE9jY3VwaWVkID0gdGhpcy5pc0NlbGxPY2N1cGllZCggc2NhbldpbmRvdy54LCBzY2FuV2luZG93LnkgKTtcblxuICAgICAgLy8gTWFwIHRoZSBzY2FuIHRvIHRoZSBvbmUgb2YgMTYgcG9zc2libGUgc3RhdGVzLlxuICAgICAgbGV0IG1hcmNoaW5nU3F1YXJlc1N0YXRlID0gMDtcbiAgICAgIGlmICggdXBMZWZ0T2NjdXBpZWQgKSB7IG1hcmNoaW5nU3F1YXJlc1N0YXRlIHw9IDE7IH0gLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1iaXR3aXNlXG4gICAgICBpZiAoIHVwUmlnaHRPY2N1cGllZCApIHsgbWFyY2hpbmdTcXVhcmVzU3RhdGUgfD0gMjsgfSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWJpdHdpc2VcbiAgICAgIGlmICggZG93bkxlZnRPY2N1cGllZCApIHsgbWFyY2hpbmdTcXVhcmVzU3RhdGUgfD0gNDsgfSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWJpdHdpc2VcbiAgICAgIGlmICggZG93blJpZ2h0T2NjdXBpZWQgKSB7IG1hcmNoaW5nU3F1YXJlc1N0YXRlIHw9IDg7IH0gLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1iaXR3aXNlXG5cbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoXG4gICAgICBtYXJjaGluZ1NxdWFyZXNTdGF0ZSAhPT0gMCAmJiBtYXJjaGluZ1NxdWFyZXNTdGF0ZSAhPT0gMTUsXG4gICAgICAgICdNYXJjaGluZyBzcXVhcmVzIGFsZ29yaXRobSByZWFjaGVkIGludmFsaWQgc3RhdGUuJ1xuICAgICAgKTtcblxuICAgICAgLy8gQ29udmVydCBhbmQgYWRkIHRoaXMgcG9pbnQgdG8gdGhlIHBlcmltZXRlciBwb2ludHMuXG4gICAgICBwZXJpbWV0ZXJQb2ludHMucHVzaCggdGhpcy5jZWxsVG9Nb2RlbENvb3Jkcyggc2NhbldpbmRvdy54LCBzY2FuV2luZG93LnkgKSApO1xuXG4gICAgICAvLyBNb3ZlIHRoZSBzY2FuIHdpbmRvdyB0byB0aGUgbmV4dCBwb3NpdGlvbi5cbiAgICAgIGNvbnN0IG1vdmVtZW50VmVjdG9yID0gU0NBTl9BUkVBX01PVkVNRU5UX0ZVTkNUSU9OU1sgbWFyY2hpbmdTcXVhcmVzU3RhdGUgXSggcHJldmlvdXNNb3ZlbWVudFZlY3RvciApO1xuICAgICAgc2NhbldpbmRvdy5hZGQoIG1vdmVtZW50VmVjdG9yICk7XG4gICAgICBwcmV2aW91c01vdmVtZW50VmVjdG9yID0gbW92ZW1lbnRWZWN0b3I7XG5cbiAgICAgIGlmICggc2NhbldpbmRvdy5lcXVhbHMoIHdpbmRvd1N0YXJ0ICkgKSB7XG4gICAgICAgIHNjYW5Db21wbGV0ZSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwZXJpbWV0ZXJQb2ludHM7XG4gIH1cblxuICAvLyBAcHJpdmF0ZSwgVXBkYXRlIHRoZSBleHRlcmlvciBhbmQgaW50ZXJpb3IgcGVyaW1ldGVycy5cbiAgdXBkYXRlUGVyaW1ldGVycygpIHtcbiAgICAvLyBUaGUgcGVyaW1ldGVycyBjYW4gb25seSBiZSBjb21wdXRlZCBmb3IgYSBzaW5nbGUgY29uc29saWRhdGVkIHNoYXBlLlxuICAgIGlmICggIXRoaXMuZm9ybUNvbXBvc2l0ZVByb3BlcnR5LmdldCgpIHx8IHRoaXMucmVzaWRlbnRTaGFwZXMubGVuZ3RoID09PSAwICkge1xuICAgICAgdGhpcy5wZXJpbWV0ZXIgPSAwO1xuICAgICAgdGhpcy5jb21wb3NpdGVTaGFwZVByb3BlcnR5LnJlc2V0KCk7XG4gICAgfVxuICAgIGVsc2UgeyAvLyBEbyB0aGUgZnVsbC1ibG93biBwZXJpbWV0ZXIgY2FsY3VsYXRpb25cbiAgICAgIGxldCByb3c7XG4gICAgICBsZXQgY29sdW1uO1xuICAgICAgY29uc3QgZXh0ZXJpb3JQZXJpbWV0ZXJzID0gW107XG5cbiAgICAgIC8vIElkZW50aWZ5IGVhY2ggb3V0ZXIgcGVyaW1ldGVyLiAgVGhlcmUgbWF5IGJlIG1vcmUgdGhhbiBvbmUgaWYgdGhlIHVzZXIgaXMgbW92aW5nIGEgc2hhcGUgdGhhdCB3YXMgcHJldmlvdXNseVxuICAgICAgLy8gb24gdGhpcyBib2FyZCwgc2luY2UgYW55IG9ycGhhbmVkIHNoYXBlcyBhcmUgbm90IHJlbGVhc2VkIHVudGlsIHRoZSBtb3ZlIGlzIGNvbXBsZXRlLlxuICAgICAgY29uc3QgY29udGlndW91c0NlbGxHcm91cHMgPSB0aGlzLmlkZW50aWZ5Q29udGlndW91c0NlbGxHcm91cHMoKTtcbiAgICAgIGNvbnRpZ3VvdXNDZWxsR3JvdXBzLmZvckVhY2goIGNlbGxHcm91cCA9PiB7XG5cbiAgICAgICAgLy8gRmluZCB0aGUgdG9wIGxlZnQgc3F1YXJlIG9mIHRoaXMgZ3JvdXAgdG8gdXNlIGFzIGEgc3RhcnRpbmcgcG9pbnQuXG4gICAgICAgIGxldCB0b3BMZWZ0Q2VsbCA9IG51bGw7XG4gICAgICAgIGNlbGxHcm91cC5mb3JFYWNoKCBjZWxsID0+IHtcbiAgICAgICAgICBpZiAoIHRvcExlZnRDZWxsID09PSBudWxsIHx8IGNlbGwucm93IDwgdG9wTGVmdENlbGwucm93IHx8ICggY2VsbC5yb3cgPT09IHRvcExlZnRDZWxsLnJvdyAmJiBjZWxsLmNvbHVtbiA8IHRvcExlZnRDZWxsLmNvbHVtbiApICkge1xuICAgICAgICAgICAgdG9wTGVmdENlbGwgPSBjZWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuXG4gICAgICAgIC8vIFNjYW4gdGhlIG91dGVyIHBlcmltZXRlciBhbmQgYWRkIHRvIGxpc3QuXG4gICAgICAgIGNvbnN0IHRvcExlZnRDZWxsT2ZHcm91cCA9IG5ldyBWZWN0b3IyKCB0b3BMZWZ0Q2VsbC5jb2x1bW4sIHRvcExlZnRDZWxsLnJvdyApO1xuICAgICAgICBleHRlcmlvclBlcmltZXRlcnMucHVzaCggdGhpcy5zY2FuUGVyaW1ldGVyKCB0b3BMZWZ0Q2VsbE9mR3JvdXAgKSApO1xuICAgICAgfSApO1xuXG4gICAgICAvLyBTY2FuIGZvciBlbXB0eSBzcGFjZXMgZW5jbG9zZWQgd2l0aGluIHRoZSBvdXRlciBwZXJpbWV0ZXIocykuXG4gICAgICBjb25zdCBvdXRsaW5lU2hhcGUgPSB0aGlzLmNyZWF0ZVNoYXBlRnJvbVBlcmltZXRlckxpc3QoIGV4dGVyaW9yUGVyaW1ldGVycyApO1xuICAgICAgbGV0IGVuY2xvc2VkU3BhY2VzID0gW107XG4gICAgICBmb3IgKCByb3cgPSAwOyByb3cgPCB0aGlzLm51bVJvd3M7IHJvdysrICkge1xuICAgICAgICBmb3IgKCBjb2x1bW4gPSAwOyBjb2x1bW4gPCB0aGlzLm51bUNvbHVtbnM7IGNvbHVtbisrICkge1xuICAgICAgICAgIGlmICggIXRoaXMuaXNDZWxsT2NjdXBpZWQoIGNvbHVtbiwgcm93ICkgKSB7XG4gICAgICAgICAgICAvLyBUaGlzIGNlbGwgaXMgZW1wdHkuICBUZXN0IGlmIGl0IGlzIHdpdGhpbiB0aGUgb3V0bGluZSBwZXJpbWV0ZXIuXG4gICAgICAgICAgICBjb25zdCBjZWxsQ2VudGVySW5Nb2RlbCA9IHRoaXMuY2VsbFRvTW9kZWxDb29yZHMoIGNvbHVtbiwgcm93ICkuYWRkWFkoIHRoaXMudW5pdFNxdWFyZUxlbmd0aCAvIDIsIHRoaXMudW5pdFNxdWFyZUxlbmd0aCAvIDIgKTtcbiAgICAgICAgICAgIGlmICggb3V0bGluZVNoYXBlLmNvbnRhaW5zUG9pbnQoIGNlbGxDZW50ZXJJbk1vZGVsICkgKSB7XG4gICAgICAgICAgICAgIGVuY2xvc2VkU3BhY2VzLnB1c2goIG5ldyBWZWN0b3IyKCBjb2x1bW4sIHJvdyApICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIE1hcCB0aGUgaW50ZXJuYWwgcGVyaW1ldGVyc1xuICAgICAgY29uc3QgaW50ZXJpb3JQZXJpbWV0ZXJzID0gW107XG4gICAgICB3aGlsZSAoIGVuY2xvc2VkU3BhY2VzLmxlbmd0aCA+IDAgKSB7XG5cbiAgICAgICAgLy8gTG9jYXRlIHRoZSB0b3AgbGVmdCBtb3N0IHNwYWNlXG4gICAgICAgIGxldCB0b3BMZWZ0U3BhY2UgPSBlbmNsb3NlZFNwYWNlc1sgMCBdO1xuICAgICAgICBlbmNsb3NlZFNwYWNlcy5mb3JFYWNoKCBjZWxsID0+IHtcbiAgICAgICAgICBpZiAoIGNlbGwueSA8IHRvcExlZnRTcGFjZS55IHx8ICggY2VsbC55ID09PSB0b3BMZWZ0U3BhY2UueSAmJiBjZWxsLnggPCB0b3BMZWZ0U3BhY2UueCApICkge1xuICAgICAgICAgICAgdG9wTGVmdFNwYWNlID0gY2VsbDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gKTtcblxuICAgICAgICAvLyBNYXAgdGhlIGludGVyaW9yIHBlcmltZXRlci5cbiAgICAgICAgY29uc3QgZW5jbG9zZWRQZXJpbWV0ZXJQb2ludHMgPSB0aGlzLnNjYW5QZXJpbWV0ZXIoIHRvcExlZnRTcGFjZSApO1xuICAgICAgICBpbnRlcmlvclBlcmltZXRlcnMucHVzaCggZW5jbG9zZWRQZXJpbWV0ZXJQb2ludHMgKTtcblxuICAgICAgICAvLyBJZGVudGlmeSBhbmQgc2F2ZSBhbGwgc3BhY2VzIG5vdCBlbmNsb3NlZCBieSB0aGlzIHBlcmltZXRlci5cbiAgICAgICAgY29uc3QgcGVyaW1ldGVyU2hhcGUgPSB0aGlzLmNyZWF0ZVNoYXBlRnJvbVBlcmltZXRlclBvaW50cyggZW5jbG9zZWRQZXJpbWV0ZXJQb2ludHMgKTtcbiAgICAgICAgY29uc3QgbGVmdG92ZXJFbXB0eVNwYWNlcyA9IFtdO1xuICAgICAgICBlbmNsb3NlZFNwYWNlcy5mb3JFYWNoKCBlbmNsb3NlZFNwYWNlID0+IHtcbiAgICAgICAgICBjb25zdCBwb3NpdGlvblBvaW50ID0gdGhpcy5jZWxsVG9Nb2RlbENvb3JkcyggZW5jbG9zZWRTcGFjZS54LCBlbmNsb3NlZFNwYWNlLnkgKTtcbiAgICAgICAgICBjb25zdCBjZW50ZXJQb2ludCA9IHBvc2l0aW9uUG9pbnQucGx1c1hZKCB0aGlzLnVuaXRTcXVhcmVMZW5ndGggLyAyLCB0aGlzLnVuaXRTcXVhcmVMZW5ndGggLyAyICk7XG4gICAgICAgICAgaWYgKCAhcGVyaW1ldGVyU2hhcGUuY29udGFpbnNQb2ludCggY2VudGVyUG9pbnQgKSApIHtcbiAgICAgICAgICAgIC8vIFRoaXMgc3BhY2UgaXMgbm90IGNvbnRhaW5lZCBpbiB0aGUgcGVyaW1ldGVyIHRoYXQgd2FzIGp1c3QgbWFwcGVkLlxuICAgICAgICAgICAgbGVmdG92ZXJFbXB0eVNwYWNlcy5wdXNoKCBlbmNsb3NlZFNwYWNlICk7XG4gICAgICAgICAgfVxuICAgICAgICB9ICk7XG5cbiAgICAgICAgLy8gU2V0IHVwIGZvciB0aGUgbmV4dCB0aW1lIHRocm91Z2ggdGhlIGxvb3AuXG4gICAgICAgIGVuY2xvc2VkU3BhY2VzID0gbGVmdG92ZXJFbXB0eVNwYWNlcztcbiAgICAgIH1cblxuICAgICAgLy8gVXBkYXRlIGV4dGVybmFsbHkgdmlzaWJsZSBwcm9wZXJ0aWVzLiAgT25seSB1cGRhdGUgdGhlIHBlcmltZXRlcnMgaWYgdGhleSBoYXZlIGNoYW5nZWQgaW4gb3JkZXIgdG8gbWluaW1pemVcbiAgICAgIC8vIHdvcmsgZG9uZSBpbiB0aGUgdmlldy5cbiAgICAgIGlmICggISggdGhpcy5wZXJpbWV0ZXJMaXN0c0VxdWFsKCBleHRlcmlvclBlcmltZXRlcnMsIHRoaXMuY29tcG9zaXRlU2hhcGVQcm9wZXJ0eS5nZXQoKS5leHRlcmlvclBlcmltZXRlcnMgKSAmJlxuICAgICAgICAgICAgICB0aGlzLnBlcmltZXRlckxpc3RzRXF1YWwoIGludGVyaW9yUGVyaW1ldGVycywgdGhpcy5jb21wb3NpdGVTaGFwZVByb3BlcnR5LmdldCgpLmludGVyaW9yUGVyaW1ldGVycyApICkgKSB7XG4gICAgICAgIHRoaXMuY29tcG9zaXRlU2hhcGVQcm9wZXJ0eS5zZXQoIG5ldyBQZXJpbWV0ZXJTaGFwZSggZXh0ZXJpb3JQZXJpbWV0ZXJzLCBpbnRlcmlvclBlcmltZXRlcnMsIHRoaXMudW5pdFNxdWFyZUxlbmd0aCwge1xuICAgICAgICAgIGZpbGxDb2xvcjogdGhpcy5jb21wb3NpdGVTaGFwZUZpbGxDb2xvcixcbiAgICAgICAgICBlZGdlQ29sb3I6IHRoaXMuY29tcG9zaXRlU2hhcGVFZGdlQ29sb3JcbiAgICAgICAgfSApICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQHByaXZhdGVcbiAgcGVyaW1ldGVyUG9pbnRzRXF1YWwoIHBlcmltZXRlcjEsIHBlcmltZXRlcjIgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggcGVyaW1ldGVyMSApICYmIEFycmF5LmlzQXJyYXkoIHBlcmltZXRlcjIgKSwgJ0ludmFsaWQgcGFyYW1ldGVycyBmb3IgcGVyaW1ldGVyUG9pbnRzRXF1YWwnICk7XG4gICAgaWYgKCBwZXJpbWV0ZXIxLmxlbmd0aCAhPT0gcGVyaW1ldGVyMi5sZW5ndGggKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBwZXJpbWV0ZXIxLmV2ZXJ5KCAoIHBvaW50LCBpbmRleCApID0+IHBvaW50LmVxdWFscyggcGVyaW1ldGVyMlsgaW5kZXggXSApICk7XG4gIH1cblxuICAvLyBAcHJpdmF0ZVxuICBwZXJpbWV0ZXJMaXN0c0VxdWFsKCBwZXJpbWV0ZXJMaXN0MSwgcGVyaW1ldGVyTGlzdDIgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggcGVyaW1ldGVyTGlzdDEgKSAmJiBBcnJheS5pc0FycmF5KCBwZXJpbWV0ZXJMaXN0MiApLCAnSW52YWxpZCBwYXJhbWV0ZXJzIGZvciBwZXJpbWV0ZXJMaXN0c0VxdWFsJyApO1xuICAgIGlmICggcGVyaW1ldGVyTGlzdDEubGVuZ3RoICE9PSBwZXJpbWV0ZXJMaXN0Mi5sZW5ndGggKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBwZXJpbWV0ZXJMaXN0MS5ldmVyeSggKCBwZXJpbWV0ZXJQb2ludHMsIGluZGV4ICkgPT4gdGhpcy5wZXJpbWV0ZXJQb2ludHNFcXVhbCggcGVyaW1ldGVyUG9pbnRzLCBwZXJpbWV0ZXJMaXN0MlsgaW5kZXggXSApICk7XG4gIH1cblxuICAvKipcbiAgICogSWRlbnRpZnkgYWxsIGNlbGxzIHRoYXQgYXJlIGFkamFjZW50IHRvIHRoZSBwcm92aWRlZCBjZWxsIGFuZCB0aGF0IGFyZSBjdXJyZW50bHkgb2NjdXBpZWQgYnkgYSBzaGFwZS4gIE9ubHlcbiAgICogc2hhcGVzIHRoYXQgc2hhcmUgYW4gZWRnZSBhcmUgY29uc2lkZXJlZCB0byBiZSBhZGphY2VudCwgc2hhcGVzIHRoYXQgb25seSB0b3VjaCBhdCB0aGUgY29ybmVyIGRvbid0IGNvdW50LiAgVGhpc1xuICAgKiB1c2VzIHJlY3Vyc2lvbi4gIEl0IGFsc28gcmVsaWVzIG9uIGEgZmxhZyB0aGF0IG11c3QgYmUgY2xlYXJlZCBmb3IgdGhlIGNlbGxzIGJlZm9yZSBjYWxsaW5nIHRoaXMgYWxnb3JpdGhtLiAgVGhlXG4gICAqIGZsYWcgaXMgZG9uZSBmb3IgZWZmaWNpZW5jeSwgYnV0IHRoaXMgY291bGQgYmUgY2hhbmdlZCB0byBzZWFyY2ggdGhyb3VnaCB0aGUgbGlzdCBvZiBjZWxscyBpbiB0aGUgY2VsbCBncm91cCBpZlxuICAgKiB0aGF0IGZsYWcgbWV0aG9kIGlzIHRvbyB3ZWlyZC5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHN0YXJ0Q2VsbFxuICAgKiBAcGFyYW0gY2VsbEdyb3VwXG4gICAqL1xuICBpZGVudGlmeUFkamFjZW50T2NjdXBpZWRDZWxscyggc3RhcnRDZWxsLCBjZWxsR3JvdXAgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc3RhcnRDZWxsLm9jY3VwaWVkQnkgIT09IG51bGwsICdVc2FnZSBlcnJvcjogVW5vY2N1cGllZCBjZWxsIHBhc3NlZCB0byBncm91cCBpZGVudGlmaWNhdGlvbi4nICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXN0YXJ0Q2VsbC5jYXRhbG9nZWQsICdVc2FnZSBlcnJvcjogQ2F0YWxvZ2VkIGNlbGwgcGFzc2VkIHRvIGdyb3VwIGlkZW50aWZpY2F0aW9uIGFsZ29yaXRobS4nICk7XG4gICAgLy8gQ2F0YWxvZyB0aGlzIGNlbGwuXG4gICAgY2VsbEdyb3VwLnB1c2goIHN0YXJ0Q2VsbCApO1xuICAgIHN0YXJ0Q2VsbC5jYXRhbG9nZWQgPSB0cnVlO1xuXG4gICAgLy8gQ2hlY2sgb2NjdXBhbmN5IG9mIGVhY2ggb2YgdGhlIGZvdXIgYWRqZWNlbnQgY2VsbHMuXG4gICAgT2JqZWN0LmtleXMoIE1PVkVNRU5UX1ZFQ1RPUlMgKS5mb3JFYWNoKCBrZXkgPT4ge1xuICAgICAgY29uc3QgbW92ZW1lbnRWZWN0b3IgPSBNT1ZFTUVOVF9WRUNUT1JTWyBrZXkgXTtcbiAgICAgIGNvbnN0IGFkamFjZW50Q2VsbCA9IHRoaXMuZ2V0Q2VsbCggc3RhcnRDZWxsLmNvbHVtbiArIG1vdmVtZW50VmVjdG9yLngsIHN0YXJ0Q2VsbC5yb3cgKyBtb3ZlbWVudFZlY3Rvci55ICk7XG4gICAgICBpZiAoIGFkamFjZW50Q2VsbCAhPT0gbnVsbCAmJiBhZGphY2VudENlbGwub2NjdXBpZWRCeSAhPT0gbnVsbCAmJiAhYWRqYWNlbnRDZWxsLmNhdGFsb2dlZCApIHtcbiAgICAgICAgdGhpcy5pZGVudGlmeUFkamFjZW50T2NjdXBpZWRDZWxscyggYWRqYWNlbnRDZWxsLCBjZWxsR3JvdXAgKTtcbiAgICAgIH1cbiAgICB9ICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSByZXByZXNlbnRpbmcgYWxsIGNvbnRpZ3VvdXMgZ3JvdXBzIG9mIG9jY3VwaWVkIGNlbGxzLiAgRWFjaCBncm91cCBpcyBhIGxpc3Qgb2YgY2VsbHMuXG4gICAqIEBwcml2YXRlXG4gICAqIEByZXR1cm5zIHtBcnJheX1cbiAgICovXG4gIGlkZW50aWZ5Q29udGlndW91c0NlbGxHcm91cHMoKSB7XG5cbiAgICAvLyBNYWtlIGEgbGlzdCBvZiBwb3NpdGlvbnMgZm9yIGFsbCBvY2N1cGllZCBjZWxscy5cbiAgICBsZXQgdW5ncm91cGVkT2NjdXBpZWRDZWxscyA9IFtdO1xuICAgIGZvciAoIGxldCByb3cgPSAwOyByb3cgPCB0aGlzLm51bVJvd3M7IHJvdysrICkge1xuICAgICAgZm9yICggbGV0IGNvbHVtbiA9IDA7IGNvbHVtbiA8IHRoaXMubnVtQ29sdW1uczsgY29sdW1uKysgKSB7XG4gICAgICAgIGNvbnN0IGNlbGwgPSB0aGlzLmNlbGxzWyBjb2x1bW4gXVsgcm93IF07XG4gICAgICAgIGlmICggY2VsbC5vY2N1cGllZEJ5ICE9PSBudWxsICkge1xuICAgICAgICAgIHVuZ3JvdXBlZE9jY3VwaWVkQ2VsbHMucHVzaCggdGhpcy5jZWxsc1sgY29sdW1uIF1bIHJvdyBdICk7XG4gICAgICAgICAgLy8gQ2xlYXIgdGhlIGZsYWcgdXNlZCBieSB0aGUgc2VhcmNoIGFsZ29yaXRobS5cbiAgICAgICAgICBjZWxsLmNhdGFsb2dlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWRlbnRpZnkgdGhlIGludGVyY29ubmVjdGVkIGdyb3VwcyBvZiBjZWxscy5cbiAgICBjb25zdCBjb250aWd1b3VzQ2VsbEdyb3VwcyA9IFtdO1xuICAgIHdoaWxlICggdW5ncm91cGVkT2NjdXBpZWRDZWxscy5sZW5ndGggPiAwICkge1xuICAgICAgY29uc3QgY2VsbEdyb3VwID0gW107XG4gICAgICB0aGlzLmlkZW50aWZ5QWRqYWNlbnRPY2N1cGllZENlbGxzKCB1bmdyb3VwZWRPY2N1cGllZENlbGxzWyAwIF0sIGNlbGxHcm91cCApO1xuICAgICAgY29udGlndW91c0NlbGxHcm91cHMucHVzaCggY2VsbEdyb3VwICk7XG4gICAgICB1bmdyb3VwZWRPY2N1cGllZENlbGxzID0gXy5kaWZmZXJlbmNlKCB1bmdyb3VwZWRPY2N1cGllZENlbGxzLCBjZWxsR3JvdXAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29udGlndW91c0NlbGxHcm91cHM7XG4gIH1cblxuICAvKipcbiAgICogUmVsZWFzZSBhbnkgc2hhcGVzIHRoYXQgYXJlIHJlc2lkZW50IG9uIHRoZSBib2FyZCBidXQgdGhhdCBkb24ndCBzaGFyZSBhdCBsZWFzdCBvbmUgZWRnZSB3aXRoIHRoZSBsYXJnZXN0XG4gICAqIGNvbXBvc2l0ZSBzaGFwZSBvbiB0aGUgYm9hcmQuICBTdWNoIHNoYXBlcyBhcmUgcmVmZXJyZWQgdG8gYXMgJ29ycGhhbnMnIGFuZCwgd2hlbiByZWxlYXNlLCB0aGV5IGFyZSBzZW50IGJhY2sgdG9cbiAgICogdGhlIHBvc2l0aW9uIHdoZXJlIHRoZXkgd2VyZSBjcmVhdGVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcmVsZWFzZUFueU9ycGhhbnMoKSB7XG5cbiAgICAvLyBPcnBoYW5zIGNhbiBvbmx5IGV4aXN0IHdoZW4gb3BlcmF0aW5nIGluIHRoZSAnZm9ybUNvbXBvc2l0ZScgbW9kZS5cbiAgICBpZiAoIHRoaXMuZm9ybUNvbXBvc2l0ZVByb3BlcnR5LmdldCgpICkge1xuICAgICAgY29uc3QgY29udGlndW91c0NlbGxHcm91cHMgPSB0aGlzLmlkZW50aWZ5Q29udGlndW91c0NlbGxHcm91cHMoKTtcblxuICAgICAgaWYgKCBjb250aWd1b3VzQ2VsbEdyb3Vwcy5sZW5ndGggPiAxICkge1xuICAgICAgICAvLyBUaGVyZSBhcmUgb3JwaGFucyB0aGF0IHNob3VsZCBiZSByZWxlYXNlZC4gIERldGVybWluZSB3aGljaCBvbmVzLlxuICAgICAgICBsZXQgaW5kZXhPZlJldGFpbmVkR3JvdXAgPSAwO1xuICAgICAgICBjb250aWd1b3VzQ2VsbEdyb3Vwcy5mb3JFYWNoKCAoIGdyb3VwLCBpbmRleCApID0+IHtcbiAgICAgICAgICBpZiAoIGdyb3VwLmxlbmd0aCA+IGNvbnRpZ3VvdXNDZWxsR3JvdXBzWyBpbmRleE9mUmV0YWluZWRHcm91cCBdLmxlbmd0aCApIHtcbiAgICAgICAgICAgIGluZGV4T2ZSZXRhaW5lZEdyb3VwID0gaW5kZXg7XG4gICAgICAgICAgfVxuICAgICAgICB9ICk7XG5cbiAgICAgICAgY29udGlndW91c0NlbGxHcm91cHMuZm9yRWFjaCggKCBncm91cCwgZ3JvdXBJbmRleCApID0+IHtcbiAgICAgICAgICBpZiAoIGdyb3VwSW5kZXggIT09IGluZGV4T2ZSZXRhaW5lZEdyb3VwICkge1xuICAgICAgICAgICAgZ3JvdXAuZm9yRWFjaCggY2VsbCA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IG1vdmFibGVTaGFwZSA9IGNlbGwub2NjdXBpZWRCeTtcbiAgICAgICAgICAgICAgaWYgKCBtb3ZhYmxlU2hhcGUgIT09IG51bGwgKSB7IC8vIE5lZWQgdG8gdGVzdCBpbiBjYXNlIGEgcHJldmlvdXNseSByZWxlYXNlZCBzaGFwZSBjb3ZlcmVkIG11bHRpcGxlIGNlbGxzLlxuICAgICAgICAgICAgICAgIHRoaXMucmVsZWFzZVNoYXBlKCBtb3ZhYmxlU2hhcGUgKTtcbiAgICAgICAgICAgICAgICBtb3ZhYmxlU2hhcGUucmV0dXJuVG9PcmlnaW4oIHRydWUgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBsYWNlIG9uZSBvZiB0aGUgY29tcG9zaXRlIHNoYXBlcyB0aGF0IGN1cnJlbnRseSByZXNpZGVzIG9uIHRoaXMgYm9hcmQgd2l0aCBhIHNldCBvZiB1bml0IHNxdWFyZXMuICBUaGlzIGlzXG4gICAqIGdlbmVyYWxseSBkb25lIHdoZW4gYSBjb21wb3NpdGUgc2hhcGUgd2FzIHBsYWNlZCBvbiB0aGUgYm9hcmQgYnV0IHdlIG5vdyB3YW50IGl0IHRyZWF0ZWQgYXMgYSBidW5jaCBvZiBzbWFsbGVyXG4gICAqIHVuaXQgc3F1YXJlcyBpbnN0ZWFkLlxuICAgKlxuICAgKiBAcGFyYW0ge01vdmFibGVTaGFwZX0gb3JpZ2luYWxTaGFwZVxuICAgKiBAcGFyYW0ge0FycmF5LjxNb3ZhYmxlU2hhcGU+fSB1bml0U3F1YXJlcyBQaWVjZXMgdGhhdCBjb21wcmlzZSB0aGUgb3JpZ2luYWwgc2hhcGUsIE1VU1QgQkUgQ09SUkVDVExZIExPQ0FURURcbiAgICogc2luY2UgdGhpcyBtZXRob2QgZG9lcyBub3QgcmVsb2NhdGUgdGhlbSB0byB0aGUgYXBwcm9wcmlhdGUgcGxhY2VzLlxuICAgKiBAcHVibGljXG4gICAqL1xuICByZXBsYWNlU2hhcGVXaXRoVW5pdFNxdWFyZXMoIG9yaWdpbmFsU2hhcGUsIHVuaXRTcXVhcmVzICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNSZXNpZGVudFNoYXBlKCBvcmlnaW5hbFNoYXBlICksICdFcnJvcjogU3BlY2lmaWVkIHNoYXBlIHRvIGJlIHJlcGxhY2VkIGRvZXMgbm90IGFwcGVhciB0byBiZSBwcmVzZW50LicgKTtcblxuICAgIC8vIFRoZSBmb2xsb3dpbmcgYWRkIGFuZCByZW1vdmUgb3BlcmF0aW9ucyBkbyBub3QgdXNlIHRoZSBhZGQgYW5kIHJlbW92ZSBtZXRob2RzIGluIG9yZGVyIHRvIGF2b2lkIHJlbGVhc2luZ1xuICAgIC8vIG9ycGhhbnMgKHdoaWNoIGNvdWxkIGNhdXNlIHVuZGVzaXJlZCBiZWhhdmlvcikgYW5kIGF0dHJpYnV0ZSB1cGRhdGVzICh3aGljaCBhcmUgdW5uZWNlc3NhcnkpLlxuICAgIHRoaXMucmVzaWRlbnRTaGFwZXMucmVtb3ZlKCBvcmlnaW5hbFNoYXBlICk7XG4gICAgdGhpcy51cGRhdGVDZWxsT2NjdXBhdGlvbiggb3JpZ2luYWxTaGFwZSwgJ3JlbW92ZScgKTtcblxuICAgIHVuaXRTcXVhcmVzLmZvckVhY2goIG1vdmFibGVVbml0U3F1YXJlID0+IHtcbiAgICAgIHRoaXMucmVzaWRlbnRTaGFwZXMucHVzaCggbW92YWJsZVVuaXRTcXVhcmUgKTtcblxuICAgICAgLy8gU2V0IHVwIGEgbGlzdGVuZXIgdG8gcmVtb3ZlIHRoaXMgc2hhcGUgd2hlbiB0aGUgdXNlciBncmFicyBpdC5cbiAgICAgIHRoaXMuYWRkUmVtb3ZhbExpc3RlbmVyKCBtb3ZhYmxlVW5pdFNxdWFyZSApO1xuXG4gICAgICAvLyBNYWtlIHNvbWUgc3RhdGUgdXBkYXRlcy5cbiAgICAgIHRoaXMudXBkYXRlQ2VsbE9jY3VwYXRpb24oIG1vdmFibGVVbml0U3F1YXJlLCAnYWRkJyApO1xuICAgIH0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBhZGRzIGEgbGlzdGVuZXIgdGhhdCB3aWxsIHJlbW92ZSB0aGlzIHNoYXBlIGZyb20gdGhlIGJvYXJkIHdoZW4gdGhlIHVzZXIgZ3JhYnMgaXRcbiAgICogQHBhcmFtIHtNb3ZhYmxlU2hhcGV9IG1vdmFibGVTaGFwZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYWRkUmVtb3ZhbExpc3RlbmVyKCBtb3ZhYmxlU2hhcGUgKSB7XG5cbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGZ1bmN0aW9uIHJlbW92YWxMaXN0ZW5lciggdXNlckNvbnRyb2xsZWQgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KFxuICAgICAgICB1c2VyQ29udHJvbGxlZCA9PT0gdHJ1ZSxcbiAgICAgICAgJ3Nob3VsZCBvbmx5IHNlZSBzaGFwZXMgYmVjb21lIHVzZXIgY29udHJvbGxlZCBhZnRlciBiZWluZyBhZGRlZCB0byBhIHBsYWNlbWVudCBib2FyZCdcbiAgICAgICk7XG4gICAgICBzZWxmLnJlbW92ZVJlc2lkZW50U2hhcGUoIG1vdmFibGVTaGFwZSApO1xuICAgICAgbW92YWJsZVNoYXBlLnVzZXJDb250cm9sbGVkUHJvcGVydHkudW5saW5rKCByZW1vdmFsTGlzdGVuZXIgKTtcbiAgICB9XG5cbiAgICB0aGlzLnRhZ0xpc3RlbmVyKCByZW1vdmFsTGlzdGVuZXIgKTtcbiAgICBtb3ZhYmxlU2hhcGUudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5sYXp5TGluayggcmVtb3ZhbExpc3RlbmVyICk7XG4gIH1cblxuICAvLyBAcHVibGljLCBzZXQgY29sb3JzIHVzZWQgZm9yIHRoZSBjb21wb3NpdGUgc2hhcGUgc2hvd24gZm9yIHRoaXMgYm9hcmRcbiAgc2V0Q29tcG9zaXRlU2hhcGVDb2xvclNjaGVtZSggZmlsbENvbG9yLCBlZGdlQ29sb3IgKSB7XG4gICAgdGhpcy5jb21wb3NpdGVTaGFwZUZpbGxDb2xvciA9IGZpbGxDb2xvcjtcbiAgICB0aGlzLmNvbXBvc2l0ZVNoYXBlRWRnZUNvbG9yID0gZWRnZUNvbG9yO1xuICB9XG5cbiAgLy8gQHByaXZhdGUsIFVwZGF0ZSBwZXJpbWV0ZXIgcG9pbnRzLCBwbGFjZW1lbnQgcG9zaXRpb25zLCB0b3RhbCBhcmVhLCBhbmQgdG90YWwgcGVyaW1ldGVyLlxuICB1cGRhdGVBbGwoKSB7XG4gICAgaWYgKCAhdGhpcy51cGRhdGVzU3VzcGVuZGVkICkge1xuICAgICAgdGhpcy51cGRhdGVQZXJpbWV0ZXJzKCk7XG4gICAgICB0aGlzLnVwZGF0ZUFyZWFBbmRUb3RhbFBlcmltZXRlcigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBzdXNwZW5kcyB1cGRhdGVzIHNvIHRoYXQgYSBibG9jayBvZiBzcXVhcmVzIGNhbiBiZSBhZGRlZCB3aXRob3V0IGhhdmluZyB0byBhbGwgdGhlIHJlY2FsY3VsYXRpb25zXG4gICAqIGZvciBlYWNoIG9uZS4gIFRoaXMgaXMgZ2VuZXJhbGx5IGRvbmUgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMgaW4gY2FzZXMgc3VjaCBhcyBkZXBpY3RpbmcgdGhlIHNvbHV0aW9uIHRvIGFcbiAgICogY2hhbGxlbmdlIGluIHRoZSBnYW1lLiAgVGhlIGZsYWcgaXMgYXV0b21hdGljYWxseSBjbGVhcmVkIHdoZW4gdGhlIGxhc3QgaW5jb21pbmcgc2hhcGUgaXMgYWRkZWQgYXMgYSByZXNpZGVudFxuICAgKiBzaGFwZS5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgc3VzcGVuZFVwZGF0ZXNGb3JCbG9ja0FkZCgpIHtcbiAgICB0aGlzLnVwZGF0ZXNTdXNwZW5kZWQgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgYmFja2dyb3VuZCBzaGFwZS4gIFRoZSBzaGFwZSBjYW4gb3B0aW9uYWxseSBiZSBjZW50ZXJlZCBob3Jpem9udGFsbHkgYW5kIHZlcnRpY2FsbHkgd2hlbiBwbGFjZWQgb24gdGhlXG4gICAqIGJvYXJkLlxuICAgKlxuICAgKiBAcHVibGljXG4gICAqIEBwYXJhbSB7UGVyaW1ldGVyU2hhcGV9IHBlcmltZXRlclNoYXBlIFRoZSBuZXcgYmFja2dyb3VuZCBwZXJpbWV0ZXJTaGFwZSwgb3IgbnVsbCB0byBzZXQgbm8gYmFja2dyb3VuZFxuICAgKiBwZXJpbWV0ZXJTaGFwZS5cbiAgICogQHBhcmFtIHtib29sZWFufSBjZW50ZXJlZCBUcnVlIGlmIHRoZSBwZXJpbWV0ZXJTaGFwZSBzaG91bGQgYmUgY2VudGVyZWQgb24gdGhlIGJvYXJkIChidXQgc3RpbGwgYWxpZ25lZCB3aXRoIGdyaWQpLlxuICAgKi9cbiAgc2V0QmFja2dyb3VuZFNoYXBlKCBwZXJpbWV0ZXJTaGFwZSwgY2VudGVyZWQgKSB7XG4gICAgaWYgKCBwZXJpbWV0ZXJTaGFwZSA9PT0gbnVsbCApIHtcbiAgICAgIHRoaXMuYmFja2dyb3VuZFNoYXBlUHJvcGVydHkucmVzZXQoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwZXJpbWV0ZXJTaGFwZSBpbnN0YW5jZW9mIFBlcmltZXRlclNoYXBlLCAnQmFja2dyb3VuZCBwZXJpbWV0ZXJTaGFwZSBtdXN0IGJlIGEgUGVyaW1ldGVyU2hhcGUuJyApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcGVyaW1ldGVyU2hhcGUuZ2V0V2lkdGgoKSAlIHRoaXMudW5pdFNxdWFyZUxlbmd0aCA9PT0gMCAmJiBwZXJpbWV0ZXJTaGFwZS5nZXRIZWlnaHQoKSAlIHRoaXMudW5pdFNxdWFyZUxlbmd0aCA9PT0gMCxcbiAgICAgICAgJ0JhY2tncm91bmQgc2hhcGUgd2lkdGggYW5kIGhlaWdodCBtdXN0IGJlIGludGVnZXIgbXVsdGlwbGVzIG9mIHRoZSB1bml0IHNxdWFyZSBzaXplLicgKTtcbiAgICAgIGlmICggY2VudGVyZWQgKSB7XG4gICAgICAgIGNvbnN0IHhPZmZzZXQgPSB0aGlzLmJvdW5kcy5taW5YICsgTWF0aC5mbG9vciggKCAoIHRoaXMuYm91bmRzLndpZHRoIC0gcGVyaW1ldGVyU2hhcGUuZ2V0V2lkdGgoKSApIC8gMiApIC8gdGhpcy51bml0U3F1YXJlTGVuZ3RoICkgKiB0aGlzLnVuaXRTcXVhcmVMZW5ndGg7XG4gICAgICAgIGNvbnN0IHlPZmZzZXQgPSB0aGlzLmJvdW5kcy5taW5ZICsgTWF0aC5mbG9vciggKCAoIHRoaXMuYm91bmRzLmhlaWdodCAtIHBlcmltZXRlclNoYXBlLmdldEhlaWdodCgpICkgLyAyICkgLyB0aGlzLnVuaXRTcXVhcmVMZW5ndGggKSAqIHRoaXMudW5pdFNxdWFyZUxlbmd0aDtcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kU2hhcGVQcm9wZXJ0eS5zZXQoIHBlcmltZXRlclNoYXBlLnRyYW5zbGF0ZWQoIHhPZmZzZXQsIHlPZmZzZXQgKSApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuYmFja2dyb3VuZFNoYXBlUHJvcGVydHkuc2V0KCBwZXJpbWV0ZXJTaGFwZSApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5hcmVhQnVpbGRlci5yZWdpc3RlciggJ1NoYXBlUGxhY2VtZW50Qm9hcmQnLCBTaGFwZVBsYWNlbWVudEJvYXJkICk7XG5leHBvcnQgZGVmYXVsdCBTaGFwZVBsYWNlbWVudEJvYXJkOyJdLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJQcm9wZXJ0eSIsIkJvdW5kczIiLCJVdGlscyIsIlZlY3RvcjIiLCJTaGFwZSIsIkZyYWN0aW9uIiwiQ29sb3IiLCJhcmVhQnVpbGRlciIsIkFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzIiwiUGVyaW1ldGVyU2hhcGUiLCJNT1ZFTUVOVF9WRUNUT1JTIiwidXAiLCJkb3duIiwibGVmdCIsInJpZ2h0IiwiU0NBTl9BUkVBX01PVkVNRU5UX0ZVTkNUSU9OUyIsInByZXZpb3VzU3RlcCIsIlNoYXBlUGxhY2VtZW50Qm9hcmQiLCJzaGFwZU92ZXJsYXBzQm9hcmQiLCJzaGFwZSIsInNoYXBlUG9zaXRpb24iLCJwb3NpdGlvblByb3BlcnR5IiwiZ2V0Iiwic2hhcGVCb3VuZHMiLCJ4IiwieSIsImJvdW5kcyIsImdldFdpZHRoIiwiZ2V0SGVpZ2h0IiwiaW50ZXJzZWN0c0JvdW5kcyIsInBsYWNlU2hhcGUiLCJtb3ZhYmxlU2hhcGUiLCJhc3NlcnQiLCJ1c2VyQ29udHJvbGxlZFByb3BlcnR5IiwiY29sb3JIYW5kbGVkIiwiY29sb3IiLCJlcXVhbHMiLCJpbnZpc2libGVXaGVuU3RpbGxQcm9wZXJ0eSIsInNldCIsImZvcm1Db21wb3NpdGVQcm9wZXJ0eSIsInBsYWNlbWVudFBvc2l0aW9uIiwic3Vycm91bmRpbmdQb2ludHNMZXZlbCIsIk1hdGgiLCJtYXgiLCJudW1Sb3dzIiwibnVtQ29sdW1ucyIsInN1cnJvdW5kaW5nUG9pbnRzIiwiZ2V0T3V0ZXJTdXJyb3VuZGluZ1BvaW50cyIsInNvcnQiLCJwMSIsInAyIiwiZGlzdGFuY2UiLCJwb2ludEluZGV4IiwibGVuZ3RoIiwiaXNWYWxpZFRvUGxhY2UiLCJhZGRJbmNvbWluZ1NoYXBlIiwiYWRkU2hhcGVEaXJlY3RseVRvQ2VsbCIsImNlbGxDb2x1bW4iLCJjZWxsUm93IiwiY2VsbFRvTW9kZWxDb29yZHMiLCJnZXRQcm9wb3J0aW9uT2ZDb2xvciIsImNvbXBhcmVDb2xvciIsInRvQ29sb3IiLCJ0b3RhbEFyZWEiLCJhcmVhT2ZTcGVjaWZpZWRDb2xvciIsInJlc2lkZW50U2hhcGVzIiwiZm9yRWFjaCIsInJlc2lkZW50U2hhcGUiLCJhcmVhT2ZTaGFwZSIsIndpZHRoIiwiaGVpZ2h0IiwidW5pdFNxdWFyZUxlbmd0aCIsInByb3BvcnRpb24iLCJyZWR1Y2UiLCJhZGRSZXNpZGVudFNoYXBlIiwicmVsZWFzZU9ycGhhbnMiLCJkZXN0aW5hdGlvbiIsImlzUmVzaWRlbnRTaGFwZSIsInB1c2giLCJ1cGRhdGVDZWxsT2NjdXBhdGlvbiIsInJlbGVhc2VBbnlPcnBoYW5zIiwidXBkYXRlQWxsIiwicmVtb3ZlUmVzaWRlbnRTaGFwZSIsInNlbGYiLCJyZW1vdmUiLCJsYXp5TGluayIsInJlbGVhc2VPcnBoYW5zSWZEcm9wcGVkT2ZCb2FyZCIsInVzZXJDb250cm9sbGVkIiwidW5saW5rIiwic2V0RGVzdGluYXRpb24iLCJhbmltYXRpbmdQcm9wZXJ0eSIsImluY29taW5nU2hhcGVzIiwiYW5pbWF0aW9uQ29tcGxldGVMaXN0ZW5lciIsImFuaW1hdGluZyIsInNwbGljZSIsImluZGV4T2YiLCJ1cGRhdGVzU3VzcGVuZGVkIiwiYWRkUmVtb3ZhbExpc3RlbmVyIiwidGFnTGlzdGVuZXIiLCJsaXN0ZW5lciIsInNoYXBlUGxhY2VtZW50Qm9hcmQiLCJsaXN0ZW5lclRhZ01hdGNoZXMiLCJyZW1vdmVUYWdnZWRPYnNlcnZlcnMiLCJwcm9wZXJ0eSIsInRhZ2dlZE9ic2VydmVycyIsImZvckVhY2hMaXN0ZW5lciIsIm9ic2VydmVyIiwidGFnZ2VkT2JzZXJ2ZXIiLCJnZXRDZWxsIiwiY29sdW1uIiwicm93IiwiY2VsbHMiLCJnZXRDZWxsT2NjdXBhbnQiLCJjZWxsIiwib2NjdXBpZWRCeSIsIm9wZXJhdGlvbiIsInhJbmRleCIsInJvdW5kU3ltbWV0cmljIiwibWluWCIsInlJbmRleCIsIm1pblkiLCJ1cGRhdGVBcmVhQW5kVG90YWxQZXJpbWV0ZXIiLCJjb21wb3NpdGVTaGFwZVByb3BlcnR5IiwiZXh0ZXJpb3JQZXJpbWV0ZXJzIiwidG90YWxQZXJpbWV0ZXIiLCJleHRlcmlvclBlcmltZXRlciIsImludGVyaW9yUGVyaW1ldGVycyIsImludGVyaW9yUGVyaW1ldGVyIiwiYXJlYUFuZFBlcmltZXRlclByb3BlcnR5IiwiYXJlYSIsInBlcmltZXRlciIsIklOVkFMSURfVkFMVUUiLCJpc0NlbGxPY2N1cGllZCIsImlzQ2VsbE9jY3VwaWVkTm93T3JTb29uIiwiaSIsInRhcmdldENlbGwiLCJtb2RlbFRvQ2VsbFZlY3RvciIsIm5vcm1hbGl6ZWRXaWR0aCIsIm5vcm1hbGl6ZWRIZWlnaHQiLCJwb2ludCIsImxldmVsc1JlbW92ZWQiLCJub3JtYWxpemVkUG9pbnRzIiwibm9ybWFsaXplZFN0YXJ0aW5nUG9pbnQiLCJmbG9vciIsInNxdWFyZVNpemUiLCJvdXRlclN1cnJvdW5kaW5nUG9pbnRzIiwicCIsImNlbGxUb01vZGVsVmVjdG9yIiwicG9zaXRpb24iLCJub3JtYWxpemVkUG9zaXRpb24iLCJyZWxlYXNlQWxsU2hhcGVzIiwicmVsZWFzZU1vZGUiLCJzaGFwZXNUb1JlbGVhc2UiLCJjbGVhciIsInJldHVyblRvT3JpZ2luIiwiZmFkZUF3YXkiLCJFcnJvciIsImluY2x1ZGVzIiwicmVsZWFzZVNoYXBlIiwiY29udGFpbnMiLCJ2IiwibW9kZWxUb0NlbGxDb29yZHMiLCJjcmVhdGVTaGFwZUZyb21QZXJpbWV0ZXJQb2ludHMiLCJwZXJpbWV0ZXJQb2ludHMiLCJwZXJpbWV0ZXJTaGFwZSIsIm1vdmVUb1BvaW50IiwibGluZVRvUG9pbnQiLCJjbG9zZSIsImNyZWF0ZVNoYXBlRnJvbVBlcmltZXRlckxpc3QiLCJwZXJpbWV0ZXJzIiwic2NhblBlcmltZXRlciIsIndpbmRvd1N0YXJ0Iiwic2NhbldpbmRvdyIsImNvcHkiLCJzY2FuQ29tcGxldGUiLCJwcmV2aW91c01vdmVtZW50VmVjdG9yIiwidXBMZWZ0T2NjdXBpZWQiLCJ1cFJpZ2h0T2NjdXBpZWQiLCJkb3duTGVmdE9jY3VwaWVkIiwiZG93blJpZ2h0T2NjdXBpZWQiLCJtYXJjaGluZ1NxdWFyZXNTdGF0ZSIsIm1vdmVtZW50VmVjdG9yIiwiYWRkIiwidXBkYXRlUGVyaW1ldGVycyIsInJlc2V0IiwiY29udGlndW91c0NlbGxHcm91cHMiLCJpZGVudGlmeUNvbnRpZ3VvdXNDZWxsR3JvdXBzIiwiY2VsbEdyb3VwIiwidG9wTGVmdENlbGwiLCJ0b3BMZWZ0Q2VsbE9mR3JvdXAiLCJvdXRsaW5lU2hhcGUiLCJlbmNsb3NlZFNwYWNlcyIsImNlbGxDZW50ZXJJbk1vZGVsIiwiYWRkWFkiLCJjb250YWluc1BvaW50IiwidG9wTGVmdFNwYWNlIiwiZW5jbG9zZWRQZXJpbWV0ZXJQb2ludHMiLCJsZWZ0b3ZlckVtcHR5U3BhY2VzIiwiZW5jbG9zZWRTcGFjZSIsInBvc2l0aW9uUG9pbnQiLCJjZW50ZXJQb2ludCIsInBsdXNYWSIsInBlcmltZXRlckxpc3RzRXF1YWwiLCJmaWxsQ29sb3IiLCJjb21wb3NpdGVTaGFwZUZpbGxDb2xvciIsImVkZ2VDb2xvciIsImNvbXBvc2l0ZVNoYXBlRWRnZUNvbG9yIiwicGVyaW1ldGVyUG9pbnRzRXF1YWwiLCJwZXJpbWV0ZXIxIiwicGVyaW1ldGVyMiIsIkFycmF5IiwiaXNBcnJheSIsImV2ZXJ5IiwiaW5kZXgiLCJwZXJpbWV0ZXJMaXN0MSIsInBlcmltZXRlckxpc3QyIiwiaWRlbnRpZnlBZGphY2VudE9jY3VwaWVkQ2VsbHMiLCJzdGFydENlbGwiLCJjYXRhbG9nZWQiLCJPYmplY3QiLCJrZXlzIiwia2V5IiwiYWRqYWNlbnRDZWxsIiwidW5ncm91cGVkT2NjdXBpZWRDZWxscyIsIl8iLCJkaWZmZXJlbmNlIiwiaW5kZXhPZlJldGFpbmVkR3JvdXAiLCJncm91cCIsImdyb3VwSW5kZXgiLCJyZXBsYWNlU2hhcGVXaXRoVW5pdFNxdWFyZXMiLCJvcmlnaW5hbFNoYXBlIiwidW5pdFNxdWFyZXMiLCJtb3ZhYmxlVW5pdFNxdWFyZSIsInJlbW92YWxMaXN0ZW5lciIsInNldENvbXBvc2l0ZVNoYXBlQ29sb3JTY2hlbWUiLCJzdXNwZW5kVXBkYXRlc0ZvckJsb2NrQWRkIiwic2V0QmFja2dyb3VuZFNoYXBlIiwiY2VudGVyZWQiLCJiYWNrZ3JvdW5kU2hhcGVQcm9wZXJ0eSIsInhPZmZzZXQiLCJ5T2Zmc2V0IiwidHJhbnNsYXRlZCIsImNvbnN0cnVjdG9yIiwic2l6ZSIsInNob3dHcmlkUHJvcGVydHkiLCJzaG93RGltZW5zaW9uc1Byb3BlcnR5IiwiR1JFRU5JU0hfQ09MT1IiLCJjb2xvclV0aWxzRGFya2VyIiwiUEVSSU1FVEVSX0RBUktFTl9GQUNUT1IiLCJzaG93R3JpZE9uQmFja2dyb3VuZFNoYXBlUHJvcGVydHkiLCJj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