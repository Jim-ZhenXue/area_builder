// Copyright 2021, University of Colorado Boulder
/**
 * Compare the commits between two dependencies.json files, and print out the commits that are different.
 *
 * USAGE:
 * cd perennial
 * node js/scripts/compare-dependencies-2.js ../mysim/dependenciesOLD.json ../mysim/dependencies.json
 *
 * NOTES: The old dependencies.json must be specified first. Also, keep in mind you may want to do a fresh build to get
 * an updated dependencies.json if you are trying to compare to main.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ const fs = require('fs');
const _ = require('lodash');
// Parse the command line arguments
const args = process.argv.slice(2);
// The first command line argument is the first project for comparison
const project1 = args[0];
// The second command line argument is the second project for comparison
const project2 = args[1];
const dependencies1 = JSON.parse(fs.readFileSync(project1));
const dependencies2 = JSON.parse(fs.readFileSync(project2));
const allKeys = _.uniq([
    ...Object.keys(dependencies1),
    ...Object.keys(dependencies2)
].filter((repo)=>repo !== 'comment'));
const issues = new Set();
let commitCount = 0;
// Iterate over the keys they have in common
allKeys.forEach((repo)=>{
    // If the key is in dependencies two
    if (dependencies1[repo] && dependencies2[repo]) {
        // Print the key and the version
        // console.log( `${repo} ${dependencies1[ repo ].sha} ${dependencies2[ repo ].sha}` );
        // If the shas are the same, print a message to the console that the shas are the same
        if (dependencies1[repo].sha === dependencies2[repo].sha) {
            console.log(`# ${repo}`);
            console.log('SHAs are the same');
            console.log();
        } else {
            // We know the shas are different, and we want to compare them using `git log --oneline --ancestry-path`
            const command = `git -C ../${repo} log --oneline --ancestry-path ${dependencies1[repo].sha}..${dependencies2[repo].sha}`;
            // Run that command synchronously
            const buffer = require('child_process').execSync(command);
            // Convert the buffer to a string and print it out
            console.log(`# ${repo}`);
            const bufferString = buffer.toString();
            console.log(bufferString);
            // Split the buffer string into lines
            const lines = bufferString.split('\n');
            // console.log( lines.length );
            lines.forEach((line)=>{
                // If the line contains https://github.com/phetsims/ then add it to the set.
                if (line.includes('https://github.com/phetsims/') && !line.includes('Merge branch \'main\'')) {
                    // Find the URL in line using a regular expression
                    const url = line.substring(line.indexOf('https://github.com/phetsims/'));
                    issues.add(url);
                }
                if (line.trim().length > 0) {
                    commitCount++;
                }
            });
        }
    } else {
        console.log(`# ${repo}`);
        console.log(`Did not appear in both dependencies. project1=${dependencies1[repo]}, project2=${dependencies2[repo]}`);
        console.log();
    }
});
console.log('Discovered issues:');
console.log(Array.from(issues).sort().join('\n'));
console.log(`${commitCount} commits referenced ${issues.size} separate issues`);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL2NvbXBhcmUtZGVwZW5kZW5jaWVzLTIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuLyoqXG4gKiBDb21wYXJlIHRoZSBjb21taXRzIGJldHdlZW4gdHdvIGRlcGVuZGVuY2llcy5qc29uIGZpbGVzLCBhbmQgcHJpbnQgb3V0IHRoZSBjb21taXRzIHRoYXQgYXJlIGRpZmZlcmVudC5cbiAqXG4gKiBVU0FHRTpcbiAqIGNkIHBlcmVubmlhbFxuICogbm9kZSBqcy9zY3JpcHRzL2NvbXBhcmUtZGVwZW5kZW5jaWVzLTIuanMgLi4vbXlzaW0vZGVwZW5kZW5jaWVzT0xELmpzb24gLi4vbXlzaW0vZGVwZW5kZW5jaWVzLmpzb25cbiAqXG4gKiBOT1RFUzogVGhlIG9sZCBkZXBlbmRlbmNpZXMuanNvbiBtdXN0IGJlIHNwZWNpZmllZCBmaXJzdC4gQWxzbywga2VlcCBpbiBtaW5kIHlvdSBtYXkgd2FudCB0byBkbyBhIGZyZXNoIGJ1aWxkIHRvIGdldFxuICogYW4gdXBkYXRlZCBkZXBlbmRlbmNpZXMuanNvbiBpZiB5b3UgYXJlIHRyeWluZyB0byBjb21wYXJlIHRvIG1haW4uXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XG5jb25zdCBfID0gcmVxdWlyZSggJ2xvZGFzaCcgKTtcblxuLy8gUGFyc2UgdGhlIGNvbW1hbmQgbGluZSBhcmd1bWVudHNcbmNvbnN0IGFyZ3MgPSBwcm9jZXNzLmFyZ3Yuc2xpY2UoIDIgKTtcblxuLy8gVGhlIGZpcnN0IGNvbW1hbmQgbGluZSBhcmd1bWVudCBpcyB0aGUgZmlyc3QgcHJvamVjdCBmb3IgY29tcGFyaXNvblxuY29uc3QgcHJvamVjdDEgPSBhcmdzWyAwIF07XG5cbi8vIFRoZSBzZWNvbmQgY29tbWFuZCBsaW5lIGFyZ3VtZW50IGlzIHRoZSBzZWNvbmQgcHJvamVjdCBmb3IgY29tcGFyaXNvblxuY29uc3QgcHJvamVjdDIgPSBhcmdzWyAxIF07XG5cbmNvbnN0IGRlcGVuZGVuY2llczEgPSBKU09OLnBhcnNlKCBmcy5yZWFkRmlsZVN5bmMoIHByb2plY3QxICkgKTtcbmNvbnN0IGRlcGVuZGVuY2llczIgPSBKU09OLnBhcnNlKCBmcy5yZWFkRmlsZVN5bmMoIHByb2plY3QyICkgKTtcblxuY29uc3QgYWxsS2V5cyA9IF8udW5pcSggWyAuLi5PYmplY3Qua2V5cyggZGVwZW5kZW5jaWVzMSApLCAuLi5PYmplY3Qua2V5cyggZGVwZW5kZW5jaWVzMiApIF0uZmlsdGVyKCByZXBvID0+IHJlcG8gIT09ICdjb21tZW50JyApICk7XG5cbmNvbnN0IGlzc3VlcyA9IG5ldyBTZXQoKTtcbmxldCBjb21taXRDb3VudCA9IDA7XG5cbi8vIEl0ZXJhdGUgb3ZlciB0aGUga2V5cyB0aGV5IGhhdmUgaW4gY29tbW9uXG5hbGxLZXlzLmZvckVhY2goIHJlcG8gPT4ge1xuXG4gIC8vIElmIHRoZSBrZXkgaXMgaW4gZGVwZW5kZW5jaWVzIHR3b1xuICBpZiAoIGRlcGVuZGVuY2llczFbIHJlcG8gXSAmJiBkZXBlbmRlbmNpZXMyWyByZXBvIF0gKSB7XG5cbiAgICAvLyBQcmludCB0aGUga2V5IGFuZCB0aGUgdmVyc2lvblxuICAgIC8vIGNvbnNvbGUubG9nKCBgJHtyZXBvfSAke2RlcGVuZGVuY2llczFbIHJlcG8gXS5zaGF9ICR7ZGVwZW5kZW5jaWVzMlsgcmVwbyBdLnNoYX1gICk7XG5cbiAgICAvLyBJZiB0aGUgc2hhcyBhcmUgdGhlIHNhbWUsIHByaW50IGEgbWVzc2FnZSB0byB0aGUgY29uc29sZSB0aGF0IHRoZSBzaGFzIGFyZSB0aGUgc2FtZVxuICAgIGlmICggZGVwZW5kZW5jaWVzMVsgcmVwbyBdLnNoYSA9PT0gZGVwZW5kZW5jaWVzMlsgcmVwbyBdLnNoYSApIHtcbiAgICAgIGNvbnNvbGUubG9nKCBgIyAke3JlcG99YCApO1xuICAgICAgY29uc29sZS5sb2coICdTSEFzIGFyZSB0aGUgc2FtZScgKTtcbiAgICAgIGNvbnNvbGUubG9nKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuXG4gICAgICAvLyBXZSBrbm93IHRoZSBzaGFzIGFyZSBkaWZmZXJlbnQsIGFuZCB3ZSB3YW50IHRvIGNvbXBhcmUgdGhlbSB1c2luZyBgZ2l0IGxvZyAtLW9uZWxpbmUgLS1hbmNlc3RyeS1wYXRoYFxuICAgICAgY29uc3QgY29tbWFuZCA9IGBnaXQgLUMgLi4vJHtyZXBvfSBsb2cgLS1vbmVsaW5lIC0tYW5jZXN0cnktcGF0aCAke2RlcGVuZGVuY2llczFbIHJlcG8gXS5zaGF9Li4ke2RlcGVuZGVuY2llczJbIHJlcG8gXS5zaGF9YDtcblxuICAgICAgLy8gUnVuIHRoYXQgY29tbWFuZCBzeW5jaHJvbm91c2x5XG4gICAgICBjb25zdCBidWZmZXIgPSByZXF1aXJlKCAnY2hpbGRfcHJvY2VzcycgKS5leGVjU3luYyggY29tbWFuZCApO1xuXG4gICAgICAvLyBDb252ZXJ0IHRoZSBidWZmZXIgdG8gYSBzdHJpbmcgYW5kIHByaW50IGl0IG91dFxuICAgICAgY29uc29sZS5sb2coIGAjICR7cmVwb31gICk7XG4gICAgICBjb25zdCBidWZmZXJTdHJpbmcgPSBidWZmZXIudG9TdHJpbmcoKTtcbiAgICAgIGNvbnNvbGUubG9nKCBidWZmZXJTdHJpbmcgKTtcblxuICAgICAgLy8gU3BsaXQgdGhlIGJ1ZmZlciBzdHJpbmcgaW50byBsaW5lc1xuICAgICAgY29uc3QgbGluZXMgPSBidWZmZXJTdHJpbmcuc3BsaXQoICdcXG4nICk7XG4gICAgICAvLyBjb25zb2xlLmxvZyggbGluZXMubGVuZ3RoICk7XG4gICAgICBsaW5lcy5mb3JFYWNoKCBsaW5lID0+IHtcblxuICAgICAgICAvLyBJZiB0aGUgbGluZSBjb250YWlucyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvIHRoZW4gYWRkIGl0IHRvIHRoZSBzZXQuXG4gICAgICAgIGlmICggbGluZS5pbmNsdWRlcyggJ2h0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy8nICkgJiYgIWxpbmUuaW5jbHVkZXMoICdNZXJnZSBicmFuY2ggXFwnbWFpblxcJycgKSApIHtcblxuICAgICAgICAgIC8vIEZpbmQgdGhlIFVSTCBpbiBsaW5lIHVzaW5nIGEgcmVndWxhciBleHByZXNzaW9uXG4gICAgICAgICAgY29uc3QgdXJsID0gbGluZS5zdWJzdHJpbmcoIGxpbmUuaW5kZXhPZiggJ2h0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy8nICkgKTtcblxuICAgICAgICAgIGlzc3Vlcy5hZGQoIHVybCApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBsaW5lLnRyaW0oKS5sZW5ndGggPiAwICkge1xuICAgICAgICAgIGNvbW1pdENvdW50Kys7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgY29uc29sZS5sb2coIGAjICR7cmVwb31gICk7XG4gICAgY29uc29sZS5sb2coIGBEaWQgbm90IGFwcGVhciBpbiBib3RoIGRlcGVuZGVuY2llcy4gcHJvamVjdDE9JHtkZXBlbmRlbmNpZXMxWyByZXBvIF19LCBwcm9qZWN0Mj0ke2RlcGVuZGVuY2llczJbIHJlcG8gXX1gICk7XG4gICAgY29uc29sZS5sb2coKTtcbiAgfVxufSApO1xuXG5jb25zb2xlLmxvZyggJ0Rpc2NvdmVyZWQgaXNzdWVzOicgKTtcbmNvbnNvbGUubG9nKCBBcnJheS5mcm9tKCBpc3N1ZXMgKS5zb3J0KCkuam9pbiggJ1xcbicgKSApO1xuXG5jb25zb2xlLmxvZyggYCR7Y29tbWl0Q291bnR9IGNvbW1pdHMgcmVmZXJlbmNlZCAke2lzc3Vlcy5zaXplfSBzZXBhcmF0ZSBpc3N1ZXNgICk7Il0sIm5hbWVzIjpbImZzIiwicmVxdWlyZSIsIl8iLCJhcmdzIiwicHJvY2VzcyIsImFyZ3YiLCJzbGljZSIsInByb2plY3QxIiwicHJvamVjdDIiLCJkZXBlbmRlbmNpZXMxIiwiSlNPTiIsInBhcnNlIiwicmVhZEZpbGVTeW5jIiwiZGVwZW5kZW5jaWVzMiIsImFsbEtleXMiLCJ1bmlxIiwiT2JqZWN0Iiwia2V5cyIsImZpbHRlciIsInJlcG8iLCJpc3N1ZXMiLCJTZXQiLCJjb21taXRDb3VudCIsImZvckVhY2giLCJzaGEiLCJjb25zb2xlIiwibG9nIiwiY29tbWFuZCIsImJ1ZmZlciIsImV4ZWNTeW5jIiwiYnVmZmVyU3RyaW5nIiwidG9TdHJpbmciLCJsaW5lcyIsInNwbGl0IiwibGluZSIsImluY2x1ZGVzIiwidXJsIiwic3Vic3RyaW5nIiwiaW5kZXhPZiIsImFkZCIsInRyaW0iLCJsZW5ndGgiLCJBcnJheSIsImZyb20iLCJzb3J0Iiwiam9pbiIsInNpemUiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUNqRDs7Ozs7Ozs7Ozs7Q0FXQyxHQUNELE1BQU1BLEtBQUtDLFFBQVM7QUFDcEIsTUFBTUMsSUFBSUQsUUFBUztBQUVuQixtQ0FBbUM7QUFDbkMsTUFBTUUsT0FBT0MsUUFBUUMsSUFBSSxDQUFDQyxLQUFLLENBQUU7QUFFakMsc0VBQXNFO0FBQ3RFLE1BQU1DLFdBQVdKLElBQUksQ0FBRSxFQUFHO0FBRTFCLHdFQUF3RTtBQUN4RSxNQUFNSyxXQUFXTCxJQUFJLENBQUUsRUFBRztBQUUxQixNQUFNTSxnQkFBZ0JDLEtBQUtDLEtBQUssQ0FBRVgsR0FBR1ksWUFBWSxDQUFFTDtBQUNuRCxNQUFNTSxnQkFBZ0JILEtBQUtDLEtBQUssQ0FBRVgsR0FBR1ksWUFBWSxDQUFFSjtBQUVuRCxNQUFNTSxVQUFVWixFQUFFYSxJQUFJLENBQUU7T0FBS0MsT0FBT0MsSUFBSSxDQUFFUjtPQUFvQk8sT0FBT0MsSUFBSSxDQUFFSjtDQUFpQixDQUFDSyxNQUFNLENBQUVDLENBQUFBLE9BQVFBLFNBQVM7QUFFdEgsTUFBTUMsU0FBUyxJQUFJQztBQUNuQixJQUFJQyxjQUFjO0FBRWxCLDRDQUE0QztBQUM1Q1IsUUFBUVMsT0FBTyxDQUFFSixDQUFBQTtJQUVmLG9DQUFvQztJQUNwQyxJQUFLVixhQUFhLENBQUVVLEtBQU0sSUFBSU4sYUFBYSxDQUFFTSxLQUFNLEVBQUc7UUFFcEQsZ0NBQWdDO1FBQ2hDLHNGQUFzRjtRQUV0RixzRkFBc0Y7UUFDdEYsSUFBS1YsYUFBYSxDQUFFVSxLQUFNLENBQUNLLEdBQUcsS0FBS1gsYUFBYSxDQUFFTSxLQUFNLENBQUNLLEdBQUcsRUFBRztZQUM3REMsUUFBUUMsR0FBRyxDQUFFLENBQUMsRUFBRSxFQUFFUCxNQUFNO1lBQ3hCTSxRQUFRQyxHQUFHLENBQUU7WUFDYkQsUUFBUUMsR0FBRztRQUNiLE9BQ0s7WUFFSCx3R0FBd0c7WUFDeEcsTUFBTUMsVUFBVSxDQUFDLFVBQVUsRUFBRVIsS0FBSywrQkFBK0IsRUFBRVYsYUFBYSxDQUFFVSxLQUFNLENBQUNLLEdBQUcsQ0FBQyxFQUFFLEVBQUVYLGFBQWEsQ0FBRU0sS0FBTSxDQUFDSyxHQUFHLEVBQUU7WUFFNUgsaUNBQWlDO1lBQ2pDLE1BQU1JLFNBQVMzQixRQUFTLGlCQUFrQjRCLFFBQVEsQ0FBRUY7WUFFcEQsa0RBQWtEO1lBQ2xERixRQUFRQyxHQUFHLENBQUUsQ0FBQyxFQUFFLEVBQUVQLE1BQU07WUFDeEIsTUFBTVcsZUFBZUYsT0FBT0csUUFBUTtZQUNwQ04sUUFBUUMsR0FBRyxDQUFFSTtZQUViLHFDQUFxQztZQUNyQyxNQUFNRSxRQUFRRixhQUFhRyxLQUFLLENBQUU7WUFDbEMsK0JBQStCO1lBQy9CRCxNQUFNVCxPQUFPLENBQUVXLENBQUFBO2dCQUViLDRFQUE0RTtnQkFDNUUsSUFBS0EsS0FBS0MsUUFBUSxDQUFFLG1DQUFvQyxDQUFDRCxLQUFLQyxRQUFRLENBQUUsMEJBQTRCO29CQUVsRyxrREFBa0Q7b0JBQ2xELE1BQU1DLE1BQU1GLEtBQUtHLFNBQVMsQ0FBRUgsS0FBS0ksT0FBTyxDQUFFO29CQUUxQ2xCLE9BQU9tQixHQUFHLENBQUVIO2dCQUNkO2dCQUVBLElBQUtGLEtBQUtNLElBQUksR0FBR0MsTUFBTSxHQUFHLEdBQUk7b0JBQzVCbkI7Z0JBQ0Y7WUFDRjtRQUNGO0lBQ0YsT0FDSztRQUNIRyxRQUFRQyxHQUFHLENBQUUsQ0FBQyxFQUFFLEVBQUVQLE1BQU07UUFDeEJNLFFBQVFDLEdBQUcsQ0FBRSxDQUFDLDhDQUE4QyxFQUFFakIsYUFBYSxDQUFFVSxLQUFNLENBQUMsV0FBVyxFQUFFTixhQUFhLENBQUVNLEtBQU0sRUFBRTtRQUN4SE0sUUFBUUMsR0FBRztJQUNiO0FBQ0Y7QUFFQUQsUUFBUUMsR0FBRyxDQUFFO0FBQ2JELFFBQVFDLEdBQUcsQ0FBRWdCLE1BQU1DLElBQUksQ0FBRXZCLFFBQVN3QixJQUFJLEdBQUdDLElBQUksQ0FBRTtBQUUvQ3BCLFFBQVFDLEdBQUcsQ0FBRSxHQUFHSixZQUFZLG9CQUFvQixFQUFFRixPQUFPMEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDIn0=