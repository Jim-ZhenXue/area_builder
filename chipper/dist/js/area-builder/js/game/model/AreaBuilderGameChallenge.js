// Copyright 2014-2021, University of Colorado Boulder
/**
 * This type defines a challenge used in the Area Builder game.  It exists as a place to document the format of a
 * challenge and to verify that challenges are created correctly.
 *
 * @author John Blanco
 */ import areaBuilder from '../../areaBuilder.js';
import PerimeterShape from '../../common/model/PerimeterShape.js';
import BuildSpec from './BuildSpec.js';
let AreaBuilderGameChallenge = class AreaBuilderGameChallenge {
    /**
   * @param areaToBuild
   * @param userShapes
   * @param exampleSolution
   * @returns {AreaBuilderGameChallenge}
   * @public
   */ static createBuildAreaChallenge(areaToBuild, userShapes, exampleSolution) {
        return new AreaBuilderGameChallenge(// toolSpec
        {
            gridControl: true,
            dimensionsControl: true,
            decompositionToolControl: true
        }, // userShapes
        userShapes, // buildSpec
        BuildSpec.areaOnly(areaToBuild), // backgroundShape
        null, // checkSpec
        'areaConstructed', // exampleBuildItSolution
        exampleSolution);
    }
    /**
   * @param areaToBuild
   * @param color1
   * @param color2
   * @param color1Fraction
   * @param userShapes
   * @param exampleSolution
   * @returns {AreaBuilderGameChallenge}
   * @public
   */ static createTwoToneBuildAreaChallenge(areaToBuild, color1, color2, color1Fraction, userShapes, exampleSolution) {
        return new AreaBuilderGameChallenge(// toolSpec
        {
            gridControl: true,
            dimensionsControl: true,
            decompositionToolControl: true
        }, // userShapes
        userShapes, // buildSpec
        BuildSpec.areaAndProportions(areaToBuild, color1, color2, color1Fraction), // backgroundShape
        null, // checkSpec
        'areaAndProportionConstructed', // exampleBuildItSolution
        exampleSolution);
    }
    /**
   * @param areaToBuild
   * @param perimeterToBuild
   * @param color1
   * @param color2
   * @param color1Fraction
   * @param userShapes
   * @param exampleSolution
   * @returns {AreaBuilderGameChallenge}
   * @public
   */ static createTwoToneBuildAreaAndPerimeterChallenge(areaToBuild, perimeterToBuild, color1, color2, color1Fraction, userShapes, exampleSolution) {
        return new AreaBuilderGameChallenge(// toolSpec
        {
            gridControl: true,
            dimensionsControl: true,
            decompositionToolControl: true
        }, // userShapes
        userShapes, // buildSpec
        BuildSpec.areaPerimeterAndProportions(areaToBuild, perimeterToBuild, color1, color2, color1Fraction), // backgroundShape
        null, // checkSpec
        'areaPerimeterAndProportionConstructed', // exampleBuildItSolution
        exampleSolution);
    }
    /**
   * @param areaToBuild
   * @param perimeterToBuild
   * @param userShapes
   * @param exampleSolution
   * @returns {AreaBuilderGameChallenge}
   * @public
   */ static createBuildAreaAndPerimeterChallenge(areaToBuild, perimeterToBuild, userShapes, exampleSolution) {
        return new AreaBuilderGameChallenge(// toolSpec
        {
            gridControl: true,
            dimensionsControl: true,
            decompositionToolControl: true
        }, // userShapes
        userShapes, // buildSpec
        BuildSpec.areaAndPerimeter(areaToBuild, perimeterToBuild), // backgroundShape
        null, // checkSpec
        'areaAndPerimeterConstructed', // exampleBuildItSolution
        exampleSolution);
    }
    /**
   * @param areaShape
   * @param userShapes
   * @returns {AreaBuilderGameChallenge}
   * @public
   */ static createFindAreaChallenge(areaShape, userShapes) {
        return new AreaBuilderGameChallenge(// toolSpec
        {
            gridControl: true,
            dimensionsControl: true,
            decompositionToolControl: true
        }, // userShapes
        userShapes, // buildSpec
        null, // backgroundShape
        areaShape, // checkSpec
        'areaEntered', // exampleBuildItSolution
        null);
    }
    /**
   * @param {Object} toolSpec An object that specifies which tools are available to the user.  It should have three
   * boolean properties - 'gridControl', 'dimensionsControl', and 'decompositionToolControl' - that indicate whether
   * the user is allowed to control these things for this challenge.
   * @param {Array.<Object>} userShapes An array of shape specification that describe the shapes that can be created and
   * manipulated by the user for this challenge.  Each shape specification is an object with a 'shape' field and a
   * 'color' field.  This value can be null to signify no user shapes are present for the challenge.
   * @param {BuildSpec} buildSpec Object that specifies what the user should build, see BuildSpec.js file for details.
   * @param {PerimeterShape} backgroundShape Shape that should appear on the board, null for challenges that don't
   * require such a shape.
   * @param {string} checkSpec Specifies what should be checked when the user pressed the 'Check' button.  Valid values
   * are 'areaEntered', 'areaConstructed', 'areaAndPerimeterConstructed', 'areaAndProportionConstructed',
   * 'areaPerimeterAndProportionConstructed'.
   * @param {Array.<Object>} exampleBuildItSolution An example solution for a build problem.  It consists of a list of
   * cell positions for unit squares and a color, e.g. { cellColumn: x, cellRow: y, color: 'blue' }.  This should be
   * null for challenges where no example solution needs to be shown.
   */ constructor(toolSpec, userShapes, buildSpec, backgroundShape, checkSpec, exampleBuildItSolution){
        // Verification
        assert && assert(buildSpec instanceof BuildSpec || buildSpec === null);
        assert && assert(backgroundShape instanceof PerimeterShape || backgroundShape === null);
        // Fields, all public.
        this.toolSpec = toolSpec;
        this.userShapes = userShapes;
        this.buildSpec = buildSpec;
        this.backgroundShape = backgroundShape;
        this.checkSpec = checkSpec;
        this.exampleBuildItSolution = exampleBuildItSolution;
    }
};
areaBuilder.register('AreaBuilderGameChallenge', AreaBuilderGameChallenge);
export default AreaBuilderGameChallenge;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9nYW1lL21vZGVsL0FyZWFCdWlsZGVyR2FtZUNoYWxsZW5nZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBUaGlzIHR5cGUgZGVmaW5lcyBhIGNoYWxsZW5nZSB1c2VkIGluIHRoZSBBcmVhIEJ1aWxkZXIgZ2FtZS4gIEl0IGV4aXN0cyBhcyBhIHBsYWNlIHRvIGRvY3VtZW50IHRoZSBmb3JtYXQgb2YgYVxuICogY2hhbGxlbmdlIGFuZCB0byB2ZXJpZnkgdGhhdCBjaGFsbGVuZ2VzIGFyZSBjcmVhdGVkIGNvcnJlY3RseS5cbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXG4gKi9cblxuaW1wb3J0IGFyZWFCdWlsZGVyIGZyb20gJy4uLy4uL2FyZWFCdWlsZGVyLmpzJztcbmltcG9ydCBQZXJpbWV0ZXJTaGFwZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvUGVyaW1ldGVyU2hhcGUuanMnO1xuaW1wb3J0IEJ1aWxkU3BlYyBmcm9tICcuL0J1aWxkU3BlYy5qcyc7XG5cbmNsYXNzIEFyZWFCdWlsZGVyR2FtZUNoYWxsZW5nZSB7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB0b29sU3BlYyBBbiBvYmplY3QgdGhhdCBzcGVjaWZpZXMgd2hpY2ggdG9vbHMgYXJlIGF2YWlsYWJsZSB0byB0aGUgdXNlci4gIEl0IHNob3VsZCBoYXZlIHRocmVlXG4gICAqIGJvb2xlYW4gcHJvcGVydGllcyAtICdncmlkQ29udHJvbCcsICdkaW1lbnNpb25zQ29udHJvbCcsIGFuZCAnZGVjb21wb3NpdGlvblRvb2xDb250cm9sJyAtIHRoYXQgaW5kaWNhdGUgd2hldGhlclxuICAgKiB0aGUgdXNlciBpcyBhbGxvd2VkIHRvIGNvbnRyb2wgdGhlc2UgdGhpbmdzIGZvciB0aGlzIGNoYWxsZW5nZS5cbiAgICogQHBhcmFtIHtBcnJheS48T2JqZWN0Pn0gdXNlclNoYXBlcyBBbiBhcnJheSBvZiBzaGFwZSBzcGVjaWZpY2F0aW9uIHRoYXQgZGVzY3JpYmUgdGhlIHNoYXBlcyB0aGF0IGNhbiBiZSBjcmVhdGVkIGFuZFxuICAgKiBtYW5pcHVsYXRlZCBieSB0aGUgdXNlciBmb3IgdGhpcyBjaGFsbGVuZ2UuICBFYWNoIHNoYXBlIHNwZWNpZmljYXRpb24gaXMgYW4gb2JqZWN0IHdpdGggYSAnc2hhcGUnIGZpZWxkIGFuZCBhXG4gICAqICdjb2xvcicgZmllbGQuICBUaGlzIHZhbHVlIGNhbiBiZSBudWxsIHRvIHNpZ25pZnkgbm8gdXNlciBzaGFwZXMgYXJlIHByZXNlbnQgZm9yIHRoZSBjaGFsbGVuZ2UuXG4gICAqIEBwYXJhbSB7QnVpbGRTcGVjfSBidWlsZFNwZWMgT2JqZWN0IHRoYXQgc3BlY2lmaWVzIHdoYXQgdGhlIHVzZXIgc2hvdWxkIGJ1aWxkLCBzZWUgQnVpbGRTcGVjLmpzIGZpbGUgZm9yIGRldGFpbHMuXG4gICAqIEBwYXJhbSB7UGVyaW1ldGVyU2hhcGV9IGJhY2tncm91bmRTaGFwZSBTaGFwZSB0aGF0IHNob3VsZCBhcHBlYXIgb24gdGhlIGJvYXJkLCBudWxsIGZvciBjaGFsbGVuZ2VzIHRoYXQgZG9uJ3RcbiAgICogcmVxdWlyZSBzdWNoIGEgc2hhcGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjaGVja1NwZWMgU3BlY2lmaWVzIHdoYXQgc2hvdWxkIGJlIGNoZWNrZWQgd2hlbiB0aGUgdXNlciBwcmVzc2VkIHRoZSAnQ2hlY2snIGJ1dHRvbi4gIFZhbGlkIHZhbHVlc1xuICAgKiBhcmUgJ2FyZWFFbnRlcmVkJywgJ2FyZWFDb25zdHJ1Y3RlZCcsICdhcmVhQW5kUGVyaW1ldGVyQ29uc3RydWN0ZWQnLCAnYXJlYUFuZFByb3BvcnRpb25Db25zdHJ1Y3RlZCcsXG4gICAqICdhcmVhUGVyaW1ldGVyQW5kUHJvcG9ydGlvbkNvbnN0cnVjdGVkJy5cbiAgICogQHBhcmFtIHtBcnJheS48T2JqZWN0Pn0gZXhhbXBsZUJ1aWxkSXRTb2x1dGlvbiBBbiBleGFtcGxlIHNvbHV0aW9uIGZvciBhIGJ1aWxkIHByb2JsZW0uICBJdCBjb25zaXN0cyBvZiBhIGxpc3Qgb2ZcbiAgICogY2VsbCBwb3NpdGlvbnMgZm9yIHVuaXQgc3F1YXJlcyBhbmQgYSBjb2xvciwgZS5nLiB7IGNlbGxDb2x1bW46IHgsIGNlbGxSb3c6IHksIGNvbG9yOiAnYmx1ZScgfS4gIFRoaXMgc2hvdWxkIGJlXG4gICAqIG51bGwgZm9yIGNoYWxsZW5nZXMgd2hlcmUgbm8gZXhhbXBsZSBzb2x1dGlvbiBuZWVkcyB0byBiZSBzaG93bi5cbiAgICovXG4gIGNvbnN0cnVjdG9yKCB0b29sU3BlYywgdXNlclNoYXBlcywgYnVpbGRTcGVjLCBiYWNrZ3JvdW5kU2hhcGUsIGNoZWNrU3BlYywgZXhhbXBsZUJ1aWxkSXRTb2x1dGlvbiApIHtcbiAgICAvLyBWZXJpZmljYXRpb25cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBidWlsZFNwZWMgaW5zdGFuY2VvZiBCdWlsZFNwZWMgfHwgYnVpbGRTcGVjID09PSBudWxsICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYmFja2dyb3VuZFNoYXBlIGluc3RhbmNlb2YgUGVyaW1ldGVyU2hhcGUgfHwgYmFja2dyb3VuZFNoYXBlID09PSBudWxsICk7XG5cbiAgICAvLyBGaWVsZHMsIGFsbCBwdWJsaWMuXG4gICAgdGhpcy50b29sU3BlYyA9IHRvb2xTcGVjO1xuICAgIHRoaXMudXNlclNoYXBlcyA9IHVzZXJTaGFwZXM7XG4gICAgdGhpcy5idWlsZFNwZWMgPSBidWlsZFNwZWM7XG4gICAgdGhpcy5iYWNrZ3JvdW5kU2hhcGUgPSBiYWNrZ3JvdW5kU2hhcGU7XG4gICAgdGhpcy5jaGVja1NwZWMgPSBjaGVja1NwZWM7XG4gICAgdGhpcy5leGFtcGxlQnVpbGRJdFNvbHV0aW9uID0gZXhhbXBsZUJ1aWxkSXRTb2x1dGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gYXJlYVRvQnVpbGRcbiAgICogQHBhcmFtIHVzZXJTaGFwZXNcbiAgICogQHBhcmFtIGV4YW1wbGVTb2x1dGlvblxuICAgKiBAcmV0dXJucyB7QXJlYUJ1aWxkZXJHYW1lQ2hhbGxlbmdlfVxuICAgKiBAcHVibGljXG4gICAqL1xuICBzdGF0aWMgY3JlYXRlQnVpbGRBcmVhQ2hhbGxlbmdlKCBhcmVhVG9CdWlsZCwgdXNlclNoYXBlcywgZXhhbXBsZVNvbHV0aW9uICkge1xuICAgIHJldHVybiBuZXcgQXJlYUJ1aWxkZXJHYW1lQ2hhbGxlbmdlKFxuICAgICAgLy8gdG9vbFNwZWNcbiAgICAgIHtcbiAgICAgICAgZ3JpZENvbnRyb2w6IHRydWUsXG4gICAgICAgIGRpbWVuc2lvbnNDb250cm9sOiB0cnVlLFxuICAgICAgICBkZWNvbXBvc2l0aW9uVG9vbENvbnRyb2w6IHRydWVcbiAgICAgIH0sXG5cbiAgICAgIC8vIHVzZXJTaGFwZXNcbiAgICAgIHVzZXJTaGFwZXMsXG5cbiAgICAgIC8vIGJ1aWxkU3BlY1xuICAgICAgQnVpbGRTcGVjLmFyZWFPbmx5KCBhcmVhVG9CdWlsZCApLFxuXG4gICAgICAvLyBiYWNrZ3JvdW5kU2hhcGVcbiAgICAgIG51bGwsXG5cbiAgICAgIC8vIGNoZWNrU3BlY1xuICAgICAgJ2FyZWFDb25zdHJ1Y3RlZCcsXG5cbiAgICAgIC8vIGV4YW1wbGVCdWlsZEl0U29sdXRpb25cbiAgICAgIGV4YW1wbGVTb2x1dGlvblxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIGFyZWFUb0J1aWxkXG4gICAqIEBwYXJhbSBjb2xvcjFcbiAgICogQHBhcmFtIGNvbG9yMlxuICAgKiBAcGFyYW0gY29sb3IxRnJhY3Rpb25cbiAgICogQHBhcmFtIHVzZXJTaGFwZXNcbiAgICogQHBhcmFtIGV4YW1wbGVTb2x1dGlvblxuICAgKiBAcmV0dXJucyB7QXJlYUJ1aWxkZXJHYW1lQ2hhbGxlbmdlfVxuICAgKiBAcHVibGljXG4gICAqL1xuICBzdGF0aWMgY3JlYXRlVHdvVG9uZUJ1aWxkQXJlYUNoYWxsZW5nZSggYXJlYVRvQnVpbGQsIGNvbG9yMSwgY29sb3IyLCBjb2xvcjFGcmFjdGlvbiwgdXNlclNoYXBlcywgZXhhbXBsZVNvbHV0aW9uICkge1xuICAgIHJldHVybiBuZXcgQXJlYUJ1aWxkZXJHYW1lQ2hhbGxlbmdlKFxuICAgICAgLy8gdG9vbFNwZWNcbiAgICAgIHtcbiAgICAgICAgZ3JpZENvbnRyb2w6IHRydWUsXG4gICAgICAgIGRpbWVuc2lvbnNDb250cm9sOiB0cnVlLFxuICAgICAgICBkZWNvbXBvc2l0aW9uVG9vbENvbnRyb2w6IHRydWVcbiAgICAgIH0sXG5cbiAgICAgIC8vIHVzZXJTaGFwZXNcbiAgICAgIHVzZXJTaGFwZXMsXG5cbiAgICAgIC8vIGJ1aWxkU3BlY1xuICAgICAgQnVpbGRTcGVjLmFyZWFBbmRQcm9wb3J0aW9ucyggYXJlYVRvQnVpbGQsIGNvbG9yMSwgY29sb3IyLCBjb2xvcjFGcmFjdGlvbiApLFxuXG4gICAgICAvLyBiYWNrZ3JvdW5kU2hhcGVcbiAgICAgIG51bGwsXG5cbiAgICAgIC8vIGNoZWNrU3BlY1xuICAgICAgJ2FyZWFBbmRQcm9wb3J0aW9uQ29uc3RydWN0ZWQnLFxuXG4gICAgICAvLyBleGFtcGxlQnVpbGRJdFNvbHV0aW9uXG4gICAgICBleGFtcGxlU29sdXRpb25cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBhcmVhVG9CdWlsZFxuICAgKiBAcGFyYW0gcGVyaW1ldGVyVG9CdWlsZFxuICAgKiBAcGFyYW0gY29sb3IxXG4gICAqIEBwYXJhbSBjb2xvcjJcbiAgICogQHBhcmFtIGNvbG9yMUZyYWN0aW9uXG4gICAqIEBwYXJhbSB1c2VyU2hhcGVzXG4gICAqIEBwYXJhbSBleGFtcGxlU29sdXRpb25cbiAgICogQHJldHVybnMge0FyZWFCdWlsZGVyR2FtZUNoYWxsZW5nZX1cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgc3RhdGljIGNyZWF0ZVR3b1RvbmVCdWlsZEFyZWFBbmRQZXJpbWV0ZXJDaGFsbGVuZ2UoIGFyZWFUb0J1aWxkLCBwZXJpbWV0ZXJUb0J1aWxkLCBjb2xvcjEsIGNvbG9yMiwgY29sb3IxRnJhY3Rpb24sIHVzZXJTaGFwZXMsIGV4YW1wbGVTb2x1dGlvbiApIHtcbiAgICByZXR1cm4gbmV3IEFyZWFCdWlsZGVyR2FtZUNoYWxsZW5nZShcbiAgICAgIC8vIHRvb2xTcGVjXG4gICAgICB7XG4gICAgICAgIGdyaWRDb250cm9sOiB0cnVlLFxuICAgICAgICBkaW1lbnNpb25zQ29udHJvbDogdHJ1ZSxcbiAgICAgICAgZGVjb21wb3NpdGlvblRvb2xDb250cm9sOiB0cnVlXG4gICAgICB9LFxuXG4gICAgICAvLyB1c2VyU2hhcGVzXG4gICAgICB1c2VyU2hhcGVzLFxuXG4gICAgICAvLyBidWlsZFNwZWNcbiAgICAgIEJ1aWxkU3BlYy5hcmVhUGVyaW1ldGVyQW5kUHJvcG9ydGlvbnMoIGFyZWFUb0J1aWxkLCBwZXJpbWV0ZXJUb0J1aWxkLCBjb2xvcjEsIGNvbG9yMiwgY29sb3IxRnJhY3Rpb24gKSxcblxuICAgICAgLy8gYmFja2dyb3VuZFNoYXBlXG4gICAgICBudWxsLFxuXG4gICAgICAvLyBjaGVja1NwZWNcbiAgICAgICdhcmVhUGVyaW1ldGVyQW5kUHJvcG9ydGlvbkNvbnN0cnVjdGVkJyxcblxuICAgICAgLy8gZXhhbXBsZUJ1aWxkSXRTb2x1dGlvblxuICAgICAgZXhhbXBsZVNvbHV0aW9uXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gYXJlYVRvQnVpbGRcbiAgICogQHBhcmFtIHBlcmltZXRlclRvQnVpbGRcbiAgICogQHBhcmFtIHVzZXJTaGFwZXNcbiAgICogQHBhcmFtIGV4YW1wbGVTb2x1dGlvblxuICAgKiBAcmV0dXJucyB7QXJlYUJ1aWxkZXJHYW1lQ2hhbGxlbmdlfVxuICAgKiBAcHVibGljXG4gICAqL1xuICBzdGF0aWMgY3JlYXRlQnVpbGRBcmVhQW5kUGVyaW1ldGVyQ2hhbGxlbmdlKCBhcmVhVG9CdWlsZCwgcGVyaW1ldGVyVG9CdWlsZCwgdXNlclNoYXBlcywgZXhhbXBsZVNvbHV0aW9uICkge1xuICAgIHJldHVybiBuZXcgQXJlYUJ1aWxkZXJHYW1lQ2hhbGxlbmdlKFxuICAgICAgLy8gdG9vbFNwZWNcbiAgICAgIHtcbiAgICAgICAgZ3JpZENvbnRyb2w6IHRydWUsXG4gICAgICAgIGRpbWVuc2lvbnNDb250cm9sOiB0cnVlLFxuICAgICAgICBkZWNvbXBvc2l0aW9uVG9vbENvbnRyb2w6IHRydWVcbiAgICAgIH0sXG5cbiAgICAgIC8vIHVzZXJTaGFwZXNcbiAgICAgIHVzZXJTaGFwZXMsXG5cbiAgICAgIC8vIGJ1aWxkU3BlY1xuICAgICAgQnVpbGRTcGVjLmFyZWFBbmRQZXJpbWV0ZXIoIGFyZWFUb0J1aWxkLCBwZXJpbWV0ZXJUb0J1aWxkICksXG5cbiAgICAgIC8vIGJhY2tncm91bmRTaGFwZVxuICAgICAgbnVsbCxcblxuICAgICAgLy8gY2hlY2tTcGVjXG4gICAgICAnYXJlYUFuZFBlcmltZXRlckNvbnN0cnVjdGVkJyxcblxuICAgICAgLy8gZXhhbXBsZUJ1aWxkSXRTb2x1dGlvblxuICAgICAgZXhhbXBsZVNvbHV0aW9uXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gYXJlYVNoYXBlXG4gICAqIEBwYXJhbSB1c2VyU2hhcGVzXG4gICAqIEByZXR1cm5zIHtBcmVhQnVpbGRlckdhbWVDaGFsbGVuZ2V9XG4gICAqIEBwdWJsaWNcbiAgICovXG4gIHN0YXRpYyBjcmVhdGVGaW5kQXJlYUNoYWxsZW5nZSggYXJlYVNoYXBlLCB1c2VyU2hhcGVzICkge1xuICAgIHJldHVybiBuZXcgQXJlYUJ1aWxkZXJHYW1lQ2hhbGxlbmdlKFxuICAgICAgLy8gdG9vbFNwZWNcbiAgICAgIHtcbiAgICAgICAgZ3JpZENvbnRyb2w6IHRydWUsXG4gICAgICAgIGRpbWVuc2lvbnNDb250cm9sOiB0cnVlLFxuICAgICAgICBkZWNvbXBvc2l0aW9uVG9vbENvbnRyb2w6IHRydWVcbiAgICAgIH0sXG5cbiAgICAgIC8vIHVzZXJTaGFwZXNcbiAgICAgIHVzZXJTaGFwZXMsXG5cbiAgICAgIC8vIGJ1aWxkU3BlY1xuICAgICAgbnVsbCxcblxuICAgICAgLy8gYmFja2dyb3VuZFNoYXBlXG4gICAgICBhcmVhU2hhcGUsXG5cbiAgICAgIC8vIGNoZWNrU3BlY1xuICAgICAgJ2FyZWFFbnRlcmVkJyxcblxuICAgICAgLy8gZXhhbXBsZUJ1aWxkSXRTb2x1dGlvblxuICAgICAgbnVsbFxuICAgICk7XG4gIH1cbn1cblxuYXJlYUJ1aWxkZXIucmVnaXN0ZXIoICdBcmVhQnVpbGRlckdhbWVDaGFsbGVuZ2UnLCBBcmVhQnVpbGRlckdhbWVDaGFsbGVuZ2UgKTtcbmV4cG9ydCBkZWZhdWx0IEFyZWFCdWlsZGVyR2FtZUNoYWxsZW5nZTsiXSwibmFtZXMiOlsiYXJlYUJ1aWxkZXIiLCJQZXJpbWV0ZXJTaGFwZSIsIkJ1aWxkU3BlYyIsIkFyZWFCdWlsZGVyR2FtZUNoYWxsZW5nZSIsImNyZWF0ZUJ1aWxkQXJlYUNoYWxsZW5nZSIsImFyZWFUb0J1aWxkIiwidXNlclNoYXBlcyIsImV4YW1wbGVTb2x1dGlvbiIsImdyaWRDb250cm9sIiwiZGltZW5zaW9uc0NvbnRyb2wiLCJkZWNvbXBvc2l0aW9uVG9vbENvbnRyb2wiLCJhcmVhT25seSIsImNyZWF0ZVR3b1RvbmVCdWlsZEFyZWFDaGFsbGVuZ2UiLCJjb2xvcjEiLCJjb2xvcjIiLCJjb2xvcjFGcmFjdGlvbiIsImFyZWFBbmRQcm9wb3J0aW9ucyIsImNyZWF0ZVR3b1RvbmVCdWlsZEFyZWFBbmRQZXJpbWV0ZXJDaGFsbGVuZ2UiLCJwZXJpbWV0ZXJUb0J1aWxkIiwiYXJlYVBlcmltZXRlckFuZFByb3BvcnRpb25zIiwiY3JlYXRlQnVpbGRBcmVhQW5kUGVyaW1ldGVyQ2hhbGxlbmdlIiwiYXJlYUFuZFBlcmltZXRlciIsImNyZWF0ZUZpbmRBcmVhQ2hhbGxlbmdlIiwiYXJlYVNoYXBlIiwiY29uc3RydWN0b3IiLCJ0b29sU3BlYyIsImJ1aWxkU3BlYyIsImJhY2tncm91bmRTaGFwZSIsImNoZWNrU3BlYyIsImV4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