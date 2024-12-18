// Copyright 2014-2024, University of Colorado Boulder
/**
 * RectangularStickyToggleButton is a rectangular toggle button that toggles the value of a Property between 2 values.
 * It has a different look (referred to as 'up' and 'down') for the 2 values.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import optionize from '../../../phet-core/js/optionize.js';
import sharedSoundPlayers from '../../../tambo/js/sharedSoundPlayers.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import RectangularButton from './RectangularButton.js';
import StickyToggleButtonInteractionStateProperty from './StickyToggleButtonInteractionStateProperty.js';
import StickyToggleButtonModel from './StickyToggleButtonModel.js';
let RectangularStickyToggleButton = class RectangularStickyToggleButton extends RectangularButton {
    dispose() {
        this.disposeRectangularStickyToggleButton();
        super.dispose();
    }
    /**
   * @param valueProperty - axon Property that can be either valueUp or valueDown.
   * @param valueUp - value when the toggle is in the 'up' position
   * @param valueDown - value when the toggle is in the 'down' position
   * @param providedOptions?
   */ constructor(valueProperty, valueUp, valueDown, providedOptions){
        const options = optionize()({
            soundPlayer: sharedSoundPlayers.get('pushButton'),
            tandem: Tandem.REQUIRED,
            ariaRole: 'switch'
        }, providedOptions);
        // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
        const buttonModel = new StickyToggleButtonModel(valueUp, valueDown, valueProperty, providedOptions);
        const stickyToggleButtonInteractionStateProperty = new StickyToggleButtonInteractionStateProperty(buttonModel);
        super(buttonModel, stickyToggleButtonInteractionStateProperty, options);
        // sound generation
        const playSound = ()=>options.soundPlayer.play();
        buttonModel.produceSoundEmitter.addListener(playSound);
        // pdom - Signify button is 'pressed' when down. Use both aria-pressed and aria-checked
        // because that sounds best in NVDA.
        const updateAria = ()=>{
            this.setPDOMAttribute('aria-pressed', valueProperty.value === valueDown);
            this.setPDOMAttribute('aria-checked', valueProperty.value === valueDown);
        };
        valueProperty.link(updateAria);
        this.disposeRectangularStickyToggleButton = ()=>{
            valueProperty.unlink(updateAria);
            buttonModel.produceSoundEmitter.removeListener(playSound);
            buttonModel.dispose();
        };
    }
};
export { RectangularStickyToggleButton as default };
sun.register('RectangularStickyToggleButton', RectangularStickyToggleButton);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JlY3Rhbmd1bGFyU3RpY2t5VG9nZ2xlQnV0dG9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFJlY3Rhbmd1bGFyU3RpY2t5VG9nZ2xlQnV0dG9uIGlzIGEgcmVjdGFuZ3VsYXIgdG9nZ2xlIGJ1dHRvbiB0aGF0IHRvZ2dsZXMgdGhlIHZhbHVlIG9mIGEgUHJvcGVydHkgYmV0d2VlbiAyIHZhbHVlcy5cbiAqIEl0IGhhcyBhIGRpZmZlcmVudCBsb29rIChyZWZlcnJlZCB0byBhcyAndXAnIGFuZCAnZG93bicpIGZvciB0aGUgMiB2YWx1ZXMuXG4gKlxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHNoYXJlZFNvdW5kUGxheWVycyBmcm9tICcuLi8uLi8uLi90YW1iby9qcy9zaGFyZWRTb3VuZFBsYXllcnMuanMnO1xuaW1wb3J0IFRTb3VuZFBsYXllciBmcm9tICcuLi8uLi8uLi90YW1iby9qcy9UU291bmRQbGF5ZXIuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBzdW4gZnJvbSAnLi4vc3VuLmpzJztcbmltcG9ydCBSZWN0YW5ndWxhckJ1dHRvbiwgeyBSZWN0YW5ndWxhckJ1dHRvbk9wdGlvbnMgfSBmcm9tICcuL1JlY3Rhbmd1bGFyQnV0dG9uLmpzJztcbmltcG9ydCBTdGlja3lUb2dnbGVCdXR0b25JbnRlcmFjdGlvblN0YXRlUHJvcGVydHkgZnJvbSAnLi9TdGlja3lUb2dnbGVCdXR0b25JbnRlcmFjdGlvblN0YXRlUHJvcGVydHkuanMnO1xuaW1wb3J0IFN0aWNreVRvZ2dsZUJ1dHRvbk1vZGVsIGZyb20gJy4vU3RpY2t5VG9nZ2xlQnV0dG9uTW9kZWwuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICBzb3VuZFBsYXllcj86IFRTb3VuZFBsYXllcjtcbn07XG5cbmV4cG9ydCB0eXBlIFJlY3Rhbmd1bGFyU3RpY2t5VG9nZ2xlQnV0dG9uT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUmVjdGFuZ3VsYXJCdXR0b25PcHRpb25zO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWN0YW5ndWxhclN0aWNreVRvZ2dsZUJ1dHRvbjxUPiBleHRlbmRzIFJlY3Rhbmd1bGFyQnV0dG9uIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VSZWN0YW5ndWxhclN0aWNreVRvZ2dsZUJ1dHRvbjogKCkgPT4gdm9pZDtcblxuICAvKipcbiAgICogQHBhcmFtIHZhbHVlUHJvcGVydHkgLSBheG9uIFByb3BlcnR5IHRoYXQgY2FuIGJlIGVpdGhlciB2YWx1ZVVwIG9yIHZhbHVlRG93bi5cbiAgICogQHBhcmFtIHZhbHVlVXAgLSB2YWx1ZSB3aGVuIHRoZSB0b2dnbGUgaXMgaW4gdGhlICd1cCcgcG9zaXRpb25cbiAgICogQHBhcmFtIHZhbHVlRG93biAtIHZhbHVlIHdoZW4gdGhlIHRvZ2dsZSBpcyBpbiB0aGUgJ2Rvd24nIHBvc2l0aW9uXG4gICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnM/XG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHZhbHVlUHJvcGVydHk6IFRQcm9wZXJ0eTxUPiwgdmFsdWVVcDogVCwgdmFsdWVEb3duOiBULCBwcm92aWRlZE9wdGlvbnM/OiBSZWN0YW5ndWxhclN0aWNreVRvZ2dsZUJ1dHRvbk9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFJlY3Rhbmd1bGFyU3RpY2t5VG9nZ2xlQnV0dG9uT3B0aW9ucywgU2VsZk9wdGlvbnMsIFJlY3Rhbmd1bGFyQnV0dG9uT3B0aW9ucz4oKSgge1xuICAgICAgc291bmRQbGF5ZXI6IHNoYXJlZFNvdW5kUGxheWVycy5nZXQoICdwdXNoQnV0dG9uJyApLFxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXG4gICAgICBhcmlhUm9sZTogJ3N3aXRjaCdcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIC8vIE5vdGUgaXQgc2hhcmVzIGEgdGFuZGVtIHdpdGggdGhpcywgc28gdGhlIGVtaXR0ZXIgd2lsbCBiZSBpbnN0cnVtZW50ZWQgYXMgYSBjaGlsZCBvZiB0aGUgYnV0dG9uXG4gICAgY29uc3QgYnV0dG9uTW9kZWwgPSBuZXcgU3RpY2t5VG9nZ2xlQnV0dG9uTW9kZWwoIHZhbHVlVXAsIHZhbHVlRG93biwgdmFsdWVQcm9wZXJ0eSwgcHJvdmlkZWRPcHRpb25zICk7XG4gICAgY29uc3Qgc3RpY2t5VG9nZ2xlQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5ID0gbmV3IFN0aWNreVRvZ2dsZUJ1dHRvbkludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eSggYnV0dG9uTW9kZWwgKTtcblxuICAgIHN1cGVyKCBidXR0b25Nb2RlbCwgc3RpY2t5VG9nZ2xlQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5LCBvcHRpb25zICk7XG5cbiAgICAvLyBzb3VuZCBnZW5lcmF0aW9uXG4gICAgY29uc3QgcGxheVNvdW5kID0gKCkgPT4gb3B0aW9ucy5zb3VuZFBsYXllci5wbGF5KCk7XG4gICAgYnV0dG9uTW9kZWwucHJvZHVjZVNvdW5kRW1pdHRlci5hZGRMaXN0ZW5lciggcGxheVNvdW5kICk7XG5cbiAgICAvLyBwZG9tIC0gU2lnbmlmeSBidXR0b24gaXMgJ3ByZXNzZWQnIHdoZW4gZG93bi4gVXNlIGJvdGggYXJpYS1wcmVzc2VkIGFuZCBhcmlhLWNoZWNrZWRcbiAgICAvLyBiZWNhdXNlIHRoYXQgc291bmRzIGJlc3QgaW4gTlZEQS5cbiAgICBjb25zdCB1cGRhdGVBcmlhID0gKCkgPT4ge1xuICAgICAgdGhpcy5zZXRQRE9NQXR0cmlidXRlKCAnYXJpYS1wcmVzc2VkJywgdmFsdWVQcm9wZXJ0eS52YWx1ZSA9PT0gdmFsdWVEb3duICk7XG4gICAgICB0aGlzLnNldFBET01BdHRyaWJ1dGUoICdhcmlhLWNoZWNrZWQnLCB2YWx1ZVByb3BlcnR5LnZhbHVlID09PSB2YWx1ZURvd24gKTtcbiAgICB9O1xuICAgIHZhbHVlUHJvcGVydHkubGluayggdXBkYXRlQXJpYSApO1xuXG4gICAgdGhpcy5kaXNwb3NlUmVjdGFuZ3VsYXJTdGlja3lUb2dnbGVCdXR0b24gPSAoKSA9PiB7XG4gICAgICB2YWx1ZVByb3BlcnR5LnVubGluayggdXBkYXRlQXJpYSApO1xuICAgICAgYnV0dG9uTW9kZWwucHJvZHVjZVNvdW5kRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggcGxheVNvdW5kICk7XG4gICAgICBidXR0b25Nb2RlbC5kaXNwb3NlKCk7XG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZVJlY3Rhbmd1bGFyU3RpY2t5VG9nZ2xlQnV0dG9uKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnN1bi5yZWdpc3RlciggJ1JlY3Rhbmd1bGFyU3RpY2t5VG9nZ2xlQnV0dG9uJywgUmVjdGFuZ3VsYXJTdGlja3lUb2dnbGVCdXR0b24gKTsiXSwibmFtZXMiOlsib3B0aW9uaXplIiwic2hhcmVkU291bmRQbGF5ZXJzIiwiVGFuZGVtIiwic3VuIiwiUmVjdGFuZ3VsYXJCdXR0b24iLCJTdGlja3lUb2dnbGVCdXR0b25JbnRlcmFjdGlvblN0YXRlUHJvcGVydHkiLCJTdGlja3lUb2dnbGVCdXR0b25Nb2RlbCIsIlJlY3Rhbmd1bGFyU3RpY2t5VG9nZ2xlQnV0dG9uIiwiZGlzcG9zZSIsImRpc3Bvc2VSZWN0YW5ndWxhclN0aWNreVRvZ2dsZUJ1dHRvbiIsInZhbHVlUHJvcGVydHkiLCJ2YWx1ZVVwIiwidmFsdWVEb3duIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInNvdW5kUGxheWVyIiwiZ2V0IiwidGFuZGVtIiwiUkVRVUlSRUQiLCJhcmlhUm9sZSIsImJ1dHRvbk1vZGVsIiwic3RpY2t5VG9nZ2xlQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5IiwicGxheVNvdW5kIiwicGxheSIsInByb2R1Y2VTb3VuZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsInVwZGF0ZUFyaWEiLCJzZXRQRE9NQXR0cmlidXRlIiwidmFsdWUiLCJsaW5rIiwidW5saW5rIiwicmVtb3ZlTGlzdGVuZXIiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Q0FNQyxHQUdELE9BQU9BLGVBQWUscUNBQXFDO0FBQzNELE9BQU9DLHdCQUF3QiwwQ0FBMEM7QUFFekUsT0FBT0MsWUFBWSwrQkFBK0I7QUFDbEQsT0FBT0MsU0FBUyxZQUFZO0FBQzVCLE9BQU9DLHVCQUFxRCx5QkFBeUI7QUFDckYsT0FBT0MsZ0RBQWdELGtEQUFrRDtBQUN6RyxPQUFPQyw2QkFBNkIsK0JBQStCO0FBUXBELElBQUEsQUFBTUMsZ0NBQU4sTUFBTUEsc0NBQXlDSDtJQTJDNUNJLFVBQWdCO1FBQzlCLElBQUksQ0FBQ0Msb0NBQW9DO1FBQ3pDLEtBQUssQ0FBQ0Q7SUFDUjtJQTFDQTs7Ozs7R0FLQyxHQUNELFlBQW9CRSxhQUEyQixFQUFFQyxPQUFVLEVBQUVDLFNBQVksRUFBRUMsZUFBc0QsQ0FBRztRQUVsSSxNQUFNQyxVQUFVZCxZQUEwRjtZQUN4R2UsYUFBYWQsbUJBQW1CZSxHQUFHLENBQUU7WUFDckNDLFFBQVFmLE9BQU9nQixRQUFRO1lBQ3ZCQyxVQUFVO1FBQ1osR0FBR047UUFFSCxrR0FBa0c7UUFDbEcsTUFBTU8sY0FBYyxJQUFJZCx3QkFBeUJLLFNBQVNDLFdBQVdGLGVBQWVHO1FBQ3BGLE1BQU1RLDZDQUE2QyxJQUFJaEIsMkNBQTRDZTtRQUVuRyxLQUFLLENBQUVBLGFBQWFDLDRDQUE0Q1A7UUFFaEUsbUJBQW1CO1FBQ25CLE1BQU1RLFlBQVksSUFBTVIsUUFBUUMsV0FBVyxDQUFDUSxJQUFJO1FBQ2hESCxZQUFZSSxtQkFBbUIsQ0FBQ0MsV0FBVyxDQUFFSDtRQUU3Qyx1RkFBdUY7UUFDdkYsb0NBQW9DO1FBQ3BDLE1BQU1JLGFBQWE7WUFDakIsSUFBSSxDQUFDQyxnQkFBZ0IsQ0FBRSxnQkFBZ0JqQixjQUFja0IsS0FBSyxLQUFLaEI7WUFDL0QsSUFBSSxDQUFDZSxnQkFBZ0IsQ0FBRSxnQkFBZ0JqQixjQUFja0IsS0FBSyxLQUFLaEI7UUFDakU7UUFDQUYsY0FBY21CLElBQUksQ0FBRUg7UUFFcEIsSUFBSSxDQUFDakIsb0NBQW9DLEdBQUc7WUFDMUNDLGNBQWNvQixNQUFNLENBQUVKO1lBQ3RCTixZQUFZSSxtQkFBbUIsQ0FBQ08sY0FBYyxDQUFFVDtZQUNoREYsWUFBWVosT0FBTztRQUNyQjtJQUNGO0FBTUY7QUEvQ0EsU0FBcUJELDJDQStDcEI7QUFFREosSUFBSTZCLFFBQVEsQ0FBRSxpQ0FBaUN6QiJ9