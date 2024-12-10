// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for StopwatchNode
 *
 * @author Sam Reid
 */ import Property from '../../../../axon/js/Property.js';
import stepTimer from '../../../../axon/js/stepTimer.js';
import { HBox, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import SceneryPhetStrings from '../../SceneryPhetStrings.js';
import Stopwatch from '../../Stopwatch.js';
import StopwatchNode from '../../StopwatchNode.js';
export default function demoStopwatchNode(layoutBounds, providedOptions) {
    assert && assert(providedOptions.tandem);
    const tandem = providedOptions.tandem;
    // Use the same model for all views
    const stopwatch = new Stopwatch({
        isVisible: true,
        tandem: tandem.createTandem('stopwatch')
    });
    const stepListener = (dt)=>stopwatch.step(dt);
    stepTimer.addListener(stepListener);
    // StopwatchNode with plain text format MM:SS.CC
    const stopwatchNodeMMSSCC = new StopwatchNode(stopwatch, {
        numberDisplayOptions: {
            numberFormatter: StopwatchNode.PLAIN_TEXT_MINUTES_AND_SECONDS
        },
        tandem: tandem.createTandem('stopwatchNodeMMSSCC')
    });
    // StopwatchNode with rich format MM:SS.cc and no units
    const stopwatchNodeMMSScc = new StopwatchNode(stopwatch, {
        numberDisplayOptions: {
            numberFormatter: StopwatchNode.RICH_TEXT_MINUTES_AND_SECONDS
        },
        tandem: tandem.createTandem('stopwatchNodeMMSScc')
    });
    // StopwatchNode with rich text format and dynamic units.
    const unitsProperty = new Property('ms');
    const numberOfDecimalPlaces = 2;
    const customStopwatchNode = new StopwatchNode(stopwatch, {
        backgroundBaseColor: 'red',
        // Supply the formatter on startup as well as on link, so it can detect widest/thinnest text, see NumberDisplay
        numberDisplayOptions: {
            numberFormatter: StopwatchNode.createRichTextNumberFormatter({
                showAsMinutesAndSeconds: false,
                numberOfDecimalPlaces: numberOfDecimalPlaces,
                units: unitsProperty.value
            }),
            numberFormatterDependencies: [
                SceneryPhetStrings.stopwatchValueUnitsPatternStringProperty,
                unitsProperty
            ]
        },
        scale: 2,
        tandem: tandem.createTandem('customStopwatchNode')
    });
    const unitsRadioButtonGroup = new RectangularRadioButtonGroup(unitsProperty, [
        {
            value: 'ps',
            createNode: ()=>new Text('picoseconds'),
            tandemName: 'picosecondsRadioButton'
        },
        {
            value: 'ms',
            createNode: ()=>new Text('milliseconds'),
            tandemName: 'millisecondsRadioButton'
        },
        {
            value: 'fs',
            createNode: ()=>new Text('femtoseconds'),
            tandemName: 'femtosecondsRadioButton'
        }
    ], {
        spacing: 5,
        tandem: tandem.createTandem('unitsRadioButtonGroup')
    });
    // Layout
    const vBox = new VBox({
        align: 'left',
        spacing: 20,
        center: layoutBounds.center,
        children: [
            stopwatchNodeMMSSCC,
            stopwatchNodeMMSScc,
            new HBox({
                spacing: 20,
                children: [
                    customStopwatchNode,
                    unitsRadioButtonGroup
                ]
            })
        ]
    });
    // Swap out the dispose function for one that also removes the Emitter listener
    const demoDispose = vBox.dispose.bind(vBox);
    vBox.dispose = ()=>{
        stepTimer.removeListener(stepListener);
        demoDispose();
    };
    return vBox;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb1N0b3B3YXRjaE5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVtbyBmb3IgU3RvcHdhdGNoTm9kZVxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWRcbiAqL1xuXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgc3RlcFRpbWVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvc3RlcFRpbWVyLmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCB7IEhCb3gsIE5vZGUsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IFJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAuanMnO1xuaW1wb3J0IHsgU3VuRGVtb09wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvZGVtby9EZW1vc1NjcmVlblZpZXcuanMnO1xuaW1wb3J0IFNjZW5lcnlQaGV0U3RyaW5ncyBmcm9tICcuLi8uLi9TY2VuZXJ5UGhldFN0cmluZ3MuanMnO1xuaW1wb3J0IFN0b3B3YXRjaCBmcm9tICcuLi8uLi9TdG9wd2F0Y2guanMnO1xuaW1wb3J0IFN0b3B3YXRjaE5vZGUgZnJvbSAnLi4vLi4vU3RvcHdhdGNoTm9kZS5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9TdG9wd2F0Y2hOb2RlKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIsIHByb3ZpZGVkT3B0aW9uczogU3VuRGVtb09wdGlvbnMgKTogTm9kZSB7XG5cbiAgYXNzZXJ0ICYmIGFzc2VydCggcHJvdmlkZWRPcHRpb25zLnRhbmRlbSApO1xuICBjb25zdCB0YW5kZW0gPSBwcm92aWRlZE9wdGlvbnMudGFuZGVtITtcblxuICAvLyBVc2UgdGhlIHNhbWUgbW9kZWwgZm9yIGFsbCB2aWV3c1xuICBjb25zdCBzdG9wd2F0Y2ggPSBuZXcgU3RvcHdhdGNoKCB7XG4gICAgaXNWaXNpYmxlOiB0cnVlLFxuICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N0b3B3YXRjaCcgKVxuICB9ICk7XG5cbiAgY29uc3Qgc3RlcExpc3RlbmVyID0gKCBkdDogbnVtYmVyICkgPT4gc3RvcHdhdGNoLnN0ZXAoIGR0ICk7XG4gIHN0ZXBUaW1lci5hZGRMaXN0ZW5lciggc3RlcExpc3RlbmVyICk7XG5cbiAgLy8gU3RvcHdhdGNoTm9kZSB3aXRoIHBsYWluIHRleHQgZm9ybWF0IE1NOlNTLkNDXG4gIGNvbnN0IHN0b3B3YXRjaE5vZGVNTVNTQ0MgPSBuZXcgU3RvcHdhdGNoTm9kZSggc3RvcHdhdGNoLCB7XG4gICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcbiAgICAgIG51bWJlckZvcm1hdHRlcjogU3RvcHdhdGNoTm9kZS5QTEFJTl9URVhUX01JTlVURVNfQU5EX1NFQ09ORFNcbiAgICB9LFxuICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N0b3B3YXRjaE5vZGVNTVNTQ0MnIClcbiAgfSApO1xuXG4gIC8vIFN0b3B3YXRjaE5vZGUgd2l0aCByaWNoIGZvcm1hdCBNTTpTUy5jYyBhbmQgbm8gdW5pdHNcbiAgY29uc3Qgc3RvcHdhdGNoTm9kZU1NU1NjYyA9IG5ldyBTdG9wd2F0Y2hOb2RlKCBzdG9wd2F0Y2gsIHtcbiAgICBudW1iZXJEaXNwbGF5T3B0aW9uczoge1xuICAgICAgbnVtYmVyRm9ybWF0dGVyOiBTdG9wd2F0Y2hOb2RlLlJJQ0hfVEVYVF9NSU5VVEVTX0FORF9TRUNPTkRTXG4gICAgfSxcbiAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzdG9wd2F0Y2hOb2RlTU1TU2NjJyApXG4gIH0gKTtcblxuICAvLyBTdG9wd2F0Y2hOb2RlIHdpdGggcmljaCB0ZXh0IGZvcm1hdCBhbmQgZHluYW1pYyB1bml0cy5cbiAgY29uc3QgdW5pdHNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggJ21zJyApO1xuICBjb25zdCBudW1iZXJPZkRlY2ltYWxQbGFjZXMgPSAyO1xuICBjb25zdCBjdXN0b21TdG9wd2F0Y2hOb2RlID0gbmV3IFN0b3B3YXRjaE5vZGUoIHN0b3B3YXRjaCwge1xuICAgIGJhY2tncm91bmRCYXNlQ29sb3I6ICdyZWQnLFxuXG4gICAgLy8gU3VwcGx5IHRoZSBmb3JtYXR0ZXIgb24gc3RhcnR1cCBhcyB3ZWxsIGFzIG9uIGxpbmssIHNvIGl0IGNhbiBkZXRlY3Qgd2lkZXN0L3RoaW5uZXN0IHRleHQsIHNlZSBOdW1iZXJEaXNwbGF5XG4gICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcbiAgICAgIG51bWJlckZvcm1hdHRlcjogU3RvcHdhdGNoTm9kZS5jcmVhdGVSaWNoVGV4dE51bWJlckZvcm1hdHRlcigge1xuICAgICAgICBzaG93QXNNaW51dGVzQW5kU2Vjb25kczogZmFsc2UsIC8vIGJlY2F1c2Ugd2UncmUgbm90IHNob3dpbmcgbWludXRlcyAmIHNlY29uZHNcbiAgICAgICAgbnVtYmVyT2ZEZWNpbWFsUGxhY2VzOiBudW1iZXJPZkRlY2ltYWxQbGFjZXMsXG4gICAgICAgIHVuaXRzOiB1bml0c1Byb3BlcnR5LnZhbHVlXG4gICAgICB9ICksXG4gICAgICBudW1iZXJGb3JtYXR0ZXJEZXBlbmRlbmNpZXM6IFtcbiAgICAgICAgU2NlbmVyeVBoZXRTdHJpbmdzLnN0b3B3YXRjaFZhbHVlVW5pdHNQYXR0ZXJuU3RyaW5nUHJvcGVydHksIC8vIHVzZWQgYnkgU3RvcHdhdGNoTm9kZS5jcmVhdGVSaWNoVGV4dE51bWJlckZvcm1hdHRlclxuICAgICAgICB1bml0c1Byb3BlcnR5XG4gICAgICBdXG4gICAgfSxcbiAgICBzY2FsZTogMixcbiAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjdXN0b21TdG9wd2F0Y2hOb2RlJyApXG4gIH0gKTtcblxuICBjb25zdCB1bml0c1JhZGlvQnV0dG9uR3JvdXAgPSBuZXcgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwKCB1bml0c1Byb3BlcnR5LCBbXG4gICAgeyB2YWx1ZTogJ3BzJywgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFRleHQoICdwaWNvc2Vjb25kcycgKSwgdGFuZGVtTmFtZTogJ3BpY29zZWNvbmRzUmFkaW9CdXR0b24nIH0sXG4gICAgeyB2YWx1ZTogJ21zJywgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFRleHQoICdtaWxsaXNlY29uZHMnICksIHRhbmRlbU5hbWU6ICdtaWxsaXNlY29uZHNSYWRpb0J1dHRvbicgfSxcbiAgICB7IHZhbHVlOiAnZnMnLCBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgVGV4dCggJ2ZlbXRvc2Vjb25kcycgKSwgdGFuZGVtTmFtZTogJ2ZlbXRvc2Vjb25kc1JhZGlvQnV0dG9uJyB9XG4gIF0sIHtcbiAgICBzcGFjaW5nOiA1LFxuICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3VuaXRzUmFkaW9CdXR0b25Hcm91cCcgKVxuICB9ICk7XG5cbiAgLy8gTGF5b3V0XG4gIGNvbnN0IHZCb3ggPSBuZXcgVkJveCgge1xuICAgIGFsaWduOiAnbGVmdCcsXG4gICAgc3BhY2luZzogMjAsXG4gICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyLFxuICAgIGNoaWxkcmVuOiBbXG4gICAgICBzdG9wd2F0Y2hOb2RlTU1TU0NDLFxuICAgICAgc3RvcHdhdGNoTm9kZU1NU1NjYyxcbiAgICAgIG5ldyBIQm94KCB7XG4gICAgICAgIHNwYWNpbmc6IDIwLFxuICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgIGN1c3RvbVN0b3B3YXRjaE5vZGUsXG4gICAgICAgICAgdW5pdHNSYWRpb0J1dHRvbkdyb3VwXG4gICAgICAgIF1cbiAgICAgIH0gKVxuICAgIF1cbiAgfSApO1xuXG4gIC8vIFN3YXAgb3V0IHRoZSBkaXNwb3NlIGZ1bmN0aW9uIGZvciBvbmUgdGhhdCBhbHNvIHJlbW92ZXMgdGhlIEVtaXR0ZXIgbGlzdGVuZXJcbiAgY29uc3QgZGVtb0Rpc3Bvc2UgPSB2Qm94LmRpc3Bvc2UuYmluZCggdkJveCApO1xuICB2Qm94LmRpc3Bvc2UgPSAoKSA9PiB7XG4gICAgc3RlcFRpbWVyLnJlbW92ZUxpc3RlbmVyKCBzdGVwTGlzdGVuZXIgKTtcbiAgICBkZW1vRGlzcG9zZSgpO1xuICB9O1xuICByZXR1cm4gdkJveDtcbn0iXSwibmFtZXMiOlsiUHJvcGVydHkiLCJzdGVwVGltZXIiLCJIQm94IiwiVGV4dCIsIlZCb3giLCJSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAiLCJTY2VuZXJ5UGhldFN0cmluZ3MiLCJTdG9wd2F0Y2giLCJTdG9wd2F0Y2hOb2RlIiwiZGVtb1N0b3B3YXRjaE5vZGUiLCJsYXlvdXRCb3VuZHMiLCJwcm92aWRlZE9wdGlvbnMiLCJhc3NlcnQiLCJ0YW5kZW0iLCJzdG9wd2F0Y2giLCJpc1Zpc2libGUiLCJjcmVhdGVUYW5kZW0iLCJzdGVwTGlzdGVuZXIiLCJkdCIsInN0ZXAiLCJhZGRMaXN0ZW5lciIsInN0b3B3YXRjaE5vZGVNTVNTQ0MiLCJudW1iZXJEaXNwbGF5T3B0aW9ucyIsIm51bWJlckZvcm1hdHRlciIsIlBMQUlOX1RFWFRfTUlOVVRFU19BTkRfU0VDT05EUyIsInN0b3B3YXRjaE5vZGVNTVNTY2MiLCJSSUNIX1RFWFRfTUlOVVRFU19BTkRfU0VDT05EUyIsInVuaXRzUHJvcGVydHkiLCJudW1iZXJPZkRlY2ltYWxQbGFjZXMiLCJjdXN0b21TdG9wd2F0Y2hOb2RlIiwiYmFja2dyb3VuZEJhc2VDb2xvciIsImNyZWF0ZVJpY2hUZXh0TnVtYmVyRm9ybWF0dGVyIiwic2hvd0FzTWludXRlc0FuZFNlY29uZHMiLCJ1bml0cyIsInZhbHVlIiwibnVtYmVyRm9ybWF0dGVyRGVwZW5kZW5jaWVzIiwic3RvcHdhdGNoVmFsdWVVbml0c1BhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsInNjYWxlIiwidW5pdHNSYWRpb0J1dHRvbkdyb3VwIiwiY3JlYXRlTm9kZSIsInRhbmRlbU5hbWUiLCJzcGFjaW5nIiwidkJveCIsImFsaWduIiwiY2VudGVyIiwiY2hpbGRyZW4iLCJkZW1vRGlzcG9zZSIsImRpc3Bvc2UiLCJiaW5kIiwicmVtb3ZlTGlzdGVuZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsY0FBYyxrQ0FBa0M7QUFDdkQsT0FBT0MsZUFBZSxtQ0FBbUM7QUFFekQsU0FBU0MsSUFBSSxFQUFRQyxJQUFJLEVBQUVDLElBQUksUUFBUSxvQ0FBb0M7QUFDM0UsT0FBT0MsaUNBQWlDLDREQUE0RDtBQUVwRyxPQUFPQyx3QkFBd0IsOEJBQThCO0FBQzdELE9BQU9DLGVBQWUscUJBQXFCO0FBQzNDLE9BQU9DLG1CQUFtQix5QkFBeUI7QUFFbkQsZUFBZSxTQUFTQyxrQkFBbUJDLFlBQXFCLEVBQUVDLGVBQStCO0lBRS9GQyxVQUFVQSxPQUFRRCxnQkFBZ0JFLE1BQU07SUFDeEMsTUFBTUEsU0FBU0YsZ0JBQWdCRSxNQUFNO0lBRXJDLG1DQUFtQztJQUNuQyxNQUFNQyxZQUFZLElBQUlQLFVBQVc7UUFDL0JRLFdBQVc7UUFDWEYsUUFBUUEsT0FBT0csWUFBWSxDQUFFO0lBQy9CO0lBRUEsTUFBTUMsZUFBZSxDQUFFQyxLQUFnQkosVUFBVUssSUFBSSxDQUFFRDtJQUN2RGpCLFVBQVVtQixXQUFXLENBQUVIO0lBRXZCLGdEQUFnRDtJQUNoRCxNQUFNSSxzQkFBc0IsSUFBSWIsY0FBZU0sV0FBVztRQUN4RFEsc0JBQXNCO1lBQ3BCQyxpQkFBaUJmLGNBQWNnQiw4QkFBOEI7UUFDL0Q7UUFDQVgsUUFBUUEsT0FBT0csWUFBWSxDQUFFO0lBQy9CO0lBRUEsdURBQXVEO0lBQ3ZELE1BQU1TLHNCQUFzQixJQUFJakIsY0FBZU0sV0FBVztRQUN4RFEsc0JBQXNCO1lBQ3BCQyxpQkFBaUJmLGNBQWNrQiw2QkFBNkI7UUFDOUQ7UUFDQWIsUUFBUUEsT0FBT0csWUFBWSxDQUFFO0lBQy9CO0lBRUEseURBQXlEO0lBQ3pELE1BQU1XLGdCQUFnQixJQUFJM0IsU0FBVTtJQUNwQyxNQUFNNEIsd0JBQXdCO0lBQzlCLE1BQU1DLHNCQUFzQixJQUFJckIsY0FBZU0sV0FBVztRQUN4RGdCLHFCQUFxQjtRQUVyQiwrR0FBK0c7UUFDL0dSLHNCQUFzQjtZQUNwQkMsaUJBQWlCZixjQUFjdUIsNkJBQTZCLENBQUU7Z0JBQzVEQyx5QkFBeUI7Z0JBQ3pCSix1QkFBdUJBO2dCQUN2QkssT0FBT04sY0FBY08sS0FBSztZQUM1QjtZQUNBQyw2QkFBNkI7Z0JBQzNCN0IsbUJBQW1COEIsd0NBQXdDO2dCQUMzRFQ7YUFDRDtRQUNIO1FBQ0FVLE9BQU87UUFDUHhCLFFBQVFBLE9BQU9HLFlBQVksQ0FBRTtJQUMvQjtJQUVBLE1BQU1zQix3QkFBd0IsSUFBSWpDLDRCQUE2QnNCLGVBQWU7UUFDNUU7WUFBRU8sT0FBTztZQUFNSyxZQUFZLElBQU0sSUFBSXBDLEtBQU07WUFBaUJxQyxZQUFZO1FBQXlCO1FBQ2pHO1lBQUVOLE9BQU87WUFBTUssWUFBWSxJQUFNLElBQUlwQyxLQUFNO1lBQWtCcUMsWUFBWTtRQUEwQjtRQUNuRztZQUFFTixPQUFPO1lBQU1LLFlBQVksSUFBTSxJQUFJcEMsS0FBTTtZQUFrQnFDLFlBQVk7UUFBMEI7S0FDcEcsRUFBRTtRQUNEQyxTQUFTO1FBQ1Q1QixRQUFRQSxPQUFPRyxZQUFZLENBQUU7SUFDL0I7SUFFQSxTQUFTO0lBQ1QsTUFBTTBCLE9BQU8sSUFBSXRDLEtBQU07UUFDckJ1QyxPQUFPO1FBQ1BGLFNBQVM7UUFDVEcsUUFBUWxDLGFBQWFrQyxNQUFNO1FBQzNCQyxVQUFVO1lBQ1J4QjtZQUNBSTtZQUNBLElBQUl2QixLQUFNO2dCQUNSdUMsU0FBUztnQkFDVEksVUFBVTtvQkFDUmhCO29CQUNBUztpQkFDRDtZQUNIO1NBQ0Q7SUFDSDtJQUVBLCtFQUErRTtJQUMvRSxNQUFNUSxjQUFjSixLQUFLSyxPQUFPLENBQUNDLElBQUksQ0FBRU47SUFDdkNBLEtBQUtLLE9BQU8sR0FBRztRQUNiOUMsVUFBVWdELGNBQWMsQ0FBRWhDO1FBQzFCNkI7SUFDRjtJQUNBLE9BQU9KO0FBQ1QifQ==