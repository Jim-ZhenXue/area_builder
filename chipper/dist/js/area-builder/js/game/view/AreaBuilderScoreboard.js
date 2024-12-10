// Copyright 2014-2023, University of Colorado Boulder
/**
 * Panel that shows the level, the current challenge, the score, and the time if enabled.
 *
 * @author John Blanco
 */ import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text, VBox } from '../../../../scenery/js/imports.js';
import GameTimer from '../../../../vegas/js/GameTimer.js';
import VegasStrings from '../../../../vegas/js/VegasStrings.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderStrings from '../../AreaBuilderStrings.js';
const labelScorePatternString = VegasStrings.label.scorePattern;
const labelTimeString = VegasStrings.label.time;
const levelString = AreaBuilderStrings.level;
const pattern0Challenge1MaxString = AreaBuilderStrings.pattern['0challenge']['1max'];
let AreaBuilderScoreboard = class AreaBuilderScoreboard extends Node {
    /**
   * @param levelProperty
   * @param problemNumberProperty
   * @param problemsPerLevel
   * @param scoreProperty
   * @param elapsedTimeProperty
   * @param {Object} [options]
   */ constructor(levelProperty, problemNumberProperty, problemsPerLevel, scoreProperty, elapsedTimeProperty, options){
        super();
        options = merge({
            maxWidth: Number.POSITIVE_INFINITY
        }, options);
        // Properties that control which elements are visible and which are hidden.  This constitutes the primary API.
        this.timeVisibleProperty = new Property(true);
        // Create the labels
        const levelIndicator = new Text('', {
            font: new PhetFont({
                size: 20,
                weight: 'bold'
            }),
            maxWidth: options.maxWidth
        });
        levelProperty.link((level)=>{
            levelIndicator.string = StringUtils.format(levelString, level + 1);
        });
        const currentChallengeIndicator = new Text('', {
            font: new PhetFont({
                size: 16
            }),
            maxWidth: options.maxWidth
        });
        problemNumberProperty.link((currentChallenge)=>{
            currentChallengeIndicator.string = StringUtils.format(pattern0Challenge1MaxString, currentChallenge + 1, problemsPerLevel);
        });
        const scoreIndicator = new Text('', {
            font: new PhetFont(20),
            maxWidth: options.maxWidth
        });
        scoreProperty.link((score)=>{
            scoreIndicator.string = StringUtils.format(labelScorePatternString, score);
        });
        const elapsedTimeIndicator = new Text('', {
            font: new PhetFont(20),
            maxWidth: options.maxWidth
        });
        elapsedTimeProperty.link((elapsedTime)=>{
            elapsedTimeIndicator.string = StringUtils.format(labelTimeString, GameTimer.formatTime(elapsedTime));
        });
        // Create the panel.
        const vBox = new VBox({
            children: [
                levelIndicator,
                currentChallengeIndicator,
                scoreIndicator,
                elapsedTimeIndicator
            ],
            spacing: 12
        });
        this.addChild(vBox);
        // Add/remove the time indicator.
        this.timeVisibleProperty.link((timeVisible)=>{
            if (timeVisible && !vBox.hasChild(elapsedTimeIndicator)) {
                // Insert just after the score indicator.
                vBox.insertChild(vBox.indexOfChild(scoreIndicator) + 1, elapsedTimeIndicator);
            } else if (!timeVisible && vBox.hasChild(elapsedTimeIndicator)) {
                vBox.removeChild(elapsedTimeIndicator);
            }
        });
        this.mutate(options);
    }
};
areaBuilder.register('AreaBuilderScoreboard', AreaBuilderScoreboard);
export default AreaBuilderScoreboard;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9nYW1lL3ZpZXcvQXJlYUJ1aWxkZXJTY29yZWJvYXJkLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFBhbmVsIHRoYXQgc2hvd3MgdGhlIGxldmVsLCB0aGUgY3VycmVudCBjaGFsbGVuZ2UsIHRoZSBzY29yZSwgYW5kIHRoZSB0aW1lIGlmIGVuYWJsZWQuXG4gKlxuICogQGF1dGhvciBKb2huIEJsYW5jb1xuICovXG5cbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcbmltcG9ydCB7IE5vZGUsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEdhbWVUaW1lciBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9HYW1lVGltZXIuanMnO1xuaW1wb3J0IFZlZ2FzU3RyaW5ncyBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9WZWdhc1N0cmluZ3MuanMnO1xuaW1wb3J0IGFyZWFCdWlsZGVyIGZyb20gJy4uLy4uL2FyZWFCdWlsZGVyLmpzJztcbmltcG9ydCBBcmVhQnVpbGRlclN0cmluZ3MgZnJvbSAnLi4vLi4vQXJlYUJ1aWxkZXJTdHJpbmdzLmpzJztcblxuY29uc3QgbGFiZWxTY29yZVBhdHRlcm5TdHJpbmcgPSBWZWdhc1N0cmluZ3MubGFiZWwuc2NvcmVQYXR0ZXJuO1xuY29uc3QgbGFiZWxUaW1lU3RyaW5nID0gVmVnYXNTdHJpbmdzLmxhYmVsLnRpbWU7XG5jb25zdCBsZXZlbFN0cmluZyA9IEFyZWFCdWlsZGVyU3RyaW5ncy5sZXZlbDtcbmNvbnN0IHBhdHRlcm4wQ2hhbGxlbmdlMU1heFN0cmluZyA9IEFyZWFCdWlsZGVyU3RyaW5ncy5wYXR0ZXJuWyAnMGNoYWxsZW5nZScgXVsgJzFtYXgnIF07XG5cbmNsYXNzIEFyZWFCdWlsZGVyU2NvcmVib2FyZCBleHRlbmRzIE5vZGUge1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gbGV2ZWxQcm9wZXJ0eVxuICAgKiBAcGFyYW0gcHJvYmxlbU51bWJlclByb3BlcnR5XG4gICAqIEBwYXJhbSBwcm9ibGVtc1BlckxldmVsXG4gICAqIEBwYXJhbSBzY29yZVByb3BlcnR5XG4gICAqIEBwYXJhbSBlbGFwc2VkVGltZVByb3BlcnR5XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICovXG4gIGNvbnN0cnVjdG9yKCBsZXZlbFByb3BlcnR5LCBwcm9ibGVtTnVtYmVyUHJvcGVydHksIHByb2JsZW1zUGVyTGV2ZWwsIHNjb3JlUHJvcGVydHksIGVsYXBzZWRUaW1lUHJvcGVydHksIG9wdGlvbnMgKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIG9wdGlvbnMgPSBtZXJnZSggeyBtYXhXaWR0aDogTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZIH0sIG9wdGlvbnMgKTtcblxuICAgIC8vIFByb3BlcnRpZXMgdGhhdCBjb250cm9sIHdoaWNoIGVsZW1lbnRzIGFyZSB2aXNpYmxlIGFuZCB3aGljaCBhcmUgaGlkZGVuLiAgVGhpcyBjb25zdGl0dXRlcyB0aGUgcHJpbWFyeSBBUEkuXG4gICAgdGhpcy50aW1lVmlzaWJsZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCB0cnVlICk7XG5cbiAgICAvLyBDcmVhdGUgdGhlIGxhYmVsc1xuICAgIGNvbnN0IGxldmVsSW5kaWNhdG9yID0gbmV3IFRleHQoICcnLCB7XG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMjAsIHdlaWdodDogJ2JvbGQnIH0gKSxcbiAgICAgIG1heFdpZHRoOiBvcHRpb25zLm1heFdpZHRoXG4gICAgfSApO1xuICAgIGxldmVsUHJvcGVydHkubGluayggbGV2ZWwgPT4ge1xuICAgICAgbGV2ZWxJbmRpY2F0b3Iuc3RyaW5nID0gU3RyaW5nVXRpbHMuZm9ybWF0KCBsZXZlbFN0cmluZywgbGV2ZWwgKyAxICk7XG4gICAgfSApO1xuICAgIGNvbnN0IGN1cnJlbnRDaGFsbGVuZ2VJbmRpY2F0b3IgPSBuZXcgVGV4dCggJycsIHsgZm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDE2IH0gKSwgbWF4V2lkdGg6IG9wdGlvbnMubWF4V2lkdGggfSApO1xuICAgIHByb2JsZW1OdW1iZXJQcm9wZXJ0eS5saW5rKCBjdXJyZW50Q2hhbGxlbmdlID0+IHtcbiAgICAgIGN1cnJlbnRDaGFsbGVuZ2VJbmRpY2F0b3Iuc3RyaW5nID0gU3RyaW5nVXRpbHMuZm9ybWF0KCBwYXR0ZXJuMENoYWxsZW5nZTFNYXhTdHJpbmcsIGN1cnJlbnRDaGFsbGVuZ2UgKyAxLCBwcm9ibGVtc1BlckxldmVsICk7XG4gICAgfSApO1xuICAgIGNvbnN0IHNjb3JlSW5kaWNhdG9yID0gbmV3IFRleHQoICcnLCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMjAgKSwgbWF4V2lkdGg6IG9wdGlvbnMubWF4V2lkdGggfSApO1xuICAgIHNjb3JlUHJvcGVydHkubGluayggc2NvcmUgPT4ge1xuICAgICAgc2NvcmVJbmRpY2F0b3Iuc3RyaW5nID0gU3RyaW5nVXRpbHMuZm9ybWF0KCBsYWJlbFNjb3JlUGF0dGVyblN0cmluZywgc2NvcmUgKTtcbiAgICB9ICk7XG4gICAgY29uc3QgZWxhcHNlZFRpbWVJbmRpY2F0b3IgPSBuZXcgVGV4dCggJycsIHsgZm9udDogbmV3IFBoZXRGb250KCAyMCApLCBtYXhXaWR0aDogb3B0aW9ucy5tYXhXaWR0aCB9ICk7XG4gICAgZWxhcHNlZFRpbWVQcm9wZXJ0eS5saW5rKCBlbGFwc2VkVGltZSA9PiB7XG4gICAgICBlbGFwc2VkVGltZUluZGljYXRvci5zdHJpbmcgPSBTdHJpbmdVdGlscy5mb3JtYXQoIGxhYmVsVGltZVN0cmluZywgR2FtZVRpbWVyLmZvcm1hdFRpbWUoIGVsYXBzZWRUaW1lICkgKTtcbiAgICB9ICk7XG5cbiAgICAvLyBDcmVhdGUgdGhlIHBhbmVsLlxuICAgIGNvbnN0IHZCb3ggPSBuZXcgVkJveCgge1xuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgbGV2ZWxJbmRpY2F0b3IsXG4gICAgICAgIGN1cnJlbnRDaGFsbGVuZ2VJbmRpY2F0b3IsXG4gICAgICAgIHNjb3JlSW5kaWNhdG9yLFxuICAgICAgICBlbGFwc2VkVGltZUluZGljYXRvclxuICAgICAgXSxcbiAgICAgIHNwYWNpbmc6IDEyXG4gICAgfSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIHZCb3ggKTtcblxuICAgIC8vIEFkZC9yZW1vdmUgdGhlIHRpbWUgaW5kaWNhdG9yLlxuICAgIHRoaXMudGltZVZpc2libGVQcm9wZXJ0eS5saW5rKCB0aW1lVmlzaWJsZSA9PiB7XG4gICAgICBpZiAoIHRpbWVWaXNpYmxlICYmICF2Qm94Lmhhc0NoaWxkKCBlbGFwc2VkVGltZUluZGljYXRvciApICkge1xuICAgICAgICAvLyBJbnNlcnQganVzdCBhZnRlciB0aGUgc2NvcmUgaW5kaWNhdG9yLlxuICAgICAgICB2Qm94Lmluc2VydENoaWxkKCB2Qm94LmluZGV4T2ZDaGlsZCggc2NvcmVJbmRpY2F0b3IgKSArIDEsIGVsYXBzZWRUaW1lSW5kaWNhdG9yICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggIXRpbWVWaXNpYmxlICYmIHZCb3guaGFzQ2hpbGQoIGVsYXBzZWRUaW1lSW5kaWNhdG9yICkgKSB7XG4gICAgICAgIHZCb3gucmVtb3ZlQ2hpbGQoIGVsYXBzZWRUaW1lSW5kaWNhdG9yICk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcbiAgfVxufVxuXG5hcmVhQnVpbGRlci5yZWdpc3RlciggJ0FyZWFCdWlsZGVyU2NvcmVib2FyZCcsIEFyZWFCdWlsZGVyU2NvcmVib2FyZCApO1xuZXhwb3J0IGRlZmF1bHQgQXJlYUJ1aWxkZXJTY29yZWJvYXJkOyJdLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIm1lcmdlIiwiU3RyaW5nVXRpbHMiLCJQaGV0Rm9udCIsIk5vZGUiLCJUZXh0IiwiVkJveCIsIkdhbWVUaW1lciIsIlZlZ2FzU3RyaW5ncyIsImFyZWFCdWlsZGVyIiwiQXJlYUJ1aWxkZXJTdHJpbmdzIiwibGFiZWxTY29yZVBhdHRlcm5TdHJpbmciLCJsYWJlbCIsInNjb3JlUGF0dGVybiIsImxhYmVsVGltZVN0cmluZyIsInRpbWUiLCJsZXZlbFN0cmluZyIsImxldmVsIiwicGF0dGVybjBDaGFsbGVuZ2UxTWF4U3RyaW5nIiwicGF0dGVybiIsIkFyZWFCdWlsZGVyU2NvcmVib2FyZCIsImNvbnN0cnVjdG9yIiwibGV2ZWxQcm9wZXJ0eSIsInByb2JsZW1OdW1iZXJQcm9wZXJ0eSIsInByb2JsZW1zUGVyTGV2ZWwiLCJzY29yZVByb3BlcnR5IiwiZWxhcHNlZFRpbWVQcm9wZXJ0eSIsIm9wdGlvbnMiLCJtYXhXaWR0aCIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwidGltZVZpc2libGVQcm9wZXJ0eSIsImxldmVsSW5kaWNhdG9yIiwiZm9udCIsInNpemUiLCJ3ZWlnaHQiLCJsaW5rIiwic3RyaW5nIiwiZm9ybWF0IiwiY3VycmVudENoYWxsZW5nZUluZGljYXRvciIsImN1cnJlbnRDaGFsbGVuZ2UiLCJzY29yZUluZGljYXRvciIsInNjb3JlIiwiZWxhcHNlZFRpbWVJbmRpY2F0b3IiLCJlbGFwc2VkVGltZSIsImZvcm1hdFRpbWUiLCJ2Qm94IiwiY2hpbGRyZW4iLCJzcGFjaW5nIiwiYWRkQ2hpbGQiLCJ0aW1lVmlzaWJsZSIsImhhc0NoaWxkIiwiaW5zZXJ0Q2hpbGQiLCJpbmRleE9mQ2hpbGQiLCJyZW1vdmVDaGlsZCIsIm11dGF0ZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGNBQWMsa0NBQWtDO0FBQ3ZELE9BQU9DLFdBQVcsb0NBQW9DO0FBQ3RELE9BQU9DLGlCQUFpQixnREFBZ0Q7QUFDeEUsT0FBT0MsY0FBYywwQ0FBMEM7QUFDL0QsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSxvQ0FBb0M7QUFDckUsT0FBT0MsZUFBZSxvQ0FBb0M7QUFDMUQsT0FBT0Msa0JBQWtCLHVDQUF1QztBQUNoRSxPQUFPQyxpQkFBaUIsdUJBQXVCO0FBQy9DLE9BQU9DLHdCQUF3Qiw4QkFBOEI7QUFFN0QsTUFBTUMsMEJBQTBCSCxhQUFhSSxLQUFLLENBQUNDLFlBQVk7QUFDL0QsTUFBTUMsa0JBQWtCTixhQUFhSSxLQUFLLENBQUNHLElBQUk7QUFDL0MsTUFBTUMsY0FBY04sbUJBQW1CTyxLQUFLO0FBQzVDLE1BQU1DLDhCQUE4QlIsbUJBQW1CUyxPQUFPLENBQUUsYUFBYyxDQUFFLE9BQVE7QUFFeEYsSUFBQSxBQUFNQyx3QkFBTixNQUFNQSw4QkFBOEJoQjtJQUVsQzs7Ozs7OztHQU9DLEdBQ0RpQixZQUFhQyxhQUFhLEVBQUVDLHFCQUFxQixFQUFFQyxnQkFBZ0IsRUFBRUMsYUFBYSxFQUFFQyxtQkFBbUIsRUFBRUMsT0FBTyxDQUFHO1FBQ2pILEtBQUs7UUFFTEEsVUFBVTFCLE1BQU87WUFBRTJCLFVBQVVDLE9BQU9DLGlCQUFpQjtRQUFDLEdBQUdIO1FBRXpELDhHQUE4RztRQUM5RyxJQUFJLENBQUNJLG1CQUFtQixHQUFHLElBQUkvQixTQUFVO1FBRXpDLG9CQUFvQjtRQUNwQixNQUFNZ0MsaUJBQWlCLElBQUkzQixLQUFNLElBQUk7WUFDbkM0QixNQUFNLElBQUk5QixTQUFVO2dCQUFFK0IsTUFBTTtnQkFBSUMsUUFBUTtZQUFPO1lBQy9DUCxVQUFVRCxRQUFRQyxRQUFRO1FBQzVCO1FBQ0FOLGNBQWNjLElBQUksQ0FBRW5CLENBQUFBO1lBQ2xCZSxlQUFlSyxNQUFNLEdBQUduQyxZQUFZb0MsTUFBTSxDQUFFdEIsYUFBYUMsUUFBUTtRQUNuRTtRQUNBLE1BQU1zQiw0QkFBNEIsSUFBSWxDLEtBQU0sSUFBSTtZQUFFNEIsTUFBTSxJQUFJOUIsU0FBVTtnQkFBRStCLE1BQU07WUFBRztZQUFLTixVQUFVRCxRQUFRQyxRQUFRO1FBQUM7UUFDakhMLHNCQUFzQmEsSUFBSSxDQUFFSSxDQUFBQTtZQUMxQkQsMEJBQTBCRixNQUFNLEdBQUduQyxZQUFZb0MsTUFBTSxDQUFFcEIsNkJBQTZCc0IsbUJBQW1CLEdBQUdoQjtRQUM1RztRQUNBLE1BQU1pQixpQkFBaUIsSUFBSXBDLEtBQU0sSUFBSTtZQUFFNEIsTUFBTSxJQUFJOUIsU0FBVTtZQUFNeUIsVUFBVUQsUUFBUUMsUUFBUTtRQUFDO1FBQzVGSCxjQUFjVyxJQUFJLENBQUVNLENBQUFBO1lBQ2xCRCxlQUFlSixNQUFNLEdBQUduQyxZQUFZb0MsTUFBTSxDQUFFM0IseUJBQXlCK0I7UUFDdkU7UUFDQSxNQUFNQyx1QkFBdUIsSUFBSXRDLEtBQU0sSUFBSTtZQUFFNEIsTUFBTSxJQUFJOUIsU0FBVTtZQUFNeUIsVUFBVUQsUUFBUUMsUUFBUTtRQUFDO1FBQ2xHRixvQkFBb0JVLElBQUksQ0FBRVEsQ0FBQUE7WUFDeEJELHFCQUFxQk4sTUFBTSxHQUFHbkMsWUFBWW9DLE1BQU0sQ0FBRXhCLGlCQUFpQlAsVUFBVXNDLFVBQVUsQ0FBRUQ7UUFDM0Y7UUFFQSxvQkFBb0I7UUFDcEIsTUFBTUUsT0FBTyxJQUFJeEMsS0FBTTtZQUNyQnlDLFVBQVU7Z0JBQ1JmO2dCQUNBTztnQkFDQUU7Z0JBQ0FFO2FBQ0Q7WUFDREssU0FBUztRQUNYO1FBQ0EsSUFBSSxDQUFDQyxRQUFRLENBQUVIO1FBRWYsaUNBQWlDO1FBQ2pDLElBQUksQ0FBQ2YsbUJBQW1CLENBQUNLLElBQUksQ0FBRWMsQ0FBQUE7WUFDN0IsSUFBS0EsZUFBZSxDQUFDSixLQUFLSyxRQUFRLENBQUVSLHVCQUF5QjtnQkFDM0QseUNBQXlDO2dCQUN6Q0csS0FBS00sV0FBVyxDQUFFTixLQUFLTyxZQUFZLENBQUVaLGtCQUFtQixHQUFHRTtZQUM3RCxPQUNLLElBQUssQ0FBQ08sZUFBZUosS0FBS0ssUUFBUSxDQUFFUix1QkFBeUI7Z0JBQ2hFRyxLQUFLUSxXQUFXLENBQUVYO1lBQ3BCO1FBQ0Y7UUFFQSxJQUFJLENBQUNZLE1BQU0sQ0FBRTVCO0lBQ2Y7QUFDRjtBQUVBbEIsWUFBWStDLFFBQVEsQ0FBRSx5QkFBeUJwQztBQUMvQyxlQUFlQSxzQkFBc0IifQ==