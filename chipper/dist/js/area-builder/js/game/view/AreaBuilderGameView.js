// Copyright 2014-2024, University of Colorado Boulder
/**
 * Main view for the area builder game.
 *
 * @author John Blanco
 */ import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import FaceWithPointsNode from '../../../../scenery-phet/js/FaceWithPointsNode.js';
import NumberEntryControl from '../../../../scenery-phet/js/NumberEntryControl.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import Carousel from '../../../../sun/js/Carousel.js';
import Panel from '../../../../sun/js/Panel.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
import LevelCompletedNode from '../../../../vegas/js/LevelCompletedNode.js';
import VegasStrings from '../../../../vegas/js/VegasStrings.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderStrings from '../../AreaBuilderStrings.js';
import AreaBuilderSharedConstants from '../../common/AreaBuilderSharedConstants.js';
import AreaBuilderControlPanel from '../../common/view/AreaBuilderControlPanel.js';
import ShapeCreatorNode from '../../common/view/ShapeCreatorNode.js';
import ShapeNode from '../../common/view/ShapeNode.js';
import ShapePlacementBoardNode from '../../common/view/ShapePlacementBoardNode.js';
import AreaBuilderGameModel from '../model/AreaBuilderGameModel.js';
import BuildSpec from '../model/BuildSpec.js';
import GameState from '../model/GameState.js';
import AreaBuilderScoreboard from './AreaBuilderScoreboard.js';
import ColorProportionsPrompt from './ColorProportionsPrompt.js';
import GameIconFactory from './GameIconFactory.js';
import GameInfoBanner from './GameInfoBanner.js';
import StartGameLevelNode from './StartGameLevelNode.js';
import YouBuiltWindow from './YouBuiltWindow.js';
import YouEnteredWindow from './YouEnteredWindow.js';
const areaEqualsString = AreaBuilderStrings.areaEquals;
const areaQuestionString = AreaBuilderStrings.areaQuestion;
const aSolutionColonString = AreaBuilderStrings.aSolutionColon;
const aSolutionString = AreaBuilderStrings.aSolution;
const buildItString = AreaBuilderStrings.buildIt;
const checkString = VegasStrings.check;
const findTheAreaString = AreaBuilderStrings.findTheArea;
const nextString = VegasStrings.next;
const perimeterEqualsString = AreaBuilderStrings.perimeterEquals;
const solutionColonString = AreaBuilderStrings.solutionColon;
const solutionString = AreaBuilderStrings.solution;
const startOverString = AreaBuilderStrings.startOver;
const tryAgainString = VegasStrings.tryAgain;
const yourGoalString = AreaBuilderStrings.yourGoal;
// constants
const BUTTON_FONT = new PhetFont(18);
const BUTTON_FILL = PhetColorScheme.BUTTON_YELLOW;
const INFO_BANNER_HEIGHT = 60; // Height of the prompt and solution banners, empirically determined.
const GOAL_PROMPT_FONT = new PhetFont({
    size: 20,
    weight: 'bold'
});
const SPACE_AROUND_SHAPE_PLACEMENT_BOARD = AreaBuilderSharedConstants.CONTROLS_INSET;
const ITEMS_PER_CAROUSEL_PAGE = 4;
const BUTTON_TOUCH_AREA_DILATION = 7;
let AreaBuilderGameView = class AreaBuilderGameView extends ScreenView {
    // @private, When the game state changes, update the view with the appropriate buttons and readouts.
    handleGameStateChange(gameState) {
        // Hide all nodes - the appropriate ones will be shown later based on the current state.
        this.hideAllGameNodes();
        const challenge = this.model.currentChallengeProperty.get(); // convenience var
        // Show the nodes appropriate to the state
        switch(gameState){
            case GameState.CHOOSING_LEVEL:
                this.handleChoosingLevelState();
                break;
            case GameState.PRESENTING_INTERACTIVE_CHALLENGE:
                this.handlePresentingInteractiveChallengeState(challenge);
                break;
            case GameState.SHOWING_CORRECT_ANSWER_FEEDBACK:
                this.handleShowingCorrectAnswerFeedbackState(challenge);
                break;
            case GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_TRY_AGAIN:
                this.handleShowingIncorrectAnswerFeedbackTryAgainState(challenge);
                break;
            case GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_MOVE_ON:
                this.handleShowingIncorrectAnswerFeedbackMoveOnState(challenge);
                break;
            case GameState.DISPLAYING_CORRECT_ANSWER:
                this.handleDisplayingCorrectAnswerState(challenge);
                break;
            case GameState.SHOWING_LEVEL_RESULTS:
                this.handleShowingLevelResultsState();
                break;
            default:
                throw new Error(`Unhandled game state: ${gameState}`);
        }
    }
    // @private
    handleChoosingLevelState() {
        this.show([
            this.startGameLevelNode
        ]);
        this.hideChallenge();
    }
    // @private
    handlePresentingInteractiveChallengeState(challenge) {
        this.challengeLayer.pickable = null; // Pass through, prunes subtree, see Scenery documentation for details.
        this.presentChallenge();
        // Make a list of the nodes to be shown in this state.
        const nodesToShow = [
            this.scoreboard,
            this.controlPanel,
            this.checkAnswerButton,
            this.challengePromptBanner
        ];
        // Add the nodes that are only shown for certain challenge types or under certain conditions.
        if (challenge.checkSpec === 'areaEntered') {
            nodesToShow.push(this.numberEntryControl);
            nodesToShow.push(this.areaQuestionPrompt);
        }
        if (challenge.userShapes) {
            nodesToShow.push(this.shapeCarouselLayer);
            nodesToShow.push(this.eraserButton);
        }
        this.show(nodesToShow);
        this.showChallengeGraphics();
        this.updatedCheckButtonEnabledState();
        this.okayToUpdateYouBuiltWindow = true;
        if (this.clearDimensionsControlOnNextChallenge) {
            this.model.simSpecificModel.showDimensionsProperty.set(false);
            this.clearDimensionsControlOnNextChallenge = false;
        }
    }
    // @private
    handleShowingCorrectAnswerFeedbackState(challenge) {
        // Make a list of the nodes to be shown in this state.
        const nodesToShow = [
            this.scoreboard,
            this.controlPanel,
            this.nextButton,
            this.challengePromptBanner,
            this.faceWithPointsNode
        ];
        // Update and show the nodes that vary based on the challenge configurations.
        if (challenge.buildSpec) {
            this.updateYouBuiltWindow(challenge);
            nodesToShow.push(this.youBuiltWindow);
        } else {
            this.updateYouEnteredWindow(challenge);
            nodesToShow.push(this.youEnteredWindow);
        }
        // Give the user the appropriate audio and visual feedback
        this.gameAudioPlayer.correctAnswer();
        this.faceWithPointsNode.smile();
        this.faceWithPointsNode.setPoints(this.model.getChallengeCurrentPointValue());
        // Disable interaction with the challenge elements.
        this.challengeLayer.pickable = false;
        // Make the nodes visible
        this.show(nodesToShow);
    }
    // @private
    handleShowingIncorrectAnswerFeedbackTryAgainState(challenge) {
        // Make a list of the nodes to be shown in this state.
        const nodesToShow = [
            this.scoreboard,
            this.controlPanel,
            this.tryAgainButton,
            this.challengePromptBanner,
            this.faceWithPointsNode
        ];
        // Add the nodes whose visibility varies based on the challenge configuration.
        if (challenge.checkSpec === 'areaEntered') {
            nodesToShow.push(this.numberEntryControl);
            nodesToShow.push(this.areaQuestionPrompt);
        }
        if (challenge.userShapes) {
            nodesToShow.push(this.shapeCarouselLayer);
            nodesToShow.push(this.eraserButton);
        }
        // Give the user the appropriate feedback.
        this.gameAudioPlayer.wrongAnswer();
        this.faceWithPointsNode.frown();
        this.faceWithPointsNode.setPoints(this.model.scoreProperty.get());
        if (challenge.checkSpec === 'areaEntered') {
            // Set the keypad to allow the user to start entering a new value.
            this.numberEntryControl.setClearOnNextKeyPress(true);
        }
        // Show the nodes
        this.show(nodesToShow);
    }
    // @private
    handleShowingIncorrectAnswerFeedbackMoveOnState(challenge) {
        // Make a list of the nodes to be shown in this state.
        const nodesToShow = [
            this.scoreboard,
            this.controlPanel,
            this.challengePromptBanner,
            this.faceWithPointsNode
        ];
        // Add the nodes whose visibility varies based on the challenge configuration.
        if (challenge.buildSpec) {
            nodesToShow.push(this.showASolutionButton);
            this.updateYouBuiltWindow(challenge);
            nodesToShow.push(this.youBuiltWindow);
            if (challenge.userShapes) {
                nodesToShow.push(this.shapeCarouselLayer);
                nodesToShow.push(this.eraserButton);
            }
        } else {
            nodesToShow.push(this.solutionButton);
            this.updateYouEnteredWindow(challenge);
            nodesToShow.push(this.youEnteredWindow);
        }
        this.show(nodesToShow);
        // Give the user the appropriate feedback
        this.gameAudioPlayer.wrongAnswer();
        this.faceWithPointsNode.frown();
        this.faceWithPointsNode.setPoints(this.model.scoreProperty.get());
        // For 'built it' style challenges, the user can still interact while in this state in case they want to try
        // to get it right.  In 'find the area' challenges, further interaction is disallowed.
        if (challenge.checkSpec === 'areaEntered') {
            this.challengeLayer.pickable = false;
        }
        // Show the nodes.
        this.show(nodesToShow);
    }
    // @private
    handleDisplayingCorrectAnswerState(challenge) {
        // Make a list of the nodes to be shown in this state.
        const nodesToShow = [
            this.scoreboard,
            this.controlPanel,
            this.nextButton,
            this.solutionBanner
        ];
        // Keep the appropriate feedback window visible.
        if (challenge.buildSpec) {
            nodesToShow.push(this.youBuiltWindow);
        } else {
            nodesToShow.push(this.youEnteredWindow);
        }
        // Update the solution banner.
        this.solutionBanner.reset();
        if (challenge.buildSpec) {
            this.solutionBanner.titleStringProperty.value = aSolutionColonString;
            this.solutionBanner.buildSpecProperty.value = challenge.buildSpec;
        } else {
            this.solutionBanner.titleStringProperty.value = solutionColonString;
            this.solutionBanner.areaToFindProperty.value = challenge.backgroundShape.unitArea;
        }
        this.showChallengeGraphics();
        // Disable interaction with the challenge elements.
        this.challengeLayer.pickable = false;
        // Turn on the dimensions indicator, since it may make the answer more clear for the user.
        this.clearDimensionsControlOnNextChallenge = !this.model.simSpecificModel.showDimensionsProperty.get();
        this.model.simSpecificModel.showDimensionsProperty.set(true);
        // Show the nodes.
        this.show(nodesToShow);
    }
    // @private
    handleShowingLevelResultsState() {
        if (this.model.scoreProperty.get() === this.model.maxPossibleScore) {
            this.gameAudioPlayer.gameOverPerfectScore();
        } else if (this.model.scoreProperty.get() === 0) {
            this.gameAudioPlayer.gameOverZeroScore();
        } else {
            this.gameAudioPlayer.gameOverImperfectScore();
        }
        this.showLevelResultsNode();
        this.hideChallenge();
    }
    // @private Update the window that depicts what the user has built.
    updateYouBuiltWindow(challenge) {
        assert && assert(challenge.buildSpec, 'This method should only be called for challenges that include a build spec.');
        const userBuiltSpec = new BuildSpec(this.areaOfUserCreatedShape, challenge.buildSpec.perimeter ? this.perimeterOfUserCreatedShape : null, challenge.buildSpec.proportions ? {
            color1: challenge.buildSpec.proportions.color1,
            color2: challenge.buildSpec.proportions.color2,
            color1Proportion: this.color1Proportion
        } : null);
        this.youBuiltWindow.setBuildSpec(userBuiltSpec);
        this.youBuiltWindow.setColorBasedOnAnswerCorrectness(userBuiltSpec.equals(challenge.buildSpec));
        this.youBuiltWindow.centerY = this.shapeBoardOriginalBounds.centerY;
        this.youBuiltWindow.centerX = (this.layoutBounds.maxX + this.shapeBoardOriginalBounds.maxX) / 2;
    }
    // @private Update the window that depicts what the user has entered using the keypad.
    updateYouEnteredWindow(challenge) {
        assert && assert(challenge.checkSpec === 'areaEntered', 'This method should only be called for find-the-area style challenges.');
        this.youEnteredWindow.setValueEntered(this.model.simSpecificModel.areaGuess);
        this.youEnteredWindow.setColorBasedOnAnswerCorrectness(challenge.backgroundShape.unitArea === this.model.simSpecificModel.areaGuess);
        this.youEnteredWindow.centerY = this.shapeBoardOriginalBounds.centerY;
        this.youEnteredWindow.centerX = (this.layoutBounds.maxX + this.shapeBoardOriginalBounds.maxX) / 2;
    }
    // @private Grab a snapshot of whatever the user has built or entered
    updateUserAnswer() {
        // Save the parameters of what the user has built, if they've built anything.
        this.areaOfUserCreatedShape = this.model.simSpecificModel.shapePlacementBoard.areaAndPerimeterProperty.get().area;
        this.perimeterOfUserCreatedShape = this.model.simSpecificModel.shapePlacementBoard.areaAndPerimeterProperty.get().perimeter;
        const challenge = this.model.currentChallengeProperty.get(); // convenience var
        if (challenge.buildSpec && challenge.buildSpec.proportions) {
            this.color1Proportion = this.model.simSpecificModel.getProportionOfColor(challenge.buildSpec.proportions.color1);
        } else {
            this.color1Proportion = null;
        }
        // Submit the user's area guess, if there is one.
        this.model.simSpecificModel.areaGuess = this.numberEntryControl.value;
    }
    // @private Returns true if any shape is animating or user controlled, false if not.
    isAnyShapeMoving() {
        for(let i = 0; i < this.model.simSpecificModel.movableShapes.length; i++){
            if (this.model.simSpecificModel.movableShapes.get(i).animatingProperty.get() || this.model.simSpecificModel.movableShapes.get(i).userControlledProperty.get()) {
                return true;
            }
        }
        return false;
    }
    /**
   * @private
   */ disposeCurrentCarousel() {
        this.activeShapeNodeCreators.length = 0;
        if (this.carousel) {
            this.carousel.dispose();
            this.carousel = null;
        }
    }
    /**
   * Present the challenge to the user and set things up so that they can submit their answer.
   * @private
   */ presentChallenge() {
        if (this.model.incorrectGuessesOnCurrentChallenge === 0) {
            // Clean up previous challenge.
            this.model.simSpecificModel.clearShapePlacementBoard();
            this.challengePromptBanner.reset();
            this.disposeCurrentCarousel();
            const challenge = this.model.currentChallengeProperty.get(); // Convenience var
            // Set up the challenge prompt banner, which appears above the shape placement board.
            this.challengePromptBanner.titleStringProperty.value = challenge.buildSpec ? buildItString : findTheAreaString;
            // If needed, set up the goal prompt that will initially appear over the shape placement board (in the z-order).
            if (challenge.buildSpec) {
                this.buildPromptVBox.removeAllChildren();
                this.buildPromptVBox.addChild(this.yourGoalTitle);
                const areaGoalNode = new Text(StringUtils.format(areaEqualsString, challenge.buildSpec.area), {
                    font: GOAL_PROMPT_FONT,
                    maxWidth: this.shapeBoardOriginalBounds.width * 0.9
                });
                if (challenge.buildSpec.proportions) {
                    const areaPrompt = new Node();
                    areaPrompt.addChild(areaGoalNode);
                    areaGoalNode.string = `${areaGoalNode.string},`;
                    const colorProportionsPrompt = new ColorProportionsPrompt(challenge.buildSpec.proportions.color1, challenge.buildSpec.proportions.color2, challenge.buildSpec.proportions.color1Proportion, {
                        font: new PhetFont({
                            size: 16,
                            weight: 'bold'
                        }),
                        left: areaGoalNode.width + 10,
                        centerY: areaGoalNode.centerY,
                        maxWidth: this.shapeBoardOriginalBounds.width * 0.9
                    });
                    areaPrompt.addChild(colorProportionsPrompt);
                    // make sure the prompt will fit on the board - important for translatability
                    if (areaPrompt.width > this.shapeBoardOriginalBounds.width * 0.9) {
                        areaPrompt.scale(this.shapeBoardOriginalBounds.width * 0.9 / areaPrompt.width);
                    }
                    this.buildPromptVBox.addChild(areaPrompt);
                } else {
                    this.buildPromptVBox.addChild(areaGoalNode);
                }
                if (challenge.buildSpec.perimeter) {
                    this.buildPromptVBox.addChild(new Text(StringUtils.format(perimeterEqualsString, challenge.buildSpec.perimeter), {
                        font: GOAL_PROMPT_FONT,
                        maxWidth: this.maxShapeBoardTextWidth
                    }));
                }
                // Center the panel over the shape board and make it visible.
                this.buildPromptPanel.centerX = this.shapeBoardOriginalBounds.centerX;
                this.buildPromptPanel.centerY = this.shapeBoardOriginalBounds.centerY;
                this.buildPromptPanel.visible = true;
                this.buildPromptPanel.opacity = 1; // Necessary because the board is set to fade out elsewhere.
            } else {
                this.buildPromptPanel.visible = false;
            }
            // Set the state of the control panel.
            this.controlPanel.dimensionsIcon.setGridVisible(!challenge.backgroundShape);
            this.controlPanel.gridControlVisibleProperty.set(challenge.toolSpec.gridControl);
            this.controlPanel.dimensionsControlVisibleProperty.set(challenge.toolSpec.dimensionsControl);
            if (challenge.backgroundShape) {
                this.controlPanel.dimensionsIcon.setColor(challenge.backgroundShape.fillColor);
            } else if (challenge.userShapes) {
                this.controlPanel.dimensionsIcon.setColor(challenge.userShapes[0].color);
            } else {
                this.controlPanel.dimensionsIcon.setColor(AreaBuilderSharedConstants.GREENISH_COLOR);
            }
            // Create the carousel if included as part of this challenge.
            if (challenge.userShapes !== null) {
                challenge.userShapes.forEach((userShapeSpec)=>{
                    const creatorNodeOptions = {
                        gridSpacing: AreaBuilderGameModel.UNIT_SQUARE_LENGTH,
                        shapeDragBounds: this.layoutBounds,
                        nonMovingAncestor: this.shapeCarouselLayer
                    };
                    if (userShapeSpec.creationLimit) {
                        creatorNodeOptions.creationLimit = userShapeSpec.creationLimit;
                    }
                    this.activeShapeNodeCreators.push({
                        createNode: ()=>new ShapeCreatorNode(userShapeSpec.shape, userShapeSpec.color, this.model.simSpecificModel.addUserCreatedMovableShape.bind(this.model.simSpecificModel), creatorNodeOptions)
                    });
                });
                // Add a scrolling carousel.
                this.carousel = new Carousel(this.activeShapeNodeCreators, {
                    orientation: 'horizontal',
                    itemsPerPage: ITEMS_PER_CAROUSEL_PAGE,
                    centerX: this.shapeBoardOriginalBounds.centerX,
                    top: this.shapeBoardOriginalBounds.bottom + SPACE_AROUND_SHAPE_PLACEMENT_BOARD,
                    fill: AreaBuilderSharedConstants.CONTROL_PANEL_BACKGROUND_COLOR
                });
                this.shapeCarouselLayer.addChild(this.carousel);
            }
        }
    }
    // @private, Utility method for hiding all of the game nodes whose visibility changes during the course of a challenge.
    hideAllGameNodes() {
        this.gameControlButtons.forEach((button)=>{
            button.visible = false;
        });
        this.setNodeVisibility(false, [
            this.startGameLevelNode,
            this.faceWithPointsNode,
            this.scoreboard,
            this.controlPanel,
            this.challengePromptBanner,
            this.solutionBanner,
            this.numberEntryControl,
            this.areaQuestionPrompt,
            this.youBuiltWindow,
            this.youEnteredWindow,
            this.shapeCarouselLayer,
            this.eraserButton
        ]);
    }
    // @private
    show(nodesToShow) {
        nodesToShow.forEach((nodeToShow)=>{
            nodeToShow.visible = true;
        });
    }
    // @private
    setNodeVisibility(isVisible, nodes) {
        nodes.forEach((node)=>{
            node.visible = isVisible;
        });
    }
    // @private
    hideChallenge() {
        this.challengeLayer.visible = false;
        this.controlLayer.visible = false;
    }
    // @private Show the graphic model elements for this challenge.
    showChallengeGraphics() {
        this.challengeLayer.visible = true;
        this.controlLayer.visible = true;
    }
    // @private
    updatedCheckButtonEnabledState() {
        if (this.model.currentChallengeProperty.get()) {
            if (this.model.currentChallengeProperty.get().checkSpec === 'areaEntered') {
                this.checkAnswerButton.enabled = this.numberEntryControl.keypad.valueStringProperty.value.length > 0;
            } else {
                this.checkAnswerButton.enabled = this.model.simSpecificModel.shapePlacementBoard.areaAndPerimeterProperty.get().area > 0;
            }
        }
    }
    // @private
    showLevelResultsNode() {
        // Set a new "level completed" node based on the results.
        let levelCompletedNode = new LevelCompletedNode(this.model.levelProperty.get() + 1, this.model.scoreProperty.get(), this.model.maxPossibleScore, this.model.challengesPerSet, this.model.timerEnabledProperty.get(), this.model.elapsedTimeProperty.get(), this.model.bestTimes[this.model.levelProperty.get()], this.model.newBestTime, ()=>{
            this.model.gameStateProperty.set(GameState.CHOOSING_LEVEL);
            this.rootNode.removeChild(levelCompletedNode);
            levelCompletedNode = null;
        }, {
            center: this.layoutBounds.center
        });
        // Add the node.
        this.rootNode.addChild(levelCompletedNode);
    }
    /**
   * @param {AreaBuilderGameModel} gameModel
   */ constructor(gameModel){
        super({
            layoutBounds: AreaBuilderSharedConstants.LAYOUT_BOUNDS
        });
        const self = this;
        this.model = gameModel;
        // Create the game audio player.
        this.gameAudioPlayer = new GameAudioPlayer();
        // Create a root node and send to back so that the layout bounds box can be made visible if needed.
        this.rootNode = new Node();
        this.addChild(this.rootNode);
        this.rootNode.moveToBack();
        // Add layers used to control game appearance.
        this.controlLayer = new Node();
        this.rootNode.addChild(this.controlLayer);
        this.challengeLayer = new Node();
        this.rootNode.addChild(this.challengeLayer);
        // Add the node that allows the user to choose a game level to play.
        this.startGameLevelNode = new StartGameLevelNode((level)=>{
            this.numberEntryControl.clear();
            gameModel.startLevel(level);
        }, ()=>{
            gameModel.reset();
            this.disposeCurrentCarousel();
        }, gameModel.timerEnabledProperty, [
            GameIconFactory.createIcon(1),
            GameIconFactory.createIcon(2),
            GameIconFactory.createIcon(3),
            GameIconFactory.createIcon(4),
            GameIconFactory.createIcon(5),
            GameIconFactory.createIcon(6)
        ], gameModel.bestScoreProperties, {
            numStarsOnButtons: gameModel.challengesPerSet,
            perfectScore: gameModel.maxPossibleScore,
            numLevels: gameModel.numberOfLevels,
            numButtonRows: 2,
            controlsInset: AreaBuilderSharedConstants.CONTROLS_INSET
        });
        this.rootNode.addChild(this.startGameLevelNode);
        // Set up the constant portions of the challenge view.
        this.shapeBoard = new ShapePlacementBoardNode(gameModel.simSpecificModel.shapePlacementBoard);
        this.shapeBoardOriginalBounds = this.shapeBoard.bounds.copy(); // Necessary because the shape board's bounds can vary when shapes are placed.
        this.maxShapeBoardTextWidth = this.shapeBoardOriginalBounds.width * 0.9;
        this.yourGoalTitle = new Text(yourGoalString, {
            font: new PhetFont({
                size: 24,
                weight: 'bold'
            }),
            maxWidth: this.maxShapeBoardTextWidth
        });
        this.challengeLayer.addChild(this.shapeBoard);
        this.eraserButton = new EraserButton({
            right: this.shapeBoard.left,
            top: this.shapeBoard.bottom + SPACE_AROUND_SHAPE_PLACEMENT_BOARD,
            touchAreaXDilation: BUTTON_TOUCH_AREA_DILATION,
            touchAreaYDilation: BUTTON_TOUCH_AREA_DILATION,
            listener: ()=>{
                const challenge = gameModel.currentChallengeProperty.get();
                let shapeReleaseMode = 'fade';
                if (challenge.checkSpec === 'areaEntered' && challenge.userShapes && challenge.userShapes[0].creationLimit) {
                    // In the case where there is a limited number of shapes, have them animate back to the carousel instead of
                    // fading away so that the user understands that the stash is being replenished.
                    shapeReleaseMode = 'animateHome';
                }
                gameModel.simSpecificModel.shapePlacementBoard.releaseAllShapes(shapeReleaseMode);
                // If the game was showing the user incorrect feedback when they pressed this button, auto-advance to the
                // next state.
                if (gameModel.gameStateProperty.value === GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_TRY_AGAIN) {
                    this.numberEntryControl.clear();
                    gameModel.tryAgain();
                }
            }
        });
        this.challengeLayer.addChild(this.eraserButton);
        this.youBuiltWindow = new YouBuiltWindow(this.layoutBounds.width - this.shapeBoard.right - 14);
        this.challengeLayer.addChild(this.youBuiltWindow);
        this.youEnteredWindow = new YouEnteredWindow(this.layoutBounds.width - this.shapeBoard.right - 14);
        this.challengeLayer.addChild(this.youEnteredWindow);
        this.challengePromptBanner = new GameInfoBanner(this.shapeBoard.width, INFO_BANNER_HEIGHT, '#1b1464', {
            left: this.shapeBoard.left,
            bottom: this.shapeBoard.top - SPACE_AROUND_SHAPE_PLACEMENT_BOARD
        });
        this.challengeLayer.addChild(this.challengePromptBanner);
        this.solutionBanner = new GameInfoBanner(this.shapeBoard.width, INFO_BANNER_HEIGHT, '#fbb03b', {
            left: this.shapeBoard.left,
            bottom: this.shapeBoard.top - SPACE_AROUND_SHAPE_PLACEMENT_BOARD
        });
        this.challengeLayer.addChild(this.solutionBanner);
        // Add the control panel
        this.controlPanel = new AreaBuilderControlPanel(gameModel.simSpecificModel.showGridOnBoardProperty, gameModel.simSpecificModel.showDimensionsProperty, {
            centerX: (this.layoutBounds.x + this.shapeBoard.left) / 2,
            bottom: this.shapeBoard.bottom
        });
        this.controlLayer.addChild(this.controlPanel);
        // Add the scoreboard.
        this.scoreboard = new AreaBuilderScoreboard(gameModel.levelProperty, gameModel.challengeIndexProperty, gameModel.challengesPerSet, gameModel.scoreProperty, gameModel.elapsedTimeProperty, {
            centerX: (this.layoutBounds.x + this.shapeBoard.left) / 2,
            top: this.shapeBoard.top,
            maxWidth: this.controlPanel.width
        });
        this.controlLayer.addChild(this.scoreboard);
        // Control visibility of elapsed time indicator in the scoreboard.
        this.model.timerEnabledProperty.link((timerEnabled)=>{
            this.scoreboard.timeVisibleProperty.set(timerEnabled);
        });
        // Add the button for returning to the level selection screen.
        this.controlLayer.addChild(new RectangularPushButton({
            content: new Text(startOverString, {
                font: BUTTON_FONT,
                maxWidth: this.controlPanel.width
            }),
            touchAreaXDilation: BUTTON_TOUCH_AREA_DILATION,
            touchAreaYDilation: BUTTON_TOUCH_AREA_DILATION,
            listener: ()=>{
                this.interruptSubtreeInput();
                gameModel.simSpecificModel.reset();
                gameModel.setChoosingLevelState();
            },
            baseColor: BUTTON_FILL,
            centerX: this.scoreboard.centerX,
            centerY: this.solutionBanner.centerY
        }));
        // Add the 'Build Prompt' node that is shown temporarily over the board to instruct the user about what to build.
        this.buildPromptVBox = new VBox({
            children: [
                this.yourGoalTitle
            ],
            spacing: 20
        });
        this.buildPromptPanel = new Panel(this.buildPromptVBox, {
            stroke: null,
            xMargin: 10,
            yMargin: 10
        });
        this.challengeLayer.addChild(this.buildPromptPanel);
        // Define some variables for taking a snapshot of the user's solution.
        this.areaOfUserCreatedShape = 0;
        this.perimeterOfUserCreatedShape = 0;
        this.color1Proportion = null;
        // Add and lay out the game control buttons.
        this.gameControlButtons = [];
        const buttonOptions = {
            font: BUTTON_FONT,
            baseColor: BUTTON_FILL,
            cornerRadius: 4,
            touchAreaXDilation: BUTTON_TOUCH_AREA_DILATION,
            touchAreaYDilation: BUTTON_TOUCH_AREA_DILATION,
            maxWidth: (this.layoutBounds.maxX - this.shapeBoardOriginalBounds.maxX) * 0.9
        };
        this.checkAnswerButton = new TextPushButton(checkString, merge({
            listener: ()=>{
                this.updateUserAnswer();
                gameModel.checkAnswer();
            }
        }, buttonOptions));
        this.gameControlButtons.push(this.checkAnswerButton);
        this.nextButton = new TextPushButton(nextString, merge({
            listener: ()=>{
                this.numberEntryControl.clear();
                gameModel.nextChallenge();
            }
        }, buttonOptions));
        this.gameControlButtons.push(this.nextButton);
        this.tryAgainButton = new TextPushButton(tryAgainString, merge({
            listener: ()=>{
                this.numberEntryControl.clear();
                gameModel.tryAgain();
            }
        }, buttonOptions));
        this.gameControlButtons.push(this.tryAgainButton);
        // Solution button for 'find the area' style of challenge, which has one specific answer.
        this.solutionButton = new TextPushButton(solutionString, merge({
            listener: ()=>{
                gameModel.displayCorrectAnswer();
            }
        }, buttonOptions));
        this.gameControlButtons.push(this.solutionButton);
        // Solution button for 'build it' style of challenge, which has many potential answers.
        this.showASolutionButton = new TextPushButton(aSolutionString, merge({
            listener: ()=>{
                this.okayToUpdateYouBuiltWindow = false;
                gameModel.displayCorrectAnswer();
            }
        }, buttonOptions));
        this.gameControlButtons.push(this.showASolutionButton);
        const buttonCenterX = (this.layoutBounds.width + this.shapeBoard.right) / 2;
        const buttonBottom = this.shapeBoard.bottom;
        this.gameControlButtons.forEach((button)=>{
            button.centerX = buttonCenterX;
            button.bottom = buttonBottom;
            this.controlLayer.addChild(button);
        });
        // Add the number entry control, which is only visible on certain challenge types.
        this.numberEntryControl = new NumberEntryControl({
            centerX: buttonCenterX,
            bottom: this.checkAnswerButton.top - 10
        });
        this.challengeLayer.addChild(this.numberEntryControl);
        this.areaQuestionPrompt = new Text(areaQuestionString, {
            font: new PhetFont(20),
            centerX: this.numberEntryControl.centerX,
            bottom: this.numberEntryControl.top - 10,
            maxWidth: this.numberEntryControl.width
        });
        this.challengeLayer.addChild(this.areaQuestionPrompt);
        this.numberEntryControl.keypad.valueStringProperty.link((valueString)=>{
            // Handle the case where the user just starts entering digits instead of pressing the "Try Again" button.  In
            // this case, we go ahead and make the state transition to the next state.
            if (gameModel.gameStateProperty.value === GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_TRY_AGAIN) {
                gameModel.tryAgain();
            }
            // Update the state of the 'Check' button when the user enters new digits.
            this.updatedCheckButtonEnabledState();
        });
        // Add the 'feedback node' that is used to visually indicate correct and incorrect answers.
        this.faceWithPointsNode = new FaceWithPointsNode({
            faceDiameter: 85,
            pointsAlignment: 'rightBottom',
            centerX: buttonCenterX,
            top: buttonBottom + 20,
            pointsFont: new PhetFont({
                size: 20,
                weight: 'bold'
            })
        });
        this.addChild(this.faceWithPointsNode);
        // Handle comings and goings of model shapes.
        gameModel.simSpecificModel.movableShapes.addItemAddedListener((addedShape)=>{
            // Create and add the view representation for this shape.
            const shapeNode = new ShapeNode(addedShape, this.layoutBounds);
            this.challengeLayer.addChild(shapeNode);
            // Add a listener that handles changes to the userControlled state.
            const userControlledListener = (userControlled)=>{
                if (userControlled) {
                    shapeNode.moveToFront();
                    // If the game was in the state where it was prompting the user to try again, and the user started
                    // interacting with shapes without pressing the 'Try Again' button, go ahead and make the state change
                    // automatically.
                    if (gameModel.gameStateProperty.value === GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_TRY_AGAIN) {
                        gameModel.tryAgain();
                    }
                }
            };
            addedShape.userControlledProperty.link(userControlledListener);
            // Add the removal listener for if and when this shape is removed from the model.
            gameModel.simSpecificModel.movableShapes.addItemRemovedListener(function removalListener(removedShape) {
                if (removedShape === addedShape) {
                    self.challengeLayer.removeChild(shapeNode);
                    shapeNode.dispose();
                    addedShape.userControlledProperty.unlink(userControlledListener);
                    gameModel.simSpecificModel.movableShapes.removeItemRemovedListener(removalListener);
                }
            });
            // If the initial build prompt is visible, hide it.
            if (this.buildPromptPanel.opacity === 1) {
                // using a function instead, see Seasons sim, PanelNode.js for an example.
                new Animation({
                    from: this.buildPromptPanel.opacity,
                    to: 0,
                    setValue: (opacity)=>{
                        this.buildPromptPanel.opacity = opacity;
                    },
                    duration: 0.5,
                    easing: Easing.CUBIC_IN_OUT
                }).start();
            }
            // If this is a 'built it' style challenge, and this is the first element being added to the board, add the
            // build spec to the banner so that the user can reference it as they add more shapes to the board.
            if (gameModel.currentChallengeProperty.get().buildSpec && this.challengePromptBanner.buildSpecProperty.value === null) {
                this.challengePromptBanner.buildSpecProperty.value = gameModel.currentChallengeProperty.get().buildSpec;
            }
        });
        gameModel.simSpecificModel.movableShapes.addItemRemovedListener(()=>{
            // If the challenge is a 'build it' style challenge, and the game is in the state where the user is being given
            // the opportunity to view a solution, and the user just removed a piece, check if they now have the correct
            // answer.
            if (gameModel.gameStateProperty.value === GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_MOVE_ON && !this.isAnyShapeMoving()) {
                this.model.checkAnswer();
            }
        });
        gameModel.simSpecificModel.shapePlacementBoard.areaAndPerimeterProperty.link((areaAndPerimeter)=>{
            this.updatedCheckButtonEnabledState();
            // If the challenge is a 'build it' style challenge, and the game is in the state where the user is being
            // given the opportunity to view a solution, and they just changed what they had built, update the 'you built'
            // window.
            if (gameModel.gameStateProperty.value === GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_MOVE_ON && this.model.currentChallengeProperty.get().buildSpec && this.okayToUpdateYouBuiltWindow) {
                this.updateUserAnswer();
                this.updateYouBuiltWindow(this.model.currentChallengeProperty.get());
                // If the user has put all shapes away, check to see if they now have the correct answer.
                if (!this.isAnyShapeMoving()) {
                    this.model.checkAnswer();
                }
            }
        });
        // @private {GroupItemOptions[]} - Keep track of active ShapeCreatorNode instances so that they can be disposed.
        this.activeShapeNodeCreators = [];
        // @private {Carousel|null}
        this.carousel = null; // for disposal
        // Various other initialization
        this.levelCompletedNode = null; // @private
        this.shapeCarouselLayer = new Node({
            interruptSubtreeOnInvisible: false
        }); // @private
        this.challengeLayer.addChild(this.shapeCarouselLayer);
        this.clearDimensionsControlOnNextChallenge = false; // @private
        // Hook up the update function for handling changes to game state.
        gameModel.gameStateProperty.link(this.handleGameStateChange.bind(this));
        // Set up a flag to block updates of the 'You Built' window when showing the solution.  This is necessary because
        // adding the shapes to the board in order to show the solution triggers updates of this window.
        this.okayToUpdateYouBuiltWindow = true; // @private
    }
};
areaBuilder.register('AreaBuilderGameView', AreaBuilderGameView);
export default AreaBuilderGameView;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9nYW1lL3ZpZXcvQXJlYUJ1aWxkZXJHYW1lVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBNYWluIHZpZXcgZm9yIHRoZSBhcmVhIGJ1aWxkZXIgZ2FtZS5cbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXG4gKi9cblxuaW1wb3J0IFNjcmVlblZpZXcgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xuaW1wb3J0IEVyYXNlckJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9FcmFzZXJCdXR0b24uanMnO1xuaW1wb3J0IEZhY2VXaXRoUG9pbnRzTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvRmFjZVdpdGhQb2ludHNOb2RlLmpzJztcbmltcG9ydCBOdW1iZXJFbnRyeUNvbnRyb2wgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL051bWJlckVudHJ5Q29udHJvbC5qcyc7XG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Q29sb3JTY2hlbWUuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgeyBOb2RlLCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBSZWN0YW5ndWxhclB1c2hCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJQdXNoQnV0dG9uLmpzJztcbmltcG9ydCBUZXh0UHVzaEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9UZXh0UHVzaEJ1dHRvbi5qcyc7XG5pbXBvcnQgQ2Fyb3VzZWwgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0Nhcm91c2VsLmpzJztcbmltcG9ydCBQYW5lbCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvUGFuZWwuanMnO1xuaW1wb3J0IEFuaW1hdGlvbiBmcm9tICcuLi8uLi8uLi8uLi90d2l4dC9qcy9BbmltYXRpb24uanMnO1xuaW1wb3J0IEVhc2luZyBmcm9tICcuLi8uLi8uLi8uLi90d2l4dC9qcy9FYXNpbmcuanMnO1xuaW1wb3J0IEdhbWVBdWRpb1BsYXllciBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9HYW1lQXVkaW9QbGF5ZXIuanMnO1xuaW1wb3J0IExldmVsQ29tcGxldGVkTm9kZSBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9MZXZlbENvbXBsZXRlZE5vZGUuanMnO1xuaW1wb3J0IFZlZ2FzU3RyaW5ncyBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9WZWdhc1N0cmluZ3MuanMnO1xuaW1wb3J0IGFyZWFCdWlsZGVyIGZyb20gJy4uLy4uL2FyZWFCdWlsZGVyLmpzJztcbmltcG9ydCBBcmVhQnVpbGRlclN0cmluZ3MgZnJvbSAnLi4vLi4vQXJlYUJ1aWxkZXJTdHJpbmdzLmpzJztcbmltcG9ydCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuanMnO1xuaW1wb3J0IEFyZWFCdWlsZGVyQ29udHJvbFBhbmVsIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0FyZWFCdWlsZGVyQ29udHJvbFBhbmVsLmpzJztcbmltcG9ydCBTaGFwZUNyZWF0b3JOb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1NoYXBlQ3JlYXRvck5vZGUuanMnO1xuaW1wb3J0IFNoYXBlTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9TaGFwZU5vZGUuanMnO1xuaW1wb3J0IFNoYXBlUGxhY2VtZW50Qm9hcmROb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1NoYXBlUGxhY2VtZW50Qm9hcmROb2RlLmpzJztcbmltcG9ydCBBcmVhQnVpbGRlckdhbWVNb2RlbCBmcm9tICcuLi9tb2RlbC9BcmVhQnVpbGRlckdhbWVNb2RlbC5qcyc7XG5pbXBvcnQgQnVpbGRTcGVjIGZyb20gJy4uL21vZGVsL0J1aWxkU3BlYy5qcyc7XG5pbXBvcnQgR2FtZVN0YXRlIGZyb20gJy4uL21vZGVsL0dhbWVTdGF0ZS5qcyc7XG5pbXBvcnQgQXJlYUJ1aWxkZXJTY29yZWJvYXJkIGZyb20gJy4vQXJlYUJ1aWxkZXJTY29yZWJvYXJkLmpzJztcbmltcG9ydCBDb2xvclByb3BvcnRpb25zUHJvbXB0IGZyb20gJy4vQ29sb3JQcm9wb3J0aW9uc1Byb21wdC5qcyc7XG5pbXBvcnQgR2FtZUljb25GYWN0b3J5IGZyb20gJy4vR2FtZUljb25GYWN0b3J5LmpzJztcbmltcG9ydCBHYW1lSW5mb0Jhbm5lciBmcm9tICcuL0dhbWVJbmZvQmFubmVyLmpzJztcbmltcG9ydCBTdGFydEdhbWVMZXZlbE5vZGUgZnJvbSAnLi9TdGFydEdhbWVMZXZlbE5vZGUuanMnO1xuaW1wb3J0IFlvdUJ1aWx0V2luZG93IGZyb20gJy4vWW91QnVpbHRXaW5kb3cuanMnO1xuaW1wb3J0IFlvdUVudGVyZWRXaW5kb3cgZnJvbSAnLi9Zb3VFbnRlcmVkV2luZG93LmpzJztcblxuY29uc3QgYXJlYUVxdWFsc1N0cmluZyA9IEFyZWFCdWlsZGVyU3RyaW5ncy5hcmVhRXF1YWxzO1xuY29uc3QgYXJlYVF1ZXN0aW9uU3RyaW5nID0gQXJlYUJ1aWxkZXJTdHJpbmdzLmFyZWFRdWVzdGlvbjtcbmNvbnN0IGFTb2x1dGlvbkNvbG9uU3RyaW5nID0gQXJlYUJ1aWxkZXJTdHJpbmdzLmFTb2x1dGlvbkNvbG9uO1xuY29uc3QgYVNvbHV0aW9uU3RyaW5nID0gQXJlYUJ1aWxkZXJTdHJpbmdzLmFTb2x1dGlvbjtcbmNvbnN0IGJ1aWxkSXRTdHJpbmcgPSBBcmVhQnVpbGRlclN0cmluZ3MuYnVpbGRJdDtcbmNvbnN0IGNoZWNrU3RyaW5nID0gVmVnYXNTdHJpbmdzLmNoZWNrO1xuY29uc3QgZmluZFRoZUFyZWFTdHJpbmcgPSBBcmVhQnVpbGRlclN0cmluZ3MuZmluZFRoZUFyZWE7XG5jb25zdCBuZXh0U3RyaW5nID0gVmVnYXNTdHJpbmdzLm5leHQ7XG5jb25zdCBwZXJpbWV0ZXJFcXVhbHNTdHJpbmcgPSBBcmVhQnVpbGRlclN0cmluZ3MucGVyaW1ldGVyRXF1YWxzO1xuY29uc3Qgc29sdXRpb25Db2xvblN0cmluZyA9IEFyZWFCdWlsZGVyU3RyaW5ncy5zb2x1dGlvbkNvbG9uO1xuY29uc3Qgc29sdXRpb25TdHJpbmcgPSBBcmVhQnVpbGRlclN0cmluZ3Muc29sdXRpb247XG5jb25zdCBzdGFydE92ZXJTdHJpbmcgPSBBcmVhQnVpbGRlclN0cmluZ3Muc3RhcnRPdmVyO1xuY29uc3QgdHJ5QWdhaW5TdHJpbmcgPSBWZWdhc1N0cmluZ3MudHJ5QWdhaW47XG5jb25zdCB5b3VyR29hbFN0cmluZyA9IEFyZWFCdWlsZGVyU3RyaW5ncy55b3VyR29hbDtcblxuLy8gY29uc3RhbnRzXG5jb25zdCBCVVRUT05fRk9OVCA9IG5ldyBQaGV0Rm9udCggMTggKTtcbmNvbnN0IEJVVFRPTl9GSUxMID0gUGhldENvbG9yU2NoZW1lLkJVVFRPTl9ZRUxMT1c7XG5jb25zdCBJTkZPX0JBTk5FUl9IRUlHSFQgPSA2MDsgLy8gSGVpZ2h0IG9mIHRoZSBwcm9tcHQgYW5kIHNvbHV0aW9uIGJhbm5lcnMsIGVtcGlyaWNhbGx5IGRldGVybWluZWQuXG5jb25zdCBHT0FMX1BST01QVF9GT05UID0gbmV3IFBoZXRGb250KCB7IHNpemU6IDIwLCB3ZWlnaHQ6ICdib2xkJyB9ICk7XG5jb25zdCBTUEFDRV9BUk9VTkRfU0hBUEVfUExBQ0VNRU5UX0JPQVJEID0gQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuQ09OVFJPTFNfSU5TRVQ7XG5jb25zdCBJVEVNU19QRVJfQ0FST1VTRUxfUEFHRSA9IDQ7XG5jb25zdCBCVVRUT05fVE9VQ0hfQVJFQV9ESUxBVElPTiA9IDc7XG5cbmNsYXNzIEFyZWFCdWlsZGVyR2FtZVZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcblxuICAvKipcbiAgICogQHBhcmFtIHtBcmVhQnVpbGRlckdhbWVNb2RlbH0gZ2FtZU1vZGVsXG4gICAqL1xuICBjb25zdHJ1Y3RvciggZ2FtZU1vZGVsICkge1xuICAgIHN1cGVyKCB7IGxheW91dEJvdW5kczogQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuTEFZT1VUX0JPVU5EUyB9ICk7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5tb2RlbCA9IGdhbWVNb2RlbDtcblxuICAgIC8vIENyZWF0ZSB0aGUgZ2FtZSBhdWRpbyBwbGF5ZXIuXG4gICAgdGhpcy5nYW1lQXVkaW9QbGF5ZXIgPSBuZXcgR2FtZUF1ZGlvUGxheWVyKCk7XG5cbiAgICAvLyBDcmVhdGUgYSByb290IG5vZGUgYW5kIHNlbmQgdG8gYmFjayBzbyB0aGF0IHRoZSBsYXlvdXQgYm91bmRzIGJveCBjYW4gYmUgbWFkZSB2aXNpYmxlIGlmIG5lZWRlZC5cbiAgICB0aGlzLnJvb3ROb2RlID0gbmV3IE5vZGUoKTtcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnJvb3ROb2RlICk7XG4gICAgdGhpcy5yb290Tm9kZS5tb3ZlVG9CYWNrKCk7XG5cbiAgICAvLyBBZGQgbGF5ZXJzIHVzZWQgdG8gY29udHJvbCBnYW1lIGFwcGVhcmFuY2UuXG4gICAgdGhpcy5jb250cm9sTGF5ZXIgPSBuZXcgTm9kZSgpO1xuICAgIHRoaXMucm9vdE5vZGUuYWRkQ2hpbGQoIHRoaXMuY29udHJvbExheWVyICk7XG4gICAgdGhpcy5jaGFsbGVuZ2VMYXllciA9IG5ldyBOb2RlKCk7XG4gICAgdGhpcy5yb290Tm9kZS5hZGRDaGlsZCggdGhpcy5jaGFsbGVuZ2VMYXllciApO1xuXG4gICAgLy8gQWRkIHRoZSBub2RlIHRoYXQgYWxsb3dzIHRoZSB1c2VyIHRvIGNob29zZSBhIGdhbWUgbGV2ZWwgdG8gcGxheS5cbiAgICB0aGlzLnN0YXJ0R2FtZUxldmVsTm9kZSA9IG5ldyBTdGFydEdhbWVMZXZlbE5vZGUoXG4gICAgICBsZXZlbCA9PiB7XG4gICAgICAgIHRoaXMubnVtYmVyRW50cnlDb250cm9sLmNsZWFyKCk7XG4gICAgICAgIGdhbWVNb2RlbC5zdGFydExldmVsKCBsZXZlbCApO1xuICAgICAgfSxcbiAgICAgICgpID0+IHtcbiAgICAgICAgZ2FtZU1vZGVsLnJlc2V0KCk7XG4gICAgICAgIHRoaXMuZGlzcG9zZUN1cnJlbnRDYXJvdXNlbCgpO1xuICAgICAgfSxcbiAgICAgIGdhbWVNb2RlbC50aW1lckVuYWJsZWRQcm9wZXJ0eSxcbiAgICAgIFtcbiAgICAgICAgR2FtZUljb25GYWN0b3J5LmNyZWF0ZUljb24oIDEgKSxcbiAgICAgICAgR2FtZUljb25GYWN0b3J5LmNyZWF0ZUljb24oIDIgKSxcbiAgICAgICAgR2FtZUljb25GYWN0b3J5LmNyZWF0ZUljb24oIDMgKSxcbiAgICAgICAgR2FtZUljb25GYWN0b3J5LmNyZWF0ZUljb24oIDQgKSxcbiAgICAgICAgR2FtZUljb25GYWN0b3J5LmNyZWF0ZUljb24oIDUgKSxcbiAgICAgICAgR2FtZUljb25GYWN0b3J5LmNyZWF0ZUljb24oIDYgKVxuICAgICAgXSxcbiAgICAgIGdhbWVNb2RlbC5iZXN0U2NvcmVQcm9wZXJ0aWVzLFxuICAgICAge1xuICAgICAgICBudW1TdGFyc09uQnV0dG9uczogZ2FtZU1vZGVsLmNoYWxsZW5nZXNQZXJTZXQsXG4gICAgICAgIHBlcmZlY3RTY29yZTogZ2FtZU1vZGVsLm1heFBvc3NpYmxlU2NvcmUsXG4gICAgICAgIG51bUxldmVsczogZ2FtZU1vZGVsLm51bWJlck9mTGV2ZWxzLFxuICAgICAgICBudW1CdXR0b25Sb3dzOiAyLFxuICAgICAgICBjb250cm9sc0luc2V0OiBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5DT05UUk9MU19JTlNFVFxuICAgICAgfVxuICAgICk7XG4gICAgdGhpcy5yb290Tm9kZS5hZGRDaGlsZCggdGhpcy5zdGFydEdhbWVMZXZlbE5vZGUgKTtcblxuICAgIC8vIFNldCB1cCB0aGUgY29uc3RhbnQgcG9ydGlvbnMgb2YgdGhlIGNoYWxsZW5nZSB2aWV3LlxuICAgIHRoaXMuc2hhcGVCb2FyZCA9IG5ldyBTaGFwZVBsYWNlbWVudEJvYXJkTm9kZSggZ2FtZU1vZGVsLnNpbVNwZWNpZmljTW9kZWwuc2hhcGVQbGFjZW1lbnRCb2FyZCApO1xuICAgIHRoaXMuc2hhcGVCb2FyZE9yaWdpbmFsQm91bmRzID0gdGhpcy5zaGFwZUJvYXJkLmJvdW5kcy5jb3B5KCk7IC8vIE5lY2Vzc2FyeSBiZWNhdXNlIHRoZSBzaGFwZSBib2FyZCdzIGJvdW5kcyBjYW4gdmFyeSB3aGVuIHNoYXBlcyBhcmUgcGxhY2VkLlxuICAgIHRoaXMubWF4U2hhcGVCb2FyZFRleHRXaWR0aCA9IHRoaXMuc2hhcGVCb2FyZE9yaWdpbmFsQm91bmRzLndpZHRoICogMC45O1xuICAgIHRoaXMueW91ckdvYWxUaXRsZSA9IG5ldyBUZXh0KCB5b3VyR29hbFN0cmluZywge1xuICAgICAgZm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDI0LCB3ZWlnaHQ6ICdib2xkJyB9ICksXG4gICAgICBtYXhXaWR0aDogdGhpcy5tYXhTaGFwZUJvYXJkVGV4dFdpZHRoXG4gICAgfSApO1xuICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIuYWRkQ2hpbGQoIHRoaXMuc2hhcGVCb2FyZCApO1xuICAgIHRoaXMuZXJhc2VyQnV0dG9uID0gbmV3IEVyYXNlckJ1dHRvbigge1xuICAgICAgcmlnaHQ6IHRoaXMuc2hhcGVCb2FyZC5sZWZ0LFxuICAgICAgdG9wOiB0aGlzLnNoYXBlQm9hcmQuYm90dG9tICsgU1BBQ0VfQVJPVU5EX1NIQVBFX1BMQUNFTUVOVF9CT0FSRCxcbiAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogQlVUVE9OX1RPVUNIX0FSRUFfRElMQVRJT04sXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IEJVVFRPTl9UT1VDSF9BUkVBX0RJTEFUSU9OLFxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcblxuICAgICAgICBjb25zdCBjaGFsbGVuZ2UgPSBnYW1lTW9kZWwuY3VycmVudENoYWxsZW5nZVByb3BlcnR5LmdldCgpO1xuICAgICAgICBsZXQgc2hhcGVSZWxlYXNlTW9kZSA9ICdmYWRlJztcblxuICAgICAgICBpZiAoIGNoYWxsZW5nZS5jaGVja1NwZWMgPT09ICdhcmVhRW50ZXJlZCcgJiYgY2hhbGxlbmdlLnVzZXJTaGFwZXMgJiYgY2hhbGxlbmdlLnVzZXJTaGFwZXNbIDAgXS5jcmVhdGlvbkxpbWl0ICkge1xuXG4gICAgICAgICAgLy8gSW4gdGhlIGNhc2Ugd2hlcmUgdGhlcmUgaXMgYSBsaW1pdGVkIG51bWJlciBvZiBzaGFwZXMsIGhhdmUgdGhlbSBhbmltYXRlIGJhY2sgdG8gdGhlIGNhcm91c2VsIGluc3RlYWQgb2ZcbiAgICAgICAgICAvLyBmYWRpbmcgYXdheSBzbyB0aGF0IHRoZSB1c2VyIHVuZGVyc3RhbmRzIHRoYXQgdGhlIHN0YXNoIGlzIGJlaW5nIHJlcGxlbmlzaGVkLlxuICAgICAgICAgIHNoYXBlUmVsZWFzZU1vZGUgPSAnYW5pbWF0ZUhvbWUnO1xuICAgICAgICB9XG4gICAgICAgIGdhbWVNb2RlbC5zaW1TcGVjaWZpY01vZGVsLnNoYXBlUGxhY2VtZW50Qm9hcmQucmVsZWFzZUFsbFNoYXBlcyggc2hhcGVSZWxlYXNlTW9kZSApO1xuXG4gICAgICAgIC8vIElmIHRoZSBnYW1lIHdhcyBzaG93aW5nIHRoZSB1c2VyIGluY29ycmVjdCBmZWVkYmFjayB3aGVuIHRoZXkgcHJlc3NlZCB0aGlzIGJ1dHRvbiwgYXV0by1hZHZhbmNlIHRvIHRoZVxuICAgICAgICAvLyBuZXh0IHN0YXRlLlxuICAgICAgICBpZiAoIGdhbWVNb2RlbC5nYW1lU3RhdGVQcm9wZXJ0eS52YWx1ZSA9PT0gR2FtZVN0YXRlLlNIT1dJTkdfSU5DT1JSRUNUX0FOU1dFUl9GRUVEQkFDS19UUllfQUdBSU4gKSB7XG4gICAgICAgICAgdGhpcy5udW1iZXJFbnRyeUNvbnRyb2wuY2xlYXIoKTtcbiAgICAgICAgICBnYW1lTW9kZWwudHJ5QWdhaW4oKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gKTtcbiAgICB0aGlzLmNoYWxsZW5nZUxheWVyLmFkZENoaWxkKCB0aGlzLmVyYXNlckJ1dHRvbiApO1xuICAgIHRoaXMueW91QnVpbHRXaW5kb3cgPSBuZXcgWW91QnVpbHRXaW5kb3coIHRoaXMubGF5b3V0Qm91bmRzLndpZHRoIC0gdGhpcy5zaGFwZUJvYXJkLnJpZ2h0IC0gMTQgKTtcbiAgICB0aGlzLmNoYWxsZW5nZUxheWVyLmFkZENoaWxkKCB0aGlzLnlvdUJ1aWx0V2luZG93ICk7XG4gICAgdGhpcy55b3VFbnRlcmVkV2luZG93ID0gbmV3IFlvdUVudGVyZWRXaW5kb3coIHRoaXMubGF5b3V0Qm91bmRzLndpZHRoIC0gdGhpcy5zaGFwZUJvYXJkLnJpZ2h0IC0gMTQgKTtcbiAgICB0aGlzLmNoYWxsZW5nZUxheWVyLmFkZENoaWxkKCB0aGlzLnlvdUVudGVyZWRXaW5kb3cgKTtcbiAgICB0aGlzLmNoYWxsZW5nZVByb21wdEJhbm5lciA9IG5ldyBHYW1lSW5mb0Jhbm5lciggdGhpcy5zaGFwZUJvYXJkLndpZHRoLCBJTkZPX0JBTk5FUl9IRUlHSFQsICcjMWIxNDY0Jywge1xuICAgICAgbGVmdDogdGhpcy5zaGFwZUJvYXJkLmxlZnQsXG4gICAgICBib3R0b206IHRoaXMuc2hhcGVCb2FyZC50b3AgLSBTUEFDRV9BUk9VTkRfU0hBUEVfUExBQ0VNRU5UX0JPQVJEXG4gICAgfSApO1xuICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIuYWRkQ2hpbGQoIHRoaXMuY2hhbGxlbmdlUHJvbXB0QmFubmVyICk7XG4gICAgdGhpcy5zb2x1dGlvbkJhbm5lciA9IG5ldyBHYW1lSW5mb0Jhbm5lciggdGhpcy5zaGFwZUJvYXJkLndpZHRoLCBJTkZPX0JBTk5FUl9IRUlHSFQsICcjZmJiMDNiJywge1xuICAgICAgbGVmdDogdGhpcy5zaGFwZUJvYXJkLmxlZnQsXG4gICAgICBib3R0b206IHRoaXMuc2hhcGVCb2FyZC50b3AgLSBTUEFDRV9BUk9VTkRfU0hBUEVfUExBQ0VNRU5UX0JPQVJEXG4gICAgfSApO1xuICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIuYWRkQ2hpbGQoIHRoaXMuc29sdXRpb25CYW5uZXIgKTtcblxuICAgIC8vIEFkZCB0aGUgY29udHJvbCBwYW5lbFxuICAgIHRoaXMuY29udHJvbFBhbmVsID0gbmV3IEFyZWFCdWlsZGVyQ29udHJvbFBhbmVsKFxuICAgICAgZ2FtZU1vZGVsLnNpbVNwZWNpZmljTW9kZWwuc2hvd0dyaWRPbkJvYXJkUHJvcGVydHksXG4gICAgICBnYW1lTW9kZWwuc2ltU3BlY2lmaWNNb2RlbC5zaG93RGltZW5zaW9uc1Byb3BlcnR5LFxuICAgICAgeyBjZW50ZXJYOiAoIHRoaXMubGF5b3V0Qm91bmRzLnggKyB0aGlzLnNoYXBlQm9hcmQubGVmdCApIC8gMiwgYm90dG9tOiB0aGlzLnNoYXBlQm9hcmQuYm90dG9tIH1cbiAgICApO1xuICAgIHRoaXMuY29udHJvbExheWVyLmFkZENoaWxkKCB0aGlzLmNvbnRyb2xQYW5lbCApO1xuXG4gICAgLy8gQWRkIHRoZSBzY29yZWJvYXJkLlxuICAgIHRoaXMuc2NvcmVib2FyZCA9IG5ldyBBcmVhQnVpbGRlclNjb3JlYm9hcmQoXG4gICAgICBnYW1lTW9kZWwubGV2ZWxQcm9wZXJ0eSxcbiAgICAgIGdhbWVNb2RlbC5jaGFsbGVuZ2VJbmRleFByb3BlcnR5LFxuICAgICAgZ2FtZU1vZGVsLmNoYWxsZW5nZXNQZXJTZXQsXG4gICAgICBnYW1lTW9kZWwuc2NvcmVQcm9wZXJ0eSxcbiAgICAgIGdhbWVNb2RlbC5lbGFwc2VkVGltZVByb3BlcnR5LFxuICAgICAge1xuICAgICAgICBjZW50ZXJYOiAoIHRoaXMubGF5b3V0Qm91bmRzLnggKyB0aGlzLnNoYXBlQm9hcmQubGVmdCApIC8gMixcbiAgICAgICAgdG9wOiB0aGlzLnNoYXBlQm9hcmQudG9wLFxuICAgICAgICBtYXhXaWR0aDogdGhpcy5jb250cm9sUGFuZWwud2lkdGhcbiAgICAgIH1cbiAgICApO1xuICAgIHRoaXMuY29udHJvbExheWVyLmFkZENoaWxkKCB0aGlzLnNjb3JlYm9hcmQgKTtcblxuICAgIC8vIENvbnRyb2wgdmlzaWJpbGl0eSBvZiBlbGFwc2VkIHRpbWUgaW5kaWNhdG9yIGluIHRoZSBzY29yZWJvYXJkLlxuICAgIHRoaXMubW9kZWwudGltZXJFbmFibGVkUHJvcGVydHkubGluayggdGltZXJFbmFibGVkID0+IHtcbiAgICAgIHRoaXMuc2NvcmVib2FyZC50aW1lVmlzaWJsZVByb3BlcnR5LnNldCggdGltZXJFbmFibGVkICk7XG4gICAgfSApO1xuXG4gICAgLy8gQWRkIHRoZSBidXR0b24gZm9yIHJldHVybmluZyB0byB0aGUgbGV2ZWwgc2VsZWN0aW9uIHNjcmVlbi5cbiAgICB0aGlzLmNvbnRyb2xMYXllci5hZGRDaGlsZCggbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xuICAgICAgY29udGVudDogbmV3IFRleHQoIHN0YXJ0T3ZlclN0cmluZywgeyBmb250OiBCVVRUT05fRk9OVCwgbWF4V2lkdGg6IHRoaXMuY29udHJvbFBhbmVsLndpZHRoIH0gKSxcbiAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogQlVUVE9OX1RPVUNIX0FSRUFfRElMQVRJT04sXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IEJVVFRPTl9UT1VDSF9BUkVBX0RJTEFUSU9OLFxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTtcbiAgICAgICAgZ2FtZU1vZGVsLnNpbVNwZWNpZmljTW9kZWwucmVzZXQoKTtcbiAgICAgICAgZ2FtZU1vZGVsLnNldENob29zaW5nTGV2ZWxTdGF0ZSgpO1xuICAgICAgfSxcbiAgICAgIGJhc2VDb2xvcjogQlVUVE9OX0ZJTEwsXG4gICAgICBjZW50ZXJYOiB0aGlzLnNjb3JlYm9hcmQuY2VudGVyWCxcbiAgICAgIGNlbnRlclk6IHRoaXMuc29sdXRpb25CYW5uZXIuY2VudGVyWVxuICAgIH0gKSApO1xuXG4gICAgLy8gQWRkIHRoZSAnQnVpbGQgUHJvbXB0JyBub2RlIHRoYXQgaXMgc2hvd24gdGVtcG9yYXJpbHkgb3ZlciB0aGUgYm9hcmQgdG8gaW5zdHJ1Y3QgdGhlIHVzZXIgYWJvdXQgd2hhdCB0byBidWlsZC5cbiAgICB0aGlzLmJ1aWxkUHJvbXB0VkJveCA9IG5ldyBWQm94KCB7XG4gICAgICBjaGlsZHJlbjogW1xuICAgICAgICB0aGlzLnlvdXJHb2FsVGl0bGVcbiAgICAgIF0sXG4gICAgICBzcGFjaW5nOiAyMFxuICAgIH0gKTtcbiAgICB0aGlzLmJ1aWxkUHJvbXB0UGFuZWwgPSBuZXcgUGFuZWwoIHRoaXMuYnVpbGRQcm9tcHRWQm94LCB7XG4gICAgICBzdHJva2U6IG51bGwsXG4gICAgICB4TWFyZ2luOiAxMCxcbiAgICAgIHlNYXJnaW46IDEwXG4gICAgfSApO1xuICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIuYWRkQ2hpbGQoIHRoaXMuYnVpbGRQcm9tcHRQYW5lbCApO1xuXG4gICAgLy8gRGVmaW5lIHNvbWUgdmFyaWFibGVzIGZvciB0YWtpbmcgYSBzbmFwc2hvdCBvZiB0aGUgdXNlcidzIHNvbHV0aW9uLlxuICAgIHRoaXMuYXJlYU9mVXNlckNyZWF0ZWRTaGFwZSA9IDA7XG4gICAgdGhpcy5wZXJpbWV0ZXJPZlVzZXJDcmVhdGVkU2hhcGUgPSAwO1xuICAgIHRoaXMuY29sb3IxUHJvcG9ydGlvbiA9IG51bGw7XG5cbiAgICAvLyBBZGQgYW5kIGxheSBvdXQgdGhlIGdhbWUgY29udHJvbCBidXR0b25zLlxuICAgIHRoaXMuZ2FtZUNvbnRyb2xCdXR0b25zID0gW107XG4gICAgY29uc3QgYnV0dG9uT3B0aW9ucyA9IHtcbiAgICAgIGZvbnQ6IEJVVFRPTl9GT05ULFxuICAgICAgYmFzZUNvbG9yOiBCVVRUT05fRklMTCxcbiAgICAgIGNvcm5lclJhZGl1czogNCxcbiAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogQlVUVE9OX1RPVUNIX0FSRUFfRElMQVRJT04sXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IEJVVFRPTl9UT1VDSF9BUkVBX0RJTEFUSU9OLFxuICAgICAgbWF4V2lkdGg6ICggdGhpcy5sYXlvdXRCb3VuZHMubWF4WCAtIHRoaXMuc2hhcGVCb2FyZE9yaWdpbmFsQm91bmRzLm1heFggKSAqIDAuOVxuICAgIH07XG4gICAgdGhpcy5jaGVja0Fuc3dlckJ1dHRvbiA9IG5ldyBUZXh0UHVzaEJ1dHRvbiggY2hlY2tTdHJpbmcsIG1lcmdlKCB7XG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xuICAgICAgICB0aGlzLnVwZGF0ZVVzZXJBbnN3ZXIoKTtcbiAgICAgICAgZ2FtZU1vZGVsLmNoZWNrQW5zd2VyKCk7XG4gICAgICB9XG4gICAgfSwgYnV0dG9uT3B0aW9ucyApICk7XG4gICAgdGhpcy5nYW1lQ29udHJvbEJ1dHRvbnMucHVzaCggdGhpcy5jaGVja0Fuc3dlckJ1dHRvbiApO1xuXG4gICAgdGhpcy5uZXh0QnV0dG9uID0gbmV3IFRleHRQdXNoQnV0dG9uKCBuZXh0U3RyaW5nLCBtZXJnZSgge1xuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcbiAgICAgICAgdGhpcy5udW1iZXJFbnRyeUNvbnRyb2wuY2xlYXIoKTtcbiAgICAgICAgZ2FtZU1vZGVsLm5leHRDaGFsbGVuZ2UoKTtcbiAgICAgIH1cbiAgICB9LCBidXR0b25PcHRpb25zICkgKTtcbiAgICB0aGlzLmdhbWVDb250cm9sQnV0dG9ucy5wdXNoKCB0aGlzLm5leHRCdXR0b24gKTtcblxuICAgIHRoaXMudHJ5QWdhaW5CdXR0b24gPSBuZXcgVGV4dFB1c2hCdXR0b24oIHRyeUFnYWluU3RyaW5nLCBtZXJnZSgge1xuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcbiAgICAgICAgdGhpcy5udW1iZXJFbnRyeUNvbnRyb2wuY2xlYXIoKTtcbiAgICAgICAgZ2FtZU1vZGVsLnRyeUFnYWluKCk7XG4gICAgICB9XG4gICAgfSwgYnV0dG9uT3B0aW9ucyApICk7XG4gICAgdGhpcy5nYW1lQ29udHJvbEJ1dHRvbnMucHVzaCggdGhpcy50cnlBZ2FpbkJ1dHRvbiApO1xuXG4gICAgLy8gU29sdXRpb24gYnV0dG9uIGZvciAnZmluZCB0aGUgYXJlYScgc3R5bGUgb2YgY2hhbGxlbmdlLCB3aGljaCBoYXMgb25lIHNwZWNpZmljIGFuc3dlci5cbiAgICB0aGlzLnNvbHV0aW9uQnV0dG9uID0gbmV3IFRleHRQdXNoQnV0dG9uKCBzb2x1dGlvblN0cmluZywgbWVyZ2UoIHtcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XG4gICAgICAgIGdhbWVNb2RlbC5kaXNwbGF5Q29ycmVjdEFuc3dlcigpO1xuICAgICAgfVxuICAgIH0sIGJ1dHRvbk9wdGlvbnMgKSApO1xuICAgIHRoaXMuZ2FtZUNvbnRyb2xCdXR0b25zLnB1c2goIHRoaXMuc29sdXRpb25CdXR0b24gKTtcblxuICAgIC8vIFNvbHV0aW9uIGJ1dHRvbiBmb3IgJ2J1aWxkIGl0JyBzdHlsZSBvZiBjaGFsbGVuZ2UsIHdoaWNoIGhhcyBtYW55IHBvdGVudGlhbCBhbnN3ZXJzLlxuICAgIHRoaXMuc2hvd0FTb2x1dGlvbkJ1dHRvbiA9IG5ldyBUZXh0UHVzaEJ1dHRvbiggYVNvbHV0aW9uU3RyaW5nLCBtZXJnZSgge1xuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcbiAgICAgICAgdGhpcy5va2F5VG9VcGRhdGVZb3VCdWlsdFdpbmRvdyA9IGZhbHNlO1xuICAgICAgICBnYW1lTW9kZWwuZGlzcGxheUNvcnJlY3RBbnN3ZXIoKTtcbiAgICAgIH1cbiAgICB9LCBidXR0b25PcHRpb25zICkgKTtcbiAgICB0aGlzLmdhbWVDb250cm9sQnV0dG9ucy5wdXNoKCB0aGlzLnNob3dBU29sdXRpb25CdXR0b24gKTtcblxuICAgIGNvbnN0IGJ1dHRvbkNlbnRlclggPSAoIHRoaXMubGF5b3V0Qm91bmRzLndpZHRoICsgdGhpcy5zaGFwZUJvYXJkLnJpZ2h0ICkgLyAyO1xuICAgIGNvbnN0IGJ1dHRvbkJvdHRvbSA9IHRoaXMuc2hhcGVCb2FyZC5ib3R0b207XG4gICAgdGhpcy5nYW1lQ29udHJvbEJ1dHRvbnMuZm9yRWFjaCggYnV0dG9uID0+IHtcbiAgICAgIGJ1dHRvbi5jZW50ZXJYID0gYnV0dG9uQ2VudGVyWDtcbiAgICAgIGJ1dHRvbi5ib3R0b20gPSBidXR0b25Cb3R0b207XG4gICAgICB0aGlzLmNvbnRyb2xMYXllci5hZGRDaGlsZCggYnV0dG9uICk7XG4gICAgfSApO1xuXG4gICAgLy8gQWRkIHRoZSBudW1iZXIgZW50cnkgY29udHJvbCwgd2hpY2ggaXMgb25seSB2aXNpYmxlIG9uIGNlcnRhaW4gY2hhbGxlbmdlIHR5cGVzLlxuICAgIHRoaXMubnVtYmVyRW50cnlDb250cm9sID0gbmV3IE51bWJlckVudHJ5Q29udHJvbCgge1xuICAgICAgY2VudGVyWDogYnV0dG9uQ2VudGVyWCxcbiAgICAgIGJvdHRvbTogdGhpcy5jaGVja0Fuc3dlckJ1dHRvbi50b3AgLSAxMFxuICAgIH0gKTtcbiAgICB0aGlzLmNoYWxsZW5nZUxheWVyLmFkZENoaWxkKCB0aGlzLm51bWJlckVudHJ5Q29udHJvbCApO1xuICAgIHRoaXMuYXJlYVF1ZXN0aW9uUHJvbXB0ID0gbmV3IFRleHQoIGFyZWFRdWVzdGlvblN0cmluZywgeyAvLyBUaGlzIHByb21wdCBnb2VzIHdpdGggdGhlIG51bWJlciBlbnRyeSBjb250cm9sLlxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAyMCApLFxuICAgICAgY2VudGVyWDogdGhpcy5udW1iZXJFbnRyeUNvbnRyb2wuY2VudGVyWCxcbiAgICAgIGJvdHRvbTogdGhpcy5udW1iZXJFbnRyeUNvbnRyb2wudG9wIC0gMTAsXG4gICAgICBtYXhXaWR0aDogdGhpcy5udW1iZXJFbnRyeUNvbnRyb2wud2lkdGhcbiAgICB9ICk7XG4gICAgdGhpcy5jaGFsbGVuZ2VMYXllci5hZGRDaGlsZCggdGhpcy5hcmVhUXVlc3Rpb25Qcm9tcHQgKTtcblxuICAgIHRoaXMubnVtYmVyRW50cnlDb250cm9sLmtleXBhZC52YWx1ZVN0cmluZ1Byb3BlcnR5LmxpbmsoIHZhbHVlU3RyaW5nID0+IHtcblxuICAgICAgLy8gSGFuZGxlIHRoZSBjYXNlIHdoZXJlIHRoZSB1c2VyIGp1c3Qgc3RhcnRzIGVudGVyaW5nIGRpZ2l0cyBpbnN0ZWFkIG9mIHByZXNzaW5nIHRoZSBcIlRyeSBBZ2FpblwiIGJ1dHRvbi4gIEluXG4gICAgICAvLyB0aGlzIGNhc2UsIHdlIGdvIGFoZWFkIGFuZCBtYWtlIHRoZSBzdGF0ZSB0cmFuc2l0aW9uIHRvIHRoZSBuZXh0IHN0YXRlLlxuICAgICAgaWYgKCBnYW1lTW9kZWwuZ2FtZVN0YXRlUHJvcGVydHkudmFsdWUgPT09IEdhbWVTdGF0ZS5TSE9XSU5HX0lOQ09SUkVDVF9BTlNXRVJfRkVFREJBQ0tfVFJZX0FHQUlOICkge1xuICAgICAgICBnYW1lTW9kZWwudHJ5QWdhaW4oKTtcbiAgICAgIH1cblxuICAgICAgLy8gVXBkYXRlIHRoZSBzdGF0ZSBvZiB0aGUgJ0NoZWNrJyBidXR0b24gd2hlbiB0aGUgdXNlciBlbnRlcnMgbmV3IGRpZ2l0cy5cbiAgICAgIHRoaXMudXBkYXRlZENoZWNrQnV0dG9uRW5hYmxlZFN0YXRlKCk7XG4gICAgfSApO1xuXG4gICAgLy8gQWRkIHRoZSAnZmVlZGJhY2sgbm9kZScgdGhhdCBpcyB1c2VkIHRvIHZpc3VhbGx5IGluZGljYXRlIGNvcnJlY3QgYW5kIGluY29ycmVjdCBhbnN3ZXJzLlxuICAgIHRoaXMuZmFjZVdpdGhQb2ludHNOb2RlID0gbmV3IEZhY2VXaXRoUG9pbnRzTm9kZSgge1xuICAgICAgZmFjZURpYW1ldGVyOiA4NSxcbiAgICAgIHBvaW50c0FsaWdubWVudDogJ3JpZ2h0Qm90dG9tJyxcbiAgICAgIGNlbnRlclg6IGJ1dHRvbkNlbnRlclgsXG4gICAgICB0b3A6IGJ1dHRvbkJvdHRvbSArIDIwLFxuICAgICAgcG9pbnRzRm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDIwLCB3ZWlnaHQ6ICdib2xkJyB9IClcbiAgICB9ICk7XG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5mYWNlV2l0aFBvaW50c05vZGUgKTtcblxuICAgIC8vIEhhbmRsZSBjb21pbmdzIGFuZCBnb2luZ3Mgb2YgbW9kZWwgc2hhcGVzLlxuICAgIGdhbWVNb2RlbC5zaW1TcGVjaWZpY01vZGVsLm1vdmFibGVTaGFwZXMuYWRkSXRlbUFkZGVkTGlzdGVuZXIoIGFkZGVkU2hhcGUgPT4ge1xuXG4gICAgICAvLyBDcmVhdGUgYW5kIGFkZCB0aGUgdmlldyByZXByZXNlbnRhdGlvbiBmb3IgdGhpcyBzaGFwZS5cbiAgICAgIGNvbnN0IHNoYXBlTm9kZSA9IG5ldyBTaGFwZU5vZGUoIGFkZGVkU2hhcGUsIHRoaXMubGF5b3V0Qm91bmRzICk7XG4gICAgICB0aGlzLmNoYWxsZW5nZUxheWVyLmFkZENoaWxkKCBzaGFwZU5vZGUgKTtcblxuICAgICAgLy8gQWRkIGEgbGlzdGVuZXIgdGhhdCBoYW5kbGVzIGNoYW5nZXMgdG8gdGhlIHVzZXJDb250cm9sbGVkIHN0YXRlLlxuICAgICAgY29uc3QgdXNlckNvbnRyb2xsZWRMaXN0ZW5lciA9IHVzZXJDb250cm9sbGVkID0+IHtcbiAgICAgICAgaWYgKCB1c2VyQ29udHJvbGxlZCApIHtcbiAgICAgICAgICBzaGFwZU5vZGUubW92ZVRvRnJvbnQoKTtcblxuICAgICAgICAgIC8vIElmIHRoZSBnYW1lIHdhcyBpbiB0aGUgc3RhdGUgd2hlcmUgaXQgd2FzIHByb21wdGluZyB0aGUgdXNlciB0byB0cnkgYWdhaW4sIGFuZCB0aGUgdXNlciBzdGFydGVkXG4gICAgICAgICAgLy8gaW50ZXJhY3Rpbmcgd2l0aCBzaGFwZXMgd2l0aG91dCBwcmVzc2luZyB0aGUgJ1RyeSBBZ2FpbicgYnV0dG9uLCBnbyBhaGVhZCBhbmQgbWFrZSB0aGUgc3RhdGUgY2hhbmdlXG4gICAgICAgICAgLy8gYXV0b21hdGljYWxseS5cbiAgICAgICAgICBpZiAoIGdhbWVNb2RlbC5nYW1lU3RhdGVQcm9wZXJ0eS52YWx1ZSA9PT0gR2FtZVN0YXRlLlNIT1dJTkdfSU5DT1JSRUNUX0FOU1dFUl9GRUVEQkFDS19UUllfQUdBSU4gKSB7XG4gICAgICAgICAgICBnYW1lTW9kZWwudHJ5QWdhaW4oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBhZGRlZFNoYXBlLnVzZXJDb250cm9sbGVkUHJvcGVydHkubGluayggdXNlckNvbnRyb2xsZWRMaXN0ZW5lciApO1xuXG4gICAgICAvLyBBZGQgdGhlIHJlbW92YWwgbGlzdGVuZXIgZm9yIGlmIGFuZCB3aGVuIHRoaXMgc2hhcGUgaXMgcmVtb3ZlZCBmcm9tIHRoZSBtb2RlbC5cbiAgICAgIGdhbWVNb2RlbC5zaW1TcGVjaWZpY01vZGVsLm1vdmFibGVTaGFwZXMuYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciggZnVuY3Rpb24gcmVtb3ZhbExpc3RlbmVyKCByZW1vdmVkU2hhcGUgKSB7XG4gICAgICAgIGlmICggcmVtb3ZlZFNoYXBlID09PSBhZGRlZFNoYXBlICkge1xuICAgICAgICAgIHNlbGYuY2hhbGxlbmdlTGF5ZXIucmVtb3ZlQ2hpbGQoIHNoYXBlTm9kZSApO1xuICAgICAgICAgIHNoYXBlTm9kZS5kaXNwb3NlKCk7XG4gICAgICAgICAgYWRkZWRTaGFwZS51c2VyQ29udHJvbGxlZFByb3BlcnR5LnVubGluayggdXNlckNvbnRyb2xsZWRMaXN0ZW5lciApO1xuICAgICAgICAgIGdhbWVNb2RlbC5zaW1TcGVjaWZpY01vZGVsLm1vdmFibGVTaGFwZXMucmVtb3ZlSXRlbVJlbW92ZWRMaXN0ZW5lciggcmVtb3ZhbExpc3RlbmVyICk7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcblxuICAgICAgLy8gSWYgdGhlIGluaXRpYWwgYnVpbGQgcHJvbXB0IGlzIHZpc2libGUsIGhpZGUgaXQuXG4gICAgICBpZiAoIHRoaXMuYnVpbGRQcm9tcHRQYW5lbC5vcGFjaXR5ID09PSAxICkge1xuICAgICAgICAvLyB1c2luZyBhIGZ1bmN0aW9uIGluc3RlYWQsIHNlZSBTZWFzb25zIHNpbSwgUGFuZWxOb2RlLmpzIGZvciBhbiBleGFtcGxlLlxuICAgICAgICBuZXcgQW5pbWF0aW9uKCB7XG4gICAgICAgICAgZnJvbTogdGhpcy5idWlsZFByb21wdFBhbmVsLm9wYWNpdHksXG4gICAgICAgICAgdG86IDAsXG4gICAgICAgICAgc2V0VmFsdWU6IG9wYWNpdHkgPT4geyB0aGlzLmJ1aWxkUHJvbXB0UGFuZWwub3BhY2l0eSA9IG9wYWNpdHk7IH0sXG4gICAgICAgICAgZHVyYXRpb246IDAuNSxcbiAgICAgICAgICBlYXNpbmc6IEVhc2luZy5DVUJJQ19JTl9PVVRcbiAgICAgICAgfSApLnN0YXJ0KCk7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoaXMgaXMgYSAnYnVpbHQgaXQnIHN0eWxlIGNoYWxsZW5nZSwgYW5kIHRoaXMgaXMgdGhlIGZpcnN0IGVsZW1lbnQgYmVpbmcgYWRkZWQgdG8gdGhlIGJvYXJkLCBhZGQgdGhlXG4gICAgICAvLyBidWlsZCBzcGVjIHRvIHRoZSBiYW5uZXIgc28gdGhhdCB0aGUgdXNlciBjYW4gcmVmZXJlbmNlIGl0IGFzIHRoZXkgYWRkIG1vcmUgc2hhcGVzIHRvIHRoZSBib2FyZC5cbiAgICAgIGlmICggZ2FtZU1vZGVsLmN1cnJlbnRDaGFsbGVuZ2VQcm9wZXJ0eS5nZXQoKS5idWlsZFNwZWMgJiYgdGhpcy5jaGFsbGVuZ2VQcm9tcHRCYW5uZXIuYnVpbGRTcGVjUHJvcGVydHkudmFsdWUgPT09IG51bGwgKSB7XG4gICAgICAgIHRoaXMuY2hhbGxlbmdlUHJvbXB0QmFubmVyLmJ1aWxkU3BlY1Byb3BlcnR5LnZhbHVlID0gZ2FtZU1vZGVsLmN1cnJlbnRDaGFsbGVuZ2VQcm9wZXJ0eS5nZXQoKS5idWlsZFNwZWM7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgZ2FtZU1vZGVsLnNpbVNwZWNpZmljTW9kZWwubW92YWJsZVNoYXBlcy5hZGRJdGVtUmVtb3ZlZExpc3RlbmVyKCAoKSA9PiB7XG4gICAgICAvLyBJZiB0aGUgY2hhbGxlbmdlIGlzIGEgJ2J1aWxkIGl0JyBzdHlsZSBjaGFsbGVuZ2UsIGFuZCB0aGUgZ2FtZSBpcyBpbiB0aGUgc3RhdGUgd2hlcmUgdGhlIHVzZXIgaXMgYmVpbmcgZ2l2ZW5cbiAgICAgIC8vIHRoZSBvcHBvcnR1bml0eSB0byB2aWV3IGEgc29sdXRpb24sIGFuZCB0aGUgdXNlciBqdXN0IHJlbW92ZWQgYSBwaWVjZSwgY2hlY2sgaWYgdGhleSBub3cgaGF2ZSB0aGUgY29ycmVjdFxuICAgICAgLy8gYW5zd2VyLlxuICAgICAgaWYgKCBnYW1lTW9kZWwuZ2FtZVN0YXRlUHJvcGVydHkudmFsdWUgPT09IEdhbWVTdGF0ZS5TSE9XSU5HX0lOQ09SUkVDVF9BTlNXRVJfRkVFREJBQ0tfTU9WRV9PTiAmJiAhdGhpcy5pc0FueVNoYXBlTW92aW5nKCkgKSB7XG4gICAgICAgIHRoaXMubW9kZWwuY2hlY2tBbnN3ZXIoKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICBnYW1lTW9kZWwuc2ltU3BlY2lmaWNNb2RlbC5zaGFwZVBsYWNlbWVudEJvYXJkLmFyZWFBbmRQZXJpbWV0ZXJQcm9wZXJ0eS5saW5rKCBhcmVhQW5kUGVyaW1ldGVyID0+IHtcblxuICAgICAgdGhpcy51cGRhdGVkQ2hlY2tCdXR0b25FbmFibGVkU3RhdGUoKTtcblxuICAgICAgLy8gSWYgdGhlIGNoYWxsZW5nZSBpcyBhICdidWlsZCBpdCcgc3R5bGUgY2hhbGxlbmdlLCBhbmQgdGhlIGdhbWUgaXMgaW4gdGhlIHN0YXRlIHdoZXJlIHRoZSB1c2VyIGlzIGJlaW5nXG4gICAgICAvLyBnaXZlbiB0aGUgb3Bwb3J0dW5pdHkgdG8gdmlldyBhIHNvbHV0aW9uLCBhbmQgdGhleSBqdXN0IGNoYW5nZWQgd2hhdCB0aGV5IGhhZCBidWlsdCwgdXBkYXRlIHRoZSAneW91IGJ1aWx0J1xuICAgICAgLy8gd2luZG93LlxuICAgICAgaWYgKCBnYW1lTW9kZWwuZ2FtZVN0YXRlUHJvcGVydHkudmFsdWUgPT09IEdhbWVTdGF0ZS5TSE9XSU5HX0lOQ09SUkVDVF9BTlNXRVJfRkVFREJBQ0tfTU9WRV9PTiAmJlxuICAgICAgICAgICB0aGlzLm1vZGVsLmN1cnJlbnRDaGFsbGVuZ2VQcm9wZXJ0eS5nZXQoKS5idWlsZFNwZWMgJiZcbiAgICAgICAgICAgdGhpcy5va2F5VG9VcGRhdGVZb3VCdWlsdFdpbmRvdyApIHtcbiAgICAgICAgdGhpcy51cGRhdGVVc2VyQW5zd2VyKCk7XG4gICAgICAgIHRoaXMudXBkYXRlWW91QnVpbHRXaW5kb3coIHRoaXMubW9kZWwuY3VycmVudENoYWxsZW5nZVByb3BlcnR5LmdldCgpICk7XG5cbiAgICAgICAgLy8gSWYgdGhlIHVzZXIgaGFzIHB1dCBhbGwgc2hhcGVzIGF3YXksIGNoZWNrIHRvIHNlZSBpZiB0aGV5IG5vdyBoYXZlIHRoZSBjb3JyZWN0IGFuc3dlci5cbiAgICAgICAgaWYgKCAhdGhpcy5pc0FueVNoYXBlTW92aW5nKCkgKSB7XG4gICAgICAgICAgdGhpcy5tb2RlbC5jaGVja0Fuc3dlcigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gQHByaXZhdGUge0dyb3VwSXRlbU9wdGlvbnNbXX0gLSBLZWVwIHRyYWNrIG9mIGFjdGl2ZSBTaGFwZUNyZWF0b3JOb2RlIGluc3RhbmNlcyBzbyB0aGF0IHRoZXkgY2FuIGJlIGRpc3Bvc2VkLlxuICAgIHRoaXMuYWN0aXZlU2hhcGVOb2RlQ3JlYXRvcnMgPSBbXTtcblxuICAgIC8vIEBwcml2YXRlIHtDYXJvdXNlbHxudWxsfVxuICAgIHRoaXMuY2Fyb3VzZWwgPSBudWxsOyAvLyBmb3IgZGlzcG9zYWxcblxuICAgIC8vIFZhcmlvdXMgb3RoZXIgaW5pdGlhbGl6YXRpb25cbiAgICB0aGlzLmxldmVsQ29tcGxldGVkTm9kZSA9IG51bGw7IC8vIEBwcml2YXRlXG4gICAgdGhpcy5zaGFwZUNhcm91c2VsTGF5ZXIgPSBuZXcgTm9kZSggeyBpbnRlcnJ1cHRTdWJ0cmVlT25JbnZpc2libGU6IGZhbHNlIH0gKTsgLy8gQHByaXZhdGVcbiAgICB0aGlzLmNoYWxsZW5nZUxheWVyLmFkZENoaWxkKCB0aGlzLnNoYXBlQ2Fyb3VzZWxMYXllciApO1xuICAgIHRoaXMuY2xlYXJEaW1lbnNpb25zQ29udHJvbE9uTmV4dENoYWxsZW5nZSA9IGZhbHNlOyAvLyBAcHJpdmF0ZVxuXG4gICAgLy8gSG9vayB1cCB0aGUgdXBkYXRlIGZ1bmN0aW9uIGZvciBoYW5kbGluZyBjaGFuZ2VzIHRvIGdhbWUgc3RhdGUuXG4gICAgZ2FtZU1vZGVsLmdhbWVTdGF0ZVByb3BlcnR5LmxpbmsoIHRoaXMuaGFuZGxlR2FtZVN0YXRlQ2hhbmdlLmJpbmQoIHRoaXMgKSApO1xuXG4gICAgLy8gU2V0IHVwIGEgZmxhZyB0byBibG9jayB1cGRhdGVzIG9mIHRoZSAnWW91IEJ1aWx0JyB3aW5kb3cgd2hlbiBzaG93aW5nIHRoZSBzb2x1dGlvbi4gIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2VcbiAgICAvLyBhZGRpbmcgdGhlIHNoYXBlcyB0byB0aGUgYm9hcmQgaW4gb3JkZXIgdG8gc2hvdyB0aGUgc29sdXRpb24gdHJpZ2dlcnMgdXBkYXRlcyBvZiB0aGlzIHdpbmRvdy5cbiAgICB0aGlzLm9rYXlUb1VwZGF0ZVlvdUJ1aWx0V2luZG93ID0gdHJ1ZTsgLy8gQHByaXZhdGVcbiAgfVxuXG4gIC8vIEBwcml2YXRlLCBXaGVuIHRoZSBnYW1lIHN0YXRlIGNoYW5nZXMsIHVwZGF0ZSB0aGUgdmlldyB3aXRoIHRoZSBhcHByb3ByaWF0ZSBidXR0b25zIGFuZCByZWFkb3V0cy5cbiAgaGFuZGxlR2FtZVN0YXRlQ2hhbmdlKCBnYW1lU3RhdGUgKSB7XG5cbiAgICAvLyBIaWRlIGFsbCBub2RlcyAtIHRoZSBhcHByb3ByaWF0ZSBvbmVzIHdpbGwgYmUgc2hvd24gbGF0ZXIgYmFzZWQgb24gdGhlIGN1cnJlbnQgc3RhdGUuXG4gICAgdGhpcy5oaWRlQWxsR2FtZU5vZGVzKCk7XG5cbiAgICBjb25zdCBjaGFsbGVuZ2UgPSB0aGlzLm1vZGVsLmN1cnJlbnRDaGFsbGVuZ2VQcm9wZXJ0eS5nZXQoKTsgLy8gY29udmVuaWVuY2UgdmFyXG5cbiAgICAvLyBTaG93IHRoZSBub2RlcyBhcHByb3ByaWF0ZSB0byB0aGUgc3RhdGVcbiAgICBzd2l0Y2goIGdhbWVTdGF0ZSApIHtcblxuICAgICAgY2FzZSBHYW1lU3RhdGUuQ0hPT1NJTkdfTEVWRUw6XG4gICAgICAgIHRoaXMuaGFuZGxlQ2hvb3NpbmdMZXZlbFN0YXRlKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEdhbWVTdGF0ZS5QUkVTRU5USU5HX0lOVEVSQUNUSVZFX0NIQUxMRU5HRTpcbiAgICAgICAgdGhpcy5oYW5kbGVQcmVzZW50aW5nSW50ZXJhY3RpdmVDaGFsbGVuZ2VTdGF0ZSggY2hhbGxlbmdlICk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEdhbWVTdGF0ZS5TSE9XSU5HX0NPUlJFQ1RfQU5TV0VSX0ZFRURCQUNLOlxuICAgICAgICB0aGlzLmhhbmRsZVNob3dpbmdDb3JyZWN0QW5zd2VyRmVlZGJhY2tTdGF0ZSggY2hhbGxlbmdlICk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEdhbWVTdGF0ZS5TSE9XSU5HX0lOQ09SUkVDVF9BTlNXRVJfRkVFREJBQ0tfVFJZX0FHQUlOOlxuICAgICAgICB0aGlzLmhhbmRsZVNob3dpbmdJbmNvcnJlY3RBbnN3ZXJGZWVkYmFja1RyeUFnYWluU3RhdGUoIGNoYWxsZW5nZSApO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBHYW1lU3RhdGUuU0hPV0lOR19JTkNPUlJFQ1RfQU5TV0VSX0ZFRURCQUNLX01PVkVfT046XG4gICAgICAgIHRoaXMuaGFuZGxlU2hvd2luZ0luY29ycmVjdEFuc3dlckZlZWRiYWNrTW92ZU9uU3RhdGUoIGNoYWxsZW5nZSApO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBHYW1lU3RhdGUuRElTUExBWUlOR19DT1JSRUNUX0FOU1dFUjpcbiAgICAgICAgdGhpcy5oYW5kbGVEaXNwbGF5aW5nQ29ycmVjdEFuc3dlclN0YXRlKCBjaGFsbGVuZ2UgKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgR2FtZVN0YXRlLlNIT1dJTkdfTEVWRUxfUkVTVUxUUzpcbiAgICAgICAgdGhpcy5oYW5kbGVTaG93aW5nTGV2ZWxSZXN1bHRzU3RhdGUoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvciggYFVuaGFuZGxlZCBnYW1lIHN0YXRlOiAke2dhbWVTdGF0ZX1gICk7XG4gICAgfVxuICB9XG5cbiAgLy8gQHByaXZhdGVcbiAgaGFuZGxlQ2hvb3NpbmdMZXZlbFN0YXRlKCkge1xuICAgIHRoaXMuc2hvdyggWyB0aGlzLnN0YXJ0R2FtZUxldmVsTm9kZSBdICk7XG4gICAgdGhpcy5oaWRlQ2hhbGxlbmdlKCk7XG4gIH1cblxuICAvLyBAcHJpdmF0ZVxuICBoYW5kbGVQcmVzZW50aW5nSW50ZXJhY3RpdmVDaGFsbGVuZ2VTdGF0ZSggY2hhbGxlbmdlICkge1xuICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIucGlja2FibGUgPSBudWxsOyAvLyBQYXNzIHRocm91Z2gsIHBydW5lcyBzdWJ0cmVlLCBzZWUgU2NlbmVyeSBkb2N1bWVudGF0aW9uIGZvciBkZXRhaWxzLlxuICAgIHRoaXMucHJlc2VudENoYWxsZW5nZSgpO1xuXG4gICAgLy8gTWFrZSBhIGxpc3Qgb2YgdGhlIG5vZGVzIHRvIGJlIHNob3duIGluIHRoaXMgc3RhdGUuXG4gICAgY29uc3Qgbm9kZXNUb1Nob3cgPSBbXG4gICAgICB0aGlzLnNjb3JlYm9hcmQsXG4gICAgICB0aGlzLmNvbnRyb2xQYW5lbCxcbiAgICAgIHRoaXMuY2hlY2tBbnN3ZXJCdXR0b24sXG4gICAgICB0aGlzLmNoYWxsZW5nZVByb21wdEJhbm5lclxuICAgIF07XG5cbiAgICAvLyBBZGQgdGhlIG5vZGVzIHRoYXQgYXJlIG9ubHkgc2hvd24gZm9yIGNlcnRhaW4gY2hhbGxlbmdlIHR5cGVzIG9yIHVuZGVyIGNlcnRhaW4gY29uZGl0aW9ucy5cbiAgICBpZiAoIGNoYWxsZW5nZS5jaGVja1NwZWMgPT09ICdhcmVhRW50ZXJlZCcgKSB7XG4gICAgICBub2Rlc1RvU2hvdy5wdXNoKCB0aGlzLm51bWJlckVudHJ5Q29udHJvbCApO1xuICAgICAgbm9kZXNUb1Nob3cucHVzaCggdGhpcy5hcmVhUXVlc3Rpb25Qcm9tcHQgKTtcbiAgICB9XG4gICAgaWYgKCBjaGFsbGVuZ2UudXNlclNoYXBlcyApIHtcbiAgICAgIG5vZGVzVG9TaG93LnB1c2goIHRoaXMuc2hhcGVDYXJvdXNlbExheWVyICk7XG4gICAgICBub2Rlc1RvU2hvdy5wdXNoKCB0aGlzLmVyYXNlckJ1dHRvbiApO1xuICAgIH1cblxuICAgIHRoaXMuc2hvdyggbm9kZXNUb1Nob3cgKTtcbiAgICB0aGlzLnNob3dDaGFsbGVuZ2VHcmFwaGljcygpO1xuICAgIHRoaXMudXBkYXRlZENoZWNrQnV0dG9uRW5hYmxlZFN0YXRlKCk7XG4gICAgdGhpcy5va2F5VG9VcGRhdGVZb3VCdWlsdFdpbmRvdyA9IHRydWU7XG5cbiAgICBpZiAoIHRoaXMuY2xlYXJEaW1lbnNpb25zQ29udHJvbE9uTmV4dENoYWxsZW5nZSApIHtcbiAgICAgIHRoaXMubW9kZWwuc2ltU3BlY2lmaWNNb2RlbC5zaG93RGltZW5zaW9uc1Byb3BlcnR5LnNldCggZmFsc2UgKTtcbiAgICAgIHRoaXMuY2xlYXJEaW1lbnNpb25zQ29udHJvbE9uTmV4dENoYWxsZW5nZSA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8vIEBwcml2YXRlXG4gIGhhbmRsZVNob3dpbmdDb3JyZWN0QW5zd2VyRmVlZGJhY2tTdGF0ZSggY2hhbGxlbmdlICkge1xuXG4gICAgLy8gTWFrZSBhIGxpc3Qgb2YgdGhlIG5vZGVzIHRvIGJlIHNob3duIGluIHRoaXMgc3RhdGUuXG4gICAgY29uc3Qgbm9kZXNUb1Nob3cgPSBbXG4gICAgICB0aGlzLnNjb3JlYm9hcmQsXG4gICAgICB0aGlzLmNvbnRyb2xQYW5lbCxcbiAgICAgIHRoaXMubmV4dEJ1dHRvbixcbiAgICAgIHRoaXMuY2hhbGxlbmdlUHJvbXB0QmFubmVyLFxuICAgICAgdGhpcy5mYWNlV2l0aFBvaW50c05vZGVcbiAgICBdO1xuXG4gICAgLy8gVXBkYXRlIGFuZCBzaG93IHRoZSBub2RlcyB0aGF0IHZhcnkgYmFzZWQgb24gdGhlIGNoYWxsZW5nZSBjb25maWd1cmF0aW9ucy5cbiAgICBpZiAoIGNoYWxsZW5nZS5idWlsZFNwZWMgKSB7XG4gICAgICB0aGlzLnVwZGF0ZVlvdUJ1aWx0V2luZG93KCBjaGFsbGVuZ2UgKTtcbiAgICAgIG5vZGVzVG9TaG93LnB1c2goIHRoaXMueW91QnVpbHRXaW5kb3cgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLnVwZGF0ZVlvdUVudGVyZWRXaW5kb3coIGNoYWxsZW5nZSApO1xuICAgICAgbm9kZXNUb1Nob3cucHVzaCggdGhpcy55b3VFbnRlcmVkV2luZG93ICk7XG4gICAgfVxuXG4gICAgLy8gR2l2ZSB0aGUgdXNlciB0aGUgYXBwcm9wcmlhdGUgYXVkaW8gYW5kIHZpc3VhbCBmZWVkYmFja1xuICAgIHRoaXMuZ2FtZUF1ZGlvUGxheWVyLmNvcnJlY3RBbnN3ZXIoKTtcbiAgICB0aGlzLmZhY2VXaXRoUG9pbnRzTm9kZS5zbWlsZSgpO1xuICAgIHRoaXMuZmFjZVdpdGhQb2ludHNOb2RlLnNldFBvaW50cyggdGhpcy5tb2RlbC5nZXRDaGFsbGVuZ2VDdXJyZW50UG9pbnRWYWx1ZSgpICk7XG5cbiAgICAvLyBEaXNhYmxlIGludGVyYWN0aW9uIHdpdGggdGhlIGNoYWxsZW5nZSBlbGVtZW50cy5cbiAgICB0aGlzLmNoYWxsZW5nZUxheWVyLnBpY2thYmxlID0gZmFsc2U7XG5cbiAgICAvLyBNYWtlIHRoZSBub2RlcyB2aXNpYmxlXG4gICAgdGhpcy5zaG93KCBub2Rlc1RvU2hvdyApO1xuICB9XG5cbiAgLy8gQHByaXZhdGVcbiAgaGFuZGxlU2hvd2luZ0luY29ycmVjdEFuc3dlckZlZWRiYWNrVHJ5QWdhaW5TdGF0ZSggY2hhbGxlbmdlICkge1xuXG4gICAgLy8gTWFrZSBhIGxpc3Qgb2YgdGhlIG5vZGVzIHRvIGJlIHNob3duIGluIHRoaXMgc3RhdGUuXG4gICAgY29uc3Qgbm9kZXNUb1Nob3cgPSBbXG4gICAgICB0aGlzLnNjb3JlYm9hcmQsXG4gICAgICB0aGlzLmNvbnRyb2xQYW5lbCxcbiAgICAgIHRoaXMudHJ5QWdhaW5CdXR0b24sXG4gICAgICB0aGlzLmNoYWxsZW5nZVByb21wdEJhbm5lcixcbiAgICAgIHRoaXMuZmFjZVdpdGhQb2ludHNOb2RlXG4gICAgXTtcblxuICAgIC8vIEFkZCB0aGUgbm9kZXMgd2hvc2UgdmlzaWJpbGl0eSB2YXJpZXMgYmFzZWQgb24gdGhlIGNoYWxsZW5nZSBjb25maWd1cmF0aW9uLlxuICAgIGlmICggY2hhbGxlbmdlLmNoZWNrU3BlYyA9PT0gJ2FyZWFFbnRlcmVkJyApIHtcbiAgICAgIG5vZGVzVG9TaG93LnB1c2goIHRoaXMubnVtYmVyRW50cnlDb250cm9sICk7XG4gICAgICBub2Rlc1RvU2hvdy5wdXNoKCB0aGlzLmFyZWFRdWVzdGlvblByb21wdCApO1xuICAgIH1cbiAgICBpZiAoIGNoYWxsZW5nZS51c2VyU2hhcGVzICkge1xuICAgICAgbm9kZXNUb1Nob3cucHVzaCggdGhpcy5zaGFwZUNhcm91c2VsTGF5ZXIgKTtcbiAgICAgIG5vZGVzVG9TaG93LnB1c2goIHRoaXMuZXJhc2VyQnV0dG9uICk7XG4gICAgfVxuXG4gICAgLy8gR2l2ZSB0aGUgdXNlciB0aGUgYXBwcm9wcmlhdGUgZmVlZGJhY2suXG4gICAgdGhpcy5nYW1lQXVkaW9QbGF5ZXIud3JvbmdBbnN3ZXIoKTtcbiAgICB0aGlzLmZhY2VXaXRoUG9pbnRzTm9kZS5mcm93bigpO1xuICAgIHRoaXMuZmFjZVdpdGhQb2ludHNOb2RlLnNldFBvaW50cyggdGhpcy5tb2RlbC5zY29yZVByb3BlcnR5LmdldCgpICk7XG5cbiAgICBpZiAoIGNoYWxsZW5nZS5jaGVja1NwZWMgPT09ICdhcmVhRW50ZXJlZCcgKSB7XG4gICAgICAvLyBTZXQgdGhlIGtleXBhZCB0byBhbGxvdyB0aGUgdXNlciB0byBzdGFydCBlbnRlcmluZyBhIG5ldyB2YWx1ZS5cbiAgICAgIHRoaXMubnVtYmVyRW50cnlDb250cm9sLnNldENsZWFyT25OZXh0S2V5UHJlc3MoIHRydWUgKTtcbiAgICB9XG5cbiAgICAvLyBTaG93IHRoZSBub2Rlc1xuICAgIHRoaXMuc2hvdyggbm9kZXNUb1Nob3cgKTtcbiAgfVxuXG4gIC8vIEBwcml2YXRlXG4gIGhhbmRsZVNob3dpbmdJbmNvcnJlY3RBbnN3ZXJGZWVkYmFja01vdmVPblN0YXRlKCBjaGFsbGVuZ2UgKSB7XG5cbiAgICAvLyBNYWtlIGEgbGlzdCBvZiB0aGUgbm9kZXMgdG8gYmUgc2hvd24gaW4gdGhpcyBzdGF0ZS5cbiAgICBjb25zdCBub2Rlc1RvU2hvdyA9IFtcbiAgICAgIHRoaXMuc2NvcmVib2FyZCxcbiAgICAgIHRoaXMuY29udHJvbFBhbmVsLFxuICAgICAgdGhpcy5jaGFsbGVuZ2VQcm9tcHRCYW5uZXIsXG4gICAgICB0aGlzLmZhY2VXaXRoUG9pbnRzTm9kZVxuICAgIF07XG5cbiAgICAvLyBBZGQgdGhlIG5vZGVzIHdob3NlIHZpc2liaWxpdHkgdmFyaWVzIGJhc2VkIG9uIHRoZSBjaGFsbGVuZ2UgY29uZmlndXJhdGlvbi5cbiAgICBpZiAoIGNoYWxsZW5nZS5idWlsZFNwZWMgKSB7XG4gICAgICBub2Rlc1RvU2hvdy5wdXNoKCB0aGlzLnNob3dBU29sdXRpb25CdXR0b24gKTtcbiAgICAgIHRoaXMudXBkYXRlWW91QnVpbHRXaW5kb3coIGNoYWxsZW5nZSApO1xuICAgICAgbm9kZXNUb1Nob3cucHVzaCggdGhpcy55b3VCdWlsdFdpbmRvdyApO1xuICAgICAgaWYgKCBjaGFsbGVuZ2UudXNlclNoYXBlcyApIHtcbiAgICAgICAgbm9kZXNUb1Nob3cucHVzaCggdGhpcy5zaGFwZUNhcm91c2VsTGF5ZXIgKTtcbiAgICAgICAgbm9kZXNUb1Nob3cucHVzaCggdGhpcy5lcmFzZXJCdXR0b24gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBub2Rlc1RvU2hvdy5wdXNoKCB0aGlzLnNvbHV0aW9uQnV0dG9uICk7XG4gICAgICB0aGlzLnVwZGF0ZVlvdUVudGVyZWRXaW5kb3coIGNoYWxsZW5nZSApO1xuICAgICAgbm9kZXNUb1Nob3cucHVzaCggdGhpcy55b3VFbnRlcmVkV2luZG93ICk7XG4gICAgfVxuXG4gICAgdGhpcy5zaG93KCBub2Rlc1RvU2hvdyApO1xuXG4gICAgLy8gR2l2ZSB0aGUgdXNlciB0aGUgYXBwcm9wcmlhdGUgZmVlZGJhY2tcbiAgICB0aGlzLmdhbWVBdWRpb1BsYXllci53cm9uZ0Fuc3dlcigpO1xuICAgIHRoaXMuZmFjZVdpdGhQb2ludHNOb2RlLmZyb3duKCk7XG4gICAgdGhpcy5mYWNlV2l0aFBvaW50c05vZGUuc2V0UG9pbnRzKCB0aGlzLm1vZGVsLnNjb3JlUHJvcGVydHkuZ2V0KCkgKTtcblxuICAgIC8vIEZvciAnYnVpbHQgaXQnIHN0eWxlIGNoYWxsZW5nZXMsIHRoZSB1c2VyIGNhbiBzdGlsbCBpbnRlcmFjdCB3aGlsZSBpbiB0aGlzIHN0YXRlIGluIGNhc2UgdGhleSB3YW50IHRvIHRyeVxuICAgIC8vIHRvIGdldCBpdCByaWdodC4gIEluICdmaW5kIHRoZSBhcmVhJyBjaGFsbGVuZ2VzLCBmdXJ0aGVyIGludGVyYWN0aW9uIGlzIGRpc2FsbG93ZWQuXG4gICAgaWYgKCBjaGFsbGVuZ2UuY2hlY2tTcGVjID09PSAnYXJlYUVudGVyZWQnICkge1xuICAgICAgdGhpcy5jaGFsbGVuZ2VMYXllci5waWNrYWJsZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFNob3cgdGhlIG5vZGVzLlxuICAgIHRoaXMuc2hvdyggbm9kZXNUb1Nob3cgKTtcbiAgfVxuXG4gIC8vIEBwcml2YXRlXG4gIGhhbmRsZURpc3BsYXlpbmdDb3JyZWN0QW5zd2VyU3RhdGUoIGNoYWxsZW5nZSApIHtcbiAgICAvLyBNYWtlIGEgbGlzdCBvZiB0aGUgbm9kZXMgdG8gYmUgc2hvd24gaW4gdGhpcyBzdGF0ZS5cbiAgICBjb25zdCBub2Rlc1RvU2hvdyA9IFtcbiAgICAgIHRoaXMuc2NvcmVib2FyZCxcbiAgICAgIHRoaXMuY29udHJvbFBhbmVsLFxuICAgICAgdGhpcy5uZXh0QnV0dG9uLFxuICAgICAgdGhpcy5zb2x1dGlvbkJhbm5lclxuICAgIF07XG5cbiAgICAvLyBLZWVwIHRoZSBhcHByb3ByaWF0ZSBmZWVkYmFjayB3aW5kb3cgdmlzaWJsZS5cbiAgICBpZiAoIGNoYWxsZW5nZS5idWlsZFNwZWMgKSB7XG4gICAgICBub2Rlc1RvU2hvdy5wdXNoKCB0aGlzLnlvdUJ1aWx0V2luZG93ICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbm9kZXNUb1Nob3cucHVzaCggdGhpcy55b3VFbnRlcmVkV2luZG93ICk7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIHRoZSBzb2x1dGlvbiBiYW5uZXIuXG4gICAgdGhpcy5zb2x1dGlvbkJhbm5lci5yZXNldCgpO1xuICAgIGlmICggY2hhbGxlbmdlLmJ1aWxkU3BlYyApIHtcbiAgICAgIHRoaXMuc29sdXRpb25CYW5uZXIudGl0bGVTdHJpbmdQcm9wZXJ0eS52YWx1ZSA9IGFTb2x1dGlvbkNvbG9uU3RyaW5nO1xuICAgICAgdGhpcy5zb2x1dGlvbkJhbm5lci5idWlsZFNwZWNQcm9wZXJ0eS52YWx1ZSA9IGNoYWxsZW5nZS5idWlsZFNwZWM7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5zb2x1dGlvbkJhbm5lci50aXRsZVN0cmluZ1Byb3BlcnR5LnZhbHVlID0gc29sdXRpb25Db2xvblN0cmluZztcbiAgICAgIHRoaXMuc29sdXRpb25CYW5uZXIuYXJlYVRvRmluZFByb3BlcnR5LnZhbHVlID0gY2hhbGxlbmdlLmJhY2tncm91bmRTaGFwZS51bml0QXJlYTtcbiAgICB9XG4gICAgdGhpcy5zaG93Q2hhbGxlbmdlR3JhcGhpY3MoKTtcblxuICAgIC8vIERpc2FibGUgaW50ZXJhY3Rpb24gd2l0aCB0aGUgY2hhbGxlbmdlIGVsZW1lbnRzLlxuICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIucGlja2FibGUgPSBmYWxzZTtcblxuICAgIC8vIFR1cm4gb24gdGhlIGRpbWVuc2lvbnMgaW5kaWNhdG9yLCBzaW5jZSBpdCBtYXkgbWFrZSB0aGUgYW5zd2VyIG1vcmUgY2xlYXIgZm9yIHRoZSB1c2VyLlxuICAgIHRoaXMuY2xlYXJEaW1lbnNpb25zQ29udHJvbE9uTmV4dENoYWxsZW5nZSA9ICF0aGlzLm1vZGVsLnNpbVNwZWNpZmljTW9kZWwuc2hvd0RpbWVuc2lvbnNQcm9wZXJ0eS5nZXQoKTtcbiAgICB0aGlzLm1vZGVsLnNpbVNwZWNpZmljTW9kZWwuc2hvd0RpbWVuc2lvbnNQcm9wZXJ0eS5zZXQoIHRydWUgKTtcblxuICAgIC8vIFNob3cgdGhlIG5vZGVzLlxuICAgIHRoaXMuc2hvdyggbm9kZXNUb1Nob3cgKTtcbiAgfVxuXG4gIC8vIEBwcml2YXRlXG4gIGhhbmRsZVNob3dpbmdMZXZlbFJlc3VsdHNTdGF0ZSgpIHtcbiAgICBpZiAoIHRoaXMubW9kZWwuc2NvcmVQcm9wZXJ0eS5nZXQoKSA9PT0gdGhpcy5tb2RlbC5tYXhQb3NzaWJsZVNjb3JlICkge1xuICAgICAgdGhpcy5nYW1lQXVkaW9QbGF5ZXIuZ2FtZU92ZXJQZXJmZWN0U2NvcmUoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHRoaXMubW9kZWwuc2NvcmVQcm9wZXJ0eS5nZXQoKSA9PT0gMCApIHtcbiAgICAgIHRoaXMuZ2FtZUF1ZGlvUGxheWVyLmdhbWVPdmVyWmVyb1Njb3JlKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5nYW1lQXVkaW9QbGF5ZXIuZ2FtZU92ZXJJbXBlcmZlY3RTY29yZSgpO1xuICAgIH1cblxuICAgIHRoaXMuc2hvd0xldmVsUmVzdWx0c05vZGUoKTtcbiAgICB0aGlzLmhpZGVDaGFsbGVuZ2UoKTtcbiAgfVxuXG4gIC8vIEBwcml2YXRlIFVwZGF0ZSB0aGUgd2luZG93IHRoYXQgZGVwaWN0cyB3aGF0IHRoZSB1c2VyIGhhcyBidWlsdC5cbiAgdXBkYXRlWW91QnVpbHRXaW5kb3coIGNoYWxsZW5nZSApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjaGFsbGVuZ2UuYnVpbGRTcGVjLCAnVGhpcyBtZXRob2Qgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIGZvciBjaGFsbGVuZ2VzIHRoYXQgaW5jbHVkZSBhIGJ1aWxkIHNwZWMuJyApO1xuICAgIGNvbnN0IHVzZXJCdWlsdFNwZWMgPSBuZXcgQnVpbGRTcGVjKFxuICAgICAgdGhpcy5hcmVhT2ZVc2VyQ3JlYXRlZFNoYXBlLFxuICAgICAgY2hhbGxlbmdlLmJ1aWxkU3BlYy5wZXJpbWV0ZXIgPyB0aGlzLnBlcmltZXRlck9mVXNlckNyZWF0ZWRTaGFwZSA6IG51bGwsXG4gICAgICBjaGFsbGVuZ2UuYnVpbGRTcGVjLnByb3BvcnRpb25zID8ge1xuICAgICAgICBjb2xvcjE6IGNoYWxsZW5nZS5idWlsZFNwZWMucHJvcG9ydGlvbnMuY29sb3IxLFxuICAgICAgICBjb2xvcjI6IGNoYWxsZW5nZS5idWlsZFNwZWMucHJvcG9ydGlvbnMuY29sb3IyLFxuICAgICAgICBjb2xvcjFQcm9wb3J0aW9uOiB0aGlzLmNvbG9yMVByb3BvcnRpb25cbiAgICAgIH0gOiBudWxsXG4gICAgKTtcbiAgICB0aGlzLnlvdUJ1aWx0V2luZG93LnNldEJ1aWxkU3BlYyggdXNlckJ1aWx0U3BlYyApO1xuICAgIHRoaXMueW91QnVpbHRXaW5kb3cuc2V0Q29sb3JCYXNlZE9uQW5zd2VyQ29ycmVjdG5lc3MoIHVzZXJCdWlsdFNwZWMuZXF1YWxzKCBjaGFsbGVuZ2UuYnVpbGRTcGVjICkgKTtcbiAgICB0aGlzLnlvdUJ1aWx0V2luZG93LmNlbnRlclkgPSB0aGlzLnNoYXBlQm9hcmRPcmlnaW5hbEJvdW5kcy5jZW50ZXJZO1xuICAgIHRoaXMueW91QnVpbHRXaW5kb3cuY2VudGVyWCA9ICggdGhpcy5sYXlvdXRCb3VuZHMubWF4WCArIHRoaXMuc2hhcGVCb2FyZE9yaWdpbmFsQm91bmRzLm1heFggKSAvIDI7XG4gIH1cblxuICAvLyBAcHJpdmF0ZSBVcGRhdGUgdGhlIHdpbmRvdyB0aGF0IGRlcGljdHMgd2hhdCB0aGUgdXNlciBoYXMgZW50ZXJlZCB1c2luZyB0aGUga2V5cGFkLlxuICB1cGRhdGVZb3VFbnRlcmVkV2luZG93KCBjaGFsbGVuZ2UgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY2hhbGxlbmdlLmNoZWNrU3BlYyA9PT0gJ2FyZWFFbnRlcmVkJywgJ1RoaXMgbWV0aG9kIHNob3VsZCBvbmx5IGJlIGNhbGxlZCBmb3IgZmluZC10aGUtYXJlYSBzdHlsZSBjaGFsbGVuZ2VzLicgKTtcbiAgICB0aGlzLnlvdUVudGVyZWRXaW5kb3cuc2V0VmFsdWVFbnRlcmVkKCB0aGlzLm1vZGVsLnNpbVNwZWNpZmljTW9kZWwuYXJlYUd1ZXNzICk7XG4gICAgdGhpcy55b3VFbnRlcmVkV2luZG93LnNldENvbG9yQmFzZWRPbkFuc3dlckNvcnJlY3RuZXNzKCBjaGFsbGVuZ2UuYmFja2dyb3VuZFNoYXBlLnVuaXRBcmVhID09PSB0aGlzLm1vZGVsLnNpbVNwZWNpZmljTW9kZWwuYXJlYUd1ZXNzICk7XG4gICAgdGhpcy55b3VFbnRlcmVkV2luZG93LmNlbnRlclkgPSB0aGlzLnNoYXBlQm9hcmRPcmlnaW5hbEJvdW5kcy5jZW50ZXJZO1xuICAgIHRoaXMueW91RW50ZXJlZFdpbmRvdy5jZW50ZXJYID0gKCB0aGlzLmxheW91dEJvdW5kcy5tYXhYICsgdGhpcy5zaGFwZUJvYXJkT3JpZ2luYWxCb3VuZHMubWF4WCApIC8gMjtcbiAgfVxuXG4gIC8vIEBwcml2YXRlIEdyYWIgYSBzbmFwc2hvdCBvZiB3aGF0ZXZlciB0aGUgdXNlciBoYXMgYnVpbHQgb3IgZW50ZXJlZFxuICB1cGRhdGVVc2VyQW5zd2VyKCkge1xuICAgIC8vIFNhdmUgdGhlIHBhcmFtZXRlcnMgb2Ygd2hhdCB0aGUgdXNlciBoYXMgYnVpbHQsIGlmIHRoZXkndmUgYnVpbHQgYW55dGhpbmcuXG4gICAgdGhpcy5hcmVhT2ZVc2VyQ3JlYXRlZFNoYXBlID0gdGhpcy5tb2RlbC5zaW1TcGVjaWZpY01vZGVsLnNoYXBlUGxhY2VtZW50Qm9hcmQuYXJlYUFuZFBlcmltZXRlclByb3BlcnR5LmdldCgpLmFyZWE7XG4gICAgdGhpcy5wZXJpbWV0ZXJPZlVzZXJDcmVhdGVkU2hhcGUgPSB0aGlzLm1vZGVsLnNpbVNwZWNpZmljTW9kZWwuc2hhcGVQbGFjZW1lbnRCb2FyZC5hcmVhQW5kUGVyaW1ldGVyUHJvcGVydHkuZ2V0KCkucGVyaW1ldGVyO1xuICAgIGNvbnN0IGNoYWxsZW5nZSA9IHRoaXMubW9kZWwuY3VycmVudENoYWxsZW5nZVByb3BlcnR5LmdldCgpOyAvLyBjb252ZW5pZW5jZSB2YXJcbiAgICBpZiAoIGNoYWxsZW5nZS5idWlsZFNwZWMgJiYgY2hhbGxlbmdlLmJ1aWxkU3BlYy5wcm9wb3J0aW9ucyApIHtcbiAgICAgIHRoaXMuY29sb3IxUHJvcG9ydGlvbiA9IHRoaXMubW9kZWwuc2ltU3BlY2lmaWNNb2RlbC5nZXRQcm9wb3J0aW9uT2ZDb2xvciggY2hhbGxlbmdlLmJ1aWxkU3BlYy5wcm9wb3J0aW9ucy5jb2xvcjEgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLmNvbG9yMVByb3BvcnRpb24gPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFN1Ym1pdCB0aGUgdXNlcidzIGFyZWEgZ3Vlc3MsIGlmIHRoZXJlIGlzIG9uZS5cbiAgICB0aGlzLm1vZGVsLnNpbVNwZWNpZmljTW9kZWwuYXJlYUd1ZXNzID0gdGhpcy5udW1iZXJFbnRyeUNvbnRyb2wudmFsdWU7XG4gIH1cblxuICAvLyBAcHJpdmF0ZSBSZXR1cm5zIHRydWUgaWYgYW55IHNoYXBlIGlzIGFuaW1hdGluZyBvciB1c2VyIGNvbnRyb2xsZWQsIGZhbHNlIGlmIG5vdC5cbiAgaXNBbnlTaGFwZU1vdmluZygpIHtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm1vZGVsLnNpbVNwZWNpZmljTW9kZWwubW92YWJsZVNoYXBlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmICggdGhpcy5tb2RlbC5zaW1TcGVjaWZpY01vZGVsLm1vdmFibGVTaGFwZXMuZ2V0KCBpICkuYW5pbWF0aW5nUHJvcGVydHkuZ2V0KCkgfHxcbiAgICAgICAgICAgdGhpcy5tb2RlbC5zaW1TcGVjaWZpY01vZGVsLm1vdmFibGVTaGFwZXMuZ2V0KCBpICkudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5nZXQoKSApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBkaXNwb3NlQ3VycmVudENhcm91c2VsKCkge1xuICAgIHRoaXMuYWN0aXZlU2hhcGVOb2RlQ3JlYXRvcnMubGVuZ3RoID0gMDtcbiAgICBpZiAoIHRoaXMuY2Fyb3VzZWwgKSB7XG4gICAgICB0aGlzLmNhcm91c2VsLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuY2Fyb3VzZWwgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVzZW50IHRoZSBjaGFsbGVuZ2UgdG8gdGhlIHVzZXIgYW5kIHNldCB0aGluZ3MgdXAgc28gdGhhdCB0aGV5IGNhbiBzdWJtaXQgdGhlaXIgYW5zd2VyLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJlc2VudENoYWxsZW5nZSgpIHtcblxuICAgIGlmICggdGhpcy5tb2RlbC5pbmNvcnJlY3RHdWVzc2VzT25DdXJyZW50Q2hhbGxlbmdlID09PSAwICkge1xuXG4gICAgICAvLyBDbGVhbiB1cCBwcmV2aW91cyBjaGFsbGVuZ2UuXG4gICAgICB0aGlzLm1vZGVsLnNpbVNwZWNpZmljTW9kZWwuY2xlYXJTaGFwZVBsYWNlbWVudEJvYXJkKCk7XG4gICAgICB0aGlzLmNoYWxsZW5nZVByb21wdEJhbm5lci5yZXNldCgpO1xuXG4gICAgICB0aGlzLmRpc3Bvc2VDdXJyZW50Q2Fyb3VzZWwoKTtcblxuICAgICAgY29uc3QgY2hhbGxlbmdlID0gdGhpcy5tb2RlbC5jdXJyZW50Q2hhbGxlbmdlUHJvcGVydHkuZ2V0KCk7IC8vIENvbnZlbmllbmNlIHZhclxuXG4gICAgICAvLyBTZXQgdXAgdGhlIGNoYWxsZW5nZSBwcm9tcHQgYmFubmVyLCB3aGljaCBhcHBlYXJzIGFib3ZlIHRoZSBzaGFwZSBwbGFjZW1lbnQgYm9hcmQuXG4gICAgICB0aGlzLmNoYWxsZW5nZVByb21wdEJhbm5lci50aXRsZVN0cmluZ1Byb3BlcnR5LnZhbHVlID0gY2hhbGxlbmdlLmJ1aWxkU3BlYyA/IGJ1aWxkSXRTdHJpbmcgOiBmaW5kVGhlQXJlYVN0cmluZztcblxuICAgICAgLy8gSWYgbmVlZGVkLCBzZXQgdXAgdGhlIGdvYWwgcHJvbXB0IHRoYXQgd2lsbCBpbml0aWFsbHkgYXBwZWFyIG92ZXIgdGhlIHNoYXBlIHBsYWNlbWVudCBib2FyZCAoaW4gdGhlIHotb3JkZXIpLlxuICAgICAgaWYgKCBjaGFsbGVuZ2UuYnVpbGRTcGVjICkge1xuXG4gICAgICAgIHRoaXMuYnVpbGRQcm9tcHRWQm94LnJlbW92ZUFsbENoaWxkcmVuKCk7XG4gICAgICAgIHRoaXMuYnVpbGRQcm9tcHRWQm94LmFkZENoaWxkKCB0aGlzLnlvdXJHb2FsVGl0bGUgKTtcbiAgICAgICAgY29uc3QgYXJlYUdvYWxOb2RlID0gbmV3IFRleHQoIFN0cmluZ1V0aWxzLmZvcm1hdCggYXJlYUVxdWFsc1N0cmluZywgY2hhbGxlbmdlLmJ1aWxkU3BlYy5hcmVhICksIHtcbiAgICAgICAgICBmb250OiBHT0FMX1BST01QVF9GT05ULFxuICAgICAgICAgIG1heFdpZHRoOiB0aGlzLnNoYXBlQm9hcmRPcmlnaW5hbEJvdW5kcy53aWR0aCAqIDAuOVxuICAgICAgICB9ICk7XG4gICAgICAgIGlmICggY2hhbGxlbmdlLmJ1aWxkU3BlYy5wcm9wb3J0aW9ucyApIHtcbiAgICAgICAgICBjb25zdCBhcmVhUHJvbXB0ID0gbmV3IE5vZGUoKTtcbiAgICAgICAgICBhcmVhUHJvbXB0LmFkZENoaWxkKCBhcmVhR29hbE5vZGUgKTtcbiAgICAgICAgICBhcmVhR29hbE5vZGUuc3RyaW5nID0gYCR7YXJlYUdvYWxOb2RlLnN0cmluZ30sYDtcbiAgICAgICAgICBjb25zdCBjb2xvclByb3BvcnRpb25zUHJvbXB0ID0gbmV3IENvbG9yUHJvcG9ydGlvbnNQcm9tcHQoIGNoYWxsZW5nZS5idWlsZFNwZWMucHJvcG9ydGlvbnMuY29sb3IxLFxuICAgICAgICAgICAgY2hhbGxlbmdlLmJ1aWxkU3BlYy5wcm9wb3J0aW9ucy5jb2xvcjIsIGNoYWxsZW5nZS5idWlsZFNwZWMucHJvcG9ydGlvbnMuY29sb3IxUHJvcG9ydGlvbiwge1xuICAgICAgICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTYsIHdlaWdodDogJ2JvbGQnIH0gKSxcbiAgICAgICAgICAgICAgbGVmdDogYXJlYUdvYWxOb2RlLndpZHRoICsgMTAsXG4gICAgICAgICAgICAgIGNlbnRlclk6IGFyZWFHb2FsTm9kZS5jZW50ZXJZLFxuICAgICAgICAgICAgICBtYXhXaWR0aDogdGhpcy5zaGFwZUJvYXJkT3JpZ2luYWxCb3VuZHMud2lkdGggKiAwLjlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgICAgIGFyZWFQcm9tcHQuYWRkQ2hpbGQoIGNvbG9yUHJvcG9ydGlvbnNQcm9tcHQgKTtcblxuICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGUgcHJvbXB0IHdpbGwgZml0IG9uIHRoZSBib2FyZCAtIGltcG9ydGFudCBmb3IgdHJhbnNsYXRhYmlsaXR5XG4gICAgICAgICAgaWYgKCBhcmVhUHJvbXB0LndpZHRoID4gdGhpcy5zaGFwZUJvYXJkT3JpZ2luYWxCb3VuZHMud2lkdGggKiAwLjkgKSB7XG4gICAgICAgICAgICBhcmVhUHJvbXB0LnNjYWxlKCAoIHRoaXMuc2hhcGVCb2FyZE9yaWdpbmFsQm91bmRzLndpZHRoICogMC45ICkgLyBhcmVhUHJvbXB0LndpZHRoICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5idWlsZFByb21wdFZCb3guYWRkQ2hpbGQoIGFyZWFQcm9tcHQgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0aGlzLmJ1aWxkUHJvbXB0VkJveC5hZGRDaGlsZCggYXJlYUdvYWxOb2RlICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIGNoYWxsZW5nZS5idWlsZFNwZWMucGVyaW1ldGVyICkge1xuICAgICAgICAgIHRoaXMuYnVpbGRQcm9tcHRWQm94LmFkZENoaWxkKCBuZXcgVGV4dCggU3RyaW5nVXRpbHMuZm9ybWF0KCBwZXJpbWV0ZXJFcXVhbHNTdHJpbmcsIGNoYWxsZW5nZS5idWlsZFNwZWMucGVyaW1ldGVyICksIHtcbiAgICAgICAgICAgIGZvbnQ6IEdPQUxfUFJPTVBUX0ZPTlQsXG4gICAgICAgICAgICBtYXhXaWR0aDogdGhpcy5tYXhTaGFwZUJvYXJkVGV4dFdpZHRoXG4gICAgICAgICAgfSApICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDZW50ZXIgdGhlIHBhbmVsIG92ZXIgdGhlIHNoYXBlIGJvYXJkIGFuZCBtYWtlIGl0IHZpc2libGUuXG4gICAgICAgIHRoaXMuYnVpbGRQcm9tcHRQYW5lbC5jZW50ZXJYID0gdGhpcy5zaGFwZUJvYXJkT3JpZ2luYWxCb3VuZHMuY2VudGVyWDtcbiAgICAgICAgdGhpcy5idWlsZFByb21wdFBhbmVsLmNlbnRlclkgPSB0aGlzLnNoYXBlQm9hcmRPcmlnaW5hbEJvdW5kcy5jZW50ZXJZO1xuICAgICAgICB0aGlzLmJ1aWxkUHJvbXB0UGFuZWwudmlzaWJsZSA9IHRydWU7XG4gICAgICAgIHRoaXMuYnVpbGRQcm9tcHRQYW5lbC5vcGFjaXR5ID0gMTsgLy8gTmVjZXNzYXJ5IGJlY2F1c2UgdGhlIGJvYXJkIGlzIHNldCB0byBmYWRlIG91dCBlbHNld2hlcmUuXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5idWlsZFByb21wdFBhbmVsLnZpc2libGUgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gU2V0IHRoZSBzdGF0ZSBvZiB0aGUgY29udHJvbCBwYW5lbC5cbiAgICAgIHRoaXMuY29udHJvbFBhbmVsLmRpbWVuc2lvbnNJY29uLnNldEdyaWRWaXNpYmxlKCAhY2hhbGxlbmdlLmJhY2tncm91bmRTaGFwZSApO1xuICAgICAgdGhpcy5jb250cm9sUGFuZWwuZ3JpZENvbnRyb2xWaXNpYmxlUHJvcGVydHkuc2V0KCBjaGFsbGVuZ2UudG9vbFNwZWMuZ3JpZENvbnRyb2wgKTtcbiAgICAgIHRoaXMuY29udHJvbFBhbmVsLmRpbWVuc2lvbnNDb250cm9sVmlzaWJsZVByb3BlcnR5LnNldCggY2hhbGxlbmdlLnRvb2xTcGVjLmRpbWVuc2lvbnNDb250cm9sICk7XG4gICAgICBpZiAoIGNoYWxsZW5nZS5iYWNrZ3JvdW5kU2hhcGUgKSB7XG4gICAgICAgIHRoaXMuY29udHJvbFBhbmVsLmRpbWVuc2lvbnNJY29uLnNldENvbG9yKCBjaGFsbGVuZ2UuYmFja2dyb3VuZFNoYXBlLmZpbGxDb2xvciApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIGNoYWxsZW5nZS51c2VyU2hhcGVzICkge1xuICAgICAgICB0aGlzLmNvbnRyb2xQYW5lbC5kaW1lbnNpb25zSWNvbi5zZXRDb2xvciggY2hhbGxlbmdlLnVzZXJTaGFwZXNbIDAgXS5jb2xvciApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuY29udHJvbFBhbmVsLmRpbWVuc2lvbnNJY29uLnNldENvbG9yKCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5HUkVFTklTSF9DT0xPUiApO1xuICAgICAgfVxuXG4gICAgICAvLyBDcmVhdGUgdGhlIGNhcm91c2VsIGlmIGluY2x1ZGVkIGFzIHBhcnQgb2YgdGhpcyBjaGFsbGVuZ2UuXG4gICAgICBpZiAoIGNoYWxsZW5nZS51c2VyU2hhcGVzICE9PSBudWxsICkge1xuICAgICAgICBjaGFsbGVuZ2UudXNlclNoYXBlcy5mb3JFYWNoKCB1c2VyU2hhcGVTcGVjID0+IHtcbiAgICAgICAgICBjb25zdCBjcmVhdG9yTm9kZU9wdGlvbnMgPSB7XG4gICAgICAgICAgICBncmlkU3BhY2luZzogQXJlYUJ1aWxkZXJHYW1lTW9kZWwuVU5JVF9TUVVBUkVfTEVOR1RILFxuICAgICAgICAgICAgc2hhcGVEcmFnQm91bmRzOiB0aGlzLmxheW91dEJvdW5kcyxcbiAgICAgICAgICAgIG5vbk1vdmluZ0FuY2VzdG9yOiB0aGlzLnNoYXBlQ2Fyb3VzZWxMYXllclxuICAgICAgICAgIH07XG4gICAgICAgICAgaWYgKCB1c2VyU2hhcGVTcGVjLmNyZWF0aW9uTGltaXQgKSB7XG4gICAgICAgICAgICBjcmVhdG9yTm9kZU9wdGlvbnMuY3JlYXRpb25MaW1pdCA9IHVzZXJTaGFwZVNwZWMuY3JlYXRpb25MaW1pdDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5hY3RpdmVTaGFwZU5vZGVDcmVhdG9ycy5wdXNoKCB7XG4gICAgICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgU2hhcGVDcmVhdG9yTm9kZShcbiAgICAgICAgICAgICAgdXNlclNoYXBlU3BlYy5zaGFwZSxcbiAgICAgICAgICAgICAgdXNlclNoYXBlU3BlYy5jb2xvcixcbiAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zaW1TcGVjaWZpY01vZGVsLmFkZFVzZXJDcmVhdGVkTW92YWJsZVNoYXBlLmJpbmQoIHRoaXMubW9kZWwuc2ltU3BlY2lmaWNNb2RlbCApLFxuICAgICAgICAgICAgICBjcmVhdG9yTm9kZU9wdGlvbnNcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9ICk7XG4gICAgICAgIH0gKTtcblxuICAgICAgICAvLyBBZGQgYSBzY3JvbGxpbmcgY2Fyb3VzZWwuXG4gICAgICAgIHRoaXMuY2Fyb3VzZWwgPSBuZXcgQ2Fyb3VzZWwoIHRoaXMuYWN0aXZlU2hhcGVOb2RlQ3JlYXRvcnMsIHtcbiAgICAgICAgICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLFxuICAgICAgICAgIGl0ZW1zUGVyUGFnZTogSVRFTVNfUEVSX0NBUk9VU0VMX1BBR0UsXG4gICAgICAgICAgY2VudGVyWDogdGhpcy5zaGFwZUJvYXJkT3JpZ2luYWxCb3VuZHMuY2VudGVyWCxcbiAgICAgICAgICB0b3A6IHRoaXMuc2hhcGVCb2FyZE9yaWdpbmFsQm91bmRzLmJvdHRvbSArIFNQQUNFX0FST1VORF9TSEFQRV9QTEFDRU1FTlRfQk9BUkQsXG4gICAgICAgICAgZmlsbDogQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuQ09OVFJPTF9QQU5FTF9CQUNLR1JPVU5EX0NPTE9SXG4gICAgICAgIH0gKTtcbiAgICAgICAgdGhpcy5zaGFwZUNhcm91c2VsTGF5ZXIuYWRkQ2hpbGQoIHRoaXMuY2Fyb3VzZWwgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBAcHJpdmF0ZSwgVXRpbGl0eSBtZXRob2QgZm9yIGhpZGluZyBhbGwgb2YgdGhlIGdhbWUgbm9kZXMgd2hvc2UgdmlzaWJpbGl0eSBjaGFuZ2VzIGR1cmluZyB0aGUgY291cnNlIG9mIGEgY2hhbGxlbmdlLlxuICBoaWRlQWxsR2FtZU5vZGVzKCkge1xuICAgIHRoaXMuZ2FtZUNvbnRyb2xCdXR0b25zLmZvckVhY2goIGJ1dHRvbiA9PiB7IGJ1dHRvbi52aXNpYmxlID0gZmFsc2U7IH0gKTtcbiAgICB0aGlzLnNldE5vZGVWaXNpYmlsaXR5KCBmYWxzZSwgW1xuICAgICAgdGhpcy5zdGFydEdhbWVMZXZlbE5vZGUsXG4gICAgICB0aGlzLmZhY2VXaXRoUG9pbnRzTm9kZSxcbiAgICAgIHRoaXMuc2NvcmVib2FyZCxcbiAgICAgIHRoaXMuY29udHJvbFBhbmVsLFxuICAgICAgdGhpcy5jaGFsbGVuZ2VQcm9tcHRCYW5uZXIsXG4gICAgICB0aGlzLnNvbHV0aW9uQmFubmVyLFxuICAgICAgdGhpcy5udW1iZXJFbnRyeUNvbnRyb2wsXG4gICAgICB0aGlzLmFyZWFRdWVzdGlvblByb21wdCxcbiAgICAgIHRoaXMueW91QnVpbHRXaW5kb3csXG4gICAgICB0aGlzLnlvdUVudGVyZWRXaW5kb3csXG4gICAgICB0aGlzLnNoYXBlQ2Fyb3VzZWxMYXllcixcbiAgICAgIHRoaXMuZXJhc2VyQnV0dG9uXG4gICAgXSApO1xuICB9XG5cbiAgLy8gQHByaXZhdGVcbiAgc2hvdyggbm9kZXNUb1Nob3cgKSB7XG4gICAgbm9kZXNUb1Nob3cuZm9yRWFjaCggbm9kZVRvU2hvdyA9PiB7IG5vZGVUb1Nob3cudmlzaWJsZSA9IHRydWU7IH0gKTtcbiAgfVxuXG4gIC8vIEBwcml2YXRlXG4gIHNldE5vZGVWaXNpYmlsaXR5KCBpc1Zpc2libGUsIG5vZGVzICkge1xuICAgIG5vZGVzLmZvckVhY2goIG5vZGUgPT4geyBub2RlLnZpc2libGUgPSBpc1Zpc2libGU7IH0gKTtcbiAgfVxuXG4gIC8vIEBwcml2YXRlXG4gIGhpZGVDaGFsbGVuZ2UoKSB7XG4gICAgdGhpcy5jaGFsbGVuZ2VMYXllci52aXNpYmxlID0gZmFsc2U7XG4gICAgdGhpcy5jb250cm9sTGF5ZXIudmlzaWJsZSA9IGZhbHNlO1xuICB9XG5cbiAgLy8gQHByaXZhdGUgU2hvdyB0aGUgZ3JhcGhpYyBtb2RlbCBlbGVtZW50cyBmb3IgdGhpcyBjaGFsbGVuZ2UuXG4gIHNob3dDaGFsbGVuZ2VHcmFwaGljcygpIHtcbiAgICB0aGlzLmNoYWxsZW5nZUxheWVyLnZpc2libGUgPSB0cnVlO1xuICAgIHRoaXMuY29udHJvbExheWVyLnZpc2libGUgPSB0cnVlO1xuICB9XG5cbiAgLy8gQHByaXZhdGVcbiAgdXBkYXRlZENoZWNrQnV0dG9uRW5hYmxlZFN0YXRlKCkge1xuICAgIGlmICggdGhpcy5tb2RlbC5jdXJyZW50Q2hhbGxlbmdlUHJvcGVydHkuZ2V0KCkgKSB7XG4gICAgICBpZiAoIHRoaXMubW9kZWwuY3VycmVudENoYWxsZW5nZVByb3BlcnR5LmdldCgpLmNoZWNrU3BlYyA9PT0gJ2FyZWFFbnRlcmVkJyApIHtcbiAgICAgICAgdGhpcy5jaGVja0Fuc3dlckJ1dHRvbi5lbmFibGVkID0gdGhpcy5udW1iZXJFbnRyeUNvbnRyb2wua2V5cGFkLnZhbHVlU3RyaW5nUHJvcGVydHkudmFsdWUubGVuZ3RoID4gMDtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmNoZWNrQW5zd2VyQnV0dG9uLmVuYWJsZWQgPSB0aGlzLm1vZGVsLnNpbVNwZWNpZmljTW9kZWwuc2hhcGVQbGFjZW1lbnRCb2FyZC5hcmVhQW5kUGVyaW1ldGVyUHJvcGVydHkuZ2V0KCkuYXJlYSA+IDA7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQHByaXZhdGVcbiAgc2hvd0xldmVsUmVzdWx0c05vZGUoKSB7XG4gICAgLy8gU2V0IGEgbmV3IFwibGV2ZWwgY29tcGxldGVkXCIgbm9kZSBiYXNlZCBvbiB0aGUgcmVzdWx0cy5cbiAgICBsZXQgbGV2ZWxDb21wbGV0ZWROb2RlID0gbmV3IExldmVsQ29tcGxldGVkTm9kZShcbiAgICAgIHRoaXMubW9kZWwubGV2ZWxQcm9wZXJ0eS5nZXQoKSArIDEsXG4gICAgICB0aGlzLm1vZGVsLnNjb3JlUHJvcGVydHkuZ2V0KCksXG4gICAgICB0aGlzLm1vZGVsLm1heFBvc3NpYmxlU2NvcmUsXG4gICAgICB0aGlzLm1vZGVsLmNoYWxsZW5nZXNQZXJTZXQsXG4gICAgICB0aGlzLm1vZGVsLnRpbWVyRW5hYmxlZFByb3BlcnR5LmdldCgpLFxuICAgICAgdGhpcy5tb2RlbC5lbGFwc2VkVGltZVByb3BlcnR5LmdldCgpLFxuICAgICAgdGhpcy5tb2RlbC5iZXN0VGltZXNbIHRoaXMubW9kZWwubGV2ZWxQcm9wZXJ0eS5nZXQoKSBdLFxuICAgICAgdGhpcy5tb2RlbC5uZXdCZXN0VGltZSxcbiAgICAgICgpID0+IHtcbiAgICAgICAgdGhpcy5tb2RlbC5nYW1lU3RhdGVQcm9wZXJ0eS5zZXQoIEdhbWVTdGF0ZS5DSE9PU0lOR19MRVZFTCApO1xuICAgICAgICB0aGlzLnJvb3ROb2RlLnJlbW92ZUNoaWxkKCBsZXZlbENvbXBsZXRlZE5vZGUgKTtcbiAgICAgICAgbGV2ZWxDb21wbGV0ZWROb2RlID0gbnVsbDtcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGNlbnRlcjogdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyXG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIEFkZCB0aGUgbm9kZS5cbiAgICB0aGlzLnJvb3ROb2RlLmFkZENoaWxkKCBsZXZlbENvbXBsZXRlZE5vZGUgKTtcbiAgfVxufVxuXG5hcmVhQnVpbGRlci5yZWdpc3RlciggJ0FyZWFCdWlsZGVyR2FtZVZpZXcnLCBBcmVhQnVpbGRlckdhbWVWaWV3ICk7XG5leHBvcnQgZGVmYXVsdCBBcmVhQnVpbGRlckdhbWVWaWV3OyJdLCJuYW1lcyI6WyJTY3JlZW5WaWV3IiwibWVyZ2UiLCJTdHJpbmdVdGlscyIsIkVyYXNlckJ1dHRvbiIsIkZhY2VXaXRoUG9pbnRzTm9kZSIsIk51bWJlckVudHJ5Q29udHJvbCIsIlBoZXRDb2xvclNjaGVtZSIsIlBoZXRGb250IiwiTm9kZSIsIlRleHQiLCJWQm94IiwiUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIiwiVGV4dFB1c2hCdXR0b24iLCJDYXJvdXNlbCIsIlBhbmVsIiwiQW5pbWF0aW9uIiwiRWFzaW5nIiwiR2FtZUF1ZGlvUGxheWVyIiwiTGV2ZWxDb21wbGV0ZWROb2RlIiwiVmVnYXNTdHJpbmdzIiwiYXJlYUJ1aWxkZXIiLCJBcmVhQnVpbGRlclN0cmluZ3MiLCJBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cyIsIkFyZWFCdWlsZGVyQ29udHJvbFBhbmVsIiwiU2hhcGVDcmVhdG9yTm9kZSIsIlNoYXBlTm9kZSIsIlNoYXBlUGxhY2VtZW50Qm9hcmROb2RlIiwiQXJlYUJ1aWxkZXJHYW1lTW9kZWwiLCJCdWlsZFNwZWMiLCJHYW1lU3RhdGUiLCJBcmVhQnVpbGRlclNjb3JlYm9hcmQiLCJDb2xvclByb3BvcnRpb25zUHJvbXB0IiwiR2FtZUljb25GYWN0b3J5IiwiR2FtZUluZm9CYW5uZXIiLCJTdGFydEdhbWVMZXZlbE5vZGUiLCJZb3VCdWlsdFdpbmRvdyIsIllvdUVudGVyZWRXaW5kb3ciLCJhcmVhRXF1YWxzU3RyaW5nIiwiYXJlYUVxdWFscyIsImFyZWFRdWVzdGlvblN0cmluZyIsImFyZWFRdWVzdGlvbiIsImFTb2x1dGlvbkNvbG9uU3RyaW5nIiwiYVNvbHV0aW9uQ29sb24iLCJhU29sdXRpb25TdHJpbmciLCJhU29sdXRpb24iLCJidWlsZEl0U3RyaW5nIiwiYnVpbGRJdCIsImNoZWNrU3RyaW5nIiwiY2hlY2siLCJmaW5kVGhlQXJlYVN0cmluZyIsImZpbmRUaGVBcmVhIiwibmV4dFN0cmluZyIsIm5leHQiLCJwZXJpbWV0ZXJFcXVhbHNTdHJpbmciLCJwZXJpbWV0ZXJFcXVhbHMiLCJzb2x1dGlvbkNvbG9uU3RyaW5nIiwic29sdXRpb25Db2xvbiIsInNvbHV0aW9uU3RyaW5nIiwic29sdXRpb24iLCJzdGFydE92ZXJTdHJpbmciLCJzdGFydE92ZXIiLCJ0cnlBZ2FpblN0cmluZyIsInRyeUFnYWluIiwieW91ckdvYWxTdHJpbmciLCJ5b3VyR29hbCIsIkJVVFRPTl9GT05UIiwiQlVUVE9OX0ZJTEwiLCJCVVRUT05fWUVMTE9XIiwiSU5GT19CQU5ORVJfSEVJR0hUIiwiR09BTF9QUk9NUFRfRk9OVCIsInNpemUiLCJ3ZWlnaHQiLCJTUEFDRV9BUk9VTkRfU0hBUEVfUExBQ0VNRU5UX0JPQVJEIiwiQ09OVFJPTFNfSU5TRVQiLCJJVEVNU19QRVJfQ0FST1VTRUxfUEFHRSIsIkJVVFRPTl9UT1VDSF9BUkVBX0RJTEFUSU9OIiwiQXJlYUJ1aWxkZXJHYW1lVmlldyIsImhhbmRsZUdhbWVTdGF0ZUNoYW5nZSIsImdhbWVTdGF0ZSIsImhpZGVBbGxHYW1lTm9kZXMiLCJjaGFsbGVuZ2UiLCJtb2RlbCIsImN1cnJlbnRDaGFsbGVuZ2VQcm9wZXJ0eSIsImdldCIsIkNIT09TSU5HX0xFVkVMIiwiaGFuZGxlQ2hvb3NpbmdMZXZlbFN0YXRlIiwiUFJFU0VOVElOR19JTlRFUkFDVElWRV9DSEFMTEVOR0UiLCJoYW5kbGVQcmVzZW50aW5nSW50ZXJhY3RpdmVDaGFsbGVuZ2VTdGF0ZSIsIlNIT1dJTkdfQ09SUkVDVF9BTlNXRVJfRkVFREJBQ0siLCJoYW5kbGVTaG93aW5nQ29ycmVjdEFuc3dlckZlZWRiYWNrU3RhdGUiLCJTSE9XSU5HX0lOQ09SUkVDVF9BTlNXRVJfRkVFREJBQ0tfVFJZX0FHQUlOIiwiaGFuZGxlU2hvd2luZ0luY29ycmVjdEFuc3dlckZlZWRiYWNrVHJ5QWdhaW5TdGF0ZSIsIlNIT1dJTkdfSU5DT1JSRUNUX0FOU1dFUl9GRUVEQkFDS19NT1ZFX09OIiwiaGFuZGxlU2hvd2luZ0luY29ycmVjdEFuc3dlckZlZWRiYWNrTW92ZU9uU3RhdGUiLCJESVNQTEFZSU5HX0NPUlJFQ1RfQU5TV0VSIiwiaGFuZGxlRGlzcGxheWluZ0NvcnJlY3RBbnN3ZXJTdGF0ZSIsIlNIT1dJTkdfTEVWRUxfUkVTVUxUUyIsImhhbmRsZVNob3dpbmdMZXZlbFJlc3VsdHNTdGF0ZSIsIkVycm9yIiwic2hvdyIsInN0YXJ0R2FtZUxldmVsTm9kZSIsImhpZGVDaGFsbGVuZ2UiLCJjaGFsbGVuZ2VMYXllciIsInBpY2thYmxlIiwicHJlc2VudENoYWxsZW5nZSIsIm5vZGVzVG9TaG93Iiwic2NvcmVib2FyZCIsImNvbnRyb2xQYW5lbCIsImNoZWNrQW5zd2VyQnV0dG9uIiwiY2hhbGxlbmdlUHJvbXB0QmFubmVyIiwiY2hlY2tTcGVjIiwicHVzaCIsIm51bWJlckVudHJ5Q29udHJvbCIsImFyZWFRdWVzdGlvblByb21wdCIsInVzZXJTaGFwZXMiLCJzaGFwZUNhcm91c2VsTGF5ZXIiLCJlcmFzZXJCdXR0b24iLCJzaG93Q2hhbGxlbmdlR3JhcGhpY3MiLCJ1cGRhdGVkQ2hlY2tCdXR0b25FbmFibGVkU3RhdGUiLCJva2F5VG9VcGRhdGVZb3VCdWlsdFdpbmRvdyIsImNsZWFyRGltZW5zaW9uc0NvbnRyb2xPbk5leHRDaGFsbGVuZ2UiLCJzaW1TcGVjaWZpY01vZGVsIiwic2hvd0RpbWVuc2lvbnNQcm9wZXJ0eSIsInNldCIsIm5leHRCdXR0b24iLCJmYWNlV2l0aFBvaW50c05vZGUiLCJidWlsZFNwZWMiLCJ1cGRhdGVZb3VCdWlsdFdpbmRvdyIsInlvdUJ1aWx0V2luZG93IiwidXBkYXRlWW91RW50ZXJlZFdpbmRvdyIsInlvdUVudGVyZWRXaW5kb3ciLCJnYW1lQXVkaW9QbGF5ZXIiLCJjb3JyZWN0QW5zd2VyIiwic21pbGUiLCJzZXRQb2ludHMiLCJnZXRDaGFsbGVuZ2VDdXJyZW50UG9pbnRWYWx1ZSIsInRyeUFnYWluQnV0dG9uIiwid3JvbmdBbnN3ZXIiLCJmcm93biIsInNjb3JlUHJvcGVydHkiLCJzZXRDbGVhck9uTmV4dEtleVByZXNzIiwic2hvd0FTb2x1dGlvbkJ1dHRvbiIsInNvbHV0aW9uQnV0dG9uIiwic29sdXRpb25CYW5uZXIiLCJyZXNldCIsInRpdGxlU3RyaW5nUHJvcGVydHkiLCJ2YWx1ZSIsImJ1aWxkU3BlY1Byb3BlcnR5IiwiYXJlYVRvRmluZFByb3BlcnR5IiwiYmFja2dyb3VuZFNoYXBlIiwidW5pdEFyZWEiLCJtYXhQb3NzaWJsZVNjb3JlIiwiZ2FtZU92ZXJQZXJmZWN0U2NvcmUiLCJnYW1lT3Zlclplcm9TY29yZSIsImdhbWVPdmVySW1wZXJmZWN0U2NvcmUiLCJzaG93TGV2ZWxSZXN1bHRzTm9kZSIsImFzc2VydCIsInVzZXJCdWlsdFNwZWMiLCJhcmVhT2ZVc2VyQ3JlYXRlZFNoYXBlIiwicGVyaW1ldGVyIiwicGVyaW1ldGVyT2ZVc2VyQ3JlYXRlZFNoYXBlIiwicHJvcG9ydGlvbnMiLCJjb2xvcjEiLCJjb2xvcjIiLCJjb2xvcjFQcm9wb3J0aW9uIiwic2V0QnVpbGRTcGVjIiwic2V0Q29sb3JCYXNlZE9uQW5zd2VyQ29ycmVjdG5lc3MiLCJlcXVhbHMiLCJjZW50ZXJZIiwic2hhcGVCb2FyZE9yaWdpbmFsQm91bmRzIiwiY2VudGVyWCIsImxheW91dEJvdW5kcyIsIm1heFgiLCJzZXRWYWx1ZUVudGVyZWQiLCJhcmVhR3Vlc3MiLCJ1cGRhdGVVc2VyQW5zd2VyIiwic2hhcGVQbGFjZW1lbnRCb2FyZCIsImFyZWFBbmRQZXJpbWV0ZXJQcm9wZXJ0eSIsImFyZWEiLCJnZXRQcm9wb3J0aW9uT2ZDb2xvciIsImlzQW55U2hhcGVNb3ZpbmciLCJpIiwibW92YWJsZVNoYXBlcyIsImxlbmd0aCIsImFuaW1hdGluZ1Byb3BlcnR5IiwidXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsImRpc3Bvc2VDdXJyZW50Q2Fyb3VzZWwiLCJhY3RpdmVTaGFwZU5vZGVDcmVhdG9ycyIsImNhcm91c2VsIiwiZGlzcG9zZSIsImluY29ycmVjdEd1ZXNzZXNPbkN1cnJlbnRDaGFsbGVuZ2UiLCJjbGVhclNoYXBlUGxhY2VtZW50Qm9hcmQiLCJidWlsZFByb21wdFZCb3giLCJyZW1vdmVBbGxDaGlsZHJlbiIsImFkZENoaWxkIiwieW91ckdvYWxUaXRsZSIsImFyZWFHb2FsTm9kZSIsImZvcm1hdCIsImZvbnQiLCJtYXhXaWR0aCIsIndpZHRoIiwiYXJlYVByb21wdCIsInN0cmluZyIsImNvbG9yUHJvcG9ydGlvbnNQcm9tcHQiLCJsZWZ0Iiwic2NhbGUiLCJtYXhTaGFwZUJvYXJkVGV4dFdpZHRoIiwiYnVpbGRQcm9tcHRQYW5lbCIsInZpc2libGUiLCJvcGFjaXR5IiwiZGltZW5zaW9uc0ljb24iLCJzZXRHcmlkVmlzaWJsZSIsImdyaWRDb250cm9sVmlzaWJsZVByb3BlcnR5IiwidG9vbFNwZWMiLCJncmlkQ29udHJvbCIsImRpbWVuc2lvbnNDb250cm9sVmlzaWJsZVByb3BlcnR5IiwiZGltZW5zaW9uc0NvbnRyb2wiLCJzZXRDb2xvciIsImZpbGxDb2xvciIsImNvbG9yIiwiR1JFRU5JU0hfQ09MT1IiLCJmb3JFYWNoIiwidXNlclNoYXBlU3BlYyIsImNyZWF0b3JOb2RlT3B0aW9ucyIsImdyaWRTcGFjaW5nIiwiVU5JVF9TUVVBUkVfTEVOR1RIIiwic2hhcGVEcmFnQm91bmRzIiwibm9uTW92aW5nQW5jZXN0b3IiLCJjcmVhdGlvbkxpbWl0IiwiY3JlYXRlTm9kZSIsInNoYXBlIiwiYWRkVXNlckNyZWF0ZWRNb3ZhYmxlU2hhcGUiLCJiaW5kIiwib3JpZW50YXRpb24iLCJpdGVtc1BlclBhZ2UiLCJ0b3AiLCJib3R0b20iLCJmaWxsIiwiQ09OVFJPTF9QQU5FTF9CQUNLR1JPVU5EX0NPTE9SIiwiZ2FtZUNvbnRyb2xCdXR0b25zIiwiYnV0dG9uIiwic2V0Tm9kZVZpc2liaWxpdHkiLCJub2RlVG9TaG93IiwiaXNWaXNpYmxlIiwibm9kZXMiLCJub2RlIiwiY29udHJvbExheWVyIiwiZW5hYmxlZCIsImtleXBhZCIsInZhbHVlU3RyaW5nUHJvcGVydHkiLCJsZXZlbENvbXBsZXRlZE5vZGUiLCJsZXZlbFByb3BlcnR5IiwiY2hhbGxlbmdlc1BlclNldCIsInRpbWVyRW5hYmxlZFByb3BlcnR5IiwiZWxhcHNlZFRpbWVQcm9wZXJ0eSIsImJlc3RUaW1lcyIsIm5ld0Jlc3RUaW1lIiwiZ2FtZVN0YXRlUHJvcGVydHkiLCJyb290Tm9kZSIsInJlbW92ZUNoaWxkIiwiY2VudGVyIiwiY29uc3RydWN0b3IiLCJnYW1lTW9kZWwiLCJMQVlPVVRfQk9VTkRTIiwic2VsZiIsIm1vdmVUb0JhY2siLCJsZXZlbCIsImNsZWFyIiwic3RhcnRMZXZlbCIsImNyZWF0ZUljb24iLCJiZXN0U2NvcmVQcm9wZXJ0aWVzIiwibnVtU3RhcnNPbkJ1dHRvbnMiLCJwZXJmZWN0U2NvcmUiLCJudW1MZXZlbHMiLCJudW1iZXJPZkxldmVscyIsIm51bUJ1dHRvblJvd3MiLCJjb250cm9sc0luc2V0Iiwic2hhcGVCb2FyZCIsImJvdW5kcyIsImNvcHkiLCJyaWdodCIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsImxpc3RlbmVyIiwic2hhcGVSZWxlYXNlTW9kZSIsInJlbGVhc2VBbGxTaGFwZXMiLCJzaG93R3JpZE9uQm9hcmRQcm9wZXJ0eSIsIngiLCJjaGFsbGVuZ2VJbmRleFByb3BlcnR5IiwibGluayIsInRpbWVyRW5hYmxlZCIsInRpbWVWaXNpYmxlUHJvcGVydHkiLCJjb250ZW50IiwiaW50ZXJydXB0U3VidHJlZUlucHV0Iiwic2V0Q2hvb3NpbmdMZXZlbFN0YXRlIiwiYmFzZUNvbG9yIiwiY2hpbGRyZW4iLCJzcGFjaW5nIiwic3Ryb2tlIiwieE1hcmdpbiIsInlNYXJnaW4iLCJidXR0b25PcHRpb25zIiwiY29ybmVyUmFkaXVzIiwiY2hlY2tBbnN3ZXIiLCJuZXh0Q2hhbGxlbmdlIiwiZGlzcGxheUNvcnJlY3RBbnN3ZXIiLCJidXR0b25DZW50ZXJYIiwiYnV0dG9uQm90dG9tIiwidmFsdWVTdHJpbmciLCJmYWNlRGlhbWV0ZXIiLCJwb2ludHNBbGlnbm1lbnQiLCJwb2ludHNGb250IiwiYWRkSXRlbUFkZGVkTGlzdGVuZXIiLCJhZGRlZFNoYXBlIiwic2hhcGVOb2RlIiwidXNlckNvbnRyb2xsZWRMaXN0ZW5lciIsInVzZXJDb250cm9sbGVkIiwibW92ZVRvRnJvbnQiLCJhZGRJdGVtUmVtb3ZlZExpc3RlbmVyIiwicmVtb3ZhbExpc3RlbmVyIiwicmVtb3ZlZFNoYXBlIiwidW5saW5rIiwicmVtb3ZlSXRlbVJlbW92ZWRMaXN0ZW5lciIsImZyb20iLCJ0byIsInNldFZhbHVlIiwiZHVyYXRpb24iLCJlYXNpbmciLCJDVUJJQ19JTl9PVVQiLCJzdGFydCIsImFyZWFBbmRQZXJpbWV0ZXIiLCJpbnRlcnJ1cHRTdWJ0cmVlT25JbnZpc2libGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxnQkFBZ0IscUNBQXFDO0FBQzVELE9BQU9DLFdBQVcsb0NBQW9DO0FBQ3RELE9BQU9DLGlCQUFpQixnREFBZ0Q7QUFDeEUsT0FBT0Msa0JBQWtCLHNEQUFzRDtBQUMvRSxPQUFPQyx3QkFBd0Isb0RBQW9EO0FBQ25GLE9BQU9DLHdCQUF3QixvREFBb0Q7QUFDbkYsT0FBT0MscUJBQXFCLGlEQUFp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