// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for RichText
 *
 * @author Jonathan Olson
 */ import { HBox, RichText, VBox } from '../../../../scenery/js/imports.js';
export default function demoRichText(layoutBounds) {
    return new VBox({
        spacing: 15,
        children: [
            new RichText('RichText can have <b>bold</b> and <i>italic</i> text.'),
            new RichText('Can do H<sub>2</sub>O (A<sub>sub</sub> and A<sup>sup</sup>), or nesting: x<sup>2<sup>2</sup></sup>'),
            new RichText('Additionally: <span style="color: blue;">color</span>, <span style="font-size: 30px;">sizes</span>, <span style="font-family: serif;">faces</span>, <s>strikethrough</s>, and <u>underline</u>'),
            new RichText('These <b><em>can</em> <u><span style="color: red;">be</span> mixed<sup>1</sup></u></b>.'),
            new RichText('\u202aHandles bidirectional text: \u202b<span style="color: #0a0;">مقابض</span> النص ثنائي <b>الاتجاه</b><sub>2</sub>\u202c\u202c'),
            new RichText('\u202b\u062a\u0633\u062a (\u0632\u0628\u0627\u0646)\u202c'),
            new RichText('HTML entities need to be escaped, like &amp; and &lt;.'),
            new RichText('Supports <a href="{{phetWebsite}}"><em>links</em> with <b>markup</b></a>, and <a href="{{callback}}">links that call functions</a>.', {
                links: {
                    phetWebsite: 'https://phet.colorado.edu',
                    callback: ()=>{
                        console.log('demo');
                    }
                }
            }),
            new RichText('Or also <a href="https://phet.colorado.edu">links directly in the string</a>.', {
                links: true
            }),
            new HBox({
                spacing: 30,
                children: [
                    new RichText('Multi-line text with the<br>separator &lt;br&gt; and <a href="https://phet.colorado.edu">handles<br>links</a> and other <b>tags<br>across lines</b>', {
                        links: true
                    }),
                    new RichText('Supposedly RichText supports line wrapping. Here is a lineWrap of 300, which should probably wrap multiple times here', {
                        lineWrap: 300
                    })
                ]
            })
        ],
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb1JpY2hUZXh0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERlbW8gZm9yIFJpY2hUZXh0XG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvblxuICovXG5cbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCB7IEhCb3gsIE5vZGUsIFJpY2hUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVtb1JpY2hUZXh0KCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XG4gIHJldHVybiBuZXcgVkJveCgge1xuICAgIHNwYWNpbmc6IDE1LFxuICAgIGNoaWxkcmVuOiBbXG4gICAgICBuZXcgUmljaFRleHQoICdSaWNoVGV4dCBjYW4gaGF2ZSA8Yj5ib2xkPC9iPiBhbmQgPGk+aXRhbGljPC9pPiB0ZXh0LicgKSxcbiAgICAgIG5ldyBSaWNoVGV4dCggJ0NhbiBkbyBIPHN1Yj4yPC9zdWI+TyAoQTxzdWI+c3ViPC9zdWI+IGFuZCBBPHN1cD5zdXA8L3N1cD4pLCBvciBuZXN0aW5nOiB4PHN1cD4yPHN1cD4yPC9zdXA+PC9zdXA+JyApLFxuICAgICAgbmV3IFJpY2hUZXh0KCAnQWRkaXRpb25hbGx5OiA8c3BhbiBzdHlsZT1cImNvbG9yOiBibHVlO1wiPmNvbG9yPC9zcGFuPiwgPHNwYW4gc3R5bGU9XCJmb250LXNpemU6IDMwcHg7XCI+c2l6ZXM8L3NwYW4+LCA8c3BhbiBzdHlsZT1cImZvbnQtZmFtaWx5OiBzZXJpZjtcIj5mYWNlczwvc3Bhbj4sIDxzPnN0cmlrZXRocm91Z2g8L3M+LCBhbmQgPHU+dW5kZXJsaW5lPC91PicgKSxcbiAgICAgIG5ldyBSaWNoVGV4dCggJ1RoZXNlIDxiPjxlbT5jYW48L2VtPiA8dT48c3BhbiBzdHlsZT1cImNvbG9yOiByZWQ7XCI+YmU8L3NwYW4+IG1peGVkPHN1cD4xPC9zdXA+PC91PjwvYj4uJyApLFxuICAgICAgbmV3IFJpY2hUZXh0KCAnXFx1MjAyYUhhbmRsZXMgYmlkaXJlY3Rpb25hbCB0ZXh0OiBcXHUyMDJiPHNwYW4gc3R5bGU9XCJjb2xvcjogIzBhMDtcIj7ZhdmC2KfYqNi2PC9zcGFuPiDYp9mE2YbYtSDYq9mG2KfYptmKIDxiPtin2YTYp9iq2KzYp9mHPC9iPjxzdWI+Mjwvc3ViPlxcdTIwMmNcXHUyMDJjJyApLFxuICAgICAgbmV3IFJpY2hUZXh0KCAnXFx1MjAyYlxcdTA2MmFcXHUwNjMzXFx1MDYyYSAoXFx1MDYzMlxcdTA2MjhcXHUwNjI3XFx1MDY0NilcXHUyMDJjJyApLFxuICAgICAgbmV3IFJpY2hUZXh0KCAnSFRNTCBlbnRpdGllcyBuZWVkIHRvIGJlIGVzY2FwZWQsIGxpa2UgJmFtcDsgYW5kICZsdDsuJyApLFxuICAgICAgbmV3IFJpY2hUZXh0KCAnU3VwcG9ydHMgPGEgaHJlZj1cInt7cGhldFdlYnNpdGV9fVwiPjxlbT5saW5rczwvZW0+IHdpdGggPGI+bWFya3VwPC9iPjwvYT4sIGFuZCA8YSBocmVmPVwie3tjYWxsYmFja319XCI+bGlua3MgdGhhdCBjYWxsIGZ1bmN0aW9uczwvYT4uJywge1xuICAgICAgICBsaW5rczoge1xuICAgICAgICAgIHBoZXRXZWJzaXRlOiAnaHR0cHM6Ly9waGV0LmNvbG9yYWRvLmVkdScsXG4gICAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnZGVtbycgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gKSxcbiAgICAgIG5ldyBSaWNoVGV4dCggJ09yIGFsc28gPGEgaHJlZj1cImh0dHBzOi8vcGhldC5jb2xvcmFkby5lZHVcIj5saW5rcyBkaXJlY3RseSBpbiB0aGUgc3RyaW5nPC9hPi4nLCB7XG4gICAgICAgIGxpbmtzOiB0cnVlXG4gICAgICB9ICksXG4gICAgICBuZXcgSEJveCgge1xuICAgICAgICBzcGFjaW5nOiAzMCxcbiAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICBuZXcgUmljaFRleHQoICdNdWx0aS1saW5lIHRleHQgd2l0aCB0aGU8YnI+c2VwYXJhdG9yICZsdDticiZndDsgYW5kIDxhIGhyZWY9XCJodHRwczovL3BoZXQuY29sb3JhZG8uZWR1XCI+aGFuZGxlczxicj5saW5rczwvYT4gYW5kIG90aGVyIDxiPnRhZ3M8YnI+YWNyb3NzIGxpbmVzPC9iPicsIHtcbiAgICAgICAgICAgIGxpbmtzOiB0cnVlXG4gICAgICAgICAgfSApLFxuICAgICAgICAgIG5ldyBSaWNoVGV4dCggJ1N1cHBvc2VkbHkgUmljaFRleHQgc3VwcG9ydHMgbGluZSB3cmFwcGluZy4gSGVyZSBpcyBhIGxpbmVXcmFwIG9mIDMwMCwgd2hpY2ggc2hvdWxkIHByb2JhYmx5IHdyYXAgbXVsdGlwbGUgdGltZXMgaGVyZScsIHsgbGluZVdyYXA6IDMwMCB9IClcbiAgICAgICAgXVxuICAgICAgfSApXG4gICAgXSxcbiAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXJcbiAgfSApO1xufSJdLCJuYW1lcyI6WyJIQm94IiwiUmljaFRleHQiLCJWQm94IiwiZGVtb1JpY2hUZXh0IiwibGF5b3V0Qm91bmRzIiwic3BhY2luZyIsImNoaWxkcmVuIiwibGlua3MiLCJwaGV0V2Vic2l0ZSIsImNhbGxiYWNrIiwiY29uc29sZSIsImxvZyIsImxpbmVXcmFwIiwiY2VudGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUdELFNBQVNBLElBQUksRUFBUUMsUUFBUSxFQUFFQyxJQUFJLFFBQVEsb0NBQW9DO0FBRS9FLGVBQWUsU0FBU0MsYUFBY0MsWUFBcUI7SUFDekQsT0FBTyxJQUFJRixLQUFNO1FBQ2ZHLFNBQVM7UUFDVEMsVUFBVTtZQUNSLElBQUlMLFNBQVU7WUFDZCxJQUFJQSxTQUFVO1lBQ2QsSUFBSUEsU0FBVTtZQUNkLElBQUlBLFNBQVU7WUFDZCxJQUFJQSxTQUFVO1lBQ2QsSUFBSUEsU0FBVTtZQUNkLElBQUlBLFNBQVU7WUFDZCxJQUFJQSxTQUFVLHVJQUF1STtnQkFDbkpNLE9BQU87b0JBQ0xDLGFBQWE7b0JBQ2JDLFVBQVU7d0JBQ1JDLFFBQVFDLEdBQUcsQ0FBRTtvQkFDZjtnQkFDRjtZQUNGO1lBQ0EsSUFBSVYsU0FBVSxpRkFBaUY7Z0JBQzdGTSxPQUFPO1lBQ1Q7WUFDQSxJQUFJUCxLQUFNO2dCQUNSSyxTQUFTO2dCQUNUQyxVQUFVO29CQUNSLElBQUlMLFNBQVUsdUpBQXVKO3dCQUNuS00sT0FBTztvQkFDVDtvQkFDQSxJQUFJTixTQUFVLHlIQUF5SDt3QkFBRVcsVUFBVTtvQkFBSTtpQkFDeEo7WUFDSDtTQUNEO1FBQ0RDLFFBQVFULGFBQWFTLE1BQU07SUFDN0I7QUFDRiJ9