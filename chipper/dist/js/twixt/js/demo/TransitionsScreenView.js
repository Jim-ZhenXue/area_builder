// Copyright 2020-2024, University of Colorado Boulder
/**
 * Demos how TransitionNode works
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Property from '../../../axon/js/Property.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import dotRandom from '../../../dot/js/dotRandom.js';
import Range from '../../../dot/js/Range.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import merge from '../../../phet-core/js/merge.js';
import ResetAllButton from '../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { Color, HBox, Node, Rectangle, Text, VBox } from '../../../scenery/js/imports.js';
import RectangularPushButton from '../../../sun/js/buttons/RectangularPushButton.js';
import HSlider from '../../../sun/js/HSlider.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Easing from '../Easing.js';
import TransitionNode from '../TransitionNode.js';
import twixt from '../twixt.js';
import EasingComboBox from './EasingComboBox.js';
let TransitionsScreenView = class TransitionsScreenView extends ScreenView {
    step(dt) {
        this.transitionNode.step(dt);
    }
    constructor(){
        super({
            tandem: Tandem.OPT_OUT
        });
        const bounds = new Bounds2(0, 0, 320, 240);
        const easingProperty = new Property(Easing.QUADRATIC_IN_OUT);
        const durationProperty = new Property(0.3);
        this.transitionNode = new TransitionNode(new Property(bounds), {
            content: createSomething(bounds)
        });
        const listParent = new Node();
        const comboBox = new EasingComboBox(easingProperty, listParent, {
            centerX: this.layoutBounds.centerX,
            bottom: this.transitionNode.top - 10
        });
        const durationSlider = createSliderGroup(durationProperty, new Range(0.1, 2), 'Duration', [
            0.1,
            0.5,
            1,
            2
        ], {
            left: 10,
            top: 10
        });
        // Function of TransitionNode that we want to demonstrate
        const transitionFunctions = [
            this.transitionNode.slideLeftTo.bind(this.transitionNode),
            this.transitionNode.slideRightTo.bind(this.transitionNode),
            this.transitionNode.slideUpTo.bind(this.transitionNode),
            this.transitionNode.slideDownTo.bind(this.transitionNode),
            this.transitionNode.wipeLeftTo.bind(this.transitionNode),
            this.transitionNode.wipeRightTo.bind(this.transitionNode),
            this.transitionNode.wipeUpTo.bind(this.transitionNode),
            this.transitionNode.wipeDownTo.bind(this.transitionNode),
            this.transitionNode.dissolveTo.bind(this.transitionNode)
        ];
        // Create a button to demonstrate each transition function.
        const transitionButtons = transitionFunctions.map((transitionFunction)=>{
            return new RectangularPushButton({
                content: new Text(transitionFunction.name, {
                    font: new PhetFont(20)
                }),
                listener: ()=>transitionFunction(createSomething(bounds), {
                        duration: durationProperty.value,
                        targetOptions: {
                            easing: easingProperty.value
                        }
                    })
            });
        });
        // Create rows of buttons.
        const transitionButtonRows = _.chunk(transitionButtons, 4).map((children)=>{
            return new HBox({
                children: children,
                spacing: 10
            });
        });
        this.addChild(new VBox({
            children: [
                durationSlider,
                comboBox,
                this.transitionNode,
                ...transitionButtonRows
            ],
            spacing: 10,
            center: this.layoutBounds.center
        }));
        // Reset All button
        const resetAllButton = new ResetAllButton({
            listener: ()=>{
                durationProperty.reset();
                easingProperty.reset();
            },
            right: this.layoutBounds.maxX - 10,
            bottom: this.layoutBounds.maxY - 10
        });
        this.addChild(resetAllButton);
        this.addChild(listParent);
    }
};
export { TransitionsScreenView as default };
function createSomething(bounds) {
    function randomColor() {
        return new Color(dotRandom.nextInt(256), dotRandom.nextInt(256), dotRandom.nextInt(256));
    }
    function randomString() {
        return _.range(0, 7).map(()=>String.fromCharCode(dotRandom.nextIntBetween(65, 122))).join('');
    }
    return Rectangle.bounds(bounds, {
        fill: randomColor(),
        children: [
            new Text(randomString(), {
                font: new PhetFont(60),
                center: bounds.center
            })
        ]
    });
}
function createSliderGroup(property, range, label, majorTicks, options) {
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
twixt.register('TransitionsScreenView', TransitionsScreenView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3R3aXh0L2pzL2RlbW8vVHJhbnNpdGlvbnNTY3JlZW5WaWV3LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERlbW9zIGhvdyBUcmFuc2l0aW9uTm9kZSB3b3Jrc1xuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xuaW1wb3J0IFJlc2V0QWxsQnV0dG9uIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xuaW1wb3J0IHsgQ29sb3IsIEhCb3gsIE5vZGUsIE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMsIFJlY3RhbmdsZSwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIGZyb20gJy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JlY3Rhbmd1bGFyUHVzaEJ1dHRvbi5qcyc7XG5pbXBvcnQgSFNsaWRlciBmcm9tICcuLi8uLi8uLi9zdW4vanMvSFNsaWRlci5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IEVhc2luZyBmcm9tICcuLi9FYXNpbmcuanMnO1xuaW1wb3J0IFRyYW5zaXRpb25Ob2RlIGZyb20gJy4uL1RyYW5zaXRpb25Ob2RlLmpzJztcbmltcG9ydCB0d2l4dCBmcm9tICcuLi90d2l4dC5qcyc7XG5pbXBvcnQgRWFzaW5nQ29tYm9Cb3ggZnJvbSAnLi9FYXNpbmdDb21ib0JveC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRyYW5zaXRpb25zU2NyZWVuVmlldyBleHRlbmRzIFNjcmVlblZpZXcge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgdHJhbnNpdGlvbk5vZGU6IFRyYW5zaXRpb25Ob2RlO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcblxuICAgIHN1cGVyKCB7XG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXG4gICAgfSApO1xuXG4gICAgY29uc3QgYm91bmRzID0gbmV3IEJvdW5kczIoIDAsIDAsIDMyMCwgMjQwICk7XG5cbiAgICBjb25zdCBlYXNpbmdQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggRWFzaW5nLlFVQURSQVRJQ19JTl9PVVQgKTtcbiAgICBjb25zdCBkdXJhdGlvblByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAwLjMgKTtcblxuICAgIHRoaXMudHJhbnNpdGlvbk5vZGUgPSBuZXcgVHJhbnNpdGlvbk5vZGUoIG5ldyBQcm9wZXJ0eSggYm91bmRzICksIHtcbiAgICAgIGNvbnRlbnQ6IGNyZWF0ZVNvbWV0aGluZyggYm91bmRzIClcbiAgICB9ICk7XG5cbiAgICBjb25zdCBsaXN0UGFyZW50ID0gbmV3IE5vZGUoKTtcblxuICAgIGNvbnN0IGNvbWJvQm94ID0gbmV3IEVhc2luZ0NvbWJvQm94KCBlYXNpbmdQcm9wZXJ0eSwgbGlzdFBhcmVudCwge1xuICAgICAgY2VudGVyWDogdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyWCxcbiAgICAgIGJvdHRvbTogdGhpcy50cmFuc2l0aW9uTm9kZS50b3AgLSAxMFxuICAgIH0gKTtcblxuICAgIGNvbnN0IGR1cmF0aW9uU2xpZGVyID0gY3JlYXRlU2xpZGVyR3JvdXAoIGR1cmF0aW9uUHJvcGVydHksIG5ldyBSYW5nZSggMC4xLCAyICksICdEdXJhdGlvbicsIFsgMC4xLCAwLjUsIDEsIDIgXSwge1xuICAgICAgbGVmdDogMTAsXG4gICAgICB0b3A6IDEwXG4gICAgfSApO1xuXG4gICAgLy8gRnVuY3Rpb24gb2YgVHJhbnNpdGlvbk5vZGUgdGhhdCB3ZSB3YW50IHRvIGRlbW9uc3RyYXRlXG4gICAgY29uc3QgdHJhbnNpdGlvbkZ1bmN0aW9ucyA9IFtcbiAgICAgIHRoaXMudHJhbnNpdGlvbk5vZGUuc2xpZGVMZWZ0VG8uYmluZCggdGhpcy50cmFuc2l0aW9uTm9kZSApLFxuICAgICAgdGhpcy50cmFuc2l0aW9uTm9kZS5zbGlkZVJpZ2h0VG8uYmluZCggdGhpcy50cmFuc2l0aW9uTm9kZSApLFxuICAgICAgdGhpcy50cmFuc2l0aW9uTm9kZS5zbGlkZVVwVG8uYmluZCggdGhpcy50cmFuc2l0aW9uTm9kZSApLFxuICAgICAgdGhpcy50cmFuc2l0aW9uTm9kZS5zbGlkZURvd25Uby5iaW5kKCB0aGlzLnRyYW5zaXRpb25Ob2RlICksXG4gICAgICB0aGlzLnRyYW5zaXRpb25Ob2RlLndpcGVMZWZ0VG8uYmluZCggdGhpcy50cmFuc2l0aW9uTm9kZSApLFxuICAgICAgdGhpcy50cmFuc2l0aW9uTm9kZS53aXBlUmlnaHRUby5iaW5kKCB0aGlzLnRyYW5zaXRpb25Ob2RlICksXG4gICAgICB0aGlzLnRyYW5zaXRpb25Ob2RlLndpcGVVcFRvLmJpbmQoIHRoaXMudHJhbnNpdGlvbk5vZGUgKSxcbiAgICAgIHRoaXMudHJhbnNpdGlvbk5vZGUud2lwZURvd25Uby5iaW5kKCB0aGlzLnRyYW5zaXRpb25Ob2RlICksXG4gICAgICB0aGlzLnRyYW5zaXRpb25Ob2RlLmRpc3NvbHZlVG8uYmluZCggdGhpcy50cmFuc2l0aW9uTm9kZSApXG4gICAgXTtcblxuICAgIC8vIENyZWF0ZSBhIGJ1dHRvbiB0byBkZW1vbnN0cmF0ZSBlYWNoIHRyYW5zaXRpb24gZnVuY3Rpb24uXG4gICAgY29uc3QgdHJhbnNpdGlvbkJ1dHRvbnMgPSB0cmFuc2l0aW9uRnVuY3Rpb25zLm1hcCggdHJhbnNpdGlvbkZ1bmN0aW9uID0+IHtcbiAgICAgIHJldHVybiBuZXcgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uKCB7XG4gICAgICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCB0cmFuc2l0aW9uRnVuY3Rpb24ubmFtZSwgeyBmb250OiBuZXcgUGhldEZvbnQoIDIwICkgfSApLFxuICAgICAgICBsaXN0ZW5lcjogKCkgPT4gdHJhbnNpdGlvbkZ1bmN0aW9uKCBjcmVhdGVTb21ldGhpbmcoIGJvdW5kcyApLCB7XG4gICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uUHJvcGVydHkudmFsdWUsXG4gICAgICAgICAgdGFyZ2V0T3B0aW9uczoge1xuICAgICAgICAgICAgZWFzaW5nOiBlYXNpbmdQcm9wZXJ0eS52YWx1ZVxuICAgICAgICAgIH1cbiAgICAgICAgfSApXG4gICAgICB9ICk7XG4gICAgfSApO1xuXG4gICAgLy8gQ3JlYXRlIHJvd3Mgb2YgYnV0dG9ucy5cbiAgICBjb25zdCB0cmFuc2l0aW9uQnV0dG9uUm93cyA9IF8uY2h1bmsoIHRyYW5zaXRpb25CdXR0b25zLCA0ICkubWFwKCBjaGlsZHJlbiA9PiB7XG4gICAgICByZXR1cm4gbmV3IEhCb3goIHtcbiAgICAgICAgY2hpbGRyZW46IGNoaWxkcmVuLFxuICAgICAgICBzcGFjaW5nOiAxMFxuICAgICAgfSApO1xuICAgIH0gKTtcblxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBWQm94KCB7XG4gICAgICBjaGlsZHJlbjogWyBkdXJhdGlvblNsaWRlciwgY29tYm9Cb3gsIHRoaXMudHJhbnNpdGlvbk5vZGUsIC4uLnRyYW5zaXRpb25CdXR0b25Sb3dzIF0sXG4gICAgICBzcGFjaW5nOiAxMCxcbiAgICAgIGNlbnRlcjogdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyXG4gICAgfSApICk7XG5cbiAgICAvLyBSZXNldCBBbGwgYnV0dG9uXG4gICAgY29uc3QgcmVzZXRBbGxCdXR0b24gPSBuZXcgUmVzZXRBbGxCdXR0b24oIHtcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XG4gICAgICAgIGR1cmF0aW9uUHJvcGVydHkucmVzZXQoKTtcbiAgICAgICAgZWFzaW5nUHJvcGVydHkucmVzZXQoKTtcbiAgICAgIH0sXG4gICAgICByaWdodDogdGhpcy5sYXlvdXRCb3VuZHMubWF4WCAtIDEwLFxuICAgICAgYm90dG9tOiB0aGlzLmxheW91dEJvdW5kcy5tYXhZIC0gMTBcbiAgICB9ICk7XG4gICAgdGhpcy5hZGRDaGlsZCggcmVzZXRBbGxCdXR0b24gKTtcblxuICAgIHRoaXMuYWRkQ2hpbGQoIGxpc3RQYXJlbnQgKTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMudHJhbnNpdGlvbk5vZGUuc3RlcCggZHQgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVTb21ldGhpbmcoIGJvdW5kczogQm91bmRzMiApOiBOb2RlIHtcblxuICBmdW5jdGlvbiByYW5kb21Db2xvcigpOiBDb2xvciB7XG4gICAgcmV0dXJuIG5ldyBDb2xvciggZG90UmFuZG9tLm5leHRJbnQoIDI1NiApLCBkb3RSYW5kb20ubmV4dEludCggMjU2ICksIGRvdFJhbmRvbS5uZXh0SW50KCAyNTYgKSApO1xuICB9XG5cbiAgZnVuY3Rpb24gcmFuZG9tU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIF8ucmFuZ2UoIDAsIDcgKVxuICAgICAgLm1hcCggKCkgPT4gU3RyaW5nLmZyb21DaGFyQ29kZSggZG90UmFuZG9tLm5leHRJbnRCZXR3ZWVuKCA2NSwgMTIyICkgKSApXG4gICAgICAuam9pbiggJycgKTtcbiAgfVxuXG4gIHJldHVybiBSZWN0YW5nbGUuYm91bmRzKCBib3VuZHMsIHtcbiAgICBmaWxsOiByYW5kb21Db2xvcigpLFxuICAgIGNoaWxkcmVuOiBbXG4gICAgICBuZXcgVGV4dCggcmFuZG9tU3RyaW5nKCksIHtcbiAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCA2MCApLFxuICAgICAgICBjZW50ZXI6IGJvdW5kcy5jZW50ZXJcbiAgICAgIH0gKVxuICAgIF1cbiAgfSApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTbGlkZXJHcm91cCggcHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj4sIHJhbmdlOiBSYW5nZSwgbGFiZWw6IHN0cmluZywgbWFqb3JUaWNrczogbnVtYmVyW10sIG9wdGlvbnM/OiBOb2RlVHJhbnNsYXRpb25PcHRpb25zICk6IE5vZGUge1xuICBjb25zdCBsYWJlbE5vZGUgPSBuZXcgVGV4dCggbGFiZWwsIHsgZm9udDogbmV3IFBoZXRGb250KCAyMCApIH0gKTtcbiAgY29uc3Qgc2xpZGVyID0gbmV3IEhTbGlkZXIoIHByb3BlcnR5LCByYW5nZSwge1xuICAgIHRyYWNrU2l6ZTogbmV3IERpbWVuc2lvbjIoIDMwMCwgNSApXG4gIH0gKTtcbiAgbWFqb3JUaWNrcy5mb3JFYWNoKFxuICAgIHRpY2sgPT4gc2xpZGVyLmFkZE1ham9yVGljayggdGljaywgbmV3IFRleHQoIHRpY2ssIHsgZm9udDogbmV3IFBoZXRGb250KCAyMCApIH0gKSApXG4gICk7XG4gIHJldHVybiBuZXcgVkJveCggbWVyZ2UoIHtcbiAgICBjaGlsZHJlbjogWyBsYWJlbE5vZGUsIHNsaWRlciBdLFxuICAgIHNwYWNpbmc6IDEwXG4gIH0sIG9wdGlvbnMgKSApO1xufVxuXG50d2l4dC5yZWdpc3RlciggJ1RyYW5zaXRpb25zU2NyZWVuVmlldycsIFRyYW5zaXRpb25zU2NyZWVuVmlldyApOyJdLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkJvdW5kczIiLCJEaW1lbnNpb24yIiwiZG90UmFuZG9tIiwiUmFuZ2UiLCJTY3JlZW5WaWV3IiwibWVyZ2UiLCJSZXNldEFsbEJ1dHRvbiIsIlBoZXRGb250IiwiQ29sb3IiLCJIQm94IiwiTm9kZSIsIlJlY3RhbmdsZSIsIlRleHQiLCJWQm94IiwiUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIiwiSFNsaWRlciIsIlRhbmRlbSIsIkVhc2luZyIsIlRyYW5zaXRpb25Ob2RlIiwidHdpeHQiLCJFYXNpbmdDb21ib0JveCIsIlRyYW5zaXRpb25zU2NyZWVuVmlldyIsInN0ZXAiLCJkdCIsInRyYW5zaXRpb25Ob2RlIiwidGFuZGVtIiwiT1BUX09VVCIsImJvdW5kcyIsImVhc2luZ1Byb3BlcnR5IiwiUVVBRFJBVElDX0lOX09VVCIsImR1cmF0aW9uUHJvcGVydHkiLCJjb250ZW50IiwiY3JlYXRlU29tZXRoaW5nIiwibGlzdFBhcmVudCIsImNvbWJvQm94IiwiY2VudGVyWCIsImxheW91dEJvdW5kcyIsImJvdHRvbSIsInRvcCIsImR1cmF0aW9uU2xpZGVyIiwiY3JlYXRlU2xpZGVyR3JvdXAiLCJsZWZ0IiwidHJhbnNpdGlvbkZ1bmN0aW9ucyIsInNsaWRlTGVmdFRvIiwiYmluZCIsInNsaWRlUmlnaHRUbyIsInNsaWRlVXBUbyIsInNsaWRlRG93blRvIiwid2lwZUxlZnRUbyIsIndpcGVSaWdodFRvIiwid2lwZVVwVG8iLCJ3aXBlRG93blRvIiwiZGlzc29sdmVUbyIsInRyYW5zaXRpb25CdXR0b25zIiwibWFwIiwidHJhbnNpdGlvbkZ1bmN0aW9uIiwibmFtZSIsImZvbnQiLCJsaXN0ZW5lciIsImR1cmF0aW9uIiwidmFsdWUiLCJ0YXJnZXRPcHRpb25zIiwiZWFzaW5nIiwidHJhbnNpdGlvbkJ1dHRvblJvd3MiLCJfIiwiY2h1bmsiLCJjaGlsZHJlbiIsInNwYWNpbmciLCJhZGRDaGlsZCIsImNlbnRlciIsInJlc2V0QWxsQnV0dG9uIiwicmVzZXQiLCJyaWdodCIsIm1heFgiLCJtYXhZIiwicmFuZG9tQ29sb3IiLCJuZXh0SW50IiwicmFuZG9tU3RyaW5nIiwicmFuZ2UiLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJuZXh0SW50QmV0d2VlbiIsImpvaW4iLCJmaWxsIiwicHJvcGVydHkiLCJsYWJlbCIsIm1ham9yVGlja3MiLCJvcHRpb25zIiwibGFiZWxOb2RlIiwic2xpZGVyIiwidHJhY2tTaXplIiwiZm9yRWFjaCIsInRpY2siLCJhZGRNYWpvclRpY2siLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxjQUFjLCtCQUErQjtBQUNwRCxPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxnQkFBZ0IsZ0NBQWdDO0FBQ3ZELE9BQU9DLGVBQWUsK0JBQStCO0FBQ3JELE9BQU9DLFdBQVcsMkJBQTJCO0FBQzdDLE9BQU9DLGdCQUFnQixrQ0FBa0M7QUFDekQsT0FBT0MsV0FBVyxpQ0FBaUM7QUFDbkQsT0FBT0Msb0JBQW9CLHFEQUFxRDtBQUNoRixPQUFPQyxjQUFjLHVDQUF1QztBQUM1RCxTQUFTQyxLQUFLLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUEwQkMsU0FBUyxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSxpQ0FBaUM7QUFDbEgsT0FBT0MsMkJBQTJCLG1EQUFtRDtBQUNyRixPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxZQUFZLCtCQUErQjtBQUNsRCxPQUFPQyxZQUFZLGVBQWU7QUFDbEMsT0FBT0Msb0JBQW9CLHVCQUF1QjtBQUNsRCxPQUFPQyxXQUFXLGNBQWM7QUFDaEMsT0FBT0Msb0JBQW9CLHNCQUFzQjtBQUVsQyxJQUFBLEFBQU1DLHdCQUFOLE1BQU1BLDhCQUE4QmpCO0lBcUZqQ2tCLEtBQU1DLEVBQVUsRUFBUztRQUN2QyxJQUFJLENBQUNDLGNBQWMsQ0FBQ0YsSUFBSSxDQUFFQztJQUM1QjtJQW5GQSxh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