// Copyright 2018-2021, University of Colorado Boulder
/**
 * PressListener tests
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Tandem from '../../../tandem/js/Tandem.js';
import ListenerTestUtils from './ListenerTestUtils.js';
import PressListener from './PressListener.js';
QUnit.module('PressListener');
QUnit.test('Basics', (assert)=>{
    ListenerTestUtils.simpleRectangleTest((display, rect, node)=>{
        let pressCount = 0;
        let releaseCount = 0;
        let dragCount = 0;
        const listener = new PressListener({
            tandem: Tandem.ROOT_TEST.createTandem('myListener'),
            press: (event, listener)=>{
                pressCount++;
            },
            release: (event, listener)=>{
                releaseCount++;
            },
            drag: (event, listener)=>{
                dragCount++;
            }
        });
        rect.addInputListener(listener);
        assert.equal(pressCount, 0, '[1] Has not been pressed yet');
        assert.equal(releaseCount, 0, '[1] Has not been released yet');
        assert.equal(dragCount, 0, '[1] Has not been dragged yet');
        assert.equal(listener.isPressedProperty.value, false, '[1] Is not pressed');
        assert.equal(listener.isOverProperty.value, false, '[1] Is not over');
        assert.equal(listener.isHoveringProperty.value, false, '[1] Is not hovering');
        assert.equal(listener.isHighlightedProperty.value, false, '[1] Is not highlighted');
        assert.equal(listener.interrupted, false, '[1] Is not interrupted');
        ListenerTestUtils.mouseMove(display, 10, 10);
        assert.equal(pressCount, 0, '[2] Has not been pressed yet');
        assert.equal(releaseCount, 0, '[2] Has not been released yet');
        assert.equal(dragCount, 0, '[2] Has not been dragged yet');
        assert.equal(listener.isPressedProperty.value, false, '[2] Is not pressed');
        assert.equal(listener.isOverProperty.value, true, '[2] Is over');
        assert.equal(listener.isHoveringProperty.value, true, '[2] Is hovering');
        assert.equal(listener.isHighlightedProperty.value, true, '[2] Is highlighted');
        assert.equal(listener.interrupted, false, '[2] Is not interrupted');
        ListenerTestUtils.mouseDown(display, 10, 10);
        assert.equal(pressCount, 1, '[3] Pressed once');
        assert.equal(releaseCount, 0, '[3] Has not been released yet');
        assert.equal(dragCount, 0, '[3] Has not been dragged yet');
        assert.equal(listener.isPressedProperty.value, true, '[3] Is pressed');
        assert.equal(listener.isOverProperty.value, true, '[3] Is over');
        assert.equal(listener.isHoveringProperty.value, true, '[3] Is hovering');
        assert.equal(listener.isHighlightedProperty.value, true, '[3] Is highlighted');
        assert.equal(listener.interrupted, false, '[3] Is not interrupted');
        assert.ok(listener.pressedTrail.lastNode() === rect, '[3] Dragging the proper rectangle');
        // A move that goes "outside" the node
        ListenerTestUtils.mouseMove(display, 50, 10);
        assert.equal(pressCount, 1, '[4] Pressed once');
        assert.equal(releaseCount, 0, '[4] Has not been released yet');
        assert.equal(dragCount, 1, '[4] Dragged once');
        assert.equal(listener.isPressedProperty.value, true, '[4] Is pressed');
        assert.equal(listener.isOverProperty.value, false, '[4] Is NOT over anymore');
        assert.equal(listener.isHoveringProperty.value, false, '[4] Is NOT hovering');
        assert.equal(listener.isHighlightedProperty.value, true, '[4] Is highlighted');
        assert.equal(listener.interrupted, false, '[4] Is not interrupted');
        ListenerTestUtils.mouseUp(display, 50, 10);
        assert.equal(pressCount, 1, '[5] Pressed once');
        assert.equal(releaseCount, 1, '[5] Released once');
        assert.equal(dragCount, 1, '[5] Dragged once');
        assert.equal(listener.isPressedProperty.value, false, '[5] Is NOT pressed');
        assert.equal(listener.isOverProperty.value, false, '[5] Is NOT over anymore');
        assert.equal(listener.isHoveringProperty.value, false, '[5] Is NOT hovering');
        assert.equal(listener.isHighlightedProperty.value, false, '[5] Is NOT highlighted');
        assert.equal(listener.interrupted, false, '[5] Is not interrupted');
        listener.dispose();
    });
});
QUnit.test('Interruption', (assert)=>{
    ListenerTestUtils.simpleRectangleTest((display, rect, node)=>{
        const listener = new PressListener({
            tandem: Tandem.ROOT_TEST.createTandem('myListener')
        });
        rect.addInputListener(listener);
        ListenerTestUtils.mouseDown(display, 10, 10);
        assert.equal(listener.isPressedProperty.value, true, 'Is pressed before the interruption');
        listener.interrupt();
        assert.equal(listener.isPressedProperty.value, false, 'Is NOT pressed after the interruption');
        listener.dispose();
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGlzdGVuZXJzL1ByZXNzTGlzdGVuZXJUZXN0cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBQcmVzc0xpc3RlbmVyIHRlc3RzXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgTGlzdGVuZXJUZXN0VXRpbHMgZnJvbSAnLi9MaXN0ZW5lclRlc3RVdGlscy5qcyc7XG5pbXBvcnQgUHJlc3NMaXN0ZW5lciBmcm9tICcuL1ByZXNzTGlzdGVuZXIuanMnO1xuXG5RVW5pdC5tb2R1bGUoICdQcmVzc0xpc3RlbmVyJyApO1xuXG5RVW5pdC50ZXN0KCAnQmFzaWNzJywgYXNzZXJ0ID0+IHtcbiAgTGlzdGVuZXJUZXN0VXRpbHMuc2ltcGxlUmVjdGFuZ2xlVGVzdCggKCBkaXNwbGF5LCByZWN0LCBub2RlICkgPT4ge1xuICAgIGxldCBwcmVzc0NvdW50ID0gMDtcbiAgICBsZXQgcmVsZWFzZUNvdW50ID0gMDtcbiAgICBsZXQgZHJhZ0NvdW50ID0gMDtcbiAgICBjb25zdCBsaXN0ZW5lciA9IG5ldyBQcmVzc0xpc3RlbmVyKCB7XG4gICAgICB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCAnbXlMaXN0ZW5lcicgKSxcblxuICAgICAgcHJlc3M6ICggZXZlbnQsIGxpc3RlbmVyICkgPT4ge1xuICAgICAgICBwcmVzc0NvdW50Kys7XG4gICAgICB9LFxuICAgICAgcmVsZWFzZTogKCBldmVudCwgbGlzdGVuZXIgKSA9PiB7XG4gICAgICAgIHJlbGVhc2VDb3VudCsrO1xuICAgICAgfSxcbiAgICAgIGRyYWc6ICggZXZlbnQsIGxpc3RlbmVyICkgPT4ge1xuICAgICAgICBkcmFnQ291bnQrKztcbiAgICAgIH1cbiAgICB9ICk7XG4gICAgcmVjdC5hZGRJbnB1dExpc3RlbmVyKCBsaXN0ZW5lciApO1xuXG4gICAgYXNzZXJ0LmVxdWFsKCBwcmVzc0NvdW50LCAwLCAnWzFdIEhhcyBub3QgYmVlbiBwcmVzc2VkIHlldCcgKTtcbiAgICBhc3NlcnQuZXF1YWwoIHJlbGVhc2VDb3VudCwgMCwgJ1sxXSBIYXMgbm90IGJlZW4gcmVsZWFzZWQgeWV0JyApO1xuICAgIGFzc2VydC5lcXVhbCggZHJhZ0NvdW50LCAwLCAnWzFdIEhhcyBub3QgYmVlbiBkcmFnZ2VkIHlldCcgKTtcbiAgICBhc3NlcnQuZXF1YWwoIGxpc3RlbmVyLmlzUHJlc3NlZFByb3BlcnR5LnZhbHVlLCBmYWxzZSwgJ1sxXSBJcyBub3QgcHJlc3NlZCcgKTtcbiAgICBhc3NlcnQuZXF1YWwoIGxpc3RlbmVyLmlzT3ZlclByb3BlcnR5LnZhbHVlLCBmYWxzZSwgJ1sxXSBJcyBub3Qgb3ZlcicgKTtcbiAgICBhc3NlcnQuZXF1YWwoIGxpc3RlbmVyLmlzSG92ZXJpbmdQcm9wZXJ0eS52YWx1ZSwgZmFsc2UsICdbMV0gSXMgbm90IGhvdmVyaW5nJyApO1xuICAgIGFzc2VydC5lcXVhbCggbGlzdGVuZXIuaXNIaWdobGlnaHRlZFByb3BlcnR5LnZhbHVlLCBmYWxzZSwgJ1sxXSBJcyBub3QgaGlnaGxpZ2h0ZWQnICk7XG4gICAgYXNzZXJ0LmVxdWFsKCBsaXN0ZW5lci5pbnRlcnJ1cHRlZCwgZmFsc2UsICdbMV0gSXMgbm90IGludGVycnVwdGVkJyApO1xuXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VNb3ZlKCBkaXNwbGF5LCAxMCwgMTAgKTtcblxuICAgIGFzc2VydC5lcXVhbCggcHJlc3NDb3VudCwgMCwgJ1syXSBIYXMgbm90IGJlZW4gcHJlc3NlZCB5ZXQnICk7XG4gICAgYXNzZXJ0LmVxdWFsKCByZWxlYXNlQ291bnQsIDAsICdbMl0gSGFzIG5vdCBiZWVuIHJlbGVhc2VkIHlldCcgKTtcbiAgICBhc3NlcnQuZXF1YWwoIGRyYWdDb3VudCwgMCwgJ1syXSBIYXMgbm90IGJlZW4gZHJhZ2dlZCB5ZXQnICk7XG4gICAgYXNzZXJ0LmVxdWFsKCBsaXN0ZW5lci5pc1ByZXNzZWRQcm9wZXJ0eS52YWx1ZSwgZmFsc2UsICdbMl0gSXMgbm90IHByZXNzZWQnICk7XG4gICAgYXNzZXJ0LmVxdWFsKCBsaXN0ZW5lci5pc092ZXJQcm9wZXJ0eS52YWx1ZSwgdHJ1ZSwgJ1syXSBJcyBvdmVyJyApO1xuICAgIGFzc2VydC5lcXVhbCggbGlzdGVuZXIuaXNIb3ZlcmluZ1Byb3BlcnR5LnZhbHVlLCB0cnVlLCAnWzJdIElzIGhvdmVyaW5nJyApO1xuICAgIGFzc2VydC5lcXVhbCggbGlzdGVuZXIuaXNIaWdobGlnaHRlZFByb3BlcnR5LnZhbHVlLCB0cnVlLCAnWzJdIElzIGhpZ2hsaWdodGVkJyApO1xuICAgIGFzc2VydC5lcXVhbCggbGlzdGVuZXIuaW50ZXJydXB0ZWQsIGZhbHNlLCAnWzJdIElzIG5vdCBpbnRlcnJ1cHRlZCcgKTtcblxuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlRG93biggZGlzcGxheSwgMTAsIDEwICk7XG5cbiAgICBhc3NlcnQuZXF1YWwoIHByZXNzQ291bnQsIDEsICdbM10gUHJlc3NlZCBvbmNlJyApO1xuICAgIGFzc2VydC5lcXVhbCggcmVsZWFzZUNvdW50LCAwLCAnWzNdIEhhcyBub3QgYmVlbiByZWxlYXNlZCB5ZXQnICk7XG4gICAgYXNzZXJ0LmVxdWFsKCBkcmFnQ291bnQsIDAsICdbM10gSGFzIG5vdCBiZWVuIGRyYWdnZWQgeWV0JyApO1xuICAgIGFzc2VydC5lcXVhbCggbGlzdGVuZXIuaXNQcmVzc2VkUHJvcGVydHkudmFsdWUsIHRydWUsICdbM10gSXMgcHJlc3NlZCcgKTtcbiAgICBhc3NlcnQuZXF1YWwoIGxpc3RlbmVyLmlzT3ZlclByb3BlcnR5LnZhbHVlLCB0cnVlLCAnWzNdIElzIG92ZXInICk7XG4gICAgYXNzZXJ0LmVxdWFsKCBsaXN0ZW5lci5pc0hvdmVyaW5nUHJvcGVydHkudmFsdWUsIHRydWUsICdbM10gSXMgaG92ZXJpbmcnICk7XG4gICAgYXNzZXJ0LmVxdWFsKCBsaXN0ZW5lci5pc0hpZ2hsaWdodGVkUHJvcGVydHkudmFsdWUsIHRydWUsICdbM10gSXMgaGlnaGxpZ2h0ZWQnICk7XG4gICAgYXNzZXJ0LmVxdWFsKCBsaXN0ZW5lci5pbnRlcnJ1cHRlZCwgZmFsc2UsICdbM10gSXMgbm90IGludGVycnVwdGVkJyApO1xuXG4gICAgYXNzZXJ0Lm9rKCBsaXN0ZW5lci5wcmVzc2VkVHJhaWwubGFzdE5vZGUoKSA9PT0gcmVjdCwgJ1szXSBEcmFnZ2luZyB0aGUgcHJvcGVyIHJlY3RhbmdsZScgKTtcblxuICAgIC8vIEEgbW92ZSB0aGF0IGdvZXMgXCJvdXRzaWRlXCIgdGhlIG5vZGVcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZU1vdmUoIGRpc3BsYXksIDUwLCAxMCApO1xuXG4gICAgYXNzZXJ0LmVxdWFsKCBwcmVzc0NvdW50LCAxLCAnWzRdIFByZXNzZWQgb25jZScgKTtcbiAgICBhc3NlcnQuZXF1YWwoIHJlbGVhc2VDb3VudCwgMCwgJ1s0XSBIYXMgbm90IGJlZW4gcmVsZWFzZWQgeWV0JyApO1xuICAgIGFzc2VydC5lcXVhbCggZHJhZ0NvdW50LCAxLCAnWzRdIERyYWdnZWQgb25jZScgKTtcbiAgICBhc3NlcnQuZXF1YWwoIGxpc3RlbmVyLmlzUHJlc3NlZFByb3BlcnR5LnZhbHVlLCB0cnVlLCAnWzRdIElzIHByZXNzZWQnICk7XG4gICAgYXNzZXJ0LmVxdWFsKCBsaXN0ZW5lci5pc092ZXJQcm9wZXJ0eS52YWx1ZSwgZmFsc2UsICdbNF0gSXMgTk9UIG92ZXIgYW55bW9yZScgKTtcbiAgICBhc3NlcnQuZXF1YWwoIGxpc3RlbmVyLmlzSG92ZXJpbmdQcm9wZXJ0eS52YWx1ZSwgZmFsc2UsICdbNF0gSXMgTk9UIGhvdmVyaW5nJyApO1xuICAgIGFzc2VydC5lcXVhbCggbGlzdGVuZXIuaXNIaWdobGlnaHRlZFByb3BlcnR5LnZhbHVlLCB0cnVlLCAnWzRdIElzIGhpZ2hsaWdodGVkJyApO1xuICAgIGFzc2VydC5lcXVhbCggbGlzdGVuZXIuaW50ZXJydXB0ZWQsIGZhbHNlLCAnWzRdIElzIG5vdCBpbnRlcnJ1cHRlZCcgKTtcblxuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlVXAoIGRpc3BsYXksIDUwLCAxMCApO1xuXG4gICAgYXNzZXJ0LmVxdWFsKCBwcmVzc0NvdW50LCAxLCAnWzVdIFByZXNzZWQgb25jZScgKTtcbiAgICBhc3NlcnQuZXF1YWwoIHJlbGVhc2VDb3VudCwgMSwgJ1s1XSBSZWxlYXNlZCBvbmNlJyApO1xuICAgIGFzc2VydC5lcXVhbCggZHJhZ0NvdW50LCAxLCAnWzVdIERyYWdnZWQgb25jZScgKTtcbiAgICBhc3NlcnQuZXF1YWwoIGxpc3RlbmVyLmlzUHJlc3NlZFByb3BlcnR5LnZhbHVlLCBmYWxzZSwgJ1s1XSBJcyBOT1QgcHJlc3NlZCcgKTtcbiAgICBhc3NlcnQuZXF1YWwoIGxpc3RlbmVyLmlzT3ZlclByb3BlcnR5LnZhbHVlLCBmYWxzZSwgJ1s1XSBJcyBOT1Qgb3ZlciBhbnltb3JlJyApO1xuICAgIGFzc2VydC5lcXVhbCggbGlzdGVuZXIuaXNIb3ZlcmluZ1Byb3BlcnR5LnZhbHVlLCBmYWxzZSwgJ1s1XSBJcyBOT1QgaG92ZXJpbmcnICk7XG4gICAgYXNzZXJ0LmVxdWFsKCBsaXN0ZW5lci5pc0hpZ2hsaWdodGVkUHJvcGVydHkudmFsdWUsIGZhbHNlLCAnWzVdIElzIE5PVCBoaWdobGlnaHRlZCcgKTtcbiAgICBhc3NlcnQuZXF1YWwoIGxpc3RlbmVyLmludGVycnVwdGVkLCBmYWxzZSwgJ1s1XSBJcyBub3QgaW50ZXJydXB0ZWQnICk7XG4gICAgbGlzdGVuZXIuZGlzcG9zZSgpO1xuICB9ICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdJbnRlcnJ1cHRpb24nLCBhc3NlcnQgPT4ge1xuICBMaXN0ZW5lclRlc3RVdGlscy5zaW1wbGVSZWN0YW5nbGVUZXN0KCAoIGRpc3BsYXksIHJlY3QsIG5vZGUgKSA9PiB7XG4gICAgY29uc3QgbGlzdGVuZXIgPSBuZXcgUHJlc3NMaXN0ZW5lcigge1xuICAgICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggJ215TGlzdGVuZXInIClcbiAgICB9ICk7XG4gICAgcmVjdC5hZGRJbnB1dExpc3RlbmVyKCBsaXN0ZW5lciApO1xuXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VEb3duKCBkaXNwbGF5LCAxMCwgMTAgKTtcblxuICAgIGFzc2VydC5lcXVhbCggbGlzdGVuZXIuaXNQcmVzc2VkUHJvcGVydHkudmFsdWUsIHRydWUsICdJcyBwcmVzc2VkIGJlZm9yZSB0aGUgaW50ZXJydXB0aW9uJyApO1xuICAgIGxpc3RlbmVyLmludGVycnVwdCgpO1xuICAgIGFzc2VydC5lcXVhbCggbGlzdGVuZXIuaXNQcmVzc2VkUHJvcGVydHkudmFsdWUsIGZhbHNlLCAnSXMgTk9UIHByZXNzZWQgYWZ0ZXIgdGhlIGludGVycnVwdGlvbicgKTtcbiAgICBsaXN0ZW5lci5kaXNwb3NlKCk7XG4gIH0gKTtcbn0gKTsiXSwibmFtZXMiOlsiVGFuZGVtIiwiTGlzdGVuZXJUZXN0VXRpbHMiLCJQcmVzc0xpc3RlbmVyIiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0Iiwic2ltcGxlUmVjdGFuZ2xlVGVzdCIsImRpc3BsYXkiLCJyZWN0Iiwibm9kZSIsInByZXNzQ291bnQiLCJyZWxlYXNlQ291bnQiLCJkcmFnQ291bnQiLCJsaXN0ZW5lciIsInRhbmRlbSIsIlJPT1RfVEVTVCIsImNyZWF0ZVRhbmRlbSIsInByZXNzIiwiZXZlbnQiLCJyZWxlYXNlIiwiZHJhZyIsImFkZElucHV0TGlzdGVuZXIiLCJlcXVhbCIsImlzUHJlc3NlZFByb3BlcnR5IiwidmFsdWUiLCJpc092ZXJQcm9wZXJ0eSIsImlzSG92ZXJpbmdQcm9wZXJ0eSIsImlzSGlnaGxpZ2h0ZWRQcm9wZXJ0eSIsImludGVycnVwdGVkIiwibW91c2VNb3ZlIiwibW91c2VEb3duIiwib2siLCJwcmVzc2VkVHJhaWwiLCJsYXN0Tm9kZSIsIm1vdXNlVXAiLCJkaXNwb3NlIiwiaW50ZXJydXB0Il0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLFlBQVksK0JBQStCO0FBQ2xELE9BQU9DLHVCQUF1Qix5QkFBeUI7QUFDdkQsT0FBT0MsbUJBQW1CLHFCQUFxQjtBQUUvQ0MsTUFBTUMsTUFBTSxDQUFFO0FBRWRELE1BQU1FLElBQUksQ0FBRSxVQUFVQyxDQUFBQTtJQUNwQkwsa0JBQWtCTSxtQkFBbUIsQ0FBRSxDQUFFQyxTQUFTQyxNQUFNQztRQUN0RCxJQUFJQyxhQUFhO1FBQ2pCLElBQUlDLGVBQWU7UUFDbkIsSUFBSUMsWUFBWTtRQUNoQixNQUFNQyxXQUFXLElBQUlaLGNBQWU7WUFDbENhLFFBQVFmLE9BQU9nQixTQUFTLENBQUNDLFlBQVksQ0FBRTtZQUV2Q0MsT0FBTyxDQUFFQyxPQUFPTDtnQkFDZEg7WUFDRjtZQUNBUyxTQUFTLENBQUVELE9BQU9MO2dCQUNoQkY7WUFDRjtZQUNBUyxNQUFNLENBQUVGLE9BQU9MO2dCQUNiRDtZQUNGO1FBQ0Y7UUFDQUosS0FBS2EsZ0JBQWdCLENBQUVSO1FBRXZCUixPQUFPaUIsS0FBSyxDQUFFWixZQUFZLEdBQUc7UUFDN0JMLE9BQU9pQixLQUFLLENBQUVYLGNBQWMsR0FBRztRQUMvQk4sT0FBT2lCLEtBQUssQ0FBRVYsV0FBVyxHQUFHO1FBQzVCUCxPQUFPaUIsS0FBSyxDQUFFVCxTQUFTVSxpQkFBaUIsQ0FBQ0MsS0FBSyxFQUFFLE9BQU87UUFDdkRuQixPQUFPaUIsS0FBSyxDQUFFVCxTQUFTWSxjQUFjLENBQUNELEtBQUssRUFBRSxPQUFPO1FBQ3BEbkIsT0FBT2lCLEtBQUssQ0FBRVQsU0FBU2Esa0JBQWtCLENBQUNGLEtBQUssRUFBRSxPQUFPO1FBQ3hEbkIsT0FBT2lCLEtBQUssQ0FBRVQsU0FBU2MscUJBQXFCLENBQUNI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