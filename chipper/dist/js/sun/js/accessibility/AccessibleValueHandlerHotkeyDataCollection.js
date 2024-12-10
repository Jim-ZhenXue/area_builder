// Copyright 2024, University of Colorado Boulder
/**
 * The HotkeyData used for AccessibleValueHandler and its subclasses. This would ideally be inside of
 * AccessibleValueHandler but I couldn't figure out how to add public static properties to the trait pattern.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import Property from '../../../axon/js/Property.js';
import { HotkeyData } from '../../../scenery/js/imports.js';
import sun from '../sun.js';
const AccessibleValueHandlerHotkeyDataCollection = {
    HOME_HOTKEY_DATA: new HotkeyData({
        keyStringProperties: [
            new Property('home')
        ],
        binderName: 'Set value to minimum',
        repoName: sun.name
    }),
    END_HOTKEY_DATA: new HotkeyData({
        keyStringProperties: [
            new Property('end')
        ],
        binderName: 'Set value to maximum',
        repoName: sun.name
    }),
    PAGE_UP_HOTKEY_DATA: new HotkeyData({
        keyStringProperties: [
            new Property('pageUp')
        ],
        binderName: 'Increment value by page',
        repoName: sun.name
    }),
    PAGE_DOWN_HOTKEY_DATA: new HotkeyData({
        keyStringProperties: [
            new Property('pageDown')
        ],
        binderName: 'Decrement value by page',
        repoName: sun.name
    }),
    UP_ARROW_HOTKEY_DATA: new HotkeyData({
        keyStringProperties: [
            new Property('arrowUp')
        ],
        binderName: 'Increment value by up arrow',
        repoName: sun.name
    }),
    DOWN_ARROW_HOTKEY_DATA: new HotkeyData({
        keyStringProperties: [
            new Property('arrowDown')
        ],
        binderName: 'Decrement value by down arrow',
        repoName: sun.name
    }),
    RIGHT_ARROW_HOTKEY_DATA: new HotkeyData({
        keyStringProperties: [
            new Property('arrowRight')
        ],
        binderName: 'Increment value by right arrow',
        repoName: sun.name
    }),
    LEFT_ARROW_HOTKEY_DATA: new HotkeyData({
        keyStringProperties: [
            new Property('arrowLeft')
        ],
        binderName: 'Decrement value by left arrow',
        repoName: sun.name
    }),
    // The shift key is tracked through event metadata so be very careful if you need to change this key.
    SHIFT_HOTKEY_DATA: new HotkeyData({
        keyStringProperties: [
            new Property('shift')
        ],
        binderName: 'Increment/decrement in smaller steps',
        repoName: sun.name
    }),
    /**
   * Returns true if the key string provided is a range key and should interact with the accessible value handler.
   */ isRangeKey (englishKeyString) {
        return HotkeyData.anyHaveKeyStroke([
            AccessibleValueHandlerHotkeyDataCollection.HOME_HOTKEY_DATA,
            AccessibleValueHandlerHotkeyDataCollection.END_HOTKEY_DATA,
            AccessibleValueHandlerHotkeyDataCollection.PAGE_UP_HOTKEY_DATA,
            AccessibleValueHandlerHotkeyDataCollection.PAGE_DOWN_HOTKEY_DATA,
            AccessibleValueHandlerHotkeyDataCollection.UP_ARROW_HOTKEY_DATA,
            AccessibleValueHandlerHotkeyDataCollection.DOWN_ARROW_HOTKEY_DATA,
            AccessibleValueHandlerHotkeyDataCollection.RIGHT_ARROW_HOTKEY_DATA,
            AccessibleValueHandlerHotkeyDataCollection.LEFT_ARROW_HOTKEY_DATA
        ], englishKeyString);
    }
};
export default AccessibleValueHandlerHotkeyDataCollection;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9hY2Nlc3NpYmlsaXR5L0FjY2Vzc2libGVWYWx1ZUhhbmRsZXJIb3RrZXlEYXRhQ29sbGVjdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGhlIEhvdGtleURhdGEgdXNlZCBmb3IgQWNjZXNzaWJsZVZhbHVlSGFuZGxlciBhbmQgaXRzIHN1YmNsYXNzZXMuIFRoaXMgd291bGQgaWRlYWxseSBiZSBpbnNpZGUgb2ZcbiAqIEFjY2Vzc2libGVWYWx1ZUhhbmRsZXIgYnV0IEkgY291bGRuJ3QgZmlndXJlIG91dCBob3cgdG8gYWRkIHB1YmxpYyBzdGF0aWMgcHJvcGVydGllcyB0byB0aGUgdHJhaXQgcGF0dGVybi5cbiAqXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgeyBIb3RrZXlEYXRhLCBPbmVLZXlTdHJva2VFbnRyeSB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgc3VuIGZyb20gJy4uL3N1bi5qcyc7XG5cbmNvbnN0IEFjY2Vzc2libGVWYWx1ZUhhbmRsZXJIb3RrZXlEYXRhQ29sbGVjdGlvbiA9IHtcblxuICBIT01FX0hPVEtFWV9EQVRBOiBuZXcgSG90a2V5RGF0YSgge1xuICAgIGtleVN0cmluZ1Byb3BlcnRpZXM6IFsgbmV3IFByb3BlcnR5KCAnaG9tZScgKSBdLFxuICAgIGJpbmRlck5hbWU6ICdTZXQgdmFsdWUgdG8gbWluaW11bScsXG4gICAgcmVwb05hbWU6IHN1bi5uYW1lXG4gIH0gKSxcblxuICBFTkRfSE9US0VZX0RBVEE6IG5ldyBIb3RrZXlEYXRhKCB7XG4gICAga2V5U3RyaW5nUHJvcGVydGllczogWyBuZXcgUHJvcGVydHkoICdlbmQnICkgXSxcbiAgICBiaW5kZXJOYW1lOiAnU2V0IHZhbHVlIHRvIG1heGltdW0nLFxuICAgIHJlcG9OYW1lOiBzdW4ubmFtZVxuICB9ICksXG5cbiAgUEFHRV9VUF9IT1RLRVlfREFUQTogbmV3IEhvdGtleURhdGEoIHtcbiAgICBrZXlTdHJpbmdQcm9wZXJ0aWVzOiBbIG5ldyBQcm9wZXJ0eSggJ3BhZ2VVcCcgKSBdLFxuICAgIGJpbmRlck5hbWU6ICdJbmNyZW1lbnQgdmFsdWUgYnkgcGFnZScsXG4gICAgcmVwb05hbWU6IHN1bi5uYW1lXG4gIH0gKSxcblxuICBQQUdFX0RPV05fSE9US0VZX0RBVEE6IG5ldyBIb3RrZXlEYXRhKCB7XG4gICAga2V5U3RyaW5nUHJvcGVydGllczogWyBuZXcgUHJvcGVydHkoICdwYWdlRG93bicgKSBdLFxuICAgIGJpbmRlck5hbWU6ICdEZWNyZW1lbnQgdmFsdWUgYnkgcGFnZScsXG4gICAgcmVwb05hbWU6IHN1bi5uYW1lXG4gIH0gKSxcblxuICBVUF9BUlJPV19IT1RLRVlfREFUQTogbmV3IEhvdGtleURhdGEoIHtcbiAgICBrZXlTdHJpbmdQcm9wZXJ0aWVzOiBbIG5ldyBQcm9wZXJ0eSggJ2Fycm93VXAnICkgXSxcbiAgICBiaW5kZXJOYW1lOiAnSW5jcmVtZW50IHZhbHVlIGJ5IHVwIGFycm93JyxcbiAgICByZXBvTmFtZTogc3VuLm5hbWVcbiAgfSApLFxuXG4gIERPV05fQVJST1dfSE9US0VZX0RBVEE6IG5ldyBIb3RrZXlEYXRhKCB7XG4gICAga2V5U3RyaW5nUHJvcGVydGllczogWyBuZXcgUHJvcGVydHkoICdhcnJvd0Rvd24nICkgXSxcbiAgICBiaW5kZXJOYW1lOiAnRGVjcmVtZW50IHZhbHVlIGJ5IGRvd24gYXJyb3cnLFxuICAgIHJlcG9OYW1lOiBzdW4ubmFtZVxuICB9ICksXG5cbiAgUklHSFRfQVJST1dfSE9US0VZX0RBVEE6IG5ldyBIb3RrZXlEYXRhKCB7XG4gICAga2V5U3RyaW5nUHJvcGVydGllczogWyBuZXcgUHJvcGVydHkoICdhcnJvd1JpZ2h0JyApIF0sXG4gICAgYmluZGVyTmFtZTogJ0luY3JlbWVudCB2YWx1ZSBieSByaWdodCBhcnJvdycsXG4gICAgcmVwb05hbWU6IHN1bi5uYW1lXG4gIH0gKSxcblxuICBMRUZUX0FSUk9XX0hPVEtFWV9EQVRBOiBuZXcgSG90a2V5RGF0YSgge1xuICAgIGtleVN0cmluZ1Byb3BlcnRpZXM6IFsgbmV3IFByb3BlcnR5KCAnYXJyb3dMZWZ0JyApIF0sXG4gICAgYmluZGVyTmFtZTogJ0RlY3JlbWVudCB2YWx1ZSBieSBsZWZ0IGFycm93JyxcbiAgICByZXBvTmFtZTogc3VuLm5hbWVcbiAgfSApLFxuXG4gIC8vIFRoZSBzaGlmdCBrZXkgaXMgdHJhY2tlZCB0aHJvdWdoIGV2ZW50IG1ldGFkYXRhIHNvIGJlIHZlcnkgY2FyZWZ1bCBpZiB5b3UgbmVlZCB0byBjaGFuZ2UgdGhpcyBrZXkuXG4gIFNISUZUX0hPVEtFWV9EQVRBOiBuZXcgSG90a2V5RGF0YSgge1xuICAgIGtleVN0cmluZ1Byb3BlcnRpZXM6IFsgbmV3IFByb3BlcnR5KCAnc2hpZnQnICkgXSxcbiAgICBiaW5kZXJOYW1lOiAnSW5jcmVtZW50L2RlY3JlbWVudCBpbiBzbWFsbGVyIHN0ZXBzJyxcbiAgICByZXBvTmFtZTogc3VuLm5hbWVcbiAgfSApLFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGtleSBzdHJpbmcgcHJvdmlkZWQgaXMgYSByYW5nZSBrZXkgYW5kIHNob3VsZCBpbnRlcmFjdCB3aXRoIHRoZSBhY2Nlc3NpYmxlIHZhbHVlIGhhbmRsZXIuXG4gICAqL1xuICBpc1JhbmdlS2V5KCBlbmdsaXNoS2V5U3RyaW5nOiBPbmVLZXlTdHJva2VFbnRyeSApOiBib29sZWFuIHtcbiAgICByZXR1cm4gSG90a2V5RGF0YS5hbnlIYXZlS2V5U3Ryb2tlKCBbXG4gICAgICBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVySG90a2V5RGF0YUNvbGxlY3Rpb24uSE9NRV9IT1RLRVlfREFUQSxcbiAgICAgIEFjY2Vzc2libGVWYWx1ZUhhbmRsZXJIb3RrZXlEYXRhQ29sbGVjdGlvbi5FTkRfSE9US0VZX0RBVEEsXG4gICAgICBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVySG90a2V5RGF0YUNvbGxlY3Rpb24uUEFHRV9VUF9IT1RLRVlfREFUQSxcbiAgICAgIEFjY2Vzc2libGVWYWx1ZUhhbmRsZXJIb3RrZXlEYXRhQ29sbGVjdGlvbi5QQUdFX0RPV05fSE9US0VZX0RBVEEsXG4gICAgICBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVySG90a2V5RGF0YUNvbGxlY3Rpb24uVVBfQVJST1dfSE9US0VZX0RBVEEsXG4gICAgICBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVySG90a2V5RGF0YUNvbGxlY3Rpb24uRE9XTl9BUlJPV19IT1RLRVlfREFUQSxcbiAgICAgIEFjY2Vzc2libGVWYWx1ZUhhbmRsZXJIb3RrZXlEYXRhQ29sbGVjdGlvbi5SSUdIVF9BUlJPV19IT1RLRVlfREFUQSxcbiAgICAgIEFjY2Vzc2libGVWYWx1ZUhhbmRsZXJIb3RrZXlEYXRhQ29sbGVjdGlvbi5MRUZUX0FSUk9XX0hPVEtFWV9EQVRBXG4gICAgXSwgZW5nbGlzaEtleVN0cmluZyApO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVySG90a2V5RGF0YUNvbGxlY3Rpb247Il0sIm5hbWVzIjpbIlByb3BlcnR5IiwiSG90a2V5RGF0YSIsInN1biIsIkFjY2Vzc2libGVWYWx1ZUhhbmRsZXJIb3RrZXlEYXRhQ29sbGVjdGlvbiIsIkhPTUVfSE9US0VZX0RBVEEiLCJrZXlTdHJpbmdQcm9wZXJ0aWVzIiwiYmluZGVyTmFtZSIsInJlcG9OYW1lIiwibmFtZSIsIkVORF9IT1RLRVlfREFUQSIsIlBBR0VfVVBfSE9US0VZX0RBVEEiLCJQQUdFX0RPV05fSE9US0VZX0RBVEEiLCJVUF9BUlJPV19IT1RLRVlfREFUQSIsIkRPV05fQVJST1dfSE9US0VZX0RBVEEiLCJSSUdIVF9BUlJPV19IT1RLRVlfREFUQSIsIkxFRlRfQVJST1dfSE9US0VZX0RBVEEiLCJTSElGVF9IT1RLRVlfREFUQSIsImlzUmFuZ2VLZXkiLCJlbmdsaXNoS2V5U3RyaW5nIiwiYW55SGF2ZUtleVN0cm9rZSJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7OztDQUtDLEdBRUQsT0FBT0EsY0FBYywrQkFBK0I7QUFDcEQsU0FBU0MsVUFBVSxRQUEyQixpQ0FBaUM7QUFDL0UsT0FBT0MsU0FBUyxZQUFZO0FBRTVCLE1BQU1DLDZDQUE2QztJQUVqREMsa0JBQWtCLElBQUlILFdBQVk7UUFDaENJLHFCQUFxQjtZQUFFLElBQUlMLFNBQVU7U0FBVTtRQUMvQ00sWUFBWTtRQUNaQyxVQUFVTCxJQUFJTSxJQUFJO0lBQ3BCO0lBRUFDLGlCQUFpQixJQUFJUixXQUFZO1FBQy9CSSxxQkFBcUI7WUFBRSxJQUFJTCxTQUFVO1NBQVM7UUFDOUNNLFlBQVk7UUFDWkMsVUFBVUwsSUFBSU0sSUFBSTtJQUNwQjtJQUVBRSxxQkFBcUIsSUFBSVQsV0FBWTtRQUNuQ0kscUJBQXFCO1lBQUUsSUFBSUwsU0FBVTtTQUFZO1FBQ2pETSxZQUFZO1FBQ1pDLFVBQVVMLElBQUlNLElBQUk7SUFDcEI7SUFFQUcsdUJBQXVCLElBQUlWLFdBQVk7UUFDckNJLHFCQUFxQjtZQUFFLElBQUlMLFNBQVU7U0FBYztRQUNuRE0sWUFBWTtRQUNaQyxVQUFVTCxJQUFJTSxJQUFJO0lBQ3BCO0lBRUFJLHNCQUFzQixJQUFJWCxXQUFZO1FBQ3BDSSxxQkFBcUI7WUFBRSxJQUFJTCxTQUFVO1NBQWE7UUFDbERNLFlBQVk7UUFDWkMsVUFBVUwsSUFBSU0sSUFBSTtJQUNwQjtJQUVBSyx3QkFBd0IsSUFBSVosV0FBWTtRQUN0Q0kscUJBQXFCO1lBQUUsSUFBSUwsU0FBVTtTQUFlO1FBQ3BETSxZQUFZO1FBQ1pDLFVBQVVMLElBQUlNLElBQUk7SUFDcEI7SUFFQU0seUJBQXlCLElBQUliLFdBQVk7UUFDdkNJLHFCQUFxQjtZQUFFLElBQUlMLFNBQVU7U0FBZ0I7UUFDckRNLFlBQVk7UUFDWkMsVUFBVUwsSUFBSU0sSUFBSTtJQUNwQjtJQUVBTyx3QkFBd0IsSUFBSWQsV0FBWTtRQUN0Q0kscUJBQXFCO1lBQUUsSUFBSUwsU0FBVTtTQUFlO1FBQ3BETSxZQUFZO1FBQ1pDLFVBQVVMLElBQUlNLElBQUk7SUFDcEI7SUFFQSxxR0FBcUc7SUFDckdRLG1CQUFtQixJQUFJZixXQUFZO1FBQ2pDSSxxQkFBcUI7WUFBRSxJQUFJTCxTQUFVO1NBQVc7UUFDaERNLFlBQVk7UUFDWkMsVUFBVUwsSUFBSU0sSUFBSTtJQUNwQjtJQUVBOztHQUVDLEdBQ0RTLFlBQVlDLGdCQUFtQztRQUM3QyxPQUFPakIsV0FBV2tCLGdCQUFnQixDQUFFO1lBQ2xDaEIsMkNBQTJDQyxnQkFBZ0I7WUFDM0RELDJDQUEyQ00sZUFBZTtZQUMxRE4sMkNBQTJDTyxtQkFBbUI7WUFDOURQLDJDQUEyQ1EscUJBQXFCO1lBQ2hFUiwyQ0FBMkNTLG9CQUFvQjtZQUMvRFQsMkNBQTJDVSxzQkFBc0I7WUFDakVWLDJDQUEyQ1csdUJBQXVCO1lBQ2xFWCwyQ0FBMkNZLHNCQUFzQjtTQUNsRSxFQUFFRztJQUNMO0FBQ0Y7QUFFQSxlQUFlZiwyQ0FBMkMifQ==