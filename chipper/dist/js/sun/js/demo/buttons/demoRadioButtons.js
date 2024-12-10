// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for various radio buttons.
 *
 * @author various contributors
 */ import Property from '../../../../axon/js/Property.js';
import { Font, HBox, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../buttons/RectangularRadioButtonGroup.js';
import Checkbox from '../../Checkbox.js';
import Panel from '../../Panel.js';
import VerticalAquaRadioButtonGroup from '../../VerticalAquaRadioButtonGroup.js';
const BUTTON_FONT = new Font({
    size: 16
});
export default function demoRadioButtons(layoutBounds) {
    // For enabling/disabling all buttons
    const buttonsEnabledProperty = new Property(true);
    const buttonsEnabledCheckbox = new Checkbox(buttonsEnabledProperty, new Text('buttons enabled', {
        font: new Font({
            size: 20
        })
    }));
    const radioGroupBaseColorProperty = new Property('green');
    // demonstrate RectangularRadioButtonGroup
    const rectangularRadioButtonValues = [
        'One',
        'Two',
        'Three',
        'Four'
    ];
    const rectangularRadioButtonProperty = new Property(rectangularRadioButtonValues[0]);
    rectangularRadioButtonProperty.lazyLink((value)=>console.log(`rectangularRadioButtonProperty.value = ${value}`));
    const radioButtonContent = _.map(rectangularRadioButtonValues, (stringValue)=>{
        return {
            value: stringValue,
            createNode: ()=>new Text(stringValue, {
                    font: BUTTON_FONT
                }),
            label: new Text(stringValue)
        };
    });
    const rectangularRadioButtonGroup = new RectangularRadioButtonGroup(rectangularRadioButtonProperty, radioButtonContent, {
        orientation: 'vertical',
        enabledProperty: buttonsEnabledProperty,
        radioButtonOptions: {
            baseColor: radioGroupBaseColorProperty,
            xAlign: 'center',
            yAlign: 'center',
            buttonAppearanceStrategyOptions: {
                selectedLineWidth: 4
            }
        }
    });
    const rectangularRadioButtonPanel = new Panel(rectangularRadioButtonGroup, {
        xMargin: 10,
        yMargin: 10
    });
    // demonstrate VerticalAquaRadioButtonGroup
    const aquaRadioButtonValues = [
        'Small',
        'Medium',
        'Large'
    ];
    const aquaRadioButtonProperty = new Property(aquaRadioButtonValues[0]);
    aquaRadioButtonProperty.lazyLink((value)=>console.log(`aquaRadioButtonProperty.value = ${value}`));
    const aquaRadioButtonGroupContent = _.map(aquaRadioButtonValues, (stringValue)=>{
        return {
            value: stringValue,
            createNode: ()=>new Text(stringValue, {
                    font: BUTTON_FONT
                }),
            options: {
                accessibleName: stringValue
            }
        };
    });
    const aquaRadioButtonGroup = new VerticalAquaRadioButtonGroup(aquaRadioButtonProperty, aquaRadioButtonGroupContent, {
        spacing: 8,
        enabledProperty: buttonsEnabledProperty
    });
    const aquaRadioButtonGroupPanel = new Panel(aquaRadioButtonGroup, {
        stroke: 'black',
        xMargin: 10,
        yMargin: 10
    });
    return new VBox({
        spacing: 30,
        children: [
            new HBox({
                spacing: 15,
                children: [
                    rectangularRadioButtonPanel,
                    aquaRadioButtonGroupPanel
                ]
            }),
            buttonsEnabledCheckbox
        ],
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL2J1dHRvbnMvZGVtb1JhZGlvQnV0dG9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZW1vIGZvciB2YXJpb3VzIHJhZGlvIGJ1dHRvbnMuXG4gKlxuICogQGF1dGhvciB2YXJpb3VzIGNvbnRyaWJ1dG9yc1xuICovXG5cbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCB7IEZvbnQsIEhCb3gsIE5vZGUsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IFJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCBmcm9tICcuLi8uLi9idXR0b25zL1JlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cC5qcyc7XG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vLi4vQ2hlY2tib3guanMnO1xuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uL1BhbmVsLmpzJztcbmltcG9ydCBWZXJ0aWNhbEFxdWFSYWRpb0J1dHRvbkdyb3VwIGZyb20gJy4uLy4uL1ZlcnRpY2FsQXF1YVJhZGlvQnV0dG9uR3JvdXAuanMnO1xuXG5jb25zdCBCVVRUT05fRk9OVCA9IG5ldyBGb250KCB7IHNpemU6IDE2IH0gKTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVtb1JhZGlvQnV0dG9ucyggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICk6IE5vZGUge1xuXG4gIC8vIEZvciBlbmFibGluZy9kaXNhYmxpbmcgYWxsIGJ1dHRvbnNcbiAgY29uc3QgYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggdHJ1ZSApO1xuICBjb25zdCBidXR0b25zRW5hYmxlZENoZWNrYm94ID0gbmV3IENoZWNrYm94KCBidXR0b25zRW5hYmxlZFByb3BlcnR5LCBuZXcgVGV4dCggJ2J1dHRvbnMgZW5hYmxlZCcsIHtcbiAgICBmb250OiBuZXcgRm9udCggeyBzaXplOiAyMCB9IClcbiAgfSApICk7XG5cbiAgY29uc3QgcmFkaW9Hcm91cEJhc2VDb2xvclByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAnZ3JlZW4nICk7XG5cbiAgLy8gZGVtb25zdHJhdGUgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwXG4gIGNvbnN0IHJlY3Rhbmd1bGFyUmFkaW9CdXR0b25WYWx1ZXMgPSBbICdPbmUnLCAnVHdvJywgJ1RocmVlJywgJ0ZvdXInIF07XG4gIGNvbnN0IHJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggcmVjdGFuZ3VsYXJSYWRpb0J1dHRvblZhbHVlc1sgMCBdICk7XG4gIHJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Qcm9wZXJ0eS5sYXp5TGluayggdmFsdWUgPT4gY29uc29sZS5sb2coIGByZWN0YW5ndWxhclJhZGlvQnV0dG9uUHJvcGVydHkudmFsdWUgPSAke3ZhbHVlfWAgKSApO1xuICBjb25zdCByYWRpb0J1dHRvbkNvbnRlbnQgPSBfLm1hcCggcmVjdGFuZ3VsYXJSYWRpb0J1dHRvblZhbHVlcywgc3RyaW5nVmFsdWUgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZTogc3RyaW5nVmFsdWUsXG4gICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgVGV4dCggc3RyaW5nVmFsdWUsIHsgZm9udDogQlVUVE9OX0ZPTlQgfSApLFxuICAgICAgbGFiZWw6IG5ldyBUZXh0KCBzdHJpbmdWYWx1ZSApXG4gICAgfTtcbiAgfSApO1xuICBjb25zdCByZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAgPSBuZXcgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwKCByZWN0YW5ndWxhclJhZGlvQnV0dG9uUHJvcGVydHksIHJhZGlvQnV0dG9uQ29udGVudCwge1xuICAgIG9yaWVudGF0aW9uOiAndmVydGljYWwnLFxuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSxcbiAgICByYWRpb0J1dHRvbk9wdGlvbnM6IHtcbiAgICAgIGJhc2VDb2xvcjogcmFkaW9Hcm91cEJhc2VDb2xvclByb3BlcnR5LFxuICAgICAgeEFsaWduOiAnY2VudGVyJyxcbiAgICAgIHlBbGlnbjogJ2NlbnRlcicsXG4gICAgICBidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zOiB7XG4gICAgICAgIHNlbGVjdGVkTGluZVdpZHRoOiA0XG4gICAgICB9XG4gICAgfVxuICB9ICk7XG4gIGNvbnN0IHJlY3Rhbmd1bGFyUmFkaW9CdXR0b25QYW5lbCA9IG5ldyBQYW5lbCggcmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwLCB7XG4gICAgeE1hcmdpbjogMTAsXG4gICAgeU1hcmdpbjogMTBcbiAgfSApO1xuXG4gIC8vIGRlbW9uc3RyYXRlIFZlcnRpY2FsQXF1YVJhZGlvQnV0dG9uR3JvdXBcbiAgY29uc3QgYXF1YVJhZGlvQnV0dG9uVmFsdWVzID0gWyAnU21hbGwnLCAnTWVkaXVtJywgJ0xhcmdlJyBdO1xuICBjb25zdCBhcXVhUmFkaW9CdXR0b25Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggYXF1YVJhZGlvQnV0dG9uVmFsdWVzWyAwIF0gKTtcbiAgYXF1YVJhZGlvQnV0dG9uUHJvcGVydHkubGF6eUxpbmsoIHZhbHVlID0+IGNvbnNvbGUubG9nKCBgYXF1YVJhZGlvQnV0dG9uUHJvcGVydHkudmFsdWUgPSAke3ZhbHVlfWAgKSApO1xuICBjb25zdCBhcXVhUmFkaW9CdXR0b25Hcm91cENvbnRlbnQgPSBfLm1hcCggYXF1YVJhZGlvQnV0dG9uVmFsdWVzLCBzdHJpbmdWYWx1ZSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlOiBzdHJpbmdWYWx1ZSxcbiAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBUZXh0KCBzdHJpbmdWYWx1ZSwgeyBmb250OiBCVVRUT05fRk9OVCB9ICksXG4gICAgICBvcHRpb25zOiB7XG4gICAgICAgIGFjY2Vzc2libGVOYW1lOiBzdHJpbmdWYWx1ZVxuICAgICAgfVxuICAgIH07XG4gIH0gKTtcbiAgY29uc3QgYXF1YVJhZGlvQnV0dG9uR3JvdXAgPSBuZXcgVmVydGljYWxBcXVhUmFkaW9CdXR0b25Hcm91cCggYXF1YVJhZGlvQnV0dG9uUHJvcGVydHksIGFxdWFSYWRpb0J1dHRvbkdyb3VwQ29udGVudCwge1xuICAgIHNwYWNpbmc6IDgsXG4gICAgZW5hYmxlZFByb3BlcnR5OiBidXR0b25zRW5hYmxlZFByb3BlcnR5XG4gIH0gKTtcbiAgY29uc3QgYXF1YVJhZGlvQnV0dG9uR3JvdXBQYW5lbCA9IG5ldyBQYW5lbCggYXF1YVJhZGlvQnV0dG9uR3JvdXAsIHtcbiAgICBzdHJva2U6ICdibGFjaycsXG4gICAgeE1hcmdpbjogMTAsXG4gICAgeU1hcmdpbjogMTBcbiAgfSApO1xuXG4gIHJldHVybiBuZXcgVkJveCgge1xuICAgIHNwYWNpbmc6IDMwLFxuICAgIGNoaWxkcmVuOiBbXG4gICAgICBuZXcgSEJveCgge1xuICAgICAgICBzcGFjaW5nOiAxNSxcbiAgICAgICAgY2hpbGRyZW46IFsgcmVjdGFuZ3VsYXJSYWRpb0J1dHRvblBhbmVsLCBhcXVhUmFkaW9CdXR0b25Hcm91cFBhbmVsIF1cbiAgICAgIH0gKSxcbiAgICAgIGJ1dHRvbnNFbmFibGVkQ2hlY2tib3hcbiAgICBdLFxuICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlclxuICB9ICk7XG59Il0sIm5hbWVzIjpbIlByb3BlcnR5IiwiRm9udCIsIkhCb3giLCJUZXh0IiwiVkJveCIsIlJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCIsIkNoZWNrYm94IiwiUGFuZWwiLCJWZXJ0aWNhbEFxdWFSYWRpb0J1dHRvbkdyb3VwIiwiQlVUVE9OX0ZPTlQiLCJzaXplIiwiZGVtb1JhZGlvQnV0dG9ucyIsImxheW91dEJvdW5kcyIsImJ1dHRvbnNFbmFibGVkUHJvcGVydHkiLCJidXR0b25zRW5hYmxlZENoZWNrYm94IiwiZm9udCIsInJhZGlvR3JvdXBCYXNlQ29sb3JQcm9wZXJ0eSIsInJlY3Rhbmd1bGFyUmFkaW9CdXR0b25WYWx1ZXMiLCJyZWN0YW5ndWxhclJhZGlvQnV0dG9uUHJvcGVydHkiLCJsYXp5TGluayIsInZhbHVlIiwiY29uc29sZSIsImxvZyIsInJhZGlvQnV0dG9uQ29udGVudCIsIl8iLCJtYXAiLCJzdHJpbmdWYWx1ZSIsImNyZWF0ZU5vZGUiLCJsYWJlbCIsInJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCIsIm9yaWVudGF0aW9uIiwiZW5hYmxlZFByb3BlcnR5IiwicmFkaW9CdXR0b25PcHRpb25zIiwiYmFzZUNvbG9yIiwieEFsaWduIiwieUFsaWduIiwiYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5T3B0aW9ucyIsInNlbGVjdGVkTGluZVdpZHRoIiwicmVjdGFuZ3VsYXJSYWRpb0J1dHRvblBhbmVsIiwieE1hcmdpbiIsInlNYXJnaW4iLCJhcXVhUmFkaW9CdXR0b25WYWx1ZXMiLCJhcXVhUmFkaW9CdXR0b25Qcm9wZXJ0eSIsImFxdWFSYWRpb0J1dHRvbkdyb3VwQ29udGVudCIsIm9wdGlvbnMiLCJhY2Nlc3NpYmxlTmFtZSIsImFxdWFSYWRpb0J1dHRvbkdyb3VwIiwic3BhY2luZyIsImFxdWFSYWRpb0J1dHRvbkdyb3VwUGFuZWwiLCJzdHJva2UiLCJjaGlsZHJlbiIsImNlbnRlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxjQUFjLGtDQUFrQztBQUV2RCxTQUFTQyxJQUFJLEVBQUVDLElBQUksRUFBUUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsb0NBQW9DO0FBQ2pGLE9BQU9DLGlDQUFpQywrQ0FBK0M7QUFDdkYsT0FBT0MsY0FBYyxvQkFBb0I7QUFDekMsT0FBT0MsV0FBVyxpQkFBaUI7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