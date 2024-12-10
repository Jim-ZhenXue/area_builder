// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for AquaRadioButtonGroup
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import StringProperty from '../../../../axon/js/StringProperty.js';
import { Font, Text, VBox } from '../../../../scenery/js/imports.js';
import AquaRadioButtonGroup from '../../AquaRadioButtonGroup.js';
export default function demoAquaRadioButtonGroup(layoutBounds) {
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
    const horizontalGroup = new AquaRadioButtonGroup(horizontalProperty, horizontalItems, {
        orientation: 'horizontal',
        spacing: 20
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
            value: choice,
            options: {
                accessibleName: choice
            }
        };
    });
    const verticalGroup = new AquaRadioButtonGroup(verticalProperty, verticalItems, {
        orientation: 'vertical',
        // pdom
        accessibleName: 'Vertical AquaRadioButtonGroup',
        helpText: 'This is a description of the vertical AquaRadioButtonGroup.'
    });
    // pdom - context response for the changing value
    verticalProperty.link((value)=>{
        verticalGroup.alertDescriptionUtterance(`The value of the group changed to ${value}.`);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL2J1dHRvbnMvZGVtb0FxdWFSYWRpb0J1dHRvbkdyb3VwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERlbW8gZm9yIEFxdWFSYWRpb0J1dHRvbkdyb3VwXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9TdHJpbmdQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgeyBGb250LCBOb2RlLCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBBcXVhUmFkaW9CdXR0b25Hcm91cCBmcm9tICcuLi8uLi9BcXVhUmFkaW9CdXR0b25Hcm91cC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9BcXVhUmFkaW9CdXR0b25Hcm91cCggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICk6IE5vZGUge1xuXG4gIGNvbnN0IGZvbnQgPSBuZXcgRm9udCggeyBzaXplOiAyMCB9ICk7XG5cbiAgY29uc3QgaG9yaXpvbnRhbENob2ljZXMgPSBbICdsZWZ0JywgJ2NlbnRlcicsICdyaWdodCcgXTtcbiAgY29uc3QgaG9yaXpvbnRhbFByb3BlcnR5ID0gbmV3IFN0cmluZ1Byb3BlcnR5KCBob3Jpem9udGFsQ2hvaWNlc1sgMCBdICk7XG4gIGNvbnN0IGhvcml6b250YWxJdGVtcyA9IF8ubWFwKCBob3Jpem9udGFsQ2hvaWNlcyxcbiAgICBjaG9pY2UgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFRleHQoIGNob2ljZSwgeyBmb250OiBmb250IH0gKSxcbiAgICAgICAgdmFsdWU6IGNob2ljZVxuICAgICAgfTtcbiAgICB9ICk7XG4gIGNvbnN0IGhvcml6b250YWxHcm91cCA9IG5ldyBBcXVhUmFkaW9CdXR0b25Hcm91cCggaG9yaXpvbnRhbFByb3BlcnR5LCBob3Jpem9udGFsSXRlbXMsIHtcbiAgICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLFxuICAgIHNwYWNpbmc6IDIwXG4gIH0gKTtcblxuICBjb25zdCB2ZXJ0aWNhbENob2ljZXMgPSBbICd0b3AnLCAnY2VudGVyJywgJ2JvdHRvbScgXTtcbiAgY29uc3QgdmVydGljYWxQcm9wZXJ0eSA9IG5ldyBTdHJpbmdQcm9wZXJ0eSggdmVydGljYWxDaG9pY2VzWyAwIF0gKTtcbiAgY29uc3QgdmVydGljYWxJdGVtcyA9IF8ubWFwKCB2ZXJ0aWNhbENob2ljZXMsXG4gICAgY2hvaWNlID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBUZXh0KCBjaG9pY2UsIHsgZm9udDogZm9udCB9ICksXG4gICAgICAgIHZhbHVlOiBjaG9pY2UsXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICBhY2Nlc3NpYmxlTmFtZTogY2hvaWNlXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSApO1xuICBjb25zdCB2ZXJ0aWNhbEdyb3VwID0gbmV3IEFxdWFSYWRpb0J1dHRvbkdyb3VwKCB2ZXJ0aWNhbFByb3BlcnR5LCB2ZXJ0aWNhbEl0ZW1zLCB7XG4gICAgb3JpZW50YXRpb246ICd2ZXJ0aWNhbCcsXG5cbiAgICAvLyBwZG9tXG4gICAgYWNjZXNzaWJsZU5hbWU6ICdWZXJ0aWNhbCBBcXVhUmFkaW9CdXR0b25Hcm91cCcsXG4gICAgaGVscFRleHQ6ICdUaGlzIGlzIGEgZGVzY3JpcHRpb24gb2YgdGhlIHZlcnRpY2FsIEFxdWFSYWRpb0J1dHRvbkdyb3VwLidcbiAgfSApO1xuXG4gIC8vIHBkb20gLSBjb250ZXh0IHJlc3BvbnNlIGZvciB0aGUgY2hhbmdpbmcgdmFsdWVcbiAgdmVydGljYWxQcm9wZXJ0eS5saW5rKCB2YWx1ZSA9PiB7XG4gICAgdmVydGljYWxHcm91cC5hbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlKCBgVGhlIHZhbHVlIG9mIHRoZSBncm91cCBjaGFuZ2VkIHRvICR7dmFsdWV9LmAgKTtcbiAgfSApO1xuXG4gIHJldHVybiBuZXcgVkJveCgge1xuICAgIGNoaWxkcmVuOiBbIGhvcml6b250YWxHcm91cCwgdmVydGljYWxHcm91cCBdLFxuICAgIHNwYWNpbmc6IDgwLFxuICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlclxuICB9ICk7XG59Il0sIm5hbWVzIjpbIlN0cmluZ1Byb3BlcnR5IiwiRm9udCIsIlRleHQiLCJWQm94IiwiQXF1YVJhZGlvQnV0dG9uR3JvdXAiLCJkZW1vQXF1YVJhZGlvQnV0dG9uR3JvdXAiLCJsYXlvdXRCb3VuZHMiLCJmb250Iiwic2l6ZSIsImhvcml6b250YWxDaG9pY2VzIiwiaG9yaXpvbnRhbFByb3BlcnR5IiwiaG9yaXpvbnRhbEl0ZW1zIiwiXyIsIm1hcCIsImNob2ljZSIsImNyZWF0ZU5vZGUiLCJ2YWx1ZSIsImhvcml6b250YWxHcm91cCIsIm9yaWVudGF0aW9uIiwic3BhY2luZyIsInZlcnRpY2FsQ2hvaWNlcyIsInZlcnRpY2FsUHJvcGVydHkiLCJ2ZXJ0aWNhbEl0ZW1zIiwib3B0aW9ucyIsImFjY2Vzc2libGVOYW1lIiwidmVydGljYWxHcm91cCIsImhlbHBUZXh0IiwibGluayIsImFsZXJ0RGVzY3JpcHRpb25VdHRlcmFuY2UiLCJjaGlsZHJlbiIsImNlbnRlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxvQkFBb0Isd0NBQXdDO0FBRW5FLFNBQVNDLElBQUksRUFBUUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsb0NBQW9DO0FBQzNFLE9BQU9DLDBCQUEwQixnQ0FBZ0M7QUFFakUsZUFBZSxTQUFTQyx5QkFBMEJDLFlBQXFCO0lBRXJFLE1BQU1DLE9BQU8sSUFBSU4sS0FBTTtRQUFFTyxNQUFNO0lBQUc7SUFFbEMsTUFBTUMsb0JBQW9CO1FBQUU7UUFBUTtRQUFVO0tBQVM7SUFDdkQsTUFBTUMscUJBQXFCLElBQUlWLGVBQWdCUyxpQkFBaUIsQ0FBRSxFQUFHO0lBQ3JFLE1BQU1FLGtCQUFrQkMsRUFBRUMsR0FBRyxDQUFFSixtQkFDN0JLLENBQUFBO1FBQ0UsT0FBTztZQUNMQyxZQUFZLElBQU0sSUFBSWIsS0FBTVksUUFBUTtvQkFBRVAsTUFBTUE7Z0JBQUs7WUFDakRTLE9BQU9GO1FBQ1Q7SUFDRjtJQUNGLE1BQU1HLGtCQUFrQixJQUFJYixxQkFBc0JNLG9CQUFvQkMsaUJBQWlCO1FBQ3JGTyxhQUFhO1FBQ2JDLFNBQVM7SUFDWDtJQUVBLE1BQU1DLGtCQUFrQjtRQUFFO1FBQU87UUFBVTtLQUFVO0lBQ3JELE1BQU1DLG1CQUFtQixJQUFJckIsZUFBZ0JvQixlQUFlLENBQUUsRUFBRztJQUNqRSxNQUFNRSxnQkFBZ0JWLEVBQUVDLEdBQUcsQ0FBRU8saUJBQzNCTixDQUFBQTtRQUNFLE9BQU87WUFDTEMsWUFBWSxJQUFNLElBQUliLEtBQU1ZLFFBQVE7b0JBQUVQLE1BQU1BO2dCQUFLO1lBQ2pEUyxPQUFPRjtZQUNQUyxTQUFTO2dCQUNQQyxnQkFBZ0JWO1lBQ2xCO1FBQ0Y7SUFDRjtJQUNGLE1BQU1XLGdCQUFnQixJQUFJckIscUJBQXNCaUIsa0JBQWtCQyxlQUFlO1FBQy9FSixhQUFhO1FBRWIsT0FBTztRQUNQTSxnQkFBZ0I7UUFDaEJFLFVBQVU7SUFDWjtJQUVBLGlEQUFpRDtJQUNqREwsaUJBQWlCTSxJQUFJLENBQUVYLENBQUFBO1FBQ3JCUyxjQUFjRyx5QkFBeUIsQ0FBRSxDQUFDLGtDQUFrQyxFQUFFWixNQUFNLENBQUMsQ0FBQztJQUN4RjtJQUVBLE9BQU8sSUFBSWIsS0FBTTtRQUNmMEIsVUFBVTtZQUFFWjtZQUFpQlE7U0FBZTtRQUM1Q04sU0FBUztRQUNUVyxRQUFReEIsYUFBYXdCLE1BQU07SUFDN0I7QUFDRiJ9