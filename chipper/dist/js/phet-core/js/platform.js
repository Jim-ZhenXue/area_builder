// Copyright 2013-2023, University of Colorado Boulder
/**
 * Code for testing which platform is running.  Use sparingly, if at all!
 *
 * Sample usage:
 * if (platform.firefox) {node.renderer = 'canvas';}
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import phetCore from './phetCore.js';
const ua = navigator.userAgent;
// Checks to see whether we are IE, and if so whether the version matches.
function isIE(version) {
    return getInternetExplorerVersion() === version;
}
// Whether the browser is most likely Safari running on iOS
// See http://stackoverflow.com/questions/3007480/determine-if-user-navigated-from-mobile-safari
function isMobileSafari() {
    return !!(window.phet && phet.chipper && phet.chipper.queryParameters && phet.chipper.queryParameters['phet-app'] || (ua.match(/(iPod|iPhone|iPad)/) || navigator.platform === 'MacIntel' && navigator.maxTouchPoints >= 2) && ua.match(/AppleWebKit/));
}
//IE11 no longer reports MSIE in the user agent string, see https://github.com/phetsims/phet-core/issues/12
//This code is adapted from http://stackoverflow.com/questions/17907445/how-to-detect-ie11
function getInternetExplorerVersion() {
    let rv = -1;
    let re = null;
    if (navigator.appName === 'Microsoft Internet Explorer') {
        re = new RegExp('MSIE ([0-9]{1,}[.0-9]{0,})');
        if (re.exec(ua) !== null) {
            rv = parseFloat(RegExp.$1);
        }
    } else if (navigator.appName === 'Netscape') {
        re = new RegExp('Trident/.*rv:([0-9]{1,}[.0-9]{0,})');
        if (re.exec(ua) !== null) {
            rv = parseFloat(RegExp.$1);
        }
    }
    return rv;
}
const platform = {
    // Whether the browser is most likely Firefox
    firefox: ua.toLowerCase().includes('firefox'),
    // Whether the browser is most likely Safari running on iOS
    mobileSafari: isMobileSafari(),
    // Whether the browser is a matching version of Safari running on OS X
    safari5: !!(ua.match(/Version\/5\./) && ua.match(/Safari\//) && ua.match(/AppleWebKit/)),
    safari6: !!(ua.match(/Version\/6\./) && ua.match(/Safari\//) && ua.match(/AppleWebKit/)),
    safari7: !!(ua.match(/Version\/7\./) && ua.match(/Safari\//) && ua.match(/AppleWebKit/)),
    safari10: !!(ua.match(/Version\/10\./) && ua.match(/Safari\//) && ua.match(/AppleWebKit/)),
    safari11: !!(ua.match(/Version\/11\./) && ua.match(/Safari\//) && ua.match(/AppleWebKit/)),
    // Match Safari on iOS
    safari9: !!(ua.match(/Version\/9\./) && ua.match(/Safari\//) && ua.match(/AppleWebKit/)),
    // Whether the browser matches any version of safari, including mobile
    safari: isMobileSafari() || !!(ua.match(/Version\//) && ua.match(/Safari\//) && ua.match(/AppleWebKit/)),
    // Whether the browser is some type of IE (Internet Explorer)
    ie: getInternetExplorerVersion() !== -1,
    // Whether the browser is a specific version of IE (Internet Explorer)
    ie9: isIE(9),
    ie10: isIE(10),
    ie11: isIE(11),
    // Whether the browser has Android in its user agent
    android: ua.indexOf('Android') > 0,
    // Whether the browser is Microsoft Edge
    edge: !!ua.match(/Edge\//),
    // Whether the browser is Chromium-based (usually Chrome)
    chromium: /chrom(e|ium)/.test(ua.toLowerCase()) && !ua.match(/Edge\//),
    // Whether the platform is ChromeOS, https://stackoverflow.com/questions/29657165/detecting-chrome-os-with-javascript
    chromeOS: ua.indexOf('CrOS') > 0,
    mac: navigator.platform.includes('Mac')
};
phetCore.register('platform', platform);
export default platform;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9wbGF0Zm9ybS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDb2RlIGZvciB0ZXN0aW5nIHdoaWNoIHBsYXRmb3JtIGlzIHJ1bm5pbmcuICBVc2Ugc3BhcmluZ2x5LCBpZiBhdCBhbGwhXG4gKlxuICogU2FtcGxlIHVzYWdlOlxuICogaWYgKHBsYXRmb3JtLmZpcmVmb3gpIHtub2RlLnJlbmRlcmVyID0gJ2NhbnZhcyc7fVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBwaGV0Q29yZSBmcm9tICcuL3BoZXRDb3JlLmpzJztcblxuY29uc3QgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50O1xuXG4vLyBDaGVja3MgdG8gc2VlIHdoZXRoZXIgd2UgYXJlIElFLCBhbmQgaWYgc28gd2hldGhlciB0aGUgdmVyc2lvbiBtYXRjaGVzLlxuZnVuY3Rpb24gaXNJRSggdmVyc2lvbjogbnVtYmVyICk6IGJvb2xlYW4ge1xuICByZXR1cm4gZ2V0SW50ZXJuZXRFeHBsb3JlclZlcnNpb24oKSA9PT0gdmVyc2lvbjtcbn1cblxuLy8gV2hldGhlciB0aGUgYnJvd3NlciBpcyBtb3N0IGxpa2VseSBTYWZhcmkgcnVubmluZyBvbiBpT1Ncbi8vIFNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzMwMDc0ODAvZGV0ZXJtaW5lLWlmLXVzZXItbmF2aWdhdGVkLWZyb20tbW9iaWxlLXNhZmFyaVxuZnVuY3Rpb24gaXNNb2JpbGVTYWZhcmkoKTogYm9vbGVhbiB7XG4gIHJldHVybiAhIShcbiAgICAoIHdpbmRvdy5waGV0ICYmIHBoZXQuY2hpcHBlciAmJiBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzICYmIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnNbICdwaGV0LWFwcCcgXSApIHx8XG4gICAgKCAoIHVhLm1hdGNoKCAvKGlQb2R8aVBob25lfGlQYWQpLyApIHx8ICggbmF2aWdhdG9yLnBsYXRmb3JtID09PSAnTWFjSW50ZWwnICYmIG5hdmlnYXRvci5tYXhUb3VjaFBvaW50cyA+PSAyICkgKSAmJiB1YS5tYXRjaCggL0FwcGxlV2ViS2l0LyApIClcbiAgKTtcbn1cblxuLy9JRTExIG5vIGxvbmdlciByZXBvcnRzIE1TSUUgaW4gdGhlIHVzZXIgYWdlbnQgc3RyaW5nLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtY29yZS9pc3N1ZXMvMTJcbi8vVGhpcyBjb2RlIGlzIGFkYXB0ZWQgZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE3OTA3NDQ1L2hvdy10by1kZXRlY3QtaWUxMVxuZnVuY3Rpb24gZ2V0SW50ZXJuZXRFeHBsb3JlclZlcnNpb24oKTogbnVtYmVyIHtcbiAgbGV0IHJ2ID0gLTE7XG4gIGxldCByZSA9IG51bGw7XG4gIGlmICggbmF2aWdhdG9yLmFwcE5hbWUgPT09ICdNaWNyb3NvZnQgSW50ZXJuZXQgRXhwbG9yZXInICkge1xuICAgIHJlID0gbmV3IFJlZ0V4cCggJ01TSUUgKFswLTldezEsfVsuMC05XXswLH0pJyApO1xuICAgIGlmICggcmUuZXhlYyggdWEgKSAhPT0gbnVsbCApIHtcbiAgICAgIHJ2ID0gcGFyc2VGbG9hdCggUmVnRXhwLiQxICk7XG4gICAgfVxuICB9XG4gIGVsc2UgaWYgKCBuYXZpZ2F0b3IuYXBwTmFtZSA9PT0gJ05ldHNjYXBlJyApIHtcbiAgICByZSA9IG5ldyBSZWdFeHAoICdUcmlkZW50Ly4qcnY6KFswLTldezEsfVsuMC05XXswLH0pJyApO1xuICAgIGlmICggcmUuZXhlYyggdWEgKSAhPT0gbnVsbCApIHtcbiAgICAgIHJ2ID0gcGFyc2VGbG9hdCggUmVnRXhwLiQxICk7XG4gICAgfVxuICB9XG4gIHJldHVybiBydjtcbn1cblxuY29uc3QgcGxhdGZvcm0gPSB7XG4gIC8vIFdoZXRoZXIgdGhlIGJyb3dzZXIgaXMgbW9zdCBsaWtlbHkgRmlyZWZveFxuICBmaXJlZm94OiB1YS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCAnZmlyZWZveCcgKSxcblxuICAvLyBXaGV0aGVyIHRoZSBicm93c2VyIGlzIG1vc3QgbGlrZWx5IFNhZmFyaSBydW5uaW5nIG9uIGlPU1xuICBtb2JpbGVTYWZhcmk6IGlzTW9iaWxlU2FmYXJpKCksXG5cbiAgLy8gV2hldGhlciB0aGUgYnJvd3NlciBpcyBhIG1hdGNoaW5nIHZlcnNpb24gb2YgU2FmYXJpIHJ1bm5pbmcgb24gT1MgWFxuICBzYWZhcmk1OiAhISggdWEubWF0Y2goIC9WZXJzaW9uXFwvNVxcLi8gKSAmJiB1YS5tYXRjaCggL1NhZmFyaVxcLy8gKSAmJiB1YS5tYXRjaCggL0FwcGxlV2ViS2l0LyApICksXG4gIHNhZmFyaTY6ICEhKCB1YS5tYXRjaCggL1ZlcnNpb25cXC82XFwuLyApICYmIHVhLm1hdGNoKCAvU2FmYXJpXFwvLyApICYmIHVhLm1hdGNoKCAvQXBwbGVXZWJLaXQvICkgKSxcbiAgc2FmYXJpNzogISEoIHVhLm1hdGNoKCAvVmVyc2lvblxcLzdcXC4vICkgJiYgdWEubWF0Y2goIC9TYWZhcmlcXC8vICkgJiYgdWEubWF0Y2goIC9BcHBsZVdlYktpdC8gKSApLFxuICBzYWZhcmkxMDogISEoIHVhLm1hdGNoKCAvVmVyc2lvblxcLzEwXFwuLyApICYmIHVhLm1hdGNoKCAvU2FmYXJpXFwvLyApICYmIHVhLm1hdGNoKCAvQXBwbGVXZWJLaXQvICkgKSxcbiAgc2FmYXJpMTE6ICEhKCB1YS5tYXRjaCggL1ZlcnNpb25cXC8xMVxcLi8gKSAmJiB1YS5tYXRjaCggL1NhZmFyaVxcLy8gKSAmJiB1YS5tYXRjaCggL0FwcGxlV2ViS2l0LyApICksXG5cbiAgLy8gTWF0Y2ggU2FmYXJpIG9uIGlPU1xuICBzYWZhcmk5OiAhISggdWEubWF0Y2goIC9WZXJzaW9uXFwvOVxcLi8gKSAmJiB1YS5tYXRjaCggL1NhZmFyaVxcLy8gKSAmJiB1YS5tYXRjaCggL0FwcGxlV2ViS2l0LyApICksXG5cbiAgLy8gV2hldGhlciB0aGUgYnJvd3NlciBtYXRjaGVzIGFueSB2ZXJzaW9uIG9mIHNhZmFyaSwgaW5jbHVkaW5nIG1vYmlsZVxuICBzYWZhcmk6IGlzTW9iaWxlU2FmYXJpKCkgfHwgISEoIHVhLm1hdGNoKCAvVmVyc2lvblxcLy8gKSAmJiB1YS5tYXRjaCggL1NhZmFyaVxcLy8gKSAmJiB1YS5tYXRjaCggL0FwcGxlV2ViS2l0LyApICksXG5cbiAgLy8gV2hldGhlciB0aGUgYnJvd3NlciBpcyBzb21lIHR5cGUgb2YgSUUgKEludGVybmV0IEV4cGxvcmVyKVxuICBpZTogZ2V0SW50ZXJuZXRFeHBsb3JlclZlcnNpb24oKSAhPT0gLTEsXG5cbiAgLy8gV2hldGhlciB0aGUgYnJvd3NlciBpcyBhIHNwZWNpZmljIHZlcnNpb24gb2YgSUUgKEludGVybmV0IEV4cGxvcmVyKVxuICBpZTk6IGlzSUUoIDkgKSxcbiAgaWUxMDogaXNJRSggMTAgKSxcbiAgaWUxMTogaXNJRSggMTEgKSxcblxuICAvLyBXaGV0aGVyIHRoZSBicm93c2VyIGhhcyBBbmRyb2lkIGluIGl0cyB1c2VyIGFnZW50XG4gIGFuZHJvaWQ6IHVhLmluZGV4T2YoICdBbmRyb2lkJyApID4gMCxcblxuICAvLyBXaGV0aGVyIHRoZSBicm93c2VyIGlzIE1pY3Jvc29mdCBFZGdlXG4gIGVkZ2U6ICEhdWEubWF0Y2goIC9FZGdlXFwvLyApLFxuXG4gIC8vIFdoZXRoZXIgdGhlIGJyb3dzZXIgaXMgQ2hyb21pdW0tYmFzZWQgKHVzdWFsbHkgQ2hyb21lKVxuICBjaHJvbWl1bTogKCAvY2hyb20oZXxpdW0pLyApLnRlc3QoIHVhLnRvTG93ZXJDYXNlKCkgKSAmJiAhdWEubWF0Y2goIC9FZGdlXFwvLyApLFxuXG4gIC8vIFdoZXRoZXIgdGhlIHBsYXRmb3JtIGlzIENocm9tZU9TLCBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yOTY1NzE2NS9kZXRlY3RpbmctY2hyb21lLW9zLXdpdGgtamF2YXNjcmlwdFxuICBjaHJvbWVPUzogdWEuaW5kZXhPZiggJ0NyT1MnICkgPiAwLFxuXG4gIG1hYzogbmF2aWdhdG9yLnBsYXRmb3JtLmluY2x1ZGVzKCAnTWFjJyApXG59O1xucGhldENvcmUucmVnaXN0ZXIoICdwbGF0Zm9ybScsIHBsYXRmb3JtICk7XG5cbmV4cG9ydCBkZWZhdWx0IHBsYXRmb3JtOyJdLCJuYW1lcyI6WyJwaGV0Q29yZSIsInVhIiwibmF2aWdhdG9yIiwidXNlckFnZW50IiwiaXNJRSIsInZlcnNpb24iLCJnZXRJbnRlcm5ldEV4cGxvcmVyVmVyc2lvbiIsImlzTW9iaWxlU2FmYXJpIiwid2luZG93IiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJtYXRjaCIsInBsYXRmb3JtIiwibWF4VG91Y2hQb2ludHMiLCJydiIsInJlIiwiYXBwTmFtZSIsIlJlZ0V4cCIsImV4ZWMiLCJwYXJzZUZsb2F0IiwiJDEiLCJmaXJlZm94IiwidG9Mb3dlckNhc2UiLCJpbmNsdWRlcyIsIm1vYmlsZVNhZmFyaSIsInNhZmFyaTUiLCJzYWZhcmk2Iiwic2FmYXJpNyIsInNhZmFyaTEwIiwic2FmYXJpMTEiLCJzYWZhcmk5Iiwic2FmYXJpIiwiaWUiLCJpZTkiLCJpZTEwIiwiaWUxMSIsImFuZHJvaWQiLCJpbmRleE9mIiwiZWRnZSIsImNocm9taXVtIiwidGVzdCIsImNocm9tZU9TIiwibWFjIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Q0FRQyxHQUVELE9BQU9BLGNBQWMsZ0JBQWdCO0FBRXJDLE1BQU1DLEtBQUtDLFVBQVVDLFNBQVM7QUFFOUIsMEVBQTBFO0FBQzFFLFNBQVNDLEtBQU1DLE9BQWU7SUFDNUIsT0FBT0MsaUNBQWlDRDtBQUMxQztB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