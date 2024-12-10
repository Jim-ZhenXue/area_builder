// Copyright 2017-2020, University of Colorado Boulder
/**
 * Handles serializing and deserializing versions for simulations.
 *
 * See https://github.com/phetsims/chipper/issues/560 for discussion on version ID definition.
 *
 * The canonical description of our general versions:
 *
 * Each version string has the form: {{MAJOR}}.{{MINOR}}.{{MAINTENANCE}}[-{{TEST_TYPE}}.{{TEST_NUMBER}}] where:
 *
 * MAJOR: Sequential integer, starts at 1, and is generally incremented when there are significant changes to a simulation.
 * MINOR: Sequential integer, starts at 0, and is generally incremented when there are smaller changes to a simulation.
 *   Resets to 0 whenever the major number is incremented.
 * MAINTENANCE: Sequential integer, starts at 0, and is incremented whenever we build with the same major/minor (but with different SHAs).
 *   Resets to 0 whenever the minor number is incremented.
 * TEST_TYPE (when present): Indicates that this is a non-production build when present. Typically will take the values:
 *   'dev' - A normal dev deployment, which goes to phet-dev.colorado.edu/html/
 *   'rc' -  A release-candidate deployment (off of a release branch). Also goes to phet-dev.colorado.edu/html/ only.
 *   anything else - A one-off deployment name, which is the same name as the branch it was deployed from.
 * TEST_NUMBER (when present): Indicates the version of the test/one-off type (gets incremented for every deployment).
 *   starts at 0 in package.json, but since it is incremented on every deploy, the first version published will be 1.
 *
 * It used to be (pre-chipper-2.0) that sometimes a shortened form of the (non-'phet') brand would be added to the end
 * (e.g. '1.3.0-dev.1-phetio' or '1.3.0-dev.1-adaptedfromphet'), or as a direct prefix for the TEST_TYPE (e.g.
 * 1.1.0-phetiodev.1 or 1.1.0-phetio). We have since moved to a deployment model where there are
 * subdirectories for each brand, so this is no longer part of the version. Since this was not used for any production sim
 * builds that we need statistics from, it is excluded in SimVersion.js or its description.
 *
 * Examples:
 *
 * 1.5.0                - Production simulation version (no test type). Major = 1, minor = 5, maintenance = 0
 * 1.5.0-rc.1           - Example of a release-candidate build version that would be published before '1.5.0' for testing.
 * 1.5.0-dev.1          - Example of a dev build that would be from main.
 * 1.5.0-sonification.1 - Example of a one-off build (which would be from the branch 'sonification')
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ // Include @param and @returns in the JSDoc comments for JSDoc api documentation
/* eslint-disable phet/bad-typescript-text */ import affirm from './affirm.js';
let SimVersion = class SimVersion {
    /**
   * Convert into a plain JS object meant for JSON serialization.
   * @public
   *
   * @returns {Object} - with properties like major, minor, maintenance, testType, testNumber, and buildTimestamp
   */ serialize() {
        return {
            major: this.major,
            minor: this.minor,
            maintenance: this.maintenance,
            testType: this.testType,
            testNumber: this.testNumber,
            buildTimestamp: this.buildTimestamp
        };
    }
    /**
   * @ignore - not needed by PhET-iO Clients
   */ get isSimNotPublished() {
        return !!(this.major < 1 || // e.g. 0.0.0-dev.1
        this.major === 1 && // e.g. 1.0.0-dev.1
        this.minor === 0 && this.maintenance === 0 && this.testType);
    }
    /**
   * @ignore - not needed by PhET-iO Clients
   */ get isSimPublished() {
        return !this.isSimNotPublished;
    }
    /**
   * Takes a serialized form of the SimVersion and returns an actual instance.
   * @public
   *
   * @param {Object} - with properties like major, minor, maintenance, testType, testNumber, and buildTimestamp
   * @returns {SimVersion}
   */ static deserialize(// @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    { major, minor, maintenance, testType, testNumber, buildTimestamp }) {
        return new SimVersion(major, minor, maintenance, {
            testType: testType,
            testNumber: testNumber,
            buildTimestamp: buildTimestamp
        });
    }
    /**
   * Compares versions, returning -1 if this version is before the passed in version, 0 if equal, or 1 if this version
   * is after.
   * @public
   *
   * This function only compares major/minor/maintenance, leaving other details to the client.
   *
   * @param {SimVersion} version
   */ compareNumber(version) {
        return SimVersion.comparator(this, version);
    }
    /**
   * Compares versions in standard "comparator" static format, returning -1 if the first parameter SimVersion is
   * before the second parameter SimVersion in version-string, 0 if equal, or 1 if the first parameter SimVersion is
   * after.
   * @public
   *
   * This function only compares major/minor/maintenance, leaving other details to the client.
   *
   * @param {SimVersion} a
   * @param {SimVersion} b
   */ static comparator(a, b) {
        if (a.major < b.major) {
            return -1;
        }
        if (a.major > b.major) {
            return 1;
        }
        if (a.minor < b.minor) {
            return -1;
        }
        if (a.minor > b.minor) {
            return 1;
        }
        if (a.maintenance < b.maintenance) {
            return -1;
        }
        if (a.maintenance > b.maintenance) {
            return 1;
        }
        return 0; // equal
    }
    /**
   * Returns true if the specified version is strictly after this version
   * @param {SimVersion} version
   * @returns {boolean}
   * @public
   */ isAfter(version) {
        return this.compareNumber(version) === 1;
    }
    /**
   * Returns true if the specified version matches or comes before this version.
   * @param version
   * @returns {boolean}
   * @public
   */ isBeforeOrEqualTo(version) {
        return this.compareNumber(version) <= 0;
    }
    /**
   * Returns the string form of the version. Like "1.3.5".
   * @public
   *
   * @returns {string}
   */ toString() {
        let str = `${this.major}.${this.minor}.${this.maintenance}`;
        if (typeof this.testType === 'string') {
            str += `-${this.testType}.${this.testNumber}`;
        }
        return str;
    }
    /**
   * Parses a sim version from a string form.
   * @public
   *
   * @param {string} versionString - e.g. '1.0.0', '1.0.1-dev.3', etc.
   * @param {string} [buildTimestamp] - Optional build timestamp, like '2015-06-12 16:05:03 UTC' (phet.chipper.buildTimestamp)
   * @returns {SimVersion}
   */ static parse(versionString, buildTimestamp) {
        const matches = versionString.match(/^(\d+)\.(\d+)\.(\d+)(-(([^.-]+)\.(\d+)))?(-([^.-]+))?$/);
        if (!matches) {
            throw new Error(`could not parse version: ${versionString}`);
        }
        const major = Number(matches[1]);
        const minor = Number(matches[2]);
        const maintenance = Number(matches[3]);
        const testType = matches[6];
        const testNumber = matches[7] === undefined ? matches[7] : Number(matches[7]);
        return new SimVersion(major, minor, maintenance, {
            testType: testType,
            testNumber: testNumber,
            buildTimestamp: buildTimestamp
        });
    }
    /**
   * Parses a branch in the form {{MAJOR}}.{{MINOR}} and returns a corresponding version. Uses 0 for the maintenance version (unknown).
   * @public
   *
   * @param {string} branch - e.g. '1.0'
   * @returns {SimVersion}
   */ static fromBranch(branch) {
        const bits = branch.split('.');
        affirm(bits.length === 2, `Bad branch, should be {{MAJOR}}.{{MINOR}}, had: ${branch}`);
        const major = Number(branch.split('.')[0]);
        const minor = Number(branch.split('.')[1]);
        return new SimVersion(major, minor, 0);
    }
    /**
   * Ensures that a branch name is ok to be a release branch.
   * @public
   *
   * @param {string} branch - e.g. '1.0'
   * @ignore - not needed by PhET-iO Clients
   */ static ensureReleaseBranch(branch) {
        const version = SimVersion.fromBranch(branch.split('-')[0]);
        affirm(version.major > 0, 'Major version for a branch should be greater than zero');
        affirm(version.minor >= 0, 'Minor version for a branch should be greater than (or equal) to zero');
    }
    /**
   * @constructor
   *
   * @param {number|string} major - The major part of the version (the 3 in 3.1.2)
   * @param {number|string} minor - The minor part of the version (the 1 in 3.1.2)
   * @param {number|string} maintenance - The maintenance part of the version (the 2 in 3.1.2)
   * @param {Object} [options]
   */ constructor(major, minor, maintenance, options = {}){
        if (typeof major === 'string') {
            major = Number(major);
        }
        if (typeof minor === 'string') {
            minor = Number(minor);
        }
        if (typeof maintenance === 'string') {
            maintenance = Number(maintenance);
        }
        if (typeof options.testNumber === 'string') {
            options.testNumber = Number(options.testNumber);
        }
        const { // {string|null} - If provided, indicates the time at which the sim file was built
        buildTimestamp = null, // {string|null} - The test name, e.g. the 'rc' in rc.1. Also can be the one-off version name, if provided.
        testType = null, // {number|string|null} - The test number, e.g. the 1 in rc.1
        testNumber = null } = options;
        affirm(typeof major === 'number' && major >= 0 && major % 1 === 0, `major version should be a non-negative integer: ${major}`);
        affirm(typeof minor === 'number' && minor >= 0 && minor % 1 === 0, `minor version should be a non-negative integer: ${minor}`);
        affirm(typeof maintenance === 'number' && maintenance >= 0 && maintenance % 1 === 0, `maintenance version should be a non-negative integer: ${maintenance}`);
        affirm(typeof testType !== 'string' || typeof testNumber === 'number', 'if testType is provided, testNumber should be a number');
        this.major = major;
        this.minor = minor;
        this.maintenance = maintenance;
        this.testType = testType;
        this.testNumber = testNumber;
        this.buildTimestamp = buildTimestamp;
    }
};
// eslint-disable-next-line phet/default-export-class-should-register-namespace
export { SimVersion as default };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9icm93c2VyLWFuZC1ub2RlL1NpbVZlcnNpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogSGFuZGxlcyBzZXJpYWxpemluZyBhbmQgZGVzZXJpYWxpemluZyB2ZXJzaW9ucyBmb3Igc2ltdWxhdGlvbnMuXG4gKlxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy81NjAgZm9yIGRpc2N1c3Npb24gb24gdmVyc2lvbiBJRCBkZWZpbml0aW9uLlxuICpcbiAqIFRoZSBjYW5vbmljYWwgZGVzY3JpcHRpb24gb2Ygb3VyIGdlbmVyYWwgdmVyc2lvbnM6XG4gKlxuICogRWFjaCB2ZXJzaW9uIHN0cmluZyBoYXMgdGhlIGZvcm06IHt7TUFKT1J9fS57e01JTk9SfX0ue3tNQUlOVEVOQU5DRX19Wy17e1RFU1RfVFlQRX19Lnt7VEVTVF9OVU1CRVJ9fV0gd2hlcmU6XG4gKlxuICogTUFKT1I6IFNlcXVlbnRpYWwgaW50ZWdlciwgc3RhcnRzIGF0IDEsIGFuZCBpcyBnZW5lcmFsbHkgaW5jcmVtZW50ZWQgd2hlbiB0aGVyZSBhcmUgc2lnbmlmaWNhbnQgY2hhbmdlcyB0byBhIHNpbXVsYXRpb24uXG4gKiBNSU5PUjogU2VxdWVudGlhbCBpbnRlZ2VyLCBzdGFydHMgYXQgMCwgYW5kIGlzIGdlbmVyYWxseSBpbmNyZW1lbnRlZCB3aGVuIHRoZXJlIGFyZSBzbWFsbGVyIGNoYW5nZXMgdG8gYSBzaW11bGF0aW9uLlxuICogICBSZXNldHMgdG8gMCB3aGVuZXZlciB0aGUgbWFqb3IgbnVtYmVyIGlzIGluY3JlbWVudGVkLlxuICogTUFJTlRFTkFOQ0U6IFNlcXVlbnRpYWwgaW50ZWdlciwgc3RhcnRzIGF0IDAsIGFuZCBpcyBpbmNyZW1lbnRlZCB3aGVuZXZlciB3ZSBidWlsZCB3aXRoIHRoZSBzYW1lIG1ham9yL21pbm9yIChidXQgd2l0aCBkaWZmZXJlbnQgU0hBcykuXG4gKiAgIFJlc2V0cyB0byAwIHdoZW5ldmVyIHRoZSBtaW5vciBudW1iZXIgaXMgaW5jcmVtZW50ZWQuXG4gKiBURVNUX1RZUEUgKHdoZW4gcHJlc2VudCk6IEluZGljYXRlcyB0aGF0IHRoaXMgaXMgYSBub24tcHJvZHVjdGlvbiBidWlsZCB3aGVuIHByZXNlbnQuIFR5cGljYWxseSB3aWxsIHRha2UgdGhlIHZhbHVlczpcbiAqICAgJ2RldicgLSBBIG5vcm1hbCBkZXYgZGVwbG95bWVudCwgd2hpY2ggZ29lcyB0byBwaGV0LWRldi5jb2xvcmFkby5lZHUvaHRtbC9cbiAqICAgJ3JjJyAtICBBIHJlbGVhc2UtY2FuZGlkYXRlIGRlcGxveW1lbnQgKG9mZiBvZiBhIHJlbGVhc2UgYnJhbmNoKS4gQWxzbyBnb2VzIHRvIHBoZXQtZGV2LmNvbG9yYWRvLmVkdS9odG1sLyBvbmx5LlxuICogICBhbnl0aGluZyBlbHNlIC0gQSBvbmUtb2ZmIGRlcGxveW1lbnQgbmFtZSwgd2hpY2ggaXMgdGhlIHNhbWUgbmFtZSBhcyB0aGUgYnJhbmNoIGl0IHdhcyBkZXBsb3llZCBmcm9tLlxuICogVEVTVF9OVU1CRVIgKHdoZW4gcHJlc2VudCk6IEluZGljYXRlcyB0aGUgdmVyc2lvbiBvZiB0aGUgdGVzdC9vbmUtb2ZmIHR5cGUgKGdldHMgaW5jcmVtZW50ZWQgZm9yIGV2ZXJ5IGRlcGxveW1lbnQpLlxuICogICBzdGFydHMgYXQgMCBpbiBwYWNrYWdlLmpzb24sIGJ1dCBzaW5jZSBpdCBpcyBpbmNyZW1lbnRlZCBvbiBldmVyeSBkZXBsb3ksIHRoZSBmaXJzdCB2ZXJzaW9uIHB1Ymxpc2hlZCB3aWxsIGJlIDEuXG4gKlxuICogSXQgdXNlZCB0byBiZSAocHJlLWNoaXBwZXItMi4wKSB0aGF0IHNvbWV0aW1lcyBhIHNob3J0ZW5lZCBmb3JtIG9mIHRoZSAobm9uLSdwaGV0JykgYnJhbmQgd291bGQgYmUgYWRkZWQgdG8gdGhlIGVuZFxuICogKGUuZy4gJzEuMy4wLWRldi4xLXBoZXRpbycgb3IgJzEuMy4wLWRldi4xLWFkYXB0ZWRmcm9tcGhldCcpLCBvciBhcyBhIGRpcmVjdCBwcmVmaXggZm9yIHRoZSBURVNUX1RZUEUgKGUuZy5cbiAqIDEuMS4wLXBoZXRpb2Rldi4xIG9yIDEuMS4wLXBoZXRpbykuIFdlIGhhdmUgc2luY2UgbW92ZWQgdG8gYSBkZXBsb3ltZW50IG1vZGVsIHdoZXJlIHRoZXJlIGFyZVxuICogc3ViZGlyZWN0b3JpZXMgZm9yIGVhY2ggYnJhbmQsIHNvIHRoaXMgaXMgbm8gbG9uZ2VyIHBhcnQgb2YgdGhlIHZlcnNpb24uIFNpbmNlIHRoaXMgd2FzIG5vdCB1c2VkIGZvciBhbnkgcHJvZHVjdGlvbiBzaW1cbiAqIGJ1aWxkcyB0aGF0IHdlIG5lZWQgc3RhdGlzdGljcyBmcm9tLCBpdCBpcyBleGNsdWRlZCBpbiBTaW1WZXJzaW9uLmpzIG9yIGl0cyBkZXNjcmlwdGlvbi5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAxLjUuMCAgICAgICAgICAgICAgICAtIFByb2R1Y3Rpb24gc2ltdWxhdGlvbiB2ZXJzaW9uIChubyB0ZXN0IHR5cGUpLiBNYWpvciA9IDEsIG1pbm9yID0gNSwgbWFpbnRlbmFuY2UgPSAwXG4gKiAxLjUuMC1yYy4xICAgICAgICAgICAtIEV4YW1wbGUgb2YgYSByZWxlYXNlLWNhbmRpZGF0ZSBidWlsZCB2ZXJzaW9uIHRoYXQgd291bGQgYmUgcHVibGlzaGVkIGJlZm9yZSAnMS41LjAnIGZvciB0ZXN0aW5nLlxuICogMS41LjAtZGV2LjEgICAgICAgICAgLSBFeGFtcGxlIG9mIGEgZGV2IGJ1aWxkIHRoYXQgd291bGQgYmUgZnJvbSBtYWluLlxuICogMS41LjAtc29uaWZpY2F0aW9uLjEgLSBFeGFtcGxlIG9mIGEgb25lLW9mZiBidWlsZCAod2hpY2ggd291bGQgYmUgZnJvbSB0aGUgYnJhbmNoICdzb25pZmljYXRpb24nKVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG4vLyBJbmNsdWRlIEBwYXJhbSBhbmQgQHJldHVybnMgaW4gdGhlIEpTRG9jIGNvbW1lbnRzIGZvciBKU0RvYyBhcGkgZG9jdW1lbnRhdGlvblxuLyogZXNsaW50LWRpc2FibGUgcGhldC9iYWQtdHlwZXNjcmlwdC10ZXh0ICovXG5cbmltcG9ydCBhZmZpcm0gZnJvbSAnLi9hZmZpcm0uanMnO1xuXG50eXBlIFNpbVZlcnNpb25PcHRpb25zID0ge1xuICB0ZXN0VHlwZT86IHN0cmluZyB8IG51bGw7XG4gIHRlc3ROdW1iZXI/OiBudW1iZXIgfCBudWxsO1xuICBidWlsZFRpbWVzdGFtcD86IHN0cmluZyB8IG51bGw7XG59O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcGhldC9kZWZhdWx0LWV4cG9ydC1jbGFzcy1zaG91bGQtcmVnaXN0ZXItbmFtZXNwYWNlXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaW1WZXJzaW9uIHtcbiAgcHVibGljIHJlYWRvbmx5IG1ham9yOiBudW1iZXI7XG4gIHB1YmxpYyByZWFkb25seSBtaW5vcjogbnVtYmVyO1xuICBwdWJsaWMgcmVhZG9ubHkgbWFpbnRlbmFuY2U6IG51bWJlcjtcbiAgcHVibGljIHJlYWRvbmx5IHRlc3RUeXBlOiBzdHJpbmcgfCBudWxsO1xuICBwdWJsaWMgcmVhZG9ubHkgdGVzdE51bWJlcjogbnVtYmVyIHwgbnVsbDtcbiAgcHVibGljIHJlYWRvbmx5IGJ1aWxkVGltZXN0YW1wOiBzdHJpbmcgfCBudWxsOyAvLyBJZiBwcm92aWRlZCwgbGlrZSAnMjAxNS0wNi0xMiAxNjowNTowMyBVVEMnIChwaGV0LmNoaXBwZXIuYnVpbGRUaW1lc3RhbXApXG5cbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcnxzdHJpbmd9IG1ham9yIC0gVGhlIG1ham9yIHBhcnQgb2YgdGhlIHZlcnNpb24gKHRoZSAzIGluIDMuMS4yKVxuICAgKiBAcGFyYW0ge251bWJlcnxzdHJpbmd9IG1pbm9yIC0gVGhlIG1pbm9yIHBhcnQgb2YgdGhlIHZlcnNpb24gKHRoZSAxIGluIDMuMS4yKVxuICAgKiBAcGFyYW0ge251bWJlcnxzdHJpbmd9IG1haW50ZW5hbmNlIC0gVGhlIG1haW50ZW5hbmNlIHBhcnQgb2YgdGhlIHZlcnNpb24gKHRoZSAyIGluIDMuMS4yKVxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIG1ham9yOiBudW1iZXIgfCBzdHJpbmcsIG1pbm9yOiBudW1iZXIgfCBzdHJpbmcsIG1haW50ZW5hbmNlOiBudW1iZXIgfCBzdHJpbmcsIG9wdGlvbnM6IFNpbVZlcnNpb25PcHRpb25zID0ge30gKSB7XG5cbiAgICBpZiAoIHR5cGVvZiBtYWpvciA9PT0gJ3N0cmluZycgKSB7XG4gICAgICBtYWpvciA9IE51bWJlciggbWFqb3IgKTtcbiAgICB9XG4gICAgaWYgKCB0eXBlb2YgbWlub3IgPT09ICdzdHJpbmcnICkge1xuICAgICAgbWlub3IgPSBOdW1iZXIoIG1pbm9yICk7XG4gICAgfVxuICAgIGlmICggdHlwZW9mIG1haW50ZW5hbmNlID09PSAnc3RyaW5nJyApIHtcbiAgICAgIG1haW50ZW5hbmNlID0gTnVtYmVyKCBtYWludGVuYW5jZSApO1xuICAgIH1cbiAgICBpZiAoIHR5cGVvZiBvcHRpb25zLnRlc3ROdW1iZXIgPT09ICdzdHJpbmcnICkge1xuICAgICAgb3B0aW9ucy50ZXN0TnVtYmVyID0gTnVtYmVyKCBvcHRpb25zLnRlc3ROdW1iZXIgKTtcbiAgICB9XG5cbiAgICBjb25zdCB7XG4gICAgICAvLyB7c3RyaW5nfG51bGx9IC0gSWYgcHJvdmlkZWQsIGluZGljYXRlcyB0aGUgdGltZSBhdCB3aGljaCB0aGUgc2ltIGZpbGUgd2FzIGJ1aWx0XG4gICAgICBidWlsZFRpbWVzdGFtcCA9IG51bGwsXG5cbiAgICAgIC8vIHtzdHJpbmd8bnVsbH0gLSBUaGUgdGVzdCBuYW1lLCBlLmcuIHRoZSAncmMnIGluIHJjLjEuIEFsc28gY2FuIGJlIHRoZSBvbmUtb2ZmIHZlcnNpb24gbmFtZSwgaWYgcHJvdmlkZWQuXG4gICAgICB0ZXN0VHlwZSA9IG51bGwsXG5cbiAgICAgIC8vIHtudW1iZXJ8c3RyaW5nfG51bGx9IC0gVGhlIHRlc3QgbnVtYmVyLCBlLmcuIHRoZSAxIGluIHJjLjFcbiAgICAgIHRlc3ROdW1iZXIgPSBudWxsXG4gICAgfSA9IG9wdGlvbnM7XG5cbiAgICBhZmZpcm0oIHR5cGVvZiBtYWpvciA9PT0gJ251bWJlcicgJiYgbWFqb3IgPj0gMCAmJiBtYWpvciAlIDEgPT09IDAsIGBtYWpvciB2ZXJzaW9uIHNob3VsZCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyOiAke21ham9yfWAgKTtcbiAgICBhZmZpcm0oIHR5cGVvZiBtaW5vciA9PT0gJ251bWJlcicgJiYgbWlub3IgPj0gMCAmJiBtaW5vciAlIDEgPT09IDAsIGBtaW5vciB2ZXJzaW9uIHNob3VsZCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyOiAke21pbm9yfWAgKTtcbiAgICBhZmZpcm0oIHR5cGVvZiBtYWludGVuYW5jZSA9PT0gJ251bWJlcicgJiYgbWFpbnRlbmFuY2UgPj0gMCAmJiBtYWludGVuYW5jZSAlIDEgPT09IDAsIGBtYWludGVuYW5jZSB2ZXJzaW9uIHNob3VsZCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyOiAke21haW50ZW5hbmNlfWAgKTtcbiAgICBhZmZpcm0oIHR5cGVvZiB0ZXN0VHlwZSAhPT0gJ3N0cmluZycgfHwgdHlwZW9mIHRlc3ROdW1iZXIgPT09ICdudW1iZXInLCAnaWYgdGVzdFR5cGUgaXMgcHJvdmlkZWQsIHRlc3ROdW1iZXIgc2hvdWxkIGJlIGEgbnVtYmVyJyApO1xuXG4gICAgdGhpcy5tYWpvciA9IG1ham9yO1xuICAgIHRoaXMubWlub3IgPSBtaW5vcjtcbiAgICB0aGlzLm1haW50ZW5hbmNlID0gbWFpbnRlbmFuY2U7XG4gICAgdGhpcy50ZXN0VHlwZSA9IHRlc3RUeXBlO1xuICAgIHRoaXMudGVzdE51bWJlciA9IHRlc3ROdW1iZXI7XG4gICAgdGhpcy5idWlsZFRpbWVzdGFtcCA9IGJ1aWxkVGltZXN0YW1wO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgaW50byBhIHBsYWluIEpTIG9iamVjdCBtZWFudCBmb3IgSlNPTiBzZXJpYWxpemF0aW9uLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IC0gd2l0aCBwcm9wZXJ0aWVzIGxpa2UgbWFqb3IsIG1pbm9yLCBtYWludGVuYW5jZSwgdGVzdFR5cGUsIHRlc3ROdW1iZXIsIGFuZCBidWlsZFRpbWVzdGFtcFxuICAgKi9cbiAgcHVibGljIHNlcmlhbGl6ZSgpOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1ham9yOiB0aGlzLm1ham9yLFxuICAgICAgbWlub3I6IHRoaXMubWlub3IsXG4gICAgICBtYWludGVuYW5jZTogdGhpcy5tYWludGVuYW5jZSxcbiAgICAgIHRlc3RUeXBlOiB0aGlzLnRlc3RUeXBlLFxuICAgICAgdGVzdE51bWJlcjogdGhpcy50ZXN0TnVtYmVyLFxuICAgICAgYnVpbGRUaW1lc3RhbXA6IHRoaXMuYnVpbGRUaW1lc3RhbXBcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEBpZ25vcmUgLSBub3QgbmVlZGVkIGJ5IFBoRVQtaU8gQ2xpZW50c1xuICAgKi9cbiAgcHVibGljIGdldCBpc1NpbU5vdFB1Ymxpc2hlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISEoIHRoaXMubWFqb3IgPCAxIHx8IC8vIGUuZy4gMC4wLjAtZGV2LjFcbiAgICAgICAgICAgICAgICggdGhpcy5tYWpvciA9PT0gMSAmJiAvLyBlLmcuIDEuMC4wLWRldi4xXG4gICAgICAgICAgICAgICAgIHRoaXMubWlub3IgPT09IDAgJiZcbiAgICAgICAgICAgICAgICAgdGhpcy5tYWludGVuYW5jZSA9PT0gMCAmJlxuICAgICAgICAgICAgICAgICB0aGlzLnRlc3RUeXBlICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAaWdub3JlIC0gbm90IG5lZWRlZCBieSBQaEVULWlPIENsaWVudHNcbiAgICovXG4gIHB1YmxpYyBnZXQgaXNTaW1QdWJsaXNoZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICF0aGlzLmlzU2ltTm90UHVibGlzaGVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEgc2VyaWFsaXplZCBmb3JtIG9mIHRoZSBTaW1WZXJzaW9uIGFuZCByZXR1cm5zIGFuIGFjdHVhbCBpbnN0YW5jZS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gLSB3aXRoIHByb3BlcnRpZXMgbGlrZSBtYWpvciwgbWlub3IsIG1haW50ZW5hbmNlLCB0ZXN0VHlwZSwgdGVzdE51bWJlciwgYW5kIGJ1aWxkVGltZXN0YW1wXG4gICAqIEByZXR1cm5zIHtTaW1WZXJzaW9ufVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBkZXNlcmlhbGl6ZShcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9leHBsaWNpdC1tb2R1bGUtYm91bmRhcnktdHlwZXNcbiAgICB7IG1ham9yLCBtaW5vciwgbWFpbnRlbmFuY2UsIHRlc3RUeXBlLCB0ZXN0TnVtYmVyLCBidWlsZFRpbWVzdGFtcCB9ICk6IFNpbVZlcnNpb24ge1xuICAgIHJldHVybiBuZXcgU2ltVmVyc2lvbiggbWFqb3IsIG1pbm9yLCBtYWludGVuYW5jZSwge1xuICAgICAgdGVzdFR5cGU6IHRlc3RUeXBlLFxuICAgICAgdGVzdE51bWJlcjogdGVzdE51bWJlcixcbiAgICAgIGJ1aWxkVGltZXN0YW1wOiBidWlsZFRpbWVzdGFtcFxuICAgIH0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wYXJlcyB2ZXJzaW9ucywgcmV0dXJuaW5nIC0xIGlmIHRoaXMgdmVyc2lvbiBpcyBiZWZvcmUgdGhlIHBhc3NlZCBpbiB2ZXJzaW9uLCAwIGlmIGVxdWFsLCBvciAxIGlmIHRoaXMgdmVyc2lvblxuICAgKiBpcyBhZnRlci5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIG9ubHkgY29tcGFyZXMgbWFqb3IvbWlub3IvbWFpbnRlbmFuY2UsIGxlYXZpbmcgb3RoZXIgZGV0YWlscyB0byB0aGUgY2xpZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge1NpbVZlcnNpb259IHZlcnNpb25cbiAgICovXG4gIHB1YmxpYyBjb21wYXJlTnVtYmVyKCB2ZXJzaW9uOiBTaW1WZXJzaW9uICk6IG51bWJlciB7XG4gICAgcmV0dXJuIFNpbVZlcnNpb24uY29tcGFyYXRvciggdGhpcywgdmVyc2lvbiApO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXBhcmVzIHZlcnNpb25zIGluIHN0YW5kYXJkIFwiY29tcGFyYXRvclwiIHN0YXRpYyBmb3JtYXQsIHJldHVybmluZyAtMSBpZiB0aGUgZmlyc3QgcGFyYW1ldGVyIFNpbVZlcnNpb24gaXNcbiAgICogYmVmb3JlIHRoZSBzZWNvbmQgcGFyYW1ldGVyIFNpbVZlcnNpb24gaW4gdmVyc2lvbi1zdHJpbmcsIDAgaWYgZXF1YWwsIG9yIDEgaWYgdGhlIGZpcnN0IHBhcmFtZXRlciBTaW1WZXJzaW9uIGlzXG4gICAqIGFmdGVyLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gb25seSBjb21wYXJlcyBtYWpvci9taW5vci9tYWludGVuYW5jZSwgbGVhdmluZyBvdGhlciBkZXRhaWxzIHRvIHRoZSBjbGllbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7U2ltVmVyc2lvbn0gYVxuICAgKiBAcGFyYW0ge1NpbVZlcnNpb259IGJcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY29tcGFyYXRvciggYTogU2ltVmVyc2lvbiwgYjogU2ltVmVyc2lvbiApOiBudW1iZXIge1xuICAgIGlmICggYS5tYWpvciA8IGIubWFqb3IgKSB7IHJldHVybiAtMTsgfVxuICAgIGlmICggYS5tYWpvciA+IGIubWFqb3IgKSB7IHJldHVybiAxOyB9XG4gICAgaWYgKCBhLm1pbm9yIDwgYi5taW5vciApIHsgcmV0dXJuIC0xOyB9XG4gICAgaWYgKCBhLm1pbm9yID4gYi5taW5vciApIHsgcmV0dXJuIDE7IH1cbiAgICBpZiAoIGEubWFpbnRlbmFuY2UgPCBiLm1haW50ZW5hbmNlICkgeyByZXR1cm4gLTE7IH1cbiAgICBpZiAoIGEubWFpbnRlbmFuY2UgPiBiLm1haW50ZW5hbmNlICkgeyByZXR1cm4gMTsgfVxuICAgIHJldHVybiAwOyAvLyBlcXVhbFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIHZlcnNpb24gaXMgc3RyaWN0bHkgYWZ0ZXIgdGhpcyB2ZXJzaW9uXG4gICAqIEBwYXJhbSB7U2ltVmVyc2lvbn0gdmVyc2lvblxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgcHVibGljIGlzQWZ0ZXIoIHZlcnNpb246IFNpbVZlcnNpb24gKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY29tcGFyZU51bWJlciggdmVyc2lvbiApID09PSAxO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIHZlcnNpb24gbWF0Y2hlcyBvciBjb21lcyBiZWZvcmUgdGhpcyB2ZXJzaW9uLlxuICAgKiBAcGFyYW0gdmVyc2lvblxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgcHVibGljIGlzQmVmb3JlT3JFcXVhbFRvKCB2ZXJzaW9uOiBTaW1WZXJzaW9uICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNvbXBhcmVOdW1iZXIoIHZlcnNpb24gKSA8PSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHN0cmluZyBmb3JtIG9mIHRoZSB2ZXJzaW9uLiBMaWtlIFwiMS4zLjVcIi5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgbGV0IHN0ciA9IGAke3RoaXMubWFqb3J9LiR7dGhpcy5taW5vcn0uJHt0aGlzLm1haW50ZW5hbmNlfWA7XG4gICAgaWYgKCB0eXBlb2YgdGhpcy50ZXN0VHlwZSA9PT0gJ3N0cmluZycgKSB7XG4gICAgICBzdHIgKz0gYC0ke3RoaXMudGVzdFR5cGV9LiR7dGhpcy50ZXN0TnVtYmVyfWA7XG4gICAgfVxuICAgIHJldHVybiBzdHI7XG4gIH1cblxuICAvKipcbiAgICogUGFyc2VzIGEgc2ltIHZlcnNpb24gZnJvbSBhIHN0cmluZyBmb3JtLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2ZXJzaW9uU3RyaW5nIC0gZS5nLiAnMS4wLjAnLCAnMS4wLjEtZGV2LjMnLCBldGMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbYnVpbGRUaW1lc3RhbXBdIC0gT3B0aW9uYWwgYnVpbGQgdGltZXN0YW1wLCBsaWtlICcyMDE1LTA2LTEyIDE2OjA1OjAzIFVUQycgKHBoZXQuY2hpcHBlci5idWlsZFRpbWVzdGFtcClcbiAgICogQHJldHVybnMge1NpbVZlcnNpb259XG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHBhcnNlKCB2ZXJzaW9uU3RyaW5nOiBzdHJpbmcsIGJ1aWxkVGltZXN0YW1wPzogc3RyaW5nICk6IFNpbVZlcnNpb24ge1xuICAgIGNvbnN0IG1hdGNoZXMgPSB2ZXJzaW9uU3RyaW5nLm1hdGNoKCAvXihcXGQrKVxcLihcXGQrKVxcLihcXGQrKSgtKChbXi4tXSspXFwuKFxcZCspKSk/KC0oW14uLV0rKSk/JC8gKTtcblxuICAgIGlmICggIW1hdGNoZXMgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGBjb3VsZCBub3QgcGFyc2UgdmVyc2lvbjogJHt2ZXJzaW9uU3RyaW5nfWAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBtYWpvciA9IE51bWJlciggbWF0Y2hlc1sgMSBdICk7XG4gICAgY29uc3QgbWlub3IgPSBOdW1iZXIoIG1hdGNoZXNbIDIgXSApO1xuICAgIGNvbnN0IG1haW50ZW5hbmNlID0gTnVtYmVyKCBtYXRjaGVzWyAzIF0gKTtcbiAgICBjb25zdCB0ZXN0VHlwZSA9IG1hdGNoZXNbIDYgXTtcbiAgICBjb25zdCB0ZXN0TnVtYmVyID0gbWF0Y2hlc1sgNyBdID09PSB1bmRlZmluZWQgPyBtYXRjaGVzWyA3IF0gOiBOdW1iZXIoIG1hdGNoZXNbIDcgXSApO1xuXG4gICAgcmV0dXJuIG5ldyBTaW1WZXJzaW9uKCBtYWpvciwgbWlub3IsIG1haW50ZW5hbmNlLCB7XG4gICAgICB0ZXN0VHlwZTogdGVzdFR5cGUsXG4gICAgICB0ZXN0TnVtYmVyOiB0ZXN0TnVtYmVyLFxuICAgICAgYnVpbGRUaW1lc3RhbXA6IGJ1aWxkVGltZXN0YW1wXG4gICAgfSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlcyBhIGJyYW5jaCBpbiB0aGUgZm9ybSB7e01BSk9SfX0ue3tNSU5PUn19IGFuZCByZXR1cm5zIGEgY29ycmVzcG9uZGluZyB2ZXJzaW9uLiBVc2VzIDAgZm9yIHRoZSBtYWludGVuYW5jZSB2ZXJzaW9uICh1bmtub3duKS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYnJhbmNoIC0gZS5nLiAnMS4wJ1xuICAgKiBAcmV0dXJucyB7U2ltVmVyc2lvbn1cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZnJvbUJyYW5jaCggYnJhbmNoOiBzdHJpbmcgKTogU2ltVmVyc2lvbiB7XG4gICAgY29uc3QgYml0cyA9IGJyYW5jaC5zcGxpdCggJy4nICk7XG4gICAgYWZmaXJtKCBiaXRzLmxlbmd0aCA9PT0gMiwgYEJhZCBicmFuY2gsIHNob3VsZCBiZSB7e01BSk9SfX0ue3tNSU5PUn19LCBoYWQ6ICR7YnJhbmNofWAgKTtcblxuICAgIGNvbnN0IG1ham9yID0gTnVtYmVyKCBicmFuY2guc3BsaXQoICcuJyApWyAwIF0gKTtcbiAgICBjb25zdCBtaW5vciA9IE51bWJlciggYnJhbmNoLnNwbGl0KCAnLicgKVsgMSBdICk7XG5cbiAgICByZXR1cm4gbmV3IFNpbVZlcnNpb24oIG1ham9yLCBtaW5vciwgMCApO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuc3VyZXMgdGhhdCBhIGJyYW5jaCBuYW1lIGlzIG9rIHRvIGJlIGEgcmVsZWFzZSBicmFuY2guXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGJyYW5jaCAtIGUuZy4gJzEuMCdcbiAgICogQGlnbm9yZSAtIG5vdCBuZWVkZWQgYnkgUGhFVC1pTyBDbGllbnRzXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGVuc3VyZVJlbGVhc2VCcmFuY2goIGJyYW5jaDogc3RyaW5nICk6IHZvaWQge1xuICAgIGNvbnN0IHZlcnNpb24gPSBTaW1WZXJzaW9uLmZyb21CcmFuY2goIGJyYW5jaC5zcGxpdCggJy0nIClbIDAgXSApO1xuICAgIGFmZmlybSggdmVyc2lvbi5tYWpvciA+IDAsICdNYWpvciB2ZXJzaW9uIGZvciBhIGJyYW5jaCBzaG91bGQgYmUgZ3JlYXRlciB0aGFuIHplcm8nICk7XG4gICAgYWZmaXJtKCB2ZXJzaW9uLm1pbm9yID49IDAsICdNaW5vciB2ZXJzaW9uIGZvciBhIGJyYW5jaCBzaG91bGQgYmUgZ3JlYXRlciB0aGFuIChvciBlcXVhbCkgdG8gemVybycgKTtcbiAgfVxufSJdLCJuYW1lcyI6WyJhZmZpcm0iLCJTaW1WZXJzaW9uIiwic2VyaWFsaXplIiwibWFqb3IiLCJtaW5vciIsIm1haW50ZW5hbmNlIiwidGVzdFR5cGUiLCJ0ZXN0TnVtYmVyIiwiYnVpbGRUaW1lc3RhbXAiLCJpc1NpbU5vdFB1Ymxpc2hlZCIsImlzU2ltUHVibGlzaGVkIiwiZGVzZXJpYWxpemUiLCJjb21wYXJlTnVtYmVyIiwidmVyc2lvbiIsImNvbXBhcmF0b3IiLCJhIiwiYiIsImlzQWZ0ZXIiLCJpc0JlZm9yZU9yRXF1YWxUbyIsInRvU3RyaW5nIiwic3RyIiwicGFyc2UiLCJ2ZXJzaW9uU3RyaW5nIiwibWF0Y2hlcyIsIm1hdGNoIiwiRXJyb3IiLCJOdW1iZXIiLCJ1bmRlZmluZWQiLCJmcm9tQnJhbmNoIiwiYnJhbmNoIiwiYml0cyIsInNwbGl0IiwibGVuZ3RoIiwiZW5zdXJlUmVsZWFzZUJyYW5jaCIsIm9wdGlvbnMiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FtQ0MsR0FFRCxnRkFBZ0Y7QUFDaEYsMkNBQTJDLEdBRTNDLE9BQU9BLFlBQVksY0FBYztBQVNsQixJQUFBLEFBQU1DLGFBQU4sTUFBTUE7SUF1RG5COzs7OztHQUtDLEdBQ0QsQUFBT0MsWUFBcUM7UUFDMUMsT0FBTztZQUNMQyxPQUFPLElBQUksQ0FBQ0EsS0FBSztZQUNqQkMsT0FBTyxJQUFJLENBQUNBLEtBQUs7WUFDakJDLGFBQWEsSUFBSSxDQUFDQSxXQUFXO1lBQzdCQyxVQUFVLElBQUksQ0FBQ0EsUUFBUTtZQUN2QkMsWUFBWSxJQUFJLENBQUNBLFVBQVU7WUFDM0JDLGdCQUFnQixJQUFJLENBQUNBLGNBQWM7UUFDckM7SUFDRjtJQUVBOztHQUVDLEdBQ0QsSUFBV0Msb0JBQTZCO1FBQ3RDLE9BQU8sQ0FBQyxDQUFHLENBQUEsSUFBSSxDQUFDTixLQUFLLEdBQUcsS0FBSyxtQkFBbUI7UUFDbkMsSUFBSSxDQUFDQSxLQUFLLEtBQUssS0FBSyxtQkFBbUI7UUFDdkMsSUFBSSxDQUFDQyxLQUFLLEtBQUssS0FDZixJQUFJLENBQUNDLFdBQVcsS0FBSyxLQUNyQixJQUFJLENBQUNDLFFBQVEsQUFBQztJQUM3QjtJQUVBOztHQUVDLEdBQ0QsSUFBV0ksaUJBQTBCO1FBQ25DLE9BQU8sQ0FBQyxJQUFJLENBQUNELGlCQUFpQjtJQUNoQztJQUVBOzs7Ozs7R0FNQyxHQUNELE9BQWNFLFlBQ1osbUJBQW1CO0lBQ25CLDZFQUE2RTtJQUM3RSxFQUFFUixLQUFLLEVBQUVD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