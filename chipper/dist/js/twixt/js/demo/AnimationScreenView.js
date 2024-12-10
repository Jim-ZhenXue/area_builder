// Copyright 2020-2024, University of Colorado Boulder
/**
 * TODO #3
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Property from '../../../axon/js/Property.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import dotRandom from '../../../dot/js/dotRandom.js';
import Range from '../../../dot/js/Range.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import merge from '../../../phet-core/js/merge.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { Circle, Color, Node, Plane, Text, VBox } from '../../../scenery/js/imports.js';
import HSlider from '../../../sun/js/HSlider.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Animation from '../Animation.js';
import Easing from '../Easing.js';
import twixt from '../twixt.js';
import EasingComboBox from './EasingComboBox.js';
let AnimationScreenView = class AnimationScreenView extends ScreenView {
    constructor(){
        super({
            tandem: Tandem.OPT_OUT
        });
        const positionProperty = new Property(this.layoutBounds.center);
        const colorProperty = new Property(new Color(0, 128, 255, 0.5));
        const durationProperty = new Property(0.5);
        const easingProperty = new Property(Easing.QUADRATIC_IN_OUT);
        // to get the input events :(
        this.addChild(new Plane());
        const animatedCircle = new Circle(20, {
            fill: colorProperty,
            stroke: 'black',
            children: [
                new Circle(3, {
                    fill: 'black'
                })
            ]
        });
        positionProperty.linkAttribute(animatedCircle, 'translation');
        this.addChild(animatedCircle);
        const targetCircle = new Circle(20, {
            stroke: 'red',
            translation: positionProperty.value
        });
        this.addChild(targetCircle);
        const larger = new Animation({
            setValue: function(value) {
                animatedCircle.setScaleMagnitude(value);
            },
            from: 0.7,
            to: 1,
            duration: 0.4,
            easing: Easing.QUADRATIC_IN_OUT
        });
        const smaller = new Animation({
            setValue: function(value) {
                animatedCircle.setScaleMagnitude(value);
            },
            from: 1,
            to: 0.7,
            duration: 0.4,
            easing: Easing.QUADRATIC_IN_OUT
        });
        larger.then(smaller);
        smaller.then(larger);
        smaller.start();
        let animation;
        this.addInputListener({
            down: (event)=>{
                if (!event.canStartPress()) {
                    return;
                }
                if (!(event.target instanceof Plane)) {
                    return;
                }
                const localPoint = this.globalToLocalPoint(event.pointer.point);
                targetCircle.translation = localPoint;
                animation && animation.stop();
                animation = new Animation({
                    targets: [
                        {
                            property: positionProperty,
                            easing: easingProperty.value,
                            to: localPoint
                        },
                        {
                            property: colorProperty,
                            easing: easingProperty.value,
                            to: new Color(dotRandom.nextInt(256), dotRandom.nextInt(256), dotRandom.nextInt(256), 0.5)
                        }
                    ],
                    duration: durationProperty.value
                }).start();
            }
        });
        this.addChild(createSliderBox(durationProperty, new Range(0.1, 2), 'Duration', [
            0.1,
            0.5,
            1,
            2
        ], {
            left: 10,
            top: 10
        }));
        const listParent = new Node();
        this.addChild(new EasingComboBox(easingProperty, listParent, {
            right: this.layoutBounds.right - 10,
            top: 10
        }));
        this.addChild(new Text('Click to move the animation target', {
            font: new PhetFont(30),
            bottom: this.layoutBounds.bottom - 10,
            centerX: this.layoutBounds.centerX
        }));
        this.addChild(listParent);
    }
};
export { AnimationScreenView as default };
function createSliderBox(property, range, label, majorTicks, options) {
    const labelNode = new Text(label, {
        font: new PhetFont(20)
    });
    const slider = new HSlider(property, range, {
        trackSize: new Dimension2(300, 5)
    });
    majorTicks.forEach((tick)=>{
        slider.addMajorTick(tick, new Text(tick, {
            font: new PhetFont(20)
        }));
    });
    return new VBox(merge({
        children: [
            labelNode,
            slider
        ],
        spacing: 10
    }, options));
}
twixt.register('AnimationScreenView', AnimationScreenView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3R3aXh0L2pzL2RlbW8vQW5pbWF0aW9uU2NyZWVuVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBUT0RPICMzXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcbmltcG9ydCB7IENpcmNsZSwgQ29sb3IsIE5vZGUsIE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMsIFBsYW5lLCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBIU2xpZGVyIGZyb20gJy4uLy4uLy4uL3N1bi9qcy9IU2xpZGVyLmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgQW5pbWF0aW9uIGZyb20gJy4uL0FuaW1hdGlvbi5qcyc7XG5pbXBvcnQgRWFzaW5nIGZyb20gJy4uL0Vhc2luZy5qcyc7XG5pbXBvcnQgdHdpeHQgZnJvbSAnLi4vdHdpeHQuanMnO1xuaW1wb3J0IEVhc2luZ0NvbWJvQm94IGZyb20gJy4vRWFzaW5nQ29tYm9Cb3guanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBbmltYXRpb25TY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcblxuICAgIHN1cGVyKCB7XG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXG4gICAgfSApO1xuXG4gICAgY29uc3QgcG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyICk7XG4gICAgY29uc3QgY29sb3JQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbmV3IENvbG9yKCAwLCAxMjgsIDI1NSwgMC41ICkgKTtcbiAgICBjb25zdCBkdXJhdGlvblByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAwLjUgKTtcbiAgICBjb25zdCBlYXNpbmdQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggRWFzaW5nLlFVQURSQVRJQ19JTl9PVVQgKTtcblxuICAgIC8vIHRvIGdldCB0aGUgaW5wdXQgZXZlbnRzIDooXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IFBsYW5lKCkgKTtcblxuICAgIGNvbnN0IGFuaW1hdGVkQ2lyY2xlID0gbmV3IENpcmNsZSggMjAsIHtcbiAgICAgIGZpbGw6IGNvbG9yUHJvcGVydHksXG4gICAgICBzdHJva2U6ICdibGFjaycsXG4gICAgICBjaGlsZHJlbjogW1xuICAgICAgICBuZXcgQ2lyY2xlKCAzLCB7IGZpbGw6ICdibGFjaycgfSApXG4gICAgICBdXG4gICAgfSApO1xuICAgIHBvc2l0aW9uUHJvcGVydHkubGlua0F0dHJpYnV0ZSggYW5pbWF0ZWRDaXJjbGUsICd0cmFuc2xhdGlvbicgKTtcbiAgICB0aGlzLmFkZENoaWxkKCBhbmltYXRlZENpcmNsZSApO1xuXG4gICAgY29uc3QgdGFyZ2V0Q2lyY2xlID0gbmV3IENpcmNsZSggMjAsIHtcbiAgICAgIHN0cm9rZTogJ3JlZCcsXG4gICAgICB0cmFuc2xhdGlvbjogcG9zaXRpb25Qcm9wZXJ0eS52YWx1ZVxuICAgIH0gKTtcbiAgICB0aGlzLmFkZENoaWxkKCB0YXJnZXRDaXJjbGUgKTtcblxuICAgIGNvbnN0IGxhcmdlciA9IG5ldyBBbmltYXRpb24oIHtcbiAgICAgIHNldFZhbHVlOiBmdW5jdGlvbiggdmFsdWUgKSB7IGFuaW1hdGVkQ2lyY2xlLnNldFNjYWxlTWFnbml0dWRlKCB2YWx1ZSApOyB9LFxuICAgICAgZnJvbTogMC43LFxuICAgICAgdG86IDEsXG4gICAgICBkdXJhdGlvbjogMC40LFxuICAgICAgZWFzaW5nOiBFYXNpbmcuUVVBRFJBVElDX0lOX09VVFxuICAgIH0gKTtcbiAgICBjb25zdCBzbWFsbGVyID0gbmV3IEFuaW1hdGlvbigge1xuICAgICAgc2V0VmFsdWU6IGZ1bmN0aW9uKCB2YWx1ZSApIHsgYW5pbWF0ZWRDaXJjbGUuc2V0U2NhbGVNYWduaXR1ZGUoIHZhbHVlICk7IH0sXG4gICAgICBmcm9tOiAxLFxuICAgICAgdG86IDAuNyxcbiAgICAgIGR1cmF0aW9uOiAwLjQsXG4gICAgICBlYXNpbmc6IEVhc2luZy5RVUFEUkFUSUNfSU5fT1VUXG4gICAgfSApO1xuICAgIGxhcmdlci50aGVuKCBzbWFsbGVyICk7XG4gICAgc21hbGxlci50aGVuKCBsYXJnZXIgKTtcbiAgICBzbWFsbGVyLnN0YXJ0KCk7XG5cbiAgICBsZXQgYW5pbWF0aW9uOiBBbmltYXRpb247XG4gICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCB7XG4gICAgICBkb3duOiBldmVudCA9PiB7XG4gICAgICAgIGlmICggIWV2ZW50LmNhblN0YXJ0UHJlc3MoKSApIHsgcmV0dXJuOyB9XG4gICAgICAgIGlmICggISggZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgUGxhbmUgKSApIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgY29uc3QgbG9jYWxQb2ludCA9IHRoaXMuZ2xvYmFsVG9Mb2NhbFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICk7XG4gICAgICAgIHRhcmdldENpcmNsZS50cmFuc2xhdGlvbiA9IGxvY2FsUG9pbnQ7XG5cbiAgICAgICAgYW5pbWF0aW9uICYmIGFuaW1hdGlvbi5zdG9wKCk7XG4gICAgICAgIGFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oIHtcbiAgICAgICAgICB0YXJnZXRzOiBbIHtcbiAgICAgICAgICAgIHByb3BlcnR5OiBwb3NpdGlvblByb3BlcnR5LFxuICAgICAgICAgICAgZWFzaW5nOiBlYXNpbmdQcm9wZXJ0eS52YWx1ZSxcbiAgICAgICAgICAgIHRvOiBsb2NhbFBvaW50XG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgcHJvcGVydHk6IGNvbG9yUHJvcGVydHksXG4gICAgICAgICAgICBlYXNpbmc6IGVhc2luZ1Byb3BlcnR5LnZhbHVlLFxuICAgICAgICAgICAgdG86IG5ldyBDb2xvciggZG90UmFuZG9tLm5leHRJbnQoIDI1NiApLCBkb3RSYW5kb20ubmV4dEludCggMjU2ICksIGRvdFJhbmRvbS5uZXh0SW50KCAyNTYgKSwgMC41IClcbiAgICAgICAgICB9IF0sXG4gICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uUHJvcGVydHkudmFsdWVcbiAgICAgICAgfSApLnN0YXJ0KCk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgdGhpcy5hZGRDaGlsZCggY3JlYXRlU2xpZGVyQm94KCBkdXJhdGlvblByb3BlcnR5LCBuZXcgUmFuZ2UoIDAuMSwgMiApLCAnRHVyYXRpb24nLCBbIDAuMSwgMC41LCAxLCAyIF0sIHtcbiAgICAgIGxlZnQ6IDEwLFxuICAgICAgdG9wOiAxMFxuICAgIH0gKSApO1xuXG4gICAgY29uc3QgbGlzdFBhcmVudCA9IG5ldyBOb2RlKCk7XG5cbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgRWFzaW5nQ29tYm9Cb3goIGVhc2luZ1Byb3BlcnR5LCBsaXN0UGFyZW50LCB7XG4gICAgICByaWdodDogdGhpcy5sYXlvdXRCb3VuZHMucmlnaHQgLSAxMCxcbiAgICAgIHRvcDogMTBcbiAgICB9ICkgKTtcblxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBUZXh0KCAnQ2xpY2sgdG8gbW92ZSB0aGUgYW5pbWF0aW9uIHRhcmdldCcsIHtcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMzAgKSxcbiAgICAgIGJvdHRvbTogdGhpcy5sYXlvdXRCb3VuZHMuYm90dG9tIC0gMTAsXG4gICAgICBjZW50ZXJYOiB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJYXG4gICAgfSApICk7XG5cbiAgICB0aGlzLmFkZENoaWxkKCBsaXN0UGFyZW50ICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlU2xpZGVyQm94KCBwcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPiwgcmFuZ2U6IFJhbmdlLCBsYWJlbDogc3RyaW5nLCBtYWpvclRpY2tzOiBudW1iZXJbXSwgb3B0aW9ucz86IE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMgKTogTm9kZSB7XG4gIGNvbnN0IGxhYmVsTm9kZSA9IG5ldyBUZXh0KCBsYWJlbCwgeyBmb250OiBuZXcgUGhldEZvbnQoIDIwICkgfSApO1xuICBjb25zdCBzbGlkZXIgPSBuZXcgSFNsaWRlciggcHJvcGVydHksIHJhbmdlLCB7XG4gICAgdHJhY2tTaXplOiBuZXcgRGltZW5zaW9uMiggMzAwLCA1IClcbiAgfSApO1xuICBtYWpvclRpY2tzLmZvckVhY2goIHRpY2sgPT4ge1xuICAgIHNsaWRlci5hZGRNYWpvclRpY2soIHRpY2ssIG5ldyBUZXh0KCB0aWNrLCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMjAgKSB9ICkgKTtcbiAgfSApO1xuICByZXR1cm4gbmV3IFZCb3goIG1lcmdlKCB7XG4gICAgY2hpbGRyZW46IFsgbGFiZWxOb2RlLCBzbGlkZXIgXSxcbiAgICBzcGFjaW5nOiAxMFxuICB9LCBvcHRpb25zICkgKTtcbn1cblxudHdpeHQucmVnaXN0ZXIoICdBbmltYXRpb25TY3JlZW5WaWV3JywgQW5pbWF0aW9uU2NyZWVuVmlldyApOyJdLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJkb3RSYW5kb20iLCJSYW5nZSIsIlNjcmVlblZpZXciLCJtZXJnZSIsIlBoZXRGb250IiwiQ2lyY2xlIiwiQ29sb3IiLCJOb2RlIiwiUGxhbmUiLCJUZXh0IiwiVkJveCIsIkhTbGlkZXIiLCJUYW5kZW0iLCJBbmltYXRpb24iLCJFYXNpbmciLCJ0d2l4dCIsIkVhc2luZ0NvbWJvQm94IiwiQW5pbWF0aW9uU2NyZWVuVmlldyIsInRhbmRlbSIsIk9QVF9PVVQiLCJwb3NpdGlvblByb3BlcnR5IiwibGF5b3V0Qm91bmRzIiwiY2VudGVyIiwiY29sb3JQcm9wZXJ0eSIsImR1cmF0aW9uUHJvcGVydHkiLCJlYXNpbmdQcm9wZXJ0eSIsIlFVQURSQVRJQ19JTl9PVVQiLCJhZGRDaGlsZCIsImFuaW1hdGVkQ2lyY2xlIiwiZmlsbCIsInN0cm9rZSIsImNoaWxkcmVuIiwibGlua0F0dHJpYnV0ZSIsInRhcmdldENpcmNsZSIsInRyYW5zbGF0aW9uIiwidmFsdWUiLCJsYXJnZXIiLCJzZXRWYWx1ZSIsInNldFNjYWxlTWFnbml0dWRlIiwiZnJvbSIsInRvIiwiZHVyYXRpb24iLCJlYXNpbmciLCJzbWFsbGVyIiwidGhlbiIsInN0YXJ0IiwiYW5pbWF0aW9uIiwiYWRkSW5wdXRMaXN0ZW5lciIsImRvd24iLCJldmVudCIsImNhblN0YXJ0UHJlc3MiLCJ0YXJnZXQiLCJsb2NhbFBvaW50IiwiZ2xvYmFsVG9Mb2NhbFBvaW50IiwicG9pbnRlciIsInBvaW50Iiwic3RvcCIsInRhcmdldHMiLCJwcm9wZXJ0eSIsIm5leHRJbnQiLCJjcmVhdGVTbGlkZXJCb3giLCJsZWZ0IiwidG9wIiwibGlzdFBhcmVudCIsInJpZ2h0IiwiZm9udCIsImJvdHRvbSIsImNlbnRlclgiLCJyYW5nZSIsImxhYmVsIiwibWFqb3JUaWNrcyIsIm9wdGlvbnMiLCJsYWJlbE5vZGUiLCJzbGlkZXIiLCJ0cmFja1NpemUiLCJmb3JF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