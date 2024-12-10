// Copyright 2022-2024, University of Colorado Boulder
/**
 * Parent class for layout and styling of content nodes that can be passed through to
 * PreferencesPanelSection.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 *
 */ import optionize from '../../../phet-core/js/optionize.js';
import { VBox } from '../../../scenery/js/imports.js';
import Panel from '../../../sun/js/Panel.js';
import joist from '../joist.js';
let PreferencesPanelContentNode = class PreferencesPanelContentNode extends Panel {
    constructor(providedOptions){
        const options = optionize()({
            fill: '#E8E8E8',
            stroke: null,
            xMargin: 10,
            yMargin: 10
        }, providedOptions);
        const contentVBox = new VBox({
            children: options.content,
            spacing: 10
        });
        super(contentVBox, options);
    }
};
export { PreferencesPanelContentNode as default };
joist.register('PreferencesPanelContentNode', PreferencesPanelContentNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL3ByZWZlcmVuY2VzL1ByZWZlcmVuY2VzUGFuZWxDb250ZW50Tm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBQYXJlbnQgY2xhc3MgZm9yIGxheW91dCBhbmQgc3R5bGluZyBvZiBjb250ZW50IG5vZGVzIHRoYXQgY2FuIGJlIHBhc3NlZCB0aHJvdWdoIHRvXG4gKiBQcmVmZXJlbmNlc1BhbmVsU2VjdGlvbi5cbiAqXG4gKiBAYXV0aG9yIE1hcmxhIFNjaHVseiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqXG4gKi9cblxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCB7IE5vZGUsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IFBhbmVsLCB7IFBhbmVsT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XG5pbXBvcnQgam9pc3QgZnJvbSAnLi4vam9pc3QuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICBjb250ZW50OiBBcnJheTxOb2RlPjtcbn07XG5cbnR5cGUgUHJlZmVyZW5jZXNQYW5lbENvbnRlbnROb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGFuZWxPcHRpb25zO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJlZmVyZW5jZXNQYW5lbENvbnRlbnROb2RlIGV4dGVuZHMgUGFuZWwge1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBQcmVmZXJlbmNlc1BhbmVsQ29udGVudE5vZGVPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxQcmVmZXJlbmNlc1BhbmVsQ29udGVudE5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgUGFuZWxPcHRpb25zPigpKCB7XG4gICAgICBmaWxsOiAnI0U4RThFOCcsXG4gICAgICBzdHJva2U6IG51bGwsXG4gICAgICB4TWFyZ2luOiAxMCxcbiAgICAgIHlNYXJnaW46IDEwXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBjb25zdCBjb250ZW50VkJveCA9IG5ldyBWQm94KCB7IGNoaWxkcmVuOiBvcHRpb25zLmNvbnRlbnQsIHNwYWNpbmc6IDEwIH0gKTtcblxuICAgIHN1cGVyKCBjb250ZW50VkJveCwgb3B0aW9ucyApO1xuICB9XG59XG5cbmpvaXN0LnJlZ2lzdGVyKCAnUHJlZmVyZW5jZXNQYW5lbENvbnRlbnROb2RlJywgUHJlZmVyZW5jZXNQYW5lbENvbnRlbnROb2RlICk7Il0sIm5hbWVzIjpbIm9wdGlvbml6ZSIsIlZCb3giLCJQYW5lbCIsImpvaXN0IiwiUHJlZmVyZW5jZXNQYW5lbENvbnRlbnROb2RlIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImZpbGwiLCJzdHJva2UiLCJ4TWFyZ2luIiwieU1hcmdpbiIsImNvbnRlbnRWQm94IiwiY2hpbGRyZW4iLCJjb250ZW50Iiwic3BhY2luZyIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBRUQsT0FBT0EsZUFBZSxxQ0FBcUM7QUFDM0QsU0FBZUMsSUFBSSxRQUFRLGlDQUFpQztBQUM1RCxPQUFPQyxXQUE2QiwyQkFBMkI7QUFDL0QsT0FBT0MsV0FBVyxjQUFjO0FBT2pCLElBQUEsQUFBTUMsOEJBQU4sTUFBTUEsb0NBQW9DRjtJQUV2RCxZQUFvQkcsZUFBbUQsQ0FBRztRQUV4RSxNQUFNQyxVQUFVTixZQUE0RTtZQUMxRk8sTUFBTTtZQUNOQyxRQUFRO1lBQ1JDLFNBQVM7WUFDVEMsU0FBUztRQUNYLEdBQUdMO1FBRUgsTUFBTU0sY0FBYyxJQUFJVixLQUFNO1lBQUVXLFVBQVVOLFFBQVFPLE9BQU87WUFBRUMsU0FBUztRQUFHO1FBRXZFLEtBQUssQ0FBRUgsYUFBYUw7SUFDdEI7QUFDRjtBQWZBLFNBQXFCRix5Q0FlcEI7QUFFREQsTUFBTVksUUFBUSxDQUFFLCtCQUErQlgifQ==