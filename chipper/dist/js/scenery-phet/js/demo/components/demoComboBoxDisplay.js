// Copyright 2022, University of Colorado Boulder
/**
 * Creates a demo for ComboBoxDisplay that exercises layout functionality.
 * See https://github.com/phetsims/scenery-phet/issues/482
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import Range from '../../../../dot/js/Range.js';
import { HBox, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import VSlider from '../../../../sun/js/VSlider.js';
import ComboBoxDisplay from '../../ComboBoxDisplay.js';
import PhetFont from '../../PhetFont.js';
export default function demoComboBoxDisplay(layoutBounds) {
    const numberOfDogsProperty = new NumberProperty(0); // value to be displayed for dogs
    const numberOfCatsProperty = new DerivedProperty([
        numberOfDogsProperty
    ], ()=>numberOfDogsProperty.value * 2);
    const choiceProperty = new StringProperty('dogs'); // selected choice in the combo box
    const displayRange = new Range(0, 1000);
    const sliderRange = new Range(0, 1000); // larger than display range, to verify that display scales
    // items in the ComboBoxDisplay
    const items = [
        {
            choice: 'dogs',
            numberProperty: numberOfDogsProperty,
            range: displayRange,
            units: 'dogs'
        },
        {
            choice: 'cats',
            numberProperty: numberOfCatsProperty,
            range: displayRange,
            units: 'cats'
        }
    ];
    // parent for the ComboBoxDisplay's popup list
    const listParent = new Node();
    // ComboBoxDisplay
    const display = new ComboBoxDisplay(choiceProperty, items, listParent, {
        xMargin: 10,
        yMargin: 8,
        highlightFill: 'rgb( 255, 200, 200 )',
        numberDisplayOptions: {
            textOptions: {
                font: new PhetFont(20)
            }
        }
    });
    // Slider
    const slider = new VSlider(numberOfDogsProperty, sliderRange);
    // Slider to left of display
    const hBox = new HBox({
        spacing: 25,
        children: [
            slider,
            display
        ]
    });
    return new Node({
        children: [
            new VBox({
                children: [
                    new Text('There are twice as many cats as dogs in the world.'),
                    hBox
                ],
                spacing: 20,
                center: layoutBounds.center
            }),
            listParent
        ]
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb0NvbWJvQm94RGlzcGxheS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQ3JlYXRlcyBhIGRlbW8gZm9yIENvbWJvQm94RGlzcGxheSB0aGF0IGV4ZXJjaXNlcyBsYXlvdXQgZnVuY3Rpb25hbGl0eS5cbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy80ODJcbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xuaW1wb3J0IFN0cmluZ1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvU3RyaW5nUHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgeyBIQm94LCBOb2RlLCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBWU2xpZGVyIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9WU2xpZGVyLmpzJztcbmltcG9ydCBDb21ib0JveERpc3BsYXkgZnJvbSAnLi4vLi4vQ29tYm9Cb3hEaXNwbGF5LmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi9QaGV0Rm9udC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9Db21ib0JveERpc3BsYXkoIGxheW91dEJvdW5kczogQm91bmRzMiApOiBOb2RlIHtcblxuICBjb25zdCBudW1iZXJPZkRvZ3NQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApOyAvLyB2YWx1ZSB0byBiZSBkaXNwbGF5ZWQgZm9yIGRvZ3NcbiAgY29uc3QgbnVtYmVyT2ZDYXRzUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIG51bWJlck9mRG9nc1Byb3BlcnR5IF0sICgpID0+IG51bWJlck9mRG9nc1Byb3BlcnR5LnZhbHVlICogMiApO1xuICBjb25zdCBjaG9pY2VQcm9wZXJ0eSA9IG5ldyBTdHJpbmdQcm9wZXJ0eSggJ2RvZ3MnICk7ICAvLyBzZWxlY3RlZCBjaG9pY2UgaW4gdGhlIGNvbWJvIGJveFxuICBjb25zdCBkaXNwbGF5UmFuZ2UgPSBuZXcgUmFuZ2UoIDAsIDEwMDAgKTtcbiAgY29uc3Qgc2xpZGVyUmFuZ2UgPSBuZXcgUmFuZ2UoIDAsIDEwMDAgKTsgLy8gbGFyZ2VyIHRoYW4gZGlzcGxheSByYW5nZSwgdG8gdmVyaWZ5IHRoYXQgZGlzcGxheSBzY2FsZXNcblxuICAvLyBpdGVtcyBpbiB0aGUgQ29tYm9Cb3hEaXNwbGF5XG4gIGNvbnN0IGl0ZW1zID0gW1xuICAgIHsgY2hvaWNlOiAnZG9ncycsIG51bWJlclByb3BlcnR5OiBudW1iZXJPZkRvZ3NQcm9wZXJ0eSwgcmFuZ2U6IGRpc3BsYXlSYW5nZSwgdW5pdHM6ICdkb2dzJyB9LFxuICAgIHsgY2hvaWNlOiAnY2F0cycsIG51bWJlclByb3BlcnR5OiBudW1iZXJPZkNhdHNQcm9wZXJ0eSwgcmFuZ2U6IGRpc3BsYXlSYW5nZSwgdW5pdHM6ICdjYXRzJyB9XG4gIF07XG5cbiAgLy8gcGFyZW50IGZvciB0aGUgQ29tYm9Cb3hEaXNwbGF5J3MgcG9wdXAgbGlzdFxuICBjb25zdCBsaXN0UGFyZW50ID0gbmV3IE5vZGUoKTtcblxuICAvLyBDb21ib0JveERpc3BsYXlcbiAgY29uc3QgZGlzcGxheSA9IG5ldyBDb21ib0JveERpc3BsYXk8c3RyaW5nPiggY2hvaWNlUHJvcGVydHksIGl0ZW1zLCBsaXN0UGFyZW50LCB7XG4gICAgeE1hcmdpbjogMTAsXG4gICAgeU1hcmdpbjogOCxcbiAgICBoaWdobGlnaHRGaWxsOiAncmdiKCAyNTUsIDIwMCwgMjAwICknLCAvLyBwaW5rXG4gICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcbiAgICAgIHRleHRPcHRpb25zOiB7XG4gICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMjAgKVxuICAgICAgfVxuICAgIH1cbiAgfSApO1xuXG4gIC8vIFNsaWRlclxuICBjb25zdCBzbGlkZXIgPSBuZXcgVlNsaWRlciggbnVtYmVyT2ZEb2dzUHJvcGVydHksIHNsaWRlclJhbmdlICk7XG5cbiAgLy8gU2xpZGVyIHRvIGxlZnQgb2YgZGlzcGxheVxuICBjb25zdCBoQm94ID0gbmV3IEhCb3goIHtcbiAgICBzcGFjaW5nOiAyNSxcbiAgICBjaGlsZHJlbjogWyBzbGlkZXIsIGRpc3BsYXkgXVxuICB9ICk7XG5cbiAgcmV0dXJuIG5ldyBOb2RlKCB7XG4gICAgY2hpbGRyZW46IFsgbmV3IFZCb3goIHtcbiAgICAgIGNoaWxkcmVuOiBbIG5ldyBUZXh0KCAnVGhlcmUgYXJlIHR3aWNlIGFzIG1hbnkgY2F0cyBhcyBkb2dzIGluIHRoZSB3b3JsZC4nICksIGhCb3ggXSxcbiAgICAgIHNwYWNpbmc6IDIwLFxuICAgICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyXG4gICAgfSApLCBsaXN0UGFyZW50IF1cbiAgfSApO1xufSJdLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlN0cmluZ1Byb3BlcnR5IiwiUmFuZ2UiLCJIQm94IiwiTm9kZSIsIlRleHQiLCJWQm94IiwiVlNsaWRlciIsIkNvbWJvQm94RGlzcGxheSIsIlBoZXRGb250IiwiZGVtb0NvbWJvQm94RGlzcGxheSIsImxheW91dEJvdW5kcyIsIm51bWJlck9mRG9nc1Byb3BlcnR5IiwibnVtYmVyT2ZDYXRzUHJvcGVydHkiLCJ2YWx1ZSIsImNob2ljZVByb3BlcnR5IiwiZGlzcGxheVJhbmdlIiwic2xpZGVyUmFuZ2UiLCJpdGVtcyIsImNob2ljZSIsIm51bWJlclByb3BlcnR5IiwicmFuZ2UiLCJ1bml0cyIsImxpc3RQYXJlbnQiLCJkaXNwbGF5IiwieE1hcmdpbiIsInlNYXJnaW4iLCJoaWdobGlnaHRGaWxsIiwibnVtYmVyRGlzcGxheU9wdGlvbnMiLCJ0ZXh0T3B0aW9ucyIsImZvbnQiLCJzbGlkZXIiLCJoQm94Iiwic3BhY2luZyIsImNoaWxkcmVuIiwiY2VudGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxxQkFBcUIseUNBQXlDO0FBQ3JFLE9BQU9DLG9CQUFvQix3Q0FBd0M7QUFDbkUsT0FBT0Msb0JBQW9CLHdDQUF3QztBQUVuRSxPQUFPQyxXQUFXLDhCQUE4QjtBQUNoRCxTQUFTQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsb0NBQW9DO0FBQzNFLE9BQU9DLGFBQWEsZ0NBQWdDO0FBQ3BELE9BQU9DLHFCQUFxQiwyQkFBMkI7QUFDdkQsT0FBT0MsY0FBYyxvQkFBb0I7QUFFekMsZUFBZSxTQUFTQyxvQkFBcUJDLFlBQXFCO0lBRWhFLE1BQU1DLHVCQUF1QixJQUFJWixlQUFnQixJQUFLLGlDQUFpQztJQUN2RixNQUFNYSx1QkFBdUIsSUFBSWQsZ0JBQWlCO1FBQUVhO0tBQXNCLEVBQUUsSUFBTUEscUJBQXFCRSxLQUFLLEdBQUc7SUFDL0csTUFBTUMsaUJBQWlCLElBQUlkLGVBQWdCLFNBQVcsbUNBQW1DO0lBQ3pGLE1BQU1lLGVBQWUsSUFBSWQsTUFBTyxHQUFHO0lBQ25DLE1BQU1lLGNBQWMsSUFBSWYsTUFBTyxHQUFHLE9BQVEsMkRBQTJEO0lBRXJHLCtCQUErQjtJQUMvQixNQUFNZ0IsUUFBUTtRQUNaO1lBQUVDLFFBQVE7WUFBUUMsZ0JBQWdCUjtZQUFzQlMsT0FBT0w7WUFBY00sT0FBTztRQUFPO1FBQzNGO1lBQUVILFFBQVE7WUFBUUMsZ0JBQWdCUDtZQUFzQlEsT0FBT0w7WUFBY00sT0FBTztRQUFPO0tBQzVGO0lBRUQsOENBQThDO0lBQzlDLE1BQU1DLGFBQWEsSUFBSW5CO0lBRXZCLGtCQUFrQjtJQUNsQixNQUFNb0IsVUFBVSxJQUFJaEIsZ0JBQXlCTyxnQkFBZ0JHLE9BQU9LLFlBQVk7UUFDOUVFLFNBQVM7UUFDVEMsU0FBUztRQUNUQyxlQUFlO1FBQ2ZDLHNCQUFzQjtZQUNwQkMsYUFBYTtnQkFDWEMsTUFBTSxJQUFJckIsU0FBVTtZQUN0QjtRQUNGO0lBQ0Y7SUFFQSxTQUFTO0lBQ1QsTUFBTXNCLFNBQVMsSUFBSXhCLFFBQVNLLHNCQUFzQks7SUFFbEQsNEJBQTRCO0lBQzVCLE1BQU1lLE9BQU8sSUFBSTdCLEtBQU07UUFDckI4QixTQUFTO1FBQ1RDLFVBQVU7WUFBRUg7WUFBUVA7U0FBUztJQUMvQjtJQUVBLE9BQU8sSUFBSXBCLEtBQU07UUFDZjhCLFVBQVU7WUFBRSxJQUFJNUIsS0FBTTtnQkFDcEI0QixVQUFVO29CQUFFLElBQUk3QixLQUFNO29CQUF3RDJCO2lCQUFNO2dCQUNwRkMsU0FBUztnQkFDVEUsUUFBUXhCLGFBQWF3QixNQUFNO1lBQzdCO1lBQUtaO1NBQVk7SUFDbkI7QUFDRiJ9