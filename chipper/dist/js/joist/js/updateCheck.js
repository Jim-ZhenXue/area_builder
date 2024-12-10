// Copyright 2015-2024, University of Colorado Boulder
/**
 * A singleton type/object for handling checking whether our simulation is up-to-date, or whether there is an
 * updated version. See https://github.com/phetsims/joist/issues/189
 *
 * It exposes its current state (for UIs to hook into), and a check() function used to start checking the version.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import EnumerationProperty from '../../axon/js/EnumerationProperty.js';
import SimVersion from '../../perennial-alias/js/browser-and-node/SimVersion.js';
import joist from './joist.js';
import packageJSON from './packageJSON.js'; // parse name/version out of the package.json
import UpdateState from './UpdateState.js';
// constants
const simName = packageJSON.name;
const simVersion = SimVersion.parse(packageJSON.version, phet.chipper.buildTimestamp);
const requestProtocolString = document.location.protocol === 'https:' ? 'https:' : 'http:';
const TIMEOUT_MILLISECONDS = 15000; // How many ms before we time out (set to 'offline')
let UpdateCheck = class UpdateCheck {
    // Clears our timeout listener.
    clearTimeout() {
        window.clearTimeout(this.timeoutId);
    }
    //Sets our timeout listener.
    setTimeout() {
        this.timeoutId = window.setTimeout(this.timeoutCallback, TIMEOUT_MILLISECONDS); // eslint-disable-line phet/bad-sim-text
    }
    // If we are checking, it resets our timeout timer to TIMEOUT_MILLISECONDS
    resetTimeout() {
        if (this.stateProperty.value === UpdateState.CHECKING) {
            this.clearTimeout();
            this.setTimeout();
        }
    }
    // What happens when we actually time out.
    timeout() {
        this.stateProperty.value = UpdateState.OFFLINE;
    }
    /**
   * Kicks off the version checking request (if able), resulting in state changes.
   */ check() {
        if (!this.areUpdatesChecked || this.stateProperty.value !== UpdateState.UNCHECKED && this.stateProperty.value !== UpdateState.OFFLINE) {
            return;
        }
        // If our sim's version indicates it hasn't been published, don't attempt to send a request for now
        if (this.ourVersion.isSimNotPublished) {
            this.stateProperty.value = UpdateState.UP_TO_DATE;
            return;
        }
        const req = new XMLHttpRequest();
        if ('withCredentials' in req) {
            // we'll be able to send the proper type of request, so we mark ourself as checking
            this.stateProperty.value = UpdateState.CHECKING;
            this.setTimeout();
            req.onload = ()=>{
                this.clearTimeout();
                try {
                    const data = JSON.parse(req.responseText);
                    if (data.error) {
                        console.log(`Update check failure: ${data.error}`);
                        this.stateProperty.value = UpdateState.OFFLINE;
                    } else {
                        if (this.updateURL) {
                            this.updateURL = data.updateURL;
                        }
                        this.latestVersion = SimVersion.parse(data.latestVersion, data.buildTimestamp);
                        // these `state` strings come from the website service, and should be kept in sync with
                        // website\src\java\edu\colorado\phet\website\services\CheckHTMLUpdates.java
                        if (data.state === 'out-of-date') {
                            this.stateProperty.value = UpdateState.OUT_OF_DATE;
                        } else if (data.state === 'up-to-date') {
                            this.stateProperty.value = UpdateState.UP_TO_DATE;
                        } else {
                            console.log(`Failed to get proper state: ${data.state}`);
                            this.stateProperty.value = UpdateState.OFFLINE;
                        }
                    }
                } catch (e) {
                    this.stateProperty.value = UpdateState.OFFLINE;
                }
            };
            req.onerror = ()=>{
                this.clearTimeout();
                this.stateProperty.value = UpdateState.OFFLINE;
            };
            req.open('post', `${requestProtocolString}//phet.colorado.edu/services/check-html-updates`, true); // enable CORS
            req.send(JSON.stringify({
                api: '1.0',
                simulation: simName,
                locale: phet.joist.sim.locale,
                currentVersion: this.ourVersion.toString(),
                buildTimestamp: phet.chipper.buildTimestamp
            }));
        }
    }
    constructor(){
        this.stateProperty = new EnumerationProperty(UpdateState.UNCHECKED);
        this.latestVersion = null;
        this.ourVersion = simVersion;
        this.timeoutCallback = this.timeout.bind(this);
        // If it's not PhET-branded OR if it is phet-io or in the phet-app, do not check for updates
        this.areUpdatesChecked = phet.chipper.brand === 'phet' && !phet.chipper.isApp && phet.chipper.queryParameters.yotta;
        this.updateURL = `${'https://phet.colorado.edu/html-sim-update' + '?simulation='}${encodeURIComponent(simName)}&version=${encodeURIComponent(simVersion.toString())}&buildTimestamp=${encodeURIComponent(`${phet.chipper.buildTimestamp}`)}`;
        this.timeoutId = -1;
    }
};
const updateCheck = new UpdateCheck();
joist.register('updateCheck', updateCheck);
export default updateCheck;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL3VwZGF0ZUNoZWNrLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgc2luZ2xldG9uIHR5cGUvb2JqZWN0IGZvciBoYW5kbGluZyBjaGVja2luZyB3aGV0aGVyIG91ciBzaW11bGF0aW9uIGlzIHVwLXRvLWRhdGUsIG9yIHdoZXRoZXIgdGhlcmUgaXMgYW5cbiAqIHVwZGF0ZWQgdmVyc2lvbi4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvMTg5XG4gKlxuICogSXQgZXhwb3NlcyBpdHMgY3VycmVudCBzdGF0ZSAoZm9yIFVJcyB0byBob29rIGludG8pLCBhbmQgYSBjaGVjaygpIGZ1bmN0aW9uIHVzZWQgdG8gc3RhcnQgY2hlY2tpbmcgdGhlIHZlcnNpb24uXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBFbnVtZXJhdGlvblByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgU2ltVmVyc2lvbiBmcm9tICcuLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvYnJvd3Nlci1hbmQtbm9kZS9TaW1WZXJzaW9uLmpzJztcbmltcG9ydCBqb2lzdCBmcm9tICcuL2pvaXN0LmpzJztcbmltcG9ydCBwYWNrYWdlSlNPTiBmcm9tICcuL3BhY2thZ2VKU09OLmpzJzsgLy8gcGFyc2UgbmFtZS92ZXJzaW9uIG91dCBvZiB0aGUgcGFja2FnZS5qc29uXG5pbXBvcnQgVXBkYXRlU3RhdGUgZnJvbSAnLi9VcGRhdGVTdGF0ZS5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3Qgc2ltTmFtZSA9IHBhY2thZ2VKU09OLm5hbWU7XG5jb25zdCBzaW1WZXJzaW9uID0gU2ltVmVyc2lvbi5wYXJzZSggcGFja2FnZUpTT04udmVyc2lvbiwgcGhldC5jaGlwcGVyLmJ1aWxkVGltZXN0YW1wICk7XG5jb25zdCByZXF1ZXN0UHJvdG9jb2xTdHJpbmcgPSAoIGRvY3VtZW50LmxvY2F0aW9uLnByb3RvY29sID09PSAnaHR0cHM6JyA/ICdodHRwczonIDogJ2h0dHA6JyApO1xuY29uc3QgVElNRU9VVF9NSUxMSVNFQ09ORFMgPSAxNTAwMDsgLy8gSG93IG1hbnkgbXMgYmVmb3JlIHdlIHRpbWUgb3V0IChzZXQgdG8gJ29mZmxpbmUnKVxuXG5jbGFzcyBVcGRhdGVDaGVjayB7XG4gIHB1YmxpYyByZWFkb25seSBzdGF0ZVByb3BlcnR5OiBFbnVtZXJhdGlvblByb3BlcnR5PFVwZGF0ZVN0YXRlPjtcbiAgcHVibGljIGxhdGVzdFZlcnNpb246IFNpbVZlcnNpb24gfCBudWxsOyAvLyB7U2ltVmVyc2lvbnxudWxsfSB3aWxsIGJlIGZpbGxlZCBpbiBieSBjaGVjaygpIGlmIGFwcGxpY2FibGVcbiAgcHVibGljIHJlYWRvbmx5IG91clZlcnNpb246IFNpbVZlcnNpb247IC8vIChqb2lzdC1pbnRlcm5hbCkge1NpbVZlcnNpb259IHZlcnNpb24gb2YgdGhlIHNpbSB0aGF0IGlzIHJ1bm5pbmdcbiAgcHJpdmF0ZSByZWFkb25seSB0aW1lb3V0Q2FsbGJhY2s6ICgpID0+IHZvaWQ7XG4gIHB1YmxpYyByZWFkb25seSBhcmVVcGRhdGVzQ2hlY2tlZDogYm9vbGVhbjsgLy8gV2hldGhlciB3ZSBhY3R1YWxseSBhbGxvdyBjaGVja2luZyBmb3IgdXBkYXRlcywgb3Igc2hvd2luZyBhbnkgdXBkYXRlLXJlbGF0ZWQgVUlzLlxuICBwdWJsaWMgdXBkYXRlVVJMOiBzdHJpbmc7IC8vIFRoZSBVUkwgdG8gYmUgdXNlZCBmb3IgXCJOZXcgdmVyc2lvbiBhdmFpbGFibGVcIiBjbGlja3NcbiAgcHJpdmF0ZSB0aW1lb3V0SWQ6IG51bWJlcjsgLy8gVmFsaWQgb25seSBpZiBgc3RhdGUgPT09IFVwZGF0ZVN0YXRlLkNIRUNLSU5HYCwgdGhlIHRpbWVvdXQgSUQgb2Ygb3VyIHRpbWVvdXQgbGlzdGVuZXJcblxuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG5cbiAgICB0aGlzLnN0YXRlUHJvcGVydHkgPSBuZXcgRW51bWVyYXRpb25Qcm9wZXJ0eSggVXBkYXRlU3RhdGUuVU5DSEVDS0VEICk7XG4gICAgdGhpcy5sYXRlc3RWZXJzaW9uID0gbnVsbDtcbiAgICB0aGlzLm91clZlcnNpb24gPSBzaW1WZXJzaW9uO1xuICAgIHRoaXMudGltZW91dENhbGxiYWNrID0gdGhpcy50aW1lb3V0LmJpbmQoIHRoaXMgKTtcblxuICAgIC8vIElmIGl0J3Mgbm90IFBoRVQtYnJhbmRlZCBPUiBpZiBpdCBpcyBwaGV0LWlvIG9yIGluIHRoZSBwaGV0LWFwcCwgZG8gbm90IGNoZWNrIGZvciB1cGRhdGVzXG4gICAgdGhpcy5hcmVVcGRhdGVzQ2hlY2tlZCA9IHBoZXQuY2hpcHBlci5icmFuZCA9PT0gJ3BoZXQnICYmICFwaGV0LmNoaXBwZXIuaXNBcHAgJiYgcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy55b3R0YTtcblxuICAgIHRoaXMudXBkYXRlVVJMID0gYCR7J2h0dHBzOi8vcGhldC5jb2xvcmFkby5lZHUvaHRtbC1zaW0tdXBkYXRlJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnP3NpbXVsYXRpb249J30ke2VuY29kZVVSSUNvbXBvbmVudCggc2ltTmFtZSApXG4gICAgfSZ2ZXJzaW9uPSR7ZW5jb2RlVVJJQ29tcG9uZW50KCBzaW1WZXJzaW9uLnRvU3RyaW5nKCkgKVxuICAgIH0mYnVpbGRUaW1lc3RhbXA9JHtlbmNvZGVVUklDb21wb25lbnQoIGAke3BoZXQuY2hpcHBlci5idWlsZFRpbWVzdGFtcH1gICl9YDtcblxuICAgIHRoaXMudGltZW91dElkID0gLTE7XG4gIH1cblxuICAvLyBDbGVhcnMgb3VyIHRpbWVvdXQgbGlzdGVuZXIuXG4gIHByaXZhdGUgY2xlYXJUaW1lb3V0KCk6IHZvaWQge1xuICAgIHdpbmRvdy5jbGVhclRpbWVvdXQoIHRoaXMudGltZW91dElkICk7XG4gIH1cblxuICAvL1NldHMgb3VyIHRpbWVvdXQgbGlzdGVuZXIuXG4gIHByaXZhdGUgc2V0VGltZW91dCgpOiB2b2lkIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L2JhZC1zaW0tdGV4dFxuICAgIHRoaXMudGltZW91dElkID0gd2luZG93LnNldFRpbWVvdXQoIHRoaXMudGltZW91dENhbGxiYWNrLCBUSU1FT1VUX01JTExJU0VDT05EUyApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvYmFkLXNpbS10ZXh0XG4gIH1cblxuICAvLyBJZiB3ZSBhcmUgY2hlY2tpbmcsIGl0IHJlc2V0cyBvdXIgdGltZW91dCB0aW1lciB0byBUSU1FT1VUX01JTExJU0VDT05EU1xuICBwdWJsaWMgcmVzZXRUaW1lb3V0KCk6IHZvaWQge1xuICAgIGlmICggdGhpcy5zdGF0ZVByb3BlcnR5LnZhbHVlID09PSBVcGRhdGVTdGF0ZS5DSEVDS0lORyApIHtcbiAgICAgIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG4gICAgICB0aGlzLnNldFRpbWVvdXQoKTtcbiAgICB9XG4gIH1cblxuICAvLyBXaGF0IGhhcHBlbnMgd2hlbiB3ZSBhY3R1YWxseSB0aW1lIG91dC5cbiAgcHJpdmF0ZSB0aW1lb3V0KCk6IHZvaWQge1xuICAgIHRoaXMuc3RhdGVQcm9wZXJ0eS52YWx1ZSA9IFVwZGF0ZVN0YXRlLk9GRkxJTkU7XG4gIH1cblxuICAvKipcbiAgICogS2lja3Mgb2ZmIHRoZSB2ZXJzaW9uIGNoZWNraW5nIHJlcXVlc3QgKGlmIGFibGUpLCByZXN1bHRpbmcgaW4gc3RhdGUgY2hhbmdlcy5cbiAgICovXG4gIHB1YmxpYyBjaGVjaygpOiB2b2lkIHtcbiAgICBpZiAoICF0aGlzLmFyZVVwZGF0ZXNDaGVja2VkIHx8ICggdGhpcy5zdGF0ZVByb3BlcnR5LnZhbHVlICE9PSBVcGRhdGVTdGF0ZS5VTkNIRUNLRUQgJiYgdGhpcy5zdGF0ZVByb3BlcnR5LnZhbHVlICE9PSBVcGRhdGVTdGF0ZS5PRkZMSU5FICkgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSWYgb3VyIHNpbSdzIHZlcnNpb24gaW5kaWNhdGVzIGl0IGhhc24ndCBiZWVuIHB1Ymxpc2hlZCwgZG9uJ3QgYXR0ZW1wdCB0byBzZW5kIGEgcmVxdWVzdCBmb3Igbm93XG4gICAgaWYgKCB0aGlzLm91clZlcnNpb24uaXNTaW1Ob3RQdWJsaXNoZWQgKSB7XG4gICAgICB0aGlzLnN0YXRlUHJvcGVydHkudmFsdWUgPSBVcGRhdGVTdGF0ZS5VUF9UT19EQVRFO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgaWYgKCAnd2l0aENyZWRlbnRpYWxzJyBpbiByZXEgKSB7XG5cbiAgICAgIC8vIHdlJ2xsIGJlIGFibGUgdG8gc2VuZCB0aGUgcHJvcGVyIHR5cGUgb2YgcmVxdWVzdCwgc28gd2UgbWFyayBvdXJzZWxmIGFzIGNoZWNraW5nXG4gICAgICB0aGlzLnN0YXRlUHJvcGVydHkudmFsdWUgPSBVcGRhdGVTdGF0ZS5DSEVDS0lORztcblxuICAgICAgdGhpcy5zZXRUaW1lb3V0KCk7XG5cbiAgICAgIHJlcS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZSggcmVxLnJlc3BvbnNlVGV4dCApO1xuXG4gICAgICAgICAgaWYgKCBkYXRhLmVycm9yICkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coIGBVcGRhdGUgY2hlY2sgZmFpbHVyZTogJHtkYXRhLmVycm9yfWAgKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGVQcm9wZXJ0eS52YWx1ZSA9IFVwZGF0ZVN0YXRlLk9GRkxJTkU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKCB0aGlzLnVwZGF0ZVVSTCApIHtcbiAgICAgICAgICAgICAgdGhpcy51cGRhdGVVUkwgPSBkYXRhLnVwZGF0ZVVSTDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubGF0ZXN0VmVyc2lvbiA9IFNpbVZlcnNpb24ucGFyc2UoIGRhdGEubGF0ZXN0VmVyc2lvbiwgZGF0YS5idWlsZFRpbWVzdGFtcCApO1xuXG4gICAgICAgICAgICAvLyB0aGVzZSBgc3RhdGVgIHN0cmluZ3MgY29tZSBmcm9tIHRoZSB3ZWJzaXRlIHNlcnZpY2UsIGFuZCBzaG91bGQgYmUga2VwdCBpbiBzeW5jIHdpdGhcbiAgICAgICAgICAgIC8vIHdlYnNpdGVcXHNyY1xcamF2YVxcZWR1XFxjb2xvcmFkb1xccGhldFxcd2Vic2l0ZVxcc2VydmljZXNcXENoZWNrSFRNTFVwZGF0ZXMuamF2YVxuICAgICAgICAgICAgaWYgKCBkYXRhLnN0YXRlID09PSAnb3V0LW9mLWRhdGUnICkge1xuICAgICAgICAgICAgICB0aGlzLnN0YXRlUHJvcGVydHkudmFsdWUgPSBVcGRhdGVTdGF0ZS5PVVRfT0ZfREFURTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCBkYXRhLnN0YXRlID09PSAndXAtdG8tZGF0ZScgKSB7XG4gICAgICAgICAgICAgIHRoaXMuc3RhdGVQcm9wZXJ0eS52YWx1ZSA9IFVwZGF0ZVN0YXRlLlVQX1RPX0RBVEU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coIGBGYWlsZWQgdG8gZ2V0IHByb3BlciBzdGF0ZTogJHtkYXRhLnN0YXRlfWAgKTtcbiAgICAgICAgICAgICAgdGhpcy5zdGF0ZVByb3BlcnR5LnZhbHVlID0gVXBkYXRlU3RhdGUuT0ZGTElORTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goIGUgKSB7XG4gICAgICAgICAgdGhpcy5zdGF0ZVByb3BlcnR5LnZhbHVlID0gVXBkYXRlU3RhdGUuT0ZGTElORTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHJlcS5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmNsZWFyVGltZW91dCgpO1xuXG4gICAgICAgIHRoaXMuc3RhdGVQcm9wZXJ0eS52YWx1ZSA9IFVwZGF0ZVN0YXRlLk9GRkxJTkU7XG4gICAgICB9O1xuICAgICAgcmVxLm9wZW4oICdwb3N0JywgYCR7cmVxdWVzdFByb3RvY29sU3RyaW5nfS8vcGhldC5jb2xvcmFkby5lZHUvc2VydmljZXMvY2hlY2staHRtbC11cGRhdGVzYCwgdHJ1ZSApOyAvLyBlbmFibGUgQ09SU1xuICAgICAgcmVxLnNlbmQoIEpTT04uc3RyaW5naWZ5KCB7XG4gICAgICAgIGFwaTogJzEuMCcsXG4gICAgICAgIHNpbXVsYXRpb246IHNpbU5hbWUsXG4gICAgICAgIGxvY2FsZTogcGhldC5qb2lzdC5zaW0ubG9jYWxlLFxuICAgICAgICBjdXJyZW50VmVyc2lvbjogdGhpcy5vdXJWZXJzaW9uLnRvU3RyaW5nKCksXG4gICAgICAgIGJ1aWxkVGltZXN0YW1wOiBwaGV0LmNoaXBwZXIuYnVpbGRUaW1lc3RhbXBcbiAgICAgIH0gKSApO1xuICAgIH1cbiAgfVxufVxuXG5jb25zdCB1cGRhdGVDaGVjayA9IG5ldyBVcGRhdGVDaGVjaygpO1xuam9pc3QucmVnaXN0ZXIoICd1cGRhdGVDaGVjaycsIHVwZGF0ZUNoZWNrICk7XG5leHBvcnQgZGVmYXVsdCB1cGRhdGVDaGVjazsiXSwibmFtZXMiOlsiRW51bWVyYXRpb25Qcm9wZXJ0eSIsIlNpbVZlcnNpb24iLCJqb2lzdCIsInBhY2thZ2VKU09OIiwiVXBkYXRlU3RhdGUiLCJzaW1OYW1lIiwibmFtZSIsInNpbVZlcnNpb24iLCJwYXJzZSIsInZlcnNpb24iLCJwaGV0IiwiY2hpcHBlciIsImJ1aWxkVGltZXN0YW1wIiwicmVxdWVzdFByb3RvY29sU3RyaW5nIiwiZG9jdW1lbnQiLCJsb2NhdGlvbiIsInByb3RvY29sIiwiVElNRU9VVF9NSUxMSVNFQ09ORFMiLCJVcGRhdGVDaGVjayIsImNsZWFyVGltZW91dCIsIndpbmRvdyIsInRpbWVvdXRJZCIsInNldFRpbWVvdXQiLCJ0aW1lb3V0Q2FsbGJhY2siLCJyZXNldFRpbWVvdXQiLCJzdGF0ZVByb3BlcnR5IiwidmFsdWUiLCJDSEVDS0lORyIsInRpbWVvdXQiLCJPRkZMSU5FIiwiY2hlY2siLCJhcmVVcGRhdGVzQ2hlY2tlZCIsIlVOQ0hFQ0tFRCIsIm91clZlcnNpb24iLCJpc1NpbU5vdFB1Ymxpc2hlZCIsIlVQX1RPX0RBVEUiLCJyZXEiLCJYTUxIdHRwUmVxdWVzdCIsIm9ubG9hZCIsImRhdGEiLCJKU09OIiwicmVzcG9uc2VUZXh0IiwiZXJyb3IiLCJjb25zb2xlIiwibG9nIiwidXBkYXRlVVJMIiwibGF0ZXN0VmVyc2lvbiIsInN0YXRlIiwiT1VUX09GX0RBVEUiLCJlIiwib25lcnJvciIsIm9wZW4iLCJzZW5kIiwic3RyaW5naWZ5IiwiYXBpIiwic2ltdWxhdGlvbiIsImxvY2FsZSIsInNpbSIsImN1cnJlbnRWZXJzaW9uIiwidG9TdHJpbmciLCJiaW5kIiwiYnJhbmQiLCJpc0FwcCIsInF1ZXJ5UGFyYW1ldGVycyIsInlvdHRhIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwidXBkYXRlQ2hlY2siLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7O0NBT0MsR0FFRCxPQUFPQSx5QkFBeUIsdUNBQXVDO0FBQ3ZFLE9BQU9DLGdCQUFnQiwwREFBMEQ7QUFDakYsT0FBT0MsV0FBVyxhQUFhO0FBQy9CLE9BQU9DLGlCQUFpQixtQkFBbUIsQ0FBQyw2Q0FBNkM7QUFDekYsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQUUzQyxZQUFZO0FBQ1osTUFBTUMsVUFBVUYsWUFBWUcsSUFBSTtBQUNoQyxNQUFNQyxhQUFhTixXQUFXTyxLQUFLLENBQUVMLFlBQVlNLE9BQU8sRUFBRUMsS0FBS0MsT0FBTyxDQUFDQyxjQUFjO0FBQ3JGLE1B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