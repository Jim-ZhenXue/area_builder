// Copyright 2022-2024, University of Colorado Boulder
/**
 * Since SVG doesn't support parsing scientific notation (e.g. 7e5), we need to output fixed decimal-point strings.
 * Since this needs to be done quickly, and we don't particularly care about slight rounding differences (it's
 * being used for display purposes only, and is never shown to the user), we use the built-in JS toFixed instead of
 * Dot's version of toFixed. See https://github.com/phetsims/kite/issues/50
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { kite } from '../imports.js';
const svgNumber = (n)=>{
    return n.toFixed(20); // eslint-disable-line phet/bad-sim-text
};
kite.register('svgNumber', svgNumber);
export default svgNumber;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvdXRpbC9zdmdOdW1iZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogU2luY2UgU1ZHIGRvZXNuJ3Qgc3VwcG9ydCBwYXJzaW5nIHNjaWVudGlmaWMgbm90YXRpb24gKGUuZy4gN2U1KSwgd2UgbmVlZCB0byBvdXRwdXQgZml4ZWQgZGVjaW1hbC1wb2ludCBzdHJpbmdzLlxuICogU2luY2UgdGhpcyBuZWVkcyB0byBiZSBkb25lIHF1aWNrbHksIGFuZCB3ZSBkb24ndCBwYXJ0aWN1bGFybHkgY2FyZSBhYm91dCBzbGlnaHQgcm91bmRpbmcgZGlmZmVyZW5jZXMgKGl0J3NcbiAqIGJlaW5nIHVzZWQgZm9yIGRpc3BsYXkgcHVycG9zZXMgb25seSwgYW5kIGlzIG5ldmVyIHNob3duIHRvIHRoZSB1c2VyKSwgd2UgdXNlIHRoZSBidWlsdC1pbiBKUyB0b0ZpeGVkIGluc3RlYWQgb2ZcbiAqIERvdCdzIHZlcnNpb24gb2YgdG9GaXhlZC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy81MFxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgeyBraXRlIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmNvbnN0IHN2Z051bWJlciA9ICggbjogbnVtYmVyICk6IHN0cmluZyA9PiB7XG4gIHJldHVybiBuLnRvRml4ZWQoIDIwICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC9iYWQtc2ltLXRleHRcbn07XG5cbmtpdGUucmVnaXN0ZXIoICdzdmdOdW1iZXInLCBzdmdOdW1iZXIgKTtcblxuZXhwb3J0IGRlZmF1bHQgc3ZnTnVtYmVyOyJdLCJuYW1lcyI6WyJraXRlIiwic3ZnTnVtYmVyIiwibiIsInRvRml4ZWQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7O0NBT0MsR0FFRCxTQUFTQSxJQUFJLFFBQVEsZ0JBQWdCO0FBRXJDLE1BQU1DLFlBQVksQ0FBRUM7SUFDbEIsT0FBT0EsRUFBRUMsT0FBTyxDQUFFLEtBQU0sd0NBQXdDO0FBQ2xFO0FBRUFILEtBQUtJLFFBQVEsQ0FBRSxhQUFhSDtBQUU1QixlQUFlQSxVQUFVIn0=