// Copyright 2024, University of Colorado Boulder
/**
 * ESLint configuration for chipper.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import browserEslintConfig from '../../../perennial-alias/js/eslint/config/browser.eslint.config.mjs';
import { mutateForNestedConfig } from '../../../perennial-alias/js/eslint/config/root.eslint.config.mjs';
export default [
    ...mutateForNestedConfig(browserEslintConfig),
    {
        rules: {
            'phet/bad-chipper-text': 'error'
        }
    }
];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2Jyb3dzZXIvZXNsaW50LmNvbmZpZy5tanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEVTTGludCBjb25maWd1cmF0aW9uIGZvciBjaGlwcGVyLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IGJyb3dzZXJFc2xpbnRDb25maWcgZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2VzbGludC9jb25maWcvYnJvd3Nlci5lc2xpbnQuY29uZmlnLm1qcyc7XG5pbXBvcnQgeyBtdXRhdGVGb3JOZXN0ZWRDb25maWcgfSBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvZXNsaW50L2NvbmZpZy9yb290LmVzbGludC5jb25maWcubWpzJztcblxuXG5leHBvcnQgZGVmYXVsdCBbXG4gIC4uLm11dGF0ZUZvck5lc3RlZENvbmZpZyggYnJvd3NlckVzbGludENvbmZpZyApLFxuICB7XG4gICAgcnVsZXM6IHtcbiAgICAgICdwaGV0L2JhZC1jaGlwcGVyLXRleHQnOiAnZXJyb3InXG4gICAgfVxuICB9XG5dOyJdLCJuYW1lcyI6WyJicm93c2VyRXNsaW50Q29uZmlnIiwibXV0YXRlRm9yTmVzdGVkQ29uZmlnIiwicnVsZXMiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7Ozs7Q0FLQyxHQUVELE9BQU9BLHlCQUF5QixzRUFBc0U7QUFDdEcsU0FBU0MscUJBQXFCLFFBQVEsbUVBQW1FO0FBR3pHLGVBQWU7T0FDVkEsc0JBQXVCRDtJQUMxQjtRQUNFRSxPQUFPO1lBQ0wseUJBQXlCO1FBQzNCO0lBQ0Y7Q0FDRCxDQUFDIn0=