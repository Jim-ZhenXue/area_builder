// Copyright 2018-2023, University of Colorado Boulder
/**
 * IOType for a window.Event. Since this needs to support any data from any subtype of window.Event, we supply NullableIO
 * attributes for the union of different supported subtypes.  The subtypes are listed at https://developer.mozilla.org/en-US/docs/Web/API/Event
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import BooleanIO from '../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../tandem/js/types/IOType.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import ObjectLiteralIO from '../../../tandem/js/types/ObjectLiteralIO.js';
import StringIO from '../../../tandem/js/types/StringIO.js';
import { Input, scenery } from '../imports.js';
const EventIO = new IOType('EventIO', {
    valueType: window.Event,
    documentation: 'A DOM Event',
    toStateObject: (domEvent)=>Input.serializeDomEvent(domEvent),
    fromStateObject: (stateObject)=>Input.deserializeDomEvent(stateObject),
    // This should remain the same as Input.domEventPropertiesToSerialize (local var). Each key can be null depending on
    // what Event interface is being serialized (which depends on what DOM Event the instance is).
    stateSchema: ()=>({
            constructorName: StringIO,
            altKey: NullableIO(BooleanIO),
            button: NullableIO(NumberIO),
            charCode: NullableIO(NumberIO),
            clientX: NullableIO(NumberIO),
            clientY: NullableIO(NumberIO),
            code: NullableIO(StringIO),
            ctrlKey: NullableIO(BooleanIO),
            deltaMode: NullableIO(NumberIO),
            deltaX: NullableIO(NumberIO),
            deltaY: NullableIO(NumberIO),
            deltaZ: NullableIO(NumberIO),
            key: NullableIO(StringIO),
            keyCode: NullableIO(NumberIO),
            metaKey: NullableIO(BooleanIO),
            pageX: NullableIO(NumberIO),
            pageY: NullableIO(NumberIO),
            pointerId: NullableIO(NumberIO),
            pointerType: NullableIO(StringIO),
            scale: NullableIO(NumberIO),
            shiftKey: NullableIO(BooleanIO),
            target: NullableIO(ObjectLiteralIO),
            type: NullableIO(StringIO),
            relatedTarget: NullableIO(ObjectLiteralIO),
            which: NullableIO(NumberIO)
        })
});
scenery.register('EventIO', EventIO);
export default EventIO;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW5wdXQvRXZlbnRJTy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBJT1R5cGUgZm9yIGEgd2luZG93LkV2ZW50LiBTaW5jZSB0aGlzIG5lZWRzIHRvIHN1cHBvcnQgYW55IGRhdGEgZnJvbSBhbnkgc3VidHlwZSBvZiB3aW5kb3cuRXZlbnQsIHdlIHN1cHBseSBOdWxsYWJsZUlPXG4gKiBhdHRyaWJ1dGVzIGZvciB0aGUgdW5pb24gb2YgZGlmZmVyZW50IHN1cHBvcnRlZCBzdWJ0eXBlcy4gIFRoZSBzdWJ0eXBlcyBhcmUgbGlzdGVkIGF0IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9FdmVudFxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IEJvb2xlYW5JTyBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvQm9vbGVhbklPLmpzJztcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XG5pbXBvcnQgTnVsbGFibGVJTyBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTnVsbGFibGVJTy5qcyc7XG5pbXBvcnQgTnVtYmVySU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bWJlcklPLmpzJztcbmltcG9ydCBPYmplY3RMaXRlcmFsSU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL09iamVjdExpdGVyYWxJTy5qcyc7XG5pbXBvcnQgU3RyaW5nSU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1N0cmluZ0lPLmpzJztcbmltcG9ydCB7IElucHV0LCBzY2VuZXJ5IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmNvbnN0IEV2ZW50SU8gPSBuZXcgSU9UeXBlKCAnRXZlbnRJTycsIHtcbiAgdmFsdWVUeXBlOiB3aW5kb3cuRXZlbnQsXG4gIGRvY3VtZW50YXRpb246ICdBIERPTSBFdmVudCcsXG4gIHRvU3RhdGVPYmplY3Q6IGRvbUV2ZW50ID0+IElucHV0LnNlcmlhbGl6ZURvbUV2ZW50KCBkb21FdmVudCApLFxuICBmcm9tU3RhdGVPYmplY3Q6IHN0YXRlT2JqZWN0ID0+IElucHV0LmRlc2VyaWFsaXplRG9tRXZlbnQoIHN0YXRlT2JqZWN0ICksXG5cbiAgLy8gVGhpcyBzaG91bGQgcmVtYWluIHRoZSBzYW1lIGFzIElucHV0LmRvbUV2ZW50UHJvcGVydGllc1RvU2VyaWFsaXplIChsb2NhbCB2YXIpLiBFYWNoIGtleSBjYW4gYmUgbnVsbCBkZXBlbmRpbmcgb25cbiAgLy8gd2hhdCBFdmVudCBpbnRlcmZhY2UgaXMgYmVpbmcgc2VyaWFsaXplZCAod2hpY2ggZGVwZW5kcyBvbiB3aGF0IERPTSBFdmVudCB0aGUgaW5zdGFuY2UgaXMpLlxuICBzdGF0ZVNjaGVtYTogKCkgPT4gKCB7XG4gICAgY29uc3RydWN0b3JOYW1lOiBTdHJpbmdJTyxcbiAgICBhbHRLZXk6IE51bGxhYmxlSU8oIEJvb2xlYW5JTyApLFxuICAgIGJ1dHRvbjogTnVsbGFibGVJTyggTnVtYmVySU8gKSxcbiAgICBjaGFyQ29kZTogTnVsbGFibGVJTyggTnVtYmVySU8gKSxcbiAgICBjbGllbnRYOiBOdWxsYWJsZUlPKCBOdW1iZXJJTyApLFxuICAgIGNsaWVudFk6IE51bGxhYmxlSU8oIE51bWJlcklPICksXG4gICAgY29kZTogTnVsbGFibGVJTyggU3RyaW5nSU8gKSxcbiAgICBjdHJsS2V5OiBOdWxsYWJsZUlPKCBCb29sZWFuSU8gKSxcbiAgICBkZWx0YU1vZGU6IE51bGxhYmxlSU8oIE51bWJlcklPICksXG4gICAgZGVsdGFYOiBOdWxsYWJsZUlPKCBOdW1iZXJJTyApLFxuICAgIGRlbHRhWTogTnVsbGFibGVJTyggTnVtYmVySU8gKSxcbiAgICBkZWx0YVo6IE51bGxhYmxlSU8oIE51bWJlcklPICksXG4gICAga2V5OiBOdWxsYWJsZUlPKCBTdHJpbmdJTyApLFxuICAgIGtleUNvZGU6IE51bGxhYmxlSU8oIE51bWJlcklPICksXG4gICAgbWV0YUtleTogTnVsbGFibGVJTyggQm9vbGVhbklPICksXG4gICAgcGFnZVg6IE51bGxhYmxlSU8oIE51bWJlcklPICksXG4gICAgcGFnZVk6IE51bGxhYmxlSU8oIE51bWJlcklPICksXG4gICAgcG9pbnRlcklkOiBOdWxsYWJsZUlPKCBOdW1iZXJJTyApLFxuICAgIHBvaW50ZXJUeXBlOiBOdWxsYWJsZUlPKCBTdHJpbmdJTyApLFxuICAgIHNjYWxlOiBOdWxsYWJsZUlPKCBOdW1iZXJJTyApLFxuICAgIHNoaWZ0S2V5OiBOdWxsYWJsZUlPKCBCb29sZWFuSU8gKSxcbiAgICB0YXJnZXQ6IE51bGxhYmxlSU8oIE9iamVjdExpdGVyYWxJTyApLFxuICAgIHR5cGU6IE51bGxhYmxlSU8oIFN0cmluZ0lPICksXG4gICAgcmVsYXRlZFRhcmdldDogTnVsbGFibGVJTyggT2JqZWN0TGl0ZXJhbElPICksXG4gICAgd2hpY2g6IE51bGxhYmxlSU8oIE51bWJlcklPIClcbiAgfSApXG59ICk7XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdFdmVudElPJywgRXZlbnRJTyApO1xuZXhwb3J0IGRlZmF1bHQgRXZlbnRJTzsiXSwibmFtZXMiOlsiQm9vbGVhbklPIiwiSU9UeXBlIiwiTnVsbGFibGVJTyIsIk51bWJlcklPIiwiT2JqZWN0TGl0ZXJhbElPIiwiU3RyaW5nSU8iLCJJbnB1dCIsInNjZW5lcnkiLCJFdmVudElPIiwidmFsdWVUeXBlIiwid2luZG93IiwiRXZlbnQiLCJkb2N1bWVudGF0aW9uIiwidG9TdGF0ZU9iamVjdCIsImRvbUV2ZW50Iiwic2VyaWFsaXplRG9tRXZlbnQiLCJmcm9tU3RhdGVPYmplY3QiLCJzdGF0ZU9iamVjdCIsImRlc2VyaWFsaXplRG9tRXZlbnQiLCJzdGF0ZVNjaGVtYSIsImNvbnN0cnVjdG9yTmFtZSIsImFsdEtleSIsImJ1dHRvbiIsImNoYXJDb2RlIiwiY2xpZW50WCIsImNsaWVudFkiLCJjb2RlIiwiY3RybEtleSIsImRlbHRhTW9kZSIsImRlbHRhWCIsImRlbHRhWSIsImRlbHRhWiIsImtleSIsImtleUNvZGUiLCJtZXRhS2V5IiwicGFnZVgiLCJwYWdlWSIsInBvaW50ZXJJZCIsInBvaW50ZXJUeXBlIiwic2NhbGUiLCJzaGlmdEtleSIsInRhcmdldCIsInR5cGUiLCJyZWxhdGVkVGFyZ2V0Iiwid2hpY2giLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7O0NBT0MsR0FFRCxPQUFPQSxlQUFlLHdDQUF3QztBQUM5RCxPQUFPQyxZQUFZLHFDQUFxQztBQUN4RCxPQUFPQyxnQkFBZ0IseUNBQXlDO0FBQ2hFLE9BQU9DLGNBQWMsdUNBQXVDO0FBQzVELE9BQU9DLHFCQUFxQiw4Q0FBOEM7QUFDMUUsT0FBT0MsY0FBYyx1Q0FBdUM7QUFDNUQsU0FBU0MsS0FBSyxFQUFFQyxPQUFPLFFBQVEsZ0JBQWdCO0FBRS9DLE1BQU1DLFVBQVUsSUFBSVAsT0FBUSxXQUFXO0lBQ3JDUSxXQUFXQyxPQUFPQyxLQUFLO0lBQ3ZCQyxlQUFlO0lBQ2ZDLGVBQWVDLENBQUFBLFdBQVlSLE1BQU1TLGlCQUFpQixDQUFFRDtJQUNwREUsaUJBQWlCQyxDQUFBQSxjQUFlWCxNQUFNWSxtQkFBbUIsQ0FBRUQ7SUFFM0Qsb0hBQW9IO0lBQ3BILDhGQUE4RjtJQUM5RkUsYUFBYSxJQUFRLENBQUE7WUFDbkJDLGlCQUFpQmY7WUFDakJnQixRQUFRbkIsV0FBWUY7WUFDcEJzQixRQUFRcEIsV0FBWUM7WUFDcEJvQixVQUFVckIsV0FBWUM7WUFDdEJxQixTQUFTdEIsV0FBWUM7WUFDckJzQixTQUFTdkIsV0FBWUM7WUFDckJ1QixNQUFNeEIsV0FBWUc7WUFDbEJzQixTQUFTekIsV0FBWUY7WUFDckI0QixXQUFXMUIsV0FBWUM7WUFDdkIwQixRQUFRM0IsV0FBWUM7WUFDcEIyQixRQUFRNUIsV0FBWUM7WUFDcEI0QixRQUFRN0IsV0FBWUM7WUFDcEI2QixLQUFLOUIsV0FBWUc7WUFDakI0QixTQUFTL0IsV0FBWUM7WUFDckIrQixTQUFTaEMsV0FBWUY7WUFDckJtQyxPQUFPakMsV0FBWUM7WUFDbkJpQyxPQUFPbEMsV0FBWUM7WUFDbkJrQyxXQUFXbkMsV0FBWUM7WUFDdkJtQyxhQUFhcEMsV0FBWUc7WUFDekJrQyxPQUFPckMsV0FBWUM7WUFDbkJxQyxVQUFVdEMsV0FBWUY7WUFDdEJ5QyxRQUFRdkMsV0FBWUU7WUFDcEJzQyxNQUFNeEMsV0FBWUc7WUFDbEJzQyxlQUFlekMsV0FBWUU7WUFDM0J3QyxPQUFPMUMsV0FBWUM7UUFDckIsQ0FBQTtBQUNGO0FBRUFJLFFBQVFzQyxRQUFRLENBQUUsV0FBV3JDO0FBQzdCLGVBQWVBLFFBQVEifQ==