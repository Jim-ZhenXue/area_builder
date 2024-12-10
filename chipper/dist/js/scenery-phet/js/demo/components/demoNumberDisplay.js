// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for NumberDisplay
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import { VBox } from '../../../../scenery/js/imports.js';
import HSlider from '../../../../sun/js/HSlider.js';
import NumberDisplay from '../../NumberDisplay.js';
import SceneryPhetStrings from '../../SceneryPhetStrings.js';
import StopwatchNode from '../../StopwatchNode.js';
export default function demoNumberDisplay(layoutBounds) {
    const range = new Range(0, 1000);
    // Options for both NumberDisplay instances
    const numberDisplayOptions = {
        valuePattern: '{{value}} K',
        align: 'right'
    };
    // To demonstrate 'no value' options
    const noValueDisplay = new NumberDisplay(new Property(null), range, combineOptions({}, numberDisplayOptions, {
        noValueAlign: 'center',
        noValuePattern: '{{value}}'
    }));
    // To demonstrate numeric value display
    const property = new NumberProperty(1);
    const numberDisplay = new NumberDisplay(property, range, numberDisplayOptions);
    const numberDisplayTime = new NumberDisplay(property, range, {
        numberFormatter: StopwatchNode.PLAIN_TEXT_MINUTES_AND_SECONDS,
        align: 'center'
    });
    const numberDisplayTimeRich = new NumberDisplay(property, range, {
        numberFormatter: StopwatchNode.RICH_TEXT_MINUTES_AND_SECONDS,
        numberFormatterDependencies: [
            SceneryPhetStrings.stopwatchValueUnitsPatternStringProperty
        ],
        useRichText: true,
        align: 'center'
    });
    // Test shrinking to fit
    const numberDisplayTimeRichUnits = new NumberDisplay(property, new Range(0, 10), {
        numberFormatter: StopwatchNode.createRichTextNumberFormatter({
            units: 'hours'
        }),
        numberFormatterDependencies: [
            SceneryPhetStrings.stopwatchValueUnitsPatternStringProperty
        ],
        useRichText: true,
        align: 'center'
    });
    const slider = new HSlider(property, range, {
        trackSize: new Dimension2(400, 5)
    });
    return new VBox({
        spacing: 30,
        children: [
            noValueDisplay,
            numberDisplay,
            numberDisplayTime,
            numberDisplayTimeRich,
            numberDisplayTimeRichUnits,
            slider
        ],
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb051bWJlckRpc3BsYXkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVtbyBmb3IgTnVtYmVyRGlzcGxheVxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHsgTm9kZSwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgSFNsaWRlciBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvSFNsaWRlci5qcyc7XG5pbXBvcnQgTnVtYmVyRGlzcGxheSwgeyBOdW1iZXJEaXNwbGF5T3B0aW9ucyB9IGZyb20gJy4uLy4uL051bWJlckRpc3BsYXkuanMnO1xuaW1wb3J0IFNjZW5lcnlQaGV0U3RyaW5ncyBmcm9tICcuLi8uLi9TY2VuZXJ5UGhldFN0cmluZ3MuanMnO1xuaW1wb3J0IFN0b3B3YXRjaE5vZGUgZnJvbSAnLi4vLi4vU3RvcHdhdGNoTm9kZS5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9OdW1iZXJEaXNwbGF5KCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XG5cbiAgY29uc3QgcmFuZ2UgPSBuZXcgUmFuZ2UoIDAsIDEwMDAgKTtcblxuICAvLyBPcHRpb25zIGZvciBib3RoIE51bWJlckRpc3BsYXkgaW5zdGFuY2VzXG4gIGNvbnN0IG51bWJlckRpc3BsYXlPcHRpb25zOiBOdW1iZXJEaXNwbGF5T3B0aW9ucyA9IHtcbiAgICB2YWx1ZVBhdHRlcm46ICd7e3ZhbHVlfX0gSycsXG4gICAgYWxpZ246ICdyaWdodCdcbiAgfTtcblxuICAvLyBUbyBkZW1vbnN0cmF0ZSAnbm8gdmFsdWUnIG9wdGlvbnNcbiAgY29uc3Qgbm9WYWx1ZURpc3BsYXkgPSBuZXcgTnVtYmVyRGlzcGxheSggbmV3IFByb3BlcnR5KCBudWxsICksIHJhbmdlLFxuICAgIGNvbWJpbmVPcHRpb25zPE51bWJlckRpc3BsYXlPcHRpb25zPigge30sIG51bWJlckRpc3BsYXlPcHRpb25zLCB7XG4gICAgICBub1ZhbHVlQWxpZ246ICdjZW50ZXInLFxuICAgICAgbm9WYWx1ZVBhdHRlcm46ICd7e3ZhbHVlfX0nXG4gICAgfSApICk7XG5cbiAgLy8gVG8gZGVtb25zdHJhdGUgbnVtZXJpYyB2YWx1ZSBkaXNwbGF5XG4gIGNvbnN0IHByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAxICk7XG5cbiAgY29uc3QgbnVtYmVyRGlzcGxheSA9IG5ldyBOdW1iZXJEaXNwbGF5KCBwcm9wZXJ0eSwgcmFuZ2UsIG51bWJlckRpc3BsYXlPcHRpb25zICk7XG4gIGNvbnN0IG51bWJlckRpc3BsYXlUaW1lID0gbmV3IE51bWJlckRpc3BsYXkoIHByb3BlcnR5LCByYW5nZSwge1xuICAgIG51bWJlckZvcm1hdHRlcjogU3RvcHdhdGNoTm9kZS5QTEFJTl9URVhUX01JTlVURVNfQU5EX1NFQ09ORFMsXG4gICAgYWxpZ246ICdjZW50ZXInXG4gIH0gKTtcbiAgY29uc3QgbnVtYmVyRGlzcGxheVRpbWVSaWNoID0gbmV3IE51bWJlckRpc3BsYXkoIHByb3BlcnR5LCByYW5nZSwge1xuICAgIG51bWJlckZvcm1hdHRlcjogU3RvcHdhdGNoTm9kZS5SSUNIX1RFWFRfTUlOVVRFU19BTkRfU0VDT05EUyxcbiAgICBudW1iZXJGb3JtYXR0ZXJEZXBlbmRlbmNpZXM6IFsgU2NlbmVyeVBoZXRTdHJpbmdzLnN0b3B3YXRjaFZhbHVlVW5pdHNQYXR0ZXJuU3RyaW5nUHJvcGVydHkgXSxcbiAgICB1c2VSaWNoVGV4dDogdHJ1ZSxcbiAgICBhbGlnbjogJ2NlbnRlcidcbiAgfSApO1xuXG4gIC8vIFRlc3Qgc2hyaW5raW5nIHRvIGZpdFxuICBjb25zdCBudW1iZXJEaXNwbGF5VGltZVJpY2hVbml0cyA9IG5ldyBOdW1iZXJEaXNwbGF5KCBwcm9wZXJ0eSwgbmV3IFJhbmdlKCAwLCAxMCApLCB7XG4gICAgbnVtYmVyRm9ybWF0dGVyOiBTdG9wd2F0Y2hOb2RlLmNyZWF0ZVJpY2hUZXh0TnVtYmVyRm9ybWF0dGVyKCB7XG4gICAgICB1bml0czogJ2hvdXJzJ1xuICAgIH0gKSxcbiAgICBudW1iZXJGb3JtYXR0ZXJEZXBlbmRlbmNpZXM6IFsgU2NlbmVyeVBoZXRTdHJpbmdzLnN0b3B3YXRjaFZhbHVlVW5pdHNQYXR0ZXJuU3RyaW5nUHJvcGVydHkgXSxcbiAgICB1c2VSaWNoVGV4dDogdHJ1ZSxcbiAgICBhbGlnbjogJ2NlbnRlcidcbiAgfSApO1xuICBjb25zdCBzbGlkZXIgPSBuZXcgSFNsaWRlciggcHJvcGVydHksIHJhbmdlLCB7XG4gICAgdHJhY2tTaXplOiBuZXcgRGltZW5zaW9uMiggNDAwLCA1IClcbiAgfSApO1xuXG4gIHJldHVybiBuZXcgVkJveCgge1xuICAgIHNwYWNpbmc6IDMwLFxuICAgIGNoaWxkcmVuOiBbIG5vVmFsdWVEaXNwbGF5LCBudW1iZXJEaXNwbGF5LCBudW1iZXJEaXNwbGF5VGltZSwgbnVtYmVyRGlzcGxheVRpbWVSaWNoLCBudW1iZXJEaXNwbGF5VGltZVJpY2hVbml0cywgc2xpZGVyIF0sXG4gICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyXG4gIH0gKTtcbn0iXSwibmFtZXMiOlsiTnVtYmVyUHJvcGVydHkiLCJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJSYW5nZSIsImNvbWJpbmVPcHRpb25zIiwiVkJveCIsIkhTbGlkZXIiLCJOdW1iZXJEaXNwbGF5IiwiU2NlbmVyeVBoZXRTdHJpbmdzIiwiU3RvcHdhdGNoTm9kZSIsImRlbW9OdW1iZXJEaXNwbGF5IiwibGF5b3V0Qm91bmRzIiwicmFuZ2UiLCJudW1iZXJEaXNwbGF5T3B0aW9ucyIsInZhbHVlUGF0dGVybiIsImFsaWduIiwibm9WYWx1ZURpc3BsYXkiLCJub1ZhbHVlQWxpZ24iLCJub1ZhbHVlUGF0dGVybiIsInByb3BlcnR5IiwibnVtYmVyRGlzcGxheSIsIm51bWJlckRpc3BsYXlUaW1lIiwibnVtYmVyRm9ybWF0dGVyIiwiUExBSU5fVEVYVF9NSU5VVEVTX0FORF9TRUNPTkRTIiwibnVtYmVyRGlzcGxheVRpbWVSaWNoIiwiUklDSF9URVhUX01JTlVURVNfQU5EX1NFQ09ORFMiLCJudW1iZXJGb3JtYXR0ZXJEZXBlbmRlbmNpZXMiLCJzdG9wd2F0Y2hWYWx1ZVVuaXRzUGF0dGVyblN0cmluZ1Byb3BlcnR5IiwidXNlUmljaFRleHQiLCJudW1iZXJEaXNwbGF5VGltZVJpY2hVbml0cyIsImNyZWF0ZVJpY2hUZXh0TnVtYmVyRm9ybWF0dGVyIiwidW5pdHMiLCJzbGlkZXIiLCJ0cmFja1NpemUiLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJjZW50ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0Esb0JBQW9CLHdDQUF3QztBQUNuRSxPQUFPQyxjQUFjLGtDQUFrQztBQUV2RCxPQUFPQyxnQkFBZ0IsbUNBQW1DO0FBQzFELE9BQU9DLFdBQVcsOEJBQThCO0FBQ2hELFNBQVNDLGNBQWMsUUFBUSx3Q0FBd0M7QUFDdkUsU0FBZUMsSUFBSSxRQUFRLG9DQUFvQztBQUMvRCxPQUFPQyxhQUFhLGdDQUFnQztBQUNwRCxPQUFPQyxtQkFBNkMseUJBQXlCO0FBQzdFLE9BQU9DLHdCQUF3Qiw4QkFBOEI7QUFDN0QsT0FBT0MsbUJBQW1CLHlCQUF5QjtBQUVuRCxlQUFlLFNBQVNDLGtCQUFtQkMsWUFBcUI7SUFFOUQsTUFBTUMsUUFBUSxJQUFJVCxNQUFPLEdBQUc7SUFFNUIsMkNBQTJDO0lBQzNDLE1BQU1VLHVCQUE2QztRQUNqREMsY0FBYztRQUNkQyxPQUFPO0lBQ1Q7SUFFQSxvQ0FBb0M7SUFDcEMsTUFBTUMsaUJBQWlCLElBQUlULGNBQWUsSUFBSU4sU0FBVSxPQUFRVyxPQUM5RFIsZUFBc0MsQ0FBQyxHQUFHUyxzQkFBc0I7UUFDOURJLGNBQWM7UUFDZEMsZ0JBQWdCO0lBQ2xCO0lBRUYsdUNBQXVDO0lBQ3ZDLE1BQU1DLFdBQVcsSUFBSW5CLGVBQWdCO0lBRXJDLE1BQU1vQixnQkFBZ0IsSUFBSWIsY0FBZVksVUFBVVAsT0FBT0M7SUFDMUQsTUFBTVEsb0JBQW9CLElBQUlkLGNBQWVZLFVBQVVQLE9BQU87UUFDNURVLGlCQUFpQmIsY0FBY2MsOEJBQThCO1FBQzdEUixPQUFPO0lBQ1Q7SUFDQSxNQUFNUyx3QkFBd0IsSUFBSWpCLGNBQWVZLFVBQVVQLE9BQU87UUFDaEVVLGlCQUFpQmIsY0FBY2dCLDZCQUE2QjtRQUM1REMsNkJBQTZCO1lBQUVsQixtQkFBbUJtQix3Q0FBd0M7U0FBRTtRQUM1RkMsYUFBYTtRQUNiYixPQUFPO0lBQ1Q7SUFFQSx3QkFBd0I7SUFDeEIsTUFBTWMsNkJBQTZCLElBQUl0QixjQUFlWSxVQUFVLElBQUloQixNQUFPLEdBQUcsS0FBTTtRQUNsRm1CLGlCQUFpQmIsY0FBY3FCLDZCQUE2QixDQUFFO1lBQzVEQyxPQUFPO1FBQ1Q7UUFDQUwsNkJBQTZCO1lBQUVsQixtQkFBbUJtQix3Q0FBd0M7U0FBRTtRQUM1RkMsYUFBYTtRQUNiYixPQUFPO0lBQ1Q7SUFDQSxNQUFNaUIsU0FBUyxJQUFJMUIsUUFBU2EsVUFBVVAsT0FBTztRQUMzQ3FCLFdBQVcsSUFBSS9CLFdBQVksS0FBSztJQUNsQztJQUVBLE9BQU8sSUFBSUcsS0FBTTtRQUNmNkIsU0FBUztRQUNUQyxVQUFVO1lBQUVuQjtZQUFnQkk7WUFBZUM7WUFBbUJHO1lBQXVCSztZQUE0Qkc7U0FBUTtRQUN6SEksUUFBUXpCLGFBQWF5QixNQUFNO0lBQzdCO0FBQ0YifQ==