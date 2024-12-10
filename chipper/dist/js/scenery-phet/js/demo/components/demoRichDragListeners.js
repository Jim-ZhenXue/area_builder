// Copyright 2024, University of Colorado Boulder
/**
 * Demo for SoundDragListener and SoundKeyboardDragListener
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Agustín Vallejo (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import TinyProperty from '../../../../axon/js/TinyProperty.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Circle, Node, Path, Rectangle, RichText } from '../../../../scenery/js/imports.js';
import PhetFont from '../../PhetFont.js';
import SoundDragListener from '../../SoundDragListener.js';
import SoundKeyboardDragListener from '../../SoundKeyboardDragListener.js';
import SoundRichDragListener from '../../SoundRichDragListener.js';
export default function demoRichDragListeners(layoutBounds) {
    const RADIUS = 75;
    const dragBoundsProperty = new TinyProperty(layoutBounds.eroded(RADIUS));
    // A visualization of the drag bounds
    const dragArea = new Rectangle(dragBoundsProperty.value, {
        fill: 'lightGray'
    });
    //---------------------------------------------------------------------------------
    // SoundDragListener
    //---------------------------------------------------------------------------------
    const soundDragistenerCircle = new Circle(RADIUS, {
        fill: 'red',
        cursor: 'pointer'
    });
    const innerCircleMessage = new RichText('Mouse-drag me!', {
        font: new PhetFont(15),
        fill: 'white',
        center: soundDragistenerCircle.center
    });
    soundDragistenerCircle.addChild(innerCircleMessage);
    soundDragistenerCircle.addInputListener(new SoundDragListener({
        dragBoundsProperty: dragBoundsProperty,
        drag: (event, listener)=>{
            soundDragistenerCircle.translate(listener.modelDelta);
        }
    }));
    //---------------------------------------------------------------------------------
    // SoundKeyboardDragListener
    //---------------------------------------------------------------------------------
    const soundKeyboardDragListenerRectangle = new Rectangle(-RADIUS * 3 / 2, -RADIUS / 2, RADIUS * 3, RADIUS, {
        fill: 'blue',
        tagName: 'div',
        focusable: true
    });
    const innerRectangleMessage = new RichText('Tab and keyboard-drag me!', {
        font: new PhetFont(15),
        fill: 'white',
        center: soundKeyboardDragListenerRectangle.center
    });
    soundKeyboardDragListenerRectangle.addChild(innerRectangleMessage);
    soundKeyboardDragListenerRectangle.addInputListener(new SoundKeyboardDragListener({
        dragBoundsProperty: dragBoundsProperty,
        translateNode: true,
        dragSpeed: RADIUS * 5,
        shiftDragSpeed: RADIUS
    }));
    //---------------------------------------------------------------------------------
    // SoundRichDragListener
    //---------------------------------------------------------------------------------
    const richDragListenerEllipse = new Path(Shape.ellipse(0, 0, RADIUS * 2, RADIUS, 0), {
        fill: 'green',
        // so that it is focusable and can receive keyboard input
        tagName: 'div',
        focusable: true
    });
    const innerEllipseMessage = new RichText('Drag me with any input!', {
        font: new PhetFont(15),
        fill: 'white',
        center: richDragListenerEllipse.center
    });
    const richDragListenerStateText = new RichText('Ready to drag...', {
        font: new PhetFont(24)
    });
    const updateStateText = (newString)=>{
        richDragListenerStateText.string = newString;
        richDragListenerStateText.centerBottom = dragArea.centerBottom;
    };
    richDragListenerEllipse.addChild(innerEllipseMessage);
    richDragListenerEllipse.addInputListener(new SoundRichDragListener({
        dragBoundsProperty: dragBoundsProperty,
        translateNode: true,
        keyboardDragListenerOptions: {
            dragSpeed: RADIUS * 5,
            shiftDragSpeed: RADIUS
        },
        start: (event, listener)=>{
            if (event.isFromPDOM()) {
                updateStateText('Keyboard drag started');
            } else {
                updateStateText('Mouse drag started');
            }
        },
        end: (event, listener)=>{
            if (event && event.isFromPDOM()) {
                updateStateText('Keyboard drag ended');
            } else {
                updateStateText('Mouse drag ended');
            }
        }
    }));
    const content = new Node({
        children: [
            dragArea,
            soundDragistenerCircle,
            soundKeyboardDragListenerRectangle,
            richDragListenerEllipse,
            richDragListenerStateText
        ]
    });
    // initial positions
    dragArea.center = layoutBounds.center;
    soundDragistenerCircle.center = layoutBounds.center.plusXY(-RADIUS, -RADIUS);
    soundKeyboardDragListenerRectangle.center = layoutBounds.center.plusXY(RADIUS, -RADIUS);
    richDragListenerEllipse.center = layoutBounds.center.plusXY(0, RADIUS);
    updateStateText('Ready to drag...');
    return content;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb1JpY2hEcmFnTGlzdGVuZXJzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbi8qKlxuICogRGVtbyBmb3IgU291bmREcmFnTGlzdGVuZXIgYW5kIFNvdW5kS2V5Ym9hcmREcmFnTGlzdGVuZXJcbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIEFndXN0w61uIFZhbGxlam8gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgVGlueVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVGlueVByb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCB7IENpcmNsZSwgTm9kZSwgUGF0aCwgUmVjdGFuZ2xlLCBSaWNoVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vUGhldEZvbnQuanMnO1xuaW1wb3J0IFNvdW5kRHJhZ0xpc3RlbmVyIGZyb20gJy4uLy4uL1NvdW5kRHJhZ0xpc3RlbmVyLmpzJztcbmltcG9ydCBTb3VuZEtleWJvYXJkRHJhZ0xpc3RlbmVyIGZyb20gJy4uLy4uL1NvdW5kS2V5Ym9hcmREcmFnTGlzdGVuZXIuanMnO1xuaW1wb3J0IFNvdW5kUmljaERyYWdMaXN0ZW5lciBmcm9tICcuLi8uLi9Tb3VuZFJpY2hEcmFnTGlzdGVuZXIuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZW1vUmljaERyYWdMaXN0ZW5lcnMoIGxheW91dEJvdW5kczogQm91bmRzMiApOiBOb2RlIHtcbiAgY29uc3QgUkFESVVTID0gNzU7XG5cbiAgY29uc3QgZHJhZ0JvdW5kc1Byb3BlcnR5ID0gbmV3IFRpbnlQcm9wZXJ0eSggbGF5b3V0Qm91bmRzLmVyb2RlZCggUkFESVVTICkgKTtcblxuICAvLyBBIHZpc3VhbGl6YXRpb24gb2YgdGhlIGRyYWcgYm91bmRzXG4gIGNvbnN0IGRyYWdBcmVhID0gbmV3IFJlY3RhbmdsZSggZHJhZ0JvdW5kc1Byb3BlcnR5LnZhbHVlLCB7XG4gICAgZmlsbDogJ2xpZ2h0R3JheSdcbiAgfSApO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFNvdW5kRHJhZ0xpc3RlbmVyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0IHNvdW5kRHJhZ2lzdGVuZXJDaXJjbGUgPSBuZXcgQ2lyY2xlKCBSQURJVVMsIHtcbiAgICBmaWxsOiAncmVkJyxcbiAgICBjdXJzb3I6ICdwb2ludGVyJ1xuICB9ICk7XG4gIGNvbnN0IGlubmVyQ2lyY2xlTWVzc2FnZSA9IG5ldyBSaWNoVGV4dCggJ01vdXNlLWRyYWcgbWUhJywge1xuICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTUgKSxcbiAgICBmaWxsOiAnd2hpdGUnLFxuICAgIGNlbnRlcjogc291bmREcmFnaXN0ZW5lckNpcmNsZS5jZW50ZXJcbiAgfSApO1xuICBzb3VuZERyYWdpc3RlbmVyQ2lyY2xlLmFkZENoaWxkKCBpbm5lckNpcmNsZU1lc3NhZ2UgKTtcbiAgc291bmREcmFnaXN0ZW5lckNpcmNsZS5hZGRJbnB1dExpc3RlbmVyKCBuZXcgU291bmREcmFnTGlzdGVuZXIoIHtcbiAgICBkcmFnQm91bmRzUHJvcGVydHk6IGRyYWdCb3VuZHNQcm9wZXJ0eSxcbiAgICBkcmFnOiAoIGV2ZW50LCBsaXN0ZW5lciApID0+IHtcbiAgICAgIHNvdW5kRHJhZ2lzdGVuZXJDaXJjbGUudHJhbnNsYXRlKCBsaXN0ZW5lci5tb2RlbERlbHRhICk7XG4gICAgfVxuICB9ICkgKTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBTb3VuZEtleWJvYXJkRHJhZ0xpc3RlbmVyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0IHNvdW5kS2V5Ym9hcmREcmFnTGlzdGVuZXJSZWN0YW5nbGUgPSBuZXcgUmVjdGFuZ2xlKCAtUkFESVVTICogMyAvIDIsIC1SQURJVVMgLyAyLCBSQURJVVMgKiAzLCBSQURJVVMsIHtcbiAgICBmaWxsOiAnYmx1ZScsXG4gICAgdGFnTmFtZTogJ2RpdicsXG4gICAgZm9jdXNhYmxlOiB0cnVlXG4gIH0gKTtcbiAgY29uc3QgaW5uZXJSZWN0YW5nbGVNZXNzYWdlID0gbmV3IFJpY2hUZXh0KCAnVGFiIGFuZCBrZXlib2FyZC1kcmFnIG1lIScsIHtcbiAgICBmb250OiBuZXcgUGhldEZvbnQoIDE1ICksXG4gICAgZmlsbDogJ3doaXRlJyxcbiAgICBjZW50ZXI6IHNvdW5kS2V5Ym9hcmREcmFnTGlzdGVuZXJSZWN0YW5nbGUuY2VudGVyXG4gIH0gKTtcbiAgc291bmRLZXlib2FyZERyYWdMaXN0ZW5lclJlY3RhbmdsZS5hZGRDaGlsZCggaW5uZXJSZWN0YW5nbGVNZXNzYWdlICk7XG4gIHNvdW5kS2V5Ym9hcmREcmFnTGlzdGVuZXJSZWN0YW5nbGUuYWRkSW5wdXRMaXN0ZW5lciggbmV3IFNvdW5kS2V5Ym9hcmREcmFnTGlzdGVuZXIoIHtcbiAgICBkcmFnQm91bmRzUHJvcGVydHk6IGRyYWdCb3VuZHNQcm9wZXJ0eSxcbiAgICB0cmFuc2xhdGVOb2RlOiB0cnVlLFxuICAgIGRyYWdTcGVlZDogUkFESVVTICogNSxcbiAgICBzaGlmdERyYWdTcGVlZDogUkFESVVTXG4gIH0gKSApO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFNvdW5kUmljaERyYWdMaXN0ZW5lclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb25zdCByaWNoRHJhZ0xpc3RlbmVyRWxsaXBzZSA9IG5ldyBQYXRoKCBTaGFwZS5lbGxpcHNlKCAwLCAwLCBSQURJVVMgKiAyLCBSQURJVVMsIDAgKSwge1xuICAgIGZpbGw6ICdncmVlbicsXG5cbiAgICAvLyBzbyB0aGF0IGl0IGlzIGZvY3VzYWJsZSBhbmQgY2FuIHJlY2VpdmUga2V5Ym9hcmQgaW5wdXRcbiAgICB0YWdOYW1lOiAnZGl2JyxcbiAgICBmb2N1c2FibGU6IHRydWVcbiAgfSApO1xuICBjb25zdCBpbm5lckVsbGlwc2VNZXNzYWdlID0gbmV3IFJpY2hUZXh0KCAnRHJhZyBtZSB3aXRoIGFueSBpbnB1dCEnLCB7XG4gICAgZm9udDogbmV3IFBoZXRGb250KCAxNSApLFxuICAgIGZpbGw6ICd3aGl0ZScsXG4gICAgY2VudGVyOiByaWNoRHJhZ0xpc3RlbmVyRWxsaXBzZS5jZW50ZXJcbiAgfSApO1xuICBjb25zdCByaWNoRHJhZ0xpc3RlbmVyU3RhdGVUZXh0ID0gbmV3IFJpY2hUZXh0KCAnUmVhZHkgdG8gZHJhZy4uLicsIHtcbiAgICBmb250OiBuZXcgUGhldEZvbnQoIDI0IClcbiAgfSApO1xuXG4gIGNvbnN0IHVwZGF0ZVN0YXRlVGV4dCA9ICggbmV3U3RyaW5nOiBzdHJpbmcgKSA9PiB7XG4gICAgcmljaERyYWdMaXN0ZW5lclN0YXRlVGV4dC5zdHJpbmcgPSBuZXdTdHJpbmc7XG4gICAgcmljaERyYWdMaXN0ZW5lclN0YXRlVGV4dC5jZW50ZXJCb3R0b20gPSBkcmFnQXJlYS5jZW50ZXJCb3R0b207XG4gIH07XG5cbiAgcmljaERyYWdMaXN0ZW5lckVsbGlwc2UuYWRkQ2hpbGQoIGlubmVyRWxsaXBzZU1lc3NhZ2UgKTtcbiAgcmljaERyYWdMaXN0ZW5lckVsbGlwc2UuYWRkSW5wdXRMaXN0ZW5lciggbmV3IFNvdW5kUmljaERyYWdMaXN0ZW5lcigge1xuICAgIGRyYWdCb3VuZHNQcm9wZXJ0eTogZHJhZ0JvdW5kc1Byb3BlcnR5LFxuICAgIHRyYW5zbGF0ZU5vZGU6IHRydWUsXG4gICAga2V5Ym9hcmREcmFnTGlzdGVuZXJPcHRpb25zOiB7XG4gICAgICBkcmFnU3BlZWQ6IFJBRElVUyAqIDUsXG4gICAgICBzaGlmdERyYWdTcGVlZDogUkFESVVTXG4gICAgfSxcbiAgICBzdGFydDogKCBldmVudCwgbGlzdGVuZXIgKSA9PiB7XG4gICAgICBpZiAoIGV2ZW50LmlzRnJvbVBET00oKSApIHtcbiAgICAgICAgdXBkYXRlU3RhdGVUZXh0KCAnS2V5Ym9hcmQgZHJhZyBzdGFydGVkJyApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHVwZGF0ZVN0YXRlVGV4dCggJ01vdXNlIGRyYWcgc3RhcnRlZCcgKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGVuZDogKCBldmVudCwgbGlzdGVuZXIgKSA9PiB7XG4gICAgICBpZiAoIGV2ZW50ICYmIGV2ZW50LmlzRnJvbVBET00oKSApIHtcbiAgICAgICAgdXBkYXRlU3RhdGVUZXh0KCAnS2V5Ym9hcmQgZHJhZyBlbmRlZCcgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB1cGRhdGVTdGF0ZVRleHQoICdNb3VzZSBkcmFnIGVuZGVkJyApO1xuICAgICAgfVxuICAgIH1cbiAgfSApICk7XG5cbiAgY29uc3QgY29udGVudCA9IG5ldyBOb2RlKCB7XG4gICAgY2hpbGRyZW46IFtcbiAgICAgIGRyYWdBcmVhLFxuICAgICAgc291bmREcmFnaXN0ZW5lckNpcmNsZSxcbiAgICAgIHNvdW5kS2V5Ym9hcmREcmFnTGlzdGVuZXJSZWN0YW5nbGUsXG4gICAgICByaWNoRHJhZ0xpc3RlbmVyRWxsaXBzZSxcbiAgICAgIHJpY2hEcmFnTGlzdGVuZXJTdGF0ZVRleHRcbiAgICBdXG4gIH0gKTtcblxuICAvLyBpbml0aWFsIHBvc2l0aW9uc1xuICBkcmFnQXJlYS5jZW50ZXIgPSBsYXlvdXRCb3VuZHMuY2VudGVyO1xuICBzb3VuZERyYWdpc3RlbmVyQ2lyY2xlLmNlbnRlciA9IGxheW91dEJvdW5kcy5jZW50ZXIucGx1c1hZKCAtUkFESVVTLCAtUkFESVVTICk7XG4gIHNvdW5kS2V5Ym9hcmREcmFnTGlzdGVuZXJSZWN0YW5nbGUuY2VudGVyID0gbGF5b3V0Qm91bmRzLmNlbnRlci5wbHVzWFkoIFJBRElVUywgLVJBRElVUyApO1xuICByaWNoRHJhZ0xpc3RlbmVyRWxsaXBzZS5jZW50ZXIgPSBsYXlvdXRCb3VuZHMuY2VudGVyLnBsdXNYWSggMCwgUkFESVVTICk7XG4gIHVwZGF0ZVN0YXRlVGV4dCggJ1JlYWR5IHRvIGRyYWcuLi4nICk7XG5cbiAgcmV0dXJuIGNvbnRlbnQ7XG59Il0sIm5hbWVzIjpbIlRpbnlQcm9wZXJ0eSIsIlNoYXBlIiwiQ2lyY2xlIiwiTm9kZSIsIlBhdGgiLCJSZWN0YW5nbGUiLCJSaWNoVGV4dCIsIlBoZXRGb250IiwiU291bmREcmFnTGlzdGVuZXIiLCJTb3VuZEtleWJvYXJkRHJhZ0xpc3RlbmVyIiwiU291bmRSaWNoRHJhZ0xpc3RlbmVyIiwiZGVtb1JpY2hEcmFnTGlzdGVuZXJzIiwibGF5b3V0Qm91bmRzIiwiUkFESVVTIiwiZHJhZ0JvdW5kc1Byb3BlcnR5IiwiZXJvZGVkIiwiZHJhZ0FyZWEiLCJ2YWx1ZSIsImZpbGwiLCJzb3VuZERyYWdpc3RlbmVyQ2lyY2xlIiwiY3Vyc29yIiwiaW5uZXJDaXJjbGVNZXNzYWdlIiwiZm9udCIsImNlbnRlciIsImFkZENoaWxkIiwiYWRkSW5wdXRMaXN0ZW5lciIsImRyYWciLCJldmVudCIsImxpc3RlbmVyIiwidHJhbnNsYXRlIiwibW9kZWxEZWx0YSIsInNvdW5kS2V5Ym9hcmREcmFnTGlzdGVuZXJSZWN0YW5nbGUiLCJ0YWdOYW1lIiwiZm9jdXNhYmxlIiwiaW5uZXJSZWN0YW5nbGVNZXNzYWdlIiwidHJhbnNsYXRlTm9kZSIsImRyYWdTcGVlZCIsInNoaWZ0RHJhZ1NwZWVkIiwicmljaERyYWdMaXN0ZW5lckVsbGlwc2UiLCJlbGxpcHNlIiwiaW5uZXJFbGxpcHNlTWVzc2FnZSIsInJpY2hEcmFnTGlzdGVuZXJTdGF0ZVRleHQiLCJ1cGRhdGVTdGF0ZVRleHQiLCJuZXdTdHJpbmciLCJzdHJpbmciLCJjZW50ZXJCb3R0b20iLCJrZXlib2FyZERyYWdMaXN0ZW5lck9wdGlvbnMiLCJzdGFydCIsImlzRnJvbVBET00iLCJlbmQiLCJjb250ZW50IiwiY2hpbGRyZW4iLCJwbHVzWFkiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUNqRDs7Ozs7O0NBTUMsR0FFRCxPQUFPQSxrQkFBa0Isc0NBQXNDO0FBRS9ELFNBQVNDLEtBQUssUUFBUSxpQ0FBaUM7QUFDdkQsU0FBU0MsTUFBTSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxRQUFRLFFBQVEsb0NBQW9DO0FBQzVGLE9BQU9DLGNBQWMsb0JBQW9CO0FBQ3pDLE9BQU9DLHVCQUF1Qiw2QkFBNkI7QUFDM0QsT0FBT0MsK0JBQStCLHFDQUFxQztBQUMzRSxPQUFPQywyQkFBMkIsaUNBQWlDO0FBRW5FLGVBQWUsU0FBU0Msc0JBQXVCQyxZQUFxQjtJQUNsRSxNQUFNQyxTQUFTO0lBRWYsTUFBTUMscUJBQXFCLElBQUlkLGFBQWNZ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