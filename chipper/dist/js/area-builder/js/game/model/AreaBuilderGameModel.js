// Copyright 2014-2022, University of Colorado Boulder
/**
 * Game model that works in conjunction with the QuizGameModel to add the elements that are specific to the Area
 * Builder game.  QuizGameModel handles things that are general to PhET's quiz style games, such as state transitions,
 * and this model handles the behavior that is specific to this simulation's game, such as how correct answers are
 * presented.  This approach is experimental, and this simulation (Area Builder) is the first time that it is being
 * done, so there may be significant room for improvement.
 *
 * @author John Blanco
 */ import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Color } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../../common/AreaBuilderSharedConstants.js';
import MovableShape from '../../common/model/MovableShape.js';
import ShapePlacementBoard from '../../common/model/ShapePlacementBoard.js';
import BuildSpec from './BuildSpec.js';
// constants
const UNIT_SQUARE_LENGTH = AreaBuilderSharedConstants.UNIT_SQUARE_LENGTH; // In screen coords, which are roughly pixels
const BOARD_SIZE = new Dimension2(UNIT_SQUARE_LENGTH * 12, UNIT_SQUARE_LENGTH * 8);
const UNIT_SQUARE_SHAPE = Shape.rect(0, 0, UNIT_SQUARE_LENGTH, UNIT_SQUARE_LENGTH).makeImmutable();
let AreaBuilderGameModel = class AreaBuilderGameModel {
    // @private - replace a composite shape with unit squares
    replaceShapeWithUnitSquares(movableShape) {
        assert && assert(movableShape.shape.bounds.width > UNIT_SQUARE_LENGTH || movableShape.shape.bounds.height > UNIT_SQUARE_LENGTH, 'This method should not be called for non-composite shapes');
        // break the shape into the constituent squares
        const constituentShapes = movableShape.decomposeIntoSquares(UNIT_SQUARE_LENGTH);
        // add the newly created squares to this model
        constituentShapes.forEach((shape)=>{
            this.addUserCreatedMovableShape(shape);
        });
        // replace the shape on the shape placement board with unit squares
        this.shapePlacementBoard.replaceShapeWithUnitSquares(movableShape, constituentShapes);
        // remove the original composite shape from this model
        this.movableShapes.remove(movableShape);
    }
    /**
   * Function for adding new movable shapes to this model when the user is creating them, generally by clicking on
   * some sort of creator node.
   * @param {MovableShape} movableShape
   * @public
   */ addUserCreatedMovableShape(movableShape) {
        const self = this;
        this.movableShapes.push(movableShape);
        movableShape.userControlledProperty.lazyLink((userControlled)=>{
            if (!userControlled) {
                if (this.shapePlacementBoard.placeShape(movableShape)) {
                    if (movableShape.shape.bounds.width > UNIT_SQUARE_LENGTH || movableShape.shape.bounds.height > UNIT_SQUARE_LENGTH) {
                        // This is a composite shape, meaning that it is made up of more than one unit square.  Rather than
                        // tracking these, the design team decided that they should decompose into individual unit squares once
                        // they have been placed.
                        if (movableShape.animatingProperty.get()) {
                            movableShape.animatingProperty.lazyLink(function decomposeCompositeShape(animating) {
                                if (!animating) {
                                    // unhook this function
                                    movableShape.animatingProperty.unlink(decomposeCompositeShape);
                                    // replace this composite shape with individual unit squares
                                    if (self.shapePlacementBoard.isResidentShape(movableShape)) {
                                        self.replaceShapeWithUnitSquares(movableShape);
                                    }
                                }
                            });
                        } else {
                            // decompose the shape now, since it is already on the board
                            this.replaceShapeWithUnitSquares(movableShape);
                        }
                    }
                } else {
                    // Shape did not go onto board, possibly because it's not over the board or the board is full.  Send it
                    // home.
                    movableShape.returnToOrigin(true);
                }
            }
        });
        // Remove the shape if it returns to its origin, since at that point it has essentially been 'put away'.
        movableShape.returnedToOriginEmitter.addListener(()=>{
            if (!movableShape.userControlledProperty.get()) {
                this.movableShapes.remove(movableShape);
            }
        });
        // Another point at which the shape is removed is if it fades away.
        movableShape.fadeProportionProperty.link(function fadeHandler(fadeProportion) {
            if (fadeProportion === 1) {
                self.movableShapes.remove(movableShape);
                movableShape.fadeProportionProperty.unlink(fadeHandler);
            }
        });
    }
    /**
   * Add a unit square directly to the shape placement board in the specified cell position (as opposed to model
   * position).  This was created to enable solutions to game challenges to be shown, but may have other uses.
   * @param cellColumn
   * @param cellRow
   * @param color
   * @private
   */ addUnitSquareDirectlyToBoard(cellColumn, cellRow, color) {
        const shape = new MovableShape(UNIT_SQUARE_SHAPE, color, this.solutionShapeOrigin);
        this.movableShapes.push(shape);
        // Remove this shape when it gets returned to its original position.
        shape.returnedToOriginEmitter.addListener(()=>{
            if (!shape.userControlledProperty.get()) {
                this.movableShapes.remove(shape);
            }
        });
        this.shapePlacementBoard.addShapeDirectlyToCell(cellColumn, cellRow, shape);
    }
    // @public, Clear the placement board of all shapes placed on it by the user
    clearShapePlacementBoard() {
        this.shapePlacementBoard.releaseAllShapes('jumpHome');
    }
    // @public?
    startLevel() {
        // Clear the 'show dimensions' and 'show grid' flag at the beginning of each new level.
        this.shapePlacementBoard.showDimensionsProperty.value = false;
        this.shapePlacementBoard.showGridProperty.value = false;
    }
    // @public
    displayCorrectAnswer(challenge) {
        if (challenge.buildSpec) {
            // clear whatever the user had added
            this.clearShapePlacementBoard();
            // suspend updates of the shape placement board so that the answer can be added efficiently
            this.shapePlacementBoard.suspendUpdatesForBlockAdd();
            // Add the shapes that comprise the solution.
            assert && assert(challenge.exampleBuildItSolution !== null, 'Error: Challenge does not contain an example solution.');
            challenge.exampleBuildItSolution.forEach((shapePlacementSpec)=>{
                this.addUnitSquareDirectlyToBoard(shapePlacementSpec.cellColumn, shapePlacementSpec.cellRow, shapePlacementSpec.color);
            });
        } else if (challenge.checkSpec === 'areaEntered') {
            // For 'find the area' challenges, we turn on the grid for the background shape when displaying the answer.
            this.shapePlacementBoard.showGridOnBackgroundShape = true;
        }
    }
    // @public
    checkAnswer(challenge) {
        let answerIsCorrect = false;
        let userBuiltSpec;
        switch(challenge.checkSpec){
            case 'areaEntered':
                answerIsCorrect = this.areaGuess === challenge.backgroundShape.unitArea;
                break;
            case 'areaConstructed':
                answerIsCorrect = challenge.buildSpec.area === this.shapePlacementBoard.areaAndPerimeterProperty.get().area;
                break;
            case 'areaAndPerimeterConstructed':
                answerIsCorrect = challenge.buildSpec.area === this.shapePlacementBoard.areaAndPerimeterProperty.get().area && challenge.buildSpec.perimeter === this.shapePlacementBoard.areaAndPerimeterProperty.get().perimeter;
                break;
            case 'areaAndProportionConstructed':
                userBuiltSpec = new BuildSpec(this.shapePlacementBoard.areaAndPerimeterProperty.get().area, null, {
                    color1: challenge.buildSpec.proportions.color1,
                    color2: challenge.buildSpec.proportions.color2,
                    color1Proportion: this.getProportionOfColor(challenge.buildSpec.proportions.color1)
                });
                answerIsCorrect = userBuiltSpec.equals(challenge.buildSpec);
                break;
            case 'areaPerimeterAndProportionConstructed':
                userBuiltSpec = new BuildSpec(this.shapePlacementBoard.areaAndPerimeterProperty.get().area, this.shapePlacementBoard.areaAndPerimeterProperty.get().perimeter, {
                    color1: challenge.buildSpec.proportions.color1,
                    color2: challenge.buildSpec.proportions.color2,
                    color1Proportion: this.getProportionOfColor(challenge.buildSpec.proportions.color1)
                });
                answerIsCorrect = userBuiltSpec.equals(challenge.buildSpec);
                break;
            default:
                assert && assert(false, 'Unhandled check spec');
                answerIsCorrect = false;
                break;
        }
        return answerIsCorrect;
    }
    // @public, Called from main model so that this model can do what it needs to in order to give the user another chance.
    tryAgain() {
    // Nothing needs to be reset in this model to allow the user to try again.
    }
    /**
   * Returns the proportion of the shapes on the board that are the same color as the provided value.
   * @param color
   * @public
   */ getProportionOfColor(color) {
        // Pass through to the shape placement board.
        return this.shapePlacementBoard.getProportionOfColor(color);
    }
    /**
   * Set up anything in the model that is needed for the specified challenge.
   * @param challenge
   * @public
   */ setChallenge(challenge) {
        if (challenge) {
            assert && assert(typeof (challenge.backgroundShape !== 'undefined'));
            // Set the background shape.
            this.shapePlacementBoard.setBackgroundShape(challenge.backgroundShape, true);
            this.shapePlacementBoard.showGridOnBackgroundShape = false; // Initially off, may be turned on when showing solution.
            // Set the board to either form composite shapes or allow free placement.
            this.shapePlacementBoard.formCompositeProperty.set(challenge.backgroundShape === null);
            // Set the color scheme of the composite so that the placed squares can be seen if needed.
            if (challenge.buildSpec && this.shapePlacementBoard.formCompositeProperty.get() && challenge.userShapes) {
                // Make the perimeter color be a darker version of the first user shape.
                const perimeterColor = Color.toColor(challenge.userShapes[0].color).colorUtilsDarker(AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR);
                let fillColor;
                if (challenge.buildSpec.proportions) {
                    // The composite shape needs to be see through so that the original shapes can be seen.  This allows
                    // multiple colors to be depicted, but generally doesn't look quite as good.
                    fillColor = null;
                } else {
                    // The fill color should be the same as the user shapes.  Assume all user shapes are the same color.
                    fillColor = challenge.userShapes[0].color;
                }
                this.shapePlacementBoard.setCompositeShapeColorScheme(fillColor, perimeterColor);
            }
        }
    }
    /**
   * @param {number} dt
   * @public
   */ step(dt) {
        this.movableShapes.forEach((movableShape)=>{
            movableShape.step(dt);
        });
    }
    /**
   * resets all model elements
   * @public
   */ reset() {
        this.shapePlacementBoard.releaseAllShapes('jumpHome');
        this.movableShapes.clear();
    }
    constructor(){
        this.showGridOnBoardProperty = new Property(false);
        this.showDimensionsProperty = new Property(false);
        // @public Value where the user's submission of area is stored.
        this.areaGuess = 0;
        // @public The shape board where the user will build and/or evaluate shapes.
        this.shapePlacementBoard = new ShapePlacementBoard(BOARD_SIZE, UNIT_SQUARE_LENGTH, new Vector2((AreaBuilderSharedConstants.LAYOUT_BOUNDS.width - BOARD_SIZE.width) * 0.55, 85), '*', this.showGridOnBoardProperty, this.showDimensionsProperty);
        // @public {ObservableArrayDef.<MovableShape>} - list of movable shapes that are added by the user
        this.movableShapes = createObservableArray();
        // @private The position from which squares that animate onto the board to show a solution should emerge.  The
        // offset is empirically determined to be somewhere in the carousel.
        this.solutionShapeOrigin = new Vector2(this.shapePlacementBoard.bounds.left + 30, this.shapePlacementBoard.bounds.maxY + 30);
    }
};
// Size of the shape board in terms of the unit length, needed by the challenge factory.
AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH = BOARD_SIZE.width / UNIT_SQUARE_LENGTH;
AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT = BOARD_SIZE.height / UNIT_SQUARE_LENGTH;
AreaBuilderGameModel.UNIT_SQUARE_LENGTH = UNIT_SQUARE_LENGTH;
areaBuilder.register('AreaBuilderGameModel', AreaBuilderGameModel);
export default AreaBuilderGameModel;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9nYW1lL21vZGVsL0FyZWFCdWlsZGVyR2FtZU1vZGVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEdhbWUgbW9kZWwgdGhhdCB3b3JrcyBpbiBjb25qdW5jdGlvbiB3aXRoIHRoZSBRdWl6R2FtZU1vZGVsIHRvIGFkZCB0aGUgZWxlbWVudHMgdGhhdCBhcmUgc3BlY2lmaWMgdG8gdGhlIEFyZWFcbiAqIEJ1aWxkZXIgZ2FtZS4gIFF1aXpHYW1lTW9kZWwgaGFuZGxlcyB0aGluZ3MgdGhhdCBhcmUgZ2VuZXJhbCB0byBQaEVUJ3MgcXVpeiBzdHlsZSBnYW1lcywgc3VjaCBhcyBzdGF0ZSB0cmFuc2l0aW9ucyxcbiAqIGFuZCB0aGlzIG1vZGVsIGhhbmRsZXMgdGhlIGJlaGF2aW9yIHRoYXQgaXMgc3BlY2lmaWMgdG8gdGhpcyBzaW11bGF0aW9uJ3MgZ2FtZSwgc3VjaCBhcyBob3cgY29ycmVjdCBhbnN3ZXJzIGFyZVxuICogcHJlc2VudGVkLiAgVGhpcyBhcHByb2FjaCBpcyBleHBlcmltZW50YWwsIGFuZCB0aGlzIHNpbXVsYXRpb24gKEFyZWEgQnVpbGRlcikgaXMgdGhlIGZpcnN0IHRpbWUgdGhhdCBpdCBpcyBiZWluZ1xuICogZG9uZSwgc28gdGhlcmUgbWF5IGJlIHNpZ25pZmljYW50IHJvb20gZm9yIGltcHJvdmVtZW50LlxuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cbiAqL1xuXG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBhcmVhQnVpbGRlciBmcm9tICcuLi8uLi9hcmVhQnVpbGRlci5qcyc7XG5pbXBvcnQgQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0FyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLmpzJztcbmltcG9ydCBNb3ZhYmxlU2hhcGUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL01vdmFibGVTaGFwZS5qcyc7XG5pbXBvcnQgU2hhcGVQbGFjZW1lbnRCb2FyZCBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvU2hhcGVQbGFjZW1lbnRCb2FyZC5qcyc7XG5pbXBvcnQgQnVpbGRTcGVjIGZyb20gJy4vQnVpbGRTcGVjLmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBVTklUX1NRVUFSRV9MRU5HVEggPSBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5VTklUX1NRVUFSRV9MRU5HVEg7IC8vIEluIHNjcmVlbiBjb29yZHMsIHdoaWNoIGFyZSByb3VnaGx5IHBpeGVsc1xuY29uc3QgQk9BUkRfU0laRSA9IG5ldyBEaW1lbnNpb24yKCBVTklUX1NRVUFSRV9MRU5HVEggKiAxMiwgVU5JVF9TUVVBUkVfTEVOR1RIICogOCApO1xuY29uc3QgVU5JVF9TUVVBUkVfU0hBUEUgPSBTaGFwZS5yZWN0KCAwLCAwLCBVTklUX1NRVUFSRV9MRU5HVEgsIFVOSVRfU1FVQVJFX0xFTkdUSCApLm1ha2VJbW11dGFibGUoKTtcblxuY2xhc3MgQXJlYUJ1aWxkZXJHYW1lTW9kZWwge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgdGhpcy5zaG93R3JpZE9uQm9hcmRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggZmFsc2UgKTtcbiAgICB0aGlzLnNob3dEaW1lbnNpb25zUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGZhbHNlICk7XG5cbiAgICAvLyBAcHVibGljIFZhbHVlIHdoZXJlIHRoZSB1c2VyJ3Mgc3VibWlzc2lvbiBvZiBhcmVhIGlzIHN0b3JlZC5cbiAgICB0aGlzLmFyZWFHdWVzcyA9IDA7XG5cbiAgICAvLyBAcHVibGljIFRoZSBzaGFwZSBib2FyZCB3aGVyZSB0aGUgdXNlciB3aWxsIGJ1aWxkIGFuZC9vciBldmFsdWF0ZSBzaGFwZXMuXG4gICAgdGhpcy5zaGFwZVBsYWNlbWVudEJvYXJkID0gbmV3IFNoYXBlUGxhY2VtZW50Qm9hcmQoXG4gICAgICBCT0FSRF9TSVpFLFxuICAgICAgVU5JVF9TUVVBUkVfTEVOR1RILFxuICAgICAgbmV3IFZlY3RvcjIoICggQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuTEFZT1VUX0JPVU5EUy53aWR0aCAtIEJPQVJEX1NJWkUud2lkdGggKSAqIDAuNTUsIDg1ICksIC8vIFBvc2l0aW9uIGVtcGlyaWNhbGx5IGRldGVybWluZWRcbiAgICAgICcqJywgLy8gQWxsb3cgYW55IGNvbG9yIHNoYXBlIHRvIGJlIHBsYWNlZCBvbiB0aGUgYm9hcmRcbiAgICAgIHRoaXMuc2hvd0dyaWRPbkJvYXJkUHJvcGVydHksXG4gICAgICB0aGlzLnNob3dEaW1lbnNpb25zUHJvcGVydHlcbiAgICApO1xuXG4gICAgLy8gQHB1YmxpYyB7T2JzZXJ2YWJsZUFycmF5RGVmLjxNb3ZhYmxlU2hhcGU+fSAtIGxpc3Qgb2YgbW92YWJsZSBzaGFwZXMgdGhhdCBhcmUgYWRkZWQgYnkgdGhlIHVzZXJcbiAgICB0aGlzLm1vdmFibGVTaGFwZXMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoKTtcblxuICAgIC8vIEBwcml2YXRlIFRoZSBwb3NpdGlvbiBmcm9tIHdoaWNoIHNxdWFyZXMgdGhhdCBhbmltYXRlIG9udG8gdGhlIGJvYXJkIHRvIHNob3cgYSBzb2x1dGlvbiBzaG91bGQgZW1lcmdlLiAgVGhlXG4gICAgLy8gb2Zmc2V0IGlzIGVtcGlyaWNhbGx5IGRldGVybWluZWQgdG8gYmUgc29tZXdoZXJlIGluIHRoZSBjYXJvdXNlbC5cbiAgICB0aGlzLnNvbHV0aW9uU2hhcGVPcmlnaW4gPSBuZXcgVmVjdG9yMiggdGhpcy5zaGFwZVBsYWNlbWVudEJvYXJkLmJvdW5kcy5sZWZ0ICsgMzAsIHRoaXMuc2hhcGVQbGFjZW1lbnRCb2FyZC5ib3VuZHMubWF4WSArIDMwICk7XG4gIH1cblxuXG4gIC8vIEBwcml2YXRlIC0gcmVwbGFjZSBhIGNvbXBvc2l0ZSBzaGFwZSB3aXRoIHVuaXQgc3F1YXJlc1xuICByZXBsYWNlU2hhcGVXaXRoVW5pdFNxdWFyZXMoIG1vdmFibGVTaGFwZSApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KFxuICAgICAgbW92YWJsZVNoYXBlLnNoYXBlLmJvdW5kcy53aWR0aCA+IFVOSVRfU1FVQVJFX0xFTkdUSCB8fCBtb3ZhYmxlU2hhcGUuc2hhcGUuYm91bmRzLmhlaWdodCA+IFVOSVRfU1FVQVJFX0xFTkdUSCxcbiAgICAgICdUaGlzIG1ldGhvZCBzaG91bGQgbm90IGJlIGNhbGxlZCBmb3Igbm9uLWNvbXBvc2l0ZSBzaGFwZXMnXG4gICAgKTtcblxuICAgIC8vIGJyZWFrIHRoZSBzaGFwZSBpbnRvIHRoZSBjb25zdGl0dWVudCBzcXVhcmVzXG4gICAgY29uc3QgY29uc3RpdHVlbnRTaGFwZXMgPSBtb3ZhYmxlU2hhcGUuZGVjb21wb3NlSW50b1NxdWFyZXMoIFVOSVRfU1FVQVJFX0xFTkdUSCApO1xuXG4gICAgLy8gYWRkIHRoZSBuZXdseSBjcmVhdGVkIHNxdWFyZXMgdG8gdGhpcyBtb2RlbFxuICAgIGNvbnN0aXR1ZW50U2hhcGVzLmZvckVhY2goIHNoYXBlID0+IHsgdGhpcy5hZGRVc2VyQ3JlYXRlZE1vdmFibGVTaGFwZSggc2hhcGUgKTsgfSApO1xuXG4gICAgLy8gcmVwbGFjZSB0aGUgc2hhcGUgb24gdGhlIHNoYXBlIHBsYWNlbWVudCBib2FyZCB3aXRoIHVuaXQgc3F1YXJlc1xuICAgIHRoaXMuc2hhcGVQbGFjZW1lbnRCb2FyZC5yZXBsYWNlU2hhcGVXaXRoVW5pdFNxdWFyZXMoIG1vdmFibGVTaGFwZSwgY29uc3RpdHVlbnRTaGFwZXMgKTtcblxuICAgIC8vIHJlbW92ZSB0aGUgb3JpZ2luYWwgY29tcG9zaXRlIHNoYXBlIGZyb20gdGhpcyBtb2RlbFxuICAgIHRoaXMubW92YWJsZVNoYXBlcy5yZW1vdmUoIG1vdmFibGVTaGFwZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIGZvciBhZGRpbmcgbmV3IG1vdmFibGUgc2hhcGVzIHRvIHRoaXMgbW9kZWwgd2hlbiB0aGUgdXNlciBpcyBjcmVhdGluZyB0aGVtLCBnZW5lcmFsbHkgYnkgY2xpY2tpbmcgb25cbiAgICogc29tZSBzb3J0IG9mIGNyZWF0b3Igbm9kZS5cbiAgICogQHBhcmFtIHtNb3ZhYmxlU2hhcGV9IG1vdmFibGVTaGFwZVxuICAgKiBAcHVibGljXG4gICAqL1xuICBhZGRVc2VyQ3JlYXRlZE1vdmFibGVTaGFwZSggbW92YWJsZVNoYXBlICkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHRoaXMubW92YWJsZVNoYXBlcy5wdXNoKCBtb3ZhYmxlU2hhcGUgKTtcblxuICAgIG1vdmFibGVTaGFwZS51c2VyQ29udHJvbGxlZFByb3BlcnR5LmxhenlMaW5rKCB1c2VyQ29udHJvbGxlZCA9PiB7XG4gICAgICBpZiAoICF1c2VyQ29udHJvbGxlZCApIHtcbiAgICAgICAgaWYgKCB0aGlzLnNoYXBlUGxhY2VtZW50Qm9hcmQucGxhY2VTaGFwZSggbW92YWJsZVNoYXBlICkgKSB7XG4gICAgICAgICAgaWYgKCBtb3ZhYmxlU2hhcGUuc2hhcGUuYm91bmRzLndpZHRoID4gVU5JVF9TUVVBUkVfTEVOR1RIIHx8IG1vdmFibGVTaGFwZS5zaGFwZS5ib3VuZHMuaGVpZ2h0ID4gVU5JVF9TUVVBUkVfTEVOR1RIICkge1xuXG4gICAgICAgICAgICAvLyBUaGlzIGlzIGEgY29tcG9zaXRlIHNoYXBlLCBtZWFuaW5nIHRoYXQgaXQgaXMgbWFkZSB1cCBvZiBtb3JlIHRoYW4gb25lIHVuaXQgc3F1YXJlLiAgUmF0aGVyIHRoYW5cbiAgICAgICAgICAgIC8vIHRyYWNraW5nIHRoZXNlLCB0aGUgZGVzaWduIHRlYW0gZGVjaWRlZCB0aGF0IHRoZXkgc2hvdWxkIGRlY29tcG9zZSBpbnRvIGluZGl2aWR1YWwgdW5pdCBzcXVhcmVzIG9uY2VcbiAgICAgICAgICAgIC8vIHRoZXkgaGF2ZSBiZWVuIHBsYWNlZC5cbiAgICAgICAgICAgIGlmICggbW92YWJsZVNoYXBlLmFuaW1hdGluZ1Byb3BlcnR5LmdldCgpICkge1xuICAgICAgICAgICAgICBtb3ZhYmxlU2hhcGUuYW5pbWF0aW5nUHJvcGVydHkubGF6eUxpbmsoIGZ1bmN0aW9uIGRlY29tcG9zZUNvbXBvc2l0ZVNoYXBlKCBhbmltYXRpbmcgKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoICFhbmltYXRpbmcgKSB7XG5cbiAgICAgICAgICAgICAgICAgIC8vIHVuaG9vayB0aGlzIGZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgICBtb3ZhYmxlU2hhcGUuYW5pbWF0aW5nUHJvcGVydHkudW5saW5rKCBkZWNvbXBvc2VDb21wb3NpdGVTaGFwZSApO1xuXG4gICAgICAgICAgICAgICAgICAvLyByZXBsYWNlIHRoaXMgY29tcG9zaXRlIHNoYXBlIHdpdGggaW5kaXZpZHVhbCB1bml0IHNxdWFyZXNcbiAgICAgICAgICAgICAgICAgIGlmICggc2VsZi5zaGFwZVBsYWNlbWVudEJvYXJkLmlzUmVzaWRlbnRTaGFwZSggbW92YWJsZVNoYXBlICkgKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYucmVwbGFjZVNoYXBlV2l0aFVuaXRTcXVhcmVzKCBtb3ZhYmxlU2hhcGUgKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgICAgIC8vIGRlY29tcG9zZSB0aGUgc2hhcGUgbm93LCBzaW5jZSBpdCBpcyBhbHJlYWR5IG9uIHRoZSBib2FyZFxuICAgICAgICAgICAgICB0aGlzLnJlcGxhY2VTaGFwZVdpdGhVbml0U3F1YXJlcyggbW92YWJsZVNoYXBlICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIFNoYXBlIGRpZCBub3QgZ28gb250byBib2FyZCwgcG9zc2libHkgYmVjYXVzZSBpdCdzIG5vdCBvdmVyIHRoZSBib2FyZCBvciB0aGUgYm9hcmQgaXMgZnVsbC4gIFNlbmQgaXRcbiAgICAgICAgICAvLyBob21lLlxuICAgICAgICAgIG1vdmFibGVTaGFwZS5yZXR1cm5Ub09yaWdpbiggdHJ1ZSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gUmVtb3ZlIHRoZSBzaGFwZSBpZiBpdCByZXR1cm5zIHRvIGl0cyBvcmlnaW4sIHNpbmNlIGF0IHRoYXQgcG9pbnQgaXQgaGFzIGVzc2VudGlhbGx5IGJlZW4gJ3B1dCBhd2F5Jy5cbiAgICBtb3ZhYmxlU2hhcGUucmV0dXJuZWRUb09yaWdpbkVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcbiAgICAgIGlmICggIW1vdmFibGVTaGFwZS51c2VyQ29udHJvbGxlZFByb3BlcnR5LmdldCgpICkge1xuICAgICAgICB0aGlzLm1vdmFibGVTaGFwZXMucmVtb3ZlKCBtb3ZhYmxlU2hhcGUgKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICAvLyBBbm90aGVyIHBvaW50IGF0IHdoaWNoIHRoZSBzaGFwZSBpcyByZW1vdmVkIGlzIGlmIGl0IGZhZGVzIGF3YXkuXG4gICAgbW92YWJsZVNoYXBlLmZhZGVQcm9wb3J0aW9uUHJvcGVydHkubGluayggZnVuY3Rpb24gZmFkZUhhbmRsZXIoIGZhZGVQcm9wb3J0aW9uICkge1xuICAgICAgaWYgKCBmYWRlUHJvcG9ydGlvbiA9PT0gMSApIHtcbiAgICAgICAgc2VsZi5tb3ZhYmxlU2hhcGVzLnJlbW92ZSggbW92YWJsZVNoYXBlICk7XG4gICAgICAgIG1vdmFibGVTaGFwZS5mYWRlUHJvcG9ydGlvblByb3BlcnR5LnVubGluayggZmFkZUhhbmRsZXIgKTtcbiAgICAgIH1cbiAgICB9ICk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgdW5pdCBzcXVhcmUgZGlyZWN0bHkgdG8gdGhlIHNoYXBlIHBsYWNlbWVudCBib2FyZCBpbiB0aGUgc3BlY2lmaWVkIGNlbGwgcG9zaXRpb24gKGFzIG9wcG9zZWQgdG8gbW9kZWxcbiAgICogcG9zaXRpb24pLiAgVGhpcyB3YXMgY3JlYXRlZCB0byBlbmFibGUgc29sdXRpb25zIHRvIGdhbWUgY2hhbGxlbmdlcyB0byBiZSBzaG93biwgYnV0IG1heSBoYXZlIG90aGVyIHVzZXMuXG4gICAqIEBwYXJhbSBjZWxsQ29sdW1uXG4gICAqIEBwYXJhbSBjZWxsUm93XG4gICAqIEBwYXJhbSBjb2xvclxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYWRkVW5pdFNxdWFyZURpcmVjdGx5VG9Cb2FyZCggY2VsbENvbHVtbiwgY2VsbFJvdywgY29sb3IgKSB7XG4gICAgY29uc3Qgc2hhcGUgPSBuZXcgTW92YWJsZVNoYXBlKCBVTklUX1NRVUFSRV9TSEFQRSwgY29sb3IsIHRoaXMuc29sdXRpb25TaGFwZU9yaWdpbiApO1xuICAgIHRoaXMubW92YWJsZVNoYXBlcy5wdXNoKCBzaGFwZSApO1xuXG4gICAgLy8gUmVtb3ZlIHRoaXMgc2hhcGUgd2hlbiBpdCBnZXRzIHJldHVybmVkIHRvIGl0cyBvcmlnaW5hbCBwb3NpdGlvbi5cbiAgICBzaGFwZS5yZXR1cm5lZFRvT3JpZ2luRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xuICAgICAgaWYgKCAhc2hhcGUudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5nZXQoKSApIHtcbiAgICAgICAgdGhpcy5tb3ZhYmxlU2hhcGVzLnJlbW92ZSggc2hhcGUgKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICB0aGlzLnNoYXBlUGxhY2VtZW50Qm9hcmQuYWRkU2hhcGVEaXJlY3RseVRvQ2VsbCggY2VsbENvbHVtbiwgY2VsbFJvdywgc2hhcGUgKTtcbiAgfVxuXG4gIC8vIEBwdWJsaWMsIENsZWFyIHRoZSBwbGFjZW1lbnQgYm9hcmQgb2YgYWxsIHNoYXBlcyBwbGFjZWQgb24gaXQgYnkgdGhlIHVzZXJcbiAgY2xlYXJTaGFwZVBsYWNlbWVudEJvYXJkKCkge1xuICAgIHRoaXMuc2hhcGVQbGFjZW1lbnRCb2FyZC5yZWxlYXNlQWxsU2hhcGVzKCAnanVtcEhvbWUnICk7XG4gIH1cblxuICAvLyBAcHVibGljP1xuICBzdGFydExldmVsKCkge1xuICAgIC8vIENsZWFyIHRoZSAnc2hvdyBkaW1lbnNpb25zJyBhbmQgJ3Nob3cgZ3JpZCcgZmxhZyBhdCB0aGUgYmVnaW5uaW5nIG9mIGVhY2ggbmV3IGxldmVsLlxuICAgIHRoaXMuc2hhcGVQbGFjZW1lbnRCb2FyZC5zaG93RGltZW5zaW9uc1Byb3BlcnR5LnZhbHVlID0gZmFsc2U7XG4gICAgdGhpcy5zaGFwZVBsYWNlbWVudEJvYXJkLnNob3dHcmlkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcbiAgfVxuXG4gIC8vIEBwdWJsaWNcbiAgZGlzcGxheUNvcnJlY3RBbnN3ZXIoIGNoYWxsZW5nZSApIHtcbiAgICBpZiAoIGNoYWxsZW5nZS5idWlsZFNwZWMgKSB7XG5cbiAgICAgIC8vIGNsZWFyIHdoYXRldmVyIHRoZSB1c2VyIGhhZCBhZGRlZFxuICAgICAgdGhpcy5jbGVhclNoYXBlUGxhY2VtZW50Qm9hcmQoKTtcblxuICAgICAgLy8gc3VzcGVuZCB1cGRhdGVzIG9mIHRoZSBzaGFwZSBwbGFjZW1lbnQgYm9hcmQgc28gdGhhdCB0aGUgYW5zd2VyIGNhbiBiZSBhZGRlZCBlZmZpY2llbnRseVxuICAgICAgdGhpcy5zaGFwZVBsYWNlbWVudEJvYXJkLnN1c3BlbmRVcGRhdGVzRm9yQmxvY2tBZGQoKTtcblxuICAgICAgLy8gQWRkIHRoZSBzaGFwZXMgdGhhdCBjb21wcmlzZSB0aGUgc29sdXRpb24uXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjaGFsbGVuZ2UuZXhhbXBsZUJ1aWxkSXRTb2x1dGlvbiAhPT0gbnVsbCwgJ0Vycm9yOiBDaGFsbGVuZ2UgZG9lcyBub3QgY29udGFpbiBhbiBleGFtcGxlIHNvbHV0aW9uLicgKTtcbiAgICAgIGNoYWxsZW5nZS5leGFtcGxlQnVpbGRJdFNvbHV0aW9uLmZvckVhY2goIHNoYXBlUGxhY2VtZW50U3BlYyA9PiB7XG4gICAgICAgIHRoaXMuYWRkVW5pdFNxdWFyZURpcmVjdGx5VG9Cb2FyZChcbiAgICAgICAgICBzaGFwZVBsYWNlbWVudFNwZWMuY2VsbENvbHVtbixcbiAgICAgICAgICBzaGFwZVBsYWNlbWVudFNwZWMuY2VsbFJvdyxcbiAgICAgICAgICBzaGFwZVBsYWNlbWVudFNwZWMuY29sb3JcbiAgICAgICAgKTtcbiAgICAgIH0gKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIGNoYWxsZW5nZS5jaGVja1NwZWMgPT09ICdhcmVhRW50ZXJlZCcgKSB7XG5cbiAgICAgIC8vIEZvciAnZmluZCB0aGUgYXJlYScgY2hhbGxlbmdlcywgd2UgdHVybiBvbiB0aGUgZ3JpZCBmb3IgdGhlIGJhY2tncm91bmQgc2hhcGUgd2hlbiBkaXNwbGF5aW5nIHRoZSBhbnN3ZXIuXG4gICAgICB0aGlzLnNoYXBlUGxhY2VtZW50Qm9hcmQuc2hvd0dyaWRPbkJhY2tncm91bmRTaGFwZSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLy8gQHB1YmxpY1xuICBjaGVja0Fuc3dlciggY2hhbGxlbmdlICkge1xuXG4gICAgbGV0IGFuc3dlcklzQ29ycmVjdCA9IGZhbHNlO1xuICAgIGxldCB1c2VyQnVpbHRTcGVjO1xuICAgIHN3aXRjaCggY2hhbGxlbmdlLmNoZWNrU3BlYyApIHtcblxuICAgICAgY2FzZSAnYXJlYUVudGVyZWQnOlxuICAgICAgICBhbnN3ZXJJc0NvcnJlY3QgPSB0aGlzLmFyZWFHdWVzcyA9PT0gY2hhbGxlbmdlLmJhY2tncm91bmRTaGFwZS51bml0QXJlYTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2FyZWFDb25zdHJ1Y3RlZCc6XG4gICAgICAgIGFuc3dlcklzQ29ycmVjdCA9IGNoYWxsZW5nZS5idWlsZFNwZWMuYXJlYSA9PT0gdGhpcy5zaGFwZVBsYWNlbWVudEJvYXJkLmFyZWFBbmRQZXJpbWV0ZXJQcm9wZXJ0eS5nZXQoKS5hcmVhO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnYXJlYUFuZFBlcmltZXRlckNvbnN0cnVjdGVkJzpcbiAgICAgICAgYW5zd2VySXNDb3JyZWN0ID0gY2hhbGxlbmdlLmJ1aWxkU3BlYy5hcmVhID09PSB0aGlzLnNoYXBlUGxhY2VtZW50Qm9hcmQuYXJlYUFuZFBlcmltZXRlclByb3BlcnR5LmdldCgpLmFyZWEgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbGxlbmdlLmJ1aWxkU3BlYy5wZXJpbWV0ZXIgPT09IHRoaXMuc2hhcGVQbGFjZW1lbnRCb2FyZC5hcmVhQW5kUGVyaW1ldGVyUHJvcGVydHkuZ2V0KCkucGVyaW1ldGVyO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnYXJlYUFuZFByb3BvcnRpb25Db25zdHJ1Y3RlZCc6XG4gICAgICAgIHVzZXJCdWlsdFNwZWMgPSBuZXcgQnVpbGRTcGVjKFxuICAgICAgICAgIHRoaXMuc2hhcGVQbGFjZW1lbnRCb2FyZC5hcmVhQW5kUGVyaW1ldGVyUHJvcGVydHkuZ2V0KCkuYXJlYSxcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvbG9yMTogY2hhbGxlbmdlLmJ1aWxkU3BlYy5wcm9wb3J0aW9ucy5jb2xvcjEsXG4gICAgICAgICAgICBjb2xvcjI6IGNoYWxsZW5nZS5idWlsZFNwZWMucHJvcG9ydGlvbnMuY29sb3IyLFxuICAgICAgICAgICAgY29sb3IxUHJvcG9ydGlvbjogdGhpcy5nZXRQcm9wb3J0aW9uT2ZDb2xvciggY2hhbGxlbmdlLmJ1aWxkU3BlYy5wcm9wb3J0aW9ucy5jb2xvcjEgKVxuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgYW5zd2VySXNDb3JyZWN0ID0gdXNlckJ1aWx0U3BlYy5lcXVhbHMoIGNoYWxsZW5nZS5idWlsZFNwZWMgKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2FyZWFQZXJpbWV0ZXJBbmRQcm9wb3J0aW9uQ29uc3RydWN0ZWQnOlxuICAgICAgICB1c2VyQnVpbHRTcGVjID0gbmV3IEJ1aWxkU3BlYyhcbiAgICAgICAgICB0aGlzLnNoYXBlUGxhY2VtZW50Qm9hcmQuYXJlYUFuZFBlcmltZXRlclByb3BlcnR5LmdldCgpLmFyZWEsXG4gICAgICAgICAgdGhpcy5zaGFwZVBsYWNlbWVudEJvYXJkLmFyZWFBbmRQZXJpbWV0ZXJQcm9wZXJ0eS5nZXQoKS5wZXJpbWV0ZXIsXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29sb3IxOiBjaGFsbGVuZ2UuYnVpbGRTcGVjLnByb3BvcnRpb25zLmNvbG9yMSxcbiAgICAgICAgICAgIGNvbG9yMjogY2hhbGxlbmdlLmJ1aWxkU3BlYy5wcm9wb3J0aW9ucy5jb2xvcjIsXG4gICAgICAgICAgICBjb2xvcjFQcm9wb3J0aW9uOiB0aGlzLmdldFByb3BvcnRpb25PZkNvbG9yKCBjaGFsbGVuZ2UuYnVpbGRTcGVjLnByb3BvcnRpb25zLmNvbG9yMSApXG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICBhbnN3ZXJJc0NvcnJlY3QgPSB1c2VyQnVpbHRTcGVjLmVxdWFscyggY2hhbGxlbmdlLmJ1aWxkU3BlYyApO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdVbmhhbmRsZWQgY2hlY2sgc3BlYycgKTtcbiAgICAgICAgYW5zd2VySXNDb3JyZWN0ID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBhbnN3ZXJJc0NvcnJlY3Q7XG4gIH1cblxuICAvLyBAcHVibGljLCBDYWxsZWQgZnJvbSBtYWluIG1vZGVsIHNvIHRoYXQgdGhpcyBtb2RlbCBjYW4gZG8gd2hhdCBpdCBuZWVkcyB0byBpbiBvcmRlciB0byBnaXZlIHRoZSB1c2VyIGFub3RoZXIgY2hhbmNlLlxuICB0cnlBZ2FpbigpIHtcbiAgICAvLyBOb3RoaW5nIG5lZWRzIHRvIGJlIHJlc2V0IGluIHRoaXMgbW9kZWwgdG8gYWxsb3cgdGhlIHVzZXIgdG8gdHJ5IGFnYWluLlxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHByb3BvcnRpb24gb2YgdGhlIHNoYXBlcyBvbiB0aGUgYm9hcmQgdGhhdCBhcmUgdGhlIHNhbWUgY29sb3IgYXMgdGhlIHByb3ZpZGVkIHZhbHVlLlxuICAgKiBAcGFyYW0gY29sb3JcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgZ2V0UHJvcG9ydGlvbk9mQ29sb3IoIGNvbG9yICkge1xuICAgIC8vIFBhc3MgdGhyb3VnaCB0byB0aGUgc2hhcGUgcGxhY2VtZW50IGJvYXJkLlxuICAgIHJldHVybiB0aGlzLnNoYXBlUGxhY2VtZW50Qm9hcmQuZ2V0UHJvcG9ydGlvbk9mQ29sb3IoIGNvbG9yICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHVwIGFueXRoaW5nIGluIHRoZSBtb2RlbCB0aGF0IGlzIG5lZWRlZCBmb3IgdGhlIHNwZWNpZmllZCBjaGFsbGVuZ2UuXG4gICAqIEBwYXJhbSBjaGFsbGVuZ2VcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgc2V0Q2hhbGxlbmdlKCBjaGFsbGVuZ2UgKSB7XG4gICAgaWYgKCBjaGFsbGVuZ2UgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgKCBjaGFsbGVuZ2UuYmFja2dyb3VuZFNoYXBlICE9PSAndW5kZWZpbmVkJyApICk7XG5cbiAgICAgIC8vIFNldCB0aGUgYmFja2dyb3VuZCBzaGFwZS5cbiAgICAgIHRoaXMuc2hhcGVQbGFjZW1lbnRCb2FyZC5zZXRCYWNrZ3JvdW5kU2hhcGUoIGNoYWxsZW5nZS5iYWNrZ3JvdW5kU2hhcGUsIHRydWUgKTtcbiAgICAgIHRoaXMuc2hhcGVQbGFjZW1lbnRCb2FyZC5zaG93R3JpZE9uQmFja2dyb3VuZFNoYXBlID0gZmFsc2U7IC8vIEluaXRpYWxseSBvZmYsIG1heSBiZSB0dXJuZWQgb24gd2hlbiBzaG93aW5nIHNvbHV0aW9uLlxuXG4gICAgICAvLyBTZXQgdGhlIGJvYXJkIHRvIGVpdGhlciBmb3JtIGNvbXBvc2l0ZSBzaGFwZXMgb3IgYWxsb3cgZnJlZSBwbGFjZW1lbnQuXG4gICAgICB0aGlzLnNoYXBlUGxhY2VtZW50Qm9hcmQuZm9ybUNvbXBvc2l0ZVByb3BlcnR5LnNldCggY2hhbGxlbmdlLmJhY2tncm91bmRTaGFwZSA9PT0gbnVsbCApO1xuXG4gICAgICAvLyBTZXQgdGhlIGNvbG9yIHNjaGVtZSBvZiB0aGUgY29tcG9zaXRlIHNvIHRoYXQgdGhlIHBsYWNlZCBzcXVhcmVzIGNhbiBiZSBzZWVuIGlmIG5lZWRlZC5cbiAgICAgIGlmICggY2hhbGxlbmdlLmJ1aWxkU3BlYyAmJiB0aGlzLnNoYXBlUGxhY2VtZW50Qm9hcmQuZm9ybUNvbXBvc2l0ZVByb3BlcnR5LmdldCgpICYmIGNoYWxsZW5nZS51c2VyU2hhcGVzICkge1xuXG4gICAgICAgIC8vIE1ha2UgdGhlIHBlcmltZXRlciBjb2xvciBiZSBhIGRhcmtlciB2ZXJzaW9uIG9mIHRoZSBmaXJzdCB1c2VyIHNoYXBlLlxuICAgICAgICBjb25zdCBwZXJpbWV0ZXJDb2xvciA9IENvbG9yLnRvQ29sb3IoIGNoYWxsZW5nZS51c2VyU2hhcGVzWyAwIF0uY29sb3IgKS5jb2xvclV0aWxzRGFya2VyKCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5QRVJJTUVURVJfREFSS0VOX0ZBQ1RPUiApO1xuXG4gICAgICAgIGxldCBmaWxsQ29sb3I7XG4gICAgICAgIGlmICggY2hhbGxlbmdlLmJ1aWxkU3BlYy5wcm9wb3J0aW9ucyApIHtcbiAgICAgICAgICAvLyBUaGUgY29tcG9zaXRlIHNoYXBlIG5lZWRzIHRvIGJlIHNlZSB0aHJvdWdoIHNvIHRoYXQgdGhlIG9yaWdpbmFsIHNoYXBlcyBjYW4gYmUgc2Vlbi4gIFRoaXMgYWxsb3dzXG4gICAgICAgICAgLy8gbXVsdGlwbGUgY29sb3JzIHRvIGJlIGRlcGljdGVkLCBidXQgZ2VuZXJhbGx5IGRvZXNuJ3QgbG9vayBxdWl0ZSBhcyBnb29kLlxuICAgICAgICAgIGZpbGxDb2xvciA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgLy8gVGhlIGZpbGwgY29sb3Igc2hvdWxkIGJlIHRoZSBzYW1lIGFzIHRoZSB1c2VyIHNoYXBlcy4gIEFzc3VtZSBhbGwgdXNlciBzaGFwZXMgYXJlIHRoZSBzYW1lIGNvbG9yLlxuICAgICAgICAgIGZpbGxDb2xvciA9IGNoYWxsZW5nZS51c2VyU2hhcGVzWyAwIF0uY29sb3I7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNoYXBlUGxhY2VtZW50Qm9hcmQuc2V0Q29tcG9zaXRlU2hhcGVDb2xvclNjaGVtZSggZmlsbENvbG9yLCBwZXJpbWV0ZXJDb2xvciApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgc3RlcCggZHQgKSB7XG4gICAgdGhpcy5tb3ZhYmxlU2hhcGVzLmZvckVhY2goIG1vdmFibGVTaGFwZSA9PiB7IG1vdmFibGVTaGFwZS5zdGVwKCBkdCApOyB9ICk7XG4gIH1cblxuICAvKipcbiAgICogcmVzZXRzIGFsbCBtb2RlbCBlbGVtZW50c1xuICAgKiBAcHVibGljXG4gICAqL1xuICByZXNldCgpIHtcbiAgICB0aGlzLnNoYXBlUGxhY2VtZW50Qm9hcmQucmVsZWFzZUFsbFNoYXBlcyggJ2p1bXBIb21lJyApO1xuICAgIHRoaXMubW92YWJsZVNoYXBlcy5jbGVhcigpO1xuICB9XG5cbn1cblxuLy8gU2l6ZSBvZiB0aGUgc2hhcGUgYm9hcmQgaW4gdGVybXMgb2YgdGhlIHVuaXQgbGVuZ3RoLCBuZWVkZWQgYnkgdGhlIGNoYWxsZW5nZSBmYWN0b3J5LlxuQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9XSURUSCA9IEJPQVJEX1NJWkUud2lkdGggLyBVTklUX1NRVUFSRV9MRU5HVEg7XG5BcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX0hFSUdIVCA9IEJPQVJEX1NJWkUuaGVpZ2h0IC8gVU5JVF9TUVVBUkVfTEVOR1RIO1xuQXJlYUJ1aWxkZXJHYW1lTW9kZWwuVU5JVF9TUVVBUkVfTEVOR1RIID0gVU5JVF9TUVVBUkVfTEVOR1RIO1xuXG5hcmVhQnVpbGRlci5yZWdpc3RlciggJ0FyZWFCdWlsZGVyR2FtZU1vZGVsJywgQXJlYUJ1aWxkZXJHYW1lTW9kZWwgKTtcbmV4cG9ydCBkZWZhdWx0IEFyZWFCdWlsZGVyR2FtZU1vZGVsOyJdLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJWZWN0b3IyIiwiU2hhcGUiLCJDb2xvciIsImFyZWFCdWlsZGVyIiwiQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMiLCJNb3ZhYmxlU2hhcGUiLCJTaGFwZVBsYWNlbWVudEJvYXJkIiwiQnVpbGRTcGVjIiwiVU5JVF9TUVVBUkVfTEVOR1RIIiwiQk9BUkRfU0laRSIsIlVOSVRfU1FVQVJFX1NIQVBFIiwicmVjdCIsIm1ha2VJbW11dGFibGUiLCJBcmVhQnVpbGRlckdhbWVNb2RlbCIsInJlcGxhY2VTaGFwZVdpdGhVbml0U3F1YXJlcyIsIm1vdmFibGVTaGFwZSIsImFzc2VydCIsInNoYXBlIiwiYm91bmRzIiwid2lkdGgiLCJoZWlnaHQiLCJjb25zdGl0dWVudFNoYXBlcyIsImRlY29tcG9zZUludG9TcXVhcmVzIiwiZm9yRWFjaCIsImFkZFVzZXJDcmVhdGVkTW92YWJsZVNoYXBlIiwic2hhcGVQbGFjZW1lbnRCb2FyZCIsIm1vdmFibGVTaGFwZXMiLCJyZW1vdmUiLCJzZWxmIiwicHVzaCIsInVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJsYXp5TGluayIsInVzZXJDb250cm9sbGVkIiwicGxhY2VTaGFwZSIsImFuaW1hdGluZ1Byb3BlcnR5IiwiZ2V0IiwiZGVjb21wb3NlQ29tcG9zaXRlU2hhcGUiLCJhbmltYXRpbmciLCJ1bmxpbmsiLCJpc1Jlc2lkZW50U2hhcGUiLCJyZXR1cm5Ub09yaWdpbiIsInJldHVybmVkVG9PcmlnaW5FbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJmYWRlUHJvcG9ydGlvblByb3BlcnR5IiwibGluayIsImZhZGVIYW5kbGVyIiwiZmFkZVByb3BvcnRpb24iLCJhZGRVbml0U3F1YXJlRGlyZWN0bHlUb0JvYXJkIiwiY2VsbENvbHVtbiIsImNlbGxSb3ciLCJjb2xvciIsInNvbHV0aW9uU2hhcGVPcmlnaW4iLCJhZGRTaGFwZURpcmVjdGx5VG9DZWxsIiwiY2xlYXJTaGFwZVBsYWNlbWVudEJvYXJkIiwicmVsZWFzZUFsbFNoYXBlcyIsInN0YXJ0TGV2ZWwiLCJzaG93RGltZW5zaW9uc1Byb3BlcnR5IiwidmFsdWUiLCJzaG93R3JpZFByb3BlcnR5IiwiZGlzcGxheUNvcnJlY3RBbnN3ZXIiLCJjaGFsbGVuZ2UiLCJidWlsZFNwZWMiLCJzdXNwZW5kVXBkYXRlc0ZvckJsb2NrQWRkIiwiZXhhbXBsZUJ1aWxkSXRTb2x1dGlvbiIsInNoYXBlUGxhY2VtZW50U3BlYyIsImNoZWNrU3BlYyIsInNob3dHcmlkT25CYWNrZ3JvdW5kU2hhcGUiLCJjaGVja0Fuc3dlciIsImFuc3dlcklzQ29ycmVjdCIsInVzZXJCdWlsdFNwZWMiLCJhcmVhR3Vlc3MiLCJiYWNrZ3JvdW5kU2hhcGUiLCJ1bml0QXJlYSIsImFyZWEiLCJhcmVhQW5kUGVyaW1ldGVyUHJvcGVydHkiLCJwZXJpbWV0ZXIiLCJjb2xvcjEiLCJwcm9wb3J0aW9ucyIsImNvbG9yMiIsImNvbG9yMVByb3BvcnRpb24iLCJnZXRQcm9wb3J0aW9uT2ZDb2xvciIsImVxdWFscyIsInRyeUFnYWluIiwic2V0Q2hhbGxlbmdlIiwic2V0QmFja2dyb3VuZFNoYXBlIiwiZm9ybUNvbXBvc2l0ZVByb3BlcnR5Iiwic2V0IiwidXNlclNoYXBlcyIsInBlcmltZXRlckNvbG9yIiwidG9Db2xvciIsImNvbG9yVXRpbHNEYXJrZXIiLCJQRVJJTUVURVJfREFSS0VOX0ZBQ1RPUiIsImZpbGxDb2xvciIsInNldENvbXBvc2l0ZVNoYXBlQ29sb3JTY2hlbWUiLCJzdGVwIiwiZHQiLCJyZXNldCIsImNsZWFyIiwiY29uc3RydWN0b3IiLCJzaG93R3JpZE9uQm9hcmRQcm9wZXJ0eSIsIkxBWU9VVF9CT1VORFMiLCJsZWZ0IiwibWF4WSIsIlNIQVBFX0JPQVJEX1VOSVRfV0lEVEgiLCJTSEFQRV9CT0FSRF9VTklUX0hFSUdIVCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7O0NBUUMsR0FFRCxPQUFPQSwyQkFBMkIsK0NBQStDO0FBQ2pGLE9BQU9DLGNBQWMsa0NBQWtDO0FBQ3ZELE9BQU9DLGdCQUFnQixtQ0FBbUM7QUFDMUQsT0FBT0MsYUFBYSxnQ0FBZ0M7QUFDcEQsU0FBU0MsS0FBSyxRQUFRLGlDQUFpQztBQUN2RCxTQUFTQyxLQUFLLFFBQVEsb0NBQW9DO0FBQzFELE9BQU9DLGlCQUFpQix1QkFBdUI7QUFDL0MsT0FBT0MsZ0NBQWdDLDZDQUE2QztBQUNwRixPQUFPQyxrQkFBa0IscUNBQXFDO0FBQzlELE9BQU9DLHlCQUF5Qiw0Q0FBNEM7QUFDNUUsT0FBT0MsZUFBZSxpQkFBaUI7QUFFdkMsWUFBWTtBQUNaLE1BQU1DLHFCQUFxQkosMkJBQTJCSSxrQkFBa0IsRUFBRSw2Q0FBNkM7QUFDdkgsTUFBTUMsYUFBYSxJQUFJVixXQUFZUyxxQkFBcUIsSUFBSUEscUJBQXFCO0FBQ2pGLE1BQU1FLG9CQUFvQlQsTUFBTVUsSUFBSSxDQUFF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