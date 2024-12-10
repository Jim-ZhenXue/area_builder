// Copyright 2017, University of Colorado Boulder
/**
 * Prompts the user to confirm a message (or enter a specific string or message).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ const readline = require('readline');
const winston = require('winston');
const MAGENTA = '\u001B[35m';
const RESET = '\u001B[0m';
/**
 * Prompts the user to confirm a message (or enter a specific string or message).
 * @public
 *
 * @param {string} prompt - The string to be shown to the user
 * @returns {Promise.<string>} - Resolves with the string entered by the user.
 */ module.exports = function(prompt) {
    return new Promise((resolve, reject)=>{
        winston.debug(`prompting the user with ${prompt}`);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(MAGENTA + prompt + RESET, (answer)=>{
            rl.close();
            winston.debug(`received answer: ${answer}`);
            resolve(answer);
        });
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vcHJvbXB0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBQcm9tcHRzIHRoZSB1c2VyIHRvIGNvbmZpcm0gYSBtZXNzYWdlIChvciBlbnRlciBhIHNwZWNpZmljIHN0cmluZyBvciBtZXNzYWdlKS5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgcmVhZGxpbmUgPSByZXF1aXJlKCAncmVhZGxpbmUnICk7XG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSggJ3dpbnN0b24nICk7XG5cbmNvbnN0IE1BR0VOVEEgPSAnXFx1MDAxQlszNW0nO1xuY29uc3QgUkVTRVQgPSAnXFx1MDAxQlswbSc7XG5cbi8qKlxuICogUHJvbXB0cyB0aGUgdXNlciB0byBjb25maXJtIGEgbWVzc2FnZSAob3IgZW50ZXIgYSBzcGVjaWZpYyBzdHJpbmcgb3IgbWVzc2FnZSkuXG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHByb21wdCAtIFRoZSBzdHJpbmcgdG8gYmUgc2hvd24gdG8gdGhlIHVzZXJcbiAqIEByZXR1cm5zIHtQcm9taXNlLjxzdHJpbmc+fSAtIFJlc29sdmVzIHdpdGggdGhlIHN0cmluZyBlbnRlcmVkIGJ5IHRoZSB1c2VyLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBwcm9tcHQgKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlLCByZWplY3QgKSA9PiB7XG4gICAgd2luc3Rvbi5kZWJ1ZyggYHByb21wdGluZyB0aGUgdXNlciB3aXRoICR7cHJvbXB0fWAgKTtcblxuICAgIGNvbnN0IHJsID0gcmVhZGxpbmUuY3JlYXRlSW50ZXJmYWNlKCB7IGlucHV0OiBwcm9jZXNzLnN0ZGluLCBvdXRwdXQ6IHByb2Nlc3Muc3Rkb3V0IH0gKTtcblxuICAgIHJsLnF1ZXN0aW9uKCBNQUdFTlRBICsgcHJvbXB0ICsgUkVTRVQsIGFuc3dlciA9PiB7XG4gICAgICBybC5jbG9zZSgpO1xuXG4gICAgICB3aW5zdG9uLmRlYnVnKCBgcmVjZWl2ZWQgYW5zd2VyOiAke2Fuc3dlcn1gICk7XG5cbiAgICAgIHJlc29sdmUoIGFuc3dlciApO1xuICAgIH0gKTtcbiAgfSApO1xufTsiXSwibmFtZXMiOlsicmVhZGxpbmUiLCJyZXF1aXJlIiwid2luc3RvbiIsIk1BR0VOVEEiLCJSRVNFVCIsIm1vZHVsZSIsImV4cG9ydHMiLCJwcm9tcHQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImRlYnVnIiwicmwiLCJjcmVhdGVJbnRlcmZhY2UiLCJpbnB1dCIsInByb2Nlc3MiLCJzdGRpbiIsIm91dHB1dCIsInN0ZG91dCIsInF1ZXN0aW9uIiwiYW5zd2VyIiwiY2xvc2UiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDLEdBRUQsTUFBTUEsV0FBV0MsUUFBUztBQUMxQixNQUFNQyxVQUFVRCxRQUFTO0FBRXpCLE1BQU1FLFVBQVU7QUFDaEIsTUFBTUMsUUFBUTtBQUVkOzs7Ozs7Q0FNQyxHQUNEQyxPQUFPQyxPQUFPLEdBQUcsU0FBVUMsTUFBTTtJQUMvQixPQUFPLElBQUlDLFFBQVMsQ0FBRUMsU0FBU0M7UUFDN0JSLFFBQVFTLEtBQUssQ0FBRSxDQUFDLHdCQUF3QixFQUFFSixRQUFRO1FBRWxELE1BQU1LLEtBQUtaLFNBQVNhLGVBQWUsQ0FBRTtZQUFFQyxPQUFPQyxRQUFRQyxLQUFLO1lBQUVDLFFBQVFGLFFBQVFHLE1BQU07UUFBQztRQUVwRk4sR0FBR08sUUFBUSxDQUFFaEIsVUFBVUksU0FBU0gsT0FBT2dCLENBQUFBO1lBQ3JDUixHQUFHUyxLQUFLO1lBRVJuQixRQUFRUyxLQUFLLENBQUUsQ0FBQyxpQkFBaUIsRUFBRVMsUUFBUTtZQUUzQ1gsUUFBU1c7UUFDWDtJQUNGO0FBQ0YifQ==