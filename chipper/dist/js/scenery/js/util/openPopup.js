// Copyright 2022-2024, University of Colorado Boulder
/**
 * Opens a URL in a popup window or tab if possible.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { allowLinksProperty } from '../imports.js';
import scenery from '../scenery.js';
/**
 * Opens the URL in a new window or tab.
 * @param url
 * @param allowPopups - Don't allow openPopup IF we have query parameters AND allowLinks is false,
 *                   - see https://github.com/phetsims/joist/issues/830
 *                   - But individual cases (such as screenshot) can override this to be always allowed
 */ function openPopup(url, allowPopups = allowLinksProperty.value) {
    // If available, don't openPopups for fuzzing
    const fuzzOptOut = phet && phet.chipper && phet.chipper.isFuzzEnabled();
    if (allowPopups && !fuzzOptOut) {
        const popupWindow = window.open(url, '_blank'); // open in a new window/tab
        // We can't guarantee the presence of a window object, since if it isn't opened then it will return null.
        // See https://github.com/phetsims/phet-ios-app/issues/508#issuecomment-520891177 and documentation at
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/open.
        popupWindow && popupWindow.focus();
    }
}
scenery.register('openPopup', openPopup);
export default openPopup;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9vcGVuUG9wdXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogT3BlbnMgYSBVUkwgaW4gYSBwb3B1cCB3aW5kb3cgb3IgdGFiIGlmIHBvc3NpYmxlLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgeyBhbGxvd0xpbmtzUHJvcGVydHkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcbmltcG9ydCBzY2VuZXJ5IGZyb20gJy4uL3NjZW5lcnkuanMnO1xuXG4vKipcbiAqIE9wZW5zIHRoZSBVUkwgaW4gYSBuZXcgd2luZG93IG9yIHRhYi5cbiAqIEBwYXJhbSB1cmxcbiAqIEBwYXJhbSBhbGxvd1BvcHVwcyAtIERvbid0IGFsbG93IG9wZW5Qb3B1cCBJRiB3ZSBoYXZlIHF1ZXJ5IHBhcmFtZXRlcnMgQU5EIGFsbG93TGlua3MgaXMgZmFsc2UsXG4gKiAgICAgICAgICAgICAgICAgICAtIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzgzMFxuICogICAgICAgICAgICAgICAgICAgLSBCdXQgaW5kaXZpZHVhbCBjYXNlcyAoc3VjaCBhcyBzY3JlZW5zaG90KSBjYW4gb3ZlcnJpZGUgdGhpcyB0byBiZSBhbHdheXMgYWxsb3dlZFxuICovXG5mdW5jdGlvbiBvcGVuUG9wdXAoIHVybDogc3RyaW5nLCBhbGxvd1BvcHVwcyA9IGFsbG93TGlua3NQcm9wZXJ0eS52YWx1ZSApOiB2b2lkIHtcblxuICAvLyBJZiBhdmFpbGFibGUsIGRvbid0IG9wZW5Qb3B1cHMgZm9yIGZ1enppbmdcbiAgY29uc3QgZnV6ek9wdE91dCA9IHBoZXQgJiYgcGhldC5jaGlwcGVyICYmIHBoZXQuY2hpcHBlci5pc0Z1enpFbmFibGVkKCk7XG5cbiAgaWYgKCBhbGxvd1BvcHVwcyAmJiAhZnV6ek9wdE91dCApIHtcbiAgICBjb25zdCBwb3B1cFdpbmRvdyA9IHdpbmRvdy5vcGVuKCB1cmwsICdfYmxhbmsnICk7IC8vIG9wZW4gaW4gYSBuZXcgd2luZG93L3RhYlxuXG4gICAgLy8gV2UgY2FuJ3QgZ3VhcmFudGVlIHRoZSBwcmVzZW5jZSBvZiBhIHdpbmRvdyBvYmplY3QsIHNpbmNlIGlmIGl0IGlzbid0IG9wZW5lZCB0aGVuIGl0IHdpbGwgcmV0dXJuIG51bGwuXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvcy1hcHAvaXNzdWVzLzUwOCNpc3N1ZWNvbW1lbnQtNTIwODkxMTc3IGFuZCBkb2N1bWVudGF0aW9uIGF0XG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1dpbmRvdy9vcGVuLlxuICAgIHBvcHVwV2luZG93ICYmIHBvcHVwV2luZG93LmZvY3VzKCk7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ29wZW5Qb3B1cCcsIG9wZW5Qb3B1cCApO1xuZXhwb3J0IGRlZmF1bHQgb3BlblBvcHVwOyJdLCJuYW1lcyI6WyJhbGxvd0xpbmtzUHJvcGVydHkiLCJzY2VuZXJ5Iiwib3BlblBvcHVwIiwidXJsIiwiYWxsb3dQb3B1cHMiLCJ2YWx1ZSIsImZ1enpPcHRPdXQiLCJwaGV0IiwiY2hpcHBlciIsImlzRnV6ekVuYWJsZWQiLCJwb3B1cFdpbmRvdyIsIndpbmRvdyIsIm9wZW4iLCJmb2N1cyIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELFNBQVNBLGtCQUFrQixRQUFRLGdCQUFnQjtBQUNuRCxPQUFPQyxhQUFhLGdCQUFnQjtBQUVwQzs7Ozs7O0NBTUMsR0FDRCxTQUFTQyxVQUFXQyxHQUFXLEVBQUVDLGNBQWNKLG1CQUFtQkssS0FBSztJQUVyRSw2Q0FBNkM7SUFDN0MsTUFBTUMsYUFBYUMsUUFBUUEsS0FBS0MsT0FBTyxJQUFJRCxLQUFLQyxPQUFPLENBQUNDLGFBQWE7SUFFckUsSUFBS0wsZUFBZSxDQUFDRSxZQUFhO1FBQ2hDLE1BQU1JLGNBQWNDLE9BQU9DLElBQUksQ0FBRVQsS0FBSyxXQUFZLDJCQUEyQjtRQUU3RSx5R0FBeUc7UUFDekcsc0dBQXNHO1FBQ3RHLGdFQUFnRTtRQUNoRU8sZUFBZUEsWUFBWUcsS0FBSztJQUNsQztBQUNGO0FBRUFaLFFBQVFhLFFBQVEsQ0FBRSxhQUFhWjtBQUMvQixlQUFlQSxVQUFVIn0=