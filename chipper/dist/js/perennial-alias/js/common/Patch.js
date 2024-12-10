// Copyright 2018, University of Colorado Boulder
/**
 * Represents a specific patch being applied to a repository for maintenance purposes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ const assert = require('assert');
module.exports = function() {
    let Patch = class Patch {
        /**
     * Convert into a plain JS object meant for JSON serialization.
     * @public
     *
     * @returns {Object}
     */ serialize() {
            return {
                repo: this.repo,
                name: this.name,
                message: this.message,
                shas: this.shas
            };
        }
        /**
     * Takes a serialized form of the Patch and returns an actual instance.
     * @public
     *
     * @param {Object}
     * @returns {Patch}
     */ static deserialize({ repo, name, message, shas }) {
            return new Patch(repo, name, message, shas);
        }
        /**
     * @public
     * @constructor
     *
     * @param {string} repo
     * @param {string} name
     * @param {string} message - Usually an issue URL, but can include other things
     * @param {Array.<string>} shas - SHAs used to cherry-pick
     */ constructor(repo, name, message, shas = []){
            assert(typeof repo === 'string');
            assert(typeof name === 'string');
            assert(typeof message === 'string');
            assert(Array.isArray(shas));
            shas.forEach((sha)=>assert(typeof sha === 'string'));
            // @public {string}
            this.repo = repo;
            this.name = name;
            this.message = message;
            // @public {Array.<string>}
            this.shas = shas;
        }
    };
    return Patch;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vUGF0Y2guanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBzcGVjaWZpYyBwYXRjaCBiZWluZyBhcHBsaWVkIHRvIGEgcmVwb3NpdG9yeSBmb3IgbWFpbnRlbmFuY2UgcHVycG9zZXMuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoICdhc3NlcnQnICk7XG5cbm1vZHVsZS5leHBvcnRzID0gKCBmdW5jdGlvbigpIHtcblxuICBjbGFzcyBQYXRjaCB7XG4gICAgLyoqXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHJlcG9cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gVXN1YWxseSBhbiBpc3N1ZSBVUkwsIGJ1dCBjYW4gaW5jbHVkZSBvdGhlciB0aGluZ3NcbiAgICAgKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSBzaGFzIC0gU0hBcyB1c2VkIHRvIGNoZXJyeS1waWNrXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoIHJlcG8sIG5hbWUsIG1lc3NhZ2UsIHNoYXMgPSBbXSApIHtcbiAgICAgIGFzc2VydCggdHlwZW9mIHJlcG8gPT09ICdzdHJpbmcnICk7XG4gICAgICBhc3NlcnQoIHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJyApO1xuICAgICAgYXNzZXJ0KCB0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycgKTtcbiAgICAgIGFzc2VydCggQXJyYXkuaXNBcnJheSggc2hhcyApICk7XG4gICAgICBzaGFzLmZvckVhY2goIHNoYSA9PiBhc3NlcnQoIHR5cGVvZiBzaGEgPT09ICdzdHJpbmcnICkgKTtcblxuICAgICAgLy8gQHB1YmxpYyB7c3RyaW5nfVxuICAgICAgdGhpcy5yZXBvID0gcmVwbztcbiAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuXG4gICAgICAvLyBAcHVibGljIHtBcnJheS48c3RyaW5nPn1cbiAgICAgIHRoaXMuc2hhcyA9IHNoYXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydCBpbnRvIGEgcGxhaW4gSlMgb2JqZWN0IG1lYW50IGZvciBKU09OIHNlcmlhbGl6YXRpb24uXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAgKi9cbiAgICBzZXJpYWxpemUoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICByZXBvOiB0aGlzLnJlcG8sXG4gICAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgICAgICBzaGFzOiB0aGlzLnNoYXNcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGFrZXMgYSBzZXJpYWxpemVkIGZvcm0gb2YgdGhlIFBhdGNoIGFuZCByZXR1cm5zIGFuIGFjdHVhbCBpbnN0YW5jZS5cbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH1cbiAgICAgKiBAcmV0dXJucyB7UGF0Y2h9XG4gICAgICovXG4gICAgc3RhdGljIGRlc2VyaWFsaXplKCB7IHJlcG8sIG5hbWUsIG1lc3NhZ2UsIHNoYXMgfSApIHtcbiAgICAgIHJldHVybiBuZXcgUGF0Y2goIHJlcG8sIG5hbWUsIG1lc3NhZ2UsIHNoYXMgKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gUGF0Y2g7XG59ICkoKTsiXSwibmFtZXMiOlsiYXNzZXJ0IiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJQYXRjaCIsInNlcmlhbGl6ZSIsInJlcG8iLCJuYW1lIiwibWVzc2FnZSIsInNoYXMiLCJkZXNlcmlhbGl6ZSIsImNvbnN0cnVjdG9yIiwiQXJyYXkiLCJpc0FycmF5IiwiZm9yRWFjaCIsInNoYSJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUMsR0FFRCxNQUFNQSxTQUFTQyxRQUFTO0FBRXhCQyxPQUFPQyxPQUFPLEdBQUcsQUFBRTtJQUVqQixJQUFBLEFBQU1DLFFBQU4sTUFBTUE7UUEwQko7Ozs7O0tBS0MsR0FDREMsWUFBWTtZQUNWLE9BQU87Z0JBQ0xDLE1BQU0sSUFBSSxDQUFDQSxJQUFJO2dCQUNmQyxNQUFNLElBQUksQ0FBQ0EsSUFBSTtnQkFDZkMsU0FBUyxJQUFJLENBQUNBLE9BQU87Z0JBQ3JCQyxNQUFNLElBQUksQ0FBQ0EsSUFBSTtZQUNqQjtRQUNGO1FBRUE7Ozs7OztLQU1DLEdBQ0QsT0FBT0MsWUFBYSxFQUFFSixJQUFJLEVBQUVDLElBQUksRUFBRUMsT0FBTyxFQUFFQyxJQUFJLEVBQUUsRUFBRztZQUNsRCxPQUFPLElBQUlMLE1BQU9FLE1BQU1DLE1BQU1DLFNBQVNDO1FBQ3pDO1FBakRBOzs7Ozs7OztLQVFDLEdBQ0RFLFlBQWFMLElBQUksRUFBRUMsSUFBSSxFQUFFQyxPQUFPLEVBQUVDLE9BQU8sRUFBRSxDQUFHO1lBQzVDVCxPQUFRLE9BQU9NLFNBQVM7WUFDeEJOLE9BQVEsT0FBT08sU0FBUztZQUN4QlAsT0FBUSxPQUFPUSxZQUFZO1lBQzNCUixPQUFRWSxNQUFNQyxPQUFPLENBQUVKO1lBQ3ZCQSxLQUFLSyxPQUFPLENBQUVDLENBQUFBLE1BQU9mLE9BQVEsT0FBT2UsUUFBUTtZQUU1QyxtQkFBbUI7WUFDbkIsSUFBSSxDQUFDVCxJQUFJLEdBQUdBO1lBQ1osSUFBSSxDQUFDQyxJQUFJLEdBQUdBO1lBQ1osSUFBSSxDQUFDQyxPQUFPLEdBQUdBO1lBRWYsMkJBQTJCO1lBQzNCLElBQUksQ0FBQ0MsSUFBSSxHQUFHQTtRQUNkO0lBMkJGO0lBRUEsT0FBT0w7QUFDVCJ9