// Copyright 2024, University of Colorado Boulder
/**
 * Eslint config applied to code that runs in both browser and NodeJS.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import rootEslintConfig from './root.eslint.config.mjs';
export default [
    // Here, we must have a complete set of rules for interpretation, so we include the rootEslintConfig.
    ...rootEslintConfig,
    {
        languageOptions: {
            globals: {
                // Opt into globals that we know exist in NodeJS and the browser with the same API.
                console: 'readonly'
            }
        },
        rules: {
            'phet/bad-phet-library-text': 'error',
            'phet/bad-sim-text': 'error'
        }
    }
];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvY29uZmlnL2Jyb3dzZXItYW5kLW5vZGUuZXNsaW50LmNvbmZpZy5tanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEVzbGludCBjb25maWcgYXBwbGllZCB0byBjb2RlIHRoYXQgcnVucyBpbiBib3RoIGJyb3dzZXIgYW5kIE5vZGVKUy5cbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IHJvb3RFc2xpbnRDb25maWcgZnJvbSAnLi9yb290LmVzbGludC5jb25maWcubWpzJztcblxuZXhwb3J0IGRlZmF1bHQgW1xuXG4gIC8vIEhlcmUsIHdlIG11c3QgaGF2ZSBhIGNvbXBsZXRlIHNldCBvZiBydWxlcyBmb3IgaW50ZXJwcmV0YXRpb24sIHNvIHdlIGluY2x1ZGUgdGhlIHJvb3RFc2xpbnRDb25maWcuXG4gIC4uLnJvb3RFc2xpbnRDb25maWcsXG5cbiAge1xuICAgIGxhbmd1YWdlT3B0aW9uczoge1xuICAgICAgZ2xvYmFsczoge1xuICAgICAgICAvLyBPcHQgaW50byBnbG9iYWxzIHRoYXQgd2Uga25vdyBleGlzdCBpbiBOb2RlSlMgYW5kIHRoZSBicm93c2VyIHdpdGggdGhlIHNhbWUgQVBJLlxuICAgICAgICBjb25zb2xlOiAncmVhZG9ubHknXG4gICAgICB9XG4gICAgfSxcbiAgICBydWxlczoge1xuICAgICAgJ3BoZXQvYmFkLXBoZXQtbGlicmFyeS10ZXh0JzogJ2Vycm9yJyxcbiAgICAgICdwaGV0L2JhZC1zaW0tdGV4dCc6ICdlcnJvcidcbiAgICB9XG4gIH1cbl07Il0sIm5hbWVzIjpbInJvb3RFc2xpbnRDb25maWciLCJsYW5ndWFnZU9wdGlvbnMiLCJnbG9iYWxzIiwiY29uc29sZSIsInJ1bGVzIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQyxHQUVELE9BQU9BLHNCQUFzQiwyQkFBMkI7QUFFeEQsZUFBZTtJQUViLHFHQUFxRztPQUNsR0E7SUFFSDtRQUNFQyxpQkFBaUI7WUFDZkMsU0FBUztnQkFDUCxtRkFBbUY7Z0JBQ25GQyxTQUFTO1lBQ1g7UUFDRjtRQUNBQyxPQUFPO1lBQ0wsOEJBQThCO1lBQzlCLHFCQUFxQjtRQUN2QjtJQUNGO0NBQ0QsQ0FBQyJ9