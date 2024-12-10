// Copyright 2020-2024, University of Colorado Boulder
/**
 * Displays a demo for showing how damped motion (with DampedAnimation) works.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Property from '../../../axon/js/Property.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import merge from '../../../phet-core/js/merge.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { Circle, Plane, Text, VBox } from '../../../scenery/js/imports.js';
import HSlider from '../../../sun/js/HSlider.js';
import Tandem from '../../../tandem/js/Tandem.js';
import DampedAnimation from '../DampedAnimation.js';
import twixt from '../twixt.js';
let DampedMotionScreenView = class DampedMotionScreenView extends ScreenView {
    step(dt) {
        this.xAnimation.step(dt);
        this.yAnimation.step(dt);
    }
    constructor(){
        super({
            tandem: Tandem.OPT_OUT
        });
        const xProperty = new Property(this.layoutBounds.centerX);
        const yProperty = new Property(this.layoutBounds.centerY);
        const forceProperty = new Property(40);
        const dampingProperty = new Property(1);
        this.xAnimation = new DampedAnimation({
            valueProperty: xProperty,
            force: forceProperty.value,
            damping: dampingProperty.value,
            targetValue: xProperty.value
        });
        this.yAnimation = new DampedAnimation({
            valueProperty: yProperty,
            force: forceProperty.value,
            damping: dampingProperty.value,
            targetValue: yProperty.value
        });
        forceProperty.link((force)=>{
            this.xAnimation.force = force;
            this.yAnimation.force = force;
        });
        dampingProperty.link((damping)=>{
            this.xAnimation.damping = damping;
            this.yAnimation.damping = damping;
        });
        // to get the input events :(
        this.addChild(new Plane());
        const animatedCircle = new Circle(20, {
            fill: 'rgba(0,128,255,0.5)',
            stroke: 'black',
            children: [
                new Circle(3, {
                    fill: 'black'
                })
            ]
        });
        xProperty.linkAttribute(animatedCircle, 'x');
        yProperty.linkAttribute(animatedCircle, 'y');
        this.addChild(animatedCircle);
        const targetCircle = new Circle(20, {
            stroke: 'red',
            x: xProperty.value,
            y: yProperty.value
        });
        this.addChild(targetCircle);
        const moveToEvent = (event)=>{
            const localPoint = this.globalToLocalPoint(event.pointer.point);
            targetCircle.translation = localPoint;
            this.xAnimation.targetValue = localPoint.x;
            this.yAnimation.targetValue = localPoint.y;
        };
        this.addInputListener({
            down: (event)=>{
                if (!event.canStartPress()) {
                    return;
                }
                moveToEvent(event);
            },
            move: (event)=>{
                if (event.pointer.isDown) {
                    moveToEvent(event);
                }
            }
        });
        this.addChild(createSliderBox(forceProperty, new Range(5, 200), 'Force', [
            5,
            200
        ], {
            left: 10,
            top: 10
        }));
        this.addChild(createSliderBox(dampingProperty, new Range(0.1, 3), 'Damping', [
            0.1,
            1,
            3
        ], {
            right: this.layoutBounds.right - 10,
            top: 10
        }));
        this.addChild(new Text('Click or drag to move the animation target', {
            font: new PhetFont(30),
            bottom: this.layoutBounds.bottom - 10,
            centerX: this.layoutBounds.centerX
        }));
    }
};
export { DampedMotionScreenView as default };
function createSliderBox(property, range, label, majorTicks, options) {
    const labelNode = new Text(label, {
        font: new PhetFont(20)
    });
    const slider = new HSlider(property, range, {
        trackSize: new Dimension2(300, 5)
    });
    majorTicks.forEach((tick)=>slider.addMajorTick(tick, new Text(tick, {
            font: new PhetFont(20)
        })));
    return new VBox(merge({
        children: [
            labelNode,
            slider
        ],
        spacing: 10
    }, options));
}
twixt.register('DampedMotionScreenView', DampedMotionScreenView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3R3aXh0L2pzL2RlbW8vRGFtcGVkTW90aW9uU2NyZWVuVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEaXNwbGF5cyBhIGRlbW8gZm9yIHNob3dpbmcgaG93IGRhbXBlZCBtb3Rpb24gKHdpdGggRGFtcGVkQW5pbWF0aW9uKSB3b3Jrcy5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgeyBDaXJjbGUsIE5vZGUsIE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMsIFBsYW5lLCBTY2VuZXJ5RXZlbnQsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEhTbGlkZXIgZnJvbSAnLi4vLi4vLi4vc3VuL2pzL0hTbGlkZXIuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBEYW1wZWRBbmltYXRpb24gZnJvbSAnLi4vRGFtcGVkQW5pbWF0aW9uLmpzJztcbmltcG9ydCB0d2l4dCBmcm9tICcuLi90d2l4dC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERhbXBlZE1vdGlvblNjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcblxuICBwcml2YXRlIHJlYWRvbmx5IHhBbmltYXRpb246IERhbXBlZEFuaW1hdGlvbjtcbiAgcHJpdmF0ZSByZWFkb25seSB5QW5pbWF0aW9uOiBEYW1wZWRBbmltYXRpb247XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgc3VwZXIoIHtcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgICB9ICk7XG5cbiAgICBjb25zdCB4UHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlclggKTtcbiAgICBjb25zdCB5UHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlclkgKTtcbiAgICBjb25zdCBmb3JjZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCA0MCApO1xuICAgIGNvbnN0IGRhbXBpbmdQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMSApO1xuXG4gICAgdGhpcy54QW5pbWF0aW9uID0gbmV3IERhbXBlZEFuaW1hdGlvbigge1xuICAgICAgdmFsdWVQcm9wZXJ0eTogeFByb3BlcnR5LFxuICAgICAgZm9yY2U6IGZvcmNlUHJvcGVydHkudmFsdWUsXG4gICAgICBkYW1waW5nOiBkYW1waW5nUHJvcGVydHkudmFsdWUsXG4gICAgICB0YXJnZXRWYWx1ZTogeFByb3BlcnR5LnZhbHVlXG4gICAgfSApO1xuICAgIHRoaXMueUFuaW1hdGlvbiA9IG5ldyBEYW1wZWRBbmltYXRpb24oIHtcbiAgICAgIHZhbHVlUHJvcGVydHk6IHlQcm9wZXJ0eSxcbiAgICAgIGZvcmNlOiBmb3JjZVByb3BlcnR5LnZhbHVlLFxuICAgICAgZGFtcGluZzogZGFtcGluZ1Byb3BlcnR5LnZhbHVlLFxuICAgICAgdGFyZ2V0VmFsdWU6IHlQcm9wZXJ0eS52YWx1ZVxuICAgIH0gKTtcbiAgICBmb3JjZVByb3BlcnR5LmxpbmsoIGZvcmNlID0+IHtcbiAgICAgIHRoaXMueEFuaW1hdGlvbi5mb3JjZSA9IGZvcmNlO1xuICAgICAgdGhpcy55QW5pbWF0aW9uLmZvcmNlID0gZm9yY2U7XG4gICAgfSApO1xuICAgIGRhbXBpbmdQcm9wZXJ0eS5saW5rKCBkYW1waW5nID0+IHtcbiAgICAgIHRoaXMueEFuaW1hdGlvbi5kYW1waW5nID0gZGFtcGluZztcbiAgICAgIHRoaXMueUFuaW1hdGlvbi5kYW1waW5nID0gZGFtcGluZztcbiAgICB9ICk7XG5cbiAgICAvLyB0byBnZXQgdGhlIGlucHV0IGV2ZW50cyA6KFxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBQbGFuZSgpICk7XG5cbiAgICBjb25zdCBhbmltYXRlZENpcmNsZSA9IG5ldyBDaXJjbGUoIDIwLCB7XG4gICAgICBmaWxsOiAncmdiYSgwLDEyOCwyNTUsMC41KScsXG4gICAgICBzdHJva2U6ICdibGFjaycsXG4gICAgICBjaGlsZHJlbjogW1xuICAgICAgICBuZXcgQ2lyY2xlKCAzLCB7IGZpbGw6ICdibGFjaycgfSApXG4gICAgICBdXG4gICAgfSApO1xuICAgIHhQcm9wZXJ0eS5saW5rQXR0cmlidXRlKCBhbmltYXRlZENpcmNsZSwgJ3gnICk7XG4gICAgeVByb3BlcnR5LmxpbmtBdHRyaWJ1dGUoIGFuaW1hdGVkQ2lyY2xlLCAneScgKTtcbiAgICB0aGlzLmFkZENoaWxkKCBhbmltYXRlZENpcmNsZSApO1xuXG4gICAgY29uc3QgdGFyZ2V0Q2lyY2xlID0gbmV3IENpcmNsZSggMjAsIHtcbiAgICAgIHN0cm9rZTogJ3JlZCcsXG4gICAgICB4OiB4UHJvcGVydHkudmFsdWUsXG4gICAgICB5OiB5UHJvcGVydHkudmFsdWVcbiAgICB9ICk7XG4gICAgdGhpcy5hZGRDaGlsZCggdGFyZ2V0Q2lyY2xlICk7XG5cbiAgICBjb25zdCBtb3ZlVG9FdmVudCA9ICggZXZlbnQ6IFNjZW5lcnlFdmVudCApID0+IHtcbiAgICAgIGNvbnN0IGxvY2FsUG9pbnQgPSB0aGlzLmdsb2JhbFRvTG9jYWxQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApO1xuICAgICAgdGFyZ2V0Q2lyY2xlLnRyYW5zbGF0aW9uID0gbG9jYWxQb2ludDtcbiAgICAgIHRoaXMueEFuaW1hdGlvbi50YXJnZXRWYWx1ZSA9IGxvY2FsUG9pbnQueDtcbiAgICAgIHRoaXMueUFuaW1hdGlvbi50YXJnZXRWYWx1ZSA9IGxvY2FsUG9pbnQueTtcbiAgICB9O1xuXG4gICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCB7XG4gICAgICBkb3duOiBldmVudCA9PiB7XG4gICAgICAgIGlmICggIWV2ZW50LmNhblN0YXJ0UHJlc3MoKSApIHsgcmV0dXJuOyB9XG4gICAgICAgIG1vdmVUb0V2ZW50KCBldmVudCApO1xuICAgICAgfSxcbiAgICAgIG1vdmU6IGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKCBldmVudC5wb2ludGVyLmlzRG93biApIHtcbiAgICAgICAgICBtb3ZlVG9FdmVudCggZXZlbnQgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gKTtcblxuICAgIHRoaXMuYWRkQ2hpbGQoIGNyZWF0ZVNsaWRlckJveCggZm9yY2VQcm9wZXJ0eSwgbmV3IFJhbmdlKCA1LCAyMDAgKSwgJ0ZvcmNlJywgWyA1LCAyMDAgXSwge1xuICAgICAgbGVmdDogMTAsXG4gICAgICB0b3A6IDEwXG4gICAgfSApICk7XG5cbiAgICB0aGlzLmFkZENoaWxkKCBjcmVhdGVTbGlkZXJCb3goIGRhbXBpbmdQcm9wZXJ0eSwgbmV3IFJhbmdlKCAwLjEsIDMgKSwgJ0RhbXBpbmcnLCBbIDAuMSwgMSwgMyBdLCB7XG4gICAgICByaWdodDogdGhpcy5sYXlvdXRCb3VuZHMucmlnaHQgLSAxMCxcbiAgICAgIHRvcDogMTBcbiAgICB9ICkgKTtcblxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBUZXh0KCAnQ2xpY2sgb3IgZHJhZyB0byBtb3ZlIHRoZSBhbmltYXRpb24gdGFyZ2V0Jywge1xuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAzMCApLFxuICAgICAgYm90dG9tOiB0aGlzLmxheW91dEJvdW5kcy5ib3R0b20gLSAxMCxcbiAgICAgIGNlbnRlclg6IHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlclhcbiAgICB9ICkgKTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMueEFuaW1hdGlvbi5zdGVwKCBkdCApO1xuICAgIHRoaXMueUFuaW1hdGlvbi5zdGVwKCBkdCApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNsaWRlckJveCggcHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj4sIHJhbmdlOiBSYW5nZSwgbGFiZWw6IHN0cmluZywgbWFqb3JUaWNrczogbnVtYmVyW10sIG9wdGlvbnM/OiBOb2RlVHJhbnNsYXRpb25PcHRpb25zICk6IE5vZGUge1xuICBjb25zdCBsYWJlbE5vZGUgPSBuZXcgVGV4dCggbGFiZWwsIHsgZm9udDogbmV3IFBoZXRGb250KCAyMCApIH0gKTtcbiAgY29uc3Qgc2xpZGVyID0gbmV3IEhTbGlkZXIoIHByb3BlcnR5LCByYW5nZSwge1xuICAgIHRyYWNrU2l6ZTogbmV3IERpbWVuc2lvbjIoIDMwMCwgNSApXG4gIH0gKTtcbiAgbWFqb3JUaWNrcy5mb3JFYWNoKFxuICAgIHRpY2sgPT4gc2xpZGVyLmFkZE1ham9yVGljayggdGljaywgbmV3IFRleHQoIHRpY2ssIHsgZm9udDogbmV3IFBoZXRGb250KCAyMCApIH0gKSApXG4gICk7XG4gIHJldHVybiBuZXcgVkJveCggbWVyZ2UoIHtcbiAgICBjaGlsZHJlbjogWyBsYWJlbE5vZGUsIHNsaWRlciBdLFxuICAgIHNwYWNpbmc6IDEwXG4gIH0sIG9wdGlvbnMgKSApO1xufVxuXG50d2l4dC5yZWdpc3RlciggJ0RhbXBlZE1vdGlvblNjcmVlblZpZXcnLCBEYW1wZWRNb3Rpb25TY3JlZW5WaWV3ICk7Il0sIm5hbWVzIjpbIlByb3BlcnR5IiwiRGltZW5zaW9uMiIsIlJhbmdlIiwiU2NyZWVuVmlldyIsIm1lcmdlIiwiUGhldEZvbnQiLCJDaXJjbGUiLCJQbGFuZSIsIlRleHQiLCJWQm94IiwiSFNsaWRlciIsIlRhbmRlbSIsIkRhbXBlZEFuaW1hdGlvbiIsInR3aXh0IiwiRGFtcGVkTW90aW9uU2NyZWVuVmlldyIsInN0ZXAiLCJkdCIsInhBbmltYXRpb24iLCJ5QW5pbWF0aW9uIiwidGFuZGVtIiwiT1BUX09VVCIsInhQcm9wZXJ0eSIsImxheW91dEJvdW5kcyIsImNlbnRlclgiLCJ5UHJvcGVydHkiLCJjZW50ZXJZIiwiZm9yY2VQcm9wZXJ0eSIsImRhbXBpbmdQcm9wZXJ0eSIsInZhbHVlUHJvcGVydHkiLCJmb3JjZSIsInZhbHVlIiwiZGFtcGluZyIsInRhcmdldFZhbHVlIiwibGluayIsImFkZENoaWxkIiwiYW5pbWF0ZWRDaXJjbGUiLCJmaWxsIiwic3Ryb2tlIiwiY2hpbGRyZW4iLCJsaW5rQXR0cmlidXRlIiwidGFyZ2V0Q2lyY2xlIiwieCIsInkiLCJtb3ZlVG9FdmVudCIsImV2ZW50IiwibG9jYWxQb2ludCIsImdsb2JhbFRvTG9jYWxQb2ludCIsInBvaW50ZXIiLCJwb2ludCIsInRyYW5zbGF0aW9uIiwiYWRkSW5wdXRMaXN0ZW5lciIsImRvd24iLCJjYW5TdGFydFByZXNzIiwibW92ZSIsImlzRG93biIsImNyZWF0ZVNsaWRlckJveCIsImxlZnQiLCJ0b3AiLCJyaWdodCIsImZvbnQiLCJib3R0b20iLCJwcm9wZXJ0eSIsInJhbmdlIiwibGFiZWwiLCJtYWpvclRpY2tzIiwib3B0aW9ucyIsImxhYmVsTm9kZSIsInNsaWRlciIsInRyYWNrU2l6ZSIsImZvckVhY2giLCJ0aWNrIiwiYWRkTWFqb3JUaWNrIiwic3BhY2luZyIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGNBQWMsK0JBQStCO0FBQ3BELE9BQU9DLGdCQUFn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