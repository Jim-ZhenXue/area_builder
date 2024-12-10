// Copyright 2024, University of Colorado Boulder
/**
 * Eslint config applied only to browser-based runtimes.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ function _extends() {
    _extends = Object.assign || function(target) {
        for(var i = 1; i < arguments.length; i++){
            var source = arguments[i];
            for(var key in source){
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    };
    return _extends.apply(this, arguments);
}
import globals from 'globals';
import rootEslintConfig from './root.eslint.config.mjs';
import { phetSimBrowserGlobalsObject } from './util/phetSimBrowserGlobals.mjs';
export default [
    // Here, we must have a complete set of rules for interpretation, so we include the rootEslintConfig.
    ...rootEslintConfig,
    // Where getBrowserConfiguration is included elsewhere, the call site must supply the rootEslintConfig.
    {
        languageOptions: {
            globals: _extends({}, globals.browser, phetSimBrowserGlobalsObject)
        }
    },
    {
        files: [
            '**/*.jsx',
            '**/*.tsx'
        ],
        languageOptions: {
            globals: {
                React: 'readonly',
                ReactDOM: 'readonly'
            }
        }
    }
];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvY29uZmlnL2Jyb3dzZXIuZXNsaW50LmNvbmZpZy5tanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEVzbGludCBjb25maWcgYXBwbGllZCBvbmx5IHRvIGJyb3dzZXItYmFzZWQgcnVudGltZXMuXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBnbG9iYWxzIGZyb20gJ2dsb2JhbHMnO1xuaW1wb3J0IHJvb3RFc2xpbnRDb25maWcgZnJvbSAnLi9yb290LmVzbGludC5jb25maWcubWpzJztcbmltcG9ydCB7IHBoZXRTaW1Ccm93c2VyR2xvYmFsc09iamVjdCB9IGZyb20gJy4vdXRpbC9waGV0U2ltQnJvd3Nlckdsb2JhbHMubWpzJztcblxuZXhwb3J0IGRlZmF1bHQgW1xuXG4gIC8vIEhlcmUsIHdlIG11c3QgaGF2ZSBhIGNvbXBsZXRlIHNldCBvZiBydWxlcyBmb3IgaW50ZXJwcmV0YXRpb24sIHNvIHdlIGluY2x1ZGUgdGhlIHJvb3RFc2xpbnRDb25maWcuXG4gIC4uLnJvb3RFc2xpbnRDb25maWcsXG5cbiAgLy8gV2hlcmUgZ2V0QnJvd3NlckNvbmZpZ3VyYXRpb24gaXMgaW5jbHVkZWQgZWxzZXdoZXJlLCB0aGUgY2FsbCBzaXRlIG11c3Qgc3VwcGx5IHRoZSByb290RXNsaW50Q29uZmlnLlxuICB7XG4gICAgbGFuZ3VhZ2VPcHRpb25zOiB7XG4gICAgICBnbG9iYWxzOiB7XG4gICAgICAgIC4uLmdsb2JhbHMuYnJvd3NlcixcbiAgICAgICAgLi4ucGhldFNpbUJyb3dzZXJHbG9iYWxzT2JqZWN0XG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgZmlsZXM6IFsgJyoqLyouanN4JywgJyoqLyoudHN4JyBdLFxuICAgIGxhbmd1YWdlT3B0aW9uczoge1xuICAgICAgZ2xvYmFsczoge1xuICAgICAgICBSZWFjdDogJ3JlYWRvbmx5JyxcbiAgICAgICAgUmVhY3RET006ICdyZWFkb25seSdcbiAgICAgIH1cbiAgICB9XG4gIH1cbl07Il0sIm5hbWVzIjpbImdsb2JhbHMiLCJyb290RXNsaW50Q29uZmlnIiwicGhldFNpbUJyb3dzZXJHbG9iYWxzT2JqZWN0IiwibGFuZ3VhZ2VPcHRpb25zIiwiYnJvd3NlciIsImZpbGVzIiwiUmVhY3QiLCJSZWFjdERPTSJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7O0FBRUQsT0FBT0EsYUFBYSxVQUFVO0FBQzlCLE9BQU9DLHNCQUFzQiwyQkFBMkI7QUFDeEQsU0FBU0MsMkJBQTJCLFFBQVEsbUNBQW1DO0FBRS9FLGVBQWU7SUFFYixxR0FBcUc7T0FDbEdEO0lBRUgsdUdBQXVHO0lBQ3ZHO1FBQ0VFLGlCQUFpQjtZQUNmSCxTQUFTLGFBQ0pBLFFBQVFJLE9BQU8sRUFDZkY7UUFFUDtJQUNGO0lBQ0E7UUFDRUcsT0FBTztZQUFFO1lBQVk7U0FBWTtRQUNqQ0YsaUJBQWlCO1lBQ2ZILFNBQVM7Z0JBQ1BNLE9BQU87Z0JBQ1BDLFVBQVU7WUFDWjtRQUNGO0lBQ0Y7Q0FDRCxDQUFDIn0=