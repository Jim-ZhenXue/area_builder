// Copyright 2019-2024, University of Colorado Boulder
/**
 * ComboBox for selecting one of twixt's Easing functions.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../scenery/js/imports.js';
import ComboBox from '../../../sun/js/ComboBox.js';
import Easing from '../Easing.js';
import twixt from '../twixt.js';
let EasingComboBox = class EasingComboBox extends ComboBox {
    /**
   * @param easingProperty - see Easing for values
   * @param listParent - Node that will be used as the list's parent
   * @param [providedOptions]
   */ constructor(easingProperty, listParent, providedOptions){
        const comboTextOptions = {
            font: new PhetFont(16)
        };
        const items = [
            {
                value: Easing.LINEAR,
                createNode: ()=>new Text('Linear', comboTextOptions)
            },
            {
                value: Easing.QUADRATIC_IN_OUT,
                createNode: ()=>new Text('Quadratic in-out', comboTextOptions)
            },
            {
                value: Easing.QUADRATIC_IN,
                createNode: ()=>new Text('Quadratic in', comboTextOptions)
            },
            {
                value: Easing.QUADRATIC_OUT,
                createNode: ()=>new Text('Quadratic out', comboTextOptions)
            },
            {
                value: Easing.CUBIC_IN_OUT,
                createNode: ()=>new Text('Cubic in-out', comboTextOptions)
            },
            {
                value: Easing.CUBIC_IN,
                createNode: ()=>new Text('Cubic in', comboTextOptions)
            },
            {
                value: Easing.CUBIC_OUT,
                createNode: ()=>new Text('Cubic out', comboTextOptions)
            },
            {
                value: Easing.QUARTIC_IN_OUT,
                createNode: ()=>new Text('Quartic in-out', comboTextOptions)
            },
            {
                value: Easing.QUARTIC_IN,
                createNode: ()=>new Text('Quartic in', comboTextOptions)
            },
            {
                value: Easing.QUARTIC_OUT,
                createNode: ()=>new Text('Quartic out', comboTextOptions)
            },
            {
                value: Easing.QUINTIC_IN_OUT,
                createNode: ()=>new Text('Quintic in-out', comboTextOptions)
            },
            {
                value: Easing.QUINTIC_IN,
                createNode: ()=>new Text('Quintic in', comboTextOptions)
            },
            {
                value: Easing.QUINTIC_OUT,
                createNode: ()=>new Text('Quintic out', comboTextOptions)
            }
        ];
        super(easingProperty, items, listParent, providedOptions);
    }
};
export { EasingComboBox as default };
twixt.register('EasingComboBox', EasingComboBox);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3R3aXh0L2pzL2RlbW8vRWFzaW5nQ29tYm9Cb3gudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQ29tYm9Cb3ggZm9yIHNlbGVjdGluZyBvbmUgb2YgdHdpeHQncyBFYXNpbmcgZnVuY3Rpb25zLlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgeyBOb2RlLCBOb2RlVHJhbnNsYXRpb25PcHRpb25zLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBDb21ib0JveCwgeyBDb21ib0JveEl0ZW0gfSBmcm9tICcuLi8uLi8uLi9zdW4vanMvQ29tYm9Cb3guanMnO1xuaW1wb3J0IEVhc2luZyBmcm9tICcuLi9FYXNpbmcuanMnO1xuaW1wb3J0IHR3aXh0IGZyb20gJy4uL3R3aXh0LmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XG50eXBlIEVhc2luZ0NvbWJvQm94T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWFzaW5nQ29tYm9Cb3ggZXh0ZW5kcyBDb21ib0JveDxFYXNpbmc+IHtcblxuICAvKipcbiAgICogQHBhcmFtIGVhc2luZ1Byb3BlcnR5IC0gc2VlIEVhc2luZyBmb3IgdmFsdWVzXG4gICAqIEBwYXJhbSBsaXN0UGFyZW50IC0gTm9kZSB0aGF0IHdpbGwgYmUgdXNlZCBhcyB0aGUgbGlzdCdzIHBhcmVudFxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZWFzaW5nUHJvcGVydHk6IFByb3BlcnR5PEVhc2luZz4sIGxpc3RQYXJlbnQ6IE5vZGUsIHByb3ZpZGVkT3B0aW9uczogRWFzaW5nQ29tYm9Cb3hPcHRpb25zICkge1xuXG4gICAgY29uc3QgY29tYm9UZXh0T3B0aW9ucyA9IHsgZm9udDogbmV3IFBoZXRGb250KCAxNiApIH07XG5cbiAgICBjb25zdCBpdGVtczogQ29tYm9Cb3hJdGVtPEVhc2luZz5bXSA9IFtcbiAgICAgIHsgdmFsdWU6IEVhc2luZy5MSU5FQVIsIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBUZXh0KCAnTGluZWFyJywgY29tYm9UZXh0T3B0aW9ucyApIH0sXG4gICAgICB7IHZhbHVlOiBFYXNpbmcuUVVBRFJBVElDX0lOX09VVCwgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFRleHQoICdRdWFkcmF0aWMgaW4tb3V0JywgY29tYm9UZXh0T3B0aW9ucyApIH0sXG4gICAgICB7IHZhbHVlOiBFYXNpbmcuUVVBRFJBVElDX0lOLCBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgVGV4dCggJ1F1YWRyYXRpYyBpbicsIGNvbWJvVGV4dE9wdGlvbnMgKSB9LFxuICAgICAgeyB2YWx1ZTogRWFzaW5nLlFVQURSQVRJQ19PVVQsIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBUZXh0KCAnUXVhZHJhdGljIG91dCcsIGNvbWJvVGV4dE9wdGlvbnMgKSB9LFxuICAgICAgeyB2YWx1ZTogRWFzaW5nLkNVQklDX0lOX09VVCwgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFRleHQoICdDdWJpYyBpbi1vdXQnLCBjb21ib1RleHRPcHRpb25zICkgfSxcbiAgICAgIHsgdmFsdWU6IEVhc2luZy5DVUJJQ19JTiwgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFRleHQoICdDdWJpYyBpbicsIGNvbWJvVGV4dE9wdGlvbnMgKSB9LFxuICAgICAgeyB2YWx1ZTogRWFzaW5nLkNVQklDX09VVCwgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFRleHQoICdDdWJpYyBvdXQnLCBjb21ib1RleHRPcHRpb25zICkgfSxcbiAgICAgIHsgdmFsdWU6IEVhc2luZy5RVUFSVElDX0lOX09VVCwgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFRleHQoICdRdWFydGljIGluLW91dCcsIGNvbWJvVGV4dE9wdGlvbnMgKSB9LFxuICAgICAgeyB2YWx1ZTogRWFzaW5nLlFVQVJUSUNfSU4sIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBUZXh0KCAnUXVhcnRpYyBpbicsIGNvbWJvVGV4dE9wdGlvbnMgKSB9LFxuICAgICAgeyB2YWx1ZTogRWFzaW5nLlFVQVJUSUNfT1VULCBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgVGV4dCggJ1F1YXJ0aWMgb3V0JywgY29tYm9UZXh0T3B0aW9ucyApIH0sXG4gICAgICB7IHZhbHVlOiBFYXNpbmcuUVVJTlRJQ19JTl9PVVQsIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBUZXh0KCAnUXVpbnRpYyBpbi1vdXQnLCBjb21ib1RleHRPcHRpb25zICkgfSxcbiAgICAgIHsgdmFsdWU6IEVhc2luZy5RVUlOVElDX0lOLCBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgVGV4dCggJ1F1aW50aWMgaW4nLCBjb21ib1RleHRPcHRpb25zICkgfSxcbiAgICAgIHsgdmFsdWU6IEVhc2luZy5RVUlOVElDX09VVCwgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFRleHQoICdRdWludGljIG91dCcsIGNvbWJvVGV4dE9wdGlvbnMgKSB9XG4gICAgXTtcblxuICAgIHN1cGVyKCBlYXNpbmdQcm9wZXJ0eSwgaXRlbXMsIGxpc3RQYXJlbnQsIHByb3ZpZGVkT3B0aW9ucyApO1xuICB9XG59XG5cbnR3aXh0LnJlZ2lzdGVyKCAnRWFzaW5nQ29tYm9Cb3gnLCBFYXNpbmdDb21ib0JveCApOyJdLCJuYW1lcyI6WyJQaGV0Rm9udCIsIlRleHQiLCJDb21ib0JveCIsIkVhc2luZyIsInR3aXh0IiwiRWFzaW5nQ29tYm9Cb3giLCJlYXNpbmdQcm9wZXJ0eSIsImxpc3RQYXJlbnQiLCJwcm92aWRlZE9wdGlvbnMiLCJjb21ib1RleHRPcHRpb25zIiwiZm9udCIsIml0ZW1zIiwidmFsdWUiLCJMSU5FQVIiLCJjcmVhdGVOb2RlIiwiUVVBRFJBVElDX0lOX09VVCIsIlFVQURSQVRJQ19JTiIsIlFVQURSQVRJQ19PVVQiLCJDVUJJQ19JTl9PVVQiLCJDVUJJQ19JTiIsIkNVQklDX09VVCIsIlFVQVJUSUNfSU5fT1VUIiwiUVVBUlRJQ19JTiIsIlFVQVJUSUNfT1VUIiwiUVVJTlRJQ19JTl9PVVQiLCJRVUlOVElDX0lOIiwiUVVJTlRJQ19PVVQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FJRCxPQUFPQSxjQUFjLHVDQUF1QztBQUM1RCxTQUF1Q0MsSUFBSSxRQUFRLGlDQUFpQztBQUNwRixPQUFPQyxjQUFnQyw4QkFBOEI7QUFDckUsT0FBT0MsWUFBWSxlQUFlO0FBQ2xDLE9BQU9DLFdBQVcsY0FBYztBQUtqQixJQUFBLEFBQU1DLGlCQUFOLE1BQU1BLHVCQUF1Qkg7SUFFMUM7Ozs7R0FJQyxHQUNELFlBQW9CSSxjQUFnQyxFQUFFQyxVQUFnQixFQUFFQyxlQUFzQyxDQUFHO1FBRS9HLE1BQU1DLG1CQUFtQjtZQUFFQyxNQUFNLElBQUlWLFNBQVU7UUFBSztRQUVwRCxNQUFNVyxRQUFnQztZQUNwQztnQkFBRUMsT0FBT1QsT0FBT1UsTUFBTTtnQkFBRUMsWUFBWSxJQUFNLElBQUliLEtBQU0sVUFBVVE7WUFBbUI7WUFDakY7Z0JBQUVHLE9BQU9ULE9BQU9ZLGdCQUFnQjtnQkFBRUQsWUFBWSxJQUFNLElBQUliLEtBQU0sb0JBQW9CUTtZQUFtQjtZQUNyRztnQkFBRUcsT0FBT1QsT0FBT2EsWUFBWTtnQkFBRUYsWUFBWSxJQUFNLElBQUliLEtBQU0sZ0JBQWdCUTtZQUFtQjtZQUM3RjtnQkFBRUcsT0FBT1QsT0FBT2MsYUFBYTtnQkFBRUgsWUFBWSxJQUFNLElBQUliLEtBQU0saUJBQWlCUTtZQUFtQjtZQUMvRjtnQkFBRUcsT0FBT1QsT0FBT2UsWUFBWTtnQkFBRUosWUFBWSxJQUFNLElBQUliLEtBQU0sZ0JBQWdCUTtZQUFtQjtZQUM3RjtnQkFBRUcsT0FBT1QsT0FBT2dCLFFBQVE7Z0JBQUVMLFlBQVksSUFBTSxJQUFJYixLQUFNLFlBQVlRO1lBQW1CO1lBQ3JGO2dCQUFFRyxPQUFPVCxPQUFPaUIsU0FBUztnQkFBRU4sWUFBWSxJQUFNLElBQUliLEtBQU0sYUFBYVE7WUFBbUI7WUFDdkY7Z0JBQUVHLE9BQU9ULE9BQU9rQixjQUFjO2dCQUFFUCxZQUFZLElBQU0sSUFBSWIsS0FBTSxrQkFBa0JRO1lBQW1CO1lBQ2pHO2dCQUFFRyxPQUFPVCxPQUFPbUIsVUFBVTtnQkFBRVIsWUFBWSxJQUFNLElBQUliLEtBQU0sY0FBY1E7WUFBbUI7WUFDekY7Z0JBQUVHLE9BQU9ULE9BQU9vQixXQUFXO2dCQUFFVCxZQUFZLElBQU0sSUFBSWIsS0FBTSxlQUFlUTtZQUFtQjtZQUMzRjtnQkFBRUcsT0FBT1QsT0FBT3FCLGNBQWM7Z0JBQUVWLFlBQVksSUFBTSxJQUFJYixLQUFNLGtCQUFrQlE7WUFBbUI7WUFDakc7Z0JBQUVHLE9BQU9ULE9BQU9zQixVQUFVO2dCQUFFWCxZQUFZLElBQU0sSUFBSWIsS0FBTSxjQUFjUTtZQUFtQjtZQUN6RjtnQkFBRUcsT0FBT1QsT0FBT3VCLFdBQVc7Z0JBQUVaLFlBQVksSUFBTSxJQUFJYixLQUFNLGVBQWVRO1lBQW1CO1NBQzVGO1FBRUQsS0FBSyxDQUFFSCxnQkFBZ0JLLE9BQU9KLFlBQVlDO0lBQzVDO0FBQ0Y7QUE3QkEsU0FBcUJILDRCQTZCcEI7QUFFREQsTUFBTXVCLFFBQVEsQ0FBRSxrQkFBa0J0QiJ9