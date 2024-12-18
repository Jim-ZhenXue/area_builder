// Copyright 2024, University of Colorado Boulder
/**
 * Command to run tsx.
 *
 * NOTE: Keep in mind usages before converting to *.ts. grunt/util/registerTasks.js may require this to be *.js for a
 * long time.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ const path = require('path');
const isWindows = process.platform.startsWith('win');
const runnable = isWindows ? 'tsx.cmd' : 'tsx';
const tsxCommand = `${path.join(__dirname, `../../node_modules/.bin/${runnable}`)}`;
module.exports = tsxCommand;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vdHN4Q29tbWFuZC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQ29tbWFuZCB0byBydW4gdHN4LlxuICpcbiAqIE5PVEU6IEtlZXAgaW4gbWluZCB1c2FnZXMgYmVmb3JlIGNvbnZlcnRpbmcgdG8gKi50cy4gZ3J1bnQvdXRpbC9yZWdpc3RlclRhc2tzLmpzIG1heSByZXF1aXJlIHRoaXMgdG8gYmUgKi5qcyBmb3IgYVxuICogbG9uZyB0aW1lLlxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cbmNvbnN0IHBhdGggPSByZXF1aXJlKCAncGF0aCcgKTtcblxuY29uc3QgaXNXaW5kb3dzID0gcHJvY2Vzcy5wbGF0Zm9ybS5zdGFydHNXaXRoKCAnd2luJyApO1xuY29uc3QgcnVubmFibGUgPSBpc1dpbmRvd3MgPyAndHN4LmNtZCcgOiAndHN4JztcblxuY29uc3QgdHN4Q29tbWFuZCA9IGAke3BhdGguam9pbiggX19kaXJuYW1lLCBgLi4vLi4vbm9kZV9tb2R1bGVzLy5iaW4vJHtydW5uYWJsZX1gICl9YDtcblxubW9kdWxlLmV4cG9ydHMgPSB0c3hDb21tYW5kOyJdLCJuYW1lcyI6WyJwYXRoIiwicmVxdWlyZSIsImlzV2luZG93cyIsInByb2Nlc3MiLCJwbGF0Zm9ybSIsInN0YXJ0c1dpdGgiLCJydW5uYWJsZSIsInRzeENvbW1hbmQiLCJqb2luIiwiX19kaXJuYW1lIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Ozs7OztDQVFDLEdBQ0QsTUFBTUEsT0FBT0MsUUFBUztBQUV0QixNQUFNQyxZQUFZQyxRQUFRQyxRQUFRLENBQUNDLFVBQVUsQ0FBRTtBQUMvQyxNQUFNQyxXQUFXSixZQUFZLFlBQVk7QUFFekMsTUFBTUssYUFBYSxHQUFHUCxLQUFLUSxJQUFJLENBQUVDLFdBQVcsQ0FBQyx3QkFBd0IsRUFBRUgsVUFBVSxHQUFJO0FBRXJGSSxPQUFPQyxPQUFPLEdBQUdKIn0=