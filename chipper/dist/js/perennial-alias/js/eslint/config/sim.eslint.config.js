// Copyright 2018-2024, University of Colorado Boulder
import browserEslintConfig from './browser.eslint.config.mjs';
/**
 * Eslint config applied only to simulations.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ export default [
    ...browserEslintConfig,
    {
        rules: {
            'phet/bad-sim-text': 'error'
        }
    },
    {
        // Most html files don't need to behave like sims
        files: [
            '**/*.html'
        ],
        rules: {
            'phet/bad-sim-text': 'off'
        }
    }
];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvY29uZmlnL3NpbS5lc2xpbnQuY29uZmlnLm1qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuaW1wb3J0IGJyb3dzZXJFc2xpbnRDb25maWcgZnJvbSAnLi9icm93c2VyLmVzbGludC5jb25maWcubWpzJztcblxuLyoqXG4gKiBFc2xpbnQgY29uZmlnIGFwcGxpZWQgb25seSB0byBzaW11bGF0aW9ucy5cbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cbmV4cG9ydCBkZWZhdWx0IFtcbiAgLi4uYnJvd3NlckVzbGludENvbmZpZyxcbiAge1xuICAgIHJ1bGVzOiB7XG4gICAgICAncGhldC9iYWQtc2ltLXRleHQnOiAnZXJyb3InXG4gICAgfVxuICB9LFxuICB7XG4gICAgLy8gTW9zdCBodG1sIGZpbGVzIGRvbid0IG5lZWQgdG8gYmVoYXZlIGxpa2Ugc2ltc1xuICAgIGZpbGVzOiBbICcqKi8qLmh0bWwnIF0sXG4gICAgcnVsZXM6IHtcbiAgICAgICdwaGV0L2JhZC1zaW0tdGV4dCc6ICdvZmYnXG4gICAgfVxuICB9XG5dOyJdLCJuYW1lcyI6WyJicm93c2VyRXNsaW50Q29uZmlnIiwicnVsZXMiLCJmaWxlcyJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXRELE9BQU9BLHlCQUF5Qiw4QkFBOEI7QUFFOUQ7Ozs7Q0FJQyxHQUNELGVBQWU7T0FDVkE7SUFDSDtRQUNFQyxPQUFPO1lBQ0wscUJBQXFCO1FBQ3ZCO0lBQ0Y7SUFDQTtRQUNFLGlEQUFpRDtRQUNqREMsT0FBTztZQUFFO1NBQWE7UUFDdEJELE9BQU87WUFDTCxxQkFBcUI7UUFDdkI7SUFDRjtDQUNELENBQUMifQ==