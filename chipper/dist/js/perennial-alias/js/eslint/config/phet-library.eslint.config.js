// Copyright 2023, University of Colorado Boulder
// @author Michael Kauzmann
import simEslintConfig from './sim.eslint.config.mjs';
/**
 * Eslint config applied only to "library" code. This means code that is potentially meant to run outside of the context
 * of phetsims. For example, a SUN/Checkbox shouldn't require a hard dependency on the phetsim environment (for example
 * joist's nav bar or preferences) to correctly run.
 */ export default [
    ...simEslintConfig,
    {
        rules: {
            'phet/bad-phet-library-text': 'error'
        }
    }
];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvY29uZmlnL3BoZXQtbGlicmFyeS5lc2xpbnQuY29uZmlnLm1qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG4vLyBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm5cblxuaW1wb3J0IHNpbUVzbGludENvbmZpZyBmcm9tICcuL3NpbS5lc2xpbnQuY29uZmlnLm1qcyc7XG5cbi8qKlxuICogRXNsaW50IGNvbmZpZyBhcHBsaWVkIG9ubHkgdG8gXCJsaWJyYXJ5XCIgY29kZS4gVGhpcyBtZWFucyBjb2RlIHRoYXQgaXMgcG90ZW50aWFsbHkgbWVhbnQgdG8gcnVuIG91dHNpZGUgb2YgdGhlIGNvbnRleHRcbiAqIG9mIHBoZXRzaW1zLiBGb3IgZXhhbXBsZSwgYSBTVU4vQ2hlY2tib3ggc2hvdWxkbid0IHJlcXVpcmUgYSBoYXJkIGRlcGVuZGVuY3kgb24gdGhlIHBoZXRzaW0gZW52aXJvbm1lbnQgKGZvciBleGFtcGxlXG4gKiBqb2lzdCdzIG5hdiBiYXIgb3IgcHJlZmVyZW5jZXMpIHRvIGNvcnJlY3RseSBydW4uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IFtcbiAgLi4uc2ltRXNsaW50Q29uZmlnLFxuICB7XG4gICAgcnVsZXM6IHtcbiAgICAgICdwaGV0L2JhZC1waGV0LWxpYnJhcnktdGV4dCc6ICdlcnJvcidcbiAgICB9XG4gIH1cbl07Il0sIm5hbWVzIjpbInNpbUVzbGludENvbmZpZyIsInJ1bGVzIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFDakQsMkJBQTJCO0FBRTNCLE9BQU9BLHFCQUFxQiwwQkFBMEI7QUFFdEQ7Ozs7Q0FJQyxHQUNELGVBQWU7T0FDVkE7SUFDSDtRQUNFQyxPQUFPO1lBQ0wsOEJBQThCO1FBQ2hDO0lBQ0Y7Q0FDRCxDQUFDIn0=