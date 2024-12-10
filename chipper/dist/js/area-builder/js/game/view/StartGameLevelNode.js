// Copyright 2014-2023, University of Colorado Boulder
/**
 * A node that pretty much fills the screen and that allows the user to select the game level that they wish to play.
 *
 * TODO https://github.com/phetsims/area-builder/issues/127 This was copied from Balancing Act, used for fast proto,
 * should be replaced with generalized version.
 *
 * @author John Blanco
 */ import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import TimerToggleButton from '../../../../scenery-phet/js/buttons/TimerToggleButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import LevelSelectionButton from '../../../../vegas/js/LevelSelectionButton.js';
import ScoreDisplayStars from '../../../../vegas/js/ScoreDisplayStars.js';
import VegasStrings from '../../../../vegas/js/VegasStrings.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../../common/AreaBuilderSharedConstants.js';
const chooseYourLevelString = VegasStrings.chooseYourLevel;
// constants
const CONTROL_BUTTON_TOUCH_AREA_DILATION = 4;
let StartGameLevelNode = class StartGameLevelNode extends Node {
    /**
   * @param {function} startLevelFunction - Function used to initiate a game
   * level, will be called with a zero-based index value.
   * @param {function} resetFunction - Function to reset game and scores.
   * @param {Property} timerEnabledProperty
   * @param {Array} iconNodes - Set of iconNodes to use on the buttons, sizes
   * should be the same, length of array must match number of levels.
   * @param {Array} scores - Current scores, used to decide which stars to
   * illuminate on the level start buttons, length must match number of levels.
   * @param {Object} [options] - See code below for options and default values.
   */ constructor(startLevelFunction, resetFunction, timerEnabledProperty, iconNodes, scores, options){
        super();
        options = merge({
            // defaults
            numLevels: 4,
            titleString: chooseYourLevelString,
            maxTitleWidth: 500,
            numStarsOnButtons: 5,
            perfectScore: 10,
            buttonBackgroundColor: '#A8BEFF',
            numButtonRows: 1,
            controlsInset: 12,
            size: AreaBuilderSharedConstants.LAYOUT_BOUNDS
        }, options);
        // Verify parameters
        if (iconNodes.length !== options.numLevels || scores.length !== options.numLevels) {
            throw new Error('Number of game levels doesn\'t match length of provided arrays');
        }
        // Title
        const title = new Text(options.titleString, {
            font: new PhetFont(30),
            maxWidth: options.maxTitleWidth
        });
        this.addChild(title);
        // Add the buttons
        function createLevelStartFunction(level) {
            return ()=>{
                startLevelFunction(level);
            };
        }
        const buttons = new Array(options.numLevels);
        for(let i = 0; i < options.numLevels; i++){
            buttons[i] = new LevelSelectionButton(iconNodes[i], scores[i], {
                listener: createLevelStartFunction(i),
                baseColor: options.buttonBackgroundColor,
                createScoreDisplay: (scoreProperty)=>new ScoreDisplayStars(scoreProperty, {
                        numberOfStars: options.numStarsOnButtons,
                        perfectScore: options.perfectScore
                    }),
                soundPlayerIndex: i
            });
            buttons[i].scale(0.80);
            this.addChild(buttons[i]);
        }
        // Sound and timer controls.
        const timerToggleButton = new TimerToggleButton(timerEnabledProperty, {
            touchAreaXDilation: CONTROL_BUTTON_TOUCH_AREA_DILATION,
            touchAreaYDilation: CONTROL_BUTTON_TOUCH_AREA_DILATION
        });
        this.addChild(timerToggleButton);
        // Reset button.
        const resetButton = new ResetAllButton({
            listener: resetFunction,
            radius: AreaBuilderSharedConstants.RESET_BUTTON_RADIUS
        });
        this.addChild(resetButton);
        // Layout
        const numColumns = options.numLevels / options.numButtonRows;
        const buttonSpacingX = buttons[0].width * 1.2; // Note: Assumes all buttons are the same size.
        const buttonSpacingY = buttons[0].height * 1.2; // Note: Assumes all buttons are the same size.
        const firstButtonOrigin = new Vector2(options.size.width / 2 - (numColumns - 1) * buttonSpacingX / 2, options.size.height * 0.5 - (options.numButtonRows - 1) * buttonSpacingY / 2);
        for(let row = 0; row < options.numButtonRows; row++){
            for(let col = 0; col < numColumns; col++){
                const buttonIndex = row * numColumns + col;
                buttons[buttonIndex].centerX = firstButtonOrigin.x + col * buttonSpacingX;
                buttons[buttonIndex].centerY = firstButtonOrigin.y + row * buttonSpacingY;
            }
        }
        resetButton.right = options.size.width - options.controlsInset;
        resetButton.bottom = options.size.height - options.controlsInset;
        title.centerX = options.size.width / 2;
        title.centerY = buttons[0].top / 2;
        timerToggleButton.left = options.controlsInset;
        timerToggleButton.bottom = options.size.height - options.controlsInset;
    }
};
areaBuilder.register('StartGameLevelNode', StartGameLevelNode);
// Inherit from Node.
export default StartGameLevelNode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9nYW1lL3ZpZXcvU3RhcnRHYW1lTGV2ZWxOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgbm9kZSB0aGF0IHByZXR0eSBtdWNoIGZpbGxzIHRoZSBzY3JlZW4gYW5kIHRoYXQgYWxsb3dzIHRoZSB1c2VyIHRvIHNlbGVjdCB0aGUgZ2FtZSBsZXZlbCB0aGF0IHRoZXkgd2lzaCB0byBwbGF5LlxuICpcbiAqIFRPRE8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2FyZWEtYnVpbGRlci9pc3N1ZXMvMTI3IFRoaXMgd2FzIGNvcGllZCBmcm9tIEJhbGFuY2luZyBBY3QsIHVzZWQgZm9yIGZhc3QgcHJvdG8sXG4gKiBzaG91bGQgYmUgcmVwbGFjZWQgd2l0aCBnZW5lcmFsaXplZCB2ZXJzaW9uLlxuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cbiAqL1xuXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcbmltcG9ydCBSZXNldEFsbEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9SZXNldEFsbEJ1dHRvbi5qcyc7XG5pbXBvcnQgVGltZXJUb2dnbGVCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvVGltZXJUb2dnbGVCdXR0b24uanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgeyBOb2RlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBMZXZlbFNlbGVjdGlvbkJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9MZXZlbFNlbGVjdGlvbkJ1dHRvbi5qcyc7XG5pbXBvcnQgU2NvcmVEaXNwbGF5U3RhcnMgZnJvbSAnLi4vLi4vLi4vLi4vdmVnYXMvanMvU2NvcmVEaXNwbGF5U3RhcnMuanMnO1xuaW1wb3J0IFZlZ2FzU3RyaW5ncyBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9WZWdhc1N0cmluZ3MuanMnO1xuaW1wb3J0IGFyZWFCdWlsZGVyIGZyb20gJy4uLy4uL2FyZWFCdWlsZGVyLmpzJztcbmltcG9ydCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuanMnO1xuXG5jb25zdCBjaG9vc2VZb3VyTGV2ZWxTdHJpbmcgPSBWZWdhc1N0cmluZ3MuY2hvb3NlWW91ckxldmVsO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IENPTlRST0xfQlVUVE9OX1RPVUNIX0FSRUFfRElMQVRJT04gPSA0O1xuXG5jbGFzcyBTdGFydEdhbWVMZXZlbE5vZGUgZXh0ZW5kcyBOb2RlIHtcblxuICAvKipcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gc3RhcnRMZXZlbEZ1bmN0aW9uIC0gRnVuY3Rpb24gdXNlZCB0byBpbml0aWF0ZSBhIGdhbWVcbiAgICogbGV2ZWwsIHdpbGwgYmUgY2FsbGVkIHdpdGggYSB6ZXJvLWJhc2VkIGluZGV4IHZhbHVlLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSByZXNldEZ1bmN0aW9uIC0gRnVuY3Rpb24gdG8gcmVzZXQgZ2FtZSBhbmQgc2NvcmVzLlxuICAgKiBAcGFyYW0ge1Byb3BlcnR5fSB0aW1lckVuYWJsZWRQcm9wZXJ0eVxuICAgKiBAcGFyYW0ge0FycmF5fSBpY29uTm9kZXMgLSBTZXQgb2YgaWNvbk5vZGVzIHRvIHVzZSBvbiB0aGUgYnV0dG9ucywgc2l6ZXNcbiAgICogc2hvdWxkIGJlIHRoZSBzYW1lLCBsZW5ndGggb2YgYXJyYXkgbXVzdCBtYXRjaCBudW1iZXIgb2YgbGV2ZWxzLlxuICAgKiBAcGFyYW0ge0FycmF5fSBzY29yZXMgLSBDdXJyZW50IHNjb3JlcywgdXNlZCB0byBkZWNpZGUgd2hpY2ggc3RhcnMgdG9cbiAgICogaWxsdW1pbmF0ZSBvbiB0aGUgbGV2ZWwgc3RhcnQgYnV0dG9ucywgbGVuZ3RoIG11c3QgbWF0Y2ggbnVtYmVyIG9mIGxldmVscy5cbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSAtIFNlZSBjb2RlIGJlbG93IGZvciBvcHRpb25zIGFuZCBkZWZhdWx0IHZhbHVlcy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKCBzdGFydExldmVsRnVuY3Rpb24sIHJlc2V0RnVuY3Rpb24sIHRpbWVyRW5hYmxlZFByb3BlcnR5LCBpY29uTm9kZXMsIHNjb3Jlcywgb3B0aW9ucyApIHtcblxuICAgIHN1cGVyKCk7XG5cbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcblxuICAgICAgLy8gZGVmYXVsdHNcbiAgICAgIG51bUxldmVsczogNCxcbiAgICAgIHRpdGxlU3RyaW5nOiBjaG9vc2VZb3VyTGV2ZWxTdHJpbmcsXG4gICAgICBtYXhUaXRsZVdpZHRoOiA1MDAsXG4gICAgICBudW1TdGFyc09uQnV0dG9uczogNSxcbiAgICAgIHBlcmZlY3RTY29yZTogMTAsXG4gICAgICBidXR0b25CYWNrZ3JvdW5kQ29sb3I6ICcjQThCRUZGJyxcbiAgICAgIG51bUJ1dHRvblJvd3M6IDEsIC8vIEZvciBsYXlvdXRcbiAgICAgIGNvbnRyb2xzSW5zZXQ6IDEyLFxuICAgICAgc2l6ZTogQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuTEFZT1VUX0JPVU5EU1xuICAgIH0sIG9wdGlvbnMgKTtcblxuICAgIC8vIFZlcmlmeSBwYXJhbWV0ZXJzXG4gICAgaWYgKCBpY29uTm9kZXMubGVuZ3RoICE9PSBvcHRpb25zLm51bUxldmVscyB8fCBzY29yZXMubGVuZ3RoICE9PSBvcHRpb25zLm51bUxldmVscyApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ051bWJlciBvZiBnYW1lIGxldmVscyBkb2VzblxcJ3QgbWF0Y2ggbGVuZ3RoIG9mIHByb3ZpZGVkIGFycmF5cycgKTtcbiAgICB9XG5cbiAgICAvLyBUaXRsZVxuICAgIGNvbnN0IHRpdGxlID0gbmV3IFRleHQoIG9wdGlvbnMudGl0bGVTdHJpbmcsIHsgZm9udDogbmV3IFBoZXRGb250KCAzMCApLCBtYXhXaWR0aDogb3B0aW9ucy5tYXhUaXRsZVdpZHRoIH0gKTtcbiAgICB0aGlzLmFkZENoaWxkKCB0aXRsZSApO1xuXG4gICAgLy8gQWRkIHRoZSBidXR0b25zXG4gICAgZnVuY3Rpb24gY3JlYXRlTGV2ZWxTdGFydEZ1bmN0aW9uKCBsZXZlbCApIHtcbiAgICAgIHJldHVybiAoKSA9PiB7IHN0YXJ0TGV2ZWxGdW5jdGlvbiggbGV2ZWwgKTsgfTtcbiAgICB9XG5cbiAgICBjb25zdCBidXR0b25zID0gbmV3IEFycmF5KCBvcHRpb25zLm51bUxldmVscyApO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG9wdGlvbnMubnVtTGV2ZWxzOyBpKysgKSB7XG4gICAgICBidXR0b25zWyBpIF0gPSBuZXcgTGV2ZWxTZWxlY3Rpb25CdXR0b24oXG4gICAgICAgIGljb25Ob2Rlc1sgaSBdLFxuICAgICAgICBzY29yZXNbIGkgXSxcbiAgICAgICAge1xuICAgICAgICAgIGxpc3RlbmVyOiBjcmVhdGVMZXZlbFN0YXJ0RnVuY3Rpb24oIGkgKSxcbiAgICAgICAgICBiYXNlQ29sb3I6IG9wdGlvbnMuYnV0dG9uQmFja2dyb3VuZENvbG9yLFxuICAgICAgICAgIGNyZWF0ZVNjb3JlRGlzcGxheTogc2NvcmVQcm9wZXJ0eSA9PiBuZXcgU2NvcmVEaXNwbGF5U3RhcnMoIHNjb3JlUHJvcGVydHksIHtcbiAgICAgICAgICAgIG51bWJlck9mU3RhcnM6IG9wdGlvbnMubnVtU3RhcnNPbkJ1dHRvbnMsXG4gICAgICAgICAgICBwZXJmZWN0U2NvcmU6IG9wdGlvbnMucGVyZmVjdFNjb3JlXG4gICAgICAgICAgfSApLFxuICAgICAgICAgIHNvdW5kUGxheWVySW5kZXg6IGlcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIGJ1dHRvbnNbIGkgXS5zY2FsZSggMC44MCApO1xuICAgICAgdGhpcy5hZGRDaGlsZCggYnV0dG9uc1sgaSBdICk7XG4gICAgfVxuXG4gICAgLy8gU291bmQgYW5kIHRpbWVyIGNvbnRyb2xzLlxuICAgIGNvbnN0IHRpbWVyVG9nZ2xlQnV0dG9uID0gbmV3IFRpbWVyVG9nZ2xlQnV0dG9uKCB0aW1lckVuYWJsZWRQcm9wZXJ0eSwge1xuICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiBDT05UUk9MX0JVVFRPTl9UT1VDSF9BUkVBX0RJTEFUSU9OLFxuICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiBDT05UUk9MX0JVVFRPTl9UT1VDSF9BUkVBX0RJTEFUSU9OXG4gICAgfSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIHRpbWVyVG9nZ2xlQnV0dG9uICk7XG5cbiAgICAvLyBSZXNldCBidXR0b24uXG4gICAgY29uc3QgcmVzZXRCdXR0b24gPSBuZXcgUmVzZXRBbGxCdXR0b24oIHtcbiAgICAgIGxpc3RlbmVyOiByZXNldEZ1bmN0aW9uLFxuICAgICAgcmFkaXVzOiBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5SRVNFVF9CVVRUT05fUkFESVVTXG4gICAgfSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIHJlc2V0QnV0dG9uICk7XG5cbiAgICAvLyBMYXlvdXRcbiAgICBjb25zdCBudW1Db2x1bW5zID0gb3B0aW9ucy5udW1MZXZlbHMgLyBvcHRpb25zLm51bUJ1dHRvblJvd3M7XG4gICAgY29uc3QgYnV0dG9uU3BhY2luZ1ggPSBidXR0b25zWyAwIF0ud2lkdGggKiAxLjI7IC8vIE5vdGU6IEFzc3VtZXMgYWxsIGJ1dHRvbnMgYXJlIHRoZSBzYW1lIHNpemUuXG4gICAgY29uc3QgYnV0dG9uU3BhY2luZ1kgPSBidXR0b25zWyAwIF0uaGVpZ2h0ICogMS4yOyAgLy8gTm90ZTogQXNzdW1lcyBhbGwgYnV0dG9ucyBhcmUgdGhlIHNhbWUgc2l6ZS5cbiAgICBjb25zdCBmaXJzdEJ1dHRvbk9yaWdpbiA9IG5ldyBWZWN0b3IyKCBvcHRpb25zLnNpemUud2lkdGggLyAyIC0gKCBudW1Db2x1bW5zIC0gMSApICogYnV0dG9uU3BhY2luZ1ggLyAyLFxuICAgICAgb3B0aW9ucy5zaXplLmhlaWdodCAqIDAuNSAtICggKCBvcHRpb25zLm51bUJ1dHRvblJvd3MgLSAxICkgKiBidXR0b25TcGFjaW5nWSApIC8gMiApO1xuICAgIGZvciAoIGxldCByb3cgPSAwOyByb3cgPCBvcHRpb25zLm51bUJ1dHRvblJvd3M7IHJvdysrICkge1xuICAgICAgZm9yICggbGV0IGNvbCA9IDA7IGNvbCA8IG51bUNvbHVtbnM7IGNvbCsrICkge1xuICAgICAgICBjb25zdCBidXR0b25JbmRleCA9IHJvdyAqIG51bUNvbHVtbnMgKyBjb2w7XG4gICAgICAgIGJ1dHRvbnNbIGJ1dHRvbkluZGV4IF0uY2VudGVyWCA9IGZpcnN0QnV0dG9uT3JpZ2luLnggKyBjb2wgKiBidXR0b25TcGFjaW5nWDtcbiAgICAgICAgYnV0dG9uc1sgYnV0dG9uSW5kZXggXS5jZW50ZXJZID0gZmlyc3RCdXR0b25PcmlnaW4ueSArIHJvdyAqIGJ1dHRvblNwYWNpbmdZO1xuICAgICAgfVxuICAgIH1cbiAgICByZXNldEJ1dHRvbi5yaWdodCA9IG9wdGlvbnMuc2l6ZS53aWR0aCAtIG9wdGlvbnMuY29udHJvbHNJbnNldDtcbiAgICByZXNldEJ1dHRvbi5ib3R0b20gPSBvcHRpb25zLnNpemUuaGVpZ2h0IC0gb3B0aW9ucy5jb250cm9sc0luc2V0O1xuICAgIHRpdGxlLmNlbnRlclggPSBvcHRpb25zLnNpemUud2lkdGggLyAyO1xuICAgIHRpdGxlLmNlbnRlclkgPSBidXR0b25zWyAwIF0udG9wIC8gMjtcbiAgICB0aW1lclRvZ2dsZUJ1dHRvbi5sZWZ0ID0gb3B0aW9ucy5jb250cm9sc0luc2V0O1xuICAgIHRpbWVyVG9nZ2xlQnV0dG9uLmJvdHRvbSA9IG9wdGlvbnMuc2l6ZS5oZWlnaHQgLSBvcHRpb25zLmNvbnRyb2xzSW5zZXQ7XG4gIH1cbn1cblxuYXJlYUJ1aWxkZXIucmVnaXN0ZXIoICdTdGFydEdhbWVMZXZlbE5vZGUnLCBTdGFydEdhbWVMZXZlbE5vZGUgKTtcblxuLy8gSW5oZXJpdCBmcm9tIE5vZGUuXG5leHBvcnQgZGVmYXVsdCBTdGFydEdhbWVMZXZlbE5vZGU7Il0sIm5hbWVzIjpbIlZlY3RvcjIiLCJtZXJnZSIsIlJlc2V0QWxsQnV0dG9uIiwiVGltZXJUb2dnbGVCdXR0b24iLCJQaGV0Rm9udCIsIk5vZGUiLCJUZXh0IiwiTGV2ZWxTZWxlY3Rpb25CdXR0b24iLCJTY29yZURpc3BsYXlTdGFycyIsIlZlZ2FzU3RyaW5ncyIsImFyZWFCdWlsZGVyIiwiQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMiLCJjaG9vc2VZb3VyTGV2ZWxTdHJpbmciLCJjaG9vc2VZb3VyTGV2ZWwiLCJDT05UUk9MX0JVVFRPTl9UT1VDSF9BUkVBX0RJTEFUSU9OIiwiU3RhcnRHYW1lTGV2ZWxOb2RlIiwiY29uc3RydWN0b3IiLCJzdGFydExldmVsRnVuY3Rpb24iLCJyZXNldEZ1bmN0aW9uIiwidGltZXJFbmFibGVkUHJvcGVydHkiLCJpY29uTm9kZXMiLCJzY29yZXMiLCJvcHRpb25zIiwibnVtTGV2ZWxzIiwidGl0bGVTdHJpbmciLCJtYXhUaXRsZVdpZHRoIiwibnVtU3RhcnNPbkJ1dHRvbnMiLCJwZXJmZWN0U2NvcmUiLCJidXR0b25CYWNrZ3JvdW5kQ29sb3IiLCJudW1CdXR0b25Sb3dzIiwiY29udHJvbHNJbnNldCIsInNpemUiLCJMQVlPVVRfQk9VTkRTIiwibGVuZ3RoIiwiRXJyb3IiLCJ0aXRsZSIsImZvbnQiLCJtYXhXaWR0aCIsImFkZENoaWxkIiwiY3JlYXRlTGV2ZWxTdGFydEZ1bmN0aW9uIiwibGV2ZWwiLCJidXR0b25zIiwiQXJyYXkiLCJpIiwibGlzdGVuZXIiLCJiYXNlQ29sb3IiLCJjcmVhdGVTY29yZURpc3BsYXkiLCJzY29yZVByb3BlcnR5IiwibnVtYmVyT2ZTdGFycyIsInNvdW5kUGxheWVySW5kZXgiLCJzY2FsZSIsInRpbWVyVG9nZ2xlQnV0dG9uIiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwicmVzZXRCdXR0b24iLCJyYWRpdXMiLCJSRVNFVF9CVVRUT05fUkFESVVTIiwibnVtQ29sdW1ucyIsImJ1dHRvblNwYWNpbmdYIiwid2lkdGgiLCJidXR0b25TcGFjaW5nWSIsImhlaWdodCIsImZpcnN0QnV0dG9uT3JpZ2luIiwicm93IiwiY29sIiwiYnV0dG9uSW5kZXgiLCJjZW50ZXJYIiwieCIsImNlbnRlclkiLCJ5IiwicmlnaHQiLCJib3R0b20iLCJ0b3AiLCJsZWZ0IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7OztDQU9DLEdBRUQsT0FBT0EsYUFBYSxnQ0FBZ0M7QUFDcEQsT0FBT0MsV0FBVyxvQ0FBb0M7QUFDdEQsT0FBT0Msb0JBQW9CLHdEQUF3RDtBQUNuRixPQUFPQyx1QkFBdUIsMkRBQTJEO0FBQ3pGLE9BQU9DLGNBQWMsMENBQTBDO0FBQy9ELFNBQVNDLElBQUksRUFBRUMsSUFBSSxRQUFRLG9DQUFvQztBQUMvRCxPQUFPQywwQkFBMEIsK0NBQStDO0FBQ2hGLE9BQU9DLHVCQUF1Qiw0Q0FBNEM7QUFDMUUsT0FBT0Msa0JBQWtCLHVDQUF1QztBQUNoRSxPQUFPQyxpQkFBaUIsdUJBQXVCO0FBQy9DLE9BQU9DLGdDQUFnQyw2Q0FBNkM7QUFFcEYsTUFBTUMsd0JBQXdCSCxhQUFhSSxlQUFlO0FBRTFELFlBQVk7QUFDWixNQUFNQyxxQ0FBcUM7QUFFM0MsSUFBQSxBQUFNQyxxQkFBTixNQUFNQSwyQkFBMkJWO0lBRS9COzs7Ozs7Ozs7O0dBVUMsR0FDRFcsWUFBYUMsa0JBQWtCLEVBQUVDLGFBQWEsRUFBRUMsb0JBQW9CLEVBQUVDLFNBQVMsRUFBRUMsTUFBTSxFQUFFQyxPQUFP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