// Copyright 2014-2021, University of Colorado Boulder
/**
 * Framework for a quiz style game where the user is presented with various 'challenges' which must be answered and for
 * which they get points.  This file defines the code that handles the general behavior for PhET's quiz-style games,
 * such as state transitions, timers, best scores, and such.  It works in conjunction with a sim-specific model that
 * handles behavior that is specific to this simulation's game, such as how the model changes when displaying correct
 * answer to the user.
 *
 * This separation of concerns is experimental, and this simulation (Area Builder) is the first one where it is being
 * tried.
 *
 * @author John Blanco
 */ import Property from '../../../../axon/js/Property.js';
import stepTimer from '../../../../axon/js/stepTimer.js';
import merge from '../../../../phet-core/js/merge.js';
import areaBuilder from '../../areaBuilder.js';
import GameState from './GameState.js';
let QuizGameModel = class QuizGameModel {
    // @private
    step(dt) {
        this.simSpecificModel.step(dt);
    }
    /**
   * reset this model
   * @public
   */ reset() {
        this.timerEnabledProperty.reset();
        this.levelProperty.reset();
        this.challengeIndexProperty.reset();
        this.currentChallengeProperty.reset();
        this.scoreProperty.reset();
        this.elapsedTimeProperty.reset();
        this.gameStateProperty.reset();
        this.bestScoreProperties.forEach((bestScoreProperty)=>{
            bestScoreProperty.reset();
        });
        this.bestTimes = [];
        _.times(this.numberOfLevels, ()=>{
            this.bestTimes.push(null);
        });
    }
    /**
   * starts new level
   * @param {number} level
   * @public
   */ startLevel(level) {
        this.levelProperty.set(level);
        this.scoreProperty.reset();
        this.challengeIndexProperty.set(0);
        this.incorrectGuessesOnCurrentChallenge = 0;
        this.restartGameTimer();
        // Create the list of challenges.
        this.challengeList = this.challengeFactory.generateChallengeSet(level, this.challengesPerSet);
        // Set up the model for the next challenge
        this.currentChallengeProperty.set(this.challengeList[this.challengeIndexProperty.get()]);
        // Let the sim-specific model know that a new level is being started in case it needs to do any initialization.
        this.simSpecificModel.startLevel();
        // Change to new game state.
        this.gameStateProperty.set(GameState.PRESENTING_INTERACTIVE_CHALLENGE);
        // Flag set to indicate new best time, cleared each time a level is started.
        this.newBestTime = false;
    }
    /**
   * @public
   */ setChoosingLevelState() {
        this.gameStateProperty.set(GameState.CHOOSING_LEVEL);
    }
    /**
   * @public
   */ getChallengeCurrentPointValue() {
        return Math.max(this.maxPointsPerChallenge - this.incorrectGuessesOnCurrentChallenge, 0);
    }
    /**
   * Check the user's proposed answer.
   * @public
   */ checkAnswer(answer) {
        this.handleProposedAnswer(this.simSpecificModel.checkAnswer(this.currentChallengeProperty.get()));
    }
    /**
   * @param answerIsCorrect
   * @private
   */ handleProposedAnswer(answerIsCorrect) {
        let pointsEarned = 0;
        if (answerIsCorrect) {
            // The user answered the challenge correctly.
            this.gameStateProperty.set(GameState.SHOWING_CORRECT_ANSWER_FEEDBACK);
            if (this.incorrectGuessesOnCurrentChallenge === 0) {
                // User got it right the first time.
                pointsEarned = this.maxPointsPerChallenge;
            } else {
                // User got it wrong at first, but got it right now.
                pointsEarned = Math.max(this.maxPointsPerChallenge - this.incorrectGuessesOnCurrentChallenge, 0);
            }
            this.scoreProperty.value += pointsEarned;
        } else {
            // The user got it wrong.
            this.incorrectGuessesOnCurrentChallenge++;
            if (this.incorrectGuessesOnCurrentChallenge < this.maxAttemptsPerChallenge) {
                this.gameStateProperty.set(GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_TRY_AGAIN);
            } else {
                this.gameStateProperty.set(GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_MOVE_ON);
            }
        }
    }
    // @private
    newGame() {
        this.stopGameTimer();
        this.gameStateProperty.set(GameState.CHOOSING_LEVEL);
        this.incorrectGuessesOnCurrentChallenge = 0;
    }
    /**
   * Move to the next challenge in the current challenge set.
   * @public
   */ nextChallenge() {
        const currentLevel = this.levelProperty.get();
        this.incorrectGuessesOnCurrentChallenge = 0;
        if (this.challengeIndexProperty.get() + 1 < this.challengeList.length) {
            // Move to the next challenge.
            this.challengeIndexProperty.value++;
            this.currentChallengeProperty.set(this.challengeList[this.challengeIndexProperty.get()]);
            this.gameStateProperty.set(GameState.PRESENTING_INTERACTIVE_CHALLENGE);
        } else {
            // All challenges completed for this level.  See if this is a new best time and, if so, record it.
            if (this.scoreProperty.get() === this.maxPossibleScore) {
                // Perfect game.  See if new best time.
                if (this.bestTimes[currentLevel] === null || this.elapsedTimeProperty.get() < this.bestTimes[currentLevel]) {
                    this.newBestTime = this.bestTimes[currentLevel] !== null; // Don't set this flag for the first 'best time', only when the time improves.
                    this.bestTimes[currentLevel] = this.elapsedTimeProperty.get();
                }
            }
            this.bestScoreProperties[currentLevel].value = this.scoreProperty.get();
            // Done with this game, show the results.
            this.gameStateProperty.set(GameState.SHOWING_LEVEL_RESULTS);
        }
    }
    /**
   * @public
   */ tryAgain() {
        this.simSpecificModel.tryAgain();
        this.gameStateProperty.set(GameState.PRESENTING_INTERACTIVE_CHALLENGE);
    }
    /**
   * @public
   */ displayCorrectAnswer() {
        // Set the challenge to display the correct answer.
        this.simSpecificModel.displayCorrectAnswer(this.currentChallengeProperty.get());
        // Update the game state.
        this.gameStateProperty.set(GameState.DISPLAYING_CORRECT_ANSWER);
    }
    // @private
    restartGameTimer() {
        if (this.gameTimerId !== null) {
            window.clearInterval(this.gameTimerId);
        }
        this.elapsedTimeProperty.set(0);
        this.gameTimerId = stepTimer.setInterval(()=>{
            this.elapsedTimeProperty.value += 1;
        }, 1000);
    }
    // @private
    stopGameTimer() {
        window.clearInterval(this.gameTimerId);
        this.gameTimerId = null;
    }
    /**
   * @param challengeFactory - Factory object that is used to create challenges, examine usage for details.
   * @param simSpecificModel - Model containing the elements of the game that are unique to this sim, used to delegate
   * delegate certain actions.  Look through code for usage details.
   * @param {Object} [options]
   */ constructor(challengeFactory, simSpecificModel, options){
        this.challengeFactory = challengeFactory; // @private
        this.simSpecificModel = simSpecificModel; // @public
        options = merge({
            numberOfLevels: 6,
            challengesPerSet: 6,
            maxPointsPerChallenge: 2,
            maxAttemptsPerChallenge: 2
        }, options);
        // @public - model properties
        this.timerEnabledProperty = new Property(false);
        this.levelProperty = new Property(0);
        this.challengeIndexProperty = new Property(0);
        this.currentChallengeProperty = new Property(null);
        this.scoreProperty = new Property(0);
        this.elapsedTimeProperty = new Property(0);
        this.gameStateProperty = new Property(GameState.CHOOSING_LEVEL); // Current state of the game, see GameState for valid values.
        // other public vars
        this.numberOfLevels = options.numberOfLevels; // @public
        this.challengesPerSet = options.challengesPerSet; // @public
        this.maxPointsPerChallenge = options.maxPointsPerChallenge; // @public
        this.maxPossibleScore = options.challengesPerSet * options.maxPointsPerChallenge; // @public
        this.maxAttemptsPerChallenge = options.maxAttemptsPerChallenge; // @private
        // @private Wall time at which current level was started.
        this.gameStartTime = 0;
        // Best times and scores.
        this.bestTimes = []; // @public
        this.bestScoreProperties = []; // @public
        _.times(options.numberOfLevels, ()=>{
            this.bestTimes.push(null);
            this.bestScoreProperties.push(new Property(0));
        });
        // Counter used to track number of incorrect answers.
        this.incorrectGuessesOnCurrentChallenge = 0; // @public
        // Current set of challenges, which collectively comprise a single level, on which the user is currently working.
        this.challengeList = null; // @private
        // Let the sim-specific model know when the challenge changes.
        this.currentChallengeProperty.lazyLink((challenge)=>{
            simSpecificModel.setChallenge(challenge);
        });
    }
};
areaBuilder.register('QuizGameModel', QuizGameModel);
export default QuizGameModel;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9nYW1lL21vZGVsL1F1aXpHYW1lTW9kZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRnJhbWV3b3JrIGZvciBhIHF1aXogc3R5bGUgZ2FtZSB3aGVyZSB0aGUgdXNlciBpcyBwcmVzZW50ZWQgd2l0aCB2YXJpb3VzICdjaGFsbGVuZ2VzJyB3aGljaCBtdXN0IGJlIGFuc3dlcmVkIGFuZCBmb3JcbiAqIHdoaWNoIHRoZXkgZ2V0IHBvaW50cy4gIFRoaXMgZmlsZSBkZWZpbmVzIHRoZSBjb2RlIHRoYXQgaGFuZGxlcyB0aGUgZ2VuZXJhbCBiZWhhdmlvciBmb3IgUGhFVCdzIHF1aXotc3R5bGUgZ2FtZXMsXG4gKiBzdWNoIGFzIHN0YXRlIHRyYW5zaXRpb25zLCB0aW1lcnMsIGJlc3Qgc2NvcmVzLCBhbmQgc3VjaC4gIEl0IHdvcmtzIGluIGNvbmp1bmN0aW9uIHdpdGggYSBzaW0tc3BlY2lmaWMgbW9kZWwgdGhhdFxuICogaGFuZGxlcyBiZWhhdmlvciB0aGF0IGlzIHNwZWNpZmljIHRvIHRoaXMgc2ltdWxhdGlvbidzIGdhbWUsIHN1Y2ggYXMgaG93IHRoZSBtb2RlbCBjaGFuZ2VzIHdoZW4gZGlzcGxheWluZyBjb3JyZWN0XG4gKiBhbnN3ZXIgdG8gdGhlIHVzZXIuXG4gKlxuICogVGhpcyBzZXBhcmF0aW9uIG9mIGNvbmNlcm5zIGlzIGV4cGVyaW1lbnRhbCwgYW5kIHRoaXMgc2ltdWxhdGlvbiAoQXJlYSBCdWlsZGVyKSBpcyB0aGUgZmlyc3Qgb25lIHdoZXJlIGl0IGlzIGJlaW5nXG4gKiB0cmllZC5cbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXG4gKi9cblxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IHN0ZXBUaW1lciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL3N0ZXBUaW1lci5qcyc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcbmltcG9ydCBhcmVhQnVpbGRlciBmcm9tICcuLi8uLi9hcmVhQnVpbGRlci5qcyc7XG5pbXBvcnQgR2FtZVN0YXRlIGZyb20gJy4vR2FtZVN0YXRlLmpzJztcblxuY2xhc3MgUXVpekdhbWVNb2RlbCB7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBjaGFsbGVuZ2VGYWN0b3J5IC0gRmFjdG9yeSBvYmplY3QgdGhhdCBpcyB1c2VkIHRvIGNyZWF0ZSBjaGFsbGVuZ2VzLCBleGFtaW5lIHVzYWdlIGZvciBkZXRhaWxzLlxuICAgKiBAcGFyYW0gc2ltU3BlY2lmaWNNb2RlbCAtIE1vZGVsIGNvbnRhaW5pbmcgdGhlIGVsZW1lbnRzIG9mIHRoZSBnYW1lIHRoYXQgYXJlIHVuaXF1ZSB0byB0aGlzIHNpbSwgdXNlZCB0byBkZWxlZ2F0ZVxuICAgKiBkZWxlZ2F0ZSBjZXJ0YWluIGFjdGlvbnMuICBMb29rIHRocm91Z2ggY29kZSBmb3IgdXNhZ2UgZGV0YWlscy5cbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKi9cbiAgY29uc3RydWN0b3IoIGNoYWxsZW5nZUZhY3RvcnksIHNpbVNwZWNpZmljTW9kZWwsIG9wdGlvbnMgKSB7XG4gICAgdGhpcy5jaGFsbGVuZ2VGYWN0b3J5ID0gY2hhbGxlbmdlRmFjdG9yeTsgLy8gQHByaXZhdGVcbiAgICB0aGlzLnNpbVNwZWNpZmljTW9kZWwgPSBzaW1TcGVjaWZpY01vZGVsOyAvLyBAcHVibGljXG5cbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcbiAgICAgIG51bWJlck9mTGV2ZWxzOiA2LFxuICAgICAgY2hhbGxlbmdlc1BlclNldDogNixcbiAgICAgIG1heFBvaW50c1BlckNoYWxsZW5nZTogMixcbiAgICAgIG1heEF0dGVtcHRzUGVyQ2hhbGxlbmdlOiAyXG4gICAgfSwgb3B0aW9ucyApO1xuXG4gICAgLy8gQHB1YmxpYyAtIG1vZGVsIHByb3BlcnRpZXNcbiAgICB0aGlzLnRpbWVyRW5hYmxlZFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBmYWxzZSApO1xuICAgIHRoaXMubGV2ZWxQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMCApO1xuICAgIHRoaXMuY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMCApO1xuICAgIHRoaXMuY3VycmVudENoYWxsZW5nZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBudWxsICk7XG4gICAgdGhpcy5zY29yZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAwICk7XG4gICAgdGhpcy5lbGFwc2VkVGltZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAwICk7XG4gICAgdGhpcy5nYW1lU3RhdGVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggR2FtZVN0YXRlLkNIT09TSU5HX0xFVkVMICk7IC8vIEN1cnJlbnQgc3RhdGUgb2YgdGhlIGdhbWUsIHNlZSBHYW1lU3RhdGUgZm9yIHZhbGlkIHZhbHVlcy5cblxuICAgIC8vIG90aGVyIHB1YmxpYyB2YXJzXG4gICAgdGhpcy5udW1iZXJPZkxldmVscyA9IG9wdGlvbnMubnVtYmVyT2ZMZXZlbHM7IC8vIEBwdWJsaWNcbiAgICB0aGlzLmNoYWxsZW5nZXNQZXJTZXQgPSBvcHRpb25zLmNoYWxsZW5nZXNQZXJTZXQ7IC8vIEBwdWJsaWNcbiAgICB0aGlzLm1heFBvaW50c1BlckNoYWxsZW5nZSA9IG9wdGlvbnMubWF4UG9pbnRzUGVyQ2hhbGxlbmdlOyAvLyBAcHVibGljXG4gICAgdGhpcy5tYXhQb3NzaWJsZVNjb3JlID0gb3B0aW9ucy5jaGFsbGVuZ2VzUGVyU2V0ICogb3B0aW9ucy5tYXhQb2ludHNQZXJDaGFsbGVuZ2U7IC8vIEBwdWJsaWNcbiAgICB0aGlzLm1heEF0dGVtcHRzUGVyQ2hhbGxlbmdlID0gb3B0aW9ucy5tYXhBdHRlbXB0c1BlckNoYWxsZW5nZTsgLy8gQHByaXZhdGVcblxuICAgIC8vIEBwcml2YXRlIFdhbGwgdGltZSBhdCB3aGljaCBjdXJyZW50IGxldmVsIHdhcyBzdGFydGVkLlxuICAgIHRoaXMuZ2FtZVN0YXJ0VGltZSA9IDA7XG5cbiAgICAvLyBCZXN0IHRpbWVzIGFuZCBzY29yZXMuXG4gICAgdGhpcy5iZXN0VGltZXMgPSBbXTsgLy8gQHB1YmxpY1xuICAgIHRoaXMuYmVzdFNjb3JlUHJvcGVydGllcyA9IFtdOyAvLyBAcHVibGljXG4gICAgXy50aW1lcyggb3B0aW9ucy5udW1iZXJPZkxldmVscywgKCkgPT4ge1xuICAgICAgdGhpcy5iZXN0VGltZXMucHVzaCggbnVsbCApO1xuICAgICAgdGhpcy5iZXN0U2NvcmVQcm9wZXJ0aWVzLnB1c2goIG5ldyBQcm9wZXJ0eSggMCApICk7XG4gICAgfSApO1xuXG4gICAgLy8gQ291bnRlciB1c2VkIHRvIHRyYWNrIG51bWJlciBvZiBpbmNvcnJlY3QgYW5zd2Vycy5cbiAgICB0aGlzLmluY29ycmVjdEd1ZXNzZXNPbkN1cnJlbnRDaGFsbGVuZ2UgPSAwOyAvLyBAcHVibGljXG5cbiAgICAvLyBDdXJyZW50IHNldCBvZiBjaGFsbGVuZ2VzLCB3aGljaCBjb2xsZWN0aXZlbHkgY29tcHJpc2UgYSBzaW5nbGUgbGV2ZWwsIG9uIHdoaWNoIHRoZSB1c2VyIGlzIGN1cnJlbnRseSB3b3JraW5nLlxuICAgIHRoaXMuY2hhbGxlbmdlTGlzdCA9IG51bGw7ICAvLyBAcHJpdmF0ZVxuXG4gICAgLy8gTGV0IHRoZSBzaW0tc3BlY2lmaWMgbW9kZWwga25vdyB3aGVuIHRoZSBjaGFsbGVuZ2UgY2hhbmdlcy5cbiAgICB0aGlzLmN1cnJlbnRDaGFsbGVuZ2VQcm9wZXJ0eS5sYXp5TGluayggY2hhbGxlbmdlID0+IHsgc2ltU3BlY2lmaWNNb2RlbC5zZXRDaGFsbGVuZ2UoIGNoYWxsZW5nZSApOyB9ICk7XG4gIH1cblxuICAvLyBAcHJpdmF0ZVxuICBzdGVwKCBkdCApIHtcbiAgICB0aGlzLnNpbVNwZWNpZmljTW9kZWwuc3RlcCggZHQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiByZXNldCB0aGlzIG1vZGVsXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIHJlc2V0KCkge1xuICAgIHRoaXMudGltZXJFbmFibGVkUHJvcGVydHkucmVzZXQoKTtcbiAgICB0aGlzLmxldmVsUHJvcGVydHkucmVzZXQoKTtcbiAgICB0aGlzLmNoYWxsZW5nZUluZGV4UHJvcGVydHkucmVzZXQoKTtcbiAgICB0aGlzLmN1cnJlbnRDaGFsbGVuZ2VQcm9wZXJ0eS5yZXNldCgpO1xuICAgIHRoaXMuc2NvcmVQcm9wZXJ0eS5yZXNldCgpO1xuICAgIHRoaXMuZWxhcHNlZFRpbWVQcm9wZXJ0eS5yZXNldCgpO1xuICAgIHRoaXMuZ2FtZVN0YXRlUHJvcGVydHkucmVzZXQoKTtcbiAgICB0aGlzLmJlc3RTY29yZVByb3BlcnRpZXMuZm9yRWFjaCggYmVzdFNjb3JlUHJvcGVydHkgPT4geyBiZXN0U2NvcmVQcm9wZXJ0eS5yZXNldCgpOyB9ICk7XG4gICAgdGhpcy5iZXN0VGltZXMgPSBbXTtcbiAgICBfLnRpbWVzKCB0aGlzLm51bWJlck9mTGV2ZWxzLCAoKSA9PiB7XG4gICAgICB0aGlzLmJlc3RUaW1lcy5wdXNoKCBudWxsICk7XG4gICAgfSApO1xuICB9XG5cbiAgLyoqXG4gICAqIHN0YXJ0cyBuZXcgbGV2ZWxcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxldmVsXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIHN0YXJ0TGV2ZWwoIGxldmVsICkge1xuICAgIHRoaXMubGV2ZWxQcm9wZXJ0eS5zZXQoIGxldmVsICk7XG4gICAgdGhpcy5zY29yZVByb3BlcnR5LnJlc2V0KCk7XG4gICAgdGhpcy5jaGFsbGVuZ2VJbmRleFByb3BlcnR5LnNldCggMCApO1xuICAgIHRoaXMuaW5jb3JyZWN0R3Vlc3Nlc09uQ3VycmVudENoYWxsZW5nZSA9IDA7XG4gICAgdGhpcy5yZXN0YXJ0R2FtZVRpbWVyKCk7XG5cbiAgICAvLyBDcmVhdGUgdGhlIGxpc3Qgb2YgY2hhbGxlbmdlcy5cbiAgICB0aGlzLmNoYWxsZW5nZUxpc3QgPSB0aGlzLmNoYWxsZW5nZUZhY3RvcnkuZ2VuZXJhdGVDaGFsbGVuZ2VTZXQoIGxldmVsLCB0aGlzLmNoYWxsZW5nZXNQZXJTZXQgKTtcblxuICAgIC8vIFNldCB1cCB0aGUgbW9kZWwgZm9yIHRoZSBuZXh0IGNoYWxsZW5nZVxuICAgIHRoaXMuY3VycmVudENoYWxsZW5nZVByb3BlcnR5LnNldCggdGhpcy5jaGFsbGVuZ2VMaXN0WyB0aGlzLmNoYWxsZW5nZUluZGV4UHJvcGVydHkuZ2V0KCkgXSApO1xuXG4gICAgLy8gTGV0IHRoZSBzaW0tc3BlY2lmaWMgbW9kZWwga25vdyB0aGF0IGEgbmV3IGxldmVsIGlzIGJlaW5nIHN0YXJ0ZWQgaW4gY2FzZSBpdCBuZWVkcyB0byBkbyBhbnkgaW5pdGlhbGl6YXRpb24uXG4gICAgdGhpcy5zaW1TcGVjaWZpY01vZGVsLnN0YXJ0TGV2ZWwoKTtcblxuICAgIC8vIENoYW5nZSB0byBuZXcgZ2FtZSBzdGF0ZS5cbiAgICB0aGlzLmdhbWVTdGF0ZVByb3BlcnR5LnNldCggR2FtZVN0YXRlLlBSRVNFTlRJTkdfSU5URVJBQ1RJVkVfQ0hBTExFTkdFICk7XG5cbiAgICAvLyBGbGFnIHNldCB0byBpbmRpY2F0ZSBuZXcgYmVzdCB0aW1lLCBjbGVhcmVkIGVhY2ggdGltZSBhIGxldmVsIGlzIHN0YXJ0ZWQuXG4gICAgdGhpcy5uZXdCZXN0VGltZSA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIHNldENob29zaW5nTGV2ZWxTdGF0ZSgpIHtcbiAgICB0aGlzLmdhbWVTdGF0ZVByb3BlcnR5LnNldCggR2FtZVN0YXRlLkNIT09TSU5HX0xFVkVMICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgZ2V0Q2hhbGxlbmdlQ3VycmVudFBvaW50VmFsdWUoKSB7XG4gICAgcmV0dXJuIE1hdGgubWF4KCB0aGlzLm1heFBvaW50c1BlckNoYWxsZW5nZSAtIHRoaXMuaW5jb3JyZWN0R3Vlc3Nlc09uQ3VycmVudENoYWxsZW5nZSwgMCApO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHRoZSB1c2VyJ3MgcHJvcG9zZWQgYW5zd2VyLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBjaGVja0Fuc3dlciggYW5zd2VyICkge1xuICAgIHRoaXMuaGFuZGxlUHJvcG9zZWRBbnN3ZXIoIHRoaXMuc2ltU3BlY2lmaWNNb2RlbC5jaGVja0Fuc3dlciggdGhpcy5jdXJyZW50Q2hhbGxlbmdlUHJvcGVydHkuZ2V0KCkgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBhbnN3ZXJJc0NvcnJlY3RcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGhhbmRsZVByb3Bvc2VkQW5zd2VyKCBhbnN3ZXJJc0NvcnJlY3QgKSB7XG4gICAgbGV0IHBvaW50c0Vhcm5lZCA9IDA7XG4gICAgaWYgKCBhbnN3ZXJJc0NvcnJlY3QgKSB7XG4gICAgICAvLyBUaGUgdXNlciBhbnN3ZXJlZCB0aGUgY2hhbGxlbmdlIGNvcnJlY3RseS5cbiAgICAgIHRoaXMuZ2FtZVN0YXRlUHJvcGVydHkuc2V0KCBHYW1lU3RhdGUuU0hPV0lOR19DT1JSRUNUX0FOU1dFUl9GRUVEQkFDSyApO1xuICAgICAgaWYgKCB0aGlzLmluY29ycmVjdEd1ZXNzZXNPbkN1cnJlbnRDaGFsbGVuZ2UgPT09IDAgKSB7XG4gICAgICAgIC8vIFVzZXIgZ290IGl0IHJpZ2h0IHRoZSBmaXJzdCB0aW1lLlxuICAgICAgICBwb2ludHNFYXJuZWQgPSB0aGlzLm1heFBvaW50c1BlckNoYWxsZW5nZTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyBVc2VyIGdvdCBpdCB3cm9uZyBhdCBmaXJzdCwgYnV0IGdvdCBpdCByaWdodCBub3cuXG4gICAgICAgIHBvaW50c0Vhcm5lZCA9IE1hdGgubWF4KCB0aGlzLm1heFBvaW50c1BlckNoYWxsZW5nZSAtIHRoaXMuaW5jb3JyZWN0R3Vlc3Nlc09uQ3VycmVudENoYWxsZW5nZSwgMCApO1xuICAgICAgfVxuICAgICAgdGhpcy5zY29yZVByb3BlcnR5LnZhbHVlICs9IHBvaW50c0Vhcm5lZDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBUaGUgdXNlciBnb3QgaXQgd3JvbmcuXG4gICAgICB0aGlzLmluY29ycmVjdEd1ZXNzZXNPbkN1cnJlbnRDaGFsbGVuZ2UrKztcbiAgICAgIGlmICggdGhpcy5pbmNvcnJlY3RHdWVzc2VzT25DdXJyZW50Q2hhbGxlbmdlIDwgdGhpcy5tYXhBdHRlbXB0c1BlckNoYWxsZW5nZSApIHtcbiAgICAgICAgdGhpcy5nYW1lU3RhdGVQcm9wZXJ0eS5zZXQoIEdhbWVTdGF0ZS5TSE9XSU5HX0lOQ09SUkVDVF9BTlNXRVJfRkVFREJBQ0tfVFJZX0FHQUlOICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5nYW1lU3RhdGVQcm9wZXJ0eS5zZXQoIEdhbWVTdGF0ZS5TSE9XSU5HX0lOQ09SUkVDVF9BTlNXRVJfRkVFREJBQ0tfTU9WRV9PTiApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIEBwcml2YXRlXG4gIG5ld0dhbWUoKSB7XG4gICAgdGhpcy5zdG9wR2FtZVRpbWVyKCk7XG4gICAgdGhpcy5nYW1lU3RhdGVQcm9wZXJ0eS5zZXQoIEdhbWVTdGF0ZS5DSE9PU0lOR19MRVZFTCApO1xuICAgIHRoaXMuaW5jb3JyZWN0R3Vlc3Nlc09uQ3VycmVudENoYWxsZW5nZSA9IDA7XG4gIH1cblxuICAvKipcbiAgICogTW92ZSB0byB0aGUgbmV4dCBjaGFsbGVuZ2UgaW4gdGhlIGN1cnJlbnQgY2hhbGxlbmdlIHNldC5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgbmV4dENoYWxsZW5nZSgpIHtcbiAgICBjb25zdCBjdXJyZW50TGV2ZWwgPSB0aGlzLmxldmVsUHJvcGVydHkuZ2V0KCk7XG4gICAgdGhpcy5pbmNvcnJlY3RHdWVzc2VzT25DdXJyZW50Q2hhbGxlbmdlID0gMDtcbiAgICBpZiAoIHRoaXMuY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eS5nZXQoKSArIDEgPCB0aGlzLmNoYWxsZW5nZUxpc3QubGVuZ3RoICkge1xuICAgICAgLy8gTW92ZSB0byB0aGUgbmV4dCBjaGFsbGVuZ2UuXG4gICAgICB0aGlzLmNoYWxsZW5nZUluZGV4UHJvcGVydHkudmFsdWUrKztcbiAgICAgIHRoaXMuY3VycmVudENoYWxsZW5nZVByb3BlcnR5LnNldCggdGhpcy5jaGFsbGVuZ2VMaXN0WyB0aGlzLmNoYWxsZW5nZUluZGV4UHJvcGVydHkuZ2V0KCkgXSApO1xuICAgICAgdGhpcy5nYW1lU3RhdGVQcm9wZXJ0eS5zZXQoIEdhbWVTdGF0ZS5QUkVTRU5USU5HX0lOVEVSQUNUSVZFX0NIQUxMRU5HRSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIEFsbCBjaGFsbGVuZ2VzIGNvbXBsZXRlZCBmb3IgdGhpcyBsZXZlbC4gIFNlZSBpZiB0aGlzIGlzIGEgbmV3IGJlc3QgdGltZSBhbmQsIGlmIHNvLCByZWNvcmQgaXQuXG4gICAgICBpZiAoIHRoaXMuc2NvcmVQcm9wZXJ0eS5nZXQoKSA9PT0gdGhpcy5tYXhQb3NzaWJsZVNjb3JlICkge1xuICAgICAgICAvLyBQZXJmZWN0IGdhbWUuICBTZWUgaWYgbmV3IGJlc3QgdGltZS5cbiAgICAgICAgaWYgKCB0aGlzLmJlc3RUaW1lc1sgY3VycmVudExldmVsIF0gPT09IG51bGwgfHwgdGhpcy5lbGFwc2VkVGltZVByb3BlcnR5LmdldCgpIDwgdGhpcy5iZXN0VGltZXNbIGN1cnJlbnRMZXZlbCBdICkge1xuICAgICAgICAgIHRoaXMubmV3QmVzdFRpbWUgPSB0aGlzLmJlc3RUaW1lc1sgY3VycmVudExldmVsIF0gIT09IG51bGw7IC8vIERvbid0IHNldCB0aGlzIGZsYWcgZm9yIHRoZSBmaXJzdCAnYmVzdCB0aW1lJywgb25seSB3aGVuIHRoZSB0aW1lIGltcHJvdmVzLlxuICAgICAgICAgIHRoaXMuYmVzdFRpbWVzWyBjdXJyZW50TGV2ZWwgXSA9IHRoaXMuZWxhcHNlZFRpbWVQcm9wZXJ0eS5nZXQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5iZXN0U2NvcmVQcm9wZXJ0aWVzWyBjdXJyZW50TGV2ZWwgXS52YWx1ZSA9IHRoaXMuc2NvcmVQcm9wZXJ0eS5nZXQoKTtcblxuICAgICAgLy8gRG9uZSB3aXRoIHRoaXMgZ2FtZSwgc2hvdyB0aGUgcmVzdWx0cy5cbiAgICAgIHRoaXMuZ2FtZVN0YXRlUHJvcGVydHkuc2V0KCBHYW1lU3RhdGUuU0hPV0lOR19MRVZFTF9SRVNVTFRTICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIHRyeUFnYWluKCkge1xuICAgIHRoaXMuc2ltU3BlY2lmaWNNb2RlbC50cnlBZ2FpbigpO1xuICAgIHRoaXMuZ2FtZVN0YXRlUHJvcGVydHkuc2V0KCBHYW1lU3RhdGUuUFJFU0VOVElOR19JTlRFUkFDVElWRV9DSEFMTEVOR0UgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqL1xuICBkaXNwbGF5Q29ycmVjdEFuc3dlcigpIHtcblxuICAgIC8vIFNldCB0aGUgY2hhbGxlbmdlIHRvIGRpc3BsYXkgdGhlIGNvcnJlY3QgYW5zd2VyLlxuICAgIHRoaXMuc2ltU3BlY2lmaWNNb2RlbC5kaXNwbGF5Q29ycmVjdEFuc3dlciggdGhpcy5jdXJyZW50Q2hhbGxlbmdlUHJvcGVydHkuZ2V0KCkgKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgZ2FtZSBzdGF0ZS5cbiAgICB0aGlzLmdhbWVTdGF0ZVByb3BlcnR5LnNldCggR2FtZVN0YXRlLkRJU1BMQVlJTkdfQ09SUkVDVF9BTlNXRVIgKTtcbiAgfVxuXG4gIC8vIEBwcml2YXRlXG4gIHJlc3RhcnRHYW1lVGltZXIoKSB7XG4gICAgaWYgKCB0aGlzLmdhbWVUaW1lcklkICE9PSBudWxsICkge1xuICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoIHRoaXMuZ2FtZVRpbWVySWQgKTtcbiAgICB9XG4gICAgdGhpcy5lbGFwc2VkVGltZVByb3BlcnR5LnNldCggMCApO1xuICAgIHRoaXMuZ2FtZVRpbWVySWQgPSBzdGVwVGltZXIuc2V0SW50ZXJ2YWwoICgpID0+IHsgdGhpcy5lbGFwc2VkVGltZVByb3BlcnR5LnZhbHVlICs9IDE7IH0sIDEwMDAgKTtcbiAgfVxuXG4gIC8vIEBwcml2YXRlXG4gIHN0b3BHYW1lVGltZXIoKSB7XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwoIHRoaXMuZ2FtZVRpbWVySWQgKTtcbiAgICB0aGlzLmdhbWVUaW1lcklkID0gbnVsbDtcbiAgfVxufVxuXG5hcmVhQnVpbGRlci5yZWdpc3RlciggJ1F1aXpHYW1lTW9kZWwnLCBRdWl6R2FtZU1vZGVsICk7XG5leHBvcnQgZGVmYXVsdCBRdWl6R2FtZU1vZGVsOyJdLCJuYW1lcyI6WyJQcm9wZXJ0eSIsInN0ZXBUaW1lciIsIm1lcmdlIiwiYXJlYUJ1aWxkZXIiLCJHYW1lU3RhdGUiLCJRdWl6R2FtZU1vZGVsIiwic3RlcCIsImR0Iiwic2ltU3BlY2lmaWNNb2RlbCIsInJlc2V0IiwidGltZXJFbmFibGVkUHJvcGVydHkiLCJsZXZlbFByb3BlcnR5IiwiY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eSIsImN1cnJlbnRDaGFsbGVuZ2VQcm9wZXJ0eSIsInNjb3JlUHJvcGVydHkiLCJlbGFwc2VkVGltZVByb3BlcnR5IiwiZ2FtZVN0YXRlUHJvcGVydHkiLCJiZXN0U2NvcmVQcm9wZXJ0aWVzIiwiZm9yRWFjaCIsImJlc3RTY29yZVByb3BlcnR5IiwiYmVzdFRpbWVzIiwiXyIsInRpbWVzIiwibnVtYmVyT2ZMZXZlbHMiLCJwdXNoIiwic3RhcnRMZXZlbCIsImxldmVsIiwic2V0IiwiaW5jb3JyZWN0R3Vlc3Nlc09uQ3VycmVudENoYWxsZW5nZSIsInJlc3RhcnRHYW1lVGltZXIiLCJjaGFsbGVuZ2VMaXN0IiwiY2hhbGxlbmdlRmFjdG9yeSIsImdlbmVyYXRlQ2hhbGxlbmdlU2V0IiwiY2hhbGxlbmdlc1BlclNldCIsImdldCIsIlBSRVNFTlRJTkdfSU5URVJBQ1RJVkVfQ0hBTExFTkdFIiwibmV3QmVzdFRpbWUiLCJzZXRDaG9vc2luZ0xldmVsU3RhdGUiLCJDSE9PU0lOR19MRVZFTCIsImdldENoYWxsZW5nZUN1cnJlbnRQb2ludFZhbHVlIiwiTWF0aCIsIm1heCIsIm1heFBvaW50c1BlckNoYWxsZW5nZSIsImNoZWNrQW5zd2VyIiwiYW5zd2VyIiwiaGFuZGxlUHJvcG9zZWRBbnN3ZXIiLCJhbnN3ZXJJc0NvcnJlY3QiLCJwb2ludHNFYXJuZWQiLCJTSE9XSU5HX0NPUlJFQ1RfQU5TV0VSX0ZFRURCQUNLIiwidmFsdWUiLCJtYXhBdHRlbXB0c1BlckNoYWxsZW5nZSIsIlNIT1dJTkdfSU5DT1JSRUNUX0FOU1dFUl9GRUVEQkFDS19UUllfQUdBSU4iLCJTSE9XSU5HX0lOQ09SUkVDVF9BTlNXRVJfRkVFREJBQ0tfTU9WRV9PTiIsIm5ld0dhbWUiLCJzdG9wR2FtZVRpbWVyIiwibmV4dENoYWxsZW5nZSIsImN1cnJlbnRMZXZlbCIsImxlbmd0aCIsIm1heFBvc3NpYmxlU2NvcmUiLCJTSE9XSU5HX0xFVkVMX1JFU1VMVFMiLCJ0cnlBZ2FpbiIsImRpc3BsYXlDb3JyZWN0QW5zd2VyIiwiRElTUExBWUlOR19DT1JSRUNUX0FOU1dFUiIsImdhbWVUaW1lcklkIiwid2luZG93IiwiY2xlYXJJbnRlcnZhbCIsInNldEludGVydmFsIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwiZ2FtZVN0YXJ0VGltZSIsImxhenlMaW5rIiwiY2hhbGxlbmdlIiwic2V0Q2hhbGxlbmdlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Q0FXQyxHQUVELE9BQU9BLGNBQWMsa0NBQWtDO0FBQ3ZELE9BQU9DLGVBQWUsbUNBQW1DO0FBQ3pELE9BQU9DLFdBQVcsb0NBQW9DO0FBQ3RELE9BQU9DLGlCQUFpQix1QkFBdUI7QUFDL0MsT0FBT0MsZUFBZSxpQkFBaUI7QUFFdkMsSUFBQSxBQUFNQyxnQkFBTixNQUFNQTtJQXdESixXQUFXO0lBQ1hDLEtBQU1D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