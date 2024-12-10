// Copyright 2015-2024, University of Colorado Boulder
/**
 * Demonstration of misc sun UI components.
 * Demos are selected from a combo box, and are instantiated on demand.
 * Use the 'component' query parameter to set the initial selection of the combo box.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */ import sun from '../../sun.js';
import DemosScreenView from '../DemosScreenView.js';
import demoABSwitch from './demoABSwitch.js';
import demoAccordionBox from './demoAccordionBox.js';
import demoAlignGroup from './demoAlignGroup.js';
import demoCarousel from './demoCarousel.js';
import demoCheckbox from './demoCheckbox.js';
import demoComboBox from './demoComboBox.js';
import demoNumberPicker from './demoNumberPicker.js';
import demoNumberSpinner from './demoNumberSpinner.js';
import demoOnOffSwitch from './demoOnOffSwitch.js';
import demoPageControl from './demoPageControl.js';
import { demoHSlider, demoVSlider } from './demoSlider.js';
import demoToggleSwitch from './demoToggleSwitch.js';
let ComponentsScreenView = class ComponentsScreenView extends DemosScreenView {
    constructor(options){
        // To add a demo, add an entry here of type DemoItemData.
        const demos = [
            {
                label: 'ABSwitch',
                createNode: demoABSwitch
            },
            {
                label: 'Carousel',
                createNode: demoCarousel
            },
            {
                label: 'Checkbox',
                createNode: demoCheckbox
            },
            {
                label: 'ComboBox',
                createNode: demoComboBox
            },
            {
                label: 'HSlider',
                createNode: demoHSlider
            },
            {
                label: 'VSlider',
                createNode: demoVSlider
            },
            {
                label: 'OnOffSwitch',
                createNode: demoOnOffSwitch
            },
            {
                label: 'PageControl',
                createNode: demoPageControl
            },
            {
                label: 'NumberPicker',
                createNode: demoNumberPicker
            },
            {
                label: 'NumberSpinner',
                createNode: demoNumberSpinner
            },
            {
                label: 'AlignGroup',
                createNode: demoAlignGroup
            },
            {
                label: 'AccordionBox',
                createNode: demoAccordionBox
            },
            {
                label: 'ToggleSwitch',
                createNode: demoToggleSwitch
            }
        ];
        super(demos, options);
    }
};
export { ComponentsScreenView as default };
sun.register('ComponentsScreenView', ComponentsScreenView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL2NvbXBvbmVudHMvQ29tcG9uZW50c1NjcmVlblZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVtb25zdHJhdGlvbiBvZiBtaXNjIHN1biBVSSBjb21wb25lbnRzLlxuICogRGVtb3MgYXJlIHNlbGVjdGVkIGZyb20gYSBjb21ibyBib3gsIGFuZCBhcmUgaW5zdGFudGlhdGVkIG9uIGRlbWFuZC5cbiAqIFVzZSB0aGUgJ2NvbXBvbmVudCcgcXVlcnkgcGFyYW1ldGVyIHRvIHNldCB0aGUgaW5pdGlhbCBzZWxlY3Rpb24gb2YgdGhlIGNvbWJvIGJveC5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xuaW1wb3J0IHN1biBmcm9tICcuLi8uLi9zdW4uanMnO1xuaW1wb3J0IERlbW9zU2NyZWVuVmlldywgeyBEZW1vc1NjcmVlblZpZXdPcHRpb25zIH0gZnJvbSAnLi4vRGVtb3NTY3JlZW5WaWV3LmpzJztcbmltcG9ydCBkZW1vQUJTd2l0Y2ggZnJvbSAnLi9kZW1vQUJTd2l0Y2guanMnO1xuaW1wb3J0IGRlbW9BY2NvcmRpb25Cb3ggZnJvbSAnLi9kZW1vQWNjb3JkaW9uQm94LmpzJztcbmltcG9ydCBkZW1vQWxpZ25Hcm91cCBmcm9tICcuL2RlbW9BbGlnbkdyb3VwLmpzJztcbmltcG9ydCBkZW1vQ2Fyb3VzZWwgZnJvbSAnLi9kZW1vQ2Fyb3VzZWwuanMnO1xuaW1wb3J0IGRlbW9DaGVja2JveCBmcm9tICcuL2RlbW9DaGVja2JveC5qcyc7XG5pbXBvcnQgZGVtb0NvbWJvQm94IGZyb20gJy4vZGVtb0NvbWJvQm94LmpzJztcbmltcG9ydCBkZW1vTnVtYmVyUGlja2VyIGZyb20gJy4vZGVtb051bWJlclBpY2tlci5qcyc7XG5pbXBvcnQgZGVtb051bWJlclNwaW5uZXIgZnJvbSAnLi9kZW1vTnVtYmVyU3Bpbm5lci5qcyc7XG5pbXBvcnQgZGVtb09uT2ZmU3dpdGNoIGZyb20gJy4vZGVtb09uT2ZmU3dpdGNoLmpzJztcbmltcG9ydCBkZW1vUGFnZUNvbnRyb2wgZnJvbSAnLi9kZW1vUGFnZUNvbnRyb2wuanMnO1xuaW1wb3J0IHsgZGVtb0hTbGlkZXIsIGRlbW9WU2xpZGVyIH0gZnJvbSAnLi9kZW1vU2xpZGVyLmpzJztcbmltcG9ydCBkZW1vVG9nZ2xlU3dpdGNoIGZyb20gJy4vZGVtb1RvZ2dsZVN3aXRjaC5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xudHlwZSBDb21wb25lbnRzU2NyZWVuVmlld09wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxEZW1vc1NjcmVlblZpZXdPcHRpb25zLCAndGFuZGVtJz47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbXBvbmVudHNTY3JlZW5WaWV3IGV4dGVuZHMgRGVtb3NTY3JlZW5WaWV3IHtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIG9wdGlvbnM6IENvbXBvbmVudHNTY3JlZW5WaWV3T3B0aW9ucyApIHtcblxuICAgIC8vIFRvIGFkZCBhIGRlbW8sIGFkZCBhbiBlbnRyeSBoZXJlIG9mIHR5cGUgRGVtb0l0ZW1EYXRhLlxuICAgIGNvbnN0IGRlbW9zID0gW1xuICAgICAgeyBsYWJlbDogJ0FCU3dpdGNoJywgY3JlYXRlTm9kZTogZGVtb0FCU3dpdGNoIH0sXG4gICAgICB7IGxhYmVsOiAnQ2Fyb3VzZWwnLCBjcmVhdGVOb2RlOiBkZW1vQ2Fyb3VzZWwgfSxcbiAgICAgIHsgbGFiZWw6ICdDaGVja2JveCcsIGNyZWF0ZU5vZGU6IGRlbW9DaGVja2JveCB9LFxuICAgICAgeyBsYWJlbDogJ0NvbWJvQm94JywgY3JlYXRlTm9kZTogZGVtb0NvbWJvQm94IH0sXG4gICAgICB7IGxhYmVsOiAnSFNsaWRlcicsIGNyZWF0ZU5vZGU6IGRlbW9IU2xpZGVyIH0sXG4gICAgICB7IGxhYmVsOiAnVlNsaWRlcicsIGNyZWF0ZU5vZGU6IGRlbW9WU2xpZGVyIH0sXG4gICAgICB7IGxhYmVsOiAnT25PZmZTd2l0Y2gnLCBjcmVhdGVOb2RlOiBkZW1vT25PZmZTd2l0Y2ggfSxcbiAgICAgIHsgbGFiZWw6ICdQYWdlQ29udHJvbCcsIGNyZWF0ZU5vZGU6IGRlbW9QYWdlQ29udHJvbCB9LFxuICAgICAgeyBsYWJlbDogJ051bWJlclBpY2tlcicsIGNyZWF0ZU5vZGU6IGRlbW9OdW1iZXJQaWNrZXIgfSxcbiAgICAgIHsgbGFiZWw6ICdOdW1iZXJTcGlubmVyJywgY3JlYXRlTm9kZTogZGVtb051bWJlclNwaW5uZXIgfSxcbiAgICAgIHsgbGFiZWw6ICdBbGlnbkdyb3VwJywgY3JlYXRlTm9kZTogZGVtb0FsaWduR3JvdXAgfSxcbiAgICAgIHsgbGFiZWw6ICdBY2NvcmRpb25Cb3gnLCBjcmVhdGVOb2RlOiBkZW1vQWNjb3JkaW9uQm94IH0sXG4gICAgICB7IGxhYmVsOiAnVG9nZ2xlU3dpdGNoJywgY3JlYXRlTm9kZTogZGVtb1RvZ2dsZVN3aXRjaCB9XG4gICAgXTtcblxuICAgIHN1cGVyKCBkZW1vcywgb3B0aW9ucyApO1xuICB9XG59XG5cbnN1bi5yZWdpc3RlciggJ0NvbXBvbmVudHNTY3JlZW5WaWV3JywgQ29tcG9uZW50c1NjcmVlblZpZXcgKTsiXSwibmFtZXMiOlsic3VuIiwiRGVtb3NTY3JlZW5WaWV3IiwiZGVtb0FCU3dpdGNoIiwiZGVtb0FjY29yZGlvbkJveCIsImRlbW9BbGlnbkdyb3VwIiwiZGVtb0Nhcm91c2VsIiwiZGVtb0NoZWNrYm94IiwiZGVtb0NvbWJvQm94IiwiZGVtb051bWJlclBpY2tlciIsImRlbW9OdW1iZXJTcGlubmVyIiwiZGVtb09uT2ZmU3dpdGNoIiwiZGVtb1BhZ2VDb250cm9sIiwiZGVtb0hTbGlkZXIiLCJkZW1vVlNsaWRlciIsImRlbW9Ub2dnbGVTd2l0Y2giLCJDb21wb25lbnRzU2NyZWVuVmlldyIsIm9wdGlvbnMiLCJkZW1vcyIsImxhYmVsIiwiY3JlYXRlTm9kZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Q0FPQyxHQUlELE9BQU9BLFNBQVMsZUFBZTtBQUMvQixPQUFPQyxxQkFBaUQsd0JBQXdCO0FBQ2hGLE9BQU9DLGtCQUFrQixvQkFBb0I7QUFDN0MsT0FBT0Msc0JBQXNCLHdCQUF3QjtBQUNyRCxPQUFPQyxvQkFBb0Isc0JBQXNCO0FBQ2pELE9BQU9DLGtCQUFrQixvQkFBb0I7QUFDN0MsT0FBT0Msa0JBQWtCLG9CQUFvQjtBQUM3QyxPQUFPQyxrQkFBa0Isb0JBQW9CO0FBQzdDLE9BQU9DLHNCQUFzQix3QkFBd0I7QUFDckQsT0FBT0MsdUJBQXVCLHlCQUF5QjtBQUN2RCxPQUFPQyxxQkFBcUIsdUJBQXVCO0FBQ25ELE9BQU9DLHFCQUFxQix1QkFBdUI7QUFDbkQsU0FBU0MsV0FBVyxFQUFFQyxXQUFXLFFBQVEsa0JBQWtCO0FBQzNELE9BQU9DLHNCQUFzQix3QkFBd0I7QUFLdEMsSUFBQSxBQUFNQyx1QkFBTixNQUFNQSw2QkFBNkJkO0lBRWhELFlBQW9CZSxPQUFvQyxDQUFHO1FBRXpELHlEQUF5RDtRQUN6RCxNQUFNQyxRQUFRO1lBQ1o7Z0JBQUVDLE9BQU87Z0JBQVlDLFlBQVlqQjtZQUFhO1lBQzlDO2dCQUFFZ0IsT0FBTztnQkFBWUMsWUFBWWQ7WUFBYTtZQUM5QztnQkFBRWEsT0FBTztnQkFBWUMsWUFBWWI7WUFBYTtZQUM5QztnQkFBRVksT0FBTztnQkFBWUMsWUFBWVo7WUFBYTtZQUM5QztnQkFBRVcsT0FBTztnQkFBV0MsWUFBWVA7WUFBWTtZQUM1QztnQkFBRU0sT0FBTztnQkFBV0MsWUFBWU47WUFBWTtZQUM1QztnQkFBRUssT0FBTztnQkFBZUMsWUFBWVQ7WUFBZ0I7WUFDcEQ7Z0JBQUVRLE9BQU87Z0JBQWVDLFlBQVlSO1lBQWdCO1lBQ3BEO2dCQUFFTyxPQUFPO2dCQUFnQkMsWUFBWVg7WUFBaUI7WUFDdEQ7Z0JBQUVVLE9BQU87Z0JBQWlCQyxZQUFZVjtZQUFrQjtZQUN4RDtnQkFBRVMsT0FBTztnQkFBY0MsWUFBWWY7WUFBZTtZQUNsRDtnQkFBRWMsT0FBTztnQkFBZ0JDLFlBQVloQjtZQUFpQjtZQUN0RDtnQkFBRWUsT0FBTztnQkFBZ0JDLFlBQVlMO1lBQWlCO1NBQ3ZEO1FBRUQsS0FBSyxDQUFFRyxPQUFPRDtJQUNoQjtBQUNGO0FBdkJBLFNBQXFCRCxrQ0F1QnBCO0FBRURmLElBQUlvQixRQUFRLENBQUUsd0JBQXdCTCJ9