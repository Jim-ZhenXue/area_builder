// Copyright 2017-2024, University of Colorado Boulder
/**
 * KeyNode looks like a keyboard key. It has a shadow rectangle under the key icon, with a slight offset so that it
 * has a 3D appearance.  KeyNodes are primarily used for accessibility to provide extra information about keyboard
 * navigation and functionality, but an icon could be used for any purpose.
 *
 * Each KeyNode has the same height by default, and icon will be scaled down if it is too large to maintain the proper
 * key height. The width will expand based on padding and the width of the icon in order to surround content fully.
 *
 * @author Jesse Greenberg
 */ import Bounds2 from '../../../dot/js/Bounds2.js';
import optionize from '../../../phet-core/js/optionize.js';
import { AlignBox, Node, Rectangle } from '../../../scenery/js/imports.js';
import sceneryPhet from '../sceneryPhet.js';
let KeyNode = class KeyNode extends Node {
    constructor(keyIcon, providedOptions){
        const options = optionize()({
            keyFill: 'white',
            keyShadowFill: 'black',
            lineWidth: 1.3,
            cornerRadius: 2,
            xShadowOffset: 1.7,
            yShadowOffset: 1.7,
            xMargin: 0,
            yMargin: 0,
            xAlign: 'center',
            yAlign: 'center',
            xPadding: 4,
            yPadding: 4,
            keyHeight: 23,
            minKeyWidth: 23,
            forceSquareKey: false
        }, providedOptions);
        // Add the height scale to a new node based on the height, with keyIcon as a child so that we don't mutate the parameter node.
        const heightScaleNode = new Node({
            children: [
                keyIcon
            ]
        });
        // Add the scale to a new node based on the width
        const widthScaleNode = new Node({
            children: [
                heightScaleNode
            ]
        });
        // place content in an align box so that the key surrounding the icon has minimum bounds calculated above
        // with support for margins
        const content = new AlignBox(widthScaleNode, {
            xAlign: options.xAlign,
            yAlign: options.yAlign,
            xMargin: options.xMargin,
            yMargin: options.yMargin
        });
        // background (shadow rectangle)
        const backgroundShadow = new Rectangle(0, 0, 1, 1, options.cornerRadius, options.cornerRadius, {
            fill: options.keyShadowFill
        });
        // foreground
        const whiteForeground = new Rectangle(0, 0, 1, 1, options.cornerRadius, options.cornerRadius, {
            fill: options.keyFill,
            stroke: 'black',
            lineWidth: options.lineWidth
        });
        const listener = ()=>{
            // scale down the size of the keyIcon passed in if it is taller than the max height of the icon
            let heightScalar = 1;
            const availableHeightForKeyIcon = options.keyHeight - options.yPadding; // adjust for the vertical margin
            if (keyIcon.height > availableHeightForKeyIcon) {
                heightScalar = availableHeightForKeyIcon / keyIcon.height;
            }
            heightScaleNode.setScaleMagnitude(heightScalar);
            // Set the keyWidth to either be the minimum, or the width of the icon + padding, which ever is larger.
            let keyWidth = Math.max(options.minKeyWidth, heightScaleNode.width + options.xPadding);
            // Make the width the same as the height by scaling down the icon if necessary
            if (options.forceSquareKey) {
                // If we are forcing square, we may have to scale the node down to fit
                const availableWidthForKeyIcon = options.minKeyWidth - options.xPadding; // adjust for the horizontal margin
                let widthScalar = 1;
                if (keyIcon.width > availableWidthForKeyIcon) {
                    widthScalar = availableWidthForKeyIcon / keyIcon.width;
                }
                // Set the width to the height to make sure the alignBounds below are set correctly as a square.
                keyWidth = options.keyHeight;
                widthScaleNode.setScaleMagnitude(widthScalar);
            }
            content.setAlignBounds(new Bounds2(0, 0, keyWidth, options.keyHeight));
            backgroundShadow.setRectBounds(content.bounds.shiftedXY(options.xShadowOffset, options.yShadowOffset));
            whiteForeground.setRectBounds(content.bounds);
        };
        keyIcon.boundsProperty.link(listener);
        // children of the icon node, including the background shadow, foreground key, and content icon
        options.children = [
            backgroundShadow,
            whiteForeground,
            // content on top
            content
        ];
        super(options);
        this.disposeEmitter.addListener(()=>keyIcon.boundsProperty.unlink(listener));
    }
};
export { KeyNode as default };
sceneryPhet.register('KeyNode', KeyNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9rZXlib2FyZC9LZXlOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEtleU5vZGUgbG9va3MgbGlrZSBhIGtleWJvYXJkIGtleS4gSXQgaGFzIGEgc2hhZG93IHJlY3RhbmdsZSB1bmRlciB0aGUga2V5IGljb24sIHdpdGggYSBzbGlnaHQgb2Zmc2V0IHNvIHRoYXQgaXRcbiAqIGhhcyBhIDNEIGFwcGVhcmFuY2UuICBLZXlOb2RlcyBhcmUgcHJpbWFyaWx5IHVzZWQgZm9yIGFjY2Vzc2liaWxpdHkgdG8gcHJvdmlkZSBleHRyYSBpbmZvcm1hdGlvbiBhYm91dCBrZXlib2FyZFxuICogbmF2aWdhdGlvbiBhbmQgZnVuY3Rpb25hbGl0eSwgYnV0IGFuIGljb24gY291bGQgYmUgdXNlZCBmb3IgYW55IHB1cnBvc2UuXG4gKlxuICogRWFjaCBLZXlOb2RlIGhhcyB0aGUgc2FtZSBoZWlnaHQgYnkgZGVmYXVsdCwgYW5kIGljb24gd2lsbCBiZSBzY2FsZWQgZG93biBpZiBpdCBpcyB0b28gbGFyZ2UgdG8gbWFpbnRhaW4gdGhlIHByb3BlclxuICoga2V5IGhlaWdodC4gVGhlIHdpZHRoIHdpbGwgZXhwYW5kIGJhc2VkIG9uIHBhZGRpbmcgYW5kIHRoZSB3aWR0aCBvZiB0aGUgaWNvbiBpbiBvcmRlciB0byBzdXJyb3VuZCBjb250ZW50IGZ1bGx5LlxuICpcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXG4gKi9cblxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCB7IEFsaWduQm94LCBOb2RlLCBOb2RlT3B0aW9ucywgUmVjdGFuZ2xlLCBUQ29sb3IgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4uL3NjZW5lcnlQaGV0LmpzJztcblxudHlwZSBYQWxpZ24gPSAnbGVmdCcgfCAnY2VudGVyJyB8ICdyaWdodCc7XG50eXBlIFlBbGlnbiA9ICd0b3AnIHwgJ2NlbnRlcicgfCAnYm90dG9tJztcblxuLy8gQWxsIHdpZHRocywgb2Zmc2V0cywgYW5kIGhlaWdodCB2YWx1ZXMgYXJlIGluIHRoZSBTY3JlZW5WaWV3IGNvb3JkaW5hdGUgZnJhbWUuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuXG4gIC8vIGNvbG9yIGFuZCBzdHlsaW5nXG4gIGtleUZpbGw/OiBUQ29sb3I7XG4gIGtleVNoYWRvd0ZpbGw/OiBUQ29sb3I7XG4gIGxpbmVXaWR0aD86IG51bWJlcjsgLy8gbGluZSB3aWR0aCBmb3IgdGhlIGtleSBpY29uXG4gIGNvcm5lclJhZGl1cz86IG51bWJlcjsgLy8gY29ybmVyIHJhZGl1cyBhcHBsaWVkIHRvIHRoZSBrZXkgYW5kIGl0cyBzaGFkb3dcblxuICAvLyBvZmZzZXQgZm9yIHRoZSBzaGFkb3cgcmVjdGFuZ2xlIHJlbGF0aXZlIHRvIHRoZSB0b3AgbGVmdCBjb3JuZXIgb2YgdGhlIGtleVxuICB4U2hhZG93T2Zmc2V0PzogbnVtYmVyO1xuICB5U2hhZG93T2Zmc2V0PzogbnVtYmVyO1xuXG4gIC8vIG1hcmdpbnMgc2V0IGJ5IEFsaWduQm94XG4gIHhNYXJnaW4/OiBudW1iZXI7IC8vIHNldHMgdGhlIGhvcml6b250YWwgbWFyZ2luIGZvciB0aGUgaWNvbiBmcm9tIHRoZSBsZWZ0L3JpZ2h0IGVkZ2VcbiAgeU1hcmdpbj86IG51bWJlcjsgLy8gc2V0IHRoZSB2ZXJ0aWNhbCBtYXJnaW4gZm9yIHRoZSBpY29uIGZyb20gdGhlIHRvcC9ib3R0b24gZWRnZXNcblxuICAvLyBpY29uIGFsaWduZWQgaW4gY2VudGVyIG9mIGtleSBieSBkZWZhdWx0XG4gIHhBbGlnbj86IFhBbGlnbjtcbiAgeUFsaWduPzogWUFsaWduO1xuXG4gIC8vIHggYW5kIHkgcGFkZGluZyBhcm91bmQgdGhlIGljb24sIHdpbGwgaW5jcmVhc2UgdGhlIHNpemUgb2YgdGhlIGtleSBpZiB0aGVyZSBpcyBhdmFpbGFibGUgc3BhY2UsXG4gIC8vIG9yIHNjYWxlIGRvd24gdGhlIGljb24gaWYga2V5IGlzIGF0IG1heCB3aWR0aCBvciBoZWlnaHRcbiAgeFBhZGRpbmc/OiBudW1iZXI7XG4gIHlQYWRkaW5nPzogbnVtYmVyO1xuXG4gIC8vIEtleSB3aWxsIGJlIGF0IGxlYXN0IHRoaXMgd2lkZSwgbWFraW5nIGl0IHBvc3NpYmxlIHRvIHN1cnJvdW5kIHRoZSBpY29uIHdpdGggZXh0cmEgc3BhY2UgaWYgbmVjZXNzYXJ5LlxuICAvLyBUaGUgbWluaW11bSB3aWR0aCBvZiB0aGUgS2V5Tm9kZSBhbGxvd2VkLCBpZiB0aGUgaWNvbiBpcyB3aWRlciwgdGhhbiBpdCB3aWxsIGV4cGFuZCBncmFjZWZ1bGx5XG4gIG1pbktleVdpZHRoPzogbnVtYmVyO1xuXG4gIC8vIHRoZSBkZXNpcmVkIGhlaWdodCBvZiB0aGUgS2V5Tm9kZTsgaWNvbiB3aWxsIGJlIHNjYWxlZCBkb3duIGlmIHRvbyBiaWdcbiAga2V5SGVpZ2h0PzogbnVtYmVyO1xuXG4gIC8vIEZvcmNlIHRoZSB3aWR0aCBvZiB0aGUgS2V5Tm9kZSB0byBiZSB0aGUgc2FtZSB3aWR0aCBhcyBoZWlnaHQsIGJhc2VkIG9uIHRoZSBoZWlnaHQuXG4gIC8vIFdpbGwgc2NhbGUgZG93biB0aGUgaWNvbiBpZiB0b28gd2lkZS5cbiAgZm9yY2VTcXVhcmVLZXk/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgS2V5Tm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8Tm9kZU9wdGlvbnMsICdjaGlsZHJlbic+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLZXlOb2RlIGV4dGVuZHMgTm9kZSB7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBrZXlJY29uOiBOb2RlLCBwcm92aWRlZE9wdGlvbnM/OiBLZXlOb2RlT3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8S2V5Tm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xuICAgICAga2V5RmlsbDogJ3doaXRlJyxcbiAgICAgIGtleVNoYWRvd0ZpbGw6ICdibGFjaycsXG4gICAgICBsaW5lV2lkdGg6IDEuMyxcbiAgICAgIGNvcm5lclJhZGl1czogMixcbiAgICAgIHhTaGFkb3dPZmZzZXQ6IDEuNyxcbiAgICAgIHlTaGFkb3dPZmZzZXQ6IDEuNyxcbiAgICAgIHhNYXJnaW46IDAsXG4gICAgICB5TWFyZ2luOiAwLFxuICAgICAgeEFsaWduOiAnY2VudGVyJyxcbiAgICAgIHlBbGlnbjogJ2NlbnRlcicsXG4gICAgICB4UGFkZGluZzogNCxcbiAgICAgIHlQYWRkaW5nOiA0LFxuICAgICAga2V5SGVpZ2h0OiAyMyxcbiAgICAgIG1pbktleVdpZHRoOiAyMywgLy8gZGVmYXVsdCBlcXVhbCB0byBrZXlIZWlnaHQsIGEgc3F1YXJlIGtleSBhcyB0aGUgbWluaW11bS5cbiAgICAgIGZvcmNlU3F1YXJlS2V5OiBmYWxzZVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gQWRkIHRoZSBoZWlnaHQgc2NhbGUgdG8gYSBuZXcgbm9kZSBiYXNlZCBvbiB0aGUgaGVpZ2h0LCB3aXRoIGtleUljb24gYXMgYSBjaGlsZCBzbyB0aGF0IHdlIGRvbid0IG11dGF0ZSB0aGUgcGFyYW1ldGVyIG5vZGUuXG4gICAgY29uc3QgaGVpZ2h0U2NhbGVOb2RlID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsga2V5SWNvbiBdIH0gKTtcblxuICAgIC8vIEFkZCB0aGUgc2NhbGUgdG8gYSBuZXcgbm9kZSBiYXNlZCBvbiB0aGUgd2lkdGhcbiAgICBjb25zdCB3aWR0aFNjYWxlTm9kZSA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGhlaWdodFNjYWxlTm9kZSBdIH0gKTtcblxuICAgIC8vIHBsYWNlIGNvbnRlbnQgaW4gYW4gYWxpZ24gYm94IHNvIHRoYXQgdGhlIGtleSBzdXJyb3VuZGluZyB0aGUgaWNvbiBoYXMgbWluaW11bSBib3VuZHMgY2FsY3VsYXRlZCBhYm92ZVxuICAgIC8vIHdpdGggc3VwcG9ydCBmb3IgbWFyZ2luc1xuICAgIGNvbnN0IGNvbnRlbnQgPSBuZXcgQWxpZ25Cb3goIHdpZHRoU2NhbGVOb2RlLCB7XG4gICAgICB4QWxpZ246IG9wdGlvbnMueEFsaWduLFxuICAgICAgeUFsaWduOiBvcHRpb25zLnlBbGlnbixcbiAgICAgIHhNYXJnaW46IG9wdGlvbnMueE1hcmdpbixcbiAgICAgIHlNYXJnaW46IG9wdGlvbnMueU1hcmdpblxuICAgIH0gKTtcblxuICAgIC8vIGJhY2tncm91bmQgKHNoYWRvdyByZWN0YW5nbGUpXG4gICAgY29uc3QgYmFja2dyb3VuZFNoYWRvdyA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEsIDEsIG9wdGlvbnMuY29ybmVyUmFkaXVzLCBvcHRpb25zLmNvcm5lclJhZGl1cywge1xuICAgICAgZmlsbDogb3B0aW9ucy5rZXlTaGFkb3dGaWxsXG4gICAgfSApO1xuXG4gICAgLy8gZm9yZWdyb3VuZFxuICAgIGNvbnN0IHdoaXRlRm9yZWdyb3VuZCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEsIDEsIG9wdGlvbnMuY29ybmVyUmFkaXVzLCBvcHRpb25zLmNvcm5lclJhZGl1cywge1xuICAgICAgZmlsbDogb3B0aW9ucy5rZXlGaWxsLFxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLmxpbmVXaWR0aFxuICAgIH0gKTtcblxuICAgIGNvbnN0IGxpc3RlbmVyID0gKCkgPT4ge1xuXG4gICAgICAvLyBzY2FsZSBkb3duIHRoZSBzaXplIG9mIHRoZSBrZXlJY29uIHBhc3NlZCBpbiBpZiBpdCBpcyB0YWxsZXIgdGhhbiB0aGUgbWF4IGhlaWdodCBvZiB0aGUgaWNvblxuICAgICAgbGV0IGhlaWdodFNjYWxhciA9IDE7XG4gICAgICBjb25zdCBhdmFpbGFibGVIZWlnaHRGb3JLZXlJY29uID0gb3B0aW9ucy5rZXlIZWlnaHQgLSBvcHRpb25zLnlQYWRkaW5nOyAvLyBhZGp1c3QgZm9yIHRoZSB2ZXJ0aWNhbCBtYXJnaW5cbiAgICAgIGlmICgga2V5SWNvbi5oZWlnaHQgPiBhdmFpbGFibGVIZWlnaHRGb3JLZXlJY29uICkge1xuICAgICAgICBoZWlnaHRTY2FsYXIgPSBhdmFpbGFibGVIZWlnaHRGb3JLZXlJY29uIC8ga2V5SWNvbi5oZWlnaHQ7XG4gICAgICB9XG5cbiAgICAgIGhlaWdodFNjYWxlTm9kZS5zZXRTY2FsZU1hZ25pdHVkZSggaGVpZ2h0U2NhbGFyICk7XG5cbiAgICAgIC8vIFNldCB0aGUga2V5V2lkdGggdG8gZWl0aGVyIGJlIHRoZSBtaW5pbXVtLCBvciB0aGUgd2lkdGggb2YgdGhlIGljb24gKyBwYWRkaW5nLCB3aGljaCBldmVyIGlzIGxhcmdlci5cbiAgICAgIGxldCBrZXlXaWR0aCA9IE1hdGgubWF4KCBvcHRpb25zLm1pbktleVdpZHRoLCBoZWlnaHRTY2FsZU5vZGUud2lkdGggKyBvcHRpb25zLnhQYWRkaW5nICk7XG5cbiAgICAgIC8vIE1ha2UgdGhlIHdpZHRoIHRoZSBzYW1lIGFzIHRoZSBoZWlnaHQgYnkgc2NhbGluZyBkb3duIHRoZSBpY29uIGlmIG5lY2Vzc2FyeVxuICAgICAgaWYgKCBvcHRpb25zLmZvcmNlU3F1YXJlS2V5ICkge1xuXG4gICAgICAgIC8vIElmIHdlIGFyZSBmb3JjaW5nIHNxdWFyZSwgd2UgbWF5IGhhdmUgdG8gc2NhbGUgdGhlIG5vZGUgZG93biB0byBmaXRcbiAgICAgICAgY29uc3QgYXZhaWxhYmxlV2lkdGhGb3JLZXlJY29uID0gb3B0aW9ucy5taW5LZXlXaWR0aCAtIG9wdGlvbnMueFBhZGRpbmc7IC8vIGFkanVzdCBmb3IgdGhlIGhvcml6b250YWwgbWFyZ2luXG5cbiAgICAgICAgbGV0IHdpZHRoU2NhbGFyID0gMTtcbiAgICAgICAgaWYgKCBrZXlJY29uLndpZHRoID4gYXZhaWxhYmxlV2lkdGhGb3JLZXlJY29uICkge1xuICAgICAgICAgIHdpZHRoU2NhbGFyID0gYXZhaWxhYmxlV2lkdGhGb3JLZXlJY29uIC8ga2V5SWNvbi53aWR0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCB0aGUgd2lkdGggdG8gdGhlIGhlaWdodCB0byBtYWtlIHN1cmUgdGhlIGFsaWduQm91bmRzIGJlbG93IGFyZSBzZXQgY29ycmVjdGx5IGFzIGEgc3F1YXJlLlxuICAgICAgICBrZXlXaWR0aCA9IG9wdGlvbnMua2V5SGVpZ2h0O1xuXG4gICAgICAgIHdpZHRoU2NhbGVOb2RlLnNldFNjYWxlTWFnbml0dWRlKCB3aWR0aFNjYWxhciApO1xuICAgICAgfVxuXG4gICAgICBjb250ZW50LnNldEFsaWduQm91bmRzKCBuZXcgQm91bmRzMiggMCwgMCwga2V5V2lkdGgsIG9wdGlvbnMua2V5SGVpZ2h0ICkgKTtcbiAgICAgIGJhY2tncm91bmRTaGFkb3cuc2V0UmVjdEJvdW5kcyggY29udGVudC5ib3VuZHMuc2hpZnRlZFhZKFxuICAgICAgICBvcHRpb25zLnhTaGFkb3dPZmZzZXQsIG9wdGlvbnMueVNoYWRvd09mZnNldCApICk7XG4gICAgICB3aGl0ZUZvcmVncm91bmQuc2V0UmVjdEJvdW5kcyggY29udGVudC5ib3VuZHMgKTtcbiAgICB9O1xuICAgIGtleUljb24uYm91bmRzUHJvcGVydHkubGluayggbGlzdGVuZXIgKTtcblxuICAgIC8vIGNoaWxkcmVuIG9mIHRoZSBpY29uIG5vZGUsIGluY2x1ZGluZyB0aGUgYmFja2dyb3VuZCBzaGFkb3csIGZvcmVncm91bmQga2V5LCBhbmQgY29udGVudCBpY29uXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFtcblxuICAgICAgYmFja2dyb3VuZFNoYWRvdyxcbiAgICAgIHdoaXRlRm9yZWdyb3VuZCxcblxuICAgICAgLy8gY29udGVudCBvbiB0b3BcbiAgICAgIGNvbnRlbnRcbiAgICBdO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIHRoaXMuZGlzcG9zZUVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IGtleUljb24uYm91bmRzUHJvcGVydHkudW5saW5rKCBsaXN0ZW5lciApICk7XG4gIH1cbn1cblxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdLZXlOb2RlJywgS2V5Tm9kZSApOyJdLCJuYW1lcyI6WyJCb3VuZHMyIiwib3B0aW9uaXplIiwiQWxpZ25Cb3giLCJOb2RlIiwiUmVjdGFuZ2xlIiwic2NlbmVyeVBoZXQiLCJLZXlOb2RlIiwia2V5SWNvbiIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJrZXlGaWxsIiwia2V5U2hhZG93RmlsbCIsImxpbmVXaWR0aCIsImNvcm5lclJhZGl1cyIsInhTaGFkb3dPZmZzZXQiLCJ5U2hhZG93T2Zmc2V0IiwieE1hcmdpbiIsInlNYXJnaW4iLCJ4QWxpZ24iLCJ5QWxpZ24iLCJ4UGFkZGluZyIsInlQYWRkaW5nIiwia2V5SGVpZ2h0IiwibWluS2V5V2lkdGgiLCJmb3JjZVNxdWFyZUtleSIsImhlaWdodFNjYWxlTm9kZSIsImNoaWxkcmVuIiwid2lkdGhTY2FsZU5vZGUiLCJjb250ZW50IiwiYmFja2dyb3VuZFNoYWRvdyIsImZpbGwiLCJ3aGl0ZUZvcmVncm91bmQiLCJzdHJva2UiLCJsaXN0ZW5lciIsImhlaWdodFNjYWxhciIsImF2YWlsYWJsZUhlaWdodEZvcktleUljb24iLCJoZWlnaHQiLCJzZXRTY2FsZU1hZ25pdHVkZSIsImtleVdpZHRoIiwiTWF0aCIsIm1heCIsIndpZHRoIiwiYXZhaWxhYmxlV2lkdGhGb3JLZXlJY29uIiwid2lkdGhTY2FsYXIiLCJzZXRBbGlnbkJvdW5kcyIsInNldFJlY3RCb3VuZHMiLCJib3VuZHMiLCJzaGlmdGVkWFkiLCJib3VuZHNQcm9wZXJ0eSIsImxpbmsiLCJkaXNwb3NlRW1pdHRlciIsImFkZExpc3RlbmVyIiwidW5saW5rIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7O0NBU0MsR0FFRCxPQUFPQSxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxlQUFlLHFDQUFxQztBQUUzRCxTQUFTQyxRQUFRLEVBQUVDLElBQUksRUFBZUMsU0FBUyxRQUFnQixpQ0FBaUM7QUFDaEcsT0FBT0MsaUJBQWlCLG9CQUFvQjtBQTZDN0IsSUFBQSxBQUFNQyxVQUFOLE1BQU1BLGdCQUFnQkg7SUFFbkMsWUFBb0JJLE9BQWEsRUFBRUMsZUFBZ0MsQ0FBRztRQUVwRSxNQUFNQyxVQUFVUixZQUF1RDtZQUNyRVMsU0FBUztZQUNUQyxlQUFlO1lBQ2ZDLFdBQVc7WUFDWEMsY0FBYztZQUNkQyxlQUFlO1lBQ2ZDLGVBQWU7WUFDZkMsU0FBUztZQUNUQyxTQUFTO1lBQ1RDLFFBQVE7WUFDUkMsUUFBUTtZQUNSQyxVQUFVO1lBQ1ZDLFVBQVU7WUFDVkMsV0FBVztZQUNYQyxhQUFhO1lBQ2JDLGdCQUFnQjtRQUNsQixHQUFHaEI7UUFFSCw4SEFBOEg7UUFDOUgsTUFBTWlCLGtCQUFrQixJQUFJdEIsS0FBTTtZQUFFdUIsVUFBVTtnQkFBRW5CO2FBQVM7UUFBQztRQUUxRCxpREFBaUQ7UUFDakQsTUFBTW9CLGlCQUFpQixJQUFJeEIsS0FBTTtZQUFFdUIsVUFBVTtnQkFBRUQ7YUFBaUI7UUFBQztRQUVqRSx5R0FBeUc7UUFDekcsMkJBQTJCO1FBQzNCLE1BQU1HLFVBQVUsSUFBSTFCLFNBQVV5QixnQkFBZ0I7WUFDNUNULFFBQVFULFFBQVFTLE1BQU07WUFDdEJDLFFBQVFWLFFBQVFVLE1BQU07WUFDdEJILFNBQVNQLFFBQVFPLE9BQU87WUFDeEJDLFNBQVNSLFFBQVFRLE9BQU87UUFDMUI7UUFFQSxnQ0FBZ0M7UUFDaEMsTUFBTVksbUJBQW1CLElBQUl6QixVQUFXLEdBQUcsR0FBRyxHQUFHLEdBQUdLLFFBQVFJLFlBQVksRUFBRUosUUFBUUksWUFBWSxFQUFFO1lBQzlGaUIsTUFBTXJCLFFBQVFFLGFBQWE7UUFDN0I7UUFFQSxhQUFhO1FBQ2IsTUFBTW9CLGtCQUFrQixJQUFJM0IsVUFBVyxHQUFHLEdBQUcsR0FBRyxHQUFHSyxRQUFRSSxZQUFZLEVBQUVKLFFBQVFJLFlBQVksRUFBRTtZQUM3RmlCLE1BQU1yQixRQUFRQyxPQUFPO1lBQ3JCc0IsUUFBUTtZQUNScEIsV0FBV0gsUUFBUUcsU0FBUztRQUM5QjtRQUVBLE1BQU1xQixXQUFXO1lBRWYsK0ZBQStGO1lBQy9GLElBQUlDLGVBQWU7WUFDbkIsTUFBTUMsNEJBQTRCMUIsUUFBUWEsU0FBUyxHQUFHYixRQUFRWSxRQUFRLEVBQUUsaUNBQWlDO1lBQ3pHLElBQUtkLFFBQVE2QixNQUFNLEdBQUdELDJCQUE0QjtnQkFDaERELGVBQWVDLDRCQUE0QjVCLFFBQVE2QixNQUFNO1lBQzNEO1lBRUFYLGdCQUFnQlksaUJBQWlCLENBQUVIO1lBRW5DLHVHQUF1RztZQUN2RyxJQUFJSSxXQUFXQyxLQUFLQyxHQUFHLENBQUUvQixRQUFRYyxXQUFXLEVBQUVFLGdCQUFnQmdCLEtBQUssR0FBR2hDLFFBQVFXLFFBQVE7WUFFdEYsOEVBQThFO1lBQzlFLElBQUtYLFFBQVFlLGNBQWMsRUFBRztnQkFFNUIsc0VBQXNFO2dCQUN0RSxNQUFNa0IsMkJBQTJCakMsUUFBUWMsV0FBVyxHQUFHZCxRQUFRVyxRQUFRLEVBQUUsbUNBQW1DO2dCQUU1RyxJQUFJdUIsY0FBYztnQkFDbEIsSUFBS3BDLFFBQVFrQyxLQUFLLEdBQUdDLDBCQUEyQjtvQkFDOUNDLGNBQWNELDJCQUEyQm5DLFFBQVFrQyxLQUFLO2dCQUN4RDtnQkFFQSxnR0FBZ0c7Z0JBQ2hHSCxXQUFXN0IsUUFBUWEsU0FBUztnQkFFNUJLLGVBQWVVLGlCQUFpQixDQUFFTTtZQUNwQztZQUVBZixRQUFRZ0IsY0FBYyxDQUFFLElBQUk1QyxRQUFTLEdBQUcsR0FBR3NDLFVBQVU3QixRQUFRYSxTQUFTO1lBQ3RFTyxpQkFBaUJnQixhQUFhLENBQUVqQixRQUFRa0IsTUFBTSxDQUFDQyxTQUFTLENBQ3REdEMsUUFBUUssYUFBYSxFQUFFTCxRQUFRTSxhQUFhO1lBQzlDZ0IsZ0JBQWdCYyxhQUFhLENBQUVqQixRQUFRa0IsTUFBTTtRQUMvQztRQUNBdkMsUUFBUXlDLGNBQWMsQ0FBQ0MsSUFBSSxDQUFFaEI7UUFFN0IsK0ZBQStGO1FBQy9GeEIsUUFBUWlCLFFBQVEsR0FBRztZQUVqQkc7WUFDQUU7WUFFQSxpQkFBaUI7WUFDakJIO1NBQ0Q7UUFFRCxLQUFLLENBQUVuQjtRQUVQLElBQUksQ0FBQ3lDLGNBQWMsQ0FBQ0MsV0FBVyxDQUFFLElBQU01QyxRQUFReUMsY0FBYyxDQUFDSSxNQUFNLENBQUVuQjtJQUN4RTtBQUNGO0FBckdBLFNBQXFCM0IscUJBcUdwQjtBQUVERCxZQUFZZ0QsUUFBUSxDQUFFLFdBQVcvQyJ9