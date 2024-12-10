// Copyright 2014-2022, University of Colorado Boulder
/**
 * A factory object that creates the challenges for the Area Builder game.
 *
 * @author John Blanco
 */ import dotRandom from '../../../../dot/js/dotRandom.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import { Color } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../../common/AreaBuilderSharedConstants.js';
import PerimeterShape from '../../common/model/PerimeterShape.js';
import AreaBuilderGameChallenge from './AreaBuilderGameChallenge.js';
import AreaBuilderGameModel from './AreaBuilderGameModel.js';
// constants
const UNIT_SQUARE_LENGTH = AreaBuilderSharedConstants.UNIT_SQUARE_LENGTH; // In screen coords
function AreaBuilderChallengeFactory() {
    const random = dotRandom;
    // Basic shapes used in the 'creator kits'.
    const UNIT_SQUARE_SHAPE = new Shape().moveTo(0, 0).lineTo(UNIT_SQUARE_LENGTH, 0).lineTo(UNIT_SQUARE_LENGTH, UNIT_SQUARE_LENGTH).lineTo(0, UNIT_SQUARE_LENGTH).close().makeImmutable();
    const HORIZONTAL_DOUBLE_SQUARE_SHAPE = new Shape().moveTo(0, 0).lineTo(UNIT_SQUARE_LENGTH * 2, 0).lineTo(UNIT_SQUARE_LENGTH * 2, UNIT_SQUARE_LENGTH).lineTo(0, UNIT_SQUARE_LENGTH).close().makeImmutable();
    const VERTICAL_DOUBLE_SQUARE_SHAPE = new Shape().moveTo(0, 0).lineTo(UNIT_SQUARE_LENGTH, 0).lineTo(UNIT_SQUARE_LENGTH, UNIT_SQUARE_LENGTH * 2).lineTo(0, UNIT_SQUARE_LENGTH * 2).close().makeImmutable();
    const QUAD_SQUARE_SHAPE = new Shape().moveTo(0, 0).lineTo(UNIT_SQUARE_LENGTH * 2, 0).lineTo(UNIT_SQUARE_LENGTH * 2, UNIT_SQUARE_LENGTH * 2).lineTo(0, UNIT_SQUARE_LENGTH * 2).close().makeImmutable();
    const RIGHT_BOTTOM_TRIANGLE_SHAPE = new Shape().moveTo(UNIT_SQUARE_LENGTH, 0).lineTo(UNIT_SQUARE_LENGTH, UNIT_SQUARE_LENGTH).lineTo(0, UNIT_SQUARE_LENGTH).lineTo(UNIT_SQUARE_LENGTH, 0).close().makeImmutable();
    const LEFT_BOTTOM_TRIANGLE_SHAPE = new Shape().moveTo(0, 0).lineTo(UNIT_SQUARE_LENGTH, UNIT_SQUARE_LENGTH).lineTo(0, UNIT_SQUARE_LENGTH).lineTo(0, 0).close().makeImmutable();
    const RIGHT_TOP_TRIANGLE_SHAPE = new Shape().moveTo(0, 0).lineTo(UNIT_SQUARE_LENGTH, 0).lineTo(UNIT_SQUARE_LENGTH, UNIT_SQUARE_LENGTH).lineTo(0, 0).close().makeImmutable();
    const LEFT_TOP_TRIANGLE_SHAPE = new Shape().moveTo(0, 0).lineTo(UNIT_SQUARE_LENGTH, 0).lineTo(0, UNIT_SQUARE_LENGTH).lineTo(0, 0).close().makeImmutable();
    // Shape kit with a set of basic shapes and a default color.
    const BASIC_RECTANGLES_SHAPE_KIT = [
        {
            shape: UNIT_SQUARE_SHAPE,
            color: AreaBuilderSharedConstants.GREENISH_COLOR
        },
        {
            shape: HORIZONTAL_DOUBLE_SQUARE_SHAPE,
            color: AreaBuilderSharedConstants.GREENISH_COLOR
        },
        {
            shape: VERTICAL_DOUBLE_SQUARE_SHAPE,
            color: AreaBuilderSharedConstants.GREENISH_COLOR
        },
        {
            shape: QUAD_SQUARE_SHAPE,
            color: AreaBuilderSharedConstants.GREENISH_COLOR
        }
    ];
    const RECTANGLES_AND_TRIANGLES_SHAPE_KIT = [
        {
            shape: HORIZONTAL_DOUBLE_SQUARE_SHAPE,
            color: AreaBuilderSharedConstants.GREENISH_COLOR
        },
        {
            shape: UNIT_SQUARE_SHAPE,
            color: AreaBuilderSharedConstants.GREENISH_COLOR
        },
        {
            shape: VERTICAL_DOUBLE_SQUARE_SHAPE,
            color: AreaBuilderSharedConstants.GREENISH_COLOR
        },
        {
            shape: LEFT_BOTTOM_TRIANGLE_SHAPE,
            color: AreaBuilderSharedConstants.GREENISH_COLOR
        },
        {
            shape: LEFT_TOP_TRIANGLE_SHAPE,
            color: AreaBuilderSharedConstants.GREENISH_COLOR
        },
        {
            shape: RIGHT_BOTTOM_TRIANGLE_SHAPE,
            color: AreaBuilderSharedConstants.GREENISH_COLOR
        },
        {
            shape: RIGHT_TOP_TRIANGLE_SHAPE,
            color: AreaBuilderSharedConstants.GREENISH_COLOR
        }
    ];
    // Color chooser for selecting randomized colors for 'find the area' challenges.
    const FIND_THE_AREA_COLOR_CHOOSER = {
        colorList: random.shuffle([
            new Color(AreaBuilderSharedConstants.PALE_BLUE_COLOR),
            new Color(AreaBuilderSharedConstants.PINKISH_COLOR),
            new Color(AreaBuilderSharedConstants.PURPLISH_COLOR),
            new Color(AreaBuilderSharedConstants.ORANGISH_COLOR),
            new Color(AreaBuilderSharedConstants.DARK_GREEN_COLOR)
        ]),
        index: 0,
        nextColor: function() {
            if (this.index >= this.colorList.length) {
                // Time to shuffle the color list.  Make sure that when we do, the color that was at the end of the previous
                // list isn't at the beginning of this one, or we'll get two of the same colors in a row.
                const lastColor = this.colorList[this.colorList.length - 1];
                do {
                    this.colorList = random.shuffle(this.colorList);
                }while (this.colorList[0] === lastColor)
                // Reset the index.
                this.index = 0;
            }
            return this.colorList[this.index++];
        }
    };
    // Color chooser for selecting randomized colors for 'build it' style challenges.
    const BUILD_IT_COLOR_CHOOSER = {
        colorList: random.shuffle([
            new Color(AreaBuilderSharedConstants.GREENISH_COLOR),
            new Color(AreaBuilderSharedConstants.PINKISH_COLOR),
            new Color(AreaBuilderSharedConstants.ORANGISH_COLOR),
            new Color(AreaBuilderSharedConstants.PALE_BLUE_COLOR)
        ]),
        index: 0,
        nextColor: function() {
            if (this.index >= this.colorList.length) {
                // Time to shuffle the color list.  Make sure that when we do, the color that was at the end of the previous
                // list isn't at the beginning of this one, or we'll get two of the same colors in a row.
                const lastColor = this.colorList[this.colorList.length - 1];
                do {
                    this.colorList = random.shuffle(this.colorList);
                }while (this.colorList[0] === lastColor)
                // Reset the index.
                this.index = 0;
            }
            return this.colorList[this.index++];
        }
    };
    // Color pair chooser, used for selecting randomized colors for two tone 'build it' challenges.
    const COLOR_PAIR_CHOOSER = {
        colorPairList: random.shuffle([
            {
                color1: AreaBuilderSharedConstants.GREENISH_COLOR,
                color2: AreaBuilderSharedConstants.DARK_GREEN_COLOR
            },
            {
                color1: AreaBuilderSharedConstants.PURPLISH_COLOR,
                color2: AreaBuilderSharedConstants.DARK_PURPLE_COLOR
            },
            {
                color1: AreaBuilderSharedConstants.PALE_BLUE_COLOR,
                color2: AreaBuilderSharedConstants.DARK_BLUE_COLOR
            },
            {
                color1: AreaBuilderSharedConstants.PINKISH_COLOR,
                color2: AreaBuilderSharedConstants.PURPLE_PINK_COLOR
            }
        ]),
        index: 0,
        nextColorPair: function() {
            if (this.index >= this.colorPairList.length) {
                // Time to shuffle the list.
                const lastColorPair = this.colorPairList[this.colorPairList.length - 1];
                do {
                    this.colorPairList = random.shuffle(this.colorPairList);
                }while (this.colorPairList[0] === lastColorPair)
                // Reset the index.
                this.index = 0;
            }
            return this.colorPairList[this.index++];
        }
    };
    // -------------- private functions ---------------------------
    // Select a random element from an array
    function randomElement(array) {
        return array[Math.floor(random.nextDouble() * array.length)];
    }
    // Create a solution spec (a.k.a. an example solution) that represents a rectangle with the specified origin and size.
    function createMonochromeRectangularSolutionSpec(x, y, width, height, color) {
        const solutionSpec = [];
        for(let column = 0; column < width; column++){
            for(let row = 0; row < height; row++){
                solutionSpec.push({
                    cellColumn: column + x,
                    cellRow: row + y,
                    color: color
                });
            }
        }
        return solutionSpec;
    }
    // Create a solution spec (a.k.a. an example solution) for a two-tone challenge
    function createTwoColorRectangularSolutionSpec(x, y, width, height, color1, color2, color1proportion) {
        const solutionSpec = [];
        for(let row = 0; row < height; row++){
            for(let column = 0; column < width; column++){
                solutionSpec.push({
                    cellColumn: column + x,
                    cellRow: row + y,
                    color: (row * width + column) / (width * height) < color1proportion ? color1 : color2
                });
            }
        }
        return solutionSpec;
    }
    // Function for creating a 'shape kit' of the basic shapes of the specified color.
    function createBasicRectanglesShapeKit(color) {
        const kit = [];
        BASIC_RECTANGLES_SHAPE_KIT.forEach((kitElement)=>{
            kit.push({
                shape: kitElement.shape,
                color: color
            });
        });
        return kit;
    }
    function createTwoToneRectangleBuildKit(color1, color2) {
        const kit = [];
        BASIC_RECTANGLES_SHAPE_KIT.forEach((kitElement)=>{
            const color1Element = {
                shape: kitElement.shape,
                color: color1
            };
            kit.push(color1Element);
            const color2Element = {
                shape: kitElement.shape,
                color: color2
            };
            kit.push(color2Element);
        });
        return kit;
    }
    function flipPerimeterPointsHorizontally(perimeterPointList) {
        const reflectedPoints = [];
        let minX = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        perimeterPointList.forEach((point)=>{
            minX = Math.min(point.x, minX);
            maxX = Math.max(point.x, maxX);
        });
        perimeterPointList.forEach((point)=>{
            reflectedPoints.push(new Vector2(-1 * (point.x - minX - maxX), point.y));
        });
        return reflectedPoints;
    }
    function flipPerimeterPointsVertically(perimeterPointList) {
        const reflectedPoints = [];
        let minY = Number.POSITIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;
        perimeterPointList.forEach((point)=>{
            minY = Math.min(point.y, minY);
            maxY = Math.max(point.y, maxY);
        });
        perimeterPointList.forEach((point)=>{
            reflectedPoints.push(new Vector2(point.x, -1 * (point.y - minY - maxY)));
        });
        return reflectedPoints;
    }
    function createRectangularPerimeterShape(x, y, width, height, fillColor) {
        return new PerimeterShape(// Exterior perimeters
        [
            [
                new Vector2(x, y),
                new Vector2(x + width, y),
                new Vector2(x + width, y + height),
                new Vector2(x, y + height)
            ]
        ], // Interior perimeters
        [], // Unit size
        UNIT_SQUARE_LENGTH, // color
        {
            fillColor: fillColor,
            edgeColor: fillColor.colorUtilsDarker(AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR)
        });
    }
    function createLShapedPerimeterShape(x, y, width, height, missingCorner, widthMissing, heightMissing, fillColor) {
        assert && assert(width > widthMissing && height > heightMissing, 'Invalid parameters');
        let perimeterPoints = [
            new Vector2(x + widthMissing, y),
            new Vector2(x + width, y),
            new Vector2(x + width, y + height),
            new Vector2(x, y + height),
            new Vector2(x, y + heightMissing),
            new Vector2(x + widthMissing, y + heightMissing)
        ];
        if (missingCorner === 'rightTop' || missingCorner === 'rightBottom') {
            perimeterPoints = flipPerimeterPointsHorizontally(perimeterPoints);
        }
        if (missingCorner === 'leftBottom' || missingCorner === 'rightBottom') {
            perimeterPoints = flipPerimeterPointsVertically(perimeterPoints);
        }
        return new PerimeterShape([
            perimeterPoints
        ], [], UNIT_SQUARE_LENGTH, {
            fillColor: fillColor,
            edgeColor: fillColor.colorUtilsDarker(AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR)
        });
    }
    // Create a perimeter shape with a cutout in the top, bottom, left, or right side.
    function createUShapedPerimeterShape(x, y, width, height, sideWithCutout, cutoutWidth, cutoutHeight, cutoutOffset, fillColor) {
        let perimeterPoints = [
            new Vector2(0, 0),
            new Vector2(0, 0),
            new Vector2(0, 0),
            new Vector2(0, 0),
            new Vector2(0, 0),
            new Vector2(0, 0),
            new Vector2(0, 0),
            new Vector2(0, 0)
        ];
        if (sideWithCutout === 'left' || sideWithCutout === 'right') {
            perimeterPoints[0].setXY(x, y);
            perimeterPoints[1].setXY(x + width, y);
            perimeterPoints[2].setXY(x + width, y + height);
            perimeterPoints[3].setXY(x, y + height);
            perimeterPoints[4].setXY(x, y + cutoutOffset + cutoutHeight);
            perimeterPoints[5].setXY(x + cutoutWidth, y + cutoutOffset + cutoutHeight);
            perimeterPoints[6].setXY(x + cutoutWidth, y + cutoutOffset);
            perimeterPoints[7].setXY(x, y + cutoutOffset);
            if (sideWithCutout === 'right') {
                perimeterPoints = flipPerimeterPointsHorizontally(perimeterPoints);
            }
        } else {
            perimeterPoints[0].setXY(x, y);
            perimeterPoints[1].setXY(x + cutoutOffset, y);
            perimeterPoints[2].setXY(x + cutoutOffset, y + cutoutHeight);
            perimeterPoints[3].setXY(x + cutoutOffset + cutoutWidth, y + cutoutHeight);
            perimeterPoints[4].setXY(x + cutoutOffset + cutoutWidth, y);
            perimeterPoints[5].setXY(x + width, y);
            perimeterPoints[6].setXY(x + width, y + height);
            perimeterPoints[7].setXY(x, y + height);
            if (sideWithCutout === 'bottom') {
                perimeterPoints = flipPerimeterPointsVertically(perimeterPoints);
            }
        }
        return new PerimeterShape([
            perimeterPoints
        ], [], UNIT_SQUARE_LENGTH, {
            fillColor: fillColor,
            edgeColor: fillColor.colorUtilsDarker(AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR)
        });
    }
    function createPerimeterShapeWithHole(x, y, width, height, holeWidth, holeHeight, holeXOffset, holeYOffset, fillColor) {
        const exteriorPerimeterPoints = [
            new Vector2(x, y),
            new Vector2(x + width, y),
            new Vector2(x + width, y + height),
            new Vector2(x, y + height)
        ];
        const interiorPerimeterPoints = [
            // Have to draw hole in opposite direction for it to appear.
            new Vector2(x + holeXOffset, y + holeYOffset),
            new Vector2(x + holeXOffset, y + holeYOffset + holeHeight),
            new Vector2(x + holeXOffset + holeWidth, y + holeYOffset + holeHeight),
            new Vector2(x + holeXOffset + holeWidth, y + holeYOffset)
        ];
        return new PerimeterShape([
            exteriorPerimeterPoints
        ], [
            interiorPerimeterPoints
        ], UNIT_SQUARE_LENGTH, {
            fillColor: fillColor,
            edgeColor: fillColor.colorUtilsDarker(AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR)
        });
    }
    function createPerimeterShapeSlantedHypotenuseRightIsoscelesTriangle(x, y, edgeLength, cornerPosition, fillColor) {
        let perimeterPoints = [
            new Vector2(x, y),
            new Vector2(x + edgeLength, y),
            new Vector2(x, y + edgeLength)
        ];
        if (cornerPosition === 'rightTop' || cornerPosition === 'rightBottom') {
            perimeterPoints = flipPerimeterPointsHorizontally(perimeterPoints);
        }
        if (cornerPosition === 'leftBottom' || cornerPosition === 'rightBottom') {
            perimeterPoints = flipPerimeterPointsVertically(perimeterPoints);
        }
        return new PerimeterShape([
            perimeterPoints
        ], [], UNIT_SQUARE_LENGTH, {
            fillColor: fillColor,
            edgeColor: fillColor.colorUtilsDarker(AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR)
        });
    }
    function createPerimeterShapeLevelHypotenuseRightIsoscelesTriangle(x, y, hypotenuseLength, cornerPosition, fillColor) {
        let perimeterPoints;
        if (cornerPosition === 'centerTop' || cornerPosition === 'centerBottom') {
            perimeterPoints = [
                new Vector2(x, y),
                new Vector2(x + hypotenuseLength, y),
                new Vector2(x + hypotenuseLength / 2, y + hypotenuseLength / 2)
            ];
            if (cornerPosition === 'centerBottom') {
                perimeterPoints = flipPerimeterPointsVertically(perimeterPoints);
            }
        } else {
            perimeterPoints = [
                new Vector2(x, y),
                new Vector2(x, y + hypotenuseLength),
                new Vector2(x + hypotenuseLength / 2, y + hypotenuseLength / 2)
            ];
            if (cornerPosition === 'centerLeft') {
                perimeterPoints = flipPerimeterPointsHorizontally(perimeterPoints);
            }
        }
        // Reflect as appropriate to create the specified orientation.
        if (cornerPosition === 'centerTop' || cornerPosition === 'rightBottom') {
            perimeterPoints = flipPerimeterPointsHorizontally(perimeterPoints);
        }
        if (cornerPosition === 'leftBottom' || cornerPosition === 'rightBottom') {
            perimeterPoints = flipPerimeterPointsVertically(perimeterPoints);
        }
        return new PerimeterShape([
            perimeterPoints
        ], [], UNIT_SQUARE_LENGTH, {
            fillColor: fillColor,
            edgeColor: fillColor.colorUtilsDarker(AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR)
        });
    }
    function createShapeWithDiagonalAndMissingCorner(x, y, width, height, diagonalPosition, diagonalSquareLength, cutWidth, cutHeight, fillColor) {
        assert && assert(width - diagonalSquareLength >= cutWidth && height - diagonalSquareLength >= cutHeight, 'Invalid parameters');
        let perimeterPoints = [];
        // Draw shape with diagonal in lower right corner, starting in upper right corner.
        perimeterPoints.push(new Vector2(x + width, y));
        perimeterPoints.push(new Vector2(x + width, y + height - diagonalSquareLength));
        perimeterPoints.push(new Vector2(x + width - diagonalSquareLength, y + height));
        perimeterPoints.push(new Vector2(x, y + height));
        perimeterPoints.push(new Vector2(x, y + cutHeight));
        perimeterPoints.push(new Vector2(x + cutWidth, y + cutHeight));
        perimeterPoints.push(new Vector2(x + cutWidth, y));
        // Reflect shape as needed to meet the specified orientation.
        if (diagonalPosition === 'leftTop' || diagonalPosition === 'leftBottom') {
            perimeterPoints = flipPerimeterPointsHorizontally(perimeterPoints);
        }
        if (diagonalPosition === 'rightTop' || diagonalPosition === 'leftTop') {
            perimeterPoints = flipPerimeterPointsVertically(perimeterPoints);
        }
        return new PerimeterShape([
            perimeterPoints
        ], [], UNIT_SQUARE_LENGTH, {
            fillColor: fillColor,
            edgeColor: fillColor.colorUtilsDarker(AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR)
        });
    }
    // Return a value that indicates whether two challenges are similar, used when generating challenges that are
    // distinct enough to keep the game interesting.
    function isChallengeSimilar(challenge1, challenge2) {
        if (challenge1.buildSpec && challenge2.buildSpec) {
            if (challenge1.buildSpec.proportions && challenge2.buildSpec.proportions) {
                if (challenge1.buildSpec.proportions.color1Proportion.denominator === challenge2.buildSpec.proportions.color1Proportion.denominator) {
                    if (challenge1.buildSpec.perimeter && challenge2.buildSpec.perimeter || !challenge1.buildSpec.perimeter && !challenge2.buildSpec.perimeter) {
                        return true;
                    }
                }
            } else if (!challenge1.buildSpec.proportions && !challenge1.buildSpec.proportions) {
                if (challenge1.buildSpec.area === challenge2.buildSpec.area) {
                    return true;
                }
            }
        } else {
            if (challenge1.backgroundShape && challenge2.backgroundShape) {
                if (challenge1.backgroundShape.unitArea === challenge2.backgroundShape.unitArea) {
                    return true;
                }
            }
        }
        // If we got to here, the challenges are not similar.
        return false;
    }
    // Test the challenge against the history of recently generated challenges to see if it is unique.
    function isChallengeUnique(challenge) {
        let challengeIsUnique = true;
        for(let i = 0; i < challengeHistory.length; i++){
            if (isChallengeSimilar(challenge, challengeHistory[i])) {
                challengeIsUnique = false;
                break;
            }
        }
        return challengeIsUnique;
    }
    function generateBuildAreaChallenge() {
        // Create a unique challenge
        const width = random.nextIntBetween(2, AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 2);
        let height = 0;
        while(width * height < 8 || width * height > 36){
            height = random.nextIntBetween(0, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2);
        }
        const color = BUILD_IT_COLOR_CHOOSER.nextColor();
        const exampleSolution = createMonochromeRectangularSolutionSpec(Math.floor((AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - width) / 2), Math.floor((AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - height) / 2), width, height, color);
        const challenge = AreaBuilderGameChallenge.createBuildAreaChallenge(width * height, createBasicRectanglesShapeKit(color), exampleSolution);
        return challenge;
    }
    /**
   * Generate a 'build it' area+perimeter challenge that consists of two connected rectangles.  See the design spec
   * for details.
   */ function generateTwoRectangleBuildAreaAndPerimeterChallenge() {
        // Create first rectangle dimensions
        const width1 = random.nextIntBetween(2, 6);
        let height1;
        do {
            height1 = random.nextIntBetween(1, 4);
        }while (width1 % 2 === height1 % 2)
        // Create second rectangle dimensions
        let width2 = 0;
        do {
            width2 = random.nextIntBetween(1, 6);
        }while (width1 + width2 > AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 2)
        let height2;
        do {
            height2 = random.nextIntBetween(1, 6);
        }while (width2 % 2 === height2 % 2 || height1 + height2 > AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2)
        // Choose the amount of overlap
        const overlap = random.nextIntBetween(1, Math.min(width1, width2) - 1);
        const left = Math.floor((AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - (width1 + width2 - overlap)) / 2);
        const top = Math.floor((AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - (height1 + height2)) / 2);
        // Create a solution spec by merging specs for each of the rectangles together.
        const color = BUILD_IT_COLOR_CHOOSER.nextColor();
        const solutionSpec = createMonochromeRectangularSolutionSpec(left, top, width1, height1, color).concat(createMonochromeRectangularSolutionSpec(left + width1 - overlap, top + height1, width2, height2, color));
        return AreaBuilderGameChallenge.createBuildAreaAndPerimeterChallenge(width1 * height1 + width2 * height2, 2 * width1 + 2 * height1 + 2 * width2 + 2 * height2 - 2 * overlap, createBasicRectanglesShapeKit(color), solutionSpec);
    }
    function generateBuildAreaAndPerimeterChallenge() {
        let width;
        let height;
        // Width can be any value from 3 to 8 excluding 7, see design doc.
        do {
            width = random.nextIntBetween(3, 8);
        }while (width === 0 || width === 7)
        // Choose the height based on the total area.
        do {
            height = random.nextIntBetween(3, 8);
        }while (width * height < 12 || width * height > 36 || height === 7 || height > AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2)
        const color = BUILD_IT_COLOR_CHOOSER.nextColor();
        const exampleSolution = createMonochromeRectangularSolutionSpec(Math.floor((AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - width) / 2), Math.floor((AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - height) / 2), width, height, color);
        return AreaBuilderGameChallenge.createBuildAreaAndPerimeterChallenge(width * height, 2 * width + 2 * height, createBasicRectanglesShapeKit(color), exampleSolution);
    }
    function generateRectangularFindAreaChallenge() {
        let width;
        let height;
        do {
            width = random.nextIntBetween(2, AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 4);
            height = random.nextIntBetween(2, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 4);
        }while (width * height < 16 || width * height > 36)
        const perimeterShape = createRectangularPerimeterShape(0, 0, width * UNIT_SQUARE_LENGTH, height * UNIT_SQUARE_LENGTH, FIND_THE_AREA_COLOR_CHOOSER.nextColor());
        return AreaBuilderGameChallenge.createFindAreaChallenge(perimeterShape, BASIC_RECTANGLES_SHAPE_KIT);
    }
    function generateLShapedFindAreaChallenge() {
        let width;
        let height;
        do {
            width = random.nextIntBetween(2, AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 4);
            height = random.nextIntBetween(2, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 4);
        }while (width * height < 16 || width * height > 36)
        const missingWidth = random.nextIntBetween(1, width - 1);
        const missingHeight = random.nextIntBetween(1, height - 1);
        const missingCorner = randomElement([
            'leftTop',
            'rightTop',
            'leftBottom',
            'rightBottom'
        ]);
        const perimeterShape = createLShapedPerimeterShape(0, 0, width * UNIT_SQUARE_LENGTH, height * UNIT_SQUARE_LENGTH, missingCorner, missingWidth * UNIT_SQUARE_LENGTH, missingHeight * UNIT_SQUARE_LENGTH, FIND_THE_AREA_COLOR_CHOOSER.nextColor());
        return AreaBuilderGameChallenge.createFindAreaChallenge(perimeterShape, BASIC_RECTANGLES_SHAPE_KIT);
    }
    function generateUShapedFindAreaChallenge() {
        let width;
        let height;
        do {
            width = random.nextIntBetween(4, AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 4);
            height = random.nextIntBetween(4, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2);
        }while (width * height < 16 || width * height > 36)
        const sideWithCutout = randomElement([
            'left',
            'right',
            'top',
            'bottom'
        ]);
        let cutoutWidth;
        let cutoutHeight;
        let cutoutOffset;
        if (sideWithCutout === 'left' || sideWithCutout === 'right') {
            cutoutWidth = random.nextIntBetween(2, width - 1);
            cutoutHeight = random.nextIntBetween(1, height - 2);
            cutoutOffset = random.nextIntBetween(1, height - cutoutHeight - 1);
        } else {
            cutoutWidth = random.nextIntBetween(1, width - 2);
            cutoutHeight = random.nextIntBetween(2, height - 1);
            cutoutOffset = random.nextIntBetween(1, width - cutoutWidth - 1);
        }
        const perimeterShape = createUShapedPerimeterShape(0, 0, width * UNIT_SQUARE_LENGTH, height * UNIT_SQUARE_LENGTH, sideWithCutout, cutoutWidth * UNIT_SQUARE_LENGTH, cutoutHeight * UNIT_SQUARE_LENGTH, cutoutOffset * UNIT_SQUARE_LENGTH, FIND_THE_AREA_COLOR_CHOOSER.nextColor());
        return AreaBuilderGameChallenge.createFindAreaChallenge(perimeterShape, BASIC_RECTANGLES_SHAPE_KIT);
    }
    function generateOShapedFindAreaChallenge() {
        let width;
        let height;
        do {
            width = random.nextIntBetween(3, AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 4);
            height = random.nextIntBetween(3, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2);
        }while (width * height < 16 || width * height > 36)
        const holeWidth = random.nextIntBetween(1, width - 2);
        const holeHeight = random.nextIntBetween(1, height - 2);
        const holeXOffset = random.nextIntBetween(1, width - holeWidth - 1);
        const holeYOffset = random.nextIntBetween(1, height - holeHeight - 1);
        const perimeterShape = createPerimeterShapeWithHole(0, 0, width * UNIT_SQUARE_LENGTH, height * UNIT_SQUARE_LENGTH, holeWidth * UNIT_SQUARE_LENGTH, holeHeight * UNIT_SQUARE_LENGTH, holeXOffset * UNIT_SQUARE_LENGTH, holeYOffset * UNIT_SQUARE_LENGTH, FIND_THE_AREA_COLOR_CHOOSER.nextColor());
        return AreaBuilderGameChallenge.createFindAreaChallenge(perimeterShape, BASIC_RECTANGLES_SHAPE_KIT);
    }
    function generateIsoscelesRightTriangleSlantedHypotenuseFindAreaChallenge() {
        const cornerPosition = randomElement([
            'leftTop',
            'rightTop',
            'rightBottom',
            'leftBottom'
        ]);
        let edgeLength = 0;
        do {
            edgeLength = random.nextIntBetween(4, Math.min(AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 2, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2));
        }while (edgeLength % 2 !== 0)
        const perimeterShape = createPerimeterShapeSlantedHypotenuseRightIsoscelesTriangle(0, 0, edgeLength * UNIT_SQUARE_LENGTH, cornerPosition, FIND_THE_AREA_COLOR_CHOOSER.nextColor());
        return AreaBuilderGameChallenge.createFindAreaChallenge(perimeterShape, RECTANGLES_AND_TRIANGLES_SHAPE_KIT);
    }
    function generateIsoscelesRightTriangleLevelHypotenuseFindAreaChallenge() {
        const cornerPosition = randomElement([
            'centerTop',
            'rightCenter',
            'centerBottom',
            'leftCenter'
        ]);
        let hypotenuseLength = 0;
        let maxHypotenuse;
        if (cornerPosition === 'centerTop' || cornerPosition === 'centerBottom') {
            maxHypotenuse = AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 4;
        } else {
            maxHypotenuse = AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2;
        }
        do {
            hypotenuseLength = random.nextIntBetween(2, maxHypotenuse);
        }while (hypotenuseLength % 2 !== 0)
        const perimeterShape = createPerimeterShapeLevelHypotenuseRightIsoscelesTriangle(0, 0, hypotenuseLength * UNIT_SQUARE_LENGTH, cornerPosition, FIND_THE_AREA_COLOR_CHOOSER.nextColor());
        return AreaBuilderGameChallenge.createFindAreaChallenge(perimeterShape, RECTANGLES_AND_TRIANGLES_SHAPE_KIT);
    }
    function generateLargeRectWithChipMissingChallenge() {
        const width = random.nextIntBetween(AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 4, AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 2);
        const height = random.nextIntBetween(AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 3, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2);
        const sideWithCutout = randomElement([
            'left',
            'right',
            'top',
            'bottom'
        ]);
        let cutoutWidth;
        let cutoutHeight;
        let cutoutOffset;
        if (sideWithCutout === 'left' || sideWithCutout === 'right') {
            cutoutWidth = 1;
            cutoutHeight = random.nextIntBetween(1, 3);
            cutoutOffset = random.nextIntBetween(1, height - cutoutHeight - 1);
        } else {
            cutoutWidth = random.nextIntBetween(1, 3);
            cutoutHeight = 1;
            cutoutOffset = random.nextIntBetween(1, width - cutoutWidth - 1);
        }
        const perimeterShape = createUShapedPerimeterShape(0, 0, width * UNIT_SQUARE_LENGTH, height * UNIT_SQUARE_LENGTH, sideWithCutout, cutoutWidth * UNIT_SQUARE_LENGTH, cutoutHeight * UNIT_SQUARE_LENGTH, cutoutOffset * UNIT_SQUARE_LENGTH, FIND_THE_AREA_COLOR_CHOOSER.nextColor());
        return AreaBuilderGameChallenge.createFindAreaChallenge(perimeterShape, BASIC_RECTANGLES_SHAPE_KIT);
    }
    function generateLargeRectWithSmallHoleMissingChallenge() {
        const width = random.nextIntBetween(AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 4, AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 2);
        const height = random.nextIntBetween(AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 3, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2);
        let holeWidth;
        let holeHeight;
        if (random.nextDouble() < 0.5) {
            holeWidth = random.nextIntBetween(1, 3);
            holeHeight = 1;
        } else {
            holeHeight = random.nextIntBetween(1, 3);
            holeWidth = 1;
        }
        const holeXOffset = random.nextIntBetween(1, width - holeWidth - 1);
        const holeYOffset = random.nextIntBetween(1, height - holeHeight - 1);
        const perimeterShape = createPerimeterShapeWithHole(0, 0, width * UNIT_SQUARE_LENGTH, height * UNIT_SQUARE_LENGTH, holeWidth * UNIT_SQUARE_LENGTH, holeHeight * UNIT_SQUARE_LENGTH, holeXOffset * UNIT_SQUARE_LENGTH, holeYOffset * UNIT_SQUARE_LENGTH, FIND_THE_AREA_COLOR_CHOOSER.nextColor());
        return AreaBuilderGameChallenge.createFindAreaChallenge(perimeterShape, BASIC_RECTANGLES_SHAPE_KIT);
    }
    function generateLargeRectWithPieceMissingChallenge() {
        return random.nextDouble() < 0.7 ? generateLargeRectWithChipMissingChallenge() : generateLargeRectWithSmallHoleMissingChallenge();
    }
    function generateShapeWithDiagonalFindAreaChallenge() {
        const width = random.nextIntBetween(3, AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 4);
        const height = random.nextIntBetween(3, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 4);
        const diagonalPosition = randomElement([
            'leftTop',
            'rightTop',
            'leftBottom',
            'rightBottom'
        ]);
        let diagonalSquareLength = 2;
        if (height > 4 && width > 4 && random.nextDouble() > 0.5) {
            diagonalSquareLength = 4;
        }
        const cutWidth = random.nextIntBetween(1, width - diagonalSquareLength);
        const cutHeight = random.nextIntBetween(1, height - diagonalSquareLength);
        const perimeterShape = createShapeWithDiagonalAndMissingCorner(0, 0, width * UNIT_SQUARE_LENGTH, height * UNIT_SQUARE_LENGTH, diagonalPosition, diagonalSquareLength * UNIT_SQUARE_LENGTH, cutWidth * UNIT_SQUARE_LENGTH, cutHeight * UNIT_SQUARE_LENGTH, FIND_THE_AREA_COLOR_CHOOSER.nextColor());
        return AreaBuilderGameChallenge.createFindAreaChallenge(perimeterShape, RECTANGLES_AND_TRIANGLES_SHAPE_KIT);
    }
    function generateEasyProportionalBuildAreaChallenge() {
        return generateProportionalBuildAreaChallenge('easy', false);
    }
    function generateHarderProportionalBuildAreaChallenge() {
        return generateProportionalBuildAreaChallenge('harder', false);
    }
    function generateProportionalBuildAreaChallenge(difficulty, includePerimeter) {
        assert && assert(difficulty === 'easy' || difficulty === 'harder');
        let width;
        let height;
        // Randomly generate width, height, and the possible factors from which a proportional challenge can be created.
        const factors = [];
        do {
            height = random.nextIntBetween(3, 6);
            if (height === 3) {
                width = random.nextIntBetween(4, 8);
            } else {
                width = random.nextIntBetween(2, 10);
            }
            const minFactor = difficulty === 'easy' ? 2 : 5;
            const maxFactor = difficulty === 'easy' ? 4 : 9;
            const area = width * height;
            for(let i = minFactor; i <= maxFactor; i++){
                if (area % i === 0) {
                    // This is a factor of the area.
                    factors.push(i);
                }
            }
        }while (factors.length === 0)
        // Choose the fractional proportion.
        const fractionDenominator = randomElement(factors);
        let color1FractionNumerator;
        do {
            color1FractionNumerator = random.nextIntBetween(1, fractionDenominator - 1);
        }while (Utils.gcd(color1FractionNumerator, fractionDenominator) > 1)
        const color1Fraction = new Fraction(color1FractionNumerator, fractionDenominator);
        // Choose the colors for this challenge
        const colorPair = COLOR_PAIR_CHOOSER.nextColorPair();
        // Create the example solution
        const exampleSolution = createTwoColorRectangularSolutionSpec(Math.floor((AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - width) / 2), Math.floor((AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - height) / 2), width, height, colorPair.color1, colorPair.color2, color1Fraction.getValue());
        const userShapes = createTwoToneRectangleBuildKit(colorPair.color1, colorPair.color2);
        // Build the challenge from all the pieces.
        if (includePerimeter) {
            return AreaBuilderGameChallenge.createTwoToneBuildAreaAndPerimeterChallenge(width * height, 2 * width + 2 * height, colorPair.color1, colorPair.color2, color1Fraction, userShapes, exampleSolution);
        } else {
            return AreaBuilderGameChallenge.createTwoToneBuildAreaChallenge(width * height, colorPair.color1, colorPair.color2, color1Fraction, userShapes, exampleSolution);
        }
    }
    function generateEasyProportionalBuildAreaAndPerimeterChallenge() {
        return generateProportionalBuildAreaChallenge('easy', true);
    }
    function generateHarderProportionalBuildAreaAndPerimeterChallenge() {
        return generateProportionalBuildAreaChallenge('harder', true);
    }
    // Challenge history, used to make sure unique challenges are generated.
    let challengeHistory = [];
    // Use the provided generation function to create challenges until a unique one has been created.
    function generateUniqueChallenge(generationFunction) {
        let challenge;
        let uniqueChallengeGenerated = false;
        let attempts = 0;
        while(!uniqueChallengeGenerated){
            challenge = generationFunction();
            attempts++;
            uniqueChallengeGenerated = isChallengeUnique(challenge);
            if (attempts > 12 && !uniqueChallengeGenerated) {
                // Remove the oldest half of challenges.
                challengeHistory = challengeHistory.slice(0, challengeHistory.length / 2);
                attempts = 0;
            }
        }
        challengeHistory.push(challenge);
        return challenge;
    }
    // Level 4 is required to limit the number of shapes available, to only allow unit squares, and to have not grid
    // control.  This function modifies the challenges to conform to this.
    function makeLevel4SpecificModifications(challenge) {
        challenge.toolSpec.gridControl = false;
        challenge.userShapes = [
            {
                shape: UNIT_SQUARE_SHAPE,
                color: AreaBuilderSharedConstants.GREENISH_COLOR
            }
        ];
        // Limit the number of shapes to the length of the larger side.  This encourages certain strategies.
        assert && assert(challenge.backgroundShape.exteriorPerimeters.length === 1, 'Unexpected configuration for background shape.');
        const perimeterShape = new PerimeterShape(challenge.backgroundShape.exteriorPerimeters, [], UNIT_SQUARE_LENGTH);
        challenge.userShapes[0].creationLimit = Math.max(perimeterShape.getWidth() / UNIT_SQUARE_LENGTH, perimeterShape.getHeight() / UNIT_SQUARE_LENGTH);
        return challenge;
    }
    /**
   * Generate a set of challenges for the given game level.
   *
   * @public
   * @param level
   * @param numChallenges
   * @returns {Array}
   */ this.generateChallengeSet = (level, numChallenges)=>{
        let challengeSet = [];
        let tempChallenge;
        let triangleChallenges;
        switch(level){
            case 0:
                _.times(3, ()=>{
                    challengeSet.push(generateUniqueChallenge(generateBuildAreaChallenge));
                });
                _.times(2, ()=>{
                    challengeSet.push(generateUniqueChallenge(generateRectangularFindAreaChallenge));
                });
                challengeSet.push(generateUniqueChallenge(generateLShapedFindAreaChallenge));
                break;
            case 1:
                _.times(3, ()=>{
                    challengeSet.push(generateUniqueChallenge(generateBuildAreaAndPerimeterChallenge));
                });
                _.times(3, ()=>{
                    challengeSet.push(generateUniqueChallenge(generateTwoRectangleBuildAreaAndPerimeterChallenge));
                });
                break;
            case 2:
                challengeSet.push(generateUniqueChallenge(generateUShapedFindAreaChallenge));
                challengeSet.push(generateUniqueChallenge(generateOShapedFindAreaChallenge));
                challengeSet.push(generateUniqueChallenge(generateShapeWithDiagonalFindAreaChallenge));
                challengeSet = random.shuffle(challengeSet);
                triangleChallenges = random.shuffle([
                    generateUniqueChallenge(generateIsoscelesRightTriangleLevelHypotenuseFindAreaChallenge),
                    generateUniqueChallenge(generateIsoscelesRightTriangleSlantedHypotenuseFindAreaChallenge)
                ]);
                triangleChallenges.forEach((challenge)=>{
                    challengeSet.push(challenge);
                });
                challengeSet.push(generateUniqueChallenge(generateLargeRectWithPieceMissingChallenge));
                break;
            case 3:
                // For this level, the grid is disabled for all challenges and some different build kits are used.
                challengeSet.push(makeLevel4SpecificModifications(generateUniqueChallenge(generateUShapedFindAreaChallenge)));
                challengeSet.push(makeLevel4SpecificModifications(generateUniqueChallenge(generateOShapedFindAreaChallenge)));
                challengeSet.push(makeLevel4SpecificModifications(generateUniqueChallenge(generateOShapedFindAreaChallenge)));
                challengeSet.push(makeLevel4SpecificModifications(generateUniqueChallenge(generateShapeWithDiagonalFindAreaChallenge)));
                challengeSet = random.shuffle(challengeSet);
                // For the next challenge, choose randomly from the shapes that don't have diagonals.
                tempChallenge = generateUniqueChallenge(randomElement([
                    generateLShapedFindAreaChallenge,
                    generateUShapedFindAreaChallenge
                ]));
                tempChallenge.toolSpec.gridControl = false;
                tempChallenge.userShapes = null;
                challengeSet.push(tempChallenge);
                tempChallenge = generateUniqueChallenge(generateShapeWithDiagonalFindAreaChallenge);
                tempChallenge.toolSpec.gridControl = false;
                tempChallenge.userShapes = null;
                challengeSet.push(tempChallenge);
                break;
            case 4:
                _.times(3, ()=>{
                    challengeSet.push(generateUniqueChallenge(generateEasyProportionalBuildAreaChallenge));
                });
                _.times(3, ()=>{
                    challengeSet.push(generateUniqueChallenge(generateHarderProportionalBuildAreaChallenge));
                });
                break;
            case 5:
                _.times(3, ()=>{
                    challengeSet.push(generateUniqueChallenge(generateEasyProportionalBuildAreaAndPerimeterChallenge));
                });
                _.times(3, ()=>{
                    challengeSet.push(generateUniqueChallenge(generateHarderProportionalBuildAreaAndPerimeterChallenge));
                });
                break;
            default:
                throw new Error(`Unsupported game level: ${level}`);
        }
        assert && assert(challengeSet.length === numChallenges, 'Error: Didn\'t generate correct number of challenges.');
        return challengeSet;
    };
}
areaBuilder.register('AreaBuilderChallengeFactory', AreaBuilderChallengeFactory);
export default AreaBuilderChallengeFactory;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9nYW1lL21vZGVsL0FyZWFCdWlsZGVyQ2hhbGxlbmdlRmFjdG9yeS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIGZhY3Rvcnkgb2JqZWN0IHRoYXQgY3JlYXRlcyB0aGUgY2hhbGxlbmdlcyBmb3IgdGhlIEFyZWEgQnVpbGRlciBnYW1lLlxuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cbiAqL1xuXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgRnJhY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy9tb2RlbC9GcmFjdGlvbi5qcyc7XG5pbXBvcnQgeyBDb2xvciB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgYXJlYUJ1aWxkZXIgZnJvbSAnLi4vLi4vYXJlYUJ1aWxkZXIuanMnO1xuaW1wb3J0IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9BcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5qcyc7XG5pbXBvcnQgUGVyaW1ldGVyU2hhcGUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1BlcmltZXRlclNoYXBlLmpzJztcbmltcG9ydCBBcmVhQnVpbGRlckdhbWVDaGFsbGVuZ2UgZnJvbSAnLi9BcmVhQnVpbGRlckdhbWVDaGFsbGVuZ2UuanMnO1xuaW1wb3J0IEFyZWFCdWlsZGVyR2FtZU1vZGVsIGZyb20gJy4vQXJlYUJ1aWxkZXJHYW1lTW9kZWwuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IFVOSVRfU1FVQVJFX0xFTkdUSCA9IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLlVOSVRfU1FVQVJFX0xFTkdUSDsgLy8gSW4gc2NyZWVuIGNvb3Jkc1xuXG5mdW5jdGlvbiBBcmVhQnVpbGRlckNoYWxsZW5nZUZhY3RvcnkoKSB7XG5cbiAgY29uc3QgcmFuZG9tID0gZG90UmFuZG9tO1xuXG4gIC8vIEJhc2ljIHNoYXBlcyB1c2VkIGluIHRoZSAnY3JlYXRvciBraXRzJy5cbiAgY29uc3QgVU5JVF9TUVVBUkVfU0hBUEUgPSBuZXcgU2hhcGUoKVxuICAgIC5tb3ZlVG8oIDAsIDAgKVxuICAgIC5saW5lVG8oIFVOSVRfU1FVQVJFX0xFTkdUSCwgMCApXG4gICAgLmxpbmVUbyggVU5JVF9TUVVBUkVfTEVOR1RILCBVTklUX1NRVUFSRV9MRU5HVEggKVxuICAgIC5saW5lVG8oIDAsIFVOSVRfU1FVQVJFX0xFTkdUSCApXG4gICAgLmNsb3NlKClcbiAgICAubWFrZUltbXV0YWJsZSgpO1xuICBjb25zdCBIT1JJWk9OVEFMX0RPVUJMRV9TUVVBUkVfU0hBUEUgPSBuZXcgU2hhcGUoKVxuICAgIC5tb3ZlVG8oIDAsIDAgKVxuICAgIC5saW5lVG8oIFVOSVRfU1FVQVJFX0xFTkdUSCAqIDIsIDAgKVxuICAgIC5saW5lVG8oIFVOSVRfU1FVQVJFX0xFTkdUSCAqIDIsIFVOSVRfU1FVQVJFX0xFTkdUSCApXG4gICAgLmxpbmVUbyggMCwgVU5JVF9TUVVBUkVfTEVOR1RIIClcbiAgICAuY2xvc2UoKVxuICAgIC5tYWtlSW1tdXRhYmxlKCk7XG4gIGNvbnN0IFZFUlRJQ0FMX0RPVUJMRV9TUVVBUkVfU0hBUEUgPSBuZXcgU2hhcGUoKVxuICAgIC5tb3ZlVG8oIDAsIDAgKVxuICAgIC5saW5lVG8oIFVOSVRfU1FVQVJFX0xFTkdUSCwgMCApXG4gICAgLmxpbmVUbyggVU5JVF9TUVVBUkVfTEVOR1RILCBVTklUX1NRVUFSRV9MRU5HVEggKiAyIClcbiAgICAubGluZVRvKCAwLCBVTklUX1NRVUFSRV9MRU5HVEggKiAyIClcbiAgICAuY2xvc2UoKVxuICAgIC5tYWtlSW1tdXRhYmxlKCk7XG4gIGNvbnN0IFFVQURfU1FVQVJFX1NIQVBFID0gbmV3IFNoYXBlKClcbiAgICAubW92ZVRvKCAwLCAwIClcbiAgICAubGluZVRvKCBVTklUX1NRVUFSRV9MRU5HVEggKiAyLCAwIClcbiAgICAubGluZVRvKCBVTklUX1NRVUFSRV9MRU5HVEggKiAyLCBVTklUX1NRVUFSRV9MRU5HVEggKiAyIClcbiAgICAubGluZVRvKCAwLCBVTklUX1NRVUFSRV9MRU5HVEggKiAyIClcbiAgICAuY2xvc2UoKVxuICAgIC5tYWtlSW1tdXRhYmxlKCk7XG4gIGNvbnN0IFJJR0hUX0JPVFRPTV9UUklBTkdMRV9TSEFQRSA9IG5ldyBTaGFwZSgpXG4gICAgLm1vdmVUbyggVU5JVF9TUVVBUkVfTEVOR1RILCAwIClcbiAgICAubGluZVRvKCBVTklUX1NRVUFSRV9MRU5HVEgsIFVOSVRfU1FVQVJFX0xFTkdUSCApXG4gICAgLmxpbmVUbyggMCwgVU5JVF9TUVVBUkVfTEVOR1RIIClcbiAgICAubGluZVRvKCBVTklUX1NRVUFSRV9MRU5HVEgsIDAgKVxuICAgIC5jbG9zZSgpXG4gICAgLm1ha2VJbW11dGFibGUoKTtcbiAgY29uc3QgTEVGVF9CT1RUT01fVFJJQU5HTEVfU0hBUEUgPSBuZXcgU2hhcGUoKVxuICAgIC5tb3ZlVG8oIDAsIDAgKVxuICAgIC5saW5lVG8oIFVOSVRfU1FVQVJFX0xFTkdUSCwgVU5JVF9TUVVBUkVfTEVOR1RIIClcbiAgICAubGluZVRvKCAwLCBVTklUX1NRVUFSRV9MRU5HVEggKVxuICAgIC5saW5lVG8oIDAsIDAgKVxuICAgIC5jbG9zZSgpXG4gICAgLm1ha2VJbW11dGFibGUoKTtcbiAgY29uc3QgUklHSFRfVE9QX1RSSUFOR0xFX1NIQVBFID0gbmV3IFNoYXBlKClcbiAgICAubW92ZVRvKCAwLCAwIClcbiAgICAubGluZVRvKCBVTklUX1NRVUFSRV9MRU5HVEgsIDAgKVxuICAgIC5saW5lVG8oIFVOSVRfU1FVQVJFX0xFTkdUSCwgVU5JVF9TUVVBUkVfTEVOR1RIIClcbiAgICAubGluZVRvKCAwLCAwIClcbiAgICAuY2xvc2UoKVxuICAgIC5tYWtlSW1tdXRhYmxlKCk7XG4gIGNvbnN0IExFRlRfVE9QX1RSSUFOR0xFX1NIQVBFID0gbmV3IFNoYXBlKClcbiAgICAubW92ZVRvKCAwLCAwIClcbiAgICAubGluZVRvKCBVTklUX1NRVUFSRV9MRU5HVEgsIDAgKVxuICAgIC5saW5lVG8oIDAsIFVOSVRfU1FVQVJFX0xFTkdUSCApXG4gICAgLmxpbmVUbyggMCwgMCApXG4gICAgLmNsb3NlKClcbiAgICAubWFrZUltbXV0YWJsZSgpO1xuXG4gIC8vIFNoYXBlIGtpdCB3aXRoIGEgc2V0IG9mIGJhc2ljIHNoYXBlcyBhbmQgYSBkZWZhdWx0IGNvbG9yLlxuICBjb25zdCBCQVNJQ19SRUNUQU5HTEVTX1NIQVBFX0tJVCA9IFtcbiAgICB7XG4gICAgICBzaGFwZTogVU5JVF9TUVVBUkVfU0hBUEUsXG4gICAgICBjb2xvcjogQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuR1JFRU5JU0hfQ09MT1JcbiAgICB9LFxuICAgIHtcbiAgICAgIHNoYXBlOiBIT1JJWk9OVEFMX0RPVUJMRV9TUVVBUkVfU0hBUEUsXG4gICAgICBjb2xvcjogQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuR1JFRU5JU0hfQ09MT1JcbiAgICB9LFxuICAgIHtcbiAgICAgIHNoYXBlOiBWRVJUSUNBTF9ET1VCTEVfU1FVQVJFX1NIQVBFLFxuICAgICAgY29sb3I6IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLkdSRUVOSVNIX0NPTE9SXG4gICAgfSxcbiAgICB7XG4gICAgICBzaGFwZTogUVVBRF9TUVVBUkVfU0hBUEUsXG4gICAgICBjb2xvcjogQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuR1JFRU5JU0hfQ09MT1JcbiAgICB9XG4gIF07XG5cbiAgY29uc3QgUkVDVEFOR0xFU19BTkRfVFJJQU5HTEVTX1NIQVBFX0tJVCA9IFtcbiAgICB7XG4gICAgICBzaGFwZTogSE9SSVpPTlRBTF9ET1VCTEVfU1FVQVJFX1NIQVBFLFxuICAgICAgY29sb3I6IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLkdSRUVOSVNIX0NPTE9SXG4gICAgfSxcbiAgICB7XG4gICAgICBzaGFwZTogVU5JVF9TUVVBUkVfU0hBUEUsXG4gICAgICBjb2xvcjogQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuR1JFRU5JU0hfQ09MT1JcbiAgICB9LFxuICAgIHtcbiAgICAgIHNoYXBlOiBWRVJUSUNBTF9ET1VCTEVfU1FVQVJFX1NIQVBFLFxuICAgICAgY29sb3I6IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLkdSRUVOSVNIX0NPTE9SXG4gICAgfSxcbiAgICB7XG4gICAgICBzaGFwZTogTEVGVF9CT1RUT01fVFJJQU5HTEVfU0hBUEUsXG4gICAgICBjb2xvcjogQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuR1JFRU5JU0hfQ09MT1JcbiAgICB9LFxuICAgIHtcbiAgICAgIHNoYXBlOiBMRUZUX1RPUF9UUklBTkdMRV9TSEFQRSxcbiAgICAgIGNvbG9yOiBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5HUkVFTklTSF9DT0xPUlxuICAgIH0sXG4gICAge1xuICAgICAgc2hhcGU6IFJJR0hUX0JPVFRPTV9UUklBTkdMRV9TSEFQRSxcbiAgICAgIGNvbG9yOiBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5HUkVFTklTSF9DT0xPUlxuICAgIH0sXG4gICAge1xuICAgICAgc2hhcGU6IFJJR0hUX1RPUF9UUklBTkdMRV9TSEFQRSxcbiAgICAgIGNvbG9yOiBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5HUkVFTklTSF9DT0xPUlxuICAgIH1cbiAgXTtcblxuICAvLyBDb2xvciBjaG9vc2VyIGZvciBzZWxlY3RpbmcgcmFuZG9taXplZCBjb2xvcnMgZm9yICdmaW5kIHRoZSBhcmVhJyBjaGFsbGVuZ2VzLlxuICBjb25zdCBGSU5EX1RIRV9BUkVBX0NPTE9SX0NIT09TRVIgPSB7XG4gICAgY29sb3JMaXN0OiByYW5kb20uc2h1ZmZsZSggW1xuICAgICAgbmV3IENvbG9yKCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5QQUxFX0JMVUVfQ09MT1IgKSxcbiAgICAgIG5ldyBDb2xvciggQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuUElOS0lTSF9DT0xPUiApLFxuICAgICAgbmV3IENvbG9yKCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5QVVJQTElTSF9DT0xPUiApLFxuICAgICAgbmV3IENvbG9yKCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5PUkFOR0lTSF9DT0xPUiApLFxuICAgICAgbmV3IENvbG9yKCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5EQVJLX0dSRUVOX0NPTE9SIClcbiAgICBdICksXG4gICAgaW5kZXg6IDAsXG4gICAgbmV4dENvbG9yOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICggdGhpcy5pbmRleCA+PSB0aGlzLmNvbG9yTGlzdC5sZW5ndGggKSB7XG4gICAgICAgIC8vIFRpbWUgdG8gc2h1ZmZsZSB0aGUgY29sb3IgbGlzdC4gIE1ha2Ugc3VyZSB0aGF0IHdoZW4gd2UgZG8sIHRoZSBjb2xvciB0aGF0IHdhcyBhdCB0aGUgZW5kIG9mIHRoZSBwcmV2aW91c1xuICAgICAgICAvLyBsaXN0IGlzbid0IGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhpcyBvbmUsIG9yIHdlJ2xsIGdldCB0d28gb2YgdGhlIHNhbWUgY29sb3JzIGluIGEgcm93LlxuICAgICAgICBjb25zdCBsYXN0Q29sb3IgPSB0aGlzLmNvbG9yTGlzdFsgdGhpcy5jb2xvckxpc3QubGVuZ3RoIC0gMSBdO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgdGhpcy5jb2xvckxpc3QgPSByYW5kb20uc2h1ZmZsZSggdGhpcy5jb2xvckxpc3QgKTtcbiAgICAgICAgfSB3aGlsZSAoIHRoaXMuY29sb3JMaXN0WyAwIF0gPT09IGxhc3RDb2xvciApO1xuXG4gICAgICAgIC8vIFJlc2V0IHRoZSBpbmRleC5cbiAgICAgICAgdGhpcy5pbmRleCA9IDA7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5jb2xvckxpc3RbIHRoaXMuaW5kZXgrKyBdO1xuICAgIH1cbiAgfTtcblxuICAvLyBDb2xvciBjaG9vc2VyIGZvciBzZWxlY3RpbmcgcmFuZG9taXplZCBjb2xvcnMgZm9yICdidWlsZCBpdCcgc3R5bGUgY2hhbGxlbmdlcy5cbiAgY29uc3QgQlVJTERfSVRfQ09MT1JfQ0hPT1NFUiA9IHtcbiAgICBjb2xvckxpc3Q6IHJhbmRvbS5zaHVmZmxlKCBbXG4gICAgICBuZXcgQ29sb3IoIEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLkdSRUVOSVNIX0NPTE9SICksXG4gICAgICBuZXcgQ29sb3IoIEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLlBJTktJU0hfQ09MT1IgKSxcbiAgICAgIG5ldyBDb2xvciggQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuT1JBTkdJU0hfQ09MT1IgKSxcbiAgICAgIG5ldyBDb2xvciggQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuUEFMRV9CTFVFX0NPTE9SIClcbiAgICBdICksXG4gICAgaW5kZXg6IDAsXG4gICAgbmV4dENvbG9yOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICggdGhpcy5pbmRleCA+PSB0aGlzLmNvbG9yTGlzdC5sZW5ndGggKSB7XG4gICAgICAgIC8vIFRpbWUgdG8gc2h1ZmZsZSB0aGUgY29sb3IgbGlzdC4gIE1ha2Ugc3VyZSB0aGF0IHdoZW4gd2UgZG8sIHRoZSBjb2xvciB0aGF0IHdhcyBhdCB0aGUgZW5kIG9mIHRoZSBwcmV2aW91c1xuICAgICAgICAvLyBsaXN0IGlzbid0IGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhpcyBvbmUsIG9yIHdlJ2xsIGdldCB0d28gb2YgdGhlIHNhbWUgY29sb3JzIGluIGEgcm93LlxuICAgICAgICBjb25zdCBsYXN0Q29sb3IgPSB0aGlzLmNvbG9yTGlzdFsgdGhpcy5jb2xvckxpc3QubGVuZ3RoIC0gMSBdO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgdGhpcy5jb2xvckxpc3QgPSByYW5kb20uc2h1ZmZsZSggdGhpcy5jb2xvckxpc3QgKTtcbiAgICAgICAgfSB3aGlsZSAoIHRoaXMuY29sb3JMaXN0WyAwIF0gPT09IGxhc3RDb2xvciApO1xuXG4gICAgICAgIC8vIFJlc2V0IHRoZSBpbmRleC5cbiAgICAgICAgdGhpcy5pbmRleCA9IDA7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5jb2xvckxpc3RbIHRoaXMuaW5kZXgrKyBdO1xuICAgIH1cbiAgfTtcblxuICAvLyBDb2xvciBwYWlyIGNob29zZXIsIHVzZWQgZm9yIHNlbGVjdGluZyByYW5kb21pemVkIGNvbG9ycyBmb3IgdHdvIHRvbmUgJ2J1aWxkIGl0JyBjaGFsbGVuZ2VzLlxuICBjb25zdCBDT0xPUl9QQUlSX0NIT09TRVIgPSB7XG4gICAgY29sb3JQYWlyTGlzdDogcmFuZG9tLnNodWZmbGUoIFtcbiAgICAgIHtcbiAgICAgICAgY29sb3IxOiBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5HUkVFTklTSF9DT0xPUixcbiAgICAgICAgY29sb3IyOiBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5EQVJLX0dSRUVOX0NPTE9SXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBjb2xvcjE6IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLlBVUlBMSVNIX0NPTE9SLFxuICAgICAgICBjb2xvcjI6IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLkRBUktfUFVSUExFX0NPTE9SXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBjb2xvcjE6IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLlBBTEVfQkxVRV9DT0xPUixcbiAgICAgICAgY29sb3IyOiBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5EQVJLX0JMVUVfQ09MT1JcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGNvbG9yMTogQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuUElOS0lTSF9DT0xPUixcbiAgICAgICAgY29sb3IyOiBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5QVVJQTEVfUElOS19DT0xPUlxuICAgICAgfVxuICAgIF0gKSxcbiAgICBpbmRleDogMCxcbiAgICBuZXh0Q29sb3JQYWlyOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICggdGhpcy5pbmRleCA+PSB0aGlzLmNvbG9yUGFpckxpc3QubGVuZ3RoICkge1xuICAgICAgICAvLyBUaW1lIHRvIHNodWZmbGUgdGhlIGxpc3QuXG4gICAgICAgIGNvbnN0IGxhc3RDb2xvclBhaXIgPSB0aGlzLmNvbG9yUGFpckxpc3RbIHRoaXMuY29sb3JQYWlyTGlzdC5sZW5ndGggLSAxIF07XG4gICAgICAgIGRvIHtcbiAgICAgICAgICB0aGlzLmNvbG9yUGFpckxpc3QgPSByYW5kb20uc2h1ZmZsZSggdGhpcy5jb2xvclBhaXJMaXN0ICk7XG4gICAgICAgIH0gd2hpbGUgKCB0aGlzLmNvbG9yUGFpckxpc3RbIDAgXSA9PT0gbGFzdENvbG9yUGFpciApO1xuXG4gICAgICAgIC8vIFJlc2V0IHRoZSBpbmRleC5cbiAgICAgICAgdGhpcy5pbmRleCA9IDA7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5jb2xvclBhaXJMaXN0WyB0aGlzLmluZGV4KysgXTtcbiAgICB9XG4gIH07XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0gcHJpdmF0ZSBmdW5jdGlvbnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gU2VsZWN0IGEgcmFuZG9tIGVsZW1lbnQgZnJvbSBhbiBhcnJheVxuICBmdW5jdGlvbiByYW5kb21FbGVtZW50KCBhcnJheSApIHtcbiAgICByZXR1cm4gYXJyYXlbIE1hdGguZmxvb3IoIHJhbmRvbS5uZXh0RG91YmxlKCkgKiBhcnJheS5sZW5ndGggKSBdO1xuICB9XG5cbiAgLy8gQ3JlYXRlIGEgc29sdXRpb24gc3BlYyAoYS5rLmEuIGFuIGV4YW1wbGUgc29sdXRpb24pIHRoYXQgcmVwcmVzZW50cyBhIHJlY3RhbmdsZSB3aXRoIHRoZSBzcGVjaWZpZWQgb3JpZ2luIGFuZCBzaXplLlxuICBmdW5jdGlvbiBjcmVhdGVNb25vY2hyb21lUmVjdGFuZ3VsYXJTb2x1dGlvblNwZWMoIHgsIHksIHdpZHRoLCBoZWlnaHQsIGNvbG9yICkge1xuICAgIGNvbnN0IHNvbHV0aW9uU3BlYyA9IFtdO1xuICAgIGZvciAoIGxldCBjb2x1bW4gPSAwOyBjb2x1bW4gPCB3aWR0aDsgY29sdW1uKysgKSB7XG4gICAgICBmb3IgKCBsZXQgcm93ID0gMDsgcm93IDwgaGVpZ2h0OyByb3crKyApIHtcbiAgICAgICAgc29sdXRpb25TcGVjLnB1c2goIHtcbiAgICAgICAgICBjZWxsQ29sdW1uOiBjb2x1bW4gKyB4LFxuICAgICAgICAgIGNlbGxSb3c6IHJvdyArIHksXG4gICAgICAgICAgY29sb3I6IGNvbG9yXG4gICAgICAgIH0gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNvbHV0aW9uU3BlYztcbiAgfVxuXG4gIC8vIENyZWF0ZSBhIHNvbHV0aW9uIHNwZWMgKGEuay5hLiBhbiBleGFtcGxlIHNvbHV0aW9uKSBmb3IgYSB0d28tdG9uZSBjaGFsbGVuZ2VcbiAgZnVuY3Rpb24gY3JlYXRlVHdvQ29sb3JSZWN0YW5ndWxhclNvbHV0aW9uU3BlYyggeCwgeSwgd2lkdGgsIGhlaWdodCwgY29sb3IxLCBjb2xvcjIsIGNvbG9yMXByb3BvcnRpb24gKSB7XG4gICAgY29uc3Qgc29sdXRpb25TcGVjID0gW107XG4gICAgZm9yICggbGV0IHJvdyA9IDA7IHJvdyA8IGhlaWdodDsgcm93KysgKSB7XG4gICAgICBmb3IgKCBsZXQgY29sdW1uID0gMDsgY29sdW1uIDwgd2lkdGg7IGNvbHVtbisrICkge1xuICAgICAgICBzb2x1dGlvblNwZWMucHVzaCgge1xuICAgICAgICAgIGNlbGxDb2x1bW46IGNvbHVtbiArIHgsXG4gICAgICAgICAgY2VsbFJvdzogcm93ICsgeSxcbiAgICAgICAgICBjb2xvcjogKCByb3cgKiB3aWR0aCArIGNvbHVtbiApIC8gKCB3aWR0aCAqIGhlaWdodCApIDwgY29sb3IxcHJvcG9ydGlvbiA/IGNvbG9yMSA6IGNvbG9yMlxuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzb2x1dGlvblNwZWM7XG4gIH1cblxuICAvLyBGdW5jdGlvbiBmb3IgY3JlYXRpbmcgYSAnc2hhcGUga2l0JyBvZiB0aGUgYmFzaWMgc2hhcGVzIG9mIHRoZSBzcGVjaWZpZWQgY29sb3IuXG4gIGZ1bmN0aW9uIGNyZWF0ZUJhc2ljUmVjdGFuZ2xlc1NoYXBlS2l0KCBjb2xvciApIHtcbiAgICBjb25zdCBraXQgPSBbXTtcbiAgICBCQVNJQ19SRUNUQU5HTEVTX1NIQVBFX0tJVC5mb3JFYWNoKCBraXRFbGVtZW50ID0+IHtcbiAgICAgIGtpdC5wdXNoKCB7IHNoYXBlOiBraXRFbGVtZW50LnNoYXBlLCBjb2xvcjogY29sb3IgfSApO1xuICAgIH0gKTtcbiAgICByZXR1cm4ga2l0O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlVHdvVG9uZVJlY3RhbmdsZUJ1aWxkS2l0KCBjb2xvcjEsIGNvbG9yMiApIHtcbiAgICBjb25zdCBraXQgPSBbXTtcbiAgICBCQVNJQ19SRUNUQU5HTEVTX1NIQVBFX0tJVC5mb3JFYWNoKCBraXRFbGVtZW50ID0+IHtcbiAgICAgIGNvbnN0IGNvbG9yMUVsZW1lbnQgPSB7XG4gICAgICAgIHNoYXBlOiBraXRFbGVtZW50LnNoYXBlLFxuICAgICAgICBjb2xvcjogY29sb3IxXG4gICAgICB9O1xuICAgICAga2l0LnB1c2goIGNvbG9yMUVsZW1lbnQgKTtcbiAgICAgIGNvbnN0IGNvbG9yMkVsZW1lbnQgPSB7XG4gICAgICAgIHNoYXBlOiBraXRFbGVtZW50LnNoYXBlLFxuICAgICAgICBjb2xvcjogY29sb3IyXG4gICAgICB9O1xuICAgICAga2l0LnB1c2goIGNvbG9yMkVsZW1lbnQgKTtcbiAgICB9ICk7XG4gICAgcmV0dXJuIGtpdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZsaXBQZXJpbWV0ZXJQb2ludHNIb3Jpem9udGFsbHkoIHBlcmltZXRlclBvaW50TGlzdCApIHtcbiAgICBjb25zdCByZWZsZWN0ZWRQb2ludHMgPSBbXTtcbiAgICBsZXQgbWluWCA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICBsZXQgbWF4WCA9IE51bWJlci5ORUdBVElWRV9JTkZJTklUWTtcbiAgICBwZXJpbWV0ZXJQb2ludExpc3QuZm9yRWFjaCggcG9pbnQgPT4ge1xuICAgICAgbWluWCA9IE1hdGgubWluKCBwb2ludC54LCBtaW5YICk7XG4gICAgICBtYXhYID0gTWF0aC5tYXgoIHBvaW50LngsIG1heFggKTtcbiAgICB9ICk7XG4gICAgcGVyaW1ldGVyUG9pbnRMaXN0LmZvckVhY2goIHBvaW50ID0+IHtcbiAgICAgIHJlZmxlY3RlZFBvaW50cy5wdXNoKCBuZXcgVmVjdG9yMiggLTEgKiAoIHBvaW50LnggLSBtaW5YIC0gbWF4WCApLCBwb2ludC55ICkgKTtcbiAgICB9ICk7XG4gICAgcmV0dXJuIHJlZmxlY3RlZFBvaW50cztcbiAgfVxuXG4gIGZ1bmN0aW9uIGZsaXBQZXJpbWV0ZXJQb2ludHNWZXJ0aWNhbGx5KCBwZXJpbWV0ZXJQb2ludExpc3QgKSB7XG4gICAgY29uc3QgcmVmbGVjdGVkUG9pbnRzID0gW107XG4gICAgbGV0IG1pblkgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG4gICAgbGV0IG1heFkgPSBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFk7XG4gICAgcGVyaW1ldGVyUG9pbnRMaXN0LmZvckVhY2goIHBvaW50ID0+IHtcbiAgICAgIG1pblkgPSBNYXRoLm1pbiggcG9pbnQueSwgbWluWSApO1xuICAgICAgbWF4WSA9IE1hdGgubWF4KCBwb2ludC55LCBtYXhZICk7XG4gICAgfSApO1xuICAgIHBlcmltZXRlclBvaW50TGlzdC5mb3JFYWNoKCBwb2ludCA9PiB7XG4gICAgICByZWZsZWN0ZWRQb2ludHMucHVzaCggbmV3IFZlY3RvcjIoIHBvaW50LngsIC0xICogKCBwb2ludC55IC0gbWluWSAtIG1heFkgKSApICk7XG4gICAgfSApO1xuICAgIHJldHVybiByZWZsZWN0ZWRQb2ludHM7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVSZWN0YW5ndWxhclBlcmltZXRlclNoYXBlKCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBmaWxsQ29sb3IgKSB7XG4gICAgcmV0dXJuIG5ldyBQZXJpbWV0ZXJTaGFwZShcbiAgICAgIC8vIEV4dGVyaW9yIHBlcmltZXRlcnNcbiAgICAgIFtcbiAgICAgICAgW1xuICAgICAgICAgIG5ldyBWZWN0b3IyKCB4LCB5ICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIHggKyB3aWR0aCwgeSApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCB4ICsgd2lkdGgsIHkgKyBoZWlnaHQgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggeCwgeSArIGhlaWdodCApXG4gICAgICAgIF1cbiAgICAgIF0sXG5cbiAgICAgIC8vIEludGVyaW9yIHBlcmltZXRlcnNcbiAgICAgIFtdLFxuXG4gICAgICAvLyBVbml0IHNpemVcbiAgICAgIFVOSVRfU1FVQVJFX0xFTkdUSCxcblxuICAgICAgLy8gY29sb3JcbiAgICAgIHtcbiAgICAgICAgZmlsbENvbG9yOiBmaWxsQ29sb3IsXG4gICAgICAgIGVkZ2VDb2xvcjogZmlsbENvbG9yLmNvbG9yVXRpbHNEYXJrZXIoIEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLlBFUklNRVRFUl9EQVJLRU5fRkFDVE9SIClcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlTFNoYXBlZFBlcmltZXRlclNoYXBlKCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBtaXNzaW5nQ29ybmVyLCB3aWR0aE1pc3NpbmcsIGhlaWdodE1pc3NpbmcsIGZpbGxDb2xvciApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB3aWR0aCA+IHdpZHRoTWlzc2luZyAmJiBoZWlnaHQgPiBoZWlnaHRNaXNzaW5nLCAnSW52YWxpZCBwYXJhbWV0ZXJzJyApO1xuXG4gICAgbGV0IHBlcmltZXRlclBvaW50cyA9IFtcbiAgICAgIG5ldyBWZWN0b3IyKCB4ICsgd2lkdGhNaXNzaW5nLCB5ICksXG4gICAgICBuZXcgVmVjdG9yMiggeCArIHdpZHRoLCB5ICksXG4gICAgICBuZXcgVmVjdG9yMiggeCArIHdpZHRoLCB5ICsgaGVpZ2h0ICksXG4gICAgICBuZXcgVmVjdG9yMiggeCwgeSArIGhlaWdodCApLFxuICAgICAgbmV3IFZlY3RvcjIoIHgsIHkgKyBoZWlnaHRNaXNzaW5nICksXG4gICAgICBuZXcgVmVjdG9yMiggeCArIHdpZHRoTWlzc2luZywgeSArIGhlaWdodE1pc3NpbmcgKVxuICAgIF07XG5cbiAgICBpZiAoIG1pc3NpbmdDb3JuZXIgPT09ICdyaWdodFRvcCcgfHwgbWlzc2luZ0Nvcm5lciA9PT0gJ3JpZ2h0Qm90dG9tJyApIHtcbiAgICAgIHBlcmltZXRlclBvaW50cyA9IGZsaXBQZXJpbWV0ZXJQb2ludHNIb3Jpem9udGFsbHkoIHBlcmltZXRlclBvaW50cyApO1xuICAgIH1cbiAgICBpZiAoIG1pc3NpbmdDb3JuZXIgPT09ICdsZWZ0Qm90dG9tJyB8fCBtaXNzaW5nQ29ybmVyID09PSAncmlnaHRCb3R0b20nICkge1xuICAgICAgcGVyaW1ldGVyUG9pbnRzID0gZmxpcFBlcmltZXRlclBvaW50c1ZlcnRpY2FsbHkoIHBlcmltZXRlclBvaW50cyApO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUGVyaW1ldGVyU2hhcGUoIFsgcGVyaW1ldGVyUG9pbnRzIF0sIFtdLCBVTklUX1NRVUFSRV9MRU5HVEgsIHtcbiAgICAgICAgZmlsbENvbG9yOiBmaWxsQ29sb3IsXG4gICAgICAgIGVkZ2VDb2xvcjogZmlsbENvbG9yLmNvbG9yVXRpbHNEYXJrZXIoIEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLlBFUklNRVRFUl9EQVJLRU5fRkFDVE9SIClcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgLy8gQ3JlYXRlIGEgcGVyaW1ldGVyIHNoYXBlIHdpdGggYSBjdXRvdXQgaW4gdGhlIHRvcCwgYm90dG9tLCBsZWZ0LCBvciByaWdodCBzaWRlLlxuICBmdW5jdGlvbiBjcmVhdGVVU2hhcGVkUGVyaW1ldGVyU2hhcGUoIHgsIHksIHdpZHRoLCBoZWlnaHQsIHNpZGVXaXRoQ3V0b3V0LCBjdXRvdXRXaWR0aCwgY3V0b3V0SGVpZ2h0LCBjdXRvdXRPZmZzZXQsIGZpbGxDb2xvciApIHtcbiAgICBsZXQgcGVyaW1ldGVyUG9pbnRzID0gWyBuZXcgVmVjdG9yMiggMCwgMCApLCBuZXcgVmVjdG9yMiggMCwgMCApLCBuZXcgVmVjdG9yMiggMCwgMCApLCBuZXcgVmVjdG9yMiggMCwgMCApLCBuZXcgVmVjdG9yMiggMCwgMCApLCBuZXcgVmVjdG9yMiggMCwgMCApLCBuZXcgVmVjdG9yMiggMCwgMCApLCBuZXcgVmVjdG9yMiggMCwgMCApIF07XG5cbiAgICBpZiAoIHNpZGVXaXRoQ3V0b3V0ID09PSAnbGVmdCcgfHwgc2lkZVdpdGhDdXRvdXQgPT09ICdyaWdodCcgKSB7XG4gICAgICBwZXJpbWV0ZXJQb2ludHNbIDAgXS5zZXRYWSggeCwgeSApO1xuICAgICAgcGVyaW1ldGVyUG9pbnRzWyAxIF0uc2V0WFkoIHggKyB3aWR0aCwgeSApO1xuICAgICAgcGVyaW1ldGVyUG9pbnRzWyAyIF0uc2V0WFkoIHggKyB3aWR0aCwgeSArIGhlaWdodCApO1xuICAgICAgcGVyaW1ldGVyUG9pbnRzWyAzIF0uc2V0WFkoIHgsIHkgKyBoZWlnaHQgKTtcbiAgICAgIHBlcmltZXRlclBvaW50c1sgNCBdLnNldFhZKCB4LCB5ICsgY3V0b3V0T2Zmc2V0ICsgY3V0b3V0SGVpZ2h0ICk7XG4gICAgICBwZXJpbWV0ZXJQb2ludHNbIDUgXS5zZXRYWSggeCArIGN1dG91dFdpZHRoLCB5ICsgY3V0b3V0T2Zmc2V0ICsgY3V0b3V0SGVpZ2h0ICk7XG4gICAgICBwZXJpbWV0ZXJQb2ludHNbIDYgXS5zZXRYWSggeCArIGN1dG91dFdpZHRoLCB5ICsgY3V0b3V0T2Zmc2V0ICk7XG4gICAgICBwZXJpbWV0ZXJQb2ludHNbIDcgXS5zZXRYWSggeCwgeSArIGN1dG91dE9mZnNldCApO1xuICAgICAgaWYgKCBzaWRlV2l0aEN1dG91dCA9PT0gJ3JpZ2h0JyApIHtcbiAgICAgICAgcGVyaW1ldGVyUG9pbnRzID0gZmxpcFBlcmltZXRlclBvaW50c0hvcml6b250YWxseSggcGVyaW1ldGVyUG9pbnRzICk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcGVyaW1ldGVyUG9pbnRzWyAwIF0uc2V0WFkoIHgsIHkgKTtcbiAgICAgIHBlcmltZXRlclBvaW50c1sgMSBdLnNldFhZKCB4ICsgY3V0b3V0T2Zmc2V0LCB5ICk7XG4gICAgICBwZXJpbWV0ZXJQb2ludHNbIDIgXS5zZXRYWSggeCArIGN1dG91dE9mZnNldCwgeSArIGN1dG91dEhlaWdodCApO1xuICAgICAgcGVyaW1ldGVyUG9pbnRzWyAzIF0uc2V0WFkoIHggKyBjdXRvdXRPZmZzZXQgKyBjdXRvdXRXaWR0aCwgeSArIGN1dG91dEhlaWdodCApO1xuICAgICAgcGVyaW1ldGVyUG9pbnRzWyA0IF0uc2V0WFkoIHggKyBjdXRvdXRPZmZzZXQgKyBjdXRvdXRXaWR0aCwgeSApO1xuICAgICAgcGVyaW1ldGVyUG9pbnRzWyA1IF0uc2V0WFkoIHggKyB3aWR0aCwgeSApO1xuICAgICAgcGVyaW1ldGVyUG9pbnRzWyA2IF0uc2V0WFkoIHggKyB3aWR0aCwgeSArIGhlaWdodCApO1xuICAgICAgcGVyaW1ldGVyUG9pbnRzWyA3IF0uc2V0WFkoIHgsIHkgKyBoZWlnaHQgKTtcbiAgICAgIGlmICggc2lkZVdpdGhDdXRvdXQgPT09ICdib3R0b20nICkge1xuICAgICAgICBwZXJpbWV0ZXJQb2ludHMgPSBmbGlwUGVyaW1ldGVyUG9pbnRzVmVydGljYWxseSggcGVyaW1ldGVyUG9pbnRzICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQZXJpbWV0ZXJTaGFwZSggWyBwZXJpbWV0ZXJQb2ludHMgXSwgW10sIFVOSVRfU1FVQVJFX0xFTkdUSCwge1xuICAgICAgZmlsbENvbG9yOiBmaWxsQ29sb3IsXG4gICAgICBlZGdlQ29sb3I6IGZpbGxDb2xvci5jb2xvclV0aWxzRGFya2VyKCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5QRVJJTUVURVJfREFSS0VOX0ZBQ1RPUiApXG4gICAgfSApO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlUGVyaW1ldGVyU2hhcGVXaXRoSG9sZSggeCwgeSwgd2lkdGgsIGhlaWdodCwgaG9sZVdpZHRoLCBob2xlSGVpZ2h0LCBob2xlWE9mZnNldCwgaG9sZVlPZmZzZXQsIGZpbGxDb2xvciApIHtcbiAgICBjb25zdCBleHRlcmlvclBlcmltZXRlclBvaW50cyA9IFtcbiAgICAgIG5ldyBWZWN0b3IyKCB4LCB5ICksXG4gICAgICBuZXcgVmVjdG9yMiggeCArIHdpZHRoLCB5ICksXG4gICAgICBuZXcgVmVjdG9yMiggeCArIHdpZHRoLCB5ICsgaGVpZ2h0ICksXG4gICAgICBuZXcgVmVjdG9yMiggeCwgeSArIGhlaWdodCApXG4gICAgXTtcbiAgICBjb25zdCBpbnRlcmlvclBlcmltZXRlclBvaW50cyA9IFtcbiAgICAgIC8vIEhhdmUgdG8gZHJhdyBob2xlIGluIG9wcG9zaXRlIGRpcmVjdGlvbiBmb3IgaXQgdG8gYXBwZWFyLlxuICAgICAgbmV3IFZlY3RvcjIoIHggKyBob2xlWE9mZnNldCwgeSArIGhvbGVZT2Zmc2V0ICksXG4gICAgICBuZXcgVmVjdG9yMiggeCArIGhvbGVYT2Zmc2V0LCB5ICsgaG9sZVlPZmZzZXQgKyBob2xlSGVpZ2h0ICksXG4gICAgICBuZXcgVmVjdG9yMiggeCArIGhvbGVYT2Zmc2V0ICsgaG9sZVdpZHRoLCB5ICsgaG9sZVlPZmZzZXQgKyBob2xlSGVpZ2h0ICksXG4gICAgICBuZXcgVmVjdG9yMiggeCArIGhvbGVYT2Zmc2V0ICsgaG9sZVdpZHRoLCB5ICsgaG9sZVlPZmZzZXQgKVxuICAgIF07XG5cbiAgICByZXR1cm4gbmV3IFBlcmltZXRlclNoYXBlKCBbIGV4dGVyaW9yUGVyaW1ldGVyUG9pbnRzIF0sIFsgaW50ZXJpb3JQZXJpbWV0ZXJQb2ludHMgXSwgVU5JVF9TUVVBUkVfTEVOR1RILCB7XG4gICAgICBmaWxsQ29sb3I6IGZpbGxDb2xvcixcbiAgICAgIGVkZ2VDb2xvcjogZmlsbENvbG9yLmNvbG9yVXRpbHNEYXJrZXIoIEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLlBFUklNRVRFUl9EQVJLRU5fRkFDVE9SIClcbiAgICB9ICk7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVQZXJpbWV0ZXJTaGFwZVNsYW50ZWRIeXBvdGVudXNlUmlnaHRJc29zY2VsZXNUcmlhbmdsZSggeCwgeSwgZWRnZUxlbmd0aCwgY29ybmVyUG9zaXRpb24sIGZpbGxDb2xvciApIHtcbiAgICBsZXQgcGVyaW1ldGVyUG9pbnRzID0gWyBuZXcgVmVjdG9yMiggeCwgeSApLCBuZXcgVmVjdG9yMiggeCArIGVkZ2VMZW5ndGgsIHkgKSwgbmV3IFZlY3RvcjIoIHgsIHkgKyBlZGdlTGVuZ3RoICkgXTtcbiAgICBpZiAoIGNvcm5lclBvc2l0aW9uID09PSAncmlnaHRUb3AnIHx8IGNvcm5lclBvc2l0aW9uID09PSAncmlnaHRCb3R0b20nICkge1xuICAgICAgcGVyaW1ldGVyUG9pbnRzID0gZmxpcFBlcmltZXRlclBvaW50c0hvcml6b250YWxseSggcGVyaW1ldGVyUG9pbnRzICk7XG4gICAgfVxuICAgIGlmICggY29ybmVyUG9zaXRpb24gPT09ICdsZWZ0Qm90dG9tJyB8fCBjb3JuZXJQb3NpdGlvbiA9PT0gJ3JpZ2h0Qm90dG9tJyApIHtcbiAgICAgIHBlcmltZXRlclBvaW50cyA9IGZsaXBQZXJpbWV0ZXJQb2ludHNWZXJ0aWNhbGx5KCBwZXJpbWV0ZXJQb2ludHMgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFBlcmltZXRlclNoYXBlKCBbIHBlcmltZXRlclBvaW50cyBdLCBbXSwgVU5JVF9TUVVBUkVfTEVOR1RILCB7XG4gICAgICBmaWxsQ29sb3I6IGZpbGxDb2xvcixcbiAgICAgIGVkZ2VDb2xvcjogZmlsbENvbG9yLmNvbG9yVXRpbHNEYXJrZXIoIEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLlBFUklNRVRFUl9EQVJLRU5fRkFDVE9SIClcbiAgICB9ICk7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVQZXJpbWV0ZXJTaGFwZUxldmVsSHlwb3RlbnVzZVJpZ2h0SXNvc2NlbGVzVHJpYW5nbGUoIHgsIHksIGh5cG90ZW51c2VMZW5ndGgsIGNvcm5lclBvc2l0aW9uLCBmaWxsQ29sb3IgKSB7XG4gICAgbGV0IHBlcmltZXRlclBvaW50cztcbiAgICBpZiAoIGNvcm5lclBvc2l0aW9uID09PSAnY2VudGVyVG9wJyB8fCBjb3JuZXJQb3NpdGlvbiA9PT0gJ2NlbnRlckJvdHRvbScgKSB7XG4gICAgICBwZXJpbWV0ZXJQb2ludHMgPSBbIG5ldyBWZWN0b3IyKCB4LCB5ICksIG5ldyBWZWN0b3IyKCB4ICsgaHlwb3RlbnVzZUxlbmd0aCwgeSApLFxuICAgICAgICBuZXcgVmVjdG9yMiggeCArIGh5cG90ZW51c2VMZW5ndGggLyAyLCB5ICsgaHlwb3RlbnVzZUxlbmd0aCAvIDIgKSBdO1xuICAgICAgaWYgKCBjb3JuZXJQb3NpdGlvbiA9PT0gJ2NlbnRlckJvdHRvbScgKSB7XG4gICAgICAgIHBlcmltZXRlclBvaW50cyA9IGZsaXBQZXJpbWV0ZXJQb2ludHNWZXJ0aWNhbGx5KCBwZXJpbWV0ZXJQb2ludHMgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBwZXJpbWV0ZXJQb2ludHMgPSBbIG5ldyBWZWN0b3IyKCB4LCB5ICksIG5ldyBWZWN0b3IyKCB4LCB5ICsgaHlwb3RlbnVzZUxlbmd0aCApLFxuICAgICAgICBuZXcgVmVjdG9yMiggeCArIGh5cG90ZW51c2VMZW5ndGggLyAyLCB5ICsgaHlwb3RlbnVzZUxlbmd0aCAvIDIgKSBdO1xuICAgICAgaWYgKCBjb3JuZXJQb3NpdGlvbiA9PT0gJ2NlbnRlckxlZnQnICkge1xuICAgICAgICBwZXJpbWV0ZXJQb2ludHMgPSBmbGlwUGVyaW1ldGVyUG9pbnRzSG9yaXpvbnRhbGx5KCBwZXJpbWV0ZXJQb2ludHMgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZWZsZWN0IGFzIGFwcHJvcHJpYXRlIHRvIGNyZWF0ZSB0aGUgc3BlY2lmaWVkIG9yaWVudGF0aW9uLlxuICAgIGlmICggY29ybmVyUG9zaXRpb24gPT09ICdjZW50ZXJUb3AnIHx8IGNvcm5lclBvc2l0aW9uID09PSAncmlnaHRCb3R0b20nICkge1xuICAgICAgcGVyaW1ldGVyUG9pbnRzID0gZmxpcFBlcmltZXRlclBvaW50c0hvcml6b250YWxseSggcGVyaW1ldGVyUG9pbnRzICk7XG4gICAgfVxuICAgIGlmICggY29ybmVyUG9zaXRpb24gPT09ICdsZWZ0Qm90dG9tJyB8fCBjb3JuZXJQb3NpdGlvbiA9PT0gJ3JpZ2h0Qm90dG9tJyApIHtcbiAgICAgIHBlcmltZXRlclBvaW50cyA9IGZsaXBQZXJpbWV0ZXJQb2ludHNWZXJ0aWNhbGx5KCBwZXJpbWV0ZXJQb2ludHMgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFBlcmltZXRlclNoYXBlKCBbIHBlcmltZXRlclBvaW50cyBdLCBbXSwgVU5JVF9TUVVBUkVfTEVOR1RILCB7XG4gICAgICBmaWxsQ29sb3I6IGZpbGxDb2xvcixcbiAgICAgIGVkZ2VDb2xvcjogZmlsbENvbG9yLmNvbG9yVXRpbHNEYXJrZXIoIEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLlBFUklNRVRFUl9EQVJLRU5fRkFDVE9SIClcbiAgICB9ICk7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVTaGFwZVdpdGhEaWFnb25hbEFuZE1pc3NpbmdDb3JuZXIoIHgsIHksIHdpZHRoLCBoZWlnaHQsIGRpYWdvbmFsUG9zaXRpb24sIGRpYWdvbmFsU3F1YXJlTGVuZ3RoLCBjdXRXaWR0aCwgY3V0SGVpZ2h0LCBmaWxsQ29sb3IgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggd2lkdGggLSBkaWFnb25hbFNxdWFyZUxlbmd0aCA+PSBjdXRXaWR0aCAmJiBoZWlnaHQgLSBkaWFnb25hbFNxdWFyZUxlbmd0aCA+PSBjdXRIZWlnaHQsICdJbnZhbGlkIHBhcmFtZXRlcnMnICk7XG5cbiAgICBsZXQgcGVyaW1ldGVyUG9pbnRzID0gW107XG4gICAgLy8gRHJhdyBzaGFwZSB3aXRoIGRpYWdvbmFsIGluIGxvd2VyIHJpZ2h0IGNvcm5lciwgc3RhcnRpbmcgaW4gdXBwZXIgcmlnaHQgY29ybmVyLlxuICAgIHBlcmltZXRlclBvaW50cy5wdXNoKCBuZXcgVmVjdG9yMiggeCArIHdpZHRoLCB5ICkgKTtcbiAgICBwZXJpbWV0ZXJQb2ludHMucHVzaCggbmV3IFZlY3RvcjIoIHggKyB3aWR0aCwgeSArIGhlaWdodCAtIGRpYWdvbmFsU3F1YXJlTGVuZ3RoICkgKTtcbiAgICBwZXJpbWV0ZXJQb2ludHMucHVzaCggbmV3IFZlY3RvcjIoIHggKyB3aWR0aCAtIGRpYWdvbmFsU3F1YXJlTGVuZ3RoLCB5ICsgaGVpZ2h0ICkgKTtcbiAgICBwZXJpbWV0ZXJQb2ludHMucHVzaCggbmV3IFZlY3RvcjIoIHgsIHkgKyBoZWlnaHQgKSApO1xuICAgIHBlcmltZXRlclBvaW50cy5wdXNoKCBuZXcgVmVjdG9yMiggeCwgeSArIGN1dEhlaWdodCApICk7XG4gICAgcGVyaW1ldGVyUG9pbnRzLnB1c2goIG5ldyBWZWN0b3IyKCB4ICsgY3V0V2lkdGgsIHkgKyBjdXRIZWlnaHQgKSApO1xuICAgIHBlcmltZXRlclBvaW50cy5wdXNoKCBuZXcgVmVjdG9yMiggeCArIGN1dFdpZHRoLCB5ICkgKTtcblxuICAgIC8vIFJlZmxlY3Qgc2hhcGUgYXMgbmVlZGVkIHRvIG1lZXQgdGhlIHNwZWNpZmllZCBvcmllbnRhdGlvbi5cbiAgICBpZiAoIGRpYWdvbmFsUG9zaXRpb24gPT09ICdsZWZ0VG9wJyB8fCBkaWFnb25hbFBvc2l0aW9uID09PSAnbGVmdEJvdHRvbScgKSB7XG4gICAgICBwZXJpbWV0ZXJQb2ludHMgPSBmbGlwUGVyaW1ldGVyUG9pbnRzSG9yaXpvbnRhbGx5KCBwZXJpbWV0ZXJQb2ludHMgKTtcbiAgICB9XG4gICAgaWYgKCBkaWFnb25hbFBvc2l0aW9uID09PSAncmlnaHRUb3AnIHx8IGRpYWdvbmFsUG9zaXRpb24gPT09ICdsZWZ0VG9wJyApIHtcbiAgICAgIHBlcmltZXRlclBvaW50cyA9IGZsaXBQZXJpbWV0ZXJQb2ludHNWZXJ0aWNhbGx5KCBwZXJpbWV0ZXJQb2ludHMgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFBlcmltZXRlclNoYXBlKCBbIHBlcmltZXRlclBvaW50cyBdLCBbXSwgVU5JVF9TUVVBUkVfTEVOR1RILCB7XG4gICAgICBmaWxsQ29sb3I6IGZpbGxDb2xvcixcbiAgICAgIGVkZ2VDb2xvcjogZmlsbENvbG9yLmNvbG9yVXRpbHNEYXJrZXIoIEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLlBFUklNRVRFUl9EQVJLRU5fRkFDVE9SIClcbiAgICB9ICk7XG4gIH1cblxuICAvLyBSZXR1cm4gYSB2YWx1ZSB0aGF0IGluZGljYXRlcyB3aGV0aGVyIHR3byBjaGFsbGVuZ2VzIGFyZSBzaW1pbGFyLCB1c2VkIHdoZW4gZ2VuZXJhdGluZyBjaGFsbGVuZ2VzIHRoYXQgYXJlXG4gIC8vIGRpc3RpbmN0IGVub3VnaCB0byBrZWVwIHRoZSBnYW1lIGludGVyZXN0aW5nLlxuICBmdW5jdGlvbiBpc0NoYWxsZW5nZVNpbWlsYXIoIGNoYWxsZW5nZTEsIGNoYWxsZW5nZTIgKSB7XG4gICAgaWYgKCBjaGFsbGVuZ2UxLmJ1aWxkU3BlYyAmJiBjaGFsbGVuZ2UyLmJ1aWxkU3BlYyApIHtcbiAgICAgIGlmICggY2hhbGxlbmdlMS5idWlsZFNwZWMucHJvcG9ydGlvbnMgJiYgY2hhbGxlbmdlMi5idWlsZFNwZWMucHJvcG9ydGlvbnMgKSB7XG4gICAgICAgIGlmICggY2hhbGxlbmdlMS5idWlsZFNwZWMucHJvcG9ydGlvbnMuY29sb3IxUHJvcG9ydGlvbi5kZW5vbWluYXRvciA9PT0gY2hhbGxlbmdlMi5idWlsZFNwZWMucHJvcG9ydGlvbnMuY29sb3IxUHJvcG9ydGlvbi5kZW5vbWluYXRvciApIHtcbiAgICAgICAgICBpZiAoIGNoYWxsZW5nZTEuYnVpbGRTcGVjLnBlcmltZXRlciAmJiBjaGFsbGVuZ2UyLmJ1aWxkU3BlYy5wZXJpbWV0ZXIgfHwgIWNoYWxsZW5nZTEuYnVpbGRTcGVjLnBlcmltZXRlciAmJiAhY2hhbGxlbmdlMi5idWlsZFNwZWMucGVyaW1ldGVyICkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggIWNoYWxsZW5nZTEuYnVpbGRTcGVjLnByb3BvcnRpb25zICYmICFjaGFsbGVuZ2UxLmJ1aWxkU3BlYy5wcm9wb3J0aW9ucyApIHtcbiAgICAgICAgaWYgKCBjaGFsbGVuZ2UxLmJ1aWxkU3BlYy5hcmVhID09PSBjaGFsbGVuZ2UyLmJ1aWxkU3BlYy5hcmVhICkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgaWYgKCBjaGFsbGVuZ2UxLmJhY2tncm91bmRTaGFwZSAmJiBjaGFsbGVuZ2UyLmJhY2tncm91bmRTaGFwZSApIHtcbiAgICAgICAgaWYgKCBjaGFsbGVuZ2UxLmJhY2tncm91bmRTaGFwZS51bml0QXJlYSA9PT0gY2hhbGxlbmdlMi5iYWNrZ3JvdW5kU2hhcGUudW5pdEFyZWEgKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBnb3QgdG8gaGVyZSwgdGhlIGNoYWxsZW5nZXMgYXJlIG5vdCBzaW1pbGFyLlxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFRlc3QgdGhlIGNoYWxsZW5nZSBhZ2FpbnN0IHRoZSBoaXN0b3J5IG9mIHJlY2VudGx5IGdlbmVyYXRlZCBjaGFsbGVuZ2VzIHRvIHNlZSBpZiBpdCBpcyB1bmlxdWUuXG4gIGZ1bmN0aW9uIGlzQ2hhbGxlbmdlVW5pcXVlKCBjaGFsbGVuZ2UgKSB7XG4gICAgbGV0IGNoYWxsZW5nZUlzVW5pcXVlID0gdHJ1ZTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBjaGFsbGVuZ2VIaXN0b3J5Lmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYgKCBpc0NoYWxsZW5nZVNpbWlsYXIoIGNoYWxsZW5nZSwgY2hhbGxlbmdlSGlzdG9yeVsgaSBdICkgKSB7XG4gICAgICAgIGNoYWxsZW5nZUlzVW5pcXVlID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2hhbGxlbmdlSXNVbmlxdWU7XG4gIH1cblxuICBmdW5jdGlvbiBnZW5lcmF0ZUJ1aWxkQXJlYUNoYWxsZW5nZSgpIHtcblxuICAgIC8vIENyZWF0ZSBhIHVuaXF1ZSBjaGFsbGVuZ2VcbiAgICBjb25zdCB3aWR0aCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMiwgQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9XSURUSCAtIDIgKTtcbiAgICBsZXQgaGVpZ2h0ID0gMDtcbiAgICB3aGlsZSAoIHdpZHRoICogaGVpZ2h0IDwgOCB8fCB3aWR0aCAqIGhlaWdodCA+IDM2ICkge1xuICAgICAgaGVpZ2h0ID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAwLCBBcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX0hFSUdIVCAtIDIgKTtcbiAgICB9XG4gICAgY29uc3QgY29sb3IgPSBCVUlMRF9JVF9DT0xPUl9DSE9PU0VSLm5leHRDb2xvcigpO1xuICAgIGNvbnN0IGV4YW1wbGVTb2x1dGlvbiA9IGNyZWF0ZU1vbm9jaHJvbWVSZWN0YW5ndWxhclNvbHV0aW9uU3BlYyhcbiAgICAgIE1hdGguZmxvb3IoICggQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9XSURUSCAtIHdpZHRoICkgLyAyICksXG4gICAgICBNYXRoLmZsb29yKCAoIEFyZWFCdWlsZGVyR2FtZU1vZGVsLlNIQVBFX0JPQVJEX1VOSVRfSEVJR0hUIC0gaGVpZ2h0ICkgLyAyICksXG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIGNvbG9yXG4gICAgKTtcbiAgICBjb25zdCBjaGFsbGVuZ2UgPSBBcmVhQnVpbGRlckdhbWVDaGFsbGVuZ2UuY3JlYXRlQnVpbGRBcmVhQ2hhbGxlbmdlKCB3aWR0aCAqIGhlaWdodCwgY3JlYXRlQmFzaWNSZWN0YW5nbGVzU2hhcGVLaXQoIGNvbG9yICksIGV4YW1wbGVTb2x1dGlvbiApO1xuICAgIHJldHVybiBjaGFsbGVuZ2U7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSAnYnVpbGQgaXQnIGFyZWErcGVyaW1ldGVyIGNoYWxsZW5nZSB0aGF0IGNvbnNpc3RzIG9mIHR3byBjb25uZWN0ZWQgcmVjdGFuZ2xlcy4gIFNlZSB0aGUgZGVzaWduIHNwZWNcbiAgICogZm9yIGRldGFpbHMuXG4gICAqL1xuICBmdW5jdGlvbiBnZW5lcmF0ZVR3b1JlY3RhbmdsZUJ1aWxkQXJlYUFuZFBlcmltZXRlckNoYWxsZW5nZSgpIHtcblxuICAgIC8vIENyZWF0ZSBmaXJzdCByZWN0YW5nbGUgZGltZW5zaW9uc1xuICAgIGNvbnN0IHdpZHRoMSA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMiwgNiApO1xuICAgIGxldCBoZWlnaHQxO1xuICAgIGRvIHtcbiAgICAgIGhlaWdodDEgPSByYW5kb20ubmV4dEludEJldHdlZW4oIDEsIDQgKTtcbiAgICB9IHdoaWxlICggd2lkdGgxICUgMiA9PT0gaGVpZ2h0MSAlIDIgKTtcblxuICAgIC8vIENyZWF0ZSBzZWNvbmQgcmVjdGFuZ2xlIGRpbWVuc2lvbnNcbiAgICBsZXQgd2lkdGgyID0gMDtcbiAgICBkbyB7XG4gICAgICB3aWR0aDIgPSByYW5kb20ubmV4dEludEJldHdlZW4oIDEsIDYgKTtcbiAgICB9IHdoaWxlICggd2lkdGgxICsgd2lkdGgyID4gQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9XSURUSCAtIDIgKTtcbiAgICBsZXQgaGVpZ2h0MjtcbiAgICBkbyB7XG4gICAgICBoZWlnaHQyID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAxLCA2ICk7XG4gICAgfSB3aGlsZSAoIHdpZHRoMiAlIDIgPT09IGhlaWdodDIgJSAyIHx8IGhlaWdodDEgKyBoZWlnaHQyID4gQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9IRUlHSFQgLSAyICk7XG5cbiAgICAvLyBDaG9vc2UgdGhlIGFtb3VudCBvZiBvdmVybGFwXG4gICAgY29uc3Qgb3ZlcmxhcCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMSwgTWF0aC5taW4oIHdpZHRoMSwgd2lkdGgyICkgLSAxICk7XG5cbiAgICBjb25zdCBsZWZ0ID0gTWF0aC5mbG9vciggKCBBcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX1dJRFRIIC0gKCB3aWR0aDEgKyB3aWR0aDIgLSBvdmVybGFwICkgKSAvIDIgKTtcbiAgICBjb25zdCB0b3AgPSBNYXRoLmZsb29yKCAoIEFyZWFCdWlsZGVyR2FtZU1vZGVsLlNIQVBFX0JPQVJEX1VOSVRfSEVJR0hUIC0gKCBoZWlnaHQxICsgaGVpZ2h0MiApICkgLyAyICk7XG5cbiAgICAvLyBDcmVhdGUgYSBzb2x1dGlvbiBzcGVjIGJ5IG1lcmdpbmcgc3BlY3MgZm9yIGVhY2ggb2YgdGhlIHJlY3RhbmdsZXMgdG9nZXRoZXIuXG4gICAgY29uc3QgY29sb3IgPSBCVUlMRF9JVF9DT0xPUl9DSE9PU0VSLm5leHRDb2xvcigpO1xuICAgIGNvbnN0IHNvbHV0aW9uU3BlYyA9IGNyZWF0ZU1vbm9jaHJvbWVSZWN0YW5ndWxhclNvbHV0aW9uU3BlYyggbGVmdCwgdG9wLCB3aWR0aDEsIGhlaWdodDEsIGNvbG9yICkuY29uY2F0KFxuICAgICAgY3JlYXRlTW9ub2Nocm9tZVJlY3Rhbmd1bGFyU29sdXRpb25TcGVjKCBsZWZ0ICsgd2lkdGgxIC0gb3ZlcmxhcCwgdG9wICsgaGVpZ2h0MSwgd2lkdGgyLCBoZWlnaHQyLCBjb2xvciApICk7XG5cbiAgICByZXR1cm4gKCBBcmVhQnVpbGRlckdhbWVDaGFsbGVuZ2UuY3JlYXRlQnVpbGRBcmVhQW5kUGVyaW1ldGVyQ2hhbGxlbmdlKCB3aWR0aDEgKiBoZWlnaHQxICsgd2lkdGgyICogaGVpZ2h0MixcbiAgICAgIDIgKiB3aWR0aDEgKyAyICogaGVpZ2h0MSArIDIgKiB3aWR0aDIgKyAyICogaGVpZ2h0MiAtIDIgKiBvdmVybGFwLCBjcmVhdGVCYXNpY1JlY3RhbmdsZXNTaGFwZUtpdCggY29sb3IgKSwgc29sdXRpb25TcGVjICkgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlQnVpbGRBcmVhQW5kUGVyaW1ldGVyQ2hhbGxlbmdlKCkge1xuXG4gICAgbGV0IHdpZHRoO1xuICAgIGxldCBoZWlnaHQ7XG5cbiAgICAvLyBXaWR0aCBjYW4gYmUgYW55IHZhbHVlIGZyb20gMyB0byA4IGV4Y2x1ZGluZyA3LCBzZWUgZGVzaWduIGRvYy5cbiAgICBkbyB7XG4gICAgICB3aWR0aCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMywgOCApO1xuICAgIH0gd2hpbGUgKCB3aWR0aCA9PT0gMCB8fCB3aWR0aCA9PT0gNyApO1xuXG4gICAgLy8gQ2hvb3NlIHRoZSBoZWlnaHQgYmFzZWQgb24gdGhlIHRvdGFsIGFyZWEuXG4gICAgZG8ge1xuICAgICAgaGVpZ2h0ID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAzLCA4ICk7XG4gICAgfSB3aGlsZSAoIHdpZHRoICogaGVpZ2h0IDwgMTIgfHwgd2lkdGggKiBoZWlnaHQgPiAzNiB8fCBoZWlnaHQgPT09IDcgfHwgaGVpZ2h0ID4gQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9IRUlHSFQgLSAyICk7XG5cbiAgICBjb25zdCBjb2xvciA9IEJVSUxEX0lUX0NPTE9SX0NIT09TRVIubmV4dENvbG9yKCk7XG5cbiAgICBjb25zdCBleGFtcGxlU29sdXRpb24gPSBjcmVhdGVNb25vY2hyb21lUmVjdGFuZ3VsYXJTb2x1dGlvblNwZWMoXG4gICAgICBNYXRoLmZsb29yKCAoIEFyZWFCdWlsZGVyR2FtZU1vZGVsLlNIQVBFX0JPQVJEX1VOSVRfV0lEVEggLSB3aWR0aCApIC8gMiApLFxuICAgICAgTWF0aC5mbG9vciggKCBBcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX0hFSUdIVCAtIGhlaWdodCApIC8gMiApLFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBjb2xvclxuICAgICk7XG4gICAgcmV0dXJuIEFyZWFCdWlsZGVyR2FtZUNoYWxsZW5nZS5jcmVhdGVCdWlsZEFyZWFBbmRQZXJpbWV0ZXJDaGFsbGVuZ2UoIHdpZHRoICogaGVpZ2h0LFxuICAgICAgMiAqIHdpZHRoICsgMiAqIGhlaWdodCwgY3JlYXRlQmFzaWNSZWN0YW5nbGVzU2hhcGVLaXQoIGNvbG9yICksIGV4YW1wbGVTb2x1dGlvbiApO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVSZWN0YW5ndWxhckZpbmRBcmVhQ2hhbGxlbmdlKCkge1xuICAgIGxldCB3aWR0aDtcbiAgICBsZXQgaGVpZ2h0O1xuICAgIGRvIHtcbiAgICAgIHdpZHRoID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAyLCBBcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX1dJRFRIIC0gNCApO1xuICAgICAgaGVpZ2h0ID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAyLCBBcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX0hFSUdIVCAtIDQgKTtcbiAgICB9IHdoaWxlICggd2lkdGggKiBoZWlnaHQgPCAxNiB8fCB3aWR0aCAqIGhlaWdodCA+IDM2ICk7XG4gICAgY29uc3QgcGVyaW1ldGVyU2hhcGUgPSBjcmVhdGVSZWN0YW5ndWxhclBlcmltZXRlclNoYXBlKCAwLCAwLCB3aWR0aCAqIFVOSVRfU1FVQVJFX0xFTkdUSCwgaGVpZ2h0ICogVU5JVF9TUVVBUkVfTEVOR1RILFxuICAgICAgRklORF9USEVfQVJFQV9DT0xPUl9DSE9PU0VSLm5leHRDb2xvcigpICk7XG5cbiAgICByZXR1cm4gQXJlYUJ1aWxkZXJHYW1lQ2hhbGxlbmdlLmNyZWF0ZUZpbmRBcmVhQ2hhbGxlbmdlKCBwZXJpbWV0ZXJTaGFwZSwgQkFTSUNfUkVDVEFOR0xFU19TSEFQRV9LSVQgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlTFNoYXBlZEZpbmRBcmVhQ2hhbGxlbmdlKCkge1xuICAgIGxldCB3aWR0aDtcbiAgICBsZXQgaGVpZ2h0O1xuICAgIGRvIHtcbiAgICAgIHdpZHRoID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAyLCBBcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX1dJRFRIIC0gNCApO1xuICAgICAgaGVpZ2h0ID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAyLCBBcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX0hFSUdIVCAtIDQgKTtcbiAgICB9IHdoaWxlICggd2lkdGggKiBoZWlnaHQgPCAxNiB8fCB3aWR0aCAqIGhlaWdodCA+IDM2ICk7XG4gICAgY29uc3QgbWlzc2luZ1dpZHRoID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAxLCB3aWR0aCAtIDEgKTtcbiAgICBjb25zdCBtaXNzaW5nSGVpZ2h0ID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAxLCBoZWlnaHQgLSAxICk7XG4gICAgY29uc3QgbWlzc2luZ0Nvcm5lciA9IHJhbmRvbUVsZW1lbnQoIFsgJ2xlZnRUb3AnLCAncmlnaHRUb3AnLCAnbGVmdEJvdHRvbScsICdyaWdodEJvdHRvbScgXSApO1xuICAgIGNvbnN0IHBlcmltZXRlclNoYXBlID0gY3JlYXRlTFNoYXBlZFBlcmltZXRlclNoYXBlKCAwLCAwLCB3aWR0aCAqIFVOSVRfU1FVQVJFX0xFTkdUSCwgaGVpZ2h0ICogVU5JVF9TUVVBUkVfTEVOR1RILFxuICAgICAgbWlzc2luZ0Nvcm5lciwgbWlzc2luZ1dpZHRoICogVU5JVF9TUVVBUkVfTEVOR1RILCBtaXNzaW5nSGVpZ2h0ICogVU5JVF9TUVVBUkVfTEVOR1RILCBGSU5EX1RIRV9BUkVBX0NPTE9SX0NIT09TRVIubmV4dENvbG9yKCkgKTtcblxuICAgIHJldHVybiBBcmVhQnVpbGRlckdhbWVDaGFsbGVuZ2UuY3JlYXRlRmluZEFyZWFDaGFsbGVuZ2UoIHBlcmltZXRlclNoYXBlLCBCQVNJQ19SRUNUQU5HTEVTX1NIQVBFX0tJVCApO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVVU2hhcGVkRmluZEFyZWFDaGFsbGVuZ2UoKSB7XG4gICAgbGV0IHdpZHRoO1xuICAgIGxldCBoZWlnaHQ7XG4gICAgZG8ge1xuICAgICAgd2lkdGggPSByYW5kb20ubmV4dEludEJldHdlZW4oIDQsIEFyZWFCdWlsZGVyR2FtZU1vZGVsLlNIQVBFX0JPQVJEX1VOSVRfV0lEVEggLSA0ICk7XG4gICAgICBoZWlnaHQgPSByYW5kb20ubmV4dEludEJldHdlZW4oIDQsIEFyZWFCdWlsZGVyR2FtZU1vZGVsLlNIQVBFX0JPQVJEX1VOSVRfSEVJR0hUIC0gMiApO1xuICAgIH0gd2hpbGUgKCB3aWR0aCAqIGhlaWdodCA8IDE2IHx8IHdpZHRoICogaGVpZ2h0ID4gMzYgKTtcbiAgICBjb25zdCBzaWRlV2l0aEN1dG91dCA9IHJhbmRvbUVsZW1lbnQoIFsgJ2xlZnQnLCAncmlnaHQnLCAndG9wJywgJ2JvdHRvbScgXSApO1xuICAgIGxldCBjdXRvdXRXaWR0aDtcbiAgICBsZXQgY3V0b3V0SGVpZ2h0O1xuICAgIGxldCBjdXRvdXRPZmZzZXQ7XG4gICAgaWYgKCBzaWRlV2l0aEN1dG91dCA9PT0gJ2xlZnQnIHx8IHNpZGVXaXRoQ3V0b3V0ID09PSAncmlnaHQnICkge1xuICAgICAgY3V0b3V0V2lkdGggPSByYW5kb20ubmV4dEludEJldHdlZW4oIDIsIHdpZHRoIC0gMSApO1xuICAgICAgY3V0b3V0SGVpZ2h0ID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAxLCBoZWlnaHQgLSAyICk7XG4gICAgICBjdXRvdXRPZmZzZXQgPSByYW5kb20ubmV4dEludEJldHdlZW4oIDEsIGhlaWdodCAtIGN1dG91dEhlaWdodCAtIDEgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjdXRvdXRXaWR0aCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMSwgd2lkdGggLSAyICk7XG4gICAgICBjdXRvdXRIZWlnaHQgPSByYW5kb20ubmV4dEludEJldHdlZW4oIDIsIGhlaWdodCAtIDEgKTtcbiAgICAgIGN1dG91dE9mZnNldCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMSwgd2lkdGggLSBjdXRvdXRXaWR0aCAtIDEgKTtcbiAgICB9XG4gICAgY29uc3QgcGVyaW1ldGVyU2hhcGUgPSBjcmVhdGVVU2hhcGVkUGVyaW1ldGVyU2hhcGUoIDAsIDAsIHdpZHRoICogVU5JVF9TUVVBUkVfTEVOR1RILCBoZWlnaHQgKiBVTklUX1NRVUFSRV9MRU5HVEgsXG4gICAgICBzaWRlV2l0aEN1dG91dCwgY3V0b3V0V2lkdGggKiBVTklUX1NRVUFSRV9MRU5HVEgsIGN1dG91dEhlaWdodCAqIFVOSVRfU1FVQVJFX0xFTkdUSCxcbiAgICAgIGN1dG91dE9mZnNldCAqIFVOSVRfU1FVQVJFX0xFTkdUSCwgRklORF9USEVfQVJFQV9DT0xPUl9DSE9PU0VSLm5leHRDb2xvcigpICk7XG5cbiAgICByZXR1cm4gQXJlYUJ1aWxkZXJHYW1lQ2hhbGxlbmdlLmNyZWF0ZUZpbmRBcmVhQ2hhbGxlbmdlKCBwZXJpbWV0ZXJTaGFwZSwgQkFTSUNfUkVDVEFOR0xFU19TSEFQRV9LSVQgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlT1NoYXBlZEZpbmRBcmVhQ2hhbGxlbmdlKCkge1xuICAgIGxldCB3aWR0aDtcbiAgICBsZXQgaGVpZ2h0O1xuICAgIGRvIHtcbiAgICAgIHdpZHRoID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAzLCBBcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX1dJRFRIIC0gNCApO1xuICAgICAgaGVpZ2h0ID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAzLCBBcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX0hFSUdIVCAtIDIgKTtcbiAgICB9IHdoaWxlICggd2lkdGggKiBoZWlnaHQgPCAxNiB8fCB3aWR0aCAqIGhlaWdodCA+IDM2ICk7XG4gICAgY29uc3QgaG9sZVdpZHRoID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAxLCB3aWR0aCAtIDIgKTtcbiAgICBjb25zdCBob2xlSGVpZ2h0ID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAxLCBoZWlnaHQgLSAyICk7XG4gICAgY29uc3QgaG9sZVhPZmZzZXQgPSByYW5kb20ubmV4dEludEJldHdlZW4oIDEsIHdpZHRoIC0gaG9sZVdpZHRoIC0gMSApO1xuICAgIGNvbnN0IGhvbGVZT2Zmc2V0ID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAxLCBoZWlnaHQgLSBob2xlSGVpZ2h0IC0gMSApO1xuICAgIGNvbnN0IHBlcmltZXRlclNoYXBlID0gY3JlYXRlUGVyaW1ldGVyU2hhcGVXaXRoSG9sZSggMCwgMCwgd2lkdGggKiBVTklUX1NRVUFSRV9MRU5HVEgsIGhlaWdodCAqIFVOSVRfU1FVQVJFX0xFTkdUSCxcbiAgICAgIGhvbGVXaWR0aCAqIFVOSVRfU1FVQVJFX0xFTkdUSCwgaG9sZUhlaWdodCAqIFVOSVRfU1FVQVJFX0xFTkdUSCwgaG9sZVhPZmZzZXQgKiBVTklUX1NRVUFSRV9MRU5HVEgsXG4gICAgICBob2xlWU9mZnNldCAqIFVOSVRfU1FVQVJFX0xFTkdUSCwgRklORF9USEVfQVJFQV9DT0xPUl9DSE9PU0VSLm5leHRDb2xvcigpICk7XG5cbiAgICByZXR1cm4gQXJlYUJ1aWxkZXJHYW1lQ2hhbGxlbmdlLmNyZWF0ZUZpbmRBcmVhQ2hhbGxlbmdlKCBwZXJpbWV0ZXJTaGFwZSwgQkFTSUNfUkVDVEFOR0xFU19TSEFQRV9LSVQgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlSXNvc2NlbGVzUmlnaHRUcmlhbmdsZVNsYW50ZWRIeXBvdGVudXNlRmluZEFyZWFDaGFsbGVuZ2UoKSB7XG4gICAgY29uc3QgY29ybmVyUG9zaXRpb24gPSByYW5kb21FbGVtZW50KCBbICdsZWZ0VG9wJywgJ3JpZ2h0VG9wJywgJ3JpZ2h0Qm90dG9tJywgJ2xlZnRCb3R0b20nIF0gKTtcbiAgICBsZXQgZWRnZUxlbmd0aCA9IDA7XG4gICAgZG8ge1xuICAgICAgZWRnZUxlbmd0aCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggNCwgTWF0aC5taW4oIEFyZWFCdWlsZGVyR2FtZU1vZGVsLlNIQVBFX0JPQVJEX1VOSVRfV0lEVEggLSAyLFxuICAgICAgICBBcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX0hFSUdIVCAtIDIgKSApO1xuICAgIH0gd2hpbGUgKCBlZGdlTGVuZ3RoICUgMiAhPT0gMCApO1xuICAgIGNvbnN0IHBlcmltZXRlclNoYXBlID0gY3JlYXRlUGVyaW1ldGVyU2hhcGVTbGFudGVkSHlwb3RlbnVzZVJpZ2h0SXNvc2NlbGVzVHJpYW5nbGUoIDAsIDAsXG4gICAgICBlZGdlTGVuZ3RoICogVU5JVF9TUVVBUkVfTEVOR1RILCBjb3JuZXJQb3NpdGlvbiwgRklORF9USEVfQVJFQV9DT0xPUl9DSE9PU0VSLm5leHRDb2xvcigpICk7XG4gICAgcmV0dXJuIEFyZWFCdWlsZGVyR2FtZUNoYWxsZW5nZS5jcmVhdGVGaW5kQXJlYUNoYWxsZW5nZSggcGVyaW1ldGVyU2hhcGUsIFJFQ1RBTkdMRVNfQU5EX1RSSUFOR0xFU19TSEFQRV9LSVQgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlSXNvc2NlbGVzUmlnaHRUcmlhbmdsZUxldmVsSHlwb3RlbnVzZUZpbmRBcmVhQ2hhbGxlbmdlKCkge1xuICAgIGNvbnN0IGNvcm5lclBvc2l0aW9uID0gcmFuZG9tRWxlbWVudCggWyAnY2VudGVyVG9wJywgJ3JpZ2h0Q2VudGVyJywgJ2NlbnRlckJvdHRvbScsICdsZWZ0Q2VudGVyJyBdICk7XG4gICAgbGV0IGh5cG90ZW51c2VMZW5ndGggPSAwO1xuICAgIGxldCBtYXhIeXBvdGVudXNlO1xuICAgIGlmICggY29ybmVyUG9zaXRpb24gPT09ICdjZW50ZXJUb3AnIHx8IGNvcm5lclBvc2l0aW9uID09PSAnY2VudGVyQm90dG9tJyApIHtcbiAgICAgIG1heEh5cG90ZW51c2UgPSBBcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX1dJRFRIIC0gNDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBtYXhIeXBvdGVudXNlID0gQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9IRUlHSFQgLSAyO1xuICAgIH1cbiAgICBkbyB7XG4gICAgICBoeXBvdGVudXNlTGVuZ3RoID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAyLCBtYXhIeXBvdGVudXNlICk7XG4gICAgfSB3aGlsZSAoIGh5cG90ZW51c2VMZW5ndGggJSAyICE9PSAwICk7XG4gICAgY29uc3QgcGVyaW1ldGVyU2hhcGUgPSBjcmVhdGVQZXJpbWV0ZXJTaGFwZUxldmVsSHlwb3RlbnVzZVJpZ2h0SXNvc2NlbGVzVHJpYW5nbGUoIDAsIDAsXG4gICAgICBoeXBvdGVudXNlTGVuZ3RoICogVU5JVF9TUVVBUkVfTEVOR1RILCBjb3JuZXJQb3NpdGlvbiwgRklORF9USEVfQVJFQV9DT0xPUl9DSE9PU0VSLm5leHRDb2xvcigpICk7XG4gICAgcmV0dXJuIEFyZWFCdWlsZGVyR2FtZUNoYWxsZW5nZS5jcmVhdGVGaW5kQXJlYUNoYWxsZW5nZSggcGVyaW1ldGVyU2hhcGUsIFJFQ1RBTkdMRVNfQU5EX1RSSUFOR0xFU19TSEFQRV9LSVQgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlTGFyZ2VSZWN0V2l0aENoaXBNaXNzaW5nQ2hhbGxlbmdlKCkge1xuICAgIGNvbnN0IHdpZHRoID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCBBcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX1dJRFRIIC0gNCwgQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9XSURUSCAtIDIgKTtcbiAgICBjb25zdCBoZWlnaHQgPSByYW5kb20ubmV4dEludEJldHdlZW4oIEFyZWFCdWlsZGVyR2FtZU1vZGVsLlNIQVBFX0JPQVJEX1VOSVRfSEVJR0hUIC0gMywgQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9IRUlHSFQgLSAyICk7XG4gICAgY29uc3Qgc2lkZVdpdGhDdXRvdXQgPSByYW5kb21FbGVtZW50KCBbICdsZWZ0JywgJ3JpZ2h0JywgJ3RvcCcsICdib3R0b20nIF0gKTtcbiAgICBsZXQgY3V0b3V0V2lkdGg7XG4gICAgbGV0IGN1dG91dEhlaWdodDtcbiAgICBsZXQgY3V0b3V0T2Zmc2V0O1xuICAgIGlmICggc2lkZVdpdGhDdXRvdXQgPT09ICdsZWZ0JyB8fCBzaWRlV2l0aEN1dG91dCA9PT0gJ3JpZ2h0JyApIHtcbiAgICAgIGN1dG91dFdpZHRoID0gMTtcbiAgICAgIGN1dG91dEhlaWdodCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMSwgMyApO1xuICAgICAgY3V0b3V0T2Zmc2V0ID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAxLCBoZWlnaHQgLSBjdXRvdXRIZWlnaHQgLSAxICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY3V0b3V0V2lkdGggPSByYW5kb20ubmV4dEludEJldHdlZW4oIDEsIDMgKTtcbiAgICAgIGN1dG91dEhlaWdodCA9IDE7XG4gICAgICBjdXRvdXRPZmZzZXQgPSByYW5kb20ubmV4dEludEJldHdlZW4oIDEsIHdpZHRoIC0gY3V0b3V0V2lkdGggLSAxICk7XG4gICAgfVxuICAgIGNvbnN0IHBlcmltZXRlclNoYXBlID0gY3JlYXRlVVNoYXBlZFBlcmltZXRlclNoYXBlKCAwLCAwLCB3aWR0aCAqIFVOSVRfU1FVQVJFX0xFTkdUSCwgaGVpZ2h0ICogVU5JVF9TUVVBUkVfTEVOR1RILFxuICAgICAgc2lkZVdpdGhDdXRvdXQsIGN1dG91dFdpZHRoICogVU5JVF9TUVVBUkVfTEVOR1RILCBjdXRvdXRIZWlnaHQgKiBVTklUX1NRVUFSRV9MRU5HVEgsXG4gICAgICBjdXRvdXRPZmZzZXQgKiBVTklUX1NRVUFSRV9MRU5HVEgsIEZJTkRfVEhFX0FSRUFfQ09MT1JfQ0hPT1NFUi5uZXh0Q29sb3IoKSApO1xuXG4gICAgcmV0dXJuIEFyZWFCdWlsZGVyR2FtZUNoYWxsZW5nZS5jcmVhdGVGaW5kQXJlYUNoYWxsZW5nZSggcGVyaW1ldGVyU2hhcGUsIEJBU0lDX1JFQ1RBTkdMRVNfU0hBUEVfS0lUICk7XG4gIH1cblxuICBmdW5jdGlvbiBnZW5lcmF0ZUxhcmdlUmVjdFdpdGhTbWFsbEhvbGVNaXNzaW5nQ2hhbGxlbmdlKCkge1xuICAgIGNvbnN0IHdpZHRoID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCBBcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX1dJRFRIIC0gNCwgQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9XSURUSCAtIDIgKTtcbiAgICBjb25zdCBoZWlnaHQgPSByYW5kb20ubmV4dEludEJldHdlZW4oIEFyZWFCdWlsZGVyR2FtZU1vZGVsLlNIQVBFX0JPQVJEX1VOSVRfSEVJR0hUIC0gMywgQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9IRUlHSFQgLSAyICk7XG4gICAgbGV0IGhvbGVXaWR0aDtcbiAgICBsZXQgaG9sZUhlaWdodDtcbiAgICBpZiAoIHJhbmRvbS5uZXh0RG91YmxlKCkgPCAwLjUgKSB7XG4gICAgICBob2xlV2lkdGggPSByYW5kb20ubmV4dEludEJldHdlZW4oIDEsIDMgKTtcbiAgICAgIGhvbGVIZWlnaHQgPSAxO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGhvbGVIZWlnaHQgPSByYW5kb20ubmV4dEludEJldHdlZW4oIDEsIDMgKTtcbiAgICAgIGhvbGVXaWR0aCA9IDE7XG4gICAgfVxuICAgIGNvbnN0IGhvbGVYT2Zmc2V0ID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAxLCB3aWR0aCAtIGhvbGVXaWR0aCAtIDEgKTtcbiAgICBjb25zdCBob2xlWU9mZnNldCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMSwgaGVpZ2h0IC0gaG9sZUhlaWdodCAtIDEgKTtcbiAgICBjb25zdCBwZXJpbWV0ZXJTaGFwZSA9IGNyZWF0ZVBlcmltZXRlclNoYXBlV2l0aEhvbGUoIDAsIDAsIHdpZHRoICogVU5JVF9TUVVBUkVfTEVOR1RILCBoZWlnaHQgKiBVTklUX1NRVUFSRV9MRU5HVEgsXG4gICAgICBob2xlV2lkdGggKiBVTklUX1NRVUFSRV9MRU5HVEgsIGhvbGVIZWlnaHQgKiBVTklUX1NRVUFSRV9MRU5HVEgsIGhvbGVYT2Zmc2V0ICogVU5JVF9TUVVBUkVfTEVOR1RILFxuICAgICAgaG9sZVlPZmZzZXQgKiBVTklUX1NRVUFSRV9MRU5HVEgsIEZJTkRfVEhFX0FSRUFfQ09MT1JfQ0hPT1NFUi5uZXh0Q29sb3IoKSApO1xuXG4gICAgcmV0dXJuIEFyZWFCdWlsZGVyR2FtZUNoYWxsZW5nZS5jcmVhdGVGaW5kQXJlYUNoYWxsZW5nZSggcGVyaW1ldGVyU2hhcGUsIEJBU0lDX1JFQ1RBTkdMRVNfU0hBUEVfS0lUICk7XG4gIH1cblxuICBmdW5jdGlvbiBnZW5lcmF0ZUxhcmdlUmVjdFdpdGhQaWVjZU1pc3NpbmdDaGFsbGVuZ2UoKSB7XG4gICAgcmV0dXJuIHJhbmRvbS5uZXh0RG91YmxlKCkgPCAwLjcgPyBnZW5lcmF0ZUxhcmdlUmVjdFdpdGhDaGlwTWlzc2luZ0NoYWxsZW5nZSgpIDogZ2VuZXJhdGVMYXJnZVJlY3RXaXRoU21hbGxIb2xlTWlzc2luZ0NoYWxsZW5nZSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVTaGFwZVdpdGhEaWFnb25hbEZpbmRBcmVhQ2hhbGxlbmdlKCkge1xuICAgIGNvbnN0IHdpZHRoID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAzLCBBcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX1dJRFRIIC0gNCApO1xuICAgIGNvbnN0IGhlaWdodCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMywgQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9IRUlHSFQgLSA0ICk7XG4gICAgY29uc3QgZGlhZ29uYWxQb3NpdGlvbiA9IHJhbmRvbUVsZW1lbnQoIFsgJ2xlZnRUb3AnLCAncmlnaHRUb3AnLCAnbGVmdEJvdHRvbScsICdyaWdodEJvdHRvbScgXSApO1xuICAgIGxldCBkaWFnb25hbFNxdWFyZUxlbmd0aCA9IDI7XG4gICAgaWYgKCBoZWlnaHQgPiA0ICYmIHdpZHRoID4gNCAmJiByYW5kb20ubmV4dERvdWJsZSgpID4gMC41ICkge1xuICAgICAgZGlhZ29uYWxTcXVhcmVMZW5ndGggPSA0O1xuICAgIH1cbiAgICBjb25zdCBjdXRXaWR0aCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMSwgd2lkdGggLSBkaWFnb25hbFNxdWFyZUxlbmd0aCApO1xuICAgIGNvbnN0IGN1dEhlaWdodCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMSwgaGVpZ2h0IC0gZGlhZ29uYWxTcXVhcmVMZW5ndGggKTtcblxuICAgIGNvbnN0IHBlcmltZXRlclNoYXBlID0gY3JlYXRlU2hhcGVXaXRoRGlhZ29uYWxBbmRNaXNzaW5nQ29ybmVyKCAwLCAwLCB3aWR0aCAqIFVOSVRfU1FVQVJFX0xFTkdUSCxcbiAgICAgIGhlaWdodCAqIFVOSVRfU1FVQVJFX0xFTkdUSCwgZGlhZ29uYWxQb3NpdGlvbiwgZGlhZ29uYWxTcXVhcmVMZW5ndGggKiBVTklUX1NRVUFSRV9MRU5HVEgsXG4gICAgICBjdXRXaWR0aCAqIFVOSVRfU1FVQVJFX0xFTkdUSCwgY3V0SGVpZ2h0ICogVU5JVF9TUVVBUkVfTEVOR1RILCBGSU5EX1RIRV9BUkVBX0NPTE9SX0NIT09TRVIubmV4dENvbG9yKCkgKTtcblxuICAgIHJldHVybiBBcmVhQnVpbGRlckdhbWVDaGFsbGVuZ2UuY3JlYXRlRmluZEFyZWFDaGFsbGVuZ2UoIHBlcmltZXRlclNoYXBlLCBSRUNUQU5HTEVTX0FORF9UUklBTkdMRVNfU0hBUEVfS0lUICk7XG4gIH1cblxuICBmdW5jdGlvbiBnZW5lcmF0ZUVhc3lQcm9wb3J0aW9uYWxCdWlsZEFyZWFDaGFsbGVuZ2UoKSB7XG4gICAgcmV0dXJuIGdlbmVyYXRlUHJvcG9ydGlvbmFsQnVpbGRBcmVhQ2hhbGxlbmdlKCAnZWFzeScsIGZhbHNlICk7XG4gIH1cblxuICBmdW5jdGlvbiBnZW5lcmF0ZUhhcmRlclByb3BvcnRpb25hbEJ1aWxkQXJlYUNoYWxsZW5nZSgpIHtcbiAgICByZXR1cm4gZ2VuZXJhdGVQcm9wb3J0aW9uYWxCdWlsZEFyZWFDaGFsbGVuZ2UoICdoYXJkZXInLCBmYWxzZSApO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVQcm9wb3J0aW9uYWxCdWlsZEFyZWFDaGFsbGVuZ2UoIGRpZmZpY3VsdHksIGluY2x1ZGVQZXJpbWV0ZXIgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZGlmZmljdWx0eSA9PT0gJ2Vhc3knIHx8IGRpZmZpY3VsdHkgPT09ICdoYXJkZXInICk7XG4gICAgbGV0IHdpZHRoO1xuICAgIGxldCBoZWlnaHQ7XG5cbiAgICAvLyBSYW5kb21seSBnZW5lcmF0ZSB3aWR0aCwgaGVpZ2h0LCBhbmQgdGhlIHBvc3NpYmxlIGZhY3RvcnMgZnJvbSB3aGljaCBhIHByb3BvcnRpb25hbCBjaGFsbGVuZ2UgY2FuIGJlIGNyZWF0ZWQuXG4gICAgY29uc3QgZmFjdG9ycyA9IFtdO1xuICAgIGRvIHtcbiAgICAgIGhlaWdodCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMywgNiApO1xuICAgICAgaWYgKCBoZWlnaHQgPT09IDMgKSB7XG4gICAgICAgIHdpZHRoID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCA0LCA4ICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgd2lkdGggPSByYW5kb20ubmV4dEludEJldHdlZW4oIDIsIDEwICk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1pbkZhY3RvciA9IGRpZmZpY3VsdHkgPT09ICdlYXN5JyA/IDIgOiA1O1xuICAgICAgY29uc3QgbWF4RmFjdG9yID0gZGlmZmljdWx0eSA9PT0gJ2Vhc3knID8gNCA6IDk7XG5cbiAgICAgIGNvbnN0IGFyZWEgPSB3aWR0aCAqIGhlaWdodDtcbiAgICAgIGZvciAoIGxldCBpID0gbWluRmFjdG9yOyBpIDw9IG1heEZhY3RvcjsgaSsrICkge1xuICAgICAgICBpZiAoIGFyZWEgJSBpID09PSAwICkge1xuICAgICAgICAgIC8vIFRoaXMgaXMgYSBmYWN0b3Igb2YgdGhlIGFyZWEuXG4gICAgICAgICAgZmFjdG9ycy5wdXNoKCBpICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IHdoaWxlICggZmFjdG9ycy5sZW5ndGggPT09IDAgKTtcblxuICAgIC8vIENob29zZSB0aGUgZnJhY3Rpb25hbCBwcm9wb3J0aW9uLlxuICAgIGNvbnN0IGZyYWN0aW9uRGVub21pbmF0b3IgPSByYW5kb21FbGVtZW50KCBmYWN0b3JzICk7XG4gICAgbGV0IGNvbG9yMUZyYWN0aW9uTnVtZXJhdG9yO1xuICAgIGRvIHtcbiAgICAgIGNvbG9yMUZyYWN0aW9uTnVtZXJhdG9yID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAxLCBmcmFjdGlvbkRlbm9taW5hdG9yIC0gMSApO1xuICAgIH0gd2hpbGUgKCBVdGlscy5nY2QoIGNvbG9yMUZyYWN0aW9uTnVtZXJhdG9yLCBmcmFjdGlvbkRlbm9taW5hdG9yICkgPiAxICk7XG4gICAgY29uc3QgY29sb3IxRnJhY3Rpb24gPSBuZXcgRnJhY3Rpb24oIGNvbG9yMUZyYWN0aW9uTnVtZXJhdG9yLCBmcmFjdGlvbkRlbm9taW5hdG9yICk7XG5cbiAgICAvLyBDaG9vc2UgdGhlIGNvbG9ycyBmb3IgdGhpcyBjaGFsbGVuZ2VcbiAgICBjb25zdCBjb2xvclBhaXIgPSBDT0xPUl9QQUlSX0NIT09TRVIubmV4dENvbG9yUGFpcigpO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBleGFtcGxlIHNvbHV0aW9uXG4gICAgY29uc3QgZXhhbXBsZVNvbHV0aW9uID0gY3JlYXRlVHdvQ29sb3JSZWN0YW5ndWxhclNvbHV0aW9uU3BlYyhcbiAgICAgIE1hdGguZmxvb3IoICggQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9XSURUSCAtIHdpZHRoICkgLyAyICksXG4gICAgICBNYXRoLmZsb29yKCAoIEFyZWFCdWlsZGVyR2FtZU1vZGVsLlNIQVBFX0JPQVJEX1VOSVRfSEVJR0hUIC0gaGVpZ2h0ICkgLyAyICksXG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIGNvbG9yUGFpci5jb2xvcjEsXG4gICAgICBjb2xvclBhaXIuY29sb3IyLFxuICAgICAgY29sb3IxRnJhY3Rpb24uZ2V0VmFsdWUoKVxuICAgICk7XG5cbiAgICBjb25zdCB1c2VyU2hhcGVzID0gY3JlYXRlVHdvVG9uZVJlY3RhbmdsZUJ1aWxkS2l0KCBjb2xvclBhaXIuY29sb3IxLCBjb2xvclBhaXIuY29sb3IyICk7XG5cbiAgICAvLyBCdWlsZCB0aGUgY2hhbGxlbmdlIGZyb20gYWxsIHRoZSBwaWVjZXMuXG4gICAgaWYgKCBpbmNsdWRlUGVyaW1ldGVyICkge1xuICAgICAgcmV0dXJuIEFyZWFCdWlsZGVyR2FtZUNoYWxsZW5nZS5jcmVhdGVUd29Ub25lQnVpbGRBcmVhQW5kUGVyaW1ldGVyQ2hhbGxlbmdlKCB3aWR0aCAqIGhlaWdodCxcbiAgICAgICAgKCAyICogd2lkdGggKyAyICogaGVpZ2h0ICksIGNvbG9yUGFpci5jb2xvcjEsIGNvbG9yUGFpci5jb2xvcjIsIGNvbG9yMUZyYWN0aW9uLCB1c2VyU2hhcGVzLCBleGFtcGxlU29sdXRpb24gKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gQXJlYUJ1aWxkZXJHYW1lQ2hhbGxlbmdlLmNyZWF0ZVR3b1RvbmVCdWlsZEFyZWFDaGFsbGVuZ2UoIHdpZHRoICogaGVpZ2h0LCBjb2xvclBhaXIuY29sb3IxLFxuICAgICAgICBjb2xvclBhaXIuY29sb3IyLCBjb2xvcjFGcmFjdGlvbiwgdXNlclNoYXBlcywgZXhhbXBsZVNvbHV0aW9uICk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVFYXN5UHJvcG9ydGlvbmFsQnVpbGRBcmVhQW5kUGVyaW1ldGVyQ2hhbGxlbmdlKCkge1xuICAgIHJldHVybiBnZW5lcmF0ZVByb3BvcnRpb25hbEJ1aWxkQXJlYUNoYWxsZW5nZSggJ2Vhc3knLCB0cnVlICk7XG4gIH1cblxuICBmdW5jdGlvbiBnZW5lcmF0ZUhhcmRlclByb3BvcnRpb25hbEJ1aWxkQXJlYUFuZFBlcmltZXRlckNoYWxsZW5nZSgpIHtcbiAgICByZXR1cm4gZ2VuZXJhdGVQcm9wb3J0aW9uYWxCdWlsZEFyZWFDaGFsbGVuZ2UoICdoYXJkZXInLCB0cnVlICk7XG4gIH1cblxuICAvLyBDaGFsbGVuZ2UgaGlzdG9yeSwgdXNlZCB0byBtYWtlIHN1cmUgdW5pcXVlIGNoYWxsZW5nZXMgYXJlIGdlbmVyYXRlZC5cbiAgbGV0IGNoYWxsZW5nZUhpc3RvcnkgPSBbXTtcblxuICAvLyBVc2UgdGhlIHByb3ZpZGVkIGdlbmVyYXRpb24gZnVuY3Rpb24gdG8gY3JlYXRlIGNoYWxsZW5nZXMgdW50aWwgYSB1bmlxdWUgb25lIGhhcyBiZWVuIGNyZWF0ZWQuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlVW5pcXVlQ2hhbGxlbmdlKCBnZW5lcmF0aW9uRnVuY3Rpb24gKSB7XG4gICAgbGV0IGNoYWxsZW5nZTtcbiAgICBsZXQgdW5pcXVlQ2hhbGxlbmdlR2VuZXJhdGVkID0gZmFsc2U7XG4gICAgbGV0IGF0dGVtcHRzID0gMDtcbiAgICB3aGlsZSAoICF1bmlxdWVDaGFsbGVuZ2VHZW5lcmF0ZWQgKSB7XG4gICAgICBjaGFsbGVuZ2UgPSBnZW5lcmF0aW9uRnVuY3Rpb24oKTtcbiAgICAgIGF0dGVtcHRzKys7XG4gICAgICB1bmlxdWVDaGFsbGVuZ2VHZW5lcmF0ZWQgPSBpc0NoYWxsZW5nZVVuaXF1ZSggY2hhbGxlbmdlICk7XG4gICAgICBpZiAoIGF0dGVtcHRzID4gMTIgJiYgIXVuaXF1ZUNoYWxsZW5nZUdlbmVyYXRlZCApIHtcbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBvbGRlc3QgaGFsZiBvZiBjaGFsbGVuZ2VzLlxuICAgICAgICBjaGFsbGVuZ2VIaXN0b3J5ID0gY2hhbGxlbmdlSGlzdG9yeS5zbGljZSggMCwgY2hhbGxlbmdlSGlzdG9yeS5sZW5ndGggLyAyICk7XG4gICAgICAgIGF0dGVtcHRzID0gMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjaGFsbGVuZ2VIaXN0b3J5LnB1c2goIGNoYWxsZW5nZSApO1xuICAgIHJldHVybiBjaGFsbGVuZ2U7XG4gIH1cblxuICAvLyBMZXZlbCA0IGlzIHJlcXVpcmVkIHRvIGxpbWl0IHRoZSBudW1iZXIgb2Ygc2hhcGVzIGF2YWlsYWJsZSwgdG8gb25seSBhbGxvdyB1bml0IHNxdWFyZXMsIGFuZCB0byBoYXZlIG5vdCBncmlkXG4gIC8vIGNvbnRyb2wuICBUaGlzIGZ1bmN0aW9uIG1vZGlmaWVzIHRoZSBjaGFsbGVuZ2VzIHRvIGNvbmZvcm0gdG8gdGhpcy5cbiAgZnVuY3Rpb24gbWFrZUxldmVsNFNwZWNpZmljTW9kaWZpY2F0aW9ucyggY2hhbGxlbmdlICkge1xuICAgIGNoYWxsZW5nZS50b29sU3BlYy5ncmlkQ29udHJvbCA9IGZhbHNlO1xuICAgIGNoYWxsZW5nZS51c2VyU2hhcGVzID0gW1xuICAgICAge1xuICAgICAgICBzaGFwZTogVU5JVF9TUVVBUkVfU0hBUEUsXG4gICAgICAgIGNvbG9yOiBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5HUkVFTklTSF9DT0xPUlxuICAgICAgfVxuICAgIF07XG5cbiAgICAvLyBMaW1pdCB0aGUgbnVtYmVyIG9mIHNoYXBlcyB0byB0aGUgbGVuZ3RoIG9mIHRoZSBsYXJnZXIgc2lkZS4gIFRoaXMgZW5jb3VyYWdlcyBjZXJ0YWluIHN0cmF0ZWdpZXMuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY2hhbGxlbmdlLmJhY2tncm91bmRTaGFwZS5leHRlcmlvclBlcmltZXRlcnMubGVuZ3RoID09PSAxLCAnVW5leHBlY3RlZCBjb25maWd1cmF0aW9uIGZvciBiYWNrZ3JvdW5kIHNoYXBlLicgKTtcbiAgICBjb25zdCBwZXJpbWV0ZXJTaGFwZSA9IG5ldyBQZXJpbWV0ZXJTaGFwZSggY2hhbGxlbmdlLmJhY2tncm91bmRTaGFwZS5leHRlcmlvclBlcmltZXRlcnMsIFtdLCBVTklUX1NRVUFSRV9MRU5HVEggKTtcbiAgICBjaGFsbGVuZ2UudXNlclNoYXBlc1sgMCBdLmNyZWF0aW9uTGltaXQgPSBNYXRoLm1heCggcGVyaW1ldGVyU2hhcGUuZ2V0V2lkdGgoKSAvIFVOSVRfU1FVQVJFX0xFTkdUSCxcbiAgICAgIHBlcmltZXRlclNoYXBlLmdldEhlaWdodCgpIC8gVU5JVF9TUVVBUkVfTEVOR1RIICk7XG4gICAgcmV0dXJuIGNoYWxsZW5nZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIHNldCBvZiBjaGFsbGVuZ2VzIGZvciB0aGUgZ2l2ZW4gZ2FtZSBsZXZlbC5cbiAgICpcbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0gbGV2ZWxcbiAgICogQHBhcmFtIG51bUNoYWxsZW5nZXNcbiAgICogQHJldHVybnMge0FycmF5fVxuICAgKi9cbiAgdGhpcy5nZW5lcmF0ZUNoYWxsZW5nZVNldCA9ICggbGV2ZWwsIG51bUNoYWxsZW5nZXMgKSA9PiB7XG4gICAgbGV0IGNoYWxsZW5nZVNldCA9IFtdO1xuICAgIGxldCB0ZW1wQ2hhbGxlbmdlO1xuICAgIGxldCB0cmlhbmdsZUNoYWxsZW5nZXM7XG4gICAgc3dpdGNoKCBsZXZlbCApIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgXy50aW1lcyggMywgKCkgPT4geyBjaGFsbGVuZ2VTZXQucHVzaCggZ2VuZXJhdGVVbmlxdWVDaGFsbGVuZ2UoIGdlbmVyYXRlQnVpbGRBcmVhQ2hhbGxlbmdlICkgKTsgfSApO1xuICAgICAgICBfLnRpbWVzKCAyLCAoKSA9PiB7IGNoYWxsZW5nZVNldC5wdXNoKCBnZW5lcmF0ZVVuaXF1ZUNoYWxsZW5nZSggZ2VuZXJhdGVSZWN0YW5ndWxhckZpbmRBcmVhQ2hhbGxlbmdlICkgKTsgfSApO1xuICAgICAgICBjaGFsbGVuZ2VTZXQucHVzaCggZ2VuZXJhdGVVbmlxdWVDaGFsbGVuZ2UoIGdlbmVyYXRlTFNoYXBlZEZpbmRBcmVhQ2hhbGxlbmdlICkgKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMTpcbiAgICAgICAgXy50aW1lcyggMywgKCkgPT4geyBjaGFsbGVuZ2VTZXQucHVzaCggZ2VuZXJhdGVVbmlxdWVDaGFsbGVuZ2UoIGdlbmVyYXRlQnVpbGRBcmVhQW5kUGVyaW1ldGVyQ2hhbGxlbmdlICkgKTsgfSApO1xuICAgICAgICBfLnRpbWVzKCAzLCAoKSA9PiB7IGNoYWxsZW5nZVNldC5wdXNoKCBnZW5lcmF0ZVVuaXF1ZUNoYWxsZW5nZSggZ2VuZXJhdGVUd29SZWN0YW5nbGVCdWlsZEFyZWFBbmRQZXJpbWV0ZXJDaGFsbGVuZ2UgKSApOyB9ICk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDI6XG4gICAgICAgIGNoYWxsZW5nZVNldC5wdXNoKCBnZW5lcmF0ZVVuaXF1ZUNoYWxsZW5nZSggZ2VuZXJhdGVVU2hhcGVkRmluZEFyZWFDaGFsbGVuZ2UgKSApO1xuICAgICAgICBjaGFsbGVuZ2VTZXQucHVzaCggZ2VuZXJhdGVVbmlxdWVDaGFsbGVuZ2UoIGdlbmVyYXRlT1NoYXBlZEZpbmRBcmVhQ2hhbGxlbmdlICkgKTtcbiAgICAgICAgY2hhbGxlbmdlU2V0LnB1c2goIGdlbmVyYXRlVW5pcXVlQ2hhbGxlbmdlKCBnZW5lcmF0ZVNoYXBlV2l0aERpYWdvbmFsRmluZEFyZWFDaGFsbGVuZ2UgKSApO1xuICAgICAgICBjaGFsbGVuZ2VTZXQgPSByYW5kb20uc2h1ZmZsZSggY2hhbGxlbmdlU2V0ICk7XG4gICAgICAgIHRyaWFuZ2xlQ2hhbGxlbmdlcyA9IHJhbmRvbS5zaHVmZmxlKCBbXG4gICAgICAgICAgZ2VuZXJhdGVVbmlxdWVDaGFsbGVuZ2UoIGdlbmVyYXRlSXNvc2NlbGVzUmlnaHRUcmlhbmdsZUxldmVsSHlwb3RlbnVzZUZpbmRBcmVhQ2hhbGxlbmdlICksXG4gICAgICAgICAgZ2VuZXJhdGVVbmlxdWVDaGFsbGVuZ2UoIGdlbmVyYXRlSXNvc2NlbGVzUmlnaHRUcmlhbmdsZVNsYW50ZWRIeXBvdGVudXNlRmluZEFyZWFDaGFsbGVuZ2UgKVxuICAgICAgICBdICk7XG4gICAgICAgIHRyaWFuZ2xlQ2hhbGxlbmdlcy5mb3JFYWNoKCBjaGFsbGVuZ2UgPT4geyBjaGFsbGVuZ2VTZXQucHVzaCggY2hhbGxlbmdlICk7IH0gKTtcbiAgICAgICAgY2hhbGxlbmdlU2V0LnB1c2goIGdlbmVyYXRlVW5pcXVlQ2hhbGxlbmdlKCBnZW5lcmF0ZUxhcmdlUmVjdFdpdGhQaWVjZU1pc3NpbmdDaGFsbGVuZ2UgKSApO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAzOlxuICAgICAgICAvLyBGb3IgdGhpcyBsZXZlbCwgdGhlIGdyaWQgaXMgZGlzYWJsZWQgZm9yIGFsbCBjaGFsbGVuZ2VzIGFuZCBzb21lIGRpZmZlcmVudCBidWlsZCBraXRzIGFyZSB1c2VkLlxuICAgICAgICBjaGFsbGVuZ2VTZXQucHVzaCggbWFrZUxldmVsNFNwZWNpZmljTW9kaWZpY2F0aW9ucyggZ2VuZXJhdGVVbmlxdWVDaGFsbGVuZ2UoIGdlbmVyYXRlVVNoYXBlZEZpbmRBcmVhQ2hhbGxlbmdlICkgKSApO1xuICAgICAgICBjaGFsbGVuZ2VTZXQucHVzaCggbWFrZUxldmVsNFNwZWNpZmljTW9kaWZpY2F0aW9ucyggZ2VuZXJhdGVVbmlxdWVDaGFsbGVuZ2UoIGdlbmVyYXRlT1NoYXBlZEZpbmRBcmVhQ2hhbGxlbmdlICkgKSApO1xuICAgICAgICBjaGFsbGVuZ2VTZXQucHVzaCggbWFrZUxldmVsNFNwZWNpZmljTW9kaWZpY2F0aW9ucyggZ2VuZXJhdGVVbmlxdWVDaGFsbGVuZ2UoIGdlbmVyYXRlT1NoYXBlZEZpbmRBcmVhQ2hhbGxlbmdlICkgKSApO1xuICAgICAgICBjaGFsbGVuZ2VTZXQucHVzaCggbWFrZUxldmVsNFNwZWNpZmljTW9kaWZpY2F0aW9ucyggZ2VuZXJhdGVVbmlxdWVDaGFsbGVuZ2UoIGdlbmVyYXRlU2hhcGVXaXRoRGlhZ29uYWxGaW5kQXJlYUNoYWxsZW5nZSApICkgKTtcbiAgICAgICAgY2hhbGxlbmdlU2V0ID0gcmFuZG9tLnNodWZmbGUoIGNoYWxsZW5nZVNldCApO1xuICAgICAgICAvLyBGb3IgdGhlIG5leHQgY2hhbGxlbmdlLCBjaG9vc2UgcmFuZG9tbHkgZnJvbSB0aGUgc2hhcGVzIHRoYXQgZG9uJ3QgaGF2ZSBkaWFnb25hbHMuXG4gICAgICAgIHRlbXBDaGFsbGVuZ2UgPSBnZW5lcmF0ZVVuaXF1ZUNoYWxsZW5nZSggcmFuZG9tRWxlbWVudCggWyBnZW5lcmF0ZUxTaGFwZWRGaW5kQXJlYUNoYWxsZW5nZSwgZ2VuZXJhdGVVU2hhcGVkRmluZEFyZWFDaGFsbGVuZ2UgXSApICk7XG4gICAgICAgIHRlbXBDaGFsbGVuZ2UudG9vbFNwZWMuZ3JpZENvbnRyb2wgPSBmYWxzZTtcbiAgICAgICAgdGVtcENoYWxsZW5nZS51c2VyU2hhcGVzID0gbnVsbDtcbiAgICAgICAgY2hhbGxlbmdlU2V0LnB1c2goIHRlbXBDaGFsbGVuZ2UgKTtcbiAgICAgICAgdGVtcENoYWxsZW5nZSA9IGdlbmVyYXRlVW5pcXVlQ2hhbGxlbmdlKCBnZW5lcmF0ZVNoYXBlV2l0aERpYWdvbmFsRmluZEFyZWFDaGFsbGVuZ2UgKTtcbiAgICAgICAgdGVtcENoYWxsZW5nZS50b29sU3BlYy5ncmlkQ29udHJvbCA9IGZhbHNlO1xuICAgICAgICB0ZW1wQ2hhbGxlbmdlLnVzZXJTaGFwZXMgPSBudWxsO1xuICAgICAgICBjaGFsbGVuZ2VTZXQucHVzaCggdGVtcENoYWxsZW5nZSApO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSA0OlxuICAgICAgICBfLnRpbWVzKCAzLCAoKSA9PiB7IGNoYWxsZW5nZVNldC5wdXNoKCBnZW5lcmF0ZVVuaXF1ZUNoYWxsZW5nZSggZ2VuZXJhdGVFYXN5UHJvcG9ydGlvbmFsQnVpbGRBcmVhQ2hhbGxlbmdlICkgKTsgfSApO1xuICAgICAgICBfLnRpbWVzKCAzLCAoKSA9PiB7IGNoYWxsZW5nZVNldC5wdXNoKCBnZW5lcmF0ZVVuaXF1ZUNoYWxsZW5nZSggZ2VuZXJhdGVIYXJkZXJQcm9wb3J0aW9uYWxCdWlsZEFyZWFDaGFsbGVuZ2UgKSApOyB9ICk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDU6XG4gICAgICAgIF8udGltZXMoIDMsICgpID0+IHsgY2hhbGxlbmdlU2V0LnB1c2goIGdlbmVyYXRlVW5pcXVlQ2hhbGxlbmdlKCBnZW5lcmF0ZUVhc3lQcm9wb3J0aW9uYWxCdWlsZEFyZWFBbmRQZXJpbWV0ZXJDaGFsbGVuZ2UgKSApOyB9ICk7XG4gICAgICAgIF8udGltZXMoIDMsICgpID0+IHsgY2hhbGxlbmdlU2V0LnB1c2goIGdlbmVyYXRlVW5pcXVlQ2hhbGxlbmdlKCBnZW5lcmF0ZUhhcmRlclByb3BvcnRpb25hbEJ1aWxkQXJlYUFuZFBlcmltZXRlckNoYWxsZW5nZSApICk7IH0gKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvciggYFVuc3VwcG9ydGVkIGdhbWUgbGV2ZWw6ICR7bGV2ZWx9YCApO1xuICAgIH1cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjaGFsbGVuZ2VTZXQubGVuZ3RoID09PSBudW1DaGFsbGVuZ2VzLCAnRXJyb3I6IERpZG5cXCd0IGdlbmVyYXRlIGNvcnJlY3QgbnVtYmVyIG9mIGNoYWxsZW5nZXMuJyApO1xuICAgIHJldHVybiBjaGFsbGVuZ2VTZXQ7XG4gIH07XG59XG5cbmFyZWFCdWlsZGVyLnJlZ2lzdGVyKCAnQXJlYUJ1aWxkZXJDaGFsbGVuZ2VGYWN0b3J5JywgQXJlYUJ1aWxkZXJDaGFsbGVuZ2VGYWN0b3J5ICk7XG5leHBvcnQgZGVmYXVsdCBBcmVhQnVpbGRlckNoYWxsZW5nZUZhY3Rvcnk7Il0sIm5hbWVzIjpbImRvdFJhbmRvbSIsIlV0aWxzIiwiVmVjdG9yMiIsIlNoYXBlIiwiRnJhY3Rpb24iLCJDb2xvciIsImFyZWFCdWlsZGVyIiwiQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMiLCJQZXJpbWV0ZXJTaGFwZSIsIkFyZWFCdWlsZGVyR2FtZUNoYWxsZW5nZSIsIkFyZWFCdWlsZGVyR2FtZU1vZGVsIiwiVU5JVF9TUVVBUkVfTEVOR1RIIiwiQXJlYUJ1aWxkZXJDaGFsbGVuZ2VGYWN0b3J5IiwicmFuZG9tIiwiVU5JVF9TUVVBUkVfU0hBUEUiLCJtb3ZlVG8iLCJsaW5lVG8iLCJjbG9zZSIsIm1ha2VJbW11dGFibGUiLCJIT1JJWk9OVEFMX0RPVUJMRV9TUVVBUkVfU0hBUEUiLCJWRVJUSUNBTF9ET1VCTEVfU1FVQVJFX1NIQVBFIiwiUVVBRF9TUVVBUkVfU0hBUEUiLCJSSUdIVF9CT1RUT01fVFJJQU5HTEVfU0hBUEUiLCJMRUZUX0JPVFRPTV9UUklBTkdMRV9TSEFQRSIsIlJJR0hUX1RPUF9UUklBTkdMRV9TSEFQRSIsIkxFRlRfVE9QX1RSSUFOR0xFX1NIQVBFIiwiQkFTSUNfUkVDVEFOR0xFU19TSEFQRV9LSVQiLCJzaGFwZSIsImNvbG9yIiwiR1JFRU5JU0hfQ09MT1IiLCJSRUNUQU5HTEVTX0FORF9UUklBTkdMRVNfU0hBUEVfS0lUIiwiRklORF9USEVfQVJFQV9DT0xPUl9DSE9PU0VSIiwiY29sb3JMaXN0Iiwic2h1ZmZsZSIsIlBBTEVfQkxVRV9DT0xPUiIsIlBJTktJU0hfQ09MT1IiLCJQVVJQTElTSF9DT0xPUiIsIk9SQU5HSVNIX0NPTE9SIiwiREFSS19HUkVFTl9DT0xPUiIsImluZGV4IiwibmV4dENvbG9yIiwibGVuZ3RoIiwibGFzdENvbG9yIiwiQlVJTERfSVRfQ09MT1JfQ0hPT1NFUiIsIkNPTE9SX1BBSVJfQ0hPT1NFUiIsImNvbG9yUGFpckxpc3QiLCJjb2xvcjEiLCJjb2xvcjIiLCJEQVJLX1BVUlBMRV9DT0xPUiIsIkRBUktfQkxVRV9DT0xPUiIsIlBVUlBMRV9QSU5LX0NPTE9SIiwibmV4dENvbG9yUGFpciIsImxhc3RDb2xvclBhaXIiLCJyYW5kb21FbGVtZW50IiwiYXJyYXkiLCJNYXRoIiwiZmxvb3IiLCJuZXh0RG91YmxlIiwiY3JlYXRlTW9ub2Nocm9tZVJlY3Rhbmd1bGFyU29sdXRpb25TcGVjIiwieCIsInkiLCJ3aWR0aCIsImhlaWdodCIsInNvbHV0aW9uU3BlYyIsImNvbHVtbiIsInJvdyIsInB1c2giLCJjZWxsQ29sdW1uIiwiY2VsbFJvdyIsImNyZWF0ZVR3b0NvbG9yUmVjdGFuZ3VsYXJTb2x1dGlvblNwZWMiLCJjb2xvcjFwcm9wb3J0aW9uIiwiY3JlYXRlQmFzaWNSZWN0YW5nbGVzU2hhcGVLaXQiLCJraXQiLCJmb3JFYWNoIiwia2l0RWxlbWVudCIsImNyZWF0ZVR3b1RvbmVSZWN0YW5nbGVCdWlsZEtpdCIsImNvbG9yMUVsZW1lbnQiLCJjb2xvcjJFbGVtZW50IiwiZmxpcFBlcmltZXRlclBvaW50c0hvcml6b250YWxseSIsInBlcmltZXRlclBvaW50TGlzdCIsInJlZmxlY3RlZFBvaW50cyIsIm1pblgiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsIm1heFgiLCJORUdBVElWRV9JTkZJTklUWSIsInBvaW50IiwibWluIiwibWF4IiwiZmxpcFBlcmltZXRlclBvaW50c1ZlcnRpY2FsbHkiLCJtaW5ZIiwibWF4WSIsImNyZWF0ZVJlY3Rhbmd1bGFyUGVyaW1ldGVyU2hhcGUiLCJmaWxsQ29sb3IiLCJlZGdlQ29sb3IiLCJjb2xvclV0aWxzRGFya2VyIiwiUEVSSU1FVEVSX0RBUktFTl9GQUNUT1IiLCJjcmVhdGVMU2hhcGVkUGVyaW1ldGVyU2hhcGUiLCJtaXNzaW5nQ29ybmVyIiwid2lkdGhNaXNzaW5nIiwiaGVpZ2h0TWlzc2luZyIsImFzc2VydCIsInBlcmltZXRlclBvaW50cyIsImNyZWF0ZVVTaGFwZWRQZXJpbWV0ZXJTaGFwZSIsInNpZGVXaXRoQ3V0b3V0IiwiY3V0b3V0V2lkdGgiLCJjdXRvdXRIZWlnaHQiLCJjdXRvdXRPZmZzZXQiLCJzZXRYWSIsImNyZWF0ZVBlcmltZXRlclNoYXBlV2l0aEhvbGUiLCJob2xlV2lkdGgiLCJob2xlSGVpZ2h0IiwiaG9sZVhPZmZzZXQiLCJob2xlWU9mZnNldCIsImV4dGVyaW9yUGVyaW1ldGVyUG9pbnRzIiwiaW50ZXJpb3JQZXJpbWV0ZXJQb2ludHMiLCJjcmVhdGVQZXJpbWV0ZXJTaGFwZVNsYW50ZWRIeXBvdGVudXNlUmlnaHRJc29zY2VsZXNUcmlhbmdsZSIsImVkZ2VMZW5ndGgiLCJjb3JuZXJQb3NpdGlvbiIsImNyZWF0ZVBlcmltZXRlclNoYXBlTGV2ZWxIeXBvdGVudXNlUmlnaHRJc29zY2VsZXNUcmlhbmdsZSIsImh5cG90ZW51c2VMZW5ndGgiLCJjcmVhdGVTaGFwZVdpdGhEaWFnb25hbEFuZE1pc3NpbmdDb3JuZXIiLCJkaWFnb25hbFBvc2l0aW9uIiwiZGlhZ29uYWxTcXVhcmVMZW5ndGgiLCJjdXRXaWR0aCIsImN1dEhlaWdodCIsImlzQ2hhbGxlbmdlU2ltaWxhciIsImNoYWxsZW5nZTEiLCJjaGFsbGVuZ2UyIiwiYnVpbGRTcGVjIiwicHJvcG9ydGlvbnMiLCJjb2xvcjFQcm9wb3J0aW9uIiwiZGVub21pbmF0b3IiLCJwZXJpbWV0ZXIiLCJhcmVhIiwiYmFja2dyb3VuZFNoYXBlIiwidW5pdEFyZWEiLCJpc0NoYWxsZW5nZVVuaXF1ZSIsImNoYWxsZW5nZSIsImNoYWxsZW5nZUlzVW5pcXVlIiwiaSIsImNoYWxsZW5nZUhpc3RvcnkiLCJnZW5lcmF0ZUJ1aWxkQXJlYUNoYWxsZW5nZSIsIm5leHRJbnRCZXR3ZWVuIiwiU0hBUEVfQk9BUkRfVU5JVF9XSURUSCIsIlNIQVBFX0JPQVJEX1VOSVRfSEVJR0hUIiwiZXhhbXBsZVNvbHV0aW9uIiwiY3JlYXRlQnVpbGRBcmVhQ2hhbGxlbmdlIiwiZ2VuZXJhdGVUd29SZWN0YW5nbGVCdWlsZEFyZWFBbmRQZXJpbWV0ZXJDaGFsbGVuZ2UiLCJ3aWR0aDEiLCJoZWlnaHQxIiwid2lkdGgyIiwiaGVpZ2h0MiIsIm92ZXJsYXAiLCJsZWZ0IiwidG9wIiwiY29uY2F0IiwiY3JlYXRlQnVpbGRBcmVhQW5kUGVyaW1ldGVyQ2hhbGxlbmdlIiwiZ2VuZXJhdGVCdWlsZEFyZWFBbmRQZXJpbWV0ZXJDaGFsbGVuZ2UiLCJnZW5lcmF0ZVJlY3Rhbmd1bGFyRmluZEFyZWFDaGFsbGVuZ2UiLCJwZXJpbWV0ZXJTaGFwZSIsImNyZWF0ZUZpbmRBcmVhQ2hhbGxlbmdlIiwiZ2VuZXJhdGVMU2hhcGVkRmluZEFyZWFDaGFsbGVuZ2UiLCJtaXNzaW5nV2lkdGgiLCJtaXNzaW5nSGVpZ2h0IiwiZ2VuZXJhdGVVU2hhcGVkRmluZEFyZWFDaGFsbGVuZ2UiLCJnZW5lcmF0ZU9TaGFwZWRGaW5kQXJlYUNoYWxsZW5nZSIsImdlbmVyYXRlSXNvc2NlbGVzUmlnaHRUcmlhbmdsZVNsYW50ZWRIeXBvdGVudXNlRmluZEFyZWFDaGFsbGVuZ2UiLCJnZW5lcmF0ZUlzb3NjZWxlc1JpZ2h0VHJpYW5nbGVMZXZlbEh5cG90ZW51c2VGaW5kQXJlYUNoYWxsZW5nZSIsIm1heEh5cG90ZW51c2UiLCJnZW5lcmF0ZUxhcmdlUmVjdFdpdGhDaGlwTWlzc2luZ0NoYWxsZW5nZSIsImdlbmVyYXRlTGFyZ2VSZWN0V2l0aFNtYWxsSG9sZU1pc3NpbmdDaGFsbGVuZ2UiLCJnZW5lcmF0ZUxhcmdlUmVjdFdpdGhQaWVjZU1pc3NpbmdDaGFsbGVuZ2UiLCJnZW5lcmF0ZVNoYXBlV2l0aERpYWdvbmFsRmluZEFyZWFDaGFsbGVuZ2UiLCJnZW5lcmF0ZUVhc3lQcm9wb3J0aW9uYWxCdWlsZEFyZWFDaGFsbGVuZ2UiLCJnZW5lcmF0ZVByb3BvcnRpb25hbEJ1aWxkQXJlYUNoYWxsZW5nZSIsImdlbmVyYXRlSGFyZGVyUHJvcG9ydGlvbmFsQnVpbGRBcmVhQ2hhbGxlbmdlIiwiZGlmZmljdWx0eSIsImluY2x1ZGVQZXJpbWV0ZXIiLCJmYWN0b3JzIiwibWluRmFjdG9yIiwibWF4RmFjdG9yIiwiZnJhY3Rpb25EZW5vbWluYXRvciIsImNvbG9yMUZyYWN0aW9uTnVtZXJhdG9yIiwiZ2NkIiwiY29sb3IxRnJhY3Rpb24iLCJjb2xvclBhaXIiLCJnZXRWYWx1ZSIsInVzZXJTaGFwZXMiLCJjcmVhdGVUd29Ub25lQnVpbGRBcmVhQW5kUGVyaW1ldGVyQ2hhbGxlbmdlIiwiY3JlYXRlVHdvVG9uZUJ1aWxkQXJlYUNoYWxsZW5nZSIsImdlbmVyYXRlRWFzeVByb3BvcnRpb25hbEJ1aWxkQXJlYUFuZFBlcmltZXRlckNoYWxsZW5nZSIsImdlbmVyYXRlSGFyZGVyUHJvcG9ydGlvbmFsQnVpbGRBcmVhQW5kUGVyaW1ldGVyQ2hhbGxlbmdlIiwiZ2VuZXJhdGVVbmlxdWVDaGFsbGVuZ2UiLCJnZW5lcmF0aW9uRnVuY3Rpb24iLCJ1bmlxdWVDaGFsbGVuZ2VHZW5lcmF0ZWQiLCJhdHRlbXB0cyIsInNsaWNlIiwibWFrZUxldmVsNFNwZWNpZmljTW9kaWZpY2F0aW9ucyIsInRvb2xTcGVjIiwiZ3JpZENvbnRyb2wiLCJleHRlcmlvclBlcmltZXRlcnMiLCJjcmVhdGlvbkxpbWl0IiwiZ2V0V2lkdGgiLCJnZXRIZWlnaHQiLCJnZW5lcmF0ZUNoYWxsZW5nZVNldCIsImxldmVsIiwibnVtQ2hhbGxlbmdlcyIsImNoYWxsZW5nZVNldCIsInRlbXBDaGFsbGVuZ2UiLCJ0cmlhbmdsZUNoYWxsZW5nZXMiLCJfIiwidGltZXMiLCJFcnJvciIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGVBQWUsa0NBQWtDO0FBQ3hELE9BQU9DLFdBQVcsOEJBQThCO0FBQ2hELE9BQU9DLGFBQWEsZ0NBQWdDO0FBQ3BELFNBQVNDLEtBQUssUUFBUSxpQ0FBaUM7QUFDdkQsT0FBT0MsY0FBYyw4Q0FBOEM7QUFDbkUsU0FBU0MsS0FBSyxRQUFRLG9DQUFvQztBQUMx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