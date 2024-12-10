// Copyright 2024, University of Colorado Boulder
/**
 * registerTasks.js - Registers all *.js or *.ts files in the tasks directory as grunt tasks.
 * Visits the directory only, does not recurse.
 *
 * This file must remain as *.js + requirejs since it is loaded by Gruntfile.cjs
 *
 * Moved out of Gruntfile.cjs on Sept 17, 2024
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ const fs = require('fs');
const getDocumentationForTask = require('./getDocumentationForTask');
const path = require('path');
const gruntSpawn = require('./gruntSpawn');
const assert = require('assert');
const _ = require('lodash');
const isWindows = process.platform.startsWith('win');
const runnable = isWindows ? 'tsx.cmd' : 'tsx';
const tsxCommand = `${path.join(__dirname, `../../../node_modules/.bin/${runnable}`)}`;
/**
 * Grunt tasks generally look like "node grunt TASK [...args]".
 * We only want to forward the options, not the node and grunt runnables, and not the task name. This is complicated
 * because we need to support a fair number of cases:
 * node grunt lint
 * node grunt lint --repo=bumper --all
 * node grunt (default task)
 * node grunt --lint=false
 * grunt lint (not sure this every actually happens, but this algorithm would support it).
 *
 * Assert out eagerly if we get something that is unexpected.
 */ function getArgsToForward(args = process.argv) {
    for(let i = 0; i < args.length; i++){
        // Grunt is the most common runnable, but pm2 seems to have its own way of running code, so support that as well.
        if (args[i].includes('grunt') || /\bpm2\b/.test(args[i])) {
            const nextArg = args[i + 1];
            const isNextArgTheTask = !nextArg || !nextArg.startsWith('-');
            return args.slice(i + (isNextArgTheTask ? 2 : 1));
        }
    }
    assert(false, `unexpected grunt task arguments that didn't launch with "grunt": [${args.join(' ')}]`);
    return [];
}
function execTask(grunt, taskFilename) {
    return ()=>{
        const args = getArgsToForward();
        gruntSpawn(grunt, tsxCommand, [
            taskFilename,
            ...args
        ], process.cwd());
    };
}
const supportedTaskFileExtensions = [
    '.js',
    '.ts',
    '.cjs'
];
module.exports = (grunt, dir)=>{
    assert(fs.existsSync(dir), `dir does not exist: ${dir}`);
    // Load each file from tasks/ and register it as a task
    fs.readdirSync(dir).forEach((file)=>{
        if (_.some(supportedTaskFileExtensions, (extension)=>file.endsWith(extension))) {
            const taskName = file.substring(0, file.lastIndexOf('.'));
            const numberOfFiles = supportedTaskFileExtensions.map((extension)=>fs.existsSync(path.join(dir, `${taskName}${extension}`))).filter(_.identity);
            if (numberOfFiles.length > 1) {
                throw new Error(`Both TypeScript and JavaScript versions of the task ${taskName} exist. Please remove one of them.`);
            } else {
                const absolutePath = path.join(dir, file);
                grunt.registerTask(taskName, getDocumentationForTask(absolutePath), execTask(grunt, absolutePath));
            }
        }
    });
};
module.exports.getArgsToForward = getArgsToForward;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC9jb21tb25qcy9yZWdpc3RlclRhc2tzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbi8qKlxuICogcmVnaXN0ZXJUYXNrcy5qcyAtIFJlZ2lzdGVycyBhbGwgKi5qcyBvciAqLnRzIGZpbGVzIGluIHRoZSB0YXNrcyBkaXJlY3RvcnkgYXMgZ3J1bnQgdGFza3MuXG4gKiBWaXNpdHMgdGhlIGRpcmVjdG9yeSBvbmx5LCBkb2VzIG5vdCByZWN1cnNlLlxuICpcbiAqIFRoaXMgZmlsZSBtdXN0IHJlbWFpbiBhcyAqLmpzICsgcmVxdWlyZWpzIHNpbmNlIGl0IGlzIGxvYWRlZCBieSBHcnVudGZpbGUuY2pzXG4gKlxuICogTW92ZWQgb3V0IG9mIEdydW50ZmlsZS5janMgb24gU2VwdCAxNywgMjAyNFxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xuY29uc3QgZ2V0RG9jdW1lbnRhdGlvbkZvclRhc2sgPSByZXF1aXJlKCAnLi9nZXREb2N1bWVudGF0aW9uRm9yVGFzaycgKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCAncGF0aCcgKTtcbmNvbnN0IGdydW50U3Bhd24gPSByZXF1aXJlKCAnLi9ncnVudFNwYXduJyApO1xuY29uc3QgYXNzZXJ0ID0gcmVxdWlyZSggJ2Fzc2VydCcgKTtcbmNvbnN0IF8gPSByZXF1aXJlKCAnbG9kYXNoJyApO1xuXG5jb25zdCBpc1dpbmRvd3MgPSBwcm9jZXNzLnBsYXRmb3JtLnN0YXJ0c1dpdGgoICd3aW4nICk7XG5jb25zdCBydW5uYWJsZSA9IGlzV2luZG93cyA/ICd0c3guY21kJyA6ICd0c3gnO1xuY29uc3QgdHN4Q29tbWFuZCA9IGAke3BhdGguam9pbiggX19kaXJuYW1lLCBgLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5iaW4vJHtydW5uYWJsZX1gICl9YDtcblxuLyoqXG4gKiBHcnVudCB0YXNrcyBnZW5lcmFsbHkgbG9vayBsaWtlIFwibm9kZSBncnVudCBUQVNLIFsuLi5hcmdzXVwiLlxuICogV2Ugb25seSB3YW50IHRvIGZvcndhcmQgdGhlIG9wdGlvbnMsIG5vdCB0aGUgbm9kZSBhbmQgZ3J1bnQgcnVubmFibGVzLCBhbmQgbm90IHRoZSB0YXNrIG5hbWUuIFRoaXMgaXMgY29tcGxpY2F0ZWRcbiAqIGJlY2F1c2Ugd2UgbmVlZCB0byBzdXBwb3J0IGEgZmFpciBudW1iZXIgb2YgY2FzZXM6XG4gKiBub2RlIGdydW50IGxpbnRcbiAqIG5vZGUgZ3J1bnQgbGludCAtLXJlcG89YnVtcGVyIC0tYWxsXG4gKiBub2RlIGdydW50IChkZWZhdWx0IHRhc2spXG4gKiBub2RlIGdydW50IC0tbGludD1mYWxzZVxuICogZ3J1bnQgbGludCAobm90IHN1cmUgdGhpcyBldmVyeSBhY3R1YWxseSBoYXBwZW5zLCBidXQgdGhpcyBhbGdvcml0aG0gd291bGQgc3VwcG9ydCBpdCkuXG4gKlxuICogQXNzZXJ0IG91dCBlYWdlcmx5IGlmIHdlIGdldCBzb21ldGhpbmcgdGhhdCBpcyB1bmV4cGVjdGVkLlxuICovXG5mdW5jdGlvbiBnZXRBcmdzVG9Gb3J3YXJkKCBhcmdzID0gcHJvY2Vzcy5hcmd2ICkge1xuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrICkge1xuXG4gICAgLy8gR3J1bnQgaXMgdGhlIG1vc3QgY29tbW9uIHJ1bm5hYmxlLCBidXQgcG0yIHNlZW1zIHRvIGhhdmUgaXRzIG93biB3YXkgb2YgcnVubmluZyBjb2RlLCBzbyBzdXBwb3J0IHRoYXQgYXMgd2VsbC5cbiAgICBpZiAoIGFyZ3NbIGkgXS5pbmNsdWRlcyggJ2dydW50JyApIHx8IC9cXGJwbTJcXGIvLnRlc3QoIGFyZ3NbIGkgXSApICkge1xuICAgICAgY29uc3QgbmV4dEFyZyA9IGFyZ3NbIGkgKyAxIF07XG4gICAgICBjb25zdCBpc05leHRBcmdUaGVUYXNrID0gIW5leHRBcmcgfHwgIW5leHRBcmcuc3RhcnRzV2l0aCggJy0nICk7XG4gICAgICByZXR1cm4gYXJncy5zbGljZSggaSArICggaXNOZXh0QXJnVGhlVGFzayA/IDIgOiAxICkgKTtcbiAgICB9XG4gIH1cbiAgYXNzZXJ0KCBmYWxzZSwgYHVuZXhwZWN0ZWQgZ3J1bnQgdGFzayBhcmd1bWVudHMgdGhhdCBkaWRuJ3QgbGF1bmNoIHdpdGggXCJncnVudFwiOiBbJHthcmdzLmpvaW4oICcgJyApfV1gICk7XG4gIHJldHVybiBbXTtcbn1cblxuZnVuY3Rpb24gZXhlY1Rhc2soIGdydW50LCB0YXNrRmlsZW5hbWUgKSB7XG5cbiAgcmV0dXJuICgpID0+IHtcblxuICAgIGNvbnN0IGFyZ3MgPSBnZXRBcmdzVG9Gb3J3YXJkKCk7XG5cbiAgICBncnVudFNwYXduKCBncnVudCwgdHN4Q29tbWFuZCwgWyB0YXNrRmlsZW5hbWUsIC4uLmFyZ3MgXSwgcHJvY2Vzcy5jd2QoKSApO1xuICB9O1xufVxuXG5jb25zdCBzdXBwb3J0ZWRUYXNrRmlsZUV4dGVuc2lvbnMgPSBbICcuanMnLCAnLnRzJywgJy5janMnIF07XG5cbm1vZHVsZS5leHBvcnRzID0gKCBncnVudCwgZGlyICkgPT4ge1xuICBhc3NlcnQoIGZzLmV4aXN0c1N5bmMoIGRpciApLCBgZGlyIGRvZXMgbm90IGV4aXN0OiAke2Rpcn1gICk7XG5cbiAgLy8gTG9hZCBlYWNoIGZpbGUgZnJvbSB0YXNrcy8gYW5kIHJlZ2lzdGVyIGl0IGFzIGEgdGFza1xuICBmcy5yZWFkZGlyU3luYyggZGlyICkuZm9yRWFjaCggZmlsZSA9PiB7XG4gICAgaWYgKCBfLnNvbWUoIHN1cHBvcnRlZFRhc2tGaWxlRXh0ZW5zaW9ucywgZXh0ZW5zaW9uID0+IGZpbGUuZW5kc1dpdGgoIGV4dGVuc2lvbiApICkgKSB7XG4gICAgICBjb25zdCB0YXNrTmFtZSA9IGZpbGUuc3Vic3RyaW5nKCAwLCBmaWxlLmxhc3RJbmRleE9mKCAnLicgKSApO1xuXG4gICAgICBjb25zdCBudW1iZXJPZkZpbGVzID0gc3VwcG9ydGVkVGFza0ZpbGVFeHRlbnNpb25zLm1hcCggZXh0ZW5zaW9uID0+IGZzLmV4aXN0c1N5bmMoIHBhdGguam9pbiggZGlyLCBgJHt0YXNrTmFtZX0ke2V4dGVuc2lvbn1gICkgKSApLmZpbHRlciggXy5pZGVudGl0eSApO1xuICAgICAgaWYgKCBudW1iZXJPZkZpbGVzLmxlbmd0aCA+IDEgKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvciggYEJvdGggVHlwZVNjcmlwdCBhbmQgSmF2YVNjcmlwdCB2ZXJzaW9ucyBvZiB0aGUgdGFzayAke3Rhc2tOYW1lfSBleGlzdC4gUGxlYXNlIHJlbW92ZSBvbmUgb2YgdGhlbS5gICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgYWJzb2x1dGVQYXRoID0gcGF0aC5qb2luKCBkaXIsIGZpbGUgKTtcbiAgICAgICAgZ3J1bnQucmVnaXN0ZXJUYXNrKCB0YXNrTmFtZSwgZ2V0RG9jdW1lbnRhdGlvbkZvclRhc2soIGFic29sdXRlUGF0aCApLCBleGVjVGFzayggZ3J1bnQsIGFic29sdXRlUGF0aCApICk7XG4gICAgICB9XG4gICAgfVxuICB9ICk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5nZXRBcmdzVG9Gb3J3YXJkID0gZ2V0QXJnc1RvRm9yd2FyZDsiXSwibmFtZXMiOlsiZnMiLCJyZXF1aXJlIiwiZ2V0RG9jdW1lbnRhdGlvbkZvclRhc2siLCJwYXRoIiwiZ3J1bnRTcGF3biIsImFzc2VydCIsIl8iLCJpc1dpbmRvd3MiLCJwcm9jZXNzIiwicGxhdGZvcm0iLCJzdGFydHNXaXRoIiwicnVubmFibGUiLCJ0c3hDb21tYW5kIiwiam9pbiIsIl9fZGlybmFtZSIsImdldEFyZ3NUb0ZvcndhcmQiLCJhcmdzIiwiYXJndiIsImkiLCJsZW5ndGgiLCJpbmNsdWRlcyIsInRlc3QiLCJuZXh0QXJnIiwiaXNOZXh0QXJnVGhlVGFzayIsInNsaWNlIiwiZXhlY1Rhc2siLCJncnVudCIsInRhc2tGaWxlbmFtZSIsImN3ZCIsInN1cHBvcnRlZFRhc2tGaWxlRXh0ZW5zaW9ucyIsIm1vZHVsZSIsImV4cG9ydHMiLCJkaXIiLCJleGlzdHNTeW5jIiwicmVhZGRpclN5bmMiLCJmb3JFYWNoIiwiZmlsZSIsInNvbWUiLCJleHRlbnNpb24iLCJlbmRzV2l0aCIsInRhc2tOYW1lIiwic3Vic3RyaW5nIiwibGFzdEluZGV4T2YiLCJudW1iZXJPZkZpbGVzIiwibWFwIiwiZmlsdGVyIiwiaWRlbnRpdHkiLCJFcnJvciIsImFic29sdXRlUGF0aCIsInJlZ2lzdGVyVGFzayJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBQ2pEOzs7Ozs7Ozs7Q0FTQyxHQUNELE1BQU1BLEtBQUtDLFFBQVM7QUFDcEIsTUFBTUMsMEJBQTBCRCxRQUFTO0FBQ3pDLE1BQU1FLE9BQU9GLFFBQVM7QUFDdEIsTUFBTUcsYUFBYUgsUUFBUztBQUM1QixNQUFNSSxTQUFTSixRQUFTO0FBQ3hCLE1BQU1LLElBQUlMLFFBQVM7QUFFbkIsTUFBTU0sWUFBWUMsUUFBUUMsUUFBUSxDQUFDQyxVQUFVLENBQUU7QUFDL0MsTUFBTUMsV0FBV0osWUFBWSxZQUFZO0FBQ3pDLE1BQU1LLGFBQWEsR0FBR1QsS0FBS1UsSUFBSSxDQUFFQyxXQUFXLENBQUMsMkJBQTJCLEVBQUVILFVBQVUsR0FBSTtBQUV4Rjs7Ozs7Ozs7Ozs7Q0FXQyxHQUNELFNBQVNJLGlCQUFrQkMsT0FBT1IsUUFBUVMsSUFBSTtJQUM1QyxJQUFNLElBQUlDLElBQUksR0FBR0EsSUFBSUYsS0FBS0csTUFBTSxFQUFFRCxJQUFNO1FBRXRDLGlIQUFpSDtRQUNqSCxJQUFLRixJQUFJLENBQUVFLEVBQUcsQ0FBQ0UsUUFBUSxDQUFFLFlBQWEsVUFBVUMsSUFBSSxDQUFFTCxJQUFJLENBQUVFLEVBQUcsR0FBSztZQUNsRSxNQUFNSSxVQUFVTixJQUFJLENBQUVFLElBQUksRUFBRztZQUM3QixNQUFNSyxtQkFBbUIsQ0FBQ0QsV0FBVyxDQUFDQSxRQUFRWixVQUFVLENBQUU7WUFDMUQsT0FBT00sS0FBS1EsS0FBSyxDQUFFTixJQUFNSyxDQUFBQSxtQkFBbUIsSUFBSSxDQUFBO1FBQ2xEO0lBQ0Y7SUFDQWxCLE9BQVEsT0FBTyxDQUFDLGtFQUFrRSxFQUFFVyxLQUFLSCxJQUFJLENBQUUsS0FBTSxDQUFDLENBQUM7SUFDdkcsT0FBTyxFQUFFO0FBQ1g7QUFFQSxTQUFTWSxTQUFVQyxLQUFLLEVBQUVDLFlBQVk7SUFFcEMsT0FBTztRQUVMLE1BQU1YLE9BQU9EO1FBRWJYLFdBQVlzQixPQUFPZCxZQUFZO1lBQUVlO2VBQWlCWDtTQUFNLEVBQUVSLFFBQVFvQixHQUFHO0lBQ3ZFO0FBQ0Y7QUFFQSxNQUFNQyw4QkFBOEI7SUFBRTtJQUFPO0lBQU87Q0FBUTtBQUU1REMsT0FBT0MsT0FBTyxHQUFHLENBQUVMLE9BQU9NO0lBQ3hCM0IsT0FBUUwsR0FBR2lDLFVBQVUsQ0FBRUQsTUFBTyxDQUFDLG9CQUFvQixFQUFFQSxLQUFLO0lBRTFELHVEQUF1RDtJQUN2RGhDLEdBQUdrQyxXQUFXLENBQUVGLEtBQU1HLE9BQU8sQ0FBRUMsQ0FBQUE7UUFDN0IsSUFBSzlCLEVBQUUrQixJQUFJLENBQUVSLDZCQUE2QlMsQ0FBQUEsWUFBYUYsS0FBS0csUUFBUSxDQUFFRCxhQUFnQjtZQUNwRixNQUFNRSxXQUFXSixLQUFLSyxTQUFTLENBQUUsR0FBR0wsS0FBS00sV0FBVyxDQUFFO1lBRXRELE1BQU1DLGdCQUFnQmQsNEJBQTRCZSxHQUFHLENBQUVOLENBQUFBLFlBQWF0QyxHQUFHaUMsVUFBVSxDQUFFOUIsS0FBS1UsSUFBSSxDQUFFbUIsS0FBSyxHQUFHUSxXQUFXRixXQUFXLElBQU9PLE1BQU0sQ0FBRXZDLEVBQUV3QyxRQUFRO1lBQ3JKLElBQUtILGNBQWN4QixNQUFNLEdBQUcsR0FBSTtnQkFDOUIsTUFBTSxJQUFJNEIsTUFBTyxDQUFDLG9EQUFvRCxFQUFFUCxTQUFTLGtDQUFrQyxDQUFDO1lBQ3RILE9BQ0s7Z0JBQ0gsTUFBTVEsZUFBZTdDLEtBQUtVLElBQUksQ0FBRW1CLEtBQUtJO2dCQUNyQ1YsTUFBTXVCLFlBQVksQ0FBRVQsVUFBVXRDLHdCQUF5QjhDLGVBQWdCdkIsU0FBVUMsT0FBT3NCO1lBQzFGO1FBQ0Y7SUFDRjtBQUNGO0FBRUFsQixPQUFPQyxPQUFPLENBQUNoQixnQkFBZ0IsR0FBR0EifQ==