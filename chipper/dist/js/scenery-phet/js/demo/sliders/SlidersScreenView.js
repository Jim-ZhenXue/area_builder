// Copyright 2014-2024, University of Colorado Boulder
/**
 * Demonstration of scenery-phet sliders.
 * Demos are selected from a combo box, and are instantiated on demand.
 * Use the 'slider' query parameter to set the initial selection of the combo box.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */ import DemosScreenView from '../../../../sun/js/demo/DemosScreenView.js';
import sceneryPhet from '../../sceneryPhet.js';
import demoNumberControl from './demoNumberControl.js';
import demoNumberControlWithSpectrum from './demoNumberControlWithSpectrum.js';
import demoSliderWithSpectrum from './demoSliderWithSpectrum.js';
import demoWavelengthNumberControl from './demoWavelengthNumberControl.js';
let SlidersScreenView = class SlidersScreenView extends DemosScreenView {
    constructor(options){
        // To add a demo, add an entry here of type DemoItemData.
        const demos = [
            {
                label: 'NumberControl',
                createNode: demoNumberControl
            },
            {
                label: 'WavelengthNumberControl',
                createNode: demoWavelengthNumberControl
            },
            {
                label: 'SpectrumSliderTrack',
                createNode: demoSliderWithSpectrum
            },
            {
                label: 'NumberControlWithSpectrum',
                createNode: demoNumberControlWithSpectrum
            }
        ];
        super(demos, options);
    }
};
export { SlidersScreenView as default };
sceneryPhet.register('SlidersScreenView', SlidersScreenView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL3NsaWRlcnMvU2xpZGVyc1NjcmVlblZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVtb25zdHJhdGlvbiBvZiBzY2VuZXJ5LXBoZXQgc2xpZGVycy5cbiAqIERlbW9zIGFyZSBzZWxlY3RlZCBmcm9tIGEgY29tYm8gYm94LCBhbmQgYXJlIGluc3RhbnRpYXRlZCBvbiBkZW1hbmQuXG4gKiBVc2UgdGhlICdzbGlkZXInIHF1ZXJ5IHBhcmFtZXRlciB0byBzZXQgdGhlIGluaXRpYWwgc2VsZWN0aW9uIG9mIHRoZSBjb21ibyBib3guXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcbmltcG9ydCBEZW1vc1NjcmVlblZpZXcsIHsgRGVtb3NTY3JlZW5WaWV3T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL0RlbW9zU2NyZWVuVmlldy5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vLi4vc2NlbmVyeVBoZXQuanMnO1xuaW1wb3J0IGRlbW9OdW1iZXJDb250cm9sIGZyb20gJy4vZGVtb051bWJlckNvbnRyb2wuanMnO1xuaW1wb3J0IGRlbW9OdW1iZXJDb250cm9sV2l0aFNwZWN0cnVtIGZyb20gJy4vZGVtb051bWJlckNvbnRyb2xXaXRoU3BlY3RydW0uanMnO1xuaW1wb3J0IGRlbW9TbGlkZXJXaXRoU3BlY3RydW0gZnJvbSAnLi9kZW1vU2xpZGVyV2l0aFNwZWN0cnVtLmpzJztcbmltcG9ydCBkZW1vV2F2ZWxlbmd0aE51bWJlckNvbnRyb2wgZnJvbSAnLi9kZW1vV2F2ZWxlbmd0aE51bWJlckNvbnRyb2wuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcbnR5cGUgU2xpZGVyc1NjcmVlblZpZXdPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8RGVtb3NTY3JlZW5WaWV3T3B0aW9ucywgJ3RhbmRlbSc+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTbGlkZXJzU2NyZWVuVmlldyBleHRlbmRzIERlbW9zU2NyZWVuVmlldyB7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBvcHRpb25zOiBTbGlkZXJzU2NyZWVuVmlld09wdGlvbnMgKSB7XG5cbiAgICAvLyBUbyBhZGQgYSBkZW1vLCBhZGQgYW4gZW50cnkgaGVyZSBvZiB0eXBlIERlbW9JdGVtRGF0YS5cbiAgICBjb25zdCBkZW1vcyA9IFtcbiAgICAgIHsgbGFiZWw6ICdOdW1iZXJDb250cm9sJywgY3JlYXRlTm9kZTogZGVtb051bWJlckNvbnRyb2wgfSxcbiAgICAgIHsgbGFiZWw6ICdXYXZlbGVuZ3RoTnVtYmVyQ29udHJvbCcsIGNyZWF0ZU5vZGU6IGRlbW9XYXZlbGVuZ3RoTnVtYmVyQ29udHJvbCB9LFxuICAgICAgeyBsYWJlbDogJ1NwZWN0cnVtU2xpZGVyVHJhY2snLCBjcmVhdGVOb2RlOiBkZW1vU2xpZGVyV2l0aFNwZWN0cnVtIH0sXG4gICAgICB7IGxhYmVsOiAnTnVtYmVyQ29udHJvbFdpdGhTcGVjdHJ1bScsIGNyZWF0ZU5vZGU6IGRlbW9OdW1iZXJDb250cm9sV2l0aFNwZWN0cnVtIH1cbiAgICBdO1xuXG4gICAgc3VwZXIoIGRlbW9zLCBvcHRpb25zICk7XG4gIH1cbn1cblxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdTbGlkZXJzU2NyZWVuVmlldycsIFNsaWRlcnNTY3JlZW5WaWV3ICk7Il0sIm5hbWVzIjpbIkRlbW9zU2NyZWVuVmlldyIsInNjZW5lcnlQaGV0IiwiZGVtb051bWJlckNvbnRyb2wiLCJkZW1vTnVtYmVyQ29udHJvbFdpdGhTcGVjdHJ1bSIsImRlbW9TbGlkZXJXaXRoU3BlY3RydW0iLCJkZW1vV2F2ZWxlbmd0aE51bWJlckNvbnRyb2wiLCJTbGlkZXJzU2NyZWVuVmlldyIsIm9wdGlvbnMiLCJkZW1vcyIsImxhYmVsIiwiY3JlYXRlTm9kZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Q0FPQyxHQUlELE9BQU9BLHFCQUFpRCw2Q0FBNkM7QUFDckcsT0FBT0MsaUJBQWlCLHVCQUF1QjtBQUMvQyxPQUFPQyx1QkFBdUIseUJBQXlCO0FBQ3ZELE9BQU9DLG1DQUFtQyxxQ0FBcUM7QUFDL0UsT0FBT0MsNEJBQTRCLDhCQUE4QjtBQUNqRSxPQUFPQyxpQ0FBaUMsbUNBQW1DO0FBSzVELElBQUEsQUFBTUMsb0JBQU4sTUFBTUEsMEJBQTBCTjtJQUU3QyxZQUFvQk8sT0FBaUMsQ0FBRztRQUV0RCx5REFBeUQ7UUFDekQsTUFBTUMsUUFBUTtZQUNaO2dCQUFFQyxPQUFPO2dCQUFpQkMsWUFBWVI7WUFBa0I7WUFDeEQ7Z0JBQUVPLE9BQU87Z0JBQTJCQyxZQUFZTDtZQUE0QjtZQUM1RTtnQkFBRUksT0FBTztnQkFBdUJDLFlBQVlOO1lBQXVCO1lBQ25FO2dCQUFFSyxPQUFPO2dCQUE2QkMsWUFBWVA7WUFBOEI7U0FDakY7UUFFRCxLQUFLLENBQUVLLE9BQU9EO0lBQ2hCO0FBQ0Y7QUFkQSxTQUFxQkQsK0JBY3BCO0FBRURMLFlBQVlVLFFBQVEsQ0FBRSxxQkFBcUJMIn0=