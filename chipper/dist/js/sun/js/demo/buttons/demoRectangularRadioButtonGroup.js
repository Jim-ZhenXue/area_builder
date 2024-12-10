// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for AquaRadioButtonGroup
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import StringProperty from '../../../../axon/js/StringProperty.js';
import { Font, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../buttons/RectangularRadioButtonGroup.js';
export default function demoRectangularRadioButtonGroup(layoutBounds) {
    const font = new Font({
        size: 20
    });
    const horizontalChoices = [
        'left',
        'center',
        'right'
    ];
    const horizontalProperty = new StringProperty(horizontalChoices[0]);
    const horizontalItems = _.map(horizontalChoices, (choice)=>{
        return {
            createNode: ()=>new Text(choice, {
                    font: font
                }),
            value: choice
        };
    });
    const horizontalGroup = new RectangularRadioButtonGroup(horizontalProperty, horizontalItems, {
        orientation: 'horizontal'
    });
    const verticalChoices = [
        'top',
        'center',
        'bottom'
    ];
    const verticalProperty = new StringProperty(verticalChoices[0]);
    const verticalItems = _.map(verticalChoices, (choice)=>{
        return {
            createNode: ()=>new Text(choice, {
                    font: font
                }),
            value: choice
        };
    });
    const verticalGroup = new RectangularRadioButtonGroup(verticalProperty, verticalItems, {
        orientation: 'vertical'
    });
    return new VBox({
        children: [
            horizontalGroup,
            verticalGroup
        ],
        spacing: 80,
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL2J1dHRvbnMvZGVtb1JlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZW1vIGZvciBBcXVhUmFkaW9CdXR0b25Hcm91cFxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IFN0cmluZ1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvU3RyaW5nUHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IHsgRm9udCwgTm9kZSwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwIGZyb20gJy4uLy4uL2J1dHRvbnMvUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVtb1JlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICk6IE5vZGUge1xuXG4gIGNvbnN0IGZvbnQgPSBuZXcgRm9udCggeyBzaXplOiAyMCB9ICk7XG5cbiAgY29uc3QgaG9yaXpvbnRhbENob2ljZXMgPSBbICdsZWZ0JywgJ2NlbnRlcicsICdyaWdodCcgXTtcbiAgY29uc3QgaG9yaXpvbnRhbFByb3BlcnR5ID0gbmV3IFN0cmluZ1Byb3BlcnR5KCBob3Jpem9udGFsQ2hvaWNlc1sgMCBdICk7XG4gIGNvbnN0IGhvcml6b250YWxJdGVtcyA9IF8ubWFwKCBob3Jpem9udGFsQ2hvaWNlcyxcbiAgICBjaG9pY2UgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFRleHQoIGNob2ljZSwgeyBmb250OiBmb250IH0gKSxcbiAgICAgICAgdmFsdWU6IGNob2ljZVxuICAgICAgfTtcbiAgICB9ICk7XG4gIGNvbnN0IGhvcml6b250YWxHcm91cCA9IG5ldyBSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAoIGhvcml6b250YWxQcm9wZXJ0eSwgaG9yaXpvbnRhbEl0ZW1zLCB7XG4gICAgb3JpZW50YXRpb246ICdob3Jpem9udGFsJ1xuICB9ICk7XG5cbiAgY29uc3QgdmVydGljYWxDaG9pY2VzID0gWyAndG9wJywgJ2NlbnRlcicsICdib3R0b20nIF07XG4gIGNvbnN0IHZlcnRpY2FsUHJvcGVydHkgPSBuZXcgU3RyaW5nUHJvcGVydHkoIHZlcnRpY2FsQ2hvaWNlc1sgMCBdICk7XG4gIGNvbnN0IHZlcnRpY2FsSXRlbXMgPSBfLm1hcCggdmVydGljYWxDaG9pY2VzLFxuICAgIGNob2ljZSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgVGV4dCggY2hvaWNlLCB7IGZvbnQ6IGZvbnQgfSApLFxuICAgICAgICB2YWx1ZTogY2hvaWNlXG4gICAgICB9O1xuICAgIH0gKTtcbiAgY29uc3QgdmVydGljYWxHcm91cCA9IG5ldyBSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAoIHZlcnRpY2FsUHJvcGVydHksIHZlcnRpY2FsSXRlbXMsIHtcbiAgICBvcmllbnRhdGlvbjogJ3ZlcnRpY2FsJ1xuICB9ICk7XG5cbiAgcmV0dXJuIG5ldyBWQm94KCB7XG4gICAgY2hpbGRyZW46IFsgaG9yaXpvbnRhbEdyb3VwLCB2ZXJ0aWNhbEdyb3VwIF0sXG4gICAgc3BhY2luZzogODAsXG4gICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyXG4gIH0gKTtcbn0iXSwibmFtZXMiOlsiU3RyaW5nUHJvcGVydHkiLCJGb250IiwiVGV4dCIsIlZCb3giLCJSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAiLCJkZW1vUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwIiwibGF5b3V0Qm91bmRzIiwiZm9udCIsInNpemUiLCJob3Jpem9udGFsQ2hvaWNlcyIsImhvcml6b250YWxQcm9wZXJ0eSIsImhvcml6b250YWxJdGVtcyIsIl8iLCJtYXAiLCJjaG9pY2UiLCJjcmVhdGVOb2RlIiwidmFsdWUiLCJob3Jpem9udGFsR3JvdXAiLCJvcmllbnRhdGlvbiIsInZlcnRpY2FsQ2hvaWNlcyIsInZlcnRpY2FsUHJvcGVydHkiLCJ2ZXJ0aWNhbEl0ZW1zIiwidmVydGljYWxHcm91cCIsImNoaWxkcmVuIiwic3BhY2luZyIsImNlbnRlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxvQkFBb0Isd0NBQXdDO0FBRW5FLFNBQVNDLElBQUksRUFBUUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsb0NBQW9DO0FBQzNFLE9BQU9DLGlDQUFpQywrQ0FBK0M7QUFFdkYsZUFBZSxTQUFTQyxnQ0FBaUNDLFlBQXFCO0lBRTVFLE1BQU1DLE9BQU8sSUFBSU4sS0FBTTtRQUFFTyxNQUFNO0lBQUc7SUFFbEMsTUFBTUMsb0JBQW9CO1FBQUU7UUFBUTtRQUFVO0tBQVM7SUFDdkQsTUFBTUMscUJBQXFCLElBQUlWLGVBQWdCUyxpQkFBaUIsQ0FBRSxFQUFHO0lBQ3JFLE1BQU1FLGtCQUFrQkMsRUFBRUMsR0FBRyxDQUFFSixtQkFDN0JLLENBQUFBO1FBQ0UsT0FBTztZQUNMQyxZQUFZLElBQU0sSUFBSWIsS0FBTVksUUFBUTtvQkFBRVAsTUFBTUE7Z0JBQUs7WUFDakRTLE9BQU9GO1FBQ1Q7SUFDRjtJQUNGLE1BQU1HLGtCQUFrQixJQUFJYiw0QkFBNkJNLG9CQUFvQkMsaUJBQWlCO1FBQzVGTyxhQUFhO0lBQ2Y7SUFFQSxNQUFNQyxrQkFBa0I7UUFBRTtRQUFPO1FBQVU7S0FBVTtJQUNyRCxNQUFNQyxtQkFBbUIsSUFBSXBCLGVBQWdCbUIsZUFBZSxDQUFFLEVBQUc7SUFDakUsTUFBTUUsZ0JBQWdCVCxFQUFFQyxHQUFHLENBQUVNLGlCQUMzQkwsQ0FBQUE7UUFDRSxPQUFPO1lBQ0xDLFlBQVksSUFBTSxJQUFJYixLQUFNWSxRQUFRO29CQUFFUCxNQUFNQTtnQkFBSztZQUNqRFMsT0FBT0Y7UUFDVDtJQUNGO0lBQ0YsTUFBTVEsZ0JBQWdCLElBQUlsQiw0QkFBNkJnQixrQkFBa0JDLGVBQWU7UUFDdEZILGFBQWE7SUFDZjtJQUVBLE9BQU8sSUFBSWYsS0FBTTtRQUNmb0IsVUFBVTtZQUFFTjtZQUFpQks7U0FBZTtRQUM1Q0UsU0FBUztRQUNUQyxRQUFRbkIsYUFBYW1CLE1BQU07SUFDN0I7QUFDRiJ9