// Copyright 2019-2024, University of Colorado Boulder
/**
 * DefaultSliderTrack is composed of two rectangles, one for the enabled section of the track and one for the disabled
 * section.  The enabled track rectangle sits on top of the disabled track so that the enabled range can be any
 * desired sub range of the full slider range.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import Multilink from '../../axon/js/Multilink.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { Node, Rectangle } from '../../scenery/js/imports.js';
import { default as SliderTrack } from './SliderTrack.js';
import sun from './sun.js';
let DefaultSliderTrack = class DefaultSliderTrack extends SliderTrack {
    dispose() {
        this.disposeDefaultSliderTrack();
        super.dispose();
    }
    constructor(valueProperty, range, providedOptions){
        const options = optionize()({
            fillEnabled: 'white',
            fillDisabled: 'gray',
            stroke: 'black',
            lineWidth: 1,
            cornerRadius: 0
        }, providedOptions);
        // Represents the disabled range of the slider, always visible and always the full range
        // of the slider so that when the enabled range changes we see the enabled sub-range on top of the
        // full range of the slider.
        const disabledTrack = new Rectangle({
            fill: options.fillDisabled,
            stroke: options.stroke,
            lineWidth: options.lineWidth,
            cornerRadius: options.cornerRadius,
            cursor: 'default',
            pickable: false
        });
        // Will change size depending on the enabled range of the slider.  On top so that we can see
        // the enabled sub-range of the slider.
        const enabledTrack = new Rectangle({
            fill: options.fillEnabled,
            stroke: options.stroke,
            lineWidth: options.lineWidth,
            cornerRadius: options.cornerRadius
        });
        const trackNode = new Node({
            children: [
                disabledTrack,
                enabledTrack
            ]
        });
        super(valueProperty, trackNode, range, combineOptions({
            // Historically, our stroke will overflow
            leftVisualOverflow: options.stroke !== null ? options.lineWidth / 2 : 0,
            rightVisualOverflow: options.stroke !== null ? options.lineWidth / 2 : 0
        }, options));
        // when the enabled range changes gray out the unusable parts of the slider
        const updateMultilink = Multilink.multilink([
            options.enabledRangeProperty,
            this.valueToPositionProperty,
            this.sizeProperty
        ], (enabledRange, valueToPosition, size)=>{
            const enabledMinX = valueToPosition.evaluate(enabledRange.min);
            const enabledMaxX = valueToPosition.evaluate(enabledRange.max);
            disabledTrack.setRect(0, 0, size.width, size.height);
            enabledTrack.setRect(enabledMinX, 0, enabledMaxX - enabledMinX, size.height);
        });
        this.disposeDefaultSliderTrack = ()=>{
            updateMultilink.dispose();
        };
    }
};
export { DefaultSliderTrack as default };
sun.register('DefaultSliderTrack', DefaultSliderTrack);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9EZWZhdWx0U2xpZGVyVHJhY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVmYXVsdFNsaWRlclRyYWNrIGlzIGNvbXBvc2VkIG9mIHR3byByZWN0YW5nbGVzLCBvbmUgZm9yIHRoZSBlbmFibGVkIHNlY3Rpb24gb2YgdGhlIHRyYWNrIGFuZCBvbmUgZm9yIHRoZSBkaXNhYmxlZFxuICogc2VjdGlvbi4gIFRoZSBlbmFibGVkIHRyYWNrIHJlY3RhbmdsZSBzaXRzIG9uIHRvcCBvZiB0aGUgZGlzYWJsZWQgdHJhY2sgc28gdGhhdCB0aGUgZW5hYmxlZCByYW5nZSBjYW4gYmUgYW55XG4gKiBkZXNpcmVkIHN1YiByYW5nZSBvZiB0aGUgZnVsbCBzbGlkZXIgcmFuZ2UuXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xuaW1wb3J0IHsgTm9kZSwgUmVjdGFuZ2xlLCBUUGFpbnQgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHsgZGVmYXVsdCBhcyBTbGlkZXJUcmFjaywgU2xpZGVyVHJhY2tPcHRpb25zIH0gZnJvbSAnLi9TbGlkZXJUcmFjay5qcyc7XG5pbXBvcnQgc3VuIGZyb20gJy4vc3VuLmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcbiAgZmlsbEVuYWJsZWQ/OiBUUGFpbnQ7XG4gIGZpbGxEaXNhYmxlZD86IFRQYWludDtcbiAgc3Ryb2tlPzogVFBhaW50O1xuXG4gIGxpbmVXaWR0aD86IG51bWJlcjtcbiAgY29ybmVyUmFkaXVzPzogbnVtYmVyO1xufTtcblxuLy8gV2UgcmVxdWlyZSBzaXplL2VuYWJsZWRSYW5nZVByb3BlcnR5IGluc3RlYWQgb2YgbGVhdmluZyBpdCBvcHRpb25hbCBmb3IgdGhlIHN1cGVydHlwZVxuZXhwb3J0IHR5cGUgRGVmYXVsdFNsaWRlclRyYWNrT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU2xpZGVyVHJhY2tPcHRpb25zICYgUGlja1JlcXVpcmVkPFNsaWRlclRyYWNrT3B0aW9ucywgJ3NpemUnIHwgJ2VuYWJsZWRSYW5nZVByb3BlcnR5Jz47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERlZmF1bHRTbGlkZXJUcmFjayBleHRlbmRzIFNsaWRlclRyYWNrIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VEZWZhdWx0U2xpZGVyVHJhY2s6ICgpID0+IHZvaWQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB2YWx1ZVByb3BlcnR5OiBUUHJvcGVydHk8bnVtYmVyPiwgcmFuZ2U6IFJhbmdlIHwgVFJlYWRPbmx5UHJvcGVydHk8UmFuZ2U+LCBwcm92aWRlZE9wdGlvbnM/OiBEZWZhdWx0U2xpZGVyVHJhY2tPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxEZWZhdWx0U2xpZGVyVHJhY2tPcHRpb25zLCBTZWxmT3B0aW9ucywgU2xpZGVyVHJhY2tPcHRpb25zPigpKCB7XG4gICAgICBmaWxsRW5hYmxlZDogJ3doaXRlJyxcbiAgICAgIGZpbGxEaXNhYmxlZDogJ2dyYXknLFxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxuICAgICAgbGluZVdpZHRoOiAxLFxuICAgICAgY29ybmVyUmFkaXVzOiAwXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAvLyBSZXByZXNlbnRzIHRoZSBkaXNhYmxlZCByYW5nZSBvZiB0aGUgc2xpZGVyLCBhbHdheXMgdmlzaWJsZSBhbmQgYWx3YXlzIHRoZSBmdWxsIHJhbmdlXG4gICAgLy8gb2YgdGhlIHNsaWRlciBzbyB0aGF0IHdoZW4gdGhlIGVuYWJsZWQgcmFuZ2UgY2hhbmdlcyB3ZSBzZWUgdGhlIGVuYWJsZWQgc3ViLXJhbmdlIG9uIHRvcCBvZiB0aGVcbiAgICAvLyBmdWxsIHJhbmdlIG9mIHRoZSBzbGlkZXIuXG4gICAgY29uc3QgZGlzYWJsZWRUcmFjayA9IG5ldyBSZWN0YW5nbGUoIHtcbiAgICAgIGZpbGw6IG9wdGlvbnMuZmlsbERpc2FibGVkLFxuICAgICAgc3Ryb2tlOiBvcHRpb25zLnN0cm9rZSxcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5saW5lV2lkdGgsXG4gICAgICBjb3JuZXJSYWRpdXM6IG9wdGlvbnMuY29ybmVyUmFkaXVzLFxuICAgICAgY3Vyc29yOiAnZGVmYXVsdCcsXG4gICAgICBwaWNrYWJsZTogZmFsc2VcbiAgICB9ICk7XG5cbiAgICAvLyBXaWxsIGNoYW5nZSBzaXplIGRlcGVuZGluZyBvbiB0aGUgZW5hYmxlZCByYW5nZSBvZiB0aGUgc2xpZGVyLiAgT24gdG9wIHNvIHRoYXQgd2UgY2FuIHNlZVxuICAgIC8vIHRoZSBlbmFibGVkIHN1Yi1yYW5nZSBvZiB0aGUgc2xpZGVyLlxuICAgIGNvbnN0IGVuYWJsZWRUcmFjayA9IG5ldyBSZWN0YW5nbGUoIHtcbiAgICAgIGZpbGw6IG9wdGlvbnMuZmlsbEVuYWJsZWQsXG4gICAgICBzdHJva2U6IG9wdGlvbnMuc3Ryb2tlLFxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLmxpbmVXaWR0aCxcbiAgICAgIGNvcm5lclJhZGl1czogb3B0aW9ucy5jb3JuZXJSYWRpdXNcbiAgICB9ICk7XG5cbiAgICBjb25zdCB0cmFja05vZGUgPSBuZXcgTm9kZSgge1xuICAgICAgY2hpbGRyZW46IFsgZGlzYWJsZWRUcmFjaywgZW5hYmxlZFRyYWNrIF1cbiAgICB9ICk7XG4gICAgc3VwZXIoIHZhbHVlUHJvcGVydHksIHRyYWNrTm9kZSwgcmFuZ2UsIGNvbWJpbmVPcHRpb25zPFNsaWRlclRyYWNrT3B0aW9ucz4oIHtcblxuICAgICAgLy8gSGlzdG9yaWNhbGx5LCBvdXIgc3Ryb2tlIHdpbGwgb3ZlcmZsb3dcbiAgICAgIGxlZnRWaXN1YWxPdmVyZmxvdzogb3B0aW9ucy5zdHJva2UgIT09IG51bGwgPyBvcHRpb25zLmxpbmVXaWR0aCAvIDIgOiAwLFxuICAgICAgcmlnaHRWaXN1YWxPdmVyZmxvdzogb3B0aW9ucy5zdHJva2UgIT09IG51bGwgPyBvcHRpb25zLmxpbmVXaWR0aCAvIDIgOiAwXG4gICAgfSwgb3B0aW9ucyApICk7XG5cbiAgICAvLyB3aGVuIHRoZSBlbmFibGVkIHJhbmdlIGNoYW5nZXMgZ3JheSBvdXQgdGhlIHVudXNhYmxlIHBhcnRzIG9mIHRoZSBzbGlkZXJcbiAgICBjb25zdCB1cGRhdGVNdWx0aWxpbmsgPSBNdWx0aWxpbmsubXVsdGlsaW5rKCBbXG4gICAgICBvcHRpb25zLmVuYWJsZWRSYW5nZVByb3BlcnR5LFxuICAgICAgdGhpcy52YWx1ZVRvUG9zaXRpb25Qcm9wZXJ0eSxcbiAgICAgIHRoaXMuc2l6ZVByb3BlcnR5XG4gICAgXSwgKCBlbmFibGVkUmFuZ2UsIHZhbHVlVG9Qb3NpdGlvbiwgc2l6ZSApID0+IHtcbiAgICAgIGNvbnN0IGVuYWJsZWRNaW5YID0gdmFsdWVUb1Bvc2l0aW9uLmV2YWx1YXRlKCBlbmFibGVkUmFuZ2UubWluICk7XG4gICAgICBjb25zdCBlbmFibGVkTWF4WCA9IHZhbHVlVG9Qb3NpdGlvbi5ldmFsdWF0ZSggZW5hYmxlZFJhbmdlLm1heCApO1xuXG4gICAgICBkaXNhYmxlZFRyYWNrLnNldFJlY3QoIDAsIDAsIHNpemUud2lkdGgsIHNpemUuaGVpZ2h0ICk7XG4gICAgICBlbmFibGVkVHJhY2suc2V0UmVjdCggZW5hYmxlZE1pblgsIDAsIGVuYWJsZWRNYXhYIC0gZW5hYmxlZE1pblgsIHNpemUuaGVpZ2h0ICk7XG4gICAgfSApO1xuXG4gICAgdGhpcy5kaXNwb3NlRGVmYXVsdFNsaWRlclRyYWNrID0gKCkgPT4ge1xuICAgICAgdXBkYXRlTXVsdGlsaW5rLmRpc3Bvc2UoKTtcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlRGVmYXVsdFNsaWRlclRyYWNrKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnN1bi5yZWdpc3RlciggJ0RlZmF1bHRTbGlkZXJUcmFjaycsIERlZmF1bHRTbGlkZXJUcmFjayApOyJdLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIk5vZGUiLCJSZWN0YW5nbGUiLCJkZWZhdWx0IiwiU2xpZGVyVHJhY2siLCJzdW4iLCJEZWZhdWx0U2xpZGVyVHJhY2siLCJkaXNwb3NlIiwiZGlzcG9zZURlZmF1bHRTbGlkZXJUcmFjayIsInZhbHVlUHJvcGVydHkiLCJyYW5nZSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJmaWxsRW5hYmxlZCIsImZpbGxEaXNhYmxlZCIsInN0cm9rZSIsImxpbmVXaWR0aCIsImNvcm5lclJhZGl1cyIsImRpc2FibGVkVHJhY2siLCJmaWxsIiwiY3Vyc29yIiwicGlja2FibGUiLCJlbmFibGVkVHJhY2siLCJ0cmFja05vZGUiLCJjaGlsZHJlbiIsImxlZnRWaXN1YWxPdmVyZmxvdyIsInJpZ2h0VmlzdWFsT3ZlcmZsb3ciLCJ1cGRhdGVNdWx0aWxpbmsiLCJtdWx0aWxpbmsiLCJlbmFibGVkUmFuZ2VQcm9wZXJ0eSIsInZhbHVlVG9Qb3NpdGlvblByb3BlcnR5Iiwic2l6ZVByb3BlcnR5IiwiZW5hYmxlZFJhbmdlIiwidmFsdWVUb1Bvc2l0aW9uIiwic2l6ZSIsImVuYWJsZWRNaW5YIiwiZXZhbHVhdGUiLCJtaW4iLCJlbmFibGVkTWF4WCIsIm1heCIsInNldFJlY3QiLCJ3aWR0aCIsImhlaWdodCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7O0NBUUMsR0FFRCxPQUFPQSxlQUFlLDZCQUE2QjtBQUluRCxPQUFPQyxhQUFhQyxjQUFjLFFBQVEsa0NBQWtDO0FBRTVFLFNBQVNDLElBQUksRUFBRUMsU0FBUyxRQUFnQiw4QkFBOEI7QUFDdEUsU0FBU0MsV0FBV0MsV0FBVyxRQUE0QixtQkFBbUI7QUFDOUUsT0FBT0MsU0FBUyxXQUFXO0FBY1osSUFBQSxBQUFNQyxxQkFBTixNQUFNQSwyQkFBMkJGO0lBK0Q5QkcsVUFBZ0I7UUFDOUIsSUFBSSxDQUFDQyx5QkFBeUI7UUFDOUIsS0FBSyxDQUFDRDtJQUNSO0lBOURBLFlBQW9CRSxhQUFnQyxFQUFFQyxLQUF1QyxFQUFFQyxlQUEyQyxDQUFHO1FBRTNJLE1BQU1DLFVBQVViLFlBQXlFO1lBQ3ZGYyxhQUFhO1lBQ2JDLGNBQWM7WUFDZEMsUUFBUTtZQUNSQyxXQUFXO1lBQ1hDLGNBQWM7UUFDaEIsR0FBR047UUFFSCx3RkFBd0Y7UUFDeEYsa0dBQWtHO1FBQ2xHLDRCQUE0QjtRQUM1QixNQUFNTyxnQkFBZ0IsSUFBSWhCLFVBQVc7WUFDbkNpQixNQUFNUCxRQUFRRSxZQUFZO1lBQzFCQyxRQUFRSCxRQUFRRyxNQUFNO1lBQ3RCQyxXQUFXSixRQUFRSSxTQUFTO1lBQzVCQyxjQUFjTCxRQUFRSyxZQUFZO1lBQ2xDRyxRQUFRO1lBQ1JDLFVBQVU7UUFDWjtRQUVBLDRGQUE0RjtRQUM1Rix1Q0FBdUM7UUFDdkMsTUFBTUMsZUFBZSxJQUFJcEIsVUFBVztZQUNsQ2lCLE1BQU1QLFFBQVFDLFdBQVc7WUFDekJFLFFBQVFILFFBQVFHLE1BQU07WUFDdEJDLFdBQVdKLFFBQVFJLFNBQVM7WUFDNUJDLGNBQWNMLFFBQVFLLFlBQVk7UUFDcEM7UUFFQSxNQUFNTSxZQUFZLElBQUl0QixLQUFNO1lBQzFCdUIsVUFBVTtnQkFBRU47Z0JBQWVJO2FBQWM7UUFDM0M7UUFDQSxLQUFLLENBQUViLGVBQWVjLFdBQVdiLE9BQU9WLGVBQW9DO1lBRTFFLHlDQUF5QztZQUN6Q3lCLG9CQUFvQmIsUUFBUUcsTUFBTSxLQUFLLE9BQU9ILFFBQVFJLFNBQVMsR0FBRyxJQUFJO1lBQ3RFVSxxQkFBcUJkLFFBQVFHLE1BQU0sS0FBSyxPQUFPSCxRQUFRSSxTQUFTLEdBQUcsSUFBSTtRQUN6RSxHQUFHSjtRQUVILDJFQUEyRTtRQUMzRSxNQUFNZSxrQkFBa0I3QixVQUFVOEIsU0FBUyxDQUFFO1lBQzNDaEIsUUFBUWlCLG9CQUFvQjtZQUM1QixJQUFJLENBQUNDLHVCQUF1QjtZQUM1QixJQUFJLENBQUNDLFlBQVk7U0FDbEIsRUFBRSxDQUFFQyxjQUFjQyxpQkFBaUJDO1lBQ2xDLE1BQU1DLGNBQWNGLGdCQUFnQkcsUUFBUSxDQUFFSixhQUFhSyxHQUFHO1lBQzlELE1BQU1DLGNBQWNMLGdCQUFnQkcsUUFBUSxDQUFFSixhQUFhTyxHQUFHO1lBRTlEckIsY0FBY3NCLE9BQU8sQ0FBRSxHQUFHLEdBQUdOLEtBQUtPLEtBQUssRUFBRVAsS0FBS1EsTUFBTTtZQUNwRHBCLGFBQWFrQixPQUFPLENBQUVMLGFBQWEsR0FBR0csY0FBY0gsYUFBYUQsS0FBS1EsTUFBTTtRQUM5RTtRQUVBLElBQUksQ0FBQ2xDLHlCQUF5QixHQUFHO1lBQy9CbUIsZ0JBQWdCcEIsT0FBTztRQUN6QjtJQUNGO0FBTUY7QUFuRUEsU0FBcUJELGdDQW1FcEI7QUFFREQsSUFBSXNDLFFBQVEsQ0FBRSxzQkFBc0JyQyJ9