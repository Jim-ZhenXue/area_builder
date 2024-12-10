// Copyright 2016-2024, University of Colorado Boulder
/**
 * Query parameters for the sun demo application.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import sun from './sun.js';
const sunQueryParameters = QueryStringMachine.getAll({
    // background color of the screens
    backgroundColor: {
        type: 'string',
        defaultValue: 'white'
    },
    // initial selection for the component selector for a screen, values are the same as the labels on combo box items
    component: {
        type: 'string',
        defaultValue: null
    },
    // initial selection on the Layout screen, values are the same as the labels on combo box items
    layout: {
        type: 'string',
        defaultValue: 'Width of multiple panels'
    }
});
sun.register('sunQueryParameters', sunQueryParameters);
export default sunQueryParameters;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9zdW5RdWVyeVBhcmFtZXRlcnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUXVlcnkgcGFyYW1ldGVycyBmb3IgdGhlIHN1biBkZW1vIGFwcGxpY2F0aW9uLlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IHN1biBmcm9tICcuL3N1bi5qcyc7XG5cbmNvbnN0IHN1blF1ZXJ5UGFyYW1ldGVycyA9IFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRBbGwoIHtcblxuICAvLyBiYWNrZ3JvdW5kIGNvbG9yIG9mIHRoZSBzY3JlZW5zXG4gIGJhY2tncm91bmRDb2xvcjoge1xuICAgIHR5cGU6ICdzdHJpbmcnLCAvLyBDU1MgY29sb3IgZm9ybWF0LCBlLmcuICdncmVlbicsICdmZjhjMDAnLCAncmdiKDI1NSwwLDI1NSknXG4gICAgZGVmYXVsdFZhbHVlOiAnd2hpdGUnXG4gIH0sXG5cbiAgLy8gaW5pdGlhbCBzZWxlY3Rpb24gZm9yIHRoZSBjb21wb25lbnQgc2VsZWN0b3IgZm9yIGEgc2NyZWVuLCB2YWx1ZXMgYXJlIHRoZSBzYW1lIGFzIHRoZSBsYWJlbHMgb24gY29tYm8gYm94IGl0ZW1zXG4gIGNvbXBvbmVudDoge1xuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHRWYWx1ZTogbnVsbFxuICB9LFxuXG4gIC8vIGluaXRpYWwgc2VsZWN0aW9uIG9uIHRoZSBMYXlvdXQgc2NyZWVuLCB2YWx1ZXMgYXJlIHRoZSBzYW1lIGFzIHRoZSBsYWJlbHMgb24gY29tYm8gYm94IGl0ZW1zXG4gIGxheW91dDoge1xuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHRWYWx1ZTogJ1dpZHRoIG9mIG11bHRpcGxlIHBhbmVscydcbiAgfVxufSApO1xuXG5zdW4ucmVnaXN0ZXIoICdzdW5RdWVyeVBhcmFtZXRlcnMnLCBzdW5RdWVyeVBhcmFtZXRlcnMgKTtcblxuZXhwb3J0IGRlZmF1bHQgc3VuUXVlcnlQYXJhbWV0ZXJzOyJdLCJuYW1lcyI6WyJzdW4iLCJzdW5RdWVyeVBhcmFtZXRlcnMiLCJRdWVyeVN0cmluZ01hY2hpbmUiLCJnZXRBbGwiLCJiYWNrZ3JvdW5kQ29sb3IiLCJ0eXBlIiwiZGVmYXVsdFZhbHVlIiwiY29tcG9uZW50IiwibGF5b3V0IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsU0FBUyxXQUFXO0FBRTNCLE1BQU1DLHFCQUFxQkMsbUJBQW1CQyxNQUFNLENBQUU7SUFFcEQsa0NBQWtDO0lBQ2xDQyxpQkFBaUI7UUFDZkMsTUFBTTtRQUNOQyxjQUFjO0lBQ2hCO0lBRUEsa0hBQWtIO0lBQ2xIQyxXQUFXO1FBQ1RGLE1BQU07UUFDTkMsY0FBYztJQUNoQjtJQUVBLCtGQUErRjtJQUMvRkUsUUFBUTtRQUNOSCxNQUFNO1FBQ05DLGNBQWM7SUFDaEI7QUFDRjtBQUVBTixJQUFJUyxRQUFRLENBQUUsc0JBQXNCUjtBQUVwQyxlQUFlQSxtQkFBbUIifQ==