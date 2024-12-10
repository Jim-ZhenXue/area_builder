// Copyright 2023-2024, University of Colorado Boulder
/**
 * A set of utility constants and functions for working with the english keys PhET has defined in
 * EnglishStringToCodeMap.ts.
 *
 * This is a separate file from EnglishStringToCodeMap.ts and KeyboardUtils.ts to avoid circular dependencies.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ const ARROW_KEYS = [
    'arrowLeft',
    'arrowRight',
    'arrowUp',
    'arrowDown'
];
const MOVEMENT_KEYS = [
    ...ARROW_KEYS,
    'w',
    'a',
    's',
    'd'
];
const RANGE_KEYS = [
    ...ARROW_KEYS,
    'pageUp',
    'pageDown',
    'end',
    'home'
];
const NUMBER_KEYS = [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9
];
const EnglishStringKeyUtils = {
    ARROW_KEYS: ARROW_KEYS,
    MOVEMENT_KEYS: MOVEMENT_KEYS,
    RANGE_KEYS: RANGE_KEYS,
    NUMBER_KEYS: NUMBER_KEYS,
    /**
   * Returns true if the key maps to an arrow key. This is an EnglishStringToCodeMap key, NOT a KeyboardEvent.code.
   */ isArrowKey (key) {
        return ARROW_KEYS.includes(key);
    },
    /**
   * Returns true if the provided key maps to a typical "movement" key, using arrow and WASD keys. This is
   * an EnglishStringToCodeMap key, NOT a KeyboardEvent.code.
   */ isMovementKey (key) {
        return MOVEMENT_KEYS.includes(key);
    },
    /**
   * Returns true if the key maps to a key used with "range" type input (like a slider). Provided key
   * should be one of EnglishStringToCodeMap's keys, NOT a KeyboardEvent.code.
   */ isRangeKey (key) {
        return RANGE_KEYS.includes(key);
    },
    /**
   * Returns true if the key is a number key. Provided key should be one of EnglishStringToCodeMap's keys, NOT a
   * KeyboardEvent.code.
   */ isNumberKey (key) {
        return NUMBER_KEYS.includes(key);
    }
};
export default EnglishStringKeyUtils;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS9FbmdsaXNoU3RyaW5nS2V5VXRpbHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBzZXQgb2YgdXRpbGl0eSBjb25zdGFudHMgYW5kIGZ1bmN0aW9ucyBmb3Igd29ya2luZyB3aXRoIHRoZSBlbmdsaXNoIGtleXMgUGhFVCBoYXMgZGVmaW5lZCBpblxuICogRW5nbGlzaFN0cmluZ1RvQ29kZU1hcC50cy5cbiAqXG4gKiBUaGlzIGlzIGEgc2VwYXJhdGUgZmlsZSBmcm9tIEVuZ2xpc2hTdHJpbmdUb0NvZGVNYXAudHMgYW5kIEtleWJvYXJkVXRpbHMudHMgdG8gYXZvaWQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLlxuICpcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCB7IEVuZ2xpc2hLZXkgfSBmcm9tICcuL0VuZ2xpc2hTdHJpbmdUb0NvZGVNYXAuanMnO1xuXG5jb25zdCBBUlJPV19LRVlTOiBFbmdsaXNoS2V5W10gPSBbICdhcnJvd0xlZnQnLCAnYXJyb3dSaWdodCcsICdhcnJvd1VwJywgJ2Fycm93RG93bicgXTtcbmNvbnN0IE1PVkVNRU5UX0tFWVM6IEVuZ2xpc2hLZXlbXSA9IFsgLi4uQVJST1dfS0VZUywgJ3cnLCAnYScsICdzJywgJ2QnIF07XG5jb25zdCBSQU5HRV9LRVlTOiBFbmdsaXNoS2V5W10gPSBbIC4uLkFSUk9XX0tFWVMsICdwYWdlVXAnLCAncGFnZURvd24nLCAnZW5kJywgJ2hvbWUnIF07XG5jb25zdCBOVU1CRVJfS0VZUzogRW5nbGlzaEtleVtdID0gWyAwLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5IF07XG5cbmNvbnN0IEVuZ2xpc2hTdHJpbmdLZXlVdGlscyA9IHtcblxuICBBUlJPV19LRVlTOiBBUlJPV19LRVlTLFxuICBNT1ZFTUVOVF9LRVlTOiBNT1ZFTUVOVF9LRVlTLFxuICBSQU5HRV9LRVlTOiBSQU5HRV9LRVlTLFxuICBOVU1CRVJfS0VZUzogTlVNQkVSX0tFWVMsXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUga2V5IG1hcHMgdG8gYW4gYXJyb3cga2V5LiBUaGlzIGlzIGFuIEVuZ2xpc2hTdHJpbmdUb0NvZGVNYXAga2V5LCBOT1QgYSBLZXlib2FyZEV2ZW50LmNvZGUuXG4gICAqL1xuICBpc0Fycm93S2V5KCBrZXk6IEVuZ2xpc2hLZXkgKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIEFSUk9XX0tFWVMuaW5jbHVkZXMoIGtleSApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHByb3ZpZGVkIGtleSBtYXBzIHRvIGEgdHlwaWNhbCBcIm1vdmVtZW50XCIga2V5LCB1c2luZyBhcnJvdyBhbmQgV0FTRCBrZXlzLiBUaGlzIGlzXG4gICAqIGFuIEVuZ2xpc2hTdHJpbmdUb0NvZGVNYXAga2V5LCBOT1QgYSBLZXlib2FyZEV2ZW50LmNvZGUuXG4gICAqL1xuICBpc01vdmVtZW50S2V5KCBrZXk6IEVuZ2xpc2hLZXkgKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIE1PVkVNRU5UX0tFWVMuaW5jbHVkZXMoIGtleSApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGtleSBtYXBzIHRvIGEga2V5IHVzZWQgd2l0aCBcInJhbmdlXCIgdHlwZSBpbnB1dCAobGlrZSBhIHNsaWRlcikuIFByb3ZpZGVkIGtleVxuICAgKiBzaG91bGQgYmUgb25lIG9mIEVuZ2xpc2hTdHJpbmdUb0NvZGVNYXAncyBrZXlzLCBOT1QgYSBLZXlib2FyZEV2ZW50LmNvZGUuXG4gICAqL1xuICBpc1JhbmdlS2V5KCBrZXk6IEVuZ2xpc2hLZXkgKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIFJBTkdFX0tFWVMuaW5jbHVkZXMoIGtleSApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGtleSBpcyBhIG51bWJlciBrZXkuIFByb3ZpZGVkIGtleSBzaG91bGQgYmUgb25lIG9mIEVuZ2xpc2hTdHJpbmdUb0NvZGVNYXAncyBrZXlzLCBOT1QgYVxuICAgKiBLZXlib2FyZEV2ZW50LmNvZGUuXG4gICAqL1xuICBpc051bWJlcktleSgga2V5OiBFbmdsaXNoS2V5ICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBOVU1CRVJfS0VZUy5pbmNsdWRlcygga2V5ICk7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IEVuZ2xpc2hTdHJpbmdLZXlVdGlsczsiXSwibmFtZXMiOlsiQVJST1dfS0VZUyIsIk1PVkVNRU5UX0tFWVMiLCJSQU5HRV9LRVlTIiwiTlVNQkVSX0tFWVMiLCJFbmdsaXNoU3RyaW5nS2V5VXRpbHMiLCJpc0Fycm93S2V5Iiwia2V5IiwiaW5jbHVkZXMiLCJpc01vdmVtZW50S2V5IiwiaXNSYW5nZUtleSIsImlzTnVtYmVyS2V5Il0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Q0FPQyxHQUlELE1BQU1BLGFBQTJCO0lBQUU7SUFBYTtJQUFjO0lBQVc7Q0FBYTtBQUN0RixNQUFNQyxnQkFBOEI7T0FBS0Q7SUFBWTtJQUFLO0lBQUs7SUFBSztDQUFLO0FBQ3pFLE1BQU1FLGFBQTJCO09BQUtGO0lBQVk7SUFBVTtJQUFZO0lBQU87Q0FBUTtBQUN2RixNQUFNRyxjQUE0QjtJQUFFO0lBQUc7SUFBRztJQUFHO0lBQUc7SUFBRztJQUFHO0lBQUc7SUFBRztJQUFHO0NBQUc7QUFFbEUsTUFBTUMsd0JBQXdCO0lBRTVCSixZQUFZQTtJQUNaQyxlQUFlQTtJQUNmQyxZQUFZQTtJQUNaQyxhQUFhQTtJQUViOztHQUVDLEdBQ0RFLFlBQVlDLEdBQWU7UUFDekIsT0FBT04sV0FBV08sUUFBUSxDQUFFRDtJQUM5QjtJQUVBOzs7R0FHQyxHQUNERSxlQUFlRixHQUFlO1FBQzVCLE9BQU9MLGNBQWNNLFFBQVEsQ0FBRUQ7SUFDakM7SUFFQTs7O0dBR0MsR0FDREcsWUFBWUgsR0FBZTtRQUN6QixPQUFPSixXQUFXSyxRQUFRLENBQUVEO0lBQzlCO0lBRUE7OztHQUdDLEdBQ0RJLGFBQWFKLEdBQWU7UUFDMUIsT0FBT0gsWUFBWUksUUFBUSxDQUFFRDtJQUMvQjtBQUNGO0FBRUEsZUFBZUYsc0JBQXNCIn0=