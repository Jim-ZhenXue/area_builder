// Copyright 2021-2023, University of Colorado Boulder
/**
 * The highlight with styling used for ReadingBlocks when the are "activated" and
 * the Voicing framework is speaking the content for a Node that composes ReadingBlock.
 *
 * @author Jesse Greenberg
 */ import optionize from '../../../../phet-core/js/optionize.js';
import { HighlightFromNode, scenery } from '../../imports.js';
// constants
const ACTIVATED_HIGHLIGHT_COLOR = 'rgba(255,255,0,0.5)';
let ActivatedReadingBlockHighlight = class ActivatedReadingBlockHighlight extends HighlightFromNode {
    constructor(node, providedOptions){
        const options = optionize()({
            innerStroke: null,
            outerStroke: null,
            fill: ACTIVATED_HIGHLIGHT_COLOR
        }, providedOptions);
        super(node, options);
    }
};
ActivatedReadingBlockHighlight.ACTIVATED_HIGHLIGHT_COLOR = ACTIVATED_HIGHLIGHT_COLOR;
scenery.register('ActivatedReadingBlockHighlight', ActivatedReadingBlockHighlight);
export default ActivatedReadingBlockHighlight;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS92b2ljaW5nL0FjdGl2YXRlZFJlYWRpbmdCbG9ja0hpZ2hsaWdodC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBUaGUgaGlnaGxpZ2h0IHdpdGggc3R5bGluZyB1c2VkIGZvciBSZWFkaW5nQmxvY2tzIHdoZW4gdGhlIGFyZSBcImFjdGl2YXRlZFwiIGFuZFxuICogdGhlIFZvaWNpbmcgZnJhbWV3b3JrIGlzIHNwZWFraW5nIHRoZSBjb250ZW50IGZvciBhIE5vZGUgdGhhdCBjb21wb3NlcyBSZWFkaW5nQmxvY2suXG4gKlxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmdcbiAqL1xuXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCB7IEhpZ2hsaWdodEZyb21Ob2RlLCBIaWdobGlnaHRGcm9tTm9kZU9wdGlvbnMsIE5vZGUsIHNjZW5lcnkgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBBQ1RJVkFURURfSElHSExJR0hUX0NPTE9SID0gJ3JnYmEoMjU1LDI1NSwwLDAuNSknO1xuXG5cbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xudHlwZSBBY3RpdmF0ZWRSZWFkaW5nQmxvY2tIaWdobGlnaHRPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBIaWdobGlnaHRGcm9tTm9kZU9wdGlvbnM7XG5cbmNsYXNzIEFjdGl2YXRlZFJlYWRpbmdCbG9ja0hpZ2hsaWdodCBleHRlbmRzIEhpZ2hsaWdodEZyb21Ob2RlIHtcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBBQ1RJVkFURURfSElHSExJR0hUX0NPTE9SID0gQUNUSVZBVEVEX0hJR0hMSUdIVF9DT0xPUjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIG5vZGU6IE5vZGUgfCBudWxsLCBwcm92aWRlZE9wdGlvbnM/OiBBY3RpdmF0ZWRSZWFkaW5nQmxvY2tIaWdobGlnaHRPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxBY3RpdmF0ZWRSZWFkaW5nQmxvY2tIaWdobGlnaHRPcHRpb25zLCBTZWxmT3B0aW9ucywgSGlnaGxpZ2h0RnJvbU5vZGVPcHRpb25zPigpKCB7XG4gICAgICBpbm5lclN0cm9rZTogbnVsbCxcbiAgICAgIG91dGVyU3Ryb2tlOiBudWxsLFxuICAgICAgZmlsbDogQUNUSVZBVEVEX0hJR0hMSUdIVF9DT0xPUlxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoIG5vZGUsIG9wdGlvbnMgKTtcbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnQWN0aXZhdGVkUmVhZGluZ0Jsb2NrSGlnaGxpZ2h0JywgQWN0aXZhdGVkUmVhZGluZ0Jsb2NrSGlnaGxpZ2h0ICk7XG5leHBvcnQgZGVmYXVsdCBBY3RpdmF0ZWRSZWFkaW5nQmxvY2tIaWdobGlnaHQ7Il0sIm5hbWVzIjpbIm9wdGlvbml6ZSIsIkhpZ2hsaWdodEZyb21Ob2RlIiwic2NlbmVyeSIsIkFDVElWQVRFRF9ISUdITElHSFRfQ09MT1IiLCJBY3RpdmF0ZWRSZWFkaW5nQmxvY2tIaWdobGlnaHQiLCJub2RlIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImlubmVyU3Ryb2tlIiwib3V0ZXJTdHJva2UiLCJmaWxsIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELE9BQU9BLGVBQXFDLHdDQUF3QztBQUNwRixTQUFTQyxpQkFBaUIsRUFBa0NDLE9BQU8sUUFBUSxtQkFBbUI7QUFFOUYsWUFBWTtBQUNaLE1BQU1DLDRCQUE0QjtBQU1sQyxJQUFBLEFBQU1DLGlDQUFOLE1BQU1BLHVDQUF1Q0g7SUFHM0MsWUFBb0JJLElBQWlCLEVBQUVDLGVBQXVELENBQUc7UUFFL0YsTUFBTUMsVUFBVVAsWUFBMkY7WUFDekdRLGFBQWE7WUFDYkMsYUFBYTtZQUNiQyxNQUFNUDtRQUNSLEdBQUdHO1FBRUgsS0FBSyxDQUFFRCxNQUFNRTtJQUNmO0FBQ0Y7QUFiTUgsK0JBQ21CRCw0QkFBNEJBO0FBY3JERCxRQUFRUyxRQUFRLENBQUUsa0NBQWtDUDtBQUNwRCxlQUFlQSwrQkFBK0IifQ==