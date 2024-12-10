// Copyright 2015-2024, University of Colorado Boulder
/**
 * BracketNode draws a bracket with an optional label.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import { Node, Path } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
let BracketNode = class BracketNode extends Node {
    dispose() {
        this.disposeBracketNode();
        super.dispose();
    }
    constructor(providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        const options = optionize()({
            // SelfOptions
            orientation: 'down',
            labelNode: null,
            bracketLength: 100,
            bracketTipPosition: 0.5,
            bracketEndRadius: 5,
            bracketTipRadius: 6,
            bracketStroke: 'black',
            bracketLineWidth: 1,
            spacing: 2
        }, providedOptions);
        // validate options
        assert && assert(options.bracketTipPosition > 0 && options.bracketTipPosition < 1);
        super();
        // compute tip position
        let tipX;
        if (options.orientation === 'down' || options.orientation === 'left') {
            tipX = options.bracketTipPosition * options.bracketLength;
        } else {
            tipX = (1 - options.bracketTipPosition) * options.bracketLength;
        }
        assert && assert(tipX > options.bracketEndRadius + options.bracketTipRadius);
        assert && assert(tipX < options.bracketLength - (options.bracketEndRadius + options.bracketTipRadius));
        // bracket shape, created for 'down' orientation, left-to-right
        const bracketShape = new Shape()// left end curves up
        .arc(options.bracketEndRadius, 0, options.bracketEndRadius, Math.PI, 0.5 * Math.PI, true).lineTo(tipX - options.bracketTipRadius, options.bracketEndRadius)// tip points down
        .arc(tipX - options.bracketTipRadius, options.bracketEndRadius + options.bracketTipRadius, options.bracketTipRadius, 1.5 * Math.PI, 0).arc(tipX + options.bracketTipRadius, options.bracketEndRadius + options.bracketTipRadius, options.bracketTipRadius, Math.PI, 1.5 * Math.PI)// right end curves up
        .lineTo(options.bracketLength - options.bracketEndRadius, options.bracketEndRadius).arc(options.bracketLength - options.bracketEndRadius, 0, options.bracketEndRadius, 0.5 * Math.PI, 0, true);
        // bracket node
        const bracketNode = new Path(bracketShape, {
            stroke: options.bracketStroke,
            lineWidth: options.bracketLineWidth
        });
        this.addChild(bracketNode);
        // put the bracket in the correct orientation
        switch(options.orientation){
            case 'up':
                bracketNode.rotation = Math.PI;
                break;
            case 'down':
                break;
            case 'left':
                bracketNode.rotation = Math.PI / 2;
                break;
            case 'right':
                bracketNode.rotation = -Math.PI / 2;
                break;
            default:
                throw new Error(`unsupported orientation: ${options.orientation}`);
        }
        // optional label, centered on the bracket's tip
        let labelNodeBoundsListener;
        if (options.labelNode) {
            const labelNode = options.labelNode;
            this.addChild(labelNode);
            labelNodeBoundsListener = ()=>{
                switch(options.orientation){
                    case 'up':
                        labelNode.centerX = bracketNode.left + options.bracketTipPosition * bracketNode.width;
                        labelNode.bottom = bracketNode.top - options.spacing;
                        break;
                    case 'down':
                        labelNode.centerX = bracketNode.left + options.bracketTipPosition * bracketNode.width;
                        labelNode.top = bracketNode.bottom + options.spacing;
                        break;
                    case 'left':
                        labelNode.right = bracketNode.left - options.spacing;
                        labelNode.centerY = bracketNode.top + options.bracketTipPosition * bracketNode.height;
                        break;
                    case 'right':
                        labelNode.left = bracketNode.right + options.spacing;
                        labelNode.centerY = bracketNode.top + options.bracketTipPosition * bracketNode.height;
                        break;
                    default:
                        throw new Error(`unsupported orientation: ${options.orientation}`);
                }
            };
            labelNode.boundsProperty.link(labelNodeBoundsListener);
        }
        this.mutate(options);
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'BracketNode', this);
        this.disposeBracketNode = ()=>{
            if (options.labelNode && labelNodeBoundsListener && options.labelNode.boundsProperty.hasListener(labelNodeBoundsListener)) {
                options.labelNode.boundsProperty.removeListener(labelNodeBoundsListener);
            }
        };
    }
};
export { BracketNode as default };
sceneryPhet.register('BracketNode', BracketNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9CcmFja2V0Tm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBCcmFja2V0Tm9kZSBkcmF3cyBhIGJyYWNrZXQgd2l0aCBhbiBvcHRpb25hbCBsYWJlbC5cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBJbnN0YW5jZVJlZ2lzdHJ5IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9kb2N1bWVudGF0aW9uL0luc3RhbmNlUmVnaXN0cnkuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCB7IE5vZGUsIE5vZGVPcHRpb25zLCBQYXRoLCBUUGFpbnQgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuXG50eXBlIEJyYWNrZXROb2RlT3JpZW50YXRpb24gPSAnbGVmdCcgfCAncmlnaHQnIHwgJ3VwJyB8ICdkb3duJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyByZWZlcnMgdG8gdGhlIGRpcmVjdGlvbiB0aGF0IHRoZSB0aXAgb2YgdGhlIGJyYWNrZXQgcG9pbnRzXG4gIG9yaWVudGF0aW9uPzogQnJhY2tldE5vZGVPcmllbnRhdGlvbjtcblxuICAvLyBvcHRpb25hbCBsYWJlbCB0aGF0IHdpbGwgYmUgY2VudGVyZWQgYmVsb3cgYnJhY2tldCdzIHRpcFxuICBsYWJlbE5vZGU/OiBOb2RlIHwgbnVsbDtcblxuICAvLyBsZW5ndGggb2YgdGhlIGJyYWNrZXRcbiAgYnJhY2tldExlbmd0aD86IG51bWJlcjtcblxuICAvLyBbMCwxXSBleGNsdXNpdmUsIGRldGVybWluZXMgd2hlcmUgYWxvbmcgdGhlIHdpZHRoIG9mIHRoZSBicmFja2V0IHRoZSB0aXAgKGFuZCBvcHRpb25hbCBsYWJlbCkgYXJlIHBsYWNlZFxuICBicmFja2V0VGlwUG9zaXRpb24/OiBudW1iZXI7XG5cbiAgLy8gcmFkaXVzIG9mIHRoZSBhcmNzIGF0IHRoZSBlbmRzIG9mIHRoZSBicmFja2V0XG4gIGJyYWNrZXRFbmRSYWRpdXM/OiBudW1iZXI7XG5cbiAgLy8gcmFkaXVzIG9mIHRoZSBhcmNzIGF0IHRoZSB0aXAgKGNlbnRlcikgb2YgdGhlIGJyYWNrZXRcbiAgYnJhY2tldFRpcFJhZGl1cz86IG51bWJlcjtcblxuICAvLyBjb2xvciBvZiB0aGUgYnJhY2tldFxuICBicmFja2V0U3Ryb2tlPzogVFBhaW50O1xuXG4gIC8vIGxpbmUgd2lkdGggKHRoaWNrbmVzcykgb2YgdGhlIGJyYWNrZXRcbiAgYnJhY2tldExpbmVXaWR0aD86IG51bWJlcjtcblxuICAvLyBzcGFjZSBiZXR3ZWVuIG9wdGlvbmFsIGxhYmVsIGFuZCB0aXAgb2YgYnJhY2tldFxuICBzcGFjaW5nPzogbnVtYmVyO1xufTtcblxuZXhwb3J0IHR5cGUgQnJhY2tldE5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBOb2RlT3B0aW9ucztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnJhY2tldE5vZGUgZXh0ZW5kcyBOb2RlIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VCcmFja2V0Tm9kZTogKCkgPT4gdm9pZDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IEJyYWNrZXROb2RlT3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8QnJhY2tldE5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gU2VsZk9wdGlvbnNcbiAgICAgIG9yaWVudGF0aW9uOiAnZG93bicsXG4gICAgICBsYWJlbE5vZGU6IG51bGwsXG4gICAgICBicmFja2V0TGVuZ3RoOiAxMDAsXG4gICAgICBicmFja2V0VGlwUG9zaXRpb246IDAuNSxcbiAgICAgIGJyYWNrZXRFbmRSYWRpdXM6IDUsXG4gICAgICBicmFja2V0VGlwUmFkaXVzOiA2LFxuICAgICAgYnJhY2tldFN0cm9rZTogJ2JsYWNrJyxcbiAgICAgIGJyYWNrZXRMaW5lV2lkdGg6IDEsXG4gICAgICBzcGFjaW5nOiAyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAvLyB2YWxpZGF0ZSBvcHRpb25zXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5icmFja2V0VGlwUG9zaXRpb24gPiAwICYmIG9wdGlvbnMuYnJhY2tldFRpcFBvc2l0aW9uIDwgMSApO1xuXG4gICAgc3VwZXIoKTtcblxuICAgIC8vIGNvbXB1dGUgdGlwIHBvc2l0aW9uXG4gICAgbGV0IHRpcFg7XG4gICAgaWYgKCBvcHRpb25zLm9yaWVudGF0aW9uID09PSAnZG93bicgfHwgb3B0aW9ucy5vcmllbnRhdGlvbiA9PT0gJ2xlZnQnICkge1xuICAgICAgdGlwWCA9IG9wdGlvbnMuYnJhY2tldFRpcFBvc2l0aW9uICogb3B0aW9ucy5icmFja2V0TGVuZ3RoO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRpcFggPSAoIDEgLSBvcHRpb25zLmJyYWNrZXRUaXBQb3NpdGlvbiApICogb3B0aW9ucy5icmFja2V0TGVuZ3RoO1xuICAgIH1cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aXBYID4gKCBvcHRpb25zLmJyYWNrZXRFbmRSYWRpdXMgKyBvcHRpb25zLmJyYWNrZXRUaXBSYWRpdXMgKSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRpcFggPCBvcHRpb25zLmJyYWNrZXRMZW5ndGggLSAoIG9wdGlvbnMuYnJhY2tldEVuZFJhZGl1cyArIG9wdGlvbnMuYnJhY2tldFRpcFJhZGl1cyApICk7XG5cbiAgICAvLyBicmFja2V0IHNoYXBlLCBjcmVhdGVkIGZvciAnZG93bicgb3JpZW50YXRpb24sIGxlZnQtdG8tcmlnaHRcbiAgICBjb25zdCBicmFja2V0U2hhcGUgPSBuZXcgU2hhcGUoKVxuICAgICAgLy8gbGVmdCBlbmQgY3VydmVzIHVwXG4gICAgICAuYXJjKCBvcHRpb25zLmJyYWNrZXRFbmRSYWRpdXMsIDAsIG9wdGlvbnMuYnJhY2tldEVuZFJhZGl1cywgTWF0aC5QSSwgMC41ICogTWF0aC5QSSwgdHJ1ZSApXG4gICAgICAubGluZVRvKCB0aXBYIC0gb3B0aW9ucy5icmFja2V0VGlwUmFkaXVzLCBvcHRpb25zLmJyYWNrZXRFbmRSYWRpdXMgKVxuICAgICAgLy8gdGlwIHBvaW50cyBkb3duXG4gICAgICAuYXJjKCB0aXBYIC0gb3B0aW9ucy5icmFja2V0VGlwUmFkaXVzLCBvcHRpb25zLmJyYWNrZXRFbmRSYWRpdXMgKyBvcHRpb25zLmJyYWNrZXRUaXBSYWRpdXMsIG9wdGlvbnMuYnJhY2tldFRpcFJhZGl1cywgMS41ICogTWF0aC5QSSwgMCApXG4gICAgICAuYXJjKCB0aXBYICsgb3B0aW9ucy5icmFja2V0VGlwUmFkaXVzLCBvcHRpb25zLmJyYWNrZXRFbmRSYWRpdXMgKyBvcHRpb25zLmJyYWNrZXRUaXBSYWRpdXMsIG9wdGlvbnMuYnJhY2tldFRpcFJhZGl1cywgTWF0aC5QSSwgMS41ICogTWF0aC5QSSApXG4gICAgICAvLyByaWdodCBlbmQgY3VydmVzIHVwXG4gICAgICAubGluZVRvKCBvcHRpb25zLmJyYWNrZXRMZW5ndGggLSBvcHRpb25zLmJyYWNrZXRFbmRSYWRpdXMsIG9wdGlvbnMuYnJhY2tldEVuZFJhZGl1cyApXG4gICAgICAuYXJjKCBvcHRpb25zLmJyYWNrZXRMZW5ndGggLSBvcHRpb25zLmJyYWNrZXRFbmRSYWRpdXMsIDAsIG9wdGlvbnMuYnJhY2tldEVuZFJhZGl1cywgMC41ICogTWF0aC5QSSwgMCwgdHJ1ZSApO1xuXG4gICAgLy8gYnJhY2tldCBub2RlXG4gICAgY29uc3QgYnJhY2tldE5vZGUgPSBuZXcgUGF0aCggYnJhY2tldFNoYXBlLCB7XG4gICAgICBzdHJva2U6IG9wdGlvbnMuYnJhY2tldFN0cm9rZSxcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5icmFja2V0TGluZVdpZHRoXG4gICAgfSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIGJyYWNrZXROb2RlICk7XG5cbiAgICAvLyBwdXQgdGhlIGJyYWNrZXQgaW4gdGhlIGNvcnJlY3Qgb3JpZW50YXRpb25cbiAgICBzd2l0Y2goIG9wdGlvbnMub3JpZW50YXRpb24gKSB7XG4gICAgICBjYXNlICd1cCc6XG4gICAgICAgIGJyYWNrZXROb2RlLnJvdGF0aW9uID0gTWF0aC5QSTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgLy8gZG8gbm90aGluZywgdGhpcyBpcyBob3cgdGhlIHNoYXBlIHdhcyBjcmVhdGVkXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgIGJyYWNrZXROb2RlLnJvdGF0aW9uID0gTWF0aC5QSSAvIDI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICBicmFja2V0Tm9kZS5yb3RhdGlvbiA9IC1NYXRoLlBJIC8gMjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGB1bnN1cHBvcnRlZCBvcmllbnRhdGlvbjogJHtvcHRpb25zLm9yaWVudGF0aW9ufWAgKTtcbiAgICB9XG5cbiAgICAvLyBvcHRpb25hbCBsYWJlbCwgY2VudGVyZWQgb24gdGhlIGJyYWNrZXQncyB0aXBcbiAgICBsZXQgbGFiZWxOb2RlQm91bmRzTGlzdGVuZXI6ICgpID0+IHZvaWQ7XG4gICAgaWYgKCBvcHRpb25zLmxhYmVsTm9kZSApIHtcblxuICAgICAgY29uc3QgbGFiZWxOb2RlID0gb3B0aW9ucy5sYWJlbE5vZGU7XG4gICAgICB0aGlzLmFkZENoaWxkKCBsYWJlbE5vZGUgKTtcblxuICAgICAgbGFiZWxOb2RlQm91bmRzTGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgICAgIHN3aXRjaCggb3B0aW9ucy5vcmllbnRhdGlvbiApIHtcbiAgICAgICAgICBjYXNlICd1cCc6XG4gICAgICAgICAgICBsYWJlbE5vZGUuY2VudGVyWCA9IGJyYWNrZXROb2RlLmxlZnQgKyAoIG9wdGlvbnMuYnJhY2tldFRpcFBvc2l0aW9uICogYnJhY2tldE5vZGUud2lkdGggKTtcbiAgICAgICAgICAgIGxhYmVsTm9kZS5ib3R0b20gPSBicmFja2V0Tm9kZS50b3AgLSBvcHRpb25zLnNwYWNpbmc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgICAgIGxhYmVsTm9kZS5jZW50ZXJYID0gYnJhY2tldE5vZGUubGVmdCArICggb3B0aW9ucy5icmFja2V0VGlwUG9zaXRpb24gKiBicmFja2V0Tm9kZS53aWR0aCApO1xuICAgICAgICAgICAgbGFiZWxOb2RlLnRvcCA9IGJyYWNrZXROb2RlLmJvdHRvbSArIG9wdGlvbnMuc3BhY2luZztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgbGFiZWxOb2RlLnJpZ2h0ID0gYnJhY2tldE5vZGUubGVmdCAtIG9wdGlvbnMuc3BhY2luZztcbiAgICAgICAgICAgIGxhYmVsTm9kZS5jZW50ZXJZID0gYnJhY2tldE5vZGUudG9wICsgKCBvcHRpb25zLmJyYWNrZXRUaXBQb3NpdGlvbiAqIGJyYWNrZXROb2RlLmhlaWdodCApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgbGFiZWxOb2RlLmxlZnQgPSBicmFja2V0Tm9kZS5yaWdodCArIG9wdGlvbnMuc3BhY2luZztcbiAgICAgICAgICAgIGxhYmVsTm9kZS5jZW50ZXJZID0gYnJhY2tldE5vZGUudG9wICsgKCBvcHRpb25zLmJyYWNrZXRUaXBQb3NpdGlvbiAqIGJyYWNrZXROb2RlLmhlaWdodCApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciggYHVuc3VwcG9ydGVkIG9yaWVudGF0aW9uOiAke29wdGlvbnMub3JpZW50YXRpb259YCApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgbGFiZWxOb2RlLmJvdW5kc1Byb3BlcnR5LmxpbmsoIGxhYmVsTm9kZUJvdW5kc0xpc3RlbmVyICk7XG4gICAgfVxuXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcblxuICAgIC8vIHN1cHBvcnQgZm9yIGJpbmRlciBkb2N1bWVudGF0aW9uLCBzdHJpcHBlZCBvdXQgaW4gYnVpbGRzIGFuZCBvbmx5IHJ1bnMgd2hlbiA/YmluZGVyIGlzIHNwZWNpZmllZFxuICAgIGFzc2VydCAmJiB3aW5kb3cucGhldD8uY2hpcHBlcj8ucXVlcnlQYXJhbWV0ZXJzPy5iaW5kZXIgJiYgSW5zdGFuY2VSZWdpc3RyeS5yZWdpc3RlckRhdGFVUkwoICdzY2VuZXJ5LXBoZXQnLCAnQnJhY2tldE5vZGUnLCB0aGlzICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VCcmFja2V0Tm9kZSA9ICgpID0+IHtcbiAgICAgIGlmICggb3B0aW9ucy5sYWJlbE5vZGUgJiYgbGFiZWxOb2RlQm91bmRzTGlzdGVuZXIgJiYgb3B0aW9ucy5sYWJlbE5vZGUuYm91bmRzUHJvcGVydHkuaGFzTGlzdGVuZXIoIGxhYmVsTm9kZUJvdW5kc0xpc3RlbmVyICkgKSB7XG4gICAgICAgIG9wdGlvbnMubGFiZWxOb2RlLmJvdW5kc1Byb3BlcnR5LnJlbW92ZUxpc3RlbmVyKCBsYWJlbE5vZGVCb3VuZHNMaXN0ZW5lciApO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2VCcmFja2V0Tm9kZSgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ0JyYWNrZXROb2RlJywgQnJhY2tldE5vZGUgKTsiXSwibmFtZXMiOlsiU2hhcGUiLCJJbnN0YW5jZVJlZ2lzdHJ5Iiwib3B0aW9uaXplIiwiTm9kZSIsIlBhdGgiLCJzY2VuZXJ5UGhldCIsIkJyYWNrZXROb2RlIiwiZGlzcG9zZSIsImRpc3Bvc2VCcmFja2V0Tm9kZSIsInByb3ZpZGVkT3B0aW9ucyIsIndpbmRvdyIsIm9wdGlvbnMiLCJvcmllbnRhdGlvbiIsImxhYmVsTm9kZSIsImJyYWNrZXRMZW5ndGgiLCJicmFja2V0VGlwUG9zaXRpb24iLCJicmFja2V0RW5kUmFkaXVzIiwiYnJhY2tldFRpcFJhZGl1cyIsImJyYWNrZXRTdHJva2UiLCJicmFja2V0TGluZVdpZHRoIiwic3BhY2luZyIsImFzc2VydCIsInRpcFgiLCJicmFja2V0U2hhcGUiLCJhcmMiLCJNYXRoIiwiUEkiLCJsaW5lVG8iLCJicmFja2V0Tm9kZSIsInN0cm9rZSIsImxpbmVXaWR0aCIsImFkZENoaWxkIiwicm90YXRpb24iLCJFcnJvciIsImxhYmVsTm9kZUJvdW5kc0xpc3RlbmVyIiwiY2VudGVyWCIsImxlZnQiLCJ3aWR0aCIsImJvdHRvbSIsInRvcCIsInJpZ2h0IiwiY2VudGVyWSIsImhlaWdodCIsImJvdW5kc1Byb3BlcnR5IiwibGluayIsIm11dGF0ZSIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwiYmluZGVyIiwicmVnaXN0ZXJEYXRhVVJMIiwiaGFzTGlzdGVuZXIiLCJyZW1vdmVMaXN0ZW5lciIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELFNBQVNBLEtBQUssUUFBUSwyQkFBMkI7QUFDakQsT0FBT0Msc0JBQXNCLHVEQUF1RDtBQUNwRixPQUFPQyxlQUFlLGtDQUFrQztBQUN4RCxTQUFTQyxJQUFJLEVBQWVDLElBQUksUUFBZ0IsOEJBQThCO0FBQzlFLE9B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