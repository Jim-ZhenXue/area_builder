// Copyright 2018-2022, University of Colorado Boulder
/**
 * Display a score as 'N *', where N is a number and '*' is a star.
 * If N is 0, it is hidden and the star is grayed out.
 * See specification in https://github.com/phetsims/vegas/issues/59.
 *
 * @author Andrea Lin
 */ import Utils from '../../dot/js/Utils.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import StarNode from '../../scenery-phet/js/StarNode.js';
import StatusBar from '../../scenery-phet/js/StatusBar.js';
import { HBox, Text } from '../../scenery/js/imports.js';
import vegas from './vegas.js';
let ScoreDisplayNumberAndStar = class ScoreDisplayNumberAndStar extends HBox {
    dispose() {
        this.disposeScoreDisplayNumberAndStar();
        super.dispose();
    }
    constructor(scoreProperty, providedOptions){
        const options = optionize()({
            // SelfOptions
            font: StatusBar.DEFAULT_FONT,
            textFill: 'black',
            scoreDecimalPlaces: 0,
            starNodeOptions: {
                starShapeOptions: {
                    outerRadius: 10,
                    innerRadius: 5
                },
                filledLineWidth: 1.5,
                emptyLineWidth: 1.5
            },
            // HBoxOptions
            spacing: 5
        }, providedOptions);
        super(options);
        // Update number displayed based on score.
        const scorePropertyListener = (score)=>{
            const children = [];
            if (score === 0) {
                children.push(new StarNode(combineOptions({
                    value: 0
                }, options.starNodeOptions)));
            } else {
                children.push(new Text(Utils.toFixed(score, options.scoreDecimalPlaces), {
                    font: options.font,
                    fill: options.textFill
                }));
                children.push(new StarNode(combineOptions({
                    value: 1
                }, options.starNodeOptions)));
            }
            this.children = children;
        };
        scoreProperty.link(scorePropertyListener);
        this.disposeScoreDisplayNumberAndStar = function() {
            scoreProperty.unlink(scorePropertyListener);
        };
    }
};
export { ScoreDisplayNumberAndStar as default };
vegas.register('ScoreDisplayNumberAndStar', ScoreDisplayNumberAndStar);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL1Njb3JlRGlzcGxheU51bWJlckFuZFN0YXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGlzcGxheSBhIHNjb3JlIGFzICdOIConLCB3aGVyZSBOIGlzIGEgbnVtYmVyIGFuZCAnKicgaXMgYSBzdGFyLlxuICogSWYgTiBpcyAwLCBpdCBpcyBoaWRkZW4gYW5kIHRoZSBzdGFyIGlzIGdyYXllZCBvdXQuXG4gKiBTZWUgc3BlY2lmaWNhdGlvbiBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdmVnYXMvaXNzdWVzLzU5LlxuICpcbiAqIEBhdXRob3IgQW5kcmVhIExpblxuICovXG5cbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi9kb3QvanMvVXRpbHMuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IFN0YXJOb2RlLCB7IFN0YXJOb2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9TdGFyTm9kZS5qcyc7XG5pbXBvcnQgU3RhdHVzQmFyIGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9TdGF0dXNCYXIuanMnO1xuaW1wb3J0IHsgRm9udCwgSEJveCwgSEJveE9wdGlvbnMsIFRDb2xvciwgVGV4dCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgdmVnYXMgZnJvbSAnLi92ZWdhcy5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIGZvbnQ/OiBGb250O1xuICB0ZXh0RmlsbD86IFRDb2xvcjtcbiAgc2NvcmVEZWNpbWFsUGxhY2VzPzogbnVtYmVyO1xuICBzdGFyTm9kZU9wdGlvbnM/OiBTdGFyTm9kZU9wdGlvbnM7XG59O1xuXG5leHBvcnQgdHlwZSBTY29yZURpc3BsYXlOdW1iZXJBbmRTdGFyT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxIQm94T3B0aW9ucywgJ2NoaWxkcmVuJz47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjb3JlRGlzcGxheU51bWJlckFuZFN0YXIgZXh0ZW5kcyBIQm94IHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VTY29yZURpc3BsYXlOdW1iZXJBbmRTdGFyOiAoKSA9PiB2b2lkO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2NvcmVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPiwgcHJvdmlkZWRPcHRpb25zPzogU2NvcmVEaXNwbGF5TnVtYmVyQW5kU3Rhck9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFNjb3JlRGlzcGxheU51bWJlckFuZFN0YXJPcHRpb25zLCBTZWxmT3B0aW9ucywgSEJveE9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gU2VsZk9wdGlvbnNcbiAgICAgIGZvbnQ6IFN0YXR1c0Jhci5ERUZBVUxUX0ZPTlQsXG4gICAgICB0ZXh0RmlsbDogJ2JsYWNrJyxcbiAgICAgIHNjb3JlRGVjaW1hbFBsYWNlczogMCxcbiAgICAgIHN0YXJOb2RlT3B0aW9uczoge1xuICAgICAgICBzdGFyU2hhcGVPcHRpb25zOiB7XG4gICAgICAgICAgb3V0ZXJSYWRpdXM6IDEwLFxuICAgICAgICAgIGlubmVyUmFkaXVzOiA1XG4gICAgICAgIH0sXG4gICAgICAgIGZpbGxlZExpbmVXaWR0aDogMS41LFxuICAgICAgICBlbXB0eUxpbmVXaWR0aDogMS41XG4gICAgICB9LFxuXG4gICAgICAvLyBIQm94T3B0aW9uc1xuICAgICAgc3BhY2luZzogNVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIC8vIFVwZGF0ZSBudW1iZXIgZGlzcGxheWVkIGJhc2VkIG9uIHNjb3JlLlxuICAgIGNvbnN0IHNjb3JlUHJvcGVydHlMaXN0ZW5lciA9ICggc2NvcmU6IG51bWJlciApID0+IHtcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gW107XG5cbiAgICAgIGlmICggc2NvcmUgPT09IDAgKSB7XG4gICAgICAgIGNoaWxkcmVuLnB1c2goIG5ldyBTdGFyTm9kZSggY29tYmluZU9wdGlvbnM8U3Rhck5vZGVPcHRpb25zPiggeyB2YWx1ZTogMCB9LCBvcHRpb25zLnN0YXJOb2RlT3B0aW9ucyApICkgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBjaGlsZHJlbi5wdXNoKCBuZXcgVGV4dCggVXRpbHMudG9GaXhlZCggc2NvcmUsIG9wdGlvbnMuc2NvcmVEZWNpbWFsUGxhY2VzICksIHtcbiAgICAgICAgICBmb250OiBvcHRpb25zLmZvbnQsXG4gICAgICAgICAgZmlsbDogb3B0aW9ucy50ZXh0RmlsbFxuICAgICAgICB9ICkgKTtcbiAgICAgICAgY2hpbGRyZW4ucHVzaCggbmV3IFN0YXJOb2RlKCBjb21iaW5lT3B0aW9uczxTdGFyTm9kZU9wdGlvbnM+KCB7IHZhbHVlOiAxIH0sIG9wdGlvbnMuc3Rhck5vZGVPcHRpb25zICkgKSApO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgfTtcbiAgICBzY29yZVByb3BlcnR5LmxpbmsoIHNjb3JlUHJvcGVydHlMaXN0ZW5lciApO1xuXG4gICAgdGhpcy5kaXNwb3NlU2NvcmVEaXNwbGF5TnVtYmVyQW5kU3RhciA9IGZ1bmN0aW9uKCkge1xuICAgICAgc2NvcmVQcm9wZXJ0eS51bmxpbmsoIHNjb3JlUHJvcGVydHlMaXN0ZW5lciApO1xuICAgIH07XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2VTY29yZURpc3BsYXlOdW1iZXJBbmRTdGFyKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnZlZ2FzLnJlZ2lzdGVyKCAnU2NvcmVEaXNwbGF5TnVtYmVyQW5kU3RhcicsIFNjb3JlRGlzcGxheU51bWJlckFuZFN0YXIgKTsiXSwibmFtZXMiOlsiVXRpbHMiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIlN0YXJOb2RlIiwiU3RhdHVzQmFyIiwiSEJveCIsIlRleHQiLCJ2ZWdhcyIsIlNjb3JlRGlzcGxheU51bWJlckFuZFN0YXIiLCJkaXNwb3NlIiwiZGlzcG9zZVNjb3JlRGlzcGxheU51bWJlckFuZFN0YXIiLCJzY29yZVByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImZvbnQiLCJERUZBVUxUX0ZPTlQiLCJ0ZXh0RmlsbCIsInNjb3JlRGVjaW1hbFBsYWNlcyIsInN0YXJOb2RlT3B0aW9ucyIsInN0YXJTaGFwZU9wdGlvbnMiLCJvdXRlclJhZGl1cyIsImlubmVyUmFkaXVzIiwiZmlsbGVkTGluZVdpZHRoIiwiZW1wdHlMaW5lV2lkdGgiLCJzcGFjaW5nIiwic2NvcmVQcm9wZXJ0eUxpc3RlbmVyIiwic2NvcmUiLCJjaGlsZHJlbiIsInB1c2giLCJ2YWx1ZSIsInRvRml4ZWQiLCJmaWxsIiwibGluayIsInVubGluayIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBR0QsT0FBT0EsV0FBVyx3QkFBd0I7QUFDMUMsT0FBT0MsYUFBYUMsY0FBYyxRQUFRLGtDQUFrQztBQUU1RSxPQUFPQyxjQUFtQyxvQ0FBb0M7QUFDOUUsT0FBT0MsZUFBZSxxQ0FBcUM7QUFDM0QsU0FBZUMsSUFBSSxFQUF1QkMsSUFBSSxRQUFRLDhCQUE4QjtBQUNwRixPQUFPQyxXQUFXLGFBQWE7QUFXaEIsSUFBQSxBQUFNQyw0QkFBTixNQUFNQSxrQ0FBa0NIO0lBbURyQ0ksVUFBZ0I7UUFDOUIsSUFBSSxDQUFDQyxnQ0FBZ0M7UUFDckMsS0FBSyxDQUFDRDtJQUNSO0lBbERBLFlBQW9CRSxhQUF3QyxFQUFFQyxlQUFrRCxDQUFHO1FBRWpILE1BQU1DLFVBQVVaLFlBQXlFO1lBRXZGLGNBQWM7WUFDZGEsTUFBTVYsVUFBVVcsWUFBWTtZQUM1QkMsVUFBVTtZQUNWQyxvQkFBb0I7WUFDcEJDLGlCQUFpQjtnQkFDZkMsa0JBQWtCO29CQUNoQkMsYUFBYTtvQkFDYkMsYUFBYTtnQkFDZjtnQkFDQUMsaUJBQWlCO2dCQUNqQkMsZ0JBQWdCO1lBQ2xCO1lBRUEsY0FBYztZQUNkQyxTQUFTO1FBQ1gsR0FBR1o7UUFFSCxLQUFLLENBQUVDO1FBRVAsMENBQTBDO1FBQzFDLE1BQU1ZLHdCQUF3QixDQUFFQztZQUM5QixNQUFNQyxXQUFXLEVBQUU7WUFFbkIsSUFBS0QsVUFBVSxHQUFJO2dCQUNqQkMsU0FBU0MsSUFBSSxDQUFFLElBQUl6QixTQUFVRCxlQUFpQztvQkFBRTJCLE9BQU87Z0JBQUUsR0FBR2hCLFFBQVFLLGVBQWU7WUFDckcsT0FDSztnQkFDSFMsU0FBU0MsSUFBSSxDQUFFLElBQUl0QixLQUFNTixNQUFNOEIsT0FBTyxDQUFFSixPQUFPYixRQUFRSSxrQkFBa0IsR0FBSTtvQkFDM0VILE1BQU1ELFFBQVFDLElBQUk7b0JBQ2xCaUIsTUFBTWxCLFFBQVFHLFFBQVE7Z0JBQ3hCO2dCQUNBVyxTQUFTQyxJQUFJLENBQUUsSUFBSXpCLFNBQVVELGVBQWlDO29CQUFFMkIsT0FBTztnQkFBRSxHQUFHaEIsUUFBUUssZUFBZTtZQUNyRztZQUVBLElBQUksQ0FBQ1MsUUFBUSxHQUFHQTtRQUNsQjtRQUNBaEIsY0FBY3FCLElBQUksQ0FBRVA7UUFFcEIsSUFBSSxDQUFDZixnQ0FBZ0MsR0FBRztZQUN0Q0MsY0FBY3NCLE1BQU0sQ0FBRVI7UUFDeEI7SUFDRjtBQU1GO0FBdkRBLFNBQXFCakIsdUNBdURwQjtBQUVERCxNQUFNMkIsUUFBUSxDQUFFLDZCQUE2QjFCIn0=