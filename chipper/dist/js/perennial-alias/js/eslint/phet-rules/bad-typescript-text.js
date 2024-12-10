// Copyright 2022, University of Colorado Boulder
/**
 * Lint detector for invalid text, expected only to be checked against typescript files.
 * Lint is disabled for this file so the bad texts aren't themselves flagged.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ const getBadTextTester = require('./getBadTextTester');
module.exports = {
    create: function(context) {
        // see getBadTextTester for schema.
        const forbiddenTextObjects = [
            // Don't lie to yourself.
            'JavaScript is much, much better than TypeScript.',
            // Typescript handles this for us, please refrain from providing visibility annotations via jsdoc (unless you have
            // to, disabling this rule).
            '@public',
            '@protected',
            '@private',
            'options = merge',
            // To convert javascript files to typescript, you do not need to include a nocheck directive, just commit locally
            // before converting to preserve history, see https://github.com/phetsims/sun/issues/732#issuecomment-995330513
            '@ts-nocheck',
            // combineOptions should always specify the type parameter like combineOptions<...>.
            'combineOptions(',
            // The type parameters should be inferred rather than specified
            '.multilink<',
            '.lazyMultilink<',
            'new DerivedProperty<',
            'const simOptions = {',
            // Typescript files should not use jsdoc for parameters
            '@param {',
            // Don't export SelfOptions, https://github.com/phetsims/chipper/issues/1263
            'export type SelfOptions',
            // Use the PhetioID type alias please, https://github.com/phetsims/tandem/issues/296
            'phetioID: string',
            {
                id: '@returns with type and/or without extra doc',
                regex: /(@returns \{)|(@returns *$)/
            }
        ];
        return {
            Program: getBadTextTester('bad-typescript-text', forbiddenTextObjects, context)
        };
    }
};
module.exports.schema = [];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9iYWQtdHlwZXNjcmlwdC10ZXh0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbiBcblxuLyoqXG4gKiBMaW50IGRldGVjdG9yIGZvciBpbnZhbGlkIHRleHQsIGV4cGVjdGVkIG9ubHkgdG8gYmUgY2hlY2tlZCBhZ2FpbnN0IHR5cGVzY3JpcHQgZmlsZXMuXG4gKiBMaW50IGlzIGRpc2FibGVkIGZvciB0aGlzIGZpbGUgc28gdGhlIGJhZCB0ZXh0cyBhcmVuJ3QgdGhlbXNlbHZlcyBmbGFnZ2VkLlxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5jb25zdCBnZXRCYWRUZXh0VGVzdGVyID0gcmVxdWlyZSggJy4vZ2V0QmFkVGV4dFRlc3RlcicgKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogZnVuY3Rpb24oIGNvbnRleHQgKSB7XG5cbiAgICAvLyBzZWUgZ2V0QmFkVGV4dFRlc3RlciBmb3Igc2NoZW1hLlxuICAgIGNvbnN0IGZvcmJpZGRlblRleHRPYmplY3RzID0gW1xuXG4gICAgICAvLyBEb24ndCBsaWUgdG8geW91cnNlbGYuXG4gICAgICAnSmF2YVNjcmlwdCBpcyBtdWNoLCBtdWNoIGJldHRlciB0aGFuIFR5cGVTY3JpcHQuJyxcblxuICAgICAgLy8gVHlwZXNjcmlwdCBoYW5kbGVzIHRoaXMgZm9yIHVzLCBwbGVhc2UgcmVmcmFpbiBmcm9tIHByb3ZpZGluZyB2aXNpYmlsaXR5IGFubm90YXRpb25zIHZpYSBqc2RvYyAodW5sZXNzIHlvdSBoYXZlXG4gICAgICAvLyB0bywgZGlzYWJsaW5nIHRoaXMgcnVsZSkuXG4gICAgICAnQHB1YmxpYycsXG4gICAgICAnQHByb3RlY3RlZCcsXG4gICAgICAnQHByaXZhdGUnLFxuXG4gICAgICAnb3B0aW9ucyA9IG1lcmdlJyxcblxuICAgICAgLy8gVG8gY29udmVydCBqYXZhc2NyaXB0IGZpbGVzIHRvIHR5cGVzY3JpcHQsIHlvdSBkbyBub3QgbmVlZCB0byBpbmNsdWRlIGEgbm9jaGVjayBkaXJlY3RpdmUsIGp1c3QgY29tbWl0IGxvY2FsbHlcbiAgICAgIC8vIGJlZm9yZSBjb252ZXJ0aW5nIHRvIHByZXNlcnZlIGhpc3RvcnksIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy83MzIjaXNzdWVjb21tZW50LTk5NTMzMDUxM1xuICAgICAgJ0B0cy1ub2NoZWNrJyxcblxuICAgICAgLy8gY29tYmluZU9wdGlvbnMgc2hvdWxkIGFsd2F5cyBzcGVjaWZ5IHRoZSB0eXBlIHBhcmFtZXRlciBsaWtlIGNvbWJpbmVPcHRpb25zPC4uLj4uXG4gICAgICAnY29tYmluZU9wdGlvbnMoJyxcblxuICAgICAgLy8gVGhlIHR5cGUgcGFyYW1ldGVycyBzaG91bGQgYmUgaW5mZXJyZWQgcmF0aGVyIHRoYW4gc3BlY2lmaWVkXG4gICAgICAnLm11bHRpbGluazwnLFxuICAgICAgJy5sYXp5TXVsdGlsaW5rPCcsXG4gICAgICAnbmV3IERlcml2ZWRQcm9wZXJ0eTwnLFxuXG4gICAgICAnY29uc3Qgc2ltT3B0aW9ucyA9IHsnLFxuXG4gICAgICAvLyBUeXBlc2NyaXB0IGZpbGVzIHNob3VsZCBub3QgdXNlIGpzZG9jIGZvciBwYXJhbWV0ZXJzXG4gICAgICAnQHBhcmFtIHsnLFxuXG4gICAgICAvLyBEb24ndCBleHBvcnQgU2VsZk9wdGlvbnMsIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xMjYzXG4gICAgICAnZXhwb3J0IHR5cGUgU2VsZk9wdGlvbnMnLFxuXG4gICAgICAvLyBVc2UgdGhlIFBoZXRpb0lEIHR5cGUgYWxpYXMgcGxlYXNlLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdGFuZGVtL2lzc3Vlcy8yOTZcbiAgICAgICdwaGV0aW9JRDogc3RyaW5nJyxcblxuICAgICAge1xuICAgICAgICBpZDogJ0ByZXR1cm5zIHdpdGggdHlwZSBhbmQvb3Igd2l0aG91dCBleHRyYSBkb2MnLFxuICAgICAgICByZWdleDogLyhAcmV0dXJucyBcXHspfChAcmV0dXJucyAqJCkvXG4gICAgICB9XG4gICAgXTtcblxuICAgIHJldHVybiB7XG4gICAgICBQcm9ncmFtOiBnZXRCYWRUZXh0VGVzdGVyKCAnYmFkLXR5cGVzY3JpcHQtdGV4dCcsIGZvcmJpZGRlblRleHRPYmplY3RzLCBjb250ZXh0IClcbiAgICB9O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5zY2hlbWEgPSBbXG4gIC8vIEpTT04gU2NoZW1hIGZvciBydWxlIG9wdGlvbnMgZ29lcyBoZXJlXG5dOyJdLCJuYW1lcyI6WyJnZXRCYWRUZXh0VGVzdGVyIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJjcmVhdGUiLCJjb250ZXh0IiwiZm9yYmlkZGVuVGV4dE9iamVjdHMiLCJpZCIsInJlZ2V4IiwiUHJvZ3JhbSIsInNjaGVtYSJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBR2pEOzs7OztDQUtDLEdBRUQsTUFBTUEsbUJBQW1CQyxRQUFTO0FBRWxDQyxPQUFPQyxPQUFPLEdBQUc7SUFDZkMsUUFBUSxTQUFVQyxPQUFPO1FBRXZCLG1DQUFtQztRQUNuQyxNQUFNQyx1QkFBdUI7WUFFM0IseUJBQXlCO1lBQ3pCO1lBRUEsa0hBQWtIO1lBQ2xILDRCQUE0QjtZQUM1QjtZQUNBO1lBQ0E7WUFFQTtZQUVBLGlIQUFpSDtZQUNqSCwrR0FBK0c7WUFDL0c7WUFFQSxvRkFBb0Y7WUFDcEY7WUFFQSwrREFBK0Q7WUFDL0Q7WUFDQTtZQUNBO1lBRUE7WUFFQSx1REFBdUQ7WUFDdkQ7WUFFQSw0RUFBNEU7WUFDNUU7WUFFQSxvRkFBb0Y7WUFDcEY7WUFFQTtnQkFDRUMsSUFBSTtnQkFDSkMsT0FBTztZQUNUO1NBQ0Q7UUFFRCxPQUFPO1lBQ0xDLFNBQVNULGlCQUFrQix1QkFBdUJNLHNCQUFzQkQ7UUFDMUU7SUFDRjtBQUNGO0FBRUFILE9BQU9DLE9BQU8sQ0FBQ08sTUFBTSxHQUFHLEVBRXZCIn0=