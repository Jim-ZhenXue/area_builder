// Copyright 2014-2024, University of Colorado Boulder
/**
 * Demo for various push buttons.
 *
 * @author various contributors
 */ import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import { Circle, Color, Font, HBox, Node, Rectangle, Text, VBox, VStrut } from '../../../../scenery/js/imports.js';
import ArrowButton from '../../buttons/ArrowButton.js';
import ButtonNode from '../../buttons/ButtonNode.js';
import CarouselButton from '../../buttons/CarouselButton.js';
import RectangularPushButton from '../../buttons/RectangularPushButton.js';
import RoundPushButton from '../../buttons/RoundPushButton.js';
import Checkbox from '../../Checkbox.js';
const BUTTON_FONT = new Font({
    size: 16
});
export default function demoPushButtons(layoutBounds) {
    // For enabling/disabling all buttons
    const buttonsEnabledProperty = new Property(true);
    const buttonsEnabledCheckbox = new Checkbox(buttonsEnabledProperty, new Text('buttons enabled', {
        font: new Font({
            size: 20
        })
    }));
    //===================================================================================
    // Pseudo-3D buttons A, B, C, D, E
    //===================================================================================
    const buttonA = new RectangularPushButton({
        content: new Text('--- A ---', {
            font: BUTTON_FONT
        }),
        listener: ()=>console.log('buttonA fired'),
        enabledProperty: buttonsEnabledProperty,
        // demonstrate pointer areas, see https://github.com/phetsims/sun/issues/464
        touchAreaXDilation: 10,
        touchAreaYDilation: 10,
        mouseAreaXDilation: 5,
        mouseAreaYDilation: 5
    });
    const buttonB = new RectangularPushButton({
        content: new Text('--- B ---', {
            font: BUTTON_FONT
        }),
        listener: ()=>console.log('buttonB fired'),
        baseColor: new Color(250, 0, 0),
        enabledProperty: buttonsEnabledProperty
    });
    const buttonC = new RectangularPushButton({
        content: new Text('--- C ---', {
            font: BUTTON_FONT
        }),
        listener: ()=>console.log('buttonC fired'),
        baseColor: 'rgb( 204, 102, 204 )',
        enabledProperty: buttonsEnabledProperty
    });
    const buttonD = new RoundPushButton({
        content: new Text('--- D ---', {
            font: BUTTON_FONT
        }),
        listener: ()=>console.log('buttonD fired'),
        enabledProperty: buttonsEnabledProperty,
        radius: 30,
        lineWidth: 20 // a thick stroke, to test pointer areas and focus highlight
    });
    const buttonE = new RoundPushButton({
        content: new Text('--- E ---', {
            font: BUTTON_FONT
        }),
        listener: ()=>console.log('buttonE fired'),
        baseColor: 'yellow',
        enabledProperty: buttonsEnabledProperty,
        // Demonstrate shifted pointer areas, https://github.com/phetsims/sun/issues/500
        touchAreaXShift: 20,
        touchAreaYShift: 20,
        mouseAreaXShift: 10,
        mouseAreaYShift: 10
    });
    const buttonF = new RoundPushButton({
        content: new Text('--- F ---', {
            font: BUTTON_FONT,
            fill: 'white'
        }),
        listener: ()=>console.log('buttonF fired'),
        baseColor: 'purple',
        enabledProperty: buttonsEnabledProperty,
        xMargin: 20,
        yMargin: 20,
        xContentOffset: 8,
        yContentOffset: 15
    });
    // Test for a button with different radii for each corner
    const customCornersButton = new RectangularPushButton({
        baseColor: 'orange',
        enabledProperty: buttonsEnabledProperty,
        size: new Dimension2(50, 50),
        leftTopCornerRadius: 20,
        rightTopCornerRadius: 10,
        rightBottomCornerRadius: 5,
        leftBottomCornerRadius: 0,
        listener: ()=>console.log('customCornersButton fired')
    });
    const pseudo3DButtonsBox = new HBox({
        children: [
            buttonA,
            buttonB,
            buttonC,
            buttonD,
            buttonE,
            buttonF,
            customCornersButton
        ],
        spacing: 10
    });
    //===================================================================================
    // Flat buttons labeled 1, 2, 3, 4
    //===================================================================================
    const button1 = new RectangularPushButton({
        content: new Text('-- 1 --', {
            font: BUTTON_FONT
        }),
        listener: ()=>console.log('button1 fired'),
        baseColor: 'rgb( 204, 102, 204 )',
        enabledProperty: buttonsEnabledProperty,
        buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy
    });
    const button2 = new RectangularPushButton({
        content: new Text('-- 2 --', {
            font: BUTTON_FONT
        }),
        listener: ()=>console.log('button2 fired'),
        baseColor: '#A0D022',
        enabledProperty: buttonsEnabledProperty,
        buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
        lineWidth: 1,
        stroke: '#202020'
    });
    const button3 = new RoundPushButton({
        content: new Text('- 3 -', {
            font: BUTTON_FONT
        }),
        listener: ()=>console.log('button3 fired'),
        enabledProperty: buttonsEnabledProperty,
        buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy
    });
    const button4 = new RoundPushButton({
        content: new Text('-- 4 --', {
            font: BUTTON_FONT,
            fill: 'white'
        }),
        listener: ()=>console.log('button4 fired'),
        baseColor: '#CC3300',
        enabledProperty: buttonsEnabledProperty,
        buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy
    });
    const flatButtonsBox = new HBox({
        children: [
            button1,
            button2,
            button3,
            button4
        ],
        spacing: 10
    });
    //===================================================================================
    // Fire! Go! Help! buttons - these demonstrate more colors and sizes of buttons
    //===================================================================================
    const fireButton = new RoundPushButton({
        content: new Text('Fire!', {
            font: BUTTON_FONT
        }),
        listener: ()=>console.log('fireButton fired'),
        enabledProperty: buttonsEnabledProperty,
        baseColor: 'orange',
        stroke: 'black',
        lineWidth: 0.5
    });
    const goButton = new RoundPushButton({
        content: new Text('Go!', {
            font: BUTTON_FONT
        }),
        listener: ()=>console.log('goButton fired'),
        baseColor: new Color(0, 163, 0),
        enabledProperty: buttonsEnabledProperty
    });
    const helpButton = new RoundPushButton({
        content: new Text('Help', {
            font: BUTTON_FONT
        }),
        listener: ()=>console.log('helpButton fired'),
        baseColor: new Color(244, 154, 194),
        enabledProperty: buttonsEnabledProperty
    });
    const actionButtonsBox = new HBox({
        children: [
            fireButton,
            goButton,
            helpButton
        ],
        spacing: 15
    });
    //===================================================================================
    // Buttons with fire-on-hold turned on
    //===================================================================================
    const fireQuicklyWhenHeldButton = new RectangularPushButton({
        content: new Text('Press and hold to test (fast fire)', {
            font: BUTTON_FONT
        }),
        listener: ()=>console.log('fireQuicklyWhenHeldButton fired'),
        baseColor: new Color(114, 132, 62),
        enabledProperty: buttonsEnabledProperty,
        fireOnHold: true,
        fireOnHoldDelay: 100,
        fireOnHoldInterval: 50
    });
    const fireSlowlyWhenHeldButton = new RectangularPushButton({
        content: new Text('Press and hold to test (slow fire)', {
            font: BUTTON_FONT
        }),
        listener: ()=>console.log('fireSlowlyWhenHeldButton fired'),
        baseColor: new Color(147, 92, 120),
        enabledProperty: buttonsEnabledProperty,
        fireOnHold: true,
        fireOnHoldDelay: 600,
        fireOnHoldInterval: 300,
        top: fireQuicklyWhenHeldButton.bottom + 10
    });
    const heldButtonsBox = new VBox({
        children: [
            fireQuicklyWhenHeldButton,
            fireSlowlyWhenHeldButton
        ],
        spacing: 10,
        align: 'left'
    });
    const upperLeftAlignTextNode = new Text('upper left align test', {
        font: BUTTON_FONT
    });
    const upperLeftContentButton = new RectangularPushButton({
        content: upperLeftAlignTextNode,
        listener: ()=>console.log('upperLeftContentButton fired'),
        enabledProperty: buttonsEnabledProperty,
        xAlign: 'left',
        yAlign: 'top',
        minWidth: upperLeftAlignTextNode.width * 1.5,
        minHeight: upperLeftAlignTextNode.height * 2
    });
    const lowerRightAlignTextNode = new Text('lower right align test', {
        font: BUTTON_FONT
    });
    const lowerRightContentButton = new RectangularPushButton({
        content: lowerRightAlignTextNode,
        listener: ()=>console.log('lowerRightContentButton fired'),
        enabledProperty: buttonsEnabledProperty,
        xAlign: 'right',
        yAlign: 'bottom',
        minWidth: lowerRightAlignTextNode.width * 1.5,
        minHeight: lowerRightAlignTextNode.height * 2,
        top: upperLeftContentButton.height + 10
    });
    const alignTextButtonsBox = new VBox({
        children: [
            upperLeftContentButton,
            lowerRightContentButton
        ],
        spacing: 10,
        align: 'left'
    });
    //===================================================================================
    // Miscellaneous other button examples
    //===================================================================================
    const fireOnDownButton = new RectangularPushButton({
        content: new Text('Fire on Down', {
            font: BUTTON_FONT
        }),
        listener: ()=>console.log('fireOnDownButton fired'),
        baseColor: new Color(255, 255, 61),
        enabledProperty: buttonsEnabledProperty,
        fireOnDown: true,
        stroke: 'black',
        lineWidth: 1
    });
    // transparent button with something behind it
    const rectangleNode = new Rectangle(0, 0, 25, 100, {
        fill: 'red'
    });
    const transparentAlphaButton = new RectangularPushButton({
        content: new Text('Transparent Button via alpha', {
            font: BUTTON_FONT
        }),
        listener: ()=>console.log('transparentAlphaButton fired'),
        baseColor: new Color(255, 255, 0, 0.7),
        enabledProperty: buttonsEnabledProperty,
        centerX: rectangleNode.centerX,
        top: rectangleNode.top + 10
    });
    const transparentOpacityButton = new RectangularPushButton({
        content: new Text('Transparent Button via opacity', {
            font: BUTTON_FONT
        }),
        listener: ()=>console.log('transparentOpacityButton fired'),
        baseColor: new Color(255, 255, 0),
        enabledProperty: buttonsEnabledProperty,
        opacity: 0.6,
        centerX: rectangleNode.centerX,
        bottom: rectangleNode.bottom - 10
    });
    const transparentParent = new Node({
        children: [
            rectangleNode,
            transparentAlphaButton,
            transparentOpacityButton
        ]
    });
    const arrowButton = new ArrowButton('left', ()=>console.log('arrowButton fired'), {
        enabledProperty: buttonsEnabledProperty
    });
    const carouselButton = new CarouselButton({
        listener: ()=>console.log('carouselButton fired'),
        enabledProperty: buttonsEnabledProperty
    });
    const miscButtonsBox = new HBox({
        children: [
            fireOnDownButton,
            transparentParent,
            arrowButton,
            carouselButton
        ],
        spacing: 15
    });
    //===================================================================================
    // Test the 2 ways of specifying a button's size:
    // (1) If you provide size of the button, content is sized to fit the button.
    // (2) If you don't provide size, the button is sized to fit the content.
    // See https://github.com/phetsims/sun/issues/657
    //===================================================================================
    // This button's stroke will look thicker, because content will be scaled up.
    const roundButtonWithExplicitSize = new RoundPushButton({
        enabledProperty: buttonsEnabledProperty,
        radius: 25,
        content: new Circle(5, {
            fill: 'red',
            stroke: 'black'
        }),
        listener: ()=>console.log('roundButtonWithExplicitSize pressed'),
        xMargin: 5,
        yMargin: 5
    });
    // This button's content will look as specified, because button is sized to fit the content.
    const roundButtonWithDerivedSize = new RoundPushButton({
        enabledProperty: buttonsEnabledProperty,
        content: new Circle(20, {
            fill: 'red',
            stroke: 'black'
        }),
        listener: ()=>console.log('roundButtonWithDerivedSize pressed'),
        xMargin: 5,
        yMargin: 5
    });
    // The total size of this one, should be the same as the content of the one below. This button's stroke will look
    // thicker, because content will be scaled up.
    const rectangularButtonWithExplicitSize = new RectangularPushButton({
        enabledProperty: buttonsEnabledProperty,
        size: new Dimension2(40, 25),
        content: new Rectangle(0, 0, 5, 3, {
            fill: 'red',
            stroke: 'black'
        }),
        listener: ()=>console.log('rectangularButtonWithExplicitSize pressed'),
        xMargin: 5,
        yMargin: 5
    });
    // This button's content will look as specified, because button is sized to fit around the content.
    const rectangularButtonWithDerivedSize = new RectangularPushButton({
        enabledProperty: buttonsEnabledProperty,
        content: new Rectangle(0, 0, 40, 25, {
            fill: 'blue',
            stroke: 'black'
        }),
        listener: ()=>console.log('rectangularButtonWithDerivedSize pressed'),
        xMargin: 5,
        yMargin: 5
    });
    const buttonSizeDemos = new HBox({
        spacing: 20,
        children: [
            rectangularButtonWithExplicitSize,
            rectangularButtonWithDerivedSize,
            roundButtonWithExplicitSize,
            roundButtonWithDerivedSize
        ]
    });
    //===================================================================================
    // Demonstrate dynamic colors for some buttons
    //===================================================================================
    // Change colors of all buttons in pseudo3DButtonsBox
    const changeButtonColorsButton = new RectangularPushButton({
        enabledProperty: buttonsEnabledProperty,
        content: new Text('\u21e6 Change button colors', {
            font: BUTTON_FONT
        }),
        listener: ()=>{
            console.log('changeButtonColorsButton fired');
            pseudo3DButtonsBox.children.forEach((child)=>{
                if (child instanceof ButtonNode) {
                    child.baseColor = new Color(dotRandom.nextDoubleBetween(0, 255), dotRandom.nextDoubleBetween(0, 255), dotRandom.nextDoubleBetween(0, 255));
                }
            });
        }
    });
    //===================================================================================
    // Layout
    //===================================================================================
    const xSpacing = 50;
    return new VBox({
        spacing: 15,
        children: [
            new HBox({
                spacing: xSpacing,
                children: [
                    pseudo3DButtonsBox,
                    changeButtonColorsButton
                ]
            }),
            new HBox({
                spacing: xSpacing,
                children: [
                    flatButtonsBox,
                    actionButtonsBox
                ]
            }),
            new HBox({
                spacing: xSpacing,
                children: [
                    heldButtonsBox,
                    alignTextButtonsBox
                ]
            }),
            miscButtonsBox,
            buttonSizeDemos,
            new VStrut(25),
            buttonsEnabledCheckbox
        ],
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL2J1dHRvbnMvZGVtb1B1c2hCdXR0b25zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERlbW8gZm9yIHZhcmlvdXMgcHVzaCBidXR0b25zLlxuICpcbiAqIEBhdXRob3IgdmFyaW91cyBjb250cmlidXRvcnNcbiAqL1xuXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xuaW1wb3J0IHsgQ2lyY2xlLCBDb2xvciwgRm9udCwgSEJveCwgTm9kZSwgUmVjdGFuZ2xlLCBUZXh0LCBWQm94LCBWU3RydXQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEFycm93QnV0dG9uIGZyb20gJy4uLy4uL2J1dHRvbnMvQXJyb3dCdXR0b24uanMnO1xuaW1wb3J0IEJ1dHRvbk5vZGUgZnJvbSAnLi4vLi4vYnV0dG9ucy9CdXR0b25Ob2RlLmpzJztcbmltcG9ydCBDYXJvdXNlbEJ1dHRvbiBmcm9tICcuLi8uLi9idXR0b25zL0Nhcm91c2VsQnV0dG9uLmpzJztcbmltcG9ydCBSZWN0YW5ndWxhclB1c2hCdXR0b24gZnJvbSAnLi4vLi4vYnV0dG9ucy9SZWN0YW5ndWxhclB1c2hCdXR0b24uanMnO1xuaW1wb3J0IFJvdW5kUHVzaEJ1dHRvbiBmcm9tICcuLi8uLi9idXR0b25zL1JvdW5kUHVzaEJ1dHRvbi5qcyc7XG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vLi4vQ2hlY2tib3guanMnO1xuXG5jb25zdCBCVVRUT05fRk9OVCA9IG5ldyBGb250KCB7IHNpemU6IDE2IH0gKTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVtb1B1c2hCdXR0b25zKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XG5cbiAgLy8gRm9yIGVuYWJsaW5nL2Rpc2FibGluZyBhbGwgYnV0dG9uc1xuICBjb25zdCBidXR0b25zRW5hYmxlZFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCB0cnVlICk7XG4gIGNvbnN0IGJ1dHRvbnNFbmFibGVkQ2hlY2tib3ggPSBuZXcgQ2hlY2tib3goIGJ1dHRvbnNFbmFibGVkUHJvcGVydHksIG5ldyBUZXh0KCAnYnV0dG9ucyBlbmFibGVkJywge1xuICAgIGZvbnQ6IG5ldyBGb250KCB7IHNpemU6IDIwIH0gKVxuICB9ICkgKTtcblxuICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFBzZXVkby0zRCBidXR0b25zIEEsIEIsIEMsIEQsIEVcbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIGNvbnN0IGJ1dHRvbkEgPSBuZXcgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uKCB7XG4gICAgY29udGVudDogbmV3IFRleHQoICctLS0gQSAtLS0nLCB7IGZvbnQ6IEJVVFRPTl9GT05UIH0gKSxcbiAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICdidXR0b25BIGZpcmVkJyApLFxuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSxcblxuICAgIC8vIGRlbW9uc3RyYXRlIHBvaW50ZXIgYXJlYXMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy80NjRcbiAgICB0b3VjaEFyZWFYRGlsYXRpb246IDEwLFxuICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogMTAsXG4gICAgbW91c2VBcmVhWERpbGF0aW9uOiA1LFxuICAgIG1vdXNlQXJlYVlEaWxhdGlvbjogNVxuICB9ICk7XG5cbiAgY29uc3QgYnV0dG9uQiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcbiAgICBjb250ZW50OiBuZXcgVGV4dCggJy0tLSBCIC0tLScsIHsgZm9udDogQlVUVE9OX0ZPTlQgfSApLFxuICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ2J1dHRvbkIgZmlyZWQnICksXG4gICAgYmFzZUNvbG9yOiBuZXcgQ29sb3IoIDI1MCwgMCwgMCApLFxuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eVxuICB9ICk7XG5cbiAgY29uc3QgYnV0dG9uQyA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcbiAgICBjb250ZW50OiBuZXcgVGV4dCggJy0tLSBDIC0tLScsIHsgZm9udDogQlVUVE9OX0ZPTlQgfSApLFxuICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ2J1dHRvbkMgZmlyZWQnICksXG4gICAgYmFzZUNvbG9yOiAncmdiKCAyMDQsIDEwMiwgMjA0ICknLFxuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eVxuICB9ICk7XG5cbiAgY29uc3QgYnV0dG9uRCA9IG5ldyBSb3VuZFB1c2hCdXR0b24oIHtcbiAgICBjb250ZW50OiBuZXcgVGV4dCggJy0tLSBEIC0tLScsIHsgZm9udDogQlVUVE9OX0ZPTlQgfSApLFxuICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ2J1dHRvbkQgZmlyZWQnICksXG4gICAgZW5hYmxlZFByb3BlcnR5OiBidXR0b25zRW5hYmxlZFByb3BlcnR5LFxuICAgIHJhZGl1czogMzAsXG4gICAgbGluZVdpZHRoOiAyMCAvLyBhIHRoaWNrIHN0cm9rZSwgdG8gdGVzdCBwb2ludGVyIGFyZWFzIGFuZCBmb2N1cyBoaWdobGlnaHRcbiAgfSApO1xuXG4gIGNvbnN0IGJ1dHRvbkUgPSBuZXcgUm91bmRQdXNoQnV0dG9uKCB7XG4gICAgY29udGVudDogbmV3IFRleHQoICctLS0gRSAtLS0nLCB7IGZvbnQ6IEJVVFRPTl9GT05UIH0gKSxcbiAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICdidXR0b25FIGZpcmVkJyApLFxuICAgIGJhc2VDb2xvcjogJ3llbGxvdycsXG4gICAgZW5hYmxlZFByb3BlcnR5OiBidXR0b25zRW5hYmxlZFByb3BlcnR5LFxuXG4gICAgLy8gRGVtb25zdHJhdGUgc2hpZnRlZCBwb2ludGVyIGFyZWFzLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy81MDBcbiAgICB0b3VjaEFyZWFYU2hpZnQ6IDIwLFxuICAgIHRvdWNoQXJlYVlTaGlmdDogMjAsXG4gICAgbW91c2VBcmVhWFNoaWZ0OiAxMCxcbiAgICBtb3VzZUFyZWFZU2hpZnQ6IDEwXG4gIH0gKTtcblxuICBjb25zdCBidXR0b25GID0gbmV3IFJvdW5kUHVzaEJ1dHRvbigge1xuICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCAnLS0tIEYgLS0tJywgeyBmb250OiBCVVRUT05fRk9OVCwgZmlsbDogJ3doaXRlJyB9ICksXG4gICAgbGlzdGVuZXI6ICgpID0+IGNvbnNvbGUubG9nKCAnYnV0dG9uRiBmaXJlZCcgKSxcbiAgICBiYXNlQ29sb3I6ICdwdXJwbGUnLFxuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSxcbiAgICB4TWFyZ2luOiAyMCxcbiAgICB5TWFyZ2luOiAyMCxcbiAgICB4Q29udGVudE9mZnNldDogOCxcbiAgICB5Q29udGVudE9mZnNldDogMTVcbiAgfSApO1xuXG4gIC8vIFRlc3QgZm9yIGEgYnV0dG9uIHdpdGggZGlmZmVyZW50IHJhZGlpIGZvciBlYWNoIGNvcm5lclxuICBjb25zdCBjdXN0b21Db3JuZXJzQnV0dG9uID0gbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xuICAgIGJhc2VDb2xvcjogJ29yYW5nZScsXG4gICAgZW5hYmxlZFByb3BlcnR5OiBidXR0b25zRW5hYmxlZFByb3BlcnR5LFxuICAgIHNpemU6IG5ldyBEaW1lbnNpb24yKCA1MCwgNTAgKSxcbiAgICBsZWZ0VG9wQ29ybmVyUmFkaXVzOiAyMCxcbiAgICByaWdodFRvcENvcm5lclJhZGl1czogMTAsXG4gICAgcmlnaHRCb3R0b21Db3JuZXJSYWRpdXM6IDUsXG4gICAgbGVmdEJvdHRvbUNvcm5lclJhZGl1czogMCxcbiAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICdjdXN0b21Db3JuZXJzQnV0dG9uIGZpcmVkJyApXG4gIH0gKTtcblxuICBjb25zdCBwc2V1ZG8zREJ1dHRvbnNCb3ggPSBuZXcgSEJveCgge1xuICAgIGNoaWxkcmVuOiBbIGJ1dHRvbkEsIGJ1dHRvbkIsIGJ1dHRvbkMsIGJ1dHRvbkQsIGJ1dHRvbkUsIGJ1dHRvbkYsIGN1c3RvbUNvcm5lcnNCdXR0b24gXSxcbiAgICBzcGFjaW5nOiAxMFxuICB9ICk7XG5cbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBGbGF0IGJ1dHRvbnMgbGFiZWxlZCAxLCAyLCAzLCA0XG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBjb25zdCBidXR0b24xID0gbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xuICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCAnLS0gMSAtLScsIHsgZm9udDogQlVUVE9OX0ZPTlQgfSApLFxuICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ2J1dHRvbjEgZmlyZWQnICksXG4gICAgYmFzZUNvbG9yOiAncmdiKCAyMDQsIDEwMiwgMjA0ICknLFxuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSxcbiAgICBidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3k6IEJ1dHRvbk5vZGUuRmxhdEFwcGVhcmFuY2VTdHJhdGVneVxuICB9ICk7XG5cbiAgY29uc3QgYnV0dG9uMiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcbiAgICBjb250ZW50OiBuZXcgVGV4dCggJy0tIDIgLS0nLCB7IGZvbnQ6IEJVVFRPTl9GT05UIH0gKSxcbiAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICdidXR0b24yIGZpcmVkJyApLFxuICAgIGJhc2VDb2xvcjogJyNBMEQwMjInLFxuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSxcbiAgICBidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3k6IEJ1dHRvbk5vZGUuRmxhdEFwcGVhcmFuY2VTdHJhdGVneSxcbiAgICBsaW5lV2lkdGg6IDEsXG4gICAgc3Ryb2tlOiAnIzIwMjAyMCdcbiAgfSApO1xuXG4gIGNvbnN0IGJ1dHRvbjMgPSBuZXcgUm91bmRQdXNoQnV0dG9uKCB7XG4gICAgY29udGVudDogbmV3IFRleHQoICctIDMgLScsIHsgZm9udDogQlVUVE9OX0ZPTlQgfSApLFxuICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ2J1dHRvbjMgZmlyZWQnICksXG4gICAgZW5hYmxlZFByb3BlcnR5OiBidXR0b25zRW5hYmxlZFByb3BlcnR5LFxuICAgIGJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneTogQnV0dG9uTm9kZS5GbGF0QXBwZWFyYW5jZVN0cmF0ZWd5XG4gIH0gKTtcblxuICBjb25zdCBidXR0b240ID0gbmV3IFJvdW5kUHVzaEJ1dHRvbigge1xuICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCAnLS0gNCAtLScsIHsgZm9udDogQlVUVE9OX0ZPTlQsIGZpbGw6ICd3aGl0ZScgfSApLFxuICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ2J1dHRvbjQgZmlyZWQnICksXG4gICAgYmFzZUNvbG9yOiAnI0NDMzMwMCcsXG4gICAgZW5hYmxlZFByb3BlcnR5OiBidXR0b25zRW5hYmxlZFByb3BlcnR5LFxuICAgIGJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneTogQnV0dG9uTm9kZS5GbGF0QXBwZWFyYW5jZVN0cmF0ZWd5XG4gIH0gKTtcblxuICBjb25zdCBmbGF0QnV0dG9uc0JveCA9IG5ldyBIQm94KCB7XG4gICAgY2hpbGRyZW46IFsgYnV0dG9uMSwgYnV0dG9uMiwgYnV0dG9uMywgYnV0dG9uNCBdLFxuICAgIHNwYWNpbmc6IDEwXG4gIH0gKTtcblxuICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIEZpcmUhIEdvISBIZWxwISBidXR0b25zIC0gdGhlc2UgZGVtb25zdHJhdGUgbW9yZSBjb2xvcnMgYW5kIHNpemVzIG9mIGJ1dHRvbnNcbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIGNvbnN0IGZpcmVCdXR0b24gPSBuZXcgUm91bmRQdXNoQnV0dG9uKCB7XG4gICAgY29udGVudDogbmV3IFRleHQoICdGaXJlIScsIHsgZm9udDogQlVUVE9OX0ZPTlQgfSApLFxuICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ2ZpcmVCdXR0b24gZmlyZWQnICksXG4gICAgZW5hYmxlZFByb3BlcnR5OiBidXR0b25zRW5hYmxlZFByb3BlcnR5LFxuICAgIGJhc2VDb2xvcjogJ29yYW5nZScsXG4gICAgc3Ryb2tlOiAnYmxhY2snLFxuICAgIGxpbmVXaWR0aDogMC41XG4gIH0gKTtcblxuICBjb25zdCBnb0J1dHRvbiA9IG5ldyBSb3VuZFB1c2hCdXR0b24oIHtcbiAgICBjb250ZW50OiBuZXcgVGV4dCggJ0dvIScsIHsgZm9udDogQlVUVE9OX0ZPTlQgfSApLFxuICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ2dvQnV0dG9uIGZpcmVkJyApLFxuICAgIGJhc2VDb2xvcjogbmV3IENvbG9yKCAwLCAxNjMsIDAgKSxcbiAgICBlbmFibGVkUHJvcGVydHk6IGJ1dHRvbnNFbmFibGVkUHJvcGVydHlcbiAgfSApO1xuXG4gIGNvbnN0IGhlbHBCdXR0b24gPSBuZXcgUm91bmRQdXNoQnV0dG9uKCB7XG4gICAgY29udGVudDogbmV3IFRleHQoICdIZWxwJywgeyBmb250OiBCVVRUT05fRk9OVCB9ICksXG4gICAgbGlzdGVuZXI6ICgpID0+IGNvbnNvbGUubG9nKCAnaGVscEJ1dHRvbiBmaXJlZCcgKSxcbiAgICBiYXNlQ29sb3I6IG5ldyBDb2xvciggMjQ0LCAxNTQsIDE5NCApLFxuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eVxuICB9ICk7XG5cbiAgY29uc3QgYWN0aW9uQnV0dG9uc0JveCA9IG5ldyBIQm94KCB7XG4gICAgY2hpbGRyZW46IFsgZmlyZUJ1dHRvbiwgZ29CdXR0b24sIGhlbHBCdXR0b24gXSxcbiAgICBzcGFjaW5nOiAxNVxuICB9ICk7XG5cbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBCdXR0b25zIHdpdGggZmlyZS1vbi1ob2xkIHR1cm5lZCBvblxuICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgY29uc3QgZmlyZVF1aWNrbHlXaGVuSGVsZEJ1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcbiAgICBjb250ZW50OiBuZXcgVGV4dCggJ1ByZXNzIGFuZCBob2xkIHRvIHRlc3QgKGZhc3QgZmlyZSknLCB7IGZvbnQ6IEJVVFRPTl9GT05UIH0gKSxcbiAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICdmaXJlUXVpY2tseVdoZW5IZWxkQnV0dG9uIGZpcmVkJyApLFxuICAgIGJhc2VDb2xvcjogbmV3IENvbG9yKCAxMTQsIDEzMiwgNjIgKSxcbiAgICBlbmFibGVkUHJvcGVydHk6IGJ1dHRvbnNFbmFibGVkUHJvcGVydHksXG4gICAgZmlyZU9uSG9sZDogdHJ1ZSxcbiAgICBmaXJlT25Ib2xkRGVsYXk6IDEwMCxcbiAgICBmaXJlT25Ib2xkSW50ZXJ2YWw6IDUwXG4gIH0gKTtcblxuICBjb25zdCBmaXJlU2xvd2x5V2hlbkhlbGRCdXR0b24gPSBuZXcgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uKCB7XG4gICAgY29udGVudDogbmV3IFRleHQoICdQcmVzcyBhbmQgaG9sZCB0byB0ZXN0IChzbG93IGZpcmUpJywgeyBmb250OiBCVVRUT05fRk9OVCB9ICksXG4gICAgbGlzdGVuZXI6ICgpID0+IGNvbnNvbGUubG9nKCAnZmlyZVNsb3dseVdoZW5IZWxkQnV0dG9uIGZpcmVkJyApLFxuICAgIGJhc2VDb2xvcjogbmV3IENvbG9yKCAxNDcsIDkyLCAxMjAgKSxcbiAgICBlbmFibGVkUHJvcGVydHk6IGJ1dHRvbnNFbmFibGVkUHJvcGVydHksXG4gICAgZmlyZU9uSG9sZDogdHJ1ZSxcbiAgICBmaXJlT25Ib2xkRGVsYXk6IDYwMCxcbiAgICBmaXJlT25Ib2xkSW50ZXJ2YWw6IDMwMCxcbiAgICB0b3A6IGZpcmVRdWlja2x5V2hlbkhlbGRCdXR0b24uYm90dG9tICsgMTBcbiAgfSApO1xuXG4gIGNvbnN0IGhlbGRCdXR0b25zQm94ID0gbmV3IFZCb3goIHtcbiAgICBjaGlsZHJlbjogWyBmaXJlUXVpY2tseVdoZW5IZWxkQnV0dG9uLCBmaXJlU2xvd2x5V2hlbkhlbGRCdXR0b24gXSxcbiAgICBzcGFjaW5nOiAxMCxcbiAgICBhbGlnbjogJ2xlZnQnXG4gIH0gKTtcblxuICBjb25zdCB1cHBlckxlZnRBbGlnblRleHROb2RlID0gbmV3IFRleHQoICd1cHBlciBsZWZ0IGFsaWduIHRlc3QnLCB7IGZvbnQ6IEJVVFRPTl9GT05UIH0gKTtcbiAgY29uc3QgdXBwZXJMZWZ0Q29udGVudEJ1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcbiAgICBjb250ZW50OiB1cHBlckxlZnRBbGlnblRleHROb2RlLFxuICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ3VwcGVyTGVmdENvbnRlbnRCdXR0b24gZmlyZWQnICksXG4gICAgZW5hYmxlZFByb3BlcnR5OiBidXR0b25zRW5hYmxlZFByb3BlcnR5LFxuICAgIHhBbGlnbjogJ2xlZnQnLFxuICAgIHlBbGlnbjogJ3RvcCcsXG4gICAgbWluV2lkdGg6IHVwcGVyTGVmdEFsaWduVGV4dE5vZGUud2lkdGggKiAxLjUsXG4gICAgbWluSGVpZ2h0OiB1cHBlckxlZnRBbGlnblRleHROb2RlLmhlaWdodCAqIDJcbiAgfSApO1xuXG4gIGNvbnN0IGxvd2VyUmlnaHRBbGlnblRleHROb2RlID0gbmV3IFRleHQoICdsb3dlciByaWdodCBhbGlnbiB0ZXN0JywgeyBmb250OiBCVVRUT05fRk9OVCB9ICk7XG4gIGNvbnN0IGxvd2VyUmlnaHRDb250ZW50QnV0dG9uID0gbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xuICAgIGNvbnRlbnQ6IGxvd2VyUmlnaHRBbGlnblRleHROb2RlLFxuICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ2xvd2VyUmlnaHRDb250ZW50QnV0dG9uIGZpcmVkJyApLFxuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSxcbiAgICB4QWxpZ246ICdyaWdodCcsXG4gICAgeUFsaWduOiAnYm90dG9tJyxcbiAgICBtaW5XaWR0aDogbG93ZXJSaWdodEFsaWduVGV4dE5vZGUud2lkdGggKiAxLjUsXG4gICAgbWluSGVpZ2h0OiBsb3dlclJpZ2h0QWxpZ25UZXh0Tm9kZS5oZWlnaHQgKiAyLFxuICAgIHRvcDogdXBwZXJMZWZ0Q29udGVudEJ1dHRvbi5oZWlnaHQgKyAxMFxuICB9ICk7XG5cbiAgY29uc3QgYWxpZ25UZXh0QnV0dG9uc0JveCA9IG5ldyBWQm94KCB7XG4gICAgY2hpbGRyZW46IFsgdXBwZXJMZWZ0Q29udGVudEJ1dHRvbiwgbG93ZXJSaWdodENvbnRlbnRCdXR0b24gXSxcbiAgICBzcGFjaW5nOiAxMCxcbiAgICBhbGlnbjogJ2xlZnQnXG4gIH0gKTtcblxuICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIE1pc2NlbGxhbmVvdXMgb3RoZXIgYnV0dG9uIGV4YW1wbGVzXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBjb25zdCBmaXJlT25Eb3duQnV0dG9uID0gbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xuICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCAnRmlyZSBvbiBEb3duJywgeyBmb250OiBCVVRUT05fRk9OVCB9ICksXG4gICAgbGlzdGVuZXI6ICgpID0+IGNvbnNvbGUubG9nKCAnZmlyZU9uRG93bkJ1dHRvbiBmaXJlZCcgKSxcbiAgICBiYXNlQ29sb3I6IG5ldyBDb2xvciggMjU1LCAyNTUsIDYxICksXG4gICAgZW5hYmxlZFByb3BlcnR5OiBidXR0b25zRW5hYmxlZFByb3BlcnR5LFxuICAgIGZpcmVPbkRvd246IHRydWUsXG4gICAgc3Ryb2tlOiAnYmxhY2snLFxuICAgIGxpbmVXaWR0aDogMVxuICB9ICk7XG5cbiAgLy8gdHJhbnNwYXJlbnQgYnV0dG9uIHdpdGggc29tZXRoaW5nIGJlaGluZCBpdFxuICBjb25zdCByZWN0YW5nbGVOb2RlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMjUsIDEwMCwgeyBmaWxsOiAncmVkJyB9ICk7XG4gIGNvbnN0IHRyYW5zcGFyZW50QWxwaGFCdXR0b24gPSBuZXcgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uKCB7XG4gICAgY29udGVudDogbmV3IFRleHQoICdUcmFuc3BhcmVudCBCdXR0b24gdmlhIGFscGhhJywgeyBmb250OiBCVVRUT05fRk9OVCB9ICksXG4gICAgbGlzdGVuZXI6ICgpID0+IGNvbnNvbGUubG9nKCAndHJhbnNwYXJlbnRBbHBoYUJ1dHRvbiBmaXJlZCcgKSxcbiAgICBiYXNlQ29sb3I6IG5ldyBDb2xvciggMjU1LCAyNTUsIDAsIDAuNyApLFxuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSxcbiAgICBjZW50ZXJYOiByZWN0YW5nbGVOb2RlLmNlbnRlclgsXG4gICAgdG9wOiByZWN0YW5nbGVOb2RlLnRvcCArIDEwXG4gIH0gKTtcbiAgY29uc3QgdHJhbnNwYXJlbnRPcGFjaXR5QnV0dG9uID0gbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xuICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCAnVHJhbnNwYXJlbnQgQnV0dG9uIHZpYSBvcGFjaXR5JywgeyBmb250OiBCVVRUT05fRk9OVCB9ICksXG4gICAgbGlzdGVuZXI6ICgpID0+IGNvbnNvbGUubG9nKCAndHJhbnNwYXJlbnRPcGFjaXR5QnV0dG9uIGZpcmVkJyApLFxuICAgIGJhc2VDb2xvcjogbmV3IENvbG9yKCAyNTUsIDI1NSwgMCApLFxuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSxcbiAgICBvcGFjaXR5OiAwLjYsXG4gICAgY2VudGVyWDogcmVjdGFuZ2xlTm9kZS5jZW50ZXJYLFxuICAgIGJvdHRvbTogcmVjdGFuZ2xlTm9kZS5ib3R0b20gLSAxMFxuICB9ICk7XG4gIGNvbnN0IHRyYW5zcGFyZW50UGFyZW50ID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgcmVjdGFuZ2xlTm9kZSwgdHJhbnNwYXJlbnRBbHBoYUJ1dHRvbiwgdHJhbnNwYXJlbnRPcGFjaXR5QnV0dG9uIF0gfSApO1xuXG4gIGNvbnN0IGFycm93QnV0dG9uID0gbmV3IEFycm93QnV0dG9uKCAnbGVmdCcsICgpID0+IGNvbnNvbGUubG9nKCAnYXJyb3dCdXR0b24gZmlyZWQnICksIHtcbiAgICBlbmFibGVkUHJvcGVydHk6IGJ1dHRvbnNFbmFibGVkUHJvcGVydHlcbiAgfSApO1xuXG4gIGNvbnN0IGNhcm91c2VsQnV0dG9uID0gbmV3IENhcm91c2VsQnV0dG9uKCB7XG4gICAgbGlzdGVuZXI6ICgpID0+IGNvbnNvbGUubG9nKCAnY2Fyb3VzZWxCdXR0b24gZmlyZWQnICksXG4gICAgZW5hYmxlZFByb3BlcnR5OiBidXR0b25zRW5hYmxlZFByb3BlcnR5XG4gIH0gKTtcblxuICBjb25zdCBtaXNjQnV0dG9uc0JveCA9IG5ldyBIQm94KCB7XG4gICAgY2hpbGRyZW46IFsgZmlyZU9uRG93bkJ1dHRvbiwgdHJhbnNwYXJlbnRQYXJlbnQsIGFycm93QnV0dG9uLCBjYXJvdXNlbEJ1dHRvbiBdLFxuICAgIHNwYWNpbmc6IDE1XG4gIH0gKTtcblxuICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFRlc3QgdGhlIDIgd2F5cyBvZiBzcGVjaWZ5aW5nIGEgYnV0dG9uJ3Mgc2l6ZTpcbiAgLy8gKDEpIElmIHlvdSBwcm92aWRlIHNpemUgb2YgdGhlIGJ1dHRvbiwgY29udGVudCBpcyBzaXplZCB0byBmaXQgdGhlIGJ1dHRvbi5cbiAgLy8gKDIpIElmIHlvdSBkb24ndCBwcm92aWRlIHNpemUsIHRoZSBidXR0b24gaXMgc2l6ZWQgdG8gZml0IHRoZSBjb250ZW50LlxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvNjU3XG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAvLyBUaGlzIGJ1dHRvbidzIHN0cm9rZSB3aWxsIGxvb2sgdGhpY2tlciwgYmVjYXVzZSBjb250ZW50IHdpbGwgYmUgc2NhbGVkIHVwLlxuICBjb25zdCByb3VuZEJ1dHRvbldpdGhFeHBsaWNpdFNpemUgPSBuZXcgUm91bmRQdXNoQnV0dG9uKCB7XG4gICAgZW5hYmxlZFByb3BlcnR5OiBidXR0b25zRW5hYmxlZFByb3BlcnR5LFxuICAgIHJhZGl1czogMjUsXG4gICAgY29udGVudDogbmV3IENpcmNsZSggNSwgeyBmaWxsOiAncmVkJywgc3Ryb2tlOiAnYmxhY2snIH0gKSxcbiAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICdyb3VuZEJ1dHRvbldpdGhFeHBsaWNpdFNpemUgcHJlc3NlZCcgKSxcbiAgICB4TWFyZ2luOiA1LFxuICAgIHlNYXJnaW46IDVcbiAgfSApO1xuXG4gIC8vIFRoaXMgYnV0dG9uJ3MgY29udGVudCB3aWxsIGxvb2sgYXMgc3BlY2lmaWVkLCBiZWNhdXNlIGJ1dHRvbiBpcyBzaXplZCB0byBmaXQgdGhlIGNvbnRlbnQuXG4gIGNvbnN0IHJvdW5kQnV0dG9uV2l0aERlcml2ZWRTaXplID0gbmV3IFJvdW5kUHVzaEJ1dHRvbigge1xuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSxcbiAgICBjb250ZW50OiBuZXcgQ2lyY2xlKCAyMCwgeyBmaWxsOiAncmVkJywgc3Ryb2tlOiAnYmxhY2snIH0gKSxcbiAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICdyb3VuZEJ1dHRvbldpdGhEZXJpdmVkU2l6ZSBwcmVzc2VkJyApLFxuICAgIHhNYXJnaW46IDUsXG4gICAgeU1hcmdpbjogNVxuICB9ICk7XG5cbiAgLy8gVGhlIHRvdGFsIHNpemUgb2YgdGhpcyBvbmUsIHNob3VsZCBiZSB0aGUgc2FtZSBhcyB0aGUgY29udGVudCBvZiB0aGUgb25lIGJlbG93LiBUaGlzIGJ1dHRvbidzIHN0cm9rZSB3aWxsIGxvb2tcbiAgLy8gdGhpY2tlciwgYmVjYXVzZSBjb250ZW50IHdpbGwgYmUgc2NhbGVkIHVwLlxuICBjb25zdCByZWN0YW5ndWxhckJ1dHRvbldpdGhFeHBsaWNpdFNpemUgPSBuZXcgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uKCB7XG4gICAgZW5hYmxlZFByb3BlcnR5OiBidXR0b25zRW5hYmxlZFByb3BlcnR5LFxuICAgIHNpemU6IG5ldyBEaW1lbnNpb24yKCA0MCwgMjUgKSxcbiAgICBjb250ZW50OiBuZXcgUmVjdGFuZ2xlKCAwLCAwLCA1LCAzLCB7IGZpbGw6ICdyZWQnLCBzdHJva2U6ICdibGFjaycgfSApLFxuICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ3JlY3Rhbmd1bGFyQnV0dG9uV2l0aEV4cGxpY2l0U2l6ZSBwcmVzc2VkJyApLFxuICAgIHhNYXJnaW46IDUsXG4gICAgeU1hcmdpbjogNVxuICB9ICk7XG5cbiAgLy8gVGhpcyBidXR0b24ncyBjb250ZW50IHdpbGwgbG9vayBhcyBzcGVjaWZpZWQsIGJlY2F1c2UgYnV0dG9uIGlzIHNpemVkIHRvIGZpdCBhcm91bmQgdGhlIGNvbnRlbnQuXG4gIGNvbnN0IHJlY3Rhbmd1bGFyQnV0dG9uV2l0aERlcml2ZWRTaXplID0gbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSxcbiAgICBjb250ZW50OiBuZXcgUmVjdGFuZ2xlKCAwLCAwLCA0MCwgMjUsIHsgZmlsbDogJ2JsdWUnLCBzdHJva2U6ICdibGFjaycgfSApLFxuICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ3JlY3Rhbmd1bGFyQnV0dG9uV2l0aERlcml2ZWRTaXplIHByZXNzZWQnICksXG4gICAgeE1hcmdpbjogNSxcbiAgICB5TWFyZ2luOiA1XG4gIH0gKTtcblxuICBjb25zdCBidXR0b25TaXplRGVtb3MgPSBuZXcgSEJveCgge1xuICAgIHNwYWNpbmc6IDIwLFxuICAgIGNoaWxkcmVuOiBbIHJlY3Rhbmd1bGFyQnV0dG9uV2l0aEV4cGxpY2l0U2l6ZSxcbiAgICAgIHJlY3Rhbmd1bGFyQnV0dG9uV2l0aERlcml2ZWRTaXplLFxuICAgICAgcm91bmRCdXR0b25XaXRoRXhwbGljaXRTaXplLFxuICAgICAgcm91bmRCdXR0b25XaXRoRGVyaXZlZFNpemVcbiAgICBdXG4gIH0gKTtcblxuICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIERlbW9uc3RyYXRlIGR5bmFtaWMgY29sb3JzIGZvciBzb21lIGJ1dHRvbnNcbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIC8vIENoYW5nZSBjb2xvcnMgb2YgYWxsIGJ1dHRvbnMgaW4gcHNldWRvM0RCdXR0b25zQm94XG4gIGNvbnN0IGNoYW5nZUJ1dHRvbkNvbG9yc0J1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcbiAgICBlbmFibGVkUHJvcGVydHk6IGJ1dHRvbnNFbmFibGVkUHJvcGVydHksXG4gICAgY29udGVudDogbmV3IFRleHQoICdcXHUyMWU2IENoYW5nZSBidXR0b24gY29sb3JzJywgeyBmb250OiBCVVRUT05fRk9OVCB9ICksXG4gICAgbGlzdGVuZXI6ICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCAnY2hhbmdlQnV0dG9uQ29sb3JzQnV0dG9uIGZpcmVkJyApO1xuICAgICAgcHNldWRvM0RCdXR0b25zQm94LmNoaWxkcmVuLmZvckVhY2goIGNoaWxkID0+IHtcbiAgICAgICAgaWYgKCBjaGlsZCBpbnN0YW5jZW9mIEJ1dHRvbk5vZGUgKSB7XG4gICAgICAgICAgY2hpbGQuYmFzZUNvbG9yID0gbmV3IENvbG9yKFxuICAgICAgICAgICAgZG90UmFuZG9tLm5leHREb3VibGVCZXR3ZWVuKCAwLCAyNTUgKSxcbiAgICAgICAgICAgIGRvdFJhbmRvbS5uZXh0RG91YmxlQmV0d2VlbiggMCwgMjU1ICksXG4gICAgICAgICAgICBkb3RSYW5kb20ubmV4dERvdWJsZUJldHdlZW4oIDAsIDI1NSApXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH1cbiAgfSApO1xuXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gTGF5b3V0XG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBjb25zdCB4U3BhY2luZyA9IDUwO1xuICByZXR1cm4gbmV3IFZCb3goIHtcbiAgICBzcGFjaW5nOiAxNSxcbiAgICBjaGlsZHJlbjogW1xuICAgICAgbmV3IEhCb3goIHsgc3BhY2luZzogeFNwYWNpbmcsIGNoaWxkcmVuOiBbIHBzZXVkbzNEQnV0dG9uc0JveCwgY2hhbmdlQnV0dG9uQ29sb3JzQnV0dG9uIF0gfSApLFxuICAgICAgbmV3IEhCb3goIHsgc3BhY2luZzogeFNwYWNpbmcsIGNoaWxkcmVuOiBbIGZsYXRCdXR0b25zQm94LCBhY3Rpb25CdXR0b25zQm94IF0gfSApLFxuICAgICAgbmV3IEhCb3goIHsgc3BhY2luZzogeFNwYWNpbmcsIGNoaWxkcmVuOiBbIGhlbGRCdXR0b25zQm94LCBhbGlnblRleHRCdXR0b25zQm94IF0gfSApLFxuICAgICAgbWlzY0J1dHRvbnNCb3gsXG4gICAgICBidXR0b25TaXplRGVtb3MsXG4gICAgICBuZXcgVlN0cnV0KCAyNSApLFxuICAgICAgYnV0dG9uc0VuYWJsZWRDaGVja2JveFxuICAgIF0sXG4gICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyXG4gIH0gKTtcbn0iXSwibmFtZXMiOlsiUHJvcGVydHkiLCJEaW1lbnNpb24yIiwiZG90UmFuZG9tIiwiQ2lyY2xlIiwiQ29sb3IiLCJGb250IiwiSEJveCIsIk5vZGUiLCJSZWN0YW5nbGUiLCJUZXh0IiwiVkJveCIsIlZTdHJ1dCIsIkFycm93QnV0dG9uIiwiQnV0dG9uTm9kZSIsIkNhcm91c2VsQnV0dG9uIiwiUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIiwiUm91bmRQdXNoQnV0dG9uIiwiQ2hlY2tib3giLCJCVVRUT05fRk9OVCIsInNpemUiLCJkZW1vUHVzaEJ1dHRvbnMiLCJsYXlvdXRCb3VuZHMiLCJidXR0b25zRW5hYmxlZFByb3BlcnR5IiwiYnV0dG9uc0VuYWJsZWRDaGVja2JveCIsImZvbnQiLCJidXR0b25BIiwiY29udGVudCIsImxpc3RlbmVyIiwiY29uc29sZSIsImxvZyIsImVuYWJsZWRQcm9wZXJ0eSIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsIm1vdXNlQXJlYVhEaWxhdGlvbiIsIm1vdXNlQXJlYVlEaWxhdGlvbiIsImJ1dHRvbkIiLCJiYXNlQ29sb3IiLCJidXR0b25DIiwiYnV0dG9uRCIsInJhZGl1cyIsImxpbmVXaWR0aCIsImJ1dHRvbkUiLCJ0b3VjaEFyZWFYU2hpZnQiLCJ0b3VjaEFyZWFZU2hpZnQiLCJtb3VzZUFyZWFYU2hpZnQiLCJtb3VzZUFyZWFZU2hpZnQiLCJidXR0b25GIiwiZmlsbCIsInhNYXJnaW4iLCJ5TWFyZ2luIiwieENvbnRlbnRPZmZzZXQiLCJ5Q29udGVudE9mZnNldCIsImN1c3RvbUNvcm5lcnNCdXR0b24iLCJsZWZ0VG9wQ29ybmVyUmFkaXVzIiwicmlnaHRUb3BDb3JuZXJSYWRpdXMiLCJyaWdodEJvdHRvbUNvcm5lclJhZGl1cyIsImxlZnRCb3R0b21Db3JuZXJSYWRpdXMiLCJwc2V1ZG8zREJ1dHRvbnNCb3giLCJjaGlsZHJlbiIsInNwYWNpbmciLCJidXR0b24xIiwiYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5IiwiRmxhdEFwcGVhcmFuY2VTdHJhdGVneSIsImJ1dHRvbjIiLCJzdHJva2UiLCJidXR0b24zIiwiYnV0dG9uNCIsImZsYXRCdXR0b25zQm94IiwiZmlyZUJ1dHRvbiIsImdvQnV0dG9uIiwiaGVscEJ1dHRvbiIsImFjdGlvbkJ1dHRvbnNCb3giLCJmaXJlUXVpY2tseVdoZW5IZWxkQnV0dG9uIiwiZmlyZU9uSG9sZCIsImZpcmVPbkhvbGREZWxheSIsImZpcmVPbkhvbGRJbnRlcnZhbCIsImZpcmVTbG93bHlXaGVuSGVsZEJ1dHRvbiIsInRvcCIsImJvdHRvbSIsImhlbGRCdXR0b25zQm94IiwiYWxpZ24iLCJ1cHBlckxlZnRBbGlnblRleHROb2RlIiwidXBwZXJMZWZ0Q29udGVudEJ1dHRvbiIsInhBbGlnbiIsInlBbGlnbiIsIm1pbldpZHRoIiwid2lkdGgiLCJtaW5IZWlnaHQiLCJoZWlnaHQiLCJsb3dlclJpZ2h0QWxpZ25UZXh0Tm9kZSIsImxvd2VyUmlnaHRDb250ZW50QnV0dG9uIiwiYWxpZ25UZXh0QnV0dG9uc0JveCIsImZpcmVPbkRvd25CdXR0b24iLCJmaXJlT25Eb3duIiwicmVjdGFuZ2xlTm9kZSIsInRyYW5zcGFyZW50QWxwaGFCdXR0b24iLCJjZW50ZXJYIiwidHJhbnNwYXJlbnRPcGFjaXR5QnV0dG9uIiwib3BhY2l0eSIsInRyYW5zcGFyZW50UGFyZW50IiwiYXJyb3dCdXR0b24iLCJjYXJvdXNlbEJ1dHRvbiIsIm1pc2NCdXR0b25zQm94Iiwicm91bmRCdXR0b25XaXRoRXhwbGljaXRTaXplIiwicm91bmRCdXR0b25XaXRoRGVyaXZlZFNpemUiLCJyZWN0YW5ndWxhckJ1dHRvbldpdGhFeHBsaWNpdFNpemUiLCJyZWN0YW5ndWxhckJ1dHRvbldpdGhEZXJpdmVkU2l6ZSIsImJ1dHRvblNpemVEZW1vcyIsImNoYW5nZUJ1dHRvbkNvbG9yc0J1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