// Copyright 2018-2024, University of Colorado Boulder
/**
 * Display a score as 'Score: N', where N is a number.
 * See specification in https://github.com/phetsims/vegas/issues/59.
 *
 * @author Andrea Lin
 */ import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Utils from '../../dot/js/Utils.js';
import optionize from '../../phet-core/js/optionize.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import StatusBar from '../../scenery-phet/js/StatusBar.js';
import { Node, Text } from '../../scenery/js/imports.js';
import vegas from './vegas.js';
import VegasStrings from './VegasStrings.js';
let ScoreDisplayLabeledNumber = class ScoreDisplayLabeledNumber extends Node {
    dispose() {
        this.disposeScoreDisplayLabeledNumber();
        super.dispose();
    }
    constructor(scoreProperty, providedOptions){
        const options = optionize()({
            // SelfOptions
            font: StatusBar.DEFAULT_FONT,
            textFill: 'black',
            scoreDecimalPlaces: 0
        }, providedOptions);
        const scoreDisplayStringProperty = new DerivedProperty([
            VegasStrings.pattern.score.numberStringProperty,
            scoreProperty
        ], (pattern, score)=>StringUtils.fillIn(pattern, {
                score: Utils.toFixed(score, options.scoreDecimalPlaces)
            }));
        const scoreDisplayText = new Text(scoreDisplayStringProperty, {
            font: options.font,
            fill: options.textFill
        });
        options.children = [
            scoreDisplayText
        ];
        super(options);
        this.disposeScoreDisplayLabeledNumber = ()=>{
            scoreDisplayStringProperty.dispose();
        };
    }
};
export { ScoreDisplayLabeledNumber as default };
vegas.register('ScoreDisplayLabeledNumber', ScoreDisplayLabeledNumber);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL1Njb3JlRGlzcGxheUxhYmVsZWROdW1iZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGlzcGxheSBhIHNjb3JlIGFzICdTY29yZTogTicsIHdoZXJlIE4gaXMgYSBudW1iZXIuXG4gKiBTZWUgc3BlY2lmaWNhdGlvbiBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdmVnYXMvaXNzdWVzLzU5LlxuICpcbiAqIEBhdXRob3IgQW5kcmVhIExpblxuICovXG5cbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XG5pbXBvcnQgU3RhdHVzQmFyIGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9TdGF0dXNCYXIuanMnO1xuaW1wb3J0IHsgRm9udCwgSEJveE9wdGlvbnMsIE5vZGUsIFRDb2xvciwgVGV4dCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgdmVnYXMgZnJvbSAnLi92ZWdhcy5qcyc7XG5pbXBvcnQgVmVnYXNTdHJpbmdzIGZyb20gJy4vVmVnYXNTdHJpbmdzLmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcbiAgZm9udD86IEZvbnQ7XG4gIHRleHRGaWxsPzogVENvbG9yO1xuICBzY29yZURlY2ltYWxQbGFjZXM/OiBudW1iZXI7XG59O1xuXG5leHBvcnQgdHlwZSBTY29yZURpc3BsYXlMYWJlbGVkTnVtYmVyT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxIQm94T3B0aW9ucywgJ2NoaWxkcmVuJz47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjb3JlRGlzcGxheUxhYmVsZWROdW1iZXIgZXh0ZW5kcyBOb2RlIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VTY29yZURpc3BsYXlMYWJlbGVkTnVtYmVyOiAoKSA9PiB2b2lkO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2NvcmVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPiwgcHJvdmlkZWRPcHRpb25zPzogU2NvcmVEaXNwbGF5TGFiZWxlZE51bWJlck9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFNjb3JlRGlzcGxheUxhYmVsZWROdW1iZXJPcHRpb25zLCBTZWxmT3B0aW9ucywgSEJveE9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gU2VsZk9wdGlvbnNcbiAgICAgIGZvbnQ6IFN0YXR1c0Jhci5ERUZBVUxUX0ZPTlQsXG4gICAgICB0ZXh0RmlsbDogJ2JsYWNrJyxcbiAgICAgIHNjb3JlRGVjaW1hbFBsYWNlczogMFxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgY29uc3Qgc2NvcmVEaXNwbGF5U3RyaW5nUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxuICAgICAgWyBWZWdhc1N0cmluZ3MucGF0dGVybi5zY29yZS5udW1iZXJTdHJpbmdQcm9wZXJ0eSwgc2NvcmVQcm9wZXJ0eSBdLFxuICAgICAgKCBwYXR0ZXJuOiBzdHJpbmcsIHNjb3JlOiBudW1iZXIgKSA9PiBTdHJpbmdVdGlscy5maWxsSW4oIHBhdHRlcm4sIHtcbiAgICAgICAgc2NvcmU6IFV0aWxzLnRvRml4ZWQoIHNjb3JlLCBvcHRpb25zLnNjb3JlRGVjaW1hbFBsYWNlcyApXG4gICAgICB9IClcbiAgICApO1xuXG4gICAgY29uc3Qgc2NvcmVEaXNwbGF5VGV4dCA9IG5ldyBUZXh0KCBzY29yZURpc3BsYXlTdHJpbmdQcm9wZXJ0eSwge1xuICAgICAgZm9udDogb3B0aW9ucy5mb250LFxuICAgICAgZmlsbDogb3B0aW9ucy50ZXh0RmlsbFxuICAgIH0gKTtcblxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIHNjb3JlRGlzcGxheVRleHQgXTtcblxuICAgIHN1cGVyKCBvcHRpb25zICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VTY29yZURpc3BsYXlMYWJlbGVkTnVtYmVyID0gKCkgPT4ge1xuICAgICAgc2NvcmVEaXNwbGF5U3RyaW5nUHJvcGVydHkuZGlzcG9zZSgpO1xuICAgIH07XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2VTY29yZURpc3BsYXlMYWJlbGVkTnVtYmVyKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnZlZ2FzLnJlZ2lzdGVyKCAnU2NvcmVEaXNwbGF5TGFiZWxlZE51bWJlcicsIFNjb3JlRGlzcGxheUxhYmVsZWROdW1iZXIgKTsiXSwibmFtZXMiOlsiRGVyaXZlZFByb3BlcnR5IiwiVXRpbHMiLCJvcHRpb25pemUiLCJTdHJpbmdVdGlscyIsIlN0YXR1c0JhciIsIk5vZGUiLCJUZXh0IiwidmVnYXMiLCJWZWdhc1N0cmluZ3MiLCJTY29yZURpc3BsYXlMYWJlbGVkTnVtYmVyIiwiZGlzcG9zZSIsImRpc3Bvc2VTY29yZURpc3BsYXlMYWJlbGVkTnVtYmVyIiwic2NvcmVQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJmb250IiwiREVGQVVMVF9GT05UIiwidGV4dEZpbGwiLCJzY29yZURlY2ltYWxQbGFjZXMiLCJzY29yZURpc3BsYXlTdHJpbmdQcm9wZXJ0eSIsInBhdHRlcm4iLCJzY29yZSIsIm51bWJlclN0cmluZ1Byb3BlcnR5IiwiZmlsbEluIiwidG9GaXhlZCIsInNjb3JlRGlzcGxheVRleHQiLCJmaWxsIiwiY2hpbGRyZW4iLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EscUJBQXFCLG1DQUFtQztBQUUvRCxPQUFPQyxXQUFXLHdCQUF3QjtBQUMxQyxPQUFPQyxlQUFlLGtDQUFrQztBQUV4RCxPQUFPQyxpQkFBaUIsMENBQTBDO0FBQ2xFLE9BQU9DLGVBQWUscUNBQXFDO0FBQzNELFNBQTRCQyxJQUFJLEVBQVVDLElBQUksUUFBUSw4QkFBOEI7QUFDcEYsT0FBT0MsV0FBVyxhQUFhO0FBQy9CLE9BQU9DLGtCQUFrQixvQkFBb0I7QUFVOUIsSUFBQSxBQUFNQyw0QkFBTixNQUFNQSxrQ0FBa0NKO0lBbUNyQ0ssVUFBZ0I7UUFDOUIsSUFBSSxDQUFDQyxnQ0FBZ0M7UUFDckMsS0FBSyxDQUFDRDtJQUNSO0lBbENBLFlBQW9CRSxhQUF3QyxFQUFFQyxlQUFrRCxDQUFHO1FBRWpILE1BQU1DLFVBQVVaLFlBQXlFO1lBRXZGLGNBQWM7WUFDZGEsTUFBTVgsVUFBVVksWUFBWTtZQUM1QkMsVUFBVTtZQUNWQyxvQkFBb0I7UUFDdEIsR0FBR0w7UUFFSCxNQUFNTSw2QkFBNkIsSUFBSW5CLGdCQUNyQztZQUFFUSxhQUFhWSxPQUFPLENBQUNDLEtBQUssQ0FBQ0Msb0JBQW9CO1lBQUVWO1NBQWUsRUFDbEUsQ0FBRVEsU0FBaUJDLFFBQW1CbEIsWUFBWW9CLE1BQU0sQ0FBRUgsU0FBUztnQkFDakVDLE9BQU9wQixNQUFNdUIsT0FBTyxDQUFFSCxPQUFPUCxRQUFRSSxrQkFBa0I7WUFDekQ7UUFHRixNQUFNTyxtQkFBbUIsSUFBSW5CLEtBQU1hLDRCQUE0QjtZQUM3REosTUFBTUQsUUFBUUMsSUFBSTtZQUNsQlcsTUFBTVosUUFBUUcsUUFBUTtRQUN4QjtRQUVBSCxRQUFRYSxRQUFRLEdBQUc7WUFBRUY7U0FBa0I7UUFFdkMsS0FBSyxDQUFFWDtRQUVQLElBQUksQ0FBQ0gsZ0NBQWdDLEdBQUc7WUFDdENRLDJCQUEyQlQsT0FBTztRQUNwQztJQUNGO0FBTUY7QUF2Q0EsU0FBcUJELHVDQXVDcEI7QUFFREYsTUFBTXFCLFFBQVEsQ0FBRSw2QkFBNkJuQiJ9