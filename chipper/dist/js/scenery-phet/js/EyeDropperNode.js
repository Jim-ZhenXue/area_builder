// Copyright 2014-2024, University of Colorado Boulder
/**
 * Eye dropper, with a button for dispensing whatever is in the dropper.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Property from '../../axon/js/Property.js';
import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { Circle, Image, Node, Path } from '../../scenery/js/imports.js';
import RoundMomentaryButton from '../../sun/js/buttons/RoundMomentaryButton.js';
import Tandem from '../../tandem/js/Tandem.js';
import eyeDropperBackground_png from '../images/eyeDropperBackground_png.js';
import eyeDropperForeground_png from '../images/eyeDropperForeground_png.js';
import sceneryPhet from './sceneryPhet.js';
// constants
const DEBUG_ORIGIN = false; // if true, put a red dot at the dropper's origin (bottom center)
const BUTTON_CENTER_Y_OFFSET = 32; // y-offset of button's center in dropper image file
let EyeDropperNode = class EyeDropperNode extends Node {
    dispose() {
        this.disposeEyeDropperNode();
        super.dispose();
    }
    /**
   * Gets the color of the fluid in the dropper.
   */ getFluidColor() {
        return this.fluidNode.fill;
    }
    /**
   * Sets the color of the fluid in the dropper.
   */ setFluidColor(color) {
        this.fluidNode.fill = color;
    }
    get fluidColor() {
        return this.getFluidColor();
    }
    set fluidColor(value) {
        this.setFluidColor(value);
    }
    constructor(provideOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        const options = optionize()({
            // SelfOptions
            isDispensingProperty: new Property(false),
            isEmptyProperty: new Property(false),
            fluidColor: 'yellow',
            buttonOptions: {
                touchAreaDilation: 15,
                baseColor: 'red',
                radius: 18,
                listenerOptions: {
                    // We want to be able to drag the dropper WHILE dispensing, see https://github.com/phetsims/ph-scale/issues/86
                    attach: false
                }
            },
            // NodeOptions
            cursor: 'pointer',
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'DropperNode'
        }, provideOptions);
        super();
        this.isDispensingProperty = options.isDispensingProperty;
        this.isEmptyProperty = options.isEmptyProperty;
        // fluid fills the glass portion of the dropper, shape is specific to the dropper image file
        const fluidShape = new Shape().moveTo(-EyeDropperNode.TIP_WIDTH / 2, 0).lineTo(-EyeDropperNode.TIP_WIDTH / 2, -EyeDropperNode.TIP_HEIGHT).lineTo(-EyeDropperNode.GLASS_WIDTH / 2, EyeDropperNode.GLASS_MAX_Y).lineTo(-EyeDropperNode.GLASS_WIDTH / 2, EyeDropperNode.GLASS_MIN_Y).lineTo(EyeDropperNode.GLASS_WIDTH / 2, EyeDropperNode.GLASS_MIN_Y).lineTo(EyeDropperNode.GLASS_WIDTH / 2, EyeDropperNode.GLASS_MAX_Y).lineTo(EyeDropperNode.TIP_WIDTH / 2, -EyeDropperNode.TIP_HEIGHT).lineTo(EyeDropperNode.TIP_WIDTH / 2, 0).close();
        this.fluidNode = new Path(fluidShape, {
            fill: options.fluidColor,
            visibleProperty: DerivedProperty.not(this.isEmptyProperty) // visible when not empty
        });
        // body of the dropper, origin at bottom center
        const foreground = new Image(eyeDropperForeground_png);
        const background = new Image(eyeDropperBackground_png, {
            visibleProperty: this.isEmptyProperty // visible when empty
        });
        const bodyNode = new Node({
            children: [
                background,
                foreground
            ]
        });
        bodyNode.x = -bodyNode.width / 2;
        bodyNode.y = -bodyNode.height;
        // button, centered in the dropper's bulb
        const button = new RoundMomentaryButton(this.isDispensingProperty, false, true, combineOptions({
            centerX: bodyNode.centerX,
            centerY: bodyNode.top + BUTTON_CENTER_Y_OFFSET,
            tandem: options.tandem.createTandem('button')
        }, options.buttonOptions));
        options.children = [
            this.fluidNode,
            bodyNode,
            button
        ];
        // add a red dot at the origin
        if (DEBUG_ORIGIN) {
            options.children.push(new Circle({
                radius: 3,
                fill: 'red'
            }));
        }
        this.mutate(options);
        this.disposeEyeDropperNode = ()=>{
            button.dispose();
        };
        this.button = button;
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'EyeDropperNode', this);
    }
};
// You'll need these if you want to create fluid coming out of the tip.
EyeDropperNode.TIP_WIDTH = 15;
EyeDropperNode.TIP_HEIGHT = 4;
EyeDropperNode.GLASS_WIDTH = 46;
// You'll need these if you want to put a label on the glass. Values are relative to bottom center.
EyeDropperNode.GLASS_MIN_Y = -124;
EyeDropperNode.GLASS_MAX_Y = -18;
export { EyeDropperNode as default };
sceneryPhet.register('EyeDropperNode', EyeDropperNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9FeWVEcm9wcGVyTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBFeWUgZHJvcHBlciwgd2l0aCBhIGJ1dHRvbiBmb3IgZGlzcGVuc2luZyB3aGF0ZXZlciBpcyBpbiB0aGUgZHJvcHBlci5cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEluc3RhbmNlUmVnaXN0cnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2RvY3VtZW50YXRpb24vSW5zdGFuY2VSZWdpc3RyeS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBDaXJjbGUsIEltYWdlLCBOb2RlLCBOb2RlT3B0aW9ucywgUGF0aCwgVFBhaW50IH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBSb3VuZE1vbWVudGFyeUJ1dHRvbiwgeyBSb3VuZE1vbWVudGFyeUJ1dHRvbk9wdGlvbnMgfSBmcm9tICcuLi8uLi9zdW4vanMvYnV0dG9ucy9Sb3VuZE1vbWVudGFyeUJ1dHRvbi5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IGV5ZURyb3BwZXJCYWNrZ3JvdW5kX3BuZyBmcm9tICcuLi9pbWFnZXMvZXllRHJvcHBlckJhY2tncm91bmRfcG5nLmpzJztcbmltcG9ydCBleWVEcm9wcGVyRm9yZWdyb3VuZF9wbmcgZnJvbSAnLi4vaW1hZ2VzL2V5ZURyb3BwZXJGb3JlZ3JvdW5kX3BuZy5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi9zY2VuZXJ5UGhldC5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgREVCVUdfT1JJR0lOID0gZmFsc2U7IC8vIGlmIHRydWUsIHB1dCBhIHJlZCBkb3QgYXQgdGhlIGRyb3BwZXIncyBvcmlnaW4gKGJvdHRvbSBjZW50ZXIpXG5jb25zdCBCVVRUT05fQ0VOVEVSX1lfT0ZGU0VUID0gMzI7IC8vIHktb2Zmc2V0IG9mIGJ1dHRvbidzIGNlbnRlciBpbiBkcm9wcGVyIGltYWdlIGZpbGVcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyBpcyB0aGUgZHJvcHBlciBkaXNwZW5zaW5nP1xuICBpc0Rpc3BlbnNpbmdQcm9wZXJ0eT86IFByb3BlcnR5PGJvb2xlYW4+O1xuXG4gIC8vIGRvZXMgdGhlIGRyb3BwZXIgYXBwZWFyIHRvIGJlIGVtcHR5P1xuICBpc0VtcHR5UHJvcGVydHk/OiBQcm9wZXJ0eTxib29sZWFuPjtcblxuICAvLyBjb2xvciBvZiB0aGUgZmx1aWQgaW4gdGhlIGdsYXNzXG4gIGZsdWlkQ29sb3I/OiBUUGFpbnQ7XG5cbiAgLy8gcHJvcGFnYXRlZCB0byBSb3VuZE1vbWVudGFyeUJ1dHRvblxuICBidXR0b25PcHRpb25zPzogUm91bmRNb21lbnRhcnlCdXR0b25PcHRpb25zO1xufTtcblxuZXhwb3J0IHR5cGUgRXllRHJvcHBlck5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PE5vZGVPcHRpb25zLCAnY2hpbGRyZW4nPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXllRHJvcHBlck5vZGUgZXh0ZW5kcyBOb2RlIHtcblxuICAvLyBpcyB0aGUgZHJvcHBlciBkaXNwZW5zaW5nP1xuICBwdWJsaWMgcmVhZG9ubHkgaXNEaXNwZW5zaW5nUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xuXG4gIC8vIGlzIHRoZSBkcm9wcGVyIGVtcHR5IG9mIGZsdWlkP1xuICBwdWJsaWMgcmVhZG9ubHkgaXNFbXB0eVByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcblxuICAvLyBmb3IgY2xpZW50cyB3aG8gd2FudCB0byBoaWRlIHRoZSBidXR0b25cbiAgcHVibGljIHJlYWRvbmx5IGJ1dHRvbjogTm9kZTtcblxuICAvLyBmbHVpZCBpbiB0aGUgZHJvcHBlclxuICBwcml2YXRlIHJlYWRvbmx5IGZsdWlkTm9kZTogUGF0aDtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VFeWVEcm9wcGVyTm9kZTogKCkgPT4gdm9pZDtcblxuICAvLyBZb3UnbGwgbmVlZCB0aGVzZSBpZiB5b3Ugd2FudCB0byBjcmVhdGUgZmx1aWQgY29taW5nIG91dCBvZiB0aGUgdGlwLlxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFRJUF9XSURUSCA9IDE1O1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFRJUF9IRUlHSFQgPSA0O1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEdMQVNTX1dJRFRIID0gNDY7XG5cbiAgLy8gWW91J2xsIG5lZWQgdGhlc2UgaWYgeW91IHdhbnQgdG8gcHV0IGEgbGFiZWwgb24gdGhlIGdsYXNzLiBWYWx1ZXMgYXJlIHJlbGF0aXZlIHRvIGJvdHRvbSBjZW50ZXIuXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgR0xBU1NfTUlOX1kgPSAtMTI0O1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEdMQVNTX01BWF9ZID0gLTE4O1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZU9wdGlvbnM/OiBFeWVEcm9wcGVyTm9kZU9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEV5ZURyb3BwZXJOb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIFNlbGZPcHRpb25zXG4gICAgICBpc0Rpc3BlbnNpbmdQcm9wZXJ0eTogbmV3IFByb3BlcnR5PGJvb2xlYW4+KCBmYWxzZSApLFxuICAgICAgaXNFbXB0eVByb3BlcnR5OiBuZXcgUHJvcGVydHk8Ym9vbGVhbj4oIGZhbHNlICksXG4gICAgICBmbHVpZENvbG9yOiAneWVsbG93JyxcbiAgICAgIGJ1dHRvbk9wdGlvbnM6IHtcbiAgICAgICAgdG91Y2hBcmVhRGlsYXRpb246IDE1LFxuICAgICAgICBiYXNlQ29sb3I6ICdyZWQnLFxuICAgICAgICByYWRpdXM6IDE4LFxuICAgICAgICBsaXN0ZW5lck9wdGlvbnM6IHtcbiAgICAgICAgICAvLyBXZSB3YW50IHRvIGJlIGFibGUgdG8gZHJhZyB0aGUgZHJvcHBlciBXSElMRSBkaXNwZW5zaW5nLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoLXNjYWxlL2lzc3Vlcy84NlxuICAgICAgICAgIGF0dGFjaDogZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgLy8gTm9kZU9wdGlvbnNcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXG4gICAgICB0YW5kZW1OYW1lU3VmZml4OiAnRHJvcHBlck5vZGUnXG4gICAgfSwgcHJvdmlkZU9wdGlvbnMgKTtcblxuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmlzRGlzcGVuc2luZ1Byb3BlcnR5ID0gb3B0aW9ucy5pc0Rpc3BlbnNpbmdQcm9wZXJ0eTtcbiAgICB0aGlzLmlzRW1wdHlQcm9wZXJ0eSA9IG9wdGlvbnMuaXNFbXB0eVByb3BlcnR5O1xuXG4gICAgLy8gZmx1aWQgZmlsbHMgdGhlIGdsYXNzIHBvcnRpb24gb2YgdGhlIGRyb3BwZXIsIHNoYXBlIGlzIHNwZWNpZmljIHRvIHRoZSBkcm9wcGVyIGltYWdlIGZpbGVcbiAgICBjb25zdCBmbHVpZFNoYXBlID0gbmV3IFNoYXBlKClcbiAgICAgIC5tb3ZlVG8oIC1FeWVEcm9wcGVyTm9kZS5USVBfV0lEVEggLyAyLCAwIClcbiAgICAgIC5saW5lVG8oIC1FeWVEcm9wcGVyTm9kZS5USVBfV0lEVEggLyAyLCAtRXllRHJvcHBlck5vZGUuVElQX0hFSUdIVCApXG4gICAgICAubGluZVRvKCAtRXllRHJvcHBlck5vZGUuR0xBU1NfV0lEVEggLyAyLCBFeWVEcm9wcGVyTm9kZS5HTEFTU19NQVhfWSApXG4gICAgICAubGluZVRvKCAtRXllRHJvcHBlck5vZGUuR0xBU1NfV0lEVEggLyAyLCBFeWVEcm9wcGVyTm9kZS5HTEFTU19NSU5fWSApXG4gICAgICAubGluZVRvKCBFeWVEcm9wcGVyTm9kZS5HTEFTU19XSURUSCAvIDIsIEV5ZURyb3BwZXJOb2RlLkdMQVNTX01JTl9ZIClcbiAgICAgIC5saW5lVG8oIEV5ZURyb3BwZXJOb2RlLkdMQVNTX1dJRFRIIC8gMiwgRXllRHJvcHBlck5vZGUuR0xBU1NfTUFYX1kgKVxuICAgICAgLmxpbmVUbyggRXllRHJvcHBlck5vZGUuVElQX1dJRFRIIC8gMiwgLUV5ZURyb3BwZXJOb2RlLlRJUF9IRUlHSFQgKVxuICAgICAgLmxpbmVUbyggRXllRHJvcHBlck5vZGUuVElQX1dJRFRIIC8gMiwgMCApXG4gICAgICAuY2xvc2UoKTtcbiAgICB0aGlzLmZsdWlkTm9kZSA9IG5ldyBQYXRoKCBmbHVpZFNoYXBlLCB7XG4gICAgICBmaWxsOiBvcHRpb25zLmZsdWlkQ29sb3IsXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IERlcml2ZWRQcm9wZXJ0eS5ub3QoIHRoaXMuaXNFbXB0eVByb3BlcnR5ICkgLy8gdmlzaWJsZSB3aGVuIG5vdCBlbXB0eVxuICAgIH0gKTtcblxuICAgIC8vIGJvZHkgb2YgdGhlIGRyb3BwZXIsIG9yaWdpbiBhdCBib3R0b20gY2VudGVyXG4gICAgY29uc3QgZm9yZWdyb3VuZCA9IG5ldyBJbWFnZSggZXllRHJvcHBlckZvcmVncm91bmRfcG5nICk7XG4gICAgY29uc3QgYmFja2dyb3VuZCA9IG5ldyBJbWFnZSggZXllRHJvcHBlckJhY2tncm91bmRfcG5nLCB7XG4gICAgICB2aXNpYmxlUHJvcGVydHk6IHRoaXMuaXNFbXB0eVByb3BlcnR5IC8vIHZpc2libGUgd2hlbiBlbXB0eVxuICAgIH0gKTtcbiAgICBjb25zdCBib2R5Tm9kZSA9IG5ldyBOb2RlKCB7XG4gICAgICBjaGlsZHJlbjogWyBiYWNrZ3JvdW5kLCBmb3JlZ3JvdW5kIF1cbiAgICB9ICk7XG4gICAgYm9keU5vZGUueCA9IC1ib2R5Tm9kZS53aWR0aCAvIDI7XG4gICAgYm9keU5vZGUueSA9IC1ib2R5Tm9kZS5oZWlnaHQ7XG5cbiAgICAvLyBidXR0b24sIGNlbnRlcmVkIGluIHRoZSBkcm9wcGVyJ3MgYnVsYlxuICAgIGNvbnN0IGJ1dHRvbiA9IG5ldyBSb3VuZE1vbWVudGFyeUJ1dHRvbiggdGhpcy5pc0Rpc3BlbnNpbmdQcm9wZXJ0eSwgZmFsc2UsIHRydWUsIGNvbWJpbmVPcHRpb25zPFJvdW5kTW9tZW50YXJ5QnV0dG9uT3B0aW9ucz4oIHtcbiAgICAgIGNlbnRlclg6IGJvZHlOb2RlLmNlbnRlclgsXG4gICAgICBjZW50ZXJZOiBib2R5Tm9kZS50b3AgKyBCVVRUT05fQ0VOVEVSX1lfT0ZGU0VULFxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdidXR0b24nIClcbiAgICB9LCBvcHRpb25zLmJ1dHRvbk9wdGlvbnMgKSApO1xuXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgdGhpcy5mbHVpZE5vZGUsIGJvZHlOb2RlLCBidXR0b24gXTtcblxuICAgIC8vIGFkZCBhIHJlZCBkb3QgYXQgdGhlIG9yaWdpblxuICAgIGlmICggREVCVUdfT1JJR0lOICkge1xuICAgICAgb3B0aW9ucy5jaGlsZHJlbi5wdXNoKCBuZXcgQ2lyY2xlKCB7IHJhZGl1czogMywgZmlsbDogJ3JlZCcgfSApICk7XG4gICAgfVxuXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcblxuICAgIHRoaXMuZGlzcG9zZUV5ZURyb3BwZXJOb2RlID0gKCkgPT4ge1xuICAgICAgYnV0dG9uLmRpc3Bvc2UoKTtcbiAgICB9O1xuXG4gICAgdGhpcy5idXR0b24gPSBidXR0b247XG5cbiAgICAvLyBzdXBwb3J0IGZvciBiaW5kZXIgZG9jdW1lbnRhdGlvbiwgc3RyaXBwZWQgb3V0IGluIGJ1aWxkcyBhbmQgb25seSBydW5zIHdoZW4gP2JpbmRlciBpcyBzcGVjaWZpZWRcbiAgICBhc3NlcnQgJiYgd2luZG93LnBoZXQ/LmNoaXBwZXI/LnF1ZXJ5UGFyYW1ldGVycz8uYmluZGVyICYmIEluc3RhbmNlUmVnaXN0cnkucmVnaXN0ZXJEYXRhVVJMKCAnc2NlbmVyeS1waGV0JywgJ0V5ZURyb3BwZXJOb2RlJywgdGhpcyApO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlRXllRHJvcHBlck5vZGUoKTtcbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgY29sb3Igb2YgdGhlIGZsdWlkIGluIHRoZSBkcm9wcGVyLlxuICAgKi9cbiAgcHVibGljIGdldEZsdWlkQ29sb3IoKTogVFBhaW50IHtcbiAgICByZXR1cm4gdGhpcy5mbHVpZE5vZGUuZmlsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBjb2xvciBvZiB0aGUgZmx1aWQgaW4gdGhlIGRyb3BwZXIuXG4gICAqL1xuICBwdWJsaWMgc2V0Rmx1aWRDb2xvciggY29sb3I6IFRQYWludCApOiB2b2lkIHtcbiAgICB0aGlzLmZsdWlkTm9kZS5maWxsID0gY29sb3I7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGZsdWlkQ29sb3IoKTogVFBhaW50IHtcbiAgICByZXR1cm4gdGhpcy5nZXRGbHVpZENvbG9yKCk7XG4gIH1cblxuICBwdWJsaWMgc2V0IGZsdWlkQ29sb3IoIHZhbHVlOiBUUGFpbnQgKSB7XG4gICAgdGhpcy5zZXRGbHVpZENvbG9yKCB2YWx1ZSApO1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnRXllRHJvcHBlck5vZGUnLCBFeWVEcm9wcGVyTm9kZSApOyJdLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlNoYXBlIiwiSW5zdGFuY2VSZWdpc3RyeSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiQ2lyY2xlIiwiSW1hZ2UiLCJOb2RlIiwiUGF0aCIsIlJvdW5kTW9tZW50YXJ5QnV0dG9uIiwiVGFuZGVtIiwiZXllRHJvcHBlckJhY2tncm91bmRfcG5nIiwiZXllRHJvcHBlckZvcmVncm91bmRfcG5nIiwic2NlbmVyeVBoZXQiLCJERUJVR19PUklHSU4iLCJCVVRUT05fQ0VOVEVSX1lfT0ZGU0VUIiwiRXllRHJvcHBlck5vZGUiLCJkaXNwb3NlIiwiZGlzcG9zZUV5ZURyb3BwZXJOb2RlIiwiZ2V0Rmx1aWRDb2xvciIsImZsdWlkTm9kZSIsImZpbGwiLCJzZXRGbHVpZENvbG9yIiwiY29sb3IiLCJmbHVpZENvbG9yIiwidmFsdWUiLCJwcm92aWRlT3B0aW9ucyIsIndpbmRvdyIsIm9wdGlvbnMiLCJpc0Rpc3BlbnNpbmdQcm9wZXJ0eSIsImlzRW1wdHlQcm9wZXJ0eSIsImJ1dHRvbk9wdGlvbnMiLCJ0b3VjaEFyZWFEaWxhdGlvbiIsImJhc2VDb2xvciIsInJhZGl1cyIsImxpc3RlbmVyT3B0aW9ucyIsImF0dGFjaCIsImN1cnNvciIsInRhbmRlbSIsIlJFUVVJUkVEIiwidGFuZGVtTmFtZVN1ZmZpeCIsImZsdWlkU2hhcGUiLCJtb3ZlVG8iLCJUSVBfV0lEVEgiLCJsaW5lVG8iLCJUSVBfSEVJR0hUIiwiR0xBU1NfV0lEVEgiLCJHTEFTU19NQVhfWSIsIkdMQVNTX01JTl9ZIiwiY2xvc2UiLCJ2aXNpYmxlUHJvcGVydHkiLCJub3QiLCJmb3JlZ3JvdW5kIiwiYmFja2dyb3VuZCIsImJvZHlOb2RlIiwiY2hpbGRyZW4iLCJ4Iiwid2lkdGgiLCJ5IiwiaGVpZ2h0IiwiYnV0dG9uIiwiY2VudGVyWCIsImNlbnRlclkiLCJ0b3AiLCJjcmVhdGVUYW5kZW0iLCJwdXNoIiwibXV0YXRlIiwiYXNzZXJ0IiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJiaW5kZXIiLCJyZWdpc3RlckRhdGFVUkwiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxxQkFBcUIsbUNBQW1DO0FBQy9ELE9BQU9DLGNBQWMsNEJBQTRCO0FBQ2pELFNBQVNDLEtBQUssUUFBUSwyQkFBMkI7QUFDakQsT0FBT0Msc0JBQXNCLHVEQUF1RDtBQUNwRixPQUFPQyxhQUFhQyxjQUFjLFFBQVEsa0NBQWtDO0FBRTVFLFNBQVNDLE1BQU0sRUFBRUMsS0FBSyxFQUFFQyxJQUFJLEVBQWVDLElBQUksUUFBZ0IsOEJBQThCO0FBQzdGLE9BQU9DLDBCQUEyRCwrQ0FBK0M7QUFDakgsT0FBT0MsWUFBWSw0QkFBNEI7QUFDL0MsT0FBT0MsOEJBQThCLHdDQUF3QztBQUM3RSxPQUFPQyw4QkFBOEIsd0NBQXdDO0FBQzdFLE9BQU9DLGlCQUFpQixtQkFBbUI7QUFFM0MsWUFBWTtBQUNaLE1BQU1DLGVBQWUsT0FBTyxpRUFBaUU7QUFDN0YsTUFBTUMseUJBQXlCLElBQUksb0RBQW9EO0FBbUJ4RSxJQUFBLEFBQU1DLGlCQUFOLE1BQU1BLHVCQUF1QlQ7SUEyRzFCVSxVQUFnQjtRQUM5QixJQUFJLENBQUNDLHFCQUFxQjtRQUMxQixLQUFLLENBQUNEO0lBQ1I7SUFFQTs7R0FFQyxHQUNELEFBQU9FLGdCQUF3QjtRQUM3QixPQUFPLElBQUksQ0FBQ0MsU0FBUyxDQUFDQyxJQUFJO0lBQzVCO0lBRUE7O0dBRUMsR0FDRCxBQUFPQyxjQUFlQyxLQUFhLEVBQVM7UUFDMUMsSUFBSSxDQUFDSCxTQUFTLENBQUNDLElBQUksR0FBR0U7SUFDeEI7SUFFQSxJQUFXQyxh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