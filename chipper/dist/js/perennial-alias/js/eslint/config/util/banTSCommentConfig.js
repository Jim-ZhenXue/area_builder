// Copyright 2024, University of Colorado Boulder
/**
 * Most strict form of ban-ts-comment which is often reused in simulations.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ export default [
    {
        files: [
            '**/*.ts',
            '**/*.tsx'
        ],
        rules: {
            '@typescript-eslint/ban-ts-comment': [
                'error',
                {
                    'ts-expect-error': true,
                    'ts-ignore': true,
                    'ts-check': true,
                    'ts-nocheck': true
                }
            ]
        }
    }
];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvY29uZmlnL3V0aWwvYmFuVFNDb21tZW50Q29uZmlnLm1qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogTW9zdCBzdHJpY3QgZm9ybSBvZiBiYW4tdHMtY29tbWVudCB3aGljaCBpcyBvZnRlbiByZXVzZWQgaW4gc2ltdWxhdGlvbnMuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuZXhwb3J0IGRlZmF1bHQgWyB7XG4gIGZpbGVzOiBbICcqKi8qLnRzJywgJyoqLyoudHN4JyBdLFxuICBydWxlczoge1xuICAgICdAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnQnOiBbXG4gICAgICAnZXJyb3InLFxuICAgICAge1xuICAgICAgICAndHMtZXhwZWN0LWVycm9yJzogdHJ1ZSxcbiAgICAgICAgJ3RzLWlnbm9yZSc6IHRydWUsXG4gICAgICAgICd0cy1jaGVjayc6IHRydWUsXG4gICAgICAgICd0cy1ub2NoZWNrJzogdHJ1ZVxuICAgICAgfVxuICAgIF1cbiAgfVxufSBdOyJdLCJuYW1lcyI6WyJmaWxlcyIsInJ1bGVzIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQyxHQUNELGVBQWU7SUFBRTtRQUNmQSxPQUFPO1lBQUU7WUFBVztTQUFZO1FBQ2hDQyxPQUFPO1lBQ0wscUNBQXFDO2dCQUNuQztnQkFDQTtvQkFDRSxtQkFBbUI7b0JBQ25CLGFBQWE7b0JBQ2IsWUFBWTtvQkFDWixjQUFjO2dCQUNoQjthQUNEO1FBQ0g7SUFDRjtDQUFHLENBQUMifQ==