// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for ProbeNode
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import { Shape } from '../../../../kite/js/imports.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import { Color, Node, Path, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import Panel from '../../../../sun/js/Panel.js';
import NumberControl from '../../NumberControl.js';
import PhetFont from '../../PhetFont.js';
import ProbeNode from '../../ProbeNode.js';
export default function demoProbeNode(layoutBounds) {
    const demoParent = new Node();
    // Layer for the light sensor node.  The node will be destroyed and re-created when its parameters change
    const probeNodeLayer = new Node();
    demoParent.addChild(probeNodeLayer);
    // Properties that describe the probe's options
    const colorProperty = new Property(ProbeNode.DEFAULT_PROBE_NODE_OPTIONS.color);
    const radiusProperty = new Property(ProbeNode.DEFAULT_PROBE_NODE_OPTIONS.radius);
    const innerRadiusProperty = new Property(ProbeNode.DEFAULT_PROBE_NODE_OPTIONS.innerRadius);
    const handleWidthProperty = new Property(ProbeNode.DEFAULT_PROBE_NODE_OPTIONS.handleWidth);
    const handleHeightProperty = new Property(ProbeNode.DEFAULT_PROBE_NODE_OPTIONS.handleHeight);
    const handleCornerRadiusProperty = new Property(ProbeNode.DEFAULT_PROBE_NODE_OPTIONS.handleCornerRadius);
    const lightAngleProperty = new Property(ProbeNode.DEFAULT_PROBE_NODE_OPTIONS.lightAngle);
    const sensorTypeFunctionProperty = new Property(ProbeNode.DEFAULT_PROBE_NODE_OPTIONS.sensorTypeFunction);
    // RGB color components, for setting the sensor color
    const color = Color.toColor(colorProperty.value);
    const redProperty = new Property(color.red);
    const greenProperty = new Property(color.green);
    const blueProperty = new Property(color.blue);
    Multilink.multilink([
        redProperty,
        greenProperty,
        blueProperty
    ], (r, g, b)=>{
        colorProperty.value = new Color(r, g, b);
    });
    // Controls for the sensor type (glass/crosshairs/empty/etc)
    const radioButtonGroup = new RectangularRadioButtonGroup(sensorTypeFunctionProperty, [
        {
            value: null,
            createNode: ()=>new Text('null')
        },
        {
            value: sensorTypeFunctionProperty.value,
            createNode: ()=>new Text('default glass')
        },
        {
            value: ProbeNode.crosshairs(),
            createNode: ()=>new Text('default crosshairs')
        },
        {
            value: ProbeNode.glass({
                centerColor: 'red',
                middleColor: 'green',
                edgeColor: 'blue'
            }),
            createNode: ()=>new Text('custom glass')
        }
    ], {
        right: layoutBounds.maxX - 5,
        top: layoutBounds.minY + 5,
        orientation: 'horizontal',
        spacing: 5,
        radioButtonOptions: {
            baseColor: 'white'
        }
    });
    demoParent.addChild(radioButtonGroup);
    // When the model properties change, update the sensor node
    Multilink.multilink([
        colorProperty,
        radiusProperty,
        innerRadiusProperty,
        handleWidthProperty,
        handleHeightProperty,
        handleCornerRadiusProperty,
        lightAngleProperty,
        sensorTypeFunctionProperty
    ], ()=>{
        probeNodeLayer.removeAllChildren();
        probeNodeLayer.addChild(new ProbeNode({
            // ProbeNode options
            color: colorProperty.value,
            radius: radiusProperty.value,
            innerRadius: innerRadiusProperty.value,
            handleWidth: handleWidthProperty.value,
            handleHeight: handleHeightProperty.value,
            handleCornerRadius: handleCornerRadiusProperty.value,
            lightAngle: lightAngleProperty.value,
            sensorTypeFunction: sensorTypeFunctionProperty.value,
            // layout options
            x: layoutBounds.centerX,
            y: layoutBounds.centerY
        }));
    });
    // Show a cross hairs in the middle of the screen so that we can verify that the sensor's origin is correct.
    const crossHairsRadius = 150;
    demoParent.addChild(new Path(new Shape().moveTo(layoutBounds.centerX - crossHairsRadius, layoutBounds.centerY).lineTo(layoutBounds.centerX + crossHairsRadius, layoutBounds.centerY).moveTo(layoutBounds.centerX, layoutBounds.centerY - crossHairsRadius).lineTo(layoutBounds.centerX, layoutBounds.centerY + crossHairsRadius), {
        stroke: 'black',
        lineWidth: 0.5
    }));
    // Geometry controls
    const numberControlOptions = {
        titleNodeOptions: {
            font: new PhetFont(14)
        },
        numberDisplayOptions: {
            textOptions: {
                font: new PhetFont(14)
            }
        },
        sliderOptions: {
            trackSize: new Dimension2(150, 3)
        }
    };
    demoParent.addChild(new VBox({
        resize: false,
        spacing: 15,
        children: [
            NumberControl.withMinMaxTicks('Radius:', radiusProperty, new Range(1, ProbeNode.DEFAULT_PROBE_NODE_OPTIONS.radius * 2), numberControlOptions),
            NumberControl.withMinMaxTicks('Inner Radius:', innerRadiusProperty, new Range(1, ProbeNode.DEFAULT_PROBE_NODE_OPTIONS.innerRadius * 2), numberControlOptions),
            NumberControl.withMinMaxTicks('Handle Width:', handleWidthProperty, new Range(1, ProbeNode.DEFAULT_PROBE_NODE_OPTIONS.handleWidth * 2), numberControlOptions),
            NumberControl.withMinMaxTicks('Handle Height:', handleHeightProperty, new Range(1, ProbeNode.DEFAULT_PROBE_NODE_OPTIONS.handleHeight * 2), numberControlOptions),
            NumberControl.withMinMaxTicks('Handle Corner Radius:', handleCornerRadiusProperty, new Range(1, ProbeNode.DEFAULT_PROBE_NODE_OPTIONS.handleCornerRadius * 2), numberControlOptions)
        ],
        left: layoutBounds.left + 50,
        centerY: layoutBounds.centerY
    }));
    // Color controls
    const colorComponentRange = new Range(0, 255);
    const colorPanel = new Panel(new VBox({
        spacing: 15,
        children: [
            NumberControl.withMinMaxTicks('R:', redProperty, colorComponentRange, numberControlOptions),
            NumberControl.withMinMaxTicks('G:', greenProperty, colorComponentRange, numberControlOptions),
            NumberControl.withMinMaxTicks('B:', blueProperty, colorComponentRange, numberControlOptions)
        ]
    }));
    // Light angle control, sets the multiplier for Math.PI
    const tickLabelOptions = {
        font: new PhetFont(14)
    };
    const multiplierProperty = new Property(0);
    multiplierProperty.link((multiplier)=>{
        lightAngleProperty.value = multiplier * Math.PI;
    });
    // construct nested options object from base numberControlsOptions
    const lightAngleNumberControlOptions = combineOptions({
        delta: 0.05
    }, numberControlOptions);
    lightAngleNumberControlOptions.numberDisplayOptions = combineOptions({
        valuePattern: '{0} \u03c0',
        decimalPlaces: 2
    }, numberControlOptions.numberDisplayOptions);
    lightAngleNumberControlOptions.sliderOptions = combineOptions({
        majorTicks: [
            {
                value: 0,
                label: new Text('0', tickLabelOptions)
            },
            {
                value: 1,
                label: new Text('\u03c0', tickLabelOptions)
            },
            {
                value: 2,
                label: new Text('2\u03c0', tickLabelOptions)
            }
        ]
    }, numberControlOptions.sliderOptions);
    const lightAngleControl = new NumberControl('Light Angle:', multiplierProperty, new Range(0, 2), lightAngleNumberControlOptions);
    // Control at right side of play area
    demoParent.addChild(new VBox({
        resize: false,
        spacing: 15,
        children: [
            colorPanel,
            lightAngleControl
        ],
        right: layoutBounds.right - 50,
        centerY: layoutBounds.centerY
    }));
    return demoParent;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb1Byb2JlTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZW1vIGZvciBQcm9iZU5vZGVcbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHsgQ29sb3IsIE5vZGUsIFBhdGgsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IFJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAuanMnO1xuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XG5pbXBvcnQgTnVtYmVyQ29udHJvbCwgeyBOdW1iZXJDb250cm9sT3B0aW9ucywgTnVtYmVyQ29udHJvbFNsaWRlck9wdGlvbnMgfSBmcm9tICcuLi8uLi9OdW1iZXJDb250cm9sLmpzJztcbmltcG9ydCB7IE51bWJlckRpc3BsYXlPcHRpb25zIH0gZnJvbSAnLi4vLi4vTnVtYmVyRGlzcGxheS5qcyc7XG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vUGhldEZvbnQuanMnO1xuaW1wb3J0IFByb2JlTm9kZSBmcm9tICcuLi8uLi9Qcm9iZU5vZGUuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZW1vUHJvYmVOb2RlKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XG5cbiAgY29uc3QgZGVtb1BhcmVudCA9IG5ldyBOb2RlKCk7XG5cbiAgLy8gTGF5ZXIgZm9yIHRoZSBsaWdodCBzZW5zb3Igbm9kZS4gIFRoZSBub2RlIHdpbGwgYmUgZGVzdHJveWVkIGFuZCByZS1jcmVhdGVkIHdoZW4gaXRzIHBhcmFtZXRlcnMgY2hhbmdlXG4gIGNvbnN0IHByb2JlTm9kZUxheWVyID0gbmV3IE5vZGUoKTtcbiAgZGVtb1BhcmVudC5hZGRDaGlsZCggcHJvYmVOb2RlTGF5ZXIgKTtcblxuICAvLyBQcm9wZXJ0aWVzIHRoYXQgZGVzY3JpYmUgdGhlIHByb2JlJ3Mgb3B0aW9uc1xuICBjb25zdCBjb2xvclByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBQcm9iZU5vZGUuREVGQVVMVF9QUk9CRV9OT0RFX09QVElPTlMuY29sb3IgKTtcbiAgY29uc3QgcmFkaXVzUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIFByb2JlTm9kZS5ERUZBVUxUX1BST0JFX05PREVfT1BUSU9OUy5yYWRpdXMgKTtcbiAgY29uc3QgaW5uZXJSYWRpdXNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggUHJvYmVOb2RlLkRFRkFVTFRfUFJPQkVfTk9ERV9PUFRJT05TLmlubmVyUmFkaXVzICk7XG4gIGNvbnN0IGhhbmRsZVdpZHRoUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIFByb2JlTm9kZS5ERUZBVUxUX1BST0JFX05PREVfT1BUSU9OUy5oYW5kbGVXaWR0aCApO1xuICBjb25zdCBoYW5kbGVIZWlnaHRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggUHJvYmVOb2RlLkRFRkFVTFRfUFJPQkVfTk9ERV9PUFRJT05TLmhhbmRsZUhlaWdodCApO1xuICBjb25zdCBoYW5kbGVDb3JuZXJSYWRpdXNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggUHJvYmVOb2RlLkRFRkFVTFRfUFJPQkVfTk9ERV9PUFRJT05TLmhhbmRsZUNvcm5lclJhZGl1cyApO1xuICBjb25zdCBsaWdodEFuZ2xlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIFByb2JlTm9kZS5ERUZBVUxUX1BST0JFX05PREVfT1BUSU9OUy5saWdodEFuZ2xlICk7XG4gIGNvbnN0IHNlbnNvclR5cGVGdW5jdGlvblByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBQcm9iZU5vZGUuREVGQVVMVF9QUk9CRV9OT0RFX09QVElPTlMuc2Vuc29yVHlwZUZ1bmN0aW9uICk7XG5cbiAgLy8gUkdCIGNvbG9yIGNvbXBvbmVudHMsIGZvciBzZXR0aW5nIHRoZSBzZW5zb3IgY29sb3JcbiAgY29uc3QgY29sb3IgPSBDb2xvci50b0NvbG9yKCBjb2xvclByb3BlcnR5LnZhbHVlICk7XG4gIGNvbnN0IHJlZFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBjb2xvci5yZWQgKTtcbiAgY29uc3QgZ3JlZW5Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggY29sb3IuZ3JlZW4gKTtcbiAgY29uc3QgYmx1ZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBjb2xvci5ibHVlICk7XG4gIE11bHRpbGluay5tdWx0aWxpbmsoIFsgcmVkUHJvcGVydHksIGdyZWVuUHJvcGVydHksIGJsdWVQcm9wZXJ0eSBdLFxuICAgICggciwgZywgYiApID0+IHtcbiAgICAgIGNvbG9yUHJvcGVydHkudmFsdWUgPSBuZXcgQ29sb3IoIHIsIGcsIGIgKTtcbiAgICB9ICk7XG5cbiAgLy8gQ29udHJvbHMgZm9yIHRoZSBzZW5zb3IgdHlwZSAoZ2xhc3MvY3Jvc3NoYWlycy9lbXB0eS9ldGMpXG4gIGNvbnN0IHJhZGlvQnV0dG9uR3JvdXAgPSBuZXcgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwKCBzZW5zb3JUeXBlRnVuY3Rpb25Qcm9wZXJ0eSwgW1xuICAgIHsgdmFsdWU6IG51bGwsIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBUZXh0KCAnbnVsbCcgKSB9LFxuICAgIHsgdmFsdWU6IHNlbnNvclR5cGVGdW5jdGlvblByb3BlcnR5LnZhbHVlLCBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgVGV4dCggJ2RlZmF1bHQgZ2xhc3MnICkgfSxcbiAgICB7IHZhbHVlOiBQcm9iZU5vZGUuY3Jvc3NoYWlycygpLCBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgVGV4dCggJ2RlZmF1bHQgY3Jvc3NoYWlycycgKSB9LFxuICAgIHtcbiAgICAgIHZhbHVlOiBQcm9iZU5vZGUuZ2xhc3MoIHtcbiAgICAgICAgY2VudGVyQ29sb3I6ICdyZWQnLFxuICAgICAgICBtaWRkbGVDb2xvcjogJ2dyZWVuJyxcbiAgICAgICAgZWRnZUNvbG9yOiAnYmx1ZSdcbiAgICAgIH0gKSwgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFRleHQoICdjdXN0b20gZ2xhc3MnIClcbiAgICB9XG4gIF0sIHtcbiAgICByaWdodDogbGF5b3V0Qm91bmRzLm1heFggLSA1LFxuICAgIHRvcDogbGF5b3V0Qm91bmRzLm1pblkgKyA1LFxuICAgIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcsXG4gICAgc3BhY2luZzogNSxcbiAgICByYWRpb0J1dHRvbk9wdGlvbnM6IHtcbiAgICAgIGJhc2VDb2xvcjogJ3doaXRlJ1xuICAgIH1cbiAgfSApO1xuICBkZW1vUGFyZW50LmFkZENoaWxkKCByYWRpb0J1dHRvbkdyb3VwICk7XG5cbiAgLy8gV2hlbiB0aGUgbW9kZWwgcHJvcGVydGllcyBjaGFuZ2UsIHVwZGF0ZSB0aGUgc2Vuc29yIG5vZGVcbiAgTXVsdGlsaW5rLm11bHRpbGluayggW1xuICAgICAgY29sb3JQcm9wZXJ0eSxcbiAgICAgIHJhZGl1c1Byb3BlcnR5LFxuICAgICAgaW5uZXJSYWRpdXNQcm9wZXJ0eSxcbiAgICAgIGhhbmRsZVdpZHRoUHJvcGVydHksXG4gICAgICBoYW5kbGVIZWlnaHRQcm9wZXJ0eSxcbiAgICAgIGhhbmRsZUNvcm5lclJhZGl1c1Byb3BlcnR5LFxuICAgICAgbGlnaHRBbmdsZVByb3BlcnR5LFxuICAgICAgc2Vuc29yVHlwZUZ1bmN0aW9uUHJvcGVydHlcbiAgICBdLFxuICAgICgpID0+IHtcbiAgICAgIHByb2JlTm9kZUxheWVyLnJlbW92ZUFsbENoaWxkcmVuKCk7XG4gICAgICBwcm9iZU5vZGVMYXllci5hZGRDaGlsZCggbmV3IFByb2JlTm9kZSgge1xuXG4gICAgICAgIC8vIFByb2JlTm9kZSBvcHRpb25zXG4gICAgICAgIGNvbG9yOiBjb2xvclByb3BlcnR5LnZhbHVlLFxuICAgICAgICByYWRpdXM6IHJhZGl1c1Byb3BlcnR5LnZhbHVlLFxuICAgICAgICBpbm5lclJhZGl1czogaW5uZXJSYWRpdXNQcm9wZXJ0eS52YWx1ZSxcbiAgICAgICAgaGFuZGxlV2lkdGg6IGhhbmRsZVdpZHRoUHJvcGVydHkudmFsdWUsXG4gICAgICAgIGhhbmRsZUhlaWdodDogaGFuZGxlSGVpZ2h0UHJvcGVydHkudmFsdWUsXG4gICAgICAgIGhhbmRsZUNvcm5lclJhZGl1czogaGFuZGxlQ29ybmVyUmFkaXVzUHJvcGVydHkudmFsdWUsXG4gICAgICAgIGxpZ2h0QW5nbGU6IGxpZ2h0QW5nbGVQcm9wZXJ0eS52YWx1ZSxcbiAgICAgICAgc2Vuc29yVHlwZUZ1bmN0aW9uOiBzZW5zb3JUeXBlRnVuY3Rpb25Qcm9wZXJ0eS52YWx1ZSxcblxuICAgICAgICAvLyBsYXlvdXQgb3B0aW9uc1xuICAgICAgICB4OiBsYXlvdXRCb3VuZHMuY2VudGVyWCxcbiAgICAgICAgeTogbGF5b3V0Qm91bmRzLmNlbnRlcllcbiAgICAgIH0gKSApO1xuICAgIH0gKTtcblxuICAvLyBTaG93IGEgY3Jvc3MgaGFpcnMgaW4gdGhlIG1pZGRsZSBvZiB0aGUgc2NyZWVuIHNvIHRoYXQgd2UgY2FuIHZlcmlmeSB0aGF0IHRoZSBzZW5zb3IncyBvcmlnaW4gaXMgY29ycmVjdC5cbiAgY29uc3QgY3Jvc3NIYWlyc1JhZGl1cyA9IDE1MDtcbiAgZGVtb1BhcmVudC5hZGRDaGlsZCggbmV3IFBhdGgoIG5ldyBTaGFwZSgpXG4gICAgLm1vdmVUbyggbGF5b3V0Qm91bmRzLmNlbnRlclggLSBjcm9zc0hhaXJzUmFkaXVzLCBsYXlvdXRCb3VuZHMuY2VudGVyWSApXG4gICAgLmxpbmVUbyggbGF5b3V0Qm91bmRzLmNlbnRlclggKyBjcm9zc0hhaXJzUmFkaXVzLCBsYXlvdXRCb3VuZHMuY2VudGVyWSApXG4gICAgLm1vdmVUbyggbGF5b3V0Qm91bmRzLmNlbnRlclgsIGxheW91dEJvdW5kcy5jZW50ZXJZIC0gY3Jvc3NIYWlyc1JhZGl1cyApXG4gICAgLmxpbmVUbyggbGF5b3V0Qm91bmRzLmNlbnRlclgsIGxheW91dEJvdW5kcy5jZW50ZXJZICsgY3Jvc3NIYWlyc1JhZGl1cyApLCB7XG4gICAgc3Ryb2tlOiAnYmxhY2snLFxuICAgIGxpbmVXaWR0aDogMC41XG4gIH0gKSApO1xuXG4gIC8vIEdlb21ldHJ5IGNvbnRyb2xzXG4gIGNvbnN0IG51bWJlckNvbnRyb2xPcHRpb25zOiBOdW1iZXJDb250cm9sT3B0aW9ucyA9IHtcbiAgICB0aXRsZU5vZGVPcHRpb25zOiB7XG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE0IClcbiAgICB9LFxuICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XG4gICAgICB0ZXh0T3B0aW9uczoge1xuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE0IClcbiAgICAgIH1cbiAgICB9LFxuICAgIHNsaWRlck9wdGlvbnM6IHtcbiAgICAgIHRyYWNrU2l6ZTogbmV3IERpbWVuc2lvbjIoIDE1MCwgMyApXG4gICAgfVxuICB9O1xuICBkZW1vUGFyZW50LmFkZENoaWxkKCBuZXcgVkJveCgge1xuICAgIHJlc2l6ZTogZmFsc2UsIC8vIERvbid0IHJlYWRqdXN0IHRoZSBzaXplIHdoZW4gdGhlIHNsaWRlciBrbm9iIG1vdmVzIGFsbCB0aGUgd2F5IHRvIHRoZSByaWdodFxuICAgIHNwYWNpbmc6IDE1LFxuICAgIGNoaWxkcmVuOiBbXG4gICAgICBOdW1iZXJDb250cm9sLndpdGhNaW5NYXhUaWNrcyggJ1JhZGl1czonLCByYWRpdXNQcm9wZXJ0eSxcbiAgICAgICAgbmV3IFJhbmdlKCAxLCBQcm9iZU5vZGUuREVGQVVMVF9QUk9CRV9OT0RFX09QVElPTlMucmFkaXVzICogMiApLCBudW1iZXJDb250cm9sT3B0aW9ucyApLFxuICAgICAgTnVtYmVyQ29udHJvbC53aXRoTWluTWF4VGlja3MoICdJbm5lciBSYWRpdXM6JywgaW5uZXJSYWRpdXNQcm9wZXJ0eSxcbiAgICAgICAgbmV3IFJhbmdlKCAxLCBQcm9iZU5vZGUuREVGQVVMVF9QUk9CRV9OT0RFX09QVElPTlMuaW5uZXJSYWRpdXMgKiAyICksIG51bWJlckNvbnRyb2xPcHRpb25zICksXG4gICAgICBOdW1iZXJDb250cm9sLndpdGhNaW5NYXhUaWNrcyggJ0hhbmRsZSBXaWR0aDonLCBoYW5kbGVXaWR0aFByb3BlcnR5LFxuICAgICAgICBuZXcgUmFuZ2UoIDEsIFByb2JlTm9kZS5ERUZBVUxUX1BST0JFX05PREVfT1BUSU9OUy5oYW5kbGVXaWR0aCAqIDIgKSwgbnVtYmVyQ29udHJvbE9wdGlvbnMgKSxcbiAgICAgIE51bWJlckNvbnRyb2wud2l0aE1pbk1heFRpY2tzKCAnSGFuZGxlIEhlaWdodDonLCBoYW5kbGVIZWlnaHRQcm9wZXJ0eSxcbiAgICAgICAgbmV3IFJhbmdlKCAxLCBQcm9iZU5vZGUuREVGQVVMVF9QUk9CRV9OT0RFX09QVElPTlMuaGFuZGxlSGVpZ2h0ICogMiApLCBudW1iZXJDb250cm9sT3B0aW9ucyApLFxuICAgICAgTnVtYmVyQ29udHJvbC53aXRoTWluTWF4VGlja3MoICdIYW5kbGUgQ29ybmVyIFJhZGl1czonLCBoYW5kbGVDb3JuZXJSYWRpdXNQcm9wZXJ0eSxcbiAgICAgICAgbmV3IFJhbmdlKCAxLCBQcm9iZU5vZGUuREVGQVVMVF9QUk9CRV9OT0RFX09QVElPTlMuaGFuZGxlQ29ybmVyUmFkaXVzICogMiApLCBudW1iZXJDb250cm9sT3B0aW9ucyApXG4gICAgXSxcbiAgICBsZWZ0OiBsYXlvdXRCb3VuZHMubGVmdCArIDUwLFxuICAgIGNlbnRlclk6IGxheW91dEJvdW5kcy5jZW50ZXJZXG4gIH0gKSApO1xuXG4gIC8vIENvbG9yIGNvbnRyb2xzXG4gIGNvbnN0IGNvbG9yQ29tcG9uZW50UmFuZ2UgPSBuZXcgUmFuZ2UoIDAsIDI1NSApO1xuICBjb25zdCBjb2xvclBhbmVsID0gbmV3IFBhbmVsKCBuZXcgVkJveCgge1xuICAgIHNwYWNpbmc6IDE1LFxuICAgIGNoaWxkcmVuOiBbXG4gICAgICBOdW1iZXJDb250cm9sLndpdGhNaW5NYXhUaWNrcyggJ1I6JywgcmVkUHJvcGVydHksIGNvbG9yQ29tcG9uZW50UmFuZ2UsIG51bWJlckNvbnRyb2xPcHRpb25zICksXG4gICAgICBOdW1iZXJDb250cm9sLndpdGhNaW5NYXhUaWNrcyggJ0c6JywgZ3JlZW5Qcm9wZXJ0eSwgY29sb3JDb21wb25lbnRSYW5nZSwgbnVtYmVyQ29udHJvbE9wdGlvbnMgKSxcbiAgICAgIE51bWJlckNvbnRyb2wud2l0aE1pbk1heFRpY2tzKCAnQjonLCBibHVlUHJvcGVydHksIGNvbG9yQ29tcG9uZW50UmFuZ2UsIG51bWJlckNvbnRyb2xPcHRpb25zIClcbiAgICBdXG4gIH0gKSApO1xuXG4gIC8vIExpZ2h0IGFuZ2xlIGNvbnRyb2wsIHNldHMgdGhlIG11bHRpcGxpZXIgZm9yIE1hdGguUElcbiAgY29uc3QgdGlja0xhYmVsT3B0aW9ucyA9IHsgZm9udDogbmV3IFBoZXRGb250KCAxNCApIH07XG4gIGNvbnN0IG11bHRpcGxpZXJQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMCApO1xuICBtdWx0aXBsaWVyUHJvcGVydHkubGluayggbXVsdGlwbGllciA9PiB7XG4gICAgbGlnaHRBbmdsZVByb3BlcnR5LnZhbHVlID0gKCBtdWx0aXBsaWVyICogTWF0aC5QSSApO1xuICB9ICk7XG5cbiAgLy8gY29uc3RydWN0IG5lc3RlZCBvcHRpb25zIG9iamVjdCBmcm9tIGJhc2UgbnVtYmVyQ29udHJvbHNPcHRpb25zXG4gIGNvbnN0IGxpZ2h0QW5nbGVOdW1iZXJDb250cm9sT3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPE51bWJlckNvbnRyb2xPcHRpb25zPigge1xuICAgIGRlbHRhOiAwLjA1XG4gIH0sIG51bWJlckNvbnRyb2xPcHRpb25zICk7XG5cbiAgbGlnaHRBbmdsZU51bWJlckNvbnRyb2xPcHRpb25zLm51bWJlckRpc3BsYXlPcHRpb25zID0gY29tYmluZU9wdGlvbnM8TnVtYmVyRGlzcGxheU9wdGlvbnM+KCB7XG4gICAgdmFsdWVQYXR0ZXJuOiAnezB9IFxcdTAzYzAnLFxuICAgIGRlY2ltYWxQbGFjZXM6IDJcbiAgfSwgbnVtYmVyQ29udHJvbE9wdGlvbnMubnVtYmVyRGlzcGxheU9wdGlvbnMgKTtcblxuICBsaWdodEFuZ2xlTnVtYmVyQ29udHJvbE9wdGlvbnMuc2xpZGVyT3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPE51bWJlckNvbnRyb2xTbGlkZXJPcHRpb25zPigge1xuICAgIG1ham9yVGlja3M6IFtcbiAgICAgIHsgdmFsdWU6IDAsIGxhYmVsOiBuZXcgVGV4dCggJzAnLCB0aWNrTGFiZWxPcHRpb25zICkgfSxcbiAgICAgIHsgdmFsdWU6IDEsIGxhYmVsOiBuZXcgVGV4dCggJ1xcdTAzYzAnLCB0aWNrTGFiZWxPcHRpb25zICkgfSxcbiAgICAgIHsgdmFsdWU6IDIsIGxhYmVsOiBuZXcgVGV4dCggJzJcXHUwM2MwJywgdGlja0xhYmVsT3B0aW9ucyApIH1cbiAgICBdXG4gIH0sIG51bWJlckNvbnRyb2xPcHRpb25zLnNsaWRlck9wdGlvbnMgKTtcblxuICBjb25zdCBsaWdodEFuZ2xlQ29udHJvbCA9IG5ldyBOdW1iZXJDb250cm9sKCAnTGlnaHQgQW5nbGU6JywgbXVsdGlwbGllclByb3BlcnR5LCBuZXcgUmFuZ2UoIDAsIDIgKSwgbGlnaHRBbmdsZU51bWJlckNvbnRyb2xPcHRpb25zICk7XG5cbiAgLy8gQ29udHJvbCBhdCByaWdodCBzaWRlIG9mIHBsYXkgYXJlYVxuICBkZW1vUGFyZW50LmFkZENoaWxkKCBuZXcgVkJveCgge1xuICAgIHJlc2l6ZTogZmFsc2UsIC8vIERvbid0IHJlYWRqdXN0IHRoZSBzaXplIHdoZW4gdGhlIHNsaWRlciBrbm9iIG1vdmVzIGFsbCB0aGUgd2F5IHRvIHRoZSByaWdodFxuICAgIHNwYWNpbmc6IDE1LFxuICAgIGNoaWxkcmVuOiBbXG4gICAgICBjb2xvclBhbmVsLFxuICAgICAgbGlnaHRBbmdsZUNvbnRyb2xcbiAgICBdLFxuICAgIHJpZ2h0OiBsYXlvdXRCb3VuZHMucmlnaHQgLSA1MCxcbiAgICBjZW50ZXJZOiBsYXlvdXRCb3VuZHMuY2VudGVyWVxuICB9ICkgKTtcblxuICByZXR1cm4gZGVtb1BhcmVudDtcbn0iXSwibmFtZXMiOlsiTXVsdGlsaW5rIiwiUHJvcGVydHkiLCJEaW1lbnNpb24yIiwiUmFuZ2UiLCJTaGFwZSIsImNvbWJpbmVPcHRpb25zIiwiQ29sb3IiLCJOb2RlIiwiUGF0aCIsIlRleHQiLCJWQm94IiwiUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwIiwiUGFuZWwiLCJOdW1iZXJDb250cm9sIiwiUGhldEZvbnQiLCJQcm9iZU5vZGUiLCJkZW1vUHJvYmVOb2RlIiwibGF5b3V0Qm91bmRzIiwiZGVtb1BhcmVudCIsInByb2JlTm9kZUxheWVyIiwiYWRkQ2hpbGQiLCJjb2xvclByb3BlcnR5IiwiREVGQVVMVF9QUk9CRV9OT0RFX09QVElPTlMiLCJjb2xvciIsInJhZGl1c1Byb3BlcnR5IiwicmFkaXVzIiwiaW5uZXJSYWRpdXNQcm9wZXJ0eSIsImlubmVyUmFkaXVzIiwiaGFuZGxlV2lkdGhQcm9wZXJ0eSIsImhhbmRsZVdpZHRoIiwiaGFuZGxlSGVpZ2h0UHJvcGVydHkiLCJoYW5kbGVIZWlnaHQiLCJoYW5kbGVDb3JuZXJSYWRpdXNQcm9wZXJ0eSIsImhhbmRsZUNvcm5lclJhZGl1cyIsImxpZ2h0QW5nbGVQcm9wZXJ0eSIsImxpZ2h0QW5nbGUiLCJzZW5zb3JUeXBlRnVuY3Rpb25Qcm9wZXJ0eSIsInNlbnNvclR5cGVGdW5jdGlvbiIsInRvQ29sb3IiLCJ2YWx1ZSIsInJlZFByb3BlcnR5IiwicmVkIiwiZ3JlZW5Qcm9wZXJ0eSIsImdyZWVuIiwiYmx1ZVByb3BlcnR5IiwiYmx1ZSIsIm11bHRpbGluayIsInIiLCJnIiwiYiIsInJhZGlvQnV0dG9uR3JvdXAiLCJjcmVhdGVOb2RlIiwiY3Jvc3NoYWlycyIsImdsYXNzIiwiY2VudGVyQ29sb3IiLCJtaWRkbGVDb2xvciIsImVkZ2VDb2xvciIsInJpZ2h0IiwibWF4WCIsInRvcCIsIm1pblkiLCJvcmllbnRhdGlvbiIsInNwYWNpbmciLCJyYWRpb0J1dHRvbk9wdGlvbnMiLCJiYXNlQ29sb3IiLCJyZW1vdmVBbGxDaGlsZHJlbiIsIngiLCJjZW50ZXJYIiwieSIsImNlbnRlclkiLCJjcm9zc0hhaXJzUmFkaXVzIiwibW92ZVRvIiwibGluZVRvIiwic3Ryb2tlIiwibGluZVdpZHRoIiwibnVtYmVyQ29udHJvbE9wdGlvbnMiLCJ0aXRsZU5vZGVPcHRpb25zIiwiZm9udCIsIm51bWJlckRpc3BsYXlPcHRpb25zIiwidGV4dE9wdGlvbnMiLCJzbGlkZXJPcHRpb25zIiwidHJhY2tTaXplIiwicmVzaXplIiwiY2hpbGRyZW4iLCJ3aXRoTWluTWF4VGlja3MiLCJsZWZ0IiwiY29sb3JDb21wb25lbnRSYW5nZSIsImNvbG9yUGFuZWwiLCJ0aWNrTGFiZWxPcHRpb25zIiwibXVsdGlwbGllclByb3BlcnR5IiwibGluayIsIm11bHRpcGxpZXIiLCJNYXRoIiwiUEkiLCJsaWdodEFuZ2xlTnVtYmVyQ29udHJvbE9wdGlvbnMiLCJkZWx0YSIsInZhbHVlUGF0dGVybiIsImRlY2ltYWxQbGFjZXMiLCJtYWpvclRpY2tzIiwibGFiZWwiLCJsaWdodEFuZ2xlQ29udHJvbCJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxlQUFlLG1DQUFtQztBQUN6RCxPQUFPQyxjQUFjLGtDQUFrQztBQUV2RCxPQUFPQyxnQkFBZ0IsbUNBQW1DO0FBQzFELE9BQU9DLFdBQVcsOEJBQThCO0FBQ2hELFNBQVNDLEtBQUssUUFBUSxpQ0FBaUM7QUFDdkQsU0FBU0MsY0FBYyxRQUFRLHdDQUF3QztBQUN2RSxTQUFTQyxLQUFLLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSxvQ0FBb0M7QUFDbEYsT0FBT0MsaUNBQWlDLDREQUE0RDtBQUNwRyxPQUFPQyxXQUFXLDhCQUE4QjtBQUNoRCxPQUFPQyxtQkFBeUUseUJBQXlCO0FBRXpHLE9BQU9DLGNBQWMsb0JBQW9CO0FBQ3pDLE9BQU9DLGVBQWUscUJBQXFCO0FBRTNDLGVBQWUsU0FBU0MsY0FBZUMsWUFBcUI7SUFFMUQsTUFBTUMsYUFBYSxJQUFJWDtJQUV2Qix5R0FBeUc7SUFDekcsTUFBTVksaUJBQWlCLElBQUlaO0lBQzNCVyxXQUFXRSxRQUFRLENBQUVEO0lBRXJCLCtDQUErQztJQUMvQyxNQUFNRSxnQkFBZ0IsSUFBSXBCLFNBQVVjLFVBQVVPLDBCQUEwQixDQUFDQyxLQUFLO0lBQzlFLE1BQU1DLGlCQUFpQixJQUFJdkIsU0FBVWMsVUFBVU8sMEJBQTBCLENBQUNHLE1BQU07SUFDaEYsTUFBTUMsc0JBQXNCLElBQUl6QixTQUFVYyxVQUFVTywwQkFBMEIsQ0FBQ0ssV0FBVztJQUMxRixNQUFNQyxzQkFBc0IsSUFBSTNCLFNBQVVjLFVBQVVPLDBCQUEwQixDQUFDTyxXQUFXO0lBQzFGLE1BQU1DLHVCQUF1QixJQUFJN0IsU0FBVWMsVUFBVU8sMEJBQTBCLENBQUNTLFlBQVk7SUFDNUYsTUFBTUMsNkJB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