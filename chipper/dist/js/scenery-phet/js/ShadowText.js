// Copyright 2014-2024, University of Colorado Boulder
/**
 * Text with a drop shadow.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import optionize from '../../phet-core/js/optionize.js';
import { Node, Text } from '../../scenery/js/imports.js';
import PhetFont from './PhetFont.js';
import sceneryPhet from './sceneryPhet.js';
let ShadowText = class ShadowText extends Node {
    constructor(text, providedOptions){
        const options = optionize()({
            // SelfOptions
            font: new PhetFont(24),
            fill: 'lightGray',
            stroke: null,
            shadowFill: 'black',
            shadowXOffset: 3,
            shadowYOffset: 1
        }, providedOptions);
        options.children = [
            // background (shadow)
            new Text(text, {
                font: options.font,
                fill: options.shadowFill,
                x: options.shadowXOffset,
                y: options.shadowYOffset
            }),
            // foreground
            new Text(text, {
                font: options.font,
                fill: options.fill,
                stroke: options.stroke
            })
        ];
        super(options);
    }
};
export { ShadowText as default };
sceneryPhet.register('ShadowText', ShadowText);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TaGFkb3dUZXh0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRleHQgd2l0aCBhIGRyb3Agc2hhZG93LlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCB7IEZvbnQsIE5vZGUsIE5vZGVPcHRpb25zLCBUZXh0LCBUUGFpbnQgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4vUGhldEZvbnQuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuXG4gIGZvbnQ/OiBGb250O1xuXG4gIC8vIGZvciBmb3JlZ3JvdW5kIFRleHQgbm9kZVxuICBmaWxsPzogVFBhaW50O1xuICBzdHJva2U/OiBUUGFpbnQ7XG5cbiAgLy8gZm9yIGJhY2tncm91bmQgKHNoYWRvdykgVGV4dCBub2RlXG4gIHNoYWRvd0ZpbGw/OiBUUGFpbnQ7XG4gIHNoYWRvd1hPZmZzZXQ/OiBudW1iZXI7XG4gIHNoYWRvd1lPZmZzZXQ/OiBudW1iZXI7XG59O1xuXG5leHBvcnQgdHlwZSBTaGFkb3dUZXh0T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxOb2RlT3B0aW9ucywgJ2NoaWxkcmVuJz47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNoYWRvd1RleHQgZXh0ZW5kcyBOb2RlIHtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRleHQ6IHN0cmluZywgcHJvdmlkZWRPcHRpb25zPzogU2hhZG93VGV4dE9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFNoYWRvd1RleHRPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gU2VsZk9wdGlvbnNcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMjQgKSxcbiAgICAgIGZpbGw6ICdsaWdodEdyYXknLFxuICAgICAgc3Ryb2tlOiBudWxsLFxuICAgICAgc2hhZG93RmlsbDogJ2JsYWNrJyxcbiAgICAgIHNoYWRvd1hPZmZzZXQ6IDMsXG4gICAgICBzaGFkb3dZT2Zmc2V0OiAxXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBvcHRpb25zLmNoaWxkcmVuID0gW1xuXG4gICAgICAvLyBiYWNrZ3JvdW5kIChzaGFkb3cpXG4gICAgICBuZXcgVGV4dCggdGV4dCwge1xuICAgICAgICBmb250OiBvcHRpb25zLmZvbnQsXG4gICAgICAgIGZpbGw6IG9wdGlvbnMuc2hhZG93RmlsbCxcbiAgICAgICAgeDogb3B0aW9ucy5zaGFkb3dYT2Zmc2V0LFxuICAgICAgICB5OiBvcHRpb25zLnNoYWRvd1lPZmZzZXRcbiAgICAgIH0gKSxcblxuICAgICAgLy8gZm9yZWdyb3VuZFxuICAgICAgbmV3IFRleHQoIHRleHQsIHtcbiAgICAgICAgZm9udDogb3B0aW9ucy5mb250LFxuICAgICAgICBmaWxsOiBvcHRpb25zLmZpbGwsXG4gICAgICAgIHN0cm9rZTogb3B0aW9ucy5zdHJva2VcbiAgICAgIH0gKVxuICAgIF07XG5cbiAgICBzdXBlciggb3B0aW9ucyApO1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnU2hhZG93VGV4dCcsIFNoYWRvd1RleHQgKTsiXSwibmFtZXMiOlsib3B0aW9uaXplIiwiTm9kZSIsIlRleHQiLCJQaGV0Rm9udCIsInNjZW5lcnlQaGV0IiwiU2hhZG93VGV4dCIsInRleHQiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiZm9udCIsImZpbGwiLCJzdHJva2UiLCJzaGFkb3dGaWxsIiwic2hhZG93WE9mZnNldCIsInNoYWRvd1lPZmZzZXQiLCJjaGlsZHJlbiIsIngiLCJ5IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsZUFBZSxrQ0FBa0M7QUFFeEQsU0FBZUMsSUFBSSxFQUFlQyxJQUFJLFFBQWdCLDhCQUE4QjtBQUNwRixPQUFPQyxjQUFjLGdCQUFnQjtBQUNyQyxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBa0I1QixJQUFBLEFBQU1DLGFBQU4sTUFBTUEsbUJBQW1CSjtJQUV0QyxZQUFvQkssSUFBWSxFQUFFQyxlQUFtQyxDQUFHO1FBRXRFLE1BQU1DLFVBQVVSLFlBQTBEO1lBRXhFLGNBQWM7WUFDZFMsTUFBTSxJQUFJTixTQUFVO1lBQ3BCTyxNQUFNO1lBQ05DLFFBQVE7WUFDUkMsWUFBWTtZQUNaQyxlQUFlO1lBQ2ZDLGVBQWU7UUFDakIsR0FBR1A7UUFFSEMsUUFBUU8sUUFBUSxHQUFHO1lBRWpCLHNCQUFzQjtZQUN0QixJQUFJYixLQUFNSSxNQUFNO2dCQUNkRyxNQUFNRCxRQUFRQyxJQUFJO2dCQUNsQkMsTUFBTUYsUUFBUUksVUFBVTtnQkFDeEJJLEdBQUdSLFFBQVFLLGFBQWE7Z0JBQ3hCSSxHQUFHVCxRQUFRTSxhQUFhO1lBQzFCO1lBRUEsYUFBYTtZQUNiLElBQUlaLEtBQU1JLE1BQU07Z0JBQ2RHLE1BQU1ELFFBQVFDLElBQUk7Z0JBQ2xCQyxNQUFNRixRQUFRRSxJQUFJO2dCQUNsQkMsUUFBUUgsUUFBUUcsTUFBTTtZQUN4QjtTQUNEO1FBRUQsS0FBSyxDQUFFSDtJQUNUO0FBQ0Y7QUFuQ0EsU0FBcUJILHdCQW1DcEI7QUFFREQsWUFBWWMsUUFBUSxDQUFFLGNBQWNiIn0=