// Copyright 2015-2024, University of Colorado Boulder
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
import assert from 'assert';
import fs, { readFileSync } from 'fs';
import https from 'https';
import _ from 'lodash';
import axios from '../../../../perennial-alias/js/npm-dependencies/axios.js';
import grunt from '../../../../perennial-alias/js/npm-dependencies/grunt.js';
import ChipperConstants from '../../common/ChipperConstants.js';
/**
 * Creates a report of third-party resources (code, images, sound, etc) used in the published PhET simulations by
 * reading the license information in published HTML files on the PhET website. This task must be run from main/.
 *
 * Creates a composite report of all of the 3rd party images, code, sounds and other media used by all of the published
 * PhET Simulations. The reports is published at: https://github.com/phetsims/sherpa/blob/main/third-party-licenses.md
 *
 * Usage:
 * grunt report-third-party
 * // then push sherpa/third-party-licenses.md
 *
 * Third party entries are parsed from the HTML files for all simulations published on the PhET website.
 * See getLicenseEntry.js for documentation of the fields in the entries.
 *
 * Copy the local-auth-code key value from phet-server2:/usr/local/tomcat8/conf/context.xml into the value for
 * websiteAuthorizationCode in ~/.phet/build-local.json
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ _async_to_generator(function*() {
    // read configuration file - required to write to website database
    const serverName = 'phet.colorado.edu';
    const BUILD_LOCAL_FILENAME = `${process.env.HOME}/.phet/build-local.json`;
    const buildLocalJSON = JSON.parse(fs.readFileSync(BUILD_LOCAL_FILENAME, {
        encoding: 'utf-8'
    }));
    assert(buildLocalJSON && buildLocalJSON.websiteAuthorizationCode, `websiteAuthorizationCode missing from ${BUILD_LOCAL_FILENAME}`);
    // The file where the report will be written
    const outputFilename = '../sherpa/third-party-licenses.md';
    // Aggregate results for each of the license types
    const compositeCode = {};
    const compositeMedia = {};
    // List of all of the repository names, so that we can detect which libraries are used by all-sims
    const simTitles = [];
    // List of libraries for each sim
    // Type: string in JSON format
    const simLibraries = [];
    // Download all sims. If it's not published, it will be skipped in the report
    const activeSims = fs.readFileSync('../perennial-alias/data/active-sims', 'utf-8').trim().split('\n').map((sim)=>sim.trim());
    for (const sim of activeSims){
        const url = `https://${serverName}/sims/html/${sim}/latest/${sim}_en.html`;
        console.log(`downloading ${sim}`);
        try {
            const html = (yield axios(url)).data.trim();
            const startIndex = html.indexOf(ChipperConstants.START_THIRD_PARTY_LICENSE_ENTRIES);
            const endIndex = html.indexOf(ChipperConstants.END_THIRD_PARTY_LICENSE_ENTRIES);
            const substring = html.substring(startIndex, endIndex);
            const firstCurlyBrace = substring.indexOf('{');
            const lastCurlyBrace = substring.lastIndexOf('}');
            const jsonString = substring.substring(firstCurlyBrace, lastCurlyBrace + 1);
            const json = JSON.parse(jsonString);
            let title = parseTitle(html);
            if (!title || title.startsWith('undefined') || title.startsWith('TITLE')) {
                grunt.log.writeln(`title not found for ${sim}`);
                title = sim;
            }
            augment(title, json.lib, compositeCode);
            augment(title, json.sounds, compositeMedia);
            augment(title, json.images, compositeMedia);
            simTitles.push(title);
            // Concatenate all the libraries for this sim with html newline.
            let libString = '';
            for(const entry in json.lib){
                libString += `${entry}<br/>`;
            }
            //  Update the object to be pushed to the website database
            simLibraries.push({
                name: sim,
                libraries: libString
            });
        } catch (e) {
            console.log(`${sim} not found on production`);
        }
    }
    const requestPromise = new Promise((resolve, reject)=>{
        // Change libraryobject to string in format that the database will recognize.
        // i.e. '{"sim-name":"Library Name<br/>Library Name", ...}'
        const libraryString = `{${simLibraries.map((o)=>`"${o.name}":"${o.libraries}"`).join(',')}}`;
        const requestOptions = {
            host: serverName,
            path: '/services/add-simulation-libraries',
            port: 443,
            method: 'POST',
            auth: `token:${buildLocalJSON.websiteAuthorizationCode}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(libraryString)
            }
        };
        const request = https.request(requestOptions, (res)=>resolve(res));
        request.on('error', (e)=>{
            grunt.log.writeln(`There was a problem uploading the data to the website: ${e.message}`);
            reject(e);
        });
        // write data to request body
        request.write(libraryString);
        request.end();
    });
    grunt.log.writeln('Sending license data to /services/add-simulation-libraries');
    yield requestPromise;
    grunt.log.writeln('Sending data complete');
    // Sort to easily compare lists of repositoryNames with usedBy columns, to see which resources are used by everything.
    simTitles.sort();
    // If anything is used by every sim indicate that here
    for(const entry in compositeCode){
        if (compositeCode.hasOwnProperty(entry)) {
            Array.isArray(compositeCode[entry].usedBy) && compositeCode[entry].usedBy.sort();
            if (_.isEqual(simTitles, compositeCode[entry].usedBy)) {
                compositeCode[entry].usedBy = 'all-sims'; // this is an annotation, not the vestigial all-sims repo
            }
        }
    }
    const licenseJSON = JSON.parse(readFileSync('../sherpa/lib/license.json', 'utf8'));
    const codeOutput = [];
    const codeLicensesUsed = [];
    const mediaLicensesUsed = [];
    // Get a list of the library names
    const libraryNames = [];
    for(const lib in licenseJSON){
        if (licenseJSON.hasOwnProperty(lib)) {
            libraryNames.push(lib);
        }
    }
    // Use a case insensitive sort, see http://stackoverflow.com/questions/8996963/how-to-perform-case-insensitive-sorting-in-javascript
    libraryNames.sort((a, b)=>{
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });
    // Add info for each library to the MD report
    for(let i = 0; i < libraryNames.length; i++){
        const library = libraryNames[i];
        const lineElementsForLibrary = [
            `**${library}**`,
            licenseJSON[library].text.join('<br>'),
            licenseJSON[library].projectURL,
            `License: [${licenseJSON[library].license}](licenses/${library}.txt)`,
            `Notes: ${licenseJSON[library].notes}`
        ];
        if (licenseJSON[library].dependencies) {
            lineElementsForLibrary.push(`Dependencies: **${licenseJSON[library].dependencies}**`);
        }
        if (compositeCode.hasOwnProperty(library) && Array.isArray(compositeCode[library].usedBy)) {
            lineElementsForLibrary.push(`Used by: ${compositeCode[library].usedBy.join(', ')}`);
        }
        // \n worked well when viewing GitHub markdown as an issue comment, but for unknown reasons <br> is necessary when
        // viewing from https://github.com/phetsims/sherpa/blob/main/third-party-licenses.md
        codeOutput.push(lineElementsForLibrary.join('<br>'));
        if (!codeLicensesUsed.includes(licenseJSON[library].license)) {
            codeLicensesUsed.push(licenseJSON[library].license);
        }
    }
    const mediaOutput = [];
    const mediaKeys = [];
    for(const imageAudioEntry in compositeMedia){
        if (compositeMedia.hasOwnProperty(imageAudioEntry)) {
            mediaKeys.push(imageAudioEntry);
        }
    }
    // Use a case insensitive sort, see http://stackoverflow.com/questions/8996963/how-to-perform-case-insensitive-sorting-in-javascript
    mediaKeys.sort((a, b)=>{
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });
    // Create the text for the image and sound, and keep track of which licenses were used by them.
    for(let i = 0; i < mediaKeys.length; i++){
        const mediaKey = mediaKeys[i];
        let text = compositeMedia[mediaKey].text.join('<br>').trim();
        let projectURL = compositeMedia[mediaKey].projectURL.trim();
        if (text.length === 0) {
            text = '(no text)';
        }
        if (projectURL.length === 0) {
            projectURL = '(no project url)';
        }
        let notes = compositeMedia[mediaKey].notes.trim();
        if (notes.length === 0) {
            notes = '(no notes)';
        }
        const license = compositeMedia[mediaKey].license.trim();
        assert && assert(license.length > 0, 'All media entries must have a license');
        const mediaEntryLines = [
            `**${mediaKey}**`,
            text,
            projectURL,
            `License: ${license}`,
            `Notes: ${notes}`
        ];
        // PhET has temporarily chosen to publish John Travoltage with incompatible licenses, so the reasons for
        // making the exceptions are noted here.  The new artwork is being developed now and the simulation
        // will be republished without exception cases soon.
        // This code will remain in case we have other exception cases in the future.
        if (compositeMedia[mediaKey].exception) {
            mediaEntryLines.push(`Exception: ${compositeMedia[mediaKey].exception}`);
        }
        if (license !== 'contact phethelp@colorado.edu') {
            mediaOutput.push(mediaEntryLines.join('<br>'));
            if (!mediaLicensesUsed.includes(license)) {
                mediaLicensesUsed.push(license);
            }
        }
    }
    // Summarize licenses used
    const fileList = simTitles.join('\n* ');
    const outputString = '<!--@formatter:off-->\n' + `${'This report enumerates the third-party resources (code, images, sounds, etc) used in a set of simulations.\n' + '* [Third-party Code](#third-party-code)\n' + '* [Third-party Code License Summary](#third-party-code-license-summary)\n' + '* [Third-party Media](#third-party-media)\n' + '* [Third-party Media License Summary](#third-party-media-license-summary)\n' + '\n' + 'This report is for the following simulations: \n\n* '}${fileList}\n\nTo see the third party resources used in a particular published ` + `simulation, inspect the HTML file between the \`${ChipperConstants.START_THIRD_PARTY_LICENSE_ENTRIES}\` and \`${ChipperConstants.END_THIRD_PARTY_LICENSE_ENTRIES}\` ` + '(only exists in sim publications after Aug 7, 2015).\n' + `# <a name="third-party-code"></a>Third-party Code:<br>\n${codeOutput.join('\n\n')}\n\n` + '---\n' + `# <a name="third-party-code-and-license-summary"></a>Third-party Code License Summary:<br>\n${codeLicensesUsed.join('<br>')}\n\n` + '---\n' + `# <a name="third-party-media"></a>Third-party Media:<br>\n${mediaOutput.join('\n\n')}\n\n` + '---\n' + `# <a name="third-party-media-license-summary"></a>Third-party Media License Summary:<br>\n${mediaLicensesUsed.join('<br>')}\n\n` + '<!--@formatter:on-->\\n';
    // Compare the file output to the existing file, and write & git commit only if different
    if (!grunt.file.exists(outputFilename) || grunt.file.read(outputFilename) !== outputString) {
        grunt.log.writeln(`File output changed, writing file ${outputFilename}`);
        grunt.file.write(outputFilename, outputString);
    } else {
        grunt.log.writeln(`${outputFilename} contents are the same.  No need to save.`);
    }
    /**
   * Given an HTML text, find the title attribute by parsing for <title>
   */ function parseTitle(html) {
        const startKey = '<title>';
        const endKey = '</title>';
        const startIndex = html.indexOf(startKey);
        const endIndex = html.indexOf(endKey);
        return html.substring(startIndex + startKey.length, endIndex).trim();
    }
    /**
   * Add the source (images/sounds/media or code) entries to the destination object, keyed by name.
   */ function augment(repo, source, destination) {
        for(const entry in source){
            if (source.hasOwnProperty(entry)) {
                if (!destination.hasOwnProperty(entry)) {
                    destination[entry] = source[entry]; //overwrites
                    destination[entry].usedBy = [];
                }
                Array.isArray(destination[entry].usedBy) && destination[entry].usedBy.push(repo);
            }
        }
    }
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3Rhc2tzL3JlcG9ydC10aGlyZC1wYXJ0eS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IGZzLCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCBodHRwcyBmcm9tICdodHRwcyc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IGF4aW9zIGZyb20gJy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ucG0tZGVwZW5kZW5jaWVzL2F4aW9zLmpzJztcbmltcG9ydCBncnVudCBmcm9tICcuLi8uLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvbnBtLWRlcGVuZGVuY2llcy9ncnVudC5qcyc7XG5pbXBvcnQgQ2hpcHBlckNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vQ2hpcHBlckNvbnN0YW50cy5qcyc7XG5cbnR5cGUgTGlicmFyeSA9IHtcbiAgbmFtZTogc3RyaW5nO1xuICBsaWJyYXJpZXM6IHN0cmluZztcbn07XG5cbnR5cGUgQXVnbWVudGFibGUgPSBSZWNvcmQ8c3RyaW5nLCB7XG4gIHRleHQ6IHN0cmluZ1tdO1xuICBwcm9qZWN0VVJMOiBzdHJpbmc7XG4gIG5vdGVzOiBzdHJpbmc7XG4gIGxpY2Vuc2U6IHN0cmluZztcbiAgZXhjZXB0aW9uOiBzdHJpbmc7XG4gIHVzZWRCeTogJ2FsbC1zaW1zJyB8IHN0cmluZ1tdO1xufT47XG5cbi8qKlxuICogQ3JlYXRlcyBhIHJlcG9ydCBvZiB0aGlyZC1wYXJ0eSByZXNvdXJjZXMgKGNvZGUsIGltYWdlcywgc291bmQsIGV0YykgdXNlZCBpbiB0aGUgcHVibGlzaGVkIFBoRVQgc2ltdWxhdGlvbnMgYnlcbiAqIHJlYWRpbmcgdGhlIGxpY2Vuc2UgaW5mb3JtYXRpb24gaW4gcHVibGlzaGVkIEhUTUwgZmlsZXMgb24gdGhlIFBoRVQgd2Vic2l0ZS4gVGhpcyB0YXNrIG11c3QgYmUgcnVuIGZyb20gbWFpbi8uXG4gKlxuICogQ3JlYXRlcyBhIGNvbXBvc2l0ZSByZXBvcnQgb2YgYWxsIG9mIHRoZSAzcmQgcGFydHkgaW1hZ2VzLCBjb2RlLCBzb3VuZHMgYW5kIG90aGVyIG1lZGlhIHVzZWQgYnkgYWxsIG9mIHRoZSBwdWJsaXNoZWRcbiAqIFBoRVQgU2ltdWxhdGlvbnMuIFRoZSByZXBvcnRzIGlzIHB1Ymxpc2hlZCBhdDogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NoZXJwYS9ibG9iL21haW4vdGhpcmQtcGFydHktbGljZW5zZXMubWRcbiAqXG4gKiBVc2FnZTpcbiAqIGdydW50IHJlcG9ydC10aGlyZC1wYXJ0eVxuICogLy8gdGhlbiBwdXNoIHNoZXJwYS90aGlyZC1wYXJ0eS1saWNlbnNlcy5tZFxuICpcbiAqIFRoaXJkIHBhcnR5IGVudHJpZXMgYXJlIHBhcnNlZCBmcm9tIHRoZSBIVE1MIGZpbGVzIGZvciBhbGwgc2ltdWxhdGlvbnMgcHVibGlzaGVkIG9uIHRoZSBQaEVUIHdlYnNpdGUuXG4gKiBTZWUgZ2V0TGljZW5zZUVudHJ5LmpzIGZvciBkb2N1bWVudGF0aW9uIG9mIHRoZSBmaWVsZHMgaW4gdGhlIGVudHJpZXMuXG4gKlxuICogQ29weSB0aGUgbG9jYWwtYXV0aC1jb2RlIGtleSB2YWx1ZSBmcm9tIHBoZXQtc2VydmVyMjovdXNyL2xvY2FsL3RvbWNhdDgvY29uZi9jb250ZXh0LnhtbCBpbnRvIHRoZSB2YWx1ZSBmb3JcbiAqIHdlYnNpdGVBdXRob3JpemF0aW9uQ29kZSBpbiB+Ly5waGV0L2J1aWxkLWxvY2FsLmpzb25cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG4oIGFzeW5jICgpID0+IHtcblxuICAvLyByZWFkIGNvbmZpZ3VyYXRpb24gZmlsZSAtIHJlcXVpcmVkIHRvIHdyaXRlIHRvIHdlYnNpdGUgZGF0YWJhc2VcbiAgY29uc3Qgc2VydmVyTmFtZSA9ICdwaGV0LmNvbG9yYWRvLmVkdSc7XG4gIGNvbnN0IEJVSUxEX0xPQ0FMX0ZJTEVOQU1FID0gYCR7cHJvY2Vzcy5lbnYuSE9NRX0vLnBoZXQvYnVpbGQtbG9jYWwuanNvbmA7XG4gIGNvbnN0IGJ1aWxkTG9jYWxKU09OID0gSlNPTi5wYXJzZSggZnMucmVhZEZpbGVTeW5jKCBCVUlMRF9MT0NBTF9GSUxFTkFNRSwgeyBlbmNvZGluZzogJ3V0Zi04JyB9ICkgKTtcbiAgYXNzZXJ0KCBidWlsZExvY2FsSlNPTiAmJiBidWlsZExvY2FsSlNPTi53ZWJzaXRlQXV0aG9yaXphdGlvbkNvZGUsIGB3ZWJzaXRlQXV0aG9yaXphdGlvbkNvZGUgbWlzc2luZyBmcm9tICR7QlVJTERfTE9DQUxfRklMRU5BTUV9YCApO1xuXG4gIC8vIFRoZSBmaWxlIHdoZXJlIHRoZSByZXBvcnQgd2lsbCBiZSB3cml0dGVuXG4gIGNvbnN0IG91dHB1dEZpbGVuYW1lID0gJy4uL3NoZXJwYS90aGlyZC1wYXJ0eS1saWNlbnNlcy5tZCc7XG5cbiAgLy8gQWdncmVnYXRlIHJlc3VsdHMgZm9yIGVhY2ggb2YgdGhlIGxpY2Vuc2UgdHlwZXNcbiAgY29uc3QgY29tcG9zaXRlQ29kZTogQXVnbWVudGFibGUgPSB7fTtcbiAgY29uc3QgY29tcG9zaXRlTWVkaWE6IEF1Z21lbnRhYmxlID0ge307XG5cbiAgLy8gTGlzdCBvZiBhbGwgb2YgdGhlIHJlcG9zaXRvcnkgbmFtZXMsIHNvIHRoYXQgd2UgY2FuIGRldGVjdCB3aGljaCBsaWJyYXJpZXMgYXJlIHVzZWQgYnkgYWxsLXNpbXNcbiAgY29uc3Qgc2ltVGl0bGVzID0gW107XG5cbiAgLy8gTGlzdCBvZiBsaWJyYXJpZXMgZm9yIGVhY2ggc2ltXG4gIC8vIFR5cGU6IHN0cmluZyBpbiBKU09OIGZvcm1hdFxuICBjb25zdCBzaW1MaWJyYXJpZXM6IExpYnJhcnlbXSA9IFtdO1xuXG4gIC8vIERvd25sb2FkIGFsbCBzaW1zLiBJZiBpdCdzIG5vdCBwdWJsaXNoZWQsIGl0IHdpbGwgYmUgc2tpcHBlZCBpbiB0aGUgcmVwb3J0XG4gIGNvbnN0IGFjdGl2ZVNpbXMgPSBmcy5yZWFkRmlsZVN5bmMoICcuLi9wZXJlbm5pYWwtYWxpYXMvZGF0YS9hY3RpdmUtc2ltcycsICd1dGYtOCcgKS50cmltKCkuc3BsaXQoICdcXG4nICkubWFwKCBzaW0gPT4gc2ltLnRyaW0oKSApO1xuXG4gIGZvciAoIGNvbnN0IHNpbSBvZiBhY3RpdmVTaW1zICkge1xuICAgIGNvbnN0IHVybCA9IGBodHRwczovLyR7c2VydmVyTmFtZX0vc2ltcy9odG1sLyR7c2ltfS9sYXRlc3QvJHtzaW19X2VuLmh0bWxgO1xuICAgIGNvbnNvbGUubG9nKCBgZG93bmxvYWRpbmcgJHtzaW19YCApO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBodG1sID0gKCBhd2FpdCBheGlvcyggdXJsICkgKS5kYXRhLnRyaW0oKTtcblxuICAgICAgY29uc3Qgc3RhcnRJbmRleCA9IGh0bWwuaW5kZXhPZiggQ2hpcHBlckNvbnN0YW50cy5TVEFSVF9USElSRF9QQVJUWV9MSUNFTlNFX0VOVFJJRVMgKTtcbiAgICAgIGNvbnN0IGVuZEluZGV4ID0gaHRtbC5pbmRleE9mKCBDaGlwcGVyQ29uc3RhbnRzLkVORF9USElSRF9QQVJUWV9MSUNFTlNFX0VOVFJJRVMgKTtcbiAgICAgIGNvbnN0IHN1YnN0cmluZyA9IGh0bWwuc3Vic3RyaW5nKCBzdGFydEluZGV4LCBlbmRJbmRleCApO1xuXG4gICAgICBjb25zdCBmaXJzdEN1cmx5QnJhY2UgPSBzdWJzdHJpbmcuaW5kZXhPZiggJ3snICk7XG4gICAgICBjb25zdCBsYXN0Q3VybHlCcmFjZSA9IHN1YnN0cmluZy5sYXN0SW5kZXhPZiggJ30nICk7XG4gICAgICBjb25zdCBqc29uU3RyaW5nID0gc3Vic3RyaW5nLnN1YnN0cmluZyggZmlyc3RDdXJseUJyYWNlLCBsYXN0Q3VybHlCcmFjZSArIDEgKTtcblxuICAgICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UoIGpzb25TdHJpbmcgKTtcblxuICAgICAgbGV0IHRpdGxlID0gcGFyc2VUaXRsZSggaHRtbCApO1xuICAgICAgaWYgKCAhdGl0bGUgfHwgdGl0bGUuc3RhcnRzV2l0aCggJ3VuZGVmaW5lZCcgKSB8fCB0aXRsZS5zdGFydHNXaXRoKCAnVElUTEUnICkgKSB7XG4gICAgICAgIGdydW50LmxvZy53cml0ZWxuKCBgdGl0bGUgbm90IGZvdW5kIGZvciAke3NpbX1gICk7XG4gICAgICAgIHRpdGxlID0gc2ltO1xuICAgICAgfVxuICAgICAgYXVnbWVudCggdGl0bGUsIGpzb24ubGliLCBjb21wb3NpdGVDb2RlICk7XG4gICAgICBhdWdtZW50KCB0aXRsZSwganNvbi5zb3VuZHMsIGNvbXBvc2l0ZU1lZGlhICk7XG4gICAgICBhdWdtZW50KCB0aXRsZSwganNvbi5pbWFnZXMsIGNvbXBvc2l0ZU1lZGlhICk7XG5cbiAgICAgIHNpbVRpdGxlcy5wdXNoKCB0aXRsZSApO1xuXG4gICAgICAvLyBDb25jYXRlbmF0ZSBhbGwgdGhlIGxpYnJhcmllcyBmb3IgdGhpcyBzaW0gd2l0aCBodG1sIG5ld2xpbmUuXG4gICAgICBsZXQgbGliU3RyaW5nID0gJyc7XG4gICAgICBmb3IgKCBjb25zdCBlbnRyeSBpbiBqc29uLmxpYiApIHtcbiAgICAgICAgbGliU3RyaW5nICs9IGAke2VudHJ5fTxici8+YDtcbiAgICAgIH1cblxuICAgICAgLy8gIFVwZGF0ZSB0aGUgb2JqZWN0IHRvIGJlIHB1c2hlZCB0byB0aGUgd2Vic2l0ZSBkYXRhYmFzZVxuICAgICAgc2ltTGlicmFyaWVzLnB1c2goIHtcbiAgICAgICAgbmFtZTogc2ltLFxuICAgICAgICBsaWJyYXJpZXM6IGxpYlN0cmluZ1xuICAgICAgfSApO1xuICAgIH1cbiAgICBjYXRjaCggZSApIHtcbiAgICAgIGNvbnNvbGUubG9nKCBgJHtzaW19IG5vdCBmb3VuZCBvbiBwcm9kdWN0aW9uYCApO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlcXVlc3RQcm9taXNlID0gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xuICAgIC8vIENoYW5nZSBsaWJyYXJ5b2JqZWN0IHRvIHN0cmluZyBpbiBmb3JtYXQgdGhhdCB0aGUgZGF0YWJhc2Ugd2lsbCByZWNvZ25pemUuXG4gICAgLy8gaS5lLiAne1wic2ltLW5hbWVcIjpcIkxpYnJhcnkgTmFtZTxici8+TGlicmFyeSBOYW1lXCIsIC4uLn0nXG4gICAgY29uc3QgbGlicmFyeVN0cmluZyA9IGB7JHtzaW1MaWJyYXJpZXMubWFwKCBvID0+IGBcIiR7by5uYW1lfVwiOlwiJHtvLmxpYnJhcmllc31cImAgKS5qb2luKCAnLCcgKX19YDtcblxuICAgIGNvbnN0IHJlcXVlc3RPcHRpb25zID0ge1xuICAgICAgaG9zdDogc2VydmVyTmFtZSxcbiAgICAgIHBhdGg6ICcvc2VydmljZXMvYWRkLXNpbXVsYXRpb24tbGlicmFyaWVzJyxcbiAgICAgIHBvcnQ6IDQ0MyxcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgYXV0aDogYHRva2VuOiR7YnVpbGRMb2NhbEpTT04ud2Vic2l0ZUF1dGhvcml6YXRpb25Db2RlfWAsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogQnVmZmVyLmJ5dGVMZW5ndGgoIGxpYnJhcnlTdHJpbmcgKVxuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCByZXF1ZXN0ID0gaHR0cHMucmVxdWVzdCggcmVxdWVzdE9wdGlvbnMsIHJlcyA9PiByZXNvbHZlKCByZXMgKSApO1xuICAgIHJlcXVlc3Qub24oICdlcnJvcicsIGUgPT4ge1xuICAgICAgZ3J1bnQubG9nLndyaXRlbG4oIGBUaGVyZSB3YXMgYSBwcm9ibGVtIHVwbG9hZGluZyB0aGUgZGF0YSB0byB0aGUgd2Vic2l0ZTogJHtlLm1lc3NhZ2V9YCApO1xuICAgICAgcmVqZWN0KCBlICk7XG4gICAgfSApO1xuXG4gICAgLy8gd3JpdGUgZGF0YSB0byByZXF1ZXN0IGJvZHlcbiAgICByZXF1ZXN0LndyaXRlKCBsaWJyYXJ5U3RyaW5nICk7XG5cbiAgICByZXF1ZXN0LmVuZCgpO1xuICB9ICk7XG5cbiAgZ3J1bnQubG9nLndyaXRlbG4oICdTZW5kaW5nIGxpY2Vuc2UgZGF0YSB0byAvc2VydmljZXMvYWRkLXNpbXVsYXRpb24tbGlicmFyaWVzJyApO1xuICBhd2FpdCByZXF1ZXN0UHJvbWlzZTtcbiAgZ3J1bnQubG9nLndyaXRlbG4oICdTZW5kaW5nIGRhdGEgY29tcGxldGUnICk7XG5cbiAgLy8gU29ydCB0byBlYXNpbHkgY29tcGFyZSBsaXN0cyBvZiByZXBvc2l0b3J5TmFtZXMgd2l0aCB1c2VkQnkgY29sdW1ucywgdG8gc2VlIHdoaWNoIHJlc291cmNlcyBhcmUgdXNlZCBieSBldmVyeXRoaW5nLlxuICBzaW1UaXRsZXMuc29ydCgpO1xuXG4gIC8vIElmIGFueXRoaW5nIGlzIHVzZWQgYnkgZXZlcnkgc2ltIGluZGljYXRlIHRoYXQgaGVyZVxuICBmb3IgKCBjb25zdCBlbnRyeSBpbiBjb21wb3NpdGVDb2RlICkge1xuICAgIGlmICggY29tcG9zaXRlQ29kZS5oYXNPd25Qcm9wZXJ0eSggZW50cnkgKSApIHtcbiAgICAgIEFycmF5LmlzQXJyYXkoIGNvbXBvc2l0ZUNvZGVbIGVudHJ5IF0udXNlZEJ5ICkgJiYgY29tcG9zaXRlQ29kZVsgZW50cnkgXS51c2VkQnkuc29ydCgpO1xuICAgICAgaWYgKCBfLmlzRXF1YWwoIHNpbVRpdGxlcywgY29tcG9zaXRlQ29kZVsgZW50cnkgXS51c2VkQnkgKSApIHtcbiAgICAgICAgY29tcG9zaXRlQ29kZVsgZW50cnkgXS51c2VkQnkgPSAnYWxsLXNpbXMnOyAvLyB0aGlzIGlzIGFuIGFubm90YXRpb24sIG5vdCB0aGUgdmVzdGlnaWFsIGFsbC1zaW1zIHJlcG9cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb25zdCBsaWNlbnNlSlNPTiA9IEpTT04ucGFyc2UoIHJlYWRGaWxlU3luYyggJy4uL3NoZXJwYS9saWIvbGljZW5zZS5qc29uJywgJ3V0ZjgnICkgKTtcblxuICBjb25zdCBjb2RlT3V0cHV0ID0gW107XG4gIGNvbnN0IGNvZGVMaWNlbnNlc1VzZWQ6IHN0cmluZ1tdID0gW107XG4gIGNvbnN0IG1lZGlhTGljZW5zZXNVc2VkOiBzdHJpbmdbXSA9IFtdO1xuXG4gIC8vIEdldCBhIGxpc3Qgb2YgdGhlIGxpYnJhcnkgbmFtZXNcbiAgY29uc3QgbGlicmFyeU5hbWVzID0gW107XG4gIGZvciAoIGNvbnN0IGxpYiBpbiBsaWNlbnNlSlNPTiApIHtcbiAgICBpZiAoIGxpY2Vuc2VKU09OLmhhc093blByb3BlcnR5KCBsaWIgKSApIHtcbiAgICAgIGxpYnJhcnlOYW1lcy5wdXNoKCBsaWIgKTtcbiAgICB9XG4gIH1cblxuICAvLyBVc2UgYSBjYXNlIGluc2Vuc2l0aXZlIHNvcnQsIHNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzg5OTY5NjMvaG93LXRvLXBlcmZvcm0tY2FzZS1pbnNlbnNpdGl2ZS1zb3J0aW5nLWluLWphdmFzY3JpcHRcbiAgbGlicmFyeU5hbWVzLnNvcnQoICggYSwgYiApID0+IHtcbiAgICByZXR1cm4gYS50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUoIGIudG9Mb3dlckNhc2UoKSApO1xuICB9ICk7XG5cbiAgLy8gQWRkIGluZm8gZm9yIGVhY2ggbGlicmFyeSB0byB0aGUgTUQgcmVwb3J0XG4gIGZvciAoIGxldCBpID0gMDsgaSA8IGxpYnJhcnlOYW1lcy5sZW5ndGg7IGkrKyApIHtcbiAgICBjb25zdCBsaWJyYXJ5ID0gbGlicmFyeU5hbWVzWyBpIF07XG5cbiAgICBjb25zdCBsaW5lRWxlbWVudHNGb3JMaWJyYXJ5ID0gW1xuICAgICAgYCoqJHtsaWJyYXJ5fSoqYCxcbiAgICAgIGxpY2Vuc2VKU09OWyBsaWJyYXJ5IF0udGV4dC5qb2luKCAnPGJyPicgKSxcbiAgICAgIGxpY2Vuc2VKU09OWyBsaWJyYXJ5IF0ucHJvamVjdFVSTCxcbiAgICAgIGBMaWNlbnNlOiBbJHtsaWNlbnNlSlNPTlsgbGlicmFyeSBdLmxpY2Vuc2V9XShsaWNlbnNlcy8ke2xpYnJhcnl9LnR4dClgLFxuICAgICAgYE5vdGVzOiAke2xpY2Vuc2VKU09OWyBsaWJyYXJ5IF0ubm90ZXN9YFxuICAgIF07XG5cbiAgICBpZiAoIGxpY2Vuc2VKU09OWyBsaWJyYXJ5IF0uZGVwZW5kZW5jaWVzICkge1xuICAgICAgbGluZUVsZW1lbnRzRm9yTGlicmFyeS5wdXNoKCBgRGVwZW5kZW5jaWVzOiAqKiR7bGljZW5zZUpTT05bIGxpYnJhcnkgXS5kZXBlbmRlbmNpZXN9KipgICk7XG4gICAgfVxuXG4gICAgaWYgKCBjb21wb3NpdGVDb2RlLmhhc093blByb3BlcnR5KCBsaWJyYXJ5ICkgJiYgQXJyYXkuaXNBcnJheSggY29tcG9zaXRlQ29kZVsgbGlicmFyeSBdLnVzZWRCeSApICkge1xuICAgICAgbGluZUVsZW1lbnRzRm9yTGlicmFyeS5wdXNoKCBgVXNlZCBieTogJHtjb21wb3NpdGVDb2RlWyBsaWJyYXJ5IF0udXNlZEJ5LmpvaW4oICcsICcgKX1gICk7XG4gICAgfVxuXG4gICAgLy8gXFxuIHdvcmtlZCB3ZWxsIHdoZW4gdmlld2luZyBHaXRIdWIgbWFya2Rvd24gYXMgYW4gaXNzdWUgY29tbWVudCwgYnV0IGZvciB1bmtub3duIHJlYXNvbnMgPGJyPiBpcyBuZWNlc3Nhcnkgd2hlblxuICAgIC8vIHZpZXdpbmcgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2hlcnBhL2Jsb2IvbWFpbi90aGlyZC1wYXJ0eS1saWNlbnNlcy5tZFxuICAgIGNvZGVPdXRwdXQucHVzaCggbGluZUVsZW1lbnRzRm9yTGlicmFyeS5qb2luKCAnPGJyPicgKSApO1xuXG4gICAgaWYgKCAhY29kZUxpY2Vuc2VzVXNlZC5pbmNsdWRlcyggbGljZW5zZUpTT05bIGxpYnJhcnkgXS5saWNlbnNlICkgKSB7XG4gICAgICBjb2RlTGljZW5zZXNVc2VkLnB1c2goIGxpY2Vuc2VKU09OWyBsaWJyYXJ5IF0ubGljZW5zZSApO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG1lZGlhT3V0cHV0ID0gW107XG4gIGNvbnN0IG1lZGlhS2V5cyA9IFtdO1xuICBmb3IgKCBjb25zdCBpbWFnZUF1ZGlvRW50cnkgaW4gY29tcG9zaXRlTWVkaWEgKSB7XG4gICAgaWYgKCBjb21wb3NpdGVNZWRpYS5oYXNPd25Qcm9wZXJ0eSggaW1hZ2VBdWRpb0VudHJ5ICkgKSB7XG4gICAgICBtZWRpYUtleXMucHVzaCggaW1hZ2VBdWRpb0VudHJ5ICk7XG4gICAgfVxuICB9XG4gIC8vIFVzZSBhIGNhc2UgaW5zZW5zaXRpdmUgc29ydCwgc2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvODk5Njk2My9ob3ctdG8tcGVyZm9ybS1jYXNlLWluc2Vuc2l0aXZlLXNvcnRpbmctaW4tamF2YXNjcmlwdFxuICBtZWRpYUtleXMuc29ydCggKCBhLCBiICkgPT4ge1xuICAgIHJldHVybiBhLnRvTG93ZXJDYXNlKCkubG9jYWxlQ29tcGFyZSggYi50b0xvd2VyQ2FzZSgpICk7XG4gIH0gKTtcblxuICAvLyBDcmVhdGUgdGhlIHRleHQgZm9yIHRoZSBpbWFnZSBhbmQgc291bmQsIGFuZCBrZWVwIHRyYWNrIG9mIHdoaWNoIGxpY2Vuc2VzIHdlcmUgdXNlZCBieSB0aGVtLlxuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBtZWRpYUtleXMubGVuZ3RoOyBpKysgKSB7XG4gICAgY29uc3QgbWVkaWFLZXkgPSBtZWRpYUtleXNbIGkgXTtcblxuICAgIGxldCB0ZXh0ID0gY29tcG9zaXRlTWVkaWFbIG1lZGlhS2V5IF0udGV4dC5qb2luKCAnPGJyPicgKS50cmltKCk7XG4gICAgbGV0IHByb2plY3RVUkwgPSBjb21wb3NpdGVNZWRpYVsgbWVkaWFLZXkgXS5wcm9qZWN0VVJMLnRyaW0oKTtcblxuICAgIGlmICggdGV4dC5sZW5ndGggPT09IDAgKSB7XG4gICAgICB0ZXh0ID0gJyhubyB0ZXh0KSc7XG4gICAgfVxuXG4gICAgaWYgKCBwcm9qZWN0VVJMLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgIHByb2plY3RVUkwgPSAnKG5vIHByb2plY3QgdXJsKSc7XG4gICAgfVxuXG4gICAgbGV0IG5vdGVzID0gY29tcG9zaXRlTWVkaWFbIG1lZGlhS2V5IF0ubm90ZXMudHJpbSgpO1xuICAgIGlmICggbm90ZXMubGVuZ3RoID09PSAwICkge1xuICAgICAgbm90ZXMgPSAnKG5vIG5vdGVzKSc7XG4gICAgfVxuXG4gICAgY29uc3QgbGljZW5zZSA9IGNvbXBvc2l0ZU1lZGlhWyBtZWRpYUtleSBdLmxpY2Vuc2UudHJpbSgpO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxpY2Vuc2UubGVuZ3RoID4gMCwgJ0FsbCBtZWRpYSBlbnRyaWVzIG11c3QgaGF2ZSBhIGxpY2Vuc2UnICk7XG5cbiAgICBjb25zdCBtZWRpYUVudHJ5TGluZXMgPSBbXG4gICAgICBgKioke21lZGlhS2V5fSoqYCxcbiAgICAgIHRleHQsXG4gICAgICBwcm9qZWN0VVJMLFxuICAgICAgYExpY2Vuc2U6ICR7bGljZW5zZX1gLFxuICAgICAgYE5vdGVzOiAke25vdGVzfWBcbiAgICBdO1xuXG4gICAgLy8gUGhFVCBoYXMgdGVtcG9yYXJpbHkgY2hvc2VuIHRvIHB1Ymxpc2ggSm9obiBUcmF2b2x0YWdlIHdpdGggaW5jb21wYXRpYmxlIGxpY2Vuc2VzLCBzbyB0aGUgcmVhc29ucyBmb3JcbiAgICAvLyBtYWtpbmcgdGhlIGV4Y2VwdGlvbnMgYXJlIG5vdGVkIGhlcmUuICBUaGUgbmV3IGFydHdvcmsgaXMgYmVpbmcgZGV2ZWxvcGVkIG5vdyBhbmQgdGhlIHNpbXVsYXRpb25cbiAgICAvLyB3aWxsIGJlIHJlcHVibGlzaGVkIHdpdGhvdXQgZXhjZXB0aW9uIGNhc2VzIHNvb24uXG4gICAgLy8gVGhpcyBjb2RlIHdpbGwgcmVtYWluIGluIGNhc2Ugd2UgaGF2ZSBvdGhlciBleGNlcHRpb24gY2FzZXMgaW4gdGhlIGZ1dHVyZS5cbiAgICBpZiAoIGNvbXBvc2l0ZU1lZGlhWyBtZWRpYUtleSBdLmV4Y2VwdGlvbiApIHtcbiAgICAgIG1lZGlhRW50cnlMaW5lcy5wdXNoKCBgRXhjZXB0aW9uOiAke2NvbXBvc2l0ZU1lZGlhWyBtZWRpYUtleSBdLmV4Y2VwdGlvbn1gICk7XG4gICAgfVxuXG4gICAgaWYgKCBsaWNlbnNlICE9PSAnY29udGFjdCBwaGV0aGVscEBjb2xvcmFkby5lZHUnICkge1xuICAgICAgbWVkaWFPdXRwdXQucHVzaCggbWVkaWFFbnRyeUxpbmVzLmpvaW4oICc8YnI+JyApICk7XG5cbiAgICAgIGlmICggIW1lZGlhTGljZW5zZXNVc2VkLmluY2x1ZGVzKCBsaWNlbnNlICkgKSB7XG4gICAgICAgIG1lZGlhTGljZW5zZXNVc2VkLnB1c2goIGxpY2Vuc2UgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBTdW1tYXJpemUgbGljZW5zZXMgdXNlZFxuICBjb25zdCBmaWxlTGlzdCA9IHNpbVRpdGxlcy5qb2luKCAnXFxuKiAnICk7XG5cbiAgY29uc3Qgb3V0cHV0U3RyaW5nID1cbiAgICAnPCEtLUBmb3JtYXR0ZXI6b2ZmLS0+XFxuJyArXG4gICAgYCR7J1RoaXMgcmVwb3J0IGVudW1lcmF0ZXMgdGhlIHRoaXJkLXBhcnR5IHJlc291cmNlcyAoY29kZSwgaW1hZ2VzLCBzb3VuZHMsIGV0YykgdXNlZCBpbiBhIHNldCBvZiBzaW11bGF0aW9ucy5cXG4nICtcbiAgICAnKiBbVGhpcmQtcGFydHkgQ29kZV0oI3RoaXJkLXBhcnR5LWNvZGUpXFxuJyArXG4gICAgJyogW1RoaXJkLXBhcnR5IENvZGUgTGljZW5zZSBTdW1tYXJ5XSgjdGhpcmQtcGFydHktY29kZS1saWNlbnNlLXN1bW1hcnkpXFxuJyArXG4gICAgJyogW1RoaXJkLXBhcnR5IE1lZGlhXSgjdGhpcmQtcGFydHktbWVkaWEpXFxuJyArXG4gICAgJyogW1RoaXJkLXBhcnR5IE1lZGlhIExpY2Vuc2UgU3VtbWFyeV0oI3RoaXJkLXBhcnR5LW1lZGlhLWxpY2Vuc2Utc3VtbWFyeSlcXG4nICtcbiAgICAnXFxuJyArXG4gICAgJ1RoaXMgcmVwb3J0IGlzIGZvciB0aGUgZm9sbG93aW5nIHNpbXVsYXRpb25zOiBcXG5cXG4qICd9JHtmaWxlTGlzdH1cXG5cXG5UbyBzZWUgdGhlIHRoaXJkIHBhcnR5IHJlc291cmNlcyB1c2VkIGluIGEgcGFydGljdWxhciBwdWJsaXNoZWQgYCArXG4gICAgYHNpbXVsYXRpb24sIGluc3BlY3QgdGhlIEhUTUwgZmlsZSBiZXR3ZWVuIHRoZSBcXGAke0NoaXBwZXJDb25zdGFudHMuU1RBUlRfVEhJUkRfUEFSVFlfTElDRU5TRV9FTlRSSUVTfVxcYCBhbmQgXFxgJHtDaGlwcGVyQ29uc3RhbnRzLkVORF9USElSRF9QQVJUWV9MSUNFTlNFX0VOVFJJRVN9XFxgIGAgK1xuICAgICcob25seSBleGlzdHMgaW4gc2ltIHB1YmxpY2F0aW9ucyBhZnRlciBBdWcgNywgMjAxNSkuXFxuJyArXG4gICAgYCMgPGEgbmFtZT1cInRoaXJkLXBhcnR5LWNvZGVcIj48L2E+VGhpcmQtcGFydHkgQ29kZTo8YnI+XFxuJHtcbiAgICAgIGNvZGVPdXRwdXQuam9pbiggJ1xcblxcbicgKX1cXG5cXG5gICtcblxuICAgICctLS1cXG4nICtcblxuICAgIGAjIDxhIG5hbWU9XCJ0aGlyZC1wYXJ0eS1jb2RlLWFuZC1saWNlbnNlLXN1bW1hcnlcIj48L2E+VGhpcmQtcGFydHkgQ29kZSBMaWNlbnNlIFN1bW1hcnk6PGJyPlxcbiR7XG4gICAgICBjb2RlTGljZW5zZXNVc2VkLmpvaW4oICc8YnI+JyApfVxcblxcbmAgK1xuXG4gICAgJy0tLVxcbicgK1xuXG4gICAgYCMgPGEgbmFtZT1cInRoaXJkLXBhcnR5LW1lZGlhXCI+PC9hPlRoaXJkLXBhcnR5IE1lZGlhOjxicj5cXG4ke1xuICAgICAgbWVkaWFPdXRwdXQuam9pbiggJ1xcblxcbicgKX1cXG5cXG5gICtcblxuICAgICctLS1cXG4nICtcblxuICAgIGAjIDxhIG5hbWU9XCJ0aGlyZC1wYXJ0eS1tZWRpYS1saWNlbnNlLXN1bW1hcnlcIj48L2E+VGhpcmQtcGFydHkgTWVkaWEgTGljZW5zZSBTdW1tYXJ5Ojxicj5cXG4ke1xuICAgICAgbWVkaWFMaWNlbnNlc1VzZWQuam9pbiggJzxicj4nICl9XFxuXFxuYCArXG4gICAgJzwhLS1AZm9ybWF0dGVyOm9uLS0+XFxcXG4nO1xuXG4gIC8vIENvbXBhcmUgdGhlIGZpbGUgb3V0cHV0IHRvIHRoZSBleGlzdGluZyBmaWxlLCBhbmQgd3JpdGUgJiBnaXQgY29tbWl0IG9ubHkgaWYgZGlmZmVyZW50XG4gIGlmICggIWdydW50LmZpbGUuZXhpc3RzKCBvdXRwdXRGaWxlbmFtZSApIHx8IGdydW50LmZpbGUucmVhZCggb3V0cHV0RmlsZW5hbWUgKSAhPT0gb3V0cHV0U3RyaW5nICkge1xuICAgIGdydW50LmxvZy53cml0ZWxuKCBgRmlsZSBvdXRwdXQgY2hhbmdlZCwgd3JpdGluZyBmaWxlICR7b3V0cHV0RmlsZW5hbWV9YCApO1xuICAgIGdydW50LmZpbGUud3JpdGUoIG91dHB1dEZpbGVuYW1lLCBvdXRwdXRTdHJpbmcgKTtcbiAgfVxuICBlbHNlIHtcbiAgICBncnVudC5sb2cud3JpdGVsbiggYCR7b3V0cHV0RmlsZW5hbWV9IGNvbnRlbnRzIGFyZSB0aGUgc2FtZS4gIE5vIG5lZWQgdG8gc2F2ZS5gICk7XG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gYW4gSFRNTCB0ZXh0LCBmaW5kIHRoZSB0aXRsZSBhdHRyaWJ1dGUgYnkgcGFyc2luZyBmb3IgPHRpdGxlPlxuICAgKi9cbiAgZnVuY3Rpb24gcGFyc2VUaXRsZSggaHRtbDogc3RyaW5nICk6IHN0cmluZyB7XG4gICAgY29uc3Qgc3RhcnRLZXkgPSAnPHRpdGxlPic7XG4gICAgY29uc3QgZW5kS2V5ID0gJzwvdGl0bGU+JztcblxuICAgIGNvbnN0IHN0YXJ0SW5kZXggPSBodG1sLmluZGV4T2YoIHN0YXJ0S2V5ICk7XG4gICAgY29uc3QgZW5kSW5kZXggPSBodG1sLmluZGV4T2YoIGVuZEtleSApO1xuXG4gICAgcmV0dXJuIGh0bWwuc3Vic3RyaW5nKCBzdGFydEluZGV4ICsgc3RhcnRLZXkubGVuZ3RoLCBlbmRJbmRleCApLnRyaW0oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgdGhlIHNvdXJjZSAoaW1hZ2VzL3NvdW5kcy9tZWRpYSBvciBjb2RlKSBlbnRyaWVzIHRvIHRoZSBkZXN0aW5hdGlvbiBvYmplY3QsIGtleWVkIGJ5IG5hbWUuXG4gICAqL1xuICBmdW5jdGlvbiBhdWdtZW50KCByZXBvOiBzdHJpbmcsIHNvdXJjZTogQXVnbWVudGFibGUsIGRlc3RpbmF0aW9uOiBBdWdtZW50YWJsZSApOiB2b2lkIHtcbiAgICBmb3IgKCBjb25zdCBlbnRyeSBpbiBzb3VyY2UgKSB7XG4gICAgICBpZiAoIHNvdXJjZS5oYXNPd25Qcm9wZXJ0eSggZW50cnkgKSApIHtcbiAgICAgICAgaWYgKCAhZGVzdGluYXRpb24uaGFzT3duUHJvcGVydHkoIGVudHJ5ICkgKSB7XG4gICAgICAgICAgZGVzdGluYXRpb25bIGVudHJ5IF0gPSBzb3VyY2VbIGVudHJ5IF07Ly9vdmVyd3JpdGVzXG4gICAgICAgICAgZGVzdGluYXRpb25bIGVudHJ5IF0udXNlZEJ5ID0gW107XG4gICAgICAgIH1cbiAgICAgICAgQXJyYXkuaXNBcnJheSggZGVzdGluYXRpb25bIGVudHJ5IF0udXNlZEJ5ICkgJiYgZGVzdGluYXRpb25bIGVudHJ5IF0udXNlZEJ5LnB1c2goIHJlcG8gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0gKSgpOyJdLCJuYW1lcyI6WyJhc3NlcnQiLCJmcyIsInJlYWRGaWxlU3luYyIsImh0dHBzIiwiXyIsImF4aW9zIiwiZ3J1bnQiLCJDaGlwcGVyQ29uc3RhbnRzIiwic2VydmVyTmFtZSIsIkJVSUxEX0xPQ0FMX0ZJTEVOQU1FIiwicHJvY2VzcyIsImVudiIsIkhPTUUiLCJidWlsZExvY2FsSlNPTiIsIkpTT04iLCJwYXJzZSIsImVuY29kaW5nIiwid2Vic2l0ZUF1dGhvcml6YXRpb25Db2RlIiwib3V0cHV0RmlsZW5hbWUiLCJjb21wb3NpdGVDb2RlIiwiY29tcG9zaXRlTWVkaWEiLCJzaW1UaXRsZXMiLCJzaW1MaWJyYXJpZXMiLCJhY3RpdmVTaW1zIiwidHJpbSIsInNwbGl0IiwibWFwIiwic2ltIiwidXJsIiwiY29uc29sZSIsImxvZyIsImh0bWwiLCJkYXRhIiwic3RhcnRJbmRleCIsImluZGV4T2YiLCJTVEFSVF9USElSRF9QQVJUWV9MSUNFTlNFX0VOVFJJRVMiLCJlbmRJbmRleCIsIkVORF9USElSRF9QQVJUWV9MSUNFTlNFX0VOVFJJRVMiLCJzdWJzdHJpbmciLCJmaXJzdEN1cmx5QnJhY2UiLCJsYXN0Q3VybHlCcmFjZSIsImxhc3RJbmRleE9mIiwianNvblN0cmluZyIsImpzb24iLCJ0aXRsZSIsInBhcnNlVGl0bGUiLCJzdGFydHNXaXRoIiwid3JpdGVsbiIsImF1Z21lbnQiLCJsaWIiLCJzb3VuZHMiLCJpbWFnZXMiLCJwdXNoIiwibGliU3RyaW5nIiwiZW50cnkiLCJuYW1lIiwibGlicmFyaWVzIiwiZSIsInJlcXVlc3RQcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJsaWJyYXJ5U3RyaW5nIiwibyIsImpvaW4iLCJyZXF1ZXN0T3B0aW9ucyIsImhvc3QiLCJwYXRoIiwicG9ydCIsIm1ldGhvZCIsImF1dGgiLCJoZWFkZXJzIiwiQnVmZmVyIiwiYnl0ZUxlbmd0aCIsInJlcXVlc3QiLCJyZXMiLCJvbiIsIm1lc3NhZ2UiLCJ3cml0ZSIsImVuZCIsInNvcnQiLCJoYXNPd25Qcm9wZXJ0eSIsIkFycmF5IiwiaXNBcnJheSIsInVzZWRCeSIsImlzRXF1YWwiLCJsaWNlbnNlSlNPTiIsImNvZGVPdXRwdXQiLCJjb2RlTGljZW5zZXNVc2VkIiwibWVkaWFMaWNlbnNlc1VzZWQiLCJsaWJyYXJ5TmFtZXMiLCJhIiwiYiIsInRvTG93ZXJDYXNlIiwibG9jYWxlQ29tcGFyZSIsImkiLCJsZW5ndGgiLCJsaWJyYXJ5IiwibGluZUVsZW1lbnRzRm9yTGlicmFyeSIsInRleHQiLCJwcm9qZWN0VVJMIiwibGljZW5zZSIsIm5vdGVzIiwiZGVwZW5kZW5jaWVzIiwiaW5jbHVkZXMiLCJtZWRpYU91dHB1dCIsIm1lZGlhS2V5cyIsImltYWdlQXVkaW9FbnRyeSIsIm1lZGlhS2V5IiwibWVkaWFFbnRyeUxpbmVzIiwiZXhjZXB0aW9uIiwiZmlsZUxpc3QiLCJvdXRwdXRTdHJpbmciLCJmaWxlIiwiZXhpc3RzIiwicmVhZCIsInN0YXJ0S2V5IiwiZW5kS2V5IiwicmVwbyIsInNvdXJjZSIsImRlc3RpbmF0aW9uIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUV0RCxPQUFPQSxZQUFZLFNBQVM7QUFDNUIsT0FBT0MsTUFBTUMsWUFBWSxRQUFRLEtBQUs7QUFDdEMsT0FBT0MsV0FBVyxRQUFRO0FBQzFCLE9BQU9DLE9BQU8sU0FBUztBQUN2QixPQUFPQyxXQUFXLDJEQUEyRDtBQUM3RSxPQUFPQyxXQUFXLDJEQUEyRDtBQUM3RSxPQUFPQyxzQkFBc0IsbUNBQW1DO0FBZ0JoRTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1CQyxHQUNDLG9CQUFBO0lBRUEsa0VBQWtFO0lBQ2xFLE1BQU1DLGFBQWE7SUFDbkIsTUFBTUMsdUJBQXVCLEdBQUdDLFFBQVFDLEdBQUcsQ0FBQ0MsSUFBSSxDQUFDLHVCQUF1QixDQUFDO0lBQ3pFLE1BQU1DLGlCQUFpQkMsS0FBS0MsS0FBSyxDQUFFZCxHQUFHQyxZQUFZLENBQUVPLHNCQUFzQjtRQUFFTyxVQUFVO0lBQVE7SUFDOUZoQixPQUFRYSxrQkFBa0JBLGVBQWVJLHdCQUF3QixFQUFFLENBQUMsc0NBQXNDLEVBQUVSLHNCQUFzQjtJQUVsSSw0Q0FBNEM7SUFDNUMsTUFBTVMsaUJBQWlCO0lBRXZCLGtEQUFrRDtJQUNsRCxNQUFNQyxnQkFBNkIsQ0FBQztJQUNwQyxNQUFNQyxp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