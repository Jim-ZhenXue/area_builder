// Copyright 2018, University of Colorado Boulder
/**
 * usage:
 * cd {{repo}}
 * node ../perennial/js/scripts/repo-report.js > out.txt
 * then import in Excel
 *
 * @author Sam Reid (PhET Interactive Simulations)
 *
 * TODO https://github.com/phetsims/tasks/issues/942 This is a "quick" version which could benefit from documentation, better command line hygiene, more options, etc.
 */ const { exec } = require('child_process');
exec('git rev-list main', (error, stdout, stderr)=>{
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    if (stderr.length === 0 && stdout.length !== 0) {
        const lines = stdout.trim().split(/\n/).reverse();
        console.log('sha\tdate\tLOC\tTODO\tREVIEW');
        const visit = function(index) {
            exec(`git checkout ${lines[index]}`, (error, stdout, stderr)=>{
                exec('grep -ro "TODO" ./js/ | wc -l', (error, stdout, stderr)=>{
                    const todoCount = stdout.trim();
                    exec('grep -ro "REVIEW" ./js/ | wc -l', (error, stdout, stderr)=>{
                        const reviewCount = stdout.trim();
                        exec('git log -1 --format=format:\'%ai\'', (error, stdout, stderr)=>{
                            const date = stdout.trim();
                            exec('( find ./js/ -name \'*.js\' -print0 | xargs -0 cat ) | wc -l', (error, stdout, stderr)=>{
                                const lineCount = stdout.trim();
                                // console.log( 'hello ' + lines[ index ] );
                                // console.log( stdout.trim() );
                                // console.log( stdout.trim() );
                                console.log(`${lines[index]}\t${date}\t${lineCount}\t${todoCount}\t${reviewCount}`);
                                if (index < lines.length - 1) {
                                    visit(index + 1);
                                } else {
                                    // done
                                    exec('git checkout main', (error, stdout, stderr)=>{
                                    // console.log( 'checked out main' );
                                    });
                                }
                            });
                        });
                    });
                });
            });
        };
        visit(0);
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL3JlcG8tcmVwb3J0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiB1c2FnZTpcbiAqIGNkIHt7cmVwb319XG4gKiBub2RlIC4uL3BlcmVubmlhbC9qcy9zY3JpcHRzL3JlcG8tcmVwb3J0LmpzID4gb3V0LnR4dFxuICogdGhlbiBpbXBvcnQgaW4gRXhjZWxcbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICpcbiAqIFRPRE8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3Rhc2tzL2lzc3Vlcy85NDIgVGhpcyBpcyBhIFwicXVpY2tcIiB2ZXJzaW9uIHdoaWNoIGNvdWxkIGJlbmVmaXQgZnJvbSBkb2N1bWVudGF0aW9uLCBiZXR0ZXIgY29tbWFuZCBsaW5lIGh5Z2llbmUsIG1vcmUgb3B0aW9ucywgZXRjLlxuICovXG5cbmNvbnN0IHsgZXhlYyB9ID0gcmVxdWlyZSggJ2NoaWxkX3Byb2Nlc3MnICk7XG5cbmV4ZWMoICdnaXQgcmV2LWxpc3QgbWFpbicsICggZXJyb3IsIHN0ZG91dCwgc3RkZXJyICkgPT4ge1xuICBpZiAoIGVycm9yICkge1xuICAgIGNvbnNvbGUuZXJyb3IoIGBleGVjIGVycm9yOiAke2Vycm9yfWAgKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIHN0ZGVyci5sZW5ndGggPT09IDAgJiYgc3Rkb3V0Lmxlbmd0aCAhPT0gMCApIHtcbiAgICBjb25zdCBsaW5lcyA9IHN0ZG91dC50cmltKCkuc3BsaXQoIC9cXG4vICkucmV2ZXJzZSgpO1xuICAgIGNvbnNvbGUubG9nKCAnc2hhXFx0ZGF0ZVxcdExPQ1xcdFRPRE9cXHRSRVZJRVcnICk7XG4gICAgY29uc3QgdmlzaXQgPSBmdW5jdGlvbiggaW5kZXggKSB7XG5cbiAgICAgIGV4ZWMoIGBnaXQgY2hlY2tvdXQgJHtsaW5lc1sgaW5kZXggXX1gLCAoIGVycm9yLCBzdGRvdXQsIHN0ZGVyciApID0+IHtcblxuICAgICAgICBleGVjKCAnZ3JlcCAtcm8gXCJUT0RPXCIgLi9qcy8gfCB3YyAtbCcsICggZXJyb3IsIHN0ZG91dCwgc3RkZXJyICkgPT4ge1xuICAgICAgICAgIGNvbnN0IHRvZG9Db3VudCA9IHN0ZG91dC50cmltKCk7XG5cbiAgICAgICAgICBleGVjKCAnZ3JlcCAtcm8gXCJSRVZJRVdcIiAuL2pzLyB8IHdjIC1sJywgKCBlcnJvciwgc3Rkb3V0LCBzdGRlcnIgKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZXZpZXdDb3VudCA9IHN0ZG91dC50cmltKCk7XG5cbiAgICAgICAgICAgIGV4ZWMoICdnaXQgbG9nIC0xIC0tZm9ybWF0PWZvcm1hdDpcXCclYWlcXCcnLCAoIGVycm9yLCBzdGRvdXQsIHN0ZGVyciApID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgZGF0ZSA9IHN0ZG91dC50cmltKCk7XG5cbiAgICAgICAgICAgICAgZXhlYyggJyggZmluZCAuL2pzLyAtbmFtZSBcXCcqLmpzXFwnIC1wcmludDAgfCB4YXJncyAtMCBjYXQgKSB8IHdjIC1sJywgKCBlcnJvciwgc3Rkb3V0LCBzdGRlcnIgKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGluZUNvdW50ID0gc3Rkb3V0LnRyaW0oKTtcblxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCAnaGVsbG8gJyArIGxpbmVzWyBpbmRleCBdICk7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coIHN0ZG91dC50cmltKCkgKTtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyggc3Rkb3V0LnRyaW0oKSApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCBgJHtsaW5lc1sgaW5kZXggXX1cXHQke2RhdGV9XFx0JHtsaW5lQ291bnR9XFx0JHt0b2RvQ291bnR9XFx0JHtyZXZpZXdDb3VudH1gICk7XG4gICAgICAgICAgICAgICAgaWYgKCBpbmRleCA8IGxpbmVzLmxlbmd0aCAtIDEgKSB7XG4gICAgICAgICAgICAgICAgICB2aXNpdCggaW5kZXggKyAxICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAvLyBkb25lXG4gICAgICAgICAgICAgICAgICBleGVjKCAnZ2l0IGNoZWNrb3V0IG1haW4nLCAoIGVycm9yLCBzdGRvdXQsIHN0ZGVyciApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coICdjaGVja2VkIG91dCBtYWluJyApO1xuICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgfSApO1xuICAgICAgICB9ICk7XG4gICAgICB9ICk7XG4gICAgfTtcbiAgICB2aXNpdCggMCApO1xuICB9XG59ICk7Il0sIm5hbWVzIjpbImV4ZWMiLCJyZXF1aXJlIiwiZXJyb3IiLCJzdGRvdXQiLCJzdGRlcnIiLCJjb25zb2xlIiwibGVuZ3RoIiwibGluZXMiLCJ0cmltIiwic3BsaXQiLCJyZXZlcnNlIiwibG9nIiwidmlzaXQiLCJpbmRleCIsInRvZG9Db3VudCIsInJldmlld0NvdW50IiwiZGF0ZSIsImxpbmVDb3VudCJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Ozs7Ozs7Q0FTQyxHQUVELE1BQU0sRUFBRUEsSUFBSSxFQUFFLEdBQUdDLFFBQVM7QUFFMUJELEtBQU0scUJBQXFCLENBQUVFLE9BQU9DLFFBQVFDO0lBQzFDLElBQUtGLE9BQVE7UUFDWEcsUUFBUUgsS0FBSyxDQUFFLENBQUMsWUFBWSxFQUFFQSxPQUFPO1FBQ3JDO0lBQ0Y7SUFFQSxJQUFLRSxPQUFPRSxNQUFNLEtBQUssS0FBS0gsT0FBT0csTUFBTSxLQUFLLEdBQUk7UUFDaEQsTUFBTUMsUUFBUUosT0FBT0ssSUFBSSxHQUFHQyxLQUFLLENBQUUsTUFBT0MsT0FBTztRQUNqREwsUUFBUU0sR0FBRyxDQUFFO1FBQ2IsTUFBTUMsUUFBUSxTQUFVQyxLQUFLO1lBRTNCYixLQUFNLENBQUMsYUFBYSxFQUFFTyxLQUFLLENBQUVNLE1BQU8sRUFBRSxFQUFFLENBQUVYLE9BQU9DLFFBQVFDO2dCQUV2REosS0FBTSxpQ0FBaUMsQ0FBRUUsT0FBT0MsUUFBUUM7b0JBQ3RELE1BQU1VLFlBQVlYLE9BQU9LLElBQUk7b0JBRTdCUixLQUFNLG1DQUFtQyxDQUFFRSxPQUFPQyxRQUFRQzt3QkFDeEQsTUFBTVcsY0FBY1osT0FBT0ssSUFBSTt3QkFFL0JSLEtBQU0sc0NBQXNDLENBQUVFLE9BQU9DLFFBQVFDOzRCQUMzRCxNQUFNWSxPQUFPYixPQUFPSyxJQUFJOzRCQUV4QlIsS0FBTSxnRUFBZ0UsQ0FBRUUsT0FBT0MsUUFBUUM7Z0NBQ3JGLE1BQU1hLFlBQVlkLE9BQU9LLElBQUk7Z0NBRTdCLDRDQUE0QztnQ0FDNUMsZ0NBQWdDO2dDQUNoQyxnQ0FBZ0M7Z0NBQ2hDSCxRQUFRTSxHQUFHLENBQUUsR0FBR0osS0FBSyxDQUFFTSxNQUFPLENBQUMsRUFBRSxFQUFFRyxLQUFLLEVBQUUsRUFBRUMsVUFBVSxFQUFFLEVBQUVILFVBQVUsRUFBRSxFQUFFQyxhQUFhO2dDQUNyRixJQUFLRixRQUFRTixNQUFNRCxNQUFNLEdBQUcsR0FBSTtvQ0FDOUJNLE1BQU9DLFFBQVE7Z0NBQ2pCLE9BQ0s7b0NBRUgsT0FBTztvQ0FDUGIsS0FBTSxxQkFBcUIsQ0FBRUUsT0FBT0MsUUFBUUM7b0NBQzFDLHFDQUFxQztvQ0FDdkM7Z0NBQ0Y7NEJBQ0Y7d0JBRUY7b0JBQ0Y7Z0JBQ0Y7WUFDRjtRQUNGO1FBQ0FRLE1BQU87SUFDVDtBQUNGIn0=