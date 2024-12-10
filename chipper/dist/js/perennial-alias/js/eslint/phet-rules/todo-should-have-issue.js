// Copyright 2002-2015, University of Colorado Boulder
/**
 * @fileoverview Rule to check that certain TO-DOs have GitHub issues associated with them
 * @author Sam Reid (PhET Interactive Simulations)
 * @copyright 2015 University of Colorado Boulder
 */ const process = require('process');
const path = require('path');
const fs = require('fs');
const issueShorthandRegex = /#(\d+)/;
const urlRegex = /https:\/\/github.com\/phetsims\/[-\w]+\/issues\/\d+/;
const filename = 'issuesFromTODOs.txt';
const todoIssuesFilepath = path.resolve(__dirname, `../../../../chipper/dist/eslint/${filename}`);
// Match a comment line containing a TO-DO
const containsTODO = (string)=>string.includes('TODO');
// Match a comment tagging a github issue
const hasIssueLink = (string)=>{
    // '#' followed by any number of digits
    const missingIssueNumber = !issueShorthandRegex.test(string);
    const missingLink = !urlRegex.test(string);
    return !(missingLink && missingIssueNumber);
};
/**
 * Match if a comment is a line comment, and an immediately proceeding line comment contains the github issue, like:
 *
 * // TO DO (purposefully misspelled) - Do something helpful
 * // See https://github.com/phetsims/chipper/issues/X
 *
 * @param {Comment[]} comments
 * @param {number} index
 * @returns {boolean}
 */ const nextCommentsHaveIssue = (comments, index)=>{
    const todoComment = comments[index];
    let hasIssueInNextComments = false;
    if (todoComment.type === 'Line') {
        let previousLine = todoComment.loc.start.line;
        for(let i = index + 1; i < comments.length; i++){
            const currentComment = comments[i];
            // No next comment
            if (!currentComment || // next comment is a block
            currentComment.type !== 'Line' || // If nextComment is not on the next line
            currentComment.loc.start.line - 1 !== previousLine) {
                break;
            }
            if (hasIssueLink(currentComment.value)) {
                hasIssueInNextComments = true;
                break;
            }
            previousLine = currentComment.loc.start.line;
        }
    }
    return hasIssueInNextComments;
};
module.exports = {
    meta: {
        type: 'problem',
        fixable: 'code'
    },
    create: (context)=>{
        return {
            meta: {
                type: 'problem',
                fixable: 'code'
            },
            Program: function() {
                const filename = context.getFilename();
                // Explicitly ignore files from the simula-rasa repo. simula-rasa is the template for new simulations that are
                // created using 'grunt create-sim'. simula-rasa's code contains TO-DOs that should be addressed by the creator
                // of the new simulation. So we do not want those TO-DOs to have an associated GitHub issue. And we do not want
                // to opt-out of this rule in simula-rasa/package.json, because it will be propagated to the new sim.
                if (context.getFilename().includes('simula-rasa')) {
                    return;
                }
                const comments = context.getSourceCode().getAllComments();
                if (comments) {
                    for(let i = 0; i < comments.length; i++){
                        const comment = comments[i];
                        if (containsTODO(comment.value)) {
                            if (!hasIssueLink(comment.value) && !nextCommentsHaveIssue(comments, i)) {
                                context.report({
                                    node: comment,
                                    loc: comment.loc.start,
                                    message: `TODO should have an issue: ${comment.value}`
                                });
                            } else if (process.env.saveTODOIssues) {
                                let url = null;
                                const urlMatch = comment.value.match(urlRegex);
                                if (urlMatch) {
                                    url = urlMatch[0];
                                }
                                const issueShorthandMatch = comment.value.match(issueShorthandRegex);
                                const repoNameMatch = filename.match(/[\\/]([\w-]+)[\\/]js[\\/]/);
                                if (issueShorthandMatch && repoNameMatch) {
                                    url = `https://github.com/phetsims/${repoNameMatch[1]}/issues/${issueShorthandMatch[1]}`;
                                }
                                if (url) {
                                    if (!url.startsWith('https://')) {
                                        console.error(`Unexpected URL being written: \n\t${url}\n\t${filename}\n\t${comment}`);
                                    }
                                    fs.writeFileSync(todoIssuesFilepath, fs.readFileSync(todoIssuesFilepath).toString() + `${url}\n`);
                                }
                            }
                        }
                    }
                }
            }
        };
    }
};
module.exports.schema = [];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy90b2RvLXNob3VsZC1oYXZlLWlzc3VlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDAyLTIwMTUsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgUnVsZSB0byBjaGVjayB0aGF0IGNlcnRhaW4gVE8tRE9zIGhhdmUgR2l0SHViIGlzc3VlcyBhc3NvY2lhdGVkIHdpdGggdGhlbVxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBjb3B5cmlnaHQgMjAxNSBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbiAqL1xuXG5jb25zdCBwcm9jZXNzID0gcmVxdWlyZSggJ3Byb2Nlc3MnICk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSggJ3BhdGgnICk7XG5jb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcblxuY29uc3QgaXNzdWVTaG9ydGhhbmRSZWdleCA9IC8jKFxcZCspLztcbmNvbnN0IHVybFJlZ2V4ID0gL2h0dHBzOlxcL1xcL2dpdGh1Yi5jb21cXC9waGV0c2ltc1xcL1stXFx3XStcXC9pc3N1ZXNcXC9cXGQrLztcbmNvbnN0IGZpbGVuYW1lID0gJ2lzc3Vlc0Zyb21UT0RPcy50eHQnO1xuY29uc3QgdG9kb0lzc3Vlc0ZpbGVwYXRoID0gcGF0aC5yZXNvbHZlKCBfX2Rpcm5hbWUsIGAuLi8uLi8uLi8uLi9jaGlwcGVyL2Rpc3QvZXNsaW50LyR7ZmlsZW5hbWV9YCApO1xuXG4vLyBNYXRjaCBhIGNvbW1lbnQgbGluZSBjb250YWluaW5nIGEgVE8tRE9cbmNvbnN0IGNvbnRhaW5zVE9ETyA9IHN0cmluZyA9PiBzdHJpbmcuaW5jbHVkZXMoICdUT0RPJyApO1xuXG4vLyBNYXRjaCBhIGNvbW1lbnQgdGFnZ2luZyBhIGdpdGh1YiBpc3N1ZVxuY29uc3QgaGFzSXNzdWVMaW5rID0gc3RyaW5nID0+IHtcblxuICAvLyAnIycgZm9sbG93ZWQgYnkgYW55IG51bWJlciBvZiBkaWdpdHNcbiAgY29uc3QgbWlzc2luZ0lzc3VlTnVtYmVyID0gIWlzc3VlU2hvcnRoYW5kUmVnZXgudGVzdCggc3RyaW5nICk7XG4gIGNvbnN0IG1pc3NpbmdMaW5rID0gIXVybFJlZ2V4LnRlc3QoIHN0cmluZyApO1xuICByZXR1cm4gISggbWlzc2luZ0xpbmsgJiYgbWlzc2luZ0lzc3VlTnVtYmVyICk7XG59O1xuXG4vKipcbiAqIE1hdGNoIGlmIGEgY29tbWVudCBpcyBhIGxpbmUgY29tbWVudCwgYW5kIGFuIGltbWVkaWF0ZWx5IHByb2NlZWRpbmcgbGluZSBjb21tZW50IGNvbnRhaW5zIHRoZSBnaXRodWIgaXNzdWUsIGxpa2U6XG4gKlxuICogLy8gVE8gRE8gKHB1cnBvc2VmdWxseSBtaXNzcGVsbGVkKSAtIERvIHNvbWV0aGluZyBoZWxwZnVsXG4gKiAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzL1hcbiAqXG4gKiBAcGFyYW0ge0NvbW1lbnRbXX0gY29tbWVudHNcbiAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmNvbnN0IG5leHRDb21tZW50c0hhdmVJc3N1ZSA9ICggY29tbWVudHMsIGluZGV4ICkgPT4ge1xuICBjb25zdCB0b2RvQ29tbWVudCA9IGNvbW1lbnRzWyBpbmRleCBdO1xuXG4gIGxldCBoYXNJc3N1ZUluTmV4dENvbW1lbnRzID0gZmFsc2U7XG4gIGlmICggdG9kb0NvbW1lbnQudHlwZSA9PT0gJ0xpbmUnICkge1xuXG4gICAgbGV0IHByZXZpb3VzTGluZSA9IHRvZG9Db21tZW50LmxvYy5zdGFydC5saW5lO1xuXG4gICAgZm9yICggbGV0IGkgPSBpbmRleCArIDE7IGkgPCBjb21tZW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IGN1cnJlbnRDb21tZW50ID0gY29tbWVudHNbIGkgXTtcblxuICAgICAgLy8gTm8gbmV4dCBjb21tZW50XG4gICAgICBpZiAoICFjdXJyZW50Q29tbWVudCB8fFxuXG4gICAgICAgICAgIC8vIG5leHQgY29tbWVudCBpcyBhIGJsb2NrXG4gICAgICAgICAgIGN1cnJlbnRDb21tZW50LnR5cGUgIT09ICdMaW5lJyB8fFxuXG4gICAgICAgICAgIC8vIElmIG5leHRDb21tZW50IGlzIG5vdCBvbiB0aGUgbmV4dCBsaW5lXG4gICAgICAgICAgIGN1cnJlbnRDb21tZW50LmxvYy5zdGFydC5saW5lIC0gMSAhPT0gcHJldmlvdXNMaW5lICkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgaWYgKCBoYXNJc3N1ZUxpbmsoIGN1cnJlbnRDb21tZW50LnZhbHVlICkgKSB7XG4gICAgICAgIGhhc0lzc3VlSW5OZXh0Q29tbWVudHMgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHByZXZpb3VzTGluZSA9IGN1cnJlbnRDb21tZW50LmxvYy5zdGFydC5saW5lO1xuICAgIH1cbiAgfVxuICByZXR1cm4gaGFzSXNzdWVJbk5leHRDb21tZW50cztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBtZXRhOiB7XG4gICAgdHlwZTogJ3Byb2JsZW0nLFxuICAgIGZpeGFibGU6ICdjb2RlJ1xuICB9LFxuICBjcmVhdGU6IGNvbnRleHQgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBtZXRhOiB7XG4gICAgICAgIHR5cGU6ICdwcm9ibGVtJyxcbiAgICAgICAgZml4YWJsZTogJ2NvZGUnXG4gICAgICB9LFxuICAgICAgUHJvZ3JhbTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IGZpbGVuYW1lID0gY29udGV4dC5nZXRGaWxlbmFtZSgpO1xuXG4gICAgICAgIC8vIEV4cGxpY2l0bHkgaWdub3JlIGZpbGVzIGZyb20gdGhlIHNpbXVsYS1yYXNhIHJlcG8uIHNpbXVsYS1yYXNhIGlzIHRoZSB0ZW1wbGF0ZSBmb3IgbmV3IHNpbXVsYXRpb25zIHRoYXQgYXJlXG4gICAgICAgIC8vIGNyZWF0ZWQgdXNpbmcgJ2dydW50IGNyZWF0ZS1zaW0nLiBzaW11bGEtcmFzYSdzIGNvZGUgY29udGFpbnMgVE8tRE9zIHRoYXQgc2hvdWxkIGJlIGFkZHJlc3NlZCBieSB0aGUgY3JlYXRvclxuICAgICAgICAvLyBvZiB0aGUgbmV3IHNpbXVsYXRpb24uIFNvIHdlIGRvIG5vdCB3YW50IHRob3NlIFRPLURPcyB0byBoYXZlIGFuIGFzc29jaWF0ZWQgR2l0SHViIGlzc3VlLiBBbmQgd2UgZG8gbm90IHdhbnRcbiAgICAgICAgLy8gdG8gb3B0LW91dCBvZiB0aGlzIHJ1bGUgaW4gc2ltdWxhLXJhc2EvcGFja2FnZS5qc29uLCBiZWNhdXNlIGl0IHdpbGwgYmUgcHJvcGFnYXRlZCB0byB0aGUgbmV3IHNpbS5cbiAgICAgICAgaWYgKCBjb250ZXh0LmdldEZpbGVuYW1lKCkuaW5jbHVkZXMoICdzaW11bGEtcmFzYScgKSApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjb21tZW50cyA9IGNvbnRleHQuZ2V0U291cmNlQ29kZSgpLmdldEFsbENvbW1lbnRzKCk7XG5cbiAgICAgICAgaWYgKCBjb21tZW50cyApIHtcbiAgICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBjb21tZW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbW1lbnQgPSBjb21tZW50c1sgaSBdO1xuXG4gICAgICAgICAgICBpZiAoIGNvbnRhaW5zVE9ETyggY29tbWVudC52YWx1ZSApICkge1xuICAgICAgICAgICAgICBpZiAoICFoYXNJc3N1ZUxpbmsoIGNvbW1lbnQudmFsdWUgKSAmJiAhbmV4dENvbW1lbnRzSGF2ZUlzc3VlKCBjb21tZW50cywgaSApICkge1xuICAgICAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KCB7XG4gICAgICAgICAgICAgICAgICBub2RlOiBjb21tZW50LFxuICAgICAgICAgICAgICAgICAgbG9jOiBjb21tZW50LmxvYy5zdGFydCxcbiAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBUT0RPIHNob3VsZCBoYXZlIGFuIGlzc3VlOiAke2NvbW1lbnQudmFsdWV9YFxuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlIGlmICggcHJvY2Vzcy5lbnYuc2F2ZVRPRE9Jc3N1ZXMgKSB7XG4gICAgICAgICAgICAgICAgbGV0IHVybCA9IG51bGw7XG4gICAgICAgICAgICAgICAgY29uc3QgdXJsTWF0Y2ggPSBjb21tZW50LnZhbHVlLm1hdGNoKCB1cmxSZWdleCApO1xuICAgICAgICAgICAgICAgIGlmICggdXJsTWF0Y2ggKSB7XG4gICAgICAgICAgICAgICAgICB1cmwgPSB1cmxNYXRjaFsgMCBdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IGlzc3VlU2hvcnRoYW5kTWF0Y2ggPSBjb21tZW50LnZhbHVlLm1hdGNoKCBpc3N1ZVNob3J0aGFuZFJlZ2V4ICk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVwb05hbWVNYXRjaCA9IGZpbGVuYW1lLm1hdGNoKCAvW1xcXFwvXShbXFx3LV0rKVtcXFxcL11qc1tcXFxcL10vICk7XG4gICAgICAgICAgICAgICAgaWYgKCBpc3N1ZVNob3J0aGFuZE1hdGNoICYmIHJlcG9OYW1lTWF0Y2ggKSB7XG4gICAgICAgICAgICAgICAgICB1cmwgPSBgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zLyR7cmVwb05hbWVNYXRjaFsgMSBdfS9pc3N1ZXMvJHtpc3N1ZVNob3J0aGFuZE1hdGNoWyAxIF19YDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIHVybCApIHtcbiAgICAgICAgICAgICAgICAgIGlmICggIXVybC5zdGFydHNXaXRoKCAnaHR0cHM6Ly8nICkgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIGBVbmV4cGVjdGVkIFVSTCBiZWluZyB3cml0dGVuOiBcXG5cXHQke3VybH1cXG5cXHQke2ZpbGVuYW1lfVxcblxcdCR7Y29tbWVudH1gICk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKCB0b2RvSXNzdWVzRmlsZXBhdGgsIGZzLnJlYWRGaWxlU3luYyggdG9kb0lzc3Vlc0ZpbGVwYXRoICkudG9TdHJpbmcoKSArIGAke3VybH1cXG5gICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuc2NoZW1hID0gW1xuICAvLyBKU09OIFNjaGVtYSBmb3IgcnVsZSBvcHRpb25zIGdvZXMgaGVyZVxuXTsiXSwibmFtZXMiOlsicHJvY2VzcyIsInJlcXVpcmUiLCJwYXRoIiwiZnMiLCJpc3N1ZVNob3J0aGFuZFJlZ2V4IiwidXJsUmVnZXgiLCJmaWxlbmFtZSIsInRvZG9Jc3N1ZXNGaWxlcGF0aCIsInJlc29sdmUiLCJfX2Rpcm5hbWUiLCJjb250YWluc1RPRE8iLCJzdHJpbmciLCJpbmNsdWRlcyIsImhhc0lzc3VlTGluayIsIm1pc3NpbmdJc3N1ZU51bWJlciIsInRlc3QiLCJtaXNzaW5nTGluayIsIm5leHRDb21tZW50c0hhdmVJc3N1ZSIsImNvbW1lbnRzIiwiaW5kZXgiLCJ0b2RvQ29tbWVudCIsImhhc0lzc3VlSW5OZXh0Q29tbWVudHMiLCJ0eXBlIiwicHJldmlvdXNMaW5lIiwibG9jIiwic3RhcnQiLCJsaW5lIiwiaSIsImxlbmd0aCIsImN1cnJlbnRDb21tZW50IiwidmFsdWUiLCJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsImZpeGFibGUiLCJjcmVhdGUiLCJjb250ZXh0IiwiUHJvZ3JhbSIsImdldEZpbGVuYW1lIiwiZ2V0U291cmNlQ29kZSIsImdldEFsbENvbW1lbnRzIiwiY29tbWVudCIsInJlcG9ydCIsIm5vZGUiLCJtZXNzYWdlIiwiZW52Iiwic2F2ZVRPRE9Jc3N1ZXMiLCJ1cmwiLCJ1cmxNYXRjaCIsIm1hdGNoIiwiaXNzdWVTaG9ydGhhbmRNYXRjaCIsInJlcG9OYW1lTWF0Y2giLCJzdGFydHNXaXRoIiwiY29uc29sZSIsImVycm9yIiwid3JpdGVGaWxlU3luYyIsInJlYWRGaWxlU3luYyIsInRvU3RyaW5nIiwic2NoZW1hIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE1BQU1BLFVBQVVDLFFBQVM7QUFDekIsTUFBTUMsT0FBT0QsUUFBUztBQUN0QixNQUFNRSxLQUFLRixRQUFTO0FBRXBCLE1BQU1HLHNCQUFzQjtBQUM1QixNQUFNQyxXQUFXO0FBQ2pCLE1BQU1DLFdBQVc7QUFDakIsTUFBTUMscUJBQXFCTCxLQUFLTSxPQUFPLENBQUVDLFdBQVcsQ0FBQyxnQ0FBZ0MsRUFBRUgsVUFBVTtBQUVqRywwQ0FBMEM7QUFDMUMsTUFBTUksZUFBZUMsQ0FBQUEsU0FBVUEsT0FBT0MsUUFBUSxDQUFFO0FBRWhELHlDQUF5QztBQUN6QyxNQUFNQyxlQUFlRixDQUFBQTtJQUVuQix1Q0FBdUM7SUFDdkMsTUFBTUcscUJBQXFCLENBQUNWLG9CQUFvQlcsSUFBSSxDQUFFSjtJQUN0RCxNQUFNSyxjQUFjLENBQUNYLFNBQVNVLElBQUksQ0FBRUo7SUFDcEMsT0FBTyxDQUFHSyxDQUFBQSxlQUFlRixrQkFBaUI7QUFDNUM7QUFFQTs7Ozs7Ozs7O0NBU0MsR0FDRCxNQUFNRyx3QkFBd0IsQ0FBRUMsVUFBVUM7SUFDeEMsTUFBTUMsY0FBY0YsUUFBUSxDQUFFQyxNQUFPO0lBRXJDLElBQUlFLHlCQUF5QjtJQUM3QixJQUFLRCxZQUFZRSxJQUFJLEtBQUssUUFBUztRQUVqQyxJQUFJQyxlQUFlSCxZQUFZSSxHQUFHLENBQUNDLEtBQUssQ0FBQ0MsSUFBSTtRQUU3QyxJQUFNLElBQUlDLElBQUlSLFFBQVEsR0FBR1EsSUFBSVQsU0FBU1UsTUFBTSxFQUFFRCxJQUFNO1lBQ2xELE1BQU1FLGlCQUFpQlgsUUFBUSxDQUFFUyxFQUFHO1lBRXBDLGtCQUFrQjtZQUNsQixJQUFLLENBQUNFLGtCQUVELDBCQUEwQjtZQUMxQkEsZUFBZVAsSUFBSSxLQUFLLFVBRXhCLHlDQUF5QztZQUN6Q08sZUFBZUwsR0FBRyxDQUFDQyxLQUFLLENBQUNDLElBQUksR0FBRyxNQUFNSCxjQUFlO2dCQUN4RDtZQUNGO1lBRUEsSUFBS1YsYUFBY2dCLGVBQWVDLEtBQUssR0FBSztnQkFDMUNULHlCQUF5QjtnQkFDekI7WUFDRjtZQUNBRSxlQUFlTSxlQUFlTCxHQUFHLENBQUNDLEtBQUssQ0FBQ0MsSUFBSTtRQUM5QztJQUNGO0lBQ0EsT0FBT0w7QUFDVDtBQUVBVSxPQUFPQyxPQUFPLEdBQUc7SUFDZkMsTUFBTTtRQUNKWCxNQUFNO1FBQ05ZLFNBQVM7SUFDWDtJQUNBQyxRQUFRQyxDQUFBQTtRQUNOLE9BQU87WUFDTEgsTUFBTTtnQkFDSlgsTUFBTTtnQkFDTlksU0FBUztZQUNYO1lBQ0FHLFNBQVM7Z0JBQ1AsTUFBTS9CLFdBQVc4QixRQUFRRSxXQUFXO2dCQUVwQyw4R0FBOEc7Z0JBQzlHLCtHQUErRztnQkFDL0csK0dBQStHO2dCQUMvRyxxR0FBcUc7Z0JBQ3JHLElBQUtGLFFBQVFFLFdBQVcsR0FBRzFCLFFBQVEsQ0FBRSxnQkFBa0I7b0JBQ3JEO2dCQUNGO2dCQUVBLE1BQU1NLFdBQVdrQixRQUFRRyxhQUFhLEdBQUdDLGNBQWM7Z0JBRXZELElBQUt0QixVQUFXO29CQUNkLElBQU0sSUFBSVMsSUFBSSxHQUFHQSxJQUFJVCxTQUFTVSxNQUFNLEVBQUVELElBQU07d0JBQzFDLE1BQU1jLFVBQVV2QixRQUFRLENBQUVTLEVBQUc7d0JBRTdCLElBQUtqQixhQUFjK0IsUUFBUVgsS0FBSyxHQUFLOzRCQUNuQyxJQUFLLENBQUNqQixhQUFjNEIsUUFBUVgsS0FBSyxLQUFNLENBQUNiLHNCQUF1QkMsVUFBVVMsSUFBTTtnQ0FDN0VTLFFBQVFNLE1BQU0sQ0FBRTtvQ0FDZEMsTUFBTUY7b0NBQ05qQixLQUFLaUIsUUFBUWpCLEdBQUcsQ0FBQ0MsS0FBSztvQ0FDdEJtQixTQUFTLENBQUMsMkJBQTJCLEVBQUVILFFBQVFYLEtBQUssRUFBRTtnQ0FDeEQ7NEJBQ0YsT0FDSyxJQUFLOUIsUUFBUTZDLEdBQUcsQ0FBQ0MsY0FBYyxFQUFHO2dDQUNyQyxJQUFJQyxNQUFNO2dDQUNWLE1BQU1DLFdBQVdQLFFBQVFYLEtBQUssQ0FBQ21CLEtBQUssQ0FBRTVDO2dDQUN0QyxJQUFLMkMsVUFBVztvQ0FDZEQsTUFBTUMsUUFBUSxDQUFFLEVBQUc7Z0NBQ3JCO2dDQUVBLE1BQU1FLHNCQUFzQlQsUUFBUVgsS0FBSyxDQUFDbUIsS0FBSyxDQUFFN0M7Z0NBQ2pELE1BQU0rQyxnQkFBZ0I3QyxTQUFTMkMsS0FBSyxDQUFFO2dDQUN0QyxJQUFLQyx1QkFBdUJDLGVBQWdCO29DQUMxQ0osTUFBTSxDQUFDLDRCQUE0QixFQUFFSSxhQUFhLENBQUUsRUFBRyxDQUFDLFFBQVEsRUFBRUQsbUJBQW1CLENBQUUsRUFBRyxFQUFFO2dDQUM5RjtnQ0FFQSxJQUFLSCxLQUFNO29DQUNULElBQUssQ0FBQ0EsSUFBSUssVUFBVSxDQUFFLGFBQWU7d0NBQ25DQyxRQUFRQyxLQUFLLENBQUUsQ0FBQyxrQ0FBa0MsRUFBRVAsSUFBSSxJQUFJLEVBQUV6QyxTQUFTLElBQUksRUFBRW1DLFNBQVM7b0NBQ3hGO29DQUNBdEMsR0FBR29ELGFBQWEsQ0FBRWhELG9CQUFvQkosR0FBR3FELFlBQVksQ0FBRWpELG9CQUFxQmtELFFBQVEsS0FBSyxHQUFHVixJQUFJLEVBQUUsQ0FBQztnQ0FDckc7NEJBQ0Y7d0JBQ0Y7b0JBQ0Y7Z0JBQ0Y7WUFDRjtRQUNGO0lBQ0Y7QUFDRjtBQUVBaEIsT0FBT0MsT0FBTyxDQUFDMEIsTUFBTSxHQUFHLEVBRXZCIn0=