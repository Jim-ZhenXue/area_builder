// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for ComboBox
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import { Font, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../Checkbox.js';
import ComboBox from '../../ComboBox.js';
const FONT = new Font({
    size: 20
});
export default function demoComboBox(layoutBounds) {
    const values = [
        'one',
        'two',
        'three',
        'four',
        'five',
        'six'
    ];
    const items = [];
    values.forEach((value)=>{
        items.push({
            value: value,
            createNode: ()=>new Text(value, {
                    font: FONT
                })
        });
    });
    const selectedItemProperty = new Property(values[0]);
    const listParent = new Node();
    const enabledProperty = new BooleanProperty(true);
    const comboBox = new ComboBox(selectedItemProperty, items, listParent, {
        highlightFill: 'yellow',
        listPosition: 'above',
        enabledProperty: enabledProperty
    });
    const enabledCheckbox = new Checkbox(enabledProperty, new Text('enabled', {
        font: FONT
    }));
    const uiComponents = new VBox({
        children: [
            comboBox,
            enabledCheckbox
        ],
        spacing: 40,
        center: layoutBounds.center
    });
    return new Node({
        children: [
            uiComponents,
            listParent
        ]
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb0NvbWJvQm94LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERlbW8gZm9yIENvbWJvQm94XG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCB7IEZvbnQsIE5vZGUsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IENoZWNrYm94IGZyb20gJy4uLy4uL0NoZWNrYm94LmpzJztcbmltcG9ydCBDb21ib0JveCwgeyBDb21ib0JveEl0ZW0gfSBmcm9tICcuLi8uLi9Db21ib0JveC5qcyc7XG5cbmNvbnN0IEZPTlQgPSBuZXcgRm9udCggeyBzaXplOiAyMCB9ICk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9Db21ib0JveCggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICk6IE5vZGUge1xuXG4gIGNvbnN0IHZhbHVlcyA9IFsgJ29uZScsICd0d28nLCAndGhyZWUnLCAnZm91cicsICdmaXZlJywgJ3NpeCcgXTtcbiAgY29uc3QgaXRlbXM6IENvbWJvQm94SXRlbTxzdHJpbmc+W10gPSBbXTtcbiAgdmFsdWVzLmZvckVhY2goIHZhbHVlID0+IHtcbiAgICBpdGVtcy5wdXNoKCB7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgVGV4dCggdmFsdWUsIHsgZm9udDogRk9OVCB9IClcbiAgICB9ICk7XG4gIH0gKTtcblxuICBjb25zdCBzZWxlY3RlZEl0ZW1Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggdmFsdWVzWyAwIF0gKTtcblxuICBjb25zdCBsaXN0UGFyZW50ID0gbmV3IE5vZGUoKTtcblxuICBjb25zdCBlbmFibGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICk7XG5cbiAgY29uc3QgY29tYm9Cb3ggPSBuZXcgQ29tYm9Cb3goIHNlbGVjdGVkSXRlbVByb3BlcnR5LCBpdGVtcywgbGlzdFBhcmVudCwge1xuICAgIGhpZ2hsaWdodEZpbGw6ICd5ZWxsb3cnLFxuICAgIGxpc3RQb3NpdGlvbjogJ2Fib3ZlJyxcbiAgICBlbmFibGVkUHJvcGVydHk6IGVuYWJsZWRQcm9wZXJ0eVxuICB9ICk7XG5cbiAgY29uc3QgZW5hYmxlZENoZWNrYm94ID0gbmV3IENoZWNrYm94KCBlbmFibGVkUHJvcGVydHksIG5ldyBUZXh0KCAnZW5hYmxlZCcsIHsgZm9udDogRk9OVCB9ICkgKTtcblxuICBjb25zdCB1aUNvbXBvbmVudHMgPSBuZXcgVkJveCgge1xuICAgIGNoaWxkcmVuOiBbIGNvbWJvQm94LCBlbmFibGVkQ2hlY2tib3ggXSxcbiAgICBzcGFjaW5nOiA0MCxcbiAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXJcbiAgfSApO1xuXG4gIHJldHVybiBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyB1aUNvbXBvbmVudHMsIGxpc3RQYXJlbnQgXSB9ICk7XG59Il0sIm5hbWVzIjpbIkJvb2xlYW5Qcm9wZXJ0eSIsIlByb3BlcnR5IiwiRm9udCIsIk5vZGUiLCJUZXh0IiwiVkJveCIsIkNoZWNrYm94IiwiQ29tYm9Cb3giLCJGT05UIiwic2l6ZSIsImRlbW9Db21ib0JveCIsImxheW91dEJvdW5kcyIsInZhbHVlcyIsIml0ZW1zIiwiZm9yRWFjaCIsInZhbHVlIiwicHVzaCIsImNyZWF0ZU5vZGUiLCJmb250Iiwic2VsZWN0ZWRJdGVtUHJvcGVydHkiLCJsaXN0UGFyZW50IiwiZW5hYmxlZFByb3BlcnR5IiwiY29tYm9Cb3giLCJoaWdobGlnaHRGaWxsIiwibGlzdFBvc2l0aW9uIiwiZW5hYmxlZENoZWNrYm94IiwidWlDb21wb25lbnRzIiwiY2hpbGRyZW4iLCJzcGFjaW5nIiwiY2VudGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLHFCQUFxQix5Q0FBeUM7QUFDckUsT0FBT0MsY0FBYyxrQ0FBa0M7QUFFdkQsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG9DQUFvQztBQUMzRSxPQUFPQyxjQUFjLG9CQUFvQjtBQUN6QyxPQUFPQyxjQUFnQyxvQkFBb0I7QUFFM0QsTUFBTUMsT0FBTyxJQUFJTixLQUFNO0lBQUVPLE1BQU07QUFBRztBQUVsQyxlQUFlLFNBQVNDLGFBQWNDLFlBQXFCO0lBRXpELE1BQU1DLFNBQVM7UUFBRTtRQUFPO1FBQU87UUFBUztRQUFRO1FBQVE7S0FBTztJQUMvRCxNQUFNQyxRQUFnQyxFQUFFO0lBQ3hDRCxPQUFPRSxPQUFPLENBQUVDLENBQUFBO1FBQ2RGLE1BQU1HLElBQUksQ0FBRTtZQUNWRCxPQUFPQTtZQUNQRSxZQUFZLElBQU0sSUFBSWIsS0FBTVcsT0FBTztvQkFBRUcsTUFBTVY7Z0JBQUs7UUFDbEQ7SUFDRjtJQUVBLE1BQU1XLHVCQUF1QixJQUFJbEIsU0FBVVcsTUFBTSxDQUFFLEVBQUc7SUFFdEQsTUFBTVEsYUFBYSxJQUFJakI7SUFFdkIsTUFBTWtCLGtCQUFrQixJQUFJckIsZ0JBQWlCO0lBRTdDLE1BQU1zQixXQUFXLElBQUlmLFNBQVVZLHNCQUFzQk4sT0FBT08sWUFBWTtRQUN0RUcsZUFBZTtRQUNmQyxjQUFjO1FBQ2RILGlCQUFpQkE7SUFDbkI7SUFFQSxNQUFNSSxrQkFBa0IsSUFBSW5CLFNBQVVlLGlCQUFpQixJQUFJakIsS0FBTSxXQUFXO1FBQUVjLE1BQU1WO0lBQUs7SUFFekYsTUFBTWtCLGVBQWUsSUFBSXJCLEtBQU07UUFDN0JzQixVQUFVO1lBQUVMO1lBQVVHO1NBQWlCO1FBQ3ZDRyxTQUFTO1FBQ1RDLFFBQVFsQixhQUFha0IsTUFBTTtJQUM3QjtJQUVBLE9BQU8sSUFBSTFCLEtBQU07UUFBRXdCLFVBQVU7WUFBRUQ7WUFBY047U0FBWTtJQUFDO0FBQzVEIn0=