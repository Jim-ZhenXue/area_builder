// Copyright 2018-2024, University of Colorado Boulder
/**
 * Detects if the browser in use is Internet Explorer, and shows an error page if so.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */ // constants
const CSS_STYLING = `#ie-error-container {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 100vh;
    width: 100vw;
    background: white;
    z-index: 1000000;
    align-items: center;
  }

  #ie-error {
    position: relative;
    border-radius: 10px;
    max-width: 550px;
    margin: auto;
    padding: 30px;
    font-size: 20px;
    font-weight: 500;
    font-family: sans-serif;
    text-align: center;
  }

  #ie-error .header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 46px;
  }

  #ie-error .header .h1 {
    font-size: 30px;
    font-weight: 500;
    margin: 0 0 0 10px;
  }

  #ie-error .header svg {
    width: 36px;
  }

  #ie-error p {
    margin: 14px 0;
  }`;
const ERROR_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" class="" x="0px" y="0px" viewBox="0 0 27.75 24.44">
     <g>
       <path style="fill:red" d="M12.52,0.78L0.21,22.1c-0.6,1.04,0.15,2.34,1.35,2.34h24.62c1.2,0,1.95-1.3,1.35-2.34L15.22,0.78
         C14.62-0.26,13.12-0.26,12.52,0.78z"/>
       <g>
         <path style="fill:white" d="M13.45,17.19c-1.13-6.12-1.7-9.42-1.7-9.9c0-0.59,0.22-1.07,0.65-1.43c0.44-0.36,0.93-0.54,1.48-0.54
           c0.59,0,1.09,0.19,1.5,0.58C15.79,6.29,16,6.74,16,7.27c0,0.5-0.57,3.81-1.7,9.92H13.45z M15.75,20.46c0,0.52-0.18,0.97-0.55,1.34
           c-0.37,0.37-0.81,0.55-1.32,0.55c-0.52,0-0.97-0.19-1.33-0.55c-0.37-0.37-0.55-0.81-0.55-1.34c0-0.51,0.18-0.95,0.55-1.32
           c0.37-0.37,0.81-0.55,1.33-0.55c0.51,0,0.95,0.18,1.32,0.55C15.57,19.5,15.75,19.94,15.75,20.46z"/>
       </g>
     </g>
   </svg>`;
// Detect which version of IE is in use. Remains -1 if not using IE. Copied from phet-core/platform.js.
const userAgent = window.navigator.userAgent;
let releaseVersion = -1;
let regex = null;
if (window.navigator.appName === 'Microsoft Internet Explorer') {
    regex = new RegExp('MSIE ([0-9]{1,}[.0-9]{0,})');
    if (regex.exec(userAgent) !== null) {
        releaseVersion = parseFloat(RegExp.$1);
    }
} else if (window.navigator.appName === 'Netscape') {
    regex = new RegExp('Trident/.*rv:([0-9]{1,}[.0-9]{0,})');
    if (regex.exec(userAgent) !== null) {
        releaseVersion = parseFloat(RegExp.$1);
    }
}
// Browser is IE, so set a global to alert other scripts and show the error message. Can also be revealed with the
// flag `showInternetExplorerError`
if (releaseVersion !== -1 || window.location.search.indexOf('showInternetExplorerError') >= 0) {
    // create the html elements dynamically
    const ieErrorStyling = document.createElement('style');
    ieErrorStyling.innerHTML = CSS_STYLING;
    const ieErrorContainer = document.createElement('div');
    ieErrorContainer.id = 'ie-error-container';
    const ieError = document.createElement('div');
    ieError.id = 'ie-error';
    const header = document.createElement('div');
    header.className = 'header';
    const ieErrorHeader = document.createElement('h1');
    ieErrorHeader.id = 'ie-error-header';
    ieErrorHeader.className = 'h1';
    const ieErrorNotSupported = document.createElement('p');
    ieErrorNotSupported.id = 'ie-error-not-supported';
    const ieErrorDifferentBrowser = document.createElement('p');
    ieErrorDifferentBrowser.id = 'ie-error-header';
    // get the locale specified as a query parameter, if there is one
    const localeRegEx = /locale=[a-z]{2}(_[A-Z]{2}){0,1}/g;
    const localeQueryParameterMatches = window.location.search.match(localeRegEx) || [];
    const localeQueryParameter = localeQueryParameterMatches.length ? localeQueryParameterMatches[0] : null;
    const localeQueryParameterValue = localeQueryParameter ? localeQueryParameter.split('=')[1] : null;
    // Prioritize the locale specified as a query parameter, otherwise fallback to the built locale. Then get the strings
    // in that locale.
    const locale = localeQueryParameterValue && window.phet.chipper.strings[localeQueryParameterValue] ? localeQueryParameterValue : window.phet.chipper.locale;
    const strings = window.phet.chipper.strings[locale];
    // fill in the translated strings
    ieErrorHeader.innerText = strings['JOIST/ieErrorPage.platformError'];
    ieErrorNotSupported.innerText = strings['JOIST/ieErrorPage.ieIsNotSupported'];
    ieErrorDifferentBrowser.innerText = strings['JOIST/ieErrorPage.useDifferentBrowser'];
    // add the html elements to the page
    header.innerHTML = ERROR_ICON_SVG;
    header.appendChild(ieErrorHeader);
    ieError.appendChild(header);
    ieError.appendChild(ieErrorNotSupported);
    ieError.appendChild(ieErrorDifferentBrowser);
    ieErrorContainer.appendChild(ieError);
    document.body.appendChild(ieErrorStyling);
    document.body.appendChild(ieErrorContainer);
    // reveal the error
    document.getElementById('ie-error-container').style.display = 'flex';
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2Jyb3dzZXIvaWUtZGV0ZWN0aW9uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERldGVjdHMgaWYgdGhlIGJyb3dzZXIgaW4gdXNlIGlzIEludGVybmV0IEV4cGxvcmVyLCBhbmQgc2hvd3MgYW4gZXJyb3IgcGFnZSBpZiBzby5cbiAqXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuXG4vLyBjb25zdGFudHNcbmNvbnN0IENTU19TVFlMSU5HID1cbiAgYCNpZS1lcnJvci1jb250YWluZXIge1xuICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgcG9zaXRpb246IGZpeGVkO1xuICAgIHRvcDogMDtcbiAgICBsZWZ0OiAwO1xuICAgIHJpZ2h0OiAwO1xuICAgIGhlaWdodDogMTAwdmg7XG4gICAgd2lkdGg6IDEwMHZ3O1xuICAgIGJhY2tncm91bmQ6IHdoaXRlO1xuICAgIHotaW5kZXg6IDEwMDAwMDA7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgfVxuXG4gICNpZS1lcnJvciB7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIGJvcmRlci1yYWRpdXM6IDEwcHg7XG4gICAgbWF4LXdpZHRoOiA1NTBweDtcbiAgICBtYXJnaW46IGF1dG87XG4gICAgcGFkZGluZzogMzBweDtcbiAgICBmb250LXNpemU6IDIwcHg7XG4gICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgICBmb250LWZhbWlseTogc2Fucy1zZXJpZjtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gIH1cblxuICAjaWUtZXJyb3IgLmhlYWRlciB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIG1hcmdpbi1ib3R0b206IDQ2cHg7XG4gIH1cblxuICAjaWUtZXJyb3IgLmhlYWRlciAuaDEge1xuICAgIGZvbnQtc2l6ZTogMzBweDtcbiAgICBmb250LXdlaWdodDogNTAwO1xuICAgIG1hcmdpbjogMCAwIDAgMTBweDtcbiAgfVxuXG4gICNpZS1lcnJvciAuaGVhZGVyIHN2ZyB7XG4gICAgd2lkdGg6IDM2cHg7XG4gIH1cblxuICAjaWUtZXJyb3IgcCB7XG4gICAgbWFyZ2luOiAxNHB4IDA7XG4gIH1gO1xuY29uc3QgRVJST1JfSUNPTl9TVkcgPVxuICBgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgY2xhc3M9XCJcIiB4PVwiMHB4XCIgeT1cIjBweFwiIHZpZXdCb3g9XCIwIDAgMjcuNzUgMjQuNDRcIj5cbiAgICAgPGc+XG4gICAgICAgPHBhdGggc3R5bGU9XCJmaWxsOnJlZFwiIGQ9XCJNMTIuNTIsMC43OEwwLjIxLDIyLjFjLTAuNiwxLjA0LDAuMTUsMi4zNCwxLjM1LDIuMzRoMjQuNjJjMS4yLDAsMS45NS0xLjMsMS4zNS0yLjM0TDE1LjIyLDAuNzhcbiAgICAgICAgIEMxNC42Mi0wLjI2LDEzLjEyLTAuMjYsMTIuNTIsMC43OHpcIi8+XG4gICAgICAgPGc+XG4gICAgICAgICA8cGF0aCBzdHlsZT1cImZpbGw6d2hpdGVcIiBkPVwiTTEzLjQ1LDE3LjE5Yy0xLjEzLTYuMTItMS43LTkuNDItMS43LTkuOWMwLTAuNTksMC4yMi0xLjA3LDAuNjUtMS40M2MwLjQ0LTAuMzYsMC45My0wLjU0LDEuNDgtMC41NFxuICAgICAgICAgICBjMC41OSwwLDEuMDksMC4xOSwxLjUsMC41OEMxNS43OSw2LjI5LDE2LDYuNzQsMTYsNy4yN2MwLDAuNS0wLjU3LDMuODEtMS43LDkuOTJIMTMuNDV6IE0xNS43NSwyMC40NmMwLDAuNTItMC4xOCwwLjk3LTAuNTUsMS4zNFxuICAgICAgICAgICBjLTAuMzcsMC4zNy0wLjgxLDAuNTUtMS4zMiwwLjU1Yy0wLjUyLDAtMC45Ny0wLjE5LTEuMzMtMC41NWMtMC4zNy0wLjM3LTAuNTUtMC44MS0wLjU1LTEuMzRjMC0wLjUxLDAuMTgtMC45NSwwLjU1LTEuMzJcbiAgICAgICAgICAgYzAuMzctMC4zNywwLjgxLTAuNTUsMS4zMy0wLjU1YzAuNTEsMCwwLjk1LDAuMTgsMS4zMiwwLjU1QzE1LjU3LDE5LjUsMTUuNzUsMTkuOTQsMTUuNzUsMjAuNDZ6XCIvPlxuICAgICAgIDwvZz5cbiAgICAgPC9nPlxuICAgPC9zdmc+YDtcblxuLy8gRGV0ZWN0IHdoaWNoIHZlcnNpb24gb2YgSUUgaXMgaW4gdXNlLiBSZW1haW5zIC0xIGlmIG5vdCB1c2luZyBJRS4gQ29waWVkIGZyb20gcGhldC1jb3JlL3BsYXRmb3JtLmpzLlxuY29uc3QgdXNlckFnZW50ID0gd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQ7XG5sZXQgcmVsZWFzZVZlcnNpb24gPSAtMTtcbmxldCByZWdleCA9IG51bGw7XG5pZiAoIHdpbmRvdy5uYXZpZ2F0b3IuYXBwTmFtZSA9PT0gJ01pY3Jvc29mdCBJbnRlcm5ldCBFeHBsb3JlcicgKSB7XG4gIHJlZ2V4ID0gbmV3IFJlZ0V4cCggJ01TSUUgKFswLTldezEsfVsuMC05XXswLH0pJyApO1xuICBpZiAoIHJlZ2V4LmV4ZWMoIHVzZXJBZ2VudCApICE9PSBudWxsICkge1xuICAgIHJlbGVhc2VWZXJzaW9uID0gcGFyc2VGbG9hdCggUmVnRXhwLiQxICk7XG4gIH1cbn1cbmVsc2UgaWYgKCB3aW5kb3cubmF2aWdhdG9yLmFwcE5hbWUgPT09ICdOZXRzY2FwZScgKSB7XG4gIHJlZ2V4ID0gbmV3IFJlZ0V4cCggJ1RyaWRlbnQvLipydjooWzAtOV17MSx9Wy4wLTldezAsfSknICk7XG4gIGlmICggcmVnZXguZXhlYyggdXNlckFnZW50ICkgIT09IG51bGwgKSB7XG4gICAgcmVsZWFzZVZlcnNpb24gPSBwYXJzZUZsb2F0KCBSZWdFeHAuJDEgKTtcbiAgfVxufVxuXG4vLyBCcm93c2VyIGlzIElFLCBzbyBzZXQgYSBnbG9iYWwgdG8gYWxlcnQgb3RoZXIgc2NyaXB0cyBhbmQgc2hvdyB0aGUgZXJyb3IgbWVzc2FnZS4gQ2FuIGFsc28gYmUgcmV2ZWFsZWQgd2l0aCB0aGVcbi8vIGZsYWcgYHNob3dJbnRlcm5ldEV4cGxvcmVyRXJyb3JgXG5pZiAoIHJlbGVhc2VWZXJzaW9uICE9PSAtMSB8fCB3aW5kb3cubG9jYXRpb24uc2VhcmNoLmluZGV4T2YoICdzaG93SW50ZXJuZXRFeHBsb3JlckVycm9yJyApID49IDAgKSB7XG5cbiAgLy8gY3JlYXRlIHRoZSBodG1sIGVsZW1lbnRzIGR5bmFtaWNhbGx5XG4gIGNvbnN0IGllRXJyb3JTdHlsaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ3N0eWxlJyApO1xuICBpZUVycm9yU3R5bGluZy5pbm5lckhUTUwgPSBDU1NfU1RZTElORztcbiAgY29uc3QgaWVFcnJvckNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG4gIGllRXJyb3JDb250YWluZXIuaWQgPSAnaWUtZXJyb3ItY29udGFpbmVyJztcbiAgY29uc3QgaWVFcnJvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG4gIGllRXJyb3IuaWQgPSAnaWUtZXJyb3InO1xuICBjb25zdCBoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuICBoZWFkZXIuY2xhc3NOYW1lID0gJ2hlYWRlcic7XG4gIGNvbnN0IGllRXJyb3JIZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnaDEnICk7XG4gIGllRXJyb3JIZWFkZXIuaWQgPSAnaWUtZXJyb3ItaGVhZGVyJztcbiAgaWVFcnJvckhlYWRlci5jbGFzc05hbWUgPSAnaDEnO1xuICBjb25zdCBpZUVycm9yTm90U3VwcG9ydGVkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ3AnICk7XG4gIGllRXJyb3JOb3RTdXBwb3J0ZWQuaWQgPSAnaWUtZXJyb3Itbm90LXN1cHBvcnRlZCc7XG4gIGNvbnN0IGllRXJyb3JEaWZmZXJlbnRCcm93c2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ3AnICk7XG4gIGllRXJyb3JEaWZmZXJlbnRCcm93c2VyLmlkID0gJ2llLWVycm9yLWhlYWRlcic7XG5cbiAgLy8gZ2V0IHRoZSBsb2NhbGUgc3BlY2lmaWVkIGFzIGEgcXVlcnkgcGFyYW1ldGVyLCBpZiB0aGVyZSBpcyBvbmVcbiAgY29uc3QgbG9jYWxlUmVnRXggPSAvbG9jYWxlPVthLXpdezJ9KF9bQS1aXXsyfSl7MCwxfS9nO1xuICBjb25zdCBsb2NhbGVRdWVyeVBhcmFtZXRlck1hdGNoZXMgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLm1hdGNoKCBsb2NhbGVSZWdFeCApIHx8IFtdO1xuICBjb25zdCBsb2NhbGVRdWVyeVBhcmFtZXRlciA9IGxvY2FsZVF1ZXJ5UGFyYW1ldGVyTWF0Y2hlcy5sZW5ndGggPyBsb2NhbGVRdWVyeVBhcmFtZXRlck1hdGNoZXNbIDAgXSA6IG51bGw7XG4gIGNvbnN0IGxvY2FsZVF1ZXJ5UGFyYW1ldGVyVmFsdWUgPSBsb2NhbGVRdWVyeVBhcmFtZXRlciA/IGxvY2FsZVF1ZXJ5UGFyYW1ldGVyLnNwbGl0KCAnPScgKVsgMSBdIDogbnVsbDtcblxuICAvLyBQcmlvcml0aXplIHRoZSBsb2NhbGUgc3BlY2lmaWVkIGFzIGEgcXVlcnkgcGFyYW1ldGVyLCBvdGhlcndpc2UgZmFsbGJhY2sgdG8gdGhlIGJ1aWx0IGxvY2FsZS4gVGhlbiBnZXQgdGhlIHN0cmluZ3NcbiAgLy8gaW4gdGhhdCBsb2NhbGUuXG4gIGNvbnN0IGxvY2FsZSA9IGxvY2FsZVF1ZXJ5UGFyYW1ldGVyVmFsdWUgJiYgd2luZG93LnBoZXQuY2hpcHBlci5zdHJpbmdzWyBsb2NhbGVRdWVyeVBhcmFtZXRlclZhbHVlIF0gP1xuICAgICAgICAgICAgICAgICBsb2NhbGVRdWVyeVBhcmFtZXRlclZhbHVlIDogd2luZG93LnBoZXQuY2hpcHBlci5sb2NhbGU7XG4gIGNvbnN0IHN0cmluZ3MgPSB3aW5kb3cucGhldC5jaGlwcGVyLnN0cmluZ3NbIGxvY2FsZSBdO1xuXG4gIC8vIGZpbGwgaW4gdGhlIHRyYW5zbGF0ZWQgc3RyaW5nc1xuICBpZUVycm9ySGVhZGVyLmlubmVyVGV4dCA9IHN0cmluZ3NbICdKT0lTVC9pZUVycm9yUGFnZS5wbGF0Zm9ybUVycm9yJyBdO1xuICBpZUVycm9yTm90U3VwcG9ydGVkLmlubmVyVGV4dCA9IHN0cmluZ3NbICdKT0lTVC9pZUVycm9yUGFnZS5pZUlzTm90U3VwcG9ydGVkJyBdO1xuICBpZUVycm9yRGlmZmVyZW50QnJvd3Nlci5pbm5lclRleHQgPSBzdHJpbmdzWyAnSk9JU1QvaWVFcnJvclBhZ2UudXNlRGlmZmVyZW50QnJvd3NlcicgXTtcblxuICAvLyBhZGQgdGhlIGh0bWwgZWxlbWVudHMgdG8gdGhlIHBhZ2VcbiAgaGVhZGVyLmlubmVySFRNTCA9IEVSUk9SX0lDT05fU1ZHO1xuICBoZWFkZXIuYXBwZW5kQ2hpbGQoIGllRXJyb3JIZWFkZXIgKTtcbiAgaWVFcnJvci5hcHBlbmRDaGlsZCggaGVhZGVyICk7XG4gIGllRXJyb3IuYXBwZW5kQ2hpbGQoIGllRXJyb3JOb3RTdXBwb3J0ZWQgKTtcbiAgaWVFcnJvci5hcHBlbmRDaGlsZCggaWVFcnJvckRpZmZlcmVudEJyb3dzZXIgKTtcbiAgaWVFcnJvckNvbnRhaW5lci5hcHBlbmRDaGlsZCggaWVFcnJvciApO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBpZUVycm9yU3R5bGluZyApO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBpZUVycm9yQ29udGFpbmVyICk7XG5cbiAgLy8gcmV2ZWFsIHRoZSBlcnJvclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ2llLWVycm9yLWNvbnRhaW5lcicgKS5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xufSJdLCJuYW1lcyI6WyJDU1NfU1RZTElORyIsIkVSUk9SX0lDT05fU1ZHIiwidXNlckFnZW50Iiwid2luZG93IiwibmF2aWdhdG9yIiwicmVsZWFzZVZlcnNpb24iLCJyZWdleCIsImFwcE5hbWUiLCJSZWdFeHAiLCJleGVjIiwicGFyc2VGbG9hdCIsIiQxIiwibG9jYXRpb24iLCJzZWFyY2giLCJpbmRleE9mIiwiaWVFcnJvclN0eWxpbmciLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJpbm5lckhUTUwiLCJpZUVycm9yQ29udGFpbmVyIiwiaWQiLCJpZUVycm9yIiwiaGVhZGVyIiwiY2xhc3NOYW1lIiwiaWVFcnJvckhlYWRlciIsImllRXJyb3JOb3RTdXBwb3J0ZWQiLCJpZUVycm9yRGlmZmVyZW50QnJvd3NlciIsImxvY2FsZVJlZ0V4IiwibG9jYWxlUXVlcnlQYXJhbWV0ZXJNYXRjaGVzIiwibWF0Y2giLCJsb2NhbGVRdWVyeVBhcmFtZXRlciIsImxlbmd0aCIsImxvY2FsZVF1ZXJ5UGFyYW1ldGVyVmFsdWUiLCJzcGxpdCIsImxvY2FsZSIsInBoZXQiLCJjaGlwcGVyIiwic3RyaW5ncyIsImlubmVyVGV4dCIsImFwcGVuZENoaWxkIiwiYm9keSIsImdldEVsZW1lbnRCeUlkIiwic3R5bGUiLCJkaXNwbGF5Il0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUdELFlBQVk7QUFDWixNQUFNQSxjQUNKLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNENBLENBQUM7QUFDSixNQUFNQyxpQkFDSixDQUFDOzs7Ozs7Ozs7OztTQVdNLENBQUM7QUFFVix1R0FBdUc7QUFDdkcsTUFBTUMsWUFBWUMsT0FBT0MsU0FBUyxDQUFDRixTQUFTO0FBQzVDLElBQUlHLGlCQUFpQixDQUFDO0FBQ3RCLElBQUlDLFFBQVE7QUFDWixJQUFLSCxPQUFPQyxTQUFTLENBQUNHLE9BQU8sS0FBSywrQkFBZ0M7SUFDaEVELFFBQVEsSUFBSUUsT0FBUTtJQUNwQixJQUFLRixNQUFNRyxJQUFJLENBQUVQLGVBQWdCLE1BQU87UUFDdENHLGlCQUFpQkssV0FBWUYsT0FBT0csRUFBRTtJQUN4QztBQUNG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