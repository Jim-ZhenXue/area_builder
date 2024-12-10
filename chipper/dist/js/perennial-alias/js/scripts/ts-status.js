// Copyright 2022, University of Colorado Boulder
/**
 *
 * The ts-status script runs through relevant common code repos and counts the lines of code written in javascript
 * and typescript. Provides data on conversion status, as well as occurrences of @ts-expect-error.
 *
 * Run from sims root directory
 * USAGE:
 * cd ${root containing all repos}
 * node ./perennial/js/scripts/ts-status.js
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 */ const _ = require('lodash');
const fs = require('fs');
// The repositories the script will iterate through to produce data
const repos = [
    'axon',
    'brand',
    'chipper',
    'dot',
    'joist',
    'kite',
    'mobius',
    'nitroglycerin',
    'perennial',
    'phet-core',
    'phet-io',
    'phetcommon',
    'phetmarks',
    'scenery',
    'scenery-phet',
    'shred',
    'studio',
    'sun',
    'tambo',
    'tandem',
    'tappi',
    'twixt',
    'utterance-queue',
    'vegas'
];
// Table headers. Begin here to add another data point.
const jsHeader = 'JS';
const tsHeader = 'TS';
const tsExpectErrorHeader = '"@ts-expect-error"';
const completeHeader = '% Complete';
const tableData = {};
const doesNotCountJS = [
    '-overrides.js'
];
const percent = (numerator, denominator)=>{
    return Math.floor(numerator / denominator * 100);
};
// Counts by every line of text in a file vs `wc -l` which counts by every newline.
// Therefore, `wc -l` is inaccurate by at least 1 line per file.
const countLines = (path)=>{
    const text = fs.readFileSync(path, 'utf8');
    const textLines = text.trim().split(/\r?\n/);
    return textLines.length;
};
// Uses `.include` to check if word is present in line and then ups word count by 1.
// Does not count multiple uses of same word in one line. For those types of scenarios,
// this function is inaccurate.
const countWord = (path, word)=>{
    const occurrence = [];
    const text = fs.readFileSync(path, 'utf8');
    const textLines = text.trim().split(/\r?\n/);
    textLines.forEach((line)=>{
        if (line.includes(word)) {
            occurrence.push(word);
        }
    });
    return occurrence.length;
};
// recursively navigates each repository to find relevant javascript and typescript files
const captureData = (path, tableData)=>{
    let tsCount = 0;
    let jsCount = 0;
    let tsExpectErrorCount = 0;
    const entries = fs.readdirSync(path);
    entries.forEach((file)=>{
        const newPath = `${path}/${file}`;
        if (fs.statSync(newPath).isDirectory()) {
            captureData(newPath, tableData);
        } else if (file.match(/\.js$/)) {
            if (!_.some(doesNotCountJS, (string)=>file.includes(string))) {
                jsCount += countLines(newPath);
            }
        } else if (file.match(/\.ts$/)) {
            tsCount += countLines(newPath);
            tsExpectErrorCount += countWord(newPath, '@ts-expect-error');
        }
    });
    // Adds count to respective key in nested repo object.
    tableData[jsHeader] += jsCount;
    tableData[tsHeader] += tsCount;
    tableData[tsExpectErrorHeader] += tsExpectErrorCount;
};
// iterate through list of common code repos to fill out data
repos.forEach((repo)=>{
    // Sets baseline for nested repo object. New data point baselines should be added here.
    tableData[repo] = {
        [jsHeader]: 0,
        [tsHeader]: 0,
        [completeHeader]: 0,
        [tsExpectErrorHeader]: 0
    };
    const repoData = tableData[repo];
    captureData(`${__dirname}/../../../${repo}/js`, repoData);
    repoData[completeHeader] = percent(repoData.TS, repoData.TS + repoData.JS);
});
// calculates total sum across all provided repos
const rows = Object.values(tableData);
const totalJS = _.sumBy(rows, jsHeader);
const totalTS = _.sumBy(rows, tsHeader);
const totalTSExpectError = _.sumBy(rows, tsExpectErrorHeader);
const summary = `\n --------- SUMMARY ----------
 Total ${tsExpectErrorHeader}: ${totalTSExpectError}
 Total ${jsHeader}: ${totalJS}
 Total ${tsHeader}: ${totalTS}
 ${completeHeader}: ${percent(totalTS, totalTS + totalJS)}%
 `;
console.log(summary);
console.table(tableData);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL3RzLXN0YXR1cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG4vKipcbiAqXG4gKiBUaGUgdHMtc3RhdHVzIHNjcmlwdCBydW5zIHRocm91Z2ggcmVsZXZhbnQgY29tbW9uIGNvZGUgcmVwb3MgYW5kIGNvdW50cyB0aGUgbGluZXMgb2YgY29kZSB3cml0dGVuIGluIGphdmFzY3JpcHRcbiAqIGFuZCB0eXBlc2NyaXB0LiBQcm92aWRlcyBkYXRhIG9uIGNvbnZlcnNpb24gc3RhdHVzLCBhcyB3ZWxsIGFzIG9jY3VycmVuY2VzIG9mIEB0cy1leHBlY3QtZXJyb3IuXG4gKlxuICogUnVuIGZyb20gc2ltcyByb290IGRpcmVjdG9yeVxuICogVVNBR0U6XG4gKiBjZCAke3Jvb3QgY29udGFpbmluZyBhbGwgcmVwb3N9XG4gKiBub2RlIC4vcGVyZW5uaWFsL2pzL3NjcmlwdHMvdHMtc3RhdHVzLmpzXG4gKlxuICogQGF1dGhvciBNYXJsYSBTY2h1bHogKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuY29uc3QgXyA9IHJlcXVpcmUoICdsb2Rhc2gnICk7XG5jb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcblxuLy8gVGhlIHJlcG9zaXRvcmllcyB0aGUgc2NyaXB0IHdpbGwgaXRlcmF0ZSB0aHJvdWdoIHRvIHByb2R1Y2UgZGF0YVxuY29uc3QgcmVwb3MgPSBbXG4gICdheG9uJyxcbiAgJ2JyYW5kJyxcbiAgJ2NoaXBwZXInLFxuICAnZG90JyxcbiAgJ2pvaXN0JyxcbiAgJ2tpdGUnLFxuICAnbW9iaXVzJyxcbiAgJ25pdHJvZ2x5Y2VyaW4nLFxuICAncGVyZW5uaWFsJyxcbiAgJ3BoZXQtY29yZScsXG4gICdwaGV0LWlvJyxcbiAgJ3BoZXRjb21tb24nLFxuICAncGhldG1hcmtzJyxcbiAgJ3NjZW5lcnknLFxuICAnc2NlbmVyeS1waGV0JyxcbiAgJ3NocmVkJyxcbiAgJ3N0dWRpbycsXG4gICdzdW4nLFxuICAndGFtYm8nLFxuICAndGFuZGVtJyxcbiAgJ3RhcHBpJyxcbiAgJ3R3aXh0JyxcbiAgJ3V0dGVyYW5jZS1xdWV1ZScsXG4gICd2ZWdhcydcbl07XG5cbi8vIFRhYmxlIGhlYWRlcnMuIEJlZ2luIGhlcmUgdG8gYWRkIGFub3RoZXIgZGF0YSBwb2ludC5cbmNvbnN0IGpzSGVhZGVyID0gJ0pTJztcbmNvbnN0IHRzSGVhZGVyID0gJ1RTJztcbmNvbnN0IHRzRXhwZWN0RXJyb3JIZWFkZXIgPSAnXCJAdHMtZXhwZWN0LWVycm9yXCInO1xuY29uc3QgY29tcGxldGVIZWFkZXIgPSAnJSBDb21wbGV0ZSc7XG5jb25zdCB0YWJsZURhdGEgPSB7fTtcblxuY29uc3QgZG9lc05vdENvdW50SlMgPSBbICctb3ZlcnJpZGVzLmpzJyBdO1xuXG5cbmNvbnN0IHBlcmNlbnQgPSAoIG51bWVyYXRvciwgZGVub21pbmF0b3IgKSA9PiB7XG4gIHJldHVybiBNYXRoLmZsb29yKCAoIG51bWVyYXRvciAvIGRlbm9taW5hdG9yICkgKiAxMDAgKTtcbn07XG5cbi8vIENvdW50cyBieSBldmVyeSBsaW5lIG9mIHRleHQgaW4gYSBmaWxlIHZzIGB3YyAtbGAgd2hpY2ggY291bnRzIGJ5IGV2ZXJ5IG5ld2xpbmUuXG4vLyBUaGVyZWZvcmUsIGB3YyAtbGAgaXMgaW5hY2N1cmF0ZSBieSBhdCBsZWFzdCAxIGxpbmUgcGVyIGZpbGUuXG5jb25zdCBjb3VudExpbmVzID0gcGF0aCA9PiB7XG4gIGNvbnN0IHRleHQgPSBmcy5yZWFkRmlsZVN5bmMoIHBhdGgsICd1dGY4JyApO1xuICBjb25zdCB0ZXh0TGluZXMgPSB0ZXh0LnRyaW0oKS5zcGxpdCggL1xccj9cXG4vICk7XG4gIHJldHVybiB0ZXh0TGluZXMubGVuZ3RoO1xufTtcblxuLy8gVXNlcyBgLmluY2x1ZGVgIHRvIGNoZWNrIGlmIHdvcmQgaXMgcHJlc2VudCBpbiBsaW5lIGFuZCB0aGVuIHVwcyB3b3JkIGNvdW50IGJ5IDEuXG4vLyBEb2VzIG5vdCBjb3VudCBtdWx0aXBsZSB1c2VzIG9mIHNhbWUgd29yZCBpbiBvbmUgbGluZS4gRm9yIHRob3NlIHR5cGVzIG9mIHNjZW5hcmlvcyxcbi8vIHRoaXMgZnVuY3Rpb24gaXMgaW5hY2N1cmF0ZS5cbmNvbnN0IGNvdW50V29yZCA9ICggcGF0aCwgd29yZCApID0+IHtcbiAgY29uc3Qgb2NjdXJyZW5jZSA9IFtdO1xuICBjb25zdCB0ZXh0ID0gZnMucmVhZEZpbGVTeW5jKCBwYXRoLCAndXRmOCcgKTtcbiAgY29uc3QgdGV4dExpbmVzID0gdGV4dC50cmltKCkuc3BsaXQoIC9cXHI/XFxuLyApO1xuICB0ZXh0TGluZXMuZm9yRWFjaCggbGluZSA9PiB7XG4gICAgaWYgKCBsaW5lLmluY2x1ZGVzKCB3b3JkICkgKSB7XG4gICAgICBvY2N1cnJlbmNlLnB1c2goIHdvcmQgKTtcbiAgICB9XG4gIH0gKTtcbiAgcmV0dXJuIG9jY3VycmVuY2UubGVuZ3RoO1xufTtcblxuLy8gcmVjdXJzaXZlbHkgbmF2aWdhdGVzIGVhY2ggcmVwb3NpdG9yeSB0byBmaW5kIHJlbGV2YW50IGphdmFzY3JpcHQgYW5kIHR5cGVzY3JpcHQgZmlsZXNcbmNvbnN0IGNhcHR1cmVEYXRhID0gKCBwYXRoLCB0YWJsZURhdGEgKSA9PiB7XG4gIGxldCB0c0NvdW50ID0gMDtcbiAgbGV0IGpzQ291bnQgPSAwO1xuICBsZXQgdHNFeHBlY3RFcnJvckNvdW50ID0gMDtcblxuICBjb25zdCBlbnRyaWVzID0gZnMucmVhZGRpclN5bmMoIHBhdGggKTtcblxuICBlbnRyaWVzLmZvckVhY2goIGZpbGUgPT4ge1xuICAgIGNvbnN0IG5ld1BhdGggPSBgJHtwYXRofS8ke2ZpbGV9YDtcblxuICAgIGlmICggZnMuc3RhdFN5bmMoIG5ld1BhdGggKS5pc0RpcmVjdG9yeSgpICkge1xuICAgICAgY2FwdHVyZURhdGEoIG5ld1BhdGgsIHRhYmxlRGF0YSApO1xuICAgIH1cbiAgICBlbHNlIGlmICggZmlsZS5tYXRjaCggL1xcLmpzJC8gKSApIHtcbiAgICAgIGlmICggIV8uc29tZSggZG9lc05vdENvdW50SlMsIHN0cmluZyA9PiBmaWxlLmluY2x1ZGVzKCBzdHJpbmcgKSApICkge1xuICAgICAgICBqc0NvdW50ICs9IGNvdW50TGluZXMoIG5ld1BhdGggKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoIGZpbGUubWF0Y2goIC9cXC50cyQvICkgKSB7XG4gICAgICB0c0NvdW50ICs9IGNvdW50TGluZXMoIG5ld1BhdGggKTtcbiAgICAgIHRzRXhwZWN0RXJyb3JDb3VudCArPSBjb3VudFdvcmQoIG5ld1BhdGgsICdAdHMtZXhwZWN0LWVycm9yJyApO1xuICAgIH1cbiAgfSApO1xuXG4gIC8vIEFkZHMgY291bnQgdG8gcmVzcGVjdGl2ZSBrZXkgaW4gbmVzdGVkIHJlcG8gb2JqZWN0LlxuICB0YWJsZURhdGFbIGpzSGVhZGVyIF0gKz0ganNDb3VudDtcbiAgdGFibGVEYXRhWyB0c0hlYWRlciBdICs9IHRzQ291bnQ7XG4gIHRhYmxlRGF0YVsgdHNFeHBlY3RFcnJvckhlYWRlciBdICs9IHRzRXhwZWN0RXJyb3JDb3VudDtcbn07XG5cbi8vIGl0ZXJhdGUgdGhyb3VnaCBsaXN0IG9mIGNvbW1vbiBjb2RlIHJlcG9zIHRvIGZpbGwgb3V0IGRhdGFcbnJlcG9zLmZvckVhY2goIHJlcG8gPT4ge1xuXG4gIC8vIFNldHMgYmFzZWxpbmUgZm9yIG5lc3RlZCByZXBvIG9iamVjdC4gTmV3IGRhdGEgcG9pbnQgYmFzZWxpbmVzIHNob3VsZCBiZSBhZGRlZCBoZXJlLlxuICB0YWJsZURhdGFbIHJlcG8gXSA9IHtcbiAgICBbIGpzSGVhZGVyIF06IDAsXG4gICAgWyB0c0hlYWRlciBdOiAwLFxuICAgIFsgY29tcGxldGVIZWFkZXIgXTogMCxcbiAgICBbIHRzRXhwZWN0RXJyb3JIZWFkZXIgXTogMFxuICB9O1xuICBjb25zdCByZXBvRGF0YSA9IHRhYmxlRGF0YVsgcmVwbyBdO1xuXG4gIGNhcHR1cmVEYXRhKCBgJHtfX2Rpcm5hbWV9Ly4uLy4uLy4uLyR7cmVwb30vanNgLCByZXBvRGF0YSApO1xuXG4gIHJlcG9EYXRhWyBjb21wbGV0ZUhlYWRlciBdID0gcGVyY2VudCggcmVwb0RhdGEuVFMsIHJlcG9EYXRhLlRTICsgcmVwb0RhdGEuSlMgKTtcbn0gKTtcblxuXG4vLyBjYWxjdWxhdGVzIHRvdGFsIHN1bSBhY3Jvc3MgYWxsIHByb3ZpZGVkIHJlcG9zXG5jb25zdCByb3dzID0gT2JqZWN0LnZhbHVlcyggdGFibGVEYXRhICk7XG5jb25zdCB0b3RhbEpTID0gXy5zdW1CeSggcm93cywganNIZWFkZXIgKTtcbmNvbnN0IHRvdGFsVFMgPSBfLnN1bUJ5KCByb3dzLCB0c0hlYWRlciApO1xuY29uc3QgdG90YWxUU0V4cGVjdEVycm9yID0gXy5zdW1CeSggcm93cywgdHNFeHBlY3RFcnJvckhlYWRlciApO1xuXG5jb25zdCBzdW1tYXJ5ID0gYFxcbiAtLS0tLS0tLS0gU1VNTUFSWSAtLS0tLS0tLS0tXG4gVG90YWwgJHt0c0V4cGVjdEVycm9ySGVhZGVyfTogJHt0b3RhbFRTRXhwZWN0RXJyb3J9XG4gVG90YWwgJHtqc0hlYWRlcn06ICR7dG90YWxKU31cbiBUb3RhbCAke3RzSGVhZGVyfTogJHt0b3RhbFRTfVxuICR7Y29tcGxldGVIZWFkZXJ9OiAke3BlcmNlbnQoIHRvdGFsVFMsIHRvdGFsVFMgKyB0b3RhbEpTICl9JVxuIGA7XG5cbmNvbnNvbGUubG9nKCBzdW1tYXJ5ICk7XG5jb25zb2xlLnRhYmxlKCB0YWJsZURhdGEgKTsiXSwibmFtZXMiOlsiXyIsInJlcXVpcmUiLCJmcyIsInJlcG9zIiwianNIZWFkZXIiLCJ0c0hlYWRlciIsInRzRXhwZWN0RXJyb3JIZWFkZXIiLCJjb21wbGV0ZUhlYWRlciIsInRhYmxlRGF0YSIsImRvZXNOb3RDb3VudEpTIiwicGVyY2VudCIsIm51bWVyYXRvciIsImRlbm9taW5hdG9yIiwiTWF0aCIsImZsb29yIiwiY291bnRMaW5lcyIsInBhdGgiLCJ0ZXh0IiwicmVhZEZpbGVTeW5jIiwidGV4dExpbmVzIiwidHJpbSIsInNwbGl0IiwibGVuZ3RoIiwiY291bnRXb3JkIiwid29yZCIsIm9jY3VycmVuY2UiLCJmb3JFYWNoIiwibGluZSIsImluY2x1ZGVzIiwicHVzaCIsImNhcHR1cmVEYXRhIiwidHNDb3VudCIsImpzQ291bnQiLCJ0c0V4cGVjdEVycm9yQ291bnQiLCJlbnRyaWVzIiwicmVhZGRpclN5bmMiLCJmaWxlIiwibmV3UGF0aCIsInN0YXRTeW5jIiwiaXNEaXJlY3RvcnkiLCJtYXRjaCIsInNvbWUiLCJzdHJpbmciLCJyZXBvIiwicmVwb0RhdGEiLCJfX2Rpcm5hbWUiLCJUUyIsIkpTIiwicm93cyIsIk9iamVjdCIsInZhbHVlcyIsInRvdGFsSlMiLCJzdW1CeSIsInRvdGFsVFMiLCJ0b3RhbFRTRXhwZWN0RXJyb3IiLCJzdW1tYXJ5IiwiY29uc29sZSIsImxvZyIsInRhYmxlIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFDakQ7Ozs7Ozs7Ozs7O0NBV0MsR0FFRCxNQUFNQSxJQUFJQyxRQUFTO0FBQ25CLE1BQU1DLEtBQUtELFFBQVM7QUFFcEIsbUVBQW1FO0FBQ25FLE1BQU1FLFFBQVE7SUFDWjtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7Q0FDRDtBQUVELHVEQUF1RDtBQUN2RCxNQUFNQyxXQUFXO0FBQ2pCLE1BQU1DLFdBQVc7QUFDakIsTUFBTUMsc0JBQXNCO0FBQzVCLE1BQU1DLGlCQUFpQjtBQUN2QixNQUFNQyxZQUFZLENBQUM7QUFFbkIsTUFBTUMsaUJBQWlCO0lBQUU7Q0FBaUI7QUFHMUMsTUFBTUMsVUFBVSxDQUFFQyxXQUFXQztJQUMzQixPQUFPQyxLQUFLQyxLQUFLLENBQUUsQUFBRUgsWUFBWUMsY0FBZ0I7QUFDbkQ7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