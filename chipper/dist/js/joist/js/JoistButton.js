// Copyright 2014-2024, University of Colorado Boulder
/**
 * Base class for Joist buttons such as the "home" button and "PhET" button that show custom highlighting on mouseover.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import Multilink from '../../axon/js/Multilink.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import { Color, Node, SceneryConstants, Voicing } from '../../scenery/js/imports.js';
import ButtonInteractionState from '../../sun/js/buttons/ButtonInteractionState.js';
import PushButtonInteractionStateProperty from '../../sun/js/buttons/PushButtonInteractionStateProperty.js';
import PushButtonModel from '../../sun/js/buttons/PushButtonModel.js';
import HighlightNode from './HighlightNode.js';
import joist from './joist.js';
let JoistButton = class JoistButton extends Voicing(Node) {
    /**
   * Is the button currently firing because of accessibility input coming from the PDOM?
   * (pdom)
   */ isPDOMClicking() {
        return this._pressListener.pdomClickingProperty.get();
    }
    /**
   * @param content - the scenery node to render as the content of the button
   * @param navigationBarFillProperty - the color of the navbar, as a string.
   * @param [providedOptions]
   */ constructor(content, navigationBarFillProperty, providedOptions){
        const options = optionize()({
            cursor: 'pointer',
            listener: null,
            // Customization for the highlight region, see overrides in HomeButton and PhetButton
            highlightExtensionWidth: 0,
            highlightExtensionHeight: 0,
            highlightCenterOffsetX: 0,
            highlightCenterOffsetY: 0,
            pointerAreaDilationX: 0,
            pointerAreaDilationY: 0,
            // JoistButtons by default do not have a featured enabledProperty
            enabledPropertyOptions: {
                phetioFeatured: false
            },
            disabledOpacity: SceneryConstants.DISABLED_OPACITY,
            // pdom
            tagName: 'button'
        }, providedOptions);
        // Creates the highlights for the button.
        const createHighlight = function(fill) {
            return new HighlightNode(content.width + options.highlightExtensionWidth, content.height + options.highlightExtensionHeight, {
                centerX: content.centerX + options.highlightCenterOffsetX,
                centerY: content.centerY + options.highlightCenterOffsetY,
                fill: fill,
                pickable: false
            });
        };
        // Highlight against the black background
        const brightenHighlight = createHighlight('white');
        // Highlight against the white background
        const darkenHighlight = createHighlight('black');
        options.children = [
            content,
            brightenHighlight,
            darkenHighlight
        ];
        super(options);
        this.buttonModel = new PushButtonModel(options);
        // Button interactions
        const interactionStateProperty = new PushButtonInteractionStateProperty(this.buttonModel);
        this.interactionStateProperty = interactionStateProperty;
        // Update the highlights based on whether the button is highlighted and whether it is against a light or dark background.
        Multilink.multilink([
            interactionStateProperty,
            navigationBarFillProperty,
            this.buttonModel.enabledProperty
        ], (interactionState, navigationBarFill, enabled)=>{
            const useDarkenHighlight = !navigationBarFill.equals(Color.BLACK);
            brightenHighlight.visible = !useDarkenHighlight && enabled && (interactionState === ButtonInteractionState.OVER || interactionState === ButtonInteractionState.PRESSED);
            darkenHighlight.visible = useDarkenHighlight && enabled && (interactionState === ButtonInteractionState.OVER || interactionState === ButtonInteractionState.PRESSED);
        });
        // Keep the cursor in sync with if the button is enabled.
        // JoistButtons exist for the lifetime of the sim, and don't need to be disposed
        this.buttonModel.enabledProperty.link((enabled)=>{
            this.cursor = enabled ? options.cursor : null;
        });
        // Hook up the input listener
        this._pressListener = this.buttonModel.createPressListener({
            tandem: options.tandem.createTandem('pressListener')
        });
        this.addInputListener(this._pressListener);
        // eliminate interactivity gap between label and button
        this.mouseArea = this.touchArea = Shape.bounds(this.bounds.dilatedXY(options.pointerAreaDilationX, options.pointerAreaDilationY));
        // shift the focus highlight for the joist button so that the bottom is always on screen
        this.focusHighlight = Shape.bounds(this.bounds.shiftedY(-3));
    }
};
export { JoistButton as default };
joist.register('JoistButton', JoistButton);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL0pvaXN0QnV0dG9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIEpvaXN0IGJ1dHRvbnMgc3VjaCBhcyB0aGUgXCJob21lXCIgYnV0dG9uIGFuZCBcIlBoRVRcIiBidXR0b24gdGhhdCBzaG93IGN1c3RvbSBoaWdobGlnaHRpbmcgb24gbW91c2VvdmVyLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCB7IENvbG9yLCBOb2RlLCBOb2RlT3B0aW9ucywgUHJlc3NMaXN0ZW5lciwgU2NlbmVyeUNvbnN0YW50cywgVm9pY2luZywgVm9pY2luZ09wdGlvbnMgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEJ1dHRvbkludGVyYWN0aW9uU3RhdGUgZnJvbSAnLi4vLi4vc3VuL2pzL2J1dHRvbnMvQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZS5qcyc7XG5pbXBvcnQgUHVzaEJ1dHRvbkludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eSBmcm9tICcuLi8uLi9zdW4vanMvYnV0dG9ucy9QdXNoQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5LmpzJztcbmltcG9ydCBQdXNoQnV0dG9uTW9kZWwgZnJvbSAnLi4vLi4vc3VuL2pzL2J1dHRvbnMvUHVzaEJ1dHRvbk1vZGVsLmpzJztcbmltcG9ydCBIaWdobGlnaHROb2RlIGZyb20gJy4vSGlnaGxpZ2h0Tm9kZS5qcyc7XG5pbXBvcnQgam9pc3QgZnJvbSAnLi9qb2lzdC5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIGhpZ2hsaWdodEV4dGVuc2lvbldpZHRoPzogbnVtYmVyO1xuICBoaWdobGlnaHRFeHRlbnNpb25IZWlnaHQ/OiBudW1iZXI7XG4gIGhpZ2hsaWdodENlbnRlck9mZnNldFg/OiBudW1iZXI7XG4gIGhpZ2hsaWdodENlbnRlck9mZnNldFk/OiBudW1iZXI7XG4gIHBvaW50ZXJBcmVhRGlsYXRpb25YPzogbnVtYmVyO1xuICBwb2ludGVyQXJlYURpbGF0aW9uWT86IG51bWJlcjtcbiAgbGlzdGVuZXI/OiAoICgpID0+IHZvaWQgKSB8IG51bGw7XG59O1xudHlwZSBQYXJlbnRPcHRpb25zID0gVm9pY2luZ09wdGlvbnMgJiBOb2RlT3B0aW9ucztcbmV4cG9ydCB0eXBlIEpvaXN0QnV0dG9uT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxQYXJlbnRPcHRpb25zLCAnY2hpbGRyZW4nPiAmIFBpY2tSZXF1aXJlZDxQYXJlbnRPcHRpb25zLCAndGFuZGVtJz47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEpvaXN0QnV0dG9uIGV4dGVuZHMgVm9pY2luZyggTm9kZSApIHtcblxuICAvLyAocGhldC1pb3xhMTF5KSAtIEJ1dHRvbiBtb2RlbFxuICAvLyBOb3RlIGl0IHNoYXJlcyBhIHRhbmRlbSB3aXRoIFwidGhpc1wiLCBzbyB0aGUgZW1pdHRlciB3aWxsIGJlIGluc3RydW1lbnRlZCBhcyBhIGNoaWxkIG9mIHRoZSBidXR0b25cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGJ1dHRvbk1vZGVsOiBQdXNoQnV0dG9uTW9kZWw7XG4gIHByb3RlY3RlZCByZWFkb25seSBpbnRlcmFjdGlvblN0YXRlUHJvcGVydHk6IFB1c2hCdXR0b25JbnRlcmFjdGlvblN0YXRlUHJvcGVydHk7XG4gIHByaXZhdGUgcmVhZG9ubHkgX3ByZXNzTGlzdGVuZXI6IFByZXNzTGlzdGVuZXI7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBjb250ZW50IC0gdGhlIHNjZW5lcnkgbm9kZSB0byByZW5kZXIgYXMgdGhlIGNvbnRlbnQgb2YgdGhlIGJ1dHRvblxuICAgKiBAcGFyYW0gbmF2aWdhdGlvbkJhckZpbGxQcm9wZXJ0eSAtIHRoZSBjb2xvciBvZiB0aGUgbmF2YmFyLCBhcyBhIHN0cmluZy5cbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGNvbnRlbnQ6IE5vZGUsIG5hdmlnYXRpb25CYXJGaWxsUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PENvbG9yPiwgcHJvdmlkZWRPcHRpb25zOiBKb2lzdEJ1dHRvbk9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEpvaXN0QnV0dG9uT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBhcmVudE9wdGlvbnM+KCkoIHtcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLCAvLyB7c3RyaW5nfVxuICAgICAgbGlzdGVuZXI6IG51bGwsIC8vIHtmdW5jdGlvbn1cblxuICAgICAgLy8gQ3VzdG9taXphdGlvbiBmb3IgdGhlIGhpZ2hsaWdodCByZWdpb24sIHNlZSBvdmVycmlkZXMgaW4gSG9tZUJ1dHRvbiBhbmQgUGhldEJ1dHRvblxuICAgICAgaGlnaGxpZ2h0RXh0ZW5zaW9uV2lkdGg6IDAsXG4gICAgICBoaWdobGlnaHRFeHRlbnNpb25IZWlnaHQ6IDAsXG4gICAgICBoaWdobGlnaHRDZW50ZXJPZmZzZXRYOiAwLFxuICAgICAgaGlnaGxpZ2h0Q2VudGVyT2Zmc2V0WTogMCxcblxuICAgICAgcG9pbnRlckFyZWFEaWxhdGlvblg6IDAsXG4gICAgICBwb2ludGVyQXJlYURpbGF0aW9uWTogMCxcblxuICAgICAgLy8gSm9pc3RCdXR0b25zIGJ5IGRlZmF1bHQgZG8gbm90IGhhdmUgYSBmZWF0dXJlZCBlbmFibGVkUHJvcGVydHlcbiAgICAgIGVuYWJsZWRQcm9wZXJ0eU9wdGlvbnM6IHsgcGhldGlvRmVhdHVyZWQ6IGZhbHNlIH0sXG4gICAgICBkaXNhYmxlZE9wYWNpdHk6IFNjZW5lcnlDb25zdGFudHMuRElTQUJMRURfT1BBQ0lUWSxcblxuICAgICAgLy8gcGRvbVxuICAgICAgdGFnTmFtZTogJ2J1dHRvbidcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIC8vIENyZWF0ZXMgdGhlIGhpZ2hsaWdodHMgZm9yIHRoZSBidXR0b24uXG4gICAgY29uc3QgY3JlYXRlSGlnaGxpZ2h0ID0gZnVuY3Rpb24oIGZpbGw6IENvbG9yIHwgc3RyaW5nICkge1xuICAgICAgcmV0dXJuIG5ldyBIaWdobGlnaHROb2RlKCBjb250ZW50LndpZHRoICsgb3B0aW9ucy5oaWdobGlnaHRFeHRlbnNpb25XaWR0aCwgY29udGVudC5oZWlnaHQgKyBvcHRpb25zLmhpZ2hsaWdodEV4dGVuc2lvbkhlaWdodCwge1xuICAgICAgICBjZW50ZXJYOiBjb250ZW50LmNlbnRlclggKyBvcHRpb25zLmhpZ2hsaWdodENlbnRlck9mZnNldFgsXG4gICAgICAgIGNlbnRlclk6IGNvbnRlbnQuY2VudGVyWSArIG9wdGlvbnMuaGlnaGxpZ2h0Q2VudGVyT2Zmc2V0WSxcbiAgICAgICAgZmlsbDogZmlsbCxcbiAgICAgICAgcGlja2FibGU6IGZhbHNlXG4gICAgICB9ICk7XG4gICAgfTtcblxuICAgIC8vIEhpZ2hsaWdodCBhZ2FpbnN0IHRoZSBibGFjayBiYWNrZ3JvdW5kXG4gICAgY29uc3QgYnJpZ2h0ZW5IaWdobGlnaHQgPSBjcmVhdGVIaWdobGlnaHQoICd3aGl0ZScgKTtcblxuICAgIC8vIEhpZ2hsaWdodCBhZ2FpbnN0IHRoZSB3aGl0ZSBiYWNrZ3JvdW5kXG4gICAgY29uc3QgZGFya2VuSGlnaGxpZ2h0ID0gY3JlYXRlSGlnaGxpZ2h0KCAnYmxhY2snICk7XG5cbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyBjb250ZW50LCBicmlnaHRlbkhpZ2hsaWdodCwgZGFya2VuSGlnaGxpZ2h0IF07XG5cbiAgICBzdXBlciggb3B0aW9ucyApO1xuXG4gICAgdGhpcy5idXR0b25Nb2RlbCA9IG5ldyBQdXNoQnV0dG9uTW9kZWwoIG9wdGlvbnMgKTtcblxuICAgIC8vIEJ1dHRvbiBpbnRlcmFjdGlvbnNcbiAgICBjb25zdCBpbnRlcmFjdGlvblN0YXRlUHJvcGVydHkgPSBuZXcgUHVzaEJ1dHRvbkludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eSggdGhpcy5idXR0b25Nb2RlbCApO1xuXG4gICAgdGhpcy5pbnRlcmFjdGlvblN0YXRlUHJvcGVydHkgPSBpbnRlcmFjdGlvblN0YXRlUHJvcGVydHk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGhpZ2hsaWdodHMgYmFzZWQgb24gd2hldGhlciB0aGUgYnV0dG9uIGlzIGhpZ2hsaWdodGVkIGFuZCB3aGV0aGVyIGl0IGlzIGFnYWluc3QgYSBsaWdodCBvciBkYXJrIGJhY2tncm91bmQuXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyBpbnRlcmFjdGlvblN0YXRlUHJvcGVydHksIG5hdmlnYXRpb25CYXJGaWxsUHJvcGVydHksIHRoaXMuYnV0dG9uTW9kZWwuZW5hYmxlZFByb3BlcnR5IF0sXG4gICAgICAoIGludGVyYWN0aW9uU3RhdGUsIG5hdmlnYXRpb25CYXJGaWxsLCBlbmFibGVkICkgPT4ge1xuICAgICAgICBjb25zdCB1c2VEYXJrZW5IaWdobGlnaHQgPSAhbmF2aWdhdGlvbkJhckZpbGwuZXF1YWxzKCBDb2xvci5CTEFDSyApO1xuXG4gICAgICAgIGJyaWdodGVuSGlnaGxpZ2h0LnZpc2libGUgPSAhdXNlRGFya2VuSGlnaGxpZ2h0ICYmIGVuYWJsZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggaW50ZXJhY3Rpb25TdGF0ZSA9PT0gQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZS5PVkVSIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludGVyYWN0aW9uU3RhdGUgPT09IEJ1dHRvbkludGVyYWN0aW9uU3RhdGUuUFJFU1NFRCApO1xuICAgICAgICBkYXJrZW5IaWdobGlnaHQudmlzaWJsZSA9IHVzZURhcmtlbkhpZ2hsaWdodCAmJiBlbmFibGVkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBpbnRlcmFjdGlvblN0YXRlID09PSBCdXR0b25JbnRlcmFjdGlvblN0YXRlLk9WRVIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludGVyYWN0aW9uU3RhdGUgPT09IEJ1dHRvbkludGVyYWN0aW9uU3RhdGUuUFJFU1NFRCApO1xuICAgICAgfSApO1xuXG4gICAgLy8gS2VlcCB0aGUgY3Vyc29yIGluIHN5bmMgd2l0aCBpZiB0aGUgYnV0dG9uIGlzIGVuYWJsZWQuXG4gICAgLy8gSm9pc3RCdXR0b25zIGV4aXN0IGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbSwgYW5kIGRvbid0IG5lZWQgdG8gYmUgZGlzcG9zZWRcbiAgICB0aGlzLmJ1dHRvbk1vZGVsLmVuYWJsZWRQcm9wZXJ0eS5saW5rKCBlbmFibGVkID0+IHtcbiAgICAgIHRoaXMuY3Vyc29yID0gZW5hYmxlZCA/IG9wdGlvbnMuY3Vyc29yIDogbnVsbDtcbiAgICB9ICk7XG5cbiAgICAvLyBIb29rIHVwIHRoZSBpbnB1dCBsaXN0ZW5lclxuICAgIHRoaXMuX3ByZXNzTGlzdGVuZXIgPSB0aGlzLmJ1dHRvbk1vZGVsLmNyZWF0ZVByZXNzTGlzdGVuZXIoIHtcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncHJlc3NMaXN0ZW5lcicgKVxuICAgIH0gKTtcbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIHRoaXMuX3ByZXNzTGlzdGVuZXIgKTtcblxuICAgIC8vIGVsaW1pbmF0ZSBpbnRlcmFjdGl2aXR5IGdhcCBiZXR3ZWVuIGxhYmVsIGFuZCBidXR0b25cbiAgICB0aGlzLm1vdXNlQXJlYSA9IHRoaXMudG91Y2hBcmVhID0gU2hhcGUuYm91bmRzKCB0aGlzLmJvdW5kcy5kaWxhdGVkWFkoIG9wdGlvbnMucG9pbnRlckFyZWFEaWxhdGlvblgsIG9wdGlvbnMucG9pbnRlckFyZWFEaWxhdGlvblkgKSApO1xuXG4gICAgLy8gc2hpZnQgdGhlIGZvY3VzIGhpZ2hsaWdodCBmb3IgdGhlIGpvaXN0IGJ1dHRvbiBzbyB0aGF0IHRoZSBib3R0b20gaXMgYWx3YXlzIG9uIHNjcmVlblxuICAgIHRoaXMuZm9jdXNIaWdobGlnaHQgPSBTaGFwZS5ib3VuZHMoIHRoaXMuYm91bmRzLnNoaWZ0ZWRZKCAtMyApICk7XG4gIH1cblxuICAvKipcbiAgICogSXMgdGhlIGJ1dHRvbiBjdXJyZW50bHkgZmlyaW5nIGJlY2F1c2Ugb2YgYWNjZXNzaWJpbGl0eSBpbnB1dCBjb21pbmcgZnJvbSB0aGUgUERPTT9cbiAgICogKHBkb20pXG4gICAqL1xuICBwdWJsaWMgaXNQRE9NQ2xpY2tpbmcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3ByZXNzTGlzdGVuZXIucGRvbUNsaWNraW5nUHJvcGVydHkuZ2V0KCk7XG4gIH1cbn1cblxuam9pc3QucmVnaXN0ZXIoICdKb2lzdEJ1dHRvbicsIEpvaXN0QnV0dG9uICk7Il0sIm5hbWVzIjpbIk11bHRpbGluayIsIlNoYXBlIiwib3B0aW9uaXplIiwiQ29sb3IiLCJOb2RlIiwiU2NlbmVyeUNvbnN0YW50cyIsIlZvaWNpbmciLCJCdXR0b25JbnRlcmFjdGlvblN0YXRlIiwiUHVzaEJ1dHRvbkludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eSIsIlB1c2hCdXR0b25Nb2RlbCIsIkhpZ2hsaWdodE5vZGUiLCJqb2lzdCIsIkpvaXN0QnV0dG9uIiwiaXNQRE9NQ2xpY2tpbmciLCJfcHJlc3NMaXN0ZW5lciIsInBkb21DbGlja2luZ1Byb3BlcnR5IiwiZ2V0IiwiY29udGVudCIsIm5hdmlnYXRpb25CYXJGaWxsUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiY3Vyc29yIiwibGlzdGVuZXIiLCJoaWdobGlnaHRFeHRlbnNpb25XaWR0aCIsImhpZ2hsaWdodEV4dGVuc2lvbkhlaWdodCIsImhpZ2hsaWdodENlbnRlck9mZnNldFgiLCJoaWdobGlnaHRDZW50ZXJPZmZzZXRZIiwicG9pbnRlckFyZWFEaWxhdGlvblgiLCJwb2ludGVyQXJlYURpbGF0aW9uWSIsImVuYWJsZWRQcm9wZXJ0eU9wdGlvbnMiLCJwaGV0aW9GZWF0dXJlZCIsImRpc2FibGVkT3BhY2l0eSIsIkRJU0FCTEVEX09QQUNJVFkiLCJ0YWdOYW1lIiwiY3JlYXRlSGlnaGxpZ2h0IiwiZmlsbCIsIndpZHRoIiwiaGVpZ2h0IiwiY2VudGVyWCIsImNlbnRlclkiLCJwaWNrYWJsZSIsImJyaWdodGVuSGlnaGxpZ2h0IiwiZGFya2VuSGlnaGxpZ2h0IiwiY2hpbGRyZW4iLCJidXR0b25Nb2RlbCIsImludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eSIsIm11bHRpbGluayIsImVuYWJsZWRQcm9wZXJ0eSIsImludGVyYWN0aW9uU3RhdGUiLCJuYXZpZ2F0aW9uQmFyRmlsbCIsImVuYWJsZWQiLCJ1c2VEYXJrZW5IaWdobGlnaHQiLCJlcXVhbHMiLCJCTEFDSyIsInZpc2libGUiLCJPVkVSIiwiUFJFU1NFRCIsImxpbmsiLCJjcmVhdGVQcmVzc0xpc3RlbmVyIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiYWRkSW5wdXRMaXN0ZW5lciIsIm1vdXNlQXJlYSIsInRvdWNoQXJlYSIsImJvdW5kcyIsImRpbGF0ZWRYWSIsImZvY3VzSGlnaGxpZ2h0Iiwic2hpZnRl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