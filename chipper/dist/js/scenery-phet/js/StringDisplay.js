// Copyright 2024, University of Colorado Boulder
/**
 * StringDisplay displays the value of a string or TReadOnlyProperty<string> on a background. The background can
 * be a fixed size, or it can dynamically size itself to fit the displayed string.
 *
 * StringDisplay is a nice alternative to NumberDisplay, when the thing you're displaying is not a number,
 * or when formatting is more-cleanly implemented using a TReadOnlyProperty<string>.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { Node, Rectangle, RichText, Text } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
let StringDisplay = class StringDisplay extends Node {
    dispose() {
        super.dispose();
        this.disposeStringDisplay();
    }
    constructor(string, providedOptions){
        const options = optionize()({
            // SelfOptions
            xMargin: 2,
            yMargin: 2,
            alignX: 'right',
            alignY: 'center',
            useRichText: false
        }, providedOptions);
        // If size was not specified, background will be sized to fit the text by text.boundsProperty listener.
        const backgroundWidth = options.size ? options.size.width : 1;
        const backgroundHeight = options.size ? options.size.height : 1;
        const background = new Rectangle(0, 0, backgroundWidth, backgroundHeight, combineOptions({
            fill: 'white',
            stroke: 'black',
            cornerRadius: 4
        }, options.rectangleOptions));
        // If size was specified, text will be scale to fit the background.
        const textMaxWidth = options.size ? options.size.width - 2 * options.xMargin : null;
        const textMaxHeight = options.size ? options.size.height - 2 * options.yMargin : null;
        const textOptions = combineOptions({
            maxWidth: textMaxWidth,
            maxHeight: textMaxHeight
        }, options.textOptions);
        const text = options.useRichText ? new RichText(string, textOptions) : new Text(string, textOptions);
        text.boundsProperty.link((textBounds)=>{
            // If a fixed size was not specified, dynamically size the background to fit the text.
            if (!options.size) {
                const width = textBounds.width + 2 * options.xMargin;
                const height = textBounds.height + 2 * options.yMargin;
                background.setRect(0, 0, width, height);
            }
            // Align the text in the background.
            alignText(text, background, options.alignX, options.alignY, options.xMargin, options.yMargin);
        });
        options.children = [
            background,
            text
        ];
        super(options);
        this.disposeStringDisplay = ()=>{
            background.dispose(); // may be listening to TReadOnlyProperty<TColor>
            text.dispose(); // is listening to a TReadOnlyProperty<string>
        };
    }
};
export { StringDisplay as default };
function alignText(text, background, alignX, alignY, xMargin, yMargin) {
    // x align
    if (alignX === 'right') {
        text.right = background.right - xMargin;
    } else if (alignX === 'left') {
        text.left = background.left + xMargin;
    } else {
        text.centerX = background.centerX;
    }
    // y align
    if (alignY === 'top') {
        text.top = background.top + yMargin;
    } else if (alignY === 'bottom') {
        text.bottom = background.bottom - yMargin;
    } else {
        text.centerY = background.centerY;
    }
}
sceneryPhet.register('StringDisplay', StringDisplay);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TdHJpbmdEaXNwbGF5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBTdHJpbmdEaXNwbGF5IGRpc3BsYXlzIHRoZSB2YWx1ZSBvZiBhIHN0cmluZyBvciBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+IG9uIGEgYmFja2dyb3VuZC4gVGhlIGJhY2tncm91bmQgY2FuXG4gKiBiZSBhIGZpeGVkIHNpemUsIG9yIGl0IGNhbiBkeW5hbWljYWxseSBzaXplIGl0c2VsZiB0byBmaXQgdGhlIGRpc3BsYXllZCBzdHJpbmcuXG4gKlxuICogU3RyaW5nRGlzcGxheSBpcyBhIG5pY2UgYWx0ZXJuYXRpdmUgdG8gTnVtYmVyRGlzcGxheSwgd2hlbiB0aGUgdGhpbmcgeW91J3JlIGRpc3BsYXlpbmcgaXMgbm90IGEgbnVtYmVyLFxuICogb3Igd2hlbiBmb3JtYXR0aW5nIGlzIG1vcmUtY2xlYW5seSBpbXBsZW1lbnRlZCB1c2luZyBhIFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4uXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBOb2RlLCBOb2RlT3B0aW9ucywgUmVjdGFuZ2xlLCBSZWN0YW5nbGVPcHRpb25zLCBSaWNoVGV4dCwgUmljaFRleHRPcHRpb25zLCBUZXh0LCBUZXh0T3B0aW9ucyB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi9zY2VuZXJ5UGhldC5qcyc7XG5cbnR5cGUgQWxpZ25YID0gJ2xlZnQnIHwgJ3JpZ2h0JyB8ICdjZW50ZXInO1xudHlwZSBBbGlnblkgPSAndG9wJyB8ICdib3R0b20nIHwgJ2NlbnRlcic7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG5cbiAgLy8gRml4ZWQgc2l6ZSBvZiB0aGUgYmFja2dyb3VuZC5cbiAgLy8gSWYgcHJvdmlkZWQsIHRoZSB0ZXh0IHdpbGwgYmUgc2NhbGVkIHRvIGZpdCB0aGUgYmFja2dyb3VuZC5cbiAgLy8gSWYgbm90IHByb3ZpZGVkLCB0aGUgYmFja2dyb3VuZCB3aWxsIGJlIGR5bmFtaWNhbGx5IHNpemVkIHRvIGZpeCB0aGUgdGV4dC5cbiAgc2l6ZT86IERpbWVuc2lvbjI7XG5cbiAgLy8gTWFyZ2lucyBpbnNpZGUgdGhlIGJhY2tncm91bmRcbiAgeE1hcmdpbj86IG51bWJlcjtcbiAgeU1hcmdpbj86IG51bWJlcjtcblxuICAvLyBIb3cgdGhlIHN0cmluZyBpcyBhbGlnbmVkIGluIHRoZSBiYWNrZ3JvdW5kXG4gIGFsaWduWD86IEFsaWduWDtcbiAgYWxpZ25ZPzogQWxpZ25ZO1xuXG4gIC8vIE9wdGlvbnMgcGFzc2VkIHRvIHRoZSBiYWNrZ3JvdW5kIFJlY3RhbmdsZVxuICByZWN0YW5nbGVPcHRpb25zPzogUmVjdGFuZ2xlT3B0aW9ucztcblxuICAvLyB0cnVlID0gdXNlIFJpY2hUZXh0LCBmYWxzZSA9IHVzZSBUZXh0XG4gIHVzZVJpY2hUZXh0PzogYm9vbGVhbjtcblxuICAvLyBPcHRpb25zIHBhc3NlZCB0byB0aGUgUmljaFRleHQgdGhhdCBkaXNwbGF5cyB0aGUgc3RyaW5nXG4gIHRleHRPcHRpb25zPzogU3RyaWN0T21pdDxUZXh0T3B0aW9ucyB8IFJpY2hUZXh0T3B0aW9ucywgJ21heFdpZHRoJyB8ICdtYXhIZWlnaHQnPjtcbn07XG5cbmV4cG9ydCB0eXBlIFN0cmluZ0Rpc3BsYXlPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBOb2RlT3B0aW9ucztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RyaW5nRGlzcGxheSBleHRlbmRzIE5vZGUge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZVN0cmluZ0Rpc3BsYXk6ICgpID0+IHZvaWQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzdHJpbmc6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4gfCBzdHJpbmcsIHByb3ZpZGVkT3B0aW9ucz86IFN0cmluZ0Rpc3BsYXlPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTdHJpbmdEaXNwbGF5T3B0aW9ucywgU3RyaWN0T21pdDxTZWxmT3B0aW9ucywgJ3NpemUnIHwgJ3RleHRPcHRpb25zJyB8ICdyZWN0YW5nbGVPcHRpb25zJz4sIE5vZGVPcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIFNlbGZPcHRpb25zXG4gICAgICB4TWFyZ2luOiAyLFxuICAgICAgeU1hcmdpbjogMixcbiAgICAgIGFsaWduWDogJ3JpZ2h0JyxcbiAgICAgIGFsaWduWTogJ2NlbnRlcicsXG4gICAgICB1c2VSaWNoVGV4dDogZmFsc2VcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIC8vIElmIHNpemUgd2FzIG5vdCBzcGVjaWZpZWQsIGJhY2tncm91bmQgd2lsbCBiZSBzaXplZCB0byBmaXQgdGhlIHRleHQgYnkgdGV4dC5ib3VuZHNQcm9wZXJ0eSBsaXN0ZW5lci5cbiAgICBjb25zdCBiYWNrZ3JvdW5kV2lkdGggPSAoIG9wdGlvbnMuc2l6ZSApID8gb3B0aW9ucy5zaXplLndpZHRoIDogMTtcbiAgICBjb25zdCBiYWNrZ3JvdW5kSGVpZ2h0ID0gKCBvcHRpb25zLnNpemUgKSA/IG9wdGlvbnMuc2l6ZS5oZWlnaHQgOiAxO1xuICAgIGNvbnN0IGJhY2tncm91bmQgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBiYWNrZ3JvdW5kV2lkdGgsIGJhY2tncm91bmRIZWlnaHQsXG4gICAgICBjb21iaW5lT3B0aW9uczxSZWN0YW5nbGVPcHRpb25zPigge1xuICAgICAgICBmaWxsOiAnd2hpdGUnLFxuICAgICAgICBzdHJva2U6ICdibGFjaycsXG4gICAgICAgIGNvcm5lclJhZGl1czogNFxuICAgICAgfSwgb3B0aW9ucy5yZWN0YW5nbGVPcHRpb25zICkgKTtcblxuICAgIC8vIElmIHNpemUgd2FzIHNwZWNpZmllZCwgdGV4dCB3aWxsIGJlIHNjYWxlIHRvIGZpdCB0aGUgYmFja2dyb3VuZC5cbiAgICBjb25zdCB0ZXh0TWF4V2lkdGggPSAoIG9wdGlvbnMuc2l6ZSApID8gb3B0aW9ucy5zaXplLndpZHRoIC0gKCAyICogb3B0aW9ucy54TWFyZ2luICkgOiBudWxsO1xuICAgIGNvbnN0IHRleHRNYXhIZWlnaHQgPSAoIG9wdGlvbnMuc2l6ZSApID8gb3B0aW9ucy5zaXplLmhlaWdodCAtICggMiAqIG9wdGlvbnMueU1hcmdpbiApIDogbnVsbDtcbiAgICBjb25zdCB0ZXh0T3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPFJpY2hUZXh0T3B0aW9ucz4oIHtcbiAgICAgIG1heFdpZHRoOiB0ZXh0TWF4V2lkdGgsXG4gICAgICBtYXhIZWlnaHQ6IHRleHRNYXhIZWlnaHRcbiAgICB9LCBvcHRpb25zLnRleHRPcHRpb25zICk7XG4gICAgY29uc3QgdGV4dCA9ICggb3B0aW9ucy51c2VSaWNoVGV4dCApID8gbmV3IFJpY2hUZXh0KCBzdHJpbmcsIHRleHRPcHRpb25zICkgOiBuZXcgVGV4dCggc3RyaW5nLCB0ZXh0T3B0aW9ucyApO1xuXG4gICAgdGV4dC5ib3VuZHNQcm9wZXJ0eS5saW5rKCB0ZXh0Qm91bmRzID0+IHtcblxuICAgICAgLy8gSWYgYSBmaXhlZCBzaXplIHdhcyBub3Qgc3BlY2lmaWVkLCBkeW5hbWljYWxseSBzaXplIHRoZSBiYWNrZ3JvdW5kIHRvIGZpdCB0aGUgdGV4dC5cbiAgICAgIGlmICggIW9wdGlvbnMuc2l6ZSApIHtcbiAgICAgICAgY29uc3Qgd2lkdGggPSB0ZXh0Qm91bmRzLndpZHRoICsgKCAyICogb3B0aW9ucy54TWFyZ2luICk7XG4gICAgICAgIGNvbnN0IGhlaWdodCA9IHRleHRCb3VuZHMuaGVpZ2h0ICsgKCAyICogb3B0aW9ucy55TWFyZ2luICk7XG4gICAgICAgIGJhY2tncm91bmQuc2V0UmVjdCggMCwgMCwgd2lkdGgsIGhlaWdodCApO1xuICAgICAgfVxuXG4gICAgICAvLyBBbGlnbiB0aGUgdGV4dCBpbiB0aGUgYmFja2dyb3VuZC5cbiAgICAgIGFsaWduVGV4dCggdGV4dCwgYmFja2dyb3VuZCwgb3B0aW9ucy5hbGlnblgsIG9wdGlvbnMuYWxpZ25ZLCBvcHRpb25zLnhNYXJnaW4sIG9wdGlvbnMueU1hcmdpbiApO1xuICAgIH0gKTtcblxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIGJhY2tncm91bmQsIHRleHQgXTtcblxuICAgIHN1cGVyKCBvcHRpb25zICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VTdHJpbmdEaXNwbGF5ID0gKCkgPT4ge1xuICAgICAgYmFja2dyb3VuZC5kaXNwb3NlKCk7IC8vIG1heSBiZSBsaXN0ZW5pbmcgdG8gVFJlYWRPbmx5UHJvcGVydHk8VENvbG9yPlxuICAgICAgdGV4dC5kaXNwb3NlKCk7IC8vIGlzIGxpc3RlbmluZyB0byBhIFRSZWFkT25seVByb3BlcnR5PHN0cmluZz5cbiAgICB9O1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICAgIHRoaXMuZGlzcG9zZVN0cmluZ0Rpc3BsYXkoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhbGlnblRleHQoIHRleHQ6IE5vZGUsIGJhY2tncm91bmQ6IE5vZGUsIGFsaWduWDogQWxpZ25YLCBhbGlnblk6IEFsaWduWSwgeE1hcmdpbjogbnVtYmVyLCB5TWFyZ2luOiBudW1iZXIgKTogdm9pZCB7XG5cbiAgLy8geCBhbGlnblxuICBpZiAoIGFsaWduWCA9PT0gJ3JpZ2h0JyApIHtcbiAgICB0ZXh0LnJpZ2h0ID0gYmFja2dyb3VuZC5yaWdodCAtIHhNYXJnaW47XG4gIH1cbiAgZWxzZSBpZiAoIGFsaWduWCA9PT0gJ2xlZnQnICkge1xuICAgIHRleHQubGVmdCA9IGJhY2tncm91bmQubGVmdCArIHhNYXJnaW47XG4gIH1cbiAgZWxzZSB7XG4gICAgdGV4dC5jZW50ZXJYID0gYmFja2dyb3VuZC5jZW50ZXJYO1xuICB9XG5cbiAgLy8geSBhbGlnblxuICBpZiAoIGFsaWduWSA9PT0gJ3RvcCcgKSB7XG4gICAgdGV4dC50b3AgPSBiYWNrZ3JvdW5kLnRvcCArIHlNYXJnaW47XG4gIH1cbiAgZWxzZSBpZiAoIGFsaWduWSA9PT0gJ2JvdHRvbScgKSB7XG4gICAgdGV4dC5ib3R0b20gPSBiYWNrZ3JvdW5kLmJvdHRvbSAtIHlNYXJnaW47XG4gIH1cbiAgZWxzZSB7XG4gICAgdGV4dC5jZW50ZXJZID0gYmFja2dyb3VuZC5jZW50ZXJZO1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnU3RyaW5nRGlzcGxheScsIFN0cmluZ0Rpc3BsYXkgKTsiXSwibmFtZXMiOlsib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiUmljaFRleHQiLCJUZXh0Iiwic2NlbmVyeVBoZXQiLCJTdHJpbmdEaXNwbGF5IiwiZGlzcG9zZSIsImRpc3Bvc2VTdHJpbmdEaXNwbGF5Iiwic3RyaW5nIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInhNYXJnaW4iLCJ5TWFyZ2luIiwiYWxpZ25YIiwiYWxpZ25ZIiwidXNlUmljaFRleHQiLCJiYWNrZ3JvdW5kV2lkdGgiLCJzaXplIiwid2lkdGgiLCJiYWNrZ3JvdW5kSGVpZ2h0IiwiaGVpZ2h0IiwiYmFja2dyb3VuZCIsImZpbGwiLCJzdHJva2UiLCJjb3JuZXJSYWRpdXMiLCJyZWN0YW5nbGVPcHRpb25zIiwidGV4dE1heFdpZHRoIiwidGV4dE1heEhlaWdodCIsInRleHRPcHRpb25zIiwibWF4V2lkdGgiLCJtYXhIZWlnaHQiLCJ0ZXh0IiwiYm91bmRzUHJvcGVydHkiLCJsaW5rIiwidGV4dEJvdW5kcyIsInNldFJlY3QiLCJhbGlnblRleHQiLCJjaGlsZHJlbiIsInJpZ2h0IiwibGVmdCIsImNlbnRlclgiLCJ0b3AiLCJib3R0b20iLCJjZW50ZXJZIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7Ozs7Ozs7Q0FRQyxHQUlELE9BQU9BLGFBQWFDLGNBQWMsUUFBUSxrQ0FBa0M7QUFFNUUsU0FBU0MsSUFBSSxFQUFlQyxTQUFTLEVBQW9CQyxRQUFRLEVBQW1CQyxJQUFJLFFBQXFCLDhCQUE4QjtBQUMzSSxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBZ0M1QixJQUFBLEFBQU1DLGdCQUFOLE1BQU1BLHNCQUFzQkw7SUEwRHpCTSxVQUFnQjtRQUM5QixLQUFLLENBQUNBO1FBQ04sSUFBSSxDQUFDQyxvQkFBb0I7SUFDM0I7SUF6REEsWUFBb0JDLE1BQTBDLEVBQUVDLGVBQXNDLENBQUc7UUFFdkcsTUFBTUMsVUFBVVosWUFBc0g7WUFFcEksY0FBYztZQUNkYSxTQUFTO1lBQ1RDLFNBQVM7WUFDVEMsUUFBUTtZQUNSQyxRQUFRO1lBQ1JDLGFBQWE7UUFDZixHQUFHTjtRQUVILHVHQUF1RztRQUN2RyxNQUFNTyxrQkFBa0IsQUFBRU4sUUFBUU8sSUFBSSxHQUFLUCxRQUFRTyxJQUFJLENBQUNDLEtBQUssR0FBRztRQUNoRSxNQUFNQyxtQkFBbUIsQUFBRVQsUUFBUU8sSUFBSSxHQUFLUCxRQUFRTyxJQUFJLENBQUNHLE1BQU0sR0FBRztRQUNsRSxNQUFNQyxhQUFhLElBQUlwQixVQUFXLEdBQUcsR0FBR2UsaUJBQWlCRyxrQkFDdkRwQixlQUFrQztZQUNoQ3VCLE1BQU07WUFDTkMsUUFBUTtZQUNSQyxjQUFjO1FBQ2hCLEdBQUdkLFFBQVFlLGdCQUFnQjtRQUU3QixtRUFBbUU7UUFDbkUsTUFBTUMsZUFBZSxBQUFFaEIsUUFBUU8sSUFBSSxHQUFLUCxRQUFRTyxJQUFJLENBQUNDLEtBQUssR0FBSyxJQUFJUixRQUFRQyxPQUFPLEdBQUs7UUFDdkYsTUFBTWdCLGdCQUFnQixBQUFFakIsUUFBUU8sSUFBSSxHQUFLUCxRQUFRTyxJQUFJLENBQUNHLE1BQU0sR0FBSyxJQUFJVixRQUFRRSxPQUFPLEdBQUs7UUFDekYsTUFBTWdCLGNBQWM3QixlQUFpQztZQUNuRDhCLFVBQVVIO1lBQ1ZJLFdBQVdIO1FBQ2IsR0FBR2pCLFFBQVFrQixXQUFXO1FBQ3RCLE1BQU1HLE9BQU8sQUFBRXJCLFFBQVFLLFdBQVcsR0FBSyxJQUFJYixTQUFVTSxRQUFRb0IsZUFBZ0IsSUFBSXpCLEtBQU1LLFFBQVFvQjtRQUUvRkcsS0FBS0MsY0FBYyxDQUFDQyxJQUFJLENBQUVDLENBQUFBO1lBRXhCLHNGQUFzRjtZQUN0RixJQUFLLENBQUN4QixRQUFRTyxJQUFJLEVBQUc7Z0JBQ25CLE1BQU1DLFFBQVFnQixXQUFXaEIsS0FBSyxHQUFLLElBQUlSLFFBQVFDLE9BQU87Z0JBQ3RELE1BQU1TLFNBQVNjLFdBQVdkLE1BQU0sR0FBSyxJQUFJVixRQUFRRSxPQUFPO2dCQUN4RFMsV0FBV2MsT0FBTyxDQUFFLEdBQUcsR0FBR2pCLE9BQU9FO1lBQ25DO1lBRUEsb0NBQW9DO1lBQ3BDZ0IsVUFBV0wsTUFBTVYsWUFBWVgsUUFBUUcsTUFBTSxFQUFFSCxRQUFRSSxNQUFNLEVBQUVKLFFBQVFDLE9BQU8sRUFBRUQsUUFBUUUsT0FBTztRQUMvRjtRQUVBRixRQUFRMkIsUUFBUSxHQUFHO1lBQUVoQjtZQUFZVTtTQUFNO1FBRXZDLEtBQUssQ0FBRXJCO1FBRVAsSUFBSSxDQUFDSCxvQkFBb0IsR0FBRztZQUMxQmMsV0FBV2YsT0FBTyxJQUFJLGdEQUFnRDtZQUN0RXlCLEtBQUt6QixPQUFPLElBQUksOENBQThDO1FBQ2hFO0lBQ0Y7QUFNRjtBQTlEQSxTQUFxQkQsMkJBOERwQjtBQUVELFNBQVMrQixVQUFXTCxJQUFVLEVBQUVWLFVBQWdCLEVBQUVSLE1BQWMsRUFBRUMsTUFBYyxFQUFFSCxPQUFlLEVBQUVDLE9BQWU7SUFFaEgsVUFBVTtJQUNWLElBQUtDLFdBQVcsU0FBVTtRQUN4QmtCLEtBQUtPLEtBQUssR0FBR2pCLFdBQVdpQixLQUFLLEdBQUczQjtJQUNsQyxPQUNLLElBQUtFLFdBQVcsUUFBUztRQUM1QmtCLEtBQUtRLElBQUksR0FBR2xCLFdBQVdrQixJQUFJLEdBQUc1QjtJQUNoQyxPQUNLO1FBQ0hvQixLQUFLUyxPQUFPLEdBQUduQixXQUFXbUIsT0FBTztJQUNuQztJQUVBLFVBQVU7SUFDVixJQUFLMUIsV0FBVyxPQUFRO1FBQ3RCaUIsS0FBS1UsR0FBRyxHQUFHcEIsV0FBV29CLEdBQUcsR0FBRzdCO0lBQzlCLE9BQ0ssSUFBS0UsV0FBVyxVQUFXO1FBQzlCaUIsS0FBS1csTUFBTSxHQUFHckIsV0FBV3FCLE1BQU0sR0FBRzlCO0lBQ3BDLE9BQ0s7UUFDSG1CLEtBQUtZLE9BQU8sR0FBR3RCLFdBQVdzQixPQUFPO0lBQ25DO0FBQ0Y7QUFFQXZDLFlBQVl3QyxRQUFRLENBQUUsaUJBQWlCdkMifQ==